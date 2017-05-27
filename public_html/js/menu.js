"use strict";
/*
 * Functionality for main menu and load game menu
 */
var app = app || {};

app.menu = (function(util, levelStats, saveGameController, templater, modal, ai){
	var SHOW_DEBUG_MENUS = true;

	/*
	 * shared menu initialization functionality
	 */
	(function(){
		//add onclick listeners for back to main menu buttons
	    util.forEach(document.querySelectorAll('[data-button-target="main-menu"]'), function(backToMainMenuButton, index){
	    	backToMainMenuButton.onclick = function(){
	    		displayMainMenu();
	    	};
	    	
	    });
	})();

	function displayMainMenu(){
		//hide or show load game button based on whether there are saved games
		var savedGames = saveGameController.getSaves();
		if(!savedGames || savedGames.length <= 0){
			document.getElementById('menu_option_load_game').style.display = 'none';
		}
		else{
			document.getElementById('menu_option_load_game').style.display = '';
		}

		document.documentElement.classList.remove('load-game-menu');
		document.documentElement.classList.remove('difficulty-menu');
		document.documentElement.classList.add('main-menu');
	}

	function displayLoadGameMenu(){
		document.documentElement.classList.remove('main-menu');
		document.documentElement.classList.remove('difficulty-menu');
  		document.documentElement.classList.add('load-game-menu');
	}

	/**
	* shows difficulty level menu, once an option is clicked the game will start
	* @param levelStatsArray - array from level-stats module with data preloaded
	* @param audioStatsArray - array from audio-stats module with data preloaded
	* @param levelIndex - int - index in level stats array for level to be started (or -1 for random setup)
	* @param startGameFunc - function used to start the game (app.game.start)
	*/
	function showDifficultyLevelMenu(levelStatsArray, audioStatsArray, levelIndex, startGameFunc){
		function startLevel(difficultyLevel){
			document.documentElement.classList.remove('difficulty-menu');
			startGameFunc(levelStatsArray, audioStatsArray, levelIndex, difficultyLevel);
		}
		var easyDifficultyButton = document.getElementById('difficulty-level-button-easy');
		var hardDifficultyButton = document.getElementById('difficulty-level-button-hard');

		easyDifficultyButton.onclick = function(){
			startLevel(ai.DIFFICULTY_LEVELS.EASY);
		};
		hardDifficultyButton.onclick = function(){
			startLevel(ai.DIFFICULTY_LEVELS.HARD);
		};
		document.documentElement.classList.remove('load-game-menu');
	    document.documentElement.classList.remove('main-menu');
		document.documentElement.classList.add('difficulty-menu');
	}

	/*
	 * Add load game menu item if there are games to load
	 * @param levelStatsArray - array from level-stats module with data preloaded
	 * @param audioStatsArray - array from audio-stats module with data preloaded
	 * @param startGameFunc - function used to start the game (app.game.start)
	 */
	function initializeLoadgameMenu(levelStatsArray, audioStatsArray, startGameFunc){
	  	var savedGames = saveGameController.getSaves();

  		var loadGamelist = document.getElementById('load-game-list');
  		//clear the list
  		loadGamelist.innerHTML = '';

  		//don't do anything else (leave list blank) if no saved games
	  	if(!savedGames || savedGames.length === 0){
	  		return;
	  	}

  		var loadGameListItems = document.createDocumentFragment();
  		savedGames.forEach(function(savedGame){
  			var listItem = templater.createElement('li');
  			
  			//button with information about saved game - click to load it
  			var saveGameContainer = templater.createElement('div', null, 'menu-item');
  			var saveGameNameContainer = templater.createElement('div', savedGame.name);
  			var saveGameInfoContainer = templater.createElement('div', levelStatsArray[savedGame.gameMetadata.levelIndex].name + ' - ' + savedGame.formattedDate, 'save-game-info');
  			var saveGameDifficultyContainer = templater.createElement('div', 'Turn: ' + (savedGame.gameMetadata.turnNum + 1) + ' Difficulty: ' + (savedGame.gameMetadata.difficultyLevel === ai.DIFFICULTY_LEVELS.HARD ? 'Hard' : 'Easy'), 'save-game-info');
  			saveGameContainer.appendChild(saveGameNameContainer);
  			saveGameContainer.appendChild(saveGameInfoContainer);
  			saveGameContainer.appendChild(saveGameDifficultyContainer);

  			//button to delete saved game
  			var deleteButton = templater.createElement('div', 'Delete', 'menu-item menu-item-danger');

  			saveGameContainer.onclick = function(){
  				var fullSavedGame = saveGameController.getSave(savedGame.id);
  				document.documentElement.classList.remove('load-game-menu');
  				startGameFunc(levelStatsArray, audioStatsArray, null, null, fullSavedGame);
  			};

  			deleteButton.onclick = function(){
  				modal.confirm('Are you sure you want to delete ' + savedGame.name + '?', function(){
  					listItem.remove();
  					saveGameController.deleteSave(savedGame.id);
  				});
  			};

  			listItem.appendChild(saveGameContainer);
  			listItem.appendChild(deleteButton);

  			loadGameListItems.appendChild(listItem);
  		});
  		loadGamelist.appendChild(loadGameListItems);
	}

	/*
	 * Creates main menu, and adds options to select each level
	 * @param levelStatsArray - array from level-stats module with data preloaded
	 * @param audioStatsArray - array from audio-stats module with data preloaded
	 * @param startGameFunc - function used to start the game (app.game.start)
	 */
	function initializeMainMenu(levelStatsArray, audioStatsArray, startGameFunc){
		//listeners for new game and load game button
		document.getElementById('menu_option_new_game').onclick = function(){
			showDifficultyLevelMenu(levelStatsArray, audioStatsArray, 0, startGameFunc);
		};

		document.getElementById('menu_option_load_game').onclick = function(){
			//initialize the load game menu each time button clicked, so that the list of saved games is always current
  			initializeLoadgameMenu(levelStatsArray, audioStatsArray, startGameFunc);
  			displayLoadGameMenu();
  		};

		//code to create debug menu options below
		if(!SHOW_DEBUG_MENUS){
			return;
		}

		var mainMenuList = document.getElementById('main-menu-list');
		var listItems = document.createDocumentFragment();

		//add option for random setup
		var randomSetupMenuOption = templater.createElement('li', 'Random Setup');
		randomSetupMenuOption.onclick = function(){
			showDifficultyLevelMenu(levelStatsArray, audioStatsArray, -1, startGameFunc);
		};
		listItems.appendChild(randomSetupMenuOption);

		//add options to start each individual level
		levelStatsArray.forEach(function(level, index){
			var menuItem = templater.createElement('li', level.name);
			menuItem.onclick = function(){
				showDifficultyLevelMenu(levelStatsArray, audioStatsArray, index, startGameFunc);
			};
			listItems.appendChild(menuItem);
		});
		mainMenuList.appendChild(listItems);		
	}
	

	//exported functions and variables
	return {
		initializeMainMenu: initializeMainMenu,
		displayMainMenu: displayMainMenu
	};
    
})(app.util, app.levelStats, app.saveGame, app.templater, app.modal, app.ai);
