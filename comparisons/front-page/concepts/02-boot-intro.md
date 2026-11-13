# 02 · BOOT INTRO

> The page boots like a 16-bit game intro: a chrome README.NFO logo over a
> starfield, a sine scroller that literally scrolls the three steps, and a
> little loader strip that flips ENGINE between CLAUDE CODE and CODEX and
> says FACTS: YOUR FOLDER. A blinking PRESS SPACE really does scroll you to
> the same steps as copyable text. Below: an intro-select disk of 51 numbered
> real headers, and a 34-column NFO footer.

Seed angle: 02 CRACKTRO BOOT. The page never says "crack" or "keygen"; the
intro is a visual reference, so the page calls it an "intro". This is rev B
(2026-11-11). Rev A (2026-10-13) is kept in `_prev/`. Rev B adds the loader
strip (engine and privacy visible in the hero itself), the measured timings
from the 2026-11-11 trials, a plain-text-art disk, and a gated logo disk.

Picks: `02-boot-intro.picks.json` next to this file. Re-verified 2026-11-11:
all 51 pages and SVGs are tracked in git; every animated SVG has a
`prefers-reduced-motion` rule; no page or SVG matches the deny list (real
group names, "cracked by", "supplied by", "warez", "keygen", "serial"). The
one hit was a false positive ("razor-straight horizon" in castaway/58's alt).

---

## 1. The idea in one screen

An old intro fits the whole pitch on one screen: one logo, one effect, one
moving line telling you what you are about to get. This page makes README.NFO
that screen, then hands over to plain, copyable Markdown.

1. **BOOT.** The hero is the intro. Chrome logo, three-layer starfield, and a
   sine scroller: *step 1 sign in to Claude Code or Codex, step 2 type npx
   readme-nfo in your project folder, step 3 pick one and it lands in your
   README.* Under the logo, a two-field loader strip (the keygen-window
   grammar, relabelled): `ENGINE ◄ CLAUDE CODE ►` flips to `◄ CODEX ►` every
   4 s, and `FACTS ◄ YOUR FOLDER ►` sits steady beside it. Engine choice and
   the private-repo story are visible before you read a word of Markdown.
2. **PRESS SPACE.** It blinks under the strip, and it is true: Space scrolls a
   browser page. You land on "Make one for your project".
3. **AFTER THE INTRO.** A 34-column transcript shows the run: gallery fills,
   you type a number, two things change, you commit.
4. **INTRO SELECT.** A numbered disk of 51 real headers from 6 projects and
   all 13 families: 6 featured animated pieces plus a 45-tile wall of little
   monitors, numbers burned in. Then *Disk 2: plain text* (links to the 35
   text-art headers) and, once committed, *Disk 3: logos*.
5. **RELEASE INFO.** A terse 34-column NFO with computed counts, thanks to
   archives and tools, and `[ EOF ]`.

Four thin static copper bars (830 × 8 SVG) sit above the four `##` headings,
stepping steel blue, violet, red, amber down the page like raster bars down a
screen. GitHub's h2 rule closes each into a framed section header.

**The 34-column rule.** Command, transcript, index and footer are all 34
columns or fewer: what a 375 px iPhone shows with no sideways scroll (about
277 px of code area at 8.16 px a column in SF Mono). The current page breaks
this hardest: its 78-column footer shows about 33 columns on a phone.

---

## 2. Section-by-section wireframe

The README as written (long tags wrapped so this stays in 80 columns). This is
the **target** copy; nothing goes live until the truth gate (§8) is met. §8 has
the interim copy that is true today.

### 2.1 Boot: hero, title, pitch

````markdown
<!-- README.NFO header: start -->
<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)"
      srcset=".github/readme-nfo/header-dark.svg">
    <img src=".github/readme-nfo/header.svg" width="100%"
      alt="README.NFO intro screen: chrome logo over a starfield, a
      sine scroller spelling out the three steps below.">
  </picture>
</p>
<!-- README.NFO header: end -->

<h1 align="center">Retro headers for your README</h1>

<p align="center">
One command in your project folder. <b>Claude Code</b> or <b>Codex</b>
draws ten headers in ten different retro styles: NFO and ANSI art, demo
intros, tracker screens, screensavers. Pick one and it goes at the top of
your README.
</p>
````

The hero sits between the very markers `npx readme-nfo use N` writes into
users' READMEs, so the project's own page is a live example of an install.
The H1 is the pitch, not the name: the logo already says README.NFO.

### 2.2 `## ► Make one for your project`

````markdown
<p align="center"><img src="docs/front-page/bar-1.svg" width="100%"
  height="8" alt=""></p>

## ► Make one for your project

1. Sign in to [Claude Code](https://claude.com/claude-code) or
   [Codex](https://developers.openai.com/codex).
2. Open a terminal in your project folder and run:

   ```sh
   npx readme-nfo
   ```

3. Your gallery opens. Type the number of your favourite and it goes to
   the top of your README.

**Claude or Codex?** It uses whichever you are signed in to, and asks if
you have both. To choose: `npx readme-nfo --claude` or
`npx readme-nfo --codex`.

**Private repos work.** README.NFO reads your project folder, not
GitHub, so there is no token to set. Your project's name, description,
languages and README headings go only to the agent you picked, under
your own sign-in.

<sub>Needs Node.js 22 or newer. One header took 74 s on Claude Sonnet
and 2 min 31 s on Codex in our test runs.</sub>
````

The command is 14 characters, alone in its block with no `$`, so the copy
button gives a runnable line. Engine and privacy are bold lead-ins, so a
skimmer finds both. The timings are the 2026-11-11 measured trials; the
footnote is regenerated if they are re-measured (and gains a "ten headers
take about N minutes" line once a 3-job batch has been timed).

### 2.3 `## ► Pick it, install it, commit it`

````markdown
<p align="center"><img src="docs/front-page/bar-2.svg" width="100%"
  height="8" alt=""></p>

## ► Pick it, install it, commit it

```text
README.NFO · my-app · Claude Code
──────────────────────────────────
facts ...... read from this folder
styles ..... 10 drawn from 153
gallery .... fills as they land

01 ansi-06 door game ........ ok
02 mach-11 pinball display .. ok
03 vap-17 memphis ........... ok
   ...
10 c64-13 menu disk ......... ok
──────────────────────────────────
Install which header? [1-10] 3
► .github/readme-nfo/header.svg
► README.md, block at the top
Review: git diff. Then commit.
```

<sub>What a run looks like (abridged).</sub>

- **Watch them land.** The gallery opens in your browser straight away
  and fills in as each header is drawn.
- **Pick one.** Type its number. Changed your mind later?
  `npx readme-nfo use 7`.
- **It installs itself.** The SVG and README.NFO's MIT notice go into
  `.github/readme-nfo/`, and a marked block goes at the very top of your
  README. Running `use` again swaps the header and only ever touches its
  own block.
- **You commit.** Nothing is committed for you. Check `git diff`, then
  commit.
- **Not feeling any?** Run it again for ten styles you have not had yet.

<details><summary><b>What lands in your README</b></summary>

```html
<!-- README.NFO header: start -->
<p align="center"><img
  src=".github/readme-nfo/header.svg"
  width="100%" alt="my-app header">
</p>
<!-- README.NFO header: end -->
```

To remove it, delete that block and the `.github/readme-nfo/` folder.
Batches stay in `readme-headers/`, hidden from git via
`.git/info/exclude`.
</details>

<details><summary><b>Options</b></summary>

- `--claude` or `--codex`: choose the agent
- `--model NAME`: choose the agent's model
- `-6`: six headers instead of ten
- `--format text`: text-art headers only (`svg` for images only)
- `--jobs 1`: draw one at a time (default 3)
- `--out DIR`: save the batch somewhere else
- `--no-open`: don't open the gallery
- `--resume DIR`: finish an interrupted batch
- `npx readme-nfo use N`: install header N from the newest batch
</details>

<details><summary><b>Not cloned yet, or something went wrong?</b></summary>

- **Not cloned?** `npx readme-nfo github.com/you/project` reads the
  project from GitHub instead. For a private one it uses your `gh`
  sign-in.
- **No agent found?** Run `claude` or `codex login`, sign in, then run
  README.NFO again.
- **A header failed?** It is retried once with the checker's notes, then
  skipped; the rest of the batch carries on.
</details>
````

### 2.4 `## ► Intro select`

````markdown
<p align="center"><img src="docs/front-page/bar-3.svg" width="100%"
  height="8" alt=""></p>

## ► Intro select

<p align="center">
<b>51 headers from 6 projects, all 13 style families.</b><br>
Click one for its Markdown and generator source.
</p>

<p align="center">
<a href="examples/ultra-satisfactory/11-win32-cracktro_opus_5.5.md"><img
  src="examples/ultra-satisfactory/assets/11-win32-cracktro_opus_5.5.svg"
  width="400" alt="01 ULTRA-SATISFACTORY: metal-logo intro (animated)"></a>
<a href="examples/castaway/27-texture-movers_opus_5.5.md"><img
  src="examples/castaway/assets/27-texture-movers_opus_5.5.svg"
  width="400" alt="02 Castaway: tunnel lagoon (animated)"></a>
<br><sub>01 metal-logo intro · 02 tunnel lagoon</sub>
</p>

  ... two more featured pairs: 03 + 04, 05 + 06 (same pattern)

<p align="center">
<a href="examples/castaway/21-flat-field-dos-intro_opus_5.5.md"><img
  src="docs/front-page/thumbs/07.jpg" width="150" height="84"
  alt="07 Castaway: flat-field DOS intro"></a>
<a href="examples/ultra-satisfactory/13-chrome-spheres_opus_5.5.md"><img
  src="docs/front-page/thumbs/08.jpg" width="150" height="84"
  alt="08 ULTRA-SATISFACTORY: chrome spheres"></a>
  ... 43 more tiles, 07 to 51, generated from picks.json
</p>

<details><summary><b>Intro index</b>: what each number is</summary>

```text
  (the 34-column index in §4.3)
```
</details>

**Disk 2: plain text.** 35 of the headers are pure text art you paste
straight in, like the [newschool logo](examples/castaway/45-newschool-
ascii_opus_5.5.md) and the [release NFO](examples/ultra-satisfactory/
01-nfo-release_opus_5.5.md).

<p align="center">
<a href="examples/README.md">All 260 headers in 8 galleries</a> ·
<a href="styles/INDEX.md">All 153 styles</a>
</p>
````

*(Links above are wrapped for this spec; the build writes them on one line.)*

**Disk 3: logos** is added only after the MediaLog sets are committed: four
203 × 74 logos at native width fill the 830 px column exactly, captioned
"It does small logos too". Until then it is left out, because the links would
404.

### 2.5 `## ► Release info`

````markdown
<p align="center"><img src="docs/front-page/bar-4.svg" width="100%"
  height="8" alt=""></p>

## ► Release info

```text
▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
 R E A D M E . N F O
 retro headers for your README
──────────────────────────────────
 STYLES ...... 153, 13 families
 SHOWCASE .... 260 in 8 galleries
 ENGINES ..... Claude Code · Codex
 FACTS ....... your local folder
 NEEDS ....... Node.js 22+
 LICENCE ..... MIT
──────────────────────────────────
 THANKS ...... 16colo.rs · Pouet
               Demozoo
               textfiles.com
▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀[ EOF ]
```

<p align="center">
<a href="docs/generation.md">How it works</a> ·
<a href="styles/INDEX.md">Style catalogue</a> ·
<a href="examples/README.md">Galleries</a> ·
<a href="https://github.com/lukexyz/README.NFO/issues">Issues</a> ·
<a href="LICENSE">MIT licence</a>
</p>

<p align="center"><sub>Scene styling here is homage: no real group
names, logos or lettering are used, and all the art is original.</sub></p>
````

GitHub's Outline doubles as the NFO index: *Retro headers for your README* ›
*► Make one for your project* › *► Pick it, install it, commit it* › *► Intro
select* › *► Release info*.

Every number is a template variable filled by `build.mjs` (§5): 153 and 13
from the catalogue loader (153 distinct, 13 families; 128 SVG-capable); 260
and 8 from `git ls-files examples` (numbered pages only); 35 from tracked pages
with no `<img>`; 51 and 6 from `picks.json`; ten and three from the CLI
defaults; the timings from a `timings.json` the owner updates after a trial.

---

## 3. The hero and its animation

Two files, one layout: `.github/readme-nfo/header.svg` (light page) and
`header-dark.svg` (dark page), 960 × 480 (2:1), target 75 KB each, hard cap
100 KB, built by `docs/front-page/hero.mjs`. No `<text>` elements: every glyph
is an original bitmap drawn as merged pixel paths in `<symbol>`s.

### 3.1 Layout sketch

```text
╭────────────────────────────────────────────────────────────────────╮
│╭──────────────────────────────────────────────────────────────────╮│
││ A RETRO HEADER FOR EVERY REPO   ·       ·     153 STYLES · 13 FAM││
││    ·         ·          ·            ·         ·        ·        ││
││  █▀▀▄ █▀▀▀ ▄▀▀▄ █▀▀▄ █▄ ▄█ █▀▀▀   █▄  █ █▀▀▀ ▄▀▀▄   chrome fill: ││
││  █▀▀▄ █▀▀  █▀▀█ █  █ █ ▀ █ █▀▀    █ ▀▄█ █▀▀  █  █   sky, horizon,││
││  ▀  ▀ ▀▀▀▀ ▀  ▀ ▀▀▀  ▀   ▀ ▀▀▀▀ ▀ ▀   ▀ ▀     ▀▀    ground       ││
││  ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬ copper horizon ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬   ││
││   ┌ ENGINE ◄ CLAUDE CODE ► ┐   ┌ FACTS ◄ YOUR FOLDER ► ┐         ││
││                       ► PRESS SPACE ▼                            ││
││   ·        ▄ ▄               ·                ▄▄                 ││
││      S T E P   1 :   S I G N   I N   T O   C L A U D E           ││
││    (sine scroller: letters ride a wave, right to left)     ·     ││
│╰──────────────────────────────────────────────────────────────────╯│
╰──────────────────────────────────────────────────────────────── ▪ ─╯
```

| Layer | Box (960 × 480) | What it is |
| --- | --- | --- |
| Bezel | full, r 22 | Monitor case. Dark: `#161b22`, 1 px `#30363d` edge (melts into GitHub dark). Light: `#2a2c33`, 1 px `#d0d7de` edge, 3 px offset shadow: a screen on a white desk, not a slab. Green 3 × 3 power pixel bottom right. |
| Screen | inset 18, r 12, `#04050b` | Clips everything below; static 1-in-3 scanline pattern at 6% white. |
| Starfield | whole screen | 3 layers, seeded (mulberry32, seed 1990): 70 far 1 px `#5a6a8a`, 40 mid 2 px `#9fb3d9`, 18 near 2 × 2 white. Each drawn twice 924 px apart, sliding one width per loop: 23.1 s, 11.55 s, 5.78 s. |
| Top line | y 40, 5 × 7 font × 2 | `A RETRO HEADER FOR EVERY REPO` left, `153 STYLES · 13 FAMILIES` right (computed). `#8fb8ff`. |
| Logo | y 86–185 | `README.NFO` in an original chunky 7 × 9 alphabet (R E A D M N F O plus dot), cell 11 px, ~836 px wide. Chrome: white to sky blue to a hard horizon at 52%, then umber, orange, cream. 6 px black outline, deep-purple shadow at (6, 6). |
| Glint | over logo | Skewed white band clipped to the logo; sweeps 1.2 s, rests 6.8 s. |
| Copper horizon | y 212, 840 × 6 | Static magenta-orange-yellow gradient. |
| Loader strip | y 228–252 | Two bevelled grey fields (the loader-window look, no window chrome). Field 1: `ENGINE ◄ CLAUDE CODE ►`, cross-fading to `◄ CODEX ►` every 4 s (0.3 s fade, 8 s cycle). Field 2: `FACTS ◄ YOUR FOLDER ►`, steady. Original 5 × 7 font × 2, `#e8ecf2` on `#3a3f4a`. |
| Prompt | y 276, × 3, `#ffd84a` | `► PRESS SPACE ▼`, blinking 1 s on, 1 s off (`steps(1)`): one flash per 2 s, far under the 3 Hz limit. |
| Scroller | band y 320–430 | Original 8 × 8 bold font × 5 (40 px glyphs, ~23 visible), riding a stationary sine (±24 px, wavelength 12 chars), right to left at 180 px/s, vertical copper gradient per glyph (white, gold, red). |

### 3.2 Scroller text (one string in `copy.mjs`)

```text
STEP 1: SIGN IN TO CLAUDE CODE OR CODEX ...
STEP 2: IN YOUR PROJECT FOLDER TYPE
NPX README-NFO ... STEP 3: PICK YOUR
FAVOURITE. IT LANDS AT THE TOP OF YOUR
README ... PRIVATE REPOS WELCOME: FACTS
COME FROM YOUR FOLDER, NOT GITHUB ...
153 STYLES IN 13 FAMILIES: NFO, ANSI,
INTROS, TRACKERS, SCREENSAVERS AND MORE
... NOTHING IS COMMITTED UNTIL YOU SAY
SO ... THANKS FOR READING THE NFO ...
WRAPPING AROUND IN 3 . 2 . 1 ...
```

About 420 characters (16,800 px), a 98 s lap. A negative delay puts the S of
STEP 1 at x = 40 at t = 0, so the first frame shows step 1. At 830 px the
scroll is ~155 px/s; at 340 px ~64 px/s with 14 px glyphs: either way about
4.5 characters a second. The command appears in the scroller only as words;
the copyable command is the first code block under the hero (the scroller is
the trailer, the code block is the real thing).

### 3.3 How it is built

The technique is proven in two committed generators:

- `examples/ultra-satisfactory/src/11-win32-cracktro_opus_5.5.mjs`: glyphs
  sharing a sine phase (index mod PHASES) share one bobbing `<g>`, so the cost
  is PHASES animated groups, not 420; the text is padded to whole wavelengths
  and its head repeated after its tail, so the wrap is seamless.
- `examples/castaway/src/29-c64-dycp-scroller_opus_5.5.mjs`: one shared
  stepped-sine track with whole-pixel steps and a per-glyph negative delay.

`hero.mjs` uses 12 phase groups + 3 star layers + glint + blink + engine flip:
18 animated elements. Glyphs are `<use>` references to ~50 `<symbol>`s.

| Part | KB |
| --- | --- |
| Symbols | ~19 |
| Glyph instances | ~23 |
| Stars | ~10 |
| Logo | ~8 |
| Lines and loader strip | ~8 |
| Still group | ~6 |
| Bezel and defs | ~3 |
| **Total** | **~77** |

### 3.4 Reduced motion and the social card

`@media (prefers-reduced-motion: reduce)` hides the scroller, sets `animation:
none` everywhere, shows the engine field as `◄ CLAUDE CODE · CODEX ►`, and
reveals a composed `.still` group with the three steps in the scroller band:

```text
1 SIGN IN TO CLAUDE CODE OR CODEX
2 RUN NPX README-NFO IN YOUR PROJECT
3 PICK ONE. IT LANDS IN YOUR README
```

`hero.mjs --social` renders that still from the dark file through Playwright
(`reducedMotion: 'reduce'`) at 1280 × 640, GitHub's social-preview size (the
hero is already 2:1). The owner uploads `docs/front-page/social.png`.

---

## 4. The examples: an intro-select disk

### 4.1 Shape

| Block | Items | Format | Desktop 830 px | Phone 309–364 px | Weight |
| --- | --- | --- | --- | --- | --- |
| Featured | 01–06 | real animated SVG, `width="400"`, paired by aspect | 3 rows of 2 | 6 rows of 1 | 569.7 KB |
| Wall | 07–51 | static 300 × 168 JPEG "screens" shown at 150 × 84, number burned in | 9 rows of 5 (766 px) | 2 per row, 23 rows | ~635 KB |
| Index | 51 lines | 34-col `text` in `<details>` | closed | closed | – |
| Disk 2 | 35 text headers | one sentence, 2 links | – | – | 0 |
| Disk 3 | 4 logos (gated) | 203 × 74 SVG at native width | 1 row of 4 | 1 per row | ~120 KB |

Featured pairs share aspect so rows are even: 01 + 02 (2.09 / 2.00), 03 + 04
(1.78 / 1.78), 05 + 06 (1.71 / 1.71). Wall thumbnails are letterboxed into a
fixed 16:9 dark screen by the build, so rows never go ragged and nothing
depends on GitHub honouring both `width` and `height`.

Thumbnail sizes were measured: a rev-A prototype rendered 10 picks to 300 ×
168 JPEG at q82 through Playwright with reduced motion (so each is the artist's
composed still): 7.5–18.2 KB, average 14.1 KB. On white the wall reads as a
grid of little monitors. Page total ~1.3 MB; above the fold only the hero
(~77 KB).

### 4.2 The 51 picks (all committed; captions are original)

Projects: Castaway 30, ULTRA-SATISFACTORY 17, one each from GL4SS, ST3GG,
Heretic and Naturalis Historia. All 13 families covered.

| # | Group | Page (under `examples/`) | Style | Caption |
| --- | --- | --- | --- | --- |
| 01 | featured | `ultra-satisfactory/11-win32-cracktro_opus_5.5.md` | pc-05 | metal-logo intro |
| 02 | featured | `castaway/27-texture-movers_opus_5.5.md` | pc-14 | tunnel lagoon |
| 03 | featured | `castaway/01-mode7-island_opus_5.5.md` | mach-15 | mode 7 island |
| 04 | featured | `castaway/14-off-air_opus_5.5.md` | idle-10 | off-air test card |
| 05 | featured | `castaway/65-memphis_opus_5.5.md` | vap-17 | memphis poster |
| 06 | featured | `ultra-satisfactory/12-cassette-jcard_opus_5.5.md` | print-02 | cassette and J-card |
| 07 | pc intros | `castaway/21-flat-field-dos-intro_opus_5.5.md` | pc-01 | flat-field DOS intro |
| 08 | pc intros | `ultra-satisfactory/13-chrome-spheres_opus_5.5.md` | pc-03 | chrome spheres |
| 09 | pc intros | `castaway/24-skinned-installer_opus_5.5.md` | pc-06 | skinned installer |
| 10 | pc intros | `castaway/26-vector-objects_opus_5.5.md` | pc-13 | vector objects |
| 11 | 8/16-bit | `castaway/28-c64-one-screen-intro_opus_5.5.md` | c64-01 | one-screen intro |
| 12 | 8/16-bit | `castaway/29-c64-dycp-scroller_opus_5.5.md` | c64-02 | sine-wave letters |
| 13 | 8/16-bit | `castaway/30-petscii-picture_opus_5.5.md` | c64-03 | PETSCII picture |
| 14 | 8/16-bit | `castaway/36-st-menu-disk_opus_5.5.md` | c64-13 | numbered menu disk |
| 15 | 8/16-bit | `ultra-satisfactory/28-flat-silhouette-intro_opus_5.5.md` | c64-10 | silhouette intro |
| 16 | trackers | `castaway/42-multi-chip-tracker_opus_5.5.md` | trk-07 | multi-chip tracker |
| 17 | trackers | `ultra-satisfactory/09-oscilloscope_opus_5.5.md` | trk-09 | oscilloscope wall |
| 18 | trackers | `ultra-satisfactory/20-player-stack_opus_5.5.md` | trk-11 | media player stack |
| 19 | nfo | `ultra-satisfactory/21-shaded-block-nfo_opus_5.5.md` | nfo-02 | shaded block NFO |
| 20 | nfo | `ultra-satisfactory/22-poster-nfo_opus_5.5.md` | nfo-03 | poster NFO |
| 21 | nfo | `castaway/44-amiga-description-logo_opus_5.5.md` | nfo-06 | outline logo NFO |
| 22 | ansi | `castaway/52-teletext-page_opus_5.5.md` | ansi-08 | teletext page |
| 23 | ansi | `ultra-satisfactory/23-illustrated-ansi_opus_5.5.md` | ansi-03 | illustrated ANSI |
| 24 | ansi | `castaway/50-door-game-screen_opus_5.5.md` | ansi-06 | door game screen |
| 25 | internet era | `castaway/58-city-pop-sleeve_opus_5.5.md` | vap-06 | city-pop sleeve |
| 26 | internet era | `ultra-satisfactory/42-aero-gloss_opus_5.5.md` | vap-10 | aero gloss |
| 27 | internet era | `castaway/60-one-bit-desktop_opus_5.5.md` | vap-11 | 1-bit desktop |
| 28 | internet era | `gl4ss/05-luna-desktop.md` | vap-09 | glossy desktop |
| 29 | machines | `castaway/09-pinball-dmd_opus_5.5.md` | mach-11 | pinball display |
| 30 | machines | `castaway/73-vfd-front-panel_opus_5.5.md` | mach-12 | VFD front panel |
| 31 | machines | `ultra-satisfactory/10-arcade-attract_opus_5.5.md` | mach-08 | arcade attract |
| 32 | hacker | `castaway/87-file-system-landscape_opus_5.5.md` | hack-16 | file-system city |
| 33 | hacker | `castaway/88-tone-pad_opus_5.5.md` | hack-17 | tone keypad |
| 34 | hacker | `castaway/78-fetch-card_opus_5.5.md` | hack-06 | fetch card |
| 35 | east asia | `castaway/90-pc-98-adventure-screen_opus_5.5.md` | asia-02 | PC-98 adventure |
| 36 | east asia | `castaway/05-shiftjis-aa_opus_5.5.md` | asia-04 | Shift-JIS text art |
| 37 | east asia | `ultra-satisfactory/18-fm-synth-display_opus_5.5.md` | asia-01 | FM synth display |
| 38 | east asia | `st3gg/02-telnet-board.md` | asia-03 | telnet board |
| 39 | screensavers | `castaway/98-3d-pipes_opus_5.5.md` | idle-06 | 3D pipes |
| 40 | screensavers | `heretic/02-idle-02.md` | idle-02 | light synth |
| 41 | screensavers | `ultra-satisfactory/08-milkdrop-visualiser_opus_5.5.md` | idle-04 | music visualiser |
| 42 | files moved | `ultra-satisfactory/33-sysop-dashboard_opus_5.5.md` | xfer-08 | sysop dashboard |
| 43 | files moved | `ultra-satisfactory/35-terminal-session_opus_5.5.md` | xfer-05 | terminal session |
| 44 | files moved | `castaway/105-two-pane-transfer-client_opus_5.5.md` | xfer-09 | two-pane file client |
| 45 | demoscene | `ultra-satisfactory/07-compo-slides_opus_5.5.md` | demo-07 | compo slides |
| 46 | demoscene | `castaway/113-atari-8-bit-demo_opus_5.5.md` | demo-09 | Atari 8-bit demo |
| 47 | demoscene | `castaway/110-256-byte-intro_opus_5.5.md` | demo-04 | 256-byte intro |
| 48 | demoscene | `naturalis-historia/03-demo-titles.md` | demo-01 | demo titles |
| 49 | print | `castaway/115-swapper-floppy_opus_5.5.md` | print-01 | labelled floppies |
| 50 | print | `castaway/08-tractor-feed_opus_5.5.md` | print-04 | green-bar printout |
| 51 | print | `ultra-satisfactory/31-type-in-listing_opus_5.5.md` | print-03 | type-in listing |

SVG path, canvas and KB for each are in the picks file.

**Disk 2 (text) links:** `examples/castaway/45-newschool-ascii_opus_5.5.md`
and `examples/ultra-satisfactory/01-nfo-release_opus_5.5.md`, plus the
gallery index for the rest of the 35.

**Disk 3 (logos, gated):** four MediaLog logos chosen once the sets are
committed (e.g. one each from `medialog-logos-01`, `-03`, `-05`, `-07`).

**Deliberately left out:**

- **Real group names in page prose:** `castaway/15`, `22`, `23`, `32`, `33`,
  `34`, `35` (35 is the gorgeous hand-pixelled chrome logo, but its page names
  two groups), and `heretic/09-pc-12` (its SVG title names one).
- **"Supplied by", "cracked by" or "keygen":** `castaway/31` and `99`,
  `ultra-satisfactory/02`–`06` and `15`, and all of `dance-vision`
  (including 02, the most intro-like piece in the repo; 02, 03, 05 and 06 joke
  "cracked by" / "supplied by").
- **`readme-nfo` set:** its art says 152 styles; add back after a rebuild.
- **MediaLog:** untracked, links would 404 (see Disk 3).

Three link URLs keep catalogue slugs (`11-win32-cracktro`,
`115-swapper-floppy`, `90-pc-98-…`); visible captions never use them. If the
owner wants zero exposure, the build can link those three through the gallery
index instead.

### 4.3 Intro index (inside `<details>`, 34 columns)

```text
▄▄ FEATURED ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
01 metal-logo intro ........ pc-05
02 tunnel lagoon ........... pc-14
03 mode 7 island ......... mach-15
04 off-air test card ..... idle-10
05 memphis poster ......... vap-17
06 cassette, J-card ..... print-02
▄▄ PC INTROS ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
07 flat-field DOS intro .... pc-01
08 chrome spheres .......... pc-03
09 skinned installer ....... pc-06
10 vector objects .......... pc-13
▄▄ 8-BIT AND 16-BIT ▄▄▄▄▄▄▄▄▄▄▄▄▄▄
11 one-screen intro ....... c64-01
12 sine-wave letters ...... c64-02
   ... one band per family, to 51
▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
```

---

## 5. New assets and scripts

Deterministic Node scripts, no new dependencies (Playwright is already in
`node_modules`). Home: `docs/front-page/`; the hero in `.github/readme-nfo/`
(or wherever the CLI's install home lands; open question in the pipeline
research).

| File | Makes | Notes |
| --- | --- | --- |
| `copy.mjs` | Every word on the page and in the hero (steps, scroller, loader-strip labels, alt text) | One source for README and hero, so they cannot drift. `target` and `interim` modes (§8). |
| `facts.mjs` | 153 / 13 (catalogue), 260 / 8 / 35 (`git ls-files`), 51 / 6 (picks), CLI defaults, `timings.json` | Throws if a pick is untracked, or a page or SVG hits the deny list. |
| `picks.json` | The 51 picks | Seeded from `02-boot-intro.picks.json`. |
| `lib/pixel.mjs` | 5 × 7 font (moved from `examples/readme-nfo/src/lib.mjs`), original 8 × 8 scroller font, original 7 × 9 logo alphabet | No ROM fonts. |
| `hero.mjs` | `header.svg`, `header-dark.svg`, `social.png` | Fails over 100 KB, without a reduced-motion rule, or with `<text>`, `<script>` or external refs (reuses `tools/lib/checks.mjs`). |
| `bars.mjs` | `bar-1..4.svg`, 830 × 8, `preserveAspectRatio="none"` | < 1 KB each, `alt=""`. |
| `thumbs.mjs` | `thumbs/07..51.jpg`, 300 × 168 q82, letterboxed, number tab in the pixel font | Playwright `reducedMotion: 'reduce'`; keyed on SVG hash so stale thumbs fail `--check`. |
| `README.template.md` + `build.mjs` | `README.md` | Fills `{{STYLES}}`, `{{HEADERS}}`, `{{WALL}}`, `{{INDEX}}`, `{{STEPS}}` etc. `--check` exits 1 if stale; lints fenced text (≤ 34 cols, grid-safe glyphs only, none of ◆ ◇ ✓ ✔ ★ ☆ ▶ ◀) via `tools/front-page/lib/lint.mjs`. |
| `package.json` script | `"front-page": "node docs/front-page/build.mjs"` | Runs hero, bars, thumbs, README. |
| `validate.yml` step | `node docs/front-page/build.mjs --check` | A wrong count never reaches main. |

---

## 6. The journey, end to end (target pipeline)

| Step | Visitor does | Page shows | Pipeline piece |
| --- | --- | --- | --- |
| Discover | Lands on the repo | Intro boots; H1 says what it does | – |
| Decide | Watches, scrolls or presses Space | Loader strip (engine, folder); 51 real headers | – |
| Sign in | Already in Claude Code or Codex | Step 1 | `agents.mjs`: parallel probes of `claude auth status` and `codex login status`, 3 s timeout |
| Run | `npx readme-nfo` in the project | Step 2, copy button | npm `readme-nfo` with `styles/samples.json`; `readLocalProject()`; Windows `.cmd` spawn via `cmd.exe /d /s /c` |
| Engine | Nothing, or `--claude` / `--codex` | Bold lead-in + hero strip | Detection matrix; asks once if both are signed in |
| Wait | Watches the gallery fill | "Watch them land" | Progressive gallery, `--jobs 3`, one repair retry, skip on failure |
| Choose | Types `3`, or later `use 3` | Transcript, "Pick one" | Pick prompt + `install.mjs` |
| Install | Nothing | "It installs itself" + `<details>` | Marked block, neutral alt text, MIT notice in `.github/readme-nfo/` |
| Commit | `git diff`, commit | "You commit" | Never commits; prints the reminder |
| Re-roll | Runs again | "Not feeling any?" | Prior draws excluded |
| Undo | Deletes block and folder | `<details>` | – |

---

## 7. GitHub feasibility and risks

Uses only allowlisted HTML: `<picture>`/`<source media>`, `<p align>`, `<h1
align>`, `<img src width height alt>`, `<a href>`, `<details>`, `<sub>`,
`<b>`, `<br>`, fenced code. No inline SVG, style, class or script. Animation
lives only in self-contained SVGs loaded through `<img>`.

| Risk | Likelihood | Mitigation |
| --- | --- | --- |
| A scroller is a slow way to read steps | Certain | It is the trailer: the still frame lists all three, the loader strip shows engine and privacy at a glance, and the copyable steps are one Space away. |
| Intro aesthetic traces back to piracy culture | Medium (perception) | No crack/keygen/serial/warez/supplied-by anywhere; deny-list lint over every linked page; homage line in the footer; no real group names. The loader strip's fields are ENGINE and FACTS, never name/key. |
| `<picture>` follows OS rather than GitHub theme | Low | Both files are opaque screens in a bezel; either reads on either background. |
| Animation CPU | Low | Hero 18 animated elements; 6 featured SVGs; the 45 wall tiles are static JPEGs. |
| Sentence H1 big on phones | Low | 29 chars, 2 lines; fall back to `<h3 align>` if heavy. |
| Thumbnails drift from SVGs | Medium | Hash-keyed; `build --check` flags stale ones. |
| Long phone page (23 wall rows) | Medium | Featured first, index folded; fold wall rows 6–9 into `<details>` if needed. |
| Copy describes unbuilt features | High until the gate | Ships in `interim` mode until §8 lands. |
| Diverged origin/main | Certain today | Owner reconciles first, or `npx github:` serves a CLI the page does not describe. |
| Untested combinations | Medium | Push to a scratch repo; check desktop/phone, light/dark, reduced motion on/off before replacing `README.md`. |

---

## 8. Truth gate and interim copy

What each target claim needs first:

- `npx readme-nfo`: npm publish of `readme-nfo` (name unclaimed on
  2026-11-11), `package.json` rename, shipped `styles/samples.json`.
- Claude Code or Codex, auto-detected, `--claude` / `--codex`:
  `tools/generator/agents.mjs`, the `author.mjs` driver switch, the Windows
  `.cmd` fix. (Feasibility proven: the same brief and schema through
  `claude -p --json-schema --tools ""` passed `validateResponse` in 74 s.)
- "Private repos work, reads your folder": `readLocalProject()`.
- "Fills as they land", retry-then-skip: progressive gallery in `batch.mjs`
  / `hybrid-output.mjs`, `--jobs`, repair retry.
- Pick prompt, `use N`, marked block, `.github/readme-nfo/`: `install.mjs`
  and `terminal.mjs`.
- Neutral alt text in installed blocks: `hybrid-output.mjs`.

Until then `copy.mjs` runs in `interim` mode, swapping the step block, the
scroller, the loader strip and the footer; art and wall stay. Interim steps
(true today once main is reconciled):

````markdown
1. Sign in to Codex (run `codex login` once).
2. Run this with your repo's URL:

   ```sh
   npx --yes github:lukexyz/README.NFO github.com/you/project -4
   ```

3. When the four headers are done, a gallery opens. Copy your
   favourite's SVG into your repo and paste its Markdown at the top of
   your README.

> [!TIP]
> Private repo? Run `export GH_TOKEN=$(gh auth token)` first
> (PowerShell: `$env:GH_TOKEN = gh auth token`).

Needs Node.js 22+ and Git. Claude Code support, private repos without a
token and a one-word `npx readme-nfo` are on the way.
````

- **Interim scroller:** `STEP 1: SIGN IN TO CODEX ... STEP 2: RUN THE NPX LINE
  BELOW WITH YOUR REPO URL ... STEP 3: COPY YOUR FAVOURITE INTO YOUR README
  ... CLAUDE CODE SUPPORT IS ON THE WAY ...`
- **Interim loader strip:** `ENGINE ◄ CODEX ►` (no flip) and `FACTS ◄ GITHUB ►`.
- **Interim footer:** `ENGINES ..... Codex (Claude soon)`, `FACTS ....... GitHub
  API`, `NEEDS ....... Node.js 22+, Git`.
- **2.3** shrinks to two bullets (open the gallery; copy the SVG and paste the
  Markdown), no transcript.

The interim command is 62 columns and scrolls on phones: one more reason to
land the target pipeline.

---

## 9. Mobile and dark mode

**Phones (309 px column at 375 px, 364 px at 430):**

- Hero: 2:1 at ~340 × 170 px. Logo ~35 px tall, scroller glyphs ~14 px,
  loader-strip text ~7 px (legible as labels; their words repeat in bold
  lead-ins right below). The top line becomes texture.
- Command 14 chars; transcript, index and footer ≤ 34 cols: nothing scrolls
  sideways. The 37-col HTML sample is folded.
- Featured stacks one per row at full width; wall is 2 per row (304 px) with
  numbers burned in, so the folded index still maps.
- No tables on the page (the tables here are for the builder).

**Dark (`#0d1117`):** the bezel matches GitHub's border colour, so the screen
sits in the page; copper bars glow; the NFO footer is light on `#151b23`, as
an NFO should be.

**Light (`#ffffff`):** the light hero puts the screen in a darker plastic
bezel with a soft shadow (a monitor on a white desk, not today's black slab);
wall thumbnails carry their own 4 px screen edge (a grid of little monitors);
featured 05 Memphis is a loud light piece that breaks the dark row; the
footer reads like printed text on `#f6f8fa`.

**Reduced motion:** hero swaps to its composed still with all three steps and
both engines listed; all six featured SVGs honour it (checked); the wall is
static.

---

## 10. How it differs from the other nine angles

- **01 THE RELEASE** is an NFO document; this is an intro screen that hands
  over to Markdown.
- **03 SETUP.EXE** is a wizard; here the steps live in the scroller and in
  plain text, and the loader strip is two fields, not a window.
- **04 SELECT YOUR FIGHTER** stages engine choice as a versus screen; here it
  is one flipping field and one bold sentence.
- **06 ATTRACT MODE** cycles headers in the hero; here the hero is not a
  carousel and the examples are a numbered, family-sorted disk.
- **05, 07, 08, 09, 10** are a BBS, a magazine, an options screen, a terminal
  and an autorun splash.

Unique to this one: the hero delivers the instructions, PRESS SPACE is a
literal working hand-off, and the 34-column rule.

---

## 11. Verdict

**Why it is cool:**

- The first two seconds are the whole genre: chrome, stars and a wobbling
  scroller, and the scroller is the manual.
- Engine choice and "your folder, not GitHub" are visible in the hero itself,
  even in the reduced-motion still and the social card.
- PRESS SPACE is a joke that works.
- 51 real headers (vs 7 images today) from 6 projects and all 13 families,
  numbered like an intro pack, each clicking through to Markdown and source;
  plus a pointer to 35 text-art headers.
- Phone-first by rule; every count computed; one `copy.mjs` feeds README and
  hero; a truth gate swaps in interim copy until the pipeline lands.

**Weaknesses:**

- Scroller instructions are slow; the hero is partly a gimmick (mitigated by
  the still, the strip and the text right below).
- The intro lineage is piracy culture; clean vocabulary does not stop every
  reader making the link.
- The hero is hand-built, not CLI output, so it is weaker proof than an
  "output as hero" concept.
- Wall tiles are static 150 px stills; motion lives only in hero and featured.
- Castaway is 30 of 51 picks, so the island motif dominates.
- Long phone page (23 wall rows).
- Depends on the target pipeline; interim copy is weaker (62-col command,
  Codex only, GH_TOKEN).

**Build effort (page only, about 3 days):**

| Work | Days |
| --- | --- |
| `hero.mjs`: alphabet, scroller, starfield, loader strip, still, two themes, social PNG | 1.5 |
| picks, thumbs, bars, facts, copy, template, `build --check`, lint | 1 |
| Scratch-repo QA (desktop/phone, light/dark, reduced motion), copy polish | 0.5 |

The pipeline work it advertises is separate and larger (the research's change
list, mostly S and M items, plus the npm publish).
