# Nemo Qi Personal Blog

This is a rebuilt static personal blog homepage for Nemo Qi. It is deployable without a
build step and is designed around Holo, astronomy, AI systems, quantitative research,
and technical notes.

## Public Site

- Deployable folder: `site/`
- Entry file: `site/index.html`
- Public name: `Nemo Qi`
- GitHub pointer: `https://github.com/YayayayakumofloatsRan`

The page includes public-facing profile information: email, school, major, direction,
astronomy interests, project summaries, and selected repository links. It intentionally
does not include identity-card photos, phone numbers, student numbers, date of birth,
grade details, raw resume files, or private local source paths.
Drawing assets keep only already-public naming marks such as `祁` or `Nemo Qi`; masked
full-name regions are softened for presentation and are not reconstructed.

## Preview

Open `site/index.html` directly in a browser. No build step is required.

## Deployment

For Cloudflare Pages:

- Build command: empty
- Output directory: `site`

For GitHub Pages, publish the files under `site/` in a repository and enable Pages from
repository settings.

## Rebuild Notes

This workspace was rebuilt after the previous local folder was no longer available. The
site now uses deployable, renamed public assets under `site/assets/` rather than linking
to private local source paths. The current Astronomy set keeps exactly six image cards,
including the Moon hero and the low-resolution phase 0.885 Moon log. Public Moon images
hide the location line while keeping the date, phase, and `Nemo Qi` credit.

## Interactions

- Theme toggle defaults to light and persists dark/light preference.
- The homepage now mixes a 3D horizontal astronomy deck for Intro/About/Projects/Astronomy
  with a traditional vertical content flow for GALLERY, Movies, Notes, and Contact.
- Deck controls use invisible left/right edge buttons on each card and loop from the
  last card back to the first. Mouse wheel page-turning is intentionally disabled so
  normal vertical scrolling stays predictable.
- The default palette is pale cyan / ice blue instead of beige; dark mode keeps the
  astronomy-facing indigo, cyan, and gold accent direction.
- Focus chips jump between systems, astronomy, and GALLERY screens.
- GALLERY uses a compact same-size grid with a persisted image-size slider and a
  side inspector, so image notes do not cover the artwork.
- Astronomy includes a lightweight interactive solar-system widget with planet selection,
  orbit phase, and an Earth-year duration control. Individual planet animations use
  rounded NASA/JPL orbital-period ratios, while orbital radii remain compressed for a
  readable interface; the orbit container keeps enough visible margin for outer planets.
- Astronomy image captions now use a side inspector instead of covering the photos, and
  the public equipment label uses `SKYWATCHER 200mmF5`.
- GALLERY and Movies use a shared 4:3 card format so supplied stills and drawings read
  as one visual system, with hover/focus inspectors instead of text overlays.
- Every content image opens a larger captioned preview lightbox on click or keyboard open;
  card images use lightweight display assets and high-resolution `site/assets/preview/`
  files for the enlarged view.
- The movie shelf uses the supplied movie materials as same-size visual cards.
- The `apt` button reveals a small terminal/deadlock easter egg.
