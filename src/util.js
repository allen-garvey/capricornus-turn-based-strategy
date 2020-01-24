"use strict";
/*
 * Utility functions
 */

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
	//for non-mouse inputs, one or both of the coordinates might be null
	if(!coordinate1){
		if(!coordinate2){
			return true;
		}
		return false;
	}
	else if(!coordinate2){
		return false;
	}
	return (coordinate1.x === coordinate2.x && coordinate1.y === coordinate2.y);
}

//because can't use array prototype methods on NodeList
function forEach(iteratable, callback){ 
	return Array.prototype.forEach.call(iteratable, callback); 
}

//creates deep copy of an object and returns it
//note this will only copy serializable properties, not functions
//based on: http://stackoverflow.com/questions/728360/how-do-i-correctly-clone-a-javascript-object
function cloneObject(object){
	return JSON.parse(JSON.stringify(object));
}


export default {
	copyCoordinate: copyCoordinate,
	isCoordinateInMovementSquares: isCoordinateInMovementSquares,
	areCoordinatesEqual: areCoordinatesEqual,
	coordinateFrom: coordinateFrom,
	forEach: forEach,
	cloneObject: cloneObject
};