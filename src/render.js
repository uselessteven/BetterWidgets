window.addEventListener("DOMContentLoaded", () => {
			const minBtn = document.getElementById("min-btn");
			const maxBtn = document.getElementById("max-btn");
			const closeBtn = document.getElementById("close-btn");

			// Menu buttons
			const todoBtn = document.getElementById("todo-btn");
			const bouquetBtn = document.getElementById("bouquet-btn");
			const feelingsBtn = document.getElementById("feelings-btn");
			const pomodoroBtn = document.getElementById("pomodoro-btn");

			// --- Ventana ---
			if (minBtn) minBtn.addEventListener("click", () => window.electronAPI.minimize());
			if (maxBtn) maxBtn.addEventListener("click", () => window.electronAPI.maximize());
			if (closeBtn) closeBtn.addEventListener("click", () => window.electronAPI.close());

			window.electronAPI.onMaximize((event) => {
				maxBtn.src = "../assets/mini-maxi.png";
			});

			window.electronAPI.onRestore((event) => {
				maxBtn.src = "../assets/maximizar.png";
			});

			// --- Cambio de páginas ---
			todoBtn.addEventListener("click", () => window.electronAPI.loadPage("src/todo-list/todo.html"));
			bouquetBtn.addEventListener("click", () => window.electronAPI.loadPage("src/bouquete/bouquete.html"));
			feelingsBtn.addEventListener("click", () => window.electronAPI.loadPage("src/feelings/feelings.html"));
			pomodoroBtn.addEventListener("click", () => window.electronAPI.loadPage("src/pomodoro/pomodoro.html"));
		});