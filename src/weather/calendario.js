(function () {
	function ensureStyles() {
		if (document.getElementById("calendario-dinamico-styles")) return;
		const css = `
			.dia-actual {
				border: 4px solid #007bff;
				display: flex;
				justify-content: center;
				align-items: center;
				animation: cambioColor 2s infinite alternate ease-in-out;
				width: 100%;
				height: 100%;
				box-sizing: border-box;
			}
			@keyframes cambioColor {
				0% { border-color: #007bff; }
				100% { border-color: #7ec8ff; }
			}
			.days-month > span { display: inline-flex; justify-content: center; align-items: center; min-height: 40px; min-width: 40px; box-sizing: border-box; }
			`;
		const style = document.createElement("style");
		style.id = "calendario-dinamico-styles";
		style.appendChild(document.createTextNode(css));
		document.head.appendChild(style);
	}

	function buildCalendar() {
		const daysContainer = document.querySelector(".days-month");
		if (!daysContainer) {
			console.error("calendario.js: no se encontró el elemento .days-month en el DOM.");
			return;
		}
		daysContainer.innerHTML = "";
		const today = new Date();
		const currentDay = today.getDate();
		const year = today.getFullYear();
		const month = today.getMonth(); 
		let firstDay = new Date(year, month, 1).getDay();
		firstDay = firstDay === 0 ? 6 : firstDay - 1;
		const realDaysInMonth = new Date(year, month + 1, 0).getDate();
		console.info(`calendario.js: año=${year}, mesIndex=${month}, primerDiaIndex(lun=0)=${firstDay}, diasReales=${realDaysInMonth}, hoy=${currentDay}`);

		let day = 1;
		for (let i = 0; i < 28; i++) {
			const span = document.createElement("span");

			if (i < firstDay) {
				daysContainer.appendChild(span);
				continue;
			}
			if (day <= realDaysInMonth && day <= 28) {
				const img = document.createElement("img");

				img.src = `../assets/${day}.png`;
				img.alt = `día ${day}`;

				img.onerror = function () {
					console.warn(`calendario.js: imagen no encontrada para el día ${day}: ${img.src}`);
					img.style.display = "none";
					const text = document.createElement("span");
					text.textContent = day;
					text.style.pointerEvents = "none";
					span.appendChild(text);
				};

				span.appendChild(img);

				if (day === currentDay) {
					span.classList.add("dia-actual");
				}
				daysContainer.appendChild(span);
				day++;
			} else {
				daysContainer.appendChild(span);
			}
		}
		if (currentDay > 28) {
			console.warn(`calendario.js: el día actual (${currentDay}) es mayor que 28, por lo que no se marcará en el grid (límite 28).`);
		}
	}

	function start() {
		ensureStyles();
		buildCalendar();
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", start);
	} else {
		start();
	}
})();
