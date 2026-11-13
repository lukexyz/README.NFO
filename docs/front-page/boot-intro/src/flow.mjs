#!/usr/bin/env node
// Concept 02 BOOT INTRO: the numbered-batch diagram, assets/flow.svg (830x360).
//   node docs/front-page/boot-intro/src/flow.mjs
// A 12 s loop of the core flow: DISK 1 fills 01-10 three at a time, the
// cursor picks 03, card 03 flies into a README sheet, then DISK 2 fills 11-20
// on the same gallery page. Under reduced motion it is the finished state.
// Glyphs are the original 5x7 font as paths; no <text>.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FONT5, glyphPath } from './fonts.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const W = 830, H = 360, LOOP = 12;
// Start each loop on the finished frame (t = 10.5 s of 12) so the first frame,
// a paused tab and any first-frame renderer all show the whole story.
const HOLD = 10.5;
const pix = (str, x, y, s, fill, extra = '') => `<path${extra} transform="translate(${x} ${y})" d="${[...str].map((c, i) => (c === ' ' ? '' : glyphPath(FONT5[c] || FONT5['?'], s, i * 6 * s, 0))).join('')}" fill="${fill}"/>`;
const pw = (str, s) => (str.length * 6 - 1) * s;

// Twenty mini headers, each a different made-up style: [top, bottom, band, ink, word].
const CARDS = [
  ['#1b0b3a', '#ff5fa2', '#ffd84a', '#fff', 'NFO'], ['#002b36', '#0a7d6b', '#7dffb0', '#eafff4', 'ANSI'],
  ['#3a2c9e', '#6c5ce7', '#a29bfe', '#fff', 'C64'], ['#0b0b0b', '#3b1d00', '#ff8a1f', '#ffe14a', 'VGA'],
  ['#000080', '#0000aa', '#55ffff', '#ffff55', 'BBS'], ['#07070f', '#26114a', '#ff2fa0', '#8fdcff', 'DEMO'],
  ['#0d2818', '#04471c', '#58d68d', '#d5f5e3', 'LCD'], ['#ffe6f2', '#ffb3d9', '#00b3b3', '#2b2b2b', 'MEMPHIS'],
  ['#101820', '#2c3e50', '#f39c12', '#ecf0f1', 'TRACKER'], ['#2b0f0f', '#7a1f1f', '#ffcc33', '#fff3d6', 'ARCADE'],
  ['#e8f4ff', '#9cc9f5', '#2f6fbd', '#0b2545', 'AERO'], ['#0a0a0a', '#1f1f1f', '#33ff66', '#33ff66', 'TTY'],
  ['#1a1033', '#ff6ec7', '#ffe66d', '#1a1033', 'OUTRUN'], ['#fff8e7', '#efe2c0', '#2e7d32', '#3e2723', 'PRINT'],
  ['#00111f', '#003b5c', '#00e5ff', '#e0fbff', 'VFD'], ['#200122', '#6f0000', '#ff9966', '#ffe0cc', 'PC-98'],
  ['#0f0f23', '#1e1e5a', '#c0c0ff', '#ffffff', 'COPPER'], ['#111', '#333', '#ff3366', '#fafafa', 'MODEM'],
  ['#062a12', '#0f5d2a', '#b8ff6b', '#eaffd6', 'PETSCII'], ['#14002b', '#3a0ca3', '#f72585', '#ffd6f0', 'ZINE'],
];

const CW = 104, CH = 58, GX = 9, GY = 9, X0 = 20;
const ROWS = { 1: [62, 129], 2: [222, 289] };
const at = (i) => { // i = 0..19
  const batch = i < 10 ? 1 : 2, k = i % 10;
  return [X0 + (k % 5) * (CW + GX), ROWS[batch][Math.floor(k / 5)]];
};

function cardArt(i, id) {
  const [top, bot, band, ink, word] = CARDS[i];
  const s = 2;
  const wx = Math.round(CW / 2 - pw(word, s) / 2), wy = 25;
  return `<g id="${id}"><rect width="${CW}" height="${CH}" fill="url(#g${i})"/>`
    + `<rect y="${Math.round(CH * 0.8)}" width="${CW}" height="3" fill="${band}"/>`
    + `<rect y="${Math.round(CH * 0.8) + 6}" width="${CW}" height="1" fill="${band}" opacity=".6"/>`
    + `<rect y="${Math.round(CH * 0.8) + 10}" width="${CW}" height="1" fill="${band}" opacity=".3"/>`
    + pix(word, wx + 1, wy + 1, s, '#000', ' opacity=".55"') + pix(word, wx, wy, s, ink) + '</g>';
}

// keyframe helpers: percentages of the 12 s loop
const pc = (t) => +((t / LOOP) * 100).toFixed(2);
const css = [];
const appear = (cls, t) => css.push(`.${cls}{animation:${cls} ${LOOP}s linear -${HOLD}s infinite}@keyframes ${cls}{0%,${pc(t)}%{opacity:0}${pc(t + 0.25)}%,96%{opacity:1}100%{opacity:0}}`);

const defs = [], body = [];
CARDS.forEach(([top, bot], i) => defs.push(`<linearGradient id="g${i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bot}"/></linearGradient>`));
defs.push(`<clipPath id="cc"><rect width="${CW}" height="${CH}" rx="3"/></clipPath>`);
CARDS.forEach((_, i) => defs.push(cardArt(i, `c${i}`)));

for (let i = 0; i < 20; i++) {
  const [x, y] = at(i);
  const t = i < 10 ? 0.3 + Math.floor(i / 3) * 0.55 : 6.7 + Math.floor((i - 10) / 3) * 0.55;
  const num = String(i + 1).padStart(2, '0');
  appear(`k${i}`, t);
  body.push(`<g class="k${i}" transform="translate(${x} ${y})"><g clip-path="url(#cc)"><use href="#c${i}"/></g>`
    + `<rect x=".5" y=".5" width="${CW - 1}" height="${CH - 1}" rx="3" fill="none" stroke="#000" stroke-opacity=".5"/>`
    + `<rect width="30" height="20" fill="#000" opacity=".85"/>${pix(num, 4, 3, 2, '#ffd84a')}</g>`);
}

// Pick 03: amber frame, then a copy flies into the README sheet.
const [px, py] = at(2);
appear('pick', 3.6);
body.push(`<rect class="pick" x="${px - 3}" y="${py - 3}" width="${CW + 6}" height="${CH + 6}" rx="5" fill="none" stroke="#ffb000" stroke-width="3"/>`);

// README sheet
const SX = 600, SY = 44, SWD = 210, SHT = 303;
const SLX = SX + 10, SLY = SY + 32, SLW = SWD - 20, SC = SLW / CW, SLH = CH * SC;
body.push(`<rect x="${SX}" y="${SY}" width="${SWD}" height="${SHT}" rx="6" fill="#f6f8fa" stroke="#57606a"/>`
  + `<path d="M${SX} ${SY + 6}a6 6 0 0 1 6 -6h${SWD - 12}a6 6 0 0 1 6 6v16h-${SWD}z" fill="#d0d7de"/>`
  + pix('README.MD', SX + 10, SY + 4, 2, '#24292f'));
appear('slot0', 99); // placeholder name, replaced below
css.pop();
css.push(`.slot{animation:slot ${LOOP}s linear -${HOLD}s infinite}@keyframes slot{0%,${pc(5.5)}%{opacity:1}${pc(5.6)}%,100%{opacity:0}}`);
body.push(`<rect class="slot" x="${SLX + 0.5}" y="${SLY + 0.5}" width="${SLW - 1}" height="${SLH - 1}" fill="none" stroke="#8c959f" stroke-dasharray="4 3"/>`);
let ly = SLY + SLH + 34;
const lines = [[150, '#57606a'], [170, '#8c959f'], [120, '#8c959f'], [160, '#8c959f'], [90, '#8c959f'], [150, '#8c959f'], [130, '#8c959f']];
for (const [w, c] of lines) { if (ly > SY + SHT - 12) break; body.push(`<rect x="${SX + 10}" y="${ly}" width="${w}" height="6" fill="${c}" opacity=".7"/>`); ly += 16; }
appear('tag', 5.6);
body.push(`<g class="tag">${pix('#03 INSTALLED', SX + 10, SLY + SLH + 10, 2, '#1a7f37')}</g>`);

css.push(`.fly{animation:fly ${LOOP}s linear -${HOLD}s infinite}@keyframes fly{0%,${pc(4.3)}%{opacity:0;transform:translate(${px}px,${py}px) scale(1)}`
  + `${pc(4.4)}%{opacity:1;transform:translate(${px}px,${py}px) scale(1);animation-timing-function:ease-in-out}`
  + `${pc(5.6)}%,96%{opacity:1;transform:translate(${SLX}px,${SLY}px) scale(${SC.toFixed(4)})}100%{opacity:0;transform:translate(${SLX}px,${SLY}px) scale(${SC.toFixed(4)})}}`);
body.push(`<g class="fly" transform="translate(${SLX} ${SLY}) scale(${SC.toFixed(4)})"><g clip-path="url(#cc)"><use href="#c2"/></g></g>`);

// Cursor: a pixel arrow that glides to card 03 and clicks.
const ARROW = ['#.......', '##......', '#*#.....', '#**#....', '#***#...', '#****#..', '#*****#.', '#**####.', '#*#.....', '##......', '#.......'];
let ad = '', af = '';
ARROW.forEach((row, r) => [...row].forEach((ch, c) => { const sq = `M${c * 2} ${r * 2}h2v2h-2z`; if (ch === '#') ad += sq; else if (ch === '*') af += sq; }));
const cx = px + CW * 0.62, cy = py + CH * 0.55;
css.push(`.cur{animation:cur ${LOOP}s linear -${HOLD}s infinite}@keyframes cur{0%,${pc(2)}%{opacity:0;transform:translate(470px,330px)}`
  + `${pc(2.3)}%{opacity:1;transform:translate(470px,330px);animation-timing-function:ease-in-out}${pc(3.4)}%{transform:translate(${cx}px,${cy}px)}`
  + `${pc(3.55)}%{transform:translate(${cx}px,${cy + 2}px)}${pc(3.7)}%,${pc(4.6)}%{opacity:1;transform:translate(${cx}px,${cy}px)}${pc(4.9)}%,100%{opacity:0;transform:translate(${cx}px,${cy}px)}}`);
body.push(`<g class="cur" opacity="0"><path d="${af}" fill="#fff"/><path d="${ad}" fill="#000"/></g>`);

// Labels
appear('d2', 6.3);
const head = [
  pix('README-HEADERS/INDEX.HTML', 20, 16, 2, '#8b949e'),
  pix('ONE PAGE · EVERY BATCH', W - 20 - pw('ONE PAGE · EVERY BATCH', 2), 16, 2, '#8b949e'),
  `<rect x="20" y="36" width="${W - 40}" height="1" fill="#30363d"/>`,
  pix('DISK 1', 20, 44, 2, '#ffd84a'), pix('NPX README-NFO', 20 + pw('DISK 1  ', 2), 44, 2, '#e6edf3'),
  pix('01-10', 576 - pw('01-10', 2), 44, 2, '#8b949e'),
  `<g class="d2"><rect x="20" y="198" width="556" height="1" fill="#30363d"/>${pix('DISK 2', 20, 204, 2, '#ffd84a')}${pix('NPX README-NFO MORE', 20 + pw('DISK 2  ', 2), 204, 2, '#e6edf3')}${pix('11-20', 576 - pw('11-20', 2), 204, 2, '#8b949e')}</g>`,
];

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" shape-rendering="crispEdges" role="img" aria-labelledby="t">
<title id="t">One gallery page: batch 1 fills with headers 01 to 10, header 03 is picked and lands at the top of a README, then batch 2 adds 11 to 20 below.</title>
<style>${css.join('')}
@media (prefers-reduced-motion:reduce){*{animation:none!important}.cur,.slot{display:none}}</style>
<defs>${defs.join('')}</defs>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="14" fill="#0b0e14" stroke="#30363d"/>
${head.join('\n')}
${body.join('\n')}
</svg>
`;
const file = path.join(here, '..', 'assets', 'flow.svg');
fs.writeFileSync(file, svg);
console.log(`flow.svg ${(Buffer.byteLength(svg) / 1024).toFixed(1)} KB`);
