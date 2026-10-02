#!/usr/bin/env node
// "Amstrad CPC demo screen" README banner for CASTAWAY.
//
//   node examples/castaway/src/114-cpc-demo-screen_opus_5.5.mjs
//   node examples/castaway/src/114-cpc-demo-screen_opus_5.5.mjs --sheet=some/where.svg
//   node examples/castaway/src/114-cpc-demo-screen_opus_5.5.mjs --print-scroll
//   node examples/castaway/src/114-cpc-demo-screen_opus_5.5.mjs --inks
//
// Regenerates ../assets/114-cpc-demo-screen_opus_5.5.svg. Plain Node, no
// deps, deterministic (a seeded PRNG, no clock, no Math.random). --sheet
// writes a big contact sheet of the sprites for pixel work, --print-scroll
// prints the scroll text wrapped for the README, --inks prints which inks
// each part of the screen uses.
//
// The style (catalogue entry demo-10): an Amstrad CPC demo screen. Mode 0
// fat pixels (160 or 192 across, each twice as wide as it is tall), a
// palette of exactly 27 colours made of three levels (off, half, full) of
// red, green and blue, at most 16 inks on any one line, full overscan (the
// picture runs right over where the border would be), horizontal raster
// bands, a colour split that slides along a line, ordered dithering, and
// one wide 8x8 scroller along the bottom. No group's logo, font, picture or
// scrolltext is copied: the letters, both fonts, the island and every word
// are drawn and written for this file. The crew name, GATE AJAR, is made up.
//
// Units: one SVG unit is one Mode 1 pixel. A Mode 0 pixel is 2 units wide
// and 1 unit (one scanline) tall. The screen is 384 x 240 units with no
// border at all: 192 Mode 0 pixels across, 240 lines.
//
// What moves (all stepped, all on the 80 BPM beat of the theme where it can):
//   * The logo ripples once at the top of every bar (3 s): a two-pixel
//     wobble runs down it slice by slice, like a CRTC rupture, then it rests.
//   * The clouds drift one Mode 0 pixel a second.
//   * Sparkles on the sea are ink cycling: four groups of pixels cycle
//     through a ramp of blues and white over two bars, two beats apart.
//   * Two gulls cross the sky, flapping on the beat.
//   * She nods on every beat; the shore foam swaps on every second beat.
//   * A message in a bottle drifts in to the shore and washes straight back
//     out (24 s, eight bars).
//   * The Mode 1 strip has a mid-line colour split: the line's paper and ink
//     change part-way across the line, and the split slides along.
//   * The scroller moves one Mode 0 pixel per step, 30 steps a second.
// Nothing flashes: the biggest change is the split sliding, and the fastest
// is a gull's wings or a sparkle on a few pixels. prefers-reduced-motion
// holds one complete still frame (the logo at rest, both strip lines, the
// start of the scroll, the bottle parked at her shore).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '114-cpc-demo-screen_opus_5.5';
const arg = (name) => {
  const hit = process.argv.slice(2).find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : null;
};
const OUT = arg('out') ? path.resolve(arg('out')) : path.resolve(here, `../assets/${SLUG}.svg`);
const SHEET = arg('sheet') ? path.resolve(arg('sheet')) : null;
const T0 = Number(arg('at') || 0); // head start in seconds, for checking late frames (use with --out)

const n = (v, d = 3) => String(+(+v).toFixed(d));
const dly = (s) => `${n(s - T0)}s`;

// ------------------------------------------------------------------ palette
// The 27 hardware colours: every mix of 0, 50 and 100 percent red, green and
// blue. Nothing else appears on the screen; build() checks every fill.
const INK = {
  black: '#000000', blue: '#000080', brightBlue: '#0000FF', red: '#800000',
  magenta: '#800080', mauve: '#8000FF', brightRed: '#FF0000', purple: '#FF0080',
  brightMagenta: '#FF00FF', green: '#008000', cyan: '#008080', skyBlue: '#0080FF',
  yellow: '#808000', white: '#808080', pastelBlue: '#8080FF', orange: '#FF8000',
  pink: '#FF8080', pastelMagenta: '#FF80FF', brightGreen: '#00FF00', seaGreen: '#00FF80',
  brightCyan: '#00FFFF', lime: '#80FF00', pastelGreen: '#80FF80', pastelCyan: '#80FFFF',
  brightYellow: '#FFFF00', pastelYellow: '#FFFF80', brightWhite: '#FFFFFF',
};
{
  const hexes = new Set(Object.values(INK));
  if (hexes.size !== 27) throw new Error('palette must have 27 colours');
  for (const h of hexes) {
    for (const ch of [h.slice(1, 3), h.slice(3, 5), h.slice(5, 7)]) {
      if (!['00', '80', 'FF'].includes(ch)) throw new Error(`${h} is not a three-level colour`);
    }
  }
}
const hex = (c) => {
  if (!INK[c]) throw new Error(`unknown ink ${c}`);
  return INK[c];
};
// one-letter codes for sprite strings
const CODE = {
  K: 'black', b: 'blue', B: 'brightBlue', r: 'red', m: 'magenta', v: 'mauve',
  R: 'brightRed', p: 'purple', M: 'brightMagenta', g: 'green', c: 'cyan', s: 'skyBlue',
  y: 'yellow', w: 'white', l: 'pastelBlue', o: 'orange', k: 'pink', q: 'pastelMagenta',
  G: 'brightGreen', e: 'seaGreen', C: 'brightCyan', L: 'lime', n: 'pastelGreen',
  a: 'pastelCyan', Y: 'brightYellow', u: 'pastelYellow', W: 'brightWhite',
};

// ------------------------------------------------------------------ screen
const W = 384;
const H = 240;
const PX = W / 2; // Mode 0 pixels across
const BEAT = 0.75; // 80 BPM
const BAR = 4 * BEAT;

// ordered dither
const BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];
const bayer = (x, y) => (BAYER[y & 3][x & 3] + 0.5) / 16;
// one-dimensional ordered sequence for raster interleaves (line dithering)
const LINE_ORDER = [0, 8, 4, 12, 2, 10, 6, 14, 1, 9, 5, 13, 3, 11, 7, 15];
const lineThreshold = (y) => (LINE_ORDER[y & 15] + 0.5) / 16;

// seeded PRNG (mulberry32), seed 1992 like the video's default run
function prng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = prng(1992);

// ------------------------------------------------------------------ paths
// A set of pixels (keys "x,y") becomes one path: horizontal runs, identical
// runs stacked into rectangles. sx is the pixel width in units (2 in Mode 0).
const key = (x, y) => `${x},${y}`;
function pathOf(pixels, ox = 0, oy = 0, sx = 2, sy = 1) {
  const rows = new Map();
  for (const k of pixels) {
    const i = k.indexOf(',');
    const x = +k.slice(0, i);
    const y = +k.slice(i + 1);
    if (!rows.has(y)) rows.set(y, []);
    rows.get(y).push(x);
  }
  const runs = [];
  for (const [y, xs] of rows) {
    xs.sort((a, b) => a - b);
    let st = xs[0];
    let p = xs[0];
    for (let i = 1; i <= xs.length; i++) {
      if (i < xs.length && xs[i] === p + 1) { p = xs[i]; continue; }
      runs.push([st, p + 1, y]);
      if (i < xs.length) { st = xs[i]; p = xs[i]; }
    }
  }
  runs.sort((a, b) => a[2] - b[2] || a[0] - b[0]);
  const live = new Set(runs.map((r) => `${r[0]},${r[1]},${r[2]}`));
  const out = [];
  for (const r of runs) {
    const k0 = `${r[0]},${r[1]},${r[2]}`;
    if (!live.has(k0)) continue;
    live.delete(k0);
    let h = 1;
    while (live.has(`${r[0]},${r[1]},${r[2] + h}`)) { live.delete(`${r[0]},${r[1]},${r[2] + h}`); h++; }
    const w = (r[1] - r[0]) * sx;
    out.push(`M${n(ox + r[0] * sx)} ${n(oy + r[2] * sy)}h${n(w)}v${n(h * sy)}h${n(-w)}z`);
  }
  return out.join('');
}

// The same, split for size: rectangles two or more lines tall go in a filled
// path, single-line runs in a stroked path (a 1-unit line through the middle
// of a row covers exactly that row, and each further run on the row costs
// only a relative move). Returns markup for one colour.
function runsSvg(pixels, colour, ox = 0, oy = 0, sx = 2) {
  const rows = new Map();
  for (const k of pixels) {
    const i = k.indexOf(',');
    const x = +k.slice(0, i);
    const y = +k.slice(i + 1);
    if (!rows.has(y)) rows.set(y, []);
    rows.get(y).push(x);
  }
  const runs = [];
  for (const [y, xs] of rows) {
    xs.sort((a, b) => a - b);
    let st = xs[0];
    let p = xs[0];
    for (let i = 1; i <= xs.length; i++) {
      if (i < xs.length && xs[i] === p + 1) { p = xs[i]; continue; }
      runs.push([st, p + 1, y]);
      if (i < xs.length) { st = xs[i]; p = xs[i]; }
    }
  }
  runs.sort((a, b) => a[2] - b[2] || a[0] - b[0]);
  const rk = (a, b, y) => `${a},${b},${y}`;
  const live = new Set(runs.map((r) => rk(r[0], r[1], r[2])));
  const fill = [];
  const single = new Map();
  for (const r of runs) {
    const k0 = rk(r[0], r[1], r[2]);
    if (!live.has(k0)) continue;
    live.delete(k0);
    let h = 1;
    while (live.has(rk(r[0], r[1], r[2] + h))) { live.delete(rk(r[0], r[1], r[2] + h)); h++; }
    if (h > 1) {
      const w = (r[1] - r[0]) * sx;
      fill.push(`M${ox + r[0] * sx} ${oy + r[2]}h${w}v${h}h${-w}z`);
    } else {
      if (!single.has(r[2])) single.set(r[2], []);
      single.get(r[2]).push(r);
    }
  }
  const stroke = [];
  for (const [y, rs] of [...single].sort((a, b) => a[0] - b[0])) {
    rs.sort((a, b) => a[0] - b[0]);
    let d = `M${ox + rs[0][0] * sx} ${oy + y + 0.5}h${(rs[0][1] - rs[0][0]) * sx}`;
    for (let i = 1; i < rs.length; i++) d += `m${(rs[i][0] - rs[i - 1][1]) * sx} 0h${(rs[i][1] - rs[i][0]) * sx}`;
    stroke.push(d);
  }
  let out = '';
  if (fill.length) out += `<path fill="${hex(colour)}" d="${fill.join('')}"/>`;
  if (stroke.length) out += `<path stroke="${hex(colour)}" d="${stroke.join('')}"/>`;
  return out;
}

// A layer of Mode 0 pixels: x in Mode 0 pixels, y in lines.
class Layer {
  constructor(sx = 2) { this.sx = sx; this.m = new Map(); }
  set(x, y, c) {
    if (c === null || c === undefined) this.m.delete(key(x, y));
    else { hex(c); this.m.set(key(x, y), c); }
  }
  get(x, y) { return this.m.get(key(x, y)); }
  has(x, y) { return this.m.has(key(x, y)); }
  byColour() {
    const by = new Map();
    for (const [k, c] of this.m) {
      if (!by.has(c)) by.set(c, new Set());
      by.get(c).add(k);
    }
    return by;
  }
  svg(ox = 0, oy = 0, extra = () => '') {
    return [...this.byColour()].map(([c, set]) => runsSvg(set, c, ox, oy, this.sx)).join('');
  }
  // inks per line, for the 16-inks-a-line check
  lineInks(into, oy = 0) {
    for (const [k, c] of this.m) {
      const y = +k.slice(k.indexOf(',') + 1) + oy;
      if (!into.has(y)) into.set(y, new Set());
      into.get(y).add(c);
    }
  }
  stamp(rows, x0, y0, codes = CODE) {
    rows.forEach((r, y) => [...r].forEach((ch, x) => {
      if (ch === '.' || ch === ' ') return;
      if (!codes[ch]) throw new Error(`no code ${ch}`);
      this.set(x0 + x, y0 + y, codes[ch]);
    }));
  }
}

// ------------------------------------------------------------------ font
// A 5x7 font drawn for this screen, one-pixel strokes. In Mode 0 every font
// pixel is 2 units wide, so verticals come out twice as heavy as
// horizontals, which is the Mode 0 text look; in the Mode 1 strip the glyphs
// are emboldened by one pixel to the right, which gives the same weight at
// half the width. Cells are 8 pixels; rows past the seventh are descenders.
const FONT = {
  A: ['.###.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  B: ['####.', '#...#', '#...#', '####.', '#...#', '#...#', '####.'],
  C: ['.###.', '#...#', '#....', '#....', '#....', '#...#', '.###.'],
  D: ['###..', '#..#.', '#...#', '#...#', '#...#', '#..#.', '###..'],
  E: ['#####', '#....', '#....', '####.', '#....', '#....', '#####'],
  F: ['#####', '#....', '#....', '####.', '#....', '#....', '#....'],
  G: ['.###.', '#...#', '#....', '#.###', '#...#', '#...#', '.####'],
  H: ['#...#', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  I: ['.###.', '..#..', '..#..', '..#..', '..#..', '..#..', '.###.'],
  J: ['..###', '...#.', '...#.', '...#.', '#..#.', '#..#.', '.##..'],
  K: ['#...#', '#..#.', '#.#..', '##...', '#.#..', '#..#.', '#...#'],
  L: ['#....', '#....', '#....', '#....', '#....', '#....', '#####'],
  M: ['#...#', '##.##', '#.#.#', '#.#.#', '#...#', '#...#', '#...#'],
  N: ['#...#', '#...#', '##..#', '#.#.#', '#..##', '#...#', '#...#'],
  O: ['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  P: ['####.', '#...#', '#...#', '####.', '#....', '#....', '#....'],
  Q: ['.###.', '#...#', '#...#', '#...#', '#.#.#', '#..#.', '.##.#'],
  R: ['####.', '#...#', '#...#', '####.', '#.#..', '#..#.', '#...#'],
  S: ['.###.', '#...#', '#....', '.###.', '....#', '#...#', '.###.'],
  T: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..'],
  U: ['#...#', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  V: ['#...#', '#...#', '#...#', '#...#', '.#.#.', '.#.#.', '..#..'],
  W: ['#...#', '#...#', '#...#', '#.#.#', '#.#.#', '##.##', '#...#'],
  X: ['#...#', '#...#', '.#.#.', '..#..', '.#.#.', '#...#', '#...#'],
  Y: ['#...#', '#...#', '.#.#.', '..#..', '..#..', '..#..', '..#..'],
  Z: ['#####', '....#', '...#.', '..#..', '.#...', '#....', '#####'],
  0: ['.###.', '#...#', '#..##', '#.#.#', '##..#', '#...#', '.###.'],
  1: ['..#..', '.##..', '..#..', '..#..', '..#..', '..#..', '.###.'],
  2: ['.###.', '#...#', '....#', '..##.', '.#...', '#....', '#####'],
  3: ['.###.', '#...#', '....#', '..##.', '....#', '#...#', '.###.'],
  4: ['...#.', '..##.', '.#.#.', '#..#.', '#####', '...#.', '...#.'],
  5: ['#####', '#....', '####.', '....#', '....#', '#...#', '.###.'],
  6: ['..##.', '.#...', '#....', '####.', '#...#', '#...#', '.###.'],
  7: ['#####', '....#', '...#.', '..#..', '..#..', '..#..', '..#..'],
  8: ['.###.', '#...#', '#...#', '.###.', '#...#', '#...#', '.###.'],
  9: ['.###.', '#...#', '#...#', '.####', '....#', '...#.', '.##..'],
  '.': ['.....', '.....', '.....', '.....', '.....', '.##..', '.##..'],
  ',': ['.....', '.....', '.....', '.....', '.....', '.##..', '.##..', '.#...'],
  ':': ['.....', '.##..', '.##..', '.....', '.....', '.##..', '.##..'],
  ';': ['.....', '.##..', '.##..', '.....', '.....', '.##..', '.##..', '.#...'],
  "'": ['..#..', '..#..', '.#...', '.....', '.....', '.....', '.....'],
  '!': ['..#..', '..#..', '..#..', '..#..', '..#..', '.....', '..#..'],
  '?': ['.###.', '#...#', '....#', '..##.', '..#..', '.....', '..#..'],
  '-': ['.....', '.....', '.....', '.###.', '.....', '.....', '.....'],
  '/': ['....#', '....#', '...#.', '..#..', '.#...', '#....', '#....'],
  '(': ['...#.', '..#..', '.#...', '.#...', '.#...', '..#..', '...#.'],
  ')': ['.#...', '..#..', '...#.', '...#.', '...#.', '..#..', '.#...'],
  '+': ['.....', '..#..', '..#..', '#####', '..#..', '..#..', '.....'],
  '=': ['.....', '.....', '#####', '.....', '#####', '.....', '.....'],
  '*': ['.....', '#.#.#', '.###.', '#####', '.###.', '#.#.#', '.....'],
  // a quaver, written as ~ in the scroll text
  '~': ['..#..', '..##.', '..#.#', '..#..', '###..', '###..', '.....'],
  ' ': [],
};
function glyphPixels(ch, bold = false) {
  const rows = FONT[ch];
  if (!rows) throw new Error(`no glyph for "${ch}"`);
  const set = new Set();
  rows.forEach((r, y) => [...r].forEach((c, x) => {
    if (c !== '#') return;
    set.add(key(x, y));
    if (bold) set.add(key(x + 1, y));
  }));
  return set;
}
const glyphDefs = [];
const glyphIds = new Map();
// mode 0: font pixel = 2 x 1 units, cell 16 units; mode 1 bold: 1 x 1, cell 8
function glyphId(ch, mode) {
  const k = `${mode}${ch}`;
  if (glyphIds.has(k)) return glyphIds.get(k);
  const id = `${mode === 0 ? 'z' : 'y'}${glyphIds.size.toString(36)}`;
  glyphIds.set(k, id);
  const set = glyphPixels(ch, mode === 1);
  if (set.size) glyphDefs.push(`<path id="${id}" d="${pathOf(set, 0, 0, mode === 0 ? 2 : 1)}"/>`);
  return id;
}
function textUses(str, x, y, mode) {
  const cw = mode === 0 ? 16 : 8;
  const out = [];
  [...str].forEach((ch, i) => {
    const id = glyphId(ch, mode);
    if (ch === ' ') return;
    out.push(`<use href="#${id}" x="${x + i * cw}"${y ? ` y="${y}"` : ''}/>`);
  });
  return out.join('');
}
// glyph pixels of a whole string, in Mode 1 pixels, for clip paths
function textPixels(str, x, y, mode, into = new Set()) {
  const cw = mode === 0 ? 8 : 8; // in that mode's pixels
  [...str].forEach((ch, i) => {
    for (const k of glyphPixels(ch, mode === 1)) {
      const [gx, gy] = k.split(',').map(Number);
      into.add(key(x + i * cw + gx, y + gy));
    }
  });
  return into;
}

// ------------------------------------------------------------------ layout
const LOGO_Y = 9;
const LOGO_H = 44;
const HORIZON = 106;
const UI_Y = 180; // first line of the raster stack under the picture

// ------------------------------------------------------------------ raster bands
// The backdrop is one ink per line, as a raster routine would set it: bands
// of sky and sea, with interleaved lines where one band hands over to the
// next (the line-by-line version of an ordered dither).
const lineInk = new Array(H).fill('black');
function band(y0, y1, ink) { for (let y = y0; y < y1; y++) lineInk[y] = ink; }
function fade(y0, y1, a, b) {
  for (let y = y0; y < y1; y++) {
    const f = (y - y0 + 0.5) / (y1 - y0);
    lineInk[y] = f > lineThreshold(y) ? b : a;
  }
}
// sky
band(0, 22, 'brightBlue');
fade(22, 38, 'brightBlue', 'skyBlue');
band(38, 64, 'skyBlue');
fade(64, 84, 'skyBlue', 'brightCyan');
band(84, 94, 'brightCyan');
fade(94, 103, 'brightCyan', 'pastelCyan');
band(103, HORIZON, 'pastelCyan');
// sea
band(HORIZON, HORIZON + 2, 'blue');
fade(HORIZON + 2, 116, 'blue', 'brightBlue');
fade(116, 132, 'brightBlue', 'skyBlue');
band(132, 160, 'skyBlue');
fade(160, 176, 'skyBlue', 'brightBlue');
band(176, UI_Y, 'brightBlue');

// ------------------------------------------------------------------ logo
// Hand-made letter outlines (x in units, y in lines, 44 lines tall), slanted,
// then rasterised onto the Mode 0 grid and shaded with a 4x4 ordered dither
// from cream through yellow and orange to hot pink and plum. One-pixel black
// outline, navy extrusion down and to the right, white top edges.
const LETTERS = {
  C: { w: 36, polys: [[[8, 0], [36, 0], [36, 11], [12, 11], [12, 33], [36, 33], [36, 44], [8, 44], [0, 36], [0, 8]]] },
  A: { w: 36, polys: [[[8, 0], [28, 0], [36, 8], [36, 44], [24, 44], [24, 30], [12, 30], [12, 44], [0, 44], [0, 8]], [[12, 11], [24, 11], [24, 19], [12, 19]]] },
  S: { w: 36, polys: [[[8, 0], [36, 0], [36, 11], [12, 11], [12, 17], [28, 17], [36, 25], [36, 36], [28, 44], [0, 44], [0, 33], [24, 33], [24, 28], [8, 28], [0, 20], [0, 8]]] },
  T: { w: 36, polys: [[[0, 0], [36, 0], [36, 11], [24, 11], [24, 44], [12, 44], [12, 11], [0, 11]]] },
  W: { w: 52, polys: [[[0, 0], [12, 0], [12, 33], [20, 33], [20, 14], [32, 14], [32, 33], [40, 33], [40, 0], [52, 0], [52, 36], [44, 44], [8, 44], [0, 36]]] },
  Y: { w: 36, polys: [[[0, 0], [12, 0], [12, 15], [24, 15], [24, 0], [36, 0], [36, 19], [28, 27], [24, 27], [24, 44], [12, 44], [12, 27], [8, 27], [0, 19]]] },
};
const LOGO_WORD = 'CASTAWAY';
const LOGO_GAP = 6;
const SLANT = 0.2; // units of lean per line
function inPoly(poly, x, y) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
const logoMask = new Set(); // Mode 0 pixels, logo-local
let logoW = 0;
{
  let lx = 0;
  for (const ch of LOGO_WORD) {
    const L = LETTERS[ch];
    for (let y = 0; y < LOGO_H; y++) {
      const yc = y + 0.5;
      const lean = (LOGO_H - yc) * SLANT;
      for (let px = Math.floor(lx / 2) - 1; px < Math.ceil((lx + L.w + LOGO_H * SLANT) / 2) + 1; px++) {
        const xc = px * 2 + 1 - lx - lean;
        let inside = false;
        for (const poly of L.polys) if (inPoly(poly, xc, yc)) inside = !inside;
        if (inside) logoMask.add(key(px, y));
      }
    }
    lx += L.w + LOGO_GAP;
  }
  logoW = lx - LOGO_GAP + LOGO_H * SLANT;
}
const LOGO_PX = Math.round((PX - Math.ceil(logoW / 2) - 3) / 2); // left edge in Mode 0 pixels, room for the extrusion
const logo = new Layer();
{
  const inL = (x, y) => logoMask.has(key(x, y));
  // extrusion: the letters pushed 1 pixel right and 1..3 lines down
  const ext = new Set();
  for (const k of logoMask) {
    const [x, y] = k.split(',').map(Number);
    for (const [dx, dy] of [[0, 1], [1, 1], [1, 2], [1, 3], [2, 3], [2, 4]]) ext.add(key(x + dx, y + dy));
  }
  const solid = new Set([...logoMask, ...ext]);
  // outline around everything
  for (const k of solid) {
    const [x, y] = k.split(',').map(Number);
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const kk = key(x + dx, y + dy);
      if (!solid.has(kk)) logo.set(x + dx + LOGO_PX, y + dy + LOGO_Y, 'black');
    }
  }
  for (const k of ext) {
    if (logoMask.has(k)) continue;
    const [x, y] = k.split(',').map(Number);
    // the extrusion: navy, with violet on its upper lip
    const lip = logoMask.has(key(x, y - 1)) || logoMask.has(key(x - 1, y - 1));
    logo.set(x + LOGO_PX, y + LOGO_Y, lip && bayer(x, y) < 0.5 ? 'mauve' : 'blue');
  }
  // face: ramp stops [line, ramp index]
  const RAMP = ['brightWhite', 'pastelYellow', 'brightYellow', 'orange', 'purple', 'magenta'];
  const STOPS = [[0, 1], [5, 1], [12, 2], [17, 2], [24, 3], [29, 3], [36, 4], [40, 4], [44, 5]];
  const rampAt = (y) => {
    for (let i = 0; i < STOPS.length - 1; i++) {
      const [ya, va] = STOPS[i];
      const [yb, vb] = STOPS[i + 1];
      if (y >= ya && y < yb) return va + ((vb - va) * (y - ya)) / (yb - ya);
    }
    return STOPS[STOPS.length - 1][1];
  };
  for (const k of logoMask) {
    const [x, y] = k.split(',').map(Number);
    const v = rampAt(y + 0.5);
    let i = Math.floor(v) + ((v - Math.floor(v)) > bayer(x, y) ? 1 : 0);
    if (!inL(x, y - 1)) i = 0; // lit top edge
    else if (!inL(x - 1, y) && i > 1) i -= 1; // lighter left edge
    else if (!inL(x, y + 1)) i = 5; // plum underside
    logo.set(x + LOGO_PX, y + LOGO_Y, RAMP[Math.min(i, 5)]);
  }
}

// ------------------------------------------------------------------ scene
// Island, palm, raft, her and the clouds, all in Mode 0 pixels.
const scene = new Layer();
const ellipseIn = (x, y, cx, cy, rx, ry) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2;
// centre of Mode 0 pixel in units
const ux = (px) => px * 2 + 1;

const ISLE = { cx: 196, cy: 141, rx: 80, ry: 11 };
// lagoon: shallow water around the island, dithered into the sea
for (let y = HORIZON + 10; y < UI_Y - 6; y++) {
  for (let px = 0; px < PX; px++) {
    const d = ellipseIn(ux(px), y + 0.5, ISLE.cx + 4, ISLE.cy + 3, ISLE.rx + 34, ISLE.ry + 14);
    if (d >= 1) continue;
    const f = (1 - d) * 2.2; // 0 at the rim, 1+ further in
    if (f > bayer(px, y) * 1.1) scene.set(px, y, f > 1 + bayer(px, y) * 0.8 ? 'pastelCyan' : 'brightCyan');
  }
}
// wet rim and sand
for (let y = ISLE.cy - ISLE.ry - 2; y < ISLE.cy + ISLE.ry + 3; y++) {
  for (let px = 0; px < PX; px++) {
    const d = ellipseIn(ux(px), y + 0.5, ISLE.cx, ISLE.cy, ISLE.rx, ISLE.ry);
    if (d < 1) {
      const top = (y - (ISLE.cy - ISLE.ry)) / (2 * ISLE.ry); // 0 top .. 1 bottom
      // light from the upper left; darker towards the rim
      const v = 0.15 + top * 1.1 + ((ux(px) - ISLE.cx) / ISLE.rx) * 0.35 + d ** 6 * 1.1;
      const RAMP = ['pastelYellow', 'brightYellow', 'yellow'];
      const i = Math.max(0, Math.min(2, Math.floor(v) + ((v - Math.floor(v)) > bayer(px, y) ? 1 : 0)));
      let c = RAMP[i];
      if (d > 0.86 && top > 0.45) c = 'yellow'; // wet sand at the waterline
      scene.set(px, y, c);
    }
  }
}
// footprints along the island: she jogs the length of it and back. Two
// trails, out and back, each a line of prints that alternate left foot,
// right foot, drawn after the palm's shadow so they stay on top of it.
function footprints() {
  for (const [y0, x0, x1] of [[143, 84, 128], [146, 86, 126]]) {
    let i = 0;
    for (let px = x0; px <= x1; px += 3, i++) {
      const y = y0 + (i & 1);
      if (scene.has(px, y) && scene.get(px, y) !== 'green' && scene.get(px, y) !== 'brightGreen') scene.set(px, y, 'yellow');
    }
  }
}
// a soft shadow of the palm on the sand, and two grey rocks at the waterline
for (let y = ISLE.cy - 3; y < ISLE.cy + 4; y++) {
  for (let px = 0; px < PX; px++) {
    const d = ellipseIn(ux(px), y + 0.5, 246, ISLE.cy + 1, 26, 3.6);
    if (d < 1 && bayer(px, y) < 0.5 && scene.get(px, y)) scene.set(px, y, 'yellow');
  }
}
scene.stamp(['.wwW', 'wwwww', 'Kwwwy'.replace('K', 'w'), '.yyy.'], 66, 147);
scene.stamp(['.wW.', 'wwww', '.yy.'], 133, 149);
footprints();

// bushes at the foot of the palm and on the left of the island
function bush(cx, cy, rx, ry) {
  for (let y = cy - ry; y <= cy + ry; y++) {
    for (let px = 0; px < PX; px++) {
      const d = ellipseIn(ux(px), y + 0.5, cx, cy, rx, ry);
      if (d >= 1 || y > cy + 1) continue;
      const lit = (cy - y) / ry - (ux(px) - cx) / rx * 0.3;
      let c = 'green';
      if (lit > 0.15 && bayer(px, y) < lit) c = 'brightGreen';
      if (lit > 0.6 && bayer(px, y) < 0.3) c = 'lime';
      if (d > 0.82 && bayer(px, y) > 0.55) continue; // ragged edge
      scene.set(px, y, c);
    }
  }
}
bush(232, 133, 18, 6);
bush(258, 135, 12, 4);
bush(178, 134, 13, 4);
bush(122, 137, 8, 3);

// the palm: a tall, slender, slightly curved trunk with banded bark
const PALM = { bx: 238, by: 136, tx: 214, ty: 64 };
{
  const len = PALM.by - PALM.ty;
  for (let y = PALM.ty; y <= PALM.by; y++) {
    const t = (PALM.by - y) / len; // 0 base .. 1 top
    const cx = PALM.bx + (PALM.tx - PALM.bx) * (t ** 1.4) + 5 * Math.sin(Math.PI * t);
    const w = 8.5 - 3.2 * t;
    for (let px = Math.floor((cx - w) / 2); px <= Math.ceil((cx + w) / 2); px++) {
      const u = ux(px);
      if (Math.abs(u - cx) > w / 2) continue;
      const side = (u - cx) / (w / 2); // -1 left .. 1 right
      const ring = (y - PALM.ty) % 4 === 0;
      let c = side < -0.35 ? 'orange' : side > 0.45 ? 'red' : (ring ? 'red' : 'orange');
      if (ring && side < -0.35) c = 'red';
      scene.set(px, y, c);
    }
  }
}
// the crown. Each frond is a spine (a quadratic curve that arches up and
// droops) with a blade hanging under it; the lower half of the blade is cut
// into a comb of leaflets that lean outwards. Back fronds are darker.
const crown = { x: PALM.tx + 2, y: PALM.ty - 1 };
const FRONDS = [
  { d: -1, R: 50, lift: 16, droop: 4, T: 6, back: true },
  { d: 1, R: 54, lift: 16, droop: 6, T: 6, back: true },
  { d: -1, R: 34, lift: 18, droop: -5, T: 5 },
  { d: 1, R: 38, lift: 18, droop: -3, T: 5 },
  { d: -1, R: 66, lift: 12, droop: 22, T: 7 },
  { d: 1, R: 64, lift: 10, droop: 24, T: 7 },
  { d: -1, R: 38, lift: 0, droop: 36, T: 6 },
  { d: 1, R: 40, lift: 0, droop: 38, T: 6 },
];
function drawFrond(f) {
  const P0 = [crown.x, crown.y];
  const P1 = [crown.x + f.d * f.R * 0.42, crown.y - f.lift];
  const P2 = [crown.x + f.d * f.R, crown.y + f.droop];
  const best = new Map(); // pixel -> smallest depth ratio seen
  for (let s = 0; s <= 1; s += 0.004) {
    const x = (1 - s) ** 2 * P0[0] + 2 * (1 - s) * s * P1[0] + s * s * P2[0];
    const y = (1 - s) ** 2 * P0[1] + 2 * (1 - s) * s * P1[1] + s * s * P2[1];
    const depth = 1 + f.T * Math.sin(Math.PI * Math.min(1, 0.08 + s)) ** 0.6 * (1 - 0.3 * s);
    const px = Math.floor(x / 2);
    for (let yy = Math.floor(y) - 1; yy <= Math.floor(y + depth); yy++) {
      const r = (yy + 0.5 - y) / depth;
      const k = key(px, yy);
      if (!best.has(k) || Math.abs(r) < Math.abs(best.get(k)[0])) best.set(k, [r, s]);
    }
  }
  for (const [k, [r, s]] of best) {
    const [px, yy] = k.split(',').map(Number);
    let c;
    if (r < 0) c = f.back ? 'green' : (s > 0.25 && bayer(px, yy) < 0.6 ? 'lime' : 'brightGreen');
    else if (r < 0.55) c = f.back ? 'green' : (r < 0.3 || bayer(px, yy) < 0.5 ? 'brightGreen' : 'green');
    else {
      // comb: one leaflet every other pixel, leaning outwards with depth
      if (r > 0.92 && bayer(px, yy) < 0.5) continue; // ragged tips
      const lean = Math.floor((r * 10) / 3) * f.d;
      if (((px - lean) & 1) !== 0) continue;
      c = f.back ? 'cyan' : 'green';
    }
    scene.set(px, yy, c);
  }
}
for (const f of FRONDS.filter((f) => f.back)) drawFrond(f);
for (const f of FRONDS.filter((f) => !f.back)) drawFrond(f);
// coconuts under the crown
scene.stamp(['.yo.yo.', 'yyyyyyy', '.yy.yy.', '..yo...', '..yy...'], Math.floor(crown.x / 2) - 3, crown.y + 2);

// the raft: five logs lashed together, floating right of the island
for (let i = 0; i < 4; i++) {
  const y = 143 + i * 2;
  const x0 = 147 + (i % 2);
  for (let px = x0; px < x0 + 26; px++) {
    scene.set(px, y, 'orange');
    scene.set(px, y + 1, 'red');
  }
  scene.set(x0 + 26, y, 'red');
  scene.set(x0 + 26, y + 1, 'black');
}
for (const px of [151, 159, 168]) for (let y = 143; y < 151; y++) if ((y & 1) === 0) scene.set(px, y, 'pastelYellow');
for (let px = 147; px < 175; px++) if (!scene.has(px, 151)) scene.set(px, 151, 'blue');

// her: standing on the left of the island, facing the palm, headphones on.
// Coral tank top (orange is the nearest of the 27), cream shorts and
// headphones (pastel yellow), brown hair in a low bun (dark red), bare feet.
const HER_HEAD = [
  '..uu..',
  '.urru.',
  '.rrrr.',
  'urkkru',
  'urkkru',
  '.rkkr.',
];
const HER_BODY = [
  '..kk..',
  '.oooo.',
  'kooook',
  'kooook',
  'kooook',
  'kooook',
  'k.oo.k',
  'kuuuuk',
  '.uuuu.',
  '.uuuu.',
  '.k..k.',
  '.k..k.',
  '.k..k.',
  '.k..k.',
  '.k..k.',
  '.k..k.',
  '.k..k.',
  '.k..k.',
  'kk..kk',
];
const HER = { x: 73, y: 111 };
const herHead = new Layer();
herHead.stamp(HER_HEAD, HER.x, HER.y);
{
  // a one-pixel black outline, so she reads against the busy water: the
  // head carries its own (it nods), the body's stops at the neck
  const body = new Layer();
  body.stamp(HER_BODY, HER.x, HER.y + HER_HEAD.length);
  const near = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  for (const [k] of body.m) {
    const [x, y] = k.split(',').map(Number);
    for (const [dx, dy] of near) {
      const gap = dy === 0 && (body.has(x + 2 * dx, y) || body.has(x + 3 * dx, y));
      if (!gap && !body.has(x + dx, y + dy) && !herHead.has(x + dx, y + dy)) scene.set(x + dx, y + dy, 'black');
    }
  }
  for (const [k, c] of body.m) { const [x, y] = k.split(',').map(Number); scene.set(x, y, c); }
  const ring = [];
  for (const [k] of herHead.m) {
    const [x, y] = k.split(',').map(Number);
    for (const [dx, dy] of near) {
      if (dy === 1) continue;
      if (!herHead.has(x + dx, y + dy) && !body.has(x + dx, y + dy)) ring.push([x + dx, y + dy]);
    }
  }
  for (const [x, y] of ring) herHead.set(x, y, 'black');
}

// shore foam, two frames, swapped every second beat
const foam = [new Layer(), new Layer()];
for (let y = ISLE.cy - ISLE.ry - 1; y < ISLE.cy + ISLE.ry + 3; y++) {
  for (let px = 0; px < PX; px++) {
    const d = ellipseIn(ux(px), y + 0.5, ISLE.cx, ISLE.cy + 1, ISLE.rx + 5, ISLE.ry + 2.2);
    if (d < 1 && d > 0.8 && !scene.has(px, y)) {
      for (let f = 0; f < 2; f++) {
        if (((px + y * 3 + f * 2) % 4) < 2) foam[f].set(px, y, (px + f) % 5 === 0 ? 'pastelCyan' : 'brightWhite');
      }
    }
  }
}
// keep foam off the raft and rocks
for (const L of foam) for (const k of [...L.m.keys()]) if (scene.m.has(k)) L.m.delete(k);

// clouds: soft cumulus, flat-bottomed, drawn on a strip that wraps
const clouds = new Layer();
function cloud(cx, base, puffs) {
  const top = Math.min(...puffs.map(([, dy, r]) => base + dy - r));
  for (let y = Math.floor(top); y < base; y++) {
    for (let px = Math.floor((cx - 60) / 2); px < Math.ceil((cx + 60) / 2); px++) {
      const u = ux(px);
      let inside = false;
      for (const [dx, dy, r] of puffs) if (((u - cx - dx) / 1) ** 2 + (y + 0.5 - base - dy) ** 2 < r * r) inside = true;
      if (!inside) continue;
      const t = (y - top) / (base - top); // 0 top .. 1 bottom
      let c = 'brightWhite';
      if (t > 0.55 && bayer(px, y) < (t - 0.55) * 2.6) c = 'pastelCyan';
      if (t > 0.85 && bayer(px, y) < 0.5) c = 'pastelBlue';
      const wx = ((px % PX) + PX) % PX;
      clouds.set(wx, y, c);
    }
  }
}
cloud(52, 82, [[-22, 0, 7], [-10, -3, 10], [6, -5, 12], [20, -1, 8], [30, 0, 5]]);
cloud(300, 74, [[-16, 0, 6], [-4, -2, 9], [10, -3, 8], [22, 0, 5]]);
cloud(176, 96, [[-14, 0, 5], [-2, -2, 7], [10, -1, 6], [20, 0, 4]]);
cloud(368, 92, [[-8, 0, 4], [2, -2, 6], [12, 0, 4]]);

// the bottle (a message in one), cork to the left, the rolled note showing
// through the glass. A black outline above the waterline and a navy one
// below keep it readable on the bright lagoon.
const bottle = new Layer();
bottle.stamp([
  '..KKKK.',
  'KKgGGeK',
  'oeWWWgK',
  'bbggggb',
  '..bbbb.',
], 0, 0);

// sea sparkles: little runs of light on the water, in four inks that cycle
const sparkle = [new Layer(), new Layer(), new Layer(), new Layer()];
for (let i = 0; i < 70; i++) {
  const y = Math.floor(HORIZON + 4 + rnd() * (UI_Y - HORIZON - 10));
  const len = 1 + Math.floor(rnd() * (y > 150 ? 3 : 2));
  const px = Math.floor(rnd() * (PX - len));
  let ok = true;
  for (let x = px - 1; x <= px + len; x++) if (scene.has(x, y) || scene.has(x, y - 1) || scene.has(x, y + 1)) ok = false;
  if (!ok) continue;
  const ph = Math.floor(rnd() * 4);
  for (let x = px; x < px + len; x++) sparkle[ph].set(x, y, 'brightCyan');
}

// ------------------------------------------------------------------ strip (Mode 1)
const STRIP_LINES = [
  'A TEN-HOUR LO-FI ISLAND VIDEO. SHE IDLES.',
  'SUN: FULL.  EFFORT: HALF.  PLOT: OFF.',
];

// ------------------------------------------------------------------ scroller
export const SCROLL = [
  'GATE AJAR PRESENTS ... CASTAWAY',
  'TEN HOURS OF ONE TINY ISLAND, ONE TALL PALM, ONE RAFT AND ONE YOUNG WOMAN IN HEADPHONES, NODDING ALONG.',
  'THIS SCREEN RUNS IN FULL OVERSCAN: THE PICTURE GOES RIGHT OVER THE BORDER. SHE MOSTLY STAYS PUT.',
  'EVERY SO OFTEN SOMETHING HAPPENS. A BOTTLE WASHES STRAIGHT BACK. A DRONE DELIVERS MORE HEADPHONES. A COCONUT LANDS ON A HERMIT CRAB, AND THE CRAB WALKS OFF WEARING IT. A GREY TABBY ARRIVES ON A CRATE, NAPS UP THE PALM AND, ONE DAY, FLOATS OFF AGAIN.',
  'DEMO CODERS WAIT FOR THE NEXT RASTER LINE. SHE WAITS FOR THE NEXT BAR: EVERY GAG STARTS ON THE NEXT BAR OF THE MUSIC, EVERY 3 SECONDS.',
  'BAR COUNT: THREE RASTER BARS ON THIS SCREEN, TWENTY IN EVERY LOOP OF THE THEME, AND ONE BAR OF SIGNAL, AT THE TOP OF THE PALM.',
  'MORE THAN 90 ACTIVITIES. FOUR TIMERS, FROM EVERY 2 TO 5 MINUTES TO EVERY 3 TO 6 HOURS, AND A FEW FOLLOW-UPS ON CUE.',
  'EVERY SOUND IS SYNTHESIZED FROM CODE: NO SAMPLES, NO BORROWED LOOPS, NO RECORDINGS.',
  'TO RUN IT: PYTHON TOOLS/SERVE.PY, THEN OPEN 127.0.0.1:8765',
  'AN UNOFFICIAL LO-FI REMAKE, INSPIRED BY A 1992 DESERT-ISLAND SCREENSAVER.',
  '27 COLOURS, AND NOT ONE OF THEM IS NIGHT.',
  'SHE COULD LEAVE ANY TIME, YOU KNOW. THE GATE IS AJAR. ONCE IN A VERY LONG WHILE SHE DOES: SHE STROLLS OUT ACROSS THE WATER, COMES BACK WITH AN ICED COFFEE AND SITS DOWN. NEVER EXPLAINED.',
  'WRAP ...',
];
const SCROLL_TEXT = `${SCROLL.join(' ~ ')} ~ `;
if (process.argv.includes('--print-scroll')) {
  const out = [];
  let line = '';
  for (const word of SCROLL.join(' ~ ').split(' ')) {
    if ((line + (line ? ' ' : '') + word).length > 48) { out.push(line); line = word; } else line += (line ? ' ' : '') + word;
  }
  out.push(line);
  console.log(out.join('\n').replace(/~/g, '♪'));
  process.exit(0);
}

// ------------------------------------------------------------------ build
const css = ['path[stroke]{fill:none;stroke-width:1px}'];
const defs = [];
const body = [];
const inksAt = new Map(); // line -> Set of inks, for the check
const note = (y, c) => { if (!inksAt.has(y)) inksAt.set(y, new Set()); inksAt.get(y).add(c); };

// 1. raster backdrop
{
  let y0 = 0;
  // down to the raster stack, which draws its own lines
  for (let y = 1; y <= UI_Y; y++) {
    if (y === UI_Y || lineInk[y] !== lineInk[y0]) {
      body.push(`<rect y="${y0}" width="${W}" height="${y - y0}" fill="${hex(lineInk[y0])}"/>`);
      y0 = y;
    }
  }
}

// 2. clouds, drifting one Mode 0 pixel a second, drawn twice so they wrap
{
  defs.push(`<g id="cl">${clouds.svg()}</g>`);
  body.push(`<g class="drift"><use href="#cl"/><use href="#cl" x="${W}"/></g>`);
  css.push(`.drift{animation:drift ${PX}s steps(${PX}) infinite;animation-delay:${dly(0)}}`);
  css.push(`@keyframes drift{from{transform:translateX(0)}to{transform:translateX(-${W}px)}}`);
  clouds.lineInks(inksAt);
}

// 2b. two distant gulls crossing the sky, flapping on the beat
{
  const UP = new Layer();
  UP.stamp(['W...W', '.W.W.', '..W..'], 0, 0);
  const DN = new Layer();
  DN.stamp(['.....', '.WWW.', 'W.W.W'], 0, 0);
  defs.push(`<g id="gu"><g class="fa">${UP.svg()}</g><g class="fb">${DN.svg()}</g></g>`);
  const GULLS = [{ y: 68, period: 72, at: 0.3 }, { y: 80, period: 96, at: 0.72 }];
  GULLS.forEach((g, i) => {
    body.push(`<g transform="translate(0 ${g.y})"><g class="gl" style="animation-duration:${g.period}s;animation-delay:${dly(-g.period * g.at)}"><use href="#gu" x="${-12 - i * 6}"/></g></g>`);
    for (let k = 0; k < 3; k++) note(g.y + k, 'brightWhite');
  });
  const span = W + 24;
  css.push(`.gl{animation:gl 72s steps(${span / 2}) infinite}@keyframes gl{from{transform:translateX(0)}to{transform:translateX(${span}px)}}`);
  css.push(`.fa,.fb{animation:fa ${BEAT}s step-end infinite}.fb{animation-name:fb}@keyframes fa{0%{opacity:1}50%{opacity:0}}@keyframes fb{0%{opacity:0}50%{opacity:1}}`);
}

// 3. sea sparkles: ink cycling, four inks a beat apart
{
  const RAMP = ['skyBlue', 'brightCyan', 'pastelCyan', 'brightWhite', 'pastelCyan', 'brightCyan', 'skyBlue', 'skyBlue'];
  const st = RAMP.map((c, i) => `${n((i / RAMP.length) * 100, 2)}%{fill:${hex(c)}}`).join('');
  css.push(`.sp{animation:sp ${BAR * 2}s step-end infinite}`);
  css.push(`@keyframes sp{${st}100%{fill:${hex(RAMP[0])}}}`);
  sparkle.forEach((L, i) => {
    const set = new Set(L.m.keys());
    if (!set.size) return;
    body.push(`<path class="sp" style="animation-delay:${dly(-i * BAR * 0.5)}" fill="${hex('brightCyan')}" d="${pathOf(set)}"/>`);
    for (const k of set) for (const c of RAMP) note(+k.split(',')[1], c);
  });
}

// 4. the island picture
body.push(scene.svg());
scene.lineInks(inksAt);
foam.forEach((L, i) => {
  body.push(`<g class="fo${i}">${L.svg()}</g>`);
  L.lineInks(inksAt);
});
css.push(`.fo0,.fo1{animation:fo ${BEAT * 4}s step-end infinite}.fo1{animation-delay:${dly(-BEAT * 2)}}.fo0{animation-delay:${dly(0)}}`);
css.push('@keyframes fo{0%{opacity:1}50%{opacity:0}100%{opacity:1}}');
// her head nods on the beat
body.push(`<g class="nod">${herHead.svg()}</g>`);
herHead.lineInks(inksAt);
css.push(`.nod{animation:nod ${BEAT}s step-end infinite;animation-delay:${dly(0)}}`);
css.push('@keyframes nod{0%{transform:translateY(0)}50%{transform:translateY(1px)}100%{transform:translateY(0)}}');

// 5. the bottle: drifts in from the left to her shore, bobs, washes straight back out
{
  const BY = 151;
  const xs = -14; // units, off screen
  const xe = 118; // at the shore
  const LOOP = BAR * 8;
  defs.push(`<g id="bt">${bottle.svg()}</g>`);
  body.push(`<g class="bt" transform="translate(0 ${BY})"><g class="btx"><g class="bob"><use href="#bt"/></g></g></g>`);
  // in over 3 bars, rest a bar, out over 3 bars, gone a bar
  const kf = [
    [0, xs], [37.5, xe], [50, xe], [87.5, xs], [100, xs],
  ];
  const steps = Math.round((xe - xs) / 2);
  css.push(`.btx{animation:btx ${LOOP}s infinite;animation-delay:${dly(0)};animation-timing-function:steps(${steps},end)}`);
  css.push(`@keyframes btx{${kf.map(([p, x]) => `${p}%{transform:translateX(${x}px)}`).join('')}}`);
  css.push(`.bob{animation:nod ${BEAT * 2}s step-end infinite}`);
  bottle.lineInks(inksAt, BY);
  bottle.lineInks(inksAt, BY + 1);
}

// 6. the logo, in slices that ripple once a bar
{
  defs.push(`<g id="lg">${logo.svg()}</g>`);
  logo.lineInks(inksAt);
  const SL = 2; // lines per slice
  const y0 = LOGO_Y - 1;
  const y1 = LOGO_Y + LOGO_H + 6;
  const parts = [];
  for (let y = y0, i = 0; y < y1; y += SL, i++) {
    defs.push(`<clipPath id="r${i}"><rect y="${y}" width="${W}" height="${SL}"/></clipPath>`);
    parts.push(`<g clip-path="url(#r${i})"><use class="rp" style="animation-delay:${dly(i * 0.03)}" href="#lg"/></g>`);
  }
  body.push(parts.join(''));
  const WOBBLE = [2, 4, 2, 0, -2, -4, -2, 0];
  const kf = WOBBLE.map((dx, i) => `${n(((i + 1) * 2.2), 2)}%{transform:translateX(${dx}px)}`).join('');
  css.push(`.rp{animation:rp ${BAR}s step-end infinite}`);
  css.push(`@keyframes rp{0%{transform:translateX(0)}${kf}100%{transform:translateX(0)}}`);
}

// 7. the raster stack under the picture: a bar, the Mode 1 strip, a bar,
//    the scroller, a bar
function rasterBar(y, inks) {
  inks.forEach((c, i) => { body.push(`<rect y="${y + i}" width="${W}" height="1" fill="${hex(c)}"/>`); note(y + i, c); });
  return y + inks.length;
}
const BAR_COOL = ['blue', 'mauve', 'pastelBlue', 'brightWhite', 'pastelBlue', 'mauve', 'blue'];
const BAR_WARM = ['red', 'brightRed', 'orange', 'pastelYellow', 'orange', 'brightRed', 'red'];
let yy = UI_Y;
yy = rasterBar(yy, BAR_COOL);
// Mode 1 strip with a sliding mid-line split
const STRIP_Y = yy;
const STRIP_H = 22;
{
  const PAPER = ['magenta', 'blue'];
  const PEN = ['pastelYellow', 'brightWhite'];
  const SLOPE = 8; // the split leans: it moves this many units across the strip's height
  // a texture two screens wide: paper A, then paper B, with a slanted edge
  const tex = (a, b, off) => {
    const top = STRIP_Y;
    const bot = STRIP_Y + STRIP_H;
    // period 2W: ink a for one screen width, ink b for the next; the group
    // slides right by 2W per loop, so draw from -2W to 2W
    const pa = [];
    const pb = [];
    for (let k = -2; k < 2; k++) {
      const e0 = k * W + off;
      const e1 = e0 + W;
      ((k & 1) === 0 ? pa : pb).push(`M${e0} ${top}H${e1}L${e1 - SLOPE} ${bot}H${e0 - SLOPE}z`);
    }
    return `<path fill="${hex(a)}" d="${pa.join('')}"/><path fill="${hex(b)}" d="${pb.join('')}"/>`;
  };
  body.push(`<g class="split">${tex(PAPER[0], PAPER[1], 0)}</g>`);
  // text: the glyph pixels clip a second texture with the pen inks, its split
  // a few units behind the paper's (the second ink change lands a little later)
  const pix = new Set();
  STRIP_LINES.forEach((line, i) => {
    const x = Math.round((W / 8 - line.length) / 2) * 8;
    textPixels(line, x, STRIP_Y + 3 + i * 10, 1, pix);
  });
  defs.push(`<clipPath id="st"><path d="${pathOf(pix, 0, 0, 1)}"/></clipPath>`);
  body.push(`<g clip-path="url(#st)"><g class="split">${tex(PEN[0], PEN[1], -12)}</g></g>`);
  css.push(`.split{animation:split ${BAR * 4}s steps(${W / 2}) infinite;animation-delay:${dly(0)}}`);
  css.push(`@keyframes split{from{transform:translateX(0)}to{transform:translateX(${2 * W}px)}}`);
  for (let y = STRIP_Y; y < STRIP_Y + STRIP_H; y++) [...PAPER, ...PEN].forEach((c) => note(y, c));
}
yy = STRIP_Y + STRIP_H;
yy = rasterBar(yy, BAR_WARM);
// scroller: wide Mode 0 type, one ink per line (split rasters)
const SCR_Y = yy + 2;
{
  for (let y = yy; y < yy + 11; y++) { body.push(`<rect y="${y}" width="${W}" height="1" fill="${hex('black')}"/>`); note(y, 'black'); }
  const SCR_INKS = ['pastelCyan', 'brightCyan', 'brightWhite', 'pastelYellow', 'brightYellow', 'orange', 'purple', 'purple'];
  const stops = SCR_INKS.map((c, i) => `<stop offset="${n(i / 8)}" stop-color="${hex(c)}"/><stop offset="${n((i + 1) / 8)}" stop-color="${hex(c)}"/>`).join('');
  defs.push(`<linearGradient id="sg" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="8">${stops}</linearGradient>`);
  SCR_INKS.forEach((c, i) => note(SCR_Y + i, c));
  const L = SCROLL_TEXT.length * 16;
  defs.push(`<g id="sc">${textUses(SCROLL_TEXT, 0, 0, 0)}</g>`);
  const STEPS_PER_S = 30;
  const dur = L / 2 / STEPS_PER_S;
  body.push(`<g fill="url(#sg)" transform="translate(0 ${SCR_Y})"><g class="scroll"><use href="#sc"/><use href="#sc" x="${L}"/></g></g>`);
  css.push(`.scroll{animation:scroll ${n(dur)}s steps(${L / 2}) infinite;animation-delay:${dly(0)}}`);
  css.push(`@keyframes scroll{from{transform:translateX(0)}to{transform:translateX(-${L}px)}}`);
}
yy += 11;
yy = rasterBar(yy, BAR_COOL);
for (let y = yy; y < H; y++) { body.push(`<rect y="${y}" width="${W}" height="1" fill="${hex('blue')}"/>`); note(y, 'blue'); }

// backdrop inks
for (let y = 0; y < UI_Y; y++) note(y, lineInk[y]);

css.push('@media (prefers-reduced-motion:reduce){.drift,.gl,.fa,.fb,.sp,.fo0,.fo1,.nod,.btx,.bob,.rp,.split,.scroll{animation:none}.fo1,.fb{opacity:0}.btx{transform:translateX(118px)}}');

// ------------------------------------------------------------------ check
let worst = 0;
let worstY = 0;
for (const [y, set] of inksAt) {
  if (y >= STRIP_Y && y < STRIP_Y + STRIP_H) continue; // Mode 1 lines: checked below, at 4
  if (set.size > worst) { worst = set.size; worstY = y; }
}
if (worst > 16) {
  console.error(`line ${worstY} uses ${worst} inks: ${[...inksAt.get(worstY)].join(' ')}`);
  process.exitCode = 1;
}
// the Mode 1 strip: four inks a line
for (let y = STRIP_Y; y < STRIP_Y + STRIP_H; y++) {
  const set = inksAt.get(y);
  if (set && set.size > 4) {
    console.error(`Mode 1 line ${y} uses ${set.size} inks: ${[...set].join(' ')}`);
    process.exitCode = 1;
  }
}
const used = new Set();
for (const set of inksAt.values()) for (const c of set) used.add(c);
if (process.argv.includes('--inks')) {
  console.log(`inks used on screen: ${used.size} of 27`);
  console.log([...used].sort().join(', '));
  console.log(`busiest Mode 0 line: ${worstY} with ${worst} inks`);
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W * 2}" height="${H * 2}" shape-rendering="crispEdges" role="img" aria-label="CASTAWAY: an 8-bit demo screen in full overscan">
<title>CASTAWAY: a tiny island, a tall palm and a nodding castaway, as an 8-bit demo screen in full overscan</title>
<style>${css.join('')}</style>
<defs>${glyphDefs.join('')}${defs.join('')}</defs>
${body.join('\n')}
</svg>
`;
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, svg);
console.log(`wrote ${path.relative(process.cwd(), OUT)} (${(svg.length / 1024).toFixed(1)} KB; ${used.size} inks; busiest line ${worst} inks; scroll ${SCROLL_TEXT.length} chars)`);

if (SHEET) {
  const sh = new Layer();
  for (const [k, c] of scene.m) {
    const [x, y] = k.split(',').map(Number);
    if (x >= HER.x - 4 && x < HER.x + 12 && y >= HER.y - 2 && y < HER.y + 28) sh.set(x - HER.x + 4, y - HER.y + 2, c);
  }
  for (const [k, c] of herHead.m) {
    const [x, y] = k.split(',').map(Number);
    sh.set(x - HER.x + 4, y - HER.y + 2, c);
  }
  for (const [k, c] of bottle.m) {
    const [x, y] = k.split(',').map(Number);
    sh.set(x + 20, y + 4, c);
  }
  const out = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 32" width="1280" height="640" shape-rendering="crispEdges"><rect width="64" height="32" fill="${hex('skyBlue')}"/>${sh.svg()}</svg>`;
  fs.writeFileSync(SHEET, out);
}
