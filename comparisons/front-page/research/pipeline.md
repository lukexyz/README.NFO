# README.NFO pipeline audit and target design

Research for the front-page redesign. Re-audited on **2026-11-11** against the
local branch `ultra-satisfactory-headers-and-style-catalogue` (HEAD `2cd1e54`,
with another session's uncommitted work) and the live GitHub `origin/main`
(`8a03d5a`, confirmed with `git ls-remote`). This supersedes the 2026-10-13
version of this file. The CLI source (`tools/generate.mjs`,
`tools/generator/*.mjs`) has not changed since 2026-10-08, so the code findings
stand; the environment, trial timings and npm checks were all re-run today.
Nothing in `tools/`, `docs/`, `examples/`, `styles/`, `package.json`,
`README.md`, `MUSINGS.md` or `.github/` was changed. Evidence (logs, answers,
renders, pack listing) is in the session scratchpad under `front-page/`
(`cli-trial/`, `cli-trial.log`, `claude-trial/`, `pack.json`).

## TL;DR

- **The front page sells a command that only half works.** It needs Node 22+,
  Git and Codex. It cannot use Claude. Private repos fail without `GH_TOKEN`
  (even with `gh` signed in). Installed through `npx`, it ships **zero** sample
  generators, so every brief loses its technique sample. It runs one header at a
  time and you install the result by hand.
- **The live front page is not the local one.** `origin/main` has three web-UI
  README commits; the local branch is 7 commits ahead and they have diverged.
  `npx github:lukexyz/README.NFO` installs main's older CLI.
- **Today's trial:** one header in **2 min 31 s** with Codex (exit 0, valid
  SVG). The October trial took 6 min 18 s. Time depends on the model and effort
  in the user's Codex config, so ten headers in sequence is roughly 25-60 min.
- **Claude works, re-proven today.** The identical brief and schema through
  `claude -p --json-schema --tools ""` (Claude Code 2.1.322, Sonnet) returned a
  header in **74 s** that **passes README.NFO's own `validateResponse`** and
  renders at 830 px and 375 px.
- **Recommended target:** run `npx readme-nfo` inside your project folder. It
  reads the local checkout (private repos need no token), uses whichever of
  Claude Code or Codex is signed in (`--claude` / `--codex` to choose), authors
  3 at a time into a gallery that fills as headers land, then asks which number
  to install and patches your README. You review and commit.
- **Alternative:** a Claude Code / Codex plugin served from this repo's own
  marketplace files, whose skill drives the same CLI's brief, check and install
  steps while the host agent draws the SVGs.

---

## 1. Current journey, end to end

| Step | What happens today | Evidence | Friction |
| --- | --- | --- | --- |
| Discover | Live README (`origin/main`) shows a hero and one command with `-4`. The local README shows `-10` and a gallery table. | `git show origin/main:README.md`; local `README.md` | The two disagree. Live copy has grammar slips and a `</br>`. |
| Install / run | `npx --yes github:lukexyz/README.NFO github.com/you/project -4`. npm clones the repo with Git and packs it using `files`. | October cold-cache run: 21 s | Git required only because of the `github:` spec. Long, hard to remember. |
| Auth | `codex --version` must spawn (`checkAuthor`); `codex login status` sets the ACCOUNT label. | `author.mjs:50`, `codex-runtime.mjs:11` | Codex only. `spawn('codex',{shell:false})` cannot run the npm shim `codex.cmd` on Windows; works here only because the desktop `codex.exe` is first on PATH. |
| Project facts | GitHub REST `/repos/o/r`, `/languages`, `/readme`, optional `GH_TOKEN`/`GITHUB_TOKEN`. | `project.mjs:95-103` | Private repo: 404 "Repository not found or private... need GH_TOKEN". `gh` login unused. URL required even inside the project. Non-GitHub remotes rejected (`parseRepository`). |
| Draw | Seeded random draw of distinct styles, minus earlier batches in the output's parent folder, saved to `draw.json` first. | `hybrid-catalogue.mjs` | Fine. |
| Authoring | One `codex exec --sandbox read-only --skip-git-repo-check --ephemeral --output-schema` per header, in sequence. The brief embeds a sample generator found by scanning `examples/*/src`. | `author.mjs:92`, `hybrid-catalogue.mjs:54-56` | Serial. Inherits the user's Codex model and reasoning effort. Samples missing under npx; locally they can come from untracked work (see failure 7). |
| Validation | XML, image policy, title includes project name, at least two art decisions. First invalid header stops the batch (`--resume`). | `author.mjs:35` `validateResponse`, `batch.mjs` | No visual QA, no automatic repair. |
| Gallery | `index.html` card grid, opened only after all headers finish. Copy-Markdown and save-SVG buttons. | `hybrid-output.mjs` | Nothing to see during the run. Not NFO-styled. |
| Choose | Manual. | — | No "use this one". |
| Install into README | Manual: copy SVG into your `assets/`, paste the `.md`, keep the MIT notice. | batch `README.md`, `docs/generation.md` | Three hand steps; path must match `assets/NN-id.svg`. |

## 2. Failures found

1. **Live front page and local work have diverged.** `origin/main` (8a03d5a) =
   three web-UI README commits; local HEAD is 7 ahead, 0 behind on its own
   line, but not a descendant (`merge-base --is-ancestor` fails). `npx github:`
   installs main's older CLI, so visitors do not get what the local docs
   describe.
2. **Live copy errors** on main's README (grammar slips, `</br>`, "You should
   probably generate 50, but why not start with four").
3. **No Claude.** Only `codex` is ever spawned; `docs/generation.md` says it
   does not invoke Claude.
4. **Private repositories fail** unless `GH_TOKEN`/`GITHUB_TOKEN` is set, even
   though `gh` is signed in on this machine with `repo` scope.
5. **No local mode.** A GitHub URL is mandatory; GitLab, other hosts and
   not-yet-pushed projects are rejected.
6. **The npx package ships zero sample generators.** `npm pack --dry-run` today:
   `readme.nfo@0.0.0`, 425 files, 1.6 MB packed, **0** files under `src/`,
   **0** SVGs. The `files` glob `examples/*/src/` matches nothing in npm 11
   (verified in October with a scratch package and a real cold npx install).
   `sampleFor()` therefore returns null for every style under npx.
7. **Local runs pick samples from untracked work.** Today's trial drew `vap-14`
   and its brief embedded `examples/medialog-logos-02/src/08-vap-14.mjs`: a
   203x74 logo from another session's uncommitted set, used as the technique
   sample for a 960-wide header. Sample choice depends on whatever is in the
   working tree.
8. **Windows npm installs of Codex break the CLI** (`shell:false` + `codex.cmd`
   ENOENT/EINVAL, verified in October; `%APPDATA%\npm\codex.cmd` is still on
   PATH today behind the desktop `codex.exe`).
9. **Slow, serial and config-dependent.** 151 s today (model `gpt-6-astra`,
   27,523 tokens) and 378 s in October (`gpt-6.1-sol`, effort xhigh). The
   banner says "~1-8 min". Ten headers run one after another.
10. **One bad SVG stops the run** and asks for `--resume`.
11. **No visual QA.** In today's Codex header the "Personal message" line
    touches the wordmark's baseline, and in both trials the small text is
    unreadable at 375 px; every structural check passed.
12. **Installing is manual** (copy SVG, paste Markdown, add MIT notice).
13. **Alt text uses the catalogue style name.** Today's `01-vap-14.md` alt is
    "README.NFO — Instant messenger window: MSN, AIM, ICQ" (product
    trademarks). Seven catalogue names (`pc-01`, `pc-07`, `c64-05`, `c64-07`,
    `c64-10`, `c64-11`, `nfo-01`) contain real scene group names, which would
    land in users' READMEs.
14. **Output lands in the working directory** (`./readme-headers/owner-repo`),
    including `_author/` briefs and logs, as untracked files. `--out` must not
    already exist.
15. **Requirements list is longer than needed:** Git only for the `github:`
    spec.
16. **Counts disagree** across README, ASCII footer ("STYLE POOL : 152") and
    plugin docs ("152 distinct", "127 image-capable") against 153 and 128.
17. **The Codex plugin is not versioned here.** `readme-nfo-headers` v0.1.0
    sits in `~/.codex/plugins/cache/created-by-me-remote/`; its source is not in
    the repo and `docs/readme-nfo-plugin/README.md` says directory submission is
    "in preparation".
18. **CI is Linux-only** (`validate.yml`: ubuntu, Node 22/24), so the Windows
    spawn bug cannot be caught, and nothing asserts what `npm pack` ships.

## 3. Environment probe (read-only, no secrets printed)

| Tool | Version | State |
| --- | --- | --- |
| Node / npm / npx | v24.14.0 / 11.19.1 / 11.19.1 | OK |
| Git | 2.53.0.windows.1 | OK |
| Claude Code | 2.1.322, native (`~/.local/bin/claude`, also a WinGet link) | `claude auth status`: loggedIn, authMethod claude.ai, firstParty, Max |
| Codex CLI | 0.167.1, desktop `codex.exe` first on PATH; npm shim `codex.cmd` also present | `codex login status`: "Logged in using ChatGPT" |
| GitHub CLI | 2.87.2 | Logged in (keyring), scopes include `repo` |
| npm names | `readme-nfo`, `readme.nfo`, `readmenfo`, `create-readme-nfo` | All **E404 (unclaimed)** on 2026-11-11 |

**Claude headless flags** (`claude --help`, 2.1.322): `-p/--print`,
`--output-format text|json|stream-json`, `--json-schema <schema>`,
`--tools <list>` (`""` disables all tools), `--allowedTools` /
`--disallowedTools`, `--permission-mode`, `--model`,
`--no-session-persistence`, `--safe-mode` (disables CLAUDE.md, skills, plugins,
hooks, MCP; auth unaffected), `--max-budget-usd` (API only), `--plugin-dir`,
`--plugin-url`. **No `--max-turns`.** `--bare` makes Anthropic auth "strictly
ANTHROPIC_API_KEY or apiKeyHelper (OAuth and keychain are never read)", so it
would break subscription users: never use it.

**Codex exec flags** (0.167.1): `-s/--sandbox`, `--output-schema FILE`,
`-o/--output-last-message`, `--ephemeral`, `--skip-git-repo-check`,
`-m/--model`, `--json`, prompt from stdin, and new **`--ignore-user-config`**
("auth still uses CODEX_HOME"), which lets README.NFO pin model/effort instead
of inheriting a slow xhigh config.

**Plugin mechanisms (from installed CLIs; manifest layout from official docs,
code.claude.com/docs/en/plugin-marketplaces and the OpenAI "build plugins"
page, checked in October):**

- **Claude Code:** `claude plugin marketplace add <URL|path|owner/repo>`, then
  `claude plugin install plugin@marketplace`; in-session `/plugin marketplace
  add …` and `/plugin install …`. `claude plugin validate <path>` exists to lint
  a plugin or marketplace. Repo file `.claude-plugin/marketplace.json`
  (`name`, `owner`, `plugins[]` with `name` + `source`); plugin has
  `.claude-plugin/plugin.json` and `skills/<skill>/SKILL.md`.
- **Codex:** `codex plugin marketplace add` (local or Git source), then
  `codex plugin add PLUGIN@MARKETPLACE`. Repo file
  `.agents/plugins/marketplace.json`; plugin uses `.codex-plugin/plugin.json`.
  How Codex invokes a named skill is still not confirmed for this version.

## 4. CLI trial (2026-11-11)

Command: `node tools/generate.mjs lukexyz/README.NFO -1 --out
<scratch>/front-page/cli-trial --no-open --no-color`

- **Result: exit 0 in 2 min 31 s.** Drew `vap-14` (instant-messenger window).
  Codex reported model `gpt-6-astra`, 27,523 tokens.
- **Produced:** `01-vap-14.md`, `assets/01-vap-14.svg` (9,566 bytes),
  `src/01-vap-14.mjs`, `src/01-vap-14.art.json` (4 decisions), `index.html`,
  `README.md`, `CREDITS.md`, `LICENSE`, `draw.json`, `project.json`,
  `manifest.json`, `qa.json`, `_author/header-01-vap-14/{brief.txt 8,824 B,
  schema.json, answer.json, run.log}`.
- **Facts were right:** description, MIT, HTML + JavaScript, 2 stars, sections.
- **Render (Playwright, as `<img>` at 830 and 375 px):** decodes; good MSN-style
  window. Subtitle touches the wordmark; small text illegible on phones.
- **Claude, same brief and schema:** `claude -p --output-format json
  --json-schema "<schema>" --tools "" --no-session-persistence
  --permission-mode dontAsk --safe-mode --model sonnet < brief.txt`. Exit 0 in
  **74 s**, `subtype: success`, `is_error: false`, model `claude-sonnet-5-5`,
  ~10k output tokens (CLI-reported notional cost $0.13; billed to the Max plan).
  `structured_output` **passed `validateResponse`** (8,484-byte SVG, 3
  decisions) and decodes at both widths. Cleaner layout, no overlap. One trial
  each, different models: not a quality ranking.
- **`npm pack --dry-run D:/python/README.NFO`:** 425 files, 1.6 MB packed,
  5.6 MB unpacked; carries `styles/styles.json`, 17 generator modules,
  `tools/lib/checks.mjs`, `LICENSE`, 403 `.md` files; **0 sample generators, 0
  SVGs**. All of `examples/*/src` would add about 14 MB; a prebuilt
  `styles/samples.json` of the committed samples is about 230 KB.

## 5. Options weighed

Scores 1 (poor) to 5 (best).

| Option | Simplicity | Private repos | Claude/Codex choice | Build | Verdict |
| --- | ---: | ---: | ---: | ---: | --- |
| A. Run in your project folder, read the local checkout | 5 | 5 (no token, no GitHub call) | n/a | M | **Primary core** |
| B. Auto-detect signed-in agent, `--claude` / `--codex` | 5 | n/a | 5 | M | **Primary** |
| C. `claude -p` headless authoring mirroring `codex exec` | 4 | n/a | 5 | M (proven twice) | **Primary** |
| D. Claude Code + Codex plugin/skill from this repo | 3 (two installs + invocation, differs per agent) | 5 | 4 | L | **Alternative** |
| E. "Just ask your agent" prompt | 3 (unreliable; Codex sandbox blocks network) | 4 | 3 | S | Footnote at most |
| F. Publish to npm as `readme-nfo` | 5 (`npx readme-nfo`, no Git) | n/a | n/a | S | **Primary** (owner publishes) |
| G. "Use this header": copy SVG + MIT notice, patch README | 5 | 5 | n/a | M | **Primary** |
| H. *(new)* Progressive gallery + 3 at a time | 5 | n/a | n/a | S/M | **Primary** |
| I. *(new)* Pin model/effort (`--ignore-user-config`, Claude `--model sonnet`) | 4 (predictable minutes) | n/a | n/a | S | **Primary** |
| J. *(new)* GitHub Action opening a PR | 2 (secrets, API billing) | 5 | 3 | L | Later |
| K. *(new)* `gh` extension | 3 | 5 | n/a | M | No |
| L. *(new)* Offline "instant preview" from prebuilt scenes | 5 | 5 | n/a | S (exists on main) | Open question |
| M. Hosted web app | 4 | 1 (upload code) | 2 | XL | No |

## 6. Recommended target pipeline

**Primary: `npx readme-nfo`, run inside your project folder.**

```text
npx readme-nfo [--claude|--codex] [-N] [--model M]
  1 READ    local checkout: git root, origin remote (any host or none),
            README, package/pyproject/Cargo/go.mod metadata, languages by
            bytes of tracked files, licence. No network, no token.
  2 AGENT   --claude/--codex, else auto-detect who is signed in.
  3 DRAW    N distinct styles (default 10), saved to draw.json first.
  4 AUTHOR  3 at a time; claude -p (no tools) or codex exec (read-only,
            pinned model/effort), one JSON-schema answer per header; one
            repair retry with the validator's complaints; skip, don't stop.
  5 GALLERY opens at once, NFO-styled, refreshes as each header lands.
  6 PICK    "Install which header? [1-10, Enter = later]"
  7 USE     copies .github/readme-nfo/header.svg + LICENSE, inserts a marked
            block at the top of README.md, prints what changed. No commit.
            Later: npx readme-nfo use 3
```

### Engine choice

1. `--claude` or `--codex` wins. If that agent is not signed in, stop before
   writing files with a one-line hint (`claude` then `/login`, or
   `codex login`).
2. Otherwise probe both in parallel (3 s timeout each):
   Claude is ready when `claude auth status` reports `loggedIn: true` or
   `ANTHROPIC_API_KEY` is set; Codex when `codex login status` exits 0 or
   `CODEX_API_KEY` is set. Labels show plan/billing type only, never email or
   org.
3. One ready: use it and print `AGENT Claude Code (switch: --codex)`.
4. Both ready: an interactive terminal asks once (`[1] Claude Code [2] Codex`);
   non-interactive uses Claude and says so (open question).
5. Neither: print both sign-in hints, exit 1.

**Claude driver** (prompt on stdin, cwd = the header's `_author/` folder):

```text
claude -p --output-format json --json-schema <schema> --tools ""
       --no-session-persistence --permission-mode dontAsk [--safe-mode]
       --model ${M:-sonnet}
```

Require `subtype === "success"` and `!is_error`, take `structured_output`, run
`validateResponse`. Add `--safe-mode` only if `claude --help` lists it. Never
`--bare`.

**Codex driver:** existing `exec --sandbox read-only --ephemeral
--output-schema`, plus `-m` and, when the user has not set `--model`,
`--ignore-user-config` with a pinned model/effort so runs are not
accidentally xhigh.

**Windows:** resolve via PATH x PATHEXT; spawn `.exe` directly; run `.cmd`
through `cmd.exe /d /s /c` with escaped args; add `windows-latest` to CI.

### Private repositories

Default mode never calls GitHub: everything comes from the folder on disk, so
private, internal, GitLab, self-hosted and unpushed projects work with no
token. The only data leaving the machine is the authoring prompt (project facts
plus style briefs), sent to the agent you chose under your existing sign-in. A
URL argument still works for projects you have not cloned; there, if `GH_TOKEN`
is unset, fall back to `gh auth token`.

### After generation ("use this header")

- Writes `.github/readme-nfo/header.svg` and `.github/readme-nfo/LICENSE`
  (README.NFO's MIT notice); re-runs overwrite only files it wrote.
- Finds the root README case-insensitively (or creates `README.md` with the
  header, `# name`, description) and inserts or replaces at the very top:

  ```html
  <!-- README.NFO header: start -->
  <p align="center">
    <img src=".github/readme-nfo/header.svg" width="100%" alt="NAME header">
  </p>
  <!-- README.NFO header: end -->
  ```

- Keeps line endings and BOM, refuses symlinks, never commits, prints "Review
  with `git diff`, then commit."
- Alt text never uses catalogue style names (fixes failure 13).
- Batches go to `readme-headers/`, added to `.git/info/exclude`; the CLI says
  so in one line.
- Samples come only from the shipped `styles/samples.json`, never the working
  tree (fixes failure 7).

### Alternative (one): agent plugin from this repo

`.claude-plugin/marketplace.json` and `.agents/plugins/marketplace.json` both
point at `plugins/readme-nfo/` (`.claude-plugin/plugin.json`,
`.codex-plugin/plugin.json`, one shared `skills/headers/SKILL.md` with
portable `name`/`description` frontmatter). The skill drives agent-mode
subcommands of the same CLI: `readme-nfo brief` (facts + draw + briefs) ->
the agent draws the SVGs -> `readme-nfo check` (validate, repair, gallery) ->
`readme-nfo use N`. No nested agent, no network.

```text
Claude Code:  /plugin marketplace add lukexyz/README.NFO
              /plugin install readme-nfo@readme-nfo
Codex:        codex plugin marketplace add lukexyz/README.NFO
              codex plugin add readme-nfo@readme-nfo
```

Not primary because: two installs plus an invocation, differing per agent;
quality depends on the host agent following the skill; Codex skill invocation
unverified; it must supersede the out-of-repo plugin.

## 7. Canonical README instructions (target)

At most 3 steps, 1 command line. Remove each `[NOT BUILT: …]` marker only when
that part ships.

````markdown
## Make one for your project

1. Install [Node.js 22+](https://nodejs.org) and sign in to
   [Claude Code](https://claude.com/claude-code) or
   [Codex](https://developers.openai.com/codex). **[NOT BUILT: Claude support]**
2. In your project's folder, run:

   ```sh
   npx readme-nfo
   ```

   **[NOT BUILT: npm package; reading the local folder]**
3. Your gallery opens and fills as headers arrive. Type the number you like
   and it goes at the top of your README. Review, then commit.
   **[NOT BUILT: live gallery; pick-and-install]**

Pick the agent with `--claude` or `--codex`. Private repos work: it reads your
local folder, and your project facts go only to the agent you chose.
**[NOT BUILT: agent flags; local mode]**
````

**True today** (`origin/main`): needs Node 22+, Git and a signed-in Codex CLI;
works on public repos; private repos need `export GH_TOKEN=$(gh auth token)`
(bash) or `$env:GH_TOKEN = gh auth token` (PowerShell) first; one header at a
time (2.5 to 6.5 minutes each in two trials); install by hand.

```sh
npx --yes github:lukexyz/README.NFO github.com/you/project -4
```

## 8. Implementation changes, in order

| # | File | Change | Size | Risk |
| ---: | --- | --- | --- | --- |
| 0 | git (owner) | Reconcile `origin/main`'s three web-UI README commits with this branch before any front-page work | S | Low |
| 1 | `package.json` | Name `readme-nfo`, version `0.1.0`, drop `private`; fix `files` (drop the dead `examples/*/src/` glob, add `styles/samples.json`); keep `bin.readme-nfo` | S | Low |
| 2 | `tools/build-samples.mjs` (new), `styles/samples.json`, `hybrid-catalogue.mjs` | Prebuild samples from **committed** sets only (~230 KB); `sampleFor` reads only the bundle; validator checks freshness | S | Low |
| 3 | `tools/generator/agents.mjs` (new) | Agent registry: detection, Windows-safe resolution, `claude -p` and `codex exec` drivers returning parsed JSON; pinned model/effort | M | Medium (cmd quoting, Claude flag drift) |
| 4 | `tools/generator/author.mjs` | Use the drivers; bounded concurrency (`--jobs`, default 3, back off to 1 on rate limit); one repair retry; skip failed headers instead of stopping | M | Medium (plan rate limits) |
| 5 | `tools/generator/codex-runtime.mjs` -> `runtime.mjs` | Account labels for both agents, never email/org | S | Low |
| 6 | `tools/generator/project.mjs`, `tools/generate.mjs` | `readLocalProject(dir)`; no positional = current folder; any host or no remote; URL mode falls back to `gh auth token`; parse `--claude`, `--codex`, `--model`, `--jobs`, `use` | M | Low-medium (README is untrusted data; keep guards) |
| 7 | `tools/generator/install.mjs` (new) | `use N`: copy SVG + LICENSE to `.github/readme-nfo/`, idempotent marked block, preserve EOL/BOM, no commit | M | Medium (edits user's README) |
| 8 | `tools/generator/hybrid-output.mjs` | Neutral alt text; progressive NFO-styled gallery with a `npx readme-nfo use N` line per card | S-M | Low |
| 9 | `tools/generator/batch.mjs` | Write gallery after each header; default output `readme-headers/` + `.git/info/exclude` | S | Low |
| 10 | `tools/generate.mjs`, `terminal.mjs` | New help, AGENT row, end-of-run pick prompt, honest estimate | S | Low |
| 11 | `tools/generate.test.mjs`, `cli-display.test.mjs` | Fake-runner tests: detection matrix, Claude JSON parsing, `.cmd` resolution, local reader fixtures, install idempotency | M | Low |
| 12 | `.github/workflows/validate.yml`, new `release.yml` | Add `windows-latest`; assert `npm pack` ships samples; publish on tag with provenance | S | Low |
| 13 | npm (owner) | `npm publish readme-nfo@0.1.0` (name unclaimed on 2026-11-11) | S | Low |
| 14 | `README.md`, `docs/generation.md`, `docs/readme-nfo-plugin/*` | Ship the canonical instructions; fix counts (153 / 128; gallery totals) | M | Low |
| 15 | `.claude-plugin/`, `.agents/plugins/`, `plugins/readme-nfo/` (alternative, phase 2) | Marketplaces, shared skill, `brief`/`check` subcommands; supersede out-of-repo plugin; lint with `claude plugin validate` | L | Medium |

## 9. Numbers safe to use on the front page (computed 2026-11-11)

| Item | Count |
| --- | --- |
| Distinct catalogue styles | **153** (157 entries; `styles/INDEX.md` says the same) |
| Families | **13** |
| SVG-capable styles | **128** (October count; code unchanged) |
| Styles with a sample generator | **116** (October count) |
| Committed numbered example headers | **260** in **8** sets (castaway 99, ultra-satisfactory 42, readme-nfo 41, heretic 40, dance-vision 6, gl4ss 5, naturalis-historia 5, st3gg 5); 317 committed SVG assets |
| Working tree | 370 numbered headers in 17 sets (110 in another session's untracked medialog sets) |

Use 260 and 8 until those sets are committed. Per-header time is not a
constant: 151 s and 378 s with Codex, 39 s and 74 s with Claude Sonnet.

## 10. Open questions

1. When both agents are signed in, should a non-interactive run default to Claude, or refuse until a flag is given?
2. Default 10 headers, or 6 for a faster first gallery?
3. `.github/readme-nfo/` or `assets/` for the installed SVG?
4. Bring back main's offline prebuilt-scene mode as `--offline` for people with no agent?
5. Is 3-way parallel authoring acceptable under ChatGPT and Claude plan rate limits? Needs a measured 10-header run.
6. Which branch is canonical? Build the front page on the reconciled `main`.
7. Does the alternative plugin replace the existing `readme-nfo-headers` v0.1.0 or ship beside it?
8. Should headers be required to stay legible at 375 px (min text size check), given both trial headers had illegible small text on phones?
