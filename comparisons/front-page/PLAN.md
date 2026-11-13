# README.NFO front page: plan

Date: 2026-11-11. Inputs: three research reports in `research/`, ten concept specs in `concepts/`, four judges.
Next step: four concepts are built as HTML previews in `build/`. You pick one, and it becomes the README.

---

## 1. What's wrong with the front page today

- **It doesn't say what the tool is.** There's no title and no one-line pitch. The first line is "Generate ten headers for your project:".
- **The instructions are niche, and on some machines they don't work.** The one command is 62 columns long: `npx --yes github:lukexyz/README.NFO github.com/you/project -10`. It needs Git and a signed-in Codex CLI. It has no Claude option. Private repos fail with a 404 unless you set GH_TOKEN. Under npx it ships 0 sample generators. On Windows, an npm-installed Codex can't be started (the `codex.cmd` spawn bug).
- **Nothing tells you what happens after the run.** Installing the header is a manual copy-and-paste. Each batch restarts at 01 in its own folder.
- **Too few examples, and they're the wrong ones.** It shows 7 images, all of README.NFO itself, and all of them say "152 styles" (the real count is 153).
- **The numbers are wrong in several places.** "320 headers · twelve galleries" matches no real count. The gallery table links 8 MediaLog folders that aren't committed, so they would 404.
- **It's wonky on phones.** The command scrolls sideways and hides the URL you need to edit. The table takes 62% of the page. The footer NFO is clipped to about 33 columns, and its right border is one column off.
- **In light mode the hero is a black slab.**
- **The live page and this branch have diverged.** origin/main has three web-edited README commits, including the typo "We have 153-style catalogue supplies briefs".

## 2. The ten concepts

| # | Concept | In short | Spec |
|---|---|---|---|
| 01 | **The Release** | The page is README.NFO's own release NFO: a half-block logo, then RELEASE INFO, INSTALL NOTES, ENGINE, SAMPLE OUTPUT, CONTENTS, CREDITS and `[ EOF ]`. Dark mode is an NFO viewer; light mode becomes a green-bar printout. | [01-the-release.md](concepts/01-the-release.md) |
| 02 | **Boot Intro** | The page boots like a 16-bit intro: a chrome logo, a starfield and a sine scroller. A loader strip flips between ENGINE CLAUDE CODE and CODEX. PRESS SPACE scrolls you down to the real steps. Below is an "intro select" wall of numbered headers. | [02-boot-intro.md](concepts/02-boot-intro.md) |
| 03 | **SETUP.EXE** | A skinned late-90s game installer that installs a header into your README. The page is Step 1 of 3 (engine), Step 2 (run), Step 3 (pick), then Finish with the exact diff and how to uninstall. | [03-setup-exe.md](concepts/03-setup-exe.md) |
| 04 | **Select Your Fighter** | An arcade versus screen: your repo against 153 styles, a character select of CLAUDE CODE / AUTO / CODEX, and ten rounds with a winner that goes on top of your README. | [04-select-your-fighter.md](concepts/04-select-your-fighter.md) |
| 05 | **BBS Local Logon** | A 90s ANSI bulletin board. Hotkey menu items jump to sections, 13 file areas list the headers, and the generator is a "door". "Local logon" means it reads your folder, so private repos just work. | [05-bbs-local-logon.md](concepts/05-bbs-local-logon.md) |
| 06 | **Arcade Floor** | An arcade after closing time. One cabinet runs an attract loop in front of 50 numbered cabinets, each a real header. INSERT COIN is `npx readme-nfo`. The cards match the gallery you get back, so "number 3" and "10 more = 11-20" are obvious. | [06-arcade-floor.md](concepts/06-arcade-floor.md) |
| 07 | **Diskmag Issue #01** | A disk magazine: a contents-screen cover, a coverdisk with the install, reviews, a Claude vs Codex shootout, charts and letters (the FAQ). Light mode is the print edition, dark mode the disk edition. | [07-diskmag-issue-01.md](concepts/07-diskmag-issue-01.md) |
| 08 | **Options Screen** | Console game menus. PRESS START is the command. Each OPTIONS row is a real flag (ENGINE ◄ AUTO ►). EXTRAS holds the unlockables wall, and SAVE + LOAD is the install. Unbuilt features show as LOCKED rows. | [08-options-screen.md](concepts/08-options-screen.md) |
| 09 | **One Take** | The hero is a real, uncut recording of `npx readme-nfo` on a pixel monitor with a tape deck. Below it: three steps, a cue sheet and a 110-frame wall of real headers. | [09-one-take.md](concepts/09-one-take.md) |
| 10 | **Autorun** | A Y2K PC-game CD: a chrome autorun window with INSTALL / DEMOS / README / EXIT, loading tips for engine choice and private repos, a demo disc of 42 headers and a jewel-case NFO. | [10-autorun.md](concepts/10-autorun.md) |

## 3. Evaluation

Four judges each scored every concept out of 10:
- **Scene:** does it read as a sick 90s/2000s gaming NFO?
- **Simplicity:** are the instructions as simple as possible?
- **Showcase:** examples, phones, light/dark, page weight.
- **Pipeline:** does it fit, and teach, the whole run → pick → install flow, and is it maintainable?

| # | Concept | Scene | Simplicity | Showcase | Pipeline | **Total /40** |
|---|---|---:|---:|---:|---:|---:|
| 06 | Arcade Floor | 6 | 9 | 9 | 9 | **33** |
| 05 | BBS Local Logon | 7 | 8 | 8 | 8 | **31** |
| 01 | The Release | 8.5 | 7 | 8 | 7 | **30.5** |
| 10 | Autorun | 7 | 7 | 7 | 7 | **28** |
| 02 | Boot Intro | 8.5 | 7 | 7 | 5 | **27.5** |
| 08 | Options Screen | 5 | 8 | 6 | 7 | **26** |
| 09 | One Take | 5 | 8 | 8 | 5 | **26** |
| 03 | SETUP.EXE | 7.5 | 6 | 6 | 6 | **25.5** |
| 07 | Diskmag Issue #01 | 7.5 | 5 | 5 | 4 | **21.5** |
| 04 | Select Your Fighter | 4.5 | 5 | 7 | 4 | **20.5** |

## 4. The four picks

The rule: take the top scorers, but make sure the four are really different, so the choice means something.

1. **06 Arcade Floor (33): the arcade.** It is the best at showing your core flow: numbered cards, "number 3", and "10 more" gives 11-20. The front-page cards are the same cards the CLI gallery returns. Its weak spot is scene flavour (6), so its build adds an NFO-style GAME OVER card and a high-score block.
2. **05 BBS Local Logon (31): the terminal.** It's the only concept where numbered file listings and "make 10 more" are native to the fiction, and "local logon" turns the private-repo fix into part of the story. Its build trims the 13 areas so the page doesn't read like a catalogue.
3. **01 The Release (30.5): the text file.** It is the purest NFO, and it ties the scene judge's top score (8.5). The light-mode printout is the best answer to the black-slab problem. Its build adds 06's numbered-batch card so the core flow shows.
4. **02 Boot Intro (27.5): the intro.** It also scored 8.5 on scene, and it has the most "whoa" in the first two seconds. Its build fixes the judges' complaint: the scroller is decoration only, and every instruction is plain text directly below.

**Why not 10 (28)?** It scored half a point more than 02, but it is the closest to the others in feel: a chrome app window like 03, a static wall like 01, and loading-tip copy that 06 and 05 already cover. 02 gives a genuinely different first impression (motion-led cracktro grammar, not UI chrome). Several of 10's best ideas are grafted into the builds:
- the hero is a real catalogue-style header made by the tool's own generators;
- the `--capabilities` truth gate;
- per-agent install links beside the sign-in step.

**Ideas every build takes from the others:**
- From 09: the bare command sits above the steps.
- From 08: "The defaults are good."
- From 03: a "what changes in your repo, and how to undo it" note.
- From 01 and 07: a "same style, three projects" row (gl4ss, naturalis-historia, st3gg).
- From 06, 05 and 09: numbered tiles in rows of 10, which fall to 5 across on desktop and 2 on phones.
- From 01: an amber ► badge on tiles whose original is animated.
- At least 6 live animated headers on the page.
- Castaway capped at about 40% of the tiles.

## 5. The target pipeline (all four pages describe this)

### What you'll be able to do

```
npx readme-nfo            # in your project folder: 10 numbered headers + one gallery page
npx readme-nfo use 3      # put number 3 at the top of your README
npx readme-nfo more       # 10 more styles, numbered 11-20, same gallery, no repeats
```

Or, from inside Claude Code or Codex: *"Get me 10 headers from README.NFO"*, then *"number 3"*, or *"make 10 more"*.

- **Engine.** `--claude` or `--codex` chooses. Without a flag, it uses whichever one is signed in. If both are, it asks once (a non-interactive run uses Claude and says so). If neither is, it prints both sign-in hints and writes nothing.
- **Private repos.** By default it reads your local folder: git remote (any host, or none), README, package metadata, languages and licence. It never calls GitHub and needs no token. Your project facts go only to the agent you chose, under your own sign-in. URL mode (for projects you haven't cloned) falls back to `gh auth token`.
- **Numbering.** `readme-headers/draw.json` keeps `next` and every used style id. Each batch continues the numbering (11-20, 21-30) and never repeats a style. There is one cumulative `readme-headers/index.html` with a divider per batch. It opens at once and fills as headers land, and every card shows its number and `npx readme-nfo use N`.
- **Install (`use N`).** Copies the SVG to `.github/readme-nfo/header.svg` and the MIT notice to `.github/readme-nfo/LICENSE`. Inserts or replaces a block between `<!-- README.NFO header: start -->` and `<!-- README.NFO header: end -->` at the top of README.md, with neutral alt text. Keeps line endings and BOM, never commits, and prints "Review with git diff, then commit." `readme-headers/` is added to `.git/info/exclude`.

### Ordered changes, with honest status

Everything below is **NOT BUILT** today. What works today is: `npx --yes github:lukexyz/README.NFO github.com/you/project -10`, Node 22+, Git, Codex only, `GH_TOKEN` for private repos, manual install, and every batch starts again at 01.

| # | Change | Files | Size | Status |
|---|---|---|---|---|
| 0 | Reconcile origin/main (three web-UI README commits) with this branch | git (owner) | S | not done |
| 1 | Ship committed samples: `styles/samples.json`, built only from committed sets; `sampleFor` reads only the bundle | tools/build-samples.mjs (new), hybrid-catalogue.mjs, package.json | S | not built |
| 2 | Agent registry: detection, Windows PATHEXT / `.cmd` via `cmd.exe /d /s /c`, `claude -p --output-format json --json-schema --tools ""` (never `--bare`) and `codex exec --sandbox read-only --output-schema` drivers, pinned model | tools/generator/agents.mjs (new), runtime labels | M | not built (Claude feasibility-tested: 74 s, passed validation) |
| 3 | Authoring: 3 at a time (`--jobs`, back off on rate limit), one repair retry, skip failures instead of stopping the batch, minimum text size check at 375 px | author.mjs, checks | M | not built |
| 4 | Local mode: no argument means the current folder; any host or no remote; URL mode falls back to gh | project.mjs, generate.mjs | M | not built |
| 5 | Continuous numbering and `more`: draw.json `{next, usedIds}`, one cumulative gallery, batch dividers, next-step lines plus `--json` for agents | batch.mjs, hybrid-output.mjs | M | not built |
| 6 | Live gallery: written after every header, opens at once, a `use N` line on each card, neutral alt text, card design shared with the front page | hybrid-output.mjs | S-M | not built |
| 7 | `use N` installer and the end-of-run "Install which header? [1-10, Enter = later]" prompt | tools/generator/install.mjs (new), generate.mjs | M | not built |
| 8 | `--capabilities --json`, so the front-page build can check every claim against the real CLI | generate.mjs | S | not built |
| 9 | Help text, AGENT row, honest time estimate | generate.mjs, terminal.mjs | S | not built |
| 10 | Tests: detection matrix, Claude JSON, `.cmd` resolution, local-reader fixtures, numbering across batches, install idempotency | *.test.mjs | M | not built |
| 11 | CI: windows-latest; assert that `npm pack` ships the samples; release on tag | .github/workflows | S | not built |
| 12 | Publish `readme-nfo@0.1.0` (the name was unclaimed on 2026-11-11) | npm (owner) | S | not done |
| 13 | Agent skill/plugin for the chat route. It hands briefs to the host agent, so it needs no nested `codex exec` (a Codex sandbox may block npx and network) | .claude-plugin/, .agents/plugins/, plugins/readme-nfo/ | L | not built |
| 14 | Clean up linked example pages: Dance Vision "cracked by" jokes, castaway/99 "supplied by", START-HERE "164", the readme-nfo set saying 152, group names in generator comments | examples/ (owner, after the other session lands) | S-M | not done |
| 15 | Front-page build: picks.json, computed facts, lint (columns, glyphs, deny-list, tracked links, weight), `--check` in CI | tools/front-page/ (new) | M | not built |

**Recommendation:** ship steps 0-12 first, then the chosen front page, once. The pages in `build/` show the target. A today-true variant is only a CI safety net, so you don't need to judge it.

### Open questions for you

1. With both agents signed in and no terminal attached: default to Claude, or refuse until you pass a flag?
2. Default batch size: 10, or 6 for a faster first gallery?
3. Install to `.github/readme-nfo/` (recommended) or to `assets/`?
4. Should the MediaLog sets be committed so the front page can show them?

## 6. Shared facts (computed 2026-11-11)

- **Styles:** 153 distinct in 13 families (157 catalogue entries).
  - By family: pc 14, c64 14, trk 11, nfo 11, ansi 11, vap 17, mach 13, hack 19, asia 7, idle 10, xfer 10, demo 11, print 5.
  - By medium: 128 can make an SVG (87 animated, 34 text plus SVG, 7 static); 59 can make text (34 text plus SVG, 25 text-only).
- **Committed example headers:** 260 in 8 galleries.
  - castaway 116, ultra-satisfactory 42, readme-nfo 41, heretic 40, dance-vision 6, naturalis-historia 5, gl4ss 5, st3gg 5.
  - That is 7 projects plus README.NFO's own set.
- **Committed SVGs:** 317, of which 264 are animated, and all of those honour reduced motion.
- **Not committed:** MediaLog (20 headers and 90 logos). Don't link it.
- **Measured times, one header each:** Claude Sonnet 74 s; Codex default 2 min 31 s; Codex xhigh about 6 min (October).
- **Showcase provenance:** the showcase headers came from long multi-pass Claude Opus workflow runs (median about 54 min a header). The CLI is faster and rougher.
