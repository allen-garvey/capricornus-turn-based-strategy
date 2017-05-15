"use strict";

/*
 * Functionality for translating level data from json files into 
 * format used by gameboard
 */

var app = app || {};

app.levelLoader = (function(unitStats, terrainStats){

	/**
	 * Used to get the correct unit type for a square in the map
	 * note that the column, row coordinates are reversed from the gameboard, since the gameboard
	 * stores data in row, column format
	 * @param level - an item from the array returned from unit-stats with data preloaded
	 * @param column - int - column index
	 * @param row - int - row index
	 * @param TOTAL_TILES - total number of tiles in game, return value from renderer.totalTiles
	 * @Returns unit instance from unitStats, or null if there is no unit in that square
	 */
	function unitFor(level, column, row, TOTAL_TILES){
		//check to see if indexes are valid
		//gameboard is actually mistakenly rotated, so we have to rotate the level data to match it
		if(level.dataUnits.units[column] === undefined || level.dataUnits.units[column][row] === undefined){
			return null;
		}
		var unit;
		switch(level.dataUnits.units[column][row]){
			case 1:
				unit = unitStats.create(0,0);
				break;
			case 2:
				unit = unitStats.create(1,0);
				break;
			case 3:
				unit = unitStats.create(2,0);
				break;
			case 4:
				unit = unitStats.create(0,1);
				break;
			case 5:
				unit = unitStats.create(1,1);
				break;
			case 6:
				unit = unitStats.create(2,1);
				break;
			default:
				unit = null;
				break;
		}
		if(unit === null){
			return unit;
		}
		if(column < TOTAL_TILES.x/2){
			unit.currentDirection = unitStats.UNIT_DIRECTIONS.RIGHT;
		}
		else{
			unit.currentDirection = unitStats.UNIT_DIRECTIONS.LEFT;
		}
		return unit;
	}


	/**
	 * Used to get the correct terrain type for a square in the map
	 * note that the column, row coordinates are reversed from the gameboard, since the gameboard
	 * stores data in row, column format
	 * @param level - an item from the array returned from terrain-stats with data preloaded
	 * @param column - int - column index
	 * @param row - int - row index
	 * @Returns terrain instance from terrainStats
	 */
	function terrainFor(level, column, row){

	}



	//exported functions and variables
	return {
		unitFor: unitFor,
		terrainFor: terrainFor
	};
    
})(app.unitStats, app.terrainStats);