#!/usr/bin/env node
// Scans every committed example header page (and its SVGs) for banned words, so picks can be vetted.
//   node docs/front-page/arcade-floor/src/scan.mjs [--all]
// Prints CLEAN or the hits for each candidate. Used by build.mjs as a gate.
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
export const root = path.resolve(here, '..', '..', '..', '..');
export const BANNED = [/\bcrack(?!le)/i, /keygen/i, /\bserials?\b/i, /warez/i, /supplied by/i, /swapper/i, /\bnuke/i, /\bprotection\b/i,
  /razor/i, /fairlight/i, /melon/i, /remorse/i, /second reality/i, /\bparadox\b/i, /\bskid ?row\b/i, /\breloaded\b/i,
  /\bhoodlum\b/i, /\bdeviance\b/i, /\bclass\b.*\bgroup\b/i, /\btristar\b/i, /\bquartex\b/i, /\bkefrens\b/i, /\bfuture crew\b/i,
  /\bsanity\b/i, /\bspaceballs\b/i, /\bscoopex\b/i, /\bphreak/i, /\bpirat/i, /\b(152|164|320)\s+(styles|headers|galleries)/i, /twelve galleries/i];
export const DENY = {
  'dance-vision': () => true,
  castaway: (n) => [15, 22, 23, 31, 32, 33, 34, 35, 83, 99, 103, 104, 105, 106, 115, 116].includes(n),
  heretic: (n) => [6, 9, 29, 38].includes(n),
  'ultra-satisfactory': (n) => [1, 2, 3, 4, 5, 6, 11, 15, 21, 29].includes(n),
  'readme-nfo': () => true,
};
export function scanPage(md) {
  const abs = path.join(root, md);
  const text = fs.readFileSync(abs, 'utf8');
  const dir = path.dirname(abs);
  const svgs = [...text.matchAll(/src="(assets\/[^"]+\.svg)"/g)].map((m) => path.join(dir, m[1]));
  const hits = [];
  for (const re of BANNED) if (re.test(text)) hits.push(`page ${re}`);
  for (const s of svgs) {
    if (!fs.existsSync(s)) continue;
    const t = fs.readFileSync(s, 'utf8');
    for (const re of BANNED) if (re.test(t)) hits.push(`${path.basename(s)} ${re}`);
  }
  return hits;
}
export function denied(md) {
  const m = md.match(/^examples\/([^/]+)\/(\d+)-/);
  return !m || (DENY[m[1]] && DENY[m[1]](Number(m[2])));
}
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const tracked = execSync('git ls-files examples', { cwd: root, encoding: 'utf8' }).split('\n').filter((f) => /^examples\/[^/]+\/\d+-[^/]+\.md$/.test(f) && !/medialog/.test(f));
  for (const md of tracked) {
    if (denied(md)) continue;
    const hits = scanPage(md);
    if (hits.length || process.argv.includes('--all')) console.log(hits.length ? 'HIT  ' : 'CLEAN', md, hits.join(' | '));
  }
}
