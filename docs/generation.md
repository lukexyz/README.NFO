# Generate headers for a project

You need Node.js 22+ and either [Claude Code](https://claude.com/claude-code) or [Codex](https://developers.openai.com/codex), signed in. In your project's folder, run:

```sh
npx readme-nfo
```

A gallery opens in your browser and fills with 10 numbered headers as they are drawn. When the run ends, the terminal asks `Install which header? [1-10, Enter = later]`. Type a number and that header goes at the top of your README. Review it with `git diff`, then commit. Nothing is committed for you.

> `readme-nfo` is not on npm yet (it will be published as `readme-nfo@0.1.0`). Until then, run it from a checkout: `node path/to/README.NFO/tools/generate.mjs`, from inside your project folder.

## Commands

```text
npx readme-nfo            10 new headers, numbered 01-10
npx readme-nfo more       10 more, numbered 11-20 (then 21-30, ...)
npx readme-nfo use 14     put header 14 at the top of your README (swaps any earlier one)
npx readme-nfo retry      redraw headers that were skipped or interrupted, same numbers and styles
```

Numbers never restart and no style repeats within a project's gallery. Every batch lands on the same page, `readme-headers/index.html`, under its own `CREDIT N` divider, and every card shows its number and its `npx readme-nfo use N` line. Running plain `npx readme-nfo` again also continues the numbering; `more` is the same thing, but says so and refuses to start a new gallery.

Each run ends with plain next steps:

```text
  READY      10 of 10 headers (11-20) in 4:12
  GALLERY    file:///.../readme-headers/index.html
  INSTALL    npx readme-nfo use <N>
  MORE       npx readme-nfo more
```

## Claude or Codex

README.NFO uses whichever agent you are signed in to:

1. `--claude` or `--codex` wins. If that agent isn't ready, it stops before writing anything and says how to sign in.
2. Otherwise it checks both at once (about 3 seconds): `claude auth status` or `ANTHROPIC_API_KEY`, and `codex login status` or `CODEX_API_KEY`.
3. If exactly one is ready it uses that one and shows `AGENT Claude Code (switch: --codex)`, with the plan type only (never your email or organisation).
4. If both are ready, it asks once and remembers your answer in `readme-headers/draw.json`. A run that can't ask (no terminal, or `--json`) uses Claude Code and says so.
5. If neither is ready it prints both sign-in hints and exits.

How each agent is called:

- **Claude Code:** `claude -p --output-format json --json-schema <schema> --tools "" --no-session-persistence --permission-mode dontAsk --model sonnet` (plus `--safe-mode` when your Claude Code has it), with the brief on stdin. No tools, so it cannot read or change files. `--bare` is never used, because it ignores claude.ai sign-ins.
- **Codex:** `codex exec --sandbox read-only --skip-git-repo-check --ephemeral --output-schema <schema>`, brief on stdin. Without `--model`, it adds `--ignore-user-config -c model_reasoning_effort="medium"`, so a slow high-effort setting in your `~/.codex/config.toml` is not inherited (sign-in still comes from your Codex home). With `--model NAME` it passes `-m NAME` and keeps your config.
- **Windows:** both commands are found through `PATH` and `PATHEXT`, so npm `.cmd` shims work; `.cmd` files run through `cmd.exe /d /s /c` with every argument escaped.

`--model NAME` chooses the model for either agent (Claude defaults to `sonnet`).

## What gets read and what leaves your machine

With no URL, README.NFO reads the project on disk: the git root (or the nearest folder with a manifest), the `origin` remote from `.git/config` (any host, or none), the README's first real paragraph and its `##` headings, `package.json`, `pyproject.toml`, `Cargo.toml` or `go.mod` for the name, description and keywords, the licence file, and languages measured by the size of tracked files (`git ls-files`). It makes no network call and needs no token, so private, internal, GitLab, self-hosted and unpushed projects all work.

The only thing that leaves your machine is the authoring brief: those project facts plus the style briefs, sent to the agent you picked, under your own sign-in. Project text is passed as data, and the brief tells the agent never to follow instructions found in it. What comes back is SVG text, which is validated and saved; it is never executed.

**Not cloned?** `npx readme-nfo github.com/owner/repo` reads GitHub's API instead and keeps that gallery in `readme-headers/owner-repo/`. For private repositories it uses `GH_TOKEN` or `GITHUB_TOKEN`, and if neither is set, the token from `gh auth token`.

## How a batch is drawn

1. **Draw.** N distinct styles are drawn at random from the 153-style catalogue, leaving out every style already in this gallery. The numbers and styles are written to `readme-headers/draw.json` before any agent is called.
2. **Author, 3 at a time.** Each header is one agent request: the project facts, the style's brief (visual signature, palette, typography, motion notes) and a technique sample. `--jobs N` changes how many run at once (1-8). If the agent reports a rate limit, the run drops to one at a time for the rest of the batch.
3. **Check, repair once, or skip.** Each answer must be well-formed SVG with a title naming the project and a description; no scripts, events, `foreignObject`, remote resources or embedded rasters; and at least two recorded artistic choices. A header that fails gets one repair attempt, with the checker's complaints and the previous SVG. If it fails again it is skipped and the batch carries on; `npx readme-nfo retry` redraws it later. A sign-in failure stops the remaining queue rather than failing every header.
4. **Gallery.** The gallery is written before the first header lands and rewritten after every one, and it reloads itself every 5 seconds while the run is live. It stops refreshing when the run ends. Ctrl+C keeps every finished header and marks the rest for `retry`.

**Legibility.** The brief asks for a title at least 12 px tall when the image is shown 375 px wide (a phone). The CLI measures the largest text from the viewBox and records a warning in `draw.json` if it is smaller. It is a warning, not a failure, because text-art styles build their lettering from small glyphs. The CLI does not look at the pictures; review the gallery on desktop and phone sizes before you pick.

**Samples.** Technique samples come only from `styles/samples.json`, which ships in the package. `node tools/build-samples.mjs` builds it from example sets committed to git (read from `HEAD`), so untracked work in a checkout never reaches a brief. `npm run validate` fails if the bundle is stale.

**Time.** Measured per header: about 40-75 s with Claude Sonnet and 1-6 min with Codex, depending on model and effort. With 3 at a time, 10 headers is roughly 3-12 minutes with Claude and 8-28 minutes with Codex. The terminal shows an estimate for your agent and batch size; treat it as a range.

## Installing a header: `use N`

`npx readme-nfo use 3`:

- copies header 03 to `.github/readme-nfo/header.svg` and README.NFO's MIT notice to `.github/readme-nfo/LICENSE`. On a later `use`, it replaces only files it wrote; a different file already at that path is left alone and reported.
- finds the root README case-insensitively (`README.md`, `readme.md`, `README.markdown`, `README`) or creates `README.md` with the header, a `# name` heading and the description.
- puts this block at the very top, or replaces it if it is already there:

  ```html
  <!-- README.NFO header: start -->
  <p align="center"><img src=".github/readme-nfo/header.svg" width="100%" alt="NAME header"></p>
  <!-- README.NFO header: end -->
  ```

  The image path is worked out relative to the README. The alt text is neutral: it names your project and never the catalogue style, because some style names mention real groups or products.
- keeps the README's line endings and byte-order mark, refuses to write through symlinks, and never commits.

To undo, delete the block and `.github/readme-nfo/`.

## Files

Everything README.NFO makes lives in `readme-headers/` in your project, and `/readme-headers/` is added to `.git/info/exclude` so it stays out of commits without touching your `.gitignore`.

```text
readme-headers/
  index.html        the gallery (all batches)
  draw.json         {next, usedIds}, every numbered header and batch, the saved agent choice
  project.json      the project facts sent to the agent
  LICENSE           README.NFO's MIT notice
  assets/NN-id.svg  the headers
  src/NN-id.art.json  each header's recorded artistic choices
  _author/NN-id/    brief, schema, answer and log for each request, for diagnosis
```

`draw.json` is data: paths are recomputed from validated numbers and style IDs, never taken from the file. Only one run at a time can use a gallery (`readme-headers/.lock`; a lock left by a dead process is taken over).

## Options

```text
-N, --count N      how many headers (default 10, up to the styles left)
--claude, --codex  choose the agent
--model NAME       agent model (Claude: sonnet; Codex: its default at medium effort)
--jobs N           headers drawn at once (default 3, up to 8)
--json             machine-readable output and no prompts
--no-open          don't open the browser; the gallery link is still printed
--no-color         plain output (NO_COLOR also works; redirected output is always plain)
--format TYPE      catalogue treatments: all, svg or text
--seed TEXT        repeat a draw (same catalogue, gallery history and count)
--out DIR          use another gallery folder
--project FILE     use a saved project.json instead of reading the folder
--capabilities     print what this build supports, as JSON
```

The retired `--resume`, `--exclude`, `--allow-repeats` and `--creativity` options stop with a short explanation: `retry` replaces `--resume`, and the gallery's own `draw.json` replaces the history options.

## Ask your agent

Install the README.NFO plugin once, then in any project ask your agent: "Get me 10 headers from README.NFO", then "number 3" to install one, or "make 10 more" for 11-20. Your agent draws the headers itself, using the `brief`, `check` and `use` commands below. It never commits.

```sh
# Claude Code
claude plugin marketplace add lukexyz/README.NFO
claude plugin install readme-nfo@readme-nfo

# Codex
codex plugin marketplace add lukexyz/README.NFO
codex plugin add readme-nfo@readme-nfo
```

Inside a Claude Code session, `/plugin marketplace add lukexyz/README.NFO` and `/plugin install readme-nfo@readme-nfo` do the same. The plugin runs `npx readme-nfo`. Until that is published it falls back to this repository on GitHub, or to a checkout if you set `README_NFO_CLI` to its `tools/generate.mjs`.

## For scripts and agents

**`--json`.** Every command prints one JSON object on stdout; progress goes to stderr; nothing prompts. A run reports the agent, the batch range, each header's number, status, SVG path and `use` command, and the same next steps as the terminal:

```json
{ "ok": true, "command": "more", "batch": { "batch": 2, "from": 11, "to": 20 },
  "headers": [{ "number": 11, "id": "trk-08", "status": "ok", "svg": "...", "use": "npx readme-nfo use 11" }],
  "next": { "install": "npx readme-nfo use <N>", "more": "npx readme-nfo more" } }
```

Errors print `{ "ok": false, "error": "..." }` and exit 1.

**Agent mode: `brief` and `check`.** An agent plugin can let the host agent draw the SVGs itself, with no nested `claude -p` or `codex exec` (a Codex sandbox may block `npx` and the network):

1. `npx readme-nfo brief --count 10 --json` reads the project, draws styles not yet in the gallery, reserves the next numbers in `draw.json` and prints one entry per header: `number`, `id`, `svgPath` (where to save the SVG), `briefPath` and the full `brief` text. The brief has the same rules as the CLI's, asking for a file instead of a JSON answer.
2. The agent draws each header and saves it as UTF-8 SVG at its `svgPath`.
3. `npx readme-nfo check --json` validates every reserved, skipped or interrupted number that has an SVG (the same checks as the CLI, plus a rejection of an image identical to another header's), marks the good ones ready and rebuilds the gallery. It lists `issues` for each header that still needs work and exits 1 until all of them pass, so the agent can fix and re-run it.
4. `npx readme-nfo use N` installs the pick, as above.

"Make 10 more" is another `brief`: numbering and the no-repeat rule are shared with the CLI path.

**`--capabilities --json`** describes this build: agents and their flags, local and URL modes, style and sample counts, batch defaults, numbering, install paths and markers, and the list of commands.

## Run from this checkout

```sh
node tools/generate.mjs              # inside the project you want headers for
npm test                             # unit tests (no agent or network calls)
npm run validate                     # tests, samples freshness and the repository checks
npm run samples                      # rebuild styles/samples.json after committing example changes
npm run pack:check                   # assert what npm pack ships
```

See [development instructions](development.md) for browser previews and repository validation.
