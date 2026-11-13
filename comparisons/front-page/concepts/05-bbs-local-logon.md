# 05 · BBS LOCAL LOGON (main menu, file areas, a door)

**One-liner.** The README is a 90s ANSI bulletin board you've just dialled
into: a main menu of bracketed hotkeys that jump to sections, file areas that
list 76 real headers as numbered thumbnails, and the generator is a *door*
that runs on your machine. "Local logon" is the point: the door reads your
project folder, so private repos just work.

**The twist on the seed.** On a real BBS, a "local logon" is the sysop signing
on at the board's own keyboard: no modem, no outside line. Here that becomes
the promise that matters most. README.NFO reads your local checkout and calls
nothing but the agent you picked. The sysop is your coding agent: you page it
("get me 10 headers from README.NFO"), it opens the door, and you answer the
door's one question by number. Every board metaphor is a real pipeline step:

| BBS screen | README section | Pipeline step |
| --- | --- | --- |
| Logon screen + main menu | Hero SVG + hotkey row | What it is; table of contents |
| [D]oor | Make headers (3 steps) | `npx readme-nfo`, or ask your agent |
| Engine prompt `[C]/[X]` | Inside [D] | Claude Code or Codex, auto-detected |
| Local logon | Inside [D] | Reads the folder, no token, private OK |
| File listing #01-#20 | Inside [D] | One numbered gallery across batches |
| [I]nstall | Put one in your README | "number 3" = `use 3`, marked block |
| [F]iles · 13 areas | Examples wall | 76 committed headers, 13 families |
| [S]etup | Door options | Flags, folded |
| [H]elp | Snags | Sign-in, time, cost, what leaves the machine |
| [G]oodbye | Credits, licence | `NO CARRIER` closer |

A working prototype exists and was rendered at desktop and phone widths in
both themes: `comparisons/front-page/concepts/05-bbs-local-logon/`
(`README.md`, `preview.html`, `assets/`, `src/`, `shots/`). This spec is the
canonical description; section 9 lists what the prototype still needs.

**Status of claims.** Claude support, `npx readme-nfo`, local-folder mode,
the live numbered gallery, `more` and `use N` are **NOT BUILT** (see
`research/pipeline.md`). This page is the *target cut* and ships only with
that pipeline. An *interim cut* that is true today is in section 8.

---

## 1. Wireframe, top to bottom

Widths: desktop column about 830 px; phone column 306-364 px, which shows
about 38-41 code columns. Every block a visitor must read or copy is 33
columns or fewer, so nothing important scrolls sideways on a phone. Glyphs:
ASCII, Latin-1 (`·`), box drawing and block elements only.

### 1.0 Hero: the logon screen (animated SVG)

```html
<p align="center"><img src="docs/front-page/hero-bbs.svg" width="100%"
 alt="README.NFO bulletin board main menu: door, install, files, setup,
 help and goodbye, beside a last-callers list of 8 example projects"></p>
```

Sketch of what the SVG draws (960x?; every glyph is a rect/path, 0 `<text>`):

```text
README.NFO BBS    NODE 1 · 33600 · ANSI · 80X25   ONLINE
 ██████ ██████  ████  █████  ██   ██ ██████   ██  ██ ...
   (pixel-font README.NFO, cyan>violet fade, magenta drop)
     RETRO README HEADERS, DRAWN FRESH FOR YOUR PROJECT
        153 STYLES · 13 AREAS · 260 EXAMPLES · MIT
╔═ MAIN MENU ════════════════════╗ ╔═ LAST CALLERS ═════╗
║ [D] DOOR     MAKE YOUR HEADERS ║ ║ HERETIC ........ 40║
║ [I] INSTALL  ADD ONE TO README ║ ║ README.NFO ..... 41║
║ [F] FILES    260 HEADERS · 13  ║ ║ GL4SS ........... 5║
║ [S] SETUP    ENGINE·COUNT·STYLE║ ║ ...  CASTAWAY .. 116║
║ [H] HELP     SNAGS AND ANSWERS ║ ║ ULTRA-SATIS.. .. 42║
║ [G] GOODBYE  CREDITS · LICENCE ║ ║ DANCE VISION .... 6║
╚════════════════════════════════╝ ╚════════════════════╝
SELECTION [D I F S H G]: █
ENGINES: CLAUDE CODE · CODEX   LOCAL LOGON · PRIVATE REPOS OK
```

### 1.1 Title, pitch, proof line, hotkey row

```html
<h1 align="center">Retro headers for your README</h1>
<p align="center">Drawn fresh for your project by <b>Claude Code</b> or
<b>Codex</b>, in any of 153 styles:<br>ANSI, NFO, demoscene, tracker,
vaporwave, teletext and more.<br>
<sub>260 example headers · 8 projects · 13 areas · MIT</sub></p>

<p align="center">
<a href="#door--make-headers-for-your-project"><img src="docs/front-page/keys/d.svg"
 width="132" height="28" alt="[D] Door: make headers"></a>
 ... [I] [F] [S] [H] [G] the same way ...
</p>
```

Six 132x28 key buttons (blue ANSI bar, yellow bracketed letter). Desktop:
one row of 6. Phone: 2 per row, 3 rows (verified in
`shots/first-screen-light-mobile.png`). Each links to a real heading anchor.

### 1.2 `## [D]oor · make headers for your project`

Exact text:

> README.NFO is a door: a small program that runs on your machine, hands your
> project to your coding agent and brings back ten numbered headers.
>
> 1. Install [Node.js 22+](https://nodejs.org) and sign in to
>    [Claude Code](https://claude.com/claude-code) or
>    [Codex](https://developers.openai.com/codex).
> 2. In your project's folder, run:
>
>    ```sh
>    npx readme-nfo
>    ```
>
>    or just ask your agent: *"Get me 10 headers from README.NFO."*
> 3. A gallery opens with headers 01-10. Say or type the number you like
>    and it goes at the top of your README.
>
> **Local logon.** The door reads your project folder, not GitHub, so
> private repos, GitLab and unpushed projects work with no token. Your
> project facts go only to the agent you pick.
>
> **Pick your engine.** It uses whichever of Claude Code or Codex you're
> signed in to, and asks if you have both. Add `--claude` or `--codex` to
> choose up front.

Then the door's own screen, as a text block (31 columns, phone-safe):

```text
README.NFO DOOR · LOCAL LOGON
─────────────────────────────
Project .. my-project (here)
Engine? [C] Claude Code
        [X] Codex       : C
Styles ... 10 of 153
Drawing .. 3 at a time
████████████········ 6/10
Gallery .. open in browser
─────────────────────────────
Install which? [1-10]: 3
Added to README.md
Review: git diff, then commit
```

Then the **file listing** that shows the core flow (numbering continues
across batches; one gallery page holds them all):

```text
FILES: readme-headers/index.html
──────────────────────────────
#01 ░ Copper-bar intro
#02 ░ Teletext page
#03 █ Pinball dot matrix  <
 ...
#10 ░ Cassette J-card
── "make 10 more" ─────────────
#11 ░ Menu disk
 ...
#20 ░ Test card
──────────────────────────────
No style appears twice.
```

with one line of prose under it:

> Want more? Say *"make 10 more"* or run `npx readme-nfo more`: ten new
> styles, numbered 11-20, on the same gallery page. No style repeats.

### 1.3 `## [I]nstall · put one in your README`

> When the last header lands, the door asks which one to install. Type its
> number, or tell your agent *"number 3"*, and it:
>
> 1. copies that SVG and README.NFO's MIT notice into `.github/readme-nfo/`;
> 2. adds the header to the top of your README between two marker comments;
> 3. stops there. Check `git diff`, then commit it yourself.
>
> Changed your mind? `npx readme-nfo use 14` swaps in header 14 from any
> batch, replacing only the marked block. Batches stay in `readme-headers/`,
> which the door adds to `.git/info/exclude`, so they never show as
> untracked.

`<details><summary>What it adds to your README</summary>` holds:

```html
<!-- README.NFO header: start -->
<p align="center">
  <img src=".github/readme-nfo/header.svg" width="100%"
       alt="my-project header">
</p>
<!-- README.NFO header: end -->
```

### 1.4 `## [F]iles · the example areas`

> Every header here was made for a real project. Tiles are stills: open one
> to see it move, copy its Markdown or read the generator that drew it.

`<sub>Last callers: Heretic 40 · README.NFO 41 · GL4SS 5 · ... </sub>` (each
links the set's `examples/<set>/README.md`; counts generated from git).

**### Sysop's picks**: 4 live animated SVGs at `width="400"`, 2 per row
(1 per row on phones), each followed by a one-line `<sub>` caption row.

**### Area 01 · ANSI, BBS & text mode** ... **### Area 13 · Modems &
message boards**: one heading per catalogue family, so GitHub's Outline menu
lists all 13 areas. Each area is:

```text
[thumb 01][thumb 02][thumb 03][thumb 04][thumb 05][thumb 06]
01 Vector BBS screen · 02 BBS stats · 03 Door game · ...
11 styles · 23 headers · draw ten from this area:
npx readme-nfo --style ansi
▸ List the 23 headers in this area   (<details>, generated)
```

Thumbs are 132x74 JPEG stills (264x148 source) in a 2 px ANSI-blue frame
with a cyan file-number badge, each linking to its header's `.md`.
Desktop 6 per row; phones 2 per row. A row of "areas" anchor links sits above
Area 01.

### 1.5 `## [S]etup · door options`

> The door works with no options. Add any of these to `npx readme-nfo`:
>
> - `--claude` or `--codex` picks the engine.
> - `-6` makes six headers instead of ten.
> - `--style ansi` draws from one area; `--style ansi-06` asks for one style.
> - `--format svg` or `--format text` keeps to images or to text art.

Folded `<details><summary>Every option</summary>`: `more`, `use N`,
`--model`, `--jobs 3`, `--resume`, `--out DIR`, `--no-open`, `--seed`, and
`github.com/owner/repo` for a project you haven't cloned (private ones
through a signed-in `gh`).

### 1.6 `## [H]elp`

One alert only:

> [!TIP]
> **"No engine found"?** Sign in first: run `claude` and type `/login`, or
> run `codex login`. Then run the door again.

Then short Q&A paragraphs: **How long?** (true trial numbers: one header took
74 s with Claude Sonnet and 151 s with Codex on 2026-11-11; the gallery fills
as each lands; 3 drawn at a time). **What leaves my machine?** (name,
description, README headings, languages, licence and the style briefs, only to
your chosen agent; README.NFO has no server). **Does it cost anything?**
(MIT, free; drawing uses your Claude or ChatGPT plan or API key). **It
stopped halfway.** (`npx readme-nfo --resume`; a bad header is retried once
and then skipped, never stops the batch). **Page the sysop.** (open an
issue).

### 1.7 `## [G]oodbye`

```text
Thanks for calling README.NFO.

research .. 16colo.rs
            Demozoo · Pouet
            textfiles.com
tools ..... Node.js
            Playwright
licence ... MIT; keep the
            notice with any
            header you use

+++ATH0
NO CARRIER
```

`[MIT licence](LICENSE) · [Style catalogue](styles/INDEX.md) ·
[All galleries](examples/README.md) · [How it works](docs/generation.md)`

---

## 2. The hero and its animation

`hero-bbs.svg` (prototype: 31.9 KB, 0 `<text>` elements; pixel font drawn
as rects by `src/hero-bbs.mjs`). An opaque black "screen" with a blue status
bar, so it reads the same on GitHub light and dark.

Timeline:

1. **Modem draw-in (about 4 s).** Black cover rects shrink line by line with
   `steps()`, so the screen paints in like a 33.6k connection: status bar,
   logo, tagline, menu box, last-callers box, in that order.
2. **Menu bar walk (13.2 s loop).** The highlight bar steps from [D] down to
   [G] and back, one item per 2.2 s, step-end, no easing: exactly how a
   menu highlight moved.
3. **Cursor.** `SELECTION [D I F S H G]: █` blinks at about 1 Hz.

No flashing (well under 3 per second). `prefers-reduced-motion: reduce`
hides the covers and stops the bar and cursor, leaving the finished screen
with the bar on [D] (`shots/hero-phone-reduced-motion.png`). The 1280x640
social preview PNG (`assets/social-1280x640.png`, 12.9 KB) is rendered from
the same still.

## 3. The examples wall (all committed files)

**76 thumbnails + 4 live picks, from 8 projects, covering all 13 families.**
Every tile is a committed header (no MediaLog, which is untracked). Captions
come from `neutral-names.json`, never from catalogue names that contain real
group or product names. Per-area `<details>` lists link all 260 committed
headers.

Sysop's picks (live SVG, 400 px): `castaway/51-ripscrip-screen`,
`castaway/65-memphis`, `ultra-satisfactory/13-chrome-spheres`,
`castaway/98-3d-pipes` (all `_opus_5.5`).

Area tiles (set/file prefix; Castaway and ULTRA files end `_opus_5.5.md`):

| Area | Tiles |
| --- | --- |
| 01 ANSI | castaway/51-ripscrip-screen, castaway/02-bbs-stats, castaway/50-door-game-screen, ultra-satisfactory/23-illustrated-ansi, castaway/52-teletext-page, gl4ss/04-viewdata |
| 02 NFO | castaway/45-newschool-ascii, castaway/07-7bit-outline-nfo, castaway/43-file-id-diz, ultra-satisfactory/22-poster-nfo, ultra-satisfactory/21-shaded-block-nfo, heretic/03-nfo-02 |
| 03 PC | ultra-satisfactory/13-chrome-spheres, castaway/24-skinned-installer, castaway/23-dos-vga-loader, castaway/26-vector-objects, ultra-satisfactory/16-poster-installer, heretic/09-pc-12 |
| 04 C64/Amiga/ST | castaway/35-hand-pixelled-chrome-logo, castaway/19-megademo-menu, castaway/36-st-menu-disk, castaway/15-kefrens-bars, castaway/30-petscii-picture, ultra-satisfactory/28-flat-silhouette-intro |
| 05 Demoscene | castaway/20-apple2-screen, castaway/113-atari-8-bit-demo, castaway/114-cpc-demo-screen, ultra-satisfactory/07-compo-slides, naturalis-historia/03-demo-titles, heretic/15-demo-10 |
| 06 Trackers | castaway/17-module-player, castaway/42-multi-chip-tracker, ultra-satisfactory/09-oscilloscope, ultra-satisfactory/20-player-stack, ultra-satisfactory/17-amiga-tracker, castaway/40-text-mode-tracker |
| 07 Machines | castaway/01-mode7-island, castaway/09-pinball-dmd, castaway/73-vfd-front-panel, ultra-satisfactory/10-arcade-attract, ultra-satisfactory/40-power-on-self-test, castaway/71-console-title-screen |
| 08 Screensavers | castaway/98-3d-pipes, castaway/14-off-air, castaway/95-light-synth, castaway/100-sprite-saver, ultra-satisfactory/08-milkdrop-visualiser, st3gg/01-off-air |
| 09 Vaporwave | castaway/57-synthwave-outrun, castaway/65-memphis, castaway/56-vhs-tape, castaway/58-city-pop-sleeve, ultra-satisfactory/42-aero-gloss, gl4ss/05-luna-desktop |
| 10 Print | ultra-satisfactory/12-cassette-jcard, castaway/115-swapper-floppy (captioned "labelled floppies"), castaway/08-tractor-feed, ultra-satisfactory/31-type-in-listing, castaway/116-scene-paperwork (captioned neutrally), heretic/29-print-05 |
| 11 Terminals | castaway/87-file-system-landscape, castaway/88-tone-pad, castaway/18-tui-monitor, castaway/78-fetch-card, castaway/79-roguelike-screen, heretic/35-hack-15 |
| 12 Japan | castaway/90-pc-98-adventure-screen, castaway/91-ptt-telnet-board, castaway/92-japanese-basic-power-on, castaway/05-shiftjis-aa, ultra-satisfactory/18-fm-synth-display, naturalis-historia/02-telnet-board |
| 13 Modems | castaway/101-echomail-reader, ultra-satisfactory/33-sysop-dashboard, ultra-satisfactory/35-terminal-session, ultra-satisfactory/39-userbar-kit |

The full list with captions is `05-bbs-local-logon/curation.json`.

**Weight.** 76 JPEG thumbs total 1.2 MB, hero 32 KB, 6 keys about 9 KB, and
the 4 live picks about 450 KB: roughly 1.7 MB for the whole page, with only
4 animations running below the fold (today's page: 441.5 KB, 7 SVGs). Above
the fold: hero + keys, under 50 KB.

## 4. New assets to make (all deterministic Node scripts)

Proposed home `tools/front-page/` (scripts) and `docs/front-page/` (output);
prototypes in `05-bbs-local-logon/src/`.

| Script | Output | Notes |
| --- | --- | --- |
| `hero-bbs.mjs` (171 lines) | `hero-bbs.svg` | Pixel font as rects; counts and last callers injected from the repo |
| `keys.mjs` | `keys/{d,i,f,s,h,g}.svg` | 132x28 static buttons |
| `thumbs.mjs` (Playwright) | `thumbs/<family>-NN.jpg` | Reduced-motion still of each SVG; text headers rendered as an NFO viewer |
| `social.mjs` | `social-1280x640.png` | From the hero still |
| `build.mjs` (208 lines) | `README.md` | Reads `curation.json`, `neutral-names.json`, `styles.json`, `git ls-files`, `build-log.csv`; `--check` exits 1 when stale (run in CI) |
| new data | `styles/neutral-names.json` | One neutral caption per style id, validated |

Every number on the page (153, 13, 260, 8, per-area style and header counts,
last-callers counts) is computed by `build.mjs`; nothing is typed by hand.

## 5. The journey (whole pipeline, as the page tells it)

1. **Discover.** The logon screen says what it is in one line; the hotkeys
   are the table of contents; the proof line and last callers show real
   output.
2. **Pick an engine.** Nothing to choose unless you want to: the door
   probes `claude auth status` and `codex login status` (3 s each), uses the
   one that is signed in, asks if both are, and prints `AGENT Claude Code
   (switch: --codex)`. A missing sign-in gives the one-line [H]elp hint.
3. **Run.** `npx readme-nfo` in the project folder, or ask the agent in that
   folder (it runs the same command). Local logon: facts from the folder
   (remote of any host or none, README, package/pyproject/Cargo/go.mod,
   languages, licence). No GitHub call, no token.
4. **Draw.** 10 distinct styles from 153, 3 authored at a time through
   `claude -p --json-schema --tools ""` or `codex exec --sandbox read-only
   --output-schema`; one repair retry; failures skipped.
5. **Gallery.** `readme-headers/index.html`, NFO-styled, opens at once and
   fills as headers land; every card shows its number and `use N`.
6. **More.** `"make 10 more"` / `npx readme-nfo more` draws 10 unused styles
   (draw.json excludes every id used so far), numbers them 11-20 and appends
   a batch divider to the same page. Never a second 01-10.
7. **Choose.** "Install which? [1-10]" at the end of a run, or "number 3"
   to the agent, or `npx readme-nfo use 3` later.
8. **Install.** SVG + MIT notice to `.github/readme-nfo/`; marked README
   block (inserted or replaced, EOL/BOM kept); neutral alt text; no commit.
9. **Commit.** `Review with git diff, then commit.`

## 6. GitHub feasibility and risks

- **Everything used is on the allowlist**: `<p align>`, `<img width height
  alt>`, `<a href>`, `<details>`, `<sub>`, headings, fenced blocks, one
  `[!TIP]`. No `<table>` in the visible page (tables scroll on phones).
- **Hotkey anchors.** GitHub slugs `## [D]oor · make headers for your
  project` to `#door--make-headers-for-your-project` (brackets dropped, `·`
  dropped, spaces to hyphens). `build.mjs` computes slugs with GitHub's rule;
  the risk is a slug change, caught by a link check in CI.
- **Hero SVG**: self-contained, no fonts, CSS keyframes only, reduced-motion
  still. Opaque, so theme-independent.
- **Thumbs as JPEG**: no animation cost for 76 tiles; motion lives one click
  away. Risk: stills go stale when a header is rebuilt; `build.mjs --check`
  compares a hash of each source SVG.
- **Page length.** About 13 area sections make it long (prototype README is
  59 KB of Markdown, far below the 500 KiB cap). Mitigation: the hotkey row
  and the Outline menu; the per-area lists are folded.
- **Agent route.** "Ask your agent" relies on the agent running `npx
  readme-nfo` in the project. Nesting `claude -p` inside Claude Code works;
  `codex exec` from inside a Codex sandbox may lack network, so the door
  must detect it is inside Codex and fall back to printing briefs for the
  host agent (phase 2 plugin, `brief`/`check`). Until verified, the page
  should keep the agent line as "or ask your agent to run it".
- **Truth.** The page must not ship before Claude support, local mode,
  numbered batches, `more` and `use N` exist. Interim cut below.
- **Homage.** No real group names; "door", "sysop", "last callers", "NO
  CARRIER" are generic BBS vocabulary with no piracy meaning. Captions come
  from neutral names; the vector BBS tile is captioned without the product
  name.

## 7. Mobile and dark mode

- **Phone (verified in `shots/*-mobile.png`).** Hero scales to 100%; its
  menu text stays readable because the menu letters are 2x pixel-font rects
  (the last-callers dot leaders are small but decorative). Hotkeys 2-up.
  Every code block is 33 columns or fewer, so the command, the door screen,
  the file listing and the goodbye block never scroll. Thumbs 2 per row.
- **Dark.** Black screen hero on `#0d1117` reads as a CRT inset.
- **Light (verified in `shots/*-light-*.png`).** Hero, keys and thumbs are
  all opaque with their own black/blue frames, so they look like deliberate
  terminal windows on white, not accidental slabs. Text blocks are dark on
  GitHub's grey code background and stay legible.

## 8. Interim cut (true today)

Same menu and file areas, with [D]oor reduced to what works now:
`npx --yes github:lukexyz/README.NFO github.com/you/project -10`, a line that
it needs Node 22+, Git and a signed-in Codex CLI, the GH_TOKEN commands for
private repos, and the engine strip in the hero reading `ENGINE: CODEX ·
CLAUDE COMING`. [I]nstall becomes the manual copy-and-paste steps. Swap to
the target cut when the pipeline lands.

## 9. Why it's cool, weaknesses, effort

**Why it's cool.** It isn't a README *decorated* like a BBS; it *is* one.
The menu is the navigation, the file areas are the gallery, the door is the
tool, and "local logon" turns the private-repo fix into part of the fiction.
The numbered file listing makes the "number 3 / make 10 more" flow feel
native, because BBS file areas were always numbered. It shows 76 headers
(10x today's visible count) across all 13 families without 76 animations,
and it is restrained: one animated hero, one palette (ANSI blue, cyan,
yellow, magenta), strict columns.

**Weaknesses.** Long page; the 13 areas can feel like a catalogue rather
than a showcase. BBS nostalgia is narrower than "gaming" (less arcade punch
than 04 or 06). Thumbs are stills, so the wall doesn't move. Castaway
dominates (it supplies most tiles). The "ask your agent" line depends on
unverified nested-agent behaviour under Codex. The hero's last-callers dot
leaders are tiny on phones.

**Effort.** Page and assets: S-M (prototype already builds the README,
hero, keys, thumbs and social card; remaining: add the numbered file-listing
block and the `more` line, fix the Help timing to the 74 s / 151 s trial
numbers, move scripts to `tools/front-page/`, add CI `--check` and link
check). Pipeline it depends on: L (agents.mjs, local reader, numbered
batches + `more`, single cumulative gallery, install.mjs, npm publish), the
same for every concept.
