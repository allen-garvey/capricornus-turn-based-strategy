"use strict";
/*
 * Functions for calculating damage done when units attack
 */
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
	//get attacking unit stats
	var attackingUnitStats = unitStatsArray[attackingUnit.type];
	//get defending unit stats
	var defendingUnitStats = unitStatsArray[defendingUnit.type];
	
	//get defending unit terrain stats
	var defendingTerrainStats = terrainStatsArray[defendingTerrain.type];
	
	var damage = attackingUnitStats.attackTable[defendingUnit.type];
	
	if(defendingUnitStats.applyDefense == true && defendingTerrainStats.defense == true)
	{	
		return Math.floor(damage * 0.5); 
	}
	else
	{
		return damage;
	}	
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
	//returns percentage of attack damage
	var counterDamage = Math.floor(damageForAttack(attackingUnit, defendingUnit, attackingTerrain, defendingTerrain, unitStatsArray, terrainStatsArray) * 0.5);
	return counterDamage;
}

export default {
	damageForAttack: damageForAttack,
	damageForCounterattack: damageForCounterattack
};
