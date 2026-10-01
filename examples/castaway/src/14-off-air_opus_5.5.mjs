#!/usr/bin/env node
// CASTAWAY README header: "Off-Air Idle" (14-off-air_opus_5.5).
// Plain Node, no dependencies, fully deterministic (seeded PRNG, no clock reads).
//   node examples/castaway/src/14-off-air_opus_5.5.mjs
// writes examples/castaway/assets/14-off-air_opus_5.5.svg       (the banner)
//    and examples/castaway/assets/14-off-air_opus_5.5-bars.svg  (a colour-bar divider)
//
// THE STYLE is what a television shows when there is nothing to show: SMPTE-style
// colour bars with castellations and a PLUGE band, a circle-and-grid test card,
// analogue snow, and the small "no signal" box that hops about to spare the tube.
// Nothing here is traced from a real card: the circle card is a generic design of
// my own (grid, castellated border, corner circles, a picture in the middle), the
// bar layout follows the public-domain SMPTE arrangement with approximate colours,
// and the station, Sandbar TV, is invented. No real broadcaster's picture or ident.
//
// THE JOKE is the project's own. Castaway is a ten-hour video in which almost
// nothing happens, on purpose, which is also a fair description of a test card.
// So the test card's picture is the island (it is always daytime there), and on it
// the signal hunt plays out: no signal, she climbs the palm, one bar at the top,
// and a ship sails past behind her while she is busy. She misses it.
//
// ONE 33-SECOND LOOP = ELEVEN BARS of the theme (80 BPM, a bar every 3 s). Every
// cut, hop and caption change lands on a bar line; her climb lands on the beat.
//   0-15 s  the test card: CASTAWAY in the black ident band, a running clock,
//           five captions, the signal hunt and the passing ship
//  15-24 s  colour bars: an ident box hops once a bar and counts the bars
//  24-25 s  snow (six jumps of a soft static noise field; the mean stays grey)
//  25-33 s  NO SIGNAL: the box hops on black until it finds one bar
// The clock is not tied to the loop: it is five digit strips on their own periods
// (10 s, 1 min, 10 min, 1 h, 10 h), so it shows real time since the page opened
// and rolls over at 10:00:00, exactly when the video would.
//
// LETTERING, no <text> anywhere:
//   * "Card Grotesk": a monoline vector caps face drawn here (paths on a 10-unit
//     cap height, stroked), for the station ident, the clock and the corner circles.
//   * "OSD 5x7": a coarse monospace bitmap face for captions and the no-signal box,
//     with a bold cut made by smearing every pixel one to the right.
// Each glyph is defined once in <defs> and placed with <use>.
//
// prefers-reduced-motion stops everything on the test card with her at the top of
// the palm holding up one bar of signal: a complete, readable frame.

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(here, '../assets/14-off-air_opus_5.5.svg');
const OUT_BARS = resolve(here, '../assets/14-off-air_opus_5.5-bars.svg');

const W = 960;
const H = 540;
const LOOP = 33; // seconds: eleven bars of 3 s
const n2 = (v) => +(+v).toFixed(2);

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(1992);

// ------------------------------------------------------------------ palette
// 75 percent bars and the bottom band (RGB approximations, not from the standard)
const BAR = ['#c0c0c0', '#c0c000', '#00c0c0', '#00c000', '#c000c0', '#c00000', '#0000c0'];
const C = {
  black: '#000000',
  nearBlack: '#131313',
  white: '#ffffff',
  cardGrey: '#7b7b7b',
  gridLine: '#ececec',
  minusI: '#00214c',
  plusQ: '#32006a',
  osdBlue: '#0b2db8',
  dim: '#a8a8a8',
  // the island
  skyTop: '#2a7fd4',
  skyLow: '#9bd8f5',
  seaFar: '#1a56a6',
  seaMid: '#1c7dc9',
  seaNear: '#25a6d4',
  shallow: '#3cc6cf',
  shallow2: '#79dcd2',
  sand: '#f3dea6',
  sandShade: '#d8bb7c',
  leafDark: '#2a7433',
  leaf: '#4ca545',
  leafLight: '#93d062',
  trunk: '#b36d4c',
  trunkDark: '#8a4a33',
  log: '#8e5034',
  logLight: '#b57250',
  rock: '#8d8f94',
  rockDark: '#6c6e74',
  // her
  skin: '#f1c3a0',
  hair: '#5a3825',
  cream: '#f4ecd6',
  coral: '#e2705a',
  shorts: '#eee2c6',
  line: '#3a2522',
  phone: '#23272f',
};

// ------------------------------------------------------------------ CSS timeline helpers
const css = [];
const keyframes = [];
let uid = 0;
const pct = (t) => +((t / LOOP) * 100).toFixed(4);

// Visible during the given [start, end) windows of the loop; `base` is the opacity in the
// reduced-motion still. step-end keeps every change a hard cut.
function vis(windows, base = 0) {
  const name = 'v' + (uid++).toString(36);
  const inside = (t) => windows.some(([a, b]) => t >= a && t < b);
  const ts = [...new Set([0, ...windows.flat()])].filter((t) => t >= 0 && t < LOOP).sort((a, b) => a - b);
  let s = `@keyframes ${name}{`;
  for (const t of ts) s += `${pct(t)}%{opacity:${inside(t) ? 1 : 0}}`;
  s += `100%{opacity:${inside(LOOP - 1e-6) ? 1 : 0}}}`;
  keyframes.push(s);
  css.push(`.${name}{opacity:${base};animation:${name} ${LOOP}s step-end infinite}`);
  return name;
}

// Moves through [t, x, y, timing] points (timing applies to the segment that starts there).
function move(points, base) {
  const name = 'm' + (uid++).toString(36);
  let s = `@keyframes ${name}{`;
  for (const [t, x, y, timing] of points) {
    s += `${pct(t)}%{transform:translate(${n2(x)}px,${n2(y)}px)${timing ? `;animation-timing-function:${timing}` : ''}}`;
  }
  const last = points[points.length - 1];
  if (last[0] < LOOP) s += `100%{transform:translate(${n2(last[1])}px,${n2(last[2])}px)}`;
  s += '}';
  keyframes.push(s);
  css.push(`.${name}{transform:translate(${n2(base[0])}px,${n2(base[1])}px);animation:${name} ${LOOP}s step-end infinite}`);
  return name;
}

// ------------------------------------------------------------------ OSD 5x7 bitmap face
const PIX = {
  A: ['.###.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  B: ['####.', '#...#', '#...#', '####.', '#...#', '#...#', '####.'],
  C: ['.###.', '#...#', '#....', '#....', '#....', '#...#', '.###.'],
  D: ['####.', '#...#', '#...#', '#...#', '#...#', '#...#', '####.'],
  E: ['#####', '#....', '#....', '####.', '#....', '#....', '#####'],
  F: ['#####', '#....', '#....', '####.', '#....', '#....', '#....'],
  G: ['.###.', '#...#', '#....', '#.###', '#...#', '#...#', '.####'],
  H: ['#...#', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  I: ['.###.', '..#..', '..#..', '..#..', '..#..', '..#..', '.###.'],
  J: ['..###', '...#.', '...#.', '...#.', '...#.', '#..#.', '.##..'],
  K: ['#...#', '#..#.', '#.#..', '##...', '#.#..', '#..#.', '#...#'],
  L: ['#....', '#....', '#....', '#....', '#....', '#....', '#####'],
  M: ['#...#', '##.##', '#.#.#', '#.#.#', '#...#', '#...#', '#...#'],
  N: ['#...#', '#...#', '##..#', '#.#.#', '#..##', '#...#', '#...#'],
  O: ['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  P: ['####.', '#...#', '#...#', '####.', '#....', '#....', '#....'],
  Q: ['.###.', '#...#', '#...#', '#...#', '#.#.#', '#..#.', '.##.#'],
  R: ['####.', '#...#', '#...#', '####.', '#.#..', '#..#.', '#...#'],
  S: ['.####', '#....', '#....', '.###.', '....#', '....#', '####.'],
  T: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..'],
  U: ['#...#', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  V: ['#...#', '#...#', '#...#', '#...#', '#...#', '.#.#.', '..#..'],
  W: ['#...#', '#...#', '#...#', '#.#.#', '#.#.#', '#.#.#', '.#.#.'],
  X: ['#...#', '#...#', '.#.#.', '..#..', '.#.#.', '#...#', '#...#'],
  Y: ['#...#', '#...#', '.#.#.', '..#..', '..#..', '..#..', '..#..'],
  Z: ['#####', '....#', '...#.', '..#..', '.#...', '#....', '#####'],
  0: ['.###.', '#...#', '#..##', '#.#.#', '##..#', '#...#', '.###.'],
  1: ['..#..', '.##..', '..#..', '..#..', '..#..', '..#..', '.###.'],
  2: ['.###.', '#...#', '....#', '...#.', '..#..', '.#...', '#####'],
  3: ['#####', '...#.', '..#..', '...#.', '....#', '#...#', '.###.'],
  4: ['...#.', '..##.', '.#.#.', '#..#.', '#####', '...#.', '...#.'],
  5: ['#####', '#....', '####.', '....#', '....#', '#...#', '.###.'],
  6: ['..##.', '.#...', '#....', '####.', '#...#', '#...#', '.###.'],
  7: ['#####', '....#', '...#.', '..#..', '.#...', '.#...', '.#...'],
  8: ['.###.', '#...#', '#...#', '.###.', '#...#', '#...#', '.###.'],
  9: ['.###.', '#...#', '#...#', '.####', '....#', '...#.', '.##..'],
  '.': ['.....', '.....', '.....', '.....', '.....', '.##..', '.##..'],
  ',': ['.....', '.....', '.....', '.....', '.##..', '.##..', '.#...'],
  ':': ['.....', '.##..', '.##..', '.....', '.##..', '.##..', '.....'],
  '-': ['.....', '.....', '.....', '####.', '.....', '.....', '.....'],
  '/': ['....#', '...#.', '...#.', '..#..', '.#...', '.#...', '#....'],
  '!': ['..#..', '..#..', '..#..', '..#..', '..#..', '.....', '..#..'],
  '?': ['.###.', '#...#', '....#', '...#.', '..#..', '.....', '..#..'],
  "'": ['..#..', '..#..', '.#...', '.....', '.....', '.....', '.....'],
  '(': ['...#.', '..#..', '.#...', '.#...', '.#...', '..#..', '...#.'],
  ')': ['.#...', '..#..', '...#.', '...#.', '...#.', '..#..', '.#...'],
  '·': ['.....', '.....', '.....', '.##..', '.##..', '.....', '.....'],
  '+': ['.....', '..#..', '..#..', '#####', '..#..', '..#..', '.....'],
  '&': ['.##..', '#..#.', '#.#..', '.#...', '#.#.#', '#..#.', '.##.#'],
  '♪': ['..##.', '..#.#', '..#..', '..#..', '.##..', '###..', '.#...'],
};
const pixId = (ch, bold) => `${bold ? 'q' : 'p'}${ch.codePointAt(0).toString(16)}`;
const usedPix = new Map(); // id -> [ch, bold]

// Rows of pixels to one path of merged rectangles (horizontal runs, stacked when identical).
function bitmapPath(rows) {
  const open = new Map(); // "x,w" -> {x, y, w, h}
  const done = [];
  rows.forEach((row, y) => {
    const runs = [];
    let x = 0;
    while (x < row.length) {
      if (row[x] === '#') {
        let e = x;
        while (e < row.length && row[e] === '#') e++;
        runs.push([x, e - x]);
        x = e;
      } else x++;
    }
    const keys = new Set(runs.map(([a, w]) => `${a},${w}`));
    for (const [k, r] of [...open]) if (!keys.has(k)) { done.push(r); open.delete(k); }
    for (const [a, w] of runs) {
      const k = `${a},${w}`;
      if (open.has(k)) open.get(k).h++;
      else open.set(k, { x: a, y, w, h: 1 });
    }
  });
  done.push(...open.values());
  return done.map((r) => `M${r.x} ${r.y}h${r.w}v${r.h}h${-r.w}z`).join('');
}
function glyphRows(ch, bold) {
  const rows = PIX[ch];
  if (!rows) throw new Error(`no pixel glyph for "${ch}"`);
  if (!bold) return rows;
  return rows.map((r) => {
    const out = [...(r + '.')];
    for (let i = 0; i < r.length; i++) if (r[i] === '#') out[i + 1] = '#';
    return out.join('');
  });
}
const pixAdv = (bold) => (bold ? 7 : 6);
const pixWidth = (str, s, bold) => (str.length * pixAdv(bold) - 1) * s;

// Pixel text with its top-left at (x, y); scale s; anchor 'start' | 'middle' | 'end'.
function ptext(str, x, y, s, { fill = C.white, bold = false, anchor = 'start', extra = '' } = {}) {
  str = str.toUpperCase();
  const w = pixWidth(str, s, bold);
  const x0 = anchor === 'middle' ? x - w / 2 : anchor === 'end' ? x - w : x;
  let out = `<g transform="translate(${n2(x0)} ${n2(y)}) scale(${s})" fill="${fill}"${extra}>`;
  [...str].forEach((ch, i) => {
    if (ch === ' ') return;
    const id = pixId(ch, bold);
    usedPix.set(id, [ch, bold]);
    out += `<use href="#${id}"${i ? ` x="${i * pixAdv(bold)}"` : ''}/>`;
  });
  return out + '</g>';
}

// ------------------------------------------------------------------ "Card Grotesk" vector caps
// Cap height 10 units, baseline at y = 10. Strokes are centred on these lines.
const VEC = {
  A: [6, 'M0 10L3 0L6 10M1.1 6.6H4.9'],
  B: [6, 'M0 0V10H3.7C5.2 10 6 9 6 7.45C6 5.9 5.2 4.9 3.5 4.9H0M0 0H3.4C4.9 0 5.6 0.9 5.6 2.45C5.6 4 4.9 4.9 3.5 4.9'],
  C: [6, 'M5.9 2.4C5.4 0.8 4.3 0 3 0C1 0 0 1.8 0 5C0 8.2 1 10 3 10C4.3 10 5.4 9.2 5.9 7.6'],
  D: [6, 'M0 0V10H2.6C5 10 6 8.4 6 5C6 1.6 5 0 2.6 0Z'],
  E: [5.6, 'M5.6 0H0V10H5.6M0 4.9H4.8'],
  F: [5.4, 'M5.4 0H0V10M0 4.9H4.6'],
  G: [6, 'M5.9 2.4C5.4 0.8 4.3 0 3 0C1 0 0 1.8 0 5C0 8.2 1 10 3 10C5 10 6 8.6 6 6.2V5.4H3.4'],
  H: [6, 'M0 0V10M6 0V10M0 4.9H6'],
  I: [0, 'M0 0V10'],
  J: [5, 'M5 0V7.2C5 9 4.2 10 2.6 10C1 10 0.2 9 0 7.6'],
  K: [6, 'M0 0V10M5.8 0L0.2 6.2M2.2 4L6 10'],
  L: [5.4, 'M0 0V10H5.4'],
  M: [8, 'M0 10V0L4 7.5L8 0V10'],
  N: [6, 'M0 10V0L6 10V0'],
  O: [6.4, 'M3.2 0C5.3 0 6.4 1.8 6.4 5C6.4 8.2 5.3 10 3.2 10C1.1 10 0 8.2 0 5C0 1.8 1.1 0 3.2 0Z'],
  P: [6, 'M0 10V0H3.5C5.1 0 6 1 6 2.75C6 4.5 5.1 5.5 3.5 5.5H0'],
  R: [6, 'M0 10V0H3.5C5.1 0 6 1 6 2.75C6 4.5 5.1 5.5 3.5 5.5H0M3.2 5.5L6 10'],
  S: [6, 'M5.7 2C5.2 0.7 4.3 0 3 0C1.4 0 0.3 0.9 0.3 2.6C0.3 4.3 1.6 4.7 3 5C4.6 5.3 6 5.8 6 7.5C6 9.1 4.8 10 3 10C1.5 10 0.4 9.2 0 7.9'],
  T: [6, 'M0 0H6M3 0V10'],
  U: [6, 'M0 0V6.8C0 8.9 1.1 10 3 10C4.9 10 6 8.9 6 6.8V0'],
  V: [6.4, 'M0 0L3.2 10L6.4 0'],
  W: [8.6, 'M0 0L1.9 10L4.3 1.6L6.7 10L8.6 0'],
  X: [6, 'M0 0L6 10M6 0L0 10'],
  Y: [6.4, 'M0 0L3.2 5.3L6.4 0M3.2 5.3V10'],
  Z: [6, 'M0.2 0H6L0 10H6'],
  0: [5.6, 'M2.8 0C4.7 0 5.6 1.8 5.6 5C5.6 8.2 4.7 10 2.8 10C0.9 10 0 8.2 0 5C0 1.8 0.9 0 2.8 0Z'],
  1: [5.6, 'M1.2 1.8L3.4 0V10'],
  2: [5.6, 'M0.2 2.6C0.5 0.9 1.5 0 2.9 0C4.5 0 5.5 1 5.5 2.6C5.5 4.2 4.6 5.2 3 6.5L0 10H5.6'],
  3: [5.6, 'M0.4 0H5.3L2.5 4C4.5 4 5.6 5.2 5.6 7C5.6 8.9 4.4 10 2.8 10C1.6 10 0.6 9.4 0 8.3'],
  4: [5.6, 'M4.2 10V0L0 7H5.6'],
  5: [5.6, 'M5.2 0H0.8L0.4 4.6C1 4.1 1.9 3.8 2.8 3.8C4.6 3.8 5.6 5 5.6 6.9C5.6 8.8 4.5 10 2.8 10C1.6 10 0.6 9.4 0 8.3'],
  6: [5.6, 'M5 0.8C4.4 0.3 3.8 0 3 0C1.1 0 0 2 0 5.6C0 8.6 1.1 10 2.8 10C4.6 10 5.6 8.7 5.6 6.8C5.6 4.9 4.6 3.8 2.9 3.8C1.6 3.8 0.5 4.6 0 5.8'],
  7: [5.6, 'M0 0H5.6L2 10'],
  8: [5.6, 'M2.8 4.7C1.4 4.7 0.4 3.8 0.4 2.4C0.4 0.9 1.4 0 2.8 0C4.2 0 5.2 0.9 5.2 2.4C5.2 3.8 4.2 4.7 2.8 4.7C1.1 4.7 0 5.7 0 7.3C0 9 1.1 10 2.8 10C4.5 10 5.6 9 5.6 7.3C5.6 5.7 4.5 4.7 2.8 4.7Z'],
  9: [5.6, 'M0.6 9.2C1.2 9.7 1.8 10 2.6 10C4.5 10 5.6 8 5.6 4.4C5.6 1.4 4.5 0 2.8 0C1 0 0 1.3 0 3.2C0 5.1 1 6.2 2.7 6.2C4 6.2 5.1 5.4 5.6 4.2'],
  ':': [0, 'M0 2.6V3.2M0 8.8V9.4'],
  '.': [0, 'M0 9.4V10'],
  '-': [3.6, 'M0 5.6H3.6'],
  '/': [4, 'M0 10L4 0'],
};
const vecId = (ch) => `g${ch.codePointAt(0).toString(16)}`;
const usedVec = new Set();
// width in units of a run, given stroke width sw and tracking tr (both in glyph units)
function vecWidth(str, sw, tr) {
  let w = 0;
  [...str].forEach((ch, i) => {
    if (ch === ' ') { w += 3.4; return; }
    w += VEC[ch][0] + (i < str.length - 1 ? sw + tr + (ch === ':' ? 0.6 : 0) : 0);
    if (ch === ':' && i > 0) w += 0.6;
  });
  return w + sw;
}
// Vector caps with the cap box's top at y; cap = cap height in px.
function vtext(str, x, y, cap, { sw = 1.6, tr = 1.6, stroke = C.white, anchor = 'start', extra = '' } = {}) {
  const s = cap / 10;
  const w = vecWidth(str, sw, tr) * s;
  const x0 = anchor === 'middle' ? x - w / 2 : anchor === 'end' ? x - w : x;
  let out = `<g transform="translate(${n2(x0 + (sw / 2) * s)} ${n2(y)}) scale(${n2(s)})" class="vt" stroke="${stroke}" stroke-width="${sw}"${extra}>`;
  let cx = 0;
  for (const ch of str) {
    if (ch === ' ') { cx += 3.4; continue; }
    if (!VEC[ch]) throw new Error(`no vector glyph for "${ch}"`);
    usedVec.add(ch);
    if (ch === ':' && cx) cx += 0.6; // a little air either side of a colon, as in the clock
    out += `<use href="#${vecId(ch)}"${cx ? ` x="${n2(cx)}"` : ''}/>`;
    cx += VEC[ch][0] + sw + tr + (ch === ':' ? 0.6 : 0);
  }
  return out + '</g>';
}

// ------------------------------------------------------------------ the running clock
// H:MM:SS as five digit strips, each on its own period, clipped to one digit window.
css.push('.ck{animation-timing-function:steps(10);animation-iteration-count:infinite;animation-name:ck10}');
css.push('.ck6{animation-name:ck6;animation-timing-function:steps(6)}');
keyframes.push('@keyframes ck10{to{transform:translateY(-160px)}}', '@keyframes ck6{to{transform:translateY(-96px)}}');
// Clock with the cap box top-left at (x, y) and cap height `cap`.
function clock(x, y, cap, { sw = 1.7, tr = 1.5, stroke = C.white } = {}) {
  const s = cap / 10;
  const slot = 5.6 + sw + tr;
  const colon = 0 + sw + tr + 0.6;
  const strip = (n) => {
    let g = '';
    for (let k = 0; k <= n; k++) {
      const d = String(k % 10);
      if (n === 6 && k === 6) break;
      usedVec.add(d);
      const dx = (5.6 - VEC[d][0]) / 2;
      g += `<use href="#${vecId(d)}" x="${n2(dx)}" y="${k * 16}"/>`;
    }
    return g;
  };
  const digit = (dx, period, six) =>
    `<g transform="translate(${n2(dx)} 0)" clip-path="url(#ckw)"><g class="ck${six ? ' ck6' : ''}" style="animation-duration:${period}s">${strip(six ? 6 : 10)}</g></g>`;
  usedVec.add(':');
  let cx = 0;
  let g = `<g transform="translate(${n2(x + (sw / 2) * s)} ${n2(y)}) scale(${n2(s)})" class="vt" stroke="${stroke}" stroke-width="${sw}">`;
  g += digit(cx, 36000, false); cx += slot;
  g += `<use href="#${vecId(':')}" x="${n2(cx - 0.2)}"/>`; cx += colon;
  g += digit(cx, 3600, true); cx += slot;
  g += digit(cx, 600, false); cx += slot;
  g += `<use href="#${vecId(':')}" x="${n2(cx - 0.2)}"/>`; cx += colon;
  g += digit(cx, 60, true); cx += slot;
  g += digit(cx, 10, false); cx += slot;
  return { svg: g + '</g>', width: (cx - sw - tr + sw) * s };
}
const clockWidth = (cap, sw = 1.7, tr = 1.5) => clock(0, 0, cap, { sw, tr }).width;

// ------------------------------------------------------------------ her (small, simple, fully dressed)
// Local coordinates: feet at (0, 0), facing right, about 55 units tall.
function limb(d, w) {
  return `<path d="${d}" fill="none" stroke="${C.line}" stroke-width="${w + 1.5}" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<path d="${d}" fill="none" stroke="${C.skin}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
}
function head(lookUp = false) {
  const eyeY = lookUp ? -50.2 : -49.1;
  return `<g class="nod">` +
    `<circle cx="-4.5" cy="-46.6" r="2.8" fill="${C.hair}" stroke="${C.line}" stroke-width="0.8"/>` +
    `<circle cx="0.2" cy="-49.2" r="4.9" fill="${C.skin}" stroke="${C.line}" stroke-width="0.8"/>` +
    `<path d="M-4.7 -47.8C-5.4 -53.5 -1.6 -55.4 1.6 -54.6C4.2 -54 5.6 -52 5.2 -49.4C3.6 -51.4 1.4 -51.7 -0.5 -50.9C-1.7 -49.5 -2.5 -47.5 -4.7 -46.3Z" fill="${C.hair}" stroke="${C.line}" stroke-width="0.8" stroke-linejoin="round"/>` +
    `<path d="M-2.6 -51.6C-1.6 -55.9 3.2 -56.1 4.6 -52.4" fill="none" stroke="${C.line}" stroke-width="2.6" stroke-linecap="round"/>` +
    `<path d="M-2.6 -51.6C-1.6 -55.9 3.2 -56.1 4.6 -52.4" fill="none" stroke="${C.cream}" stroke-width="1.3" stroke-linecap="round"/>` +
    `<ellipse cx="-1.5" cy="-48.6" rx="2.1" ry="2.6" fill="${C.cream}" stroke="${C.line}" stroke-width="0.8"/>` +
    `<circle cx="3.3" cy="${eyeY}" r="0.6" fill="${C.line}"/>` +
    `<circle cx="3.1" cy="-47.2" r="0.9" fill="#ef9a85" opacity="0.7"/>` +
    `</g>`;
}
const SHORTS = `<path d="M-5.4 -29.5H5.4L6 -20.4H0.5L0 -23L-0.5 -20.4H-6Z" fill="${C.shorts}" stroke="${C.line}" stroke-width="0.8" stroke-linejoin="round"/>`;
const TORSO = `<path d="M-4.8 -42.4Q0 -43.9 4.8 -42.4L5.4 -29H-5.4Z" fill="${C.coral}" stroke="${C.line}" stroke-width="0.8" stroke-linejoin="round"/>` +
  `<path d="M-5.2 -31.2H5.2" stroke="#c45a47" stroke-width="0.7"/>`;
const NECK = `<rect x="-1.3" y="-45.6" width="2.6" height="4" fill="${C.skin}"/>`;
const foot = (cx, cy, rot = 0) =>
  `<ellipse cx="${cx}" cy="${cy}" rx="2.5" ry="1.3" transform="rotate(${rot} ${cx} ${cy})" fill="${C.skin}" stroke="${C.line}" stroke-width="0.8"/>`;
const hand = (x, y) => `<circle cx="${x}" cy="${y}" r="1.35" fill="${C.skin}" stroke="${C.line}" stroke-width="0.7"/>`;
const phoneAt = (x, y) =>
  `<rect x="${x - 1.4}" y="${y - 2.6}" width="2.8" height="4.8" rx="0.6" fill="${C.phone}" stroke="${C.line}" stroke-width="0.5"/>` +
  `<rect x="${x - 0.9}" y="${y - 2}" width="1.8" height="3" fill="#8fe3ff"/>`;

// A speech-bubble signal meter: four bars, `lit` of them filled.
function meter(x, y, lit) {
  let g = `<g transform="translate(${n2(x)} ${n2(y)})">` +
    `<path d="M2 0H24Q26 0 26 2V13Q26 15 24 15H8L3 19L4.5 15H2Q0 15 0 13V2Q0 0 2 0Z" fill="${C.white}" stroke="${C.line}" stroke-width="0.9" stroke-linejoin="round"/>`;
  for (let i = 0; i < 4; i++) {
    const h = 3 + i * 2.6;
    const bx = 4.5 + i * 4.8;
    g += lit > i
      ? `<rect x="${n2(bx)}" y="${n2(12.4 - h)}" width="3" height="${n2(h)}" fill="${C.line}"/>`
      : `<rect x="${n2(bx + 0.4)}" y="${n2(12.8 - h)}" width="2.2" height="${n2(h - 0.8)}" fill="none" stroke="#9aa3ad" stroke-width="0.8"/>`;
  }
  if (!lit) g += `<path d="M18.6 2.6L23 7M23 2.6L18.6 7" stroke="${C.coral}" stroke-width="1.3" stroke-linecap="round"/>`;
  return g + '</g>';
}

function herStand() {
  return limb('M-4.6 -40.4Q-6.8 -34 -6.2 -27.4', 2.4) + hand(-6.2, -26.8) +
    limb('M-1.8 -21L-2.1 -2.2', 3) + limb('M1.8 -21L2.5 -2.2', 3) +
    foot(-1.3, -1.3) + foot(3.7, -1.3) +
    SHORTS + NECK + TORSO +
    limb('M4.6 -40.4Q6.6 -34 6.1 -27.4', 2.4) + hand(6.1, -26.8) +
    head(false);
}
function herPhone() {
  return limb('M-4.6 -40.4Q-6.8 -34 -6.2 -27.4', 2.4) + hand(-6.2, -26.8) +
    limb('M-1.8 -21L-2.1 -2.2', 3) + limb('M1.8 -21L2.5 -2.2', 3) +
    foot(-1.3, -1.3) + foot(3.7, -1.3) +
    SHORTS + NECK + TORSO +
    head(true) +
    limb('M4.6 -40.4Q9.4 -46 8.6 -54.6', 2.4) + phoneAt(8.6, -58.4) + hand(8.6, -55.4) +
    meter(13, -79, 0);
}
function herClimb() {
  return limb('M-3.8 -40.2Q2 -46.5 7.8 -47.6', 2.4) + hand(7.8, -47.6) +
    limb('M-1.6 -21.4L4.2 -15.2L3.6 -7.4', 3.1) + foot(4.4, -6.6, -60) +
    limb('M1.6 -21.4L7.4 -17.6L7 -9.6', 3.1) + foot(7.8, -8.8, -60) +
    SHORTS + NECK + TORSO +
    head(true) +
    limb('M4.4 -40.4Q8.4 -44.5 8.8 -51.2', 2.4) + hand(8.8, -51.6);
}
function herTop() {
  return limb('M-3.8 -40.2Q2 -44.5 8 -44.8', 2.4) + hand(8, -44.8) +
    limb('M-1.6 -21.4L4.2 -15.2L3.6 -7.4', 3.1) + foot(4.4, -6.6, -60) +
    limb('M1.6 -21.4L7.4 -17.6L7 -9.6', 3.1) + foot(7.8, -8.8, -60) +
    SHORTS + NECK + TORSO +
    head(true) +
    limb('M4.2 -40.6Q7.2 -50 6.4 -58.4', 2.4) + phoneAt(6.4, -62.2) + hand(6.4, -59.2);
}

// ------------------------------------------------------------------ the island picture
const CX = 480;
const CY = 270;
const R = 232;
const PIC_TOP = 92;
const PIC_BOT = 322;
const HORIZON = 214;
// the island, palm and her are drawn at this zoom about (480, 300)
const ISL = 1.12;

// Palm trunk as a quadratic Bezier from base to crown.
const P0 = [530, 288];
const P1 = [541, 205];
const P2 = [505, 142];
const bez = (t) => [
  (1 - t) ** 2 * P0[0] + 2 * t * (1 - t) * P1[0] + t * t * P2[0],
  (1 - t) ** 2 * P0[1] + 2 * t * (1 - t) * P1[1] + t * t * P2[1],
];
const bezD = (t) => [2 * (1 - t) * (P1[0] - P0[0]) + 2 * t * (P2[0] - P1[0]), 2 * (1 - t) * (P1[1] - P0[1]) + 2 * t * (P2[1] - P1[1])];

function trunk() {
  const left = [];
  const right = [];
  const N = 24;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const [x, y] = bez(t);
    const [dx, dy] = bezD(t);
    const l = Math.hypot(dx, dy);
    const nx = dy / l;
    const ny = -dx / l;
    const w = 5.6 - 2.4 * t + (t < 0.08 ? (0.08 - t) * 30 : 0);
    left.push([x + nx * w, y + ny * w]);
    right.push([x - nx * w, y - ny * w]);
  }
  const poly = (pts) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${n2(x)} ${n2(y)}`).join('');
  // shaded side: the right half of the trunk, drawn over the lit body
  const mid = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const [x, y] = bez(t);
    mid.push([x + 0.6, y]);
  }
  let g = `<path d="${poly(left)}${poly([...right].reverse()).replace('M', 'L')}Z" fill="${C.trunk}" stroke="${C.line}" stroke-width="1"/>`;
  g += `<path d="${poly(mid)}${poly([...right].reverse()).replace('M', 'L')}Z" fill="${C.trunkDark}" opacity="0.55"/>`;
  // segment rings
  let rings = '';
  for (let i = 1; i < 22; i++) {
    const t = i / 22.5;
    const [x, y] = bez(t);
    const [dx, dy] = bezD(t);
    const l = Math.hypot(dx, dy);
    const nx = dy / l;
    const ny = -dx / l;
    const w = 5.4 - 2.4 * t;
    rings += `M${n2(x + nx * w)} ${n2(y + ny * w)}Q${n2(x + 1.8 * (dx / l) * -1)} ${n2(y + 2.2)} ${n2(x - nx * w)} ${n2(y - ny * w)}`;
  }
  g += `<path d="${rings}" fill="none" stroke="#7a3f2b" stroke-width="0.9" opacity="0.8"/>`;
  return g;
}

function frond(cx, cy, ang, len, droop, width, fill, rib) {
  const a = (ang * Math.PI) / 180;
  const tx = cx + Math.cos(a) * len;
  const ty = cy + Math.sin(a) * len + droop;
  const mx = cx + Math.cos(a) * len * 0.55;
  const my = cy + Math.sin(a) * len * 0.55 - len * 0.22;
  // normal to the chord for the leaf's width
  const dx = tx - cx;
  const dy = ty - cy;
  const l = Math.hypot(dx, dy);
  const nx = -dy / l;
  const ny = dx / l;
  const d = `M${n2(cx)} ${n2(cy)}Q${n2(mx + nx * width)} ${n2(my + ny * width)} ${n2(tx)} ${n2(ty)}Q${n2(mx - nx * width * 0.5)} ${n2(my - ny * width * 0.5)} ${n2(cx)} ${n2(cy)}Z`;
  // leaflet notches along the lower edge: short strokes in the leaf colour's shadow
  let notches = '';
  for (let k = 1; k <= 6; k++) {
    const t = k / 7.2;
    const px = (1 - t) ** 2 * cx + 2 * t * (1 - t) * (mx + nx * width) + t * t * tx;
    const py = (1 - t) ** 2 * cy + 2 * t * (1 - t) * (my + ny * width) + t * t * ty;
    notches += `M${n2(px)} ${n2(py)}l${n2(nx * -2.2 + (dx / l) * -1.6)} ${n2(ny * -2.2 + (dy / l) * -1.6)}`;
  }
  return `<path d="${d}" fill="${fill}" stroke="${C.line}" stroke-width="0.7" stroke-linejoin="round"/>` +
    `<path d="M${n2(cx)} ${n2(cy)}Q${n2(mx)} ${n2(my)} ${n2(tx)} ${n2(ty)}" fill="none" stroke="${rib}" stroke-width="0.9"/>` +
    `<path d="${notches}" fill="none" stroke="${C.leafDark}" stroke-width="0.8" opacity="0.7"/>`;
}

function crown() {
  const [cx, cy] = P2;
  let g = '';
  const back = [[-160, 66, 26, 9], [-120, 58, 12, 8], [-60, 56, 12, 8], [-18, 68, 26, 9], [200, 50, 30, 7]];
  for (const [a, l, d, w] of back) g += frond(cx, cy, a, l, d, w, C.leafDark, '#5e9e4a');
  g += `<circle cx="${cx - 4}" cy="${cy + 5}" r="4" fill="#6b4a2a" stroke="${C.line}" stroke-width="0.7"/>` +
    `<circle cx="${cx + 3}" cy="${cy + 6}" r="4" fill="#5e3f22" stroke="${C.line}" stroke-width="0.7"/>` +
    `<circle cx="${cx - 0.5}" cy="${cy + 9}" r="3.6" fill="#7a5530" stroke="${C.line}" stroke-width="0.7"/>`;
  const front = [[-175, 60, 34, 8], [-140, 64, 20, 9], [-95, 44, 6, 7], [-40, 62, 18, 9], [-5, 62, 36, 8], [30, 46, 34, 7], [150, 46, 32, 7]];
  for (const [a, l, d, w] of front) g += frond(cx, cy, a, l, d, w, C.leaf, C.leafLight);
  return g;
}

function cloud(x, y, s, puffs) {
  let shade = '';
  let body = '';
  let hi = '';
  for (const [dx, dy, r] of puffs) {
    shade += `<circle cx="${n2(x + dx * s)}" cy="${n2(y + dy * s + 2)}" r="${n2(r * s)}"/>`;
    body += `<circle cx="${n2(x + dx * s)}" cy="${n2(y + dy * s)}" r="${n2(r * s * 0.94)}"/>`;
    hi += `<circle cx="${n2(x + dx * s - r * s * 0.18)}" cy="${n2(y + dy * s - r * s * 0.22)}" r="${n2(r * s * 0.62)}"/>`;
  }
  return `<g fill="#cfe4f3">${shade}</g><g fill="#eef6fb">${body}</g><g fill="#ffffff">${hi}</g>`;
}

function ship() {
  // local: bottom centre at (0, 0), about 36 long
  return `<g>` +
    `<circle cx="-13" cy="-19" r="2.4" fill="#e9eef2" opacity="0.8"/><circle cx="-17" cy="-22" r="1.8" fill="#e9eef2" opacity="0.6"/>` +
    `<rect x="-10.6" y="-17" width="3" height="5" fill="#c0473a"/><rect x="-10.6" y="-17" width="3" height="1.2" fill="#22262e"/>` +
    `<rect x="-13" y="-12.4" width="8.6" height="6.6" fill="#ffffff" stroke="#3b4656" stroke-width="0.5"/>` +
    `<rect x="-12.2" y="-11.2" width="7" height="1.3" fill="#3b4656"/>` +
    `<rect x="-3.6" y="-9.6" width="5" height="3.8" fill="#e2705a"/><rect x="1.6" y="-9.6" width="5" height="3.8" fill="#2fa7a0"/>` +
    `<rect x="6.8" y="-9.6" width="5" height="3.8" fill="#e8c14a"/><rect x="1.6" y="-13.2" width="5" height="3.6" fill="#e8c14a"/>` +
    `<path d="M-18 -6H18L14.6 0H-15.4Z" fill="#2d3a4a"/><path d="M-16.4 -1.8H15.6L14.6 0H-15.4Z" fill="#c0473a"/>` +
    `</g>`;
}

function raft(x, y) {
  let g = `<g transform="translate(${x} ${y}) rotate(-7)">`;
  g += `<ellipse cx="0" cy="7" rx="36" ry="5" fill="#1d7fb2" opacity="0.45"/>`;
  for (let i = 0; i < 6; i++) {
    const ly = -6 + i * 3.1;
    g += `<rect x="-32" y="${n2(ly)}" width="64" height="3.6" rx="1.8" fill="${i % 2 ? C.log : '#9a5a3b'}" stroke="${C.line}" stroke-width="0.6"/>`;
    g += `<path d="M-30 ${n2(ly + 1)}H28" stroke="${C.logLight}" stroke-width="0.7" opacity="0.8"/>`;
    g += `<ellipse cx="32" cy="${n2(ly + 1.8)}" rx="1.4" ry="1.8" fill="#d39a6a" stroke="${C.line}" stroke-width="0.5"/>`;
  }
  g += `<path d="M-20 -7V13M20 -7V13" stroke="#e3c58b" stroke-width="1.6"/>`;
  return g + '</g>';
}

function bush(x, y, s, flip = 1) {
  const blobs = [[-10, 0, 7], [-3, -4, 8], [5, -2, 7.5], [11, 1, 5.5], [-15, 2, 4.5]];
  let dark = '';
  let mid = '';
  let lite = '';
  for (const [dx, dy, r] of blobs) {
    dark += `<circle cx="${n2(x + dx * s * flip)}" cy="${n2(y + dy * s + 1.5)}" r="${n2(r * s)}"/>`;
    mid += `<circle cx="${n2(x + dx * s * flip)}" cy="${n2(y + dy * s)}" r="${n2(r * s * 0.86)}"/>`;
    lite += `<circle cx="${n2(x + (dx - 1.6) * s * flip)}" cy="${n2(y + (dy - 2.2) * s)}" r="${n2(r * s * 0.42)}"/>`;
  }
  return `<g fill="${C.leafDark}" stroke="${C.line}" stroke-width="0.7">${dark}</g><g fill="#3f9442">${mid}</g><g fill="${C.leafLight}" opacity="0.85">${lite}</g>`;
}

// ------------------------------------------------------------------ phase 1: the test card (0-15 s)
const CARD = [0, 15];
const BARS = [15, 24];
const SNOW = [24, 25];
const OFF = [24, 33];

function testCard() {
  let g = '';
  // grey field and the white grid: lines every 48 units, centred on the circle
  g += `<rect width="${W}" height="${H}" fill="${C.cardGrey}"/>`;
  let grid = '';
  for (let x = 0; x <= W; x += 48) grid += `M${x} 0V${H}`;
  for (let y = CY % 48; y <= H; y += 48) grid += `M0 ${y}H${W}`;
  g += `<path d="${grid}" stroke="${C.gridLine}" stroke-width="2"/>`;
  // castellated border
  let blk = '';
  let wht = '';
  for (let i = 0; i < W / 48; i++) {
    const r1 = `M${i * 48} 0h48v16h-48z`;
    const r2 = `M${i * 48} ${H - 16}h48v16h-48z`;
    if (i % 2) { wht += r1; blk += r2; } else { blk += r1; wht += r2; }
  }
  const ys = [0];
  for (let y = CY % 48; y < H; y += 48) ys.push(y);
  ys.push(H);
  for (let i = 0; i < ys.length - 1; i++) {
    const a = Math.max(ys[i], 16);
    const b = Math.min(ys[i + 1], H - 16);
    if (b <= a) continue;
    const l = `M0 ${a}h14v${b - a}h-14z`;
    const r = `M${W - 14} ${a}h14v${b - a}h-14z`;
    if (i % 2) { blk += l; wht += r; } else { wht += l; blk += r; }
  }
  g += `<path d="${blk}" fill="${C.black}"/><path d="${wht}" fill="${C.white}"/>`;
  // centre markers on the edges
  g += `<path d="M472 18L480 30L488 18ZM472 522L480 510L488 522ZM16 262L28 270L16 278ZM944 262L932 270L944 278Z" fill="${C.white}"/>`;

  // four corner circles with real numbers in them
  const corner = (x, y, big, small, cap = 17, top = -16, tr = 1.4) =>
    `<circle cx="${x}" cy="${y}" r="52" fill="${C.black}" stroke="${C.white}" stroke-width="4"/>` +
    `<circle cx="${x}" cy="${y}" r="44" fill="none" stroke="#3a3a3a" stroke-width="1.5"/>` +
    vtext(big, x, y + top, cap, { anchor: 'middle', sw: 1.9, tr }) +
    ptext(small, x, y + 10, 2, { anchor: 'middle', fill: '#d6d6d6' });
  g += corner(120, 126, '16:9', '1080P');
  g += corner(840, 126, '30', 'FPS', 22);
  g += corner(120, 414, '80', 'BPM', 22);
  // the long one: tighter tracking and a little lower, where the circle is wider
  g += corner(840, 414, '10:00:00', 'RUN', 13, -12, 1);

  // side ident boxes
  const side = (x, l1, l2, bold1 = true) =>
    `<rect x="${x}" y="244" width="200" height="52" fill="${C.black}" stroke="${C.white}" stroke-width="2"/>` +
    ptext(l1, x + 100, 255, 2, { anchor: 'middle', bold: bold1 }) +
    ptext(l2, x + 100, 274, 2, { anchor: 'middle', fill: C.dim });
  g += side(30, 'SANDBAR TV', 'CH 1 · ISLAND');
  g += side(730, 'ALWAYS DAYTIME', 'SEED 1992', false);

  // ---- the circle
  let inC = '';
  // bars dome
  const bw = (2 * R + 4) / 7;
  BAR.forEach((c, i) => { inC += `<rect x="${n2(CX - R - 2 + i * bw)}" y="30" width="${n2(bw + 0.6)}" height="${PIC_TOP - 30}" fill="${c}"/>`; });

  // the picture
  let pic = '';
  pic += `<rect x="${CX - R}" y="${PIC_TOP}" width="${2 * R}" height="${HORIZON - PIC_TOP}" fill="url(#sky)"/>`;
  const drift = 'drift';
  pic += `<g class="${drift}">` +
    cloud(292, 196, 1, [[0, 0, 13], [16, -8, 16], [34, -2, 13], [48, 4, 9], [-14, 6, 8], [24, 8, 10], [8, 9, 9]]) +
    cloud(612, 190, 1.1, [[0, 0, 12], [15, -9, 15], [32, -4, 14], [46, 3, 10], [-12, 5, 8], [26, 7, 9]]) +
    cloud(392, 120, 0.55, [[0, 0, 10], [12, -5, 12], [25, 0, 9], [-9, 3, 6]]) +
    cloud(660, 150, 0.45, [[0, 0, 10], [12, -5, 12], [25, 0, 9]]) +
    `</g>`;
  pic += `<rect x="${CX - R}" y="${HORIZON - 5}" width="${2 * R}" height="5" fill="#d8f1fb" opacity="0.6"/>`;
  // the ship that she will miss, on the horizon (behind everything else in the sea)
  const shipX0 = 236;
  const shipX1 = 728;
  const shipCls = move([[0, shipX0, HORIZON + 1], [3, shipX0, HORIZON + 1, 'steps(48,end)'], [9, shipX1, HORIZON + 1], [LOOP, shipX1, HORIZON + 1]], [shipX1, HORIZON + 1]);
  pic += `<g class="${shipCls}">${ship()}</g>`;
  // sea
  pic += `<rect x="${CX - R}" y="${HORIZON}" width="${2 * R}" height="${PIC_BOT - HORIZON}" fill="url(#sea)"/>`;
  // sea texture: short wave strokes, two sets that trade places on the half-bar
  let w1 = '';
  let w2 = '';
  for (let i = 0; i < 46; i++) {
    const y = HORIZON + 6 + rand() ** 1.4 * (PIC_BOT - HORIZON - 8);
    const half = Math.sqrt(Math.max(0, R * R - (y - CY) ** 2)) - 10;
    const x = CX - half + rand() * half * 2;
    const len = 3 + ((y - HORIZON) / 96) * 9 * (0.6 + rand() * 0.6);
    const seg = `M${n2(x)} ${n2(y)}q${n2(len / 2)} ${n2(-1.6)} ${n2(len)} 0`;
    if (i % 2) w1 += seg; else w2 += seg;
  }
  pic += `<path class="tw1" d="${w1}" fill="none" stroke="#ffffff" stroke-width="1.1" opacity="0.85" stroke-linecap="round"/>`;
  pic += `<path class="tw2" d="${w2}" fill="none" stroke="#bfeaf8" stroke-width="1.1" opacity="0.85" stroke-linecap="round"/>`;
  // ---- the island group, zoomed about (480, 300)
  let isl = '';
  // shallows, foam, sand
  isl += `<ellipse cx="478" cy="294" rx="168" ry="38" fill="${C.shallow}" opacity="0.8"/>`;
  isl += `<ellipse cx="478" cy="293" rx="146" ry="31" fill="${C.shallow2}" opacity="0.85"/>`;
  isl += `<ellipse cx="476" cy="291" rx="128" ry="26" fill="none" stroke="#ffffff" stroke-width="2.4" stroke-dasharray="12 5 5 7" class="foam" opacity="0.95"/>`;
  // the raft sits in the shallows over the foam line, beached against the sand
  isl += raft(626, 295);
  isl += `<ellipse cx="476" cy="292" rx="119" ry="21" fill="${C.sandShade}" stroke="${C.line}" stroke-width="0.8"/>`;
  isl += `<ellipse cx="474" cy="288" rx="114" ry="18" fill="${C.sand}"/>`;
  isl += `<path d="M396 283q14 -3 30 -1M520 296q16 2 34 -1M440 296q10 2 20 1" stroke="#e2c88c" stroke-width="1.2" fill="none" stroke-linecap="round"/>`;
  isl += `<ellipse cx="420" cy="305" rx="8" ry="5" fill="${C.rock}" stroke="${C.line}" stroke-width="0.7"/><ellipse cx="418" cy="303.6" rx="4.5" ry="2" fill="#a9abb0"/>`;
  isl += `<ellipse cx="548" cy="308" rx="6" ry="4" fill="${C.rockDark}" stroke="${C.line}" stroke-width="0.7"/>`;
  isl += bush(428, 281, 0.9, 1);
  isl += bush(560, 281, 1.0, -1);
  // the palm
  isl += `<ellipse cx="${P0[0] - 4}" cy="${P0[1] + 1}" rx="22" ry="4" fill="#c4a368" opacity="0.7"/>`;
  isl += trunk();
  isl += crown();
  isl += bush(520, 287, 0.7, 1);

  // her: standing (0-3), phone up (3-6), climbing on the beat (6-9), at the top (9-15)
  const STAND = [486, 296];
  isl += `<g class="${vis([[0, 3]])}" transform="translate(${STAND[0]} ${STAND[1]})">${herStand()}</g>`;
  isl += `<g class="${vis([[3, 6]])}" transform="translate(${STAND[0]} ${STAND[1]})">${herPhone()}</g>`;
  const climbAt = (t, pose, win, base = 0) => {
    const [bx, by] = bez(t);
    const [dx, dy] = bezD(t);
    const l = Math.hypot(dx, dy);
    const ux = dx / l;
    const uy = dy / l;
    const ang = (Math.atan2(ux, -uy) * 180) / Math.PI;
    const ox = bx - 9;
    const oy = by + 4;
    return `<g class="${vis(win, base)}" transform="translate(${n2(ox)} ${n2(oy)}) rotate(${n2(ang * 0.8)})">${pose}</g>`;
  };
  [0.04, 0.155, 0.27, 0.385].forEach((t, k) => { isl += climbAt(t, herClimb(), [[6 + k * 0.75, 6.75 + k * 0.75]]); });
  {
    // at the top: the pose leans with the trunk, the signal bubble stays upright
    const t = 0.5;
    const [bx, by] = bez(t);
    const [dx, dy] = bezD(t);
    const ang = ((Math.atan2(dx / Math.hypot(dx, dy), -dy / Math.hypot(dx, dy)) * 180) / Math.PI) * 0.5;
    const ox = bx - 9;
    const oy = by + 4;
    const a = (ang * Math.PI) / 180;
    const [px, py] = [6.4, -62.2];
    const phx = ox + px * Math.cos(a) - py * Math.sin(a);
    const phy = oy + px * Math.sin(a) + py * Math.cos(a);
    const win = vis([[9, 15]], 1);
    isl += `<g class="${win}"><g transform="translate(${n2(ox)} ${n2(oy)}) rotate(${n2(ang)})">${herTop()}</g>${meter(phx + 4, phy - 21, 1)}</g>`;
  }

  pic += `<g transform="translate(480 300) scale(${ISL}) translate(-480 -300)">${isl}</g>`;
  inC += `<g clip-path="url(#picClip)">${pic}</g>`;
  inC += `<path d="M${CX - R} ${PIC_TOP}H${CX + R}" stroke="${C.white}" stroke-width="2"/>`;

  // black ident band: the name, and a caption that changes on every bar line
  inC += `<rect x="${CX - R}" y="${PIC_BOT}" width="${2 * R}" height="84" fill="${C.black}"/>`;
  inC += `<path d="M${CX - R} ${PIC_BOT}H${CX + R}M${CX - R} ${PIC_BOT + 84}H${CX + R}" stroke="${C.white}" stroke-width="2"/>`;
  inC += vtext('CASTAWAY', CX, PIC_BOT + 11, 40, { anchor: 'middle', sw: 1.7, tr: 1.9 });
  const captions = [
    'NOW SHOWING: AN ISLAND.',
    'SHE HAS NO SIGNAL.',
    'SO SHE CLIMBS THE PALM.',
    'ONE BAR, AT THE VERY TOP.',
    'SHE HAS MISSED THE BOAT.',
  ];
  captions.forEach((c, i) => {
    inC += `<g class="${vis([[i * 3, i * 3 + 3]], i === 3 ? 1 : 0)}">${ptext(c, CX, PIC_BOT + 62, 2, { anchor: 'middle', fill: '#e8e8e8' })}</g>`;
  });

  // grey staircase
  const sy = PIC_BOT + 86;
  const steps = ['#000000', '#2e2e2e', '#5c5c5c', '#8a8a8a', '#b8b8b8', '#e6e6e6'];
  const stw = (2 * R) / 6;
  steps.forEach((c, i) => { inC += `<rect x="${n2(CX - R + i * stw)}" y="${sy}" width="${n2(stw + 0.5)}" height="30" fill="${c}"/>`; });

  // bottom cap: frequency gratings either side of the clock box
  const by0 = sy + 30;
  inC += `<rect x="${CX - R}" y="${by0}" width="${2 * R}" height="${CY + R - by0}" fill="${C.white}"/>`;
  let grat = '';
  const widths = [7, 5, 3.5, 2.5, 1.6];
  const gratSide = (x0, dir) => {
    let x = x0;
    for (const w of widths) {
      for (let k = 0; k < 3; k++) {
        const a = dir > 0 ? x : x - w;
        grat += `M${n2(a)} ${by0}h${w}v${CY + R - by0}h${-w}z`;
        x += dir * w * 2;
      }
      x += dir * 4;
    }
  };
  gratSide(CX + 72, 1);
  gratSide(CX - 72, -1);
  inC += `<path d="${grat}" fill="${C.black}"/>`;
  const cw = clockWidth(17);
  inC += `<rect x="${n2(CX - cw / 2 - 12)}" y="${by0 + 6}" width="${n2(cw + 24)}" height="31" fill="${C.black}" stroke="${C.white}" stroke-width="2"/>`;
  inC += clock(CX - cw / 2, by0 + 13, 17).svg;

  g += `<g clip-path="url(#circleClip)">${inC}</g>`;
  g += `<circle cx="${CX}" cy="${CY}" r="${R}" fill="none" stroke="${C.white}" stroke-width="4"/>`;
  return g;
}

// ------------------------------------------------------------------ phase 2: colour bars (15-24 s)
function colourBars() {
  let g = '';
  const bw = W / 7;
  const topH = 360;
  const castH = 45;
  BAR.forEach((c, i) => { g += `<rect x="${n2(i * bw)}" y="0" width="${n2(bw + 0.5)}" height="${topH}" fill="${c}"/>`; });
  const cast = [BAR[6], C.nearBlack, BAR[4], C.nearBlack, BAR[2], C.nearBlack, BAR[0]];
  cast.forEach((c, i) => { g += `<rect x="${n2(i * bw)}" y="${topH}" width="${n2(bw + 0.5)}" height="${castH}" fill="${c}"/>`; });
  const y2 = topH + castH;
  const h2 = H - y2;
  const seg = [
    [0, 1.25, C.minusI], [1.25, 2.5, '#ffffff'], [2.5, 3.75, C.plusQ], [3.75, 5, C.nearBlack],
    [5, 5 + 1 / 3, '#090909'], [5 + 1 / 3, 5 + 2 / 3, C.nearBlack], [5 + 2 / 3, 6, '#1d1d1d'], [6, 7, C.nearBlack],
  ];
  for (const [a, b, c] of seg) g += `<rect x="${n2(a * bw)}" y="${y2}" width="${n2((b - a) * bw + 0.5)}" height="${h2}" fill="${c}"/>`;
  // elapsed clock in the black under the green and magenta bars
  const cw = clockWidth(24);
  const ccx = 4.375 * bw;
  g += ptext('RUNNING TIME', ccx, y2 + 34, 2, { anchor: 'middle', fill: '#8a8a8a' });
  g += clock(ccx - cw / 2, y2 + 60, 24).svg;
  g += ptext('OF 10:00:00', ccx, y2 + 98, 2, { anchor: 'middle', fill: '#8a8a8a' });
  // the tone card, in the black under the blue bar
  const tx = 6.5 * bw;
  ['TONE:', '80 BPM', 'F MAJOR', 'NO SAMPLES'].forEach((l, i) => {
    g += ptext(l, tx, y2 + 30 + i * 22, 2, { anchor: 'middle', fill: i ? '#9a9a9a' : '#cfcfcf' });
  });

  // the ident box, hopping once a bar and counting bars as it goes
  const BW = 580;
  const BH = 182;
  const hops = [
    [[15, 18], 96, 46, '7 BARS OF COLOUR.'],
    [[18, 21], 330, 158, '20 BARS OF MUSIC, 3 SECONDS EACH.'],
    [[21, 24], 176, 108, '1 BAR OF SIGNAL: TOP OF THE PALM.'],
  ];
  for (const [win, x, y, line] of hops) {
    let b = `<rect x="${x}" y="${y}" width="${BW}" height="${BH}" fill="${C.black}"/>`;
    b += `<rect x="${x + 6}" y="${y + 6}" width="${BW - 12}" height="${BH - 12}" fill="none" stroke="#3c3c3c" stroke-width="2"/>`;
    b += ptext('SANDBAR TV · TEST TRANSMISSION', x + BW / 2, y + 22, 2, { anchor: 'middle', fill: '#9a9a9a' });
    b += vtext('CASTAWAY', x + BW / 2, y + 48, 56, { anchor: 'middle', sw: 1.7, tr: 2 });
    b += ptext(line, x + BW / 2, y + 124, 2, { anchor: 'middle', bold: true });
    b += ptext('NORMAL SERVICE HAS RESUMED. THIS IS IT.', x + BW / 2, y + 148, 2, { anchor: 'middle', fill: '#b4b4b4' });
    g += `<g class="${vis([win])}">${b}</g>`;
  }
  return g;
}

// ------------------------------------------------------------------ phase 3: snow, then NO SIGNAL (24-33 s)
function offAir() {
  let g = `<rect width="${W}" height="${H}" fill="${C.black}"/>`;
  // the OSD channel tag, top left, as the set shows it
  g += ptext('CH 1', 34, 30, 3, { bold: true, fill: '#7dff7d' });
  g += ptext('CASTAWAY', 34 + pixWidth('CH 1', 3, true) + 18, 37, 2, { bold: true, fill: '#7dff7d' });
  const BW = 440;
  const BH = 132;
  const meterIcon = (x, y, lit) => {
    let m = '';
    for (let i = 0; i < 4; i++) {
      const h = 15 + i * 6;
      const bx = x + i * 12;
      m += i < lit
        ? `<rect x="${bx}" y="${y + 33 - h}" width="8" height="${h}" fill="${C.white}"/>`
        : `<rect x="${bx + 1}" y="${y + 34 - h}" width="6" height="${h - 2}" fill="none" stroke="${C.white}" stroke-width="2" opacity="0.5"/>`;
    }
    return m;
  };
  const hops = [
    [[25, 27], 92, 104, 'NO SIGNAL', 0, ['SOURCE: ONE (1) ISLAND.', 'SHE IS FINE. SHE HAS COCONUTS.']],
    [[27, 30], 448, 330, 'NO SIGNAL', 0, ['THIS SET WILL WAIT 10 HOURS.', 'SO WILL SHE.']],
    [[30, 33], 420, 92, '1 BAR FOUND', 1, ['AT THE TOP OF THE PALM.', 'RESUMING THE ISLAND...']],
  ];
  for (const [win, x, y, title, lit, lines] of hops) {
    let b = `<rect x="${x}" y="${y}" width="${BW}" height="${BH}" rx="6" fill="${C.osdBlue}" stroke="${C.white}" stroke-width="3"/>`;
    b += ptext(title, x + 24, y + 24, 4, { bold: true });
    b += meterIcon(x + BW - 70, y + 18, lit);
    b += `<path d="M${x + 24} ${y + 70}H${x + BW - 24}" stroke="#6f86e6" stroke-width="2"/>`;
    b += ptext(lines[0], x + 24, y + 84, 2);
    if (lines[1]) b += ptext(lines[1], x + 24, y + 106, 2, { fill: '#c6d0ff' });
    g += `<g class="${vis([win])}">${b}</g>`;
  }
  // snow: one burst of noise between the card and the box. Six jumps in its one
  // second, soft grey-on-grey rather than hard black and white, so it reads as snow
  // without being a harsh full-frame flicker (and its average stays a steady grey).
  const r2 = mulberry32(7);
  const pts = [];
  for (let k = 0; k <= 6; k++) pts.push([24 + k / 6, -Math.round(r2() * 300), -Math.round(r2() * 220)]);
  const snowCls = move(pts.map(([t, x, y]) => [t, x, y]).concat([[LOOP, 0, 0]]), [0, 0]);
  g += `<g class="${vis([SNOW])}"><g class="${snowCls}"><rect x="0" y="0" width="${(W + 320) / 2}" height="${(H + 240) / 2}" transform="scale(2)" filter="url(#snow)"/></g></g>`;
  return g;
}

// ------------------------------------------------------------------ assemble
const card = testCard();
const bars = colourBars();
const off = offAir();

const defs = [];
defs.push(`<clipPath id="frameClip"><rect width="${W}" height="${H}" rx="14"/></clipPath>`);
defs.push(`<clipPath id="circleClip"><circle cx="${CX}" cy="${CY}" r="${R}"/></clipPath>`);
defs.push(`<clipPath id="picClip"><rect x="${CX - R}" y="${PIC_TOP}" width="${2 * R}" height="${PIC_BOT - PIC_TOP}"/></clipPath>`);
defs.push(`<clipPath id="ckw"><rect x="-1.6" y="-2.6" width="9" height="15"/></clipPath>`);
defs.push(`<linearGradient id="sky" x1="0" y1="${PIC_TOP}" x2="0" y2="${HORIZON}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${C.skyTop}"/><stop offset="0.65" stop-color="#5fb0e8"/><stop offset="1" stop-color="${C.skyLow}"/></linearGradient>`);
defs.push(`<linearGradient id="sea" x1="0" y1="${HORIZON}" x2="0" y2="${PIC_BOT}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${C.seaFar}"/><stop offset="0.45" stop-color="${C.seaMid}"/><stop offset="1" stop-color="${C.seaNear}"/></linearGradient>`);
defs.push(`<filter id="snow" x="0" y="0" width="1" height="1" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="0.95 0.42" numOctaves="2" seed="1992"/><feColorMatrix type="matrix" values="1 0 0 0 0 1 0 0 0 0 1 0 0 0 0 0 0 0 0 1"/><feComponentTransfer><feFuncR type="linear" slope="1.7" intercept="-0.33"/><feFuncG type="linear" slope="1.7" intercept="-0.33"/><feFuncB type="linear" slope="1.7" intercept="-0.33"/></feComponentTransfer></filter>`);
for (const [id, [ch, bold]] of usedPix) defs.push(`<path id="${id}" d="${bitmapPath(glyphRows(ch, bold))}"/>`);
for (const ch of usedVec) defs.push(`<path id="${vecId(ch)}" d="${VEC[ch][1]}"/>`);

const phCard = vis([CARD], 1);
const phBars = vis([BARS], 0);
const phOff = vis([OFF], 0);

const style = [
  '.vt{fill:none;stroke-linecap:square;stroke-linejoin:miter;stroke-miterlimit:2.2}',
  '.nod{animation:nod .75s step-end infinite}',
  '@keyframes nod{0%{transform:translateY(0)}50%{transform:translateY(.9px)}100%{transform:translateY(.9px)}}',
  '.tw1{animation:tw 1.5s step-end infinite}.tw2{animation:tw 1.5s step-end -.75s infinite}',
  '@keyframes tw{0%{opacity:.9}50%{opacity:.12}100%{opacity:.12}}',
  '.foam{animation:foam 3s step-end infinite}',
  '@keyframes foam{0%{stroke-dashoffset:0}50%{stroke-dashoffset:10}100%{stroke-dashoffset:10}}',
  `.drift{animation:drift ${LOOP}s steps(${LOOP}) infinite}`,
  '@keyframes drift{to{transform:translateX(14px)}}',
  ...css,
  ...keyframes,
  '@media (prefers-reduced-motion:reduce){*{animation:none!important}}',
].join('\n');

const title = 'CASTAWAY on Sandbar TV: a test card whose picture is a tiny island, then colour bars, then NO SIGNAL';
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${title}">
<title>${title}</title>
<style>
${style}
</style>
<defs>
${defs.join('\n')}
</defs>
<g clip-path="url(#frameClip)">
<g class="${phCard}">${card}</g>
<g class="${phBars}">${bars}</g>
<g class="${phOff}">${off}</g>
</g>
<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="13.5" fill="none" stroke="#000" stroke-opacity="0.35" stroke-width="2"/>
</svg>
`;

// ------------------------------------------------------------------ the divider: a strip of bars
function divider() {
  const w = 960;
  const bw = w / 7;
  let g = '';
  BAR.forEach((c, i) => { g += `<rect x="${n2(i * bw)}" y="0" width="${n2(bw + 0.5)}" height="14" fill="${c}"/>`; });
  const cast = [BAR[6], C.nearBlack, BAR[4], C.nearBlack, BAR[2], C.nearBlack, BAR[0]];
  cast.forEach((c, i) => { g += `<rect x="${n2(i * bw)}" y="14" width="${n2(bw + 0.5)}" height="3" fill="${c}"/>`; });
  const seg = [[0, 1.25, C.minusI], [1.25, 2.5, '#ffffff'], [2.5, 3.75, C.plusQ], [3.75, 7, C.nearBlack]];
  for (const [a, b, c] of seg) g += `<rect x="${n2(a * bw)}" y="17" width="${n2((b - a) * bw + 0.5)}" height="5" fill="${c}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} 22" width="${w}" height="22" role="img" aria-label="A thin strip of colour bars">
<title>A thin strip of colour bars</title>
<defs><clipPath id="r"><rect width="${w}" height="22" rx="4"/></clipPath></defs>
<g clip-path="url(#r)">${g}</g>
</svg>
`;
}

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, svg);
writeFileSync(OUT_BARS, divider());
console.log(`wrote ${OUT} (${(svg.length / 1024).toFixed(1)} KB)`);
console.log(`wrote ${OUT_BARS}`);
