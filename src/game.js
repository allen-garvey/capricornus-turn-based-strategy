/*
* Main game loop functionality
*/
import Coordinate from './coordinate.js';
import renderer from './renderer.js';
import unitStats from './unit-stats.js';
import terrainStats from './terrain-stats.js';
import pathfinder from './pathfinding.js';
import ai from './ai.js';
import damageCalculator from './damage.js';
import levelLoader from './level-loader.js';
import modal from './modal.js';
import saveGameController from './save-game.js';
import mixer from './mixer.js';
import menu from './menu.js';
import textOverlay from './text-overlay.js';
import uiStats from './ui-stats.js';


export function start(LEVEL_STATS, AUDIO_STATS, levelIndex, difficultyLevel, savedGame){
	/*
	* Music functions
	*/
	function killMusic(){
		userInfo.musicBuffers.forEach(function(buffer){
			if(buffer){
				mixer.stopSound(buffer, 200);
			}
		});
	}

	function switchMusic(currentTeamIndex, otherTeamIndex){
		var fadeInTime = null;
		var otherTeamMusic = userInfo.musicBuffers[otherTeamIndex];
		if(otherTeamMusic){
			mixer.stopSound(otherTeamMusic, 300);
		}

		var musicIndex = currentTeamIndex + (userInfo.levelIndex * currentTeamIndex);
		var currentTeamMusic = AUDIO_STATS.music[musicIndex].audio;
		userInfo.musicBuffers[currentTeamIndex] = mixer.playAudioBuffer(currentTeamMusic, false, fadeInTime);
	}


	/**
	* Cursor functions
	*/

	function eraseCursor(){
		if(userInfo.cursor.coordinate){
			renderer.eraseTile(cursorCanvasContext, userInfo.cursor.coordinate);
		}
	}
	//erases cursor and disables coordinate,
	//used when cursor is disabled
	function disableCursor(){
		eraseCursor();
		userInfo.cursor.coordinate = null;

	}
	//draws the relevant cursor at current coordinate
	function drawCursor(coordinate){
		//for non-mouse inputs, the coordinate might be null here and cause an error
		if(!coordinate){
			return;
		}
		//check to see if a cursor is already drawn
		if(userInfo.cursor.coordinate != null){
			//don't do anything if cursor is in same square
			if(Coordinate.areCoordinatesEqual(userInfo.cursor.coordinate, coordinate)){
				return;
			}
			//cursor moved to new square, so erase previous cursor if there is one
			eraseCursor();
		}
		//set new cursor location and draw cursor
		userInfo.cursor.coordinate = coordinate;
		//show attack cursor if player unit selected and cursor is over enemy unit
		if(isOverTriggerPlayerAttackTile()){
			renderer.drawTile(cursorCanvasContext, UI_STATS.cursor.attack.spritesheet, userInfo.cursor.coordinate, UI_STATS.cursor.attack.spriteCoordinate);
		}
		else{
			renderer.drawTile(cursorCanvasContext, UI_STATS.cursor.select.spritesheet, userInfo.cursor.coordinate, UI_STATS.cursor.select.spriteCoordinate);
		}

		//draw unit path preview tiles, if applicable
		if(userInfo.unitSelected && renderer.gameTileForCoordinate(userInfo.unitSelected, gameboard).unit.team === unitStats.TEAMS.PLAYER && Coordinate.isCoordinateInMovementSquares(userInfo.cursor.coordinate, userInfo.unitSelectedMovementSquares)){
			drawUnitMovementPreview(Coordinate.copy(userInfo.cursor.coordinate));
		}
	}

	function updateCursorPosition(xCoordinate, yCoordinate){
		var coordinate = renderer.pixelCoordinateToTileCoordinate({x: xCoordinate, y: yCoordinate});
		userInfo.currentMouseCoordinate = coordinate;
		//don't update cursor during text overlay
		if(!userInfo.gameInteractionEnabled || Coordinate.areCoordinatesEqual(coordinate, userInfo.cursor.coordinate)){
			return;
		}
		drawCursor(coordinate);
	}

	//returns true if cursor is hovering over a tile that will trigger a player attack
	//determines if a unit is currently selected, on the players team, and the cursor is over a valid attack tile
	function isOverTriggerPlayerAttackTile(){
		if(!userInfo.unitSelected){
			return false;
		}
		var selectedUnit = renderer.gameTileForCoordinate(userInfo.unitSelected, gameboard).unit;
		return selectedUnit.team === unitStats.TEAMS.PLAYER && selectedUnit.canMove && Coordinate.isCoordinateInMovementSquares(userInfo.cursor.coordinate, userInfo.unitSelectedAttackSquares);
	}

	/**
	 * Utility functions
	 */
	//reenable buttons after an action has occurred
	function enableButtons(){
		userInfo.buttonsEnabled = true;
		userInfo.gameInteractionEnabled = true;
		drawCursor(userInfo.currentMouseCoordinate);
		gameContainer.classList.remove('interaction-disabled');
		
		[endTurnButton, saveGameButton, exitGameButton].forEach(function(button){
			button.disabled = false;
		});
	}
	//used to disable buttons during animations or AI turn
	function disableButtons(){
		userInfo.buttonsEnabled = false;
		userInfo.gameInteractionEnabled = false;
		disableEndTurnButtonAnimation();
		//hide cursor when user can't interact with game
		disableCursor();
		gameContainer.classList.add('interaction-disabled');	
		
		[endTurnButton, saveGameButton, exitGameButton].forEach(function(button){
			button.disabled = true;
		});
	}

	function areThereUserUnitsLeftToMove(){
		for(var i = 0; i < gameboard.length; i++){
			var subarray = gameboard[i];
			for(var j = 0; j < subarray.length; j++){
				var unit = gameboard[i][j].unit;
				if(unit && unit.team === unitStats.TEAMS.PLAYER && unit.canMove){
					return true;
				}
			}
		}
		return false;
	}

	//used to display animation when no more units can move
	function displayIfAreUnitsLeftToMove(){
		if(!areThereUserUnitsLeftToMove()){
			gameControlsContainer.classList.add('all-units-moved');
		}
	}

	function disableEndTurnButtonAnimation(){
		gameControlsContainer.classList.remove('all-units-moved');
	}

	/**
	 * Functions to show text overlay after turn or when game is won or lost
	 */
	function displayTurnText(text, callback){
		//duration should be slightly shorter than duration for text-overlay-heading-animation css
		textOverlay.displayHeading(text, 2500, function(){
			callback();
		});
	}
	function displayUserTurnText(callback){
		switchMusic(unitStats.TEAMS.PLAYER, unitStats.TEAMS.AI);
		displayTurnText('Turn ' + (userInfo.turnNum + 1), callback);
	}

	function displayAiTurnText(callback){
		switchMusic(unitStats.TEAMS.AI, unitStats.TEAMS.PLAYER);
		displayTurnText('Computer Turn', callback);
	}

	function displayLevelFailed(){
		disableButtons();
		killMusic();
		gameContainer.classList.remove('interaction-disabled');
		mixer.playAudioBuffer(AUDIO_STATS.level.failed.audio);
		textOverlay.displayMenu('Mission Failed', 'Restart mission', function(){
			start(LEVEL_STATS, AUDIO_STATS, userInfo.levelIndex, userInfo.difficultyLevel);
		});
	}

	function displayLevelPassed(){
		disableButtons();
		killMusic();
		gameContainer.classList.remove('interaction-disabled');
		mixer.playAudioBuffer(AUDIO_STATS.level.passed.audio);
		//go to next level if there are more
		if(userInfo.levelIndex < LEVEL_STATS.length - 1){
			textOverlay.displayMenu('Mission Complete', 'Next mission', function(){
				start(LEVEL_STATS, AUDIO_STATS, userInfo.levelIndex + 1, userInfo.difficultyLevel);
			});

		}
		//player beat last level, so show congratulations
		else{
			showBriefings(briefings, ready, userInfo.levelIndex + 1);
		}
	}

	/**
	 * Saving and loading game functions
	 */
	function saveGame(saveGameName){
		var serializedGameboard = saveGameController.serializeGameboard(gameboard);
		var gameMetadata = saveGameController.userInfoToGameMetadata(userInfo);
		var saveSucceeded = saveGameController.createSave(saveGameName, serializedGameboard, gameMetadata);
		if(!saveSucceeded){
			modal.alert('Saving game failed');
		}
		else{
			modal.alert('Game saved');
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
		disableButtons();
		var attackCallback = function(){
			unitAttack(movementCoordinate, attackCoordinate, function(){
				enableButtons();
				displayIfAreUnitsLeftToMove();
			});
		};

		//make copy of movement squares, since we need to add the starting location as well
		var movementSquares = userInfo.unitSelectedMovementSquares.slice();
		movementSquares.push(startingCoordinate);
		var validMovementCoordinates = pathfinder.movementCoordinatesForAttackCoordinate(attackCoordinate, movementSquares);
		//check if movement coordinate is valid
		if(movementCoordinate === undefined || !validMovementCoordinates.find(function(coordinate){
			return Coordinate.areCoordinatesEqual(coordinate, movementCoordinate);
		})){
			//see if unit has to move to attack
			if(Coordinate.isCoordinateInMovementSquares(startingCoordinate, validMovementCoordinates)){
				movementCoordinate = startingCoordinate;
			}
			else{
				movementCoordinate = validMovementCoordinates[0];
			}
			
		}
		mixer.playAudioBuffer(AUDIO_STATS.cursor.deselect.audio);
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
			userInfo.numUnits[defendingUnit.team]--;
			renderer.gameTileForCoordinate(defenderCoordinate, gameboard).unit = null;
		}
		else{
			defendingUnit.health -= damageDone;
		}
		//start attack sound after a delay, so that it will sync with attack animation
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
					//check to see if game has been won or lost before proceeding
					if(userInfo.numUnits[unitStats.TEAMS.PLAYER] <= 0){
						displayLevelFailed();
					}
					else if(userInfo.numUnits[unitStats.TEAMS.AI] <= 0){
						displayLevelPassed();
					}
					else{
						doneCallback();	
					}
					
				}	
			}, 800);
		});
	}

	function moveUserUnit(startingCoordinate, endingCoordinate){
		disableButtons();
		mixer.playAudioBuffer(AUDIO_STATS.cursor.deselect.audio);
		moveUnit(startingCoordinate, endingCoordinate, function(){
			enableButtons();
			displayIfAreUnitsLeftToMove();
		});
	}

	function moveUnit(startingCoordinate, endingCoordinate, doneCallback){
		var unitToBeMoved = renderer.gameTileForCoordinate(startingCoordinate, gameboard).unit;
		//don't render movement if starting and ending coordinates are the same
		if(Coordinate.areCoordinatesEqual(startingCoordinate, endingCoordinate)){
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
		mixer.playAudioBuffer(AUDIO_STATS.cursor.select.audio);
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
		displayAiTurnText(function(){
			aiTurnAction({}, function(){
				resetGameboardForPlayerTurn();
				userInfo.turnNum++;
				displayUserTurnText(function(){
					enableButtons();
				});
			});	
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
					userInfo.numUnits[unit.team]++;
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
				var unit = levelLoader.unitFor(level.dataUnits[userInfo.difficultyLevel], j, i, TOTAL_TILES);
				gameboard[i][j].unit = unit;
				if(unit){
					userInfo.numUnits[unit.team]++;
				}
			}
		}
		return gameboard;
	}

	/**
	 * Loads units from saved game into initialized gameboard
	 */
	function loadGameboard(gameboard, savedGameboard){
		//reset count of units
		userInfo.numUnits = Object.keys(unitStats.TEAMS).map(function(){return 0;});
		for(var i = 0; i < gameboard.length; i++){
			var subarray = gameboard[i];
			for(var j = 0; j < subarray.length; j++){
				var unit = savedGameboard[i][j].unit;
				gameboard[i][j].unit = unit;
				if(unit){
					userInfo.numUnits[unit.team]++;
				}
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
							coordinate: null
						},
						currentMouseCoordinate: null,
						unitSelected: false,
						unitSelectedMovementSquares: false,
						unitSelectedAttackSquares: false,
						unitSelectedShortestPath: false,
						difficultyLevel: difficultyLevel,
						levelIndex: levelIndex,
						buttonsEnabled: true,
						turnNum: 0,
						musicBuffers: [null, null],
						gameInteractionEnabled: true, //used for if user can currently interact with the game, such as moving units
						numUnits: Object.keys(unitStats.TEAMS).map(function(){return 0;}) //array of integers corresponding to number of units; index corresponds to team. Used to determine if level has been passed/failed
					};
		disableButtons();

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
			userInfo.turnNum = savedGame.gameMetadata.turnNum;
			loadGameboard(gameboard, savedGame.gameboard);
		}

		renderer.renderLevel(terrainCanvasContext, levelSpritesheet);
		renderer.renderInitialGameboard(gameboard, unitCanvasContext);
	}
	

	/**
	 * Displays modal briefings before respective level
	 * @param briefings - modal to be displayed
	 * @param ready - span to close modal and begin level
	 * @param levelIndex - -1 for random setup or otherwise index of level in levelStats
	 */
	function showBriefings(briefings, ready, levelIndex) {
		//If last mission completed, show congratulatory message
		if(levelIndex > 2)
		{
			document.getElementById('level').innerHTML = 'Excellent work! We have reclaimed Capricornus Island. Now that we have taken back our home base, victory will surely be ours. I see a bright future ahead for you. Thanks for all your hard work, soldier!';
			document.getElementById('ready-btn').innerHTML = 'Return to Main Menu';
			briefings.style.display = 'block';
			ready.onclick = function () {
				briefings.style.display = 'none';
				menu.displayMainMenu();
			};
		}	
		//Otherwise show briefing for appopriate level
		else
		{	
			if(levelIndex == 0)
			{
				var brief = 'Welcome recruit to the legendary Capricornus Squadron. We’re glad to have you with us, as we’ve recently had some setbacks and have fallen on hard times. The enemy have taken over the Gemini Bridges, a vital position in our supply line, and we need to take it back. With your help we should be able to do so.</br></br>When attacking remember that infantry have advantages over planes, planes have advantages over tanks, and tanks have advantages over infantry. Also, infantry will take less damage if they are taking cover in mountains or trees. If you keep these things in mind you should be able to claim victory on the battlefield. Good luck out there soldier!';
			}
			
			else if(levelIndex == 1)
			{
				var brief = 'Well done soldier! Now that we have regained control of the Gemini Bridges we should be able to push through some much needed supplies. We can now make way to the port town of Aquarius - an integral location in the war. Currently the enemy have one of their main bases set up there. If we can overtake them, we should be well on our way to flipping the momentum in our favor.</br></br>Remember that only planes will be able to cross the water here. You can use this advantage to keep them out of harm\'s way until they are ready to strike. Alright, its time to move in. Keep up the good work.';
			}

			else if(levelIndex == 2)
			{
				var brief = 'Great going soldier! If you keep this up, you will be moving up the ranks in no time. We now have just one battle left. It is time to reclaim Capricornus Island. If we can take back what is rightfully ours from the enemies standing guard there, we will surely win the war and regain our legendary status as the greatest squadron in the world!</br></br>Just remember that attacking the nearest enemey may not always be the optimal decision. Sometimes it is better to attack an enemy that is further away if it will give you an advantage or just move away and take cover. Be wary of how far an enemy unit is from you and try to get the first strike on a unit.';
			}

		
			document.getElementById('level').innerHTML = brief;		
			document.getElementById('ready-btn').innerHTML = 'READY';

		
			briefings.style.display = 'block';
			ready.onclick = function () {
				briefings.style.display = 'none';
				displayUserTurnText(function(){
					enableButtons();
				});
			};
		}
	}
	

	/**
	 * Game initialization stuff below
	 */

	var gameContainer = document.getElementById('game-container');
	var gameControlsContainer = document.getElementById('game-controls-container');
	var endTurnButton = document.getElementById('button-end-turn');
	var saveGameButton = document.getElementById('button-save-game');
	var exitGameButton = document.getElementById('button-exit-game');
	var TOTAL_TILES = renderer.totalTiles(gameContainer);
	var UNIT_STATS = unitStats.get();
	var TERRAIN_STATS = terrainStats.get();
	var UI_STATS = uiStats.get();

	//get canvases
	var cursorCanvasContext = renderer.getContext(gameContainer, 'cursor-canvas');
	var unitSelectionCanvasContext = renderer.getContext(gameContainer, 'unit-selection-canvas');
	var terrainCanvasContext = renderer.getContext(gameContainer, 'terrain-canvas');
	var unitCanvasContext = renderer.getContext(gameContainer, 'unit-canvas');

	//global variables containing game state
	var gameboard;
	var userInfo;
	
	//Briefings variables
	var briefings = document.getElementById('briefings');
	var ready = document.getElementsByClassName('ready')[0];		

	//setup global variables and render initial gamestate
	if(savedGame){
		initializeGame(savedGame.gameMetadata.levelIndex, savedGame.gameMetadata.difficultyLevel, savedGame);
		displayUserTurnText(function(){
			enableButtons();
		});
	}
	else{
		initializeGame(levelIndex, difficultyLevel, savedGame);
		showBriefings(briefings, ready, userInfo.levelIndex);
	}


	/**
	 * Click handlers
	 */
	//cursor rendering
	gameContainer.onmousemove = function(e){
		updateCursorPosition(e.offsetX, e.offsetY);
	};

	gameContainer.onclick = function(e){
		// console.log(renderer.gameTileForCoordinate(userInfo.cursor.coordinate, gameboard).terrain);
		//don't do anything if user interaction is currently disabled
		if(!userInfo.buttonsEnabled){
			return;
		}
		//this is so things will work correctly for non-mouse inputs, when there is no onmousemove event
		updateCursorPosition(e.offsetX, e.offsetY);

		//move unit if one is currently selected, is on the player's team, and valid movement tile is clicked
		if(userInfo.unitSelected && renderer.gameTileForCoordinate(userInfo.unitSelected, gameboard).unit.team === unitStats.TEAMS.PLAYER && renderer.gameTileForCoordinate(userInfo.unitSelected, gameboard).unit.canMove && Coordinate.isCoordinateInMovementSquares(userInfo.cursor.coordinate, userInfo.unitSelectedMovementSquares)){
			renderUnitDeselected(); //erase selection tiles
			moveUserUnit(userInfo.unitSelected, Coordinate.copy(userInfo.cursor.coordinate));
			//after unit is moved it's the same as if unit was deselected
			userInfo.unitSelected = false;
			//userInfo.unitSelectedMovementSquares = false;
			return;
		}

		//have unit attack a unit if one is currently selected, on the players team, and valid attack tile is clicked
		if(isOverTriggerPlayerAttackTile()){
			renderUnitDeselected(); //erase selection tiles
			userUnitAttack(userInfo.unitSelected, Coordinate.copy(userInfo.cursor.coordinate), userInfo.unitSelectedShortestPath[userInfo.unitSelectedShortestPath.length - 1]);
			//after unit attacks it's the same as if unit was deselected
			userInfo.unitSelected = false;
			return;
		}

		//deselect previously selected unit if any, since non-valid movement tile clicked, or AI unit was selected
		if(userInfo.unitSelected){
			mixer.playAudioBuffer(AUDIO_STATS.cursor.deselect.audio);
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
	};

	endTurnButton.onclick = function(){
		if(!userInfo.buttonsEnabled){
			return;
		}
		disableButtons();
		renderUnitDeselected();
		userInfo.unitSelected = false;
		triggerAiTurn();
	};

	saveGameButton.onclick = function(){
		if(!userInfo.buttonsEnabled){
			return;
		}
		modal.prompt('Enter a name for your save game', function(saveGameName){
			saveGame(saveGameName);
		});
	};

	exitGameButton.onclick = function(){
		if(!userInfo.buttonsEnabled){
			return;
		}
		modal.confirm('Are you sure you want to quit? All unsaved progress will be lost.', function(){
			killMusic();
			menu.displayMainMenu();
		});
	};
}
