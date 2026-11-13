# Musings

## 2026-10-08 — Next priorities

The core is published: 260 examples, 153 distinct style briefs, fresh generation
by default, a purple terminal interface with header and batch progress, and
resumable batches. The current validation workflow passes.

The next focus should be making new batches consistently good and easier to use.

1. [ ] **Check how generated headers actually look.** The CLI validates SVG
   structure and image restrictions, but does not visually inspect its output.
   Add desktop and mobile rendering checks for clipping and readability, with
   previews for reviewing composition and variation.
   *Partly done (2026-11-13):* the gallery now fills live and the CLI records a
   warning when the largest text is under 12 px at 375 px wide. No rendering check yet.
2. [x] **Automatically repair failed headers.** Invalid authoring output currently
   stops the run and requires `--resume`. Add a bounded repair/retry step for the
   affected header, preserving completed images and the original style draw.
   *Done:* one repair attempt with the checker's complaints, then skip and carry on;
   `npx readme-nfo retry` redraws skipped headers with the same numbers and styles.
3. [x] **Make choosing a favourite finish the job.** Add a “Use this header” flow
   that copies the chosen SVG and MIT notice into the target repository and
   prepares a reviewable README change, like the manual installation in luketools.
   *Done:* `npx readme-nfo use N` and the end-of-run "Install which header?" prompt.
4. [x] **Test the CLI on Windows in CI.** CI currently runs on Linux. Add coverage
   for Windows paths, terminal output, process handling and browser launching.
   *Done:* `windows-latest` added to the workflow (not yet run on GitHub), plus a test
   that sends awkward arguments through a real `.cmd` shim.
5. [ ] **Tidy up the release.** Assign a proper version instead of `0.0.0`. Consider an npm release
   later if a shorter installation command would help.
   *Partly done:* the package is `readme-nfo@0.1.0` and `npm run pack:check` asserts what it
   ships. Publishing to npm (and a release workflow with provenance) is still for the owner.

Start with visual quality and automatic repair. There are already plenty of
examples; reliability and the quality of each new batch should come first.

These are proposed next steps, not features that are already implemented.

### Usability changes

- [x] Remove the creativity setting and mixed batches: every new header is freshly authored.
- [x] Simplify the README command to just the repository and header count.
- [x] Keep terminal progress inside one compact purple ASCII frame, updated in place.

## 2026-11-13 — `npx readme-nfo` pipeline

Built the pipeline the Arcade Floor front page describes (spec changes 1-11 in
`comparisons/front-page/build/chief.json`). See [docs/generation.md](docs/generation.md).

- [x] Samples ship in `styles/samples.json`, built from committed example sets only (153 styles).
- [x] Package renamed `readme-nfo@0.1.0`; the dead `examples/*/src/` glob is gone.
- [x] Claude Code and Codex drivers, sign-in detection, Windows `.cmd` resolution; `--claude`, `--codex`, `--model`.
- [x] Local project reader is the default: any git host or none, no token, no network.
- [x] URL mode falls back to `gh auth token`.
- [x] 3 headers at a time (`--jobs`), one repair, skip on failure, back off to 1 on rate limits.
- [x] Continuous numbering in `readme-headers/draw.json` (`next`, `usedIds`); `more` never repeats a style.
- [x] One live gallery with a divider per batch and a `use N` line on every card; neutral alt text.
- [x] `use N` installs into `.github/readme-nfo/` with a marked README block; end-of-run pick prompt (TTY only).
- [x] `--json`, `--capabilities --json`, `brief` and `check` for agent plugins.
- [x] CI: `windows-latest` and an `npm pack` assertion.
- [ ] Publish to npm (owner). Until then `npx readme-nfo` does not resolve.
- [ ] Agent plugin/skill for the chat route (spec change 13), built on `brief` and `check`.
- [ ] Visual QA of generated headers (clipping, overlaps, small secondary text).
