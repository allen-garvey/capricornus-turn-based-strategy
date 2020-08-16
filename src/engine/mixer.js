import { getArrayBuffer } from '../ajax';

/*
 * Functions loading and playing sounds from audio files
 */
// Fix up prefixing
var AudioContext = window.AudioContext || window.webkitAudioContext;
var context = new AudioContext();

/**
 * asynchronously downloads an audio file at url and decodes into audio buffer
 * based on: https://www.html5rocks.com/en/tutorials/webaudio/intro/
 * @param url - string - url of audio file
 * @param callback - function - called when audio file is downloaded and AudioBuffer is decoded - passed into callback as argument 
 */
function getAudioBuffer(url){
	return new Promise((resolve, reject) => {
		getArrayBuffer(url).then((arrayBuffer) => {
			context.decodeAudioData(arrayBuffer, (buffer) => {
				resolve(buffer);
			}, () => {
				const aacUrl = url.replace(/ogg$/, 'aac');
				getArrayBuffer(aacUrl).then((arrayBuffer) => {
					context.decodeAudioData(arrayBuffer, (buffer) => {
						resolve(buffer);
					}, reject);
				});
			});
		});
	});
}

/**
 * plays sound stored in audio buffer using web audio api
 * based on: https://www.html5rocks.com/en/tutorials/webaudio/intro/
 * @param audioBuffer - AudioBuffer object preloaded with audio or null if ogg vorbis playback not supported
 * @param shouldLoop - boolean (optional) - if audio should loop
 * @param delay - int (optional) - delay in milliseconds before audio should start for the first time
 * @param duration - int (optional) - total milliseconds audio should play for
 * @returns GainNode - use stop method to stop sound
 */
function playAudioBuffer(audioBuffer, shouldLoop, delay, duration){
	if(audioBuffer === null){
		return null;
	}
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
	if(gainNode === null){
		return;
	}
	if(!fadeOutTime){
		gainNode.disconnect();
		return;
	}
	var stepTime = 10; //number of milliseconds between each fade step
	var gainStep = 100 / (fadeOutTime / stepTime) / 100;
	var gainDelay = 0.1;
	gainNode.gain.setValueAtTime(gainNode.gain.value - gainStep, gainDelay);

	function fade(){
		setTimeout(function(){
			gainNode.gain.setValueAtTime(gainNode.gain.value - gainStep, gainDelay);
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

export default {
	getAudioBuffer,
	playAudioBuffer,
	stopSound,
};
