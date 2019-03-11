"use strict";
/*
 * Used to store information about the animations
 */
    
//array of information about animations
function animationStats(){
    var stats = {};
    
    stats.explosion = {
        name: 'Explosion', //for debugging purposes
        type: 'static animation', //self-documentation about what function to use render this animation
        spritesheet: document.getElementById('explosion_spritesheet'),
        spriteCoordinates: [{x: 0, y: 0}, {x: 1, y: 0}, {x: 2, y: 0}, {x: 3, y: 0}, {x: 4, y: 0}, {x: 5, y: 0}, {x: 6, y: 0}, {x: 7, y: 0}, {x: 8, y: 0}, {x: 9, y: 0}, {x: 10, y: 0}, {x: 11, y: 0}] //coordinates in order animation should be displayed
    };

    stats.unitDamage = {
        name: 'Unit damage',
        type: 'static color animation', //self-documentation about what function to use render this animation
        colorCells: ['rgba(255,0,0, 0.1)', 'rgba(255,0,0, 0.3)', 'rgba(255,0,0, 0.3)', 'rgba(255,0,0, 0.5)', 'rgba(255,0,0, 0.7)', 'rgba(255,0,0, 8.0)', 'rgba(255,0,0, 0.7)', 'rgba(255,0,0, 0.5)', 'rgba(255,0,0, 0.3)', 'rgba(255,0,0, 0.3)', 'rgba(255,0,0, 0.1)'] //array of css colors for used for tile colors for animation
    };

    //unit attack animations are mapped to unitStats array indexes
    stats.unitAttack = [
        {
            name: 'Infantry', //for debugging purposes
            type: 'static animation',
            spritesheet: document.getElementById('soldier_attack_sprite'),
            spriteCoordinates: [[{x: 0, y: 0}, {x: 1, y: 0}, {x: 3, y: 0}, {x: 3, y: 0}, {x: 3, y: 0}, {x: 3, y: 0}, {x: 0, y: 0}, {x: 1, y: 0}, {x: 3, y: 0}, {x: 3, y: 0}, {x: 3, y: 0}, {x: 3, y: 0}], [{x: 2, y: 0}, {x: 4, y: 0}, {x: 5, y: 0}, {x: 5, y: 0}, {x: 5, y: 0}, {x: 5, y: 0}, {x: 2, y: 0}, {x: 4, y: 0}, {x: 5, y: 0}, {x: 5, y: 0}, {x: 5, y: 0}, {x: 5, y: 0}]] //array of coordinates are mapped to unit's current orientation index
        },
        {
            name: 'Tank',
            type: 'static animation',
            spritesheet: document.getElementById('tank_attack_sprite'),
            spriteCoordinates: [[{x: 0, y: 0}, {x: 1, y: 0}, {x: 1, y: 0}, {x: 2, y: 0}, {x: 2, y: 0}, {x: 2, y: 0}, {x: 2, y: 0}, {x: 2, y: 0}], [{x: 3, y: 0}, {x: 4, y: 0}, {x: 4, y: 0}, {x: 5, y: 0}, {x: 5, y: 0}, {x: 5, y: 0}, {x: 5, y: 0}, {x: 5, y: 0}]]
        },
        {
            name: 'Plane',
            type: 'static animation',
            spritesheet: document.getElementById('plane_attack_sprite'),
            spriteCoordinates: [[{x: 0, y: 0}, {x: 1, y: 0}, {x: 1, y: 0}, {x: 2, y: 0}, {x: 2, y: 0}, {x: 2, y: 0}], [{x: 3, y: 0}, {x: 4, y: 0}, {x: 4, y: 0}, {x: 5, y: 0}, {x: 5, y: 0}, {x: 5, y: 0}]]
        }
    ];

    return stats;
}


export default {
    get: animationStats
};
