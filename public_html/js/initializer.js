"use strict";
/*
 * Logic to start game when all assets are loaded
 */
(function(start, util, levelStats){
	var levelStatsArray = levelStats.get();
	var levelUnitDatas = [];
	var levelTerrainDatas = [];

	var spriteIds = ['spritesheet', 
					'level1_sprite', 
					'soldier_red_sprite', 
					'plane_red_sprite', 
					'tank_red_sprite',
					'soldier_blue_sprite', 
					'plane_blue_sprite', 
					'tank_blue_sprite'
					];
	var assetsLeftToLoad = spriteIds.length + (2 * levelStatsArray.length);

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
	spriteIds.forEach(function(spriteId){
		var sprite = document.getElementById(spriteId);
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
	 * Add options to select a level to main-menu-list
	 */
	(function(){
		function menuItemClickHandler(index){
			document.documentElement.classList.remove('show-menu');
			start(levelStatsArray, index);
		}


		var mainMenuList = document.getElementById('main-menu-list');
		var listItems = document.createDocumentFragment();

		levelStatsArray.forEach(function(level, index){
			var menuItem = document.createElement('li');
			menuItem.textContent = level.name;
			menuItem.onclick = function(){
				menuItemClickHandler(index);
			};
			listItems.appendChild(menuItem);
		});
		mainMenuList.appendChild(listItems);

		document.getElementById('menu_option_random').onclick = function(){
			menuItemClickHandler(-1);
		};	    
	})();

})(app.game.start, app.util, app.levelStats);