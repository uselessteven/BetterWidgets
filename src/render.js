window.addEventListener("DOMContentLoaded", () => {
	const minBtn = document.getElementById("min-btn");
	const maxBtn = document.getElementById("max-btn");
	const closeBtn = document.getElementById("close-btn");
	const todoBtn = document.getElementById("todo-btn");
	const bouquetBtn = document.getElementById("bouquet-btn");
	const feelingsBtn = document.getElementById("feelings-btn");
	const pomodoroBtn = document.getElementById("pomodoro-btn");
	if (minBtn) minBtn.addEventListener("click", () => window.electronAPI.minimize());
	if (maxBtn) maxBtn.addEventListener("click", () => window.electronAPI.maximize());
	if (closeBtn) closeBtn.addEventListener("click", () => window.electronAPI.close());
	todoBtn.addEventListener("click", () => window.electronAPI.loadPage("src/todo-list/todo.html"));
	bouquetBtn.addEventListener("click", () => window.electronAPI.loadPage("src/bouquete/bouquete.html"));
	feelingsBtn.addEventListener("click", () => window.electronAPI.loadPage("src/feelings/feelings.html"));
	pomodoroBtn.addEventListener("click", () => window.electronAPI.loadPage("src/pomodoro/pomodoro.html"));
});