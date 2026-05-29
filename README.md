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
Moon image source was still available and was copied into the public site as an optimized
asset:

- `site/assets/moon-20240321-phase.jpg`

The WeChat temporary source images for paintings, telescope photos, and the apt meme were
already gone. The rebuilt page therefore uses local CSS-generated visual cards for those
sections until the original assets are supplied again.

## Interactions

- Theme toggle defaults to light and persists dark/light preference.
- Focus chips jump between systems, astronomy, and GALLERY sections.
- GALLERY uses a compact same-size grid with a persisted image-size slider.
- The movie shelf uses custom same-size title cards instead of copyrighted poster assets.
- The `apt not found` button reveals a small terminal/deadlock easter egg.
