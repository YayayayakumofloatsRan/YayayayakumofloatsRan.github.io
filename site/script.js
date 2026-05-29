const root = document.documentElement;
const themeToggle = document.querySelector("#themeToggle");
const themeLabel = document.querySelector("#themeLabel");
const canvas = document.querySelector(".network-canvas");
const context = canvas?.getContext("2d");
const screenStage = document.querySelector("#screenStage");
const screenPanels = Array.from(document.querySelectorAll(".screen-panel"));
const screenDots = document.querySelector("#screenDots");
const screenPrev = document.querySelector("#screenPrev");
const screenNext = document.querySelector("#screenNext");
const currentScreen = document.querySelector("#currentScreen");
const totalScreens = document.querySelector("#totalScreens");
const focusButtons = document.querySelectorAll("[data-focus]");
const movieButtons = document.querySelectorAll("[data-movie-filter]");
const movieCards = document.querySelectorAll(".movie-card");
const aptTrigger = document.querySelector("#aptTrigger");
const aptPanel = document.querySelector("#aptPanel");
const gallerySection = document.querySelector(".gallery-section");
const gallerySize = document.querySelector("#gallerySize");
const gallerySizeValue = document.querySelector("#gallerySizeValue");
const orbitRange = document.querySelector("#orbitRange");
const orbitReadout = document.querySelector("#orbitReadout");

const storedTheme = localStorage.getItem("nemo-theme-v3");
const storedGallerySize = localStorage.getItem("nemo-gallery-size");

let nodes = [];
let animationFrame = 0;
let activeScreen = 0;
let wheelLock = 0;
let scrollFrame = 0;

function setTheme(theme) {
  root.dataset.theme = theme;
  localStorage.setItem("nemo-theme-v3", theme);
  if (themeLabel) {
    themeLabel.textContent = theme === "dark" ? "Light" : "Dark";
  }
}

function screenLabel(index) {
  return String(index + 1).padStart(2, "0");
}

function updateScreenState(index) {
  activeScreen = Math.max(0, Math.min(screenPanels.length - 1, index));

  document.body.dataset.screen = screenPanels[activeScreen]?.id || `screen-${activeScreen}`;
  currentScreen && (currentScreen.textContent = screenLabel(activeScreen));
  totalScreens && (totalScreens.textContent = screenLabel(screenPanels.length - 1));

  screenDots?.querySelectorAll(".screen-dot").forEach((dot, dotIndex) => {
    dot.classList.toggle("active", dotIndex === activeScreen);
    dot.setAttribute("aria-current", dotIndex === activeScreen ? "true" : "false");
  });
}

function nearestScreenIndex() {
  if (!screenStage) return 0;
  const left = screenStage.scrollLeft;
  return screenPanels.reduce((best, panel, index) => {
    const currentDistance = Math.abs(panel.offsetLeft - left);
    const bestDistance = Math.abs(screenPanels[best].offsetLeft - left);
    return currentDistance < bestDistance ? index : best;
  }, 0);
}

function navigateScreen(target) {
  if (!screenStage || screenPanels.length === 0) return;

  const nextIndex =
    typeof target === "string"
      ? Math.max(0, screenPanels.findIndex((panel) => panel.id === target.replace("#", "")))
      : Math.max(0, Math.min(screenPanels.length - 1, target));
  const panel = screenPanels[nextIndex];

  if (!panel) return;

  screenStage.scrollTo({ left: panel.offsetLeft, behavior: "smooth" });
  updateScreenState(nextIndex);

  if (panel.id) {
    history.replaceState(null, "", `#${panel.id}`);
  }
}

function buildScreenDots() {
  if (!screenDots) return;
  screenDots.textContent = "";
  screenPanels.forEach((panel, index) => {
    const dot = document.createElement("button");
    dot.className = "screen-dot";
    dot.type = "button";
    dot.setAttribute("aria-label", `Go to ${panel.id || `screen ${index + 1}`}`);
    dot.addEventListener("click", () => navigateScreen(index));
    screenDots.append(dot);
  });
}

function setFocus(focus) {
  document.body.dataset.focus = focus;
  focusButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.focus === focus);
  });

  const target = {
    systems: "#projects",
    astronomy: "#astronomy",
    gallery: "#gallery",
  }[focus];

  if (target) {
    navigateScreen(target);
  } else {
    navigateScreen(0);
  }
}

function setMovieFilter(filter) {
  movieButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.movieFilter === filter);
  });

  movieCards.forEach((card) => {
    card.classList.toggle("is-hidden", filter !== "all" && !card.classList.contains(filter));
  });
}

function setGallerySize(size) {
  const nextSize = Math.max(150, Math.min(290, Number(size) || 210));
  gallerySection?.style.setProperty("--gallery-min", `${nextSize}px`);

  if (gallerySize) {
    gallerySize.value = String(nextSize);
  }

  if (gallerySizeValue) {
    gallerySizeValue.textContent = `${nextSize}px`;
  }

  localStorage.setItem("nemo-gallery-size", String(nextSize));
}

function setOrbitAngle(value) {
  const angle = Math.max(0, Math.min(360, Number(value) || 0));
  document.querySelector(".constellation-screen")?.style.setProperty("--orbit-angle", `${angle}deg`);

  if (orbitRange) {
    orbitRange.value = String(angle);
  }

  if (orbitReadout) {
    orbitReadout.textContent = `${angle}°`;
  }
}

function resizeCanvas() {
  if (!canvas || !context) return;

  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(window.innerWidth * ratio);
  canvas.height = Math.floor(window.innerHeight * ratio);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);

  nodes = Array.from({ length: Math.min(90, Math.floor(window.innerWidth / 16)) }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    vx: (Math.random() - 0.5) * 0.22,
    vy: (Math.random() - 0.5) * 0.22,
  }));
}

function palette() {
  const dark = root.dataset.theme === "dark";
  return {
    dot: dark ? "rgba(241, 199, 108, 0.42)" : "rgba(154, 107, 31, 0.34)",
    line: dark ? "rgba(128, 215, 208," : "rgba(37, 122, 121,",
  };
}

function drawNetwork() {
  if (!context) return;

  const colors = palette();
  context.clearRect(0, 0, window.innerWidth, window.innerHeight);
  context.lineWidth = 1;

  nodes.forEach((node, index) => {
    node.x += node.vx;
    node.y += node.vy;

    if (node.x < 0 || node.x > window.innerWidth) node.vx *= -1;
    if (node.y < 0 || node.y > window.innerHeight) node.vy *= -1;

    context.fillStyle = colors.dot;
    context.fillRect(node.x, node.y, 1.6, 1.6);

    for (let next = index + 1; next < nodes.length; next += 1) {
      const other = nodes[next];
      const distance = Math.hypot(node.x - other.x, node.y - other.y);

      if (distance < 118) {
        context.strokeStyle = `${colors.line} ${0.14 * (1 - distance / 118)})`;
        context.beginPath();
        context.moveTo(node.x, node.y);
        context.lineTo(other.x, other.y);
        context.stroke();
      }
    }
  });

  animationFrame = window.requestAnimationFrame(drawNetwork);
}

themeToggle?.addEventListener("click", () => {
  const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
  setTheme(nextTheme);
});

focusButtons.forEach((button) => {
  button.addEventListener("click", () => setFocus(button.dataset.focus));
});

document.querySelectorAll(".nav a").forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = link.getAttribute("href");
    if (target?.startsWith("#")) {
      event.preventDefault();
      navigateScreen(target);
    }
  });
});

movieButtons.forEach((button) => {
  button.addEventListener("click", () => setMovieFilter(button.dataset.movieFilter));
});

gallerySize?.addEventListener("input", () => setGallerySize(gallerySize.value));
orbitRange?.addEventListener("input", () => setOrbitAngle(orbitRange.value));

screenPrev?.addEventListener("click", () => navigateScreen(activeScreen - 1));
screenNext?.addEventListener("click", () => navigateScreen(activeScreen + 1));

screenStage?.addEventListener("scroll", () => {
  window.cancelAnimationFrame(scrollFrame);
  scrollFrame = window.requestAnimationFrame(() => updateScreenState(nearestScreenIndex()));
});

screenStage?.addEventListener(
  "wheel",
  (event) => {
    const intent = Math.abs(event.deltaY) > Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
    if (Math.abs(intent) < 8) return;

    event.preventDefault();
    const now = Date.now();
    if (now - wheelLock < 640) return;

    wheelLock = now;
    navigateScreen(activeScreen + Math.sign(intent));
  },
  { passive: false },
);

window.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight" || event.key === "PageDown") {
    navigateScreen(activeScreen + 1);
  }

  if (event.key === "ArrowLeft" || event.key === "PageUp") {
    navigateScreen(activeScreen - 1);
  }
});

aptTrigger?.addEventListener("click", () => {
  const open = aptPanel?.hasAttribute("hidden");
  aptPanel?.toggleAttribute("hidden", !open);
  aptTrigger.textContent = open ? "deadlock resolved?" : "apt not found";
});

window.addEventListener("resize", resizeCanvas);
window.addEventListener("pagehide", () => window.cancelAnimationFrame(animationFrame));

setTheme(storedTheme || "light");
buildScreenDots();
setFocus("all");
setMovieFilter("all");
setGallerySize(storedGallerySize || gallerySize?.value || 210);
setOrbitAngle(orbitRange?.value || 42);
updateScreenState(0);
resizeCanvas();
drawNetwork();
