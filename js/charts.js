const chart = document.querySelector('.charts');

const key = 'x0HeIJzRCLm3lj0zrfXt2LltusKVCO7aoHmRkVq2';
let asteroids = new Array(); //iz localStorage-a
let dataAsteroids = new Array();

const asteroidUI = new AsteroidUI();

if(localStorage.asteroids_list) {
	asteroids.push(...JSON.parse(localStorage.asteroids_list));
}

const getBrojProlazaka = async (asteroid) => {
	const link = `http://www.neowsapp.com/rest/v1/neo/${asteroid.id}?api_key=${key}`;
	const response = await fetch(link);
	const data = await response.json();
	return data;
}

const filterBrojProlazaka = (array) => {
	let imeBrPro = new Array();
	//soritanje niza
	array = array.sort((ast1, ast2) => {
		if(ast1.close_approach_data.length > ast2.close_approach_data.length) return 1;
		if(ast1.close_approach_data.length < ast2.close_approach_data.length) return -1;
		return 0;
	});
	//novi niz sa objektima(ime i broj prolazaka)
	array.forEach(el => {
		let prolasci = el.close_approach_data;
		prolasci = prolasci.filter(el => filterDate(new Date(el.close_approach_date)));
		imeBrPro.push({name: el.name, cad: prolasci.length});
	});
	//poziv funkcije za renderovanje
	chart.style.display = 'block';
	imeBrPro.forEach(el => {
		asteroidUI.renderCharts(chart, el.name, el.cad);
	});
}

if(asteroids.length) {
	asteroids.forEach(asteroid => {
		getBrojProlazaka(asteroid)
			.then(data => {
				dataAsteroids.push(data);
				if(dataAsteroids.length === asteroids.length) {
					filterBrojProlazaka(dataAsteroids);
				}
			})
			.catch(err => console.log(err));
	});
}

const filterDate = (date) => {
	return (date.getFullYear() >= 1900 && date.getFullYear() <= 1999);
}