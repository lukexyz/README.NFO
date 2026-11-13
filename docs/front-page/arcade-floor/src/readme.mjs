#!/usr/bin/env node
// Concept 06 (ARCADE FLOOR): writes the front page from picks.src.txt and computed facts, twice:
// the repository's README.md (links from the root) and ../README.md (links from this design's folder).
//   node docs/front-page/arcade-floor/src/readme.mjs
// Every count is computed (git + catalogue); every linked page is gated by scan.mjs.
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { loadPicks, resolve, PROJECT, TITLE } from './picks.mjs';
import { root, scanPage } from './scan.mjs';
const { relink } = await import(pathToFileURL(path.join(root, 'tools/front-page/lib/relink.mjs')).href);

const here = path.dirname(fileURLToPath(import.meta.url));
const dir = path.resolve(here, '..');
const A = path.relative(root, path.join(dir, 'assets')).split(path.sep).join('/');
const { checkCatalogue } = await import(pathToFileURL(path.join(root, 'tools/lib/checks.mjs')).href);

// ---------- facts ----------
const tracked = execSync('git ls-files examples', { cwd: root, encoding: 'utf8' }).split('\n');
const perSet = {};
for (const f of tracked) {
  const m = f.match(/^examples\/([^/]+)\/\d+-[^/]+\.md$/);
  if (m && !/-logos-/.test(m[1])) perSet[m[1]] = (perSet[m[1]] || 0) + 1;
}
const ranking = Object.entries(perSet).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
const headers = ranking.reduce((s, [, n]) => s + n, 0);
const galleries = ranking.length;
const catalogue = JSON.parse(fs.readFileSync(path.join(root, 'styles/styles.json'), 'utf8'));
const styles = checkCatalogue(catalogue).distinct.length;
const families = catalogue.families.length;

const picks = loadPicks();
const gate = (md) => {
  const hits = scanPage(md);
  if (hits.length) throw new Error(`${md}: ${hits.join(', ')}`);
  return md;
};

// ---------- hall of fame ----------
const HOF = [
  [['castaway', '01', 'island title screen on a rotating sea'], ['ultra-satisfactory', '13', 'mirror spheres on a checker floor']],
  [['castaway', '65', 'squiggles, confetti and a live preview'], ['ultra-satisfactory', '12', 'cassette shell, J-card and obi strip']],
  [['castaway', '98', 'screensaver pipes spelling the title'], ['naturalis-historia', '03', 'demo title card with temple and moon']],
];
const live = (set, num, caption, width) => {
  const r = resolve(set, num);
  gate(r.md);
  return `<a href="${r.md}"><img src="${r.svg}" width="${width}" alt="${PROJECT[set]} header: ${caption}${r.animated ? ' (animated)' : ''}"></a>`;
};
const hof = HOF.map((pair) => `<p align="center">
  ${pair.map(([s, n, c]) => live(s, n, c, 400)).join('\n  ')}<br>
  <sub>${pair.map(([s, , c]) => `<b>${TITLE[s]}</b>: ${c}`).join(' · ')}</sub>
</p>`).join('\n\n');
const trio = ['gl4ss', 'naturalis-historia', 'st3gg'];
const trioHtml = `<p align="center">
  ${trio.map((s) => live(s, '01', 'off-air test card written for this project', 270)).join('\n  ')}<br>
  <sub>${trio.map((s) => `<b>${TITLE[s]}</b>`).join(' · ')}</sub>
</p>`;

// HIGH SCORES (fits a phone: 31 columns or fewer)
const ordinal = (i) => ['1ST', '2ND', '3RD', '4TH', '5TH', '6TH', '7TH', '8TH'][i];
let rank = 0;
const scoreRows = ranking.map(([set, n], i) => {
  if (i === 0 || n !== ranking[i - 1][1]) rank = i;
  const name = set === 'readme-nfo' ? 'README.NFO' : set.toUpperCase().replace('DANCE-VISION', 'DANCE VISION');
  return `${ordinal(rank)}   ${String(n).padStart(3, '0')}   ${name}`;
});
const highScores = ['RANK  SCORE GALLERY', ...scoreRows, '', `TOTAL ${String(headers).padStart(5)}   HEADERS`, `STYLES  ${styles}/${styles} CLEAR`].join('\n');
const galleryLinks = ['gl4ss', 'naturalis-historia', 'st3gg']
  .map((s) => { const md = gate(`examples/${s}/README.md`); return `[${TITLE[s]}](${md})`; }).join(' · ');

// ---------- the floor ----------
const cardTag = (p) => `<a href="${p.md}"><img src="${A}/floor/${p.n}.jpg" width="148" height="95" alt="${p.alt}"></a>`;
const tens = [];
for (let i = 0; i < picks.length; i += 10) tens.push(picks.slice(i, i + 10));
const block = (ten) => `<p align="center">
${ten.map(cardTag).join('\n')}
</p>
<p align="center"><sub>${ten.map((p) => `<b>${p.n}</b> ${p.title}: ${p.label.split(' ').map((w) => (/^(LCD|BBS|ANSI|ASCII)$/.test(w) ? w : w.toLowerCase())).join(' ')}`).join(' · ')}</sub></p>`;
const floorOpen = tens.slice(0, 3).map(block).join('\n\n');
const floorMore = tens.slice(3).map(block).join('\n\n');

// ---------- the page ----------
const box = (rows, w) => {
  const line = (s) => `│ ${s.padEnd(w - 4)} │`;
  return [`┌${'─'.repeat(w - 2)}┐`, ...rows.map(line), `└${'─'.repeat(w - 2)}┘`].join('\n');
};
const dots = (k, v, w) => `${k} ${'.'.repeat(w - k.length - String(v).length - 2)} ${v}`;
const gw = 31;
const gameOver = [
  box([
    'GAME OVER          CREDIT 0',
    '',
    dots('HI-SCORE', headers, gw - 4),
    dots('STYLES', styles, gw - 4),
    dots('FAMILIES', families, gw - 4),
    dots('LICENCE', 'MIT', gw - 4),
    '',
    'INSERT COIN',
    '  npx readme-nfo',
  ], gw),
  `${'─'.repeat(12)}[ EOF ]${'─'.repeat(gw - 19)}`,
].join('\n');

const md = `<!-- Concept 06 ARCADE FLOOR. Generated by docs/front-page/arcade-floor/src/readme.mjs; edit that, not this. -->

<p align="center">
  <img src="${A}/cabinet.svg" width="100%" alt="README.NFO arcade cabinet. Its screen loops through insert coin, three real headers, a numbered gallery where you pick 3 and then get 11 to 20, and how to play.">
</p>

<h1 align="center">README.NFO</h1>

<p align="center"><b>Retro headers for your README, drawn fresh for your project by Claude Code or Codex.</b><br>
${styles} styles from the 90s and 2000s. You get 10, numbered; pick one and it goes on top.</p>

<p align="center">
<a href="#insert-coin"><img src="${A}/nav/insert-coin.svg" width="132" height="28" alt="INSERT COIN"></a>
<a href="#the-floor"><img src="${A}/nav/the-floor.svg" width="132" height="28" alt="THE FLOOR"></a>
<a href="#hall-of-fame"><img src="${A}/nav/hall-of-fame.svg" width="132" height="28" alt="HALL OF FAME"></a>
<a href="styles/INDEX.md"><img src="${A}/nav/styles.svg" width="132" height="28" alt="${styles} STYLES"></a>
</p>

## INSERT COIN

\`\`\`sh
npx readme-nfo
\`\`\`

1. Install [Node.js 22+](https://nodejs.org) and sign in to
   [Claude Code](https://claude.com/claude-code) or
   [Codex](https://developers.openai.com/codex).
2. In your project's folder, run the line above.
3. A gallery opens with 10 numbered headers. Type the number you like
   and it goes at the top of your README. Review with \`git diff\`, then commit.

The defaults are good. No flags, no config.

\`\`\`text
1 SIGN IN  Claude Code or Codex
2 INSERT   npx readme-nfo
3 PICK     npx readme-nfo use 3
\`\`\`

**1P Claude · 2P Codex.** It uses whichever one you're signed in to, and asks once
if you have both. To choose: \`npx readme-nfo --claude\` or \`npx readme-nfo --codex\`.

**Private repos work.** It reads your project folder, not GitHub, so there's no
token to set. Your project facts go only to the agent you picked.

**Want more?** \`npx readme-nfo more\` gives 10 new styles, numbered 11-20, on the
same gallery page. No style repeats. \`npx readme-nfo use 14\` swaps your header.

> [!TIP]
> Or ask your agent: *"Get me 10 headers from README.NFO"*. Then *"number 3"*
> to install it, or *"make 10 more"* for 11-20.
> [Add the README.NFO plugin to Claude Code or Codex](docs/generation.md#ask-your-agent) first.

<!--
Before this page is true for visitors: publish readme-nfo to npm and push this
branch (the plugin and npx github: both need the new CLI on main).
-->

## CONTINUE?

<p align="center">
  <img src="${A}/continue.svg" width="100%" alt="A numbered gallery: headers 01 to 10 arrive three at a time, number 3 goes into the README, then 10 more arrive numbered 11 to 20 on the same page.">
</p>

\`\`\`text
01-10   npx readme-nfo
PICK 3  npx readme-nfo use 3
11-20   npx readme-nfo more
\`\`\`

- **One gallery holds every credit.** Numbers never restart: 01-10, then 11-20,
  then 21-30, all on the same page.
- **No style repeats** on your gallery.
- **\`use 3\`** writes \`.github/readme-nfo/header.svg\` and \`.github/readme-nfo/LICENSE\`,
  and puts one marked block at the top of README.md. **\`use 7\`** swaps it.
- **Nothing is committed for you.** Review with \`git diff\`, then commit.
  To undo, delete the block and \`.github/readme-nfo/\`.

<details>
<summary>What lands in your README</summary>

\`\`\`html
<!-- README.NFO header: start -->
<p align="center"><img src=".github/readme-nfo/header.svg"
  width="100%" alt="YOUR-PROJECT header"></p>
<!-- README.NFO header: end -->
\`\`\`

The image path is worked out from where your README lives, and the alt text names
your project.

</details>

## HALL OF FAME

Six real headers from this repo, running live. Click one for its page and source.

${hof}

### ONE BRIEF, THREE PROJECTS

The same style, written three times. Each header knows its own project.

${trioHtml}

### HIGH SCORES

\`\`\`text
${highScores}
\`\`\`

Small galleries to play through: ${galleryLinks}. The big sets are on THE FLOOR below.

## THE FLOOR

Every cabinet is a real header from this repo, numbered the way your gallery
numbers yours. An amber arrow on a card means the original is animated.
Click one for its page.

${floorOpen}

<details>
<summary><b>CONTINUE?</b> 20 more cabinets</summary>

${floorMore}

</details>

<p align="center">All ${headers} headers in ${galleries} galleries · <a href="styles/INDEX.md">all ${styles} styles</a></p>

## OPTIONS

<details>
<summary>Flags, speed and URL mode</summary>

\`\`\`text
ENGINE   < auto >     --claude
                      --codex
HEADERS  < 10 >       -6
MORE     < 11-20 >    more
INSTALL  < 3 >        use 3
MODEL    < default >  --model
JOBS     < 3 >        --jobs
URL      < off >      <url>
\`\`\`

**URL mode** is for a repo you haven't cloned:
\`npx readme-nfo github.com/you/project\`. For a private repo it falls back to
\`gh auth token\` when \`GH_TOKEN\` is unset.

One header took 74 s on Claude Sonnet and 2 min 31 s on Codex in our tests.
Ten take a few minutes at 3 at a time.

Showcase headers came from long Claude Opus runs; CLI headers are quicker and simpler.

More detail: [docs/generation.md](docs/generation.md).

</details>

## CREDITS

- Style research leans on public archives: [16colo.rs](https://16colo.rs),
  [Demozoo](https://demozoo.org), [Pouet](https://www.pouet.net) and
  [textfiles.com](http://www.textfiles.com).
- Built with [Node.js](https://nodejs.org) and [Playwright](https://playwright.dev).
- Scene styling is homage: no real group names or artwork.
- [MIT](LICENSE), by Luke Woods. Every installed header carries the notice in
  \`.github/readme-nfo/LICENSE\`.

## GAME OVER

\`\`\`text
${gameOver}
\`\`\`
`;
fs.writeFileSync(path.join(root, 'README.md'), md);
fs.writeFileSync(path.join(dir, 'README.md'), relink(md, dir, root));
// Report code-block widths.
const blocks = [...md.matchAll(/```[a-z]*\n([\s\S]*?)\n```/g)].map((m) => Math.max(...m[1].split('\n').map((l) => [...l].length)));
console.log(`README.md written: ${(md.length / 1024).toFixed(1)} KB; code-block widths ${blocks.join(', ')}; ${picks.length} floor cards; ${headers} headers in ${galleries} galleries; ${styles} styles; ${families} families`);
