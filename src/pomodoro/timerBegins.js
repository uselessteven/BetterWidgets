const taskValue = localStorage.getItem("taskValue") || "No task available";
const displayTask = document.getElementById("task");

if (displayTask) {
	displayTask.textContent = taskValue;
}

function startCountdown(durationMins) {
	let duration = durationMins * 60;

	const displayTime = document.getElementById("time-remaining");

	function updateCountdown() {
		let minutes = Math.floor(duration / 60);
		let seconds = duration % 60;

		displayTime.textContent = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

		if (duration > 0) {
			duration--;
		} else {
			clearInterval(interval);
			window.electronAPI.loadPage("src/pomodoro/stopWork.html");
		}
	}
	updateCountdown();
	const interval = setInterval(updateCountdown, 1000);
}

window.onload = function () {
	startCountdown(0.1);
};