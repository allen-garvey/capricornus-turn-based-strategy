"use strict";
/*
 * Functions loading and playing sounds from audio files
 */
var app = app || {};

app.mixer = (function(){
	// Fix up prefixing
	var AudioContext = window.AudioContext || window.webkitAudioContext;
	var context = new AudioContext();

	/**
	 * asynchronously downloads an audio file at url and decodes into audio buffer
	 * based on: https://www.html5rocks.com/en/tutorials/webaudio/intro/
	 * @param url - string - url of audio file
	 * @param callback - function - called when audio file is downloaded and AudioBuffer is decoded - passed into callback as argument 
	 */
	function getAudioBuffer(url, callback){
		var request = new XMLHttpRequest();
		request.open('GET', url, true);
		request.responseType = 'arraybuffer';

		// Decode asynchronously
		request.onload = function() {
			context.decodeAudioData(request.response, function(buffer){
				callback(buffer);
			});
		}
		request.send();
	}

	/**
	 * plays sound stored in audio buffer using web audio api
	 * based on: https://www.html5rocks.com/en/tutorials/webaudio/intro/
	 * @param audioBuffer - AudioBuffer object preloaded with audio
	 * @param shouldLoop - boolean (optional) - if audio should loop
	 * @param delay - int (optional) - delay in milliseconds before audio should start for the first time
	 * @param duration - int (optional) - total milliseconds audio should play for
	 * @returns GainNode - use stop method to stop sound
	 */
	function playAudioBuffer(audioBuffer, shouldLoop, delay, duration){
		function stopAfterDuration(gainNode){
			setTimeout(function(){
				stopSound(gainNode, 2000);
			}, duration);
		}

		var source = context.createBufferSource();    // creates a sound source
		source.buffer = audioBuffer;                    // tell the source which sound to play
		if(shouldLoop){
			source.loop = true;
		}
		//so we can fade the sound
		var gainNode = context.createGain();
		source.connect(gainNode);
		gainNode.connect(context.destination);         // connect the source to the context's destination (the speakers)
		
		if(delay && delay > 0){
			setTimeout(function(){
				source.start(0);
				if(duration && duration > 0){
					stopAfterDuration(gainNode);
				}	
			}, delay);
		}
		else{
			source.start(0);
			if(duration && duration > 0){
				stopAfterDuration(gainNode);
			}	
		}
		return gainNode;
	}

	/**
	 * Stops sound started using playAudioBuffer
	 * @param gainNode - GainNode - return value from playAudioBuffer
	 * @param fadeOutTime - time in milliseconds to fade out sound
	 */
	function stopSound(gainNode, fadeOutTime){
		if(!fadeOutTime){
			gainNode.disconnect();
			return;
		}
		var stepTime = 10; //number of milliseconds between each fade step
		var gainStep = 100 / (fadeOutTime / stepTime) / 100;

		var numberOfFades = (fadeOutTime / stepTime) - 1;
		gainNode.gain.value = gainNode.gain.value - gainStep;

		function fade(){
			setTimeout(function(){
				gainNode.gain.value = gainNode.gain.value - gainStep;
				if(gainNode.gain.value > 0){
					fade();
				}
				else{
					gainNode.disconnect();
				}

			}, stepTime);
		}

		fade();

		
	}

	//exported functions and variables
	return {
		getAudioBuffer: getAudioBuffer,
		playAudioBuffer: playAudioBuffer,
		stopSound: stopSound
	};
    
})();
