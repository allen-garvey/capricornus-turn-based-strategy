"use strict";

/*
* Main game loop functionality
*/
 app.game = (function(util, renderer, unitStats, terrainStats, pathfinder, levelStats, ai, damageCalculator){
	function start(LEVEL_STATS, levelIndex){

		//triggered when user's unit is attacking
		//movementCoordinate is the coordinate the unit to move to before attacking
		//depending on where the mouse is before clicking the attack square this might be an invalid coordinate
		//if it is, pick a random valid one
		function userUnitAttack(startingCoordinate, attackCoordinate, movementCoordinate){
			userInfo.isUnitBeingMoved = true;
			endTurnButton.disabled = true;
			var attackCallback = function(){
				unitAttack(movementCoordinate, attackCoordinate, function(){
					userInfo.isUnitBeingMoved = false;
					endTurnButton.disabled = false;
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
			if(damageDone > defendingUnit.health){
				damageDone = defendingUnit.health;
				defendingUnit.health = 0;
				renderer.gameTileForCoordinate(defenderCoordinate, gameboard).unit = null;
			}
			else{
				defendingUnit.health -= damageDone;
			}
			renderer.renderAttack(unitCanvasContext, unitSelectionCanvasContext, attackerCoordinate, defenderCoordinate, attackingUnit, defendingUnit, damageDone, function(){
				//do counterattack if defender is still alive, and we're not already in a counterattack
				if(!isCounterattack && defendingUnit.health > 0){
					unitAttack(defenderCoordinate, attackerCoordinate, doneCallback, true);
				}
				else{
					doneCallback();
				}
			});
		}

		function moveUserUnit(startingCoordinate, endingCoordinate){
			userInfo.isUnitBeingMoved = true;
			endTurnButton.disabled = true;
			moveUnit(startingCoordinate, endingCoordinate, function(){
				userInfo.isUnitBeingMoved = false;
				endTurnButton.disabled = false;
			});
		}

		function moveUnit(startingCoordinate, endingCoordinate, doneCallback){
			
			var unitToBeMoved = renderer.gameTileForCoordinate(startingCoordinate, gameboard).unit;
			//don't render movement if starting and ending coordinates are the same
			if(util.areCoordinatesEqual(startingCoordinate, endingCoordinate)){
				renderer.eraseTile(unitCanvasContext, startingCoordinate);
				renderer.renderUnitMoved(unitCanvasContext, startingCoordinate, unitToBeMoved);
				unitToBeMoved.canMove = false;
				doneCallback();
				return;
			}

			var path = pathfinder.pathFor(startingCoordinate, endingCoordinate, gameboard, UNIT_STATS, TERRAIN_STATS);
			renderer.renderUnitMovement(unitCanvasContext, unitSelectionCanvasContext, unitToBeMoved, path, function(){
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
			endTurnButton.disabled = true;
			
			aiTurnAction({}, function(){
				resetGameboardForPlayerTurn();
				userInfo.isAiTurn = false;
				endTurnButton.disabled = false;
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
		
		function createRandomGameboard(){
			var gameboard = new Array(TOTAL_TILES.x);
			for(var i = 0; i < TOTAL_TILES.x; i++){
				for(var j = 0; j < TOTAL_TILES.y; j++){
					if(j == 0){
						gameboard[i] = new Array(TOTAL_TILES.y);
					}
					gameboard[i][j] = {};
					gameboard[i][j].terrain = terrainStats.create(Math.round(Math.random()));
					if(Math.random() * 100 < 10){
						var unit = unitStats.create(Math.floor(Math.random() * 3), Math.floor(Math.random() * 2));
						unit.health = Math.ceil(unit.health * Math.random());
						unit.currentDirection = Math.floor(Math.random() * 2);
						gameboard[i][j].unit = unit;
					}
					else{
						gameboard[i][j].unit = null;
					}
				}
			}
			return gameboard;
		}

		function createGameboard(level){
			var gameboard = new Array(TOTAL_TILES.x);
			for(var i = 0; i < TOTAL_TILES.x; i++){
				for(var j = 0; j < TOTAL_TILES.y; j++){
					if(j == 0){
						gameboard[i] = new Array(TOTAL_TILES.y);
					}
					gameboard[i][j] = {};
					gameboard[i][j].terrain = terrainStats.create(Math.round(Math.random()));
					
					//gameboard is actually mistakenly rotated, so we have to rotate the level data to match it
					if(level.data.units[j] === undefined || level.data.units[j][i] === undefined){
						continue;
					}
					var unit;
					switch(level.data.units[j][i]){
						case 1:
							unit = unitStats.create(0,0);
							break;
						case 2:
							unit = unitStats.create(1,0);
							break;
						case 3:
							unit = unitStats.create(2,0);
							break;
						case 4:
							unit = unitStats.create(0,1);
							break;
						case 5:
							unit = unitStats.create(1,1);
							break;
						case 6:
							unit = unitStats.create(2,1);
							break;
						default:
							unit = null;
							break;
					}
					gameboard[i][j].unit = unit;
					if(!unit){
						continue;
					}
					if(i < TOTAL_TILES.x/2){
						unit.currentDirection = unitStats.UNIT_DIRECTIONS.RIGHT;
					}
					else{
						unit.currentDirection = unitStats.UNIT_DIRECTIONS.LEFT;
					}
				}
			}
			return gameboard;
		}

		var gameContainer = document.getElementById('game-container');
		var endTurnButton = document.getElementById('button-end-turn');
		var TOTAL_TILES = renderer.totalTiles(gameContainer);
		var UNIT_STATS = unitStats.get();
		var TERRAIN_STATS = terrainStats.get();
		
		var userInfo = {
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
						difficultyLevel: ai.DIFFICULTY_LEVELS.HARD
						};

		
		var cursorCanvasContext = renderer.getContext(gameContainer, 'cursor-canvas');
		var unitSelectionCanvasContext = renderer.getContext(gameContainer, 'unit-selection-canvas');
		var terrainCanvasContext = renderer.getContext(gameContainer, 'terrain-canvas');
		var unitCanvasContext = renderer.getContext(gameContainer, 'unit-canvas');

		if(levelIndex < 0){
			var gameboard = createRandomGameboard();
		}
		else{
			var gameboard = createGameboard(LEVEL_STATS[levelIndex]);
		}
		renderer.renderLevel(terrainCanvasContext, LEVEL_STATS[0].spritesheet);
		renderer.renderInitialGameboard(gameboard, unitCanvasContext);

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
			triggerAiTurn();
		};
	}
	//exported functions
	return {start: start};
 })(app.util, app.renderer, app.unitStats, app.terrainStats, app.pathfinder, app.levelStats, app.ai, app.damage);
