#!/usr/bin/env node
// Castaway as a twin-panel DOS file manager: two blue panels in double-line frames, a cyan
// cursor bar that steps down the list one row at a time, a command line and an F-key bar.
// (Style reference: the orthodox file managers of the late 80s and 90s on MS-DOS and their
// clones. No product name, logo or exact string is borrowed: the program on screen is invented.)
//
// Regenerate:  node examples/castaway/src/69-twin-panel-commander_opus_5.5.mjs
//
// The left panel is C:\ISLAND, where everything on the island is a file: ship.pas, crab.hat,
// drone.arj, her.nod. The durations and tiers in it are the real ones from activities.toml.
// The right panel is a Quick View that draws the file under the cursor as a half-block
// text-mode picture of the island, and acts it out.
//
// Plain Node, no dependencies, fully deterministic (no clock, no randomness). The screen is a
// real 80 x 30 text mode (VGA, 640 x 480) of 8 x 16 cells in the 16 text colours. One palette
// register is redefined (attribute 5, magenta, becomes a peach skin tone), which VGA allowed
// and plenty of DOS programs did. Every character is a <use> of a glyph path from the bitmap
// font below (never <text>). Pictures are half-block "pixels": half a cell, 8 x 8.
// Animation is CSS only and every change is a hard step, like a text screen being rewritten.
// One loop is 60 s: the length of the Castaway theme, 20 bars of 3 s at 80 BPM.
//
// The resting state of the file (what you see with animation off, or under
// prefers-reduced-motion) is t = 30 s: she sips a coconut while ship.pas, selected in yellow,
// sails past behind her.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '69-twin-panel-commander_opus_5.5';
const OUT = path.join(HERE, '..', 'assets', `${SLUG}.svg`);

// ---------------------------------------------------------------------------------------------
// Screen geometry
// ---------------------------------------------------------------------------------------------
const COLS = 80, ROWS = 30, CW = 8, CH = 16, PAD = 14;
const SW = COLS * CW, SH = ROWS * CH;
const VBW = SW + PAD * 2, VBH = SH + PAD * 2;

// The 16 text colours (class name -> hex). 'p' is attribute 5 with its DAC register redefined.
const INK = {
  k: '#000000', b: '#0000AA', g: '#00AA00', t: '#00AAAA', r: '#AA0000', p: '#FFAA75', o: '#AA5500', l: '#AAAAAA',
  d: '#555555', lb: '#5555FF', lg: '#55FF55', lc: '#55FFFF', lr: '#FF5555', lm: '#FF55FF', y: '#FFFF55', w: '#FFFFFF',
};
// One-letter codes for pixel maps.
const PX = { k: 'k', b: 'b', g: 'g', t: 't', r: 'r', p: 'p', o: 'o', l: 'l', d: 'd', B: 'lb', G: 'lg', c: 'lc', R: 'lr', M: 'lm', y: 'y', w: 'w' };

// ---------------------------------------------------------------------------------------------
// 8x16 bitmap font in the manner of the VGA ROM. Rows are '#'/'.' strings, placed from row
// `top` of the cell. Capitals sit on rows 2-11 with 2-pixel stems; lowercase x-height is row 5.
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
  '(': [2, '....##. ...##.. ..##... ..##... ..##... ..##... ..##... ..##... ...##.. ....##.'],
  ')': [2, '.##.... ..##... ...##.. ...##.. ...##.. ...##.. ...##.. ...##.. ..##... .##....'],
  '[': [2, '.####.. .##.... .##.... .##.... .##.... .##.... .##.... .##.... .##.... .####..'],
  ']': [2, '.####.. ...##.. ...##.. ...##.. ...##.. ...##.. ...##.. ...##.. ...##.. .####..'],
  '<': [3, '....##. ...##.. ..##... .##.... ##..... .##.... ..##... ...##.. ....##.'],
  '>': [3, '.##.... ..##... ...##.. ....##. .....## ....##. ...##.. ..##... .##....'],
  '*': [5, '.##..##. ..####.. ######## ..####.. .##..##.'],
  '+': [5, '...##... ...##... .######. ...##... ...##...'],
  '=': [6, '.######. ........ ........ .######.'],
  '%': [4, '##....#. ##...##. ....##.. ...##... ..##.... .##..... ##...##. #....##.'],
  '~': [2, '.###.## ##.###.'],
  '♪': [3, '...##... ...###.. ...####. ...##.##. ...##..#. ...##... ...##... .####... #####... .###....'],
  '►': [3, '#....... ##...... ###..... ####.... #####... ####.... ###..... ##...... #.......'],
  '◄': [3, '....#... ...##... ..###... .####... #####... .####... ..###... ...##... ....#...'],
  '·': [7, '...##... ...##...'],
  '→': [5, '....##.. .....##. ######## .....##. ....##..'],
  '☼': [3, '...##... ##.##.## .######. .##..##. ###..### .##..##. .######. ##.##.## ...##...'],
};
for (const [ch, [top, rows]] of Object.entries(PUNCT)) def(ch, top, rows);
FONT.set(' ', new Array(16).fill(0));
FONT.set('│', new Array(16).fill(0x18));
FONT.set('█', new Array(16).fill(0xFF));
// Light shade, drawn as a 2-pixel checker rather than the ROM's 1-pixel one: a README scales
// the picture by about 1.3, and a 1-pixel checker turns to moire at that size.
FONT.set('░', Array.from({ length: 16 }, (_, y) => ((y >> 1) % 2 ? 0x33 : 0xCC)));

// Bitmap -> compact path (greedy merge of horizontal runs into rectangles).
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
// Drawing helpers. Text is addressed in character cells (row, column).
// ---------------------------------------------------------------------------------------------
function text(r, c, str) {
  if (r < 0 || r >= ROWS || c < 0 || c + len(str) > COLS) throw new Error(`off screen at ${r},${c}: "${str}"`);
  let out = '';
  for (const ch of str) {
    if (ch !== ' ') out += `<use href="#${gid(ch)}" x="${c * CW}" y="${r * CH}"/>`;
    else gid(' ');
    c++;
  }
  return out;
}
const ink = (cls, inner) => (inner ? `<g class="${cls}">${inner}</g>` : '');
function seg(r, c, parts) {
  let out = '';
  for (const [str, cls] of parts) { out += ink(cls, text(r, c, str)); c += len(str); }
  return out;
}
const cells = (cls, r, c, w, h = 1) => `<rect class="${cls}" x="${c * CW}" y="${r * CH}" width="${w * CW}" height="${h * CH}"/>`;
const pad = (s, w) => { if (len(s) > w) throw new Error(`too wide (${w}): "${s}"`); return s + ' '.repeat(w - len(s)); };
const centre = (s, w) => { if (len(s) > w) throw new Error(`too wide (${w}): "${s}"`); const l = Math.floor((w - len(s)) / 2); return ' '.repeat(l) + s + ' '.repeat(w - len(s) - l); };

// Pixel maps: an array of strings, one letter per pixel from PX ('.' or ' ' is see-through).
// Drawn as one merged path per colour, `s` screen pixels per map pixel.
function pixels(map, ox, oy, s = 8) {
  const h = map.length, w = Math.max(...map.map((row) => row.length));
  const used = new Set();
  for (const row of map) for (const ch of row) if (PX[ch]) used.add(ch);
  let out = '';
  for (const ch of used) {
    const rows = map.map((row) => (x) => row[x] === ch);
    out += `<path class="${PX[ch]}" d="${bitmapPath(rows, w, s, s, ox, oy)}"/>`;
  }
  void h;
  return out;
}

// Double-line frame round cells (r0, c0)-(r1, c1), in VGA ROM geometry: horizontals are one
// scanline (rows 5 and 7 of the cell), verticals two pixels wide (columns 1-2 and 4-5).
function ring(x0, y0, x1, y1) {
  const w = x1 - x0, h = y1 - y0;
  return `M${x0} ${y0}h${w}v1h${-w}zM${x0} ${y1 - 1}h${w}v1h${-w}zM${x0} ${y0}h2v${h}h-2zM${x1 - 2} ${y0}h2v${h}h-2z`;
}
function dframe(cls, r0, c0, r1, c1) {
  return `<path class="${cls}" d="${ring(c0 * CW + 1, r0 * CH + 5, c1 * CW + 6, r1 * CH + 8)}${ring(c0 * CW + 4, r0 * CH + 7, c1 * CW + 3, r1 * CH + 6)}"/>`;
}
// A single-line divider across a double frame (the ╟───╢ row), with ┴ joins at `joins`.
function divider(cls, r, c0, c1, joins = []) {
  let d = `M${c0 * CW + 6} ${r * CH + 7}h${(c1 - c0) * CW - 5}v1h${-((c1 - c0) * CW - 5)}z`;
  for (const c of joins) d += `M${c * CW + 3} ${r * CH}h2v8h-2z`;
  return `<path class="${cls}" d="${d}"/>`;
}

// ---------------------------------------------------------------------------------------------
// Timeline. One loop of T seconds = the 60-second theme: 20 bars of 3 s, 4 beats of 0.75 s.
// ---------------------------------------------------------------------------------------------
const T = 60, BAR = 3, BEAT = 0.75;
const REST = 30; // the frame the file rests on when nothing animates

const css = [];
const pct = (t) => `${+((100 * t) / T).toFixed(4)}%`;
const kfCache = new Map();
let animN = 0;
// A class that steps the CSS property `prop` through `changes` ([[t, value], ...], from t = 0).
function track(prop, changes, fmt = (v) => v) {
  const ch = [];
  for (const [t, v] of [...changes].sort((a, b) => a[0] - b[0])) {
    if (t < 0 || t >= T) throw new Error(`change outside the loop: ${t}`);
    if (ch.length && ch[ch.length - 1][0] === t) ch[ch.length - 1][1] = v;
    else if (!ch.length || ch[ch.length - 1][1] !== v) ch.push([t, v]);
  }
  if (!ch.length || ch[0][0] !== 0) throw new Error(`track for ${prop} must start at t = 0`);
  const at = (t) => { let v = ch[0][1]; for (const [a, x] of ch) if (a <= t) v = x; return v; };
  const kf = ch.length > 1 ? ch.map(([t, v]) => `${pct(t)}{${prop}:${fmt(v)}}`).join('') + `100%{${prop}:${fmt(ch[0][1])}}` : '';
  const key = `${prop}|${kf}|${fmt(at(REST))}`;
  if (kfCache.has(key)) return kfCache.get(key);
  const name = `a${(animN++).toString(36)}`;
  css.push(kf
    ? `@keyframes ${name}{${kf}}.${name}{${prop}:${fmt(at(REST))};animation:${name} ${T}s step-end infinite}`
    : `.${name}{${prop}:${fmt(at(REST))}}`);
  kfCache.set(key, name);
  return name;
}
// Visible during the given [from, to) intervals.
function vis(intervals) {
  const iv = intervals.filter(([a, b]) => b > a);
  const on = (t) => iv.some(([a, b]) => t >= a && t < b);
  const pts = new Set([0]);
  for (const [a, b] of iv) { if (a > 0 && a < T) pts.add(a); if (b < T) pts.add(b); }
  return track('opacity', [...pts].map((t) => [t, on(t) ? 1 : 0]));
}
const show = (intervals, inner) => (inner ? `<g class="${vis(intervals)}">${inner}</g>` : '');
// Moves its content through positions [[t, dx, dy], ...] (screen pixels), hard cuts only.
const moveCls = (steps) => track('transform', steps.map(([t, x, y]) => [t, `${x},${y}`]), (v) => { const [x, y] = v.split(','); return `translate(${x}px,${y}px)`; });
const fillCls = (changes) => track('fill', changes);
// Short repeating cycles (a beat, a bar): `n` frames of `dur` seconds each.
const cycles = new Map();
function cycle(n, dur, k) {
  const name = `c${n}_${String(dur).replace('.', '_')}_${k}`;
  if (!cycles.has(name)) {
    const a = (100 * k) / n, b = (100 * (k + 1)) / n;
    const kf = `${k ? `0%{opacity:0}${+a.toFixed(3)}%{opacity:1}` : '0%{opacity:1}'}${b < 100 ? `${+b.toFixed(3)}%{opacity:0}` : ''}100%{opacity:${k === n - 1 ? 1 : 0}}`;
    cycles.set(name, `@keyframes ${name}{${kf}}.${name}{opacity:${k ? 0 : 1};animation:${name} ${+(n * dur).toFixed(4)}s step-end infinite}`);
  }
  return name;
}

const layers = [];
const defs = [];

// ---------------------------------------------------------------------------------------------
// The screen: black, as DOS left it.
// ---------------------------------------------------------------------------------------------
layers.push(cells('k', 0, 0, COLS, ROWS));

// ---------------------------------------------------------------------------------------------
// Rows 0-6: the user screen above the panels. A text-mode logo in half-block pixels (each
// pixel is half a cell, so every cell holds at most two colours, as ▀ and ▄ allow), then the
// pitch and the two commands that matter.
// ---------------------------------------------------------------------------------------------
{
  const LOGO = {
    C: ['.#####.', '#######', '##...##', '##.....', '##.....', '##...##', '#######', '.#####.'],
    A: ['.#####.', '#######', '##...##', '##...##', '#######', '#######', '##...##', '##...##'],
    S: ['.######', '#######', '##.....', '######.', '.######', '.....##', '#######', '######.'],
    T: ['#######', '#######', '..###..', '..###..', '..###..', '..###..', '..###..', '..###..'],
    W: ['##...##', '##...##', '##...##', '##.#.##', '#######', '#######', '###.###', '##...##'],
    Y: ['##...##', '##...##', '##...##', '#######', '.#####.', '..###..', '..###..', '..###..'],
  };
  const word = 'CASTAWAY';
  const H = 8, LW = 7, GAP = 1;
  const width = word.length * (LW + GAP) - GAP;
  const mask = Array.from({ length: H }, () => Array(width + 1).fill(false));
  [...word].forEach((ch, i) => LOGO[ch].forEach((row, y) => [...row].forEach((v, x) => { if (v === '#') mask[y][i * (LW + GAP) + x] = true; })));
  // Colour by pixel row: a white-hot top edge, sunny yellow, one dithered row, coral below
  // (her tank top), and a dark red extrusion one pixel down and right.
  const rowInk = (x, y) => ['w', 'y', 'y', 'y', (x % 2 ? 'y' : 'R'), 'R', 'R', 'R'][y];
  const map = Array.from({ length: H + 1 }, () => Array(width + 1).fill('.'));
  for (let y = 0; y < H; y++) for (let x = 0; x < width; x++) {
    if (mask[y][x]) map[y][x] = rowInk(x, y);
    else if ((y > 0 && x > 0 && mask[y - 1][x - 1])) map[y][x] = 'r';
  }
  for (let x = 1; x <= width; x++) if (mask[H - 1][x - 1]) map[H][x] = 'r';
  for (let y = 1; y < H; y++) if (mask[y - 1][width - 1]) map[y][width] = 'r';
  const c0 = Math.floor((COLS - width - 1) / 2);
  layers.push(pixels(map.map((r) => r.join('')), c0 * CW, 8));

  const tag = 'Ten hours on one tiny island. She idles. Every so often, something happens.';
  layers.push(ink('l', text(5, Math.floor((COLS - len(tag)) / 2), tag)));
  const run = [['python tools/serve.py', 'w'], [' → ', 'l'], ['http://127.0.0.1:8765/', 'lc'], ['   ·   ', 'd'], ['every sound made of code', 'y']];
  const runLen = run.reduce((n, [s]) => n + len(s), 0);
  layers.push(seg(6, Math.floor((COLS - runLen) / 2), run));
}

// ---------------------------------------------------------------------------------------------
// The panels: rows 7-27. Left = C:\ISLAND in Full mode, right = Quick View.
// ---------------------------------------------------------------------------------------------
const P0 = 7, P1 = 27;            // panel top and bottom border rows
const LIST0 = 9, LISTN = 16;      // first list row, rows in the list
const SEP = 25, STAT = 26;        // divider row, status row
const LC0 = 0, LC1 = 39, RC0 = 40, RC1 = 79;
const RULES = [13, 25];           // the two column rules in the left panel
layers.push(cells('b', P0, 0, COLS, P1 - P0 + 1));
layers.push(dframe('lc', P0, LC0, P1, LC1) + dframe('lc', P0, RC0, P1, RC1));
layers.push(divider('lc', SEP, LC0, LC1, RULES) + divider('lc', SEP, RC0, RC1));
layers.push(ink('lc', RULES.map((c) => Array.from({ length: SEP - 8 }, (_, i) => text(8 + i, c, '│')).join('')).join('')));
layers.push(ink('y', text(8, 1, centre('Name', 12)) + text(8, 14, centre('Lasts', 11)) + text(8, 26, centre('Tier', 13))));

// The island, as a directory. Durations and tiers are activities.toml's own.
// [name, ext, lasts, tier, status line]
const DIRS = {
  ISLAND: [
    ['..', '', 'up', '', 'the rest of the world'],
    ['PALM', '', 'dir', '', 'one tall palm. climbable'],
    ['RAFT', '', 'dir', '', 'a raft. not leaving yet'],
    ['SEA', '', 'dir', '', 'bottles go here, briefly'],
    ['bottle', 'msg', '1:17-2:17', 'occasional', 'message_in_bottle'],
    ['coconut', 'sip', '0:27-0:51', 'regular', 'coconut_sip'],
    ['crab', 'hat', '1:11-2:42', 'occasional', 'coconut_crab'],
    ['drone', 'arj', '0:39-0:57', 'rare', 'delivery_drone'],
    ['efoil', 'bro', '0:30-0:51', 'rare', 'efoil_bro'],
    ['her', 'nod', 'the rest', 'between', 'idle: about two thirds'],
    ['kumara', 'grw', '0:04', 'chained', 'kumara_leafs, hours on'],
    ['leave', 'any', '1:19-1:59', 'super rare', 'leave_any_time'],
    ['sandcast', 'le', '0:57-1:54', 'regular', 'sandcastle'],
    ['shark', 'nod', '0:49-1:17', 'rare', 'shark_nod'],
    ['ship', 'pas', '1:30-2:30', 'occasional', 'ship_passes_unseen'],
    ['turtle', 'vst', '3:13-6:06', 'occasional', 'turtle_visit'],
  ],
  PALM: [
    ['..', '', 'up', '', 'back down to the sand'],
    ['TOP', '', 'dir', '', 'the very top. signal?'],
    ['cat', 'zzz', '11:04-26:46', 'rare', 'cat_visit: naps up here'],
    ['coconut', '1', 'hanging', 'gravity', 'hanging on. for now'],
    ['coconut', '2', 'hanging', 'gravity', 'hanging on. for now'],
  ],
  TOP: [
    ['..', '', 'up', '', 'back down the palm'],
    ['signal', 'bar', '1:54-4:10', 'rare', 'signal_hunt: 1 bar'],
  ],
};
DIRS.ISLAND_NO_BOTTLE = DIRS.ISLAND.filter(([n]) => n !== 'bottle');
const nameCol = ([n, e]) => (e ? pad(n, 9) + e : n);
const rowText = (f) => {
  const [, , lasts, tier] = f;
  const mid = lasts === 'dir' ? '►SUB-DIR◄' : lasts === 'up' ? '►UP--DIR◄' : lasts;
  return { name: pad(nameCol(f), 12), lasts: centre(mid, 11), tier: pad(tier ? ` ${tier}` : '', 13) };
};
const statusText = (f) => pad(`${pad(nameCol(f), 12)} ${f[4]}`, 38);

// Where the cursor is: [time, directory, row]. Home, Enter, arrows: one keystroke per step.
const NAV = [
  [0, 'ISLAND', 9],                                    // her.nod: idling
  [6.0, 'ISLAND', 0], [6.375, 'ISLAND', 1],            // Home, down to PALM
  [7.125, 'PALM', 0], [7.5, 'PALM', 1],                // Enter, down to TOP
  [8.25, 'TOP', 0], [8.625, 'TOP', 1],                 // Enter, down to signal.bar
  [12.0, 'TOP', 0], [12.375, 'PALM', 1], [12.75, 'PALM', 0], [13.125, 'ISLAND', 1],
  [13.5, 'ISLAND', 2], [13.875, 'ISLAND', 3], [14.25, 'ISLAND', 4], // RAFT, SEA, bottle.msg
  [19.5, 'ISLAND_NO_BOTTLE', 4],                       // moved to SEA: the list closes up
  [21.0, 'ISLAND', 5],                                 // ...and it washes straight back
  [36.0, 'ISLAND', 6],                                 // crab.hat
  [42.0, 'ISLAND', 7],                                 // drone.arj
  [48.0, 'ISLAND', 8], [48.375, 'ISLAND', 9], [48.75, 'ISLAND', 10], [49.125, 'ISLAND', 11], [49.5, 'ISLAND', 12], [49.875, 'ISLAND', 13],
  [57.0, 'ISLAND', 12], [57.375, 'ISLAND', 11], [57.75, 'ISLAND', 10], [58.125, 'ISLAND', 9],
];
const navAt = (t) => { let s = NAV[0]; for (const n of NAV) if (n[0] <= t) s = n; return s; };
const navEnd = (i) => (i + 1 < NAV.length ? NAV[i + 1][0] : T);
// Files selected (yellow): something running in its own lane while the cursor is elsewhere.
const SELECT = [
  ['ISLAND', 4, 21.0, 24.0],   // bottle.msg, just washed back
  ['ISLAND', 14, 27.0, 36.0],  // ship.pas, in lane sea_sky, while she sips
];
const KEY_TIMES = [...new Set([...NAV.map((n) => n[0]), ...SELECT.flatMap((s) => [s[2], s[3]])])].filter((t) => t < T).sort((a, b) => a - b);
const dirIntervals = (dir) => NAV.map((n, i) => [n, i]).filter(([n]) => n[1] === dir).map(([n, i]) => [n[0], navEnd(i)]);

// The cursor bar: one cyan row with black column rules, moved a row at a time.
{
  const steps = NAV.map(([t, , row]) => [t, 0, row * CH]);
  layers.push(`<g class="${moveCls(steps)}">${cells('t', LIST0, 1, 38)}${ink('k', RULES.map((c) => text(LIST0, c, '│')).join(''))}</g>`);
}
// The listings. Each row's colour steps between light cyan, black (under the cursor) and
// yellow (selected).
for (const dir of ['ISLAND', 'ISLAND_NO_BOTTLE', 'PALM', 'TOP']) {
  let out = '';
  DIRS[dir].forEach((f, i) => {
    const sel = (t) => SELECT.some(([d, r, a, b]) => d === dir && r === i && t >= a && t < b);
    const colour = (t) => {
      const [, d, row] = navAt(t);
      const cur = d === dir && row === i;
      if (sel(t)) return INK.y;
      return cur ? INK.k : INK.lc;
    };
    const fc = fillCls(KEY_TIMES.map((t) => [t, colour(t)]));
    const { name, lasts, tier } = rowText(f);
    out += `<g class="${fc}">${text(LIST0 + i, 1, name)}${text(LIST0 + i, 14, lasts)}${text(LIST0 + i, 26, tier)}</g>`;
  });
  layers.push(show(dirIntervals(dir), out));
}
// Status line: the file under the cursor and its activity id; selected files in yellow.
{
  const groups = new Map();
  NAV.forEach(([t, dir, row], i) => {
    const key = `${dir}|${row}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push([t, navEnd(i)]);
  });
  const sels = [
    [21.0, 24.0, 'bottle.msg washed straight back'],
    [27.0, 36.0, 'ship.pas runs in lane sea_sky'],
  ];
  const cut = (iv) => iv.flatMap(([a, b]) => {
    let parts = [[a, b]];
    for (const [s0, s1] of sels) parts = parts.flatMap(([x, y]) => (s1 <= x || s0 >= y ? [[x, y]] : [[x, Math.min(y, s0)], [Math.max(x, s1), y]]));
    return parts.filter(([x, y]) => y > x);
  });
  let out = '';
  for (const [key, iv] of groups) {
    const [dir, row] = key.split('|');
    out += show(cut(iv), text(STAT, 1, statusText(DIRS[dir][+row])));
  }
  layers.push(ink('lc', out));
  layers.push(ink('y', sels.map(([a, b, s]) => show([[a, b]], text(STAT, 1, pad(` ${s}`, 38)))).join('')));
}
// The active panel's path, black on cyan in the top border, and the same path at the prompt.
{
  const PATHS = { ISLAND: 'C:\\ISLAND', ISLAND_NO_BOTTLE: 'C:\\ISLAND', PALM: 'C:\\ISLAND\\PALM', TOP: 'C:\\ISLAND\\PALM\\TOP' };
  const byPath = new Map();
  for (const dir of Object.keys(PATHS)) {
    const p = PATHS[dir];
    if (!byPath.has(p)) byPath.set(p, []);
    byPath.get(p).push(...dirIntervals(dir));
  }
  let title = '', prompt = '';
  css.push(`@keyframes bl{0%{opacity:1}50%{opacity:0}}.bl{animation:bl ${BEAT}s step-end infinite}`);
  for (const [p, iv] of byPath) {
    const s = ` ${p} `, c = Math.floor((40 - len(s)) / 2);
    title += show(iv, cells('t', P0, c, len(s)) + ink('k', text(P0, c, s)));
    const pr = `${p}>`;
    prompt += show(iv, ink('l', text(28, 0, pr)) + `<rect class="l bl" x="${len(pr) * CW}" y="${28 * CH + 13}" width="${CW}" height="2"/>`);
  }
  layers.push(title, prompt);
}

// ---------------------------------------------------------------------------------------------
// The Quick View panel: a 38 x 34 half-block picture of the island, and a caption row.
// ---------------------------------------------------------------------------------------------
const QX = (RC0 + 1) * CW, QY = (P0 + 1) * CH;   // picture origin, screen pixels
const PW = 38, PH = 34, HORIZON = 10;
const PS = 8;                                    // a half-block pixel is 8 x 8
defs.push(`<clipPath id="qv"><rect x="${QX}" y="${QY}" width="${PW * PS}" height="${PH * PS}"/></clipPath>`);

// A tiny seeded PRNG for the sea's chop (mulberry32), so the picture is the same every run.
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

const ISLE = { cx: 18, cy: 24.5, rx: 11, ry: 3.3 };
const inIsle = (x, y, grow = 0) => ((x + 0.5 - ISLE.cx) / (ISLE.rx + grow)) ** 2 + ((y + 0.5 - ISLE.cy) / (ISLE.ry + grow * 0.45)) ** 2 <= 1;
const trunkX = (y) => 22 + Math.round(5 * Math.max(0, (24 - y) / 19) ** 1.6);
const CROWN = { x: 27, y: 4 };
const SPOT = { x: 9, y: 17 }; // where she stands, sprite top-left: feet on the sand at y = 24
const blank = () => Array.from({ length: PH }, () => Array(PW).fill('.'));
const stamp = (m, map, x0, y0) => map.forEach((row, dy) => [...row].forEach((ch, dx) => {
  const x = x0 + dx, y = y0 + dy;
  if (ch !== '.' && ch !== ' ' && x >= 0 && x < PW && y >= 0 && y < PH) m[y][x] = ch;
}));
const rows = (m) => m.map((r) => r.join(''));

const BASE = (() => {
  const rand = rng(1992);
  const g = blank();
  // Sky: deep at the top, pale towards the horizon. Sea: deep far out, turquoise near.
  for (let y = 0; y < PH; y++) for (let x = 0; x < PW; x++) {
    if (y < HORIZON) g[y][x] = y < 4 ? 'B' : 'c';
    else if (y < 13) g[y][x] = 'b';
    else g[y][x] = 't';
  }
  // Chop: short dashes, deep blue and white far out, light cyan glints close in.
  for (let y = HORIZON; y < PH; y++) {
    for (let x = 0; x < PW;) {
      const r = rand();
      const n = 1 + Math.floor(rand() * 3);
      let ch = null;
      if (y < 13) ch = r < 0.16 ? 'B' : r < 0.22 ? 't' : null;
      else if (y < 15) ch = r < 0.45 ? 'b' : r < 0.5 ? 'w' : null;
      else if (y < 18) ch = r < 0.12 ? 'b' : r < 0.18 ? 'w' : null;
      else ch = r < 0.07 ? 'b' : r < 0.13 ? 'c' : r < 0.16 ? 'w' : null;
      if (ch) for (let k = 0; k < n && x + k < PW; k++) g[y][x + k] = ch;
      x += n + 1 + Math.floor(rand() * 3);
    }
  }
  // Cumulus banks sitting on the horizon, white with grey undersides.
  stamp(g, ['..ww.....', '.wwww.ww.', 'wwwwwwwwww', 'llwwlllwll'], 0, 4);
  stamp(g, ['....ww.ww...', '..wwwwwwww..', '.wwwwwwwwwww', 'llllwwllllll'], 26, 4);
  // The sun. Always daytime.
  stamp(g, ['.yy.', 'yyyy', 'yyyy', '.yy.'], 2, 0);
  // Shallows round the island, then the sand with a brown wet rim on the near side.
  for (let y = HORIZON + 1; y < PH; y++) for (let x = 0; x < PW; x++) {
    if (!inIsle(x, y) && inIsle(x, y, 2.2)) g[y][x] = 'c';
  }
  for (let y = 0; y < PH; y++) for (let x = 0; x < PW; x++) {
    if (inIsle(x, y)) g[y][x] = inIsle(x, y + 1) ? 'y' : 'o';
  }
  // Green scrub between where she stands and the palm, and two grey rocks in the surf.
  stamp(g, ['..G.G..', '.GgGgG.', 'GgggGgG', '.g.gg.g'], 13, 20);
  stamp(g, ['ll', 'dd'], 12, 26);
  stamp(g, ['l', 'd'], 21, 27);
  // The raft, off the right shore: lashed logs.
  stamp(g, ['.oRoRoR', 'RoRoRo.', 'rrrrrr.'], 31, 22);
  return g;
})();

// The palm: a slender segmented trunk leaning right, and a crown of drooping fronds.
const PALM = (() => {
  const m = blank();
  for (let y = CROWN.y + 1; y <= 24; y++) {
    const x = trunkX(y);
    m[y][x] = 'o';
    m[y][x + 1] = y % 2 ? 'r' : 'o';
  }
  stamp(m, [
    '........GGGG.........',
    '.....GGGGggGGGGG.....',
    '...GGGGg.GG.gGGGGG...',
    '.GGGgg..GGGG...ggGGG.',
    'GGg....gG.oo.Gg...gGG',
    'Gg....gg..oo..gg...gG',
    'g....gg........gg...g',
    '....g............g...',
  ], CROWN.x - 10, CROWN.y - 4);
  return m;
})();

// The static picture, clipped to the panel. Shore waves on top: a ring of foam just off the
// sand, two frames, swapped every bar.
{
  layers.push(`<g clip-path="url(#qv)">${pixels(rows(BASE), QX, QY)}</g>`);
  const foam = (k) => {
    const m = blank();
    for (let y = HORIZON + 1; y < PH; y++) for (let x = 0; x < PW; x++) {
      if (!inIsle(x, y) && inIsle(x, y, k ? 1.3 : 0.8) && BASE[y][x] === 'c' && (x + y + k) % 2 === 0) m[y][x] = 'w';
    }
    return pixels(rows(m), QX, QY);
  };
  layers.push(`<g class="${cycle(2, BAR, 0)}">${foam(0)}</g><g class="${cycle(2, BAR, 1)}">${foam(1)}</g>`);
}

// Sprites. Each is a pixel map; `put` places one at picture coordinates (x, y).
const put = (map, x, y) => pixels(map, QX + x * PS, QY + y * PS);
const SPR = {
  // her: brown hair in a low bun, cream headphones, coral tank top, cream shorts, bare feet.
  // Three-quarter view, facing left: the near ear cup and the bun are on the right.
  idleUp: ['.ooo.', '.ppwo', '.pp..', '.RRR.', 'pRRRp', '.www.', '.p.p.', '.p.p.'],
  idleDown: ['.....', '.ooo.', '.ppwo', '.RRR.', 'pRRRp', '.www.', '.p.p.', '.p.p.'],
  sip: ['.ooo.', 'GGpwo', 'GGp..', 'pRRR.', '.RRRp', '.www.', '.p.p.', '.p.p.'],
  sipRest: ['.ooo.', '.ppwo', '.pp..', 'GGRR.', 'GGRRp', '.www.', '.p.p.', '.p.p.'],
  holdBottle: ['.ooo.', '.ppwo', '.pp..', '.RRR.', 'pRRRp', 'gwww.', 'gp.p.', '.p.p.'],
  throwUp: ['g....', 'p....', 'pooo.', '.ppwo', '.pp..', '.RRR.', '.RRRp', '.www.', '.p.p.', '.p.p.'],
  thrown: ['.....', 'p....', 'pooo.', '.ppwo', '.pp..', '.RRR.', '.RRRp', '.www.', '.p.p.', '.p.p.'],
  climb: ['.oo.', '.ppw', '.RRp', 'pRRp', '.ww.', '.p.p', 'p...'],
  top: ['k....', 'p.ooo', 'p.ppw', '.pRRR', '..RRR'],
  // the signal bubble: three bars, one of them lit
  signal: ['.wwwwwww.', 'wwwwwwdww', 'wwwwdwdww', 'wwwwdwdww', '.wwwwwww.', '......ww.', '........w'],
  signalBar: ['G'],
  ship: ['...kk....', '.wkwkwkw.', 'rrrrrrrrr'],
  crab: ['R.R', 'rrr'],
  coconut: ['oy', 'oo'],
  crabHatA: ['.oy.', 'oooo', 'R..R'],
  crabHatB: ['.oy.', 'oooo', '.RR.'],
  bonk: ['.w.', 'w.w', '.w.'],
  droneA: ['l.l.l', '.ddd.'],
  droneB: ['d.d.d', '.ddd.'],
  parcel: ['oyo', 'ooo'],
  parcelOpen: ['w.w', 'oyo', 'ooo'],
  bottle: ['gw'],
  splash: ['w.w', '.w.'],
  fin: ['.l', 'll'],
  sharkUp: ['..www..', '.wlllw.', 'wlklklw', '.lwwwl.', '.lllll.'],
  cloudA: ['.www..', 'wwwwww'],
  cloudB: ['.ww.', 'wwww'],
};
const qv = [];          // behind the palm
const front = [];       // in front of the palm

// Drifting clouds: a 40-pixel band moved one pixel every 1.5 s, so it wraps once a loop.
{
  // Phased so that neither cloud is behind the signal bubble (x 15-23) from 9 s to 12 s.
  const band = put(SPR.cloudA, 22, 1) + put(SPR.cloudB, 34, 2);
  const steps = Array.from({ length: 40 }, (_, i) => [i * 1.5, i * PS, 0]);
  qv.push(`<g class="${moveCls(steps)}">${band}<g transform="translate(${-40 * PS} 0)">${band}</g></g>`);
}
// The ship (lane sea_sky): along the horizon from left to right, one pixel every 3/16 s,
// starting on the bar after she gets busy. It passes behind the palm.
const SHIP = [27.0, 36.0];
{
  const n = 48, x0 = -9;
  const steps = [[0, x0 * PS, 0]];
  for (let i = 0; i < n; i++) steps.push([SHIP[0] + (i * (SHIP[1] - SHIP[0])) / n, (x0 + i) * PS, 0]);
  qv.push(show([SHIP], `<g class="${moveCls(steps)}">${put(SPR.ship, 0, HORIZON - 2)}</g>`));
}
// Bottle: thrown at 16.5 s, splashes, bobs, drifts back to her feet by 21 s.
const BOTTLE = [16.5, 24.0];
{
  const T0 = 16.6875, STEP = 0.1875;
  const arc = [[8, 14], [7, 12], [6, 11], [5, 11]]; // the throw, a step each 3/16 s
  let out = '';
  arc.forEach(([x, y], i) => { out += show([[T0 + i * STEP, T0 + (i + 1) * STEP]], put(SPR.bottle, x, y)); });
  out += show([[T0 + 4 * STEP, T0 + 6 * STEP]], put(SPR.splash, 4, 12));
  // bobbing out at sea, up and down on the beat
  out += show([[T0 + 6 * STEP, 19.5]], `<g class="${cycle(2, BEAT, 0)}">${put(SPR.bottle, 4, 13)}</g><g class="${cycle(2, BEAT, 1)}">${put(SPR.bottle, 4, 14)}</g>`);
  const back = [[4, 16], [4, 18], [5, 20], [6, 22], [7, 23], [8, 24]];
  back.forEach(([x, y], i) => { out += show([[19.5 + i * 0.25, i === back.length - 1 ? BOTTLE[1] : 19.5 + (i + 1) * 0.25]], put(SPR.bottle, x, y)); });
  front.push(out);
}
// The shark (lanes sea_sky and castaway): a fin circles the island, then a head in
// headphones comes up and nods on the beat with her.
const SHARK = { fin: 49.875, up: 54.0, down: 57.75, gone: 58.5 };
{
  const loop = [[34, 14], [29, 13], [23, 12], [16, 12], [9, 13], [3, 14], [1, 18], [1, 23], [4, 30], [11, 31], [19, 31]];
  let out = '';
  loop.forEach(([x, y], i) => {
    const a = SHARK.fin + (i * BEAT) / 2;
    out += show([[a, a + BEAT / 2]], put(SPR.fin, x, y) + put(['w..'], x - 1, y + 1));
  });
  out += show([[SHARK.up, SHARK.down]],
    `<g class="${cycle(2, BEAT / 2, 0)}">${put(SPR.sharkUp, 26, 27)}</g><g class="${cycle(2, BEAT / 2, 1)}">${put(SPR.sharkUp, 26, 28)}</g>` + put(['w.w.w.w.w'], 25, 32));
  out += show([[SHARK.down, SHARK.gone]], put(SPR.fin, 28, 30));
  qv.push(out);
}
qv.push(pixels(rows(PALM), QX, QY));

// Her, by scene. Idle at SPOT, nodding on the beat (head down for the first half of each beat).
const nodding = (x, y) => `<g class="${cycle(2, BEAT / 2, 0)}">${put(SPR.idleDown, x, y)}</g><g class="${cycle(2, BEAT / 2, 1)}">${put(SPR.idleUp, x, y)}</g>`;
const IDLE = [[0, 6.375], [16.875, 24.0], [36.0, T]];
front.push(show(IDLE, nodding(SPOT.x, SPOT.y)));
// Off to the palm and up it, for the signal (hard cuts, as the project's own motion rules say).
front.push(show([[6.375, 7.125]], put(SPR.idleUp, 16, SPOT.y)));
// [from, to, sprite top] on the trunk: four steps up, the top, three steps down.
const CLIMB = [[7.125, 7.5, 17], [7.5, 7.875, 13], [7.875, 8.25, 9], [8.25, 8.625, 6], [12.0, 12.375, 6], [12.375, 12.75, 10], [12.75, 13.125, 14]];
for (const [a, b, y] of CLIMB) front.push(show([[a, b]], put(SPR.climb, trunkX(y + 3) - 2, y)));
front.push(show([[8.625, 12.0]], put(SPR.top, CROWN.x - 3, CROWN.y - 4)));
front.push(show([[9.375, 12.0]], put(SPR.signal, CROWN.x - 12, 0)
  + `<g class="${cycle(2, BEAT / 2, 0)}">${put(SPR.signalBar, CROWN.x - 10, 3)}</g>`));
front.push(show([[13.125, 13.875]], put(SPR.idleUp, 14, SPOT.y)));
front.push(show([[13.875, 16.5]], put(SPR.holdBottle, SPOT.x, SPOT.y)));
front.push(show([[16.5, 16.6875]], put(SPR.throwUp, SPOT.x, SPOT.y - 2)));
front.push(show([[16.6875, 16.875]], put(SPR.thrown, SPOT.x, SPOT.y - 2)));
// The coconut: two beats at her mouth, two beats down, eyes shut throughout.
front.push(show([[24.0, 36.0]], `<g class="${cycle(2, BAR / 2, 0)}">${put(SPR.sip, SPOT.x, SPOT.y)}</g><g class="${cycle(2, BAR / 2, 1)}">${put(SPR.sipRest, SPOT.x, SPOT.y)}</g>`));
// crab.hat: a coconut drops from the crown onto a hermit crab, who walks off wearing it.
const CRAB = { x: 25, y: 23 };
{
  let out = show([[36.0, 38.25]], put(SPR.crab, CRAB.x, CRAB.y + 1));
  const fall = [6, 10, 14, 18, 22];
  fall.forEach((y, i) => { out += show([[37.5 + i * 0.15, 37.5 + (i + 1) * 0.15]], put(SPR.coconut, CRAB.x + 1, y)); });
  out += show([[38.25, 38.625]], put(SPR.crabHatA, CRAB.x, CRAB.y) + put(SPR.bonk, CRAB.x + 3, CRAB.y - 3));
  // ...and walks off towards the water, a step at a time, swapping legs
  const walk = [[0, 0], [1, 0], [2, 1], [3, 1], [4, 2]];
  walk.forEach(([dx, dy], i) => {
    const a = 38.625 + i * 0.675;
    out += show([[a, i === walk.length - 1 ? 42.0 : a + 0.675]], put(i % 2 ? SPR.crabHatB : SPR.crabHatA, CRAB.x + dx, CRAB.y + dy));
  });
  front.push(out);
}
// drone.arj: in from the top right, lowers a parcel by her, leaves. Inside: headphones.
{
  const DX = 17; // the drone's middle is over x = DX + 2
  const fly = [[42.375, 36, 0], [42.75, 29, 2], [43.125, 22, 4], [43.5, DX, 6]];
  let out = '';
  const drone = (x, y) => `<g class="${cycle(2, 0.125, 0)}">${put(SPR.droneA, x, y)}</g><g class="${cycle(2, 0.125, 1)}">${put(SPR.droneB, x, y)}</g>`;
  fly.forEach(([t, x, y], i) => { out += show([[t, i + 1 < fly.length ? fly[i + 1][0] : 45.375]], drone(x, y)); });
  // the parcel goes down on a line, three pixels a step
  for (let i = 0; i < 5; i++) {
    const a = 43.5 + i * 0.3, yP = 8 + i * 3;
    out += show([[a, a + 0.3]], (yP > 8 ? put(Array(yP - 8).fill('l'), DX + 2, 8) : '') + put(SPR.parcel, DX + 1, yP));
  }
  out += show([[45.0, 45.375]], put(Array(14).fill('l'), DX + 2, 8));
  out += show([[45.0, 46.5]], put(SPR.parcel, DX + 1, 22));
  [[45.375, DX + 6, 4], [45.75, DX + 13, 1], [46.125, DX + 20, -1]].forEach(([t, x, y]) => { out += show([[t, t + 0.375]], drone(x, y)); });
  out += show([[46.5, 48.0]], put(SPR.parcelOpen, DX + 1, 21));
  front.push(out);
}
layers.push(`<g clip-path="url(#qv)">${qv.join('')}${front.join('')}</g>`);

// Caption row, under the picture.
{
  const CAP = [
    [0, 'Nodding to the beat. Most of the run.'],
    [6.0, 'No signal down here. Up she goes.'],
    [8.625, 'One bar of signal. At the very top.'],
    [12.0, 'Back down. The bar stays up there.'],
    [14.25, 'A message in a bottle. To the sea.'],
    [16.5, 'Off it goes. Out to sea...'],
    [19.5, '...and back it comes.'],
    [21.0, 'It washed straight back.'],
    [24.0, 'Sipping a coconut. Eyes shut. Busy.'],
    [27.0, 'A ship sails past. She never sees it.'],
    [36.0, 'A coconut. A hermit crab. Gravity.'],
    [38.25, 'He walks off wearing it.'],
    [42.0, 'A parcel, by drone.'],
    [46.5, 'Inside: more headphones.'],
    [48.0, 'Nodding to the beat. Most of the run.'],
    [50.25, 'Something with a fin. Circling.'],
    [54.0, 'A shark in headphones. Same beat.'],
    [58.5, 'Nodding to the beat. Most of the run.'],
  ];
  const byText = new Map();
  CAP.forEach(([t, s], i) => {
    const end = i + 1 < CAP.length ? CAP[i + 1][0] : T;
    if (!byText.has(s)) byText.set(s, []);
    byText.get(s).push([t, end]);
  });
  let out = '';
  for (const [s, iv] of byText) out += show(iv, text(STAT, RC0 + 1, centre(s, 38)));
  layers.push(ink('w', out));
}
// The right panel's title, and a bar counter where a clock would sit: the theme's 20 bars.
{
  const s = ' Quick View ';
  layers.push(cells('b', P0, RC0 + 14, len(s)) + ink('lc', text(P0, RC0 + 14, s)));
  const c = RC1 - 10;
  let out = cells('b', P0, c, 9) + ink('lc', text(P0, c, ' ♪   /20 '));
  for (let i = 0; i < 20; i++) out += show([[i * BAR, (i + 1) * BAR]], ink('lc', text(P0, c + 3, String(i + 1).padStart(2, '0'))));
  layers.push(out);
}

// ---------------------------------------------------------------------------------------------
// F6: the Move dialog, then its progress box. Grey, double frame, and a text-mode drop shadow:
// the cells it falls on keep their characters but turn dark grey on black (attribute 08), so
// the C:\ISLAND listing and the panel's right frame still show through it, dimmed.
// ---------------------------------------------------------------------------------------------
const MOVE = { key: 15.0, go: 16.5, done: 19.5 };
// One row of the C:\ISLAND listing as the 39 characters of columns 0-38 (frame column blank).
const listLine = (row) => {
  const { name, lasts, tier } = rowText(DIRS.ISLAND[row - LIST0]);
  return ` ${name}│${lasts}│${tier}`;
};
function shadow(r, c, w, h) {
  // Two columns down the right side (rows r+1 .. r+h), one row along the bottom (row r+h).
  let out = `<path class="k" d="M${(c + w) * CW} ${(r + 1) * CH}h${2 * CW}v${h * CH}h${-w * CW}v${-CH}h${(w - 2) * CW}z"/>`;
  let dim = '';
  for (let row = r + 1; row <= r + h; row++) {
    const from = row === r + h ? c + 2 : c + w;
    const s = [...listLine(row)].slice(from, Math.min(c + w + 2, LC1)).join('');
    if (s.trim()) dim += text(row, from, s);
  }
  out += ink('d', dim);
  // The panel's right double line (column LC1), where the shadow crosses it.
  if (c + w + 1 >= LC1) {
    const y0 = (r + 1) * CH, hh = h * CH, x = LC1 * CW;
    out += `<path class="d" d="M${x + 1} ${y0}h2v${hh}h-2zM${x + 4} ${y0}h2v${hh}h-2z"/>`;
  }
  return out;
}
function dialog(r, c, w, h, title) {
  let out = shadow(r, c, w, h);
  out += cells('l', r, c, w, h) + dframe('k', r + 1, c + 2, r + h - 2, c + w - 3);
  const tc = c + Math.floor((w - len(title) - 2) / 2);
  out += cells('l', r + 1, tc, len(title) + 2) + ink('k', text(r + 1, tc + 1, title));
  return out;
}
{
  const r = 11, c = 2, w = 36, h = 8;
  let a = dialog(r, c, w, h, 'Move');
  a += seg(r + 2, c + 4, [['M', 'y'], ['ove ', 'k'], ['bottle.msg', 'k'], [' to:', 'k']]);
  a += cells('t', r + 3, c + 4, 28) + ink('k', text(r + 3, c + 4, pad('C:\\ISLAND\\SEA\\', 28).replace(/ /g, '.')));
  a += divider('k', r + 4, c + 2, c + w - 3);
  a += cells('t', r + 5, c + 6, 8) + seg(r + 5, c + 6, [['[ ', 'k'], ['M', 'w'], ['ove ]', 'k']]);
  a += seg(r + 5, c + 20, [['[ ', 'k'], ['C', 'y'], ['ancel ]', 'k']]);
  layers.push(show([[MOVE.key, MOVE.go]], a));

  let b = dialog(r, c, w, h, 'Move');
  b += ink('k', text(r + 2, c + 4, 'Moving bottle.msg') + text(r + 3, c + 4, 'to C:\\ISLAND\\SEA\\'));
  b += ink('d', text(r + 5, c + 4, 'Time left: 1:17-2:17'));
  const BAR_W = 22, n = 8, dt = (MOVE.done - MOVE.go - 0.375) / n;
  b += ink('d', text(r + 4, c + 4, '░'.repeat(BAR_W)));
  for (let i = 1; i <= n; i++) {
    const a0 = MOVE.go + i * dt, a1 = i === n ? MOVE.done : MOVE.go + (i + 1) * dt;
    const k = Math.round((BAR_W * i) / n);
    b += show([[a0, a1]], ink('b', text(r + 4, c + 4, '█'.repeat(k))) + ink('k', text(r + 4, c + 4 + BAR_W + 1, `${Math.round((100 * i) / n)}%`.padStart(4))));
  }
  b += show([[MOVE.go, MOVE.go + dt]], ink('k', text(r + 4, c + 4 + BAR_W + 1, '  0%')));
  layers.push(show([[MOVE.go, MOVE.done]], b));
}

// ---------------------------------------------------------------------------------------------
// Row 29: the key bar. Grey digit on black, black label on cyan. Pressed keys flash white.
// ---------------------------------------------------------------------------------------------
{
  const KEYS = ['Help', 'Nod', 'View', 'Wait', 'Copy', 'Move', 'Plant', 'Tide', 'Climb', 'Leave'];
  // F6 sends the bottle to sea; F9 is pressed as she climbs into PALM, then into TOP.
  const PRESS = { 6: [[MOVE.key, MOVE.key + BEAT / 2]], 9: [[7.125, 7.5], [8.25, 8.625]] };
  let out = '';
  KEYS.forEach((k, i) => {
    const n = String(i + 1), c = i * 8, lw = 8 - len(n);
    out += ink('l', text(29, c, n)) + cells('t', 29, c + len(n), lw) + ink('k', text(29, c + len(n), pad(k, lw)));
    if (PRESS[i + 1]) out += show(PRESS[i + 1], cells('w', 29, c + len(n), lw) + ink('k', text(29, c + len(n), pad(k, lw))));
  });
  layers.push(out);
}

// ---------------------------------------------------------------------------------------------
// Assemble
// ---------------------------------------------------------------------------------------------
css.unshift(Object.entries(INK).map(([k, v]) => `.${k}{fill:${v}}`).join(''));
css.push(...cycles.values());
css.push('@media (prefers-reduced-motion:reduce){*{animation:none!important}}');

const glyphDefs = [...glyphIds].filter(([ch]) => ch !== ' ').map(([ch, id]) => `<path id="${id}" d="${glyphPath(FONT.get(ch))}"/>`).join('');
const TITLE = 'CASTAWAY: C:\\ISLAND in a twin-panel file manager';
const DESC = 'Castaway, a ten-hour lo-fi island video, drawn as a blue twin-panel DOS file manager. The left panel lists the island as files, with durations and tiers from the schedule; the right panel is a Quick View that draws the file under the cursor as a half-block picture of the island and acts it out.';
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VBW} ${VBH}" width="${VBW}" height="${VBH}" role="img" aria-labelledby="t d">`
  + `<title id="t">${TITLE}</title><desc id="d">${DESC}</desc>`
  + `<style>${css.join('')}</style>`
  + `<defs>${glyphDefs}${defs.join('')}</defs>`
  + `<rect width="${VBW}" height="${VBH}" rx="10" fill="#000"/>`
  + `<g transform="translate(${PAD} ${PAD})">${layers.join('')}</g>`
  + `</svg>\n`;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, svg);
console.log(`${path.relative(process.cwd(), OUT)}  ${(svg.length / 1024).toFixed(1)} KB  ${glyphIds.size} glyphs  ${animN} tracks  loop ${T}s`);
