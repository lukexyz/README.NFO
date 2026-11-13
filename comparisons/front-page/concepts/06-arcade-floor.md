# 06 · ARCADE FLOOR: attract mode and hall of fame

> **One-liner.** The front page is a 2000s arcade floor after closing time.
> One cabinet runs its attract loop (title, demo play, hall of fame, how to
> play). Behind it stand 50 numbered cabinets, each one a real header from the
> repo. INSERT COIN is the only command, and the instructions fit on a 3-line
> card taped to the coin door.

Seed angle: ATTRACT MODE / HALL OF FAME. **The twist is that the page's
numbered cabinets are the same component as the gallery you get back.** Every
floor tile carries a burned-in number (01-50), exactly like the batch gallery
the CLI writes for your project. So the front page *demonstrates* the core flow
before you run anything: "you will get a wall like this, numbered, and you say
*number 3*." A second run is a CONTINUE: 11-20 join the same floor.

How it differs from the other nine:

- not a release NFO (01) or a menu disk (02, 05): the text is minimal and the
  wall of real output is the main event;
- not an engine-select duel (04): Claude and Codex are the 1P and 2P buttons on
  one cabinet, not two competing cards;
- not a demo reel (09) or an autorun disc (10): the gallery is a floor of
  numbered machines plus a ranked hall of fame, not a disc with tracks.

Prototypes already built for this concept (all inside this folder):

| File | What it is |
| --- | --- |
| `06-arcade-floor/proto-hero.mjs` | deterministic generator for the cabinet hero; counts read from git and `styles/styles.json` |
| `06-arcade-floor/proto/cabinet.svg` | the hero, 960x600, 122 KB, path glyphs, reduced-motion still |
| `06-arcade-floor/proto/cabinet-today.svg` | the honest variant for the CLI as it ships today (Codex only, GitHub URL) |
| `06-arcade-floor/proto-cards.mjs` | renders all 50 floor cards to 300x192 JPEG stills with numbers burned in |
| `06-arcade-floor/floor.json` | the curated picks: 50 floor cards, 6 hall-of-fame features, 3 demo frames |
| `06-arcade-floor/proto/hero-*.png`, `wall-*.png` | 830 px and 306 px previews, light and dark |

All 56 picked files are committed in git (checked against `git ls-files`), and
the 50 floor cards cover all 13 catalogue families and 6 projects.

---

## 1 · True numbers (computed, never typed)

| Fact | Value | Source |
| --- | --- | --- |
| Distinct styles | 153 | `checkCatalogue(styles/styles.json).distinct` |
| Families | 13 | `styles.json.families` |
| SVG-capable styles | 128 | catalogue |
| Committed headers | 260 in 8 sets | `git ls-files examples/*/NN-*.md`, logos excluded |
| Set scores | castaway 116, ultra-satisfactory 42, readme-nfo 41, heretic 40, dance-vision 6, naturalis-historia 5, gl4ss 5, st3gg 5 | same |

MediaLog (20 headers, 90 logos) is untracked, so it is not on the floor until
the owner commits it; the build script picks it up automatically then.

---

## 2 · README wireframe, in order

Headings are real Markdown headings so GitHub's Outline menu reads like an
attract-mode menu: INSERT COIN · CONTINUE? · HALL OF FAME · THE FLOOR ·
OPTIONS · CREDITS · GAME OVER.

### 2.1 Cabinet hero (above the fold)

````markdown
<p align="center">
  <img src=".github/front/cabinet.svg" width="100%"
       alt="README.NFO arcade cabinet: animated title, demo and hall of fame">
</p>

<h1 align="center">README.NFO</h1>

<p align="center"><b>Retro headers for your README.</b><br>
Your agent draws 10 animated headers for your project, numbered.<br>
Pick one. It goes at the top of your README.</p>

<p align="center">
  <a href="#insert-coin">INSERT COIN</a> ·
  <a href="#the-floor">THE FLOOR</a> ·
  <a href="#hall-of-fame">HALL OF FAME</a> ·
  <a href="styles/INDEX.md">153 STYLES</a>
</p>
````

The nav line is the cabinet's button row. It wraps to two lines on phones and
stays readable.

### 2.2 `## INSERT COIN` (the whole how-to)

````markdown
## INSERT COIN

In your project's folder, with Claude Code or Codex signed in:

```sh
npx readme-nfo
```

```text
1  SIGN IN    Claude Code or Codex
2  INSERT     npx readme-nfo
3  PICK       npx readme-nfo use 3
```

**1P Claude · 2P Codex.** It uses whichever agent is signed in. Have both?
Add `--claude` or `--codex`.
**Private repos work.** It reads your local folder, never the GitHub API;
your project facts go only to the agent you chose.

> [!TIP]
> Or just ask your agent: *"make me 10 headers with npx readme-nfo"*.
> Then say *"number 3"* to install it, or *"10 more"* for 11-20.
````

Rules for this block:

- The fenced `sh` block holds the command alone (no `$`, no comment), so the
  copy button gives a runnable line.
- The 3-line card is 34 columns wide: it never scrolls on a 343 px phone
  (about 41 columns fit). It uses only ASCII.
- Requirements beyond the card (Node 22+) sit in OPTIONS, because `npx`
  already implies Node; a missing Node is caught by the CLI's first line.
- Exactly one `[!TIP]` on the page. It covers the agent-chat route, which is
  the core user flow.

### 2.3 `## CONTINUE?` (after generation: choose, install, more)

The arcade "CONTINUE? 9..8..7" screen becomes the post-run journey.

````markdown
## CONTINUE?

<p align="center">
  <img src=".github/front/continue.svg" width="100%"
       alt="A numbered gallery of 10 headers, then 10 more numbered 11 to 20">
</p>

```text
CREDIT 1   npx readme-nfo        -> 01-10
PICK       npx readme-nfo use 3  -> README
CREDIT 2   npx readme-nfo more   -> 11-20
```

- **Your gallery** opens in the browser and fills as headers land. Every
  header has a number, and new credits keep counting: 11-20, 21-30, never a
  second 01. No style repeats across credits.
- **`use 3`** copies the SVG to `.github/readme-nfo/header.svg`, adds the MIT
  notice beside it and puts a marked block at the top of your README.
  Run `use 7` later and it swaps the block. Nothing is committed: review with
  `git diff`, then commit.
- Batches live in `readme-headers/`, which is kept out of git for you.
````

`continue.svg` (new, 960x300) is a short loop: a row of 10 numbered mini
cabinets, a pixel hand taps 03, its screen glows and slides up into a README
silhouette; then CONTINUE? counts 9..1 and cabinets 11-20 drop in. Reduced
motion: the composed end state (01-20 visible, 03 highlighted, the README
silhouette with the header in place).

### 2.4 `## HALL OF FAME` (six featured machines, animated)

````markdown
## HALL OF FAME

<p align="center">
  <a href="examples/castaway/01-mode7-island_opus_5.5.md"><img src="examples/castaway/assets/01-mode7-island_opus_5.5.svg" width="400" alt="CASTAWAY header: island title screen on a rotating sea (animated)"></a>
  <a href="examples/naturalis-historia/03-demo-titles.md"><img src="examples/naturalis-historia/assets/03-demo-titles.svg" width="400" alt="NATURALIS-HISTORIA header: demo title card with temple and moon (animated)"></a>
</p>
<!-- 2 more rows of 2 at width 400 -->

| RANK | SCORE | PLAYER |
| ---: | ---: | :--- |
| 1ST | 116 | [CASTAWAY](examples/castaway/) |
| 2ND | 42 | [ULTRA-SATISFACTORY](examples/ultra-satisfactory/) |
| 3RD | 41 | [README.NFO](examples/readme-nfo/) |
| 4TH | 40 | [HERETIC](examples/heretic/) |
| 5TH | 6 | [DANCE-VISION](examples/dance-vision/) |
| 6TH | 5 | [GL4SS](examples/gl4ss/) |
| 6TH | 5 | [NATURALIS-HISTORIA](examples/naturalis-historia/) |
| 6TH | 5 | [ST3GG](examples/st3gg/) |

<sub>SCORE = headers built for that project. 260 in all, every one of the
153 styles at least once.</sub>
````

The six features, in pairs (the original animated SVGs, about 550 KB total):

| Row | Left | Right |
| --- | --- | --- |
| 1 | `examples/castaway/01-mode7-island_opus_5.5` (72 KB) | `examples/naturalis-historia/03-demo-titles` (21 KB) |
| 2 | `examples/castaway/65-memphis_opus_5.5` (96 KB, the light piece) | `examples/ultra-satisfactory/12-cassette-jcard_opus_5.5` (114 KB) |
| 3 | `examples/ultra-satisfactory/13-chrome-spheres_opus_5.5` (109 KB) | `examples/castaway/98-3d-pipes_opus_5.5` (139 KB) |

The high-score table is 3 narrow columns, so it fits a phone without sideways
scroll. Each row links to that project's gallery.

### 2.5 `## THE FLOOR` (the wall: 50 numbered cabinets)

````markdown
## THE FLOOR

<p align="center">
  <a href="examples/castaway/57-synthwave-outrun_opus_5.5.md"><img src=".github/front/floor/01.jpg" width="148" alt="01 CASTAWAY: sunset, laser grid and chrome wordmark"></a>
  <a href="examples/ultra-satisfactory/32-generated-banner_opus_5.5.md"><img src=".github/front/floor/02.jpg" width="148" alt="02 ULTRA-SATISFACTORY: stamped block banner in plain text"></a>
  <!-- ... 30 open cabinets, 5 per desktop row, 2 per phone row -->
</p>

<details>
<summary><b>CONTINUE?</b> 20 more cabinets and all 50 names</summary>

<!-- cabinets 31-50, same markup -->

01 sunset, laser grid and chrome wordmark ·
02 stamped block banner in plain text · ... (one line per row of 5)
</details>

<sub>Every card is a real header from this repo. Click one for its page,
source and SVG.</sub>
````

Card design (`proto/cards/NN.jpg`): a 300x192 still of the header (cover, top
or letterbox-over-blur, per `floor.json`), framed as a cabinet screen, with a
bottom strip carrying the burned-in number left and the project initials right
(CAS, ULT, HER...), drawn in an original 5x7 pixel font. Average 16.7 KB per
card (measured over all 50). Shown at width 148: five fit the 830 px column
(about 760 px with gaps), and two fit every phone from 306 px up.

### 2.6 `## OPTIONS` (folded)

````markdown
## OPTIONS

<details>
<summary>Settings, requirements and where things go</summary>

```text
AGENT ......... ◄ auto ►  --claude --codex
HEADERS ....... ◄ 10 ►    -6  -15
MODEL ......... ◄ pinned ► --model NAME
SPEED ......... ◄ 3 at once ► --jobs 1
MORE .......... npx readme-nfo more
INSTALL ....... npx readme-nfo use N
NOT CLONED? ... npx readme-nfo owner/repo
```

Needs Node.js 22+ and one signed-in agent. A header takes one to three
minutes; three are drawn at once. A header that fails its checks is retried
once, then skipped; the batch carries on.
URL mode (a repo you have not cloned) uses `gh auth token` for private repos.
Full docs: [docs/generation.md](docs/generation.md).
</details>
````

All rows are 40 columns or fewer. `◄ ►` are grid-safe (measured in canon.md).

### 2.7 `## CREDITS` and `## GAME OVER`

````markdown
## CREDITS

Style research leans on public archives: 16colo.rs, Demozoo, Pouet and
textfiles.com. Scene styling here is homage: no real group names, logos or
lettering. MIT licensed; generated headers carry the notice in
`.github/readme-nfo/LICENSE`.

## GAME OVER

```text
 ┌──────────────────────────────────┐
 │  GAME OVER          CREDITS: 99  │
 │  HI-SCORE ........... 260        │
 │  STYLES ............. 153        │
 │  FAMILIES ........... 13         │
 │  LICENCE ............ MIT        │
 │                                  │
 │  INSERT COIN: npx readme-nfo     │
 └──────────────────────────────────┘
               [ EOF ]
```
````

37 columns, box drawing only, each content row the same width as the corners
(the current footer's off-by-one is fixed by the build script measuring every
row).

---

## 3 · The hero and its animation

`cabinet.svg`, 960x600, about 122 KB (most of it the three demo stills,
JPEG-in-SVG). Glyphs are rects from an original 5x7 pixel font, so no `<text>`
and no fonts. Opaque cabinet body with a soft floor shadow; transparent
outside the body, so it sits on white or on GitHub dark as a physical object.

Loop, 24 s, CSS keyframes:

| Time | Scene | On the CRT |
| --- | --- | --- |
| 0-6 s | TITLE | parallax starfield (3 layers), `HI-SCORE 260`, blinking INSERT COIN, `NPX README-NFO`, `153 STYLES · 13 FAMILIES` |
| 6-12 s | DEMO PLAY | three real headers, 2 s each (castaway 01, ultra-satisfactory 13, heretic 09), labelled with project name |
| 12-18 s | HALL OF FAME | rank / score / name table rolls up: 1ST 116 CAS, 2ND 042 ULT, 3RD 041 RNF, 4TH 040 HER, 5TH 006 DNC |
| 18-24 s | HOW TO PLAY | 1 SIGN IN CLAUDE/CODEX · 2 NPX README-NFO · 3 PICK ONE FOR README · PRIVATE REPOS WORK · MIT |

Constant: chrome marquee wordmark README.NFO with a light sweep every 8 s;
1P CLAUDE (orange) and 2P CODEX (cyan) start buttons; a coin slot LED blinks
at 1 Hz (well under 3 flashes a second). `prefers-reduced-motion: reduce`
hides scenes 2-4, stops every animation and shows the TITLE scene as a
composed still. A 1280x640 PNG twin (`proto/social-preview.png`) is the
social card.

Until the pipeline ships, `--today` renders `cabinet-today.svg`: command
`NPX GITHUB:LUKEXYZ/...`, steps "SIGN IN TO CODEX", and the line
`CLAUDE SUPPORT: NOT YET`. The page never shows a claim that is not true on
the day it is published.

Note: the hero's HALL OF FAME at 306 px is about 9 px glyph height and readable,
but nothing in it is required reading: every instruction is repeated as text.

---

## 4 · Examples wall: files used

Total on the page: **56 real headers** (6 animated features + 50 floor cards)
versus 7 images today.

Floor, 30 open (number, file under `examples/`):

```text
01 castaway/57-synthwave-outrun_opus_5.5
02 ultra-satisfactory/32-generated-banner_opus_5.5   (text)
03 castaway/14-off-air_opus_5.5
04 ultra-satisfactory/10-arcade-attract_opus_5.5
05 heretic/28-c64-08
06 castaway/52-teletext-page_opus_5.5
07 castaway/35-hand-pixelled-chrome-logo_opus_5.5
08 ultra-satisfactory/23-illustrated-ansi_opus_5.5
09 castaway/09-pinball-dmd_opus_5.5
10 castaway/36-st-menu-disk_opus_5.5
11 castaway/24-skinned-installer_opus_5.5
12 ultra-satisfactory/16-poster-installer_opus_5.5
13 castaway/30-petscii-picture_opus_5.5
14 heretic/09-pc-12
15 castaway/95-light-synth_opus_5.5
16 ultra-satisfactory/28-flat-silhouette-intro_opus_5.5
17 castaway/56-vhs-tape_opus_5.5
18 gl4ss/05-luna-desktop
19 castaway/50-door-game-screen_opus_5.5
20 ultra-satisfactory/09-oscilloscope_opus_5.5
21 castaway/58-city-pop-sleeve_opus_5.5
22 heretic/15-demo-10
23 castaway/26-vector-objects_opus_5.5
24 ultra-satisfactory/07-compo-slides_opus_5.5
25 castaway/99-3d-maze_opus_5.5
26 st3gg/01-off-air
27 castaway/73-vfd-front-panel_opus_5.5
28 ultra-satisfactory/08-milkdrop-visualiser_opus_5.5
29 castaway/88-tone-pad_opus_5.5
30 heretic/30-hack-11
```

Behind CONTINUE? (31-50):

```text
31 castaway/87-file-system-landscape_opus_5.5
32 ultra-satisfactory/31-type-in-listing_opus_5.5
33 castaway/60-one-bit-desktop_opus_5.5
34 heretic/26-demo-09
35 castaway/113-atari-8-bit-demo_opus_5.5
36 ultra-satisfactory/26-vaporwave_opus_5.5
37 castaway/115-swapper-floppy_opus_5.5
38 gl4ss/04-viewdata
39 castaway/90-pc-98-adventure-screen_opus_5.5
40 ultra-satisfactory/38-piano-roll_opus_5.5
41 heretic/01-vap-12
42 heretic/04-nfo-10                                  (text)
43 ultra-satisfactory/20-player-stack_opus_5.5
44 ultra-satisfactory/33-sysop-dashboard_opus_5.5
45 heretic/16-mach-09
46 ultra-satisfactory/27-signalwave-forecast_opus_5.5
47 heretic/13-demo-08
48 ultra-satisfactory/22-poster-nfo_opus_5.5
49 naturalis-historia/02-telnet-board
50 castaway/45-newschool-ascii_opus_5.5               (text)
```

Text-only headers (02, 42, 50) are rendered as cards from their first fenced
block in GitHub's dark code colours, so the floor shows that plain-text NFO
headers are an option too. Captions and alts are neutral and hand-written in
`floor.json`; catalogue style names are never copied (seven of them name real
groups, and some name products). Ordering keeps neighbours in different
families and colours, and the first row mixes 4 projects.

---

## 5 · New assets to make

All produced by one deterministic script, `tools/front-page/build.mjs`
(promoted from the two prototypes), driven by `floor.json`:

| Asset | Size | Notes |
| --- | --- | --- |
| `.github/front/cabinet.svg` | ~122 KB | hero; counts from git + catalogue; `--today` variant |
| `.github/front/cabinet-still.png` | ~80 KB | reduced-motion still for docs and checks |
| `.github/front/social.png` | ~127 KB | 1280x640 social preview |
| `.github/front/continue.svg` | target < 60 KB | the numbered-gallery / use 3 / 11-20 loop |
| `.github/front/floor/01..50.jpg` | ~835 KB total | 300x192 stills captured in Playwright at t = 3 s |
| README sections | text | wall markup, hall-of-fame table, GAME OVER box, all filled from computed facts |
| `tools/front-page/check.mjs` | | fails CI if counts drift, a pick is untracked, an alt contains a banned word, a text block exceeds 40 (instructions) / 80 (art) columns, or the page exceeds budget |

Build output is hashed into `.github/front/manifest.json`, so `--check`
rebuilds in memory and diffs: the README can never say 152 again.

Page weight: hero 122 KB above the fold; open page about 1.3 MB (hero, 6
features, 30 cards, continue loop); about 335 KB more inside CONTINUE?. Under
the 3 MB budget, with 8 animated images on the page (hero, continue loop
and the 6 features) instead of 40 animated tiles.

---

## 6 · The journey (the whole pipeline, as this page promises it)

1. **Discover.** The cabinet loops: title, three real headers, the ranked
   hall of fame, then HOW TO PLAY. Scrolling down shows 56 real headers.
2. **Insert coin.** `npx readme-nfo` in the project folder (npm package
   `readme-nfo`, name unclaimed as of 2026-11-11). No Git needed, no token.
3. **Agent select.** The CLI probes `claude auth status` and
   `codex login status` in parallel (3 s each). One ready: uses it and prints
   `AGENT  Claude Code   (switch: --codex)`. Both: asks once in a terminal,
   defaults to Claude when non-interactive and says so. Neither: prints both
   sign-in hints and exits 1. Windows `.cmd` shims resolved via PATHEXT.
4. **Project facts.** Read from the local checkout: README, package.json /
   pyproject / Cargo / go.mod, languages, licence, git remote of any host or
   none. Private, GitLab, self-hosted and unpushed projects work. Facts are
   sent only inside the authoring prompt to the chosen agent.
5. **Draw.** 10 distinct styles drawn at random from the 153, recorded in
   `readme-headers/draw.json` with `next: 11` and the list of used ids.
6. **Author.** Three at a time through
   `claude -p --output-format json --json-schema … --tools "" --model sonnet`
   or `codex exec --sandbox read-only --output-schema … -m <pinned>`. Each
   reply goes through the existing validator plus a new legibility check
   (minimum rendered text height at 375 px). One repair retry, then skip.
7. **Gallery.** `readme-headers/index.html` opens at once and fills as
   headers land. It uses the same numbered-cabinet card as the front page,
   with `npx readme-nfo use N` under each card.
8. **CONTINUE?** `npx readme-nfo more` (or "10 more" to the agent) draws 10
   unused styles, numbers them 11-20 in the same folder, and rewrites the same
   `index.html` with every credit in order (CREDIT 1: 01-10, CREDIT 2: 11-20).
   When the 153 run out it says so.
9. **Pick.** `npx readme-nfo use 3` (or "number 3" to the agent). Copies the
   SVG to `.github/readme-nfo/header.svg` and the MIT notice beside it,
   inserts or replaces the block between
   `<!-- README.NFO header: start -->` and `<!-- README.NFO header: end -->`
   with neutral alt text, keeps EOL/BOM, never commits, prints
   `Review with git diff, then commit.`
10. **Agent-chat route.** Inside Claude Code or Codex the user types a
    sentence; the agent runs the same three commands. To make that reliable
    the CLI ends every run with plain next-step lines written for agents too:
    `INSTALL  npx readme-nfo use <1-20>` and `MORE  npx readme-nfo more`, plus
    `--json` for a machine-readable summary.

### Pipeline changes this concept depends on

| File | Change |
| --- | --- |
| `package.json` | rename to `readme-nfo`, ship `styles/samples.json`, drop the dead `examples/*/src/` glob |
| `tools/generator/agents.mjs` (new) | detection, PATHEXT/.cmd resolution, Claude and Codex drivers |
| `tools/generator/project.mjs`, `tools/generate.mjs` | local-folder mode by default; `--claude`, `--codex`, `--jobs`, `use`, `more` |
| `tools/generator/batch.mjs` | one `readme-headers/` folder per project, continuous numbering via `draw.json.next`, no repeated styles, gallery rewritten after every header, `.git/info/exclude` entry |
| `tools/generator/hybrid-output.mjs` | single cumulative gallery in the floor style; neutral alts |
| `tools/generator/install.mjs` (new) | `use N` with the marked README block |
| `tools/generator/author.mjs` | concurrency 3, repair retry, skip-not-stop |
| `tools/build-samples.mjs` (new) | samples bundle from committed sets only |
| `tools/front-page/*` (new) | this page's assets and checks |
| CI | windows-latest, `npm pack` asserts samples ship, front-page `--check` |

---

## 7 · GitHub feasibility and risks

Feasible as specced: everything is `<p align=center>`, `<img width alt>`,
`<a href>`, one `<details>`, one small table, fenced blocks and one alert.
No `<style>`, no inline SVG, no `class`.

| Risk | Mitigation |
| --- | --- |
| Promising features that do not exist yet (Claude, npm name, local mode, `use`, `more`) | ship the page only with the pipeline; `--today` builds an honest variant (Codex only, URL + `GH_TOKEN` tip) in the meantime |
| The showcase was made by long Opus workflow runs; a 1-3 minute CLI header is simpler | sub-caption under the floor: "made with README.NFO's workflow; CLI headers are smaller"; or rebuild a set of 10 with the shipping CLI and give it its own row once it exists |
| Agent-chat route: nested agents (`claude -p` inside Claude Code, `codex exec` inside a Codex sandbox that blocks network/npx) | the TIP is honest about the commands; phase 2 plugin lets the host agent draw via `brief`/`check`, no nested call |
| `<img>` SVGs follow the OS colour scheme, not GitHub's theme | the cabinet and cards are opaque objects with their own colours, so theme does not matter |
| Hero file size grows with demo stills | stills capped at 3, JPEG q72; budget check fails above 140 KB |
| Card stills go stale if an example changes | manifest hashes the source SVG; `--check` flags mismatches |
| Untracked MediaLog | excluded by the build until committed |
| `loading=lazy` inside `<details>` unverified | closed `<details>` still saves paint/CPU; the 20 hidden cards are only 335 KB |

---

## 8 · Mobile and dark mode

- **Phone (306-375 px).** Hero scales to 100% width; the title scene's
  command line stays readable (prototype `proto/hero-phone-dark-*.png`).
  Floor cards at 148 px go 2-up on every phone. Feature tiles at 400 go 1-up
  full width. The 3-line INSERT COIN card is 34 columns, the OPTIONS rows 40,
  the GAME OVER box 37: no sideways scroll anywhere a reader must read. The
  hall-of-fame table has three narrow columns and fits.
- **Dark mode.** The intended look: cabinet and dark cards on #0d1117.
- **Light mode.** The cabinet has transparent surroundings and a floor
  shadow, so it reads as an object on white, not a black slab
  (`proto/hero-desktop-light-*.png`). Cards keep their framed cabinet strip,
  so the floor looks like a lit row of screens; the Memphis feature adds one
  light piece to break the wall. Code blocks become dark text on #f6f8fa,
  which suits the plain ASCII cards.
- **Reduced motion.** Hero and continue loop show composed stills; floor
  cards are stills by design; the 6 features honour reduced motion already
  (checked by the repo's preview lint).

---

## 9 · Why it is cool

- The examples ARE the page: 56 real headers from 6 projects and all 13
  families, compared with 7 today, at a lower CPU cost than 40 animated tiles.
- Attract mode is the right metaphor for a page people glance at: it cycles
  title, proof, ranking and instructions without asking for a scroll.
- INSERT COIN is one copyable line; the 3-step card is 34 columns.
- The numbered cabinets teach the core flow by example: "number 3" and
  "10 more, numbered 11-20" feel obvious after seeing the floor.
- Hall-of-fame scores are real counts from git, so the gaming flourish is
  also the proof.
- 1P CLAUDE / 2P CODEX makes engine choice a cabinet button, not a paragraph.
- Fully deterministic: two scripts and one JSON file rebuild every asset.

## 10 · Weaknesses

- Least "NFO-text" of the ten: it is an arcade, not a text file. Text-art
  craft is limited to the card, OPTIONS and GAME OVER.
- Still cards lose the motion that makes the headers special; only 8
  animations show it.
- Castaway dominates (116 of 260), so even curated, about 40% of cards say
  CASTAWAY.
- Showcase quality comes from long workflow runs; the CLI must improve (or be
  labelled) to meet the expectation the floor sets.
- The hero's demo-play scene embeds raster stills, so the hero must be
  rebuilt when those three headers change.

## 11 · Build effort

- Front page: **M**. Prototypes exist for the hero and all 50 cards; promote
  them to `tools/front-page/`, add `continue.svg`, the README template,
  manifest and `--check`. About 1-2 days.
- Pipeline it relies on: **L** (agents, local mode, continuous numbering,
  cumulative gallery, `use`/`more`, npm publish, Windows CI). This is shared
  by every concept; this page adds nothing beyond it except the floor-style
  card in the generated gallery (S).
