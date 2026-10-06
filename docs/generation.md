# Generate headers for a project

With Node.js 22+ and Git installed:

```sh
npx --yes github:lukexyz/README.NFO github.com/you/project -10 --creativity 0.9
```

Replace the URL with any GitHub repository, or use `owner/repo` shorthand. The finished gallery opens in your default browser, and the terminal prints its local `file:` link. Copy a chosen SVG into your project's `assets/` folder and paste its matching `.md` into your README. Keep the included MIT notice. Image paths are relative to your README.

## Counts and terminal display

`-15` and `--count 15` both work. The catalogue has **153** distinct style briefs; standalone mode has **26** independently composed renderers. Local-only draws can use the remaining local compositions. `--creativity 1` can draw up to all 153 briefs for fresh authoring. Duplicate catalogue aliases do not add choices. Previous draws and format filters can reduce either pool.

The terminal shows a purple ASCII README.NFO masthead and boxed catalogue, runtime and progress panels. The upper bar tracks the current header's five completed stages: brief prepared, request started, response received, SVG validated and image saved. Its percentage measures these stages; Codex does not provide a percentage for its writing step, so that stage shows a working indicator and elapsed time. The lower bar counts saved headers across the whole batch. Fresh headers are authored and saved individually, so the batch bar advances after each one and earlier results survive a later failure. The display also shows model and billing information. Draws above 15 show a large-draw warning with an estimated duration. Local estimates use a timed renderer sample; authoring estimates are rough planning ranges.

Standalone rendering uses no model or AI credits. Fresh artwork uses your local Codex CLI configuration and authentication. The terminal reports ChatGPT allowance or API-account billing, including a `CODEX_API_KEY` override, and displays the model/provider reported by Codex when authoring starts. README.NFO does not measure exact credits or cost. See the [Codex authentication guide](https://developers.openai.com/codex/auth/) and [noninteractive authentication documentation](https://developers.openai.com/codex/noninteractive/#authenticate-in-automation).

Use `--no-open` to leave the browser closed, `--no-color` to disable terminal colours, or `--format text` / `--format svg` to filter catalogue treatments. These treatment filters describe the design style; fresh text treatments are exported as SVG artwork. `NO_COLOR` is also respected. Redirected output keeps readable progress checkpoints without animation. If browser launching fails, the completed files and gallery link remain available.

## Choose the mix

`--creativity` sets the fraction of the batch that is newly authored. It is a batch ratio, not a model temperature or a percentage guarantee of artistic originality. The requested fraction is rounded to the nearest whole header. The single-dash spelling `-creativity` also works.

| Creativity | A batch of ten | Authoring step |
| --- | --- | --- |
| `0` (default) | Ten prebuilt scenes | Standalone |
| `0.5` | Five newly authored, five prebuilt | Codex CLI |
| `0.9` | Nine newly authored, one prebuilt | Codex CLI |
| `1` | Ten newly authored | Codex CLI |

Fresh scenes draw from every distinct entry in the [full catalogue](../styles/INDEX.md), including text treatments rendered as SVG. Each selected style supplies its visual signature, palette, typography, motion guidance and sample source. The assistant authors a new composition with project-specific choices; the saved draw is never silently replaced with easier styles. Every fresh header records its artistic choices.

Standalone mode offers 26 independent compositions: trackers, cassette J-cards, off-air calibration, copper ribbons, Luna desktop, vector objects, phosphor terminal, BBS, radar, neon horizon, starfield, zine, floppy archive, tractor-feed paper, pocket phone, dot matrix, chrome and checkerboard, twin-panel commander, four-shade LCD, one-bit desktop, Memphis, pencil notebook, player stack, firmware setup, Braille-dot signal and teal CLI startup. They adapt verified repository facts. Catalogue entries without a dedicated renderer are only eligible for fresh authoring; they never become differently named versions of a generic panel. The gallery labels each header **Newly authored** or **Prebuilt**.

## Optional authoring setup

For positive creativity that requests fresh headers, install and sign in to the [Codex CLI](https://learn.chatgpt.com/docs/non-interactive-mode). The command uses your existing Codex configuration and account; it does not require a separate image API key. ChatGPT sign-in uses that account's Codex allowance; API-key sign-in or `CODEX_API_KEY` uses the account owning that key. Fresh authoring takes longer than prebuilt rendering.

The assistant receives the project's GitHub metadata and the selected catalogue/sample references. It returns SVG data using a read-only sandbox. The generator validates the result and writes the files; it does not execute assistant-generated program code. An unavailable or failed authoring step stops the run, preserving a started draw for recovery. It never silently turns requested fresh art into presets.

Public repositories work directly. Set `GH_TOKEN` or `GITHUB_TOKEN` for private repositories or higher GitHub API limits. Project code and dependencies are not installed.

## Avoid repeats

Completed batches for the same repository in the output's parent folder are excluded automatically, including the older twelve-template batch format. The command does not reset the history automatically when a pool is exhausted. Increase creativity to use catalogue briefs without local renderers, or explicitly pass `--allow-repeats` to permit earlier styles again. Repeats from earlier draws still use distinct compositions within the new batch; the flag does not multiply the 26 local renderers.

You can exclude additional draw or manifest files:

```sh
npx --yes github:lukexyz/README.NFO you/project -10 --creativity 0.9 --exclude ./previous/draw.json
```

`--exclude` is repeatable. `--seed TEXT` repeats a selection when catalogue, history, count and creativity are the same. Use `--allow-repeats` to reproduce a seed independently of automatic history. Names, descriptions, languages and counts are snapshots of project data; decorative activity is illustrative.

## Saved batches and recovery

Output includes images, copy-ready Markdown, editable SVG snapshot generators under `src/`, `project.json`, `draw.json`, `manifest.json`, the MIT notice and `qa.json`. The CLI checks XML, image policy, project identity and complete draw membership. Its checks do not replace visual inspection on desktop, mobile and GitHub.

A failed authoring run retains its draw and any valid completed images. Resume with:

```sh
npx --yes github:lukexyz/README.NFO --resume ./readme-headers/you-project
```

Resume keeps the original styles, numbering and creativity mix. It completes missing images before publishing a finished gallery. The authoring brief and response are saved under `_author/` for diagnosis.

`--out PATH` must be a new directory. Without it, the command adds a numbered suffix when a previous batch exists. `--project FILE` uses a saved project snapshot instead of fetching GitHub; edit that JSON to adjust facts for a new batch.

## Run from this checkout

```sh
node tools/generate.mjs github.com/you/project -10 --creativity 0.9
```

Prebuilt generation uses built-in Node.js modules. See [development instructions](development.md) for optional browser previews and repository validation.
