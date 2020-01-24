"use strict";
/*
 * Functionality for site navigation to trigger page section tabs
 */

import util from './util.js';

//saves some typing
var $ = function(selector){ return document.querySelectorAll(selector); };

var navLinks = $('.nav-list li');
var pageSections = $('.tab[data-tab]');

function navLinkClicked(navLink){
	deselectNavlinks();
	navLink.classList.add('active');
	const tabSelector = navLink.dataset.tab;
	hideAllPageSections();
	document.querySelector('.tab[data-tab="' + tabSelector + '"]').classList.add('active');
}

function deselectNavlinks(){
	navLinks.forEach((navLink) => {
		navLink.classList.remove('active');
	});
}

function hideAllPageSections(){
	pageSections.forEach((pageSection) => {
		pageSection.classList.remove('active');
	});
}

export function initNavLinks(){
	//set navLink to be active on click
	navLinks.forEach((navLink) => {
		navLink.onclick = () => {
			navLinkClicked(navLink);
		};
	});

	//select first navLink active by default on page load
	navLinkClicked(navLinks[0]);
}
