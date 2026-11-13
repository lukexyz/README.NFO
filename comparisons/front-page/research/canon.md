# Canon: a 90s–2000s gaming NFO front page that works on GitHub

Research brief for the README.NFO front-page concepts. It covers the visual and
structural canon to draw on, how each piece survives GitHub's renderer, and 15
concrete moves. Every snippet below is original, 80 columns or fewer, and uses
only characters measured to keep the grid in GitHub's code-block font stack.
Scene styling here is homage: no real group names, logos, lettering or art, and
nothing that implies piracy.

Written 2026-10-13; re-verified 2026-11-11. Every count in §0 was recomputed from
the working tree on 2026-11-11 and still matches, and the §8.3 font measurements
were re-run in Playwright Chromium with identical results.

---

## 0. Facts the front page may state (computed, not guessed)

| Fact | Value | How it was counted |
| --- | --- | --- |
| Catalogue entries | 157 | `styles/styles.json`, 13 families |
| Distinct styles | 153 | 157 minus 4 researched twice (`styles/README.md`) |
| Families | 13 | `styles.json` `families` |
| Output support | 25 text only · 94 SVG only · 34 either | `styles/INDEX.md` group headings |
| Committed header pages | 260 in 8 sets | `git ls-files` numbered `NN-*.md` under `examples/` |
| Header pages on disk incl. uncommitted MediaLog sets | 370 in 17 sets (90 of them compact logos) | same pattern over the working tree |
| Committed SVGs / animated | 317 / 264 | `git ls-files examples/*/assets/*.svg`, grep for keyframes or SMIL |
| Animated SVGs on disk honouring reduced motion | 303 of 303 | grep `prefers-reduced-motion` |
| CLI today | Node 22+, Git, signed-in Codex CLI; no Claude path; private repos need `GH_TOKEN`/`GITHUB_TOKEN` | `docs/generation.md` |

The current README says "320 headers and logos"; neither count above matches
it, so any number on the new page should be generated at build time, not typed.
Concepts that show an engine choice, private-repo support or a no-URL run are
describing pipeline work that does not exist yet and must say so (or wait).

---

## 1. Anatomy of the classic game-release NFO

An NFO ("info") is a plain-text file shipped beside a release, read in a
monospace viewer with light text on black, 80 columns or fewer, historically in
code page 437. Most accounts date the first .nfo to 1990 (one says 1989), from a
PC release group that used it instead of README.TXT. It was common and sometimes
required in the BBS era, and the demoscene adopted it for credits, contacts and
requirements.
There is no formal spec; layout is convention.

The canonical order, top to bottom, and what each slot becomes on a legitimate
tool's README:

| NFO slot | What it looked like | README.NFO equivalent |
| --- | --- | --- |
| Logo | Big ASCII/block logo, artist tag in a corner | The hero header (made by the tool) |
| Tagline / release line | Centred, spaced caps, title and date | One-line value proposition |
| Release-info grid | Two columns of `KEY ....... : value` fields | True facts: styles, families, licence, needs |
| Notes / description | Prose about the product, often skimpy | What it makes, in two sentences |
| Install notes | Numbered steps 1, 2, 3 | The 3-step quickstart and the one-liner |
| Group news | Recruitment, announcements | Changelog strip / what's new |
| Greets | Long list of shout-outs | Credits and thanks to archives and tools |
| Members / sites / contact | Rosters, boards, IRC, email | Links: issues, docs, licence |
| Footer | Small art, date, `EOF`-style closer | `[ EOF ]` rule, signature tag |

Adjacent formats worth borrowing:

- **FILE_ID.DIZ**: the archive's tiny description, traditionally at most 10
  lines of 45 characters. A ready-made format for the repo "About" line and a
  social preview card.
- **Colly / art-pack info** (Amiga and PC art scenes): BBS advert, title and
  creator logo, index, intro, content, credits (date, font, editor), greets,
  respects. The index-and-dividers habit maps neatly onto GitHub's automatic
  heading outline.

---

## 2. Eras and schools

### Early-90s DOS ANSI (about 1990–1996)

80×25 text mode, CP437, 16 foreground and 8 background colours (16 with "iCE"
colours), drawn in tools such as TheDraw and later PabloDraw, shown through
ANSI.SYS escape codes. Shading with `░▒▓█` plus colour dithering, half-block
pixel art, drop shadows, BBS login screens, monthly art packs with SAUCE
metadata. Some NFOs even animated through escape codes; that faded after
Windows 95 made ANSI.SYS awkward. GitHub cannot show ANSI colour codes in text,
so colour ANSI belongs in SVG.

### Amiga ASCII (from about 1992)

The Topaz font's tight spacing lets `/ \ _` join into continuous strokes, so the
school is outline-only "line ASCII", mostly monochrome, with italic, stretched
logos of 7 to 12 letters filled out to 80 columns and signed with the artist's
tag. No box-drawing characters exist in the Amiga set. On a PC font the strokes
gap, which is partly why the two scenes diverged.

```text
      ______     ______     ______
     /  __  \   /  ___/    /  __  \
    /  / /  /  /  __/     /  /_/  /
   /__/ /__/  /__/        \______/
```

<sub>Original: "nfo" in a slanted 7-bit outline, the Amiga oldschool technique.</sub>

### Late-90s PC ASCII: oldschool and newschool (from 1994)

PC ASCII groups formed from 1994. "Oldschool" kept to outlines built from
`/ \ | - _`; "newschool" added fill and shading with letters and symbols, and
some work blended ANSI's shapes with alphanumeric characters. Purists called
anything beyond the 96 printable characters "block" or "high ASCII".

```text
   .d$$$$b.   $$$$$$$   .d$$$b.
   $$'  `$$   $$        $$' `$$
   $$    $$   $$$$$     $$   $$
   $$    $$   $$        `$$$$$'
```

<sub>Original: "nfo" in a filled newschool letterform.</sub>

### 2000s ISO-era NFOs: block logos and shade fades

The look most people now picture as "an NFO": high-ASCII logos built from
`▄ █ ▀ ▌ ▐`, edges faded with `░▒▓`, pixel-crisp curves, often slanted, an
artist tag tucked under the last letter, bars of `▄▄▄` and `▀▀▀` as frames,
`─[ SECTION ]─` or `░▒▓█ SECTION █▓▒░` headers, spaced-caps release lines and a
two-column dot-leader grid. Read in dedicated NFO viewers that restore the CP437
font on black.

```text
           ░▒▓ █▀▀▄ █▀▀▀ ▄▀▀▄ █▀▀▄ █▄ ▄█ █▀▀▀   █▄  █ █▀▀▀ ▄▀▀▄ ▓▒░
           ░▒▓ █▀▀▄ █▀▀  █▀▀█ █  █ █ ▀ █ █▀▀    █ ▀▄█ █▀▀  █  █ ▓▒░
           ░▒▓ ▀  ▀ ▀▀▀▀ ▀  ▀ ▀▀▀  ▀   ▀ ▀▀▀▀ ▀ ▀   ▀ ▀     ▀▀  ▓▒░

                   R E T R O   R E A D M E   H E A D E R S
```

<sub>Original half-block lettering with a shade fade and spaced-caps tagline.</sub>

### Today's text-art scene

ANSI and ASCII never died: 16colo.rs archives packs from the 1990s to now, an
ANSI collective formed in 2008 kept releasing packs through at least 2018, and a
3,266-line collaborative ANSI won a party compo in 2013.
Developer tools have made banners fashionable again; GitHub's own engineering
post on the Copilot CLI's animated ASCII banner is a good recent reference.

---

## 3. Signature typographic devices

| Device | What it does | Text or SVG on GitHub |
| --- | --- | --- |
| Box frames `┌─┐ │ └─┘`, doubled `╔═╗ ║ ╚═╝` | Panels, dialogs, release grids | Text works; vertical lines show small seams |
| Ruled headers `─[ TITLE ]─`, `-==[ title ]==-` | Section labels | Text, or real headings plus a divider image |
| Shade gradients `░▒▓█` | Fades, dividers, logo edges | Text shows seams; seamless only in SVG |
| Half-block pixels `▀ ▄ █ ▌ ▐` | Pixel lettering at 2 px per cell | Text reads as scanlines; SVG for solid fills |
| Dot leaders `KEY ....... : value` | Field grids | Text, perfect |
| Spaced caps `R E A D M E` | Release lines, tags | Text or heading |
| Two-column field grid | Release info | Text block or Markdown table |
| Artist tag, corner signature | Authorship | Text, tiny |
| `[ EOF ]`, `--- cut here ---` | Closers and copy cues | Text |
| ► ◄ ▲ ▼ arrows, `·` and `•` | Menus, toggles, bullets | Text, all grid-safe |

```text
┌─[ RELEASE INFO ]─────────────────────────────────────────────────────────────┐
│ PROJECT ....... : README.NFO          LICENCE ....... : MIT                  │
│ STYLES ........ : 153 distinct        FAMILIES ...... : 13                   │
│ OUTPUT ........ : SVG + Markdown      NEEDS ......... : Node 22+             │
└──────────────────────────────────────────────────────────────────────────────┘
```

```text
░▒▓███████████████████████  I N S T A L L  ███████████████████████▓▒░

-==========[ install notes ]================================================-
```

```text
▄▄▄ INSTALL NOTES ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄

  1. Open a terminal in your project.
  2. Run the one-liner below.
  3. Pick a favourite in the gallery and paste its Markdown.

▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
```

<sub>Step 1 is aspirational: today the CLI takes a GitHub URL rather than reading
the current folder.</sub>

```text
┌───────────────────────────────────────────┐
│            R E A D M E . N F O            │
│        retro headers for your repo        │
│     153 styles · SVG + Markdown · MIT     │
└───────────────────────────────────────────┘
```

<sub>A FILE_ID.DIZ-sized card: 45 columns, under 10 lines.</sub>

---

## 4. 2000s intro aesthetics

| Element | Canon | How it survives a README |
| --- | --- | --- |
| Cracktro screen | Logo up top, scroller along the bottom, one effect, tracker tune; C64 and Amiga in the 80s, DOS VGA in the 90s | Animated SVG through `<img>`; one effect only |
| Keygen / loader window (Win32, 2000s) | Small skinned, often non-rectangular window; metal or pixel logo bitmap; two or three fields; custom Generate/Exit buttons; scrolling about-text; a plasma, fire or starfield strip; a chiptune | A superb "launcher" frame for the real command. Relabel every field: repo, engine, count, **Generate headers**. Never "serial", "name/key" or "patch" |
| Chiptunes (MOD/XM/IT, SID) | The soundtrack of all of the above | No audio in READMEs. Show it: tracker pattern rows, scopes, VU meters (catalogue has 11 tracker styles) |
| Sine scroller / DYCP | Letters riding a moving sine wave | SVG glyphs as paths, phase animated; one line, slow |
| Chrome logo | Sky-to-ground gradient split at a horizon line, specular glints | SVG linear gradients; no `<text>` fonts |
| Starfield | Parallax or perspective dots streaming outward | Three SVG dot layers at different speeds |
| Copper / raster bars | Horizontal colour gradients changing per scanline, bouncing | Gradient rects with eased translate; stop on reduced motion |

Intro grammar to keep: one logo, one effect, one line of moving text, a loop
that is pleasant on the 20th viewing. Everything beyond that is noise in a
README column.

---

## 5. Gaming UI motifs that can carry instructions or the engine choice

| Motif | What it is | Job it can do on the page | GitHub form |
| --- | --- | --- | --- |
| Title screen, PRESS START | Logo, blinking prompt | Frame the one-liner as "press start" | Hero image, then the command in its own code block |
| Character select | Roster grid, P1 cursor, portrait and stats | Choose **Claude** or **Codex**; or pick a style family | Two `<img>` cards side by side, each with its own command (needs CLI support) |
| Attract mode | Idle loop: demo play, high scores, "insert coin" | Hero that cycles through real headers | Animated SVG must inline its art (it cannot load other files); or a GIF/WebP |
| Options screen | `SETTING ..... ◄ value ►` rows | Flags: count, format, out dir, no-open | `<details><summary>` with a table or text block |
| CD autorun launcher | Splash plus four big buttons: Install, Play, Readme, Exit | Top nav: Install · Gallery · Styles · Docs | Row of linked image buttons, alt text on each |
| Installer wizard | Step 1 of 3, progress bar, Next > | The 3-step quickstart | Numbered Markdown steps; optional small step images |
| Demo-disc menu | Carousel of playable demos and videos | The galleries; the 13 families as "discs" | Inline thumbnails linking to gallery pages |
| Memory-card screen | Save slots, blocks free, icons | Saved batches, `draw.json`, `--resume` | Text block or SVG strip |
| Loading screen with tips | Progress bar plus a rotating hint | Two short troubleshooting tips | GitHub alerts `> [!TIP]` |
| High-score table | Ranked initials and scores | Real stats (headers built, build times from `build-log.csv`) | Markdown table; numbers generated |

```text
                     S E L E C T   Y O U R   E N G I N E

            ╔══════════════════════╗      ┌──────────────────────┐
            ║        CLAUDE        ║      │        CODEX         │
            ║                      ║      │                      │
            ║     ► PLAYER 1 ◄     ║      │       PRESS 2        │
            ╚══════════════════════╝      └──────────────────────┘
```

<sub>Concept only. The CLI has no Claude path today; showing this requires the
pipeline change first.</sub>

```text
   O P T I O N S
   ────────────────────────────────────────────
   HEADERS ..................... ◄ 10 ►
   FORMAT ...................... ◄ SVG ►
   OPEN GALLERY ................ ◄ YES ►

   ► START          BACK
```

```text
  MEMORY CARD · SLOT 1                       BLOCKS FREE  12
  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐
  │▓▓▒░│ │█▄▀█│ │░▒▓█│ │    │ │    │
  └────┘ └────┘ └────┘ └────┘ └────┘
   NFO    ANSI   DEMO   EMPTY  EMPTY
```

```text
  NOW LOADING  ████████████████████████░░░░░░░░░░░░░░░░  60%

  TIP: animated headers stop moving when reduced motion is on.
```

Keep the menus generic. No console makers' marks, real memory-card layouts or
trademarked UI chrome; borrow the grammar, not the screens.

---

## 6. What reads as sick today, and what reads as cringe

**Sick**

- Restraint and grid discipline: one hero, one accent pair, a strict 80-column
  rhythm, generous black.
- Craft you can see: hand-placed half-block curves, careful shade fades, a tiny
  signature. People can tell drawn from generated.
- Diegetic UI that is also functional: the install notes really are the install
  steps; the options screen really lists the flags.
- True numbers in the info grid. Specific beats grand.
- Slow, purposeful motion (a breathing copper bar, one scroller) with a still
  frame for reduced motion.
- Currently fashionable: Y2K chrome and Frutiger-Aero gloss (big on TikTok since
  late 2022), keygen-music nostalgia, ANSI art collectives, ASCII banners in AI
  terminal tools.
- Dry wit in small doses: a loading tip, a closing `[ EOF ]`.

**Dated or cringe**

- Leetspeak everywhere, fake menace ("ELITE", "LAMERS"), bravado.
- Warez vocabulary used as a joke: it reads as piracy, and it is.
- Matrix rain, skulls, green-on-black "hacker" clichés, glitch on everything.
- Typing-animation banners, badge walls, emoji bullet lists, visitor counters,
  "made with love" footers.
- Generic synthwave sunset-and-grid hero (the most overused retro move).
- Fake Japanese, rainbow gradients, low-contrast purple on black.
- Endless greets lists; walls of centred prose; everything animated at once.
- Text art that shatters on phones or falls out of alignment.

---

## 7. What to avoid (hard rules for every concept)

- Real scene group names, logos, lettering, artist tags or NFO art, even as a
  greet or an Easter egg. Credit archives and tools instead.
- Anything that implies piracy: crack, keygen as a verb, serial, warez, "supplied
  by", "cracked by", protection, nuke, pre, "scene release". Keygen and cracktro
  are visual references only.
- Claims that are not yet true: Claude support, private repos without a token,
  "run it in any folder", a short npm name. Show them only once shipped, or
  label them plainly as coming.
- Instructions inside images or ASCII art. Commands must be copyable text.
- SVGs with external fonts, images or scripts, or relying on `<text>` fonts.
- Animation without a `prefers-reduced-motion` still frame; anything flashing
  more than three times a second.
- Code blocks wider than 80 columns, or containing glyphs that break the grid
  (see §8.3).
- Trademarked console, OS or magazine UI reproduced closely.

---

## 8. GitHub README craft

### 8.1 What really renders

- GitHub runs README HTML through an allowlist sanitizer. The open-source
  html-pipeline list (v2.14.3) allows headings, `p`, `div`, `a[href]`,
  `img[src]`, `table`, `details`/`summary`, `kbd`, `sub`/`sup`, `ruby`, `hr`,
  `br` and a global set including `align`, `width`, `height`, `alt`, `title`,
  `open`, `media`, `hspace`, `vspace`. Everything else, including `style`,
  `class`, `<script>` and inline `<svg>`, is removed.
- GitHub.com also documents support for `<picture>` with `<source media srcset>`
  even though the old open-source list omits it, so the production allowlist
  is broader. Test anything unusual in a scratch repo.
- Images through `<img>` keep SVG animation (CSS keyframes and SMIL) but run no
  scripts and load no external resources; hover and interaction never reach the
  file. Fonts must be paths or embedded.
- GitHub alerts: `> [!NOTE]`, `[!TIP]`, `[!IMPORTANT]`, `[!WARNING]`,
  `[!CAUTION]`. GitHub's guidance: one or two per page, never consecutive.
- With two or more headings, GitHub builds an Outline menu from them. Anchors
  made with `<a name>` are excluded. Headings are the NFO index for free.
- Relative links and image paths are resolved against the current branch; they
  keep working in clones and forks.
- READMEs over 500 KiB are truncated.
- Fenced code blocks get a copy button. A command alone in its block, with no
  `$` prompt or comment, copies as a runnable line.
- The social preview card must be PNG, JPG or GIF under 1 MB, ideally
  1280 × 640. SVG is not accepted, so the hero needs a raster twin.

### 8.2 GitHub's own CSS, and what it does to an NFO

From the current github-markdown-css mirror:

| Rule | Value | Consequence |
| --- | --- | --- |
| Body | 16 px | |
| `pre` | 85 % (13.6 px), line-height 1.45 (19.72 px), 16 px padding, `overflow: auto` | Code blocks scroll sideways, never wrap |
| Code-block background | `#f6f8fa` light, `#151b23` dark; page `#ffffff` / `#0d1117` | Text art is dark-on-grey in light mode, never black-panel |
| `h1`, `h2` | Bottom border rule | A free ruled header, or use `h3` to avoid it |
| `table` | `display:block; width:max-content; max-width:100%; overflow:auto`, 1 px cell borders, zebra rows | Tables look like spreadsheets and scroll on phones |
| `kbd` | 11 px mono keycap | Good for PRESS <kbd>START</kbd> moments |
| `img` | `max-width:100%` | Inline images wrap: three across on desktop, one per line on a phone |

### 8.3 Block characters in GitHub's monospace stack (measured)

GitHub's stack is `ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas,
Liberation Mono, monospace`. Measured in Chromium on Windows (resolves to
Consolas) with GitHub's CSS:

- Advance 7.48 px per column, so 80 columns are 598 px wide; about 106 columns
  fit the 830 px desktop column. Fonts with a 0.6 em advance (SF Mono, Menlo)
  give about 8.2 px, or 653 px for 80 columns. 80 is safe on desktop everywhere.
- On a 343 px phone column only about 41 columns are visible before sideways
  scroll (about 38 with a 0.6 em font). Put meaning in the left 38 columns or
  outside the code block.
- `█` and `│` ink is 17 px tall in a 19.72 px line: a 2.72 px seam on every row
  (about 14 %). Half-block lettering reads as CRT scanlines, solid fills read as
  stripes, and box sides are dashed. Embrace scanlines in text; use SVG for
  seamless blocks and gradients.
- Grid-safe in Consolas: all box drawing (single, double and mixed), `░▒▓█▀▄▌▐`,
  `■□▪▫●○`, `►◄▲▼`, `→←↑↓`, `·•…`, `¦§¤°±×÷«»`, `¹²³¼½¾¬®©™`, `♪♫☼♥♦♣♠`,
  `⌐⌂∙√∞≡▬`.
- Breaks the grid (falls back to wider fonts, 10–12 px): `◆ ◇ ✓ ✔ ★ ☆ ▶ ◀`.
  Use `►` and `◄` (CP437) instead of `▶` and `◀`. Stay inside the CP437 / WGL4
  repertoire for text art; macOS and Linux were not measured.
- Use ```` ```text ```` for art so the highlighter leaves it alone.

### 8.4 Dark and light

- `<picture><source media="(prefers-color-scheme: dark)" srcset="dark.svg">
  <img src="light.svg" alt="…"></picture>` is GitHub's documented theme swap
  (generally available since August 2022). The older `#gh-dark-mode-only` URL
  fragments are deprecated in favour of `<picture>`; do not use them.
- A `prefers-color-scheme` query *inside* an SVG loaded by `<img>` may follow
  the browser or OS preference rather than the visitor's GitHub theme (browser
  behaviour varies); test with GitHub's theme set opposite to the OS. For NFO art the
  robust answer is an opaque panel with its own background (a black "screen"
  reads well on both white and `#0d1117`), with `<picture>` reserved for art that
  must sit on the page background.
- Transparent PNG/SVG text in a single colour will vanish in one theme; give it
  a plate or a twin.

### 8.5 Animation rules

- Self-contained SVG, CSS keyframes or SMIL, glyphs as paths or rects, and a
  `@media (prefers-reduced-motion: reduce)` block that shows a composed still.
  Every animated SVG in this repo has such a rule (303 of 303 on disk), and the
  CLI's validator rejects animated SVGs without one.
- An SVG `<img>` cannot load other repo files, so an attract-mode carousel of
  real headers must inline every frame (watch file size) or be a GIF/WebP.
- External images go through GitHub's Camo proxy and are cached; changed
  external art can need a new URL. Relative repo images avoid this.

### 8.6 Best-in-class developer-tool READMEs

- **uv** (Astral): title, three badges, a one-line tagline, a `<picture>`
  benchmark chart with dark and light variants, a highlights list, then one
  install block per platform about 48 lines down.
- **VHS** (Charm): logo pair swapped by theme, a one-sentence tagline, a demo GIF
  that the tool itself recorded with its source file linked underneath, one
  install block covering four package managers, the long tail in `<details>`,
  and a `[!NOTE]` for dependencies.
- **lazygit**: a big screenshot hero, a short tagline, a demo video, a funny
  elevator pitch, then a contents list and one GIF per feature.
- The shared pattern: **hero that shows the output → one line of value →
  proof → one copyable install → gallery → depth behind links**. README.NFO's
  advantage is that its proof *is* its hero: the art.

### 8.7 What makes people star

- Borges and Valente surveyed 791 developers: most star to show appreciation
  and to bookmark, and three in four check the star count before using or
  contributing.
- Venigalla and Chimalakonda's study of READMEs in popular projects found them
  well organised with lists and images and linking out; Liu, Noei and Lyons
  clustered 14,901 Java READMEs into 32 structures. Both are correlations, not
  recipes.
- In practice for this repo: a hero worth bookmarking, a gallery that rewards
  scrolling, a first command that works for the visitor's own (possibly
  private) repo, and nothing on the page that turns out to be untrue.

---

## 9. Fifteen moves for the README.NFO front page

1. **The README is the NFO.** Sections run in NFO order: logo, tagline, release
   info, install notes, screenshots, options, news, credits, `[ EOF ]`. Use
   real headings so GitHub's Outline menu becomes the NFO index.
2. **Hero = output, signed.** One animated SVG made by the CLI itself, captioned
   with its style id and the command that made it; opaque dark panel or a
   `<picture>` pair; composed reduced-motion still; PNG twin for the social card.
3. **PRESS START one-liner.** The command alone in a fenced `sh` block (no `$`,
   no comment) so the copy button gives a runnable line; one sentence before,
   one after.
4. **Three-line install notes.** Numbered 1-2-3 in plain Markdown, each under
   40 characters so phones never scroll; requirements in one line below.
5. **Engine select / keygen-style launcher.** A select screen or skinned
   launcher image with CLAUDE and CODEX cards and the exact command for each
   beneath it. Ship only when the CLI supports both; until then the page must
   say Codex only.
6. **Release-info grid with true numbers.** Dot-leader grid (80-column text) or
   a small table: styles, families, headers, licence, needs. Generated at build
   time.
7. **Attract-mode gallery.** Nine to twelve real headers as linked inline
   `<img width="266">` thumbnails that wrap from three across to one per line
   on phones, spanning many families, each linking to its page.
8. **Demo-disc family menu.** The 13 catalogue families as small "disc" tiles
   linking to `styles/INDEX.md` anchors: breadth in one glance.
9. **Loading-screen tips via alerts.** At most two `> [!TIP]` blocks for real
   snags (a private repo needs `GH_TOKEN`; Codex must be signed in).
10. **Options screen behind a fold.** `<details><summary>OPTIONS</summary>` with
    `-15`, `--format`, `--out`, `--no-open`, `--resume` in `◄ value ►` style.
11. **Shade-bar dividers as SVG.** `░▒▓█` section bars drawn as thin SVG strips
    (seamless, themed) with `alt=""`, while headings stay real text.
12. **Memory-card save screen.** Explain output and recovery as save slots:
    where batches land, that draws are remembered, `--resume` continues.
13. **Credits and thanks instead of greets.** Thank the research archives
    (16colo.rs, Demozoo, Pouet, textfiles.com) and tools; close with a
    `[ EOF ]` rule and a tiny signature.
14. **FILE_ID.DIZ everywhere else.** A 45 × 10 card reused as the repo About
    text and a 1280 × 640 PNG social preview.
15. **Phone-first art discipline.** Text art left-anchored so the first 38
    columns stand alone, only grid-safe glyphs, and anything wider than 40
    columns kept out of the instructions.

```text
─[ CREDITS & THANKS ]─────────────────────────────────────────────────────────

  research ...... 16colo.rs · Demozoo · Pouet · textfiles.com
  tools ......... Node.js · Playwright
  you ........... everyone who opens an issue with a screenshot

──────────────────────────────────────────────────────────────────────[ EOF ]─
```

---

## 10. Sources

NFO and text art

- Wikipedia, ".nfo": https://en.wikipedia.org/wiki/.nfo
- S. Leonard, IETF draft "text/nfo" (-05): https://www.ietf.org/archive/id/draft-seantek-text-nfo-05.txt
- RoySAC, "How to package a scene release" (NFO sections): https://www.roysac.com/blog/2009/03/how-to-package-a-scene-release/
- RoySAC, ASCII art primer: https://roysac.com/ascii_art_primer.html
- Glyph Drawing Club, "Amiga ASCII art": https://blog.glyphdrawing.club/amiga-ascii-art/
- History of the PC ASCII scene (artpacks mirror): https://cdimage.debian.org/mirror/archive/ftp.sunet.se/pub/pictures/ACiD-artpacks/www/html/apx_history_of_pc_ascii_scene.html
- Wikipedia, "ASCII art": https://en.wikipedia.org/wiki/ASCII_art
- Wikipedia, "Computer art scene": https://en.wikipedia.org/wiki/Artscene
- 16colo.rs archive: https://16colo.rs/
- Wikipedia, "Warez scene" (vocabulary to avoid): https://en.wikipedia.org/wiki/Warez_scene

Intros and effects

- Wikipedia, "Crack intro": https://en.wikipedia.org/wiki/Crack_intro
- Wikipedia, "Demo effect": https://en.wikipedia.org/wiki/Demo_effect
- Wikipedia, "Keygen": https://en.wikipedia.org/wiki/Keygen

Gaming UI

- Game UI Database: https://www.gameuidatabase.com/about.php
- TV Tropes, "Attract Mode": https://tvtropes.org/pmwiki/pmwiki.php/Main/AttractMode
- Wikipedia, "Loading screen": https://en.wikipedia.org/wiki/Loading_screen
- Wikipedia, "Autorun.inf": https://en.wikipedia.org/wiki/Autorun.inf
- Games with notable installers: https://vsrecommendedgames.gametechwiki.com/index.php/Games_with_Notable_Installers
- Retro Dodo, "The lost art of demo discs": https://retrododo.com/the-lost-art-of-demo-discs/
- Wikipedia, "Official U.S. PlayStation Magazine": https://en.wikipedia.org/wiki/Official_U.S._PlayStation_Magazine

Taste and trends

- Wikipedia, "Y2K aesthetic": https://en.wikipedia.org/wiki/Y2K_aesthetic
- Aesthetics Wiki, "Frutiger Aero": https://aesthetics.fandom.com/wiki/Frutiger_Aero
- GitHub Blog, Copilot CLI animated ASCII banner: https://github.blog/engineering/from-pixels-to-characters-the-engineering-behind-github-copilot-clis-animated-ascii-banner/

GitHub rendering

- GitHub Docs, basic writing and formatting: https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax
- GitHub Docs, quickstart for writing on GitHub: https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/quickstart-for-writing-on-github
- GitHub Docs, about READMEs: https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes
- GitHub Docs, social media preview: https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/customizing-your-repositorys-social-media-preview
- GitHub changelog, theme context for images (fragments, 2021): https://github.blog/changelog/2021-11-24-specify-theme-context-for-images-in-markdown/
- GitHub changelog, theme context for images GA (2022): https://github.blog/changelog/2022-08-15-specify-theme-context-for-images-in-markdown-ga
- html-pipeline sanitization filter v2.14.3: https://github.com/gjtorikian/html-pipeline/blob/v2.14.3/lib/html/pipeline/sanitization_filter.rb
- github-markdown-css mirror: https://github.com/sindresorhus/github-markdown-css
- GitHub community, SVG only through img: https://github.com/orgs/community/discussions/151372

READMEs and stars

- astral-sh/uv README: https://github.com/astral-sh/uv
- charmbracelet/vhs README: https://github.com/charmbracelet/vhs
- jesseduffield/lazygit README: https://github.com/jesseduffield/lazygit
- awesome-readme: https://github.com/matiassingers/awesome-readme
- Borges and Valente, "What's in a GitHub Star?" (2018): https://arxiv.org/abs/1811.07643
- Venigalla and Chimalakonda, README content and popularity (2022): https://arxiv.org/abs/2206.10772

Local measurements (scratchpad, reproducible)

- `measure.mjs` in
  `C:/Users/luked/AppData/Local/Temp/claude/D--python-README-NFO/ceb24e23-4d50-4a3b-af92-9f302ce95521/scratchpad/front-page/canon/`
  renders GitHub's `pre` CSS (13.6 px, line-height 1.45, 16 px padding) in
  Playwright Chromium and reports the column advance (7.48 px), 80-column width
  (598 px), block-glyph seam (2.72 px), visible columns at 343 px (41) and
  830 px (106), and which glyphs fall back to a wider font. Last run 2026-11-11.
