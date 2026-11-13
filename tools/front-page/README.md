# Front-page preview tools

Two commands show a README the way github.com shows it to a signed-out visitor, and `check.mjs` gates the live front page.

Links resolve by where the README lives:

- **Under `comparisons/`** (the scratch workspace), a concept is written as if it were the root `README.md`: a path like `examples/readme-nfo/assets/16-nfo-01.svg` resolves from the repository root.
- **Anywhere else**, such as a kept design in `docs/front-page/<design>/` or the root `README.md` itself (`render.mjs .`), links resolve from the README's own folder, as on GitHub.

`lib/relink.mjs` turns a root-relative README into a self-relative one, so a design's build can write both.

## render.mjs

```sh
node tools/front-page/render.mjs comparisons/front-page/concept-a
```

The command renders `README.md` and writes `concept-a/preview.html`.

- **Renderer.** It uses GitHub's own Markdown API (`POST api.github.com/markdown`, `mode: gfm`, no token). The output is cached by content hash in `concept-a/.render-cache/`, so unchanged READMEs cost nothing against the 60-requests-an-hour limit. If the API is unreachable or rate-limited, a local GitHub-flavoured renderer (`lib/local-gfm.mjs`) takes over and the output says so. `--local` forces it, `--refresh` skips the cache and `--offline` uses no network at all.
- **Line breaks.** The API's `gfm` mode turns every soft line break into `<br>` the way issue comments do, but READMEs don't. The renderer keeps the breaks the author meant (`<br>` and hard breaks) and drops the rest, so wrapped paragraphs render as they will on the repo page.
- **The page.** It copies the real repository page around the README: the black signed-out header, breadcrumb and tabs, file list, About sidebar and the README box with its tabs and code-block copy buttons.
- **True facts only.** Commits, files and dates come from git (`origin/main`). Stars, languages and contributors come from the public API, cached for a day in `tools/.cache/`. Anything unavailable is left out, never invented.
- **Lint.** Errors and warnings print against the README rules:
  - code blocks over 80 columns or with glyphs outside ASCII, Latin-1, box drawing, blocks and shades;
  - missing local images or links;
  - SVGs that animate without honouring `prefers-reduced-motion`, load anything external, use `<script>` or rely on `<text>`;
  - markup GitHub strips (`<style>`, `<svg>`, `class`, `style`).

Open the preview at `concept-a/preview.html` in a browser (render prints the `file://` link). The toolbar at the bottom right switches **Light / Dark** and **Desktop / Mobile**; the keyboard shortcuts are `t` and `m`.

- **Light / Dark** follows GitHub's theme, not the operating system's. `<picture><source media="(prefers-color-scheme: dark)">` swaps to match, and so does `#gh-dark-mode-only`.
- **Mobile** is a 375 px phone frame. Code blocks scroll sideways there, as they do on a phone.
- **Deep links.** The choice is kept in the URL hash, so `preview.html#dark-mobile` opens straight into dark mobile.
- **Column width.** The toolbar shows the README column width. It matches github.com: 838 px at a 1280 px desktop window and 309 px on a 375 px phone.

## shoot.mjs

```sh
node tools/front-page/shoot.mjs comparisons/front-page/concept-a --times=0,4000
```

This takes full-page screenshots of `preview.html` with Playwright from the repo's `node_modules`. It writes `desktop-light`, `desktop-dark` and `mobile-dark` at each time in milliseconds after load, so animated SVGs can be checked mid-motion: `concept-a/shots/<mode>-t<ms>.png`. It also prints:

- whether every README image loaded;
- the README column width;
- the page height;
- whether the page scrolls sideways.

Options:

- `--modes=desktop-light,desktop-dark,mobile-light,mobile-dark` picks the views.
- `--fold` also saves the first screen only, which is what a visitor sees before scrolling. On github.com the file list comes first, so the README starts about 950 px down on desktop and 1,200 px down on a phone.
- `--reduced-motion` emulates `prefers-reduced-motion: reduce` to check that the SVGs fall still.
- `--scale=2` gives sharper images.

If Playwright's own Chromium is missing, the command tries cached Playwright browsers, then an installed Chrome or Edge. Only then does it print the install command (`npx playwright install chromium`, from the repository root); it never installs anything itself.

`_current/` is the "before" picture: the root README copied unchanged, rendered and shot.

## check.mjs

```sh
npm run front-page:check
```

Gates the root `README.md` (the Arcade Floor build in `docs/front-page/arcade-floor/`). `npm run validate` runs it, so CI does too. It fails on:

- a local link or image that does not exist;
- a code block over 80 columns, or with a glyph outside ASCII, Latin-1, box drawing, blocks and shades;
- a real scene group name or piracy word in the page, its alt text, or the title and description of an SVG it shows;
- a quoted count of styles, families, headers or galleries that does not match the repository (computed from `styles/styles.json` through `loadCatalogue()` and the header pages git tracks);
- an `npx readme-nfo` command or flag that `node tools/generate.mjs --capabilities --json` (or, for flags it does not list, `--help`) does not know;
- an animated SVG without a `prefers-reduced-motion` fallback;
- a page heavier than the budget (README plus every local image it loads).

`--json` prints the report as JSON. Fix a failure in the generator (`docs/front-page/arcade-floor/src/readme.mjs`), not in `README.md`.
