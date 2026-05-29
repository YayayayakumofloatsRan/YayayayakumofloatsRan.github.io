const root = document.documentElement;
const themeToggle = document.querySelector("#themeToggle");
const themeLabel = document.querySelector("#themeLabel");
const canvas = document.querySelector(".network-canvas");
const context = canvas?.getContext("2d");
const deckViewport = document.querySelector("#stellarDeck");
const deckPanels = Array.from(document.querySelectorAll("[data-deck-panel]"));
const deckDots = document.querySelector("#deckDots");
const deckPrev = document.querySelector("#deckPrev");
const deckNext = document.querySelector("#deckNext");
const currentDeck = document.querySelector("#currentDeck");
const totalDecks = document.querySelector("#totalDecks");
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

const initialHash = window.location.hash;
const storedTheme = localStorage.getItem("nemo-theme-v3");
const storedGallerySize = localStorage.getItem("nemo-gallery-size");

let nodes = [];
let animationFrame = 0;
let activeDeck = 0;
let wheelLock = 0;

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

function updateDeckState(index) {
  activeDeck = Math.max(0, Math.min(deckPanels.length - 1, index));

  document.body.dataset.deck = deckId(deckPanels[activeDeck]);
  currentDeck && (currentDeck.textContent = deckLabel(activeDeck));
  totalDecks && (totalDecks.textContent = deckLabel(deckPanels.length - 1));

  deckPanels.forEach((panel, panelIndex) => {
    panel.classList.toggle("active", panelIndex === activeDeck);
    panel.classList.toggle("is-prev", panelIndex === activeDeck - 1);
    panel.classList.toggle("is-next", panelIndex === activeDeck + 1);
    panel.classList.toggle("is-far", Math.abs(panelIndex - activeDeck) > 1);
    panel.setAttribute("aria-hidden", panelIndex === activeDeck ? "false" : "true");
  });

  deckDots?.querySelectorAll(".deck-dot").forEach((dot, dotIndex) => {
    dot.classList.toggle("active", dotIndex === activeDeck);
    dot.setAttribute("aria-current", dotIndex === activeDeck ? "true" : "false");
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
  const panel = deckPanels[Math.max(0, Math.min(deckPanels.length - 1, index))];

  const fit = (attempt = 0) => {
    const needed = Math.ceil(deckContentHeight(panel) + 32);
    deckViewport.style.setProperty("--deck-height", `${Math.max(baseline, needed)}px`);

    if (attempt >= 5) return;

    window.setTimeout(() => {
      if (panel && panel.scrollHeight > panel.clientHeight + 4) {
        fit(attempt + 1);
      }
    }, 130);
  };

  window.requestAnimationFrame(() => fit());
}

function navigateDeck(target, options = {}) {
  if (deckPanels.length === 0) return;

  const nextIndex =
    typeof target === "string"
      ? deckIndexFromTarget(target)
      : Math.max(0, Math.min(deckPanels.length - 1, target));
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

function buildDeckDots() {
  if (!deckDots) return;
  deckDots.textContent = "";
  deckPanels.forEach((panel, index) => {
    const dot = document.createElement("button");
    dot.className = "deck-dot";
    dot.type = "button";
    dot.setAttribute("aria-label", `Go to ${deckId(panel) || `deck ${index + 1}`}`);
    dot.addEventListener("click", () => navigateDeck(index));
    deckDots.append(dot);
  });
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
      navigateToHash(target);
    }
  });
});

movieButtons.forEach((button) => {
  button.addEventListener("click", () => setMovieFilter(button.dataset.movieFilter));
});

gallerySize?.addEventListener("input", () => setGallerySize(gallerySize.value));
orbitRange?.addEventListener("input", () => setOrbitAngle(orbitRange.value));

deckPrev?.addEventListener("click", () => navigateDeck(activeDeck - 1));
deckNext?.addEventListener("click", () => navigateDeck(activeDeck + 1));

deckViewport?.addEventListener(
  "wheel",
  (event) => {
    const intent = Math.abs(event.deltaY) > Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
    if (Math.abs(intent) < 8) return;

    event.preventDefault();
    const now = Date.now();
    if (now - wheelLock < 640) return;

    wheelLock = now;
    navigateDeck(activeDeck + Math.sign(intent), { scrollIntoView: false });
  },
  { passive: false },
);

window.addEventListener("keydown", (event) => {
  const deckRect = deckViewport?.getBoundingClientRect();
  const deckVisible = deckRect && deckRect.bottom > 0 && deckRect.top < window.innerHeight;
  if (!deckVisible && document.activeElement !== deckViewport) return;

  if (event.key === "ArrowRight" || event.key === "PageDown") {
    navigateDeck(activeDeck + 1, { scrollIntoView: false });
  }

  if (event.key === "ArrowLeft" || event.key === "PageUp") {
    navigateDeck(activeDeck - 1, { scrollIntoView: false });
  }
});

aptTrigger?.addEventListener("click", () => {
  const open = aptPanel?.hasAttribute("hidden");
  aptPanel?.toggleAttribute("hidden", !open);
  aptTrigger.textContent = open ? "deadlock resolved?" : "apt not found";
});

window.addEventListener("resize", () => {
  resizeCanvas();
  syncDeckHeight();
});
window.addEventListener("pagehide", () => window.cancelAnimationFrame(animationFrame));

setTheme(storedTheme || "light");
buildDeckDots();
setFocus("all", false);
setMovieFilter("all");
setGallerySize(storedGallerySize || gallerySize?.value || 210);
setOrbitAngle(orbitRange?.value || 42);
updateDeckState(0);
if (initialHash) {
  navigateToHash(initialHash);
}
resizeCanvas();
drawNetwork();
