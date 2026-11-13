#!/usr/bin/env node
// Concept 01 "THE RELEASE": writes ../README.md from README.template.md and picks.lock.json.
//   node docs/front-page/the-release/src/build.mjs
// Run art.mjs and thumbs.mjs first. Fills:
//   {{A}}              the asset folder, root-relative
//   {{REEL:n}}         the 10 linked tiles of reel n (5 a row on desktop, 2 on phones)
//   {{FILES:n}}        the <details> file list of reel n, an NFO dot-leader list in <pre>
//   {{CONTENTS}}       the directory listing, counted from git ls-files
//   {{TWIN}}           assets/hero-twin.txt, the logo as plain text
// It refuses to write if a linked file is missing or a count disagrees with the shared facts.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..', '..', '..');
const DIR = path.resolve(HERE, '..');
const A = path.relative(ROOT, path.join(DIR, 'assets')).split(path.sep).join('/');
const { relink } = await import(pathToFileURL(path.join(ROOT, 'tools/front-page/lib/relink.mjs')).href);
const lock = JSON.parse(fs.readFileSync(path.join(HERE, 'picks.lock.json'), 'utf8'));
let md = fs.readFileSync(path.join(HERE, 'README.template.md'), 'utf8');

const fail = (msg) => { console.error(`build: ${msg}`); process.exit(1); };
const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

// ---- directory listing, from what git tracks
const SETS = ['castaway', 'ultra-satisfactory', 'readme-nfo', 'heretic', 'dance-vision', 'naturalis-historia', 'gl4ss', 'st3gg'];
const EXPECT = { castaway: 116, 'ultra-satisfactory': 42, 'readme-nfo': 41, heretic: 40, 'dance-vision': 6, 'naturalis-historia': 5, gl4ss: 5, st3gg: 5 };
const tracked = execFileSync('git', ['ls-files', 'examples'], { cwd: ROOT, encoding: 'utf8' }).split('\n');
const counts = Object.fromEntries(SETS.map((s) => [s, tracked.filter((f) => new RegExp(`^examples/${s}/\\d{2,3}-[^/]+\\.md$`).test(f)).length]));
for (const s of SETS) if (counts[s] !== EXPECT[s]) fail(`${s} has ${counts[s]} committed headers, shared facts say ${EXPECT[s]}`);
const total = Object.values(counts).reduce((a, b) => a + b, 0);
if (total !== 260) fail(`total ${total}, shared facts say 260`);
const W = 30; // same width as the BATCHES and ENGINE SELECT blocks
const row = (name, n) => { const left = ` ${name} `, right = ` ${n}`; return left + '.'.repeat(W - 1 - left.length - right.length) + right; };
const head = '▄▄▄ RELEASE CONTENTS ';
const contents = [head + '▄'.repeat(W - head.length), ...SETS.map((s) => row(`${s}/`, counts[s])), ' ' + '─'.repeat(W - 2), row('TOTAL', total), '▀'.repeat(W)].join('\n');
md = md.replace('{{CONTENTS}}', contents);

// ---- reels
const reels = [lock.tiles.slice(0, 10), lock.tiles.slice(10, 20), lock.tiles.slice(20, 30)];
reels.forEach((tiles, i) => {
  for (const t of tiles) for (const f of [t.md, t.svg, `${A}/tiles/${t.tile}`]) if (!fs.existsSync(path.join(ROOT, f))) fail(`missing ${f}`);
  const imgs = tiles.map((t) => `<a href="${t.md}" title="${esc(`${t.n} · ${t.set} · ${t.caption}`)}"><img src="${A}/tiles/${t.tile}" width="150" height="96" alt="${esc(`${t.n}: ${t.set} header, ${t.caption}${t.animated ? ' (animated)' : ''}`)}"></a>`);
  md = md.replace(`{{REEL:${i + 1}}}`, `<p align="center">\n${imgs.join('\n')}\n</p>`);
  // file list: 01 castaway ........ vap-05 »  caption   (the must-read part is 31 columns)
  const lines = tiles.map((t) => {
    const fam = t.style.split('-')[0];
    const left = `${t.n} ${t.set} `;
    const dots = '.'.repeat(Math.max(2, 23 - left.length));
    const anim = t.animated ? ' »' : '  ';
    return `<a href="${t.md}">${t.n}</a> ${t.set} ${dots} <a href="styles/${fam}.md#${t.style}">${t.style}</a>${' '.repeat(7 - t.style.length)}${anim}  ${esc(t.caption)}`;
  });
  md = md.replace(`{{FILES:${i + 1}}}`, `<pre>\n${lines.join('\n')}\n</pre>`);
});

md = md.replaceAll('{{A}}', A);
md = md.replace('{{TWIN}}', fs.readFileSync(path.join(HERE, '..', 'assets', 'hero-twin.txt'), 'utf8'));
if (/\{\{/.test(md)) fail(`unfilled placeholder: ${md.match(/\{\{[^}]*\}\}/)[0]}`);

// every local link and image must exist
const prose = md.replace(/^```[\s\S]*?^```/gm, '');
for (const m of prose.matchAll(/\b(?:src|href|srcset)="([^"#]+)[^"]*"|\]\(([^)#\s]+)[^)]*\)/g)) {
  const ref = m[1] || m[2];
  if (/^[a-z]+:/i.test(ref)) continue;
  if (!fs.existsSync(path.join(ROOT, ref))) fail(`missing link target ${ref}`);
}
// words that must never appear on the page
const deny = /\b(crack(?:ed|tro|s)?|keygen|serial|warez|supplied by|swapper|nuke|protection|pirat\w*)\b|\b152\b|\b320\b|twelve galleries|\b164\b/i;
const hit = md.replace(/<!--[\s\S]*?-->/g, '').match(deny);
if (hit) fail(`denied word on the page: ${hit[0]}`);

// every linked page (except the style catalogue, which is the repo's own research notes) must pass too
for (const m of prose.matchAll(/href="([^"#]+.md)[^"]*"|](([^)#s]+.md)[^)]*)/g)) {
  const ref = m[1] || m[2];
  if (/^[a-z]+:/i.test(ref) || ref.startsWith('styles/')) continue;
  const bad = fs.readFileSync(path.join(ROOT, ref), 'utf8').replace(/inspiration/gi, '').match(deny);
  if (bad) fail(`linked page ${ref} contains "${bad[0]}"`);
}

// Checked as if it were the root README, then written with links from this design's folder.
fs.writeFileSync(path.join(DIR, 'README.md'), relink(md, DIR, ROOT));
console.log(`README.md written: ${(Buffer.byteLength(md) / 1024).toFixed(1)} KB, ${lock.tiles.length} tiles, ${total} headers listed`);
