export function fetchData(url,table) {
	var formData = new FormData();
	formData.append('table', table);
	let postData = {
    method: 'POST',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'multipart/form-data'
    },
    body: formData
	}
	return fetch(url,postData);
}
export function hello(){
  return 'hello';
}
