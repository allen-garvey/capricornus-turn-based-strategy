"use strict";
/*
 * Functions DOM manipulation and HTML templating
 */
var app = app || {};

app.templater = (function(){

	/**
	 * creates DOM element
	 * @param elementName - string -name of element to be created
	 * @param textContent - string - textContent to be placed in the element
	 * @param className - string - space delimited css classes to add to element
	 * @returns - Element object 
	 */
	function createElement(elementName, textContent, className){
		var el = document.createElement(elementName);
		if(textContent){
			el.textContent = textContent;
		}
		if(className){
			el.className = className;
		}
		return el;
	}

	//exported functions and variables
	return {
		createElement: createElement
	};
    
})();
