/*
 * Module for AI Player
 */
var app = app || {};
app.ai = (function(util, pathfinder, unitStats, terrainStats){
	var AI_ACTION_TYPES = {
		END_TURN: 0,
		MOVE_UNIT: 1,
		ATTACK_UNIT: 2
	};

	function aiActionEndTurn(){
		return {actionType: AI_ACTION_TYPES.END_TURN};
	}

	function aiActionMoveUnit(startingCoordinate, endingCoordinate){
		return {
			actionType: AI_ACTION_TYPES.MOVE_UNIT,
			startingCoordinate: startingCoordinate,
			endingCoordinate: endingCoordinate
		}
	}

	function aiActionAttackUnit(startingCoordinate, endingCoordinate, attackedUnitCoordinate){
		return {
			actionType: AI_ACTION_TYPES.ATTACK_UNIT,
			startingCoordinate: startingCoordinate,
			endingCoordinate: endingCoordinate,
			attackedUnitCoordinate: attackedUnitCoordinate
		}
	}

	function aiAction(gameboard, unitStatsArray, terrainStatsArray){
		return randomAiAction(gameboard, unitStatsArray, terrainStatsArray);
	}

	//example function, picks random AI action
	function randomAiAction(gameboard, unitStatsArray, terrainStatsArray){
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
					//pick random ending coordinate
					var endingCoordinate = movementCoordinates[Math.floor(Math.random() * movementCoordinates.length)];
					return aiActionMoveUnit(startingCoordinate, endingCoordinate);
				}
			}
		}
		return aiActionEndTurn();
	}
	

    //exported functions
    return {
    	ACTION_TYPES: AI_ACTION_TYPES,
    	aiAction: aiAction
    };
})(app.util, app.pathfinder, app.unitStats, app.terrainStats);