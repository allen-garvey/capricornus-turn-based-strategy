"use strict";
/*
 * Array that stores statistics about each terrain type
 */
var app = app || {};

app.terrainStats = (function(){
    
    //array of information about terrain - corresponds to terrain instance type
    function terrainStats(){
    	var stats = [];
        stats.push({
            name: 'Grass', //for debugging purposes
            defense: false //for units that benefit from defense, should defense be applied here?
        });
        stats.push({
            name: 'Mountains', //for debugging purposes
            defense: true //for units that benefit from defense, should defense be applied here?
        });
        stats.push({
            name: 'Trees', //for debugging purposes
            defense: true //for units that benefit from defense, should defense be applied here?
        });
        stats.push({
            name: 'Water', //for debugging purposes
            defense: false //for units that benefit from defense, should defense be applied here?
        });
        stats.push({
            name: 'Edge of water', //for debugging purposes
            defense: false //for units that benefit from defense, should defense be applied here?
        });
        stats.push({
            name: 'Bridge', //for debugging purposes
            defense: false //for units that benefit from defense, should defense be applied here?
        });
        stats.push({
            name: 'Sand', //for debugging purposes
            defense: false //for units that benefit from defense, should defense be applied here?
        });
        stats.push({
            name: 'Deep Water', //for debugging purposes
            defense: false //for units that benefit from defense, should defense be applied here?
        });
    	return stats;
    }

    //returns new terrain instance
    function terrain(type){
        return {
            type: type //array index in terrainStas
        };
    }

    //exported functions
    return {
            get: terrainStats,
            create: terrain
            };
})();