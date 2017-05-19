"use strict";
/*
 * Logic to start game when all assets are loaded
 */
(function(start, util, levelStats, saveGameController){
	var levelStatsArray = levelStats.get();
	var levelUnitDatas = [];
	var levelTerrainDatas = [];

	var imageSprites = document.querySelectorAll('img.spritesheet');

	var assetsLeftToLoad = imageSprites.length + (2 * levelStatsArray.length);

	//called after a single asset loads
	function assetDidLoad(){
		assetsLeftToLoad--;
		if(assetsLeftToLoad == 0){
			allAssetsFinishedLoading();
		}
	}

	//called when all assets are loaded
	function allAssetsFinishedLoading(){
		initializeLevelData();
		document.documentElement.classList.remove('loading');

	}

	function initializeLevelData(){
		levelStatsArray.forEach(function(item, index){
			//load unit level data into the level stats
			if(levelUnitDatas[index]){
				item.dataUnits = levelUnitDatas[index];
			}
			//load terrain level data into the level stats
			if(levelTerrainDatas[index]){
				item.dataTerrain = levelTerrainDatas[index];
			}
		});
	}

	//don't start game until all images are loaded
	util.forEach(imageSprites, function(sprite){
		if(sprite.complete){
			assetDidLoad();
		}
		else{
			sprite.onload = function(){
				assetDidLoad();
			};
		}
	});

	levelStatsArray.forEach(function(level, index){
		util.getJson(level.dataUnitsUrl, function(json){
			levelUnitDatas[index] = json;
			assetDidLoad();
		});

		util.getJson(level.dataTerrainUrl, function(json){
			levelTerrainDatas[index] = json;
			assetDidLoad();
		});


	});


	/*
	 * Add load game menu item if there are games to load
	 */
	(function(){
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
  			var listItem = document.createElement('li');
  			listItem.textContent = savedGame.name + ' - Level ' + savedGame.gameMetadata.levelIndex + ' - ' + savedGame.formattedDate;
  			listItem.onclick = function(){
  				var fullSavedGame = saveGameController.getSave(savedGame.id);
  				document.documentElement.classList.remove('load-game-menu');
  				start(levelStatsArray, null, fullSavedGame);
  			};

  			loadGameListItems.appendChild(listItem);
  		});
  		loadGamelist.appendChild(loadGameListItems);
  		
  		loadGameMenuItem.onclick = function(){
  			document.documentElement.classList.remove('main-menu');
  			document.documentElement.classList.add('load-game-menu');
  		};





	})();

	/*
	 * Add options to select a level to main-menu-list
	 */
	(function(){
		function startLevel(levelIndex){
			document.documentElement.classList.remove('main-menu');
			start(levelStatsArray, levelIndex);
		}


		var mainMenuList = document.getElementById('main-menu-list');
		var listItems = document.createDocumentFragment();

		levelStatsArray.forEach(function(level, index){
			var menuItem = document.createElement('li');
			menuItem.textContent = level.name;
			menuItem.onclick = function(){
				startLevel(index);
			};
			listItems.appendChild(menuItem);
		});
		mainMenuList.appendChild(listItems);

		document.getElementById('menu_option_random').onclick = function(){
			startLevel(-1);
		};
	})();

})(app.game.start, app.util, app.levelStats, app.saveGame);