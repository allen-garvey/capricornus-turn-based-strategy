/*
 * Logic for unit pathfinding
 */
var app = app || {};
app.pathfinder = (function(){

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

    	//TODO: Add code for shortest path between starting and ending coordinate here

    	//example return value if startingCoordinate = {x: 1, y: 1} and endingCoordinate = {x: 3, y: 2}
    	return [startingCoordinate, {x: 2, y: 1}, {x: 2, y: 2}, endingCoordinate];

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

    	//TODO: Add code for finding tiles unit can move to here
    	//possibly later also adding squares unit can attack

    	//for now just return squares around the unit
    	return [{x: unitCoordinate.x + 1, y: unitCoordinate.y}, {x: unitCoordinate.x - 1, y: unitCoordinate.y}, {x: unitCoordinate.x, y: unitCoordinate.y + 1}, {x: unitCoordinate.x, y: unitCoordinate.y - 1}];
    }


    //exported functions
    return {
    	movementCoordinatesFor: movementCoordinatesFor,
    	pathFor: pathFor
    };
})();