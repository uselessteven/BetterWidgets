const title = document.getElementById("final-title");
const success = document.getElementById("successTasks");
const conclusion = document.getElementById("conclusion");
const unsuccess = document.getElementById("unsuccessTasks");
const finalConclusion = Number(localStorage.getItem("finalProgress"));

console.log("Final Progress:", finalConclusion);
console.log("Type of finalProgress:", typeof finalConclusion);

if (isNaN(finalConclusion)) {
	console.log("Invalid final progress value");
} else if (finalConclusion === 100) {
	success.removeAttribute("hidden");
	title.innerHTML = "El huesoooooo!";
	conclusion.innerText = `Tu progreso fue del ${Math.round(finalConclusion)}%`;
} else {
	unsuccess.removeAttribute("hidden");
	title.innerHTML = "Manito tu tas bien?";
	conclusion.innerText = `Solo hiciste un ${Math.round(finalConclusion)}%`;
}

const homeBtn = document.getElementById("home-btn");
homeBtn.addEventListener("click", () => {
	window.electronAPI.loadPage("src/index.html");
});
