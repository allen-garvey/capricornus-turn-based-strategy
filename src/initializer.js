"use strict";
/*
 * Logic to start game when all assets are loaded
 */

 import { start } from './game.js';
 import { getJson } from './ajax';
 import util from './util.js';
 import levelStats from './level-stats.js';
 import menu from './menu.js';
 import levelLoader from './level-loader.js';
 import mixer from './mixer.js';
 import audioStats from './audio-stats.js';

export function startGame(){
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
	util.forEach(imageSprites, (sprite) => {
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
	levelStatsArray.forEach((level, index) => {
		//unit placement
		level.dataUnitsUrls.forEach((dataUnitUrl, innerIndex) => {
			getJson(dataUnitUrl).then((json) => {
				levelUnitDatas[index][innerIndex] = json;
				assetDidLoad();
			});
		});

		//terrain data
		getJson(level.dataTerrainUrl).then((json) => {
			levelTerrainDatas[index] = json;
			assetDidLoad();
		});
	});

	audioStatsArray.units.forEach((unitSound) => {
		mixer.getAudioBuffer(unitSound.moveUrl).then((buffer) => {
			unitSound.move = buffer;
			assetDidLoad();
		});
		mixer.getAudioBuffer(unitSound.dieUrl).then((buffer) => {
			unitSound.die = buffer;
			assetDidLoad();
		});
		mixer.getAudioBuffer(unitSound.attackUrl).then((buffer) => {
			unitSound.attack = buffer;
			assetDidLoad();
		});
	});
	cursorAudioKeys.forEach((cursorAudioKey) => {
		const cursorItem = audioStatsArray.cursor[cursorAudioKey];
		mixer.getAudioBuffer(cursorItem.url).then((buffer) => {
			cursorItem.audio = buffer;
			assetDidLoad();
		});
	});
	levelAudioKeys.forEach((levelAudioKey) => {
		const levelItem = audioStatsArray.level[levelAudioKey];
		mixer.getAudioBuffer(levelItem.url).then((buffer) => {
			levelItem.audio = buffer;
			assetDidLoad();
		});
	});
	audioStatsArray.music.forEach((musicInfo) => {
		mixer.getAudioBuffer(musicInfo.url).then((buffer) => {
			musicInfo.audio = buffer;
			assetDidLoad();
		});
	});
}