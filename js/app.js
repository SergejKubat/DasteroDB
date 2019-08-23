//html elementi
const inputForm = document.querySelector('.unos_datuma');
const hidden = document.querySelector('.skriveno');
const table = document.querySelector('table');
const datalist = document.querySelector('#asteroids');
const asteroidsForm = document.querySelector('.asteroidi-tabela');
const pagination = document.querySelector('.pagination');
const lista = document.querySelector('.lista-asteroida');
const chartButton = document.querySelector('.charts');
const dateError = document.querySelector('.date-error');
const listError = document.querySelector('.list-error');
const serverError = document.querySelector('.server-error');
const loader = document.querySelector('.loader');
const deleteList = document.querySelector('.delete-list');

const asteroidUI = new AsteroidUI();

const key = 'x0HeIJzRCLm3lj0zrfXt2LltusKVCO7aoHmRkVq2';
let localStorageArray = new Array();
let filtered = new Array();
let start, end;

if(localStorage.asteroids_list) {
		localStorageArray.push(...JSON.parse(localStorage.asteroids_list));
}

//preuzimanje podataka o asteroidima
const getAsteroids = async (date1, date2) => {
	const start = `${date1.getFullYear()}-${date1.getMonth() + 1}-${date1.getDate()}`;
	const end = `${date2.getFullYear()}-${date2.getMonth() + 1}-${date2.getDate()}`;
	const adress = 
	`https://api.nasa.gov/neo/rest/v1/feed?start_date=${start}&end_date=${end}&api_key=${key}`;
	const response = await fetch(adress);
	const data = await response.json();
	return data;
}
//provera da li je korisnik vec unosio neke podatke
if(localStorage.start && localStorage.end) {
	//prikazivanje podataka na osnovu prethodno unetih datuma
	start = localStorage.start;
	end = localStorage.end;
	inputForm.startDate.value = start;
	inputForm.endDate.value = end;
	asteroidUI.clear(table, datalist, lista, pagination);
	dateError.classList.add('d-none');
	serverError.classList.add('d-none');
	loader.style.display = 'block';
	getAsteroids(new Date(start), new Date(end))
				.then(data => {
					filtered = filterAsteroids(data);
					//poziv metoda iz UI klase
					asteroidUI.renderTable(filtered, table, hidden);
					loader.style.display = 'none';
					asteroidUI.setList(filtered, datalist);
					asteroidUI.renderPagination(pagination, filtered);
				})
				.catch(err => {
					loader.style.display = 'none';
					serverError.classList.remove('d-none');
				});
	if(localStorageArray.length) {
		localStorageArray.forEach(el => asteroidUI.renderList(lista, el.name));
	}
	if(lista.children.length > 0) {
		chartButton.style.display = 'block';
		deleteList.style.display = 'block';
	}
}

//osluskivanje submit dogadjaja forme 'inputForm'
inputForm.addEventListener('submit', e => {
	e.preventDefault(); //sprecava osvezavanje stranice
	//uzimanje vrednosti datuma iz formi
	start = inputForm.startDate.value.trim();
	end = inputForm.endDate.value.trim();
	serverError.classList.add('d-none');
	if(start && end) {
		if(dateValidation(new Date(start), new Date(end))) {
			localStorage.clear();
			localStorageArray = [];
			chartButton.style.display = 'none';
			localStorage.setItem('start', start);
			localStorage.setItem('end', end);
			asteroidUI.clear(table, datalist, lista, pagination);
			dateError.classList.add('d-none');
			loader.style.display = 'block';
			getAsteroids(new Date(start), new Date(end))
				.then(data => {
					filtered = filterAsteroids(data); 
					asteroidUI.renderTable(filtered, table, hidden);
					loader.style.display = 'none';
					asteroidUI.setList(filtered, datalist);
					asteroidUI.renderPagination(pagination, filtered);
				})
				.catch(err => {
					loader.style.display = 'none';
					serverError.classList.remove('d-none');
				});
		}
		else {
			asteroidUI.createError(dateError, 'Podaci nisu validni! Maksimalna razlika između datuma je 7 dana.');
		}
	}
	else {
		asteroidUI.createError(dateError, 'Podaci nisu unešeni.');
	}
});
//osluskivanje submit dogadjaja forme 'asteroidsForm'
asteroidsForm.addEventListener('submit', e => {
	e.preventDefault();
	const ast = asteroidsForm.asteroidsList.value.trim();
	//provera da li se ime elementa vec sadrzi u listi asteroida
	const index = Array.from(lista.children).findIndex(element => element.innerText.includes(ast));
	//provera da li se ima elementa sadrzi u tabeli
	const exist = Array.from(datalist.children).findIndex(option => 
		option.value === ast);
	//provera da li su svi uslovi ispunjeni
	if(ast && index < 0 && exist >= 0) {
		//pronalazenje zadatog asteroida i uzimanje njegovog id-a
		const ind = filtered.findIndex(el => el.name.includes(ast));
		const id = filtered[ind].id;
		asteroidUI.renderList(lista, ast);
		deleteList.style.display = 'block';
		localStorageArray.push({name: ast, id});
		//azuriranje niza u localStorage-u
		localStorage.setItem('asteroids_list', JSON.stringify(localStorageArray));
		listError.classList.add('d-none');
	}
	else {
		listError.classList.remove('d-none');
	}
	//prikaz dugmeta za prelazak na drugu stranu
	if(lista.children.length > 0) chartButton.style.display = 'block';
	asteroidsForm.reset();
});
//osluskivanje click dogadjaja iz liste asteroida
lista.addEventListener('click', e => {
	if(e.target.classList.contains('delete')) {
		const name = e.target.parentNode.children[0].innerText;
		//azuriranje niza
		localStorageArray = JSON.parse(localStorage.getItem('asteroids_list'))
			.filter(el => !el.name.includes(name));
		//brisanje elementa
		e.target.parentNode.remove();
		if(lista.children.length === 0) chartButton.style.display = 'none';
		//azuriranje niza u localStorage-u
		localStorage.setItem('asteroids_list', JSON.stringify(localStorageArray));
	}
});
//osluskivanje dogadjaja tipa klik na elementu 'pagination'
pagination.addEventListener('click', e => {
	if(e.target.tagName === 'SPAN') {
		let current = document.querySelector('.active');
		if(e.target.innerText !== '«' && e.target.innerText !== '»') {
			asteroidUI.clear(table);
			asteroidUI.renderTable(filtered, table, hidden, parseInt(e.target.innerText));
			current.classList.remove('active');
			e.target.parentNode.classList.add('active');
		}
		else {
			const pagArray = Array.from(pagination.children);
			let currInd = pagArray.findIndex(el => el.firstChild.innerText === current.firstChild.innerText);
			if(e.target.innerText === '«') {
				if(currInd > 1) {
					asteroidUI.clear(table);
					asteroidUI.renderTable(filtered, table, hidden, --currInd);
					current.classList.remove('active');
					pagination.children[currInd].classList.add('active');
				}
			}
			if(e.target.innerText === '»') {
				if(currInd < pagArray.length - 2) {
					asteroidUI.clear(table);
					asteroidUI.renderTable(filtered, table, hidden, ++currInd);
					current.classList.remove('active');
					pagination.children[currInd].classList.add('active');
				}
			}
		}
	}
})
//sortiranje u tabeli
table.addEventListener('click', e => {
	const sortType = e.target.innerText;
	switch(sortType) {
		case 'Datum': {
			asteroidUI.clear(table); //brisanje
			const sorted = filtered.sort((e1, e2) => {
				const date1 = new Date(e1.close_approach_data[0].close_approach_date);
				const date2 = new Date(e2.close_approach_data[0].close_approach_date);
				if(date1 > date2) return 1;
				if(date1 < date2) return -1;
				return 0;
			});
			asteroidUI.renderTable(sorted, table, hidden);
			break;
		}
		case 'Ime': {
			asteroidUI.clear(table); //brisanje
			const sorted = filtered.sort((e1, e2) => {
				if(e1.name > e2.name) return 1;
				if(e1.name < e2.name) return -1;
				return 0;
			});
			asteroidUI.renderTable(sorted, table, hidden);
			break;
		}
		case 'Brzina kretanja(km/h)': {
			asteroidUI.clear(table); //brisanje
			const sorted = filtered.sort((e1, e2) => {
				const speed1 = e1.close_approach_data[0].relative_velocity.kilometers_per_hour;
				const speed2 = e2.close_approach_data[0].relative_velocity.kilometers_per_hour;
				if(parseFloat(speed1) > parseFloat(speed2)) return 1;
				if(parseFloat(speed1) < parseFloat(speed2)) return -1;
				return 0;
			});
			asteroidUI.renderTable(sorted, table, hidden);
			break;
		}
		case 'Min. Precnik(m)': {
			asteroidUI.clear(table); //brisanje
			const sorted = filtered.sort((e1, e2) => {
				const minR1 = e1.estimated_diameter.meters.estimated_diameter_min;
				const minR2 = e2.estimated_diameter.meters.estimated_diameter_min;
				if(parseFloat(minR1) > parseFloat(minR2)) return 1;
				if(parseFloat(minR1) < parseFloat(minR2)) return -1;
				return 0;
			});
			asteroidUI.renderTable(sorted, table, hidden);
			break;
		}
		case 'Max. Precnik(m)': {
			asteroidUI.clear(table); //brisanje
			const sorted = filtered.sort((e1, e2) => {
				const maxR1 = e1.estimated_diameter.meters.estimated_diameter_max;
				const maxR2 = e2.estimated_diameter.meters.estimated_diameter_max;
				if(parseFloat(maxR1) > parseFloat(maxR2)) return 1;
				if(parseFloat(maxR1) < parseFloat(maxR2)) return -1;
				return 0;
			});
			asteroidUI.renderTable(sorted, table, hidden);
			break;
		}
		default: {
			console.log('nista');
		}
	}
});
//osluckivanje doganja tipa 'click' na dugmetu
deleteList.addEventListener('click', () => {
	asteroidUI.clear(lista);
	chartButton.style.display = 'none';
	deleteList.style.display = 'none';
	localStorage.removeItem('asteroids_list');
	localStorageArray = [];
})
//validacija datuma
const dateValidation = (date1, date2) => {
	const now = new Date();
	if(date1 > now || date2 > now || date1 > date2) {
		return false;
	}
	const numSec = date2 - date1;
	if(numSec / (1000 * 60 * 60 * 24) > 7) {
		return false;
	}
	return true;
}
// filtriranje asteroida
const filterAsteroids = (data) => {
	let filteredArr = new Array();
	const asteroids = Object.values(data.near_earth_objects);
	asteroids.forEach(group => {
		const filteredGroup = group.filter(asteroid => asteroid.is_potentially_hazardous_asteroid);
		//spread
		filteredArr.push(... filteredGroup);
	});
	return filteredArr;
}