# 02 BOOT INTRO: build notes

The front page boots like a 16-bit game intro, then hands over to plain,
copyable Markdown. `readme.mjs` composes the page as if it were the
repository-root README, checks it, then writes `README.md` here with every link
relative to this folder (`tools/front-page/lib/relink.mjs`).

## What the page is

1. **Boot.** A `<picture>` hero (`assets/hero-dark.svg` / `hero-light.svg`,
   960x480, about 48 KB each) sits between the real
   `<!-- README.NFO header: start/end -->` markers that `use N` will write, and
   links to `#-press-start`. Inside the screen are a three-layer seeded
   starfield (23.1 / 11.55 / 5.78 s), the top line, a chrome README.NFO logo, a
   copper horizon, a loader strip, a pulsing PRESS SPACE and a sine scroller.
   - The logo uses an original 7x9 alphabet with two-pixel stems and a
     whole-pixel italic lean. It has a hard-horizon chrome gradient, a 6 px
     black outline, a purple drop shadow, pixel bevels (lit top and left edges,
     shaded bottoms) and a glint every 8 s.
   - The loader strip reads `ENGINE ◄ CLAUDE CODE ►`, cross-fading to
     `◄ CODEX ►` every 4 s, and `FACTS ◄ YOUR FOLDER ►`.
   - The scroller uses a 12-group phase trick: 228 glyphs, 12 animated groups.
     Its copy is decoration only; no instruction lives only there.
   - Reduced motion shows a composed still: `◄ CLAUDE/CODEX ►` and a parked
     scroller, `ASK FOR 10 · SAY A NUMBER`.
   - The hero's catalogue-style signature sits under it.
   - Then the H1 *Retro headers for your README*, the pitch, and two engine
     buttons (new, see below).
2. **► Press start.**
   - The bare `npx readme-nfo` block comes first, then the canonical three
     steps word for word, then **Claude or Codex?** and **Private repos
     work.** with the canonical text.
   - Then *No flags needed. The defaults are good.*, and the timings in a
     `<sub>`.
3. **► Numbered, every batch.**
   - `assets/flow.svg` animates the core flow: DISK 1 fills 01-10, the cursor
     picks 03, and 03 flies into a README sheet ("#03 INSTALLED"). DISK 2 then
     adds 11-20 on the same page.
   - Below it: the canonical **Want more?** paragraph, the DISK 1 / PICK /
     DISK 2 card and the agent-chat `[!TIP]`.
   - Then bullets for one page, never commits, and undo.
   - Then four `<details>`: the run transcript, the exact installed block,
     Options, and "No agent found, or something failed?".
4. **► Intro select.** 51 linked headers from 6 projects, covering all 13
   families.
   - Six live featured SVGs in pairs, each pair sized to a shared height
     (804 px total).
   - *Same style, three projects*: the off-air header for Naturalis Historia,
     GL4SS and ST3GG.
   - A wall of 40 "little monitor" JPEGs numbered 07-46, four rows of 10, with
     names under each row. Each tile has a burned-in number and an amber ► when
     its original animates.
   - A folded 31-column intro index by family, *Disk 2: plain text*, and the
     links to all 260 headers and all 153 styles.
5. **► Release info.** A 31-column NFO footer ending in `[ EOF ]`, a links
   row, and a `<sub>` with the homage note and the showcase-provenance line.

## What is new compared with the concept spec and brief

- **Flow animation (`flow.svg`).** The brief had only text for the numbered
  flow; this diagram makes it the visual centre of section 2. Its loop starts
  on the finished frame (a -10.5 s delay), so a first-frame renderer, a paused
  tab or reduced motion all show the whole story.
- **Engine buttons (`engine-claude.svg`, `engine-codex.svg`).** They sit under
  the pitch in loader-strip style ("SIGN IN TO ◄ CLAUDE CODE ►" / "OR SIGN IN
  TO ◄ CODEX ►") and link to each agent's install page. This is the per-agent
  install-link graft, and it makes the Claude-or-Codex choice visible before
  any prose.
- **31 columns, not 34.** The calibrated preview shows a 309 px phone column,
  which fits about 31 monospace columns beside the copy button. Every text
  block is 31 columns or fewer except the exact installed-HTML sample, which
  is 35 (one `src="..."` attribute cannot wrap). It is folded inside
  `<details>`.
- **Picks changes** (all recorded in `src/picks.json`):
  - ultra-satisfactory/11 is replaced by castaway/57 (sunset road). castaway/35
    failed the scan because its page names real groups.
  - castaway/27 (tunnel lagoon) is out because its scroller reads "LOOKUP
    LAGOON PRESENTS". ultra-satisfactory/42 (aero gloss) takes featured slot 02,
    so the featured row is not all Castaway.
  - Wall tiles castaway/21, 28 and 29 are out because their stills spell
    PRESENTS.
  - Every ultra-satisfactory page with the NFO joke "Protection: none" is out
    (07, 08, 09, 18, 20, 22, 23, 28), because "protection" is on the shared
    piracy list.
  - ultra-satisfactory/21 is on the deny list. castaway/24 ("skinned rip
    installer" in the catalogue) was not used.
  - Replacements come from heretic (pc-11, c64-08, c64-14, trk-03, nfo-02,
    ansi-04, mach-07, mach-09, hack-10, idle-02, idle-07, demo-10), gl4ss/04,
    ultra-satisfactory 26, 27, 40 and 41, and castaway 30 and 60.
  - The wall has 16 Castaway tiles out of 40 (cap 16) after the review swap.
- **Captions** are original short names, never catalogue names. Alt text is
  "NN Project: caption (animated)".
- **Hero signature.** It names catalogue styles c64-12 and c64-02 (chrome logo
  and sine-wave letters) by id only. The brief's pc-05 example was not used,
  because that catalogue entry's name contains piracy vocabulary.

## What still depends on unbuilt pipeline work

All of the instructions describe the TARGET pipeline (see `chief.json`
`pipeline_spec_md`). None of it is built today:

- the npm package `readme-nfo` (today: `npx --yes github:lukexyz/README.NFO <url> -10`, which needs Git);
- Claude Code support, `--claude` / `--codex`, and engine auto-detection (today: Codex only);
- local-folder mode, so private repos work with no token (today: `GH_TOKEN` is required);
- the live numbered gallery, the "Install which header?" prompt and `use N`
  install into `.github/readme-nfo/` with marker comments (today: manual copy);
- `more` with continuous numbering, no repeats and one cumulative gallery page
  (today: each batch restarts at 01 in its own folder);
- `--jobs`, retry-then-skip, `--resume` and `--no-open` as described;
- the agent-chat route ("Get me 10 headers from README.NFO") via a plugin or skill;
- `readme-headers/` being kept out of git via `.git/info/exclude`.

The flow diagram, the transcript, the DISK card and the hero's loader strip
all show that target behaviour. Shipping this page before the pipeline lands
would need the interim copy described in concept §8.

Other open points:

- The ten-header time ("a few minutes, 3 at a time") is an estimate from
  single-header trials, not a measured run.
- `social.png` has to be uploaded by the owner in repository settings.
- shoot.mjs freezes animations that start below the fold (Chromium does not
  advance SVG-in-`<img>` animation off-screen), so its t0 and t4000 page shots
  of the hero are identical. Motion was checked by shooting the SVGs directly
  at 0 / 300 / 4000 / 4500 / 6000 ms (hero) and 0 / 3000 / 5300 / 8000 ms
  (flow), plus a reduced-motion still of each.

## How to rebuild

Run from the repository root. Everything is deterministic: seeded stars, no
clock and no randomness.

```sh
node docs/front-page/boot-intro/src/build.mjs
node tools/front-page/render.mjs docs/front-page/boot-intro
node tools/front-page/shoot.mjs docs/front-page/boot-intro --times=0,4000
```

`build.mjs` runs these scripts in order:

| Script | Makes |
| --- | --- |
| `hero.mjs` | `assets/hero-dark.svg`, `assets/hero-light.svg`. Fails over 100 KB or on `<text>`, `<script>` or external refs. |
| `bars.mjs` | `assets/bar-1..4.svg` (830x8 copper bars) |
| `buttons.mjs` | `assets/engine-claude.svg`, `assets/engine-codex.svg` |
| `flow.mjs` | `assets/flow.svg` |
| `social.mjs` | `assets/social.png` (1280x640, the reduced-motion hero still). Needs Playwright. |
| `thumbs.mjs` | `assets/thumbs/07..46.jpg` and a review sheet `_sheet.png`. Needs Playwright; Chromium runs with `--force-prefers-reduced-motion`, so each tile is the artist's composed still. |
| `readme.mjs` | `README.md`. `--check` exits 1 if it is stale. |

Shared modules:

- `fonts.mjs`: original 5x7, 8x8 bold and 7x9 logo bitmaps, plus path helpers.
- `picks.json` and `picks.mjs`: the curated picks. `picks.mjs` resolves each
  pick and checks that its page and SVG are tracked, finds its size, whether it
  animates and whether it honours reduced motion, reads its style id from
  `examples/build-log.csv`, and runs `deny.mjs` over the page and SVG.
- `deny.mjs`: piracy vocabulary and real group names. `readme.mjs` also scans
  the page's own copy with it, rejects stale numbers (152, 320, 164, "twelve
  galleries"), and checks that every linked local file exists.

`build.mjs --no-thumbs` skips the slow thumbnail step.

Lint used: `tools/render.mjs` reported 0 errors and 0 warnings. `tools/preview.mjs`
reported every code block clean, and both heroes and the flow SVG honour
reduced motion. Its "MISSING image ref" lines on the README are expected:
preview.mjs resolves paths from the README's own folder, but this README is
written for the repository root.

## Review

Adversarial review against `brief-02.md`, 2026-11-11.

**What I checked**

- Rendered with the GitHub Markdown API: lint 0 errors, 0 warnings. Shot the
  page at 0, 2000 and 4000 ms on desktop (light and dark) and on a phone. Shot
  the hero and the flow SVGs directly at several times, plus their
  reduced-motion stills.
- An independent node check: 130 refs, 119 local, 0 missing, every linked
  example tracked in git. No `<style>`, `<script>`, inline `<svg>`, `class=` or
  `style=` outside code blocks. No deny-list words or stale numbers in the copy.
  1,372 KB of local images.
- Determinism: I ran hero, bars, buttons, flow and readme twice. The SVGs and
  README hashes were identical, and `readme.mjs --check` passes.
- Counts (153, 13, 59, 260, 8, 74 s, 2 min 31 s) match the shared facts. The
  steps and the Claude/Codex, private-repo and Want-more paragraphs match the
  canonical text word for word.

**Fixes**

- Wall 08 swapped ultra-satisfactory/13 (chrome spheres) for castaway/03
  (hijacked desktop). The chrome-spheres art reads "REFLECTIVE ASSETS DIVISION
  presents". The builder already dropped three tiles for spelling PRESENTS, so
  this one was inconsistent. Its caption also echoed the catalogue name.
- The Disk 2 text example swapped castaway/07 for heretic/36 (same style,
  nfo-04). Castaway/07's NFO art reads "presents, eventually". The link text
  now comes from `picks.json` captions ("outline-letter NFO"), not the
  catalogue name.
- `flow.svg`: card 17 read AMIGA, a trademark in our own art. It now reads
  COPPER.
- Hero signature: it was a 3-line sub on phones. It now reads "Hero drawn in
  styles c64-12 and c64-02 by a seeded Node script", and each id links to its
  catalogue entry.

**Left as is (noted)**

- ultra-satisfactory/10's page prose says "Co. presents". Its art does not,
  so I kept it.
- The two ultra-satisfactory featured pieces carry the user's own project's
  "not affiliated with" fan-project line, which names a studio. It comes from
  the user's own gallery.
- `examples/README.md` (the "All 260 headers" link) still uses piracy
  vocabulary in its dance-vision row. That is outside this folder; it needs
  fixing in the repo before this ships.
- On phones the flow diagram's pixel text is about 5 px tall. The DISK card
  under it carries the meaning.

**Verdict.** It is still the strongest motion-led concept. The hero is real
craft: chrome logo, three-layer stars, a working CLAUDE CODE / CODEX flip and
a composed reduced-motion still. The instructions sit straight under the first
heading, and the flow SVG makes "pick 3, make 10 more, 11-20 on one page"
legible at a glance. Ship-quality as a design. It is gated only on the unbuilt
pipeline and on the examples index wording.
