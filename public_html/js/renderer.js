"use strict";

/*
 * Functionality used to render graphics on a canvas context
 */
var app = app || {};

app.renderer = (function(util, unitStats, terrainStats){
	var UNIT_STATS = unitStats.get();
	var TERRAIN_STATS = terrainStats.get();
	
	/*
	* Tile size and tiles in board initialization
	*/
	//pixels in square tile
	var TILE_SIZE = 32;
	//number of pixels between each frame in the animation
	var ANIMATION_PIXEL_STEP = 2;
	//delay between frames in ms
	var ANIMATION_FRAME_DELAY = 10;

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
	function drawTileAtPixelCoordinate(canvasContext, image, pixelLocationCoordinate, spriteCoordinate){
		var spritePixelCoordinate = tileCoordinateToPixelCoordinate(spriteCoordinate);
		canvasContext.drawImage(image, spritePixelCoordinate.x, spritePixelCoordinate.y, TILE_SIZE, TILE_SIZE, pixelLocationCoordinate.x, pixelLocationCoordinate.y, TILE_SIZE, TILE_SIZE);
	}


	function drawTile(canvasContext, image, locationCoordinate, spriteCoordinate){
		var pixelLocationCoordinate = tileCoordinateToPixelCoordinate(locationCoordinate);
		// var spritePixelCoordinate = tileCoordinateToPixelCoordinate(spriteCoordinate);
		// canvasContext.drawImage(image, spritePixelCoordinate.x, spritePixelCoordinate.y, TILE_SIZE, TILE_SIZE, pixelLocationCoordinate.x, pixelLocationCoordinate.y, TILE_SIZE, TILE_SIZE);
		drawTileAtPixelCoordinate(canvasContext, image, pixelLocationCoordinate, spriteCoordinate);
	}

	function eraseTileAtPixelCoordinate(canvasContext, pixelLocationCoordinate){
		canvasContext.clearRect(pixelLocationCoordinate.x, pixelLocationCoordinate.y, TILE_SIZE, TILE_SIZE);
	}

	function eraseTile(canvasContext, locationCoordinate){
		var pixelLocationCoordinate = tileCoordinateToPixelCoordinate(locationCoordinate);
		eraseTileAtPixelCoordinate(canvasContext, pixelLocationCoordinate);
		// canvasContext.clearRect(pixelLocationCoordinate.x, pixelLocationCoordinate.y, TILE_SIZE, TILE_SIZE);
	}

	function eraseCanvas(canvasContext){
		canvasContext.clearRect(0, 0, canvasContext.canvas.width, canvasContext.canvas.height);
	}

	function renderLevel(canvasContext, levelSprite){
		canvasContext.drawImage(levelSprite, 0, 0);
	}

	function renderUnitMoved(canvasContext, coordinate, unit){
		var unitStats = UNIT_STATS[unit.type];
		drawTile(canvasContext, unitStats.spritesheets[unit.team], coordinate, unitStats.spriteCoordinatesWhenMoved[unit.team][unit.currentDirection]);
	}

	function renderUnit(canvasContext, coordinate, unit){
		var unitStats = UNIT_STATS[unit.type];
		drawTile(canvasContext, unitStats.spritesheets[unit.team], coordinate, unitStats.spriteCoordinates[unit.team][unit.currentDirection]);
	}
	function renderUnitAtPixelCoordinate(canvasContext, pixelCoordinate, unit){
		var unitStats = UNIT_STATS[unit.type];
		drawTileAtPixelCoordinate(canvasContext, unitStats.spritesheets[unit.team], pixelCoordinate, unitStats.spriteCoordinates[unit.team][unit.currentDirection]);
	}

	/*
	* Gameboard rendering functions
	*/
	function renderInitialGameboard(gameboard, unitCanvasContext){
		var width = gameboard.length;
		for(var x = 0; x < width; x++){
			var height = gameboard[x].length;
			for(var y = 0; y < height; y++){
				var currentCoordinate = {x: x, y: y};
				var gameTile = gameTileForCoordinate(currentCoordinate, gameboard);
				if(gameTile.unit){
					renderUnit(unitCanvasContext, currentCoordinate, gameTile.unit);
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

	function renderUnitMovementPreview(canvasContext, pathCoordinates){
		//have to call before path operations
		canvasContext.beginPath();
		pathCoordinates.forEach(function(coordinate){
			//erase movement tiles if any and then redraw new preview tile
			var pixelCoordinate = tileCoordinateToPixelCoordinate(coordinate);
			eraseTile(canvasContext, coordinate);
			canvasContext.fillStyle = 'rgba(0,255,178,0.5)';
			canvasContext.rect(pixelCoordinate.x, pixelCoordinate.y, TILE_SIZE, TILE_SIZE);
		});
		//actually draw the rectangles
		canvasContext.fill();
	}

	/**
	 * Rending unit movement
	 */
	 //displays animation showing unit moving between 2 adjacent tiles
	 //based on: https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
	 function renderUnitMovingBetween(animationCanvasContext, unit, startingCoordinate, endingCoordinate, nextCallback){
	 	var DIRECTIONS = {
	 		RIGHT: 0,
	 		LEFT: 1,
	 		UP: 2,
	 		DOWN: 3
	 	};
	 	var start = null;
	 	var startingPixelCoordinate = tileCoordinateToPixelCoordinate(startingCoordinate);
	 	var endingPixelCoordinate = tileCoordinateToPixelCoordinate(endingCoordinate);
	 	var currentPixelCoordinate = util.copyCoordinate(startingPixelCoordinate);
	 	var currentDirection;
	 	if(endingCoordinate.x < startingCoordinate.x){
	 		currentDirection = DIRECTIONS.LEFT;
	 		unit.currentDirection = unitStats.UNIT_DIRECTIONS.LEFT;
	 	}
	 	else if(endingCoordinate.y > startingCoordinate.y){
	 		currentDirection = DIRECTIONS.DOWN;
	 		//show down orientation if unit has sprite for it
	 		if(UNIT_STATS[unit.type].spriteCoordinates[unit.team][unitStats.UNIT_DIRECTIONS.DOWN]){
	 			unit.currentDirection = unitStats.UNIT_DIRECTIONS.DOWN;
			}
	 	}
	 	else if(endingCoordinate.y < startingCoordinate.y){
	 		currentDirection = DIRECTIONS.UP;
	 		//show up orientation if unit has sprite for it
	 		if(UNIT_STATS[unit.type].spriteCoordinates[unit.team][unitStats.UNIT_DIRECTIONS.UP]){
	 			unit.currentDirection = unitStats.UNIT_DIRECTIONS.UP;
			}
	 	}
	 	else{
	 		currentDirection = DIRECTIONS.RIGHT;
	 		unit.currentDirection = unitStats.UNIT_DIRECTIONS.RIGHT;
	 	}
	 	function step(timestamp){
			if(start === null){
				start = timestamp;	
			}
			var progress = timestamp - start;
			//don't show next frame until certain amount of time has passed
			if(progress < ANIMATION_FRAME_DELAY){
		    	window.requestAnimationFrame(step);
		    	return;
			}
			//erase previous unit position
			eraseTileAtPixelCoordinate(animationCanvasContext, currentPixelCoordinate);
			//update current position
			switch(currentDirection){
				case DIRECTIONS.UP:
					currentPixelCoordinate.y -= ANIMATION_PIXEL_STEP;
					break;
				case DIRECTIONS.LEFT:
					currentPixelCoordinate.x -= ANIMATION_PIXEL_STEP;
					break;
				case DIRECTIONS.RIGHT:
					currentPixelCoordinate.x += ANIMATION_PIXEL_STEP;
					break;
				default:
					currentPixelCoordinate.y += ANIMATION_PIXEL_STEP;
					break;
			}
			//render unit at current position
			renderUnitAtPixelCoordinate(animationCanvasContext, currentPixelCoordinate, unit);
			if(!util.areCoordinatesEqual(currentPixelCoordinate, endingPixelCoordinate)){
				//reset start
				start = null;
				window.requestAnimationFrame(step);
			}
			else{
				nextCallback();
			}
		}
	 	window.requestAnimationFrame(step);
	 }

	 function renderUnitMovement(unitCanvasContext, animationCanvasContext, unit, path, resolveCallback){
	 	var startingCoordinate = path[0];
	 	//draw unit initial position on animation canvas, and erase unit on unit canvas
	 	renderUnit(animationCanvasContext, startingCoordinate, unit);
	 	eraseTile(unitCanvasContext, startingCoordinate);
	 	
	 	//to be executed on function completion
	 	function endingCallback(){
	 		//draw ending unit position on unit canvas, and erase unit on animation canvas
		 	var endingCoordinate = path[path.length - 1];
		 	renderUnit(unitCanvasContext, endingCoordinate, unit);
		 	eraseTile(animationCanvasContext, endingCoordinate);
		 	resolveCallback();
	 	};
	 	var i = 0;
	 	function nextAnimationCallback(){
	 		i++;
	 		if(i < path.length - 1){
 				renderUnitMovingBetween(animationCanvasContext, unit, path[i], path[i+1], nextAnimationCallback);
 			}
 			else{
 				endingCallback();
 			}

	 	};
	 	if(path.length > 1){
	 		renderUnitMovingBetween(animationCanvasContext, unit, path[0], path[1], nextAnimationCallback);
	 	}
	 	else{
	 		endingCallback();
	 	}
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
		renderUnitMovementSquares: renderUnitMovementSquares,
		renderLevel: renderLevel,
		renderUnitMovement: renderUnitMovement,
		renderUnitMovementPreview: renderUnitMovementPreview,
		renderUnitMoved: renderUnitMoved
	};
})(app.util, app.unitStats, app.terrainStats);