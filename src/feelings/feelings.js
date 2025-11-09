const text = document.querySelector(".mobile");
const startBtn = document.getElementById("start-btn");

startBtn.addEventListener("click", () => {
  window.electronAPI.loadPage("src/feelings/writeToday.html");
});

const changeRectangleColor = (color) => {
  text.classList.remove("bg-ACC794", "bg-283593", "bg-ec4848ff");

  if (color === "#ACC794") {
    text.classList.add("bg-ACC794");
  } else if (color === "#283593") {
    text.classList.add("bg-283593");
  } else if (color === "#ec4848ff") {
    text.classList.add("bg-ec4848ff");
  }
};

const textChange = () => {
  const words = ["apenado", "triste", "enojado"];
  const textColors = ["#739159", "#172063", "#d12323ff"];
  const bgColors = ["#ACC794", "#283593", "#ec4848ff"];
  const rectColors = ["#ACC794", "#283593", "#ec4848ff"];

  let index = 0;

  const updateText = () => {
    text.textContent = words[index];
    text.style.color = textColors[index];
    changeRectangleColor(rectColors[index]);
    document.body.style.backgroundColor = bgColors[index];
    index = (index + 1) % words.length;
  };

  updateText();
  setInterval(updateText, 4000);
};

textChange();

const restartBtn = document.getElementById("restart-btn");
restartBtn.addEventListener("click", () => {
  window.electronAPI.loadPage("src/index.html");
});