# Progress Log

## 2026-05-29

- Confirmed the old homepage workspace path no longer existed and was not found in the
  ordinary Recycle Bin query or quick root-directory checks.
- Rebuilt the homepage workspace as requested.
- Recreated the static personal blog with sections for About, Projects, Astronomy,
  GALLERY, Favourite movies, Blog notes, and Contact.
- Restored the real Moon visual from the available public copy source and saved an
  optimized asset at `site/assets/moon-20240321-phase.jpg`.
- The previous WeChat temporary source images for paintings, telescope photos, and the
  apt meme were already unavailable, so those areas now use local CSS-generated visual
  cards rather than pretending to be the missing original photos.
- Preserved the last requested naming: `大黑200mmF5` for the Newtonian reflector note.
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
## Next Data Needed

- Final blog post titles and any real article URLs.
- Any final public wording for Holo and ProjectH before deployment.
