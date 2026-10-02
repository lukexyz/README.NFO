#!/usr/bin/env node
// Castaway README header: "Swapper's Floppy" (115-swapper-floppy_opus_5.5), catalogue entry print-01.
//
// The look is the late-80s / early-90s mail-swapping scene's 3.5-inch disk, as it came out of
// the envelope: a hand-labelled shell, "disk 1 of N", the label written in three hands (marker
// capitals built from parallel strokes, quick ballpoint, a 9-pin dot-matrix file list) and a
// group's pre-printed sticker scribbled over in pencil. Nothing is copied from any scanned label,
// sticker or logo; every letter is drawn here, and the shells carry no maker's name.
//
// The twist: this swap arrived by bottle. The banner is a flat lay on the island's own sand:
// a stack of disks (disk 1 in front, labelled CASTAWAY, with the tabs of disks 3, 4 and 5 behind
// it), disk 2 pulled out to read its printed list of gags, an empty bottle at the water's edge,
// its cork, and the unrolled letter. The sea washes in and out in one corner and the shutter of
// disk 1 slides open now and then, the way everyone fiddled with them. That is all the motion.
//
// Three small single-disk images head the README's later sections, the way a swap set had a
// "disk N of 5" for each part: disk 3 (timers, dot-matrix printout), disk 4 (sound, pencil
// over the swap club's pre-printed sticker) and disk 5 (run it, marker and ballpoint).
//
//   node examples/castaway/src/115-swapper-floppy_opus_5.5.mjs
// writes examples/castaway/assets/115-swapper-floppy_opus_5.5.svg (the animated banner)
// and 115-swapper-floppy_opus_5.5-disk3.svg, -disk4.svg and -disk5.svg (static).
//
// Swap club and handle ("Salt Damage", "ferric") are invented. Activity ids on the labels
// are real ids from the project's activities.toml, checked on 2026-10-01.
//
// Plain Node, no dependencies, deterministic (one seeded PRNG, no clock). No <text>: the
// handwriting is a single-stroke font defined below (smoothed with a Catmull-Rom spline and
// jittered letter by letter), the marker logo is the same skeletons stroked in layers, and the
// dot-matrix print is a 5 x 7 dot font with descenders, one <path> of round dots per glyph,
// placed with <use>. Animation is CSS only; prefers-reduced-motion stops it with the shutter
// shut and the sea at rest.

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const SLUG = '115-swapper-floppy_opus_5.5';
const OUT = resolve(here, `../assets/${SLUG}.svg`);

// ------------------------------------------------------------------ basics
const W = 1000;
const H = 560;
const DW = 350; // disk width in px; a 3.5-inch shell is 90 x 94 mm
const S = DW / 90; // px per mm
const mm = (v) => v * S;
const DH = mm(94);

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
let rnd = mulberry32(1992);
const J = (a) => (rnd() * 2 - 1) * a;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const n1 = (v) => {
  const s = (Math.round(v * 10) / 10).toString();
  return s === '-0' ? '0' : s;
};
const n2 = (v) => {
  const s = (Math.round(v * 100) / 100).toString();
  return s === '-0' ? '0' : s;
};

// ------------------------------------------------------------------ inks
const INK = {
  ball: '#1f3c9b', // blue ballpoint
  marker: '#141414', // black marker
  pencil: '#67645e', // grey pencil
  felt: '#d4322a', // red felt-tip
  coral: '#f0775a', // coral felt-tip (her tank top, the logo fill)
  paper: '#f3efe2',
};

// ------------------------------------------------------------------ handwriting
// Single-stroke glyphs. Box: baseline y = 0, x-height 10, cap height 16, y grows upwards.
// [advance, stroke, stroke, ...]; a stroke is "x,y x,y ..." in pen order; "!" marks a corner.
// (Technique after the pencil-on-paper generator in examples/ultra-satisfactory.)
const BOWL = '7.6,7.8 5.6,9.9 3,9.6 1,7 0.6,4 1.8,1.2 4,0 6.2,1.6 7.6,5';
const OVAL = '5.4,16 2.4,14.2 0.7,8 2.2,2 5,0 7.9,2 9.4,8 7.9,14 4.8,16';
const GLYPHS = {
  A: [10, '0,0! 5,16! 10,0', '2.1,5.6 8,5.9'],
  B: [10, '1,16! 1,0', '0.4,16! 5,16.1 8,14.6 8.3,11.6 5.6,9 1.2,8.5! 6,8.4 9.3,6.3 9.4,3 6.8,0.4 0.4,0'],
  C: [10, '9,12.8 7.2,15.4 4.6,16 1.8,13.6 0.6,8 1.8,2.6 4.8,0 7.6,0.8 9.4,3.4'],
  D: [10.5, '1.2,16! 1.2,0', '0.3,16! 4.6,15.9 8.6,13 9.9,8 8.6,3 4.6,0.1 0.3,0'],
  E: [9.5, '8.6,16! 1,16! 1,0! 9,0', '1,8.3 7,8.5'],
  F: [9, '9,16! 1,16! 1,0', '1,8.3 6.8,8.5'],
  G: [10.5, '9,12.8 7.2,15.4 4.6,16 1.8,13.6 0.6,8 1.8,2.6 4.8,0 7.8,0.9 9.5,3.6 9.6,7.2! 5.6,7.2'],
  H: [10, '1,16! 1,0', '9,16! 9,0', '1,8.2 9,8.5'],
  I: [6, '0.6,16 5.4,16', '3,16! 3,0', '0.6,0 5.4,0'],
  K: [10, '1.2,16! 1.2,0', '9,16! 1.4,7.2', '4.2,9.6! 9.6,0'],
  L: [9, '1.2,16! 1.2,0! 8.6,0'],
  M: [12, '1,0! 1,16! 6,5! 11,16! 11,0'],
  N: [10, '1,0! 1,16! 9,0! 9,16'],
  O: [10, OVAL],
  P: [9.5, '1.2,16! 1.2,0', '0.4,16! 5.4,16 8.7,14.2 9,11 6.2,8.2 1.2,7.8'],
  R: [10, '1.2,16! 1.2,0', '0.4,16! 5.4,16 8.7,14.2 9,11.2 6.2,8.4 1.2,8! 4.6,8! 9.6,0'],
  S: [9.5, '8.8,13.2 7,15.5 4.6,16 1.9,14.8 1,12.2 2.4,9.4 5,8.2 7.8,6.6 9,4 8,1.4 5,0 2,0.7 0.5,3.2'],
  T: [10, '0,16 10,16', '5,16! 5,0'],
  U: [10, '1,16 1,5.4 2.2,1.6 5,0 7.8,1.6 9,5.4 9,16'],
  V: [10, '0.5,16! 5,0! 9.5,16'],
  W: [14, '0.5,16! 3.6,0! 7,11! 10.4,0! 13.5,16'],
  Y: [10, '0.5,16! 5,8! 9.5,16', '5,8! 5,0'],
  a: [10, BOWL, '7.7,10! 7.7,2.4 8.3,0.5 9.6,0.6'],
  b: [9.5, '1.2,16.5! 1.2,0', '1.2,6.4 3,9.2 5.6,10 8,8.2 8.6,5 7.6,1.6 5.2,0 2.8,0.8 1.2,3.2'],
  c: [8.5, '7.6,7.8 5.8,9.9 3.2,9.6 1.1,7 0.6,4 1.8,1.1 4.4,0 6.8,0.9 8,2.6'],
  d: [10, BOWL, '7.7,16.5! 7.7,2.4 8.3,0.5 9.6,0.6'],
  e: [9, '1.1,5! 7.9,5.5! 7.3,8.2 5.3,10 3,9.5 1.2,7.2 0.7,4 1.9,1.1 4.5,0 7,0.8 8.3,2.6'],
  f: [7, '7,14.6 5.8,16.4 4.2,16 3.3,13.6 3.2,8 3.2,0', '0.6,9.6 6.2,9.9'],
  g: [9.5, BOWL, '7.7,10! 7.7,-2.4 6.6,-5.2 4.2,-6 1.6,-5'],
  h: [9.5, '1.2,16.5! 1.2,0', '1.2,6 3,9 5.4,10 7.5,8.6 8,6 8,0'],
  i: [4, '1.6,10! 1.6,2.2 2.1,0.5 3.3,0.5', '1.5,13.4 1.8,13.9'],
  j: [4.8, '3.2,10! 3.2,-3 2.2,-5.4 0.2,-5.6', '3.1,13.4 3.4,13.9'],
  k: [8.5, '1.2,16.5! 1.2,0', '7.4,10! 1.4,4.4', '3.4,6.2! 8,0'],
  l: [4, '1.6,16.5! 1.6,2.2 2.1,0.5 3.4,0.5'],
  m: [13.5, '1.2,10! 1.2,0', '1.2,6.4 2.8,9.2 4.8,10 6.3,8.6 6.6,6 6.6,0', '6.6,6.4 8.2,9.2 10.2,10 11.7,8.6 12,6 12,0'],
  n: [9.5, '1.2,10! 1.2,0', '1.2,6 3,9 5.4,10 7.5,8.6 8,6 8,0'],
  o: [9.5, '4.8,10 2.4,9 0.8,5 2,1.2 4.6,0 7.2,1.2 8.5,5 7.2,8.8 4.4,9.9'],
  p: [9.5, '1.2,10! 1.2,-6', '1.2,6.4 3,9.2 5.6,10 8,8.2 8.6,5 7.6,1.6 5.2,0 2.8,0.8 1.2,3.2'],
  q: [9.2, BOWL, '7.7,10! 7.7,-6'],
  r: [7.5, '1.2,10! 1.2,0', '1.2,6 2.8,8.8 4.8,10 7,9.2'],
  s: [8, '7,8.2 5.4,9.8 3.4,10 1.6,9 1.2,7 2.8,5.6 5.2,4.6 7,3.2 7,1.4 5.2,0.1 3,0 0.8,1.4'],
  t: [7.5, '3.2,14.5! 3.2,2.6 3.9,0.6 5.4,0.2 6.8,1.2', '0.4,9.7 6.4,10'],
  u: [10, '1.2,10 1.2,4 2.2,1 4.3,0 6.3,1.2 7.8,4.4', '7.8,10! 7.8,2.2 8.4,0.4 9.6,0.6'],
  v: [8.5, '0.6,10! 4.2,0! 8,10'],
  w: [12, '0.6,10! 3.1,0! 6,8! 9,0! 11.5,10'],
  x: [8.4, '0.8,10! 7.6,0', '7.6,10! 0.8,0'],
  y: [8.8, '0.8,10! 4.5,0.8', '8.2,10! 3.4,-3.4 1.9,-5.4 0.1,-5.7'],
  z: [8.8, '0.8,10! 7.6,10! 0.8,0! 8,0'],
  0: [9, '4.6,16 2,14 0.8,8 2,2 4.5,0 7,2 8.2,8 7,14 4.2,16'],
  1: [7, '1,12.4! 4.6,16! 4.6,0'],
  2: [9.5, '1,12.4 2.4,15.2 5,16 7.4,14.8 8,12 6.4,8.6 0.8,0! 8.8,0'],
  3: [9.5, '1,14 3,15.8 5.4,16 7.7,14.3 7.5,11 4.4,8.6! 7.4,7.6 8.6,4.6 7.5,1.6 4.8,0 2,0.5 0.6,2.6'],
  4: [10, '7,0! 7,16! 0.5,5! 9.8,5'],
  5: [9.5, '8.4,16! 2,16! 1.5,9.2! 4.4,10.2 7.4,9 8.7,5.6 7.4,1.8 4.4,0 1.8,0.6 0.5,2.6'],
  6: [9, '8,14.6 6,16 3.6,15 1.6,11.6 0.8,6 1.8,2 4.5,0 7.2,1.4 8.3,4.8 7.2,8.2 4.6,9.4 2.2,8.4 1,5.6'],
  7: [9.5, '0.8,16! 9,16! 3.6,0', '3.2,8 8,8.3'],
  8: [10, '5,8.6 2.2,10.6 1.6,13.3 3,15.5 5,16 7,15.4 8.2,13.2 7.4,10.6 5,8.6 2,6.6 0.8,3.6 2.2,1 5,0 7.8,1 9,3.8 7.8,6.6 5.2,8.7'],
  9: [9.5, '8.3,12 7,15 4.6,16 2,14.8 1,11.6 2.2,8.6 4.8,7.6 7.2,8.8 8.3,12! 8.2,5 6.4,1 3.4,0'],
  '-': [7, '1,5.8 6,6.1'],
  ',': [3.6, '1.9,1 1.7,-1 0.6,-2.8'],
  '.': [3.6, '1.5,0.2 1.9,0.7'],
  '/': [7, '0.4,-1.5 6.6,16.8'],
  ':': [3.8, '1.6,7.4 2,7.9', '1.5,0.2 1.9,0.7'],
  '!': [4.2, '2,16 2,4.6', '1.9,0.2 2.3,0.7'],
  "'": [3, '1.7,16.6 1.3,13'],
  '(': [5, '4.2,17.5 1.9,12 1.2,6 2.2,0 4.2,-3'],
  ')': [5, '0.8,17.5 3.1,12 3.8,6 2.8,0 0.8,-3'],
  '+': [9, '1,6 8,6.2', '4.5,9.8 4.5,2.4'],
  '=': [9, '1,7.8 8,8', '1,4 8,4.2'],
  '?': [9, '1,12.6 2.4,15.2 4.8,16 7.2,14.8 7.7,12.2 6,9.4 4.3,7.4 4.2,4.8', '4.2,0.2 4.6,0.7'],
  '·': [4, '1.8,5.6 2.2,6.1'],
  '>': [8, '1,10.5! 7,6! 1,1.5'],
  '_': [9, '0.2,-1.4 8.8,-1.2'],
  '~': [9, '0.6,5 2.4,7 4.6,6 6.6,4.4 8.6,6.2'],
};
const parsedGlyphs = new Map();
function glyph(ch) {
  if (!parsedGlyphs.has(ch)) {
    const g = GLYPHS[ch];
    if (!g) throw new Error(`handwriting has no glyph for "${ch}"`);
    parsedGlyphs.set(ch, {
      w: g[0],
      strokes: g.slice(1).map((st) => st.trim().split(/\s+/).map((tok) => {
        const c = tok.endsWith('!');
        const [x, y] = (c ? tok.slice(0, -1) : tok).split(',').map(Number);
        return { x, y, c };
      })),
    });
  }
  return parsedGlyphs.get(ch);
}
const SPACE = 5.8;
function measure(str, s, track = 1.6) {
  let w = 0;
  for (const ch of str) w += ch === ' ' ? SPACE * s : (glyph(ch).w + track) * s;
  return w - track * s;
}

// Points [{x, y, c}] -> path data. Corners split the stroke into runs; each run is a
// Catmull-Rom spline written as cubic beziers.
function smooth(pts) {
  const runs = [];
  let run = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    run.push(pts[i]);
    if (pts[i].c && i < pts.length - 1) {
      runs.push(run);
      run = [pts[i]];
    }
  }
  runs.push(run);
  let d = `M${n1(pts[0].x)} ${n1(pts[0].y)}`;
  for (const r of runs) {
    if (r.length === 2) {
      d += `L${n1(r[1].x)} ${n1(r[1].y)}`;
      continue;
    }
    for (let i = 0; i < r.length - 1; i++) {
      const a = r[i - 1] || r[i];
      const b = r[i];
      const c = r[i + 1];
      const e = r[i + 2] || r[i + 1];
      d += `C${n1(b.x + (c.x - a.x) / 6)} ${n1(b.y + (c.y - a.y) / 6)} ${n1(c.x - (e.x - b.x) / 6)} ${n1(c.y - (e.y - b.y) / 6)} ${n1(c.x)} ${n1(c.y)}`;
    }
  }
  return d;
}
const P = (x, y, c = false) => ({ x, y, c });

// Write a string by hand: returns { d, end }. (x, y) = left end of the baseline, s scales
// the glyph box (s = 1: cap height 16 px). Each letter gets its own wobble, tilt and size.
function hand(str, x, y, s, o = {}) {
  const { slant = 0.12, track = 1.6, wob = 0.35, tilt = 0.05, size = 0.06, angle = 0, jit = 0.12 } = o;
  let pen = 0;
  let by = 0;
  let d = '';
  const ca = Math.cos(angle);
  const sa = Math.sin(angle);
  for (const ch of str) {
    if (ch === ' ') {
      pen += SPACE * s;
      continue;
    }
    const g = glyph(ch);
    by = clamp(by + J(wob) * s, -wob * 1.6 * s, wob * 1.6 * s);
    const rot = J(tilt);
    const sc = 1 + J(size);
    const cr = Math.cos(rot);
    const sr = Math.sin(rot);
    for (const st of g.strokes) {
      d += smooth(st.map((p) => {
        const gx = p.x - g.w / 2;
        const gy = p.y;
        let X = (gx * cr + gy * sr) * sc + g.w / 2;
        const Y = (-gx * sr + gy * cr) * sc;
        X += slant * Y;
        const lx = pen + X * s + J(jit * s);
        const ly = by - Y * s + J(jit * s);
        return P(x + lx * ca - ly * sa, y + lx * sa + ly * ca, p.c);
      }));
    }
    pen += (g.w + track + J(0.25)) * s;
  }
  return { d, end: x + pen * ca };
}

// Freehand line: a little wavy, never quite where it was aimed.
function wline(x1, y1, x2, y2, amp = 0.6, step = 26) {
  const len = Math.hypot(x2 - x1, y2 - y1);
  const ux = (x2 - x1) / len;
  const uy = (y2 - y1) / len;
  const n = Math.max(1, Math.round(len / step));
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const off = J(i === 0 || i === n ? amp * 0.4 : amp);
    pts.push(P(x1 + (x2 - x1) * t - uy * off, y1 + (y2 - y1) * t + ux * off));
  }
  return smooth(pts);
}
// Freehand circle: the ends overlap instead of meeting.
function wcircle(cx, cy, rx, ry = rx, o = {}) {
  const { start = -2.2, over = 0.5, amp = 0.04 } = o;
  const n = Math.max(9, Math.round((rx + ry) / 2.6));
  const total = Math.PI * 2 + over;
  const steps = Math.ceil((n * total) / (Math.PI * 2));
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const a = start - (total * i) / steps;
    const k = 1 + J(amp) + (i / steps) * 0.06;
    pts.push(P(cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k));
  }
  return smooth(pts);
}
const curve = (list, amp = 0.3) => smooth(list.map(([x, y, c]) => P(x + J(amp), y + J(amp), !!c)));

const ink = (cls, d, extra = '') => `<path class="${cls}" d="${d}"${extra}/>`;

// ------------------------------------------------------------------ marker logo
// Tall capitals from the same skeletons (stretched 1.5x upwards), stroked in layers: a
// shadow, a black outline, the paper inside, a coral felt-tip fill laid on a little off
// register, and a hairline down the middle. That gives the "two or three parallel pen
// strokes" of a hand-drawn label logo.
function logoSkeleton(str, x, y, cap, o = {}) {
  const { track = 2.6, stretch = 1.5, angle = -0.035, wob = 1.4 } = o;
  const s = cap / (16 * stretch);
  let pen = 0;
  let d = '';
  const ca = Math.cos(angle);
  const sa = Math.sin(angle);
  for (const ch of str) {
    if (ch === ' ') {
      pen += 6 * s;
      continue;
    }
    const g = glyph(ch);
    const dy = J(wob);
    const rot = J(0.045);
    const sc = 1 + J(0.035);
    const cr = Math.cos(rot);
    const sr = Math.sin(rot);
    for (const st of g.strokes) {
      d += smooth(st.map((p) => {
        const gx = p.x - g.w / 2;
        const gy = p.y * stretch;
        const X = (gx * cr + gy * sr) * sc + g.w / 2;
        const Y = (-gx * sr + gy * cr) * sc;
        const lx = pen + X * s + J(0.18);
        const ly = dy - Y * s + J(0.18);
        return P(x + lx * ca - ly * sa, y + lx * sa + ly * ca, p.c);
      }));
    }
    pen += (g.w + track) * s;
  }
  return { d, width: pen - track * s };
}
// Emit a logo: one skeleton path in <defs>, stroked five times through <use>.
function logoBlock(id, str, x, y, cap, o = {}) {
  const lg = logoSkeleton(str, x, y, cap, o);
  extraDefs.push(`<path id="${id}" d="${lg.d}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`);
  const k = cap / 58;
  const u = (attrs) => `<use href="#${id}" ${attrs}/>`;
  return u(`stroke="${INK.marker}" stroke-width="${n2(11.5 * k)}" transform="translate(${n2(2.8 * k)} ${n2(2.6 * k)})"`)
    + u(`stroke="${INK.marker}" stroke-width="${n2(11.5 * k)}"`)
    + u(`stroke="${INK.paper}" stroke-width="${n2(6.6 * k)}"`)
    + u(`stroke="${o.fill || INK.coral}" stroke-width="${n2(4.6 * k)}" opacity=".92" transform="translate(${n2(0.9 * k)} ${n2(0.7 * k)})"`)
    + u(`stroke="${INK.marker}" stroke-width=".8" opacity=".55"`);
}
function logoWidth(str, cap, o = {}) {
  const { track = 2.6, stretch = 1.5 } = o;
  const s = cap / (16 * stretch);
  let w = 0;
  for (const ch of str) w += ch === ' ' ? 6 * s : (glyph(ch).w + track) * s;
  return w - track * s;
}

// ------------------------------------------------------------------ dot-matrix font
// 5 x 7 cell plus two descender rows, nine pins. '#' is a dot. Each glyph becomes one path of
// zero-length round-capped subpaths (a dot each) in <defs>, reused with <use>.
const DM = {
  a: '..... ..... .###. ....# .#### #...# .####',
  b: '#.... #.... #.##. ##..# #...# #...# ####.',
  c: '..... ..... .###. #.... #.... #...# .###.',
  d: '....# ....# .##.# #..## #...# #...# .####',
  e: '..... ..... .###. #...# ##### #.... .###.',
  f: '..##. .#..# .#... ###.. .#... .#... .#...',
  g: '..... ..... .#### #...# #...# .#### ....# .###.',
  h: '#.... #.... #.##. ##..# #...# #...# #...#',
  i: '..#.. ..... .##.. ..#.. ..#.. ..#.. .###.',
  j: '...#. ..... ..##. ...#. ...#. ...#. #..#. .##..',
  k: '#.... #.... #..#. #.#.. ##... #.#.. #..#.',
  l: '.##.. ..#.. ..#.. ..#.. ..#.. ..#.. .###.',
  m: '..... ..... ##.#. #.#.# #.#.# #...# #...#',
  n: '..... ..... #.##. ##..# #...# #...# #...#',
  o: '..... ..... .###. #...# #...# #...# .###.',
  p: '..... ..... ####. #...# #...# ####. #.... #....',
  q: '..... ..... .#### #...# #...# .#### ....# ....#',
  r: '..... ..... #.##. ##..# #.... #.... #....',
  s: '..... ..... .#### #.... .###. ....# ####.',
  t: '.#... .#... ###.. .#... .#... .#..# ..##.',
  u: '..... ..... #...# #...# #...# #..## .##.#',
  v: '..... ..... #...# #...# #...# .#.#. ..#..',
  w: '..... ..... #...# #...# #.#.# #.#.# .#.#.',
  x: '..... ..... #...# .#.#. ..#.. .#.#. #...#',
  y: '..... ..... #...# #...# #...# .#### ....# .###.',
  z: '..... ..... ##### ...#. ..#.. .#... #####',
  C: '.###. #...# #.... #.... #.... #...# .###.',
  0: '.###. #...# #..## #.#.# ##..# #...# .###.',
  1: '..#.. .##.. ..#.. ..#.. ..#.. ..#.. .###.',
  2: '.###. #...# ....# ...#. ..#.. .#... #####',
  3: '##### ...#. ..#.. ...#. ....# #...# .###.',
  4: '...#. ..##. .#.#. #..#. ##### ...#. ...#.',
  5: '##### #.... ####. ....# ....# #...# .###.',
  6: '..##. .#... #.... ####. #...# #...# .###.',
  7: '##### ....# ...#. ..#.. .#... .#... .#...',
  8: '.###. #...# #...# .###. #...# #...# .###.',
  9: '.###. #...# #...# .#### ....# ...#. .##..',
  '-': '..... ..... ..... .###. ..... ..... .....',
  _: '..... ..... ..... ..... ..... ..... ..... #####',
  ':': '..... .##.. .##.. ..... .##.. .##.. .....',
  '.': '..... ..... ..... ..... ..... .##.. .##..',
  '+': '..... ..#.. ..#.. ##### ..#.. ..#.. .....',
  ',': '..... ..... ..... ..... ..... .##.. .##.. ..#.. .#...',
  '=': '..... ..... ##### ..... ##### ..... .....',
};
const dmUsed = new Set();
const dmId = (ch) => `m${ch.codePointAt(0).toString(36)}`;
function dmDefs() {
  let out = '';
  for (const ch of [...dmUsed].sort()) {
    const rows = DM[ch].split(' ');
    let d = '';
    rows.forEach((row, r) => {
      [...row].forEach((c, k) => {
        if (c === '#') d += `M${k + 0.5} ${r + 0.5}h0`;
      });
    });
    out += `<path id="${dmId(ch)}" d="${d}"/>`;
  }
  return out;
}
// One line of dot-matrix text in dot units (cell 6 x 10), relative to (0, 0).
function dmLine(str, col0, row0) {
  let out = '';
  [...str].forEach((ch, i) => {
    if (ch === ' ') return;
    if (!DM[ch]) throw new Error(`dot-matrix font has no glyph for "${ch}"`);
    dmUsed.add(ch);
    out += `<use href="#${dmId(ch)}" x="${(col0 + i) * 6}" y="${row0}"/>`;
  });
  return out;
}

// ------------------------------------------------------------------ printed sticker type
// A monoline geometric face for the group's pre-printed sticker (the only "printed" letters).
const MONO = {
  A: [4, '0,6 2,0 4,6|0.8,3.9 3.2,3.9'],
  D: [4, '0,0 0,6 2.6,6 4,4.6 4,1.4 2.6,0 0,0'],
  E: [3.7, '3.7,0 0,0 0,6 3.7,6|0,3 2.9,3'],
  G: [4, '4,1 3,0 1,0 0,1 0,5 1,6 3,6 4,5 4,3.2 2.3,3.2'],
  L: [3.5, '0,0 0,6 3.5,6'],
  M: [4.6, '0,6 0,0 2.3,3.4 4.6,0 4.6,6'],
  S: [4, '4,1 3,0 1,0 0,1 0,2 1,3 3,3 4,4 4,5 3,6 1,6 0,5'],
  T: [4, '0,0 4,0|2,0 2,6'],
  W: [5.2, '0,0 1.2,6 2.6,2 4,6 5.2,0'],
  P: [4, '0,6 0,0 3,0 4,1 4,2.4 3,3.4 0,3.4'],
  I: [0.6, '0.3,0 0.3,6'],
  K: [4, '0,0 0,6|3.8,0 0,3.7|1.5,2.5 4,6'],
  ' ': [2.4, ''],
};
function monoD(str, x, y, cap, gap = 1.6) {
  const s = cap / 6;
  let pen = x;
  let d = '';
  for (const ch of str) {
    const g = MONO[ch];
    if (!g) throw new Error(`sticker face has no glyph for "${ch}"`);
    if (g[1]) {
      for (const st of g[1].split('|')) {
        const pts = st.split(' ').map((p) => p.split(',').map(Number));
        d += pts.map(([px, py], i) => `${i ? 'L' : 'M'}${n1(pen + px * s)} ${n1(y + py * s)}`).join('');
      }
    }
    pen += (g[0] + gap) * s;
  }
  return { d, end: pen - gap * s };
}
function monoWidth(str, cap, gap = 1.6) {
  const s = cap / 6;
  let w = 0;
  for (const ch of str) w += (MONO[ch][0] + gap) * s;
  return w - gap * s;
}

// ------------------------------------------------------------------ the disk
// Local units are px, origin at the shell's top-left corner, label side up, shutter at the
// bottom. Chamfered corner bottom-left, write-protect window top-left, moulded arrow
// bottom-right, a recessed track the shutter slides along.
const LBL = { x: mm(10), y: 0, w: mm(70), h: mm(47) };
const SHELLS = {
  black: { top: '#33353c', bot: '#17181c', recess: '#101114', emboss: '#3d4048', edge: '#4a4d56', slider: '#2a2c32' },
  blue: { top: '#2f74c4', bot: '#1a4f92', recess: '#163f74', emboss: '#3b80cf', edge: '#5b93d6', slider: '#215fa6' },
};
function shellPath() {
  const r = mm(1.3);
  const c = mm(3.6);
  return `M${n1(r)} 0H${n1(DW - r)}Q${n1(DW)} 0 ${n1(DW)} ${n1(r)}V${n1(DH - r)}Q${n1(DW)} ${n1(DH)} ${n1(DW - r)} ${n1(DH)}H${n1(c)}L0 ${n1(DH - c)}V${n1(r)}Q0 0 ${n1(r)} 0Z`;
}

function labelPaper(seed) {
  const r = mulberry32(seed);
  const { w, h } = LBL;
  let s = `<rect width="${n1(w)}" height="${n1(h)}" rx="2.5" fill="url(#paper)"/>`;
  s += `<rect width="${n1(w)}" height="${n1(h)}" rx="2.5" fill="url(#grain)"/>`;
  s += `<rect width="${n1(w)}" height="5" fill="url(#fold)"/>`;
  // scuffs and wear along the edges
  let d = '';
  for (let i = 0; i < 9; i++) {
    const side = Math.floor(r() * 3);
    const t = 0.06 + r() * 0.88;
    const len = 5 + r() * 14;
    if (side === 0) {
      const y0 = h - 2 - r() * 4;
      d += `M${n1(t * w)} ${n1(y0)}l${n1(len)} ${n1((r() - 0.5) * 2)}`;
    } else {
      const x0 = side === 1 ? 1.5 + r() * 4 : w - 1.5 - r() * 4;
      d += `M${n1(x0)} ${n1(t * h)}l${n1((r() - 0.5) * 2)} ${n1(len * 0.7)}`;
    }
  }
  s += `<path d="${d}" fill="none" stroke="#9c8a63" stroke-width=".8" stroke-linecap="round" opacity=".35"/>`;
  s += `<rect x=".5" y=".5" width="${n1(w - 1)}" height="${n1(h - 1)}" rx="2.2" fill="none" stroke="#c9b68c" stroke-width="1" opacity=".55"/>`;
  return s;
}

function disk({ x, y, rot, shell, seed, label, shutter = '', grains = 0 }) {
  const k = SHELLS[shell];
  const g = (body) => `<g transform="translate(${n1(x)} ${n1(y)}) rotate(${rot})">${body}</g>`;
  let s = '';
  // shadow on the sand / on the disk below
  s += `<use href="#shell" transform="translate(4 7)" fill="#4b3414" opacity=".38" filter="url(#soft)"/>`;
  s += `<use href="#shell" fill="url(#g-${shell})"/>`;
  s += `<use href="#shell" fill="url(#sheen)"/>`;
  s += `<use href="#shell" fill="none" stroke="${k.edge}" stroke-width="1.4" opacity=".75"/>`;
  s += `<use href="#shell" fill="none" stroke="#000" stroke-width=".8" opacity=".55"/>`;
  // write-protect window (closed: the slider fills the lower half)
  s += `<rect x="${n1(mm(2.7))}" y="${n1(mm(3.2))}" width="${n1(mm(4.4))}" height="${n1(mm(5.6))}" rx="1" fill="#07080a"/>`;
  s += `<rect x="${n1(mm(3.1))}" y="${n1(mm(5.9))}" width="${n1(mm(3.6))}" height="${n1(mm(2.5))}" rx=".6" fill="${k.slider}"/>`;
  // label recess and label
  s += `<rect x="${n1(mm(9.2))}" y="0" width="${n1(mm(71.6))}" height="${n1(mm(48.4))}" rx="3" fill="${k.recess}"/>`;
  s += `<g transform="translate(${n1(LBL.x)} 0)">${labelPaper(seed)}${label}</g>`;
  // moulded grip ridges, bottom left
  let rd = '';
  for (let i = 0; i < 5; i++) rd += `M${n1(mm(5))} ${n1(mm(78 + i * 2.4))}h${n1(mm(9))}`;
  s += `<path d="${rd}" stroke="${k.emboss}" stroke-width="2.2" stroke-linecap="round"/>`;
  s += `<path d="${rd}" transform="translate(0 1.4)" stroke="#000" stroke-width="1" stroke-linecap="round" opacity=".35"/>`;
  // moulded arrow, bottom right, pointing the way in
  const ax = mm(86.4);
  s += `<path d="M${n1(ax)} ${n1(mm(82))}V${n1(mm(88.5))}M${n1(ax - mm(1.6))} ${n1(mm(86.6))}L${n1(ax)} ${n1(mm(89.4))}L${n1(ax + mm(1.6))} ${n1(mm(86.6))}" fill="none" stroke="${k.emboss}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`;
  // shutter track, the media behind the head window, and the shutter itself
  s += `<rect x="${n1(mm(20.2))}" y="${n1(mm(61))}" width="${n1(mm(63.4))}" height="${n1(mm(33))}" fill="${k.recess}"/>`;
  s += `<rect x="${n1(mm(20.2))}" y="${n1(mm(61))}" width="${n1(mm(63.4))}" height="2" fill="#000" opacity=".35"/>`;
  s += `<rect x="${n1(mm(39))}" y="${n1(mm(65.6))}" width="${n1(mm(12))}" height="${n1(mm(25))}" rx="1.5" fill="url(#media)"/>`;
  s += `<g${shutter ? ` class="${shutter}"` : ''}><use href="#shutter"/></g>`;
  // sand, of course: two little drifts of grains, one by the ridges and one by the label
  if (grains) {
    const r = mulberry32(seed * 97 + 13);
    let gd = '';
    let gl = '';
    const spots = [[mm(6), mm(90.5), 9], [mm(83.5), mm(53), 7]];
    for (let i = 0; i < grains; i++) {
      const [sx, sy, rad] = spots[i % 2];
      const a = r() * Math.PI * 2;
      const dist = rad * Math.sqrt(r());
      const gx = sx + Math.cos(a) * dist;
      const gy = sy + Math.sin(a) * dist * 0.7;
      const gr = 0.8 + r() * 0.8;
      gd += `M${n1(gx - gr)} ${n1(gy)}a${n1(gr)} ${n1(gr * 0.8)} 0 1 0 ${n1(gr * 2)} 0a${n1(gr)} ${n1(gr * 0.8)} 0 1 0 ${n1(-gr * 2)} 0`;
      gl += `M${n1(gx - gr * 0.3)} ${n1(gy - gr * 0.35)}h0`;
    }
    s += `<path d="${gd}" fill="#e3c992" stroke="#9c7c48" stroke-width=".4"/>`;
    s += `<path d="${gl}" stroke="#fff6dc" stroke-width=".8" stroke-linecap="round"/>`;
  }
  return g(s);
}

function shutterDefs() {
  const x0 = mm(21);
  const x1 = mm(69);
  const y0 = mm(61.8);
  const y1 = DH;
  const wx0 = mm(26.8);
  const wx1 = mm(38.8);
  const wy0 = mm(66);
  const wy1 = mm(90.6);
  const outer = `M${n1(x0)} ${n1(y0)}H${n1(x1)}V${n1(y1)}H${n1(x0)}Z`;
  const hole = `M${n1(wx0)} ${n1(wy0)}V${n1(wy1)}H${n1(wx1)}V${n1(wy0)}Z`;
  return `<g id="shutter">`
    + `<path d="${outer}${hole}" fill-rule="evenodd" fill="url(#metal)"/>`
    + `<path d="${outer}${hole}" fill-rule="evenodd" fill="url(#brush)"/>`
    + `<path d="${outer}${hole}" fill-rule="evenodd" fill="url(#glare)"/>`
    + `<path d="${outer}" fill="none" stroke="#5d6066" stroke-width="1"/>`
    + `<path d="M${n1(x0 + 1)} ${n1(y0 + 1)}H${n1(x1 - 1)}" stroke="#fff" stroke-width="1" opacity=".7"/>`
    + `<path d="${hole}" fill="none" stroke="#3b3d42" stroke-width="1.2"/>`
    + `<path d="M${n1(wx0 + 0.8)} ${n1(wy1 - 0.6)}H${n1(wx1 - 0.6)}V${n1(wy0 + 0.8)}" fill="none" stroke="#fff" stroke-width=".8" opacity=".6"/>`
    + `</g>`;
}

// ------------------------------------------------------------------ the labels
const extraDefs = [];
// Disk 1 of 5 (black shell, label type B): marker logo, double underline, one word, a
// circled disk number, and a ballpoint doodle of the island.
function labelOne() {
  rnd = mulberry32(115);
  const { w } = LBL;
  let s = '';
  const cap = 58;
  const lw = logoWidth('CASTAWAY', cap);
  const lx = (w - lw) / 2 - 2;
  s += logoBlock('logo', 'CASTAWAY', lx, 74, cap, { fill: INK.coral });
  // double underline in marker
  s += ink('mk', wline(lx - 2, 89, lx + lw + 4, 85.5, 0.7) + wline(lx + 10, 95, lx + lw - 6, 92, 0.7));
  // the one word: what is on the disk
  s += ink('bp bp-big', hand('island', 136, 128, 1.22, { wob: 0.3 }).d);
  s += ink('pc', hand('lo-fi · 10 hrs', 138, 149, 0.62).d);
  s += ink('pc', hand('disk 1 of 5', 138, 168, 0.62).d);
  // circled disk number, red felt-tip
  s += ink('ft', wcircle(242, 142, 18, 17));
  s += ink('ft ft-num', hand('1', 236.2, 151.5, 1.12, { slant: 0.06 }).d);
  s += doodle(8, 96);
  return s;
}

// The island in blue ballpoint, about 120 x 80 px: sun, palm, her on the sand with her
// headphones on, the raft, and the sea. She is small and simple: brown hair in a low bun,
// cream headphones, coral tank top (felt-tip), cream shorts, bare feet, knees up, nodding.
function doodle(ox, oy) {
  const T = (pts) => pts.map(([x, y, c]) => [ox + x, oy + y, c]);
  let d = '';
  // sun with rays (it is always daytime)
  d += wcircle(ox + 14, oy + 12, 6.3, 6.3, { amp: 0.03 });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.3;
    d += wline(ox + 14 + Math.cos(a) * 9.4, oy + 12 + Math.sin(a) * 9.4, ox + 14 + Math.cos(a) * 13.4, oy + 12 + Math.sin(a) * 13.4, 0.1, 10);
  }
  // horizon, broken by the island
  d += curve(T([[1, 50], [20, 49.6], [34, 50]]), 0.2);
  d += curve(T([[96, 50.2], [108, 49.8], [120, 50.1]]), 0.2);
  // waves
  for (const [wx, wy] of [[4, 72], [22, 78], [58, 76], [84, 79]]) {
    d += curve(T([[wx, wy], [wx + 3, wy - 2.2], [wx + 6, wy], [wx + 9, wy - 2.2], [wx + 12, wy]]), 0.12);
  }
  // the island
  d += curve(T([[14, 65], [28, 58.6], [52, 56], [76, 57], [92, 60.4], [102, 65.4]]), 0.25);
  d += curve(T([[10, 66], [40, 68.4], [72, 68], [106, 66]]), 0.25);
  // palm: tall, slender, gently curved, ring ticks up the trunk
  d += curve(T([[70, 57], [71.2, 43], [74, 29], [78.4, 16.4]]), 0.1);
  d += curve(T([[73.6, 57], [74.6, 43], [77.4, 29.4], [81, 17]]), 0.1);
  for (let i = 0; i < 7; i++) {
    const t = 0.1 + i * 0.125;
    d += wline(ox + 70.6 + t * 8, oy + 55 - t * 38, ox + 73.6 + t * 8, oy + 54.4 - t * 38, 0.04, 6);
  }
  const fr = [
    [[79.6, 16], [70, 11], [61, 13.6], [56, 19.6]],
    [[79.6, 16], [72, 6], [63, 3.4]],
    [[79.6, 16], [82.4, 6], [90, 2.4]],
    [[79.6, 16], [89.6, 10], [97.6, 13], [100.6, 19.4]],
    [[79.6, 16], [86, 16.4], [91.6, 21.4], [92.6, 27.6]],
    [[79.6, 16], [73.4, 18.4], [68.4, 24.6]],
  ];
  for (const f of fr) d += curve(T(f), 0.12);
  d += wcircle(ox + 77.6, oy + 19.4, 1.8, 1.8, { amp: 0.02, over: 0.3 });
  d += wcircle(ox + 81.4, oy + 19.2, 1.7, 1.7, { amp: 0.02, over: 0.3 });
  // the raft, moored off the right-hand shore: three logs and two lashings
  for (const ly of [69.6, 72.8, 76]) d += curve(T([[103, ly], [119, ly - 0.6]]), 0.08);
  d += curve(T([[103, 69.6], [101.8, 72.8, true], [103, 76]]), 0.05);
  d += curve(T([[119, 69], [120.2, 72.2, true], [119, 75.4]]), 0.05);
  d += curve(T([[106.6, 68.6], [106.6, 77]]), 0.04) + curve(T([[115.4, 68.4], [115.4, 76.6]]), 0.04);

  // her, sitting on the sand left of the palm, knees up, hands on her knees
  const bx = 37;
  const by = 58.2;
  const Hp = (pts) => T(pts.map(([x, y, c]) => [bx + x, by + y, c]));
  d += wcircle(ox + bx + 2.6, oy + by - 20.6, 3.7, 4, { amp: 0.02, over: 0.3 }); // head
  d += wcircle(ox + bx - 1.7, oy + by - 19, 1.6, 1.6, { amp: 0.02, over: 0.2 }); // the low bun
  d += curve(Hp([[-0.9, -22.8], [2.5, -25.6], [6.1, -22.4]]), 0.04); // headphone band
  d += wcircle(ox + bx + 5.9, oy + by - 20.4, 1.3, 1.9, { amp: 0.02, over: 0.2 }); // ear cup
  d += curve(Hp([[2.6, -16.7], [2.7, -15.4]]), 0.02); // neck
  d += curve(Hp([[0.1, -15.4], [5.1, -15.4]]), 0.03); // shoulders
  d += curve(Hp([[0.1, -15.4], [-0.5, -10.8], [-0.4, -6.4]]), 0.03); // back
  d += curve(Hp([[5.1, -15.4], [5.2, -10.8], [4.8, -6.6]]), 0.03); // front
  d += curve(Hp([[-0.4, -6.4], [4.8, -6.6]]), 0.03); // hem of the tank top
  d += curve(Hp([[-0.6, -6.2], [-0.8, -1.4], [1.4, 0]]), 0.03); // seat of the shorts
  d += curve(Hp([[4.8, -6.6], [8.8, -9.4], [12.6, -11.8]]), 0.03); // top of the thigh
  d += curve(Hp([[1.4, 0], [6.4, -4.4], [10.6, -8.6]]), 0.03); // under the thigh
  d += curve(Hp([[8.4, -9.6], [7.6, -6.4]]), 0.02); // hem of the shorts
  d += curve(Hp([[12.6, -11.8], [14.2, -6], [15.2, -0.6], [18.2, -0.4]]), 0.03); // shin and foot
  d += curve(Hp([[10.6, -8.6], [12.2, -4], [12.8, -0.4], [15.2, -0.6]]), 0.03); // back of the leg
  d += curve(Hp([[4.6, -14.2], [8, -10.4], [12, -11.6]]), 0.03); // arm to the knee
  // nodding marks and a note
  d += curve(Hp([[-3.8, -26.6], [-5, -24.6], [-4.2, -22.6]]), 0.03);
  d += curve(Hp([[-6.2, -27.6], [-7.6, -25], [-6.6, -22.4]]), 0.03);
  d += curve(Hp([[10.6, -29.4], [10.6, -24.2]]), 0.03) + curve(Hp([[10.6, -29.4], [13, -28]]), 0.03);
  d += wcircle(ox + bx + 9.4, oy + by - 24, 1.3, 1, { amp: 0.02, over: 0.1 });

  // felt-tip colour first, so the ballpoint sits on top of it
  const at = (x, y) => `${n1(ox + bx + x)} ${n1(oy + by + y)}`;
  let s = `<circle cx="${n1(ox + 14.4)}" cy="${n1(oy + 12.4)}" r="6.2" fill="#f6c34a" opacity=".6"/>`;
  s += `<path d="M${at(0.3, -15)}L${at(4.9, -15)}L${at(4.7, -6.9)}L${at(-0.2, -6.7)}Z" fill="${INK.coral}" opacity=".9"/>`;
  s += `<path d="M${at(-1, -20.2)}Q${at(-0.4, -24.8)} ${at(3.4, -24.4)}Q${at(5.8, -23.8)} ${at(6, -21.8)}L${at(2.4, -21.4)}Q${at(0.8, -19.6)} ${at(0.6, -17.6)}Z" fill="#8a5a36" opacity=".8"/>`;
  s += `<circle cx="${n1(ox + bx - 1.7)}" cy="${n1(oy + by - 19)}" r="1.5" fill="#8a5a36" opacity=".8"/>`;
  s += `<ellipse cx="${n1(ox + bx + 5.9)}" cy="${n1(oy + by - 20.4)}" rx="1.2" ry="1.8" fill="#efe4c8"/>`;
  s += ink('bp', d);
  return s;
}

// Disk 2 of 5 (blue, label type A): the printed list, two columns, every entry with a dash,
// under an underlined italic title that ends in the disk number and a colon. Every name is
// a real activity id from activities.toml (checked 2026-10-01).
const LIST_L = ['coconut_sip', 'fishing_quiet', 'jog_lap', 'sandcastle', 'coconut_crab', 'turtle_visit', 'cat_visit', 'bottle_reply', 'signal_hunt'];
const LIST_R = ['shark_nod', 'delivery_drone', 'efoil_bro', 'fire_by_friction', 'hammock', 'lookout', 'spear_fishing', 'kumara_leafs', 'leave_any_time'];
function labelTwo() {
  rnd = mulberry32(202);
  const { w } = LBL;
  const cols = 2 + Math.max(...LIST_L.map((t) => t.length)) + 2 + 2 + Math.max(...LIST_R.map((t) => t.length));
  const p = Math.min(1.24, (w - 22) / (cols * 6 - 1));
  const ox = (w - (cols * 6 - 1) * p) / 2;
  let s = `<g class="dm" transform="translate(${n2(ox)} 13) scale(${n2(p)})">`;
  // title, italic and underlined
  const title = 'Castaway gags 2:';
  s += `<g transform="skewX(-14) translate(5 0)">${dmLine(title, 0, 0)}`;
  let ul = '';
  for (let i = 0; i < title.length * 6 - 1; i++) ul += `M${i + 0.5} 9.5h0`;
  s += `<path d="${ul}"/></g>`;
  const c2 = 2 + Math.max(...LIST_L.map((t) => t.length)) + 2;
  // line pitch in dots: 11.5 leaves a clear gap between one line's descenders and the next
  // line's ascenders at this small size (a 10-dot pitch made them touch)
  const LP = 11.5;
  LIST_L.forEach((t, i) => {
    s += `<g opacity="${n2(0.9 + 0.1 * Math.sin(i * 1.7))}">${dmLine(`- ${t}`, 0, 15 + i * LP)}${dmLine(`- ${LIST_R[i]}`, c2, 15 + i * LP)}</g>`;
  });
  s += `</g>`;
  // red felt-tip ring round the crab one
  const ci = LIST_L.indexOf('coconut_crab');
  const ex = ox + ((2 + 'coconut_crab'.length) * 6) * p * 0.5 - 2;
  const ey = 13 + (15 + ci * LP + 4.6) * p;
  s += ink('ft ft-thin', wcircle(ex, ey, ((2 + 'coconut_crab'.length) * 6) * p * 0.5 + 5, 7, { amp: 0.02, over: 0.7 }));
  // pencil afterthought and a red felt-tip star
  s += ink('pc', hand('+ lots more', w - 82, 172, 0.6).d);
  let star = '';
  const sx = 16;
  const sy = 166;
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i * 4 * Math.PI) / 5;
    star += `${i ? 'L' : 'M'}${n1(sx + Math.cos(a) * 6.5 + J(0.4))} ${n1(sy + Math.sin(a) * 6.5 + J(0.4))}`;
  }
  s += ink('ft', `${star}Z`);
  s += ink('ft ft-thin', hand('the crab one!', 27, 170, 0.56).d);
  return s;
}

// Tabs: only the top strip of disks 3, 4 and 5 shows above disk 1.
function tabCircled(num, word, note, seed) {
  rnd = mulberry32(seed);
  let s = '';
  s += ink('ft', wcircle(17, 22, 11.5, 11));
  s += ink('ft ft-num', hand(num, 12.4, 29, 0.84, { slant: 0.05 }).d);
  const mk = hand(word, 36, 30, 1.02, { slant: 0.04, track: 2.2, wob: 0.2 });
  s += ink('mk mk-cap', mk.d);
  s += ink('bp', hand(note, mk.end + 10, 29, 0.6).d);
  return s;
}
function tabSticker() {
  rnd = mulberry32(404);
  const { w } = LBL;
  // the group's pre-printed sticker: two spot colours, printed slightly off register
  let s = `<rect x="3" y="3" width="${n1(w - 6)}" height="17" fill="#d9442f"/>`;
  s += `<path d="M3 20.5h${n1(w - 6)}" stroke="#1b8a86" stroke-width="2.2"/>`;
  let wv = '';
  for (let x = 6; x < w - 8; x += 12) wv += `M${x} 26q3 -3 6 0t6 0`;
  s += `<path d="${wv}" fill="none" stroke="#1b8a86" stroke-width="1.6" opacity=".9"/>`;
  const name = 'SALT DAMAGE';
  const nw = monoWidth(name, 9.5);
  const m = monoD(name, (w - nw) / 2 + 22, 7, 9.5);
  s += `<path d="${m.d}" fill="none" stroke="${INK.paper}" stroke-width="1.7" stroke-linecap="square"/>`;
  // a little printed sun
  s += `<circle cx="${n1((w - nw) / 2 + 8)}" cy="11.5" r="5" fill="#f2c94c"/>`;
  s += `<path d="${monoD('SWAP', w - 44, 8.5, 6).d}" fill="none" stroke="#f2c94c" stroke-width="1.2"/>`;
  // and the pencil over it
  s += ink('pc pc-bold', hand('4 SOUND', 10, 41, 0.95, { slant: 0.08, track: 2 }).d);
  s += ink('pc', hand('all synth, no samples', 102, 40, 0.62).d);
  return s;
}

// ------------------------------------------------------------------ the scene
function sandPattern() {
  const r = mulberry32(77);
  let s = '';
  const cols = ['#c9ab74', '#b99a63', '#f6e8c8', '#d8bd88', '#a88a58'];
  for (let i = 0; i < 70; i++) {
    const x = r() * 90;
    const y = r() * 90;
    const c = cols[Math.floor(r() * cols.length)];
    const rr = 0.4 + r() * 0.8;
    s += `<circle cx="${n1(x)}" cy="${n1(y)}" r="${n1(rr)}" fill="${c}" opacity="${n2(0.35 + r() * 0.45)}"/>`;
  }
  return `<pattern id="sand" width="90" height="90" patternUnits="userSpaceOnUse"><rect width="90" height="90" fill="#ead6a6"/>${s}</pattern>`;
}
function grainPattern() {
  const r = mulberry32(31);
  let s = '';
  for (let i = 0; i < 46; i++) {
    s += `<circle cx="${n1(r() * 40)}" cy="${n1(r() * 40)}" r="${n1(0.3 + r() * 0.5)}" fill="${r() < 0.7 ? '#a08a5c' : '#ffffff'}" opacity="${n2(0.08 + r() * 0.14)}"/>`;
  }
  return `<pattern id="grain" width="40" height="40" patternUnits="userSpaceOnUse">${s}</pattern>`;
}

// The sea in the top-right corner, with a foam edge that washes in and out.
const SEA_EDGE = [[430, -12], [500, 12], [570, 40], [640, 66], [716, 92], [790, 116], [860, 146], [920, 184], [968, 222], [1014, 262]];
function sea() {
  rnd = mulberry32(5150);
  const edge = SEA_EDGE.map(([x, y], i) => P(x + (i ? J(5) : 0), y + (i ? J(4) : 0)));
  // run the shoreline and the water well past the panel's edges, so the wash (which pulls
  // the sea 21 px down the beach) never shows a strip of sand above the water or a foam end
  const ed = smooth([P(372, -46), ...edge, P(1064, 300)]);
  const water = `${ed}L1064 -70L372 -70Z`;
  let s = '';
  s += `<path d="${ed}" fill="none" stroke="#c9ad76" stroke-width="30" opacity=".55" transform="translate(-6 9)"/>`;
  s += `<path d="${ed}" fill="none" stroke="#b99b64" stroke-width="10" opacity=".35" transform="translate(-9 12)"/>`;
  s += `<g class="wash">`;
  s += `<path d="${water}" fill="url(#water)"/>`;
  s += `<path d="${water}" fill="url(#shallow)"/>`;
  s += `<path d="${ed}" fill="none" stroke="#fff" stroke-width="5.5" stroke-linecap="round" opacity=".92"/>`;
  s += `<path d="${ed}" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".55" transform="translate(9 -12)" stroke-dasharray="30 7 12 5 46 10 8 6 22 9"/>`;
  // bubbles along the foam
  let b = '';
  for (let i = 0; i < 28; i++) {
    const t = (i + 0.5) / 28;
    const k = Math.min(SEA_EDGE.length - 2, Math.floor(t * (SEA_EDGE.length - 1)));
    const f = t * (SEA_EDGE.length - 1) - k;
    const x = SEA_EDGE[k][0] + (SEA_EDGE[k + 1][0] - SEA_EDGE[k][0]) * f;
    const y = SEA_EDGE[k][1] + (SEA_EDGE[k + 1][1] - SEA_EDGE[k][1]) * f;
    b += `M${n1(x + 4 + J(5))} ${n1(y - 6 + J(4))}h0`;
  }
  s += `<path d="${b}" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".8"/>`;
  s += `</g>`;
  // swell lines further out, parallel to the shore
  let sw = '';
  for (const [k, a, b] of [[34, 0.12, 0.5], [58, 0.38, 0.8], [78, 0.05, 0.3], [96, 0.55, 0.95]]) {
    const pts = [];
    for (let i = 0; i <= 6; i++) {
      const t = a + ((b - a) * i) / 6;
      const x = 430 + 584 * t;
      const y = -12 + 274 * t;
      pts.push(P(x + 0.425 * k + Math.sin(i * 1.3 + k) * 2, y - 0.905 * k + Math.cos(i * 1.1 + k) * 2));
    }
    sw += smooth(pts);
  }
  s += `<path d="${sw}" fill="none" stroke="#bff0ee" stroke-width="2" stroke-linecap="round" opacity=".28"/>`;
  // glints far out
  let gl = '';
  for (const [gx, gy, gw] of [[760, 10], [842, 22], [900, 40], [948, 26], [972, 70], [905, 8], [690, 4]].map(([a, c]) => [a, c, 8 + ((a * 7) % 9)])) {
    gl += `M${gx} ${gy}h${gw}`;
  }
  s += `<path class="glint" d="${gl}" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".7"/>`;
  return s;
}

// The empty bottle, lying on the sand with its neck to the sea, and its cork.
function bottle(x, y, ang) {
  let s = `<g transform="translate(${x} ${y}) rotate(${ang})">`;
  const body = 'M0 -20Q0 -23 8 -23H112Q124 -23 134 -14Q142 -8 152 -8H184V8H152Q142 8 134 14Q124 23 112 23H8Q0 23 0 20Z';
  s += `<path d="${body}" transform="translate(5 9)" fill="#4b3414" opacity=".28" filter="url(#soft)"/>`;
  s += `<path d="${body}" fill="url(#glass)" stroke="#2f7a58" stroke-width="1.4"/>`;
  // a little sand inside, along the low side
  s += `<path d="M6 17Q40 12 90 15Q112 16 128 14Q120 22 108 22H10Q4 22 6 17Z" fill="#d9bf86" opacity=".7"/>`;
  // lip
  s += `<rect x="182" y="-10.5" width="9" height="21" rx="3" fill="url(#glass)" stroke="#2f7a58" stroke-width="1.3"/>`;
  // highlights
  s += `<path d="M14 -15H106M146 -4H178" stroke="#fff" stroke-width="3.2" stroke-linecap="round" opacity=".7"/>`;
  s += `<path d="M20 13H60" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".35"/>`;
  s += `</g>`;
  return s;
}
function cork(x, y, ang) {
  let s = `<g transform="translate(${x} ${y}) rotate(${ang})">`;
  s += `<rect x="1" y="3" width="22" height="15" rx="4" fill="#4b3414" opacity=".3" filter="url(#soft)"/>`;
  s += `<rect width="22" height="15" rx="4" fill="#c69a5f"/>`;
  s += `<ellipse cx="20" cy="7.5" rx="3" ry="7.2" fill="#d8b47e"/>`;
  s += `<path d="M5 4h0M9 9h0M14 5h0M7 12h0M13 11h0M18 4h0" stroke="#8a6234" stroke-width="1.6" stroke-linecap="round"/>`;
  s += `</g>`;
  return s;
}

// The crab one: a hermit crab wearing a coconut, which steps out from under disk 2 to look
// at the cork and steps back again. Stepped movement, like the video's own motion default.
function coconutCrab() {
  const legs = (k) => {
    let d = '';
    for (let i = 0; i < 3; i++) {
      const lx = -6 + i * 6;
      const sw = (i % 2 === k ? 2.2 : -2.2);
      d += `M${lx} 7l${n1(-3 + sw)} 6.5M${lx + 1.6} 7l${n1(3 + sw)} 6.5`;
    }
    return d;
  };
  let s = '<g class="crab">';
  s += '<ellipse cx="1" cy="14" rx="15" ry="3.6" fill="#4b3414" opacity=".25"/>';
  s += `<path class="legA" d="${legs(0)}" stroke="#d9562f" stroke-width="2" stroke-linecap="round"/>`;
  s += `<path class="legB" d="${legs(1)}" stroke="#d9562f" stroke-width="2" stroke-linecap="round"/>`;
  // it walks left, towards the cork, so eyes and claws all come out of the left-hand side
  s += '<path d="M-9 6l-5 -1M-8 9l-4 2" stroke="#d9562f" stroke-width="1.8" stroke-linecap="round"/>';
  s += '<path d="M-13.5 4.4q-5.6 -1.6 -5 3.4q3 2.4 6.6 -0.4z" fill="#e0643a"/>';
  s += '<path d="M-12.2 10.4q-4.2 -0.6 -3.6 3q2.4 1.6 5 -0.6z" fill="#e0643a"/>';
  s += '<path d="M-8 2l-6 -9M-10.4 4l-8.4 -5.4" stroke="#d9562f" stroke-width="1.5" stroke-linecap="round"/>';
  s += '<circle cx="-14.2" cy="-7.4" r="1.8" fill="#151515"/><circle cx="-19" cy="-1.8" r="1.8" fill="#151515"/>';
  s += '<circle r="11.5" fill="url(#nut)"/>';
  s += '<path d="M-7 -5q2 -3 5 -4M-8 1q1 -4 4 -6M2 -8q4 0 6 3M-2 6q4 1 8 -2M4 -2q3 1 4 4" fill="none" stroke="#b98a55" stroke-width=".9" stroke-linecap="round" opacity=".7"/>';
  s += '<circle cx="-4" cy="-6.4" r="1.3" fill="#2f1c0c"/><circle cx="-0.6" cy="-7.6" r="1.3" fill="#2f1c0c"/><circle cx="-2.6" cy="-3.8" r="1.3" fill="#2f1c0c"/>';
  s += '</g>';
  return s;
}

// The letter that came in the bottle: a page of a small lined notebook, still curling.
const LETTER = [
  ["hi! here's CASTAWAY,", 0],
  ['disks 1 to 5.', 0],
  ['ten hours, one island.', 0],
  ['she mostly waits.', 0],
  ['now and then,', 0],
  ['a gag, on the beat.', 0],
  ['every sound is code.', 0],
  ['swap back pls!', 10],
  ['ferric / salt damage', 18],
];
function letter(x, y, ang) {
  rnd = mulberry32(8765);
  const w = 186;
  const h = 238;
  let s = `<g transform="translate(${x} ${y}) rotate(${ang})">`;
  // torn top edge
  let top = 'M0 10';
  for (let i = 1; i <= 15; i++) top += `L${n1((i * w) / 15)} ${n1(10 + J(2.6))}`;
  const outline = `${top}L${w} ${h}L0 ${h}Z`;
  s += `<path d="${outline}" transform="translate(5 8)" fill="#4b3414" opacity=".3" filter="url(#soft)"/>`;
  s += `<path d="${outline}" fill="#fbf8ee"/>`;
  s += `<path d="${outline}" fill="url(#curl)"/>`;
  let lines = '';
  for (let ly = 40; ly < h - 6; ly += 19) lines += `M2 ${ly}H${w - 2}`;
  s += `<path d="${lines}" stroke="#9fc1e4" stroke-width=".9"/>`;
  s += `<path d="M25 12V${h}" stroke="#e79b97" stroke-width="1"/>`;
  let d = '';
  LETTER.forEach(([t, indent], i) => {
    d += hand(t, 31 + indent, 37 + i * 19 + (i === LETTER.length - 1 ? 8 : 0), 0.66, { wob: 0.4 }).d;
  });
  s += ink('bp', d);
  s += `</g>`;
  return s;
}

// ------------------------------------------------------------------ the other disks, in full
// Small single-disk images that head the README's disk 3, 4 and 5 sections.

// Disk 3 of 5 (blue, label type A): the timers, as a dot-matrix printout. Counts are the
// median of 200 simulated 10-hour runs, from the header of activities.toml.
const TIMERS = [
  ['regular', '2-5 min', '155'],
  ['occasional', '12-25 min', '30'],
  ['rare', '30-60 min', '13'],
  ['super_rare', '3-6 h', '2'],
  ['chained', 'on cue', '20'],
];
function labelThree() {
  rnd = mulberry32(333);
  const { w } = LBL;
  const rows = TIMERS.map(([a, b, c]) => `- ${a.padEnd(11)}${b.padStart(9)}${c.padStart(5)}`);
  const cols = Math.max(...rows.map((r) => r.length));
  const p = Math.min(1.3, (w - 26) / (cols * 6 - 1));
  const ox = 15;
  let s = `<g class="dm" transform="translate(${n2(ox)} 14) scale(${n2(p)})">`;
  const title = 'Castaway timers 3:';
  s += `<g transform="skewX(-14) translate(5 0)">${dmLine(title, 0, 0)}`;
  let ul = '';
  for (let i = 0; i < title.length * 6 - 1; i++) ul += `M${i + 0.5} 9.5h0`;
  s += `<path d="${ul}"/></g>`;
  rows.forEach((r, i) => {
    s += `<g opacity="${n2(0.86 + 0.14 * Math.sin(i * 2.1))}">${dmLine(r, 0, 16 + i * 11)}</g>`;
  });
  s += dmLine('- bars of 3 s, seed 1992', 0, 16 + 5 * 11 + 6);
  s += dmLine('- run 10:00:00', 0, 16 + 6 * 11 + 6);
  s += `</g>`;
  // pencil heads the count column; red felt-tip says what it all adds up to
  // (the counts are medians of simulated runs, hence the squiggle)
  const right = ox + (cols * 6 - 1) * p;
  const head = '~ per 10 hrs';
  s += ink('pc', hand(head, right - measure(head, 0.54) + 16, 22, 0.54).d);
  s += ink('ft', hand('busy 1/3, idle 2/3', 132, 166, 0.68).d);
  s += ink('ft ft-thin', wline(130, 171.5, 250, 169, 0.5));
  return s;
}

// Disk 4 of 5 (black, label type C): the swap club's pre-printed sticker in two spot colours
// and a yellow, filled in and scribbled over in pencil.
function labelFour() {
  rnd = mulberry32(444);
  const { w } = LBL;
  const RED = '#d9442f';
  const TEAL = '#1b8a86';
  let s = `<rect x="3" y="3" width="${n1(w - 6)}" height="25" fill="${RED}"/>`;
  s += `<path d="M3 29.4h${n1(w - 6)}" stroke="${TEAL}" stroke-width="2.4"/>`;
  let wv = '';
  for (let x = 6; x < w - 8; x += 12) wv += `M${x} 35q3 -3 6 0t6 0`;
  s += `<path d="${wv}" fill="none" stroke="${TEAL}" stroke-width="1.6" opacity=".9"/>`;
  const name = 'SALT DAMAGE';
  const nw = monoWidth(name, 12);
  const nx = (w - nw) / 2 + 10;
  s += `<path d="${monoD(name, nx, 9.5, 12).d}" fill="none" stroke="${INK.paper}" stroke-width="2.1" stroke-linecap="square"/>`;
  s += `<circle cx="${n1(nx - 16)}" cy="15.5" r="6.5" fill="#f2c94c"/>`;
  s += `<path d="${monoD('SWAP', w - 42, 11, 7).d}" fill="none" stroke="#f2c94c" stroke-width="1.3"/>`;
  // printed fields, slightly off register
  s += `<g transform="translate(.8 .5)" fill="none" stroke="${TEAL}" stroke-width="1.1">`;
  s += `<path d="${monoD('DISK', 10, 46, 6).d}"/>`;
  s += `<rect x="40" y="42" width="22" height="16" rx="1"/>`;
  s += `<path d="${monoD('TITLE', 76, 46, 6).d}"/>`;
  s += `<path d="M110 58H${n1(w - 12)}"/>`;
  let rl = '';
  for (let i = 0; i < 4; i++) rl += `M10 ${84 + i * 24}H${n1(w - 12)}`;
  s += `<path d="${rl}" stroke-width=".8" opacity=".75"/>`;
  s += `</g>`;
  // the pencil
  s += ink('pc pc-bold', hand('4', 46, 56, 0.82, { slant: 0.05 }).d);
  s += ink('pc pc-bold', hand('SOUND', 116, 55, 0.98, { slant: 0.08, track: 2 }).d);
  s += ink('pc', hand('all synth, no samples. all code.', 14, 81, 0.62).d);
  s += ink('pc', hand('theme: 60 s loop, 80 bpm, F major', 14, 105, 0.62).d);
  s += ink('pc', hand('e-piano, kalimba, drums, vinyl', 14, 129, 0.62).d);
  s += ink('pc', hand('-14 LUFS. nobody has heard it yet!', 14, 153, 0.62).d);
  // swappers dated their labels; this one needs it, because that last line will not stay true
  s += ink('pc', hand('(as of 1 oct 2026)', 20, 174, 0.54).d);
  s += ink('ft', wcircle(w - 28, 170, 9, 8) + wline(w - 32, 170, w - 28.5, 174, 0.1, 5) + wline(w - 28.5, 174, w - 22, 165, 0.1, 6));
  return s;
}

// Disk 5 of 5 (blue, label type B): RUN IT in marker, the commands in ballpoint.
function labelFive() {
  rnd = mulberry32(555);
  const { w } = LBL;
  let s = '';
  s += logoBlock('logo5', 'RUN IT', 14, 66, 50, { fill: '#2fb3bf', track: 3.4 });
  const lw = logoWidth('RUN IT', 50, { track: 3.4 });
  s += ink('mk', wline(12, 80, 14 + lw + 6, 78, 0.6) + wline(20, 86, 14 + lw, 84.4, 0.6));
  s += ink('ft', wcircle(w - 34, 44, 19, 18));
  s += ink('ft ft-num', hand('5', w - 40.5, 54, 1.14, { slant: 0.06 }).d);
  s += ink('bp bp-big', hand('python tools/serve.py', 14, 116, 0.9, { wob: 0.25 }).d);
  s += ink('bp', hand('then open 127.0.0.1:8765', 14, 140, 0.74).d);
  s += ink('pc', hand('tools/schedule.py checks the timers', 14, 160, 0.6).d);
  s += ink('pc', hand('no npm. no build step.', 14, 176, 0.6).d);
  return s;
}

// ------------------------------------------------------------------ assemble
const INK_CSS = [
  '.bp{fill:none;stroke:#1f3c9b;stroke-width:1.25;stroke-linecap:round;stroke-linejoin:round;opacity:.93}',
  '.bp-big{stroke-width:1.7}',
  '.pc{fill:none;stroke:#67645e;stroke-width:1;stroke-linecap:round;stroke-linejoin:round;opacity:.85}',
  '.pc-bold{stroke-width:1.6}',
  '.mk{fill:none;stroke:#141414;stroke-width:2.6;stroke-linecap:round;stroke-linejoin:round}',
  '.mk-cap{stroke-width:2.8}',
  '.ft{fill:none;stroke:#d4322a;stroke-width:2.3;stroke-linecap:round;stroke-linejoin:round;opacity:.92}',
  '.ft-num{stroke-width:2.6}',
  '.ft-thin{stroke-width:1.6;opacity:.8}',
  '.dm{fill:none;stroke:#2a2a33;stroke-width:1.12;stroke-linecap:round}',
];
const ANIM_CSS = [
  // the shutter: slides open, holds, snaps shut (as they do, on the spring)
  '.shut{animation:shut 9s infinite}',
  '@keyframes shut{0%,58%{transform:translateX(0);animation-timing-function:ease-in-out}66%,86%{transform:translateX(46.7px);animation-timing-function:cubic-bezier(.6,0,1,1)}89%,100%{transform:translateX(0)}}',
  // the sea: in, out, in, on a slow breath
  '.wash{animation:wash 9s ease-in-out infinite}',
  '@keyframes wash{0%,100%{transform:translate(0,0)}50%{transform:translate(-9px,19px)}}',
  '.glint{animation:glint 4.5s ease-in-out infinite}',
  '@keyframes glint{0%,100%{opacity:.75}50%{opacity:.25}}',
  // the crab: hidden under disk 2 at the loop point, out and back in steps
  '.crab{transform:translate(652px,198px);animation:crab 14s infinite}',
  '@keyframes crab{0%,8%{transform:translate(652px,198px);animation-timing-function:steps(9,end)}30%,46%{transform:translate(562px,140px);animation-timing-function:steps(9,end)}68%,100%{transform:translate(652px,198px)}}',
  '.legB{opacity:0}',
  '.legA{animation:legA .5s steps(1,end) infinite}',
  '.legB{animation:legB .5s steps(1,end) infinite}',
  '@keyframes legA{0%{opacity:1}50%{opacity:0}}',
  '@keyframes legB{0%{opacity:0}50%{opacity:1}}',
  '@media (prefers-reduced-motion:reduce){.shut,.wash,.glint,.crab,.legA,.legB{animation:none}}',
];

function baseDefs(w, h) {
  const defs = [];
  defs.push(`<clipPath id="panel"><rect width="${w}" height="${h}" rx="18"/></clipPath>`);
  defs.push(`<filter id="soft" x="-10%" y="-10%" width="120%" height="125%"><feGaussianBlur stdDeviation="3.2"/></filter>`);
  defs.push(sandPattern());
  defs.push(grainPattern());
  defs.push(`<path id="shell" d="${shellPath()}"/>`);
  for (const [name, k] of Object.entries(SHELLS)) {
    defs.push(`<linearGradient id="g-${name}" x1="0" y1="0" x2=".35" y2="1"><stop offset="0" stop-color="${k.top}"/><stop offset="1" stop-color="${k.bot}"/></linearGradient>`);
  }
  defs.push(`<linearGradient id="sheen" x1="0" y1="0" x2="1" y2="1"><stop offset=".18" stop-color="#fff" stop-opacity="0"/><stop offset=".32" stop-color="#fff" stop-opacity=".09"/><stop offset=".4" stop-color="#fff" stop-opacity="0"/></linearGradient>`);
  defs.push(`<radialGradient id="paper" cx=".45" cy=".4" r=".8"><stop offset="0" stop-color="#f6f2e6"/><stop offset=".65" stop-color="#f1ead6"/><stop offset="1" stop-color="#e2d3ad"/></radialGradient>`);
  defs.push(`<linearGradient id="fold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8c7a55" stop-opacity=".45"/><stop offset="1" stop-color="#8c7a55" stop-opacity="0"/></linearGradient>`);
  defs.push(`<linearGradient id="metal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e3e5e8"/><stop offset=".45" stop-color="#c3c6cb"/><stop offset="1" stop-color="#9fa3aa"/></linearGradient>`);
  defs.push(`<pattern id="brush" width="60" height="2.2" patternUnits="userSpaceOnUse"><rect width="60" height=".6" fill="#fff" opacity=".22"/><rect y="1.2" width="60" height=".5" fill="#4d5159" opacity=".1"/><rect x="14" y=".6" width="30" height=".5" fill="#fff" opacity=".1"/></pattern>`);
  defs.push(`<linearGradient id="glare" x1="0" y1="0" x2="1" y2="0"><stop offset=".15" stop-color="#fff" stop-opacity="0"/><stop offset=".35" stop-color="#fff" stop-opacity=".28"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset=".8" stop-color="#3a3d44" stop-opacity=".12"/></linearGradient>`);
  defs.push(`<radialGradient id="media" cx=".2" cy="-.6" r="1.7"><stop offset=".55" stop-color="#6a4a2e"/><stop offset=".62" stop-color="#4a3220"/><stop offset=".7" stop-color="#5c3f27"/><stop offset=".8" stop-color="#3f2a1a"/><stop offset="1" stop-color="#2e1f13"/></radialGradient>`);
  defs.push(`<radialGradient id="vig" cx=".5" cy=".5" r=".75"><stop offset=".7" stop-color="#6b4a1c" stop-opacity="0"/><stop offset="1" stop-color="#6b4a1c" stop-opacity=".22"/></radialGradient>`);
  defs.push(shutterDefs());
  return defs;
}
function wrap(w, h, label, title, css, defs, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${label}">
<title>${title}</title>
<style>${css.join('')}</style>
<defs>${defs.join('')}</defs>
<g clip-path="url(#panel)">${body}<rect width="${w}" height="${h}" fill="url(#vig)"/></g>
<rect x=".75" y=".75" width="${w - 1.5}" height="${h - 1.5}" rx="17.5" fill="none" stroke="#8a6a3a" stroke-opacity=".45" stroke-width="1.5"/>
</svg>
`;
}
function resetDoc() {
  dmUsed.clear();
  extraDefs.length = 0;
}

function buildMain() {
  resetDoc();
  const defs = baseDefs(W, H);
  defs.push(`<linearGradient id="water" x1="0" y1="1" x2=".6" y2="0"><stop offset="0" stop-color="#5fd6c8"/><stop offset=".3" stop-color="#27b4c9"/><stop offset=".75" stop-color="#1784c2"/><stop offset="1" stop-color="#1468ad"/></linearGradient>`);
  defs.push(`<linearGradient id="shallow" x1=".2" y1=".95" x2=".38" y2=".55"><stop offset="0" stop-color="#e9f6ea" stop-opacity=".55"/><stop offset="1" stop-color="#e9f6ea" stop-opacity="0"/></linearGradient>`);
  defs.push(`<linearGradient id="glass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fdcb8" stop-opacity=".75"/><stop offset=".5" stop-color="#5fae86" stop-opacity=".55"/><stop offset="1" stop-color="#2f7a58" stop-opacity=".7"/></linearGradient>`);
  defs.push(`<linearGradient id="curl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b9a98a" stop-opacity=".55"/><stop offset=".07" stop-color="#fff" stop-opacity=".5"/><stop offset=".13" stop-color="#b9a98a" stop-opacity=".18"/><stop offset=".25" stop-color="#b9a98a" stop-opacity="0"/><stop offset="1" stop-color="#b9a98a" stop-opacity=".12"/></linearGradient>`);
  defs.push(`<radialGradient id="nut" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#9a6a38"/><stop offset=".7" stop-color="#6b4420"/><stop offset="1" stop-color="#4a2e14"/></radialGradient>`);

  // Scene, back to front.
  let body = '';
  body += `<rect width="${W}" height="${H}" fill="url(#sand)"/>`;
  body += sea();
  // a couple of shells in the sand
  body += `<path d="M590 70q6 -9 13 0q-6 4 -13 0z" fill="#f4d9c8" stroke="#c99a86" stroke-width=".8"/><path d="M596.5 70v-6M593 69l2 -4M600 69l-2 -4" stroke="#c99a86" stroke-width=".6"/>`;
  body += `<path d="M960 520q5 -8 11 0q-5 3 -11 0z" fill="#f2e2cf" stroke="#c4a385" stroke-width=".8"/>`;

  // the stack, back to front: disk 5, disk 4, disk 3, then disk 1 on top
  body += disk({ x: 52, y: 22, rot: 1.2, shell: 'blue', seed: 5, label: tabCircled('5', 'RUN IT', 'python tools/serve.py', 505) });
  body += disk({ x: 36, y: 74, rot: -2.6, shell: 'black', seed: 4, label: tabSticker() });
  body += disk({ x: 54, y: 124, rot: -0.6, shell: 'blue', seed: 3, label: tabCircled('3', 'TIMERS', 'every 2 min to 6 hrs', 303) });

  body += coconutCrab();
  // disk 2, pulled out of the stack to read the gags, lying half under the stack's corner
  body += disk({ x: 432, y: 150, rot: 4.4, shell: 'blue', seed: 2, label: labelTwo(), grains: 9 });
  body += disk({ x: 40, y: 176, rot: -2.4, shell: 'black', seed: 1, label: labelOne(), shutter: 'shut', grains: 11 });

  body += bottle(560, 92, -21);
  body += cork(506, 120, 24);
  body += letter(786, 300, -5);

  defs.push(dmDefs());
  defs.push(...extraDefs);
  return wrap(W, H,
    'CASTAWAY: a stack of hand-labelled 3.5-inch floppy disks on the sand, disk 1 of 5',
    'CASTAWAY, disk 1 of 5: a lo-fi island video, swapped by bottle',
    [...INK_CSS, ...ANIM_CSS], defs, body);
}

const SW = 392;
const SH = 410;
function buildSingle(n, shell, rot, labelFn, aria) {
  resetDoc();
  const defs = baseDefs(SW, SH);
  let body = `<rect width="${SW}" height="${SH}" fill="url(#sand)"/>`;
  body += disk({ x: 18 + (rot < 0 ? 0 : 8), y: 20 - (rot < 0 ? 0 : 6), rot, shell, seed: 10 + n, label: labelFn(), grains: 7 });
  defs.push(dmDefs());
  defs.push(...extraDefs);
  return wrap(SW, SH, aria, `CASTAWAY, disk ${n} of 5`, INK_CSS, defs, body);
}

mkdirSync(dirname(OUT), { recursive: true });
const outputs = [
  [OUT, () => buildMain()],
  [resolve(here, `../assets/${SLUG}-disk3.svg`), () => buildSingle(3, 'blue', -1.4, labelThree, 'Disk 3 of 5: the timers, printed in dot matrix')],
  [resolve(here, `../assets/${SLUG}-disk4.svg`), () => buildSingle(4, 'black', 1.6, labelFour, 'Disk 4 of 5: sound, in pencil over a swap club sticker')],
  [resolve(here, `../assets/${SLUG}-disk5.svg`), () => buildSingle(5, 'blue', -1, labelFive, 'Disk 5 of 5: run it, in marker and ballpoint')],
];
for (const [file, make] of outputs) {
  const svg = make();
  writeFileSync(file, svg);
  console.log(`wrote ${file} (${(svg.length / 1024).toFixed(1)} KB)`);
}
