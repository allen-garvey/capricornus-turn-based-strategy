"use strict";
/*
 * Functionality for main menu and load game menu
 */
var app = app || {};

app.menu = (function(start, util, levelStats, saveGameController, templater, modal){
	/*
	 * Add load game menu item if there are games to load
	 * @param levelStatsArray - array from level-stats module with data preloaded
	 */
	function initializeLoadgameMenu(levelStatsArray){
	  	var savedGames = saveGameController.getSaves();
	  	
	  	//don't add load game option if no saved games
	  	if(!savedGames || savedGames.length === 0){
	  		return;
	  	}
	  	var mainMenuList = document.getElementById('main-menu-list');
  		var loadGameMenuItem = document.createElement('li');
  		loadGameMenuItem.textContent = 'Load Game';
  		mainMenuList.appendChild(loadGameMenuItem);


  		var loadGamelist = document.getElementById('load-game-list');
  		var loadGameListItems = document.createDocumentFragment();
  		savedGames.forEach(function(savedGame){
  			var listItem = templater.createElement('li');
  			
  			var levelButton = templater.createElement('div', savedGame.name + ' - ' + levelStatsArray[savedGame.gameMetadata.levelIndex].name + ' - ' + savedGame.formattedDate, 'menu-item');
  			var deleteButton = templater.createElement('div', 'Delete', 'menu-item menu-item-danger');

  			levelButton.onclick = function(){
  				var fullSavedGame = saveGameController.getSave(savedGame.id);
  				document.documentElement.classList.remove('load-game-menu');
  				start(levelStatsArray, null, fullSavedGame);
  			};

  			deleteButton.onclick = function(){
  				modal.confirm('Are you sure you want to delete ' + savedGame.name + '?', function(){
  					listItem.remove();
  					saveGameController.deleteSave(savedGame.id);
  				});
  			};

  			listItem.appendChild(levelButton);
  			listItem.appendChild(deleteButton);

  			loadGameListItems.appendChild(listItem);
  		});
  		loadGamelist.appendChild(loadGameListItems);
  		
  		loadGameMenuItem.onclick = function(){
  			document.documentElement.classList.remove('main-menu');
  			document.documentElement.classList.add('load-game-menu');
  		};

  		var backToMainMenuButton = document.getElementById('button-load-game-back');
  		backToMainMenuButton.onclick = function(){
  			document.documentElement.classList.remove('load-game-menu');
  			document.documentElement.classList.add('main-menu');
  		};
	}

	/*
	 * Creates main menu, and adds options to select each level
	 * @param levelStatsArray - array from level-stats module with data preloaded
	 */
	function initializeMainMenu(levelStatsArray){
		function startLevel(levelIndex){
			document.documentElement.classList.remove('main-menu');
			start(levelStatsArray, levelIndex);
		}


		var mainMenuList = document.getElementById('main-menu-list');
		var listItems = document.createDocumentFragment();

		levelStatsArray.forEach(function(level, index){
			var menuItem = templater.createElement('li', level.name);
			menuItem.onclick = function(){
				startLevel(index);
			};
			listItems.appendChild(menuItem);
		});
		mainMenuList.appendChild(listItems);

		document.getElementById('menu_option_random').onclick = function(){
			startLevel(-1);
		};
	}
	

	//exported functions and variables
	return {
		initializeLoadgameMenu: initializeLoadgameMenu,
		initializeMainMenu: initializeMainMenu
	};
    
})(app.game.start, app.util, app.levelStats, app.saveGame, app.templater, app.modal);
