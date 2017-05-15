"use strict";
/*
 * Array that stores statistics about each level type
 */
var app = app || {};

app.levelStats = (function(){
    
	//array of information about units - corresponds to unit instance type
    function levelStats(){
    	var stats = [];
    	stats.push({
    		name: 'Level 0', //for debugging purposes
    		spritesheet: document.getElementById('level1_sprite'),
            dataUnitsUrl: 'data/level1sprites.json', //file to load unit sprite locations from
            dataUnits: null, //where the data will be stored from dataUnitsUrl when it is loaded
            dataTerrainUrl: 'data/level1.json', //url for terrain types for level
            dataTerrain: null //where data from dataTerrainUrl will be stored after it is loaded
    	});
    	stats.push({
    		name: 'Level 1', //for debugging purposes
    		spritesheet: document.getElementById('level2_sprite'),
            dataUnitsUrl: 'data/level2sprites.json', //file to load unit sprite locations from
            dataUnits: null, //where the data will be stored from dataUnitsUrl when it is loaded
            dataTerrainUrl: 'data/level2.json', //url for terrain types for level
            dataTerrain: null //where data from dataTerrainUrl will be stored after it is loaded
    	});
    	stats.push({
    		name: 'Level 2', //for debugging purposes
    		spritesheet: document.getElementById('level3_sprite'),
    		dataUnitsUrl: 'data/level3sprites.json', //file to load unit sprite locations from
            dataUnits: null, //where the data will be stored from dataUnitsUrl when it is loaded
            dataTerrainUrl: 'data/level2.json', //url for terrain types for level
            dataTerrain: null //where data from dataTerrainUrl will be stored after it is loaded
        });
		    
	    
    	return stats;
    }

    //exported functions
    return {
    		get: levelStats
    		};
})();
