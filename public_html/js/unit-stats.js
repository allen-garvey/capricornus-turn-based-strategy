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
    		name: 'Infantry', //for debugging purposes
    		spritesheet: soldierSpriteSheet,
    		spriteCoordinate: {x: 0, y: 1},
    		canTraverse: [true, true], //if a unit can traverse the type of terrain cross-referenced to terrainStats array index
    		applyDefense: true, //gets defense from cover
    		hitpoints: 75, //hitpoints contained in new unit
    		attackTable: [20, 20, 20], //damage inflicted to a unit of the same type as the array index
    		movementSpeed: 6 //how many tiles unit can move
    	});
    	stats.push({
    		name: 'Tank', //for debugging purposes
    		spritesheet: soldierSpriteSheet,
    		spriteCoordinate: {x: 0, y: 1},
    		canTraverse: [true, true], //if a unit can traverse the type of terrain cross-referenced to terrainStats array index
    		applyDefense: false, //gets defense from cover
    		hitpoints: 150, //hitpoints contained in new unit
    		attackTable: [50, 50, 50], //damage inflicted to a unit of the same type as the array index
    		movementSpeed: 4 //how many tiles unit can move
    	});
    	stats.push({
    		name: 'Plane', //for debugging purposes
    		spritesheet: soldierSpriteSheet,
    		spriteCoordinate: {x: 0, y: 1},
    		canTraverse: [true, true], //if a unit can traverse the type of terrain cross-referenced to terrainStats array index
    		applyDefense: false, //gets defense from cover
    		hitpoints: 100, //hitpoints contained in new unit
    		attackTable: [30, 30, 30], //damage inflicted to a unit of the same type as the array index
    		movementSpeed: 8 //how many tiles unit can move
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