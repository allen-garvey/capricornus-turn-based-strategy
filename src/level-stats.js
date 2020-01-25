/*
 * Array that stores statistics about each level type
 */
    
//array of information about units - corresponds to unit instance type
function levelStats(){
	var stats = [];
	stats.push({
		name: 'Level 0', //for debugging purposes
		spritesheet: document.getElementById('level1_sprite'),
		dataUnitsUrls: ['data/level1sprites.json', 'data/level1spriteshard.json'], //files to load unit sprite locations from, array indexes correspond to ai module difficulty levels
		dataUnits: [], //where the data will be stored from dataUnitsUrls when it is loaded
		dataTerrainUrl: 'data/level1.json', //url for terrain types for level
		dataTerrain: null //where data from dataTerrainUrl will be stored after it is loaded
	});
	stats.push({
		name: 'Level 1', //for debugging purposes
		spritesheet: document.getElementById('level2_sprite'),
		dataUnitsUrls: ['data/level2sprites.json', 'data/level2spriteshard.json'], //files to load unit sprite locations from, array indexes correspond to ai module difficulty levels
		dataUnits: [], //where the data will be stored from dataUnitsUrls when it is loaded
		dataTerrainUrl: 'data/level2.json', //url for terrain types for level
		dataTerrain: null //where data from dataTerrainUrl will be stored after it is loaded
	});
	stats.push({
		name: 'Level 2', //for debugging purposes
		spritesheet: document.getElementById('level3_sprite'),
		dataUnitsUrls: ['data/level3sprites.json', 'data/level3spriteshard.json'], //files to load unit sprite locations from, array indexes correspond to ai module difficulty levels
		dataUnits: [], //where the data will be stored from dataUnitsUrls when it is loaded
		dataTerrainUrl: 'data/level3.json', //url for terrain types for level
		dataTerrain: null //where data from dataTerrainUrl will be stored after it is loaded
	});
		
	
	return stats;
}

export default {
	get: levelStats
};
