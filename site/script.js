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
const orbitSpeed = document.querySelector("#orbitSpeed");
const orbitSpeedReadout = document.querySelector("#orbitSpeedReadout");
const solarSystem = document.querySelector("#solarSystem");
const planetButtons = document.querySelectorAll("[data-planet]");
const planetReadout = document.querySelector("#planetReadout");
const astroCards = document.querySelectorAll("[data-astro-card]");
const astroInspectorKicker = document.querySelector("#astroInspectorKicker");
const astroInspectorTitle = document.querySelector("#astroInspectorTitle");
const astroInspectorNote = document.querySelector("#astroInspectorNote");
const galleryInspectorKicker = document.querySelector("#galleryInspectorKicker");
const galleryInspectorTitle = document.querySelector("#galleryInspectorTitle");
const galleryInspectorNote = document.querySelector("#galleryInspectorNote");
const movieInspectorKicker = document.querySelector("#movieInspectorKicker");
const movieInspectorTitle = document.querySelector("#movieInspectorTitle");
const movieInspectorNote = document.querySelector("#movieInspectorNote");
const imageLightbox = document.querySelector("#imageLightbox");
const lightboxImage = document.querySelector("#lightboxImage");
const lightboxCaption = document.querySelector("#lightboxCaption");
const lightboxClose = document.querySelector("#lightboxClose");
const previewCardSelector = ".astro-card, .art-card, .movie-card";
const interactiveSelector = "a, button, input, label, select, textarea";

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
let deckHeightDirty = true;
let lightboxRequestId = 0;
let ignoreNextBackdropClick = false;
let orbitBackdrop = null;

const networkFrameMs = 1000 / 18;
const networkLinkDistance = 116;
const networkLinkDistanceSq = networkLinkDistance * networkLinkDistance;
const earthPeriodDays = 365.26;
const planetProfiles = {
  // Rounded NASA/JPL orbital periods in Earth days; radii are compressed for UI readability.
  mercury: { name: "Mercury", angle: 18, periodDays: 87.97, fact: "Fast inner orbit: small radius, high angular urgency." },
  venus: { name: "Venus", angle: 62, periodDays: 224.7, fact: "Bright phase logic: visually calm, physically hostile." },
  earth: { name: "Earth", angle: 108, periodDays: earthPeriodDays, fact: "Home orbit: stable enough for field notes, unstable enough for research." },
  mars: { name: "Mars", angle: 148, periodDays: 686.98, fact: "Thin atmosphere, strong myth, useful engineering target." },
  jupiter: { name: "Jupiter", angle: 204, periodDays: 4332.59, fact: "Mass dominates the room; gravity becomes system architecture." },
  saturn: { name: "Saturn", angle: 248, periodDays: 10759.22, fact: "Rings make orbital mechanics visible without a lecture." },
  uranus: { name: "Uranus", angle: 294, periodDays: 30688.5, fact: "Tilted axis: the reminder that initial conditions matter." },
  neptune: { name: "Neptune", angle: 334, periodDays: 60182, fact: "Distant, blue, and found by math before direct familiarity." },
};

Object.values(planetProfiles).forEach((profile) => {
  profile.periodRatio = profile.periodDays / earthPeriodDays;
});

function setTheme(theme) {
  root.dataset.theme = theme;
  localStorage.setItem("nemo-theme-v3", theme);
  orbitBackdrop = null;
  if (canvas?.width) {
    buildOrbitBackdrop();
  }
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

function invalidateDeckHeight() {
  deckHeightDirty = true;
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
  return Math.max(mobile ? 500 : 560, window.innerHeight - (mobile ? 150 : 124));
}

function deckHeightLimit() {
  const mobile = window.matchMedia("(max-width: 560px)").matches;
  return Math.max(mobile ? 500 : 560, window.innerHeight - (mobile ? 150 : 124));
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
    deckHeightDirty = false;
    const maxContentHeight = Math.max(baseline, deckContentHeight(activePanel) + 24);
    const limit = deckHeightLimit();
    const activeScrollHeight = activePanel?.scrollHeight || 0;
    const cappedScrollHeight = Math.min(activeScrollHeight, maxContentHeight + 64);
    const nextHeight = Math.ceil(Math.min(limit, Math.max(baseline, maxContentHeight, cappedScrollHeight)));
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

  const visibleCard = Array.from(movieCards).find((card) => !card.classList.contains("is-hidden"));
  setMovieInspector(visibleCard);
}

function setGalleryFilter(filter) {
  galleryButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.galleryFilter === filter);
  });

  galleryCards.forEach((card) => {
    const kind = card.dataset.galleryKind || "";
    card.classList.toggle("is-hidden", filter !== "all" && kind !== filter);
  });

  const visibleCard = Array.from(galleryCards).find((card) => !card.classList.contains("is-hidden"));
  setGalleryInspector(visibleCard);
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
  solarSystem?.style.setProperty("--orbit-angle", `${angle}deg`);

  if (orbitRange) {
    orbitRange.value = String(angle);
  }

  if (orbitReadout) {
    orbitReadout.textContent = `${angle}°`;
  }
}

function currentEarthYearDuration() {
  return Math.max(8, Math.min(48, Number(orbitSpeed?.value) || 24));
}

function formatDuration(seconds) {
  if (seconds < 60) return `${seconds.toFixed(seconds < 10 ? 1 : 0)}s`;
  const minutes = seconds / 60;
  if (minutes < 60) return `${minutes.toFixed(minutes < 10 ? 1 : 0)}min`;
  const hours = minutes / 60;
  return `${hours.toFixed(hours < 10 ? 1 : 0)}h`;
}

function setPlanetDurations(earthYearSeconds) {
  planetButtons.forEach((button) => {
    const profile = planetProfiles[button.dataset.planet];
    if (!profile) return;
    button.style.animationDuration = `${earthYearSeconds * profile.periodRatio}s`;
  });
}

function setOrbitSpeed(value) {
  const speed = Math.max(8, Math.min(48, Number(value) || 24));
  solarSystem?.style.setProperty("--earth-year-duration", `${speed}s`);
  setPlanetDurations(speed);

  if (orbitSpeed) {
    orbitSpeed.value = String(speed);
  }

  if (orbitSpeedReadout) {
    orbitSpeedReadout.textContent = `Earth ${speed}s`;
  }

  setPlanet(solarSystem?.dataset.activePlanet || "earth");
}

function setPlanet(planet) {
  const profile = planetProfiles[planet] || planetProfiles.earth;
  const duration = currentEarthYearDuration() * profile.periodRatio;

  planetButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.planet === planet);
  });

  solarSystem?.style.setProperty("--selected-angle", `${profile.angle}deg`);
  if (solarSystem) {
    solarSystem.dataset.activePlanet = planet;
  }

  if (planetReadout) {
    planetReadout.innerHTML = `<strong>${profile.name}</strong><span>${profile.periodDays.toLocaleString("en-US", { maximumFractionDigits: 2 })} Earth days per orbit · ${profile.periodRatio.toFixed(2)}x Earth year · ${formatDuration(duration)} at this scale. ${profile.fact}</span>`;
  }
}

function setAstroInspector(card) {
  if (!card) return;

  astroCards.forEach((item) => {
    item.classList.toggle("active", item === card);
  });

  if (astroInspectorKicker) {
    astroInspectorKicker.textContent = card.dataset.astroKicker || "";
  }

  if (astroInspectorTitle) {
    astroInspectorTitle.textContent = card.dataset.astroTitle || card.querySelector("strong")?.textContent || "";
  }

  if (astroInspectorNote) {
    astroInspectorNote.textContent = card.dataset.astroNote || "";
  }
}

function setGalleryInspector(card) {
  if (!card) return;

  galleryCards.forEach((item) => {
    item.classList.toggle("active", item === card);
  });

  const kicker = card.querySelector("figcaption span")?.textContent || "";
  const title = card.querySelector("figcaption strong")?.textContent || "";
  const note = card.querySelector("img")?.alt || "";

  if (galleryInspectorKicker) galleryInspectorKicker.textContent = kicker;
  if (galleryInspectorTitle) galleryInspectorTitle.textContent = title;
  if (galleryInspectorNote) galleryInspectorNote.textContent = note;
}

function setMovieInspector(card) {
  if (!card) return;

  movieCards.forEach((item) => {
    item.classList.toggle("active", item === card);
  });

  const kicker = card.querySelector(".movie-copy span")?.textContent || "";
  const title = card.querySelector(".movie-copy strong")?.textContent || "";
  const note = card.querySelector(".movie-copy small")?.textContent || card.querySelector("img")?.alt || "";

  if (movieInspectorKicker) movieInspectorKicker.textContent = kicker;
  if (movieInspectorTitle) movieInspectorTitle.textContent = title;
  if (movieInspectorNote) movieInspectorNote.textContent = note;
}

function lightboxTextFor(image) {
  const figureCaption = image.closest("figure")?.querySelector("figcaption")?.innerText;
  const movieTitle = image.closest(".movie-card")?.querySelector("strong")?.innerText;
  return figureCaption || movieTitle || image.alt || "Image preview";
}

function previewImageFromTarget(target) {
  if (!(target instanceof Element) || target.closest(".image-lightbox")) return null;
  if (target.closest(interactiveSelector)) return null;

  const directImage = target.closest("img");
  if (directImage) return directImage;

  const previewCard = target.closest(previewCardSelector);
  return previewCard?.querySelector("img") || null;
}

function previewLabelFor(image) {
  return `Open image preview: ${lightboxTextFor(image).replace(/\s+/g, " ").trim()}`;
}

function absoluteImageSrc(source) {
  return source ? new URL(source, document.baseURI).href : "";
}

function previewSrcFor(image) {
  return absoluteImageSrc(image.dataset.full || image.currentSrc || image.src);
}

function preparePreviewSurfaces() {
  const surfaces = new Set();

  document.querySelectorAll(previewCardSelector).forEach((card) => {
    if (card.querySelector("img")) {
      surfaces.add(card);
    }
  });

  document.querySelectorAll("img").forEach((image) => {
    if (!image.closest(".image-lightbox") && !image.closest(previewCardSelector)) {
      surfaces.add(image);
    }

    image.addEventListener("load", () => {
      invalidateDeckHeight();
      syncDeckHeight();
    }, { once: true });
  });

  surfaces.forEach((surface) => {
    const image = surface.matches("img") ? surface : surface.querySelector("img");
    if (!image) return;

    surface.classList.add("preview-surface");
    surface.tabIndex = 0;
    surface.setAttribute("role", "button");
    surface.setAttribute("aria-label", previewLabelFor(image));
  });
}

function openLightbox(image) {
  if (!imageLightbox || !lightboxImage || image.closest(".image-lightbox")) return;

  const requestId = String(++lightboxRequestId);
  const immediateSrc = image.currentSrc || image.src;
  const fullSrc = previewSrcFor(image);

  lightboxImage.dataset.requestId = requestId;
  lightboxImage.classList.toggle("is-loading-full", Boolean(fullSrc && fullSrc !== immediateSrc));
  lightboxImage.src = immediateSrc;
  lightboxImage.alt = image.alt || "";
  if (lightboxCaption) {
    lightboxCaption.textContent = lightboxTextFor(image);
  }
  imageLightbox.hidden = false;
  document.body.classList.add("is-lightbox-open");
  lightboxClose?.focus();

  if (fullSrc && fullSrc !== immediateSrc) {
    const fullImage = new Image();
    fullImage.decoding = "async";
    fullImage.onload = () => {
      if (lightboxImage.dataset.requestId !== requestId) return;

      lightboxImage.src = fullSrc;
      lightboxImage.classList.remove("is-loading-full");
    };
    fullImage.onerror = () => {
      if (lightboxImage.dataset.requestId === requestId) {
        lightboxImage.classList.remove("is-loading-full");
      }
    };
    fullImage.src = fullSrc;
  }
}

function closeLightbox() {
  if (!imageLightbox || imageLightbox.hidden) return;

  imageLightbox.hidden = true;
  document.body.classList.remove("is-lightbox-open");
  if (lightboxImage) {
    lightboxImage.removeAttribute("src");
    lightboxImage.classList.remove("is-loading-full");
    delete lightboxImage.dataset.requestId;
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

  nodes = Array.from({ length: Math.max(18, Math.min(36, Math.floor(window.innerWidth / 42))) }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    vx: (Math.random() - 0.5) * 0.18,
    vy: (Math.random() - 0.5) * 0.18,
  }));

  buildOrbitBackdrop(ratio);
}

function effectiveFrameMs() {
  return document.body.classList.contains("is-deck-moving") ? 1000 / 8 : networkFrameMs;
}

function palette() {
  const dark = root.dataset.theme === "dark";
  return {
    dot: dark ? "rgba(241, 199, 108, 0.68)" : "rgba(5, 93, 103, 0.58)",
    line: dark ? "rgba(128, 215, 208," : "rgba(7, 93, 107,",
    orbit: dark ? "rgba(128, 215, 208, 0.36)" : "rgba(7, 93, 107, 0.28)",
    orbitAccent: dark ? "rgba(241, 199, 108, 0.58)" : "rgba(184, 135, 42, 0.48)",
    orbitGlow: dark ? "rgba(128, 215, 208, 0.12)" : "rgba(15, 127, 134, 0.10)",
  };
}

function buildOrbitBackdrop(ratio = Math.min(window.devicePixelRatio || 1, 1.5)) {
  if (!canvas) return;

  const backdrop = document.createElement("canvas");
  const backdropContext = backdrop.getContext("2d");
  const width = window.innerWidth;
  const height = window.innerHeight;

  if (!backdropContext || width <= 0 || height <= 0) return;

  const colors = palette();
  backdrop.width = canvas.width;
  backdrop.height = canvas.height;
  backdropContext.setTransform(ratio, 0, 0, ratio, 0, 0);
  backdropContext.clearRect(0, 0, width, height);
  backdropContext.lineCap = "round";

  const centerX = width * 0.58;
  const centerY = height * 0.52;
  const maxRadius = Math.max(width, height);
  const rings = [0.22, 0.34, 0.48, 0.64, 0.82];

  backdropContext.save();
  backdropContext.translate(centerX, centerY);
  backdropContext.rotate(-0.31);
  rings.forEach((scale, index) => {
    backdropContext.beginPath();
    backdropContext.setLineDash(index % 2 === 0 ? [] : [10, 18]);
    backdropContext.lineWidth = index === 2 ? 1.5 : 1;
    backdropContext.strokeStyle = index === 2 ? colors.orbitAccent : colors.orbit;
    backdropContext.ellipse(0, 0, maxRadius * scale, maxRadius * scale * 0.34, 0, 0, Math.PI * 2);
    backdropContext.stroke();
  });
  backdropContext.restore();

  backdropContext.setLineDash([]);
  backdropContext.beginPath();
  backdropContext.strokeStyle = colors.orbitGlow;
  backdropContext.lineWidth = 28;
  backdropContext.ellipse(centerX, centerY, maxRadius * 0.48, maxRadius * 0.16, -0.31, 0, Math.PI * 2);
  backdropContext.stroke();

  backdropContext.beginPath();
  backdropContext.strokeStyle = colors.orbitAccent;
  backdropContext.lineWidth = 1.2;
  backdropContext.setLineDash([2, 14]);
  backdropContext.ellipse(width * 0.18, height * 0.22, maxRadius * 0.18, maxRadius * 0.052, 0.42, 0, Math.PI * 1.62);
  backdropContext.stroke();
  backdropContext.setLineDash([]);

  orbitBackdrop = backdrop;
}

function drawNetwork(timestamp = 0) {
  if (!context) return;

  animationFrame = window.requestAnimationFrame(drawNetwork);
  if (document.hidden || timestamp - lastNetworkFrame < effectiveFrameMs()) return;
  lastNetworkFrame = timestamp;

  const colors = palette();
  context.clearRect(0, 0, window.innerWidth, window.innerHeight);
  if (orbitBackdrop) {
    context.drawImage(orbitBackdrop, 0, 0, window.innerWidth, window.innerHeight);
  }
  context.lineWidth = 1;
  context.setLineDash([]);

  nodes.forEach((node, index) => {
    node.x += node.vx;
    node.y += node.vy;

    if (node.x < 0 || node.x > window.innerWidth) node.vx *= -1;
    if (node.y < 0 || node.y > window.innerHeight) node.vy *= -1;

    context.fillStyle = colors.dot;
    context.fillRect(node.x, node.y, 1.6, 1.6);

    for (let next = index + 1; next < nodes.length; next += 1) {
      const other = nodes[next];
      const dx = node.x - other.x;
      const dy = node.y - other.y;
      const distanceSq = dx * dx + dy * dy;

      if (distanceSq < networkLinkDistanceSq) {
        context.strokeStyle = `${colors.line} ${0.2 * (1 - distanceSq / networkLinkDistanceSq)})`;
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
orbitSpeed?.addEventListener("input", () => setOrbitSpeed(orbitSpeed.value));

planetButtons.forEach((button) => {
  button.addEventListener("click", () => setPlanet(button.dataset.planet));
});

astroCards.forEach((card) => {
  card.addEventListener("pointerenter", () => setAstroInspector(card));
  card.addEventListener("focusin", () => setAstroInspector(card));
});

galleryCards.forEach((card) => {
  card.addEventListener("pointerenter", () => setGalleryInspector(card));
  card.addEventListener("focusin", () => setGalleryInspector(card));
});

movieCards.forEach((card) => {
  card.addEventListener("pointerenter", () => setMovieInspector(card));
  card.addEventListener("focusin", () => setMovieInspector(card));
});

preparePreviewSurfaces();

document.addEventListener("pointerdown", (event) => {
  if (event.button !== 0 && event.pointerType === "mouse") return;

  const image = previewImageFromTarget(event.target);
  if (image) {
    event.preventDefault();
    openLightbox(image);
    ignoreNextBackdropClick = true;
    window.setTimeout(() => {
      ignoreNextBackdropClick = false;
    }, 420);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeLightbox();
    return;
  }

  const image = previewImageFromTarget(event.target);
  if (image && (event.key === "Enter" || event.key === " ")) {
    event.preventDefault();
    openLightbox(image);
  }
});

imageLightbox?.addEventListener("click", (event) => {
  if (event.target === imageLightbox) {
    if (ignoreNextBackdropClick) {
      ignoreNextBackdropClick = false;
      return;
    }

    closeLightbox();
  }
});
lightboxClose?.addEventListener("click", closeLightbox);

deckEdgeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const direction = button.dataset.deckAction === "prev" ? -1 : 1;
    navigateDeck(activeDeck + direction, { scrollIntoView: false });
  });
});

aptTrigger?.addEventListener("click", () => {
  const open = aptPanel?.hasAttribute("hidden");
  aptPanel?.toggleAttribute("hidden", !open);
  aptTrigger.textContent = open ? "deadlock resolved?" : "apt";
  invalidateDeckHeight();
  syncDeckHeight();
});

window.addEventListener("resize", () => {
  window.cancelAnimationFrame(resizeFrame);
  resizeFrame = window.requestAnimationFrame(() => {
    invalidateDeckHeight();
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
setOrbitSpeed(orbitSpeed?.value || 24);
setPlanet("earth");
setAstroInspector(astroCards[0]);
setGalleryInspector(galleryCards[0]);
setMovieInspector(movieCards[0]);
updateDeckState(0);
if (initialHash) {
  navigateToHash(initialHash);
}
resizeCanvas();
syncDeckHeight();
drawNetwork();
