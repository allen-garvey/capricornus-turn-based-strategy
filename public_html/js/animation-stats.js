"use strict";
/*
 * Used to store information about the animations
 */
var app = app || {};

app.animationStats = (function(){
    
	//array of information about animations
    function animationStats(){
    	var stats = {};
    	
        stats.explosion = {
            name: 'Explosion', //for debugging purposes
            spritesheet: document.getElementById('explosion_spritesheet'),
            spriteCoordinates: [{x: 0, y: 0}, {x: 1, y: 0}, {x: 2, y: 0}, {x: 3, y: 0}, {x: 4, y: 0}, {x: 5, y: 0}, {x: 6, y: 0}, {x: 7, y: 0}, {x: 8, y: 0}, {x: 9, y: 0}, {x: 10, y: 0}, {x: 11, y: 0}] //coordinates in order animation should be displayed
        };

    	return stats;
    }


    //exported functions
    return {
    		get: animationStats
    		};
})();