/*
 * Array that stores statistics about each terrain type
 */
var app = app || {};

app.terrainStats = (function(){
	var terrainSpritesheet = document.getElementById('spritesheet');
    
    //array of information about terrain - corresponds to terrain instance type
    function terrainStats(){
    	var stats = [];
    	stats.push({
    		name: 'Sand',
    		spritesheet: terrainSpritesheet,
    		spriteCoordinate: {x: 0, y: 0},
            defense: 1
    	});
        stats.push({
            name: 'Grass',
            spritesheet: terrainSpritesheet,
            spriteCoordinate: {x: 1, y: 0},
            defense: 2
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