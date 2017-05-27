"use strict";
/*
 * Displays text overlay menus for when turn starts and level is over
 */
var app = app || {};

app.textOverlay = (function(){

	var textOverlayHeading = document.getElementById('text-overlay-heading');

	function resetOverlay(){
		textOverlayHeading.textContent = '';
	}

	function showOverlay(){
		document.documentElement.classList.add('show-text-overlay');
	}

	function hideOverlay(){
		document.documentElement.classList.remove('show-text-overlay');
	}

	/**
	* Used to display a heading over the gameboard
	* @param heading - string - text to display as heading
	* @param duration - integer - duration in milliseconds to display heading
	* @param callback - function - optional callback that will be called after duration is complete
	*/
	function displayHeading(heading, duration, callback){
		callback = callback || function(){};
		resetOverlay();
		textOverlayHeading.textContent = heading;

		showOverlay();
		if(duration && duration > 0){
			setTimeout(function(){
				hideOverlay();
				callback();
			}, duration);
		}
		else{
			hideOverlay();
			callback();
		}

	}


	//exported functions and variables
	return {
		displayHeading: displayHeading 
	};
    
})();
