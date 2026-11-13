# 10 · AUTORUN: the README.NFO cover disc

> **One-liner.** The front page is a Y2K PC-game CD you have just put in the
> drive. A chrome autorun launcher spins up with four real buttons (INSTALL,
> DEMOS, README, EXIT). Install is a three-step loading screen with two loading
> tips. The demo disc holds 42 real headers, and the jewel-case insert is a
> 2000s NFO, 34 columns wide so that it fits a phone.

Seed angle: CD-ROM AUTORUN. **The twist is that the page is the whole physical
package**, read in the order you would open it:

| Package part | README section | Job |
| --- | --- | --- |
| Front cover and autorun window | hero, pitch, four chrome buttons | what it is, plus navigation |
| Install screen | `## INSTALL` | three steps, the engine choice, private repos |
| Demo disc and back-of-box screenshots | `## DEMOS` | 42 real headers, 8 galleries, 13 family discs |
| Save screen | `## PICK YOURS` | what happens after the run: choose, install, commit |
| Jewel-case insert | `## README.TXT` | the NFO: release info, how it works, options |
| Eject | `## EXIT` | credits, licence, `[ EOF ]` |

How it differs from the other nine:

- It is not a setup wizard (03): the install is a loading screen of three lines.
- It is not a hall of fame (06): the gallery is a demo disc with tracks and
  numbered slots.
- It is not a magazine (07): there are no articles, only the box, the disc and
  the insert.

Its own formal rule is **pocket width**. Every text block a visitor must read is
**34 columns** or narrower, so nothing scrolls sideways on a 375 px iPhone.
The art can be wide, but the words never are.

Wall data, ready for the HTML build: `comparisons/front-page/concepts/10-autorun.wall.json`.
Prototype tiles (8 real stills, framed, averaging 15.1 KB each):
`<scratchpad>/front-page/c10/tiles/strip-{dark,light}.png`.

---

## 1. Facts the page states (all computed, none typed)

| Token | Value today | Source the build script reads |
| --- | --- | --- |
| `{{styles}}` | 153 | `loadCatalogue().distinct` in `tools/generator/hybrid-catalogue.mjs` |
| `{{families}}` | 13 | the same, grouped by family |
| `{{family.pc}}` … | pc 14, c64 14, trk 11, nfo 11, ansi 11, vap 17, mach 13, hack 19, asia 7, idle 10, xfer 10, demo 11, print 5 | the same |
| `{{headers}}` | 260 | `git ls-files 'examples/*/[0-9]*-*.md'` (logo sets counted separately) |
| `{{galleries}}` | 8 | sets with at least one committed header |
| `{{animated}}` | 264 of 317 committed SVGs, and all 264 honour `prefers-reduced-motion` | grep keyframes or SMIL, then grep the media query |
| `{{shown}}` | 42 (2 featured plus 40 on the wall) | `docs/front-page/front-page.json` |
| `{{time10}}` | **not measured yet** | `docs/front-page/bench.json`, from one timed 10-header run per engine |
| `{{engines}}`, `{{local}}`, `{{install}}` | Codex only, no, no (today) | `node tools/generate.mjs --capabilities --json` (new flag) |

The **claims gate** works like this: the engine choice, private repos and
pick-to-install appear in the README and in the hero's scroller only when
`--capabilities` reports them. Until the pipeline ships, the build writes the
"true today" variant of the install section (section 2.2b) instead. The README
can never claim a feature the CLI lacks.

---

## 2. The README, section by section

GitHub shows the file list first, so the README starts about 950 px down on
desktop. Everything above the `INSTALL` heading must work at a glance.

### 2.1 Front cover: hero, pitch and buttons

````markdown
<p align="center">
  <a href="examples/readme-nfo/42-pc-06.md"><img
    src="examples/readme-nfo/assets/42-pc-06.svg" width="100%"
    alt="README.NFO autorun window: a spinning disc beside Install,
    Demos, Readme and Exit buttons (animated)"></a>
</p>

<p align="center"><b>Retro headers for your README.</b><br>
Run one command in your project and Claude Code or Codex draws ten
original headers from 153 styles: NFO, ANSI, demoscene intros,
trackers, Y2K desktops and more.</p>

<p align="center">
  <a href="#install"><img src="docs/front-page/btn-install.svg"
    width="144" height="42" alt="Install"></a>
  <a href="#demos"><img src="docs/front-page/btn-demos.svg"
    width="144" height="42" alt="Demos"></a>
  <a href="#readmetxt"><img src="docs/front-page/btn-readme.svg"
    width="144" height="42" alt="Readme"></a>
  <a href="#exit"><img src="docs/front-page/btn-exit.svg"
    width="144" height="42" alt="Exit"></a>
</p>
````

- The hero is the four buttons drawn inside the window. The row underneath is
  the same four buttons as real links: on desktop they sit four across under
  the window, and on a phone they form a 2×2 keypad.
- **README** links to `#readmetxt` and not `#readme`, because github.com
  already uses `#readme` for the README box itself.
- **EXIT** links to the credits and `[ EOF ]`, which is a small joke that is
  also a working link.

```
  .-------------.
 /   .-------.   \ ╔══════════════════════════════════════════════════╗
|   / ░▒▓▓▒░  \   |║ ▄▀ README.NFO ▀▄   chrome, glint sweep    [_][x]  ║
|  |  ( (O) )  |  |║    RETRO HEADERS FOR YOUR README                  ║
|  |  README   |  |╟──────────────────────────────┬────────────────────╢
|   \ .NFO 1/1/   |║ AUTORUN > READY       (o)    │ >[   INSTALL   ]   ║
 \   '-------'   / ║ DISC ...... README.NFO       │  [    DEMOS    ]   ║
  '-------------'  ║ STYLES .... 153 / 13 FAM.    │  [   README    ]   ║
   disc bay, the   ║ ENGINE .... CLAUDE OR CODEX  │  [    EXIT     ] < ║
   disc spins      ╟──────────────────────────────┴────────────────────╢
   under fixed     ║ VFD: 153 STYLES · 13 FAMILIES · PRIVATE REPOS OK ·║
   light           ╚══════════════════════════════════════════════════╝
                    [ INSTALL ][ DEMOS ][ README ][ EXIT ]  <- real links
```

### 2.2 INSTALL (the loading screen)

#### 2.2a Target version (ships with the pipeline)

````markdown
## INSTALL

<img src="docs/front-page/loading.svg" width="100%" alt="">

1. Sign in to [Claude Code](https://claude.com/claude-code) or
   [Codex](https://developers.openai.com/codex).
2. In your project's folder, run:

   ```sh
   npx readme-nfo
   ```

3. Watch the gallery fill up, then type the number you like. It goes
   at the top of your README ([what happens](#pick-yours)).

> [!TIP]
> **LOADING TIP** · Signed in to both? Add `--claude` or `--codex` to
> choose. If only one is signed in, README.NFO uses it and tells you
> which.

```text
─[ SYSTEM REQUIREMENTS ]──────────
 RUNTIME .. Node.js 22 or newer
 ENGINE ... Claude Code or Codex,
            either one signed in
 PROJECT .. any git repo: public,
            private or unpushed
 TOKEN .... none needed
 TIME ..... {{time10}} for ten
 COST ..... your engine's plan
──────────────────────────────────
```

> [!TIP]
> **LOADING TIP** · Private repo? Nothing to set up. README.NFO reads
> your project from the folder, not from GitHub, and only the engine
> you picked ever sees it.
````

- `loading.svg` is an 830×40 strip with "NOW LOADING" on the left and a
  three-segment bar labelled 1 SIGN IN · 2 RUN · 3 PICK. The segments fill one
  per second and hold for two. With reduced motion, the bar is shown full. Its
  `alt=""` marks it as decoration, because the steps are real text.
- The command sits alone in an `sh` block: no `$`, no comment, 14 characters,
  so the copy button gives a working line and nothing scrolls on a phone.
- There are exactly two alerts on the page, and the requirements block keeps
  them apart (GitHub advises against consecutive alerts).
- The `SYSTEM REQUIREMENTS` block is the back-of-box panel. It is 34 columns
  wide, and the content in every row ends by column 34.
- `{{time10}}` stays empty until it has been measured, and the build fails if
  it is missing. Trials so far, one header each: Claude Code (Sonnet) took
  39 s and 74 s, and Codex took 151 s (gpt-6-astra, today) and 378 s
  (gpt-6.1-sol, reasoning xhigh, October). The bench must
  record a real run of ten headers, three at a time, for each engine. The range
  printed is the measured minimum to maximum.

#### 2.2b "True today" variant (only if the page ships first)

The build picks this variant automatically while `--capabilities` reports Codex
only and no local mode. It also assumes `origin/main` has been reconciled, so
that `npx github:` installs the CLI described here.

````markdown
## INSTALL

<img src="docs/front-page/loading.svg" width="100%" alt="">

1. Sign in to [Codex](https://developers.openai.com/codex).
   Claude Code support is coming.
2. Run this with your repository's URL:

   ```sh
   npx --yes github:lukexyz/README.NFO github.com/you/project -4
   ```

3. Your gallery opens when all four are done. Copy the one you like
   into your README ([how](docs/generation.md)).

> [!TIP]
> **LOADING TIP** · Private repo? Give it your GitHub sign-in first.
> Bash: `export GH_TOKEN=$(gh auth token)` · PowerShell:
> `$env:GH_TOKEN = gh auth token`
````

In this variant the requirements block reads `ENGINE ... Codex, signed in`,
`NEEDS .... Node 22+ and Git`, and `TIME ..... about 6 min a header`, which is
the measured trial: one header took 378 s.

### 2.3 DEMOS (the demo disc)

````markdown
## DEMOS

**42 of the 260 headers on this disc.** Each was drawn for a real
repository. Click a screen for the animated original, its Markdown
and the script that drew it.

<p align="center">
  <a href="examples/castaway/01-mode7-island_opus_5.5.md"><img
    src="examples/castaway/assets/01-mode7-island_opus_5.5.svg"
    width="400" height="225"
    alt="CASTAWAY header: island title screen on a rotating sea
    (animated)"></a>
  <a href="examples/ultra-satisfactory/13-chrome-spheres_opus_5.5.md"><img
    src="examples/ultra-satisfactory/assets/13-chrome-spheres_opus_5.5.svg"
    width="400" height="225"
    alt="ULTRA-SATISFACTORY header: chrome spheres over a checkerboard
    (animated)"></a>
</p>

### Disc 1 · Title screens and intros

<p align="center">
  <a href="examples/castaway/35-hand-pixelled-chrome-logo_opus_5.5.md"><img
    src="docs/front-page/wall/01.jpg" width="144" height="81"
    alt="CASTAWAY: hand-pixelled chrome logo"
    title="01 · CASTAWAY · hand-pixelled chrome logo"></a>
  … nine more tiles, 02 to 10 …
</p>

### Disc 2 · NFO, ANSI and text mode
… tiles 11 to 20 …
### Disc 3 · Y2K desktops, tapes and paper
… tiles 21 to 30 …
### Disc 4 · Demos, scopes and screensavers
… tiles 31 to 40 …

<sub>Showcase headers were drawn by Claude Opus in long, reviewed runs,
from the same 153 style briefs the command uses. Your engine and model
set the quality and speed of a run.</sub>

| Track | Gallery | Headers |
| :-- | :-- | --: |
| 01 | [Castaway](examples/castaway/README.md) | 116 |
| 02 | [ULTRA-SATISFACTORY](examples/ultra-satisfactory/README.md) | 42 |
| 03 | [README.NFO](examples/readme-nfo/README.md) | 41 |
| 04 | [Heretic](examples/heretic/README.md) | 40 |
| 05 | [Dance Vision](examples/dance-vision/README.md) | 6 |
| 06 | [NATURALIS-HISTORIA](examples/naturalis-historia/README.md) | 5 |
| 07 | [GL4SS](examples/gl4ss/README.md) | 5 |
| 08 | [ST3GG](examples/st3gg/README.md) | 5 |
| | **[All galleries](examples/README.md)** | **260** |

**Explore the disc: 153 styles in 13 families.**

<p align="center">
  <a href="styles/pc.md"><img src="docs/front-page/disc/pc.svg"
    width="52" height="52" alt="PC intros, 14 styles"
    title="PC intros · 14 styles"></a>
  … twelve more discs: c64 trk nfo ansi vap mach hack asia idle xfer
  demo print …
</p>
````

- **Featured:** the two "playable demos" are the original animated SVGs.
  Both are 16:9, and with both `width` and `height` set they line up evenly.
  On a phone each shrinks to the column width and letterboxes inside its box.
- **The wall:** 40 framed **stills** in four discs of ten. Each still is the
  header's own reduced-motion frame, or a fixed `t` from the config. It sits
  in a gunmetal bezel with a blurred, darkened fill behind any letterbox and a
  pixel slot number in the bottom-left corner. Each tile links to its header's
  `.md`, which has the animated original. The `title` attribute gives a hover
  caption on desktop, and alt text stays under 60 characters.
- **Why stills:** 40 live SVGs would weigh about 4 MB and run 40 animations at
  once. The stills total about 600 KB, measured at 15.1 KB a tile over eight
  real tiles. The hero and the two featured demos supply the motion.
- **The track list** is a 3-column table, narrow enough not to scroll on
  phones. The build generates it from `git ls-files`. MediaLog joins
  automatically once it is committed, as further tracks and a "Disc 5 ·
  Logos" strip of 4 × 203 px.
- **The family discs** are 13 mini CDs, 52 px each, linking to the
  `styles/<family>.md` pages. Each has a family code on its label in pixel
  type (PC, C64, TRK, NFO, ANSI, Y2K, MACH, HACK, ASIA, IDLE, XFER, DEMO,
  PRNT) and an accent ring per family. They fit in one row of 13 on desktop
  and in rows of 5, 5 and 3 on a phone.
- **Dance Vision** is listed only once its pages are reworded. Its gallery and
  three header pages joke "cracked by" and "Keymaker". Until then the build's
  word check fails, and the fallback drops the track, so the totals read 254
  headers in 7 galleries automatically.

The wall, disc by disc (full data in `10-autorun.wall.json`):

| # | Disc 1 · Title screens and intros | # | Disc 2 · NFO, ANSI and text mode |
| --: | --- | --: | --- |
| 01 | `castaway/35-hand-pixelled-chrome-logo` | 11 | `castaway/45-newschool-ascii` (text) |
| 02 | `castaway/24-skinned-installer` | 12 | `castaway/07-7bit-outline-nfo` (text) |
| 03 | `heretic/09-pc-12` | 13 | `ultra-satisfactory/01-nfo-release` (text) |
| 04 | `castaway/36-st-menu-disk` | 14 | `ultra-satisfactory/21-shaded-block-nfo` |
| 05 | `castaway/09-pinball-dmd` (t = 3 s) | 15 | `castaway/52-teletext-page` |
| 06 | `castaway/71-console-title-screen` | 16 | `castaway/50-door-game-screen` |
| 07 | `castaway/70-handheld-boot-logo` | 17 | `ultra-satisfactory/23-illustrated-ansi` |
| 08 | `ultra-satisfactory/16-poster-installer` | 18 | `castaway/02-bbs-stats` |
| 09 | `castaway/73-vfd-front-panel` | 19 | `castaway/30-petscii-picture` |
| 10 | `ultra-satisfactory/28-flat-silhouette-intro` | 20 | `castaway/10-dir-art` |

| # | Disc 3 · Y2K desktops, tapes and paper | # | Disc 4 · Demos, scopes and screensavers |
| --: | --- | --: | --- |
| 21 | `ultra-satisfactory/42-aero-gloss` | 31 | `castaway/98-3d-pipes` |
| 22 | `castaway/65-memphis` | 32 | `st3gg/01-off-air` |
| 23 | `gl4ss/05-luna-desktop` | 33 | `castaway/95-light-synth` |
| 24 | `castaway/56-vhs-tape` | 34 | `castaway/99-3d-maze` |
| 25 | `castaway/58-city-pop-sleeve` | 35 | `ultra-satisfactory/09-oscilloscope` |
| 26 | `castaway/60-one-bit-desktop` | 36 | `ultra-satisfactory/07-compo-slides` |
| 27 | `ultra-satisfactory/12-cassette-jcard` | 37 | `naturalis-historia/03-demo-titles` |
| 28 | `castaway/08-tractor-feed` | 38 | `heretic/15-demo-10` |
| 29 | `castaway/92-japanese-basic-power-on` | 39 | `castaway/26-vector-objects` |
| 30 | `castaway/105-two-pane-transfer-client` | 40 | `castaway/87-file-system-landscape` |

All paths sit under `examples/`, and the `_opus_5.5` suffix is omitted above.

- **Coverage:** all 13 families, six projects (CASTAWAY 27, ULTRA-SATISFACTORY
  10, HERETIC 2, GL4SS 1, ST3GG 1 and NATURALIS-HISTORIA 1, counting the
  featured pair), and three plain-text NFO headers that show text-only output.
- **Left out on purpose:**
  - artwork that implies piracy: Dance Vision, `castaway/103` sitebot,
    `ultra/03` keygen dialog, `ultra/11` Win32 intro, `ultra/29` site race;
  - names that do: `castaway/115` is named "swapper", and `castaway/88`'s alt
    text names a phreak style;
  - headers too dense at 144 px: Castaway 78, 90 and 101, ULTRA 20 and 22;
  - the untracked MediaLog sets.
- I checked every linked page against a piracy word list. The only hits were
  harmless: "crackle" (vinyl), "razor-straight" (a horizon), "INSPIRATION" and
  a joke "supplied by" about rocks.

### 2.4 PICK YOURS (after the run)

````markdown
## PICK YOURS

<p align="center"><img src="docs/front-page/gallery.jpg" width="100%"
  alt="The gallery README.NFO opens: ten numbered screens for
  README.NFO, filling in as each header finishes"></p>

When the last header lands, the terminal asks
`Install which header? [1-10, Enter = later]`. Type a number and
README.NFO:

- copies the SVG and its MIT notice to `.github/readme-nfo/`,
- adds a marked block to the very top of your README,
- and stops there. It never commits. Check `git diff`, then commit.

Changed your mind? `npx readme-nfo use 4` swaps in number 4. Run
`npx readme-nfo` again for ten styles you have not had yet.

<details><summary>What lands in your README</summary>

```html
<!-- README.NFO header: start -->
<p align="center"><img
 src=".github/readme-nfo/header.svg"
 width="100%" alt="myproject header"></p>
<!-- README.NFO header: end -->
```

</details>
````

- `gallery.jpg` is a real screenshot of the live gallery from a recorded run on
  this repository, taken when the pipeline ships. It is not a mock-up, so the
  page shows exactly what you will see.
- The prompt is inline code inside prose, so it wraps on a phone. The snippet
  is folded away, and its widest line is 36 columns.

### 2.5 README.TXT (the jewel-case insert)

Each block is a booklet page. They stack down the page and stay in pocket
width.

````markdown
## README.TXT

```text
▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
 R E A D M E . N F O     DISC 1/1
▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
  retro headers for your README

─[ RELEASE INFO ]─────────────────
 STYLES ..... 153 in 13 families
 HEADERS .... 260 in 8 galleries
 ANIMATED ... 264 SVGs, each with
              a still for reduced
              motion
 OUTPUT ..... SVG + Markdown, or
              plain-text NFO art
 ENGINES .... Claude Code, Codex
 LICENCE .... MIT

─[ HOW IT PLAYS ]─────────────────
 1 READS  your folder: name,
          README, languages
 2 DRAWS  10 styles you have
          not had before
 3 PAINTS each one with your
          engine, 3 at a time
 4 CHECKS every SVG; a failed
          one gets one retry
 5 SHOWS  each one as it lands
──────────────────────────────────
```

<details><summary><b>OPTIONS</b></summary>

```text
─[ OPTIONS ]──────────────────────
 --claude ....... use Claude Code
 --codex ........ use Codex
 --model NAME ... pick a model
 -6 ............. six headers
                  (default ten)
 --format text .. text art only
 --jobs 1 ....... one at a time
 --resume DIR ... finish a batch
 --no-open ...... no browser
 use 4 .......... install no. 4
 github.com/o/r . a repo you have
                  not cloned
──────────────────────────────────
```

</details>

[Full guide](docs/generation.md) · [Style catalogue](styles/INDEX.md) ·
[All galleries](examples/README.md) · [Draw one by hand](docs/development.md)
````

- The insert's logo is a spaced-caps release line between two `▄▄▄` and `▀▀▀`
  bars. That is the 2000s NFO frame, and it suits pocket width better than a
  wide half-block logo, which would scroll on phones.
- Every block keeps its content within 34 columns, and none has a right-hand
  border, so a narrow phone loses nothing. Only grid-safe glyphs are used
  (`▄ ▀ ─ [ ] .`).
- `OPTIONS` lists real flags. `--format`, `--resume`, `--no-open` and `-N`
  exist today. `--claude`, `--codex`, `--model`, `--jobs`, `use N` and the
  bare run come from the pipeline target, and the claims gate leaves them out
  until they exist.

### 2.6 EXIT (eject)

````markdown
## EXIT

```text
─[ CREDITS & THANKS ]─────────────
 research .. 16colo.rs, Demozoo,
             Pouet, textfiles.com
 tools ..... Node.js, Playwright
 engines ... Claude Code, Codex
 you ....... everyone who opens
             an issue with a
             screenshot
──────────────────────────────────
 MIT · Luke Woods          [ EOF ]
```

[MIT licence](LICENSE) · [Issues](https://github.com/lukexyz/README.NFO/issues)
· [Musings](MUSINGS.md)
````

All four research archives are cited in `styles/styles.json` (Pouet 265 times,
Demozoo 134, 16colo.rs 70, textfiles.com 39). Playwright is in `package.json`.
There are no greets and no group names.

---

## 3. The hero and its animation

**File.** `examples/readme-nfo/42-pc-06.md` with `assets/42-pc-06.svg`, made by
`examples/readme-nfo/src/42-pc-06.mjs`. It is catalogue style **pc-06**, the
skinned installer: a custom-shaped launcher window with a few big buttons.
That makes the hero a real README.NFO header in a real catalogue style, signed
by its generator. It reuses `examples/readme-nfo/src/lib.mjs` (`px()` 5×7
bitmap glyphs drawn as paths, the `svg()` wrapper with its reduced-motion
rule). `INFO.styles` changes from the hard-coded 152 to `loadCatalogue()`, so
it reads 153.

**Canvas.** The viewBox is 960×480 (2:1), with no background rectangle. The
window is a shape floating on the page, the Y2K custom-skin look.

| Part | Geometry | Look |
| --- | --- | --- |
| Window body | rounded rect x 150–930, y 60–420, r 28 | brushed gunmetal `#3a4352`→`#1d232d`, a 2 px `#0b0e13` outline, a 1 px inner highlight |
| Disc bay | circle centred (210, 240), r 180, bulging past the left, top and bottom edges | chrome rim and a black well |
| Disc | r 150 | silver base, fine concentric data rings, a white label ring (r 50–130) printing README.NFO / DISC 1 OF 1 / 153 STYLES in pixel type, and a clear hub |
| Iridescence | six translucent hue wedges over the disc | **fixed**: the light stays put while the disc turns beneath it, which sells the spin |
| Title plate | x 400–900, y 85–185 | dark glass inset; README.NFO at `px` scale 7 (413×49) in chrome (sky to horizon to ground gradient); RETRO HEADERS FOR YOUR README at scale 2 in cyan |
| Status panel | x 400–690, y 205–345 | AUTORUN > READY, then DISC, STYLES and ENGINE rows in dot-leader pixel text |
| Buttons | four 180×30 chrome capsules at x 715, y 210 / 245 / 280 / 315 | INSTALL, DEMOS, README, EXIT, each with a pixel icon (tray arrow, ►, page, eject ▲) |
| VFD strip | x 400–900, y 360–395 | a cyan vacuum-fluorescent scroller, clipped |
| Trinkets | — | minimise and close pills, a drive BUSY LED, rivets, a soft drop shadow (`feGaussianBlur`, 35 % black) |
| Cursor | 11×16 pixel arrow | glides between buttons |

**One 12-second loop.** The rule is one effect, one moving line of text, and
one small action.

| t (s) | What moves |
| --- | --- |
| always | The disc turns once every 8 s (linear). The BUSY LED blinks at 1 Hz. The VFD scroller crawls at 40 px/s through `{{styles}} STYLES · {{families}} FAMILIES · CLAUDE CODE OR CODEX · PRIVATE REPOS OK · NODE 22+ · MIT ·`. Engine and private-repo phrases are gated on `--capabilities`. |
| 0.0–0.8 | A specular glint sweeps once across the chrome wordmark. |
| 0–9 | The highlight and cursor step INSTALL → DEMOS → README → EXIT, 2.25 s each. |
| 9.0 | The cursor returns to INSTALL and presses it: the button sinks 2 px and the LED flashes once. |
| 9.2–12 | The status panel's top row reads `> npx readme-nfo` (the gated true-today command when needed), then resets. |

**Reduced motion** shows a composed still:

- the disc at rest with its label upright;
- INSTALL lit, with the cursor on it;
- the status row reading `> npx readme-nfo`;
- the VFD showing `153 STYLES · 13 FAMILIES`, centred;
- the LED on.

These are the elements' base styles, so `*{animation:none}` from `lib.mjs`
lands on them. Nothing flashes more than once a second.

**Budget and checks.**

- At most 100 KB. Pixel text is run-length merged into `h`/`v` runs, and the
  scroller is about 130 glyphs.
- No `<text>`, fonts, scripts or external references.
- The file must pass `tools/lib/checks.mjs` and the front-page lint.

**Social card.** `docs/front-page/social.png` is 1280×640: the reduced-motion
still centred on a dark desk gradient, under 1 MB. The owner uploads it as the
repository's social preview. The same text gives a FILE_ID.DIZ-sized About
line for the repo: *Retro README headers: NFO, ANSI, demoscene, Y2K. 153
styles, drawn by Claude Code or Codex.*

---

## 4. New assets (every one made by a deterministic Node script)

| Asset | Size and weight | Made by | Notes |
| --- | --- | --- | --- |
| `examples/readme-nfo/assets/42-pc-06.svg` and `42-pc-06.md` | 960×480, ≤ 100 KB | `examples/readme-nfo/src/42-pc-06.mjs` | the hero; seeded, with no clock |
| `docs/front-page/btn-{install,demos,readme,exit}.svg` | 288×84 shown at 144×42, about 3 KB each | `tools/front-page/art.mjs` | chrome capsules with pixel labels; only INSTALL has a slow 4 s sheen, off under reduced motion |
| `docs/front-page/loading.svg` | 830×40, about 5 KB | `art.mjs` | NOW LOADING bar with 3 segments |
| `docs/front-page/disc/<family>.svg` × 13 | 104×104 shown at 52, about 2 KB each | `art.mjs` | static mini CDs with code labels and accent rings; no Compact Disc mark |
| `docs/front-page/wall/01–40.jpg` | 288×162 shown at 144×81, about 15 KB each (measured) | `tools/front-page/stills.mjs` | Playwright with `reducedMotion: 'reduce'`, DPR 2, a gunmetal bezel, a blurred letterbox fill, a pixel slot number, JPEG quality 82 |
| Text-only tiles 11–13 | as above | `stills.mjs` | the header's first fenced block, rendered with GitHub's dark code CSS on `#151b23` |
| `docs/front-page/gallery.jpg` | 1660×~900, about 150 KB | `stills.mjs --gallery <batch>` | a real run on this repo, rendered from its `index.html` |
| `docs/front-page/social.png` | 1280×640, under 1 MB | `stills.mjs --social` | made from the hero's still |
| `docs/front-page/front-page.json` | — | hand-edited | featured tiles, discs, captions, optional `t` per tile, family-disc labels, word list |
| `docs/front-page/README.template.md` and `install.partial.md` | — | hand-edited | `{{tokens}}`; the install partial is shared with `docs/generation.md` |
| `docs/front-page/bench.json` | — | `tools/front-page/bench.mjs` | the timed 10-header run per engine that fills `{{time10}}` |
| `tools/front-page/build.mjs` | — | — | writes `README.md` from the template; `--check` in CI fails if the README is stale |

**What `build.mjs --check` fails on:**

- the README or any asset differs from a fresh build;
- a count token is stale;
- a claim fails the capabilities gate;
- an image is missing;
- a booklet block has content past column 34, or a code block is wider than
  80 columns;
- a glyph outside the safe set;
- an animated SVG without `prefers-reduced-motion`;
- an SVG with `<text>` in new art;
- a piracy word, or a catalogue style name containing a real group name, in
  the README, in its alt or title text, or in any page it links to;
- image weight over 1.5 MB above the `## DEMOS` heading, or over 3 MB in
  total.

**Expected page weight:**

| Item | KB |
| --- | ---: |
| Hero | ~90 |
| Buttons | 12 |
| Loading bar | 5 |
| Featured pair (71.9 + 109.1) | 181 |
| Wall, 40 × ~15 | ~600 |
| Family discs | ~26 |
| Gallery screenshot | ~150 |
| **Total** | **~1.07 MB** |

Today's page loads 441.5 KB across 7 images. This one shows 6 times as many
headers (42) at about 2.4 times the weight. Above the fold it is about 110 KB.

**Determinism:**

- SVG art comes from seeded generators, with no clock.
- Stills are rendered in CI on Ubuntu with pinned Playwright Chromium and
  pinned fonts. This matters for headers that use `<text>`, such as Heretic
  03 and 38.
- Outputs are committed, and `--check` re-renders them and compares hashes.

---

## 5. The journey, end to end

1. **Land.** The disc spins, the pitch says what README.NFO is in one line,
   and four chrome buttons offer the next step.
2. **Want it.** DEMOS shows 42 real headers across 13 families. Any tile opens
   the animated original, its Markdown and its generator.
3. **Install.** Sign in to Claude Code or Codex, then run `npx readme-nfo` in
   the project folder. Node 22+ is the only other requirement: no Git URL, no
   token.
4. **Engine.**
   - `--claude` or `--codex` wins.
   - Otherwise the CLI probes both: `claude auth status --json` and
     `codex login status`.
   - If one is ready, it uses it and prints `AGENT Claude Code (switch:
     --codex)`.
   - If both are ready, it asks once: [1] Claude Code [2] Codex.
   - If neither is ready, it prints both sign-in hints.
5. **Facts.** The CLI reads the local checkout: name, description, README
   headings, languages from `git ls-files` and the licence. It never calls
   GitHub, so private, GitLab and unpushed repos all work. Only the chosen
   engine sees the prompt.
6. **Draw.** Ten distinct styles, excluding earlier batches, are saved to
   `draw.json` first.
7. **Paint.** Three headers are drawn at a time, dropping to one if the engine
   rate-limits. Each answer is validated, and a failed header gets one repair
   retry fed with the validator's notes.
8. **Gallery** (the pipeline continues the disc). The CLI's `index.html`
   reuses the autorun skin:
   - a gunmetal window titled `DISC: <project>` with `7 OF 10 LOADED`;
   - numbered chrome-bezel slots that fill as headers land;
   - empty slots show **loading tips** (true ones, such as "Animated headers
     stop moving for visitors who ask for reduced motion");
   - each finished card shows its number, the live SVG, Copy Markdown and a
     copyable `npx readme-nfo use N`.
9. **Pick.** The terminal asks `Install which header? [1-10, Enter = later]`.
10. **Install.**
    - The CLI writes `.github/readme-nfo/header.svg` and `.github/readme-nfo/LICENSE`.
    - It inserts or replaces the marked block at the top of the README, with
      the neutral alt text `NAME header`.
    - It keeps the README's line endings and BOM and refuses symlinks.
    - It never commits, and prints `Review with git diff, then commit.`
    - Batches stay in `readme-headers/`, which goes into `.git/info/exclude`.
11. **Later.** `npx readme-nfo use 4` swaps the header. A plain re-run draws
    ten styles you have not had yet. The 2.2b variant of this page covers the
    time before any of this ships.

The front page, the CLI gallery and the install prompt share one metaphor and
one vocabulary: the disc, numbered slots, loading tips and `use N`. What the
README promises is what the tool then shows.

---

## 6. GitHub feasibility and risks

**What renders, and why:**

- `<p align>`, `<a href>`, and `<img>` with `src`, `width`, `height`, `alt`
  and `title` are all on the sanitizer's allowlist, `title` included.
- Fragment links (`#install`) resolve on github.com through its
  `user-content-` anchor handling.
- Alerts, `<details>`, tables and fenced code are standard.
- Animation lives only inside SVGs loaded through `<img>`.
- No inline SVG, `<style>`, classes or `<picture>` is needed. The hero has no
  background, a dark outline and a neutral shadow, so one file reads on white
  and on `#0d1117`.

**Risks and mitigations:**

| Risk | Mitigation |
| --- | --- |
| The headline claims (Claude, private repos, pick-to-install, `npx readme-nfo`) are **not built yet** | The claims gate: the build writes the 2.2b variant until `--capabilities` reports them, and the hero's scroller is gated too. |
| `origin/main` has diverged, so `npx github:` installs an older CLI | Owner action: reconcile before shipping any variant. |
| The anchor `#readme` collides with GitHub's README box | Use the heading `README.TXT` and link `#readmetxt`; the build checks slugs with GitHub's rules. |
| Stills hide motion on the wall | Hero plus two featured demos animate; every tile links to the animated original; the intro text says so. |
| The 144 px tiles are tight on 360 px Androids (column ≈ 294 px; two tiles plus a gap ≈ 292 px) | Shoot `mobile` at 360 px in `tools/front-page/shoot.mjs` before launch; fall back to 140×79. |
| Stills go stale when a header is regenerated | `--check` re-renders and compares hashes in CI. |
| npm's README page may not resolve relative image paths | Verify after the first publish. If needed, the build emits absolute `raw.githubusercontent.com` URLs for the packed README only. |
| Dance Vision pages contain "cracked by" and "Keymaker" jokes | Reword those pages (S), or the track drops automatically and totals recompute. |
| Y2K chrome tips into kitsch | One effect (the disc), one scroller, one cursor action. Neutral gunmetal, no rainbow text, no OS-specific chrome copied, no Compact Disc mark. |
| The text blocks look narrow on desktop | Intentional (a booklet page). The art carries the width, the words stay in pocket width. |
| Castaway dominates (27 of 42) | Each disc mixes at least two projects. Rebalance as new committed sets arrive (MediaLog adds a fifth project and a logo disc). |
| `{{time10}}` is unknown | The build refuses to print a time that has not been measured. |

---

## 7. Mobile and dark mode

| Element | Phone (375 px viewport, about 309 px column) | Light mode | Dark mode |
| --- | --- | --- | --- |
| Hero | about 155 px tall; the 49-unit chrome wordmark becomes about 16 px and stays legible; panel text is decoration, repeated in real text below | the window floats on white with a soft shadow and a gunmetal outline | the rim highlight separates it from `#0d1117`; the shadow is invisible but harmless |
| Buttons | 2×2 keypad at 144×42 | the chrome capsules carry their own dark outline | same |
| Install steps | plain Markdown; the command is 14 columns, so no scroll | standard | standard |
| Booklet blocks | content within 34 columns, so nothing scrolls even on a 375 px iPhone (SF Mono at about 8.2 px, roughly 34 columns visible) | dark text on the `#f6f8fa` code background | light text on `#151b23` |
| Featured demos | one per row, full width, letterboxed | opaque art | opaque art |
| Wall | 2 per row (144 + gap + 144 = 292 px), 20 rows of about 85 px, about 1,750 px | framed **screens**: the gunmetal bezel makes dark art read as a monitor, not a black slab | same |
| Track table | 3 short columns, fits | GitHub zebra rows | same |
| Family discs | rows of 5, 5 and 3 at 52 px | silver discs with dark outlines | same |
| Alerts | wrap normally | GitHub styling | GitHub styling |

`tools/front-page/render.mjs` and `shoot.mjs` (`desktop-light`,
`desktop-dark`, `mobile-dark`, `--reduced-motion`) are the acceptance test for
each of these.

---

## 8. Why it is cool

- **A physical object you can scroll through.** Cover, disc, insert, demo
  disc, eject. Early-2000s PC gamers will feel the jewel case click open, and
  everyone else still gets four obvious buttons.
- **The hero is the product.** It is a real README.NFO header in a real
  catalogue style (pc-06), with its generator one click away.
- **Six times the examples at about 2.4 times today's image weight.** It shows
  42 headers from six projects across all 13 families: framed screens, with
  the animation one click away.
- **Instructions you cannot get wrong.** Three short lines and a 14-character
  command, with the engine choice and private repos answered right where the
  question comes up, as loading tips.
- **Pocket width.** All the NFO text reads fully on a phone. That fixes the
  current page's worst mobile failure.
- **Honest by construction.** Every number is computed, and every feature
  claim passes the capabilities gate. The page cannot drift from the CLI.
- **The whole pipeline matches.** The CLI's gallery uses the same autorun
  skin, slot numbers and loading tips, and `use N` appears on both.

## 9. Weaknesses

- The wall is stills, so only three things on the page move. Visitors must
  click through to see animation.
- Burned-in slot numbers are small: about 7 px tall at 144 px, and smaller
  still on phones.
- The concept's best text (engines, private repos, pick-to-install) depends on
  unbuilt pipeline work. The true-today variant is much weaker: a 62-column
  command and a token tip.
- Desktop shows lots of empty grey to the right of the 34-column booklet
  blocks.
- The CD metaphor is a nostalgia bet: younger visitors may read it as "a
  shiny app window", which still works.
- 62 image files to maintain: all generated, but a real build step.
- The showcase art came from long Claude Opus runs, while a default run will
  be quicker and plainer. The page says so in one `<sub>` line, which takes
  a little shine off.

## 10. Build effort

| Piece | Size | Estimate |
| --- | --- | --- |
| Hero generator `42-pc-06.mjs` (plus the 153 fix in `lib.mjs`) | M | 1 day |
| `art.mjs`: buttons, loading bar, 13 discs | S | 0.5 day |
| `stills.mjs`: wall tiles, text tiles, social card, gallery shot | M | 0.5–1 day |
| Template, `build.mjs` with `--check`, word and width lint, CI job | M | 1 day |
| Autorun skin for the CLI gallery (`hybrid-output.mjs`) | S–M | 0.5–1 day, shared with the pipeline work |
| `bench.mjs` and one timed run per engine | S | 0.5 day |
| **Front page total** | | **about 4 days** |

That total does not include the pipeline it advertises: the npm package,
Claude driver, local mode, parallel authoring with repair, and pick-to-install.
The pipeline report sizes that at roughly M to L across 15 changes. Owner
actions: reconcile `origin/main`, publish to npm, upload the social card, and
reword or drop Dance Vision.
