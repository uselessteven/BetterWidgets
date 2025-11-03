const text = document.querySelector(".mobile");
const startBtn = document.getElementById("start-btn");

startBtn.addEventListener("click", () => {
  window.electronAPI.loadPage("src/feelings/writeToday.html");
});

const changeRectangleColor = (color) => {
  text.classList.remove("bg-ACC794", "bg-283593", "bg-FF7704");

  if (color === "#ACC794") {
    text.classList.add("bg-ACC794");
  } else if (color === "#283593") {
    text.classList.add("bg-283593");
  } else if (color === "#FF7704") {
    text.classList.add("bg-FF7704");
  }
};

const textChange = () => {
  const words = ["apenado", "triste", "enojado"];
  const textColors = ["#739159", "#172063", "#8f4000"];
  const bgColors = ["#ACC794", "#283593", "#FF7704"];
  const rectColors = ["#ACC794", "#283593", "#FF7704"];

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