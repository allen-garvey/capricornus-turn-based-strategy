export function getJson(url){
	const headers = new Headers();
	headers.append('Content-Type', 'application/json');
	return fetch(url, {headers}).then((response) => response.json());
}