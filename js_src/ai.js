"use strict";
/*
 * Module for AI Player
 */

 import pathfinder from './pathfinding.js';
 import unitStats from './ui-stats.js';
 import damageCalculator from './damage.js';


//Constants for types of AI actions
var AI_ACTION_TYPES = {
	END_TURN: 0,
	MOVE_UNIT: 1,
	ATTACK_UNIT: 2
};

//constants for AI difficulty levels
var AI_DIFFICULTY_LEVELS = {
	EASY: 0,
	HARD: 1
};

//used for when AI is done with its turn
function aiActionEndTurn(){
	return {actionType: AI_ACTION_TYPES.END_TURN};
}

//Constants for optimization
var HealthRatioForAdvantage = 0.8;

/*
	* Used for when AI wants to move a unit
	* use as return value for aiAction function
	* Note that no error checking is done that the startingCoordinate contains a unit, or that it is an AI unit 
	* and no checking is done that the ending coordinate is valid
	* @param startingCoordinate - starting coordinate {x, y} of the unit
	* @param endingCoordinate - ending coordinate {x, y} of the unit
	* @param - memoizationObject - an empty object at the start of a turn, use to persist data within a turn
	* @returns AI action 
	*/
function aiActionMoveUnit(startingCoordinate, endingCoordinate, memoizationObject){
	return {
		actionType: AI_ACTION_TYPES.MOVE_UNIT,
		startingCoordinate: startingCoordinate,
		endingCoordinate: endingCoordinate,
		memoizationObject: memoizationObject
	};
}

/*
	* Used for when AI wants to attack a unit
	* use as return value for aiAction function
	* Note that no error checking is done that the startingCoordinate contains a unit, or that it is an AI unit 
	* and no checking is done that the ending coordinate is valid
	* and no checking is done that attackedUnitCoordinate contains a player unit that can be attacked
	* @param startingCoordinate - starting coordinate {x, y} of the unit
	* @param endingCoordinate - ending coordinate {x, y} of the unit
	* @param attackedUnitCoordinate - coordinate of the unit to be attacked once the unit reaches its endingCoordinate (not implemented at the moment)
	* @param - memoizationObject - an empty object at the start of a turn, use to persist data within a turn
	* @returns AI action 
	*/
function aiActionAttackUnit(startingCoordinate, endingCoordinate, attackedUnitCoordinate, memoizationObject){
	return {
		actionType: AI_ACTION_TYPES.ATTACK_UNIT,
		startingCoordinate: startingCoordinate,
		endingCoordinate: endingCoordinate,
		attackedUnitCoordinate: attackedUnitCoordinate,
		memoizationObject: memoizationObject
	}
}

/*
* Used to get a single AI action
* 
* no error checking is done that the AI move is valid, so for instance when
* moving a unit, use pathfinder.movementCoordinatesFor() to find valid movementCoordinates
* @param gamboard - 2 dimensional array of units and terrain
* @param - unitStatsArray - array of unit stats, cross-indexed to unit.type
* @param - terrainStatsArray - array of terrain stats, cross-indexed to terrain.type
* @param - difficultyLevel - value of AI_DIFFICULTY_LEVELS constant
* @param - memoizationObject - an empty object at the start of a turn, persists between ai actions in a turn
* @returns either aiActionAttackUnit(), aiActionMoveUnit(), or aiActionEndTurn()
*/
function aiAction(gameboard, unitStatsArray, terrainStatsArray, difficultyLevel, memoizationObject){
	return  aiMain(gameboard, unitStatsArray, terrainStatsArray, difficultyLevel, memoizationObject);
	//return randomAiAction(gameboard, unitStatsArray, terrainStatsArray, difficultyLevel, memoizationObject);
}

/*
* Entry point for AI swithches between strategies based on the current game conditions and difficulty selected
*/
function aiMain(gameboard, unitStatsArray, terrainStatsArray, difficultyLevel, memoizationObject){
	//parse map
	var friendlyUnits = [];
	var enemyUnits = [];
	var unitsCanAttack = 0;
	
	if (memoizationObject !== null && memoizationObject.doneMoving === undefined){
		memoizationObject.doneMoving = false;
	}
	
	for (var i = 0; i < gameboard.length; i++)
	{
		for (var j = 0; j < gameboard[i].length; j++)
		{
			if(gameboard[i][j].unit !== null)
			{
				if(gameboard[i][j].unit.team === unitStats.TEAMS.PLAYER)
				{
					enemyUnits.push({x: i, y: j, unit: gameboard[i][j].unit, 
					moves: pathfinder.movementCoordinatesFor({x: i, y: j}, gameboard, unitStatsArray, terrainStatsArray)});
				}
				if(gameboard[i][j].unit.team === unitStats.TEAMS.AI)
				{
					friendlyUnits.push({x: i, y: j, unit: gameboard[i][j].unit, 
					moves: pathfinder.movementCoordinatesFor({x: i, y: j}, gameboard, unitStatsArray, terrainStatsArray)});
				}
			}
		}
	}
	//console.log(totalHealth(enemyUnits));
	if (memoizationObject !== null && memoizationObject.EnemyCentroid === undefined){
		memoizationObject.EnemyCentroid = getUnitCentroid(enemyUnits);
	}
	if (memoizationObject !== null && memoizationObject.AICentroid === undefined){
		memoizationObject.AICentroid = getUnitCentroid(friendlyUnits);
		//console.log(memoizationObject.AICentroid);
	}
	
	// var nearCover = getNearestCover(gameboard, unitStatsArray, terrainStatsArray, memoizationObject.AICentroid);
	// var defensiveObject = getDeffensiveShape(gameboard, unitStatsArray, terrainStatsArray, nearCover);
	// console.log(defensiveObject);
	// var defenseEdge = getDefenseEdgeNearCentroid(memoizationObject.EnemyCentroid, defensiveObject);
	// console.log(defenseEdge);
	
	//Determine how many units can attack
	if (memoizationObject !== null && memoizationObject.UnitsCanAttack === undefined){
		for (var ixx = 0; ixx < friendlyUnits.length; ixx++)
		{
			if(friendlyUnits[ixx].unit.canMove)
			{
				if(pathfinder.attackCoordinatesFor(friendlyUnits[ixx], gameboard, unitStatsArray, terrainStatsArray).length > 0){
					unitsCanAttack++;
				}
			}
		}
	}
	else{
		unitsCanAttack = memoizationObject.UnitsCanAttack;
	}
	memoizationObject.UnitsCanAttack = unitsCanAttack;
	
	//find Next unit that can  move for Chase strategy and check to see if there is a moveable unit
	var unitToMove = null;
	for (var ixx = 0; ixx < friendlyUnits.length; ixx++)
	{
		if(friendlyUnits[ixx].unit.canMove)
		{
			unitToMove = friendlyUnits[ixx];
			break;
		}
	}
	
	if(unitToMove === null)
	{
		return aiActionEndTurn();
	}
	
	//decide on strategy
	
	//determine if AI should attack or hold
	var canAttack = numberThatCanAttack(gameboard, unitStatsArray, terrainStatsArray, memoizationObject, friendlyUnits, enemyUnits);
	if (canAttack >= 1 || friendlyUnits.length === 1)
	{
		return attackOptimize(gameboard, unitStatsArray, terrainStatsArray, difficultyLevel, memoizationObject, friendlyUnits, enemyUnits, canAttack);
	}
	var attackCoordinates = pathfinder.attackCoordinatesFor(unitToMove, gameboard, unitStatsArray, terrainStatsArray);
	// console.log(attackCoordinates);
	//easy default to attack if only one AI unit can attack
	if(attackCoordinates.length > 0 && difficultyLevel === 0){
		// console.log("In Attack");
		var movementCoordinates = pathfinder.movementCoordinatesFor(unitToMove, gameboard, unitStatsArray, terrainStatsArray);
		var attackCoordinate = attackCoordinates[Math.floor(Math.random() * attackCoordinates.length)];
		//find ending coordinate for attack coordinate
		//add the starting coordinate, since it is not already in movementCoordinates
		movementCoordinates.push(unitToMove);
		var endingCoordinates = pathfinder.movementCoordinatesForAttackCoordinate(attackCoordinate, movementCoordinates);
		var endingCoordinate = endingCoordinates[Math.floor(Math.random() * endingCoordinates.length)];
		return aiActionAttackUnit(unitToMove, endingCoordinate, attackCoordinate, memoizationObject);
	}
	//console.log(difficultyLevel);
	
	//If hard
	if(difficultyLevel === 1){
		return groupAndFortify(gameboard, unitStatsArray, terrainStatsArray, difficultyLevel, memoizationObject, friendlyUnits, enemyUnits);
	}
	
	//default to chase
	// console.log("In Chase");
	return blitz(gameboard, unitStatsArray, terrainStatsArray, difficultyLevel, memoizationObject, unitToMove, enemyUnits);
	//return move for one unit
}


/*
* Optimizes attack to minimal kill then max damage, then min damage taken after 
*/
function attackOptimize(gameboard, unitStatsArray, terrainStatsArray, difficultyLevel, memoizationObject, AIUnits, enemyUnits, canAttack){
	
	//cautious attack
	if (canAttack === 1 && AIUnits.length > 1)
	{
		if(difficultyLevel === 1){
			return groupAndFortify(gameboard, unitStatsArray, terrainStatsArray, difficultyLevel, memoizationObject, AIUnits, enemyUnits);
		}
		else
		{
			var unitToMove = null;
			for (var ixx = 0; ixx < AIUnits.length; ixx++)
			{
				if(AIUnits[ixx].unit.canMove)
				{
					unitToMove = AIUnits[ixx];
					break;
				}
			}
			if(unitToMove === null)
			{
				return aiActionEndTurn();
			}
			
			var attackCoordinates = pathfinder.attackCoordinatesFor(unitToMove, gameboard, unitStatsArray, terrainStatsArray);
			// console.log(attackCoordinates);
			if(attackCoordinates.length > 0){
				// console.log("In Attack");
				var movementCoordinates = pathfinder.movementCoordinatesFor(unitToMove, gameboard, unitStatsArray, terrainStatsArray);
				var attackCoordinate = attackCoordinates[Math.floor(Math.random() * attackCoordinates.length)];
				//find ending coordinate for attack coordinate
				//add the starting coordinate, since it is not already in movementCoordinates
				movementCoordinates.push(unitToMove);
				var endingCoordinates = pathfinder.movementCoordinatesForAttackCoordinate(attackCoordinate, movementCoordinates);
				var endingCoordinate = endingCoordinates[Math.floor(Math.random() * endingCoordinates.length)];
				return aiActionAttackUnit(unitToMove, endingCoordinate, attackCoordinate, memoizationObject);
			}
			return blitz(gameboard, unitStatsArray, terrainStatsArray, difficultyLevel, memoizationObject, unitToMove, enemyUnits);
		}
	}
	else
	{
		var action = getBestTarget(gameboard, unitStatsArray, terrainStatsArray, difficultyLevel, memoizationObject, AIUnits, enemyUnits);
		//console.log(action);
		return action;
	}
}

/*
* Determines the best target to attack by optimizing in a greedy way
* minimal kill, then max damage, then min damage taken after 
*/
function getBestTarget(gameboard, unitStatsArray, terrainStatsArray, difficultyLevel, memoizationObject, AIUnits, enemyUnits){
	var bestUnit = null;
	var bestWeight = 0;
	var attackFrom = null;
	var attack = null;
	for(var ixx = 0; ixx < AIUnits.length; ixx++)
	{
		if(AIUnits[ixx].unit.canMove){
			var moveCoordinates = pathfinder.movementCoordinatesFor(AIUnits[ixx], gameboard, unitStatsArray, terrainStatsArray);
			var attackCoordinates = pathfinder.attackCoordinatesFor(AIUnits[ixx], gameboard, unitStatsArray, terrainStatsArray);
			moveCoordinates.push({x: AIUnits[ixx].x, y: AIUnits[ixx].y});
			
			for(var iyy = 0; iyy < attackCoordinates.length; iyy++)
			{
				var enemyHP = gameboard[attackCoordinates[iyy].x][attackCoordinates[iyy].y].unit.health;
				if(arrayContainsCoords(moveCoordinates ,attackCoordinates[iyy].x - 1, attackCoordinates[iyy].y)){
					var damageDone = damageCalculator.damageForAttack(AIUnits[ixx].unit, 
					gameboard[attackCoordinates[iyy].x][attackCoordinates[iyy].y].unit, 
					gameboard[attackCoordinates[iyy].x - 1][attackCoordinates[iyy].y].terrain, 
					gameboard[attackCoordinates[iyy].x][attackCoordinates[iyy].y].terrain, 
					unitStatsArray, terrainStatsArray);
					
					var tempWeight = 0;
					
					if(damageDone > enemyHP)
					{
						//heavy weight inversely proportional to favor minimal effort to kill
						tempWeight = 20000 / damageDone;
					}
					else
					{
						tempWeight = damageDone;
					}
					if(tempWeight > bestWeight)
					{
						bestWeight = tempWeight;
						attackFrom = {x: attackCoordinates[iyy].x - 1, y: attackCoordinates[iyy].y};
						attack = {x: attackCoordinates[iyy].x, y: attackCoordinates[iyy].y};
						bestUnit = AIUnits[ixx];
					}
				}
				if(arrayContainsCoords(moveCoordinates ,attackCoordinates[iyy].x + 1, attackCoordinates[iyy].y)){
					var damageDone = damageCalculator.damageForAttack(AIUnits[ixx].unit, 
					gameboard[attackCoordinates[iyy].x][attackCoordinates[iyy].y].unit, 
					gameboard[attackCoordinates[iyy].x + 1][attackCoordinates[iyy].y].terrain, 
					gameboard[attackCoordinates[iyy].x][attackCoordinates[iyy].y].terrain, 
					unitStatsArray, terrainStatsArray);
					
					var tempWeight = 0;
					
					if(damageDone > enemyHP)
					{
						//heavy weight inversely proportional to favor minimal effort to kill
						tempWeight = 20000 / damageDone;
					}
					else
					{
						tempWeight = damageDone;
					}
					if(tempWeight > bestWeight)
					{
						bestWeight = tempWeight;
						attackFrom = {x: attackCoordinates[iyy].x + 1, y: attackCoordinates[iyy].y};
						attack = {x: attackCoordinates[iyy].x, y: attackCoordinates[iyy].y};
						bestUnit = AIUnits[ixx];
					}
				}
				if(arrayContainsCoords(moveCoordinates ,attackCoordinates[iyy].x, attackCoordinates[iyy].y + 1)){
					var damageDone = damageCalculator.damageForAttack(AIUnits[ixx].unit, 
					gameboard[attackCoordinates[iyy].x][attackCoordinates[iyy].y].unit, 
					gameboard[attackCoordinates[iyy].x][attackCoordinates[iyy].y + 1].terrain, 
					gameboard[attackCoordinates[iyy].x][attackCoordinates[iyy].y].terrain, 
					unitStatsArray, terrainStatsArray);
					
					var tempWeight = 0;
					
					if(damageDone > enemyHP)
					{
						//heavy weight inversely proportional to favor minimal effort to kill
						tempWeight = 20000 / damageDone;
					}
					else
					{
						tempWeight = damageDone;
					}
					if(tempWeight > bestWeight)
					{
						bestWeight = tempWeight;
						attackFrom = {x: attackCoordinates[iyy].x, y: attackCoordinates[iyy].y + 1};
						attack = {x: attackCoordinates[iyy].x, y: attackCoordinates[iyy].y};
						bestUnit = AIUnits[ixx];
					}
				}
				if(arrayContainsCoords(moveCoordinates ,attackCoordinates[iyy].x, attackCoordinates[iyy].y - 1)){
					var damageDone = damageCalculator.damageForAttack(AIUnits[ixx].unit, 
					gameboard[attackCoordinates[iyy].x][attackCoordinates[iyy].y].unit, 
					gameboard[attackCoordinates[iyy].x][attackCoordinates[iyy].y - 1].terrain, 
					gameboard[attackCoordinates[iyy].x][attackCoordinates[iyy].y].terrain, 
					unitStatsArray, terrainStatsArray);
					
					var tempWeight = 0;
					
					if(damageDone > enemyHP)
					{
						//heavy weight inversely proportional to favor minimal effort to kill
						tempWeight = 20000 / damageDone;
					}
					else
					{
						tempWeight = damageDone;
					}
					if(tempWeight > bestWeight)
					{
						bestWeight = tempWeight;
						attackFrom = {x: attackCoordinates[iyy].x, y: attackCoordinates[iyy].y - 1};
						attack = {x: attackCoordinates[iyy].x, y: attackCoordinates[iyy].y};
						bestUnit = AIUnits[ixx];
					}
				}
			}
		}
	}
	
	//If no attack option exists but we are inside this function only one AI unit exists and it 
	// should advance towards the enemy
	if(bestUnit === null)
	{
		var unitToMove = null;
		for(var izz = 0; izz < AIUnits.length; izz++)
		{
			if(AIUnits[izz].unit.canMove)
			{
				unitToMove = AIUnits[izz];
			}
		}
		if(unitToMove === null)
		{
			return aiActionEndTurn();
		}
		return blitz(gameboard, unitStatsArray, terrainStatsArray, difficultyLevel, memoizationObject, unitToMove, enemyUnits);
	}
	
	//console.log(aiActionAttackUnit(bestUnit, attackFrom, attack, memoizationObject));
	return aiActionAttackUnit(bestUnit, attackFrom, attack, memoizationObject);
}

/*
* returns the number of AI units that can attack this turn
*/
function numberThatCanAttack(gameboard, unitStatsArray, terrainStatsArray, memoizationObject, AIUnits, enemyUnits){
	var count = 0;
	for (var ixx = 0; ixx < AIUnits.length; ixx++)
	{
		var attackCoordinates = pathfinder.attackCoordinatesFor(AIUnits[ixx], gameboard, unitStatsArray, terrainStatsArray);
		if(attackCoordinates.length > 0){
			count++;
		}
	}
	return count;
}

/*
* Strategy that moves the AI towards cover and aligns units along the edge near the enemy.
*/
function groupAndFortify(gameboard, unitStatsArray, terrainStatsArray, difficultyLevel, memoizationObject, AIUnits, enemyUnits)
{
	if(memoizationObject.doneMoving !== undefined && memoizationObject.doneMoving === true)
	{
		return aiActionEndTurn();
	}
	var cover = getNearestCover(gameboard, unitStatsArray, terrainStatsArray, memoizationObject.AICentroid);
	var defensiveObject = getDeffensiveShape(gameboard, unitStatsArray, terrainStatsArray, cover);
	var defenseEdge = getDefenseEdgeNearCentroid(memoizationObject.EnemyCentroid, defensiveObject);
	
	// advantageous to seek cover else was unecessary and it was determined that is was
	// advantageous to group near cover even if it couldn't be used at least for the levels as they are
	if(seekCover(AIUnits, enemyUnits) || true)
	{
		var leftLocations = {x: defenseEdge[0].x - defenseEdge[1].x, y: defenseEdge[0].y - defenseEdge[1].y};
		var rightLocations = {x: defenseEdge[defenseEdge.length - 1].x - defenseEdge[defenseEdge.length - 2].x,
		y: defenseEdge[defenseEdge.length - 1].y - defenseEdge[defenseEdge.length - 2].y};
		var firstLeft = {x: defenseEdge[0].x + leftLocations.x , y: defenseEdge[0].y + leftLocations.y};
		var firstRight = {x: defenseEdge[defenseEdge.length - 1].x + rightLocations.x , y: defenseEdge[defenseEdge.length - 1].y + rightLocations.y};
		
		
		for(var ixx = 0; ixx < AIUnits.length; ixx++)
		{
			if(AIUnits[ixx].unit.canMove)
			{
				//if infantry find cover
				if(AIUnits[ixx].unit.type === 0 || AIUnits[ixx].unit.type === 2)
				{
					if(!arrayContainsCoords(defenseEdge, AIUnits[ixx].x, AIUnits[ixx].y)){
						var targetLocation = getAvailableCoverTile(gameboard, defenseEdge);
						if(targetLocation === null)
						{
							targetLocation = getTileNearCover(gameboard, defenseEdge, leftLocations, rightLocations);
						}
						targetLocation = getPartialPathTarget(gameboard, unitStatsArray, terrainStatsArray, AIUnits[ixx], targetLocation);
						return aiActionMoveUnit(AIUnits[ixx], targetLocation, memoizationObject);
					}
				}
				//if not infantry find space near cover
				else
				{
					if(!(AIUnits[ixx].x === firstLeft.x && AIUnits[ixx].y === firstLeft.y) 
						|| (AIUnits[ixx].x === firstRight.x && AIUnits[ixx].y === firstRight.y)){
						var targetLocation = getTileNearCover(gameboard, defenseEdge, leftLocations, rightLocations);
						
						targetLocation = getPartialPathTarget(gameboard, unitStatsArray, terrainStatsArray, AIUnits[ixx], targetLocation);
						//console.log({a: targetLocation, b: firstLeft,c: firstRight});
						return aiActionMoveUnit(AIUnits[ixx], targetLocation, memoizationObject);
					}
				}
			}
		}
	}
	// advantageous to group up away from cover
	//ended up being unecessary.
	// else
	// {
		
	// }
	return aiActionEndTurn();
}


/*
* returns a tile along a multi-turn path for the AI
*/
function getPartialPathTarget(gameboard, unitStatsArray, terrainStatsArray, unit, targetLocation){
	
	var unitPathToEnemy = pathfinder.AIPathFor(unit, targetLocation, gameboard, unitStatsArray, terrainStatsArray)
	var moveTo = null;
	var izz = 0;
	var unitStats = unitStatsArray[unit.unit.type];
	while(izz < unitPathToEnemy.length && unitPathToEnemy[izz].cost <= unitStats.movementSpeed)
	{
		
		moveTo = unitPathToEnemy[izz];
		izz++
	}
	return moveTo;
}

/*
* Returns an avaialble tile in the cover object
*/
function getAvailableCoverTile(gameboard, defenseEdge)
{
	for (var ixx = 0; ixx < defenseEdge.length; ixx++)
	{
		if(gameboard[defenseEdge[ixx].x][defenseEdge[ixx].y].unit === undefined || gameboard[defenseEdge[ixx].x][defenseEdge[ixx].y].unit === null)
			return defenseEdge[ixx];
	}
	return null;
}


/*
* returns a tile on the edges of a cover aligned with the units ligning up on the cover for
* units that can't move onto cover.
*/
function getTileNearCover(gameboard, defenseEdge, leftAdd, rightAdd){
	var counter = 0;
	var nextLeft = {x: defenseEdge[0].x + leftAdd.x , y: defenseEdge[0].y + leftAdd.y};
	var nextRight = {x: defenseEdge[defenseEdge.length - 1].x + rightAdd.x , y: defenseEdge[defenseEdge.length - 1].y + rightAdd.y};
	while (counter < 20)
	{
		if(counter % 2 === 0)
		{
			if(nextLeft.x < gameboard.length && nextLeft.x >= 0
			&& nextLeft.y < gameboard[nextLeft.x].length && nextLeft.y >= 0
			&& (gameboard[nextLeft.x][nextLeft.y].unit === undefined || gameboard[nextLeft.x][nextLeft.y].unit === null))
			{
				return nextLeft;
			}
			else
			{
				nextLeft = {x: nextLeft.x + leftAdd.x , y: nextLeft.y + leftAdd.y};
			}
		}
		else
		{
			if(nextRight.x < gameboard.length && nextRight.x > 0
			&& nextRight.y < gameboard[nextRight.x].length && nextRight.y >= 0
			&& (gameboard[nextRight.x][nextRight.y].unit === undefined || gameboard[nextLeft.x][nextLeft.y].unit === null))
			{
				return nextRight;
			}
			else
			{
				nextRight = {x: nextRight.x + leftAdd.x , y: nextRight.y + leftAdd.y};
			}
		}
		counter++;
	}
	return null;
}


/*
* gets ratio of units that benefit from cover between the AI and player to decide if cover is advantageous for the AI
* ended up not being necessary since the AI strategy endedup to be to deny the player cover in hard mode by sitting on cover until 
* the player moved close enough to attack
*/
function seekCover(AIUnits, enemyUnits){
	var enemyTanks = 0;
	var AITanks = 0;
	var enemyInfantry = 0;
	var AIInfantry = 0;
	
	for(var ixx = 0; ixx < AIUnits.length; ixx++)
	{
		if(AIUnits[ixx].unit.name === "Tank")
		{
			AITanks++;
		}
		if(AIUnits[ixx].unit.name === "Infantry")
		{
			AIInfantry++;
		}
	}
	for(var ixx = 0; ixx < enemyUnits.length; ixx++)
	{
		if(enemyUnits[ixx].unit.name === "Tank")
		{
			enemyTanks++;
		}
		if(enemyUnits[ixx].unit.name === "Infantry")
		{
			enemyInfantry++;
		}
	}
	
	var enemyHealth = totalHealth(enemyUnits);
	var AIHealth = totalHealth(AIUnits);
	
	if(AIInfantry >= enemyInfantry && AIInfantry > 0)
	{
		return true;
	}
	return false;
}


/*
* chase strategy where AI unit moves towards closest player unit
* --might add move towards closest unit weak to AI unit
* --used mostly for easy AI so I left it at closest unit
*/
function blitz(gameboard, unitStatsArray, terrainStatsArray, difficultyLevel, memoizationObject, unit, enemyUnits){
	if(unit === null)
	{
		return aiActionEndTurn();
	}
	var pathsToEnemy = [];
	var minPath = new Array(300);
	for (var  ixx = 0; ixx < enemyUnits.length; ixx++)
	{
			pathsToEnemy.push(pathfinder.AIPathFor(unit, enemyUnits[ixx], gameboard, unitStatsArray, terrainStatsArray));
			if(minPath.length > pathsToEnemy[ixx].length)
			{
				minPath = pathsToEnemy[ixx];
			}
	}
	var unitPathToEnemy = minPath;
	var moveTo = null;
	var izz = 0;
	var unitStats = unitStatsArray[unit.unit.type];
	
	while(izz < unitPathToEnemy.length && unitPathToEnemy[izz].cost <= unitStats.movementSpeed)
	{
		moveTo = unitPathToEnemy[izz];
		izz++
	}
	//console.log(potentialDamageTakenOnMove(gameboard, unitStatsArray, terrainStatsArray, enemyUnits, unit, moveTo));
	return aiActionMoveUnit(unit, moveTo, memoizationObject);
}


/*
* finds the enter point for a unit array
*/
function getUnitCentroid(unitArray){
	if(unitArray !== undefined && unitArray.length > 0)
	{
		var xAvg = 0;
		var yAvg = 0;
		for (var ixx = 0; ixx < unitArray.length; ixx++)
		{
			xAvg += unitArray[ixx].x;
			yAvg += unitArray[ixx].y;
		}
		xAvg = xAvg / unitArray.length;
		yAvg = yAvg / unitArray.length;
	}
	
	return {x: toInt(xAvg), y: toInt(yAvg)};
}


/*
* finds the cover tile colsest to a unit centroid
*/
function getNearestCover(gameboard, unitStatsArray, terrainStatsArray, centroid){
	var onBoard = true;
	var coverFound = false;
	var x = centroid.x;
	var y = centroid.y;
	var coverX = 0;
	var coverY = 0;
	var counter = 1;
	//console.log(terrainStatsArray[gameboard[centroid.x][centroid.y].terrain.type].defense);
	if(terrainStatsArray[gameboard[centroid.x][centroid.y].terrain.type].defense)
	{
		return {x: centroid.x, y: centroid.y};
	}
	while( !coverFound && counter < 20)
	{
		//Sweep quadrant 1
		if( !coverFound){
			for(var iyy = 0; iyy < counter; iyy++)
			{
				if(y + iyy - counter > -1 && y + iyy - counter < gameboard[x].length && x + iyy > -1 && x + iyy < gameboard.length )
				{
					if (terrainStatsArray[gameboard[x + iyy][y + iyy - counter].terrain.type].defense)
					{
						coverFound = true;
						coverX = x + iyy;
						coverY = y + iyy - counter;
						break;
					}
				}
			}
		}
		//Sweep quadrant 4
		if( !coverFound){
			for(var ixx = 0; ixx < counter; ixx++)
			{
				if(y + ixx > -1 && y + ixx < gameboard[x].length && x - ixx + counter > -1 && x - ixx  + counter < gameboard.length )
				{
					if (terrainStatsArray[gameboard[x - ixx + counter][y + ixx].terrain.type].defense)
					{
						coverFound = true;
						coverX = x - ixx + counter;
						coverY = y + ixx;
						break;
					}
				}	
			}
		}
		//Sweep quadrant 3
		if( !coverFound){
			for(var iyy = 0; iyy < counter; iyy++)
			{
				if(y - iyy + counter > -1 && y - iyy + counter < gameboard[x].length && x - iyy > -1 && x - iyy < gameboard.length )
				{
					if (terrainStatsArray[gameboard[x - iyy][y - iyy + counter].terrain.type].defense)
					{
						coverFound = true;
						coverX = x - iyy;
						coverY = y - iyy + counter;
						break;
					}
				}	
			}
		}
		//Sweep quadrant 2
		if( !coverFound){
			for(var ixx = 0; ixx < counter; ixx++)
			{
				if(y - ixx > -1 && y - ixx < gameboard[x].length && x + ixx - counter > -1 && x + ixx - counter < gameboard.length )
				{
					if (terrainStatsArray[gameboard[x + ixx - counter][y - ixx].terrain.type].defense)
					{
						coverFound = true;
						coverX = x + ixx - counter;
						coverY = y - ixx;
						break;
					}
				}	
			}
		}
		if(coverFound)
		{
			break;
			return {x: centroid.x, y: centroid.y};
		}
		counter += 1;
	}
	return {x: coverX, y: coverY};
	
}

/*
* rounds a float to int for average positions can be conveted to an index location
*/
function toInt(n){ return Math.round(Number(n)); };	


/*
* returns all consecutive cover tiles that are apart of the defensive object in the seed location
*/
function getDeffensiveShape(gameboard, unitStatsArray, terrainStatsArray, coverLocationSeed){
	var deffensiveTerrain = [];
	deffensiveTerrain.push(coverLocationSeed);
	var ixx = 0;
	
	while (ixx < deffensiveTerrain.length && ixx < 20)
	{
		if (deffensiveTerrain[ixx].x - 1 > 0 && terrainStatsArray[gameboard[deffensiveTerrain[ixx].x - 1][deffensiveTerrain[ixx].y].terrain.type].defense)
		{
			if(!arrayContainsCoords(deffensiveTerrain, deffensiveTerrain[ixx].x - 1, deffensiveTerrain[ixx].y)){
				deffensiveTerrain.push({x: deffensiveTerrain[ixx].x - 1, y: deffensiveTerrain[ixx].y});
			}	
		}
		if (deffensiveTerrain[ixx].y + 1 < gameboard[deffensiveTerrain[ixx].x].length && terrainStatsArray[gameboard[deffensiveTerrain[ixx].x][deffensiveTerrain[ixx].y + 1].terrain.type].defense)
		{
			if(!arrayContainsCoords(deffensiveTerrain, deffensiveTerrain[ixx].x, deffensiveTerrain[ixx].y + 1)){
				deffensiveTerrain.push({x: deffensiveTerrain[ixx].x, y: deffensiveTerrain[ixx].y + 1});
			}
		}
		if (deffensiveTerrain[ixx].x + 1 < gameboard.length && terrainStatsArray[gameboard[deffensiveTerrain[ixx].x + 1][deffensiveTerrain[ixx].y].terrain.type].defense)
		{
			if(!arrayContainsCoords(deffensiveTerrain, deffensiveTerrain[ixx].x + 1, deffensiveTerrain[ixx].y)){
				deffensiveTerrain.push({x: deffensiveTerrain[ixx].x + 1, y: deffensiveTerrain[ixx].y});
			}
		}
		if (deffensiveTerrain[ixx].y - 1 > 0 && terrainStatsArray[gameboard[deffensiveTerrain[ixx].x][deffensiveTerrain[ixx].y - 1].terrain.type].defense)
		{
			if(!arrayContainsCoords(deffensiveTerrain, deffensiveTerrain[ixx].x, deffensiveTerrain[ixx].y - 1)){
				deffensiveTerrain.push({x: deffensiveTerrain[ixx].x, y: deffensiveTerrain[ixx].y - 1});
			}
		}
		ixx++;
	}
	
	//might need to arrange array to be useful
	
	return deffensiveTerrain;
}


/*
* returns the edge of the defensive object that is towards the enemy centroid
*/
function getDefenseEdgeNearCentroid(centroid, defensiveObject){
	
	var closestTile = {x: 100, y: 100};
	var distanceToTile = closestTile.x * closestTile.x + closestTile.y * closestTile.y;
	for(var ixx = 0; ixx < defensiveObject.length; ixx++)
	{
		var tempDistance = (defensiveObject[ixx].x - centroid.x) * (defensiveObject[ixx].x - centroid.x) 
			+ (defensiveObject[ixx].y - centroid.y) * (defensiveObject[ixx].y - centroid.y);
		if(tempDistance <  distanceToTile)
		{
			closestTile = defensiveObject[ixx];
			distanceToTile = tempDistance;
		}
	}
	
	var hasUp = arrayContainsCoords(defensiveObject, closestTile.x, closestTile.y - 1);
	var hasDown = arrayContainsCoords(defensiveObject, closestTile.x, closestTile.y + 1);
	var hasLeft = arrayContainsCoords(defensiveObject, closestTile.x - 1, closestTile.y);
	var hasRight = arrayContainsCoords(defensiveObject, closestTile.x + 1, closestTile.y);
	
	
	//handle all 8 possible cases
	//add elements to the array in a top to bottom left to right order
	
	//does both left and right edge cases
	var currentPosition = closestTile;
	var edgeArray = [];
	// if(hasUp && hasDown)
	// {
		// edgeArray = [];
		// var upMore = true;
		// while (upMore)
		// {
			// if(arrayContainsCoords(defensiveObject, currentPosition.x, currentPosition.y - 1))
			// {
				// currentPosition = {x: currentPosition.x, y: currentPosition.y - 1};
			// }
			// else
			// {
				// upMore = false;
			// }
		// }
		
		// var moredown = true;
		// while (moredown)
		// {
			// edgeArray.push(currentPosition);
			// currentPosition = {x: currentPosition.x, y: currentPosition.y + 1};
			// if(!arrayContainsCoords(defensiveObject, currentPosition.x, currentPosition.y))
			// {
				// moredown = false;
			// }
		// }
	// }
	//does both top and bottom edge cases
	// if(hasLeft && hasRight)
	// {
		// edgeArray = [];
		// var leftMore = true;
		// while (leftMore)
		// {
			// if(arrayContainsCoords(defensiveObject, currentPosition.x - 1, currentPosition.y))
			// {
				// currentPosition = {x: currentPosition.x - 1, y: currentPosition.y};
			// }
			// else
			// {
				// leftMore = false;
			// }
		// }
		
		// var moreRight = true;
		// while (moreRight)
		// {
			// edgeArray.push(currentPosition);
			// currentPosition = {x: currentPosition.x + 1, y: currentPosition.y};
			// if(!arrayContainsCoords(defensiveObject, currentPosition.x, currentPosition.y))
			// {
				// moreRight = false;
			// }
		// }
	// }
	//top left vertex case
	if(hasDown && hasRight)
	{
		edgeArray = [];
		var downMore = true;
		while (downMore)
		{
			if(arrayContainsCoords(defensiveObject, currentPosition.x, currentPosition.y + 1))
			{
				currentPosition = {x: currentPosition.x, y: currentPosition.y + 1};
			}
			else
			{
				downMore = false;
			}
		}
		
		var moreUp = true;
		while (moreUp)
		{
			edgeArray.push(currentPosition);
			currentPosition = {x: currentPosition.x, y: currentPosition.y - 1};
			if(!arrayContainsCoords(defensiveObject, currentPosition.x, currentPosition.y))
			{
				moreUp = false;
			}
		}
		currentPosition = {x: currentPosition.x + 1, y: currentPosition.y + 1};
		var moreRight = true;
		while (moreRight)
		{
			edgeArray.push(currentPosition);
			currentPosition = {x: currentPosition.x + 1, y: currentPosition.y};
			if(!arrayContainsCoords(defensiveObject, currentPosition.x, currentPosition.y))
			{
				moreRight = false;
			}
		}
	}
	//top right vertex case
	if(hasDown && hasLeft)
	{
		edgeArray = [];
		var downMore = true;
		while (downMore)
		{
			if(arrayContainsCoords(defensiveObject, currentPosition.x, currentPosition.y + 1))
			{
				currentPosition = {x: currentPosition.x, y: currentPosition.y + 1};
			}
			else
			{
				downMore = false;
			}
		}
		
		var moreUp = true;
		while (moreUp)
		{
			edgeArray.push(currentPosition);
			currentPosition = {x: currentPosition.x, y: currentPosition.y - 1};
			if(!arrayContainsCoords(defensiveObject, currentPosition.x, currentPosition.y))
			{
				moreUp = false;
			}
		}
		currentPosition = {x: currentPosition.x - 1, y: currentPosition.y + 1};
		var moreLeft = true;
		while (moreLeft)
		{
			edgeArray.push(currentPosition);
			currentPosition = {x: currentPosition.x - 1, y: currentPosition.y};
			if(!arrayContainsCoords(defensiveObject, currentPosition.x, currentPosition.y))
			{
				moreLeft = false;
			}
		}
	}
	//bottom left vertex case
	if(hasUp && hasRight)
	{
		edgeArray = [];
		var upMore = true;
		while (upMore)
		{
			if(arrayContainsCoords(defensiveObject, currentPosition.x, currentPosition.y - 1))
			{
				currentPosition = {x: currentPosition.x, y: currentPosition.y - 1};
			}
			else
			{
				upMore = false;
			}
		}
		
		var moreDown = true;
		while (moreDown)
		{
			edgeArray.push(currentPosition);
			currentPosition = {x: currentPosition.x, y: currentPosition.y + 1};
			if(!arrayContainsCoords(defensiveObject, currentPosition.x, currentPosition.y))
			{
				moreDown = false;
			}
		}
		currentPosition = {x: currentPosition.x + 1, y: currentPosition.y - 1};
		var moreRight = true;
		while (moreRight)
		{
			edgeArray.push(currentPosition);
			currentPosition = {x: currentPosition.x + 1, y: currentPosition.y};
			if(!arrayContainsCoords(defensiveObject, currentPosition.x, currentPosition.y))
			{
				moreRight = false;
			}
		}
	}
	//bottom right vertex case
	if(hasUp && hasLeft)
	{
		edgeArray = [];
		var upMore = true;
		while (upMore)
		{
			if(arrayContainsCoords(defensiveObject, currentPosition.x, currentPosition.y - 1))
			{
				currentPosition = {x: currentPosition.x, y: currentPosition.y - 1};
			}
			else
			{
				upMore = false;
			}
		}
		
		var moreDown = true;
		while (moreDown)
		{
			edgeArray.push(currentPosition);
			currentPosition = {x: currentPosition.x, y: currentPosition.y + 1};
			if(!arrayContainsCoords(defensiveObject, currentPosition.x, currentPosition.y))
			{
				moreDown = false;
			}
		}
		currentPosition = {x: currentPosition.x - 1, y: currentPosition.y - 1};
		var moreLeft = true;
		while (moreLeft)
		{
			edgeArray.push(currentPosition);
			currentPosition = {x: currentPosition.x - 1, y: currentPosition.y};
			if(!arrayContainsCoords(defensiveObject, currentPosition.x, currentPosition.y))
			{
				moreLeft = false;
			}
		}
	}
	
	//does both left and right edge cases
	var currentPosition = closestTile;
	if(hasUp && hasDown)
	{
		edgeArray = [];
		var upMore = true;
		while (upMore)
		{
			if(arrayContainsCoords(defensiveObject, currentPosition.x, currentPosition.y - 1))
			{
				currentPosition = {x: currentPosition.x, y: currentPosition.y - 1};
			}
			else
			{
				upMore = false;
			}
		}
		
		var moredown = true;
		while (moredown)
		{
			edgeArray.push(currentPosition);
			currentPosition = {x: currentPosition.x, y: currentPosition.y + 1};
			if(!arrayContainsCoords(defensiveObject, currentPosition.x, currentPosition.y))
			{
				moredown = false;
			}
		}
	}
	//does both top and bottom edge cases
	if(hasLeft && hasRight)
	{
		edgeArray = [];
		var leftMore = true;
		while (leftMore)
		{
			if(arrayContainsCoords(defensiveObject, currentPosition.x - 1, currentPosition.y))
			{
				currentPosition = {x: currentPosition.x - 1, y: currentPosition.y};
			}
			else
			{
				leftMore = false;
			}
		}
		
		var moreRight = true;
		while (moreRight)
		{
			edgeArray.push(currentPosition);
			currentPosition = {x: currentPosition.x + 1, y: currentPosition.y};
			if(!arrayContainsCoords(defensiveObject, currentPosition.x, currentPosition.y))
			{
				moreRight = false;
			}
		}
	}
	return edgeArray;
}


/*
* calcualte potential damage take on a move
*/
function potentialDamageTakenOnMove(gameboard, unitStatsArray, terrainStatsArray, enemyUnits, unit, moveLocation){
	//summation of weighted damage that unit can potentially take if a move is made
	var xPlusMaxDamage = 0;
	var xMinusMaxDamage = 0;
	var yPlusMaxDamage = 0;
	var yMinusMaxDamage = 0;
	
	var xPlusCanAttack = 0;
	var xMInusCanAttack = 0;
	var yPlusCanAttack = 0;
	var yMInusCanAttack = 0;
	
	//check x+1
	for(var ixx = 0; ixx < enemyUnits.length; ixx++)
	{
		if(arrayContainsCoords(enemyUnits[ixx].moves, moveLocation.x + 1, moveLocation.y))
		{
			var damageDone = damageCalculator.damageForAttack(enemyUnits[ixx].unit, unit.unit, gameboard[moveLocation.x + 1][moveLocation.y].terrain,
			gameboard[moveLocation.x][moveLocation.y].terrain, unitStatsArray, terrainStatsArray);
			
			xPlusCanAttack++;
			
			if(damageDone > xPlusMaxDamage)
			{
				xPlusMaxDamage = damageDone;
			}
		}
	}
	
	//check x-1
	for(var ixx = 0; ixx < enemyUnits.length; ixx++)
	{
		if(arrayContainsCoords(enemyUnits[ixx].moves, moveLocation.x - 1, moveLocation.y))
		{
			var damageDone = damageCalculator.damageForAttack(enemyUnits[ixx].unit, unit.unit, gameboard[moveLocation.x - 1][moveLocation.y].terrain,
			gameboard[moveLocation.x][moveLocation.y].terrain, unitStatsArray, terrainStatsArray);
			
			xMInusCanAttack++;
			
			if(damageDone > xPlusMaxDamage)
			{
				xMinusMaxDamage = damageDone;
			}
		}
	}
	
	//check y+1
	for(var ixx = 0; ixx < enemyUnits.length; ixx++)
	{
		if(arrayContainsCoords(enemyUnits[ixx].moves, moveLocation.x, moveLocation.y + 1))
		{
			var damageDone = damageCalculator.damageForAttack(enemyUnits[ixx].unit, unit.unit, gameboard[moveLocation.x][moveLocation.y + 1].terrain,
			gameboard[moveLocation.x][moveLocation.y].terrain, unitStatsArray, terrainStatsArray);
			
			yPlusCanAttack++;
			
			if(damageDone > xPlusMaxDamage)
			{
				yPlusMaxDamage = damageDone;
			}
		}
	}
	
	//check y-1
	for(var ixx = 0; ixx < enemyUnits.length; ixx++)
	{
		if(arrayContainsCoords(enemyUnits[ixx].moves, moveLocation.x, moveLocation.y - 1))
		{
			var damageDone = damageCalculator.damageForAttack(enemyUnits[ixx].unit, unit.unit, gameboard[moveLocation.x][moveLocation.y - 1].terrain,
			gameboard[moveLocation.x][moveLocation.y].terrain, unitStatsArray, terrainStatsArray);
			
			yMInusCanAttack++;
			
			if(damageDone > xPlusMaxDamage)
			{
				yMinusMaxDamage = damageDone;
			}
		}
	}
	
	var maxUnitsAttacking = 0;
	
	if(xPlusCanAttack > maxUnitsAttacking)
	{
		maxUnitsAttacking = xPlusCanAttack;
	}
	if(xMInusCanAttack > maxUnitsAttacking)
	{
		maxUnitsAttacking = xMInusCanAttack;
	}
	if(yPlusCanAttack > maxUnitsAttacking)
	{
		maxUnitsAttacking = yPlusCanAttack;
	}
	if(yMInusCanAttack > maxUnitsAttacking)
	{
		maxUnitsAttacking = yMInusCanAttack;
	}
	
	var damageTaken = 0;
	//sum up potential damage making some assumptions
	if(maxUnitsAttacking > 0)
	{
		if(maxUnitsAttacking == 1)
		{
			if(damageTaken < xPlusMaxDamage)
			{
				damageTaken = xPlusMaxDamage;
			}
			if(damageTaken < xMinusMaxDamage)
			{
				damageTaken = xMinusMaxDamage;
			}
			if(damageTaken < yPlusMaxDamage)
			{
				damageTaken = yPlusMaxDamage;
			}
			if(damageTaken < yMinusMaxDamage)
			{
				damageTaken = yMinusMaxDamage;
			}
			//damageTaken = 1;
		}
		if(maxUnitsAttacking == 2)
		{
			var tempDamage1 = 0;
			var tempDamage2 = 0;
			
			if(tempDamage2 < xPlusMaxDamage)
			{
				tempDamage2 = xPlusMaxDamage;
			}
			if(tempDamage2 < xMinusMaxDamage)
			{
				tempDamage1 = tempDamage2;
				tempDamage2 = xMinusMaxDamage;
			}
			if(tempDamage1 < yPlusMaxDamage)
			{
				if(tempDamage2 < yPlusMaxDamage)
				{
					tempDamage1 = tempDamage2;
					tempDamage2 = yPlusMaxDamage;
				}
				else
				{
					tempDamage1 = yPlusMaxDamage;
				}
			}
			if(tempDamage1 < yMinusMaxDamage)
			{
				//damageTaken = yMinusMaxDamage;
				if(tempDamage2 < yMinusMaxDamage)
				{
					tempDamage1 = tempDamage2;
					tempDamage2 = yMinusMaxDamage;
				}
				else
				{
					tempDamage1 = yMinusMaxDamage;
				}
			}
			damageTaken = tempDamage1 + tempDamage2;
			//damageTaken = 2;	
		}
		if(maxUnitsAttacking == 3)
		{
			damageTaken = xPlusMaxDamage + xMinusMaxDamage + yPlusMaxDamage + yMinusMaxDamage;
			//damageTaken = 3;
		}
		if(maxUnitsAttacking == 4)
		{
			damageTaken = xPlusMaxDamage + xMinusMaxDamage + yPlusMaxDamage + yMinusMaxDamage;
		}
	}
	return damageTaken;
}


/*
* return the total health of a team
*/
function totalHealth(unitArray){
	var health = 0;
	for(var ixx = 0; ixx < unitArray.length; ixx++)
	{
		health += unitArray[ixx].unit.health;
	}
	return health;
}

//example function, picks random AI action
function randomAiAction(gameboard, unitStatsArray, terrainStatsArray, difficultyLevel, memoizationObject){
	if(Math.random() * 100 <= 20){
		return aiActionEndTurn();
	}
	for(var i = 0; i < gameboard.length; i++){
		var innerArray = gameboard[i];
		for(var j = 0; j < innerArray.length; j++){
			//randomly decide to move a unit if it can move and is an AI unit
			if(gameboard[i][j].unit && gameboard[i][j].unit.team === unitStats.TEAMS.AI && gameboard[i][j].unit.canMove && Math.random() * 100 <= 70){
				var unit = gameboard[i][j].unit;
				var startingCoordinate = {x: i, y: j};
				var movementCoordinates = pathfinder.movementCoordinatesFor(startingCoordinate, gameboard, unitStatsArray, terrainStatsArray);
				var attackCoordinates = pathfinder.attackCoordinatesFor(startingCoordinate, gameboard, unitStatsArray, terrainStatsArray);
				//attack a unit, if possible
				if(attackCoordinates.length > 0){
					var attackCoordinate = attackCoordinates[Math.floor(Math.random() * attackCoordinates.length)];
					//find ending coordinate for attack coordinate
					//add the starting coordinate, since it is not already in movementCoordinates
					movementCoordinates.push(startingCoordinate);
					var endingCoordinates = pathfinder.movementCoordinatesForAttackCoordinate(attackCoordinate, movementCoordinates);
					var endingCoordinate = endingCoordinates[Math.floor(Math.random() * endingCoordinates.length)];
					return aiActionAttackUnit(startingCoordinate, endingCoordinate, attackCoordinate, memoizationObject);
				}
				//otherwise, just move
				else{
					//pick random ending coordinate
					var endingCoordinate = movementCoordinates[Math.floor(Math.random() * movementCoordinates.length)];
					return aiActionMoveUnit(startingCoordinate, endingCoordinate, memoizationObject);
				}
			}
		}
	}
	return aiActionEndTurn();
}

/*
* returns true if the coordinates are apart of an array
*/
function arrayContainsCoords(inArray, xCoordinate, yCoordinate){
	for (var ixx = 0; ixx < inArray.length; ixx++)
	{
		if(inArray[ixx].x == xCoordinate && inArray[ixx].y == yCoordinate){
			return true;
		}
	}
	return false;
}

export default {
	ACTION_TYPES: AI_ACTION_TYPES,
	DIFFICULTY_LEVELS: AI_DIFFICULTY_LEVELS,
	aiAction: aiAction
};