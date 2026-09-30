#!/usr/bin/env node
// 28-flat-silhouette-intro_opus_5.5: the "Flat-Colour Silhouette Intro" README
// header for ULTRA-SATISFACTORY.
//
// The style is the early-90s Amiga intro that threw out chrome, starfields and
// copper bars and did graphic design instead (catalogue entry c64-10, the look
// Melon Dezign made famous): big fields of flat colour, band edges cut into
// stepped skylines with no outline between colours, heavy black capitals set
// on a wavy curve with a small offset shadow, slow concentric rings behind a
// solid black silhouette, and a tiny two-tone lower-case tag in a top corner.
// Nothing is copied from those intros: the crew tag is invented, and the
// letterforms, skylines, tower, machines and figure are all drawn in this file.
//
// Three screens, one idea each:
//   1. <slug>.svg          pink, mustard and green bands cut into a factory
//                          skyline, the name on two waves, a ring sun behind a
//                          black Space Elevator, a scroller riding a belt curve
//   2. <slug>-cubes.svg    140 turning cubes (one per craftable item), hue by
//                          row, with a tall cyan outlined wordmark up the side
//   3. <slug>-credits.svg  grey-blue field, two rules, bright green credits
//                          with dotted leaders
//
//   node 28-flat-silhouette-intro_opus_5.5.mjs                  regenerate all three (and the
//                                                               two text blocks in the .md)
//   node 28-flat-silhouette-intro_opus_5.5.mjs --txt            also print those text blocks
//   node 28-flat-silhouette-intro_opus_5.5.mjs --specimen=FILE  also write a type specimen
//
// Plain Node, no dependencies, no randomness: the output is byte-stable.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '28-flat-silhouette-intro_opus_5.5';
const ASSETS = path.join(HERE, '..', 'assets');
const OUT_MAIN = path.join(ASSETS, `${SLUG}.svg`);
const OUT_CUBES = path.join(ASSETS, `${SLUG}-cubes.svg`);
const OUT_CREDITS = path.join(ASSETS, `${SLUG}-credits.svg`);
const MD = path.join(HERE, '..', `${SLUG}.md`);

// ---------------------------------------------------------------- palette
// Few colours, used flat. Pink and mustard sit close to the app's own ITEMS
// pink and accent gold; the ring violet is its OBJECTIVES purple.
const INK = {
  pink: '#f24e9c',
  mustard: '#e9c53a',
  green: '#3cab58',
  violet: '#8a4bf0',
  orange: '#ff8a1f',
  black: '#0b0a0d',
  white: '#ffffff',
  cyan: '#00cfff',
  tabObj: '#c08bff',
  tabItm: '#ff6db3',
  tabBld: '#5ccbff',
  greyblue: '#5f7693',
  rule: '#a9bbd2',
  lime: '#9dff6a',
};

// ---------------------------------------------------------------- small helpers
const RAD = Math.PI / 180;
const f1 = (v) => String(Math.round(v * 10) / 10);
const f2 = (v) => String(Math.round(v * 100) / 100);
const pt = (x, y) => `${f1(x)} ${f1(y)}`;
const escXml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// ---------------------------------------------------------------- the big face
// A heavy geometric sans drawn for this header: every capital is a union of
// rectangles, horizontally cut diagonals and elliptical ring sectors. Cap
// height is 100 units, y grows downward, the baseline is y = 100. All solid
// subpaths run clockwise and counters run counter-clockwise, so the default
// nonzero fill rule unions the overlapping parts.
const CAP = 100;
const STEM = 24; // vertical stroke
const BAR = 20;  // horizontal stroke
const OV = 1.5;  // overshoot of round letters

const rect = (x, y, w, h) => `M${pt(x, y)}H${f1(x + w)}V${f1(y + h)}H${f1(x)}Z`;
function poly(pts) {
  let area = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[(i + 1) % pts.length];
    area += x0 * y1 - x1 * y0;
  }
  const p = area < 0 ? [...pts].reverse() : pts;
  return `M${p.map(([x, y]) => pt(x, y)).join('L')}Z`;
}
// A stroke with horizontal cuts: top edge [t0,t1] at yt, bottom edge [b0,b1] at yb.
const para = (t0, t1, b0, b1, yt = 0, yb = CAP) => poly([[t0, yt], [t1, yt], [b1, yb], [b0, yb]]);
// Elliptical ring sector from angle a0 to a1 (degrees, clockwise on screen, 0 = east).
function sector(cx, cy, rx, ry, a0, a1, tx = STEM, ty = BAR) {
  const rxi = rx - tx;
  const ryi = ry - ty;
  const P = (rX, rY, a) => [cx + rX * Math.cos(a * RAD), cy + rY * Math.sin(a * RAD)];
  const large = a1 - a0 > 180 ? 1 : 0;
  const o0 = P(rx, ry, a0), o1 = P(rx, ry, a1), i1 = P(rxi, ryi, a1), i0 = P(rxi, ryi, a0);
  return `M${pt(...o0)}A${f1(rx)} ${f1(ry)} 0 ${large} 1 ${pt(...o1)}L${pt(...i1)}A${f1(rxi)} ${f1(ryi)} 0 ${large} 0 ${pt(...i0)}Z`;
}
function ring(cx, cy, rx, ry, tx = STEM, ty = BAR) {
  const rxi = rx - tx;
  const ryi = ry - ty;
  return `M${pt(cx - rx, cy)}A${f1(rx)} ${f1(ry)} 0 1 1 ${pt(cx + rx, cy)}A${f1(rx)} ${f1(ry)} 0 1 1 ${pt(cx - rx, cy)}Z`
    + `M${pt(cx - rxi, cy)}A${f1(rxi)} ${f1(ryi)} 0 1 0 ${pt(cx + rxi, cy)}A${f1(rxi)} ${f1(ryi)} 0 1 0 ${pt(cx - rxi, cy)}Z`;
}
// A bowl hanging off a stem: flat top and bottom, half-round on the right.
function bowl(yT, yB, xr, x0 = 0) {
  const ro = (yB - yT) / 2;
  const xc = xr - ro;
  const rxi = ro - STEM;
  const ryi = ro - BAR;
  return `M${pt(x0, yT)}H${f1(xc)}A${f1(ro)} ${f1(ro)} 0 0 1 ${pt(xc, yB)}H${f1(x0)}Z`
    + `M${pt(x0 + STEM, yT + BAR)}V${f1(yB - BAR)}H${f1(xc)}A${f1(rxi)} ${f1(ryi)} 0 0 0 ${pt(xc, yT + BAR)}Z`;
}
const stem = (x = 0, y0 = 0, y1 = CAP) => rect(x, y0, STEM, y1 - y0);

const RY = 50 + OV; // vertical radius of a full-height round
const GLYPHS = {
  A: [96, para(32, 59, 0, 27) + para(37, 64, 69, 96) + rect(24, 62, 48, 19)],
  B: [80, stem() + bowl(0, 59.5, 72) + bowl(40.5, 100, 80)],
  C: [91, sector(51, 50, 51, RY, 40, 320, 25, BAR + OV)],
  D: [92, stem() + bowl(0, 100, 92)],
  E: [72, stem() + rect(0, 0, 70, BAR) + rect(0, 40, 62, BAR) + rect(0, 80, 72, BAR)],
  F: [68, stem() + rect(0, 0, 68, BAR) + rect(0, 41, 60, BAR)],
  G: [102, sector(51, 50, 51, RY, 0, 320, 25, BAR + OV) + poly([[56, 46], [101.8, 46], [102, 50], [99.4, 66], [56, 66]])],
  H: [88, stem() + stem(64) + rect(0, 40, 88, BAR)],
  I: [24, stem()],
  J: [64, stem(40, 0, 66) + sector(32, 66, 32, 35.5, 0, 152, STEM, BAR + OV)],
  K: [96, stem() + para(57, 88, 11, 42, 0, 62) + para(27, 58, 65, 96, 40, 100)],
  L: [66, stem() + rect(0, 80, 66, BAR)],
  M: [114, stem() + stem(90) + para(0, 30, 42, 72) + para(84, 114, 42, 72)],
  N: [92, stem() + stem(68) + para(0, 32, 60, 92)],
  O: [104, ring(52, 50, 52, RY, 25, BAR + OV)],
  P: [77, stem() + bowl(0, 60, 77)],
  Q: [106, ring(52, 50, 52, RY, 25, BAR + OV) + para(52, 80, 80, 108, 62, 106)],
  R: [86, stem() + bowl(0, 60, 77) + para(33, 61, 58, 86, 52, 100)],
  S: [78, sector(39, 29.5, 38, 31, 90, 324, STEM, 21) + sector(39, 70.5, 39, 31, 270, 504, STEM, 21)],
  T: [84, rect(0, 0, 84, BAR) + stem(30)],
  U: [90, stem(0, 0, 56) + stem(66, 0, 56) + sector(45, 55, 45, 46.5, 0, 180, STEM, BAR + OV)],
  V: [96, para(0, 29, 33.5, 62.5) + para(67, 96, 33.5, 62.5)],
  W: [138, para(0, 27, 23, 50) + para(55.5, 82.5, 23, 50) + para(55.5, 82.5, 88, 115) + para(111, 138, 88, 115)],
  X: [92, para(0, 31, 61, 92) + para(61, 92, 0, 31)],
  Y: [92, para(0, 30, 34, 58, 0, 58) + para(62, 92, 34, 58, 0, 58) + stem(34, 52)],
  Z: [84, rect(0, 0, 84, BAR) + rect(0, 80, 84, BAR) + para(50, 84, 0, 34)],
  0: [84, ring(42, 50, 42, RY, STEM, BAR + OV)],
  1: [50, stem(26) + poly([[26, 0], [26, 27], [0, 38], [0, 15]])],
  2: [78, sector(39, 31, 38, 32.5, 195, 400, STEM, BAR + OV) + poly([[52.5, 35.8], [70.9, 49], [34, 80], [34, 84], [0, 84], [0, 80]]) + rect(0, 80, 78, BAR)],
  3: [80, sector(38, 29.5, 38, 31, 205, 450, STEM, 21) + sector(38, 70.5, 41, 31, 270, 515, STEM, 21) + rect(24, 39.5, 16, 21)],
  4: [88, stem(54) + rect(0, 60, 88, BAR) + para(44, 74, 0, 30, 0, 64)],
  5: [80, rect(6, 0, 68, BAR) + stem(6, 0, 52) + sector(38, 68, 41, 33.5, 222, 512, STEM, BAR + OV)],
  6: [84, ring(42, 66, 42, 35.5, STEM, BAR + OV) + sector(42, 50, 42, RY, 170, 318, STEM, BAR + OV)],
  7: [80, rect(0, 0, 80, BAR) + para(48, 80, 12, 42)],
  8: [82, ring(41, 29.5, 37, 31, STEM, 21) + ring(41, 70.5, 41, 31, STEM, 21)],
  9: [84, ring(42, 34, 42, 35.5, STEM, BAR + OV) + sector(42, 50, 42, RY, -10, 138, STEM, BAR + OV)],
  '.': [24, rect(0, 76, 24, 24)],
  ',': [24, rect(0, 76, 24, 24) + para(6, 24, 0, 14, 99, 120)],
  ':': [24, rect(0, 76, 24, 24) + rect(0, 28, 24, 24)],
  '!': [24, poly([[0, 0], [24, 0], [21, 66], [3, 66]]) + rect(0, 76, 24, 24)],
  '?': [70, sector(35, 31, 35, 32.5, 195, 450, STEM, BAR + OV) + rect(23, 46, 24, 20) + rect(23, 76, 24, 24)],
  "'": [24, poly([[0, 0], [24, 0], [18, 36], [6, 36]])],
  '-': [44, rect(0, 41, 44, BAR)],
  '/': [58, para(32, 58, 0, 26)],
  '+': [64, rect(0, 40, 64, BAR) + rect(21, 18, 22, 64)],
  // The separator: a hex nut, a nod to the app's hexagon-and-cog emblem.
  '*': [78, poly([0, 60, 120, 180, 240, 300].map((a) => [39 + 39 * Math.cos(a * RAD), 50 + 39 * Math.sin(a * RAD)]))
    + `M${pt(25, 50)}A14 14 0 1 0 ${pt(53, 50)}A14 14 0 1 0 ${pt(25, 50)}Z`],
};
const SPACE_W = 40;
const TRACK = 9;
const KERN = {
  LT: -11, TA: -16, AT: -16, FA: -14, RY: -6, AC: -5, CT: -3, TO: -6, OR: -2, AY: -18, YA: -18,
  AV: -18, VA: -18, LY: -16, PA: -12, TY: -2, RA: -3, LV: -14, AW: -12, WA: -12, 'Y.': -14, 'P.': -14,
  'T.': -12, 'T,': -12, 'Y,': -14, 'F.': -12, 'V.': -14, 'V,': -14, LO: -4, KO: -6, TT: -2, 'T-': -8, '-T': -8,
  'L-': -6, "L'": -14, '1.': -2, 'A-': -4, '-S': -2, AU: -3, UA: -3, OA: -5, AO: -5, DA: -5, AG: -5,
};
const glyphW = (ch) => (ch === ' ' ? SPACE_W : GLYPHS[ch][0]);
const gid = (ch) => `g${ch.codePointAt(0).toString(36)}`;
const usedGlyphs = new Set();
function need(ch) {
  if (!GLYPHS[ch]) throw new Error(`big face: no glyph for ${JSON.stringify(ch)}`);
  usedGlyphs.add(ch);
  return gid(ch);
}
const glyphDefs = () => [...usedGlyphs].map((ch) => `<path id="${gid(ch)}" d="${GLYPHS[ch][1]}"/>`).join('');

// Centre offsets (font units) of each character of a line, plus the line's total width.
function measure(str) {
  const chars = [...str];
  const out = [];
  let x = 0;
  chars.forEach((ch, i) => {
    const w = glyphW(ch);
    out.push({ ch, c: x + w / 2, w });
    const k = KERN[ch + (chars[i + 1] || '')] || 0;
    x += w + TRACK + k;
  });
  return { chars: out, width: x - TRACK };
}

// ---------------------------------------------------------------- curves
// A curve is y = f(x). sampleCurve walks it and returns a lookup from arc
// length (measured from x0, going right) to position and tangent angle.
function sampleCurve(f, x0, x1, step = 0.5) {
  const pts = [];
  let len = 0;
  let px = x0, py = f(x0);
  pts.push([0, px, py]);
  for (let x = x0 + step; x <= x1 + 1e-9; x += step) {
    const y = f(x);
    len += Math.hypot(x - px, y - py);
    pts.push([len, x, y]);
    px = x; py = y;
  }
  return {
    length: len,
    at(s) {
      let lo = 0, hi = pts.length - 1;
      const sc = Math.max(0, Math.min(len, s));
      while (hi - lo > 1) {
        const mid = (lo + hi) >> 1;
        if (pts[mid][0] <= sc) lo = mid; else hi = mid;
      }
      const [s0, xa, ya] = pts[lo];
      const [s1, xb, yb] = pts[hi];
      const t = s1 > s0 ? (sc - s0) / (s1 - s0) : 0;
      return { x: xa + (xb - xa) * t, y: ya + (yb - ya) * t, ang: Math.atan2(yb - ya, xb - xa) / RAD };
    },
  };
}

// Letters of `str` centred on cx, riding the curve f, each turned to the tangent.
function setOnCurve(str, f, cx, scale) {
  const m = measure(str);
  const total = m.width * scale;
  const curve = sampleCurve(f, cx - total, cx + total);
  // find the arc position of x = cx, then start half the text length before it
  let lo = 0, hi = curve.length;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (curve.at(mid).x < cx) lo = mid; else hi = mid;
  }
  const s0 = lo - total / 2;
  return m.chars.filter((c) => c.ch !== ' ').map((c) => ({ ...c, ...curve.at(s0 + c.c * scale) }));
}
const glyphAt = (g, scale, extra = '') =>
  `<use href="#${need(g.ch)}" transform="translate(${f1(g.x)} ${f1(g.y)}) rotate(${f1(g.ang)}) scale(${f2(scale)}) translate(${f1(-g.w / 2)} -50)"${extra}/>`;

// ---------------------------------------------------------------- the small face
// 5x7 pixel capitals and lower case with 2-row descenders. Rows top to bottom.
const F5 = {
  A: '.###.|#...#|#...#|#####|#...#|#...#|#...#',
  B: '####.|#...#|#...#|####.|#...#|#...#|####.',
  C: '.###.|#...#|#....|#....|#....|#...#|.###.',
  D: '###..|#..#.|#...#|#...#|#...#|#..#.|###..',
  E: '#####|#....|#....|####.|#....|#....|#####',
  F: '#####|#....|#....|####.|#....|#....|#....',
  G: '.###.|#...#|#....|#.###|#...#|#...#|.####',
  H: '#...#|#...#|#...#|#####|#...#|#...#|#...#',
  I: '.###.|..#..|..#..|..#..|..#..|..#..|.###.',
  J: '..###|...#.|...#.|...#.|...#.|#..#.|.##..',
  K: '#...#|#..#.|#.#..|##...|#.#..|#..#.|#...#',
  L: '#....|#....|#....|#....|#....|#....|#####',
  M: '#...#|##.##|#.#.#|#.#.#|#...#|#...#|#...#',
  N: '#...#|#...#|##..#|#.#.#|#..##|#...#|#...#',
  O: '.###.|#...#|#...#|#...#|#...#|#...#|.###.',
  P: '####.|#...#|#...#|####.|#....|#....|#....',
  Q: '.###.|#...#|#...#|#...#|#.#.#|#..#.|.##.#',
  R: '####.|#...#|#...#|####.|#.#..|#..#.|#...#',
  S: '.####|#....|#....|.###.|....#|....#|####.',
  T: '#####|..#..|..#..|..#..|..#..|..#..|..#..',
  U: '#...#|#...#|#...#|#...#|#...#|#...#|.###.',
  V: '#...#|#...#|#...#|#...#|#...#|.#.#.|..#..',
  W: '#...#|#...#|#...#|#.#.#|#.#.#|#.#.#|.#.#.',
  X: '#...#|#...#|.#.#.|..#..|.#.#.|#...#|#...#',
  Y: '#...#|#...#|.#.#.|..#..|..#..|..#..|..#..',
  Z: '#####|....#|...#.|..#..|.#...|#....|#####',
  a: '.....|.....|.###.|....#|.####|#...#|.####',
  b: '#....|#....|#.##.|##..#|#...#|#...#|####.',
  c: '.....|.....|.###.|#....|#....|#...#|.###.',
  d: '....#|....#|.##.#|#..##|#...#|#...#|.####',
  e: '.....|.....|.###.|#...#|#####|#....|.###.',
  f: '..##.|.#..#|.#...|###..|.#...|.#...|.#...',
  g: '.....|.....|.####|#...#|#...#|#...#|.####|....#|.###.',
  h: '#....|#....|#.##.|##..#|#...#|#...#|#...#',
  i: '..#..|.....|.##..|..#..|..#..|..#..|.###.',
  j: '...#.|.....|..##.|...#.|...#.|...#.|...#.|#..#.|.##..',
  k: '#....|#....|#..#.|#.#..|##...|#.#..|#..#.',
  l: '.##..|..#..|..#..|..#..|..#..|..#..|.###.',
  m: '.....|.....|##.#.|#.#.#|#.#.#|#.#.#|#...#',
  n: '.....|.....|#.##.|##..#|#...#|#...#|#...#',
  o: '.....|.....|.###.|#...#|#...#|#...#|.###.',
  p: '.....|.....|####.|#...#|#...#|#...#|####.|#....|#....',
  q: '.....|.....|.####|#...#|#...#|#...#|.####|....#|....#',
  r: '.....|.....|#.##.|##..#|#....|#....|#....',
  s: '.....|.....|.####|#....|.###.|....#|####.',
  t: '.#...|.#...|###..|.#...|.#...|.#..#|..##.',
  u: '.....|.....|#...#|#...#|#...#|#..##|.##.#',
  v: '.....|.....|#...#|#...#|#...#|.#.#.|..#..',
  w: '.....|.....|#...#|#...#|#.#.#|#.#.#|.#.#.',
  x: '.....|.....|#...#|.#.#.|..#..|.#.#.|#...#',
  y: '.....|.....|#...#|#...#|#...#|#...#|.####|....#|.###.',
  z: '.....|.....|#####|...#.|..#..|.#...|#####',
  0: '.###.|#...#|#..##|#.#.#|##..#|#...#|.###.',
  1: '..#..|.##..|..#..|..#..|..#..|..#..|.###.',
  2: '.###.|#...#|....#|...#.|..#..|.#...|#####',
  3: '#####|...#.|..#..|...#.|....#|#...#|.###.',
  4: '...#.|..##.|.#.#.|#..#.|#####|...#.|...#.',
  5: '#####|#....|####.|....#|....#|#...#|.###.',
  6: '..##.|.#...|#....|####.|#...#|#...#|.###.',
  7: '#####|....#|...#.|..#..|.#...|.#...|.#...',
  8: '.###.|#...#|#...#|.###.|#...#|#...#|.###.',
  9: '.###.|#...#|#...#|.####|....#|...#.|.##..',
  '.': '.....|.....|.....|.....|.....|.##..|.##..',
  ',': '.....|.....|.....|.....|.....|.##..|.##..|..#..|.#...',
  ':': '.....|.##..|.##..|.....|.##..|.##..|.....',
  '!': '..#..|..#..|..#..|..#..|..#..|.....|..#..',
  '?': '.###.|#...#|....#|...#.|..#..|.....|..#..',
  '-': '.....|.....|.....|.###.|.....|.....|.....',
  '+': '.....|..#..|..#..|#####|..#..|..#..|.....',
  '/': '....#|....#|...#.|..#..|.#...|#....|#....',
  '(': '...#.|..#..|.#...|.#...|.#...|..#..|...#.',
  ')': '.#...|..#..|...#.|...#.|...#.|..#..|.#...',
  "'": '..#..|..#..|.#...|.....|.....|.....|.....',
  '&': '.##..|#..#.|#.#..|.#...|#.#.#|#..#.|.##.#',
  '=': '.....|.....|#####|.....|#####|.....|.....',
  '>': '.#...|..#..|...#.|....#|...#.|..#..|.#...',
  '·': '.....|.....|.....|..#..|.....|.....|.....',
};
// Rows of '#' into one path of merged rectangles (runs merged vertically too).
function bitmapPath(rows, ox = 0, oy = 0, s = 1) {
  const rects = [];
  let open = new Map();
  rows.forEach((row, y) => {
    const next = new Map();
    for (let x = 0; x < row.length;) {
      if (row[x] !== '#') { x++; continue; }
      let x2 = x;
      while (x2 < row.length && row[x2] === '#') x2++;
      const key = `${x},${x2 - x}`;
      const rc = open.get(key) || (rects.push({ x, y, w: x2 - x, h: 0 }), rects[rects.length - 1]);
      rc.h++;
      next.set(key, rc);
      x = x2;
    }
    open = next;
  });
  return rects.map((r) => `M${f1(ox + r.x * s)} ${f1(oy + r.y * s)}h${f1(r.w * s)}v${f1(r.h * s)}h${f1(-r.w * s)}z`).join('');
}
function makePixelFont(prefix) {
  const used = new Map();
  const ADV = 6;
  const id = (ch) => {
    const rows = F5[ch];
    if (rows === undefined) throw new Error(`small face: no glyph for ${JSON.stringify(ch)}`);
    const key = prefix + ch.codePointAt(0).toString(36);
    if (!used.has(key)) used.set(key, bitmapPath(rows.split('|')));
    return key;
  };
  const width = (str) => [...str].length * ADV - 1;
  // One run at pixel size `s`, top-left at (x, y).
  const run = (str, x, y, s, fill) => {
    let out = `<g transform="translate(${f1(x)} ${f1(y)}) scale(${f2(s)})"${fill ? ` fill="${fill}"` : ''}>`;
    let cx = 0;
    for (const ch of str) {
      if (ch !== ' ') out += `<use href="#${id(ch)}"${cx ? ` x="${cx}"` : ''}/>`;
      cx += ADV;
    }
    return `${out}</g>`;
  };
  // Several coloured runs on one line: [[str, fill], ...]; align is 'l', 'c' or 'r' about x.
  const line = (parts, x, y, s, align = 'l') => {
    const total = parts.reduce((n, [str]) => n + [...str].length * ADV, 0) - 1;
    let cx = align === 'c' ? x - (total * s) / 2 : align === 'r' ? x - total * s : x;
    let out = '';
    for (const [str, fill] of parts) {
      if (str.trim()) out += run(str, cx, y, s, fill);
      cx += [...str].length * ADV * s;
    }
    return out;
  };
  const defs = () => [...used].map(([key, d]) => `<path id="${key}" d="${d}"/>`).join('');
  return { ADV, width, run, line, defs };
}

// ================================================================ screen 1: the intro
const W = 1200;
const H = 660;
const FAR_BASE = 252;   // where the mustard band starts
const NEAR_BASE = 426;  // where the green band starts
const GROUND = 574;     // top of the black ground strip
const SUN = { x: 1016, y: 196, r: 158 };
const TOWER_W = 44;     // the Space Elevator's shaft where the scroller passes behind it

// ---- band edges: stepped skylines, [width, height above the band's base]
const FAR_STEPS = [
  [26, 0],
  // smelter hall with twin stacks
  [10, 24], [40, 46], [8, 58], [12, 118], [8, 58], [14, 46], [12, 96], [8, 46], [30, 34],
  [34, 0],
  // long hall, stepped saw-tooth roof
  [16, 30], [14, 44], [22, 36], [14, 50], [22, 42], [14, 56], [22, 48], [14, 62], [30, 54], [12, 30],
  [40, 0],
  // tank
  [8, 40], [8, 58], [44, 68], [8, 58], [8, 40],
  [22, 12],
  // mast
  [20, 50], [16, 78], [5, 132], [16, 78], [20, 50],
  [46, 0],
  // refinery ziggurat with two pipes
  [18, 22], [18, 40], [18, 58], [40, 74], [10, 100], [14, 74], [10, 112], [22, 74], [18, 58], [18, 40], [18, 22],
  [36, 0],
  // conveyor lift
  [14, 14], [14, 26], [14, 38], [14, 50], [14, 62], [14, 74], [50, 86], [12, 60], [30, 40],
  [44, 0],
  // silo row
  [6, 30], [26, 52], [6, 30], [26, 52], [6, 30], [26, 52], [6, 30], [26, 52], [6, 30],
  [30, 8],
  // the big stack
  [24, 36], [6, 70], [14, 140], [6, 70], [40, 36], [10, 60], [30, 36],
];
const NEAR_STEPS = [
  [50, 0],
  // assembler: body with three hoppers
  [12, 18], [20, 40], [14, 56], [20, 40], [14, 56], [20, 40], [12, 18],
  [60, 6],
  // tank
  [6, 20], [6, 34], [36, 42], [6, 34], [6, 20],
  [44, 6],
  // constructor with a vent pipe
  [50, 34], [8, 62], [24, 34], [16, 20],
  [70, 0],
  // lift and gantry
  [16, 10], [16, 20], [16, 30], [16, 40], [60, 50], [8, 70], [20, 50], [16, 28],
  [90, 6],
  // twin tanks
  [6, 18], [30, 36], [10, 18], [30, 36], [6, 18],
  [64, 0],
  // foundry
  [14, 16], [30, 30], [10, 44], [40, 58], [10, 44], [12, 66], [10, 44], [30, 30], [14, 16],
  [80, 6],
  // packager row
  [22, 26], [8, 14], [22, 26], [8, 14], [22, 26], [8, 14], [22, 26],
  [60, 0],
];
// Two periods of a skyline, so it can slide left by one period and loop.
function skyline(steps, base) {
  const period = steps.reduce((n, [w]) => n + w, 0);
  if (period < W) throw new Error(`skyline narrower than the frame: ${period}`);
  let d = `M0 ${H + 2}`;
  for (let rep = 0; rep < 2; rep++) for (const [w, h] of steps) d += `V${base - h}h${w}`;
  return { d: `${d}V${H + 2}Z`, period };
}

// ---- the scroller, and the wave it rides (quarter-sine cubics, right to left)
const SCROLL_PARTS = [
  'STENCIL SHIFT PRESENTS',
  'ULTRA-SATISFACTORY',
  'EVERY RECIPE, BUILDING AND SPACE ELEVATOR OBJECTIVE, ONE CLICK APART',
  '140 ITEMS. 211 RECIPES. 477 BUILDINGS. 0 GRADIENTS',
  'NO CHROME. NO STARFIELD. NO COPPER BARS, ONLY COPPER INGOTS: 30 A MINUTE PER SMELTER',
  'THIS IS NOT A SCROLLER, IT IS A CONVEYOR BELT FOR WORDS',
  'MANIFOLD PEOPLE AND LOAD BALANCER PEOPLE MAY SHARE THIS TAB IN PEACE',
  "PROTECTION: NONE. IT'S APACHE 2.0",
  'UNOFFICIAL FAN PROJECT, NOT AFFILIATED WITH COFFEE STAIN STUDIOS',
];
const SCROLL_TEXT = SCROLL_PARTS.map((s) => `${s}  *  `).join('');
const SCR = { y: 480, amp: 17, lambda: 560, xL: -100, quarters: 10, scale: 0.44, speed: 120 };
function buildScrollPath() {
  const q4 = SCR.lambda / 4;
  const k1 = (0.5122 * SCR.lambda) / (2 * Math.PI);
  const k2 = (1.0024 * SCR.lambda) / (2 * Math.PI);
  const Y = (v) => SCR.y - SCR.amp * v;
  const segs = []; // left to right: [P0, P1, P2, P3]
  for (let q = 0; q < SCR.quarters; q++) {
    const x0 = SCR.xL + q * q4;
    const sgn = q % 4 < 2 ? 1 : -1;
    segs.push(q % 2 === 0
      ? [[x0, Y(0)], [x0 + k1, Y(sgn * 0.5122)], [x0 + k2, Y(sgn)], [x0 + q4, Y(sgn)]]
      : [[x0, Y(sgn)], [x0 + q4 - k2, Y(sgn)], [x0 + q4 - k1, Y(sgn * 0.5122)], [x0 + q4, Y(0)]]);
  }
  const xR = SCR.xL + SCR.quarters * q4;
  const yR = segs[segs.length - 1][3][1];
  // polyline table, right to left, for arc length and for the still frame
  const table = [[0, xR, yR]];
  let len = 0;
  for (let q = segs.length - 1; q >= 0; q--) {
    const [p0, p1, p2, p3] = segs[q];
    for (let i = 1; i <= 80; i++) {
      const t = 1 - i / 80;
      const a = (1 - t) ** 3, b = 3 * (1 - t) ** 2 * t, c = 3 * (1 - t) * t * t, e = t ** 3;
      const x = a * p0[0] + b * p1[0] + c * p2[0] + e * p3[0];
      const y = a * p0[1] + b * p1[1] + c * p2[1] + e * p3[1];
      const prev = table[table.length - 1];
      len += Math.hypot(x - prev[1], y - prev[2]);
      table.push([len, x, y]);
    }
  }
  let d = `M${pt(xR, yR)}`;
  for (let q = segs.length - 1; q >= 0; q--) {
    const [p0, p1, p2] = segs[q];
    d += `C${pt(...p2)} ${pt(...p1)} ${pt(...p0)}`;
  }
  const at = (s) => {
    let lo = 0, hi = table.length - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (table[mid][0] <= s) lo = mid; else hi = mid;
    }
    const [s0, xa, ya] = table[lo];
    const [s1, xb, yb] = table[hi];
    const t = (s - s0) / (s1 - s0);
    return { x: xa + (xb - xa) * t, y: ya + (yb - ya) * t, ang: Math.atan2(yb - ya, xb - xa) / RAD + 180 };
  };
  // arc length at which the path crosses a given x
  const sAtX = (x) => table.find((row) => row[1] <= x)[0];
  return { d, waveLen: len, at, sAtX };
}

// The two-tone crew tag: lower case in a small box, half white on black, half black on white.
function crewTag(px, x, y, s, extra = '') {
  const pad = 3.2 * s;
  const wa = px.width('stencil') * s + pad * 2;
  const wb = px.width('shift') * s + pad * 2;
  const h = 7 * s + pad * 2 - s * 0.4;
  let out = `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(wa)}" height="${f1(h)}" fill="${INK.black}"/>`
    + `<rect x="${f1(x + wa)}" y="${f1(y)}" width="${f1(wb)}" height="${f1(h)}" fill="${INK.white}"/>`
    + px.run('stencil', x + pad, y + pad, s, INK.white) + px.run('shift', x + wa + pad, y + pad, s, INK.black);
  if (extra) out += px.run(extra, x + wa + wb + 5.6 * s, y + pad, s, INK.black);
  return out;
}

function buildMain() {
  usedGlyphs.clear();
  const px = makePixelFont('p');
  const K = INK.black;
  let body = '';

  // ---- sky and the ring sun (SMIL, with a still copy for reduced motion).
  // Discs are stacked large to small in alternating colours and every one grows
  // by a full colour pair per loop, so disc k ends exactly where disc k + 2
  // began. One more disc is born in the centre at half time to close the loop.
  body += `<rect width="${W}" height="${H}" fill="${INK.pink}"/>`;
  const PAIR = 64, RING_DUR = 10, RINGS = 7;
  let live = '', still = '';
  for (let k = RINGS - 1; k >= 0; k--) {
    const fill = k % 2 === 0 ? INK.orange : INK.violet;
    const r0 = (k * PAIR) / 2, r1 = ((k + 2) * PAIR) / 2;
    live += `<circle r="${r0}" fill="${fill}"><animate attributeName="r" from="${r0}" to="${r1}" dur="${RING_DUR}s" repeatCount="indefinite"/></circle>`;
    still += `<circle r="${f1(r0 + PAIR * 0.4)}" fill="${fill}"/>`;
  }
  live += `<circle r="0" fill="${INK.violet}"><animate attributeName="r" values="0;0;${PAIR / 2}" keyTimes="0;.5;1" dur="${RING_DUR}s" repeatCount="indefinite"/></circle>`;
  body += `<g clip-path="url(#sun)" transform="translate(${SUN.x} ${SUN.y})"><g class="am">${live}</g><g class="rm">${still}</g></g>`;

  // ---- the two sliding bands
  const far = skyline(FAR_STEPS, FAR_BASE);
  const near = skyline(NEAR_STEPS, NEAR_BASE);
  body += `<path class="s1" fill="${INK.mustard}" d="${far.d}"/><path class="s2" fill="${INK.green}" d="${near.d}"/>`;

  // ---- the name, on two waves
  const SH = 7; // shadow offset
  const lines = [
    { str: 'ULTRA', cx: 424, scale: 1.3, f: (x) => 151 - 15 * Math.sin((2 * Math.PI * (x - 30)) / 1040) },
    { str: 'SATISFACTORY', cx: 452, scale: 0.78, f: (x) => 307 + 13 * Math.sin((2 * Math.PI * (x - 120)) / 700) },
  ];
  for (const ln of lines) {
    for (const g of setOnCurve(ln.str, ln.f, ln.cx, ln.scale)) {
      const delay = f2(-(g.x / 1200) * 5);
      body += `<g class="b" style="animation-delay:${delay}s">${glyphAt({ ...g, x: g.x + SH, y: g.y + SH }, ln.scale, ' class="sh"')}${glyphAt(g, ln.scale)}</g>`;
    }
  }

  // ---- the scroller
  const sp = buildScrollPath();
  const m = measure(SCROLL_TEXT);
  const L = (m.width + TRACK) * SCR.scale;
  if (L <= sp.waveLen + 200) throw new Error('scroll text shorter than the visible path');
  const D = Math.round(L / SCR.speed);
  const pathD = `${sp.d}H${f1(SCR.xL - (L - sp.waveLen))}`;
  // Every letter rides the same path for the same D seconds and only its start
  // time differs, so the text flows along a curve that stays put. `phi` is how
  // far along the path the first letter is at time 0: it is chosen so the gap
  // after the first hex nut reaches the tower's shaft a moment after loading,
  // and the opening line reads clean: "STENCIL SHIFT PRESENTS".
  const live0 = m.chars.filter((c) => c.ch !== ' ');
  const nut = live0.findIndex((c) => c.ch === '*');
  const gap = (live0[nut].c + live0[nut].w / 2 + live0[nut + 1].c - live0[nut + 1].w / 2) / 2;
  const phi = sp.sAtX(SUN.x) + gap * SCR.scale - 40;
  const symDefs = new Map();
  let moving = '', parked = '';
  for (const c of m.chars) {
    if (c.ch === ' ') continue;
    const sid = `s${gid(c.ch).slice(1)}`;
    if (!symDefs.has(sid)) {
      const tr = `scale(${SCR.scale}) translate(${f1(-c.w / 2)} -50)`;
      symDefs.set(sid, `<g id="${sid}"><use href="#${need(c.ch)}" class="sh" transform="translate(3 3) ${tr}"/><use href="#${need(c.ch)}" transform="${tr}"/></g>`);
    }
    const dist = (((phi - c.c * SCR.scale) % L) + L) % L;
    const begin = String(Math.round(-(dist / L) * D * 1000) / 1000);
    moving += `<use href="#${sid}"><animateMotion dur="${D}s" begin="${begin}s" repeatCount="indefinite" rotate="auto-reverse"><mpath href="#sp"/></animateMotion></use>`;
    if (dist < sp.waveLen) {
      const p = sp.at(dist);
      parked += `<use href="#${sid}" transform="translate(${f1(p.x)} ${f1(p.y)}) rotate(${f1(p.ang)})"/>`;
    }
  }
  body += `<g class="am">${moving}</g><g class="rm">${parked}</g>`;

  // ---- black silhouettes: the Space Elevator, the ground and what stands on it
  const cx = SUN.x;
  const tower = [
    [6, -10, 36], [16, 36, 118], [52, 118, 126], [30, 126, 254], [72, 254, 262], [TOWER_W, 262, 398], [104, 398, 408],
    [TOWER_W, 408, 522], [88, 522, 535], [136, 535, 548], [196, 548, 561], [270, 561, GROUND + 1],
  ].map(([w, y0, y1]) => rect(cx - w / 2, y0, w, y1 - y0)).join('');
  // the pod that climbs the tether: hidden inside the shaft, seen on the spire
  body += `<g class="pod" fill="${K}"><path d="${rect(cx - 14, 0, 28, 14)}${rect(cx - 8, -5, 16, 24)}"/></g>`;
  const fg = [
    rect(0, GROUND, W, H - GROUND + 2),
    // constructor
    rect(34, 540, 112, 36), rect(50, 530, 52, 12), rect(114, 528, 12, 14),
    // belt on stilts
    rect(140, 552, 300, 6), rect(196, 556, 6, 20), rect(266, 556, 6, 20), rect(336, 556, 6, 20),
    // assembler
    rect(424, 536, 96, 40), rect(438, 528, 30, 10), rect(480, 530, 26, 8),
    // storage boxes (full of screws, presumably)
    rect(548, 552, 40, 24), rect(592, 552, 40, 24), rect(570, 530, 40, 20),
    // smelter with its stack
    rect(738, 542, 110, 34), rect(756, 534, 58, 10), rect(822, 528, 14, 16), rect(819, 525, 20, 5),
    // shed right of the tower
    rect(1176, 548, 30, 28),
  ].join('');
  // the shift supervisor and the clipboard
  const FIGURE = [
    '...####.....',
    '..######....',
    '.########...',
    '..#####.....',
    '..#####.....',
    '...###......',
    '..#####.....',
    '.#######.###',
    '.###########',
    '.#######.###',
    '.#######....',
    '..#####.....',
    '..#####.....',
    '..##.##.....',
    '..##.##.....',
    '.###.###....',
  ];
  const figure = bitmapPath(FIGURE, 668, GROUND - FIGURE.length * 2.75, 2.75);
  // parts riding the belt: they leave the constructor and vanish into the assembler
  let parts = '';
  for (let i = 0; i < 5; i++) parts += rect(132 + i * 60, 540, 12, 12);
  body += `<g fill="${K}"><path d="${tower}${fg}${figure}"/><path class="pt" d="${parts}"/></g>`;

  // ---- the two-tone tag, top left
  body += crewTag(px, 30, 24, 2.5, 'proudly presents');

  // ---- small print on the ground strip
  const GREY = '#8d8a94';
  body += px.line([['every recipe, building and space elevator objective, one click apart', INK.white]], 30, 592, 2.5)
    + px.line([['objectives', INK.tabObj], [' / ', GREY], ['items', INK.tabItm], [' / ', GREY], ['buildings', INK.tabBld]], 30, 622, 2.5)
    + px.line([['lukexyz.github.io/ULTRA-SATISFACTORY', INK.mustard]], W - 30, 622, 2.5, 'r');

  const css = [
    '.sh{fill:#000;fill-opacity:.26}',
    '.rm{display:none}',
    `.s1{animation:s1 ${Math.round(far.period / 11)}s linear infinite}.s2{animation:s2 ${Math.round(near.period / 19)}s linear infinite}`,
    `@keyframes s1{to{transform:translateX(-${far.period}px)}}@keyframes s2{to{transform:translateX(-${near.period}px)}}`,
    '.b{animation:b 5s ease-in-out infinite}',
    '@keyframes b{0%,100%{transform:translateY(-3.5px)}50%{transform:translateY(3.5px)}}',
    '.pod{animation:pod 12s linear infinite}',
    '@keyframes pod{from{transform:translateY(236px)}to{transform:translateY(-40px)}}',
    '.pt{animation:pt 2.4s linear infinite}',
    '@keyframes pt{to{transform:translateX(60px)}}',
    '@media (prefers-reduced-motion:reduce){*{animation:none!important}.am{display:none}.rm{display:inline}}',
  ].join('');
  const label = 'ULTRA-SATISFACTORY: a flat-colour Amiga-style intro. Heavy black capitals spell ULTRA SATISFACTORY on two waves across hot pink, mustard and green bands cut into stepped factory skylines, with a Space Elevator silhouette in front of a sun of orange and violet rings.';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${escXml(label)}">`
    + `<title>${escXml(label)}</title><style>${css}</style>`
    + `<defs><clipPath id="fr"><rect width="${W}" height="${H}" rx="14"/></clipPath>`
    + `<clipPath id="sun"><circle r="${SUN.r}"/></clipPath><path id="sp" d="${pathD}"/>`
    + `${glyphDefs()}${[...symDefs.values()].join('')}${px.defs()}</defs>`
    + `<g clip-path="url(#fr)">${body}</g></svg>`;
}

// ================================================================ screen 2: the cube grid
// 140 identical cubes, one per craftable item in the app, hue by row, all
// turning about their vertical axes in a diagonal wave. A cube is four flat
// polygons whose points SMIL interpolates between 15-degree keyframes; half a
// turn is one seamless loop because opposite faces share a shade.
function hsl(h, s, l) {
  const a = (s / 100) * Math.min(l / 100, 1 - l / 100);
  const ch = (k0) => {
    const k = (k0 + h / 30) % 12;
    return Math.round(255 * (l / 100 - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)))).toString(16).padStart(2, '0');
  };
  return `#${ch(0)}${ch(8)}${ch(4)}`;
}
function buildCubes() {
  usedGlyphs.clear();
  const px = makePixelFont('p');
  const CW = 1200, CH = 450;
  const COLS = 20, ROWS = 7, PITCH = 50, VPITCH = 58, SIZE = 16, PHI = 35 * RAD, PHASES = 8, TURN = 9;
  const GX = 172, GY = (CH - ROWS * VPITCH) / 2;
  const HUES = [345, 22, 47, 128, 183, 214, 268];

  // screen-space corners of the cube at turn angle theta (degrees)
  const corners = (theta) => [0, 1, 2, 3].map((j) => {
    const b = (theta + 45 + 90 * j) * RAD;
    const x = Math.SQRT2 * Math.cos(b) * SIZE;
    const z = Math.SQRT2 * Math.sin(b);
    return { x, top: (-Math.cos(PHI) + z * Math.sin(PHI)) * SIZE, bot: (Math.cos(PHI) + z * Math.sin(PHI)) * SIZE };
  });
  const P = (x, y) => `${f1(x)},${f1(y)}`;
  // the four polygons at angle theta; `late` picks which corners play left, right and lit face
  const polys = (theta, late) => {
    const c = corners(theta);
    const [l, r] = late ? [0, 2] : [1, 3];
    const [a, b] = late ? [2, 3] : [0, 1];
    return {
      bot: c.map((k) => P(k.x, k.bot)).join(' '),
      band: [P(c[l].x, c[l].top), P(c[r].x, c[r].top), P(c[r].x, c[r].bot), P(c[l].x, c[l].bot)].join(' '),
      face: [P(c[a].x, c[a].top), P(c[b].x, c[b].top), P(c[b].x, c[b].bot), P(c[a].x, c[a].bot)].join(' '),
      top: c.map((k) => P(k.x, k.top)).join(' '),
    };
  };
  const frames = [];
  for (let i = 0; i <= 6; i++) frames.push(polys(i * 15, false));
  for (let i = 6; i <= 12; i++) frames.push(polys(i * 15, true));
  const keyTimes = [...frames.keys()].map((i) => f2((i < 7 ? i : i - 1) / 12).replace(/^0\./, '.')).join(';');
  const FILL = { bot: '--b', band: '--b', face: '--a', top: '--c' };
  let defs = '';
  for (let k = 0; k < PHASES; k++) {
    let liveSym = '', stillSym = '';
    const rest = polys((k * 180) / PHASES, (k * 180) / PHASES >= 90);
    for (const part of ['bot', 'band', 'face', 'top']) {
      const st = `style="fill:var(${FILL[part]})"`;
      liveSym += `<polygon ${st} points="${frames[0][part]}"><animate attributeName="points" dur="${TURN}s" begin="${f2((-k * TURN) / PHASES)}s" repeatCount="indefinite" keyTimes="${keyTimes}" values="${frames.map((fr) => fr[part]).join(';')}"/></polygon>`;
      stillSym += `<polygon ${st} points="${rest[part]}"/>`;
    }
    defs += `<g id="c${k}">${liveSym}</g><g id="d${k}">${stillSym}</g>`;
  }
  let live = '', still = '';
  for (let r = 0; r < ROWS; r++) {
    const h = HUES[r];
    const open = `<g style="--a:${hsl(h, 84, 55)};--b:${hsl(h, 80, 36)};--c:${hsl(h, 92, 74)}" fill="${hsl(h, 84, 55)}">`;
    let a = '', b = '';
    for (let c = 0; c < COLS; c++) {
      const k = (c + r * 2) % PHASES;
      const at = `x="${GX + c * PITCH + PITCH / 2}" y="${GY + r * VPITCH + VPITCH / 2}"`;
      a += `<use href="#c${k}" ${at}/>`;
      b += `<use href="#d${k}" ${at}/>`;
    }
    live += `${open}${a}</g>`;
    still += `${open}${b}</g>`;
  }

  // the tall outlined wordmark up the left edge: stroke pass, then a fill pass that hides the overlaps
  const WS = 0.84;
  const word = measure('ULTRA');
  let strokePass = '', fillPass = '';
  for (const c of word.chars) {
    const u = `<use href="#${need(c.ch)}" x="${f1(c.c - c.w / 2)}"/>`;
    strokePass += u;
    fillPass += u;
  }
  const mark = `<g transform="translate(88 ${CH / 2}) rotate(-90) scale(${WS}) translate(${f1(-word.width / 2)} -50)">`
    + `<g fill="none" stroke="${INK.cyan}" stroke-width="${f1(9 / WS)}" stroke-linejoin="round">${strokePass}</g><g fill="${INK.black}">${fillPass}</g></g>`;

  // small white text over the grid
  const textLines = [
    '140 craftable items, one cube each',
    '211 machine recipes, 88 of them alternates',
    '477 buildings, 9 of them production machines',
    '5 space elevator phases, 0 gradients',
  ];
  // white pixels with a one-pixel black keyline (a stroke painted under the fill), so they read over any hue
  const TXS = 3;
  let text = '';
  textLines.forEach((str, i) => {
    const x = Math.round(GX + (COLS * PITCH) / 2 - (px.width(str) * TXS) / 2);
    const y = Math.round(GY + (1.5 + i) * VPITCH + VPITCH / 2 - 3.5 * TXS);
    text += px.run(str, x, y, TXS, INK.white);
  });
  text = `<g stroke="${INK.black}" stroke-width="2" stroke-linejoin="miter" paint-order="stroke">${text}</g>`;

  const css = '.rm{display:none}@media (prefers-reduced-motion:reduce){.am{display:none}.rm{display:inline}}';
  const label = 'A grid of 140 turning cubes, one for each craftable item in ULTRA-SATISFACTORY, coloured across the rainbow row by row, with ULTRA in tall cyan outlined capitals up the left edge. Small white text reads: 140 craftable items, one cube each. 211 machine recipes, 88 of them alternates. 477 buildings, 9 of them production machines. 5 space elevator phases, 0 gradients.';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CW} ${CH}" width="${CW}" height="${CH}" role="img" aria-label="${escXml(label)}">`
    + `<title>${escXml(label)}</title><style>${css}</style>`
    + `<defs><clipPath id="fr"><rect width="${CW}" height="${CH}" rx="14"/></clipPath>${glyphDefs()}${px.defs()}${defs}</defs>`
    + `<g clip-path="url(#fr)"><rect width="${CW}" height="${CH}" fill="${INK.black}"/>`
    + `<g class="am">${live}</g><g class="rm">${still}</g>${mark}${text}</g></svg>`;
}

// ================================================================ screen 3: the credits
// A muted grey-blue field, two thin rules, small bright green type, dotted leaders.
const CREDITS = [
  ['Code', 'lukexyz'],
  ['Game data', 'greeny/SatisfactoryTools'],
  ['Item & building images', 'Satisfactory Wiki (CC BY-NC-SA 4.0)'],
  ['Graphics & design', 'Stencil Shift (an invented crew)'],
  ['Music', 'none. hum something brisk'],
  ['Protection', "none. it's Apache 2.0"],
  ['Affiliation', 'none. unofficial fan project'],
];
const CREDIT_COLS = 64;
const leader = (a, b, cols = CREDIT_COLS) => `${a}${'.'.repeat(cols - [...a].length - [...b].length)}${b}`;
function buildCredits() {
  const px = makePixelFont('p');
  const CW = 1200, CH = 270, S = 2.5, PITCH = 28;
  const top = (CH - (CREDITS.length - 1) * PITCH - 7 * S) / 2;
  let text = '';
  CREDITS.forEach(([a, b], i) => {
    text += px.line([[leader(a, b), INK.lime]], CW / 2, top + i * PITCH, S, 'c');
  });
  const rw = CREDIT_COLS * px.ADV * S + 60;
  const rules = [top - 24, top + (CREDITS.length - 1) * PITCH + 7 * S + 22]
    .map((y) => `<rect x="${f1((CW - rw) / 2)}" y="${f1(y)}" width="${f1(rw)}" height="2" fill="${INK.rule}"/>`).join('');
  const label = `Credits on a grey-blue field, in small green type with dotted leaders. ${CREDITS.map(([a, b]) => `${a}: ${b}`).join('. ')}.`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CW} ${CH}" width="${CW}" height="${CH}" role="img" aria-label="${escXml(label)}">`
    + `<title>${escXml(label)}</title><defs>${px.defs()}</defs>`
    + `<rect width="${CW}" height="${CH}" rx="14" fill="${INK.greyblue}"/>${rules}${text}</svg>`;
}

// ---------------------------------------------------------------- specimen (for tuning the big face)
function specimen() {
  const lines = ['ABCDEFGHIJKLM', 'NOPQRSTUVWXYZ', "0123456789 .,:!?'-/+*", 'ULTRA SATISFACTORY'];
  let body = '';
  lines.forEach((str, row) => {
    for (const c of measure(str).chars) {
      if (c.ch !== ' ') body += `<path transform="translate(${f1(c.c - c.w / 2)} ${row * 140})" d="${GLYPHS[c.ch][1]}"/>`;
    }
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-40 -40 1560 ${lines.length * 140 + 40}"><rect x="-40" y="-40" width="1560" height="2000" fill="${INK.mustard}"/><g fill="${INK.black}">${body}</g></svg>`;
}

// ================================================================ SCROLLER.TXT
// The plain-text companion for the README's <details> block: the scroller for
// people with images off, the colour budget, the greetings and the credits.
const TXT_COLS = 76;
const SWATCHES = [
  ['Hot pink', 'the sky'],
  ['Mustard', 'the far factory'],
  ['Leaf green', 'the near factory'],
  ['Violet and orange', 'the ring sun'],
  ['Black', 'the letters, the Space Elevator, the supervisor'],
  ['White', 'half of one tag, one line of small print'],
  ['Purple, pink, blue', 'three tab names, on loan from the app'],
  ['Grey', 'two slashes. nobody signed for them'],
  ['Gradients', 'none. requisition denied'],
];
const GREETINGS = [
  ['The Overprint Club', 'the pipe goes through the wall. what pipe?'],
  ['The Third Input', 'one ingredient short. always the same one'],
  ['Fuse & Excuse', 'it tripped the second you walked away'],
  ['Wrong Way Mk.2', 'the belt is fine. the arrows are wrong'],
  ['The Rounding Error', 'it balanced in the spreadsheet. not on the floor'],
  ['Probably Screws Ltd', 'the box has no label. it never needs one'],
  ['The Set Square Set', 'every belt at ninety degrees. owns a ruler'],
  ['The Freehand Mob', 'it works. do not ask which belt is which'],
];
function scrollerTxt() {
  const rule = ` ${'-'.repeat(TXT_COLS - 2)}`;
  const out = [];
  const section = (title) => out.push('', ` ${title}`, rule);
  out.push(` ${leader('stencil shift proudly presents ', ' ULTRA-SATISFACTORY', TXT_COLS - 2)}`);
  section(`THE SCROLLER, FOR ANYONE WHO READS FASTER THAN ${SCR.speed} PIXELS A SECOND`);
  for (const part of SCROLL_PARTS) {
    let line = '  *';
    for (const word of part.split(' ')) {
      if (line.length + 1 + word.length > TXT_COLS) { out.push(line); line = '   '; }
      line += ` ${word}`;
    }
    out.push(line);
  }
  section('THE COLOUR BUDGET, SCREEN ONE');
  for (const [a, b] of SWATCHES) out.push(`  ${leader(a, b, TXT_COLS - 4)}`);
  section('GREETINGS TO');
  for (const [a, b] of GREETINGS) out.push(`  ${leader(a, b, TXT_COLS - 4)}`);
  section('CREDITS');
  for (const [a, b] of CREDITS) out.push(`  ${leader(a, b, TXT_COLS - 4)}`);
  return out.join('\n');
}

// ================================================================ ELEVATOR.TXT
// What the tower in the picture wants, phase by phase, as the app's OBJECTIVES tab lists it.
const PHASES = [
  ['Automation basics', [['Smart Plating', 50], ['Versatile Framework', 100], ['Automated Wiring', 500]]],
  ['Logistics & steel', [['Automated Wiring', 500], ['Modular Frame', 500], ['Smart Plating', 100], ['Versatile Framework', 500]]],
  ['Oil & computers', [['Versatile Framework', 2500], ['Modular Engine', 500], ['Adaptive Control Unit', 100]]],
  ['Nuclear & endgame', [['Assembly Director System', 1000], ['Magnetic Field Generator', 500], ['Nuclear Pasta', 100], ['Thermal Propulsion Rocket', 25]]],
  ['Alien tech & quantum', [['Biochemical Sculptor', 500], ['AI Expansion Server', 100], ['Neural-Quantum Processor', 100], ['Ballistic Warp Drive', 100]]],
];
function elevatorTxt() {
  const out = [` ${leader('the space elevator requests ', ' the following', TXT_COLS - 2)}`];
  PHASES.forEach(([name, parts], i) => {
    out.push('', ` PHASE ${i + 1}: ${name.toUpperCase()}`, ` ${'-'.repeat(TXT_COLS - 2)}`);
    for (const [part, n] of parts) out.push(`  ${leader(part, `x${n}`, TXT_COLS - 4)}`);
  });
  out.push('', ' Pick a phase in OBJECTIVES, click a part, get its recipe. The tower does', ' not say thank you. The tower says PHASE 2.');
  return out.join('\n');
}

// ---------------------------------------------------------------- write
const kb = (s) => `${(Buffer.byteLength(s) / 1024).toFixed(1)} KB`;
fs.mkdirSync(ASSETS, { recursive: true });
for (const [file, svg] of [[OUT_MAIN, buildMain()], [OUT_CUBES, buildCubes()], [OUT_CREDITS, buildCredits()]]) {
  fs.writeFileSync(file, svg);
  console.log(`wrote ${path.basename(file)} (${kb(svg)})`);
}
// Keep the two text files in the README header in step with the banner.
const TXT_BLOCKS = { 'SCROLLER.TXT': scrollerTxt(), 'ELEVATOR.TXT': elevatorTxt() };
if (fs.existsSync(MD)) {
  const md = fs.readFileSync(MD, 'utf8');
  const fence = '```';
  let next = md;
  for (const [name, txt] of Object.entries(TXT_BLOCKS)) {
    const tag = name.replace('.', '\\.');
    const re = new RegExp('(<!-- ' + tag + ':BEGIN[^>]*-->\\r?\\n\\r?\\n' + fence + 'text\\r?\\n)[\\s\\S]*?(\\r?\\n' + fence + '\\r?\\n\\r?\\n<!-- ' + tag + ':END -->)');
    next = next.replace(re, (_, a, b) => a + txt + b);
  }
  if (next !== md) {
    fs.writeFileSync(MD, next);
    console.log(`updated the text blocks in ${path.basename(MD)}`);
  }
}
if (process.argv.includes('--txt')) process.stdout.write(Object.values(TXT_BLOCKS).join('\n\n') + '\n');
const specArg = process.argv.find((a) => a.startsWith('--specimen='));
if (specArg) {
  fs.writeFileSync(specArg.split('=')[1], specimen());
  console.log('wrote specimen');
}
