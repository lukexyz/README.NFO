# Concept 08: OPTIONS SCREEN

> The front page is a console game's front end. A title screen sits over one
> PRESS START command. Every row of the OPTIONS menu is a real flag
> (`ENGINE ◄ AUTO ►`, `PROJECT ◄ THIS FOLDER ►`, `HEADERS ◄ 10 ►`,
> `FORMAT ◄ ALL ►`). EXTRAS is the unlockables screen: 44 real headers and a
> "153/153 STYLES UNLOCKED" bar. SAVE + LOAD puts the header you pick into
> your README.

Seed angle 08, developed (revision of 2026-11-11, built on the new pipeline
trial). The twist is that **nothing on the page is pretend UI.**

- The title-screen menu is the page's table of contents.
- Each OPTIONS row is a flag, with its default and its exact spelling.
- Features that are not built yet show as greyed **LOCKED** rows, the way a
  game shows options you have not unlocked. The page is honest before and
  after the pipeline work, and the roadmap is told in the game's own words.
- The README follows game-menu order: title, start, options, extras, save,
  credits. The NFO side lives in the text: `─[ SECTION ]─` divider strips,
  dot leaders, a `─[ STAFF ]─` block, spaced capitals and an `[ EOF ]`
  closer.

How it differs from its neighbours:

- **03 SETUP.EXE** is an installer wizard. This is a game front end.
- **04 SELECT YOUR FIGHTER** builds the page around picking an engine. Here
  the engine is one options row among five, defaulting to AUTO.
- **06 ATTRACT MODE** is a wall of looping animation. EXTRAS here is a
  library of baked still cards with a completion counter.
- **10 CD-ROM AUTORUN** is a launcher splash. This concept is about options
  and saving.

Prototype files: `concepts/08-options-screen/proto/` (hero, options screen,
8 baked wall cards, desktop-light and phone-dark wall renders, and the
deterministic scripts that made them). `concepts/08-options-screen/wall.json`
lists every example file the page uses. All 44 entries were re-checked on
2026-11-11 against `git ls-files examples`: every `.md` and `.svg` is
committed, none comes from the untracked MediaLog sets.

---

## 1. The page at a glance

Six `##` headings. GitHub's Outline menu lists them in this order, and they
match the title-screen menu plus CREDITS.

```text
 [ title.svg : README.NFO title screen, animated ]
 Retro headers for your README.            (pitch, 2 lines)
 ► PRESS START · OPTIONS · EXTRAS · SAVE + LOAD · CREDITS

 ─[ PRESS START ]─ strip
 ## PRESS START   3 steps, 1 command, 1 TIP
 ─[ OPTIONS ]─ strip
 ## OPTIONS       options.svg, 35-col text twin, 1 example, MORE
 ─[ EXTRAS ]─ strip
 ## EXTRAS        unlocked.svg, 4 animated headers, 40-card wall,
                  STAGE SELECT (13 families), ALL GALLERIES (8 sets)
 ─[ SAVE + LOAD ]─ strip
 ## SAVE + LOAD   pick prompt, what gets written, use N, run again
 ## CREDITS       STAFF block, links, homage note, continue.svg
```

All page assets live in `.github/front-page/`. They are written by
`tools/front-page/build.mjs` from `tools/front-page/front-page.json`; the
README body comes from `tools/front-page/README.template.md`, and every
number is filled in at build time (section 6).

**Truth gates.** `front-page.json` carries a `shipped` map:
`{ npm, claude, localFolder, liveGallery, use }`. Every sentence, options
row and tagline that depends on pipeline work sits behind one of these
flags. The wireframe shows the **target** copy with `[gate: …]` in the
margin. Section 2.7 is the copy that is true today.

---

## 2. Wireframe, section by section (target state)

### 2.0 Hero, pitch and menu

````markdown
<p align="center">
  <img src=".github/front-page/title.svg" width="100%"
   alt="README.NFO title screen with a menu: Press Start, Options,
   Extras, Save + Load (animated)">
</p>

<p align="center">
  <b>Retro headers for your README.</b><br>
  153 styles, from DOS intros to teletext pages, drawn fresh for your
  project by Claude or Codex.                          [gate: claude]
</p>

<p align="center">
  <a href="#press-start">► PRESS START</a> ·
  <a href="#options">OPTIONS</a> ·
  <a href="#extras">EXTRAS</a> ·
  <a href="#save--load">SAVE + LOAD</a> ·
  <a href="#credits">CREDITS</a>
</p>
````

The `alt` sits on one line in the real file; it is split here to fit 80
columns. The link row repeats the menu drawn in the image as real links,
which is what the catalogue's mach-09 entry recommends.

### 2.1 PRESS START

Each section opens with a divider strip, a thin SVG (830 × 24) drawn as a
seamless `░▒▓█ PRESS START █▓▒░` bar with path glyphs and `alt=""`. The
heading underneath stays real text, so anchors and the Outline still work.

````markdown
<img src=".github/front-page/rule-start.svg" width="100%" alt="">

## PRESS START

1. Install [Node.js 22+](https://nodejs.org) and sign in to
   [Claude Code](https://claude.com/claude-code) or
   [Codex](https://developers.openai.com/codex). Either one works.
                                                       [gate: claude]
2. Open a terminal in your project's folder and run:

   ```sh
   npx readme-nfo
   ```
                                          [gate: npm, localFolder]
3. A gallery opens and fills in as each header lands. Type the number
   you like and it goes at the top of your README. Review, then commit.
                                          [gate: liveGallery, use]

That's it. The defaults are good; [OPTIONS](#options) lists what you can
change.

> [!TIP]
> **Private repo? Nothing to set up.** README.NFO reads the project
> folder on your disk, with no GitHub call and no token. The only thing
> that leaves your machine is the brief (project facts plus a style),
> sent to the agent you picked under your own sign-in.
>                                                  [gate: localFolder]
````

The command sits alone in its block, with no `$` and no comment, so the copy
button copies exactly one runnable line. `npx readme-nfo` is 14 columns and
fits every phone. Steps are prose, so they wrap instead of scrolling.

Engine choice is visible here twice: step 1 names both agents, and the
OPTIONS screen (next) shows `ENGINE ◄ AUTO ►` with `--claude` and `--codex`.
The detection rule printed by the CLI ("AGENT Claude Code (switch: --codex)")
is quoted in SAVE + LOAD, so the visitor sees which engine ran.

### 2.2 OPTIONS

````markdown
<img src=".github/front-page/rule-options.svg" width="100%" alt="">

## OPTIONS

<p align="center">
  <img src=".github/front-page/options.svg" width="640"
   alt="Options screen: engine auto, project this folder, 10 headers,
   all formats, gallery opens (animated)">
</p>

Every setting has a good default. To change one, add its flag:

```text
ENGINE .. ◄ auto ►    --claude
                      --codex
PROJECT . ◄ folder ►  a repo URL
HEADERS . ◄ 10 ►      -6  -15
FORMAT .. ◄ all ►     --format svg
                      --format text
GALLERY . ◄ opens ►   --no-open
```

For example, six SVG headers drawn by Codex:

```sh
npx readme-nfo --codex -6 --format svg
```

<details><summary><b>MORE OPTIONS</b></summary>

- **AUTO engine.** If only one of Claude Code or Codex is signed in, it is
  used. If both are, the terminal asks once.
- `npx readme-nfo github.com/you/project` draws for a repo you haven't
  cloned. Private ones use `gh auth token` if the GitHub CLI is signed in.
- `--model NAME` picks a model your agent offers.
- `--jobs N` sets how many headers are drawn at once (default 3).
- `--seed TEXT` repeats a draw exactly.
- `--resume PATH` finishes an interrupted batch.
- `--exclude FILE` skips the styles from an earlier draw, and
  `--allow-repeats` lets old styles come back.
- `--out PATH` writes the batch somewhere else, and `--no-color` turns
  off terminal colours.

</details>
````

The text twin is at most 35 columns (measured), so a phone shows it without
scrolling, and it uses only grid-safe glyphs (`◄ ►` and `.`). Every flag in
the art also appears as copyable text right below it. MORE OPTIONS is a
list, so it wraps.

Gates: `--claude`/`--codex` and AUTO (`claude`), `folder` and the
`gh auth token` fallback (`localFolder`), `--model`/`--jobs` (the
`agents.mjs` and `author.mjs` changes). `-6`, `-15`, `--format`,
`--no-open`, `--seed`, `--resume`, `--exclude`, `--allow-repeats`, `--out`
and `--no-color` exist today (`node tools/generate.mjs --help`).

### 2.3 EXTRAS

````markdown
<img src=".github/front-page/rule-extras.svg" width="100%" alt="">

## EXTRAS

<p align="center">
  <img src=".github/front-page/unlocked.svg" width="640"
   alt="Extras: 153 of 153 styles unlocked, 260 headers, 8 projects">
</p>

**260 headers made for 8 real projects. Every one of the 153 styles has
been built at least once.** Open any card for the full header, its
Markdown and the code that drew it.

<p align="center">
  <a href="examples/castaway/01-mode7-island_opus_5.5.md"><img
   src="examples/castaway/assets/01-mode7-island_opus_5.5.svg"
   width="400" alt="CASTAWAY header: island title screen on a rotating
   sea (animated)"></a>
  <a href="examples/ultra-satisfactory/13-chrome-spheres_opus_5.5.md"><img
   … width="400" alt="ULTRA-SATISFACTORY header: mirror spheres on a
   checker floor (animated)"></a>
</p>
<p align="center">
  <a …12-cassette-jcard_opus_5.5.md><img … width="400"></a>
  <a …14-off-air_opus_5.5.md><img … width="400"></a>
</p>

<p align="center">
  <a href="examples/castaway/57-synthwave-outrun_opus_5.5.md"><img
   src=".github/front-page/extras/01-castaway-outrun.jpg" width="150"
   height="101" alt="CASTAWAY header: synthwave sunset, chrome type"></a>
  … 40 cards, 5 per row on desktop, 2 per row on every phone …
</p>

### STAGE SELECT

Browse the 153 styles by family:
[PC intros](styles/pc.md) 14 · [C64, Amiga and ST](styles/c64.md) 14 ·
[Trackers](styles/trk.md) 11 · [NFO and ASCII](styles/nfo.md) 11 ·
[ANSI and BBS](styles/ansi.md) 11 · [Vaporwave and web](styles/vap.md) 17 ·
[Machines and arcades](styles/mach.md) 13 ·
[Hacker and zine](styles/hack.md) 19 ·
[Japan and East Asia](styles/asia.md) 7 · [Screensavers](styles/idle.md) 10 · [How files moved](styles/xfer.md) 10 ·
[Demoscene](styles/demo.md) 11 · [Print and media](styles/print.md) 5

<details><summary><b>ALL GALLERIES</b> · 8 projects, 260 headers</summary>

- [Castaway](examples/castaway/README.md) · 116
- [ULTRA-SATISFACTORY](examples/ultra-satisfactory/README.md) · 42
- [README.NFO](examples/readme-nfo/README.md) · 41 · drafts for this page
- [Heretic](examples/heretic/README.md) · 40
- [Dance Vision](examples/dance-vision/README.md) · 6
- [NATURALIS-HISTORIA](examples/naturalis-historia/README.md) · 5
- [GL4SS](examples/gl4ss/README.md) · 5
- [ST3GG](examples/st3gg/README.md) · 5

[Every style, by output format](styles/INDEX.md#browse-by-output-format)

</details>

<sub>These examples were drawn from the same 153 briefs, mostly in long
Claude Opus sessions ([build log](examples/build-log.csv)). Your own run
uses whatever model your agent is set to, so expect a quicker sketch.</sub>
````

Notes:

- STAGE SELECT is one wrapping paragraph. Family counts are the distinct
  styles per family, computed at build time; they sum to 153. Each family
  link targets the existing per-family style pages (the builder checks the
  path exists, and falls back to the `styles/INDEX.md` anchor if not).
- The `<sub>` line sets honest expectations. `build-log.csv` logs 168
  showcase headers as `claude-opus-5-5` workflow runs with a median of 54
  minutes each; the CLI trial took 74 s (Claude Sonnet) or 151 s (Codex).
- Each gallery's one-line blurb is read from that set's `README.md` title
  line at build time, never typed.
- MediaLog stays off the page until its 8 sets are committed (110 files are
  untracked today). The totals shown are the committed ones: 260 in 8 sets.

### 2.4 SAVE + LOAD

````markdown
<img src=".github/front-page/rule-save.svg" width="100%" alt="">

## SAVE + LOAD

While it runs, the terminal shows each header landing. At the end it
asks which one to keep:

```text
README.NFO ► my-project
AGENT ...... Claude Code
HEADERS .... 10 of 10 ready
GALLERY .... readme-headers/

Install which header?
[1-10, Enter = later] ► 3
```

Type its number. README.NFO saves it into your project:

- `.github/readme-nfo/header.svg`, the header itself
- `.github/readme-nfo/LICENSE`, the MIT notice that travels with it
- a marked block at the top of `README.md` that shows it

> [!NOTE]
> Nothing is committed for you. Check `git diff`, then commit.

To load a different header from the same batch later:

```sh
npx readme-nfo use 7
```

Run `npx readme-nfo` again for ten more. Styles you have already drawn
are skipped, so every batch is new. Batches stay in `readme-headers/`,
which is ignored by git on your machine only.

<details><summary><b>What the README block looks like</b></summary>

```html
<!-- README.NFO header: start -->
<p align="center">
  <img src=".github/readme-nfo/header.svg" width="100%"
   alt="my-project header">
</p>
<!-- README.NFO header: end -->
```

Running `use` again replaces only this block.

</details>
````

The whole section depends on the `use` gate and the pick prompt. The
terminal mock is at most 28 columns. It is rendered from the CLI's own
display code (`tools/generator/terminal.mjs`) with a fake-run fixture, the
way `tools/cli-display.test.mjs` does, so the page cannot drift from the
real output. The two alerts (TIP and NOTE) are three sections apart.

If a header fails validation it is redrawn once and then skipped, so "10 of
10" can honestly read "9 of 10" (pipeline item: one repair retry, skip
instead of stop). The mock is generated, so it shows whatever the CLI
really prints.

### 2.5 CREDITS

````markdown
## CREDITS

```text
─[ STAFF ]─────────────────────────
 DIRECTOR ..... Luke Woods
 STYLES ....... 153 briefs
 FAMILIES ..... 13
 HEADERS ...... 260, 8 galleries
 TITLE ART .... style mach-09
 RESEARCH ..... 16colo.rs, Demozoo,
                Pouet, textfiles.com
 TOOLS ........ Node.js, Playwright
 PLAYER 2 ..... you
──────────────────────────[ EOF ]──
```

[MIT licence](LICENSE) · [Style catalogue](styles/INDEX.md) ·
[How generation works](docs/generation.md) ·
[Development](docs/development.md)

<sub>The scene and console styles are homage: original lettering and
art, with no real group, console or product names.</sub>

<p align="center">
  <a href="#press-start"><img src=".github/front-page/continue.svg"
   width="360" alt="Continue? Back to Press Start"></a>
</p>
````

The STAFF block is at most 36 columns. "TITLE ART .... style mach-09"
signs the hero as catalogue output (canon move 2). `continue.svg` counts 9
to 0 at one digit a second, then shows PRESS START, and links back to the
top: the page ends the way a game does. The builder drops any link whose
target is not committed (for example `docs/development.md` if absent).

### 2.6 The whole README at phone width (sketch, 34 columns)

```text
┌──────────────────────────────────┐
│ ▓▓ README.NFO ▓▓  (title.svg)    │
│ ► PRESS START   OPTIONS          │
│   EXTRAS        SAVE + LOAD      │
└──────────────────────────────────┘
 Retro headers for your README.
 ► PRESS START · OPTIONS · EXTRAS ·
 SAVE + LOAD · CREDITS
 ░▒▓█ PRESS START █▓▒░
 1. Install Node.js 22+ and sign
    in to Claude Code or Codex.
 2. In your project's folder, run:
    ┌──────────────────┐
    │ npx readme-nfo   │ [copy]
    └──────────────────┘
 3. Gallery opens. Type a number.
 ░▒▓█ OPTIONS █▓▒░
    (options.svg, then the
     35-column text twin)
 ░▒▓█ EXTRAS █▓▒░
    unlocked bar
    4 animated, 1 per row
    ┌──────┐ ┌──────┐
    │ card │ │ card │  x20 rows
    └──────┘ └──────┘
```

### 2.7 Copy that is true today (before the pipeline ships)

The same template rendered with every `shipped` flag `false`. Only these
strings change:

| Place | Today's copy |
| --- | --- |
| Pitch | "153 styles … drawn fresh for your project by Codex. Claude support is coming." |
| Step 1 | "Install Node.js 22+ and Git, and sign in to Codex." |
| Step 2 | "Run this with your repo's URL:" then `npx --yes github:lukexyz/README.NFO github.com/you/project` |
| Step 3 | "The gallery opens when the batch is done. Each header's page shows its Markdown: copy the SVG into your repo and keep the MIT notice." |
| TIP | "Private repo? Set a token first: `export GH_TOKEN=$(gh auth token)` in bash, or `$env:GH_TOKEN = gh auth token` in PowerShell." |
| options.svg | ENGINE shows `◄ CODEX ►` with a greyed `CLAUDE: LOCKED`. PROJECT shows `◄ URL ►` with a greyed `FOLDER: LOCKED`. The cursor skips locked values (`proto/options-today-still.png`). |
| Text twin | `ENGINE .. ◄ codex ►  (Claude: locked)` and `PROJECT . ◄ URL ►    github.com/o/r` (36 columns). |
| Hero tagline | Cycles "RETRO HEADERS FOR YOUR README", "153 STYLES / 13 FAMILIES", "RUNS ON CODEX TODAY". |
| SAVE + LOAD | Heading stays. Body becomes the manual copy steps from `docs/generation.md`, plus one greyed line: "One-key install: LOCKED (coming)". |

This only goes live after the owner reconciles `origin/main` (8a03d5a,
three web-UI edits) with the local branch, because `npx github:` installs
whatever is on main.

---

## 3. Hero: the title screen (`title.svg`)

**What it is.** README.NFO's own header in catalogue style **mach-09
(8-bit console title screen)**. The catalogue's README translation for
mach-09 already describes this page: a two-line menu of the README's main
sections with a cursor on the first, a licence-and-year line, a blinking
prompt, and the menu repeated as real Markdown links under the image. The
same style for other projects: `examples/castaway/71-console-title-screen_opus_5.5.svg`
(wall card 40) and `examples/heretic/16-mach-09.svg`.

**Canvas.** viewBox 960 × 400 at `width="100%"`. An opaque `#07070f` panel
with a 4 px `#3a3a4a` bezel and `rx 16`, so it reads as a screen on white
and on `#0d1117`. Every glyph is a path or rect: no `<text>`, no external
resources.

**Layout, top to bottom:**

1. **Logo.** `README.NFO` in original, chunky, tile-built letters (12 px
   tiles, two tiles per stroke), each tile with a light top-left bevel, a
   dark bottom-right bevel and a hard 6 px shadow. The prototype upscales
   the repo's 5×7 font as a placeholder; the real logo needs hand-drawn
   letterforms stored as a glyph table in code.
2. **Tagline.** 5×7 capitals at 3× in cyan, hard-cutting between lines.
3. **Menu.** A 2 × 2 grid at 4×: `PRESS START`, `OPTIONS`, `EXTRAS`,
   `SAVE + LOAD`, with a pixel pointer.
4. **Footer.** `© 2026 LUKE WOODS   MIT LICENCE` at 2×, matching `LICENSE`.
5. **Floor.** A four-stripe band; the style calls for a flat backdrop.

**Animation.** A 12 s loop of CSS keyframes with `steps()`:

| Element | Motion | Rate |
| --- | --- | --- |
| Logo | Drops into place in whole-pixel steps, once (0.8 s, `forwards`) | once |
| Logo | Palette cycle on one face colour: amber → orange → red-orange → orange; no pixel moves | 0.6 s per step |
| Tagline | Hard cuts: "RETRO HEADERS FOR YOUR README", "153 STYLES / 13 FAMILIES", "CLAUDE OR CODEX" `[gate: claude]`, "PRIVATE REPOS WELCOME" `[gate: localFolder]` | 3 s each |
| Cursor | Steps through the four menu entries; the selected one turns white | 1.5 s each |
| PRESS START | Fades to 25 % and back while selected | 2 s cycle (far below 3 flashes/s) |

**Reduced motion.** `@media (prefers-reduced-motion: reduce)` removes every
animation and leaves a composed still: logo in amber, first tagline, cursor
on PRESS START, no pulse.

**Weight.** Prototype 44 KB; target 40 KB or less with each glyph defined
once in `<defs>` and placed with `<use>`.

**Social card.** `.github/front-page/social.png` (1280 × 640, under 1 MB)
rendered from the reduced-motion still; the owner uploads it in Settings.

Prototype renders: `proto/title-830.png` and `proto/title-340.png`. At
340 px the logo is about 30 px tall and the menu about 10 px.

---

## 4. The OPTIONS screen (`options.svg`)

The signature asset. Its animation teaches the flags.

**Canvas.** 640 × 420 at `width="640"`; about 0.53× on a phone, so 21 px
glyphs become about 11 px.

**Layout.** `OPTIONS` in amber at 6× with a hard shadow; five rows
(`ENGINE`, `PROJECT`, `HEADERS`, `FORMAT`, `GALLERY`), each a label, a dot
leader and a `◄ value ►` slot; a help bar along the bottom.

**Animation.** 20 s loop, 4 s per row. The cursor steps down the rows; on
the current row the arrows turn cyan and the value cycles. The help bar
names what is on screen:

| Row | Values in turn | Help bar |
| --- | --- | --- |
| ENGINE | AUTO, CLAUDE, CODEX | `DEFAULT  whichever is signed in`, `FLAG  --claude`, `FLAG  --codex` |
| PROJECT | THIS FOLDER, GITHUB URL | `DEFAULT  private repos ok`, `ADD  github.com/you/project` |
| HEADERS | 10, 6, 15 | `DEFAULT  ten headers`, `FLAG  -6`, `FLAG  -15` |
| FORMAT | ALL, SVG, TEXT | `DEFAULT  svg and text styles`, `FLAG  --format svg`, `FLAG  --format text` |
| GALLERY | OPENS, STAYS SHUT | `DEFAULT  opens as headers land`, `FLAG  --no-open` |

Flags are case-sensitive, so the help bar uses an original lowercase 5×7
set and never shows a flag in capitals. Glyphs are paths.

**Reduced motion.** Cursor on ENGINE, every value at its default, help bar
`DEFAULTS ARE FINE. JUST PRESS START.` (`proto/options-still.png`).

**Locked rows.** Drawn from the same data with gates off
(`proto/options-today.svg`): a greyed `CLAUDE: LOCKED` / `FOLDER: LOCKED`
sits under the value, and the cursor never cycles into it.

**Weight.** Prototype 54 KB; target 35 KB or less with `<use>` glyphs.

**Single source of truth.** One `options` array in `front-page.json` holds
each row's label, values, default, flag, help text and gate. The SVG, the
text twin and the today copy are generated from it, and a test compares it
with the CLI's `--help` output so the page and the CLI never disagree.

---

## 5. The EXTRAS wall: 44 real headers

Today's page shows 7 images from one project, all for README.NFO itself.
This wall shows 44 from 7 projects and all 13 families.

**Featured band.** 4 linked animated SVGs at `width="400"`: 2 per row on
desktop, 1 full-width per row on phones. 377 KB together (measured).

| # | File (`examples/…`) | Style | KB |
| ---: | --- | --- | ---: |
| F1 | `castaway/01-mode7-island_opus_5.5` | mach-15 | 71.9 |
| F2 | `ultra-satisfactory/13-chrome-spheres_opus_5.5` | pc-03 | 109.1 |
| F3 | `ultra-satisfactory/12-cassette-jcard_opus_5.5` | print-02 | 113.6 |
| F4 | `castaway/14-off-air_opus_5.5` | idle-10 | 82.5 |

**Card wall.** 40 baked still cards, each linked to its header's `.md`.

- **Size.** 300 × 203 JPEG (a 300 × 169 art window plus a 34 px label
  strip) shown at `width="150" height="101"`: 5 per row on desktop
  (≈ 770 of 830 px), 2 per row on every phone (304 px fits 306 px).
- **Label.** Baked in 5×7 capitals: project in amber, caption in grey,
  at most 22 characters. The caption is part of the image, so it can never
  come apart from it on phones (the showcase research's caption problem).
  The `alt` carries the description in under 100 characters, in the form
  `<PROJECT> header: <plain description>`.
- **Weight.** Measured mean 17.2 KB per card (8 rendered, 10.8 to
  26.3 KB), about 690 KB for 40. Source SVG size no longer matters.
- **Still frame.** Each art window is the source SVG's own reduced-motion
  still, so the cards show each header's composed frame.

| # | File (`examples/…`) | Label | Style |
| ---: | --- | --- | --- |
| 1 | `castaway/57-synthwave-outrun_opus_5.5` | CASTAWAY OUTRUN | vap-05 |
| 2 | `ultra-satisfactory/23-illustrated-ansi_opus_5.5` | ULTRA ANSI MASCOT | ansi-03 |
| 3 | `heretic/09-pc-12` | HERETIC NEON CUBES | pc-12 |
| 4 | `castaway/52-teletext-page_opus_5.5` | CASTAWAY TELETEXT | ansi-08 |
| 5 | `naturalis-historia/03-demo-titles` | NATURALIS DEMO TITLES | demo-01 |
| 6 | `castaway/98-3d-pipes_opus_5.5` | CASTAWAY 3D PIPES | idle-06 |
| 7 | `ultra-satisfactory/16-poster-installer_opus_5.5` | ULTRA TEXT INSTALLER | pc-07 |
| 8 | `dance-vision/02-amiga-cracktro_opus_5.5` (links its SVG, see risk 5) | DANCE VISION INTRO | original six |
| 9 | `castaway/65-memphis_opus_5.5` | CASTAWAY MEMPHIS | vap-17 |
| 10 | `heretic/15-demo-10` | HERETIC FAT PIXELS | demo-10 |
| 11 | `castaway/09-pinball-dmd_opus_5.5` | CASTAWAY PINBALL | mach-11 |
| 12 | `ultra-satisfactory/09-oscilloscope_opus_5.5` | ULTRA SCOPES | trk-09 |
| 13 | `gl4ss/04-viewdata` | GL4SS VIEWDATA | ansi-09 |
| 14 | `castaway/35-hand-pixelled-chrome-logo_opus_5.5` | CASTAWAY CHROME LOGO | c64-12 |
| 15 | `ultra-satisfactory/28-flat-silhouette-intro_opus_5.5` | ULTRA FLAT INTRO | c64-10 |
| 16 | `castaway/56-vhs-tape_opus_5.5` | CASTAWAY VHS | vap-03 |
| 17 | `heretic/12-mach-07` | HERETIC HANDHELD BOOT | mach-07 |
| 18 | `castaway/24-skinned-installer_opus_5.5` | CASTAWAY INSTALLER | pc-06 |
| 19 | `ultra-satisfactory/07-compo-slides_opus_5.5` | ULTRA PARTY SLIDES | demo-07 |
| 20 | `st3gg/01-off-air` | ST3GG TEST CARD | idle-10 |
| 21 | `castaway/30-petscii-picture_opus_5.5` | CASTAWAY PETSCII | c64-03 |
| 22 | `ultra-satisfactory/08-milkdrop-visualiser_opus_5.5` | ULTRA VISUALISER | idle-04 |
| 23 | `castaway/50-door-game-screen_opus_5.5` | CASTAWAY DOOR GAME | ansi-06 |
| 24 | `heretic/01-vap-12` | HERETIC WEB 1.0 | vap-12 |
| 25 | `castaway/26-vector-objects_opus_5.5` | CASTAWAY VECTORS | pc-13 |
| 26 | `castaway/36-st-menu-disk_opus_5.5` | CASTAWAY MENU DISK | c64-13 |
| 27 | `ultra-satisfactory/20-player-stack_opus_5.5` | ULTRA MEDIA PLAYER | trk-11 |
| 28 | `castaway/73-vfd-front-panel_opus_5.5` | CASTAWAY VFD PANEL | mach-12 |
| 29 | `gl4ss/05-luna-desktop` | GL4SS GLOSSY DESKTOP | vap-09 |
| 30 | `castaway/95-light-synth_opus_5.5` | CASTAWAY LIGHT SYNTH | idle-02 |
| 31 | `castaway/99-3d-maze_opus_5.5` | CASTAWAY 3D MAZE | idle-07 |
| 32 | `heretic/13-demo-08` | HERETIC ATTRIBUTE FX | demo-08 |
| 33 | `castaway/60-one-bit-desktop_opus_5.5` | CASTAWAY 1-BIT DESKTOP | vap-11 |
| 34 | `ultra-satisfactory/22-poster-nfo_opus_5.5` | ULTRA POSTER NFO | nfo-03 |
| 35 | `castaway/113-atari-8-bit-demo_opus_5.5` | CASTAWAY RASTER DEMO | demo-09 |
| 36 | `castaway/101-echomail-reader_opus_5.5` | CASTAWAY ECHOMAIL | xfer-02 |
| 37 | `st3gg/02-telnet-board` | ST3GG TELNET BOARD | asia-03 |
| 38 | `castaway/88-tone-pad_opus_5.5` | CASTAWAY KEYPAD | hack-17 |
| 39 | `heretic/08-vap-04` | HERETIC FORECAST | vap-04 |
| 40 | `castaway/71-console-title-screen_opus_5.5` | CASTAWAY TITLE SCREEN | mach-09 |

**Spread.** By project (with the featured four): Castaway 22, ULTRA 10,
Heretic 6, GL4SS 2, ST3GG 2, NATURALIS 1, Dance Vision 1. All 13 families
appear (pc 5, c64 4, trk 2, nfo 1, ansi 4, vap 7, mach 5, hack 1, asia 1,
idle 6, xfer 1, demo 5, print 1, plus one original-six piece). Rows
alternate projects and families so neighbours never look alike. Card 40 is
the hero's style made for another project.

**Labels.** No label or alt uses a catalogue style name. Seven style names
contain real group names (pc-07 and c64-10 are on this wall), so captions
are written by hand ("TEXT INSTALLER", "FLAT INTRO").

**Later swap-ins** once MediaLog is committed: `medialog/08-arcade-attract`,
`medialog/10-tractor-feed`, and an "it does logos too" row of four 203 px
logos from the MediaLog logo sets.

**Page weight.**

| Part | KB |
| --- | ---: |
| title.svg (target) | ≤ 40 |
| options.svg (target) | ≤ 35 |
| unlocked.svg + continue.svg | ≈ 12 |
| 4 divider strips | ≈ 8 |
| 4 featured SVGs | 377 |
| 40 cards | ≈ 690 |
| **Total** | **≈ 1.16 MB** |

Today's page is 441.5 KB; the budget is 3 MB. Above the fold (hero, pitch,
PRESS START) is under 60 KB. At most eight images animate at once (hero,
options, unlocked, continue, four featured); the 40 cards cost no CPU.

Prototype renders: `proto/wall-desk-light.png` (5 per row on white) and
`proto/wall-phone-dark.png` (2 per row at 309 px), from `proto/cards/*.jpg`.

---

## 6. New assets to make

All generated by deterministic Node scripts. Only the logo letterforms are
hand-designed, stored as a glyph table in code.

| Asset | Size | Made by | Notes |
| --- | --- | --- | --- |
| `.github/front-page/title.svg` | 960×400, ≤ 40 KB | `tools/front-page/title.mjs` | mach-09 title screen; counts and taglines from facts + `shipped` |
| `.github/front-page/options.svg` | 640×420, ≤ 35 KB | `tools/front-page/options.mjs` | From the `options` array; LOCKED rows when a gate is off |
| `.github/front-page/unlocked.svg` | 640×96, ≈ 6 KB | `tools/front-page/unlocked.mjs` | `EXTRAS` title, a bar that fills once to `153/153`, `260 HEADERS / 8 PROJECTS / 13 FAMILIES`; reduced motion shows the full bar |
| `.github/front-page/continue.svg` | 480×120, ≈ 6 KB | `tools/front-page/continue.mjs` | `CONTINUE?` 9 → 0, then `PRESS START`; reduced motion shows the static prompt |
| `.github/front-page/rule-*.svg` (4) | 830×24, ≈ 2 KB each | `tools/front-page/rules.mjs` | Seamless `░▒▓█ NAME █▓▒░` strips on an opaque dark band; static; `alt=""` |
| `.github/front-page/extras/NN-<project>-<caption>.jpg` (40) | 300×203, ≈ 17 KB | `tools/front-page/cards.mjs` (Playwright) | Reduced-motion still of each source SVG, captured via `<object>` (risk 3), bezel + baked label |
| `.github/front-page/social.png` | 1280×640, < 1 MB | `cards.mjs` | Hero still for the social preview |
| `tools/lib/pixel-font.mjs` | code | moved from `examples/readme-nfo/src/lib.mjs` | 5×7 capitals plus a new lowercase set; `<use>` glyph defs |
| `tools/front-page/front-page.json` | data | hand-edited | `shipped` gates, `options` rows, featured + wall lists (today's `wall.json`) |
| `tools/front-page/README.template.md`, `build.mjs` | code | hand-written | Fills counts, family links, wall HTML, options twin, terminal mock; writes `README.md` |

**Facts are computed, never typed:**

- Styles: `loadCatalogue()` distinct entries (153 today); family sizes from
  the same list (sum must equal the style count).
- Headers and sets: `git ls-files 'examples/*/[0-9]*.md'` (260 in 8 sets
  today). Untracked sets never count.
- "Every style built": the union of style ids across committed sets must
  cover the catalogue, or the bar shows the real fraction.
- The terminal mock: rendered by `terminal.mjs` from a fixture.

**CI.** `node tools/front-page/build.mjs --check` regenerates SVGs and the
README in memory and fails on any difference. JPEG cards are not
byte-stable across Chromium versions, so `--check` confirms each card
exists at 300 × 203 and its list entry is unchanged. Lint: code blocks
≤ 80 columns and must-read blocks ≤ 36; none of `◆◇✓✔★☆▶◀`; every link
and image resolves to a committed file; every alt is 1 to 100 characters
and contains no catalogue style name; total images ≤ 1.5 MB. The existing
`tools/front-page/render.mjs` can be reused for the API render.

---

## 7. The journey, end to end

1. **Discover.** The title screen (also the social card) shows the tool
   making its own header. The pitch says what it makes and that Claude or
   Codex draws it. The menu row jumps to any section.
2. **Press start.** Node 22+ and a signed-in Claude Code or Codex, which
   most visitors already have. In the project folder: `npx readme-nfo`.
3. **Run.** The CLI reads the local checkout (git remote of any host or
   none, README, package/pyproject/Cargo/go.mod metadata, languages,
   licence): private, GitLab and unpushed repos work with no token. It
   picks the signed-in agent (asks once if both), draws 10 distinct styles
   into `draw.json`, and authors 3 at a time, each with one repair retry;
   a header that still fails is skipped rather than stopping the batch.
4. **Watch.** The gallery opens at once and fills in. Each card shows its
   number and `npx readme-nfo use N`.
5. **Save.** "Install which header? [1-10, Enter = later]" writes
   `.github/readme-nfo/header.svg` and `LICENSE` and a marked block at the
   top of `README.md` (EOL and BOM kept, symlinks refused). Nothing is
   committed; the CLI prints "Review with git diff, then commit."
6. **Load.** `npx readme-nfo use 7` swaps later. Running again draws 10 new
   styles. `--resume` finishes an interrupted batch.
7. **Tune.** OPTIONS covers the five everyday flags; MORE OPTIONS the rest.
8. **Browse.** EXTRAS links 44 headers, STAGE SELECT 13 family pages, ALL
   GALLERIES 260 headers in 8 sets.

The page meets these in order: PRESS START (2-3), OPTIONS (7), EXTRAS (8,
and proof for 1), SAVE + LOAD (4-6).

**Pipeline dependencies** (from `research/pipeline.md`):

| Gate | Needs | Unlocks on the page |
| --- | --- | --- |
| `npm` | rename to `readme-nfo`, ship `styles/samples.json` (npx ships 0 samples today), publish (name unclaimed on 2026-11-11) | `npx readme-nfo` everywhere |
| `claude` | `agents.mjs`: detection, `claude -p --json-schema --tools ""` driver (trial: 74 s, passed `validateResponse`), Windows-safe `.cmd` resolution (fixes the `codex.cmd` spawn bug) | "Claude Code or Codex", `--claude`/`--codex`, ENGINE row, tagline |
| `localFolder` | `readLocalProject`, `gh auth token` fallback | "in your project's folder", PROJECT row, private-repo TIP, tagline |
| `liveGallery` | gallery written after each header | step 3, "fills in as each header lands" |
| `use` | `install.mjs`, pick prompt, neutral alt text | SAVE + LOAD, `use N` |

Recommended extra pipeline item, raised by this concept: a minimum glyph
size check in validation (both trial headers had illegible small text at
375 px). The page does not claim it.

---

## 8. GitHub feasibility and risks

| Feature | Renders? | Basis |
| --- | --- | --- |
| `<p align="center">`, `<img width height alt>`, `<a href>`, `<b>`, `<br>`, `<sub>`, `<details>` | yes | html-pipeline allowlist (`research/canon.md`) |
| Animated SVG through `<img>` (CSS keyframes, `steps()`) | yes | every animated example in the repo |
| Anchors `#press-start`, `#options`, `#extras`, `#save--load`, `#credits` | yes | GitHub slugs drop `+`; confirm with `render.mjs` |
| `[!TIP]` / `[!NOTE]`, 2 per page, not adjacent | yes | GitHub docs |
| 40 JPEGs with `width` + `height`, 4 divider SVGs with `alt=""` | yes | relative images; attributes kept |
| Fenced `sh` blocks with copy button | yes | command alone, no prompt |

**Risks and handling:**

1. **Leans on the pipeline.** It shines when engine choice, local folder
   and `use N` exist. Truth gates and LOCKED rows let it ship today and stay
   honest, and each feature unlocks visibly as it lands.
2. **Flags inside images.** Every flag in the art is repeated as copyable
   text right after it (twin, example, MORE OPTIONS).
3. **Reduced-motion capture.** In this Playwright Chromium, emulated
   `reducedMotion: 'reduce'` reached SVGs opened directly or via `<object>`,
   not via `<img>`. `cards.mjs` uses `<object>` (measured). Real-browser
   behaviour with an OS setting on GitHub still needs a manual check.
4. **Card determinism.** Rasters vary slightly across Chromium versions,
   and Heretic SVGs use `<text>`, so their cards bake in the builder's
   fallback fonts. `--check` validates list and size, not bytes.
5. **Linked pages with risky wording.** `dance-vision/02-amiga-cracktro_opus_5.5.md`
   has a "CRACKED BY" joke line, so card 8 links its SVG until the line is
   reworded. `castaway/35-…` cites a real group's demo in research notes
   (a citation on a deep page, not artwork). Front-page labels and alts
   contain neither.
6. **A plain hero.** A flat console title card can look thin next to
   cracktro concepts. Hand-drawn letterforms, the palette shimmer, the
   drop-in and a colour-packed wall below are the answer; the logo has to
   be good.
7. **Small labels on phones.** Baked labels are about 7 px pixel capitals
   at phone width: legible but small; alts carry the caption.
8. **Counts drift.** Committing MediaLog changes totals (to 280 headers in
   10 header sets, or 370 files in 17 if logos count). `build.mjs` recounts.
   `examples/START-HERE.md` still says "All 164 headers", so it is not
   linked until fixed.
9. **Branch divergence.** The page must be built on the reconciled main.

---

## 9. Mobile and dark mode

**Phones (306-364 px column):**

- Hero at about 0.35×: logo ≈ 30 px, menu ≈ 10 px (`proto/title-340.png`);
  the © line becomes decorative, and its facts repeat in CREDITS.
- OPTIONS image at about 0.53×, rows ≈ 11 px
  (`proto/options-340-project-row.png`).
- Must-read text blocks are ≤ 36 columns (twin 35, terminal 28, STAFF 36)
  against 34-41 visible columns. The only wide code is the README-block
  HTML inside a closed `<details>`.
- `npx readme-nfo` is 14 columns; today's 58-column command scrolls and
  hides the URL, one more reason to publish to npm.
- Featured headers 1 per row full width; cards 2 per row with labels
  attached; STAGE SELECT and ALL GALLERIES wrap (no tables).
- Divider strips scale to ≈ 9 px tall: a thin shaded rule, still readable
  as decoration, with the real heading right under it.

**Light and dark:**

- Every piece of art (hero, options, unlocked, continue, strips, cards) is
  an opaque `#07070f` panel with a 4 px `#3a3a4a` bezel. On white it reads
  as a shelf of screens and cartridges; on `#0d1117` the bezel separates
  panel from page (`proto/wall-desk-light.png`, `proto/wall-phone-dark.png`).
- No transparent art, so no `<picture>` pairs: one asset per piece.
- Text art is monochrome and works on both code backgrounds (`#f6f8fa`,
  `#151b23`).
- Accents (amber `#ffb000`, cyan `#5ce1ff`) live only inside dark panels.

---

## 10. Why it is cool

- **The UI is real.** The options menu is the flag reference and its help
  bar animates through each flag. The title menu is the table of contents.
  LOCKED rows are an honest roadmap in the game's language: the "functional
  diegetic UI" the canon research ranks highest.
- **The simplest start possible.** One command, three steps, and "the
  defaults are good". ENGINE AUTO and PROJECT THIS FOLDER are the answers
  to "Claude or Codex?" and "private repo?", shown as defaults rather than
  explained as caveats.
- **The hero is the tool's own output**, signed as style mach-09 in STAFF;
  card 40 shows the same style for another project.
- **Six times the examples.** 44 real headers from 7 projects and all 13
  families against 7 from one project today, at about 1.16 MB, with
  captions that stay attached on phones.
- **The whole loop.** Start, options, watch, save, load, run again, in the
  order a visitor meets them, ending on CONTINUE? back to PRESS START.
- **Cheap to keep true.** One data file drives the art, text and counts;
  `--check` in CI stops numbers like 152 or 320 reaching the page again.

## 11. Weaknesses

- More console game than scene NFO. The NFO flavour lives in the strips,
  dot leaders, STAFF block and `[ EOF ]`; the big images are console
  screens. 01 THE RELEASE is closer to a literal NFO.
- Much of the appeal (`ENGINE ◄ AUTO ►`, `PROJECT ◄ THIS FOLDER ►`, SAVE +
  LOAD) needs pipeline work. Built today it shows two LOCKED rows and a
  manual install: honest, less exciting.
- The wall is mostly stills; only 4 featured headers and the page's own
  art move. Less spectacle than an all-animated wall, but kinder to phones.
- Adds five small SVG generators and a Playwright card renderer.
- A flat title card only lands if the hand-drawn logo is strong.

## 12. Build effort

| Piece | Size |
| --- | --- |
| `title.mjs` with hand-drawn logo glyphs, drop-in, shimmer, menu, still | M (≈ 1 day) |
| `options.mjs` from the options array, LOCKED rows (prototype exists) | S (≈ 0.5 day) |
| `unlocked.mjs`, `continue.mjs`, `rules.mjs` | S (≈ 0.5 day) |
| `cards.mjs`: `<object>` stills, bezel, label, JPEG (prototype exists) | S (≈ 0.5 day) |
| `pixel-font.mjs` extraction, lowercase set, `<use>` defs | S |
| `README.template.md`, `build.mjs`, facts, `--check`, lint | M (≈ 1 day) |
| **Front page total** | **M-L, about 3.5 to 4 days** |
| Pipeline gates (`npm`, `claude`, `localFolder`, `liveGallery`, `use`) | separate, mostly M items in `research/pipeline.md` |

---

## 13. Prototype files (for the HTML concept build)

In `comparisons/front-page/concepts/08-options-screen/`:

- `wall.json`: 4 featured + 40 wall entries with labels, alts and the Dance
  Vision link override (all tracked, re-checked 2026-11-11).
- `proto/title.svg`, `title-830.png`, `title-340.png`: hero prototype
  (placeholder logo).
- `proto/options.svg`, `options-today.svg` and their still renders.
- `proto/cards/*.jpg`: 8 baked cards (mean 17.2 KB); `proto/wall-*.png`.
- `proto/scripts/`: `font.mjs`, `hero.mjs`, `options-screen.mjs`,
  `cards.mjs`, `wall.mjs` (deterministic, using the repo's Playwright).
