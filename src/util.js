/*
 * Utility functions
 */

function coordinateFrom(x, y){
	return {x, y};
}

function copyCoordinate(coordinate){
	return {x: coordinate.x, y: coordinate.y};
}

function isCoordinateInMovementSquares(coordinate, movementSquares){
	for(let i = 0; i < movementSquares.length; i++){
		const currentCoordinate = movementSquares[i];
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

//creates deep copy of an object and returns it
//note this will only copy serializable properties, not functions
//based on: http://stackoverflow.com/questions/728360/how-do-i-correctly-clone-a-javascript-object
function cloneObject(object){
	return JSON.parse(JSON.stringify(object));
}


export default {
	copyCoordinate,
	isCoordinateInMovementSquares,
	areCoordinatesEqual,
	coordinateFrom,
	cloneObject,
};