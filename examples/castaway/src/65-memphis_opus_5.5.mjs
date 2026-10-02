#!/usr/bin/env node
// Memphis (catalogue entry vap-17): README header generator for CASTAWAY.
//
//   node examples/castaway/src/65-memphis_opus_5.5.mjs
//
// Writes three SVGs into ../assets/:
//   65-memphis_opus_5.5.svg           the banner
//   65-memphis_opus_5.5-catalogo.svg  the catalogue sheet (eight "pieces")
//   65-memphis_opus_5.5-divider.svg   a laminate strip used as a divider
// The .md beside the assets is hand-written, not generated.
// Plain Node, no dependencies, no clock. Every scatter (the squiggle
// laminate, the confetti, the terrazzo chips, the sea's squiggle tile) comes
// from a seeded PRNG (mulberry32; the banner's laminate is seed 1992, like the
// video's default run), so every run writes the same bytes.
//
// The style: early-80s Milanese postmodern design, the look that became the
// wallpaper of late-80s television. A warm white laminate covered in short
// black squiggles, zigzags and confetti that never touch; big flat
// primitives overlapping off-grid (a quarter circle, stairs, a striped bar,
// a dot, a terrazzo half-disc); black-and-white stripes slapped straight onto saturated colour;
// terrazzo chips; hard black offset shadows; no gradients, no perspective.
// The squiggle laminate here is drawn from scratch by the scatter below
// (eight little mark shapes, placed by dart throwing with a minimum gap), not
// copied from any commercial print, and no real piece of furniture is drawn.
//
// The translation: the island is presented as a piece of postmodern
// furniture, "an island for one, fully furnished", in the deadpan voice of a
// design catalogue. The wordmark is eight hand-cut capitals, each its own
// primitive (C is a ring, the As are triangles, W is a zigzag), each tilted,
// coloured differently and dropped on a hard black shadow. The computing
// element the style needs is a chunky window with a live preview (the
// renderer is a web page), whose screen shows Castaway's island redrawn in
// Memphis shapes: a striped palm, a sea made of the same squiggles in white,
// a terrazzo sandbank. She is tiny and built from primitives (coral tank
// top, cream shorts, cream headphones, a bun), and she nods on the beat; so
// does the shark in the cream headphones. A coconut walks the beach on crab
// legs. The control bar counts the theme's 20 bars of 3 seconds, which is
// also the banner's master loop (60 s).
//
// Nothing is <text>: all lettering is vector. The wordmark is filled
// polygons outlined with paint-order stroke; the small type is a geometric
// monoline drawn below as stroked paths, one <use> per glyph.
//
// Motion (CSS keyframes only, each on its own clean loop): the letters hop
// one after another once per bar (3 s); she and the shark nod once per beat
// (0.75 s, 80 BPM); the sea's squiggles drift by exactly one pattern tile;
// clouds and a delivery drone cross the sky and wrap while out of sight; the
// coconut crab walks in steps; the progress stripes scroll; the bar counter
// steps 01 to 20. prefers-reduced-motion stops all of it on the base frame,
// which is complete (BAR 01/20, everybody in place).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '65-memphis_opus_5.5';
const ASSETS = path.resolve(HERE, '../assets');

// =================================================================== helpers
const f = (n, d = 2) => {
  const s = (+n).toFixed(d);
  return s.includes('.') ? s.replace(/0+$/, '').replace(/\.$/, '').replace(/^-0$/, '0') : s;
};
function mulberry32(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const D2R = Math.PI / 180;
// Positive shoelace area = clockwise on screen (y down). Every outer outline
// is wound clockwise and every hole anticlockwise, so overlapping parts of one
// path add up under the nonzero rule and holes stay holes.
const shoelace = (pts) => pts.reduce((a, p, i) => { const q = pts[(i + 1) % pts.length]; return a + p[0] * q[1] - q[0] * p[1]; }, 0);
const orient = (pts, sign) => (Math.sign(shoelace(pts)) === sign ? pts : [...pts].reverse());
const polyD = (pts, sign = 1) => `M${orient(pts, sign).map((p) => `${f(p[0])} ${f(p[1])}`).join('L')}Z`;
const rectPts = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
// clockwise circle (sweep 1), so it unions with clockwise polygons
const circD = (cx, cy, r) => `M${f(cx - r)} ${f(cy)}a${f(r)} ${f(r)} 0 1 1 ${f(2 * r)} 0a${f(r)} ${f(r)} 0 1 1 ${f(-2 * r)} 0Z`;
const bez = (p0, p1, p2, p3, t) => {
  const u = 1 - t;
  return [
    u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
    u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
  ];
};
const qpt = (p0, p1, p2, t) => [
  (1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0],
  (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1],
];
const xml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// =================================================================== palette
// Flat and clashing: primaries plus pink, teal, mint and lilac, with
// black-and-white patterning. Ink is a warm near-black.
const C = {
  ink: '#16141a', paper: '#fff6e8', white: '#ffffff',
  red: '#f2412b', yellow: '#ffd93d', blue: '#3968cb', sky: '#64cff7', pink: '#ff68a8',
  teal: '#18b4a6', mint: '#8fe3c4', lilac: '#ca7cd8', orange: '#ff8a3d', coral: '#ff7f66',
  skyPale: '#a9e7ff', sea: '#3968cb', seaPale: '#9fd8ff', lagoon: '#2ec4b6',
  sand: '#ffe08a', cream: '#fff1d0', skin: '#f2c29b', hair: '#6b3e26',
  green: '#22b573', leaf: '#7fe0a5', fin: '#8496ad', nut: '#8a5a3c', card: '#e9b878',
};

// =================================================================== small type
// A geometric monoline (cap height 10, baseline y = 10, x-height 6.4), drawn
// as stroked paths with round caps and joins: circles for bowls, straight
// lines for everything else. [advance width, path].
const FONT = {
  A: [7.4, 'M0 10L3.7 0L7.4 10M1.3 6.6H6.1'],
  B: [6.1, 'M0 10V0H3.3A2.45 2.45 0 0 1 3.3 4.9H0M3.3 4.9H3.55A2.55 2.55 0 0 1 3.55 10H0'],
  C: [8.6, 'M8.54 1.46A5 5 0 1 0 8.54 8.54'],
  D: [7.6, 'M0 0V10H2.6A5 5 0 0 0 2.6 0Z'],
  E: [5.6, 'M5.6 0H0V10H5.6M0 5H4.8'],
  'È': [5.6, 'M5.6 0H0V10H5.6M0 5H4.8M1.4 -3.6L3.4 -1.8'],
  F: [5.4, 'M5.4 0H0V10M0 5H4.6'],
  G: [10, 'M8.54 1.46A5 5 0 1 0 10 5H5.8'],
  H: [7, 'M0 0V10M7 0V10M0 5H7'],
  I: [0, 'M0 0V10'],
  J: [5, 'M5 0V7.5A2.5 2.5 0 0 1 0 7.5'],
  K: [6.4, 'M0 0V10M6.2 0L0 6.2M2.3 3.9L6.4 10'],
  L: [5.2, 'M0 0V10H5.2'],
  M: [8.8, 'M0 10V0L4.4 9L8.8 0V10'],
  N: [7, 'M0 10V0L7 10V0'],
  O: [10, 'M0 5A5 5 0 1 0 10 5A5 5 0 1 0 0 5Z'],
  P: [6, 'M0 10V0H3.4A2.6 2.6 0 0 1 3.4 5.2H0'],
  Q: [10, 'M0 5A5 5 0 1 0 10 5A5 5 0 1 0 0 5ZM6.4 7L9.6 10.4'],
  R: [6.4, 'M0 10V0H3.4A2.6 2.6 0 0 1 3.4 5.2H0M3.3 5.2L6.4 10'],
  S: [6.2, 'M5.9 1.7C5.2 0.5 4.2 0 3.1 0C1.4 0 0.3 1 0.3 2.6C0.3 4.3 1.8 4.7 3.1 5.1C4.6 5.5 6.1 6 6.1 7.6C6.1 9.1 4.8 10 3.1 10C1.8 10 0.6 9.4 0 8.2'],
  T: [7, 'M0 0H7M3.5 0V10'],
  U: [7, 'M0 0V6.5A3.5 3.5 0 0 0 7 6.5V0'],
  V: [7.4, 'M0 0L3.7 10L7.4 0'],
  W: [10.4, 'M0 0L2.6 10L5.2 0.6L7.8 10L10.4 0'],
  X: [6.8, 'M0 0L6.8 10M6.8 0L0 10'],
  Y: [7, 'M0 0L3.5 5.2L7 0M3.5 5.2V10'],
  Z: [6.4, 'M0 0H6.4L0 10H6.4'],
  0: [6, 'M0 5A3 5 0 1 0 6 5A3 5 0 1 0 0 5Z'],
  1: [3, 'M0.2 2.2L3 0V10'],
  2: [6.2, 'M0.4 2.4C0.8 0.9 1.9 0 3.2 0C4.9 0 6 1.1 6 2.7C6 4.3 4.9 5.4 0.2 10H6.2'],
  3: [6.2, 'M0.4 1.2C1.1 0.4 2 0 3.1 0C4.7 0 5.8 1 5.8 2.5C5.8 4 4.6 4.9 2.6 4.9C4.9 4.9 6.2 6 6.2 7.5C6.2 9 4.9 10 3.1 10C1.9 10 0.8 9.6 0 8.6'],
  4: [6.4, 'M4.8 10V0L0 7.2H6.4'],
  5: [6.2, 'M5.8 0H1L0.5 4.6C1.2 4.1 2.1 3.8 3.1 3.8C4.9 3.8 6.2 5 6.2 6.9C6.2 8.8 4.8 10 3 10C1.8 10 0.8 9.5 0.1 8.6'],
  6: [6.2, 'M4.6 0L0.5 5.7M0.1 6.9A3 3 0 1 0 6.1 6.9A3 3 0 1 0 0.1 6.9Z'],
  7: [6.2, 'M0 0H6.2L2.2 10'],
  8: [6.2, 'M0.7 2.4A2.4 2.4 0 1 0 5.5 2.4A2.4 2.4 0 1 0 0.7 2.4ZM0.4 7.3A2.7 2.7 0 1 0 5.8 7.3A2.7 2.7 0 1 0 0.4 7.3Z'],
  9: [6.2, 'M0.1 3.1A3 3 0 1 0 6.1 3.1A3 3 0 1 0 0.1 3.1ZM5.7 4.3L1.6 10'],
  ' ': [3.2, ''],
  '.': [0, 'M0 9.95V10.05'],
  ',': [0.6, 'M0.6 9.4L0 11.2'],
  ':': [0, 'M0 3.55V3.65M0 9.95V10.05'],
  '-': [3.6, 'M0 5.6H3.6'],
  '/': [4.2, 'M4.2 0L0 10'],
  '·': [0, 'M0 5.45V5.55'],
  '!': [0, 'M0 0V6.6M0 9.95V10.05'],
  '?': [5.6, 'M0.2 2.4C0.6 0.9 1.7 0 3 0C4.6 0 5.6 1 5.6 2.5C5.6 4.4 2.9 4.6 2.9 7M2.9 9.95V10.05'],
  "'": [0, 'M0 0V2.8'],
  '(': [2.2, 'M2.2 -0.5Q-0.8 5 2.2 10.5'],
  ')': [2.2, 'M0 -0.5Q3 5 0 10.5'],
  '+': [5.4, 'M0 5.2H5.4M2.7 2.5V7.9'],
  '>': [5, 'M0 1.6L5 5.2L0 8.8'],
  '=': [5.4, 'M0 3.8H5.4M0 6.8H5.4'],
  '°': [2.6, 'M1.3 0.1A1.2 1.2 0 1 0 1.3 2.5A1.2 1.2 0 1 0 1.3 0.1Z'],
  '♪': [5, 'M0.3 9A1.3 1.1 0 1 0 2.9 9A1.3 1.1 0 1 0 0.3 9ZM2.9 9V0.4Q5.6 2.2 4.6 5.2'],
  a: [6.4, 'M6.4 3.6V10M6.4 6.8A3.2 3.2 0 1 0 0 6.8A3.2 3.2 0 1 0 6.4 6.8'],
  b: [6.4, 'M0 0V10M0 6.8A3.2 3.2 0 1 1 6.4 6.8A3.2 3.2 0 1 1 0 6.8'],
  c: [5.9, 'M5.46 4.54A3.2 3.2 0 1 0 5.46 9.06'],
  d: [6.4, 'M6.4 0V10M6.4 6.8A3.2 3.2 0 1 0 0 6.8A3.2 3.2 0 1 0 6.4 6.8'],
  e: [6.4, 'M0.1 6.8H6.4A3.2 3.2 0 1 0 5.46 9.06'],
  f: [4, 'M4 0.3C3.7 0.1 3.3 0 2.9 0C1.9 0 1.3 0.7 1.3 1.8V10M0 3.6H3.6'],
  g: [6.4, 'M6.4 3.6V10.4C6.4 12.2 5.1 13.2 3.3 13.2C2 13.2 0.9 12.7 0.3 11.8M6.4 6.8A3.2 3.2 0 1 0 0 6.8A3.2 3.2 0 1 0 6.4 6.8'],
  h: [5.8, 'M0 0V10M0 6.6C0 4.8 1.2 3.6 3 3.6C4.8 3.6 5.8 4.8 5.8 6.6V10'],
  i: [0, 'M0 3.6V10M0 0.95V1.05'],
  j: [1.6, 'M1.6 3.6V11.6C1.6 12.6 1 13.2 0 13.2M1.6 0.95V1.05'],
  k: [5.2, 'M0 0V10M5 3.6L0 8.1M1.9 6.4L5.2 10'],
  l: [0, 'M0 0V10'],
  m: [9.2, 'M0 3.6V10M0 6.2C0 4.6 0.9 3.6 2.3 3.6C3.7 3.6 4.6 4.6 4.6 6.2V10M4.6 6.2C4.6 4.6 5.5 3.6 6.9 3.6C8.3 3.6 9.2 4.6 9.2 6.2V10'],
  n: [5.8, 'M0 3.6V10M0 6.6C0 4.8 1.2 3.6 3 3.6C4.8 3.6 5.8 4.8 5.8 6.6V10'],
  o: [6.4, 'M0 6.8A3.2 3.2 0 1 0 6.4 6.8A3.2 3.2 0 1 0 0 6.8Z'],
  p: [6.4, 'M0 3.6V13.2M0 6.8A3.2 3.2 0 1 1 6.4 6.8A3.2 3.2 0 1 1 0 6.8'],
  q: [6.4, 'M6.4 3.6V13.2M6.4 6.8A3.2 3.2 0 1 0 0 6.8A3.2 3.2 0 1 0 6.4 6.8'],
  r: [4.2, 'M0 3.6V10M0 6.4C0 4.6 1.2 3.6 3 3.6C3.5 3.6 3.9 3.7 4.2 3.9'],
  s: [5, 'M4.6 4.7C4.2 4 3.4 3.6 2.4 3.6C1.1 3.6 0.3 4.3 0.3 5.2C0.3 6.3 1.3 6.6 2.5 6.9C3.8 7.2 4.9 7.6 4.9 8.6C4.9 9.5 4 10 2.6 10C1.5 10 0.5 9.6 0 8.8'],
  t: [3.6, 'M1.4 0.8V8.6C1.4 9.5 1.9 10 2.8 10H3.6M0 3.6H3.6'],
  u: [5.8, 'M0 3.6V7C0 8.8 1 10 2.9 10C4.8 10 5.8 8.8 5.8 7M5.8 3.6V10'],
  v: [6, 'M0 3.6L3 10L6 3.6'],
  w: [8.8, 'M0 3.6L2.2 10L4.4 3.6L6.6 10L8.8 3.6'],
  x: [5.4, 'M0 3.6L5.4 10M5.4 3.6L0 10'],
  y: [6, 'M0 3.6L3.1 10.1M6 3.6L1.8 13.2'],
  z: [5.2, 'M0 3.6H5.2L0 10H5.2'],
};
const gid = (ch) => `g${ch.codePointAt(0).toString(36)}`;

// One Type instance per SVG, so each file only defines the glyphs it uses.
class Type {
  constructor() { this.used = new Set(); }
  measure(str, sw = 1.8, track = 1.6) {
    let cx = sw / 2, last = 0;
    for (const ch of str) {
      const g = FONT[ch];
      if (!g) throw new Error(`no glyph for ${JSON.stringify(ch)}`);
      last = cx + g[0] + sw / 2;
      cx += g[0] + sw + track;
    }
    return last;
  }
  // (x, y) is the top-left of the cap height; returns the markup
  text(str, x, y, { cap = 12, sw = 1.8, track = 1.6, color = C.ink, anchor = 'start', extra = '' } = {}) {
    const s = cap / 10;
    const w = this.measure(str, sw, track) * s;
    const x0 = anchor === 'middle' ? x - w / 2 : anchor === 'end' ? x - w : x;
    let cx = sw / 2, uses = '';
    for (const ch of str) {
      const g = FONT[ch];
      if (g[1]) { this.used.add(ch); uses += `<use href="#${gid(ch)}" x="${f(cx)}"/>`; }
      cx += g[0] + sw + track;
    }
    return `<g class="t" transform="translate(${f(x0)} ${f(y)}) scale(${f(s, 4)})" stroke="${color}" stroke-width="${sw}"${extra}>${uses}</g>`;
  }
  width(str, { cap = 12, sw = 1.8, track = 1.6 } = {}) { return this.measure(str, sw, track) * cap / 10; }
  defs() {
    return [...this.used].sort().map((ch) => `<path id="${gid(ch)}" d="${FONT[ch][1]}"/>`).join('');
  }
}

// =================================================================== the wordmark
// Eight hand-cut capitals, cap height 100, each built from Memphis primitives:
// the C is a ring, the A is two slabs and a bar (a triangle with a notch), the
// S is one thick ribbon, the T two bars, the W four slabs in a zigzag, the Y
// three. Parts overlap; the nonzero rule fuses them.
const para = (xa, xb, ya, xc, xd, yb) => [[xa, ya], [xb, ya], [xd, yb], [xc, yb]];
function annulus(cx, cy, R, r, a0, a1, n = 48) {
  const out = [], inn = [];
  for (let i = 0; i <= n; i++) {
    const a = (a0 + ((a1 - a0) * i) / n) * D2R;
    out.push([cx + R * Math.cos(a), cy + R * Math.sin(a)]);
    inn.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return [...out, ...inn.reverse()];
}
// a ribbon of half-width hw along a chain of cubic Beziers, butt ends
function ribbon(segs, hw, nPer = 16) {
  const pts = [];
  segs.forEach((s, i) => { for (let k = i ? 1 : 0; k <= nPer; k++) pts.push(bez(...s, k / nPer)); });
  const L = [], R = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1];
    const d = Math.hypot(dx, dy); dx /= d; dy /= d;
    L.push([pts[i][0] - dy * hw, pts[i][1] + dx * hw]);
    R.push([pts[i][0] + dy * hw, pts[i][1] - dx * hw]);
  }
  return [...L, ...R.reverse()];
}
const WORD = {
  C: { w: 90, d: polyD(annulus(50, 50, 50, 21, 42, 318)) },
  A: {
    w: 108,
    d: [para(38, 66, 0, 0, 28, 100), para(42, 70, 0, 80, 108, 100), rectPts(20, 64, 68, 20)].map((p) => polyD(p)).join(''),
  },
  S: {
    w: 82,
    d: polyD(ribbon([
      [[68, 25], [63, 17], [53, 14], [41, 14]],
      [[41, 14], [27, 14], [16, 21], [16, 32]],
      [[16, 32], [16, 46], [67, 54], [67, 68]],
      [[67, 68], [67, 79], [56, 86], [41, 86]],
      [[41, 86], [29, 86], [18, 82], [13, 75]],
    ], 14)),
  },
  T: { w: 92, d: [rectPts(0, 0, 92, 28), rectPts(32, 0, 28, 100)].map((p) => polyD(p)).join('') },
  W: {
    w: 140,
    d: [para(0, 28, 0, 30, 58, 100), para(56, 84, 14, 30, 58, 100), para(56, 84, 14, 82, 110, 100), para(112, 140, 0, 82, 110, 100)]
      .map((p) => polyD(p)).join(''),
  },
  Y: {
    w: 100,
    d: [para(0, 28, 0, 36, 64, 56), para(72, 100, 0, 36, 64, 56), rectPts(36, 48, 28, 52)].map((p) => polyD(p)).join(''),
  },
};

// =================================================================== laminate marks
// Eight little mark shapes, centred on the origin. Black worms, zigzags and
// rings; coloured confetti dashes, dots and solid triangles.
const MARKS = [
  { id: 'm0', r: 10, d: 'M-9 1C-6-6-2-6 0 0S6 6 9-1' },               // worm
  { id: 'm1', r: 9, d: 'M-8 3Q-1-9 8 2' },                           // arc worm
  { id: 'm2', r: 10, d: 'M-9 2L-4.5-3L0 2L4.5-3L9 2' },               // zigzag
  { id: 'm3', r: 6, d: 'M-5 0H5' },                                   // dash
  { id: 'm4', r: 5, d: 'M-3.4 0A3.4 3.4 0 1 0 3.4 0A3.4 3.4 0 1 0-3.4 0' }, // ring
  { id: 'm5', r: 3, d: 'M0 0h.01' },                                  // dot
  { id: 'm6', r: 6, d: 'M0-4.6L4.6 3.6H-4.6Z' },                      // triangle
  { id: 'm7', r: 12, d: 'M-11 0C-9-5-5.5-5-3.7 0S1.8 5 3.7 0 9.2-5 11 0' }, // long worm
];
// dart throwing: no mark ever touches another
function scatter(rnd, box, count, gap, pick, avoid = () => false) {
  const placed = [];
  const cell = 26, cols = Math.ceil(box.w / cell) + 2, grid = new Map();
  const key = (cx, cy) => cy * cols + cx;
  let tries = 0;
  while (placed.length < count && tries < count * 80) {
    tries++;
    const m = pick(rnd());
    const x = box.x + rnd() * box.w, y = box.y + rnd() * box.h;
    if (avoid(x, y, m.r)) continue;
    const gx = Math.floor((x - box.x) / cell), gy = Math.floor((y - box.y) / cell);
    let ok = true;
    for (let j = gy - 2; j <= gy + 2 && ok; j++) {
      for (let i = gx - 2; i <= gx + 2 && ok; i++) {
        for (const p of grid.get(key(i, j)) || []) {
          if (Math.hypot(p.x - x, p.y - y) < p.r + m.r + gap) { ok = false; break; }
        }
      }
    }
    if (!ok) continue;
    const p = { x, y, r: m.r, m, a: Math.round(rnd() * 360), v: rnd() };
    placed.push(p);
    const k = key(gx, gy);
    if (!grid.has(k)) grid.set(k, []);
    grid.get(k).push(p);
  }
  return placed;
}
const CONFETTI = ['cP', 'cY', 'cB', 'cT', 'cL', 'cR'];
function laminate(rnd, box, count, { gap = 7, colourShare = 0.28, avoid } = {}) {
  const pick = (u) => {
    if (u < 0.30) return MARKS[0];
    if (u < 0.44) return MARKS[1];
    if (u < 0.58) return MARKS[2];
    if (u < 0.68) return MARKS[7];
    if (u < 0.80) return MARKS[3];
    if (u < 0.87) return MARKS[4];
    if (u < 0.94) return MARKS[5];
    return MARKS[6];
  };
  return scatter(rnd, box, count, gap, pick, avoid).map((p) => {
    let cls = '';
    const confetti = ['m3', 'm5', 'm6'].includes(p.m.id);
    if (confetti && p.v < colourShare * 2.2) cls = CONFETTI[Math.floor(p.v * 1000) % CONFETTI.length];
    if (p.m.id === 'm6') cls = cls === '' ? 'mkf' : `${cls}f`;
    return `<use href="#${p.m.id}"${cls ? ` class="${cls}"` : ''} transform="translate(${f(p.x, 1)} ${f(p.y, 1)}) rotate(${p.a})"/>`;
  }).join('');
}
const MARK_DEFS = MARKS.map((m) => `<path id="${m.id}" d="${m.d}"/>`).join('');
const MARK_CSS =
  `.mk{fill:none;stroke:${C.ink};stroke-width:3;stroke-linecap:round;stroke-linejoin:round}` +
  `.mkf{fill:${C.ink};stroke:none}` +
  [['cP', C.pink], ['cY', C.yellow], ['cB', C.blue], ['cT', C.teal], ['cL', C.lilac], ['cR', C.red]]
    .map(([k, c]) => `.${k}{fill:none;stroke:${c};stroke-width:3.6;stroke-linecap:round}.${k}f{fill:${c};stroke:none}`).join('');

// =================================================================== shared CSS
const BASE_CSS =
  `.t{fill:none;stroke-linecap:round;stroke-linejoin:round}` +
  `.o{stroke:${C.ink};stroke-linejoin:round}` +
  `.lt{paint-order:stroke;stroke:${C.ink};stroke-width:10;stroke-linejoin:miter}` +
  `.sh{fill:${C.ink};stroke:${C.ink};stroke-width:10;stroke-linejoin:miter}`;

// =========================================================================
//                                THE BANNER
// =========================================================================
function banner() {
  const W = 960, H = 560;
  const T = new Type();
  const rnd = mulberry32(1992);
  const out = [];
  const css = [BASE_CSS, MARK_CSS];

  // ------------------------------------------------------------ layout
  const WIN = { x: 410, y: 154, w: 518, h: 370 };
  const SCR = { x: WIN.x + 11, y: WIN.y + 40, w: 496, h: 279 };
  const BAR = { y: SCR.y + SCR.h + 6, h: 42 };

  // ------------------------------------------------------------ ground + laminate
  out.push(`<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="26" fill="${C.paper}"/>`);
  out.push(`<g clip-path="url(#panel)">`);
  const inWin = (x, y, r) => x + r > WIN.x + 6 && x - r < WIN.x + WIN.w - 6 && y + r > WIN.y + 6 && y - r < WIN.y + WIN.h - 6;
  out.push(`<g class="mk">${laminate(rnd, { x: -10, y: -10, w: W + 20, h: H + 20 }, 900, { gap: 8, avoid: inWin })}</g>`);

  // ------------------------------------------------------------ big primitives
  // pink quarter circle in the bottom-left corner, with stairs climbing it
  out.push(`<path d="M0 ${H - 190}A190 190 0 0 1 190 ${H}H0Z" fill="${C.pink}" class="o" stroke-width="4"/>`);
  // a teal disc in the gap between the stickers and the window
  out.push(`<circle cx="384" cy="300" r="46" fill="${C.teal}" class="o" stroke-width="4"/>`);
  // a terrazzo half-disc tucked under the window's top-left corner: a plinth
  // for the striped T (pale ground, angular chips in several colours)
  const plinth = 'M352 150A48 48 0 0 1 448 150Z';
  out.push(`<clipPath id="plinth"><path d="${plinth}"/></clipPath><path d="${plinth}" fill="#e8e3dc"/>` +
    `<g clip-path="url(#plinth)">${terrazzo(mulberry32(1987), 348, 96, 104, 58, 160, { k0: 1.55, gap: 1.2, cols: [C.coral, C.teal, C.blue, C.pink, C.ink, C.lilac, C.yellow] })}</g>` +
    `<path d="${plinth}" fill="none" class="o" stroke-width="4"/>`);
  // a black-and-white striped slab, top right, under the Y
  out.push(`<g transform="rotate(-14 900 70)"><rect x="830" y="22" width="190" height="56" fill="url(#stripeV)" class="o" stroke-width="4"/></g>`);
  // a yellow triangle bottom right
  out.push(`<path d="M${W} ${H - 170}L${W} ${H}H${W - 210}Z" fill="${C.yellow}" class="o" stroke-width="4"/>`);
  // a checker square peeking out at the bottom, middle
  out.push(`<g transform="rotate(8 268 536)"><rect x="232" y="504" width="72" height="72" fill="url(#check)" class="o" stroke-width="4"/></g>`);
  // a blue stepped stair
  const st = [];
  for (let i = 0; i < 4; i++) st.push(rectPts(20 + i * 26, H - 40 - i * 22, 26, 40 + i * 22 + 10));
  out.push(`<path d="${st.map((p) => polyD(p)).join('')}" fill="${C.blue}" class="o" stroke-width="3"/>`);

  // ------------------------------------------------------------ the window
  out.push(windowFrame(T, WIN, SCR, BAR));

  // ------------------------------------------------------------ left column
  out.push(leftColumn(T, WIN));

  // ------------------------------------------------------------ the wordmark
  out.push(wordmark());

  out.push(`</g>`);
  // the panel's own edge, on top of everything
  out.push(`<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="26" fill="none" stroke="${C.ink}" stroke-width="4"/>`);

  // ------------------------------------------------------------ CSS
  css.push(ANIM_CSS);

  const title = 'CASTAWAY: an island for one, fully furnished';
  const desc = 'A Memphis-style banner: a warm white laminate covered in small black squiggles, zigzags and coloured confetti, with big flat shapes laid over it (a pink quarter circle with blue stairs, a teal disc, a terrazzo half-disc under the T, a striped slab, a yellow triangle, a checkerboard). Across the top, CASTAWAY in chunky hand-cut capitals, each a different colour and tilt, with heavy black outlines and hard black shadows; the letters hop one after another once every bar. On the left, stickers read: ISLAND FOR ONE. FULLY FURNISHED: 1 PALM, 1 RAFT AND 1 PAIR OF HEADPHONES. 10 HOURS. MOSTLY NOTHING. A FEW GAGS AN HOUR, AND EVERY ONE LANDS ON THE BEAT. EVERY SOUND SYNTHESIZED FROM CODE. NO SAMPLES. And a terminal chip: python tools/serve.py. On the right, a chunky window titled CASTAWAY, LIVE PREVIEW shows the island in Memphis shapes: a palm with a striped trunk on a terrazzo sandbank, a sea of white squiggles, a raft out on the water, a bottle, a woman in a coral tank top, cream shorts and cream headphones nodding to the beat, a shark fin wearing headphones nodding along, a coconut walking on crab legs and a drone delivering a parcel of headphones. The control bar counts the bars of the theme, BAR 01/20 to 20/20, and reads 10:00:00.';

  return wrapSvg({ W, H, title, desc, css: css.join(''), defs: defsBanner(T), body: out.join('\n') });
}

// ------------------------------------------------------------------ wordmark
function wordmark() {
  const order = ['C', 'A', 'S', 'T', 'A', 'W', 'A', 'Y'];
  const fills = [C.red, C.yellow, C.blue, 'url(#stripeH)', C.pink, C.teal, C.lilac, C.orange];
  const tilt = [-7, 5, -4, 3, -5, 4, -3, 7];
  const lift = [2, -5, 5, -3, 4, -5, 3, -4];
  const gap = 9, S = 0.98, SH = 8;
  const total = order.reduce((a, k) => a + WORD[k].w, 0) + gap * (order.length - 1);
  let x = (960 - total * S) / 2;
  const base = 82;
  let g = '';
  order.forEach((k, i) => {
    const L = WORD[k];
    const cx = x + (L.w * S) / 2, cy = base + lift[i];
    const inner = `rotate(${tilt[i]}) scale(${S}) translate(${-L.w / 2} -50)`;
    g += `<g transform="translate(${f(cx)} ${f(cy)})"><g class="hop" style="animation-delay:${f(i * 0.09)}s">` +
      `<use href="#w${k}" class="sh" transform="translate(${SH} ${SH}) ${inner}"/>` +
      `<use href="#w${k}" class="lt" fill="${fills[i]}" transform="${inner}"/>` +
      `</g></g>`;
    x += (L.w + gap) * S;
  });
  return g;
}

// ------------------------------------------------------------------ left column
function chip(T, { x, y, lines, cap = 12, sw = 1.9, track = 1.25, padX = 12, padY = 9, lh = 1.62, fill, color = C.ink, rot = 0, shadow = 6, stroke = 3, w = null }) {
  const lineH = cap * lh;
  const tw = Math.max(...lines.map((l) => T.width(l, { cap, sw, track })));
  const cw = w ?? tw + padX * 2;
  const chh = padY * 2 + cap + lineH * (lines.length - 1);
  let s = `<g transform="translate(${f(x)} ${f(y)}) rotate(${rot})">`;
  if (shadow) s += `<rect x="${shadow}" y="${shadow}" width="${f(cw)}" height="${f(chh)}" fill="${C.ink}"/>`;
  s += `<rect width="${f(cw)}" height="${f(chh)}" fill="${fill}" stroke="${C.ink}" stroke-width="${stroke}"/>`;
  lines.forEach((l, i) => { s += T.text(l, padX, padY + i * lineH, { cap, sw, track, color }); });
  s += `</g>`;
  return { svg: s, w: cw, h: chh };
}

function leftColumn(T, WIN) {
  let s = '';
  const limit = WIN.x - 12;
  const put = (o) => {
    const c = chip(T, o);
    if (o.x + c.w > limit) console.warn(`chip "${o.lines[0]}" reaches ${f(o.x + c.w)} (limit ${limit})`);
    s += c.svg;
    return c;
  };
  // 1. the big black strip
  put({ x: 30, y: 178, lines: ['ISLAND FOR ONE.'], cap: 21, sw: 2.7, padX: 15, padY: 11, fill: C.ink, color: C.white, rot: -3, shadow: 7 });
  // 2. pink, the inventory
  put({ x: 46, y: 234, lines: ['FULLY FURNISHED:', '1 PALM, 1 RAFT AND', '1 PAIR OF HEADPHONES.'], cap: 12.5, sw: 2, fill: C.pink, rot: 2 });
  // 3. yellow, what happens
  put({ x: 30, y: 324, lines: ['10 HOURS. MOSTLY NOTHING.', 'A FEW GAGS AN HOUR, AND', 'EVERY ONE LANDS ON THE BEAT.'], cap: 12, sw: 1.9, fill: C.yellow, rot: -1.5 });
  // 4. white, the sound
  put({ x: 62, y: 408, lines: ['EVERY SOUND SYNTHESIZED', 'FROM CODE. NO SAMPLES.'], cap: 11.5, sw: 1.9, fill: C.white, rot: 2 });
  // 5. the terminal
  const cmd = '> python tools/serve.py';
  const tx = 40, ty = 478;
  const cw = T.width(cmd, { cap: 13.5, sw: 1.9, track: 1.25 });
  put({ x: tx, y: ty, lines: [cmd], cap: 13.5, sw: 1.9, padX: 14, padY: 11, fill: C.ink, color: C.mint, rot: -2, shadow: 6, w: cw + 44 });
  // a block cursor after the command (blinks slowly)
  s += `<g transform="translate(${tx} ${ty}) rotate(-2)"><rect class="blink" x="${f(14 + cw + 8)}" y="11" width="8" height="14" fill="${C.cream}"/></g>`;
  return s;
}

// ------------------------------------------------------------------ the window
function windowFrame(T, WIN, SCR, BAR) {
  let s = '';
  // hard shadow and frame
  s += `<rect x="${WIN.x + 10}" y="${WIN.y + 10}" width="${WIN.w}" height="${WIN.h}" rx="10" fill="${C.ink}"/>`;
  s += `<rect x="${WIN.x}" y="${WIN.y}" width="${WIN.w}" height="${WIN.h}" rx="10" fill="${C.white}" stroke="${C.ink}" stroke-width="4"/>`;
  // title bar: black, with a stripe panel and three round buttons
  s += `<path d="M${WIN.x + 2} ${WIN.y + 34}V${WIN.y + 10}a8 8 0 0 1 8-8H${WIN.x + WIN.w - 10}a8 8 0 0 1 8 8V${WIN.y + 34}Z" fill="${C.ink}"/>`;
  const title = 'CASTAWAY · LIVE PREVIEW';
  s += T.text(title, WIN.x + 16, WIN.y + 12, { cap: 11, sw: 1.9, color: C.white });
  const tw = T.width(title, { cap: 11, sw: 1.9 });
  const sx0 = WIN.x + 16 + tw + 14, sx1 = WIN.x + WIN.w - 84;
  s += `<rect x="${f(sx0)}" y="${WIN.y + 11}" width="${f(sx1 - sx0)}" height="14" fill="url(#stripeD)" stroke="${C.white}" stroke-width="1.5"/>`;
  [[C.yellow, 0], [C.pink, 22], [C.teal, 44]].forEach(([c, dx]) => {
    s += `<circle cx="${WIN.x + WIN.w - 64 + dx}" cy="${WIN.y + 18}" r="7.5" fill="${c}" stroke="${C.white}" stroke-width="2"/>`;
  });
  // the screen
  s += `<g transform="translate(${SCR.x} ${SCR.y})"><g clip-path="url(#scr)">${scene()}</g>` +
    `<rect width="${SCR.w}" height="${SCR.h}" fill="none" stroke="${C.ink}" stroke-width="3"/></g>`;
  // the control bar
  s += controlBar(T, SCR, BAR);
  return s;
}

function controlBar(T, SCR, BAR) {
  let s = '';
  const cy = BAR.y + BAR.h / 2;
  const x0 = SCR.x;
  // play button
  s += `<circle cx="${x0 + 16}" cy="${cy}" r="14" fill="${C.yellow}" stroke="${C.ink}" stroke-width="3"/>`;
  s += `<path d="M${x0 + 11} ${cy - 7}L${x0 + 23} ${cy}L${x0 + 11} ${cy + 7}Z" fill="${C.ink}"/>`;
  // track: ten hours long, so the coral bit barely moves; the stripes scroll
  const tx = x0 + 42, tw = 214, th = 14;
  s += `<g transform="translate(${tx} ${cy - th / 2})"><clipPath id="trk"><rect width="${tw}" height="${th}" rx="7"/></clipPath>` +
    `<g clip-path="url(#trk)"><rect class="scroll" x="-28" width="${tw + 56}" height="${th}" fill="url(#stripeT)"/>` +
    `<rect width="16" height="${th}" fill="${C.coral}"/></g>` +
    `<rect width="${tw}" height="${th}" rx="7" fill="none" stroke="${C.ink}" stroke-width="3"/>` +
    `<circle cx="16" cy="${th / 2}" r="8" fill="${C.white}" stroke="${C.ink}" stroke-width="3"/></g>`;
  // bar counter: BAR 01/20 .. 20/20, one step per 3-second bar, then the theme loops
  const ty = { cap: 12, sw: 2, track: 1.3 };
  const lx = tx + tw + 16;
  s += T.text('BAR', lx, cy - 6, ty);
  const nx = lx + T.width('BAR ', ty) + 2;
  // right-aligned, so a narrow 1 does not leave a gap before the slash
  const nr = nx + T.width('00', ty);
  for (let b = 1; b <= 20; b++) {
    const lab = String(b).padStart(2, '0');
    s += `<g class="bc${b === 1 ? ' b1' : ''}" style="animation-delay:${(b - 1) * 3}s">${T.text(lab, nr, cy - 6, { ...ty, anchor: 'end' })}</g>`;
  }
  const sx = nr + 2;
  s += T.text('/20', sx, cy - 6, ty);
  // the beat light, once per beat at 80 BPM
  const bx = sx + T.width('/20', ty) + 14;
  s += `<g transform="translate(${f(bx)} ${cy})"><circle class="beat" r="5.5" fill="${C.red}" stroke="${C.ink}" stroke-width="2.4"/></g>`;
  // the running time: the whole video
  s += T.text('10:00:00', SCR.x + SCR.w - 2, cy - 6, { ...ty, anchor: 'end' });
  // the pointer, pressing play on every bar
  s += `<g transform="translate(${x0 + 22} ${cy + 4})"><g class="click">` +
    `<path d="M4 4l0 26 7-6 5 11 5-2-5-11 9 0z" fill="${C.ink}"/>` +
    `<path d="M0 0l0 26 7-6 5 11 5-2-5-11 9 0z" fill="${C.white}" stroke="${C.ink}" stroke-width="2.4" stroke-linejoin="round"/></g></g>`;
  return s;
}

// ------------------------------------------------------------------ the island scene
function scene() {
  const rnd = mulberry32(80);
  const w = 496, h = 279, HOR = 112;
  let s = '';
  // sky
  s += `<rect width="${w}" height="${HOR}" fill="${C.skyPale}"/>`;
  // sun with turning dash rays
  s += `<g transform="translate(70 52)"><g class="rays">`;
  for (let i = 0; i < 12; i++) {
    const a = i * 30 * D2R;
    s += `<path d="M${f(36 * Math.cos(a))} ${f(36 * Math.sin(a))}L${f(44 * Math.cos(a))} ${f(44 * Math.sin(a))}"/>`;
  }
  s += `</g><circle r="26" fill="${C.yellow}" stroke="${C.ink}" stroke-width="3"/>` +
    `<path d="M-26 0A26 26 0 0 0 26 0Z" fill="url(#stripeS)" stroke="${C.ink}" stroke-width="3"/></g>`;
  // clouds: rounded bumps, outlined; they drift and wrap out of sight
  s += cloud(176, 30, 1, 'cl1') + cloud(352, 64, 0.8, 'cl2');
  // the drone with the parcel (more headphones)
  s += drone(330, 18);
  // sea: flat blue with a drifting tile of white squiggles
  s += `<rect y="${HOR}" width="${w}" height="${h - HOR}" fill="${C.sea}"/>`;
  s += `<rect class="sea" y="${HOR}" width="${w + 248}" height="${h - HOR}" fill="url(#seaPat)"/>`;
  s += `<path d="M0 ${HOR}H${w}" stroke="${C.ink}" stroke-width="2.5"/>`;
  // lagoon and surf ring
  s += `<ellipse cx="236" cy="208" rx="196" ry="52" fill="${C.lagoon}"/>`;
  s += `<ellipse cx="236" cy="204" rx="160" ry="37" fill="${C.white}"/>`;
  // the raft, bobbing out on the water to the right (clear of the shark)
  s += raft(436, 150);
  // the sandbank: terrazzo
  s += `<clipPath id="isl"><ellipse cx="236" cy="200" rx="150" ry="30"/></clipPath>`;
  s += `<ellipse cx="236" cy="200" rx="150" ry="30" fill="${C.sand}"/>`;
  s += `<g clip-path="url(#isl)">${terrazzo(rnd, 86, 170, 300, 60, 70)}</g>`;
  s += `<ellipse cx="236" cy="200" rx="150" ry="30" fill="none" stroke="${C.ink}" stroke-width="3"/>`;
  // bushes behind the palm
  s += `<path d="${circD(262, 192, 13)}${circD(282, 188, 11)}${circD(244, 195, 9)}" fill="${C.green}" class="lt" style="stroke-width:5"/>`;
  s += `<path d="${circD(330, 193, 9)}${circD(344, 196, 7)}" fill="${C.leaf}" class="lt" style="stroke-width:5"/>`;
  // the palm
  s += palm(rnd);
  // her
  s += `<g transform="translate(192 206) scale(1.22)">${her()}</g>`;
  // the coconut on crab legs, walking the beach in steps
  s += `<g transform="translate(130 224) scale(1.15)"><g class="crab">${coconutCrab()}</g></g>`;
  // a bottle bobbing at the front left
  s += `<g transform="translate(60 246)"><g class="bob2">${bottle()}</g></g>`;
  // the shark fin in headphones, nodding with her
  s += `<g transform="translate(404 256) scale(1.3)"><g class="nod">${sharkFin()}</g></g>`;
  s += `<path d="M376 258l5-4 5 4 5-4 5 4 5-4 5 4 5-4 5 4 5-4 5 4 5-4 5 4" fill="none" stroke="${C.white}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
  return s;
}

function cloud(x, y, k, cls) {
  const d = `${circD(14, 18, 12)}${circD(32, 12, 15)}${circD(52, 18, 11)}${polyD(rectPts(14, 18, 38, 12))}`;
  return `<g transform="translate(${x} ${y}) scale(${k})"><g class="${cls}">` +
    `<path d="${d}" fill="${C.ink}" transform="translate(4 4)" class="lt" style="stroke-width:5"/>` +
    `<path d="${d}" fill="${C.white}" class="lt" style="stroke-width:5"/></g></g>`;
}

function drone(x, y) {
  return `<g transform="translate(${x} ${y})"><g class="drone">` +
    `<path d="M-14 -4H14M-14 -8V-4M14 -8V-4M-21 -9H-7M7 -9H21" stroke="${C.ink}" stroke-width="2.4" stroke-linecap="round"/>` +
    `<rect x="-11" y="-5" width="22" height="9" rx="4" fill="${C.lilac}" stroke="${C.ink}" stroke-width="2.4"/>` +
    `<path d="M-4 4L-6 12M4 4L6 12" stroke="${C.ink}" stroke-width="1.6"/>` +
    `<rect x="-9" y="12" width="18" height="14" fill="${C.card}" stroke="${C.ink}" stroke-width="2.2"/>` +
    `<path d="M-4.5 21.5V19a4.5 4.5 0 0 1 9 0v2.5" fill="none" stroke="${C.ink}" stroke-width="1.6"/>` +
    `<rect x="-6" y="19.5" width="3" height="4" rx="1" fill="${C.ink}"/><rect x="3" y="19.5" width="3" height="4" rx="1" fill="${C.ink}"/>` +
    `</g></g>`;
}

function raft(x, y) {
  let s = `<g transform="translate(${x} ${y})"><g class="bob">`;
  s += `<path d="M-38 12l6-4 6 4 6-4 6 4 6-4 6 4 6-4 6 4 6-4 6 4 6-4 6 4" fill="none" stroke="${C.white}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
  [C.orange, C.coral, C.orange, C.coral].forEach((c, i) => {
    s += `<rect x="-32" y="${-17 + i * 7}" width="64" height="8" rx="4" fill="${c}" stroke="${C.ink}" stroke-width="2.2"/>`;
  });
  s += `<path d="M-19 -18V12M19 -18V12" stroke="${C.ink}" stroke-width="2.6"/>`;
  s += `</g></g>`;
  return s;
}

// irregular angular chips of several colours; k scales chip size and spacing
function terrazzo(rnd, x, y, w, h, n, { k0 = 1, gap = 3, cols = [C.coral, C.teal, C.blue, C.pink, C.ink, C.lilac, C.green] } = {}) {
  let s = '';
  const placed = scatter(rnd, { x, y, w, h }, n, gap, () => ({ r: 3.4 * k0 }));
  placed.forEach((p, i) => {
    const k = 3 + Math.floor(rnd() * 2), r = (2.2 + rnd() * 2.4) * k0, a0 = rnd() * 6.28;
    const pts = [];
    for (let j = 0; j < k; j++) { const a = a0 + (j / k) * 6.28 + rnd() * 0.6; const rr = r * (0.7 + rnd() * 0.5); pts.push([p.x + rr * Math.cos(a), p.y + rr * Math.sin(a) * 0.8]); }
    s += `<path d="${polyD(pts)}" fill="${cols[i % cols.length]}"/>`;
  });
  return s;
}

function palm(rnd) {
  const base = [300, 198], ctl = [322, 128], top = [292, 64];
  const N = 11;
  const at = (t) => {
    const p = qpt(base, ctl, top, t);
    const p2 = qpt(base, ctl, top, Math.min(1, t + 0.01)), p1 = qpt(base, ctl, top, Math.max(0, t - 0.01));
    let dx = p2[0] - p1[0], dy = p2[1] - p1[1]; const d = Math.hypot(dx, dy); dx /= d; dy /= d;
    const hw = 8 - 3 * t;
    return { l: [p[0] - dy * hw, p[1] + dx * hw], r: [p[0] + dy * hw, p[1] - dx * hw] };
  };
  let bands = '', blacks = '';
  const outlineL = [], outlineR = [];
  for (let i = 0; i <= N; i++) { const a = at(i / N); outlineL.push(a.l); outlineR.push(a.r); }
  for (let i = 0; i < N; i++) {
    const quad = [outlineL[i], outlineL[i + 1], outlineR[i + 1], outlineR[i]];
    if (i % 2 === 0) blacks += polyD(quad);
  }
  const trunk = [...outlineL, ...outlineR.reverse()];
  bands = `<path d="${polyD(trunk)}" fill="${C.white}"/><path d="${blacks}" fill="${C.ink}"/>` +
    `<path d="${polyD(trunk)}" fill="none" stroke="${C.ink}" stroke-width="2.6"/>`;
  const crown = top;
  const back = [
    [[-18, -34], [-44, -30], C.leaf], [[18, -36], [46, -30], C.green], [[-2, -36], [6, -44], C.leaf, 9],
  ];
  const front = [
    [[-40, -26], [-74, -4], C.green], [[42, -26], [76, -2], C.leaf],
    [[-34, -12], [-60, 26], C.leaf], [[36, -12], [62, 28], C.green],
    [[-14, -6], [-30, 40], C.green, 10], [[16, -6], [32, 42], C.leaf, 10],
  ];
  let crownSvg = back.map((p) => frond(...p)).join('');
  crownSvg += front.map((p) => frond(...p)).join('');
  crownSvg += `<path d="${circD(-6, 5, 6.5)}${circD(6, 6, 6.5)}${circD(0, 12, 6)}" fill="${C.nut}" class="lt" style="stroke-width:4.4"/>`;
  return `<g transform="translate(${base[0]} ${base[1]})"><g class="sway"><g transform="translate(${-base[0]} ${-base[1]})">` +
    `${bands}<g transform="translate(${crown[0]} ${crown[1]})">${crownSvg}</g></g></g></g>`;
}

// fronds: an arching rib with a sawtooth of leaflets hanging below it.
// [control point, tip] relative to the crown.
function frond(c, tip, fill, wMax = 12) {
  const n = 16, rib = [], teeth = [];
  const side = tip[0] >= 0 ? 1 : -1;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const p = qpt([0, 0], c, tip, t);
    const p2 = qpt([0, 0], c, tip, Math.min(1, t + 0.02)), p1 = qpt([0, 0], c, tip, Math.max(0, t - 0.02));
    let dx = p2[0] - p1[0], dy = p2[1] - p1[1]; const d = Math.hypot(dx, dy); dx /= d; dy /= d;
    // (nx, ny) points to the underside of the rib
    const nx = -dy * side, ny = dx * side;
    const wv = wMax * Math.sin(Math.PI * Math.min(1, 0.12 + t * 0.95)) * (1 - t * 0.25);
    const saw = i % 2 ? 1 : 0.38;
    rib.push([p[0] - nx * 2.2 * (1 - t), p[1] - ny * 2.2 * (1 - t)]);
    teeth.push([p[0] + nx * wv * saw, p[1] + ny * wv * saw]);
  }
  return `<path d="${polyD([...rib, ...teeth.reverse()])}" fill="${fill}" class="lt" style="stroke-width:4.4"/>`;
}

// her: tiny and built from primitives, sitting on the sand facing right
function her() {
  const o = (d, w, c, extra = '') => `<path d="${d}" fill="none" stroke="${C.ink}" stroke-width="${w + 3}" stroke-linecap="round" stroke-linejoin="round"${extra}/>` +
    `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"${extra}/>`;
  let s = '';
  s += o('M1 -3L12 -16L19 -1', 4, '#e6b089');            // back leg
  s += o('M3 -2L16 -13L24 0', 4.4, C.skin);               // front leg
  s += `<path d="M22 0.5h4" stroke="${C.ink}" stroke-width="3" stroke-linecap="round"/>`;
  // cream shorts over both thighs, down to mid-thigh, so they read at a glance
  s += o('M-3 -4L8.5 -9.5', 10, C.cream);
  s += o('M-2 -7L-4 -24', 12, C.coral);                    // tank top
  s += o('M-3 -22L7 -17L14 -14', 3.4, C.skin);             // arm on the knee
  // head, nodding once per beat
  s += `<g transform="translate(-3 -30)"><g class="nod">`;
  s += o('M0 3L1 -2', 4, C.skin);
  s += `<circle cx="2" cy="-8" r="7.5" fill="${C.skin}" stroke="${C.ink}" stroke-width="2"/>`;
  s += `<path d="M8.6 -11.6A7.5 7.5 0 0 0 -5.4 -6.6L-2 -4.6Q1 -9 8.6 -11.6Z" fill="${C.hair}" stroke="${C.ink}" stroke-width="2" stroke-linejoin="round"/>`;
  s += `<circle cx="-7.5" cy="-8.5" r="3.8" fill="${C.hair}" stroke="${C.ink}" stroke-width="2"/>`;
  s += o('M-1 -10Q-1.5 -17.5 6 -15.6', 2.4, C.cream);      // headphone band
  s += `<rect x="-3.6" y="-11.5" width="6" height="7.5" rx="2.6" fill="${C.cream}" stroke="${C.ink}" stroke-width="2"/>`;
  s += `<path d="M5.6 -8.2q1.1 1 2.2 0" fill="none" stroke="${C.ink}" stroke-width="1.3" stroke-linecap="round"/>`;
  s += `</g></g>`;
  return s;
}

function sharkFin() {
  let s = '';
  s += `<path d="M-16 0C-8 -6 -2 -18 2 -33C4 -20 8 -8 16 0Z" fill="${C.fin}" stroke="${C.ink}" stroke-width="2.6" stroke-linejoin="round"/>`;
  s += `<path d="M-7 -22C-7 -42 13 -42 12 -22" fill="none" stroke="${C.ink}" stroke-width="5.4" stroke-linecap="round"/>`;
  s += `<path d="M-7 -22C-7 -42 13 -42 12 -22" fill="none" stroke="${C.cream}" stroke-width="2.6" stroke-linecap="round"/>`;
  s += `<rect x="-11" y="-27" width="7" height="10" rx="3" fill="${C.cream}" stroke="${C.ink}" stroke-width="2.2"/>`;
  s += `<rect x="9" y="-27" width="7" height="10" rx="3" fill="${C.cream}" stroke="${C.ink}" stroke-width="2.2"/>`;
  return s;
}

function coconutCrab() {
  const legs = (k) => {
    const sw = k ? 1 : -1;
    let d = '';
    [-6, -1, 4].forEach((x, i) => {
      const kick = (i % 2 ? sw : -sw) * 2;
      d += `M${x - 1} -4l${-3 + kick} 5M${x + 1} -4l${3 + kick} 5`;
    });
    return d;
  };
  return `<g class="legA"><path d="${legs(0)}" stroke="${C.red}" stroke-width="2.4" stroke-linecap="round"/></g>` +
    `<g class="legB"><path d="${legs(1)}" stroke="${C.red}" stroke-width="2.4" stroke-linecap="round"/></g>` +
    `<path d="M7 -6l4 -5M9 -5l5 -3" stroke="${C.red}" stroke-width="1.8" stroke-linecap="round"/>` +
    `<circle cx="11" cy="-11.5" r="1.6" fill="${C.ink}"/><circle cx="14.4" cy="-8.4" r="1.6" fill="${C.ink}"/>` +
    `<circle cx="0" cy="-11" r="8.5" fill="${C.nut}" stroke="${C.ink}" stroke-width="2.4"/>` +
    `<circle cx="-2.6" cy="-14" r="1.3" fill="${C.ink}"/><circle cx="1.4" cy="-15.2" r="1.3" fill="${C.ink}"/><circle cx="-0.2" cy="-11.6" r="1.3" fill="${C.ink}"/>`;
}

function bottle() {
  return `<g transform="rotate(-28)">` +
    `<rect x="-6" y="-10" width="12" height="18" rx="4" fill="#3cc07a" stroke="${C.ink}" stroke-width="2.2"/>` +
    `<rect x="-2.4" y="-16" width="4.8" height="7" fill="#3cc07a" stroke="${C.ink}" stroke-width="2.2"/>` +
    `<rect x="-2.8" y="-20" width="5.6" height="4.5" rx="1" fill="${C.card}" stroke="${C.ink}" stroke-width="2"/>` +
    `<rect x="-3" y="-6" width="6" height="9" rx="1" fill="${C.cream}" stroke="${C.ink}" stroke-width="1.4"/>` +
    `</g><path d="M-14 6l4-3 4 3 4-3 4 3 4-3 4 3 4-3" fill="none" stroke="${C.white}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`;
}

// ------------------------------------------------------------------ banner defs
function defsBanner(T) {
  const rnd = mulberry32(7);
  // the sea's squiggle tile: white and pale-blue marks kept clear of the tile
  // edges, so the tile repeats without seams
  const P = { w: 248, h: 84 };
  const marks = scatter(rnd, { x: 12, y: 10, w: P.w - 24, h: P.h - 20 }, 22, 9, (u) => (u < 0.55 ? MARKS[0] : u < 0.75 ? MARKS[2] : u < 0.9 ? MARKS[1] : MARKS[3]));
  const seaTile = marks.map((p, i) => `<use href="#${p.m.id}" class="${i % 3 === 2 ? 'sw2' : 'sw'}" transform="translate(${f(p.x, 1)} ${f(p.y, 1)}) rotate(${(p.a % 40) - 20})"/>`).join('');
  return [
    `<clipPath id="panel"><rect x="2" y="2" width="956" height="556" rx="26"/></clipPath>`,
    `<clipPath id="scr"><rect width="496" height="279"/></clipPath>`,
    `<pattern id="stripeV" width="16" height="16" patternUnits="userSpaceOnUse"><rect width="16" height="16" fill="${C.white}"/><rect width="8" height="16" fill="${C.ink}"/></pattern>`,
    `<pattern id="stripeH" width="14" height="14" patternUnits="userSpaceOnUse"><rect width="14" height="14" fill="${C.white}"/><rect width="14" height="7" fill="${C.ink}"/></pattern>`,
    `<pattern id="stripeD" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="10" height="10" fill="${C.white}"/><rect width="5" height="10" fill="${C.ink}"/></pattern>`,
    `<pattern id="stripeT" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)"><rect width="14" height="14" fill="${C.white}"/><rect width="7" height="14" fill="${C.ink}"/></pattern>`,
    `<pattern id="stripeS" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="${C.yellow}"/><rect width="8" height="4" fill="${C.ink}"/></pattern>`,
    `<pattern id="check" width="28" height="28" patternUnits="userSpaceOnUse"><rect width="28" height="28" fill="${C.white}"/><path d="M0 0h14v14H0zM14 14h14v14H14z" fill="${C.ink}"/></pattern>`,
    `<pattern id="seaPat" width="${P.w}" height="${P.h}" patternUnits="userSpaceOnUse" y="112">${seaTile}</pattern>`,
    MARK_DEFS,
    ...Object.entries(WORD).map(([k, L]) => `<path id="w${k}" d="${L.d}"/>`),
    T.defs(),
  ].join('\n');
}

// ------------------------------------------------------------------ animation
// Master loop: 60 s, the theme's 20 bars of 3 s. Every cycle below divides it.
const ANIM_CSS = [
  `.sw{fill:none;stroke:${C.white};stroke-width:2.6;stroke-linecap:round;stroke-linejoin:round}`,
  `.sw2{fill:none;stroke:${C.seaPale};stroke-width:2.6;stroke-linecap:round;stroke-linejoin:round}`,
  `.rays path{stroke:${C.ink};stroke-width:3;stroke-linecap:round}`,
  // letters: a hop, one after another, at the top of every bar
  `.hop{animation:hop 3s cubic-bezier(.3,0,.3,1) infinite both}`,
  `@keyframes hop{0%{transform:translateY(0) rotate(0)}5%{transform:translateY(-9px) rotate(-2.5deg)}10%{transform:translateY(1.5px) rotate(.8deg)}14%,100%{transform:translateY(0) rotate(0)}}`,
  // nod once per beat (80 BPM)
  `.nod{animation:nod .75s ease-in-out infinite}`,
  `@keyframes nod{0%,100%{transform:rotate(0)}35%{transform:rotate(9deg)}}`,
  `.bob{animation:bob 3s ease-in-out infinite}.bob2{animation:bob2 3s ease-in-out infinite}`,
  `@keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(2.5px)}}`,
  `@keyframes bob2{0%,100%{transform:translateY(0) rotate(-6deg)}50%{transform:translateY(3px) rotate(6deg)}}`,
  `.sway{animation:sway 6s ease-in-out infinite}`,
  `@keyframes sway{0%,100%{transform:rotate(-1.2deg)}50%{transform:rotate(1.2deg)}}`,
  `.rays{animation:rays 10s linear infinite}`,
  `@keyframes rays{to{transform:rotate(30deg)}}`,
  `.sea{animation:sea 20s linear infinite}`,
  `@keyframes sea{to{transform:translateX(-248px)}}`,
  `.scroll{animation:scroll 2s linear infinite}`,
  `@keyframes scroll{to{transform:translateX(19.8px)}}`,
  // clouds and the drone cross the sky and wrap while out of sight
  // (each starts at its home spot: the negative delay puts translateX(0) at t = 0)
  `.cl1{animation:cl1 60s linear infinite ${f((-250 / -580) * -60)}s}`,
  `@keyframes cl1{0%{transform:translateX(-250px)}100%{transform:translateX(330px)}}`,
  // cl2 sits in a scale(0.8) group, so its travel is in the group's own
  // units: -520 to 190 puts it fully off the left and right edges of the screen
  `.cl2{animation:cl2 60s linear infinite ${f((-520 / -710) * -60)}s}`,
  `@keyframes cl2{0%{transform:translateX(-520px)}100%{transform:translateX(190px)}}`,
  `.drone{animation:drone 30s linear infinite}`,
  `@keyframes drone{0%{transform:translateX(0)}30.6%{transform:translateX(230px)}30.7%,46.6%{transform:translateX(-400px)}100%{transform:translateX(0)}}`,
  // the coconut crab walks the beach in steps, turns, walks back
  `.crab{animation:crab 30s steps(1) infinite}`,
  `@keyframes crab{${crabFrames()}}`,
  `.legA{animation:legA .375s steps(1) infinite}.legB{opacity:0;animation:legB .375s steps(1) infinite}`,
  `@keyframes legA{0%{opacity:1}50%{opacity:0}}@keyframes legB{0%{opacity:0}50%{opacity:1}}`,
  // the bar counter
  `.bc{opacity:0}.bc.b1{opacity:1}`,
  `.bc{animation:bc 60s step-end infinite}`,
  `@keyframes bc{0%{opacity:1}5%,100%{opacity:0}}`,
  `.beat{animation:beat .75s ease-out infinite}`,
  `@keyframes beat{0%{transform:scale(1.25)}40%,100%{transform:scale(.8)}}`,
  `.click{animation:click 3s ease-out infinite}`,
  `@keyframes click{0%,8%,100%{transform:translate(0,0)}3%{transform:translate(1.5px,1.5px) scale(.94)}}`,
  `.blink{animation:blink 1.5s step-end infinite}`,
  `@keyframes blink{50%{opacity:0}}`,
  `@media (prefers-reduced-motion:reduce){*{animation:none!important}}`,
].join('');

// 30 s (half the master loop): 40 steps of one beat (0.75 s at 80 BPM), so
// every step lands on the beat; walks right 150 px in 15 steps, pauses for
// 5 beats, walks back, pauses again
function crabFrames() {
  const fr = [];
  const N = 40, half = 20, walk = 15, dx = 10;
  for (let i = 0; i < N; i++) {
    let x, flip;
    if (i < walk) { x = i * dx; flip = 1; } else if (i < half) { x = walk * dx; flip = 1; } else if (i < half + walk) { x = walk * dx - (i - half) * dx; flip = -1; } else { x = 0; flip = -1; }
    fr.push(`${f((i / N) * 100, 3)}%{transform:translateX(${f(x)}px) scaleX(${flip})}`);
  }
  return fr.join('');
}

// ------------------------------------------------------------------ wrap
function wrapSvg({ W, H, title, desc, css, defs, body }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="t d">
<title id="t">${xml(title)}</title>
<desc id="d">${xml(desc)}</desc>
<style>${css}</style>
<defs>
${defs}
</defs>
${body}
</svg>
`;
}

// =========================================================================
//                          THE CATALOGUE SHEET
// =========================================================================
// Eight "pieces" of the island, each presented on its own card like a page
// from a design catalogue: a flat colour panel with one big primitive behind
// the object, a black number tab, the piece's Italian name and two deadpan
// lines in English. Every piece is one of Castaway's own wholesome gags.
// Italian used (real, and meant): catalogo = catalogue; bottiglia = bottle;
// pacco = parcel; tartaruga = turtle; gatto = cat; squalo = shark;
// cocco = coconut; segnale = signal; caffè freddo = iced coffee;
// Gruppo Isolotto = "the Islet Group" (an invented collective).
const CARD = { w: 204, h: 236, art: 150 };
function arrowHead(end, from, size = 10) {
  let dx = end[0] - from[0], dy = end[1] - from[1];
  const d = Math.hypot(dx, dy); dx /= d; dy /= d;
  const tip = [end[0] + dx * size, end[1] + dy * size];
  const l = [end[0] - dy * size * 0.8, end[1] + dx * size * 0.8], r = [end[0] + dy * size * 0.8, end[1] - dx * size * 0.8];
  return `<path d="${polyD([tip, l, r])}" fill="${C.ink}" stroke="${C.ink}" stroke-width="2" stroke-linejoin="round"/>`;
}
const zig = (x0, y, n, step = 6, amp = 4, col = C.white, sw = 3) =>
  `<path d="M${x0} ${y}${Array.from({ length: n }, (_, i) => `l${step} ${i % 2 ? amp : -amp}`).join('')}" fill="none" stroke="${col}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>`;

const PIECES = [
  {
    it: 'BOTTIGLIA', en: ['A MESSAGE. IT WASHES', 'STRAIGHT BACK.'], bg: C.sky,
    back: () => `<circle cx="150" cy="58" r="46" fill="${C.yellow}" class="o" stroke-width="3"/><rect y="118" width="204" height="40" fill="${C.blue}"/>${zig(4, 124, 34)}`,
    art: () => {
      const a = [[46, 26], [64, -26], [10, -62], [-34, -46]];
      return `<path d="M${a[0][0]} ${a[0][1]}C${a[1][0]} ${a[1][1]} ${a[2][0]} ${a[2][1]} ${a[3][0]} ${a[3][1]}" fill="none" stroke="${C.ink}" stroke-width="5" stroke-linecap="round"/>` +
        arrowHead(a[3], a[2], 9) +
        `<g class="wob"><g transform="translate(-6 8) rotate(-24)">` +
        `<rect x="-18" y="-24" width="36" height="58" rx="12" fill="#3cc07a" stroke="${C.ink}" stroke-width="3"/>` +
        `<rect x="-7" y="-42" width="14" height="20" fill="#3cc07a" stroke="${C.ink}" stroke-width="3"/>` +
        `<rect x="-8.5" y="-52" width="17" height="11" rx="2" fill="${C.card}" stroke="${C.ink}" stroke-width="3"/>` +
        `<rect x="-10" y="-13" width="20" height="30" rx="2" fill="${C.cream}" stroke="${C.ink}" stroke-width="2.2"/>` +
        `<path d="M-6 -6H6M-6 0H6M-6 6H3" stroke="${C.ink}" stroke-width="1.8" stroke-linecap="round"/>` +
        `<path d="M11 -16V20" stroke="${C.white}" stroke-width="3.4" stroke-linecap="round"/></g></g>`;
    },
  },
  {
    it: 'PACCO', en: ['BY DRONE. CONTAINS:', 'MORE HEADPHONES.'], bg: C.pink,
    back: () => `<path d="M204 0V110L94 0Z" fill="url(#stripeD)" class="o" stroke-width="3"/><circle cx="34" cy="128" r="40" fill="${C.yellow}" class="o" stroke-width="3"/>`,
    art: () => `<g class="hover">` +
      `<path d="M-42 -40H42M-30 -40V-30M30 -40V-30" stroke="${C.ink}" stroke-width="4" stroke-linecap="round"/>` +
      `<ellipse cx="-30" cy="-44" rx="17" ry="3.6" fill="${C.white}" stroke="${C.ink}" stroke-width="2.6"/><ellipse cx="30" cy="-44" rx="17" ry="3.6" fill="${C.white}" stroke="${C.ink}" stroke-width="2.6"/>` +
      `<rect x="-25" y="-34" width="50" height="19" rx="8" fill="${C.lilac}" stroke="${C.ink}" stroke-width="3"/><circle cx="0" cy="-24" r="4" fill="${C.ink}"/>` +
      `<path d="M-14 -15L-20 2M14 -15L20 2" stroke="${C.ink}" stroke-width="2.4"/>` +
      `<rect x="-28" y="0" width="56" height="44" fill="${C.card}" stroke="${C.ink}" stroke-width="3"/>` +
      `<rect x="-6" y="0" width="12" height="12" fill="url(#stripeD)" stroke="${C.ink}" stroke-width="2"/>` +
      `<path d="M-11 34V27a11 11 0 0 1 22 0v7" fill="none" stroke="${C.ink}" stroke-width="3.2"/>` +
      `<rect x="-15" y="26" width="8" height="12" rx="3" fill="${C.cream}" stroke="${C.ink}" stroke-width="2.4"/><rect x="7" y="26" width="8" height="12" rx="3" fill="${C.cream}" stroke="${C.ink}" stroke-width="2.4"/>` +
      `</g>`,
  },
  {
    it: 'TARTARUGA', en: ['VISITS. STAYS A BIT.', 'SAYS NOTHING.'], bg: C.yellow,
    back: () => `<path d="M204 150V60A90 90 0 0 0 114 150Z" fill="${C.teal}" class="o" stroke-width="3"/><rect y="124" width="204" height="30" fill="${C.sand}" class="o" stroke-width="3"/>`,
    art: () => `<g transform="translate(-6 10)"><g class="wob">` +
      `<rect x="-38" y="14" width="14" height="16" rx="6" fill="${C.leaf}" stroke="${C.ink}" stroke-width="3"/><rect x="20" y="14" width="14" height="16" rx="6" fill="${C.leaf}" stroke="${C.ink}" stroke-width="3"/>` +
      `<circle cx="50" cy="-2" r="13" fill="${C.leaf}" stroke="${C.ink}" stroke-width="3"/><circle cx="55" cy="-6" r="2.4" fill="${C.ink}"/><path d="M52 3q4 3 8 0" fill="none" stroke="${C.ink}" stroke-width="2" stroke-linecap="round"/>` +
      `<clipPath id="shell"><path d="M-44 14A44 40 0 0 1 44 14Z"/></clipPath>` +
      `<path d="M-44 14A44 40 0 0 1 44 14Z" fill="${C.green}"/>` +
      `<g clip-path="url(#shell)">${zig(-48, -4, 16, 6, 7, C.ink, 3)}${[[-26, 4], [-8, -14], [12, 4], [28, -8], [-30, -10], [4, -26]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.4" fill="${C.yellow}" stroke="${C.ink}" stroke-width="1.6"/>`).join('')}</g>` +
      `<path d="M-44 14A44 40 0 0 1 44 14Z" fill="none" stroke="${C.ink}" stroke-width="3"/>` +
      `<rect x="-48" y="12" width="96" height="9" rx="4.5" fill="${C.leaf}" stroke="${C.ink}" stroke-width="3"/>` +
      `</g></g>`,
  },
  {
    it: 'GATTO', en: ['ARRIVES ON A CRATE.', 'NAPS UP THE PALM.'], bg: C.lilac,
    back: () => `<circle cx="102" cy="64" r="56" fill="${C.white}" class="o" stroke-width="3"/><circle cx="102" cy="64" r="56" fill="url(#dots)"/><rect y="128" width="204" height="30" fill="${C.blue}"/>${zig(4, 134, 34)}`,
    art: () => {
      const grey = '#9a9ba6';
      return `<g transform="translate(0 4)">` +
        `<g class="bob">` +
        `<rect x="-42" y="8" width="84" height="40" fill="${C.card}" stroke="${C.ink}" stroke-width="3"/>` +
        `<path d="M-42 21H42M-42 34H42M-36 44L36 12" stroke="${C.ink}" stroke-width="2.2"/>` +
        `<path d="M20 4C46 4 46 -26 30 -30" fill="none" stroke="${C.ink}" stroke-width="10" stroke-linecap="round"/>` +
        `<path d="M20 4C46 4 46 -26 30 -30" fill="none" stroke="${grey}" stroke-width="5" stroke-linecap="round"/>` +
        `<path d="M-24 8C-26 -18 -15 -32 0 -32C15 -32 26 -18 24 8Z" fill="${grey}" stroke="${C.ink}" stroke-width="3" stroke-linejoin="round"/>` +
        `<path d="M-21 -10q6 3 9-2M-23 -1q6 3 9-2M21 -10q-6 3-9-2M23 -1q-6 3-9-2" fill="none" stroke="${C.ink}" stroke-width="2.4" stroke-linecap="round"/>` +
        `<path d="M-9 8C-11 -8 -6 -16 0 -16C6 -16 11 -8 9 8Z" fill="${C.white}"/>` +
        `<ellipse cx="-7" cy="8" rx="6" ry="3.6" fill="${C.white}" stroke="${C.ink}" stroke-width="2"/><ellipse cx="7" cy="8" rx="6" ry="3.6" fill="${C.white}" stroke="${C.ink}" stroke-width="2"/>` +
        `<g transform="translate(0 -44)"><g class="nap">` +
        `<path d="M-16 -6L-13 -24L-2 -14ZM16 -6L13 -24L2 -14Z" fill="${grey}" stroke="${C.ink}" stroke-width="3" stroke-linejoin="round"/>` +
        `<circle r="17" fill="${grey}" stroke="${C.ink}" stroke-width="3"/>` +
        `<path d="M-4 -16v6M0 -17v7M4 -16v6" stroke="${C.ink}" stroke-width="2.2" stroke-linecap="round"/>` +
        `<path d="M-10 0q3 3 6 0M4 0q3 3 6 0" fill="none" stroke="${C.ink}" stroke-width="2.2" stroke-linecap="round"/>` +
        `<path d="M-2.4 5h4.8l-2.4 2.6z" fill="${C.pink}" stroke="${C.ink}" stroke-width="1.4" stroke-linejoin="round"/>` +
        `</g></g></g></g>`;
    },
  },
  {
    it: 'SQUALO', en: ['WEARS HEADPHONES.', 'NODS ON THE BEAT.'], bg: C.mint,
    back: () => `<circle cx="40" cy="44" r="30" fill="${C.yellow}" class="o" stroke-width="3"/><rect y="100" width="204" height="58" fill="${C.blue}"/>${zig(4, 106, 34)}`,
    art: () => `<g transform="translate(4 26) scale(2.1)"><g class="nod">${sharkFin()}</g></g>` +
      `${zig(-52, 28, 18, 6, 4, C.white, 3.4)}` +
      `<g class="note"><path d="M-58 -36V-58l18-5v21" fill="none" stroke="${C.ink}" stroke-width="3" stroke-linejoin="round"/>` +
      `<ellipse cx="-61" cy="-36" rx="5" ry="4" fill="${C.ink}"/><ellipse cx="-43" cy="-41" rx="5" ry="4" fill="${C.ink}"/></g>`,
  },
  {
    it: 'COCCO', en: ['LANDS ON A CRAB.', 'WALKS OFF WITH IT.'], bg: C.orange,
    back: () => `<rect y="0" width="204" height="54" fill="url(#stripeV)" class="o" stroke-width="3"/><rect y="118" width="204" height="40" fill="${C.sand}" class="o" stroke-width="3"/>`,
    art: () => `<g transform="translate(-6 50) scale(3.5)"><g class="shuffle">${coconutCrab()}</g></g>`,
  },
  {
    it: 'SEGNALE', en: ['ONE BAR. ONLY AT', 'THE TOP OF THE PALM.'], bg: C.teal,
    back: () => `<path d="M14 150A90 90 0 0 1 194 150Z" fill="${C.yellow}" class="o" stroke-width="3"/><rect x="150" y="-4" width="58" height="58" fill="url(#check)" class="o" stroke-width="3"/>`,
    art: () => {
      let s = `<g transform="translate(-14 40)">`;
      s += `<path d="M-6 60L-2 6H6L10 60Z" fill="${C.white}" stroke="${C.ink}" stroke-width="3"/><path d="M-5.2 50H9.2L8.6 42H-4.6ZM-4 34H8L7.4 26H-3.4ZM-2.8 18H6.8L6.3 10H-2.3Z" fill="${C.ink}"/>`;
      s += [[[-30, -20], [-52, 4], C.green], [[30, -20], [54, 6], C.leaf], [[-20, -10], [-36, 24], C.leaf, 10], [[20, -10], [38, 24], C.green, 10], [[-4, -26], [-14, -36], C.leaf, 9], [[6, -26], [18, -34], C.green, 9]]
        .map((p) => `<g transform="translate(2 4)">${frond(...p)}</g>`).join('');
      s += `</g>`;
      s += `<g class="wob"><g transform="translate(-14 -6) rotate(-8)"><rect x="-15" y="-44" width="30" height="50" rx="6" fill="${C.ink}"/><rect x="-11" y="-38" width="22" height="34" fill="${C.sky}"/><circle cx="0" cy="1.5" r="2" fill="${C.white}"/></g></g>`;
      const bars = [6, 12, 18, 24];
      bars.forEach((h, i) => { s += `<rect x="${20 + i * 10}" y="${-10 - h}" width="7" height="${h}" fill="${i ? C.white : C.pink}" stroke="${C.ink}" stroke-width="2.4"/>`; });
      return s;
    },
  },
  {
    it: 'CAFFÈ FREDDO', en: ['WALKS OFF ON THE SEA.', 'COMES BACK WITH ONE.'], bg: C.coral,
    back: () => `<circle cx="150" cy="70" r="50" fill="${C.blue}" class="o" stroke-width="3"/><rect y="126" width="204" height="30" fill="${C.sky}"/>${zig(4, 132, 34, 6, 4, C.white)}`,
    art: () => `<g transform="translate(-10 6)"><g class="wob">` +
      `<g transform="rotate(14 8 -40)"><rect x="4" y="-82" width="8" height="52" fill="url(#stripeR)" stroke="${C.ink}" stroke-width="2.6"/></g>` +
      `<clipPath id="cup"><path d="M-24 -30L24 -30L18 40L-18 40Z"/></clipPath>` +
      `<path d="M-24 -30L24 -30L18 40L-18 40Z" fill="${C.white}"/>` +
      `<g clip-path="url(#cup)"><rect x="-30" y="-12" width="60" height="60" fill="${C.nut}"/><path d="M-30 -12q10 6 20 0t20 0 20 0" fill="none" stroke="${C.cream}" stroke-width="3"/>` +
      `<rect x="-16" y="-20" width="14" height="14" rx="2" transform="rotate(14 -9 -13)" fill="${C.white}" stroke="${C.ink}" stroke-width="2"/>` +
      `<rect x="2" y="-14" width="13" height="13" rx="2" transform="rotate(-10 8 -8)" fill="${C.white}" stroke="${C.ink}" stroke-width="2"/></g>` +
      `<path d="M-21.8 4L21.8 4L20.5 20L-20.5 20Z" fill="${C.pink}" stroke="${C.ink}" stroke-width="2.6"/>` +
      `<path d="M-24 -30L24 -30L18 40L-18 40Z" fill="none" stroke="${C.ink}" stroke-width="3" stroke-linejoin="round"/>` +
      `<path d="M-29 -30H29V-35Q0 -52 -29 -35Z" fill="${C.white}" stroke="${C.ink}" stroke-width="3" stroke-linejoin="round"/>` +
      `</g></g>`,
  },
];

function card(T, i, x, y, P) {
  const { w, h, art } = CARD;
  let s = `<g transform="translate(${x} ${y})">`;
  s += `<rect x="8" y="8" width="${w}" height="${h}" fill="${C.ink}"/>`;
  s += `<rect width="${w}" height="${h}" fill="${C.white}"/>`;
  s += `<rect width="${w}" height="${art}" fill="${P.bg}"/>`;
  s += `<g clip-path="url(#art)">${P.back()}</g>`;
  s += `<g clip-path="url(#art)"><g transform="translate(${w / 2} ${art / 2 + 2})">${P.art()}</g></g>`;
  s += `<path d="M0 ${art}H${w}" stroke="${C.ink}" stroke-width="3"/>`;
  s += `<rect width="${w}" height="${h}" fill="none" stroke="${C.ink}" stroke-width="3.5"/>`;
  // number tab
  const num = `N° ${String(i + 1).padStart(2, '0')}`;
  const nt = { cap: 10, sw: 1.9, track: 1.2 };
  s += `<rect x="-2" y="-2" width="${f(T.width(num, nt) + 16)}" height="22" fill="${C.ink}"/>`;
  s += T.text(num, 7, 4, { ...nt, color: C.white });
  // label
  const it = { cap: 16, sw: 2.5, track: 1.3 };
  const fitIt = Math.min(1, (w - 24) / T.width(P.it, it));
  s += T.text(P.it, 12, art + 14, { ...it, cap: it.cap * fitIt });
  P.en.forEach((l, k) => {
    const ew = T.width(l, { cap: 10, sw: 1.7, track: 1.1 });
    if (12 + ew > w - 8) console.warn(`card ${i + 1} line "${l}" is ${f(ew)} wide`);
    s += T.text(l, 12, art + 42 + k * 17, { cap: 10, sw: 1.7, track: 1.1 });
  });
  s += `</g>`;
  return s;
}

function catalogo() {
  const W = 960, H = 660;
  const T = new Type();
  const rnd = mulberry32(1981);
  const out = [];
  const { w: CW, h: CH } = CARD;
  const gap = 24, x0 = (W - (4 * CW + 3 * gap)) / 2, y0 = 124, rowGap = 34;
  const cards = [];
  for (let i = 0; i < 8; i++) cards.push({ x: x0 + (i % 4) * (CW + gap), y: y0 + Math.floor(i / 4) * (CH + rowGap) });
  const inCards = (x, y, r) => cards.some((c) => x + r > c.x + 4 && x - r < c.x + CW + 4 && y + r > c.y + 4 && y - r < c.y + CH + 4);

  out.push(`<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="26" fill="#dff6ec"/>`);
  out.push(`<g clip-path="url(#panelC)">`);
  out.push(`<g class="mk">${laminate(rnd, { x: -10, y: -10, w: W + 20, h: H + 20 }, 700, { gap: 9, avoid: inCards })}</g>`);
  // a few big shapes behind the cards
  out.push(`<circle cx="${W - 30}" cy="${H - 20}" r="120" fill="${C.pink}" class="o" stroke-width="4"/>`);
  out.push(`<path d="M0 300L130 430L0 560Z" fill="${C.yellow}" class="o" stroke-width="4"/>`);
  // title: a black strip and a pink chip
  const tt = { cap: 27, sw: 3.8, track: 1.5 };
  const title = 'CATALOGO 1992';
  const tw = T.width(title, tt);
  out.push(`<g transform="translate(36 34) rotate(-2.5)"><rect x="8" y="8" width="${f(tw + 36)}" height="54" fill="${C.ink}"/><rect width="${f(tw + 36)}" height="54" fill="${C.ink}" stroke="${C.ink}" stroke-width="3"/>${T.text(title, 18, 13.5, { ...tt, color: C.white })}</g>`);
  const ch = chip(T, { x: 36 + tw + 70, y: 26, lines: ['EIGHT PIECES THAT TURN UP', 'ON THEIR OWN. ASSEMBLY NOT', 'REQUIRED. WAITING IS.'], cap: 11.5, sw: 1.9, lh: 1.55, fill: C.pink, rot: 1.5 });
  if (36 + tw + 70 + ch.w > W - 124) console.warn(`catalogue chip reaches ${f(36 + tw + 70 + ch.w)}`);
  out.push(ch.svg);
  // the maker's stamp, top right
  out.push(`<g transform="translate(${W - 72} 66) rotate(12)"><circle r="47" fill="${C.yellow}" stroke="${C.ink}" stroke-width="3.5"/><circle r="40" fill="none" stroke="${C.ink}" stroke-width="1.6" stroke-dasharray="3 4"/>` +
    T.text('GRUPPO', 0, -16, { cap: 8.6, sw: 1.8, track: 1, anchor: 'middle' }) +
    T.text('ISOLOTTO', 0, -1, { cap: 8.6, sw: 1.8, track: 1, anchor: 'middle' }) +
    `<path d="M-13 17H13" stroke="${C.ink}" stroke-width="2.4" stroke-linecap="round"/></g>`);
  PIECES.forEach((P, i) => out.push(card(T, i, cards[i].x, cards[i].y, P)));
  out.push(`</g>`);
  out.push(`<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="26" fill="none" stroke="${C.ink}" stroke-width="4"/>`);

  const css = [BASE_CSS, MARK_CSS,
    `.nod{animation:nod .75s ease-in-out infinite}@keyframes nod{0%,100%{transform:rotate(0)}35%{transform:rotate(9deg)}}`,
    `.wob{animation:wob 3s ease-in-out infinite}@keyframes wob{0%,100%{transform:rotate(-3deg)}50%{transform:rotate(3deg)}}`,
    `.hover{animation:hover 3s ease-in-out infinite}@keyframes hover{0%,100%{transform:translateY(-3px)}50%{transform:translateY(3px)}}`,
    `.bob{animation:bob 3s ease-in-out infinite}@keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(3px)}}`,
    `.nap{animation:nap 6s ease-in-out infinite}@keyframes nap{0%,100%{transform:rotate(-4deg)}50%{transform:rotate(4deg) translateY(1px)}}`,
    `.note{animation:note 1.5s steps(2) infinite}@keyframes note{0%{transform:translateY(0)}100%{transform:translateY(-8px)}}`,
    `.shuffle{animation:shuffle 1.5s steps(4) infinite}@keyframes shuffle{0%,100%{transform:translateX(-3px)}50%{transform:translateX(3px)}}`,
    `.legA{animation:legA .375s steps(1) infinite}.legB{opacity:0;animation:legB .375s steps(1) infinite}`,
    `@keyframes legA{0%{opacity:1}50%{opacity:0}}@keyframes legB{0%{opacity:0}50%{opacity:1}}`,
    `@media (prefers-reduced-motion:reduce){*{animation:none!important}}`,
  ].join('');
  const defs = [
    `<clipPath id="panelC"><rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="26"/></clipPath>`,
    `<clipPath id="art"><rect width="${CW}" height="${CARD.art}"/></clipPath>`,
    `<pattern id="stripeV" width="16" height="16" patternUnits="userSpaceOnUse"><rect width="16" height="16" fill="${C.white}"/><rect width="8" height="16" fill="${C.ink}"/></pattern>`,
    `<pattern id="stripeD" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="10" height="10" fill="${C.white}"/><rect width="5" height="10" fill="${C.ink}"/></pattern>`,
    `<pattern id="stripeR" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="${C.white}"/><rect width="8" height="4" fill="${C.red}"/></pattern>`,
    `<pattern id="check" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="${C.white}"/><path d="M0 0h10v10H0zM10 10h10v10H10z" fill="${C.ink}"/></pattern>`,
    `<pattern id="dots" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="7" cy="7" r="2.4" fill="${C.ink}"/></pattern>`,
    MARK_DEFS,
    T.defs(),
  ].join('\n');
  const desc = 'A page from an imaginary design catalogue, CATALOGO 1992, on a pale mint laminate with black squiggles, stamped GRUPPO ISOLOTTO. A pink sticker says: eight pieces that turn up on their own; assembly not required, waiting is. Eight cards, each a flat colour panel with a big shape behind one object, a number tab, an Italian name and two lines in English. 01 BOTTIGLIA: a green bottle with a note, and an arrow looping back: a message, it washes straight back. 02 PACCO: a drone carrying a parcel with headphones on it: by drone, contains more headphones. 03 TARTARUGA: a turtle with a zigzag shell: visits, stays a bit, says nothing. 04 GATTO: a grey tabby cat with a white chest napping on a floating crate: arrives on a crate, naps up the palm. 05 SQUALO: a shark fin wearing cream headphones, nodding, with a music note: wears headphones, nods on the beat. 06 COCCO: a coconut walking on crab legs: lands on a crab, walks off with it. 07 SEGNALE: a phone above a palm crown with one signal bar of four: one bar, only at the top of the palm. 08 CAFFE FREDDO: an iced coffee with a striped straw: walks off on the sea, comes back with one.';
  return wrapSvg({ W, H, title: 'CASTAWAY catalogue: eight pieces that turn up on their own', desc, css, defs, body: out.join('\n') });
}

// =========================================================================
//                          THE DIVIDER STRIP
// =========================================================================
// The laminate itself, cut into a strip, for between README sections.
function divider() {
  const W = 960, H = 40;
  const rnd = mulberry32(6);
  const body = `<rect x="2" y="4" width="${W - 4}" height="${H - 8}" rx="16" fill="${C.paper}"/>` +
    `<g clip-path="url(#pill)"><g class="mk">${laminate(rnd, { x: 0, y: 2, w: W, h: H - 4 }, 140, { gap: 6, colourShare: 0.4 })}</g>` +
    `<rect x="420" y="4" width="120" height="${H - 8}" fill="url(#stripeV)"/><path d="M420 4V${H - 4}M540 4V${H - 4}" stroke="${C.ink}" stroke-width="3"/></g>` +
    `<rect x="2" y="4" width="${W - 4}" height="${H - 8}" rx="16" fill="none" stroke="${C.ink}" stroke-width="3"/>`;
  const defs = `<clipPath id="pill"><rect x="2" y="4" width="${W - 4}" height="${H - 8}" rx="16"/></clipPath>` +
    `<pattern id="stripeV" width="16" height="16" patternUnits="userSpaceOnUse"><rect width="16" height="16" fill="${C.white}"/><rect width="8" height="16" fill="${C.ink}"/></pattern>` + MARK_DEFS;
  return wrapSvg({ W, H, title: 'Laminate divider', desc: 'A strip of warm white laminate with small black squiggles, zigzags and coloured confetti, and a black-and-white striped block in the middle.', css: MARK_CSS, defs, body });
}

// =================================================================== write
fs.mkdirSync(ASSETS, { recursive: true });
const files = [[`${SLUG}.svg`, banner()], [`${SLUG}-catalogo.svg`, catalogo()], [`${SLUG}-divider.svg`, divider()]];
for (const [name, svg] of files) {
  fs.writeFileSync(path.join(ASSETS, name), svg);
  console.log(`wrote ${name} (${(Buffer.byteLength(svg) / 1024).toFixed(1)} KB)`);
}
