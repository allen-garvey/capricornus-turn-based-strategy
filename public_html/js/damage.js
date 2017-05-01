/*
 * Functions for calculating damage done when units attack
 */
var app = app || {};

app.damage = (function(){
	/*
	* Returns amount of damage done by attacking unit to defending unit
	* @param attackingUnit - unit instance attacking
	* @param defendingUnit - unit instance being attacked
	* @param attackingTerrain - terrain instance the unit attacking is standing on
	* @param defendingTerrain - terrain instance the unit defending is standing on
	* @param - unitStatsArray - array of unit stats, cross-indexed to unit.type
	* @param - terrainStatsArray - array of terrain stats, cross-indexed to terrain.type
	* @returns - positive integer or 0 representing the amount of damage attackingUnit deals to defendingUnit from attack
	*/
	function damageForAttack(attackingUnit, defendingUnit, attackingTerrain, defendingTerrain, unitStatsArray, terrainStatsArray){
		//example code to get you started
		//get attacking unit stats
		var attackingUnitStats = unitStatsArray[attackingUnit.type];
		//get defending unit terrain stats
		var defendingTerrainStats = terrainStatsArray[defendingTerrain.type];
		//TODO: calculate the damage done by attacking unit
		//for now, just return default damage from attack table
		return attackingUnitStats.attackTable[defendingUnit.type];
	}

	/*
	* Returns amount of damage done by attacking unit to defending unit during counterattack
	* @param attackingUnit - unit instance attacking
	* @param defendingUnit - unit instance being attacked
	* @param attackingTerrain - terrain instance the unit attacking is standing on
	* @param defendingTerrain - terrain instance the unit defending is standing on
	* @param - unitStatsArray - array of unit stats, cross-indexed to unit.type
	* @param - terrainStatsArray - array of terrain stats, cross-indexed to terrain.type
	* @returns - positive integer or 0 representing the amount of damage attackingUnit deals to defendingUnit from counterattack
	*/
	function damageForCounterattack(attackingUnit, defendingUnit, attackingTerrain, defendingTerrain, unitStatsArray, terrainStatsArray){
		//TODO: calculate damage done for counter attack
		//for now just return percentage of attack damage
		return Math.floor(damageForAttack(attackingUnit, defendingUnit, attackingTerrain, defendingTerrain, unitStatsArray, terrainStatsArray) * 0.5);
	}
	

	//exported functions and variables
	return {
		damageForAttack: damageForAttack,
		damageForCounterattack: damageForCounterattack
	};
    
})();