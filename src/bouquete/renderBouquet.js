window.addEventListener("DOMContentLoaded", () => {
  const flowerImages = [
    "../../assets/rose-straight.png",
    "../../assets/lys-straight.png",
    "../../assets/sunflower-straight.png",
    "../../assets/tulip-straight.png",
    "../../assets/babies-breath-straight.png",
    "../../assets/daisy-straight.png",
  ];

  const vaseImages = [
    "../../assets/pink-vase-straight.png",
    "../../assets/green-vase-straight.png",
    "../../assets/blue-vase-straight.png",
  ];
  const selectedFlowers =
    JSON.parse(localStorage.getItem("selectedFlowers")) || [];
  const selectedVase = parseInt(localStorage.getItem("selectedVase"), 10);

  const loverNameSpan = document.getElementById("lover-name");
  const loverMsgSpan = document.getElementById("lover-msg");

  const storedName = localStorage.getItem("loverName") || "Mi amor";
  const storedMsg =
    localStorage.getItem("loverMsg") || "Un dulce mensaje para ti";

  loverNameSpan.innerText = storedName;
  loverMsgSpan.innerText = storedMsg;

  if (selectedVase >= 0 && selectedVase < vaseImages.length) {
    document.getElementById("vase").src = vaseImages[selectedVase];
  }

  selectedFlowers.forEach((flowerIndex, i) => {
    if (flowerIndex >= 0 && flowerIndex < flowerImages.length) {
      document.getElementById(`flower${i + 1}`).src = flowerImages[flowerIndex];
    }
  });

  console.log("Rendering bouquet with:", selectedFlowers, selectedVase);
  const screenshotBtn = document.getElementById("screenshot-btn");

  screenshotBtn.addEventListener("click", () => {
    screenshotBtn.classList.add("hidden");
    window.electronAPI.captureScreenshot();
  });

  window.electronAPI.onScreenshotSaved((event, filePath) => {
    console.log("Captura guardada en :", filePath);
    alert(`Captura guardada en : ${filePath}`);
    screenshotBtn.classList.remove("hidden");
  });

  const restartBtn = document.getElementById("restart-btn");
  restartBtn.addEventListener("click", () => {
    window.electronAPI.loadPage("src/index.html");
  });
});