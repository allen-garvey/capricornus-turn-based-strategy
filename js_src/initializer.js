"use strict";
/*
 * Logic to start game when all assets are loaded
 */
(function(start, util, levelStats, menu, levelLoader, mixer, audioStats){
	var levelStatsArray = levelStats.get();
	var levelUnitDatas = levelStatsArray.map(function(){ return [null, null]; });
	var levelTerrainDatas = [];
	var audioStatsArray = audioStats.get();
	var cursorAudioKeys = ['select', 'deselect'];
	var levelAudioKeys = ['passed', 'failed'];

	var imageSprites = document.querySelectorAll('img.spritesheet');

	//3 * levelStats array, since each level has a 2 unit files and 1 terrain file to download
	//3 * audioStats unit array, since each unit has 3 sound effects files
	var assetsLeftToLoad = imageSprites.length + (3 * levelStatsArray.length) + (3 * audioStatsArray.units.length) + cursorAudioKeys.length + levelAudioKeys.length + audioStatsArray.music.length;

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
		menu.initializeMainMenu(levelStatsArray, audioStatsArray, start);
		menu.displayMainMenu();

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
		level.dataUnitsUrls.forEach(function(dataUnitUrl, innerIndex){
			util.getJson(dataUnitUrl, function(json){
				levelUnitDatas[index][innerIndex] = json;
				assetDidLoad();
			});
		});

		//terrain data
		util.getJson(level.dataTerrainUrl, function(json){
			levelTerrainDatas[index] = json;
			assetDidLoad();
		});
	});

	audioStatsArray.units.forEach(function(unitSound){
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
	cursorAudioKeys.forEach(function(cursorAudioKey){
		var cursorItem = audioStatsArray.cursor[cursorAudioKey];
		mixer.getAudioBuffer(cursorItem.url, function(buffer){
			cursorItem.audio = buffer;
			assetDidLoad();
		});
	});
	levelAudioKeys.forEach(function(levelAudioKey){
		var levelItem = audioStatsArray.level[levelAudioKey];
		mixer.getAudioBuffer(levelItem.url, function(buffer){
			levelItem.audio = buffer;
			assetDidLoad();
		});
	});
	audioStatsArray.music.forEach(function(musicInfo){
		mixer.getAudioBuffer(musicInfo.url, function(buffer){
			musicInfo.audio = buffer;
			assetDidLoad();
		});
	});

})(app.game.start, app.util, app.levelStats, app.menu, app.levelLoader, app.mixer, app.audioStats);