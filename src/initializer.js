/*
 * Logic to start game when all assets are loaded
 */

 import { start } from './game.js';
 import { getJson } from './ajax';
 import levelStats from './models/level-stats.js';
 import menu from './menu.js';
 import levelLoader from './level-loader.js';
 import mixer from './mixer.js';
 import audioStats from './models/audio-stats.js';

export function startGame(){
	const levelStatsArray = levelStats.get();
	const levelUnitDatas = levelStatsArray.map(function(){ return [null, null]; });
	const levelTerrainDatas = [];
	const audioStatsArray = audioStats.get();
	const cursorAudioKeys = ['select', 'deselect'];
	const levelAudioKeys = ['passed', 'failed'];

	const imageSprites = document.querySelectorAll('img.spritesheet');

	const assetPromises = [];

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
	imageSprites.forEach((sprite) => {
		const imagePromise = new Promise((resolve, reject) => {
			if(sprite.complete){
				return resolve();
			}
			sprite.onload = resolve;
		});
		assetPromises.push(imagePromise);
	});

	//download level unit placements and terrain data
	levelStatsArray.forEach((level, index) => {
		//unit placement
		level.dataUnitsUrls.forEach((dataUnitUrl, innerIndex) => {
			const unitPromise = getJson(dataUnitUrl).then((json) => {
				levelUnitDatas[index][innerIndex] = json;
			});
			assetPromises.push(unitPromise);
		});

		//terrain data
		const terrainPromise = getJson(level.dataTerrainUrl).then((json) => {
			levelTerrainDatas[index] = json;
		});
		assetPromises.push(terrainPromise);
	});

	audioStatsArray.units.forEach((unitSound) => {
		const unitMovePromise = mixer.getAudioBuffer(unitSound.moveUrl).then((buffer) => {
			unitSound.move = buffer;
		});
		const unitDiePromise = mixer.getAudioBuffer(unitSound.dieUrl).then((buffer) => {
			unitSound.die = buffer;
		});
		const unitAttackPromise = mixer.getAudioBuffer(unitSound.attackUrl).then((buffer) => {
			unitSound.attack = buffer;
		});
		assetPromises.push(unitMovePromise);
		assetPromises.push(unitDiePromise);
		assetPromises.push(unitAttackPromise);
	});
	cursorAudioKeys.forEach((cursorAudioKey) => {
		const cursorItem = audioStatsArray.cursor[cursorAudioKey];
		const cursorPromise = mixer.getAudioBuffer(cursorItem.url).then((buffer) => {
			cursorItem.audio = buffer;
		});
		assetPromises.push(cursorPromise);
	});
	levelAudioKeys.forEach((levelAudioKey) => {
		const levelItem = audioStatsArray.level[levelAudioKey];
		const levelPromise = mixer.getAudioBuffer(levelItem.url).then((buffer) => {
			levelItem.audio = buffer;
		});
		assetPromises.push(levelPromise);
	});
	audioStatsArray.music.forEach((musicInfo) => {
		const levelPromise = mixer.getAudioBuffer(musicInfo.url).then((buffer) => {
			musicInfo.audio = buffer;
		});
		assetPromises.push(levelPromise);
	});
	
	Promise.all(assetPromises).then(allAssetsFinishedLoading);
}