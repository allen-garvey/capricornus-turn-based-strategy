"use strict";

/*
* Main game loop functionality
*/
 app.game = (function(renderer, unitStats, terrainStats, pathfinder, levelStats){
	function start(){
	    function renderUnitSelected(unitCoordinate){
			var movementTilesCoordinates = pathfinder.movementCoordinatesFor(unitCoordinate, gameboard, UNIT_STATS, TERRAIN_STATS);
			renderer.renderUnitMovementSquares(unitSelectionCanvasContext, movementTilesCoordinates);
			renderer.renderUnitSelectionOutline(unitSelectionCanvasContext, unitCoordinate);
		}
		function renderUnitDeselected(){
			renderer.eraseCanvas(unitSelectionCanvasContext);
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

		var gameContainer = document.getElementById('game-container');
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
						unitSelected: false
						};

		
		var cursorCanvasContext = renderer.getContext(gameContainer, 'cursor-canvas');
		var unitSelectionCanvasContext = renderer.getContext(gameContainer, 'unit-selection-canvas');
		var terrainCanvasContext = renderer.getContext(gameContainer, 'terrain-canvas');
		var unitCanvasContext = renderer.getContext(gameContainer, 'unit-canvas');

		var gameboard = createRandomGameboard();
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
		};

		gameContainer.onclick = function(e){
			//deselect previously selected unit if any
			if(userInfo.unitSelected){
				userInfo.unitSelected = false;
				renderUnitDeselected();
			}
			//don't do anything else if user didn't click on unit
			if(!renderer.gameTileForCoordinate(userInfo.cursor.coordinate, gameboard).unit){
				return;
			}
			//user clicked unit, so show it being selected
			userInfo.unitSelected = {x: userInfo.cursor.coordinate.x, y: userInfo.cursor.coordinate.y};
			renderUnitSelected(userInfo.unitSelected);
		}
	}
	//exported functions
	return {start: start};
 })(app.renderer, app.unitStats, app.terrainStats, app.pathfinder, app.levelStats);