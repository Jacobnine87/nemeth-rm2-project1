let dataset;

const handleResponse = (xhr, parseResponse) => {
	const content = document.querySelector('#content');
	const alert = document.querySelector('#alert');
	const championField = document.querySelector('#getChampionSelect');
	const roleField = document.querySelector('#getRoleSelect');

	switch(xhr.status) {
		case 200:
			alert.innerHTML = '<b>Request Successful!</b>';
			break;
		case 201:
			alert.innerHTML = '<b>New champion data received, dataset updated!</b>';
			break;
		case 204:
			alert.innerHTML = '<b>Champion winrate updated!</b>';
			break;
		case 400:
			alert.innerHTML = '<b>Bad Request!</b>';
			break;
		case 404:
			alert.innerHTML = '<b>Data not found!</b>'
			break;
		default:
			alert.innerHTML = '<b>Error! Case not implemented by client!</b>'
			break;
	}

	if(parseResponse && xhr.response && xhr.getResponseHeader('Content-Type') == 'application/json') {
		const obj = JSON.parse(xhr.response);

		if(obj.message) {
			content.innerHTML += `Message: ${obj.message}`;
		}
		if(obj.winrate) {
			content.innerHTML += `${championField.value} ${roleField.value}'s winrate: ${obj.winrate}`;
		}
	}
};

const sendPost = (e, winrateForm) => {
	e.preventDefault();

	const winrateAction = winrateForm.getAttribute('action');
	const winrateMethod = winrateForm.getAttribute('method');

	const championField = winrateForm.querySelector('#selectChampion');
	const roleField = winrateForm.querySelector('#selectRole');
	const newWRField = winrateForm.querySelector('#newWRField');
	const gamesField = winrateForm.querySelector('#gamesField');

	const xhr = new XMLHttpRequest();
	xhr.open(winrateMethod, winrateAction);

	xhr.setRequestHeader('Accept', 'application/json');
	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

	xhr.onload = () => handleResponse(xhr, true);

	const formData = `champion=${championField.value}&role=${roleField.value}&newWR=${newWRField.value}&games=${gamesField.value}`;
	xhr.send(formData);

	return false;
};

const getDataFunc = (e, form) => {
	e.preventDefault();

	const action = form.getAttribute('action');
	const method = form.querySelector('#methodSelect').value;

	const championField = form.querySelector('#getDataChampion');
	const roleField = form.querySelector('#getDataRole');

	const xhr = new XMLHttpRequest();
	xhr.open(method, action);

	xhr.addEventListener('error', (e) => {
		console.log(`Error! ${e}`);
	});
	xhr.addEventListener('load', (e) => {
		console.log(`Data sent and response loaded. ${e}`);
	});
	
	xhr.setRequestHeader('Accept', 'application/json');
	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

	xhr.onload = () => handleResponse(xhr, false);

	const formData = `champion=${championField.value}&role=${roleField.value}`;
	//	No ? showing up in 
	console.log(`Sending form with method ${method} at url ${action}${formData}`);
	xhr.send(formData);

	return false;
}

const init = () => {
	const winrateForm = document.querySelector('#winrateForm');
	const getDataForm = document.querySelector('#getDataForm');

	const modifyData = (e) => sendPost(e, winrateForm);
	const getData = (e) => getDataFunc(e, getDataForm);

	winrateForm.addEventListener('submit', modifyData);
	getDataForm.addEventListener('submit', getData);
	//	Grab csv and parse data to arrays
	/*
	$.get('winrates.csv', (data) => {
		dataset = $.csv.toArrays(data);
		dataset.shift();
		console.dir(dataset);
	});
*/
};

window.onload = init;