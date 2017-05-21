"use strict";
/*
 * Functionality for saving and loading games
 */
var app = app || {};

app.saveGame = (function(util){

	/**
	 * Makes a deep copy of the gameboard to prepare it to be saved, and discards unnecessary properties not needed
	 * for loading a game from it-
	 * @param gameboard - 2d array of units and terrain
	 * @returns deep copy of the gameboard with properties that don't need to be saved discarded
	 */
	function serializeGameboard(gameboard){
		var serializedGameboard = new Array(gameboard.length);

		for(var i = 0; i < gameboard.length; i++){
			var subarray = gameboard[i]; 
			serializedGameboard[i] = new Array(subarray.length);

			for(var j = 0; j < subarray.length; j++){
				serializedGameboard[i][j] = {};
				serializedGameboard[i][j].unit = util.cloneObject(gameboard[i][j].unit);
			}
		}
		return serializedGameboard;
	}

	/**
	 * Takes data from userInfo object and prepares a new object with data that needs to be saved
	 * @param userIndo - object with various game user info and meta data
	 * @returns new object with game data that needs to be saved
	 */
	function userInfoToGameMetadata(userInfo){
		var gameMetadata = {};

		gameMetadata.difficultyLevel = userInfo.difficultyLevel;
		gameMetadata.levelIndex = userInfo.levelIndex;

		return gameMetadata;
	}

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
		
		//Get timestamp for save
		var date = new Date();
		
		var year = date.getFullYear();
		var month = date.getMonth() + 1;
		if (month < 10)
			month = '0' + month;
		var day = date.getDate();
		if (day < 10)
			day = '0' + day;
		var hours = date.getHours();
		if(hours < 10)
			hours = '0' + hours;
		var minutes = date.getMinutes();
		if(minutes < 10)
			minutes = '0' + minutes;
		var seconds = date.getSeconds();
		if(seconds < 10)
			seconds = '0' + seconds;
		
		var timestamp = year + "/" + month + "/" + day + " " + hours + ":" + minutes + ":" + seconds;

		//Give unique ID
		var id;
		if(localStorage.length == 0) {
			id = 'capricornus0';
		}
		else {
			var data = JSON.parse(localStorage.getItem(localStorage.key(localStorage.length-1)));
			var prevId = data['id'].substring(11);
			var num = Number(prevId);
			num++;    
			id = 'capricornus' + num; 
		}
	
		//Assign variables
		var state = {
			id: id,
			name : name,
			gameboard : gameboard,
			gameMetadata : gameMetadata,
			formattedDate : timestamp
		};

		//Save data in localStorage
		try {
			localStorage.setItem(id, JSON.stringify(state));
			return true;
		}
		catch(exception) {
			return false;
		}
	}
	

	/*
	 * Deletes a saved game from browser localStorage
	 * @param savegameId - either int or string - whatever datatype is returned from getSaves()
	 * @returns true if saved game was found for that id and successfully deleted or false if a saved game for that
	 * id was not found, or the delete action failed
	 */
	function deleteSave(savegameId){
		
		if(localStorage.getItem(savegameId) != null)
		{
			try {
				localStorage.removeItem(savegameId);
				return true;
			}
			catch(exception) {
				return false;
			}
		}
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
		if(localStorage.getItem(savegameId) != null)
			return JSON.parse(localStorage.getItem(savegameId));
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
		var saveArr = [];
		for(var i = 0; i < localStorage.length; i++)
		{
			var data = JSON.parse(localStorage.getItem(localStorage.key(i)));
				saveArr.push({
					id: data['id'],
					name: data['name'],
					formattedDate: data['formattedDate'],
					gameMetadata: data['gameMetadata']
				});
		}
		
		//Sorts by formatted date, with most recently saved first 
		saveArr.sort(function(a,b) {
			return (a.formattedDate < b.formattedDate) - (a.formattedDate > b.formattedDate);
		});
		
				
		if(saveArr.length > 0)
			return saveArr;
		else
			return null;
	}

	//exported functions and variables
	return {
		getSaves: getSaves,
		getSave: getSave,
		deleteSave: deleteSave,
		createSave: createSave,
		serializeGameboard: serializeGameboard,
		userInfoToGameMetadata: userInfoToGameMetadata
	};
    
})(app.util);