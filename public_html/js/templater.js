"use strict";
/*
 * Functions DOM manipulation and HTML templating
 */
var app = app || {};

app.templater = (function(){

	/**
	 * creates DOM element
	 * @param elementName - string -name of element to be created
	 * @param textContent - textContent to be placed in the element
	 * @returns - Element object 
	 */
	function createElement(elementName, textContent){
		var el = document.createElement(elementName);
		el.textContent = textContent;
		return el;
	}

	//exported functions and variables
	return {
		createElement: createElement
	};
    
})();
