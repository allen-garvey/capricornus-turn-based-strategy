/*
 * Logic to start game when all assets are loaded
 */
(function(start, levelStats){
	var levelStatsArray = levelStats.get();
	var levelDatas = [];
	var spriteIds = ['spritesheet', 
					'level1_sprite', 
					'soldier_red_sprite', 
					'plane_red_sprite', 
					'tank_red_sprite',
					'soldier_blue_sprite', 
					'plane_blue_sprite', 
					'tank_blue_sprite'
					];
	var assetsLeftToLoad = spriteIds.length + levelStatsArray.length;

	function assetDidLoad(){
		assetsLeftToLoad--;
		if(assetsLeftToLoad == 0){
			document.documentElement.classList.remove('loading');
			start(levelDatas);
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

	levelStatsArray.forEach(function(level, index){
		var request = new Request(level.dataFileUrl);
		var headers = new Headers();
		headers.append('Content-Type', 'application/json');
		fetch(request, {headers: headers}).then(function(response){
			return response.json();
		}).then(function(json){
			levelDatas[index] = json;
			assetDidLoad();
		});
	});

})(app.game.start, app.levelStats);