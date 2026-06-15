import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const rootIndexPath = join(root, "index.html");
const noJekyllPath = join(root, ".nojekyll");
const site = join(root, "site");
const indexPath = join(site, "index.html");
const stylesPath = join(site, "styles.css");
const scriptPath = join(site, "script.js");
const moonPath = join(site, "assets", "moon-20240321-phase.jpg");
const suppliedAssetPaths = [
  "assets/astronomy/newtonian-front-cell.jpg",
  "assets/astronomy/secondary-mirror-reflection.jpg",
  "assets/astronomy/polar-scope-reticle.jpg",
  "assets/astronomy/moon-wide-field.jpg",
  "assets/astronomy/moon-phase-0885-lowres.jpg",
  "assets/drawings/star-sea.jpg",
  "assets/drawings/campus-linework.jpg",
  "assets/drawings/lake-study.jpg",
  "assets/drawings/web-geometry.jpg",
  "assets/drawings/ridge-under-stars.jpg",
  "assets/drawings/snow-mountain.jpg",
  "assets/drawings/skyline-dusk.jpg",
  "assets/drawings/watercolor-cat.jpg",
  "assets/drawings/forest-road.jpg",
  "assets/cats/cat-portrait.jpg",
  "assets/cats/cat-blanket.jpg",
  "assets/cats/cat-closeup.jpg",
  "assets/cats/cat-resting.jpg",
  "assets/cats/cat-plant.jpg",
  "assets/cats/cat-drum.jpg",
  "assets/cats/cat-paper-tunnel.jpg",
  "assets/movies/1900.jpg",
  "assets/movies/contact.jpg",
  "assets/movies/dark-knight.jpg",
  "assets/movies/fight-club.jpg",
  "assets/movies/ford-v-ferrari.jpg",
  "assets/movies/gifted.jpg",
  "assets/movies/interstellar.jpg",
  "assets/movies/puss-in-boots.jpg",
];
const previewAssetPaths = [
  "assets/preview/moon-20240321-phase.jpg",
  ...suppliedAssetPaths.map((assetPath) => assetPath.replace(/^assets\//, "assets/preview/")),
];

for (const file of [indexPath, stylesPath, scriptPath, moonPath]) {
  assert.equal(existsSync(file), true, `${file} should exist`);
}

assert.equal(existsSync(rootIndexPath), true, "root index.html should exist as a GitHub Pages branch-root fallback");
assert.equal(existsSync(noJekyllPath), true, ".nojekyll should disable README/Jekyll fallback rendering");

for (const assetPath of suppliedAssetPaths) {
  assert.equal(existsSync(join(site, assetPath)), true, `${assetPath} should exist as a site-local optimized asset`);
}

for (const assetPath of previewAssetPaths) {
  assert.equal(existsSync(join(site, assetPath)), true, `${assetPath} should exist as a high-resolution preview asset`);
}

const html = readFileSync(indexPath, "utf8");
const rootIndex = readFileSync(rootIndexPath, "utf8");
const css = readFileSync(stylesPath, "utf8");
const js = readFileSync(scriptPath, "utf8");
const publicText = `${html}\n${css}\n${js}`;

assert.match(rootIndex, /url=site\/|location\.replace\(["']site\//i, "root index should redirect branch-root Pages to site/");

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
assert.match(html, /kernel v3|AI runtime|agent loops/i, "Holo project copy should mention the current kernel v3 runtime direction");
assert.match(html, /quant research lab|walk-forward/i, "ProjectH copy should be updated with clearer research language");
assert.match(html, /measurement archive|calibration/i, "laser_extraction copy should be reframed as a measurement archive");

assert.match(html, /assets\/moon-20240321-phase\.jpg/, "Moon image asset should be used");
assert.match(html, /assets\/astronomy\/newtonian-front-cell\.jpg/, "astronomy should use supplied Newtonian photo");
assert.match(html, /assets\/astronomy\/secondary-mirror-reflection\.jpg/, "astronomy should use supplied mirror reflection photo");
assert.match(html, /assets\/astronomy\/polar-scope-reticle\.jpg/, "astronomy should use supplied polar scope photo");
assert.match(html, /assets\/astronomy\/moon-wide-field\.jpg|assets\/astronomy\/moon-phase-0885-lowres\.jpg/, "astronomy should include supplied Moon photos");
assert.match(html, /0\.885-2|EARLY-IMAGE|Early Moon frame/i, "Moon field study should follow the selected astronomy-folder annotations");
assert.doesNotMatch(html, /assets\/astronomy\/moon-close-field\.jpg/, "duplicate color Moon card should be replaced by the new low-res phase 0.885 asset");
assert.match(html, /EQ6|deep-sky|planetary/i, "astronomy interests should be present");
assert.match(html, /SKYWATCHER 200mmF5/, "requested telescope label should use the formal SKYWATCHER name");
const informalTelescopeNickname = String.fromCodePoint(0x5927, 0x9ed1);
assert.doesNotMatch(html, new RegExp(informalTelescopeNickname), "public astronomy copy should not use the informal Chinese telescope nickname");
assert.match(html, /SECONDARY MERROR|POLAR SCOPE|astroInspector/i, "astronomy annotations should follow the selected folder labels and move copy into an inspector");
assert.match(html, /Polar scope|极轴镜/i, "polar scope field note should be present");
assert.doesNotMatch(html, /Schmidt-Cassegrain front cell/i, "wrong telescope caption must not be present");
assert.match(html + css + js, /solar-system|data-planet|planetReadout|orbitSpeed|planetProfiles|setPlanet/i, "orbit toy should be expanded into an interactive solar system");
assert.match(html + js, /Earth-year duration|periodDays|periodRatio|Earth days per orbit/i, "solar-system toy should use realistic orbital period ratios");
assert.doesNotMatch(css, /constellation-screen::before/i, "old decorative astronomy orbit pseudo-element should be removed");
assert.match(css, /\.solar-system[\s\S]*overflow:\s*visible[\s\S]*\.planet-button\.neptune/i, "solar-system planets should not be clipped at the orbit edge");
assert.doesNotMatch(css, /\.solar-system[\s\S]*contain:\s*[^;]*paint/i, "solar-system should not use paint containment because it clips visible outer planets");

assert.match(html, /GALLERY/, "GALLERY heading should be uppercase");
assert.match(html, /gallerySize|Image size/i, "GALLERY should have an image-size control");
assert.match(html, /gallery-filter|data-gallery-filter|Schrödinger The Cat/i, "GALLERY should expose supplied drawing/cat categories with the requested spelling");
assert.doesNotMatch(html, /Schrodinger Cat/i, "cat gallery label should not use the unaccented spelling");
assert.match(html, /assets\/drawings\/star-sea\.jpg/, "GALLERY should use supplied drawing images");
assert.match(html, /assets\/cats\/cat-portrait\.jpg/, "GALLERY should use supplied cat images");
assert.match(html, /NGC 3324/, "the former ridge-under-stars drawing should be labeled as NGC 3324");
assert.doesNotMatch(html, /<strong>Ridge under stars<\/strong>/i, "old ridge-under-stars visible label should not remain");
assert.match(css + js, /--gallery-min|gallerySize|nemo-gallery-size|setGalleryFilter/i, "gallery size and categories should be interactive and persisted");
assert.match(html + js, /galleryInspector|setGalleryInspector|media-browse-layout/i, "GALLERY should move image text into an inspector instead of an overlay");
assert.match(html + js, /movieInspector|setMovieInspector|media-browse-layout/i, "Movies should move image text into an inspector instead of an overlay");
assert.match(css, /\.media-browse-layout[\s\S]*grid-template-columns:\s*minmax\(0,\s*1fr\)/i, "GALLERY and Movies inspectors should sit above or below media, not in a side column");
assert.match(css, /\.astro-visual-panel[\s\S]*grid-template-columns:\s*minmax\(0,\s*1fr\)/i, "Astronomy image notes should sit above or below the image grid, not in a side column");
assert.match(css, /\.astro-media-grid[\s\S]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/i, "Astronomy should arrange six images as a 3-row by 2-column grid");
assert.match(css, /\.media-inspector[\s\S]*position:\s*sticky/i, "GALLERY and Movies inspectors should remain visible while browsing later image rows");
assert.match(css, /art-card figcaption,[\s\S]*movie-copy[\s\S]*clip-path:\s*inset\(50%\)/i, "Gallery and movie captions should be visually hidden from the image surface");
assert.match(html, /stellar-deck|deck-panel|deck-edge-button|vertical-flow/i, "homepage should mix a 3D deck with normal vertical flow");
assert.match(css, /perspective:\s*\d+px|transform-style:\s*preserve-3d|rotateY|translate3d/i, "deck should use 3D transform language");
assert.doesNotMatch(css, /scroll-snap-type:\s*y\s+(?:proximity|mandatory)/i, "vertical scroll snap should not magnetically lock the deck");
assert.doesNotMatch(css, /scroll-snap-align:\s*start/i, "major sections should not force scroll-snap alignment");
assert.match(js, /stellar-deck-section[\s\S]*scrollIntoView\(\{\s*behavior:\s*["']smooth["'],\s*block:\s*["']center["']\s*\}/i, "deck navigation should center the deck instead of snapping it to the viewport top");
assert.match(js, /navigateDeck|deckEdgeButtons|data-deck-action/i, "script should wire only in-card edge buttons for deck navigation");
assert.doesNotMatch(js, /addEventListener\(\s*["']wheel|ArrowRight|ArrowLeft|PageDown|PageUp/i, "mouse wheel and keyboard should not turn deck pages");
assert.doesNotMatch(html, /deck-controls|deckPrev|deckNext|deckDots/i, "global bottom deck controls should be removed");
assert.match(css, /\.deck-edge-button[\s\S]*opacity:\s*0(?:\.0?\d+)?[\s\S]*\.deck-edge-button(?::hover|:focus-visible)/i, "edge strip buttons should be nearly invisible until touched or focused");
assert.match(js, /syncDeckHeight|--deck-height|scrollHeight/i, "deck height should adapt to active panel content instead of using internal scrollbars");
assert.match(js, /deckHeightLimit|Math\.min\(limit/i, "deck height should be clamped to the viewport instead of expanding past one screen");
assert.match(css, /\.deck-panel[\s\S]*overflow:\s*hidden/i, "deck panels should not show internal scrollbars");
assert.match(css, /scrollbar-width:\s*none|::-webkit-scrollbar[\s\S]*display:\s*none/i, "deck scrollbars should be suppressed");
assert.match(css, /rotateX\(/i, "deck perspective should include subtle vertical pitch");
assert.match(css, /\.deck-panel\.is-prev[\s\S]*opacity:\s*0\.[12]\d/i, "neighboring deck panels should be visually quieter");
assert.match(js, /wrapDeckIndex[\s\S]*%[\s\S]*deckPanels\.length/i, "deck navigation should wrap between the first and last panels");
assert.match(js, /circularDeckDelta|is-prev[\s\S]*is-next/i, "first and last deck panels should be treated as adjacent");
assert.match(js, /deckContentHeight[\s\S]*reduce/i, "deck height should be measured once from panel content bounds");
assert.match(js, /networkFrameMs|lastNetworkFrame/i, "starfield rendering should be frame-throttled");
assert.match(css, /will-change:\s*transform|backface-visibility:\s*hidden|contain:\s*layout paint/i, "deck panels should be optimized for composited transforms");
assert.match(html + css + js, /orbit|constellation|starfield/i, "astronomy theme should drive visible interactions");
assert.match(js, /effectiveFrameMs|is-deck-moving|Math\.min\(36/i, "starfield rendering should reduce work during deck motion");
assert.match(js, /buildOrbitBackdrop|orbitBackdrop|drawImage\(orbitBackdrop/i, "background orbit rings should be cached instead of redrawn from scratch each frame");
assert.match(js, /networkLinkDistanceSq|distanceSq|dx \* dx \+ dy \* dy/i, "network link distance checks should avoid per-pair square roots");
assert.match(css + js, /orbitAccent|orbitGlow|network-canvas[\s\S]*opacity:\s*0\.[57]/i, "background orbit rendering should use a higher-contrast palette");
assert.match(css, /animation-play-state:\s*paused[\s\S]*body\[data-deck="astronomy"\][\s\S]*animation-play-state:\s*running/i, "solar-system animation should pause outside the astronomy deck");
assert.match(css, /\.deck-panel\.is-far[\s\S]*visibility:\s*hidden/i, "far deck panels should be hidden from rendering");
assert.match(html + css + js, /imageLightbox|lightboxImage|openLightbox|image-lightbox/i, "site images should open in a lightbox preview");
assert.match(js, /previewCardSelector|previewImageFromTarget|pointerdown/i, "image preview should bind to whole cards and open promptly on pointerdown");
assert.match(js, /dataset\.full|previewSrcFor|is-loading-full/i, "lightbox should prefer high-resolution data-full previews without delaying overlay opening");
assert.match(css, /\.preview-surface[\s\S]*cursor:\s*zoom-in/i, "previewable cards should visibly behave like image preview surfaces");
assert.match(html, /data-full="assets\/preview\/movies\/ford-v-ferrari\.jpg"/, "movie lightbox should use high-resolution preview assets");
assert.match(html, /data-full="assets\/preview\/drawings\/star-sea\.jpg"/, "gallery lightbox should use high-resolution preview assets");
assert.match(html, /data-full="assets\/preview\/astronomy\/moon-wide-field\.jpg"/, "astronomy lightbox should use high-resolution preview assets");

const suppliedMovies = [
  "Contact",
  "1900",
  "Gifted",
  "Interstellar",
  "Batman Dark Knight",
  "Fight Club",
  "Ford v. Ferrari",
  "Puss in Boots",
];

for (const movie of suppliedMovies) {
  assert.match(html, new RegExp(movie.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"), `${movie} should be listed`);
}

for (const staleMovie of ["The King's Speech", "Finding Nemo"]) {
  assert.doesNotMatch(html, new RegExp(staleMovie.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"), `${staleMovie} should not be listed without supplied assets`);
}

assert.match(html, /assets\/movies\/contact\.jpg|assets\/movies\/ford-v-ferrari\.jpg/, "movie shelf should render supplied movie stills");
assert.match(html, /movie-filter|movie-card|movie-still/, "movie shelf should be interactive and visual");
assert.match(html + css, /movie-data-viz|Favourite movie motif counts|small data/i, "movie section should include a real small-data visualization for the assignment");

assert.match(html, /Notes worth keeping|Kernel v3 notes|Research logs|Observing logs/i, "blog section should use concise selective note lanes");
assert.match(html, />apt<\/button>|sudo apt install apt/i, "apt easter egg should be present");
assert.doesNotMatch(html, /apt waits for apt/i, "apt easter egg should not include explanatory apt copy");
assert.doesNotMatch(html + js, /apt not found/i, "apt easter egg should not use the not-found label");
assert.match(js, /themeToggle|localStorage|data-theme/, "theme toggle should persist state");
assert.match(js, /focus|movie|gallerySize|apt/i, "interactive controls should be wired");
assert.match(css, /\.contact-section[\s\S]*grid-template-columns:\s*minmax\(0,\s*max-content\)\s+minmax\(22rem,\s*1fr\)/i, "Contact heading and links should use non-overlapping grid tracks");
assert.match(css, /\.contact-links[\s\S]*min-width:\s*0[\s\S]*overflow-wrap:\s*anywhere/i, "Contact links should be allowed to wrap inside their track");

assert.match(html, /<html[^>]+data-theme="dark"/, "default theme should be dark");
assert.match(css, /\[data-theme="dark"\]/, "dark theme should exist");
assert.match(css, /#070a18|#0f766e|#80d7d0|#d8b45d|#f1c76c/i, "indigo/cyan/gold palette should be encoded");
assert.match(css, /#e8fbff|#d7f5f7|#bfeef2|#0f7f86/i, "light theme should use a pale cyan palette");
assert.doesNotMatch(css, /#f6f0e4|#eee5d5|#fffaf0/i, "default palette should not use the old beige theme");
assert.match(css, /overflow-wrap:\s*anywhere|word-break:\s*break-word/i, "long text should be protected");
assert.match(css, /minmax\(|clamp\(|aspect-ratio/i, "responsive constraints should be encoded");

const highRiskPersonalPatterns = [
  /[A-Z]:[\\/]/,
  /\b1\d{10}\b/,
  new RegExp(String.fromCodePoint(0x5b66, 0x751f, 0x8bc1)),
  new RegExp(String.fromCodePoint(0x5b66, 0x53f7)),
  new RegExp(String.fromCodePoint(0x51fa, 0x751f, 0x65e5, 0x671f)),
  new RegExp(String.fromCodePoint(0x8eab, 0x4efd, 0x8bc1)),
];

for (const pattern of highRiskPersonalPatterns) {
  assert.doesNotMatch(publicText, pattern, "public site must not expose local source paths or high-risk personal fields");
}
