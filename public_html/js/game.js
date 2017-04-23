"use strict";

/*
* Main game loop functionality
*/
 app.game = (function(renderer){
	function start(){
	    function renderUnitSelected(unitCoordinate){
			var movementTilesCoordinates = [{x: unitCoordinate.x + 1, y: unitCoordinate.y}, {x: unitCoordinate.x - 1, y: unitCoordinate.y}, {x: unitCoordinate.x, y: unitCoordinate.y + 1}, {x: unitCoordinate.x, y: unitCoordinate.y - 1}];
			//have to call before path operations
			unitSelectionCanvasContext.beginPath();
			movementTilesCoordinates.forEach(function(coordinate){
				var pixelCoordinate = renderer.tileCoordinateToPixelCoordinate(coordinate);
				unitSelectionCanvasContext.fillStyle = 'rgba(0,0,255, 0.5)';
				unitSelectionCanvasContext.rect(pixelCoordinate.x, pixelCoordinate.y, renderer.TILE_SIZE, renderer.TILE_SIZE);
			});
			//actually draw the rectangles
			unitSelectionCanvasContext.fill();
			//draw outline around unit
			var unitPixelCoordinate = renderer.tileCoordinateToPixelCoordinate(unitCoordinate);
			unitSelectionCanvasContext.strokeStyle = 'rgb(0,255,0)';
			unitSelectionCanvasContext.lineWidth = 2;
			unitSelectionCanvasContext.strokeRect(unitPixelCoordinate.x, unitPixelCoordinate.y, renderer.TILE_SIZE, renderer.TILE_SIZE);
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
					gameboard[i][j].terrain = {sprite: {x: Math.round(Math.random()), y: 0}};
					if(Math.random() * 1000 < 10){
						gameboard[i][j].unit = {sprite: {x: 0, y: 1}};
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
		var spriteSheet = document.getElementById('spritesheet');
		var userInfo = {cursorCoordinate: null, unitSelected: false};

		
		var cursorCanvasContext = renderer.getContext(gameContainer, 'cursor-canvas');
		var unitSelectionCanvasContext = renderer.getContext(gameContainer, 'unit-selection-canvas');
		var terrainCanvasContext = renderer.getContext(gameContainer, 'terrain-canvas');
		var unitCanvasContext = renderer.getContext(gameContainer, 'unit-canvas');

		var gameboard = createRandomGameboard();
		renderer.renderInitialGameboard(gameboard, terrainCanvasContext, unitCanvasContext);

		//cursor rendering
		gameContainer.onmousemove = function(e){
			var coordinate = renderer.pixelCoordinateToTileCoordinate({x: e.offsetX, y: e.offsetY});
			//not required if first time drawing cursor
			if(userInfo.cursorCoordinate != null){
				//don't do anything if cursor is in same square
				if(coordinate.x == userInfo.cursorCoordinate.x && coordinate.y == userInfo.cursorCoordinate.y){
					return;
				}
				//cursor moved to new square, so erase previous cursor if there is one
				renderer.eraseTile(cursorCanvasContext, userInfo.cursorCoordinate);
			}
			//set new cursor location and draw cursor
			userInfo.cursorCoordinate = coordinate;
			renderer.drawTile(cursorCanvasContext, spriteSheet, userInfo.cursorCoordinate, {x: 1, y: 1});
		};

		gameContainer.onclick = function(e){
			//deselect previously selected unit if any
			if(userInfo.unitSelected){
				userInfo.unitSelected = false;
				renderUnitDeselected();
			}
			//don't do anything else if user didn't click on unit
			if(!renderer.gameTileForCoordinate(userInfo.cursorCoordinate, gameboard).unit){
				return;
			}
			//user clicked unit, so show it being selected
			userInfo.unitSelected = {x: userInfo.cursorCoordinate.x, y: userInfo.cursorCoordinate.y};
			renderUnitSelected(userInfo.unitSelected);
		}
	}
	//exported functions
	return {start: start};
 })(app.renderer);


/*
 * Wait until images are loaded to start game
 */
(function(){
    var spriteSheet = document.getElementById('spritesheet');
	if(spritesheet.complete){
		app.game.start();
	}
	else{
		spritesheet.onload = function(){
			app.game.start();
		};
	}
})();