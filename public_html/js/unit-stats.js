/*
 * Array that stores statistics about each unit type
 */
var app = app || {};

app.unitStats = (function(){
	var soldierSpriteSheet = document.getElementById('spritesheet');
    function unitStats(){
    	var stats = [];
    	stats.push({
    		name: 'Soldier',
    		spritesheet: soldierSpriteSheet,
    		spriteCoordinate: {x: 0, y: 1}
    	});
    	return stats;
    }

    //exported functions
    return {get: unitStats};
})();