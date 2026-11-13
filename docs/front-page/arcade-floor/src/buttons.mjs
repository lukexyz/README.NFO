#!/usr/bin/env node
// Concept 06 (ARCADE FLOOR): the four 132x28 cabinet-button nav SVGs under the hero.
//   node docs/front-page/arcade-floor/src/buttons.mjs
// Static (no motion), opaque, path glyphs from font.mjs. The styles count is read from the catalogue.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { makeWriter, textWidth } from './font.mjs';
import { root } from './scan.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(here, '..', 'assets', 'nav');
fs.mkdirSync(out, { recursive: true });
const { checkCatalogue, svgPolicyIssues } = await import(pathToFileURL(path.join(root, 'tools/lib/checks.mjs')).href);
const styles = checkCatalogue(JSON.parse(fs.readFileSync(path.join(root, 'styles/styles.json'), 'utf8'))).distinct.length;

export const BUTTONS = [
  ['insert-coin', 'INSERT COIN', '#ffb000'],
  ['the-floor', 'THE FLOOR', '#3dd6ff'],
  ['hall-of-fame', 'HALL OF FAME', '#ff5aa8'],
  ['styles', `${styles} STYLES`, '#b48cff'],
];

for (const [slug, label, colour] of BUTTONS) {
  const W = makeWriter('n');
  const s = 1.5;
  const tw = textWidth(label, s);
  const glyphs = W.text(label, (132 - tw) / 2, (28 - 7 * s) / 2, s, colour);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 132 28" width="132" height="28" role="img" aria-label="${label}">
<title>${label}</title>
<defs>${W.defs()}<linearGradient id="b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#262a3d"/><stop offset="1" stop-color="#0e1018"/></linearGradient></defs>
<rect x="1" y="1" width="130" height="26" rx="6" fill="url(#b)" stroke="${colour}" stroke-width="2"/>
<rect x="5" y="4" width="122" height="2" rx="1" fill="#fff" opacity=".12"/>
${glyphs}
</svg>
`;
  fs.writeFileSync(path.join(out, `${slug}.svg`), svg);
  const issues = svgPolicyIssues(svg);
  console.log(`nav/${slug}.svg ${(svg.length / 1024).toFixed(1)} KB policy ${issues.length ? issues.join('; ') : 'ok'}`);
}
