#!/usr/bin/env node
// ULTRA-SATISFACTORY README header: "Netlabel Cassette" (12-cassette-jcard_opus_5.5).
// Plain Node, no dependencies, fully deterministic (seeded PRNG, no clock).
//   node examples/ultra-satisfactory/src/12-cassette-jcard_opus_5.5.mjs
// writes examples/ultra-satisfactory/assets/12-cassette-jcard_opus_5.5.svg
//
// A flat lay on a cutting mat: a translucent orange cassette whose reels turn, the index card
// with the track list, the J-card laid open (flap, spine, front with an obi strip), and the top
// edge of a tape deck with a rolling three-digit counter and a level meter.
// The J-card keeps the real proportions: front 2 9/16 in, spine 1/2 in, flap 1 1/16 in, 4 in tall.
//
// Nothing here is <text>: every letter is a path built from three fonts defined below
// (a monoline stroke font, a heavy extended display face, and hand-built katakana), so it
// looks the same for every viewer. Animation is CSS only, so prefers-reduced-motion can
// switch it all off and leave the first frame standing.
//
// The "running times" are real: each one is that item's standard-recipe cycle time, checked
// against ultra_satisfactory.data.get_item_recipe before it was typed in here.

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(here, '../assets/12-cassette-jcard_opus_5.5.svg');

// ------------------------------------------------------------------ basics
const W = 830;
const H = 484;

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
const rand = mulberry32(0xbe17);

const f = (v) => {
  const s = (Math.round(v * 100) / 100).toString();
  return s === '-0' ? '0' : s;
};
const f1 = (v) => {
  const s = (Math.round(v * 10) / 10).toString();
  return s === '-0' ? '0' : s;
};
const f3 = (v) => (Math.round(v * 1000) / 1000).toString();

const C = {
  mat: '#0c0f14',
  navy: '#0d1742',
  navyDeep: '#080c26',
  cream: '#f1e9d3',
  paper: '#fbf8ef',
  ink: '#1c1b19',
  red: '#e2242b',
  gold: '#e8d44d',
  cyan: '#00cfff',
  purple: '#a855f7',
  pink: '#ec4899',
  blue: '#38bdf8',
  green: '#14805a',
  label: '#0b0c10',
  tape: '#2a1408',
  hole: '#090b0f',
};

// The facts. Counts and recipes are the app's own data.
const CAT = 'BH-140-211-477'; // items - machine recipes - buildings
const SIDE_A = [
  ['IRON INGOT', 2],
  ['COPPER INGOT', 2],
  ['IRON PLATE', 6],
  ['IRON ROD', 4],
  ['SCREW', 6],
  ['CABLE', 2],
];
const SIDE_B = [
  ['ROTOR', 15],
  ['SMART PLATING', 30],
  ['MODULAR FRAME', 60],
  ['VERSATILE FRAMEWORK', 24],
  ['MODULAR ENGINE', 60],
  ['ADAPTIVE CONTROL UNIT', 120],
];
const mmss = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
const sum = (side) => side.reduce((n, t) => n + t[1], 0);
const TOTAL_A = sum(SIDE_A);
const TOTAL_B = sum(SIDE_B);

// ------------------------------------------------------------------ font 1: monoline
// Skeleton capitals on a 4 x 6 grid (y 0 = cap line, y 6 = baseline). Each glyph is
// [width, strokes]; strokes are polylines "x,y x,y|x,y ...". Drawn with round caps and joins.
const O8 = '1,0 3,0 4,1 4,5 3,6 1,6 0,5 0,1 1,0';
const G = {
  A: [4, '0,6 2,0 4,6|0.8,3.9 3.2,3.9'],
  B: [4, '0,0 0,6 3,6 4,5 4,4 3,3 0,3|0,0 2.8,0 3.7,0.9 3.7,2.1 2.8,3'],
  C: [4, '4,1 3,0 1,0 0,1 0,5 1,6 3,6 4,5'],
  D: [4, '0,0 0,6 2.6,6 4,4.6 4,1.4 2.6,0 0,0'],
  E: [3.7, '3.7,0 0,0 0,6 3.7,6|0,3 2.9,3'],
  F: [3.7, '3.7,0 0,0 0,6|0,3 2.9,3'],
  G: [4, '4,1 3,0 1,0 0,1 0,5 1,6 3,6 4,5 4,3.2 2.3,3.2'],
  H: [4, '0,0 0,6|4,0 4,6|0,3 4,3'],
  I: [0.4, '0.2,0 0.2,6'],
  J: [3.4, '3.4,0 3.4,5 2.4,6 1,6 0,5'],
  K: [4, '0,0 0,6|3.8,0 0,3.7|1.5,2.5 4,6'],
  L: [3.5, '0,0 0,6 3.5,6'],
  M: [4.6, '0,6 0,0 2.3,3.4 4.6,0 4.6,6'],
  N: [4, '0,6 0,0 4,6 4,0'],
  O: [4, O8],
  P: [4, '0,6 0,0 3,0 4,1 4,2.4 3,3.4 0,3.4'],
  Q: [4, `${O8}|2.4,4.4 4.2,6.5`],
  R: [4, '0,6 0,0 3,0 4,1 4,2.4 3,3.4 0,3.4|2.2,3.4 4,6'],
  S: [4, '4,1 3,0 1,0 0,1 0,2 1,3 3,3 4,4 4,5 3,6 1,6 0,5'],
  T: [4, '0,0 4,0|2,0 2,6'],
  U: [4, '0,0 0,5 1,6 3,6 4,5 4,0'],
  V: [4, '0,0 2,6 4,0'],
  W: [5.2, '0,0 1.2,6 2.6,2 4,6 5.2,0'],
  X: [4, '0,0 4,6|4,0 0,6'],
  Y: [4, '0,0 2,3.2 4,0|2,3.2 2,6'],
  Z: [4, '0,0 4,0 0,6 4,6'],
  0: [4, O8],
  1: [4, '1,1.4 2.4,0 2.4,6'],
  2: [4, '0,1 1,0 3,0 4,1 4,2.2 0,6 4,6'],
  3: [4, '0,1 1,0 3,0 4,1 4,2 3,3 1.6,3|3,3 4,4 4,5 3,6 1,6 0,5'],
  4: [4, '3.2,6 3.2,0 0,4.2 4,4.2'],
  5: [4, '4,0 0.3,0 0,2.7 3,2.7 4,3.7 4,5 3,6 1,6 0,5'],
  6: [4, '3.7,0.7 3,0 1,0 0,1 0,5 1,6 3,6 4,5 4,3.8 3,2.8 1,2.8 0,3.8'],
  7: [4, '0,0 4,0 1.6,6'],
  8: [4, '1,0 3,0 3.8,0.8 3.8,2.2 3,3 1,3 0.2,2.2 0.2,0.8 1,0|1,3 0,4 0,5 1,6 3,6 4,5 4,4 3,3'],
  9: [4, '0.3,5.3 1,6 3,6 4,5 4,1 3,0 1,0 0,1 0,2.2 1,3.2 3,3.2 4,2.2'],
  ' ': [2.4, ''],
  '.': [0.5, '0.25,5.75 0.25,6'],
  ',': [0.8, '0.6,5.6 0.1,7.1'],
  ':': [0.5, '0.25,1.9 0.25,2.15|0.25,5.75 0.25,6'],
  '-': [2.6, '0.2,3.2 2.4,3.2'],
  '·': [1.4, '0.7,2.95 0.7,3.2'],
  '/': [2.8, '0,6.5 2.8,-0.5'],
  '(': [1.5, '1.5,-0.6 0.2,1.2 0.2,4.8 1.5,6.6'],
  ')': [1.5, '0,-0.6 1.3,1.2 1.3,4.8 0,6.6'],
  '+': [3.4, '0,3.2 3.4,3.2|1.7,1.5 1.7,4.9'],
  '=': [3.4, '0,2.2 3.4,2.2|0,4.2 3.4,4.2'],
  '&': [4.4, '4.4,6 0.9,1.8 0.9,0.9 1.7,0 2.4,0 3.2,0.9 3.2,1.7 0,4.2 0,5 1,6 2.4,6 4.3,3.5'],
  "'": [0.5, '0.25,0 0.25,1.5'],
  '!': [0.5, '0.25,0 0.25,4|0.25,5.75 0.25,6'],
  '?': [3.6, '0,1 1,0 2.6,0 3.6,1 3.6,2 1.8,3.4 1.8,4.2|1.8,5.75 1.8,6'],
  '×': [3, '0.2,2.6 2.8,5.8|2.8,2.6 0.2,5.8'],
  '¥': [4, '0,0 2,3 4,0|2,3 2,6|0.6,3.5 3.4,3.5|0.6,4.8 3.4,4.8'],
  '→': [4.6, '0,3.2 4.6,3.2|3,1.6 4.6,3.2 3,4.8'],
  '↓': [3.2, '1.6,0.4 1.6,6|0,4.4 1.6,6 3.2,4.4'],
};
for (const k of Object.keys(G)) {
  G[k] = [G[k][0], G[k][1] ? G[k][1].split('|').map((st) => st.split(' ').map((p) => p.split(',').map(Number))) : []];
}

const MONO_CX = 0.86; // glyphs are drawn a little condensed
const MONO_GAP = 1.5;
function monoWidth(str, cap, o = {}) {
  const s = cap / 6;
  const cx = o.cx ?? MONO_CX;
  const gap = o.gap ?? MONO_GAP;
  let w = 0;
  const chars = [...str.toUpperCase()];
  chars.forEach((ch, i) => {
    const g = G[ch];
    if (!g) throw new Error(`mono font has no glyph for "${ch}" in "${str}"`);
    w += g[0] * cx + (i < chars.length - 1 ? gap : 0);
  });
  return w * s;
}
// Returns path data. (x, y) is the baseline start; o.a = 's' | 'm' | 'e'.
function monoD(str, x, y, cap, o = {}) {
  const s = cap / 6;
  const cx = o.cx ?? MONO_CX;
  const gap = o.gap ?? MONO_GAP;
  const total = monoWidth(str, cap, o);
  let pen = x - (o.a === 'm' ? total / 2 : o.a === 'e' ? total : 0);
  let d = '';
  for (const ch of [...str.toUpperCase()]) {
    const g = G[ch];
    for (const st of g[1]) {
      const pts = st.map(([px, py]) => [pen + px * cx * s, y + (py - 6) * s]);
      if (o.round) {
        d += filletPath(pts, o.round * s);
      } else {
        let cxr = Math.round(pts[0][0] * 10) / 10;
        let cyr = Math.round(pts[0][1] * 10) / 10;
        d += `M${f1(cxr)} ${f1(cyr)}`;
        let seg = 'l';
        for (let i = 1; i < pts.length; i++) {
          const nx = Math.round(pts[i][0] * 10) / 10;
          const ny = Math.round(pts[i][1] * 10) / 10;
          const dx = f1(nx - cxr);
          const dy = f1(ny - cyr);
          seg += `${i > 1 && !dx.startsWith('-') ? ' ' : ''}${dx}${dy.startsWith('-') ? '' : ' '}${dy}`;
          cxr = nx;
          cyr = ny;
        }
        d += seg;
      }
    }
    pen += (g[0] * cx + gap) * s;
  }
  return d;
}
// Polyline with rounded corners (used for the larger lettering).
function filletPath(pts, r) {
  const closed = pts.length > 2 && pts[0][0] === pts[pts.length - 1][0] && pts[0][1] === pts[pts.length - 1][1];
  const P = closed ? pts.slice(0, -1) : pts;
  const n = P.length;
  const corner = (i) => {
    const p = P[i];
    const a = P[(i - 1 + n) % n];
    const b = P[(i + 1) % n];
    const la = Math.hypot(p[0] - a[0], p[1] - a[1]);
    const lb = Math.hypot(b[0] - p[0], b[1] - p[1]);
    const c = Math.min(r, la / 2, lb / 2);
    return {
      in: [p[0] + ((a[0] - p[0]) / la) * c, p[1] + ((a[1] - p[1]) / la) * c],
      out: [p[0] + ((b[0] - p[0]) / lb) * c, p[1] + ((b[1] - p[1]) / lb) * c],
      p,
    };
  };
  let d = '';
  if (closed) {
    const c0 = corner(0);
    d += `M${f(c0.out[0])} ${f(c0.out[1])}`;
    for (let i = 1; i <= n; i++) {
      const c = corner(i % n);
      d += `L${f(c.in[0])} ${f(c.in[1])}Q${f(c.p[0])} ${f(c.p[1])} ${f(c.out[0])} ${f(c.out[1])}`;
    }
    d += 'Z';
  } else {
    d += `M${f(P[0][0])} ${f(P[0][1])}`;
    for (let i = 1; i < n - 1; i++) {
      const c = corner(i);
      d += `L${f(c.in[0])} ${f(c.in[1])}Q${f(c.p[0])} ${f(c.p[1])} ${f(c.out[0])} ${f(c.out[1])}`;
    }
    d += `L${f(P[n - 1][0])} ${f(P[n - 1][1])}`;
  }
  return d;
}

// Stroke classes are collected as they are used: one class per colour + weight.
const strokeCls = new Map();
function sc(color, sw) {
  const key = `${color}|${f(sw)}`;
  if (!strokeCls.has(key)) strokeCls.set(key, `q${strokeCls.size.toString(36)}`);
  return strokeCls.get(key);
}
// Monoline text as one <path>. o.w = weight factor (stroke / cap height), o.sw = absolute stroke.
function T(str, x, y, cap, color, o = {}) {
  const sw = o.sw ?? Math.max(0.9, cap * (o.w ?? 0.15));
  return `<path class="m ${sc(color, sw)}" d="${monoD(str, x, y, cap, o)}"/>`;
}

// ------------------------------------------------------------------ font 2: heavy extended display
// Built from a uniform stroke (horizontal bars) and then stretched sideways, which thickens the
// stems and widens the bowls: the heavy extended grotesque look, with my own letter construction.
// Only the letters the artwork needs. Coordinates are pre-stretch; (w, h) letter box, t stroke.
function dglyph(ch, ox, w, h, t) {
  const a = t / 2;
  const L = ox + a;
  const R = ox + w - a;
  const Tt = a;
  const B = h - a;
  const M = h / 2;
  const r = Math.max(0.1, Math.min((w - t) / 2, (h / 2 - a) / 2)); // bowls of S, R, B, 2, 5
  const rU = Math.max(0.1, Math.min((w - t) / 2, h * 0.3)); // U, O, C, D
  const tw = t * 1.2; // horizontal thickness of a diagonal
  // Every filled piece is wound the same way (clockwise on screen, like `rect` below), so
  // overlapping pieces of one letter add up under the nonzero fill rule instead of cancelling.
  const poly = (pts) => {
    let area = 0;
    pts.forEach((p, i) => {
      const q = pts[(i + 1) % pts.length];
      area += p[0] * q[1] - q[0] * p[1];
    });
    const P = area < 0 ? [...pts].reverse() : pts;
    return `M${P.map((p) => `${f(p[0])} ${f(p[1])}`).join('L')}Z`;
  };
  const rect = (x, y, ww, hh) => `M${f(x)} ${f(y)}h${f(ww)}v${f(hh)}h${f(-ww)}z`;
  const arc = (rr, sweep, dx, dy) => `a${f(rr)} ${f(rr)} 0 0 ${sweep} ${f(dx)} ${f(dy)}`;
  const X = ox + w;
  switch (ch) {
    case 'U':
      return { s: `M${f(L)} 0V${f(B - rU)}${arc(rU, 0, rU, rU)}H${f(R - rU)}${arc(rU, 0, rU, -rU)}V0`, adv: w };
    case 'L':
      return { s: `M${f(L)} 0V${f(B)}H${f(X)}`, adv: w * 0.94 };
    case 'T':
      return { s: `M${f(ox)} ${f(Tt)}H${f(X)}M${f(ox + w / 2)} 0V${f(h)}`, adv: w };
    case 'I':
      return { s: `M${f(L)} 0V${f(h)}`, adv: t };
    case 'E':
      return { s: `M${f(X)} ${f(Tt)}H${f(L)}V${f(B)}H${f(X)}M${f(L)} ${f(M)}H${f(ox + w * 0.86)}`, adv: w * 0.96 };
    case 'F':
      return { s: `M${f(X)} ${f(Tt)}H${f(L)}V${f(h)}M${f(L)} ${f(M)}H${f(ox + w * 0.82)}`, adv: w * 0.96 };
    case 'O':
    case '0':
      return {
        s: `M${f(L + rU)} ${f(Tt)}H${f(R - rU)}${arc(rU, 1, rU, rU)}V${f(B - rU)}${arc(rU, 1, -rU, rU)}H${f(L + rU)}${arc(rU, 1, -rU, -rU)}V${f(Tt + rU)}${arc(rU, 1, rU, -rU)}Z`,
        adv: w,
      };
    case 'C':
      return { s: `M${f(X)} ${f(Tt)}H${f(L + rU)}${arc(rU, 0, -rU, rU)}V${f(B - rU)}${arc(rU, 0, rU, rU)}H${f(X)}`, adv: w * 0.97 };
    case 'D':
      return { s: `M${f(L)} ${f(Tt)}H${f(R - rU)}${arc(rU, 1, rU, rU)}V${f(B - rU)}${arc(rU, 1, -rU, rU)}H${f(L)}Z`, adv: w };
    case 'S':
      return {
        s: `M${f(X)} ${f(Tt)}H${f(L + r)}${arc(r, 0, -r, r)}V${f(M - r)}${arc(r, 0, r, r)}H${f(R - r)}${arc(r, 1, r, r)}V${f(B - r)}${arc(r, 1, -r, r)}H${f(ox)}`,
        adv: w,
      };
    case 'R':
      return {
        s: `M${f(L)} ${f(h)}V${f(Tt)}H${f(R - r)}${arc(r, 1, r, r)}V${f(M - r)}${arc(r, 1, -r, r)}H${f(L)}`,
        f: poly([[ox + w * 0.38, M - a * 0.4], [ox + w * 0.38 + tw, M - a * 0.4], [X, h], [X - tw, h]]),
        adv: w,
      };
    case 'B': {
      const Rb = R - w * 0.05;
      return {
        s: `M${f(L)} 0V${f(h)}M${f(L)} ${f(Tt)}H${f(Rb - r)}${arc(r, 1, r, r)}V${f(M - r)}${arc(r, 1, -r, r)}H${f(L)}M${f(L)} ${f(M)}H${f(R - r)}${arc(r, 1, r, r)}V${f(B - r)}${arc(r, 1, -r, r)}H${f(L)}`,
        adv: w,
      };
    }
    case 'A': {
      const twA = t * 0.9;
      const ap = t * 0.36;
      const c = ox + w / 2;
      return {
        f:
          poly([[ox, h], [ox + twA, h], [c + ap / 2, 0], [c - ap / 2, 0]]) +
          poly([[X - twA, h], [X, h], [c + ap / 2, 0], [c - ap / 2, 0]]) +
          rect(ox + w * 0.2, h * 0.7, w * 0.6, t * 0.55),
        adv: w,
      };
    }
    case 'Y': {
      const c = ox + w / 2;
      const ym = h * 0.52;
      return {
        f:
          poly([[ox, 0], [ox + tw, 0], [c + a, ym], [c - a, ym]]) +
          poly([[X - tw, 0], [X, 0], [c + a, ym], [c - a, ym]]) +
          rect(c - a, ym - a * 0.7, t, h - ym + a * 0.7),
        adv: w,
      };
    }
    case '¥': {
      const c = ox + w / 2;
      const ym = h * 0.46;
      return {
        f:
          poly([[ox, 0], [ox + tw, 0], [c + a, ym], [c - a, ym]]) +
          poly([[X - tw, 0], [X, 0], [c + a, ym], [c - a, ym]]) +
          rect(c - a, ym - a * 0.7, t, h - ym + a * 0.7) +
          rect(ox + w * 0.1, h * 0.5, w * 0.8, t * 0.5) +
          rect(ox + w * 0.1, h * 0.72, w * 0.8, t * 0.5),
        adv: w,
      };
    }
    case '1': {
      const wn = w * 0.58;
      return { s: `M${f(ox)} ${f(Tt)}H${f(ox + wn - a)}V${f(h)}`, adv: wn };
    }
    case '2':
      return {
        s: `M${f(ox)} ${f(Tt)}H${f(R - r)}${arc(r, 1, r, r)}V${f(M - r)}${arc(r, 1, -r, r)}H${f(L + r)}${arc(r, 0, -r, r)}V${f(B)}H${f(X)}`,
        adv: w,
      };
    case '4': {
      const xs = X - a - w * 0.14;
      return { s: `M${f(L)} 0V${f(h * 0.64)}H${f(X)}M${f(xs)} 0V${f(h)}`, adv: w };
    }
    case '5':
      return {
        s: `M${f(X)} ${f(Tt)}H${f(L)}V${f(M)}H${f(R - r)}${arc(r, 1, r, r)}V${f(B - r)}${arc(r, 1, -r, r)}H${f(ox)}`,
        adv: w,
      };
    case '7':
      return {
        s: `M${f(ox)} ${f(Tt)}H${f(X - tw * 0.5)}`,
        f: poly([[X - tw, 0], [X, 0], [ox + w * 0.26 + tw, h], [ox + w * 0.26, h]]),
        adv: w,
      };
    case '-':
      return { s: `M${f(ox)} ${f(M)}H${f(ox + w * 0.5)}`, adv: w * 0.5 };
    case ' ':
      return { adv: w * 0.45 };
    default:
      throw new Error(`display font has no glyph for "${ch}"`);
  }
}
// o: { w: letter width after stretch, t: bar thickness, gap: letter gap after stretch, sx: stretch }
function dispLayout(str, h, o) {
  const sx = o.sx ?? 1.3;
  const w0 = o.w / sx;
  const gap0 = o.gap / sx;
  let ox = 0;
  let s = '';
  let fl = '';
  const chars = [...str];
  chars.forEach((ch, i) => {
    const g = dglyph(ch, ox, w0, h, o.t);
    if (g.s) s += g.s;
    if (g.f) fl += g.f;
    ox += g.adv + (i < chars.length - 1 ? gap0 : 0);
  });
  return { s, f: fl, width: ox * sx, sx };
}
const dispWidth = (str, h, o) => dispLayout(str, h, o).width;
// (x, y) is the top-left of the cap box; o.a aligns on x.
function D(str, x, y, h, color, o) {
  const lay = dispLayout(str, h, o);
  const x0 = x - (o.a === 'm' ? lay.width / 2 : o.a === 'e' ? lay.width : 0);
  return (
    `<g transform="translate(${f(x0)} ${f(y)}) scale(${f(lay.sx)} 1)">` +
    (lay.s ? `<path fill="none" stroke="${color}" stroke-width="${f(o.t)}" d="${lay.s}"/>` : '') +
    (lay.f ? `<path fill="${color}" d="${lay.f}"/>` : '') +
    '</g>'
  );
}
// Letter width that makes a word exactly `target` wide.
function fitW(str, h, o, target) {
  let lo = 2;
  let hi = 80;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (dispWidth(str, h, { ...o, w: mid }) > target) hi = mid;
    else lo = mid;
  }
  return lo;
}

// ------------------------------------------------------------------ font 3: katakana
// Rounded-gothic katakana on a 10 x 10 cell, stroke by stroke. Used once, down the obi strip:
// ウルトラ・サティスファクトリー, the project name in katakana.
const KANA = {
  ウ: 'M5 0.7V2.5M1.6 2.7V5.5M1.6 2.7H8.4Q8.4 7 3.6 9.5',
  ル: 'M3.3 1.6V5.2Q3.3 8.2 0.9 9.5M6.2 0.8V9.2Q8.6 8.4 9.5 5.6',
  ト: 'M3.4 0.6V9.5M3.4 3.5Q6 4.5 8.6 6.5',
  ラ: 'M2.4 1.2H7.6M1.2 4.1H8.8Q8.6 8 3.2 9.6',
  サ: 'M0.7 3.3H9.3M3 0.9V6M7 0.9V5.4Q7 8.4 3.8 9.6',
  テ: 'M2.3 1.2H7.7M0.8 4.1H9.2M5.2 4.1Q5.4 7.8 2.6 9.6',
  イ: 'M7.6 0.8Q5.4 3.8 1.2 5.6M5.1 3.5V9.6',
  ス: 'M1.6 1.5H8Q7 6.6 1 9.5M5.4 5.9L9.1 9.5',
  フ: 'M1.2 1.6H8.8Q8.6 7 2.8 9.6',
  ア: 'M0.9 1.6H9.1Q8.4 3.6 6.4 4.5M5 3.5Q5.2 7.4 1.9 9.6',
  ク: 'M4.2 0.7Q3.4 3.2 1 5.1M3.9 2H8.7Q8.5 7 2.7 9.6',
  リ: 'M2.6 1.1V6.1M7.4 0.8V5.4Q7.4 8.4 4 9.6',
  ー: 'M5 0.9V9.1', // the long-vowel mark stands upright in vertical setting
};
// Vertical setting: small kana (ィ, ァ) sit top-right in their cell. `cells` is a list of
// [glyph, small?] or '・'. (x, y) is the top-left of the first cell.
function kanaColumn(cells, x, y, cell, color, swPx) {
  const k = cell / 10;
  const pitch = 10.35;
  let out = `<g transform="translate(${f(x)} ${f(y)}) scale(${f(k)})" fill="none" stroke="${color}" stroke-width="${f(swPx / k)}" stroke-linecap="round" stroke-linejoin="round">`;
  cells.forEach((c, i) => {
    const ty = i * pitch;
    if (c === '・') {
      out += `<circle cx="5" cy="${f(ty + 5)}" r="1.05" fill="${color}" stroke="none"/>`;
    } else if (c[1]) {
      out += `<path transform="translate(2.7 ${f(ty + 0.5)}) scale(.72)" stroke-width="${f(swPx / k / 0.78)}" d="${KANA[c[0]]}"/>`;
    } else {
      out += `<path ${ty ? `transform="translate(0 ${f(ty)})" ` : ''}d="${KANA[c[0]]}"/>`;
    }
  });
  return out + '</g>';
}

// ------------------------------------------------------------------ small shape helpers
const rr = (x, y, w, h, r) =>
  `M${f(x + r)} ${f(y)}h${f(w - 2 * r)}a${f(r)} ${f(r)} 0 0 1 ${f(r)} ${f(r)}v${f(h - 2 * r)}a${f(r)} ${f(r)} 0 0 1 ${f(-r)} ${f(r)}h${f(-(w - 2 * r))}a${f(r)} ${f(r)} 0 0 1 ${f(-r)} ${f(-r)}v${f(-(h - 2 * r))}a${f(r)} ${f(r)} 0 0 1 ${f(r)} ${f(-r)}z`;

// A soft shadow without a filter: a few stacked, slightly growing translucent shapes.
function softShadow(x, y, w, h, r, dx, dy, strength = 1) {
  let out = '';
  [[0, 0.3], [2.5, 0.16], [6, 0.1], [11, 0.06]].forEach(([g, o]) => {
    out += `<rect x="${f(x + dx - g)}" y="${f(y + dy - g)}" width="${f(w + 2 * g)}" height="${f(h + 2 * g)}" rx="${f(r + g)}" fill="#000" opacity="${f(o * strength)}"/>`;
  });
  return out;
}

// Tick box, optionally crossed.
function tickBox(x, y, s, color, crossed, crossColor) {
  let out = `<rect x="${f(x)}" y="${f(y)}" width="${f(s)}" height="${f(s)}" fill="none" stroke="${color}" stroke-width=".9"/>`;
  if (crossed) out += `<path class="m ${sc(crossColor, 1.3)}" d="M${f(x - 0.8)} ${f(y - 0.6)}L${f(x + s + 0.9)} ${f(y + s + 0.8)}M${f(x + s + 1.2)} ${f(y - 1)}L${f(x - 0.6)} ${f(y + s + 0.6)}"/>`;
  return out;
}

// The invented label mark: a conveyor belt that is also a pair of reels.
function beltMark(x, y, s, color, bg) {
  return (
    `<g transform="translate(${f(x)} ${f(y)}) scale(${f(s)})">` +
    `<rect x=".8" y=".8" width="22.4" height="10.4" rx="5.2" fill="${bg}" stroke="${color}" stroke-width="1.6"/>` +
    `<circle cx="6" cy="6" r="2" fill="${color}"/><circle cx="18" cy="6" r="2" fill="${color}"/>` +
    `<path d="M10.2 6h3.6" stroke="${color}" stroke-width="1.2" stroke-linecap="round"/>` +
    '</g>'
  );
}

// ------------------------------------------------------------------ timeline
const TRK = 3; // seconds each track stays highlighted
const NPS = 6; // tracks per side
const PLAY = TRK * NPS; // one side
const FLIP = 1.5; // eject, turn over, press play
const TH = PLAY + FLIP; // pack / reel cycle (the same for both sides)
const TT = TH * 2; // whole loop: side A, flip, side B, flip
const MID = PLAY + FLIP / 2; // the cassette is edge-on here
const pH = (t) => `${f3((t / TH) * 100)}%`;
const pT = (t) => `${f3((t / TT) * 100)}%`;

// ------------------------------------------------------------------ the cassette
// Drawn in millimetres (the real shell is 100.4 x 63.8 mm) and scaled by K.
const K = 3.34;
const SW_MM = 100.4;
const SH_MM = 63.8;
const mm = (v) => v * K;
const CAS = { cx: 190, cy: 135, rot: -2.4, w: mm(SW_MM), h: mm(SH_MM) };

const HUB_L = [29, 29.2];
const HUB_R = [71.4, 29.2];
const R_EMPTY = 11.5; // mm, a few turns left on the hub
const R_FULL = 23.4;
const ROLL_L = [8.4, 57.4];
const ROLL_R = [92, 57.4];
const ROLL_RAD = 2.5;
const TURNS = 8; // full turns of each hub per side

const packSupply = (u) => Math.sqrt(R_FULL ** 2 - (R_FULL ** 2 - R_EMPTY ** 2) * u);
const packTakeup = (u) => Math.sqrt(R_EMPTY ** 2 + (R_FULL ** 2 - R_EMPTY ** 2) * u);
// Constant tape speed: a hub turns faster the smaller its pack. Angle = integral of v / r.
const DEG_PER_MM = (TURNS * 360) / (R_FULL - R_EMPTY);
const angSupply = (u) => -DEG_PER_MM * (R_FULL - packSupply(u));
const angTakeup = (u) => -DEG_PER_MM * (packTakeup(u) - R_EMPTY);
// Tape from a guide roller to the pack: tangent from a point to a circle.
function tapeLine(side, r) {
  const hub = side === 'l' ? HUB_L : HUB_R;
  const P = side === 'l' ? [ROLL_L[0] - ROLL_RAD, ROLL_L[1]] : [ROLL_R[0] + ROLL_RAD, ROLL_R[1]];
  const dx = hub[0] - P[0];
  const dy = hub[1] - P[1];
  const d = Math.hypot(dx, dy);
  const base = Math.atan2(dy, dx);
  const off = Math.asin(r / d);
  const len = Math.sqrt(d * d - r * r);
  const ang = side === 'l' ? base - off : base + off;
  return { P, ang: (ang * 180) / Math.PI, len: mm(len) };
}

function cassetteKeyframes() {
  const N = 12;
  const k = { pa: '', pb: '', ra: '', rb: '', ta: '', tb: '' };
  const frame = (t, u) => {
    const rs = packSupply(u);
    const rt = packTakeup(u);
    const tl = tapeLine('l', rs);
    const tr = tapeLine('r', rt);
    k.pa += `${pH(t)}{transform:scale(${f(mm(rs))})}`;
    k.pb += `${pH(t)}{transform:scale(${f(mm(rt))})}`;
    k.ta += `${pH(t)}{transform:rotate(${f(tl.ang)}deg) scaleX(${f(tl.len)})}`;
    k.tb += `${pH(t)}{transform:rotate(${f(tr.ang)}deg) scaleX(${f(tr.len)})}`;
    return [rs, rt];
  };
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const t = u * PLAY;
    frame(t, u);
    k.ra += `${pH(t)}{transform:rotate(${f(angSupply(u))}deg)}`;
    k.rb += `${pH(t)}{transform:rotate(${f(angTakeup(u))}deg)}`;
  }
  // Hold to the middle of the flip, swap the packs while the shell is edge-on, hold to the end.
  frame(MID, 1);
  frame(MID + 0.003, 0);
  frame(TH, 0);
  k.ra += `100%{transform:rotate(${f(angSupply(1))}deg)}`;
  k.rb += `100%{transform:rotate(${f(angTakeup(1))}deg)}`;
  return k;
}

function cassette() {
  const w = CAS.w;
  const h = CAS.h;
  const p = (pt) => `${f(mm(pt[0]))} ${f(mm(pt[1]))}`;
  const t0l = tapeLine('l', R_FULL);
  const t0r = tapeLine('r', R_EMPTY);
  let o = '';

  // --- shell base and the things inside it
  o += `<rect width="${f(w)}" height="${f(h)}" rx="${f(mm(2.3))}" fill="#c4400a"/>`;
  o += `<rect x="${f(mm(2.2))}" y="${f(mm(2.2))}" width="${f(w - mm(4.4))}" height="${f(h - mm(4.4))}" rx="${f(mm(1.4))}" fill="#d84d0e"/>`;
  // tape path along the bottom edge, and the guide rollers
  o += `<path d="M${p([ROLL_L[0], ROLL_L[1] + ROLL_RAD])}H${f(mm(ROLL_R[0]))}" stroke="${C.tape}" stroke-width="1.3"/>`;
  for (const R of [ROLL_L, ROLL_R]) {
    o += `<circle cx="${f(mm(R[0]))}" cy="${f(mm(R[1]))}" r="${f(mm(ROLL_RAD))}" fill="#fff0de"/>`;
    o += `<circle cx="${f(mm(R[0]))}" cy="${f(mm(R[1]))}" r="${f(mm(0.9))}" fill="#c9a27e"/>`;
  }
  // pressure pad behind the head opening
  o += `<rect x="${f(mm(46.7))}" y="${f(mm(60.2))}" width="${f(mm(7))}" height="${f(mm(1.7))}" rx="1" fill="#e8c9a0"/>`;
  // tape from each roller up to its pack
  o += `<g transform="translate(${p(t0l.P)})"><path class="tl ta" d="M0 0H1"/></g>`;
  o += `<g transform="translate(${p(t0r.P)})"><path class="tl tb" d="M0 0H1"/></g>`;
  // packs and spools
  const spool = (cls) => {
    let s = `<g class="${cls}">`;
    s += `<circle r="${f(mm(10.7))}" fill="#fff1e0"/>`;
    s += `<circle r="${f(mm(10.7))}" fill="none" stroke="#e3bf9c" stroke-width="1.2"/>`;
    // leader clamp and three windows in the spool, so the turning is easy to see
    s += `<path d="M${f(mm(8.4))} ${f(-mm(1.5))}h${f(mm(2.3))}v${f(mm(3))}h${f(-mm(2.3))}z" fill="#d9a67a"/>`;
    for (let i = 0; i < 3; i++) {
      const a0 = ((i * 120 + 150) * Math.PI) / 180;
      const a1 = ((i * 120 + 210) * Math.PI) / 180;
      const rad = mm(8.3);
      s += `<path d="M${f(Math.cos(a0) * rad)} ${f(Math.sin(a0) * rad)}A${f(rad)} ${f(rad)} 0 0 1 ${f(Math.cos(a1) * rad)} ${f(Math.sin(a1) * rad)}" fill="none" stroke="#e7b58c" stroke-width="${f(mm(1.5))}" stroke-linecap="round"/>`;
    }
    return s + '</g>';
  };
  o += `<g transform="translate(${p(HUB_L)})"><circle class="pk pa" r="1" fill="url(#tp)"/>${spool('ra')}</g>`;
  o += `<g transform="translate(${p(HUB_R)})"><circle class="pk pb" r="1" fill="url(#tp)"/>${spool('rb')}</g>`;

  // --- the orange plastic in front of all that
  o += `<rect width="${f(w)}" height="${f(h)}" rx="${f(mm(2.3))}" fill="url(#shell)" opacity=".42"/>`;

  // --- bottom trapezoid (head area), its holes, the fifth screw
  o += `<path d="M${p([15.2, SH_MM])}L${p([20.4, 49.6])}H${f(mm(80))}L${p([85.2, SH_MM])}Z" fill="#ff7a26" opacity=".62"/>`;
  o += `<path d="M${p([15.2, SH_MM])}L${p([20.4, 49.6])}H${f(mm(80))}L${p([85.2, SH_MM])}" fill="none" stroke="#ffb27d" stroke-width=".9" opacity=".8"/>`;
  for (const x of [33.6, 66.8]) o += `<circle cx="${f(mm(x))}" cy="${f(mm(57.6))}" r="${f(mm(2.25))}" fill="${C.hole}"/><circle cx="${f(mm(x))}" cy="${f(mm(57.6))}" r="${f(mm(2.25))}" fill="none" stroke="#a83806" stroke-width=".9"/>`;
  for (const x of [23.2, 75]) o += `<rect x="${f(mm(x))}" y="${f(mm(57))}" width="${f(mm(2.2))}" height="${f(mm(2.6))}" rx="1" fill="${C.hole}"/>`;

  // --- hub holes: see-through, with the toothed hub turning inside
  const teeth = (cls) => {
    let d = '';
    for (let i = 0; i < 6; i++) {
      const a = (i * 60 * Math.PI) / 180;
      d += `M${f(Math.cos(a) * mm(2.75))} ${f(Math.sin(a) * mm(2.75))}L${f(Math.cos(a) * mm(4.4))} ${f(Math.sin(a) * mm(4.4))}`;
    }
    return `<g class="${cls}"><circle r="${f(mm(4.85))}" fill="none" stroke="#fdf5ea" stroke-width="${f(mm(1.35))}"/><path d="${d}" stroke="#fdf5ea" stroke-width="${f(mm(1.35))}"/></g>`;
  };
  for (const [hub, cls] of [[HUB_L, 'ra'], [HUB_R, 'rb']]) {
    o += `<g transform="translate(${p(hub)})"><circle r="${f(mm(5.55))}" fill="${C.hole}"/>${teeth(cls)}<circle r="${f(mm(5.7))}" fill="none" stroke="#a83806" stroke-width="1.1"/></g>`;
  }

  // --- the label, with its cut-out around the hubs and window
  const lx = mm(5.2);
  const ly = mm(4.2);
  const lw = mm(90);
  const lh = mm(38.3);
  const cxo = mm(17.5);
  const cyo = mm(19.6);
  const cw = mm(65.4);
  const ch = mm(19.2);
  o += `<path fill-rule="evenodd" fill="${C.label}" d="${rr(lx, ly, lw, lh, mm(1.5))}${rr(cxo, cyo, cw, ch, mm(3))}"/>`;
  o += `<path fill-rule="evenodd" fill="none" stroke="${C.gold}" stroke-width=".7" opacity=".75" d="${rr(lx + 2.2, ly + 2.2, lw - 4.4, lh - 4.4, mm(1))}${rr(cxo - 2.2, cyo - 2.2, cw + 4.4, ch + 4.4, mm(3.4))}"/>`;
  // window between the hubs, with a little scale
  o += `<rect x="${f(mm(36.6))}" y="${f(mm(22.9))}" width="${f(mm(27.2))}" height="${f(mm(12.6))}" rx="2.5" fill="#fff" opacity=".13"/>`;
  o += `<rect x="${f(mm(36.6))}" y="${f(mm(22.9))}" width="${f(mm(27.2))}" height="${f(mm(12.6))}" rx="2.5" fill="none" stroke="#ffc9a0" stroke-width=".9" opacity=".85"/>`;
  let ticks = '';
  for (let i = 0; i <= 10; i++) ticks += `M${f(mm(39.2 + i * 2.2))} ${f(mm(35.5))}v${f(-(i % 5 === 0 ? mm(1.7) : mm(0.9)))}`;
  o += `<path d="${ticks}" stroke="#ffe3cc" stroke-width=".8" opacity=".8"/>`;

  // label print: top strip
  const tx = lx + 9;
  const tw = lw - 18;
  o += T('BELT HISS TAPES', tx, ly + 11.5, 5.4, C.gold, { w: 0.17 });
  o += T(CAT, tx + tw, ly + 11.5, 5.4, C.gold, { w: 0.17, a: 'e' });
  const titleOpt = { t: 4.1, gap: 2.3, sx: 1.28 };
  const capT = 20;
  const lwAll = fitW('ULTRA-SATISFACTORY', capT, titleOpt, tw);
  const to = { ...titleOpt, w: lwAll };
  const wUltra = dispWidth('ULTRA', capT, to);
  o += D('ULTRA', tx, ly + 17, capT, C.cyan, to);
  o += D('-SATISFACTORY', tx + wUltra + to.gap, ly + 17, capT, '#ffffff', to);
  o += T('VARIOUS MACHINES · 12 RECIPES, ONE CLICK APART', tx + tw / 2, ly + 47.5, 5.6, '#aeb6c6', { w: 0.16, a: 'm' });
  // left strip: which side is up
  const sxm = (lx + cxo) / 2;
  o += T('SIDE', sxm, cyo + 13, 5.6, C.gold, { w: 0.18, a: 'm' });
  const sideOpt = { w: 22, t: 5.2, gap: 0, sx: 1.25, a: 'm' };
  o += `<g class="sa">${D('A', sxm, cyo + 20, 25, C.gold, sideOpt)}</g>`;
  o += `<g class="sb">${D('B', sxm, cyo + 20, 25, C.gold, sideOpt)}</g>`;
  // right strip: tape length
  const rxm = (cxo + cw + lx + lw) / 2;
  o += T('C-6', rxm, cyo + 19, 9.5, C.gold, { w: 0.2, a: 'm' });
  o += `<path d="M${f(rxm - 13)} ${f(cyo + 25)}h26" stroke="${C.gold}" stroke-width=".7" opacity=".7"/>`;
  o += T(mmss(TOTAL_A + TOTAL_B), rxm, cyo + 38, 7.2, '#ffffff', { w: 0.18, a: 'm' });
  o += T('MIN:SEC', rxm, cyo + 48.5, 4.6, '#aeb6c6', { sw: 0.85, a: 'm' });
  // bottom strip: the three tab colours
  [C.purple, C.pink, C.blue].forEach((col, i) => {
    o += `<rect x="${f(lx + 9)}" y="${f(cyo + ch + 3.4 + i * 2.7)}" width="${f(lw - 18)}" height="1.7" fill="${col}"/>`;
  });

  // --- screws, write-protect tabs, gloss
  const screw = (x, y) =>
    `<circle cx="${f(mm(x))}" cy="${f(mm(y))}" r="${f(mm(1.45))}" fill="#d9dde3"/><circle cx="${f(mm(x))}" cy="${f(mm(y))}" r="${f(mm(1.45))}" fill="none" stroke="#6b3a1a" stroke-width=".8"/><path d="M${f(mm(x - 0.85))} ${f(mm(y))}h${f(mm(1.7))}M${f(mm(x))} ${f(mm(y - 0.85))}v${f(mm(1.7))}" stroke="#5a6068" stroke-width="1"/>`;
  o += screw(3.1, 3.1) + screw(SW_MM - 3.1, 3.1) + screw(3.1, SH_MM - 3.1) + screw(SW_MM - 3.1, SH_MM - 3.1) + screw(50.2, 53.4);
  for (const x of [9.5, SW_MM - 9.5 - 4.6]) {
    o += `<rect x="${f(mm(x))}" y="0" width="${f(mm(4.6))}" height="${f(mm(1.5))}" fill="#8e2f06"/>`;
    o += `<rect x="${f(mm(x + 0.5))}" y="0" width="${f(mm(3.6))}" height="${f(mm(1))}" fill="#ff8a3d"/>`;
  }
  o += `<g clip-path="url(#shc)"><path d="M${f(w * 0.08)} 0h${f(w * 0.2)}l${f(-w * 0.16)} ${f(h)}h${f(-w * 0.2)}z" fill="#fff" opacity=".07"/><path d="M${f(w * 0.33)} 0h${f(w * 0.06)}l${f(-w * 0.16)} ${f(h)}h${f(-w * 0.06)}z" fill="#fff" opacity=".06"/></g>`;
  o += `<rect x=".6" y=".6" width="${f(w - 1.2)}" height="${f(h - 1.2)}" rx="${f(mm(2.2))}" fill="none" stroke="#ffb27d" stroke-width="1.2" opacity=".8"/>`;
  o += `<rect width="${f(w)}" height="${f(h)}" rx="${f(mm(2.3))}" fill="none" stroke="#5e1f03" stroke-width=".8"/>`;

  const defs =
    `<clipPath id="shc"><rect width="${f(w)}" height="${f(h)}" rx="${f(mm(2.3))}"/></clipPath>` +
    `<linearGradient id="shell" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff8f3a"/><stop offset=".55" stop-color="#ff6a13"/><stop offset="1" stop-color="#f0530a"/></linearGradient>` +
    `<radialGradient id="tp"><stop offset="0" stop-color="#2a1408"/><stop offset=".55" stop-color="#2a1408"/><stop offset=".7" stop-color="#3a1d0c"/><stop offset=".82" stop-color="#26120a"/><stop offset=".95" stop-color="#3d2010"/><stop offset="1" stop-color="#1c0d05"/></radialGradient>`;

  const body =
    `<g transform="translate(${f(CAS.cx)} ${f(CAS.cy)}) rotate(${CAS.rot})">` +
    `<g class="fs">${softShadow(-w / 2, -h / 2, w, h, mm(2.3), 5, 8, 1.15)}</g>` +
    `<g class="fl"><g transform="translate(${f(-w / 2)} ${f(-h / 2)})">${o}</g></g>` +
    '</g>';

  const css =
    `.tl{stroke:${C.tape};stroke-width:1.3;fill:none}` +
    `.pa{transform:scale(${f(mm(R_FULL))})}.pb{transform:scale(${f(mm(R_EMPTY))})}` +
    `.ta{transform:rotate(${f(t0l.ang)}deg) scaleX(${f(t0l.len)})}.tb{transform:rotate(${f(t0r.ang)}deg) scaleX(${f(t0r.len)})}` +
    `.sb{opacity:0}`;
  return { defs, body, css };
}

// ------------------------------------------------------------------ the index card
// A blank-tape inlay: pre-printed in one green ink, filled in on a typewriter.
const CARD = { x: 21, y: 259, w: 338, h: 196, rot: 1.1 };
const CARD_MID = 140; // centre rule: side B needs the wider column
const ROW0 = 52.5;
const ROWH = 16.4;
function indexCard() {
  const { w, h } = CARD;
  const g = C.green;
  let o = '';
  o += softShadow(0, 0, w, h, 2, 3, 5, 0.9);
  o += `<rect width="${w}" height="${h}" rx="2" fill="${C.cream}"/>`;
  o += `<rect width="${w}" height="${h}" rx="2" fill="url(#paper)"/>`;
  o += `<rect x="5" y="5" width="${w - 10}" height="${h - 10}" fill="none" stroke="${g}" stroke-width=".9"/>`;
  // the moving highlighter sits under the type
  o += `<rect class="hl" width="100" height="13.2" rx="2" fill="#ffe84a"/>`;

  // headers
  const head = (x, letter, title, machines) => {
    let s = `<rect x="${f(x)}" y="10" width="19" height="19" rx="2" fill="${g}"/>`;
    s += D(letter, x + 9.5, 14, 11, C.cream, { w: 10.5, t: 2.6, gap: 0, sx: 1.25, a: 'm' });
    s += T('↓', x + 23.5, 27.5, 9, g, { w: 0.17 });
    s += T(title, x + 33, 19.2, 7, g, { w: 0.22 });
    s += T(machines, x + 33, 28.6, 5.3, C.ink, { w: 0.17 });
    return s;
  };
  o += head(10, 'A', 'SIDE A', 'SMELTER + CONSTRUCTOR');
  o += head(CARD_MID + 6, 'B', 'SIDE B', 'ASSEMBLER + MANUFACTURER');
  // ruled lines, centre rule
  let rules = `M5 35.5H${w - 5}`;
  for (let i = 0; i < NPS; i++) rules += `M5 ${f(ROW0 + 4 + i * ROWH)}H${w - 5}`;
  o += `<path d="${rules}" stroke="${g}" stroke-width=".7" opacity=".75"/>`;
  o += `<path d="M${CARD_MID} 5V${f(ROW0 + 4 + (NPS - 1) * ROWH)}" stroke="${g}" stroke-width=".9"/>`;
  // typed rows
  const cap = 7.4;
  const rows = (side, xNum, xName, xTime) => {
    let num = '';
    let names = '';
    let times = '';
    let dots = '';
    side.forEach(([name, secs], i) => {
      const y = ROW0 + i * ROWH;
      num += monoD(String(i + 1), xNum, y, cap);
      names += monoD(name, xName, y, cap);
      const t = mmss(secs);
      times += monoD(t, xTime, y, cap, { a: 'e' });
      const x0 = xName + monoWidth(name, cap) + 5;
      const x1 = xTime - monoWidth(t, cap) - 4;
      for (let x = x1; x > x0; x -= 4.2) dots += `M${f1(x)} ${f1(y - 0.4)}v.1`;
    });
    return (
      `<path class="m ${sc(g, 1.15)}" d="${num}"/>` +
      `<path class="m ${sc(C.ink, 1.15)}" d="${names}"/>` +
      `<path class="m ${sc(C.ink, 1.3)}" d="${times}"/>` +
      (dots ? `<path class="m ${sc('#8f9a8c', 1.1)}" d="${dots}"/>` : '')
    );
  };
  o += rows(SIDE_A, 11, 22, CARD_MID - 6);
  o += rows(SIDE_B, CARD_MID + 7, CARD_MID + 18, w - 11);

  // footer: the blank-tape boxes, filled in honestly
  const fy = ROW0 + 4 + (NPS - 1) * ROWH; // last rule
  let x = 11;
  const y1 = fy + 13.5;
  const lab = (str, color = g) => {
    const s = T(str, x, y1, 5.6, color, { w: 0.18 });
    x += monoWidth(str, 5.6) + 4;
    return s;
  };
  const box = (crossed) => {
    const s = tickBox(x, y1 - 6.4, 6.6, g, crossed, C.ink);
    x += 6.6 + 3.5;
    return s;
  };
  o += lab('NR') + box(false) + lab('ON') + box(true) + lab('OFF');
  x += 9;
  o += lab('BELTS') + box(true) + lab('SPAGHETTI') + box(false) + lab('TIDY');
  x += 9;
  o += lab('DATE');
  o += `<path d="M${f(x)} ${f(y1 + 1.2)}H${w - 11}" stroke="${g}" stroke-width=".7" opacity=".75"/>`;
  o += T('3 A.M. AGAIN', x + 3, y1 - 0.4, 6.4, C.ink, { w: 0.17 });
  const typed = `TIME = ONE CRAFT CYCLE.  A ${mmss(TOTAL_A)} + B ${mmss(TOTAL_B)} = ${mmss(TOTAL_A + TOTAL_B)}`;
  o += T(typed, 11, fy + 27.5, 5.7, C.ink, { w: 0.165 });
  // ballpoint: somebody has been at the card
  const pen = '#2743c9';
  const tEnd = 11 + monoWidth(typed, 5.7);
  o += `<g transform="translate(${f(tEnd + 9)} ${f(fy + 29.5)}) rotate(-3.5) skewX(-9)">${T('YOUR SAVE: 600 HRS', 0, 0, 7.6, pen, { sw: 1.1, round: 0.9, gap: 1.7 })}</g>`;
  const rx = w - 23;
  const ry = ROW0 + (NPS - 1) * ROWH - 3.6;
  o += `<path class="m ${sc(pen, 1.1)}" d="M${f(rx - 15)} ${f(ry - 2)}C${f(rx - 12)} ${f(ry - 9.5)} ${f(rx + 14)} ${f(ry - 10.5)} ${f(rx + 17)} ${f(ry - 1)}C${f(rx + 19)} ${f(ry + 7.5)} ${f(rx - 11)} ${f(ry + 9.5)} ${f(rx - 16.5)} ${f(ry + 3)}C${f(rx - 19)} ${f(ry - 3)} ${f(rx - 9)} ${f(ry - 9)} ${f(rx + 5)} ${f(ry - 9.5)}"/>`;
  o += T('PLAY IT LIVE →', 11, fy + 41.5, 6.2, g, { w: 0.2 });
  o += T('LUKEXYZ.GITHUB.IO/ULTRA-SATISFACTORY', 11 + monoWidth('PLAY IT LIVE →', 6.2) + 6, fy + 41.5, 6.2, C.ink, { w: 0.18 });

  const cx = CARD.x + w / 2;
  const cy = CARD.y + h / 2;
  const body = `<g transform="rotate(${CARD.rot} ${f(cx)} ${f(cy)}) translate(${CARD.x} ${CARD.y})">${o}</g>`;

  // highlighter keyframes: one bar that walks down side A, then side B
  const colA = { x: 8, sx: (CARD_MID - 3 - 8) / 100 };
  const colB = { x: CARD_MID + 3, sx: (w - 8 - CARD_MID - 3) / 100 };
  const pos = (side, i) => {
    const c = side === 0 ? colA : colB;
    return `transform:translate(${f(c.x)}px,${f(ROW0 - 10 + i * ROWH)}px) scaleX(${f(c.sx)})`;
  };
  let kf = `0%{${pos(0, 0)};opacity:.85}`;
  for (let s = 0; s < 2; s++) {
    const t0 = s * TH;
    for (let i = 1; i < NPS; i++) {
      kf += `${pT(t0 + i * TRK - 0.3)}{${pos(s, i - 1)};opacity:.85}`;
      kf += `${pT(t0 + i * TRK)}{${pos(s, i)};opacity:.85}`;
    }
    const next = s === 0 ? 1 : 0;
    kf += `${pT(t0 + PLAY)}{${pos(s, NPS - 1)};opacity:.85}`;
    kf += `${pT(t0 + PLAY + 0.35)}{${pos(s, NPS - 1)};opacity:0}`;
    kf += `${pT(t0 + PLAY + 0.36)}{${pos(next, 0)};opacity:0}`;
    kf += `${pT(t0 + TH - 0.4)}{${pos(next, 0)};opacity:0}`;
    kf += `${s === 1 ? '100%' : pT(t0 + TH)}{${pos(next, 0)};opacity:.85}`;
  }
  const css = `.hl{${pos(0, 0)};opacity:.85}`;
  return { body, css, kf };
}

// ------------------------------------------------------------------ the J-card
const IN = 105; // pixels per inch
const JC = { x: 379, y: 24, h: 4 * IN, flap: (1 + 1 / 16) * IN, spine: 0.5 * IN, front: (2 + 9 / 16) * IN };
JC.w = JC.flap + JC.spine + JC.front;
const OBI_W = 90;

function jcard() {
  const { h, flap, spine, front } = JC;
  let o = '';
  let defs = '';
  o += softShadow(0, 0, JC.w, h, 1.5, 4, 6, 1);

  // ---------- flap
  let fl = `<rect width="${f(flap)}" height="${h}" fill="${C.cream}"/>`;
  fl += `<rect width="${f(flap)}" height="${h}" fill="url(#paper)"/>`;
  const fx = 10;
  const fw = flap - 20;
  fl += beltMark(fx, 13, 1.05, C.navy, C.cream);
  fl += T('BELT HISS', fx + 30, 20.5, 7, C.navy, { w: 0.23 });
  fl += T('TAPES · EST. 3 A.M.', fx + 30, 29.5, 4.7, C.navy, { sw: 0.9 });
  fl += `<path d="M${fx} 37.5h${f(fw)}M${fx} 39.7h${f(fw)}" stroke="${C.navy}" stroke-width=".7"/>`;
  // the four counts, big
  const stats = [
    ['140', 'ITEMS', 'ALL CRAFTABLE'],
    ['211', 'RECIPES', '88 ALTERNATES'],
    ['477', 'BUILDINGS', '9 MACHINES'],
    ['5', 'PHASES', 'SPACE ELEVATOR'],
  ];
  const numOpt = { w: 12.2, t: 3.5, gap: 1.8, sx: 1.22 };
  stats.forEach(([num, what, sub], i) => {
    const y = 49 + i * 25.5;
    fl += D(num, fx + 40.5, y, 16, i === 1 ? C.red : C.navy, { ...numOpt, a: 'e' });
    fl += T(what, fx + 45.5, y + 7.2, 6.2, C.navy, { w: 0.21 });
    fl += T(sub, fx + 45.5, y + 15.6, 4.4, '#47507a', { sw: 0.85, gap: 1.35 });
  });
  fl += `<path d="M${fx} 152.5h${f(fw)}" stroke="${C.navy}" stroke-width=".7"/>`;
  // fine print
  const fine = [
    ['h', 'WHAT THIS IS'],
    ['t', 'A COMPANION APP FOR'],
    ['t', 'THE GAME SATISFACTORY.'],
    ['t', 'NOT A TAPE. SORRY.'],
    ['g'],
    ['h', 'GAME DATA'],
    ['t', 'GREENY/'],
    ['t', 'SATISFACTORYTOOLS'],
    ['g'],
    ['h', 'PICTURES'],
    ['t', 'SATISFACTORY WIKI'],
    ['t', 'CC BY-NC-SA 4.0'],
    ['g'],
    ['h', 'CODE'],
    ['t', 'APACHE 2.0. HOME'],
    ['t', 'TAPING ENCOURAGED:'],
    ['t', 'FORK IT.'],
    ['g'],
    ['r', 'UNOFFICIAL FAN PROJECT.'],
    ['r', 'NOT AFFILIATED WITH'],
    ['r', 'COFFEE STAIN STUDIOS.'],
  ];
  let yy = 164;
  let dH = '';
  let dT = '';
  let dR = '';
  for (const [kind, str] of fine) {
    if (kind === 'g') {
      yy += 4.5;
      continue;
    }
    if (kind === 'h') dH += monoD(str, fx, yy, 4.6, { gap: 1.9 });
    else if (kind === 't') dT += monoD(str, fx, yy, 5.3);
    else dR += monoD(str, fx, yy, 5);
    yy += kind === 'h' ? 8.8 : 9.2;
  }
  fl += `<path class="m ${sc(C.red, 1)}" d="${dH}"/><path class="m ${sc(C.navy, 0.95)}" d="${dT}"/><path class="m ${sc(C.navy, 1.05)}" d="${dR}"/>`;
  fl += T('SHELL: HAZARD ORANGE', fx, yy + 7, 4.6, C.red, { sw: 1, gap: 1.9 });
  // barcode (decorative: it encodes nothing) and the catalogue number
  let bars = '';
  let bx = fx;
  const by = h - 58;
  while (bx < fx + fw - 2) {
    const bw = [0.9, 0.9, 1.8, 2.7][Math.floor(rand() * 4)];
    bars += `M${f1(bx)} ${by}h${bw}v30h${-bw}z`;
    bx += bw + [0.9, 1.8, 0.9, 2.7][Math.floor(rand() * 4)];
  }
  fl += `<path d="${bars}" fill="${C.navy}"/>`;
  fl += T(CAT, fx + fw / 2, h - 15.5, 6, C.navy, { w: 0.2, a: 'm', gap: 1.9 });
  o += fl;

  // ---------- spine
  const sx0 = flap;
  let sp = `<rect x="${f(sx0)}" width="${f(spine)}" height="${h}" fill="${C.navy}"/>`;
  sp += `<rect x="${f(sx0)}" width="${f(spine)}" height="${h}" fill="url(#spineG)"/>`;
  const smid = sx0 + spine / 2;
  sp += beltMark(smid - 13.2, 14, 1.1, C.gold, C.navy);
  sp += `<path d="M${f(sx0 + 9)} 38h${f(spine - 18)}" stroke="${C.gold}" stroke-width=".8"/>`;
  const spOpt = { w: 14.6, t: 3.7, gap: 2.5, sx: 1.3 };
  const spW = dispWidth('ULTRA-SATISFACTORY', 17, spOpt);
  const spStart = 38 + (h - 38 - 70 - spW) / 2;
  sp += `<g transform="translate(${f(smid - 8.5)} ${f(spStart)}) rotate(90)">${D('ULTRA-SATISFACTORY', 0, -17, 17, C.gold, spOpt)}</g>`;
  // boxed catalogue code at the foot, one number per line
  const bxw = spine - 14;
  sp += `<rect x="${f(sx0 + 7)}" y="${h - 63}" width="${f(bxw)}" height="53" fill="none" stroke="${C.gold}" stroke-width="1"/>`;
  CAT.split('-').forEach((part, i) => {
    sp += T(part, smid, h - 63 + 12 + i * 12.2, 7, C.gold, { w: 0.22, a: 'm' });
  });
  o += sp;

  // ---------- front
  const FX = flap + spine;
  const FW = front;
  const acx = OBI_W + (FW - OBI_W) / 2; // centre of the part the obi leaves visible
  const HZ = 298; // horizon
  let fr = '';
  defs += `<linearGradient id="sky" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="${HZ}"><stop offset="0" stop-color="#081040"/><stop offset=".36" stop-color="#221a6a"/><stop offset=".6" stop-color="#7a2a86"/><stop offset=".8" stop-color="#e2506f"/><stop offset=".93" stop-color="#ff8a45"/><stop offset="1" stop-color="#ffc061"/></linearGradient>`;
  defs += `<linearGradient id="sun" gradientUnits="userSpaceOnUse" x1="0" y1="180" x2="0" y2="${HZ}"><stop offset="0" stop-color="#fff6b3"/><stop offset=".5" stop-color="#ffd166"/><stop offset="1" stop-color="#ff5d8f"/></linearGradient>`;
  defs += `<clipPath id="fc"><rect width="${f(FW)}" height="${h}"/></clipPath>`;
  fr += `<rect width="${f(FW)}" height="${h}" fill="${C.navyDeep}"/>`;
  fr += `<rect width="${f(FW)}" height="${HZ}" fill="url(#sky)"/>`;
  // stars
  let stars = '';
  for (let i = 0; i < 34; i++) {
    const x = OBI_W + 4 + rand() * (FW - OBI_W - 8);
    const y = 6 + rand() * 170;
    const r = rand() < 0.2 ? 0.95 : 0.55;
    stars += `M${f1(x - r)} ${f1(y)}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0`;
  }
  fr += `<path d="${stars}" fill="#fff" opacity=".7"/>`;
  // the sun, sliced by bars that widen towards the horizon
  const sunR = 57;
  const sunY = HZ - 60;
  let slices = '';
  let y = sunY - sunR;
  let gapH = 0;
  let bandH = 26;
  while (y < HZ) {
    slices += `<rect x="${f(acx - sunR)}" y="${f(y)}" width="${sunR * 2}" height="${f(bandH)}"/>`;
    y += bandH;
    gapH += 1.25;
    bandH = Math.max(5, bandH * 0.78);
    y += gapH;
  }
  defs += `<clipPath id="sunc">${slices}</clipPath>`;
  fr += `<circle cx="${f(acx)}" cy="${f(sunY)}" r="${sunR + 16}" fill="#ffb36b" opacity=".12"/>`;
  fr += `<circle cx="${f(acx)}" cy="${f(sunY)}" r="${sunR}" fill="url(#sun)" clip-path="url(#sunc)"/>`;
  // skyline: my own little factory and a lattice tower, all silhouette
  const sil = '#090a24';
  let sk = '';
  sk += `M0 ${HZ - 5}H${f(FW)}V${HZ}H0Z`;
  // sawtooth hall
  sk += `M96 ${HZ}V${HZ - 26}L96 ${HZ - 37}L108 ${HZ - 26}V${HZ - 37}L120 ${HZ - 26}V${HZ - 37}L132 ${HZ - 26}V${HZ}Z`;
  // two stacks
  sk += `M135 ${HZ}V${HZ - 62}h7V${HZ}ZM146 ${HZ}V${HZ - 47}h6V${HZ}Z`;
  // conveyor bridge on stilts, climbing to the assembler hall
  sk += `M152 ${HZ - 20}L186 ${HZ - 38}v4L152 ${HZ - 16}ZM162 ${HZ}v-24h2.4v24ZM174 ${HZ}v-30h2.4v30Z`;
  sk += `M184 ${HZ}V${HZ - 42}l7 -7h18l7 7V${HZ}Z`;
  sk += `M199 ${HZ - 49}v-13h2v13Z`;
  // elevator: base, tower, two rings, tip
  const ex = 240;
  sk += `M${ex - 19} ${HZ}L${ex - 11} ${HZ - 26}H${ex + 11}L${ex + 19} ${HZ}Z`;
  sk += `M${ex - 3.2} ${HZ - 26}V${HZ - 120}h6.4V${HZ - 26}Z`;
  sk += `M${ex - 10} ${HZ - 62}h20v4.5h-20ZM${ex - 7.5} ${HZ - 92}h15v3.6h-15Z`;
  sk += `M${ex - 1.3} ${HZ - 120}V${HZ - 138}h2.6V${HZ - 120}Z`;
  fr += `<path d="M${ex} 0V${HZ - 138}" stroke="#fff" stroke-width=".8" opacity=".28"/>`;
  // smoke
  fr += `<g fill="#fff" opacity=".2"><circle cx="139" cy="${HZ - 68}" r="5"/><circle cx="145" cy="${HZ - 77}" r="6.5"/><circle cx="154" cy="${HZ - 86}" r="8.5"/><circle cx="150" cy="${HZ - 53}" r="4"/><circle cx="156" cy="${HZ - 60}" r="5.5"/></g>`;
  fr += `<path d="${sk}" fill="${sil}"/>`;
  // lit windows and crates on the belt
  let lit = '';
  for (const [wx, wy] of [[100, 18], [106, 18], [112, 18], [124, 18], [188, 30], [194, 30], [206, 30], [188, 18], [200, 18], [206, 18]]) lit += `M${wx} ${HZ - wy}h3v4h-3z`;
  lit += `M${ex - 1} ${HZ - 76}h2v3h-2zM${ex - 1} ${HZ - 106}h2v3h-2z`;
  fr += `<path d="${lit}" fill="${C.gold}"/>`;
  fr += `<path d="M157 ${HZ - 27.5}l4.4 -2.3v4l-4.4 2.3zM168 ${HZ - 33.3}l4.4 -2.3v4l-4.4 2.3z" fill="#ff9d4d"/>`;

  // the three tabs, as the classic blank-tape stripes
  const bands = [
    [C.purple, 'OBJECTIVES', '5 PHASES'],
    [C.pink, 'ITEMS', '140 TO SEARCH'],
    [C.blue, 'BUILDINGS', '477 TO BUILD'],
  ];
  const BH = 22.5;
  bands.forEach(([col, name, note], i) => {
    const by2 = HZ + i * BH;
    fr += `<rect y="${f(by2)}" width="${f(FW)}" height="${BH}" fill="${col}"/>`;
    fr += T(name, OBI_W + 11, by2 + 15, 7.8, C.navyDeep, { w: 0.24 });
    fr += T(note, FW - 10, by2 + 14.6, 5.6, C.navyDeep, { w: 0.2, a: 'e' });
  });
  // foot of the cover
  const footY = HZ + 3 * BH;
  fr += `<rect y="${f(footY)}" width="${f(FW)}" height="${f(h - footY)}" fill="${C.navyDeep}"/>`;
  fr += T('EVERYTHING LINKS. CLICK A PART,', OBI_W + 11, footY + 15, 5.5, '#ffffff', { w: 0.165 });
  fr += T('GET ITS RECIPE. CLICK THE MACHINE,', OBI_W + 11, footY + 25, 5.5, '#ffffff', { w: 0.165 });
  fr += T('GET ITS BUILDING.', OBI_W + 11, footY + 35, 5.5, '#ffffff', { w: 0.165 });
  fr += beltMark(FW - 37, footY + 37, 1.1, C.gold, C.navyDeep);
  fr += T('BELT HISS TAPES', OBI_W + 11, footY + 47, 5, C.gold, { w: 0.19 });

  // title block
  const tL = OBI_W + 12;
  const tW = FW - OBI_W - 24;
  fr += T('VARIOUS MACHINES', tL, 21, 6.4, C.gold, { w: 0.2, gap: 2.2 });
  fr += T('3 TABS', tL + tW, 21, 5, '#ffffff', { sw: 0.9, a: 'e', gap: 2 });
  const big = { t: 7.4, gap: 4.2, sx: 1.34 };
  const titleLine = (str, yTop, cap, color, opt) => {
    const o2 = { ...opt, w: fitW(str, cap, opt, tW) };
    return D(str, tL + 1.6, yTop + 1.8, cap, C.pink, o2) + D(str, tL, yTop, cap, color, o2);
  };
  fr += titleLine('ULTRA', 30, 30, C.cyan, big);
  fr += titleLine('SATIS-', 67, 30, '#ffffff', big);
  fr += titleLine('FACTORY', 104, 24, '#ffffff', { t: 6.2, gap: 3.2, sx: 1.3 });
  fr += T('A FAN-MADE LOOKUP FOR SATISFACTORY', tL + tW / 2, 142.5, 5.6, '#ffffff', { w: 0.17, a: 'm', gap: 1.62 });

  // ---------- obi strip over the left third of the front
  let ob = `<rect x="${OBI_W}" width="5" height="${h}" fill="url(#obiSh)"/>`;
  ob += `<rect width="${OBI_W}" height="${h}" fill="${C.paper}"/>`;
  ob += `<rect width="${OBI_W}" height="${h}" fill="url(#paper)" opacity=".6"/>`;
  ob += `<path d="M5 0V${h}M7.4 0V${h}M${OBI_W - 5} 0V${h}M${OBI_W - 7.4} 0V${h}" stroke="${C.navy}" stroke-width=".7"/>`;
  const kana = [['ウ'], ['ル'], ['ト'], ['ラ'], '・', ['サ'], ['テ'], ['イ', 1], ['ス'], ['フ'], ['ア', 1], ['ク'], ['ト'], ['リ'], ['ー']];
  ob += kanaColumn(kana, OBI_W - 36.5, 11, 22.2, C.navy, 3.7);
  // the pitch, set down the strip the way obi copy runs
  ob += `<g transform="translate(38 13) rotate(90)">${T('EVERY RECIPE, BUILDING AND SPACE ELEVATOR', 0, 0, 7.6, C.red, { w: 0.2 })}</g>`;
  ob += `<g transform="translate(25.5 13) rotate(90)">${T('OBJECTIVE, ONE CLICK APART.', 0, 0, 7.6, C.red, { w: 0.2 })}</g>`;
  ob += `<g transform="translate(13 13) rotate(90)">${T('A COMPANION APP FOR SATISFACTORY · UNOFFICIAL FAN PROJECT', 0, 0, 5.2, C.navy, { sw: 0.95 })}</g>`;
  // price block
  const py = h - 58;
  ob += `<path d="M11 ${py}h${OBI_W - 22}M11 ${py + 2.2}h${OBI_W - 22}" stroke="${C.navy}" stroke-width=".7"/>`;
  ob += D('¥0', 12, py + 9, 17, C.red, { w: 14.5, t: 4, gap: 2.4, sx: 1.25 });
  ob += T('FREE.', 47, py + 16.2, 5.6, C.navy, { w: 0.2 });
  ob += T('FOREVER.', 47, py + 25.6, 5.6, C.navy, { w: 0.2 });
  ob += T(CAT, OBI_W / 2, py + 38.5, 5.6, C.navy, { w: 0.19, a: 'm' });
  ob += T('BELT HISS · 2026', OBI_W / 2, py + 48.5, 5, C.navy, { sw: 0.95, a: 'm' });
  fr += ob;

  // shrink-wrap sheen across the front
  fr += `<g clip-path="url(#fc)"><g class="sh" fill="#fff"><path d="M0 0h62l-72 ${h}h-62z" opacity=".08"/><path d="M14 0h22l-72 ${h}h-22z" opacity=".1"/><path d="M78 0h7l-72 ${h}h-7z" opacity=".1"/></g></g>`;
  // printed edge
  fr += `<rect x=".4" y=".4" width="${f(FW - 0.8)}" height="${h - 0.8}" fill="none" stroke="#fff" stroke-width=".8" opacity=".12"/>`;
  o += `<g transform="translate(${f(FX)} 0)">${fr}</g>`;

  // fold lines between the panels
  for (const x of [flap, flap + spine]) {
    o += `<path d="M${f(x - 0.6)} 0V${h}" stroke="#000" stroke-width="1.2" opacity=".35"/>`;
    o += `<path d="M${f(x + 0.7)} 0V${h}" stroke="#fff" stroke-width=".9" opacity=".2"/>`;
  }

  defs +=
    `<linearGradient id="spineG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".28"/><stop offset=".18" stop-color="#000" stop-opacity="0"/><stop offset=".82" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".28"/></linearGradient>` +
    `<linearGradient id="obiSh" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".4"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>`;

  const body = `<g transform="translate(${JC.x} ${JC.y})">${o}</g>`;
  const css = `.sh{transform:translate(-130px,0)}`;
  const kf = `0%,30%{transform:translate(-130px,0)}47%,100%{transform:translate(${f(FW + 90)}px,0)}`;
  return { defs, body, css, kf };
}

// ------------------------------------------------------------------ the deck
// The top edge of a portable recorder, peeking into frame under the J-card: a play lamp, a
// three-digit counter and a two-row LED level meter. The counter is honest: it adds up the
// craft-cycle seconds of the tracks played so far on this side, so it reads 022 when side A
// ends and 309 when side B ends, and it is zeroed while the cassette is turned over.
const DECK = { x: 384, y: 456, w: 417 };
const WHEEL_P = 13; // digit pitch on the counter wheels
function counterKeyframes() {
  // count(t) is piecewise linear: during each track it climbs by that track's seconds
  const segs = [];
  [SIDE_A, SIDE_B].forEach((side, s) => {
    let c = 0;
    side.forEach(([, secs], i) => {
      segs.push([s * TH + i * TRK, s * TH + (i + 1) * TRK, c, c + secs]);
      c += secs;
    });
  });
  // An odometer wheel only moves while the wheel to its right goes from 9 to 0.
  const wheelPos = (c, n) => {
    if (n === 0) return c;
    const mod = 10 ** n;
    const q = Math.floor(c / mod + 1e-9);
    return q + Math.min(1, Math.max(0, c - q * mod - (mod - 1)));
  };
  const out = [];
  for (let n = 0; n < 3; n++) {
    const pts = []; // [time, wheel position in digits]
    const add = (t, c) => pts.push([t, wheelPos(c, n)]);
    [0, 1].forEach((s) => {
      const mine = segs.filter((sg) => sg[0] >= s * TH - 1e-9 && sg[0] < (s + 1) * TH - 1e-9);
      for (const [t0, t1, c0, c1] of mine) {
        add(t0, c0);
        for (let v = Math.floor(c0) + 1; v < c1; v++) {
          if (v % 10 === 9 || v % 10 === 0) add(t0 + ((v - c0) / (c1 - c0)) * (t1 - t0), v);
        }
        add(t1, c1);
      }
      // reset while the shell is edge-on: roll to the nearest 0, which looks the same as 000
      const end = pts[pts.length - 1][1];
      const tR = s * TH + MID - 0.2;
      pts.push([tR, end]);
      const near = Math.round(end / 10) * 10;
      if (Math.abs(near - end) > 1e-9) pts.push([tR + 0.3, near]);
      pts.push([tR + 0.304, 0]);
      pts.push([(s + 1) * TH, 0]);
    });
    // drop points that sit on the straight line between their neighbours
    const keep = [pts[0]];
    for (let i = 1; i < pts.length - 1; i++) {
      const a = keep[keep.length - 1];
      const b = pts[i];
      const c = pts[i + 1];
      if (b[0] - a[0] < 1e-9) {
        keep[keep.length - 1] = b;
        continue;
      }
      const onLine = Math.abs(a[1] + ((c[1] - a[1]) * (b[0] - a[0])) / (c[0] - a[0]) - b[1]) < 1e-6;
      if (!onLine) keep.push(b);
    }
    keep.push(pts[pts.length - 1]);
    const seen = new Map();
    for (const [t, p] of keep) seen.set(t >= TT - 1e-9 ? '100%' : pT(t), f(-p * WHEEL_P));
    let kf = '';
    for (const [pc, y] of seen) kf += `${pc}{transform:translateY(${y}px)}`;
    out.push(kf);
  }
  return out;
}
function deck() {
  const { w } = DECK;
  const hgt = H - DECK.y + 10; // runs off the bottom edge of the picture
  const cy = (H - DECK.y) / 2;
  const lab = '#aeb6c6';
  const dark = '#05070a';
  let o = softShadow(0, 0, w, hgt, 6, 2, 3, 0.8);
  o += `<rect width="${w}" height="${hgt}" rx="6" fill="url(#dk)"/>`;
  o += `<path d="M6 .7H${w - 6}" stroke="#93a0b2" stroke-width="1" opacity=".75"/>`;

  // play lamp
  o += `<circle cx="15" cy="${cy}" r="3.4" fill="${dark}"/><circle cx="15" cy="${cy}" r="2.3" fill="#1c4a30"/>`;
  o += `<g class="lp"><circle cx="15" cy="${cy}" r="5.6" fill="#35e07a" opacity=".2"/><circle cx="15" cy="${cy}" r="2.3" fill="#5dffa0"/></g>`;
  o += T('PLAY', 23, cy + 2.6, 5.2, lab, { w: 0.2 });

  // counter: three wheels behind a window
  const wx = 55;
  const ww = 36;
  const wh = 19;
  const wy = cy - wh / 2;
  const capD = 9;
  o += `<rect x="${wx - 1.2}" y="${f(wy - 1.2)}" width="${ww + 2.4}" height="${wh + 2.4}" rx="3" fill="#11151b"/>`;
  o += `<rect x="${wx}" y="${f(wy)}" width="${ww}" height="${wh}" rx="2" fill="#f3eee0"/>`;
  let wheel = '';
  for (let d = 0; d < 10; d++) wheel += monoD(String(d), 0, d * WHEEL_P, capD, { a: 'm' });
  const defs =
    `<linearGradient id="dk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a5361"/><stop offset=".5" stop-color="#363d48"/><stop offset="1" stop-color="#272c35"/></linearGradient>` +
    `<linearGradient id="drum" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".62"/><stop offset=".3" stop-color="#000" stop-opacity="0"/><stop offset=".7" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".62"/></linearGradient>` +
    `<clipPath id="cw"><rect x="${wx}" y="${f(wy)}" width="${ww}" height="${wh}" rx="2"/></clipPath>` +
    `<path id="wh" class="m ${sc(C.ink, 1.5)}" d="${wheel}"/>`;
  const uses = [31, 4, 1]; // ten digits each: units reach 309, tens 30, hundreds 3
  let wheels = '';
  for (let n = 0; n < 3; n++) {
    const x = wx + ww - 6 - n * 12;
    let strip = '';
    for (let j = 0; j < uses[n]; j++) strip += `<use href="#wh"${j ? ` y="${j * 10 * WHEEL_P}"` : ''}/>`;
    wheels += `<g transform="translate(${x} ${f(cy + capD / 2)})"><g class="c${n}">${strip}</g></g>`;
  }
  o += `<g clip-path="url(#cw)">${wheels}</g>`;
  o += `<path d="M${wx + 12} ${f(wy)}v${wh}M${wx + 24} ${f(wy)}v${wh}" stroke="#000" stroke-width=".8" opacity=".55"/>`;
  o += `<rect x="${wx}" y="${f(wy)}" width="${ww}" height="${wh}" rx="2" fill="url(#drum)"/>`;
  // reset button, and what the number means
  o += `<rect x="${wx + ww + 6}" y="${f(cy - 4)}" width="8" height="8" rx="1.6" fill="#11151b"/><rect x="${wx + ww + 7}" y="${f(cy - 3.2)}" width="6" height="5.4" rx="1" fill="#ff6a13"/>`;
  o += T('COUNTER = CRAFT', wx + ww + 21, cy - 1.4, 4.8, lab, { w: 0.2 });
  o += T('SECONDS THIS SIDE', wx + ww + 21, cy + 7.4, 4.8, lab, { w: 0.2 });

  // level meter: two rows of LEDs, named after the label instead of L and R
  const mx = 214;
  const SEG = 14;
  const pitch = 6.6;
  const segW = 5.2;
  const rowH = 4.4;
  const rowsY = [cy - 6.4, cy + 2];
  const mw = SEG * pitch + 5.6;
  o += T('BELT', mx - 5, rowsY[0] + 4.5, 4.6, lab, { w: 0.2, a: 'e' });
  o += T('HISS', mx - 5, rowsY[1] + 4.5, 4.6, lab, { w: 0.2, a: 'e' });
  o += `<rect x="${mx}" y="${f(cy - 9.5)}" width="${f(mw)}" height="19" rx="2.5" fill="${dark}"/>`;
  const segX = (i) => mx + 3.5 + i * pitch;
  const groups = [['#35e07a', 0, 9], ['#e8d44d', 9, 12], ['#ff4d4d', 12, SEG]];
  let lit = '';
  for (const [col, a, b] of groups) {
    let d = '';
    for (const y of rowsY) for (let i = a; i < b; i++) d += `M${f(segX(i))} ${f(y)}h${segW}v${rowH}h${-segW}z`;
    lit += `<path fill="${col}" d="${d}"/>`;
  }
  const xEnd = segX(SEG) - (pitch - segW) / 2;
  let covers = '';
  rowsY.forEach((y, r) => {
    covers += `<g transform="translate(${f(xEnd)} ${f(y - 0.5)})"><rect class="${r ? 'mb' : 'ma'}" x="${f(-SEG * pitch)}" width="${f(SEG * pitch)}" height="${rowH + 1}" fill="${dark}"/></g>`;
  });
  const mute = `<rect class="mu" x="${f(mx + 1)}" y="${f(cy - 8)}" width="${f(mw - 2)}" height="16" fill="${dark}"/>`;
  o += lit + covers + mute + `<g opacity=".2">${lit}</g>`;

  // the maker's plate
  o += T('BELT-DRIVEN,', mx + mw + 12, cy - 1.4, 4.8, lab, { w: 0.2 });
  o += T('OBVIOUSLY.', mx + mw + 12, cy + 7.4, 4.8, lab, { w: 0.2 });
  o += beltMark(w - 28, cy - 4.8, 0.8, C.gold, '#363d48');

  // keyframes
  const lv = mulberry32(0x7a9e);
  const levels = (n, lo, span) => Array.from({ length: n }, () => lo + Math.floor(lv() * span));
  const meterKf = (arr) => {
    let kf = '';
    arr.forEach((L, i) => {
      kf += `${f3((i / arr.length) * 100)}%{transform:scaleX(${f3((SEG - L) / SEG)})}`;
    });
    return kf + `100%{transform:scaleX(${f3((SEG - arr[0]) / SEG)})}`;
  };
  const beltLv = levels(12, 7, 6); // loud
  const hissLv = levels(13, 2, 3); // always there, never much
  const off = `${pH(PLAY + 0.12)},${pH(TH - 0.12)}`;
  const css =
    `.ma{transform:scaleX(${f3((SEG - 9) / SEG)});animation:ma 3s steps(1,end) infinite}` +
    `.mb{transform:scaleX(${f3((SEG - 3) / SEG)});animation:mb 3.9s steps(1,end) infinite}` +
    `.mu{opacity:0;animation:mu ${TH}s linear infinite}.lp{animation:lp ${TH}s linear infinite}` +
    [0, 1, 2].map((n) => `.c${n}{animation:c${n} ${TT}s linear infinite}`).join('') +
    `@keyframes ma{${meterKf(beltLv)}}@keyframes mb{${meterKf(hissLv)}}` +
    `@keyframes mu{0%,${pH(PLAY)}{opacity:0}${off}{opacity:1}100%{opacity:0}}` +
    `@keyframes lp{0%,${pH(PLAY)}{opacity:1}${off}{opacity:0}100%{opacity:1}}` +
    counterKeyframes().map((kf, n) => `@keyframes c${n}{${kf}}`).join('');
  const body = `<g transform="translate(${DECK.x} ${DECK.y})">${o}</g>`;
  return { defs, body, css };
}

// ------------------------------------------------------------------ the mat
function mat() {
  const defs =
    `<pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse" patternTransform="translate(15 9)">` +
    `<path d="M20 0V100M40 0V100M60 0V100M80 0V100M0 20H100M0 40H100M0 60H100M0 80H100" stroke="#9fd8ff" stroke-width=".6" opacity=".05"/>` +
    `<path d="M0 0V100M0 0H100" stroke="#9fd8ff" stroke-width=".9" opacity=".12"/>` +
    `</pattern>` +
    `<radialGradient id="vig" cx=".5" cy=".45" r=".75"><stop offset="0" stop-color="#1a2230" stop-opacity=".55"/><stop offset="1" stop-color="#05070a" stop-opacity=".55"/></radialGradient>` +
    // faint paper tooth for the card stock: a diagonal hatch, no filter needed
    `<pattern id="paper" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(28)"><path d="M0 1.5H6M0 4.5H6" stroke="#7a5a2a" stroke-width=".5" opacity=".06"/></pattern>`;
  let body = `<rect width="${W}" height="${H}" rx="14" fill="${C.mat}"/>`;
  body += `<rect width="${W}" height="${H}" rx="14" fill="url(#vig)"/>`;
  body += `<rect width="${W}" height="${H}" rx="14" fill="url(#grid)"/>`;
  // mat markings
  let ticks = '';
  for (let x = 15; x < W - 12; x += 20) ticks += `M${x} 0v${(x - 15) % 100 === 0 ? 7 : 4}M${x} ${H}v${(x - 15) % 100 === 0 ? -7 : -4}`;
  for (let y = 9 + 20; y < H - 12; y += 20) ticks += `M0 ${y}h${(y - 9) % 100 === 0 ? 7 : 4}M${W} ${y}h${(y - 9) % 100 === 0 ? -7 : -4}`;
  body += `<path d="${ticks}" stroke="#9fd8ff" stroke-width=".8" opacity=".32"/>`;
  body += T('BELT HISS TAPES · CUTTING MAT · 1 SQUARE = 1 FOUNDATION (NOT TO SCALE)', 22, H - 8.5, 4.6, '#6f859c', { sw: 0.85, gap: 1.9 });
  return { defs, body };
}

// ------------------------------------------------------------------ assemble
const m = mat();
const cas = cassette();
const card = indexCard();
const jc = jcard();
const dk = deck();
const kc = cassetteKeyframes();

const flipKf =
  `0%,${pH(PLAY)}{transform:scale(1,1);animation-timing-function:cubic-bezier(.55,0,.9,.5)}` +
  `${pH(MID)}{transform:scale(.012,1.04);animation-timing-function:cubic-bezier(.1,.5,.45,1)}` +
  `100%{transform:scale(1,1)}`;
const sideSwap = (a, b) =>
  `0%,${pT(MID)}{opacity:${a}}${pT(MID + 0.004)},${pT(TH + MID)}{opacity:${b}}${pT(TH + MID + 0.004)},100%{opacity:${a}}`;

let css = '';
css += `.m{fill:none;stroke-linecap:round;stroke-linejoin:round}`;
for (const [key, name] of strokeCls) {
  const [color, sw] = key.split('|');
  css += `.${name}{stroke:${color};stroke-width:${sw}}`;
}
css += cas.css + card.css + jc.css + dk.css;
css += `.fl,.fs{animation:fl ${TH}s infinite}`;
css += `.pa{animation:pa ${TH}s linear infinite}.pb{animation:pb ${TH}s linear infinite}`;
css += `.ra{animation:ra ${TH}s linear infinite}.rb{animation:rb ${TH}s linear infinite}`;
css += `.ta{animation:ta ${TH}s linear infinite}.tb{animation:tb ${TH}s linear infinite}`;
css += `.sa{animation:sa ${TT}s linear infinite}.sb{animation:sb ${TT}s linear infinite}`;
css += `.hl{animation:hl ${TT}s ease-in-out infinite}`;
css += `.sh{animation:sh ${TH}s ease-in-out infinite}`;
css += `@keyframes fl{${flipKf}}`;
for (const name of ['pa', 'pb', 'ra', 'rb', 'ta', 'tb']) css += `@keyframes ${name}{${kc[name]}}`;
css += `@keyframes sa{${sideSwap(1, 0)}}@keyframes sb{${sideSwap(0, 1)}}`;
css += `@keyframes hl{${card.kf}}`;
css += `@keyframes sh{${jc.kf}}`;
css += `@media (prefers-reduced-motion:reduce){*{animation:none!important}}`;

const title = 'ULTRA-SATISFACTORY: a cassette, its index card, its J-card and the edge of a tape deck';
const desc =
  'A translucent orange cassette labelled ULTRA-SATISFACTORY with turning reels, an index card listing twelve recipes as tracks whose running times are their craft cycle times, and an opened J-card: flap with the counts (140 items, 211 recipes, 477 buildings, 5 phases), navy spine, and a sunset front cover with an obi strip. Along the bottom, the top edge of a tape deck with a three-digit counter that adds up the craft seconds played on this side, and a two-row level meter.';

const svg =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="t d">` +
  `<title id="t">${title}</title><desc id="d">${desc}</desc>` +
  `<style>${css}</style>` +
  `<defs>${m.defs}${cas.defs}${jc.defs}${dk.defs}</defs>` +
  m.body +
  dk.body +
  jc.body +
  card.body +
  cas.body +
  `</svg>\n`;

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, svg);
console.log(`wrote ${OUT} (${(Buffer.byteLength(svg) / 1024).toFixed(1)} KB), loop ${TT}s`);
