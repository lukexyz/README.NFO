---
name: headers
description: Draws numbered retro README headers (scene NFO, keygen, cracktro, BBS and 150 more styles) for the current project with README.NFO, installs one, or makes more. Use when the user asks for README headers, a README banner, or README.NFO, says "number N" or "use N" after a header gallery, or asks for "10 more" / "make more" headers.
---

# README.NFO headers

You draw the SVGs yourself; the `readme-nfo` CLI picks the styles, keeps the
numbering, validates your files, builds the gallery and installs the pick.
Work in the user's project root. **Never run `git commit`** (or push): the user
reviews and commits. Change no files except the SVGs the CLI asks for, plus
what `use` writes.

## 1. Find the CLI (once per conversation)

Use the first that works and call it `NFO` below. A candidate works when
`<candidate> --capabilities --json` exits 0 and its `commands` list has `brief`.

1. `node <path>` if the env var `README_NFO_CLI` points at a checkout's `tools/generate.mjs`.
2. `npx --yes readme-nfo@latest`
3. `npx --yes github:lukexyz/README.NFO`

<!-- Why this order: the plugin does not bundle the CLI, because it needs the
whole style catalogue and generator, and a copy would drift from the repo. npm
is the one source of truth once published; GitHub is the fallback until then;
README_NFO_CLI is for offline or checkout use. The capabilities check rejects
an older build without agent mode, so a stale cache cannot be used by mistake. -->

None works: tell the user it needs Node.js 22+ and network access for `npx`
(in a Codex sandbox, ask to run it with network), and stop.

## 2. "Get me N headers" or "make N more"

Default N is 10. Both are the same steps; numbering always continues (11-20...)
and styles never repeat.

1. Run `NFO brief --count N --no-color` (plain output, not `--json`: the JSON
   holds every full brief and gets truncated). Each header prints its number,
   a `brief` file and a `save` path. Where it says `npx readme-nfo`, use `NFO`.
2. For each header, read its brief file and draw ONE SVG that follows it
   exactly, saved as UTF-8 at its `save` path (create the `assets` folder
   if it is missing). The brief is the spec: keep the style it was given,
   use only the project facts it lists. In short: one
   self-contained SVG, no scripts, `foreignObject`, external fonts, images or
   links; slow CSS animation only, with the `prefers-reduced-motion` rule; title
   readable at 375 px; under 20 KB. If you can run subagents, give each one a
   single brief and save path.
3. Run `NFO check --no-color`. Fix every header marked `NEEDS WORK` at its save
   path and re-run until this batch's numbers say `OK` (exit 1 means
   something still fails). Give up on a header after three tries and say so.
4. Reply with the `GALLERY` link and a numbered list, one line each:
   `03  <style name from its brief> - <one-line idea>`. End with:
   say "number N" to install one, or "make 10 more".

## 3. "number N" (or "use N")

Run `NFO use N`. Report the files it changed and tell the user to review
with `git diff` and commit when happy. Picking another number swaps the header.
