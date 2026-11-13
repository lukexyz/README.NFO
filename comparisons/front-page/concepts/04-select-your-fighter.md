# 04 · SELECT YOUR FIGHTER (versus mode)

**One-liner.** The README is an arcade versus game. Your repo takes on 153
styles, you pick Claude Code or Codex as your fighter, ten rounds are drawn,
and the winner goes on top of your README.

**The twist on the seed.** The VS screen is never Claude against Codex. The
matchup in the hero is **YOUR REPO vs 153 STYLES**, which explains the product
in one glance. Claude Code and Codex are two playable characters on a roster,
with a third **AUTO** slot (the "?" random-select square every fighting game
has) for "no flag: use whichever one I'm signed in to". So the engine choice is
a character select, there is no benchmark implied, and neither vendor is
cast as the other's enemy.

Every game screen is a real step of the pipeline:

| Game screen | README section | Pipeline step |
| --- | --- | --- |
| Title / VS screen | Hero | What it does: your repo vs a draw from 153 styles |
| HOW TO PLAY | 3 numbered steps | Install Node, sign in, `npx readme-nfo` |
| SELECT YOUR FIGHTER | Engine choice | `--claude`, `--codex`, or auto-detect |
| STAGE SELECT | Examples wall | 47 real headers from 6 projects |
| FINAL ROUND | Choose and install | `Install which header?` prompt, `use N` |
| MOVE LIST | Options (folded) | Every flag, as a move and its input |
| HIGH SCORES | Gallery index | Headers per project, generated from git |
| CONTINUE? | Troubleshooting | Sign-in, resume, timing, rate limits |
| CREDITS / GAME OVER | Thanks, links, `[ EOF ]` | Licence, docs |

Status of the claims (from `research/pipeline.md`): Claude support,
`npx readme-nfo`, reading the local folder, the live gallery and
pick-and-install are **not built yet**. This spec describes the **target cut**,
which ships with those changes, and an **interim cut** that is true today (see
"Interim cut" below). Nothing in the target cut goes live before the pipeline
it describes.

---

## 1. Wireframe, top to bottom

Widths: desktop column about 830 px, phone column 306-364 px (about 38
visible code columns). Every block a visitor must read or copy is 37 columns
or fewer, so none of it scrolls sideways on a phone; the only wider block is
the 42-column README snippet inside a fold in 1.4. All block glyphs
are ASCII, Latin-1 (`·` `»` `«`), box drawing and block elements, which pass
`tools/front-page/lib/lint.mjs`.

### 1.0 Hero: the VS screen

```html
<p align="center">
  <img src="assets/front-page/vs-title.svg" width="100%"
       alt="README.NFO title screen: your repo versus 153 styles (animated)">
</p>

<p align="center">
  <b>Retro headers for your README.</b><br>
  Your repo takes on 153 styles from NFOs, ANSI, demos, arcade screens
  and more, as SVG or copyable text. Ten rounds, one winner.
</p>
```

Then the cartridge label, the NFO release-info grid, as a `text` block. It
is kept to six lines (about 150 px) so the command still arrives early:

```text
 ░▒▓█ R E A D M E . N F O █▓▒░
 VERSUS EDITION ────────────────
 STYLES ..... 153 in 13 worlds
 FIGHTERS ... Claude Code or Codex
 STAGE ...... your repo, private OK
 ROUNDS ..... 10 per run, 1 winner
```

`153`, `13` and `10` are template tokens filled by the build script (section
4), never typed.

### 1.1 ROUND 1 · HOW TO PLAY

A decorative strip (`round-1.svg`, `alt=""`) sits above each of the four
"round" headings. Headings stay real text, so GitHub's Outline menu reads
like a game menu: HOW TO PLAY, SELECT YOUR FIGHTER, STAGE SELECT, FINAL
ROUND, MOVE LIST, HIGH SCORES, CONTINUE?, CREDITS.

Exact text:

````markdown
<p align="center"><img src="assets/front-page/round-1.svg"
  width="100%" alt=""></p>

## HOW TO PLAY

1. **Get ready.** Install [Node.js 22+](https://nodejs.org) and sign in to
   [Claude Code](https://claude.com/claude-code) or
   [Codex](https://developers.openai.com/codex).
2. **Press start.** Open a terminal in your project's folder and run:

   ```sh
   npx readme-nfo
   ```

3. **Pick the winner.** A gallery opens and fills as headers land. Type
   your favourite's number in the terminal and it goes on top of your
   README. Check `git diff`, then commit.

> [!NOTE]
> **Private repo? Same command.** README.NFO reads the folder you run it
> in, so it never asks GitHub for anything and needs no token. Your
> project's facts go only to the engine you picked, under your own sign-in.
````

The command is 14 columns, alone in its block with no `$` and no comment,
so GitHub's copy button gives a runnable line. It is the first code block
a visitor meets after the label, and it needs no editing: no URL, no flags.

### 1.2 ROUND 2 · SELECT YOUR FIGHTER

````markdown
<p align="center"><img src="assets/front-page/round-2.svg"
  width="100%" alt=""></p>

## SELECT YOUR FIGHTER

<p align="center">
  <img src="assets/front-page/select.svg" width="100%"
       alt="Select your fighter: Claude Code, Auto or Codex (animated)">
</p>

With no flag, README.NFO uses whichever engine you're signed in to, and
asks once if it's both. To choose:

**Claude Code**

```sh
npx readme-nfo --claude
```

**Codex**

```sh
npx readme-nfo --codex
```

<details>
<summary><b>FIGHTER STATS</b></summary>
(three text blocks, below)
</details>
````

The three stat cards inside the fold (each 36 columns or fewer):

```text
 » CLAUDE CODE
 ─────────────────────────────────
 FLAG ........ --claude
 SIGN IN ..... claude.ai or API key
 RUNS AS ..... claude -p, no tools
 MODEL ....... --model to choose
```

```text
 » AUTO (no flag)
 ─────────────────────────────────
 ONE SIGNED IN ... uses that one
 BOTH ............ asks you once
 NEITHER ......... shows sign-in
```

```text
 » CODEX
 ─────────────────────────────────
 FLAG ........ --codex
 SIGN IN ..... ChatGPT or API key
 RUNS AS ..... codex exec, read-only
 MODEL ....... --model to choose
```

Deliberately absent: speed, power or quality bars. The only timing data is
a handful of single trials with different models and effort (Claude on
Sonnet 74 s; Codex 151 s on 2026-11-11 and 378 s at xhigh in October), so
any comparison would be untrue.

### 1.3 ROUND 3 · STAGE SELECT

````markdown
<p align="center"><img src="assets/front-page/round-3.svg"
  width="100%" alt=""></p>

## STAGE SELECT

Every stage is a real header drawn from the same 153-style catalogue, for a
real project. **Demo play:** these were built in longer, hand-reviewed
sessions, so treat them as what each style can look like. Your run draws
ten styles and makes them fresh for your project. Tap a stage for the full
header, its Markdown and the script that draws it.

<p align="center">
  <a href="examples/castaway/01-mode7-island_opus_5.5.md"><img
     src="examples/castaway/assets/01-mode7-island_opus_5.5.svg"
     width="400"
     alt="CASTAWAY: island title screen on a rotating sea (animated)"></a>
  <a href="examples/ultra-satisfactory/13-chrome-spheres_opus_5.5.md"><img
     src="examples/ultra-satisfactory/assets/13-chrome-spheres_opus_5.5.svg"
     width="400"
     alt="ULTRA-SATISFACTORY: mirror spheres on a checker floor (animated)"></a>
</p>
<p align="center"><sub>BOSS STAGES · Castaway island title screen ·
ULTRA-SATISFACTORY chrome spheres</sub></p>

<p align="center">
  <a href="examples/castaway/57-synthwave-outrun_opus_5.5.md"><img
     src="assets/front-page/stages/01.jpg" width="150" height="84"
     alt="CASTAWAY: sunset, laser grid and chrome wordmark"></a>
  ... 19 more, 5 per row ...
</p>

<details>
<summary><b>20 MORE STAGES</b></summary>
  ... 20 tiles, same markup ...
</details>

<details>
<summary><b>TEXT STAGES</b> · headers made of copyable text</summary>
  ... 5 tiles ...
</details>

<details>
<summary><b>STAGE LIST</b> · every stage by number</summary>
  01 · Castaway · sunset, laser grid and chrome wordmark ... (47 lines)
</details>

**13 worlds:** [NFO + ASCII](styles/nfo.md) 11 ·
[ANSI + BBS](styles/ansi.md) 11 ·
[8/16-bit](styles/c64.md) 14 · [PC intros](styles/pc.md) 14 · ... ·
[Print + media](styles/print.md) 5

[All 260 headers in 8 galleries »](examples/README.md) ·
[All 153 styles »](styles/INDEX.md)
````

"Demo play" is the attract-mode label arcade machines show when nobody is
really playing. Here it does an honesty job: the showcase came from long
agent sessions, not from one CLI run. The Castaway and ULTRA-SATISFACTORY
sets alone are 158 Claude Opus runs logged in `examples/build-log.csv`, with
a median of 54 minutes of design and critique per header.

World labels are neutral rewrites of the family titles, which contain words
the page must not use ("keygen", "phreak"): PC intros, 8/16-bit, Trackers,
NFO + ASCII, ANSI + BBS, Vaporwave, Arcade + console, Terminal + zine,
Japan + East Asia, Screensavers, Modems + files, Demoscene, Print + media.
Counts per world come from the catalogue (pc 14, c64 14, trk 11, nfo 11,
ansi 11, vap 17, mach 13, hack 19, asia 7, idle 10, xfer 10, demo 11,
print 5 = 153).

### 1.4 FINAL ROUND · PUT IT IN YOUR README

````markdown
<p align="center"><img src="assets/front-page/round-final.svg"
  width="100%" alt=""></p>

## FINAL ROUND: PUT IT IN YOUR README

<p align="center">
  <img src="assets/front-page/champion.svg" width="100%"
       alt="Picking header 3 of ten and installing it on a README (animated)">
</p>

When the last header lands, the terminal asks
`Install which header? [1-10, Enter = later]`. Type a number and README.NFO:

- copies that header to `.github/readme-nfo/header.svg`, with the MIT
  notice beside it;
- adds it to the top of your README between two marker comments, or
  swaps out the one it added before;
- stops there. Nothing is committed: check `git diff`, then commit.

Changed your mind? Install another one from the same run:

```sh
npx readme-nfo use 7
```

<details>
<summary>What gets added to your README</summary>

```html
<!-- README.NFO header: start -->
<p align="center">
  <img src=".github/readme-nfo/header.svg"
       width="100%"
       alt="your-repo: retro header">
</p>
<!-- README.NFO header: end -->
```

</details>

Runs stay in `readme-headers/`, which git ignores on your machine (an
entry in `.git/info/exclude`). The next run never redraws a style you've
already seen.
````

The prompt is inline code in prose, so it wraps on phones rather than
scrolling. The alt text the installer writes is neutral (`NAME: retro
header`), which also fixes the real-group-name leak from catalogue style
names (pipeline failure 12).

### 1.5 MOVE LIST

````markdown
## MOVE LIST

<details>
<summary><b>All the moves</b> ·
options for <code>npx readme-nfo</code></summary>

```text
 MOVE                    INPUT
 ──────────────────────────────────
 Pick Claude Code ...... --claude
 Pick Codex ............ --codex
 Pick a model .......... --model M
 Fewer rounds .......... -6
 Text or SVG only ...... --format svg
 One at a time ......... --jobs 1
 Don't open gallery .... --no-open
 Finish a stopped run .. --resume DIR
 Install header 3 ...... use 3
 Repo not cloned? ...... a GitHub URL
```

Full reference: [docs/generation.md](docs/generation.md).
</details>
````

`-6`, `--format`, `--no-open` and `--resume` exist today; `--claude`,
`--codex`, `--model`, `--jobs`, `use` and URL-less local mode arrive with the
pipeline changes. The build script takes this list from the CLI's own help
table so the two cannot drift.

### 1.6 HIGH SCORES

````markdown
## HIGH SCORES

Headers built so far, by project.

```text
 ─[ HIGH SCORES ]───────────────────
 RANK NAME GALLERY           HEADERS
 1ST  CST  CASTAWAY ............ 116
 2ND  USF  ULTRA-SATISFACTORY ... 42
 3RD  NFO  README.NFO ........... 41
 4TH  HRT  HERETIC .............. 40
 5TH  DNC  DANCE VISION .......... 6
 6TH  NAT  NATURALIS-HISTORIA .... 5
 6TH  GLS  GL4SS ................. 5
 6TH  STG  ST3GG ................. 5
 ───────────────────────────────────
 TOTAL 260 · 153 OF 153 STYLES CLEAR
```

Play a gallery: [Castaway](examples/castaway/README.md) ·
[ULTRA-SATISFACTORY](examples/ultra-satisfactory/README.md) ·
[README.NFO](examples/readme-nfo/README.md) ·
[Heretic](examples/heretic/README.md) ·
[NATURALIS-HISTORIA](examples/naturalis-historia/README.md) ·
[GL4SS](examples/gl4ss/README.md) · [ST3GG](examples/st3gg/README.md)
````

Every number is generated: rows from `git ls-files` numbered header pages per
set (260 in 8 sets today), "153 OF 153 STYLES CLEAR" from the coverage check
already in `tools/validate.mjs` (lines 137-162), which reports the committed
sets cover every distinct style. Ties share a rank. When the MediaLog sets are
committed, the script adds MLG rows, with the 90 compact logos as a separate
`LOGOS` bonus row so logos are never counted as headers. Dance Vision is
listed but not linked until its pages lose their "cracked by" and keygen
jokes (5 of its 6 header pages carry them).

### 1.7 CONTINUE?

```markdown
## CONTINUE?

> [!TIP]
> **Engine not signed in?** README.NFO stops before writing anything and
> says how to fix it: open Claude Code once and log in, or run `codex login`.

- **Run stopped?** `npx readme-nfo --resume readme-headers/<run>` finishes
  it without redrawing.
- **How long?** From under a minute to several minutes per header,
  depending on engine, model and effort. Three draw at a time, and the
  gallery fills as they land.
- **Rate limited?** It drops to one at a time and carries on.
- **Not cloned?** `npx readme-nfo github.com/you/project` reads the repo
  from GitHub instead, using your `gh` sign-in for private ones.
```

Two alerts on the page (NOTE in 1.1, TIP here), never consecutive, as
GitHub advises.

### 1.8 CREDITS and GAME OVER

````markdown
## CREDITS

```text
 ─[ CREDITS ]──────────────────────
 ART RESEARCH .. 16colo.rs, Demozoo,
                 Pouet, textfiles.com
 BUILT WITH .... Node.js, Playwright
 ENGINES ....... Claude Code, Codex
 LICENCE ....... MIT
 ───────────────────── GAME OVER ──
```

[Docs](docs/generation.md) · [Style catalogue](styles/INDEX.md) ·
[All galleries](examples/README.md) · [MIT licence](LICENSE) ·
[Musings](MUSINGS.md)

<p align="center"><img src="assets/front-page/game-over.svg"
  width="100%" alt=""></p>
````

`game-over.svg` is a static strip: `THANKS FOR PLAYING` left, `[ EOF ]` right,
a drained health bar between.

---

## 2. The hero and its animation

`assets/front-page/vs-title.svg`, viewBox `0 0 960 400` (2.4:1), target 90 KB
or less. Every glyph is a `<path>` built from a shared pixel font; no `<text>`,
no external anything.

Sketch (not page text):

```text
┌──────────────────────────────────────────────────────────────────────┐
│ YOUR REPO                      ┌────┐                     153 STYLES │
│ ████████████████████████▓▒░    │ 10 │    ░▒▓████████████████████████ │
│                                └────┘                                │
│                  ▄▀▀ R E A D M E . N F O ▀▀▄  (chrome)               │
│   ┌────────────┐                                    ┌────────────┐   │
│   │ ┌────────┐ │            █   █   ▄▀▀▀▀           │ ┌────────┐ │   │
│   │ │README  │ │            ▀▄ ▄▀   ▀▄▄▄            │ │  NFO   │ │   │
│   │ │▒▒▒▒▒▒▒▒│ │              █         ▀▄          │ │ ░▒▓█▓▒ │ │   │
│   │ └────────┘ │                     ▄▄▄▀           │ └────────┘ │   │
│   └────────────┘                                    └────────────┘   │
│     YOUR REPO                                        NFO + ASCII     │
│                                                                      │
│        10 ROUNDS  ·  1 WINNER  ·  THE TOP OF YOUR README             │
│                         » PRESS START «                              │
└──────────────────────────────────────────────────────────────────────┘
```

Layers:

1. **Cabinet plate.** Opaque rounded rect (r 14) in `#0a0b1e` with a 2 px
   `#2a2f5a` bezel, so it reads as a lit screen on white and on `#0d1117`.
2. **Stage backdrop.** Twelve static copper bands, indigo to violet, over a
   two-blue checker arena floor drawn in perspective. Not the synthwave
   sun-and-grid (the canon's most overused retro move).
3. **HUD.** Two health bars (yellow fill, red drain notch, white outline)
   under the name tags `YOUR REPO` and `153 STYLES`, with a round counter
   between them showing `10` and the word `ROUNDS`.
4. **Left fighter: your repo.** An original pixel sprite: an upright folder
   with a `README` sheet whose header slot is an empty dithered grey band.
   Two-frame idle bob (`steps(2)`, 0.8 s).
5. **Centre.** The `README.NFO` wordmark in hand-placed half-block cells with
   a chrome gradient split at a horizon line, and a big `VS` in a red-to-
   yellow gradient with a black outline, skewed -10°. Every 6 s the VS
   slams in (scale 1.6 to 1.0 over 0.25 s) with one lightning slash: one
   flash per cycle, far under the 3-per-second limit.
6. **Right fighter: 153 styles.** A stack of three cards. The front card
   cycles every 1.5 s through 13 original 16 x 12 world emblems, scaled 8x,
   with the world name on the plate below: a block-letter `N` with a shade
   fade (NFO + ASCII), a CRT with colour blocks (ANSI + BBS), a floppy
   (8/16-bit), a starfield with a scroller line (PC intros), tracker rows
   (Trackers), a palm and sun (Vaporwave), a joystick (Arcade + console),
   a `>_` prompt (Terminal + zine), a dithered adventure-game window
   (Japan + East Asia), pipes (Screensavers), a modem with lights
   (Modems + files), a chrome sphere (Demoscene), a labelled cassette
   (Print + media). One loop is 19.5 s.
7. **Footer.** `10 ROUNDS · 1 WINNER · THE TOP OF YOUR README` in a 3 x 5
   font, and `» PRESS START «` pulsing at 1 Hz between full and 25 %
   opacity (a pulse, not a hard blink).

Reduced motion (`@media (prefers-reduced-motion: reduce)`): every animation
off, and the composed still shows the VS at rest, full health bars, the NFO
emblem on the front card and `PRESS START` fully lit.

Numbers in the art (`153`, `10`) are injected from `loadCatalogue()` and the
CLI's default count, so the hero cannot go stale the way the current `152`
art did.

**Social card.** `vs-title.png`, 1280 x 640, the reduced-motion still
rendered by Playwright on a 1280 x 640 dark canvas (GitHub's social preview
must be PNG, JPG or GIF under 1 MB; SVG is refused). The repo "About" line,
FILE_ID.DIZ style: "Retro README headers for your repo. 153 styles, Claude
Code or Codex, one command: npx readme-nfo."

### The other animated panels

**`select.svg`**, viewBox `0 0 960 380`, target 45 KB:

```text
┌──────────────────────────────────────────────────────────────────────┐
│               S E L E C T   Y O U R   F I G H T E R                  │
│                                                                      │
│  ╔══════════════════╗   ┌──────────────────┐   ┌──────────────────┐  │
│  ║ 1P               ║   │                  │   │                  │  │
│  ║   round CRT-head ║   │    grey          │   │  square handheld │  │
│  ║   sprite, >_     ║   │    silhouette ?  │   │  sprite, $_      │  │
│  ║   visor          ║   │                  │   │  visor           │  │
│  ╚══════════════════╝   └──────────────────┘   └──────────────────┘  │
│      CLAUDE CODE                AUTO                  CODEX          │
│       --claude                 no flag               --codex         │
│   sign in: claude.ai    uses whoever is signed  sign in: ChatGPT     │
│   runs: no tools        in, asks if both        runs: read-only      │
└──────────────────────────────────────────────────────────────────────┘
```

- Order is alphabetical, with AUTO in the middle as the default. Cards
  have neutral silver frames; the `1P` cursor (red frame and tag) is the
  only colour accent, so no card wears a vendor's brand colour.
- Sprites are original and generic: no logos, no marks, no mascots. The
  names appear only as pixel-font labels (nominative use).
- Animation: the cursor rests on AUTO, moves to CLAUDE CODE, back to AUTO,
  then to CODEX, 2 s per stop, 8 s loop, with a slow frame glow. Reduced
  motion: cursor on AUTO.
- The flags in the image are decoration; the copyable commands are the
  code blocks under it.

**`champion.svg`**, viewBox `0 0 960 420`, target 50 KB: what happens after
the run.

```text
┌──────────────────────────────────────────────────────────────────────┐
│ CHOOSE YOUR CHAMPION          │ Install which header?                │
│ ┌──┐ ┌──┐ ╔══╗ ┌──┐ ┌──┐      │ [1-10, Enter = later] 3              │
│ │01│ │02│ ║03║ │04│ │05│      │ + .github/readme-nfo/header.svg      │
│ └──┘ └──┘ ╚══╝ └──┘ └──┘      │ + .github/readme-nfo/LICENSE         │
│ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐      │ ~ README.md  header block on top     │
│ │06│ │07│ │08│ │09│ │10│      │ Review with git diff, then commit.   │
│ └──┘ └──┘ └──┘ └──┘ └──┘      │ ┌ README.md ───────────┐             │
│        WINNER  03             │ │▓▓▓▓▓▓ header ▓▓▓▓▓▓▓▓│             │
│                               │ │ # your-repo          │             │
│                               │ └──────────────────────┘             │
└──────────────────────────────────────────────────────────────────────┘
```

The cursor walks the ten cards (abstract colour thumbnails, not real art),
stops on 03, `WINNER` lights once, the terminal lines type in at a calm 12
characters per second, and the README sheet's header slot fills with card
03's colours. 10 s loop. Reduced motion: the final state.

**Round strips** (`round-1.svg`, `round-2.svg`, `round-3.svg`,
`round-final.svg`, `game-over.svg`): viewBox `0 0 960 44`, about 3 KB each,
static. Dark plate, `ROUND 1` (or `FINAL ROUND`, `GAME OVER`) in yellow
5 x 7 pixel caps at the left, a health bar on the right that drains a little
more on each strip, so the page itself reads as one match.

---

## 3. The examples wall (47 real headers)

All files below are committed in git. No MediaLog set is used (110 files are
still untracked) and no README.NFO-set piece is used (they show the stale
`152`). Dance Vision is left out because its header pages carry "cracked by"
and keygen jokes. The picks span 6 projects (Castaway 28, ULTRA-SATISFACTORY
11, Heretic 5, NATURALIS-HISTORIA 1, GL4SS 1, ST3GG 1) and 47 distinct
catalogue styles, covering all 13 families.

### Boss stages: 2 animated SVGs, `width="400"`, no height

Paths are relative to `examples/`.

| # | Header page | SVG | Size | Caption |
| --- | --- | --- | --- | --- |
| B1 | `castaway/01-mode7-island_opus_5.5.md` | `castaway/assets/01-mode7-island_opus_5.5.svg` | 72 KB | Island title screen on a rotating sea |
| B2 | `ultra-satisfactory/13-chrome-spheres_opus_5.5.md` | `ultra-satisfactory/assets/13-chrome-spheres_opus_5.5.svg` | 109 KB | Mirror spheres on a checker floor |

### Stage wall: 20 visible tiles, `width="150" height="84"`, 5 per row

Each tile is a static 300 x 168 thumbnail (2x) of the header's own
reduced-motion still, linked to the header's `.md` page.

| # | Header page | Caption |
| ---: | --- | --- |
| 01 | `castaway/57-synthwave-outrun_opus_5.5.md` | Sunset, laser grid and chrome wordmark |
| 02 | `castaway/14-off-air_opus_5.5.md` | Test card with an island inside |
| 03 | `heretic/15-demo-10.md` | Fat-pixel wordmark on colour-clash blocks |
| 04 | `castaway/52-teletext-page_opus_5.5.md` | Teletext page with mosaic island |
| 05 | `ultra-satisfactory/16-poster-installer_opus_5.5.md` | Bold text-mode installer poster |
| 06 | `castaway/98-3d-pipes_opus_5.5.md` | Screensaver pipes spelling the title |
| 07 | `castaway/65-memphis_opus_5.5.md` | Squiggles, confetti and a live preview |
| 08 | `castaway/35-hand-pixelled-chrome-logo_opus_5.5.md` | Hand-pixelled chrome logo |
| 09 | `ultra-satisfactory/23-illustrated-ansi_opus_5.5.md` | ANSI mascot with a speech bubble |
| 10 | `castaway/09-pinball-dmd_opus_5.5.md` | Orange dot-matrix pinball display |
| 11 | `ultra-satisfactory/12-cassette-jcard_opus_5.5.md` | Cassette shell, J-card and obi strip |
| 12 | `castaway/30-petscii-picture_opus_5.5.md` | Forty-column character-grid island |
| 13 | `castaway/50-door-game-screen_opus_5.5.md` | BBS door game with countdown clock |
| 14 | `ultra-satisfactory/28-flat-silhouette-intro_opus_5.5.md` | Flat colour fields and skyline |
| 15 | `castaway/95-light-synth_opus_5.5.md` | Mirrored pixel trails, pure colour |
| 16 | `castaway/24-skinned-installer_opus_5.5.md` | Chrome installer with a porthole |
| 17 | `castaway/36-st-menu-disk_opus_5.5.md` | Numbered menu disk with scroller |
| 18 | `naturalis-historia/03-demo-titles.md` | Demo title card with temple and moon |
| 19 | `ultra-satisfactory/09-oscilloscope_opus_5.5.md` | Nine neon scopes, one per machine |
| 20 | `castaway/99-3d-maze_opus_5.5.md` | First-person brick maze with map |

### 20 MORE STAGES (inside `<details>`)

| # | Header page | Caption |
| ---: | --- | --- |
| 21 | `castaway/56-vhs-tape_opus_5.5.md` | Camcorder tape with timestamp |
| 22 | `castaway/58-city-pop-sleeve_opus_5.5.md` | Record sleeve and track list |
| 23 | `castaway/26-vector-objects_opus_5.5.md` | Glass crystal and vector-ball title |
| 24 | `castaway/73-vfd-front-panel_opus_5.5.md` | Hi-fi panel with glowing segments |
| 25 | `castaway/88-tone-pad_opus_5.5.md` | Dual-tone keypad with live scopes |
| 26 | `castaway/87-file-system-landscape_opus_5.5.md` | Folders as an isometric island city |
| 27 | `castaway/60-one-bit-desktop_opus_5.5.md` | One-bit desktop with wait dialog |
| 28 | `ultra-satisfactory/07-compo-slides_opus_5.5.md` | Big-screen party slide, countdown |
| 29 | `ultra-satisfactory/08-milkdrop-visualiser_opus_5.5.md` | Swirling music visualiser |
| 30 | `castaway/113-atari-8-bit-demo_opus_5.5.md` | Raster-ramp demo screen |
| 31 | `castaway/115-swapper-floppy_opus_5.5.md` | Hand-labelled floppies on the beach |
| 32 | `castaway/90-pc-98-adventure-screen_opus_5.5.md` | Dithered adventure screen |
| 33 | `castaway/78-fetch-card_opus_5.5.md` | Terminal fetch card with ASCII palm |
| 34 | `castaway/101-echomail-reader_opus_5.5.md` | Message-board reader, pixel banner |
| 35 | `ultra-satisfactory/20-player-stack_opus_5.5.md` | Media player, equaliser, playlist |
| 36 | `ultra-satisfactory/22-poster-nfo_opus_5.5.md` | Shaded NFO poster, release table |
| 37 | `heretic/09-pc-12.md` | Neon cube field under a wordmark |
| 38 | `heretic/03-nfo-02.md` | Shaded block slabs breaking into debris |
| 39 | `gl4ss/04-viewdata.md` | Viewdata time-directory screen |
| 40 | `st3gg/02-telnet-board.md` | Telnet board with a hidden layer |

### TEXT STAGES (inside `<details>`)

Thumbnails of the first text block of each page, drawn light-on-black like
an NFO viewer. The link opens the copyable text.

| # | Header page | Size | Caption |
| ---: | --- | --- | --- |
| 41 | `castaway/45-newschool-ascii_opus_5.5.md` | 78 x 24 | Dollar-fill blob lettering |
| 42 | `castaway/07-7bit-outline-nfo_opus_5.5.md` | 78 x 38 | Slanted outline logo, ASCII island |
| 43 | `heretic/07-c64-04.md` | 40 x 16 | Disk-directory listing art |
| 44 | `ultra-satisfactory/32-generated-banner_opus_5.5.md` | 80 x 38 | Stamped block banner lettering |
| 45 | `heretic/04-nfo-10.md` | 59 x 20 | Signed line-art picture |

### Measured, not guessed

I rendered all 40 SVG tiles with Playwright (Chromium, `reducedMotion:
'reduce'`, 150 x 84 at device scale 2, contained on a `#0b0c18` plate). Every
still was a good frame; none needed a time override. Taking the smaller of
JPEG (quality 82) and PNG per tile, the 40 tiles total **488 KB** (12.2 KB
average). The script and sheet are in the session scratchpad
(`front-page/04-fighter/thumbs.mjs`, `thumbs-sheet.png`).

Page weight, target cut:

| Part | Weight |
| --- | ---: |
| Hero + select + champion + 5 strips | about 200 KB (targets) |
| 2 boss stages | 181 KB |
| 20 visible tiles | about 250 KB |
| 20 more + 5 text tiles (fetched even when folded) | about 280 KB |
| **Total** | **about 0.9 MB** |

Above the fold (hero, label, steps, NOTE) is about 100 KB. Both are well
under the research budget of 1.5 MB above the fold and 3 MB per page.

Why static tiles: 40 animated SVGs would weigh about 4 MB and run 40
animations at once. Motion lives where it earns attention (hero, select,
champion, two boss stages); the wall is for scanning, and each tile opens the
animated original.

---

## 4. New assets

All generated by deterministic Node scripts under `tools/front-page/`, run
with `npm run front-page`.

| Path | What | Notes |
| --- | --- | --- |
| `assets/front-page/vs-title.svg` | Hero, animated | ≤ 90 KB, reduced-motion still |
| `assets/front-page/vs-title.png` | 1280 x 640 social card | Playwright render of the still |
| `assets/front-page/select.svg` | Character select, animated | ≤ 45 KB |
| `assets/front-page/select-interim.svg` | Interim select | Claude Code card locked |
| `assets/front-page/champion.svg` | Pick and install, animated | ≤ 50 KB |
| `assets/front-page/round-1.svg` ... `round-final.svg` | 4 static strips | about 3 KB each |
| `assets/front-page/game-over.svg` | Static footer strip | about 3 KB |
| `assets/front-page/stages/01.jpg` ... `45.png` | 45 thumbnails, 300 x 168 | smaller of JPEG/PNG |
| `tools/front-page/lib/pixel-font.mjs` | 5 x 7 and 3 x 5 fonts | lifted from `FONT`, `glyphPath()` and `text()` in `tools/pliny-headers/render.mjs` (lines 18-50) |
| `tools/front-page/hero.mjs`, `select.mjs`, `champion.mjs`, `strips.mjs` | SVG generators | numbers passed in, never typed |
| `tools/front-page/thumbs.mjs` | Thumbnail renderer | Playwright (already a devDependency) |
| `tools/front-page/stages.json` | The 47 picks | md, svg, caption, alt, optional `at` |
| `tools/front-page/README.template.md` | Page template | tokens for counts and the wall |
| `tools/front-page/build.mjs` | Orchestrator | `--cut target\|interim`, `--check` |

**`build.mjs`** does five things:

1. **Counts.** Distinct styles and families from `loadCatalogue()`
   (`tools/generator/hybrid-catalogue.mjs`), the CLI default count from the
   CLI, committed headers per set from `git ls-files`, and style coverage
   from the check in `tools/validate.mjs` (moved into `tools/lib/` so both
   share it).
2. **Assets.** Runs the SVG generators with those numbers, then
   `thumbs.mjs` for any tile whose source SVG hash changed (a manifest
   records hashes, so rasters are not rebuilt or diffed needlessly).
3. **Page.** Fills `README.template.md`: hero numbers, cartridge label,
   stage wall, stage list, worlds line, high scores and move list (taken
   from the CLI's help table).
4. **Lint.** Applies the rules of `tools/front-page/lib/lint.mjs`
   (80 columns, safe glyphs, reduced motion, no `<text>`, no external refs,
   links resolve and are tracked in git, no link to `.html`).
5. **Check.** `--check` rebuilds in memory and fails if `README.md` differs.
   That goes into `.github/workflows/validate.yml`, so a count can never be
   typed by hand again.

**Pipeline-side theming** (small, optional, after the pipeline work):

- **Terminal** (`tools/generator/terminal.mjs`): one banner row
  `README.NFO ─ your-repo VS 153 STYLES`, then plain rows
  `ENGINE Claude Code (switch: --codex)`, `PROJECT local folder, private OK`,
  and per header `ROUND 03  vap-05 ..... done 0:52`.
- **Gallery** (`tools/generator/hybrid-output.mjs`): the `index.html` that
  opens at once becomes a stage-select grid. Each card says `ROUND 03`,
  flips from `LOADING` to the art as it lands, shows `REPAIRING` during the
  one automatic retry, and has a copyable `npx readme-nfo use 3`. When all
  are in, a banner says "Choose your champion: type its number in the
  terminal." (Local HTML, so full CSS is fine here.)
- **npm description** (`package.json`): replace "Retro scene / keygen /
  cracktro README headers." with "Retro README headers for your project:
  153 styles from NFOs, ANSI, demos and arcade screens."

---

## 5. The journey

1. **Discover (3 seconds).** The VS screen says what this is: your repo
   meets 153 styles. The tagline and cartridge label give the facts.
2. **Believe (scroll).** Two animated boss stages and a 20-tile wall of
   real headers from six projects; 25 more one tap away.
3. **Get ready.** Node.js 22+ and one signed-in engine. No Git, no GitHub
   token and no URL once the npm package exists.
4. **Press start.** `npx readme-nfo` in the project folder. Facts come from
   disk (name from the remote or folder, description from package metadata
   or the README, languages from tracked files, licence), so private,
   GitLab and unpushed repos work with no token.
5. **Fighter.** Auto-detect, or `--claude` / `--codex`. If the chosen one
   isn't signed in, the run stops before creating files, with a one-line
   hint.
6. **Rounds.** Ten distinct styles drawn and saved to `draw.json`, three
   drawn at a time, each checked and repaired once if needed. The gallery
   is already open and fills in as they land.
7. **Final round.** `Install which header? [1-10, Enter = later]`. The
   header and MIT notice go to `.github/readme-nfo/`, a marked block goes at
   the top of the README, nothing is committed.
8. **Review.** `git diff`, commit, push. The new header is live.
9. **Continue.** `npx readme-nfo use 7` swaps in another from the same run;
   running again draws ten new styles it hasn't shown you yet.

---

## 6. Interim cut (true today)

If the page must go live before the pipeline work, `build.mjs --cut interim`
swaps these parts and keeps everything else (hero, stage wall, high scores,
credits):

- **Select screen.** `select-interim.svg`: CODEX card selected; the CLAUDE
  CODE card is a dimmed silhouette with a padlock and `COMING SOON`; no AUTO
  card. Text under it: "Codex only for now. Claude Code support is coming."
- **HOW TO PLAY.**
  1. Install Node.js 22+ and Git, and sign in to Codex (`codex login`).
  2. Run this, with your repo's URL in place of `you/project`:
     `npx --yes github:lukexyz/README.NFO github.com/you/project -4`
     (in a `sh` block; 62 columns, so it scrolls on phones).
  3. When the gallery opens, copy your favourite's SVG into your repo's
     `assets/` folder and paste its Markdown at the top of your README.
- **NOTE.** "Private repo? Lend it your GitHub sign-in first:
  `export GH_TOKEN=$(gh auth token)` (PowerShell:
  `$env:GH_TOKEN = gh auth token`)."
- **FINAL ROUND.** The champion panel shows the manual copy steps instead
  of the prompt; no `use N`.
- **MOVE LIST.** Today's flags only: `-N`/`--count`, `--format`, `--out`,
  `--no-open`, `--resume`, `--seed`, `--project`.
- **CONTINUE?** "One header took 2 to 6 minutes in our trials, one at a
  time, so start with four."
- **Cartridge label.** `FIGHTERS ... Codex (Claude soon)` and
  `STAGE ...... a GitHub repo URL`; `ROUNDS ..... 4 to start` to match the
  interim command.

Prerequisite for either cut: reconcile the three web-edited commits on
`origin/main` with this branch, because `npx github:` installs main's older
CLI today.

---

## 7. GitHub feasibility and risks

**Uses only what GitHub renders:** `<p align="center">`, `<a href>`,
`<img src width height alt>`, `<details><summary>`, `<b>`, `<sub>`, `<br>`,
fenced `sh`, `text` and `html` blocks, two alerts, and H2 headings. No
tables on the page itself, no `<picture>` needed, no inline SVG, no
`style` or `class`.

**SVG rules:** self-contained, CSS keyframes only, glyphs as paths, a
`prefers-reduced-motion` still in every animated file, nothing flashing
more than once a second.

Risks and mitigations:

1. **The target cut depends on unbuilt work** (Claude driver, npm name,
   local mode, live gallery, `use N`). Mitigation: the interim cut, and the
   `--check` gate so the target cut cannot be merged without the CLI help
   table that backs the move list.
2. **"Versus" could read as a Claude-vs-Codex benchmark.** Mitigation: the
   VS is repo vs styles; the select screen has no stats bars; order is
   alphabetical; both sprites share one palette.
3. **Product names in artwork.** "Claude Code" and "Codex" appear only as
   plain pixel-font labels describing compatibility. No logos, marks,
   brand colours or mascots.
4. **Fighting-game clichés.** No blood, no "finish him"-style catchphrases,
   no copy of any real game's select-screen layout, fonts or world map.
   "FIGHT" appears nowhere as a shout; the strongest word is `VS`.
5. **Showcase honesty.** The wall came from long agent sessions, not the
   CLI. Mitigation: the "Demo play" sentence, in the wall's own vocabulary.
6. **Linked pages are older than the front page.** Castaway pages say their
   own run links do not resolve here; some style notes on linked pages name
   real groups or software as style references (Castaway 35, 50, 101).
   Captions on the front page are neutral; a later pass could tidy the
   linked pages.
7. **Tile height on phones.** `height="84"` would distort a raster if its
   width shrank, but 150 px tiles never shrink (two fit in a 306 px column).
   Boss stages have no height attribute, so they scale cleanly.
8. **Folded tiles still download** (closed `<details>` does not stop image
   fetches; `loading="lazy"` survival on GitHub is unverified). Counted in
   the 0.9 MB above.
9. **Thumbnails can drift across Playwright versions.** Rasters are
   regenerated only when the source SVG hash changes, and CI checks the
   manifest, not raster bytes.
10. **Unverified on github.com:** the Outline menu with these caps
    headings, and alert rendering inside long pages. Check with
    `tools/front-page/render.mjs` (GitHub Markdown API) before
    shipping.

---

## 8. Mobile and dark mode

**Phone (306-364 px column):**

- The hero scales to about 140 px tall. `README.NFO` and `VS` stay large;
  HUD labels become decoration. The tagline below repeats the message in
  real text.
- Steps are Markdown and wrap. Every code block a visitor must read or
  copy is 37 columns or fewer (`npx readme-nfo --claude` is 23), so nothing
  scrolls. The only wider block is the README snippet inside a fold (42).
- The select image's card names render about 10 px tall, and the commands
  under it are real text.
- The stage wall is 2 tiles per row (2 x 150 + gap = 304 px), so the 20
  visible tiles take about 10 rows (around 900 px), not a lonely single
  column. Boss stages stack full width.
- No Markdown tables anywhere on the page, so nothing turns into a
  sideways-scrolling block.

**Dark and light:**

- Every image is an opaque "cabinet screen" with its own dark plate and a
  light bezel: lit screens on `#0d1117`, framed screens on white. No art
  relies on the page background, so no `<picture>` pairs are needed. The
  arcade is always lit by design.
- Thumbnails carry a baked 2 px `#2a2f5a` frame, so dark tiles read as a
  deliberate grid on white rather than slabs.
- All words a visitor needs are real Markdown, which GitHub themes itself.
- Text blocks use GitHub's code background in each theme; the dot-leader
  NFO grids read the same in both.

---

## 9. Why it is cool

- The whole pipeline becomes a game loop everyone already knows: insert
  repo, select fighter, play ten rounds, crown a winner, see it on your
  README. Each screen is a real step, so the theme does the explaining.
- Engine choice is literally a character select, and the AUTO "?" square
  maps perfectly onto auto-detect: the most natural UI there is for "Claude
  Code, Codex, or whichever I have".
- 47 real headers from six projects and all 13 families, at about 0.9 MB,
  two per row on phones: almost eight times today's six examples, at about
  twice today's image weight (441.5 KB for the hero and six SVGs).
- The high-score table is a true, generated count, and "153 OF 153 STYLES
  CLEAR" is a real boast the repo has earned.
- "Demo play" solves the showcase-honesty problem with a period-correct
  device instead of a disclaimer paragraph.
- NFO bones under the arcade skin: cartridge label as the release-info
  grid, dot leaders, `─[ ]─` rulers, shade fades, credits and `[ EOF ]`.
- Phone-first by construction: every block is 37 columns or fewer.

## 10. Weaknesses

- The metaphor is playful but a stretch: styles are not really opponents,
  and some visitors will find VS framing silly. It leans arcade more than
  pure NFO.
- Three bespoke pixel-art panels (hero, select, champion) set a high craft
  bar. Weak sprites would make it look cheap, and the canon warns that
  people can tell drawn from generated.
- It depends more than most concepts on unbuilt pipeline features; the
  interim cut, with a locked Claude card, is the weaker version.
- The wall is static. The repo's signature is animation, and only the hero,
  select, champion and two boss stages move.
- 45 raster thumbnails are new binary files to maintain, and the stage
  list must be curated by hand in `stages.json`.
- A long page (eight sections), though each is short and the outline menu
  makes it navigable.

## 11. Build effort

| Work | Size |
| --- | --- |
| `pixel-font.mjs` extraction, round strips, game-over strip | S |
| `vs-title.svg` hero with sprites, emblems and animation | M-L (1-1.5 days) |
| `select.svg` and `select-interim.svg` | M |
| `champion.svg` | M |
| `thumbs.mjs` and `stages.json` (prototype already measured) | S |
| `build.mjs`: counts, template, lint, `--check`, CI hook | M |
| Template copy for both cuts | S |
| Terminal and gallery theming (after the pipeline work) | S-M |
| **Concept total** | **about 3-4 days** |
| Pipeline prerequisites from `research/pipeline.md` (separate) | L |

**HTML concept build.** Put a `README.md` written as if it were the root
README in `comparisons/front-page/concepts/04-select-your-fighter/`, with the
new SVGs and thumbnails beside it, and render it for desktop and phone,
light and dark:

```sh
node tools/front-page/render.mjs \
  comparisons/front-page/concepts/04-select-your-fighter
```
