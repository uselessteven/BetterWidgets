async function loadWeather() {
  try {
    const CITY = "San Salvador";
    const response = await fetch(`https://wttr.in/${CITY}?format=j1`);
    if (!response.ok) throw new Error("Error al obtener datos del clima");

    const data = await response.json();

    const weatherDesc = data.current_condition[0].weatherDesc[0].value.toLowerCase();

    const climaImg = document.querySelector(".div1 img");
    const seasonImg = document.querySelector(".div3 img");

    if (weatherDesc.includes("rain") || weatherDesc.includes("lluvia")) {
      climaImg.src = "../assets/lluvia.png";
    } else if (
      weatherDesc.includes("cloud") ||
      weatherDesc.includes("nublado") ||
      weatherDesc.includes("wind")
    ) {
      climaImg.src = "../assets/viento.png";
    } else if (
      weatherDesc.includes("storm") ||
      weatherDesc.includes("tormenta") ||
      weatherDesc.includes("thunder")
    ) {
      climaImg.src = "../assets/tormenta.png";
    } else if (
      weatherDesc.includes("sun") ||
      weatherDesc.includes("clear") ||
      weatherDesc.includes("soleado")
    ) {
      climaImg.src = "../assets/soleado.png";
    } else {
      climaImg.src = "../assets/festivo.png";
    }

    const month = new Date().getMonth() + 1;
    let season = "invierno.png";

    if (month >= 3 && month <= 5) season = "primavera.png";
    else if (month >= 6 && month <= 8) season = "verano.png";
    else if (month >= 9 && month <= 11) season = "invierno.png";
    else season = "invierno.png";

    seasonImg.src = `../assets/${season}`;
  } catch (error) {
    console.error("Error cargando el clima:", error);
  }
}

document.addEventListener("DOMContentLoaded", loadWeather);
