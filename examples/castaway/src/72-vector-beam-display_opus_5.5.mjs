#!/usr/bin/env node
// CASTAWAY on a vector beam display: the look of the 1979 to 1984 vector arcade
// tubes and the home vector console, where an electron beam draws every line
// directly. No pixels, no stair steps: thin glowing strokes on black, lettering
// made of a few straight strokes, wireframes, and colour that comes from a
// tinted plastic overlay laid over a white-phosphor tube.
//
//   node examples/castaway/src/72-vector-beam-display_opus_5.5.mjs
//   node examples/castaway/src/72-vector-beam-display_opus_5.5.mjs --at=31 --out=some/where.svg
//
// Regenerates ../assets/72-vector-beam-display_opus_5.5.svg (the banner) and
// ../assets/72-vector-beam-display_opus_5.5-scope.svg (the theme's chords as
// an XY trace, for the .md's details block). The .md itself is hand-written.
// Plain Node, no dependencies, deterministic (no clock, no Math.random).
// --at bakes a head start (seconds) into every animation so a late frame can
// be checked without waiting; use it only with --out.
//
// Nothing here is copied from any real game, console, overlay or artist: the
// stroke alphabet, the island, the gags and the overlay layout are drawn in
// this file. The real machines are only credited as the style's origin.
//
// How the banner works
//   * GLOW. Everything that glows lives in one <g id="ALL"> in <defs> and is
//     drawn three times with <use>: a wide faint halo, a mid glow and a thin
//     near-white core. Stroke widths come from a CSS variable on each <use>,
//     so a few classes can scale them (dots, fine lines) without data copies.
//   * OVERLAY. The beam is white. Colour comes from three tinted rectangles
//     laid on top with mix-blend-mode: multiply, exactly like a plastic sheet:
//     coral over the title strip, aqua over the island, sand over the status
//     strip. A line that crosses a zone boundary changes colour there (the
//     parcel's headphones do, on their way up to the lives counter).
//   * THE ISLAND is a 3D wireframe (sand contours, palm with bark rings and
//     drooping fronds, two rocks, bushes, coconuts, a five-log raft) on a slow
//     turntable: +/-26 degrees, once a minute. It is projected here at 16
//     keyframes (one every 4 s) and played back as one SMIL path
//     morph with Hermite keySplines, so the sway has no visible corners.
//     Her figure and everything that stands on the island are billboards that
//     follow the same keyframes.
//   * THE SEA is a set of broken swell lines that come towards you, one line
//     per bar: 12 keyframes per 3 s, and the shape of every line is a function
//     of its distance only, so the loop has no seam.
//   * THE TITLE is an extruded stroke-letter wireframe. Its ghost is always
//     on screen (the name reads from the first frame); the beam redraws the
//     front face stroke by stroke at the top of every minute, with a spark at
//     the end of each stroke, holds it with a faint shimmer, and lets it decay
//     back to the ghost in drawing order just before the loop comes round.
//   * THE MINUTE. Every period divides 60 s, the theme's loop (20 bars of 3 s
//     at 80 BPM). Four gags land on bar lines: a bottle that washes straight
//     back, a drone whose parcel is headphones (an extra life), a shark in
//     headphones nodding on the beat, and a coconut that becomes a crab's hat.
//   * prefers-reduced-motion hides every SMIL layer, shows a still copy of
//     the first frame and stops all CSS animation on a complete picture.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '72-vector-beam-display_opus_5.5';
const ASSETS = path.join(HERE, '..', 'assets');
const arg = (name) => {
  const hit = process.argv.slice(2).find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : null;
};
const AT = Number(arg('at') || 0);
const OUT = arg('out');

// ---------------------------------------------------------------------------
// Frame, zones and timing
// ---------------------------------------------------------------------------
const W = 1200, H = 640;
const SX0 = 22, SY0 = 22, SX1 = 1178, SY1 = 618;  // the tube face
const ZA = 184;          // title strip (coral) ends here
const ZC = 562;          // status strip (sand) starts here
const LOOP = 60, BAR = 3, BEAT = 0.75;

const TINT_A = '#ff9c86';  // coral, her tank top
const TINT_B = '#6ff3df';  // lagoon aqua
const TINT_C = '#ffd590';  // sand
const CORE = '#f3fbff';

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------
const TAU = Math.PI * 2;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, k) => a + (b - a) * k;
const smooth = (k) => k * k * (3 - 2 * k);
const easeIn = (k) => k * k;
const easeOut = (k) => 1 - (1 - k) * (1 - k);
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
// join numbers, dropping the space before a minus sign
const nums = (arr) => arr.reduce((s, v, i) => s + (i && !v.startsWith('-') ? ' ' : '') + v, '');
const pct = (sec) => f3((sec / LOOP) * 100) + '%';
const begin = AT ? `${-AT}s` : '0s';
const delay = (sec) => `${f3(sec - AT)}s`;

// absolute polyline path (static art)
const polyD = (polys) =>
  polys.map((p) => 'M' + nums(p.flatMap(([x, y]) => [f1(x), f1(y)]))).join('');
const dotsD = (pts) => pts.map(([x, y]) => `M${f1(x)} ${f1(y)}h0`).join('');
// relative polyline path with rounding done on absolute values (no drift);
// every frame of a morph must come from the same template
const relD = (polys, q = 1) => {
  let out = '';
  const R = (v) => Math.round(v / q);
  const F = (v) => f1(v * q);
  for (const p of polys) {
    const r = p.map(([x, y]) => [R(x), R(y)]);
    out += 'M' + nums([F(r[0][0]), F(r[0][1])]);
    if (r.length > 1) {
      const d = [];
      for (let i = 1; i < r.length; i++) d.push(F(r[i][0] - r[i - 1][0]), F(r[i][1] - r[i - 1][1]));
      out += 'l' + nums(d);
    }
  }
  return out;
};
const closeP = (p) => [...p, p[0]];
const scl = (polys, k) => polys.map((p) => p.map(([x, y]) => [x * k, y * k]));
const ring = (n, rx, ry, cx = 0, cy = 0, ph = 0) =>
  Array.from({ length: n }, (_, i) => [cx + rx * Math.cos(ph + (i / n) * TAU), cy + ry * Math.sin(ph + (i / n) * TAU)]);

// seeded PRNG (mulberry32)
const rng = (seed) => () => {
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

// ---------------------------------------------------------------------------
// Stroke alphabet: an original single-stroke capital set on a 4 x 6 grid
// (y = 0 cap line, y = 6 baseline). Chamfered corners, open C/G/S, wide and
// geometric. A one-point stroke is a dot (drawn as a round-capped h0).
// ---------------------------------------------------------------------------
const O8 = [[1, 0], [3, 0], [4, 1], [4, 5], [3, 6], [1, 6], [0, 5], [0, 1], [1, 0]];
const FONT = {
  A: [[[0, 6], [0, 1], [1, 0], [3, 0], [4, 1], [4, 6]], [[0, 3.4], [4, 3.4]]],
  B: [[[0, 6], [0, 0], [3, 0], [4, 1], [4, 2], [3, 2.9], [0, 2.9]], [[3, 2.9], [4, 3.9], [4, 5], [3, 6], [0, 6]]],
  C: [[[4, 0], [1, 0], [0, 1], [0, 5], [1, 6], [4, 6]]],
  D: [[[0, 0], [3, 0], [4, 1], [4, 5], [3, 6], [0, 6], [0, 0]]],
  E: [[[4, 0], [0, 0], [0, 6], [4, 6]], [[0, 3], [3, 3]]],
  F: [[[4, 0], [0, 0], [0, 6]], [[0, 3], [3, 3]]],
  G: [[[4, 0], [1, 0], [0, 1], [0, 5], [1, 6], [4, 6], [4, 3.4], [2, 3.4]]],
  H: [[[0, 0], [0, 6]], [[4, 0], [4, 6]], [[0, 3], [4, 3]]],
  I: [[[2, 0], [2, 6]], [[0.8, 0], [3.2, 0]], [[0.8, 6], [3.2, 6]]],
  J: [[[4, 0], [4, 5], [3, 6], [1, 6], [0, 5], [0, 4]]],
  K: [[[0, 0], [0, 6]], [[4, 0], [1, 3], [4, 6]], [[0, 3], [1, 3]]],
  L: [[[0, 0], [0, 6], [4, 6]]],
  M: [[[0, 6], [0, 0], [2, 2.6], [4, 0], [4, 6]]],
  N: [[[0, 6], [0, 0], [4, 6], [4, 0]]],
  O: [O8],
  P: [[[0, 6], [0, 0], [3, 0], [4, 1], [4, 2.4], [3, 3.4], [0, 3.4]]],
  Q: [O8, [[2.6, 4.6], [4, 6.4]]],
  R: [[[0, 6], [0, 0], [3, 0], [4, 1], [4, 2.4], [3, 3.4], [0, 3.4]], [[1.8, 3.4], [4, 6]]],
  S: [[[4, 0], [1, 0], [0, 1], [0, 2], [1, 3], [3, 3], [4, 4], [4, 5], [3, 6], [0, 6]]],
  T: [[[0, 0], [4, 0]], [[2, 0], [2, 6]]],
  U: [[[0, 0], [0, 5], [1, 6], [3, 6], [4, 5], [4, 0]]],
  V: [[[0, 0], [2, 6], [4, 0]]],
  W: [[[0, 0], [0.9, 6], [2, 2.8], [3.1, 6], [4, 0]]],
  X: [[[0, 0], [4, 6]], [[4, 0], [0, 6]]],
  Y: [[[0, 0], [2, 3], [4, 0]], [[2, 3], [2, 6]]],
  Z: [[[0, 0], [4, 0], [0, 6], [4, 6]]],
  0: [O8, [[3.1, 1.4], [0.9, 4.6]]],
  1: [[[0.9, 1.2], [2.1, 0], [2.1, 6]], [[0.9, 6], [3.3, 6]]],
  2: [[[0, 1], [1, 0], [3, 0], [4, 1], [4, 2.2], [0, 6], [4, 6]]],
  3: [[[0, 0], [4, 0], [1.8, 2.7], [3, 2.7], [4, 3.7], [4, 5], [3, 6], [1, 6], [0, 5]]],
  4: [[[3, 6], [3, 0], [0, 4.2], [4, 4.2]]],
  5: [[[4, 0], [0, 0], [0, 2.7], [3, 2.7], [4, 3.7], [4, 5], [3, 6], [0, 6]]],
  6: [[[3.4, 0], [1, 0], [0, 1], [0, 5], [1, 6], [3, 6], [4, 5], [4, 3.7], [3, 2.7], [0, 2.7]]],
  7: [[[0, 0], [4, 0], [1.4, 6]]],
  8: [[[1, 2.9], [0, 1.9], [0, 1], [1, 0], [3, 0], [4, 1], [4, 1.9], [3, 2.9], [1, 2.9], [0, 3.9], [0, 5], [1, 6], [3, 6], [4, 5], [4, 3.9], [3, 2.9]]],
  9: [[[4, 3.3], [1, 3.3], [0, 2.3], [0, 1], [1, 0], [3, 0], [4, 1], [4, 5], [3, 6], [0.6, 6]]],
  ' ': [],
  '.': [[[2, 6]]],
  ',': [[[2.2, 5.4], [1.5, 7]]],
  ':': [[[2, 1.6]], [[2, 4.8]]],
  '-': [[[0.8, 3], [3.2, 3]]],
  '/': [[[0.4, 6], [3.6, 0]]],
  '(': [[[2.8, 0], [1.6, 1.2], [1.6, 4.8], [2.8, 6]]],
  ')': [[[1.2, 0], [2.4, 1.2], [2.4, 4.8], [1.2, 6]]],
  "'": [[[2, 0], [2, 1.6]]],
  '?': [[[0, 1], [1, 0], [3, 0], [4, 1], [4, 2], [2, 3.6], [2, 4.3]], [[2, 6]]],
  '!': [[[2, 0], [2, 4.2]], [[2, 6]]],
  '+': [[[2, 1.4], [2, 4.6]], [[0.4, 3], [3.6, 3]]],
  '·': [[[2, 3]]],
  '=': [[[0.6, 2], [3.4, 2]], [[0.6, 4], [3.4, 4]]],
  '>': [[[0.6, 0.6], [3.4, 3], [0.6, 5.4]]],
  '<': [[[3.4, 0.6], [0.6, 3], [3.4, 5.4]]],
  // three lower-case letters, for chord names (Gm9, Fmaj9)
  m: [[[0, 6], [0, 2.4]], [[0, 3.2], [0.8, 2.4], [1.3, 2.4], [2, 3.1], [2, 6]], [[2, 3.1], [2.7, 2.4], [3.2, 2.4], [4, 3.2], [4, 6]]],
  a: [[[0.4, 2.4], [3, 2.4], [4, 3.3], [4, 6]], [[4, 4], [1, 4], [0, 4.8], [0, 5.2], [0.8, 6], [3, 6], [4, 5.1]]],
  j: [[[3, 2.4], [3, 7], [2.2, 7.8], [0.8, 7.8]], [[3, 1]]],
};
const ADV = 4; // glyph box width
const textW = (str, sx, tr = 1.4) => (str.length * (ADV + tr) - tr) * sx;
function textPolys(str, x, y, sx, sy = sx, tr = 1.4) {
  const polys = [], dots = [];
  let cx = x;
  for (const ch of str) {
    const g = FONT[ch];
    if (!g) throw new Error(`no glyph for ${JSON.stringify(ch)}`);
    for (const s of g) {
      const pts = s.map(([gx, gy]) => [cx + gx * sx, y + gy * sy]);
      if (pts.length === 1) dots.push(pts[0]); else polys.push(pts);
    }
    cx += (ADV + tr) * sx;
  }
  return { polys, dots, w: cx - x - tr * sx };
}
const textD = (str, x, y, sx, sy = sx, tr = 1.4) => {
  const t = textPolys(str, x, y, sx, sy, tr);
  return { lines: polyD(t.polys), dots: dotsD(t.dots) };
};
// a piece of text as glow-ready markup (lines + dots)
const textG = (str, x, y, sx, sy = sx, attrs = '', tr = 1.4) => {
  const t = textD(str, x, y, sx, sy, tr);
  return `<g${attrs}><path d="${t.lines}"/>${t.dots ? `<path class="dot" d="${t.dots}"/>` : ''}</g>`;
};

// ---------------------------------------------------------------------------
// Camera: a fixed, slightly raised view of the island, like the project's
// own stationary shot. World units are metres-ish, y up, +z towards you.
// ---------------------------------------------------------------------------
const CAM = { F: 790, Dp: 12.2, X0: 640, Y0: 458, phi: Math.atan(195 / 790) };
const camH = CAM.Dp * Math.sin(CAM.phi), camD = CAM.Dp * Math.cos(CAM.phi);
const sinP = Math.sin(CAM.phi), cosP = Math.cos(CAM.phi);
function project([x, y, z]) {
  const dy = y - camH, dz = z - camD;
  const cz = -dy * sinP - dz * cosP;
  const cy = dy * cosP - dz * sinP;
  return [CAM.X0 + (CAM.F * x) / cz, CAM.Y0 - (CAM.F * cy) / cz, cz];
}
const HORIZON = CAM.Y0 - CAM.F * Math.tan(CAM.phi);
const scaleAt = (cz) => CAM.Dp / cz;
const rotY = ([x, y, z], a) => [x * Math.cos(a) + z * Math.sin(a), y, -x * Math.sin(a) + z * Math.cos(a)];

// turntable: +/- 26 degrees, once a minute, a keyframe every 4 s
const YAW_A = 0.45;
const yaw = (t) => YAW_A * Math.sin((TAU * t) / LOOP);
const KEY_STEP = 4;
const KEY_T = Array.from({ length: LOOP / KEY_STEP + 1 }, (_, k) => k * KEY_STEP);
const KEY_TIMES = KEY_T.map((t) => f3(t / LOOP)).join(';');
// cubic Hermite keySplines so the piecewise-linear morph has a smooth speed
const KEY_SPLINES = KEY_T.slice(0, -1).map((t0, k) => {
  const t1 = KEY_T[k + 1];
  const w = TAU / LOOP;
  const ds = Math.sin(w * t1) - Math.sin(w * t0);
  const d0 = (w * Math.cos(w * t0) * (t1 - t0)) / ds;
  const d1 = (w * Math.cos(w * t1) * (t1 - t0)) / ds;
  return `.333 ${f3(clamp(d0 / 3, 0, 1))} .667 ${f3(clamp(1 - d1 / 3, 0, 1))}`;
}).join(';');
const morph = (frames) =>
  `<animate attributeName="d" dur="${LOOP}s" begin="${begin}" repeatCount="indefinite" calcMode="spline" keyTimes="${KEY_TIMES}" keySplines="${KEY_SPLINES}" values="${frames.join(';')}"/>`;

// ---------------------------------------------------------------------------
// The island model (local coordinates, turned by yaw(t))
// ---------------------------------------------------------------------------
const ISL = { rx: 3.1, rz: 2.0 };
const blob = (n, k, y, seed) =>
  Array.from({ length: n }, (_, i) => {
    const a = (i / n) * TAU;
    const r = k * (1 + 0.07 * Math.sin(3 * a + 0.6 + seed) + 0.05 * Math.sin(5 * a + 2.1) + 0.03 * Math.sin(7 * a + seed));
    return [ISL.rx * r * Math.cos(a), y, ISL.rz * r * Math.sin(a)];
  });
const WATER = blob(24, 1, 0, 0);
const RIDGE = blob(12, 0.6, 0.2, 0.9);
const RIDGE_LINKS = Array.from({ length: 6 }, (_, i) => [RIDGE[2 * i + 1], WATER[4 * i + 2]]);
const FOAM = blob(30, 1.13, 0, 0);
const groundY = (x, z) => 0.3 * (1 - clamp((x / ISL.rx) ** 2 + (z / ISL.rz) ** 2, 0, 1));

const HER = [-1.5, groundY(-1.5, 0.85), 0.85];
const PALM0 = [0.7, groundY(0.7, -0.25) - 0.02, -0.25];
const CROWN = [1.4, 3.6, -0.55];
const PALM_C1 = [0.74, 1.45, -0.3], PALM_C2 = [1.05, 2.75, -0.45];
const bez = (a, b, c, d, s) => a.map((_, i) => (1 - s) ** 3 * a[i] + 3 * (1 - s) ** 2 * s * b[i] + 3 * (1 - s) * s * s * c[i] + s ** 3 * d[i]);
const COCO_FALL = [1.5, 3.33, -0.3];
const COCO_LAND = [1.8, groundY(1.8, 0.45) + 0.08, 0.45];
const PARCEL_AT = [-0.55, groundY(-0.55, 1.25), 1.25];

// billboard shapes (px at scale 1, origin at the anchor)
const rockShape = (r, seed) => {
  const R = rng(seed);
  return closeP(Array.from({ length: 7 }, (_, i) => {
    const a = Math.PI + (i / 6) * Math.PI;
    const rr = r * (0.75 + 0.35 * R());
    return [Math.cos(a) * rr * 1.3, Math.sin(a) * rr * (i === 0 || i === 6 ? 0 : 1)];
  }).slice(0, 7));
};
const ROCKS = [
  { at: [-0.45, 0.02, 1.98], shape: rockShape(9, 7) },
  { at: [1.05, 0.02, 1.86], shape: rockShape(6.5, 11) },
];
const bushShape = (w, h, seed) => {
  const R = rng(seed);
  const n = 9;
  return Array.from({ length: n }, (_, i) => {
    const k = i / (n - 1);
    const up = i % 2 ? h * (0.55 + 0.45 * R()) * Math.sin(Math.PI * (0.15 + 0.7 * k)) : h * 0.25 * R();
    return [(k - 0.5) * w, -up];
  });
};
const BUSHES = [
  { at: [-0.15, 0.24, 0.35], shape: bushShape(30, 15, 3) },
  { at: [0.35, 0.25, 0.6], shape: bushShape(24, 12, 5) },
  { at: [1.15, 0.22, 0.25], shape: bushShape(18, 9, 13) },
];
// an irregular coconut: an asteroid with a soft spot
const cocoShape = (r, seed) => {
  const R = rng(seed);
  return closeP(Array.from({ length: 7 }, (_, i) => {
    const a = (i / 7) * TAU + 0.3;
    const rr = r * (0.8 + 0.3 * R());
    return [Math.cos(a) * rr, Math.sin(a) * rr];
  }));
};
const CROWN_COCOS = [
  { off: [-0.12, -0.24, 0.14], shape: cocoShape(6, 21) },
  { off: [0.18, -0.27, 0.04], shape: cocoShape(5.6, 22) },
];

// eight fronds of mixed age: young ones arch up, old ones hang low, so the
// crown reads as a palm and not as an even dome (an umbrella)
const FRONDS = Array.from({ length: 8 }, (_, i) => {
  const az = (i / 8) * TAU + 0.21 + 0.24 * Math.sin(i * 2.3);
  const age = ((i * 3) % 8) / 7;                       // 0 young .. 1 old
  const L = 1.8 + 0.6 * age + 0.12 * Math.sin(i * 1.7 + 0.4);
  const rise = lerp(0.55, 0.4, age);
  const droop = lerp(0.95, 1.35, age);
  return { az, L, rise, droop };
});

function islandFrame(t) {
  const a = yaw(t);
  const P = (p) => project(rotY(p, a));
  const bill = (p3, shape, k = 1) => {
    const [X, Y, cz] = P(p3);
    const s = scaleAt(cz) * k;
    return shape.map(([u, v]) => [X + u * s, Y + v * s]);
  };
  const polys = [];
  polys.push(closeP(WATER.map((p) => P(p))));
  polys.push(closeP(RIDGE.map((p) => P(p))));
  for (const [a, b] of RIDGE_LINKS) polys.push([P(a), P(b)]);
  for (const r of ROCKS) polys.push(bill(r.at, r.shape));
  for (const b of BUSHES) polys.push(bill(b.at, b.shape));
  // trunk: two outlines and bark rings, offset in screen space
  const N = 11;
  const ax = Array.from({ length: N }, (_, k) => P(bez(PALM0, PALM_C1, PALM_C2, CROWN, k / (N - 1))));
  const left = [], right = [];
  ax.forEach((p, k) => {
    const pa = ax[Math.max(0, k - 1)], pb = ax[Math.min(N - 1, k + 1)];
    let tx = pb[0] - pa[0], ty = pb[1] - pa[1];
    const L = Math.hypot(tx, ty) || 1;
    tx /= L; ty /= L;
    const hw = (lerp(0.17, 0.085, k / (N - 1)) + (k === 0 ? 0.05 : 0)) * CAM.F / p[2];
    left.push([p[0] - ty * hw, p[1] + tx * hw]);
    right.push([p[0] + ty * hw, p[1] - tx * hw]);
  });
  polys.push(left, right);
  for (let k = 1; k < N - 1; k++) polys.push([left[k], right[k]]);
  // fronds: an arching rib, and one zigzag stroke for the leaflets, which
  // hang off it to alternate sides (rib, tip, rib, tip...)
  for (const fr of FRONDS) {
    const dir = [Math.cos(fr.az), 0, Math.sin(fr.az)];
    const side = [-Math.sin(fr.az), 0, Math.cos(fr.az)];
    const sp = (s) => [CROWN[0] + dir[0] * fr.L * s, CROWN[1] + fr.L * (fr.rise * s - fr.droop * s * s), CROWN[2] + dir[2] * fr.L * s];
    polys.push([0, 0.17, 0.34, 0.5, 0.66, 0.83, 1].map((s) => P(sp(s))));
    const zz = [];
    for (let k = 0; k < 9; k++) {
      const s = 0.14 + k * 0.1, sg = k % 2 ? 1 : -1;
      const base = sp(s);
      const l = 0.66 * Math.sin(Math.PI * (0.1 + 0.8 * s));
      zz.push(P(base), P([base[0] + (side[0] * 0.4 * sg + dir[0] * 0.22) * l, base[1] - 0.8 * l, base[2] + (side[2] * 0.4 * sg + dir[2] * 0.22) * l]));
    }
    polys.push(zz);
  }
  for (const c of CROWN_COCOS) polys.push(bill([CROWN[0] + c.off[0], CROWN[1] + c.off[1], CROWN[2] + c.off[2]], c.shape));
  // the raft: five logs and two lashings
  const RC = [3.85, 0.03, 0.55], RA = 0.32;
  const raftP = ([u, y, v]) => P([RC[0] + u * Math.cos(RA) + v * Math.sin(RA), y, RC[2] - u * Math.sin(RA) + v * Math.cos(RA)]);
  for (let i = 0; i < 5; i++) {
    const v = -0.6 + i * 0.3;
    const A = raftP([-1.0, 0.07, v]), B = raftP([1.0, 0.07, v]);
    let dx = B[0] - A[0], dy = B[1] - A[1];
    const L = Math.hypot(dx, dy) || 1;
    dx /= L; dy /= L;
    const ra = (0.13 * CAM.F) / A[2], rb = (0.13 * CAM.F) / B[2];
    polys.push(closeP([
      [A[0] - dy * ra, A[1] + dx * ra], [B[0] - dy * rb, B[1] + dx * rb], [B[0] + dx * rb * 0.7, B[1] + dy * rb * 0.7],
      [B[0] + dy * rb, B[1] - dx * rb], [A[0] + dy * ra, A[1] - dx * ra], [A[0] - dx * ra * 0.7, A[1] - dy * ra * 0.7],
    ]));
  }
  for (const u of [-0.62, 0.62]) polys.push([[u, 0.2, -0.76], [u, 0.2, 0.76]].map(raftP));
  const foam = [closeP(FOAM.map((p) => P(p)))];
  return { polys, foam };
}

// screen anchor + scale for a point fixed to the island (local coords)
const onIsland = (p, t) => {
  const [X, Y, cz] = project(rotY(p, yaw(t)));
  return { x: X, y: Y, s: scaleAt(cz) };
};
const atSea = (p) => {
  const [X, Y, cz] = project(p);
  return { x: X, y: Y, s: scaleAt(cz) };
};

// ---------------------------------------------------------------------------
// The sea: broken swell lines, one arriving per bar
// ---------------------------------------------------------------------------
const SEA_BOT = 584;
const SEA_N = 15;
const SEA_K = 12;
function zForY(Y) {
  // invert the projection on the sea plane by bisection
  let lo = -400, hi = camD - 0.5;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (project([0, 0, mid])[1] < Y) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}
function seaFrame(tt) {
  const polys = [];
  for (let i = 0; i < SEA_N; i++) {
    const u = i + tt / BAR;
    const Y = HORIZON + 1.5 + (SEA_BOT - HORIZON - 1.5) * (u / SEA_N) ** 2.05;
    const z = zForY(Y);
    const cz = project([0, 0, z])[2];
    const x0 = -60 + 22 * Math.sin(z * 1.37);
    const pts = [];
    const M = 15;
    for (let j = 0; j < M; j++) {
      const X = lerp(x0, 1250, j / (M - 1));
      const x = ((X - CAM.X0) * cz) / CAM.F;
      const y = 0.09 * Math.sin(0.75 * x + 0.9 * z) + 0.05 * Math.sin(1.9 * x - 0.4 * z);
      const p = project([x, y, z]);
      pts.push([p[0], p[1]]);
    }
    polys.push(pts);
  }
  return polys;
}

// ---------------------------------------------------------------------------
// Tracks: sampled screen positions for billboards, as SMIL transforms
// ---------------------------------------------------------------------------
function track(samples, { spline = false, scaleY = null } = {}) {
  // samples: [{t, x, y, s}] sorted, inside [0, LOOP]
  const S = [...samples];
  if (S[0].t > 0) S.unshift({ ...S[0], t: 0 });
  if (S[S.length - 1].t < LOOP) S.push({ ...S[S.length - 1], t: LOOP });
  const kt = S.map((p) => f3(p.t / LOOP)).join(';');
  const tv = S.map((p) => `${f1(p.x)} ${f1(p.y)}`).join(';');
  const sv = S.map((p, i) => (scaleY ? `${f3(p.s)} ${f3(p.s * scaleY[i])}` : f3(p.s))).join(';');
  const cm = spline ? ` calcMode="spline" keySplines="${KEY_SPLINES}"` : '';
  return {
    tr: `<animateTransform attributeName="transform" type="translate" dur="${LOOP}s" begin="${begin}" repeatCount="indefinite" keyTimes="${kt}"${cm} values="${tv}"/>`,
    sc: `<animateTransform attributeName="transform" type="scale" dur="${LOOP}s" begin="${begin}" repeatCount="indefinite" keyTimes="${kt}"${cm} values="${sv}"/>`,
  };
}
const sampleRange = (t0, t1, step) => {
  const out = [];
  const n = Math.max(1, Math.round((t1 - t0) / step));
  for (let i = 0; i <= n; i++) out.push(t0 + ((t1 - t0) * i) / n);
  return out;
};
// a billboard group that follows a track
const follow = (trk, inner) => `<g>${trk.tr}<g>${trk.sc}${inner}</g></g>`;
const spin = (vals, dur, cx = 0, cy = 0, keyTimes = null) =>
  `<animateTransform attributeName="transform" type="rotate" dur="${dur}s" begin="${begin}" repeatCount="indefinite" values="${vals.map((v) => `${v} ${cx} ${cy}`).join(';')}"${keyTimes ? ` keyTimes="${keyTimes}"` : ''}/>`;

// ---------------------------------------------------------------------------
// CSS animation builders
// ---------------------------------------------------------------------------
const css = [];
let kfId = 0;
// opacity windows with hard cuts: ranges [[a, b], ...] in seconds
function windowAnim(ranges, { fadeIn = 0, fadeOut = 0, lo = 0, hi = 1 } = {}) {
  const name = `w${(kfId++).toString(36)}`;
  const eps = 0.006;
  const stops = [];
  const at0 = ranges.some(([a, b]) => a <= 0 && b > 0);
  stops.push(['0%', at0 ? hi : lo]);
  for (const [a, b] of ranges) {
    if (a > 0) { stops.push([pct(a - eps), lo]); stops.push([pct(a + fadeIn), hi]); }
    if (b < LOOP) { stops.push([pct(b - fadeOut - eps), hi]); stops.push([pct(b), lo]); }
  }
  const atEnd = ranges.some(([a, b]) => b >= LOOP);
  stops.push(['100%', atEnd ? hi : lo]);
  css.push(`@keyframes ${name}{${stops.map(([p, v]) => `${p}{opacity:${v}}`).join('')}}`);
  css.push(`.${name}{animation:${name} ${LOOP}s linear ${delay(0)} infinite both}`);
  return name;
}

// ---------------------------------------------------------------------------
// TITLE: extruded wireframe stroke letters
// ---------------------------------------------------------------------------
const TITLE = 'CASTAWAY';
const T_SX = 14.2, T_SY = 13, T_TR = 1.5;
const T_W = textW(TITLE, T_SX, T_TR);
const T_X = W / 2 - T_W / 2, T_Y = 48;
const titleFront = textPolys(TITLE, T_X, T_Y, T_SX, T_SY, T_TR).polys;
const VP = [W / 2, 980], VK = 0.985;
const toBack = ([x, y]) => [VP[0] + (x - VP[0]) * VK, VP[1] + (y - VP[1]) * VK];
const titleBack = titleFront.map((p) => p.map(toBack));
const vertKey = ([x, y]) => `${Math.round(x * 10)},${Math.round(y * 10)}`;
const titleVerts = new Map();
for (const p of titleFront) for (const v of p) titleVerts.set(vertKey(v), v);
const titleConn = [...titleVerts.values()].map((v) => [v, toBack(v)]);

function titleMarkup() {
  // drawing order: letter by letter, stroke by stroke
  const STROKE_GAP = 0.085, DRAW = 0.11, START = 0.15;
  let out = '';
  out += `<g class="tghost"><path d="${polyD(titleFront)}"/></g>`;
  out += `<g class="tback"><path d="${polyD(titleBack)}"/><path class="fine" d="${polyD(titleConn)}"/></g>`;
  out += `<g class="tbright">`;
  titleFront.forEach((p, i) => {
    out += `<path class="ts" pathLength="1" style="animation-delay:${delay(START + i * STROKE_GAP)}" d="${polyD([p])}"/>`;
  });
  titleFront.forEach((p, i) => {
    const e = p[p.length - 1];
    out += `<path class="spark" style="animation-delay:${delay(START + i * STROKE_GAP + DRAW * 0.9)}" d="${dotsD([e])}"/>`;
  });
  out += `</g>`;
  out += `<path class="dot tvert" d="${dotsD([...titleVerts.values()])}"/>`;
  css.push(`.ts{stroke-dasharray:1 1;stroke-dashoffset:0;animation:tdraw ${LOOP}s linear infinite both}`);
  css.push(`@keyframes tdraw{0%{stroke-dashoffset:1;opacity:1}${pct(DRAW)}{stroke-dashoffset:0}95.5%{opacity:1}98.2%{opacity:0}100%{stroke-dashoffset:0;opacity:0}}`);
  css.push(`.spark{opacity:0;stroke-width:calc(var(--w)*3.2);animation:spark ${LOOP}s linear infinite both}`);
  css.push(`@keyframes spark{0%{opacity:0}.01%{opacity:1}${pct(0.45)}{opacity:0}100%{opacity:0}}`);
  css.push(`.tghost{opacity:.28}.tback{opacity:.42}.tvert{opacity:.55}`);
  css.push(`.tbright{animation:shimmer 6s ease-in-out ${delay(0)} infinite}`);
  css.push(`@keyframes shimmer{0%,100%{opacity:1}40%{opacity:.86}55%{opacity:.97}70%{opacity:.9}}`);
  return out;
}

// ---------------------------------------------------------------------------
// Little vector props
// ---------------------------------------------------------------------------
const arc = (cx, cy, r, a0, a1, n) => Array.from({ length: n + 1 }, (_, i) => {
  const a = lerp(a0, a1, i / n);
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
});
const rrect = (x0, y0, x1, y1, c) => closeP([[x0 + c, y0], [x1 - c, y0], [x1, y0 + c], [x1, y1 - c], [x1 - c, y1], [x0 + c, y1], [x0, y1 - c], [x0, y0 + c]]);
// headphones icon, centred on the band, about 18 x 15
const PHONES = [arc(0, 2, 7, Math.PI, TAU, 8), rrect(-9.2, 1, -5, 9, 1.4), rrect(5, 1, 9.2, 9, 1.4)];

// her: small, simple, fully clothed (tank top, shorts, headphones, low bun)
const HER_K = 1.12;
function herMarkup(live) {
  const head = [
    closeP(ring(12, 7.2, 7.6, 0, -64.5, 0)),                                   // head
    arc(0, -64.5, 8.4, Math.PI * 1.02, Math.PI * 1.98, 6),                    // hair line
    closeP(ring(7, 3.4, 3.1, -7.2, -58.8, 0.4)),                              // low bun
    arc(0, -64.5, 10.2, Math.PI * 1.08, Math.PI * 1.92, 8),                   // headphone band
    rrect(-11.6, -68.5, -7.4, -60.5, 1.3), rrect(7.4, -68.5, 11.6, -60.5, 1.3), // cups
  ];
  const body = [
    [[0, -57], [0, -55]],                                                     // neck
    closeP([[-7, -35], [-8.2, -50], [-5.4, -55.5], [-3.2, -51], [0, -49.5], [3.2, -51], [5.4, -55.5], [8.2, -50], [7, -35]]), // tank top
    [[-7.2, -35], [-8.8, -22], [-1.2, -21.6], [0, -25.5], [1.2, -21.6], [8.8, -22], [7.2, -35]], // shorts
    [[-4.2, -21.8], [-4.4, -1.5], [-8, 0]], [[4.2, -21.8], [4.4, -1.5], [8, 0]], // legs, bare feet
    [[-8.2, -50], [-11.2, -41], [-10.6, -31.5]],                              // left arm
  ];
  const armDown = [[[8.2, -50], [11.2, -41], [10.6, -31.5]]];
  const armUp = [[[8.2, -50], [13.5, -59], [16.5, -69]]];
  const armReach = [[[8.2, -50], [13, -40], [16.5, -30]]];
  let out = `<g transform="scale(${HER_K})"><path class="fine" d="${polyD(body)}"/>`;
  const headD = `<path class="fine" d="${polyD(head)}"/>`;
  if (live) {
    // she nods on every beat
    out += `<g>${spin([0, 5, 0], BEAT, 0, -56)}${headD}</g>`;
    const up = windowAnim([[5.25, 6.6]]);
    const reach = windowAnim([[19.5, 20.4]]);
    const down = windowAnim([[0, 5.25], [6.6, 19.5], [20.4, LOOP]]);
    out += `<path class="fine ${down}" d="${polyD(armDown)}"/><path class="fine ${up}" d="${polyD(armUp)}"/><path class="fine ${reach}" d="${polyD(armReach)}"/>`;
  } else {
    out += headD + `<path class="fine" d="${polyD(armDown)}"/>`;
  }
  return out + '</g>';
}

const BOTTLE = [closeP([[-2.6, 6], [2.6, 6], [2.6, -2.5], [1.2, -5], [1.2, -9], [-1.2, -9], [-1.2, -5], [-2.6, -2.5]]), [[-1.4, -9.5], [1.4, -9.5]], [[-1, 0.5], [1, 3.5]]];
const DRONE = [
  closeP([[-7, -3], [7, -3], [7, 2], [-7, 2]]),
  [[-7, -1], [-16, -4]], [[7, -1], [16, -4]],
  [[-5, 2], [-7, 6.5]], [[5, 2], [7, 6.5]],
  [[-16, -4], [-16, -6]], [[16, -4], [16, -6]],
];
const ROTOR_L = closeP(ring(14, 8, 1.7, -16, -6.6));
const ROTOR_R = closeP(ring(14, 8, 1.7, 16, -6.6));
const PARCEL = [
  closeP([[-7, 0], [7, 0], [7, -10], [-7, -10]]),
  [[-7, -10], [-4, -13], [10, -13], [7, -10]], [[7, 0], [10, -3], [10, -13]],
  [[0, 0], [0, -10], [3, -13]], [[0, -10], [-3.5, -15], [-0.5, -16], [0, -10], [3.5, -15.5], [1, -16.4], [0, -10]],
];
// a fin moving left (tip swept back), wearing headphones over the top
const FIN = [
  [[-12, 0], [-8.5, -7], [-4, -13.5], [1, -18.5], [6.5, -23], [6, -16.5], [7, -10], [9.5, -4.5], [12.5, 0]],
  [[-19, 1.2], [-15, 0.2], [-12, 0]], [[12.5, 0], [19, 1.4], [27, 1]], [[12.5, 0], [17.5, -1.2], [22, -1.4]],
];
const FIN_PHONES = [
  [[-5.4, -14], [-4.6, -21], [-0.6, -26.6], [5, -28.6], [9.4, -25.6], [9.8, -19], [8.6, -15]],
  closeP(ring(10, 3.4, 4.3, -4.6, -11.2, 0)),
  closeP(ring(8, 1.6, 2.2, -4.6, -11.2, 0)),
  arc(9.2, -12.4, 3.1, -Math.PI * 0.5, Math.PI * 0.5, 4),
];
const crabLegs = (ph) => {
  const o = ph ? 1.2 : -1.2;
  const legs = [];
  for (const sg of [-1, 1]) for (let i = 0; i < 3; i++) {
    const x = sg * (3 + i * 1.6);
    const sw = (i % 2 ? -o : o);
    legs.push([[x, -2], [x + sg * 2.4 + sw, 0], [x + sg * 3.2 + sw, 2.4]]);
  }
  return legs;
};
const CRAB_BODY = [
  [[-6, -2], [-5, -6], [-2, -7.5], [2, -7.5], [5, -6], [6, -2], [3, -0.6], [-3, -0.6], [-6, -2]],
  [[-5, -5], [-8.5, -8], [-10.5, -11], [-8, -11.2], [-8.4, -9]], [[5, -5], [8.5, -8], [10.5, -11], [8, -11.2], [8.4, -9]],
];
const CRAB_STALKS = [[[-1.8, -7.4], [-2.2, -10.4]], [[1.8, -7.4], [2.2, -10.4]]];
const CRAB_EYES = [[-2.2, -10.8], [2.2, -10.8]];
const COCO = cocoShape(6.2, 31);
const BONK = Array.from({ length: 6 }, (_, i) => {
  const a = (i / 6) * TAU + 0.3;
  return [[Math.cos(a) * 9, Math.sin(a) * 6 - 4], [Math.cos(a) * 14, Math.sin(a) * 9 - 4]];
});
const PLANE = [[[-9, 0], [9, 0]], [[-1, 0], [3.5, -5.5]], [[-1, 0], [3.5, 5]], [[7, 0], [9.5, -3.6]]];

// ---------------------------------------------------------------------------
// Scenery that does not move with the island
// ---------------------------------------------------------------------------
function cloud(cx, cy, w, h, seed) {
  const R = rng(seed);
  const n = 5;
  const bumps = Array.from({ length: n }, (_, i) => {
    const k = (i + 0.5) / n;
    const r = h * (0.45 + 0.55 * Math.sin(Math.PI * k)) * (0.85 + 0.3 * R());
    return { x: cx - w / 2 + k * w, r, y: cy };
  });
  const pts = [];
  const M = 34;
  for (let j = 0; j <= M; j++) {
    const x = cx - w / 2 - h * 0.1 + (j / M) * (w + h * 0.2);
    let y = cy;
    for (const b of bumps) {
      const dx = x - b.x;
      if (Math.abs(dx) < b.r) y = Math.min(y, b.y - Math.sqrt(b.r * b.r - dx * dx));
    }
    pts.push([x, y]);
  }
  return closeP(pts);
}
const SUN = [196, 216];

// ---------------------------------------------------------------------------
// Assemble the banner
// ---------------------------------------------------------------------------
function buildBanner() {
  const live = [], still = [];

  // --- the sky: horizon, distant islets, sun, clouds, a plane -------------
  const sky = [];
  sky.push(`<path d="M${SX0} ${f1(HORIZON)}H${SX1}"/>`);
  const islet = (x, w, h) => [[x - w / 2, HORIZON], [x - w * 0.32, HORIZON - h * 0.7], [x - w * 0.1, HORIZON - h], [x + w * 0.18, HORIZON - h * 0.85], [x + w / 2, HORIZON]];
  sky.push(`<path class="dim" d="${polyD([islet(318, 70, 7), islet(1012, 44, 5), [[1016, HORIZON - 4.5], [1018, HORIZON - 15], [1013, HORIZON - 17]], [[1018, HORIZON - 15], [1023, HORIZON - 17]]])}"/>`);
  sky.push(`<path d="${polyD([closeP(ring(22, 18, 18, SUN[0], SUN[1]))])}"/>`);
  const rays = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * TAU;
    return [[SUN[0] + Math.cos(a) * 24, SUN[1] + Math.sin(a) * 24], [SUN[0] + Math.cos(a) * (i % 2 ? 29 : 33), SUN[1] + Math.sin(a) * (i % 2 ? 29 : 33)]];
  });
  sky.push(`<g class="rays"><path d="${polyD(rays)}"/></g>`);
  css.push(`.rays{transform-box:view-box;transform-origin:${SUN[0]}px ${SUN[1]}px;animation:rays ${LOOP}s linear ${delay(0)} infinite}@keyframes rays{to{transform:rotate(60deg)}}`);
  const clouds = [cloud(420, 236, 120, 28, 2), cloud(935, 214, 96, 24, 4), cloud(1110, 246, 70, 17, 6)];
  sky.push(`<g class="drift"><path class="dim2" d="${polyD(clouds)}"/></g>`);
  css.push(`.drift{animation:drift 30s ease-in-out ${delay(0)} infinite alternate}@keyframes drift{from{transform:translate(0,0)}to{transform:translate(-26px,0)}}`);

  // plane with a vapour trail, right to left across the sky (0.5 s to 20.5 s)
  {
    const y0 = 203, y1 = 196, x0 = 1215, x1 = -20;
    const pw = windowAnim([[0.5, 20.5]]);
    const name = `pl${kfId++}`;
    css.push(`@keyframes ${name}{0%,${pct(0.5)}{transform:translate(${x0}px,${y0}px)}${pct(20.5)},100%{transform:translate(${x1}px,${y1}px)}}`);
    css.push(`.${name}{animation:${name} ${LOOP}s linear ${delay(0)} infinite both}`);
    const trail = `M${x0} ${y0}L${x1} ${y1}`;
    const tn = `tr${kfId++}`;
    css.push(`@keyframes ${tn}{0%,${pct(0.5)}{stroke-dashoffset:1;opacity:.55}${pct(20.5)}{stroke-dashoffset:0;opacity:.45}${pct(27)}{opacity:0}100%{stroke-dashoffset:0;opacity:0}}`);
    css.push(`.${tn}{stroke-dasharray:1 1;animation:${tn} ${LOOP}s linear ${delay(0)} infinite both}`);
    live.push(`<path class="fine ${tn}" pathLength="1" d="${trail}" transform="translate(9 0)"/>`);
    live.push(`<g class="${pw}"><g class="${name}"><path class="fine" d="${polyD(PLANE)}"/></g></g>`);
  }

  // --- sea ------------------------------------------------------------------
  const seaFrames = [];
  for (let k = 0; k <= SEA_K; k++) seaFrames.push(relD(seaFrame((k / SEA_K) * BAR)));
  const seaAnim = `<animate attributeName="d" dur="${BAR}s" begin="${begin}" repeatCount="indefinite" values="${seaFrames.join(';')}"/>`;

  // --- island frames ----------------------------------------------------
  const frames = KEY_T.map((t) => islandFrame(t));
  const islandD = frames.map((f) => relD(f.polys));
  const foamD = frames.map((f) => relD(f.foam));

  // island hole in the sea (covers every frame's waterline)
  let hx = 0, hy = 0;
  for (const f of frames) for (const [x, y] of f.polys[0]) { hx = Math.max(hx, Math.abs(x - CAM.X0)); hy = Math.max(hy, Math.abs(y - CAM.Y0)); }
  const hole = { rx: hx + 6, ry: hy + 4 };

  // --- live layer ---------------------------------------------------------
  live.push(`<g clip-path="url(#seaClip)"><path class="sea" d="${seaFrames[0]}">${seaAnim}</path></g>`);
  live.push(`<path class="foam" d="${foamD[0]}">${morph(foamD)}</path>`);
  live.push(`<path d="${islandD[0]}">${morph(islandD)}</path>`);
  css.push(`.sea{stroke:url(#seaG);stroke-dasharray:34 13 16 17 52 12 9 19 26 15}`);
  css.push(`.foam{stroke-dasharray:4 7;opacity:.6;animation:foam ${BAR}s ease-in-out ${delay(0)} infinite}@keyframes foam{0%,100%{stroke-dashoffset:0;opacity:.35}50%{stroke-dashoffset:-11;opacity:.8}}`);

  // her, following the turntable
  const herT = track(KEY_T.map((t) => ({ t, ...onIsland(HER, t) })), { spline: true });
  live.push(follow(herT, herMarkup(true)));

  // --- GAG 1: the bottle (6 s to 20.4 s) -------------------------------
  {
    const hand = (t) => { const a = onIsland(HER, t); return [a.x + 16.5 * HER_K * a.s, a.y - 70 * HER_K * a.s, a.s]; };
    const S1 = [-4.1, 0, 2.2], S2 = [-5.4, 0, 3.1];
    const feet = [HER[0] + 0.5, HER[1], HER[2] + 0.28];
    const samples = [];
    for (const t of sampleRange(6.0, 7.2, 0.1)) {
      const k = (t - 6.0) / 1.2;
      const h0 = hand(6.0), s1 = atSea(S1);
      samples.push({ t, x: lerp(h0[0], s1.x, k), y: lerp(h0[1], s1.y, k) - 75 * 4 * k * (1 - k), s: lerp(h0[2], s1.s, k) });
    }
    for (const t of sampleRange(7.4, 12, 0.5)) {
      const k = smooth((t - 7.2) / 4.8);
      const p = atSea([lerp(S1[0], S2[0], k), 0, lerp(S1[2], S2[2], k)]);
      samples.push({ t, ...p, y: p.y - 2 });
    }
    const F18 = rotY(feet, yaw(18));
    for (const t of sampleRange(12.5, 18, 0.5)) {
      const k = smooth((t - 12) / 6);
      const p = atSea([lerp(S2[0], F18[0], k), 0, lerp(S2[2], F18[2], k)]);
      samples.push({ t, ...p, y: p.y - 2 });
    }
    for (const t of sampleRange(18.5, 20.4, 0.5)) samples.push({ t, ...onIsland(feet, t) });
    const trk = track(samples);
    const w = windowAnim([[6.0, 20.4]]);
    // spin while flying, bob while floating, lie flat on the sand
    const rot = `<animateTransform attributeName="transform" type="rotate" dur="${LOOP}s" begin="${begin}" repeatCount="indefinite" keyTimes="0;${f3(6 / 60)};${f3(7.2 / 60)};${f3(18 / 60)};${f3(18.4 / 60)};1" values="-20;-20;650;660;630;630"/>`;
    const bob = spin([-12, 12, -12], BAR / 2);
    live.push(`<g class="${w}">${follow(trk, `<g>${rot}<g>${bob}<path class="fine" d="${polyD(scl(BOTTLE, 1.7))}"/></g></g>`)}</g>`);
    // splash where it lands
    const sp = atSea(S1);
    const sw = windowAnim([[7.2, 8.1]]);
    const sn = `sp${kfId++}`;
    css.push(`@keyframes ${sn}{0%,${pct(7.2)}{transform:translate(${f1(sp.x)}px,${f1(sp.y)}px) scale(.3)}${pct(8.1)},100%{transform:translate(${f1(sp.x)}px,${f1(sp.y)}px) scale(1.8)}}`);
    css.push(`.${sn}{animation:${sn} ${LOOP}s ease-out ${delay(0)} infinite both}`);
    live.push(`<g class="${sw}"><g class="${sn}"><path class="fine" d="${polyD([closeP(ring(16, 12, 3.2))])}"/></g></g>`);
  }

  // --- GAG 2: the drone and the parcel (24 s to 44 s) ------------------
  let phonesTarget;
  {
    const G = (t) => onIsland(PARCEL_AT, t);
    const g29 = G(29.25);
    const hover = { x: g29.x, y: g29.y - 150, s: 1 };
    const entry = { x: 1230, y: 214, s: 1 }, exit = { x: -40, y: 196, s: 1 };
    const ds = [];
    for (const t of sampleRange(24, 27, 0.25)) {
      const k = smooth((t - 24) / 3);
      ds.push({ t, x: lerp(entry.x, hover.x, k), y: lerp(entry.y, hover.y, k) - 30 * Math.sin(Math.PI * k), s: 1 });
    }
    for (const t of sampleRange(27.25, 30, 0.25)) ds.push({ t, x: hover.x, y: hover.y + 2.5 * Math.sin((t - 27) * TAU / 1.5), s: 1 });
    for (const t of sampleRange(30.25, 33, 0.25)) {
      const k = easeIn((t - 30) / 3);
      ds.push({ t, x: lerp(hover.x, exit.x, k), y: lerp(hover.y, exit.y, k) - 20 * Math.sin(Math.PI * k), s: 1 });
    }
    const dw = windowAnim([[24, 33]]);
    const rot = (r) => `<path class="fine rotor" pathLength="1" d="${polyD([r])}"/>`;
    css.push(`.rotor{stroke-dasharray:.3 .2;animation:rotor .5s linear ${delay(0)} infinite}@keyframes rotor{to{stroke-dashoffset:-1}}`);
    live.push(`<g class="${dw}">${follow(track(ds), `<g transform="scale(1.45)"><path class="fine" d="${polyD(DRONE)}"/>${rot(ROTOR_L)}${rot(ROTOR_R)}</g>`)}</g>`);
    // tether
    const tetherVals = [], tetherKT = [];
    const tether = (t) => {
      const dr = ds.reduce((best, p) => (Math.abs(p.t - t) < Math.abs(best.t - t) ? p : best));
      let py;
      if (t <= 29.25) py = lerp(hover.y + 18, g29.y - 13, smooth(clamp((t - 27) / 2.25, 0, 1)));
      else py = lerp(g29.y - 13, dr.y + 7, smooth(clamp((t - 29.25) / 0.75, 0, 1)));
      return `M${f1(dr.x)} ${f1(dr.y + 7)}V${f1(py)}`;
    };
    for (const t of [0, ...sampleRange(27, 30, 0.25), LOOP]) { tetherVals.push(tether(clamp(t, 27, 30))); tetherKT.push(f3(t / LOOP)); }
    const tw = windowAnim([[27, 30]]);
    live.push(`<path class="fine ${tw}" d="${tetherVals[1]}"><animate attributeName="d" dur="${LOOP}s" begin="${begin}" repeatCount="indefinite" keyTimes="${tetherKT.join(';')}" values="${tetherVals.join(';')}"/></path>`);
    // parcel: down on the line, sits on the sand, then the tide takes it
    const ps = [];
    for (const t of sampleRange(27, 29.25, 0.25)) {
      const k = smooth((t - 27) / 2.25);
      ps.push({ t, x: g29.x, y: lerp(hover.y + 31, g29.y, k), s: lerp(1, g29.s, k) });
    }
    for (const t of sampleRange(29.75, 38.25, 0.75)) ps.push({ t, ...G(t) });
    const P38 = rotY(PARCEL_AT, yaw(38.25));
    const sea1 = [P38[0] - 0.4, 0, P38[2] + 1.2], sea2 = [P38[0] - 1.9, 0, P38[2] + 2.2];
    for (const t of sampleRange(38.75, 44.25, 0.5)) {
      const k = (t - 38.25) / 6;
      const p = k < 0.33 ? [lerp(P38[0], sea1[0], k / 0.33), lerp(P38[1], 0, k / 0.33), lerp(P38[2], sea1[2], k / 0.33)]
        : [lerp(sea1[0], sea2[0], (k - 0.33) / 0.67), 0, lerp(sea1[2], sea2[2], (k - 0.33) / 0.67)];
      const a = atSea(p);
      ps.push({ t, ...a, y: a.y + (k < 0.33 ? 0 : 3) });
    }
    const pw = windowAnim([[27, 44.25]], { fadeOut: 1.5 });
    live.push(`<g class="${pw}">${follow(track(ps), `<path class="fine" d="${polyD(scl(PARCEL, 1.35))}"/>`)}</g>`);
    // the parcel pops, and the headphones fly up to the lives counter
    const pop = G(30.75);
    phonesTarget = { x: 56 + 2 * 27 + 9.2, y: 103 };
    const hs = [];
    for (const t of sampleRange(30.75, 31.25, 0.125)) hs.push({ t, x: pop.x, y: pop.y - 18 - 26 * easeOut((t - 30.75) / 0.5), s: 1.25 });
    for (const t of sampleRange(31.4, 32.4, 0.1)) {
      const k = smooth((t - 31.25) / 1.15);
      hs.push({ t, x: lerp(pop.x, phonesTarget.x, k), y: lerp(pop.y - 44, phonesTarget.y, k) - 90 * Math.sin(Math.PI * k), s: lerp(1.25, 1, k) });
    }
    const hw = windowAnim([[30.75, 32.4]]);
    live.push(`<g class="${hw}">${follow(track(hs), `<path class="fine" d="${polyD(scl(PHONES, 1.2))}"/>`)}</g>`);
    const pp = windowAnim([[30.75, 31.2]]);
    live.push(`<g class="${pp}" transform="translate(${f1(pop.x)} ${f1(pop.y - 14)})"><path class="fine" d="${polyD(BONK.map((s) => s.map(([x, y]) => [x * 0.8, y * 0.8 + 3])))}"/></g>`);
  }

  // --- GAG 3: the shark in headphones (36 s to 48 s) -------------------
  {
    const R = 5.8, RZ = 3.4;
    const pos = (t) => {
      const k = clamp((t - 36.6) / 10.8, 0, 1);
      const th = lerp(-0.12, Math.PI + 0.12, smooth(k) * 0.3 + k * 0.7);
      return atSea([R * Math.cos(th), 0, RZ * Math.sin(th)]);
    };
    const ts = sampleRange(36, 48, 0.25);
    const samples = ts.map((t) => ({ t, ...pos(t) }));
    const sy = ts.map((t) => (t < 36.6 ? smooth((t - 36) / 0.6) : t > 47.4 ? 1 - smooth((t - 47.4) / 0.6) : 1));
    const trk = track(samples, { scaleY: [sy[0], ...sy, sy[sy.length - 1]] });
    const w = windowAnim([[36, 48]]);
    const nod = spin([0, -8, 0], BEAT, 0, 0);
    live.push(`<g class="${w}">${follow(trk, `<g>${nod}<path class="fine" d="${polyD(scl(FIN, 1.55))}"/><path class="fine" d="${polyD(scl(FIN_PHONES, 1.55))}"/></g>`)}</g>`);
  }

  // --- GAG 4: coconut versus crab (45 s to 56.3 s) ---------------------
  {
    // the coconut hangs in the crown until 48 s, falls, and sits on the crab
    const cs = [];
    for (const t of sampleRange(0, 48, 3)) cs.push({ t, ...onIsland(COCO_FALL, t) });
    const walkFrom = COCO_LAND, walkTo = [2.55, 0.08, 1.2], walkSea = [2.95, 0.0, 1.55];
    const crabAtLow = (t) => { const p = crabAt(t); return [p[0], p[1] - 0.08, p[2]]; };
    const crabAt = (t) => {
      if (t <= 49.5) return COCO_LAND;
      if (t <= 55.5) { const k = (t - 49.5) / 6; return [lerp(walkFrom[0], walkTo[0], k), lerp(walkFrom[1], walkTo[1], k), lerp(walkFrom[2], walkTo[2], k)]; }
      const k = clamp((t - 55.5) / 0.8, 0, 1);
      return [lerp(walkTo[0], walkSea[0], k), lerp(walkTo[1], walkSea[1], k), lerp(walkTo[2], walkSea[2], k)];
    };
    const hatAt = (t) => { const c = onIsland(crabAtLow(t), t); return { x: c.x, y: c.y - 17 * c.s, s: c.s }; };
    for (const t of sampleRange(48.1, 48.6, 0.1)) {
      const k = easeIn((t - 48) / 0.6);
      const a = onIsland(COCO_FALL, t), b = hatAt(t);
      cs.push({ t, x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), s: lerp(a.s, b.s, k) });
    }
    for (const t of sampleRange(48.75, 56.3, 0.25)) cs.push({ t, ...hatAt(t) });
    // the last fall frame lands exactly on the crab's back
    const back = cs.findIndex((p) => p.t > 48.55 && p.t < 48.7);
    if (back >= 0) cs[back] = { t: cs[back].t, ...hatAt(cs[back].t) };
    // back in the crown (unseen) for the next minute
    for (const t of [56.4, 57, 60]) cs.push({ t, ...onIsland(COCO_FALL, t) });
    const cw = windowAnim([[0, 56.3], [57, LOOP]], { fadeIn: 1.8 });
    live.push(`<g class="${cw}">${follow(track(cs), `<path class="fine" d="${polyD(scl([COCO], 1.35))}"/>`)}</g>`);
    // the crab: scuttles in from the right shore, gets a hat, walks off
    const start = [2.75, 0.06, 0.55];
    const crabPos = (t) => {
      if (t < 48.3) { const k = smooth(clamp((t - 45) / 3.3, 0, 1)); return [lerp(start[0], COCO_LAND[0], k), lerp(start[1], COCO_LAND[1] - 0.08, k), lerp(start[2], COCO_LAND[2], k)]; }
      const p = crabAt(t);
      return [p[0], p[1] - 0.08, p[2]];
    };
    const ks = sampleRange(45, 56.3, 0.25).map((t) => ({ t, ...onIsland(crabPos(t), t) }));
    const kw = windowAnim([[45, 56.3]], { fadeIn: 0.4, fadeOut: 0.5 });
    const eyesW = windowAnim([[45, 48.6]]);
    const legA = windowAnim(Array.from({ length: 31 }, (_, i) => [45 + i * 0.375, 45 + i * 0.375 + 0.1875]).filter(([a]) => a < 56.3));
    const legB = windowAnim(Array.from({ length: 31 }, (_, i) => [45 + i * 0.375 + 0.1875, 45 + i * 0.375 + 0.375]).filter(([a]) => a < 56.3));
    live.push(`<g class="${kw}">${follow(track(ks), `<path class="fine" d="${polyD(scl(CRAB_BODY, 1.3))}"/><g class="${eyesW}"><path class="fine" d="${polyD(scl(CRAB_STALKS, 1.3))}"/><path class="dot" d="${dotsD(scl([CRAB_EYES], 1.3)[0])}"/></g><path class="fine ${legA}" d="${polyD(scl(crabLegs(0), 1.3))}"/><path class="fine ${legB}" d="${polyD(scl(crabLegs(1), 1.3))}"/>`)}</g>`);
    // bonk
    const b = hatAt(48.6);
    const bw = windowAnim([[48.6, 49.35]]);
    live.push(`<g class="${bw}" transform="translate(${f1(b.x)} ${f1(b.y)})"><path class="fine" d="${polyD(scl(BONK, 1.3))}"/></g>`);
  }

  // --- the still frame for reduced motion ------------------------------
  still.push(`<g clip-path="url(#seaClip)"><path class="sea" d="${seaFrames[0]}"/></g>`);
  still.push(`<path class="foam0" d="${foamD[0]}"/>`);
  still.push(`<path d="${islandD[0]}"/>`);
  const h0 = onIsland(HER, 0);
  still.push(`<g transform="translate(${f1(h0.x)} ${f1(h0.y)}) scale(${f3(h0.s)})">${herMarkup(false)}</g>`);
  const c0 = onIsland(COCO_FALL, 0);
  still.push(`<g transform="translate(${f1(c0.x)} ${f1(c0.y)}) scale(${f3(c0.s)})"><path class="fine" d="${polyD(scl([COCO], 1.35))}"/></g>`);
  css.push(`.foam0{stroke-dasharray:4 7;opacity:.5}`);

  // --- top strip: counters, title, tagline -----------------------------
  const top = [];
  top.push(textG('GAGS', 56, 38, 2.3));
  const gagStages = [[0, 6, '000'], [6, 24, '001'], [24, 36, '002'], [36, 48, '003'], [48, LOOP, '004']];
  for (const [a, b, s] of gagStages) {
    const w = windowAnim([[a, b]]);
    top.push(textG(s, 56, 58, 4.3, 4.3, ` class="digits ${w}${a === 0 ? ' first' : ''}"`));
  }
  // lives: pairs of headphones
  for (let i = 0; i < 2; i++) top.push(`<g transform="translate(${56 + i * 27 + 9.2} 103)"><path class="fine" d="${polyD(PHONES)}"/></g>`);
  const extra = windowAnim([[32.4, LOOP - 1.2]], { fadeOut: 1 });
  const blink = `bl${kfId++}`;
  css.push(`@keyframes ${blink}{0%,${pct(32.4)}{opacity:1}${pct(32.65)}{opacity:.25}${pct(32.9)}{opacity:1}${pct(33.15)}{opacity:.25}${pct(33.4)}{opacity:1}${pct(33.65)}{opacity:.25}${pct(33.9)},100%{opacity:1}}.${blink}{animation:${blink} ${LOOP}s linear ${delay(0)} infinite both}`);
  top.push(`<g class="${extra} xlife"><g class="${blink}" transform="translate(${phonesTarget.x} ${phonesTarget.y})"><path class="fine" d="${polyD(PHONES)}"/></g></g>`);
  css.push(`.xlife{opacity:0}`);
  // right block
  const RX = W - 56;
  top.push(textG('SEED', RX - textW('SEED', 2.3), 38, 2.3));
  top.push(textG('1992', RX - textW('1992', 4.3), 58, 4.3));
  top.push(textG('RUN 10:00:00', RX - textW('RUN 10:00:00', 2.3), 103, 2.3));
  // title
  top.push(titleMarkup());
  const TAG = 'A TEN-HOUR LO-FI ISLAND VIDEO WHERE ALMOST NOTHING HAPPENS';
  top.push(textG(TAG, W / 2 - textW(TAG, 2.25) / 2, 156, 2.25, 2.25, ' class="tag"'));

  // --- bottom strip: status line and the boast --------------------------
  const bot = [];
  const MSGS = [
    [0, 6, 'ALL QUIET ON THE ISLAND'],
    [6, 12, 'BOTTLE AWAY'],
    [12, 21, 'BOTTLE BACK. STILL HERS'],
    [21, 24, 'ALL QUIET'],
    [24, 30, 'DRONE INBOUND'],
    [30, 36, 'EXTRA LIFE: MORE HEADPHONES'],
    [36, 42, 'SHARK IN RANGE'],
    [42, 48, 'THREAT LEVEL: NODDING'],
    [48, 51, 'INCOMING COCONUT'],
    [51, 57, 'CRAB EQUIPS COCONUT'],
    [57, LOOP, 'ALL QUIET AGAIN'],
  ];
  const BY = 583, BS = 2.35;
  bot.push(textG('>', 56, BY, BS));
  MSGS.forEach(([a, b, s], i) => {
    const name = `m${i}`;
    const eps = 0.006;
    const st = [];
    st.push(['0%', a === 0 ? 1 : 0, a === 0 ? 1 : 1]);
    if (a > 0) { st.push([pct(a - eps), 0, 1]); st.push([pct(a), 1, 1]); }
    st.push([pct(a + 0.4), 1, 0]);
    if (b < LOOP) { st.push([pct(b - eps), 1, 0]); st.push([pct(b), 0, 0]); }
    st.push(['100%', b >= LOOP ? 1 : 0, 0]);
    css.push(`@keyframes ${name}{${st.map(([p, o, d]) => `${p}{opacity:${o};stroke-dashoffset:${d}}`).join('')}}`);
    css.push(`.${name}{animation:${name} ${LOOP}s linear ${delay(0)} infinite both}`);
    const t = textD(s, 56 + 8 * BS, BY, BS);
    bot.push(`<g class="msg ${name}${i === 0 ? ' first' : ''}"><path pathLength="1" d="${t.lines}"/>${t.dots ? `<path class="dot" d="${t.dots}"/>` : ''}</g>`);
  });
  css.push(`.msg{opacity:0;stroke-dasharray:1 1}.msg .dot{stroke-dasharray:none}.msg.first,.digits.first{opacity:1}.digits{opacity:0}`);
  const BOAST = 'NO PIXELS · NO SAMPLES · NO PLOT';
  bot.push(textG(BOAST, RX - textW(BOAST, BS), BY, BS));

  return { live, still, sky, top, bot, hole };
}

// ---------------------------------------------------------------------------
// Write the banner SVG
// ---------------------------------------------------------------------------
function bannerSVG() {
  const b = buildBanner();
  const seaClip = `M${SX0} ${f1(HORIZON + 1)}H${SX1}V${ZC}H${SX0}Z` +
    `M${f1(CAM.X0 - b.hole.rx)} ${CAM.Y0}a${f1(b.hole.rx)} ${f1(b.hole.ry)} 0 1 0 ${f1(2 * b.hole.rx)} 0a${f1(b.hole.rx)} ${f1(b.hole.ry)} 0 1 0 ${f1(-2 * b.hole.rx)} 0Z`;
  const flick = `@keyframes flick{0%,23.5%{opacity:1}23.51%,23.59%{opacity:.8}23.6%,69.4%{opacity:1}69.41%,69.49%{opacity:.84}69.5%,100%{opacity:1}}`;
  const style = [
    `.beam{fill:none;stroke:${CORE};stroke-linecap:round;stroke-linejoin:round}`,
    `.h{--w:9px;stroke-width:var(--w);stroke-opacity:.11}`,
    `.m{--w:3.6px;stroke-width:var(--w);stroke-opacity:.3}`,
    `.c{--w:1.45px;stroke-width:var(--w)}`,
    `.dot{stroke-width:calc(var(--w)*1.6)}.fine{stroke-width:calc(var(--w)*.8)}`,
    `.dim{opacity:.6}.dim2{opacity:.75}.tag{opacity:.9}`,
    `.still{display:none}`,
    `.tint{mix-blend-mode:multiply}`,
    `.flick{animation:flick ${LOOP}s linear ${delay(0)} infinite}${flick}`,
    ...css,
    `@media (prefers-reduced-motion:reduce){.live{display:none}.still{display:inline}*{animation:none!important}.ts{stroke-dashoffset:0;opacity:1}.spark{opacity:0}}`,
  ].join('\n');

  const glow = (id) => `<use href="#${id}" class="h"/><use href="#${id}" class="m"/><use href="#${id}" class="c"/>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="t d">
<title id="t">CASTAWAY on a vector beam display</title>
<desc id="d">A vector arcade screen under a three-colour overlay. The title CASTAWAY is an extruded wireframe in stroke capitals that the beam redraws once a minute. Below it a wireframe island with one palm, a raft and a small woman in headphones turns slowly on a turntable while swell lines roll in. In one minute: a bottle washes straight back, a drone delivers headphones that fly up to the lives counter, a shark in headphones circles and nods, and a coconut falls on a crab, which walks off wearing it.</desc>
<style>
${style}
</style>
<defs>
<radialGradient id="tube" cx="50%" cy="48%" r="65%"><stop offset="0" stop-color="#0b1013"/><stop offset=".7" stop-color="#040607"/><stop offset="1" stop-color="#000"/></radialGradient>
<linearGradient id="seaG" gradientUnits="userSpaceOnUse" x1="0" y1="${f1(HORIZON)}" x2="0" y2="${ZC}"><stop offset="0" stop-color="#fff" stop-opacity=".12"/><stop offset=".35" stop-color="#fff" stop-opacity=".42"/><stop offset="1" stop-color="#fff" stop-opacity=".82"/></linearGradient>
<linearGradient id="bez" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a2f36"/><stop offset=".08" stop-color="#16191e"/><stop offset="1" stop-color="#0d0f12"/></linearGradient>
<radialGradient id="glare" cx="22%" cy="8%" r="60%"><stop offset="0" stop-color="#fff" stop-opacity=".07"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
<clipPath id="tubeClip"><rect x="${SX0}" y="${SY0}" width="${SX1 - SX0}" height="${SY1 - SY0}" rx="18"/></clipPath>
<clipPath id="seaClip"><path clip-rule="evenodd" d="${seaClip}"/></clipPath>
<g id="ALL">
<g>${b.sky.join('')}</g>
<g class="live">${b.live.join('')}</g>
<g class="still">${b.still.join('')}</g>
<g>${b.top.join('')}</g>
<g>${b.bot.join('')}</g>
</g>
</defs>
<rect width="${W}" height="${H}" rx="26" fill="url(#bez)"/>
<rect x="${SX0 - 1.5}" y="${SY0 - 1.5}" width="${SX1 - SX0 + 3}" height="${SY1 - SY0 + 3}" rx="19.5" fill="none" stroke="#000" stroke-width="3"/>
<g clip-path="url(#tubeClip)">
<rect x="${SX0}" y="${SY0}" width="${SX1 - SX0}" height="${SY1 - SY0}" fill="url(#tube)"/>
<g class="beam flick">${glow('ALL')}</g>
<rect class="tint" x="${SX0}" y="${SY0}" width="${SX1 - SX0}" height="${ZA - SY0}" fill="${TINT_A}"/>
<rect class="tint" x="${SX0}" y="${ZA}" width="${SX1 - SX0}" height="${ZC - ZA}" fill="${TINT_B}"/>
<rect class="tint" x="${SX0}" y="${ZC}" width="${SX1 - SX0}" height="${SY1 - ZC}" fill="${TINT_C}"/>
<g opacity=".045"><rect x="${SX0}" y="${SY0}" width="${SX1 - SX0}" height="${ZA - SY0}" fill="${TINT_A}"/><rect x="${SX0}" y="${ZA}" width="${SX1 - SX0}" height="${ZC - ZA}" fill="${TINT_B}"/><rect x="${SX0}" y="${ZC}" width="${SX1 - SX0}" height="${SY1 - ZC}" fill="${TINT_C}"/></g>
<rect x="${SX0}" y="${SY0}" width="${SX1 - SX0}" height="${SY1 - SY0}" fill="url(#glare)"/>
</g>
<rect x="${SX0 + 0.5}" y="${SY0 + 0.5}" width="${SX1 - SX0 - 1}" height="${SY1 - SY0 - 1}" rx="17.5" fill="none" stroke="#fff" stroke-opacity=".06"/>
</svg>
`;
  return svg;
}

// ---------------------------------------------------------------------------
// The scope: the theme's four chords as one closed XY trace (the oscilloscope
// variant of the style). Each bar shows one chord of the progression as
// tools/make_audio.py plays it (Gm9, C13, Fmaj9, Dm9, one per 3 s bar):
// X is the chord's root, Y its third, tuned to the nearest small ratio so the
// figure closes (minor third 6:5, major third 5:4). It is drawn from the
// chord names, not from the audio file. The trace drifts in phase during the
// bar and morphs to the next chord on the bar line; 12 s per lap.
// ---------------------------------------------------------------------------
function scopeSVG() {
  css.length = 0;
  const SW = 1110, SH = 400;
  const S0 = 22, S1x = SW - 22, S1y = SH - 22;
  const SC = { x: 206, y: 200, r: 150 };    // scope face (square, 300 x 300)
  const ZX = 398;                            // readout zone starts here
  const CH = [
    { name: 'Gm9', fx: 5, fy: 6, ratio: '6:5', third: 'MINOR THIRD' },
    { name: 'C13', fx: 4, fy: 5, ratio: '5:4', third: 'MAJOR THIRD' },
    { name: 'Fmaj9', fx: 4, fy: 5, ratio: '5:4', third: 'MAJOR THIRD' },
    { name: 'Dm9', fx: 5, fy: 6, ratio: '6:5', third: 'MINOR THIRD' },
  ];
  const N = 300;
  const fig = (c, ph) => {
    const pts = [];
    for (let i = 0; i <= N; i++) {
      const t = (i / N) * TAU;
      pts.push([SC.x + 128 * Math.sin(c.fx * t + ph), SC.y - 128 * Math.sin(c.fy * t)]);
    }
    return [pts];
  };
  const vals = [], kts = [];
  CH.forEach((c, k) => {
    const p0 = 0.35 + k * 0.55, p1 = p0 + 0.45;
    vals.push(relD(fig(c, p0)), relD(fig(c, p1)));
    kts.push(f3((k * 3) / 12), f3((k * 3 + 2.45) / 12));
  });
  vals.push(vals[0]);
  kts.push('1');
  const trace = `<path d="${vals[0]}"><animate attributeName="d" dur="12s" begin="${begin}" repeatCount="indefinite" keyTimes="${kts.join(';')}" values="${vals.join(';')}"/></path>`;
  const traceStill = `<path d="${vals[0]}"/>`;

  // graticule: 8 x 8 divisions, ticks on the axes
  const g = [];
  const L = SC.x - SC.r, R = SC.x + SC.r, T = SC.y - SC.r, B = SC.y + SC.r;
  for (let i = 1; i < 8; i++) {
    const x = L + (i * 2 * SC.r) / 8, y = T + (i * 2 * SC.r) / 8;
    g.push([[x, T], [x, B]], [[L, y], [R, y]]);
  }
  const ticks = [];
  for (let i = 1; i < 40; i++) {
    const x = L + (i * 2 * SC.r) / 40, y = T + (i * 2 * SC.r) / 40;
    ticks.push([[x, SC.y - 3], [x, SC.y + 3]], [[SC.x - 3, y], [SC.x + 3, y]]);
  }
  const frame = [closeP([[L, T], [R, T], [R, B], [L, B]])];

  // readout
  const RX = ZX + 30;
  const read = [], lit = [];
  read.push(textG('NOW PLAYING', RX, 40, 2.6));
  read.push(textG('THE THEME, 60 S LOOP', RX, 62, 5.2, 5.6));
  read.push(textG('80 BPM · F MAJOR · 20 BARS OF 3 S · II-V-I-VI', RX, 110, 2.5));
  // chord boxes, the current one lit
  const boxY = 142, boxH = 50;
  let bx = RX;
  const barsOf = (k) => Array.from({ length: 5 }, (_, j) => [j * 12 + k * 3, j * 12 + k * 3 + 3]);
  CH.forEach((c, k) => {
    const w = textW(c.name, 4) + 34;
    const box = [closeP([[bx, boxY], [bx + w, boxY], [bx + w, boxY + boxH], [bx, boxY + boxH]])];
    const inner = [closeP([[bx + 4, boxY + 4], [bx + w - 4, boxY + 4], [bx + w - 4, boxY + boxH - 4], [bx + 4, boxY + boxH - 4]])];
    const label = textD(c.name, bx + 17, boxY + 13, 4, 4);
    const on = windowAnim(barsOf(k));
    read.push(`<g class="dimbox"><path d="${polyD(box)}"/><path d="${label.lines}"/>${label.dots ? `<path class="dot" d="${label.dots}"/>` : ''}</g>`);
    lit.push(`<g class="${on}${k === 0 ? ' lit0' : ''} lit"><path d="${polyD(box)}"/><path d="${polyD(inner)}"/><path d="${label.lines}"/>${label.dots ? `<path class="dot" d="${label.dots}"/>` : ''}</g>`);
    if (k < CH.length - 1) read.push(`<path class="dimbox" d="M${f1(bx + w + 8)} ${boxY + boxH / 2}h18m-6 -6l6 6l-6 6"/>`);
    bx += w + 34;
  });
  // the current chord's figure, spelled out
  CH.forEach((c, k) => {
    const on = windowAnim(barsOf(k));
    lit.push(`<g class="${on}${k === 0 ? ' lit0' : ''} lit">${textG(`X: ROOT   Y: ${c.third}   ${c.ratio}`, RX, 212, 2.7)}</g>`);
  });
  read.push(textG('E-PIANO · KALIMBA · SOFT DRUMS · VINYL CRACKLE', RX, 250, 2.5));
  read.push(textG('EVERY SOUND SYNTHESIZED FROM CODE. NO SAMPLES.', RX, 282, 2.5));
  read.push(textG('DRAWN FROM THE CHORD NAMES, NOT FROM THE FILE.', RX, 318, 2.2, 2.2, ' class="dimbox"'));
  read.push(textG('LISTENERS TO DATE: 0', RX, 340, 2.2, 2.2, ' class="dimbox"'));
  css.push(`.dimbox{opacity:.4}.lit{opacity:0}.lit0{opacity:1}`);

  const style = [
    `.beam{fill:none;stroke:${CORE};stroke-linecap:round;stroke-linejoin:round}`,
    `.h{--w:9px;stroke-width:var(--w);stroke-opacity:.11}`,
    `.m{--w:3.6px;stroke-width:var(--w);stroke-opacity:.3}`,
    `.c{--w:1.45px;stroke-width:var(--w)}`,
    `.dot{stroke-width:calc(var(--w)*1.6)}.fine{stroke-width:calc(var(--w)*.8)}`,
    `.grat{opacity:.22}.tick{opacity:.35}`,
    `.still{display:none}.tint{mix-blend-mode:multiply}`,
    ...css,
    `@media (prefers-reduced-motion:reduce){.live{display:none}.still{display:inline}*{animation:none!important}}`,
  ].join('\n');
  const glow = (id) => `<use href="#${id}" class="h"/><use href="#${id}" class="m"/><use href="#${id}" class="c"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SW} ${SH}" width="${SW}" height="${SH}" role="img" aria-labelledby="t d">
<title id="t">The Castaway theme as an XY trace</title>
<desc id="d">A green oscilloscope trace on a graticule draws the four chords of the theme one bar at a time as closed Lissajous figures: Gm9 and Dm9 at 6:5 (root against minor third), C13 and Fmaj9 at 5:4 (root against major third). Beside it a now-playing readout: the theme, a 60-second loop at 80 BPM in F major, 20 bars of 3 seconds, ii-V-I-vi; electric piano, kalimba, soft drums and vinyl crackle, every sound synthesized from code. Drawn from the chord names, not from the file. Listeners to date: none.</desc>
<style>
${style}
</style>
<defs>
<radialGradient id="tube2" cx="30%" cy="50%" r="80%"><stop offset="0" stop-color="#0b1013"/><stop offset=".7" stop-color="#040607"/><stop offset="1" stop-color="#000"/></radialGradient>
<linearGradient id="bez2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a2f36"/><stop offset=".1" stop-color="#16191e"/><stop offset="1" stop-color="#0d0f12"/></linearGradient>
<clipPath id="tube2Clip"><rect x="${S0}" y="${S0}" width="${S1x - S0}" height="${S1y - S0}" rx="18"/></clipPath>
<g id="SC">
<path class="grat fine" d="${polyD(g)}"/><path class="tick fine" d="${polyD(ticks)}"/><path class="grat" d="${polyD(frame)}"/>
<g class="live">${trace}</g><g class="still">${traceStill}</g>
${read.join('')}${lit.join('')}
</g>
</defs>
<rect width="${SW}" height="${SH}" rx="26" fill="url(#bez2)"/>
<rect x="${S0 - 1.5}" y="${S0 - 1.5}" width="${S1x - S0 + 3}" height="${S1y - S0 + 3}" rx="19.5" fill="none" stroke="#000" stroke-width="3"/>
<g clip-path="url(#tube2Clip)">
<rect x="${S0}" y="${S0}" width="${S1x - S0}" height="${S1y - S0}" fill="url(#tube2)"/>
<g class="beam">${glow('SC')}</g>
<rect class="tint" x="${S0}" y="${S0}" width="${ZX - S0}" height="${S1y - S0}" fill="#7cff9b"/>
<rect class="tint" x="${ZX}" y="${S0}" width="${S1x - ZX}" height="${S1y - S0}" fill="${TINT_C}"/>
<g opacity=".045"><rect x="${S0}" y="${S0}" width="${ZX - S0}" height="${S1y - S0}" fill="#7cff9b"/><rect x="${ZX}" y="${S0}" width="${S1x - ZX}" height="${S1y - S0}" fill="${TINT_C}"/></g>
</g>
<rect x="${S0 + 0.5}" y="${S0 + 0.5}" width="${S1x - S0 - 1}" height="${S1y - S0 - 1}" rx="17.5" fill="none" stroke="#fff" stroke-opacity=".06"/>
</svg>
`;
}

const banner = bannerSVG();
const outPath = OUT || path.join(ASSETS, `${SLUG}.svg`);
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, banner);
console.log(`wrote ${outPath} (${(banner.length / 1024).toFixed(1)} KB)`);
if (!OUT) {
  const scope = scopeSVG();
  const sp = path.join(ASSETS, `${SLUG}-scope.svg`);
  fs.writeFileSync(sp, scope);
  console.log(`wrote ${sp} (${(scope.length / 1024).toFixed(1)} KB)`);
}
