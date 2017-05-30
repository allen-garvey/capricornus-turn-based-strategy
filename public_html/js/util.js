"use strict";
/*
 * Utility functions
 */
var app = app || {};

app.util = (function(){
	function coordinateFrom(x, y){
		return {x: x, y: y};
	}

	function copyCoordinate(coordinate){
		return {x: coordinate.x, y: coordinate.y};
	}

	function isCoordinateInMovementSquares(coordinate, movementSquares){
		for(var i = 0; i < movementSquares.length; i++){
			var currentCoordinate = movementSquares[i];
			if(coordinate.x === currentCoordinate.x && coordinate.y === currentCoordinate.y){
				return true;
			}
		}
		return false;
	}

	function areCoordinatesEqual(coordinate1, coordinate2){
		return (coordinate1.x === coordinate2.x && coordinate1.y === coordinate2.y);
	}

	//because can't use array prototype methods on NodeList
    function forEach(iteratable, callback){ 
    	return Array.prototype.forEach.call(iteratable, callback); 
    }

    //AJAX polyfill for browsers that don't support the fetch API 
    function fetchJsonPolyfill(url, callback){
	    var request = new XMLHttpRequest();
	    request.overrideMimeType('application/json');

	    request.onreadystatechange = function(){
	        if(request.readyState !== XMLHttpRequest.DONE){
	            return;
	        }
	        var data = request.response;
	        data = JSON.parse(data);

	        if(request.status <= 200 && request.status < 300){
	            callback(data);
	        }
	    };

	    request.open('GET', url, true);
	    request.send();
	}

	//for browsers that support the fetch API
	function fetchJson(url, callback){
		var request = new Request(url);
		var headers = new Headers();
		headers.append('Content-Type', 'application/json');
		fetch(request, {headers: headers}).then(function(response){
			return response.json();
		}).then(function(json){
			callback(json);
		});
	}

	//get json data at url, and passes parsed json data as argument into callback
	function getJson(url, callback){
		if(window.fetch){
			fetchJson(url, callback);
		}
		else{
			fetchJsonPolyfill(url, callback);
		}
	}

	//creates deep copy of an object and returns it
	//note this will only copy serializable properties, not functions
	//based on: http://stackoverflow.com/questions/728360/how-do-i-correctly-clone-a-javascript-object
	function cloneObject(object){
		return JSON.parse(JSON.stringify(object));
	}

	//exported functions and variables
	return {
		copyCoordinate: copyCoordinate,
		isCoordinateInMovementSquares: isCoordinateInMovementSquares,
		areCoordinatesEqual: areCoordinatesEqual,
		coordinateFrom: coordinateFrom,
		getJson: getJson,
		forEach: forEach,
		cloneObject: cloneObject
	};
    
})();