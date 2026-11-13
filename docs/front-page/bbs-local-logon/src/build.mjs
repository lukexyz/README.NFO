// Builds concept 05's README.md (BBS LOCAL LOGON) from curation.json, neutral-names.json and facts
// computed from the repo (inventory.mjs), so every number, area listing and anchor is generated.
// --check exits 1 when the README on disk is stale.
//   node build.mjs [--check]
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT, SRC, GROUP, inventory } from './inventory.mjs';
const { relink } = await import(pathToFileURL(path.join(ROOT, 'tools/front-page/lib/relink.mjs')).href);
const mode = process.argv[2];
const DIR = path.dirname(SRC);
const ASSETS = path.relative(ROOT, path.join(DIR, 'assets')).replace(/\\/g, '/');
const cur = JSON.parse(fs.readFileSync(path.join(SRC, 'curation.json'), 'utf8'));
const { headers, perFamilyStyles, callers, F } = await inventory();
const byMd = new Map(headers.map((h) => [h.md, h]));
const need = (md, tile = true) => {
  const h = byMd.get(md);
  if (!h) throw new Error(`not a committed header: ${md}`);
  if (h.hidden || (tile && !h.tileOk)) throw new Error(`deny-listed: ${md}`);
  if (h.svg) {
    const title = (fs.readFileSync(path.join(ROOT, h.svg), 'utf8').match(/<title[^>]*>([^<]*)/) || [])[1] || '';
    if (/\b(crack|keygen|warez|razor|fairlight|paradox|melon)\b/i.test(title) || GROUP.test(title)) throw new Error(`svg title: ${md}`);
  }
  return h;
};

// GitHub heading slug: lower case, drop punctuation other than - and _, spaces to hyphens
const slug = (t) => t.toLowerCase().replace(/[^\p{L}\p{M}\p{N}\p{Pc}\- ]/gu, '').replace(/ /g, '-');
const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const H2 = { d: '[D]oor · make headers for your project', i: '[I]nstall · put one in your README', f: '[F]iles · the example areas', s: '[S]etup · door options', h: '[H]elp', g: '[G]oodbye' };
const KEYS = [['d', 'Door: make headers'], ['i', 'Install one'], ['f', 'Files: examples'], ['s', 'Setup: options'], ['h', 'Help'], ['g', 'Goodbye']];
const hotkeys = KEYS.map(([k, alt]) => `<a href="#${slug(H2[k])}"><img src="${ASSETS}/keys/${k}.svg" width="132" height="28" alt="[${k.toUpperCase()}] ${alt}"></a>`).join('\n');

const out = [];
const p = (...lines) => out.push(...lines, '');

// ---- 0. hero ----
p(`<p align="center"><img src="${ASSETS}/hero-bbs.svg" width="100%" alt="README.NFO bulletin board main menu: door, install, files, setup, help and goodbye, beside a last-callers list of ${F.projects} example galleries. Engines: Claude Code or Codex. Local logon: private repos OK."></p>`);
p('<h1 align="center">README.NFO</h1>');
p(`<p align="center">Retro headers for your README, drawn fresh for your project by <b>Claude Code</b> or <b>Codex</b>.<br>\n<sub>${F.styles} styles · ${F.headers} example headers · ${F.projects} galleries · MIT</sub></p>`);
p(`<p align="center">\n${hotkeys}\n</p>`);

// ---- 1. [D]oor ----
p(`## ${H2.d}`);
p('README.NFO is a door: a small program that runs on your machine, hands your',
  'project to your coding agent and brings back ten numbered headers.');
p('```sh', 'npx readme-nfo', '```');
p('1. Install [Node.js 22+](https://nodejs.org) and sign in to',
  '   [Claude Code](https://claude.com/claude-code) or',
  '   [Codex](https://developers.openai.com/codex).',
  '2. In your project\'s folder, run the line above.',
  '3. A gallery opens with 10 numbered headers. Type the number you like',
  '   and it goes at the top of your README. Review with `git diff`, then commit.');
p(`<p align="center">\n<a href="https://claude.com/claude-code"><img src="${ASSETS}/keys/engine-claude.svg" width="200" height="28" alt="[C] Claude Code"></a>\n<a href="https://developers.openai.com/codex"><img src="${ASSETS}/keys/engine-codex.svg" width="200" height="28" alt="[X] Codex"></a>\n<a href="#help"><img src="${ASSETS}/keys/local.svg" width="200" height="28" alt="Local logon: private repos OK"></a>\n</p>`);
p('**Pick your engine: Claude or Codex.** It uses whichever one you\'re signed in to,',
  'and asks once if you have both. To choose: `npx readme-nfo --claude` or',
  '`npx readme-nfo --codex`.');
p('**Local logon: private repos work.** It reads your project folder, not GitHub,',
  'so there\'s no token to set. Your project facts go only to the agent you picked.');
p('<sub>The door at work (3 headers drawn at a time):</sub>');
p('```text',
  'README.NFO door · local logon',
  'Project ..... read from folder',
  'Engine? [C] Claude  [X] Codex',
  `Drawing 10 of ${F.styles} styles`,
  '#01 vap-05 ......... done',
  '#02 c64-13 ......... done',
  '#03 idle-10 ........ done',
  '#04 ansi-08 ........ done',
  '...',
  '#10 print-02 ....... done',
  'Gallery: readme-headers/',
  'Install which? [1-10] 3',
  'Added to README.md',
  'Now git diff, then commit.',
  '```');
p('**Want more?** `npx readme-nfo more` gives 10 new styles, numbered 11-20, on the',
  'same gallery page. No style repeats. `npx readme-nfo use 14` swaps your header.');
p('```text',
  'FILE LISTING · your gallery',
  '═════════════════════════════',
  'BATCH 1',
  '#01 vap-05      #06 mach-11',
  '#02 c64-13      #07 nfo-04',
  '#03 idle-10 <   #08 trk-07',
  '#04 ansi-08     #09 pc-03',
  '#05 print-02    #10 hack-12',
  '─── "make 10 more" ──────────',
  'BATCH 2',
  '#11 demo-01     #16 asia-03',
  '#12 vap-17      #17 xfer-06',
  '#13 pc-06       #18 c64-06',
  '#14 mach-15     #19 trk-01',
  '#15 ansi-06     #20 idle-06',
  '═════════════════════════════',
  'No style repeats.',
  'Same gallery page.',
  '< your pick: "number 3"',
  '```');
p('> [!TIP]',
  '> Or just ask your agent: *"Get me 10 headers from README.NFO"*, then',
  '> *"number 3"*, or *"make 10 more"*.');

// ---- 2. [I]nstall ----
p(`## ${H2.i}`);
p('Type the number, or tell your agent *"number 3"*. The door copies that SVG and',
  'README.NFO\'s MIT notice to `.github/readme-nfo/`, adds the header between two',
  'marker comments at the top of your README, and never commits.');
p('Review with `git diff`, then commit. Changed your mind? `npx readme-nfo use 14`.');
p('What changes in your repo: `.github/readme-nfo/header.svg`, `.github/readme-nfo/LICENSE`',
  'and one marked block at the top of README.md. Nothing is committed for you. To undo,',
  'delete the block and the folder.');
p('<details><summary>The block it adds</summary>', '',
  '```html',
  '<!-- README.NFO header: start -->',
  '<p align="center"><img',
  ' src=".github/readme-nfo/header.svg"',
  ' width="100%"',
  ' alt="my-project header"></p>',
  '<!-- README.NFO header: end -->',
  '```', '', '</details>');

// ---- 3. [F]iles ----
p(`## ${H2.f}`);
p(`Every header here was drawn for a real project. ${F.headers} of them, in ${F.families} areas.`,
  'Click any one to see it move and copy its Markdown.');
p('### Sysop\'s picks');
const fe = cur.featured.map(([md, cap, w = 400]) => ({ h: need(md), cap, w }));
for (let i = 0; i < fe.length; i += 2) {
  const pair = fe.slice(i, i + 2);
  p('<p align="center">\n' + pair.map(({ h, cap, w }) => `<a href="${h.md}"><img src="${h.svg}" width="${w}" alt="${esc(h.project)} header: ${esc(cap)} (animated)"></a>`).join('\n') + '\n</p>');
  p('<p align="center"><sub>' + pair.map(({ h, cap }) => `<b>${h.project}</b> · ${cap}`).join('&nbsp; | &nbsp;') + '</sub></p>');
}
p('### Same door, three callers');
p('One style brief, three projects. Each run reads its own folder, so each card is its own.');
const cl = cur.callers.map((md) => need(md));
p('<p align="center">\n' + cl.map((h) => `<a href="${h.md}"><img src="${h.svg}" width="270" alt="${esc(h.project)} header: off-air test card (animated)"></a>`).join('\n') + '\n</p>');
p('<p align="center"><sub>' + cl.map((h) => `<a href="examples/${h.set}/README.md">${h.project}</a>`).join(' · ') + ' · off-air test card</sub></p>');
p('### File areas');
p(`<sub>Tiles are stills; open one to see it move. ► marks an animated original. Open the list under a row for the rest of that area.</sub>`);
let tileCount = 0;
const projTiles = {};
for (const a of cur.areas) {
  const inArea = headers.filter((h) => h.family === a.family);
  const listed = inArea.filter((h) => !h.hidden);
  const tiles = a.tiles.map((key, j) => ({ h: need(`examples/${key}.md`), n: String(j + 1).padStart(2, '0') }));
  for (const t of tiles) { if (t.h.family !== a.family) throw new Error(`wrong area: ${t.h.md}`); projTiles[t.h.set] = (projTiles[t.h.set] || 0) + 1; }
  tileCount += tiles.length;
  p(`<p><b>${esc(a.name)}</b> · ${perFamilyStyles[a.family]} styles<br>\n` +
    tiles.map((t) => `<a href="${t.h.md}"><img src="${ASSETS}/thumbs/${a.family}-${t.n}.jpg" width="148" height="83" alt="${t.n}: ${esc(t.h.project)} header, ${esc(t.h.name)}"></a>`).join('\n') +
    '<br>\n<sub>' + tiles.map((t) => `${t.n}&nbsp;${t.h.name.replace(/ /g, '&nbsp;')}`).join(' · ') + '</sub></p>');
  const summary = `List this area's ${listed.length} headers`;
  p(`<details><summary>${summary}</summary>`, '',
    ...listed.sort((x, y) => x.project.localeCompare(y.project) || +x.n - +y.n).map((h) => `- [${h.project} ${h.n}](${h.md}) · ${h.name}${h.kind === 'animated' ? ' ►' : h.kind === 'text' ? ' (text)' : ''}`), '', '</details>');
}
p(`<sub>Galleries: ` + callers.map(([s, n]) => { const name = headers.find((h) => h.set === s).project; return headers.some((h) => h.set === s && !h.hidden) ? `<a href="examples/${s}/README.md">${name}</a> ${n}` : `${name} ${n}`; }).join(' · ') + ` · <a href="styles/INDEX.md">all ${F.styles} styles</a></sub>`);

// ---- 4. [S]etup ----
p(`## ${H2.s}`);
p(`The door works with no options: 10 headers, 3 drawn at a time, from all ${F.styles} styles,`,
  'with whichever engine you\'re signed in to. Add any of these to `npx readme-nfo`:');
p('```text',
  '--claude    use Claude Code',
  '--codex     use Codex',
  '-6          six, not ten',
  'more        10 more (#11-20)',
  'use 14      install header 14',
  '```');
p('<details><summary>Every other option</summary>', '',
  '```text',
  '--model M   pick the model',
  '--jobs 3    drawn at once',
  '--resume    finish a stopped',
  '            batch',
  '--out DIR   gallery folder',
  '--no-open   don\'t open the',
  '            browser',
  '--seed S    repeat a draw',
  '```', '',
  'Not cloned it? Give a URL instead of running it in the folder:',
  '`npx readme-nfo github.com/you/project`. For a private repo it uses your',
  '`gh auth token` when `GH_TOKEN` is not set.', '', '</details>');

// ---- 5. [H]elp ----
p(`## ${H2.h}`);
p('> [!TIP]',
  '> **"No engine found"?** Sign in first. Claude Code: install it from',
  '> [claude.com/claude-code](https://claude.com/claude-code), run `claude` and type `/login`.',
  '> Codex: install it from [developers.openai.com/codex](https://developers.openai.com/codex)',
  '> and run `codex login`. Then run the door again.');
p('**How long?** In our 2026-11-11 tests one header took 74 s with Claude Sonnet and',
  '2 min 31 s with Codex. Ten take a few minutes, 3 at a time, and the gallery fills',
  'as each one lands.');
p('**What leaves my machine?** Your project\'s name, description, README headings,',
  'languages and licence, plus the style briefs. They go only to your agent, under',
  'your own sign-in. README.NFO has no server.');
p('**Why do the examples look so polished?** The showcase art came from long',
  'Claude Opus runs. The door is quicker and simpler, so expect simpler pieces.');
p('**Something broke?** [Open an issue](https://github.com/lukexyz/README.NFO/issues) with what you ran.');

// ---- 6. [G]oodbye ----
p(`## ${H2.g}`);
p('```text',
  'Thanks for calling README.NFO',
  '═════════════════════════════',
  'archives .. 16colo.rs',
  '            Demozoo · Pouet',
  '            textfiles.com',
  'tools ..... Node.js',
  '            Playwright',
  'licence ... MIT · Luke Woods',
  '═════════════════════════════',
  '+++ATH0',
  'NO CARRIER',
  '',
  '[ EOF ]',
  '```');
p('[MIT licence](LICENSE) · [Style catalogue](styles/INDEX.md) · [All galleries](examples/README.md) · [How it works](docs/generation.md)');

// Written as if it were the root README, then relinked to work from this design's folder.
const md = relink(out.join('\n').replace(/\n{3,}/g, '\n\n'), DIR, ROOT);
const file = path.join(DIR, 'README.md');
if (mode === '--check') {
  const same = fs.existsSync(file) && fs.readFileSync(file, 'utf8') === md;
  console.log(same ? 'README up to date' : 'README is stale: run build.mjs');
  process.exit(same ? 0 : 1);
}
fs.writeFileSync(file, md);
const listed = headers.filter((h) => !h.hidden).length;
console.log(`README.md ${(md.length / 1024).toFixed(1)} KB · facts ${JSON.stringify(F)} · tiles ${tileCount} ${JSON.stringify(projTiles)} · listed ${listed}/${headers.length}`);
console.log('anchors:', Object.values(H2).map(slug).join(' '));
