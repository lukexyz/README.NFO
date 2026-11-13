# 09 · ONE TAKE: the demo-reel terminal

> **One line.** The page opens on a real recording of `npx readme-nfo`: a 40-second loop shown on a
> 44-column pixel monitor sitting on a tape deck. It runs the whole pipeline in one uncut take
> (run, read, agent, draw, author, gallery, install). Below it come three short steps, a cue sheet,
> a 110-frame contact-sheet wall of real headers and a 36-column NFO colophon that fits a phone.

Seed angle: 09 "DEMO REEL TERMINAL". The twist that keeps it apart from the other nine angles:

- **It is a recording, not a mock-up.** The hero is rendered from the CLI's own terminal renderer
  (`tools/generator/terminal.mjs`), replaying a timestamped event log from a real run. The real clock
  shows on the deck, so the page never fakes speed.
- **Demo-reel grammar carries the whole page:**
  - REC timecode, chapter lamps and a fast-forward badge on the hero;
  - a cue sheet in place of a "how it works" essay;
  - numbered reels of contact-sheet frames for the gallery;
  - a colophon in place of greets.
- **It stays minimal.** One thing moves on the whole page (the tape). Everything else is a still,
  plain text or a heading. That is the restraint that reads as "sick" rather than "cringe".

Companion files (all in `comparisons/front-page/concepts/`):

| File | What it is |
| --- | --- |
| `09-one-take.wall.json` | The wall plan: 10 reels × 10 frames. Each frame has its file, frame number, size, short alt text and caption. |
| `09-one-take/wall/011.jpg` … `110.jpg` | Prototype stills of all 100 archive frames: 300 × 168 JPEG, quality 80. Total 1,498 KB, mean 15.0 KB, max 24.8 KB. |
| `09-one-take/mock-wall-desktop-light.png`, `mock-wall-mobile-light.png` | Reels 01–04 laid out the way GitHub lays out inline images, at 830 px and at a 311 px phone column. |
| `09-one-take/mock-colophon-phone-{light,dark}.png` | The colophon in GitHub's own CSS at a 375 px phone viewport. It shows 0 px of sideways overflow. |
| `09-one-take/proto/*.mjs` | Throwaway prototypes: `tiles.mjs` renders the stills, `wallmock.mjs` lays out the wall, `scenes.mjs` width-checks the hero scenes and `logo.mjs` builds the half-block lettering. |

---

## 0. Honesty gate (read first)

ONE TAKE shows the **target** pipeline from `research/pipeline.md`:

- `npx readme-nfo` run inside your folder;
- Claude Code or Codex;
- local facts, so no token;
- 3 headers at a time;
- a live gallery;
- pick-and-install.

None of that ships today. The concept is built so that it can never get ahead of the code:

1. The tape is **recorded**, not drawn. If the CLI cannot do something yet, it cannot appear on the
   tape, because the reel builder only replays events the real CLI emitted.
2. Every number on the page comes from a file:
   - the catalogue, through `loadCatalogue()`;
   - `git ls-files`;
   - `examples/build-log.csv`;
   - the tape's `run.jsonl`.
3. **Phase 0 (ship-today variant).** The same page, but:
   - the hero is a tape recorded from **today's** CLI (Codex, `-4`, one at a time: 2 min 31 s for
     one header in the 2026-11-11 trial with the user's default model, 6 min 18 s at xhigh in
     October);
   - Run it uses the true-today command, steps and `GH_TOKEN` tip (section 2.3b);
   - colophon AGENTS reads `Codex`.

   Phase 0 needs only the small `--record` flag (section 5). When `readme-nfo@0.1.0` ships, re-record
   with one command and the page flips to the target text.

Clock values shown below (`0:03`, `14:06` and so on) are **illustrative placeholders** until the run
is recorded. The build fills them from `run.jsonl`.

---

## 1. The page at a glance

```text
┌──────────────────────────────────────────────┐
│ HERO  TAPE 01 · 44-col pixel monitor on deck │  one animated SVG,
│       RUN READ AGENT DRAW AUTHOR GALLERY INST│  <picture> light/dark
├──────────────────────────────────────────────┤
│ # README.NFO   + two-line pitch              │
│ ## ► Run it    npx readme-nfo  (copy button) │
│                3 steps · agent line · TIP    │
│   ### Cue sheet   36-col text block          │
│   ▸ Options        (details)                 │
│   ▸ What it changes in your repo (details)   │
│ ## ► The wall  110 frames, 7 projects        │
│   REEL 00 FROM THE TAPE   10 stills          │
│   REEL 01–05              50 stills          │
│   ▸ 5 more reels          50 stills (details)│
│   ▸ Frame index           110 names (details)│
│ ## ► Colophon  36-col NFO block · links      │
└──────────────────────────────────────────────┘
```

---

## 2. Wireframe, section by section (the README in order)

Everything below is the README as it will be written: target text, Phase 1 (after 0.1.0).
`{{NAME}}` marks a value `build-readme.mjs` computes. The values shown next to the markers are
today's numbers.

### 2.1 Hero: TAPE 01

````markdown
<p align="center">
  <a href="examples/readme-nfo-tape/README.md">
    <picture>
      <source media="(prefers-color-scheme: dark)"
              srcset="assets/front-page/tape-dark.svg">
      <img src="assets/front-page/tape-light.svg" width="100%"
           alt="Tape 01: npx readme-nfo runs in this repository, picks
           Claude Code, draws 10 styles, authors three at a time, opens
           the gallery and installs header 4 into the README">
    </picture>
  </a>
</p>
<p align="center"><sub>TAPE 01 · a real run of <code>npx readme-nfo</code>
in this repo with {{TAPE_AGENT}} · {{TAPE_COUNT}} headers in {{TAPE_MIN}} min,
fast-forwarded while authoring · recorded {{TAPE_DATE}} ·
<a href="examples/readme-nfo-tape/README.md">see what it made</a></sub></p>
````

The hero links to the tape's own batch, so a visitor can open the ten headers they just watched land.
See section 3 for the animation.

### 2.2 Title and pitch

````markdown
# README.NFO

**Retro headers for your README, drawn fresh for your project by Claude Code
or Codex.** {{STYLES}} styles in {{FAMILIES}} families: NFO block logos, ANSI
and teletext, 16-bit intros, demos, trackers, screensavers, Y2K desktops and
more.
````

- The values are 153 and 13.
- It is a real H1, so GitHub's Outline and search see the project name.
- The pitch avoids "cracktro" and "keygen". The art can reference those styles, but the copy never
  does.

### 2.3 ► Run it (target, Phase 1)

````markdown
## ► Run it

```sh
npx readme-nfo
```

1. Sign in to **Claude Code** or **Codex**. Have **Node.js 22+**.
2. Run that line in your project's folder.
3. Type the number you like. It goes on top of your README.

It uses whichever agent you are signed in to, and asks if you have both.
Force one with `--claude` or `--codex`.

> [!TIP]
> **Private repo? Nothing to set up.** README.NFO reads the folder on your
> disk, not GitHub, and sends your project's facts only to the agent you pick.
````

- The command block is alone, with no `$` and no comment, so GitHub's copy button gives a runnable
  line. At 14 columns it never scrolls on a phone.
- Each step is under 60 characters and wraps naturally, because it is prose, not a code block.
- **The engine choice is visible** in three places:
  - the agent sentence;
  - the AGENT chapter of the tape, which shows both agents signed in and the `[1] Claude [2] Codex`
    prompt;
  - the AGENTS row in the colophon.
- **Private repos are visible** in two places: the one TIP alert, and the tape's READ line,
  `local files only · no token`. The page uses only this one alert, following GitHub's guidance of
  one or two per page.

### 2.3b ► Run it (Phase 0: true today)

````markdown
## ► Run it

```sh
npx --yes github:lukexyz/README.NFO github.com/you/project -4
```

1. Have **Node.js 22+**, **Git** and a signed-in **Codex** CLI.
2. Swap in your repo's URL, then run the line above.
3. When the gallery opens, copy a header's SVG into `assets/` and paste
   its Markdown at the top of your README.

Claude Code support, local folders and one-step install are coming in 0.1.0.

> [!TIP]
> **Private repo?** Give it your GitHub sign-in first. In bash:
> `export GH_TOKEN=$(gh auth token)`. In PowerShell:
> `$env:GH_TOKEN = gh auth token`.
````

On a phone the 62-column command scrolls sideways. That is a known Phase 0 cost, and it goes away
with `npx readme-nfo`.

### 2.4 Cue sheet (h3, open)

The pipeline at a glance, keyed to the tape's real clock. It is a 36-column text block, so it fits
a phone untouched (section 8). The `REC` values come from `run.jsonl`.

````markdown
### Cue sheet

```text
 REC   SCENE    WHAT HAPPENS
 ──────────────────────────────────
 0:00  RUN      npx readme-nfo
 0:01  READ     local, no token
 0:02  AGENT    Claude Code or Codex
 0:03  DRAW     10 of 153 styles
 0:03  AUTHOR   3 at a time
 1:10  GALLERY  opens, fills live
14:06  PICK     type its number
14:08  INSTALL  top of your README
```

Times are from Tape 01 ({{TAPE_AGENT}}, {{TAPE_MODEL}}). Yours depend on
the agent and model you use. Run it again any time: a new draw never
repeats a style you have already drawn.
````

### 2.5 Options and "what it changes" (two closed `<details>`)

````markdown
<details><summary><b>Options</b></summary>

```text
 OPTIONS
 ──────────────────────────────────
 -6 .......... headers (default 10)
 --claude .... use Claude Code
 --codex ..... use Codex
 --model M ... pick the model
 --jobs 1 .... one at a time
 use 4 ....... install #4 later
 <repo url> .. a repo you have not
               cloned (uses gh)
```

</details>

<details><summary><b>What it changes in your repo</b></summary>

```text
 AFTER  npx readme-nfo use 4
 ──────────────────────────────────
 README.md ............ +5 lines
 .github/readme-nfo/header.svg
 .github/readme-nfo/LICENSE
 readme-headers/ ...... not tracked
 nothing is committed for you
```

The header sits between `<!-- README.NFO header: start -->` and
`<!-- README.NFO header: end -->`, so `use` can swap it later. Review with
`git diff`, then commit.

</details>
````

These are diegetic, NFO-style "options screen" and "install notes" blocks. Every row is a real flag
or a real file from the target pipeline, and every block is 36 columns or narrower.

### 2.6 ► The wall

````markdown
## ► The wall

**{{FRAMES}} frames from {{PROJECTS}} projects, each drawn for its project.**
Click a frame for the full header, its Markdown and the generator that drew it.

<p align="center"><sub>REEL 00 · FROM THE TAPE · made by the run above</sub></p>
<p align="center">
<a href="examples/readme-nfo-tape/01-….md"><img
 src="assets/front-page/wall/001.jpg" width="150" height="84"
 alt="README.NFO header: … (animated)"></a>
… nine more, one per line …
</p>

<p align="center"><sub>REEL 01 · TITLE SCREENS</sub></p>
<p align="center"> … frames 011–020 … </p>
… reels 02–05 the same …

<details><summary><b>► 5 more reels</b> · 50 frames: trackers, desktops,
screensavers, terminals, paper</summary>
… reels 06–10 the same …
</details>

<details><summary>Frame index</summary>

`011` CASTAWAY · island title screen on a rotating sea<br>
`012` CASTAWAY · orange pinball dot-matrix loop<br>
… one line per frame, generated from wall.json …
</details>

[All {{SETS}} galleries](examples/README.md) ·
[{{STYLES}} styles](styles/INDEX.md) · [Twelve picks](examples/START-HERE.md)

<sub>Reels 01–10 come from the example galleries. Most are from Castaway and
ULTRA-SATISFACTORY, whose {{OPUS_HEADERS}} headers were authored by Claude
Opus in long, reviewed runs, about {{OPUS_MEDIAN_MIN}} minutes a header (build
log). A CLI run uses your agent's settings: faster, and rougher.</sub>
````

- The values are 110, 7 and 8.
- `OPUS_HEADERS` is 158. In `examples/build-log.csv`, all 158 committed Castaway and
  ULTRA-SATISFACTORY rows are `claude-opus-5-5`, effort xhigh.
- `OPUS_MEDIAN_MIN` is 53, the median `total_min` of 52.9.
- That provenance line keeps the page honest: the archive is a showcase of the catalogue, and the
  tape is what the CLI does.

### 2.7 ► Colophon

````markdown
## ► Colophon

```text
██▄ ██ ██▀▀▀ ▄█▀▀█▄  README.NFO
██▀███ ██▄▄  ██  ██  retro headers
██  ██ ██    ██  ██  for READMEs
██  ██ ██    ▀█▄▄█▀  by Luke Woods
────────────────────────────────────
 STYLES ......... 153 in 13 families
 SVG / TEXT ..... 128 / 59
 EXAMPLES ....... 260 in 8 galleries
 AGENTS ......... Claude Code, Codex
 NEEDS .......... Node.js 22+
 LICENCE ........ MIT
 LAST TAPE ...... 10 headers, 14 min
────────────────────────────────────
 THANKS  16colo.rs · Demozoo · Pouet
         textfiles.com · Playwright
─────────────────────────────[ EOF ]
```

[MIT licence](LICENSE) · [How it works](docs/generation.md) ·
[Development](docs/development.md) · [Musings](MUSINGS.md)
````

- The block is 36 columns wide. Every glyph is in the measured grid-safe set
  (`█▀▄─·`, dot leaders and Latin).
- The half-block "NFO" is original lettering drawn for this page. Its CRT scanline seams are part of
  the look (see `mock-colophon-phone-light.png`).
- Every value is computed:
  - EXAMPLES becomes `270 in 9 galleries` when the tape set lands;
  - LAST TAPE comes from `run.jsonl`;
  - AGENTS reads `Codex` in Phase 0.
- THANKS credits archives and tools, never scene groups.

---

## 3. The hero: TAPE 01

### 3.1 What it looks like

- **The object.** A 44 × 16 character pixel monitor (a "40-column-mode" machine, widened to 44)
  mounted on a slim tape-deck chin. It is one SVG, `viewBox="0 0 960 640"` (3:2):
  - a 30-unit title strip;
  - a 523-unit screen;
  - a 70-unit chin;
  - bezel margins.
- **The screen.** Black `#07080c` with a static 2-unit scanline pattern; nothing animates on it except
  content. Text uses the repo's own original 5 × 7 bitmap face (`tools/generator/svg.mjs`, also used
  by the Pliny sets), extended with lowercase, `~ $ ·` and the half blocks `▀ ▄ █` for the banner.
  Each cell is 6 × 9 font pixels at a scale of 3.63, so one column is 21.8 units wide.
  - The CLI frame uses the CLI's own 256-colour purples: `38;5;99` borders, `38;5;141` text and
    `38;5;183` tag, mapped to hex.
  - Prompts are light grey, success marks green and style ids amber.
- **The chin** (the "demo-reel deck") holds:
  - left: a VFD-style cyan `● REC 00:14:06`, the **real** run clock;
  - middle: six amber chapter lamps with pixel labels: `RUN · AGENT · DRAW · AUTHOR · GALLERY ·
    INSTALL`;
  - right: a `►► ×60` badge that shows only while the deck fast-forwards (AUTHOR), and
    `► PLAY ×1` otherwise;
  - far right: a `TAPE 01` label.
- **Two variants, served through `<picture>`:**

  | Variant | Bezel | Chin |
  | --- | --- | --- |
  | `tape-light.svg` | 90s beige plastic, `#d9d3c3` with `#b9b2a0` grooves | beige |
  | `tape-dark.svg` | graphite `#1c2128` with a `#30363d` edge | graphite |

  The screen is identical and opaque in both. The page never shows a transparent image.

### 3.2 Storyboard (40 s loop, 6 chapters)

| # | Reel time | Real clock | On screen | Camera / deck |
| --- | --- | --- | --- | --- |
| 1 RUN | 0:00–0:03 | 0:00 | Prompt `~/README.NFO $`, then `npx readme-nfo` lands in two pasted chunks (no letter-by-letter typing). The cursor blinks twice and Enter is pressed. | 1.6× punch-in on the prompt line, eased out by 2.6 s. Lamp RUN. `► PLAY ×1`. |
| 2 READ + AGENT | 0:03–0:09 | 0:00–0:02 | A three-row half-block `README.NFO` banner (original lettering, 40 cols), then the READ rows and AGENT rows (sketch below). The `[1] Claude [2] Codex` prompt is answered `1`. | Punch-in on the "Use which agent?" line, 0:07–0:09. Lamps RUN and AGENT. |
| 3 DRAW | 0:09–0:12 | 0:02–0:03 | The ten drawn style ids appear one every 0.2 s in three rows. | None. Lamp DRAW. |
| 4 AUTHOR | 0:12–0:27 | 0:03 → 14:06 | The purple CLI frame: three progress rows authoring in parallel, a BATCH bar and a `landed` line ticking 1→10. From 0:16 a picture-in-picture gallery window slides in at bottom right. Its tiles fill **in sync with the BATCH count**, because the gallery really is live. | The deck shows `►► ×60`, and the REC clock runs fast in real-clock steps. Lamp AUTHOR. |
| 5 GALLERY | 0:27–0:32 | 14:06 | The gallery window expands to fill the screen with 10 numbered tiles. A `►` cursor walks to tile 04. The footer line reads `npx readme-nfo use 4`. | `► PLAY ×1`. Lamp GALLERY. |
| 6 INSTALL | 0:32–0:40 | 14:06–14:08 | The gallery shrinks back to picture-in-picture, and the terminal shows the install transcript (sketch below). The picture-in-picture then flips to a white "README.md" card, with tile 04 at 2× on top, the pixel line `README.NFO` and grey text lines. It holds 0:36–0:39.6, then fades to black for 0.4 s and loops. | All six lamps lit. |

The scene text, width-checked at 44 columns by `proto/scenes.mjs`. The style ids and facts here are
illustrative; the recording supplies the real ones.

```text
~/README.NFO $ npx readme-nfo
█▀█ █▀▀ ▄▀▄ █▀▄ █▄ ▄█ █▀▀   █▄ █ █▀▀ ▄▀▄
█▀▄ █▀  █▀█ █ █ █ ▀ █ █▀    █ ▀█ █▀  █ █
▀ ▀ ▀▀▀ ▀ ▀ ▀▀  ▀   ▀ ▀▀▀ ▀ ▀  ▀ ▀    ▀

READ   README.NFO (this folder)
       JavaScript · MIT · 9 headings
       local files only · no token
AGENT  Claude Code ... signed in
       Codex ......... signed in
Use which agent? [1] Claude [2] Codex  1
DRAW   10 of 153 styles, none drawn before
       nfo-02  mach-11  vap-05  trk-09
       pc-06   c64-13   idle-06 ansi-08
       print-02 demo-07
```

```text
+--[ README.NFO ]--------------------------+
| ///  H E A D E R S   F O R   Y O U       |
| README.NFO / 10 OF 153 / 3 AT A TIME     |
| AGENT  Claude Code (switch: --codex)     |
+------------------------------------------+
| 04 mach-11  [##########......] 4/5       |
| 05 vap-05   [######..........] 2/5       |
| 06 trk-09   [###.............] 1/5       |
+------------------------------------------+
| BATCH [#####...........] 3/10 landed     |
| 03 nfo-02 landed after 1 repair          |
| elapsed 4:12 / about 10-20 min left      |
| GALLERY readme-headers/index.html        |
+------------------------------------------+
```

```text
10/10 landed in 14:06 · gallery is open
Install which header? [1-10, Enter=later] 4
WROTE .github/readme-nfo/header.svg
WROTE .github/readme-nfo/LICENSE
EDIT  README.md  +5 lines at the top
Review with git diff, then commit.
~/README.NFO $ _
```

The AUTHOR frame is the **target** version of today's frame. The target adds parallel rows, an AGENT
row and a repair note, and shortens the tag line to fit inside 40 columns. The CLI should adopt the
same frame, so the recording and the product stay one thing.

### 3.3 How it animates (GitHub-safe)

- **One master cycle.** A single 40 s `infinite` cycle drives CSS `@keyframes` on about 40 groups.
  There is no SMIL, no script and no external reference.
  - Terminal output **steps** (`steps(1,end)` opacity per line group). Terminals do not fade.
  - Scrolling is a stepped `translateY` of the text group, one row at a time.
  - Punch-ins and window slides are the only eased transforms, 500 ms each.
- **The REC clock is an odometer.** Each digit position is a vertical strip of ten 7-segment glyphs
  inside a `clipPath`, moved with `steps(1)` keyframes. That costs about 3 KB for the whole clock.
- **Gallery tiles are mosaics** of the real tape headers: 32 × 18 cells each, quantised to a fixed
  16-colour palette. Each tile is encoded as one `<path>` per colour from horizontal runs, about
  2 KB a tile and about 20 KB for ten. Showing them as pixel mosaics is deliberate: the reel says
  "this is a recording". The real headers are one click away, and in Reel 00 of the wall.
- **Glyphs are drawn once** in `<defs>` (about 100 paths) and placed with `<use>`. There is no
  `<text>` and no font.
- **Size budget:** at most 160 KB per variant; the build fails above 200 KB. One page load fetches
  only one variant.
- **Flashing:** nothing flashes more than once per second. The cursor and the `►►` badge run at
  1 Hz, and lamps change at most every 2 s.
- **Reduced motion:** `@media (prefers-reduced-motion: reduce)` stops every animation and shows a
  composed **poster frame**:
  - the scene 6 install transcript;
  - the gallery window docked over the right 55 % with all ten mosaics and tile 04 outlined;
  - all six lamps lit;
  - REC showing the total time;
  - no `►►` badge.

  The repo's own validator already requires this rule for animated SVGs.
- **Social card:** the poster frame is re-laid at 2:1 as `assets/front-page/tape-poster.png`
  (1280 × 640, under 1 MB) for Settings → Social preview.

### 3.4 How it is built (deterministic)

1. **Record.** Add `--record FILE` to the CLI (section 5). It writes JSONL: one line per call on the
   terminal object (`banner`, `project`, `runtime`, `headerProgress`, `progress`, `line`, prompts
   and answers), with a millisecond timestamp. It records account labels only, never emails, orgs
   or tokens.
2. **Replay.** `tools/front-page/build-tape.mjs` replays that JSONL into the **real**
   `createTerminal()`. The fake TTY stream has `columns: 46`, giving a 44-column frame. Every redraw
   becomes a timestamped 44 × 16 character grid with colours, taken from the SGR codes.
3. **Edit.** A small edit-decision list in `docs/front-page/tape.json` maps real time to reel time:
   - chapter boundaries;
   - the fast-forward ratio for AUTHOR;
   - where the punch-ins fall.

   This is the only hand-authored input. The renderer refuses any frame text that did not come from
   the replay.
4. **Thumbnails.** The ten tape headers are rendered in Playwright at the frame time from
   `wall.json`, downsampled to 32 × 18 and quantised.
5. **Emit.** It writes `tape-light.svg`, `tape-dark.svg` and `tape-poster.png`. It then checks the
   XML, the reduced-motion rule, the absence of external references and the size budget, and prints
   the cue-sheet values for `build-readme.mjs`.

---

## 4. The examples wall

### 4.1 Layout

- **Tiles.** Every tile is a **still** JPEG, 300 × 168 (2×) shown at `width="150" height="84"`. It
  links to its header's `.md`, where the animated original lives.
  - On a desktop column of 830 px, five fit per row (766 px with GitHub's 4 px inline gaps).
  - On phone columns of 304 px or more, two fit per row.
  - Every reel holds 10 frames, so rows are **even on both**: 2 rows of 5 on desktop, 5 rows of 2 on
    a phone. See `mock-wall-desktop-light.png` and `mock-wall-mobile-light.png`.
- **Frame numbers.** Each still carries a burned-in three-digit number (amber on a black tag, bottom
  left). The tens digit is the reel: frame `057` is reel 05, frame 7.
  - This solves "captions detach on mobile": the number is in the image, and the Frame index
    (`<details>`) maps numbers to names.
  - Alt text is short (≤ 100 characters; the longest is 74): `CASTAWAY header: island title screen
    on a rotating sea (animated)`.
- **Framing rules** (`build-wall.mjs`, overridable per frame in `wall.json`):
  - from 1.6:1 to 1.95:1, cover the 16:9 tile, anchored top-centre where most wordmarks sit;
  - wider than 1.95:1, letterbox in black;
  - taller, cover anchored at the top;
  - text-only headers: their first text block on black in the NFO-viewer look;
  - `t`: the build samples t = 0–8 s and keeps the frame with the most non-background ink, unless
    `t` is pinned.

  The prototype used a fixed t = 3 s. A few frames would benefit from an override: `030` is
  over-zoomed, and `025`/`026` crop their scrollers.
- **Weight.** Measured over all 100 prototype stills: 1,498 KB.
  - With Reel 00 (about 150 KB) and the hero (≤ 160 KB), the page loads about 1.8 MB of images.
    Today's page loads 441.5 KB for 7 images.
  - **Animated SVGs on the page drop from 6 today to 1** (today's hero is static, and its six
    favourites are animated), so scrolling stays cheap on phones.
- **Open versus folded.**
  - Reels 00–05 are open: 60 frames, about 1,300 px on desktop and about 2,900 px on a phone
    (measured from the mocks: about 210 px and 480 px a reel).
  - Reels 06–10 sit in one closed `<details>`, which saves phone scroll. A closed `<details>` still
    downloads its images unless GitHub keeps `loading="lazy"` (unverified), so it does not save
    bandwidth.
  - `OPEN_REELS` is one constant in `build-readme.mjs`.
- **Light mode** reads as a contact sheet on a lightbox, dark frames on white. **Dark mode** reads
  as a projection room. No variants are needed, because every still is opaque.

### 4.2 The frames (real files)

All frames are git-tracked headers from 6 committed projects:

| Project | Frames |
| --- | ---: |
| Castaway | 66 |
| ULTRA-SATISFACTORY | 23 |
| Heretic | 8 |
| NATURALIS-HISTORIA | 1 |
| GL4SS | 1 |
| ST3GG | 1 |

- **Every one of the 13 families is present:**

  | Families | Frames |
  | --- | --- |
  | vap | 12 |
  | mach, ansi, nfo, idle | 10 each |
  | c64, pc, trk | 8 each |
  | demo, hack | 7 each |
  | asia | 4 |
  | print, xfer | 3 each |

- **Formats:** 90 animated originals, 6 static and 4 text-only.
- **Deliberately excluded:**
  - The untracked MediaLog sets: commit them first, then add a reel.
  - The README.NFO set: its art says 152.
  - Pages or art with piracy phrasing: Dance Vision 02 (`CRACKED BY`, `SUPPLIED BY`), Castaway 31
    and 99 (`supplied by` jokes), Castaway 83 (`SWAPPER` panel), plus everything research dropped.
    That covers the keygen dialogs, the site race, sitebot, the trainer menu, the Dance Vision NFO
    and CRT, the P2P and two-pane transfer clients, the SFV check and the pack list.
  - Matrix rain and the virus-payload screen, as cringe.

  Every destination page was linted for `cracked by`, `supplied by`, `keygen`, `warez`, serial keys,
  `swapper` and `protection` (results in `wall.json` → `checked`).
- **Reel 00 · FROM THE TAPE** holds frames `001`–`010`. They are the ten headers the recorded run
  made, committed as `examples/readme-nfo-tape/` (a new gallery set). That set replaces the old
  152-count README.NFO set as this project's own showcase.

Paths are shortened below (`examples/` and `_opus_5.5.md` removed); full paths are in
`09-one-take.wall.json`.

**Reel 01 · TITLE SCREENS**

- `011` castaway/01-mode7-island · 256x144, animated · Island title screen on a rotating sea
- `012` castaway/09-pinball-dmd · 830x254, animated · Orange pinball dot-matrix loop
- `013` castaway/71-console-title-screen · 448x240, animated · 8-bit console title screen
- `014` castaway/70-handheld-boot-logo · 1040x540, animated · Handheld boot logo on a green LCD
- `015` ultra-satisfactory/10-arcade-attract · 830x730, animated · Arcade attract screen with credits
- `016` castaway/73-vfd-front-panel · 1200x512, animated · Hi-fi front panel, glowing segments
- `017` castaway/72-vector-beam-display · 1200x640, animated · Vector-beam display, glowing lines
- `018` heretic/12-mach-07 · 960x400, static · Four-shade handheld boot plate
- `019` ultra-satisfactory/40-power-on-self-test · 668x428, animated · Power-on self test
- `020` heretic/19-mach-15 · 960x400, static · Wordmark on a receding ground plane

**Reel 02 · INTROS**

- `021` castaway/35-hand-pixelled-chrome-logo · 320x140, animated · Hand-pixelled chrome logo
- `022` ultra-satisfactory/13-chrome-spheres · 900x470, animated · Chrome spheres over a checkerboard
- `023` castaway/28-c64-one-screen-intro · 352x224, animated · One-screen 8-bit intro
- `024` castaway/36-st-menu-disk · 320x200, animated · 16-bit menu disk with a scroller
- `025` castaway/19-megademo-menu · 384x242, animated · Demo menu with dotted leaders
- `026` castaway/23-dos-vga-loader · 320x165, animated · VGA loader with copper bars
- `027` castaway/21-flat-field-dos-intro · 320x168, animated · Flat-colour DOS intro
- `028` castaway/34-moire-silhouette · 960x540, animated · Moire rings and a silhouette
- `029` heretic/09-pc-12 · 960x400, static · Neon cube field under a wordmark
- `030` castaway/22-plasma-embossed-logo · 320x100, animated · Plasma behind an embossed logo

**Reel 03 · DEMOS**

- `031` castaway/26-vector-objects · 1000x400, animated · Glass crystal and vector balls
- `032` ultra-satisfactory/07-compo-slides · 960x560, animated · Big-screen party slide
- `033` castaway/113-atari-8-bit-demo · 368x208, animated · Raster ramps on an 8-bit demo screen
- `034` ultra-satisfactory/28-flat-silhouette-intro · 1200x660, animated · Flat-colour skyline intro
- `035` castaway/27-texture-movers · 960x480, animated · Texture tunnel title
- `036` naturalis-historia/03-demo-titles · 960x540, animated · Demo title card with temple and moon
- `037` castaway/114-cpc-demo-screen · 384x240, animated · Fat-pixel demo screen
- `038` castaway/110-256-byte-intro · 320x160, animated · Tiny-intro title card
- `039` heretic/13-demo-08 · 960x400, static · Attribute-grid effects
- `040` castaway/109-procedural-effects · 320x120, animated · Voxel island, procedural effects

**Reel 04 · BBS AND TELETEXT**

- `041` castaway/52-teletext-page · 692x548, animated · Teletext page with a mosaic island
- `042` castaway/50-door-game-screen · 672x432, animated · BBS door game with a countdown
- `043` ultra-satisfactory/23-illustrated-ansi · 664x520, animated · ANSI mascot with a speech bubble
- `044` castaway/49-ansimation · 668x444, animated · ANSI draw-in animation
- `045` castaway/51-ripscrip-screen · 640x366, animated · Vector BBS screen with a menu scroll
- `046` castaway/54-text-mode-demo-effect · 744x424, animated · Text-mode demo effect
- `047` castaway/47-ansi-logo-colly · 664x424, animated · ANSI logo collection page
- `048` castaway/53-viewdata-page · 370x326, animated · Viewdata terminal page
- `049` gl4ss/04-viewdata · 960x540, animated · Monochrome viewdata page
- `050` castaway/55-braille-dot-graphics · 760x510, animated · Braille-dot terminal graphics

**Reel 05 · NFO AND TEXT ART**

- `051` ultra-satisfactory/21-shaded-block-nfo · 800x736, animated · Shaded block NFO logo
- `052` castaway/45-newschool-ascii · text · Dollar-fill lettering in plain text
- `053` ultra-satisfactory/22-poster-nfo · 830x750, animated · Shaded NFO poster
- `054` castaway/07-7bit-outline-nfo · text · Slanted outline NFO in plain text
- `055` castaway/44-amiga-description-logo · 680x300, animated · Outline logo description file
- `056` ultra-satisfactory/32-generated-banner · text · Stamped banner lettering in plain text
- `057` castaway/43-file-id-diz · 392x224, animated · Archive description card
- `058` heretic/04-nfo-10 · text · Signed line-art picture in plain text
- `059` castaway/46-teletype-picture · 1000x693, animated · Teletype picture
- `060` heretic/03-nfo-02 · 960x400, static · Shaded slabs and fading debris

**Reel 06 · TRACKERS AND PLAYERS** (in the closed drawer)

- `061` ultra-satisfactory/12-cassette-jcard · 830x484, animated · Cassette, J-card and obi strip
- `062` ultra-satisfactory/09-oscilloscope · 1280x720, animated · Nine neon oscilloscopes
- `063` castaway/42-multi-chip-tracker · 960x498, animated · Multi-chip tracker
- `064` castaway/17-module-player · 660x496, animated · Text-mode module player
- `065` ultra-satisfactory/20-player-stack · 415x314, animated · Media player, equaliser and playlist
- `066` castaway/37-chip-music-jukebox · 448x252, animated · Chip-music jukebox
- `067` ultra-satisfactory/17-amiga-tracker · 414x287, animated · Four-channel tracker
- `068` castaway/39-dos-gui-tracker · 648x408, animated · DOS GUI tracker
- `069` ultra-satisfactory/38-piano-roll · 830x577, animated · Piano roll with falling notes
- `070` ultra-satisfactory/19-handheld-tracker · 830x648, animated · Handheld tracker

**Reel 07 · DESKTOPS AND Y2K**

- `071` castaway/65-memphis · 960x560, animated · Memphis squiggles and confetti
- `072` castaway/57-synthwave-outrun · 960x420, animated · Sunset, laser grid and chrome
- `073` castaway/56-vhs-tape · 840x640, animated · Camcorder tape with a timestamp
- `074` castaway/58-city-pop-sleeve · 1000x560, animated · Record sleeve and track list
- `075` castaway/60-one-bit-desktop · 416x280, animated · One-bit desktop with a wait dialog
- `076` castaway/59-luna-desktop · 1000x600, animated · Mid-2000s desktop window
- `077` castaway/61-web-1-homepage · 400x234, animated · Web 1.0 homepage
- `078` castaway/63-y2k-cybercore · 1200x640, animated · Y2K chrome interface
- `079` ultra-satisfactory/42-aero-gloss · 1000x520, animated · Aero gloss window
- `080` castaway/66-neon-signage · 960x500, animated · Neon signage

**Reel 08 · SCREENSAVERS**

- `081` castaway/98-3d-pipes · 1200x640, animated · Pipes that spell the title
- `082` castaway/14-off-air · 960x540, animated · Off-air test card
- `083` castaway/95-light-synth · 824x322, animated · Mirrored light-synth trails
- `084` heretic/14-idle-07 · 960x400, static · Brick maze corridor
- `085` ultra-satisfactory/08-milkdrop-visualiser · 840x440, animated · Music visualiser swirl
- `086` castaway/96-feedback-fire · 1280x400, animated · Feedback fire
- `087` castaway/100-sprite-saver · 1280x688, animated · Sprite screensaver
- `088` castaway/94-pulsing-diamonds · 1200x664, animated · Pulsing diamonds
- `089` castaway/97-classic-saver-set · 1200x560, animated · Classic screensaver set
- `090` heretic/02-idle-02 · 960x400, animated · Mirrored light trails

**Reel 09 · TERMINALS AND TOOLS**

- `091` castaway/87-file-system-landscape · 1280x640, animated · Folders as an island city
- `092` castaway/88-tone-pad · 1280x720, animated · Dual-tone keypad on the beach
- `093` castaway/78-fetch-card · 1120x626, animated · Terminal fetch card
- `094` castaway/18-tui-monitor · 928x532, animated · TUI system monitor
- `095` castaway/79-roguelike-screen · 672x368, animated · Roguelike map screen
- `096` castaway/82-irc-channel-window · 880x676, animated · Chat channel window
- `097` castaway/84-war-room-big-board · 1280x720, animated · War-room big board
- `098` ultra-satisfactory/35-terminal-session · 680x490, animated · Terminal program session
- `099` castaway/101-echomail-reader · 668x532, animated · Message-board reader
- `100` ultra-satisfactory/33-sysop-dashboard · 752x560, animated · Sysop dashboard

**Reel 10 · PAPER AND PANELS**

- `101` castaway/08-tractor-feed · 1000x700, animated · Green-bar printout
- `102` castaway/90-pc-98-adventure-screen · 640x400, animated · Dithered adventure screen
- `103` ultra-satisfactory/18-fm-synth-display · 830x664, animated · FM-synth keyboard display
- `104` castaway/92-japanese-basic-power-on · 684x456, animated · BASIC power-on screen
- `105` ultra-satisfactory/31-type-in-listing · 1000x850, animated · Magazine type-in listing
- `106` castaway/05-shiftjis-aa · 830x580, animated · Text-board picture art
- `107` ultra-satisfactory/30-pencil-on-paper · 1000x540, animated · Pencil on paper
- `108` castaway/30-petscii-picture · 384x256, animated · Forty-column character picture
- `109` st3gg/05-luna-desktop · 960x540, animated · Glossy desktop window
- `110` ultra-satisfactory/27-signalwave-forecast · 640x480, animated · Forecast-channel screen

---

## 5. New assets and scripts

| Path (proposed) | What | Size / budget | Made by |
| --- | --- | --- | --- |
| `assets/front-page/tape-light.svg`, `tape-dark.svg` | The hero, as two bezel variants | ≤ 160 KB each (fail > 200 KB) | `build-tape.mjs` |
| `assets/front-page/tape-poster.png` | Poster frame, 1280 × 640, for the social preview | < 1 MB | `build-tape.mjs` |
| `assets/front-page/wall/001.jpg`–`110.jpg` + `manifest.json` | Stills, 300 × 168, q80, with burned frame numbers. The manifest stores hashes of each source SVG/MD and of `wall.json` | about 1.65 MB in total (measured mean 15.0 KB) | `build-wall.mjs` |
| `examples/readme-nfo-tape/` | The recorded run's batch: 10 headers, `run.jsonl`, `draw.json`, gallery README | normal batch | the CLI with `--record` |
| `docs/front-page/README.template.md` | The page with `{{…}}` slots | about 12 KB | hand |
| `docs/front-page/wall.json` | Reels, frames, captions and framing overrides (this concept's `09-one-take.wall.json`) | about 40 KB | hand |
| `docs/front-page/tape.json` | Edit-decision list: chapters, the fast-forward ratio and punch-ins | < 2 KB | hand |
| `tools/front-page/font5x7.mjs` | The repo's 5 × 7 face, extended with lowercase, `~ $ ·` and `▀ ▄ █` | — | hand, once |
| `tools/front-page/build-tape.mjs` | Replay, then grid frames, then SVG and poster (section 3.4) | — | new, L |
| `tools/front-page/build-wall.mjs` | Playwright stills, best-ink frame, framing rules, numbering and manifest. A working prototype is `concepts/09-one-take/proto/tiles.mjs`, which renders all 100 in about 2 minutes | — | new, M |
| `tools/front-page/build-readme.mjs` | Fills the template from `loadCatalogue()`, `git ls-files`, `build-log.csv`, `run.jsonl` and `wall.json`, then lints the result | — | new, M |
| `tools/front-page/check.mjs` + `npm run front-page:check` | CI check (detail below) | — | new, S |
| `tools/generator/terminal.mjs`, `generate.mjs` | Add `--record FILE`, and the target 44-column-safe frame (shorter tag line, AGENT row, parallel rows) | — | small, S |

`check.mjs` does four things:

- regenerates the README into a temp file and diffs it against the committed one;
- confirms that every linked file and image exists and is git-tracked;
- confirms that the wall manifest hashes match their sources (a staleness check, not a pixel
  comparison, so it is OS-independent);
- confirms the budgets.

**Lint rules `build-readme.mjs` enforces:**

- The command block is alone in its fence.
- Every other code block is ≤ 36 columns and uses only grid-safe glyphs (the measured CP437/WGL4 set;
  no `◆ ✓ ★ ▶`).
- Alt text is ≤ 100 characters and never contains a catalogue style name, since 7 of those names
  contain real group names.
- A vocabulary deny-list is checked over the README and every linked page: `cracked by`,
  `supplied by`, `keygen` used as a verb, `warez`, `serial`, `nuke`, `scene release`.
- At most one alert.
- Total images ≤ 2.5 MB.
- No link to `*.html`, because GitHub shows HTML as source.

---

## 6. The journey

**Phase 1 (target shipped):**

1. **Land.** The tape plays in 40 s and shows the entire pipeline: a project folder, an agent being
   chosen, ten styles drawn, three authored at a time, a gallery filling, a number typed and a
   README patched. The H1 and pitch name it.
2. **Believe.** The wall comes next: 110 real frames, every one linking to the full animated header,
   its Markdown and its generator. The colophon's counts are the repo's own.
3. **Run.** Copy `npx readme-nfo` (the copy button gives a clean line) and run it in your project:
   - no URL, no token, works on private, GitLab and unpushed repos;
   - Node 22+ plus a signed-in Claude Code or Codex.
4. **Choose the engine.** The CLI picks whichever agent is signed in and asks once if both are. Use
   `--claude` or `--codex` to force one. If neither is signed in, it prints both sign-in hints and
   creates nothing.
5. **Watch.** The purple frame shows three headers in flight. The gallery opens in the browser after
   the first one lands and fills live. A bad SVG gets one automatic repair instead of stopping the
   batch.
6. **Pick.** At `Install which header? [1-10, Enter = later]`, type a number. Or press Enter and run
   `npx readme-nfo use 7` later; every gallery card shows its own `use N` line.
7. **Install.** The CLI writes `.github/readme-nfo/header.svg` and the MIT notice, inserts the marked
   block at the top of the README with neutral alt text, and keeps line endings and BOM. It prints
   "Review with git diff, then commit." Nothing is committed for you.
8. **Swap or re-roll.** `use N` replaces the marked block. A new run never repeats a style you have
   drawn, and `-6` gives a quicker batch.
9. **Come back.** The style id on your favourite card links to the catalogue; the front page's wall
   is the browse-by-look index.

**Phase 0 (today, if shipped before 0.1.0):**

- The tape is recorded from today's CLI: a `github:` command with a URL, Codex only, one at a time,
  and a gallery at the end.
- The page tells you to copy the SVG and Markdown yourself.
- Private repos follow the `GH_TOKEN` tip.

The structure of the page does not change; only the recorded tape, the Run-it text and two colophon
values do.

---

## 7. GitHub feasibility and risks

**What is proven or documented:**

- **The hero.**
  - An animated SVG through `<img>` (inside `<picture>`) keeps CSS keyframes; the repo already ships
    264 committed animated SVGs.
  - `<picture>` with `prefers-color-scheme` is documented and generally available (August 2022).
  - The SVG has no script, no external reference and no `<text>`.
- **The wall.**
  - `width` and `height` on `<img>` survive the sanitizer.
  - Stills are 150 px, under every phone column, so `max-width` never squashes them.
  - JPEG is allowed, and animation stays inside the one SVG.
  - Rows wrap 5 → 2 (layout-tested in the research and in `mock-wall-*.png`).
- **The text blocks.** All blocks except the command are ≤ 36 columns:
  - measured in GitHub's CSS at a 375 px viewport, 0 px of overflow;
  - with a 0.6 em font (SF Mono, iOS): 36 × 8.2 = 295 px, inside 311 px;
  - only grid-safe glyphs are used.
- **Headings.** `► Run it`, `► The wall` and `► Colophon` are real headings, so GitHub's Outline
  menu becomes the NFO index. `►` renders through the body font's symbol fallback.
- **README size** is about 35 KB (110 image tags plus the frame index), far under the 500 KiB
  truncation limit.

**Risks:**

| Risk | Likelihood | Mitigation |
| --- | --- | --- |
| The pipeline does not ship, so the tape cannot show the target | Medium | Phase 0 variant; the recording gate means the page cannot lie. |
| Hero over budget (text as `<use>`, 10 mosaics, odometer) | Medium | Budget enforced at build. Cut options: drop the mosaics to 24 × 14, or reuse line groups across frames. |
| Hero text too small on phones | Low-medium | 44 columns over 960 units is 7.8 px a column at 343 px, against 7.48 px for GitHub's own code font, so it is as legible as a code block. The three key lines get punch-ins, and every command is also copyable text below. |
| `prefers-color-scheme` inside `<picture>` follows the GitHub theme, but some browsers follow the OS | Low | Both variants have an opaque bezel and an identical black screen, so the "wrong" one still looks deliberate. |
| Closed `<details>` still downloads its 50 stills | Certain | The whole page is about 1.8 MB, inside the 3 MB budget. Test whether GitHub keeps `loading="lazy"`. |
| Tape timings look slow (one header took 2 min 31 s with Codex on the user's default model on 2026-11-11, 6 min 18 s at xhigh in October; Claude Sonnet took 74 s) | Medium | Record with the pinned default model the CLI ships (the pipeline pins model and effort so the tape is reproducible), run 3 at a time, and print agent and model beside the times. Never edit the clock. |
| Tape headers have illegible small text at 375 px (both 2026-11-11 trial headers did; the Codex one also had a subtitle touching the wordmark) | Medium | Reel 00 and the tape's mosaics show what the CLI really made, so this would show. Gate the recording on the proposed minimum-text-size check in the validator; until then, choose the tape's install pick by eye and say so in the caption. |
| Windows Codex installed through npm (`codex.cmd`) cannot be spawned by today's CLI | Known (research) | Not a page problem, but Phase 0 instructions must not promise Windows-npm Codex until the PATHEXT fix in `agents.mjs` lands. |
| Destination pages: ULTRA-SATISFACTORY pages carry an NFO-joke line, "Protection: none, it's Apache 2.0", and some Castaway and Heretic pages credit real groups in their style-history notes | Known | It never appears on the front page. Owner call: soften the joke line in those generators. The deny-list keeps the hard terms out. |
| Castaway pages' internal "run it" links point at the Castaway project root and do not resolve | Known (research) | Links go to the header pages, which still show art, Markdown and generator. Fix the page template separately. |
| Castaway dominates (66 of 100) | Certain | Reel 00 adds README.NFO. Add a MediaLog reel once committed, and re-balance as new sets land (`wall.json` is data). |
| Heretic and the Pliny sets are third-party projects | Known | They are labelled by project name only, as unofficial studies, as their galleries already say. |
| The social card needs a manual upload | Certain | One owner action in Settings. |

---

## 8. Mobile and dark mode

**Phone** (375 px viewport, about 311–343 px column):

- **Hero.** The hero is 229 px tall at 343 px. Pixel text renders at 7.8 px a column, which is
  code-block legible. Punch-ins enlarge the command, the agent prompt and the install prompt to
  1.6×. The reduced-motion poster frame shows the same content as a still.
- **Run it.**
  - The command is 14 columns and never scrolls.
  - The steps are prose and wrap.
  - The TIP alert is themed by GitHub.
  - The cue sheet, options, changes block and colophon are all ≤ 36 columns, with 0 px of overflow
    measured (`mock-colophon-phone-*.png`).
- **Wall.** Two stills per row, perfectly even, because every reel is 10 frames. Frame numbers are
  burned in, so no caption is ever orphaned.
  - Reels 00–05 are about 3,000 px.
  - The drawer keeps reels 06–10 out of the scroll until it is opened.
- **No tables anywhere** on the page, so nothing scrolls sideways except the Phase 0 command.

**Dark mode** (`#0d1117`):

- the graphite-bezel tape;
- stills read as a projection room;
- code blocks on `#151b23` give the NFO viewer feel.

**Light mode** (`#ffffff`):

- the 90s beige-plastic monitor;
- the wall reads as negatives on a lightbox (`mock-wall-desktop-light.png`);
- code blocks on `#f6f8fa` read as a printed NFO.

No image is transparent, so nothing vanishes in either theme.

---

## 9. Verdict

### Why it is cool

- **The hero is proof, not promise.** It is a real, timestamped recording rendered by the CLI's own
  terminal code, and it shows every stage, including the two everyone forgets: choosing the engine
  and installing into the README.
- **One coherent retro grammar** with zero menace and zero piracy vocabulary:
  - the tape deck: REC, chapter lamps and `►►`;
  - the cue sheet;
  - numbered reels;
  - a colophon closing on `[ EOF ]`.

  It feels like a 90s demo tape on a beige monitor and a 2000s NFO in the same breath.
- **110 examples instead of 7**, with the page's animated SVG count going **down** from 6 to 1.
  Rows are perfectly even on desktop (5) and phone (2), and frame numbers fix the
  captions-on-mobile problem for good.
- **Super-simple instructions** carried by three devices: one 14-column command, three steps of
  about 10 words each, and a cue sheet that turns the whole pipeline into 8 lines a phone can show
  without scrolling.
- **Honest and maintainable by construction.**
  - The page is generated from a template.
  - Counts come from the catalogue, git and the build log.
  - The tape can only show what the CLI did.
  - Re-recording is one command, and CI catches a stale README or wall.

### Weaknesses

- **Highest dependency on the pipeline of any concept.** At full strength it needs `npx readme-nfo`,
  Claude support, local mode, parallel authoring, the live gallery, the install step and
  `--record`. Phase 0 is honest but visibly weaker: a long command, Codex only and serial.
- **Minimal.** The gaming-NFO energy lives in the hero, two text blocks and the colophon. Next to a
  cracktro, setup-wizard or character-select concept it can look restrained at first glance.
- **Terminal recordings are a known dev-tool trope** (VHS, asciinema). The pixel monitor, deck and
  reels must be executed well or it reads as "just a GIF of a CLI".
- **The wall is stills**, so the animation, which is the product's best trick, is one click away
  rather than on the page.
- **The tape is a dated artefact.** Real times, real style ids and the real model are on the front
  page, so it needs re-recording when the CLI or default models change.
- **Castaway-heavy** (66 % of archive frames) until more sets are committed.
- **About 1.8 MB of images**: four times today's page, though within budget and mostly stills.

### Build effort

These estimates assume the target pipeline from `research/pipeline.md` exists. That pipeline is
separate, M–L per item, and not counted here.

| Item | Size | Days |
| --- | --- | --- |
| `--record` flag and the 44-column-safe frame in `terminal.mjs` | S | 0.5 |
| Font extension (lowercase, `~ $ ·`, `▀ ▄ █`) | S | 0.5 |
| `build-tape.mjs`: replay, edit-decision list, grid-to-SVG, odometer, mosaics, two bezels, poster, budget | L | 2.5 |
| `build-wall.mjs`: prototype exists; best-ink frame selection, framing overrides, manifest | M | 1 |
| `build-readme.mjs` with lint, plus `check.mjs` and npm scripts | M | 1 |
| Record the tape run, commit `examples/readme-nfo-tape/`, publish, test in a scratch GitHub repo (light, dark, iOS, Android, reduced motion) | S | 0.5 plus run time |

**Total: about 6 working days**, or about 4 for a Phase 0 cut without parallel or install scenes.

---

## 10. Facts used and where they come from (re-checked 2026-11-11)

All counts below were re-run against the working tree on 2026-11-11: 260 committed headers in 8
sets, 264 committed animated SVGs, 168 build-log rows of which 158 are Castaway and
ULTRA-SATISFACTORY (all `claude-opus-5-5` / xhigh, median `total_min` 52.85), and all 100 archive
frames in `09-one-take.wall.json` are git-tracked.

| Fact | Value | Source |
| --- | --- | --- |
| Distinct styles / families | 153 / 13 | `loadCatalogue()`, `styles/styles.json` (157 entries, 4 aliases) |
| SVG-capable / text-capable | 128 / 59 | `research/pipeline.md` §9, `styles/INDEX.md` |
| Committed example headers | 260 in 8 sets | `git ls-files 'examples/*/[0-9][0-9]*.md'` (re-run: 260) |
| Opus-authored committed headers | 158; median 52.9 min design + critique; effort xhigh | `examples/build-log.csv` (Castaway 116, ULTRA-SATISFACTORY 42) |
| Wall frames | 100 archive frames + 10 tape frames, 7 projects, all 13 families | `09-one-take.wall.json` |
| Wall still weight | 1,498 KB for 100, mean 15.0 KB, max 24.8 KB | `proto/tiles.mjs`, measured |
| Today's page image weight | 441.5 KB, 7 SVGs | `research/showcase.md` |
| GitHub code column on phones | 7.48 px Consolas / about 8.2 px SF Mono; 343 px column | `research/canon.md` §8.3 |
| CLI frame palette | 256-colour 99 / 141 / 183 | `tools/generator/terminal.mjs` |
| Claude headless feasibility | 74 s with `claude -p --json-schema --tools "" --model sonnet`; valid 8,484 B header, passed `validateResponse`, clean at 830 and 375 px | `research/pipeline.md` (2026-11-11 trial) |
| Codex CLI trial | 2 min 31 s for one header (vap-14), 27,523 tokens; passed checks but subtitle touched the wordmark | `research/pipeline.md` (2026-11-11 trial) |
| npm name | `readme-nfo` unclaimed (E404) on 2026-11-11 | `research/pipeline.md` |
| npx package today | 425 files, 0 sample generators, 0 SVGs (dead `examples/*/src/` glob) | `npm pack --dry-run`, `research/pipeline.md` |
