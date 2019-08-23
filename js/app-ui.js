class AsteroidUI {
	constructor() {
		this.br = 0;
	}
	//rest
	clear(...elements) {
		elements.forEach(element => {
			element.innerHTML = '';
		});
	}
	//prikaz podataka u tabeli
	renderTable(asteroids, table, hidden, len = 1) {
		hidden.classList.remove('d-none');
		table.innerHTML += `<thead class="thead-light">
				<tr>
					<th scope="col">Datum</th>
					<th scope="col">Ime</th>
					<th scope="col">Brzina kretanja(km/h)</th>
					<th scope="col">Min. Precnik(m)</th>
					<th scope="col">Max. Precnik(m)</th>
				</tr>
			</thead>`
		for(let i = (len - 1) * 10; i < len * 10; i++) {
			if(i === asteroids.length) break;
			table.innerHTML += `<tr>
				<td>${asteroids[i].close_approach_data[0].close_approach_date}</td>
				<td>${asteroids[i].name}</td>
				<td>${asteroids[i].close_approach_data[0].relative_velocity.kilometers_per_hour}</td>
				<td>${asteroids[i].estimated_diameter.meters.estimated_diameter_min}</td>
				<td>${asteroids[i].estimated_diameter.meters.estimated_diameter_max}</td>
			</tr>`;
		}
	}
	//dodavanja podataka u listu
	renderList(list, asteroid) {
		list.innerHTML += `
		<li class="list-group-item d-flex justify-content-between align-items-center">
			<span>${asteroid}</span>
			<i class="delete">X</i>
		</li>`;
	}
	//dodavanje paginacije(ako ima potrebe)
	renderPagination(pagination, asteroids) {
		if(asteroids.length > 10) {
			const pageNumber = Math.ceil(asteroids.length / 10);
			let html = '';
			pagination.innerHTML += `<li class="page-item"><span class="page-link">&laquo;</span></li>`;
			for(let i = 1; i <= pageNumber; i++) {
				html += `<li class="page-item"><span class="page-link">${i}</span></li>`;
			}
			pagination.innerHTML += html;
			pagination.innerHTML += `<li class="page-item"><span class="page-link">&raquo;</span></li>`;
			pagination.children[1].classList.add('active');
		}
	}
	//prikazivanje podataka u grafikonima i animiranje grafikona
	renderCharts(chart, name, x) {
		let color;
		if(x <= 25) color = '#48E229';
		else if(x > 25 && x <= 45) color = '#F6EB43';
		else if(x > 45 && x <= 75) color = '#ffc107';
		else color = '#dc3545';
		chart.innerHTML += `<div class="row p-3">
				<div class="col-2"><h5>${name}</h5></div>
				<div class="col-10"><div style="padding: 5px; background-color: ${color}; 
				text-align: center; width: 0"><span style="color: white;"></span></div></div>
				</div>`;
		let width = 0;
		const timer = setInterval(() => {
			width++;
			chart.children[this.br].children[1].children[0].style.width = `${width * 5}px`;
			chart.children[this.br].children[1].children[0].children[0].innerText = width;
			if(width >= x) {
				this.br++;
				clearInterval(timer);
			}
		}, 30);
	}
	setList(asteroids, list) {
		list.innerHTML = '';
		let html = '';
		asteroids.forEach(asteroid => {
			html += `<option value="${asteroid.name}"></option>`;
		});
		list.innerHTML = html;
	}
	createError(error, text) {
		error.textContent = text;
		error.classList.remove('d-none');
	}
}