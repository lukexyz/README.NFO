// Hotkey buttons for concept 05, in the hero's menu colours. Glyph paths from the repo's own 5x7
// font; no <text>, static, opaque. Six 264x56 section keys (shown at 132x28) and three 400x56
// engine/local keys (shown at 200x28).
//   node keys.mjs <outDir>
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..');
const [outDir] = process.argv.slice(2);
fs.mkdirSync(outDir, { recursive: true });
const lib = fs.readFileSync(`${ROOT}/examples/readme-nfo/src/lib.mjs`, 'utf8');
const FONT = Function(`return ${lib.match(/const FONT = (\{[\s\S]*?\n\});/)[1]}`)();
FONT['·'] = [0, 0, 0, 4, 0, 0, 0];
function runs(text, x0, y0, s) {
  let d = '';
  for (const [i, ch] of [...text.toUpperCase()].entries()) {
    if (ch === ' ') continue;
    const g = FONT[ch] || FONT['?'];
    for (let r = 0; r < 7; r++) {
      let c = 0;
      while (c < 5) {
        if (g[r] & (1 << (4 - c))) { let e = c; while (e + 1 < 5 && g[r] & (1 << (4 - e - 1))) e++; d += `M${x0 + (i * 6 + c) * s} ${y0 + r * s}h${(e - c + 1) * s}v${s}h-${(e - c + 1) * s}z`; c = e + 1; } else c++;
      }
    }
  }
  return d;
}
const H = 56, S = 3;
// one key: [K] LABEL, bracket grey, letter yellow, label white; bevel like a DOS button
function key(file, k, label, W, { bg = '#0000aa', edge = '#5555ff', dark = '#000055', fg = '#ffffff', kc = '#ffff55', bc = '#aaaaaa' } = {}) {
  const text = k ? `[${k}] ${label}` : label;
  const tw = (text.length * 6 - 1) * S, x = Math.round((W - tw) / 2), y = Math.round((H - 7 * S) / 2);
  const parts = k
    ? `<path d="${runs('[', x, y, S)}${runs(']', x + 12 * S, y, S)}" fill="${bc}"/><path d="${runs(k, x + 6 * S, y, S)}" fill="${kc}"/><path d="${runs(label, x + 24 * S, y, S)}" fill="${fg}"/>`
    : `<path d="${runs(label, x, y, S)}" fill="${fg}"/>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W / 2}" height="${H / 2}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${text}">` +
    `<rect width="${W}" height="${H}" fill="${dark}"/><rect width="${W - 4}" height="${H - 4}" fill="${edge}"/><rect x="4" y="4" width="${W - 8}" height="${H - 8}" fill="${bg}"/>` +
    parts + `</svg>\n`;
  fs.writeFileSync(path.join(outDir, file), svg);
}
for (const [k, label] of [['D', 'DOOR'], ['I', 'INSTALL'], ['F', 'FILES'], ['S', 'SETUP'], ['H', 'HELP'], ['G', 'GOODBYE']]) key(`${k.toLowerCase()}.svg`, k, label, 264);
key('engine-claude.svg', 'C', 'CLAUDE CODE', 400);
key('engine-codex.svg', 'X', 'CODEX', 400);
key('local.svg', '', 'PRIVATE REPOS OK', 400, { bg: '#00aaaa', edge: '#55ffff', dark: '#005555', fg: '#000000' });
console.log(`wrote 9 keys to ${outDir}`);
