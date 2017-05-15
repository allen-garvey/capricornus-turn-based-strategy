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
            dataUnitsFileUrl: 'data/level1sprites.json', //file to load unit sprite locations from
            dataUnits: null, //where the data will be stored from dataUnitsFileUrl when it is loaded
            dataTerrainFileUrl: 'data/level1.json', //url for terrain types for level
            dataTerrain: null //where data from dataTerrainFileUrl will be stored after it is loaded
    	});
    	stats.push({
    		name: 'Level 1', //for debugging purposes
    		spritesheet: document.getElementById('level2_sprite'),
            dataUnitsFileUrl: 'data/level2sprites.json', //file to load unit sprite locations from
            dataUnits: null, //where the data will be stored from dataUnitsFileUrl when it is loaded
            dataTerrainFileUrl: 'data/level2.json', //url for terrain types for level
            dataTerrain: null //where data from dataTerrainFileUrl will be stored after it is loaded
    	});
    	stats.push({
    		name: 'Level 2', //for debugging purposes
    		spritesheet: document.getElementById('level3_sprite'),
    		dataUnitsFileUrl: 'data/level3sprites.json', //file to load unit sprite locations from
            dataUnits: null, //where the data will be stored from dataUnitsFileUrl when it is loaded
            dataTerrainFileUrl: 'data/level2.json', //url for terrain types for level
            dataTerrain: null //where data from dataTerrainFileUrl will be stored after it is loaded
        });
		    
	    
    	return stats;
    }

    //exported functions
    return {
    		get: levelStats
    		};
})();
