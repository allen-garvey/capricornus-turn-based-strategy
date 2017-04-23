/*
 * Logic to start game when all assets are loaded
 */
(function(start){
	//wait until images are loaded to start game
    var spriteSheet = document.getElementById('spritesheet');
	if(spritesheet.complete){
		start();
	}
	else{
		spritesheet.onload = function(){
			start();
		};
	}
})(app.game.start);