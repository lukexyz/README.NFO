// Resolve picks.json against the repository: the page's first SVG, its size,
// whether it animates and honours reduced motion, its style id, git tracking,
// and the deny-list scan. Throws on anything that would put a bad link or a
// piracy-adjacent page on the front page.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { scanFile } from './deny.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(here, '..', '..', '..', '..');
export const DIR = path.resolve(here, '..');
export const REL = path.relative(ROOT, DIR).split(path.sep).join('/');

const tracked = new Set(execFileSync('git', ['ls-files', 'examples'], { cwd: ROOT, encoding: 'utf8' }).split('\n'));
const log = fs.readFileSync(path.join(ROOT, 'examples', 'build-log.csv'), 'utf8');

function styleOf(page, md) {
  const [gallery, file] = page.split('/');
  const row = log.split('\n').find((l) => l.includes(`,${gallery},${file},`));
  if (row) return row.split(',')[4];
  const m = (md.slice(0, 600).match(/\b(pc|c64|trk|nfo|ansi|vap|mach|hack|asia|idle|xfer|demo|print)-\d\d\b/) || [])[0];
  if (m) return m;
  const n = file.match(/^\d\d-([a-z0-9]+-\d\d)\.md$/);
  return n ? n[1] : '';
}

export function resolve(entry) {
  const mdRel = `examples/${entry.page}`;
  const mdAbs = path.join(ROOT, mdRel);
  if (!tracked.has(mdRel)) throw new Error(`untracked page ${mdRel}`);
  const md = fs.readFileSync(mdAbs, 'utf8');
  const src = (md.match(/src="(assets\/[^"]+\.svg)"/) || [])[1];
  const out = { ...entry, md: mdRel, style: styleOf(entry.page, md) };
  const hits = scanFile(mdAbs);
  if (src) {
    const svgRel = `${path.posix.dirname(mdRel)}/${src}`;
    if (!tracked.has(svgRel)) throw new Error(`untracked svg ${svgRel}`);
    const svg = fs.readFileSync(path.join(ROOT, svgRel), 'utf8');
    const vb = svg.match(/viewBox="\s*[-\d.]+[ ,]+[-\d.]+[ ,]+([\d.]+)[ ,]+([\d.]+)/);
    out.svg = svgRel;
    out.w = +vb[1]; out.h = +vb[2];
    out.animated = /@keyframes|<animate|<set\b/.test(svg);
    out.reducedMotion = /prefers-reduced-motion/.test(svg);
    if (out.animated && !out.reducedMotion) throw new Error(`no reduced motion: ${svgRel}`);
    for (const h of scanFile(path.join(ROOT, svgRel))) hits.push(`svg ${h}`);
  }
  if (hits.length) throw new Error(`deny list: ${mdRel}\n  ${hits.join('\n  ')}`);
  return out;
}

export function loadPicks() {
  const p = JSON.parse(fs.readFileSync(path.join(here, 'picks.json'), 'utf8'));
  const featured = p.featured.map(resolve);
  const wall = p.wall.map((e, i) => ({ ...resolve(e), n: i + 7 }));
  const castaway = wall.filter((e) => e.page.startsWith('castaway/')).length;
  if (castaway > 16) throw new Error(`castaway ${castaway} of the wall (cap 16)`);
  if (wall.length !== 40) throw new Error(`wall has ${wall.length}, want 40`);
  return { featured, sameBrief: p.sameBrief.map(resolve), wall, textDisk: p.textDisk.map(resolve), castaway };
}
