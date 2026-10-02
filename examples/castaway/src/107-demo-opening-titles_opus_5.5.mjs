#!/usr/bin/env node
// 107-demo-opening-titles_opus_5.5: the "PC Demo Opening Titles" README header
// for Castaway (catalogue entry demo-01).
//
// The style is the early-90s PC demo's opening titles and closing credit cards,
// in the manner of the Assembly 1993 winner: a black screen, centred text cards
// that fade up from black, hold and fade out again, then a wide painted horizon
// strip panning sideways inside black letterbox bars while role cards fade in
// over it; and, at the end, credit cards in which a small picture of one part
// and a few capital lines of ROLE - NAME slide in from opposite edges with a
// decaying ease, hold, and accelerate away. Everything here is redrawn from
// scratch: the crew name is invented, the proportional anti-aliased bitmap
// font is skeleton-stroked and rasterised in this file, and the island, sea,
// sky and every thumbnail are painted pixel by pixel below. Nothing is copied
// from any demo: not its cards, wording, font, pictures or music.
//
// Two images, both on a 320 x 128 "VGA pixel" grid shown at 800 x 320:
//   assets/<slug>.svg          the opening titles: three cards on black, then the
//                              horizon pan with two role cards, then the held title
//   assets/<slug>-credits.svg  eight closing credit cards, thumbnail + ROLE - NAME
//
//   node 107-demo-opening-titles_opus_5.5.mjs                  regenerate both SVGs
//   node 107-demo-opening-titles_opus_5.5.mjs --specimen=FILE  also write a font specimen SVG
//
// Plain Node, no dependencies. Randomness comes from a seeded PRNG (seed 1992,
// the project's default run seed), so the output is byte-stable.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '107-demo-opening-titles_opus_5.5';
const ASSETS = path.join(HERE, '..', 'assets');
const OUT_MAIN = path.join(ASSETS, `${SLUG}.svg`);
const OUT_CREDITS = path.join(ASSETS, `${SLUG}-credits.svg`);
const args = process.argv.slice(2);
const argVal = (name) => {
  const a = args.find((x) => x.startsWith(`--${name}=`));
  return a ? a.slice(name.length + 3) : null;
};

// ---------------------------------------------------------------- helpers
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
const r2 = (v) => String(Math.round(v * 100) / 100);
const r3 = (v) => String(Math.round(v * 1000) / 1000);
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// VGA DAC: 6 bits per channel. Every colour in both pictures is snapped to it.
function vga(hex) {
  const n = parseInt(hex.slice(1), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => {
    const six = Math.round((c / 255) * 63);
    return Math.round((six * 255) / 63);
  });
  return '#' + ch.map((c) => c.toString(16).padStart(2, '0')).join('');
}
function mix(a, b, t) {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const c = [16, 8, 0].map((s) => {
    const x = (pa >> s) & 255;
    const y = (pb >> s) & 255;
    return Math.round(x + (y - x) * t);
  });
  return '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
}
// A colour ramp through several stops, t in [0,1].
function ramp(stops, t) {
  const n = stops.length - 1;
  const x = Math.max(0, Math.min(0.99999, t)) * n;
  const i = Math.floor(x);
  return mix(stops[i], stops[i + 1], x - i);
}

// ================================================================ THE FONT
// A proportional sans drawn as pen skeletons, in units where the cap height is
// 10, the x-height 7, ascenders 10.5 and descenders 3 (y grows downward, the
// baseline is y = 0). Strokes:
//   ['L', x,y, x,y, ...]           polyline
//   ['A', cx,cy, rx,ry, a0,a1]     elliptical arc, degrees, 0 = east, 90 = south
//   ['C', x0,y0, x1,y1, x2,y2, x3,y3]  cubic
//   ['D', x,y, k]                  a dot, pen scaled by k
// Each glyph is [advance, strokes]. The rasteriser below turns them into
// anti-aliased pixels at whatever cap height a card needs.
const dot = (x, y, k = 1.25) => ['D', x, y, k];
const SK = {
  A: [7.6, [['L', 0.5, 0, 3.8, -10, 7.1, 0], ['L', 1.65, -3.3, 5.95, -3.3]]],
  B: [6.9, [['L', 3.9, -5.25, 1, -5.25], ['L', 1, 0, 1, -10, 3.7, -10], ['A', 3.7, -7.62, 2.25, 2.38, -90, 90], ['L', 3.9, -5.25], ['A', 4.0, -2.62, 2.45, 2.62, -90, 90], ['L', 4.0, 0, 1, 0]]],
  C: [7.3, [['A', 4.2, -5, 3.4, 5, 42, 318]]],
  D: [7.8, [['L', 3.1, 0, 1, 0, 1, -10, 3.1, -10], ['A', 3.1, -5, 3.6, 5, -90, 90]]],
  E: [6.3, [['L', 5.5, -10, 1, -10, 1, 0, 5.6, 0], ['L', 1, -5.1, 4.9, -5.1]]],
  F: [6.0, [['L', 5.4, -10, 1, -10, 1, 0], ['L', 1, -5.1, 4.8, -5.1]]],
  G: [8.0, [['A', 4.3, -5, 3.5, 5, 0, 312], ['L', 4.9, -4.6, 7.8, -4.6, 7.8, -1.2]]],
  H: [7.8, [['L', 1, 0, 1, -10], ['L', 6.8, 0, 6.8, -10], ['L', 1, -5.1, 6.8, -5.1]]],
  I: [2.4, [['L', 1.2, 0, 1.2, -10]]],
  J: [4.4, [['L', 3.3, -10, 3.3, -2.5], ['A', 1.75, -2.5, 1.55, 2.5, 0, 165]]],
  K: [6.9, [['L', 1, 0, 1, -10], ['L', 6.3, -10, 1, -3.7], ['L', 2.9, -5.9, 6.6, 0]]],
  L: [5.7, [['L', 1, -10, 1, 0, 5.4, 0]]],
  M: [9.2, [['L', 1, 0, 1.15, -10, 4.6, -2.0, 8.05, -10, 8.2, 0]]],
  N: [7.9, [['L', 1, 0, 1, -10, 6.9, 0, 6.9, -10]]],
  O: [8.6, [['A', 4.3, -5, 3.45, 5, 0, 360]]],
  P: [6.6, [['L', 1, 0, 1, -10, 3.6, -10], ['A', 3.6, -7.3, 2.55, 2.7, -90, 90], ['L', 3.6, -4.6, 1, -4.6]]],
  Q: [8.6, [['A', 4.3, -5, 3.45, 5, 0, 360], ['L', 5.4, -2.2, 8.1, 0.9]]],
  R: [6.9, [['L', 1, 0, 1, -10, 3.6, -10], ['A', 3.6, -7.45, 2.5, 2.55, -90, 90], ['L', 3.6, -4.9, 1, -4.9], ['L', 3.3, -4.9, 6.4, 0]]],
  S: [6.4, [['A', 3.2, -7.45, 2.3, 2.55, 335, 90], ['A', 3.2, -2.45, 2.55, 2.45, 270, 512]]],
  T: [6.8, [['L', 0.4, -10, 6.4, -10], ['L', 3.4, -10, 3.4, 0]]],
  U: [7.6, [['L', 1, -10, 1, -3.4], ['A', 3.8, -3.4, 2.8, 3.4, 180, 0], ['L', 6.6, -3.4, 6.6, -10]]],
  V: [7.2, [['L', 0.4, -10, 3.6, 0, 6.8, -10]]],
  W: [10.6, [['L', 0.4, -10, 2.9, 0, 5.3, -9.2, 7.7, 0, 10.2, -10]]],
  X: [7.0, [['L', 0.7, -10, 6.3, 0], ['L', 6.3, -10, 0.7, 0]]],
  Y: [7.0, [['L', 0.5, -10, 3.5, -4.9, 6.5, -10], ['L', 3.5, -4.9, 3.5, 0]]],
  Z: [6.6, [['L', 0.9, -10, 5.8, -10, 0.8, 0, 5.9, 0]]],

  a: [6.3, [['A', 3.0, -3.5, 2.25, 3.5, 0, 360], ['L', 5.25, -7, 5.25, 0]]],
  b: [6.3, [['L', 1, -10.5, 1, 0], ['A', 3.25, -3.5, 2.25, 3.5, 0, 360]]],
  c: [5.6, [['A', 3.2, -3.5, 2.5, 3.5, 45, 315]]],
  d: [6.3, [['A', 3.05, -3.5, 2.25, 3.5, 0, 360], ['L', 5.3, -10.5, 5.3, 0]]],
  e: [6.1, [['L', 0.75, -3.6, 5.55, -3.6], ['A', 3.15, -3.5, 2.4, 3.5, 358, 42]]],
  f: [4.2, [['L', 1.9, 0, 1.9, -8.5], ['A', 3.5, -8.5, 1.6, 2.0, 180, 305], ['L', 0.3, -6.9, 4.0, -6.9]]],
  g: [6.3, [['A', 3.0, -3.6, 2.25, 3.4, 0, 360], ['L', 5.25, -7, 5.25, 0.8], ['A', 3.0, 0.8, 2.25, 2.2, 0, 160]]],
  h: [6.4, [['L', 1, -10.5, 1, 0], ['A', 3.2, -4.6, 2.2, 2.4, 180, 360], ['L', 5.4, -4.6, 5.4, 0]]],
  i: [2.2, [['L', 1.1, -7, 1.1, 0], dot(1.1, -9.4)]],
  j: [2.8, [['L', 1.6, -7, 1.6, 1.4], ['A', 0.2, 1.4, 1.4, 1.6, 0, 125], dot(1.6, -9.4)]],
  k: [5.8, [['L', 1, -10.5, 1, 0], ['L', 5.1, -7, 1, -2.7], ['L', 2.7, -4.4, 5.5, 0]]],
  l: [2.2, [['L', 1.1, -10.5, 1.1, 0]]],
  m: [9.4, [['L', 1, -7, 1, 0], ['A', 2.85, -4.6, 1.85, 2.4, 180, 360], ['L', 4.7, -4.6, 4.7, 0], ['A', 6.55, -4.6, 1.85, 2.4, 180, 360], ['L', 8.4, -4.6, 8.4, 0]]],
  n: [6.4, [['L', 1, -7, 1, 0], ['A', 3.2, -4.6, 2.2, 2.4, 180, 360], ['L', 5.4, -4.6, 5.4, 0]]],
  o: [6.4, [['A', 3.2, -3.5, 2.4, 3.5, 0, 360]]],
  p: [6.3, [['L', 1, -7, 1, 3], ['A', 3.25, -3.5, 2.25, 3.5, 0, 360]]],
  q: [6.3, [['A', 3.05, -3.5, 2.25, 3.5, 0, 360], ['L', 5.3, -7, 5.3, 3]]],
  r: [4.3, [['L', 1, -7, 1, 0], ['A', 3.2, -4.5, 2.2, 2.5, 180, 298]]],
  s: [5.3, [['A', 2.65, -5.25, 1.85, 1.75, 330, 90], ['A', 2.65, -1.75, 2.0, 1.75, 270, 510]]],
  t: [4.4, [['L', 1.9, -9.2, 1.9, -1.6], ['A', 3.3, -1.6, 1.4, 1.6, 180, 70], ['L', 0.3, -7, 4.0, -7]]],
  u: [6.4, [['L', 1, -7, 1, -2.4], ['A', 3.2, -2.4, 2.2, 2.4, 180, 0], ['L', 5.4, -7, 5.4, 0]]],
  v: [5.9, [['L', 0.4, -7, 2.95, 0, 5.5, -7]]],
  w: [8.8, [['L', 0.4, -7, 2.45, 0, 4.4, -6.2, 6.35, 0, 8.4, -7]]],
  x: [5.8, [['L', 0.7, -7, 5.1, 0], ['L', 5.1, -7, 0.7, 0]]],
  y: [5.9, [['L', 0.4, -7, 3.0, -0.2], ['L', 5.5, -7, 2.5, 1.6, 1.8, 2.6, 0.7, 2.95]]],
  z: [5.8, [['L', 0.8, -7, 5.0, -7, 0.8, 0, 5.2, 0]]],

  0: [6.6, [['A', 3.3, -5, 2.55, 5, 0, 360]]],
  1: [5.0, [['L', 1.2, -8.1, 3.2, -10, 3.2, 0]]],
  2: [6.4, [['A', 3.15, -7.4, 2.35, 2.6, 192, 398], ['L', 4.95, -5.73, 0.9, 0, 5.7, 0]]],
  3: [6.3, [['A', 3.0, -7.6, 2.15, 2.4, 205, 450], ['A', 3.0, -2.6, 2.55, 2.6, 270, 512]]],
  4: [6.6, [['L', 4.7, 0, 4.7, -10, 0.6, -3.1, 6.3, -3.1]]],
  5: [6.5, [['L', 5.4, -10, 1.5, -10, 1.15, -5.5], ['A', 3.25, -3.0, 2.55, 3.0, 232, 512]]],
  6: [6.6, [['A', 3.3, -3.2, 2.45, 3.2, 0, 360], ['C', 0.85, -3.2, 0.7, -7.6, 2.4, -10, 5.1, -9.9]]],
  7: [6.2, [['L', 0.8, -10, 5.7, -10, 2.3, 0]]],
  8: [6.4, [['A', 3.2, -7.6, 2.1, 2.4, 0, 360], ['A', 3.2, -2.65, 2.5, 2.65, 0, 360]]],
  9: [6.6, [['A', 3.3, -6.8, 2.45, 3.2, 0, 360], ['C', 5.75, -6.8, 5.9, -2.4, 4.2, 0, 1.5, -0.1]]],

  '.': [2.3, [dot(1.15, -0.25)]],
  ',': [2.3, [['L', 1.35, -0.6, 0.7, 1.5]]],
  ':': [2.3, [dot(1.15, -0.25), dot(1.15, -6.2)]],
  ';': [2.3, [dot(1.15, -6.2), ['L', 1.35, -0.6, 0.7, 1.5]]],
  '-': [4.6, [['L', 0.8, -4.0, 3.8, -4.0]]],
  "'": [2.2, [['L', 1.1, -10.3, 1.1, -7.6]]],
  '(': [3.4, [['A', 4.6, -3.6, 3.5, 6.9, 122, 238]]],
  ')': [3.4, [['A', -1.2, -3.6, 3.5, 6.9, -58, 58]]],
  '/': [4.6, [['L', 0.4, 1.2, 4.2, -10.5]]],
  '?': [5.6, [['A', 2.9, -7.6, 2.2, 2.4, 195, 420], ['L', 4.0, -5.5, 2.9, -4.3, 2.9, -2.7], dot(2.9, -0.25)]],
  '!': [2.4, [['L', 1.2, -10, 1.2, -2.8], dot(1.2, -0.25)]],
  '=': [5.8, [['L', 0.8, -5.4, 5.0, -5.4], ['L', 0.8, -2.6, 5.0, -2.6]]],
  '+': [6.0, [['L', 3.0, -6.8, 3.0, -1.2], ['L', 0.6, -4.0, 5.4, -4.0]]],
  '&': [7.4, [['C', 6.6, 0, 1.6, -5.2, 1.6, -8.0], ['A', 3.2, -8.1, 1.6, 1.9, 180, 380], ['C', 4.7, -7.4, 0.6, -5.2, 0.6, -2.6], ['A', 3.0, -2.5, 2.4, 2.5, 180, 90], ['L', 3.0, 0, 6.6, -4.4]]],
  ' ': [2.8, []],
};

// Turn strokes into polylines (in units). Dots become one-point "polylines".
function flatten(stroke) {
  const [kind, ...v] = stroke;
  if (kind === 'L') {
    const pts = [];
    for (let i = 0; i < v.length; i += 2) pts.push([v[i], v[i + 1]]);
    return { pts, k: 1 };
  }
  if (kind === 'A') {
    const [cx, cy, rx, ry, a0, a1] = v;
    const n = Math.max(10, Math.ceil(Math.abs(a1 - a0) / 5));
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180;
      pts.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]);
    }
    return { pts, k: 1 };
  }
  if (kind === 'C') {
    const [x0, y0, x1, y1, x2, y2, x3, y3] = v;
    const pts = [];
    for (let i = 0; i <= 28; i++) {
      const t = i / 28;
      const u = 1 - t;
      pts.push([
        u * u * u * x0 + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x3,
        u * u * u * y0 + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y3,
      ]);
    }
    return { pts, k: 1 };
  }
  if (kind === 'D') return { pts: [[v[0], v[1]]], k: v[2] };
  throw new Error('bad stroke ' + kind);
}

// One rasterised face: a cap height in pixels, a pen (an ellipse, so vertical
// stems can be a touch heavier than horizontals), tracking, and a vertical
// grid fit that lands the baseline, x-height and cap height on pixel rows.
class Face {
  constructor(id, { cap, penX, penY, track = 0, gap = 1, wide = 1, levels = 5, kern = false }) {
    this.id = id;
    this.gap = gap;
    this.kern = kern;
    this.pairs = new Map();
    this.cap = cap;
    this.penX = penX;
    this.penY = penY;
    this.track = track;
    this.wide = wide;
    this.levels = levels;
    this.xh = Math.round(cap * 0.7);
    this.asc = Math.round(cap * 1.05);
    this.desc = Math.round(cap * 0.3);
    this.sx = ((cap - 1) / 10) * wide;
    this.cache = new Map();
    this.used = new Set();
  }
  // Piecewise-linear vertical fit: stroke centres sit half a pixel inside the
  // row they belong to, so a one-pixel pen fills exactly one row.
  mapY(y) {
    const A = [
      [-10.5, -(this.asc - 0.5)],
      [-10, -(this.cap - 0.5)],
      [-7, -(this.xh - 0.5)],
      [0, -0.5],
      [3, this.desc - 0.5],
    ];
    if (y <= A[0][0]) return A[0][1] + (y - A[0][0]) * this.sx;
    for (let i = 0; i < A.length - 1; i++) {
      const [ya, pa] = A[i];
      const [yb, pb] = A[i + 1];
      if (y <= yb) return pa + ((y - ya) / (yb - ya)) * (pb - pa);
    }
    const [yl, pl] = A[A.length - 1];
    return pl + (y - yl) * this.sx;
  }
  glyph(ch) {
    if (this.cache.has(ch)) return this.cache.get(ch);
    const sk = SK[ch];
    if (!sk) throw new Error(`no glyph for ${JSON.stringify(ch)}`);
    const [adv, strokes] = sk;
    const lines = strokes.map(flatten).map(({ pts, k }) => ({
      k,
      pts: pts.map(([x, y]) => [x * this.sx, this.mapY(y)]),
    }));
    // Try a few sub-pixel shifts and keep the sharpest (a poor man's hinting).
    let best = null;
    for (const dx of [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9]) {
      const bm = this.raster(lines, dx);
      if (!best || bm.sharp > best.sharp + 1e-9) best = bm;
    }
    // Ink-based spacing, as bitmap fonts do it: the glyph's solid pixels start
    // at x = 0 and the advance is their width plus a fixed gap.
    if (!best.px.length) {
      const g = { adv: Math.round(adv * this.sx * 0.9 + this.track), px: [] };
      this.cache.set(ch, g);
      return g;
    }
    const solid = Math.ceil(this.levels * 0.4);
    let lo = Infinity, hi = -Infinity;
    for (const [x, , q] of best.px) if (q >= solid) { lo = Math.min(lo, x); hi = Math.max(hi, x); }
    if (lo === Infinity) for (const [x] of best.px) { lo = Math.min(lo, x); hi = Math.max(hi, x); }
    const px = best.px.map(([x, y, q]) => [x - lo, y, q]);
    const g = { adv: hi - lo + 1 + this.gap, px };
    this.cache.set(ch, g);
    return g;
  }
  raster(lines, dx) {
    const px = this.penX;
    const py = this.penY;
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    for (const l of lines) for (const [x, y] of l.pts) {
      x0 = Math.min(x0, x + dx - px * l.k); x1 = Math.max(x1, x + dx + px * l.k);
      y0 = Math.min(y0, y - py * l.k); y1 = Math.max(y1, y + py * l.k);
    }
    if (!lines.length) return { px: [], sharp: 0, w: 0 };
    const ix0 = Math.floor(x0), ix1 = Math.ceil(x1), iy0 = Math.floor(y0), iy1 = Math.ceil(y1);
    const N = 6;
    const out = [];
    let s1 = 0, s2 = 0;
    for (let iy = iy0; iy < iy1; iy++) {
      for (let ix = ix0; ix < ix1; ix++) {
        let hit = 0;
        for (let sy = 0; sy < N; sy++) {
          for (let sx = 0; sx < N; sx++) {
            const X = ix + (sx + 0.5) / N - dx;
            const Y = iy + (sy + 0.5) / N;
            if (this.inside(lines, X, Y)) hit++;
          }
        }
        if (hit) {
          const c = hit / (N * N);
          s1 += c; s2 += c * c;
          const q = Math.round(c * this.levels);
          if (q > 0) out.push([ix, iy, q]);
        }
      }
    }
    return { px: out, sharp: s2 / Math.max(1e-9, s1) };
  }
  inside(lines, X, Y) {
    for (const l of lines) {
      const ax = this.penX * l.k;
      const ay = this.penY * l.k;
      const p = l.pts;
      if (p.length === 1) {
        const dx = (X - p[0][0]) / ax, dy = (Y - p[0][1]) / ay;
        if (dx * dx + dy * dy <= 1) return true;
        continue;
      }
      for (let i = 0; i < p.length - 1; i++) {
        const x1 = p[i][0] / ax, y1 = p[i][1] / ay, x2 = p[i + 1][0] / ax, y2 = p[i + 1][1] / ay;
        const qx = X / ax, qy = Y / ay;
        const vx = x2 - x1, vy = y2 - y1;
        const L = vx * vx + vy * vy;
        let t = L ? ((qx - x1) * vx + (qy - y1) * vy) / L : 0;
        t = Math.max(0, Math.min(1, t));
        const ex = x1 + vx * t - qx, ey = y1 + vy * t - qy;
        if (ex * ex + ey * ey <= 1) return true;
      }
    }
    return false;
  }
  width(str) {
    return this.advance(str) - this.gap;
  }
  // Optical kerning for the capitals faces: ink-based spacing leaves big holes
  // in pairs like E-A or T-A, so close them by up to the amount that keeps
  // the nearest pixels at least a pixel apart. Spaces are never kerned.
  rowsOf(g) {
    if (g.rows) return g.rows;
    const m = new Map();
    const solid = Math.ceil(this.levels * 0.5); // faint anti-aliasing does not count
    for (const [x, y, q] of g.px) {
      if (q < solid) continue;
      const r = m.get(y);
      if (!r) m.set(y, [x, x]);
      else { r[0] = Math.min(r[0], x); r[1] = Math.max(r[1], x); }
    }
    g.rows = m;
    return m;
  }
  pair(a, b) {
    if (!this.kern || !/[A-Za-z]/.test(a) || !/[A-Za-z]/.test(b)) return 0; // letters only
    const key = a + b;
    if (this.pairs.has(key)) return this.pairs.get(key);
    const ga = this.glyph(a), gb = this.glyph(b);
    const ra = this.rowsOf(ga), rb = this.rowsOf(gb);
    const cap = this.gap + 3;
    let minD = Infinity, sum = 0, n = 0;
    for (let y = -this.cap; y < 0; y++) {
      const A = ra.get(y), B = rb.get(y);
      if (!A && !B) continue;
      let d = cap;
      if (A && B) d = Math.min(cap, ga.adv + B[0] - A[1] - 1);
      sum += d; n++;
      // the nearest pixels, this row or a diagonal neighbour
      if (A) for (const dy of [-1, 0, 1]) {
        const C = rb.get(y + dy);
        if (C) minD = Math.min(minD, ga.adv + C[0] - A[1] - 1);
      }
    }
    let k = 0;
    if (Number.isFinite(minD)) k = Math.max(0, Math.min(minD - Math.max(1, this.gap - 1), Math.round((sum / n - this.gap) * 0.6)));
    this.pairs.set(key, k);
    return k;
  }
  advance(str) {
    let w = 0;
    let prev = null;
    for (const ch of str) {
      if (prev !== null) w -= this.pair(prev, ch);
      w += this.glyph(ch).adv;
      prev = ch;
    }
    return w;
  }
  gid(ch) {
    return `${this.id}${ch.codePointAt(0).toString(36)}`;
  }
  // <use> elements for a string, starting at x (baseline at y = 0 of the group).
  uses(str, x = 0) {
    let s = '';
    let cx = Math.round(x);
    let prev = null;
    for (const ch of str) {
      const g = this.glyph(ch);
      if (prev !== null) cx -= this.pair(prev, ch);
      prev = ch;
      if (g.px.length) {
        this.used.add(ch);
        s += `<use href="#${this.gid(ch)}" x="${cx}"/>`;
      }
      cx += g.adv;
    }
    return s;
  }
  // Glyph definitions: one path per coverage level, rects merged in runs.
  defs() {
    let s = '';
    for (const ch of [...this.used].sort()) {
      const g = this.glyph(ch);
      const byQ = new Map();
      for (const [x, y, q] of g.px) {
        if (!byQ.has(q)) byQ.set(q, []);
        byQ.get(q).push([x, y]);
      }
      let inner = '';
      for (const q of [...byQ.keys()].sort()) {
        inner += `<path class="q${this.id}${q}" d="${rectsToPath(mergeCells(byQ.get(q)))}"/>`;
      }
      s += `<g id="${this.gid(ch)}">${inner}</g>`;
    }
    return s;
  }
}

// Cells [x,y] -> rectangles: horizontal runs, then identical runs stacked.
function mergeCells(cells) {
  const rows = new Map();
  for (const [x, y] of cells) {
    if (!rows.has(y)) rows.set(y, []);
    rows.get(y).push(x);
  }
  const runs = [];
  for (const [y, xs] of rows) {
    xs.sort((a, b) => a - b);
    let s = xs[0], p = xs[0];
    for (let i = 1; i <= xs.length; i++) {
      if (i < xs.length && xs[i] === p + 1) { p = xs[i]; continue; }
      runs.push({ x: s, y, w: p - s + 1, h: 1 });
      if (i < xs.length) { s = xs[i]; p = xs[i]; }
    }
  }
  return stackRuns(runs);
}
function stackRuns(runs) {
  runs.sort((a, b) => a.x - b.x || a.w - b.w || a.y - b.y);
  const out = [];
  for (const r of runs) {
    const last = out[out.length - 1];
    if (last && last.x === r.x && last.w === r.w && last.y + last.h === r.y) last.h += r.h;
    else out.push({ ...r });
  }
  return out;
}
const rectsToPath = (rects) => rects.map((r) => `M${r.x} ${r.y}h${r.w}v${r.h}h-${r.w}z`).join('');

// Coverage levels to opacity (a touch of gamma so thin strokes keep weight).
function qStyles(faces) {
  let s = '';
  for (const f of faces) {
    for (let q = 1; q <= f.levels; q++) s += `.q${f.id}${q}{fill-opacity:${r3(Math.pow(q / f.levels, 0.8))}}`;
  }
  return s;
}

// ---------------------------------------------------------------- faces
const FACE = {
  title: new Face('t', { cap: 28, penX: 1.75, penY: 1.15, track: 6, gap: 3, levels: 6 }),
  big: new Face('b', { cap: 11, penX: 0.78, penY: 0.62, track: 3, gap: 2 }),
  small: new Face('s', { cap: 8, penX: 0.6, penY: 0.52, track: 2, gap: 1, kern: true }),
  caps: new Face('c', { cap: 8, penX: 0.62, penY: 0.54, track: 3, gap: 2, kern: true }),
  // the opening cards on black: bigger, as the demo's own cards were
  card: new Face('k', { cap: 15, penX: 1.0, penY: 0.8, track: 4, gap: 2, kern: true }),
  cardSub: new Face('u', { cap: 9, penX: 0.64, penY: 0.55, track: 3, gap: 1, kern: true }),
};

// ---------------------------------------------------------------- specimen
function specimen(file) {
  const lines = [
    [FACE.title, 'Castaway'],
    [FACE.big, 'Ten Hours Later'],
    [FACE.big, 'Synthesized Sound 127.0.0.1'],
    [FACE.small, 'abcdefghijklmnopqrstuvwxyz 0123456789'],
    [FACE.small, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ .,:;-()/?!&'],
    [FACE.small, 'a ten-hour lo-fi island video, almost nothing happens'],
    [FACE.caps, 'RHYTHM SECTION - A SHARK'],
    [FACE.big, 'abcdefghijklmnopqrstuvwxyz'],
    [FACE.big, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789'],
  ];
  let y = 4;
  let body = '';
  for (const [f, str] of lines) {
    y += f.asc + 2;
    body += `<g transform="translate(6 ${y})" fill="#f1ead8">${f.uses(str, 0)}</g>`;
    y += f.desc + 2;
  }
  const defs = Object.values(FACE).map((f) => f.defs()).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 ${y + 4}" width="${320 * 4}" height="${(y + 4) * 4}"><style>${qStyles(Object.values(FACE))}</style><defs>${defs}</defs><rect width="320" height="${y + 4}" fill="#000"/>${body}</svg>`;
  fs.writeFileSync(file, svg);
  for (const f of Object.values(FACE)) f.used.clear();
}

// ================================================================ PIXELS
// A palette-indexed canvas in screen pixels. A `wrap` canvas is a seamless
// tile: x wraps round, so things can sit across its seam.
class Canvas {
  constructor(w, h, wrap = false) {
    this.w = w;
    this.h = h;
    this.wrap = wrap;
    this.c = new Array(w * h).fill(null);
  }
  ix(x, y) {
    x = Math.round(x);
    y = Math.round(y);
    if (y < 0 || y >= this.h) return -1;
    if (this.wrap) x = ((x % this.w) + this.w) % this.w;
    else if (x < 0 || x >= this.w) return -1;
    return y * this.w + x;
  }
  set(x, y, col) {
    const i = this.ix(x, y);
    if (i >= 0 && col) this.c[i] = col;
  }
  get(x, y) {
    const i = this.ix(x, y);
    return i >= 0 ? this.c[i] : null;
  }
  rect(x, y, w, h, col) {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, col);
  }
  // Fill an ellipse; `col` can be a function (x, y, nx, ny, r) -> colour, where
  // nx, ny are the normalised offsets from the centre.
  ellipse(cx, cy, rx, ry, col, wob = null) {
    for (let y = Math.floor(cy - ry - 2); y <= Math.ceil(cy + ry + 2); y++) {
      for (let x = Math.floor(cx - rx - 2); x <= Math.ceil(cx + rx + 2); x++) {
        const nx = (x + 0.5 - cx) / rx;
        const ny = (y + 0.5 - cy) / ry;
        const lim = wob ? wob(Math.atan2(ny, nx)) : 1;
        const d = nx * nx + ny * ny;
        if (d <= lim * lim) this.set(x, y, typeof col === 'function' ? col(x, y, nx, ny, Math.sqrt(d) / lim) : col);
      }
    }
  }
  // Pixel sprite: rows of characters, `map` from character to colour.
  sprite(x, y, rows, map) {
    rows.forEach((row, j) => {
      [...row].forEach((ch, i) => {
        if (map[ch]) this.set(x + i, y + j, map[ch]);
      });
    });
  }
  // Full-width rects of each row's commonest colour (sky and sea gradients cost
  // one rect a band this way). paths(attrs, true) then skips those pixels.
  underlay() {
    this.dom = new Array(this.h).fill(null);
    let s = '';
    let prev = null, start = 0;
    const flush = (end) => {
      if (prev) s += `<rect y="${start}" width="${this.w}" height="${end - start + (end < this.h ? 1 : 0)}" fill="${prev}"/>`;
    };
    for (let y = 0; y <= this.h; y++) {
      let col = null;
      if (y < this.h) {
        const n = new Map();
        for (let x = 0; x < this.w; x++) {
          const c = this.c[y * this.w + x];
          if (c) n.set(c, (n.get(c) || 0) + 1);
        }
        let best = 0;
        for (const [c, k] of n) if (k > best) { best = k; col = c; }
        this.dom[y] = col;
      }
      if (col !== prev) { flush(y); prev = col; start = y; }
    }
    return s;
  }
  paths(attrs = '', overUnderlay = false) {
    const by = new Map();
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        const col = this.c[y * this.w + x];
        if (!col) continue;
        if (overUnderlay && this.dom && col === this.dom[y]) continue;
        if (!by.has(col)) by.set(col, []);
        by.get(col).push([x, y]);
      }
    }
    let s = '';
    for (const [col, cells] of [...by.entries()].sort((a, b) => b[1].length - a[1].length)) {
      s += `<path fill="${col}"${attrs} d="${rectsToPath(mergeCells(cells))}"/>`;
    }
    return s;
  }
}
// A sprite straight to SVG (for the little animated actors).
function spriteSvg(rows, map, x = 0, y = 0) {
  const w = Math.max(...rows.map((r) => r.length));
  const cv = new Canvas(w, rows.length);
  cv.sprite(0, 0, rows, map);
  return `<g transform="translate(${x} ${y})">${cv.paths()}</g>`;
}

// ---------------------------------------------------------------- palette
const PAL = {
  sky: ['#14347c', '#1d4b9e', '#2e68b9', '#4b8ccf', '#7cb5e2', '#b4d9ef', '#d9eef5'],
  sea: ['#1a4c8f', '#1c5c9f', '#2070ae', '#2587bc', '#2b9cc4', '#33aec8'],
  cloud: ['#ffffff', '#ecf4fb', '#d0e1f1', '#adc6e0', '#93b0d3'],
  sand: '#ecd39f', sandHi: '#f6e5bb', sandLo: '#d8b67f', wet: '#c49d6c', foam: '#f2fbfb',
  shallow: ['#2ea5c3', '#4cbfc6', '#78d3c9'],
  leaf: ['#25602e', '#357f37', '#4f9e3f', '#7cc04f', '#b2dd68'],
  bark: ['#7b432b', '#a3613e', '#c0805a', '#d99f70'],
  nut: '#6c4321', nutHi: '#9c6a3a',
  coral: '#e8735e', coralLo: '#c3584a', cream: '#f1e7cc', creamLo: '#cdbf9c',
  skin: '#e8b089', skinLo: '#c88b68', hair: '#5a3826', hairLo: '#3c2417',
  phone: '#f6efdb', phoneLo: '#cbbf9e',
  log: '#b5764a', logLo: '#84502f', logEnd: '#6b3e24', rope: '#e2cf98',
  rock: '#8e9095', rockHi: '#b8babd', rockLo: '#5f6267',
  shark: '#7a91a7', sharkLo: '#5b7189', sharkHi: '#a5b8c9', eye: '#18222e',
  turtle: '#6c8a3a', turtleHi: '#94ad55', turtleSkin: '#a2b86c',
  glass: '#3f9467', glassHi: '#a8dcb4', cork: '#b27c4b', paper: '#f3e9cf',
  crabLeg: '#dd5a3c', crabEye: '#1d1712',
  ship: '#2d3c5a', shipHi: '#e9eef4', funnel: '#e0715a',
  gull: '#3a4d6a',
};
for (const k of Object.keys(PAL)) PAL[k] = Array.isArray(PAL[k]) ? PAL[k].map(vga) : vga(PAL[k]);

// ================================================================ THE HORIZON
// Screen layout, in VGA pixels: letterbox bars 0-16 and 112-128, picture
// 16-112, horizon at 72.
const W = 320;
const H = 128;
const PIC_Y = 16;
const PIC_H = 96;
const HOR = 72;
const TILE = 480; // main strip tile (island, sea texture, visitors)
const CTILE = 320; // cloud strip tile (slower: further away)
const T = 48; // seconds: the whole title sequence, 16 bars of the 80 BPM theme

function skyBands() {
  let s = '';
  const n = (HOR - PIC_Y) / 2;
  for (let i = 0; i < n; i++) {
    const t = Math.pow(i / (n - 1), 1.25);
    s += `<rect y="${PIC_Y + i * 2}" width="${W}" height="${i < n - 1 ? 3 : 2}" fill="${vga(ramp(PAL.sky, t))}"/>`;
  }
  return s;
}
const SEA_ROWS = PIC_Y + PIC_H - HOR - 1;
const seaAt = (y) => vga(ramp(PAL.sea, Math.pow(Math.max(0, y - HOR - 1) / (SEA_ROWS - 1), 0.85)));
function seaBands() {
  let s = '';
  let prev = null, start = HOR + 1;
  for (let y = HOR + 1; y <= PIC_Y + PIC_H; y++) {
    const col = y < PIC_Y + PIC_H ? seaAt(y) : null;
    if (col !== prev) {
      if (prev) s += `<rect y="${start}" width="${W}" height="${y - start + (col ? 1 : 0)}" fill="${prev}"/>`;
      prev = col;
      start = y;
    }
  }
  return s + `<rect y="${HOR}" width="${W}" height="1" fill="${vga('#a7cde6')}"/>`;
}

// Cumulus: puffs on a flat base, lit from the upper left.
function cumulus(cv, rnd, x0, base, width, height, haze = 0) {
  const puffs = [];
  const n = Math.max(3, Math.round(width / 9));
  for (let i = 0; i < n; i++) {
    const u = (i + 0.5) / n;
    const bell = Math.sin(Math.PI * u);
    const r = (height * (0.45 + 0.55 * bell)) * (0.75 + rnd() * 0.35);
    puffs.push([x0 + width * u + (rnd() - 0.5) * 4, base - r * 0.55, r]);
  }
  for (let i = 0; i < Math.round(n / 2); i++) {
    const u = 0.25 + rnd() * 0.5;
    const r = height * (0.35 + rnd() * 0.3);
    puffs.push([x0 + width * u, base - height * 0.75 - r * 0.2, r]);
  }
  const L = [-0.5, -0.86];
  const tones = PAL.cloud.map((c) => vga(mix(c, PAL.sky[5], haze)));
  for (let y = Math.floor(base - height * 2); y < base; y++) {
    for (let x = Math.floor(x0 - height); x < x0 + width + height; x++) {
      let best = null, bd = -Infinity;
      for (const [cx, cy, r] of puffs) {
        const dx = x + 0.5 - cx, dy = y + 0.5 - cy;
        const d = r - Math.hypot(dx, dy);
        const score = d + cy * 0.08; // the puff in front (lower centre) wins
        if (d > 0 && score > bd) { bd = score; best = [dx / r, dy / r]; }
      }
      if (!best) continue;
      const v = best[0] * L[0] + best[1] * L[1];
      let k = v > 0.5 ? 0 : v > 0.1 ? 1 : v > -0.3 ? 2 : 3;
      if (base - y <= 2) k = Math.max(k, 3);
      if (base - y <= 1) k = 4;
      cv.set(x, y, tones[k]);
    }
  }
}

function paintClouds() {
  const cv = new Canvas(CTILE, H, true);
  const rnd = mulberry32(1992);
  // Big cumulus banks sitting on the horizon, hazier the lower they sit.
  cumulus(cv, rnd, 6, HOR - 1, 58, 9, 0.25);
  cumulus(cv, rnd, 92, HOR - 1, 34, 6, 0.35);
  cumulus(cv, rnd, 150, HOR - 1, 74, 11, 0.2);
  cumulus(cv, rnd, 252, HOR - 1, 40, 7, 0.3);
  // Thin streaks of cirrus right at the top of the sky, above the title.
  for (const [x0, y0, len] of [[20, 18, 46], [40, 19, 22], [128, 17, 30], [190, 18, 54], [214, 19, 26], [276, 17, 28]]) {
    for (let k = 0; k < len; k++) {
      const u = k / (len - 1);
      const a = Math.sin(Math.PI * u);
      if (a > 0.25 && rnd() < 0.92) cv.set(x0 + k, y0, vga(mix(PAL.sky[0], '#ffffff', 0.18 + 0.22 * a)));
    }
  }
  // Distant ship on the horizon.
  cv.sprite(232, HOR - 5, [
    '.....f.....',
    '....wwf....',
    '..wwwwwww..',
    'hhhhhhhhhhh',
    '.hhhhhhhhh.',
  ], { f: PAL.funnel, w: PAL.shipHi, h: PAL.ship });
  // Two gulls.
  const g = { g: PAL.gull };
  cv.sprite(60, 34, ['g.g', '.g.'], g);
  cv.sprite(70, 38, ['g...g', '.g.g.'], g);
  return cv;
}

// The main strip: sea texture, the island, the raft.
const ISL = { x: 200, y: 100 };
// A few fixed tones for wave crests and troughs, far to near (a palette, not a blend).
const CREST = ['#6f9fd2', '#93c2e6', '#bfe2f2', '#e6f6fa'].map(vga);
const TROUGH = ['#1a4f8a', '#1f6aa3', '#2788b4'].map(vga);
function paintStrip() {
  const cv = new Canvas(TILE, H, true);
  const rnd = mulberry32(80);
  // --- sea texture: crests and troughs, smaller and denser towards the horizon
  const shimmer = new Canvas(TILE, H, true);
  for (let y = HOR + 2; y < PIC_Y + PIC_H; y++) {
    const d = (y - HOR) / (PIC_Y + PIC_H - HOR);
    const base = seaAt(y);
    const count = Math.round(TILE / (13 + 30 * d));
    for (let i = 0; i < count; i++) {
      const x = Math.floor(rnd() * TILE);
      const len = 1 + Math.floor(d * 3 + rnd() * (1 + d * 4));
      const crest = CREST[Math.min(3, Math.floor(d * 3.2 + rnd() * 0.9))];
      const trough = TROUGH[Math.min(2, Math.floor(d * 3))];
      const target = rnd() < 0.4 ? shimmer : cv;
      for (let k = 0; k < len; k++) target.set(x + k, y, crest);
      if (d > 0.3 && y + 1 < PIC_Y + PIC_H) for (let k = 1; k < len; k++) cv.set(x + k, y + 1, trough);
    }
  }
  // --- shallow water halo round the island
  const { x: cx, y: cy } = ISL;
  const wob = (a) => 1 + 0.07 * Math.sin(3 * a + 1.3) + 0.05 * Math.sin(5 * a + 0.4);
  cv.ellipse(cx + 2, cy + 1, 70, 13, PAL.shallow[0], wob);
  cv.ellipse(cx + 1, cy + 0.5, 58, 10.5, PAL.shallow[1], wob);
  cv.ellipse(cx, cy, 49, 8.6, PAL.shallow[2], wob);
  for (let i = 0; i < 70; i++) {
    const a = rnd() * Math.PI * 2;
    const rr = 0.86 + rnd() * 0.3;
    const x = cx + Math.cos(a) * 56 * rr, y = cy + Math.sin(a) * 10 * rr;
    const L = 2 + Math.floor(rnd() * 3);
    for (let k = 0; k < L; k++) cv.set(x + k, y, vga('#a9e4dc'));
  }
  // --- foam ring, wet sand, sand
  cv.ellipse(cx, cy, 44, 7.6, () => (rnd() < 0.8 ? PAL.foam : vga('#c6eee6')), wob);
  cv.ellipse(cx, cy - 0.3, 41.5, 6.8, PAL.wet, wob);
  cv.ellipse(cx, cy - 0.8, 40.5, 6.1, (x, y, nx, ny) => {
    if (ny < -0.45 && nx < 0.3) return PAL.sandHi;
    if (ny > 0.55) return PAL.sandLo;
    return rnd() < 0.04 ? PAL.sandLo : PAL.sand;
  }, wob);
  // rocks at the front edge
  for (const [rx, ry, w] of [[cx - 22, cy + 6, 4], [cx + 9, cy + 7, 3]]) {
    cv.ellipse(rx, ry, w, 2.2, (x, y, nx, ny) => (ny < -0.3 && nx < 0.2 ? PAL.rockHi : ny > 0.35 ? PAL.rockLo : PAL.rock));
    cv.set(rx - w, ry + 2, PAL.foam);
    cv.set(rx + w - 1, ry + 2, PAL.foam);
  }
  // --- bushes on the left half of the island
  const bush = [[cx - 30, cy - 2, 4.5], [cx - 24, cy - 3, 5.5], [cx - 17, cy - 2, 5], [cx - 11, cy - 1, 4], [cx - 6, cy - 2.5, 3.5], [cx + 26, cy - 1.5, 3.5], [cx + 31, cy - 1, 2.6]];
  for (const [bx, by, br] of bush) {
    cv.ellipse(bx, by, br * 1.25, br * 0.85, (x, y, nx, ny) => {
      const v = -0.55 * nx - 0.8 * ny + (rnd() - 0.5) * 0.7;
      return PAL.leaf[v > 0.75 ? 4 : v > 0.3 ? 3 : v > -0.2 ? 2 : v > -0.6 ? 1 : 0];
    });
  }
  // --- the raft, moored off the left shore
  const rx0 = cx - 72, ry0 = cy - 1;
  for (let i = 0; i < 4; i++) {
    const y = ry0 + i * 2;
    const x0 = rx0 + (i % 2), len = 24 - (i % 2);
    for (let k = 0; k < len; k++) {
      const end = k === 0 || k === len - 1;
      cv.set(x0 + k, y, end ? PAL.logEnd : PAL.log);
      cv.set(x0 + k, y + 1, end ? PAL.logEnd : PAL.logLo);
    }
  }
  for (const k of [5, 18]) for (let j = 0; j < 8; j += 2) cv.set(rx0 + k, ry0 + j, PAL.rope);
  for (let k = -1; k < 26; k++) if (rnd() < 0.7) cv.set(rx0 + k, ry0 + 8, PAL.foam);
  return { cv, shimmer };
}

// The palm: a curved, segmented trunk and a crown of drooping fronds.
function paintPalm(cv) {
  const { x: cx, y: cy } = ISL;
  const B = [cx + 2, cy - 2], C = [cx + 14, cy - 20], Tp = [cx + 9, cy - 41];
  const at = (t) => [
    (1 - t) * (1 - t) * B[0] + 2 * t * (1 - t) * C[0] + t * t * Tp[0],
    (1 - t) * (1 - t) * B[1] + 2 * t * (1 - t) * C[1] + t * t * Tp[1],
  ];
  let len = 0, prev = at(0);
  const rows = new Map();
  for (let i = 0; i <= 400; i++) {
    const t = i / 400;
    const p = at(t);
    len += Math.hypot(p[0] - prev[0], p[1] - prev[1]);
    prev = p;
    const y = Math.round(p[1]);
    if (!rows.has(y)) rows.set(y, { x: p[0], t, len });
  }
  for (const [y, { x, t, len: l }] of rows) {
    const w = 3.6 - 1.6 * t;
    const x0 = Math.round(x - w / 2), x1 = Math.round(x + w / 2);
    const band = Math.floor(l / 2.3) % 2;
    for (let px = x0; px <= x1; px++) {
      let col = band ? PAL.bark[1] : PAL.bark[2];
      if (px === x0) col = PAL.bark[3];
      if (px === x1) col = PAL.bark[0];
      cv.set(px, y, col);
    }
  }
  cv.set(cx, cy - 2, PAL.bark[1]);
  cv.set(cx + 5, cy - 2, PAL.bark[0]);
  // fronds: [angle, length, droop, front]; back ones first, darker
  const top = Tp;
  const fronds = [
    [-118, 9, 4, 0], [-62, 10, 4, 0], [-150, 15, 9, 0], [-28, 15, 9, 0],
    [176, 18, 12, 1], [2, 18, 12, 1], [146, 13, 9, 1], [36, 13, 9, 1], [-92, 7, 2, 1],
  ];
  for (const [ang, L, droop, front] of fronds) {
    const a = (ang * Math.PI) / 180;
    const dir = [Math.cos(a), Math.sin(a)];
    const pts = [];
    for (let s = 0; s <= L; s += 0.25) {
      const u = s / L;
      pts.push([top[0] + dir[0] * s, top[1] + dir[1] * s + droop * u * u]);
    }
    for (let i = 1; i < pts.length; i++) {
      const [x, y] = pts[i];
      const [px, py] = pts[i - 1];
      const tx = x - px, ty = y - py;
      const tl = Math.hypot(tx, ty) || 1;
      let nx = -ty / tl, ny = tx / tl;
      if (ny < 0) { nx = -nx; ny = -ny; }
      const u = i / (pts.length - 1);
      const ll = 3.4 * Math.pow(Math.sin(Math.PI * Math.min(1, u * 1.1)), 0.6) * (front ? 1 : 0.85);
      if (i % 3 === 0) {
        for (let k = 1; k <= ll; k += 0.5) {
          cv.set(x + nx * k + (dir[0] > 0 ? 0.4 : -0.4) * k, y + ny * k + 0.35 * k, k > ll * 0.6 ? PAL.leaf[front ? 1 : 0] : PAL.leaf[front ? 2 : 1]);
          cv.set(x - nx * k * 0.6, y - ny * k * 0.45 + 0.3 * k, PAL.leaf[front ? 3 : 2]);
        }
      }
      cv.set(x, y, front ? PAL.leaf[4] : PAL.leaf[3]);
    }
  }
  for (const [dx, dy] of [[-2, 1], [0, 2], [2, 1]]) {
    cv.rect(top[0] + dx - 1, top[1] + dy, 2, 2, PAL.nut);
    cv.set(top[0] + dx - 1, top[1] + dy, PAL.nutHi);
  }
}

// Her: small and simple, standing on the right of the island, facing us, so
// both cream headphone cups show either side of her head. Brown hair with a
// loose low bun peeking out at the nape, coral tank top, cream shorts, bare feet.
const HER_X = ISL.x + 18;
const HER_MAP = {
  H: PAL.hair, h: PAL.hairLo, P: PAL.phone, p: PAL.phoneLo, S: PAL.skin, s: PAL.skinLo,
  T: PAL.coral, t: PAL.coralLo, W: PAL.cream, w: PAL.creamLo, o: vga('#3a2520'),
  e: vga('#3a2520'), r: vga('#eb9f86'),
};
const HER_HEAD = [
  '..HHHH..',
  '.HHHHHH.',
  'PHHHHHHP',
  'PPSSSSPp',
  'PPeSSePp',
  '.HSSSSH.',
  '.hhSS...',
];
const HER_BODY = [
  '..STTs..',
  '.STTTts.',
  '.STTTts.',
  '.STTTts.',
  '.SWWWws.',
  '..WWWw..',
  '..WW.w..',
  '..S..s..',
  '..S..s..',
  '.SS..ss.',
];
const HER_Y = ISL.y - 1 - HER_HEAD.length - HER_BODY.length + 1; // top of her head; feet on ISL.y - 1
// The same outfit drawn again at about twice the height for the STARRING card
// (a separate drawing, not an upscale, so its pixels match the thumbnail's).
const HER_BIG_HEAD = [
  '.....PPPP.....',
  '....PHHHHP....',
  '...PHHHHHHP...',
  '..PHHHHHHHHP..',
  '.PPHHHHHHHHPp.',
  '.PPHSHHHHSHPp.',
  '.PPHSSSSSSHPp.',
  '.PPHSeSSeSHPp.',
  '.ppHrSSSSrHpp.',
  '...HSSSSSSH...',
  '...hHSSSSHh...',
  '..hhh.SS......',
];
const HER_BIG_BODY = [
  '....STSSTs....',
  '...STTTTTTs...',
  '...STTTTTts...',
  '...STTTTTts...',
  '...STTTTTts...',
  '...STTTTTts...',
  '...STTTTTts...',
  '...SWWWWWws...',
  '...SWWWWWws...',
  '....WWWwWw....',
  '....WW..Ww....',
  '....SS..Ss....',
  '....SS..Ss....',
  '....SS..Ss....',
  '....SS..Ss....',
  '....SS..Ss....',
  '...SSS..Sss...',
];
// A one-pixel dark outline round her whole figure keeps her readable on sand
// and sea. The head carries its own outline (top and sides) because it nods;
// the rows where head meets body get none, so the nod never smears it.
function outlineFigure(head, body) {
  const iw = Math.max(...[...head, ...body].map((r) => r.length));
  const ow = iw + 2;
  const rows = [...head, ...body].map((r) => '.' + r.padEnd(iw, '.') + '.');
  rows.unshift('.'.repeat(ow));
  const g = rows.map((r) => [...r]);
  const filled = (x, y) => y >= 0 && y < g.length && x >= 0 && x < ow && /[A-Za-np-z]/.test(rows[y][x]);
  const skip = new Set([head.length - 1, head.length]); // composite rows of the neck and bun
  // Only cells outside a row's own silhouette span are outlined, so the gaps
  // between her legs and beside her arms keep showing what is behind her.
  const span = rows.map((r, y) => {
    let lo = 99, hi = -1;
    for (let x = 0; x < ow; x++) if (filled(x, y)) { lo = Math.min(lo, x); hi = Math.max(hi, x); }
    return [lo, hi];
  });
  for (let y = 0; y < g.length; y++) {
    if (skip.has(y)) continue;
    for (let x = 0; x < ow; x++) {
      if (g[y][x] !== '.') continue;
      if (x > span[y][0] && x < span[y][1]) continue;
      if (filled(x - 1, y) || filled(x + 1, y) || filled(x, y - 1) || filled(x, y + 1)) g[y][x] = 'o';
    }
  }
  const out = g.map((r) => r.join(''));
  return { head: out.slice(0, head.length + 1), body: out.slice(head.length + 1) };
}
const HER = outlineFigure(HER_HEAD, HER_BODY);
const HER_BIG = outlineFigure(HER_BIG_HEAD, HER_BIG_BODY);
function paintHer(cv) {
  // contact shadow on the sand, then the body (the head is a separate, nodding sprite)
  for (const dx of [1, 2, 3, 4, 5, 6, 7, 8]) cv.set(HER_X + dx, HER_Y + HER_HEAD.length + HER_BODY.length, PAL.wet);
  cv.sprite(HER_X - 1, HER_Y + HER_HEAD.length, HER.body, HER_MAP);
}

// Visitors floating past (these are animated, so they are separate elements).
const ACTORS = {
  bottle: {
    x: 74, y: 101,
    rows: ['.......c', '.....gGg', '..gGGpg.', '.gGppgg.', 'gggggg..', '.~~~~~~.'],
    map: { c: PAL.cork, g: PAL.glass, G: PAL.glassHi, p: PAL.paper, '~': PAL.foam },
  },
  shark: {
    x: 392, y: 89,
    rows: [
      '............G.',
      '...........GG.',
      '...PPPPP..GGG.',
      '..P.....PGGGG.',
      '.PgggggggPGGGG',
      'PPgEgggEgPP...',
      'PPgggggggPP...',
      '..gWEWEWg.....',
      '.~~~~~~~~~~~..',
    ],
    map: { P: PAL.phone, G: PAL.sharkLo, g: PAL.shark, W: PAL.foam, E: PAL.eye, '~': PAL.foam },
  },
  turtle: {
    x: 450, y: 97,
    rows: ['...SSSS.....', '..SsSSsS..hh', '.SSsSSsSS.hE', 'SSSSSSSSSShh', '~~~~~~~~~~~.'],
    map: { S: PAL.turtle, s: PAL.turtleHi, h: PAL.turtleSkin, E: PAL.eye, '~': PAL.foam },
  },
  crab: {
    x: ISL.x - 6, y: ISL.y + 1,
    rows: ['.e.e.', 'NnNN.', 'NNNNN', 'l.l.l'],
    map: { e: PAL.crabEye, N: PAL.nut, n: PAL.nutHi, l: PAL.crabLeg },
  },
};

// ================================================================ TIMELINE
// Keyframes from [seconds, value] points. A change of value between two points
// is a palette fade: it moves in steps, like a VGA DAC being reprogrammed.
const STEP = 'steps(9,end)';
const pct = (t, len = T) => `${r3((t / len) * 100)}%`;
function kf(name, prop, pts, unit = '', len = T) {
  let s = `@keyframes ${name}{`;
  pts.forEach(([t, v], i) => {
    const next = pts[i + 1];
    const tf = next && next[1] !== v ? `;animation-timing-function:${STEP}` : '';
    s += `${pct(t, len)}{${prop}:${v}${unit}${tf}}`;
  });
  return s + '}';
}
// Visible from tin to tout (fade lengths din, dout), invisible otherwise.
const win = (tin, tout, d = 0.75) => [[0, 0], [tin, 0], [tin + d, 1], [tout, 1], [tout + d, 0], [T, 0]];
// Invisible from tout to tin (wrapping round the loop), visible otherwise.
const wrapWin = (tout, tin, d = 1.5) => [[0, 1], [tout, 1], [tout + d, 0], [tin, 0], [tin + d, 1], [T, 1]];

const SCHEDULE = {
  pic: wrapWin(9, 30),
  title: wrapWin(9, 45),
  cardA: win(12, 16.5),
  cardB: win(18, 22.5),
  cardC: win(24, 28.5),
  roleA: win(33, 37.5),
  roleB: win(39, 43.5),
};

// ================================================================ MAIN BANNER
const INK = {
  card: vga('#f2ecdc'),
  cardSoft: vga('#a6bad2'),
  gold: vga('#ffd98c'),
  shadow: vga('#081a40'),
  bar: vga('#9fb3cc'),
};

function buildMain() {
  for (const f of Object.values(FACE)) f.used.clear();
  let lineDefs = '';
  let n = 0;
  // A centred line of text; `shadow` adds a one-pixel drop shadow.
  const line = (face, str, baseline, fill, shadow = false, cx = W / 2) => {
    const id = `l${n++}`;
    const x0 = Math.round(cx - face.width(str) / 2);
    lineDefs += `<g id="${id}">${face.uses(str)}</g>`;
    const sh = shadow ? `<use href="#${id}" x="${x0 + 1}" y="${baseline + 1}" fill="${INK.shadow}" opacity=".85"/>` : '';
    return `${sh}<use href="#${id}" x="${x0}" y="${baseline}" fill="${fill}"/>`;
  };

  // --- the opening cards, on black
  const K = FACE.card, U = FACE.cardSub;
  const cardA = line(U, 'a', 46, INK.cardSoft) + line(K, 'Ten Hours Later', 71, INK.card) + line(U, 'production', 89, INK.cardSoft);
  const cardB = line(U, 'world premiere at', 46, INK.cardSoft) + line(K, '127.0.0.1', 71, INK.card) + line(U, 'and nowhere else, yet', 89, INK.cardSoft);
  const cardC = line(U, 'in', 40, INK.cardSoft) + line(K, 'Synthesized Sound', 65, INK.card)
    + line(U, 'every note made from code,', 83, INK.cardSoft) + line(U, 'heard by nobody yet', 96, INK.cardSoft);

  // --- role cards over the picture
  const roleA = line(FACE.big, 'Guest Stars', 32, INK.gold, true)
    + line(FACE.small, 'a turtle, a shark in headphones,', 44, INK.card, true)
    + line(FACE.small, 'a bottle that washes straight back', 54, INK.card, true);
  const roleB = line(FACE.big, 'Waiting', 32, INK.gold, true)
    + line(FACE.small, 'her, about two thirds of the time,', 44, INK.card, true)
    + line(FACE.small, 'nodding along to the music', 54, INK.card, true);

  // --- the held title
  const tw = FACE.title.width('Castaway');
  const tx = Math.round((W - tw) / 2);
  lineDefs += `<g id="ttl">${FACE.title.uses('Castaway')}</g>`;
  const title = `<use href="#ttl" x="${tx + 1}" y="51" fill="${INK.shadow}" opacity=".9"/><use href="#ttl" x="${tx + 2}" y="52" fill="${INK.shadow}" opacity=".35"/><use href="#ttl" x="${tx}" y="50" fill="url(#tg)"/>`
    + line(FACE.small, 'a ten-hour lo-fi island video', 11, INK.bar)
    + line(FACE.small, 'in which almost nothing happens, on purpose', 123, INK.bar);

  // --- the picture
  const clouds = paintClouds();
  const { cv: strip, shimmer } = paintStrip();
  paintPalm(strip);
  paintHer(strip);
  const actor = (name, cls) => {
    const a = ACTORS[name];
    const body = spriteSvg(a.rows, a.map);
    return [0, TILE].map((dx) => `<g transform="translate(${a.x + dx} ${a.y})"><g class="${cls}">${body}</g></g>`).join('');
  };
  const herHead = spriteSvg(HER.head, HER_MAP);
  const head = [0, TILE].map((dx) => `<g transform="translate(${HER_X - 1 + dx} ${HER_Y - 1})"><g class="nod">${herHead}</g></g>`).join('');

  const css = [
    qStyles(Object.values(FACE)),
    `.pic{animation:pic ${T}s linear infinite}`,
    `.ttl{animation:ttl ${T}s linear infinite}`,
    `.ca,.cb,.cc,.ra,.rb{opacity:0}`,
    `.ca{animation:ca ${T}s linear infinite}.cb{animation:cb ${T}s linear infinite}.cc{animation:cc ${T}s linear infinite}`,
    `.ra{animation:ra ${T}s linear infinite}.rb{animation:rb ${T}s linear infinite}`,
    kf('pic', 'opacity', SCHEDULE.pic), kf('ttl', 'opacity', SCHEDULE.title),
    kf('ca', 'opacity', SCHEDULE.cardA), kf('cb', 'opacity', SCHEDULE.cardB), kf('cc', 'opacity', SCHEDULE.cardC),
    kf('ra', 'opacity', SCHEDULE.roleA), kf('rb', 'opacity', SCHEDULE.roleB),
    // the pan: the near strip covers its 480-pixel tile once per loop, the
    // clouds (further away) their 320-pixel tile, so they drift at 2/3 speed
    `.pm{animation:pm ${T}s linear infinite}@keyframes pm{to{transform:translateX(-${TILE}px)}}`,
    `.pcl{animation:pcl ${T}s linear infinite}@keyframes pcl{to{transform:translateX(-${CTILE}px)}}`,
    // her nod and the shark's: one step down on every beat (80 BPM = 0.75 s)
    `.nod{animation:nod .75s steps(1,end) infinite}@keyframes nod{50%{transform:translateY(1px)}}`,
    // the bottle bobs once a bar, the turtle once every two
    `.bob{animation:bob 3s steps(1,end) infinite}@keyframes bob{50%{transform:translateY(1px)}}`,
    `.bob2{animation:bob 6s steps(1,end) infinite}`,
    // the crab, wearing his coconut, walks sideways a pixel at a time
    `.walk{animation:walk 24s linear infinite}@keyframes walk{0%{transform:translateX(0);animation-timing-function:steps(14,end)}40%{transform:translateX(-14px)}50%{transform:translateX(-14px);animation-timing-function:steps(14,end)}90%{transform:translateX(0)}}`,
    // half the wave crests glint off and on, two bars per cycle
    `.sh{animation:sh 1.5s steps(1,end) infinite}@keyframes sh{50%{opacity:.35}}`,
    '@media (prefers-reduced-motion:reduce){*{animation:none!important}}',
  ].join('');

  const defs = [
    `<clipPath id="pnl"><rect width="${W}" height="${H}" rx="4"/></clipPath>`,
    `<clipPath id="pcp"><rect y="${PIC_Y}" width="${W}" height="${PIC_H}"/></clipPath>`,
    `<linearGradient id="tg" gradientUnits="userSpaceOnUse" x1="0" y1="-28" x2="0" y2="2"><stop offset="0" stop-color="${vga('#fffbef')}"/><stop offset=".55" stop-color="${vga('#fff1d2')}"/><stop offset="1" stop-color="${vga('#f5c98d')}"/></linearGradient>`,
    `<g id="cl">${clouds.paths()}</g>`,
    `<g id="st">${strip.paths()}</g>`,
    `<g id="shm">${shimmer.paths()}</g>`,
    Object.values(FACE).map((f) => f.defs()).join(''),
    lineDefs,
  ].join('');

  const pic = `<g class="pic"><g clip-path="url(#pcp)">${skyBands()}`
    + `<g class="pcl"><use href="#cl"/><use href="#cl" x="${CTILE}"/></g>`
    + seaBands()
    + `<g class="pm"><g class="sh"><use href="#shm"/><use href="#shm" x="${TILE}"/></g><use href="#st"/><use href="#st" x="${TILE}"/>`
    + head + actor('bottle', 'bob') + actor('shark', 'nod') + actor('turtle', 'bob2') + actor('crab', 'walk')
    + `</g></g></g>`;

  const alt = 'Castaway: PC demo opening titles';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="800" height="320" role="img" aria-label="${esc(alt)}">`
    + `<title>${esc(alt)}</title><style>${css}</style><defs>${defs}</defs>`
    + `<g clip-path="url(#pnl)"><rect width="${W}" height="${H}" fill="#000"/>${pic}`
    + `<g class="ttl">${title}</g><g class="ca">${cardA}</g><g class="cb">${cardB}</g><g class="cc">${cardC}</g>`
    + `<g class="ra">${roleA}</g><g class="rb">${roleB}</g></g></svg>`;
}

// ================================================================ CREDITS
// Eight closing credit cards. Each is a 120 x 75 thumbnail (a 160 x 100 part
// picture, scaled to this screen) and up to four capital lines of ROLE - NAME.
// The two halves slide in from opposite edges, the remaining distance shrinking
// by a fixed ratio each frame, hold for about 200 frames, then accelerate away
// the way they came. Odd cards put the picture on the left, even on the right.
const TW = 120;
const TH = 75;
// The credits panel is shorter than the title panel: the thumbnail sits 18 px
// from the side edge, so it gets about the same margin above and below.
const CH = TH + 35;
const CARD = 6; // seconds per card: two bars of the theme
const CARDS = 8;
const CT = CARD * CARDS;

// Sky, haze line and sea for a thumbnail; `hz` is the horizon row.
function thumbBase(cv, hz, rnd, { crests = true, clouds = true } = {}) {
  for (let y = 0; y < hz; y++) {
    const col = vga(ramp(PAL.sky.slice(1), Math.pow((y - (y % 2)) / (hz - 1), 1.2)));
    for (let x = 0; x < TW; x++) cv.set(x, y, col);
  }
  if (clouds) {
    cumulusThumb(cv, rnd, 4, hz - 1, 30, 6);
    cumulusThumb(cv, rnd, 70, hz - 1, 40, 8);
  }
  for (let x = 0; x < TW; x++) cv.set(x, hz, vga('#a7cde6'));
  for (let y = hz + 1; y < TH; y++) {
    const t = (y - hz - 1) / (TH - hz - 2);
    const base = vga(ramp(PAL.sea, Math.pow(t, 0.85)));
    for (let x = 0; x < TW; x++) cv.set(x, y, base);
    if (!crests) continue;
    const n = Math.round(TW / (16 + 30 * t));
    for (let i = 0; i < n; i++) {
      const x = Math.floor(rnd() * TW);
      const len = 1 + Math.floor(t * 3 + rnd() * (1 + t * 3));
      for (let k = 0; k < len; k++) cv.set(x + k, y, CREST[Math.min(3, Math.floor(t * 4))]);
    }
  }
}
function cumulusThumb(cv, rnd, x0, base, width, height) {
  cumulus(cv, rnd, x0, base, width, height, 0.2);
}
// Sand from row y0 down, with a foam edge along the top.
function sandFloor(cv, y0, rnd, wobble = 1.5) {
  for (let x = 0; x < TW; x++) {
    const top = Math.round(y0 + Math.sin(x / 9) * wobble + Math.sin(x / 4.3 + 1) * 0.6);
    cv.set(x, top - 2, PAL.shallow[2]);
    if (rnd() < 0.8) cv.set(x, top - 1, PAL.foam);
    cv.set(x, top, PAL.wet);
    for (let y = top + 1; y < TH; y++) cv.set(x, y, rnd() < 0.016 ? PAL.sandLo : y < top + 3 ? PAL.sandHi : PAL.sand);
  }
}
// Fill a shape given as a predicate in rotated local coordinates.
function shape(cv, cx, cy, ang, ext, fn) {
  const a = (ang * Math.PI) / 180;
  const ca = Math.cos(a), sa = Math.sin(a);
  for (let y = Math.floor(cy - ext); y <= cy + ext; y++) {
    for (let x = Math.floor(cx - ext); x <= cx + ext; x++) {
      const dx = x + 0.5 - cx, dy = y + 0.5 - cy;
      const u = dx * ca + dy * sa;
      const v = -dx * sa + dy * ca;
      const col = fn(u, v);
      if (col) cv.set(x, y, col);
    }
  }
}

// Each thumbnail returns { still: Canvas, actor?: Canvas, cls?: actor class }.
const THUMBS = {
  // 1. her, closer: the same outfit drawn about twice as tall, on the sand by the palm
  her() {
    const rnd = mulberry32(1);
    const cv = new Canvas(TW, TH);
    thumbBase(cv, 30, rnd);
    sandFloor(cv, 58, rnd);
    // palm trunk up the left edge, a frond hanging in from the top
    for (let y = -1; y < 64; y++) {
      const x = 14 + Math.round(Math.pow((64 - y) / 64, 1.6) * 7);
      const band = Math.floor(y / 4) % 2;
      for (let k = 0; k < 6; k++) cv.set(x + k, y, k === 0 ? PAL.bark[3] : k === 5 ? PAL.bark[0] : band ? PAL.bark[1] : PAL.bark[2]);
    }
    for (let s = 0; s < 34; s++) {
      const x = 22 + s, y = 2 + (s * s) / 60;
      cv.set(x, y, PAL.leaf[4]);
      if (s % 2 === 0) for (let k = 1; k < 6 - s / 8; k++) { cv.set(x - k * 0.4, y + k, PAL.leaf[2]); cv.set(x + 1, y + k * 0.8, PAL.leaf[1]); }
    }
    // the raft off to the right
    for (let i = 0; i < 3; i++) for (let k = 0; k < 22; k++) {
      cv.set(92 + k + (i % 2), 44 + i * 2, k === 0 || k === 21 ? PAL.logEnd : PAL.log);
      cv.set(92 + k + (i % 2), 45 + i * 2, k === 0 || k === 21 ? PAL.logEnd : PAL.logLo);
    }
    // her, drawn at this size (not an upscale), the head nodding on the beat
    const hx = 52, hy = 34;
    const body = new Canvas(TW, TH);
    body.sprite(hx, hy + HER_BIG.head.length, HER_BIG.body, HER_MAP);
    for (let k = 3; k < 14; k++) cv.set(hx + k, hy + HER_BIG.head.length + HER_BIG.body.length, PAL.wet);
    const head = new Canvas(TW, TH);
    head.sprite(hx, hy, HER_BIG.head, HER_MAP);
    return { still: cv, over: body, actor: head, cls: 'nod' };
  },
  // 2. the bottle, on its way straight back
  bottle() {
    const rnd = mulberry32(2);
    const cv = new Canvas(TW, TH);
    thumbBase(cv, 26, rnd);
    sandFloor(cv, 64, rnd, 1);
    const b = new Canvas(TW, TH);
    shape(b, 60, 46, -16, 20, (u, v) => {
      const body = u > -11 && u < 6 && Math.abs(v) < 4.6 - Math.max(0, u - 3) * 0.6;
      const neck = u >= 5 && u < 11 && Math.abs(v) < 1.7;
      const cork = u >= 11 && u < 13.5 && Math.abs(v) < 1.6;
      const round = u <= -11 && u > -13 && Math.abs(v) < 3.6;
      if (cork) return PAL.cork;
      if (!(body || neck || round)) return null;
      if (v < -2.6 && u < 4) return PAL.glassHi;
      if (body && u > -8 && u < 2 && Math.abs(v + 0.3) < 2.2) return Math.abs(Math.round(u)) % 3 === 0 ? vga('#c9b98f') : PAL.paper;
      if (v > 2.8 || u > 9.5) return vga('#2b6f4b');
      return PAL.glass;
    });
    for (let k = -14; k < 16; k++) if (rnd() < 0.85) b.set(60 + k, 51 - Math.round(k * 0.08), PAL.foam);
    return { still: cv, actor: b, cls: 'bob' };
  },
  // 3. the delivery drone; the parcel is another pair of headphones
  drone() {
    const rnd = mulberry32(3);
    const cv = new Canvas(TW, TH);
    thumbBase(cv, 52, rnd);
    const d = new Canvas(TW, TH);
    const cx = 60, cy = 16;
    d.rect(cx - 7, cy, 14, 4, vga('#e8edf1'));
    d.rect(cx - 7, cy + 3, 14, 1, vga('#9aa6b4'));
    d.rect(cx - 3, cy + 4, 6, 1, vga('#3a4250'));
    d.set(cx + 5, cy + 1, vga('#ff4a3a'));
    for (const sx of [-1, 1]) {
      for (let k = 7; k < 15; k++) d.set(cx + sx * k - (sx < 0 ? 1 : 0), cy + 1, vga('#3a4250'));
      const px = cx + sx * 15;
      d.rect(px - 1, cy - 1, 2, 3, vga('#3a4250'));
      for (let k = -6; k <= 6; k++) d.set(px + k, cy - 2, Math.abs(k) > 4 ? vga('#b9c4d0') : vga('#dfe6ec'));
    }
    // strings and the parcel
    for (let y = cy + 5; y < cy + 13; y++) { d.set(cx - 4, y, vga('#d9cfb2')); d.set(cx + 3, y, vga('#d9cfb2')); }
    const bx = cx - 8, by = cy + 13;
    d.rect(bx, by, 16, 12, vga('#c79a5c'));
    d.rect(bx, by, 16, 1, vga('#ddb67a'));
    d.rect(bx + 15, by, 1, 12, vga('#9f733f'));
    d.rect(bx, by + 11, 16, 1, vga('#9f733f'));
    d.rect(bx + 7, by, 2, 12, vga('#ead7a6'));
    // the label: a tiny pair of headphones
    d.rect(bx + 2, by + 3, 4, 6, vga('#f4efe2'));
    d.sprite(bx + 2, by + 4, ['.PP.', 'P..P', 'Q..Q', 'Q..Q'], { P: vga('#5b6b7a'), Q: vga('#2f3a46') });
    return { still: cv, actor: d, cls: 'hover' };
  },
  // 4. the shark who nods to the beat
  shark() {
    const rnd = mulberry32(4);
    const cv = new Canvas(TW, TH);
    thumbBase(cv, 24, rnd);
    const s = new Canvas(TW, TH);
    const cx = 56, wl = 54;
    // dorsal fin behind, to the right
    for (let y = 30; y < wl; y++) {
      const t = (y - 30) / (wl - 30);
      const x0 = 78 + Math.round(t * 2), x1 = 80 + Math.round(t * 13);
      for (let x = x0; x <= x1; x++) s.set(x, y, x === x0 ? PAL.sharkHi : PAL.sharkLo);
    }
    // head dome
    s.ellipse(cx, wl + 2, 15, 17, (x, y, nx, ny) => {
      if (y >= wl) return null;
      const v = -0.5 * nx - 0.8 * ny;
      if (ny > -0.32 && Math.abs(nx) < 0.62) return vga('#dfe7ee'); // pale muzzle
      return v > 0.75 ? PAL.sharkHi : v > -0.1 ? PAL.shark : PAL.sharkLo;
    });
    // grin and teeth
    for (let x = cx - 8; x <= cx + 8; x++) {
      const y = wl - 4 + Math.round(((x - cx) / 8) ** 2 * -2);
      s.set(x, y, PAL.eye);
      if ((x - cx + 8) % 3 !== 2 && Math.abs(x - cx) < 8) s.set(x, y - 1, vga('#ffffff'));
    }
    // eyes
    for (const ex of [cx - 6, cx + 5]) {
      s.rect(ex, wl - 12, 2, 3, PAL.eye);
      s.set(ex, wl - 12, vga('#ffffff'));
    }
    // headphones: band over the top, cups on both sides
    s.ellipse(cx, wl - 5, 17.5, 16.5, (x, y, nx, ny, r) => (y < wl - 9 && r > 0.88 ? (r > 0.95 ? PAL.phoneLo : PAL.phone) : null));
    for (const sx of [-1, 1]) {
      const x0 = sx < 0 ? cx - 19 : cx + 15;
      s.rect(x0, wl - 13, 5, 8, PAL.phone);
      s.rect(x0 + (sx < 0 ? 0 : 4), wl - 13, 1, 8, PAL.phoneLo);
      s.rect(x0 + 1, wl - 14, 3, 1, PAL.phone);
      s.rect(x0 + 1, wl - 5, 3, 1, PAL.phoneLo);
    }
    // waterline foam
    for (let x = cx - 22; x < cx + 42; x++) if (rnd() < 0.85) s.set(x, wl, PAL.foam);
    return { still: cv, actor: s, cls: 'nod2' };
  },
  // 5. the coconut that fell on a hermit crab, walking off with the crab inside
  crab() {
    const rnd = mulberry32(5);
    const cv = new Canvas(TW, TH);
    thumbBase(cv, 18, rnd, { clouds: false });
    sandFloor(cv, 30, rnd, 1);
    const c = new Canvas(TW, TH);
    const cx = 58, cy = 50;
    // legs: three a side, jointed, and one big claw in front
    for (const sx of [-1, 1]) for (let i = 0; i < 3; i++) {
      const x0 = cx + sx * (3 + i * 3), y0 = cy + 5;
      c.set(x0 + sx, y0 + 1, PAL.crabLeg); c.set(x0 + sx * 2, y0 + 2, PAL.crabLeg);
      c.set(x0 + sx * 2, y0 + 3, PAL.crabLeg); c.set(x0 + sx * 3, y0 + 4, vga('#b8432c'));
    }
    c.rect(cx + 9, cy + 3, 4, 3, PAL.crabLeg);
    c.set(cx + 12, cy + 2, PAL.crabLeg); c.set(cx + 13, cy + 3, vga('#b8432c'));
    // eye stalks peeking out under the front edge
    for (const ex of [cx + 3, cx + 6]) { c.set(ex, cy + 3, PAL.crabLeg); c.set(ex, cy + 2, PAL.crabEye); }
    // the coconut
    c.ellipse(cx, cy, 11, 8.5, (x, y, nx, ny) => {
      const v = -0.55 * nx - 0.8 * ny + (rnd() - 0.5) * 0.35;
      if (y > cy + 4) return null;
      return v > 0.7 ? vga('#a87444') : v > 0.1 ? PAL.nutHi : v > -0.5 ? PAL.nut : vga('#4c2e17');
    });
    for (const [px, py] of [[cx - 3, cy - 2], [cx + 1, cy - 3], [cx - 1, cy + 1]]) c.set(px, py, vga('#2d1a0e'));
    // its shadow on the sand
    for (let k = -10; k <= 12; k++) cv.set(cx + k, cy + 10, PAL.wet);
    return { still: cv, actor: c, cls: 'walk2' };
  },
  // 6. the grey tabby who arrives on a crate (and one day floats away again)
  cat() {
    const rnd = mulberry32(6);
    const cv = new Canvas(TW, TH);
    thumbBase(cv, 28, rnd);
    const k = new Canvas(TW, TH);
    const bx = 44, by = 50, bw = 30, bh = 12;
    for (let y = 0; y < bh; y++) for (let x = 0; x < bw; x++) {
      let col = (y % 4 === 3) ? vga('#8a5a33') : vga('#c08a52');
      if (y % 4 === 0) col = vga('#d6a56a');
      if (x < 2 || x >= bw - 2) col = vga('#7a4d2b');
      k.set(bx + x, by + y, col);
    }
    for (let x = -2; x < bw + 2; x++) if (rnd() < 0.85) k.set(bx + x, by + bh - 2, PAL.foam);
    // the cat, sitting, facing right; grey tabby with a white chest
    k.sprite(bx + 7, by - 19, [
      '.o.........o....',
      '.oo.......oo....',
      '.oGo.....oGo....',
      '.oGGooooGGGo....',
      'oGGdGdGdGGGGo...',
      'oGGGGGGGGGGGo...',
      'oGEEGGGGGEEGo...',
      'oGEPGGGGGEPGo...',
      'oGGGGWnWGGGGo...',
      '.oGGWWWWWGGo....',
      '..ooGWWWGoo.....',
      '..oGGWWWGGo.....',
      '.oGdGWWWGdGo....',
      '.oGdGWWWGdGo..o.',
      'oGGdGWWWGdGGooGo',
      'oGGGGWWWGGGGoGo.',
      'oGGGGWWWGGGGGo..',
      'oGWWGGGGGWWGo...',
      '.oooooooooooo...',
    ], { o: vga('#4d535c'), G: vga('#8f959e'), d: vga('#646a74'), W: vga('#f4f2ee'), E: vga('#c7d36a'), P: vga('#1d2420'), n: vga('#d98b8b') });
    return { still: cv, actor: k, cls: 'bob' };
  },
  // 7. she could leave any time: footsteps over the water, and an iced coffee
  coffee() {
    const rnd = mulberry32(7);
    const cv = new Canvas(TW, TH);
    thumbBase(cv, 24, rnd);
    sandFloor(cv, 62, rnd, 1);
    // ripple rings where she stepped, shrinking towards the horizon
    for (let i = 0; i < 6; i++) {
      const t = i / 5;
      const x = 34 + t * 34 + (i % 2 ? 4 : -4) * (1 - t), y = 58 - t * 30;
      const rx = Math.round(6 - t * 4);
      const col = vga(mix('#ffffff', '#9fc8e4', t));
      for (let k = -rx + 1; k < rx; k++) cv.set(x + k, y, col);
      cv.set(x - rx, y - 1, col);
      cv.set(x + rx, y - 1, col);
      if (rx > 3) { cv.set(x - rx - 1, y - 2, col); cv.set(x + rx + 1, y - 2, col); }
    }
    const c = new Canvas(TW, TH);
    const x0 = 84, y0 = 40;
    for (let y = 0; y < 26; y++) {
      const inset = Math.round(y * 0.12);
      for (let x = inset; x < 14 - inset; x++) {
        const edge = x === inset || x === 13 - inset;
        let col = y < 7 ? vga('#efe2c7') : y < 11 ? vga('#c79a6a') : vga(mix('#a5703f', '#5e3a1e', Math.floor((y - 11) / 4) / 3));
        if (y >= 8 && y < 18 && ((x + y) % 7 === 0 || (x * 3 + y) % 11 === 0)) col = vga('#e8f2f4');
        if (edge) col = vga('#e9eef2');
        if (x === inset + 1 && y > 2) col = vga(mix(col, '#ffffff', 0.45));
        c.set(x0 + x, y0 + y, col);
      }
    }
    c.rect(x0 - 1, y0 - 1, 16, 1, vga('#f4f6f8'));
    c.rect(x0, y0 - 2, 14, 1, vga('#dfe5ea'));
    for (let i = 0; i < 12; i++) c.set(x0 + 9 + Math.round(i * 0.35), y0 - 3 - i, i % 4 < 2 ? PAL.coral : vga('#ffffff'));
    for (let k = -2; k < 18; k++) cv.set(x0 + k, y0 + 26, PAL.wet);
    return { still: cv, actor: c, cls: 'none' };
  },
  // 8. the music: a kalimba on the sand, notes rising off it
  music() {
    const rnd = mulberry32(8);
    const cv = new Canvas(TW, TH);
    thumbBase(cv, 30, rnd);
    sandFloor(cv, 46, rnd, 1);
    const x0 = 44, y0 = 50;
    for (let y = 0; y < 18; y++) {
      for (let x = 0; x < 32; x++) {
        let col = vga('#b9814d');
        if (y === 0 || x === 0) col = vga('#d29a62');
        if (y === 17 || x === 31) col = vga('#7d4e2a');
        cv.set(x0 + x, y0 + y, col);
      }
    }
    cv.ellipse(x0 + 16, y0 + 13, 3.2, 2.4, vga('#3a2414'));
    cv.rect(x0 + 3, y0 + 5, 26, 2, vga('#8b8f96'));
    const lens = [6, 8, 10, 12, 10, 8, 6];
    lens.forEach((L, i) => {
      const x = x0 + 5 + i * 3.6;
      for (let y = 0; y < L; y++) cv.set(x, y0 + 1 + y, y === L - 1 ? vga('#9aa0a8') : vga('#e6e9ee'));
      cv.set(x + 1, y0 + 1, vga('#b7bcc4'));
    });
    for (let k = -2; k < 34; k++) cv.set(x0 + k, y0 + 18, PAL.wet);
    const n = new Canvas(TW, TH);
    const note = ['..GG', '..Gg', '..G.', 'GGG.', 'GGG.'];
    const map = { G: vga('#ffd98c'), g: vga('#d9a95a') };
    n.sprite(52, 30, note, map);
    n.sprite(66, 22, note, map);
    n.sprite(78, 32, note, map);
    return { still: cv, actor: n, cls: 'rise' };
  },
};

const CREDIT_CARDS = [
  { pic: 'her', lines: [['STARRING', 'HER'], ['HEADPHONES', 'CREAM'], ['TANK TOP', 'CORAL'], ['SHOES', 'NONE']] },
  { pic: 'bottle', lines: [['POST', 'ONE BOTTLE'], ['SENT', 'FIRST CLASS'], ['RETURNED', 'AT ONCE'], ['REPLY', 'HOURS LATER']] },
  { pic: 'drone', lines: [['DELIVERY', 'A DRONE'], ['PARCEL', 'HEADPHONES'], ['SHE HAD', 'HEADPHONES']] },
  { pic: 'shark', lines: [['RHYTHM', 'A SHARK'], ['HEADPHONES', 'HIS OWN'], ['NODS', 'ON THE BEAT']] },
  { pic: 'crab', lines: [['STUNTS', 'HERMIT CRAB'], ['HELMET', 'A COCONUT'], ['INJURIES', 'NONE']] },
  { pic: 'cat', lines: [['GUEST', 'GREY TABBY'], ['ARRIVES', 'BY CRATE'], ['NAPS', 'UP THE PALM'], ['LEAVES', 'BY CRATE']] },
  { pic: 'coffee', lines: [['COULD LEAVE', 'ANY TIME'], ['ROUTE', 'OVER THE SEA'], ['BACK WITH', 'ICED COFFEE']] },
  { pic: 'music', lines: [['MUSIC', 'CODE'], ['SAMPLES', 'NONE'], ['TEMPO', '80 BPM'], ['HEARD BY', 'NOBODY YET']] },
];

function buildCredits() {
  for (const f of Object.values(FACE)) f.used.clear();
  const F = FACE.caps;
  const EASE_IN = 'cubic-bezier(.12,.82,.2,1)'; // fast start, soft landing
  const EASE_OUT = 'cubic-bezier(.6,0,.9,.4)'; // accelerating away
  const IN = 1.0, HOLD = 4.2, OUT = 0.7;
  let css = '';
  let body = '';
  let defs = '';
  CREDIT_CARDS.forEach((card, i) => {
    const left = i % 2 === 0;
    const px = left ? 18 : W - 18 - TW;
    const py = Math.round((CH - TH) / 2);
    const tcx = left ? (W + px + TW) / 2 + 2 : (px) / 2 - 2;
    // --- picture
    const th = THUMBS[card.pic]();
    defs += `<g id="p${i}">${th.still.underlay()}${th.still.paths('', true)}${th.over ? th.over.paths() : ''}</g>`;
    const actor = th.actor ? `<g class="${th.cls}">${th.actor.paths()}</g>` : '';
    const pic = `<g transform="translate(${px} ${py})"><svg width="${TW}" height="${TH}" viewBox="0 0 ${TW} ${TH}" overflow="hidden"><use href="#p${i}"/>${actor}</svg></g>`;
    // --- text: ROLE in blue-grey, the dash dim, NAME in cream
    const n = card.lines.length;
    let txt = '';
    card.lines.forEach(([role, name], j) => {
      const full = `${role} - ${name}`;
      const w = F.width(full);
      if (w > 150) console.warn(`credit line too wide (${w}px): ${full}`);
      const x0 = Math.round(tcx - w / 2);
      const base = Math.round(CH / 2 - ((n - 1) * 15) / 2 + j * 15 + F.cap / 2);
      const xs = x0 + F.advance(`${role} `);
      const xn = x0 + F.advance(`${role} - `);
      txt += `<g transform="translate(0 ${base})"><g fill="${INK.cardSoft}">${F.uses(role, x0)}</g><g fill="${vga('#5d6d82')}">${F.uses('-', xs)}</g><g fill="${INK.card}">${F.uses(name, xn)}</g></g>`;
    });
    // --- motion: picture and text come in from opposite edges
    const s = i * CARD;
    const dPic = left ? -(px + TW + 4) : W - px + 4;
    const dTxt = -Math.sign(dPic) * 175;
    for (const [cls, d, part] of [[`mp${i}`, dPic, pic], [`mt${i}`, dTxt, txt]]) {
      const pts = i === 0
        ? [[0, 0, EASE_OUT], [HOLD, 0, EASE_OUT], [HOLD + OUT, d], [CT - IN, d, EASE_IN], [CT, 0]]
        : [[0, d], [s - IN, d, EASE_IN], [s, 0], [s + HOLD, 0, EASE_OUT], [s + HOLD + OUT, d], [CT, d]];
      css += `.${cls}{animation:${cls} ${CT}s linear infinite}@keyframes ${cls}{`
        + pts.map(([t, x, e]) => `${pct(t, CT)}{transform:translateX(${x}px)${e ? `;animation-timing-function:${e}` : ''}}`).join('')
        + '}';
      body += `<g class="${cls} k${i}">${part}</g>`;
    }
  });
  const hide = CREDIT_CARDS.map((c, i) => (i ? `.k${i}` : null)).filter(Boolean).join(',');
  css = [
    qStyles(Object.values(FACE)),
    css,
    `.nod{animation:nod .75s steps(1,end) infinite}@keyframes nod{50%{transform:translateY(1px)}}`,
    `.nod2{animation:nod2 .75s steps(1,end) infinite}@keyframes nod2{50%{transform:translateY(2px)}}`,
    `.bob{animation:bob 3s steps(1,end) infinite}@keyframes bob{50%{transform:translateY(1px)}}`,
    `.hover{animation:hover 1.5s steps(1,end) infinite}@keyframes hover{50%{transform:translateY(-1px)}}`,
    `.walk2{animation:walk2 6s linear infinite}@keyframes walk2{0%{transform:translateX(-6px);animation-timing-function:steps(12,end)}100%{transform:translateX(6px)}}`,
    `.rise{animation:rise 3s steps(4,end) infinite}@keyframes rise{to{transform:translateY(-4px)}}`,
    `@media (prefers-reduced-motion:reduce){*{animation:none!important}${hide}{display:none}}`,
  ].join('');
  const alt = 'Castaway: closing credits';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${CH}" width="800" height="${(800 * CH) / W}" role="img" aria-label="${esc(alt)}">`
    + `<title>${esc(alt)}</title><style>${css}</style><defs><clipPath id="pnl"><rect width="${W}" height="${CH}" rx="4"/></clipPath>${Object.values(FACE).map((f) => f.defs()).join('')}${defs}</defs>`
    + `<g clip-path="url(#pnl)"><rect width="${W}" height="${CH}" fill="#000"/>${body}</g></svg>`;
}

// ================================================================ OUTPUT
fs.mkdirSync(ASSETS, { recursive: true });
const main = buildMain();
fs.writeFileSync(OUT_MAIN, main);
console.log(`${path.relative(process.cwd(), OUT_MAIN)}  ${(main.length / 1024).toFixed(1)} KB`);
const credits = buildCredits();
fs.writeFileSync(OUT_CREDITS, credits);
console.log(`${path.relative(process.cwd(), OUT_CREDITS)}  ${(credits.length / 1024).toFixed(1)} KB`);

const spec = argVal('specimen');
if (spec) specimen(spec);
