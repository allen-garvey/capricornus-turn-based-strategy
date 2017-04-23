/*
 * Array that stores statistics about each terrain type
 */
var app = app || {};

app.terrainStats = (function(){
	var terrainSpritesheet = document.getElementById('spritesheet');
    function terrainStats(){
    	var stats = [];
    	stats.push({
    		name: 'Sand',
    		spritesheet: terrainSpritesheet,
    		spriteCoordinate: {x: 0, y: 0}
    	});
        stats.push({
            name: 'Grass',
            spritesheet: terrainSpritesheet,
            spriteCoordinate: {x: 1, y: 0}
        });
    	return stats;
    }

    //exported functions
    return {get: terrainStats};
})();