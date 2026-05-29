# Nemo Qi Public Site

This folder is the public deployable surface. It intentionally excludes private resume
files, identity-card images, phone numbers, student numbers, birth dates, grade details,
and local source paths.

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
