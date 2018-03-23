"use strict";

let path = require('path');
let config = {};

const publicDirectory = path.join(__dirname, 'public_html'); 


/*
* JavaScript configuration
*/
config.js = {};
config.js.SOURCE_DIR = path.join(__dirname, 'js_src');
config.js.DEST_DIR = path.join(publicDirectory, 'js');
config.js.DIST_NAME = 'app'; //name of compiled file to be served i.e. app.js and app.min.js
config.js.app_files = [
	'util',
	'templater',
	'ui-stats',
	'tabs',
	'modal',
	'text-overlay',
	'damage',
	'terrain-stats',
	'unit-stats',
	'animation-stats',
	'level-stats',
	'level-loader',
	'audio-stats',
	'mixer',
	'renderer',
	'pathfinding',
	'ai',
	'save-game',
	'menu',
	'game',
	'initializer',
];

//add source dir prefix and .js suffix to js source files
config.js.app_files = config.js.app_files.map((fileName)=>{return path.join(config.js.SOURCE_DIR, `${fileName}.js`);});

/*
* Sass/Styles configuration
*/
config.styles = {};
config.styles.SOURCE_DIR = path.join(__dirname, 'sass');
config.styles.DEST_DIR = path.join(publicDirectory, 'css');
config.styles.sass_options = {
  errLogToConsole: true,
  // sourceComments: true, //turns on line number comments 
  outputStyle: 'compressed' //options: expanded, nested, compact, compressed
};



module.exports = config;