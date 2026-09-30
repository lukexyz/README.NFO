#!/usr/bin/env node
// Blue error screen: README header generator for ULTRA-SATISFACTORY.
//
//   node examples/ultra-satisfactory/src/37-blue-screen_opus_5.5.mjs
//
// Writes, next to this file's ../assets folder:
//   37-blue-screen_opus_5.5.svg        the animated banner (three screens, one loop)
//   37-blue-screen_opus_5.5-dump.svg   the "dump" screen held still, so the QR code can be scanned
//   37-blue-screen_opus_5.5-anykey.svg the Any key: a beige keycap that sits under the banner
//
// The style is the white-on-blue fatal-error text screen of 1990s desktop PCs
// (catalogue entry vap-08). Everything is drawn on a true 80 x 25 text-mode
// grid of 9 x 16 pixel cells (720 x 400), the way that screen was. The wording,
// the font and the art are original: no operating-system name, no vendor text.
//
// Plain Node, no dependencies, fully deterministic (no clock, no randomness).
// There is no <text> anywhere: every letter is a <use> of a glyph path built
// from the 7 x 16 bitmap font below, which was drawn for this file in the
// manner of a PC text-mode ROM font (two-pixel stems, one-pixel bars).
//
// One loop, 34 seconds:
//   A  0.0 s  the fatal-error screen: inverted title bar, the "error" (a belt
//             has backed up), the recovery options (the real links and the two
//             run commands), and "Press any key to continue" with a cursor
//   B 11.2 s  the stop-code dump: the five hex numbers are the app's real
//             counts, and the "storage box dump" that prints row by row is a
//             real QR code for the live app, drawn in half-block characters.
//             Then "Press any key to restart"
//   C 25.3 s  the restart: black screen, the app's own colours, the name in
//             big half-block letters, the three tabs, the roll call of the
//             nine production machines. Then the belt backs up again.
// prefers-reduced-motion freezes it on screen A, which is complete on its own.
// The keycap image runs on the same 34 s clock and is pressed at 9.6 s and
// 23.0 s, just as the banner says "Any key pressed".
//
// Facts on screen were checked against the app's data on 2026-09-30:
//   140 craftable items (0x8C), 211 machine recipes (0xD3), 88 of them
//   alternates (0x58), 477 buildings (0x1DD), 5 Space Elevator phases (0x05);
//   9 production machines: Assembler, Blender, Constructor, Foundry,
//   Manufacturer, Packager, Particle Accelerator, Refinery, Smelter.
// The QR code is made by the encoder below (version 3, level M, a byte segment
// for the lower-case host and an alphanumeric one for the path). The encoder
// checks itself on every run: a published test vector for the Reed-Solomon
// maths, then it reads its own matrix back and compares the text.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ASSETS = path.resolve(HERE, '../assets');
const OUT_MAIN = path.join(ASSETS, '37-blue-screen_opus_5.5.svg');
const OUT_DUMP = path.join(ASSETS, '37-blue-screen_opus_5.5-dump.svg');
const OUT_KEY = path.join(ASSETS, '37-blue-screen_opus_5.5-anykey.svg');

const LIVE_URL = 'https://lukexyz.github.io/ULTRA-SATISFACTORY/';
const NL = String.fromCharCode(10);

// ---------------------------------------------------------------- geometry
const COLS = 80, ROWS = 25;       // the text mode
const CW = 9, CH = 16;            // one character cell, in pixels
// The panel is 830 units wide because that is how wide github.com draws a
// README on a desktop: one unit is then one screen pixel and the font is crisp.
const MX = 55, MY = 32;           // blue overscan around the 720 x 400 screen
const W = COLS * CW + 2 * MX, H = ROWS * CH + 2 * MY;
const X = (c) => MX + c * CW;
const Y = (r) => MY + r * CH;

// ---------------------------------------------------------------- palette
const BLUE = '#0000aa';           // text-mode blue
const WHITE = '#ffffff';
const GREY = '#aaaaaa';           // text-mode light grey: the inverted bar
const BLACK = '#000000';
// the app's own colours, used only on the restart screen
const CYAN = '#00cfff', GOLD = '#e8d44d', PURPLE = '#a855f7', PINK = '#ec4899', SKY = '#38bdf8', DIM = '#8a8a8a';

// ---------------------------------------------------------------- timeline
const T = 34;                     // seconds per loop
const A_KEY2 = 5.6, A_KEY3 = 9.6; // the last line of screen A changes twice
const A_END = 11.0;               // a blink of black, then
const B_START = 11.2;
const QR_T0 = 11.9, QR_STEP = 0.15;   // the dump prints one text row per step
const B_RESTART = 23.0;
const B_END = 25.0;               // black, then
const C_START = 25.3;
const C_WARN = 31.4;

// ---------------------------------------------------------------- font
// 7 pixels wide in a 9 pixel cell (one blank column each side), 16 rows.
// Each entry: [first cell row, rows...]. Capitals and digits sit on rows 2-11,
// the x-height is rows 5-11, descenders reach row 14. A 9-character row is
// drawn from the cell's left edge (used for the underscore).
const rep = (row, n) => Array(n).fill(row).join(' ');
const FONT_SRC = {
  A: [2, '..###.. .##.##. ##...## ##...## ##...## ####### ##...## ##...## ##...## ##...##'],
  B: [2, '######. ##...## ##...## ##...## ######. ##...## ##...## ##...## ##...## ######.'],
  C: [2, `.#####. ##...## ${rep('##.....', 6)} ##...## .#####.`],
  D: [2, `#####.. ##..##. ${rep('##...##', 6)} ##..##. #####..`],
  E: [2, '####### ##..... ##..... ##..... #####.. ##..... ##..... ##..... ##..... #######'],
  F: [2, '####### ##..... ##..... ##..... #####.. ##..... ##..... ##..... ##..... ##.....'],
  G: [2, '.#####. ##...## ##..... ##..... ##..... ##..### ##...## ##...## ##...## .#####.'],
  H: [2, `${rep('##...##', 4)} ####### ${rep('##...##', 5)}`],
  I: [2, `..####. ${rep('...##..', 8)} ..####.`],
  J: [2, `...#### ${rep('....##.', 5)} ##..##. ##..##. ##..##. .####..`],
  K: [2, '##...## ##..##. ##.##.. ####... ###.... ###.... ####... ##.##.. ##..##. ##...##'],
  L: [2, `${rep('##.....', 9)} #######`],
  M: [2, `##...## ###.### ####### ####### ##.#.## ${rep('##...##', 5)}`],
  N: [2, `##...## ###..## ####.## ####### ##.#### ##..### ${rep('##...##', 4)}`],
  O: [2, `.#####. ${rep('##...##', 8)} .#####.`],
  P: [2, `######. ##...## ##...## ##...## ######. ${rep('##.....', 5)}`],
  Q: [2, `.#####. ${rep('##...##', 6)} ##.#.## ##.#### .#####. ....##. .....##`],
  R: [2, '######. ##...## ##...## ##...## ######. ####... ##.##.. ##..##. ##...## ##...##'],
  S: [2, '.#####. ##...## ##..... .##.... ..###.. ....##. .....## .....## ##...## .#####.'],
  T: [2, `.###### ${rep('...##..', 9)}`],
  U: [2, `${rep('##...##', 9)} .#####.`],
  V: [2, `${rep('##...##', 6)} .##.##. .##.##. ..###.. ...#...`],
  W: [2, `${rep('##...##', 4)} ##.#.## ##.#.## ##.#.## ####### ###.### .##.##.`],
  X: [2, '##...## ##...## .##.##. .##.##. ..###.. ..###.. .##.##. .##.##. ##...## ##...##'],
  Y: [2, `${rep('.##..##', 4)} ..####. ${rep('...##..', 5)}`],
  Z: [2, '####### .....## ....##. ....##. ...##.. ..##... .##.... .##.... ##..... #######'],
  0: [2, '.#####. ##...## ##...## ##..### ##.#.## ###..## ##...## ##...## ##...## .#####.'],
  1: [2, `...##.. ..###.. .####.. ${rep('...##..', 6)} .######`],
  2: [2, '.#####. ##...## .....## .....## ....##. ...##.. ..##... .##.... ##..... #######'],
  3: [2, '.#####. ##...## .....## .....## ..####. .....## .....## .....## ##...## .#####.'],
  4: [2, '....##. ...###. ..####. .##.##. ##..##. ####### ....##. ....##. ....##. ....##.'],
  5: [2, '####### ##..... ##..... ##..... ######. .....## .....## .....## ##...## .#####.'],
  6: [2, '..####. .##.... ##..... ##..... ######. ##...## ##...## ##...## ##...## .#####.'],
  7: [2, '####### .....## .....## ....##. ....##. ...##.. ...##.. ..##... ..##... ..##...'],
  8: [2, '.#####. ##...## ##...## ##...## .#####. ##...## ##...## ##...## ##...## .#####.'],
  9: [2, '.#####. ##...## ##...## ##...## ##...## .###### .....## .....## ....##. .####..'],
  a: [5, '.#####. .....## .###### ##...## ##...## ##...## .######'],
  b: [2, `##..... ##..... ##..... ######. ${rep('##...##', 5)} ######.`],
  c: [5, '.#####. ##...## ##..... ##..... ##..... ##...## .#####.'],
  d: [2, `.....## .....## .....## .###### ${rep('##...##', 5)} .######`],
  e: [5, '.#####. ##...## ##...## ####### ##..... ##...## .#####.'],
  f: [2, `...#### ..##... ..##... .#####. ${rep('..##...', 6)}`],
  g: [5, `.###### ${rep('##...##', 5)} .###### .....## ##...## .#####.`],
  h: [2, `##..... ##..... ##..... ##.###. ###..## ${rep('##...##', 5)}`],
  i: [2, `...##.. ...##.. ....... ..###.. ${rep('...##..', 5)} ..####.`],
  j: [2, `....##. ....##. ....... ...###. ${rep('....##.', 6)} ##..##. ##..##. .####..`],
  k: [2, '##..... ##..... ##..... ##..##. ##.##.. ####... ####... ##.##.. ##..##. ##...##'],
  l: [2, `..###.. ${rep('...##..', 8)} ..####.`],
  m: [5, `###.##. ####### ${rep('##.#.##', 5)}`],
  n: [5, `##.###. ###..## ${rep('##...##', 5)}`],
  o: [5, `.#####. ${rep('##...##', 5)} .#####.`],
  p: [5, `######. ${rep('##...##', 5)} ######. ##..... ##..... ##.....`],
  q: [5, `.###### ${rep('##...##', 5)} .###### .....## .....## .....##`],
  r: [5, `##.###. ###..## ${rep('##.....', 5)}`],
  s: [5, '.#####. ##...## .##.... ..###.. ....##. ##...## .#####.'],
  t: [2, `..##... ..##... ..##... .#####. ${rep('..##...', 4)} ..##.## ...###.`],
  u: [5, `${rep('##...##', 5)} ##..### .###.##`],
  v: [5, `${rep('##...##', 4)} .##.##. ..###.. ...#...`],
  w: [5, '##...## ##...## ##.#.## ##.#.## ##.#.## ####### .##.##.'],
  x: [5, '##...## .##.##. ..###.. ..###.. ..###.. .##.##. ##...##'],
  y: [5, `${rep('##...##', 6)} .###### .....## ....##. .####..`],
  z: [5, '####### ....##. ...##.. ..##... .##.... ##..... #######'],
  '.': [10, '...##.. ...##..'],
  ',': [10, '...##.. ...##.. ..##...'],
  ':': [6, '...##.. ...##.. ....... ....... ...##.. ...##..'],
  ';': [6, '...##.. ...##.. ....... ....... ...##.. ...##.. ..##...'],
  '-': [7, '.#####.'],
  _: [13, '########.'],
  '!': [2, `${rep('...##..', 7)} ....... ...##.. ...##..`],
  '?': [2, '.#####. ##...## .....## ....##. ...##.. ...##.. ...##.. ....... ...##.. ...##..'],
  '*': [5, '.##.##. ..###.. ####### ..###.. .##.##.'],
  '+': [5, '...##.. ...##.. .###### ...##.. ...##..'],
  '=': [6, '.###### ....... ....... .######'],
  '/': [2, '.....## .....## ....##. ....##. ...##.. ...##.. ..##... ..##... .##.... .##....'],
  '(': [2, `....##. ...##.. ${rep('..##...', 6)} ...##.. ....##.`],
  ')': [2, `.##.... ..##... ${rep('...##..', 6)} ..##... .##....`],
  '[': [2, `..####. ${rep('..##...', 8)} ..####.`],
  ']': [2, `.####.. ${rep('...##..', 8)} .####..`],
  '"': [2, '.##.##. .##.##. .##.##.'],
  "'": [2, '...##.. ...##.. ..##...'],
  '%': [3, '##....# ##...## ....##. ...##.. ...##.. ..##... .##.... ##...## #....##'],
  '>': [3, '.##.... ..##... ...##.. ....##. .....## ....##. ...##.. ..##... .##....'],
  '<': [3, '....##. ...##.. ..##... .##.... ##..... .##.... ..##... ...##.. ....##.'],
  '#': [3, '.##.##. .##.##. ####### .##.##. .##.##. .##.##. ####### .##.##. .##.##.'],
  '&': [2, '..###.. .##.##. .##.##. ..###.. .###.## ##.###. ##..##. ##..##. ##..##. .###.##'],
};

// A glyph becomes one <path> of merged rectangles, relative to its cell.
function glyphPath(ch) {
  const src = FONT_SRC[ch];
  if (!src) throw new Error(`no glyph for ${JSON.stringify(ch)}`);
  const [top, rowStr] = src;
  const rows = rowStr.split(' ');
  const open = new Map();           // "x,w" -> rect still growing downwards
  const rects = [];
  rows.forEach((row, k) => {
    if (row.length !== 7 && row.length !== 9) throw new Error(`glyph ${ch}: row ${k} is ${row.length} wide`);
    const off = row.length === 7 ? 1 : 0;
    const y = top + k;
    if (y > 15) throw new Error(`glyph ${ch} leaves its cell`);
    const seen = new Set();
    for (let x = 0; x < row.length; x++) {
      if (row[x] !== '#') continue;
      let w = 1;
      while (row[x + w] === '#') w++;
      const key = `${x + off},${w}`;
      seen.add(key);
      const r = open.get(key);
      if (r && r.y + r.h === y) r.h++;
      else { const nr = { x: x + off, y, w, h: 1 }; open.set(key, nr); rects.push(nr); }
      x += w;
    }
    for (const key of [...open.keys()]) if (!seen.has(key)) open.delete(key);
  });
  return rects.map((r) => `M${r.x} ${r.y}h${r.w}v${r.h}h-${r.w}z`).join('');
}

const usedGlyphs = new Set();
const gid = (ch) => 'g' + ch.codePointAt(0).toString(36);

// One run of text on the grid. opts: fill, bg (inverse bar behind it), cls,
// cursor ('blink' or 'still': a hardware-style cursor after the last letter).
function put(row, col, str, opts = {}) {
  if (col < 0 || col + str.length > COLS) throw new Error(`off the 80 column grid: ${JSON.stringify(str)} at ${col}`);
  if (row < 0 || row >= ROWS) throw new Error(`off the 25 row grid: ${JSON.stringify(str)}`);
  const fill = opts.fill || WHITE;
  let s = `<g transform="translate(${X(col)} ${Y(row)})" fill="${fill}"${opts.cls ? ` class="${opts.cls}"` : ''}>`;
  if (opts.bg) s += `<rect width="${str.length * CW}" height="${CH}" fill="${opts.bg}"/>`;
  [...str].forEach((ch, i) => {
    if (ch === ' ') return;
    usedGlyphs.add(ch);
    glyphPath(ch);                  // throws early on a missing glyph
    s += `<use href="#${gid(ch)}"${i ? ` x="${i * CW}"` : ''}/>`;
  });
  if (opts.cursor) {
    const cx = (str.length + (opts.cursorGap ?? 1)) * CW;
    if (col + str.length + (opts.cursorGap ?? 1) >= COLS) throw new Error('cursor off the grid');
    s += `<rect x="${cx}" y="13" width="${CW}" height="2"${opts.cursor === 'blink' ? ' class="cur"' : ''}/>`;
  }
  return s + '</g>';
}
const centreCol = (str) => Math.floor((COLS - str.length) / 2);
const centred = (row, str, opts) => put(row, centreCol(str), str, opts);

// ---------------------------------------------------------------- animation
// Every change on screen is a cut, as on the real thing: all keyframes are
// stepped. vis(t0, t1) returns a class that shows its element from t0 to t1.
const css = [];
const visClasses = new Map();
const pct = (t) => +((t / T) * 100).toFixed(3);
function vis(t0, t1 = T) {
  const key = `${t0}-${t1}`;
  if (visClasses.has(key)) return visClasses.get(key);
  const name = 'v' + visClasses.size.toString(36);
  const frames = [];
  if (t0 > 0) frames.push(`0%{opacity:0}${pct(t0)}%{opacity:1}`);
  else frames.push('0%{opacity:1}');
  if (t1 < T) frames.push(`${pct(t1)}%{opacity:0}100%{opacity:0}`);
  else frames.push('100%{opacity:1}');
  css.push(`.${name}{opacity:${t0 > 0 ? 0 : 1};animation:${name} ${T}s step-end infinite}`);
  css.push(`@keyframes ${name}{${frames.join('')}}`);
  visClasses.set(key, name);
  return name;
}

// ---------------------------------------------------------------- QR code
// A small, complete QR encoder: versions 1 to 4, levels L and M (one
// Reed-Solomon block), byte and alphanumeric segments, all eight masks scored
// by the standard penalty rules.
const GF_EXP = new Array(512), GF_LOG = new Array(256);
{
  let x = 1;
  for (let i = 0; i < 255; i++) { GF_EXP[i] = x; GF_LOG[x] = i; x <<= 1; if (x & 256) x ^= 0x11d; }
  for (let i = 255; i < 512; i++) GF_EXP[i] = GF_EXP[i - 255];
}
const gfMul = (a, b) => (a && b ? GF_EXP[GF_LOG[a] + GF_LOG[b]] : 0);
function rsDivisor(degree) {
  let g = [1];
  for (let i = 0; i < degree; i++) {
    const n = new Array(g.length + 1).fill(0);
    g.forEach((c, j) => { n[j] ^= c; n[j + 1] ^= gfMul(c, GF_EXP[i]); });
    g = n;
  }
  return g;
}
function rsRemainder(data, degree) {
  const g = rsDivisor(degree);
  const res = data.concat(new Array(degree).fill(0));
  for (let i = 0; i < data.length; i++) {
    const c = res[i];
    if (c) g.forEach((gc, j) => { res[i + j] ^= gfMul(gc, c); });
  }
  return res.slice(data.length);
}
// [data codewords, error-correction codewords] for the single-block versions
const QR_CAP = { 1: { L: [19, 7], M: [16, 10] }, 2: { L: [34, 10], M: [28, 16] }, 3: { L: [55, 15], M: [44, 26] }, 4: { L: [80, 20] } };
const QR_ALIGN = { 1: [], 2: [6, 18], 3: [6, 22], 4: [6, 26] };
const QR_ECBITS = { L: 1, M: 0 };
const ALNUM = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:';
const QR_MASKS = [
  (x, y) => (x + y) % 2 === 0, (x, y) => y % 2 === 0, (x, y) => x % 3 === 0, (x, y) => (x + y) % 3 === 0,
  (x, y) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0, (x, y) => ((x * y) % 2) + ((x * y) % 3) === 0,
  (x, y) => (((x * y) % 2) + ((x * y) % 3)) % 2 === 0, (x, y) => (((x + y) % 2) + ((x * y) % 3)) % 2 === 0,
];

function qrCodewords(segments, version, level) {
  const [nData, nEc] = QR_CAP[version][level];
  const bits = [];
  const push = (v, n) => { for (let i = n - 1; i >= 0; i--) bits.push((v >>> i) & 1); };
  for (const seg of segments) {
    if (seg.mode === 'byte') {
      push(0b0100, 4); push(seg.text.length, 8);
      for (const ch of seg.text) { const c = ch.charCodeAt(0); if (c > 255) throw new Error('byte segment: not Latin-1'); push(c, 8); }
    } else {
      push(0b0010, 4); push(seg.text.length, 9);
      const v = [...seg.text].map((ch) => { const k = ALNUM.indexOf(ch); if (k < 0) throw new Error(`not alphanumeric: ${ch}`); return k; });
      for (let i = 0; i + 1 < v.length; i += 2) push(v[i] * 45 + v[i + 1], 11);
      if (v.length % 2) push(v[v.length - 1], 6);
    }
  }
  if (bits.length > nData * 8) throw new Error(`QR: ${bits.length} bits do not fit version ${version}-${level}`);
  push(0, Math.min(4, nData * 8 - bits.length));
  while (bits.length % 8) bits.push(0);
  const data = [];
  for (let i = 0; i < bits.length; i += 8) data.push(parseInt(bits.slice(i, i + 8).join(''), 2));
  for (let pad = 0xec; data.length < nData; pad ^= 0xec ^ 0x11) data.push(pad);
  return { data, ec: rsRemainder(data, nEc) };
}

function qrFunctionPatterns(version) {
  const size = 17 + 4 * version;
  const mod = Array.from({ length: size }, () => new Array(size).fill(false));
  const fn = Array.from({ length: size }, () => new Array(size).fill(false));
  const set = (x, y, dark) => { mod[y][x] = dark; fn[y][x] = true; };
  for (let i = 0; i < size; i++) { set(6, i, i % 2 === 0); set(i, 6, i % 2 === 0); }
  for (const [cx, cy] of [[3, 3], [size - 4, 3], [3, size - 4]]) {
    for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) {
      const x = cx + dx, y = cy + dy, d = Math.max(Math.abs(dx), Math.abs(dy));
      if (x >= 0 && x < size && y >= 0 && y < size) set(x, y, d !== 2 && d !== 4);
    }
  }
  const al = QR_ALIGN[version];
  for (const ax of al) for (const ay of al) {
    if ((ax === 6 && ay === 6) || (ax === 6 && ay === size - 7) || (ax === size - 7 && ay === 6)) continue;
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) set(ax + dx, ay + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
  }
  return { size, mod, fn, set };
}
function qrFormatBits(level, mask) {
  const data = (QR_ECBITS[level] << 3) | mask;
  let rem = data;
  for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
  return ((data << 10) | rem) ^ 0x5412;
}
// where the 15 format bits live: [x, y] of bit i, first copy then second copy
function qrFormatCells(size) {
  const a = [], b = [];
  for (let i = 0; i <= 5; i++) a.push([8, i]);
  a.push([8, 7], [8, 8], [7, 8]);
  for (let i = 9; i < 15; i++) a.push([14 - i, 8]);
  for (let i = 0; i < 8; i++) b.push([size - 1 - i, 8]);
  for (let i = 8; i < 15; i++) b.push([8, size - 15 + i]);
  return [a, b];
}
function qrDataCells(size, fn) {      // the zigzag, as a list of [x, y]
  const cells = [];
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vert = 0; vert < size; vert++) for (let j = 0; j < 2; j++) {
      const x = right - j;
      const upward = ((right + 1) & 2) === 0;
      const y = upward ? size - 1 - vert : vert;
      if (!fn[y][x]) cells.push([x, y]);
    }
  }
  return cells;
}
function qrPenalty(m) {
  const n = m.length;
  let p = 0, dark = 0;
  const lines = [];
  for (let i = 0; i < n; i++) { lines.push(m[i]); lines.push(m.map((row) => row[i])); }
  for (const line of lines) {
    let run = 1;
    for (let i = 1; i <= n; i++) {
      if (i < n && line[i] === line[i - 1]) run++;
      else { if (run >= 5) p += 3 + (run - 5); run = 1; }
    }
    const s = line.map((v) => (v ? '1' : '0')).join('');
    for (const pat of ['10111010000', '00001011101']) for (let k = s.indexOf(pat); k >= 0; k = s.indexOf(pat, k + 1)) p += 40;
  }
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    if (m[y][x]) dark++;
    if (x + 1 < n && y + 1 < n && m[y][x] === m[y][x + 1] && m[y][x] === m[y + 1][x] && m[y][x] === m[y + 1][x + 1]) p += 3;
  }
  p += Math.floor(Math.abs((dark * 20) / (n * n) - 10)) * 10;
  return p;
}
export function makeQr(segments, version, level, onlyMask = -1) {
  const { data, ec } = qrCodewords(segments, version, level);
  const all = data.concat(ec);
  let best = null;
  for (let mask = 0; mask < 8; mask++) {
    if (onlyMask >= 0 && mask !== onlyMask) continue;
    const { size, mod, fn, set } = qrFunctionPatterns(version);
    const [fa, fb] = qrFormatCells(size);
    const fbits = qrFormatBits(level, mask);
    fa.forEach(([x, y], i) => set(x, y, ((fbits >>> i) & 1) === 1));
    fb.forEach(([x, y], i) => set(x, y, ((fbits >>> i) & 1) === 1));
    set(8, size - 8, true);
    qrDataCells(size, fn).forEach(([x, y], i) => {
      const bit = i < all.length * 8 ? (all[i >>> 3] >>> (7 - (i & 7))) & 1 : 0;
      mod[y][x] = (bit === 1) !== QR_MASKS[mask](x, y);
    });
    const penalty = qrPenalty(mod);
    if (!best || penalty < best.penalty) best = { mod, mask, penalty, size };
  }
  return best;
}
// Reads a matrix back: format bits, unmasking, zigzag, syndromes, segments.
export function readQr(mod) {
  const size = mod.length, version = (size - 17) / 4;
  const [fa] = qrFormatCells(size);
  let fbits = 0;
  fa.forEach(([x, y], i) => { if (mod[y][x]) fbits |= 1 << i; });
  let level = null, mask = -1;
  for (const lv of Object.keys(QR_ECBITS)) for (let k = 0; k < 8; k++) if (qrFormatBits(lv, k) === fbits) { level = lv; mask = k; }
  if (!level) throw new Error('QR read-back: format bits do not match any level/mask');
  const { fn, set } = qrFunctionPatterns(version);
  const [a, b] = qrFormatCells(size);
  for (const [x, y] of a.concat(b)) set(x, y, false);
  set(8, size - 8, true);
  const [nData, nEc] = QR_CAP[version][level];
  const bytes = new Array(nData + nEc).fill(0);
  qrDataCells(size, fn).forEach(([x, y], i) => {
    if (i >= bytes.length * 8) return;
    if (mod[y][x] !== QR_MASKS[mask](x, y)) bytes[i >>> 3] |= 1 << (7 - (i & 7));
  });
  for (let i = 0; i < nEc; i++) {           // every syndrome must be zero
    let s = 0;
    for (const c of bytes) s = gfMul(s, GF_EXP[i]) ^ c;
    if (s) throw new Error('QR read-back: Reed-Solomon syndrome is not zero');
  }
  const bits = [];
  for (const c of bytes.slice(0, nData)) for (let i = 7; i >= 0; i--) bits.push((c >>> i) & 1);
  let pos = 0;
  const take = (n) => { let v = 0; for (let i = 0; i < n; i++) v = (v << 1) | (bits[pos++] || 0); return v; };
  let text = '';
  while (pos + 4 <= bits.length) {
    const mode = take(4);
    if (mode === 0) break;
    if (mode === 0b0100) { const n = take(8); for (let i = 0; i < n; i++) text += String.fromCharCode(take(8)); }
    else if (mode === 0b0010) {
      const n = take(9);
      for (let i = 0; i + 1 < n; i += 2) { const v = take(11); text += ALNUM[Math.floor(v / 45)] + ALNUM[v % 45]; }
      if (n % 2) text += ALNUM[take(6)];
    } else throw new Error(`QR read-back: unexpected mode ${mode}`);
  }
  return { text, level, mask, version };
}
// self-test: the well-known "HELLO WORLD" version 1-M vector, then the format words
{
  const hw = qrCodewords([{ mode: 'alnum', text: 'HELLO WORLD' }], 1, 'M');
  const wantData = [32, 91, 11, 120, 209, 114, 220, 77, 67, 64, 236, 17, 236, 17, 236, 17];
  const wantEc = [196, 35, 39, 119, 235, 215, 231, 226, 93, 23];
  if (hw.data.join() !== wantData.join() || hw.ec.join() !== wantEc.join()) throw new Error('QR self-test: codewords differ from the published vector');
  if (qrFormatBits('L', 0) !== 0b111011111000100 || qrFormatBits('M', 0) !== 0b101010000010010 || qrFormatBits('M', 5) !== 0b100000011001110) throw new Error('QR self-test: format words');
}
const HOST_PART = 'https://lukexyz.github.io/', PATH_PART = 'ULTRA-SATISFACTORY/';
if (HOST_PART + PATH_PART !== LIVE_URL) throw new Error('QR segments do not add up to the live URL');
const QR = makeQr([{ mode: 'byte', text: HOST_PART }, { mode: 'alnum', text: PATH_PART }], 3, 'M');
{
  const back = readQr(QR.mod);
  if (back.text !== LIVE_URL) throw new Error(`QR read-back gave ${back.text}`);
}

// The QR code on the text grid: one module is one column wide and half a row
// tall (9 x 8 pixels), which is what the half-block characters give you.
const QR_QUIET = 4;                                     // light modules around the code: the standard quiet zone
const QR_COLS = QR.size + 2 * QR_QUIET;                 // 37 columns
const QR_ROWS = Math.ceil((QR.size + 2 * QR_QUIET) / 2); // 19 text rows (the odd half row goes to the bottom margin)
function qrBlock(row, col, animated) {
  const x0 = X(col), y0 = Y(row), w = QR_COLS * CW, h = QR_ROWS * CH;
  const rects = [];
  for (let y = 0; y < QR.size; y++) {
    for (let x = 0; x < QR.size; x++) {
      if (!QR.mod[y][x]) continue;
      let run = 1;
      while (x + run < QR.size && QR.mod[y][x + run]) run++;
      rects.push(`M${(x + QR_QUIET) * CW} ${(y + QR_QUIET) * (CH / 2)}h${run * CW}v${CH / 2}h-${run * CW}z`);
      x += run;
    }
  }
  let s = `<g transform="translate(${x0} ${y0})">`;
  s += `<rect width="${w}" height="${h}" fill="${GREY}"/><path fill="${BLUE}" d="${rects.join('')}"/>`;
  if (animated) {
    // a blue curtain that drops one text row per step: the dump "prints"
    const frames = ['0%{transform:translateY(0)}'];
    for (let i = 1; i <= QR_ROWS; i++) frames.push(`${pct(QR_T0 + i * QR_STEP)}%{transform:translateY(${i * CH}px)}`);
    frames.push(`100%{transform:translateY(${QR_ROWS * CH}px)}`);
    css.push(`.cu{animation:cu ${T}s step-end infinite}`, `@keyframes cu{${frames.join('')}}`);
    s += `<g clip-path="url(#qc)"><rect class="cu" width="${w}" height="${h}" fill="${BLUE}"/></g>`;
  }
  return s + '</g>';
}

// ---------------------------------------------------------------- big letters
// For the restart screen: a 5 x 7 face set in half-block "pixels" (one column
// wide, half a row tall), the way big titles were built in text mode.
const BIG = {
  U: '#...#|#...#|#...#|#...#|#...#|#...#|.###.', L: '#....|#....|#....|#....|#....|#....|#####',
  T: '#####|..#..|..#..|..#..|..#..|..#..|..#..', R: '####.|#...#|#...#|####.|#.#..|#..#.|#...#',
  A: '.###.|#...#|#...#|#####|#...#|#...#|#...#', S: '.####|#....|#....|.###.|....#|....#|####.',
  I: '#####|..#..|..#..|..#..|..#..|..#..|#####', F: '#####|#....|#....|####.|#....|#....|#....',
  C: '.####|#....|#....|#....|#....|#....|.####', O: '.###.|#...#|#...#|#...#|#...#|#...#|.###.',
  Y: '#...#|#...#|.#.#.|..#..|..#..|..#..|..#..',
};
const bigWidth = (str, k) => (str.length * 6 - 1) * k;
function bigRects(rowsList, k) {      // rowsList: [{ rows, dx }] in font pixels
  const rects = [];
  for (const { rows, dx } of rowsList) {
    rows.forEach((r, y) => {
      for (let x = 0; x < r.length; x++) {
        if (r[x] !== '#') continue;
        let run = 1;
        while (r[x + run] === '#') run++;
        rects.push(`M${(dx + x) * k * CW} ${y * k * (CH / 2)}h${run * k * CW}v${k * (CH / 2)}h-${run * k * CW}z`);
        x += run;
      }
    });
  }
  return rects.join('');
}
// shadow: a darker copy one column right and half a row down, drawn first
function bigText(row, col, str, k, fill, shadow) {
  const d = bigRects([...str].map((ch, n) => ({ rows: BIG[ch].split('|'), dx: n * 6 })), k);
  const at = (dx, dy) => `transform="translate(${X(col) + dx} ${Y(row) + dy})"`;
  return (shadow ? `<path ${at(CW, CH / 2)} fill="${shadow}" d="${d}"/>` : '') + `<path ${at(0, 0)} fill="${fill}" d="${d}"/>`;
}
// The app's emblem, redrawn for this file in the same half-block pixels: a
// hexagon with a cog inside.
const EMBLEM = [
  '......###......', '....###.###....', '..###.....###..', '###.........###', '#...#..#..#...#', '#....#####....#', '#....#####....#', '#...###.###...#',
  '#....#####....#', '#....#####....#', '#...#..#..#...#', '###.........###', '..###.....###..', '....###.###....', '......###......',
];
function emblem(row, col, fill, shadow) {
  const d = bigRects([{ rows: EMBLEM, dx: 0 }], 1);
  const at = (dx, dy) => `transform="translate(${X(col) + dx} ${Y(row) + dy})"`;
  return (shadow ? `<path ${at(CW, CH / 2)} fill="${shadow}" d="${d}"/>` : '') + `<path ${at(0, 0)} fill="${fill}" d="${d}"/>`;
}

// ---------------------------------------------------------------- screen A
// The fatal-error screen. It is the first frame, and the reduced-motion frame.
function screenA(animated) {
  const NAME = ' ULTRA-SATISFACTORY ';
  const body = [
    [4, 'A belt has backed up at 008C:000000D3 in SCREWS(01) + 000001DD.'],
    [5, 'Your factory has stopped. This app has not: it is how you fix it.'],
    [7, 'ULTRA-SATISFACTORY is a companion app for Satisfactory: every recipe,'],
    [8, 'building and Space Elevator objective, one click apart, in three tabs:'],
    [9, 'OBJECTIVES, ITEMS and BUILDINGS.'],
    [11, '*  Press F1 to open it live in your browser. Nothing to install:'],
    [12, '   lukexyz.github.io/ULTRA-SATISFACTORY'],
    [14, '*  Press F2 to run it on your own machine:'],
    [15, '   python -m pip install -r requirements.txt'],
    [16, '   python -m streamlit run app/app.py'],
    [18, '*  Press CTRL+ALT+DEL to restart the factory. This will not help.'],
    [19, '   The storage box will still be full of Screws.'],
  ];
  const width = Math.max(...body.map(([, s]) => s.length));
  const left = Math.floor((COLS - width) / 2);
  let s = centred(2, NAME, { fill: BLUE, bg: GREY });
  for (const [row, str] of body) s += put(row, left, str);
  const last = [
    ['Press any key to continue', 0, A_KEY2],
    ['The Any key is just below this screen. We had one made.', A_KEY2, A_KEY3],
    ['Any key pressed. Emptying the storage box onto the screen', A_KEY3, T],
  ];
  if (!animated) return s + centred(22, last[0][0], { cursor: 'still' });
  for (const [str, t0, t1] of last) s += centred(22, str, { cursor: 'blink', cls: vis(t0, t1) });
  return s;
}

// ---------------------------------------------------------------- screen B
// The stop-code dump. Left-aligned from the top-left corner, no title bar.
const QR_ROW = 4, QR_COL = COLS - QR_COLS;   // flush with the right edge of the 80 columns
function screenB(animated) {
  const lines = [
    [1, '*** STOP: 0x0000008C (0x000000D3,0x00000058,0x000001DD,0x00000005)'],
    [2, 'BELT_BACKED_UP_AND_NOBODY_TOUCHED_ANYTHING'],
    [4, 'Nobody reads hex for fun, so:'],
    [6, '  0x0000008C   140 craftable items'],
    [7, '  0x000000D3   211 machine recipes'],
    [8, '  0x00000058    88 of them alternates'],
    [9, '  0x000001DD   477 buildings'],
    [10, '  0x00000005     5 Space Elevator phases'],
    [12, 'Tabs loaded when the belt jammed:'],
    [14, '  OBJECTIV.TAB  phases, parts, counts'],
    [15, '  ITEMS.TAB     search, rates, machines'],
    [16, '  BUILDING.TAB  what makes what, by tier'],
  ];
  const DUMPING = 'Dumping the storage box to screen:';
  const done = [
    [19, 'Dump complete: Screws, Screws, Screws'],
    [20, 'and one QR code. Point a phone at it.'],
    [21, 'It opens the app, live, in the browser.'],
  ];
  const RESTART = 'Any key pressed. Restarting the factory';
  let s = '';
  for (const [row, str] of lines) {
    if (1 + str.length > QR_COL - 2 && row >= QR_ROW) throw new Error(`screen B: line runs under the QR block: ${str}`);
    s += put(row, 1, str);
  }
  s += put(18, 1, DUMPING);
  const pcol = 1 + DUMPING.length + 1;
  if (pcol + 4 > QR_COL - 2) throw new Error('screen B: the percentage runs under the QR block');
  for (const [, str] of done) if (1 + str.length > QR_COL - 2) throw new Error(`screen B: line runs under the QR block: ${str}`);
  const tDone = QR_T0 + QR_ROWS * QR_STEP;
  if (animated) {
    s += put(18, pcol, '0%', { cls: vis(B_START, QR_T0 + QR_STEP) });
    for (let i = 1; i <= QR_ROWS; i++) {
      const p = Math.round((i / QR_ROWS) * 100);
      s += put(18, pcol, `${p}%`, { cls: vis(+(QR_T0 + i * QR_STEP).toFixed(2), i < QR_ROWS ? +(QR_T0 + (i + 1) * QR_STEP).toFixed(2) : T) });
    }
    const late = vis(+(tDone + 0.35).toFixed(2));
    s += `<g class="${late}">${done.map(([row, str]) => put(row, 1, str)).join('')}</g>`;
    s += put(23, 1, 'Press any key to restart', { cursor: 'blink', cls: vis(+(tDone + 0.35).toFixed(2), B_RESTART) });
    s += put(23, 1, RESTART, { cursor: 'blink', cls: vis(B_RESTART) });
  } else {
    s += put(18, pcol, '100%');
    for (const [row, str] of done) s += put(row, 1, str);
    s += put(23, 1, 'Held still on purpose. Scan away', { cursor: 'still' });
  }
  s += qrBlock(QR_ROW, QR_COL, animated);
  return s;
}

// ---------------------------------------------------------------- screen C
// The restart: black, the app's own colours, the name in big letters.
function screenC() {
  const t = (d) => +(C_START + d).toFixed(2);
  let s = '';
  const lock = EMBLEM[0].length + 3 + bigWidth('ULTRA', 2);       // emblem, gap, ULTRA
  const c0 = Math.floor((COLS - lock) / 2);
  s += emblem(1, c0, GOLD);
  s += bigText(1, c0 + EMBLEM[0].length + 3, 'ULTRA', 2, CYAN, '#005a70');
  // no shadow here: at this size it would fill the one-column gaps between the letters
  s += bigText(9, Math.floor((COLS - bigWidth('SATISFACTORY', 1)) / 2), 'SATISFACTORY', 1, WHITE);
  s += centred(14, 'Every recipe, building and Space Elevator objective, one click apart.');
  const tabs = [[' OBJECTIVES ', PURPLE], [' ITEMS ', PINK], [' BUILDINGS ', SKY]];
  const gap = 3;
  let col = Math.floor((COLS - (tabs.reduce((n, [str]) => n + str.length, 0) + gap * (tabs.length - 1))) / 2);
  tabs.forEach(([str, colour], i) => {
    s += put(16, col, str, { fill: BLACK, bg: colour, cls: vis(t(0.5 + i * 0.3)) });
    col += str.length + gap;
  });
  const HEAD = 'Factory restarted. 9 production machines answer the roll call:';
  const names = [['Assembler', 'Blender', 'Constructor', 'Foundry', 'Manufacturer', 'Packager'], ['Particle Accelerator', 'Refinery', 'Smelter']];
  s += centred(18, HEAD, { fill: GREY, cls: vis(t(1.6)) });
  let k = 0;
  names.forEach((rowNames, r) => {
    let c = centreCol(rowNames.join('  '));
    for (const name of rowNames) {
      s += put(19 + r, c, name, { fill: GOLD, cls: vis(t(2.0 + k * 0.3)) });
      c += name.length + 2;
      k++;
    }
  });
  s += centred(22, 'Belt 07 is backing up. It is the Screws again', { fill: WHITE, cursor: 'blink', cls: vis(C_WARN) });
  s += centred(24, 'An unofficial fan project, not affiliated with Coffee Stain Studios.', { fill: DIM });
  return s;
}

// ---------------------------------------------------------------- assemble
function glyphDefs() {
  return [...usedGlyphs].sort().map((ch) => `<path id="${gid(ch)}" d="${glyphPath(ch)}"/>`).join('');
}
const PANEL_R = 7;
// At 830 px the grid is 1:1 and needs no help. Shown a little wider, or on a
// display scaled by 125% or 150%, anti-aliasing would smear the one-pixel bars,
// so from 826 px up the glyphs snap to whole device pixels. Below that (phones,
// narrow layouts) snapping would drop strokes, so smoothing stays on. The media
// query measures the image as displayed, because this file is loaded by <img>.
const CRISP = '@media (min-width:826px){.px{shape-rendering:crispEdges}}';
function wrap({ title, desc, body, style, extraDefs = '' }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="t d">
<title id="t">${title}</title>
<desc id="d">${desc}</desc>
<style>${(style ? style + NL : '') + CRISP}</style>
<defs><clipPath id="panel"><rect width="${W}" height="${H}" rx="${PANEL_R}"/></clipPath>${extraDefs}${glyphDefs()}</defs>
<g clip-path="url(#panel)" class="px">
${body}
</g>
</svg>
`;
}
const full = (fill, cls) => `<rect width="${W}" height="${H}" fill="${fill}"${cls ? ` class="${cls}"` : ''}/>`;
const qrClip = `<clipPath id="qc"><rect width="${QR_COLS * CW}" height="${QR_ROWS * CH}"/></clipPath>`;

// --- the animated banner
{
  usedGlyphs.clear();
  const a = screenA(true);
  const b = screenB(true);
  const c = screenC();
  css.push('.cur{animation:cur 0.64s step-end infinite}', '@keyframes cur{0%{opacity:1}50%{opacity:0}100%{opacity:0}}');
  const body = [
    full(BLUE),
    `<g>${a}</g>`,
    full(BLACK, vis(A_END, B_START)),
    `<g class="${vis(B_START, B_END)}">${full(BLUE)}${b}</g>`,
    `<g class="${vis(B_END)}">${full(BLACK)}<g class="${vis(C_START)}">${c}</g></g>`,
  ].join('\n');
  const style = css.join('\n') + '\n@media (prefers-reduced-motion:reduce){*{animation:none!important}}';
  const svg = wrap({
    title: 'ULTRA-SATISFACTORY',
    desc: 'A white-on-blue fatal-error screen in 80 by 25 text mode. The title bar reads ULTRA-SATISFACTORY. The error is the factory, not the app: a belt has backed up. The recovery options are the live link, lukexyz.github.io/ULTRA-SATISFACTORY, and the two commands to run it. The screen then dumps a stop code whose hex numbers are the real counts (140 items, 211 recipes, 88 alternates, 477 buildings, 5 Space Elevator phases) beside a QR code for the live app, and restarts into a black title screen with the three tabs: OBJECTIVES, ITEMS, BUILDINGS.',
    body, style, extraDefs: qrClip,
  });
  fs.mkdirSync(ASSETS, { recursive: true });
  fs.writeFileSync(OUT_MAIN, svg);
  console.log(`wrote ${path.relative(process.cwd(), OUT_MAIN)}  ${(svg.length / 1024).toFixed(1)} KB`);
}

// --- the dump, held still
{
  usedGlyphs.clear();
  const b = screenB(false);
  const svg = wrap({
    title: 'ULTRA-SATISFACTORY: the storage box dump',
    desc: `The stop-code screen held still: the five hex numbers decoded to 140 craftable items, 211 machine recipes, 88 alternates, 477 buildings and 5 Space Elevator phases, and a QR code that opens ${LIVE_URL}`,
    body: full(BLUE) + '\n' + b,
  });
  fs.writeFileSync(OUT_DUMP, svg);
  console.log(`wrote ${path.relative(process.cwd(), OUT_DUMP)}  ${(svg.length / 1024).toFixed(1)} KB`);
}
// --- the Any key
// A beige keycap seen from above, in flat shades, with the legend set in the
// screen font at double size. Twice a loop, somebody presses it.
{
  const KW = 180, KH = 84;
  const legend = [...'Any'].map((ch, i) => `<path transform="translate(${26 + i * 2 * CW} 9) scale(2)" d="${glyphPath(ch)}"/>`).join('');
  // Same 34 s clock as the banner: it goes down just before each "Any key
  // pressed" line appears (the two images start together when the page loads).
  const press = (t) => `${pct(t - 0.3)}%{transform:translateY(0)}${pct(t - 0.22)}%{transform:translateY(5px)}${pct(t + 0.25)}%{transform:translateY(5px)}${pct(t + 0.35)}%{transform:translateY(0)}`;
  const style = [
    `.k{animation:k ${T}s linear infinite}`,
    `@keyframes k{0%{transform:translateY(0)}${press(A_KEY3)}${press(B_RESTART)}100%{transform:translateY(0)}}`,
    '@media (prefers-reduced-motion:reduce){*{animation:none!important}}',
  ].join(NL);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${KW} ${KH}" width="${KW}" height="${KH}" role="img" aria-labelledby="t d">
<title id="t">The Any key</title>
<desc id="d">A beige keyboard key with the legend Any. Pressing it opens ULTRA-SATISFACTORY live in the browser.</desc>
<style>${style}</style>
<rect x="3" y="12" width="${KW - 6}" height="${KH - 14}" rx="9" fill="#4d4a40"/>
<g class="k">
<rect x="3" y="2" width="${KW - 6}" height="${KH - 12}" rx="9" fill="#a39c84"/>
<rect x="3" y="2" width="${KW - 6}" height="${KH - 18}" rx="9" fill="#c4bda6"/>
<rect x="15" y="5" width="${KW - 30}" height="${KH - 32}" rx="6" fill="#ece7d6"/>
<rect x="17" y="5" width="${KW - 34}" height="2" fill="#f8f5ea"/>
<g fill="#33312b">${legend}</g>
</g>
</svg>
`;
  fs.writeFileSync(OUT_KEY, svg);
  console.log(`wrote ${path.relative(process.cwd(), OUT_KEY)}  ${(svg.length / 1024).toFixed(1)} KB`);
}
console.log(`QR: version 3-M, mask ${QR.mask}, ${QR.size} x ${QR.size} modules, reads back as ${readQr(QR.mod).text}`);
