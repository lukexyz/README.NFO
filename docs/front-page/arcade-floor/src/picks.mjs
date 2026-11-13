// Loads the curated floor picks (picks.src.txt) and resolves every path, animation flag and alt text.
// Line format: set/NN|fit|LABEL|caption[|from,to]
//   fit: cover[:ms capture time] | top (cover, anchored top) | contain (letterbox over a blurred copy) | text (first text block)
//   LABEL: burned into the card strip, 13 characters or fewer, never a catalogue style name
//   caption: neutral words for alt text and the <sub> name lines
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { root, scanPage, denied } from './scan.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
export const PROJECT = {
  castaway: 'CASTAWAY', 'ultra-satisfactory': 'ULTRA-SATISFACTORY', heretic: 'HERETIC', gl4ss: 'GL4SS',
  st3gg: 'ST3GG', 'naturalis-historia': 'NATURALIS-HISTORIA',
};
export const TITLE = {
  castaway: 'Castaway', 'ultra-satisfactory': 'Ultra-Satisfactory', heretic: 'Heretic', gl4ss: 'GL4SS',
  st3gg: 'ST3GG', 'naturalis-historia': 'Naturalis Historia',
};

const tracked = new Set(execSync('git ls-files examples', { cwd: root, encoding: 'utf8' }).split('\n'));

export function resolve(set, num) {
  const dir = path.join(root, 'examples', set);
  const file = fs.readdirSync(dir).find((f) => f.startsWith(`${num}-`) && f.endsWith('.md'));
  if (!file) throw new Error(`no page for ${set}/${num}`);
  const md = `examples/${set}/${file}`;
  const text = fs.readFileSync(path.join(root, md), 'utf8');
  const m = text.match(/src="(assets\/[^"]+\.svg)"/);
  const svg = m ? `examples/${set}/${m[1]}` : null;
  const svgText = svg ? fs.readFileSync(path.join(root, svg), 'utf8') : '';
  return { md, svg, animated: /@keyframes|<animate/.test(svgText) };
}

export function loadPicks() {
  const lines = fs.readFileSync(path.join(here, 'picks.src.txt'), 'utf8').split(/\r?\n/).filter((l) => l.trim());
  const picks = lines.map((line, i) => {
    const [ref, fitT, label, caption, lines] = line.split('|');
    const [fit, t] = fitT.split(':');
    const [set, num] = ref.split('/');
    const r = resolve(set, num);
    const n = String(i + 1).padStart(2, '0');
    return {
      n, set, fit, t: Number(t || 3000), label, caption, ...r,
      lines: lines ? lines.split(',').map(Number) : null,
      project: PROJECT[set],
      title: TITLE[set],
      alt: `${n}: ${PROJECT[set]} header, ${caption}${r.animated ? ' (animated)' : ''}`,
      open: i < 30,
    };
  });
  // Gates: committed, not on the deny list, no banned words, labels short and unique.
  const errors = [];
  const labels = new Set();
  for (const p of picks) {
    if (!tracked.has(p.md)) errors.push(`${p.n} untracked ${p.md}`);
    if (p.svg && !tracked.has(p.svg)) errors.push(`${p.n} untracked ${p.svg}`);
    if (denied(p.md)) errors.push(`${p.n} on the deny list ${p.md}`);
    const hits = scanPage(p.md);
    if (hits.length) errors.push(`${p.n} banned words in ${p.md}: ${hits.join(', ')}`);
    if (p.label.length > 13) errors.push(`${p.n} label too long: ${p.label}`);
    if (labels.has(p.label)) errors.push(`${p.n} duplicate label ${p.label}`);
    labels.add(p.label);
  }
  const open = picks.filter((p) => p.open);
  const cas = open.filter((p) => p.set === 'castaway').length;
  if (cas > 12) errors.push(`castaway has ${cas} of the 30 open cards (cap 12)`);
  if (errors.length) throw new Error(`picks failed:\n  ${errors.join('\n  ')}`);
  return picks;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const picks = loadPicks();
  const by = {};
  for (const p of picks) by[p.set] = (by[p.set] || 0) + 1;
  console.log(picks.length, 'picks', by, 'animated', picks.filter((p) => p.animated).length);
}
