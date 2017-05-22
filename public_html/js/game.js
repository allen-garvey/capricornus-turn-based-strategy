"use strict";

/*
* Main game loop functionality
*/
 app.game = (function(util, renderer, unitStats, terrainStats, pathfinder, levelStats, ai, damageCalculator, levelLoader, modal, saveGameController, mixer){
	function start(LEVEL_STATS, AUDIO_STATS, levelIndex, savedGame){
		/**
		 * Utility functions
		 */
		//reenable buttons after an action has occurred
		function enableButtons(){
			userInfo.buttonsEnabled = true;
			endTurnButton.disabled = false;
			saveGameButton.disabled = false;
		}
		//used to disable buttons during animations or AI turn
		function disableButtons(){
			userInfo.buttonsEnabled = false;
			endTurnButton.disabled = true;
			saveGameButton.disabled = true;
		}

		/**
		 * Saving and loading game functions
		 */
		function saveGame(saveGameName){
			var serializedGameboard = saveGameController.serializeGameboard(gameboard);
			var gameMetadata = saveGameController.userInfoToGameMetadata(userInfo);
			var saveSucceeded = saveGameController.createSave(saveGameName, serializedGameboard, gameMetadata);
			if(!saveSucceeded){
				modal.alert("Saving game failed");
			}
			else{
				modal.alert("Game saved");
			}
		}

		/**
		 * Unit moving and attacking functionality
		 */

		//triggered when user's unit is attacking
		//movementCoordinate is the coordinate the unit to move to before attacking
		//depending on where the mouse is before clicking the attack square this might be an invalid coordinate
		//if it is, pick a random valid one
		function userUnitAttack(startingCoordinate, attackCoordinate, movementCoordinate){
			userInfo.isUnitBeingMoved = true;
			disableButtons();
			var attackCallback = function(){
				unitAttack(movementCoordinate, attackCoordinate, function(){
					userInfo.isUnitBeingMoved = false;
					enableButtons();
				});
			};

			//make copy of movement squares, since we need to add the starting location as well
			var movementSquares = userInfo.unitSelectedMovementSquares.slice();
			movementSquares.push(startingCoordinate);
			var validMovementCoordinates = pathfinder.movementCoordinatesForAttackCoordinate(attackCoordinate, movementSquares);
			//check if movement coordinate is valid
			if(movementCoordinate === undefined || !validMovementCoordinates.find(function(coordinate){
				return util.areCoordinatesEqual(coordinate, movementCoordinate);
			})){
				//see if unit has to move to attack
				if(util.isCoordinateInMovementSquares(startingCoordinate, validMovementCoordinates)){
					movementCoordinate = startingCoordinate;
				}
				else{
					movementCoordinate = validMovementCoordinates[0];
				}
				
			}
			
			moveUnit(startingCoordinate, movementCoordinate, attackCallback);
			
		}

		//displays the attacker attacking the defender, and alters the stats appropriately
		function unitAttack(attackerCoordinate, defenderCoordinate, doneCallback, isCounterattack){
			var attackingUnit = renderer.gameTileForCoordinate(attackerCoordinate, gameboard).unit;
			var attackingTerrain = renderer.gameTileForCoordinate(attackerCoordinate, gameboard).terrain;
			var defendingUnit = renderer.gameTileForCoordinate(defenderCoordinate, gameboard).unit;
			var defendingTerrain = renderer.gameTileForCoordinate(defenderCoordinate, gameboard).terrain;
			
			if(isCounterattack){
				var damageDone = damageCalculator.damageForCounterattack(attackingUnit, defendingUnit, attackingTerrain, defendingTerrain, UNIT_STATS, TERRAIN_STATS);
			}
			else{
				var damageDone = damageCalculator.damageForAttack(attackingUnit, defendingUnit, attackingTerrain, defendingTerrain, UNIT_STATS, TERRAIN_STATS);
			}
			
			//check to see if damage done is more than unit's current health
			if(damageDone >= defendingUnit.health){
				damageDone = defendingUnit.health;
				defendingUnit.health = 0;
				renderer.gameTileForCoordinate(defenderCoordinate, gameboard).unit = null;
			}
			else{
				defendingUnit.health -= damageDone;
			}
			var attackSound = mixer.playAudioBuffer(AUDIO_STATS.units[attackingUnit.type].attack);
			renderer.renderAttack(unitCanvasContext, unitSelectionCanvasContext, attackerCoordinate, defenderCoordinate, attackingUnit, defendingUnit, damageDone, function(){
				//play death sound immediately if applicable, since death animation is already playing
				if(defendingUnit.health <= 0){
					mixer.playAudioBuffer(AUDIO_STATS.units[defendingUnit.type].die);
				}
				//show counter-attack after a delay, so it will have time to register
				setTimeout(function(){
					mixer.stopSound(attackSound);
					//do counterattack if defender is still alive, and we're not already in a counterattack
					if(!isCounterattack && defendingUnit.health > 0){
						unitAttack(defenderCoordinate, attackerCoordinate, doneCallback, true);
					}
					else{
						doneCallback();
					}	
				}, 800);
			});
		}

		function moveUserUnit(startingCoordinate, endingCoordinate){
			userInfo.isUnitBeingMoved = true;
			disableButtons();
			moveUnit(startingCoordinate, endingCoordinate, function(){
				userInfo.isUnitBeingMoved = false;
				enableButtons();
			});
		}

		function moveUnit(startingCoordinate, endingCoordinate, doneCallback){
			
			var unitToBeMoved = renderer.gameTileForCoordinate(startingCoordinate, gameboard).unit;
			//don't render movement if starting and ending coordinates are the same
			if(util.areCoordinatesEqual(startingCoordinate, endingCoordinate)){
				unitToBeMoved.canMove = false;
				renderer.redrawUnit(unitCanvasContext, startingCoordinate, unitToBeMoved);
				doneCallback();
				return;
			}
			var moveSoundEffect = mixer.playAudioBuffer(AUDIO_STATS.units[unitToBeMoved.type].move, true);
			var path = pathfinder.pathFor(startingCoordinate, endingCoordinate, gameboard, UNIT_STATS, TERRAIN_STATS);
			renderer.renderUnitMovement(unitCanvasContext, unitSelectionCanvasContext, unitToBeMoved, path, function(){
				mixer.stopSound(moveSoundEffect, 300);
				renderer.renderUnitMoved(unitCanvasContext, endingCoordinate, unitToBeMoved);
				//update gameboard
				unitToBeMoved.canMove = false;
				gameboard[endingCoordinate.x][endingCoordinate.y].unit = unitToBeMoved;
				gameboard[startingCoordinate.x][startingCoordinate.y].unit = null;
				doneCallback();
			});
		}

		function drawUnitMovementPreview(cursorCoordinate){
			//redraw movement squares
			renderer.eraseCanvas(unitSelectionCanvasContext);
			renderer.renderUnitMovementSquares(unitSelectionCanvasContext, userInfo.unitSelectedMovementSquares);
			renderer.renderUnitAttackSquares(unitSelectionCanvasContext, userInfo.unitSelectedAttackSquares);
			renderer.renderUnitSelectionOutline(unitSelectionCanvasContext, userInfo.unitSelected);
			var path = pathfinder.pathFor(userInfo.unitSelected, cursorCoordinate, gameboard, UNIT_STATS, TERRAIN_STATS);
			userInfo.unitSelectedShortestPath = path;
			renderer.renderUnitMovementPreview(unitSelectionCanvasContext, path);
		}

	    function renderUnitSelected(unitCoordinate){
			var movementTilesCoordinates = pathfinder.movementCoordinatesFor(unitCoordinate, gameboard, UNIT_STATS, TERRAIN_STATS);
			userInfo.unitSelectedMovementSquares = movementTilesCoordinates;
			var attackTilesCoordinates = pathfinder.attackCoordinatesFor(unitCoordinate, gameboard, UNIT_STATS, TERRAIN_STATS);
			userInfo.unitSelectedAttackSquares = attackTilesCoordinates;
			renderer.renderUnitMovementSquares(unitSelectionCanvasContext, movementTilesCoordinates);
			renderer.renderUnitAttackSquares(unitSelectionCanvasContext, attackTilesCoordinates);
			renderer.renderUnitSelectionOutline(unitSelectionCanvasContext, unitCoordinate);
		}
		function renderUnitDeselected(){
			renderer.eraseCanvas(unitSelectionCanvasContext);
		}

		function resetGameboardForPlayerTurn(){
			for(var i = 0; i < gameboard.length; i++){
				var innerArray = gameboard[i];
				for(var j = 0; j < innerArray.length; j++){
					if(gameboard[i][j].unit && !gameboard[i][j].unit.canMove){
						var unit = gameboard[i][j].unit; 
						unit.canMove = true;
						renderer.renderUnit(unitCanvasContext, {x: i, y: j}, unit)
					}
				}
			}
		}

		function triggerAiTurn(){
			userInfo.isAiTurn = true;
			disableButtons();
			
			aiTurnAction({}, function(){
				resetGameboardForPlayerTurn();
				userInfo.isAiTurn = false;
				enableButtons();
			});
		}

		function aiTurnAction(memoizationObject, doneCallback){
			var action = ai.aiAction(gameboard, UNIT_STATS, TERRAIN_STATS, userInfo.difficultyLevel, memoizationObject);
			if(action.actionType === ai.ACTION_TYPES.END_TURN){
				doneCallback();
				return;
			}
			else if(action.actionType === ai.ACTION_TYPES.ATTACK_UNIT){
				moveUnit(action.startingCoordinate, action.endingCoordinate, function(){
					unitAttack(action.endingCoordinate, action.attackedUnitCoordinate, function(){
						aiTurnAction(action.memoizationObject, doneCallback);	
					});
				});
			}
			else{
				moveUnit(action.startingCoordinate, action.endingCoordinate, function(){
					aiTurnAction(action.memoizationObject, doneCallback);
				});
			}
		}
		/**
		 * Creates random gameboard for debugging purposes
		 */
		function createRandomGameboard(randomLevelIndex){
			function createRandomUnit(){
				var unit = unitStats.create(Math.floor(Math.random() * UNIT_STATS.length), Math.floor(Math.random() * 2));
				unit.health = Math.ceil(unit.health * Math.random());
				unit.currentDirection = Math.floor(Math.random() * 2);
				return unit;
			}

			var level = LEVEL_STATS[randomLevelIndex];

			var gameboard = new Array(TOTAL_TILES.x);
			for(var i = 0; i < TOTAL_TILES.x; i++){
				for(var j = 0; j < TOTAL_TILES.y; j++){
					if(j == 0){
						gameboard[i] = new Array(TOTAL_TILES.y);
					}
					gameboard[i][j] = {};
					var terrain = levelLoader.terrainFor(level, i, j, TOTAL_TILES);
					gameboard[i][j].terrain = terrain;
					var unit = createRandomUnit();
					//randomly place unit if threshold is met and it is possible for the unit to be
					//able to traverse the current type of terrain
					if(UNIT_STATS[unit.type].canTraverse[terrain.type] && Math.random() * 100 < 10){
						gameboard[i][j].unit = unit;
					}
					else{
						gameboard[i][j].unit = null;
					}
				}
			}
			return gameboard;
		}

		/**
		 * Creates gameboard based on a level
		 * @param level - entry from the level-stat.js level array with the data already pre-loaded
		 */
		function createGameboard(level){
			var gameboard = new Array(TOTAL_TILES.x);
			for(var i = 0; i < TOTAL_TILES.x; i++){
				for(var j = 0; j < TOTAL_TILES.y; j++){
					if(j == 0){
						gameboard[i] = new Array(TOTAL_TILES.y);
					}
					gameboard[i][j] = {};
					gameboard[i][j].terrain = levelLoader.terrainFor(level, i, j, TOTAL_TILES);
					gameboard[i][j].unit = levelLoader.unitFor(level, j, i, TOTAL_TILES);
				}
			}
			return gameboard;
		}

		/**
		 * Loads units from saved game into initialized gameboard
		 */
		function loadGameboard(gameboard, savedGameboard){
			for(var i = 0; i < gameboard.length; i++){
				var subarray = gameboard[i];
				for(var j = 0; j < subarray.length; j++){
					gameboard[i][j].unit = savedGameboard[i][j].unit;
				}
			}
		}

		/**
		 * Initializes global variables renders initial game
		 * @param levelIndex - -1 for random setup or otherwise index of level in levelStats
		 * @param difficultyLevel - constant from ai.DIFFICULTY_LEVELS
		 * @param savedGame - either savedGame object if game is to be loaded or falsy value (null, false or undefined) if a new game is to be created
		 */
		function initializeGame(levelIndex, difficultyLevel, savedGame){
			userInfo = {
						cursor: {
							coordinate: null,
							spritesheet: document.getElementById('spritesheet'),
							spriteCoordinate: {x: 1, y: 1}
						},
						unitSelected: false,
						unitSelectedMovementSquares: false,
						unitSelectedAttackSquares: false,
						unitSelectedShortestPath: false,
						isUnitBeingMoved: false,
						isAiTurn: false,
						difficultyLevel: difficultyLevel,
						levelIndex: levelIndex,
						buttonsEnabled: true
						};

			if(levelIndex < 0){
				var randomLevelIndex = Math.floor(Math.random() * LEVEL_STATS.length);
				userInfo.levelIndex = randomLevelIndex;
				gameboard = createRandomGameboard(randomLevelIndex);
				var levelSpritesheet = LEVEL_STATS[randomLevelIndex].spritesheet;
			}
			else{
				gameboard = createGameboard(LEVEL_STATS[levelIndex]);
				var levelSpritesheet = LEVEL_STATS[levelIndex].spritesheet;
			}
			if(savedGame){
				loadGameboard(gameboard, savedGame.gameboard);
			}

			renderer.renderLevel(terrainCanvasContext, levelSpritesheet);
			renderer.renderInitialGameboard(gameboard, unitCanvasContext);
		}

		/**
		 * Game initialization stuff below
		 */

		var gameContainer = document.getElementById('game-container');
		var endTurnButton = document.getElementById('button-end-turn');
		var saveGameButton = document.getElementById('button-save-game');
		var TOTAL_TILES = renderer.totalTiles(gameContainer);
		var UNIT_STATS = unitStats.get();
		var TERRAIN_STATS = terrainStats.get();

		//get canvases
		var cursorCanvasContext = renderer.getContext(gameContainer, 'cursor-canvas');
		var unitSelectionCanvasContext = renderer.getContext(gameContainer, 'unit-selection-canvas');
		var terrainCanvasContext = renderer.getContext(gameContainer, 'terrain-canvas');
		var unitCanvasContext = renderer.getContext(gameContainer, 'unit-canvas');

		//global variables containing game state
		var gameboard;
		var userInfo;

		//setup global variables and render initial gamestate
		if(savedGame){
			initializeGame(savedGame.gameMetadata.levelIndex, savedGame.gameMetadata.difficultyLevel, savedGame);
		}
		else{
			initializeGame(levelIndex, ai.DIFFICULTY_LEVELS.HARD, savedGame);
		}


		/**
		 * Click handlers
		 */
		//cursor rendering
		gameContainer.onmousemove = function(e){
			var coordinate = renderer.pixelCoordinateToTileCoordinate({x: e.offsetX, y: e.offsetY});
			//not required if first time drawing cursor
			if(userInfo.cursor.coordinate != null){
				//don't do anything if cursor is in same square
				if(coordinate.x == userInfo.cursor.coordinate.x && coordinate.y == userInfo.cursor.coordinate.y){
					return;
				}
				//cursor moved to new square, so erase previous cursor if there is one
				renderer.eraseTile(cursorCanvasContext, userInfo.cursor.coordinate);
			}
			//set new cursor location and draw cursor
			userInfo.cursor.coordinate = coordinate;
			renderer.drawTile(cursorCanvasContext, userInfo.cursor.spritesheet, userInfo.cursor.coordinate, userInfo.cursor.spriteCoordinate);

			//draw unit path preview tiles, if applicable
			if(userInfo.unitSelected && renderer.gameTileForCoordinate(userInfo.unitSelected, gameboard).unit.team === unitStats.TEAMS.PLAYER && util.isCoordinateInMovementSquares(userInfo.cursor.coordinate, userInfo.unitSelectedMovementSquares)){
				drawUnitMovementPreview(util.copyCoordinate(userInfo.cursor.coordinate));
			}
		};

		gameContainer.onclick = function(e){
			// console.log(renderer.gameTileForCoordinate(userInfo.cursor.coordinate, gameboard).terrain);
			//don't do anything if unit is currently moving
			if(userInfo.isUnitBeingMoved || userInfo.isAiTurn){
				return;
			}
			//move unit if one is currently selected, is on the player's team, and valid movement tile is clicked
			if(userInfo.unitSelected && renderer.gameTileForCoordinate(userInfo.unitSelected, gameboard).unit.team === unitStats.TEAMS.PLAYER && renderer.gameTileForCoordinate(userInfo.unitSelected, gameboard).unit.canMove && util.isCoordinateInMovementSquares(userInfo.cursor.coordinate, userInfo.unitSelectedMovementSquares)){
				renderUnitDeselected(); //erase selection tiles
				moveUserUnit(userInfo.unitSelected, util.copyCoordinate(userInfo.cursor.coordinate));
				//after unit is moved it's the same as if unit was deselected
				userInfo.unitSelected = false;
				//userInfo.unitSelectedMovementSquares = false;
				return;
			}

			//have unit attack a unit if one is currently selected, on the players team, and valid attack tile is clicked
			if(userInfo.unitSelected && renderer.gameTileForCoordinate(userInfo.unitSelected, gameboard).unit.team === unitStats.TEAMS.PLAYER && renderer.gameTileForCoordinate(userInfo.unitSelected, gameboard).unit.canMove && util.isCoordinateInMovementSquares(userInfo.cursor.coordinate, userInfo.unitSelectedAttackSquares)){
				renderUnitDeselected(); //erase selection tiles
				userUnitAttack(userInfo.unitSelected, util.copyCoordinate(userInfo.cursor.coordinate), userInfo.unitSelectedShortestPath[userInfo.unitSelectedShortestPath.length - 1]);
				//after unit attacks it's the same as if unit was deselected
				userInfo.unitSelected = false;
				return;
			}

			//deselect previously selected unit if any, since non-valid movement tile clicked, or AI unit was selected
			if(userInfo.unitSelected){
				userInfo.unitSelected = false;
				//userInfo.unitSelectedMovementSquares = false;
				renderUnitDeselected();
				return;
			}
			//don't do anything else if user didn't click on unit and no unit was selected
			if(!renderer.gameTileForCoordinate(userInfo.cursor.coordinate, gameboard).unit || !renderer.gameTileForCoordinate(userInfo.cursor.coordinate, gameboard).unit.canMove){
				return;
			}
			//user clicked unit with nothing previously selected, so show it being selected
			userInfo.unitSelected = {x: userInfo.cursor.coordinate.x, y: userInfo.cursor.coordinate.y};
			renderUnitSelected(userInfo.unitSelected);
		}

		endTurnButton.onclick = function(){
			if(!userInfo.buttonsEnabled){
				return;
			}
			triggerAiTurn();
		};

		saveGameButton.onclick = function(){
			if(!userInfo.buttonsEnabled){
				return;
			}
			modal.prompt("Enter a name for your save game", function(saveGameName){
				saveGame(saveGameName);
			});
		};

	}
	//exported functions
	return {start: start};
 })(app.util, app.renderer, app.unitStats, app.terrainStats, app.pathfinder, app.levelStats, app.ai, app.damage, app.levelLoader, app.modal, app.saveGame, app.mixer);
