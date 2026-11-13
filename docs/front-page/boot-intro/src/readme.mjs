#!/usr/bin/env node
// Concept 02 BOOT INTRO: writes ../README.md from picks.json and the copy below.
//   node docs/front-page/boot-intro/src/readme.mjs [--check]
// Every count is computed or comes from the shared facts; every pick is
// resolved and deny-scanned by picks.mjs. Text blocks are held to 31 columns
// (what a 375 px phone shows beside GitHub's copy button) except the exact
// installed HTML block, which is 33 and folded away.
import fs from 'node:fs';
import path from 'node:path';
import { loadPicks, REL, DIR, ROOT } from './picks.mjs';
import { pathToFileURL } from 'node:url';
import { PIRACY, COPY_ONLY, GROUPS, scanText } from './deny.mjs';
const { relink } = await import(pathToFileURL(path.join(ROOT, 'tools/front-page/lib/relink.mjs')).href);

const A = `${REL}/assets`;
const P = loadPicks();
const FACTS = { styles: 153, families: 13, textStyles: 59, headers: 260, galleries: 8 };
const projects = new Set([...P.featured, ...P.wall, ...P.sameBrief, ...P.textDisk].map((e) => e.page.split('/')[0]));
const families = new Set([...P.featured, ...P.wall].map((e) => e.style.split('-')[0]));
const linked = P.featured.length + P.wall.length + P.sameBrief.length + P.textDisk.length;
if (families.size !== FACTS.families) throw new Error(`families ${families.size}`);
const NAMES = { castaway: 'Castaway', 'ultra-satisfactory': 'ULTRA-SATISFACTORY', heretic: 'Heretic', gl4ss: 'GL4SS', st3gg: 'ST3GG', 'naturalis-historia': 'Naturalis Historia' };
const proj = (e) => NAMES[e.page.split('/')[0]];
const nn = (n) => String(n).padStart(2, '0');
const COLS = 31;

function block(lang, lines, max = COLS) {
  for (const l of lines) if ([...l].length > max) throw new Error(`${[...l].length} cols: ${l}`);
  return '```' + lang + '\n' + lines.join('\n') + '\n```';
}
const bar = (i) => `<p align="center"><img src="${A}/bar-${i}.svg" width="100%" height="8" alt=""></p>`;

// ---------- featured pairs, sized so each pair shares a height ----------
const pairs = [];
for (const e of P.featured) (pairs[e.pair - 1] ||= []).push(e);
const featured = pairs.map((pair) => {
  const total = 804, h = total / pair.reduce((s, e) => s + e.w / e.h, 0);
  const imgs = pair.map((e) => `<a href="${e.md}"><img src="${e.svg}" width="${Math.round((h * e.w) / e.h)}" alt="${nn(e.n)} ${proj(e)}: ${e.caption}${e.animated ? ' (animated)' : ''}"></a>`);
  const cap = pair.map((e) => `${nn(e.n)} ${e.caption} <i>(${proj(e)})</i>`).join(' &nbsp;·&nbsp; ');
  return `<p align="center">\n${imgs.join('\n')}\n<br><sub>${cap}</sub>\n</p>`;
}).join('\n\n');

const sameBrief = `<p align="center">\n${P.sameBrief.map((e) => `<a href="${e.md}"><img src="${e.svg}" width="270" alt="Off-air test card header for ${e.project} (animated)"></a>`).join('\n')}\n<br><sub>${P.sameBrief.map((e) => e.project).join(' &nbsp;·&nbsp; ')}</sub>\n</p>`;

// ---------- the wall: 4 rows of 10 ----------
const rows = [];
for (let r = 0; r < 4; r++) {
  const ten = P.wall.slice(r * 10, r * 10 + 10);
  const tiles = ten.map((e) => `<a href="${e.md}"><img src="${A}/thumbs/${nn(e.n)}.jpg" width="150" height="84" alt="${nn(e.n)} ${proj(e)}: ${e.caption}${e.animated ? ' (animated)' : ''}"></a>`);
  const names = ten.map((e) => `${nn(e.n)} ${e.caption}`).join(' · ');
  rows.push(`<p align="center">\n${tiles.join('\n')}\n</p>\n<p align="center"><sub>${names}</sub></p>`);
}

// ---------- intro index by family ----------
const idx = [];
const rule = (label) => { const s = `▄▄ ${label} `; return s + '▄'.repeat(COLS - [...s].length); };
const line = (e) => {
  const head = `${nn(e.n)} ${e.caption} `;
  const dots = COLS - head.length - e.style.length - 1;
  if (dots < 1) throw new Error(`index line too long: ${e.caption}`);
  return head + '.'.repeat(dots) + ' ' + e.style;
};
idx.push(rule('FEATURED'));
for (const e of P.featured) idx.push(line(e));
let fam = '';
for (const e of P.wall) {
  if (e.family !== fam) { fam = e.family; idx.push(rule(fam)); }
  idx.push(line(e));
}
idx.push('▀'.repeat(COLS));

// ---------- text blocks ----------
const transcript = block('text', [
  '$ npx readme-nfo',
  'FACTS  read from this folder',
  'AGENT  Claude Code',
  '       (switch: --codex)',
  'DRAW   10 of 153 styles,',
  '       3 at a time',
  'OPEN   gallery, fills 01-10',
  '01 ok  02 ok  03 ok  04 ok',
  '05 ok  06 ok  07 ok  08 ok',
  '09 ok  10 ok',
  'Install which header? [1-10] 3',
  'WROTE  .github/readme-nfo/',
  '       header.svg',
  'EDIT   README.md',
  'Review with git diff, then',
  'commit.',
]);
const card = block('text', [
  'DISK 1 ... npx readme-nfo',
  '           headers 01-10',
  'PICK ..... npx readme-nfo use 3',
  '           #3 goes in README',
  'DISK 2 ... npx readme-nfo more',
  '           headers 11-20',
]);
const footer = block('text', [
  '▄'.repeat(COLS),
  '  R E A D M E . N F O',
  '  retro headers for your README',
  '─'.repeat(COLS),
  ' STYLES .... 153 in 13 families',
  ' SHOWCASE .. 260 in 8 galleries',
  ' ENGINES ... Claude Code',
  '             Codex',
  ' FACTS ..... your folder',
  ' NEEDS ..... Node.js 22+',
  ' LICENCE ... MIT',
  '─'.repeat(COLS),
  ' THANKS .... 16colo.rs · Pouet',
  '             Demozoo',
  '             textfiles.com',
  '▀'.repeat(COLS - 7) + '[ EOF ]',
]);
const installed = block('html', [
  '<!-- README.NFO header: start -->',
  '<p align="center"><img',
  'src=".github/readme-nfo/header.svg"',
  'width="100%" alt="my-app header">',
  '</p>',
  '<!-- README.NFO header: end -->',
], 35);

const md = `<!-- README.NFO header: start -->
<p align="center"><a href="#-press-start"><picture>
<source media="(prefers-color-scheme: dark)" srcset="${A}/hero-dark.svg">
<source media="(prefers-color-scheme: light)" srcset="${A}/hero-light.svg">
<img src="${A}/hero-light.svg" width="100%" alt="README.NFO intro screen: a chrome README.NFO logo over a starfield. An engine field switches between Claude Code and Codex, a facts field reads your folder, PRESS SPACE blinks, and a sine-wave scroller runs along the bottom.">
</picture></a></p>
<!-- README.NFO header: end -->
<p align="center"><sub>Hero drawn in styles <a href="styles/c64.md#c64-12">c64-12</a> and <a href="styles/c64.md#c64-02">c64-02</a> by <a href="${REL}/src/hero.mjs">a seeded Node script</a>.</sub></p>

<h1 align="center">Retro headers for your README</h1>

<p align="center">README.NFO draws ten one-off retro headers for your project with <b>Claude Code</b> or <b>Codex</b>, numbers them, and puts the one you pick at the top of your README.</p>

<p align="center">
<a href="https://claude.com/claude-code"><img src="${A}/engine-claude.svg" width="260" alt="Sign in to Claude Code"></a>
<a href="https://developers.openai.com/codex"><img src="${A}/engine-codex.svg" width="260" alt="Or sign in to Codex"></a>
</p>

<p align="center"><a href="#-press-start"><b>► Press start</b></a> · <a href="#-numbered-every-batch">Numbered, every batch</a> · <a href="#-intro-select">Intro select</a> · <a href="#-release-info">Release info</a></p>

${bar(1)}

## ► Press start

\`\`\`sh
npx readme-nfo
\`\`\`

1. Install [Node.js 22+](https://nodejs.org) and sign in to
   [Claude Code](https://claude.com/claude-code) or
   [Codex](https://developers.openai.com/codex).
2. In your project's folder, run the line above.
3. A gallery opens with 10 numbered headers. Type the number you like
   and it goes at the top of your README. Review with \`git diff\`, then commit.

**Claude or Codex?** It uses whichever one you're signed in to, and asks once
if you have both. To choose: \`npx readme-nfo --claude\` or \`npx readme-nfo --codex\`.

**Private repos work.** It reads your project folder, not GitHub, so there's no
token to set. Your project facts go only to the agent you picked.

**No flags needed.** The defaults are good.

<sub>Needs Node.js 22+. One header took 74 s on Claude Sonnet and 2 min 31 s on Codex in our tests; ten take a few minutes, 3 at a time.</sub>

${bar(2)}

## ► Numbered, every batch

<p align="center"><img src="${A}/flow.svg" width="100%" alt="One gallery page: batch 1 fills with headers 01 to 10, header 03 is picked and lands at the top of a README, then batch 2 adds 11 to 20 on the same page."></p>

**Want more?** \`npx readme-nfo more\` gives 10 new styles, numbered 11-20, on the
same gallery page. No style repeats. \`npx readme-nfo use 14\` swaps your header.

${card}

> [!TIP]
> Or just ask your agent: *"Get me 10 headers from README.NFO"*, then
> *"number 3"*, or *"make 10 more"*.

- **One gallery page holds every batch.** Numbers keep counting (21-30, 31-40 and on) and styles never repeat.
- **It never commits.** \`use 3\` writes \`.github/readme-nfo/header.svg\`, \`.github/readme-nfo/LICENSE\` and one marked block at the top of README.md. Review with \`git diff\`, then commit.
- **Undo:** delete the block and the \`.github/readme-nfo/\` folder.

<details><summary><b>What a run looks like</b></summary>

${transcript}

</details>

<details><summary><b>What lands in your README</b></summary>

${installed}

\`npx readme-nfo use 7\` replaces it with header 07. Batches stay in \`readme-headers/\`, which is kept out of git.

</details>

<details><summary><b>Options</b></summary>

- \`--claude\` or \`--codex\`: choose the agent
- \`-6\`: six headers instead of ten
- \`more\`: ten new styles, numbered on from the last batch
- \`use N\`: install header N
- \`--model NAME\`: choose the agent's model
- \`--jobs N\`: headers drawn at once (default 3)
- \`--resume DIR\`: finish a batch that stopped
- \`--out DIR\`: save the batch somewhere else
- \`--no-open\`: don't open the gallery
- **Not cloned?** \`npx readme-nfo github.com/you/project\` reads it from GitHub instead. For a private one it uses your \`gh\` sign-in.

</details>

<details><summary><b>No agent found, or something failed?</b></summary>

- **No agent found?** Sign in to one, then run \`npx readme-nfo\` again: start \`claude\` and log in, or run \`codex login\`.
- **Chose one that isn't signed in?** \`--claude\` and \`--codex\` stop before writing anything and print how to sign in.
- **A header failed?** It gets one retry. If it fails again it is skipped and the rest of the batch carries on.

</details>

${bar(3)}

## ► Intro select

<p align="center"><b>${linked} headers from ${projects.size} projects, all ${FACTS.families} style families.</b><br>Each was drawn for a real project. Click one for its page and source.</p>

${featured}

<p align="center"><b>Same style, three projects.</b> One off-air brief, drawn three times.</p>

${sameBrief}

<p align="center"><b>The wall: 07 to 46.</b> <sub>► marks an animated original.</sub></p>

${rows.join('\n\n')}

<details><summary><b>Intro index</b>: what each number is</summary>

${block('text', idx)}

</details>

**Disk 2: plain text.** ${FACTS.textStyles} of the ${FACTS.styles} styles can be drawn as text art you paste straight in, like the [${P.textDisk[0].caption}](${P.textDisk[0].md}) and the [${P.textDisk[1].caption}](${P.textDisk[1].md}).

<p align="center"><a href="examples/README.md"><b>All ${FACTS.headers} headers in ${FACTS.galleries} galleries</b></a> · <a href="styles/INDEX.md"><b>All ${FACTS.styles} styles</b></a></p>

${bar(4)}

## ► Release info

${footer}

<p align="center"><a href="docs/generation.md">How it works</a> · <a href="styles/INDEX.md">Style catalogue</a> · <a href="examples/README.md">Galleries</a> · <a href="https://github.com/lukexyz/README.NFO/issues">Issues</a> · <a href="LICENSE">MIT licence</a></p>

<p align="center"><sub>Scene styling here is homage: no real group names, logos or lettering, and all the art is original.<br>The showcase headers came from long Claude Opus runs; CLI output is quicker and simpler.</sub></p>
`;

// ---------- checks on our own copy ----------
const prose = md.replace(/\(examples\/[^)]+\)|"examples\/[^"]+"|href="[^"]+"|src="[^"]+"/g, '');
const own = scanText(prose);
for (const w of COPY_ONLY) if (new RegExp(`\\b${w}\\b`, 'i').test(prose)) own.push(w);
if (own.length) throw new Error(`copy hits deny list:\n${own.join('\n')}`);
for (const bad of ['152', '320', 'twelve galleries', '164']) if (prose.includes(bad)) throw new Error(`stale number ${bad}`);
for (const m of md.replace(/```[\s\S]*?```/g, '').matchAll(/(?:src|href|srcset)="([^"#:]+)"/g)) {
  if (!fs.existsSync(path.join(ROOT, m[1]))) throw new Error(`missing ${m[1]}`);
}

// Checked as if it were the root README; written with links from this design's folder.
const file = path.join(DIR, 'README.md');
const out = relink(md, DIR, ROOT);
if (process.argv.includes('--check')) {
  if (fs.readFileSync(file, 'utf8') !== out) { console.error('README.md is stale'); process.exit(1); }
  console.log('README.md is current');
} else {
  fs.writeFileSync(file, out);
  console.log(`README.md written: ${linked} linked headers, ${projects.size} projects, ${families.size} families, castaway ${P.castaway}/40 on the wall`);
}
