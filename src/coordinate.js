/*
 * Functions involving game coordinates
 */

function coordinateFrom(x, y){
	return {x, y};
}

function copy(coordinate){
	return {...coordinate};
}

function areCoordinatesEqual(coordinate1, coordinate2){
	//for non-mouse inputs, one or both of the coordinates might be null
	if(!coordinate1 || !coordinate2){
		return !!coordinate1 === !!coordinate2;
	}
	return (coordinate1.x === coordinate2.x && coordinate1.y === coordinate2.y);
}

function isCoordinateInMovementSquares(coordinate, movementSquares){
	for(const currentCoordinate of movementSquares){
		if(areCoordinatesEqual(coordinate, currentCoordinate)){
			return true;
		}
	}
	return false;
}


export default {
	copy,
	isCoordinateInMovementSquares,
	areCoordinatesEqual,
	from: coordinateFrom,
};