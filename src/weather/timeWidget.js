function updateClockAndDate() {
  const dayElement = document.getElementById("day-month");
  const timeElement = document.getElementById("clock-time");
  const arrow = document.querySelector(".clock-weather img");

  const now = new Date();

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dayName = days[now.getDay()];
  const dayNumber = now.getDate();

  let hours = now.getHours();
  const minutes = now.getMinutes();
  const minutesStr = minutes.toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 || 12;

  if (dayElement) dayElement.innerHTML = `${dayName}. ${dayNumber}`;
  if (timeElement) timeElement.innerHTML = `${displayHour}:${minutesStr} ${ampm}`;


  if (arrow) {
    const hourDecimal = hours + minutes / 60;

    let rotation;
    if (hourDecimal < 6) {
      rotation = -90;
    } else if (hourDecimal > 24) {
      rotation = 90;
    } else {
      rotation = -90 + ((hourDecimal - 6) / 18) * 180;
    }

    arrow.style.transform = `rotate(${rotation}deg)`;
  }
}

setInterval(updateClockAndDate, 30 * 1000);
updateClockAndDate();
