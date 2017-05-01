/*
 * Logic for unit pathfinding
 */
var app = app || {};
app.pathfinder = (function(util){

	/*
	* @param startingCoordinate - starting coordinate {x, y} of the unit
	* @param endingCoordinate - ending coordinate {x, y} of the unit
	* (Coordinates start at the top left of the screen at {x: 0, y: 0} and move downwards and to the right with increasing numbers)
	* @param gamboard - 2 dimensional array of units and terrain
	* @param - unitStatsArray - array of unit stats, cross-indexed to unit.type
	* @param - terrainStatsArray - array of terrain stats, cross-indexed to terrain.type
	* @returns array of coordinates in the order they should be taken starting with startingCoordinate and ending with endingCoordinate
	* should assume that startingCoordinate and endingCoordinate are valid i.e. no need to validate them
	*/
	function pathFor(startingCoordinate, endingCoordinate, gameboard, unitStatsArray, terrainStatsArray){
		//get the unit
		var unitToBeMoved = gameboard[startingCoordinate.x][startingCoordinate.y].unit;
		//get stats about the unit
    	var unitStats = unitStatsArray[unitToBeMoved.type];
		var validMoves = movementCoordinatesFor(startingCoordinate, gameboard, unitStatsArray, terrainStatsArray);
		var pathReverse = [];
		var path = [];
	
		if(arrayContainsCoords(validMoves, endingCoordinate.x, endingCoordinate.y)){
			pathReverse.push(endingCoordinate);
			while (pathReverse[pathReverse.length - 1].x != startingCoordinate.x || pathReverse[pathReverse.length - 1].y != startingCoordinate.y )
			{
				var coordinate = getCoordinateFromMoveArray(validMoves, pathReverse[pathReverse.length - 1].x, pathReverse[pathReverse.length - 1].y);
				pathReverse.push({x: coordinate.fromX, y: coordinate.fromY});
			}
		}
		else
		{
			//This is the error case where the ending coordinate is not in the array of valid moves
			path.push({x: startingCoordinate.x, y: startingCoordinate.y + 1});
		}
		
		for (var ixx = pathReverse.length - 1; ixx >= 0; ixx--)
		{
			path.push(pathReverse[ixx]);
		}
		//document.getElementById("testOut").textContent = JSON.stringify(path);
    	return path;
    	//TODO: Add code for shortest path between starting and ending coordinate here
    	//right now this is a stub algorithm for testing purposes
    	/* var coordinatesPath = [startingCoordinate];
    	var currentCoordinate = {x: startingCoordinate.x, y: startingCoordinate.y};
    	while(!util.areCoordinatesEqual(currentCoordinate, endingCoordinate)){
    		if(currentCoordinate.x < endingCoordinate.x){
    			currentCoordinate.x += 1;
    		}
    		else if(currentCoordinate.x > endingCoordinate.x){
    			currentCoordinate.x -= 1;
    		}
    		else if(currentCoordinate.y < endingCoordinate.y){
    			currentCoordinate.y += 1;
    		}
    		else{
    			currentCoordinate.y -= 1;
    		}
    		coordinatesPath.push(util.copyCoordinate(currentCoordinate));
    	}

    	return coordinatesPath; */

	}

	/*
	* @param unitCoordinate - coordinate {x, y} of the unit
	* (Coordinates start at the top left of the screen at {x: 0, y: 0} and move downwards and to the right with increasing numbers)
	* @param gamboard - 2 dimensional array of units and terrain
	* @param - unitStatsArray - array of unit stats, cross-indexed to unit.type
	* @param - terrainStatsArray - array of terrain stats, cross-indexed to terrain.type
	* @returns array of coordinates (in any order) that the unit at unitCoordinate can travel to (not including starting unitCoordinate)
	(should also probably return coordinates of units that can be attacked, with additional property to coordinate, such as {x: 1, y: 1, attack: true})
	*/
    function movementCoordinatesFor(unitCoordinate, gameboard, unitStatsArray, terrainStatsArray){
    	//get the unit
    	var unitToBeMoved = gameboard[unitCoordinate.x][unitCoordinate.y].unit;
    	//get stats about the unit
    	var unitStats = unitStatsArray[unitToBeMoved.type];

    	//example of getting terrain at coordinate {x: 1, y: 2}
    	var terrain = gameboard[1][2].terrain;
    	//see if unit can traverse that terrain
    	if(unitStats.canTraverse[terrain.type]){

    	}
		var ymax = gameboard[0].length - 1;
		var xmax = gameboard.length - 1;
		var validMoves = [];
		//validMoves.push({x: unitCoordinate.x, y: unitCoordinate.y, cost: 0});
		if(unitCoordinate.x + 1 <= xmax 
		&& unitStats.canTraverse[gameboard[unitCoordinate.x + 1][unitCoordinate.y].terrain.type]
		&& gameboard[unitCoordinate.x + 1][unitCoordinate.y].unit === null ){
			validMoves.push({x: unitCoordinate.x + 1, y: unitCoordinate.y, cost: 1, fromX: unitCoordinate.x, fromY: unitCoordinate.y});	
		}
		if(unitCoordinate.x - 1 >= 0 
		&& unitStats.canTraverse[gameboard[unitCoordinate.x - 1][unitCoordinate.y].terrain.type]
		&& gameboard[unitCoordinate.x - 1][unitCoordinate.y].unit === null ){
			validMoves.push({x: unitCoordinate.x - 1, y: unitCoordinate.y, cost: 1, fromX: unitCoordinate.x, fromY: unitCoordinate.y});
		}
		if(unitCoordinate.y + 1 <= ymax 
		&& unitStats.canTraverse[gameboard[unitCoordinate.x][unitCoordinate.y + 1].terrain.type]
		&& gameboard[unitCoordinate.x][unitCoordinate.y + 1].unit === null ){
			validMoves.push({x: unitCoordinate.x, y: unitCoordinate.y + 1, cost: 1, fromX: unitCoordinate.x, fromY: unitCoordinate.y});
		}
		if(unitCoordinate.y - 1 >= 0 
		&& unitStats.canTraverse[gameboard[unitCoordinate.x][unitCoordinate.y - 1].terrain.type]
		&& gameboard[unitCoordinate.x][unitCoordinate.y - 1].unit === null ){
			validMoves.push({x: unitCoordinate.x, y: unitCoordinate.y - 1, cost: 1, fromX: unitCoordinate.x, fromY: unitCoordinate.y});
		} 
		var nextMoveDist = 1;
		index = 0;
		//unitStats.movementSpeed
		while(nextMoveDist <= unitStats.movementSpeed && index < validMoves.length)
		{
			if(validMoves[index].x + 1 <= xmax 
			&& unitStats.canTraverse[gameboard[validMoves[index].x + 1][validMoves[index].y].terrain.type]
			&& !arrayContainsCoords(validMoves, validMoves[index].x + 1, validMoves[index].y)
			&& gameboard[validMoves[index].x + 1][validMoves[index].y].unit === null ){
				validMoves.push({x: validMoves[index].x + 1, y: validMoves[index].y, cost: validMoves[index].cost + 1, fromX: validMoves[index].x, fromY: validMoves[index].y});	
			}
			if(validMoves[index].x - 1 >= 0 
			&& unitStats.canTraverse[gameboard[validMoves[index].x - 1][validMoves[index].y].terrain.type]
			&& !arrayContainsCoords(validMoves, validMoves[index].x - 1, validMoves[index].y)
			&& gameboard[validMoves[index].x - 1][validMoves[index].y].unit === null){
				validMoves.push({x: validMoves[index].x - 1, y: validMoves[index].y, cost: validMoves[index].cost + 1, fromX: validMoves[index].x, fromY: validMoves[index].y});
			}
			if(validMoves[index].y + 1 <= ymax 
			&& unitStats.canTraverse[gameboard[validMoves[index].x][validMoves[index].y + 1].terrain.type]
			&& !arrayContainsCoords(validMoves, validMoves[index].x, validMoves[index].y + 1)
			&& gameboard[validMoves[index].x][validMoves[index].y + 1].unit === null){
				validMoves.push({x: validMoves[index].x, y: validMoves[index].y + 1, cost: validMoves[index].cost + 1, fromX: validMoves[index].x, fromY: validMoves[index].y});
			}
			if(validMoves[index].y - 1 >= 0 
			&& unitStats.canTraverse[gameboard[validMoves[index].x][validMoves[index].y - 1].terrain.type]
			&& !arrayContainsCoords(validMoves, validMoves[index].x, validMoves[index].y - 1)
			&& gameboard[validMoves[index].x][validMoves[index].y - 1].unit === null){
				validMoves.push({x: validMoves[index].x, y: validMoves[index].y - 1, cost: validMoves[index].cost + 1, fromX: validMoves[index].x, fromY: validMoves[index].y});
			}
			index++;
			nextMoveDist = validMoves[index].cost + 1;
		}
		//document.getElementById("testOut").textContent = JSON.stringify(validMoves);
    	//TODO: Add code for finding tiles unit can move to here
    	//possibly later also adding squares unit can attack

    	//for now just return squares around the unit
    	return validMoves;
    }
	
	function arrayContainsCoords(movesArray, xCoordinate, yCoordinate){
		for (var ixx = 0; ixx < movesArray.length; ixx++)
		{
			if(movesArray[ixx].x == xCoordinate && movesArray[ixx].y == yCoordinate){
				return true;
			}
		}
		return false;
	}
	
	function getCoordinateFromMoveArray(movesArray, xCoordinate, yCoordinate)
	{
		for (var ixx = 0; ixx < movesArray.length; ixx++)
		{
			if(movesArray[ixx].x == xCoordinate && movesArray[ixx].y == yCoordinate){
				return movesArray[ixx];
			}
		}
		return {x: -1, y: -1};
	}

    //exported functions
    return {
    	movementCoordinatesFor: movementCoordinatesFor,
    	pathFor: pathFor
    };
})(app.util);