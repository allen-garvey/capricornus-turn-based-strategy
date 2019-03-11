"use strict";
/*
 * Used to store information about ui sprites, such as for the cursor
 */

//array of information about ui sprites
function uiStats(){
    var stats = {};
    
    var cursorSprite = document.getElementById('cursor_sprite');
    stats.cursor = {
        select: {
            spritesheet: cursorSprite,
            spriteCoordinate: {x: 1, y: 0}
        },
        attack: {
            spritesheet: cursorSprite,
            spriteCoordinate: {x: 0, y: 0}
        }
    };

    return stats;
}


export default {
    get: uiStats
};
