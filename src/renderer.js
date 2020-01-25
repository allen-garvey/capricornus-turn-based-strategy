/*
 * Functionality used to render graphics on a canvas context
 */

import Coordinate from './coordinate.js';
import unitStats from './unit-stats.js';
import animationStats from './animation-stats.js';


var UNIT_STATS = unitStats.get();
var ANIMATION_STATS = animationStats.get();

//constants used when rendering unit orientation and movement animation
var DIRECTIONS = {
		RIGHT: 0,
		LEFT: 1,
		UP: 2,
		DOWN: 3
	};

/*
* Tile size and tiles in board initialization
*/
//pixels in square tile
var TILE_SIZE = 32;
//number of pixels between each frame in the animation
var ANIMATION_PIXEL_STEP = 2;
//delay between frames in ms for unit movement animations
var ANIMATION_FRAME_DELAY = 10;
//delay between frames for static animations, like explosions
var STATIC_ANIMATION_FRAME_DELAY = 200;

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
	drawTileAtPixelCoordinate(canvasContext, image, pixelLocationCoordinate, spriteCoordinate);
}

function eraseTileAtPixelCoordinate(canvasContext, pixelLocationCoordinate){
	canvasContext.clearRect(pixelLocationCoordinate.x, pixelLocationCoordinate.y, TILE_SIZE, TILE_SIZE);
}

function eraseTile(canvasContext, locationCoordinate){
	var pixelLocationCoordinate = tileCoordinateToPixelCoordinate(locationCoordinate);
	eraseTileAtPixelCoordinate(canvasContext, pixelLocationCoordinate);
}

function eraseCanvas(canvasContext){
	canvasContext.clearRect(0, 0, canvasContext.canvas.width, canvasContext.canvas.height);
}

function renderLevel(canvasContext, levelSprite){
	canvasContext.drawImage(levelSprite, 0, 0);
}

//erases and then redraws the unit as necessary based on movement and if the unit is dead
function redrawUnit(canvasContext, coordinate, unit){
	eraseTile(canvasContext, coordinate);
	if(unit.health <= 0){
		return;
	}
	if(unit.canMove){
		renderUnit(canvasContext, coordinate, unit);
	}
	else{
		renderUnitMoved(canvasContext, coordinate, unit);
	}
}

function renderUnitMoved(canvasContext, coordinate, unit){
	var unitStats = UNIT_STATS[unit.type];
	drawTile(canvasContext, unitStats.spritesheets[unit.team], coordinate, unitStats.spriteCoordinatesWhenMoved[unit.team][unit.currentDirection]);
	renderUnitHealthbar(canvasContext, coordinate, unit);
}

function renderUnit(canvasContext, coordinate, unit){
	var unitStats = UNIT_STATS[unit.type];
	drawTile(canvasContext, unitStats.spritesheets[unit.team], coordinate, unitStats.spriteCoordinates[unit.team][unit.currentDirection]);
	renderUnitHealthbar(canvasContext, coordinate, unit);
}
function renderUnitAtPixelCoordinate(canvasContext, pixelCoordinate, unit){
	var unitStats = UNIT_STATS[unit.type];
	drawTileAtPixelCoordinate(canvasContext, unitStats.spritesheets[unit.team], pixelCoordinate, unitStats.spriteCoordinates[unit.team][unit.currentDirection]);
	renderUnitHealthbarAtPixelCoordinate(canvasContext, pixelCoordinate, unit);
}

function renderUnitHealthbarAtPixelCoordinate(canvasContext, pixelCoordinate, unit){
	var healthPercentage = unit.health / UNIT_STATS[unit.type].hitpoints;
	//don't draw healthbar if unit is at full health
	if(healthPercentage >= 1){
		return;
	}

	//pixels from top of unit sprite where healthbar is drawn
	var topPixelOffset = 4;
	//pixels padding on each side of healthbar
	var healthbarPadding = 2;
	var healthbarLength = TILE_SIZE - (2 * healthbarPadding);
	var healthbarHeight = 2;
	
	//draw bar to show hitpoints that are missing
	canvasContext.fillStyle = 'tomato';
	canvasContext.fillRect(pixelCoordinate.x + healthbarPadding, pixelCoordinate.y + topPixelOffset, healthbarLength, healthbarHeight);

	//draw bar for current hitpoints
	canvasContext.fillStyle = 'lawngreen';
	canvasContext.fillRect(pixelCoordinate.x + healthbarPadding, pixelCoordinate.y + topPixelOffset, healthbarLength * healthPercentage, healthbarHeight);
}

function renderUnitHealthbar(canvasContext, coordinate, unit){
	var pixelCoordinate = tileCoordinateToPixelCoordinate(coordinate);
	renderUnitHealthbarAtPixelCoordinate(canvasContext, pixelCoordinate, unit);
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
				redrawUnit(unitCanvasContext, currentCoordinate, gameTile.unit);
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
//renders solid color squares at list of coordinates of given fillColor
//used for movement squares and attack squares
function renderSquares(canvasContext, tileCoordinates, fillColor){
	//have to call before path operations
	canvasContext.beginPath();
	tileCoordinates.forEach(function(coordinate){
		var pixelCoordinate = tileCoordinateToPixelCoordinate(coordinate);
		canvasContext.fillStyle = fillColor;
		canvasContext.rect(pixelCoordinate.x, pixelCoordinate.y, TILE_SIZE, TILE_SIZE);
	});
	//actually draw the rectangles
	canvasContext.fill();
}

function renderUnitAttackSquares(canvasContext, attackTilesCoordinates){
	renderSquares(canvasContext, attackTilesCoordinates, 'rgba(255,0,0, 0.3)');
}

function renderUnitMovementSquares(canvasContext, movementTilesCoordinates){
	renderSquares(canvasContext, movementTilesCoordinates, 'rgba(0,0,255, 0.5)');
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

	//edits unit direction so it is facing in the correct direction
	//returns a constant from DIRECTIONS for the direction the unit will be moving in
	function orientUnit(startingCoordinate, endingCoordinate, unit){
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
	return currentDirection;
	}


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
	var currentPixelCoordinate = Coordinate.copy(startingPixelCoordinate);
	var currentDirection = orientUnit(startingCoordinate, endingCoordinate, unit);

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
		if(!Coordinate.areCoordinatesEqual(currentPixelCoordinate, endingPixelCoordinate)){
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

	/**
 * Rending unit attacks
 */
	//defending unit should already have it's health adjusted before entering this function, the damage done, is used to calculate the 
	//damage that should be displayed to have been taken from the defender
function renderAttack(unitCanvasContext, animationCanvasContext, attackCoordinate, defenseCoordinate, attackingUnit, defendingUnit, damageDone, doneCallback){
	function finishRenderAttack(){
		//display the new healthbars or erase unit if dead
		redrawUnit(unitCanvasContext, defenseCoordinate, defendingUnit);
		//show explosion if defender died
		if(defendingUnit.health <= 0){
			renderStaticAnimation(animationCanvasContext, ANIMATION_STATS.explosion, defenseCoordinate, doneCallback);
		}
		else{
			doneCallback();
		}	
	}

	orientUnit(attackCoordinate, defenseCoordinate, attackingUnit);
	//display attacker as having moved
	redrawUnit(unitCanvasContext, attackCoordinate, attackingUnit);
	
	//since animations are asynchronous, need to keep track of how many to complete before calling finishRenderAttack()
	var animationsToRender = 2;
	
	//show animation of unit attacking
	var unitAttackAnimationInfo = ANIMATION_STATS.unitAttack[attackingUnit.type];
	var unitAttackAnimation = {
								spritesheet: unitAttackAnimationInfo.spritesheet, 
								spriteCoordinates: unitAttackAnimationInfo.spriteCoordinates[attackingUnit.currentDirection]
							};
	renderStaticAnimation(animationCanvasContext, unitAttackAnimation, attackCoordinate, function(){
		animationsToRender--;
		if(animationsToRender <= 0){
			finishRenderAttack();
		}
	});
	//show animation of defender taking damage
	renderStaticColorAnimation(animationCanvasContext, ANIMATION_STATS.unitDamage, defenseCoordinate, function(){
		animationsToRender--;
		if(animationsToRender <= 0){
			finishRenderAttack();
		}
	});

	
}

/**
 * Rending animations
 */

//renders animation at coordinate, calls doneCallback when completed
//animation should be an entry from the animationStats object with type 'static animation'
//based on: https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
function renderStaticAnimation(canvasContext, animation, coordinate, doneCallback){
	var currentSpriteIndex = 0;

	var start = null;
	function step(timestamp){
		if(start === null){
			start = timestamp;	
		}
		var progress = timestamp - start;
		//don't show next frame until certain amount of time has passed
		if(progress < STATIC_ANIMATION_FRAME_DELAY){
			window.requestAnimationFrame(step);
			return;
		}
		//erase previous frame from animation
		eraseTile(canvasContext, coordinate);
		
		if(currentSpriteIndex < animation.spriteCoordinates.length){
			//render current frame in animation
			drawTile(canvasContext, animation.spritesheet, coordinate, animation.spriteCoordinates[currentSpriteIndex]);
			currentSpriteIndex++;
			//request animation frame one last time to erase final frame of animation
			window.requestAnimationFrame(step);
		}
		//requires empty last animation to erase final frame of animation
		else{
			doneCallback();
		}
	}
	window.requestAnimationFrame(step);
}

//renders animation of solid colors at coordinate, calls doneCallback when completed
//animation should be an entry from the animationStats object with type 'static color animation'
//based on: https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
function renderStaticColorAnimation(canvasContext, animation, coordinate, doneCallback){
	var pixelCoordinate = tileCoordinateToPixelCoordinate(coordinate);
	var currentColorCellIndex = 0;

	var start = null;
	function step(timestamp){
		if(start === null){
			start = timestamp;	
		}
		var progress = timestamp - start;
		//don't show next frame until certain amount of time has passed
		if(progress < STATIC_ANIMATION_FRAME_DELAY){
			window.requestAnimationFrame(step);
			return;
		}
		//erase previous frame from animation
		eraseTile(canvasContext, coordinate);
		
		if(currentColorCellIndex < animation.colorCells.length){
			//render current frame in animation
			canvasContext.fillStyle = animation.colorCells[currentColorCellIndex];
			canvasContext.fillRect(pixelCoordinate.x, pixelCoordinate.y, TILE_SIZE, TILE_SIZE);
			currentColorCellIndex++;
			//request animation frame one last time to erase final frame of animation
			window.requestAnimationFrame(step);
		}
		//requires empty last animation to erase final frame of animation
		else{
			doneCallback();
		}
	}
	window.requestAnimationFrame(step);
}


export default {
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
	renderUnitAttackSquares: renderUnitAttackSquares,
	renderLevel: renderLevel,
	renderUnitMovement: renderUnitMovement,
	renderUnitMovementPreview: renderUnitMovementPreview,
	renderUnitMoved: renderUnitMoved,
	renderUnit: renderUnit,
	redrawUnit: redrawUnit,
	renderAttack: renderAttack
};