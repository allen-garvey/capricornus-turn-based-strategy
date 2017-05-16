"use strict";
/*
 * Functionality for saving and loading games
 */
var app = app || {};

app.saveGame = (function(){

	/*
	 * Created  a saved game and save in browser localStorage
	 * @param name - string name of saved game
	 * @param gameboard - 2d array of units
	 * @param gameMetadata - object containing metadata about the game
	 * @returns false if game could not be saved, or true if game was successfully saved
	 * in addition, the function should calculate the current timestamp and save that with the game, and 
	 * generate a unique id for the save game (either a string or an int, your choice) so that the saved game
	 * can be queried
	 */
	function createSave(name, gameboard, gameMetadata){
		return false;
	}

	/*
	 * Deletes a saved game from browser localStorage
	 * @param savegameId - either int or string - whatever datatype is returned from getSaves()
	 * @returns true if saved game was found for that id and successfully deleted or false if a saved game for that
	 * id was not found, or the delete action failed
	 */
	function deleteSave(savegameId){
		return false;
	}

	/*
	 * Used to load a saved game from browser localStorage
	 * @param savegameId - either int or string - whatever datatype is returned from getSaves()
	 * @returns null if the savegameId is invalid, or a saved game matching that id is not found
	 * Otherwise returns object in format:
	 	{
	 		id: string|int - whichever you decided to use
			name: string - name of saved game
			gameMetadata: object passed into createSave
			gameboard: 2d array passed into createSave
	 	}
	 */
	function getSave(savegameId){
		return null;
	}


	/*
	 * Used to display list of saved games for the user to pick from to load or delete from browser localStorage
	 * @returns null if there are no saved games or an array of objects if there are saved games to choose from
	 * not all savedgame data about each save is required to be returned (i.e. gameboard does not need to be returned here), 
	 * since not all of it will be used
	 * objects in array should in format: 
	 	{
	 		id: string|int - whichever you decided to use
			name: string - name of saved game
			formattedDate: string - date game was saved in format MM/DD/YYYY HH:MM:SS - hours can be in 24 hour format or AM/PM - your choice 
			gameMetadata: object passed into createSave
	 	}
	 	array should be sorted in reverse order based on datetime of saved game creation, so that the newer saved games come before older saved games
	 */
	function getSaves(){
		return null;
	}

	//exported functions and variables
	return {
		getSaves: getSaves,
		getSave: getSave,
		deleteSave: deleteSave,
		createSave: createSave
	};
    
})();