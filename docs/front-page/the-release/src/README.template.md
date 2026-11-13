<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="{{A}}/hero-dark.svg">
    <img src="{{A}}/hero-light.svg" width="100%" alt="README.NFO: retro README headers. 153 styles in 13 families. MIT.">
  </picture>
</p>

<p align="center">
  <b>Retro headers for your README, drawn fresh for your project.</b><br>
  10 numbered headers from 153 researched styles, drawn by Claude Code or Codex.<br>
  Pick a number and it lands at the top of your README.
</p>

<p align="center">
  <a href="#install-notes"><b>Install</b></a> ·
  <a href="#engine">Claude or Codex</a> ·
  <a href="#release-contents">Examples</a> ·
  <a href="#after-the-run">After the run</a>
</p>

<picture><source media="(prefers-color-scheme: dark)" srcset="{{A}}/bar-01-dark.svg"><img src="{{A}}/bar-01-light.svg" width="100%" alt=""></picture>

## Install notes

```sh
npx readme-nfo
```

1. Install [Node.js 22+](https://nodejs.org) and sign in to
   [Claude Code](https://claude.com/claude-code) or
   [Codex](https://developers.openai.com/codex).
2. In your project's folder, run the line above.
3. A gallery opens with 10 numbered headers. Type the number you like
   and it goes at the top of your README. Review with `git diff`, then commit.

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="{{A}}/batches-dark.svg">
    <img src="{{A}}/batches-light.svg" width="100%" alt="One gallery page. npx readme-nfo fills it with headers 01 to 10; use 3 puts number 3 on top of your README; npx readme-nfo more adds 11 to 20 with no repeated styles.">
  </picture>
</p>

**Claude or Codex?** It uses whichever one you're signed in to, and asks once
if you have both. To pick one yourself, use the two commands under
[Engine](#engine).

**Private repos work.** It reads your project folder, not GitHub, so there's no
token to set. Your project facts go only to the agent you picked.

**Want more?** `npx readme-nfo more` gives 10 new styles, numbered 11-20, on the
same gallery page. No style repeats. `npx readme-nfo use 14` swaps your header.

```text
▄▄▄ BATCHES ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
 npx readme-nfo ....... 01-10
 npx readme-nfo use 3 . README
 npx readme-nfo more .. 11-20
 npx readme-nfo more .. 21-30
▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
```

One gallery page holds every batch. Numbers never restart and no style repeats.
The defaults are good.

> [!TIP]
> **Or just ask your agent.** In Claude Code or Codex, say
> *"Get me 10 headers from README.NFO"*, then *"number 3"*, or *"make 10 more"*.

<picture><source media="(prefers-color-scheme: dark)" srcset="{{A}}/bar-02-dark.svg"><img src="{{A}}/bar-02-light.svg" width="100%" alt=""></picture>

## Release info

<pre>
<b>RELEASE</b> ... README.NFO 0.1.0
<b>FOR</b> ....... any git repo
<b>MAKES</b> ..... 10 a run, numbered
<b>MORE</b> ...... 11-20, no repeats
<b>STYLES</b> .... <a href="styles/INDEX.md">153 in 13 families</a>
<b>AGENT</b> ..... <a href="#engine">Claude or Codex</a>
<b>PRIVATE</b> ... <a href="#engine">works, no token</a>
<b>NEEDS</b> ..... Node.js 22+
<b>EXAMPLES</b> .. <a href="#release-contents">260 in 8 galleries</a>
<b>LICENCE</b> ... <a href="LICENSE">MIT</a>
</pre>

<picture><source media="(prefers-color-scheme: dark)" srcset="{{A}}/bar-03-dark.svg"><img src="{{A}}/bar-03-light.svg" width="100%" alt=""></picture>

## Engine

```text
▄▄▄ ENGINE SELECT ▄▄▄▄▄▄▄▄▄▄▄▄
 no flag .. the one signed in
 --claude . Claude Code
 --codex .. Codex
 both? .... asks you once
 neither? . how to sign in
▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
```

```sh
npx readme-nfo --claude
```

```sh
npx readme-nfo --codex
```

> README.NFO plans, checks and installs. The agent you already use draws the
> art: Claude with no tools, Codex in a read-only sandbox.

> [!NOTE]
> **Private repo? Nothing to set up.** It reads your project folder, not
> GitHub, so there's no token to set. Private, self-hosted, GitLab and
> never-pushed projects all work. Your project facts go only to the agent you
> picked, under your own sign-in.

<picture><source media="(prefers-color-scheme: dark)" srcset="{{A}}/bar-04-dark.svg"><img src="{{A}}/bar-04-light.svg" width="100%" alt=""></picture>

## Sample output

Six real headers, live and animated. Click one for its page and Markdown.

<p align="center">
<a href="examples/castaway/01-mode7-island_opus_5.5.md"><img src="examples/castaway/assets/01-mode7-island_opus_5.5.svg" width="400" alt="castaway header: pixel island on a rotating sea (animated)"></a>
<a href="examples/castaway/14-off-air_opus_5.5.md"><img src="examples/castaway/assets/14-off-air_opus_5.5.svg" width="400" alt="castaway header: test card with an island inside (animated)"></a>
</p>
<p align="center"><sub>▲ castaway: rotating island, then test card</sub></p>

<p align="center">
<a href="examples/ultra-satisfactory/13-chrome-spheres_opus_5.5.md"><img src="examples/ultra-satisfactory/assets/13-chrome-spheres_opus_5.5.svg" width="400" alt="ultra-satisfactory header: mirror spheres over a checker floor (animated)"></a>
<a href="examples/castaway/98-3d-pipes_opus_5.5.md"><img src="examples/castaway/assets/98-3d-pipes_opus_5.5.svg" width="400" alt="castaway header: pipes that spell the title (animated)"></a>
</p>
<p align="center"><sub>▲ ultra-satisfactory spheres, then castaway pipes</sub></p>

<p align="center">
<a href="examples/ultra-satisfactory/12-cassette-jcard_opus_5.5.md"><img src="examples/ultra-satisfactory/assets/12-cassette-jcard_opus_5.5.svg" width="400" alt="ultra-satisfactory header: cassette with a printed J-card (animated)"></a>
<a href="examples/castaway/65-memphis_opus_5.5.md"><img src="examples/castaway/assets/65-memphis_opus_5.5.svg" width="400" alt="castaway header: squiggles and confetti (animated)"></a>
</p>
<p align="center"><sub>▲ ultra-satisfactory cassette, then castaway confetti</sub></p>

### One brief, three projects

The same test-card brief, drawn for three different projects. Each one is
composed for its project, not filled into a template.

<p align="center">
<a href="examples/naturalis-historia/01-off-air.md"><img src="examples/naturalis-historia/assets/01-off-air.svg" width="270" alt="naturalis-historia header: test card (animated)"></a>
<a href="examples/gl4ss/01-off-air.md"><img src="examples/gl4ss/assets/01-off-air.svg" width="270" alt="gl4ss header: test card (animated)"></a>
<a href="examples/st3gg/01-off-air.md"><img src="examples/st3gg/assets/01-off-air.svg" width="270" alt="st3gg header: test card (animated)"></a>
</p>
<p align="center"><sub>▲ naturalis-historia, gl4ss, st3gg</sub></p>

*Honest note: the showcase headers came from long, multi-pass Claude Opus runs
(a median of about 54 minutes a header). Headers from the CLI take minutes, not hours,
and are simpler. Same styles, drawn faster.*

<picture><source media="(prefers-color-scheme: dark)" srcset="{{A}}/bar-05-dark.svg"><img src="{{A}}/bar-05-light.svg" width="100%" alt=""></picture>

## Release contents

```text
{{CONTENTS}}
```

Thirty picks from six projects follow, numbered like a gallery: 01-10, then
11-20, then 21-30. Every tile opens its header page, with the art and the
Markdown to paste. **»** in a file list means the header moves. The small
galleries are a good place to start:
[naturalis-historia](examples/naturalis-historia/README.md) ·
[gl4ss](examples/gl4ss/README.md) ·
[st3gg](examples/st3gg/README.md).

### Reel 1 · 01-10

{{REEL:1}}

<details><summary>Reel 1 file list</summary>

{{FILES:1}}

</details>

### Reel 2 · 11-20

{{REEL:2}}

<details><summary>Reel 2 file list</summary>

{{FILES:2}}

</details>

### Reel 3 · 21-30

{{REEL:3}}

<details><summary>Reel 3 file list</summary>

{{FILES:3}}

</details>

### Plain text, too

Some styles make text you can paste anywhere: a commit message, a terminal, an
NFO. [heretic/04](examples/heretic/04-nfo-10.md) is one.

<details><summary>Show heretic/04 as plain text</summary>

```text
                   .----------------.
                  /  open language   \
             .---'--------------------'---.
            /       .---.    .---.        \
           |        | o |----| o |         |
           |        '---'    '---'         |
           |            \__/              |
            \           /  \             /
             '---------'    '-----------'
                  /\              /\
                 /__\------------/__\
                   .-'          '-.
                  '----.    .----'
                       |____|

        heretic - open directions, drawn in plain text
        Python / directional ablation / Optuna
```

</details>

<picture><source media="(prefers-color-scheme: dark)" srcset="{{A}}/bar-06-dark.svg"><img src="{{A}}/bar-06-light.svg" width="100%" alt=""></picture>

## After the run

```text
$ npx readme-nfo
 AGENT ... Claude Code
           (switch: --codex)
 PROJECT . this folder
 DRAW .... 10 of 153
           3 at a time
 GALLERY . open, filling in

 Install which header?
 [1-10, Enter = later] 3

 WROTE .github/readme-nfo/
         header.svg
         LICENSE
 EDIT  README.md (marked block)

 Review with git diff,
 then commit.
```

Your README gets one marked block at the very top:

```html
<!-- README.NFO header: start -->
<p align="center">
  <img src=".github/readme-nfo/header.svg"
       width="100%" alt="NAME header">
</p>
<!-- README.NFO header: end -->
```

- **Swap it:** `npx readme-nfo use 7` replaces the block. Nothing else moves.
- **Undo it:** delete the block and `.github/readme-nfo/`.
- **Nothing is committed for you.** Batches stay in `readme-headers/`, which is
  kept out of git, so `git status` stays clean.

<picture><source media="(prefers-color-scheme: dark)" srcset="{{A}}/bar-07-dark.svg"><img src="{{A}}/bar-07-light.svg" width="100%" alt=""></picture>

## Options and credits

<details><summary><b>OPTIONS</b> · every flag</summary>

```text
▄▄▄ OPTIONS ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
 engine ....... « auto »
   --claude  --codex
 how many ..... « 10 »
   --count N
 model ........ « agent's own »
   --model NAME
 at once ...... « 3 »
   --jobs N
 formats ...... « all »
   --format svg|text
 browser ...... « opens »
   --no-open
 same draw .... « random »
   --seed TEXT
 reuse styles . « never »
   --allow-repeats
 a repo not cloned
   npx readme-nfo <repo URL>
▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
```

</details>

**How long?** One header took 74 s with Claude Sonnet and 2 min 31 s with
Codex in testing. Ten take a few minutes, 3 at a time.
More: [generation docs](docs/generation.md) ·
[style catalogue](styles/INDEX.md) ·
[development](docs/development.md).

<pre>
▄▄▄ CREDITS ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
 code ...... Luke Woods
 research .. <a href="https://16colo.rs">16colo.rs</a>
             <a href="https://demozoo.org">Demozoo</a> · <a href="https://www.pouet.net">Pouet</a>
             <a href="http://textfiles.com">textfiles.com</a>
 tools ..... Node.js
             Playwright
 art ....... drawn by coding
             agents from
             researched briefs
 licence ... <a href="LICENSE">MIT</a>
─────────────────────[ EOF ]──
</pre>

<picture><source media="(prefers-color-scheme: dark)" srcset="{{A}}/bar-eof-dark.svg"><img src="{{A}}/bar-eof-light.svg" width="100%" alt=""></picture>

<details><summary>The logo as plain text</summary>

```text
{{TWIN}}```

</details>
