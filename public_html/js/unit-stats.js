/*
 * Array that stores statistics about each unit type
 */
var app = app || {};

app.unitStats = (function(){
	var soldierSpriteSheet = document.getElementById('spritesheet');
    
	//array of information about units - corresponds to unit instance type
    function unitStats(){
    	var stats = [];
    	stats.push({
    		name: 'Soldier', //for debugging purposes
    		spritesheet: soldierSpriteSheet,
    		spriteCoordinate: {x: 0, y: 1},
    		canTraverse: [true, true], //if a unit can traverse the type of terrain cross-referenced to terrainStats array index
    		hitpoints: 100, //hitpoints contained in new unit
    		attackTable: [50], //damage inflicted to a unit of the same type as the array index
    		movementSpeed: 5 //how many tiles unit can move
    	});
    	return stats;
    }

    //returns new unit instance
    function unit(type, team){
    	return {
    		type: type, //array index in unitStats
    		team: team, //0 for player team, 1 for AI team
    		health: unitStats()[type].hitpoints, //current health of unit
    		canMove: true //if unit can still move for this turn
    	};
    }

    //exported functions
    return {
    		get: unitStats,
    		create: unit
    		};
})();