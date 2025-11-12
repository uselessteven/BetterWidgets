export async function marcarEventosEnCalendarioGoogle(eventos = []) {
	console.log("Marcando eventos en calendario:", eventos);

	if (!eventos || eventos.length === 0) {
		console.warn("No hay eventos para marcar en el calendario.");
		return;
	}

	const spans = document.querySelectorAll(".days-month span[data-day]");
	if (!spans.length) {
		console.error("No se encontraron spans de dias en el calendario.");
		return;
	}

	eventos.forEach(event => {
		try {
			let fechaEvento = new Date(event.start);

			if (event.start && !event.start.includes("T")) {
				const [year, month, day] = event.start.split("-").map(Number);
				fechaEvento = new Date(year, month - 1, day);
			}

			const dia = fechaEvento.getDate();
			const mes = fechaEvento.getMonth();
			const año = fechaEvento.getFullYear();

			console.log(`Evento '${event.summary}' → ${dia}/${mes + 1}/${año}`);

			spans.forEach(span => {
				if (
					parseInt(span.dataset.day) === dia &&
					parseInt(span.dataset.month) === mes &&
					parseInt(span.dataset.year) === año
				) {
					console.log(`Marcando evento en dia ${dia}`);
					span.classList.add("event-day");
				}
			});
		} catch (err) {
			console.error("Error al marcar evento:", err);
		}
	});
}
