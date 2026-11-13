#!/usr/bin/env node
// Concept 02 BOOT INTRO: the two engine buttons under the pitch, in the
// hero's loader-strip style. Each links to that agent's install page.
//   node docs/front-page/boot-intro/src/buttons.mjs
// Writes ../assets/engine-claude.svg and ../assets/engine-codex.svg (400x72,
// shown at width 260). Static, original 5x7 glyphs as paths, no <text>.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FONT5, glyphPath } from './fonts.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const W = 400, H = 72;
const pw = (str, s) => (str.length * 6 - 1) * s;
const pix = (str, x, y, s, fill) => `<path transform="translate(${x} ${y})" d="${[...str].map((c, i) => (c === ' ' ? '' : glyphPath(FONT5[c], s, i * 6 * s, 0))).join('')}" fill="${fill}"/>`;

for (const [file, name, ink, note] of [
  ['engine-claude.svg', 'CLAUDE CODE', '#ffb68f', 'SIGN IN TO'],
  ['engine-codex.svg', 'CODEX', '#8fdcff', 'OR SIGN IN TO'],
]) {
  const value = `◄ ${name} ►`;
  const vx = Math.round(W / 2 - pw(value, 3) / 2);
  const a = pix('◄', vx, 36, 3, '#ffd84a');
  const v = pix(name, vx + 2 * 18, 36, 3, ink);
  const b = pix('►', vx + (value.length - 1) * 18, 36, 3, '#ffd84a');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" shape-rendering="crispEdges" role="img" aria-labelledby="t">
<title id="t">${note.toLowerCase()} ${name === 'CODEX' ? 'Codex' : 'Claude Code'}</title>
<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="6" fill="#04050b"/>
<rect x="6" y="6" width="${W - 12}" height="${H - 12}" fill="#2b303b"/>
<path d="M6 6h${W - 12}v3H9v${H - 15}H6z" fill="#6b7386"/>
<path d="M${W - 6} ${H - 6}H6v-3h${W - 15}V6h3z" fill="#0e1015"/>
${pix(note, Math.round(W / 2 - pw(note, 2) / 2), 15, 2, '#9fb0c8')}
${a}${v}${b}
<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="6" fill="none" stroke="#30363d" stroke-width="2"/>
</svg>
`;
  fs.writeFileSync(path.join(here, '..', 'assets', file), svg);
  console.log(file, (svg.length / 1024).toFixed(1), 'KB');
}
