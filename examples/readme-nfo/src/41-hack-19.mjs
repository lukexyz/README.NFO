// Additional reference from the user's terminal screenshot; outside the saved random draws.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const data = JSON.parse(fs.readFileSync(path.join(DIR, '../../styles/styles.json'), 'utf8'));
const styles = data.families.flatMap(family => family.styles).filter(style => !style.duplicate_of);
const prompt = styles.find(style => style.id === 'hack-19').sampler_prompt;
const esc = value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// Original 5x7 grid, redrawn for this project's name.
const glyphs = {
  R:[30,17,17,30,20,18,17], E:[31,16,16,30,16,16,31], A:[14,17,17,31,17,17,17],
  D:[30,17,17,17,17,17,30], M:[17,27,21,21,17,17,17], '.':[0,0,0,0,0,12,12],
  N:[17,25,25,21,19,19,17], F:[31,16,16,30,16,16,16], O:[14,17,17,17,17,17,14],
};
const name = 'README.NFO';
let cells = '';
const ascii = Array.from({ length: 7 }, (_, row) => [...name].map((letter, index) =>
  Array.from({ length: 5 }, (_, col) => {
    if (!(glyphs[letter][row] & (1 << (4 - col)))) return ' ';
    cells += `<rect x="${24 + (index * 6 + col) * 8}" y="${20 + row * 8}" width="8" height="8" fill="${row > 4 || col === 0 ? 'url(#shade)' : '#009c9c'}"/>`;
    return row > 4 && (col + index + row) % 3 === 0 ? ':' : '#';
  }).join('')).join(' '));
const rows = [
  ['Repository: ', 'lukexyz/README.NFO', ''],
  ['', '', ''],
  ['Loading style catalogue... ', '', 'Ok'],
  ['* ', `${styles.length} distinct styles / ${data.families.length} families`, ''],
  ['', '', ''],
  ['Preparing header formats...', '', ''],
  ['* Text / ASCII: ', 'copyable character art', ''],
  ['* SVG: ', 'colour, vector lettering, optional motion', ''],
  ['', '', ''],
  ['Reading project...', '', ''],
  ['* Adapt ', 'name, description and verified facts', ''],
  ['Ready: ', 'choose a style, then copy a header', ''],
];
const transcript = [...ascii, '', 'https://github.com/lukexyz/README.NFO', '',
  ...rows.map(([label, value, status]) => label + value + status), '', 'Illustrative startup sequence.'].join('\n');
const body = rows.map(([label, value, status], index) => `<text x="24" y="${143 + index * 23}">${esc(label)}<tspan font-weight="700">${esc(value)}</tspan><tspan fill="#67a800">${esc(status)}</tspan></text>`).join('\n');
const image = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 450" role="img" aria-labelledby="title desc">
<title id="title">README.NFO — CLI startup banner</title>
<desc id="desc">Original teal block lettering, a blue project link and a compact white diagnostic log with green success markers. Illustrative startup sequence based on the repository's file map, with ${styles.length} styles in ${data.families.length} families.</desc>
<defs><pattern id="shade" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="4" fill="#009c9c"/><path d="M0 0h1v1H0zM2 2h1v1H2z" fill="#000"/></pattern></defs>
<rect width="960" height="450" fill="#000" rx="7"/>
<g shape-rendering="crispEdges">${cells}</g>
<g font-family="ui-monospace,Consolas,monospace" font-size="18" fill="#eee">
<text x="532" y="38" font-size="14">TEXT / ASCII + SVG</text>
<text x="24" y="106" fill="#1682c4" text-decoration="underline">https://github.com/lukexyz/README.NFO</text>
${body}
<text x="24" y="428" font-size="14" fill="#999">Illustrative startup sequence.</text>
</g></svg>
`;
const markdown = [
  '<!-- README.NFO candidate 41: additional screenshot-inspired reference, outside draw.json and draw-2.json. -->', '',
  '> **Candidate 41** · [hack-19](../../styles/hack.md#hack-19) · A teal block-letter CLI banner with a compact illustrative diagnostic log. SVG with a copyable text / ASCII fallback.', '',
  '[Generator](src/41-hack-19.mjs) · [All candidates](README.md) · [Sampler prompt](41-hack-19.prompt.txt) · [Text / ASCII](41-hack-19.txt)', '',
  '<img src="assets/41-hack-19.svg" width="960" alt="README.NFO: original teal block lettering over a compact white terminal log, with a blue repository link and green success markers">', '',
  '<details>', '<summary>Copyable text / ASCII fallback</summary>', '', '```text', transcript, '```', '', '</details>', '',
].join('\n');
fs.mkdirSync(path.join(DIR, 'assets'), { recursive: true });
fs.writeFileSync(path.join(DIR, 'assets/41-hack-19.svg'), image);
fs.writeFileSync(path.join(DIR, '41-hack-19.md'), markdown);
fs.writeFileSync(path.join(DIR, '41-hack-19.txt'), transcript + '\n');
fs.writeFileSync(path.join(DIR, '41-hack-19.prompt.txt'), prompt + '\n');
console.log('wrote CLI banner sample, SVG, text fallback and sampler prompt');
