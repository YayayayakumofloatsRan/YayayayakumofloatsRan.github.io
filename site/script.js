const root = document.documentElement;
const themeToggle = document.querySelector("#themeToggle");
const themeLabel = document.querySelector("#themeLabel");
const canvas = document.querySelector(".network-canvas");
const context = canvas?.getContext("2d");
const focusButtons = document.querySelectorAll("[data-focus]");
const movieButtons = document.querySelectorAll("[data-movie-filter]");
const movieCards = document.querySelectorAll(".movie-card");
const aptTrigger = document.querySelector("#aptTrigger");
const aptPanel = document.querySelector("#aptPanel");
const gallerySection = document.querySelector(".gallery-section");
const gallerySize = document.querySelector("#gallerySize");
const gallerySizeValue = document.querySelector("#gallerySizeValue");

const storedTheme = localStorage.getItem("nemo-theme-v3");
const storedGallerySize = localStorage.getItem("nemo-gallery-size");

let nodes = [];
let animationFrame = 0;

function setTheme(theme) {
  root.dataset.theme = theme;
  localStorage.setItem("nemo-theme-v3", theme);
  if (themeLabel) {
    themeLabel.textContent = theme === "dark" ? "Light" : "Dark";
  }
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
    document.querySelector(target)?.scrollIntoView({ behavior: "smooth", block: "start" });
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

movieButtons.forEach((button) => {
  button.addEventListener("click", () => setMovieFilter(button.dataset.movieFilter));
});

gallerySize?.addEventListener("input", () => setGallerySize(gallerySize.value));

aptTrigger?.addEventListener("click", () => {
  const open = aptPanel?.hasAttribute("hidden");
  aptPanel?.toggleAttribute("hidden", !open);
  aptTrigger.textContent = open ? "deadlock resolved?" : "apt not found";
});

window.addEventListener("resize", resizeCanvas);
window.addEventListener("pagehide", () => window.cancelAnimationFrame(animationFrame));

setTheme(storedTheme || "light");
setFocus("all");
setMovieFilter("all");
setGallerySize(storedGallerySize || gallerySize?.value || 210);
resizeCanvas();
drawNetwork();
