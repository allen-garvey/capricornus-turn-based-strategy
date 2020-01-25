/*
 * Functionality for site navigation to trigger page section tabs
 */

// saves some typing
// binding required to avoid illegal invocation
// https://stackoverflow.com/questions/10743596/why-are-certain-function-calls-termed-illegal-invocations-in-javascript
const $ = document.querySelectorAll.bind(document);

const navLinks = $('.nav-list li');
const pageSections = $('.tab[data-tab]');

function navLinkClicked(navLink, index){
	navLinks.forEach((navLink, i) => {
		const action = i === index ? 'add' : 'remove';
		navLink.classList[action]('active');
	});
	const tabSelector = navLink.dataset.tab;
	hideAllPageSections();
	document.querySelector('.tab[data-tab="' + tabSelector + '"]').classList.add('active');
}

function hideAllPageSections(){
	pageSections.forEach((pageSection) => {
		pageSection.classList.remove('active');
	});
}

export function initNavLinks(){
	//set navLink to be active on click
	navLinks.forEach((navLink, i) => {
		navLink.onclick = () => {
			navLinkClicked(navLink, i);
		};
	});

	//select first navLink active by default on page load
	navLinkClicked(navLinks[0], 0);
}
