import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const userDataDir = path.join(root, ".codex-tmp", `edge-lightbox-${Date.now()}`);
const port = 9500 + Math.floor(Math.random() * 400);
const pageUrl = pathToFileURL(path.join(root, "site", "index.html")).href;

if (!existsSync(edgePath)) {
  console.warn("Skipping browser lightbox test because Microsoft Edge is not installed at the expected path.");
  process.exit(0);
}

await mkdir(userDataDir, { recursive: true });

const edge = spawn(edgePath, [
  "--headless=new",
  "--window-size=1440,900",
  "--disable-gpu",
  "--disable-background-networking",
  "--no-first-run",
  "--no-default-browser-check",
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${userDataDir}`,
  pageUrl,
], { stdio: "ignore", windowsHide: true });

async function waitForDebugger() {
  const started = Date.now();
  while (Date.now() - started < 10_000) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/list`);
      const list = await response.json();
      const page = list.find((entry) => entry.type === "page" && entry.webSocketDebuggerUrl);
      if (page) return page.webSocketDebuggerUrl;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 120));
    }
  }
  throw new Error("Timed out waiting for Edge DevTools endpoint");
}

const socket = new WebSocket(await waitForDebugger());
await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});

let commandId = 0;
const pending = new Map();
socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  const callbacks = pending.get(message.id);
  if (!callbacks) return;
  pending.delete(message.id);
  if (message.error) callbacks.reject(new Error(message.error.message));
  else callbacks.resolve(message.result);
});

function send(method, params = {}) {
  const id = ++commandId;
  socket.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
}

async function evaluate(expression) {
  const result = await send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text || "Runtime evaluation failed");
  }
  return result.result.value;
}

try {
  await send("Runtime.enable");
  await send("Page.enable");
  await send("Page.navigate", { url: pageUrl });
  await new Promise((resolve) => setTimeout(resolve, 900));

  const results = await evaluate(`(async () => {
    const selectors = [".movie-card", ".art-card", "#astronomy .astro-card"];
    const rows = [];

    for (const selector of selectors) {
      for (const card of document.querySelectorAll(selector)) {
        card.scrollIntoView({ block: "center", inline: "center" });
        await new Promise((resolve) => requestAnimationFrame(resolve));
        document.querySelector("#imageLightbox").hidden = true;
        document.body.classList.remove("is-lightbox-open");
        document.querySelector("#lightboxImage").removeAttribute("src");

        const image = card.querySelector("img");
        const expected = image?.dataset.full ? new URL(image.dataset.full, document.baseURI).href : image?.currentSrc || image?.src || "";
        card.dispatchEvent(new PointerEvent("pointerdown", {
          bubbles: true,
          cancelable: true,
          pointerType: "mouse",
          clientX: Math.round(card.getBoundingClientRect().left + card.getBoundingClientRect().width / 2),
          clientY: Math.round(card.getBoundingClientRect().top + card.getBoundingClientRect().height / 2),
        }));

        const started = performance.now();
        while (document.querySelector("#lightboxImage").src !== expected && performance.now() - started < 2500) {
          await new Promise((resolve) => setTimeout(resolve, 40));
        }

        rows.push({
          selector,
          label: card.textContent.trim().replace(/\\s+/g, " ").slice(0, 72),
          opened: !document.querySelector("#imageLightbox").hidden,
          expected,
          actual: document.querySelector("#lightboxImage").src,
          caption: document.querySelector("#lightboxCaption").textContent.trim(),
        });
      }
    }

    return rows;
  })()`);

  const failures = results.filter((row) => !row.opened || row.actual !== row.expected || !row.caption);
  assert.equal(failures.length, 0, JSON.stringify(failures, null, 2));

  const interactionState = await evaluate(`(async () => {
    document.querySelector("#imageLightbox").hidden = true;
    document.body.classList.remove("is-lightbox-open");
    document.querySelector("#lightboxImage").removeAttribute("src");

    const deckPanelFits = [];
    for (const id of ["intro", "about", "projects", "astronomy"]) {
      document.querySelector(\`.nav a[href="#\${id}"]\`)?.click();
      await new Promise((resolve) => setTimeout(resolve, 760));
      const panel = document.querySelector(\`[data-deck-id="\${id}"]\`);
      deckPanelFits.push({
        id,
        clientHeight: panel.clientHeight,
        scrollHeight: panel.scrollHeight,
      });
    }

    document.querySelector('[data-focus="astronomy"]').click();
    await new Promise((resolve) => setTimeout(resolve, 760));

    const skywatcher = document.querySelector('[data-astro-kicker="SKYWATCHER 200mmF5"]');
    skywatcher.dispatchEvent(new PointerEvent("pointerenter", { bubbles: false, pointerType: "mouse" }));

    const mercury = document.querySelector('[data-planet="mercury"]');
    const earth = document.querySelector('[data-planet="earth"]');
    const firstArt = document.querySelector(".art-card");
    const firstMovie = document.querySelector(".movie-card");
    const catCard = document.querySelector('[data-gallery-kind="cats"]');
    const velocityMovie = document.querySelector(".movie-card.velocity");
    catCard.dispatchEvent(new PointerEvent("pointerenter", { bubbles: false, pointerType: "mouse" }));
    velocityMovie.dispatchEvent(new PointerEvent("pointerenter", { bubbles: false, pointerType: "mouse" }));

    const astroCaption = document.querySelector(".astro-card figcaption");
    const artCaption = firstArt.querySelector("figcaption");
    const movieCopy = firstMovie.querySelector(".movie-copy");
    const artRect = firstArt.getBoundingClientRect();
    const movieRect = firstMovie.getBoundingClientRect();
    const captionStyle = getComputedStyle(astroCaption);
    const artCaptionStyle = getComputedStyle(artCaption);
    const movieCopyStyle = getComputedStyle(movieCopy);
    const solar = document.querySelector(".solar-system");
    const solarWidget = document.querySelector(".solar-system-widget");
    const astroVisual = document.querySelector(".astro-visual-panel");
    const astroGrid = document.querySelector(".astro-media-grid");
    const firstAstroCard = document.querySelector("#astronomy .astro-card");
    const galleryBrowse = document.querySelector(".gallery-browse");
    const galleryInspector = document.querySelector("#galleryInspector");
    const movieBrowse = document.querySelector(".movie-browse");
    const deck = document.querySelector("#stellarDeck");
    const topbar = document.querySelector(".topbar");
    const astronomyPanel = document.querySelector("#astronomy");
    const deckRect = deck.getBoundingClientRect();
    const topbarRect = topbar.getBoundingClientRect();
    const lateGalleryCard = document.querySelector(".gallery-grid .art-card:last-child");
    const lateGalleryTargetY = lateGalleryCard.getBoundingClientRect().top + window.scrollY - Math.round(window.innerHeight * 0.58);
    window.scrollTo({ top: lateGalleryTargetY, behavior: "auto" });
    await new Promise((resolve) => setTimeout(resolve, 420));
    lateGalleryCard.dispatchEvent(new PointerEvent("pointerenter", { bubbles: false, pointerType: "mouse" }));
    const galleryInspectorRect = galleryInspector.getBoundingClientRect();
    const widgetRect = solarWidget.getBoundingClientRect();
    const clippedPlanets = Array.from(document.querySelectorAll("[data-planet]")).map((planet) => {
      const rect = planet.getBoundingClientRect();
      return {
        planet: planet.dataset.planet,
        left: rect.left,
        right: rect.right,
        top: rect.top,
        bottom: rect.bottom,
        clipped:
          rect.left < widgetRect.left - 6 ||
          rect.right > widgetRect.right + 6 ||
          rect.top < widgetRect.top - 6 ||
          rect.bottom > widgetRect.bottom + 6,
      };
    }).filter((planet) => planet.clipped);

    return {
      inspectorKicker: document.querySelector("#astroInspectorKicker").textContent.trim(),
      inspectorTitle: document.querySelector("#astroInspectorTitle").textContent.trim(),
      galleryInspectorKicker: document.querySelector("#galleryInspectorKicker").textContent.trim(),
      galleryInspectorTitle: document.querySelector("#galleryInspectorTitle").textContent.trim(),
      movieInspectorTitle: document.querySelector("#movieInspectorTitle").textContent.trim(),
      mercuryDuration: Number.parseFloat(getComputedStyle(mercury).animationDuration),
      earthDuration: Number.parseFloat(getComputedStyle(earth).animationDuration),
      artRatio: artRect.width / artRect.height,
      movieRatio: movieRect.width / movieRect.height,
      astroCaptionWidth: Number.parseFloat(captionStyle.width),
      astroCaptionHeight: Number.parseFloat(captionStyle.height),
      artCaptionWidth: Number.parseFloat(artCaptionStyle.width),
      artCaptionHeight: Number.parseFloat(artCaptionStyle.height),
      movieCopyWidth: Number.parseFloat(movieCopyStyle.width),
      movieCopyHeight: Number.parseFloat(movieCopyStyle.height),
      solarOverflow: getComputedStyle(solar).overflow,
      clippedPlanets,
      deckPanelFits,
      astroVisualColumnCount: getComputedStyle(astroVisual).gridTemplateColumns.trim().split(/\\s+/).filter(Boolean).length,
      astroGridColumnCount: getComputedStyle(astroGrid).gridTemplateColumns.trim().split(/\\s+/).filter(Boolean).length,
      galleryBrowseColumnCount: getComputedStyle(galleryBrowse).gridTemplateColumns.trim().split(/\\s+/).filter(Boolean).length,
      movieBrowseColumnCount: getComputedStyle(movieBrowse).gridTemplateColumns.trim().split(/\\s+/).filter(Boolean).length,
      galleryInspectorPosition: getComputedStyle(galleryInspector).position,
      galleryInspectorTop: galleryInspectorRect.top,
      galleryInspectorBottom: galleryInspectorRect.bottom,
      firstAstroCardWidth: firstAstroCard.getBoundingClientRect().width,
      solarSystemWidth: solar.getBoundingClientRect().width,
      viewportHeight: window.innerHeight,
      deckHeight: deckRect.height,
      topbarHeight: topbarRect.height,
      astronomyClientHeight: astronomyPanel.clientHeight,
      astronomyScrollHeight: astronomyPanel.scrollHeight,
    };
  })()`);

  assert.equal(interactionState.inspectorKicker, "SKYWATCHER 200mmF5");
  assert.match(interactionState.inspectorTitle, /Newtonian reflector/i);
  assert.equal(interactionState.galleryInspectorKicker, "Schrödinger The Cat");
  assert.match(interactionState.galleryInspectorTitle, /Paper tunnel|Wide-eyed portrait|portrait/i);
  assert.equal(interactionState.movieInspectorTitle, "Ford v. Ferrari");
  assert.ok(
    Math.abs(interactionState.mercuryDuration / interactionState.earthDuration - 0.2408) < 0.03,
    `Mercury/Earth duration ratio should follow orbital periods: ${JSON.stringify(interactionState)}`,
  );
  assert.ok(
    Math.abs(interactionState.artRatio - interactionState.movieRatio) < 0.08,
    `Gallery and movie cards should use matching media ratios: ${JSON.stringify(interactionState)}`,
  );
  assert.ok(
    interactionState.astroCaptionWidth <= 2 && interactionState.astroCaptionHeight <= 2,
    `Astronomy captions should not overlay images: ${JSON.stringify(interactionState)}`,
  );
  assert.ok(
    interactionState.artCaptionWidth <= 2 && interactionState.artCaptionHeight <= 2,
    `Gallery captions should not overlay images: ${JSON.stringify(interactionState)}`,
  );
  assert.ok(
    interactionState.movieCopyWidth <= 2 && interactionState.movieCopyHeight <= 2,
    `Movie text should not overlay images: ${JSON.stringify(interactionState)}`,
  );
  assert.equal(interactionState.solarOverflow, "visible");
  assert.deepEqual(interactionState.clippedPlanets, []);
  assert.deepEqual(
    interactionState.deckPanelFits.filter((panel) => panel.scrollHeight > panel.clientHeight + 20),
    [],
    `Every horizontal deck panel should fit without internal scrolling: ${JSON.stringify(interactionState)}`,
  );
  assert.equal(interactionState.astroVisualColumnCount, 1);
  assert.equal(interactionState.astroGridColumnCount, 2);
  assert.equal(interactionState.galleryBrowseColumnCount, 1);
  assert.equal(interactionState.movieBrowseColumnCount, 1);
  assert.equal(interactionState.galleryInspectorPosition, "sticky");
  assert.ok(
    interactionState.galleryInspectorTop >= interactionState.topbarHeight - 2 &&
      interactionState.galleryInspectorBottom <= interactionState.viewportHeight + 2,
    `Gallery inspector should remain visible while browsing later rows: ${JSON.stringify(interactionState)}`,
  );
  assert.ok(
    interactionState.firstAstroCardWidth >= 280,
    `Astronomy image cards should remain large enough after moving the inspector: ${JSON.stringify(interactionState)}`,
  );
  assert.ok(
    interactionState.solarSystemWidth >= 190,
    `Solar system widget should not be squeezed in the right column: ${JSON.stringify(interactionState)}`,
  );
  assert.ok(
    interactionState.deckHeight + interactionState.topbarHeight <= interactionState.viewportHeight + 6,
    `Deck plus topbar should fit within one viewport: ${JSON.stringify(interactionState)}`,
  );
  assert.ok(
    interactionState.astronomyScrollHeight <= interactionState.astronomyClientHeight + 20,
    `Astronomy panel content should fit its deck card: ${JSON.stringify(interactionState)}`,
  );
} finally {
  socket.close();
  edge.kill();
  await new Promise((resolve) => {
    edge.once("exit", resolve);
    setTimeout(resolve, 700);
  });
  await rm(userDataDir, { recursive: true, force: true, maxRetries: 6, retryDelay: 200 }).catch(() => undefined);
}
