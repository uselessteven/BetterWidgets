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

			.event-day {
				border: 4px solid #28a745 !important;
				box-shadow: 0 0 10px rgba(40, 167, 69, 0.5);
				animation: parpadeoVerde 1.5s infinite alternate ease-in-out;
			}

			@keyframes parpadeoVerde {
				0% { border-color: #28a745; }
				100% { border-color: #85e085; }
			}

			@keyframes cambioColor {
				0% { border-color: #007bff; }
				100% { border-color: #7ec8ff; }
			}

			.days-month > span {
				display: inline-flex;
				justify-content: center;
				align-items: center;
				min-height: 40px;
				min-width: 40px;
				box-sizing: border-box;
				transition: all 0.3s ease;
				border-radius: 8px;
			}
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
		console.info(`calendario.js: año=${year}, mes=${month}, primerDia=${firstDay}, dias=${realDaysInMonth}, hoy=${currentDay}`);

		let day = 1;
		for (let i = 0; i < 28; i++) {
			const span = document.createElement("span");

			if (i < firstDay) {
				daysContainer.appendChild(span);
				continue;
			}

			if (day <= realDaysInMonth && day <= 28) {
				span.dataset.day = day;
				span.dataset.month = month;
				span.dataset.year = year;

				console.log(`Día ${day} → data-day=${span.dataset.day}`);

				const img = document.createElement("img");
				img.src = `../assets/${day}.png`;
				img.alt = `dia ${day}`;

				img.onerror = function () {
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
	}

	async function start() {
		ensureStyles();
		buildCalendar();

		const btn = document.getElementById("btn-cargar-eventos");
		if (!btn) {
			console.error("No se encontro el boton #btn-cargar-eventos");
			return;
		}

		btn.addEventListener("click", async () => {
			console.log("Solicitando eventos desde Google Calendar...");
			const result = await window.electronAPI.getCalendarEvents();

			if (result.ok) {
				const { marcarEventosEnCalendarioGoogle } = await import("./GoogleCalendar.js");
				await marcarEventosEnCalendarioGoogle(result.events);
			} else {
				console.error("Error al obtener eventos:", result.error);
			}
		});
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", start);
	} else {
		start();
	}
})();
