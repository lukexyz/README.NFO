# 03 · SETUP.EXE

**The front page is a skinned late-90s game installer, and what it installs is
a retro header into *your* README.**

Every wizard page is a real step of the pipeline: *Step 1 of 3* picks the
engine (Claude Code or Codex), *Step 2 of 3* runs one command in your project
folder, and *Step 3 of 3* picks a number and installs it. *Finish* shows exactly
what landed in your README, and how to undo it. Then the box-back gallery opens
up: 72 real headers from six projects, covering all 13 style families, behind a
component tree built from GitHub's own `<details>` elements.

Written 2026-10-13, revised 2026-11-11 against the November research
(see "Revision 2026-11-11" below). Counts were recomputed on 2026-11-11 and
still hold: 153 distinct styles, 13 families, 260 committed headers in 8 sets,
and all 148 example paths in the picks file are tracked in git (section 10). Example picks, as data: [`03-setup-exe.picks.json`](03-setup-exe.picks.json).

### Revision 2026-11-11

What changed after the November pipeline audit, and how this spec absorbs it:

- **Timings.** The November trial took 74 s for one header with Claude
  (`claude -p --json-schema --tools ""`, Sonnet) and 151 s with Codex on the
  user's default settings (378 s in October at xhigh). The *How long* fold
  now quotes those figures exactly.
- **Stage B is weaker than it looked.** The `npx github:` install ships 0
  sample generators and installs origin/main's older CLI, and Windows npm
  installs of Codex fail because `codex.cmd` is spawned without a shell.
  Stage B therefore says *Git and a signed-in Codex CLI* and links
  `docs/generation.md` for troubleshooting instead of promising it works
  everywhere. Stage A (`npx readme-nfo`, name unclaimed on 2026-11-11) is the
  real target; stage B is the honest fallback only.
- **Alternative install.** The agent-plugin path (`/plugin marketplace add
  lukexyz/README.NFO`, or `codex plugin marketplace add`) gets one closed
  fold under *Custom install*, rendered only when `.claude-plugin/` exists
  in the repo (the stage probe checks it). It is never the primary path.
- **Legibility gate.** Both November trial headers had illegible small text at
  375 px. The examples wall uses stills at 150 px, so it is unaffected, but
  the hero and dialogs keep body text at 21 px caps or larger (about 11 px on
  phones), and the build lint measures that.

---

## At a glance

| | |
| --- | --- |
| Hero | Animated skinned installer window (960 × 480 SVG, two skins swapped by `<picture>`) that plays the whole pipeline in a 30 s loop. Real example thumbnails are embedded in it. |
| Instructions | 3 steps, 1 command (`npx readme-nfo`). Each step is a wizard dialog image followed by plain Markdown and a copyable block. |
| Engine choice | Step 1's dialog shows **CLAUDE CODE** and **CODEX** as radio cards. The text says setup uses whichever one is signed in, and `--claude` / `--codex` pick one. |
| Private repos | Stated in the requirements box and in Step 2: setup reads the folder on disk, needs no token, and sends project facts only to the chosen engine. |
| Examples | 72 distinct committed headers (today the page shows 7): 10 animated featured pieces at 400 px plus 62 still tiles at 150 px in 13 family rows. They come from 6 projects. |
| After generation | *Finish* section: the two files written, the exact marked block inserted, `use N` to swap, and how to uninstall. |
| Truth gate | The art and copy are built in two stages. Stage A is the target pipeline. Stage B is true today: Codex only, with CLAUDE CODE greyed out as *COMING SOON*. The stage is chosen automatically from the CLI's own `--help`. |
| Page weight | About 2.2 MB in total; about 0.4 MB above the fold (sections 6 and 10). |
| Effort | About 4 to 5 days after the pipeline ships; stage B can ship on today's CLI (section 12). |

---

## 1. The idea

Late-90s and 2000s PC games shipped in themed installers: chunky chrome frames,
lit marquee signs, a soundtrack toggle, a progress bar and a scrolling credits
strip. The house already has the reference piece:
[`examples/castaway/24-skinned-installer_opus_5.5.md`](../../../examples/castaway/24-skinned-installer_opus_5.5.md)
(`pc-06`). [`ultra-satisfactory/34-dos-setup`](../../../examples/ultra-satisfactory/34-dos-setup_opus_5.5.md)
(`mach-05`, the DOS game SETUP screen) and
[`castaway/03-desktop-takeover`](../../../examples/castaway/03-desktop-takeover_opus_5.5.md)
(a wizard page with `< Back` and `Next >`) show the same grammar.

The joke is also the product: README.NFO really *installs* something, a header
into your README. So the wizard metaphor is not decoration; it is the manual:

| Wizard page | What really happens | Where on the page |
| --- | --- | --- |
| Welcome | What it is: 153 styles, your project, your engine | Hero, title, pitch |
| System requirements | Node 22+, one signed-in engine, any repo on disk | Requirements box |
| Step 1 of 3 · Choose an engine | Claude Code or Codex, whichever is signed in | Dialog 1 + text |
| Step 2 of 3 · Install | `npx readme-nfo` draws 10 headers, 3 at a time, into a live gallery | Dialog 2 + command |
| Step 3 of 3 · Select | Type a number; setup patches the README | Dialog 3 + text |
| Finish | Two files plus one marked block; nothing committed | *What setup changes* |
| Select components | The gallery as a component tree, 13 families | Gallery |
| Custom install | Flags, URL mode, timing, privacy | `<details>` |
| Uninstall | Delete the block and one folder | *What setup changes* |
| Credits / `[ EOF ]` | Licence, research archives, tools | Footer |

The same voice runs through the CLI: the terminal labels its phases *Step 1 of 3*
to *Step 3 of 3*, and the browser gallery is drawn in the same skin (section 8).
README, terminal and gallery read as one installer.

**What keeps it distinct from the other nine angles.** It is not a cracktro
boot (02), a character-select roster (04), a BBS menu (05), an attract loop
(06), a diskmag (07), an options screen (08), a terminal reel (09) or an
autorun splash with big buttons (10). Its signature devices are *Step N of 3*
pages with `Next >` keys, a greyed-out *COMING SOON* option, a *Finish* page
and an *Uninstall* line, and a component tree for the gallery.

**Words.** The page says *Setup* and *Install*, never *SETUP.EXE*: `.EXE` would
make Mac and Linux readers think the tool is Windows-only. No piracy
vocabulary appears anywhere, in the copy or in the art. The skin borrows the
grammar of themed game installers, not any real OS or product chrome: no OS
logo, no Start button, no copied window controls.

---

## 2. Truth gate: two stages, chosen by the CLI itself

The strongest version needs pipeline work that is not built yet: the Claude
driver, local-folder mode, the npm name, the live gallery and `use N` (see
`research/pipeline.md`, section 8). So the concept is built in two stages from
one template:

- **Stage A (target).** Ships once `readme-nfo@0.1.0` exists.
- **Stage B (true today, origin/main).** Codex only, a GitHub URL, `GH_TOKEN`
  for private repos, and copying the header in by hand.

The front-page build script runs `node tools/generate.mjs --help` and looks for
`--claude`, `--codex` and the `use` subcommand. It also checks the package name.
If any are missing, it builds stage B. So the README cannot claim Claude
support, local mode or `use N` before the CLI's own help lists them. In the art,
stage B is a period-correct device rather than a disclaimer: the CLAUDE CODE
radio card is drawn disabled, with a *COMING SOON* plate, the way installers
grey out components you cannot install yet.

Section 3 is the stage A page. Stage B differences are listed at the end of it.

---

## 3. Wireframe, section by section (stage A)

The README is generated. A comment at the top says so:

```html
<!-- Generated by tools/front-page/build.mjs from docs/front/README.template.md
     and docs/front/front-page.json. Edit those, then run npm run front. -->
```

### 3.1 Hero

```html
<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)"
            srcset="docs/front/setup-hero-carbon.svg">
    <img src="docs/front/setup-hero-silver.svg" width="100%"
         alt="README.NFO Setup: an animated late-90s installer window that
              picks an engine, draws ten headers and installs one">
  </picture>
</p>
```

See section 4 for the art and animation.

### 3.2 Title, pitch, nav row

```html
<h1 align="center">README.NFO</h1>

<p align="center">
  <b>Retro headers for your README.</b><br>
  153 styles of 90s and 2000s NFO, ANSI, demoscene and game-screen art,
  drawn for your project by Claude Code or Codex. Pick one; setup installs it.
</p>

<p align="center">
  <b>[&nbsp;<a href="#install">INSTALL</a>&nbsp;]</b>&nbsp;
  <b>[&nbsp;<a href="#gallery">GALLERY</a>&nbsp;]</b>&nbsp;
  <b>[&nbsp;<a href="styles/INDEX.md">STYLES</a>&nbsp;]</b>&nbsp;
  <b>[&nbsp;<a href="#custom-install">OPTIONS</a>&nbsp;]</b>
</p>
```

The bracketed text buttons copy the house pattern from the Castaway installer
page (its `[ INSTALL ] [ NFO ] [ MUSIC ]` row). They are real links, not image
buttons, so they stay crisp, keyboard-reachable and theme-proof. `153` is a
template value.

### 3.3 Proof, above the fold

Two animated headers in a same-aspect pair, from two different projects:

```html
<p align="center">
  <a href="examples/ultra-satisfactory/13-chrome-spheres_opus_5.5.md"><img
     src="examples/ultra-satisfactory/assets/13-chrome-spheres_opus_5.5.svg"
     width="400" alt="ULTRA-SATISFACTORY header: chrome spheres over a
     checkerboard (animated)"></a>
  <a href="examples/castaway/98-3d-pipes_opus_5.5.md"><img
     src="examples/castaway/assets/98-3d-pipes_opus_5.5.svg" width="400"
     alt="CASTAWAY header: screensaver pipes spelling the title (animated)"></a>
  <br><sub>Two of 260 example headers, each drawn for its own project.
  <a href="#gallery">70 more below</a>.</sub>
</p>
```

`260` and `70` are template values: committed headers, and featured plus tiles
minus these two.

### 3.4 Install

```markdown
## Install
```

The requirements box: one plain line, then a 38-column block, so phones show
it without scrolling.

```text
┌─[ SYSTEM REQUIREMENTS ]────────────┐
│ NODE.JS .............. 22 or newer │
│ ENGINE ...... Claude Code or Codex │
│ PROJECT ......... any repo on disk │
│ PRIVATE REPOS ...... yes, no token │
│ USAGE ........... your own sign-in │
└────────────────────────────────────┘
```

**Step 1**

```markdown
### Step 1 of 3: Sign in to an engine
```
```html
<p align="center"><picture>
  <source media="(prefers-color-scheme: dark)"
          srcset="docs/front/step-1-engine-carbon.svg">
  <img src="docs/front/step-1-engine-silver.svg" width="640"
       alt="Setup, step 1 of 3: choose Claude Code or Codex">
</picture></p>
```

> Install [Node.js 22+](https://nodejs.org), then sign in to
> [Claude Code](https://claude.com/claude-code) or
> [Codex](https://developers.openai.com/codex). Setup uses whichever one is
> signed in.

```markdown
> [!TIP]
> If setup says no engine is signed in, run `claude` once and sign in, or run
> `codex login`, then run setup again.
```

```html
<p align="right"><a href="#step-2-of-3-run-setup-in-your-project"
  ><kbd>Next &gt;</kbd></a></p>
```

**Step 2**

```markdown
### Step 2 of 3: Run setup in your project
```

*(dialog `step-2-run-*.svg`, width 640, alt "Setup, step 2 of 3: drawing ten
headers into a gallery, three at a time")*

> In your project's folder, run:

```sh
npx readme-nfo
```

> Signed in to both? Add `--claude` or `--codex`. Private repos just work:
> setup reads your project from disk, needs no GitHub token, and sends your
> project facts only to the engine you chose.

*(`Next >` key, bottom right, linking to Step 3)*

**Step 3**

```markdown
### Step 3 of 3: Pick a number
```

*(dialog `step-3-pick-*.svg`, width 640, alt "Setup, step 3 of 3: pick header
7 of 10 and install it")*

> Your gallery opens in the browser and fills as headers land. Type your
> favourite's number in the terminal and setup puts it at the top of your
> README. Review with `git diff`, then commit.

*(`Finish` key, bottom right, linking to "What setup changes")*

### 3.5 What setup changes (the Finish page)

```markdown
### What setup changes
```

*(dialog `finish-*.svg`, width 640, alt "Setup complete: header 7 is at the
top of the README; nothing committed")*

> Setup never commits. It writes two files and one marked block:

```text
.github/readme-nfo/header.svg   the header you picked
.github/readme-nfo/LICENSE      README.NFO's MIT notice
README.md                       the block below, at the top
```

```html
<!-- README.NFO header: start -->
<p align="center">
  <img src=".github/readme-nfo/header.svg" width="100%"
       alt="my-project: retro header">
</p>
<!-- README.NFO header: end -->
```

> Changed your mind? `npx readme-nfo use 4` swaps in header 4 from the same
> batch. **Uninstall:** delete the block and the `.github/readme-nfo/` folder.

The file paths (30 columns or fewer) stay visible on a phone; only the
right-hand notes scroll. The block shows the alt text as `NAME: retro header`
rather than the pipeline draft's `NAME — retro header`, so the code block keeps
to Latin-1 and the alt still never names a catalogue style.

### 3.6 Gallery

```markdown
## Gallery

Every header here was drawn for a real project. Open one to see it full size,
with its Markdown and the script that drew it.
```

**Featured: four more same-aspect pairs, animated SVGs at width 400.**
There is one `<p align="center">` per pair, with a one-line `<sub>` caption
after it (captions read left to right on desktop and top to bottom on phones):

| Pair | Left | Right | Aspects | Caption |
| --- | --- | --- | --- | --- |
| 1 | `castaway/01-mode7-island_opus_5.5` | `castaway/14-off-air_opus_5.5` | 1.78 / 1.78 | Island title screen · Off-air test card |
| 2 | `castaway/57-synthwave-outrun_opus_5.5` | `castaway/35-hand-pixelled-chrome-logo_opus_5.5` | 2.29 / 2.29 | Sunset grid · Hand-pixelled chrome logo |
| 3 | `castaway/65-memphis_opus_5.5` | `castaway/24-skinned-installer_opus_5.5` | 1.71 / 1.71 | Memphis poster · Skinned installer |
| 4 | `castaway/52-teletext-page_opus_5.5` | `ultra-satisfactory/23-illustrated-ansi_opus_5.5` | 1.26 / 1.28 | Teletext page · ANSI mascot |

The pairs were chosen so that both sides share an aspect ratio. Rows stay even
without `height` attributes, which would letterbox badly on phones.

**Browse by family: the component tree.**

```markdown
### Browse by family

13 families, 153 styles. These previews are stills; open one to watch it move.
```

Each family is one `<details>`. The first four are `open`; the other nine are
closed. A closed one still shows its summary line, so the 13 lines read like an
installer's component list with `[+]` expanders.

```html
<details open>
<summary><b>Consoles, arcades &amp; machines</b> · 13 styles</summary>
<p align="center">
<a href="examples/castaway/09-pinball-dmd_opus_5.5.md"><img
   src="docs/front/tiles/castaway-09.jpg" width="150"
   alt="CASTAWAY header: pinball dot-matrix display"></a>
<!-- four more tiles, same shape -->
</p>
</details>
```

The tiles are 300 × 168 JPEGs (16:9, shown at 150 px). Each is rendered from its
SVG at a fixed capture time and letterboxed on `#16181d` with a 1 px `#30363d`
keyline. Every tile has the same aspect, so rows are even with `width` alone.

The full file list is in section 5. After the tree come two link lines:

```markdown
Plain-text headers too, ready to paste into any README:
[7-bit outline NFO](examples/castaway/07-7bit-outline-nfo_opus_5.5.md) ·
[newschool ASCII](examples/castaway/45-newschool-ascii_opus_5.5.md) ·
[stacked banner lettering](
  examples/ultra-satisfactory/32-generated-banner_opus_5.5.md) ·
[line art](examples/heretic/04-nfo-10.md)

All 260 examples, by project:
[Castaway](examples/castaway/README.md) 116 ·
[ULTRA-SATISFACTORY](examples/ultra-satisfactory/README.md) 42 ·
[README.NFO](examples/readme-nfo/README.md) 41 ·
[Heretic](examples/heretic/README.md) 40 ·
[Dance Vision](examples/dance-vision/README.md) 6 ·
[Naturalis Historia](examples/naturalis-historia/README.md) 5 ·
[GL4SS](examples/gl4ss/README.md) 5 ·
[ST3GG](examples/st3gg/README.md) 5
```

Every number in these lines is a template value.

### 3.7 Custom install

```markdown
## Custom install
```

```html
<details>
<summary><b>Options</b>: engine, count, model, a repo not on disk</summary>
```

```text
npx readme-nfo --claude     draw with Claude Code
npx readme-nfo --codex      draw with Codex
npx readme-nfo -6           6 headers instead of 10
npx readme-nfo --model M    ask your engine for model M
npx readme-nfo use 4        install header 4 later
npx readme-nfo you/repo     a GitHub repo not on disk
```

> For a repo you have not cloned, setup reads it from GitHub. Private ones use
> `GH_TOKEN`, or your `gh` sign-in when `GH_TOKEN` is not set.

```html
</details>
<details>
<summary><b>How long does it take?</b></summary>
```

> Each header is one request to your engine. In testing, one header took 74
> seconds with Claude Sonnet, 2.5 minutes with Codex on default settings and
> about 6 minutes with Codex at its highest
> reasoning setting. Setup draws three at a time and shows each one as it
> lands.

```html
</details>
<details>
<summary><b>What leaves your machine?</b></summary>
```

> Only the drawing prompt: your project's name, description, languages and
> README headings, plus the style briefs. It goes to the engine you chose,
> under your own sign-in. README.NFO has no server.

```html
</details>
<details>
<summary><b>Where do batches go?</b></summary>
```

> Into `readme-headers/` in your project. Setup keeps it out of git through
> `.git/info/exclude`, and each new run skips the styles you have already
> drawn.

```html
</details>
<details>
<summary><b>Prefer an agent plugin?</b> (only once it ships)</summary>
```

```text
/plugin marketplace add lukexyz/README.NFO
/plugin install readme-nfo@readme-nfo
```

> In Codex: `codex plugin marketplace add lukexyz/README.NFO`, then
> `codex plugin add readme-nfo@readme-nfo`. Your agent draws the headers
> itself and installs the one you pick, same as setup.

```html
</details>
```

The timing answer quotes the two single trial runs in `research/pipeline.md`
exactly. Replace it with measured medians once a 10-header run per engine has
been logged.

### 3.8 Licence and credits

```markdown
## Licence and credits
```

```text
─[ SETUP COMPLETE ]───────────────────
 LICENCE ...... MIT, keep the notice
 RESEARCH ..... 16colo.rs · Demozoo
                Pouet · textfiles.com
 BUILT WITH ... Node.js · Playwright
 BY ........... Luke Woods
─────────────────────────────[ EOF ]──
```

```markdown
[LICENSE](LICENSE) · [Style catalogue](styles/INDEX.md) ·
[How generation works](docs/generation.md)
```

GitHub's Outline menu then reads like the wizard's page list:

```text
README.NFO
  Install
    Step 1 of 3: Sign in to an engine
    Step 2 of 3: Run setup in your project
    Step 3 of 3: Pick a number
    What setup changes
  Gallery
    Browse by family
  Custom install
  Licence and credits
```

### 3.9 Stage B (true today) differences

| Slot | Stage B content |
| --- | --- |
| Pitch | "…drawn for your project by Codex (Claude Code support is coming)." |
| Requirements | The box below |
| Step 1 dialog | CLAUDE CODE card disabled with a *COMING SOON* plate; CODEX selected |
| Step 1 text | "Install Node.js 22+ and Git, and sign in to Codex." No TIP here. |
| Step 2 command | `npx --yes github:lukexyz/README.NFO github.com/you/project -4` (60 columns; it scrolls on phones), followed by "Swap in your project's GitHub address." |
| Step 2 TIP | "Private repo? First run `export GH_TOKEN=$(gh auth token)` in bash, or `$env:GH_TOKEN = gh auth token` in PowerShell." |
| Step 2 dialog | Field `REPO [ github.com/you/project ]`, a lock icon with *PRIVATE: SET GH_TOKEN*, and *ONE AT A TIME* |
| Step 3 text | "The gallery opens when every header is done. Each card has Copy Markdown and Save SVG: put the SVG in your repo's `assets/` and paste the Markdown at the top of your README." |
| Finish | The files block becomes `assets/NN-style.svg` plus the pasted Markdown; there is no `use N`; uninstall stays the same |
| Options | Only the flags today's CLI lists in `--help` |

```text
┌─[ SYSTEM REQUIREMENTS ]────────────┐
│ NODE.JS .............. 22 or newer │
│ GIT .................. any version │
│ ENGINE .......... Codex, signed in │
│ PROJECT ............ a GitHub repo │
│ PRIVATE REPOS ....... set GH_TOKEN │
└────────────────────────────────────┘
```

---

## 4. The hero and its animation

**File:** `docs/front/setup-hero-{carbon,silver}.svg`, viewBox 960 × 480 (2:1),
shown at 100% width. The 2:1 ratio means the same composition becomes the
1280 × 640 social card.

```text
  .-------------------------------.
 / * * * * * * * * * * * * * * * * \ _______________________________________
|   R E A D M E . N F O    (lit)    | S E T U P          STEP 2 OF 3 [o][o] |
 \_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_/ |______________________________________|
|  STEPS        |  .------------------------------------.  |  [  NEXT >  ]  |
|    Welcome    |  | DRAWING 10 HEADERS · 3 AT A TIME   |  |  [ < BACK   ]  |
|  √ 1 Engine   |  |  [##] [##] [##] [##] [##]          |  |  [  CANCEL  ]  |
|  ► 2 Run      |  |  [░░] [░░] [░░] [░░] [░░]          |  |                |
|    3 Pick     |  |  [##########..........]  5 / 10    |  |  ♪ ON  ■■■□□   |
|    Finish     |  '------------------------------------'  |  SKIN: CARBON  |
|_______________|__________________________________________|________________|
|  .   *    .   *  ~ R E A D M E . N F O  S E T U P · 153 STYLES ~   .   *  |
 \_________________________________________________________________________/
```

**Parts** (all drawn by script: rects, paths and gradients; no `<text>`):

- **Marquee sign** (top left, about 320 × 80). A chamfered plate with README.NFO
  in a chamfered vector face, about 44 px caps, with an amber-to-gold gradient
  and a light break line. A ring of 28 bulbs runs round its edge. The face is
  lifted from `castaway/src/24-skinned-installer_opus_5.5.mjs`, same author,
  MIT.
- **Title strip.** S E T U P in spaced caps, the current *STEP N OF 3*, and two
  generic round window nubs. These are not copies of any OS's controls.
- **Steps rail** (left, about 180 px). WELCOME, 1 ENGINE, 2 RUN, 3 PICK and
  FINISH, set in the 5 × 7 bitmap face at scale 3. A `►` LED marks the current
  page, and `√` marks pages already done.
- **Page viewport** (centre, 520 × 280). A recessed screen with faint
  scanlines. Five pages cycle through it (timeline below).
- **Button column** (right). Pill buttons NEXT >, < BACK and CANCEL; a cursor
  presses NEXT at each page change. Below them sit a VU meter with five beat
  LEDs pulsing at 2 Hz, a ♪ ON toggle (there is no audio, as in all the
  house's music toggles) and a small plate reading SKIN: CARBON or SKIN: SILVER.
- **Bottom strip.** Three starfield layers drifting at different speeds behind
  one sine scroller of path glyphs:
  `README.NFO SETUP · RETRO HEADERS FOR YOUR README · CLAUDE CODE OR CODEX ·
  RUNS IN YOUR PROJECT FOLDER · PRIVATE REPOS OK · 153 STYLES · 13 FAMILIES ·
  MIT ·`. Stage B's scroller says `CODEX TODAY · CLAUDE CODE SOON` and drops
  the folder and private-repo claims.
- **Real thumbnails inside.** The 10 gallery cells on pages P2 to P4 are real
  example headers. Each is embedded as a 96 × 54 JPEG data URI (about 2-3 KB
  each, about 30 KB in total), taken from the same tile pipeline, so the hero
  shows real output landing, not abstract blocks. The repo's own validator
  (`tools/lib/checks.mjs`) already accepts `data:` references. The fallback,
  if GitHub misbehaves, is ten tiny vector motifs drawn by the script.

**Timeline** (30 s loop; pages switch with a 0.3 s horizontal wipe):

| Time | Page | What moves |
| --- | --- | --- |
| 0-5 s | P0 WELCOME | "Welcome to README.NFO Setup. This puts a retro header on your README." Big pixel counters roll up to 153 STYLES · 13 FAMILIES. The cursor travels to NEXT. |
| 5-11 s | P1 ENGINE | Two radio cards, CLAUDE CODE and CODEX. The dot moves Claude → Codex → Claude, 2 s each. Caption: "USES THE ONE YOU'RE SIGNED IN TO". (In stage B the Claude card is disabled and only the Codex dot shows.) |
| 11-19 s | P2 RUN | "FOLDER ./my-project · PRIVATE OK". Thumbnails land in batches of three (3, 6, 9, 10) and the progress bar steps with them. |
| 19-25 s | P3 PICK | The selection box hops 1 → 4 → 7. The prompt types "INSTALL WHICH HEADER? 7". |
| 25-30 s | P4 FINISH | A mini README sheet: header 7 slides into its top, grey "text" lines below, "README.md UPDATED · REVIEW WITH GIT DIFF". Then it wipes back to P0. |

Constant: the bulbs chase (one step every 0.5 s), the scroller moves at about
40 px/s, the starfield drifts and the beat LEDs pulse. Nothing flashes more than
three times a second, and there is no full-frame flash.

**Reduced motion.** `@media (prefers-reduced-motion: reduce)` stops every
animation and shows a composed still page, P-STILL. On it the rail shows all
five pages with `√` ticks. The viewport shows a summary: "1 CHOOSE CLAUDE CODE
OR CODEX · 2 RUN SETUP IN YOUR PROJECT · 3 PICK A NUMBER", with all ten
thumbnails filled and #7 framed. The bulbs are lit steady, and the scroller is
parked and centred on "153 STYLES · 13 FAMILIES". This still is also the
social card frame.

**Skins.** One drawing with two palettes:

- **CARBON** (dark): a graphite frame (`#1b1f27` to `#3a4150`), cyan
  `#39d0ff` and magenta `#ff4fd8` accents, an amber sign and a black viewport.
- **SILVER** (light): a brushed silver bevel (`#c9ccd2` to `#f2f3f5`), a navy
  to teal title strip, an amber sign and a white viewport with black type.

Both are fully opaque, with a 1 px dark outer keyline *and* a 1 px light inner
keyline, so either skin also reads on the "wrong" background (see section 11).

**Budget.** Hero SVG ≤ 100 KB per skin, about 30 KB of it embedded thumbnails.
The glyphs are `<use>` of one path per character, as in the Castaway installer.

**Phone legibility (340 px wide, scale 0.35).** The sign's 44 px caps render at
about 15 px, page headings (36 px) at about 13 px and body text (21 px) at about
7 px, which turns into texture. That is acceptable, because the dialogs and the
Markdown below carry the same information legibly.

---

## 5. Wizard dialogs (the step art)

There are four files, each in two skins:

- `docs/front/step-1-engine-{carbon,silver}.svg`
- `docs/front/step-2-run-{carbon,silver}.svg`
- `docs/front/step-3-pick-{carbon,silver}.svg`
- `docs/front/finish-{carbon,silver}.svg`

Each has a viewBox of 640 × 240 and is shown at `width="640"`. They use the
hero's skin at dialog scale: title strip, left banner sliver, page body and a
button row. Body text is the 5 × 7 face at scale 3 (21 px caps), so it renders
at about 11 px on a 340 px phone.

```text
+-[ README.NFO Setup ]-----------------------------[ Step 1 of 3 ]-+
|▓▓| CHOOSE AN ENGINE                                              |
|▓▓|  +--------------------------+   +--------------------------+  |
|▒▒|  | (•) CLAUDE CODE          |   | ( ) CODEX                |  |
|▒▒|  |     [pixel chat chip]    |   |     [pixel >_ chip]      |  |
|░░|  +--------------------------+   +--------------------------+  |
|░░| Setup uses whichever one you are signed in to.                |
|  |                          [ < Back ]  [ Next > ]  [ Cancel ]   |
+------------------------------------------------------------------+
```

| Dialog | Stage A content | Animation (reduced motion: the last state, held) | Stage B content |
| --- | --- | --- | --- |
| step-1-engine | CHOOSE AN ENGINE, two radio cards with generic pixel chips (no vendor logos), "Setup uses whichever one you are signed in to." | The radio dot alternates every 3 s; the Next key glows | Claude card greyed out with a *COMING SOON* plate; Codex selected |
| step-2-run | RUN SETUP IN YOUR PROJECT. FOLDER `[ my-project/ ]`, a lock icon and *PRIVATE OK · READ FROM DISK*, a progress bar, 10 thumbnail cells filling 3 at a time, *GALLERY OPENS NOW* | Cells land in batches; the bar steps; 12 s loop | REPO `[ github.com/you/project ]`, *PRIVATE: SET GH_TOKEN*, *ONE AT A TIME* |
| step-3-pick | PICK ONE, SETUP INSTALLS IT. 5 × 2 numbered thumbnails, #7 framed, prompt `INSTALL WHICH HEADER? [1-10] 7` | The frame hops to 7; the prompt types | PICK ONE, COPY IT IN: *COPY MARKDOWN · SAVE SVG* |
| finish | SETUP COMPLETE. A mini README with header 7 on top; three `√` file rows; *NOTHING COMMITTED · REVIEW WITH GIT DIFF*; a Finish key | Header 7 drops into the README sheet once, then holds | *COPY THE SVG TO assets/ · PASTE THE MARKDOWN* |

The dialogs never carry the command; it is always copyable Markdown beneath.
The thumbnails in dialogs 2 and 3 are the same embedded 96 × 54 JPEGs as in the
hero. Each dialog is ≤ 25 KB.

---

## 6. The examples wall: files used

**72 distinct committed headers from 6 projects** (Castaway, ULTRA-SATISFACTORY,
Heretic, GL4SS, ST3GG and Naturalis Historia), covering all 13 families. Every
file is tracked in git, and none appears twice. The same list, with sizes and
paths, is in [`03-setup-exe.picks.json`](03-setup-exe.picks.json).

### Featured: 10 animated SVGs at 400 px

| Where | Header page (under `examples/`) | Size | KB |
| --- | --- | --- | ---: |
| Above Install | `ultra-satisfactory/13-chrome-spheres_opus_5.5.md` | 900×470 | 109.1 |
| Above Install | `castaway/98-3d-pipes_opus_5.5.md` | 1200×640 | 139.0 |
| Gallery | `castaway/01-mode7-island_opus_5.5.md` | 256×144 | 71.9 |
| Gallery | `castaway/14-off-air_opus_5.5.md` | 960×540 | 82.5 |
| Gallery | `castaway/57-synthwave-outrun_opus_5.5.md` | 960×420 | 106.4 |
| Gallery | `castaway/35-hand-pixelled-chrome-logo_opus_5.5.md` | 320×140 | 82.5 |
| Gallery | `castaway/65-memphis_opus_5.5.md` | 960×560 | 95.5 |
| Gallery | `castaway/24-skinned-installer_opus_5.5.md` | 1000×584 | 141.2 |
| Gallery | `castaway/52-teletext-page_opus_5.5.md` | 692×548 | 106.6 |
| Gallery | `ultra-satisfactory/23-illustrated-ansi_opus_5.5.md` | 664×520 | 80.3 |

Featured total: 1,015 KB.

### Family rows: 62 stills at 150 px (5 per row; 2 per row on phones)

Families are ordered by visual punch; the first four start open. The labels are
neutral front-page labels, never catalogue titles. Style counts are distinct
styles from `loadCatalogue()`.

| # | Family (`key`) | Styles | Open | Tiles (header pages under `examples/`, suffix `_opus_5.5` omitted) |
| ---: | --- | ---: | --- | --- |
| 1 | Consoles, arcades & machines (`mach`) | 13 | yes | `castaway/09-pinball-dmd`, `castaway/73-vfd-front-panel`, `ultra-satisfactory/34-dos-setup`, `ultra-satisfactory/10-arcade-attract`, `castaway/71-console-title-screen` |
| 2 | ANSI, BBS & teletext (`ansi`) | 11 | yes | `castaway/50-door-game-screen`, `castaway/54-text-mode-demo-effect`, `castaway/02-bbs-stats`, `castaway/51-ripscrip-screen`, `gl4ss/04-viewdata` |
| 3 | Vaporwave & the early web (`vap`) | 17 | yes | `castaway/56-vhs-tape`, `castaway/58-city-pop-sleeve`, `ultra-satisfactory/42-aero-gloss`, `castaway/60-one-bit-desktop`, `ultra-satisfactory/26-vaporwave` |
| 4 | Screensavers & visualisers (`idle`) | 10 | yes | `castaway/100-sprite-saver`, `castaway/95-light-synth`, `ultra-satisfactory/08-milkdrop-visualiser`, `castaway/96-feedback-fire`, `castaway/94-pulsing-diamonds` |
| 5 | PC intros, loaders & installers (`pc`) | 14 | no | `castaway/03-desktop-takeover`, `castaway/26-vector-objects`, `ultra-satisfactory/16-poster-installer`, `castaway/12-bios-hijack`, `heretic/09-pc-12` |
| 6 | 8- and 16-bit home computers (`c64`) | 14 | no | `castaway/30-petscii-picture`, `castaway/36-st-menu-disk`, `ultra-satisfactory/28-flat-silhouette-intro`, `castaway/19-megademo-menu`, `heretic/33-c64-14` |
| 7 | The demoscene (`demo`) | 11 | no | `ultra-satisfactory/07-compo-slides`, `castaway/113-atari-8-bit-demo`, `naturalis-historia/03-demo-titles`, `castaway/110-256-byte-intro`, `heretic/13-demo-08` |
| 8 | Trackers & chiptune visuals (`trk`) | 11 | no | `ultra-satisfactory/09-oscilloscope`, `ultra-satisfactory/20-player-stack`, `castaway/42-multi-chip-tracker`, `ultra-satisfactory/38-piano-roll`, `heretic/22-trk-03` |
| 9 | NFO & ASCII art (`nfo`) | 11 | no | `ultra-satisfactory/22-poster-nfo`, `castaway/44-amiga-description-logo`, `castaway/46-teletype-picture`, `castaway/43-file-id-diz`, `heretic/03-nfo-02` |
| 10 | Print & physical media (`print`) | 5 | no | `ultra-satisfactory/12-cassette-jcard`, `castaway/08-tractor-feed`, `ultra-satisfactory/31-type-in-listing` |
| 11 | Terminals & hacker culture (`hack`) | 19 | no | `castaway/88-tone-pad`, `castaway/87-file-system-landscape`, `castaway/78-fetch-card`, `castaway/84-war-room-big-board`, `heretic/23-hack-18` |
| 12 | Japan & East Asia (`asia`) | 7 | no | `castaway/90-pc-98-adventure-screen`, `castaway/92-japanese-basic-power-on`, `castaway/91-ptt-telnet-board`, `ultra-satisfactory/18-fm-synth-display`, `st3gg/02-telnet-board` |
| 13 | Modems & message boards (`xfer`) | 10 | no | `castaway/101-echomail-reader`, `ultra-satisfactory/33-sysop-dashboard`, `ultra-satisfactory/35-terminal-session`, `ultra-satisfactory/39-userbar-kit` |

Heretic, Pliny and README.NFO pages carry no `_opus_5.5` suffix. Six of the
tiles are static Heretic SVGs, which use `<text>`, so their subtitles depend on
the fonts of whoever renders the still. The build renders them once, so that is
fine for stills.

**Text-only headers**, linked rather than tiled:
`castaway/07-7bit-outline-nfo_opus_5.5.md`,
`castaway/45-newschool-ascii_opus_5.5.md`,
`ultra-satisfactory/32-generated-banner_opus_5.5.md` and
`heretic/04-nfo-10.md`.

**How the picks were screened.** I started from the showcase researcher's tiers
(`research/showcase-picks.json`) and filled each family from per-family contact
sheets of all 260 committed headers. I then scanned every linked page for piracy
vocabulary and cracking-group names, and excluded:

- `castaway/23`, `32` and `33`, which credit cracking groups;
- `castaway/31` and `99` ("supplied by") and `castaway/34`, which names a
  group;
- `castaway/83`, `115` and `116` and `heretic/29` (swapper, swap letters);
- `castaway/103-106` and `heretic/06` and `38` (sitebot, P2P, FXP, SFV);
- `ultra-satisfactory/01` and `21` (courier), and `ultra-satisfactory/03` and
  `29` (keygen, site race);
- all of `dance-vision` (its "cracked by" jokes);
- `readme-nfo/*`, until its art says 153 rather than 152;
- the MediaLog sets, which are untracked.

`castaway/35` credits three demogroups in prose as palette references. I kept
it, because that is demoscene credit, not artwork; the owner may prefer to swap
it.

**Alt text.** Under 100 characters, in the form
`PROJECT header: neutral description (animated)`. No catalogue style names
(several contain real group names) and no instructions.

---

## 7. New assets to make

Everything is generated by deterministic Node scripts and committed.

| Path | What | Made by | Size |
| --- | --- | --- | --- |
| `docs/front/setup-hero-carbon.svg`, `setup-hero-silver.svg` | Hero, 960×480, animated, with a reduced-motion still | `tools/front-page/setup-art.mjs` | ≤ 100 KB each |
| `docs/front/step-1-engine-*.svg`, `step-2-run-*.svg`, `step-3-pick-*.svg`, `finish-*.svg` | Four dialogs × two skins, 640×240 | same | ≤ 25 KB each |
| `docs/front/tiles/<set>-<NN>.jpg` | 62 family stills, 300×168, letterboxed and keylined | `tools/front-page/build.mjs` (Playwright, already a devDependency) | about 15 KB each, about 1 MB in total |
| `docs/front/mini/<set>-<NN>.jpg` (build cache, not linked) | 10 thumbnails at 96×54 for embedding in the hero and dialogs | same | about 2-3 KB each |
| `docs/front/social.png` | 1280×640 social preview from the hero's reduced-motion still (CARBON) | same | < 1 MB |
| `docs/front/front-page.json` | Picks, family labels, order, open flags, capture times, captions and alt text (seeded from `03-setup-exe.picks.json`) | hand-edited | — |
| `docs/front/README.template.md` | The page with `{{STYLES}}`, `{{FAMILIES}}`, `{{HEADERS}}`, `{{SETS}}`, per-gallery counts, `{{STAGE:A}}…{{/STAGE}}` blocks and `{{WALL}}` | hand-edited | — |
| `tools/front-page/pixel-font.mjs` | 5×7 bitmap face and chamfered sign face, lifted from `examples/castaway/src/24-skinned-installer_opus_5.5.mjs`; 8×8 face from `examples/ultra-satisfactory/src/34-dos-setup_opus_5.5.mjs` | lifted | — |
| `tools/front-page/setup-art.mjs` | Draws the hero and dialogs from a page model, with skin and stage parameters | new | — |
| `tools/front-page/build.mjs` | Computes facts, detects the stage, draws the art, renders tiles and the social card, writes `README.md`, lints; `--check` for CI | new | — |
| `package.json` script | `"front": "node tools/front-page/build.mjs"` | owner, later | — |

**What the build script does, in order:**

1. **Facts.** `loadCatalogue()` gives 153 distinct styles, 13 families and the
   per-family counts. `git ls-files examples` gives 260 headers in 8 sets and
   the per-set counts. Untracked sets are ignored automatically, so MediaLog
   joins the page the day it is committed and listed in `front-page.json`.
2. **Stage.** Probe `node tools/generate.mjs --help` for `--claude`, `--codex`
   and `use`, and `package.json` for the name `readme-nfo`. All present means
   stage A; anything missing means stage B.
3. **Art.** Draw 10 SVGs from `setup-art.mjs`, with the facts baked into the
   counters and the scroller.
4. **Stills.** For each tile, load the SVG in Chromium, wait `capture_ms`
   (default 3000), take a 2× screenshot into a 150×84 letterbox, and write a
   JPEG at quality 82, or a PNG if that is smaller. A manifest stores the
   source SVG's SHA-256, so stills are re-rendered only when their source
   changes.
5. **README.** Fill the template and write `README.md` with the
   generated-file comment.
6. **Lint** (fails the build):
   - code blocks ≤ 80 columns, and must-read blocks ≤ 38;
   - only grid-safe glyphs in code blocks (no `◆◇✓✔★☆▶◀`);
   - every link and image target is git-tracked;
   - alt text ≤ 100 characters on the wall and ≤ 125 for the hero and dialogs;
   - no catalogue style name on the page;
   - a banned-word list (crack but not crackle, keygen, serial, warez, nuke,
     "supplied by", swapper, courier, FXP, topsite, "scene release") plus every
     group name found in `styles.json` names, checked against the README, alt
     text and the art strings;
   - every animated SVG has `prefers-reduced-motion`;
   - total image weight ≤ 3 MB.
7. **`--check`** (CI, no browser): re-runs 1, 2, 5 and 6 and compares the
   result with the committed `README.md` and the still hashes. Counts can never
   drift silently.

---

## 8. The journey, end to end

1. **Discover (GitHub).** The hero plays the whole pipeline in 30 s. One line
   says what it is, and two real headers from two projects prove it. Then
   comes *Install*, about 1,000 px down on desktop.
2. **Check requirements.** A 38-column box: Node 22+, an engine, any repo,
   private OK, your own sign-in.
3. **Step 1 (engine).** The visitor sees both engines as equals and learns
   that setup picks the signed-in one. A TIP covers "no engine signed in".
4. **Step 2 (run).** They copy `npx readme-nfo` (the code block has a copy
   button and no `$` prompt) and run it in the project folder. The terminal
   speaks the same steps:

   ```text
   +--[ README.NFO SETUP ]----------------------------------------------+
   | PROJECT  my-project          read from this folder, no token       |
   | ENGINE   Claude Code         claude.ai plan   (switch: --codex)    |
   | DRAW     10 of 153 styles    3 at a time                           |
   +--------------------------------------------------------------------+
   | STEP 2 OF 3  DRAWING  [##########..........]  5 / 10   04:12       |
   |   01 teletext page ........................................... ok  |
   |   02 3D pipes ................................................ ok  |
   |   06 chrome spheres ...................................... drawing |
   | GALLERY  readme-headers/my-project-01/index.html  (live)           |
   +--------------------------------------------------------------------+
   STEP 3 OF 3  Install which header? [1-10, Enter = later] 7
   Installed 07 -> README.md, .github/readme-nfo/header.svg, LICENSE
   Review with git diff, then commit.
   ```

   The engine row shows the plan type only, never an email or org. The style
   names are neutral display names (a new `display` field; see section 9).
5. **Watch the gallery fill.** The browser opens at once, in the same skin
   (CARBON or SILVER from the OS theme, since it is a local page with real
   CSS):

   ```text
   +-[ README.NFO Setup · Step 3 of 3 · pick a header ]-----------------+
   | my-project · Claude Code · 7 of 10 ready                           |
   | +-----------+ +-----------+ +-----------+ +-----------+ +--------+ |
   | | 01 [art]  | | 02 [art]  | | 03 ░░▒▒▓▓ | | 04 [art]  | | 05 ... | |
   | | teletext  | | 3D pipes  | | drawing   | | test card | |        | |
   | | use 1 [c] | | use 2 [c] | |           | | use 4 [c] | |        | |
   | +-----------+ +-----------+ +-----------+ +-----------+ +--------+ |
   | Pick in the terminal, or later: npx readme-nfo use N               |
   +--------------------------------------------------------------------+
   ```

   Each card plays the real animated header and has a copy button for
   `npx readme-nfo use N`. Unfinished cards show a shade-bar placeholder.
6. **Pick.** Type the number at the prompt, or press Enter and run
   `npx readme-nfo use N` later.
7. **Install.** Setup writes `.github/readme-nfo/header.svg` and `LICENSE`,
   inserts the marked block at the very top of the README (keeping line
   endings and BOM, refusing symlinks), and prints what changed. It never
   commits.
8. **Review and commit.** `git diff` shows exactly the block from section 3.5.
9. **Change or uninstall.** `use N` replaces the block in place. Deleting the
   block and the folder removes it entirely, as the Finish page says.
10. **Come back for more.** The next run skips styles already drawn (batches
    in `readme-headers/`), so the gallery never repeats itself.

---

## 9. Pipeline work this concept depends on

From `research/pipeline.md`, section 8. Stage A needs all of these; stage B
needs none.

| Need | Change | Visible on the page as |
| --- | --- | --- |
| Claude path | `agents.mjs` with the `claude -p --json-schema --tools ""` driver and detection (proven in the trial: 74 s, valid output) | Step 1's CLAUDE CODE card enabled |
| Local mode | `readLocalProject()`, no positional argument, any host | "PRIVATE REPOS: yes, no token" |
| Short name | Publish `readme-nfo@0.1.0`, fix `files`, ship `styles/samples.json` | `npx readme-nfo` |
| Live gallery | Gallery rebuilt after each header, in the SETUP skin | Step 2's "gallery opens now" |
| Concurrency | `--jobs 3`, backing off to 1 on a rate limit | "3 at a time" |
| Pick and install | `install.mjs`, `use N`, the marked block, `.git/info/exclude` | Step 3, Finish, Uninstall |
| Wizard voice | `terminal.mjs` *STEP N OF 3* labels; neutral style `display` names; alt text `NAME: retro header` | Terminal mock in section 8 |
| Neutral names | A `display` field per style in `styles.json` (no group names), used in the terminal, the gallery and the alt text | No real names leak into users' READMEs |

---

## 10. GitHub feasibility and risks

**Uses only allowlisted features:**

- `<p align>`, `<picture><source media srcset>`, `<img src width alt>` and
  `<a href>`;
- `<details open>` and `<summary>`, `<kbd>`, `<sub>` and `<br>`;
- fenced `text`, `sh` and `html` blocks, one `[!TIP]` alert and headings.

There is no `style`, `class`, inline SVG or script. Animation lives only in
self-contained SVGs, with `<use>`-of-path glyphs and no `<text>`. Every
animated SVG has a reduced-motion rule.

**Facts on the page, computed 2026-10-13 and rechecked 2026-11-11:**

- 153 distinct styles (157 entries), in 13 families with per-family counts
  14/14/11/11/11/17/13/19/7/10/10/11/5;
- 128 SVG-capable styles and 59 text-capable styles;
- 260 committed headers in 8 sets (116/42/41/40/6/5/5/5);
- 72 distinct featured and tile picks.

All of these come from `loadCatalogue()` and `git ls-files`, never typed by
hand.

**Risks and what to test in a scratch repo:**

| Risk | Mitigation |
| --- | --- |
| `<picture>` follows the browser or OS theme instead of the GitHub theme, and the GitHub mobile app may show only the `<img>` | Both skins are opaque with dual keylines, so the fallback (SILVER) reads fine on dark too. Test with GitHub's theme set opposite to the OS. |
| JPEG data URIs inside an `<img>` SVG | Browsers allow `data:` in SVG-as-image, and the repo validator allows it. Test on github.com in Chrome, Firefox and Safari. Fallback: vector motifs. |
| Anchor links (`#install`, `#step-2-of-3-…`) | The build computes slugs with GitHub's algorithm (the same as `tools/front-page/render.mjs`). Lint checks that each target heading exists. |
| Images inside closed `<details>` still download | The stills are about 15 KB each, so all 62 come to about 1 MB. Try `loading="lazy"` and keep it only if GitHub preserves it. |
| Readers may think the wizard dialogs are screenshots of a GUI app | The Step 2 copy says "In your project's folder, run" with the terminal command. The terminal mock in `docs/generation.md` shows the real thing. |
| Page weight | About 0.4 MB above the fold (hero ~100 KB, pair 248 KB, step 1 ~25 KB) and about 2.2 MB in total, under the 3 MB budget. |
| Stage A claims before the CLI ships | The stage is detected from `--help` and `package.json`, so stage A cannot render early. |
| Linked pages with stale or bad content | `readme-nfo` art says 152 (rebuild with 153). `dance-vision` pages carry "cracked by" jokes (reword them, or drop that link from the by-project line). Castaway pages say their own file links do not resolve (fix them or accept). The lint lists these until they are fixed. |
| A themed installer can read as corporate | The skin must be loud: the lit marquee, the chrome frame, the beat LEDs and the scroller. The skin is the brief, not an afterthought. Review the hero at 340 px and at 830 px before anything else. |
| Diverged `origin/main` | Reconcile before shipping either stage (owner action). |

---

## 11. Mobile and dark mode

**Phones (about 309-364 px column):**

- **Hero:** full width. The marquee and STEP labels read; the small text is
  texture.
- **Title, pitch and nav:** wrap naturally. The nav row's four bracket links
  wrap to two lines at most.
- **Proof pair and featured pairs:** 400 px images shrink to the column, one
  per row. Each pair's `<sub>` caption follows it in reading order.
- **Requirements box and EOF block:** 38 columns, visible without sideways
  scroll. The Outline-friendly headings are plain text.
- **Dialogs:** shrink from 640 to about 340 px; 21 px body type becomes about
  11 px.
- **Commands:** `npx readme-nfo` (14 columns), `--claude` / `--codex` (23) and
  `use 4` (20) never scroll. In the options block the commands sit in the left
  27 columns and only the notes scroll. Stage B's 60-column command does
  scroll; it is the one known compromise, and it ends when the npm name ships.
- **Family rows:** 150 px stills sit 2 per row on every phone (304 px), so 5
  tiles take 3 rows. Only four families start open, so the phone page stays
  about the length of today's despite showing ten times the examples.
- **`Next >` keys:** right-aligned `<kbd>` links, as easy to tap as any link.

**Dark and light:**

- **Hero and dialogs:** a CARBON / SILVER `<picture>` pair, both opaque. Light
  mode gets a silver installer that looks native on white, not a black slab.
- **Featured headers:** dark art panels by nature. They sit in centred pairs
  like box-back screenshots, which reads as deliberate on white.
- **Family stills:** a uniform dark letterbox plus a `#30363d` keyline give an
  even contact-sheet grid on both `#ffffff` and `#0d1117`.
- **Text blocks:** inherit GitHub's code background (`#f6f8fa` / `#151b23`),
  so they work in both themes.
- **Social card:** CARBON, opaque, so it reads anywhere.

---

## 12. Why it is cool, weaknesses, build effort

**Why it is cool**

- **The metaphor is the product.** A setup wizard that installs a header into
  your README. Every page of it is a real step; nothing is filler.
- **"Step N of 3" makes simplicity visible.** Three dialogs, one command and a
  Finish page that shows the exact diff. The visitor can see the end before
  they start.
- **Honest by construction.** The engine choice and private-repo support show
  up only when the CLI's own `--help` proves them. Until then, the greyed-out
  *COMING SOON* card is period-perfect, not an apologetic footnote.
- **One voice from README to terminal to browser.** The same steps, the same
  skin, the same words.
- **Ten times the examples.** 72 real headers (today: 7) from six projects,
  across all 13 families. They are browsable as a component tree made from
  GitHub's native `<details>`, the installer's `[+]` list for free.
- **A themed game installer is a nostalgia hit.** It is distinct from the
  cracktro, BBS and attract-mode angles, and it has a house reference already
  (Castaway 24).
- **Uninstall instructions on a README.** Trust, and a laugh.

**Weaknesses**

- **The hero explains rather than shows.** The proof of output sits in the pair
  below it and in the real thumbnails embedded in the hero, which are tiny on
  phones.
- **The gallery is deep.** The three dialogs push it about 1,000 px further
  down than an attract-mode page would.
- **Installer wizards can read as corporate** if the skin is timid. This
  concept lives or dies on the hero's craft.
- **Two skins double the wizard art** (10 SVGs), and `<picture>` theme
  behaviour varies by client.
- **The family stills don't move.** Motion is reserved for the hero, the
  dialogs and the ten featured pieces.
- **Stage B is visibly weaker:** a 60-column command, Codex only and a
  `GH_TOKEN` tip. That is honest, but the full wow waits for the pipeline.
- **Thirteen summary lines can feel like a settings tree on a phone.**

**Build effort** (after the picks, which are done in `03-setup-exe.picks.json`)

| Piece | Size | Notes |
| --- | --- | --- |
| `pixel-font.mjs` (lift) | S | About 2 h from Castaway 24 and ULTRA 34 |
| `setup-art.mjs`: hero, 5 pages, still, 2 skins | L | About 1.5-2 days; the most craft-sensitive part |
| Four dialogs × two stages | M | About 1 day; reuses the hero parts |
| `build.mjs`: facts, stage probe, stills, template, lint, `--check` | M | About 1 day; reuses `tools/front-page/lib` slug and lint ideas |
| `README.template.md` and `front-page.json` | S | About 2 h |
| Scratch-repo verification (picture, data URIs, anchors, mobile) | S | About 2 h |
| **Total for this concept** | **about 4-5 days** | |
| Pipeline for stage A | M-L | Separate: `research/pipeline.md`, section 8, items 1-14 |

Stage B can ship first, on today's CLI. The page then upgrades itself to
stage A the day `--help` lists `--claude`, `--codex` and `use`.
