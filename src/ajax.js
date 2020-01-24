export function getJson(url){
	return fetch(url).then((response) => response.json());
}

export function getArrayBuffer(url){
    return fetch(url).then((res) => res.arrayBuffer());
}