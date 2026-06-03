const root = document.documentElement;
const themeToggle = document.querySelector("#themeToggle");
const themeLabel = document.querySelector("#themeLabel");
const canvas = document.querySelector(".network-canvas");
const context = canvas?.getContext("2d");
const deckViewport = document.querySelector("#stellarDeck");
const deckPanels = Array.from(document.querySelectorAll("[data-deck-panel]"));
const deckEdgeButtons = document.querySelectorAll("[data-deck-action]");
const focusButtons = document.querySelectorAll("[data-focus]");
const movieButtons = document.querySelectorAll("[data-movie-filter]");
const movieCards = document.querySelectorAll(".movie-card");
const aptTrigger = document.querySelector("#aptTrigger");
const aptPanel = document.querySelector("#aptPanel");
const gallerySection = document.querySelector(".gallery-section");
const galleryButtons = document.querySelectorAll("[data-gallery-filter]");
const galleryCards = document.querySelectorAll("[data-gallery-card]");
const gallerySize = document.querySelector("#gallerySize");
const gallerySizeValue = document.querySelector("#gallerySizeValue");
const orbitRange = document.querySelector("#orbitRange");
const orbitReadout = document.querySelector("#orbitReadout");

const initialHash = window.location.hash;
const storedTheme = localStorage.getItem("nemo-theme-v3");
const storedGallerySize = localStorage.getItem("nemo-gallery-size");

let nodes = [];
let animationFrame = 0;
let deckHeightFrame = 0;
let deckMotionTimer = 0;
let resizeFrame = 0;
let lastNetworkFrame = 0;
let activeDeck = 0;

const networkFrameMs = 1000 / 30;

function setTheme(theme) {
  root.dataset.theme = theme;
  localStorage.setItem("nemo-theme-v3", theme);
  if (themeLabel) {
    themeLabel.textContent = theme === "dark" ? "Light" : "Dark";
  }
}

function deckLabel(index) {
  return String(index + 1).padStart(2, "0");
}

function deckId(panel) {
  return panel?.dataset.deckId || panel?.id || "intro";
}

function wrapDeckIndex(index) {
  if (deckPanels.length === 0) return 0;
  return ((index % deckPanels.length) + deckPanels.length) % deckPanels.length;
}

function circularDeckDelta(panelIndex, activeIndex) {
  if (deckPanels.length === 0) return 0;

  let delta = panelIndex - activeIndex;
  const midpoint = deckPanels.length / 2;

  if (delta > midpoint) delta -= deckPanels.length;
  if (delta < -midpoint) delta += deckPanels.length;

  return delta;
}

function markDeckMotion() {
  document.body.classList.add("is-deck-moving");
  window.clearTimeout(deckMotionTimer);
  deckMotionTimer = window.setTimeout(() => {
    document.body.classList.remove("is-deck-moving");
  }, 720);
}

function updateDeckState(index) {
  activeDeck = wrapDeckIndex(index);
  markDeckMotion();

  document.body.dataset.deck = deckId(deckPanels[activeDeck]);

  deckPanels.forEach((panel, panelIndex) => {
    const delta = circularDeckDelta(panelIndex, activeDeck);
    panel.classList.toggle("active", panelIndex === activeDeck);
    panel.classList.toggle("is-prev", delta === -1);
    panel.classList.toggle("is-next", delta === 1);
    panel.classList.toggle("is-far", Math.abs(delta) > 1);
    panel.setAttribute("aria-hidden", panelIndex === activeDeck ? "false" : "true");
    panel.querySelectorAll("[data-deck-action]").forEach((button) => {
      button.tabIndex = panelIndex === activeDeck ? 0 : -1;
    });
  });
}

function deckIndexFromTarget(target) {
  const id = String(target).replace("#", "");
  const found = deckPanels.findIndex((panel) => deckId(panel) === id || panel.id === id);
  return found >= 0 ? found : -1;
}

function deckBaselineHeight() {
  const mobile = window.matchMedia("(max-width: 560px)").matches;
  return Math.max(mobile ? 640 : 720, window.innerHeight - (mobile ? 160 : 72));
}

function deckContentHeight(panel) {
  if (!panel) return 0;

  const style = window.getComputedStyle(panel);
  const paddingBottom = Number.parseFloat(style.paddingBottom) || 0;
  const children = Array.from(panel.children).filter((child) => {
    return window.getComputedStyle(child).position !== "absolute";
  });

  return children.reduce((bottom, child) => {
    return Math.max(bottom, child.offsetTop + child.offsetHeight);
  }, 0) + paddingBottom;
}

function syncDeckHeight(index = activeDeck) {
  if (!deckViewport || deckPanels.length === 0) return;

  const baseline = deckBaselineHeight();
  const activePanel = deckPanels[wrapDeckIndex(index)];

  window.cancelAnimationFrame(deckHeightFrame);
  deckHeightFrame = window.requestAnimationFrame(() => {
    const maxContentHeight = deckPanels.reduce((height, panel) => {
      return Math.max(height, deckContentHeight(panel) + 32);
    }, baseline);
    const activeScrollHeight = activePanel?.scrollHeight || 0;
    const cappedScrollHeight = Math.min(activeScrollHeight, maxContentHeight + 64);
    const nextHeight = Math.ceil(Math.max(baseline, maxContentHeight, cappedScrollHeight));
    deckViewport.style.setProperty("--deck-height", `${nextHeight}px`);
  });
}

function navigateDeck(target, options = {}) {
  if (deckPanels.length === 0) return;

  const nextIndex =
    typeof target === "string"
      ? deckIndexFromTarget(target)
      : wrapDeckIndex(target);
  const panel = deckPanels[nextIndex];

  if (!panel) return;

  updateDeckState(nextIndex);
  syncDeckHeight(nextIndex);

  if (options.scrollIntoView !== false) {
    document.querySelector(".stellar-deck-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const id = deckId(panel);
  if (id) {
    history.replaceState(null, "", `#${id}`);
  }
}

function navigateToHash(target) {
  if (!target?.startsWith("#")) return;

  const deckIndex = deckIndexFromTarget(target);
  if (deckIndex >= 0 || target === "#intro") {
    navigateDeck(deckIndex >= 0 ? deckIndex : 0);
    return;
  }

  const element = document.querySelector(target);
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", target);
  }
}

function setFocus(focus, shouldNavigate = true) {
  document.body.dataset.focus = focus;
  focusButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.focus === focus);
  });

  if (!shouldNavigate) return;

  const target = {
    systems: "#projects",
    astronomy: "#astronomy",
    gallery: "#gallery",
  }[focus];

  if (target) {
    navigateToHash(target);
  } else {
    navigateDeck(0);
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

function setGalleryFilter(filter) {
  galleryButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.galleryFilter === filter);
  });

  galleryCards.forEach((card) => {
    const kind = card.dataset.galleryKind || "";
    card.classList.toggle("is-hidden", filter !== "all" && kind !== filter);
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

  const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
  canvas.width = Math.floor(window.innerWidth * ratio);
  canvas.height = Math.floor(window.innerHeight * ratio);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);

  nodes = Array.from({ length: Math.min(64, Math.floor(window.innerWidth / 22)) }, () => ({
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

function drawNetwork(timestamp = 0) {
  if (!context) return;

  animationFrame = window.requestAnimationFrame(drawNetwork);
  if (timestamp - lastNetworkFrame < networkFrameMs) return;
  lastNetworkFrame = timestamp;

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
      navigateToHash(target);
    }
  });
});

movieButtons.forEach((button) => {
  button.addEventListener("click", () => setMovieFilter(button.dataset.movieFilter));
});

galleryButtons.forEach((button) => {
  button.addEventListener("click", () => setGalleryFilter(button.dataset.galleryFilter));
});

gallerySize?.addEventListener("input", () => setGallerySize(gallerySize.value));
orbitRange?.addEventListener("input", () => setOrbitAngle(orbitRange.value));

deckEdgeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const direction = button.dataset.deckAction === "prev" ? -1 : 1;
    navigateDeck(activeDeck + direction, { scrollIntoView: false });
  });
});

aptTrigger?.addEventListener("click", () => {
  const open = aptPanel?.hasAttribute("hidden");
  aptPanel?.toggleAttribute("hidden", !open);
  aptTrigger.textContent = open ? "deadlock resolved?" : "apt not found";
  syncDeckHeight();
});

window.addEventListener("resize", () => {
  window.cancelAnimationFrame(resizeFrame);
  resizeFrame = window.requestAnimationFrame(() => {
    resizeCanvas();
    syncDeckHeight();
  });
});
window.addEventListener("pagehide", () => {
  window.cancelAnimationFrame(animationFrame);
  window.cancelAnimationFrame(deckHeightFrame);
  window.cancelAnimationFrame(resizeFrame);
});

setTheme(storedTheme || "light");
setFocus("all", false);
setMovieFilter("all");
setGalleryFilter("all");
setGallerySize(storedGallerySize || gallerySize?.value || 210);
setOrbitAngle(orbitRange?.value || 42);
updateDeckState(0);
if (initialHash) {
  navigateToHash(initialHash);
}
resizeCanvas();
syncDeckHeight();
drawNetwork();
