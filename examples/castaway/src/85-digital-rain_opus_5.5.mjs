#!/usr/bin/env node
// CASTAWAY as a digital rain banner: the falling-glyph screen made famous by
// a 1999 science-fiction film (glyphs by Simon Whiteley) and imitated ever
// since by screensavers and the terminal program cmatrix. Columns of glyphs
// on a dark screen, each led by a bright head with a tail that fades out
// behind it, and every so often the rain stops on fixed bright glyphs that
// spell a word.
//
//   node examples/castaway/src/85-digital-rain_opus_5.5.mjs
//   node examples/castaway/src/85-digital-rain_opus_5.5.mjs --at=27 --out=some/where.svg
//
// Regenerates ../assets/85-digital-rain_opus_5.5.svg (the banner) and
// ../assets/85-digital-rain_opus_5.5-key.svg (the glyph key, for the .md's
// details block). The .md itself is hand-written.
// Plain Node, no dependencies, deterministic (seeded PRNG, no clock).
// --at bakes a head start (seconds) into every animation so a late frame can
// be checked without waiting; use it only with --out.
//
// Nothing here is copied from the film, its title, its typeface or any
// imitation: the glyph set (abstract strokes, mirrored digits and little
// island pictograms), the lettering, the island and the colours are drawn in
// this file. The real thing is only credited as the style's origin.
//
// How the banner works
//   * THE GLYPHS NEVER MOVE. A fixed grid of 75 x 18 cells, one glyph each,
//     is drawn ONCE, in white, on black, as a single path (plus a wide faint
//     copy for glow). Only the light moves, which is how the real effect works.
//   * THE LIGHT is one tall rectangle per column, filled with a repeating
//     vertical gradient (black, then a tail ramping up through deep teal and
//     lagoon aqua to a white head cell, then black again). The rectangles are
//     laid over the glyphs with mix-blend-mode: multiply, so a white glyph
//     takes exactly the colour of the light over it, and black stays black.
//     A final lighten pass turns black into the deep lagoon background.
//   * STEPPED. Each rectangle slides down one cell at a time (CSS steps()),
//     so every head lands squarely on one glyph. Columns differ in speed
//     (3.5 to 5 cells a second in the middle, about 4 at the edges), in trail
//     lengths and in phase; the light layouts come from a small shared pool so
//     the gradients can be reused. Hard cuts and stepped movement are also
//     the project's own motion defaults. Every period divides 60 s.
//   * GLYPH SWAPS. A few dozen cells hold a second glyph that cuts in and out
//     on its own timer, so lit glyphs change character now and then.
//   * THE TITLE IS WRITTEN BY THE RAIN. Every locked cell switches on at the
//     exact step a head arrives in it, and off again when the same head comes
//     round again some periods later. All the middle columns share one
//     6-second period, so one keyframe set per layer serves every cell, and a
//     per-cell delay class does the rest. Locked cells are <use>s of shared
//     glyph symbols, coloured by a hue class (a lit tile and a light ink).
//     The minute (the length of the theme's loop, 20 bars of 3 s):
//       0 s   CASTAWAY and its tagline are locked, from the first frame
//       14 s  the rain washes the letters away, head by head
//       20 s  the rain writes the island instead: sun, clouds, horizon, a
//             band of blue sea, the palm, the sand, a raft, and her (three
//             glyphs tall, her head
//             nodding on every beat). Under the island the rain was already
//             full of shells, starfish and palms.
//       28 s  a coconut drops from the palm, lands on a hermit crab on the bar
//             line at 30 s, and the crab walks off wearing it, a cell a beat
//       38 s  the island washes away; from 44 s CASTAWAY is written back
//   * GLINTS. While the name is locked, a head passing behind one of its
//     cells lights that glyph white: the field, clipped to the title cells,
//     lit by head-only copies of the column lights and laid on with screen.
//   * prefers-reduced-motion stops every animation on the opening frame:
//     the title lit, the rain frozen mid-fall, no glints.
//
// The glyph key (-key.svg) shows 24 of the island glyphs at three times
// size with a name and a note each, lit now and then by a passing head.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '85-digital-rain_opus_5.5';
const ASSETS = path.join(HERE, '..', 'assets');
const arg = (name) => {
  const hit = process.argv.slice(2).find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : null;
};
const AT = Number(arg('at') || 0);
const OUT = arg('out');

// ---------------------------------------------------------------------------
// Grid, timing, palette
// ---------------------------------------------------------------------------
const CW = 16, CH = 20, COLS = 75, ROWS = 18;
const W = CW * COLS, H = CH * ROWS;           // 1200 x 360
const LOOP = 60, BEAT = 0.75;
const MID0 = 5, MID1 = 69;                    // middle columns share the 6 s period
const MIDP = 6;

// the minute
const T_TITLE_OFF = 14;   // first head after this erases a title cell
const T_TITLE_HOLD = 30;  // ...and the same head writes it back 30 s later
const T_ISLE_ON = 20;     // first head after this writes an island cell
const T_ISLE_HOLD = 18;   // ...and the same head erases it 18 s later

const BG = '#03171c';
const RAMP = { tail: '#0b4743', body: '#1fd6b6', bright: '#86fbe6', near: '#d2fff6', head: '#ffffff' };

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------
const rng = (seed) => () => {
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const R = rng(1992);
const ri = (a, b) => a + Math.floor(R() * (b - a + 1));
const pick = (arr) => arr[Math.floor(R() * arr.length)];
const f1 = (n) => {
  let s = (Math.round(n * 10) / 10).toFixed(1);
  if (s.endsWith('.0')) s = s.slice(0, -2);
  if (s === '-0') s = '0';
  return s.replace(/^(-?)0\./, '$1.');
};
const f3 = (n) => {
  let s = (Math.round(n * 1000) / 1000).toFixed(3).replace(/0+$/, '').replace(/\.$/, '');
  if (s === '-0') s = '0';
  return s.replace(/^(-?)0\./, '$1.');
};
const pct = (sec) => f3((sec / LOOP) * 100) + '%';
const mod = (a, n) => ((a % n) + n) % n;
const hex = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const mix = (a, b, k) => {
  const A = hex(a), B = hex(b);
  return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, '0')).join('');
};
// negative CSS delay that puts local time 0 of a 60 s animation at time `at`
const delayFor = (at, dur = LOOP) => `${f3(-mod(dur - at + AT, dur))}s`;

// relative polyline path; a closed polyline ends in z
function pathD(polys) {
  let d = '', cx = 0, cy = 0;
  const pair = (a, b) => f1(a) + (f1(b).startsWith('-') ? '' : ',') + f1(b);
  for (const pl of polys) {
    const closed = pl.length > 2 && pl[0][0] === pl.at(-1)[0] && pl[0][1] === pl.at(-1)[1];
    const pts = closed ? pl.slice(0, -1) : pl;
    const [x0, y0] = pts[0];
    d += d ? 'm' + pair(x0 - cx, y0 - cy) : 'M' + pair(x0, y0);
    cx = x0; cy = y0;
    for (let i = 1; i < pts.length; i++) {
      const [x, y] = pts[i];
      const dx = x - cx, dy = y - cy;
      d += dy === 0 ? 'h' + f1(dx) : dx === 0 ? 'v' + f1(dy) : 'l' + pair(dx, dy);
      cx = x; cy = y;
    }
    if (closed) { d += 'z'; cx = x0; cy = y0; }
  }
  return d;
}
const shift = (polys, ox, oy) => polys.map((pl) => pl.map(([x, y]) => [x + ox, y + oy]));
const mirrorX = (polys, w = 12) => polys.map((pl) => pl.map(([x, y]) => [w - x, y]));
const scale = (polys, k) => polys.map((pl) => pl.map(([x, y]) => [x * k, y * k]));

// ---------------------------------------------------------------------------
// The rain glyphs: 12 x 16 boxes, set 2 px into each 16 x 20 cell.
// Abstract angular strokes, mirrored digits, and island pictograms.
// ---------------------------------------------------------------------------
const CODE = [
  [[[0, 2], [12, 2]], [[6, 2], [6, 16]], [[6, 9], [1, 15]]],
  [[[1, 1], [11, 1], [11, 15]], [[1, 8], [11, 8]]],
  [[[2, 0], [2, 16]], [[2, 6], [11, 3]], [[2, 12], [11, 9]]],
  [[[0, 4], [12, 4]], [[8, 0], [8, 16], [3, 16]]],
  [[[1, 2], [11, 2], [6, 9], [6, 16]]],
  [[[2, 1], [10, 1], [10, 15], [2, 15]], [[3, 8], [10, 8]]],
  [[[11, 1], [1, 13]], [[5, 8], [11, 15]]],
  [[[0, 4], [12, 4]], [[0, 10], [12, 10]], [[6, 0], [6, 16]]],
  [[[1, 1], [11, 1]], [[6, 1], [6, 7]], [[1, 7], [11, 7], [11, 15], [1, 15]]],
  [[[3, 0], [9, 16]], [[0, 6], [12, 6]]],
  [[[10, 0], [10, 16]], [[2, 4], [10, 4]], [[2, 4], [2, 12]]],
  [[[1, 4], [6, 0], [11, 4]], [[6, 0], [6, 16]], [[1, 16], [11, 16]]],
  [[[0, 8], [12, 8]], [[3, 1], [3, 15]], [[9, 1], [9, 15]]],
  [[[1, 1], [11, 1], [1, 15], [11, 15]]],
  [[[6, 0], [6, 6]], [[1, 6], [11, 6], [9, 16]], [[4, 10], [5, 16]]],
  [[[2, 2], [10, 2]], [[0, 8], [12, 8]], [[6, 8], [6, 16]]],
  [[[1, 0], [1, 16], [11, 16]], [[1, 7], [8, 7]]],
  [[[11, 2], [5, 8], [11, 14]], [[1, 2], [1, 14]]],
  [[[0, 4], [6, 0], [12, 4]], [[3, 8], [9, 8]], [[6, 4], [6, 16]], [[2, 12], [10, 12]]],
  [[[2, 1], [2, 9], [10, 9]], [[10, 1], [10, 16]]],
  [[[1, 1], [11, 1], [11, 6], [1, 6]], [[6, 6], [6, 16]], [[2, 11], [10, 11]]],
  [[[1, 15], [11, 1]], [[1, 1], [5, 5]], [[7, 11], [11, 15]]],
  [[[6, 0], [1, 7], [11, 7], [6, 16]]],
  [[[0, 2], [12, 2]], [[3, 2], [3, 16]], [[9, 2], [9, 10], [12, 13]]],
  [[[1, 4], [11, 4]], [[1, 4], [1, 12], [11, 12]], [[6, 0], [6, 16]]],
  [[[11, 0], [1, 6], [11, 6]], [[6, 6], [6, 16]], [[1, 16], [11, 11]]],
  [[[1, 1], [11, 1]], [[1, 6], [11, 6]], [[11, 6], [6, 16]]],
  [[[2, 0], [2, 16]], [[10, 0], [10, 16]], [[2, 0], [10, 16]]],
  [[[6, 0], [6, 16]], [[1, 5], [11, 5]], [[1, 11], [6, 16], [11, 11]]],
  [[[1, 8], [6, 2], [11, 8], [6, 14], [1, 8]]],
];
// digits, drawn upright and then mirrored
const DIGITS = [
  [[[2, 0], [10, 0], [10, 16], [2, 16], [2, 0]], [[10, 0], [2, 16]]],
  [[[3, 3], [6, 0], [6, 16]], [[2, 16], [10, 16]]],
  [[[1, 2], [3, 0], [9, 0], [11, 2], [11, 6], [1, 16], [11, 16]]],
  [[[1, 0], [11, 0], [5, 7], [9, 7], [11, 10], [11, 14], [9, 16], [1, 16]]],
  [[[8, 16], [8, 0], [0, 11], [12, 11]]],
  [[[11, 0], [1, 0], [1, 7], [9, 7], [11, 9], [11, 14], [9, 16], [1, 16]]],
  [[[0, 0], [12, 0], [4, 16]]],
  [[[11, 8], [3, 8], [1, 6], [1, 2], [3, 0], [9, 0], [11, 2], [11, 16]]],
].map((g) => mirrorX(g));

// island pictograms (also listed, enlarged and labelled, in the glyph key)
const PICTO = {
  palm: [[[4, 16], [5, 12], [6, 8], [7, 5]], [[7, 5], [3, 3], [0, 6]], [[7, 5], [11, 3], [12, 7]], [[7, 5], [5, 1], [2, 0]], [[7, 5], [9, 0], [12, 0]]],
  coconut: [[[4, 3], [8, 3], [11, 6], [11, 11], [8, 14], [4, 14], [1, 11], [1, 6], [4, 3]], [[4, 7], [5, 7]], [[7, 7], [8, 7]], [[5, 10], [7, 10]]],
  wave: [[[0, 9], [3, 6], [6, 9], [9, 6], [12, 9]], [[0, 15], [3, 12], [6, 15], [9, 12], [12, 15]]],
  crab: [[[3, 9], [9, 9], [11, 12], [9, 15], [3, 15], [1, 12], [3, 9]], [[2, 10], [0, 6], [2, 3]], [[0, 6], [3, 6]], [[10, 10], [12, 6], [10, 3]], [[12, 6], [9, 6]], [[5, 9], [5, 7]], [[7, 9], [7, 7]], [[2, 14], [0, 16]], [[10, 14], [12, 16]]],
  bottle: [[[5, 0], [7, 0]], [[5, 1], [5, 5], [3, 8], [3, 16], [9, 16], [9, 8], [7, 5], [7, 1]], [[5, 11], [7, 11]]],
  note: [[[8, 0], [8, 12]], [[8, 0], [12, 3], [12, 6]], [[8, 12], [5, 15], [2, 13], [5, 10], [8, 12]]],
  headphones: [[[1, 10], [1, 6], [3, 2], [9, 2], [11, 6], [11, 10]], [[0, 9], [3, 9], [3, 15], [0, 15], [0, 9]], [[12, 9], [9, 9], [9, 15], [12, 15], [12, 9]]],
  sun: [[[6, 4], [9, 5], [10, 8], [9, 11], [6, 12], [3, 11], [2, 8], [3, 5], [6, 4]], [[6, 0], [6, 2]], [[6, 14], [6, 16]], [[0, 8], [1, 8]], [[11, 8], [12, 8]], [[1, 3], [2, 4]], [[11, 3], [10, 4]], [[1, 13], [2, 12]], [[11, 13], [10, 12]]],
  fish: [[[3, 8], [6, 5], [10, 5], [12, 8], [10, 11], [6, 11], [3, 8]], [[3, 8], [0, 5], [0, 11], [3, 8]], [[9, 7], [10, 7]]],
  hook: [[[8, 0], [8, 11], [6, 14], [3, 14], [1, 11], [1, 8]], [[1, 8], [3, 10]]],
  shell: [[[3, 16], [9, 16]], [[6, 16], [0, 6], [3, 2], [6, 1], [9, 2], [12, 6], [6, 16]], [[6, 16], [3, 3]], [[6, 16], [6, 1]], [[6, 16], [9, 3]]],
  turtle: [[[6, 3], [9, 4], [10, 9], [9, 13], [6, 15], [3, 13], [2, 9], [3, 4], [6, 3]], [[5, 3], [5, 1], [6, 0], [7, 1], [7, 3]], [[3, 5], [0, 3], [0, 7], [2, 8]], [[9, 5], [12, 3], [12, 7], [10, 8]], [[3, 12], [0, 15]], [[9, 12], [12, 15]], [[6, 6], [8, 8], [8, 10], [6, 12], [4, 10], [4, 8], [6, 6]]],
  cat: [[[2, 7], [2, 1], [5, 4], [7, 4], [10, 1], [10, 7], [11, 11], [9, 15], [3, 15], [1, 11], [2, 7]], [[4, 9], [5, 9]], [[7, 9], [8, 9]], [[6, 11], [6, 12]]],
  signal: [[[1, 16], [1, 13]], [[4, 16], [4, 10]], [[7, 16], [7, 6]], [[10, 16], [10, 2]]],
  coffee: [[[2, 4], [10, 4], [9, 16], [3, 16], [2, 4]], [[7, 4], [9, 0], [12, 0]], [[4, 8], [6, 8], [6, 10], [4, 10], [4, 8]]],
  fin: [[[0, 15], [12, 15]], [[2, 15], [5, 8], [10, 3], [8, 9], [9, 15]]],
  flame: [[[6, 16], [2, 13], [2, 9], [5, 5], [6, 0], [8, 5], [10, 8], [10, 13], [6, 16]], [[6, 16], [5, 12], [7, 9]]],
  castle: [[[1, 16], [1, 7], [3, 7], [3, 9], [5, 9], [5, 7], [7, 7], [7, 9], [9, 9], [9, 7], [11, 7], [11, 16], [1, 16]], [[5, 16], [5, 12], [7, 12], [7, 16]], [[6, 7], [6, 1], [9, 2], [6, 3]]],
  kumara: [[[6, 16], [6, 8]], [[6, 11], [1, 7], [1, 11], [6, 11]], [[6, 8], [11, 4], [11, 8], [6, 8]], [[2, 16], [10, 16]]],
  drone: [[[0, 1], [4, 1]], [[8, 1], [12, 1]], [[2, 1], [2, 3], [10, 3], [10, 1]], [[4, 3], [4, 6], [8, 6], [8, 3]], [[6, 6], [6, 9]], [[3, 9], [9, 9], [9, 15], [3, 15], [3, 9]]],
  raft: [[[1, 5], [11, 5]], [[0, 8], [12, 8]], [[1, 11], [11, 11]], [[3, 3], [3, 13]], [[9, 3], [9, 13]]],
  starfish: [[[6, 0], [8, 6], [12, 6], [9, 10], [10, 16], [6, 12], [2, 16], [3, 10], [0, 6], [4, 6], [6, 0]]],
  hammock: [[[1, 0], [1, 16]], [[11, 0], [11, 16]], [[1, 6], [3, 10], [9, 10], [11, 6]]],
};
const PICTO_LIST = Object.values(PICTO);
// glyphs with a lot of ink, for the cells that lock into the title
const DENSE = [CODE[7], CODE[12], CODE[18], CODE[5], CODE[8], CODE[20], CODE[24], CODE[27], DIGITS[0], CODE[2], CODE[10], CODE[16]];

const allGlyphs = [...CODE, ...DIGITS, ...PICTO_LIST];
function randomGlyph() {
  const u = R();
  if (u < 0.56) return pick(CODE);
  if (u < 0.76) return pick(DIGITS);
  return pick(PICTO_LIST);
}

// ---------------------------------------------------------------------------
// Lettering for the tagline: an angular stroke capital set, 10 x 14 boxes
// ---------------------------------------------------------------------------
const O10 = [[3, 0], [7, 0], [10, 3], [10, 11], [7, 14], [3, 14], [0, 11], [0, 3], [3, 0]];
const P10 = [[0, 14], [0, 0], [7, 0], [10, 3], [10, 5], [7, 8], [0, 8]];
const FONT = {
  A: [[[0, 14], [0, 3], [3, 0], [7, 0], [10, 3], [10, 14]], [[0, 8], [10, 8]]],
  B: [[[0, 14], [0, 0], [7, 0], [10, 3], [10, 4], [7, 7], [0, 7]], [[7, 7], [10, 10], [10, 11], [7, 14], [0, 14]]],
  C: [[[10, 0], [3, 0], [0, 3], [0, 11], [3, 14], [10, 14]]],
  D: [[[0, 0], [6, 0], [10, 4], [10, 10], [6, 14], [0, 14], [0, 0]]],
  E: [[[10, 0], [0, 0], [0, 14], [10, 14]], [[0, 7], [7, 7]]],
  F: [[[10, 0], [0, 0], [0, 14]], [[0, 7], [7, 7]]],
  G: [[[10, 0], [3, 0], [0, 3], [0, 11], [3, 14], [10, 14], [10, 8], [5, 8]]],
  H: [[[0, 0], [0, 14]], [[10, 0], [10, 14]], [[0, 7], [10, 7]]],
  I: [[[5, 0], [5, 14]], [[2, 0], [8, 0]], [[2, 14], [8, 14]]],
  J: [[[10, 0], [10, 11], [7, 14], [3, 14], [0, 11]]],
  K: [[[0, 0], [0, 14]], [[10, 0], [3, 7], [10, 14]], [[0, 7], [3, 7]]],
  L: [[[0, 0], [0, 14], [10, 14]]],
  M: [[[0, 14], [0, 0], [5, 6], [10, 0], [10, 14]]],
  N: [[[0, 14], [0, 0], [10, 14], [10, 0]]],
  O: [O10],
  P: [P10],
  Q: [O10, [[6, 10], [10, 15]]],
  R: [P10, [[5, 8], [10, 14]]],
  S: [[[10, 0], [3, 0], [0, 3], [0, 4], [3, 7], [7, 7], [10, 10], [10, 11], [7, 14], [0, 14]]],
  T: [[[0, 0], [10, 0]], [[5, 0], [5, 14]]],
  U: [[[0, 0], [0, 11], [3, 14], [7, 14], [10, 11], [10, 0]]],
  V: [[[0, 0], [5, 14], [10, 0]]],
  W: [[[0, 0], [2, 14], [5, 6], [8, 14], [10, 0]]],
  X: [[[0, 0], [10, 14]], [[10, 0], [0, 14]]],
  Y: [[[0, 0], [5, 7], [10, 0]], [[5, 7], [5, 14]]],
  Z: [[[0, 0], [10, 0], [0, 14], [10, 14]]],
  0: [O10, [[8, 2], [2, 12]]],
  1: [[[2, 3], [5, 0], [5, 14]], [[2, 14], [8, 14]]],
  2: [[[0, 3], [3, 0], [7, 0], [10, 3], [10, 5], [0, 14], [10, 14]]],
  3: [[[0, 0], [10, 0], [4, 6], [7, 6], [10, 9], [10, 11], [7, 14], [0, 14]]],
  4: [[[7, 14], [7, 0], [0, 10], [10, 10]]],
  5: [[[10, 0], [0, 0], [0, 6], [7, 6], [10, 9], [10, 11], [7, 14], [0, 14]]],
  6: [[[9, 0], [3, 0], [0, 3], [0, 11], [3, 14], [7, 14], [10, 11], [10, 9], [7, 6], [0, 6]]],
  7: [[[0, 0], [10, 0], [3, 14]]],
  8: [[[3, 7], [0, 4], [0, 3], [3, 0], [7, 0], [10, 3], [10, 4], [7, 7], [3, 7], [0, 10], [0, 11], [3, 14], [7, 14], [10, 11], [10, 10], [7, 7]]],
  9: [[[10, 8], [3, 8], [0, 5], [0, 3], [3, 0], [7, 0], [10, 3], [10, 11], [7, 14], [1, 14]]],
  '.': [[[5, 12], [5, 14]]],
  ',': [[[6, 12], [4, 16]]],
  ':': [[[5, 3], [5, 5]], [[5, 10], [5, 12]]],
  '-': [[[2, 7], [8, 7]]],
  '/': [[[1, 14], [9, 0]]],
  "'": [[[5, 0], [5, 4]]],
  '(': [[[7, 0], [4, 3], [4, 11], [7, 14]]],
  ')': [[[3, 0], [6, 3], [6, 11], [3, 14]]],
  '?': [[[0, 3], [3, 0], [7, 0], [10, 3], [10, 5], [5, 9], [5, 10]], [[5, 13], [5, 14]]],
  '!': [[[5, 0], [5, 10]], [[5, 13], [5, 14]]],
  '+': [[[5, 3], [5, 11]], [[1, 7], [9, 7]]],
  ' ': [],
};
// one character in a 16 x 20 cell at (x, y)
const letterPolys = (ch, x, y) => {
  const g = FONT[ch];
  if (!g) throw new Error(`no glyph for ${JSON.stringify(ch)}`);
  return shift(g, x + 3, y + 3);
};


// ---------------------------------------------------------------------------
// The title, in cells: an original 6 x 9 block face (W is 8 wide).
// Verticals are two cells thick, horizontals one, because cells are tall.
// ---------------------------------------------------------------------------
const TITLE_FONT = {
  C: ['.#####', '##....', '##....', '##....', '##....', '##....', '##....', '##....', '.#####'],
  A: ['.####.', '##..##', '##..##', '##..##', '######', '##..##', '##..##', '##..##', '##..##'],
  S: ['.#####', '##....', '##....', '##....', '.####.', '....##', '....##', '....##', '#####.'],
  T: ['######', '..##..', '..##..', '..##..', '..##..', '..##..', '..##..', '..##..', '..##..'],
  W: ['##....##', '##....##', '##....##', '##.##.##', '##.##.##', '##.##.##', '##.##.##', '########', '.##..##.'],
  Y: ['##..##', '##..##', '##..##', '##..##', '.####.', '..##..', '..##..', '..##..', '..##..'],
};
const TITLE = 'CASTAWAY';
const TITLE_ROW = 3;
const titleWidth = [...TITLE].reduce((s, ch) => s + TITLE_FONT[ch][0].length, 0) + TITLE.length - 1;
const TITLE_COL = Math.floor((COLS - titleWidth) / 2);
const titleCells = []; // {c, r}
{
  let c0 = TITLE_COL;
  for (const ch of TITLE) {
    const rows = TITLE_FONT[ch];
    rows.forEach((line, r) => [...line].forEach((v, k) => { if (v === '#') titleCells.push({ c: c0 + k, r: TITLE_ROW + r }); }));
    c0 += rows[0].length + 1;
  }
}
const titleSet = new Set(titleCells.map(({ c, r }) => `${c},${r}`));

const TAG_ROW = 14;
const TAG_A = 'SHE IDLES. EVERY SO OFTEN, SOMETHING HAPPENS.';
const TAG_B = 'EVERY GULL, WAVE AND KALIMBA NOTE IS CODE.';
// spaces lock too (as blank tiles), with one blank cell either side
const tagCells = (text) => {
  const t = ` ${text} `;
  const c0 = Math.floor((COLS - t.length) / 2);
  return [...t].map((ch, i) => ({ ch, c: c0 + i, r: TAG_ROW }));
};

// ---------------------------------------------------------------------------
// The island: a mosaic of locked cells. Masses (sun, clouds, palm, sand,
// raft, her, the calm sea) are lit tiles holding the cell's own rain glyph;
// lines (waves and foam on sea tiles, the horizon on the dark) are drawn
// glyphs.
// ---------------------------------------------------------------------------
const HUE = {
  title: { hue: '#ffb238', ink: '#fff7e2', tile: 'pillow', lum: 0.86, edge: 0.6 },
  tag: { hue: '#1a5d58', ink: '#eafff9', tile: 'flat' },
  sun: { hue: '#ffcc3a', ink: '#fff7cf', tile: 'pillow', lum: 0.82 },
  cloud: { hue: '#b9dcef', ink: '#ffffff', tile: 'pillow' },
  frond: { hue: '#4cc95e', ink: '#dcffd4', tile: 'pillow' },
  nut: { hue: '#a8682f', ink: '#ffdcb6', tile: 'pillow' },
  trunk: { hue: '#c4844e', ink: '#ffe4c8', tile: 'pillow' },
  sand: { hue: '#f2c060', ink: '#fff2d2', tile: 'pillow', lum: 0.72 },
  bush: { hue: '#3fae5a', ink: '#ccffcf', tile: 'pillow' },
  raft: { hue: '#b0703a', ink: '#ffdcb5', tile: 'pillow' },
  hair: { hue: '#8a5434', ink: '#fff1d6', tile: 'pillow' },
  top: { hue: '#ff7a5c', ink: '#fff0e6', tile: 'pillow' },
  shorts: { hue: '#e8d6b0', ink: '#fffaf0', tile: 'pillow' },
  horizon: { ink: '#a6ecff', tile: 'none' },
  sea: { hue: '#2489b5', ink: '#6fd3ff', tile: 'flat' },
  foam: { hue: '#2489b5', ink: '#e2fbff', tile: 'flat' },
  // the calm sea between the waves: the cell's own rain glyph, locked dim
  seaf: { hue: '#2489b5', ink: '#236f96', tile: 'flat' },
};
// full-cell line glyphs (16 x 20) for the island
const LINE = {
  horizon: [[[0, 10], [16, 10]]],
  horizonDot: [[[0, 10], [5, 10]], [[11, 10], [16, 10]]],
  sea: [[[1, 12], [4, 9], [8, 12], [12, 9], [15, 12]]],
  seaSmall: [[[4, 12], [8, 9], [12, 12]]],
  foam: [[[0, 8], [4, 6], [8, 8], [12, 6], [16, 8]], [[3, 13], [7, 11], [11, 13]]],
  trunk: [[[6, 0], [6, 20]], [[10, 0], [10, 20]], [[6, 7], [10, 5]], [[6, 15], [10, 13]]],
  trunkL: [[[9, 0], [6, 20]], [[13, 0], [10, 20]], [[7, 9], [11, 7]], [[6, 17], [10, 15]]],
  raft: [[[0, 7], [16, 7]], [[0, 11], [16, 11]], [[0, 15], [16, 15]], [[8, 5], [8, 17]]],
};
const pic = new Map(); // "c,r" -> { hue, glyph } (glyph: 'field' or a LINE / PICTO name)
const paint = (c, r, hue, glyph = 'field') => pic.set(`${c},${r}`, { hue, glyph });
const span = (r, c0, c1, hue, glyph) => { for (let c = c0; c <= c1; c++) paint(c, r, hue, glyph); };
// sun
span(1, 13, 15, 'sun'); span(2, 12, 16, 'sun'); span(3, 13, 15, 'sun');
paint(14, 2, 'sun', 'p:sun');
// clouds
span(2, 22, 26, 'cloud'); span(3, 20, 28, 'cloud');
span(1, 57, 60, 'cloud'); span(2, 55, 62, 'cloud');
// horizon, thinning out at both ends
for (let c = 6; c <= 68; c++) paint(c, 5, 'horizon', c < 10 || c > 64 ? 'horizonDot' : 'horizon');
// the palm: crown round (43, 2), trunk leaning, base on the sand
const PC = 43;
// an umbrella of fronds: two arches that droop at the ends, a tuft on top
for (const dx of [-4, -3, -2, 0, 2, 3, 4]) paint(PC + dx, 0, 'frond');
for (let dx = -6; dx <= 6; dx++) paint(PC + dx, 1, 'frond');
for (const dx of [-7, -6, -5, 5, 6, 7]) paint(PC + dx, 2, 'frond');
for (const dx of [-8, -7, 7, 8]) paint(PC + dx, 3, 'frond');
for (const dx of [-8, 8]) paint(PC + dx, 4, 'frond');
paint(PC - 1, 2, 'nut', 'p:coconut');
paint(PC + 1, 2, 'frond'); // its coconut is a special cell: it is the one that falls
for (const [c, r, g] of [[43, 2, 'trunk'], [43, 3, 'trunkL'], [43, 4, 'trunk'], [42, 5, 'trunkL'], [42, 6, 'trunk'], [42, 7, 'trunkL'], [41, 8, 'trunk'], [41, 9, 'trunk']]) paint(c, r, 'trunk', g);
// her, left of the palm (three glyphs tall: drawn as special cells below)
const HER = { c: 36, r: 6 };
// sand, seen from slightly above
span(9, 33, 47, 'sand'); span(10, 30, 51, 'sand'); span(11, 32, 49, 'sand');
paint(41, 9, 'trunk', 'trunk');
paint(37, 9, 'bush'); paint(38, 9, 'bush'); paint(46, 9, 'bush');
// raft
span(10, 55, 58, 'raft', 'raft');
// foam round the sand
for (const [c, r] of [[29, 10], [52, 10], [31, 11], [50, 11], [32, 12], [34, 12], [37, 12], [40, 12], [43, 12], [46, 12], [49, 12], [54, 11], [59, 11]]) paint(c, r, 'foam', 'foam');
// the coconut's way down (kept clear of waves) and the crab's walk
const NUT_COL = 44, CRAB = { c: 44, r: 10 }, CRAB_END = 49;
// sea: sparse waves under the horizon, thinning towards the edges
for (let r = 6; r <= 12; r++) {
  for (let c = 7; c <= 67; c++) {
    const k = `${c},${r}`;
    if (pic.has(k) || (c === HER.c && r >= HER.r && r <= HER.r + 2) || c === NUT_COL) continue;
    const edge = Math.min(c - 7, 67 - c) / 12;
    const p = (r === 6 ? 0.09 : 0.15) * Math.min(1, edge + 0.3);
    const near = [-1, 1].some((d) => pic.get(`${c + d},${r}`)?.hue === 'sea');
    if (!near && R() < p) paint(c, r, 'sea', R() < 0.5 ? 'sea' : 'seaSmall');
  }
}
// ...and the rest of the sea locks too, as a calm blue band with a ragged
// edge, so the island reads at a glance. Its own PRNG leaves the field as is.
{
  const RS = rng(1406);
  for (let r = 6; r <= 12; r++) {
    const c0 = 6 + Math.floor(RS() * 3), c1 = 68 - Math.floor(RS() * 3);
    for (let c = c0; c <= c1; c++) {
      if (pic.has(`${c},${r}`) || (c === HER.c && r >= HER.r && r <= HER.r + 2)) continue;
      paint(c, r, 'seaf');
    }
  }
}

// ---------------------------------------------------------------------------
// Columns: speed, trail pattern and phase. A column's light is a repeating
// unit of U cells holding one or two windows (a tail ending in a head cell),
// shifted down one cell per step, U steps per period P. Layouts come from a
// small pool so the gradients can be shared.
// ---------------------------------------------------------------------------
function makeWindows(U, mid) {
  for (let attempt = 0; attempt < 500; attempt++) {
    const n = mid ? (U >= 24 && R() < 0.6 ? 2 : 1) : (U >= 36 && R() < 0.5 ? 2 : 1);
    const Ls = Array.from({ length: n }, () => (mid ? ri(4, 11) : ri(6, 16)));
    const free = U - Ls.reduce((a, b) => a + b, 0);
    if (free < n * 4) continue;
    const shares = Array.from({ length: n }, () => 0.4 + R());
    const tot = shares.reduce((a, b) => a + b, 0);
    const gaps = shares.map((s) => 4 + Math.floor(((free - 4 * n) * s) / tot));
    gaps[0] += free - gaps.reduce((a, b) => a + b, 0);
    const wins = [];
    let pos = 0;
    for (let i = 0; i < n; i++) {
      pos += gaps[i];
      wins.push({ s: pos, L: Ls[i], h: pos + Ls[i] - 1 });
      pos += Ls[i];
    }
    return wins;
  }
  throw new Error('no window layout');
}
const OUTER_COMBOS = [[30, 7.5], [36, 10], [40, 10], [45, 12], [48, 12], [60, 15]];
const MID_U = [21, 24, 27, 30];
const POOL = [];
for (const U of MID_U) for (let i = 0; i < 3; i++) POOL.push({ U, mid: true, wins: makeWindows(U, true) });
for (const [U] of OUTER_COMBOS) POOL.push({ U, mid: false, wins: makeWindows(U, false) });
POOL.forEach((t, i) => { t.id = 'g' + i.toString(36); });
const colPlan = [];
for (let c = 0; c < COLS; c++) {
  const mid = c >= MID0 && c <= MID1;
  let U, P;
  if (mid) { U = pick(MID_U); P = MIDP; } else { [U, P] = pick(OUTER_COMBOS); }
  const tpl = pick(POOL.filter((t) => t.U === U && t.mid === mid));
  colPlan.push({ c, mid, U, P, tau: P / U, wins: tpl.wins, tpl, k0: ri(0, U - 1) });
}

// times in [0, LOOP) when a head steps into (c, r), oldest first
function arrivals(c, r) {
  const { U, P, tau, wins, k0 } = colPlan[c];
  const out = [];
  for (const w of wins) {
    const n0 = mod(r - w.h - k0, U);
    for (let j = 0; j < LOOP / P; j++) out.push(mod((n0 + j * U - 0.5) * tau, LOOP));
  }
  return out.sort((a, b) => a - b);
}
const firstAfter = (c, r, t) => {
  if (!colPlan[c].mid) throw new Error(`locked cell outside the middle columns: ${c},${r}`);
  const a = arrivals(c, r).find((x) => x >= t - 1e-9);
  if (a === undefined) throw new Error(`no head after ${t}s at ${c},${r}`);
  return a;
};
const titleOff = (c, r) => {
  const a = firstAfter(c, r, T_TITLE_OFF);
  if (a + T_TITLE_HOLD >= LOOP) throw new Error('title would not be back in time');
  return a;
};
const isleOn = (c, r) => firstAfter(c, r, T_ISLE_ON);

// ---------------------------------------------------------------------------
// The field: one glyph per cell. Under the island the rain already carries
// island things (shells and starfish in the sand, palms in the crown).
// ---------------------------------------------------------------------------
const BEACH = [PICTO.shell, PICTO.starfish, PICTO.castle, PICTO.crab, PICTO.hook, PICTO.kumara, PICTO.bottle];
const field = [];
for (let r = 0; r < ROWS; r++) {
  field.push([]);
  for (let c = 0; c < COLS; c++) {
    const k = `${c},${r}`;
    const hue = pic.get(k)?.hue;
    let g;
    do {
      if (titleSet.has(k)) g = pick(DENSE);
      else if (hue === 'sand') g = R() < 0.5 ? pick(BEACH) : pick(CODE);
      else if (hue === 'frond' || hue === 'bush') g = R() < 0.4 ? PICTO.palm : pick(CODE);
      else if (hue === 'sun') g = R() < 0.3 ? PICTO.sun : pick(CODE);
      else g = randomGlyph();
    } while (r > 0 && field[r - 1][c] === g);
    field[r].push(g);
  }
}
// how much of the field is island pictograms, for the key's subtitle (kept
// honest: the words come from the count, and an odd share stops the build)
const PICTO_SHARE = (() => {
  const set = new Set(PICTO_LIST);
  let n = 0;
  for (const row of field) for (const g of row) if (set.has(g)) n++;
  return n / (ROWS * COLS);
})();
const PICTO_SHARE_WORD = [['THREE', 1 / 3], ['FOUR', 1 / 4], ['FIVE', 1 / 5], ['SIX', 1 / 6]]
  .find(([, k]) => Math.abs(PICTO_SHARE - k) < 0.02)?.[0];
if (!PICTO_SHARE_WORD) throw new Error(`picto share ${PICTO_SHARE.toFixed(3)} has no plain word`);
const fieldPolys = [];
for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) fieldPolys.push(...shift(field[r][c], c * CW + 2, r * CH + 2));

// ---------------------------------------------------------------------------
// Her, as three full cells (16 x 20 each): hair and headphones, the coral
// tank top, cream shorts and bare feet. Small, simple, fully clothed.
// ---------------------------------------------------------------------------
const art = (stroke, polys) => `<path fill="none" stroke="${stroke}" d="${pathD(polys)}"/>`;
const SKIN = '#f6caa4';
const HER_HEAD = (dy) => [
  art(HUE.hair.ink, shift([[[11, 6], [13, 3], [15, 5], [13, 8]]], 0, dy)), // the low bun
  art('#fff1d6', shift([[[3, 13], [3, 9], [5, 5], [8, 4], [11, 5], [13, 9], [13, 13]], [[1, 11], [4, 11], [4, 17], [1, 17], [1, 11]], [[12, 11], [15, 11], [15, 17], [12, 17], [12, 11]]], 0, dy)),
  art(SKIN, shift([[[6, 14], [7, 17], [9, 17], [10, 14]]], 0, dy)),
].join('');
const HER_TOP = art(HUE.top.ink, [[[5, 1], [5, 4], [4, 6], [4, 19], [12, 19], [12, 6], [11, 4], [11, 1]], [[5, 1], [11, 1]]]) + art(SKIN, [[[3, 4], [2, 13]], [[13, 4], [14, 13]]]);
const HER_LEGS = art('#fffaf0', [[[4, 0], [12, 0], [13, 7], [9, 7], [8, 4], [7, 7], [3, 7], [4, 0]]]) + art(SKIN, [[[5, 7], [5, 18], [3, 19]], [[11, 7], [11, 18], [13, 19]]]);

// ---------------------------------------------------------------------------
// Assemble the banner
// ---------------------------------------------------------------------------
function buildBanner() {
  const css = [];
  const defs = [];

  // --- registries: glyph symbols and delay classes ---
  const sym = new Map(); // key -> id
  const symbol = (key, polys) => {
    if (!sym.has(key)) {
      const id = 'y' + sym.size.toString(36);
      sym.set(key, id);
      defs.push(`<g id="${id}"><rect width="${CW}" height="${CH}" stroke="none"/><path fill="none" d="${pathD(polys)}"/></g>`);
    }
    return sym.get(key);
  };
  const glyphSym = (g) => symbol('f' + allGlyphs.indexOf(g), shift(g, 2, 2));
  const delays = new Map();
  const dcls = (s) => {
    if (!delays.has(s)) delays.set(s, 'd' + delays.size.toString(36));
    return delays.get(s);
  };

  // --- the light: shared gradient templates ---
  const stops = (U, wins) => {
    const o = (cell) => f3(cell / U);
    const st = [`<stop offset="0" class="k"/>`];
    for (const w of wins) {
      st.push(`<stop offset="${o(w.s)}" class="k"/>`);
      st.push(`<stop offset="${o(w.s + Math.max(1, w.L * 0.3))}" class="a"/>`);
      st.push(`<stop offset="${o(w.s + w.L * 0.68)}" class="b"/>`);
      st.push(`<stop offset="${o(w.h)}" class="c"/>`);
      st.push(`<stop offset="${o(w.h)}" class="e"/>`);
      st.push(`<stop offset="${o(w.h + 1)}" class="e"/>`);
      st.push(`<stop offset="${o(w.h + 1)}" class="k"/>`);
    }
    return st.join('');
  };
  for (const t of POOL) {
    if (!colPlan.some((p) => p.tpl === t)) continue;
    defs.push(`<linearGradient id="${t.id}" gradientUnits="userSpaceOnUse" x2="0" y2="${t.U * CH}" spreadMethod="repeat">${stops(t.U, t.wins)}</linearGradient>`);
  }
  css.push(`.k{stop-color:#000}.a{stop-color:${RAMP.tail}}.b{stop-color:${RAMP.body}}.c{stop-color:${RAMP.bright}}.e{stop-color:${RAMP.head}}`);

  // --- overlays (one per column) ---
  for (const U of new Set(colPlan.map((p) => p.U))) css.push(`@keyframes u${U}{from{transform:translateY(${-U * CH}px)}to{transform:translateY(0)}}`);
  const overlays = colPlan.map((p) => {
    css.push(`.c${p.c}{animation:u${p.U} ${f3(p.P)}s steps(${p.U}) ${f3(-((p.k0 + 0.5) * p.tau + AT))}s infinite}`);
    return `<rect class="c${p.c}" x="${p.c * CW}" width="${CW}" height="${(ROWS + p.U) * CH}" fill="url(#${p.tpl.id})" transform="translate(0 ${(-p.U + p.k0) * CH})"/>`;
  });

  // --- glints: a head passing behind a locked title cell lights its glyph.
  // White copies of the title glyphs on black, lit by head-only copies of the
  // column lights (multiply), then laid over everything with screen, so only
  // the head's glyph shows. Off while the letters are washed away.
  const glintStops = (U, wins) => {
    const o = (cell) => f3(cell / U);
    const st = [`<stop offset="0" class="k"/>`];
    for (const w of wins) {
      st.push(`<stop offset="${o(w.h - 1)}" class="k"/><stop offset="${o(w.h)}" class="m"/><stop offset="${o(w.h)}" class="e"/>`);
      st.push(`<stop offset="${o(w.h + 1)}" class="e"/><stop offset="${o(w.h + 1)}" class="k"/>`);
    }
    return st.join('');
  };
  const titleCols = [...new Set(titleCells.map((x) => x.c))];
  for (const t of new Set(titleCols.map((c) => colPlan[c].tpl))) {
    defs.push(`<linearGradient id="${t.id}h" gradientUnits="userSpaceOnUse" x2="0" y2="${t.U * CH}" spreadMethod="repeat">${glintStops(t.U, t.wins)}</linearGradient>`);
  }
  const glintRects = titleCols.map((c) => {
    const p = colPlan[c];
    return `<rect class="c${c}" x="${c * CW}" width="${CW}" height="${(ROWS + p.U) * CH}" fill="url(#${p.tpl.id}h)" transform="translate(0 ${(-p.U + p.k0) * CH})"/>`;
  });
  // the title cells as horizontal runs: the clip, and a warm wash under the glyphs
  const runs = [];
  for (const { c, r } of [...titleCells].sort((a, b) => a.r - b.r || a.c - b.c)) {
    const last = runs.at(-1);
    if (last && last.r === r && last.c1 === c - 1) last.c1 = c; else runs.push({ r, c0: c, c1: c });
  }
  defs.push(`<path id="TB" d="${runs.map(({ r, c0, c1 }) => `M${c0 * CW},${r * CH}h${(c1 - c0 + 1) * CW}v${CH}h${-(c1 - c0 + 1) * CW}z`).join('')}"/>`);
  defs.push(`<clipPath id="tc"><use href="#TB"/></clipPath>`);
  css.push(`.m{stop-color:#6b5434}.tg{fill:none;stroke:#fff;stroke-width:1.8;stroke-linecap:square}`);
  css.push(`@keyframes gl{0%{opacity:1}${pct(T_TITLE_OFF)}{opacity:0}${pct(T_TITLE_OFF + T_TITLE_HOLD + 6)}{opacity:1}}.gl{mix-blend-mode:screen;animation:gl 60s steps(1,end) ${f3(-AT)}s infinite}`);
  const glint = `<g class="gl" clip-path="url(#tc)"><g style="isolation:isolate"><rect y="${TITLE_ROW * CH}" width="${W}" height="${9 * CH}" fill="#000"/><use href="#TB" fill="#4a361a"/><use href="#F" class="tg"/><g style="mix-blend-mode:multiply">${glintRects.join('')}</g></g></g>`;

  // --- glyph swaps: a second glyph that cuts in now and then ---
  const SWAPS = [['wa', 6, 0.4], ['wb', 10, 0.3], ['wc', 12, 0.5], ['wd', 20, 0.25], ['we', 15, 0.35], ['wf', 5, 0.6]];
  for (const [cls, dur, duty] of SWAPS) {
    css.push(`@keyframes ${cls}{0%{opacity:1}${f3(duty * 100)}%{opacity:0}}.${cls}{animation:${cls} ${dur}s steps(1,end) infinite}`);
  }
  const lockedKeys = new Set([...titleSet, ...pic.keys(), ...tagCells(TAG_A).map((x) => `${x.c},${x.r}`), ...tagCells(TAG_B).map((x) => `${x.c},${x.r}`)]);
  const swaps = [];
  const swapKeys = new Set();
  let guard = 0;
  while (swaps.length < 64 && guard++ < 5000) {
    const c = ri(0, COLS - 1), r = ri(0, ROWS - 1);
    const k = `${c},${r}`;
    if (lockedKeys.has(k) || swapKeys.has(k)) continue;
    swapKeys.add(k);
    let g;
    do g = randomGlyph(); while (g === field[r][c]);
    const [cls, dur] = pick(SWAPS);
    const at = ri(0, dur * 2) / 2;
    swaps.push(`<use href="#${glyphSym(g)}" class="w ${cls} ${dcls(delayFor(at, dur))}" x="${c * CW}" y="${r * CH}"/>`);
  }

  // --- locked layers ---
  css.push(`@keyframes kt{0%{opacity:0}${pct(T_TITLE_HOLD)}{opacity:1}}@keyframes ki{0%{opacity:1}${pct(T_ISLE_HOLD)}{opacity:0}}`);
  css.push(`.t{animation:kt 60s steps(1,end) infinite}.i{animation:ki 60s steps(1,end) infinite;opacity:0}`);
  const usedHues = new Set(['title', 'tag']);
  // each cell is a <use>; its hue (tile fill and ink) is inherited from a
  // group per hue, which keeps the file small
  const cell = (layer, hue, id, at, c, r) => { usedHues.add(hue); return { hue, s: `<use href="#${id}" class="${layer} ${dcls(delayFor(at))}" x="${c * CW}" y="${r * CH}"/>` }; };
  const byHue = (cells) => {
    const groups = new Map();
    for (const { hue, s } of cells) { if (!groups.has(hue)) groups.set(hue, []); groups.get(hue).push(s); }
    return [...groups].map(([hue, list]) => `<g class="h-${hue}">${list.join('')}</g>`).join('');
  };
  const titleU = titleCells.map(({ c, r }) => cell('t', 'title', glyphSym(field[r][c]), titleOff(c, r), c, r));
  const letterSym = (ch) => symbol('L' + ch, letterPolys(ch, 0, 0));
  const tagAU = tagCells(TAG_A).map(({ ch, c, r }) => cell('t', 'tag', letterSym(ch), titleOff(c, r), c, r));
  const tagBU = tagCells(TAG_B).map(({ ch, c, r }) => cell('i', 'tag', letterSym(ch), isleOn(c, r), c, r));
  const isleU = [...pic.entries()].map(([k, { hue, glyph }]) => {
    const [c, r] = k.split(',').map(Number);
    let id;
    if (glyph === 'field') id = glyphSym(field[r][c]);
    else if (glyph.startsWith('p:')) id = symbol('P' + glyph, shift(PICTO[glyph.slice(2)], 2, 2));
    else id = symbol('N' + glyph, LINE[glyph]);
    return cell('i', hue, id, isleOn(c, r), c, r);
  });

  // --- her, the crab and the coconut: special cells with their own art ---
  const special = [];
  const tileOf = (hue) => `<rect width="${CW}" height="${CH}" fill="url(#r-${hue})"/>`;
  defs.push(`<g id="zh1">${tileOf('hair')}${HER_HEAD(0)}</g><g id="zh2">${tileOf('hair')}${HER_HEAD(2)}</g>`);
  defs.push(`<g id="zt">${tileOf('top')}${HER_TOP}</g>`);
  defs.push(`<g id="zl">${tileOf('shorts')}${HER_LEGS}</g>`);
  const CRABC = '#ff7a52';
  defs.push(`<g id="zc">${tileOf('sand')}${art(CRABC, [[[4, 12], [12, 12], [14, 15], [12, 18], [4, 18], [2, 15], [4, 12]], [[3, 13], [1, 9], [3, 6]], [[1, 9], [4, 9]], [[13, 13], [15, 9], [13, 6]], [[15, 9], [12, 9]], [[6, 12], [6, 10]], [[10, 12], [10, 10]]])}</g>`);
  // the crab in its new hat: a filled brown coconut dome (three eyes, as
  // coconuts have) over an orange crab, claws out either side, legs stepping
  const hatNut = (dy) =>
    `<path fill="#6a3d1e" stroke="#ffdcb6" d="${pathD(shift([[[3, 12], [3, 8], [6, 4], [10, 4], [13, 8], [13, 12], [3, 12]]], 0, dy))}"/>` +
    art('#ffdcb6', shift([[[6, 7], [6.6, 7]], [[9.4, 7], [10, 7]], [[8, 9.4], [8, 10]]], 0, dy));
  const crabUnder = (legs) => art(CRABC, [[[3, 13], [13, 13]], [[3, 13], [1, 12]], [[1, 12], [0, 9]], [[1, 12], [2.5, 9.5]], [[13, 13], [15, 12]], [[15, 12], [16, 9]], [[15, 12], [13.5, 9.5]], ...legs]);
  defs.push(`<g id="zw1">${tileOf('sand')}${crabUnder([[[4, 13], [2, 17]], [[6, 13], [5, 18]], [[10, 13], [11, 18]], [[12, 13], [14, 17]]])}${hatNut(0)}</g>`);
  defs.push(`<g id="zw2">${tileOf('sand')}${crabUnder([[[4, 13], [3, 18]], [[6, 13], [6.5, 17]], [[10, 13], [9.5, 17]], [[12, 13], [13, 18]]])}${hatNut(1)}</g>`);
  defs.push(`<g id="zn">${tileOf('nut')}${art('#ffdcb6', [[[5, 4], [11, 4], [14, 8], [14, 13], [11, 17], [5, 17], [2, 13], [2, 8], [5, 4]], [[6, 8], [7, 8]], [[9, 8], [10, 8]], [[7, 12], [9, 12]]])}</g>`);
  ['hair', 'top', 'shorts', 'sand', 'nut'].forEach((h) => usedHues.add(h));

  // her: three cells on the island timing; the head nods on every beat
  css.push(`@keyframes nd{0%{opacity:1}50%{opacity:0}}.n1{animation:nd 1.5s steps(1,end) ${f3(-AT)}s infinite}.n2{opacity:0;animation:nd 1.5s steps(1,end) ${f3(-AT - BEAT)}s infinite}`);
  const herAt = (r) => isleOn(HER.c, r);
  special.push(`<g class="i ${dcls(delayFor(herAt(HER.r)))}"><use href="#zh1" class="n1" x="${HER.c * CW}" y="${HER.r * CH}"/><use href="#zh2" class="n2" x="${HER.c * CW}" y="${HER.r * CH}"/></g>`);
  special.push(`<use href="#zt" class="i ${dcls(delayFor(herAt(HER.r + 1)))}" x="${HER.c * CW}" y="${(HER.r + 1) * CH}"/>`);
  special.push(`<use href="#zl" class="i ${dcls(delayFor(herAt(HER.r + 2)))}" x="${HER.c * CW}" y="${(HER.r + 2) * CH}"/>`);

  // one-off windows of visibility for the gag, on the minute's clock
  let gagN = 0;
  const once = (id, t0, t1, c, r) => {
    const cls = 'o' + (gagN++).toString(36);
    const kf = t0 <= 0 ? `0%{opacity:1}${pct(t1)}{opacity:0}` : `0%{opacity:0}${pct(t0)}{opacity:1}${pct(t1)}{opacity:0}`;
    css.push(`@keyframes ${cls}{${kf}}.${cls}{opacity:0;animation:${cls} 60s steps(1,end) ${f3(-AT)}s infinite}`);
    return `<use href="#${id}" class="${cls}" x="${c * CW}" y="${r * CH}"/>`;
  };
  // the crab waits on the sand; on the bar line at 30 s a coconut lands on it
  const T_HIT = 30;
  special.push(once('zc', isleOn(CRAB.c, CRAB.r), T_HIT, CRAB.c, CRAB.r));
  special.push(once('zn', isleOn(NUT_COL, 2), T_HIT - 1.75, NUT_COL, 2));
  for (let r = 3; r <= 9; r++) {
    const t0 = T_HIT - (10 - r) * 0.25;
    special.push(once('zn', t0, t0 + 0.25, NUT_COL, r));
  }
  for (let i = 0; CRAB.c + i <= CRAB_END; i++) {
    const t0 = T_HIT + i * BEAT;
    const last = CRAB.c + i === CRAB_END;
    const t1 = last ? isleOn(CRAB_END, CRAB.r) + T_ISLE_HOLD : t0 + BEAT;
    special.push(once(i % 2 ? 'zw2' : 'zw1', t0, t1, CRAB.c + i, CRAB.r));
  }

  // --- tiles and inks ---
  for (const h of usedHues) {
    const { hue, ink, tile, lum = 0.62, edge = 0.4 } = HUE[h];
    let fill = BG;
    if (tile === 'pillow') {
      defs.push(`<radialGradient id="r-${h}" r=".72"><stop offset="0" stop-color="${mix(BG, hue, lum)}"/><stop offset="1" stop-color="${mix(BG, hue, lum * edge)}"/></radialGradient>`);
      fill = `url(#r-${h})`;
    } else if (tile === 'flat') fill = mix(BG, hue, 0.45);
    css.push(`.h-${h}{fill:${fill};stroke:${ink}}`);
  }

  defs.push(`<path id="F" d="${pathD(fieldPolys)}"/>`);
  defs.push(`<clipPath id="cp"><rect width="${W}" height="${H}" rx="14"/></clipPath>`);
  defs.push(`<radialGradient id="pl" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="${BG}" stop-opacity=".52"/><stop offset=".7" stop-color="${BG}" stop-opacity=".34"/><stop offset="1" stop-color="${BG}" stop-opacity="0"/></radialGradient>`);
  defs.push(`<linearGradient id="ev" x2="0" y2="1"><stop offset="0" stop-color="${BG}"/><stop offset=".1" stop-color="${BG}" stop-opacity="0"/><stop offset=".88" stop-color="${BG}" stop-opacity="0"/><stop offset="1" stop-color="${BG}"/></linearGradient>`);

  css.unshift(
    `.fc{fill:none;stroke:#fff;stroke-width:1.6;stroke-linecap:square}`,
    `.fh{fill:none;stroke:#fff;stroke-width:5;stroke-linecap:round;stroke-linejoin:round;opacity:.16}`,
    `.w{opacity:0;fill:#000;stroke:#fff;stroke-width:1.6;stroke-linecap:square}`,
    `.t,.i{stroke-width:1.8;stroke-linecap:square}`,
    `.h-horizon use,.h-sea use,.h-foam use{stroke-linecap:round;stroke-linejoin:round}`,
    `.z path{stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}`,
  );
  for (const [s, cls] of delays) css.push(`.${cls}{animation-delay:${s}}`);
  css.push(`@media (prefers-reduced-motion:reduce){*{animation:none!important}.gl{display:none}}`);

  const alt = 'CASTAWAY, written in digital rain: fixed columns of glyphs on a dark lagoon panel, lit by falling white heads with aqua tails, stop on bright amber glyphs that spell the name, over the line SHE IDLES. EVERY SO OFTEN, SOMETHING HAPPENS. Then the rain washes the letters away and writes an island in coloured glyphs: sun, clouds, horizon, a band of blue sea, one tall palm, sand, a raft and her, three glyphs tall, in cream headphones, a coral tank top and cream shorts, nodding. A coconut drops on a hermit crab, which walks off wearing it, over the line EVERY GULL, WAVE AND KALIMBA NOTE IS CODE. Then the rain writes CASTAWAY back.';
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${alt}">`,
    `<title>${alt}</title>`,
    `<style>${css.join('')}</style>`,
    `<defs>${defs.join('')}</defs>`,
    `<g clip-path="url(#cp)">`,
    `<g style="isolation:isolate">`,
    `<rect width="${W}" height="${H}" fill="#000"/>`,
    `<use href="#F" class="fh"/><use href="#F" class="fc"/>`,
    swaps.join(''),
    `<g style="mix-blend-mode:multiply">${overlays.join('')}</g>`,
    `</g>`,
    `<rect width="${W}" height="${H}" fill="${BG}" style="mix-blend-mode:lighten"/>`,
    `<rect x="${4 * CW}" width="${(COLS - 8) * CW}" height="${H}" fill="url(#pl)"/>`,
    `<rect width="${W}" height="${H}" fill="url(#ev)"/>`,
    byHue(titleU),
    glint,
    byHue(tagAU),
    byHue(isleU),
    byHue(tagBU),
    `<g class="z">${special.join('')}</g>`,
    `</g>`,
    `<rect x=".75" y=".75" width="${W - 1.5}" height="${H - 1.5}" rx="13.5" fill="none" stroke="#1b4a47" stroke-width="1.5"/>`,
    `</svg>`,
  ].join('\n');
}

// ---------------------------------------------------------------------------
// The glyph key: 24 of the island glyphs, enlarged and labelled, each lit
// now and then by a passing head
// ---------------------------------------------------------------------------
const ADV = 13; // letter advance in the 10 x 14 stroke face, before scaling
const textPolys = (str, x, y, s) => {
  const out = [];
  [...str].forEach((ch, i) => {
    const g = FONT[ch];
    if (!g) throw new Error(`no glyph for ${JSON.stringify(ch)}`);
    out.push(...g.map((pl) => pl.map(([gx, gy]) => [x + (i * ADV + gx) * s, y + gy * s])));
  });
  return out;
};
const textW = (str, s) => (str.length * ADV - 3) * s;

const KEY = [
  ['palm', 'PALM', 'ONE. TALL.'],
  ['coconut', 'COCONUT', 'DROPS ON CRABS'],
  ['crab', 'HERMIT CRAB', 'WALKS OFF IN A HAT'],
  ['shell', 'SHELL', "A CRAB'S OLD HOUSE"],
  ['wave', 'WAVE', 'ALWAYS ON THE SHORE'],
  ['bottle', 'BOTTLE', 'WASHES STRAIGHT BACK'],
  ['turtle', 'SEA TURTLE', 'DROPS BY'],
  ['fin', 'SHARK FIN', 'NODS TO THE BEAT'],
  ['note', 'NOTE', '80 BPM, F MAJOR'],
  ['headphones', 'HEADPHONES', 'ALSO THE PARCEL'],
  ['drone', 'DRONE', 'DELIVERS HEADPHONES'],
  ['signal', 'SIGNAL', 'ONE BAR, TOP OF PALM'],
  ['sun', 'SUN', 'ALWAYS DAYTIME'],
  ['coffee', 'ICED COFFEE', 'FROM OVER THE WATER'],
  ['cat', 'CAT', 'ARRIVES ON A CRATE'],
  ['fish', 'FISH', 'NOW AND THEN'],
  ['hook', 'HOOK', 'PATIENCE'],
  ['flame', 'FIRE', 'BY FRICTION'],
  ['hammock', 'HAMMOCK', 'PALM TO RAFT'],
  ['raft', 'RAFT', 'HALF A HAMMOCK'],
  ['kumara', 'KUMARA', 'GROWS ALL VIDEO'],
  ['castle', 'SANDCASTLE', 'THE TIDE TAKES IT'],
  ['starfish', 'STARFISH', 'JUST A STARFISH'],
  ['her', 'HER', 'THREE GLYPHS TALL'],
];

function buildKey() {
  const KW = 1200, COLW = 280, ROWH = 80, X0 = 40, Y0 = 104, KH = Y0 + 6 * ROWH + 12;
  const css = [], body = [];
  const kr = rng(85);
  css.push(`.kt{fill:#062624;stroke:#11504b;stroke-width:1}.kg{fill:none;stroke:${RAMP.body};stroke-width:2.4;stroke-linecap:square}`);
  css.push(`.kh{fill:none;stroke:#fff;stroke-width:2.4;stroke-linecap:square;opacity:0;animation:kh 12s steps(1,end) infinite}`);
  css.push(`@keyframes kh{0%{opacity:1}4%{opacity:.55}8%{opacity:0}}`);
  css.push(`.kn{fill:none;stroke:#fff3d0;stroke-width:1.7;stroke-linecap:square}.km{fill:none;stroke:#5fc3b3;stroke-width:1.5;stroke-linecap:square}`);
  css.push(`.ka{fill:none;stroke:#ffcf7a;stroke-width:2.6;stroke-linecap:square}.kb{fill:none;stroke:#7fd9c9;stroke-width:1.5;stroke-linecap:square}`);
  // heading
  body.push(`<path class="ka" d="${pathD(textPolys('READING THE RAIN', X0, 30, 1.6))}"/>`);
  // the share is measured on the banner's field below (picto cells / all cells)
  body.push(`<path class="kb" d="${pathD(textPolys(`ABOUT ONE GLYPH IN ${PICTO_SHARE_WORD} IS SOMETHING FROM THE ISLAND.`, X0, 68, 0.8))}"/>`);
  // a short column of rain at the top right: tail to head
  const ramp = ['#0b4743', '#13806f', RAMP.body, RAMP.bright, '#ffffff'];
  const rampGlyphs = [CODE[3], DIGITS[5], PICTO.palm, CODE[22], PICTO.coconut];
  const rx = KW - 62;
  ramp.forEach((col, i) => {
    body.push(`<path fill="none" stroke="${col}" stroke-width="1.6" stroke-linecap="square" d="${pathD(shift(rampGlyphs[i], rx, 12 + i * 17))}"/>`);
  });
  body.push(`<path class="km" d="${pathD(textPolys('TAIL', rx - 46, 13, 0.75))}"/>`);
  body.push(`<path class="km" d="${pathD(textPolys('HEAD', rx - 46, 13 + 4 * 17, 0.75))}"/>`);
  KEY.forEach(([name, label, note], i) => {
    const col = i % 4, row = Math.floor(i / 4);
    const x = X0 + col * COLW, y = Y0 + row * ROWH;
    body.push(`<rect class="kt" x="${x}" y="${y}" width="52" height="66" rx="4"/>`);
    if (name === 'her') {
      const tiles = [['hair', HER_HEAD(0)], ['top', HER_TOP], ['shorts', HER_LEGS]];
      body.push(`<g transform="translate(${x + 26 - 8 * 1.1} ${y}) scale(1.1)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${tiles.map(([h, a], k) => `<g transform="translate(0 ${k * 20})"><rect width="16" height="20" fill="${mix(BG, HUE[h].hue, 0.55)}"/>${a}</g>`).join('')}</g>`);
    } else {
      const d = pathD(scale(PICTO[name], 3).map((pl) => pl.map(([px, py]) => [px + x + 8, py + y + 9])));
      const delay = f3(-(kr() * 12));
      body.push(`<path class="kg" d="${d}"/><path class="kh" style="animation-delay:${delay}s" d="${d}"/>`);
    }
    body.push(`<path class="kn" d="${pathD(textPolys(label, x + 68, y + 12, 1))}"/>`);
    body.push(`<path class="km" d="${pathD(textPolys(note, x + 68, y + 40, 0.75))}"/>`);
    if (textW(note, 0.75) > COLW - 80) throw new Error(`note too long: ${note}`);
  });
  css.push(`@media (prefers-reduced-motion:reduce){*{animation:none!important}}`);
  const alt = 'Reading the rain: 24 of the glyphs, enlarged and labelled with what they are on the island';
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${KW} ${KH}" width="${KW}" height="${KH}" role="img" aria-label="${alt}">`,
    `<title>${alt}</title>`,
    `<style>${css.join('')}</style>`,
    `<rect x=".75" y=".75" width="${KW - 1.5}" height="${KH - 1.5}" rx="13.5" fill="${BG}" stroke="#1b4a47" stroke-width="1.5"/>`,
    body.join(''),
    `</svg>`,
  ].join('\n');
}

const banner = buildBanner();
const outPath = OUT || path.join(ASSETS, `${SLUG}.svg`);
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, banner);
console.log(`${path.basename(outPath)}: ${(banner.length / 1024).toFixed(1)} KB`);
if (!OUT) {
  const key = buildKey();
  const keyPath = path.join(ASSETS, `${SLUG}-key.svg`);
  fs.writeFileSync(keyPath, key);
  console.log(`${path.basename(keyPath)}: ${(key.length / 1024).toFixed(1)} KB`);
}
