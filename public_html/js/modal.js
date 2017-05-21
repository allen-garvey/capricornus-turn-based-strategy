"use strict";
/*
 * Functions for displaying modal dialogs
 */
var app = app || {};

app.modal = (function(){
	var modalTextContainer = document.getElementById('modal-text-container');
	var modalButtonOk = document.getElementById('modal-button-ok');
	var modalButtonCancel = document.getElementById('modal-button-cancel');
	var modalWindow = document.getElementById('modal-window');
	var modalTextInput = document.getElementById('modal-text-input');

	modalButtonCancel.onclick = function(){ hideModal(); };

	function showModal(){
		document.documentElement.classList.add('show-modal');
	}
	function hideModal(){
		document.documentElement.classList.remove('show-modal');
	}

	//clears modal window and resets to default state
	function resetModal(){
		modalWindow.classList.remove('prompt');
		modalWindow.classList.remove('alert');
		//clear input field, in case something was already there
		modalTextInput.value = null;
	}

	//displays modal window with contents of alertText
	function alert(alertText){
		resetModal();
		modalWindow.classList.add('alert');
		modalTextContainer.textContent = alertText;
		modalButtonOk.onclick = function(){
			hideModal();
		};
		showModal();
	}

	//displays modal dialog with contents of text
	//if ok is selected, confirmCallback is run
	//if cancel is selected, confirmCallback is not run
	function confirm(confirmText, confirmCallback){
		resetModal();
		modalTextContainer.textContent = confirmText;
		
		modalButtonOk.onclick = function(){
			hideModal();
			confirmCallback();
		};
		showModal();
	}

	//displays modal dialog and prompts user to enter text
	//if ok is clicked, contents of text is passed into callback
	//if cancel is clicked, callback is not run
	function prompt(promptText, callback){
		resetModal();
		modalWindow.classList.add('prompt');
		modalTextContainer.textContent = promptText;
		
		modalButtonOk.onclick = function(){
			hideModal();
			callback(modalTextInput.value);
		};
		showModal();
	}

	//exported functions and variables
	return {
		alert: alert,
		confirm: confirm,
		prompt: prompt
	};
    
})();