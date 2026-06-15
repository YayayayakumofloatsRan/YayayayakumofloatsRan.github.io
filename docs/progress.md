# Progress Log

## 2026-05-29

- Confirmed the old homepage workspace path no longer existed and was not found in the
  ordinary Recycle Bin query or quick root-directory checks.
- Rebuilt the homepage workspace as requested.
- Recreated the personal blog with sections for About, Projects, Astronomy,
  GALLERY, Favourite movies, Blog notes, and Contact.
- Restored the real Moon visual from the available public copy source and saved an
  optimized asset at `site/assets/moon-20240321-phase.jpg`.
- The previous WeChat temporary source images for paintings, telescope photos, and the
  apt meme were already unavailable, so those areas now use local CSS-generated visual
  cards rather than pretending to be the missing original photos.
- Preserved the telescope note, later normalized to the public `SKYWATCHER 200mmF5`
  equipment label.
- Added a smoke test to guard public content, privacy boundaries, theme support,
  GALLERY sizing, movie entries, and required sections.
- Reworked the homepage architecture again into a mixed model: a 3D horizontal astronomy
  deck for Intro/About/Projects/Astronomy plus normal vertical scrolling for GALLERY,
  Movies, Notes, and Contact.
- Refined the 3D deck interaction: hidden internal panel scrollbars, subdued edge
  controls that brighten on hover/focus, lower-opacity neighboring panels, subtle
  upward pitch in the perspective, and content-aware deck height so panels are not
  clipped when browser size changes.
- Optimized deck smoothness: circular first/last page navigation, stable max-content
  deck height, throttled starfield rendering, lower canvas density, and compositing
  hints for deck panels.
- Moved deck page controls into per-panel left/right invisible edge strips and removed
  wheel/keyboard page-turning so vertical scroll remains natural.
- Replaced the light beige palette with a pale cyan / ice-blue default palette while
  retaining indigo, cyan, and gold for the dark astronomy theme.

## 2026-06-03

- Imported the supplied categorized materials from `素材` into site-local deployable assets
  under `site/assets/astronomy`, `site/assets/drawings`, `site/assets/cats`, and
  `site/assets/movies`, using stable public filenames instead of source WeChat filenames.
- Replaced the Astronomy CSS placeholder cards with the supplied Newtonian, secondary
  mirror, polar-scope, and Moon field images while keeping the existing Moon hero.
- Rebuilt GALLERY around real supplied drawing and Schrödinger The Cat images, with category
  filters plus the existing persistent image-size slider.
- Rebuilt Movies to follow the supplied movie assets exactly: 1900, Contact, Batman Dark
  Knight, Fight Club, Ford v. Ferrari, Gifted, Interstellar, and Puss in Boots. Removed
  movie entries that did not have supplied assets in this batch.
- Added smoke-test coverage for the new asset contract and verified image loading and
  Gallery/Movie filter behavior in headless Edge.
- Replaced the duplicated colored Moon card in Astronomy with the new low-resolution
  phase 0.885 asset while keeping exactly six Astronomy image cards and removing the
  stale `moon-close-field.jpg` deployable output.
- Expanded the former orbit control into an interactive solar-system widget with planet
  selection, orbit phase, and orbit speed controls.
- Added site-wide image preview: clicking or keyboard-opening any content image now
  shows a larger lightbox with a caption and Escape/backdrop close behavior.
- Updated project copy for Holo, ProjectH, and laser_extraction so the public project
  descriptions better match their current roles.
- Optimized rendering during deck movement by caching deck height, hiding far panels,
  throttling the background canvas more aggressively during deck transitions, and
  pausing solar-system animation outside the active Astronomy deck.
- Verified the current page in headless Edge: all content images load, Astronomy has six
  cards, the old duplicate Moon asset is not referenced, deck navigation loops through
  all four pages, Mars planet selection updates the readout, lightbox open/close works,
  and desktop/mobile widths have no horizontal overflow.
- Fixed the lightbox trigger model so the whole movie/gallery/astronomy card opens the
  preview promptly on pointerdown instead of only responding when the exact `<img>` node
  is clicked.
- Added high-resolution preview assets under `site/assets/preview`; lightbox opens
  immediately with the displayed asset and swaps to the larger `data-full` image once it
  loads.
- Removed the location line from public Moon assets and their preview counterparts while
  keeping date, phase, and `Nemo Qi`.
- Added a browser lightbox regression test that checks every movie, gallery, and
  Astronomy card opens its matching high-resolution preview image.
- Reworked the public drawing assets and high-resolution drawing previews so the
  already-masked full-name areas are locally deblocked with soft edges. The surname
  `祁` remains visible where it was already public, while no hidden name information is
  reconstructed or exposed.
- Optimized the astronomy background orbit layer by caching static orbit rings on an
  offscreen canvas, reducing starfield node count and pair-distance cost, and increasing
  the contrast of both the page background orbit and the in-card solar-system widget.
- Replaced the duplicate colored `Moon field study` astronomy card with the supplied
  monochrome unrendered Moon frame while keeping the high-resolution preview path in sync.
- Set the cat gallery label to `Schrödinger The Cat`, using the requested Austrian
  spelling with `ö`.
- Shortened the apt easter-egg trigger and terminal copy from `apt not found` to `apt`
  as a compact terminal-style easter egg.

## 2026-06-04

- Refined public copy across the homepage for a manual-edit handoff: hero, About,
  profile facts, project cards, Astronomy, GALLERY, Movies, Blog notes, and Contact now
  read more like a personal blog notebook while preserving the protected public-info,
  privacy, asset, and interaction contracts.
- Replaced the deployable Astronomy instrument and Moon comparison assets from the
  selected `素材/astronomy` files, preserving the privacy-masked public Moon log and using
  `SKYWATCHER 200mmF5` instead of the informal telescope nickname.
- Reworked Astronomy image notes into an interactive inspector strip below the image grid
  so captions no longer cover the photos; hover/focus updates the note while click still
  opens the lightbox.
- Removed the leftover decorative Astronomy orbit pseudo-element and changed the visible
  solar-system control to per-planet animation durations based on rounded NASA/JPL orbital
  period ratios.
- Unified GALLERY and Movies around the same 4:3 visual-card rhythm and further reduced
  deck/background rendering work during page transitions.
- Extended the no-overlay image-note pattern to GALLERY and Movies with top inspector
  strips, then tightened the Astronomy deck height so the active card fits inside one
  browser viewport without internal scrollbars.
- Fixed the solar-system edge clipping by removing paint containment from the orbit
  container and compressing the visual orbit radii so outer planets stay inside the
  visible widget while keeping the period-ratio animation model.
- Rebalanced the horizontal deck cards so Intro, About, Projects, and Astronomy all fit
  inside one browser viewport. The About card no longer overflows its public-notebook
  heading, and Astronomy image cards regained width after replacing side notes with a
  lower inspector strip.
- Reworked the Astronomy media grid from three columns into a three-row / two-column
  layout and widened the right-side copy column so the solar-system widget is no longer
  squeezed.
- Made the GALLERY and Movies inspector strips sticky at the top of the viewport, so
  notes remain visible when browsing or focusing later image rows.
- Removed the remaining page-level vertical scroll snap and changed deck navigation to
  center the horizontal card group, so mouse-wheel scrolling can place the deck naturally
  instead of magnetically locking it to the top of the browser.
- Tightened public copy across the hero, About, Projects, Astronomy, GALLERY, Movies,
  Blog lanes, and Contact into shorter personal-blog language while preserving the public
  profile and project signals.
- Corrected the former `Ridge under stars` drawing label to `NGC 3324` in the visible
  GALLERY caption and inspector text contract.
- Added a GitHub Pages Actions deployment workflow for
  `YayayayakumofloatsRan/YayayayakumofloatsRan.github.io`, publishing the static `site/`
  folder from the `main` branch to the expected root Pages URL.
- Diagnosed the live image-loading failure: GitHub Pages was still serving the branch
  root through README/Jekyll, so `/assets/...` images 404ed even though the repository
  contained `site/assets/...`. Added a root `index.html` redirect to `site/` plus
  `.nojekyll` as a branch-root fallback while the Actions source setting propagates.
- Finalized the assignment-oriented copy pass: About now briefly introduces Holo and the
  kernel v3 line, Projects frames Holo as the primary public AI runtime, Movies includes
  a real small-data visualization from the supplied favourite-movie list, and Blog uses
  selective note lanes.
- Generated assignment handoff files: `README.txt`, `docs/assignment_report.html`,
  `docs/assignment_report.pdf`, and `docs/report_assets/homepage-screenshot.png`.
- Revisited the public Holo repository README and simplified the About/Projects copy:
  removed the generic personal-site sentence and reframed Holo as a bounded,
  inspectable AI runtime kernel with kernel v3 focused on local state, processors,
  transports, action selection, and runtime contracts.
- Removed the explanatory apt sentence, replaced the footer deployment line with a personal-blog tagline, and tightened Contact grid tracks so `Public routes only.` no longer overlaps the link cards.
- Revised the assignment report copy to remove contrast-sentence phrasing and reduce noun-pile phrasing, then regenerated the PDF from the HTML source.
- Rewrote the assignment report into a paper-style format after reviewing the prior course report LaTeX/PDF structure under the provided reports directory.
- Strengthened the paper-style report for top-rubric alignment by adding explicit scoring evidence, richer Prompt engineering analysis, and implementation verification details.
## Next Data Needed

- Final blog post titles and any real article URLs.
- Any final public wording for Holo and ProjectH before deployment.
