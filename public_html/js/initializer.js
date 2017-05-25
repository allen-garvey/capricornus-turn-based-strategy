"use strict";
/*
 * Logic to start game when all assets are loaded
 */
(function(start, util, levelStats, menu, levelLoader, mixer, audioStats){
	var levelStatsArray = levelStats.get();
	var levelUnitDatas = [];
	var levelTerrainDatas = [];
	var audioStatsArray = audioStats.get();

	var imageSprites = document.querySelectorAll('img.spritesheet');

	//2 * levelStats array, since each level has a unit and terrain file to download
	var assetsLeftToLoad = imageSprites.length + (2 * levelStatsArray.length) + (3 * audioStatsArray.units.length);

	//called after a single asset loads
	function assetDidLoad(){
		assetsLeftToLoad--;
		if(assetsLeftToLoad == 0){
			allAssetsFinishedLoading();
		}
	}

	//called when all assets are loaded
	function allAssetsFinishedLoading(){
		//put unit and terrain placement data into level array
		levelLoader.initializeLevelData(levelStatsArray, levelUnitDatas, levelTerrainDatas);
		
		//create menus once levelStatArray has been loaded with data
		menu.initializeLoadgameMenu(levelStatsArray, audioStatsArray, start);
		menu.initializeMainMenu(levelStatsArray, audioStatsArray, start);

		//remove loading screen
		document.documentElement.classList.remove('loading');
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

	//download level unit placements and terrain data
	levelStatsArray.forEach(function(level, index){
		//unit placement
		util.getJson(level.dataUnitsUrl, function(json){
			levelUnitDatas[index] = json;
			assetDidLoad();
		});

		//terrain data
		util.getJson(level.dataTerrainUrl, function(json){
			levelTerrainDatas[index] = json;
			assetDidLoad();
		});
	});

	audioStatsArray.units.forEach(function(unitSound, index){
		mixer.getAudioBuffer(unitSound.moveUrl, function(buffer){
			unitSound.move = buffer;
			assetDidLoad();
		});
		mixer.getAudioBuffer(unitSound.dieUrl, function(buffer){
			unitSound.die = buffer;
			assetDidLoad();
		});
		mixer.getAudioBuffer(unitSound.attackUrl, function(buffer){
			unitSound.attack = buffer;
			assetDidLoad();
		});
	});

})(app.game.start, app.util, app.levelStats, app.menu, app.levelLoader, app.mixer, app.audioStats);