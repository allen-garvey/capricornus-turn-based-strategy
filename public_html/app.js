"use strict";
/*
 * 
 */
var game = function(){
	//pixels in square tile
	var TILE_SIZE = 32;

	function totalTiles(canvasParent){
		return {x: Math.floor(canvasParent.offsetWidth / TILE_SIZE), y: Math.floor(canvasParent.offsetHeight / TILE_SIZE)};
	}

	function setCanvasDimensions(canvasParent, canvas){
		canvas.width = canvasParent.offsetWidth;
		canvas.height = canvasParent.offsetHeight;
	}

	function getContext(canvasParent, canvasSelector){
		var canvas = document.getElementById(canvasSelector);
		var context = canvas.getContext('2d');
		setCanvasDimensions(canvasParent, canvas);
		return context;
	}

	function tileCoordinateToPixelCoordinate(coordinate){
		return {x: coordinate.x * TILE_SIZE, y: coordinate.y * TILE_SIZE}
	}

	function pixelCoordinateToTileCoordinate(coordinate){
		return {x: Math.floor(coordinate.x / TILE_SIZE), y: Math.floor(coordinate.y / TILE_SIZE)}
	}

	function drawTile(canvasContext, image, locationCoordinate, spriteCoordinate){
		var pixelLocationCoordinate = tileCoordinateToPixelCoordinate(locationCoordinate);
		var spritePixelCoordinate = tileCoordinateToPixelCoordinate(spriteCoordinate);
		canvasContext.drawImage(image, spritePixelCoordinate.x, spritePixelCoordinate.y, TILE_SIZE, TILE_SIZE, pixelLocationCoordinate.x, pixelLocationCoordinate.y, TILE_SIZE, TILE_SIZE);
	}

	function eraseTile(canvasContext, locationCoordinate){
		var pixelLocationCoordinate = tileCoordinateToPixelCoordinate(locationCoordinate);
		canvasContext.clearRect(pixelLocationCoordinate.x, pixelLocationCoordinate.y, TILE_SIZE, TILE_SIZE);
	}

	function eraseCanvas(canvasContext){
		canvasContext.clearRect(0, 0, canvasContext.canvas.width, canvasContext.canvas.height);
	}

	function renderUnitSelected(unitCoordinate){
		var movementTilesCoordinates = [{x: unitCoordinate.x + 1, y: unitCoordinate.y}, {x: unitCoordinate.x - 1, y: unitCoordinate.y}, {x: unitCoordinate.x, y: unitCoordinate.y + 1}, {x: unitCoordinate.x, y: unitCoordinate.y - 1}];
		//have to call before path operations
		unitSelectionCanvasContext.beginPath();
		movementTilesCoordinates.forEach(function(coordinate){
			var pixelCoordinate = tileCoordinateToPixelCoordinate(coordinate);
			unitSelectionCanvasContext.fillStyle = 'rgba(0,0,255, 0.5)';
			unitSelectionCanvasContext.rect(pixelCoordinate.x, pixelCoordinate.y, TILE_SIZE, TILE_SIZE);
		});
		//actually draw the rectangles
		unitSelectionCanvasContext.fill();
	}
	function renderUnitDeselected(){
		eraseCanvas(unitSelectionCanvasContext);
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

	function renderInitialGameboard(gameboard, terrainCanvasContext, unitCanvasContext){
		for(var x = 0; x < TOTAL_TILES.x; x++){
			for(var y = 0; y < TOTAL_TILES.y; y++){
				var currentCoordinate = {x: x, y: y};
				var gameTile = gameTileForCoordinate(currentCoordinate, gameboard);
				drawTile(terrainCanvasContext, spritesheet, currentCoordinate, gameTile.terrain.sprite);
				if(gameTile.unit){
					drawTile(unitCanvasContext, spritesheet, currentCoordinate, gameTile.unit.sprite);
				}
			}
		}
	}
	function gameTileForCoordinate(coordinate, aGameboard){
		if(aGameboard){
			return aGameboard[coordinate.x][coordinate.y];
		}
		return gameboard[coordinate.x][coordinate.y];
	}

	var gameContainer = document.getElementById('game-container');
	var TOTAL_TILES = totalTiles(gameContainer);
	var spriteSheet = document.getElementById('spritesheet');
	var userInfo = {cursorCoordinate: null, unitSelected: false};

	
	var cursorCanvasContext = getContext(gameContainer, 'cursor-canvas');
	var unitSelectionCanvasContext = getContext(gameContainer, 'unit-selection-canvas');
	var terrainCanvasContext = getContext(gameContainer, 'terrain-canvas');
	var unitCanvasContext = getContext(gameContainer, 'unit-canvas');

	var gameboard = createRandomGameboard();
	renderInitialGameboard(gameboard, terrainCanvasContext, unitCanvasContext);

	//cursor rendering
	gameContainer.onmousemove = function(e){
		var coordinate = pixelCoordinateToTileCoordinate({x: e.offsetX, y: e.offsetY});
		//not required if first time drawing cursor
		if(userInfo.cursorCoordinate != null){
			//don't do anything if cursor is in same square
			if(coordinate.x == userInfo.cursorCoordinate.x && coordinate.y == userInfo.cursorCoordinate.y){
				return;
			}
			//cursor moved to new square, so erase previous cursor if there is one
			eraseTile(cursorCanvasContext, userInfo.cursorCoordinate);
		}
		//set new cursor location and draw cursor
		userInfo.cursorCoordinate = coordinate;
		drawTile(cursorCanvasContext, spriteSheet, userInfo.cursorCoordinate, {x: 1, y: 1});
	};

	gameContainer.onclick = function(e){
		//deselect previously selected unit if any
		if(userInfo.unitSelected){
			userInfo.unitSelected = false;
			renderUnitDeselected();
		}
		//don't do anything else if user didn't click on unit
		if(!gameTileForCoordinate(userInfo.cursorCoordinate).unit){
			return;
		}
		//user clicked unit, so show it being selected
		userInfo.unitSelected = {x: userInfo.cursorCoordinate.x, y: userInfo.cursorCoordinate.y};
		renderUnitSelected(userInfo.unitSelected);
	}
    
};

/*
 * Wait until image is loaded to render
 */
(function(){
    var spriteSheet = document.getElementById('spritesheet');
	if(spritesheet.complete){
		game();
	}
	else{
		spritesheet.onload = function(){
			game();
		};
	}
})();