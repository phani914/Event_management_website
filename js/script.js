const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
const themeToggle = document.querySelector(".theme-toggle");

function setTheme(theme) {
  const isDark = theme === "dark";
  document.body.classList.toggle("dark-theme", isDark);

  if (themeToggle) {
    themeToggle.setAttribute("aria-pressed", String(isDark));
    themeToggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
  }

  localStorage.setItem("eventhub-theme", theme);
}

const savedTheme = localStorage.getItem("eventhub-theme") || "light";
setTheme(savedTheme);

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const nextTheme = document.body.classList.contains("dark-theme") ? "light" : "dark";
    setTheme(nextTheme);
  });
}

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    navToggle.classList.toggle("active", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.addEventListener("click", (event) => {
    if (event.target.tagName === "A") {
      navLinks.classList.remove("open");
      navToggle.classList.remove("active");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });
}

const countdown = document.querySelector(".countdown");
const countdownStatus = document.getElementById("countdown-status");
const countdownUnits = countdown ? {
  days: countdown.querySelector("#days"),
  hours: countdown.querySelector("#hours"),
  minutes: countdown.querySelector("#minutes"),
  seconds: countdown.querySelector("#seconds"),
} : null;

function updateCountdown() {
  if (!countdown || !countdownUnits || Object.values(countdownUnits).some((unit) => !unit)) return;

  const eventDate = new Date(countdown.dataset.eventDate).getTime();
  const now = Date.now();
  const difference = Math.max(eventDate - now, 0);
  const isLive = eventDate <= now;

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((difference / (1000 * 60)) % 60);
  const seconds = Math.floor((difference / 1000) % 60);

  countdownUnits.days.textContent = String(days).padStart(2, "0");
  countdownUnits.hours.textContent = String(hours).padStart(2, "0");
  countdownUnits.minutes.textContent = String(minutes).padStart(2, "0");
  countdownUnits.seconds.textContent = String(seconds).padStart(2, "0");

  if (countdownStatus && isLive) {
    countdownStatus.textContent = "The summit is live now";
  }
}

updateCountdown();
setInterval(updateCountdown, 1000);
