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
    		spritesheet: document.getElementById('level1_sprite')
    	});
    	return stats;
    }

    //exported functions
    return {
    		get: levelStats
    		};
})();