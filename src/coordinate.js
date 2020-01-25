/*
 * Functions involving game coordinates
 */

function coordinateFrom(x, y){
	return {x, y};
}

function copy(coordinate){
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


export default {
	copy,
	isCoordinateInMovementSquares,
	areCoordinatesEqual,
	from: coordinateFrom,
};