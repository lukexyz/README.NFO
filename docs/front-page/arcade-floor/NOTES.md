# 06 ARCADE FLOOR: build notes

## The concept

The front page is an arcade after closing time. One cabinet plays its attract
loop at the top. Below it is a floor of 50 numbered cabinets, and each one is a
real header from this repo. INSERT COIN is the only command (`npx readme-nfo`).
The numbered cards are the same cards the target gallery returns, so "number 3"
and "make 10 more gives 11-20" are clear before anyone runs anything.

Section order follows `build/brief-06.md`: hero, INSERT COIN, CONTINUE?, HALL OF
FAME (with ONE BRIEF, THREE PROJECTS and HIGH SCORES), THE FLOOR, OPTIONS
(folded), CREDITS, GAME OVER.

## What is new, compared with the prototype

- **`assets/cabinet.svg`** (108 KB, 960x600, 24 s loop). The prototype's
  HALL OF FAME scene is now **NUMBERED**: cards 01-10 land 3 at a time, 03 is
  picked with "NUMBER 3 / NPX README-NFO USE 3", then 11-20 drop in with "MAKE
  10 MORE / NO STYLE REPEATS". HOW TO PLAY now reads SIGN IN CLAUDE/CODEX, NPX
  README-NFO, PICK A NUMBER, PRIVATE REPOS WORK · NO TOKEN. The demo frames are
  castaway 01, heretic 15 and naturalis-historia 03 (see Review). Heretic 09 was dropped
  because its SVG title names a real group. Under reduced motion the TITLE scene
  shows as a still.
- **`assets/continue.svg`** (40 KB, 720x300, 18 s loop). It is new.
  - Numbered empty slots appear first, with "DRAWING 3 AT A TIME". Cards 01-10
    then land in threes.
  - A cursor taps 03, "NUMBER 3 / NPX README-NFO USE 3" appears under the grid, and 03 flies into a mini
    README.MD sheet ("03 INSTALLED").
  - "CONTINUE?" counts down 9..1 at 2 Hz, the CREDIT 2 / NPX README-NFO MORE
    divider appears, and 11-20 drop in on the same page.
  - The reduced-motion still shows 01-20 with 03 installed.
- **`assets/nav/*.svg`**: four 132x28 cabinet buttons. They sit 4 across on
  desktop and 2 per row on phones.
- **`assets/floor/01..50.jpg`**: 50 new cards (300x192, about 17 KB each). Each
  strip has an amber number plate, a short neutral label in the pixel font and
  an amber ► badge when the original is animated. The picks are rebalanced:
  - Castaway has 12 of the 30 open cards and 20 of 50 overall. Heretic has 14,
    Ultra-Satisfactory 10, and GL4SS, ST3GG and Naturalis Historia 2 each.
  - Every pick on the deny list was dropped: castaway 35, 99 and 115, and
    heretic 09.
  - Every pick whose page or SVG contains banned words was also dropped. This
    covers most Ultra-Satisfactory pages, which carry a "protection" NFO field.
    It also covers castaway 88, whose page says "phreak".
- **`assets/social.png`**: 1280x640. It is the reduced-motion TITLE still,
  rendered with Chromium's `--force-prefers-reduced-motion`.
- **README text**:
  - The canonical instructions appear word for word, with the bare `sh` block
    first.
  - The "defaults are good" line follows the steps.
  - The 3-line card, the 1P Claude · 2P Codex and private-repo paragraphs and
    one TIP follow, then the canonical NOT BUILT YET comment.
  - The CREDIT card, the what-changes/undo bullets and the marked block sit in
    a `<details>`.
  - Also included: 6 live originals, the three off-air headers for ONE BRIEF,
    THREE PROJECTS, HIGH SCORES, the floor, OPTIONS, CREDITS and a GAME OVER
    box.
- **Phone width**: the brief assumed 34-37 columns would fit. The real GitHub
  phone column is 309 px, which fits about 31 monospace columns. So every
  must-read code block is 31 columns or fewer:
  - INSERT COIN card: 31
  - CREDIT card: 28
  - HIGH SCORES: 30
  - OPTIONS: 30
  - GAME OVER: 31
  Only the HTML snippet inside "What lands in your README" is wider (58).
- **OPTIONS arrows**: the lint rejects `◄ ►` (U+25C4/25BA) in code blocks, so
  OPTIONS uses ASCII `< value >`.
- **Pick gate**: `src/scan.mjs` is the gate on every linked page. It checks the
  deny list, piracy words, real group names and stale counts. The build fails
  if a pick or a linked page trips it.

## Deviations from the brief, and why

- **No links to the castaway, heretic or ultra-satisfactory gallery
  READMEs.** Their index pages contain banned words and a real group name: castaway
  names a group and uses "swapper" and "phreak"; heretic uses "cracktro" and
  names a group; ultra-satisfactory uses "keygen" and "cracktro". The gallery
  prose links only GL4SS, Naturalis Historia and ST3GG, and the big sets are
  reached through the floor cards. Ordered change 14 (clean-up) would let them
  be linked.
- **`styles/INDEX.md` is still linked**, because the brief requires it (the
  153 STYLES button and the "all 153 styles" line). It contains catalogue style
  names that name real groups and use piracy words. This is a known risk to
  settle before shipping, either in change 14 or with a cleaned index.
- **The HIGH SCORES block** puts TOTAL and STYLES on two lines (`TOTAL 260
  HEADERS`, `STYLES 153/153 CLEAR`) instead of one 35-column line, so it fits a
  phone.
- **The CREDIT card** reads `01-10 / PICK 3 / 11-20` beside each command, at 28
  columns. The CREDIT 1 and CREDIT 2 wording lives in continue.svg.
- **The marked README block** is wrapped over 4 lines so the code block stays
  under 80 columns. The attributes are unchanged.

## What still depends on unbuilt pipeline work

Everything the page promises is the target pipeline (see `chief.json`
pipeline_spec_md). None of it ships today:

- The npm package `readme-nfo` (`npx readme-nfo`). Today the command is
  `npx --yes github:lukexyz/README.NFO <url> -10` and needs Git.
- Claude Code support and engine detection (`--claude` / `--codex`). Today the
  tool is Codex only.
- Local-folder mode, so private repos work with no token. Today it needs
  `GH_TOKEN`.
- The live numbered gallery `readme-headers/index.html`, the pick prompt and
  `use N` (the `.github/readme-nfo/` files and the marked block). Today you copy
  the header in by hand.
- `more`, with continuous numbering and no repeated styles (draw.json). Today
  each batch restarts at 01.
- `--jobs` (3 at a time), `--model`, `-6`, and URL mode with a `gh auth token`
  fallback.
- The agent chat route ("Get me 10 headers", "number 3", "make 10 more")
  through a plugin or skill.
- The floor-style card in the generated gallery (ordered change 6). This page's
  cards are designed as that component.
- The link clean-up in ordered change 14 (see the deviations above).

## How to rebuild

All asset generators are deterministic Node scripts in `src/`. They read facts
from git and `styles/styles.json`, and they use Playwright from the repo's
`node_modules`. `readme.mjs` writes two copies: the repository's `README.md`
(links from the root) and `README.md` here (links from this folder). After a
rebuild, `npm run front-page:check` gates the root copy.

```sh
node docs/front-page/arcade-floor/src/build.mjs              # everything
node docs/front-page/arcade-floor/src/build.mjs --skip-cards # keep the 50 JPEGs
node tools/front-page/render.mjs docs/front-page/arcade-floor
node tools/front-page/shoot.mjs  docs/front-page/arcade-floor --times=0,4000
```

| Script | Output |
| --- | --- |
| `src/scan.mjs` | the gate: deny list, banned words and real group names (run alone to list hits) |
| `src/picks.src.txt` + `src/picks.mjs` | the 50 curated picks (fit, label, caption) and the checks on them |
| `src/font.mjs` | the original 5x7 pixel font shared by every SVG and card strip |
| `src/minicards.mjs` | 20 tiny vector vignettes for the hero's NUMBERED scene and continue.svg |
| `src/cards.mjs` | `assets/floor/NN.jpg` (stills captured at 3 s, or at the per-card time) |
| `src/hero.mjs` | `assets/cabinet.svg` and `assets/social.png` |
| `src/continue.mjs` | `assets/continue.svg` |
| `src/buttons.mjs` | `assets/nav/*.svg` |
| `src/readme.mjs` | the root `README.md` and `README.md` here (all counts computed, all links gated) |

## Checks run

- `render.mjs`: GitHub API renderer, 0 errors and 0 warnings, 65 images (about
  1.6 MB local), 11 animated SVGs.
- `shoot.mjs`: desktop light and dark plus mobile dark at 0 s and 4 s, and
  desktop dark plus mobile light with `--reduced-motion`. 65 of 65 images
  loaded in every mode. The README column is
  838 px on desktop and 309 px on mobile.
- `tools/preview.mjs`:
  - Code blocks are clean: 14, 31, 28, 58, 30, 30 and 31 columns.
  - Every new SVG honours reduced motion or is static.
  - The preview reports "MISSING image ref" for the README's images, because it
    resolves paths from the README's own folder. The paths are root-relative by
    design, and render.mjs resolves them from the repo root and finds every
    file.
- Budgets:
  - cabinet.svg: 108 KB of 125
  - continue.svg: 40 KB of 60
  - cards: 829 KB total
  - The open page loads about 1.3 MB; the 20 cards inside CONTINUE? add about
    0.33 MB.

## Review

An adversarial pass against `build/brief-06.md`, the canonical instructions
and the shared facts. I rendered the page, shot it at 0, 1, 4, 9, 15 and 21 s
plus reduced motion, and grabbed the two animated SVGs on their own at every
scene.

### Fixed

- **The build was not deterministic.** Two runs of `src/build.mjs` gave
  different `cabinet.svg` bytes and 14 different floor JPEGs. The real headers
  were captured through `<img>` after a wall-clock wait, so each run landed on
  a slightly different animation frame. The new `src/freeze.mjs` inlines each
  SVG into its own shadow root and pauses every CSS and SMIL animation at
  exactly the capture time. `cards.mjs` and `hero.mjs` use it now. Two
  back-to-back full builds now hash identically: README, cabinet, continue,
  nav, social and all 50 cards.
- **A trademark in the hero artwork.** The third DEMO PLAY frame
  (ultra-satisfactory 41) carried the words "A COMPANION APP FOR
  SATISFACTORY", a real game's name, on the most-seen image on the page. I
  swapped it for naturalis-historia 03 (temple and moon). The cabinet dropped
  from 121 KB to 108 KB.
- **The "USE 3" pill covered card 08's number** in `continue.svg`. The tap now
  shows `"NUMBER 3"` and `NPX README-NFO USE 3` large in the empty lower half,
  centred under card 03. That is the same words the chat and CLI routes use,
  so the loop now teaches the command as well as the gesture.

### Checked and passing

- **Lint and GitHub survival.** GitHub API render: 0 errors and 0 warnings, 65
  of 65 images load in every mode, and none of `<style>`, `<script>`, inline
  `<svg>`, `class` or `style` appears in the README.
- **Code blocks** are 14, 31, 28, 58, 30, 30 and 31 columns. Only the folded
  HTML snippet is wider than the 309 px phone column.
- **Links.** A node check found that all 131 local refs exist and are
  git-tracked or in this folder, and every `#` anchor matches a heading.
- **Linked pages.** Every linked page passed a scan for banned words. The only
  hits were "crackle" (vinyl audio) and BASIC line numbers in ultra 31, both
  false positives.
- **SVG rules.** `policy: ok` for every SVG, none uses `<text>`, and
  `tools/preview.mjs` confirms reduced motion for both animated SVGs.
- **Reduced motion.** The reduced-motion stills are the TITLE scene and 01-20
  with 03 installed.
- **Mobile, light and dark.** The page reads well in both modes. The cards go
  2-up, nothing scrolls sideways and the nav goes 2x2.
- **Counts** match the shared facts: 260, 8, 153, 13, the per-gallery high
  scores, 74 s and 2 min 31 s.
- **Canonical text.** The steps are word for word, the bare command comes
  first, and the brief's 1P/2P lead-in and TIP wording are used.
- **Page weight** is about 1.57 MB of local images. The 6 live originals in
  HALL OF FAME are most of it, and they are the point.

### Still open, not fixable inside this folder

- **`styles/INDEX.md`** is linked from the nav button and the floor footer, as
  the brief requires and as every other concept does. Its first screen names
  a real group and says "cracktro", "keygen" and "Swapper". Ordered change 14
  must cover `styles/` before any concept ships.
- **The instructions sit about 1.6 screens down on desktop GitHub**, below the
  file list and the 520 px cabinet. The cabinet's TITLE scene shows
  `NPX README-NFO` at t0, which helps. A shorter hero would bring INSERT COIN
  above the fold, at the cost of the concept's centrepiece.
- **Page screenshots never show `continue.svg` mid-story**, because the SVG
  starts when it first paints. The reduced-motion still and the freeze
  captures above do show it.
- **Castaway is 40% of cards, and NFO-text flavour is thin** (only GAME OVER
  and HIGH SCORES). These are as the builder reported.
- **Every command is target-only.** The NOT BUILT YET comment is in place.

### Verdict

Yes, this is the "that's sick" one for a gamer. The attract-mode cabinet, the
CONTINUE? countdown and a floor of 50 numbered cabinets make "number 3" and
"10 more = 11-20" obvious before anyone reads a word, and the instructions are
plain and short directly under the hero. It is weakest as an NFO and strongest
as a teacher of the flow.
