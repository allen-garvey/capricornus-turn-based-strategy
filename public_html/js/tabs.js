"use strict";
/*
 * Functionality for site navigation to trigger page section tabs
 */
(function(){
	//saves some typing
    var $ = function(selector){ return document.querySelectorAll(selector); };
    //because can't use array prototype methods on NodeList
    var forEach = function(iteratable, callback){ return Array.prototype.forEach.call(iteratable, callback); }

    var navLinks = $('.nav-list li');
    var pageSections = $('.tab[data-tab]');

    function navLinkClicked(navLink){
    	deselectNavlinks();
		navLink.classList.add('active');
		var tabSelector = navLink.dataset.tab;
		hideAllPageSections();
		document.querySelector('.tab[data-tab="' + tabSelector + '"]').classList.add('active');
    }

    function deselectNavlinks(){
    	forEach(navLinks, function(navLink){
    		navLink.classList.remove('active');
    	});
    }

    function hideAllPageSections(){
		forEach(pageSections, function(pageSection){
    		pageSection.classList.remove('active');
    	});
	}

    //set navLink to be active on click
    forEach(navLinks, function(navLink){
    	navLink.onclick = function(){
    		navLinkClicked(navLink);
    	};
    });

    //select first navLink active by default on page load
    navLinkClicked(navLinks[0]);

})();