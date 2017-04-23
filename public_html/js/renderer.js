"use strict";

/*
 * Functionality used to render graphics on a canvas context
 */
var app = app || {};

app.renderer = (function(){
	
	/*
	* Tile size and tiles in board initialization
	*/
	//pixels in square tile
	var TILE_SIZE = 32;

	function totalTiles(canvasParent){
		return {x: Math.floor(canvasParent.offsetWidth / TILE_SIZE), y: Math.floor(canvasParent.offsetHeight / TILE_SIZE)};
	}
	
	/*
	* Coordinate functions
	*/
	function tileCoordinateToPixelCoordinate(coordinate){
		return {x: coordinate.x * TILE_SIZE, y: coordinate.y * TILE_SIZE}
	}

	function pixelCoordinateToTileCoordinate(coordinate){
		return {x: Math.floor(coordinate.x / TILE_SIZE), y: Math.floor(coordinate.y / TILE_SIZE)}
	}

	function gameTileForCoordinate(coordinate, gameboard){
		return gameboard[coordinate.x][coordinate.y];
	}

	/*
	* Canvas object functions
	*/
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

	/*
	* General drawing and erasing functions
	*/
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

	/*
	* Gameboard rendering functions
	*/
	function renderInitialGameboard(gameboard, terrainCanvasContext, unitCanvasContext){
		var width = gameboard.length;
		for(var x = 0; x < width; x++){
			var height = gameboard[x].length;
			for(var y = 0; y < height; y++){
				var currentCoordinate = {x: x, y: y};
				var gameTile = gameTileForCoordinate(currentCoordinate, gameboard);
				drawTile(terrainCanvasContext, gameTile.terrain.spritesheet, currentCoordinate, gameTile.terrain.spriteCoordinate);
				if(gameTile.unit){
					drawTile(unitCanvasContext, gameTile.unit.spritesheet, currentCoordinate, gameTile.unit.spriteCoordinate);
				}
			}
		}
	}

	/*
	* Rendering unit selection
	*/
	function renderUnitSelectionOutline(canvasContext, unitCoordinate){
		var unitPixelCoordinate = tileCoordinateToPixelCoordinate(unitCoordinate);
		canvasContext.strokeStyle = 'rgb(0,255,0)';
		canvasContext.lineWidth = 2;
		canvasContext.strokeRect(unitPixelCoordinate.x, unitPixelCoordinate.y, TILE_SIZE, TILE_SIZE);
	}
	function renderUnitMovementSquares(canvasContext, movementTilesCoordinates){
		//have to call before path operations
		canvasContext.beginPath();
		movementTilesCoordinates.forEach(function(coordinate){
			var pixelCoordinate = tileCoordinateToPixelCoordinate(coordinate);
			canvasContext.fillStyle = 'rgba(0,0,255, 0.5)';
			canvasContext.rect(pixelCoordinate.x, pixelCoordinate.y, TILE_SIZE, TILE_SIZE);
		});
		//actually draw the rectangles
		canvasContext.fill();
	}

	//exported functions and variables
	return {
		TILE_SIZE: TILE_SIZE,
		totalTiles: totalTiles,
		setCanvasDimensions: setCanvasDimensions,
		getContext: getContext,
		tileCoordinateToPixelCoordinate: tileCoordinateToPixelCoordinate,
		pixelCoordinateToTileCoordinate: pixelCoordinateToTileCoordinate,
		drawTile: drawTile,
		eraseTile: eraseTile,
		eraseCanvas: eraseCanvas,
		renderInitialGameboard: renderInitialGameboard,
		gameTileForCoordinate: gameTileForCoordinate,
		renderUnitSelectionOutline: renderUnitSelectionOutline,
		renderUnitMovementSquares: renderUnitMovementSquares
	};
})();