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

	function drawRandomTerrain(terrainCanvasContext, image){
		for(var y = 0; y < TOTAL_TILES.y; y++){
			for(var x = 0; x < TOTAL_TILES.x; x++){
				drawTile(terrainCanvasContext, image, {x: x, y: y}, {x: Math.round(Math.random()), y: 0});
			}
		}
	}
	function drawRandomUnits(unitCanvasContext, image){
		var numUnits = Math.ceil(Math.random() * 30);
		while(numUnits > 0){
			drawTile(unitCanvasContext, image, {x: Math.floor(Math.random() * TOTAL_TILES.x), y: Math.floor(Math.random() * TOTAL_TILES.y)}, {x: 0, y: 1});
			numUnits--;
		}
	}

	var gameContainer = document.getElementById('game-container');
	var TOTAL_TILES = totalTiles(gameContainer);
	var spriteSheet = document.getElementById('spritesheet');
	var cursorCoordinate = null;

	
	var cursorCanvasContext = getContext(gameContainer, 'cursor-canvas');
	var terrainCanvasContext = getContext(gameContainer, 'terrain-canvas');
	var unitCanvasContext = getContext(gameContainer, 'unit-canvas');

	drawRandomTerrain(terrainCanvasContext, spritesheet);
	drawRandomUnits(unitCanvasContext, spritesheet);

	//cursor rendering
	gameContainer.onmousemove = function(e){
		var coordinate = pixelCoordinateToTileCoordinate({x: e.offsetX, y: e.offsetY});
		//not required if first time drawing cursor
		if(cursorCoordinate != null){
			//don't do anything if cursor is in same square
			if(coordinate.x == cursorCoordinate.x && coordinate.y == cursorCoordinate.y){
				return;
			}
			//cursor moved to new square, so erase previous cursor if there is one
			eraseTile(cursorCanvasContext, cursorCoordinate);
		}
		//set new cursor location and draw cursor
		cursorCoordinate = coordinate;
		drawTile(cursorCanvasContext, spriteSheet, cursorCoordinate, {x: 1, y: 1});
	};
    
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