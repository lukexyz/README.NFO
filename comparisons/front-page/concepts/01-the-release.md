# Concept 01 · THE RELEASE

**One-liner:** the front page is README.NFO's own release NFO, version 0.1.0. A
block-shaded logo glows on a black NFO screen in dark mode and comes off a
dot-matrix printer on green-bar paper in light mode. Under it, the README reads
top to bottom in NFO order: RELEASE INFO, INSTALL NOTES, ENGINE, SAMPLE OUTPUT,
RELEASE CONTENTS, AFTER THE RUN, OPTIONS, CREDITS, `[ EOF ]`. The release
contents are a directory listing in which every file is a real header you can
open: 43 examples on the page (53 once the proof run exists), against 7 today.

Seed angle: 01 "THE RELEASE". Twists added here:

- **Two media, one NFO.** Light mode gets the same NFO as a printout instead of
  a black slab.
- **The listing is the gallery.** RELEASE CONTENTS is an NFO file list.
  Thumbnails sit under it, folder by folder, and each band has a dot-leader
  file list.
- **Truth gates.** A builder renders every claim from repo counts and from what
  the CLI says it can do. The NFO cannot claim a feature before it ships.

Prototype art for this concept is in `concepts/01-the-release/`. It holds the
hero (dark and light), one section bar, renders at 830 px and 343 px, and
measured thumbnail tiles. See the last section.

---

## 1. The page, top to bottom

The README column is about 830 px on desktop and about 310-365 px on phones.
Every `<pre>` and fenced block below is 80 columns or fewer. Wherever a phone
must read a line, the meaning sits in the left 36 columns (§7).

Eight NFO sections, each opened by the same device:

1. A decorative section bar image (`alt=""`). It is a `<picture>` with dark and
   light variants: `░▒▓█▀▀▀…▀▀[ 02/08 ]▀█▓▒░`.
2. A real `##` heading in plain words, so GitHub's Outline menu becomes the NFO
   index: Release info, Install notes, Engine, Sample output, Release contents,
   After the run, Options and notes, Credits and thanks.

`{{…}}` marks a value the builder computes (§4). Values shown are today's.

### 0 · Logo, release line, pitch

```html
<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/front-page/hero-dark.svg">
    <img src="docs/front-page/hero-light.svg" width="100%"
         alt="README.NFO: block-shaded NFO logo over the line RETRO README HEADERS">
  </picture>
</p>

<p align="center">
  <b>Retro headers for your README, drawn fresh for your project.</b><br>
  {{DEFAULT_COUNT=10}} one-off headers from {{STYLES=153}} researched styles,
  drawn by Claude Code or Codex.<br>
  Pick a number and it lands at the top of your README.
</p>

<p align="center">
  <a href="#install-notes">Install</a> ·
  <a href="#engine">Claude or Codex</a> ·
  <a href="#release-contents">Examples</a> ·
  <a href="#after-the-run">After the run</a>
</p>
```

The text twin of the logo (`hero-twin.txt`, 77 columns) is not shown here. It
sits at the very end, folded (§1.8), so phones never get shattered half-blocks
at the top of the page.

### 1 · Release info  `[ 01/08 ]`

A `<pre>` block, so the values can be bold and linked; GitHub keeps `<b>` and
`<a>` inside `<pre>`, as `examples/ultra-satisfactory/01-nfo-release_opus_5.5.md`
already does. There are two columns. The left column holds the must-read facts
in 34 columns or fewer. The right column starts at column 45, so on a phone it
waits off-screen and on desktop it completes the grid.

```text
RELEASE ..... README.NFO 0.1.0              OUTPUT ...... SVG + Markdown
FOR ......... any git repo                  EXAMPLES .... 260 in 8 sets
MAKES ....... 10 headers a run              SVG ......... 128 styles
STYLES ...... 153 in 13 families            TEXT ........ 59 styles
ENGINE ...... Claude Code or Codex          MOTION ...... stills if reduced
PRIVATE ..... works, no token               HOSTS ....... any host, or none
NEEDS ....... Node.js 22+                   LICENCE ..... MIT
```

- The keys are `<b>`.
- `153 in 13 families` links to `styles/INDEX.md`, `260 in 8 sets` to
  `examples/README.md`, and `MIT` to `LICENSE`.
- Every number is a token: 153 and 13 come from `loadCatalogue().distinct`,
  128 and 59 from each style's `medium`, and 260 and 8 from `git ls-files`
  numbered header pages. 10 comes from the CLI default.

### 2 · Install notes  `[ 02/08 ]`

This is the canonical instruction set from the pipeline research, word for
word: three steps and one command.

````markdown
1. Install [Node.js 22+](https://nodejs.org) and sign in to
   [Claude Code](https://claude.com/claude-code) or [Codex](https://developers.openai.com/codex).
2. In your project's folder, run:

   ```sh
   npx readme-nfo
   ```

3. Your gallery opens and fills as headers arrive. Type the number of your
   favourite and README.NFO adds it to the top of your README. Review, then
   commit.

Choose the agent with `--claude` or `--codex`. Private repos just work: it
reads your local folder, and your project facts go only to the agent you pick.
{{TIME_LINE}}
````

`{{TIME_LINE}}` is one measured sentence, for example "A batch of 10 took
about N minutes with Claude and M with Codex in testing". It comes from the
proof run's `manifest.json` (§4.5). Until those numbers exist, the line is left
out; nothing is guessed.

### 3 · Engine  `[ 03/08 ]`

The engine choice and private repos get their own visible section, so nobody
has to read docs to learn that both agents work.

```text
ENGINE SELECT ──────────────────────────
 no flag .... whichever is signed in
 --claude ... Claude Code   (claude -p)
 --codex .... Codex         (codex exec)
 both? ...... asks you once
```

> README.NFO plans the draw, checks every SVG and installs your pick; the
> agent you are already signed in to draws the art. Claude Code runs with no
> tools and Codex in a read-only sandbox, one header per call, so nothing in
> your project changes until you choose.

````markdown
```sh
npx readme-nfo --claude
```

```sh
npx readme-nfo --codex
```

> [!TIP]
> **Private repo? Nothing to set up.** README.NFO reads the folder you run it
> in and never asks GitHub for your code, so private, self-hosted and unpushed
> projects all work. Only the brief (project facts and style notes) leaves
> your machine, and only to the agent you chose.
````

This is the first of the page's two alerts. The two are never consecutive.

### 4 · Sample output  `[ 04/08 ]`

Four live, animated headers from two projects, at 400 x 225 (2 x 2 on desktop,
1 per row on phones). Below each pair, a two-line NFO caption whose ▲ arrows
point at the images above in reading order. That order is the same whether the
pair sits side by side or stacks.

```html
<p align="center">
  <a href="examples/castaway/01-mode7-island_opus_5.5.md"><img
     src="examples/castaway/assets/01-mode7-island_opus_5.5.svg" width="400" height="225"
     alt="CASTAWAY header: island title screen on a rotating sea (animated)"></a>
  <a href="examples/ultra-satisfactory/13-chrome-spheres_opus_5.5.md"><img
     src="examples/ultra-satisfactory/assets/13-chrome-spheres_opus_5.5.svg" width="400" height="225"
     alt="ULTRA-SATISFACTORY header: chrome spheres over a checkerboard (animated)"></a>
</p>
```

```text
 ▲ castaway · island on a rotating sea
 ▲ ultra-satisfactory · mirror spheres
```

The second pair follows the same pattern:

- `castaway/14-off-air`: "test card, island inside"
- `ultra-satisfactory/12-cassette-jcard`: "cassette, J-card"

Then one honest line, with the numbers generated from `examples/build-log.csv`:

> Every example on this page was drawn by an AI coding agent from the same
> style briefs the CLI uses. The castaway/ and ultra-satisfactory/ sets came
> from long, self-critiqued Claude Opus runs (median {{54}} minutes a header;
> see the build log). Your run uses whatever model and effort your agent is set
> to, so expect the same styles, drawn your agent's way.

### 5 · Release contents  `[ 05/08 ]`

This is the heart of the concept. The section opens with a 40-column directory
listing in `<pre>`. Every folder name links to its gallery, and ▼ N says how
many of its headers follow below.

```text
RELEASE CONTENTS             260 headers
────────────────────────────────────────
 castaway/ ............. 116   ▼ 20
 ultra-satisfactory/ ..... 42   ▼ 10
 heretic/ ................ 40   ▼  5
 naturalis-historia/ ...... 5   ▼  1
 gl4ss/ ................... 5   ▼  1
 st3gg/ ................... 5   ▼  1
 readme-nfo/ ............. 41
 dance-vision/ ............ 6
────────────────────────────────────────
 8 projects · all 153 styles drawn
```

Then one band per folder. A band is an `###` heading (the folder name, so the
Outline lists every folder), one line of copy, a wall of linked tiles, and a
closed `<details>` file list:

````markdown
### castaway/

*A ten-hour lo-fi island video.* 116 headers, 20 below ·
[open the gallery](examples/castaway/README.md)

<p align="center">
<a href="examples/castaway/57-synthwave-outrun_opus_5.5.md" title="Sunset, laser grid, chrome"><img
 src="docs/front-page/thumbs/castaway-57.webp" width="150" height="96"
 alt="CASTAWAY header: synthwave sunset (animated)"></a>
<a …65…></a> <a …98…></a> <a …52…></a> … (20 tiles)
</p>

<details><summary>file list · castaway/ · 20</summary>

<pre>
 <a href="…57…">57</a> sunset, grid, chrome ....... <a href="styles/vap.md#vap-05">vap-05</a>
 <a href="…65…">65</a> squiggles and confetti ..... <a href="styles/vap.md#vap-17">vap-17</a>
 <a href="…98…">98</a> pipes spell the title ...... <a href="styles/idle.md#idle-06">idle-06</a>
 …
</pre>
</details>
````

Each tile is a 150 x 96 WebP (rendered at 2x: 300 x 192). It shows the header
letterboxed onto a black NFO mount with a 2 px frame, plus a 12 px label strip
in the same pixel font as the hero, for example `57 ············ VAP-05`.

- Animated sources get a small amber ► in the strip, meaning "open me, I move".
- The number in the strip matches the file list, so a caption never comes
  apart from its picture, even when tiles wrap 2-up on a phone.
- Tiles are 5 across on desktop (766 px) and 2 across on every phone (304 px),
  so bands of 10 and 20 fill even rows on both.

Bands, in order:

1. `castaway/`: 20 tiles (four desktop rows of 5).
2. `ultra-satisfactory/`: 10 tiles.
3. `heretic/`: 5 tiles.
4. **One brief, three projects.** The idle-10 off-air test-card brief, drawn
   for `naturalis-historia`, `gl4ss` and `st3gg`. These are three live
   animated SVGs at 270 x 152 (3 across on desktop, 1 per row on phones; about
   62 KB in total), with a ▲ caption. This band shows that a header is
   composed for its project, not filled into a template.
5. **Proof: made by the command above** (gated, §4.5). Ten headers made by
   running `npx readme-nfo` on this repo, five with `--claude` and five with
   `--codex`. The tile strips read `01 · CLAUDE` and so on, and the file list
   shows the model and seconds from the run's manifest. It also replaces the
   `readme-nfo/` set, whose art still says 152.
6. **Plain text, too.** One sentence ("{{35}} of the 260 are plain text you can
   paste anywhere") and links to `castaway/45-newschool-ascii` and
   `castaway/07-7bit-outline-nfo`. Then `heretic/04-nfo-10`, the 59-column line
   art, sits in a `<details>` as a fenced `text` block.

### 6 · After the run  `[ 06/08 ]`

This covers the whole post-generation journey: choose, install, review, change
your mind, remove.

> Every header lands in the gallery as soon as it is drawn, numbered 1 to 10.
> When the batch is done, the terminal asks which one to install:

```text
 10/10 headers ready · gallery is open

 Install which header?
 [1-10, Enter = later] 3

 + .github/readme-nfo/header.svg
 + .github/readme-nfo/LICENSE
 ~ README.md   header added at the top

 Review with git diff, then commit.
```

> It writes two files and one marked block at the very top of your README.
> Nothing else changes:

```html
<!-- README.NFO header: start -->
<p align="center">
  <img src=".github/readme-nfo/header.svg" width="100%"
       alt="NAME: retro header">
</p>
<!-- README.NFO header: end -->
```

> Prefer another? `npx readme-nfo use 7` swaps it in. Want ten new looks? Run
> `npx readme-nfo` again; styles you have already drawn are skipped. To remove
> it, delete the block and `.github/readme-nfo/`.

```markdown
> [!NOTE]
> README.NFO never commits or pushes. Batches stay in `readme-headers/`, which
> it adds to `.git/info/exclude`, so they never show up in `git status`.
```

Optional, gated on the proof run: a 600 px `docs/front-page/gallery.webp`
screenshot of a real gallery, captioned "what opens in your browser".

### 7 · Options and notes  `[ 07/08 ]`

The full flag list is folded inside `<details><summary><b>OPTIONS</b> · every
flag</summary>`, as an NFO options screen in `<pre>`:

```text
O P T I O N S                   default
──────────────────────────────────────
 -6 -10 -15 ......... how many  ◄ 10 ►
 --claude --codex ... engine  ◄ auto ►
 --model NAME ....... agent's model
 --jobs N ........... at once    ◄ 3 ►
 --format svg|text .. styles   ◄ all ►
 --out DIR .......... batch folder
 --no-open .......... no browser
 --resume DIR ....... finish a batch
 --seed TEXT ........ repeat a draw
 --allow-repeats .... reuse styles
 use N .............. install header N
 github.com/o/r ..... a repo not cloned
──────────────────────────────────────
```

The builder takes these rows from the CLI's own `--help`, so a flag can never
appear here before it exists. Today's real flags are `-N/--count`, `--exclude`,
`--allow-repeats`, `--resume`, `--out`, `--seed`, `--project`, `--format`,
`--no-open` and `--no-color`.

Notes, as plain bullets under the fold:

- **Cost:** your agent's normal plan or API key. README.NFO adds no service.
- **Data:** in your folder, README.NFO makes no network calls of its own. The
  agent you chose is the only party that sees your project facts.
- **Upgrading:** `npx readme-nfo` replaces
  `npx --yes github:lukexyz/README.NFO <url>`. The URL form still works for
  repos you have not cloned.
- **Links:**
  [generation docs](docs/generation.md) ·
  [style catalogue](styles/INDEX.md) ·
  [all galleries](examples/README.md) ·
  [development](docs/development.md) ·
  [musings](MUSINGS.md)

### 8 · Credits and thanks  `[ 08/08 ]`

```text
CREDITS & THANKS ─────────────────────
 made by .... Luke Woods
 research ... 16colo.rs · Demozoo
              Pouet · textfiles.com
 built with . Node.js · Playwright
 art ........ drawn by coding agents
              from researched briefs
 licence .... MIT, artwork included
 ─────────────────────────────[ EOF ]─
```

- The credits name archives and tools only: no scene groups and no greets
  list.
- After the credits comes the final bar: a `<picture>` EOF bar that reads
  `░▒▓█▀▀▀▀▀[ EOF ]▀▀▀▀▀█▓▒░`.
- The last line is
  `<details><summary>the logo as plain text</summary>` with
  `docs/front-page/hero-twin.txt` fenced as `text`. Purists can copy the NFO;
  phones only meet it if they ask.

---

## 2. The hero and its animation

The prototype files are `concepts/01-the-release/hero-dark.svg` (38.8 KB) and
`hero-light.svg` (34.6 KB), built by `gen-hero.mjs`.

**Grid.** The canvas is 960 x 360, which is 80 x 15 CP437 cells of 12 x 24 px.

- The logo is a 67 x 6 cell half-block wordmark. Its glyph art is written in
  the script as `█ ▀ ▄` strings, and the same grid prints as the 77-column text
  twin.
- Full and half cells merge into one `<path>`, so there are no anti-aliasing
  seams at any scale.
- `░▒▓` are real 2 px dot patterns (`<pattern>`): 25, 50 and 75 % ink, as the
  CP437 glyphs look at 8 x 16.
- There is no `<text>` element, no font and no external reference. Counts in
  the status line (`153 STYLES · 13 FAMILIES · MIT`) are drawn with a built-in
  5 x 7 pixel font from `loadCatalogue()`.

**Layout.**

- Top: a dim status line (`README.NFO` on the left, counts on the right) and a
  hairline rule.
- Middle: `▄▄▄` caps and `█▓▒░` side fades thinning towards the floor.
- Bottom: a `░▒▓` floor bar under the letters, then
  `R E T R O   R E A D M E   H E A D E R S` in spaced caps.
- A small amber `V0.1.0` tag sits over the last letter, where an artist tag
  would sit. It holds a version, not a name.

**Dark variant (NFO viewer):** white-to-steel-blue logo on `#07080b`. One
effect and one moving accent, all CSS keyframes:

1. **Glint:** a skewed white band sweeps across the letters in 2.3 s, then
   rests for 6.7 s (9 s loop), clipped to the logo path.
2. **Shade wave:** a `▒▓█▓▒` pulse travels along the `░` floor bar. It is one
   `translateX` of a repeating 24-cell strip, seamless on a 6 s loop.
3. **Cursor:** an amber block after `V0.1.0` blinks once per 1.2 s, well under
   3 flashes a second.

**Light variant (printout):** the same NFO in ink on cream paper, with faint
green bars every two rows, tractor-feed holes and perforations at both edges.
On load it prints once: a `steps(15)` clip reveal that drops line by line in
2 s, with a grey print-head bar riding the edge. Then it stays still.

**Reduced motion:** `@media (prefers-reduced-motion: reduce)` removes the
glint, parks the wave at half a period and stops the cursor (dark). In light
mode it shows the fully printed page with no head. Both stills are composed
frames, not frozen first frames (see `shots/*-reduced-*.png`).

**Phones:** at 343 px the logo is about 50 px tall and reads cleanly, and the
spaced-caps line is about 7 px (see `shots/hero-phone-*.png`). The status line
becomes texture, which is fine: everything in it is repeated in RELEASE INFO
as text.

**Social preview:** a 1280 x 640 PNG of the dark hero on a black field, with
the FILE_ID.DIZ card underneath, under 1 MB. The owner uploads it in repo
settings.

```text
┌───────────────────────────────────────────┐
│            R E A D M E . N F O            │
│     retro headers for your README.md      │
│   153 styles · Claude Code or Codex · MIT │
│              npx readme-nfo               │
└───────────────────────────────────────────┘
```

The DIZ card (45 x 6, under the 45 x 10 limit) is also the source for the
GitHub About text.

---

## 3. The examples wall: files used

All picks are committed (`git ls-files`) and were checked against a piracy
vocabulary scan of the linked `.md` page and its generator. The scan covered
`crack*` (not "crackle"), keygen, serial, warez, protection, nuke, "supplied
by", pirate and swapper.

Picks deliberately avoided:

- **ULTRA pages with a "protection: none" joke:** 07, 09, 14, 16-25, 28, 30,
  34, 36 and 37.
- **dance-vision/02:** its filename and page say cracktro and "cracked by".
- **castaway/99-3d-maze:** "supplied by".
- **castaway/115:** "swapper".
- **readme-nfo/*:** the art says 152.
- **MediaLog sets:** untracked.

Captions are neutral; no catalogue style names appear on the page.

**Sample output (live SVG, 400 x 225):**

| # | Header page | Style | Caption | KB |
| --- | --- | --- | --- | ---: |
| F1 | `examples/castaway/01-mode7-island_opus_5.5.md` | mach-15 | island on a rotating sea | 71.9 |
| F2 | `examples/ultra-satisfactory/13-chrome-spheres_opus_5.5.md` | pc-03 | mirror spheres | 109.1 |
| F3 | `examples/castaway/14-off-air_opus_5.5.md` | idle-10 | test card, island inside | 82.5 |
| F4 | `examples/ultra-satisfactory/12-cassette-jcard_opus_5.5.md` | print-02 | cassette, J-card | 113.6 |

**`castaway/` band (20 WebP tiles, from `examples/castaway/assets/<slug>.svg`):**

| Tile | Style | Caption | Tile | Style | Caption |
| --- | --- | --- | --- | --- | --- |
| 57-synthwave-outrun | vap-05 | sunset, grid, chrome | 36-st-menu-disk | c64-13 | numbered menu disk |
| 65-memphis | vap-17 | squiggles and confetti | 95-light-synth | idle-02 | mirrored light trails |
| 98-3d-pipes | idle-06 | pipes spell the title | 87-file-system-landscape | hack-16 | folders as a city |
| 52-teletext-page | ansi-08 | teletext, mosaic island | 88-tone-pad | hack-17 | keypad and scopes |
| 35-hand-pixelled-chrome-logo | c64-12 | hand-pixelled chrome | 73-vfd-front-panel | mach-12 | glowing hi-fi panel |
| 09-pinball-dmd | mach-11 | pinball dot-matrix | 60-one-bit-desktop | vap-11 | 1-bit desktop |
| 56-vhs-tape | vap-03 | camcorder tape | 58-city-pop-sleeve | vap-06 | record sleeve |
| 24-skinned-installer | pc-06 | chrome installer window | 113-atari-8-bit-demo | demo-09 | raster-ramp demo |
| 30-petscii-picture | c64-03 | 40-column island | 26-vector-objects | pc-13 | glass crystal |
| 50-door-game-screen | ansi-06 | BBS door game | 70-handheld-boot-logo | mach-07 | handheld boot screen |

**`ultra-satisfactory/` band (10 WebP tiles):**

| Tile | Style | Caption |
| --- | --- | --- |
| 42-aero-gloss | vap-10 | glossy aqua window |
| 41-attribute-grid-demo | demo-08 | attribute-grid demo |
| 10-arcade-attract | mach-08 | arcade attract screen |
| 26-vaporwave | vap-01 | marble bust, pink grid |
| 27-signalwave-forecast | vap-04 | factory weather report |
| 31-type-in-listing | print-03 | magazine type-in |
| 33-sysop-dashboard | xfer-08 | sysop dashboard |
| 40-power-on-self-test | mach-04 | power-on self-test |
| 38-piano-roll | trk-10 | piano roll |
| 35-terminal-session | xfer-05 | terminal session |

**`heretic/` band (5 WebP tiles):**

- `09-pc-12`: neon cube field
- `15-demo-10`: fat-pixel title
- `03-nfo-02`: shaded block NFO
- `13-demo-08`: attribute-grid colour
- `16-mach-09`: pixel quest title

Heretic SVGs use one `<text>` element each, so their thumbnails freeze the
Chromium fallback font.

**One brief, three projects (live SVG, 270 x 152, idle-10):**

- `examples/naturalis-historia/01-off-air.md`
- `examples/gl4ss/01-off-air.md`
- `examples/st3gg/01-off-air.md`

**Plain text:**

- `examples/heretic/04-nfo-10.md` (shown, in `<details>`)
- `examples/castaway/45-newschool-ascii_opus_5.5.md` (linked)
- `examples/castaway/07-7bit-outline-nfo_opus_5.5.md` (linked)

**Proof band (gated):** `examples/readme-nfo-run/01..10`, made by the shipped
CLI on this repo.

**Counted:** 4 + 20 + 10 + 5 + 3 live or tiled headers, plus 1 text header
shown, makes 43 on the page and 2 more linked. That becomes 53 with the proof
band. It spans 12 of the 13 families (asia is the only one missing; adding
`castaway/90-pc-98-adventure-screen` as a 21st Castaway tile closes it) and 5
projects plus README.NFO itself.

**Weight (measured or summed from file sizes):**

| Part | Weight |
| --- | ---: |
| Hero (one variant loads) | 39 KB |
| 9 bars | 32 KB |
| Sample output | 377 KB |
| One-brief trio | 62 KB |
| 35 WebP tiles (measured average 12.3 KB) | 430 KB |
| **Total** | **about 0.94 MB** |
| Proof band (later) | about 120 KB more |

Only 8 animations run at once: the hero, 4 sample headers and 3 off-air
headers. Today's page loads 441.5 KB for 7 images.

---

## 4. New assets and the scripts that make them

All of these are deterministic Node scripts, following the existing
`tools/build-shortlist.mjs` pattern. The proposed paths are for the
implementing session; this concept session wrote only inside
`comparisons/front-page/`.

1. **`tools/front-page/art.mjs`** (grows from the prototype `gen-hero.mjs`).
   It writes:
   - `docs/front-page/hero-{dark,light}.svg`
   - `bar-01..08-{dark,light}.svg` and `bar-eof-{dark,light}.svg` (about 3.6
     KB each)
   - `hero-twin.txt`
   - `social.png` (1280 x 640)

   The logo and the 5 x 7 font live in `tools/front-page/font.mjs`. Counts come
   from `loadCatalogue()`. There is no clock and no randomness.
2. **`tools/front-page/thumbs.mjs`.** Playwright opens each SVG, pauses every
   animation at a fixed frame, then composes the 300 x 192 mount and label
   strip and encodes WebP at quality 86.
   - The pause uses `document.getAnimations()` with `currentTime`, plus
     `pauseAnimations()` and `setCurrentTime()` for SMIL.
   - The default frame is t = 3 s; any pick can override it with `frame`.
   - The label strip is drawn from the shared pixel font, not a system font.
   - It writes `docs/front-page/thumbs/<set>-<nn>.webp`.
   - A `thumbs.lock.json` records each source SVG's hash, so a tile is
     re-rendered only when its source changes.
   - It also runs in pick-everything mode to build gallery contact sheets.
3. **`docs/front-page/picks.json`.** Bands, each pick's set and slug, a neutral
   caption, style id, frame, and `requires` (for example `proof-run`). This is
   the only file a curator edits.
4. **`tools/build-front-page.mjs`** with `docs/front-page/README.template.md`.
   It renders `README.md` and refuses to write if a check fails:
   - **Facts:** styles, families, SVG and text counts, and samples from
     `loadCatalogue()` and `sampleFor()`. Committed headers per set come from
     `git ls-files`, and text-only headers from the pages. The median build
     minutes come from `examples/build-log.csv`.
   - **Truth gates:** see §4.1.
   - **Links:** every link and image must exist and be tracked
     (`git ls-files --error-unmatch`). Nothing may link to `*.html`.
   - **Lint:**
     - code and `<pre>` blocks are 80 columns or fewer;
     - lines marked must-read are 36 columns or fewer;
     - text blocks use only CP437/WGL4-safe glyphs (no ◆ ✓ ★ ▶ ◀);
     - alt text is under 100 characters and contains no catalogue names;
     - a deny-list of real group names (seeded from the 7 catalogue names the
       research flagged) and the piracy vocabulary applies to the README and
       every linked header page;
     - every animated SVG has a reduced-motion rule;
     - the README stays under 500 KiB and the image weight under 1.5 MB.
   - **Wiring:** `npm run front-page` runs it, and
     `npm run front-page -- --check` in CI fails when `README.md` is stale.
5. **The proof run (owner).** Run `npx readme-nfo -5 --claude` and
   `npx readme-nfo -5 --codex` on this repo, then commit the batches as
   `examples/readme-nfo-run/` with their `manifest.json`. These supply the proof
   band, `{{TIME_LINE}}`, and `gallery.webp`.
6. **Optional, phase 2: "your release NFO".** The CLI's gallery
   (`hybrid-output.mjs`) adopts the same skin. The user's project name is set
   in the same half-block font, with a RELEASE INFO grid of their project
   facts and the cards laid out as release contents. The front page is README.NFO's NFO;
   the gallery becomes yours. `font.mjs` would need A-Z, 0-9 and `- _ .`.

### 4.1 Truth gates

The CLI exports `CAPABILITIES`, for example
`['claude', 'local', 'use', 'live-gallery', 'jobs']`, and tests keep that list
honest. The builder renders a target line only when its capability is present.
Otherwise it renders the interim line, which is true today on a reconciled
`main`:

| Line | Gate | Interim text |
| --- | --- | --- |
| `npx readme-nfo` | `package.json` name `readme-nfo`, published | `npx --yes github:lukexyz/README.NFO github.com/you/project -10` |
| "sign in to Claude Code or Codex", ENGINE section | `claude` | "sign in to Codex (Claude Code support is in progress)"; ENGINE shows `today ... Codex, signed in` / `next ... Claude Code (in progress)` |
| "In your project's folder", PRIVATE "works, no token", HOSTS | `local` | "Run this with your repo's URL"; PRIVATE `set GH_TOKEN first`; TIP: `export GH_TOKEN=$(gh auth token)` (bash) or `$env:GH_TOKEN = gh auth token` (PowerShell) |
| Step 3 "adds it to the top", AFTER THE RUN | `use` | "Copy your favourite's SVG into your repo and paste its Markdown"; the section shows the copy steps instead |
| "fills as headers arrive" | `live-gallery` | "opens when the batch is done" |
| NEEDS | (computed) | `Node.js 22+, Git, Codex` |

Before either variant ships, the owner must reconcile the web-edited
`origin/main` (8a03d5a) with the local branch. Otherwise `npx github:` installs
a CLI that the page does not describe.

---

## 5. The journey

1. **Discover.** The hero shows the product, since it is a header. The pitch
   says what it is in one sentence, and the nav line jumps to Install or
   Examples.
2. **Decide (10 s).** The RELEASE INFO left column answers the four questions
   people actually have: what it needs, which agent, whether private repos
   work, and the licence. On a phone that column fits without scrolling.
3. **Run.** In the project folder, run `npx readme-nfo`. The CLI then:
   - reads facts from disk;
   - picks the signed-in agent, or asks once if both are signed in;
   - draws 10 distinct styles;
   - authors 3 at a time, with one automatic repair retry;
   - opens the gallery at once and refreshes it as headers land.
4. **Choose.** The gallery numbers cards 1-10, and each card carries
   `npx readme-nfo use N`. The terminal asks `Install which header?`. Enter
   means later.
5. **Install.** README.NFO writes `.github/readme-nfo/header.svg` and the MIT
   `LICENSE`, then adds or replaces the marked block at the top of the README.
   The alt text is neutral. It keeps the README's line endings and BOM, and
   never commits.
6. **Review and commit.** `git diff` shows exactly one block and two files.
7. **Iterate.** `use 7` swaps the header. Running again draws 10 unseen styles.
   `readme-headers/` stays out of `git status`.
8. **Remove.** Delete the marked block and `.github/readme-nfo/`.
9. **Come back.** The front page has 43 to 53 examples to browse. Every tile
   opens a header page with its full art and copy-ready Markdown, and every
   folder links to its whole gallery.

---

## 6. GitHub feasibility and risks

**Works within the sanitizer:**

- `<picture>` with `prefers-color-scheme` (documented by GitHub, GA 2022);
- `<p align>`, `<a href title>`, `<img width height alt>`, `<details>` and
  `<summary>`;
- `<pre>` with `<b>` and `<a>`;
- fenced `sh` blocks with copy buttons;
- two alerts;
- `###` headings for the Outline menu.

**Images:** SVG animation runs through `<img>`. The page's own generated art
uses CSS keyframes only (no SMIL), so the reduced-motion media query really
stops everything; every linked example SVG already carries its own
reduced-motion rule. There are no
scripts, no external references and no `<text>`. WebP renders in every current
browser.

**Risks and mitigations:**

1. **Most of the copy describes pipeline work that is not built yet** (npm
   name, Claude driver, local mode, `use`, live gallery). Mitigation: the
   truth gates and interim variants above, so the page can ship before the
   pipeline without lying. The cost is that the interim page is visibly less
   magical.
2. **`<a>`/`<b>` inside `<pre>`** is relied on for the grids. It is proven by
   the committed ULTRA page, but the render should be checked once through
   `tools/render.mjs` on the API path.
3. **`title` on `<a>`** is in the allowlist but unverified on github.com. It is
   a nicety only, because the label strip and file lists carry the names.
4. **The `<picture>` theme follows the GitHub theme**, not the OS. Test with
   the GitHub theme set opposite to the OS. If a mismatch shows, each variant
   is still self-contained (opaque plate), so it only looks off-theme, never
   broken.
5. **The one-shot print animation in light mode** shows blank paper for under
   2 s on first paint. Mitigations: rows print immediately at steps(15), and
   reduced motion shows the finished page. If it reads as "loading", drop the
   print and keep the still printout.
6. **Static tiles hide the motion.** This is deliberate for weight and CPU.
   The amber ► marks the animated ones, and the 4 sample headers plus the
   off-air trio show that the art moves. An "animated wall" toggle would cost
   about 4 MB.
7. **Example quality versus CLI quality.** The showcase came from long Claude
   Opus runs. The honest line under Sample output and the proof band set the
   expectation from real CLI output.
8. **Linked pages are only as clean as their copy.** The vocabulary lint
   blocks bad picks, but some generators in `src/` carry research comments
   that name real groups. For example, `examples/ultra-satisfactory/src/13-chrome-spheres_opus_5.5.mjs`
   has a comment naming a real group. A header page that links its generator
   leads there. This needs a separate clean-up pass on the galleries.
9. **Thumbnail determinism** depends on a pinned Playwright/Chromium.
   Mitigation: tiles are committed artefacts, only re-rendered when a source
   hash changes.
10. **Page length** is about 4,000 px on desktop and about 6,300 px on phones
    (estimated). That is similar to today's 6,870 px mobile page, but it now
    carries 6x the examples and real instructions; the 62 % table is gone.

---

## 7. Mobile and dark mode

**Phones (343 px column, about 34-41 code columns visible):**

- **Hero:** scales to about 143 px tall, and the logo stays crisp (one path,
  no seams).
- **Pitch and nav:** normal wrapping text.
- **Section bars:** become 12 px ornaments.
- **RELEASE INFO:** the left column fits in 34 columns and the right column
  waits off-screen, which reads like an NFO viewer with more to the right.
- **Install notes:** a Markdown list that wraps. The command block is 14
  characters, so it never scrolls.
- **ENGINE block:** 40 columns or fewer. The two commands are 23 characters
  each.
- **Sample output:** 1 per row (400 shrinks to the column). The ▲ captions
  follow in the same order.
- **Tiles:** 2 per row on every phone. The label strip keeps the number with
  the picture.
- **Directory listing, file lists, AFTER THE RUN transcript, OPTIONS and
  CREDITS:** all 40 columns or fewer. Only the RELEASE INFO right column, the
  marked HTML block (55 columns) and the folded logo twin (77 columns) scroll
  sideways, and none of them is needed to act.

**Dark mode:** a black NFO screen with an ice-blue logo, a glint and a shade
wave. Bars, tile mounts and the hero share `#07080b`, so the page reads as one
long NFO in an NFO viewer, broken only by GitHub's own text.

**Light mode:** the NFO becomes a printout.

- The hero and bars switch to their paper variants: cream, green-bar, ink and
  tractor holes.
- Text blocks sit on GitHub's `#f6f8fa` code grey, like a monospace printout.
- Tiles keep their black mounts on purpose: they read as mounted screenshots on
  paper, a consistent frame rather than random black slabs.
- No single-colour transparent art appears anywhere, so nothing vanishes in
  either theme.

---

## 8. Why it is cool

- It is the most literal answer to the brief. The README *is* a 2000s release
  NFO: logo, release line, dot-leader grid, install notes, contents, credits,
  `[ EOF ]`. Yet every NFO device does a real job. The release grid answers
  the FAQ, the install notes are the actual steps, the contents listing is the
  gallery index, and the options screen is the flag list.
- Light mode becomes a feature: the same NFO as a dot-matrix printout. Most
  retro READMEs look broken on white.
- The NFO cannot lie. Every number is computed and every feature line is gated
  on the CLI's declared capabilities. On a page full of counts, that is the
  difference between charm and embarrassment.
- It has 6x more examples at about 2x today's weight. Static mounted tiles
  with numbered strips make 2-up phone rows that never lose their captions,
  and the four live sample headers plus the "one brief, three projects" trio
  show that the art moves and is bespoke.
- It shows the whole journey after generation (prompt, files, the exact
  marked block, swap, remove). Copy that says "never commits" earns trust.
- Restraint reads as craft: one hero, one effect, one accent, strict columns,
  and real headings feeding GitHub's Outline as the NFO index.
- It scales: the phase-2 gallery skin turns every user's batch into their own
  release NFO.

## 9. Weaknesses

- It is calmer than the cracktro, attract-mode and character-select angles.
  Apart from the hero and 7 live headers, the wall is static. Some visitors
  want the whole page to move.
- GitHub's sans-serif headings and prose break the monospace illusion between
  NFO blocks. That cannot be avoided without moving text into images.
- The two-column RELEASE INFO grid shows only its left half on phones.
- Castaway dominates the wall (20 of 35 tiles), because it is the biggest and
  cleanest committed set.
- The hero is hand-built by a script, not output of the tool. The proof band
  carries the "made by the command" story instead.
- Much of the best copy waits on pipeline work. The interim page needs Git
  and Codex, needs a token for private repos and uses a 62-column command.
- Static WebP tiles are one more generated artefact class (Playwright,
  locks) to maintain.

## 10. Build effort

| Part | Size |
| --- | --- |
| Hero, bars and twin: prototype done; finish and move into `tools/front-page/art.mjs` | S |
| Thumbnail builder with frame pausing, mounts and lock file | S-M |
| `picks.json`, template and `build-front-page.mjs` with facts, gates and lint | M |
| Proof run and `gallery.webp` (owner, after the CLI ships) | S |
| Phase-2 gallery skin in the CLI | M |
| **Concept-specific total** | **about 2-3 days** |

The shared pipeline work from the research (npm name, `agents.mjs`, local
mode, `use N`, live gallery, Windows `.cmd` fix, `samples.json`) is a
prerequisite for the target copy under every concept, not extra cost here.

---

## 11. Prototype files (this folder)

`comparisons/front-page/concepts/01-the-release/`:

- **`gen-hero.mjs`:** run with
  `node comparisons/front-page/concepts/01-the-release/gen-hero.mjs`. It
  writes:
  - `hero-dark.svg` (38.8 KB) and `hero-light.svg` (34.6 KB);
  - `bar-02-dark.svg` and `bar-02-light.svg` (3.6 KB each);
  - `hero-twin.txt` (77 columns).
- **`shots/`:** Playwright renders.
  - `hero-desktop-{dark,light}-t{500,2200}.png` and
    `hero-phone-{dark,light}-t{500,2200}.png`;
  - `*-reduced-t300.png` for the reduced-motion stills;
  - `stack-{dark,light}-{830,343}.png`: hero, pitch, section bar and heading
    stacked as on the page.
- **`thumbs-test/`:** six real tiles at 300 x 192 in PNG, WebP and JPEG, plus
  `_sheet.png`. Measured averages: PNG 39.8 KB, WebP 12.3 KB, JPEG 17.4 KB.
