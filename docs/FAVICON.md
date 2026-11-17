# Website favicon

Requirement: public pages declare a stable, square Enthusia logo icon for browser tabs, Apple home screens and search crawler discovery. The supplied animated GIF is the source; the favicon is its first frame on a transparent square canvas so it remains legible as a static icon. The existing animated header stays unchanged.

Verification: `node --test tests/favicon.test.mjs` checks every public HTML page and image dimensions/ICO entries. `npm run check` validates page references. `npm run build` copies the icons into the output; it also generates preview files locally. Confirm HTTP access after deployment. Browser caches and Google recrawling affect when the icon appears. A search result illustration is available at `public/preview/favicon-concept.html`; it is not an actual Google result.

The project has no local SPEAR/EARS validator or state helper; this record tracks the requirement and verification boundary. Changes are source-only until separately reviewed, merged and deployed.
