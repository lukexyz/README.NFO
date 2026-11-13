# 01 THE RELEASE: build notes

## The concept

The front page is README.NFO's own release NFO, version 0.1.0. It opens with a
half-block logo. In dark mode it glows on a black NFO-viewer plate. In light
mode it prints onto green-bar tractor paper, so the hero is never a black slab
on white.

The page then reads in NFO order, and each of the seven sections opens with a
`░▒▓█▀▀▀[ 02/07 ]▀█▓▒░` bar followed by a real `##` heading. That way GitHub's
Outline menu works as the NFO index:

1. Install notes
2. Release info
3. Engine
4. Sample output
5. Release contents
6. After the run
7. Options and credits

The page ends with an `[ EOF ]` bar and the logo as plain text, folded.

- **Preview:** `preview.html` (toolbar: light/dark, desktop/mobile).
- **Shots:** `shots/`. Full-page shots at t=0 and t=4000 cover desktop-light,
  desktop-dark, mobile-dark and mobile-light. There are also `--fold` shots,
  reduced-motion stills (`*-reduced-t300.png`) and `inview-*.png`. See "Caveats"
  for why the in-view shots exist.

## What the page does

- **Instructions first.** Install notes is the first section (moved up in
  review; see Review below), and the first thing in it is the bare `npx readme-nfo` block. The canonical three steps
  follow word for word, then the Claude/Codex, private-repo and "Want more?"
  lines, a 30-column BATCHES block and a `[!TIP]` for the chat route ("Get me 10
  headers from README.NFO" / "number 3" / "make 10 more").
- **The numbered flow, drawn.** `batches-{dark,light}.svg` is new. It shows one
  gallery page, `readme-headers/index.html`:
  1. `npx readme-nfo` lands 01-10, three at a time.
  2. Card 03 is picked, with "USE 3 ON TOP OF YOUR README".
  3. `npx readme-nfo more` lands 11-20 on the same page.

  All 20 mini-cards use different motifs, so "no repeats" is visible. The loop
  opens on the finished state: a still, a thumbnail or a frozen offscreen frame
  shows the whole story.
- **Claude or Codex, unmistakable.** The choice appears in four places: the
  pitch, the AGENT row in Release info, the Install notes paragraph, and the
  Engine section. Engine has an ENGINE SELECT block (no flag / `--claude` /
  `--codex` / both / neither), the two copyable commands, and the line
  "Claude with no tools, Codex in a read-only sandbox".
- **Private repos.** The PRIVATE row says "works, no token". The Install notes
  paragraph and a `[!NOTE]` at the end of Engine repeat it. The note is not
  next to the TIP.
- **Examples (40 on the page).**
  - 6 live animated sample headers at 400 px, in pairs with matched aspect
    ratios.
  - The "one brief, three projects" off-air trio, live at 270 px.
  - 30 numbered WebP tiles in three reels: 01-10, 11-20 and 21-30. They are
    numbered like gallery batches on purpose.
  - heretic/04 as plain text, folded.

  Every tile links to its header page. Each reel has a `<details>` file list:
  number, project, style id (linked to its catalogue entry) and `»` for
  animated sources. Castaway has 12 of the 30 tiles (40 %). The tiles span
  6 projects and 12 of the 13 families, and the cassette sample adds print,
  so the page shows all 13.
- **After the run.** This section has:
  - a 31-column terminal transcript;
  - the exact marked block;
  - swap, undo and never-commits lines;
  - the `readme-headers/` exclusion.
- **Options and credits.** A folded OPTIONS screen in `« value »` style, the
  measured times (74 s Claude Sonnet, 2 min 31 s Codex, "a few minutes" for
  ten) and a CREDITS block closed by `[ EOF ]`.

## What changed from the brief and the prototype (and why)

- **Column budget: 31, not 36.** The fidelity notes measured the phone column
  at 309 px, minus a 44 px copy button, which leaves about 31 monospace
  columns. Every block a reader needs is 31 columns or fewer: Release info,
  BATCHES, ENGINE SELECT, the contents listing, the transcript, OPTIONS and
  CREDITS. The only blocks that scroll on a phone are the marked HTML block
  (42 columns), the folded file-list captions after column 31, the folded
  heretic text and the folded logo twin.
- **`◄ ►` became `« »`, and `►` became `»`, inside code blocks.** The
  front-page lint only allows ASCII, Latin-1, box drawing and blocks in code.
  `▲` is still used, but only in prose captions.
- **Bars are 960x36, not 830x24.** At 24 px the label was unreadable on phones.
  At 36 px the bars are about 31 px tall on desktop and 12 px on a phone.
- **The amber cursor blinks at 0.8 Hz.** The prototype used 1.2 s.
- **The light hero print-in now starts from a finished keyframe 0%.** It shows
  for 10 ms and then prints row by row, so a frame captured before the clock
  ticks is complete rather than blank paper.
- **Gallery index links are limited to naturalis-historia, gl4ss and st3gg.**
  Grepping the linked pages found denied words in four gallery indexes:
  - `examples/README.md`: crack, keygen.
  - `examples/castaway/README.md`: "swapper", from entry 115.
  - `examples/heretic/README.md`: "cracktro".
  - `examples/ultra-satisfactory/README.md`: dozens of hits.

  Every tile still links to its own clean header page. Add those four gallery
  links back after pipeline step 14 (example clean-up). `build.mjs` now
  refuses to write if any linked `.md` page, the style catalogue aside,
  contains a denied word.
- **Style catalogue links stay.** The brief asks for `styles/INDEX.md`, and
  the file lists link `styles/<family>.md#<id>`. These pages are the repo's
  research notes, and they use scene-history words (cracktro, keygen and so
  on) descriptively. If the owner wants zero exposure, drop the style-id
  links in `build.mjs`.
- **Alerts.** The page uses only TIP and NOTE. The "honest note" about Opus
  provenance is plain italic text.
- **Tile picks.** The brief named 15 picks plus the 12 Castaway tiles. The
  three extra slots are naturalis-historia/05, st3gg/03 and
  ultra-satisfactory/38. heretic/09 is used with a neutral alt and caption;
  its page and SVG `<title>` were checked and are clean.

## What still depends on unbuilt pipeline work

The page describes the target pipeline. None of the following exists today
(see `../chief.json` pipeline_spec_md and PLAN.md §5):

| Page claim | Needs | Today |
| --- | --- | --- |
| `npx readme-nfo` | npm package `readme-nfo@0.1.0` (steps 1, 12) | `npx --yes github:lukexyz/README.NFO <url> -10`, needs Git |
| Claude Code, `--claude`, ENGINE SELECT, AGENT row | `agents.mjs` drivers and detection (step 2) | Codex only |
| "In your project's folder", PRIVATE "works, no token", private-repo NOTE | local-folder mode (step 4) | GH_TOKEN required for private repos |
| "3 at a time", "a few minutes" | `--jobs`, retry and skip (step 3) | serial, about 151 s a header, first failure stops the batch |
| Gallery "opens, filling in"; one page with batch dividers | live cumulative gallery (steps 5, 6) | gallery written at the end, one folder per batch |
| `use N`, "Install which header?", the marked block, `.github/readme-nfo/` | `install.mjs` (step 7) | manual copy and paste |
| `more`, 11-20, "no repeats" across batches | `draw.json {next, usedIds}` (step 5) | every batch restarts at 01 |
| The chat route in the TIP | agent plugin or skill (step 13) | none |
| OPTIONS rows `--claude`, `--codex`, `--model`, `--jobs` | step 4 flags | not in `--help` yet |
| Measured times | one-header runs (2026-11-11) | no 10-header run has been measured |

Before this ships, the owner must reconcile `origin/main` (step 0). The
OPTIONS screen should also be regenerated from the real `--help` once
`--capabilities` exists (step 8).

## How to rebuild

All scripts are deterministic: no clock, no randomness. Running them twice
gives byte-identical SVGs and README. Run them from the repo root:

```sh
node docs/front-page/the-release/src/art.mjs      # hero, bars, batches, twin
node docs/front-page/the-release/src/thumbs.mjs   # 30 tiles (Playwright); --force re-renders all
node docs/front-page/the-release/src/build.mjs    # README.md from README.template.md
node tools/front-page/render.mjs docs/front-page/the-release
node tools/front-page/shoot.mjs  docs/front-page/the-release --times=0,4000
```

### Files in `src/`

- **`font.mjs`:** the shared 5x7 pixel font (A-Z, 0-9 and punctuation, plus
  `► ◄ ▼`), the half-block logo grid, a seam-free cell-to-path function and
  the `░▒▓` 2 px dot patterns. No SVG uses `<text>`.
- **`art.mjs`:** grown from `concepts/01-the-release/gen-hero.mjs`, which was
  copied and left unedited. It writes:
  - `assets/hero-{dark,light}.svg`: 25 and 21 KB.
  - `bar-01..07-{dark,light}.svg` and `bar-eof-*`: about 2 KB each.
  - `batches-{dark,light}.svg`: 50 and 53 KB.
  - `hero-twin.txt`: 77 columns.

  Counts come from `loadCatalogue()`.
- **`picks.json`:** the only file a curator edits. It has 3 reels of 10 picks,
  each with a neutral caption and an optional `frame` in ms (pinball and
  st3gg/03 use later frames).
- **`thumbs.mjs`:** opens each SVG in Playwright Chromium and pauses every
  CSS and SMIL animation at the frame. It then mounts the frame on a black
  card with a 2 px frame and a pixel label strip (`07 CASTAWAY ··· ► VAP-03`)
  and encodes a 300x192 WebP through canvas (quality 0.86). Tiles average
  12 KB, 360 KB in total.

  Style ids are resolved from `examples/build-log.csv`, heretic file names,
  or the pliny-set page comments. `picks.lock.json` records hashes, so
  unchanged tiles are skipped.
- **`README.template.md` + `build.mjs`:** `build.mjs` fills the asset path,
  the reels, the file lists, the contents listing and the logo twin. Before it
  writes, it checks four things:
  - The listing comes from `git ls-files`, and the build fails if a count
    drifts from the shared facts (260 in 8 galleries).
  - Every local link and image exists.
  - No denied word appears on the page.
  - No denied word appears on any linked page.

## Checks run

- **`tools/render.mjs`:** GitHub API renderer, 0 errors and 0 warnings. The
  `<b>`, `<a>` and `title` attributes inside `<pre>` survive the API render.
  Raw `<pre>` blocks are not wrapped with a copy button.
- **`tools/preview.mjs`:** run on the README and on all 20 new SVGs. Every
  code block is clean, every animated SVG honours reduced motion, there is no
  `<text>`, `<script>` or external reference, and the largest SVG is 53 KB.
  preview.mjs resolves image paths from the README's own folder, so it reports
  root-relative images as missing. render.mjs resolves from the repo root and
  finds them all.
- **`tools/shoot.mjs`:** 49 of 49 images load in all four modes. There is no
  sideways page scroll. The README column is 838 px on desktop and 309 px on
  a phone.
- **Page weight:** about 1.14 MB for one theme. That is the hero 25 KB, bars
  14 KB, batches 52 KB, the 6 live samples 626 KB, the trio 63 KB and the
  tiles 360 KB. The README itself is 26.5 KB.

## Caveats

- **Full-page shots freeze offscreen animations.** Chromium does not tick
  animations in offscreen `<img>` SVGs. In the full-page shots, the
  batches picture (and, on desktop, the light hero, which sits about 950 px
  down below GitHub's file list) can show an intermediate frame.
  `shots/inview-*.png` scroll each one into view first and show that it
  animates correctly. A visitor sees the light hero print in when it scrolls
  into view.
- **The light print-in shows a blank page for under 2 s on first paint.** If
  that reads as "loading", set the light `.reveal` animation to `none` in
  `art.mjs` for a still printout.
- **Phones show the logo at about 116 px tall,** not the 143 px estimated in
  the brief, because the real column is 309 px. The status line becomes
  texture; everything in it is repeated in Release info.

## Review

An adversarial review on 2026-11-11 re-ran every check and changed five things.

### Changes

- **Install notes is now section 01.** Release info moves to 02. Before, the
  first copyable command sat below a ten-line fact grid: about 1,830 px down
  on desktop and two phone screens in. It now sits straight under the pitch
  and nav. The bars stay in 01-07 order, the TIP still sits away from the
  NOTE, and the grid still works as the FAQ. This departs from the brief's
  strict NFO order, because the instructions must be the easiest thing on
  the page to find.
- **Sample captions read in order.** On phones the pairs stack, so the old
  two-arrow captions (`▲ a  ▲ b`) pointed at the wrong image. Each caption is
  now one phrase (`▲ castaway: rotating island, then test card`). It reads
  correctly side by side and stacked.
- **Provenance line made accurate.** The line said every header on this page
  came from about 54-minute Opus runs. The shared fact covers the logged
  showcase headers, as a median. It now says "the showcase headers ... (a
  median of about 54 minutes a header)".
- **RELEASE CONTENTS matches the other blocks.** It uses the same
  `▄▄▄ TITLE ▄▄▄` / `▀▀▀` frame at 30 columns as BATCHES, ENGINE SELECT and
  OPTIONS. This lives in `build.mjs`.
- **CREDITS leaders fixed.** `built with  Node.js` had no dot leader. It is
  now `tools ..... Node.js`.

### Checks re-run

- **render.mjs (GitHub API):** 0 errors, 0 warnings. Must-read blocks are 31
  columns or fewer. Only the folded file lists, the heretic text, the logo
  twin and the 42-column marked block scroll on a phone.
- **Links:** a node check of all 140 local href/src/srcset targets, including
  `styles/*.md#id` anchors, found no missing files. The only "miss" is
  `.github/readme-nfo/header.svg`, which is inside the example code block.
- **Determinism:** `art.mjs` and `build.mjs` ran twice. The SVGs, the twin and
  README.md were byte-identical (md5).
- **SVG frames:** checked over time.
  - The batches loop goes empty slots, then 01-10, then USE 3, then 11-20.
  - The light hero prints in row by row.
  - The dark hero glint moves.
  - The hero and batches SVGs carry prefers-reduced-motion. The bars are
    static.
- **shoot.mjs:** 49/49 images in every mode, light and dark, desktop and
  375 px, and no sideways scroll. The page is 8,271 px on desktop and
  11,009 px on a phone.
- **Deny words:** none on the page.

### Still open

- The style-catalogue pages linked from the file lists and from Release info
  use scene-history words: pc.md has 136 hits, c64.md 43, xfer.md 29 and
  INDEX.md 30. The brief asks for these links. Drop the style-id links in
  `build.mjs` if the owner wants zero exposure.
- Tile 10 (castaway pinball) is still the dimmest tile in reel 1.
- The six live samples make up most of the about 1.2 MB of local images.

### Verdict

Ship-quality for judging. It is the most authentic NFO of the set and now
puts the command first. The light printout is the standout. Length is the
remaining cost.
