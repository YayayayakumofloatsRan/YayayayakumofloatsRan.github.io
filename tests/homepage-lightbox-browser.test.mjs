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
} finally {
  socket.close();
  edge.kill();
  await new Promise((resolve) => {
    edge.once("exit", resolve);
    setTimeout(resolve, 700);
  });
  await rm(userDataDir, { recursive: true, force: true, maxRetries: 6, retryDelay: 200 }).catch(() => undefined);
}
