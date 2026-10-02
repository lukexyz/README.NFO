#!/usr/bin/env node
// VFD Front Panel: README header generator for Castaway.
//
//   node examples/castaway/src/73-vfd-front-panel_opus_5.5.mjs
//
// Writes examples/castaway/assets/73-vfd-front-panel_opus_5.5.svg.
// Plain Node, no dependencies, no clock, no Math.random: one seeded PRNG, so
// every run writes the same bytes.
//
// The style is the vacuum fluorescent display (VFD) on the front of a late-80s
// hi-fi component: blue-green segments behind smoked glass, the unlit segments
// still faintly visible, fixed annunciator words in orange, stacked bar level
// meters and a little fixed-graphic pictogram. The receiver is invented: the
// IDLETRONIC IR-600 "ten-hour stereo island receiver", in brushed silver. Its
// layout, name and lettering are original; no real panel, maker, logo or format
// mark is copied. Segment geometry is generic (16-segment starburst cells for
// letters, 7-segment digits).
//
// The display runs in shop DEMO mode: a 60 s loop of 20 bars of 3 s, the same
// shape as the project's theme (80 BPM, 20 bars, 60 s), so every change lands on
// a bar line the way the gags do. The ticker pushes in one message per bar, one
// whole cell at a time; at the loop seam a lamp-test sweep lights every segment
// once and leaves CASTAWAY behind.
//
//    bar  ticker          pictogram (every gag is printed on the glass as a ghost;
//                          it lights only when its turn comes)
//    0-1  CASTAWAY        she idles, nodding on every beat
//    2    LO-FI ISLAND
//    3    TEN HOURS
//    4    SHE IDLES
//    5    MOSTLY.
//    6    COCONUT SIP     REGULAR + OCCASIONAL; she sips (regular) while the
//                         ship (occasional, its own lane) crosses behind her
//    7    BOTTLE BACK     OCCASIONAL; thrown out, washes straight back
//    8    DRONE DROP      RARE; a parcel is lowered onto the sand
//    9    HEADPHONES?     RARE; it is another pair of headphones
//   10    SHARK NODS      RARE; a fin in headphones, nodding on the beat; she
//                         nods back (the activity uses her lane, so BUSY)
//   11    CAT ON CRATE    RARE; a stray cat drifts in on a crate
//   12    ONE BAR         RARE; phone up: one bar of signal, top of the palm
//   13    TURTLE NAP      OCCASIONAL; a turtle visits, both doze off
//   14    BONK            OCCASIONAL; coconut on hermit crab, crab walks off in it
//   15    NO SAMPLES
//   16    ALL CODE
//   17    RUN SERVE.PY
//   18    127.0.0.1:8765
//   19    WAIT FOR IT     then the lamp test, then CASTAWAY again
//
// Lamps: IDLE is lit except in the eight bars where an activity holds her lane
// (8 of 20: a real run is nearer a third, the demo is showing off). SUPER RARE
// never lights in the 60 s demo, and NIGHT and SAMPLES never light at all:
// always daytime, no samples.
//
// Facts on screen, checked in D:/python/castaway on 2026-10-02 (read only):
// four tiers (regular 2-5 min, occasional 12-25 min, rare 30-60 min, super rare
// 3-6 h); coconut sip is regular; message in a bottle, the ship passing, turtle
// visit and the coconut crab are occasional; delivery drone, shark nod, cat
// visit and signal hunt are rare; the cat and the ship have lanes of their own.
// Theme 80 BPM, F major, 20 bars of 3 s, stereo; every activity starts on the
// next bar. Mix at -14 LUFS. Every sound synthesized by tools/make_audio.py.
// Run: python tools/serve.py, then http://127.0.0.1:8765/.
//
// No <text>: every letter is generated geometry (segment cells, or the stroke
// font below). Motion is CSS only, step-end, and every period divides 60 s, so
// the loop has no seam. prefers-reduced-motion stops it on the title frame:
// CASTAWAY, 0:00, every lamp and the whole island.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '73-vfd-front-panel_opus_5.5';
const OUT = path.resolve(HERE, `../assets/${SLUG}.svg`);

// ------------------------------------------------------------------ basics
const W = 1200, H = 512;
const LOOP = 60, BAR = 3, BEAT = 0.75, HALF = BEAT / 2;
const f = (n) => {
  const r = Math.round(n * 100) / 100;
  return Object.is(r, -0) ? '0' : String(r);
};
const pc = (t, dur = LOOP) => {
  const r = Math.round((t / dur) * 100 * 10000) / 10000;
  return `${r}%`;
};
function mulberry32(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = mulberry32(1992);

// ------------------------------------------------------------------ palette
const C = {
  lit: '#7dffea',      // VFD phosphor, filtered
  orange: '#ff8a2a',   // annunciators
  coral: '#ff8a6e',    // her tank top (a coral filter over the phosphor)
  cream: '#fff0cf',    // shorts and headphones (a cream filter)
  skin: '#ffd0ad',     // her face, arms and legs (a peach filter)
  hair: '#c27a45',     // her brown hair and bun (a dark amber filter)
  sun: '#ffc54d',      // the sun (an amber filter)
  glass: '#051012',
  print: '#2f5557',    // ink printed on the inside of the glass
};

// ------------------------------------------------------------------ geometry helpers
const poly = (pts) => 'M' + pts.map(([x, y]) => `${f(x)} ${f(y)}`).join('L') + 'Z';
const circ = (cx, cy, r) =>
  `M${f(cx - r)} ${f(cy)}a${f(r)} ${f(r)} 0 1 0 ${f(2 * r)} 0a${f(r)} ${f(r)} 0 1 0 ${f(-2 * r)} 0Z`;
const rrect = (x, y, w, h, r) =>
  `M${f(x + r)} ${f(y)}h${f(w - 2 * r)}a${f(r)} ${f(r)} 0 0 1 ${f(r)} ${f(r)}v${f(h - 2 * r)}a${f(r)} ${f(r)} 0 0 1 ${f(-r)} ${f(r)}h${f(-(w - 2 * r))}a${f(r)} ${f(r)} 0 0 1 ${f(-r)} ${f(-r)}v${f(-(h - 2 * r))}a${f(r)} ${f(r)} 0 0 1 ${f(r)} ${f(-r)}Z`;
const rot = ([x, y], cx, cy, deg) => {
  const a = (deg * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
  return [cx + (x - cx) * c - (y - cy) * s, cy + (x - cx) * s + (y - cy) * c];
};

// Hexagonal segments with pointed ends, the classic segment-display shape.
function hseg(x0, x1, y, t, g) {
  const h = t / 2;
  return [[x0 + g, y], [x0 + g + h, y - h], [x1 - g - h, y - h], [x1 - g, y], [x1 - g - h, y + h], [x0 + g + h, y + h]];
}
function vseg(x, y0, y1, t, g) {
  const h = t / 2;
  return [[x, y0 + g], [x + h, y0 + g + h], [x + h, y1 - g - h], [x, y1 - g], [x - h, y1 - g - h], [x - h, y0 + g + h]];
}
// Keep the part of a polygon where nx*x + ny*y <= c (Sutherland-Hodgman, one edge).
function clipHalf(pts, nx, ny, c) {
  const out = [];
  for (let i = 0; i < pts.length; i++) {
    const P = pts[i], Q = pts[(i + 1) % pts.length];
    const dp = nx * P[0] + ny * P[1] - c, dq = nx * Q[0] + ny * Q[1] - c;
    if (dp <= 0) out.push(P);
    if ((dp < 0 && dq > 0) || (dp > 0 && dq < 0)) {
      const k = dp / (dp - dq);
      out.push([P[0] + (Q[0] - P[0]) * k, P[1] + (Q[1] - P[1]) * k]);
    }
  }
  return out;
}
// A diagonal segment: a band of width w along A->B, cut to the box it lives in.
function dseg(x0, y0, x1, y1, A, B, w) {
  let p = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  const dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy);
  const nx = -dy / L, ny = dx / L, c0 = nx * A[0] + ny * A[1];
  p = clipHalf(p, nx, ny, c0 + w / 2);
  p = clipHalf(p, -nx, -ny, -(c0 - w / 2));
  return p;
}

// 16-segment starburst cell (upright; the row group slants it).
function cell16(cw, ch, t, g) {
  const h = t / 2, xl = h, xr = cw - h, xm = cw / 2, yt = h, ym = ch / 2, yb = ch - h;
  const S = {
    a1: hseg(xl, xm, yt, t, g), a2: hseg(xm, xr, yt, t, g),
    g1: hseg(xl, xm, ym, t, g), g2: hseg(xm, xr, ym, t, g),
    d1: hseg(xl, xm, yb, t, g), d2: hseg(xm, xr, yb, t, g),
    f: vseg(xl, yt, ym, t, g), e: vseg(xl, ym, yb, t, g),
    b: vseg(xr, yt, ym, t, g), c: vseg(xr, ym, yb, t, g),
    i: vseg(xm, yt, ym, t, g), l: vseg(xm, ym, yb, t, g),
  };
  const gd = g * 1.25, wd = t * 0.78;
  const L0 = xl + h + gd, L1 = xm - h - gd, R0 = xm + h + gd, R1 = xr - h - gd;
  const U0 = yt + h + gd, U1 = ym - h - gd, D0 = ym + h + gd, D1 = yb - h - gd;
  S.h = dseg(L0, U0, L1, U1, [L0, U0], [L1, U1], wd);
  S.j = dseg(R0, U0, R1, U1, [R1, U0], [R0, U1], wd);
  S.k = dseg(L0, D0, L1, D1, [L1, D0], [L0, D1], wd);
  S.m = dseg(R0, D0, R1, D1, [R0, D0], [R1, D1], wd);
  const out = {};
  for (const [k, v] of Object.entries(S)) out[k] = poly(v);
  const dx = cw + (CELL.pitch - cw) / 2 - 1.5, r = t * 0.5;
  out.dp = circ(dx, yb - 0.5, r);
  out.c1 = circ(dx, ch * 0.31, r);
  out.c2 = circ(dx, ch * 0.69, r);
  return out;
}
function cell7(cw, ch, t, g) {
  const h = t / 2, xl = h, xr = cw - h, yt = h, ym = ch / 2, yb = ch - h;
  const S = {
    a: hseg(xl, xr, yt, t, g), g: hseg(xl, xr, ym, t, g), d: hseg(xl, xr, yb, t, g),
    f: vseg(xl, yt, ym, t, g), b: vseg(xr, yt, ym, t, g),
    e: vseg(xl, ym, yb, t, g), c: vseg(xr, ym, yb, t, g),
  };
  const out = {};
  for (const [k, v] of Object.entries(S)) out[k] = poly(v);
  out.dp = circ(cw + t * 0.95, yb - 0.3, t * 0.55);
  return out;
}

const SEG16 = {
  A: 'a1 a2 b c e f g1 g2', B: 'a1 a2 b c d1 d2 g2 i l', C: 'a1 a2 d1 d2 e f',
  D: 'a1 a2 b c d1 d2 i l', E: 'a1 a2 d1 d2 e f g1', F: 'a1 a2 e f g1',
  G: 'a1 a2 c d1 d2 e f g2', H: 'b c e f g1 g2', I: 'a1 a2 d1 d2 i l',
  J: 'b c d1 d2 e', K: 'e f g1 j m', L: 'd1 d2 e f', M: 'b c e f h j',
  N: 'b c e f h m', O: 'a1 a2 b c d1 d2 e f', P: 'a1 a2 b e f g1 g2',
  Q: 'a1 a2 b c d1 d2 e f m', R: 'a1 a2 b e f g1 g2 m', S: 'a1 a2 c d1 d2 f g1 g2',
  T: 'a1 a2 i l', U: 'b c d1 d2 e f', V: 'e f k j', W: 'b c e f k m',
  X: 'h j k m', Y: 'h j l', Z: 'a1 a2 d1 d2 j k',
  0: 'a1 a2 b c d1 d2 e f', 1: 'b c', 2: 'a1 a2 b d1 d2 e g1 g2',
  3: 'a1 a2 b c d1 d2 g2', 4: 'b c f g1 g2', 5: 'a1 a2 c d1 d2 f g1 g2',
  6: 'a1 a2 c d1 d2 e f g1 g2', 7: 'a1 a2 b c', 8: 'a1 a2 b c d1 d2 e f g1 g2',
  9: 'a1 a2 b c d1 d2 f g1 g2', '-': 'g1 g2', '?': 'a1 a2 b g2 l', '/': 'j k',
  '#': 'a1 a2 b c d1 d2 e f g1 g2 h i j k l m dp', ' ': '',
};
const SEG7 = {
  0: 'a b c d e f', 1: 'b c', 2: 'a b g e d', 3: 'a b g c d', 4: 'f g b c',
  5: 'a f g c d', 6: 'a f g e d c', 7: 'a b c', 8: 'a b c d e f g', 9: 'a b c d f g',
};

// ------------------------------------------------------------------ stroke font
// An original single-stroke face on a 4 x 6 grid, for the silkscreen on the
// faceplate and the annunciator words printed on the display.
const SF = {
  A: '0,6 0,1.5 1.5,0 2.5,0 4,1.5 4,6|0,3.6 4,3.6',
  B: '0,0 3,0 4,1 4,2 3,3 0,3|3,3 4,4 4,5 3,6 0,6 0,0',
  C: '4,1 3,0 1,0 0,1 0,5 1,6 3,6 4,5',
  D: '0,0 2.5,0 4,1.5 4,4.5 2.5,6 0,6 0,0',
  E: '4,0 0,0 0,6 4,6|0,3 3,3',
  F: '4,0 0,0 0,6|0,3 3,3',
  G: '4,1 3,0 1,0 0,1 0,5 1,6 3,6 4,5 4,3.4 2.2,3.4',
  H: '0,0 0,6|4,0 4,6|0,3 4,3',
  I: '1,0 3,0|2,0 2,6|1,6 3,6',
  J: '4,0 4,5 3,6 1,6 0,5',
  K: '0,0 0,6|4,0 0,4|1.5,2.6 4,6',
  L: '0,0 0,6 4,6',
  M: '0,6 0,0 2,3.2 4,0 4,6',
  N: '0,6 0,0 4,6 4,0',
  O: '1,0 3,0 4,1 4,5 3,6 1,6 0,5 0,1 1,0',
  P: '0,6 0,0 3,0 4,1 4,2.2 3,3.2 0,3.2',
  Q: '1,0 3,0 4,1 4,5 3,6 1,6 0,5 0,1 1,0|2.4,4.4 4,6',
  R: '0,6 0,0 3,0 4,1 4,2.2 3,3.2 0,3.2|2,3.2 4,6',
  S: '4,1 3,0 1,0 0,1 0,2 1,3 3,3 4,4 4,5 3,6 1,6 0,5',
  T: '0,0 4,0|2,0 2,6',
  U: '0,0 0,5 1,6 3,6 4,5 4,0',
  V: '0,0 2,6 4,0',
  W: '0,0 1,6 2,2.5 3,6 4,0',
  X: '0,0 4,6|4,0 0,6',
  Y: '0,0 2,3 4,0|2,3 2,6',
  Z: '0,0 4,0 0,6 4,6',
  0: '1,0 3,0 4,1 4,5 3,6 1,6 0,5 0,1 1,0',
  1: '0.8,1.2 2,0 2,6|0.8,6 3.2,6',
  2: '0,1 1,0 3,0 4,1 4,2.2 0,6 4,6',
  3: '0,1 1,0 3,0 4,1 4,2 3,3 1.6,3|3,3 4,4 4,5 3,6 1,6 0,5',
  4: '3,6 3,0 0,4 4,4',
  5: '4,0 0.4,0 0,3 3,3 4,4 4,5 3,6 0,6',
  6: '3.4,0 1,0 0,1 0,5 1,6 3,6 4,5 4,4 3,3 0,3',
  7: '0,0 4,0 1.4,6',
  8: '1,0 3,0 4,1 4,2 3,3 1,3 0,4 0,5 1,6 3,6 4,5 4,4 3,3|1,3 0,2 0,1 1,0',
  9: '4,3 1,3 0,2 0,1 1,0 3,0 4,1 4,5 3,6 0.6,6',
  '-': '0.8,3 3.2,3',
  '+': '2,1.4 2,4.6|0.4,3 3.6,3',
  '/': '0.4,6 3.6,0',
  '?': '0,1 1,0 3,0 4,1 4,2 2,3.4 2,4.2|2,6',
  '=': '0.4,2 3.6,2|0.4,4 3.6,4',
  '>': '0.6,0.8 3.4,3 0.6,5.2',
  // narrow ones are drawn in a 1.4-wide box
  '.': '0.7,6',
  ':': '0.7,1.8|0.7,5.4',
  "'": '0.7,0 0.7,1.6',
  '·': '0.7,3',
  // symbols
  '▶': '0.3,0.4 4,3 0.3,5.6 0.3,0.4|1.3,1.7 1.3,4.3|2.3,2.4 2.3,3.6',
  '♪': '2.9,0.3 2.9,5|2.9,0.3 4.2,1.3 4.2,2.6|1.5,5.4 2.5,4.9|1.2,5 2.6,5.5',
  ' ': '',
};
const NARROW = new Set(['.', ':', "'", '·']);
const adv = (ch) => (NARROW.has(ch) ? 1.4 : ch === ' ' ? 2.6 : 4);
function text(str, x, y, cap, { track = 1.5, anchor = 'start' } = {}) {
  const u = cap / 6;
  let w = 0;
  for (const ch of str) w += adv(ch) + track;
  w = (w - track) * u;
  let cx = anchor === 'middle' ? x - w / 2 : anchor === 'end' ? x - w : x;
  let d = '';
  for (const ch of str) {
    const g = SF[ch];
    if (g === undefined) throw new Error(`stroke font has no ${JSON.stringify(ch)}`);
    for (const stroke of g.split('|')) {
      if (!stroke) continue;
      const pts = stroke.split(' ').map((p) => p.split(',').map(Number));
      if (pts.length === 1) d += `M${f(cx + pts[0][0] * u)} ${f(y + pts[0][1] * u)}h.01`;
      else d += 'M' + pts.map(([px, py]) => `${f(cx + px * u)} ${f(y + py * u)}`).join('L');
    }
    cx += (adv(ch) + track) * u;
  }
  return { d, w, x0: anchor === 'middle' ? x - w / 2 : anchor === 'end' ? x - w : x };
}

// ------------------------------------------------------------------ animation helpers
const css = [];
const kfCache = new Map();
let kfN = 0;
// frames: [[t, value]] with t in seconds from 0 (must start at 0). Returns a class name.
function anim(frames, { dur = LOOP, prop = 'opacity', delay = 0 } = {}) {
  const byVal = new Map();
  const last = frames[frames.length - 1][1];
  for (const [t, v] of frames) {
    if (!byVal.has(v)) byVal.set(v, []);
    byVal.get(v).push(pc(t, dur));
  }
  byVal.get(last).push('100%');
  const body = [...byVal].map(([v, ps]) => `${ps.join(',')}{${prop}:${v}}`).join('');
  const key = `${dur}|${body}`;
  let name = kfCache.get(key);
  if (!name) {
    name = `k${(kfN++).toString(36)}`;
    kfCache.set(key, name);
    css.push(`@keyframes ${name}{${body}}`);
  }
  const cls = `${name}${delay ? 'd' + String(delay).replace('.', '_').replace('-', 'm') : ''}`;
  const rule = `.${cls}{animation:${name} ${dur}s step-end ${delay ? delay + 's ' : ''}infinite}`;
  if (!css.includes(rule)) css.push(rule);
  return cls;
}
// On/off opacity from a list of [start, end) intervals in seconds.
function onOff(intervals, dur = LOOP) {
  const iv = intervals
    .map(([a, b]) => [Math.max(0, a), Math.min(dur, b)])
    .filter(([a, b]) => b > a)
    .sort((p, q) => p[0] - q[0]);
  const merged = [];
  for (const [a, b] of iv) {
    const m = merged[merged.length - 1];
    if (m && a <= m[1] + 1e-9) m[1] = Math.max(m[1], b);
    else merged.push([a, b]);
  }
  const at0 = merged.length && merged[0][0] <= 1e-9 ? 1 : 0;
  const frames = [[0, at0]];
  for (const [a, b] of merged) {
    if (a > 1e-9) frames.push([a, 1]);
    if (b < dur - 1e-9) frames.push([b, 0]);
  }
  // collapse duplicates at equal times
  const fr = [];
  for (const p of frames) {
    if (fr.length && Math.abs(fr[fr.length - 1][0] - p[0]) < 1e-9) fr[fr.length - 1] = p;
    else fr.push(p);
  }
  if (fr.length === 1) return { cls: null, base: at0 };
  return { cls: anim(fr, { dur }), base: at0 };
}
const bars = (...bs) => bs.map((b) => [b * BAR, (b + 1) * BAR]);
const span = (b0, beat0, b1, beat1) => [[b0 * BAR + beat0 * BEAT, b1 * BAR + beat1 * BEAT]];

// ------------------------------------------------------------------ layout
const DX = 30, DY = 58, DW = 1140, DH = 362; // the display window
const CELL = { cw: 54, ch: 92, t: 8.8, g: 1.3, pitch: 66 };
const NCELL = 12;
const TX = DX + 34, TY = DY + 46;            // ticker row origin
const SKEW = -7;
// the island pictogram: drawn on a 496 x 150 grid, shown 1.16 times larger
const PW = 496, PH = 150, PS = 1.16;
const PX = DX + 286, PY = DY + 172;

// ------------------------------------------------------------------ the script (one message per bar)
const PAGES = [
  'CASTAWAY', 'CASTAWAY', 'LO-FI ISLAND', 'TEN HOURS', 'SHE IDLES', 'MOSTLY.',
  'COCONUT SIP', 'BOTTLE BACK', 'DRONE DROP', 'HEADPHONES?', 'SHARK NODS',
  'CAT ON CRATE', 'ONE BAR', 'TURTLE NAP', 'BONK', 'NO SAMPLES', 'ALL CODE',
  'RUN SERVE.PY', '127.0.0.1:8765', 'WAIT FOR IT',
];
// Which timer each gag comes off (activities.toml). Bar 6 lights two lamps: the
// coconut sip is regular, and the ship behind her is occasional, on its own lane.
const TIER = {
  6: ['REG', 'OCC'], 7: ['OCC'], 8: ['RARE'], 9: ['RARE'], 10: ['RARE'], 11: ['RARE'],
  12: ['RARE'], 13: ['OCC'], 14: ['OCC'],
};
// Bars where an activity holds her lane. The cat has its own lane, so she idles
// through bar 11; the shark nod uses hers (they nod at each other).
const BUSY = [6, 7, 8, 9, 10, 12, 13, 14];

// Parse a message into cells: '.' and ':' attach to the previous cell.
function cellsOf(msg) {
  const out = [];
  for (const ch of msg) {
    if ((ch === '.' || ch === ':') && out.length && out[out.length - 1].ch !== ' ') {
      out[out.length - 1].extra.push(ch === '.' ? 'dp' : 'c1 c2');
      continue;
    }
    out.push({ ch, extra: [] });
  }
  return out;
}
function page(msg) {
  const cs = cellsOf(msg);
  if (cs.length > NCELL) throw new Error(`too long for the ticker: ${msg}`);
  const pad = Math.floor((NCELL - cs.length) / 2);
  const row = Array.from({ length: NCELL }, () => ({ ch: ' ', extra: [] }));
  cs.forEach((c, i) => (row[pad + i] = c));
  return row;
}

// ------------------------------------------------------------------ build
const defs = [];
const ghost = [];   // faint, static: every segment and every fixed graphic
const lit = [];     // lit layer (one glow filter over all of it)
const print = [];   // ink printed on the glass (frames, small labels)
const face = [];    // the faceplate

// ---- 16-segment ticker
const SEGS = cell16(CELL.cw, CELL.ch, CELL.t, CELL.g);
const cellGhost = Object.entries(SEGS)
  .filter(([k]) => k !== 'c1' && k !== 'c2')
  .map(([, d]) => d)
  .join('');
defs.push(`<path id="cg" d="${cellGhost}"/>`);
const glyphIds = new Map();
function glyph16(ch, extra) {
  const key = ch + extra.join('+');
  if (glyphIds.has(key)) return glyphIds.get(key);
  const segs = (SEG16[ch] ?? (() => { throw new Error(`no 16-seg glyph for ${ch}`); })())
    .split(' ').concat(extra.join(' ').split(' ')).filter(Boolean);
  const id = `q${glyphIds.size.toString(36)}`;
  glyphIds.set(key, id);
  if (segs.length) defs.push(`<path id="${id}" d="${segs.map((s) => SEGS[s]).join('')}"/>`);
  return id;
}

// ticker strip: pages laid side by side; the lamp-test sweep frames follow them
const strip = [];      // array of rows (each 12 cells)
PAGES.forEach((m, i) => { if (i !== 1) strip.push(page(m)); });
// page index in the strip for each bar
const barPage = PAGES.map((m, i) => (i <= 1 ? 0 : i - 1));
const nPages = strip.length;                 // 19 distinct pages (bar 0-1 share one)
const sweepStart = nPages;                   // then 12 sweep frames
const title = page('CASTAWAY'), last = page('WAIT FOR IT');
for (let k = 0; k < NCELL; k++) {
  strip.push(Array.from({ length: NCELL }, (_, i) => (i < k ? title[i] : i === k ? { ch: '#', extra: [] } : last[i])));
}
const stripCells = [];
strip.forEach((row, p) => row.forEach((c, i) => {
  if (c.ch === ' ' && !c.extra.length) return;
  const id = glyph16(c.ch, c.extra);
  stripCells.push(`<use href="#${id}" x="${(p * NCELL + i) * CELL.pitch}"/>`);
}));
// the strip's position over time (in cells)
const PUSH_STEP = 0.05;
const tickFrames = [[0, 0]];
for (let b = 2; b < 20; b++) {
  // push: the next page arrives one cell at a time and lands exactly on the bar line
  const from = barPage[b - 1] * NCELL;
  const t0 = b * BAR - NCELL * PUSH_STEP;
  for (let s = 1; s <= NCELL; s++) tickFrames.push([t0 + (s - 1) * PUSH_STEP, from + s]);
}
// lamp test: from WAIT FOR IT, sweep left to right, land on CASTAWAY at 60 s
const SWEEP_STEP = 0.06;
for (let k = 0; k < NCELL; k++) tickFrames.push([LOOP - (NCELL - k) * SWEEP_STEP, (sweepStart + k) * NCELL]);
const tickCls = anim(
  tickFrames.map(([t, c]) => [Math.round(t * 1000) / 1000, `translateX(${-c * CELL.pitch}px)`]),
  { prop: 'transform' },
);
// the colon after "127.0.0.1" sits at a fixed position: give it a ghost there
const colonCell = (() => {
  const row = page('127.0.0.1:8765');
  return row.findIndex((c) => c.extra.includes('c1 c2'));
})();
defs.push(`<path id="colg" d="${SEGS.c1}${SEGS.c2}"/>`);
defs.push(`<clipPath id="tclip"><rect x="-14" y="-6" width="${NCELL * CELL.pitch + 6}" height="${CELL.ch + 12}"/></clipPath>`);
const rowT = `translate(${TX} ${TY}) skewX(${SKEW})`;
ghost.push(`<g transform="${rowT}" class="t">${Array.from({ length: NCELL }, (_, i) => `<use href="#cg" x="${i * CELL.pitch}"/>`).join('')}<use href="#colg" x="${colonCell * CELL.pitch}"/></g>`);
lit.push(`<g transform="${rowT}" class="t"><g clip-path="url(#tclip)"><g class="${tickCls}">${stripCells.join('')}</g></g></g>`);

// ---- 7-segment digits
function digitRow({ x, y, cw, ch, t, g, id }) {
  const S = cell7(cw, ch, t, g);
  defs.push(`<path id="${id}g" d="${Object.values(S).join('')}"/>`);
  for (const [n, segs] of Object.entries(SEG7)) defs.push(`<path id="${id}${n}" d="${segs.split(' ').map((s) => S[s]).join('')}"/>`);
  defs.push(`<path id="${id}p" d="${S.dp}"/>`);
  return { x, y, cw, ch, t, id };
}
// a digit whose value changes: one stacked glyph per value, switched by opacity
function digitCell(row, i, pitch, valueAt, step, { color = 't' } = {}) {
  const x = row.x + i * pitch;
  const tr = `translate(${f(x)} ${f(row.y)}) skewX(${SKEW})`;
  ghost.push(`<use href="#${row.id}g" transform="${tr}" class="${color}"/>`);
  const iv = {};
  for (let t = 0; t < LOOP - 1e-9; t += step) {
    const v = valueAt(t);
    (iv[v] ??= []).push([t, t + step]);
  }
  const parts = [];
  for (const [v, list] of Object.entries(iv)) {
    const { cls, base } = onOff(list);
    parts.push(`<use href="#${row.id}${v}"${cls ? ` class="${cls}"` : ''}${base ? '' : ' opacity="0"'}/>`);
  }
  lit.push(`<g transform="${tr}" class="${color}">${parts.join('')}</g>`);
}
function staticDigit(row, i, pitch, v, { dp = false, color = 't' } = {}) {
  const x = row.x + i * pitch;
  const tr = `translate(${f(x)} ${f(row.y)}) skewX(${SKEW})`;
  ghost.push(`<use href="#${row.id}g" transform="${tr}" class="${color}"/>`);
  lit.push(`<g transform="${tr}" class="${color}"><use href="#${row.id}${v}"/>${dp ? `<use href="#${row.id}p"/>` : ''}</g>`);
}

// big time readout: m:ss inside the 60 s theme loop
const BIGX = DX + 858, BIGY = TY;
const big = digitRow({ x: BIGX, y: BIGY, cw: 50, ch: CELL.ch, t: 9.5, g: 1.3, id: 'B' });
staticDigit(big, 0, 66, 0);
const colonX = BIGX + 66 + 4;
{
  const tr = `translate(${colonX} ${BIGY}) skewX(${SKEW})`;
  const dots = `${circ(14, CELL.ch * 0.32, 5)}${circ(14, CELL.ch * 0.7, 5)}`;
  ghost.push(`<path d="${dots}" transform="${tr}" class="t"/>`);
  const { cls } = onOff(Array.from({ length: 60 }, (_, s) => [s, s + 0.5]));
  lit.push(`<path d="${dots}" transform="${tr}" class="t ${cls}"/>`);
}
// a divider printed on the glass between the ticker and the clock, slanted like the cells
{
  const x = (TX + (NCELL - 1) * CELL.pitch + CELL.cw + BIGX) / 2;
  const k = Math.tan((-SKEW * Math.PI) / 180);
  print.push(`M${f(x + k * 4)} ${f(TY - 4)}L${f(x - k * (CELL.ch + 4))} ${f(TY + CELL.ch + 4)}`);
}
const secX = { x: BIGX + 104, y: BIGY, id: 'B' };
digitCell(secX, 0, 66, (t) => Math.floor(t / 10), 1);
digitCell(secX, 1, 66, (t) => Math.floor(t) % 10, 1);

// small readouts in the right block of the lower row
const RX = DX + 884, RY = DY + 190;
const sm = digitRow({ x: RX + 4, y: RY, cw: 21, ch: 40, t: 5, g: 0.8, id: 'S' });
staticDigit(sm, 0, 28, 8);
staticDigit(sm, 1, 28, 0, { dp: true });
staticDigit(sm, 2, 28, 0);
const barRow = { x: RX + 142, y: RY, id: 'S' };
digitCell(barRow, 0, 28, (t) => Math.floor((Math.floor(t / BAR) + 1) / 10), BAR);
digitCell(barRow, 1, 28, (t) => (Math.floor(t / BAR) + 1) % 10, BAR);

// ---- annunciators
// lamp(str, x, y, cap, color, intervals|true|false, {box})
function lamp(str, x, y, cap, color, on, { box = false, anchor = 'start', sw = 1.7, track = 1.5 } = {}) {
  const tx = text(str, x, y, cap, { anchor, track });
  let d = tx.d;
  let boxD = '';
  if (box) {
    const pad = cap * 0.55;
    boxD = rrect(tx.x0 - pad, y - pad, tx.w + 2 * pad, cap + 2 * pad, 3);
  }
  const g = `<path d="${d}" class="s S${color}" stroke-width="${sw}"/>${boxD ? `<path d="${boxD}" class="s S${color}" stroke-width="${sw * 0.8}"/>` : ''}`;
  ghost.push(`<g>${g}</g>`);
  if (on === false) return tx;
  if (on === true) { lit.push(`<g>${g}</g>`); return tx; }
  const { cls, base } = onOff(on);
  lit.push(`<g${cls ? ` class="${cls}"` : ''}${base ? '' : ' opacity="0"'}>${g}</g>`);
  return tx;
}
const AY = DY + 13, AC = 12;
{
  let x = DX + 30;
  const gap = 26;
  const put = (s, col, on, o = {}) => { const r = lamp(s, x, AY, AC, col, on, o); x += r.w + gap + (o.box ? 12 : 0); return r; };
  x += 6;
  put('DEMO', 'O', Array.from({ length: 40 }, (_, k) => [k * 1.5, k * 1.5 + 1.05]), { box: true });
  put('▶ PLAY', 'T', true);
  put('REPEAT 1', 'T', true);
  // beat lamp: on for the first half of every beat
  put('♪', 'O', Array.from({ length: 80 }, (_, k) => [k * BEAT, k * BEAT + HALF]));
  put('ST', 'T', true);
  const idleOn = [];
  for (let b = 0; b < 20; b++) if (!BUSY.includes(b)) idleOn.push([b * BAR, (b + 1) * BAR]);
  put('IDLE', 'O', idleOn, { box: true });
  put('BUSY', 'O', BUSY.map((b) => [b * BAR, (b + 1) * BAR]), { box: true });
  put('DAYTIME', 'T', true);
  put('NIGHT', 'T', false);
}
// over the big clock
lamp('TIME', BIGX - 6, AY, AC, 'T', true);
{
  const sm = lamp('SAMPLES', DX + DW - 26, AY, AC, 'T', false, { anchor: 'end' });
  lamp('SYNTH', sm.x0 - 24, AY, AC, 'T', true, { anchor: 'end' });
}

// lower right block: tuner, bar counter, schedule lamps
lamp('TUNED', RX, DY + 172, 9, 'O', true, { sw: 1.45 });
print.push(text('BPM', RX + 94, RY + 31, 8.5).d);
lamp('BAR', RX + 138, DY + 172, 9, 'T', true, { sw: 1.45 });
print.push(text('/20', RX + 202, RY + 31, 8.5).d);
{
  const lx = RX, ly = DY + 270, bw = 110, bh = 29, gx = 8, gy = 9;
  const tiers = [['REGULAR', 'REG'], ['OCCASIONAL', 'OCC'], ['RARE', 'RARE'], ['SUPER RARE', 'SR']];
  tiers.forEach(([label, key], n) => {
    const x = lx + (n % 2) * (bw + gx), y = ly + Math.floor(n / 2) * (bh + gy);
    const on = Object.entries(TIER).filter(([, v]) => v.includes(key)).map(([b]) => [b * BAR, (+b + 1) * BAR]);
    const tx = text(label, x + bw / 2, y + (bh - 9) / 2, 9, { anchor: 'middle', track: 1.3 });
    const g = `<path d="${rrect(x, y, bw, bh, 4)}" class="s SO" stroke-width="1.5"/><path d="${tx.d}" class="s SO" stroke-width="1.5"/>`;
    ghost.push(`<g>${g}</g>`);
    if (on.length) {
      const { cls, base } = onOff(on);
      lit.push(`<g class="${cls}"${base ? '' : ' opacity="0"'}>${g}</g>`);
    }
  });
  print.push(text('SCHEDULE', lx, ly - 16, 7.5, { track: 1.6 }).d);
}

// ---- level meters: one stereo pair per synthesized source (scoreLevels above)
const MX = DX + 40, MY = PY, NSEG = 12, SEGP = 12.4, SEGH = 7.6, COLW = 16;
const SOURCES = [
  { name: 'DRUMS', kind: 'drums' }, { name: 'E.PIANO', kind: 'piano' },
  { name: 'KALIMBA', kind: 'kalimba' }, { name: 'VINYL', kind: 'crackle' }, { name: 'SURF', kind: 'surf' },
];
// The drums, e.piano and kalimba meters follow the theme's own score, bar for bar
// (the arrangement in tools/make_audio.py, checked read-only on 2026-10-02):
// bars 1-2 keys only; drums and bass from bar 3, eighth hats, then sixteenths
// from bar 11, a fill in the last bar of each 4-bar phrase; kalimba from bar 7;
// bars 17-20 a breakdown of kick and rim only while the keys' filter closes.
// Levels are drawn from note timings and velocities, not from listening.
const QB = 4, NQ = 20 * 4 * QB;          // quarter-beat steps in the 60 s theme
const MELODY_AT = '7:.5,1,1.5,2.5 8:1,1.5,2 9:.5,1,1.75,2.5 10:1,2,3 11:0,.5,1,1.5,2,3 ' +
  '12:.5,1,1.75,2.5,3,3.5 13:0,1.5,2,2.5,3,3.5 14:0,1.5,2,2.5,3 15:0,2,2.5,3 ' +
  '16:.5,1,1.5,3.5 17:0,2 18:0,2 19:1,2.5 20:0,.5,1,2';
function scoreLevels(kind, ch) {
  const hits = new Array(NQ).fill(0);
  const put = (bar, beat, v) => { const i = Math.round(((bar - 1) * 4 + beat) * QB) % NQ; hits[i] = Math.max(hits[i], v); };
  if (kind === 'drums') {
    for (let bar = 3; bar <= 20; bar++) {
      if (bar >= 17) { put(bar, 0, 8); put(bar, 1, 5 + ch); put(bar, 3, 5 + ch); continue; }
      const fill = bar % 4 === 2;
      for (const b of fill ? [0, 1.75, 2.5] : [0, 2.5]) put(bar, b, b === 0 ? 10 : 9);
      put(bar, 1, ch ? 8 : 9); put(bar, 3, ch ? 9 : 8);
      if (fill) put(bar, 3.75, 3);
      for (let b = 0; b < 4; b += bar >= 11 ? 0.25 : 0.5) {
        const v = fill && b === 3.5 ? 4 : b % 1 === 0 ? 5 : b % 0.5 === 0 ? 4 : 2;
        put(bar, b, v + ch);                     // the hats sit a little to the right
      }
    }
    return decay(hits, 2.6);
  }
  if (kind === 'kalimba') {
    for (const part of MELODY_AT.split(' ')) {
      const [bar, beats] = part.split(':');
      for (const b of beats.split(',').map(Number)) {
        const v = (b % 1 === 0 ? 9 : 7) * (+bar === 20 ? 0.7 : 1);
        put(+bar, b, Math.round(v) - (ch ? 0 : 1)); // panned a little right
      }
    }
    return decay(hits, 1.4);
  }
  // e.piano: a chord on beat 1 (held 2.4 beats) and on the "and" of 3 (held 1.4),
  // every bar; the filter opens over the intro and closes through the breakdown
  const out = new Array(NQ).fill(0);
  const cutoff = (t) => (t < 6 ? 450 * 16 ** (t / 6) : t < 48 ? 7200 : 7200 * 16 ** (-(t - 48) / 12));
  for (let pass = 0, v = 0; pass < 2; pass++) {
    for (let i = 0; i < NQ; i++) {
      const beat = (i / QB) % 4, t = (i / QB) * BEAT;
      const g = 0.5 + 0.5 * Math.log(cutoff(t) / 450) / Math.log(16);
      const onset = beat === 0 ? 9 : beat === 2.5 ? 6.5 : 0;
      const held = beat < 2.4 || (beat >= 2.5 && beat < 3.9);
      v = onset ? onset * g : Math.max(0, v - (held ? 0.35 : 1.6));
      if (pass === 1) out[i] = Math.round(v - (ch ? 0.4 : 0));
    }
  }
  return out;
}
function levels(kind, ch) {
  const r = mulberry32(kind.length * 97 + ch * 13 + 7);
  let period, step, raw = [];
  if (kind === 'drums' || kind === 'piano' || kind === 'kalimba') {
    period = LOOP; step = BEAT / QB;
    raw = scoreLevels(kind, ch);
  } else if (kind === 'crackle') {
    period = 3; step = 0.125;
    for (let i = 0; i < 24; i++) raw.push(r() < 0.14 ? 4 + Math.floor(r() * 2) : 1 + Math.floor(r() * 2.4));
  } else {
    period = 12; step = 0.375;
    for (let i = 0; i < 32; i++) {
      const v = 4.6 + 2.6 * Math.sin((2 * Math.PI * i) / 32 + ch * 0.9) + (r() - 0.5) * 1.4;
      raw.push(Math.max(2, Math.min(8, Math.round(v))));
    }
  }
  // peak hold: hold 4 steps, then fall one segment a step (steady state over two periods)
  const n = raw.length, peaks = [];
  let p = 0, hold = 0;
  for (let pass = 0; pass < 2; pass++) {
    for (let i = 0; i < n; i++) {
      const v = raw[i];
      if (v >= p) { p = v; hold = 4; } else if (hold > 0) hold--; else p = Math.max(v, p - 1);
      if (pass === 1) peaks.push(p);
    }
  }
  return { period, step, raw, peaks };
}
function decay(hits, rate, floor = 0) {
  const n = hits.length, out = new Array(n).fill(0);
  let v = 0;
  for (let pass = 0; pass < 2; pass++) {
    for (let i = 0; i < n; i++) {
      v = Math.max(hits[i], v - rate, floor);
      if (pass === 1) out[i] = Math.round(v);
    }
  }
  return out;
}
{
  const colPath = Array.from({ length: NSEG }, (_, k) => rrect(0, k * SEGP, COLW, SEGH, 1)).join('');
  defs.push(`<path id="mc" d="${colPath}"/><path id="mp" d="${rrect(0, 0, COLW, SEGH, 1)}"/>`);
  defs.push(`<clipPath id="mclip"><rect x="-2" y="-1" width="${COLW + 4}" height="${NSEG * SEGP}"/></clipPath>`);
  SOURCES.forEach((src, si) => {
    const px = MX + si * 47;
    for (let ch = 0; ch < 2; ch++) {
      const x = px + ch * (COLW + 3);
      ghost.push(`<use href="#mc" x="${x}" y="${MY}" class="t"/>`);
      const L = levels(src.kind, ch), { period, step } = L;
      const up = (v) => Math.min(NSEG, Math.round(v * 1.2));
      const raw = L.raw.map(up), peaks = L.peaks.map(up);
      const fr = (vals) => {
        const out = [];
        vals.forEach((v, i) => {
          const val = `translateY(${(NSEG - v) * SEGP}px)`;
          if (!out.length || out[out.length - 1][1] !== val) out.push([Math.round(i * step * 10000) / 10000, val]);
        });
        return out;
      };
      const lc = anim(fr(raw), { dur: period, prop: 'transform' });
      const pk = anim(fr(peaks), { dur: period, prop: 'transform' });
      const baseL = (NSEG - raw[0]) * SEGP, baseP = (NSEG - peaks[0]) * SEGP;
      lit.push(`<g transform="translate(${x} ${MY})" clip-path="url(#mclip)"><use href="#mc" class="t ${lc}" transform="translate(0 ${baseL})"/><use href="#mp" class="o ${pk}" transform="translate(0 ${baseP})"/></g>`);
    }
    print.push(text(src.name, px + COLW + 1.5, MY + NSEG * SEGP + 8, 7, { anchor: 'middle', track: 1.1 }).d);
  });
  // dB ticks on the left
  [0, 3, 6, 9, 11].forEach((k) => print.push(`M${MX - 12} ${MY + k * SEGP + SEGH / 2}h6`));
  print.push(text('LEVEL', MX - 12, PY - 19, 7.5, { track: 1.6 }).d);
}

// ---- the island pictogram (fixed graphics: everything is printed, lit in turn)
const PT = `translate(${PX} ${PY}) scale(${PS})`;
// part helpers -> svg strings, coordinates in pictogram space
const F = (d, c = 't') => `<path d="${d}" class="${c}"/>`;
const Sk = (d, c = 'T', w = 2.6) => `<path d="${d}" class="s S${c}" stroke-width="${w}"/>`;
function icon(id, parts) {
  defs.push(`<g id="${id}">${parts.join('')}</g>`);
  ghost.push(`<use href="#${id}" transform="${PT}"/>`);
  return id;
}
function show(id, intervals) {
  if (intervals === true) { lit.push(`<use href="#${id}" transform="${PT}"/>`); return; }
  const { cls, base } = onOff(intervals);
  if (!cls && !base) return;
  lit.push(`<use href="#${id}" transform="${PT}"${cls ? ` class="${cls}"` : ''}${base ? '' : ' opacity="0"'}/>`);
}
const T = (b, beat = 0) => b * BAR + beat * BEAT;

// palm trunk: quadratic from base to crown
const TB = [244, 120], TC = [238, 74], TT = [272, 40];
const trunkAt = (t) => [
  (1 - t) ** 2 * TB[0] + 2 * t * (1 - t) * TC[0] + t * t * TT[0],
  (1 - t) ** 2 * TB[1] + 2 * t * (1 - t) * TC[1] + t * t * TT[1],
];
function trunkPiece(t0, t1) {
  const L = [], R = [];
  for (let k = 0; k <= 6; k++) {
    const t = t0 + ((t1 - t0) * k) / 6;
    const [x, y] = trunkAt(t), [x2, y2] = trunkAt(Math.min(1, t + 0.01)), [x1, y1] = trunkAt(Math.max(0, t - 0.01));
    const dx = x2 - x1, dy = y2 - y1, L0 = Math.hypot(dx, dy);
    const nx = -dy / L0, ny = dx / L0, w = (8.5 - 3.6 * t) / 2;
    L.push([x + nx * w, y + ny * w]);
    R.push([x - nx * w, y - ny * w]);
  }
  return poly(L.concat(R.reverse()));
}
const horizonY = 64;
{
  // horizon dashes, with a gap where the trunk crosses
  let crossX = 0;
  for (let t = 0; t <= 1; t += 0.001) { const [x, y] = trunkAt(t); if (y <= horizonY) { crossX = x; break; } }
  let d = '';
  for (let x = 8; x < PW - 8; x += 17) {
    const x1 = Math.min(x + 12, PW - 8);
    if (x1 > crossX - 8 && x < crossX + 8) continue;
    d += `M${x} ${horizonY}H${x1}`;
  }
  show(icon('ih', [Sk(d, 'T', 2)]), true);
}
// sun: core, and two sets of rays that take turns (a slow stepped spin)
{
  const cx = 46, cy = 30;
  show(icon('isc', [F(circ(cx, cy, 10), 'y')]), true);
  const rays = (odd) => {
    let d = '';
    for (let k = 0; k < 8; k++) {
      const a = ((k * 45 + (odd ? 22.5 : 0)) * Math.PI) / 180;
      d += `M${f(cx + Math.cos(a) * 14.5)} ${f(cy + Math.sin(a) * 14.5)}L${f(cx + Math.cos(a) * 20.5)} ${f(cy + Math.sin(a) * 20.5)}`;
    }
    return Sk(d, 'Y', 2.6);
  };
  icon('isa', [rays(false)]);
  icon('isb', [rays(true)]);
  // the two ray sets swap on every beat
  const A = [], B = [];
  for (let k = 0; k < 80; k++) (k % 2 ? B : A).push([k * BEAT, (k + 1) * BEAT]);
  show('isa', A);
  show('isb', B);
}
// island sand in three pieces
{
  const y = (x) => { const t = (x - 158) / 184; return 134 - 76 * t * (1 - t); };
  const piece = (x0, x1) => {
    const top = [];
    for (let k = 0; k <= 10; k++) { const x = x0 + ((x1 - x0) * k) / 10; top.push([x, y(x)]); }
    return poly(top.concat([[x1, 136], [x0, 136]]));
  };
  show(icon('iland', [F(piece(158, 222)), F(piece(225.5, 296)), F(piece(299.5, 342))]), true);
}
// palm: trunk rings, fronds, coconuts
{
  const parts = [];
  const cuts = [0, 0.17, 0.33, 0.48, 0.62, 0.75, 0.87, 0.97];
  for (let k = 0; k < cuts.length - 1; k++) parts.push(F(trunkPiece(cuts[k] + 0.012, cuts[k + 1] - 0.012)));
  const [cx, cy] = TT;
  const leaf = (tx, ty, w, bend) => {
    const mx = (cx + tx) / 2, my = (cy + ty) / 2, dx = tx - cx, dy = ty - cy, L = Math.hypot(dx, dy);
    const nx = -dy / L, ny = dx / L;
    const sx = cx + (dx / L) * 4, sy = cy + (dy / L) * 4;
    return `M${f(sx)} ${f(sy)}Q${f(mx + nx * (bend + w))} ${f(my + ny * (bend + w))} ${f(tx)} ${f(ty)}Q${f(mx + nx * (bend - w))} ${f(my + ny * (bend - w))} ${f(sx)} ${f(sy)}Z`;
  };
  parts.push(F(leaf(222, 60, 6, -9)), F(leaf(232, 22, 6, -6)), F(leaf(270, 6, 5.5, -5)),
    F(leaf(310, 18, 6, 6)), F(leaf(322, 52, 6, 9)));
  parts.push(F(circ(266, 47, 3.8)));
  show(icon('ipalm', parts), true);
  icon('inut', [F(circ(275.5, 48, 3.8))]);
  show('inut', [[0, T(14, 1)], [T(16), LOOP]]);
}
// raft
{
  const parts = [];
  for (let k = 0; k < 5; k++) parts.push(F(rrect(100 + k * 9.4, 125, 7.6, 7, 2.4)));
  parts.push(Sk('M98 122.5H147', 'T', 2));
  show(icon('iraft', parts), true);
}
// waves: three rows of crests, each crest lit two beats in three, chasing to the right
{
  const rows = [[84, [[194, 308]]], [104, [[0, 100], [148, 354]]], [146, []]];
  rows.forEach(([y, ex], r) => {
    const sets = [[], [], []];
    let n = 0;
    for (let x = 12 + r * 11; x < PW - 22; x += 31) {
      if (ex.some(([e0, e1]) => x + 17 > e0 && x < e1)) continue;
      sets[n % 3].push(`M${x} ${y}q8 -5.6 16 0`);
      n++;
    }
    sets.forEach((list, k) => {
      const id = icon(`iw${r}${k}`, [Sk(list.join(''), 'T', 2.4)]);
      const on = [];
      for (let b = 0; b < 80; b++) if ((b + k + r) % 3 !== 0) on.push([b * BEAT, (b + 1) * BEAT]);
      show(id, on);
    });
  });
}
// her: seated on the sand facing the sea, knees up, back to the palm
const HER = 6;   // she sits a little clear of the trunk
{
  const hx = 262, hy = 83.5; // head centre (before the HER offset)
  const ring = Array.from({ length: 28 }, (_, k) => [hx + 6.4 * Math.cos((k * 2 * Math.PI) / 28), hy + 6.4 * Math.sin((k * 2 * Math.PI) / 28)]);
  // hair (back and top) and face (front), split along a slanted line with a small gap
  const A = [hx + 1.5, hy - 6.5], B = [hx + 3.9, hy + 6.5];
  const dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy), nx = dy / L, ny = -dx / L;
  const c0 = nx * A[0] + ny * A[1];
  const hair = clipHalf(ring, nx, ny, c0 - 0.55), face = clipHalf(ring, -nx, -ny, -(c0 + 0.55));
  const move = (pts, ex, ey) => pts.map(([x, y]) => [x + ex, y + ey]);
  const head = (ex, ey) => [
    F(poly(move(hair, ex, ey)), 'h'),
    F(poly(move(face, ex, ey)), 'k'),
    F(circ(hx - 6.6 + ex, hy + 3.1 + ey, 3.1), 'h'),                                                // low bun
    Sk(`M${f(hx - 1.4 + ex)} ${f(hy - 2.2 + ey)}L${f(hx - 2.2 + ex)} ${f(hy - 5.4 + ey)}A7.4 7.4 0 0 1 ${f(hx + 4.6 + ex)} ${f(hy - 7.2 + ey)}`, 'M', 2.1), // band
    F(rrect(hx - 3.6 + ex, hy - 2.4 + ey, 4.4, 6.8, 2), 'm'),                                    // ear cup
  ];
  const body = [
    F(poly([[255.2, 109], [266.2, 108], [264.6, 93.6], [256.4, 94.2]]), 'c'),                   // coral tank top
    F(poly([[254.5, 111], [267, 109.6], [272, 112.4], [270.6, 117.4], [256, 117.6]]), 'm'),     // cream shorts
    Sk('M271 111.6L281.5 101.2', 'k', 3.4),                                                       // thigh
    Sk('M282.2 101L286.6 115.6L292 116.6', 'k', 3),                                               // shin, bare foot
  ];
  const her = (parts) => [`<g transform="translate(${HER} 0)">${parts.join('')}</g>`];
  show(icon('ibody', her(body)), true);
  icon('ihu', her(head(0, 0)));
  icon('ihd', her(head(1.1, 1.9)));
  icon('iarm', her([Sk('M263 96.5L278.8 103', 'k', 2.6)]));
  icon('isip', her([Sk('M263 96.5L271 91.4', 'k', 2.6), F(circ(274.4, 88.6, 3.7))]));
  icon('iphone', her([Sk('M263 96L266.8 76', 'k', 2.6), F(rrect(264.2, 66, 5.4, 9, 1.2))]));
  // timing: nod down on the first half of every beat; head up while sipping, down while napping
  const up = [], down = [], noteA = [], noteB = [];
  for (let k = 0; k < 80; k++) {
    const t = k * BEAT, b = Math.floor(t / BAR);
    if (b === 6 || b === 12) { up.push([t, t + BEAT]); continue; }
    if (b === 13) { down.push([t, t + BEAT]); continue; }
    down.push([t, t + HALF]);
    up.push([t + HALF, t + BEAT]);
    // notes while she idles, and while she and the shark nod at each other
    if (!BUSY.includes(b) || b === 10) (k % 2 ? noteB : noteA).push([t, t + HALF + 0.1875]);
  }
  show('ihu', up);
  show('ihd', down);
  show('iarm', [[0, T(6)], [T(7), T(12)], [T(13), LOOP]]);
  show('isip', bars(6));
  show('iphone', bars(12));
  // little notes over her head on the beat, only while she idles
  show(icon('in1', [Sk(text('♪', 281, 64, 10).d, 'O', 1.7)]), noteA);
  show(icon('in2', [Sk(text('♪', 292, 54, 10).d, 'O', 1.7)]), noteB);
}
// ship on the horizon, crossing while she sips (she does not look up)
{
  const ship = (x) => [
    F(poly([[x - 15, horizonY - 7], [x + 15, horizonY - 7], [x + 11, horizonY - 2], [x - 11, horizonY - 2]])),
    F(rrect(x - 8, horizonY - 13, 13, 5, 1)),
    F(rrect(x + 1, horizonY - 19, 4, 5, 0.8)),
  ];
  [468, 436, 404, 372].forEach((x, k) => show(icon(`iship${k}`, ship(x)), span(6, k, 6, k + 1)));
}
// bottle: thrown out to sea, washes straight back to her feet
{
  const bottle = (x, y, a) => {
    const body = [[x - 7, y - 2.6], [x + 3, y - 2.6], [x + 3, y + 2.6], [x - 7, y + 2.6]].map((p) => rot(p, x, y, a));
    const neck = [[x + 4.4, y - 1.3], [x + 8, y - 1.3], [x + 8, y + 1.3], [x + 4.4, y + 1.3]].map((p) => rot(p, x, y, a));
    return [F(poly(body), 't cut'), F(poly(neck), 't cut')];
  };
  const P1 = icon('ib1', bottle(311, 120.5, -12));
  const P2 = icon('ib2', bottle(366, 130, 18));
  const P3 = icon('ib3', bottle(430, 124, -28));
  show(P1, span(7, 0, 7, 1).concat(span(7, 3, 7, 4)));
  show(P3, span(7, 1, 7, 2));
  show(P2, span(7, 2, 7, 3));
  const q = text('?', 278, 62, 11, {});
  show(icon('iq', [Sk(q.d, 'O', 2)]), span(7, 3, 7, 4));
}
// delivery drone, lowering a parcel on the left of the island
{
  const drone = (x, y) => [
    F(rrect(x - 6, y - 2, 12, 4.4, 1.6)),
    Sk(`M${x - 6} ${y}L${x - 11} ${y - 3.4}M${x + 6} ${y}L${x + 11} ${y - 3.4}`, 'T', 1.8),
    Sk(`M${x - 15.5} ${y - 4.6}H${x - 6.5}M${x + 6.5} ${y - 4.6}H${x + 15.5}`, 'T', 2),
  ];
  const D1 = icon('id1', drone(122, 14)), D2 = icon('id2', drone(166, 12)), D3 = icon('id3', drone(204, 18));
  const hang = icon('ihang', [Sk('M204 21V33', 'T', 1.4), F(rrect(198, 33, 12, 10, 1.2))]);
  const box = icon('ibox', [F(rrect(199, 108, 13, 11, 1.4), 't cut'), Sk('M205.5 108.6V118.4', 'O', 1.4)]);
  const open = icon('iopen', [Sk('M199 108L193 101.5M212 108L218 101.5', 'T', 2.2)]);
  const hp = icon('ihp', [Sk('M200 97A6 6 0 0 1 212 97', 'M', 2.2), F(rrect(197.6, 95.4, 4.4, 6.6, 1.6), 'm'), F(rrect(209.8, 95.4, 4.4, 6.6, 1.6), 'm')]);
  show(D1, span(8, 0, 8, 1).concat(span(8, 3, 8, 4)));
  show(D2, span(8, 1, 8, 2));
  show(D3, span(8, 2, 8, 3));
  show(hang, span(8, 2, 8, 3));
  show(box, span(8, 3, 10, 0));
  show(open, span(9, 1, 10, 0));
  show(hp, span(9, 1, 10, 0));
}
// shark in headphones, nodding (tilting) on the beat
{
  const fin = (deg) => {
    // a swept dorsal fin: convex leading edge up to a hooked tip, concave
    // trailing edge back down; the headphone band sits below the tip
    const cx = 418, cy = 134;
    const R = (x, y) => rot([cx + x, cy + y], cx, cy, deg);
    const P = (p) => `${f(p[0])} ${f(p[1])}`;
    const b0 = R(-13, 0), lc = R(-7, -21), tip = R(9, -27), tc = R(3.5, -10), b1 = R(12, 0);
    const h0 = R(-8.4, -9.5), hc = R(0.5, -28), h1 = R(9.4, -9);
    return [
      F(`M${P(b0)}Q${P(lc)} ${P(tip)}Q${P(tc)} ${P(b1)}Z`),
      Sk(`M${P(h0)}Q${P(hc)} ${P(h1)}`, 'M', 1.8),
      F(circ(h0[0], h0[1], 2.9), 'm'), F(circ(h1[0], h1[1], 2.9), 'm'),
    ];
  };
  const A = icon('ifa', fin(-7)), B = icon('ifb', fin(5));
  const a = [], b = [];
  for (let k = 0; k < 4; k++) { const t = T(10, k); a.push([t, t + HALF]); b.push([t + HALF, t + BEAT]); }
  show(A, a);
  show(B, b);
}
// a stray cat drifting in on a crate
{
  const crate = (x) => {
    const y = 120;
    return [
      F(rrect(x - 8, y, 16, 12, 1.4)),
      Sk(`M${x - 6} ${y + 2}L${x + 6} ${y + 10}`, 'G', 1.2),                      // a gap: the crate's brace
      // cat: body, head with ears, tail
      F(`M${x - 6} ${y - 1}Q${x - 6} ${y - 9} ${x} ${y - 10}Q${x + 3} ${y - 9} ${x + 3} ${y - 1}Z`),
      F(`M${x + 1} ${y - 11}L${x + 1.6} ${y - 17.6}L${x + 4} ${y - 14.6}L${x + 6.4} ${y - 17.6}L${x + 7.2} ${y - 11}Q${x + 4} ${y - 8} ${x + 1} ${y - 11}Z`),
      Sk(`M${x - 6} ${y - 2}Q${x - 12} ${y - 4} ${x - 10} ${y - 11}`, 'T', 1.8),
    ];
  };
  [22, 48, 74].forEach((x, k) => {
    const id = icon(`ic${k}`, crate(x));
    if (k < 2) show(id, span(11, k * 1.5, 11, k * 1.5 + 1.5));
    else show(id, span(11, 3, 13, 0));
  });
}
// signal: phone up at the palm, one bar at the top of the crown
{
  const sx = 294, sy = 2;
  const parts = [];
  for (let k = 0; k < 4; k++) parts.push(F(rrect(sx + k * 6.2, sy + 12 - (k + 1) * 3, 4.2, (k + 1) * 3, 0.8)));
  icon('isig', parts);
  show(icon('isig1', [F(rrect(sx, sy + 9, 4.2, 3, 0.8), 'o')]), bars(12));
}
// sea turtle visits; both doze off
{
  const x = 180, y = 122;
  show(icon('itu', [
    F(`M${x - 13} ${y}Q${x - 12} ${y - 11} ${x} ${y - 11}Q${x + 11} ${y - 11} ${x + 12} ${y}Z`, 't cut'),
    F(`M${x + 13} ${y - 4}Q${x + 14} ${y - 9} ${x + 19} ${y - 8}Q${x + 21} ${y - 4} ${x + 17} ${y - 2}Z`, 't cut'),
    Sk(`M${x - 9} ${y + 2.4}L${x - 13} ${y + 4.6}M${x + 8} ${y + 2.4}L${x + 12} ${y + 4.6}`, 'T', 2.4),
  ]), bars(13));
  const zs = [[204, 98, 7], [212, 86, 9], [222, 72, 11]];
  zs.forEach(([zx, zy, s], k) => show(icon(`iz${k}`, [Sk(text('Z', zx, zy, s).d, 'T', 1.8)]), span(13, k + 1, 14, 0)));
}
// coconut drops on a hermit crab; the crab walks off wearing it
{
  const crab = (x, y) => [
    F(`M${x - 5.4} ${y}Q${x} ${y - 7} ${x + 5.4} ${y}Z`, 't cut'),
    F(circ(x - 7.6, y - 4.4, 2.2)), F(circ(x + 7.6, y - 4.4, 2.2)),
    Sk(`M${x - 4} ${y}L${x - 7} ${y + 3}M${x + 4} ${y}L${x + 7} ${y + 3}M${x - 1.5} ${y}L${x - 3} ${y + 3.2}M${x + 1.5} ${y}L${x + 3} ${y + 3.2}`, 'T', 1.3),
  ];
  const walker = (x, y, legs) => [
    F(circ(x, y - 6, 5.6), 't cut'),
    Sk(`M${x - 2} ${y - 11}L${x - 3.6} ${y - 15.4}M${x + 2} ${y - 11}L${x + 3.6} ${y - 15.4}`, 'T', 1.3),
    Sk(legs
      ? `M${x - 4} ${y - 1}L${x - 7.6} ${y + 3}M${x + 4} ${y - 1}L${x + 7.6} ${y + 3}M${x} ${y}L${x} ${y + 3.6}`
      : `M${x - 4} ${y - 1}L${x - 5.4} ${y + 3.4}M${x + 4} ${y - 1}L${x + 5.4} ${y + 3.4}M${x - 1} ${y}L${x + 1.6} ${y + 3.6}`, 'T', 1.3),
  ];
  const cx = 324, cy = 126.5;
  show(icon('icrab', crab(cx, cy)), span(14, 0, 14, 2));
  show(icon('ifall', [F(circ(303, 88, 3.8))]), span(14, 1, 14, 2));
  show(icon('ibonk', [Sk(`M${cx - 9} ${cy - 18}L${cx - 13} ${cy - 22}M${cx} ${cy - 21}V${cy - 26.4}M${cx + 9} ${cy - 18}L${cx + 13} ${cy - 22}`, 'O', 1.8)]), span(14, 2, 14, 3));
  show(icon('iw0', walker(cx, cy, false)), span(14, 2, 14, 3));
  show(icon('iw1', walker(336, 130.5, true)), span(14, 3, 15, 0));
  show(icon('iw2', walker(348, 134, false)), span(15, 0, 15, 2));
}
// printed frame around the pictogram, and labels
print.push(rrect(PX - 7, PY - 7, PW * PS + 14, PH * PS + 10, 6));
print.push(text('ISLAND', PX - 7, PY - 19, 7.5, { track: 1.6 }).d);

// ------------------------------------------------------------------ faceplate
const FACE_TXT = '#2b3036';
{
  // brand and model, top band
  const brand = text('IDLETRONIC', 44, 17, 21, { track: 2.2 });
  face.push(`<path d="${brand.d}" fill="none" stroke="${FACE_TXT}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>`);
  const bx = 44 + brand.w + 18;
  const model = text('IR-600', bx + 10, 21, 12, { track: 1.6 });
  face.push(`<path d="${rrect(bx, 15, model.w + 20, 24, 5)}" fill="${FACE_TXT}"/>`);
  face.push(`<path d="${model.d}" fill="none" stroke="#e9ecee" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`);
  const sub = text('TEN-HOUR STEREO ISLAND RECEIVER', bx + model.w + 36, 23, 9.5, { track: 1.7 });
  face.push(`<path d="${sub.d}" fill="none" stroke="${FACE_TXT}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`);
  const right = text('ALL SOUND SYNTHESIZED FROM CODE', W - 44, 23, 9.5, { track: 1.7, anchor: 'end' });
  face.push(`<path d="${right.d}" fill="none" stroke="${FACE_TXT}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`);
  // a three-colour pinstripe: sea, sand, coral
  const sx0 = right.x0 - 120;
  ['#2bb3a6', '#e8c58e', '#ff8a6e'].forEach((c, k) => face.push(`<rect x="${sx0}" y="${20 + k * 5}" width="96" height="3" rx="1.5" fill="${c}"/>`));
}
{
  // four screws
  for (const [sx, sy] of [[18, 18], [W - 18, 18], [18, H - 18], [W - 18, H - 18]]) {
    face.push(`<circle cx="${sx}" cy="${sy}" r="6" fill="url(#btn)" stroke="#7d848c" stroke-width="1"/><path d="M${sx - 3.4} ${sy - 1.2}L${sx + 3.4} ${sy + 1.2}" stroke="#5d646b" stroke-width="1.4" stroke-linecap="round"/>`);
  }
}
{
  // bottom band: power, buttons, phones jack, volume knob
  const by = H - 52;
  face.push(`<circle cx="66" cy="${by}" r="16" fill="url(#btn)" stroke="#7d848c" stroke-width="1.2"/>`);
  face.push(`<path d="M66 ${by - 7}V${by - 1}M61.2 ${by - 4.4}A6.4 6.4 0 1 0 70.8 ${by - 4.4}" fill="none" stroke="#3b4148" stroke-width="1.8" stroke-linecap="round"/>`);
  face.push(`<circle cx="94" cy="${by - 10}" r="3" fill="#36d6c4"/><circle cx="94" cy="${by - 10}" r="5.5" fill="#36d6c4" opacity=".25"/>`);
  const lab = (s, x, y, anchor = 'middle') => {
    const t = text(s, x, y, 8, { anchor, track: 1.6 });
    face.push(`<path d="${t.d}" fill="none" stroke="${FACE_TXT}" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"/>`);
  };
  lab('POWER', 66, by + 24);
  const buttons = ['DEMO', 'SEED 1992', 'SNAP TO BAR', 'LANES', 'EXPORT MP4'];
  let x = 150;
  buttons.forEach((s) => {
    const w = 76;
    face.push(`<rect x="${x}" y="${by - 9}" width="${w}" height="18" rx="9" fill="url(#btn)" stroke="#7d848c" stroke-width="1.1"/>`);
    face.push(`<rect x="${x + 8}" y="${by - 5.5}" width="${w - 16}" height="3" rx="1.5" fill="#fff" opacity=".55"/>`);
    lab(s, x + w / 2, by + 16);
    x += w + 22;
  });
  // phones jack
  const jx = 760;
  face.push(`<circle cx="${jx}" cy="${by}" r="11" fill="url(#btn)" stroke="#7d848c" stroke-width="1.1"/><circle cx="${jx}" cy="${by}" r="5.2" fill="#16191c"/><circle cx="${jx}" cy="${by}" r="2.4" fill="#2c3136"/>`);
  lab('PHONES', jx, by + 16);
  lab('-14 LUFS', 960, by - 4, 'end');
  lab('MASTER', 960, by + 9, 'end');
  // volume knob with knurled edge and a scale
  const kx = 1100, ky = by, kr = 28;
  let ticks = '';
  for (let k = 0; k <= 10; k++) {
    const a = ((135 + k * 27) * Math.PI) / 180;
    ticks += `M${f(kx + Math.cos(a) * (kr + 5))} ${f(ky + Math.sin(a) * (kr + 5))}L${f(kx + Math.cos(a) * (kr + (k % 5 ? 8 : 11)))} ${f(ky + Math.sin(a) * (kr + (k % 5 ? 8 : 11)))}`;
  }
  face.push(`<path d="${ticks}" stroke="${FACE_TXT}" stroke-width="1.3" stroke-linecap="round"/>`);
  face.push(`<circle cx="${kx}" cy="${ky}" r="${kr}" fill="url(#knurl)" stroke="#5d646b" stroke-width="1.2"/>`);
  face.push(`<circle cx="${kx}" cy="${ky}" r="${kr - 6}" fill="url(#knob)"/>`);
  const ka = ((135 + 7 * 27) * Math.PI) / 180;
  face.push(`<path d="M${f(kx + Math.cos(ka) * 9)} ${f(ky + Math.sin(ka) * 9)}L${f(kx + Math.cos(ka) * 19)} ${f(ky + Math.sin(ka) * 19)}" stroke="#ff8a6e" stroke-width="3" stroke-linecap="round"/>`);
  lab('VOLUME', kx - kr - 18, by + 3, 'end');
}

// ------------------------------------------------------------------ assemble
const desc = 'CASTAWAY on the glowing blue-green display of an invented hi-fi receiver, the IDLETRONIC IR-600, in demo mode: a 16-segment ticker pushes in one message per bar (CASTAWAY, LO-FI ISLAND, TEN HOURS, SHE IDLES, MOSTLY, then the gags), a clock counts the 60-second theme loop, level meters follow the theme\'s score for drums, electric piano and kalimba and bounce for vinyl crackle and surf, and a pictogram island with one palm, where a young woman in a coral tank top and cream headphones sits nodding, lights up gag by gag.';
const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="ti de">
<title id="ti">CASTAWAY: the island on a hi-fi front panel</title>
<desc id="de">${desc}</desc>
<defs>
<linearGradient id="plate" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eef0f2"/><stop offset=".08" stop-color="#d9dde1"/><stop offset=".55" stop-color="#c6cbd0"/><stop offset="1" stop-color="#aeb4ba"/></linearGradient>
<pattern id="brush" width="1200" height="7" patternUnits="userSpaceOnUse">${brushLines()}</pattern>
<linearGradient id="glassg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#020708"/><stop offset=".5" stop-color="#061315"/><stop offset="1" stop-color="#040b0c"/></linearGradient>
<linearGradient id="sheen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".09"/><stop offset=".33" stop-color="#fff" stop-opacity=".025"/><stop offset=".34" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<linearGradient id="bezel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a6067"/><stop offset=".5" stop-color="#2a2e33"/><stop offset="1" stop-color="#8b9198"/></linearGradient>
<radialGradient id="btn" cx=".4" cy=".3" r=".9"><stop offset="0" stop-color="#f7f8f9"/><stop offset=".6" stop-color="#cfd3d7"/><stop offset="1" stop-color="#9aa0a6"/></radialGradient>
<radialGradient id="knob" cx=".38" cy=".32" r=".85"><stop offset="0" stop-color="#ffffff"/><stop offset=".45" stop-color="#d8dcdf"/><stop offset="1" stop-color="#8e959c"/></radialGradient>
<pattern id="knurl" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="4" height="4" fill="#9ca2a8"/><rect width="1.4" height="4" fill="#6f767d"/></pattern>
<pattern id="mesh" width="3" height="3" patternUnits="userSpaceOnUse"><path d="M0 .5H3M.5 0V3" stroke="#000" stroke-width=".6" opacity=".55"/></pattern>
<filter id="bloom" filterUnits="userSpaceOnUse" x="${DX}" y="${DY}" width="${DW}" height="${DH}" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="3.6" result="b"/><feComponentTransfer in="b" result="h"><feFuncA type="linear" slope="1.7"/></feComponentTransfer><feMerge><feMergeNode in="h"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<clipPath id="win"><rect x="${DX}" y="${DY}" width="${DW}" height="${DH}" rx="8"/></clipPath>
${defs.join('\n')}
</defs>
<style>
.t{fill:${C.lit}}.k{fill:${C.skin}}.h{fill:${C.hair}}.o{fill:${C.orange}}.c{fill:${C.coral}}.m{fill:${C.cream}}.y{fill:${C.sun}}
.s{fill:none;stroke-linecap:round;stroke-linejoin:round}.ST{stroke:${C.lit}}.Sk{stroke:${C.skin}}.SO{stroke:${C.orange}}.SM{stroke:${C.cream}}.SY{stroke:${C.sun}}.SG{stroke:${C.glass}}
.gh{opacity:.085}.cut{stroke:${C.glass};stroke-width:2.2;paint-order:stroke;stroke-linejoin:round}.pr{fill:none;stroke:${C.print};stroke-width:1.3;stroke-linecap:round;stroke-linejoin:round}
${css.join('\n')}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}
</style>
<rect x="1.5" y="1.5" width="${W - 3}" height="${H - 3}" rx="20" fill="url(#plate)" stroke="#878d94" stroke-width="2"/>
<rect x="1.5" y="1.5" width="${W - 3}" height="${H - 3}" rx="20" fill="url(#brush)"/>
<path d="M22 3.5H${W - 22}" stroke="#fff" stroke-width="1.5" opacity=".8"/>
${face.join('\n')}
<rect x="${DX - 9}" y="${DY - 9}" width="${DW + 18}" height="${DH + 18}" rx="14" fill="url(#bezel)"/>
<rect x="${DX}" y="${DY}" width="${DW}" height="${DH}" rx="8" fill="url(#glassg)"/>
<g clip-path="url(#win)">
<path class="pr" d="${print.join('')}"/>
<g class="gh">${ghost.join('')}</g>
<g filter="url(#bloom)">${lit.join('\n')}</g>
<path d="M${DX} ${DY + 70}H${DX + DW}M${DX} ${DY + 158}H${DX + DW}M${DX} ${DY + 246}H${DX + DW}" stroke="#a9c4c4" stroke-width=".5" opacity=".1"/>
<rect x="${DX}" y="${DY}" width="${DW}" height="${DH}" fill="url(#mesh)" opacity=".35"/>
<rect x="${DX}" y="${DY}" width="${DW}" height="${DH}" fill="url(#sheen)"/>
</g>
<rect x="${DX + 0.5}" y="${DY + 0.5}" width="${DW - 1}" height="${DH - 1}" rx="8" fill="none" stroke="#000" stroke-opacity=".6"/>
</svg>
`;
function brushLines() {
  const r = mulberry32(600);
  let s = '';
  for (let y = 0; y < 7; y++) {
    const o = (r() * 0.09).toFixed(3);
    s += `<rect y="${y}" width="1200" height="1" fill="${r() < 0.5 ? '#fff' : '#000'}" opacity="${o}"/>`;
  }
  return s;
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, svg);
console.log(`wrote ${path.relative(process.cwd(), OUT)} (${(Buffer.byteLength(svg) / 1024).toFixed(1)} KB)`);
