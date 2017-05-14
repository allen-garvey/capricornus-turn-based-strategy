"use strict";
/*
 * Utility functions
 */
var app = app || {};

app.util = (function(){
	function coordinateFrom(x, y){
		return {x: x, y: y};
	}

	function copyCoordinate(coordinate){
		return {x: coordinate.x, y: coordinate.y};
	}

	function isCoordinateInMovementSquares(coordinate, movementSquares){
		for(var i = 0; i < movementSquares.length; i++){
			var currentCoordinate = movementSquares[i];
			if(coordinate.x === currentCoordinate.x && coordinate.y === currentCoordinate.y){
				return true;
			}
		}
		return false;
	}

	function areCoordinatesEqual(coordinate1, coordinate2){
		return (coordinate1.x === coordinate2.x && coordinate1.y === coordinate2.y);
	}

	//exported functions and variables
	return {
		copyCoordinate: copyCoordinate,
		isCoordinateInMovementSquares: isCoordinateInMovementSquares,
		areCoordinatesEqual: areCoordinatesEqual,
		coordinateFrom: coordinateFrom
	};
    
})();