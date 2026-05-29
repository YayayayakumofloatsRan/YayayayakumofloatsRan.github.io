import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const site = join(root, "site");
const indexPath = join(site, "index.html");
const stylesPath = join(site, "styles.css");
const scriptPath = join(site, "script.js");
const moonPath = join(site, "assets", "moon-20240321-phase.jpg");

for (const file of [indexPath, stylesPath, scriptPath, moonPath]) {
  assert.equal(existsSync(file), true, `${file} should exist`);
}

const html = readFileSync(indexPath, "utf8");
const css = readFileSync(stylesPath, "utf8");
const js = readFileSync(scriptPath, "utf8");
const publicText = `${html}\n${css}\n${js}`;

for (const id of ["intro", "about", "projects", "astronomy", "gallery", "movies", "notes", "contact"]) {
  assert.match(html, new RegExp(`<section[^>]+id="${id}"`), `${id} section is required`);
}

assert.match(html, /Nemo Qi/, "public name should be present");
assert.match(html, /enhancednemoqi@outlook\.com/, "public email should be present");
assert.match(html, /Shanghai Jiao Tong University/, "school should be present");
assert.match(html, /Intelligent Sensing Engineering/, "major should be present");
assert.match(html, /AI systems|Automation|Quant/i, "direction should be present");

assert.match(html, /https:\/\/github\.com\/YayayayakumofloatsRan/, "GitHub account should be linked");
assert.match(html, /https:\/\/github\.com\/YayayayakumofloatsRan\/Holo/, "Holo should be linked as the main project");
assert.match(html, /Primary project|flagship/i, "Holo should be framed as the main project");
assert.match(html, /ProjectH/, "ProjectH should be present");
assert.match(html, /laser_extraction/, "secondary public project should be present");

assert.match(html, /assets\/moon-20240321-phase\.jpg/, "Moon image asset should be used");
assert.match(html, /EQ6|deep-sky|planetary/i, "astronomy interests should be present");
assert.match(html, /大黑200mmF5/, "requested telescope label should be exact");
assert.match(html, /Polar scope|极轴镜/i, "polar scope field note should be present");
assert.doesNotMatch(html, /Schmidt-Cassegrain front cell/i, "wrong telescope caption must not be present");

assert.match(html, /GALLERY/, "GALLERY heading should be uppercase");
assert.match(html, /gallerySize|Image size/i, "GALLERY should have an image-size control");
assert.match(css + js, /--gallery-min|gallerySize|nemo-gallery-size/i, "gallery size should be interactive and persisted");
assert.match(html, /stellar-deck|deck-panel|deckDots|vertical-flow/i, "homepage should mix a 3D deck with normal vertical flow");
assert.match(css, /perspective:\s*\d+px|transform-style:\s*preserve-3d|rotateY|translate3d/i, "deck should use 3D transform language");
assert.match(css, /scroll-snap-type:\s*y\s+proximity/i, "vertical content should keep traditional scroll behavior");
assert.match(js, /navigateDeck|currentDeck|deckDots|wheel|ArrowRight|ArrowLeft/i, "script should wire 3D deck navigation");
assert.match(html + css + js, /orbit|constellation|starfield/i, "astronomy theme should drive visible interactions");

for (const movie of [
  "Contact",
  "1900",
  "Gifted",
  "Interstellar",
  "The King's Speech",
  "Batman Dark Knight",
  "Puss in Boots",
  "Finding Nemo",
]) {
  assert.match(html, new RegExp(movie.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"), `${movie} should be listed`);
}
assert.match(html, /movie-filter|movie-card/, "movie shelf should be interactive");

assert.match(html, /apt not found|deadlock/i, "apt/deadlock easter egg should be present");
assert.match(js, /themeToggle|localStorage|data-theme/, "theme toggle should persist state");
assert.match(js, /focus|movie|gallerySize|apt/i, "interactive controls should be wired");

assert.match(html, /<html[^>]+data-theme="light"/, "default theme should be light");
assert.match(css, /\[data-theme="dark"\]/, "dark theme should exist");
assert.match(css, /#070a18|#0f766e|#80d7d0|#d8b45d|#f1c76c/i, "indigo/cyan/gold palette should be encoded");
assert.match(css, /#e8fbff|#d7f5f7|#bfeef2|#0f7f86/i, "light theme should use a pale cyan palette");
assert.doesNotMatch(css, /#f6f0e4|#eee5d5|#fffaf0/i, "default palette should not use the old beige theme");
assert.match(css, /overflow-wrap:\s*anywhere|word-break:\s*break-word/i, "long text should be protected");
assert.match(css, /minmax\(|clamp\(|aspect-ratio/i, "responsive constraints should be encoded");

assert.doesNotMatch(
  publicText,
  /HuaweiMoveData|xwechat_files|RWTemp|嫦娥在哪里|铃仙在哪里|D:\\|E:\\|\b1\d{10}\b|学生证|学号|出生日期|身份证/i,
  "public site must not expose local source paths or high-risk personal fields",
);
