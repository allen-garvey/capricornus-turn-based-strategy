/*
 * Logic to start game when all assets are loaded
 */
(function(start){
	var spriteIds = ['spritesheet', 'level1_sprite'];
	var assetsLeftToLoad = spriteIds.length;

	function assetDidLoad(){
		assetsLeftToLoad--;
		if(assetsLeftToLoad == 0){
			start();
		}
	}

	//don't start game until all images are loaded
	spriteIds.forEach(function(spriteId){
		var sprite = document.getElementById(spriteId);
		if(sprite.complete){
			assetDidLoad();
		}
		else{
			sprite.onload = function(){
				assetDidLoad();
			};
		}
	});
})(app.game.start);