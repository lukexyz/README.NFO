#!/usr/bin/env node
// PC diskmag reader: README header generator for CASTAWAY.
//
//   node examples/castaway/src/83-diskmag-reader_opus_5.5.mjs
//
// Writes examples/castaway/assets/83-diskmag-reader_opus_5.5.svg.
// Plain Node, no dependencies, no clock, no Math.random: the same bytes on
// every run. (The .md beside the assets is hand-written, not generated.)
//
// The style (catalogue entry hack-12) is the reader screen of a 1990s PC
// diskmag, a magazine shipped as a program: 640x480 in 16 colours, split into
// three bands. A painted logo with an issue number across the top, with a row
// of utility buttons; a reading area in the middle where the main menu and
// then each article, set in two columns of a custom proportional pixel font,
// slide past sideways; a strip of painted artwork along the bottom; and between
// them a status box with the author, the article title and a small flag, a
// one-tune module player with a level meter, and the page counter. A mouse
// pointer does the reading.
//
// Nothing is copied: the magazine is this project's own (issue #00), the
// staff (MARRAM, LUGWORM, CUTTLEBONE, BLADDERWRACK) and the publisher (GALLEY
// PROOF) are invented, and the logo letters, both fonts, the raft-log frame,
// the flag and the island strip are all drawn here from scratch.
//
// The party report on page 2 is real data: the default run (10:00:00, seed
// 1992) as `python tools/schedule.py` simulated it on 2026-10-01. The schedule
// changes as activities are added, so the report is dated, like any issue.
//
// Timing. One loop is 60 s, the length of the theme (20 bars of 3 s):
//   pages    five pages, 12 s (4 bars) each; each turn is a one-beat (0.75 s)
//            sideways scroll, and the last turn scrolls onto a copy of page 1,
//            so the wrap is invisible
//   pointer  wanders to something worth reading, then clicks the next page
//   player   the tune clock counts 0:00 to 0:59 and wraps with the loop; the
//            level meter steps on half beats
//   strip    her head dips on every beat, the shore foam and sea glints swap
//            on the beat, clouds drift a pixel at a time, and a coconut on
//            crab legs takes a stroll
// The first frame (and the reduced-motion frame) is page 1: logo, contents,
// editorial and the island, all readable.
//
// How it is drawn (no <text>, no filters): pixels are merged into runs, one
// <path> per colour; dithered gradient rows are a flat rect plus a 1 px line
// whose dash pattern is that row of a 4x4 Bayer matrix; text is <use>
// references to one path per glyph.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '83-diskmag-reader_opus_5.5';
const OUT = path.resolve(here, `../assets/${SLUG}.svg`);

// ------------------------------------------------------------------ canvas
const W = 640;
const H = 480;
const LOOP = 60; // s: one pass of the theme
const BEAT = 0.75; // 80 BPM
const PAGE_T = 12; // s per page (4 bars)
const SLIDE = 0.75; // s per page turn (1 beat)
const PAGES = 5;

// bands
const TOP_H = 92;
const LOG = 10;
const FR_Y0 = TOP_H; // top log
const FR_Y1 = 360; // bottom of bottom log
const IN_X0 = 12;
const IN_X1 = 628;
const IN_Y0 = FR_Y0 + LOG; // 102
const IN_Y1 = FR_Y1 - LOG; // 350
const PAGE_W = IN_X1 - IN_X0; // 616
const ST_Y0 = FR_Y1; // status bar
const ST_Y1 = 384;
const ART_Y = ST_Y1; // art strip
const ART_H = H - ART_Y; // 96

// ------------------------------------------------------------------ palette
// An original 16-colour ramp: night-navy interface, sunny island.
const C = {
  ink: '#090d1a',
  navy: '#121a33',
  navy2: '#22345e',
  deep: '#2f74c0',
  sea: '#4fb0e8',
  haze: '#a8e6f0',
  paper: '#f6f0e0',
  peach: '#f1cfa0',
  sand: '#d6a35c',
  wood: '#8a5a2e',
  bark: '#4a2c17',
  coral: '#ff8a6b',
  red: '#d24a43',
  sun: '#ffd45e',
  palm: '#6cc04a',
  fern: '#2f7a3e',
};

// ----------------------------------------------------------------- helpers
const n = (v) => (Number.isInteger(v) ? String(v) : String(+v.toFixed(3)));
function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const makeGrid = (w, h) => Array.from({ length: h }, () => new Array(w).fill(null));

// Lit cells -> compact path: horizontal runs, merged down identical rows.
function runsPath(isOn, w, h, ox = 0, oy = 0) {
  const rects = [];
  let active = new Map();
  for (let y = 0; y < h; y++) {
    const next = new Map();
    let x = 0;
    while (x < w) {
      if (!isOn(x, y)) { x++; continue; }
      let x1 = x;
      while (x1 < w && isOn(x1, y)) x1++;
      const key = `${x},${x1}`;
      const r = active.get(key);
      if (r) { r.h++; next.set(key, r); } else { const nr = { x, y, w: x1 - x, h: 1 }; rects.push(nr); next.set(key, nr); }
      x = x1;
    }
    active = next;
  }
  return rects.map((r) => `M${n(r.x + ox)} ${n(r.y + oy)}h${r.w}v${r.h}h${-r.w}`).join('');
}
// A colour grid (palette keys, null = clear) -> one <path> per colour.
function gridPaths(grid, ox = 0, oy = 0) {
  const h = grid.length;
  const w = grid[0].length;
  const keys = [];
  for (const row of grid) for (const c of row) if (c && !keys.includes(c)) keys.push(c);
  return keys.map((k) => `<path fill="${C[k] ?? k}" d="${runsPath((x, y) => grid[y][x] === k, w, h, ox, oy)}"/>`).join('');
}
// Parse a little picture: rows of characters, each mapped through `key`.
function sprite(rows, key) {
  const w = Math.max(...rows.map((r) => r.length));
  const g = makeGrid(w, rows.length);
  rows.forEach((r, y) => [...r].forEach((ch, x) => { if (key[ch]) g[y][x] = key[ch]; }));
  return g;
}

// ------------------------------------------------------------- dithering
const BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];
const ditherOn = (x, y, f) => f * 16 > BAYER[y & 3][x & 3];
// One row's 4-px Bayer pattern as dash attributes (lines start at x % 4 == 0).
const dashAttrs = (y, f) => dashBits([0, 1, 2, 3].map((x) => ditherOn(x, y, f)));
function dashBits(bits) {
  if (bits.every(Boolean)) return '';
  if (!bits.some(Boolean)) return null;
  let k = 0;
  while (!(bits[k] && !bits[(k + 3) % 4])) k++;
  const rot = [0, 1, 2, 3].map((i) => bits[(k + i) % 4]);
  const runs = [];
  let cur = rot[0];
  let len = 0;
  for (const b of rot) { if (b === cur) len++; else { runs.push(len); cur = b; len = 1; } }
  runs.push(len);
  return ` stroke-dasharray="${runs.join(' ')}"${k ? ` stroke-dashoffset="${(4 - k) % 4}"` : ''}`;
}
// Row ramp: segments [[rows, fromKey, toKey]] -> [{y, a, b, f}] (f = share of b)
function ramp(y0, segments) {
  const rows = [];
  let y = y0;
  for (const [len, a, b] of segments) {
    for (let i = 0; i < len; i++) {
      const f = a === b ? 0 : Math.round(((i + 0.5) / len) * 16) / 16;
      rows.push({ y: y++, a, b, f });
    }
  }
  return rows;
}
// Dithered horizontal bands over [x0, x1): flat rects plus dashed lines.
function bands(rows, x0, x1) {
  let out = '';
  for (let i = 0; i < rows.length;) {
    let j = i;
    while (j + 1 < rows.length && rows[j + 1].a === rows[i].a && rows[j + 1].y === rows[j].y + 1) j++;
    out += `<rect x="${x0}" y="${rows[i].y}" width="${x1 - x0}" height="${rows[j].y - rows[i].y + 1}" fill="${C[rows[i].a]}"/>`;
    i = j + 1;
  }
  const groups = new Map();
  for (const r of rows) {
    if (r.a === r.b || r.f <= 0) continue;
    const da = dashAttrs(r.y, r.f);
    if (da === null) continue;
    const key = `${r.b}|${da}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(r.y);
  }
  const sx = Math.floor(x0 / 4) * 4;
  for (const [key, ys] of groups) {
    const [b, da] = key.split('|');
    out += `<path stroke="${C[b]}"${da} d="${ys.map((y) => `M${sx} ${y + 0.5}h${x1 - sx}`).join('')}"/>`;
  }
  return out;
}
// Colour at a pixel for a ramp row list indexed by y.
function rampAt(rowsByY, x, y) {
  const r = rowsByY.get(y);
  if (!r) return null;
  return r.f > 0 && r.a !== r.b && ditherOn(x, y, r.f) ? r.b : r.a;
}

// ------------------------------------------------------------- the font
// "Galley", the magazine's own proportional face: 2 px stems, 1 px bars,
// 8 px capitals, 6 px x-height, 2 px descenders (rows 0-9; baseline under
// row 7). Each glyph: optional "first row|" then rows split by "/".
const GLYPHS = {
  A: '.####./##..##/##..##/##..##/######/##..##/##..##/##..##',
  B: '#####./##..##/##..##/#####./##..##/##..##/##..##/#####.',
  C: '.####./##..##/##..../##..../##..../##..../##..##/.####.',
  D: '####../##.##./##..##/##..##/##..##/##..##/##.##./####..',
  E: '######/##..../##..../#####./##..../##..../##..../######',
  F: '######/##..../##..../#####./##..../##..../##..../##....',
  G: '.####./##..##/##..../##..../##.###/##..##/##..##/.#####',
  H: '##..##/##..##/##..##/######/##..##/##..##/##..##/##..##',
  I: '####/.##./.##./.##./.##./.##./.##./####',
  J: '..####/....##/....##/....##/....##/##..##/##..##/.####.',
  K: '##..##/##.##./####../###.../####../##.##./##..##/##..##',
  L: '##..../##..../##..../##..../##..../##..../##..../######',
  M: '##...##/###.###/#######/##.#.##/##...##/##...##/##...##/##...##',
  N: '##..##/###.##/######/##.###/##..##/##..##/##..##/##..##',
  O: '.####./##..##/##..##/##..##/##..##/##..##/##..##/.####.',
  P: '#####./##..##/##..##/##..##/#####./##..../##..../##....',
  Q: '.####./##..##/##..##/##..##/##..##/##.###/##..##/.###.#',
  R: '#####./##..##/##..##/##..##/#####./##.##./##..##/##..##',
  S: '.####./##..##/##..../.####./....##/....##/##..##/.####.',
  T: '######/..##../..##../..##../..##../..##../..##../..##..',
  U: '##..##/##..##/##..##/##..##/##..##/##..##/##..##/.####.',
  V: '##..##/##..##/##..##/##..##/##..##/##..##/.####./..##..',
  W: '##...##/##...##/##...##/##...##/##.#.##/#######/###.###/##...##',
  X: '##..##/##..##/.####./..##../..##../.####./##..##/##..##',
  Y: '##..##/##..##/##..##/.####./..##../..##../..##../..##..',
  Z: '######/....##/...##./..##../.##.../##..../##..../######',
  a: '2|.####./....##/.#####/##..##/##..##/.#####',
  b: '##..../##..../#####./##..##/##..##/##..##/##..##/#####.',
  c: '2|.####./##..##/##..../##..../##..##/.####.',
  d: '....##/....##/.#####/##..##/##..##/##..##/##..##/.#####',
  e: '2|.####./##..##/######/##..../##..##/.####.',
  f: '..###/.##../.##../####./.##../.##../.##../.##..',
  g: '2|.#####/##..##/##..##/##..##/##..##/.#####/....##/.####.',
  h: '##..../##..../#####./##..##/##..##/##..##/##..##/##..##',
  i: '##/../##/##/##/##/##/##',
  j: '..##/..../..##/..##/..##/..##/..##/..##/..##/###.',
  k: '##..../##..../##..##/##.##./####../####../##.##./##..##',
  l: '##/##/##/##/##/##/##/##',
  m: '2|#######./##.##.##/##.##.##/##.##.##/##.##.##/##.##.##',
  n: '2|#####./##..##/##..##/##..##/##..##/##..##',
  o: '2|.####./##..##/##..##/##..##/##..##/.####.',
  p: '2|#####./##..##/##..##/##..##/##..##/#####./##..../##....',
  q: '2|.#####/##..##/##..##/##..##/##..##/.#####/....##/....##',
  r: '2|##.##/###../##.../##.../##.../##...',
  s: '2|.#####/##..../.####./....##/....##/#####.',
  t: '1|.##../#####/.##../.##../.##../.##../..###',
  u: '2|##..##/##..##/##..##/##..##/##..##/.#####',
  v: '2|##..##/##..##/##..##/##..##/.####./..##..',
  w: '2|##...##/##...##/##.#.##/##.#.##/#######/.##.##.',
  x: '2|##..##/.####./..##../..##../.####./##..##',
  y: '2|##..##/##..##/##..##/##..##/##..##/.#####/....##/.####.',
  z: '2|######/...##./..##../.##.../##..../######',
  0: '.####./##..##/##..##/##.###/###.##/##..##/##..##/.####.',
  1: '..##../.###../####../..##../..##../..##../..##../######',
  2: '.####./##..##/....##/...##./..##../.##.../##..../######',
  3: '.####./##..##/....##/..###./....##/....##/##..##/.####.',
  4: '...##./..###./.####./##.##./##.##./######/...##./...##.',
  5: '######/##..../##..../#####./....##/....##/##..##/.####.',
  6: '.####./##..../##..../#####./##..##/##..##/##..##/.####.',
  7: '######/....##/....##/...##./..##../..##../..##../..##..',
  8: '.####./##..##/##..##/.####./##..##/##..##/##..##/.####.',
  9: '.####./##..##/##..##/##..##/.#####/....##/....##/.####.',
  '.': '6|##/##',
  ',': '6|##/##/#.',
  ':': '2|##/##/../../##/##',
  ';': '2|##/##/../../##/##/#.',
  '!': '##/##/##/##/##/../##/##',
  '?': '.####./##..##/....##/...##./..##../....../..##../..##..',
  "'": '##/##/#.',
  '-': '4|####',
  '(': '..##/.##./##../##../##../##../.##./..##',
  ')': '##../.##./..##/..##/..##/..##/.##./##..',
  '/': '....##/....##/...##./..##../..##../.##.../##..../##....',
  '%': '##...#/##..##/...##./..##../.##.../##..##/#...##',
  '#': '1|.##.##./#######/.##.##./.##.##./#######/.##.##.',
  '_': '8|######',
  '►': '1|#.../##../###./####/###./##../#...',
  '◄': '1|...#/..##/.###/####/.###/..##/...#',
  '♪': '..##.../..####./..##.##/..##..#/..##.../.###.../####.../.##....',
  '·': '3|##/##',
};
const FONT = {};
for (const [ch, spec] of Object.entries(GLYPHS)) {
  let top = 0;
  let body = spec;
  if (spec.includes('|')) { [top, body] = spec.split('|'); top = +top; }
  const rows = body.split('/');
  const w = Math.max(...rows.map((r) => r.length));
  const cells = Array.from({ length: 10 }, (_, y) => {
    const r = rows[y - top] ?? '';
    return Array.from({ length: w }, (_, x) => r[x] === '#');
  });
  FONT[ch] = { w, cells };
}
const SPACE = 4;
const adv = (ch) => (ch === ' ' ? SPACE : FONT[ch].w + 1);
function measure(str) {
  let w = 0;
  for (const ch of str) {
    if (ch !== ' ' && !FONT[ch]) throw new Error(`no glyph for ${JSON.stringify(ch)}`);
    w += adv(ch);
  }
  return w ? w - 1 : 0;
}
// glyph ids: letters as themselves, everything else "q" + code point
const gid = (ch) => (/[A-Za-z]/.test(ch) ? ch : `q${ch.codePointAt(0).toString(36)}`);
const usedGlyphs = new Set();

// ---------------------------------------------------- heading font (2x EPX)
function epx(cells) {
  const h = cells.length;
  const w = cells[0].length;
  const on = (x, y) => x >= 0 && y >= 0 && x < w && y < h && cells[y][x];
  const out = Array.from({ length: h * 2 }, () => new Array(w * 2).fill(false));
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const P = on(x, y);
      const A = on(x, y - 1);
      const B = on(x + 1, y);
      const Cc = on(x - 1, y);
      const D = on(x, y + 1);
      out[2 * y][2 * x] = Cc === A && Cc !== D && A !== B ? A : P;
      out[2 * y][2 * x + 1] = A === B && A !== Cc && B !== D ? B : P;
      out[2 * y + 1][2 * x] = D === Cc && D !== B && Cc !== A ? Cc : P;
      out[2 * y + 1][2 * x + 1] = B === D && B !== A && D !== Cc ? D : P;
    }
  }
  return out;
}
// Heading colours by row (0-19): a lit top edge, sun yellow, coral, red feet.
// One hard-stop gradient in each glyph's own user space does the banding.
const HEAD_BANDS = [[0, 'paper'], [1, 'sun'], [7, 'coral'], [13, 'red'], [20, null]];
const HEAD_GRAD = '<linearGradient id="zhg" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="20">'
  + HEAD_BANDS.slice(0, -1).map(([y, c], i) => `<stop offset="${n(y / 20)}" stop-color="${C[c]}"/><stop offset="${n(HEAD_BANDS[i + 1][0] / 20)}" stop-color="${C[c]}"/>`).join('')
  + '</linearGradient>';
const usedHeads = new Set();
const hid = (ch) => `H${ch.codePointAt(0).toString(36)}`;
const hadv = (ch) => (ch === ' ' ? 10 : FONT[ch].w * 2 + 2);
const hmeasure = (s) => [...s].reduce((a, ch) => a + hadv(ch), 0) - 2;
function headDef(ch) {
  const big = epx(FONT[ch].cells);
  return `<path id="${hid(ch)}" d="${runsPath((x, y) => big[y][x], big[0].length, big.length)}"/>`;
}

// ------------------------------------------------------------ text engine
// Markup: {k|text} colours a span; \t jumps to the tab stop.
const INK_KEYS = { t: 'haze', y: 'sun', c: 'coral', d: 'deep', s: 'sand', g: 'palm', w: 'paper', r: 'red' };
function parse(str, base) {
  const spans = [];
  const re = /\{(\w)\|([^}]*)\}/g;
  let last = 0;
  let m;
  while ((m = re.exec(str))) {
    if (m.index > last) spans.push({ c: base, t: str.slice(last, m.index) });
    spans.push({ c: INK_KEYS[m[1]], t: m[2] });
    last = re.lastIndex;
  }
  if (last < str.length) spans.push({ c: base, t: str.slice(last) });
  return spans;
}
class Ink {
  constructor() { this.lines = new Map(); this.heads = []; this.shadows = []; this.raw = ''; }
  glyph(colour, x, y, ch) {
    if (ch === ' ') return;
    if (!FONT[ch]) throw new Error(`no glyph for ${JSON.stringify(ch)}`);
    usedGlyphs.add(ch);
    const key = `${colour}|${y}`;
    if (!this.lines.has(key)) this.lines.set(key, []);
    this.lines.get(key).push(`<use href="#${gid(ch)}" x="${x}"/>`);
  }
  // returns the x after the text
  text(str, x, y, { base = 'paper', tab = 52, maxW = Infinity } = {}) {
    const x0 = x;
    for (const sp of parse(str, base)) {
      for (const ch of sp.t) {
        if (ch === '\t') { x = x0 + tab; continue; }
        this.glyph(sp.c, x, y, ch);
        x += adv(ch);
      }
    }
    if (x - 1 - x0 > maxW) throw new Error(`line too wide (${x - 1 - x0} > ${maxW}): ${str}`);
    return x;
  }
  right(str, xr, y, opts = {}) {
    const plain = str.replace(/\{\w\|([^}]*)\}/g, '$1');
    return this.text(str, xr - measure(plain), y, opts);
  }
  centre(str, xc, y, opts = {}) {
    const plain = str.replace(/\{\w\|([^}]*)\}/g, '$1');
    return this.text(str, Math.round(xc - measure(plain) / 2), y, opts);
  }
  // dot leader between two x positions
  leader(x0, x1, y, colour = 'deep') {
    for (let x = Math.ceil((x0 + 3) / 4) * 4; x + 2 <= x1 - 4; x += 4) this.glyph(colour, x, y, '.');
  }
  head(str, x, y) {
    for (const ch of str) {
      if (ch !== ' ') {
        usedHeads.add(ch);
        this.heads.push(`<use href="#${hid(ch)}" x="${x}" y="${y}"/>`);
        this.shadows.push(`<use href="#${hid(ch)}" x="${x + 1}" y="${y + 1}"/>`);
      }
      x += hadv(ch);
    }
    return x;
  }
  svg() {
    const byColour = new Map();
    for (const [key, uses] of this.lines) {
      const [colour, y] = key.split('|');
      if (!byColour.has(colour)) byColour.set(colour, []);
      byColour.get(colour).push(`<g transform="translate(0 ${y})">${uses.join('')}</g>`);
    }
    let out = this.raw;
    if (this.heads.length) out += `<g fill="${C.ink}">${this.shadows.join('')}</g><g fill="url(#zhg)">${this.heads.join('')}</g>`;
    for (const [colour, gs] of byColour) out += `<g fill="${C[colour]}">${gs.join('')}</g>`;
    return out;
  }
}

// --------------------------------------------------------------- the logo
// Rounded techno capitals, built from rects with rounded and filleted
// corners, then sheared into italics. Face: sunlit gold above a horizon
// line, sea below; a cut-wood extrusion; a 1 px ink outline.
function shapeGrid(w, h, parts, cuts = [], ops = []) {
  const g = Array.from({ length: h }, (_, y) => Array.from({ length: w }, (_, x) => {
    const px = x + 0.5;
    const py = y + 0.5;
    const inR = ([x0, y0, x1, y1]) => px > x0 && px < x1 && py > y0 && py < y1;
    return parts.some(inR) && !cuts.some(inR);
  }));
  // [cx, cy, r, dx, dy, mode]: 'cut' rounds a convex corner whose material
  // lies toward (dx, dy); 'fill' fillets a concave corner whose empty side
  // lies toward (dx, dy).
  for (const [cx, cy, r, dx, dy, mode] of ops) {
    const ox = cx + dx * r;
    const oy = cy + dy * r;
    for (let y = Math.min(cy, oy); y < Math.max(cy, oy); y++) {
      for (let x = Math.min(cx, ox); x < Math.max(cx, ox); x++) {
        if (x < 0 || y < 0 || x >= w || y >= h) continue;
        if (Math.hypot(x + 0.5 - ox, y + 0.5 - oy) > r) g[y][x] = mode === 'fill';
      }
    }
  }
  return g;
}
const LH = 52; // letter height
const T = 12; // stroke
const LETTERS = {
  C: () => shapeGrid(46, LH, [[0, 0, 46, LH]], [[T, T, 46, LH - T]], [
    [0, 0, 18, 1, 1, 'cut'], [0, LH, 18, 1, -1, 'cut'], [46, 0, 7, -1, 1, 'cut'], [46, LH, 7, -1, -1, 'cut'],
    [T, T, 6, 1, 1, 'fill'], [T, LH - T, 6, 1, -1, 'fill'], [46, T, 3, -1, -1, 'cut'], [46, LH - T, 3, -1, 1, 'cut'],
  ]),
  A: () => shapeGrid(48, LH, [[0, 0, 48, LH]], [[T, T, 48 - T, 25], [T, 35, 48 - T, LH]], [
    [0, 0, 20, 1, 1, 'cut'], [48, 0, 20, -1, 1, 'cut'], [T, T, 6, 1, 1, 'fill'], [48 - T, T, 6, -1, 1, 'fill'],
  ]),
  S: () => shapeGrid(46, LH, [[0, 0, 46, T], [0, 0, T, 32], [0, 20, 46, 32], [34, 20, 46, LH], [0, LH - T, 46, LH]], [], [
    [0, 0, 16, 1, 1, 'cut'], [46, 0, 6, -1, 1, 'cut'], [46, LH, 16, -1, -1, 'cut'], [0, LH, 6, 1, -1, 'cut'],
    [0, 32, 9, 1, -1, 'cut'], [46, 20, 9, -1, 1, 'cut'], [46, T, 3, -1, -1, 'cut'], [0, LH - T, 3, 1, 1, 'cut'],
    [T, T, 4, 1, 1, 'fill'], [T, 20, 4, 1, -1, 'fill'], [34, 32, 4, -1, 1, 'fill'], [34, LH - T, 4, -1, -1, 'fill'],
  ]),
  T: () => shapeGrid(44, LH, [[0, 0, 44, T], [16, 0, 28, LH]], [], [
    [0, 0, 5, 1, 1, 'cut'], [44, 0, 5, -1, 1, 'cut'], [0, T, 4, 1, -1, 'cut'], [44, T, 4, -1, -1, 'cut'],
    [16, LH, 3, 1, -1, 'cut'], [28, LH, 3, -1, -1, 'cut'], [16, T, 4, -1, 1, 'fill'], [28, T, 4, 1, 1, 'fill'],
  ]),
  W: () => shapeGrid(62, LH, [[0, 0, 62, LH]], [[T, 0, 25, 40], [37, 0, 50, 40], [25, 0, 37, 16]], [
    [0, LH, 18, 1, -1, 'cut'], [62, LH, 18, -1, -1, 'cut'], [0, 0, 3, 1, 1, 'cut'], [T, 0, 3, -1, 1, 'cut'],
    [50, 0, 3, 1, 1, 'cut'], [62, 0, 3, -1, 1, 'cut'], [25, 16, 4, 1, 1, 'cut'], [37, 16, 4, -1, 1, 'cut'],
    [T, 40, 5, 1, -1, 'fill'], [25, 40, 5, -1, -1, 'fill'], [37, 40, 5, 1, -1, 'fill'], [50, 40, 5, -1, -1, 'fill'],
  ]),
  Y: () => shapeGrid(48, LH, [[0, 0, T, 30], [36, 0, 48, 30], [0, 18, 48, 30], [18, 18, 30, LH]], [], [
    [0, 0, 3, 1, 1, 'cut'], [T, 0, 3, -1, 1, 'cut'], [36, 0, 3, 1, 1, 'cut'], [48, 0, 3, -1, 1, 'cut'],
    [0, 30, 12, 1, -1, 'cut'], [48, 30, 12, -1, -1, 'cut'], [T, 18, 5, 1, -1, 'fill'], [36, 18, 5, -1, -1, 'fill'],
    [18, 30, 4, -1, 1, 'fill'], [30, 30, 4, 1, 1, 'fill'], [18, LH, 3, 1, -1, 'cut'], [30, LH, 3, -1, -1, 'cut'],
  ]),
};
const LOGO_WORD = 'CASTAWAY';
const LOGO_GAP = 6;
const SHEAR = 0.2;
const DEPTH = 5;
const LOGO_X = 16;
const LOGO_Y = 10;
function buildLogo() {
  const glyphs = [...LOGO_WORD].map((ch) => LETTERS[ch]());
  const slant = Math.round((LH - 1) * SHEAR);
  const faceW = glyphs.reduce((a, g) => a + g[0].length, 0) + LOGO_GAP * (glyphs.length - 1) + slant;
  const GW = faceW + DEPTH + 3;
  const GH = LH + DEPTH + 3;
  const face = Array.from({ length: GH }, () => new Array(GW).fill(false));
  let ox = 1;
  for (const g of glyphs) {
    const w = g[0].length;
    for (let y = 0; y < LH; y++) {
      const sh = Math.round((LH - 1 - y) * SHEAR);
      for (let x = 0; x < w; x++) if (g[y][x]) face[y + 1][ox + x + sh] = true;
    }
    ox += w + LOGO_GAP;
  }
  const F = (x, y) => x >= 0 && y >= 0 && x < GW && y < GH && face[y][x];
  // Everything else is the face path re-used: the cut-wood extrusion is the
  // face shifted 1..5 px down-right (lit wood near the face, dark bark further
  // back), the ink outline is the face shifted to every offset one pixel
  // round the extruded block, and the lit bevel is what the face shows of a
  // paper underlay when the colour bands are clipped to the face moved 1 px
  // down-right.
  const facePath = runsPath(F, GW, GH, LOGO_X - 1, LOGO_Y - 1);
  const use = (dx, dy) => `<use href="#zf"${dx ? ` x="${dx}"` : ''}${dy ? ` y="${dy}"` : ''}/>`;
  let ink = '';
  for (let a = -1; a <= DEPTH + 1; a++) for (let b = -1; b <= DEPTH + 1; b++) if (Math.abs(a - b) <= 2) ink += use(a, b);
  let bark = '';
  for (let d = 3; d <= DEPTH; d++) bark += use(d, d);
  const wood = use(1, 1) + use(2, 2);
  // face colours: rows relative to the letter top (y = 1 in this grid)
  const faceRows = ramp(1, [
    [2, 'paper', 'paper'], [8, 'paper', 'sun'], [7, 'sun', 'sun'], [8, 'sun', 'coral'], [3, 'coral', 'coral'],
    [1, 'paper', 'paper'], [11, 'haze', 'sea'], [6, 'sea', 'sea'], [6, 'sea', 'deep'],
  ]);
  const defs = `<path id="zf" d="${facePath}"/><clipPath id="zlogo"><use href="#zf"/></clipPath><clipPath id="zlogo2"><use href="#zf" x="1" y="1"/></clipPath>`;
  const svg = `<g fill="${C.ink}">${ink}</g><g fill="${C.bark}">${bark}</g><g fill="${C.wood}">${wood}</g>`
    + `<g clip-path="url(#zlogo)"><rect x="${LOGO_X - 2}" y="${LOGO_Y - 2}" width="${GW + 2}" height="${GH + 2}" fill="${C.paper}"/>`
    + `<g clip-path="url(#zlogo2)"><g transform="translate(0 ${LOGO_Y - 1})">${bands(faceRows, LOGO_X - 4, LOGO_X + GW)}</g></g>`
    + `<g class="glint"><path fill="${C.paper}" opacity=".55" d="${glintPath()}"/></g></g>`;
  return { svg, defs, w: GW, h: GH, faceW };
}
// a stair-stepped diagonal band for the glint
function glintPath() {
  let d = '';
  for (let y = 0; y < LH + 4; y += 2) {
    const x = LOGO_X - 72 + Math.round((LH - y) * 0.45);
    d += `M${x} ${LOGO_Y - 2 + y}h7v2h-7`;
  }
  return d;
}

// ------------------------------------------------------------ raft logs
// Across the log: a lit top, a wood body dithered into shadow, a dark edge.
const LOG_ROWS = [['bark'], ['sand'], ['sand'], ['wood', 'sand', 0.25], ['wood'], ['wood'], ['wood'], ['wood', 'bark', 0.5], ['bark'], ['ink']];
// A log `len` long at (x, y), lying along x (or along y when `vertical`).
function logSvg(x, y, len, vertical, seed) {
  const rnd = mulberry32(seed);
  let s = '';
  // flat body, one rect per run of equal rows
  for (let r = 0; r < LOG;) {
    let q = r;
    while (q + 1 < LOG && LOG_ROWS[q + 1][0] === LOG_ROWS[r][0]) q++;
    s += vertical
      ? `<rect x="${x + r}" y="${y}" width="${q - r + 1}" height="${len}" fill="${C[LOG_ROWS[r][0]]}"/>`
      : `<rect x="${x}" y="${y + r}" width="${len}" height="${q - r + 1}" fill="${C[LOG_ROWS[r][0]]}"/>`;
    r = q + 1;
  }
  // dithered rows as dashed lines
  LOG_ROWS.forEach(([, b, f], r) => {
    if (!b) return;
    const along = vertical ? y : x;
    const s0 = Math.floor(along / 4) * 4;
    const bits = [0, 1, 2, 3].map((i) => (vertical ? ditherOn(x + r, i, f) : ditherOn(i, y + r, f)));
    const da = dashBits(bits);
    if (da === null) return;
    s += `<path stroke="${C[b]}"${da} d="${vertical ? `M${x + r + 0.5} ${s0}v${len + along - s0}` : `M${s0} ${y + r + 0.5}h${len + along - s0}`}"/>`;
  });
  // grain streaks and knots
  const g = makeGrid(len, LOG);
  for (let i = 0; i < len / 9; i++) {
    const r = 3 + Math.floor(rnd() * 5);
    const a0 = Math.floor(rnd() * len);
    const l = 5 + Math.floor(rnd() * 20);
    const col = r < 5 && rnd() < 0.5 ? 'sand' : 'bark';
    for (let a = a0; a < Math.min(len, a0 + l); a++) g[r][a] = col;
  }
  for (let i = 0; i < len / 110; i++) {
    const a = 6 + Math.floor(rnd() * (len - 12));
    g[4][a] = g[4][a + 1] = g[5][a] = g[5][a + 1] = 'bark';
    g[3][a] = 'sand';
    g[6][a + 1] = 'sand';
  }
  s += gridPaths(vertical ? transpose(g) : g, x, y);
  return s;
}
const transpose = (g) => g[0].map((_, x) => g.map((row) => row[x]));
function lashing() {
  // rope wrapped over a crossing: 16x16, diagonal turns
  const g = makeGrid(16, 16);
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      const dx = Math.abs(x - 7.5);
      const dy = Math.abs(y - 7.5);
      if (dx + dy > 10.5 || dx > 7.5 || dy > 7.5) continue;
      if (dx + dy > 9.5) { g[y][x] = 'ink'; continue; }
      const k = (x + y) % 4;
      g[y][x] = k === 0 ? 'bark' : k === 3 ? 'sand' : 'peach';
    }
  }
  return g;
}

// ----------------------------------------------------------- the strip
// The island, in daylight: sky, clouds, sea, sand, one tall palm, a raft, and
// her, sitting with her headphones on.
function buildStrip() {
  const rnd = mulberry32(1992);
  let s = '';
  const HZ = 34; // horizon row
  const sky = ramp(ART_Y, [[8, 'deep', 'sea'], [16, 'sea', 'sea'], [10, 'sea', 'haze']]);
  const sea = ramp(ART_Y + HZ, [[1, 'haze', 'haze'], [5, 'sea', 'deep'], [32, 'deep', 'deep'], [24, 'deep', 'sea']]);
  s += bands(sky, 0, W) + bands(sea, 0, W);

  // clouds: two copies of a 640 px layer, drifting a pixel at a time
  const cloud = makeGrid(W, HZ);
  const puffs = [
    [70, 20, [[0, 0, 9], [10, -4, 11], [22, -1, 9], [31, 2, 6], [-9, 3, 6]]],
    [250, 12, [[0, 0, 6], [8, -3, 7], [16, 0, 5], [-6, 2, 4]]],
    [372, 24, [[0, 0, 7], [9, -5, 9], [20, -2, 8], [28, 2, 5], [-7, 2, 5]]],
    [600, 9, [[0, 0, 5], [6, -2, 6], [13, 0, 4]]],
  ];
  for (const [cx, cy, circles] of puffs) {
    const flat = cy + 4; // flat cloud base
    for (const [dx, dy, r] of circles) {
      for (let y = cy + dy - r; y <= Math.min(flat, cy + dy + r); y++) {
        for (let x = cx + dx - r; x <= cx + dx + r; x++) {
          if (y < 0 || y >= HZ) continue;
          if (Math.hypot(x - cx - dx, y - cy - dy) > r + 0.3) continue;
          const xx = ((x % W) + W) % W;
          cloud[y][xx] = y > flat - 2 ? 'haze' : 'paper';
        }
      }
    }
  }
  const cloudSvg = gridPaths(cloud, 0, ART_Y);
  s += `<g class="clouds"><g id="zcl">${cloudSvg}</g><use href="#zcl" x="${W}"/></g>`;

  // sea texture: lighter streaks, shorter near the horizon
  const IX = 336; // island centre
  const IY = 82;
  const isl = (x, y, rx, ry) => ((x - IX) / rx) ** 2 + ((y - IY) / ry) ** 2;
  const g = makeGrid(W, ART_H);
  for (let i = 0; i < 240; i++) {
    const t = rnd();
    const y = HZ + 3 + Math.floor(t * t * (ART_H - HZ - 4));
    const depth = (y - HZ) / (ART_H - HZ);
    const len = 2 + Math.floor(rnd() * (2 + depth * 9));
    const x0 = Math.floor(rnd() * W);
    if (isl(x0, y, 128, 19) <= 1) continue;
    const col = depth > 0.62 ? 'haze' : 'sea';
    for (let x = x0; x < Math.min(W, x0 + len); x++) g[y][x] = col;
  }
  // the island: sand on a ring of shallows (scanline-dithered at the edge)
  for (let y = HZ + 1; y < ART_H; y++) {
    for (let x = IX - 130; x < IX + 130; x++) {
      const e1 = isl(x, y, 86, 11);
      if (e1 <= 1) g[y][x] = y < IY - 6 ? 'peach' : y === IY - 6 || y === IY - 1 ? ((x & 1) ? 'sand' : 'peach') : y < IY - 1 ? 'peach' : 'sand';
      else if (isl(x, y, 102, 14) <= 1) g[y][x] = 'haze';
      else if (isl(x, y, 122, 18) <= 1) g[y][x] = y & 1 ? 'haze' : 'sea';
    }
  }
  // bushes at the palm foot, and a few pebbles
  for (const [x, y, r] of [[IX + 32, 76, 5], [IX + 41, 74, 4], [IX + 24, 77, 3], [IX - 64, 78, 3]]) {
    for (let yy = y - r; yy <= y; yy++) for (let xx = x - r; xx <= x + r; xx++) {
      if (Math.hypot(xx - x, (yy - y) * 1.3) <= r + 0.2) g[yy][xx] = (xx * 3 + yy) % 4 === 0 ? 'palm' : 'fern';
    }
  }
  for (let x = IX - 56; x < IX - 34; x++) for (const y of [IY - 5, IY - 4]) if ((x + y) % 2 || y === IY - 5) g[y][x] = 'sand'; // her shadow
  for (const [x, y] of [[IX - 54, 86], [IX + 54, 88], [IX - 16, 88], [IX + 74, 79], [IX - 70, 83]]) g[y][x] = g[y][x + 1] = 'sand';
  s += gridPaths(g, 0, ART_Y);

  // shore foam: two frames swapped on the beat
  const foam = [makeGrid(W, ART_H), makeGrid(W, ART_H)];
  for (let y = HZ + 1; y < ART_H; y++) {
    for (let x = IX - 110; x < IX + 110; x++) {
      const e = isl(x, y, 86, 11);
      if (e > 1 && e < 1.2) foam[((x / 3) | 0) & 1][y][x] = 'paper';
    }
  }
  s += `<g class="foamA">${gridPaths(foam[0], 0, ART_Y)}</g><g class="foamB">${gridPaths(foam[1], 0, ART_Y)}</g>`;

  // sea glints: three sets, each lit for one beat in three
  const glints = [makeGrid(W, ART_H), makeGrid(W, ART_H), makeGrid(W, ART_H)];
  for (let i = 0; i < 72; i++) {
    const y = HZ + 2 + Math.floor(rnd() * (ART_H - HZ - 4));
    const x = Math.floor(rnd() * (W - 1));
    if (isl(x, y, 126, 20) <= 1) continue;
    glints[i % 3][y][x] = 'paper';
    if (y > HZ + 18) glints[i % 3][y][x + 1] = 'paper';
  }
  s += glints.map((gg, i) => `<g class="gl${i}">${gridPaths(gg, 0, ART_Y)}</g>`).join('');

  // the raft, pulled up on the right-hand shore: five logs, end on, lashed
  const raft = sprite([
    '..k.....k.....k.....k..',
    '.owwsowwsowwsowwsowwso.',
    'owwwwkwwwwkwwwwkwwwwkwo',
    'obwwbobwwbobwwbobwwbobo',
    '.obbo.obbo.obbo.obbo.o.',
  ], { k: 'peach', w: 'wood', s: 'sand', b: 'bark', o: 'ink' });
  s += gridPaths(raft, IX + 60, ART_Y + 80);

  // the palm: a leaning, ringed trunk and a crown of drooping fronds
  const PW = 150;
  const PH = 84;
  const palm = makeGrid(PW, PH);
  const P0 = [44, 78];
  const P1 = [46, 40];
  const P2 = [66, 15];
  const bez = (t) => [
    (1 - t) ** 2 * P0[0] + 2 * (1 - t) * t * P1[0] + t * t * P2[0],
    (1 - t) ** 2 * P0[1] + 2 * (1 - t) * t * P1[1] + t * t * P2[1],
  ];
  for (let i = 0; i <= 200; i++) {
    const t = i / 200;
    const [x, y] = bez(t);
    const half = 2.2 - t * 0.9;
    for (let dx = -3; dx <= 3; dx++) {
      if (Math.abs(dx) > half + 0.4) continue;
      const xx = Math.round(x + dx);
      const yy = Math.round(y);
      const ring = Math.floor(t * 30) % 2 === 0;
      palm[yy][xx] = dx <= -1 ? (ring ? 'sand' : 'peach') : dx >= 1 ? 'bark' : ring ? 'wood' : 'sand';
    }
  }
  const put = (x, y, c, over = true) => {
    const xx = Math.round(x);
    const yy = Math.round(y);
    if (yy < 0 || yy >= PH || xx < 0 || xx >= PW) return;
    if (over || !palm[yy][xx]) palm[yy][xx] = c;
  };
  // fronds: [angle, length, droop]; drawn back to front
  const fronds = [[-100, 18, 6], [-140, 34, 16], [-40, 34, 16], [-170, 38, 20], [-8, 40, 22], [180, 30, 26], [5, 30, 26], [-70, 22, 10], [-120, 26, 12]];
  for (const [ang, len, droop] of fronds) {
    const a = (ang * Math.PI) / 180;
    const steps = len * 3;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = P2[0] + Math.cos(a) * len * t;
      const y = P2[1] + Math.sin(a) * len * t + droop * t * t;
      const th = 2.2 * (1 - t) + 0.5;
      // rib (light) with a dark underside
      put(x, y - 1, 'palm');
      put(x, y, 'palm');
      for (let k = 1; k <= Math.ceil(th); k++) put(x, y + k, 'fern');
      // leaflets hanging from the rib, longer near the middle
      if (i % 3 === 0 && t > 0.12) {
        const ll = Math.round(5 * Math.sin(Math.PI * t)) + 1;
        const dir = Math.cos(a) >= 0 ? 1 : -1;
        for (let k = 1; k <= ll; k++) put(x + dir * k * 0.45, y + th + k, k === 1 ? 'palm' : 'fern', false);
      }
    }
  }
  for (const [x, y] of [[63, 17], [67, 18], [65, 20], [69, 16]]) {
    palm[y][x] = 'bark'; palm[y][x + 1] = 'wood'; palm[y + 1][x] = 'bark'; palm[y + 1][x + 1] = 'bark';
  }
  s += gridPaths(palm, IX - 4, ART_Y);

  // the bottle: out a little way, and straight back (every 30 s)
  const bottle = sprite([
    '.p.',
    'ofo',
    'gfg',
    'ggf',
    'ggf',
    'ooo',
  ], { p: 'peach', g: 'palm', f: 'fern', o: 'ink' });
  s += `<g class="bottle"><g class="bob">${gridPaths(bottle, IX - 100, ART_Y + 79)}</g></g>`;

  // her: sitting cross-legged on the sand, headphones on, nodding
  const key = { o: 'bark', h: 'wood', p: 'paper', P: 'peach', k: 'peach', K: 'sand', e: 'bark', t: 'coral', T: 'red', s: 'paper' };
  const head = sprite([
    '......oooooo.......',
    '.....oppppppo......',
    '....oohhhhhhoo.....',
    '...ophhhhhhhhpo....',
    '..oPphhhhhhhhpPo...',
    '..oPphkkkkkkhpPo...',
    '..oPpkkkkkkkkpPo...',
    '...opkekkkkekpo....',
    '....ohkkkkkkhooo...',
    '.....okkkkkkohhho..',
    '......okkkkoohhho..',
    '.......okko..ooo...',
  ], key);
  const body = sprite([
    '......otttttto.....',
    '.....otttttttto....',
    '....okttttttttko...',
    '....okttttttTtko...',
    '....okttttttTtko...',
    '...okKossssssoKko..',
    '..okKosssssssoKkko.',
    '.osssssssssssssssso',
    'okKKkkkkKKkkkkKKkko',
    '.ooooooooooooooooo.',
  ], key);
  const HX = IX - 58;
  const HY = ART_Y + 55;
  s += `<g>${gridPaths(body, HX, HY + 12)}<g class="nod">${gridPaths(head, HX, HY)}</g></g>`;

  // a coconut on crab legs, out for a stroll by the palm
  const crab = (legs) => sprite([
    '..ooo..',
    '.obbbo.',
    'obwwsbo',
    'owwwwwo',
    'ooooooo',
    legs,
  ], { b: 'bark', w: 'wood', s: 'sand', r: 'red', o: 'ink' });
  s += `<g class="crab"><g class="legA">${gridPaths(crab('r.r.r.r'), IX - 2, ART_Y + 83)}</g><g class="legB">${gridPaths(crab('.r.r.r.'), IX - 2, ART_Y + 83)}</g></g>`;
  return s;
}

// ----------------------------------------------------------- UI helpers
// a bevelled button; returns svg
function button(x, y, w, h, label, ink, { cls = '', face = 'navy2', lit = 'deep', dark = 'ink' } = {}) {
  let s = `<g${cls ? ` class="${cls}"` : ''}>`;
  s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${C[dark]}"/>`;
  s += `<rect x="${x}" y="${y}" width="${w - 1}" height="${h - 1}" fill="${C[lit]}"/>`;
  s += `<rect x="${x + 1}" y="${y + 1}" width="${w - 2}" height="${h - 2}" fill="${C[face]}"/>`;
  s += '</g>';
  ink.centre(label, x + w / 2, y + Math.round((h - 8) / 2), { base: 'paper' });
  return s;
}
// a small flag: the island's own (sky, sun, sea), on a pole
function flag(x, y) {
  const g = sprite([
    'o.........',
    'oaaaaaaaa.',
    'oaaaaauua.',
    'oaaaaauua.',
    'oddddddddd',
    'odddddddd.',
    'oeeeeeeee.',
    'o.........',
  ], { o: 'peach', a: 'sea', u: 'sun', d: 'deep', e: 'haze' });
  return gridPaths(g, x, y);
}

// ------------------------------------------------------------- the pages
// Each page is laid out at page 0's position and shifted by PAGE_W * k.
const CX1 = 26; // column 1 x
const CX2 = 340; // column 2 x
const COLW = 274;
const HEAD_Y = 110;
const RULE_Y = 132;
const BODY_Y = 140;
const PITCH = 15;

function pageFrame(ink, title, sub) {
  ink.head(title, CX1, HEAD_Y);
  ink.right(sub, IN_X1 - 14, HEAD_Y + 6, { base: 'deep' });
  ink.raw += `<path stroke="${C.navy2}" stroke-dasharray="2 2" d="M${CX1} ${RULE_Y + 0.5}h${IN_X1 - 14 - CX1}M${(CX1 + COLW + CX2) / 2 + 0.5} ${RULE_Y + 6}V${IN_Y1 - 8}"/>`;
}
function column(ink, x, lines, opts = {}) {
  let y = opts.y ?? BODY_Y;
  for (const line of lines) {
    if (line && typeof line === 'object') {
      // leader line: left ..... right
      const lx = ink.text(line.l, x, y, { maxW: COLW });
      const rplain = line.r.replace(/\{\w\|([^}]*)\}/g, '$1');
      const rx = x + COLW - measure(rplain);
      ink.leader(lx, rx, y);
      ink.text(line.r, rx, y);
    } else if (line) ink.text(line, x, y, { maxW: opts.maxW ?? COLW, tab: opts.tab ?? 52 });
    y += opts.pitch ?? PITCH;
  }
  return y;
}

const MENU = ['EDITORIAL', 'PARTY REPORT', 'THE CHARTS', 'ADVERTS', 'INVITATION'];
const MENU_X = 22;
const MENU_Y = 140;
const MENU_PITCH = 19;
const ED_X = 222;
// the menu highlight bar (animated on the real page 1, still on its copy)
function menuBar(animated) {
  return `<g${animated ? ' class="hl"' : ''}><rect x="${MENU_X}" y="${MENU_Y - 4}" width="174" height="16" fill="${C.navy2}"/><rect x="${MENU_X}" y="${MENU_Y - 4}" width="3" height="16" fill="${C.coral}"/>`
    + (animated ? `<rect class="hlx" x="${MENU_X}" y="${MENU_Y - 4}" width="174" height="16" fill="${C.coral}" opacity="0"/>` : '') + '</g>';
}
function page1(ink) {
  // contents
  ink.head('CONTENTS', 26, HEAD_Y);
  let s = '';
  MENU.forEach((m, i) => {
    ink.text(`{y|0${i + 1}}  ${m}`, MENU_X + 10, MENU_Y + i * MENU_PITCH);
  });
  ink.text('{y|06}  QUIT', MENU_X + 10, MENU_Y + 5 * MENU_PITCH + 8, { base: 'deep' });
  ink.text('she could leave', MENU_X + 34, MENU_Y + 5 * MENU_PITCH + 21, { base: 'deep' });
  ink.text('any time', MENU_X + 34, MENU_Y + 5 * MENU_PITCH + 34, { base: 'deep' });
  ink.text('{t|◄ ►} turn pages', MENU_X + 10, IN_Y1 - 22, { base: 'deep' });
  s += `<path stroke="${C.navy2}" stroke-dasharray="2 2" d="M${208.5} ${HEAD_Y + 2}V${IN_Y1 - 8}"/>`;
  // editorial
  ink.head('EDITORIAL', ED_X, HEAD_Y);
  ink.right('BY MARRAM', IN_X1 - 14, HEAD_Y + 6, { base: 'deep' });
  const ed = [
    'Welcome to issue {y|#00} of {c|CASTAWAY}, the only diskmag',
    'printed on one very small island.',
    '',
    'This issue covers a {t|ten-hour lo-fi video} for YouTube:',
    'one young woman, one tall palm, one raft and a lot of',
    'time. She mostly idles, nodding to her headphones.',
    'Every so often, on the next bar of the music,',
    'something happens: {t|more than 90 somethings}, on four',
    'timers. {t|Every sound in it is synthesized from code.}',
    'An unofficial remake in the spirit of a 1992',
    'desert-island screensaver. It is always daytime.',
    '',
    'We sent a reporter. The reporter is still there.',
  ];
  column(ink, ED_X, ed, { maxW: IN_X1 - 14 - ED_X, y: 140, pitch: 14 });
  ink.right('{c|MARRAM}, editor', IN_X1 - 14, 140 + 13 * 14 + 2, { base: 'deep' });
  return s;
}
function page2(ink) {
  pageFrame(ink, 'PARTY REPORT', 'DEFAULT RUN, SEED 1992, AS SIMULATED 1 OCT 2026');
  column(ink, CX1, [
    '{t|0:00:00}\tArrived. She was already',
    '\there, nodding. Good sign.',
    '{t|0:24:09}\tShe opens a coconut.',
    '{t|0:24:18}\tA ship sails past behind',
    '\ther. It waited for that.',
    '{t|0:44:06}\tA grey tabby drifts in on',
    '\ta crate. Stays 26 minutes.',
    '{t|1:00:42}\tA sandcastle goes up.',
    '{t|1:07:57}\tThe tide reviews it.',
    '{t|3:04:15}\tBottle out. Bottle back.',
    '{t|3:36:03}\tA coconut lands on a',
    '\thermit crab. Crab keeps it.',
  ]);
  column(ink, CX2, [
    '{t|5:14:06}\tShe spots a ship, waves',
    '\tlike mad. It toots back.',
    '\tIt sails on. She shrugs.',
    '{t|6:05:06}\tA different bottle, with a',
    '\treply. She smiles.',
    '{t|6:07:24}\tOne bar of signal, top of',
    '\tthe palm.',
    '{y|NO-SHOWS} the turtle, the shark',
    'in headphones, the drone, the',
    'hydrofoil bro. Next seed, maybe.',
    '{y|SCORE} 10 sandcastles, 0 kept.',
    'Busy 28%, nodding 72%. {c|10/10.}',
  ]);
}
function page3(ink) {
  pageFrame(ink, 'THE CHARTS', 'VOTED BY OUR READERSHIP OF ONE, BETWEEN NODS');
  column(ink, CX1, [
    '{y|TOP TIMERS}  {d|events in a typical 10 hours}',
    { l: '1  Regular, every 2-5 min', r: '{t|155}' },
    { l: '2  Occasional, 12-25 min', r: '{t|30}' },
    { l: '3  Rare, 30-60 min', r: '{t|13}' },
    { l: '4  Super rare, 3-6 hours', r: '{t|2}' },
    '',
    '{y|TOP MUSICIANS}',
    '1  {t|tools/make_audio.py}',
    '2  {t|tools/make_audio.py}, again',
    '3  the sea, a 60 s loop {d|(see 1)}',
    '',
    '{d|No samples. No loops. No recordings.}',
  ]);
  column(ink, CX2, [
    '{y|TOP VISITORS}',
    '1  the grey tabby, by crate',
    '2  the sea turtle',
    '3  the shark in headphones',
    '',
    '{y|TOP HEADWEAR}',
    '1  cream headphones',
    "2  the shark's headphones",
    '3  a coconut, worn by a crab',
    '',
    '{y|TOP PASTIME}',
    '1  nodding, about two thirds',
  ]);
}
function adBox(ink, x, y, h, label, lines) {
  let s = `<path fill="none" stroke="${C.navy2}" d="M${x + 0.5} ${y + 0.5}h${COLW - 1}v${h - 1}h${-(COLW - 1)}z"/>`;
  s += `<rect x="${x}" y="${y}" width="3" height="3" fill="${C.coral}"/><rect x="${x + COLW - 3}" y="${y + h - 3}" width="3" height="3" fill="${C.coral}"/>`;
  const lw = measure(label) + 10;
  s += `<rect x="${x + 8}" y="${y - 5}" width="${lw}" height="11" fill="${C.navy}"/>`;
  ink.text(label, x + 13, y - 4, { base: 'sun' });
  let yy = y + 9;
  for (const l of lines) { ink.text(l, x + 10, yy, { maxW: COLW - 20 }); yy += 12; }
  return s;
}
function page4(ink) {
  pageFrame(ink, 'ADVERTS', 'SMALL ADS. PAYMENT IN COCONUTS.');
  let s = '';
  const y0 = 146;
  s += adBox(ink, CX1, y0, 50, 'FOR SALE', ['Cream headphones, as new. Came', 'by drone. Already had a pair.']);
  s += adBox(ink, CX1, y0 + 66, 50, 'WANTED', ['Signal. Currently one bar, and', 'only at the very top of the palm.']);
  s += adBox(ink, CX1, y0 + 132, 50, 'SWAPPER', ['Seeks contacts, by bottle. Quick', 'replies: my first came straight back.']);
  s += adBox(ink, CX2, y0, 50, 'STUDIO', ['Every sound synthesized from code.', 'No samples, loops or recordings.', '80 BPM, F major: {t|tools/make_audio.py}']);
  s += adBox(ink, CX2, y0 + 66, 50, 'LESSONS', ['Fire by friction. Hammocks. Spear', 'fishing. A lookout up the palm.']);
  s += adBox(ink, CX2, y0 + 132, 50, 'LOST', ['One coconut. Last seen walking', 'off, worn by a hermit crab.']);
  return s;
}
function page5(ink) {
  pageFrame(ink, 'INVITATION', 'ENTRY FREE. DAYTIME ONLY. NO NIGHT SHIFT.');
  ink.text('{y|YOU ARE INVITED TO}', CX1, BODY_Y);
  ink.head('CASTAWAY', CX1, BODY_Y + 14);
  column(ink, CX1, [
    'a ten-hour sitting on one very',
    'small island, with one palm.',
    '',
    '{y|PLACE}\t127.0.0.1, port 8765',
    '{y|LENGTH}\t10:00:00, seed 1992',
    '{y|WHEN}\tany time. Always daytime.',
    '{y|ENTRY}\t{t|python tools/serve.py}',
    '{y|THEN}\tpress Play.',
  ], { y: BODY_Y + 39, tab: 52 });
  column(ink, CX2, [
    '{y|COMPOS}',
    'Waiting (ten hours, one entrant).',
    'Coconut. Sandcastle versus tide.',
    '{y|FACILITIES}',
    'One palm, one raft, live preview,',
    'export to MP4 at 1080p30.',
    '{y|BRING}',
    'Python and a browser. No npm, no',
    'build step. {t|python tools/schedule.py}',
    'checks the schedule first.',
    '{y|SLEEPING PLACE}',
    'A hammock. Build your own.',
  ]);
}

// ------------------------------------------------------------- assemble
const logo = buildLogo();
const uiInk = new Ink();
let ui = '';

// top band background: ink into navy, dithered
ui += bands(ramp(0, [[30, 'ink', 'ink'], [40, 'ink', 'navy'], [22, 'navy', 'navy']]), 0, W);
ui += logo.svg;

// issue badge, right of the logo
const BX = 476;
const BW = W - 12 - BX;
ui += `<rect x="${BX}" y="10" width="${BW}" height="54" fill="${C.navy}"/><path fill="none" stroke="${C.navy2}" d="M${BX + 0.5} 10.5h${BW - 1}v53h${-(BW - 1)}z"/>`;
uiInk.centre('{t|ISSUE}', BX + BW / 2, 15);
{
  const s = '#00';
  const x = Math.round(BX + BW / 2 - hmeasure(s) / 2);
  uiInk.head(s, x, 27);
}
uiInk.centre('1 OCT 2026', BX + BW / 2, 50, { base: 'sand' });

// tagline and utility buttons
uiInk.text('THE DISKMAG OF ONE VERY SMALL ISLAND', 18, 75, { base: 'haze' });
{
  let x = W - 12;
  const labels = ['HELP', 'SEARCH', 'MUSIC', 'PRINT'];
  for (const l of labels) {
    const w = measure(l) + 12;
    x -= w;
    ui += button(x, 71, w, 15, l, uiInk);
    x -= 4;
  }
}

// reading area
ui += `<rect x="${IN_X0}" y="${IN_Y0}" width="${PAGE_W}" height="${IN_Y1 - IN_Y0}" fill="${C.navy}"/>`;
ui += `<rect x="${IN_X0}" y="${IN_Y0}" width="${PAGE_W}" height="1" fill="${C.ink}"/><rect x="${IN_X0}" y="${IN_Y0}" width="1" height="${IN_Y1 - IN_Y0}" fill="${C.ink}"/>`;

// pages
const pages = [];
const p1 = new Ink(); const p1s = page1(p1); pages.push(`${menuBar(true)}<g id="zp1">${p1s}${p1.svg()}</g>`);
const p2 = new Ink(); page2(p2); pages.push(p2.svg());
const p3 = new Ink(); page3(p3); pages.push(p3.svg());
const p4 = new Ink(); const p4s = page4(p4); pages.push(p4s + p4.svg());
const p5 = new Ink(); page5(p5); pages.push(p5.svg());
pages.push(`${menuBar(false)}<use href="#zp1"/>`); // page 6: page 1 again, for the wrap
ui += `<clipPath id="zread"><rect x="${IN_X0 + 1}" y="${IN_Y0 + 1}" width="${PAGE_W - 1}" height="${IN_Y1 - IN_Y0 - 1}"/></clipPath>`;
ui += `<g clip-path="url(#zread)"><g class="strip">${pages.map((p, k) => (k ? `<g transform="translate(${k * PAGE_W} 0)">${p}</g>` : p)).join('')}</g></g>`;

// raft-log frame
{
  ui += logSvg(2, IN_Y0, IN_Y1 - IN_Y0, true, 13) + logSvg(IN_X1, IN_Y0, IN_Y1 - IN_Y0, true, 17);
  ui += logSvg(0, FR_Y0, W, false, 7) + logSvg(0, IN_Y1, W, false, 11);
  const lash = lashing();
  for (const [x, y] of [[-1, FR_Y0 - 3], [W - 15, FR_Y0 - 3], [-1, IN_Y1 - 3], [W - 15, IN_Y1 - 3]]) ui += gridPaths(lash, x, y);
}

// status bar: author box, tune player, page counter
ui += `<rect x="0" y="${ST_Y0}" width="${W}" height="${ST_Y1 - ST_Y0}" fill="${C.ink}"/>`;
const SY = ST_Y0 + 8;
const STATUS = [
  ['EDITORIAL', 'MARRAM'],
  ['PARTY REPORT', 'LUGWORM'],
  ['THE CHARTS', 'CUTTLEBONE'],
  ['ADVERTS', 'BLADDERWRACK'],
  ['INVITATION', 'MARRAM'],
];
ui += `<rect x="6" y="${ST_Y0 + 4}" width="214" height="16" fill="${C.navy}"/>` + flag(10, SY);
const statusInks = STATUS.map(([t, a], i) => {
  const ink = new Ink();
  ink.text(`${t} {d|BY} {s|${a}}`, 26, SY, { base: 'paper' });
  ink.text(`{y|${i + 1}}{d|/5}`, 568, SY);
  return `<g class="st${i}">${ink.svg()}</g>`;
});
// tune player
ui += `<rect x="226" y="${ST_Y0 + 4}" width="200" height="16" fill="${C.navy}"/>`;
uiInk.text('{c|♪} 1/1 ISLAND THEME', 232, SY, { base: 'paper' });
const METER_X = 364;
let meter = '';
for (let i = 0; i < 6; i++) {
  meter += `<g class="mb mb${i}"><rect x="${METER_X + i * 4}" y="${SY - 1}" width="3" height="10" fill="${C.palm}"/><rect x="${METER_X + i * 4}" y="${SY - 1}" width="3" height="3" fill="${C.sun}"/><rect x="${METER_X + i * 4}" y="${SY - 1}" width="3" height="1" fill="${C.coral}"/></g>`;
}
meter += `<path stroke="${C.navy}" d="${[0, 2, 4, 6, 8].map((k) => `M${METER_X} ${SY + k + 0.5}h23`).join('')}"/>`;
ui += meter;
// tune clock 0:00-0:59, wraps with the loop
{
  const DX = 394;
  uiInk.text('0:', DX, SY, { base: 'sun' });
  const tx = DX + measure('0:') + 1;
  const tens = new Ink();
  for (let d = 0; d < 6; d++) tens.text(String(d), 0, d * 12, { base: 'sun' });
  const ones = new Ink();
  for (let d = 0; d < 10; d++) ones.text(String(d), 0, d * 12, { base: 'sun' });
  ui += `<clipPath id="zclk"><rect x="${tx}" y="${SY}" width="14" height="9"/></clipPath>`;
  ui += `<g clip-path="url(#zclk)"><g transform="translate(${tx} ${SY})"><g class="tens">${tens.svg()}</g></g><g transform="translate(${tx + 7} ${SY})"><g class="ones">${ones.svg()}</g></g></g>`;
}
// page counter and arrows
ui += `<rect x="432" y="${ST_Y0 + 4}" width="202" height="16" fill="${C.navy}"/>`;
uiInk.text('PAGE', 533, SY, { base: 'deep' });
ui += statusInks.join('');
const BTN_PREV = [596, ST_Y0 + 4, 16, 16];
const BTN_NEXT = [614, ST_Y0 + 4, 16, 16];
ui += button(...BTN_PREV, '◄', uiInk);
const nextInk = new Ink();
ui += `<g class="nextbtn">${button(...BTN_NEXT, '►', nextInk)}${nextInk.svg()}</g>`;
ui += `<rect class="press" x="${BTN_NEXT[0] + 1}" y="${BTN_NEXT[1] + 1}" width="14" height="14" fill="${C.coral}" opacity="0"/>`;
uiInk.text('{d|GALLEY PROOF}', 440, SY);

// art strip
const strip = buildStrip();

// the pointer
const pointer = sprite([
  'o...........',
  'oo..........',
  'opo.........',
  'oppo........',
  'opppo.......',
  'oppppo......',
  'opppppo.....',
  'oppppppo....',
  'opppppppo...',
  'oppppppppo..',
  'opppppoooo..',
  'oppoppo.....',
  'opooppo.....',
  'oo..oppo....',
  'o...oppo....',
  '.....oppo...',
  '.....oppo...',
  '......oo....',
], { o: 'ink', p: 'paper' });

// --------------------------------------------------------------- timing
const pct = (t) => `${n((t / LOOP) * 100)}%`;
const REST = [BTN_NEXT[0] + 10, BTN_NEXT[1] + 11];
// pointer waypoints: [t, x, y] (absolute tip positions); moves ease, holds hold
const MENU_HIT = [MENU_X + 70, MENU_Y + MENU_PITCH + 4];
// where the reader points on each page: just past the end of a line, with
// nothing under the pointer's body
const AT = [
  [ED_X + measure('printed on one very small island.') + 3, BODY_Y + 14 + 5], // the editorial
  [CX1 + 52 + measure('A sandcastle goes up.') + 3, BODY_Y + 7 * PITCH + 5], // the tide is coming
  [CX1 + measure('3  the sea, a 60 s loop (see 1)') + 3, BODY_Y + 9 * PITCH + 5], // the musicians
  [CX2 + 10 + measure('80 BPM, F major: tools/make_audio.py') + 3, 146 + 9 + 24 + 5], // the studio advert
  [CX1 + 52 + measure('python tools/serve.py') + 3, BODY_Y + 39 + 6 * PITCH + 5], // the way in
];
const WAY = [
  [0, ...REST],
  [2.6, ...REST], [4.0, ...AT[0]],
  [8.4, ...AT[0]], [9.9, ...MENU_HIT],
  [13.2, ...MENU_HIT], [14.6, ...AT[1]],
  [21.4, ...AT[1]], [22.7, ...REST],
  [26.0, ...REST], [27.4, ...AT[2]],
  [33.4, ...AT[2]], [34.7, ...REST],
  [38.0, ...REST], [39.4, ...AT[3]],
  [45.4, ...AT[3]], [46.7, ...REST],
  [50.0, ...REST], [51.4, ...AT[4]],
  [57.4, ...AT[4]], [58.7, ...REST],
  [60, ...REST],
];
const CLICKS = [11.0, 23.0, 35.0, 47.0, 59.0];
let css = '';
{
  let k = '';
  for (let i = 0; i < WAY.length; i++) {
    const [t, x, y] = WAY[i];
    const moving = i + 1 < WAY.length && (WAY[i + 1][1] !== x || WAY[i + 1][2] !== y);
    k += `${pct(t)}{transform:translate(${x - REST[0]}px,${y - REST[1]}px);animation-timing-function:${moving ? 'cubic-bezier(.45,0,.3,1)' : 'linear'}}`;
  }
  css += `@keyframes ptr{${k}}.ptr{animation:ptr ${LOOP}s infinite}`;
}
// page strip: one-beat scroll at the end of each page
{
  let k = '';
  for (let p = 0; p < PAGES; p++) {
    const end = (p + 1) * PAGE_T;
    k += `${pct(p * PAGE_T)}{transform:translateX(${-p * PAGE_W}px)}`;
    k += `${pct(end - SLIDE)}{transform:translateX(${-p * PAGE_W}px);animation-timing-function:cubic-bezier(.5,0,.25,1)}`;
  }
  k += `100%{transform:translateX(${-PAGES * PAGE_W}px)}`;
  css += `@keyframes strip{${k}}.strip{animation:strip ${LOOP}s linear infinite}`;
}
// status variants switch halfway through each scroll
{
  for (let p = 0; p < PAGES; p++) {
    const on = p * PAGE_T - SLIDE / 2;
    const off = (p + 1) * PAGE_T - SLIDE / 2;
    const k = p === 0
      ? `0%{opacity:1}${pct(off)}{opacity:0}${pct(LOOP + on)}{opacity:1}100%{opacity:1}`
      : `0%{opacity:0}${pct(on)}{opacity:1}${pct(off)}{opacity:0}100%{opacity:0}`;
    css += `@keyframes st${p}{${k}}.st${p}{animation:st${p} ${LOOP}s step-end infinite}`;
    if (p) css += `.st${p}{opacity:0}`;
  }
}
// menu highlight: hops to PARTY REPORT when the pointer arrives
css += `@keyframes hl{0%{transform:translateY(0)}${pct(9.9)}{transform:translateY(${MENU_PITCH}px)}${pct(30)}{transform:translateY(0)}}`;
css += `.hl{animation:hl ${LOOP}s step-end infinite}`;
css += `@keyframes hlx{0%{opacity:0}${pct(CLICKS[0])}{opacity:.55}${pct(CLICKS[0] + 0.25)}{opacity:0}}.hlx{animation:hlx ${LOOP}s step-end infinite}`;
// the next-page button presses on every other click
{
  let k = '0%{opacity:0}';
  for (const c of CLICKS.slice(1)) k += `${pct(c)}{opacity:.6}${pct(c + 0.25)}{opacity:0}`;
  css += `@keyframes press{${k}}.press{animation:press ${LOOP}s step-end infinite}`;
  css += `@keyframes blink{0%{opacity:1}50%{opacity:.45}}.nextbtn{animation:blink 1.5s step-end infinite}`;
}
// tune clock
css += `@keyframes ones{0%{transform:translateY(0)}100%{transform:translateY(-120px)}}.ones{animation:ones 10s steps(10) infinite}`;
css += `@keyframes tens{0%{transform:translateY(0)}100%{transform:translateY(-72px)}}.tens{animation:tens ${LOOP}s steps(6) infinite}`;
// level meter: half-beat steps over 8 beats, a kick on every beat
{
  const rnd = mulberry32(80);
  for (let b = 0; b < 6; b++) {
    let k = '';
    const steps = 16;
    for (let i = 0; i < steps; i++) {
      const onBeat = i % 2 === 0;
      const base = b < 2 ? (onBeat ? 0.95 : 0.45) : onBeat ? 0.75 : 0.35;
      const lvl = Math.min(1, Math.max(0.2, base + (rnd() - 0.5) * 0.5));
      k += `${n((i / steps) * 100)}%{transform:scaleY(${n(Math.round(lvl * 5) / 5)})}`;
    }
    css += `@keyframes mb${b}{${k}}.mb${b}{animation:mb${b} ${BEAT * 8}s step-end infinite}`;
  }
  css += '.mb{transform-box:fill-box;transform-origin:50% 100%;transform:scaleY(.8)}';
}
// strip life
css += `@keyframes nod{0%{transform:translateY(0)}12.5%{transform:translateY(1px)}50%{transform:translateY(0)}}.nod{animation:nod ${BEAT}s step-end infinite}`;
css += `@keyframes fa{0%{opacity:1}50%{opacity:0}}.foamA{animation:fa ${BEAT * 2}s step-end infinite}.foamB{opacity:0;animation:fa ${BEAT * 2}s step-end ${-BEAT}s infinite}`;
css += `@keyframes gl{0%{opacity:1}33.333%{opacity:0}}.gl0,.gl1,.gl2{animation:gl ${BEAT * 3}s step-end infinite}.gl1{animation-delay:${-BEAT}s}.gl2{animation-delay:${-BEAT * 2}s}`;
css += `@keyframes clouds{0%{transform:translateX(0)}100%{transform:translateX(-${W}px)}}.clouds{animation:clouds ${LOOP * 4}s steps(${W}) infinite}`;
// the coconut on crab legs: a pixel-stepped stroll out and back, every 30 s
// [time share, x] holds and walks; each walk steps one pixel at a time
function stroll(name, dur, stops, extra = '') {
  let k = '';
  stops.forEach(([t, x], i) => {
    const next = stops[i + 1];
    const tf = next && next[1] !== x ? `;animation-timing-function:steps(${Math.abs(next[1] - x)},end)` : '';
    k += `${n(t * 100)}%{transform:translateX(${x}px)${tf}}`;
  });
  return `@keyframes ${name}{${k}}.${name}{animation:${name} ${dur}s linear infinite${extra}}`;
}
css += stroll('crab', LOOP / 2, [[0, 0], [0.2, 0], [0.45, 22], [0.6, 22], [0.85, 0], [1, 0]]);
css += `@keyframes leg{0%{opacity:1}50%{opacity:0}}.legA{animation:leg .5s step-end infinite}.legB{opacity:0;animation:leg .5s step-end -.25s infinite}`;
// the bottle: bobs out to sea a pixel at a time, and comes straight back
{
  css += stroll('bottle', LOOP / 2, [[0, 0], [0.1, 0], [0.35, -26], [0.5, -26], [0.75, 0], [1, 0]]);
  css += `@keyframes bob{0%{transform:translateY(0)}50%{transform:translateY(1px)}}.bob{animation:bob ${BEAT * 2}s step-end infinite}`;
}
// logo glint: one pass every 4 bars, in 4 px steps
css += `@keyframes glint{0%{transform:translateX(0)}12%{transform:translateX(${logo.w + 60}px)}100%{transform:translateX(${logo.w + 60}px)}}.glint{animation:glint ${PAGE_T}s infinite}`;
css += `.glint{animation-timing-function:steps(${Math.round((logo.w + 60) / 4)})}`;
css += '@media (prefers-reduced-motion:reduce){*{animation:none!important}.glint{display:none}}';

// ----------------------------------------------------------------- defs
let defs = logo.defs + HEAD_GRAD;
for (const ch of usedGlyphs) defs += `<path id="${gid(ch)}" d="${runsPath((x, y) => FONT[ch].cells[y][x], FONT[ch].w, 10)}"/>`;
for (const ch of usedHeads) defs += headDef(ch);

const ptrSvg = `<g transform="translate(${REST[0]} ${REST[1]})"><g class="ptr">${gridPaths(pointer)}</g></g>`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" shape-rendering="crispEdges">`
  + '<title>CASTAWAY, issue #00: the diskmag of one very small island</title>'
  + `<style>${css}</style>`
  + `<defs>${defs}<clipPath id="zall"><rect width="${W}" height="${H}" rx="10"/></clipPath></defs>`
  + `<g clip-path="url(#zall)">`
  + `<rect width="${W}" height="${H}" fill="${C.ink}"/>`
  + ui + uiInk.svg() + strip
  + `<rect y="${ART_Y}" width="${W}" height="1" fill="${C.ink}"/>`
  + ptrSvg
  + '</g></svg>\n';

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, svg);
console.log(`wrote ${path.relative(process.cwd(), OUT)} (${(svg.length / 1024).toFixed(1)} KB)`);
