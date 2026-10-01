#!/usr/bin/env node
// CASTAWAY as a firmware setup screen that gets hijacked by its own island.
//
// Style: "BIOS setup hijack" (catalogue pc-11). The trope: a demo staged inside the navy text-mode
// setup page of a PC firmware, double-line frame, two-column menu, key legend, yellow hint line,
// whose main panel then fills with text-mode effects (the reference is Razor 1911's dentro
// CMOS Cosmos, 2025). Nothing is copied from it: no vendor, no title line, no effect design.
// The setup utility, its firmware maker and every menu item here are invented for this project.
//
// Regenerate:  node examples/castaway/src/12-bios-hijack_opus_5.5.mjs
//
// Plain Node, no dependencies, deterministic (seeded PRNG, no clock). The screen is a real
// 80 x 25 grid of 8 x 16 cells. Text is <use> of glyph paths from the bitmap font below (never
// <text>). The island lives on the same grid: colour fields are whole or half cells (the way
// ANSI art fakes 8 x 8 pixels with half blocks), dithered edges are shade cells, and the small
// things (palm, her, ship, ripples) are what a demo would do with a redefined character set.
//
// One loop is 36 s: twelve bars of the project's theme (80 BPM, a bar every 3 s). The red bar
// walks the menu, someone picks SAVE & EXIT TO ISLAND, the panel is taken over from the horizon
// outwards, the divider turns out to be a palm tree, and the classic joke plays: a ship crosses
// the horizon exactly while she is busy with a coconut. Then setup redraws itself, row by row.
// The resting frame (no animation, or prefers-reduced-motion) is the joke mid-way.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '12-bios-hijack_opus_5.5';
const OUT = path.join(HERE, '..', 'assets', `${SLUG}.svg`);

// ---------------------------------------------------------------------------------------------
// Geometry
// ---------------------------------------------------------------------------------------------
const COLS = 80, ROWS = 25, CW = 8, CH = 16, PAD = 14;
const SW = COLS * CW, SH = ROWS * CH, VBW = SW + PAD * 2, VBH = SH + PAD * 2;
// The upper panel: rows 2..16, columns 1..78, split by the divider in column 39.
const PR0 = 2, PR1 = 16, DIV = 39;
const PX = CW, PY = PR0 * CH, PW = 78 * CW, PH = (PR1 - PR0 + 1) * CH; // 8, 32, 624, 240
const lx = (col) => (col - 1) * CW; // cell column -> panel-local x
const ly = (row) => (row - PR0) * CH; // cell row -> panel-local y
const HORIZON = 128; // panel-local y where the sea starts (top of row 10)

// ---------------------------------------------------------------------------------------------
// Timeline (seconds). 36 s = 12 bars of 3 s; gags start on bar lines, as in the real schedule.
// ---------------------------------------------------------------------------------------------
const T = 36;
const BEAT = 0.75;
const AT = {
  idleItem: 3.0, // red bar passes IDLE FEATURES SETUP
  tier: 3.375, // ... and stops on EVENT TIER SETUP
  sound: 6.0, // SOUND SYNTH SETUP
  hail: 9.0, // right arrow: HAIL PASSING SHIP (no ship present)
  save: 9.375, // down: SAVE & EXIT TO ISLAND
  dialog: 10.5, // Enter: the Y/N dialog
  yes: 11.25, // Y
  take: 12.0, // the dialog closes; colour bars sweep out from the horizon, row by row
  crown: 12.9, // the divider was a palm all along
  logo: 13.125, // CAST / AWAY, one letter per sixteenth
  girl: 12.0, // and she was there all along, idling
  sip: 18.0, // bar 7: coconut
  shipIn: 18.0, // ... and, in its own lane, a ship sets off along the horizon, one cell a step
  wave: 27.0, // bar 10: coconut done, she waves for rescue. The ship left a moment ago
  idle2: 30.0, // bar 11: back to idle
  restore: 33.0, // setup redraws itself, top row first
};
const restoreAt = (row) => AT.restore + (row - PR0) * 0.15; // row 16 back at 35.1
const MENU_BACK = 35.25;
// Rows are taken from the horizon outwards: 8+9 first, then 7+10, ... 2+15, then 16.
const fromHorizon = (row) => (row <= 9 ? 9 - row : Math.min(row - 10, 7)); // 0 for rows 9 and 10
const takeAt = (row) => AT.take + 0.2 + 0.1 * fromHorizon(row);
const REST = 21.6; // the frame shown with animation off: ship mid-horizon, coconut in progress

// ---------------------------------------------------------------------------------------------
// Seeded PRNG (the default run's seed)
// ---------------------------------------------------------------------------------------------
function mulberry32(a) {
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = mulberry32(1992);

// ---------------------------------------------------------------------------------------------
// CP437-style 8x16 bitmap font. Rows are '#'/'.' strings placed from row `top` of the cell.
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
  '!': [2, '...##.. ..####. ..####. ..####. ...##.. ...##.. ...##.. ....... ...##.. ...##..'],
  '?': [2, '.#####. ##...## ##...## ....##. ...##.. ...##.. ...##.. ....... ...##.. ...##..'],
  "'": [1, '...##.. ...##.. ..##...'],
  '-': [7, '#######'],
  '_': [14, '########'],
  '/': [4, '......# .....## ....##. ...##.. ..##... .##.... ##..... #......'],
  '(': [2, '....##. ...##.. ..##... ..##... ..##... ..##... ..##... ..##... ...##.. ....##.'],
  ')': [2, '.##.... ..##... ...##.. ...##.. ...##.. ...##.. ...##.. ...##.. ..##... .##....'],
  '&': [2, '.###... ##.##.. ##.##.. .###... .###.## ##.###. ##..##. ##..##. ##..##. .###.##'],
  '♪': [3, '...##... ...###.. ...####. ...##.##. ...##..#. ...##... ...##... .####... #####... .###....'],
  '►': [3, '#....... ##...... ###..... ####.... #####... ####.... ###..... ##...... #.......'],
  '◄': [3, '....#... ...##... ..###... .####... #####... .####... ..###... ...##... ....#...'],
  '▼': [5, '#######. .#####.. ..###... ...#....'],
  '▲': [7, '...#.... ..###... .#####.. #######.'],
  '→': [5, '....##.. .....##. ######## .....##. ....##..'],
  '←': [5, '..##.... .##..... ######## .##..... ..##....'],
  '↑': [3, '...##... ..####.. .######. ...##... ...##... ...##... ...##... ...##... ...##...'],
  '↓': [3, '...##... ...##... ...##... ...##... ...##... ...##... .######. ..####.. ...##...'],
};
for (const [ch, [top, rows]] of Object.entries(PUNCT)) def(ch, top, rows);
FONT.set(' ', new Array(16).fill(0));

// Double-line box drawing as the VGA ROM has it: verticals two pixels wide (columns 2-3 and 5-6),
// horizontals one scanline (rows 5 and 7), joined properly at corners and tees.
function plot(ops) {
  const g = new Array(16).fill(0);
  const H = (y, x0, x1) => { for (let x = x0; x <= x1; x++) g[y] |= 1 << (7 - x); };
  const V = (cols, y0, y1) => { for (const x of cols) for (let y = y0; y <= y1; y++) g[y] |= 1 << (7 - x); };
  ops(H, V);
  return g;
}
const L2 = [2, 3], R2 = [5, 6];
FONT.set('═', plot((H) => { H(5, 0, 7); H(7, 0, 7); }));
FONT.set('║', plot((H, V) => { V(L2, 0, 15); V(R2, 0, 15); }));
FONT.set('╔', plot((H, V) => { H(5, 2, 7); V(L2, 5, 15); H(7, 5, 7); V(R2, 7, 15); }));
FONT.set('╗', plot((H, V) => { H(5, 0, 6); V(R2, 5, 15); H(7, 0, 3); V(L2, 7, 15); }));
FONT.set('╚', plot((H, V) => { V(L2, 0, 7); H(7, 2, 7); V(R2, 0, 5); H(5, 5, 7); }));
FONT.set('╝', plot((H, V) => { V(R2, 0, 7); H(7, 0, 6); V(L2, 0, 5); H(5, 0, 3); }));
FONT.set('╦', plot((H, V) => { H(5, 0, 7); H(7, 0, 3); V(L2, 7, 15); H(7, 5, 7); V(R2, 7, 15); }));
FONT.set('╩', plot((H, V) => { H(7, 0, 7); H(5, 0, 3); V(L2, 0, 5); H(5, 5, 7); V(R2, 0, 5); }));
FONT.set('╠', plot((H, V) => { V(L2, 0, 15); V(R2, 0, 5); H(5, 5, 7); V(R2, 7, 15); H(7, 5, 7); }));
FONT.set('╣', plot((H, V) => { V(R2, 0, 15); V(L2, 0, 5); H(5, 0, 3); V(L2, 7, 15); H(7, 0, 3); }));

// Bitmap -> compact path: horizontal runs, merged downwards while they line up.
function runsToPath(rowRuns, ox = 0, oy = 0) {
  const rects = [];
  let open = [];
  for (let y = 0; y < rowRuns.length; y++) {
    const next = [];
    for (const [x0, w] of rowRuns[y]) {
      const o = open.find((r) => r.x === x0 && r.w === w && r.y + r.h === y);
      if (o) { o.h++; next.push(o); } else { const r = { x: x0, w, y, h: 1 }; rects.push(r); next.push(r); }
    }
    open = next;
  }
  return rects.map((r) => `M${ox + r.x} ${oy + r.y}h${r.w}v${r.h}h${-r.w}z`).join('');
}
function glyphPath(g) {
  const rows = g.map((v) => {
    const runs = [];
    for (let x = 0; x < 8;) {
      if ((v >> (7 - x)) & 1) { const s = x; while (x < 8 && ((v >> (7 - x)) & 1)) x++; runs.push([s, x - s]); } else x++;
    }
    return runs;
  });
  return runsToPath(rows);
}
const glyphIds = new Map();
function gid(ch) {
  if (!FONT.has(ch)) throw new Error(`no glyph for ${JSON.stringify(ch)} (U+${ch.codePointAt(0).toString(16)})`);
  if (!glyphIds.has(ch)) glyphIds.set(ch, `g${glyphIds.size.toString(36)}`);
  return glyphIds.get(ch);
}
const len = (s) => [...s].length;

// ---------------------------------------------------------------------------------------------
// Text-mode drawing, addressed in cells
// ---------------------------------------------------------------------------------------------
// One row of text: a group shifted to the row, then one <use> per glyph. Runs of the double
// horizontal line are drawn as two long rules instead of glyph after glyph (same pixels).
function text(r, c, str) {
  if (r < 0 || r >= ROWS || c < 0 || c + len(str) > COLS) throw new Error(`off screen at ${r},${c}: "${str}"`);
  let out = '', rule = '';
  const chars = [...str];
  for (let i = 0; i < chars.length;) {
    const ch = chars[i];
    if (ch === '═') {
      const s0 = i;
      while (i < chars.length && chars[i] === '═') i++;
      const x = (c + s0) * CW, w = (i - s0) * CW;
      rule += `M${x} 5h${w}v1h${-w}zM${x} 7h${w}v1h${-w}z`;
      continue;
    }
    if (ch !== ' ') out += `<use href="#${gid(ch)}" x="${(c + i) * CW}"/>`;
    i++;
  }
  if (rule) out += `<path d="${rule}"/>`;
  return out ? `<g transform="translate(0 ${r * CH})">${out}</g>` : '';
}
// A vertical run of the double line, rows r0..r1 in column c.
const vrule = (c, r0, r1) => `<path d="M${c * CW + 2} ${r0 * CH}h2v${(r1 - r0 + 1) * CH}h-2zM${c * CW + 5} ${r0 * CH}h2v${(r1 - r0 + 1) * CH}h-2z"/>`;
const ink = (cls, inner) => (inner ? `<g class="${cls}">${inner}</g>` : '');
const cells = (cls, r, c, w, h = 1) => `<rect class="${cls}" x="${c * CW}" y="${r * CH}" width="${w * CW}" height="${h * CH}"/>`;
const centre = (str, c0 = 0, w = COLS) => c0 + Math.floor((w - len(str)) / 2);

// ---------------------------------------------------------------------------------------------
// Animation helpers. Everything is a hard step, as on a text screen being rewritten.
// ---------------------------------------------------------------------------------------------
const css = [];
const visCache = new Map();
let animN = 0;
const pct = (t, P) => `${+((100 * t) / P).toFixed(3)}%`;
// A class that shows its element only during the given [from, to) intervals of a P-second loop.
function stepVis(intervals, P = T) {
  const iv = intervals.map(([a, b]) => [Math.max(0, a), Math.min(P, b)]).filter(([a, b]) => b > a).sort((p, q) => p[0] - q[0]);
  const key = `${P}|${JSON.stringify(iv)}`;
  if (visCache.has(key)) return visCache.get(key);
  const on = (t) => iv.some(([a, b]) => t >= a && t < b);
  const name = `v${(animN++).toString(36)}`;
  const pts = new Map([[0, on(0) ? 1 : 0]]);
  for (const [a, b] of iv) { if (a > 0) pts.set(a, 1); if (b < P) pts.set(b, on(b) ? 1 : 0); }
  let kf = '';
  for (const [t, v] of [...pts].sort((p, q) => p[0] - q[0])) kf += `${pct(t, P)}{opacity:${v}}`;
  kf += `100%{opacity:${on(0) ? 1 : 0}}`;
  css.push(`@keyframes ${name}{${kf}}.${name}{opacity:${on(REST % P) ? 1 : 0};animation:${name} ${P}s step-end infinite}`);
  visCache.set(key, name);
  return name;
}
const show = (intervals, inner, P = T) => (inner ? `<g class="${stepVis(intervals, P)}">${inner}</g>` : '');

// ---------------------------------------------------------------------------------------------
// Pixel canvas for the island (panel-local coordinates, 624 x 240). Output: one path per colour.
// ---------------------------------------------------------------------------------------------
const PAL = []; // colours used by the scene, index -> class q<i>: a hex, or a shade {a, b}
const palIndex = new Map();
function col(hex) {
  hex = hex.toUpperCase();
  if (!palIndex.has(hex)) { palIndex.set(hex, PAL.length); PAL.push(hex); }
  return palIndex.get(hex);
}
// A shade cell: a two-pixel checker, colour a on the odd squares and b on the even ones. It is
// stored as one pseudo-colour and drawn with a 4 x 4 pattern in the same phase, so the dithered
// areas cost one path each instead of a path per dot.
function shade(a, b) {
  const key = `${a.toUpperCase()}/${b.toUpperCase()}`;
  if (!palIndex.has(key)) { palIndex.set(key, PAL.length); PAL.push({ a: a.toUpperCase(), b: b.toUpperCase() }); }
  return palIndex.get(key);
}
class Canvas {
  constructor(w = PW, h = PH) { this.w = w; this.h = h; this.px = new Int16Array(w * h).fill(-1); }
  // c: a hex colour, a palette index, -1 to erase, or null to leave the pixel alone
  set(x, y, c) { if (c === null) return; x = Math.round(x); y = Math.round(y); if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.px[y * this.w + x] = typeof c === 'string' ? col(c) : c; }
  get(x, y) { return x >= 0 && y >= 0 && x < this.w && y < this.h ? this.px[y * this.w + x] : -1; }
  rect(x, y, w, h, c) { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) this.set(i, j, c); }
  // two-pixel checker between two colours (a shade cell that survives being scaled)
  dither(x, y, w, h, a, b) { this.rect(x, y, w, h, shade(a, b)); }
  glyph(ch, x, y, c) {
    const g = FONT.get(ch);
    for (let j = 0; j < 16; j++) for (let i = 0; i < 8; i++) if ((g[j] >> (7 - i)) & 1) this.set(x + i, y + j, c);
  }
  // a pixel map: rows of characters, key -> colour ('.' and ' ' are transparent)
  sprite(rows, x, y, key, k = 1) {
    rows.forEach((r, j) => [...r].forEach((ch, i) => { if (key[ch]) this.rect(x + i * k, y + j * k, k, k, key[ch]); }));
  }
  disc(cx, cy, r, c) { for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) if (i * i + j * j <= r * r + r * 0.6) this.set(cx + i, cy + j, c); }
  line(x0, y0, x1, y1, c) {
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
    for (let k = 0; k <= n; k++) this.set(x0 + ((x1 - x0) * k) / n, y0 + ((y1 - y0) * k) / n, c);
  }
  toSvg() {
    const byCol = new Map();
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w;) {
        const c = this.px[y * this.w + x];
        if (c < 0) { x++; continue; }
        const s = x;
        while (x < this.w && this.px[y * this.w + x] === c) x++;
        if (!byCol.has(c)) byCol.set(c, Array.from({ length: this.h }, () => []));
        byCol.get(c)[y].push([s, x - s]);
      }
    }
    return [...byCol].map(([c, rows]) => `<path class="q${c}" d="${runsToPath(rows)}"/>`).join('');
  }
}

// ---------------------------------------------------------------------------------------------
// Colours. The setup screen keeps the classic attributes; the island gets a sunny palette, as
// a demo would by reprogramming the sixteen palette registers.
// ---------------------------------------------------------------------------------------------
const UI = {
  N: '#0000A8', // navy field
  W: '#FFFFFF', // frame, items, legend
  Y: '#FFFF55', // hint line, keys
  R: '#AA0000', // selection bar, dialog
  K: '#000000', // dialog shadow
  G: '#AAAAAA', // quieter legend text
  B: '#5555FF', // light blue: the keys in the legend
};
const lerp = (a, b, t) => a + (b - a) * t;
const hex2 = (n) => Math.round(n).toString(16).padStart(2, '0');
function mix(c1, c2, t) {
  const a = [1, 3, 5].map((i) => parseInt(c1.slice(i, i + 2), 16));
  const b = [1, 3, 5].map((i) => parseInt(c2.slice(i, i + 2), 16));
  return `#${a.map((v, i) => hex2(lerp(v, b[i], t))).join('')}`;
}
function ramp(stops, t) {
  const n = stops.length - 1, k = Math.min(n - 1, Math.floor(t * n));
  return mix(stops[k], stops[k + 1], t * n - k);
}
const SKY = ['#1E6FD6', '#3E95E8', '#73BDF2', '#B4E2FA'];
const SEA = ['#0B48A6', '#1563C2', '#1C8BD2', '#25ADD8'];
const SHALLOW = '#3CCBD3', SHALLOW2 = '#6FE0DA';
const SAND = '#F4DCA4', SAND_HI = '#FBEBC4', SAND_WET = '#DDB778', SAND_SHADE = '#E9CB90';
const FOAM = '#FFFFFF', FOAM2 = '#D9F6FF';
const CLOUD = '#FFFFFF', CLOUD_LO = '#DCEEFA';
const TRUNK = '#B8774C', TRUNK_DK = '#8A5235', TRUNK_HI = '#D69A68';
const LEAF = ['#1D6B2E', '#2F8F37', '#4DB043', '#8BD24E'];
const NUT = '#6B4226', NUT_HI = '#94643C';
const LOG = '#A65D38', LOG_DK = '#6E3A22', ROPE = '#EBD6A0';
const LOGO = ['#FFC64D', '#FFA548', '#FF8256', '#F9606E', '#E8458B', '#F9606E', '#FF8256', '#FFA548'];
const RIPPLE = ['#D4F7FF', '#A6E9FB', '#7AD6F4', '#55BFEA'];
const NOTE = '#FFFF55';

// ---------------------------------------------------------------------------------------------
// The setup screen
// ---------------------------------------------------------------------------------------------
const TITLE_LINE = 'CASTAWAY Island Setup Utility - Barnacle Firmware, Seed 1992';
const ITEM_ROWS = [4, 6, 8, 10, 12, 14];
const LEFT_COL = 3, RIGHT_COL = 42;
const LEFT = ['► STANDARD ISLAND SETUP', '► IDLE FEATURES SETUP', '► EVENT TIER SETUP', '► SOUND SYNTH SETUP', '► MOTION STEP SETUP', '► SCENE LIFE MONITOR'];
const RIGHT = ['► LANE OVERLAP CONTROL', '  LOAD CALM DEFAULTS', '  LOAD SEED 1992 DEFAULTS', '  HAIL PASSING SHIP', '  SAVE & EXIT TO ISLAND', '  EXIT WITHOUT RESCUE'];
const HINT_ROW = 23;
const HINTS = [
  ['One Island, One Palm, One Raft, Headphones. Time Of Day: Daytime', [[0, AT.tier], [MENU_BACK, T]]],
  ['Regular 2-5 Min, Occasional 12-25, Rare 30-60, Super Rare 3-6 Hours', [[AT.tier, AT.sound]]],
  ['Every Sound Is Synthesized From Code. 80 BPM, F Major, No Samples', [[AT.sound, AT.save]]],
  ['Run python tools/serve.py, Then Open http://127.0.0.1:8765/', [[AT.save, AT.take]]],
  ['Idling. Nodding To The Beat. This Is Most Of The Video', [[AT.take, AT.sip]]],
  ['Busy With A Coconut. Meanwhile, A Ship Sails Past. As Scheduled', [[AT.sip, AT.wave]]],
  ['Waving For Rescue. The Ship Left On The Previous Bar', [[AT.wave, AT.idle2]]],
  ['Back To Idle. Nothing Else Happens For A While. On Purpose', [[AT.idle2, AT.restore]]],
  ['Esc : Quit To Setup. She Is Staying', [[AT.restore, MENU_BACK]]],
];

const layers = { screen: [], covers: [], bars: [], frame: [], top: [] };

// Navy field
layers.screen.push(`<rect class="N" width="${SW}" height="${SH}"/>`);

// Title line, centred
{
  const c = centre(TITLE_LINE);
  layers.frame.push(ink('Y', text(0, c, 'CASTAWAY')) + ink('W', text(0, c + 8, TITLE_LINE.slice(8))));
}

// Main frame: rows 1..20, divider tee at the top and bottom of the upper panel.
{
  let s = '';
  const hline = (r, l, m, rr, mid = null) => {
    let str = l;
    for (let c = 1; c < COLS - 1; c++) str += c === DIV && mid ? mid : m;
    return text(r, 0, str + rr);
  };
  s += hline(1, '╔', '═', '╗', ' ');
  for (const c of [0, COLS - 1]) s += vrule(c, 2, 16) + vrule(c, 18, 19);
  s += hline(17, '╠', '═', '╣', ' ');
  s += hline(20, '╚', '═', '╝');
  // the hint box, at the very bottom
  s += hline(22, '╔', '═', '╗') + vrule(0, 23, 23) + vrule(COLS - 1, 23, 23) + hline(24, '╚', '═', '╝');
  layers.frame.push(ink('W', s));
  // The divider's tees exist only while the divider does.
  layers.frame.push(show([[0, takeAt(2)], [AT.restore, T]], ink('W', text(1, DIV, '╦'))));
  layers.frame.push(show([[takeAt(2), AT.restore]], ink('W', text(1, DIV, '═'))));
  layers.frame.push(show([[0, takeAt(16)], [restoreAt(16), T]], ink('W', text(17, DIV, '╩'))));
  layers.frame.push(show([[takeAt(16), restoreAt(16)]], ink('W', text(17, DIV, '═'))));
}

// Key legend: quit and save on the left, arrows and select on the right.
{
  const key = (r, c, k, rest) => ink('Y', text(r, c, k)) + ink('W', text(r, c + len(k), rest));
  layers.frame.push(
    key(18, 3, 'Esc', ' : Quit (She Won\'t)')
    + key(19, 3, 'F10', ' : Save & Exit Setup')
    + key(18, 42, '↑ ↓ → ←', '   : Select Item')
    + key(19, 42, 'F2', '        : Nod To The Beat'),
  );
}

// Hint lines (yellow), one per phase.
for (const [str, iv] of HINTS) {
  if (len(str) > 76) throw new Error(`hint too long: ${str}`);
  layers.top.push(show(iv, ink('Y', text(HINT_ROW, centre(str), str))));
}

// Cover rows: the menu, one panel row at a time, over the island. Each is there until the
// takeover reaches its row, and comes back when setup redraws itself.
for (let r = PR0; r <= PR1; r++) {
  // (one pixel taller than the row, so neighbouring covers never leave a hairline seam)
  let inner = `<rect class="N" x="${PX}" y="${r * CH}" width="${PW}" height="${CH + (r < PR1 ? 1 : 0)}"/>` + ink('W', vrule(DIV, r, r));
  const i = ITEM_ROWS.indexOf(r);
  if (i >= 0) inner += ink('W', text(r, LEFT_COL, LEFT[i]) + text(r, RIGHT_COL, RIGHT[i]));
  layers.covers.push(show([[0, takeAt(r)], [restoreAt(r), T]], inner));
}

// The red selection bar, white text on red, one copy per stop.
{
  const stop = (side, i, iv) => {
    const c0 = side === 'L' ? LEFT_COL : RIGHT_COL;
    const str = (side === 'L' ? LEFT : RIGHT)[i];
    const r = ITEM_ROWS[i];
    return show(iv, cells('R', r, c0 - 1, len(str) + 2) + ink('W', text(r, c0, str)));
  };
  layers.bars.push(
    stop('L', 0, [[0, AT.idleItem], [restoreAt(ITEM_ROWS[0]), T]]),
    stop('L', 1, [[AT.idleItem, AT.tier]]),
    stop('L', 2, [[AT.tier, AT.sound]]),
    stop('L', 3, [[AT.sound, AT.hail]]),
    stop('R', 3, [[AT.hail, AT.save]]),
    stop('R', 4, [[AT.save, AT.take]]),
  );
}

// The hijack itself: each panel row turns into a colour bar for a moment before the island
// shows through it (and again before setup redraws it). The sweep runs outwards from the
// horizon, so the bars shade from magenta in the middle to orange at the top and bottom.
{
  const BARC = ['#E8458B', '#F2557C', '#F9606E', '#FF7360', '#FF8256', '#FF954E', '#FFA548', '#FFC64D'];
  for (let r = PR0; r <= PR1; r++) {
    const c = BARC[fromHorizon(r)];
    const y = r * CH;
    const strip = (dy, h, hex) => `<rect x="${PX}" y="${y + dy}" width="${PW}" height="${h}" fill="${hex}"/>`;
    const bar = strip(0, 16, mix(c, UI.N, 0.45)) + strip(3, 10, c) + strip(5, 2, mix(c, '#FFFFFF', 0.45));
    layers.bars.push(show([[takeAt(r) - 0.2, takeAt(r)], [restoreAt(r) - 0.15, restoreAt(r)]], bar));
  }
}

// The dialog: SAVE to ISLAND and EXIT (Y/N)?
{
  const r0 = 8, c0 = 19, w = 42;
  const msg = 'SAVE to ISLAND and EXIT (Y/N)? ';
  const mc = c0 + Math.floor((w - len(msg) - 1) / 2);
  let s = `<rect class="K" x="${(c0 + 2) * CW}" y="${(r0 + 1) * CH}" width="${w * CW}" height="${3 * CH}"/>`;
  s += cells('R', r0, c0, w, 3);
  let fr = '╔' + '═'.repeat(w - 2) + '╗';
  s += ink('W', text(r0, c0, fr) + text(r0 + 1, c0, '║') + text(r0 + 1, c0 + w - 1, '║') + text(r0 + 2, c0, '╚' + '═'.repeat(w - 2) + '╝'));
  s += ink('W', text(r0 + 1, mc, msg));
  const yc = mc + len(msg);
  s += show([[AT.yes, T]], ink('Y', text(r0 + 1, yc, 'Y')));
  // blinking cursor: under the answer, then after it
  const blink = (from, to, c) => {
    const iv = [];
    for (let t = from; t < to; t += 0.375) iv.push([t, Math.min(to, t + 0.1875)]);
    return show(iv, ink('Y', text(r0 + 1, c, '_')));
  };
  s += blink(AT.dialog, AT.yes, yc) + blink(AT.yes, AT.take, yc + 1);
  fr = null;
  layers.top.push(show([[AT.dialog, AT.take]], s));
}

// ---------------------------------------------------------------------------------------------
// The island. Base layers first: sky bars, clouds, sea bars, shallows, sand.
// ---------------------------------------------------------------------------------------------
const base = new Canvas();
// Sky: one colour per half cell, deep at the top, pale at the horizon (the "bars").
const skyAt = (y) => ramp(SKY, Math.max(0, Math.min(HORIZON / 8 - 1, Math.floor(y / 8))) / (HORIZON / 8 - 1));
for (let k = 0; k < HORIZON / 8; k++) base.rect(0, k * 8, PW, 8, skyAt(k * 8));
// Sea: deep at the horizon, turquoise towards us.
const SEA_ROWS = (PH - HORIZON) / 8;
const seaAt = (y) => ramp(SEA, Math.max(0, Math.min(SEA_ROWS - 1, Math.floor((y - HORIZON) / 8))) / (SEA_ROWS - 1));
for (let k = 0; k < SEA_ROWS; k++) base.rect(0, HORIZON + k * 8, PW, 8, seaAt(HORIZON + k * 8));
// The horizon itself: a bright scanline, as a one-eighth block row would draw it.
base.rect(0, HORIZON, PW, 2, '#CDEFFF');

// Clouds, ANSI style: round puffs quantised to quarter cells (the half-block trick, both ways),
// white on the sky bars, a cooler underside, and a shade-cell fringe.
function cloud(cv, puffs, base) {
  const inside = (x, y) => y < base && puffs.some(([cx, cy, r]) => (x - cx) ** 2 + ((y - cy) * 1.25) ** 2 < r * r);
  for (let y = 0; y < base; y += 8) for (let x = 0; x < PW; x += 4) {
    if (!inside(x + 2, y + 4)) {
      // fringe: a dithered quarter cell next to the cloud
      if (inside(x + 6, y + 4) || inside(x - 2, y + 4)) cv.dither(x, y, 4, 8, CLOUD_LO, skyAt(y));
      continue;
    }
    const lo = !inside(x + 2, y + 12) || y + 8 >= base;
    cv.rect(x, y, 4, 8, lo && y >= base - 16 ? CLOUD_LO : CLOUD);
  }
}
cloud(base, [[30, 116, 16], [58, 104, 24], [92, 110, 20], [124, 118, 14], [154, 122, 10], [10, 124, 10]], HORIZON);
cloud(base, [[470, 120, 12], [500, 108, 20], [532, 100, 24], [566, 110, 18], [596, 118, 14], [618, 124, 10]], HORIZON);
cloud(base, [[196, 96, 8], [212, 94, 10], [228, 98, 7]], 104);

// The island: an ellipse quantised to half cells, dithered at the edges.
const ISL = { x: 309, y: 190, rx: 122, ry: 22 };
function quantEllipse(cv, e, grow, fill, edge) {
  const rx = e.rx + grow.x, ry = e.ry + grow.y;
  for (let y = Math.floor((e.y - ry) / 8) * 8; y < e.y + ry; y += 8) {
    const dy = (y + 4 - e.y) / ry;
    if (Math.abs(dy) >= 1) continue;
    const hw = rx * Math.sqrt(1 - dy * dy);
    const x0 = Math.round((e.x - hw) / 8) * 8, x1 = Math.round((e.x + hw) / 8) * 8;
    if (x1 - x0 < 16) continue;
    cv.rect(x0, y, x1 - x0, 8, fill);
    if (edge !== null) { cv.rect(x0, y, 8, 8, edge); cv.rect(x1 - 8, y, 8, 8, edge); }
  }
}
quantEllipse(base, ISL, { x: 40, y: 14 }, SHALLOW, null);
for (let y = 0; y < PH; y++) for (let x = 0; x < PW; x++) {
  // dither the shallows' outer edge into the sea
  const c = base.get(x, y);
  if (c !== col(SHALLOW)) continue;
  const n = [base.get(x - 8, y), base.get(x + 8, y), base.get(x, y - 8), base.get(x, y + 8)];
  if (n.some((v) => v >= 0 && v !== col(SHALLOW) && v !== col(SHALLOW2) && typeof PAL[v] === 'string')) base.set(x, y, shade(seaAt(y), SHALLOW));
}
quantEllipse(base, ISL, { x: 20, y: 7 }, SHALLOW2, shade(SHALLOW2, SHALLOW));
quantEllipse(base, ISL, { x: 0, y: 0 }, shade(SAND_WET, SAND), shade(SAND_WET, SHALLOW2));
quantEllipse(base, ISL, { x: -6, y: -4 }, SAND, null);
// lighter sand on top, the palm's shadow, two rocks, some greenery
for (let y = ISL.y - ISL.ry; y < ISL.y - 8; y++) for (let x = 0; x < PW; x++) if (base.get(x, y) === col(SAND)) base.set(x, y, shade(SAND_HI, SAND));
for (let j = -4; j <= 4; j++) for (let i = -30; i <= 30; i++) if ((i * i) / 900 + (j * j) / 16 <= 1 && [col(SAND), shade(SAND_HI, SAND)].includes(base.get(ISL.x + 26 + i, ISL.y + 2 + j))) base.set(ISL.x + 26 + i, ISL.y + 2 + j, shade(SAND_SHADE, SAND));
for (const [x, y, r] of [[206, 203, 4], [214, 206, 3], [404, 206, 3]]) { base.disc(x, y, r, '#8D97A3'); base.rect(x - r + 1, y - r + 1, r, 2, '#C2CAD3'); }

// Greenery: little clumps either side of the palm (a few custom glyphs' worth)
const SHRUB = ['...a..b..', '..aab.bb.', '.aabbbcb.', 'aabbcbccb', '.bbccccc.'];
const SHRUB_KEY = { a: LEAF[3], b: LEAF[2], c: LEAF[1] };
const greens = new Canvas();
greens.sprite(SHRUB, 286, 181, SHRUB_KEY);
greens.sprite(SHRUB.map((s) => [...s].reverse().join('')), 322, 185, SHRUB_KEY);
greens.sprite(['.a.b.', 'abbcb', '.bcc.'], 366, 194, SHRUB_KEY);
greens.sprite(['..a..', '.abb.', 'abccb'], 212, 186, SHRUB_KEY);

// The raft, beached on the right: four logs and two ropes.
const raft = new Canvas();
{
  const x0 = 428, y0 = 196;
  for (let k = 0; k < 4; k++) {
    const y = y0 + k * 4, x = x0 + (k % 2) * 2;
    raft.rect(x + 1, y, 44, 3, LOG);
    raft.rect(x, y + 1, 46, 1, LOG);
    raft.rect(x + 1, y + 3, 44, 1, LOG_DK);
    raft.set(x + 1, y + 1, LOG_DK); raft.set(x + 44, y + 1, LOG_DK);
  }
  for (const rx of [x0 + 8, x0 + 36]) raft.rect(rx, y0 - 1, 2, 17, ROPE);
  // the sea laps at it
  raft.rect(x0 - 2, y0 + 16, 50, 1, FOAM2);
}

// The palm trunk: where the divider was. Tall, slender, gently curved, banded.
const trunk = new Canvas();
const CROWN = { x: 318, y: 50 };
{
  const P0 = { x: 309, y: 194 }, P1 = { x: 298, y: 124 }, P2 = { x: CROWN.x, y: CROWN.y + 4 };
  const N = 600;
  for (let k = 0; k <= N; k++) {
    const s = k / N;
    const x = (1 - s) ** 2 * P0.x + 2 * (1 - s) * s * P1.x + s * s * P2.x;
    const y = (1 - s) ** 2 * P0.y + 2 * (1 - s) * s * P1.y + s * s * P2.y;
    const w = lerp(7, 4, s);
    const yy = Math.round(y), xl = Math.round(x - w / 2);
    for (let i = 0; i < Math.round(w); i++) {
      let c = TRUNK;
      if (i === 0) c = TRUNK_HI;
      if (i >= Math.round(w) - 2) c = TRUNK_DK;
      if ((yy % 7) === 0) c = TRUNK_DK;
      trunk.set(xl + i, yy, c);
    }
  }
}

// The crown: fronds as tapered blades of leaflets, light on top, dark underneath.
const crown = new Canvas();
{
  const frond = (angle, length, droop, maxW, shade) => {
    const a = (angle * Math.PI) / 180;
    const C = CROWN;
    const tip = { x: C.x + length * Math.cos(a), y: C.y - length * Math.sin(a) + droop };
    const ctl = { x: C.x + 0.55 * length * Math.cos(a), y: C.y - 0.55 * length * Math.sin(a) - length * 0.22 };
    const N = 220;
    for (let k = 0; k <= N; k++) {
      const s = k / N;
      const bx = (1 - s) ** 2 * C.x + 2 * (1 - s) * s * ctl.x + s * s * tip.x;
      const by = (1 - s) ** 2 * C.y + 2 * (1 - s) * s * ctl.y + s * s * tip.y;
      const tx = 2 * (1 - s) * (ctl.x - C.x) + 2 * s * (tip.x - ctl.x);
      const ty = 2 * (1 - s) * (ctl.y - C.y) + 2 * s * (tip.y - ctl.y);
      const tl = Math.hypot(tx, ty) || 1;
      const ux = tx / tl, uy = ty / tl;
      const W = maxW * Math.sin(Math.PI * Math.min(1, s * 1.15)) ** 0.8 * (0.8 + 0.2 * ((k >> 2) % 2));
      if (s > 0.06) {
        for (const side of [-1, 1]) {
          // leaflets hang: the normal, bent down and towards the tip
          let nx = -uy * side, ny = ux * side;
          if (ny < 0) { nx *= 0.7; ny *= 0.7; }
          const dx = nx * 0.85 + ux * 0.55, dy = ny * 0.85 + uy * 0.55 + 0.5;
          const dl = Math.hypot(dx, dy);
          const steps = Math.ceil(W);
          for (let m = 1; m <= steps; m++) {
            const px = bx + (dx / dl) * m, py = by + (dy / dl) * m;
            const under = ny * side > 0 ? 1 : 0;
            const tipFade = m > steps * 0.7 ? 1 : 0;
            crown.set(px, py, LEAF[Math.max(0, Math.min(3, 2 + shade - under - tipFade))]);
          }
        }
      }
      crown.set(bx, by, LEAF[3]);
      crown.set(bx, by + 1, LEAF[2]);
    }
  };
  // back fronds first, darker
  frond(118, 46, 18, 8, -1);
  frond(62, 46, 18, 8, -1);
  frond(200, 46, 34, 7, -1);
  frond(-20, 46, 34, 7, -1);
  frond(172, 70, 40, 10, 0);
  frond(8, 66, 40, 10, 0);
  frond(140, 54, 22, 9, 1);
  frond(40, 54, 22, 9, 1);
  frond(96, 34, 10, 7, 1);
  // coconuts under the crown
  for (const [dx, dy] of [[-5, 7], [1, 9], [6, 6]]) { crown.disc(CROWN.x + dx, CROWN.y + dy, 3, NUT); crown.set(CROWN.x + dx - 1, CROWN.y + dy - 1, NUT_HI); }
}

// The logo: CAST to the left of the palm, AWAY to the right, in half-cell blocks.
const LETTERS = {
  C: ['.#####', '######', '##....', '##....', '##....', '##....', '######', '.#####'],
  A: ['.####.', '######', '##..##', '##..##', '######', '######', '##..##', '##..##'],
  S: ['.#####', '######', '##....', '#####.', '.#####', '....##', '######', '#####.'],
  T: ['######', '######', '..##..', '..##..', '..##..', '..##..', '..##..', '..##..'],
  W: ['##....##', '##....##', '##.##.##', '##.##.##', '##.##.##', '##.##.##', '########', '.##..##.'],
  Y: ['##..##', '##..##', '##..##', '######', '.####.', '..##..', '..##..', '..##..'],
};
const LOGO_Y = 16, BLK = 8;
const logoParts = []; // {x, letter, rows: [[x,w]...] per block row}
function placeWord(word, x0) {
  let x = x0;
  for (const ch of word) {
    const L = LETTERS[ch];
    logoParts.push({ x, L });
    x += (L[0].length + 1) * BLK;
  }
  return x - BLK;
}
const castEnd = placeWord('CAST', 24);
const awayEnd = placeWord('AWAY', 376);
if (castEnd > 248 || awayEnd > 616) throw new Error(`logo too wide: ${castEnd} ${awayEnd}`);

// Her: small, simple, sitting cross-legged. Coral tank top, cream shorts, cream headphones,
// brown hair in a low bun, bare feet. 20 x 24 pixels, built from parts.
const GIRL = { x: 226, y: 150, k: 2 }; // drawn at two pixels per pixel
const GK = { h: '#5A3423', p: '#F4ECD8', s: '#EDB58E', b: '#F2A08C', E: '#7A4A3A', e: '#2A1A12', c: '#F27A64', w: '#F0E6CC', W: '#D9CBA6', g: '#86B84E', G: '#5F9035', o: '#F3E7C9', y: '#FFFFFF' };
// head: 10 rows, face 8 px, cream headband across the hair, ear cups either side, low bun
const HEAD = [
  '......hhhhhhhh......',
  '.....hpppppppph.....',
  '.....hhhhhhhhhh.....',
  '....phhhhhhhhhhp....',
  '...pphsssssssshpp...',
  '...pphssessesshpp...',
  '...pphsbssssbshpp...',
  '.....hsssssssshh....',
  '.....hhsssssshh.....',
  '....hhh..ss.........',
];
const HEAD_SHUT = HEAD.map((r, i) => (i === 5 ? '...pphsssssssshpp...' : i === 6 ? '...pphsEEssEEshpp...' : r));
const BODY = [
  '.....sssccccsss.....',
  '....sscccccccccss...',
  '....s.cccccccc.s....',
  '....s.cccccccc.s....',
  '....s.cccccccc.s....',
  '...ss.cccccccc.ss...',
  '..sswwwwwwwwwwwwss..',
  '.ssssWwwwwwwwwWssss.',
  '.ssssssssssssssssss.',
  '..ss............ss..',
];
const BODY_NOARM_L = BODY.map((r, i) => (i >= 2 && i <= 6 ? (i === 6 ? '....' : '......') + r.slice(i === 6 ? 4 : 6) : r));
const BODY_SIP = [
  '.....sssccccsss.....',
  '....sscccccccccss...',
  '....s.cccccccc.s....',
  '....s.cccccccc.s....',
  '....ss.cccccc.ss....',
  '......cccccccc......',
  '...wwwwwwwwwwwwww...',
  '.ssssWwwwwwwwwWssss.',
  '.ssssssssssssssssss.',
  '..ss............ss..',
];
// a green coconut with a straw, held up in both hands (rows from the sprite top)
const COCONUT = [
  '', '', '', '', '', '', '', '', '', '', '',
  '..........y.........',
  '..........y.........',
  '........oooo........',
  '.......gggggg.......',
  '......sggggggs......',
  '.....s.gggggG.s.....',
  '........GGGG........',
];
const ARM_UP = [
  '', '', '', '',
  '.ss.................',
  '.ss.................',
  '.ss.................',
  '..s.................',
  '..s.................',
  '..s.................',
  '..s.................',
  '..s.................',
  '..s.................',
  '...s................',
  '....s...............',
];
const ARM_OUT = [
  '', '', '', '', '', '', '',
  'ss..................',
  'ss..................',
  '.s..................',
  '.s..................',
  '..s.................',
  '..s.................',
  '...s................',
  '....s...............',
];
const sprite = (parts) => {
  const cv = new Canvas();
  for (const [rows, dy] of parts) cv.sprite(rows, GIRL.x, GIRL.y + dy * GIRL.k, GK, GIRL.k);
  return cv;
};
const girlIdleBody = sprite([[BODY, 14]]);
const girlIdleHead = sprite([[HEAD, 4]]);
const girlSip = sprite([[BODY_SIP, 14], [HEAD_SHUT, 4], [COCONUT, 0]]);
const girlWaveBody = sprite([[BODY_NOARM_L, 14], [HEAD, 4]]);
const girlArmUp = sprite([[ARM_UP, 0]]);
const girlArmOut = sprite([[ARM_OUT, 0]]);

// The ship: small, far, on the horizon. It crosses one cell at a time.
const ship = new Canvas(48, 16);
ship.sprite([
  '...................ggg..................',
  '.................gggg...................',
  '..................rr....................',
  '..................rR....................',
  '...........wwwwwwwrRwwww................',
  '..........wbwwbwwbwwbwwbww..............',
  '........wwwwwwwwwwwwwwwwwwwww...........',
  '......wwbwbwbwbwbwbwbwbwbwbwwww.........',
  'nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn.',
  '.nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn..',
  '..NNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNN..',
], 0, 0, { g: '#E8F4FA', r: '#E2483C', R: '#B8332B', w: '#FFFFFF', b: '#2E3E70', n: '#26305A', N: '#1B2245' });
const SHIP_Y = HORIZON - 9;
const SHIP_STEPS = 84, SHIP_STEP = 0.1; // one cell per step
const SHIP_X0 = -40, SHIP_X1 = SHIP_X0 + SHIP_STEPS * 8;
const SHIP_DUR = SHIP_STEPS * SHIP_STEP;
const shipAt = (t) => (t <= AT.shipIn ? SHIP_X0 : t >= AT.shipIn + SHIP_DUR ? SHIP_X1 : SHIP_X0 + 8 * Math.floor((t - AT.shipIn) / SHIP_STEP));

// Whitecaps: little crest glyphs on sea cells, two sets that swap each beat (shore and sea).
const inIslandZone = (x, y, pad) => {
  const dx = (x - ISL.x) / (ISL.rx + 40 + pad), dy = (y - ISL.y) / (ISL.ry + 14 + pad / 3);
  return dx * dx + dy * dy < 1;
};
const waveA = new Canvas(), waveB = new Canvas();
{
  const crest = (cv, x, y, w, c) => { cv.rect(x + 1, y, w - 2, 1, c); cv.set(x, y + 1, c); cv.set(x + w - 1, y + 1, c); };
  for (let row = 10; row <= 16; row++) {
    const depth = (row - 10) / 6;
    for (let c = 1; c <= 78; c++) {
      if (rnd() > 0.16 + depth * 0.08) continue;
      const x = lx(c) + 1, y = ly(row) + 3 + Math.floor(rnd() * 9);
      if (y < HORIZON + 4) continue;
      const w = depth < 0.3 ? 4 : 6;
      const colr = rnd() < 0.3 ? FOAM2 : ramp(['#5FB4EE', '#7CCBF3', '#9EDCF7'], depth);
      if (!inIslandZone(x, y, 6)) crest(waveA, x, y, w, colr);
      if (!inIslandZone(x + 8, y, 6) && c < 78) crest(waveB, x + 8, y, w, colr);
    }
  }
}
// Shore foam: two rings that breathe in and out on the half bar.
const foamA = new Canvas(), foamB = new Canvas();
for (const [cv, g] of [[foamA, 2], [foamB, 9]]) {
  const rx = ISL.rx + g * 2, ry = ISL.ry + g * 0.6;
  for (let a = 0; a < Math.PI * 2; a += 0.045) {
    const x = Math.round(ISL.x + rx * Math.cos(a)), y = Math.round(ISL.y + ry * Math.sin(a));
    if (Math.floor(a / 0.045) % 3 === 2) continue;
    if (raft.get(x, y) >= 0) continue;
    cv.rect(x, y, 2, 1, g < 5 ? FOAM : FOAM2);
  }
}

// Ripples: rings of outward-pointing arrow glyphs, a flat diamond round the island, one ring per
// eighth note from each bar line (gags start on the bar).
const ripples = [0, 1, 2, 3].map(() => new Canvas());
const ISL_COL = 1 + ISL.x / 8, ISL_ROW = PR0 + ISL.y / 16; // in cell units
for (let k = 0; k < 4; k++) {
  const Rx = 22 + 5 * k, Ry = 3.4 + 0.8 * k;
  const placed = new Set();
  for (let row = 10; row <= 16; row++) {
    const dy = row + 0.5 - ISL_ROW;
    if (Math.abs(dy) > Ry) continue;
    const dx = Rx * (1 - Math.abs(dy) / Ry);
    const pts = dx < 1.5 ? [[Math.floor(ISL_COL), dy < 0 ? '▲' : '▼']] : [[Math.floor(ISL_COL - dx), '◄'], [Math.floor(ISL_COL + dx), '►']];
    for (const [c, g] of pts) {
      if (c < 1 || c > 78 || placed.has(`${row},${c}`)) continue;
      const x = lx(c), y = ly(row);
      if (inIslandZone(x + 4, y + 8, 2) || raft.get(x + 4, y + 8) >= 0) continue;
      placed.add(`${row},${c}`);
      ripples[k].glyph(g, x, y, RIPPLE[k]);
    }
  }
}

// Notes rising from her headphones while she idles.
const notes = [0, 1, 2, 3].map(() => new Canvas());
{
  const c0 = Math.floor(1 + (GIRL.x + 2) / 8);
  for (let k = 0; k < 4; k++) {
    notes[k].glyph('♪', lx(c0 - 1), ly(12 - k), NOTE);
    if (k >= 2) notes[k].glyph('♪', lx(c0 + 5), ly(12 - (k - 2)), NOTE);
  }
}

// ---------------------------------------------------------------------------------------------
// Assemble the panel scene
// ---------------------------------------------------------------------------------------------
const scene = [];
scene.push(base.toSvg());
scene.push(`<g class="${stepVis([[0, BEAT]], BEAT * 2)}">${waveA.toSvg()}</g><g class="${stepVis([[BEAT, BEAT * 2]], BEAT * 2)}">${waveB.toSvg()}</g>`);
ripples.forEach((cv, k) => scene.push(`<g class="${stepVis([[k * 0.375, (k + 1) * 0.375]], 3)}">${cv.toSvg()}</g>`));
scene.push(`<g class="${stepVis([[0, 1.5]], 3)}">${foamA.toSvg()}</g><g class="${stepVis([[1.5, 3]], 3)}">${foamB.toSvg()}</g>`);
scene.push(`<g transform="translate(0 ${SHIP_Y})"><g class="ship">${ship.toSvg()}</g></g>`);
scene.push(raft.toSvg());
scene.push(trunk.toSvg());
scene.push(greens.toSvg());
// logo: shadow (navy, one block down and right), then letters with per-row raster colours
{
  let shadow = '';
  logoParts.forEach((p, i) => {
    let sh = '';
    const rows = p.L.map((r) => { const runs = []; for (let x = 0; x < r.length;) { if (r[x] === '#') { const s = x; while (x < r.length && r[x] === '#') x++; runs.push([s, x - s]); } else x++; } return runs; });
    for (let j = 0; j < 8; j++) for (const [x0, w] of rows[j]) sh += `M${p.x + x0 * BLK + BLK} ${LOGO_Y + j * BLK + BLK}h${w * BLK}v${BLK}h${-w * BLK}z`;
    let body = `<path class="N" d="${sh}"/>`;
    for (let j = 0; j < 8; j++) {
      let d = '';
      for (const [x0, w] of rows[j]) d += `M${p.x + x0 * BLK} ${LOGO_Y + j * BLK}h${w * BLK}v${BLK}h${-w * BLK}z`;
      if (d) body += `<path class="lr${j}" d="${d}"/>`;
    }
    shadow += show([[AT.logo + i * 0.1875, T]], body);
  });
  scene.push(shadow);
}
scene.push(show([[AT.crown, T]], crown.toSvg()));
// her
{
  const nod = `<g class="nod">${girlIdleHead.toSvg()}</g>`;
  scene.push(show([[AT.girl, AT.sip], [AT.idle2, T]], girlIdleBody.toSvg() + nod));
  scene.push(show([[AT.sip, AT.wave]], girlSip.toSvg()));
  scene.push(show([[AT.wave, AT.idle2]], girlWaveBody.toSvg()
    + `<g class="${stepVis([[0, 0.375]], BEAT)}">${girlArmUp.toSvg()}</g><g class="${stepVis([[0.375, 0.75]], BEAT)}">${girlArmOut.toSvg()}</g>`));
  let ns = '';
  notes.forEach((cv, k) => { ns += `<g class="${stepVis([[k * BEAT, (k + 1) * BEAT]], 3)}">${cv.toSvg()}</g>`; });
  scene.push(show([[AT.girl + 1.5, AT.sip], [AT.idle2, AT.restore]], ns));
}

// ---------------------------------------------------------------------------------------------
// CSS: palette, raster cycle for the logo, the nod, the ship, reduced motion
// ---------------------------------------------------------------------------------------------
css.unshift(Object.entries(UI).map(([k, v]) => `.${k}{fill:${v}}`).join('') + PAL.map((h, i) => `.q${i}{fill:${typeof h === 'string' ? h : `url(#s${i})`}}`).join(''));
const patternDefs = PAL.map((h, i) => (typeof h === 'string' ? '' : `<pattern id="s${i}" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="4" fill="${h.b}"/><path d="M2 0h2v2h-2zM0 2h2v2h-2z" fill="${h.a}"/></pattern>`)).join('');
{
  // the logo's colour bars scroll upwards one row per beat; a full cycle is two bars
  const P = LOGO.length * BEAT;
  let kf = '';
  LOGO.forEach((c, i) => { kf += `${pct(i * BEAT, P)}{fill:${c}}`; });
  kf += `100%{fill:${LOGO[0]}}`;
  css.push(`@keyframes lc{${kf}}`);
  for (let j = 0; j < 8; j++) css.push(`.lr${j}{fill:${LOGO[j]};animation:lc ${P}s step-end infinite;animation-delay:-${j * BEAT}s}`);
  // the nod: head down on the beat, up on the off-beat
  css.push(`@keyframes nod{0%{transform:translate(0,${GIRL.k}px)}50%{transform:translate(0,0)}100%{transform:translate(0,${GIRL.k}px)}}.nod{animation:nod ${BEAT}s step-end infinite}`);
  // the ship, one cell per step along the horizon
  const pIn = pct(AT.shipIn, T), pOut = pct(AT.shipIn + SHIP_DUR, T);
  css.push(`@keyframes ship{0%{transform:translate(${SHIP_X0}px,0)}${pIn}{transform:translate(${SHIP_X0}px,0);animation-timing-function:steps(${SHIP_STEPS},end)}${pOut}{transform:translate(${SHIP_X1}px,0)}100%{transform:translate(${SHIP_X1}px,0)}}`);
  css.push(`.ship{transform:translate(${shipAt(REST)}px,0);animation:ship ${T}s linear infinite}`);
  css.push('@media (prefers-reduced-motion:reduce){*{animation:none!important}}');
}

const sceneVis = stepVis([[AT.take, restoreAt(PR1)]]);
const glyphDefs = [...glyphIds].map(([ch, id]) => `<path id="${id}" d="${glyphPath(FONT.get(ch))}"/>`).join('');
const TITLE = 'CASTAWAY: Island Setup Utility';
const DESC = 'An 80 by 25 navy firmware setup screen titled CASTAWAY Island Setup Utility. A red bar walks a two-column menu of island settings and picks Save and Exit to Island; the main panel is then taken over by the island itself: CAST and AWAY in big orange-to-pink block letters either side of a palm that used to be the menu divider, a woman with headphones nodding on the sand, and a ship crossing the horizon exactly while she drinks from a coconut.';
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VBW} ${VBH}" width="${VBW}" height="${VBH}" role="img" aria-labelledby="t d">`
  + `<title id="t">${TITLE}</title><desc id="d">${DESC}</desc>`
  + `<style>${css.join('')}</style>`
  + `<defs>${glyphDefs}${patternDefs}<clipPath id="pc"><rect width="${PW}" height="${PH}"/></clipPath></defs>`
  + `<rect width="${VBW}" height="${VBH}" rx="12" fill="#0E0F18"/>`
  + `<rect x="0.5" y="0.5" width="${VBW - 1}" height="${VBH - 1}" rx="11.5" fill="none" stroke="#2C3042"/>`
  + `<g transform="translate(${PAD} ${PAD})">`
  + layers.screen.join('')
  // The island only exists while the takeover is on; crisp edges keep its colour bars seamless
  // when the README scales the picture.
  + `<g transform="translate(${PX} ${PY})"><g clip-path="url(#pc)" shape-rendering="crispEdges" class="${sceneVis}">${scene.join('')}</g></g>`
  + layers.covers.join('')
  + layers.bars.join('')
  + layers.frame.join('')
  + layers.top.join('')
  + `</g></svg>\n`;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, svg);
console.log(`${path.relative(process.cwd(), OUT)}  ${(svg.length / 1024).toFixed(1)} KB  ${glyphIds.size} glyphs  ${PAL.length} colours  loop ${T}s`);
