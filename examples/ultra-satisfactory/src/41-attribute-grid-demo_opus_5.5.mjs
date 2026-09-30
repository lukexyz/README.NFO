#!/usr/bin/env node
// 41-attribute-grid-demo_opus_5.5: the "Attribute-Grid Demo Screen" README header
// for ULTRA-SATISFACTORY (catalogue entry demo-08: ZX Spectrum / Pentagon demo
// screens, where the effects live in the colour grid).
//
// The banner is one real 256x192 screen inside a wide border. It obeys the
// machine's rules on purpose, because the rules are the look:
//   * 32x24 attribute cells of 8x8 pixels, one INK and one PAPER per cell,
//     eight colours, and a BRIGHT bit shared by both;
//   * effects are made by changing cell colours in steps, never by blending;
//   * one 20-column "multicolour" band where cells are 8 wide but 2 lines tall;
//   * the border is a single colour per scanline, so it can only do rasters.
//
// What is on the screen:
//   rows  0-9   a chunky two-armed spiral: one phase number per cell, cycled
//               through black, blue, magenta and red over a fixed chequer of
//               pixels, with ULTRA set in whole cells on top of it and
//               SATISFACTORY in double-size glyphs on a black bar
//   row   10    the tagline as a block-highlighted bar (exactly 32 characters)
//   rows 12-13  the three tabs as block-highlighted words, and what each does
//   rows 15-19  a twister in the multicolour band, which is a screw, turned by
//               a machine on the left and filling a crate on the right
//   row   20    the screw's real recipe
//   rows 22-23  a double-height scroller: the text moves in pixels, the colour
//               bands stay locked to the grid
//   border      three raster bars on a slow sine
//
// Everything is drawn from the 8x8 font and the 1-bit pixel art defined in this
// file (no <text>, no fonts, nothing external). Motion is CSS keyframes with
// step timing, so it runs inside GitHub's <img>. Output is deterministic.
//
//   node 41-attribute-grid-demo_opus_5.5.mjs            regenerate the SVG, and refresh
//                                                       the two text blocks in the .md
//   node 41-attribute-grid-demo_opus_5.5.mjs --scroll   print the scroller text,
//                                                       wrapped to 32 columns
//   node 41-attribute-grid-demo_opus_5.5.mjs --map      print the screen as text,
//                                                       one character per cell
//
// Plain Node, no dependencies, and no randomness anywhere: every cell is computed.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, '..', 'assets', '41-attribute-grid-demo_opus_5.5.svg');
const MD = path.join(HERE, '..', '41-attribute-grid-demo_opus_5.5.md');

// ---------------------------------------------------------------- palette
// Eight colours, two intensities. Lower case is normal intensity (#D7 per
// channel, the usual emulator convention), upper case is BRIGHT (#FF).
const COL = {
  k: '#000000', b: '#0000d7', r: '#d70000', m: '#d700d7', g: '#00d700', c: '#00d7d7', y: '#d7d700', w: '#d7d7d7',
  K: '#000000', B: '#0000ff', R: '#ff0000', M: '#ff00ff', G: '#00ff00', C: '#00ffff', Y: '#ffff00', W: '#ffffff',
};
const isBright = (ch) => ch !== 'k' && ch === ch.toUpperCase();
const isBlack = (ch) => ch === 'k' || ch === 'K';

// ---------------------------------------------------------------- geometry
// One unit is one pixel of the 256x192 picture. With its border the frame is
// 352x240: the border is 48 pixels wide at the sides, as it was on the machine,
// and cropped to 24 above and below to keep the README's first screen tight.
// The <img> shows it at exactly 2x (704x480), so every pixel of the 8x8 font
// lands on whole device pixels at 100%, 150% and 200% display scaling. (At
// 2.5x the one-pixel bars of the letters came out 2 and 3 pixels thick by turns.)
const COLS = 32, ROWS = 24;
const FRAME = 4;                      // dark casing around the picture tube
const W = 352, H = 240, SCALE = 2;
const SX = (W - 256) / 2;             // 48: left border, casing included
const SY = (H - 192) / 2;             // 24: top border, casing included

// ---------------------------------------------------------------- 8x8 font
// An original bold face: capitals six pixels tall in rows 1-6, two-pixel stems,
// one-pixel bars, so a row of inverse-video text keeps a margin top and bottom.
const FONT_SRC = `
A
........
..####..
.##..##.
.##..##.
.######.
.##..##.
.##..##.
........
B
........
.#####..
.##..##.
.#####..
.##..##.
.##..##.
.#####..
........
C
........
..####..
.##..##.
.##.....
.##.....
.##..##.
..####..
........
D
........
.####...
.##.##..
.##..##.
.##..##.
.##.##..
.####...
........
E
........
.######.
.##.....
.#####..
.##.....
.##.....
.######.
........
F
........
.######.
.##.....
.#####..
.##.....
.##.....
.##.....
........
G
........
..####..
.##.....
.##.###.
.##..##.
.##..##.
..####..
........
H
........
.##..##.
.##..##.
.######.
.##..##.
.##..##.
.##..##.
........
I
........
.######.
...##...
...##...
...##...
...##...
.######.
........
J
........
...####.
.....##.
.....##.
.....##.
.##..##.
..####..
........
K
........
.##..##.
.##.##..
.####...
.####...
.##.##..
.##..##.
........
L
........
.##.....
.##.....
.##.....
.##.....
.##.....
.######.
........
M
........
.##...##
.###.###
.#######
.##.#.##
.##...##
.##...##
........
N
........
.##..##.
.###.##.
.######.
.##.###.
.##..##.
.##..##.
........
O
........
..####..
.##..##.
.##..##.
.##..##.
.##..##.
..####..
........
P
........
.#####..
.##..##.
.##..##.
.#####..
.##.....
.##.....
........
Q
........
..####..
.##..##.
.##..##.
.##..##.
.##.##..
..##.##.
........
R
........
.#####..
.##..##.
.##..##.
.#####..
.##.##..
.##..##.
........
S
........
..####..
.##..##.
..###...
...###..
.##..##.
..####..
........
T
........
.######.
...##...
...##...
...##...
...##...
...##...
........
U
........
.##..##.
.##..##.
.##..##.
.##..##.
.##..##.
..####..
........
V
........
.##..##.
.##..##.
.##..##.
.##..##.
..####..
...##...
........
W
........
.##...##
.##...##
.##.#.##
.#######
.###.###
.##...##
........
X
........
.##..##.
.##..##.
..####..
..####..
.##..##.
.##..##.
........
Y
........
.##..##.
.##..##.
..####..
...##...
...##...
...##...
........
Z
........
.######.
....##..
...##...
..##....
.##.....
.######.
........
0
........
..####..
.##..##.
.##.###.
.###.##.
.##..##.
..####..
........
1
........
...##...
..###...
...##...
...##...
...##...
.######.
........
2
........
..####..
.##..##.
....##..
...##...
..##....
.######.
........
3
........
.#####..
.....##.
..####..
.....##.
.....##.
.#####..
........
4
........
...###..
..####..
.##.##..
.######.
....##..
....##..
........
5
........
.######.
.##.....
.#####..
.....##.
.##..##.
..####..
........
6
........
..####..
.##.....
.#####..
.##..##.
.##..##.
..####..
........
7
........
.######.
.....##.
....##..
...##...
...##...
...##...
........
8
........
..####..
.##..##.
..####..
.##..##.
.##..##.
..####..
........
9
........
..####..
.##..##.
.##..##.
..#####.
.....##.
..####..
........
.
........
........
........
........
........
..##....
..##....
........
,
........
........
........
........
........
..##....
..##....
.##.....
:
........
........
..##....
..##....
........
..##....
..##....
........
!
........
...##...
...##...
...##...
...##...
........
...##...
........
?
........
..####..
.##..##.
....##..
...##...
........
...##...
........
'
........
...##...
...##...
..##....
........
........
........
........
-
........
........
........
..####..
........
........
........
........
+
........
........
...##...
.######.
...##...
........
........
........
/
........
.....##.
....##..
...##...
...##...
..##....
.##.....
........
(
........
....##..
...##...
..##....
..##....
...##...
....##..
........
)
........
..##....
...##...
....##..
....##..
...##...
..##....
........
*
.######.
.######.
...##...
..###...
...##...
...###..
...##...
...##...
&
........
..###...
.##.##..
..###...
.##.###.
.##..#..
..###.#.
........
>
........
.##.....
..##....
...##...
...##...
..##....
.##.....
........
`;
const FONT = { ' ': Array(8).fill('........') };
{
  const lines = FONT_SRC.split('\n').filter((l) => l.length);
  for (let i = 0; i < lines.length; i += 9) {
    const rows = lines.slice(i + 1, i + 9);
    if (lines[i].length !== 1 || rows.length !== 8 || rows.some((r) => r.length !== 8)) throw new Error(`bad glyph near "${lines[i]}"`);
    FONT[lines[i]] = rows;
  }
}
const glyph = (ch) => {
  if (!FONT[ch]) throw new Error(`no glyph for "${ch}"`);
  return FONT[ch];
};

// ---------------------------------------------------------------- the screen model
// A real 1-bit picture (pix) plus one attribute per 8x8 cell. Static artwork is
// drawn here, so the two-colours-per-cell rule holds by construction; the
// animated parts are separate layers that each own their cells outright.
const pix = Array.from({ length: ROWS * 8 }, () => new Uint8Array(COLS * 8));
const attr = Array.from({ length: ROWS }, () => Array.from({ length: COLS }, () => ({ ink: 'W', paper: 'k' })));
const owned = Array.from({ length: ROWS }, () => new Uint8Array(COLS));   // cells claimed by an animated layer

function setAttr(c, r, ink, paper = 'k') {
  if (!isBlack(ink) && !isBlack(paper) && isBright(ink) !== isBright(paper)) throw new Error(`cell ${c},${r}: INK ${ink} and PAPER ${paper} must share the BRIGHT bit`);
  attr[r][c] = { ink, paper };
}
const plot = (x, y, v = 1) => { if (x >= 0 && x < 256 && y >= 0 && y < 192) pix[y][x] = v; };
// 8x8 text at a character cell. `inks` is one colour, or one colour per character.
function print(c, r, str, inks = 'W', paper = 'k') {
  if (c + str.length > COLS) throw new Error(`"${str}" runs past column 32`);
  [...str].forEach((ch, i) => {
    glyph(ch).forEach((row, y) => [...row].forEach((bit, x) => { if (bit === '#') plot((c + i) * 8 + x, r * 8 + y); }));
    setAttr(c + i, r, inks.length === 1 ? inks : inks[i], paper);
  });
}

// ---------------------------------------------------------------- bitmap -> merged rectangles
// Horizontal runs of set pixels, merged downwards into rectangles, as path data.
function rectPath(test, x0, y0, x1, y1) {
  let open = new Map();
  const done = [];
  for (let y = y0; y <= y1; y++) {
    const next = new Map();
    if (y < y1) {
      for (let x = x0; x < x1;) {
        if (!test(x, y)) { x++; continue; }
        let e = x;
        while (e < x1 && test(e, y)) e++;
        const key = `${x},${e - x}`;
        const prev = open.get(key);
        if (prev) { prev.h++; next.set(key, prev); open.delete(key); } else next.set(key, { x, y, w: e - x, h: 1 });
        x = e;
      }
    }
    for (const r of open.values()) done.push(r);
    open = next;
  }
  done.sort((a, b) => a.y - b.y || a.x - b.x);
  return done.map((r) => `M${r.x} ${r.y}h${r.w}v${r.h}h${-r.w}z`).join('');
}

// ---------------------------------------------------------------- CSS helpers
const css = [];
const num = (v, d = 3) => String(+v.toFixed(d));
// Discrete keyframes: `vals` is one declaration block per equal time slot.
// Consecutive duplicates collapse; step-end timing holds each until the next.
function stepKeys(name, vals) {
  let out = '', prev = null;
  vals.forEach((v, i) => {
    if (v !== prev) { out += `${num(i / vals.length * 100, 4)}%{${v}}`; prev = v; }
  });
  css.push(`@keyframes ${name}{${out}}`);
}

const body = [];      // screen content, in screen coordinates
const defs = [];

// ================================================================ rows 0-9: spiral + logo
const PR = 10;                                     // rows the effect owns
// ULTRA in whole cells: five letters, 5 cells wide and 6 tall, one cell apart.
// The strokes are one cell thick, so every corner is square: a rounded corner
// would be two cells touching at a point, and the letter would fall apart.
const BIG = {
  U: ['#...#', '#...#', '#...#', '#...#', '#...#', '#####'],
  L: ['#....', '#....', '#....', '#....', '#....', '#####'],
  T: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..'],
  R: ['#####', '#...#', '#####', '#.#..', '#..#.', '#...#'],
  A: ['#####', '#...#', '#...#', '#####', '#...#', '#...#'],
};
const kind = Array.from({ length: PR }, () => Array(COLS).fill('fx'));
const tiles = [];
[...'ULTRA'].forEach((ch, i) => BIG[ch].forEach((row, y) => [...row].forEach((bit, x) => {
  if (bit === '#') { kind[1 + y][1 + i * 6 + x] = 'tile'; tiles.push([1 + i * 6 + x, 1 + y]); }
})));
const BAR = { c0: 3, c1: 28, r0: 8, r1: 9 };       // the black bar SATISFACTORY sits on
for (let r = BAR.r0; r <= BAR.r1; r++) for (let c = BAR.c0; c <= BAR.c1; c++) kind[r][c] = 'bar';
for (let r = 0; r < PR; r++) for (let c = 0; c < COLS; c++) owned[r][c] = 1;

// The effect behind the logo is a chunky spiral, written as one static phase
// field and one ramp. A cell at half-step h shows PAPER ramp[h/2] and INK
// ramp[(h+1)/2] through a fixed chequer of pixels, so every other step is a
// 50/50 dither of two neighbouring colours; then the whole table is cycled,
// which turns the spiral. Nothing but the colour cells is ever written.
// (Two arms and a gentle twist keep each band three or four cells wide. With
// more of either the bands shrink to a cell and the spiral turns into noise.)
const RAMP = [...'kbmr'], HALF = RAMP.length * 2, P_DT = 0.35;
const SPIRAL = { cx: 15.5, cy: 4.5, arms: 2, twist: 0.25, squash: 1.3, start: 4 };   // start: which step of the turn frame 0 shows
const field = (x, y) => {
  const dx = x - SPIRAL.cx, dy = (y - SPIRAL.cy) * SPIRAL.squash;
  return SPIRAL.start + HALF * (SPIRAL.arms * Math.atan2(dy, dx) / (2 * Math.PI) + SPIRAL.twist * Math.log(Math.hypot(dx, dy)));
};
const halfStep = (x, y) => ((Math.floor(field(x, y)) % HALF) + HALF) % HALF;
const paperAt = (h) => RAMP[(h >> 1) % RAMP.length], inkAt = (h) => RAMP[((h + 1) >> 1) % RAMP.length];
stepKeys('pp', Array.from({ length: HALF }, (_, j) => `fill:${COL[paperAt(j)]}`));
stepKeys('pi', Array.from({ length: HALF }, (_, j) => `fill:${COL[inkAt(j)]}`));
css.push(`.p{animation:pp ${num(HALF * P_DT)}s step-end infinite}.i{animation:pi ${num(HALF * P_DT)}s step-end infinite}`);
for (let h = 0; h < HALF; h++) css.push(`.p${h}{fill:${COL[paperAt(h)]};animation-delay:${num(-h * P_DT)}s}.i${h}{fill:${COL[inkAt(h)]};animation-delay:${num(-h * P_DT)}s}`);

{
  // All the cells on one half-step change together, so each half-step is a
  // single shape: drawn once as PAPER, and once more as INK through the chequer.
  let paper = '', ink = '';
  for (let h = 0; h < HALF; h++) {
    const d = rectPath((x, y) => kind[y >> 3][x >> 3] === 'fx' && halfStep(x >> 3, y >> 3) === h, 0, 0, 256, PR * 8);
    if (!d) continue;
    defs.push(`<path id="h${h}" d="${d}"/>`);
    paper += `<use href="#h${h}" class="p p${h}"/>`;
    ink += `<use href="#h${h}" class="i i${h}"/>`;
  }
  defs.push('<pattern id="q" width="2" height="2" patternUnits="userSpaceOnUse"><path d="M0 0h1v1h-1zM1 1h1v1h-1z" fill="#fff"/></pattern>');
  defs.push(`<mask id="qm" maskUnits="userSpaceOnUse" x="0" y="0" width="256" height="${PR * 8}"><rect width="256" height="${PR * 8}" fill="url(#q)"/></mask>`);
  body.push(`<g>${paper}</g>`);
  body.push(`<g mask="url(#qm)">${ink}</g>`);
}

// The glint: a slanted band of light, GLINT_W cells wide, that crosses the whole
// logo one cell at a time every GLINT_T seconds. It is one shape stepping
// sideways behind a clip, so the cells it lights are whole cells, in step.
const GLINT_T = 6, GLINT_DT = 0.05, GLINT_W = 4, GLINT_LEAD = 1.5;   // first pass 1.5 s in, so frame 0 is clean
const glintBand = (r0, r1) => {
  let d = '';
  for (let r = r0; r <= r1; r++) d += `M${(-r - GLINT_W + 1) * 8} ${r * 8}h${GLINT_W * 8}v8h${-GLINT_W * 8}z`;
  return d;
};
{
  const n = Math.round(GLINT_T / GLINT_DT), from = (2 - Math.round(GLINT_LEAD / GLINT_DT)) * 8;
  css.push(`@keyframes gl{from{transform:translateX(${from}px)}to{transform:translateX(${from + n * 8}px)}}.gl{transform:translateX(${from}px);animation:gl ${GLINT_T}s steps(${n}) infinite}`);
}
{
  // ULTRA: whole cells of bright cyan PAPER, straight on top of the spiral.
  const cells = tiles.map(([x, y]) => `M${x * 8} ${y * 8}h8v8h-8z`).join('');
  defs.push(`<clipPath id="uc"><path d="${cells}"/></clipPath>`);
  // a one-pixel highlight on the top and left edges: INK white on PAPER cyan, both BRIGHT
  const has = (x, y) => kind[y]?.[x] === 'tile';
  const hi = tiles.map(([x, y]) => (has(x, y - 1) ? '' : `M${x * 8} ${y * 8}h8v1h-8z`) + (has(x - 1, y) ? '' : `M${x * 8} ${y * 8}h1v8h-1z`)).join('');
  body.push(`<path fill="${COL.C}" d="${cells}"/><g clip-path="url(#uc)" fill="${COL.W}"><path class="gl" d="${glintBand(1, 6)}"/></g><path fill="${COL.W}" d="${hi}"/>`);
}

// SATISFACTORY: the 8x8 glyphs doubled with a corner-rounding pass, so each
// letter is 2x2 cells. INK is bright white; the glint turns a cell cyan.
function double(rows) {
  const at = (x, y) => (y >= 0 && y < 8 && x >= 0 && x < 8 && rows[y][x] === '#');
  const out = Array.from({ length: 16 }, () => Array(16).fill(false));
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
    const P = at(x, y), A = at(x, y - 1), B = at(x + 1, y), C = at(x - 1, y), D = at(x, y + 1);
    out[y * 2][x * 2] = (C === A && C !== D && A !== B) ? A : P;
    out[y * 2][x * 2 + 1] = (A === B && A !== C && B !== D) ? B : P;
    out[y * 2 + 1][x * 2] = (D === C && D !== B && C !== A) ? C : P;
    out[y * 2 + 1][x * 2 + 1] = (B === D && B !== A && D !== C) ? D : P;
  }
  return out;
}
{
  const word = 'SATISFACTORY', c0 = 4, r0 = BAR.r0;
  const bmp = Array.from({ length: 16 }, () => new Uint8Array(256));
  [...word].forEach((ch, i) => double(glyph(ch)).forEach((row, y) => row.forEach((on, x) => { if (on) bmp[y][(c0 + i * 2) * 8 + x] = 1; })));
  const d = rectPath((x, y) => bmp[y - r0 * 8]?.[x] === 1, 0, r0 * 8, 256, r0 * 8 + 16);
  defs.push(`<mask id="wm" maskUnits="userSpaceOnUse" x="0" y="${r0 * 8}" width="256" height="16"><path fill="#fff" d="${d}"/></mask>`);
  body.push(`<rect x="${BAR.c0 * 8}" y="${BAR.r0 * 8}" width="${(BAR.c1 - BAR.c0 + 1) * 8}" height="16"/>`);
  body.push(`<g mask="url(#wm)"><rect x="${c0 * 8}" y="${r0 * 8}" width="${word.length * 16}" height="16" fill="${COL.W}"/><path class="gl" fill="${COL.C}" d="${glintBand(r0, r0 + 1)}"/></g>`);
}

// ================================================================ row 10: tagline, block-highlighted
print(0, 10, 'A COMPANION APP FOR SATISFACTORY', 'k', 'Y');

// ================================================================ rows 12-13: the three tabs
// The active tab is PAPER in its bright colour; the others are INK on black.
const TAB_T = 12, TAB_ROW = 12;
const TABS = [
  { label: ' OBJECTIVES ', col: 0, hue: 'm', on: 'W', info: '5 SPACE ELEVATOR SHOPPING LISTS' },
  { label: ' ITEMS ', col: 13, hue: 'r', on: 'W', info: '140 ITEMS, 211 RECIPES, 1 SEARCH' },
  { label: ' BUILDINGS ', col: 21, hue: 'c', on: 'k', info: '477 BUILDINGS AND WHAT THEY MAKE' },
];
const textPath = (c, r, str, pick = () => true) => {
  const bmp = Array.from({ length: 8 }, () => new Uint8Array(str.length * 8));
  [...str].forEach((ch, i) => { if (pick(ch, i)) glyph(ch).forEach((row, y) => [...row].forEach((bit, x) => { if (bit === '#') bmp[y][i * 8 + x] = 1; })); });
  return rectPath((x, y) => bmp[y - r * 8][x - c * 8] === 1, c * 8, r * 8, (c + str.length) * 8, r * 8 + 8);
};
TABS.forEach((t, k) => {
  const hi = t.hue.toUpperCase(), delay = num(k * TAB_T / 3 - TAB_T);
  const third = (a, b) => `0%{${a}}33.333%{${b}}`;
  css.push(`@keyframes tp${k}{${third(`fill:${COL[hi]}`, `fill:${COL.k}`)}}@keyframes ti${k}{${third(`fill:${COL[t.on]}`, `fill:${COL[t.hue]}`)}}@keyframes tn${k}{${third('visibility:visible', 'visibility:hidden')}}`);
  css.push(`.tp${k}{fill:${k === 0 ? COL[hi] : COL.k};animation:tp${k} ${TAB_T}s step-end ${delay}s infinite}`
    + `.ti${k}{fill:${k === 0 ? COL[t.on] : COL[t.hue]};animation:ti${k} ${TAB_T}s step-end ${delay}s infinite}`
    + `.tn${k}{fill:${COL[hi]};visibility:${k === 0 ? 'visible' : 'hidden'};animation:tn${k} ${TAB_T}s step-end ${delay}s infinite}`);
  body.push(`<rect class="tp${k}" x="${t.col * 8}" y="${TAB_ROW * 8}" width="${t.label.length * 8}" height="8"/>`);
  body.push(`<path class="ti${k}" d="${textPath(t.col, TAB_ROW, t.label)}"/>`);
  if (t.info.length > COLS) throw new Error(`info line too long: ${t.info}`);
  // the info line: numerals in bright white, the rest in the tab's colour (one INK per cell either way)
  const ic = Math.floor((COLS - t.info.length) / 2), digit = (ch) => /[0-9]/.test(ch);
  body.push(`<g class="tn${k}"><path d="${textPath(ic, TAB_ROW + 1, t.info, (ch) => !digit(ch))}"/><path fill="${COL.W}" d="${textPath(ic, TAB_ROW + 1, t.info, digit)}"/></g>`);
  for (let c = 0; c < t.label.length; c++) owned[TAB_ROW][t.col + c] = 1;
});
for (let c = 0; c < COLS; c++) owned[TAB_ROW + 1][c] = 1;

// ================================================================ rows 15-19: the screw
// A twister in the multicolour band: columns 6-25, cells 8 pixels wide and 2
// lines tall. Each column is the same turning square bar, started a little
// later than its neighbour, so one animation drives the whole thing.
const TW = { c0: 6, r0: 15, rows: 5, NF: 48, DT: 0.1 };
const TW_CY = TW.r0 * 8 + TW.rows * 4;             // axis, in screen pixels
const TW_Q = (v) => 2 * Math.round(v / 2);         // snap to the 2-line multicolour grid
const TW_COLS = Array.from({ length: 20 }, (_, n) => {
  const head = n < 2;
  return {
    col: TW.c0 + n,
    R: head ? 18 : n >= 17 ? [12, 8, 4][n - 17] : 16,
    phase: head ? 0 : Math.round((n - 2) * 4.5 + 4 * Math.sin((n - 2) * 0.5)),
    hues: head ? 'yr' : 'wc',
  };
});
// One face of the bar at frame f: where its top edge is, how tall it shows, and
// how squarely it faces the viewer (0 tall = turned away).
const twFace = (R, f) => {
  const th = 2 * Math.PI * (f + 0.5) / TW.NF;
  const y0 = TW_Q(R * Math.sin(th)), y1 = TW_Q(R * Math.sin(th + Math.PI / 2));
  return { y: TW_CY + y0, h: Math.max(0, y1 - y0), lit: Math.cos(th + Math.PI / 4) > 0.72 };
};
{
  // Every kind of column (a radius and a pair of face colours) gets a film strip
  // of all TW.NF frames, stacked downwards. A column shows one frame of its
  // strip through the band's window, and the strip steps up one frame every
  // TW.DT seconds. A face square on to the viewer takes the BRIGHT colour of
  // its pair. (Stacking downwards keeps the only clipped edges top and bottom,
  // against black, so neighbouring columns can never show a seam.)
  const bandH = TW.rows * 8, strips = new Set();
  let out = '';
  for (const t of TW_COLS) {
    const id = `tw${t.R}${t.hues}`;
    if (!strips.has(id)) {
      strips.add(id);
      const film = Array.from({ length: TW.NF * bandH }, () => Array(8).fill(''));
      for (let f = 0; f < TW.NF; f++) for (let i = 0; i < 4; i++) {
        const k = twFace(t.R, (f + i * TW.NF / 4) % TW.NF), hue = t.hues[i % 2];
        for (let y = k.y; y < k.y + k.h; y++) film[f * bandH + y - TW.r0 * 8].fill(k.lit ? hue.toUpperCase() : hue);
      }
      let paths = '';
      for (const ch of new Set(film.flat())) if (ch) paths += `<path fill="${COL[ch]}" d="${rectPath((x, y) => film[y][x] === ch, 0, 0, 8, TW.NF * bandH)}"/>`;
      defs.push(`<g id="${id}">${paths}</g>`);
    }
    const f0 = t.phase % TW.NF;
    out += `<use href="#${id}" x="${t.col * 8}" y="${TW.r0 * 8}" class="tw" style="animation-delay:${num(-f0 * TW.DT)}s;transform:translateY(${-f0 * bandH}px)"/>`;
  }
  css.push(`@keyframes tw{from{transform:translateY(0)}to{transform:translateY(${-TW.NF * bandH}px)}}.tw{animation:tw ${num(TW.NF * TW.DT)}s steps(${TW.NF}) infinite}`);
  defs.push(`<clipPath id="twc"><rect x="${TW.c0 * 8}" y="${TW.r0 * 8}" width="${TW_COLS.length * 8}" height="${bandH}"/></clipPath>`);
  body.push(`<g clip-path="url(#twc)">${out}</g>`);
  for (let r = TW.r0; r < TW.r0 + TW.rows; r++) for (let c = TW.c0; c < TW.c0 + 20; c++) owned[r][c] = 1;
}

// ---- 1-bit pixel art helpers (all coordinates are screen pixels)
const box = (x, y, w, h, v = 1) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) plot(x + i, y + j, v); };
const frame = (x, y, w, h, t = 1) => { box(x, y, w, t); box(x, y + h - t, w, t); box(x, y, t, h); box(x + w - t, y, t, h); };
const disc = (cx, cy, r, v = 1) => { for (let y = Math.floor(cy - r); y <= cy + r; y++) for (let x = Math.floor(cx - r); x <= cx + r; x++) if ((x + 0.5 - cx) ** 2 + (y + 0.5 - cy) ** 2 <= r * r) plot(x, y, v); };
const poly = (pts, v = 1) => {
  const ys = pts.map((p) => p[1]);
  for (let y = Math.floor(Math.min(...ys)); y <= Math.max(...ys); y++) {
    for (let x = 0; x < 256; x++) {
      let inside = false;
      for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
        const [xi, yi] = pts[i], [xj, yj] = pts[j];
        if ((yi > y + 0.5) !== (yj > y + 0.5) && x + 0.5 < (xj - xi) * (y + 0.5 - yi) / (yj - yi) + xi) inside = !inside;
      }
      if (inside) plot(x, y, v);
    }
  }
};
const hexPts = (cx, cy, r) => Array.from({ length: 6 }, (_, i) => [cx + r * Math.sin(i * Math.PI / 3), cy - r * Math.cos(i * Math.PI / 3)]);
const paint = (c0, r0, c1, r1, ink, paper = 'k') => { for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) setAttr(c, r, ink, paper); };

// ---- the machine that turns it (columns 0-5): original art, a box with the
// app's hexagon-and-cog emblem on the front and a chuck gripping the screw head.
{
  const ox = 0, oy = TW.r0 * 8;
  frame(ox + 1, oy + 6, 39, 28, 2);                           // casing
  box(ox + 5, oy + 2, 7, 4); box(ox + 4, oy + 1, 9, 1);        // stack
  box(ox + 19, oy + 3, 2, 3); box(ox + 18, oy + 1, 4, 2);      // aerial and lamp
  box(ox + 26, oy + 4, 10, 2);                                 // vent
  for (let i = 0; i < 5; i++) plot(ox + 27 + i * 2, oy + 3);   // vent teeth
  // emblem: hexagon outline, cog inside
  const cx = ox + 20, cy = oy + 20;
  poly(hexPts(cx, cy, 11.5)); poly(hexPts(cx, cy, 9.5), 0);
  disc(cx, cy, 5.2);
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; box(Math.round(cx + 6.4 * Math.cos(a) - 1), Math.round(cy + 6.4 * Math.sin(a) - 1), 2, 2); }
  disc(cx, cy, 2.1, 0);
  // rivets
  for (const [x, y] of [[4, 9], [36, 9], [4, 30], [36, 30]]) plot(ox + x, oy + y);
  // chuck, gripping the head
  box(ox + 41, oy + 8, 7, 24);
  for (let y = 10; y < 31; y += 3) box(ox + 43, oy + y, 5, 1, 0);
  // plinth with hazard stripes
  box(ox, oy + 35, 48, 1);
  for (let y = 37; y < 40; y++) for (let x = 0; x < 48; x++) if (((x + y) >> 2) % 2 === 0) plot(ox + x, oy + y);
  paint(0, TW.r0, 5, TW.r0 + 4, 'Y');
  paint(1, TW.r0 + 1, 3, TW.r0 + 3, 'C');
  paint(5, TW.r0 + 1, 5, TW.r0 + 3, 'W');
  // The emblem's nine cells are lifted out of the static picture so their INK
  // can beat white once for every face of the screw that comes round.
  const d = rectPath((x, y) => pix[y][x] === 1, 8, (TW.r0 + 1) * 8, 32, (TW.r0 + 4) * 8);
  for (let r = TW.r0 + 1; r <= TW.r0 + 3; r++) for (let c = 1; c <= 3; c++) { owned[r][c] = 1; for (let y = r * 8; y < r * 8 + 8; y++) pix[y].fill(0, c * 8, c * 8 + 8); }
  const beat = TW.NF * TW.DT / 4;
  css.push(`@keyframes em{0%{fill:${COL.C}}80%{fill:${COL.W}}}.em{fill:${COL.C};animation:em ${num(beat)}s step-end infinite}`);
  body.push(`<path class="em" d="${d}"/>`);
}

// ---- the crate it fills (columns 26-31): a storage box, heaped.
{
  const ox = 26 * 8, oy = TW.r0 * 8;
  // the heap: screws standing in it and lying on it, because it has been full for hours
  const UP = ['#####', '#####', '.###.', '..#..', '.##..', '..#..', '..##.', '..#..', '..#..', '..#..'];
  const put = (rows, x, y) => rows.forEach((row, j) => [...row].forEach((bit, i) => { if (bit === '#' && y + j < 16) plot(ox + x + i, oy + y + j); }));
  const flat = (rows, flip) => Array.from({ length: rows[0].length }, (_, i) => rows.map((row) => row[i]).join('')).map((row) => (flip ? [...row].reverse().join('') : row));
  [[2, 9], [9, 6], [16, 8], [30, 7], [37, 5], [42, 10]].forEach(([x, y]) => put(UP, x, y));
  put(flat(UP, false), 19, 1);
  put(flat(UP, true), 23, 9);
  // crate: rim, label band, slatted base
  box(ox + 1, oy + 16, 46, 2);
  box(ox + 3, oy + 19, 42, 1);
  for (let x = 4; x < 44; x += 5) box(ox + x, oy + 20, 1, 4);
  box(ox + 2, oy + 18, 2, 6); box(ox + 44, oy + 18, 2, 6);
  box(ox + 2, oy + 32, 2, 6); box(ox + 44, oy + 32, 2, 6);
  for (let x = 4; x < 44; x += 5) box(ox + x, oy + 32, 1, 4);
  box(ox + 3, oy + 36, 42, 1);
  box(ox + 1, oy + 37, 46, 2);
  box(ox + 4, oy + 39, 6, 1); box(ox + 38, oy + 39, 6, 1);
  paint(26, TW.r0, 31, TW.r0 + 1, 'W');
  paint(26, TW.r0 + 2, 31, TW.r0 + 4, 'y');
  print(26, TW.r0 + 3, 'SCREWS', 'k', 'y');
}

// ================================================================ row 20: the recipe
//                 0         1         2         3
//                 01234567890123456789012345678901
print(0, 20, 'SCREW 40/MIN  CONSTRUCTOR 6S 4MW',
  'WWWWWWYYYYYYWWCCCCCCCCCCCCWWWWWW');

// ================================================================ rows 22-23: the scroller
const SCROLL = [
  'ULTRA-SATISFACTORY',
  'A COMPANION APP FOR THE FACTORY GAME SATISFACTORY',
  'EVERY RECIPE, BUILDING AND SPACE ELEVATOR OBJECTIVE, ONE CLICK APART',
  '140 ITEMS, 211 RECIPES (88 OF THEM ALTERNATES), 477 BUILDINGS, 5 PHASES',
  'UNOFFICIAL FAN PROJECT, NOT AFFILIATED WITH COFFEE STAIN STUDIOS',
  'THIS TEXT RUNS RIGHT TO LEFT. SO DOES THE BELT YOU BUILT BACKWARDS',
  'THIS SCREEN HAS 768 COLOUR CELLS, SO EVERY BUILDING COULD HAVE ITS OWN AND LEAVE 291 SPARE FOR SCREWS',
  'TWO COLOURS PER CELL IS OUR VERSION OF ONE ITEM PER BELT: PUT SCREWS AND WIRE ON THE SAME BELT AND THAT IS COLOUR CLASH TOO',
  'THE SCREW ABOVE IS NOT TO SCALE. NEITHER IS YOUR STORAGE BOX',
  'THE GAME DATA IS 1.5 MEGABYTES: THIRTY-TWO 48K MACHINES JUST TO HOLD IT, SO IT RUNS IN A BROWSER TAB INSTEAD. NO TAPE, NO AZIMUTH SCREWDRIVER',
  'CELL BLOCK 768 SENDS GREETINGS TO THE MANIFOLD PEOPLE, THE LOAD BALANCER PEOPLE, AND THE FUSE THAT WAITED UNTIL YOU WERE FAR AWAY',
  'THE BORDER EFFECT WAS TEMPORARY. IT IS NOW LOAD-BEARING',
  'THE CODE IS APACHE 2.0',
  'TEXT RESTARTS, LIKE YOUR FACTORY AFTER THE FUSE',
];
const SCROLL_TEXT = `  ${SCROLL.join('  *  ')}  *   `;   // the * glyph is a screw
// The same text for reading rather than chasing: wrapped to the screen's 32 columns.
function scrollText() {
  const lines = [];
  let line = '';
  for (const w of SCROLL.join(' * ').split(' ')) {
    if (`${line} ${w}`.trim().length > COLS) { lines.push(line); line = w; } else line = `${line} ${w}`.trim();
  }
  lines.push(line);
  return lines.join('\n');
}
{
  const r0 = 22, PX_PER_S = 60, STEP = 2;
  const used = new Set(SCROLL_TEXT);
  used.delete(' ');
  const gid = (ch) => `g${ch.codePointAt(0).toString(36)}`;
  for (const ch of used) {
    const rows = glyph(ch);
    defs.push(`<path id="${gid(ch)}" d="${rectPath((x, y) => rows[y >> 1][x] === '#', 0, 0, 8, 16)}"/>`);
  }
  const loop = SCROLL_TEXT + SCROLL_TEXT.slice(0, COLS + 1);
  // glyphs go in groups of 16 so that the renderer can skip the ones off screen
  let uses = '';
  for (let i = 0; i < loop.length; i += 16) {
    let chunk = '';
    [...loop.slice(i, i + 16)].forEach((ch, j) => { if (ch !== ' ') chunk += `<use href="#${gid(ch)}" x="${(i + j) * 8}"/>`; });
    if (chunk) uses += `<g>${chunk}</g>`;
  }
  const L = SCROLL_TEXT.length * 8;
  css.push(`@keyframes sc{to{transform:translateX(${-L}px)}}.sc{animation:sc ${num(L / PX_PER_S)}s steps(${L / STEP}) infinite}`);
  defs.push(`<mask id="sm" maskUnits="userSpaceOnUse" x="0" y="${r0 * 8}" width="256" height="16"><g transform="translate(0 ${r0 * 8})" fill="#fff"><g class="sc">${uses}</g></g></mask>`);
  // colour bands, locked to the grid: bright on the top row, normal underneath
  const widths = [3, 3, 3, 3, 3, 2, 3, 3, 3, 3, 3], hues = [...'mrygcwcgyrm'];
  let c = 0, bands = '';
  widths.forEach((w, i) => {
    bands += `<rect x="${c * 8}" y="${r0 * 8}" width="${w * 8}" height="8" fill="${COL[hues[i].toUpperCase()]}"/><rect x="${c * 8}" y="${r0 * 8 + 8}" width="${w * 8}" height="8" fill="${COL[hues[i]]}"/>`;
    c += w;
  });
  if (c !== COLS) throw new Error('scroller bands must cover 32 columns');
  body.push(`<g mask="url(#sm)">${bands}</g>`);
  for (let r = r0; r < r0 + 2; r++) for (let cc = 0; cc < COLS; cc++) owned[r][cc] = 1;
}

// ================================================================ the screen as text
// One character per colour cell, as the screen stands on frame 0, with notes.
function mapText() {
  const g = Array.from({ length: ROWS }, () => Array(COLS).fill(' '));
  const put = (c, r, str) => [...str].forEach((ch, i) => { g[r][c + i] = ch; });
  for (let r = 0; r < PR; r++) for (let c = 0; c < COLS; c++) g[r][c] = kind[r][c] === 'tile' ? '█' : kind[r][c] === 'fx' ? { k: ' ', b: '·', m: ':', r: '░' }[paperAt(halfStep(c, r))] : ' ';
  [...'SATISFACTORY'].forEach((ch, i) => { g[8][4 + i * 2] = ch; });
  put(0, 10, 'A COMPANION APP FOR SATISFACTORY');
  TABS.forEach((t) => put(t.col, TAB_ROW, t.label));
  put(Math.floor((COLS - TABS[0].info.length) / 2), TAB_ROW + 1, TABS[0].info);
  ['┌─╥──┐', '│┌──┐├', '││<>│╞', '│└──┘├', '╧════╧'].forEach((row, k) => put(0, TW.r0 + k, row));
  [' ╤ ╤╤ ', '╤╤╤╤╤╤', '╔════╗', 'SCREWS', '╚════╝'].forEach((row, k) => put(26, TW.r0 + k, row));
  for (const t of TW_COLS) for (let k = 0; k < TW.rows; k++) {
    const y = (TW.r0 + k) * 8 + 4;
    for (let i = 0; i < 4; i++) {
      const f = twFace(t.R, (t.phase + i * TW.NF / 4) % TW.NF);
      if (f.h && y >= f.y && y < f.y + f.h) g[TW.r0 + k][t.col] = { w: '▓█', c: '░▒', y: '▓█', r: '░▒' }[t.hues[i % 2]][+f.lit];
    }
  }
  put(0, 20, 'SCREW 40/MIN  CONSTRUCTOR 6S 4MW');
  put(0, 22, SCROLL_TEXT.slice(0, COLS));
  const notes = {
    0: 'ROWS 0-9: THE SPIRAL',
    1: 'one phase number per cell and one ramp:',
    2: 'black, blue, magenta, red (here: space,',
    3: 'dot, colon, shade). every other step is',
    4: 'a 50/50 chequer. cycle it and it turns.',
    5: `ULTRA is ${tiles.length} whole cells of BRIGHT cyan,`,
    6: 'edged in one pixel of BRIGHT white INK.',
    8: 'SATISFACTORY: four cells to the letter.',
    10: 'ROW 10: exactly 32 characters. counted.',
    12: 'ROWS 12-13: THE TABS. the live one gets',
    13: 'PAPER, the others INK. they take turns.',
    15: 'ROWS 15-19: THE SCREW. a twister in the',
    16: '20-column multicolour band, where cells',
    17: 'are 8 pixels wide and 2 lines tall. one',
    18: 'turning bar, staggered along its length.',
    19: 'the machine and the crate are 1-bit art.',
    20: 'ROW 20: its real recipe, as Items has it',
    22: 'ROWS 22-23: THE SCROLLER. text moves in',
    23: 'pixels, colours stay put in their cells.',
  };
  const lines = [`     ${'0123456789'.repeat(4).slice(0, COLS)}`, `    ┌${'─'.repeat(COLS)}┐  BORDER: three raster bars on a slow sine`];
  g.forEach((row, r) => lines.push(`${String(r).padStart(3)} │${row.join('')}│  ${notes[r] || ''}`.trimEnd()));
  lines.push(`    └${'─'.repeat(COLS)}┘  BORDER again: one colour per scanline.`);
  for (const l of lines) if (l.length > 80) throw new Error(`map line over 80 columns: ${l}`);
  return lines.join('\n');
}

// ================================================================ static picture -> SVG
// PAPER rectangles first, then one merged path of INK pixels per colour.
const staticLayer = [];
{
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    if (!owned[r][c]) continue;
    for (let y = r * 8; y < r * 8 + 8; y++) for (let x = c * 8; x < c * 8 + 8; x++) if (pix[y][x]) throw new Error(`static pixels inside animated cell ${c},${r}`);
  }
  const papers = new Set(), inks = new Set();
  for (const row of attr) for (const a of row) { papers.add(a.paper); inks.add(a.ink); }
  for (const p of papers) {
    if (isBlack(p)) continue;
    const d = rectPath((x, y) => attr[y >> 3][x >> 3].paper === p, 0, 0, 256, 192);
    if (d) staticLayer.push(`<path fill="${COL[p]}" d="${d}"/>`);
  }
  for (const k of inks) {
    const d = rectPath((x, y) => pix[y][x] === 1 && attr[y >> 3][x >> 3].ink === k, 0, 0, 256, 192);
    if (d) staticLayer.push(`<path fill="${COL[k]}" d="${d}"/>`);
  }
}

// ================================================================ border rasters
// The border can only be one colour per scanline, so the effect is bars: three
// of them, each a ramp through a normal/bright pair, riding the same slow sine.
let border = '';
{
  const BAR_T = 9, FPS = 30, n = BAR_T * FPS;
  const top = FRAME, bot = H - FRAME, barH = 18;
  const mid = (top + bot - barH) / 2, amp = (bot - top - barH) / 2 - 6;
  stepKeys('bb', Array.from({ length: n }, (_, j) => `transform:translateY(${Math.round(mid + amp * Math.sin(2 * Math.PI * j / n))}px)`));
  css.push(`.bb{animation:bb ${BAR_T}s step-end infinite}`);
  const bars = [
    [...'bBcCWCcBb'],
    [...'mMrRYRrMm'],
    [...'rRyYWYyRr'],
  ];
  bars.forEach((ramp, k) => {
    const rects = ramp.map((ch, i) => `<rect y="${i * 2}" width="${W}" height="2" fill="${COL[ch]}"/>`).join('');
    const delay = -Math.round(k * n / 3) / FPS;
    border += `<g class="bb" style="animation-delay:${num(delay)}s;transform:translateY(${Math.round(mid + amp * Math.sin(2 * Math.PI * k / 3))}px)">${rects}</g>`;
  });
}

// ================================================================ assemble
css.push('@media (prefers-reduced-motion:reduce){*{animation-play-state:paused!important}}');

const title = 'ULTRA-SATISFACTORY: an 8-bit demo screen drawn in the attribute grid';
const desc = 'An 8-bit home computer demo screen: 32 by 24 colour cells, two colours per cell, inside a black border with three raster bars drifting through it. '
  + 'A chunky two-armed spiral of black, blue, magenta and red cells turns behind ULTRA, built from whole bright-cyan cells, above SATISFACTORY in white '
  + 'and a yellow bar reading: a companion app for Satisfactory. Three block-highlighted tabs take turns lighting up: OBJECTIVES (5 Space Elevator shopping lists), '
  + 'ITEMS (140 items, 211 recipes, 1 search) and BUILDINGS (477 buildings and what they make). '
  + 'Below them a twister effect turns out to be one giant rotating screw, driven by a machine with a hexagon-and-cog emblem and emptying into a crate labelled SCREWS, '
  + 'captioned with the real recipe: Screw 40 per minute, Constructor, 6 seconds, 4 MW. A rainbow-banded scroller runs along the bottom; its colours stay locked to the cells while the text moves. '
  + 'Unofficial fan project.';
const escXml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W * SCALE}" height="${H * SCALE}" shape-rendering="crispEdges" role="img" aria-labelledby="ttl dsc">
<title id="ttl">${escXml(title)}</title>
<desc id="dsc">${escXml(desc)}</desc>
<style>
${css.join('\n')}
</style>
<defs>
<clipPath id="bc"><rect x="${FRAME}" y="${FRAME}" width="${W - FRAME * 2}" height="${H - FRAME * 2}" rx="3"/></clipPath>
<clipPath id="scr"><rect width="256" height="192"/></clipPath>
${defs.join('\n')}
</defs>
<rect width="${W}" height="${H}" rx="7" fill="#24242b"/>
<rect x="${FRAME}" y="${FRAME}" width="${W - FRAME * 2}" height="${H - FRAME * 2}" rx="3"/>
<g clip-path="url(#bc)">${border}</g>
<g transform="translate(${SX} ${SY})" clip-path="url(#scr)">
<rect width="256" height="192"/>
${staticLayer.join('\n')}
${body.join('\n')}
</g>
</svg>
`;
if (process.argv.includes('--map')) { console.log(mapText()); process.exit(0); }
if (process.argv.includes('--scroll')) { console.log(scrollText()); process.exit(0); }

fs.writeFileSync(OUT, svg);
console.log(`wrote ${path.relative(process.cwd(), OUT)}: ${(svg.length / 1024).toFixed(1)} KB, scroller ${SCROLL_TEXT.length} chars`);

// The header's two text blocks are printouts of this file, so keep them in step:
// the first fenced text block after each heading is replaced, nothing else is touched.
if (fs.existsSync(MD)) {
  const before = fs.readFileSync(MD, 'utf8');
  let md = before;
  for (const [heading, text] of [['THE ATTRIBUTE MAP', mapText()], ['THE SCROLLTEXT', scrollText()]]) {
    const at = md.indexOf(heading), open = at < 0 ? -1 : md.indexOf('```text\n', at), close = open < 0 ? -1 : md.indexOf('\n```', open + 8);
    if (close < 0) { console.log(`(no "${heading}" block found in the header markdown: left alone)`); continue; }
    md = md.slice(0, open + 8) + text + md.slice(close);
  }
  if (md !== before) { fs.writeFileSync(MD, md); console.log(`updated the text blocks in ${path.relative(process.cwd(), MD)}`); }
}
