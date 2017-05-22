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
	 * @param TOTAL_TILES - total number of tiles in game, return value from renderer.totalTiles
	 * @Returns terrain instance from terrainStats
	 */
	function terrainFor(level, column, row, TOTAL_TILES){
		var terrainLayers = level.dataTerrain.layers;
		//have to do some math, because layer array is 1d array representing 2d array
		var layerIndex = (TOTAL_TILES.x * row) + column;
		var layer2TerrainId = terrainLayers[1].data[layerIndex];
		var layer1TerrainId = terrainLayers[0].data[layerIndex];
		//check to see if layer 2 is empty
		//if it's not, then that is the terrain type
		if(layer2TerrainId !== 0){
			return terrainForId(layer2TerrainId);
		}
		//if there is no layer 2 terrain, that means the terrain type is on layer 1
		return terrainForId(layer1TerrainId);
	}

	/**
	 * Maps terrainId to terrain instance
	 * @param terrainId - integer from level json file representing a terrain type
	 * @Returns terrain instance from terrainStats
	 */
	function terrainForId(terrainId){
		switch(terrainId){
			//sand
			case 3:
			case 4:
			case 5:
			case 19:
			case 20:
			case 21:
			case 35:
			case 36:
			case 37:
				return terrainStats.create(6);
				break;
			//trees
			case 472:
			case 473:
			case 488:
			case 489:
			case 504:
			case 505:
				return terrainStats.create(2);
				break;
			//water
			case 53:
			case 69:
			case 85:
				return terrainStats.create(3);
				break;
			//edge of water
			case 52:
			case 54:
			case 68:
			case 70:
			case 84:
			case 86:
				return terrainStats.create(4);
				break;
			//deep water
			case 23:
				return terrainStats.create(7);
				break;
			//bridge
			case 365:
			case 381:
			case 397:
				return terrainStats.create(5);
				break;
			//mountains
			case 460:
			case 476:
				return terrainStats.create(1);
				break;
			//should be 1 for grass
			default:
				return terrainStats.create(0);
				break;
		}
	}

	/**
	 * puts level unit placements and terrain data into level array
	 * @param levelStatsArray - array returned by level-stats module
	 * @param levelUnitDatas - array of data with the downloaded contents of the level stats array dataUnitsUrl property
	 * @param levelTerrainDatas - array of data with the downloaded contents of the level stats array dataTerrainUrl property
	 */
	function initializeLevelData(levelStatsArray, levelUnitDatas, levelTerrainDatas){
		levelStatsArray.forEach(function(item, index){
			//load unit level data into the level stats
			if(levelUnitDatas[index]){
				item.dataUnits = levelUnitDatas[index];
			}
			//load terrain level data into the level stats
			if(levelTerrainDatas[index]){
				item.dataTerrain = levelTerrainDatas[index];
			}
		});
	}



	//exported functions and variables
	return {
		unitFor: unitFor,
		terrainFor: terrainFor,
		initializeLevelData: initializeLevelData
	};
    
})(app.unitStats, app.terrainStats);