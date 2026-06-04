# Nemo Qi Public Site

This folder is the public deployable surface. It intentionally excludes private resume
files, identity-card images, phone numbers, student numbers, birth dates, grade details,
and local source paths.
Drawing images keep only already-public `祁` / `Nemo Qi` marks; previously masked
full-name areas are softened for display and are not reconstructed.

## Local Preview

Open `index.html` directly in a browser, or serve this folder with any static server.

## Deployment Notes

Cloudflare Pages:
- Connect the GitHub repository.
- Build command: leave empty.
- Output directory: `site`.

GitHub Pages:
- Put the `site/` files in a public repository.
- Enable Pages and point it at the branch/folder that contains these files.

The current site is structured as a mixed personal blog homepage: Intro/About/Projects/
Astronomy live in a 3D horizontal astronomy deck, while GALLERY visual notes, favourite
movies, blog lanes, and Contact remain in a traditional vertical scroll flow. Holo is
the primary project, ProjectH is a private research system, and the page keeps a
persistent dark/light theme toggle.

Default theme is light cyan / ice blue rather than beige. Dark mode uses indigo and cyan
as primary colors with gold line accents.

Current interaction notes:
- The horizontal deck loops through its four cards and is controlled only through the
  invisible left/right edge buttons on each card.
- Mouse wheel input stays reserved for normal vertical page scrolling. The page no
  longer uses vertical scroll snapping, and deck navigation scrolls the active card group
  toward the viewport center instead of forcing a top lock.
- Astronomy includes six image cards arranged as three rows by two columns plus a
  lightweight solar-system control.
- Astronomy now follows the selected `素材/astronomy` labels, uses `SKYWATCHER 200mmF5`
  for the Newtonian reflector, and moves image notes into a compact inspector strip below
  the image grid so captions do not cover the photos.
- The solar-system control keeps a visible phase slider and uses rounded NASA/JPL
  orbital-period ratios for per-planet animation speeds. The visual orbit spacing is
  intentionally compressed for readability, with the outer planets kept inside the
  visible widget area.
- GALLERY and Movies use the same 4:3 media-card rhythm and sticky top inspector strips
  to reduce visual mismatch between supplied drawings, cat photos, and movie stills
  without placing captions over the images.
- Content images open a captioned lightbox preview. The card images stay lightweight, and
  the preview overlay prefers high-resolution files under `assets/preview/`.
- Public Moon images hide the location line while preserving the date, phase, and
  `Nemo Qi` credit.
