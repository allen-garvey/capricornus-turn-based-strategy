import menu from './menu.js';

// modal to be displayed
const briefings = document.getElementById('briefings');
// span to close modal and begin level
const ready = document.getElementsByClassName('ready')[0];

/**
 * Displays modal briefings before respective level
 * @param levelIndex - -1 for random setup or otherwise index of level in levelStats
 * @param displayUserTurnText - function
 * @param enableButtons - function
 */
function show(levelIndex, displayUserTurnText, enableButtons) {
    //If last mission completed, show congratulatory message
    if(levelIndex > 2){
        document.getElementById('level').innerHTML = 'Excellent work! We have reclaimed Capricornus Island. Now that we have taken back our home base, victory will surely be ours. I see a bright future ahead for you. Thanks for all your hard work, soldier!';
        document.getElementById('ready-btn').innerHTML = 'Return to Main Menu';
        briefings.style.display = 'block';
        ready.onclick = function () {
            briefings.style.display = 'none';
            menu.displayMainMenu();
        };
    }	
    //Otherwise show briefing for appropriate level
    else{	
        if(levelIndex == 0){
            var brief = 'Welcome recruit to the legendary Capricornus Squadron. We’re glad to have you with us, as we’ve recently had some setbacks and have fallen on hard times. The enemy have taken over the Gemini Bridges, a vital position in our supply line, and we need to take it back. With your help we should be able to do so.</br></br>When attacking remember that infantry have advantages over planes, planes have advantages over tanks, and tanks have advantages over infantry. Also, infantry will take less damage if they are taking cover in mountains or trees. If you keep these things in mind you should be able to claim victory on the battlefield. Good luck out there soldier!';
        }
        
        else if(levelIndex == 1){
            var brief = 'Well done soldier! Now that we have regained control of the Gemini Bridges we should be able to push through some much needed supplies. We can now make way to the port town of Aquarius - an integral location in the war. Currently the enemy have one of their main bases set up there. If we can overtake them, we should be well on our way to flipping the momentum in our favor.</br></br>Remember that only planes will be able to cross the water here. You can use this advantage to keep them out of harm\'s way until they are ready to strike. Alright, its time to move in. Keep up the good work.';
        }

        else if(levelIndex == 2){
            var brief = 'Great going soldier! If you keep this up, you will be moving up the ranks in no time. We now have just one battle left. It is time to reclaim Capricornus Island. If we can take back what is rightfully ours from the enemies standing guard there, we will surely win the war and regain our legendary status as the greatest squadron in the world!</br></br>Just remember that attacking the nearest enemey may not always be the optimal decision. Sometimes it is better to attack an enemy that is further away if it will give you an advantage or just move away and take cover. Be wary of how far an enemy unit is from you and try to get the first strike on a unit.';
        }

    
        document.getElementById('level').innerHTML = brief;		
        document.getElementById('ready-btn').innerHTML = 'READY';

    
        briefings.style.display = 'block';
        ready.onclick = function () {
            briefings.style.display = 'none';
            displayUserTurnText(function(){
                enableButtons();
            });
        };
    }
}

export default {
    show,
};