#!/usr/bin/env node
// F-key options menu: README header generator for CASTAWAY.
//
//   node examples/castaway/src/25-f-key-options-menu_opus_5.5.mjs
//
// Writes examples/castaway/assets/25-f-key-options-menu_opus_5.5.svg.
// Plain Node, no dependencies, no clock, no Math.random: the same bytes on
// every run. (The .md beside the assets is hand-written, not generated.)
// Pass --debug=<dir> to also write zoomed sprite sheets into <dir>.
//
// The style (catalogue entry pc-08) is the options screen that sat in front
// of a 1990s-2000s PC game: a small logo whose letters each carry a different
// rainbow gradient, a title block ("presents", the name with a +N option
// count, who set it up), then a list of function keys with leader dots and
// bracketed [ON]/[OFF] states, a full-width magenta bar on the selected row,
// two stubby yellow level meters in the bottom corners and an instruction
// line. The Windows-era ones added a purple-to-blue gradient field, a pink
// vector star turning beside the logo and a sine scroller underneath.
// Every letterform, sprite and colour here is drawn fresh for this file:
// no group's logo, font or name is reproduced.
//
// The joke: an options menu for a ten-hour video in which almost nothing
// happens, on purpose. There are ten options and every one of them is
// already set to the project's real rule (always daytime, no samples, gags
// on the bar, seed 1992 ...). The cursor visits each one for two bars of the
// music, presses its key on beat three, and the state flips to what you
// might wish for, for one beat, then flips straight back. Only F9 (LEAVE THE
// ISLAND, ANY TIME) "works": she walks off over the water, the island sits
// empty, and she comes back with an iced coffee. The vector star beside the
// logo is a starfish.
//
// Timing (whole multiples of the theme's 0.75 s beat, 80 BPM):
//   cursor        10 options x 2 bars (6 s) = 60 s, one lap per loop of the
//                 60-second theme
//   key press     beat 3 of each option: state shows the wish for one beat
//   panel gags    pinned to the cursor: ship + coconut (F3), signal (F6),
//                 drone + parcel (F7, the parcel floats off in F8),
//                 the walk to the coffee (F9)
//   logo colours  48-row rainbow scrolled one row per step, 6 s a lap
//   starfish      18 pre-projected frames per 72 degrees (5-fold symmetric,
//                 so 72 degrees is a full visual cycle), 1.5 s
//   meters        16 steps per 3 s bar
//   scroller      every glyph shares one sampled sine path; a glyph's
//                 negative delay is its place in the text, so the first
//                 frame already shows the start of the text
//
// GitHub shows this through <img>: no scripts, no fonts. All text is drawn
// as merged pixel rects from the fonts below; prefers-reduced-motion stops
// everything on a complete, readable frame.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '25-f-key-options-menu_opus_5.5';
const OUT = path.resolve(here, `../assets/${SLUG}.svg`);
const DEBUG = (process.argv.find((a) => a.startsWith('--debug=')) || '').slice(8);

// ------------------------------------------------------------------ facts
// Checked 2026-10-01 against D:/python/castaway (read-only): activities.toml
// has 93 activities; tiers regular 2-5 min, occasional 12-25 min, rare 30-60
// min, super rare 3-6 h; run 10:00:00, seed 1992; starts snap to 3 s bars.
// tools/make_audio.py: 80 BPM, 20 bars of 3 s = a 60 s theme; 171 WAVs.

// ------------------------------------------------------------------ canvas
const W = 480;
const H = 270;
const BEAT = 0.75;
const BAR = 4 * BEAT;
const ROW_T = 2 * BAR; // the cursor rests two bars on each option
const NROWS = 10;
const LOOP = NROWS * ROW_T; // 60 s

const n = (v) => (Number.isInteger(v) ? String(v) : String(+v.toFixed(2)));
const pc = (t, T = LOOP) => `${+((100 * t) / T).toFixed(4)}%`;

// ------------------------------------------------------------------ colour
const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const hex = (c) => `#${c.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('')}`;
// 6 bits a channel, like a VGA DAC
const vga = (h) => hex(rgb(h).map((v) => (Math.round((v / 255) * 63) * 255) / 63));
const mix = (a, b, t) => {
  const A = rgb(a);
  const B = rgb(b);
  return hex(A.map((v, i) => v + (B[i] - v) * t));
};
function ramp(keys, t) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) return mix(keys[i - 1][1], keys[i][1], (t - keys[i - 1][0]) / (keys[i][0] - keys[i - 1][0]));
  }
  return keys[keys.length - 1][1];
}
const short = (h) => (/^#(.)\1(.)\2(.)\3$/.test(h) ? `#${h[1]}${h[3]}${h[5]}` : h);

// ------------------------------------------------------------------ pixels
// A Layer is a set of lit cells per colour; svg() merges each colour's cells
// into horizontal runs, then stacks identical runs on consecutive rows.
const OFF = 2048;
const KEY = (x, y) => (y + OFF) * 8192 + (x + OFF);
class Layer {
  constructor() { this.m = new Map(); }
  set(c, x, y) {
    let s = this.m.get(c);
    if (!s) this.m.set(c, (s = new Set()));
    s.add(KEY(Math.round(x), Math.round(y)));
  }
  del(x, y) { for (const s of this.m.values()) s.delete(KEY(x, y)); }
  svg(extra = '') {
    let o = '';
    for (const [c, s] of this.m) if (s.size) o += `<path fill="${short(c)}"${extra} d="${cellsPath(s)}"/>`;
    return o;
  }
}
function cellsPath(set) {
  const rows = new Map();
  for (const k of set) {
    const y = Math.floor(k / 8192) - OFF;
    const x = (k % 8192) - OFF;
    if (!rows.has(y)) rows.set(y, []);
    rows.get(y).push(x);
  }
  const rects = [];
  let active = new Map();
  let prevY = null;
  for (const y of [...rows.keys()].sort((a, b) => a - b)) {
    const xs = rows.get(y).sort((a, b) => a - b);
    const next = new Map();
    for (let i = 0; i < xs.length;) {
      let j = i;
      while (j + 1 < xs.length && xs[j + 1] === xs[j] + 1) j++;
      const key = `${xs[i]},${xs[j]}`;
      const r = prevY === y - 1 ? active.get(key) : null;
      if (r) { r.h++; next.set(key, r); } else {
        const nr = { x: xs[i], y, w: xs[j] - xs[i] + 1, h: 1 };
        rects.push(nr);
        next.set(key, nr);
      }
      i = j + 1;
    }
    active = next;
    prevY = y;
  }
  return rects.map((r) => `M${r.x} ${r.y}h${r.w}v${r.h}h-${r.w}z`).join('');
}
class Grid {
  constructor(w, h) { this.w = w; this.h = h; this.a = new Uint8Array(w * h); }
  get(x, y) { return x >= 0 && y >= 0 && x < this.w && y < this.h ? this.a[y * this.w + x] : 0; }
  set(x, y, v = 1) { if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.a[y * this.w + x] = v; }
}

// ------------------------------------------------------------------ 8 px font
// 2 px stems, caps 7 rows, lowercase x-height 5 with 2-row descenders, in
// 8 px cells: the even, chunky spacing of a text-mode options screen.
const F8 = {
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
  '.': ['..', '..', '..', '..', '..', '##', '##'],
  ',': ['...', '...', '...', '...', '.##', '.##', '##.'],
  ':': ['..', '##', '##', '..', '##', '##', '..'],
  ';': ['...', '.##', '.##', '...', '.##', '.##', '##.'],
  '-': ['.....', '.....', '.....', '#####', '.....', '.....', '.....'],
  "'": ['.##', '.##', '##.', '...', '...', '...', '...'],
  '!': ['##', '##', '##', '##', '##', '..', '##'],
  '?': ['.####.', '##..##', '....##', '...##.', '..##..', '......', '..##..'],
  '/': ['....##', '....##', '...##.', '..##..', '.##...', '##....', '##....'],
  '(': ['..##', '.##.', '##..', '##..', '##..', '.##.', '..##'],
  ')': ['##..', '.##.', '..##', '..##', '..##', '.##.', '##..'],
  '[': ['####', '##..', '##..', '##..', '##..', '##..', '####'],
  ']': ['####', '..##', '..##', '..##', '..##', '..##', '####'],
  '+': ['......', '..##..', '..##..', '######', '..##..', '..##..', '......'],
  '*': ['......', '##..##', '.####.', '######', '.####.', '##..##', '......'],
  '>': ['##....', '.##...', '..##..', '...##.', '..##..', '.##...', '##....'],
  '=': ['......', '......', '######', '......', '######', '......', '......'],
  _: ['', '', '', '', '', '', '', '######'],
  a: ['', '', '.####.', '....##', '.#####', '##..##', '.#####'],
  b: ['##....', '##....', '#####.', '##..##', '##..##', '##..##', '#####.'],
  c: ['', '', '.####.', '##..##', '##....', '##..##', '.####.'],
  d: ['....##', '....##', '.#####', '##..##', '##..##', '##..##', '.#####'],
  e: ['', '', '.####.', '##..##', '######', '##....', '.####.'],
  f: ['..###.', '.##...', '#####.', '.##...', '.##...', '.##...', '.##...'],
  g: ['', '', '.#####', '##..##', '##..##', '##..##', '.#####', '....##', '.####.'],
  h: ['##....', '##....', '#####.', '##..##', '##..##', '##..##', '##..##'],
  i: ['..##..', '', '.###..', '..##..', '..##..', '..##..', '.####.'],
  j: ['....##', '', '...###', '....##', '....##', '....##', '....##', '##..##', '.####.'],
  k: ['##....', '##....', '##..##', '##.##.', '####..', '##.##.', '##..##'],
  l: ['.###..', '..##..', '..##..', '..##..', '..##..', '..##..', '.####.'],
  m: ['', '', '##.##..', '#######', '##.#.##', '##.#.##', '##...##'],
  n: ['', '', '#####.', '##..##', '##..##', '##..##', '##..##'],
  o: ['', '', '.####.', '##..##', '##..##', '##..##', '.####.'],
  p: ['', '', '#####.', '##..##', '##..##', '##..##', '#####.', '##....', '##....'],
  q: ['', '', '.#####', '##..##', '##..##', '##..##', '.#####', '....##', '....##'],
  r: ['', '', '##.##.', '###.##', '##....', '##....', '##....'],
  s: ['', '', '.#####', '##....', '.####.', '....##', '#####.'],
  t: ['..##..', '..##..', '######', '..##..', '..##..', '..##..', '...###'],
  u: ['', '', '##..##', '##..##', '##..##', '##..##', '.#####'],
  v: ['', '', '##..##', '##..##', '##..##', '.####.', '..##..'],
  w: ['', '', '##...##', '##.#.##', '##.#.##', '#######', '.##.##.'],
  x: ['', '', '##..##', '.####.', '..##..', '.####.', '##..##'],
  y: ['', '', '##..##', '##..##', '##..##', '##..##', '.#####', '....##', '.####.'],
  z: ['', '', '######', '...##.', '..##..', '.##...', '######'],
};
function glyph(ch) {
  const g = F8[ch];
  if (!g) throw new Error(`font lacks ${JSON.stringify(ch)}`);
  return g;
}
const gWidth = (g) => Math.max(...g.map((r) => r.length));
// Each glyph used is defined once (centred in its 8 px cell) and placed
// with <use>; a run of text is one <g fill> per colour.
const GLYPH_IDS = new Map();
function gid(ch) {
  if (!GLYPH_IDS.has(ch)) GLYPH_IDS.set(ch, `t${GLYPH_IDS.size.toString(36)}`);
  return GLYPH_IDS.get(ch);
}
function glyphDefs() {
  let o = '';
  for (const [ch, id] of GLYPH_IDS) {
    const g = glyph(ch);
    const off = Math.floor((8 - gWidth(g)) / 2);
    const s = new Set();
    g.forEach((row, r) => [...row].forEach((c, k) => { if (c === '#') s.add(KEY(off + k, r)); }));
    o += `<path id="${id}" d="${cellsPath(s)}"/>`;
  }
  return o;
}
function textU(colour, s, x, y) {
  let o = '';
  [...s].forEach((ch, i) => { if (ch !== ' ') o += `<use href="#${gid(ch)}"${i ? ` x="${i * 8}"` : ''}/>`; });
  return o ? `<g fill="${short(colour)}" transform="translate(${x} ${y})">${o}</g>` : '';
}
// Several colours in one line: list = [[colour, text], ...]
function spansU(x, y, list) {
  let o = '';
  for (const [colour, s] of list) {
    o += textU(colour, s, x, y);
    x += s.length * 8;
  }
  return o;
}
const len8 = (list) => list.reduce((a, [, s]) => a + s.length, 0) * 8;

// ------------------------------------------------------------------ big font
// The same caps, Scale2x-smoothed to 14 rows: for the scroller and the +10.
function bitmapOf(rows) {
  const g = new Grid(gWidth(rows), rows.length);
  rows.forEach((row, y) => [...row].forEach((c, x) => { if (c === '#') g.set(x, y); }));
  return g;
}
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
// Scale2x would round a plus sign into a sparkle, so those stay square
const SQUARE = new Set(['+', '*']);
const BIG = new Map();
function big(ch) {
  if (!BIG.has(ch)) {
    const b = bitmapOf(glyph(ch).slice(0, 7));
    BIG.set(ch, SQUARE.has(ch) ? double(b) : scale2x(b));
  }
  return BIG.get(ch);
}
const BIG_GAP = 2;
const BIG_SPACE = 10;
const bigAdvance = (ch) => (ch === ' ' ? BIG_SPACE : big(ch).w + BIG_GAP);
// white at the top, through pink, to violet: one colour per pixel row,
// as a userSpaceOnUse gradient, so it sticks to each glyph wherever it moves
const BIG_ROWS = Array.from({ length: 14 }, (_, r) => vga(ramp([[0, '#ffffff'], [4, '#ffe6f4'], [8, '#ff8fd0'], [13, '#c247d6']], r)));
const BIG_IDS = new Map();
function bid(ch) {
  if (!BIG_IDS.has(ch)) BIG_IDS.set(ch, `b${BIG_IDS.size.toString(36)}`);
  return BIG_IDS.get(ch);
}
function bigDefs() {
  let stops = '';
  BIG_ROWS.forEach((c, r) => { stops += `<stop offset="${n(r / 14)}" stop-color="${short(c)}"/><stop offset="${n((r + 1) / 14)}" stop-color="${short(c)}"/>`; });
  let o = `<linearGradient id="sg" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="14">${stops}</linearGradient>`;
  for (const [ch, id] of BIG_IDS) {
    const g = big(ch);
    const s = new Set();
    for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) if (g.get(x, y)) s.add(KEY(x, y));
    o += `<path id="${id}" fill="url(#sg)" d="${cellsPath(s)}"/>`;
  }
  return o;
}

// ------------------------------------------------------------------ layout
const LOGO_Y = 17;
const LIST_Y = 86; // top of the first row's bar
const PITCH = 11;
const LIST_COLS = 48;
const LIST_X = (W - LIST_COLS * 8) / 2; // 48
const MSG_Y = 203;
const HINT_Y = 219;
const SCROLL_MID = 247;
const SCROLL_L = 20;
const SCROLL_R = 460;

// panel (the island, top left) and starfish (top right)
const PX = 8;
const PY = 6;
const PW = 96;
const PH = 74;
const IX = PX + 1;
const IY = PY + 1;
const IW = PW - 2;
const IH = PH - 2;
const SF_X = 425;
const SF_Y = 41;

// ------------------------------------------------------------------ palette
const C = {
  key: vga('#ffe14a'),
  white: '#ffffff',
  dots: vga('#7c68c8'),
  brk: vga('#8fd8ff'),
  on: vga('#6dff8e'),
  off: vga('#ff8aaa'),
  val: vga('#c9f4ff'),
  lav: vga('#b6a6ff'),
  pink: vga('#ff6ec7'),
  ink: vga('#24083e'),
  inv: vga('#ffe14a'),
};

// =================================================================== LOGO
// Chunky stroke letters, rasterised to pixels, slanted a little. Each letter
// is a clip for its own copy of one rainbow strip; the copies scroll with a
// phase step per letter, so no two letters share a gradient at any moment.
const SR = 3.6; // stroke radius
const LH = 32;
const SLANT = 0.18;
function arc(cx, cy, rx, ry, a0, a1, steps = 28) {
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const a = ((a0 + ((a1 - a0) * i) / steps) * Math.PI) / 180;
    pts.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]);
  }
  return pts;
}
const LETTERS = {
  C: { w: 22, s: [arc(11, 16, 7.4, 12.4, -40, -320)] },
  A: { w: 22, s: [[[3.6, 28.4], [3.6, 11.4]], arc(11, 11.4, 7.4, 7.8, 180, 360), [[18.4, 11.4], [18.4, 28.4]], [[3.6, 18.8], [18.4, 18.8]]] },
  S: { w: 22, s: [[...arc(11, 9.6, 7.4, 6, -30, -270), ...arc(11, 22, 7.4, 6.4, -90, 150)]] },
  T: { w: 22, s: [[[3.6, 3.6], [18.4, 3.6]], [[11, 3.6], [11, 28.4]]] },
  W: { w: 30, s: [[[3.6, 3.6], [3.6, 22]], arc(9.3, 22, 5.7, 6.4, 180, 0), [[15, 10.5], [15, 22]], arc(20.7, 22, 5.7, 6.4, 180, 0), [[26.4, 22], [26.4, 3.6]]] },
  Y: { w: 22, s: [[[3.6, 3.6], [3.6, 10]], arc(11, 10, 7.4, 6.4, 180, 0), [[18.4, 10], [18.4, 3.6]], [[11, 16.4], [11, 28.4]]] },
};
function segDist(px, py, ax, ay, bx, by) {
  const dx = bx - ax; const dy = by - ay;
  const l2 = dx * dx + dy * dy;
  let t = l2 ? ((px - ax) * dx + (py - ay) * dy) / l2 : 0;
  t = Math.max(0, Math.min(1, t));
  const ex = ax + t * dx - px; const ey = ay + t * dy - py;
  return Math.sqrt(ex * ex + ey * ey);
}
function rasterLetter(ch) {
  const L = LETTERS[ch];
  const w = Math.ceil(L.w + SLANT * LH) + 1;
  const cells = [];
  for (let y = 0; y < LH; y++) for (let x = 0; x < w; x++) {
    const cy = y + 0.5;
    const cx = x + 0.5 - SLANT * (LH - cy);
    let d = 1e9;
    for (const poly of L.s) for (let i = 0; i + 1 < poly.length; i++) {
      d = Math.min(d, segDist(cx, cy, poly[i][0], poly[i][1], poly[i + 1][0], poly[i + 1][1]));
    }
    if (d <= SR) cells.push([x, y]);
  }
  return { w, cells, adv: L.w + 3 };
}
const WORD = 'CASTAWAY';
const PLUS = '+10';
const letters = [...WORD].map(rasterLetter);
const wordW = letters.reduce((a, l) => a + l.adv, 0) - 3 + Math.ceil(SLANT * LH);
const plusW = [...PLUS].reduce((a, ch) => a + bigAdvance(ch), 0) - BIG_GAP;
const LOGO_X = Math.round(W / 2 - (wordW + 6 + plusW) / 2);

const RB_PERIOD = 48;
const RAINBOW = [[0, '#ff3d5a'], [1 / 8, '#ff8c2a'], [2 / 8, '#ffe63a'], [3 / 8, '#86f04a'], [4 / 8, '#2ee0b4'], [5 / 8, '#36a8ff'], [6 / 8, '#7d6bff'], [7 / 8, '#e05cf0'], [1, '#ff3d5a']];
// 24 bands of 2 rows each
const rbColour = (r) => vga(ramp(RAINBOW, (2 * Math.floor((((r % RB_PERIOD) + RB_PERIOD) % RB_PERIOD) / 2)) / RB_PERIOD));

function buildLogo() {
  const fill = new Set();
  const per = [];
  let x = LOGO_X;
  for (const l of letters) {
    const s = new Layer();
    for (const [cx, cy] of l.cells) {
      s.set('#000', x + cx, LOGO_Y + cy);
      fill.add(KEY(x + cx, LOGO_Y + cy));
    }
    per.push({ layer: s, x });
    x += l.adv;
  }
  const plusX = x - 3 + Math.ceil(SLANT * LH) + 6;
  // +10 in the big font, top-aligned with the logo like a superscript
  let plus = '';
  const plusSet = new Set();
  let px = plusX;
  for (const ch of PLUS) {
    const g = big(ch);
    for (let y = 0; y < g.h; y++) for (let gx = 0; gx < g.w; gx++) if (g.get(gx, y)) plusSet.add(KEY(px + gx, LOGO_Y + 1 + y));
    plus += `<use href="#${bid(ch)}" x="${px}" y="${LOGO_Y + 1}"/>`;
    px += bigAdvance(ch);
  }
  const solid = new Set([...fill, ...plusSet]);
  const has = (x, y) => solid.has(KEY(x, y));
  const shine = new Layer();
  const shade = new Layer();
  const outl = new Set();
  for (const k of solid) {
    const y = Math.floor(k / 8192) - OFF; const x = (k % 8192) - OFF;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      if (!has(x + dx, y + dy)) { outl.add(KEY(x + dx, y + dy)); }
    }
  }
  // the letters grown by one pixel: drawn once dark as the outline, and
  // again two pixels down and right as the drop shadow
  const silhouette = cellsPath(new Set([...solid, ...outl]));
  for (const k of fill) {
    const y = Math.floor(k / 8192) - OFF; const x = (k % 8192) - OFF;
    if (!fill.has(KEY(x, y - 1))) shine.set('#ffffff', x, y);
    else if (!fill.has(KEY(x, y + 1))) shade.set('#000000', x, y);
  }
  return { per, plus, silhouette, shine, shade, right: px };
}

// =================================================================== LIST
const ROWS = [
  { key: 'F1', d: 'UNLIMITED DAYLIGHT', st: 'ON', k: 'on', wish: 'OFF', msg: 'LOCKED. NO NIGHT SCENES: IT IS A PROJECT RULE.' },
  { key: 'F2', d: 'SOMETHING HAPPENS', st: 'SOON-ISH', k: 'val', wish: 'NOW?', msg: 'EVERY 2-5 MINUTES. THE RAREST, EVERY 3-6 HOURS.' },
  { key: 'F3', d: 'SHIP NOTICES HER', st: 'OFF', k: 'off', wish: 'ON', msg: 'HEADPHONES ON, COCONUT IN HAND. IT SAILS ON.' },
  { key: 'F4', d: 'SAMPLES AND LOOPS', st: 'NONE', k: 'off', wish: 'ONE?', msg: '150+ SOUNDS, EVERY ONE SYNTHESIZED FROM CODE.' },
  { key: 'F5', d: 'GAGS LAND ON THE BEAT', st: 'ON', k: 'on', wish: 'OFF', msg: 'EACH ONE WAITS FOR THE NEXT BAR. A BAR IS 3 S.' },
  { key: 'F6', d: 'PHONE SIGNAL', st: '1 BAR', k: 'val', wish: '2 BARS', msg: 'ONE BAR, AT THE VERY TOP OF THE PALM.' },
  { key: 'F7', d: 'HEADPHONE DELIVERY', st: 'BY DRONE', k: 'val', wish: 'MORE?', msg: 'THE PARCEL IS ANOTHER PAIR OF HEADPHONES.' },
  { key: 'F8', d: 'BOTTLE STAYS AWAY', st: 'OFF', k: 'off', wish: 'ON', msg: 'IT WASHES STRAIGHT BACK. A REPLY COMES LATER.' },
  { key: 'F9', d: 'LEAVE THE ISLAND', st: 'ANY TIME', k: 'val', wish: 'NOW', msg: 'SHE CAN. SHE COMES BACK WITH AN ICED COFFEE.', long: true },
  { key: 'F10', d: 'RANDOM SEED', st: '1992', k: 'val', wish: '1993', msg: 'SAME SEED, SAME TEN HOURS, BAR FOR BAR.' },
];
const PRESS = 2 * BEAT; // the key goes down on beat 3
const WISH_END = PRESS + BEAT;
// F9's wish holds while she is away
const AWAY_OUT = PRESS; // she gets up when the key goes down
const AWAY_BACK = 7 * BEAT; // and sits back down on beat 8
const centre10 = (s) => {
  const pad = 8 - s.length;
  const l = Math.floor(pad / 2);
  return ' '.repeat(l) + s + ' '.repeat(pad - l);
};
const STATE_COL = LIST_COLS - 10;

function buildList() {
  let base = '';
  const states = [];
  const wishes = [];
  const keys = [];
  ROWS.forEach((r, i) => {
    const y = LIST_Y + i * PITCH + 2;
    const dotsN = STATE_COL - 4 - r.d.length - 2;
    base += spansU(LIST_X, y, [[C.key, r.key.padEnd(4)], [C.white, r.d]]);
    // leader dots: one rect filled with a dot pattern
    base += `<rect x="${LIST_X + (5 + r.d.length) * 8}" y="${y + 5}" width="${dotsN * 8}" height="2" fill="url(#ld)"/>`;
    base += textU(C.brk, `[${' '.repeat(8)}]`, LIST_X + STATE_COL * 8, y);
    states.push(textU(C[r.k], centre10(r.st), LIST_X + (STATE_COL + 1) * 8, y));
    // the wish: inverse video across the bracket field
    const wx = LIST_X + STATE_COL * 8 - 1;
    wishes.push(`<rect x="${wx}" y="${y - 2}" width="${10 * 8 + 1}" height="${PITCH}" fill="${C.inv}"/>`
      + textU(C.ink, `[${centre10(r.wish)}]`, LIST_X + STATE_COL * 8, y));
    // the key going down
    keys.push(`<rect x="${LIST_X - 2}" y="${y - 2}" width="${r.key.length * 8 + 3}" height="${PITCH}" fill="${C.inv}"/>`
      + textU(C.ink, r.key, LIST_X, y));
  });
  return { base, states, wishes, keys };
}

// =================================================================== PANEL
// A little daylight window on the island, 94 x 72 lowres pixels. Drawn in
// local coordinates; the whole group is translated to (IX, IY).
const P = {
  skyTop: '#2a7fdc', skyHor: '#a9dcf7', hor: '#d4f1fd',
  seaHor: '#3d8fe2', seaMid: '#2368cc', seaLow: '#1b57b6',
  shallow: '#38c0d4', shallow2: '#7ddfe4', sand: '#f4dea8', sandSh: '#dcbd82', sandDk: '#c49d64',
  foam: '#ffffff', foam2: '#cdf3f6',
  trunk: '#a8613c', trunk2: '#7f4429', trunkHi: '#c98256',
  leafD: '#1f6b36', leafM: '#3c9e48', leafL: '#86d065', coco: '#6e4626', shrub: '#2f8a3e', shrubL: '#5fbf52',
  raft: '#b0653f', raft2: '#7a4128', rope: '#ecd58f',
  sun: '#fff7c8', sun2: '#ffe27a',
  cloud: '#ffffff', cloudSh: '#d3ebfa',
  hair: '#6a3b22', hairL: '#8d5733', skin: '#f2c39c', skinSh: '#d69c76', cream: '#f6ecd2', creamSh: '#d6c49e',
  coral: '#f07a5e', coralSh: '#c95a45', eye: '#3a2216',
  shipW: '#ffffff', shipR: '#d8443a', shipK: '#3a3f52', shipG: '#c6d0dc',
  drone: '#4a5163', droneL: '#c9d2de', box: '#c99a5c', boxSh: '#a5793f', tape: '#efe0ad',
  coconut: '#7ab648', coconutD: '#4f8a2e', straw: '#ff6f61',
  cup: '#e9f6ff', coffee: '#b98a5c', lid: '#ffffff',
  sig: '#ffffff', sigDim: '#7c9fc0',
};
for (const k of Object.keys(P)) P[k] = vga(P[k]);

const HORIZON = 37;
const ISL = { x: 47, y: 56, rx: 28, ry: 6 };
const SIT = { x: 56, y: 44 }; // top-left of her sitting sprite (12 x 14)

// sprite strings: '.' transparent; letters map to palette keys
const SPR_KEYS = {
  h: 'hair', H: 'hairL', s: 'skin', S: 'skinSh', c: 'cream', C: 'creamSh', t: 'coral', T: 'coralSh', e: 'eye',
  w: 'cream', W: 'creamSh', g: 'coconut', G: 'coconutD', r: 'straw', u: 'cup', o: 'coffee', l: 'lid',
  k: 'shipK', R: 'shipR', x: 'shipW', y: 'shipG', d: 'drone', D: 'droneL', b: 'box', B: 'boxSh', p: 'tape',
};
function sprite(layer, rows, x0, y0, mirror = false) {
  const w = Math.max(...rows.map((r) => r.length));
  rows.forEach((row, y) => [...row.padEnd(w, '.')].forEach((ch, x) => {
    if (ch === '.') return;
    const key = SPR_KEYS[ch];
    if (!key) throw new Error(`sprite key ${ch}`);
    layer.set(P[key], x0 + (mirror ? w - 1 - x : x), y0 + y);
  }));
}
// her, sitting cross-legged, facing us; the head is a separate sprite so it
// can nod on the beat
const HEAD = [
  '....cccc....',
  '...chhhhc...',
  '..chhHHhhc..',
  '.cChhhhhhCc.',
  '.cChessehCc.',
  '.cChsssshCc.',
  '...hsSSsh...',
  '...h.ss.h...',
];
const BODY = [
  '.....ss.....',
  '...stttts...',
  '..sttttttS..',
  '..sttTTttS..',
  '..sTttttTs..',
  '.sswwwwwwss.',
  'ssssWwwWssss',
  '.SSs....sSS.',
];
const HOLD_COCONUT = [
  '......r.....',
  '.....r......',
  '....gggg....',
  '...gggggg...',
  '...gGGGGg...',
];
const HOLD_COFFEE = [
  '.....r......',
  '....llll....',
  '....uuuu....',
  '....oooo....',
  '....oooo....',
];
// standing, side on, facing right; two leg frames
const STAND = [
  '..cccc..',
  '.chhhhc.',
  'hhchhhhh',
  'hCChhhss',
  'hCChsses',
  '.hhhssss',
  '..hhsss.',
  '....ss..',
  '...tttt.',
  '..ttttts',
  '..tttTts',
  '..tttt.s',
  '..wwww..',
  '..wwwW..',
];
const LEGS_A = ['..s..s..', '.s....s.', '.s....s.', 'ss....ss'];
const LEGS_B = ['...ss...', '...ss...', '...ss...', '...sss..'];
const CARRY_COFFEE = ['', '', '', '', '', '', '', '.......r', '......ll', '......uu', '......oo', '......oo'];
const SHIP = [
  '.....k.......',
  '....xxx......',
  '..xxxxxxx....',
  'RRRRRRRRRRRR.',
  '.kkkkkkkkkk..',
];
const DRONE = [
  'DD.....DD',
  '.ddddddd.',
  '...ddd...',
  '....d....',
];
const PARCEL = [
  'bbpbb',
  'bbpbb',
  'BBpBB',
];

// A 1 px dark edge around a sprite (4-neighbours), so she reads on sand
const INK = vga('#3a1e12');
function outlineOf(...layers) {
  const all = new Set();
  for (const l of layers) for (const s of l.m.values()) for (const k of s) all.add(k);
  const out = new Set();
  for (const k of all) {
    for (const d of [1, -1, 8192, -8192]) if (!all.has(k + d)) out.add(k + d);
  }
  return out;
}
function setLayer(cells, colour, pred = () => true) {
  const l = new Layer();
  for (const k of cells) {
    const x = (k % 8192) - OFF; const y = Math.floor(k / 8192) - OFF;
    if (pred(x, y)) l.set(colour, x, y);
  }
  return l;
}

function inEllipse(x, y, e, grow = 0) {
  const dx = (x + 0.5 - e.x) / (e.rx + grow);
  const dy = (y + 0.5 - e.y) / (e.ry + grow * 0.35);
  return dx * dx + dy * dy <= 1;
}

function buildPanel() {
  const L = {};
  const bg = new Layer();
  // sky
  for (let y = 0; y < HORIZON; y++) {
    const c = vga(mix(P.skyTop, P.skyHor, Math.floor(y / 3) / Math.floor((HORIZON - 1) / 3)));
    for (let x = 0; x < IW; x++) bg.set(c, x, y);
  }
  // sun with a soft ring
  for (let y = 0; y < 20; y++) for (let x = 70; x < IW; x++) {
    const d = Math.hypot(x + 0.5 - 82, y + 0.5 - 9);
    if (d <= 4.6) bg.set(P.sun, x, y);
    else if (d <= 6.2) bg.set(P.sun2, x, y);
  }
  // sea
  for (let x = 0; x < IW; x++) bg.set(P.hor, x, HORIZON);
  for (let y = HORIZON + 1; y < IH; y++) {
    const t = (y - HORIZON - 1) / (IH - HORIZON - 2);
    const c = vga(ramp([[0, P.seaHor], [0.45, P.seaMid], [1, P.seaLow]], Math.floor(t * 8) / 8));
    for (let x = 0; x < IW; x++) bg.set(c, x, y);
  }
  // a few long highlights on the water (static)
  const glint = [[6, 42, 5], [24, 40, 4], [64, 41, 6], [84, 44, 4], [12, 47, 3], [76, 49, 5], [90, 52, 3], [2, 66, 4], [80, 67, 5], [30, 69, 4]];
  for (const [x, y, w] of glint) for (let i = 0; i < w; i++) bg.set(vga('#6fb2ee'), x + i, y);
  // shallows, sand, a little shade under the island
  for (let y = HORIZON + 1; y < IH; y++) for (let x = 0; x < IW; x++) {
    if (inEllipse(x, y, ISL, 0)) {
      const under = (y + 0.5 - ISL.y) / ISL.ry;
      bg.set(under > 0.55 ? P.sandSh : P.sand, x, y);
    } else if (inEllipse(x, y, ISL, 4)) bg.set(P.shallow2, x, y);
    else if (inEllipse(x, y, ISL, 9)) bg.set(P.shallow, x, y);
  }
  // shrubs at the palm's foot
  const shrubs = [[24, 51, 'shrub'], [25, 50, 'shrubL'], [26, 51, 'shrub'], [27, 50, 'shrub'], [23, 52, 'shrub'], [28, 51, 'shrubL'],
    [44, 51, 'shrub'], [45, 50, 'shrubL'], [46, 51, 'shrub'], [47, 51, 'shrub'], [43, 52, 'shrub'], [48, 52, 'shrubL'],
    [29, 52, 'shrub'], [22, 53, 'shrubL'], [49, 52, 'shrub']];
  for (const [x, y, k] of shrubs) bg.set(P[k], x, y);
  // two pebbles
  bg.set(P.sandDk, 30, 59); bg.set(P.sandDk, 31, 59); bg.set(P.sandDk, 68, 58);
  L.bg = bg;

  // palm: a quadratic curve from the sand to the crown, banded bark
  const palm = new Layer();
  const base = [37, 53];
  const ctrl = [33, 30];
  const top = [44, 13];
  const seen = new Set();
  for (let i = 0; i <= 400; i++) {
    const t = i / 400;
    const x = (1 - t) * (1 - t) * base[0] + 2 * (1 - t) * t * ctrl[0] + t * t * top[0];
    const y = Math.round((1 - t) * (1 - t) * base[1] + 2 * (1 - t) * t * ctrl[1] + t * t * top[1]);
    if (seen.has(y)) continue;
    seen.add(y);
    const w = t < 0.35 ? 4 : t < 0.75 ? 3 : 2;
    const x0 = Math.round(x - w / 2);
    const band = Math.floor((53 - y) / 3) % 2 === 0;
    for (let k = 0; k < w; k++) {
      const c = k === w - 1 ? P.trunk2 : k === 0 && w > 2 ? P.trunkHi : band ? P.trunk : P.trunk2;
      palm.set(c, x0 + k, y);
    }
  }
  // fronds: angle (deg, 0 = right, + = down), length, droop
  const crown = [44.5, 12.5];
  const fronds = [
    [-172, 21, 0.55], [-140, 15, 0.38], [-108, 10, 0.25], [-70, 11, 0.3], [-35, 17, 0.42], [-8, 21, 0.62], [150, 15, 0.75], [30, 14, 0.85], [175, 18, 0.7],
  ];
  const leaf = new Layer();
  for (const [deg, len, droop] of fronds) {
    const a = (deg * Math.PI) / 180;
    const steps = len * 3;
    for (let i = 0; i <= steps; i++) {
      const s = i / steps;
      const x = crown[0] + Math.cos(a) * len * s;
      const y = crown[1] + Math.sin(a) * len * s + droop * len * s * s;
      leaf.set(P.leafM, x, y);
      // leaflets: hang below the rib, shorter toward the tip
      const hang = Math.round((1 - s) * 3.2 + 0.6);
      for (let k = 1; k <= hang; k++) leaf.set(k === hang ? P.leafD : P.leafM, x, y + k);
      if (s > 0.15 && s < 0.8) leaf.set(P.leafL, x, y - 1);
    }
  }
  // drop leaf pixels that also landed on the rib highlight twice
  for (const [x, y] of [[44, 13], [45, 13], [43, 14], [44, 14], [46, 14]]) {
    leaf.del(x, y);
    leaf.set(P.coco, x, y);
  }
  L.palm = palm;
  L.leaf = leaf;

  // raft, bobbing in the shallows to the left
  const raft = new Layer();
  for (let x = 2; x < 16; x++) for (let y = 59; y < 62; y++) {
    raft.set((x - 2) % 3 === 2 ? P.raft2 : y === 59 ? vga('#c97b50') : P.raft, x, y);
  }
  for (const x of [5, 12]) for (let y = 59; y < 62; y++) raft.set(P.rope, x, y);
  for (let x = 2; x < 16; x++) raft.set(vga('#5d3220'), x, 62);
  L.raft = raft;

  // foam: two frames that swap on the beat
  for (const f of [0, 1]) {
    const foam = new Layer();
    for (let y = HORIZON + 1; y < IH; y++) for (let x = 0; x < IW; x++) {
      const inSand = inEllipse(x, y, ISL, 0);
      const ring = !inSand && inEllipse(x, y, ISL, 1.4);
      if (ring && (x + y + f) % 3 !== 0) foam.set(P.foam, x, y);
      const ring2 = !inEllipse(x, y, ISL, 4.8) && inEllipse(x, y, ISL, 6);
      if (ring2 && (x * 3 + y + f * 5) % 7 < 2) foam.set(P.foam2, x, y);
    }
    // sparkles on open water
    const sp = f ? [[10, 44], [58, 43], [88, 47], [36, 66], [70, 70]] : [[18, 41], [72, 45], [50, 68], [6, 56], [92, 62]];
    for (const [x, y] of sp) { foam.set(P.foam, x, y); foam.set(P.foam2, x + 1, y); }
    L[`foam${f}`] = foam;
  }

  // clouds
  const cloud = new Layer();
  const puff = (cx, cy, r) => {
    for (let y = -r; y <= r; y++) for (let x = -r * 2; x <= r * 2; x++) {
      if ((x / 2) * (x / 2) + y * y <= r * r && y <= r * 0.6) cloud.set(y > r * 0.15 ? P.cloudSh : P.cloud, cx + x, cy + y);
    }
  };
  puff(0, 0, 3); puff(5, -1, 4); puff(10, 0, 3);
  L.cloudA = cloud;
  const cloudB = new Layer();
  const puffB = (cx, cy, r) => {
    for (let y = -r; y <= r; y++) for (let x = -r * 2; x <= r * 2; x++) {
      if ((x / 2) * (x / 2) + y * y <= r * r && y <= r * 0.6) cloudB.set(y > r * 0.15 ? P.cloudSh : P.cloud, cx + x, cy + y);
    }
  };
  puffB(0, 0, 2); puffB(4, -1, 3);
  L.cloudB = cloudB;

  // her
  const head = new Layer();
  sprite(head, HEAD, SIT.x, SIT.y);
  const body = new Layer();
  sprite(body, BODY, SIT.x, SIT.y + HEAD.length);
  const edge = outlineOf(head, body);
  const neckY = SIT.y + HEAD.length;
  L.headEdge = setLayer(edge, INK, (x, y) => y < neckY);
  L.bodyEdge = setLayer(edge, INK, (x, y) => y >= neckY);
  L.head = head;
  L.body = body;
  const coco = new Layer();
  sprite(coco, HOLD_COCONUT, SIT.x, SIT.y + HEAD.length + 1);
  L.coco = coco;
  const coffee = new Layer();
  sprite(coffee, HOLD_COFFEE, SIT.x, SIT.y + HEAD.length + 1);
  L.coffee = coffee;

  // walking, facing right (out) and left with the coffee (back)
  const standY = SIT.y + 1;
  for (const [name, mirror, carry] of [['out', false, false], ['back', true, true]]) {
    for (const [fi, legs] of [[0, LEGS_A], [1, LEGS_B]]) {
      const l = new Layer();
      sprite(l, [...STAND, ...legs], 0, 0, mirror);
      if (carry) sprite(l, CARRY_COFFEE, 0, 0, mirror);
      const e = setLayer(outlineOf(l), INK);
      for (const [c, s] of l.m) for (const k of s) { if (!e.m.has(c)) e.m.set(c, new Set()); e.m.get(c).add(k); }
      L[`${name}${fi}`] = e;
    }
  }
  L.standY = standY;

  // the ship that sails past behind her, on the horizon
  const ship = new Layer();
  sprite(ship, SHIP, 0, HORIZON - SHIP.length + 1);
  L.ship = ship;

  // the drone and the parcel
  const drone = new Layer();
  sprite(drone, DRONE, 0, 0);
  L.drone = drone;
  const parcel = new Layer();
  sprite(parcel, PARCEL, 2, 4);
  L.parcel = parcel;

  // one bar of signal, at the very top of the palm
  const sig = new Layer();
  const sx = 52; const sy = 2;
  for (let b = 0; b < 4; b++) for (let k = 0; k <= b; k++) sig.set(b === 0 ? P.sig : P.sigDim, sx + b * 2, sy + 3 - k);
  L.sig = sig;
  return L;
}

// =================================================================== STARFISH
// A five-armed vector star, low and faceted, tilted toward us and spinning
// about its own axis. Flat-shaded, sorted back to front, with three bumps
// down every arm so it reads as a starfish.
function starfishFrames(frames, scale) {
  const Ro = 1; const Ri = 0.44; const Hc = 0.4;
  const tilt = (57 * Math.PI) / 180;
  const f1 = (v) => String(+v.toFixed(1));
  const Lv = (() => { const v = [-0.45, -0.72, 0.55]; const m = Math.hypot(...v); return v.map((c) => c / m); })();
  const tips = []; const vals = [];
  for (let k = 0; k < 5; k++) {
    const a = ((-90 + 72 * k) * Math.PI) / 180;
    const b = ((-90 + 72 * k + 36) * Math.PI) / 180;
    tips.push([Ro * Math.cos(a), Ro * Math.sin(a), 0]);
    vals.push([Ri * Math.cos(b), Ri * Math.sin(b), 0]);
  }
  const ct = [0, 0, Hc]; const cb = [0, 0, -Hc];
  const faces = [];
  for (let k = 0; k < 5; k++) {
    const k1 = (k + 1) % 5;
    faces.push({ v: [ct, tips[k], vals[k]], top: true, arm: [k] });
    faces.push({ v: [ct, vals[k], tips[k1]], top: true, arm: [k1] });
    faces.push({ v: [cb, vals[k], tips[k]], top: false });
    faces.push({ v: [cb, tips[k1], vals[k]], top: false });
  }
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const out = [];
  for (let f = 0; f < frames; f++) {
    const phi = ((72 * f) / frames) * (Math.PI / 180);
    const T = ([x, y, z]) => {
      const x1 = x * Math.cos(phi) - y * Math.sin(phi);
      const y1 = x * Math.sin(phi) + y * Math.cos(phi);
      return [x1, y1 * Math.cos(tilt) - z * Math.sin(tilt), y1 * Math.sin(tilt) + z * Math.cos(tilt)];
    };
    const vis = [];
    const armSeen = new Set();
    for (const fc of faces) {
      const v = fc.v.map(T);
      let nrm = cross(sub(v[1], v[0]), sub(v[2], v[0]));
      const cen = [0, 1, 2].map((i) => (v[0][i] + v[1][i] + v[2][i]) / 3);
      if (dot(nrm, cen) < 0) nrm = nrm.map((c) => -c);
      const m = Math.hypot(...nrm);
      nrm = nrm.map((c) => c / m);
      if (nrm[2] <= 0.02) continue;
      const lam = Math.max(0, dot(nrm, Lv));
      const I = 0.18 + 0.82 * lam;
      const col = vga(ramp([[0, '#3d0a3c'], [0.42, '#a8236f'], [0.7, '#f0509e'], [0.88, '#ff8cc6'], [1, '#ffd2ea']], I));
      vis.push({ v, z: cen[2], col });
      if (fc.top && fc.arm) armSeen.add(fc.arm[0]);
    }
    vis.sort((a, b) => a.z - b.z);
    const pt = (p) => `${f1(p[0] * scale)} ${f1(p[1] * scale)}`;
    // the rim as one polygon underneath, so no background shows in the
    // antialiased seams between facets
    let rim = '';
    for (let k = 0; k < 5; k++) rim += `${k ? 'L' : 'M'}${pt(T(tips[k]))}L${pt(T(vals[k]))}`;
    let g = `<path fill="#c83a88" d="${rim}Z"/>`;
    for (const fc of vis) g += `<path fill="${short(fc.col)}" d="M${fc.v.map(pt).join('L')}Z"/>`;
    // bumps along each visible ridge: zero-length strokes with round caps
    const dots = ['', '', ''];
    for (const k of armSeen) {
      [0.3, 0.5, 0.7].forEach((s, j) => {
        const p = T([ct[0] + (tips[k][0] - ct[0]) * s, ct[1] + (tips[k][1] - ct[1]) * s, ct[2] + (tips[k][2] - ct[2]) * s]);
        dots[j] += `M${pt(p)}h0`;
      });
    }
    dots.forEach((d, j) => { if (d) g += `<path stroke-width="${[2.6, 2.1, 1.6][j]}" d="${d}"/>`; });
    out.push(g);
  }
  return out;
}

// =================================================================== SCROLLER
const SCROLL_TEXT = 'ATOLL ORDER PRESENTS CASTAWAY +10 * A TEN-HOUR LO-FI ISLAND VIDEO IN WHICH ALMOST NOTHING HAPPENS, ON PURPOSE * '
  + 'SHE SITS ON A VERY SMALL ISLAND, NODDING TO HER HEADPHONES, AND EVERY SO OFTEN SOMETHING HAPPENS, ALWAYS ON THE NEXT BAR OF THE MUSIC * '
  + 'MORE THAN 90 ACTIVITIES, FOUR TIMERS, ONE PALM * EVERY SOUND IS SYNTHESIZED FROM CODE: NO SAMPLES, NO LOOPS, NO RECORDINGS * '
  + 'WE PRESSED ALL TEN KEYS. NOTHING MOVED. THAT IS THE FEATURE * START: PYTHON TOOLS/SERVE.PY, THEN OPEN 127.0.0.1:8765 * '
  + 'HELLO TO THE SEA TURTLE, THE SHARK IN HEADPHONES, THE GREY TABBY AND THE HERMIT CRAB IN HIS NEW COCONUT * ';
const SPEED = 40; // lowres px per second
const AMP = 6;
const LAMBDA = 150;
const X_IN = SCROLL_R + 2;
const X_OUT = SCROLL_L - 18;
const sineY = (x) => SCROLL_MID - 7 + AMP * Math.sin((2 * Math.PI * x) / LAMBDA);

// =================================================================== VU
// 16 steps per bar: left leans on the kick (beats 1 and 3), right on the
// snare (2 and 4). Levels out of 13 segments.
const VU_L = [13, 10, 8, 6, 5, 4, 8, 6, 12, 9, 7, 6, 5, 8, 6, 4];
const VU_R = [5, 4, 7, 5, 12, 9, 7, 5, 6, 4, 7, 5, 13, 10, 8, 6];
const VU_SEG = 13;
const VU_BOT = 264;
const VU_W = 9;

// =================================================================== BUILD
function build() {
  const css = [];
  const defs = [];
  const body = [];

  // ---- window and field
  const bgKeys = [[0, '#1f0a49'], [120, '#2c136c'], [270, '#0b3088']];
  let stops = '';
  const BAND = 5;
  for (let y = 0; y < H; y += BAND) {
    const c = short(vga(ramp(bgKeys, y + BAND / 2)));
    stops += `<stop offset="${n(y / H)}" stop-color="${c}"/><stop offset="${n(Math.min(1, (y + BAND) / H))}" stop-color="${c}"/>`;
  }
  defs.push(`<linearGradient id="bg" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="${H}">${stops}</linearGradient>`);
  defs.push(`<clipPath id="win"><rect width="${W}" height="${H}" rx="7"/></clipPath>`);
  body.push(`<rect width="${W}" height="${H}" rx="7" fill="url(#bg)"/>`);

  // ---- title block
  const pres = [[C.pink, 'ATOLL ORDER '], [C.lav, 'presents']];
  let title = spansU(Math.round(W / 2 - len8(pres) / 2), 6, pres);
  const sub = 'a ten-hour lo-fi island video';
  title += textU(C.white, sub, Math.round(W / 2 - (sub.length * 8) / 2), 56);
  const by = [[C.lav, 'options locked by '], [C.brk, 'TIDELOCK']];
  title += spansU(Math.round(W / 2 - len8(by) / 2), 67, by);

  // ---- logo
  const logo = buildLogo();
  let rb = '';
  // long enough to cover a letter at any phase (0-47) plus any scroll (0-47)
  for (let r = 0; r < LH + 2 * RB_PERIOD + 2; r += 2) rb += `<path fill="${short(rbColour(r))}" d="M0 ${r}h40v2h-40z"/>`;
  defs.push(`<g id="rb">${rb}</g>`);
  logo.per.forEach((p, i) => {
    defs.push(`<clipPath id="lc${i}">${p.layer.svg()}</clipPath>`);
  });
  defs.push(`<path id="sil" d="${logo.silhouette}"/>`);
  body.push(`<g class="px"><use href="#sil" x="2" y="2" fill="${short(vga('#08021a'))}"/><use href="#sil" fill="${short(vga('#0e0322'))}"/></g>`);
  logo.per.forEach((p, i) => {
    // each letter starts six rows further round the rainbow (kept in y, not
    // in a delay, so the still frame for reduced motion keeps it too)
    const phase = (i * 6) % RB_PERIOD;
    body.push(`<g clip-path="url(#lc${i})"><use href="#rb" class="cy" x="${p.x - 2}" y="${LOGO_Y - 2 * RB_PERIOD + phase}"/></g>`);
  });
  body.push(`<g class="px">${logo.shine.svg(' opacity=".75"')}${logo.shade.svg(' opacity=".28"')}${logo.plus}</g>`);
  css.push(`.cy{animation:cy 6s steps(${RB_PERIOD}) infinite}@keyframes cy{to{transform:translateY(${RB_PERIOD}px)}}`);
  body.push(`<g class="px">${title}</g>`);

  // ---- dividers
  defs.push(`<linearGradient id="dg" x1="0" x2="1"><stop offset="0" stop-color="#ff6dc6"/><stop offset="1" stop-color="#61c7ff"/></linearGradient>`);
  body.push(`<path class="px" d="M8 81.5H472M8 199.5H472" stroke="url(#dg)" stroke-dasharray="1 1"/>`);

  // ---- the list: highlight bar first, text over it
  const bar = new Layer();
  for (let x = 4; x < W - 4; x++) {
    bar.set(vga('#ff7ee6'), x, LIST_Y);
    for (let y = 1; y < PITCH - 1; y++) bar.set(vga(y < 5 ? '#ae149c' : '#920d86'), x, LIST_Y + y);
    bar.set(vga('#4a0644'), x, LIST_Y + PITCH - 1);
  }
  body.push(`<g class="px bar">${bar.svg()}</g>`);
  let barKf = '';
  for (let i = 0; i < NROWS; i++) barKf += `${pc(i * ROW_T)}{transform:translateY(${i * PITCH}px)}`;
  css.push(`.bar{animation:bar ${LOOP}s step-end infinite}@keyframes bar{${barKf}to{transform:translateY(${(NROWS - 1) * PITCH}px)}}`);

  const list = buildList();
  defs.push(`<pattern id="ld" patternUnits="userSpaceOnUse" x="${LIST_X}" y="0" width="8" height="2"><rect x="3" width="2" height="2" fill="${C.dots}"/></pattern>`);
  body.push(`<g class="px">${list.base}</g>`);
  const delay = (i) => (i ? ` style="animation-delay:${n(i * ROW_T - LOOP)}s"` : '');
  ROWS.forEach((r, i) => {
    const sCls = r.long ? 'sL' : 's';
    const wCls = r.long ? 'wL' : 'w';
    body.push(`<g class="px ${sCls}"${delay(i)}>${list.states[i]}</g>`);
    body.push(`<g class="px ${wCls}"${delay(i)}>${list.wishes[i]}</g>`);
    body.push(`<g class="px k"${delay(i)}>${list.keys[i]}</g>`);
  });
  const a = pc(PRESS); const b = pc(WISH_END); const bL = pc(AWAY_BACK); const kUp = pc(PRESS + BEAT / 2);
  css.push(`.s,.sL{animation:s ${LOOP}s step-end infinite}.sL{animation-name:sL}`
    + `@keyframes s{0%{opacity:1}${a}{opacity:0}${b}{opacity:1}}@keyframes sL{0%{opacity:1}${a}{opacity:0}${bL}{opacity:1}}`);
  css.push(`.w,.wL,.k{opacity:0;animation:w ${LOOP}s step-end infinite}.wL{animation-name:wL}.k{animation-name:k}`
    + `@keyframes w{0%{opacity:0}${a}{opacity:1}${b}{opacity:0}}@keyframes wL{0%{opacity:0}${a}{opacity:1}${bL}{opacity:0}}`
    + `@keyframes k{0%{opacity:0}${a}{opacity:1}${kUp}{opacity:0}}`);

  // ---- message box + messages
  body.push(`<rect x="22" y="${MSG_Y - 3}" width="${W - 44}" height="13" rx="2" fill="#07021a" opacity=".55"/>`);
  ROWS.forEach((r, i) => {
    const s = `> ${r.msg}`;
    const x = Math.round(W / 2 - (s.length * 8) / 2);
    body.push(`<g class="px m${i ? '' : ' m0'}"${delay(i)}>${textU(C.key, s, x, MSG_Y)}</g>`);
  });
  css.push(`.m{opacity:0;animation:m ${LOOP}s step-end infinite}.m0{opacity:1}@keyframes m{0%{opacity:1}${pc(ROW_T)}{opacity:0}}`);

  // ---- instruction line
  const hl = [[C.key, 'ENTER: '], [C.white, 'python tools/serve.py'], [C.white, '   '], [C.key, 'ESC: '], [C.lav, 'see F9']];
  body.push(`<g class="px">${spansU(Math.round(W / 2 - len8(hl) / 2), HINT_Y, hl)}</g>`);

  // ---- level meters
  const vu = new Layer();
  const vuDim = new Layer();
  for (const x0 of [6, W - 6 - VU_W]) {
    for (let j = 0; j < VU_SEG; j++) {
      const c = j < 8 ? '#ffe23a' : j < 11 ? '#ffb33a' : '#ff6a3a';
      for (let y = 0; y < 2; y++) for (let x = 0; x < VU_W; x++) {
        vu.set(vga(c), x0 + x, VU_BOT - 3 * j - 2 + y);
        vuDim.set(vga(c), x0 + x, VU_BOT - 3 * j - 2 + y);
      }
    }
  }
  const vuH = VU_SEG * 3;
  defs.push(`<clipPath id="vul"><rect class="vl" x="6" y="${VU_BOT - vuH}" width="${VU_W}" height="${vuH}"/></clipPath>`);
  defs.push(`<clipPath id="vur"><rect class="vr" x="${W - 6 - VU_W}" y="${VU_BOT - vuH}" width="${VU_W}" height="${vuH}"/></clipPath>`);
  body.push(`<g class="px" opacity=".2">${vuDim.svg()}</g>`);
  body.push(`<g class="px" clip-path="url(#vul)">${vu.svg()}</g><g class="px" clip-path="url(#vur)">${vu.svg()}</g>`);
  const vuKf = (lv) => lv.map((v, i) => `${pc(i, 16)}{transform:scaleY(${n(v / VU_SEG)})}`).join('');
  css.push(`.vl,.vr{transform-origin:0 ${VU_BOT}px;transform:scaleY(.62)}`
    + `.vl{animation:vl ${BAR}s step-end infinite}.vr{animation:vr ${BAR}s step-end infinite}`
    + `@keyframes vl{${vuKf(VU_L)}}@keyframes vr{${vuKf(VU_R)}}`);

  // ---- the island panel
  const L = buildPanel();
  defs.push(`<clipPath id="pan"><rect x="0" y="0" width="${IW}" height="${IH}"/></clipPath>`);
  const pan = [];
  pan.push(L.bg.svg());
  pan.push(`<g class="cl">${L.cloudA.svg()}</g>`);
  pan.push(`<g class="cl cl2">${L.cloudB.svg()}</g>`);
  pan.push(`<g class="ship">${L.ship.svg()}</g>`);
  // the ship is behind the sea line at its own horizon row; redraw the
  // island and everything in front of it on top
  pan.push(`<g class="fa">${L.foam0.svg()}</g><g class="fb">${L.foam1.svg()}</g>`);
  pan.push(`<g class="raft">${L.raft.svg()}</g>`);
  pan.push(L.palm.svg());
  pan.push(L.leaf.svg());
  pan.push(`<g class="sig">${L.sig.svg()}</g>`);
  pan.push(`<g class="her">${L.bodyEdge.svg()}${L.body.svg()}<g class="nod">${L.headEdge.svg()}${L.head.svg()}</g></g>`);
  pan.push(`<g class="coco">${L.coco.svg()}</g>`);
  pan.push(`<g class="cof">${L.coffee.svg()}</g>`);
  const walkX0 = SIT.x + 2;
  pan.push(`<g class="wo"><g class="la">${L.out0.svg()}</g><g class="lb">${L.out1.svg()}</g></g>`);
  pan.push(`<g class="wb"><g class="la">${L.back0.svg()}</g><g class="lb">${L.back1.svg()}</g></g>`);
  pan.push(`<g class="par">${L.parcel.svg()}</g>`);
  pan.push(`<g class="dr">${L.drone.svg()}<g class="dp">${L.parcel.svg()}</g></g>`);
  body.push(`<rect x="${PX - 0.5}" y="${PY - 0.5}" width="${PW + 1}" height="${PH + 1}" fill="#0b0420"/>`);
  body.push(`<rect x="${PX}" y="${PY}" width="${PW}" height="${PH}" fill="${C.lav}"/>`);
  body.push(`<g transform="translate(${IX} ${IY})"><g class="px" clip-path="url(#pan)">${pan.join('')}</g></g>`);

  // panel timing, all on the 60 s loop
  const t3 = 2 * ROW_T; const t6 = 5 * ROW_T; const t7 = 6 * ROW_T; const t8 = 7 * ROW_T; const t9 = 8 * ROW_T;
  const out0 = t9 + AWAY_OUT; const out1 = out0 + 1.5; const back0 = out1 + BEAT; const back1 = t9 + AWAY_BACK;
  const walkDist = IW + 4 - walkX0;
  css.push(`.nod{animation:nod ${BEAT}s step-end infinite}@keyframes nod{0%{transform:translateY(1px)}33.33%{transform:translateY(0)}}`);
  css.push(`.fa,.fb{animation:fa ${2 * BEAT}s step-end infinite}.fb{opacity:0;animation-delay:-${BEAT}s}@keyframes fa{0%{opacity:1}50%{opacity:0}}`);
  css.push(`.raft{animation:raft ${2 * BAR}s step-end infinite}@keyframes raft{0%{transform:translateY(0)}50%{transform:translateY(1px)}}`);
  css.push(`.cl{animation:cl ${LOOP * 2}s steps(${IW + 40}) infinite;transform:translate(-20px,9px)}.cl2{animation-delay:-${LOOP}s;animation-name:cl2}`
    + `@keyframes cl{from{transform:translate(-20px,9px)}to{transform:translate(${IW + 20}px,9px)}}`
    + `@keyframes cl2{from{transform:translate(-20px,20px)}to{transform:translate(${IW + 20}px,20px)}}`);
  // ship: crosses during F3 while she sips a coconut
  css.push(`.ship{transform:translateX(-16px);animation:ship ${LOOP}s linear infinite}`
    + `@keyframes ship{0%,${pc(t3 + BEAT)}{transform:translateX(-16px);animation-timing-function:steps(${IW + 16})}${pc(t3 + ROW_T - BEAT / 2)},to{transform:translateX(${IW}px)}}`);
  const vis = (cls, t0, t1, base = 0) => css.push(`.${cls}{opacity:${base};animation:${cls} ${LOOP}s step-end infinite}`
    + `@keyframes ${cls}{0%{opacity:${t0 <= 0 ? 1 : 0}}${t0 > 0 ? `${pc(t0)}{opacity:1}` : ''}${pc(t1)}{opacity:0}}`);
  vis('coco', t3 + BEAT / 2, t3 + ROW_T);
  vis('sig', t6 + BEAT, t6 + ROW_T);
  vis('cof', back1, LOOP - 2 * BEAT);
  // her: away from the press on F9 until she sits back down
  css.push(`.her{animation:her ${LOOP}s step-end infinite}@keyframes her{0%{opacity:1}${pc(out0)}{opacity:0}${pc(back1)}{opacity:1}}`);
  css.push(`.wo{opacity:0;animation:wo ${LOOP}s infinite}`
    + `@keyframes wo{0%,${pc(out0 - 0.001)}{opacity:0;transform:translate(${walkX0}px,${L.standY}px)}`
    + `${pc(out0)}{opacity:1;transform:translate(${walkX0}px,${L.standY}px);animation-timing-function:steps(${walkDist})}`
    + `${pc(out1)}{opacity:1;transform:translate(${walkX0 + walkDist}px,${L.standY}px)}${pc(out1 + 0.001)},to{opacity:0;transform:translate(${walkX0 + walkDist}px,${L.standY}px)}}`);
  css.push(`.wb{opacity:0;animation:wb ${LOOP}s infinite}`
    + `@keyframes wb{0%,${pc(back0 - 0.001)}{opacity:0;transform:translate(${walkX0 + walkDist}px,${L.standY}px)}`
    + `${pc(back0)}{opacity:1;transform:translate(${walkX0 + walkDist}px,${L.standY}px);animation-timing-function:steps(${walkDist})}`
    + `${pc(back1)}{opacity:1;transform:translate(${walkX0}px,${L.standY}px)}${pc(back1 + 0.001)},to{opacity:0;transform:translate(${walkX0}px,${L.standY}px)}}`);
  css.push(`.la,.lb{animation:fa ${BEAT / 1.5}s step-end infinite}.lb{opacity:0;animation-delay:-${n(BEAT / 3)}s}`);
  // drone: in with the parcel during F7, parcel left on the sand, washed off in F8
  const dIn = t7; const dDrop = t7 + 2 * BEAT; const dOut = dDrop + 1.5 * BEAT;
  const parX = 20; const parY = 52; // drone origin when the parcel touches down
  css.push(`.dr{opacity:0;animation:dr ${LOOP}s infinite}`
    + `@keyframes dr{0%,${pc(dIn - 0.001)}{opacity:0;transform:translate(-14px,-6px)}`
    + `${pc(dIn)}{opacity:1;transform:translate(-14px,-6px);animation-timing-function:steps(24)}`
    + `${pc(dDrop)}{opacity:1;transform:translate(${parX}px,${parY - 4}px);animation-timing-function:steps(18)}`
    + `${pc(dOut)}{opacity:1;transform:translate(-12px,-8px)}${pc(dOut + 0.001)},to{opacity:0;transform:translate(-12px,-8px)}}`);
  css.push(`.dp{animation:dp ${LOOP}s step-end infinite}@keyframes dp{0%{opacity:1}${pc(dDrop)}{opacity:0}}`);
  const wash0 = t8 + BAR; const wash1 = wash0 + BAR;
  css.push(`.par{opacity:0;animation:par ${LOOP}s infinite}`
    + `@keyframes par{0%,${pc(dDrop - 0.001)}{opacity:0;transform:translate(${parX}px,${parY - 4}px)}`
    + `${pc(dDrop)}{opacity:1;transform:translate(${parX}px,${parY - 4}px)}`
    + `${pc(wash0)}{opacity:1;transform:translate(${parX}px,${parY - 4}px);animation-timing-function:steps(${parX + 8})}`
    + `${pc(wash1)}{opacity:1;transform:translate(-8px,${parY - 1}px)}${pc(wash1 + 0.001)},to{opacity:0;transform:translate(-8px,${parY - 1}px)}}`);

  // ---- starfish
  const SF_FRAMES = 18;
  const SF_T = 2 * BEAT;
  const frames = starfishFrames(SF_FRAMES, 34);
  let sf = '';
  frames.forEach((g, i) => {
    const d = i ? ` style="animation-delay:${+((i * SF_T) / SF_FRAMES - SF_T).toFixed(4)}s"` : '';
    sf += `<g class="f${i ? '' : ' f0'}"${d}>${g}</g>`;
  });
  body.push(`<g transform="translate(${SF_X} ${SF_Y})"><g class="sfw" stroke-linecap="round">${sf}</g></g>`);
  css.push(`.f{opacity:0;animation:f ${SF_T}s step-end infinite}.f0{opacity:1}@keyframes f{0%{opacity:1}${Math.floor((1e6 / SF_FRAMES)) / 1e4}%{opacity:0}}`);
  css.push(`.sfw [stroke-width]{stroke:#ffe3f2}.sfw{animation:sfw ${4 * BAR}s ease-in-out infinite}@keyframes sfw{0%,to{transform:rotate(-9deg)}50%{transform:translateY(-2px) rotate(9deg)}}`);

  // ---- sine scroller
  const total = [...SCROLL_TEXT].reduce((acc, ch) => acc + bigAdvance(ch), 0);
  const T = total / SPEED;
  const travel = X_IN - X_OUT;
  const D = travel / SPEED;
  let kf = '';
  for (let x = X_IN; x >= X_OUT; x -= 6) {
    kf += `${n((100 * ((X_IN - x) / SPEED)) / T)}%{transform:translate(${x}px,${n(sineY(x))}px)}`;
  }
  kf += `to{transform:translate(${X_OUT}px,${n(sineY(X_OUT))}px)}`;
  css.push(`.anim>use{animation:sc ${n(T)}s linear infinite}@keyframes sc{${kf}}`);
  const START_X = 30; // where the first glyph sits on the first frame
  const t0 = (X_IN - START_X) / SPEED;
  let off = 0;
  let anim = '';
  let still = '';
  for (const ch of SCROLL_TEXT) {
    if (ch !== ' ') {
      let p = (t0 - off / SPEED) % T;
      if (p < 0) p += T;
      anim += `<use href="#${bid(ch)}" style="animation-delay:${n(-p)}s"/>`;
      if (p <= D) {
        const x = X_IN - p * SPEED;
        if (x > X_OUT && x < X_IN) still += `<use href="#${bid(ch)}" x="${n(x)}" y="${n(sineY(x))}"/>`;
      }
    }
    off += bigAdvance(ch);
  }
  defs.push(`<clipPath id="scl"><rect x="${SCROLL_L}" y="${SCROLL_MID - 20}" width="${SCROLL_R - SCROLL_L}" height="40"/></clipPath>`);
  body.push(`<g clip-path="url(#scl)" class="px"><g class="anim">${anim}</g><g class="still">${still}</g></g>`);
  css.push('.still{display:none}');

  // ---- frame
  body.push(`<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="6.5" fill="none" stroke="#0a0320"/>`);
  body.push(`<rect x="1.5" y="1.5" width="${W - 3}" height="${H - 3}" rx="5.5" fill="none" stroke="${C.lav}" stroke-opacity=".35"/>`);

  css.push('.px{shape-rendering:crispEdges}');
  css.push('@media (prefers-reduced-motion:reduce){*{animation:none!important}.anim{display:none}.still{display:inline}}');

  const titleTxt = 'CASTAWAY +10: a ten-hour lo-fi island video, shown as a PC options menu with ten F-key toggles, every one locked';
  const desc = 'A purple-to-blue options screen. ATOLL ORDER presents CASTAWAY +10 in slanted letters, each with its own cycling rainbow, beside a little daylight window on the island: one tall palm, a raft, and her in cream headphones and a coral top, nodding on the beat. A pink faceted starfish turns at the right. Ten function keys are listed with bracketed states: unlimited daylight on, something happens soon-ish, ship notices her off, samples and loops none, gags land on the beat on, phone signal 1 bar, headphone delivery by drone, bottle stays away off, leave the island any time, random seed 1992. A magenta bar steps down one option every two bars of music and presses its key; the state flips for one beat and flips back. Only F9 works: she walks off over the water and returns with an iced coffee. Yellow level meters jump in the bottom corners, the instruction line reads ENTER: python tools/serve.py, ESC: see F9, and a sine scroller runs underneath.';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W * 2}" height="${H * 2}" role="img" aria-labelledby="t d">`
    + `<title id="t">${titleTxt}</title><desc id="d">${desc}</desc>`
    + `<style>${css.join('')}</style>`
    + `<defs>${defs.join('')}${glyphDefs()}${bigDefs()}</defs>`
    + `<g clip-path="url(#win)">${body.join('')}</g>`
    + '</svg>\n';
  return { svg, L };
}

const { svg, L } = build();
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, svg);
console.log(`wrote ${path.relative(process.cwd(), OUT)} (${(svg.length / 1024).toFixed(1)} KB)`);

// ------------------------------------------------------------------ debug
if (DEBUG) {
  fs.mkdirSync(DEBUG, { recursive: true });
  const sheet = [
    `<g>${L.bg.svg()}${L.cloudA.svg()}${L.ship.svg()}${L.foam0.svg()}${L.raft.svg()}${L.palm.svg()}${L.leaf.svg()}${L.sig.svg()}${L.bodyEdge.svg()}${L.body.svg()}${L.headEdge.svg()}${L.head.svg()}${L.coco.svg()}</g>`,
    `<g transform="translate(100 0)">${L.bg.svg()}${L.foam1.svg()}${L.raft.svg()}${L.palm.svg()}${L.leaf.svg()}${L.bodyEdge.svg()}${L.body.svg()}${L.headEdge.svg()}${L.head.svg()}${L.coffee.svg()}`
    + `<g transform="translate(70 ${L.standY})">${L.out0.svg()}</g><g transform="translate(80 ${L.standY})">${L.out1.svg()}</g>`
    + `<g transform="translate(14 30)">${L.drone.svg()}${L.parcel.svg()}</g></g>`,
    `<g transform="translate(200 0)">${L.bg.svg()}${L.raft.svg()}${L.palm.svg()}${L.leaf.svg()}`
    + `<g transform="translate(40 ${L.standY})">${L.back0.svg()}</g><g transform="translate(60 ${L.standY})">${L.back1.svg()}</g></g>`,
  ];
  const dbg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 ${IH}" width="${300 * 6}" height="${IH * 6}" shape-rendering="crispEdges">${sheet.join('')}</svg>`;
  fs.writeFileSync(path.join(DEBUG, 'panel-sheet.svg'), dbg);
  console.log(`debug sheet -> ${DEBUG}`);
}
