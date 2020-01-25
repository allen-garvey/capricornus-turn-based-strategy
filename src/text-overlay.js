/*
 * Displays text overlay menus for when turn starts and level is over
 */

var textOverlayContainer = document.getElementById('text-overlay-container');
var textOverlayHeading = document.getElementById('text-overlay-heading');
var textOverlayButton = document.getElementById('text-overlay-button');

function resetOverlay(){
	textOverlayContainer.classList.remove('show-heading-animation');
	textOverlayContainer.classList.remove('show-menu');
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
	textOverlayContainer.classList.add('show-heading-animation');
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

/**
* Used to display a heading with button over the gameboard
* @param heading - string - text to display as heading
* @param buttonText - string - text to display in button
* @param buttonCallback - function - callback that will be called when button is pressed
*/
function displayMenu(heading, buttonText, buttonCallback){
	resetOverlay();
	textOverlayContainer.classList.add('show-menu');
	textOverlayHeading.textContent = heading;
	textOverlayButton.textContent = buttonText;
	textOverlayButton.onclick = function(){
		hideOverlay();
		buttonCallback();
	};

	showOverlay();
}


export default {
	displayHeading: displayHeading,
	displayMenu: displayMenu
};
