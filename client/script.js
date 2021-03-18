let dataset;

const handleResponse = (xhr, parseResponse) => {
	const content = document.querySelector('#content');
	const alert = document.querySelector('#alert');
	const championField = document.querySelector('#getDataChampion');
	const roleField = document.querySelector('#getDataRole');

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
			alert.innerHTML = '<b>Data not found!</b>';
			break;
		default:
			alert.innerHTML = '<b>Error! Case not implemented by client!</b>';
			break;
	}

	if(parseResponse && xhr.response && xhr.getResponseHeader('Content-Type') == 'application/json') {
		const obj = JSON.parse(xhr.response);
		console.log(obj)

		if(obj.message) {
			content.innerHTML = `Message: ${obj.message}<br>`;
		}
		if(obj.winrate) {
			let words = `${championField.value} ${roleField.value}`.split(" ");
			for(let i = 0; i < words.length; i++)
				words[i] = words[i][0].toUpperCase() + words[i].substr(1);
			content.innerHTML += `${words.join(" ")}'s Winrate: ${obj.winrate}%`;
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

	//	Clear content
	document.querySelector('#content').innerHTML = "";

	const action = form.getAttribute('action');
	const method = form.querySelector('#methodSelect').value;

	const championField = form.querySelector('#getDataChampion');
	const roleField = form.querySelector('#getDataRole');
	//const role = roleField.innerText.split(/\r?\n/)[roleField.selectedIndex];
	//console.log(`Role: ${role}`)
	const url = `${action}?champion=${championField.value}&role=${roleField.value}`;

	const xhr = new XMLHttpRequest();
	xhr.open(method, url);

	xhr.addEventListener('error', (e) => {
		//alert(`Error! ${e}`);
	});
	xhr.addEventListener('load', (e) => {
		console.log(`Data sent and response loaded. ${e}`);
	});

	xhr.setRequestHeader('Accept', 'application/json');
	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

	xhr.onload = () => handleResponse(xhr, true);

	//	No ? showing up in 
	console.log(`Sending form with method ${method} at url ${url}`);
	xhr.send();

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