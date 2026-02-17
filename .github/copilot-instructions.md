<!-- Copilot instructions for contributors and AI coding agents -->
# Copilot instructions — MiyagiFilms static site

Purpose
- Help AI agents and contributors edit this static site quickly and correctly.

Big picture
- This is a static marketing/streaming-style site (no server-side framework).
- Pages are standalone HTML files under root and named folders (e.g., `trending/index.html`, `dylan/index.html`).
- Shared assets live in `css/`, `js/`, and `images/`. No build pipeline (no `package.json`).

Key patterns & examples
- Progressive enhancement: UI initialized in `main.js` (see `reinitializePageScripts()` and `safeInitSlick()` for how sliders and dynamic bits are re-wired at runtime).
- jQuery-first codebase: most dynamic behaviors expect `window.jQuery` and plugin globals (slick, owlCarousel, select2).
- Page loader: look for `#page-loader` usage and `document.body.classList.contains('loading')` in `main.js` when changing load/visibility behavior.
- AJAX navigation is deliberately disabled but preserved in `main.js` (comment block). Prefer full-page edits unless explicitly re-enabling and testing reinitialization.

Developer workflows
- No build step — test by serving files over a static HTTP server. Examples:
  - Python: `python -m http.server 8000` (from repo root)
  - VS Code: use the Live Server extension.
  - Node (optional): `npx serve .` if you have Node installed.
- Debugging: use browser DevTools. Re-initialization problems often come from missing plugin load order (check `js/*.js` includes in HTML head/footer).

Conventions & gotchas
- Asset paths in HTML are absolute-root prefixed (e.g., `/css/slick.css`); when testing locally serve from repo root so `/` resolves correctly.
- Many subfolders contain independent `index.html` files — change the specific page file rather than trying to change a single template.
- Keep JS plugin order: jQuery must load before slick/owl/select2; these are included in `index.html` and other pages.
- Avoid reintroducing the old AJAX navigation unless you also re-run all plugin initializers (`safeInitSlick`, `reinitializePageScripts`).

Integration points & external services
- Google Analytics configured in `main.js` (`GA_MEASUREMENT_ID` constant). Be careful when modifying GA init code.
- SEO/hosting hints: `CNAME`, `sitemap.xml`, `robots.txt`, and `site.webmanifest` indicate static hosting (e.g., GitHub Pages or similar).

What to change and how
- To add interactive features, update `main.js` near existing initializers and follow the pattern of defensive checks (e.g., `if (!document.querySelector(...)) return;`).
- To add CSS, put files in `css/` and include them in the pages that need them.
- To add a new page, create a folder with `index.html` and reference shared assets using root-relative paths.

Files to inspect first
- `index.html` — canonical page structure and asset includes.
- `main.js` — core UX logic, loader, sliders, and reinit helpers.
- `css/` and `js/` directories — plugin files and style bundles.
- `CNAME`, `sitemap.xml` — hosting/SEO-related configuration.

When in doubt
- Prefer minimal edits: this repo is a static collection of pages; large refactors (templating, full SPA conversion) will require updating many files and re-testing plugin initialization.

If something here is unclear or you'd like a different focus (tests, CI, or SPA refactor), ask and I'll iterate.
