"use strict";
/*
 * Functions for displaying modal dialogs
 */
var app = app || {};

app.modal = (function(){

	//displays modal window with contents of alertText
	function alert(alertText){
		window.alert(alertText);
	}

	//displays modal dialog with contents of text
	//if ok is selected, confirmCallback is run
	//if cancel is selected, confirmCallback is not run
	function confirm(confirmText, confirmCallback){
		var didConfirm = window.confirm(confirmText);
		if(didConfirm){
			confirmCallback();
		}
	}

	//displays modal dialog and prompts user to enter text
	//if ok is clicked, contents of text is passed into callback
	//if cancel is clicked, callback is not run
	function prompt(promptText, callback){
		var userInput = window.prompt(promptText);
		if(userInput !== null){
			callback(userInput);
		}
	}

	//exported functions and variables
	return {
		alert: alert,
		confirm: confirm,
		prompt: prompt
	};
    
})();
