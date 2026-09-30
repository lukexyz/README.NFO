#!/usr/bin/env node
// ULTRA-SATISFACTORY as a DOS game's SETUP.EXE: the text-mode program that asked which sound
// card you owned, then its port, IRQ and DMA. Here you pick a production machine instead.
// (Style reference: early-90s MS-DOS setup utilities. No real card, game or vendor is named.)
//
// Regenerate:  node examples/ultra-satisfactory/src/34-dos-setup_opus_5.5.mjs
//
// Plain Node, no dependencies, fully deterministic (no clock, no randomness). The screen is a
// real 80 x 25 text mode of 8 x 16 cells in the 16 VGA text colours. Every character is a
// <use> of a glyph path from the bitmap font below (never <text>), so it looks the same for
// every viewer. Animation is CSS only and every change is a hard step, like a text screen
// being rewritten: windows pop, the highlight bar jumps a row at a time.
//
// The resting state of the file (what you see with animation off, or under
// prefers-reduced-motion) is the finished "Settings Saved" frame, so nothing is lost.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '34-dos-setup_opus_5.5';
const OUT = path.join(HERE, '..', 'assets', `${SLUG}.svg`);

// ---------------------------------------------------------------------------------------------
// Screen geometry
// ---------------------------------------------------------------------------------------------
const COLS = 80, ROWS = 25, CW = 8, CH = 16, PAD = 12;
const SW = COLS * CW, SH = ROWS * CH;
const VBW = SW + PAD * 2, VBH = SH + PAD * 2;

// VGA text colours used here (class name -> hex).
const INK = {
  k: '#000000', // black: shadows, text on grey
  b: '#0000AA', // blue: windows
  g: '#AAAAAA', // light grey: bars, highlight, config panel
  c: '#55FFFF', // light cyan: frames, ULTRA
  t: '#00AAAA', // cyan: the lower half of ULTRA
  w: '#FFFFFF', // white: options, SATISFACTORY
  n: '#55FF55', // light green: key names, level meter
  d: '#555555', // dark grey: panel labels
  y: '#FFFF55', // yellow: the tagline
  m: '#AA00AA', // magenta: the OBJECTIVES tab swatch (the app's purple)
  p: '#FF55FF', // light magenta: the ITEMS tab swatch (the app's hot pink)
  e: '#5555FF', // light blue: the BUILDINGS tab swatch (the app's electric blue)
};

// ---------------------------------------------------------------------------------------------
// CP437-style 8x16 bitmap font. Rows are '#'/'.' strings, placed from row `top` of the cell.
// Capitals sit on rows 2-11 with the VGA habit of 2-pixel stems; lowercase x-height is row 5.
// ---------------------------------------------------------------------------------------------
const FONT = new Map();
function def(ch, top, rows) {
  const g = new Array(16).fill(0);
  rows.split(' ').forEach((r, i) => {
    let v = 0;
    for (let c = 0; c < 8; c++) if (r[c] === '#') v |= 1 << (7 - c);
    g[top + i] = v;
  });
  FONT.set(ch, g);
}
const CAPS = {
  A: '...#... ..###.. .##.##. ##...## ##...## ####### ##...## ##...## ##...## ##...##',
  B: '######. .##..## .##..## .##..## .#####. .##..## .##..## .##..## .##..## ######.',
  C: '..####. .##..## ##....# ##..... ##..... ##..... ##..... ##....# .##..## ..####.',
  D: '#####.. .##.##. .##..## .##..## .##..## .##..## .##..## .##..## .##.##. #####..',
  E: '####### .##..## .##...# .##.#.. .####.. .##.#.. .##.... .##...# .##..## #######',
  F: '####### .##..## .##...# .##.#.. .####.. .##.#.. .##.... .##.... .##.... ####...',
  G: '..####. .##..## ##....# ##..... ##..... ##.#### ##...## ##...## .##..## ..###.#',
  H: '##...## ##...## ##...## ##...## ####### ##...## ##...## ##...## ##...## ##...##',
  I: '.####.. ..##... ..##... ..##... ..##... ..##... ..##... ..##... ..##... .####..',
  J: '...#### ....##. ....##. ....##. ....##. ....##. ##..##. ##..##. ##..##. .####..',
  K: '###..## .##..## .##.##. .##.##. .####.. .####.. .##.##. .##..## .##..## ###..##',
  L: '####... .##.... .##.... .##.... .##.... .##.... .##.... .##...# .##..## #######',
  M: '##...## ###.### ####### ####### ##.#.## ##...## ##...## ##...## ##...## ##...##',
  N: '##...## ###..## ####.## ####### ##.#### ##..### ##...## ##...## ##...## ##...##',
  O: '.#####. ##...## ##...## ##...## ##...## ##...## ##...## ##...## ##...## .#####.',
  P: '######. .##..## .##..## .##..## .#####. .##.... .##.... .##.... .##.... ####...',
  R: '######. .##..## .##..## .##..## .#####. .##.##. .##..## .##..## .##..## ###..##',
  S: '.#####. ##...## ##...## .##.... ..###.. ....##. .....## ##...## ##...## .#####.',
  T: '.######. .######. .#.##.#. ...##... ...##... ...##... ...##... ...##... ...##... ..####..',
  U: '##...## ##...## ##...## ##...## ##...## ##...## ##...## ##...## ##...## .#####.',
  V: '##...## ##...## ##...## ##...## ##...## ##...## ##...## .##.##. ..###.. ...#...',
  W: '##...## ##...## ##...## ##...## ##.#.## ##.#.## ##.#.## ####### .##.##. .##.##.',
  X: '##...## ##...## .##.##. .#####. ..###.. ..###.. .#####. .##.##. ##...## ##...##',
  Y: '.##..##. .##..##. .##..##. .##..##. ..####.. ...##... ...##... ...##... ...##... ..####..',
  Z: '####### ##...## #...##. ...##.. ..##... .##.... ##..... ##....# ##...## #######',
  0: '..###.. .##.##. ##...## ##...## ##.#.## ##.#.## ##...## ##...## .##.##. ..###..',
  1: '..##... .###... ####... ..##... ..##... ..##... ..##... ..##... ..##... ######.',
  2: '.#####. ##...## .....## ....##. ...##.. ..##... .##.... ##..... ##...## #######',
  3: '.#####. ##...## .....## .....## ..####. .....## .....## .....## ##...## .#####.',
  4: '....##. ...###. ..####. .##.##. ##..##. ####### ....##. ....##. ....##. ...####',
  5: '####### ##..... ##..... ##..... ######. .....## .....## .....## ##...## .#####.',
  6: '..###.. .##.... ##..... ##..... ######. ##...## ##...## ##...## ##...## .#####.',
  7: '####### ##...## .....## ....##. ...##.. ..##... ..##... ..##... ..##... ..##...',
  8: '.#####. ##...## ##...## ##...## .#####. ##...## ##...## ##...## ##...## .#####.',
  9: '.#####. ##...## ##...## ##...## .###### .....## .....## .....## ....##. .####..',
};
for (const [ch, rows] of Object.entries(CAPS)) def(ch, 2, rows);
def('Q', 2, '.#####. ##...## ##...## ##...## ##...## ##...## ##...## ##.#.## ##.#### .#####. ....##. ....###');

const LOWER = {
  a: [5, '.####.. ....##. .#####. ##..##. ##..##. ##..##. .###.##'],
  b: [2, '###.... .##.... .##.... .####.. .##.##. .##..## .##..## .##..## .##..## .#####.'],
  c: [5, '.#####. ##...## ##..... ##..... ##..... ##...## .#####.'],
  d: [2, '...###. ....##. ....##. ..####. .##.##. ##..##. ##..##. ##..##. ##..##. .###.##'],
  e: [5, '.#####. ##...## ####### ##..... ##..... ##...## .#####.'],
  f: [2, '..###.. .##.##. .##..#. .##.... ####... .##.... .##.... .##.... .##.... ####...'],
  g: [5, '.###.## ##..##. ##..##. ##..##. ##..##. ##..##. .#####. ....##. ##..##. .####..'],
  h: [2, '###.... .##.... .##.... .##.##. .###.## .##..## .##..## .##..## .##..## ###..##'],
  i: [2, '..##... ..##... ....... .###... ..##... ..##... ..##... ..##... ..##... .####..'],
  j: [2, '....##. ....##. ....... ...###. ....##. ....##. ....##. ....##. ....##. ....##. .##.##. .##.##. ..###..'],
  k: [2, '###.... .##.... .##.... .##..## .##.##. .####.. .####.. .##.##. .##..## ###..##'],
  l: [2, '.###... ..##... ..##... ..##... ..##... ..##... ..##... ..##... ..##... .####..'],
  m: [5, '###.##. ####### ##.#.## ##.#.## ##.#.## ##.#.## ##...##'],
  n: [5, '##.###. .##..## .##..## .##..## .##..## .##..## .##..##'],
  o: [5, '.#####. ##...## ##...## ##...## ##...## ##...## .#####.'],
  p: [5, '##.###. .##..## .##..## .##..## .##..## .##..## .#####. .##.... .##.... ####...'],
  q: [5, '.###.## ##..##. ##..##. ##..##. ##..##. ##..##. .#####. ....##. ....##. ...####'],
  r: [5, '##.###. .###.## .##..## .##.... .##.... .##.... ####...'],
  s: [5, '.#####. ##...## .##.... ..###.. ....##. ##...## .#####.'],
  t: [2, '...#... ..##... ..##... ######. ..##... ..##... ..##... ..##... ..##.## ...###.'],
  u: [5, '##..##. ##..##. ##..##. ##..##. ##..##. ##..##. .###.##'],
  v: [5, '##...## ##...## ##...## ##...## .##.##. ..###.. ...#...'],
  w: [5, '##...## ##...## ##.#.## ##.#.## ##.#.## ####### .##.##.'],
  x: [5, '##...## .##.##. ..###.. ..###.. ..###.. .##.##. ##...##'],
  y: [5, '##...## ##...## ##...## ##...## ##...## ##...## .###### .....## ....##. #####..'],
  z: [5, '####### ##..##. ...##.. ..##... .##.... ##...## #######'],
};
for (const [ch, [top, rows]] of Object.entries(LOWER)) def(ch, top, rows);

const PUNCT = {
  '.': [10, '...##.. ...##..'],
  ',': [9, '...##.. ...##.. ...##.. ..##...'],
  ':': [5, '...##.. ...##.. ....... ....... ...##.. ...##..'],
  ';': [5, '...##.. ...##.. ....... ....... ...##.. ...##.. ..##...'],
  '!': [2, '...##.. ..####. ..####. ..####. ...##.. ...##.. ...##.. ....... ...##.. ...##..'],
  '?': [2, '.#####. ##...## ##...## ....##. ...##.. ...##.. ...##.. ....... ...##.. ...##..'],
  "'": [1, '...##.. ...##.. ..##...'],
  '"': [1, '.##..##. .##..##. ..#..#..'],
  '-': [7, '#######'],
  '_': [14, '########'],
  '/': [4, '......# .....## ....##. ...##.. ..##... .##.... ##..... #......'],
  '\\': [4, '#...... ##..... .##.... ..##... ...##.. ....##. .....## ......#'],
  '|': [2, '...##.. ...##.. ...##.. ...##.. ...##.. ...##.. ...##.. ...##.. ...##.. ...##.. ...##.. ...##..'],
  '(': [2, '....##. ...##.. ..##... ..##... ..##... ..##... ..##... ..##... ...##.. ....##.'],
  ')': [2, '.##.... ..##... ...##.. ...##.. ...##.. ...##.. ...##.. ...##.. ..##... .##....'],
  '[': [2, '.####.. .##.... .##.... .##.... .##.... .##.... .##.... .##.... .##.... .####..'],
  ']': [2, '.####.. ...##.. ...##.. ...##.. ...##.. ...##.. ...##.. ...##.. ...##.. .####..'],
  '{': [2, '....### ...##.. ...##.. ...##.. .###... ...##.. ...##.. ...##.. ...##.. ....###'],
  '}': [2, '###.... ..##... ..##... ..##... ...###. ..##... ..##... ..##... ..##... ###....'],
  '<': [3, '....##. ...##.. ..##... .##.... ##..... .##.... ..##... ...##.. ....##.'],
  '>': [3, '.##.... ..##... ...##.. ....##. .....## ....##. ...##.. ..##... .##....'],
  '#': [2, '.##.##. .##.##. ####### .##.##. .##.##. .##.##. ####### .##.##. .##.##.'],
  '*': [5, '.##..##. ..####.. ######## ..####.. .##..##.'],
  '+': [5, '...##... ...##... .######. ...##... ...##...'],
  '=': [6, '.######. ........ ........ .######.'],
  '@': [2, '.#####. ##...## ##...## ##.#### ##.#### ##.#### ##.###. ##..... ##..... .#####.'],
  '&': [2, '.###... ##.##.. ##.##.. .###... .###.## ##.###. ##..##. ##..##. ##..##. .###.##'],
  '%': [4, '##....#. ##...##. ....##.. ...##... ..##.... .##..... ##...##. #....##.'],
  '~': [2, '.###.## ##.###.'],
  '♪': [3, '...##... ...###.. ...####. ...##.##. ...##..#. ...##... ...##... .####... #####... .###....'],
  '►': [3, '#....... ##...... ###..... ####.... #####... ####.... ###..... ##...... #.......'],
  '◄': [3, '....#... ...##... ..###... .####... #####... .####... ..###... ...##... ....#...'],
  '▼': [5, '#######. .#####.. ..###... ...#....'],
  '▲': [7, '...#.... ..###... .#####.. #######.'],
  '×': [6, '##...##. .##.##.. ..###... .##.##.. ##...##.'],
  '·': [7, '...##... ...##...'],
  '•': [6, '...##... ..####.. ..####.. ...##...'],
  '→': [5, '....##.. .....##. ######## .....##. ....##..'],
  '■': [5, '.######. .######. .######. .######. .######. .######.'],
  '♥': [4, '.##.##. ####### ####### ####### .#####. ..###.. ...#...'],
};
for (const [ch, [top, rows]] of Object.entries(PUNCT)) def(ch, top, rows);
FONT.set(' ', new Array(16).fill(0));

// Box-drawing single line as the VGA ROM has it: the horizontal is one scanline (row 7), the
// vertical is two pixels wide (columns 3-4).
FONT.set('│', new Array(16).fill(0x18));
FONT.set('─', new Array(16).fill(0).map((_, y) => (y === 7 ? 0xFF : 0)));

// Glyph bitmap -> compact path (greedy merge of horizontal runs into rectangles).
function bitmapPath(rows, width, scaleX = 1, scaleY = 1, ox = 0, oy = 0) {
  const rects = [];
  let open = [];
  for (let y = 0; y < rows.length; y++) {
    const runs = [];
    for (let x = 0; x < width;) {
      if (rows[y](x)) { const s0 = x; while (x < width && rows[y](x)) x++; runs.push([s0, x - s0]); } else x++;
    }
    const next = [];
    for (const [x0, w] of runs) {
      const o = open.find((r) => r.x === x0 && r.w === w && r.y + r.h === y);
      if (o) { o.h++; next.push(o); } else { const r = { x: x0, w, y, h: 1 }; rects.push(r); next.push(r); }
    }
    open = next;
  }
  return rects.map((r) => `M${ox + r.x * scaleX} ${oy + r.y * scaleY}h${r.w * scaleX}v${r.h * scaleY}h${-r.w * scaleX}z`).join('');
}
const glyphPath = (g) => bitmapPath(g.map((v) => (x) => (v >> (7 - x)) & 1), 8);

const glyphIds = new Map();
function gid(ch) {
  if (!FONT.has(ch)) throw new Error(`no glyph for ${JSON.stringify(ch)} (U+${ch.codePointAt(0).toString(16)})`);
  if (!glyphIds.has(ch)) glyphIds.set(ch, `g${glyphIds.size.toString(36)}`);
  return glyphIds.get(ch);
}
const len = (str) => [...str].length;

// ---------------------------------------------------------------------------------------------
// Drawing helpers. Everything is addressed in character cells (row, column).
// ---------------------------------------------------------------------------------------------
// A string at a cell position; colour comes from the enclosing group.
function text(r, c, str) {
  if (r < 0 || r >= ROWS || c < 0 || c + len(str) > COLS) throw new Error(`off screen at ${r},${c}: "${str}"`);
  let out = '';
  for (const ch of str) {
    if (ch !== ' ') out += `<use href="#${gid(ch)}" x="${c * CW}" y="${r * CH}"/>`;
    c++;
  }
  return out;
}
const ink = (cls, inner) => (inner ? `<g class="${cls}">${inner}</g>` : '');
// Coloured segments on one row: seg(r, c, [['text', 'w'], ...])
function seg(r, c, parts) {
  let out = '';
  for (const [str, cls] of parts) { out += ink(cls, text(r, c, str)); c += len(str); }
  return out;
}
const cells = (cls, r, c, w, h = 1) => `<rect class="${cls}" x="${c * CW}" y="${r * CH}" width="${w * CW}" height="${h * CH}"/>`;
// The solid black drop shadow: one row down, two columns right.
function shadow(r0, c0, w, h) {
  const x = c0 * CW, y = r0 * CH, W = w * CW, H = h * CH;
  return `<path class="k" d="M${x + W} ${y + CH}h${2 * CW}v${H}h${-W}v${-CH}h${W - 2 * CW}z"/>`;
}

// ---------------------------------------------------------------------------------------------
// Timeline. One loop of T seconds; every animated thing is "visible during these intervals".
// ---------------------------------------------------------------------------------------------
const T = 32;
const AT = {
  walk: [1.7, 2.9, 3.8, 4.8], // machine bar: Smelter > Constructor > Assembler > Foundry (oops) > back to Assembler
  recipe: 5.8,   // Enter: machine chosen, the recipe window opens
  port: 8.4,     // Enter: recipe chosen, the port window opens on top
  irq: 11.8,     // Enter: port chosen, IRQ replaces it
  dma: 15.0,     // Enter: IRQ chosen, DMA replaces it
  test: 18.2,    // Enter: DMA chosen, the test window
  saved: 22.0,   // Y: settings saved
  esc1: 27.6,    // Esc: the saved window closes
  esc2: 28.0,    // Esc: the recipe window closes
  defaults: 28.5,
  reset: 30.7,   // Enter: factory defaults. The state now equals t = 0, so the loop has no seam.
};
const REST = 24.5; // the frame the file rests on when nothing animates

const css = [];
let visN = 0;
const pct = (t) => `${+((100 * t) / T).toFixed(3)}%`;
// Returns a class that shows its element only during the given [from, to) intervals.
function vis(intervals) {
  const iv = intervals.filter(([a, b]) => b > a).sort((p, q) => p[0] - q[0]);
  const on = (t) => iv.some(([a, b]) => t >= a && t < b);
  const name = `v${(visN++).toString(36)}`;
  const pts = new Map();
  pts.set(0, on(0) ? 1 : 0);
  for (const [a, b] of iv) { if (a > 0) pts.set(a, 1); if (b < T) pts.set(b, on(b) ? 1 : 0); }
  let kf = '';
  for (const [t, v] of [...pts].sort((p, q) => p[0] - q[0])) kf += `${pct(t)}{opacity:${v}}`;
  kf += `100%{opacity:${on(0) ? 1 : 0}}`;
  css.push(`@keyframes ${name}{${kf}}.${name}{opacity:${on(REST) ? 1 : 0};animation:${name} ${T}s step-end infinite}`);
  return name;
}
const show = (intervals, inner) => `<g class="${vis(intervals)}">${inner}</g>`;

// ---------------------------------------------------------------------------------------------
// Windows: blue, light-cyan single-line frame, title centred in a grey bar on the top edge,
// key hints on the bottom edge (key name in light green, "=Action" in white), black shadow.
// ---------------------------------------------------------------------------------------------
function frame(r0, c0, w, h) {
  const x0 = c0 * CW + 3, x1 = (c0 + w - 1) * CW + 3, y0 = r0 * CH + 7, y1 = (r0 + h - 1) * CH + 7;
  return `<path class="c" d="M${x0} ${y0}h${x1 - x0 + 2}v1h${-(x1 - x0 + 2)}zM${x0} ${y1}h${x1 - x0 + 2}v1h${-(x1 - x0 + 2)}z`
    + `M${x0} ${y0}h2v${y1 - y0 + 1}h-2zM${x1} ${y0}h2v${y1 - y0 + 1}h-2z"/>`;
}
function win({ r, c, w, h, title, hints = [], hintCol = c + 1 }) {
  const inner = w - 2;
  if (len(title) + 2 > inner) throw new Error(`title too long: ${title}`);
  let out = shadow(r, c, w, h) + cells('b', r, c, w, h) + frame(r, c, w, h);
  const tw = len(title) + 2, tc = c + Math.floor((w - tw) / 2);
  out += cells('g', r, tc, tw) + ink('k', text(r, tc + 1, title));
  // Hints sit on the bottom edge, left to right, each on its own little gap in the frame.
  let hc = hintCol;
  const br = r + h - 1;
  for (const [key, action] of hints) {
    const n = len(key) + len(action) + 3;
    if (hc + n > c + w - 1) throw new Error(`hints too long in "${title}"`);
    out += cells('b', br, hc, n) + seg(br, hc + 1, [[key, 'n'], [`=${action}`, 'w']]);
    hc += n + 1;
  }
  return out;
}
// A pick list: white rows, and for each row the bar visits, a grey bar with black text that is
// only there while the bar is on that row. `rows` are strings already padded to the list width.
function list({ r, c, w, rows, visits }) {
  let out = ink('w', rows.map((str, i) => text(r + i, c + 1, str)).join(''));
  for (const [i, intervals] of visits) {
    out += show(intervals, cells('g', r + i, c, w) + ink('k', text(r + i, c + 1, rows[i])));
  }
  return out;
}
const pad = (a, b, w) => a + ' '.repeat(Math.max(1, w - len(a) - len(b))) + b;

const layers = [];
const defs = [];

// ---------------------------------------------------------------------------------------------
// Backdrop: the shade character over the whole field, light grey on blue, so it reads as a
// dithered field and not a flat fill. The ROM shade is a one-pixel checker, which turns to
// moire when a README scales the image by 1.25; this is the same checker at two pixels.
// ---------------------------------------------------------------------------------------------
const FIELD_R0 = 6, FIELD_R1 = 23;
defs.push(`<pattern id="sh" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="4" fill="${INK.b}"/><path fill="${INK.g}" d="M0 0h2v2h-2zM2 2h2v2h-2z" opacity=".55"/></pattern>`);
layers.push(`<rect y="${FIELD_R0 * CH}" width="${SW}" height="${(FIELD_R1 - FIELD_R0 + 1) * CH}" fill="url(#sh)"/>`);

// ---------------------------------------------------------------------------------------------
// Row 0: the grey title bar. Program title on the left, the notice on the right.
// ---------------------------------------------------------------------------------------------
{
  const left = ' ULTRA-SATISFACTORY Setup';
  const right = 'An unofficial Satisfactory companion app ';
  layers.push(cells('g', 0, 0, COLS) + ink('k', text(0, 0, left)) + ink('k', text(0, COLS - len(right), right)));
}

// ---------------------------------------------------------------------------------------------
// Rows 1-4: the banner. ULTRA SATISFACTORY in half-block "pixels" (each is half a character
// cell, 8 x 8), the only big lettering a text screen can do. Two tones per word: the top three
// pixel rows bright, the bottom two dim, which keeps every cell to two colours as text mode
// demands. ULTRA in light cyan, SATISFACTORY in white, as in the app's own title.
// ---------------------------------------------------------------------------------------------
{
  const BIG = {
    U: ['#.#', '#.#', '#.#', '#.#', '###'],
    L: ['#..', '#..', '#..', '#..', '###'],
    T: ['###', '.#.', '.#.', '.#.', '.#.'],
    R: ['##.', '#.#', '##.', '#.#', '#.#'],
    A: ['###', '#.#', '###', '#.#', '#.#'],
    S: ['###', '#..', '###', '..#', '###'],
    I: ['###', '.#.', '.#.', '.#.', '###'],
    F: ['###', '#..', '##.', '#..', '#..'],
    C: ['###', '#..', '#..', '#..', '###'],
    O: ['###', '#.#', '#.#', '#.#', '###'],
    Y: ['#.#', '#.#', '###', '.#.', '.#.'],
  };
  const word = (str) => {
    const rows = ['', '', '', '', ''];
    [...str].forEach((ch, i) => BIG[ch].forEach((row, y) => { rows[y] += (i ? '.' : '') + row; }));
    return rows;
  };
  const ultra = word('ULTRA'), satis = word('SATISFACTORY');
  const GAP = 3, total = ultra[0].length + GAP + satis[0].length;
  const c0 = Math.floor((COLS - total) / 2);
  const y0 = 2 * CH;
  const draw = (rows, c, hi, lo) => {
    const at = (from, to) => bitmapPath(rows.slice(from, to).map((row) => (x) => row[x] === '#'), rows[0].length, CW, CH / 2, c * CW, y0 + from * (CH / 2));
    return `<path class="${hi}" d="${at(0, 3)}"/><path class="${lo}" d="${at(3, 5)}"/>`;
  };
  layers.push(cells('k', 1, 0, COLS, 4));
  layers.push(draw(ultra, c0, 'c', 't') + draw(satis, c0 + ultra[0].length + GAP, 'w', 'g'));
  // A glint: three times a loop, each letter in turn has its dim half rewritten in the bright
  // colour for a moment, left to right. On a text screen that is one attribute byte per cell.
  const GLINT = { at: [0.3, 10.2, 20.5], step: 0.06, hold: 0.12 };
  let n = 0;
  const glint = (rows, c, hi) => {
    let out = '';
    for (let i = 0; i * 4 < rows[0].length; i++, n++) {
      const d = bitmapPath(rows.slice(3, 5).map((row) => (x) => row[i * 4 + x] === '#'), 3, CW, CH / 2, (c + i * 4) * CW, y0 + 3 * (CH / 2));
      out += show(GLINT.at.map((t) => [t + n * GLINT.step, t + n * GLINT.step + GLINT.hold]), `<path class="${hi}" d="${d}"/>`);
    }
    return out;
  };
  layers.push(glint(ultra, c0, 'c') + glint(satis, c0 + ultra[0].length + GAP, 'w'));
  const tag = 'Every recipe, building and Space Elevator objective, one click apart';
  // Row 5: the pitch, on a solid blue bar between the banner and the field.
  layers.push(cells('b', 5, 0, COLS) + ink('y', text(5, Math.floor((COLS - len(tag)) / 2), tag)));
}

// ---------------------------------------------------------------------------------------------
// The grey "Current Configuration" panel. Each value is "not set" until its window is answered.
// ---------------------------------------------------------------------------------------------
{
  const r = 7, c = 37, w = 41, h = 4;
  let out = shadow(r, c, w, h) + cells('g', r, c, w, h);
  const title = 'Current Configuration';
  out += ink('k', text(r, c + Math.floor((w - len(title)) / 2), title));
  const field = (row, col, label, value, from, blank = 'not set') => {
    out += ink('k', text(row, col, label));
    const vc = col + len(label) + 1;
    out += show([[0, from], [AT.reset, T]], ink('d', text(row, vc, blank)));
    out += show([[from, AT.reset]], ink('b', text(row, vc, value)));
  };
  field(r + 1, c + 2, 'Machine :', 'Assembler, 15 MW', AT.recipe);
  field(r + 2, c + 2, 'Recipe  :', 'Modular Frame, 2/min, 60 s', AT.port);
  field(r + 3, c + 2, 'Port    :', '8501', AT.irq, '----');
  field(r + 3, c + 18, 'IRQ :', '7', AT.dma, '-');
  field(r + 3, c + 28, 'DMA :', '1', AT.test, '-');
  layers.push(out);
}

// ---------------------------------------------------------------------------------------------
// Window 1: Select Production Machine. The nine production machines with the power draw the
// app shows for them, in the manner of a period card list (the exotic one near the end, then
// "none"). The bar walks down, overshoots to the Foundry, and comes back to the Assembler.
// ---------------------------------------------------------------------------------------------
{
  const r = 7, c = 1, w = 30, W = w - 4;
  const rows = [
    pad('Smelter', '4 MW', W),
    pad('Constructor', '4 MW', W),
    pad('Assembler', '15 MW', W),
    pad('Foundry', '16 MW', W),
    pad('Refinery', '30 MW', W),
    pad('Packager', '10 MW', W),
    pad('Manufacturer', '55 MW', W),
    pad('Blender', '75 MW', W),
    pad('Particle Accelerator', 'yes', W),
    pad('None, craft it by hand', '', W),
  ];
  const [a, b2, c2, d] = AT.walk;
  let out = win({ r, c, w, h: rows.length + 3, title: 'Select Production Machine', hints: [['Enter', 'Select'], ['Esc', 'Exit']] });
  out += list({
    r: r + 2, c: c + 1, w: w - 2, rows,
    visits: [
      [0, [[0, a], [AT.reset, T]]],
      [1, [[a, b2]]],
      [2, [[b2, c2], [d, AT.reset]]],
      [3, [[c2, d]]],
    ],
  });
  layers.push(out);
}

// ---------------------------------------------------------------------------------------------
// Device Notes: what the highlighted machine is good for, rewritten as the bar moves. One real
// standard recipe each (output per minute, cycle, power draw), and an opinion. It closes when
// a machine is chosen.
// ---------------------------------------------------------------------------------------------
{
  const r = 13, c = 37, w = 41, h = 6;
  const [a, b2, c2, d] = AT.walk;
  const NOTES = [
    ['Smelter', 'Iron Ingot 30/min 2 s', '4 MW', ['Ore goes in, ingots come out.', 'It has never once complained.'], [[0, a], [AT.reset, T]]],
    ['Constructor', 'Screw 40/min 6 s', '4 MW', ['You will need more Screws.', 'You will always need more Screws.'], [[a, b2]]],
    ['Assembler', 'Modular Frame 2/min 60 s', '15 MW', ['Two inputs, so twice as many ways', 'to be starved of one. Recommended.'], [[b2, c2], [d, AT.recipe]]],
    ['Foundry', 'Steel Ingot 45/min 4 s', '16 MW', ['Overshot. That is the Foundry.', 'Up one.'], [[c2, d]]],
  ];
  let out = win({ r, c, w, h, title: 'Device Notes' });
  for (const [name, recipe, mw, lines, intervals] of NOTES) {
    const W = w - 4;
    if ([...lines, `Test recipe: ${recipe}`].some((str) => len(str) > W)) throw new Error(`note too wide: ${name}`);
    out += show(intervals, seg(r + 1, c + 2, [[pad(name, mw, W), 'y']]) + seg(r + 2, c + 2, [['Test recipe: ', 'c'], [recipe, 'w']])
      + ink('w', text(r + 3, c + 2, lines[0]) + text(r + 4, c + 2, lines[1])));
  }
  layers.push(show([[0, AT.recipe], [AT.reset, T]], out));
}

// ---------------------------------------------------------------------------------------------
// Window 2: Select Recipe. What an Assembler makes, with the real per-minute output.
// ---------------------------------------------------------------------------------------------
{
  const r = 13, c = 22, w = 32, W = w - 4;
  const rows = [
    pad('Reinforced Iron Plate', '5/min', W),
    pad('Rotor', '4/min', W),
    pad('Modular Frame', '2/min', W),
    pad('Smart Plating', '2/min', W),
    pad('Versatile Framework', '5/min', W),
  ];
  const t0 = AT.recipe, t1 = AT.esc2;
  let out = win({ r, c, w, h: rows.length + 3, title: 'Select Recipe', hints: [['Enter', 'Select'], ['Esc', 'Back']] });
  out += list({ r: r + 2, c: c + 1, w: w - 2, rows, visits: [[0, [[t0, t0 + 0.9]]], [1, [[t0 + 0.9, t0 + 1.5]]], [2, [[t0 + 1.5, t1]]]] });
  layers.push(show([[t0, t1]], out));
}

// A window with a narrow pick list on the left, a divider, and a note on the right.
function pickWin({ r, c, w, listW, title, values, note, hints, from, to, steps }) {
  // The key hints start right of the divider, so the divider runs down to the bottom edge and
  // meets it in a T, not through the middle of a key name.
  let out = win({ r, c, w, h: values.length + 3, title, hints, hintCol: c + 2 + listW });
  const rows = values.map((v) => ` ${v}`.padEnd(listW - 1));
  const visits = steps.map(([i, a], k) => [i, [[a, k + 1 < steps.length ? steps[k + 1][1] : to]]]);
  out += list({ r: r + 2, c: c + 1, w: listW, rows, visits });
  const dc = c + 1 + listW;
  out += `<rect class="c" x="${dc * CW + 3}" y="${r * CH + 8}" width="2" height="${(values.length + 2) * CH - 1}"/>`;
  out += ink('w', note.map((str, i) => text(r + 2 + i, dc + 2, str)).join(''));
  if (note.some((str) => dc + 2 + len(str) > c + w - 2)) throw new Error(`note too wide in "${title}"`);
  return show([[from, to]], out);
}

// ---------------------------------------------------------------------------------------------
// Windows 3-5: the three numbers every setup program asked for.
// Port: 220 to 280 are the old sound-card choices; 8501 is the one Streamlit really serves on.
// ---------------------------------------------------------------------------------------------
layers.push(pickWin({
  r: 15, c: 45, w: 32, listW: 7, title: 'Select Port', from: AT.port, to: AT.irq,
  values: ['220', '240', '260', '280', '8501'],
  note: ['220 to 280 are here', "for old times' sake.", 'Streamlit listens on', 'localhost:8501.'],
  hints: [['Enter', 'OK'], ['Esc', 'Back']],
  steps: [[0, AT.port], [1, AT.port + 0.9], [2, AT.port + 1.3], [3, AT.port + 1.7], [4, AT.port + 2.1]],
}));

// IRQ: 2, 5 or 7, as tradition demands. Here it is the interruption you would like to request.
{
  const r = 16, c = 44, w = 33, W = w - 4;
  const rows = [pad('2   A fuse blows', '', W), pad('5   The belt backs up', '', W), pad('7   "Dinner is ready"', '', W)];
  const t0 = AT.irq, t1 = AT.dma;
  let out = win({ r, c, w, h: rows.length + 3, title: 'Select IRQ', hints: [['Enter', 'OK'], ['Esc', 'Back']] });
  out += list({ r: r + 2, c: c + 1, w: w - 2, rows, visits: [[0, [[t0, t0 + 1.0]]], [1, [[t0 + 1.0, t0 + 2.0]]], [2, [[t0 + 2.0, t1]]]] });
  layers.push(show([[t0, t1]], out));
}

// DMA: 0, 1, 3, 5, 6, 7. Direct Manifold Access.
layers.push(pickWin({
  r: 14, c: 45, w: 33, listW: 5, title: 'Select DMA', from: AT.dma, to: AT.test,
  values: ['0', '1', '3', '5', '6', '7'],
  note: ['Direct Manifold Access.', 'Load balancers need', 'not apply.', '', 'It backs up eventually.', 'That is the plan.'],
  hints: [['Enter', 'OK'], ['Esc', 'Back']],
  steps: [[0, AT.dma], [1, AT.dma + 1.1]],
}));

// ---------------------------------------------------------------------------------------------
// Window 6: the test. Where a sound card played a sample, this plays the recipe (3 Reinforced
// Iron Plate + 12 Iron Rod -> 2 Modular Frame, 60 s, 15 MW: all from the app's data) and shows
// a level meter of half-block characters, eight frames, each bar moving in half-cell steps.
// ---------------------------------------------------------------------------------------------
{
  const r = 14, c = 36, w = 42, h = 9;
  let out = win({ r, c, w, h, title: 'Test Production Line', hints: [['Y', 'I hear it'], ['N', 'It is starving']] });
  out += ink('w', text(r + 1, c + 2, '3 Reinforced Iron Plate + 12 Iron Rod'));
  out += seg(r + 2, c + 2, [['→ ', 'n'], ['2 Modular Frame', 'w'], ['   60 s   15 MW', 'c']]);
  out += ink('w', text(r + 4, c + 27, 'You should') + text(r + 5, c + 27, 'now hear an') + text(r + 6, c + 27, 'Assembler.'));
  // Eight bars, levels 1-6 (half cells) per frame. A fixed table: a plausible bounce, no PRNG.
  const LEVELS = [
    [3, 5, 2, 6, 4, 2, 5, 3],
    [4, 3, 4, 5, 6, 3, 4, 2],
    [6, 2, 5, 3, 5, 5, 2, 4],
    [5, 4, 6, 2, 3, 6, 3, 5],
    [3, 6, 4, 4, 2, 4, 5, 6],
    [2, 5, 3, 6, 4, 3, 6, 4],
    [4, 3, 2, 5, 6, 2, 4, 3],
    [5, 2, 4, 3, 5, 4, 2, 2],
  ];
  const FRAME = 0.16, period = LEVELS.length * FRAME;
  const bx = (c + 2) * CW, by = (r + 7) * CH; // three rows of meter, then a blank row above the hints
  css.push(`@keyframes mt{0%{opacity:1}${100 / LEVELS.length}%{opacity:0}100%{opacity:0}}.mt{opacity:0;animation:mt ${+period.toFixed(3)}s step-end infinite}.mt0{opacity:1}`);
  LEVELS.forEach((lv, k) => {
    let body = '', peak = '';
    lv.forEach((n, i) => {
      const x = bx + i * 3 * CW;
      body += `M${x} ${by - n * 8}h${2 * CW}v${n * 8}h${-2 * CW}z`;
      if (n >= 5) peak += `M${x} ${by - n * 8}h${2 * CW}v${(n - 4) * 8}h${-2 * CW}z`;
    });
    out += `<g class="mt${k ? '' : ' mt0'}" style="animation-delay:${+(k * FRAME - period).toFixed(3)}s"><path class="n" d="${body}"/><path class="y" d="${peak}"/></g>`;
  });
  layers.push(show([[AT.test, AT.saved]], out));
}

// ---------------------------------------------------------------------------------------------
// Window 7: Settings Saved. The two real commands and the live URL. This is the resting frame.
// ---------------------------------------------------------------------------------------------
{
  const r = 18, c = 31, w = 46, h = 5;
  const run = 'python -m streamlit run app/app.py';
  let out = win({ r, c, w, h, title: 'Settings Saved', hints: [['Enter', 'Run'], ['Esc', 'Back to the game']] });
  out += ink('y', text(r + 1, c + 2, 'python -m pip install -r requirements.txt') + text(r + 2, c + 2, run));
  out += seg(r + 3, c + 2, [['Live: ', 'w'], ['lukexyz.github.io/ULTRA-SATISFACTORY', 'c']]);
  // The hardware cursor waits after the second command: two scanlines, one blink a second.
  css.push('@keyframes cu{0%{opacity:1}50%{opacity:0}100%{opacity:1}}.cu{animation:cu 1s step-end infinite}');
  out += `<rect class="g cu" x="${(c + 2 + len(run)) * CW}" y="${(r + 2) * CH + 12}" width="${CW}" height="2"/>`;
  layers.push(show([[AT.saved, AT.esc1]], out));
}

// ---------------------------------------------------------------------------------------------
// Window 8: Restore Factory Defaults. Answering it clears the panel, which is the loop point.
// ---------------------------------------------------------------------------------------------
{
  const r = 13, c = 12, w = 38, h = 6;
  let out = win({ r, c, w, h, title: 'Restore Factory Defaults', hints: [['Enter', 'Yes'], ['Esc', 'Keep the spaghetti']] });
  out += ink('w', text(r + 1, c + 2, 'Tear it all down and rebuild it') + text(r + 2, c + 2, 'tidy this time?'));
  out += cells('g', r + 4, c + 9, 7) + ink('k', text(r + 4, c + 11, 'Yes')) + ink('w', text(r + 4, c + 22, 'No'));
  layers.push(show([[AT.defaults, AT.reset]], out));
}

// ---------------------------------------------------------------------------------------------
// Row 24: the grey bottom bar. The three tabs on the left, a context line on the right that
// changes with the window in front.
// ---------------------------------------------------------------------------------------------
{
  const r = ROWS - 1;
  let out = cells('g', r, 0, COLS);
  // The three tabs, each with a swatch in the nearest text colour to the app's own tab colour
  // (purple, hot pink, electric blue). Deliberately not "1=Objectives": the app has no such keys.
  let tc = 1;
  out += ink('k', text(r, tc, 'Tabs:'));
  tc += 6;
  for (const [name, cls] of [['Objectives', 'm'], ['Items', 'p'], ['Buildings', 'e']]) {
    out += `<rect class="${cls}" x="${tc * CW}" y="${r * CH + 3}" width="${CW}" height="10"/>` + ink('k', text(r, tc + 2, name));
    tc += len(name) + 4;
  }
  if (tc - 2 > 41) throw new Error('tab legend runs into the divider');
  out += ink('d', text(r, 42, '│'));
  const HELP = [
    ['9 machines, 477 buildings in all', [[0, AT.recipe], [AT.reset, T]]],
    ['140 items, 211 recipes (88 alt.)', [[AT.recipe, AT.port]]],
    ['Python 3.10+ and two commands', [[AT.port, AT.irq]]],
    ['Pick your favourite interruption', [[AT.irq, AT.dma]]],
    ['5 Space Elevator phases to feed', [[AT.dma, AT.test]]],
    ['Listening for the Assembler...', [[AT.test, AT.saved]]],
    ['Done. Alt-Tab back to the game', [[AT.saved, AT.defaults]]],
    ['Temporary setups are load-bearing', [[AT.defaults, AT.reset]]],
  ];
  for (const [str, intervals] of HELP) {
    if (len(str) > 35) throw new Error(`help too long: ${str}`);
    out += show(intervals, ink('k', text(r, 44, str)));
  }
  layers.push(out);
}

// ---------------------------------------------------------------------------------------------
// Assemble
// ---------------------------------------------------------------------------------------------
css.unshift(Object.entries(INK).map(([k, v]) => `.${k}{fill:${v}}`).join(''));
css.push('@media (prefers-reduced-motion:reduce){*{animation:none!important}}');

const glyphDefs = [...glyphIds].map(([ch, id]) => `<path id="${id}" d="${glyphPath(FONT.get(ch))}"/>`).join('');
const TITLE = 'ULTRA-SATISFACTORY Setup';
const DESC = 'ULTRA-SATISFACTORY drawn as a DOS game SETUP program: an 80 by 25 blue text screen where you choose a production machine, a recipe, a port, an IRQ and a DMA channel, test the line, and are given the two commands that start the app.';
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VBW} ${VBH}" width="${VBW}" height="${VBH}" role="img" aria-labelledby="t d">`
  + `<title id="t">${TITLE}</title><desc id="d">${DESC}</desc>`
  + `<style>${css.join('')}</style>`
  + `<defs>${glyphDefs}${defs.join('')}</defs>`
  + `<rect width="${VBW}" height="${VBH}" rx="9" fill="#000"/>`
  + `<g transform="translate(${PAD} ${PAD})">${layers.join('')}</g>`
  + `</svg>\n`;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, svg);
console.log(`${path.relative(process.cwd(), OUT)}  ${(svg.length / 1024).toFixed(1)} KB  ${glyphIds.size} glyphs  loop ${T}s`);
