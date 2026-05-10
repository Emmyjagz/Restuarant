const body = document.body;
const header = document.querySelector("[data-header]");
const navToggle = document.querySelector("[data-nav-toggle]");
const nav = document.querySelector("[data-nav]");
const reservationForm = document.querySelector("[data-reservation-form]");
const statusMessage = document.querySelector("[data-form-status]");
const tabButtons = document.querySelectorAll("[data-tab-target]");
const tabPanels = document.querySelectorAll("[data-tab-panel]");
let audioContext;
let musicGain;
let musicTimer;
let musicStarted = false;

const syncHeader = () => {
  if (!header || header.classList.contains("light")) return;
  header.classList.toggle("is-scrolled", window.scrollY > 24);
};

const closeNav = () => {
  if (!navToggle) return;
  body.classList.remove("nav-open");
  navToggle.setAttribute("aria-expanded", "false");
  navToggle.setAttribute("aria-label", "Open navigation");
};

syncHeader();
window.addEventListener("scroll", syncHeader, { passive: true });

if (navToggle && nav) {
  navToggle.addEventListener("click", () => {
    const isOpen = body.classList.toggle("nav-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
  });

  nav.addEventListener("click", (event) => {
    if (event.target.matches("a")) closeNav();
  });
}

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const target = button.dataset.tabTarget;

    tabButtons.forEach((item) => {
      const isActive = item === button;
      item.classList.toggle("active", isActive);
      item.setAttribute("aria-selected", String(isActive));
    });

    tabPanels.forEach((panel) => {
      panel.classList.toggle("active", panel.id === target);
    });
  });
});

if (reservationForm && statusMessage) {
  reservationForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const data = new FormData(reservationForm);
    const firstName = String(data.get("name") || "Guest").trim().split(" ")[0] || "Guest";
    const date = data.get("date");
    const guests = data.get("guests");
    const time = data.get("time");
    const menu = data.get("menu") || "your selected menu";

    statusMessage.textContent = `${firstName}, your ${menu} request for ${guests} on ${date} at ${time} has been received. Our reservations team will confirm shortly.`;
    reservationForm.reset();
  });
}

const musicButton = document.createElement("button");
musicButton.className = "music-toggle";
musicButton.type = "button";
musicButton.textContent = "Jazz off";
musicButton.setAttribute("aria-pressed", "false");
document.body.appendChild(musicButton);

const chords = [
  [261.63, 329.63, 392.0, 493.88],
  [293.66, 349.23, 440.0, 523.25],
  [246.94, 311.13, 392.0, 466.16],
  [220.0, 277.18, 349.23, 440.0],
];

const playTone = (frequency, start, duration, type = "sine", volume = 0.045) => {
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(volume, start + 0.08);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  oscillator.connect(gain);
  gain.connect(musicGain);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.05);
};

const scheduleJazzBar = () => {
  if (!audioContext || !musicStarted) return;

  const now = audioContext.currentTime;
  const chord = chords[Math.floor(Math.random() * chords.length)];
  chord.forEach((note, index) => playTone(note, now + index * 0.035, 3.2, "sine", 0.025));

  playTone(110, now, 0.42, "triangle", 0.05);
  playTone(165, now + 1.25, 0.28, "triangle", 0.035);
  playTone(220, now + 2.1, 0.32, "triangle", 0.032);

  musicTimer = window.setTimeout(scheduleJazzBar, 3600);
};

const startMusic = async () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    musicGain = audioContext.createGain();
    musicGain.gain.value = 0.18;
    musicGain.connect(audioContext.destination);
  }

  await audioContext.resume();
  if (musicStarted) return;

  musicStarted = true;
  musicButton.classList.add("is-playing");
  musicButton.textContent = "Jazz on";
  musicButton.setAttribute("aria-pressed", "true");
  scheduleJazzBar();
};

const stopMusic = () => {
  musicStarted = false;
  window.clearTimeout(musicTimer);
  musicButton.classList.remove("is-playing");
  musicButton.textContent = "Jazz off";
  musicButton.setAttribute("aria-pressed", "false");
};

musicButton.addEventListener("click", () => {
  if (musicStarted) {
    stopMusic();
    return;
  }

  startMusic().catch(() => stopMusic());
});

startMusic().catch(() => {
  const unlockMusic = (event) => {
    if (event.target === musicButton) return;
    startMusic().finally(() => {
      window.removeEventListener("pointerdown", unlockMusic);
      window.removeEventListener("keydown", unlockMusic);
    });
  };

  window.addEventListener("pointerdown", unlockMusic, { once: true });
  window.addEventListener("keydown", unlockMusic, { once: true });
});
