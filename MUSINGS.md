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
2. [ ] **Automatically repair failed headers.** Invalid authoring output currently
   stops the run and requires `--resume`. Add a bounded repair/retry step for the
   affected header, preserving completed images and the original style draw.
3. [ ] **Make choosing a favourite finish the job.** Add a “Use this header” flow
   that copies the chosen SVG and MIT notice into the target repository and
   prepares a reviewable README change, like the manual installation in luketools.
4. [ ] **Test the CLI on Windows in CI.** CI currently runs on Linux. Add coverage
   for Windows paths, terminal output, process handling and browser launching.
5. [ ] **Tidy up the release.** Simplify the README command to match the all-fresh
   default and assign a proper version instead of `0.0.0`. Consider an npm release
   later if a shorter installation command would help.

Start with visual quality and automatic repair. There are already plenty of
examples; reliability and the quality of each new batch should come first.

These are proposed next steps, not features that are already implemented.
