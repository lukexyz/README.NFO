#!/usr/bin/env node
// Synthwave / outrun: README header generator for CASTAWAY.
//
//   node examples/castaway/src/57-synthwave-outrun_opus_5.5.mjs
//
// Writes examples/castaway/assets/57-synthwave-outrun_opus_5.5.svg. Plain
// Node, no dependencies, no clock, no Math.random: the same bytes every run.
// The .md beside the assets is hand-written, not generated.
//
// The style (catalogue entry vap-05) is the late-2000s synthwave poster: a
// dusk sky, a big sun cut by horizontal slits that thicken toward its base,
// a magenta wireframe floor rushing at the viewer, low-poly shapes either
// side of the sun, a heavy italic chrome word with a sky-over-desert
// gradient and a hard horizon line through its middle, a loose neon brush
// word slashed across it, and a glow on everything.
//
// What changed for Castaway:
//   * The floor is the sea. The far shapes either side are low-poly cumulus,
//     not mountains, and the sun has an island parked in front of it: one
//     tall palm, a raft, and her, nodding on every beat.
//   * The project has a rule: it is always daytime. So this sun never sets.
//     Its slits slide down and down as if it is setting, for ever, and it
//     never moves an inch. The side text says so.
//   * The car of the genre is an electric hydrofoil, ridden by a bro who
//     carves across the grid leaving a neon wake and throws a shaka at the
//     island. She is not on it. She has walked out over the water to the
//     vanishing point for an iced coffee. She comes back with one.
//   * The shark in headphones crosses earlier and nods with her, on the beat.
//
// Timing. Everything is a whole number of beats of the 80 BPM theme
// (0.75 s), and the story is one 36 s loop (12 bars of 3 s):
//   grid      one floor line passes per beat, for ever
//   sun       one new slit per bar (3 s), each takes 6 bars to reach the base
//   nod       her head and the shark's, once per beat
//   glint     a shine sweeps the chrome every 2 bars
//    1-11 s   the shark crosses right to left, nodding
//   12-16.5   she walks out toward the sun, stepped, and is gone
//   17-23     the hydrofoil crosses; he waves at the empty island at ~20 s
//   22.5-27   she walks back from the vanishing point with an iced coffee
//   27-36     nodding again
// With prefers-reduced-motion everything holds a complete frame: her by the
// palm with the coffee, the shark mid-sea, all text drawn.
//
// No <text>: the chrome capitals are stroked centrelines drawn here, the
// brush word is a broad-nib sweep of a hand-placed spline, and the small
// tracked capitals are a stroke font defined below. No filters: every glow
// is a wider, fainter copy of the same line. Letterforms, the brush word,
// the figures and the scene are original; nothing is traced from any real
// logo, poster, film title or game.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '57-synthwave-outrun_opus_5.5';
const OUT = path.resolve(here, `../assets/${SLUG}.svg`);

// ------------------------------------------------------------------ canvas
const W = 960;
const H = 420;
const HZ = 244; // horizon
const CX = 480; // vanishing point x
const K = H - HZ; // screen y = HZ + K / z, so z = 1 is the bottom edge
const RS = 116; // sun radius
const BEAT = 0.75;
const BAR = 3;
const LOOP = 36;

// ----------------------------------------------------------------- helpers
const f = (n, d = 1) => {
  const v = +(+n).toFixed(d);
  return Object.is(v, -0) ? '0' : String(v);
};
const f2 = (n) => f(n, 2);
function mulberry32(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function hex(c) { return [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16)); }
function mix(a, b, t) {
  const A = hex(a); const B = hex(b);
  return '#' + A.map((v, i) => Math.round(lerp(v, B[i], t)).toString(16).padStart(2, '0')).join('');
}
function ramp(stops, t) {
  t = clamp(t, 0, 1);
  for (let i = 1; i < stops.length; i++) {
    if (t <= stops[i][0]) {
      const [t0, c0] = stops[i - 1]; const [t1, c1] = stops[i];
      return mix(c0, c1, (t - t0) / (t1 - t0 || 1));
    }
  }
  return stops[stops.length - 1][1];
}
const pct = (t) => `${f((t / LOOP) * 100, 3)}%`;
// keyframes from [seconds, css] pairs over a period
function kf(name, frames, period = LOOP) {
  return `@keyframes ${name}{${frames.map(([t, css]) => `${f((t / period) * 100, 3)}%{${css}}`).join('')}}`;
}
// Compact path data: coordinates rounded to 0.1, then written as relative
// moves with no leading zeros, so long outlines stay small.
const num = (v) => f(v).replace(/^(-?)0\./, '$1.');
function pairs(list) {
  let out = '';
  for (const v of list) {
    const s = num(v);
    out += out && !s.startsWith('-') ? ` ${s}` : s;
  }
  return out;
}
function enc(subs, close) {
  let d = ''; let cx = 0; let cy = 0;
  for (const raw of subs) {
    const pts = raw.map(([x, y]) => [+f(x), +f(y)]);
    if (!pts.length) continue;
    const [x0, y0] = pts[0];
    d += d ? `m${pairs([x0 - cx, y0 - cy])}` : `M${pairs([x0, y0])}`;
    const rel = [];
    for (let i = 1; i < pts.length; i++) rel.push(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    if (rel.length) d += `l${pairs(rel)}`;
    if (close) { d += 'z'; cx = x0; cy = y0; } else { [cx, cy] = pts[pts.length - 1]; }
  }
  return d;
}
const poly = (pts) => enc([pts], true);
const line = (pts) => enc([pts], false);

// ------------------------------------------------------------- stroke font
// Small tracked capitals: a 4 x 6 grid, chamfered corners, drawn as strokes.
const FONT = {
  A: [[[0, 6], [0, 1], [1, 0], [3, 0], [4, 1], [4, 6]], [[0, 3.4], [4, 3.4]]],
  B: [[[0, 0], [3, 0], [4, 1], [4, 2], [3, 3], [0, 3]], [[3, 3], [4, 4], [4, 5], [3, 6], [0, 6], [0, 0]]],
  C: [[[4, 1], [3, 0], [1, 0], [0, 1], [0, 5], [1, 6], [3, 6], [4, 5]]],
  D: [[[0, 0], [3, 0], [4, 1], [4, 5], [3, 6], [0, 6], [0, 0]]],
  E: [[[4, 0], [0, 0], [0, 6], [4, 6]], [[0, 3], [3, 3]]],
  F: [[[4, 0], [0, 0], [0, 6]], [[0, 3], [3, 3]]],
  G: [[[4, 1], [3, 0], [1, 0], [0, 1], [0, 5], [1, 6], [3, 6], [4, 5], [4, 3.2], [2.2, 3.2]]],
  H: [[[0, 0], [0, 6]], [[4, 0], [4, 6]], [[0, 3], [4, 3]]],
  I: [[[1, 0], [3, 0]], [[2, 0], [2, 6]], [[1, 6], [3, 6]]],
  J: [[[4, 0], [4, 5], [3, 6], [1, 6], [0, 5]]],
  K: [[[0, 0], [0, 6]], [[4, 0], [1, 3], [0, 3]], [[1, 3], [4, 6]]],
  L: [[[0, 0], [0, 6], [4, 6]]],
  M: [[[0, 6], [0, 0], [2, 2.6], [4, 0], [4, 6]]],
  N: [[[0, 6], [0, 0], [4, 6], [4, 0]]],
  O: [[[1, 0], [3, 0], [4, 1], [4, 5], [3, 6], [1, 6], [0, 5], [0, 1], [1, 0]]],
  P: [[[0, 6], [0, 0], [3, 0], [4, 1], [4, 2], [3, 3], [0, 3]]],
  R: [[[0, 6], [0, 0], [3, 0], [4, 1], [4, 2], [3, 3], [0, 3]], [[2, 3], [4, 6]]],
  S: [[[4, 1], [3, 0], [1, 0], [0, 1], [0, 2], [1, 3], [3, 3], [4, 4], [4, 5], [3, 6], [1, 6], [0, 5]]],
  T: [[[0, 0], [4, 0]], [[2, 0], [2, 6]]],
  U: [[[0, 0], [0, 5], [1, 6], [3, 6], [4, 5], [4, 0]]],
  V: [[[0, 0], [0, 3], [2, 6], [4, 3], [4, 0]]],
  W: [[[0, 0], [0, 6], [2, 4], [4, 6], [4, 0]]],
  X: [[[0, 0], [4, 6]], [[4, 0], [0, 6]]],
  Y: [[[0, 0], [2, 3], [4, 0]], [[2, 3], [2, 6]]],
  Z: [[[0, 0], [4, 0], [0, 6], [4, 6]]],
  0: [[[1, 0], [3, 0], [4, 1], [4, 5], [3, 6], [1, 6], [0, 5], [0, 1], [1, 0]], [[3.2, 1.2], [0.8, 4.8]]],
  1: [[[0.8, 1.2], [2, 0], [2, 6]], [[0.8, 6], [3.2, 6]]],
  2: [[[0, 1], [1, 0], [3, 0], [4, 1], [4, 2], [0, 6], [4, 6]]],
  3: [[[0, 0], [4, 0], [2, 2.4], [3, 2.4], [4, 3.4], [4, 5], [3, 6], [1, 6], [0, 5]]],
  4: [[[3, 6], [3, 0], [0, 4], [4, 4]]],
  5: [[[4, 0], [0, 0], [0, 3], [3, 3], [4, 4], [4, 5], [3, 6], [0, 6]]],
  6: [[[3, 0], [1, 0], [0, 1], [0, 5], [1, 6], [3, 6], [4, 5], [4, 4], [3, 3], [0, 3]]],
  7: [[[0, 0], [4, 0], [4, 1], [1.4, 6]]],
  8: [[[1, 3], [0, 2], [0, 1], [1, 0], [3, 0], [4, 1], [4, 2], [3, 3], [1, 3], [0, 4], [0, 5], [1, 6], [3, 6], [4, 5], [4, 4], [3, 3]]],
  9: [[[4, 3], [1, 3], [0, 2], [0, 1], [1, 0], [3, 0], [4, 1], [4, 5], [3, 6], [1, 6]]],
  '.': [[[2, 6], [2, 6]]],
  ':': [[[2, 1.8], [2, 1.8]], [[2, 5.2], [2, 5.2]]],
  '·': [[[2, 3], [2, 3]]],
  '-': [[[1, 3], [3, 3]]],
  '+': [[[2, 1.2], [2, 4.8]], [[0.2, 3], [3.8, 3]]],
  '/': [[[0.4, 6], [3.6, 0]]],
  ',': [[[2.2, 5.4], [1.4, 7]]],
  ' ': [],
};
// d for a line of tracked capitals. size = cap height in px.
function fontD(str, x, y, size, track = 3, align = 'left') {
  const s = size / 6;
  const adv = (4 + track) * s;
  const width = str.length * adv - track * s;
  let x0 = align === 'left' ? x : align === 'right' ? x - width : x - width / 2;
  let d = '';
  for (const ch of str) {
    const g = FONT[ch];
    if (!g) throw new Error(`no glyph for "${ch}"`);
    for (const st of g) {
      d += `M${st.map((p) => `${f(x0 + p[0] * s)} ${f(y + p[1] * s)}`).join('L')}`;
      if (st.length === 2 && st[0][0] === st[1][0] && st[0][1] === st[1][1]) d += 'h0.01';
    }
    x0 += adv;
  }
  return { d, width };
}

// ------------------------------------------------------------ chrome word
// Heavy rounded-square capitals as stroked centrelines (SW wide, LH tall).
// Commands: ['M',x,y] ['H',x] ['V',y] ['A',r,sweep,x,y]. Every stroke starts
// and ends on a straight piece, so the outline copy can stretch its ends.
const SW = 18;
const LH = 84;
const LET = {
  C: { w: 72, s: [[['M', 70, 9], ['H', 31], ['A', 22, 0, 9, 31], ['V', 53], ['A', 22, 0, 31, 75], ['H', 70]]] },
  A: { w: 72, s: [[['M', 9, 84], ['V', 31], ['A', 22, 1, 31, 9], ['H', 41], ['A', 22, 1, 63, 31], ['V', 84]], [['M', 9, 52], ['H', 63]]] },
  S: { w: 72, s: [[['M', 70, 9], ['H', 25.5], ['A', 16.5, 0, 9, 25.5], ['A', 16.5, 0, 25.5, 42], ['H', 46.5], ['A', 16.5, 1, 63, 58.5], ['A', 16.5, 1, 46.5, 75], ['H', 2]]] },
  T: { w: 72, s: [[['M', 0, 9], ['H', 72]], [['M', 36, 9], ['V', 84]]] },
  W: { w: 96, s: [[['M', 9, 0], ['V', 53], ['A', 22, 0, 31, 75], ['H', 65], ['A', 22, 0, 87, 53], ['V', 0]], [['M', 48, 26], ['V', 75]]] },
  Y: { w: 72, s: [[['M', 9, 0], ['V', 26], ['A', 22, 0, 31, 48], ['H', 41], ['A', 22, 0, 63, 26], ['V', 0]], [['M', 36, 48], ['V', 84]]] },
};
function letterD(ch, ox, ext = 0) {
  let d = '';
  for (const st of LET[ch].s) {
    // resolve to absolute points so the ends can be pushed out by `ext`
    const cmds = st.map((c) => [...c]);
    let px = 0; let py = 0;
    const pos = [];
    for (const c of cmds) {
      if (c[0] === 'M') { px = c[1]; py = c[2]; } else if (c[0] === 'H') px = c[1];
      else if (c[0] === 'V') py = c[1]; else { px = c[3]; py = c[4]; }
      pos.push([px, py]);
    }
    if (ext) {
      const [x0, y0] = pos[0]; const [x1, y1] = pos[1];
      const l0 = Math.hypot(x1 - x0, y1 - y0);
      cmds[0][1] = x0 - ((x1 - x0) / l0) * ext; cmds[0][2] = y0 - ((y1 - y0) / l0) * ext;
      const n = pos.length - 1;
      const [xa, ya] = pos[n - 1]; const [xb, yb] = pos[n];
      const l1 = Math.hypot(xb - xa, yb - ya);
      const last = cmds[n];
      if (last[0] === 'H') last[1] = xb + ((xb - xa) / l1) * ext;
      if (last[0] === 'V') last[1] = yb + ((yb - ya) / l1) * ext;
    }
    for (const c of cmds) {
      if (c[0] === 'M') d += `M${f(c[1] + ox)} ${f(c[2])}`;
      else if (c[0] === 'H') d += `H${f(c[1] + ox)}`;
      else if (c[0] === 'V') d += `V${f(c[1])}`;
      else d += `A${c[1]} ${c[1]} 0 0 ${c[2]} ${f(c[3] + ox)} ${f(c[4])}`;
    }
  }
  return d;
}
const WORD = 'CASTAWAY';
const GAP = 13;
const wordW = [...WORD].reduce((a, ch) => a + LET[ch].w, 0) + GAP * (WORD.length - 1);
const LOGO_Y = 30;
const SKEW = -13;
const SKEW_T = Math.tan((SKEW * Math.PI) / 180);
// centre the slanted word: the skew moves the bottom left by LH * tan
const LOGO_X = Math.round((W - wordW) / 2 - (SKEW_T * LH) / 2);
let faceD = ''; let outD = '';
{
  let ox = 0;
  for (const ch of WORD) {
    faceD += letterD(ch, ox);
    outD += letterD(ch, ox, 2.4);
    ox += LET[ch].w + GAP;
  }
}
// logo-space point -> screen point
const logoPt = (x, y) => [LOGO_X + x + SKEW_T * y, LOGO_Y + y];

// ------------------------------------------------------------- brush word
// "golden hours" as hand-placed spline points (x-height 10, baseline 0,
// y down). 'c' marks a sharp turn. Four pen strokes.
const BRUSH = [
  [ // g o l
    [7, -8.5], [5, -10], [2, -9], [0.3, -6], [0.6, -2], [2.6, 0], [5.2, -1.2], [7.2, -5], [7.8, -10, 'c'],
    [7.3, -4], [6.6, 3], [5.4, 7.8], [3, 10.4], [0.8, 9.4], [1.2, 6.4], [4.4, 3.6], [8.6, 1.2], [12.2, -2.6],
    [16.4, -9.4, 'c'], [14.5, -10.2], [12.6, -8.6], [12, -5], [12.8, -1.2], [15, 0], [17.3, -1.8], [18.2, -5.5],
    [17.6, -9], [15.8, -10.2], [15.2, -9], [16.6, -8.2], [19, -8.6], [21, -9.6],
    [23.4, -13], [25.4, -18], [25.5, -21.4], [24.4, -22.6], [23, -21.4], [22.2, -17], [21.8, -10], [22, -3.5],
    [23.2, -0.2], [25.4, -0.6], [27, -2.6],
  ],
  [ // d e n
    [32, -8.6], [30, -10.1], [27.6, -8.8], [26.6, -5], [27.2, -1.2], [29.4, 0], [31.6, -2.4], [32.6, -7],
    [33.6, -22.5, 'c'], [33, -14], [32.6, -5], [33.2, -0.8], [35, -0.4], [37, -2.5],
    [39.8, -4.6], [42, -7.2], [42, -9.4], [40.6, -10.2], [38.6, -9], [37.8, -5.5], [38.6, -1.4], [41, 0],
    [43.6, -1.6], [44.8, -3.4],
    [46.2, -8.4], [46.6, -10, 'c'], [46.2, -5], [46, 0, 'c'], [47, -5.4], [48.8, -9], [51, -10], [52.6, -8.4],
    [52.6, -4], [52.6, -1], [54, 0.2], [56.4, -1.2], [58.4, -3.6],
  ],
  [ // h
    [62, -1.5], [64.5, -7], [67, -15], [67.6, -20.5], [66.8, -22.6], [65.2, -21.8], [64.4, -17], [64, -9],
    [63.8, 0, 'c'], [64.8, -5.6], [66.8, -9.2], [69, -10], [70.6, -8.6], [70.6, -4], [70.7, -1], [72.2, 0.2],
    [74.2, -1.8],
  ],
  [ // o u r s
    [78.9, -8.4], [77, -10.2], [74.6, -9], [73.5, -5], [74.3, -1.2], [76.5, 0], [78.8, -1.8],
    [79.7, -5.5], [79.1, -9], [77.3, -10.2], [76.7, -9], [78.1, -8.2], [80.5, -8.6], [82.4, -9.8],
    [83.4, -10, 'c'], [83, -4.5], [83.8, -0.6], [86, 0], [88.2, -2.2], [89.4, -6], [89.8, -10, 'c'], [89.4, -4.5],
    [89.8, -1], [91.2, 0.1], [93.2, -1.4],
    [94.8, -6], [95.8, -10, 'c'], [97.6, -9.2], [98.8, -9.8, 'c'], [98.6, -6], [99.2, -1.6], [100.6, 0],
    [102.6, -1.4], [104.2, -4], [105.8, -10.6, 'c'], [107.6, -6.2], [107.8, -2.6], [106.4, -0.2], [104, -0.4],
    [102.6, -1.6], [101.4, -1.2], [100.2, 0.6],
  ],
];
const BR = { scale: 3.15, slant: 0.34, rot: -5, x: 438, y: 151, nib: 38, half: 1.55 };
function brushToScreen([x, y]) {
  const xs = (x - y * BR.slant) * BR.scale; const ys = y * BR.scale;
  const a = (BR.rot * Math.PI) / 180;
  return [BR.x + xs * Math.cos(a) - ys * Math.sin(a), BR.y + xs * Math.sin(a) + ys * Math.cos(a)];
}
// Catmull-Rom through the points, split at corners
function strokeSamples(pts) {
  const runs = [];
  let cur = [];
  pts.forEach((p, i) => {
    cur.push(p);
    if (p[2] === 'c' && i > 0 && i < pts.length - 1) { runs.push(cur); cur = [p]; }
  });
  runs.push(cur);
  const out = [];
  for (const run of runs) {
    const P = run.map(brushToScreen);
    const n = P.length;
    for (let i = 0; i < n - 1; i++) {
      const p0 = P[Math.max(0, i - 1)]; const p1 = P[i]; const p2 = P[i + 1]; const p3 = P[Math.min(n - 1, i + 2)];
      const m1 = i === 0 ? [p2[0] - p1[0], p2[1] - p1[1]] : [(p2[0] - p0[0]) / 2, (p2[1] - p0[1]) / 2];
      const m2 = i + 1 === n - 1 ? [p2[0] - p1[0], p2[1] - p1[1]] : [(p3[0] - p1[0]) / 2, (p3[1] - p1[1]) / 2];
      const len = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
      const steps = Math.max(2, Math.ceil(len / 2.2));
      for (let s = out.length && i === 0 ? 1 : (i === 0 ? 0 : 1); s <= steps; s++) {
        const t = s / steps; const t2 = t * t; const t3 = t2 * t;
        const h00 = 2 * t3 - 3 * t2 + 1; const h10 = t3 - 2 * t2 + t; const h01 = -2 * t3 + 3 * t2; const h11 = t3 - t2;
        out.push([h00 * p1[0] + h10 * m1[0] + h01 * p2[0] + h11 * m2[0], h00 * p1[1] + h10 * m1[1] + h01 * p2[1] + h11 * m2[1]]);
      }
    }
  }
  return out;
}
// broad-nib sweep: one polygon per stretch where the nib keeps its handedness
function brushD(samples) {
  let L = 0; const acc = [0];
  for (let i = 1; i < samples.length; i++) { L += Math.hypot(samples[i][0] - samples[i - 1][0], samples[i][1] - samples[i - 1][1]); acc.push(L); }
  const a = (BR.nib * Math.PI) / 180;
  const nib = samples.map((p, i) => {
    const u = acc[i] / L;
    const press = 0.28 + 0.72 * Math.min(1, (u / 0.05) ** 0.7) * Math.min(1, ((1 - u) / 0.1) ** 0.8);
    const h = BR.half * BR.scale * press;
    return [Math.cos(a) * h, -Math.sin(a) * h];
  });
  let d = '';
  let run = [0];
  let sign = 0;
  const flush = () => {
    if (run.length < 2) return;
    const left = run.map((i) => [samples[i][0] + nib[i][0], samples[i][1] + nib[i][1]]);
    const right = run.map((i) => [samples[i][0] - nib[i][0], samples[i][1] - nib[i][1]]).reverse();
    let pts = left.concat(right);
    let area = 0;
    for (let i = 0; i < pts.length; i++) { const p = pts[i]; const q = pts[(i + 1) % pts.length]; area += p[0] * q[1] - q[0] * p[1]; }
    if (area < 0) pts = pts.reverse();
    d += poly(pts);
  };
  for (let i = 1; i < samples.length; i++) {
    const dx = samples[i][0] - samples[i - 1][0]; const dy = samples[i][1] - samples[i - 1][1];
    const cr = dx * nib[i][1] - dy * nib[i][0];
    const sg = cr >= 0 ? 1 : -1;
    if (sign && sg !== sign) { flush(); run = [i - 1]; }
    sign = sg;
    run.push(i);
  }
  flush();
  return d;
}
const brushStrokes = BRUSH.map(strokeSamples);
const brushFill = brushStrokes.map(brushD).join('');
const brushLine = brushStrokes.map(line).join('');

// ---------------------------------------------------------------- the sky
const rnd = mulberry32(1992);
const parts = [];
const css = [];
const P = (s) => parts.push(s);

// low-poly cumulus banks either side of the sun, in place of mountains.
// puffs: [centre x, radius, centre height above the horizon]. The outline is
// the top of the union of the puffs; inside, coarser rows are zipped into
// big triangles. Lit from below and from the sun's side, as sunset clouds are.
function cloudBank(x0, x1, puffs, seed, base = HZ - 6) {
  const r = mulberry32(seed);
  const hAt = (x) => {
    let h = -1;
    for (const [c, rad, hb] of puffs) {
      const u = x - c;
      if (Math.abs(u) < rad) h = Math.max(h, hb + Math.sqrt(rad * rad - u * u));
    }
    return h;
  };
  const topY = (x) => Math.min(base, HZ - hAt(x));
  // find where the bank starts and ends (top above the base)
  let xa = x0; while (xa < x1 && topY(xa) >= base - 0.3) xa += 0.5;
  let xb = x1; while (xb > xa && topY(xb) >= base - 0.3) xb -= 0.5;
  const row = (step, frac, jit) => {
    const n = Math.max(1, Math.round((xb - xa) / step));
    const out = [];
    for (let i = 0; i <= n; i++) {
      const edge = i === 0 || i === n;
      const x = lerp(xa, xb, i / n) + (edge ? 0 : (r() - 0.5) * step * 0.4);
      const ty = topY(x);
      out.push([x, edge ? base : lerp(ty, base, frac) + (edge ? 0 : (r() - 0.5) * jit)]);
    }
    return out;
  };
  const top = row(5, 0, 0);
  const mid = row(17, 0.42, 4);
  const low = row(29, 0.78, 3);
  const bot = row(46, 1, 0);
  const tris = [];
  const zip = (A, B) => {
    let i = 0; let j = 0;
    while (i < A.length - 1 || j < B.length - 1) {
      if (j === B.length - 1 || (i < A.length - 1 && A[i + 1][0] <= B[j + 1][0])) { tris.push([A[i], A[i + 1], B[j]]); i++; } else { tris.push([A[i], B[j], B[j + 1]]); j++; }
    }
  };
  zip(top, mid); zip(mid, low); zip(low, bot);
  const maxH = base - Math.min(...top.map((p) => p[1]));
  const pal = [[0, '#3c2266'], [0.25, '#6e3c8e'], [0.5, '#b35c9e'], [0.72, '#f08aa6'], [0.88, '#ffb89c'], [1, '#ffe4c8']];
  const byCol = new Map();
  for (const t of tris) {
    const cx = (t[0][0] + t[1][0] + t[2][0]) / 3; const cy = (t[0][1] + t[1][1] + t[2][1]) / 3;
    // facing: which way the triangle's upper edge slopes, against the sun's side
    const [p, q] = [...t].sort((m, n) => m[1] - n[1]);
    const sl = (q[1] - p[1]) / ((q[0] - p[0]) || 0.01);
    const toward = Math.sign(CX - cx);
    const face = clamp(0.5 + Math.atan(sl * toward * (q[0] > p[0] ? 1 : -1)) * 0.35, 0, 1);
    const rel = clamp((base - cy) / maxH, 0, 1);
    const near = clamp(1 - Math.abs(cx - CX) / 470, 0, 1);
    const v = 0.26 + 0.52 * near * (1 - rel) ** 1.2 + 0.28 * (face - 0.5) + 0.14 * rel + (r() - 0.5) * 0.08;
    const k = Math.round(clamp(v, 0, 1) * 16);
    if (!byCol.has(k)) byCol.set(k, []);
    byCol.get(k).push(t);
  }
  let s = '';
  for (const [k, list] of [...byCol.entries()].sort((m, n) => m[0] - n[0])) s += `<path d="${enc(list, true)}" fill="${ramp(pal, k / 16)}"/>`;
  return { s, outline: top.slice(1, -1), wire: enc(tris, true) };
}

// ------------------------------------------------------------- the figure
// Her, as flat shapes with a dark outline. Units: about 1 px at the island,
// feet at (0, 0), y up is negative. Coral tank top, cream shorts, cream
// headphones, brown hair in a low bun, bare feet.
const C_SKIN = '#e9a582';
const C_HAIR = '#4b2a1d';
const C_TANK = '#ff7462';
const C_SHORT = '#f3e4c6';
const C_PHONE = '#fff3dc';
const C_INK = '#1c0a24';
const C_CUP = '#e8d9c8';
const C_COFFEE = '#8a4b2b';
// primitives: ['p', pts, fill] polygon; ['e', cx, cy, rx, ry, fill]; ['l', pts, w, colour] line
function drawPrims(prims, outlineW = 1.1) {
  let ol = ''; let fill = '';
  for (const pr of prims) {
    if (pr[0] === 'p') {
      ol += `<path d="${poly(pr[1])}"/>`;
      fill += `<path d="${poly(pr[1])}" fill="${pr[2]}"/>`;
    } else if (pr[0] === 'e') {
      ol += `<ellipse cx="${f(pr[1])}" cy="${f(pr[2])}" rx="${f(pr[3])}" ry="${f(pr[4])}"/>`;
      fill += `<ellipse cx="${f(pr[1])}" cy="${f(pr[2])}" rx="${f(pr[3])}" ry="${f(pr[4])}" fill="${pr[5]}"/>`;
    } else if (pr[0] === 'l') {
      ol += `<path d="${line(pr[1])}" fill="none" stroke-width="${f(pr[2] + outlineW, 2)}"/>`;
      fill += `<path d="${line(pr[1])}" fill="none" stroke="${pr[3]}" stroke-width="${f(pr[2], 2)}"/>`;
    } else if (pr[0] === 'c') { // curve (raw d) stroked
      ol += `<path d="${pr[1]}" fill="none" stroke-width="${f(pr[2] + outlineW, 2)}"/>`;
      fill += `<path d="${pr[1]}" fill="none" stroke="${pr[3]}" stroke-width="${f(pr[2], 2)}"/>`;
    }
  }
  return `<g class="ink" stroke-width="${outlineW}">${ol}</g><g stroke-linecap="round" stroke-linejoin="round">${fill}</g>`;
}
function legs(frame) {
  // frame 0 standing, 1 left foot up, 2 right foot up
  const lf = frame === 1 ? [-1.5, -1.6] : [-1.8, -0.6];
  const rf = frame === 2 ? [1.5, -1.6] : [1.8, -0.6];
  const lk = frame === 1 ? [-1.3, -7.4] : [-1.7, -7];
  const rk = frame === 2 ? [1.3, -7.4] : [1.7, -7];
  return [
    ['l', [[-1.6, -13.5], lk, lf], 2.1, C_SKIN],
    ['l', [[1.6, -13.5], rk, rf], 2.1, C_SKIN],
    ['e', lf[0] - 0.2, lf[1] + 0.2, 1.3, 0.6, C_SKIN],
    ['e', rf[0] + 0.2, rf[1] + 0.2, 1.3, 0.6, C_SKIN],
  ];
}
const SHORTS = ['p', [[-3.6, -18.6], [3.6, -18.6], [4, -12.4], [0.5, -12.4], [0, -13.8], [-0.5, -12.4], [-4, -12.4]], C_SHORT];
const TANK = ['p', [[-3.3, -26.6], [-2.2, -27.4], [-1.2, -26.4], [1.2, -26.4], [2.2, -27.4], [3.3, -26.6], [3.6, -18.2], [-3.6, -18.2]], C_TANK];
const NECK = ['p', [[-0.9, -29.4], [0.9, -29.4], [1, -26.6], [-1, -26.6]], C_SKIN];
const SHOULDERS = ['p', [[-3.6, -26.4], [-2.4, -27.6], [2.4, -27.6], [3.6, -26.4], [3.4, -25], [-3.4, -25]], C_SKIN];
function cup(x, y, tilt = 0) {
  // iced coffee: clear cup, coffee, lid line, straw. (x, y) = bottom centre
  const a = (tilt * Math.PI) / 180; const ca = Math.cos(a); const sa = Math.sin(a);
  const T = (px, py) => [x + px * ca - py * sa, y + px * sa + py * ca];
  return [
    ['p', [T(-1.2, 0), T(1.2, 0), T(1.5, -3.8), T(-1.5, -3.8)], C_CUP],
    ['p', [T(-1.05, -0.3), T(1.05, -0.3), T(1.3, -2.9), T(-1.3, -2.9)], C_COFFEE],
    ['l', [T(0.5, -3.8), T(1.1, -6)], 0.55, '#ff4fa3'],
  ];
}
function headFront() {
  return [
    ['e', 2.6, -30.4, 1.5, 1.5, C_HAIR], // the low bun, peeking out at the side
    ['e', 0, -32.4, 3.2, 3.5, C_SKIN],
    ['p', [[-3.3, -32.2], [-3.1, -34.6], [-1.6, -36], [0.6, -36.2], [2.6, -35.2], [3.4, -33], [3.3, -31.4], [2.2, -33.6], [0.2, -34.2], [-1.8, -33.6], [-2.6, -32.8], [-2.9, -30.8]], C_HAIR],
    ['l', [[-1.5, -32], [-0.6, -32]], 0.45, C_INK], // eyes closed, enjoying it
    ['l', [[0.6, -32], [1.5, -32]], 0.45, C_INK],
    ['c', 'M-3.5 -33.2C-3.9 -38.6 3.9 -38.6 3.5 -33.2', 0.9, C_PHONE],
    ['p', [[-4.6, -34], [-3, -34], [-3, -30.6], [-4.6, -30.6]], C_PHONE],
    ['p', [[3, -34], [4.6, -34], [4.6, -30.6], [3, -30.6]], C_PHONE],
  ];
}
function headBack() {
  return [
    ['e', 0, -32.4, 3.2, 3.5, C_HAIR],
    ['e', 0, -29.6, 1.7, 1.5, '#5a3323'], // the bun
    ['c', 'M-3.5 -33.2C-3.9 -38.6 3.9 -38.6 3.5 -33.2', 0.9, C_PHONE],
    ['p', [[-4.6, -34], [-3, -34], [-3, -30.6], [-4.6, -30.6]], C_PHONE],
    ['p', [[3, -34], [4.6, -34], [4.6, -30.6], [3, -30.6]], C_PHONE],
  ];
}
// idle, front view: body + nodding head; `sip` raises the cup
function herIdle(sip) {
  const arms = sip
    ? [['l', [[-3.2, -26], [-4.2, -21.5], [-4.4, -17.6]], 1.7, C_SKIN], ['l', [[3.2, -26], [5.2, -22.6], [2.2, -27.8]], 1.7, C_SKIN]]
    : [['l', [[-3.2, -26], [-4.2, -21.5], [-4.4, -17.6]], 1.7, C_SKIN], ['l', [[3.2, -26], [4.9, -21.6], [4.6, -19.4]], 1.7, C_SKIN]];
  const body = [...legs(0), SHORTS, SHOULDERS, TANK, NECK, ...arms];
  const head = headFront();
  const c = sip ? cup(1.4, -27.6, -18) : cup(5, -17.6, 0);
  return { body: drawPrims(body), head: drawPrims(head), cup: drawPrims(c) };
}
function herWalk(back, frame) {
  const swing = frame === 1 ? 0.8 : -0.8;
  const arms = [
    ['l', [[-3.2, -26], [-4.2 - swing * 0.3, -21.5], [-4.3 - swing * 0.5, -17.8 + swing]], 1.7, C_SKIN],
    ['l', [[3.2, -26], [4.6, -21.6], [4.8, -19.2 - swing * 0.4]], 1.7, C_SKIN],
  ];
  // seen from behind, the coffee hand is on the other side of the picture
  const hand = [...arms, ...cup(5.1, -17.4 - swing * 0.4, 0)];
  const flip = (pr) => (pr[0] === 'p' ? ['p', pr[1].map(([x, y]) => [-x, y]), pr[2]] : pr[0] === 'l' ? ['l', pr[1].map(([x, y]) => [-x, y]), pr[2], pr[3]] : pr);
  const prims = [...legs(frame), SHORTS, SHOULDERS, TANK, NECK, ...(back ? hand.map(flip) : hand), ...(back ? headBack() : headFront())];
  return drawPrims(prims);
}

// -------------------------------------------------------------- assemble
const defs = [];
// sky
defs.push(`<linearGradient id="sky" x1="0" y1="0" x2="0" y2="${HZ}" gradientUnits="userSpaceOnUse">
<stop offset="0" stop-color="#1c1240"/><stop offset=".34" stop-color="#3a2163"/><stop offset=".62" stop-color="#7d2a77"/>
<stop offset=".84" stop-color="#d9477c"/><stop offset="1" stop-color="#ff8f5a"/></linearGradient>`);
defs.push(`<radialGradient id="sunglow" cx="${CX}" cy="${HZ}" r="300" gradientUnits="userSpaceOnUse">
<stop offset="0" stop-color="#ffb070" stop-opacity=".75"/><stop offset=".4" stop-color="#ff5d8f" stop-opacity=".32"/><stop offset="1" stop-color="#ff3d9a" stop-opacity="0"/></radialGradient>`);
defs.push(`<linearGradient id="sun" x1="0" y1="${HZ - RS}" x2="0" y2="${HZ}" gradientUnits="userSpaceOnUse">
<stop offset="0" stop-color="#fff38a"/><stop offset=".38" stop-color="#ffc443"/><stop offset=".7" stop-color="#ff8a3d"/><stop offset="1" stop-color="#ff3f7e"/></linearGradient>`);
defs.push(`<linearGradient id="floor" x1="0" y1="${HZ}" x2="0" y2="${H}" gradientUnits="userSpaceOnUse">
<stop offset="0" stop-color="#3b1050"/><stop offset=".35" stop-color="#1d0a33"/><stop offset="1" stop-color="#0b0418"/></linearGradient>`);
defs.push(`<linearGradient id="haze" x1="0" y1="${HZ}" x2="0" y2="${HZ + 52}" gradientUnits="userSpaceOnUse">
<stop offset="0" stop-color="#ff6d95" stop-opacity=".85"/><stop offset=".3" stop-color="#d23a8a" stop-opacity=".4"/><stop offset="1" stop-color="#7a1e78" stop-opacity="0"/></linearGradient>`);
defs.push(`<linearGradient id="foot" x1="0" y1="350" x2="0" y2="${H}" gradientUnits="userSpaceOnUse">
<stop offset="0" stop-color="#0b0418" stop-opacity="0"/><stop offset=".6" stop-color="#0b0418" stop-opacity=".78"/><stop offset="1" stop-color="#0b0418" stop-opacity=".92"/></linearGradient>`);
defs.push(`<linearGradient id="chrome" x1="0" y1="0" x2="0" y2="${LH}" gradientUnits="userSpaceOnUse">
<stop offset="0" stop-color="#2d4fc4"/><stop offset=".18" stop-color="#5aa6ff"/><stop offset=".4" stop-color="#c8ecff"/><stop offset=".5" stop-color="#ffffff"/>
<stop offset=".5" stop-color="#2a0d33"/><stop offset=".57" stop-color="#5c1f30"/><stop offset=".7" stop-color="#b5471f"/><stop offset=".86" stop-color="#ffa53a"/><stop offset="1" stop-color="#fff0a8"/></linearGradient>`);
defs.push(`<linearGradient id="shine" x1="0" y1="0" x2="1" y2="0">
<stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".95"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`);
defs.push(`<linearGradient id="isl" x1="0" y1="258" x2="0" y2="280" gradientUnits="userSpaceOnUse">
<stop offset="0" stop-color="#3a1840"/><stop offset="1" stop-color="#160920"/></linearGradient>`);
defs.push(`<clipPath id="panel"><rect width="${W}" height="${H}" rx="18"/></clipPath>`);
defs.push('<clipPath id="water"><rect x="-60" y="-80" width="120" height="80.4"/></clipPath>');

// sun slits: a mask of black bars that slide down and thicken, one per bar
const SLITS = 6;
const SL_T = SLITS * BAR;
const slitY = (u) => lerp(HZ - RS * 0.6, HZ + 1, u);
const slitH = (u) => 0.4 + 9.5 * u ** 1.55;
{
  const fr = [];
  for (let i = 0; i <= 24; i++) {
    const u = i / 24;
    fr.push([u * SL_T, `transform:translate(0px,${f(slitY(u))}px) scale(1,${f2(slitH(u))})`]);
  }
  css.push(kf('sl', fr, SL_T));
  let m = `<mask id="sunm" maskUnits="userSpaceOnUse" x="${CX - RS - 4}" y="${HZ - RS - 4}" width="${2 * RS + 8}" height="${RS + 8}"><rect x="${CX - RS - 4}" y="${HZ - RS - 4}" width="${2 * RS + 8}" height="${RS + 8}" fill="#fff"/>`;
  for (let k = 0; k < SLITS; k++) {
    const u = k / SLITS;
    m += `<rect class="sl" x="${CX - RS - 2}" y="-.5" width="${2 * RS + 4}" height="1" fill="#000" transform="translate(0 ${f(slitY(u))}) scale(1 ${f2(slitH(u))})" style="animation-delay:-${f2(u * SL_T)}s"/>`;
  }
  m += '</mask>';
  defs.push(m);
}

P(`<rect width="${W}" height="${HZ + 1}" fill="url(#sky)"/>`);
P(`<rect width="${W}" height="${HZ + 1}" fill="url(#sunglow)"/>`);
P(`<path d="M${CX - RS} ${HZ}A${RS} ${RS} 0 0 1 ${CX + RS} ${HZ}Z" fill="url(#sun)" mask="url(#sunm)"/>`);

// cloud banks
const leftBank = cloudBank(-30, 340, [[-14, 34, 14], [26, 28, 22], [62, 32, 16], [98, 24, 34], [130, 28, 18], [164, 22, 18], [196, 19, 10], [227, 16, 5], [256, 13, 0], [283, 10, -3], [305, 8, -4]], 11);
const rightBank = cloudBank(620, 990, [[655, 8, -4], [677, 10, -3], [704, 13, 0], [733, 16, 5], [764, 19, 10], [796, 22, 18], [830, 28, 18], [862, 24, 34], [898, 32, 16], [934, 28, 22], [974, 34, 14]], 23);
P(`<g>${leftBank.s}${rightBank.s}</g>`);
P(`<path d="${leftBank.wire}${rightBank.wire}" fill="none" stroke="#ffb3e6" stroke-opacity=".22" stroke-width=".5"/>`);
P(`<path d="${line(leftBank.outline)}${line(rightBank.outline)}" fill="none" stroke="#ffd8c0" stroke-opacity=".8" stroke-width="1" stroke-linejoin="round"/>`);

// side text: tracked capitals either side of the sun
{
  const L1 = fontD('TEN HOURS ON', 40, 152, 9, 3.2);
  const L2 = fontD('ONE TINY ISLAND', 40, 168, 9, 3.2);
  const R1 = fontD('THE SUN IS NOT', 920, 152, 9, 3.2, 'right');
  const R2 = fontD('ALLOWED TO SET', 920, 168, 9, 3.2, 'right');
  defs.push(`<path id="side" d="${L1.d + L2.d + R1.d + R2.d}"/>`);
  P('<g fill="none" stroke-linecap="round" stroke-linejoin="round"><use href="#side" stroke="#36f9f6" stroke-opacity=".25" stroke-width="3.4"/><use href="#side" stroke="#c9fffd" stroke-width="1.25"/></g>');
}

// ---------------------------------------------------------------- the sea
P(`<rect y="${HZ}" width="${W}" height="${H - HZ}" fill="url(#floor)"/>`);
// the sun's reflection: broken bars under the sun, two sets that swap on the beat
{
  const rr = mulberry32(7);
  const sets = [[], []];
  for (let row = 0; row < 15; row++) {
    const z = 40 / (1 + row * 0.55);
    const y = HZ + K / z + 1.5;
    const w0 = RS * 1.5 * (1 - row / 22);
    for (let s = 0; s < 2; s++) {
      let x = CX - w0 / 2 + (rr() - 0.5) * 10;
      while (x < CX + w0 / 2) {
        const len = 6 + rr() * 26;
        if (rr() > 0.32) sets[s].push([x, y, Math.min(len, CX + w0 / 2 - x)]);
        x += len + 3 + rr() * 9;
      }
    }
  }
  const dd = (set) => set.map(([x, y, l]) => `M${f(x)} ${f(y)}h${f(l)}`).join('');
  P(`<g fill="none" stroke-linecap="round"><path class="rfa" d="${dd(sets[0])}" stroke="#ffb35a" stroke-opacity=".55" stroke-width="1.6"/><path class="rfb" d="${dd(sets[1])}" stroke="#ff7a8a" stroke-opacity=".5" stroke-width="1.6"/></g>`);
  css.push(kf('rfa', [[0, 'opacity:1'], [BEAT / 2, 'opacity:1'], [BEAT / 2 + 0.001, 'opacity:.25'], [BEAT, 'opacity:.25']], BEAT));
  css.push(kf('rfb', [[0, 'opacity:.25'], [BEAT / 2, 'opacity:.25'], [BEAT / 2 + 0.001, 'opacity:1'], [BEAT, 'opacity:1']], BEAT));
}
// grid: a static fan of lines to the vanishing point...
{
  let d = '';
  const y0 = HZ + 2.2;
  for (let j = -26; j <= 26; j++) {
    const xb = CX + j * 62;
    const t = (y0 - HZ) / K;
    d += `M${f(CX + (xb - CX) * t)} ${f(y0)}L${f(xb)} ${H + 2}`;
  }
  P(`<path d="${d}" fill="none" stroke="#ff2bd6" stroke-opacity=".28" stroke-width="3"/>`);
  P(`<path d="${d}" fill="none" stroke="#ff4fe0" stroke-width="1"/>`);
}
// ...and floor lines that run at the viewer, one per beat
const NL = 30;
const ZMAX = NL + 0.5;
const ZMIN = 0.5;
const GL_T = NL * BEAT;
{
  const yAt = (z) => HZ + K / z;
  const sAt = (z) => clamp(2.3 / z ** 0.75, 0.45, 2.6);
  // pick keyframes so the straight-line steps between them stay within 0.35 px
  const N = 4000;
  const fine = [];
  for (let i = 0; i <= N; i++) { const t = i / N; fine.push([t, yAt(lerp(ZMAX, ZMIN, t)), sAt(lerp(ZMAX, ZMIN, t))]); }
  const keep = [0];
  let a = 0;
  for (let b = 2; b <= N; b++) {
    let ok = true;
    for (let k = a + 1; k < b; k++) {
      const u = (fine[k][0] - fine[a][0]) / (fine[b][0] - fine[a][0]);
      if (Math.abs(lerp(fine[a][1], fine[b][1], u) - fine[k][1]) > 0.35) { ok = false; break; }
    }
    if (!ok) { keep.push(b - 1); a = b - 1; }
  }
  keep.push(N);
  css.push(kf('gl', keep.map((i) => [fine[i][0] * GL_T, `transform:translate(0px,${f(fine[i][1])}px) scale(1,${f2(fine[i][2])})`]), GL_T));
  let g = '<g fill="none">';
  for (let k = 0; k < NL; k++) {
    const t = k / NL;
    const z = lerp(ZMAX, ZMIN, t);
    g += `<g class="gl" transform="translate(0 ${f(yAt(z))}) scale(1 ${f2(sAt(z))})" style="animation-delay:-${f2(t * GL_T)}s"><path d="M-10 0H970" stroke="#ff2bd6" stroke-opacity=".3" stroke-width="3"/><path d="M-10 0H970" stroke="#ff5ae6" stroke-width="1"/></g>`;
  }
  g += '</g>';
  P(g);
}
P(`<rect y="${HZ}" width="${W}" height="52" fill="url(#haze)"/>`);
P(`<path d="M0 ${HZ}H${W}" stroke="#ff7ad6" stroke-opacity=".45" stroke-width="4"/><path d="M0 ${HZ}H${W}" stroke="#ffe0f4" stroke-width="1.1"/>`);

// ------------------------------------------------------------- the island
const ISL = { cx: 506, top: 262, base: 275 };
// shore rings, one per bar
P(`<g transform="translate(${ISL.cx} 275)" fill="none" stroke="#ffd2f2" stroke-width="1"><ellipse class="ring" rx="118" ry="6.5"/><ellipse class="ring" rx="118" ry="6.5" style="animation-delay:-1.5s"/></g>`);
css.push(kf('ring', [[0, 'transform:scale(.97);opacity:.0'], [0.3, 'transform:scale(.99);opacity:.75'], [BAR, 'transform:scale(1.13);opacity:0']], BAR));
{
  const top = [[392, 275], [404, 270], [424, 266], [452, 263.5], [486, 262], [520, 261.6], [556, 262.6], [588, 265], [610, 269], [622, 275]];
  const bottom = [[612, 278.5], [560, 280.2], [500, 280.6], [440, 280], [402, 278.4]];
  P(`<path d="${poly([...top, ...bottom])}" fill="url(#isl)"/>`);
  // tufts of beach scrub either side of the palm
  const tuft = (x, y, s) => {
    const pts = [];
    for (let i = 0; i <= 8; i++) {
      const a = Math.PI * (i / 8);
      const r = (i % 2 ? 0.55 : 1) * s;
      pts.push([x - Math.cos(a) * s * 1.6, y - Math.sin(a) * r * 0.9]);
    }
    return poly(pts);
  };
  P(`<path d="${tuft(492, 263.4, 7)}${tuft(507, 263, 5)}${tuft(580, 264.6, 6)}${tuft(593, 266.5, 4.5)}" fill="#200c2a"/>`);
  P(`<path d="${line(top)}" fill="none" stroke="#ffad6a" stroke-opacity=".85" stroke-width="1.1"/>`);
  P('<path d="M418 277.6q4-3.4 8 0zM575 279q3.2-2.8 6.4 0z" fill="#12061a"/>');
}
// the raft, bobbing
P(`<g class="raft"><path d="M626 272.6L668 270.4L675 275.2L633 277.6Z" fill="#3a1a26"/><path d="M630 275.1L671 272.8M628.5 273.8L669.5 271.6M631.5 276.4L673 274.1" stroke="#1a0a18" stroke-width=".7"/><path d="M626 272.6L668 270.4L675 275.2" fill="none" stroke="#ffac70" stroke-opacity=".8" stroke-width=".9"/></g>`);
css.push(kf('raft', [[0, 'transform:translate(0px,0px)'], [3, 'transform:translate(0px,.9px)'], [6, 'transform:translate(0px,0px)']], 6));

// the palm: a tapering curved trunk and feathered fronds, swaying a little
const CROWN = [540, 172];
{
  const p0 = [576, 267]; const p1 = [588, 218]; const p2 = CROWN;
  const L = []; const R = [];
  const rings = [];
  for (let i = 0; i <= 24; i++) {
    const t = i / 24;
    const x = (1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0];
    const y = (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1];
    const dx = 2 * (1 - t) * (p1[0] - p0[0]) + 2 * t * (p2[0] - p1[0]);
    const dy = 2 * (1 - t) * (p1[1] - p0[1]) + 2 * t * (p2[1] - p1[1]);
    const l = Math.hypot(dx, dy); const nx = -dy / l; const ny = dx / l;
    const w = lerp(3.4, 1.9, t) + (i === 0 ? 1.4 : 0);
    L.push([x + nx * w, y + ny * w]); R.push([x - nx * w, y - ny * w]);
    if (i % 2 === 1 && i < 23) rings.push([[x + nx * w * 0.95, y + ny * w * 0.95], [x - nx * w * 0.95, y - ny * w * 0.95 + 1]]);
  }
  const trunk = poly([...L, ...R.reverse()]);
  P(`<path d="${trunk}" fill="none" stroke="#ff9a62" stroke-opacity=".9" stroke-width="2"/><path d="${trunk}" fill="#1b0a26"/><path d="${enc(rings, false)}" stroke="#4d2244" stroke-width=".8"/>`);
  // fronds: a drooping spine with a fringe of leaflets hanging under it
  const rf = mulberry32(5);
  const fronds = [[-170, 60, 0.62], [-144, 50, 0.5], [-116, 38, 0.42], [-84, 30, 0.42], [-52, 44, 0.5], [-20, 58, 0.6], [10, 54, 0.72], [36, 38, 0.9], [150, 42, 0.8]];
  const subs = [];
  for (const [ang, len, droop] of fronds) {
    const a = (ang * Math.PI) / 180;
    const n = 14;
    const sp = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      sp.push([Math.cos(a) * len * t, Math.sin(a) * len * t + droop * len * t * t]);
    }
    const up = []; const dn = [];
    for (let i = 0; i <= n; i++) {
      const p = sp[i]; const q = sp[Math.min(n, i + 1)]; const o = sp[Math.max(0, i - 1)];
      const dx = q[0] - o[0]; const dy = q[1] - o[1]; const l = Math.hypot(dx, dy) || 1;
      const al = [dx / l, dy / l];
      let nm = [-al[1], al[0]];
      if (nm[1] < 0) nm = [-nm[0], -nm[1]]; // the gravity side
      const t = i / n;
      const w = lerp(1.3, 0.3, t);
      up.push([p[0] - nm[0] * w, p[1] - nm[1] * w]); dn.push([p[0] + nm[0] * w, p[1] + nm[1] * w]);
      if (i === 0 || i === n) continue;
      const Lk = len * 0.34 * Math.sin(Math.PI * Math.min(1, t * 1.05)) ** 0.55 * (0.85 + rf() * 0.3);
      const leaf = (dir, lenK) => {
        const dl = Math.hypot(dir[0], dir[1]);
        const tip = [p[0] + (dir[0] / dl) * lenK, p[1] + (dir[1] / dl) * lenK];
        subs.push([[p[0] - al[0] * 1.3, p[1] - al[1] * 1.3], [p[0] + al[0] * 1.3, p[1] + al[1] * 1.3], tip]);
      };
      leaf([al[0] * 0.55 + nm[0], al[1] * 0.55 + nm[1]], Lk);
      leaf([al[0] * 0.95 - nm[0] * 0.3, al[1] * 0.95 - nm[1] * 0.3], Lk * 0.42);
    }
    subs.push([...up, ...dn.reverse()]);
  }
  defs.push(`<path id="fr" d="${enc(subs, true)}"/>`);
  P(`<g transform="translate(${CROWN[0]} ${CROWN[1]})"><g class="crown"><use href="#fr" fill="none" stroke="#ff8fb0" stroke-opacity=".8" stroke-width="1.8" stroke-linejoin="round"/><use href="#fr" fill="#1b0a26"/><circle cx="-2.2" cy="3.4" r="2.4" fill="#2c102a"/><circle cx="2.2" cy="3.8" r="2.2" fill="#2c102a"/><circle cx="0" cy="6.2" r="2.1" fill="#2c102a"/></g></g>`);
  css.push(kf('crown', [[0, 'transform:rotate(-1.2deg)'], [3, 'transform:rotate(1.4deg)'], [6, 'transform:rotate(-1.2deg)']], 6));
}

// ------------------------------------------------------------------- her
const HER = { x: 462, y: 268, k: 1.15 };
const Z0 = K / (HER.y - HZ); // her distance in floor units
const WALK_OUT = [12, 16.5];
const WALK_BACK = [22.5, 27];
const STEP = BEAT / 2; // stepped movement, two steps a beat
const FAR = 4.6; // she walks until she is 1/FAR of her size
const walkPos = (k) => { // k: 0 at the island .. 1 at the vanishing point
  const z = Z0 * lerp(1, FAR, k);
  const s = Z0 / z;
  return [CX + (HER.x - CX) * s, HZ + (HER.y - HZ) * s, s * HER.k];
};
{
  const idleA = herIdle(false);
  const idleB = herIdle(true);
  // idle: visible except while she is away
  P(`<g class="idle" transform="translate(${HER.x} ${HER.y}) scale(${HER.k})"><g class="hold">${idleA.body}<g transform="translate(0 -29.4)"><g class="nod"><g transform="translate(0 29.4)">${idleA.head}</g></g></g>${idleA.cup}</g><g class="sip" opacity="0">${idleB.body}<g transform="translate(0 -29.4)"><g class="nod"><g transform="translate(0 29.4)">${idleB.head}</g></g></g>${idleB.cup}</g></g>`);
  const away = WALK_OUT[0];
  const back = WALK_BACK[1];
  css.push(kf('idle', [[0, 'opacity:1'], [away, 'opacity:1'], [away + 0.001, 'opacity:0'], [back - 0.001, 'opacity:0'], [back, 'opacity:1'], [LOOP, 'opacity:1']]));
  // two sips a loop, each two beats long, cut in and out on the beat
  const sips = [[4.5, 6], [31.5, 33]];
  const sipF = [[0, 'opacity:0']];
  const holdF = [[0, 'opacity:1']];
  for (const [a, b] of sips) {
    sipF.push([a - 0.001, 'opacity:0'], [a, 'opacity:1'], [b - 0.001, 'opacity:1'], [b, 'opacity:0']);
    holdF.push([a - 0.001, 'opacity:1'], [a, 'opacity:0'], [b - 0.001, 'opacity:0'], [b, 'opacity:1']);
  }
  sipF.push([LOOP, 'opacity:0']); holdF.push([LOOP, 'opacity:1']);
  css.push(kf('sip', sipF), kf('hold', holdF));
  css.push(kf('nod', [[0, 'transform:rotate(0deg)'], [0.12, 'transform:translate(0px,.7px) rotate(7deg)'], [0.42, 'transform:rotate(0deg)'], [BEAT, 'transform:rotate(0deg)']], BEAT));

  // walking out (back view) and back (front view), stepped
  const walk = (cls, back, from, to, toward) => {
    const n = Math.round((to - from) / STEP);
    const fr = [[0, 'opacity:0;transform:translate(0px,0px) scale(.1)']];
    for (let i = 0; i <= n; i++) {
      const t = from + i * STEP;
      const k = toward ? i / n : 1 - i / n;
      const [x, y, s] = walkPos(k);
      const vis = toward ? (i < n ? 1 : 0) : 1;
      fr.push([i === 0 ? t + 0.001 : t, `opacity:${vis};transform:translate(${f(x)}px,${f(y)}px) scale(${f(s, 3)})`]);
    }
    const [lx, ly, ls] = walkPos(toward ? 1 : 0);
    fr[1][0] = from + 0.001;
    fr.push([to + 0.001, `opacity:0;transform:translate(${f(lx)}px,${f(ly)}px) scale(${f(ls, 3)})`]);
    fr.push([LOOP, `opacity:0;transform:translate(${f(lx)}px,${f(ly)}px) scale(${f(ls, 3)})`]);
    css.push(kf(cls, fr));
    P(`<g class="${cls}" opacity="0"><g class="wA">${herWalk(back, 1)}</g><g class="wB">${herWalk(back, 2)}</g></g>`);
  };
  walk('wout', true, WALK_OUT[0], WALK_OUT[1], true);
  walk('wback', false, WALK_BACK[0], WALK_BACK[1], false);
  css.push(kf('wA', [[0, 'opacity:1'], [STEP - 0.001, 'opacity:1'], [STEP, 'opacity:0'], [2 * STEP, 'opacity:0']], 2 * STEP));
  css.push(kf('wB', [[0, 'opacity:0'], [STEP - 0.001, 'opacity:0'], [STEP, 'opacity:1'], [2 * STEP, 'opacity:1']], 2 * STEP));
}

// ------------------------------------------------------- the shark (z 3.2)
const SH = { z: 3.2, t0: 1, t1: 11 };
{
  const s = Z0 / SH.z * 0.42; // a smallish shark
  const y = HZ + K / SH.z;
  const body = `<path d="M-10 1C-9.6 -2.4 -6.4 -5.6 -1 -6.2C3.4 -6.6 7 -4.8 8.4 1Z" fill="#7381ad"/><path d="M-10 1C-9.6 -2.4 -6.4 -5.6 -1 -6.2C3.4 -6.6 7 -4.8 8.4 1" fill="none" stroke="#b9c6ff" stroke-width=".7"/><path d="M-8.6 -1.2Q-6 -0.4 -3.6 -1.4" fill="none" stroke="#2a1838" stroke-width=".55"/><circle cx="-5.4" cy="-3.4" r=".75" fill="#140818"/><path d="M-2.2 -5C-2.6 -10.8 4.6 -10.8 4.2 -5" fill="none" stroke="${C_PHONE}" stroke-width="1"/><rect x="-0.4" y="-5.6" width="3" height="3.6" rx="1" fill="${C_PHONE}" stroke="${C_INK}" stroke-width=".5"/>`;
  const fin = '<path d="M12 1C13.6 -4 15.6 -9.6 19.6 -12.4C18.8 -7.6 19.6 -3 21.6 1Z" fill="#5f6a99" stroke="#b9c6ff" stroke-width=".7" stroke-linejoin="round"/>';
  const wake = '<path d="M-11 0.6L-2 2.4M-11 0.6L-1 -0.2M20 0.8L30 1.6M8.6 0.8L13 0.8" fill="none" stroke="#bff9ff" stroke-width=".6" stroke-linecap="round"/>';
  P(`<g class="shark" transform="translate(760 ${f(y)})"><g transform="scale(${f2(s)})"><g clip-path="url(#water)"><g class="bob">${fin}${body}</g></g>${wake}</g></g>`);
  css.push(kf('shark', [[0, `transform:translate(1010px,${f(y)}px)`], [SH.t0, `transform:translate(1010px,${f(y)}px)`], [SH.t1, `transform:translate(-60px,${f(y)}px)`], [LOOP, `transform:translate(-60px,${f(y)}px)`]]));
  css.push(kf('bob', [[0, 'transform:translate(0px,0px) rotate(0deg)'], [0.12, 'transform:translate(0px,1px) rotate(-6deg)'], [0.42, 'transform:translate(0px,0px) rotate(0deg)'], [BEAT, 'transform:translate(0px,0px) rotate(0deg)']], BEAT));
}

// ------------------------------------------- the electric hydrofoil (z ~3.6)
const BRO = { t0: 15.6, t1: 24.6, x0: -300, x1: 1260 };
{
  const samples = [];
  const n = 36;
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const t = lerp(BRO.t0, BRO.t1, u);
    const x = lerp(BRO.x0, BRO.x1, u);
    const z = 3.65 + 0.42 * Math.sin(((x - 60) / 840) * Math.PI * 2);
    const dz = 0.42 * Math.cos(((x - 60) / 840) * Math.PI * 2);
    samples.push({ t, x, y: HZ + K / z, s: (Z0 / z) * 0.88, tilt: -dz * 14 });
  }
  let acc = 0;
  samples.forEach((p, i) => { if (i) acc += Math.hypot(p.x - samples[i - 1].x, p.y - samples[i - 1].y); p.len = acc; });
  const total = acc;
  const wakeD = line(samples.map((p) => [p.x, p.y]));
  const TR1 = 70; const TR2 = 260;
  const off = (len, L) => f(L - len);
  const fr = [[0, `transform:translate(${f(samples[0].x)}px,${f(samples[0].y)}px) scale(${f2(samples[0].s)}) rotate(0deg)`]];
  const w1 = [[0, `stroke-dashoffset:${off(0, TR1)}`]]; const w2 = [[0, `stroke-dashoffset:${off(0, TR2)}`]];
  for (const p of samples) {
    fr.push([p.t, `transform:translate(${f(p.x)}px,${f(p.y)}px) scale(${f2(p.s)}) rotate(${f(p.tilt)}deg)`]);
    w1.push([p.t, `stroke-dashoffset:${off(p.len, TR1)}`]);
    w2.push([p.t, `stroke-dashoffset:${off(p.len, TR2)}`]);
  }
  const last = samples[samples.length - 1];
  fr.push([LOOP, `transform:translate(${f(last.x)}px,${f(last.y)}px) scale(${f2(last.s)}) rotate(0deg)`]);
  w1.push([LOOP, `stroke-dashoffset:${off(total, TR1)}`]); w2.push([LOOP, `stroke-dashoffset:${off(total, TR2)}`]);
  css.push(kf('bro', fr), kf('wk1', w1), kf('wk2', w2));
  P(`<path class="wk2" d="${wakeD}" fill="none" stroke="#36f9f6" stroke-opacity=".35" stroke-width="2.6" stroke-dasharray="${TR2} 4000" stroke-dashoffset="${TR2}" stroke-linecap="round"/>`);
  P(`<path class="wk1" d="${wakeD}" fill="none" stroke="#d8fffe" stroke-width="1.3" stroke-dasharray="${TR1} 4000" stroke-dashoffset="${TR1}" stroke-linecap="round"/>`);
  // the rider, facing right. Units as hers; water at y 0, board at -8.
  const sil = '#22113f';
  const rim = '#36f9f6';
  // shapes as [kind, d, width]: 'f' filled, 's' stroked
  const parts2 = (wave) => [
    ['s', 'M-1.2 -20.6L-3.6 -14.8L-4.8 -9.4M-6 -9h2.6M1 -20.6L4.4 -15.2L3.8 -9.4M2.8 -9h2.6', 2.7],
    ['s', 'M-1.6 -32.2L-5.2 -27.4L-6.2 -23.6', 2.1], // back arm, holding the remote
    ['f', 'M-3.9 -33.9L3.7 -33.5L2.9 -23.6L-2.9 -23.6Z'],
    ['f', 'M-1 -35.6h3.6v2.4h-3.6Z'],
    ['f', 'M1.6 -40.3A3 3 0 1 1 1.59 -40.3Z'],
    ['f', 'M-1.8 -38.4A3.4 3.4 0 0 1 4.8 -38.6Z'], // a cap, on backwards
    ['f', 'M-1.6 -38.9L-5 -38.1L-4.8 -37.2L-1.4 -37.7Z'],
    wave ? ['s', 'M2.2 -32.6L5.8 -36.8L6.8 -41', 2.1] : ['s', 'M2.2 -32.6L6.2 -28.8L9.6 -28.2', 2.1],
    ...(wave ? [['s', 'M6.8 -41.4L8.4 -43.2M6.6 -41.6L5 -43.2', 0.9]] : []), // thumb and pinky out
  ];
  const shorts = '<path d="M-3.7 -24.2L3.5 -24.2L4.7 -17.2L1 -16.8L0.2 -19.4L-0.8 -16.8L-4.1 -17.2Z" fill="#17b3a5"/>';
  const rider = (wave) => {
    const ps = parts2(wave);
    const draw = (stroke, extra) => ps.map(([k, d, w]) => (k === 'f'
      ? `<path d="${d}"${stroke ? ` stroke="${stroke}" stroke-width="${extra}"` : ''}/>`
      : `<path d="${d}" fill="none" stroke="${stroke || sil}" stroke-width="${f(w + (stroke ? extra : 0))}"/>`)).join('');
    return `<g stroke-linejoin="round" stroke-linecap="round" fill="${sil}">${draw(rim, 1.3)}${draw(null, 0)}</g>${shorts}<path d="M-1.8 -38.4A3.4 3.4 0 0 1 4.8 -38.6ZM-1.6 -38.9L-5 -38.1L-4.8 -37.2L-1.4 -37.7Z" fill="#ff3fa4"/><path d="M2.2 -37.4h3" stroke="#36f9f6" stroke-width="1" stroke-linecap="round"/>`;
  };
  const board = `<path d="M-0.4 -8.2L0.6 -8.2L0.8 1L-0.2 1Z" fill="${sil}" stroke="${rim}" stroke-width=".5"/><path d="M-13 -8.6C-6 -9.6 6 -9.6 13 -9.8C14.4 -9.6 14.4 -8 12.6 -7.4C5 -6.6 -6 -6.6 -12.6 -7.2C-14 -7.4 -14 -8.4 -13 -8.6Z" fill="#ff3fa4" stroke="#ffd0ef" stroke-width=".6"/><path d="M-2.4 0.4h5.4" stroke="#d8fffe" stroke-width="1" stroke-linecap="round"/>`;
  P(`<g class="bro" transform="translate(-300 300)"><g class="ride">${board}<g class="nowave">${rider(false)}</g><g class="wave" opacity="0">${rider(true)}</g></g></g>`);
  // he throws a shaka while passing the island
  const wa = 19.2; const wb = 21.6;
  css.push(kf('wave', [[0, 'opacity:0'], [wa - 0.001, 'opacity:0'], [wa, 'opacity:1'], [wb - 0.001, 'opacity:1'], [wb, 'opacity:0'], [LOOP, 'opacity:0']]));
  css.push(kf('nowave', [[0, 'opacity:1'], [wa - 0.001, 'opacity:1'], [wa, 'opacity:0'], [wb - 0.001, 'opacity:0'], [wb, 'opacity:1'], [LOOP, 'opacity:1']]));
  css.push(kf('ride', [[0, 'transform:translate(0px,0px)'], [BEAT / 2, 'transform:translate(0px,-.6px)'], [BEAT, 'transform:translate(0px,0px)']], BEAT));
}

// bottom: a calmer band and the stats line
P(`<rect y="350" width="${W}" height="${H - 350}" fill="url(#foot)"/>`);
{
  const s = fontD('90+ ACTIVITIES · 4 TIMERS · EVERY GAG ON THE NEXT BAR · 80 BPM · EVERY SOUND MADE FROM CODE', CX, 398, 8, 3.1, 'center');
  defs.push(`<path id="stat" d="${s.d}"/>`);
  P('<g fill="none" stroke-linecap="round" stroke-linejoin="round"><use href="#stat" stroke="#ff7edb" stroke-opacity=".3" stroke-width="3"/><use href="#stat" stroke="#ffd9f3" stroke-width="1.1"/></g>');
}

// --------------------------------------------------------------- the logo
{
  const tf = `translate(${LOGO_X} ${LOGO_Y}) skewX(${SKEW})`;
  let g = `<g transform="${tf}" fill="none" stroke-linejoin="miter" stroke-miterlimit="4">`;
  g += `<path d="${outD}" stroke="#ff2bd6" stroke-opacity=".14" stroke-width="${SW + 26}"/>`;
  g += `<path d="${outD}" stroke="#ff2bd6" stroke-opacity=".2" stroke-width="${SW + 12}"/>`;
  // extrusion: copies stepping down and right
  for (let i = 7; i >= 1; i--) {
    const col = i === 7 ? '#ff3fa4' : mix('#1a0b33', '#43166a', (7 - i) / 7);
    g += `<use href="#lo" transform="translate(${f(i * 0.9)} ${f(i * 1.3)})" stroke="${col}" stroke-width="${SW + 3.6}"/>`;
  }
  g += `<use href="#lo" stroke="#fff2fd" stroke-width="${SW + 3.6}"/>`;
  defs.push(`<path id="lo" d="${outD}"/>`);
  g += `<path d="${faceD}" stroke="url(#chrome)" stroke-width="${SW}"/>`;
  // the shine: a soft white bar, masked to the letter faces
  g += `<g mask="url(#lm)"><rect class="shine" x="-60" y="-10" width="46" height="${LH + 20}" fill="url(#shine)" transform="translate(-80 0) skewX(-18)"/></g>`;
  g += '</g>';
  defs.push(`<mask id="lm" maskUnits="userSpaceOnUse" x="-40" y="-10" width="${wordW + 80}" height="${LH + 20}"><path d="${faceD}" fill="none" stroke="#fff" stroke-width="${SW}"/></mask>`);
  P(g);
  css.push(kf('shine', [[0, 'transform:translate(-80px,0px) skewX(-18deg)'], [1.5, `transform:translate(${wordW + 80}px,0px) skewX(-18deg)`], [6, `transform:translate(${wordW + 80}px,0px) skewX(-18deg)`]], 6));
  // four-point glints on two corners, twinkling a bar apart
  const star = (x, y, r, cls, delay) => `<g transform="translate(${f(x)} ${f(y)})"><g class="${cls}" style="animation-delay:-${delay}s"><path d="M0 ${-r}Q1.2 -1.2 ${r} 0Q1.2 1.2 0 ${r}Q-1.2 1.2 ${-r} 0Q-1.2 -1.2 0 ${-r}Z" fill="#fff"/><circle r="${f(r * 0.28)}" fill="#fff" opacity=".9"/><circle r="${f(r * 0.6)}" fill="#ffe6fb" opacity=".35"/></g></g>`;
  const [sx1, sy1] = logoPt(6, 4);
  const [sx2, sy2] = logoPt(wordW - 4, 2);
  P(star(sx1, sy1, 15, 'tw', 0) + star(sx2, sy2, 11, 'tw', 1.5));
  css.push(kf('tw', [[0, 'transform:scale(.25) rotate(0deg);opacity:.5'], [0.35, 'transform:scale(1) rotate(45deg);opacity:1'], [0.9, 'transform:scale(.4) rotate(90deg);opacity:.7'], [BAR, 'transform:scale(.25) rotate(90deg);opacity:.5']], BAR));
}

// ---------------------------------------------------------- the brush word
{
  defs.push(`<path id="bf" d="${brushFill}"/>`, `<path id="bl" d="${brushLine}"/>`);
  P(`<g class="neon"><use href="#bf" fill="#1a0526" transform="translate(2.4 3.2)"/><g fill="none" stroke-linecap="round" stroke-linejoin="round"><use href="#bl" stroke="#ff2fa8" stroke-opacity=".22" stroke-width="13"/><use href="#bl" stroke="#ff4fc0" stroke-opacity=".35" stroke-width="6"/></g><use href="#bf" fill="#ff5ecb"/><g fill="none" stroke-linecap="round" stroke-linejoin="round"><use href="#bl" stroke="#ff5ecb" stroke-width="2.2"/><use href="#bl" stroke="#ffe3f6" stroke-width=".9"/></g></g>`);
  css.push(kf('neon', [[0, 'opacity:.35'], [0.25, 'opacity:1'], [0.4, 'opacity:.45'], [0.55, 'opacity:1'], [0.8, 'opacity:.6'], [1.0, 'opacity:1'], [1.2, 'opacity:1']], 1.2));
}

// frame
P(`<rect x=".75" y=".75" width="${W - 1.5}" height="${H - 1.5}" rx="17.5" fill="none" stroke="#ff7edb" stroke-opacity=".45" stroke-width="1.5"/>`);

// ------------------------------------------------------------------ style
const style = `
.gl{animation:gl ${GL_T}s linear infinite}
.sl{animation:sl ${SL_T}s linear infinite}
.rfa{animation:rfa ${BEAT}s linear infinite}
.rfb{animation:rfb ${BEAT}s linear infinite}
.ring{animation:ring ${BAR}s ease-out infinite}
.raft{animation:raft 6s ease-in-out infinite}
.crown{animation:crown 6s ease-in-out infinite}
.idle{animation:idle ${LOOP}s linear infinite}
.hold{animation:hold ${LOOP}s linear infinite}
.sip{animation:sip ${LOOP}s linear infinite}
.nod{animation:nod ${BEAT}s ease-out infinite}
.wout{animation:wout ${LOOP}s step-end infinite}
.wback{animation:wback ${LOOP}s step-end infinite}
.wA{animation:wA ${2 * STEP}s linear infinite}
.wB{animation:wB ${2 * STEP}s linear infinite}
.shark{animation:shark ${LOOP}s linear infinite}
.bob{animation:bob ${BEAT}s ease-out infinite}
.bro{animation:bro ${LOOP}s linear infinite}
.wk1{animation:wk1 ${LOOP}s linear infinite}
.wk2{animation:wk2 ${LOOP}s linear infinite}
.wave{animation:wave ${LOOP}s linear infinite}
.nowave{animation:nowave ${LOOP}s linear infinite}
.ride{animation:ride ${BEAT}s ease-in-out infinite}
.shine{animation:shine 6s linear infinite}
.tw{animation:tw ${BAR}s ease-out infinite}
.neon{animation:neon 1.2s linear 1 both}
.ink{fill:${C_INK};stroke:${C_INK}}
${css.join('\n')}
@media (prefers-reduced-motion:reduce){*{animation:none!important}.shine{opacity:0}}
`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="CASTAWAY: golden hours">
<title>CASTAWAY: golden hours</title>
<style>${style}</style>
<defs>${defs.join('\n')}</defs>
<g clip-path="url(#panel)">
<rect width="${W}" height="${H}" fill="#0b0418"/>
${parts.join('\n')}
</g>
</svg>
`;
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, svg);
console.log(`wrote ${path.relative(process.cwd(), OUT)} (${(svg.length / 1024).toFixed(1)} KB)`);
