"use strict";

/*
* Main game loop functionality
*/
 app.game = (function(util, renderer, unitStats, terrainStats, pathfinder, levelStats, ai){
	function start(levelDatas, levelIndex){

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
			//attack unit should be here, not fully implemented yet
			else if(false){

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
		var LEVEL_STATS = levelStats.get();
		
		var userInfo = {
						cursor: {
							coordinate: null,
							spritesheet: document.getElementById('spritesheet'),
							spriteCoordinate: {x: 1, y: 1}
						},
						unitSelected: false,
						unitSelectedMovementSquares: false,
						unitSelectedAttackSquares: false,
						isUnitBeingMoved: false,
						isAiTurn: false,
						difficultyLevel: ai.DIFFICULTY_LEVELS.HARD
						};

		
		var cursorCanvasContext = renderer.getContext(gameContainer, 'cursor-canvas');
		var unitSelectionCanvasContext = renderer.getContext(gameContainer, 'unit-selection-canvas');
		var terrainCanvasContext = renderer.getContext(gameContainer, 'terrain-canvas');
		var unitCanvasContext = renderer.getContext(gameContainer, 'unit-canvas');

		//load level data into the level stats
		LEVEL_STATS.forEach(function(item, index){
			if(levelDatas[index]){
				item.data = levelDatas[index];
			}
		});
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
				userInfo.unitSelectedMovementSquares = false;
				return;
			}

			//deselect previously selected unit if any, since non-valid movement tile clicked, or AI unit was selected
			if(userInfo.unitSelected){
				userInfo.unitSelected = false;
				userInfo.unitSelectedMovementSquares = false;
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
 })(app.util, app.renderer, app.unitStats, app.terrainStats, app.pathfinder, app.levelStats, app.ai);
