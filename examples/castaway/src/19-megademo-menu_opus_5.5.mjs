#!/usr/bin/env node
// Amiga megademo part-select menu: README header generator for CASTAWAY.
//
//   node examples/castaway/src/19-megademo-menu_opus_5.5.mjs
//
// Writes examples/castaway/assets/19-megademo-menu_opus_5.5.svg.
// Plain Node, no dependencies, no clock, no Math.random: the same bytes on
// every run. (The .md beside the assets is hand-written, not generated.)
//
// The style (catalogue entry c64-06) is the menu screen of a 1989-90 Amiga
// megademo: black screen, a sparse starfield in three speed layers, a wide
// chrome logo (blue sky on top, a white horizon band, grey below), a light-blue
// spaced subtitle, ONE giant white scroller crossing the middle, and a centred
// part list under a dashed title, "PART NAME ...... CODER" rows with dotted
// leaders, tinted top to bottom from blue through violet to pink. The last row
// leads to the next disk. Every colour is snapped to the Amiga's 12-bit
// palette (16 steps a channel), so the gradients band the way the real ones did.
// Logo letterforms, fonts and the sprite are original; nothing is traced.
//
// The joke: in a megademo you pick a part and it loads. In Castaway you can't
// pick anything. The cursor walks down the list one row per bar of the music
// (3 s at 80 BPM, the same grid the project's gags start on), "presses fire"
// on beat two, and the part's credit flips to its tier's timer from
// activities.toml, plus an honest shrug: when a timer goes off it picks ONE of
// its tier's gags by weight, so the one you chose may not be it ("30-60 MIN,
// MAYBE"). Meanwhile she sits in the crook of the logo's Y, nodding on every beat.
//
// Timing (all loops are whole multiples of the 0.75 s beat):
//   cursor + flips  10 rows x 3 s = 30 s loop
//   glint           every 9 s (3 bars)
//   nod             every beat (0.75 s)
//   stars           3 layers, each scrolls exactly one screen width per loop
//   scroller        the text is followed by a copy of its own head, and the
//                   strip moves by exactly the text's width per loop, so the
//                   wrap is invisible. The first frame (and the reduced-motion
//                   frame) already reads "PLEASE WAIT." under the logo.
//
// How it is drawn (no <text>, no filters): every lit pixel is merged into runs
// of rects and written as one <path> per colour; banded gradients are
// userSpaceOnUse linearGradients with paired hard stops, one band per pixel
// row. The scroller is <use> references to one symbol per glyph.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '19-megademo-menu_opus_5.5';
const OUT = path.resolve(here, `../assets/${SLUG}.svg`);

// ------------------------------------------------------------------ facts
// Verified 2026-10-01 against D:/python/castaway/activities.toml (read-only):
// 92 activities (81 on the four tier timers, 11 chained follow-ups); tiers
// regular 2-5 min, occasional 12-25 min, rare 30-60 min, super rare 3-6 h;
// run 10:00:00, seed 1992; starts snap to 3 s bars. Each timer picks one gag
// of its tier by weight: in the default simulated run (python -B
// tools/schedule.py) the shark, the drone and "leave any time" never come up.
const ACTIVITIES = 92;

// ------------------------------------------------------------------ canvas
const W = 384; // lowres pixels; the SVG scales them up
const BAR = 3; // seconds per bar of the theme (80 BPM, 4/4)
const BEAT = BAR / 4;

// vertical layout (pixel rows)
const LOGO_Y = 7;
const LH = 36; // logo letter height
const SUB_Y = 51; // subtitle (5 px font)
const SCROLL_Y = 61; // giant scroller glyph top (32 px glyphs)
const TITLE_Y = 103; // "- SELECT GAG TO WAIT FOR -"
const ROW_Y = 117; // first part row
const PITCH = 10;
const DISK_GAP = 5; // extra gap above the "next disk" row
const LIST_X = 16; // 44 columns of 8 px
const COLS = 44;

// ----------------------------------------------------------------- helpers
function mulberry32(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(1992);
const n = (v) => (Number.isInteger(v) ? String(v) : String(+v.toFixed(3)));

const hex6 = (h) => {
  h = h.replace('#', '');
  return h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
};
// Snap to the Amiga OCS palette: 4 bits per channel.
const q = (h) => `#${[0, 2, 4].map((i) => Math.round(parseInt(hex6(h).slice(i, i + 2), 16) / 17).toString(16)).join('')}`;
function lerpHex(a, b, t) {
  const pa = [0, 2, 4].map((i) => parseInt(hex6(a).slice(i, i + 2), 16));
  const pb = [0, 2, 4].map((i) => parseInt(hex6(b).slice(i, i + 2), 16));
  return `#${pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, '0')).join('')}`;
}
// keys: [[row, '#hex'], ...] sorted by row -> one 12-bit colour per row
function ramp(keys, count) {
  const out = [];
  for (let r = 0; r < count; r++) {
    let k = 0;
    while (k < keys.length - 2 && r > keys[k + 1][0]) k++;
    const [r0, c0] = keys[k];
    const [r1, c1] = keys[k + 1];
    out.push(q(r <= r0 ? c0 : r >= r1 ? c1 : lerpHex(c0, c1, (r - r0) / (r1 - r0))));
  }
  return out;
}
// Hard-edged vertical gradient, one flat band per run of equal rows.
function rowGradient(id, y0, colors) {
  const h = colors.length;
  let stops = '';
  for (let i = 0; i < h;) {
    let j = i;
    while (j < h && colors[j] === colors[i]) j++;
    stops += `<stop offset="${n(i / h)}" stop-color="${colors[i]}"/><stop offset="${n(j / h)}" stop-color="${colors[i]}"/>`;
    i = j;
  }
  return `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="${y0}" x2="0" y2="${y0 + h}">${stops}</linearGradient>`;
}

class Grid {
  constructor(w, h) { this.w = w; this.h = h; this.a = new Uint8Array(w * h); }
  get(x, y) { return x >= 0 && y >= 0 && x < this.w && y < this.h ? this.a[y * this.w + x] : 0; }
  set(x, y, v = 1) { if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.a[y * this.w + x] = v; }
}
// Lit cells -> compact path: horizontal runs, merged down identical rows.
function cellsToPath(isOn, w, h, ox = 0, oy = 0) {
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
const gridPath = (g, pred = (v) => v) => cellsToPath((x, y) => pred(g.get(x, y)), g.w, g.h);

// ------------------------------------------------------- giant scroll font
// 8 rows tall, 2-pixel stems, then smoothed with Scale2x and doubled again, so
// each glyph is 32 px tall with stepped, hand-pixelled corners.
// '@' is a little cargo ship, '%' a palm on a mound of sand.
const BIG = {
  A: ['.#####.', '##...##', '##...##', '##...##', '#######', '##...##', '##...##', '##...##'],
  B: ['######.', '##...##', '##...##', '######.', '##...##', '##...##', '##...##', '######.'],
  C: ['.#####.', '##...##', '##.....', '##.....', '##.....', '##.....', '##...##', '.#####.'],
  D: ['#####..', '##..##.', '##...##', '##...##', '##...##', '##...##', '##..##.', '#####..'],
  E: ['#######', '##.....', '##.....', '######.', '##.....', '##.....', '##.....', '#######'],
  F: ['#######', '##.....', '##.....', '######.', '##.....', '##.....', '##.....', '##.....'],
  G: ['.#####.', '##...##', '##.....', '##.....', '##..###', '##...##', '##...##', '.######'],
  H: ['##...##', '##...##', '##...##', '#######', '##...##', '##...##', '##...##', '##...##'],
  I: ['######', '..##..', '..##..', '..##..', '..##..', '..##..', '..##..', '######'],
  J: ['....###', '.....##', '.....##', '.....##', '.....##', '##...##', '##...##', '.#####.'],
  K: ['##...##', '##..##.', '##.##..', '####...', '####...', '##.##..', '##..##.', '##...##'],
  L: ['##.....', '##.....', '##.....', '##.....', '##.....', '##.....', '##.....', '#######'],
  M: ['##...##', '###.###', '#######', '##.#.##', '##...##', '##...##', '##...##', '##...##'],
  N: ['##...##', '###..##', '####.##', '##.####', '##..###', '##...##', '##...##', '##...##'],
  O: ['.#####.', '##...##', '##...##', '##...##', '##...##', '##...##', '##...##', '.#####.'],
  P: ['######.', '##...##', '##...##', '##...##', '######.', '##.....', '##.....', '##.....'],
  Q: ['.#####.', '##...##', '##...##', '##...##', '##...##', '##.#.##', '##..##.', '.###.##'],
  R: ['######.', '##...##', '##...##', '##...##', '######.', '##.##..', '##..##.', '##...##'],
  S: ['.#####.', '##...##', '##.....', '.#####.', '.....##', '.....##', '##...##', '.#####.'],
  T: ['######', '..##..', '..##..', '..##..', '..##..', '..##..', '..##..', '..##..'],
  U: ['##...##', '##...##', '##...##', '##...##', '##...##', '##...##', '##...##', '.#####.'],
  V: ['##...##', '##...##', '##...##', '##...##', '##...##', '.##.##.', '..###..', '...#...'],
  W: ['##...##', '##...##', '##...##', '##...##', '##.#.##', '#######', '###.###', '##...##'],
  X: ['##...##', '##...##', '.##.##.', '..###..', '..###..', '.##.##.', '##...##', '##...##'],
  Y: ['##..##', '##..##', '##..##', '.####.', '..##..', '..##..', '..##..', '..##..'],
  Z: ['#######', '.....##', '....##.', '...##..', '..##...', '.##....', '##.....', '#######'],
  0: ['.#####.', '##...##', '##..###', '##.####', '####.##', '###..##', '##...##', '.#####.'],
  1: ['..##..', '.###..', '####..', '..##..', '..##..', '..##..', '..##..', '######'],
  2: ['.#####.', '##...##', '.....##', '....##.', '..###..', '.##....', '##.....', '#######'],
  3: ['.#####.', '##...##', '.....##', '..####.', '.....##', '.....##', '##...##', '.#####.'],
  4: ['....##.', '...###.', '..####.', '.##.##.', '##..##.', '#######', '....##.', '....##.'],
  5: ['#######', '##.....', '##.....', '######.', '.....##', '.....##', '##...##', '.#####.'],
  6: ['.#####.', '##.....', '##.....', '######.', '##...##', '##...##', '##...##', '.#####.'],
  7: ['#######', '.....##', '....##.', '...##..', '..##...', '..##...', '..##...', '..##...'],
  8: ['.#####.', '##...##', '##...##', '.#####.', '##...##', '##...##', '##...##', '.#####.'],
  9: ['.#####.', '##...##', '##...##', '##...##', '.######', '.....##', '.....##', '.#####.'],
  '.': ['..', '..', '..', '..', '..', '..', '##', '##'],
  ',': ['...', '...', '...', '...', '...', '.##', '.##', '##.'],
  ':': ['..', '..', '##', '##', '..', '..', '##', '##'],
  '!': ['##', '##', '##', '##', '##', '##', '..', '##'],
  '?': ['.#####.', '##...##', '.....##', '...###.', '..##...', '..##...', '.......', '..##...'],
  '-': ['.....', '.....', '.....', '#####', '#####', '.....', '.....', '.....'],
  "'": ['##', '##', '.#', '#.', '..', '..', '..', '..'],
  '/': ['.....##', '.....##', '....##.', '...##..', '..##...', '.##....', '##.....', '##.....'],
  '(': ['..##', '.##.', '##..', '##..', '##..', '##..', '.##.', '..##'],
  ')': ['##..', '.##.', '..##', '..##', '..##', '..##', '.##.', '##..'],
  '@': [
    '.......##.....',
    '.......##.....',
    '.....######...',
    '.....######...',
    '##############',
    '.############.',
    '..##########..',
    '..............',
  ],
  '%': [
    '..##....##..',
    '.#####.####.',
    '##..####..##',
    '#..##.##...#',
    '.....##.....',
    '......##....',
    '......##....',
    '..#########.',
  ],
};
const BIG_SPACE = 5; // source pixels for ' '
const BIG_GAP = 1; // source pixels between glyphs

function bitmapOf(rows) {
  const w = Math.max(...rows.map((r) => r.length));
  const g = new Grid(w, rows.length);
  rows.forEach((row, y) => [...row].forEach((c, x) => { if (c === '#') g.set(x, y); }));
  return g;
}
// Scale2x / EPX on a binary grid: doubles it, rounding convex corners and
// filling concave ones, the way hand-pixelled big fonts were cleaned up.
function scale2x(g) {
  const o = new Grid(g.w * 2, g.h * 2);
  for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) {
    const P = g.get(x, y); const A = g.get(x, y - 1); const B = g.get(x + 1, y);
    const C = g.get(x - 1, y); const D = g.get(x, y + 1);
    o.set(2 * x, 2 * y, C === A && C !== D && A !== B ? A : P);
    o.set(2 * x + 1, 2 * y, A === B && A !== C && B !== D ? B : P);
    o.set(2 * x, 2 * y + 1, D === C && D !== B && C !== A ? C : P);
    o.set(2 * x + 1, 2 * y + 1, B === D && B !== A && D !== C ? D : P);
  }
  return o;
}
function double(g) {
  const o = new Grid(g.w * 2, g.h * 2);
  for (let y = 0; y < o.h; y++) for (let x = 0; x < o.w; x++) o.set(x, y, g.get(x >> 1, y >> 1));
  return o;
}
const bigGlyph = (rows) => double(scale2x(bitmapOf(rows)));

// ---------------------------------------------------------- 8 px list font
// Topaz-like: 2 px verticals, 1 px horizontals, 6 px wide in 8 px cells
// (M and W take 7), so the list keeps the wide, even spacing of the era.
const MED = {
  A: ['.####.', '##..##', '##..##', '######', '##..##', '##..##', '##..##'],
  B: ['#####.', '##..##', '##..##', '#####.', '##..##', '##..##', '#####.'],
  C: ['.####.', '##..##', '##....', '##....', '##....', '##..##', '.####.'],
  D: ['####..', '##.##.', '##..##', '##..##', '##..##', '##.##.', '####..'],
  E: ['######', '##....', '##....', '#####.', '##....', '##....', '######'],
  F: ['######', '##....', '##....', '#####.', '##....', '##....', '##....'],
  G: ['.####.', '##..##', '##....', '##.###', '##..##', '##..##', '.#####'],
  H: ['##..##', '##..##', '##..##', '######', '##..##', '##..##', '##..##'],
  I: ['.####.', '..##..', '..##..', '..##..', '..##..', '..##..', '.####.'],
  J: ['...###', '....##', '....##', '....##', '##..##', '##..##', '.####.'],
  K: ['##..##', '##.##.', '####..', '###...', '####..', '##.##.', '##..##'],
  L: ['##....', '##....', '##....', '##....', '##....', '##....', '######'],
  M: ['##...##', '###.###', '#######', '##.#.##', '##...##', '##...##', '##...##'],
  N: ['##..##', '###.##', '######', '##.###', '##..##', '##..##', '##..##'],
  O: ['.####.', '##..##', '##..##', '##..##', '##..##', '##..##', '.####.'],
  P: ['#####.', '##..##', '##..##', '#####.', '##....', '##....', '##....'],
  Q: ['.####.', '##..##', '##..##', '##..##', '##.###', '##.##.', '.##.##'],
  R: ['#####.', '##..##', '##..##', '#####.', '####..', '##.##.', '##..##'],
  S: ['.####.', '##..##', '##....', '.####.', '....##', '##..##', '.####.'],
  T: ['######', '..##..', '..##..', '..##..', '..##..', '..##..', '..##..'],
  U: ['##..##', '##..##', '##..##', '##..##', '##..##', '##..##', '.####.'],
  V: ['##..##', '##..##', '##..##', '##..##', '##..##', '.####.', '..##..'],
  W: ['##...##', '##...##', '##...##', '##.#.##', '#######', '###.###', '##...##'],
  X: ['##..##', '##..##', '.####.', '..##..', '.####.', '##..##', '##..##'],
  Y: ['##..##', '##..##', '##..##', '.####.', '..##..', '..##..', '..##..'],
  Z: ['######', '....##', '...##.', '..##..', '.##...', '##....', '######'],
  0: ['.####.', '##..##', '##.###', '######', '###.##', '##..##', '.####.'],
  1: ['..##..', '.###..', '..##..', '..##..', '..##..', '..##..', '.####.'],
  2: ['.####.', '##..##', '....##', '..###.', '.##...', '##....', '######'],
  3: ['.####.', '##..##', '....##', '..###.', '....##', '##..##', '.####.'],
  4: ['...##.', '..###.', '.####.', '##.##.', '######', '...##.', '...##.'],
  5: ['######', '##....', '#####.', '....##', '....##', '##..##', '.####.'],
  6: ['.####.', '##....', '##....', '#####.', '##..##', '##..##', '.####.'],
  7: ['######', '....##', '...##.', '..##..', '..##..', '..##..', '..##..'],
  8: ['.####.', '##..##', '##..##', '.####.', '##..##', '##..##', '.####.'],
  9: ['.####.', '##..##', '##..##', '.#####', '....##', '....##', '.####.'],
  '.': ['......', '......', '......', '......', '......', '..##..', '..##..'],
  ',': ['......', '......', '......', '......', '..##..', '..##..', '.##...'],
  '-': ['......', '......', '......', '.####.', '......', '......', '......'],
  "'": ['..##..', '..##..', '.##...', '......', '......', '......', '......'],
  ':': ['......', '..##..', '..##..', '......', '..##..', '..##..', '......'],
  '/': ['....##', '....##', '...##.', '..##..', '.##...', '##....', '##....'],
  '!': ['..##..', '..##..', '..##..', '..##..', '..##..', '......', '..##..'],
  '?': ['.####.', '##..##', '....##', '...##.', '..##..', '......', '..##..'],
};
function drawMed(set, s, col, y) {
  [...s].forEach((ch, i) => {
    if (ch === ' ') return;
    const g = MED[ch];
    if (!g) throw new Error(`list font lacks ${JSON.stringify(ch)}`);
    const x0 = LIST_X + (col + i) * 8 + (g[0].length >= 7 ? 0 : 1);
    g.forEach((row, r) => [...row].forEach((c, k) => { if (c === '#') set(x0 + k, y + r); }));
  });
}

// ----------------------------------------------------------- 5 px tiny font
const TINY = {
  A: ['.#.', '#.#', '###', '#.#', '#.#'], B: ['##.', '#.#', '##.', '#.#', '##.'],
  C: ['.##', '#..', '#..', '#..', '.##'], D: ['##.', '#.#', '#.#', '#.#', '##.'],
  E: ['###', '#..', '##.', '#..', '###'], F: ['###', '#..', '##.', '#..', '#..'],
  G: ['.##', '#..', '#.#', '#.#', '.##'], H: ['#.#', '#.#', '###', '#.#', '#.#'],
  I: ['###', '.#.', '.#.', '.#.', '###'], J: ['..#', '..#', '..#', '#.#', '.#.'],
  K: ['#.#', '#.#', '##.', '#.#', '#.#'], L: ['#..', '#..', '#..', '#..', '###'],
  M: ['#...#', '##.##', '#.#.#', '#...#', '#...#'], N: ['#..#', '##.#', '#.##', '#..#', '#..#'],
  O: ['.#.', '#.#', '#.#', '#.#', '.#.'], P: ['##.', '#.#', '##.', '#..', '#..'],
  Q: ['.#.', '#.#', '#.#', '##.', '.##'], R: ['##.', '#.#', '##.', '#.#', '#.#'],
  S: ['.##', '#..', '.#.', '..#', '##.'], T: ['###', '.#.', '.#.', '.#.', '.#.'],
  U: ['#.#', '#.#', '#.#', '#.#', '###'], V: ['#...#', '#...#', '.#.#.', '.#.#.', '..#..'],
  W: ['#...#', '#...#', '#.#.#', '##.##', '#...#'], X: ['#.#', '#.#', '.#.', '#.#', '#.#'],
  Y: ['#.#', '#.#', '.#.', '.#.', '.#.'], Z: ['####', '...#', '.##.', '#...', '####'],
  0: ['###', '#.#', '#.#', '#.#', '###'], 1: ['.#.', '##.', '.#.', '.#.', '###'],
  2: ['##.', '..#', '.#.', '#..', '###'], 3: ['##.', '..#', '.#.', '..#', '##.'],
  4: ['#.#', '#.#', '###', '..#', '..#'], 5: ['###', '#..', '##.', '..#', '##.'],
  6: ['.##', '#..', '###', '#.#', '###'], 7: ['###', '..#', '.#.', '.#.', '.#.'],
  8: ['###', '#.#', '###', '#.#', '###'], 9: ['###', '#.#', '###', '..#', '##.'],
  '.': ['.', '.', '.', '.', '#'], ',': ['.', '.', '.', '#', '#'], ':': ['.', '#', '.', '#', '.'],
  '!': ['#', '#', '#', '.', '#'], "'": ['#', '#', '.', '.', '.'], '-': ['...', '...', '###', '...', '...'],
  '/': ['..#', '..#', '.#.', '#..', '#..'], '*': ['.', '.', '#', '.', '.'],
};
const TRACK = 2; // extra spacing between tiny letters ("spaced capitals")
function tinyWidth(s) {
  let w = 0;
  for (const ch of s) w += ch === ' ' ? 4 : TINY[ch][0].length + 1 + TRACK;
  return w - 1 - TRACK;
}
function drawTiny(set, s, x, y) {
  for (const ch of s) {
    if (ch === ' ') { x += 4; continue; }
    const g = TINY[ch];
    if (!g) throw new Error(`tiny font lacks ${JSON.stringify(ch)}`);
    g.forEach((row, r) => [...row].forEach((c, k) => { if (c === '#') set(x + k, y + r); }));
    x += g[0].length + 1 + TRACK;
  }
}

// --------------------------------------------------------------- the list
// Each row: the part (a gag), its "coder" (who or what makes it happen), and
// what the cursor flips to when it presses fire: the real interval of the
// gag's tier timer, and "MAYBE", because the timer then picks one of many.
// Ordered from the most common to the rarest, so the list's blue-to-pink tint
// also runs from "any minute now" to "hours".
const WAIT = { regular: '2-5 MIN, MAYBE', occasional: '12-25 MIN, MAYBE', rare: '30-60 MIN, MAYBE', super: '3-6 HOURS, MAYBE' };
const ROWS = [
  ['SANDCASTLE', 'LASTS ONE TIDE', WAIT.regular],
  ['MESSAGE IN A BOTTLE', 'BOUNCES BACK', WAIT.occasional],
  ['SHIP SAILS PAST', 'BEHIND HER BACK', WAIT.occasional],
  ['COCONUT VS HERMIT CRAB', 'CRAB GETS A HAT', WAIT.occasional],
  ['SIGNAL HUNT', 'ONE BAR, UP THE PALM', WAIT.rare],
  ['SHARK IN HEADPHONES', 'KEEPS THE BEAT', WAIT.rare],
  ['CAT ON A CRATE', 'COMES AND GOES', WAIT.rare],
  ['DELIVERY DRONE', 'HEADPHONES, AGAIN', WAIT.rare],
  ['SHE COULD LEAVE ANY TIME', 'ICED COFFEE RUN', WAIT.super],
  ['NEXT DISK', 'TOOLS/SERVE.PY', 'OPEN 127.0.0.1:8765'],
];
const TITLE = '- SELECT GAG TO WAIT FOR -';
const rowY = (i) => ROW_Y + i * PITCH + (i === ROWS.length - 1 ? DISK_GAP : 0);
const LIST_BOTTOM = rowY(ROWS.length - 1) + 7;
const FOOT_Y = LIST_BOTTOM + 10;
const H = FOOT_Y + 5 + 8;

function tail(name, value) {
  const dots = COLS - name.length - value.length - 2;
  if (dots < 2) throw new Error(`row too long: ${name} / ${value}`);
  return ` ${'.'.repeat(dots)} ${value}`;
}

// ---------------------------------------------------------- scroller text
// '@' is the ship glyph and '%' the palm glyph.
const SCROLL_TEXT = [
  'PLEASE WAIT.',
  `WELCOME TO CASTAWAY: TEN HOURS ON A VERY SMALL ISLAND WITH ONE YOUNG WOMAN, ONE TALL PALM, ONE RAFT AND A LOT OF TIME.`,
  'SHE IDLES. SHE NODS ALONG TO HER HEADPHONES. EVERY SO OFTEN, SOMETHING HAPPENS.',
  `${ACTIVITIES} ACTIVITIES. FOUR TIMERS: REGULAR EVERY 2 TO 5 MINUTES, OCCASIONAL EVERY 12 TO 25, RARE EVERY 30 TO 60, SUPER RARE EVERY 3 TO 6 HOURS.`,
  'EACH TIMER PICKS ONE GAG FROM ITS PILE. IT MAY NOT BE YOURS.',
  'EVERY GAG STARTS ON THE NEXT BAR OF THE MUSIC, SO THE PUNCHLINES LAND ON THE BEAT.',
  'SOONER OR LATER A SHIP @ SAILS PAST WHILE SHE IS BUSY WITH A COCONUT. SHE NEVER SEES IT.',
  'EVERY SOUND IS SYNTHESIZED FROM CODE: NO SAMPLES, NO STOCK LOOPS, NO RECORDINGS. THE THEME: 80 BPM IN F MAJOR, ONE SEAMLESS 60 SECOND LOOP. NOBODY HAS HEARD IT YET.',
  'ALWAYS DAYTIME. AN UNOFFICIAL REMAKE, INSPIRED BY A 1992 DESERT ISLAND SCREENSAVER.',
  'TO WATCH: PYTHON TOOLS/SERVE.PY, THEN OPEN 127.0.0.1:8765.',
  'THIS MENU LOADS NOTHING. YOU STILL HAVE TO WAIT. %',
].join('      ') + '        ';
const SCROLL_SPEED = 90; // lowres px per second (under 2 px per 50 Hz frame)

// ================================================================ build
const defs = [];
const css = [];
const body = [];

// ---------------------------------------------------------- the starfield
// Three layers of single pixels, slow / medium / fast, drifting right to left.
// Stars keep to rows that carry no small text, so none can pose as a stray
// full stop in the dotted leaders.
const textRows = new Set();
const block = (y0, y1) => { for (let y = y0; y <= y1; y++) textRows.add(y); };
block(SUB_Y - 2, SUB_Y + 6);
block(TITLE_Y - 3, LIST_BOTTOM + 3);
block(FOOT_Y - 2, FOOT_Y + 6);
block(0, 3); block(H - 4, H);
const starRows = [];
for (let y = 0; y < H; y++) if (!textRows.has(y)) starRows.push(y);
const LAYERS = [
  { count: 34, speed: 6, color: '#555' },
  { count: 22, speed: 12, color: '#999' },
  { count: 12, speed: 24, color: '#fff' },
];
LAYERS.forEach((L, li) => {
  let d = '';
  const used = new Set();
  for (let k = 0; k < L.count; k++) {
    let x; let y;
    do { x = Math.floor(rand() * W); y = starRows[Math.floor(rand() * starRows.length)]; } while (used.has(`${x >> 3},${y >> 2}`));
    used.add(`${x >> 3},${y >> 2}`);
    d += `M${x} ${y}h1v1h-1M${x + W} ${y}h1v1h-1`;
  }
  const dur = W / L.speed;
  css.push(`.s${li}{animation:sf ${n(dur)}s steps(${W}) infinite}`);
  body.push(`<path class="s${li}" fill="${L.color}" d="${d}"/>`);
});
css.push(`@keyframes sf{from{transform:translateX(0)}to{transform:translateX(-${W}px)}}`);

// ---------------------------------------------------------- giant scroller
{
  const chars = [...SCROLL_TEXT];
  const used = new Set(chars.filter((c) => c !== ' '));
  const adv = {};
  for (const c of used) {
    const rows = BIG[c];
    if (!rows) throw new Error(`scroll font lacks ${JSON.stringify(c)}`);
    const g = bigGlyph(rows);
    adv[c] = (bitmapOf(rows).w + BIG_GAP) * 4;
    defs.push(`<path id="g${c.charCodeAt(0)}" d="${gridPath(g)}"/>`);
  }
  const advance = (c) => (c === ' ' ? BIG_SPACE * 4 : adv[c]);
  // centre "PLEASE WAIT." on the first frame
  const first = [...'PLEASE WAIT.'].reduce((w, c) => w + advance(c), 0) - BIG_GAP * 4;
  const x0 = Math.round((W - first) / 2);
  let x = x0;
  const uses = [];
  for (const c of chars) {
    if (c !== ' ') uses.push(`<use href="#g${c.charCodeAt(0)}" x="${x}"/>`);
    x += advance(c);
  }
  const L = x - x0; // one full lap
  // repeat the head of the text past the end so the wrap is seamless
  for (let i = 0; x < L + x0 + W + 40; i++) {
    const c = chars[i];
    if (c !== ' ') uses.push(`<use href="#g${c.charCodeAt(0)}" x="${x}"/>`);
    x += advance(c);
  }
  defs.push(`<g id="sc">${uses.join('')}</g>`);
  const dur = L / SCROLL_SPEED;
  css.push(`.sc{animation:sc ${n(dur)}s linear infinite}@keyframes sc{from{transform:translateX(0)}to{transform:translateX(-${L}px)}}`);
  body.push(`<g transform="translate(0 ${SCROLL_Y})"><g class="sc"><use href="#sc" x="2" y="2" fill="${q('#226')}"/><use href="#sc" fill="#fff"/></g></g>`);
  console.log(`scroller: ${chars.length} chars, ${L} px, ${n(dur)} s lap`);
}

// ----------------------------------------------------------- chrome logo
// Heavy squared capitals from rectangles, rasterised, then every square outer
// corner gets the same small stepped chamfer.
const R = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
const ST = 10; // stem
const BT = 8; // bar
const LETTERS = {
  C: { w: 34, add: [R(0, 0, 34, LH)], sub: [R(ST, BT, 40, LH - BT)] },
  A: { w: 36, add: [[[7, 0], [29, 0], [36, 7], [36, LH], [0, LH], [0, 7]]], sub: [R(ST, BT, 36 - ST, 15), R(ST, 23, 36 - ST, LH + 2)] },
  S: { w: 34, add: [R(0, 0, 34, BT), R(0, 0, ST, 22), R(0, 14, 34, 22), R(34 - ST, 14, 34, LH), R(0, LH - BT, 34, LH), R(34 - ST, 0, 34, BT + 2), R(0, LH - BT - 2, ST, LH)], sub: [] },
  T: { w: 34, add: [R(0, 0, 34, BT), R(12, 0, 22, LH)], sub: [] },
  W: { w: 48, add: [R(0, 0, ST, LH), R(48 - ST, 0, 48, LH), R(0, LH - BT, 48, LH), R(19, 11, 29, LH)], sub: [] },
  Y: { w: 36, add: [R(0, 0, ST, 23), R(36 - ST, 0, 36, 23), R(0, 14, 36, 23), R(13, 22, 23, LH)], sub: [] },
};
const LOGO_TEXT = 'CASTAWAY';
const LGAP = 5;
const DEPTH = 3;
function inPoly(px, py, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
const logoW = [...LOGO_TEXT].reduce((w, c, i) => w + LETTERS[c].w + (i ? LGAP : 0), 0);
const LOGO_X = Math.round((W - logoW - DEPTH) / 2);
const face = new Grid(W, LOGO_Y + LH + DEPTH + 4);
const boxes = [];
{
  let x = LOGO_X;
  for (const c of LOGO_TEXT) {
    const l = LETTERS[c];
    const g = new Grid(l.w, LH);
    for (let yy = 0; yy < LH; yy++) for (let xx = 0; xx < l.w; xx++) {
      const px = xx + 0.5; const py = yy + 0.5;
      if (l.add.some((p) => inPoly(px, py, p)) && !l.sub.some((p) => inPoly(px, py, p))) g.set(xx, yy);
    }
    // stepped chamfer on square outer corners only (not on diagonal runs)
    const CH = 3;
    const cut = new Grid(l.w, LH);
    for (let yy = 0; yy < LH; yy++) for (let xx = 0; xx < l.w; xx++) {
      if (!g.get(xx, yy)) continue;
      for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
        if (g.get(xx + dx, yy) || g.get(xx, yy + dy)) continue;
        let ok = true;
        for (let k = 1; k <= CH && ok; k++) {
          if (!g.get(xx - dx * k, yy) || !g.get(xx, yy - dy * k)) ok = false;
          if (g.get(xx + dx, yy - dy * k) || g.get(xx - dx * k, yy + dy)) ok = false;
        }
        if (!ok) continue;
        for (let i = 0; i < CH; i++) for (let j = 0; j < CH - i; j++) cut.set(xx - dx * i, yy - dy * j);
      }
    }
    for (let yy = 0; yy < LH; yy++) for (let xx = 0; xx < l.w; xx++) if (g.get(xx, yy) && !cut.get(xx, yy)) face.set(x + xx, LOGO_Y + yy);
    boxes.push({ c, x, w: l.w });
    x += l.w + LGAP;
  }
}
{
  // extrusion, down and to the right, darker with depth
  const ext = new Grid(face.w, face.h);
  for (let d = 1; d <= DEPTH; d++) {
    for (let y = 0; y < face.h; y++) for (let x = 0; x < face.w; x++) {
      if (face.get(x, y) && !face.get(x + d, y + d) && !ext.get(x + d, y + d)) ext.set(x + d, y + d, d);
    }
  }
  // a black halo keeps stars from touching the letters
  const solid = (x, y) => face.get(x, y) || ext.get(x, y);
  const halo = new Grid(face.w, face.h);
  for (let y = 0; y < face.h; y++) for (let x = 0; x < face.w; x++) {
    if (solid(x, y)) continue;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (solid(x + dx, y + dy)) halo.set(x, y);
  }
  body.push(`<path fill="#000" d="${gridPath(halo)}"/>`);
  const EXT = ['#46a', '#235', '#123'].map(q);
  EXT.forEach((col, i) => body.push(`<path fill="${col}" d="${gridPath(ext, (v) => v === i + 1)}"/>`));

  // chrome: deep blue sky, lightening to a white horizon, then a hard drop to
  // dark grey that brightens again towards the bottom (with a faint sand cast)
  const CHROME = ramp([
    [0, '#1b3d9e'], [6, '#2e63d4'], [12, '#6fa2ef'], [16, '#c8e2ff'], [17, '#ffffff'], [19, '#ffffff'],
    [20, '#3c3c48'], [22, '#55556a'], [28, '#8c8a96'], [33, '#c9c4bb'], [35, '#ece6d8'],
  ], LH);
  defs.push(rowGradient('chrome', LOGO_Y, CHROME));
  const faceD = gridPath(face);
  defs.push(`<clipPath id="lc"><path d="${faceD}"/></clipPath>`);
  body.push(`<path fill="url(#chrome)" d="${faceD}"/>`);
  // bevel: lit from the top left
  const hi = new Grid(face.w, face.h);
  const lo = new Grid(face.w, face.h);
  for (let y = 0; y < face.h; y++) for (let x = 0; x < face.w; x++) {
    if (!face.get(x, y)) continue;
    if (!face.get(x, y - 1) || !face.get(x - 1, y)) hi.set(x, y);
    else if (!face.get(x, y + 1) || !face.get(x + 1, y)) lo.set(x, y);
  }
  body.push(`<path fill="#fff" opacity=".55" d="${gridPath(hi)}"/>`);
  body.push(`<path fill="#000" opacity=".4" d="${gridPath(lo)}"/>`);
  // glint: a slanted streak that sweeps the logo once every three bars
  body.push(`<g clip-path="url(#lc)"><path class="gl" fill="#fff" opacity=".75" d="M0 ${LOGO_Y}h6l-${LH} ${LH}h-6zM10 ${LOGO_Y}h2l-${LH} ${LH}h-2z"/></g>`);
  const GL = BAR * 3;
  css.push(`.gl{transform:translateX(-60px);animation:gl ${GL}s linear infinite}@keyframes gl{0%{transform:translateX(${LOGO_X - 10}px)}${n((1.4 / GL) * 100)}%,100%{transform:translateX(${LOGO_X + logoW + LH + 20}px)}}`);
}

// ----------------------------------------------------------- her, in the Y
// Tiny and simple: brown hair in a low bun, cream headphones (band and cups),
// coral tank top, cream shorts, bare feet. She sits on the floor of the Y's
// notch with her hands on the ledge and her knees together, feet dangling over
// the front of the bar, and nods once a beat. A dark outline keeps her legible over
// the white horizon band.
{
  const PAL = {
    c: '#eed', C: '#dcb', H: '#542', h: '#865', s: '#fcb', S: '#d98', e: '#421',
    T: '#e76', t: '#b54', K: '#edc', k: '#bb9',
  };
  const HEAD = [
    '...ccccc...',
    '..cHHHHHc..',
    '.CHHHHHHHC.',
    '.CHHhHHHHC.',
    '.CHsssssHC.',
    '.CsesssesC.',
    '..sssssssHH',
    '...sssss.H.',
    '....sss....',
  ];
  const BODY = [
    '..sTTTTTs..',
    '..sTTTTts..',
    '.s.TTTTt.s.',
    's.KKKKKKk.s',
    '..KKKKKKk..',
    '...ss.ss...',
    '...ss.ss...',
    '...SS.SS...',
  ];
  const SW = 11;
  const yBox = boxes[boxes.length - 1];
  const x = yBox.x + Math.floor((yBox.w - SW) / 2);
  const y = LOGO_Y + 13 - (HEAD.length + 3); // shorts row sits on the notch floor
  const on = (rows, oy) => (xx, yy) => ((rows[yy - oy] || '')[xx] || '.') !== '.';
  const headOn = on(HEAD, 0);
  const bodyOn = on(BODY, HEAD.length);
  const outline = (self, other) => {
    const g = new Grid(SW + 2, HEAD.length + BODY.length + 2);
    for (let yy = -1; yy <= HEAD.length + BODY.length; yy++) for (let xx = -1; xx <= SW; xx++) {
      if (self(xx, yy) || other(xx, yy)) continue;
      let near = false;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (self(xx + dx, yy + dy)) near = true;
      if (near) g.set(xx + 1, yy + 1);
    }
    return `<path fill="#102" d="${cellsToPath((a, b) => g.get(a, b), g.w, g.h, x - 1, y - 1)}"/>`;
  };
  const sprite = (rows, oy) => {
    const cols = [...new Set(rows.join('').replace(/\./g, ''))];
    return cols.map((ch) => `<path fill="${q(PAL[ch])}" d="${cellsToPath((xx, yy) => (rows[yy] || '')[xx] === ch, SW, rows.length, x, y + oy)}"/>`).join('');
  };
  body.push(`<g>${outline(bodyOn, headOn)}<g class="nod">${outline(headOn, bodyOn)}</g>${sprite(BODY, HEAD.length)}<g class="nod">${sprite(HEAD, 0)}</g></g>`);
  css.push(`.nod{animation:nod ${BEAT}s step-end infinite}@keyframes nod{0%{transform:translateY(1px)}30%{transform:translateY(0)}}`);
}

// ------------------------------------------------------------- subtitle
{
  const s = 'THE TEN-HOUR LO-FI ISLAND MEGADEMO';
  const g = new Grid(W, H);
  drawTiny((x, y) => g.set(x, y), s, Math.round((W - tinyWidth(s)) / 2), SUB_Y);
  body.push(`<path fill="${q('#8cf')}" d="${gridPath(g)}"/>`);
}

// ------------------------------------------------------------- the list
{
  // blue -> violet -> pink, one 12-bit band per pixel row
  const top = TITLE_Y;
  const LIST = ramp([[0, '#3f6bff'], [45, '#8a4dff'], [85, '#e04fd8'], [LIST_BOTTOM - top, '#ff7fb0']], LIST_BOTTOM - top + 1);
  defs.push(rowGradient('lg', top, LIST));

  // cursor bar: a little copper bar with bright rims, one row per bar of music
  const BAR_ROWS = ['#7af', '#24a', '#139', '#028', '#017', '#017', '#017', '#028', '#139', '#24a', '#7af'].map(q);
  defs.push(rowGradient('cb', 0, BAR_ROWS));
  const arrowR = 'M0 0h1v7h-1zM1 1h1v5h-1zM2 2h1v3h-1zM3 3h1v1h-1z';
  const arrowL = 'M3 0h1v7h-1zM2 1h1v5h-1zM1 2h1v3h-1zM0 3h1v1h-1z';
  const y0 = rowY(0);
  const BX = 3;
  const BW = W - 6;
  body.push(`<g class="cur" transform="translate(0 ${y0 - 2})"><g class="cy"><rect x="${BX}" width="${BW}" height="11" fill="url(#cb)"/><rect class="fire" x="${BX}" width="${BW}" height="11" fill="#fff" opacity="0"/><path fill="#fff" transform="translate(6 2)" d="${arrowR}"/><path fill="#fff" transform="translate(${W - 10} 2)" d="${arrowL}"/></g></g>`);
  const LOOP = ROWS.length * BAR;
  // stepped: hold each row for one bar, then jump
  const kf = ROWS.map((_, i) => `${n((i / ROWS.length) * 100)}%{transform:translateY(${rowY(i) - y0}px)}`).join('');
  css.push(`.cy{animation:cy ${LOOP}s step-end infinite}@keyframes cy{${kf}100%{transform:translateY(${rowY(ROWS.length - 1) - y0}px)}}`);
  // fire: a quick flash of the bar on beat two of every bar
  const f0 = (BEAT / BAR) * 100;
  css.push(`.fire{animation:fire ${BAR}s linear infinite}@keyframes fire{0%,${n(f0)}%{opacity:0}${n(f0 + 0.5)}%{opacity:.35}${n(f0 + 6)}%,100%{opacity:0}}`);

  // the dashed title
  const st = new Grid(W, H);
  drawMed((x, y) => st.set(x, y), TITLE, Math.floor((COLS - TITLE.length) / 2), TITLE_Y);
  body.push(`<path fill="url(#lg)" d="${gridPath(st)}"/>`);

  // Each row has four layers, switched by one shared set of stepped keyframes
  // (written for row 0, shifted by a negative delay of one bar per row):
  //   kg  name + leaders + credit in the list gradient: when not selected
  //   kw  name in white: while the cursor is on the row
  //   ka  leaders + credit in white: selected, before and after "fire"
  //   kb  leaders + the wait in yellow: from beat two until just before the
  //       cursor moves on
  // Base opacities show row 0 selected, which is the reduced-motion frame.
  const on = n((BEAT / LOOP) * 100);
  const off = n(((BAR - 0.3) / LOOP) * 100);
  const end = n((BAR / LOOP) * 100);
  css.push(`.kg{animation:kg ${LOOP}s step-end infinite}@keyframes kg{0%{opacity:0}${end}%,100%{opacity:1}}`);
  css.push(`.kw{animation:kw ${LOOP}s step-end infinite}@keyframes kw{0%{opacity:1}${end}%,100%{opacity:0}}`);
  css.push(`.ka{animation:ka ${LOOP}s step-end infinite}@keyframes ka{0%{opacity:1}${on}%{opacity:0}${off}%{opacity:1}${end}%,100%{opacity:0}}`);
  css.push(`.kb{animation:kb ${LOOP}s step-end infinite}@keyframes kb{0%{opacity:0}${on}%{opacity:1}${off}%,100%{opacity:0}}`);
  ROWS.forEach(([name, credit, wait], i) => {
    const gg = new Grid(W, H);
    const gw = new Grid(W, H);
    const ga = new Grid(W, H);
    const gb = new Grid(W, H);
    drawMed((x, y) => { gg.set(x, y); gw.set(x, y); }, name, 0, rowY(i));
    drawMed((x, y) => { gg.set(x, y); ga.set(x, y); }, tail(name, credit), name.length, rowY(i));
    drawMed((x, y) => gb.set(x, y), tail(name, wait), name.length, rowY(i));
    const sel = i === 0;
    if (i) css.push(`.r${i}{animation-delay:-${n(LOOP - i * BAR)}s}`);
    const cls = (k) => `${k}${i ? ` r${i}` : ''}`;
    body.push(`<path class="${cls('kg')}" fill="url(#lg)"${sel ? ' opacity="0"' : ''} d="${gridPath(gg)}"/>`);
    body.push(`<path class="${cls('kw')}" fill="#fff"${sel ? '' : ' opacity="0"'} d="${gridPath(gw)}"/>`);
    body.push(`<path class="${cls('ka')}" fill="#fff"${sel ? '' : ' opacity="0"'} d="${gridPath(ga)}"/>`);
    body.push(`<path class="${cls('kb')}" fill="${q('#ff5')}" opacity="0" d="${gridPath(gb)}"/>`);
  });
}

// ------------------------------------------------------------- footer
{
  const s = 'BAR LINE SOCIETY * JOYSTICK TO SELECT * FIRE TO WAIT';
  const g = new Grid(W, H);
  drawTiny((x, y) => g.set(x, y), s, Math.round((W - tinyWidth(s)) / 2), FOOT_Y);
  body.push(`<path fill="${q('#78a')}" d="${gridPath(g)}"/>`);
}

// ------------------------------------------------------------- assemble
css.push('@media (prefers-reduced-motion:reduce){*{animation:none!important}.gl{opacity:0}}');
const title = 'CASTAWAY: a lo-fi island video, shown as the part-select menu of a 1989-style Amiga megademo';
const desc = `A chrome CASTAWAY logo over a drifting starfield, a giant white scroller, and a list of the island's gags. The cursor moves one row per bar of the music, presses fire, and each pick only flips to its timer and the word MAYBE. A tiny woman in cream headphones and a coral tank top sits in the crook of the Y, nodding on the beat.`;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W * 2}" height="${H * 2}" shape-rendering="crispEdges" role="img" aria-labelledby="t d">
<title id="t">${title}</title>
<desc id="d">${desc}</desc>
<style>${css.join('')}</style>
<defs><clipPath id="panel"><rect width="${W}" height="${H}" rx="6"/></clipPath>${defs.join('')}</defs>
<g clip-path="url(#panel)"><rect width="${W}" height="${H}" fill="#000"/>
${body.join('\n')}
</g>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="5.5" fill="none" stroke="#2a2f3a" shape-rendering="geometricPrecision"/>
</svg>
`;
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, svg);
console.log(`wrote ${path.relative(process.cwd(), OUT)} (${(svg.length / 1024).toFixed(1)} KB), ${W}x${H}`);
