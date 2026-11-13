# Showcase research: the current front page and the example inventory

Research for the front-page concepts. Written 2026-10-13 and re-verified 2026-11-11 against the working tree of branch `ultra-satisfactory-headers-and-style-catalogue`. The README, examples, tools and docs were read but not changed. All counts below come from scripts run against the files, not from the existing README copy. The 2026-11-11 re-check re-rendered the current README (desktop t=0/3000 and --mobile), re-ran the inventory and loadCatalogue() (157 entries, 153 distinct, 0 errors), confirmed all 48 picks exist with unchanged sizes and reduced-motion support, and rendered fresh contact sheets of every Heretic and README.NFO SVG at 200 px (scratchpad thumbs/heretic.png, thumbs/readmenfo.png). Two Castaway tier-3 picks (113 Atari demo, 78 fetch card) were swapped for Heretic 28 and 13 to cut Castaway from 28 to 26 picks and show a fourth project more often.

Companion files in this folder:

- `showcase-picks.json`: the 48 picks as data (paths, sizes, KB, animation, aspect, tier, caption, reason, git-tracked flag).
- `showcase-contact-sheet.jpg`: the original 42 SVG picks (before the two Heretic swaps) rendered at t = 3 s into one static 6-column contact sheet (1660 x 1102 px at 2x, 552 KB as JPEG, 1,286 KB as PNG). It is a measured example of the "single poster" option, not a deliverable.

Screenshots (scratchpad, not in the repo), under `C:/Users/luked/AppData/Local/Temp/claude/D--python-README-NFO/ceb24e23-4d50-4a3b-af92-9f302ce95521/scratchpad/front-page/`:

- `current/README-{dark,light}-t{0,3000}.png`: the current README at 830 px, rendered by `tools/preview.mjs`.
- `current-mobile/README-mobile-{dark,light}-t0.png`: the `--mobile` render, with readable crops `current-mobile/crop-{top,table,bottom}.png`, plus `current/crop-nfo.png` (desktop footer NFO) and `current/crop-top-light.png`.
- `sheets/*.png`: contact sheets of every SVG header in every set at 400 px (logos at 240 px), at t = 3 s. `sheets/picks-t0-400-*.png` shows the picks at t = 0, and `sheets/picks-270-1.png` shows them at 270 px. `sheets/hero-600-1.png` and `sheets/hero-340-1.png` show the hero candidates at desktop and phone widths.
- `text/*/`: `preview.mjs` renders of 17 text-only candidates, with `text/g1.png` and `text/g2.png` as close-ups.

---

## 1. What is wrong with the current front page

The current front page is `README.md` in the working tree. It has a hero SVG, a one-line command, "More favourites" (six SVGs in three rows of two), a 16-row "Full galleries" table, two link lines and a 26-line text NFO at the bottom. In the desktop render the page is 3,398 px tall. On mobile it is 6,870 px.

### Counts that are wrong or out of date

- **152 vs 153.** The catalogue has **153 distinct styles** (157 entries in `styles/styles.json`, of which 4 are duplicates), in 13 families. `loadCatalogue()` confirms this, and so do `styles/INDEX.md` and the README prose ("153 style briefs"). But the hero art says **STYLE POOL: 152**, and so does the footer NFO (line 91). The six "favourites" also say "152 STYLES". The likely cause is that hack-19 (the CLI startup banner) was the 153rd style: it is the one style that Castaway and ULTRA-SATISFACTORY do not cover, and it is built only as `readme-nfo/41`. 40 of the 41 `examples/readme-nfo/src/*.mjs` generators hard-code `152`. Every README.NFO hero candidate that shows a count shows 152, except hack-19, so each must be regenerated before use.
- **"320 headers and logos · twelve galleries"** does not match its own table. The table has **16 rows**, and its counts add up to **360**. The disk holds **17 sets and 370 files**: 280 headers plus 90 logos. The table leaves out `examples/medialog` (10 headers).
- **"Headers" column.** Seven of the 16 rows are MediaLog *logo* collections (90 logos at 203 x 74 px), but they are counted as headers.
- **Footer NFO.** The footer says `STYLE POOL : 152`. Its box is also broken: the border lines are 78 columns wide and the content rows 79, so the right-hand `│` sits one column outside the corners (visible in `current/crop-nfo.png`).
- `examples/START-HERE.md` still says "All 164 headers".
- **What GitHub shows today.** The pushed `origin/main` README (7 commits ahead of this branch) is a different, hand-edited version. It says "260 headers · 153 distinct styles · eight project galleries", which is correct for what is committed. It has a stray `</br>`, the garbled sentence "We have 153-style catalogue supplies briefs for fresh artwork", and `-4` instead of `-10`. The working-tree README and the live one have diverged.

### Links that will break

- All eight MediaLog folders (`medialog`, `medialog-draw-02`, `medialog-logos-01` to `-07`) are **untracked in git**. That is 110 of the 370 files. All eight table rows that link to MediaLog sets would 404 on GitHub if this README were pushed as it is.
- "Compare the three Pliny sets" links to `comparisons/pliny-first-draw/index.html`. GitHub shows HTML files as source, not as a page.
- Castaway header pages say their own file links "were written for the castaway project root, so they don't resolve here". Thumbnails that link to them land on pages whose run links are dead.

### Layout and alignment (desktop, 830 px)

- **No title and no one-sentence pitch.** The first text on the page is "Generate ten headers for your project:". Nothing says what README.NFO is, and there is no H1. (The live `origin/main` has "First impressions are everything" plus a garbled pitch line.)
- **The hero undersells the product.** It is static, grey-on-black half-block brush lettering with a small info box. It is the only static image above the fold. In light mode it is a black slab, and its fine panel text (`COLLECTION: README.NFO / STYLE POOL: 152`) is about 5 px tall on a phone.
- **"More favourites" makes no sense on a first visit** (more than what?). All six pieces come from the README.NFO set, so every one says README.NFO and "152 STYLES". The section shows six looks for one project, not what the tool does for *your* project. The captions use internal candidate numbers ("04 — Multi-chip tracker"). Each pair of captions sits on a separate line below the pair of images.
- **The gallery table dominates.** It runs about 1,110 px (a third of the desktop page). Eight of its 16 rows are MediaLog variants with 30 to 60-word "Theme" cells ("Ten unused styles as animated navy symbols: handheld boot, demo titles, cassette, ..."). It reads like a changelog, not a showcase.
- **The footer NFO is an afterthought.** It sits after the licence links and repeats the hero. Its half-block lettering breaks into horizontal stripes because GitHub's code line-height is 1.45. Its `R E A D M E . N F O` caption is centred on about column 37, while the art spans 78 columns. Its leading blank line and left-heavy art make it look off-centre in the code box.

### The instructions

- They are niche and incomplete. The one command is `npx --yes github:lukexyz/README.NFO github.com/you/project -10`. `-10` is unexplained, and "Swap in your GitHub URL" comes *after* the command.
- The requirements are buried in prose: Node.js 22+, Git and a **signed-in Codex CLI**. There is **no Claude option**: `docs/generation.md` says the CLI "does not invoke Claude CLI". This matters because every example on the page whose build was logged came from Claude. `examples/build-log.csv` records 168 of them (Castaway 116, ULTRA-SATISFACTORY 42, MediaLog 10) as `claude-opus-5-5` workflow runs, with a median of 54 minutes per header (p10 36, p90 69). The public CLI cannot reproduce them.
- **Private repos fail.** The CLI reads project facts from the GitHub API. `docs/generation.md` mentions `GH_TOKEN` / `GITHUB_TOKEN`, but the front page does not. `--project FILE` (a saved `project.json`, so no GitHub fetch) is the offline path, and it is not mentioned either.
- There is no "what happens next" step. The docs say "copy a chosen SVG into `assets/` and paste its `.md`", but the front page only links "Setup, options and copying". It also gives no idea of time or cost. The docs say exact credits are not measured, and the CLI authors headers "one at a time".

### Mobile (`--mobile`: 420 px viewport, 306 px content column)

- The command's code block is 62 columns, so it scrolls sideways. The visible part ends at `...README.NFO git`, which hides the part the user has to edit.
- Each 400 px image shrinks to the full column, one per row. Each caption line ("04 — Multi-chip tracker · 26 — Cassette and J-card") comes after *both* stacked images, cut off from them.
- **The table takes 62% of the mobile page**: about 4,280 of 6,870 px. The Theme column is cut off and scrolls sideways, and rows wrap to 10 or more lines. Each MediaLog row is around 300 to 500 px tall.
- **The footer NFO is clipped.** Only about 33 of its 78 columns fit, so you see "Re" and half of the info box (see `current-mobile/crop-bottom.png`).

---

## 2. Inventory of `examples/`

Each set has one `.md` per header (numbered `NN-*.md`), its SVGs in `assets/`, and generators in `src/`. Gallery pages (`README.md`, `page-N.md`) are not counted as headers. "Text-only" means the header has no SVG image (it is a `<pre>` or fenced text block). "Animated" means at least one SVG has CSS keyframes or SMIL. Every animated SVG in every set honours `prefers-reduced-motion`, no SVG loads anything external, and none has a script.

| Set | Project | Kind | Files | SVG files | Text-only | Animated | Catalogue styles | In git |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | --- |
| `castaway` | Castaway (lo-fi island video) | headers | 116 | 150 | 16 | 100 | 116 | yes |
| `ultra-satisfactory` | ULTRA-SATISFACTORY (Satisfactory companion app) | headers | 42 | 79 | 4 | 38 | 36 + original six | yes |
| `readme-nfo` | README.NFO itself (hero candidates) | headers | 41 | 35 | 6 | 28 | 41 | yes |
| `heretic` | Heretic (p-e-w/heretic) | headers | 40 | 32 | 8 | 5 | 40 | yes |
| `dance-vision` | Dance Vision | headers | 6 | 6 | 1 | 5 | original six | yes |
| `naturalis-historia` | NATURALIS-HISTORIA (Pliny set) | headers | 5 | 5 | 0 | 5 | 5 | yes |
| `gl4ss` | GL4SS (Pliny set) | headers | 5 | 5 | 0 | 5 | 5 | yes |
| `st3gg` | ST3GG (Pliny set) | headers | 5 | 5 | 0 | 5 | 5 | yes |
| `medialog` | MediaLog | headers | 10 | 13 | 0 | 10 | 10 | **no** |
| `medialog-draw-02` | MediaLog | headers | 10 | 10 | 0 | 5 | 10 | **no** |
| `medialog-logos-01` | MediaLog | logos 203x74 | 10 | 20 | 0 | 4 | 10 | **no** |
| `medialog-logos-02` | MediaLog | logos 203x74 | 20 | 40 | 0 | 2 | 20 | **no** |
| `medialog-logos-03` | MediaLog | logos 203x74 | 20 | 60 | 0 | 0 | 20 | **no** |
| `medialog-logos-04` | MediaLog | logos 203x74 | 10 | 31 | 0 | 10 | 10 | **no** |
| `medialog-logos-05` | MediaLog | logos 203x74 | 10 | 20 | 0 | 0 | 10 | **no** |
| `medialog-logos-06` | MediaLog | logos 203x74 | 10 | 20 | 0 | 0 | 10 | **no** |
| `medialog-logos-07` | MediaLog | logos 203x74 | 10 | 20 | 0 | 0 | 10 | **no** |

### True totals

- **370** header and logo files in **17** sets: **280 headers** in 10 header sets, plus **90 logos** in 7 MediaLog logo collections.
- **In git:** 260 headers in 8 sets (Castaway, ULTRA-SATISFACTORY, README.NFO, Heretic, Dance Vision and the three Pliny sets), with 317 SVG files. **Untracked:** the 8 MediaLog sets (20 headers and 90 logos).
- **551 SVG files**, all in `assets/`, about 22.7 MB in total. That includes 60 `-still` and 60 `-icon` logo variants and the secondary panels some headers use. There are also 198 PNG exports, all MediaLog. The headers reference 430 SVGs.
- **Styles:** the catalogue has **153 distinct styles** in **13 families**: pc 14, c64 14, trk 11, nfo 11, ansi 11, vap 17, mach 13, hack 19, asia 7, idle 10, xfer 10, demo 11 and print 5. Of these, 59 can be text / ASCII, 128 can be SVG, and 34 can be both. **All 153 are built at least once** in the examples, and the committed sets alone cover all 153. Castaway plus ULTRA-SATISFACTORY cover 152 (everything except hack-19). Twelve more headers are the pre-catalogue "original six", drawn twice (Dance Vision and ULTRA-SATISFACTORY).
- **Animated:** 206 headers and 16 logos have at least one animated SVG.
- **Text-only headers:** 35. Many more SVG headers also include copyable text blocks.

---

## 3. The 48 showcase picks

I looked at every SVG header in every set on contact sheets at 400 px, the logos at 240 px, and the picks again at t = 0 and at 270 px. I also read the 17 strongest text-only candidates as `preview.mjs` renders.

**Selection rules:**

- Strong at 270 px and 400 px.
- The project name readable, or the image striking enough without it.
- No blank or near-blank first frame. Two Castaway pieces (67 tape loader and 68 insert disk) are mostly empty at 3 s and were dropped for that reason.
- Spread across families and projects.
- Nothing whose visible artwork or page implies piracy:
  - Dropped: the Dance Vision NFO ("Incl.QR.Keymaker", "cracked by"), both keygen dialogs, the ULTRA site race, the Castaway sitebot announce, the trainer-style F-key menu, and the Dance Vision CRT terminal (its page says "cracked by ...... nobody").
- No piece that relies on a real group name in its caption.

**Tiers:**

- **1:** an above-the-fold "hall of fame" of 12.
- **2:** 18 for the main wall.
- **3:** 12 more, including the static, light and untracked options.
- **text:** 6 text / ASCII picks.

The first SVG listed for a pick is its thumbnail. Any others are that header's secondary panels. "Size" is the SVG viewBox for images, or columns x lines of the first text block for text picks. KB is the thumbnail SVG, or for text picks the `.md` file.

**Coverage:**

- **Families:** nfo 6, pc 5, vap 5, idle 5, c64 5, mach 4, demo 4, ansi 3, print 3, hack 2, trk 2, asia 1, xfer 1, original six 2. All 13 families are represented.
- **Projects:** Castaway 26, ULTRA-SATISFACTORY 12, Heretic 4, MediaLog 3 (untracked), Dance Vision 1, NATURALIS-HISTORIA 1, README.NFO 1.
- **Animation:** 40 of the 42 SVG picks are animated. The static ones are Heretic 09 and Heretic 13.

**Weight, counting thumbnails only:** tier 1 is 1,194 KB, tiers 1 and 2 are 3,222 KB, and all 42 SVG picks are 4,092 KB.

**Captions are deliberately generic.** Several catalogue style *names* contain real group or product names (for example "Razor 1911", "Melon Dezign", "SAC school", "Remorse 1981", "Second Reality", "Winamp", "GoldED", "Ceefax"), and some use piracy terms ("rip installer", "swapper", "phreak"). The `style` column uses neutral names; do not copy catalogue names onto the front page.

| # | Tier | Header (.md) | SVG (in the set's assets/) | Size | KB | Anim | Text | Style | Caption | Why |
| ---: | --- | --- | --- | --- | ---: | --- | --- | --- | --- | --- |
| 1 | 1 | `examples/castaway/01-mode7-island_opus_5.5.md` | `01-mode7-island_opus_5.5.svg` | 256x144 | 71.9 | yes | no | mach-15 Mode 7 rotating ground plane | Island title screen on a rotating sea | Most charming piece in the repo: pixel island, CASTAWAY painted in the sand, readable even at 150 px; 16:9. |
| 2 | 1 | `examples/castaway/57-synthwave-outrun_opus_5.5.md` | `57-synthwave-outrun_opus_5.5.svg` | 960x420 | 106.4 | yes | no | vap-05 Synthwave / outrun | Sunset, laser grid and chrome wordmark | Instantly recognisable retro look; the huge wordmark survives any thumbnail size. |
| 3 | 1 | `examples/ultra-satisfactory/13-chrome-spheres_opus_5.5.md` | `13-chrome-spheres_opus_5.5.svg` | 900x470 | 109.1 | yes | no | pc-03 Chrome spheres over a checkerboard | Mirror spheres on a checker floor | Classic demo spectacle with a different project name; already a START-HERE pick. |
| 4 | 1 | `examples/castaway/65-memphis_opus_5.5.md` | `65-memphis_opus_5.5.svg`<br>`65-memphis_opus_5.5-divider.svg`<br>`65-memphis_opus_5.5-catalogo.svg` | 960x560 | 95.5 | yes | no | vap-17 Memphis | Squiggles, confetti and a live preview | The only loud light-background piece; breaks up a dark wall and reads at 270 px. |
| 5 | 1 | `examples/dance-vision/02-amiga-cracktro_opus_5.5.md` | `02-amiga-cracktro_opus_5.5.svg`<br>`02-amiga-cracktro_opus_5.5-rule.svg` | 320x128 | 102.3 | yes | no | original six: Amiga-style intro | Copper bars, chrome letters, dancing stick figures | Pure 16-bit intro energy with a third project name; 2.5:1 banner. Its .md page jokes "CRACKED BY a pose model", so caption it as an Amiga-style intro. |
| 6 | 1 | `examples/castaway/14-off-air_opus_5.5.md` | `14-off-air_opus_5.5.svg`<br>`14-off-air_opus_5.5-bars.svg` | 960x540 | 82.5 | yes | no | idle-10 Off-air test card | Test card with an island inside | Bold geometry, universally readable; the island in the circle makes it bespoke. |
| 7 | 1 | `examples/ultra-satisfactory/12-cassette-jcard_opus_5.5.md` | `12-cassette-jcard_opus_5.5.svg` | 830x484 | 113.6 | yes | no | print-02 Cassette and J-card | Cassette shell, J-card and obi strip | Physical-object style; colourful, with turning reels. |
| 8 | 1 | `examples/castaway/98-3d-pipes_opus_5.5.md` | `98-3d-pipes_opus_5.5.svg` | 1200x640 | 139 | yes | no | idle-06 3D pipes | Screensaver pipes spelling the title | Everyone knows this screensaver; the pipes grow into the letters. |
| 9 | 1 | `examples/castaway/52-teletext-page_opus_5.5.md` | `52-teletext-page_opus_5.5.svg` | 692x548 | 106.6 | yes | no | ansi-08 Teletext page | Teletext page with mosaic island | Saturated primaries and blocky type: perfect at 150 to 270 px. |
| 10 | 1 | `examples/castaway/35-hand-pixelled-chrome-logo_opus_5.5.md` | `35-hand-pixelled-chrome-logo_opus_5.5.svg`<br>`35-hand-pixelled-chrome-logo_opus_5.5-magnify.svg` | 320x140 | 82.5 | yes | no | c64-12 Hand-pixelled chrome logo | Hand-pixelled chrome logo, sunset gradient | The archetypal 16-bit intro logo; a 320x140 pixel canvas scales up crisply. |
| 11 | 1 | `examples/ultra-satisfactory/23-illustrated-ansi_opus_5.5.md` | `23-illustrated-ansi_opus_5.5.svg` | 664x520 | 80.3 | yes | no | ansi-03 Illustrated ANSI | ANSI mascot with a speech bubble | Character art with a grin; shows the tool can illustrate, not only letter. |
| 12 | 1 | `examples/castaway/09-pinball-dmd_opus_5.5.md` | `09-pinball-dmd_opus_5.5.svg` | 830x254 | 104.3 | yes | no | mach-11 Pinball dot-matrix display | Orange dot-matrix pinball attract loop | Wide 3.3:1 strip, single colour, very legible; a good row divider. |
| 13 | 2 | `examples/castaway/56-vhs-tape_opus_5.5.md` | `56-vhs-tape_opus_5.5.svg`<br>`56-vhs-tape_opus_5.5-timer.svg` | 840x640 | 152.6 | yes | no | vap-03 VHS tape | Camcorder tape with on-screen timestamp | Soft pastel tape look with on-screen display; strong mood. |
| 14 | 2 | `examples/castaway/58-city-pop-sleeve_opus_5.5.md` | `58-city-pop-sleeve_opus_5.5.svg` | 1000x560 | 108.8 | yes | no | vap-06 City-pop record sleeve | Record sleeve and vinyl track list | Light, airy palette; the track list is real project data. |
| 15 | 2 | `examples/castaway/24-skinned-installer_opus_5.5.md` | `24-skinned-installer_opus_5.5.svg` | 1000x584 | 141.2 | yes | no | pc-06 Skinned installer | Chrome installer with a porthole preview | Big wow, and its INSTALL / NFO / MUSIC / EXIT panel is the shape of a step-by-step guide. |
| 16 | 2 | `examples/castaway/30-petscii-picture_opus_5.5.md` | `30-petscii-picture_opus_5.5.svg`<br>`30-petscii-picture_opus_5.5-colour-off.svg` | 384x256 | 56 | yes | no | c64-03 PETSCII picture | Forty-column character-grid island picture | Friendly purple frame, 56 KB, reads at any size. |
| 17 | 2 | `examples/castaway/50-door-game-screen_opus_5.5.md` | `50-door-game-screen_opus_5.5.svg`<br>`50-door-game-screen_opus_5.5-stats.svg` | 672x432 | 82.3 | yes | no | ansi-06 Door game screen | BBS door game with countdown clock | Huge CAST AWAY lettering plus a red 10:00:00 counter. |
| 18 | 2 | `examples/castaway/26-vector-objects_opus_5.5.md` | `26-vector-objects_opus_5.5.svg`<br>`26-vector-objects_opus_5.5-props.svg` | 1000x400 | 129 | yes | no | pc-13 Vector objects | Glenz crystal and vector-ball title | Translucent crystal and dot scroller; a cool cyan palette for contrast. |
| 19 | 2 | `examples/castaway/36-st-menu-disk_opus_5.5.md` | `36-st-menu-disk_opus_5.5.svg` | 320x200 | 134 | yes | no | c64-13 16-bit menu disk | Numbered menu disk with gradient scroller | Pure game-menu energy, directly on brief for a gaming-NFO front page. |
| 20 | 2 | `examples/castaway/73-vfd-front-panel_opus_5.5.md` | `73-vfd-front-panel_opus_5.5.svg` | 1200x512 | 140.3 | yes | no | mach-12 VFD front panel | Hi-fi front panel with glowing segments | Hardware-object style; glowing cyan segments, wide 2.3:1. |
| 21 | 2 | `examples/castaway/88-tone-pad_opus_5.5.md` | `88-tone-pad_opus_5.5.svg` | 1280x720 | 124 | yes | no | hack-17 Dual-tone keypad | Dual-tone keypad with live scopes | Bright beach scene around a keypad; distinctive silhouette. |
| 22 | 2 | `examples/castaway/87-file-system-landscape_opus_5.5.md` | `87-file-system-landscape_opus_5.5.svg` | 1280x640 | 144.8 | yes | no | hack-16 3D file-system landscape | Folders as an isometric island city | Repository folders become a 3D city: a developer-relevant idea. |
| 23 | 2 | `examples/castaway/95-light-synth_opus_5.5.md` | `95-light-synth_opus_5.5.svg` | 824x322 | 93.8 | yes | no | idle-02 Light synth | Mirrored pixel trails, pure colour | Abstract burst of colour; the best thumbnail-only piece in the set. |
| 24 | 2 | `examples/castaway/99-3d-maze_opus_5.5.md` | `99-3d-maze_opus_5.5.svg` | 960x400 | 141.8 | yes | no | idle-07 3D maze | First-person brick maze with overlay map | Warm brick perspective with a coconut; strong at 270 px. |
| 25 | 2 | `examples/castaway/60-one-bit-desktop_opus_5.5.md` | `60-one-bit-desktop_opus_5.5.svg` | 416x280 | 129.3 | yes | no | vap-11 1-bit desktop | Black-and-white desktop with wait dialog | A monochrome contrast tile with a funny wait dialog. |
| 26 | 2 | `examples/ultra-satisfactory/09-oscilloscope_opus_5.5.md` | `09-oscilloscope_opus_5.5.svg` | 1280x720 | 112.6 | yes | no | trk-09 Oscilloscope channels | Nine neon scopes, one per machine | Neon waveforms in a grid: a tracker-family pick that reads small. |
| 27 | 2 | `examples/ultra-satisfactory/16-poster-installer_opus_5.5.md` | `16-poster-installer_opus_5.5.svg` | 832x448 | 33.6 | yes | no | pc-07 Text-mode poster installer | Bold text-mode installer poster | Huge yellow-and-cyan block type at only 33.6 KB. |
| 28 | 2 | `examples/ultra-satisfactory/28-flat-silhouette-intro_opus_5.5.md` | `28-flat-silhouette-intro_opus_5.5.svg`<br>`28-flat-silhouette-intro_opus_5.5-cubes.svg`<br>`28-flat-silhouette-intro_opus_5.5-credits.svg` | 1200x660 | 86.9 | yes | no | c64-10 Flat-colour silhouette intro | Flat colour fields and skyline silhouette | Pink, yellow and green flat colour: unlike anything else on the wall. |
| 29 | 2 | `examples/ultra-satisfactory/07-compo-slides_opus_5.5.md` | `07-compo-slides_opus_5.5.svg` | 960x560 | 123.4 | yes | no | demo-07 Demoparty compo slides | Big-screen party slide with countdown | Clean big-screen slide with a crowd silhouette; very legible. |
| 30 | 2 | `examples/ultra-satisfactory/08-milkdrop-visualiser_opus_5.5.md` | `08-milkdrop-visualiser_opus_5.5.svg`<br>`08-milkdrop-visualiser_opus_5.5-scope.svg` | 840x440 | 93.3 | yes | no | idle-04 Music visualiser | Swirling visualiser behind the wordmark | Purple mandala motion; a good animated tile. |
| 31 | 3 | `examples/heretic/28-c64-08.md` | `28-c64-08.svg` | 960x400 | 9.1 | yes | no | c64-08 Bobs and dot objects | Sphere chain loops round a dot cube | Lightest animated pick (9.1 KB), from a fourth project; the bob chain reads as motion even at 150 px. Its subtitle is one &lt;text> element, so the font falls back on GitHub. |
| 32 | 3 | `examples/castaway/115-swapper-floppy_opus_5.5.md` | `115-swapper-floppy_opus_5.5.svg`<br>`115-swapper-floppy_opus_5.5-disk3.svg`<br>`115-swapper-floppy_opus_5.5-disk4.svg`<br>`115-swapper-floppy_opus_5.5-disk5.svg` | 1000x560 | 110.3 | yes | no | print-01 Hand-labelled floppies | Hand-labelled floppies on the beach | Tactile object scene. The catalogue name says "swapper", so caption it as labelled floppies. |
| 33 | 3 | `examples/castaway/90-pc-98-adventure-screen_opus_5.5.md` | `90-pc-98-adventure-screen_opus_5.5.svg` | 640x400 | 124.9 | yes | no | asia-02 PC-98 adventure screen | Dithered adventure screen with verb menu | The only Asian-computing pick; the picture reads, the text panel does not at 270 px. |
| 34 | 3 | `examples/heretic/13-demo-08.md` | `13-demo-08.svg` | 960x400 | 53.0 | no | no | demo-08 Attribute-grid demo screen | Hard colour cells around a bitmap title | A loud rainbow cell frame that survives 150 px and breaks up the Castaway run; static. Two &lt;text> elements fall back to system fonts. |
| 35 | 3 | `examples/castaway/101-echomail-reader_opus_5.5.md` | `101-echomail-reader_opus_5.5.svg` | 668x532 | 63.1 | yes | no | xfer-02 Echomail reader | Message-board reader with pixel banner | The only transfer-family pick; the banner reads, the message body is texture. |
| 36 | 3 | `examples/ultra-satisfactory/20-player-stack_opus_5.5.md` | `20-player-stack_opus_5.5.svg` | 415x314 | 110.6 | yes | no | trk-11 Media player stack | Media player, equaliser and playlist | An instantly nostalgic skinned-player layout; small details, 1.3:1. |
| 37 | 3 | `examples/ultra-satisfactory/22-poster-nfo_opus_5.5.md` | `22-poster-nfo_opus_5.5.svg` | 830x750 | 55.3 | yes | no | nfo-03 Poster NFO | Shaded NFO poster with release table | The most NFO-like SVG; tall (1.1:1), so give it a 400 px slot. |
| 38 | 3 | `examples/heretic/09-pc-12.md` | `09-pc-12.svg` | 960x400 | 65.6 | no | no | pc-12 Neon cube field | Neon cube field under a wordmark | A static example (65.6 KB) from a fourth project, with rainbow cubes. It uses 2 &lt;text> elements, so its subtitle depends on fallback fonts. |
| 39 | 3 | `examples/naturalis-historia/03-demo-titles.md` | `03-demo-titles.svg` | 960x540 | 21.1 | yes | no | demo-01 Demo opening titles | Demo title card with temple and moon | The lightest animated pick (21.1 KB); quiet, elegant, and from a fifth project. |
| 40 | 3 | `examples/medialog/05-shaded-block-nfo_opus_5.5.md` | `05-shaded-block-nfo_opus_5.5.svg` | 800x656 | 55.7 | yes | no | nfo-02 Shaded block NFO | Shaded block logo over a timeline | Strong shaded-block NFO lettering. UNTRACKED in git: commit the set first. **(untracked)** |
| 41 | 3 | `examples/medialog/08-arcade-attract_opus_5.5.md` | `08-arcade-attract_opus_5.5.svg` | 830x520 | 78.8 | yes | no | mach-08 Arcade attract mode | Arcade attract screen with high scores | A rainbow wordmark in a cabinet bezel. UNTRACKED in git: commit the set first. **(untracked)** |
| 42 | 3 | `examples/medialog/10-tractor-feed_opus_5.5.md` | `10-tractor-feed_opus_5.5.svg`<br>`10-tractor-feed_opus_5.5-cards.svg` | 1280x466 | 122.3 | yes | no | print-04 Tractor-feed printout | Green-bar printout banner page | A wide 2.75:1 strip with punchy lettering. UNTRACKED in git: commit the set first. **(untracked)** |
| 43 | text | `examples/castaway/45-newschool-ascii_opus_5.5.md` | (none) | 78 cols x 24 lines (text) | 14.9 | no | yes | nfo-08 Newschool ASCII | Dollar-fill blob lettering in plain text | The best pure-text logo in the repo; 78 columns, copyable, no images needed. |
| 44 | text | `examples/castaway/07-7bit-outline-nfo_opus_5.5.md` | (none) | 78 cols x 38 lines (text) | 10.8 | no | yes | nfo-04 7-bit outline NFO | Slanted outline logo with ASCII island | A classic slash-and-underscore NFO with dot-leader facts; 78 columns. |
| 45 | text | `examples/ultra-satisfactory/01-nfo-release_opus_5.5.md` | (none) | 80 cols x 44 lines (text) | 20.7 | no | yes | original six: release-info NFO | Shaded block letters with release panels | The full gaming-NFO layout (logo, RELEASE INFO and PAYLOAD boxes) at 80 columns: the template for a front-page NFO block. |
| 46 | text | `examples/ultra-satisfactory/32-generated-banner_opus_5.5.md` | (none) | 80 cols x 38 lines (text) | 14 | no | yes | nfo-09 Generated banner lettering | Stamped block banner and generated lettering | Two lettering systems stacked; 80 columns. |
| 47 | text | `examples/heretic/04-nfo-10.md` | (none) | 59 cols x 20 lines (text) | 1.2 | no | yes | nfo-10 Usenet line art | Signed line-art picture, 59 columns | Short (20 lines, 59 columns): the text pick closest to fitting a phone. |
| 48 | text | `examples/readme-nfo/37-demo-02.md` | (none) | 76 cols x 47 lines (text) | 2.6 | no | yes | demo-02 Demo READ.ME info file | Paged READ.ME index for README.NFO | Already about this project, with a main index and file crew. It says 152 styles, so it needs 153. |

**Weak at 270 px (use at 400 px or drop):** Castaway 90 (PC-98) and 101 (echomail), ULTRA 20 (player stack) and 22 (poster NFO), and MediaLog 05 (shaded NFO). Their dense text turns into texture.

**Best at 150 px (for a dense 5-up wall):** Castaway 01, 09, 14, 30, 35, 52, 57, 65, 95 and 98, ULTRA 13 and 16, Heretic 13 and 28, and Dance Vision 02.

**Aspect buckets, for building even rows:**

- **16:9-ish (1.65-1.99):** Castaway 01, 14, 24, 58, 65, 88, 98 and 115; ULTRA 07, 08, 09, 12, 13, 16 and 28; NATURALIS 03.
- **Banner (2:1 and wider):** Castaway 09 (3.27), 26, 35, 57, 73, 87, 95 and 99; Dance Vision 02 (2.5); Heretic 09, 13 and 28 (2.4); MediaLog 10 (2.75).
- **3:2-ish (1.4-1.64):** Castaway 30, 36, 50, 60 and 90; MediaLog 08.
- **Squarish (under 1.4):** Castaway 52, 56 and 101; ULTRA 20, 22 and 23; MediaLog 05.

**Also worth knowing:** the MediaLog logo collections hold 90 compact 203 x 74 identities, at 2.7 to 89.5 KB each and mostly 3 to 10 KB. Four of them in a row at their native 203 px fits 830 px exactly (824 px). That would be a cheap "it does logos too" strip, for example `medialog-logos-01/assets/06-pc-04.svg`, `medialog-logos-02/assets/03-c64-09.svg`, `medialog-logos-02/assets/17-c64-12.svg` and `medialog-logos-04/assets/04-pc-13.svg`. Like the other MediaLog sets, they need committing first.

---

## 4. Hero candidates for README.NFO itself

These come from `examples/readme-nfo`, compared at 600 px and 340 px (`sheets/hero-600-1.png` and `sheets/hero-340-1.png`). **Each one that shows a count shows "152"; hack-19 is the only one with 153.** Fix the generator and rebuild before using any of them.

1. **`examples/readme-nfo/28-c64-13.md`** (`assets/28-c64-13.svg`, 960x444, 94.5 KB, animated). "README.NFO / ARCHIVE MENU / DISK 028" over red-orange raster bands, with a numbered menu (1 STYLE CATALOGUE, 2 EXAMPLE GALLERIES, 3 PREVIEW + VALIDATE, SPACE MAKE IT YOURS) and a "RETRO HEADERS / TEXT + SVG" strip. It is the most "gaming menu disk / NFO" of the set, and the menu doubles as the page's table of contents. The big type still reads at 340 px.
2. **`examples/readme-nfo/29-c64-06.md`** (960x464, 45.4 KB, animated). A demo-menu title with dotted-leader stats: STYLE CATALOGUE....152, VISUAL FAMILIES....013, TEXT + SVG....YES, EDITABLE SOURCES....YES, BROAD REUSE....MIT. It reads like an NFO info block, and it is half the weight of 28. The small leader text is tiny on phones.
3. **`examples/readme-nfo/01-mach-11.md`** (768x256, 20.3 KB, animated). An orange pinball display: "README.NFO / RETRO HEADER ARCADE / PICK A STYLE. MAKE IT YOURS." It is the lightest and most legible on a phone (3:1, single colour), and the attract loop cycles to "152 STYLES TO PLAY". A good hero if the page below carries the NFO feel.
4. **`examples/readme-nfo/09-c64-05.md`** (960x410, 27 KB, animated). A rainbow italic "README.NFO PRESENTS / RETRO HEADERS / TEXT + SVG" in a chrome logo plate. Clean and cheap.
5. **`examples/readme-nfo/14-pc-05.md`** (960x380, 61.8 KB, animated). A chrome wordmark with a mirror reflection and purple light spires. The scroller line is cut off at the right edge by design.
6. **`examples/readme-nfo/16-nfo-01.md`** (the current hero, 960x390, 51.5 KB, static). Keep it only as a fallback: it is monochrome, static, and unreadable on phones.
7. **`examples/readme-nfo/41-hack-19.md`** (960x450, 11.8 KB, static). The CLI startup sequence, and the only README.NFO piece that says 153. It is not a hero, but it shows exactly what a user sees when they run the tool, so it fits an "it works like this" panel. It uses 15 `<text>` elements, so its fonts fall back on GitHub.

Two possible hero designs could be built in the same style. Neither exists yet.

- **A README.NFO "skinned installer"** modelled on `castaway/24-skinned-installer` (`pc-06`). Its INSTALL / NFO / MUSIC / EXIT buttons map onto the steps.
- **A README.NFO "menu disk"** in the manner of `castaway/36-st-menu-disk`.

Both fit the "sick gaming NFO with super simple instructions" brief.

---

## 5. Layout notes for a big example wall on GitHub

**Widths.** The README column is about 830 px on desktop. On phones, GitHub's mobile layout leaves roughly 309 px at a 375 px viewport, 324 px at 390 px and 364 px at 430 px. These are approximations: they assume about 16 px page gutters, a 1 px border and 16 px box padding. The preview tool's `--mobile` mode measures 306 px. Images are inline, so there is no grid. A run of `<a><img></a>` separated by whitespace gets about 4 px between images, and a row wraps where the next image no longer fits. `<p align="center">` centres each row.

**Images per row on desktop (830 px, with whitespace gaps):**

| `width` | Per row | Row width | On a phone (309-364 px) |
| ---: | ---: | ---: | --- |
| 400 | 2 | 804 | Shrinks to the full column (`max-width:100%`), 1 per row: good |
| 270 | 3 | 818 | 1 per row with 40-95 px empty: lonely column |
| 200 / 203 | 4 | 812 / 824 | 1 per row (2 x 200 is wider than the column): wasteful |
| 160 | 5 | 816 | 2 per row only on phones of 390 px and up |
| **150** | 5 | 766 | **2 per row on every phone (304 px)**: the only width that is multi-column on both |
| 132 | 6 | 812 | 2 per row |
| 100 | 8 | 828 | 3 per row |

**Recommendations:**

- Use a full-width hero.
- Feature 2 x 400 px tiles. They stack cleanly to one full-width tile per row on phones.
- For the dense wall, use **5 x 150 px** tiles (2-up on phones) or 6 x 132 px.
- Avoid 200-270 px walls: on phones they collapse into a narrow single column.

**Mixed aspect ratios.** Inline images bottom-align, so mixed aspects give ragged rows. There are two fixes:

- **Build each row from one aspect bucket** (section 3).
- **Give every tile both `width` and `height`** (for example 150 x 84). GitHub keeps both attributes. An SVG in `<img>` letterboxes inside the box (`preserveAspectRatio` defaults to `meet`), so tiles become even cells. On a phone, `max-width` can shrink the width while the height attribute stays, but an SVG then letterboxes further instead of stretching. A raster image would stretch, so check the result on GitHub.

**Captions.** There is no way to put a caption under each image in a multi-column row without a `<table>`. On phones, GitHub tables become scrollable blocks, which is the table problem the current page already has. So:

- **Leave wall tiles uncaptioned.** Rely on short alt text and the link.
- **Put names in one text index**, inside `<details>` or as a single line per row "left to right".
- **Where a caption must sit with its image, use one image per row.** The current page's shared caption line for each pair detaches on mobile.

**Linked thumbnails vs a single poster:**

- **Linked, animated thumbnails.** Each tile opens its header page (full art, Markdown and generator). The costs are weight and CPU:
  - all 42 SVG picks: 4,092 KB and 40 simultaneous animations;
  - tier 1 (12): 1,194 KB;
  - tiers 1 and 2 (30): 3,222 KB.
- **One static poster image.** `showcase-contact-sheet.jpg` holds all 42 SVG picks in 552 KB (1,286 KB as PNG). It is one request with no animation cost and looks dense and impressive. The drawbacks:
  - **One link only:** GitHub strips `<map>`, so individual tiles cannot be clicked.
  - **No motion.**
  - **Regenerate on change:** it needs rebuilding whenever the picks change.
  - **Allowed format:** PNG, JPEG and GIF are fine in a README, but the brief keeps animation inside SVG, so a poster would be static.
- **An animated SVG poster.** An SVG that inlined the artworks would weigh about the sum of its parts (about 4 MB for 42). It would also need every id prefixed to avoid collisions. It is only practical for about 6 pieces, for example as a slideshow hero.
- **Recommended hybrid:**
  1. A hero of 100 KB or less.
  2. 6-12 animated, linked tier-1 tiles (about 0.6-1.2 MB).
  3. The static poster, linked to `examples/START-HERE.md` or the gallery index.
  4. The rest of the wall in `<details>`.

**`<details>` and loading.** I tested this in Chromium (Playwright, local server). Images inside a **closed** `<details>` are still downloaded, so there is no bandwidth saving, unless they have `loading="lazy"`. Lazy images inside closed `<details>` or below the fold were not fetched. Whether GitHub's sanitizer keeps `loading="lazy"` is unverified. A closed `<details>` does still save painting and animation CPU.

**Page weight.**

- **Today:** the current README loads 441.5 KB of images (7 SVGs: the hero at 51.5 KB plus six at 39.8-133.4 KB).
- **Picks:** the median is about 105 KB. The lightest animated picks are NATURALIS 03 (21.1 KB) and ULTRA 16 (33.6 KB); the heaviest is Castaway 56 (152.6 KB). The Heretic SVGs are often 2-10 KB because they are simpler and use `<text>`.
- **Suggested budget:** keep above the fold under about 1.5 MB, and the whole page under about 3 MB.

**Alt text.**

- **Too long now.** The headers' own alts are paragraph-length; Castaway 01's is about 900 characters. That is fine on a header page but far too long on a wall, because a screen reader would read 48 of them.
- **Keep wall alts short.** Use under 100 characters in the form "<PROJECT> header as <style> (animated)", for example "CASTAWAY header as a 16-bit island title screen (animated)".
- **No instructions in alt text.**
- **Text art:**
  - Put a one-line plain description before each block.
  - Keep the copyable steps outside the art, because screen readers read text art as noise.

**Text art on phones.**

- **How much fits:** GitHub's code font is 85% of 16 px (13.6 px), about 8.2 px per character, inside 16 px padding. A 309-364 px column shows only **about 34-40 columns**.
- **Over 40 columns scrolls:** every 76-80 column NFO pick scrolls sideways on a phone. The 59-column Heretic line art comes closest to fitting.
- **Keep must-read text narrow:** the install command and the NFO info rows should be 40 columns or less, or appear as normal text next to the art.
- **Use an SVG twin for wide art:** draw wide NFO art as an SVG, with the copyable text twin in `<details>`.

**Light mode.** Most tiles have dark backgrounds, so they appear as black slabs on white; the current hero does the same. Either frame the wall deliberately (an even dark tile background), or use `<picture><source media="(prefers-color-scheme: dark)">` where a light variant exists. Only the MediaLog logos ship light and dark exports today.

**Links.** Link each tile to its header `.md`, which shows the full header, copy-ready Markdown and the generator. Do not link to `gallery.html` or `comparisons/*.html`: GitHub shows HTML as source.

---

## 6. Flags for whoever builds the front page

1. Rebuild the README.NFO art with **153**. Also note that the Heretic 09 SVG <title> names a real group ("the rez-era Razor look"); <img> never shows it, but do not copy it into alt text or captions.
2. **Commit the MediaLog sets** before linking them. Until then, use only the 260 committed headers. The committed sets already cover all 153 styles.
3. **Reconcile with `origin/main`.** The live README has diverged from this branch.
4. **Keep catalogue names off the page.** Some style names reference real groups or piracy terms (section 3).
5. **The showcase was made with Claude, not the public CLI.** Its quality comes from long Claude Opus workflow runs (a median of 54 minutes per header in `build-log.csv`). A front page that promises "run this command and get these" should either add a Claude path to the CLI, or say clearly what the CLI produces.
6. **State the private-repo route** on the front page: `GH_TOKEN`, or `--project FILE`.
