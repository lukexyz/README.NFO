#!/usr/bin/env node
// CASTAWAY on a war-room big board: the wall of rear-projected vector maps
// in a dark command centre, as in hacker cinema of the early 1980s (the
// style catalogue's entry hack-13). Thin single-stroke coastlines on black,
// tracks that arc from one place to another with a blip where they land,
// big counters that climb, stroke-drawn capitals with wide spacing, every
// element in one flat saturated colour with a soft glow, a separate
// monochrome monitor with a typed dialogue, and a noughts-and-crosses grid
// that plays itself to a draw, over and over.
//
//   node examples/castaway/src/84-war-room-big-board_opus_5.5.mjs
//
// Regenerates ../assets/84-war-room-big-board_opus_5.5.svg. The .md beside
// it is hand-written. Plain Node, no dependencies, deterministic: no clock,
// no Math.random (one seeded PRNG for the counters' event times).
//
// Nothing here is copied from the film, its screens or anyone's data. The
// coastlines were typed in by hand, from memory, a point every few degrees
// (they are as wobbly as that sounds, which suits a 1983 vector board); the
// stroke alphabet, the island chart and every word are made up in this file.
// The board belongs to LOW STAKES COMMAND and its computer is called
// MOLLUSC: both invented, both very calm.
//
// How it works
//   * GLOW. Everything that glows lives once in <g id="ALL"> inside <defs>
//     and is drawn four times with <use>: a wide faint halo, a mid glow, the
//     coloured line itself, and a thin white-hot core. Each <use> passes its
//     stroke-width multiplier and extra width down as CSS custom properties,
//     so the four passes need no copies of the data and no filters.
//   * TIME. One 30 s loop. From 0.5 s to 24.5 s the board replays a typical
//     ten-hour run at 25 simulated minutes per second: the clock climbs to
//     10:00, the bar counter to 12000, the four timers' event counters to the
//     median counts of the schedule (about 155, 30, 13 and 2), tracks arc in
//     across the Pacific and the island chart, and the tickers say what
//     happened. At 25.7 s the screens blank, at 27 s the coastlines redraw
//     stroke by stroke, and the loop comes round on a fully drawn board.
//   * COUNTERS are vertical strips of stroke digits under a clip path, moved
//     with steps(1,end) keyframes. Digits that change faster than a screen
//     can show (minutes, tens and units of bars) are spinners: a short
//     steps(10) loop whose phase matches the real count, so every digit
//     still lands exactly on 10:00 and 12000.
//   * THE DEFAULT STYLE IS THE LAST FRAME: every animated thing's static
//     value is its end-of-run state, so prefers-reduced-motion simply turns
//     animation off and leaves a complete, readable board.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '84-war-room-big-board_opus_5.5';
const OUT = path.join(HERE, '..', 'assets', `${SLUG}.svg`);

// ---------------------------------------------------------------------------
// Frame and timing
// ---------------------------------------------------------------------------
const W = 1280, H = 720;
const T = 30;                 // seconds per loop
const RUN0 = 0.5;             // replay starts
const RATE = 25;              // simulated minutes per real second
const RUN1 = RUN0 + 600 / RATE; // 24.5 s: 10:00:00 reached
const BLANK0 = 25.7, BLANK1 = 26.1, UNBLANK = 27.0; // screens fade out, come back
const RESET = 26.5;           // counters and tracks reset while blank
const tm = (min) => RUN0 + min / RATE; // simulated minute -> loop second

// colours: flat and saturated, one per kind of thing
const C = {
  coast: '#3fa9ff',
  grid: '#2f6fa8',
  track: '#ff4b3e',
  yel: '#ffd23f',
  wht: '#f4f8ff',
  dim: '#8fa6bf',
  palm: '#5dff7a',
  coral: '#ff7a5c',
  raft: '#ff9f3f',
  term: '#4dff88',
  cyan: '#5ef0ff',
};

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------
const TAU = Math.PI * 2;
const r1 = (n) => {
  let s = (Math.round(n * 10) / 10).toFixed(1);
  if (s.endsWith('.0')) s = s.slice(0, -2);
  if (s === '-0') s = '0';
  return s.replace(/^(-?)0\./, '$1.');
};
const nums = (arr) => arr.reduce((s, v, i) => s + (i && !v.startsWith('-') ? ' ' : '') + v, '');
const pc = (t) => {
  const v = Math.max(0, Math.min(100, (t / T) * 100));
  return (Math.round(v * 1000) / 1000) + '%';
};
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// relative path from absolute polylines, rounding done on absolute values
const polyD = (polys) => {
  let out = '';
  for (const p of polys) {
    const r = p.map(([x, y]) => [Math.round(x * 10), Math.round(y * 10)]);
    out += 'M' + nums([r1(r[0][0] / 10), r1(r[0][1] / 10)]);
    if (r.length === 1) { out += 'h0'; continue; }
    const d = [];
    for (let i = 1; i < r.length; i++) d.push(r1((r[i][0] - r[i - 1][0]) / 10), r1((r[i][1] - r[i - 1][1]) / 10));
    out += 'l' + nums(d);
  }
  return out;
};

// seeded PRNG (mulberry32)
const rng = (seed) => () => {
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

// points on an ellipse arc, degrees, y down (90 = bottom)
const E = (cx, cy, rx, ry, a0, a1, n) => {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180;
    pts.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]);
  }
  return pts;
};

// Catmull-Rom through points, sampled
const spline = (pts, per = 6) => {
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let k = 0; k < per; k++) {
      const t = k / per, t2 = t * t, t3 = t2 * t;
      out.push([0, 1].map((j) => 0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3)));
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
};

// ---------------------------------------------------------------------------
// The stroke alphabet: single-stroke capitals on a 6 x 10 box (y down),
// monospaced, in the spirit of the vector character generators of the day.
// ---------------------------------------------------------------------------
const buildGlyphs = (q) => {
  const G = {};
  const Eq = (cx, cy, rx, ry, a0, a1, n) => E(cx, cy, rx, ry, a0, a1, Math.max(3, Math.round(n * q)));
  const O = Eq(3, 5, 3, 5, 0, 360, 22);
  G.A = [[[0, 10], [3, 0], [6, 10]], [[1.05, 6.5], [4.95, 6.5]]];
  G.B = [[[0, 5], [3.8, 5], ...Eq(3.8, 2.5, 2, 2.5, 90, -90, 7).slice(1), [0, 0], [0, 10], [4, 10], ...Eq(4, 7.5, 2, 2.5, 90, -90, 7).slice(1), [3.8, 5]]];
  G.C = [Eq(3.15, 5, 3.05, 5, -38, -322, 16)];
  G.D = [[[0, 0], [2.6, 0], ...Eq(2.6, 5, 3.4, 5, -90, 90, 12).slice(1), [0, 10], [0, 0]]];
  G.E = [[[6, 0], [0, 0], [0, 10], [6, 10]], [[0, 5], [4.4, 5]]];
  G.F = [[[6, 0], [0, 0], [0, 10]], [[0, 5], [4.4, 5]]];
  G.G = [[...Eq(3.15, 5, 3.05, 5, -38, -322, 16), [6, 5.6], [3.6, 5.6]]];
  G.H = [[[0, 0], [0, 10]], [[6, 0], [6, 10]], [[0, 5], [6, 5]]];
  G.I = [[[3, 0], [3, 10]], [[1.3, 0], [4.7, 0]], [[1.3, 10], [4.7, 10]]];
  G.J = [[[5.2, 0], [5.2, 7.2], ...Eq(2.7, 7.2, 2.5, 2.8, 0, 180, 9).slice(1)]];
  G.K = [[[0, 0], [0, 10]], [[6, 0], [0, 6.4]], [[2.2, 4.1], [6, 10]]];
  G.L = [[[0, 0], [0, 10], [6, 10]]];
  G.M = [[[0, 10], [0, 0], [3, 6.6], [6, 0], [6, 10]]];
  G.N = [[[0, 10], [0, 0], [6, 10], [6, 0]]];
  G.O = [O];
  G.P = [[[0, 10], [0, 0], [3.5, 0], ...Eq(3.5, 2.75, 2.5, 2.75, -90, 90, 8).slice(1), [0, 5.5]]];
  G.Q = [O, [[3.7, 7.2], [6.3, 10.6]]];
  G.R = [[[0, 10], [0, 0], [3.5, 0], ...Eq(3.5, 2.75, 2.5, 2.75, -90, 90, 8).slice(1), [0, 5.5]], [[3, 5.5], [6, 10]]];
  G.S = [[...Eq(3, 2.5, 2.85, 2.5, -18, -270, 10), ...Eq(3, 7.5, 3, 2.5, -90, 162, 11).slice(1)]];
  G.T = [[[0, 0], [6, 0]], [[3, 0], [3, 10]]];
  G.U = [[[0, 0], [0, 7], ...Eq(3, 7, 3, 3, 180, 0, 10).slice(1), [6, 0]]];
  G.V = [[[0, 0], [3, 10], [6, 0]]];
  G.W = [[[0, 0], [1.4, 10], [3, 3.4], [4.6, 10], [6, 0]]];
  G.X = [[[0, 0], [6, 10]], [[6, 0], [0, 10]]];
  G.Y = [[[0, 0], [3, 5.2], [6, 0]], [[3, 5.2], [3, 10]]];
  G.Z = [[[0, 0], [6, 0], [0, 10], [6, 10]]];
  G['0'] = [Eq(3, 5, 2.85, 5, 0, 360, 22), [[1.2, 8.3], [4.8, 1.7]]];
  G['1'] = [[[1.2, 2.2], [3.4, 0], [3.4, 10]], [[1.2, 10], [5.6, 10]]];
  G['2'] = [[...Eq(3, 2.9, 2.9, 2.9, -168, 8, 10), [0, 10], [6, 10]]];
  G['3'] = [[[0.6, 0], [5.6, 0], [2.4, 3.9], ...Eq(2.9, 6.9, 3.1, 3.1, -100, 150, 12).slice(1)]];
  G['4'] = [[[4.6, 10], [4.6, 0], [0, 7], [6, 7]]];
  G['5'] = [[[5.6, 0], [0.8, 0], [0.4, 4.4], [1.6, 3.8], ...Eq(3, 6.8, 3, 3.2, -90, 150, 12)]];
  G['6'] = [[...Eq(3, 5, 3, 5, -58, -180, 6), ...Eq(3, 7, 3, 3, 180, -180, 18)]];
  G['7'] = [[[0, 0], [6, 0], [2.2, 10]]];
  G['8'] = [Eq(3, 2.45, 2.55, 2.45, 90, 450, 16), Eq(3, 7.45, 3, 2.55, -90, 270, 18)];
  G['9'] = G['6'].map((p) => p.map(([x, y]) => [6 - x, 10 - y]));
  G['.'] = [[[3, 10]]];
  G[','] = [[[3.3, 9.4], [3.3, 10], [2.4, 11.6]]];
  G[':'] = [[[3, 3.4]], [[3, 10]]];
  G['-'] = [[[1, 5], [5, 5]]];
  G['/'] = [[[0.6, 10], [5.4, 0]]];
  G['('] = [[[4.4, -0.6], [2.8, 1.4], [2.1, 5], [2.8, 8.6], [4.4, 10.6]]];
  G[')'] = G['('].map((p) => p.map(([x, y]) => [6 - x, y]));
  G["'"] = [[[3, 0], [3, 2.6]]];
  G['"'] = [[[2, 0], [2, 2.6]], [[4, 0], [4, 2.6]]];
  G['?'] = [[...Eq(3, 2.6, 2.8, 2.6, -170, 40, 9), [3, 6.3], [3, 7.2]], [[3, 10]]];
  G['!'] = [[[3, 0], [3, 7]], [[3, 10]]];
  G['+'] = [[[3, 2.4], [3, 7.6]], [[0.4, 5], [5.6, 5]]];
  G['%'] = [[[0.3, 10], [5.7, 0]], Eq(1.3, 1.7, 1.1, 1.5, 0, 360, 10), Eq(4.7, 8.3, 1.1, 1.5, 0, 360, 10)];
  G['·'] = [[[3, 5.2]]];
  G['>'] = [[[0.6, 1.2], [5.4, 5], [0.6, 8.8]]];
  G['<'] = [[[5.4, 1.2], [0.6, 5], [5.4, 8.8]]];
  G['='] = [[[0.6, 3.4], [5.4, 3.4]], [[0.6, 6.6], [5.4, 6.6]]];
  G['_'] = [[[0, 11], [6, 11]]];
  G['~'] = [[[0.2, 5.8], [1.4, 4.4], [2.6, 4.6], [3.4, 5.4], [4.6, 5.6], [5.8, 4.2]]];
  G['→'] = [[[0, 5], [6, 5]], [[3.4, 2.4], [6, 5], [3.4, 7.6]]];
  G['*'] = [[[3, 1.6], [3, 8.4]], [[0.4, 3.3], [5.6, 6.7]], [[5.6, 3.3], [0.4, 6.7]]];
  G[' '] = [];
  return G;
};
const G = buildGlyphs(1);
const GL = buildGlyphs(0.5); // for small text: half the curve points


// text -> absolute polylines. cap = cap height; sp = extra gap in glyph units
const textW = (str, cap, sp = 3) => (str.length * (6 + sp) - sp) * (cap / 10);
const textP = (str, x, y, cap, { sp = 3, align = 'left' } = {}) => {
  const s = cap / 10;
  const lod = cap <= 16;
  const w = textW(str, cap, sp);
  let x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  const out = [];
  for (const ch of str) {
    const g = (lod ? GL : G)[ch];
    if (!g) throw new Error(`no glyph for ${JSON.stringify(ch)}`);
    for (const p of g) out.push(p.map(([gx, gy]) => [x0 + gx * s, y - cap + gy * s]));
    x0 += (6 + sp) * s;
  }
  return out;
};
const textD = (...a) => polyD(textP(...a));

// ---------------------------------------------------------------------------
// Output collectors
// ---------------------------------------------------------------------------
const CSS = [];
const css = (s) => CSS.push(s);
let kid = 0;
// keyframes from [[seconds, 'decl'], ...]; returns a new animation name
const KF = (stops, prefix = 'k') => {
  const name = `${prefix}${(kid++).toString(36)}`;
  const sorted = [...stops].sort((a, b) => a[0] - b[0]);
  // one block per distinct declaration; at a repeated offset the last wins
  const at = new Map();
  for (const [t, d] of sorted) at.set(pc(t), d);
  const by = new Map();
  for (const [p, d] of at) { if (!by.has(d)) by.set(d, []); by.get(d).push(p); }
  css(`@keyframes ${name}{${[...by].map(([d, ps]) => `${ps.join(',')}{${d}}`).join('')}}`);
  return name;
};
const anim = (name, timing = 'linear', dur = T, extra = '') => `animation:${name} ${dur}s ${timing} infinite${extra}`;
let cid = 0;
// a class carrying an animation
const aClass = (name, timing, dur, extra) => {
  const c = `a${(cid++).toString(36)}`;
  css(`.${c}{${anim(name, timing, dur, extra)}}`);
  return c;
};

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------
const SCR_Y0 = 124, SCR_Y1 = 484;
const SL = { x0: 24, x1: 350 };
const SC = { x0: 360, x1: 920 };
const SR = { x0: 930, x1: 1256 };

const ALL = [];       // glowing content (drawn four times)
const BACK = [];      // non-glowing furniture under it
const push = (s) => ALL.push(s);

// a glowing path element
const P = (d, cls, extra = '') => `<path class="${cls}" d="${d}"${extra}/>`;
const PL = (d, cls) => `<path class="${cls}" pathLength="1" d="${d}"/>`;

// ---------------------------------------------------------------------------
// The room, the wall, the screens (non-glowing furniture)
// ---------------------------------------------------------------------------
BACK.push(`<rect width="${W}" height="${H}" rx="22" fill="url(#room)"/>`);
BACK.push(`<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="21" fill="none" stroke="#273141" stroke-width="2"/>`);
// wall frame holding the three screens
BACK.push(`<rect x="16" y="${SCR_Y0 - 8}" width="${W - 32}" height="${SCR_Y1 - SCR_Y0 + 16}" rx="6" fill="#0d1219" stroke="#1d2532"/>`);
for (const s of [SL, SC, SR]) {
  BACK.push(`<rect x="${s.x0}" y="${SCR_Y0}" width="${s.x1 - s.x0}" height="${SCR_Y1 - SCR_Y0}" fill="url(#scr)"/>`);
  BACK.push(`<rect x="${s.x0 + 0.5}" y="${SCR_Y0 + 0.5}" width="${s.x1 - s.x0 - 1}" height="${SCR_Y1 - SCR_Y0 - 1}" fill="none" stroke="#000" stroke-opacity=".7"/>`);
}
// mullion rivets
for (const x of [355, 925]) for (const y of [SCR_Y0 + 14, SCR_Y1 - 14]) BACK.push(`<circle cx="${x}" cy="${y}" r="1.6" fill="#2a3442"/>`);
// console desk
BACK.push(`<rect x="16" y="496" width="${W - 32}" height="212" rx="8" fill="#0b1016" stroke="#1d2532"/>`);
const BEZ = [
  { x0: 24, x1: 592, fill: 'url(#tscr)' },   // monochrome monitor
  { x0: 602, x1: 818, fill: 'url(#scr)' },   // noughts and crosses
  { x0: 828, x1: 1256, fill: 'url(#scr)' },  // how to run it
];
for (const b of BEZ) {
  BACK.push(`<rect x="${b.x0}" y="504" width="${b.x1 - b.x0}" height="196" rx="10" fill="#151b24" stroke="#232c3a"/>`);
  BACK.push(`<rect x="${b.x0 + 9}" y="513" width="${b.x1 - b.x0 - 18}" height="178" rx="6" fill="${b.fill}"/>`);
}

// ---------------------------------------------------------------------------
// Caption strip: the name, and the board's own labels
// ---------------------------------------------------------------------------
push(P(textD('CASTAWAY', 640, 88, 56, { sp: 4.6, align: 'center' }), 'cw w5'));
push(P(textD('A TEN-HOUR LO-FI ISLAND VIDEO. ALMOST NOTHING HAPPENS.', 640, 110, 10, { sp: 3.2, align: 'center' }), 'cy w1'));
push(P(textD('LOW STAKES COMMAND', 40, 46, 13, { sp: 3.4 }), 'cw w2'));
push(P(textD('BIG BOARD · 3 SCREENS', 40, 68, 10), 'cd w1'));
push(P(textD('STATUS: EXTREMELY CALM', 40, 88, 10), 'cy w1'));
push(P(textD('RUN 10:00:00', 1240, 46, 13, { sp: 3.4, align: 'right' }), 'cw w2'));
push(P(textD('SEED 1992 · 1080P30', 1240, 68, 10, { align: 'right' }), 'cd w1'));
push(P(textD('ALWAYS DAYTIME', 1240, 88, 10, { align: 'right' }), 'cy w1'));
BACK.push(`<path d="${textD('CASTAWAY', 640, 88, 56, { sp: 4.6, align: 'center' })}" fill="none" stroke="#dfeaff" stroke-opacity=".045" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/>`);
// thin rules either side of the name
push(P(polyD([[[272, 58], [398, 58]], [[882, 58], [1008, 58]]]), 'cd w0'));

// screen header bars
const header = (s, n, title, right) => {
  push(P(textD(n, s.x0 + 12, SCR_Y0 + 19, 10), 'cy w1'));
  push(P(textD(title, s.x0 + 30, SCR_Y0 + 19, 10), 'cw w1'));
  if (right) push(P(textD(right, s.x1 - 12, SCR_Y0 + 19, 10, { align: 'right' }), 'cd w1'));
  push(P(polyD([[[s.x0 + 10, SCR_Y0 + 27], [s.x1 - 10, SCR_Y0 + 27]]]), 'cg w0'));
};
header(SL, '1', 'THE ISLAND', 'SCALE: SMALL');
header(SC, '2', 'THE PACIFIC', 'MOSTLY WATER');
header(SR, '3', 'ONE RUN', 'PLAYED FAST');

// everything inside the screens goes in here, and blanks at the end
const SCREEN = [];
const sp = (s) => SCREEN.push(s);

// generic "appears at t, gone at reset" class
const showAt = (t, t1 = RESET) => aClass(KF([[0, 'opacity:0'], [t - 0.01, 'opacity:0'], [t, 'opacity:1'], [t1, 'opacity:1'], [t1 + 0.01, 'opacity:0'], [T, 'opacity:0']]));
// draw-on for a pathLength=1 path between t and t+dur, undrawn at reset
const drawAt = (t, dur) => aClass(KF([[0, 'stroke-dashoffset:1'], [t, 'stroke-dashoffset:1'], [t + dur, 'stroke-dashoffset:0'], [RESET, 'stroke-dashoffset:0'], [RESET + 0.01, 'stroke-dashoffset:1'], [T, 'stroke-dashoffset:1']]));
// a ring that pulses outward at each of the given times
const pulseAt = (times, grow = 3.2, len = 0.9) => {
  const st = [[0, 'opacity:0;transform:scale(.4)']];
  for (const t of times) {
    st.push([t - 0.01, 'opacity:0;transform:scale(.4)'], [t, 'opacity:1;transform:scale(.4)'], [t + len, `opacity:0;transform:scale(${grow})`], [t + len + 0.01, 'opacity:0;transform:scale(.4)']);
  }
  st.push([T, 'opacity:0;transform:scale(.4)']);
  return aClass(KF(st));
};
// a ticker line visible in [a, b) (b may wrap past T)
const tickWin = (wins) => {
  const st = [[0, 'opacity:0']];
  for (const [a, b] of wins) st.push([a - 0.01, 'opacity:0'], [a, 'opacity:1'], [b - 0.01, 'opacity:1'], [b, 'opacity:0']);
  st.push([T, 'opacity:0']);
  // keyframes at 0% may be duplicated; fine (later wins)
  return aClass(KF(st));
};

// ---------------------------------------------------------------------------
// Screen 2: the Pacific, Pacific-centred equirectangular, 70E to 330E
// ---------------------------------------------------------------------------
const MAP = { x0: 370, x1: 910, y0: 156, y1: 452, lon0: 70, lon1: 330, latN: 75 };
const MK = (MAP.x1 - MAP.x0) / (MAP.lon1 - MAP.lon0);
const proj = (lon, lat) => {
  const L = lon < 0 ? lon + 360 : lon;
  return [MAP.x0 + (L - MAP.lon0) * MK, MAP.y0 + (MAP.latN - lat) * MK];
};
const MAP_LATS = MAP.latN - (MAP.y1 - MAP.y0) / MK; // southern edge

// Coastlines, typed in by hand as [lon, lat], roughly every few degrees.
const COAST = {
  // north america, from the bering strait down the west coast, round the
  // gulf, up the east coast, across hudson bay and the arctic shore
  namerica: [[-166, 68.5], [-163, 66.4], [-168, 65.6], [-161, 64.5], [-165, 62.5], [-164.5, 60], [-162, 58.6], [-158, 58.8], [-157, 57.2], [-163, 55], [-160, 55.6], [-156, 57.2], [-153, 58], [-151, 59.3], [-150, 61], [-148, 60.4], [-146, 60.8], [-141, 60], [-139.5, 59.5], [-136.5, 58.2], [-135, 57], [-133, 55.5], [-130.5, 54], [-128, 51], [-125, 49], [-124, 46.3], [-124.2, 43], [-124.2, 40.4], [-122.5, 37.8], [-121.9, 36.6], [-120.6, 34.5], [-118.5, 34], [-117.2, 32.7], [-116, 30.5], [-114.5, 28], [-112, 25.5], [-110, 23], [-110, 24.2], [-112, 27.5], [-114.7, 31.7], [-113, 31.3], [-111, 29], [-109.5, 27], [-108, 25], [-106, 23.2], [-105.3, 20.5], [-104, 19], [-101.5, 17.8], [-99.9, 16.8], [-96.5, 15.7], [-94.5, 16.2], [-92.3, 14.6], [-90, 13.8], [-87.5, 13.2], [-85.7, 11], [-85.7, 9.9], [-83.5, 8.4], [-80.5, 7.3], [-79.5, 8.9], [-78, 7.6], [-77.4, 8.6], [-79.5, 9.6], [-81.5, 9], [-83.5, 10.6], [-83.6, 14.6], [-85, 16], [-88.2, 15.8], [-88.3, 18.3], [-87.5, 21.5], [-90.4, 21.2], [-90.5, 19.5], [-94, 18.2], [-96, 19.2], [-97.5, 22], [-97.2, 26], [-97.4, 27.8], [-94.5, 29.5], [-91, 29.2], [-89.2, 29.1], [-88, 30.6], [-85, 29.8], [-83, 29], [-82.7, 27.5], [-81.3, 25.5], [-80.4, 25.3], [-80, 27], [-81, 29.5], [-81.3, 31], [-79, 33], [-77.8, 34], [-75.5, 35.3], [-76, 37], [-75, 38.5], [-74, 40.5], [-72, 41], [-70, 41.6], [-70.6, 42.6], [-70.2, 43.7], [-67, 44.7], [-65.8, 45.3], [-64.5, 45.6], [-65.6, 43.6], [-63.5, 44.6], [-60, 45.9], [-61.6, 46.8], [-64.8, 47.8], [-64.5, 48.9], [-66.5, 50.2], [-60, 50.2], [-57, 51.5], [-56, 52.5], [-57.5, 54.5], [-60.5, 55.8], [-61.8, 57.5], [-64.5, 60.3], [-68, 58.5], [-70, 61], [-73, 62.2], [-78, 62.3], [-77.5, 60.5], [-76.8, 57], [-79, 54.5], [-79.5, 51.5], [-82, 52.8], [-85, 55.2], [-88, 56.5], [-92.5, 57.2], [-94.2, 58.8], [-94.8, 61], [-90.5, 63.8], [-87, 64.2], [-86, 66.5], [-90, 68.5], [-95, 68], [-98, 67.8], [-104, 68], [-108, 68.2], [-115, 67.8], [-120, 69.5], [-128, 70], [-133.5, 69.4], [-140, 69.6], [-145, 70.1], [-151, 70.4], [-156.8, 71.3], [-160, 70.5], [-162.5, 69.9], [-166, 68.5]],
  baffin: [[-61.5, 66.6], [-63.5, 64.5], [-65, 62.8], [-68, 62.4], [-71, 62.8], [-74, 64.4], [-78, 64.5], [-81, 67], [-82, 69.5], [-86, 70.5], [-89, 73], [-84, 73.6], [-80, 73.4], [-76, 72.6], [-71, 70.6], [-68, 70], [-66, 68.6], [-61.5, 66.6]],
  victoria: [[-117, 69], [-102, 68.8], [-101, 70.5], [-105, 73], [-114, 73.2], [-119, 71.5], [-117, 69]],
  banks: [[-125.5, 72], [-124, 74.3], [-118.5, 74.4], [-117, 72.5], [-120.5, 71.4], [-125.5, 72]],
  greenland: [[-73, 78], [-66, 76], [-58, 75.5], [-56, 73], [-54.5, 70.5], [-53, 68], [-52.5, 66], [-50, 63.5], [-48, 61.2], [-43.5, 59.8], [-41, 61.5], [-38, 65.5], [-33, 67.8]],
  newfoundland: [[-59.3, 47.6], [-56, 49.6], [-55.5, 51.5], [-53, 49.4], [-52.7, 47.5], [-53.6, 46.6], [-55.5, 47.1], [-59.3, 47.6]],
  cuba: [[-85, 21.9], [-81.5, 23.1], [-77.5, 21.8], [-74.2, 20.2], [-77.7, 19.8], [-78.5, 21.5], [-81, 21.8], [-83, 22], [-85, 21.9]],
  hispaniola: [[-74.4, 18.4], [-72.8, 19.9], [-69.9, 19.7], [-68.4, 18.6], [-70, 18.2], [-71.6, 17.8], [-74.4, 18.4]],
  samerica: [[-77.4, 8.6], [-77.5, 6.5], [-77.3, 4], [-78.8, 1.5], [-80, 0], [-80.9, -2], [-79.9, -3.4], [-81.3, -4.6], [-80.4, -6.6], [-79.3, -8.5], [-77.5, -11], [-76.2, -13.6], [-74.5, -15.6], [-71.4, -17.5], [-70.3, -18.4], [-70.2, -23], [-70.8, -27], [-71.5, -30.5], [-71.6, -33], [-72.5, -36], [-73.5, -39.5], [-73.8, -42], [-74.6, -46], [-75.5, -48.5], [-74.7, -51.5], [-73.5, -53], [-71, -54], [-68.5, -55.3], [-67.3, -55.8], [-65.2, -55], [-68.3, -52.5], [-69.2, -51.6], [-68.8, -50.2], [-67.7, -49], [-65.8, -47.7], [-67.5, -46.3], [-65.2, -45], [-63.5, -42.7], [-65, -41.5], [-62.3, -40.6], [-62, -39], [-57.5, -38], [-56.7, -36.4], [-57.5, -35.3], [-58.4, -34.6], [-56, -34.9], [-54.2, -34.6], [-53, -33.7], [-50.7, -30.8], [-48.6, -28.4], [-48.5, -26], [-46.4, -24], [-43.2, -23], [-41, -22], [-40, -19.5], [-39, -17.5], [-38.9, -13.5], [-35.2, -9], [-34.8, -7.2], [-35.3, -5.4], [-38.5, -3.7], [-41.8, -2.8], [-44.3, -2.5], [-48.5, -1.2], [-50, 0], [-51.2, 4], [-54, 5.8], [-57.2, 6], [-58.2, 6.8], [-60.7, 8.6], [-62, 10.2], [-64.2, 10.6], [-66, 10.6], [-68.2, 10.5], [-70, 11.7], [-71.6, 10.5], [-72, 11.8], [-73.3, 11.3], [-75.5, 10.4], [-76.8, 8.6], [-77.4, 8.6]],
  // asia, from the arctic shore at the map's left edge east to the bering
  // strait, down the pacific coast and round to india
  asia: [[66, 69], [68.5, 72.8], [73, 72.6], [74, 69], [77, 72.3], [80, 73.5], [86, 74.2], [92, 75.8], [100, 76.5], [106, 76.6], [112, 74.2], [113, 73.5], [120, 73], [128, 72.6], [130, 71], [139, 71.5], [146, 72.3], [152, 70.9], [160, 69.6], [167, 69.7], [170, 70], [176, 69.8], [180, 69], [-178, 68.9], [-174, 67.2], [-170, 66.2], [-172, 65], [-173, 64.4], [-178, 64.6], [-178.5, 62.5], [179.5, 62.5], [177, 62.2], [174, 61.8], [170, 60], [165, 59.8], [163, 58], [162.5, 56], [160, 54], [158.5, 52.8], [156.7, 51], [156, 52.5], [155.6, 55], [156, 57.5], [158, 58.2], [160, 60.5], [160.5, 61.5], [157, 61.6], [154, 59.2], [150, 59.6], [145, 59.3], [141.5, 58.5], [137.5, 54.5], [140, 53.5], [141.3, 52], [140.5, 48.5], [138, 46.5], [135, 43.5], [132, 43.2], [130.6, 42.4], [129.6, 41], [128, 39.5], [129.4, 37], [129.4, 35.5], [127.5, 34.6], [126.2, 34.5], [126.6, 37], [125, 37.7], [124.5, 39.8], [122, 40.5], [121.2, 39], [121, 40.8], [119, 39.3], [117.8, 38.8], [118.5, 37.8], [119, 37.2], [120.4, 37.6], [122.6, 37.4], [120.5, 36.1], [119.5, 35], [120.3, 34.3], [121, 32], [121.9, 31], [121.8, 29.9], [121, 28], [119.7, 26], [118.5, 24.6], [117, 23.5], [114.3, 22.3], [112, 21.8], [110.4, 21.2], [110, 20.3], [109.8, 21.5], [108, 21.6], [106.7, 20.5], [105.8, 19], [106.6, 17.5], [108.3, 16], [109.2, 13.5], [109.3, 11.8], [107, 10.5], [105.1, 8.7], [105, 10.5], [103.5, 10.6], [102.3, 12.2], [100.9, 12.6], [100.2, 13.6], [99.2, 11.5], [99.5, 9.7], [100.3, 8.5], [101.3, 6.9], [102.6, 6], [103.4, 4.2], [104.2, 1.4], [103.4, 1.3], [101.3, 2.9], [100.3, 5.5], [98.3, 8], [98.6, 10.6], [97.7, 15.4], [97.5, 16.5], [95.2, 15.8], [94.2, 16.2], [94.4, 18.5], [92.8, 20.6], [91.9, 22.5], [90.5, 22.2], [88.5, 21.6], [87, 21.3], [86.6, 20.3], [85, 19.3], [82.2, 16.6], [80.3, 15.6], [80.1, 13.1], [79.8, 10.4], [78.4, 9], [77.5, 8.1], [76.3, 9.7], [75, 12.7], [74, 14.9], [73, 18], [72.8, 19], [72.6, 21.4], [72.2, 22.3], [70.3, 21], [69, 22.5], [68.4, 23.4], [66.8, 24.8], [62, 25.2]],
  srilanka: [[79.9, 6], [80.2, 9.7], [81.3, 8.5], [81.9, 7], [81.2, 6.1], [79.9, 6]],
  hokkaido: [[139.9, 42.5], [141.5, 45.4], [143, 44.3], [145.4, 43.3], [143.3, 42], [141.2, 41.8], [139.9, 42.5]],
  honshu: [[140.9, 41.5], [141.5, 40.5], [142, 39], [141, 37.8], [140.9, 36.6], [140.6, 35.4], [139.8, 35], [139.2, 35.2], [138.8, 34.6], [137.2, 34.6], [136.8, 34.3], [135.8, 33.5], [135.2, 34.6], [133, 34.4], [131.2, 34.4], [131, 34], [132, 35.3], [133.4, 35.6], [135.4, 35.7], [136.1, 36.4], [136.8, 37.3], [137.4, 36.9], [138.6, 37.8], [139.6, 38.8], [140, 40], [140.3, 41.2], [140.9, 41.5]],
  kyushu: [[130.9, 34], [131.9, 33.2], [131.4, 31.4], [130.3, 31.2], [129.8, 32.8], [130.9, 34]],
  shikoku: [[132.5, 33.2], [134.2, 34.2], [134.7, 33.8], [133.1, 32.7], [132.5, 33.2]],
  sakhalin: [[142, 46], [143.5, 49], [144.5, 49], [143, 53], [142.6, 54.3], [142, 51], [141.8, 46.5], [142, 46]],
  taiwan: [[120.1, 23], [121, 25.3], [122, 25], [121.4, 22.6], [120.8, 21.9], [120.1, 23]],
  hainan: [[108.6, 19.2], [110.3, 20.1], [111, 19.6], [109.5, 18.2], [108.6, 19.2]],
  luzon: [[120, 16], [120.6, 18.5], [122.2, 18.5], [122.2, 16.3], [121.7, 15], [124, 13.8], [123.3, 13], [120.6, 13.9], [120.3, 15.3], [120, 16]],
  mindanao: [[122, 7], [123.5, 8.5], [125.5, 9.7], [126.5, 7.5], [125.5, 5.6], [124, 6.5], [122, 7]],
  samar: [[124.3, 12.5], [125.7, 12], [125.2, 10], [124.5, 10.3], [124.3, 12.5]],
  panay: [[122, 11.8], [123, 10.8], [123.2, 9.2], [122.4, 9.8], [122, 11.8]],
  palawan: [[117.2, 8.4], [119.6, 11.3], [119.8, 10.7], [117.2, 8.4]],
  borneo: [[109, 1.5], [109.6, 2], [111, 1.6], [113, 3.2], [115.4, 5], [116.7, 7], [117.6, 6.4], [119.2, 5.3], [118.2, 4.3], [117.7, 3.2], [118, 1], [117.6, 0], [116.6, -1.5], [116.4, -3.8], [114.5, -3.5], [113, -3.1], [111.7, -3], [110.2, -2.9], [110, -1.5], [109, 0], [109, 1.5]],
  sumatra: [[95.3, 5.6], [97.5, 5.2], [100.3, 2.3], [101.4, 2.1], [103.8, 0], [104.5, -1.8], [106, -3.2], [105.9, -5.8], [104.5, -5.8], [102.3, -4], [101, -2.3], [99.2, 0.1], [98.6, 1.7], [97.1, 3.4], [95.3, 5.6]],
  java: [[105.2, -6.8], [106.1, -6], [108.3, -6.3], [110.5, -6.9], [112.6, -6.9], [114.6, -7.8], [114.4, -8.7], [111, -8.2], [108.7, -7.8], [106.4, -7.4], [105.2, -6.8]],
  sulawesi: [[119.4, -5.4], [119.5, -3.5], [118.9, -2.8], [119.7, -0.5], [120.2, 0.8], [123, 0.9], [125, 1.6], [124.7, 0.7], [121.5, 0.5], [120.6, -0.8], [121.5, -1], [123.2, -1], [122.4, -2.7], [122.7, -4.6], [121.6, -4.8], [121, -2.9], [120.4, -3], [120.4, -5.6], [119.4, -5.4]],
  timor: [[123.5, -10.3], [124.5, -9.3], [127, -8.3], [126, -9.2], [124, -10.4], [123.5, -10.3]],
  flores: [[116.9, -8.9], [119, -8.3], [122.9, -8.2], [122.8, -8.7], [119.9, -8.8], [117, -9.1], [116.9, -8.9]],
  newguinea: [[131, -1.2], [132.5, -0.4], [135, -3.3], [137.9, -1.5], [141, -2.6], [144.5, -3.8], [145.8, -5.2], [147.5, -6.1], [147.8, -8.1], [149.3, -9.6], [150.8, -10.3], [149, -10.4], [147, -9.8], [146, -8.1], [144, -7.7], [143.3, -9], [141, -9.1], [139.5, -8.1], [138, -8.4], [137.8, -5.5], [135.5, -4.4], [133.5, -4], [132, -2.8], [131, -1.2]],
  australia: [[113.4, -22], [114.1, -21.8], [116.7, -20.6], [121, -19.5], [122.2, -17.5], [123.6, -16.2], [125.2, -14.5], [127.6, -14.2], [129.8, -14.9], [130.2, -12.9], [132.6, -11.5], [135.9, -12], [136.8, -12.3], [135.9, -13.6], [135.4, -15], [137.5, -16.2], [139.3, -17.5], [140.8, -17.4], [141.6, -15], [141.5, -12.6], [142.5, -10.7], [143.6, -14.1], [145.3, -14.9], [146.3, -19], [148.8, -20.4], [150.8, -22.6], [153.2, -25.2], [153.6, -28.6], [152.5, -32.4], [151.2, -33.9], [150, -37.5], [147.8, -37.9], [146.3, -39], [144.8, -38.1], [143.5, -38.8], [140.6, -38], [139.6, -37.2], [138.1, -35.6], [138, -33], [136, -34.9], [135.1, -34.6], [134.2, -32.7], [131.2, -31.5], [129, -31.7], [126, -32.3], [124, -33], [123.6, -33.9], [120, -34], [117.9, -35.1], [115.1, -34.3], [115.7, -33.3], [115.7, -31.6], [115, -29.5], [114, -26.5], [113.4, -24.5], [113.4, -22]],
  tasmania: [[144.6, -40.7], [148.3, -40.9], [148, -43.2], [146.8, -43.6], [145.2, -42.2], [144.6, -40.7]],
  nznorth: [[172.7, -34.4], [174.3, -35.6], [175.8, -36.8], [177.2, -37.9], [178.5, -37.7], [177.9, -39.2], [176.9, -39.6], [175.8, -41.4], [174.8, -41.3], [174.6, -39.9], [173.8, -39.2], [174.6, -37], [172.7, -34.4]],
  nzsouth: [[172.7, -40.5], [174.3, -41.7], [173.2, -43.8], [171.2, -44.4], [170.7, -45.8], [169.3, -46.6], [166.5, -46], [166.8, -45.1], [168.3, -44], [170.6, -42.9], [172, -41.3], [172.7, -40.5]],
  wrangel: [[-179, 71.5], [-177, 71.2], [-178, 70.8], [-180, 71], [-179, 71.5]],
};
// island chains as dots
const DOTS = [
  [-155.5, 19.6], [-157, 21.1], [-159.5, 22], [-161.8, 23.2], // a volcanic chain
  [-165, 54], [-169, 52.9], [-172.5, 52.2], [-176, 51.8], [-179, 51.6], [177.5, 52], [174, 52.7], // a long thin chain
  [134.5, 7.5], [144.8, 13.4], [167.5, 9],
];

// clip one segment to the map rectangle (Liang-Barsky)
const clipSeg = (a, b) => {
  const { x0, x1, y0, y1 } = MAP;
  let t0 = 0, t1 = 1;
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const p = [-dx, dx, -dy, dy], q = [a[0] - x0, x1 - a[0], a[1] - y0, y1 - a[1]];
  for (let i = 0; i < 4; i++) {
    if (p[i] === 0) { if (q[i] < 0) return null; continue; }
    const r = q[i] / p[i];
    if (p[i] < 0) { if (r > t1) return null; if (r > t0) t0 = r; } else { if (r < t0) return null; if (r < t1) t1 = r; }
  }
  return [[a[0] + t0 * dx, a[1] + t0 * dy], [a[0] + t1 * dx, a[1] + t1 * dy]];
};
const clipPoly = (pts) => {
  const out = [];
  let cur = null;
  for (let i = 0; i < pts.length - 1; i++) {
    const s = clipSeg(pts[i], pts[i + 1]);
    if (!s) { if (cur) { out.push(cur); cur = null; } continue; }
    if (cur && Math.hypot(cur[cur.length - 1][0] - s[0][0], cur[cur.length - 1][1] - s[0][1]) < 0.01) cur.push(s[1]);
    else { if (cur) out.push(cur); cur = [s[0], s[1]]; }
  }
  if (cur) out.push(cur);
  return out;
};
// unwrap a lon/lat ring so it never jumps across the dateline
const projLine = (ll) => {
  const pts = [];
  let prev = null;
  for (const [lon, lat] of ll) {
    let L = lon < 0 ? lon + 360 : lon;
    if (prev !== null) { while (L - prev > 180) L -= 360; while (prev - L > 180) L += 360; }
    prev = L;
    pts.push([MAP.x0 + (L - MAP.lon0) * MK, MAP.y0 + (MAP.latN - lat) * MK]);
  }
  return pts;
};

// graticule: every 30 degrees, dotted
{
  const g = [];
  for (let lon = 90; lon < MAP.lon1; lon += 30) g.push([proj(lon, MAP.latN), proj(lon, MAP_LATS)]);
  for (let lat = 60; lat > MAP_LATS; lat -= 30) if (lat !== 0) g.push([[MAP.x0, proj(0, lat)[1]], [MAP.x1, proj(0, lat)[1]]]);
  sp(P(polyD(g), 'cg w1 dot'));
  // the equator, dashed and a little brighter, and the date line
  sp(P(polyD([[[MAP.x0, proj(0, 0)[1]], [MAP.x1, proj(0, 0)[1]]]]), 'cg w1 dash'));
  // map border ticks
  const tk = [];
  for (let lon = 90; lon < MAP.lon1; lon += 30) { const [x] = proj(lon, 0); tk.push([[x, MAP.y1], [x, MAP.y1 + 4]]); }
  sp(P(polyD(tk), 'cg w1'));
}

// coastline groups, redrawn in this order after the blank
const DRAW_ORDER = [
  ['asia'], ['srilanka', 'hainan', 'taiwan', 'sakhalin', 'hokkaido', 'honshu', 'kyushu', 'shikoku'],
  ['sumatra', 'java', 'borneo', 'sulawesi', 'flores', 'timor', 'luzon', 'mindanao', 'samar', 'panay', 'palawan'],
  ['newguinea', 'australia', 'tasmania'], ['nznorth', 'nzsouth'],
  ['namerica', 'wrangel'], ['baffin', 'victoria', 'banks', 'greenland', 'newfoundland', 'cuba', 'hispaniola'],
  ['samerica'],
];
const REDRAW0 = UNBLANK + 0.1, REDRAW_STEP = 0.26, REDRAW_LEN = 0.55;
const redrawCls = (i, len = REDRAW_LEN) => {
  const t = REDRAW0 + i * REDRAW_STEP;
  return aClass(KF([[0, 'stroke-dashoffset:0'], [RESET, 'stroke-dashoffset:0'], [RESET + 0.01, 'stroke-dashoffset:1'], [t, 'stroke-dashoffset:1'], [t + len, 'stroke-dashoffset:0'], [T, 'stroke-dashoffset:0']]));
};
DRAW_ORDER.forEach((names, i) => {
  const cls = redrawCls(i);
  for (const n of names) {
    for (const piece of clipPoly(projLine(COAST[n]))) sp(PL(polyD([piece]), `cb w1 dr ${cls}`));
  }
});
{
  const dots = DOTS.map(([lo, la]) => [proj(lo, la)]).filter(([[x, y]]) => x > MAP.x0 && x < MAP.x1 && y > MAP.y0 && y < MAP.y1);
  const tBack = REDRAW0 + DRAW_ORDER.length * REDRAW_STEP;
  sp(P(polyD(dots), `cb w2 ${aClass(KF([[0, 'opacity:1'], [RESET, 'opacity:1'], [RESET + 0.01, 'opacity:0'], [tBack, 'opacity:0'], [tBack + 0.01, 'opacity:1'], [T, 'opacity:1']]))}`));
}

// the island
const ISL = proj(-155, -6);
sp(P(polyD([[[ISL[0] - 7, ISL[1]], [ISL[0] - 3, ISL[1]]], [[ISL[0] + 3, ISL[1]], [ISL[0] + 7, ISL[1]]], [[ISL[0], ISL[1] - 7], [ISL[0], ISL[1] - 3]], [[ISL[0], ISL[1] + 3], [ISL[0], ISL[1] + 7]]]), 'cy w1'));
sp(P(polyD([[ISL]]), 'cy w3'));
sp(`<circle class="cy w1 ring ${pulseAt([0.2, 3, 6, 9, 12, 15, 18, 21, 24].map((t) => t + 0.0), 2.2, 1.4)}" cx="${r1(ISL[0])}" cy="${r1(ISL[1])}" r="6"/>`);
sp(P(polyD([[[ISL[0] + 9, ISL[1] - 2], [ISL[0] + 62, ISL[1] - 8]]]), 'cy w0'));
sp(P(textD('THE ISLAND', ISL[0] + 68, ISL[1] - 4, 10), 'cy w1'));
sp(P(textD('(POSITION VAGUE)', ISL[0] + 68, ISL[1] + 10, 9), 'cd w1'));

// tracks: [name, sim minute, kind, from/to, label, label offset]
const quad = (a, b, lift) => {
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const L = Math.hypot(dx, dy);
  let nx = -dy / L, ny = dx / L;
  if (ny > 0) { nx = -nx; ny = -ny; } // bulge upwards
  const c = [mx + nx * L * lift, my + ny * L * lift];
  const pts = [];
  for (let i = 0; i <= 24; i++) {
    const t = i / 24, u = 1 - t;
    pts.push([u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]]);
  }
  return pts;
};
const wiggle = (a, b, amp, waves, seed) => {
  const R = rng(seed);
  const ph = R() * TAU;
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const L = Math.hypot(dx, dy);
  const nx = -dy / L, ny = dx / L;
  const pts = [];
  for (let i = 0; i <= 40; i++) {
    const t = i / 40;
    const w = Math.sin(t * waves * TAU + ph) * amp * Math.sin(Math.PI * t);
    pts.push([a[0] + dx * t + nx * w, a[1] + dy * t + ny * w]);
  }
  return pts;
};
const ISLN = [ISL[0] + 1, ISL[1] - 1];
const WORLD = [];
const arrive = [];
const ev = (min, track, endLabel, labelAt, labelTxt, dur = 1.1, color = 'cr') => WORLD.push({ min, track, labelAt, labelTxt, dur, color, endLabel });
{
  const drone = proj(-122.5, 37.6);
  ev(52, [quad(drone, ISLN, 0.28)], true, [drone[0] - 50, drone[1] - 8], 'DRONE');
  arrive.push(tm(52) + 1.1);
  const bOut = proj(-149, 2.5);
  ev(125, [quad(ISLN, bOut, 0.35), quad(bOut, ISLN, -0.35)], false, null, '', 1.4);
  arrive.push(tm(125) + 1.4);
  const crate = proj(-175, 27);
  ev(195, [wiggle(crate, ISLN, 5, 3.5, 7)], true, [crate[0] - 54, crate[1] + 2], 'CRATE', 1.6, 'co');
  arrive.push(tm(195) + 1.6);
  const tour = proj(-172, -24);
  {
    const a = quad(tour, [ISL[0], ISL[1] + 10], 0.22);
    const loop = E(ISL[0], ISL[1], 12, 10, 90, -270, 24).slice(1);
    const back = quad([ISL[0], ISL[1] + 10], tour, -0.22).slice(1);
    ev(280, [[...a, ...loop, ...back]], true, [tour[0] - 96, tour[1] + 6], 'TOUR BOAT', 1.6);
  }
  const cafe = proj(-135, -28);
  ev(355, [quad(ISLN, cafe, 0.22), quad(cafe, ISLN, 0.22)], false, [cafe[0] + 9, cafe[1] + 12], 'COFFEE?', 1.4, 'cc');
  arrive.push(tm(355) + 1.4);
  const s0 = proj(151.5, -34), s1 = proj(-71.6, -33);
  const lane = quad(s0, s1, -0.12);
  ev(410, [lane], true, [lane[10][0] - 18, lane[10][1] + 20], 'SHIP', 2.6, 'cy');
  const reply = proj(-105.3, 20.5);
  ev(470, [wiggle(reply, ISLN, 5, 4, 11)], true, [reply[0] - 12, reply[1] + 24], 'REPLY', 1.8, 'co');
  arrive.push(tm(470) + 1.8);
  const catOut = proj(172, -10);
  ev(530, [wiggle(ISLN, catOut, 4, 2.5, 23)], false, [catOut[0] - 36, catOut[1] + 4], 'CAT', 1.8, 'co');
}
for (const e of WORLD) {
  const t = tm(e.min);
  const cls = drawAt(t, e.dur);
  for (const pts of e.track) sp(PL(polyD([pts]), `${e.color} w2 dr ${cls}`));
  // the far end: a diamond and a label
  const show = showAt(t);
  const far = e.endLabel ? e.track[0][0] : e.track[0][e.track[0].length - 1];
  const dia = [[far[0], far[1] - 4], [far[0] + 4, far[1]], [far[0], far[1] + 4], [far[0] - 4, far[1]], [far[0], far[1] - 4]];
  if (!e.labelAt) continue;
  sp(P(polyD([dia]), `cy w1 ${show}`));
  sp(P(textD(e.labelTxt, e.labelAt[0], e.labelAt[1], 10), `cw w1 ${show}`));
}
// arrivals: a ring pulses at the island
sp(`<circle class="cy w2 ring ${pulseAt(arrive, 4.5, 1.1)}" cx="${r1(ISL[0])}" cy="${r1(ISL[1])}" r="5"/>`);

// ---------------------------------------------------------------------------
// Screen 1: the island chart, top view
// ---------------------------------------------------------------------------
const IC = [180, 300];        // island centre
const blob = (sx, sy, seed, n = 40) => {
  const R = rng(seed);
  const p1 = R() * TAU, p2 = R() * TAU;
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * TAU;
    const k = 1 + 0.09 * Math.sin(3 * a + p1) + 0.05 * Math.sin(5 * a + p2);
    pts.push([IC[0] + Math.cos(a) * sx * k, IC[1] + Math.sin(a) * sy * k]);
  }
  return pts;
};
const ICL = { x0: SL.x0 + 10, x1: SL.x1 - 10 };
{
  const sand = redrawCls(0, 0.8);
  const c1 = redrawCls(2, 0.8);
  const c2 = redrawCls(4, 0.8);
  sp(PL(polyD([blob(60, 28, 3)]), `cy w2 dr ${sand}`));
  sp(PL(polyD([blob(84, 41, 5)]), `cb w1 dr ${c1}`));
  sp(PL(polyD([blob(112, 58, 9, 56)]), `cb w1 dr ${c2} op6`));
  // the palm from above: seven curved fronds
  const PM = [IC[0] + 16, IC[1] - 6];
  const fr = [];
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * TAU + 0.4;
    const pts = [];
    for (let k = 0; k <= 5; k++) {
      const r = 2 + k * 3.1;
      const b = a + k * 0.07;
      pts.push([PM[0] + Math.cos(b) * r, PM[1] + Math.sin(b) * r * 0.9]);
    }
    fr.push(pts);
  }
  sp(P(polyD(fr), 'cp w1'));
  sp(P(polyD([[PM]]), 'cp w3'));
  // the signal: one bar, at the very top of the palm
  sp(`<circle class="cw w1 ring ${pulseAt([tm(455), tm(455) + 0.8, tm(455) + 1.6], 3, 0.8)}" cx="${r1(PM[0])}" cy="${r1(PM[1])}" r="3.4"/>`);
  // the raft, moored east
  const RF = [IC[0] + 86, IC[1] + 10];
  const rot = (x, y, a = -0.14) => [RF[0] + x * Math.cos(a) - y * Math.sin(a), RF[1] + x * Math.sin(a) + y * Math.cos(a)];
  const raft = [[rot(-14, -7), rot(14, -7), rot(14, 7), rot(-14, 7), rot(-14, -7)]];
  for (const y of [-3.5, 0, 3.5]) raft.push([rot(-14, y), rot(14, y)]);
  sp(P(polyD(raft), 'cf w1'));
  // her, nodding at 80 BPM
  const HER = [IC[0] - 22, IC[1] + 6];
  sp(P(polyD([[HER]]), 'cc w4'));
  sp(`<circle class="cc w1 nod" cx="${r1(HER[0])}" cy="${r1(HER[1])}" r="4"/>`);
  // kumara: a sprout that grows in steps over the run
  const KU = [IC[0] - 4, IC[1] - 13];
  sp(`<g class="grow"><path class="cp w1" d="${polyD([[[KU[0], KU[1] + 5], [KU[0], KU[1] - 5]], [[KU[0], KU[1] - 1], [KU[0] - 4, KU[1] - 4], [KU[0] - 6, KU[1] - 3]], [[KU[0], KU[1] - 3], [KU[0] + 4, KU[1] - 6], [KU[0] + 6, KU[1] - 5]]])}"/></g>`);
  // sandcastle, then the tide
  const SC0 = [IC[0] - 40, IC[1] + 13];
  const sc = [[[SC0[0] - 4, SC0[1] + 4], [SC0[0] - 4, SC0[1] - 3], [SC0[0] - 2, SC0[1] - 3], [SC0[0] - 2, SC0[1] - 1], [SC0[0], SC0[1] - 1], [SC0[0], SC0[1] - 3], [SC0[0] + 2, SC0[1] - 3], [SC0[0] + 2, SC0[1] - 1], [SC0[0] + 4, SC0[1] - 1], [SC0[0] + 4, SC0[1] + 4], [SC0[0] - 4, SC0[1] + 4]], [[SC0[0], SC0[1] - 3], [SC0[0], SC0[1] - 8], [SC0[0] + 3, SC0[1] - 7], [SC0[0], SC0[1] - 6]]];
  const tSC = tm(160), tTide = tm(215);
  sp(P(polyD(sc), `cw w1 gone ${aClass(KF([[0, 'opacity:0'], [tSC - 0.01, 'opacity:0'], [tSC, 'opacity:1'], [tTide + 0.5, 'opacity:1'], [tTide + 0.9, 'opacity:0'], [T, 'opacity:0']]))}`));
  const tide = [];
  for (let i = 0; i <= 16; i++) tide.push([SC0[0] - 24 + i * 2.6, SC0[1] + 13 + Math.sin(i * 0.9) * 2]);
  sp(P(polyD([tide]), `cb w2 gone ${aClass(KF([[0, 'opacity:0;transform:translate(0,0)'], [tTide - 0.01, 'opacity:0;transform:translate(0,0)'], [tTide, 'opacity:1;transform:translate(0,0)'], [tTide + 1, 'opacity:1;transform:translate(4px,-14px)'], [tTide + 1.5, 'opacity:0;transform:translate(6px,-18px)'], [T, 'opacity:0;transform:translate(0,0)']]))}`));
  // coconut: falls from the palm, then walks off with a crab inside
  const tCo = tm(385);
  const coPath = spline([[PM[0], PM[1]], [PM[0] + 5, PM[1] + 9], [PM[0] + 15, PM[1] + 16], [PM[0] + 28, PM[1] + 20], [PM[0] + 40, PM[1] + 27]], 5);
  sp(PL(polyD([coPath]), `cy w1 dr ${drawAt(tCo, 1.6)}`));
  const coEnd = coPath[coPath.length - 1];
  sp(P(polyD([E(coEnd[0], coEnd[1], 3.2, 3.2, 0, 360, 10)]), `cy w1 ${showAt(tCo + 1.6)}`));
  // shark: a fin on a slow orbit, nodding on the beat
  sp(`<circle class="cr w1 dash2" cx="${IC[0]}" cy="${IC[1]}" r="100"/>`);
  sp(`<g class="orbit"><g class="bob"><path class="cr w2" d="${polyD([[[IC[0] - 5, IC[1] - 97], [IC[0] + 2, IC[1] - 107], [IC[0] + 6, IC[1] - 97], [IC[0] - 5, IC[1] - 97]]])}"/></g></g>`);
  // turtle: comes in from the south, visits the shore, leaves
  const tTu = tm(90);
  const tu = spline([[ICL.x0, 424], [58, 430], [82, 414], [96, 386], [114, 356], [132, 336], [146, 330], [152, 340], [142, 349], [129, 344], [122, 362], [110, 392], [100, 420], [96, 446]], 6);
  sp(PL(polyD([tu]), `cg2 w1 dr ${drawAt(tTu, 2.2)}`));
  // hydrofoil: carves across the top, fast
  const tHy = tm(310);
  const hy = spline([[ICL.x1, 192], [300, 172], [258, 184], [216, 166], [172, 180], [128, 166], [84, 178], [ICL.x0, 170]], 6);
  sp(PL(polyD([hy]), `cr w1 dr ${drawAt(tHy, 0.9)}`));
  // labels on the chart, with leaders
  const lab = (txt, x, y, cls, cap = 10, lead = null, extra = '') => {
    sp(P(textD(txt, x, y, cap), `${cls} w1${extra}`));
    if (lead) sp(P(polyD([lead]), `${cls} w0${extra}`));
  };
  lab('HER', ICL.x0 + 2, HER[1] + 4, 'cc', 10, [[ICL.x0 + 34, HER[1]], [HER[0] - 6, HER[1]]]);
  lab('KUMARA', ICL.x0 + 2, 246, 'cp', 10, [[ICL.x0 + 62, 242], [KU[0] - 7, KU[1] - 4]]);
  lab('PALM', 250, 236, 'cp', 10, [[248, 232], [PM[0] + 6, PM[1] - 6]]);
  lab('RAFT', 288, RF[1] + 28, 'cf', 10, [[286, RF[1] + 22], [RF[0] + 8, RF[1] + 8]]);
  lab('SHARK', 286, 262, 'cr', 10);
  lab('TURTLE', 112, 446, 'cg2', 10, null, ` ${showAt(tTu)}`);
  lab('HYDROFOIL', ICL.x0 + 2, 200, 'cr', 10, null, ` ${showAt(tHy)}`);
  // compass
  const N0 = [ICL.x1 - 8, 414];
  sp(P(polyD([[[N0[0], N0[1] + 10], [N0[0], N0[1] - 10]], [[N0[0] - 4, N0[1] - 5], [N0[0], N0[1] - 10], [N0[0] + 4, N0[1] - 5]]]), 'cd w1'));
  sp(P(textD('N', N0[0], N0[1] + 26, 9, { align: 'center' }), 'cd w1'));
}

// ---------------------------------------------------------------------------
// Tickers (outside the blank: they narrate it)
// ---------------------------------------------------------------------------
const TICK = [];
{
  // centre screen
  const evs = [
    [52, 'DRONE DELIVERY. PARCEL CONTENTS: HEADPHONES.'],
    [125, 'BOTTLE THROWN. BOTTLE WASHED STRAIGHT BACK.'],
    [195, 'A CRATE DRIFTED IN. CONTENTS: ONE GREY TABBY.'],
    [280, 'TOUR BOAT. SELFIES TAKEN. NO LIFT OFFERED.'],
    [355, 'SHE WALKED OUT OVER THE WATER. BACK WITH ICED COFFEE.'],
    [410, 'A SHIP CROSSED THE HORIZON. SHE WAS BUSY.'],
    [470, 'A DIFFERENT BOTTLE WASHED UP. IT IS A REPLY.'],
    [530, 'THE CAT FLOATED OFF. IT COMES BACK ANOTHER DAY.'],
  ];
  const y = SCR_Y1 - 12, x = SC.x0 + 14;
  const start = 'RUN STARTED. SHE IS NODDING. NOTHING ELSE.';
  const lines = [];
  lines.push([start, [[0, tm(52)], [29.3, T + 0.01]]]);
  evs.forEach(([m, s], i) => lines.push([s, [[tm(m), i + 1 < evs.length ? tm(evs[i + 1][0]) : RUN1]]]));
  lines.push(['RUN COMPLETE. ALMOST NOTHING HAPPENED. AS PLANNED.', [[RUN1, BLANK0 + 0.2]]]);
  lines.push(['BOARD CLEARED. REDRAWING THE PACIFIC.', [[BLANK0 + 0.2, 29.3]]]);
  lines.forEach(([s, w], i) => {
    const last = i === lines.length - 2;
    const cls = tickWin(w.map(([a, b]) => [a, Math.min(b, T + 0.01)]));
    TICK.push(P(textD(s, x, y, 11), `cw w1 ${last ? 'tkd' : 'tk'} ${cls}`));
  });
  TICK.push(P(polyD([[[SC.x0 + 10, SCR_Y1 - 30], [SC.x1 - 10, SCR_Y1 - 30]]]), 'cg w0'));
  // island screen
  const rev = [
    [90, 'A SEA TURTLE VISITS.'],
    [160, 'SANDCASTLE BUILT.'],
    [215, 'THE TIDE TOOK IT.'],
    [310, 'HYDROFOIL. SHAKA RECEIVED.'],
    [385, 'COCONUT FELL. CRAB WEARS IT.'],
    [455, 'SIGNAL: 1 BAR. TOP OF PALM.'],
    [540, 'KUMARA: A BIT TALLER.'],
  ];
  const lx = SL.x0 + 14;
  const ll = [];
  ll.push(['ALL QUIET. SHE IS NODDING.', [[0, tm(90)], [27.2, T + 0.01]]]);
  rev.forEach(([m, s], i) => ll.push([s, [[tm(m), i + 1 < rev.length ? tm(rev[i + 1][0]) : RUN1]]]));
  ll.push(['STILL QUIET. STILL NODDING.', [[RUN1, BLANK0 + 0.2]]]);
  ll.push(['CHART CLEARED.', [[BLANK0 + 0.2, 27.2]]]);
  ll.forEach(([s, w], i) => {
    const last = i === ll.length - 2;
    TICK.push(P(textD(s, lx, y, 11), `cw w1 ${last ? 'tkd' : 'tk'} ${tickWin(w.map(([a, b]) => [a, Math.min(b, T + 0.01)]))}`));
  });
  TICK.push(P(polyD([[[SL.x0 + 10, SCR_Y1 - 30], [SL.x1 - 10, SCR_Y1 - 30]]]), 'cg w0'));
}

// ---------------------------------------------------------------------------
// Screen 3: the run, counters
// ---------------------------------------------------------------------------
const CLIPS = [];
const STRIPS = new Map(); // cap -> <path> in defs
let clipN = 0;
// a digit strip: returns markup; value keyframes given as [[t, digit], ...]
const strip = (x, y, cap, cls, { stops = null, spin = null, final = 0, sp: spc = 3 } = {}) => {
  const pitch = cap * 1.7;
  const w = 6 * (cap / 10);
  const id = `q${(clipN++).toString(36)}`;
  CLIPS.push(`<clipPath id="${id}"><rect x="${r1(x - 6)}" y="${r1(y - cap - cap * 0.35)}" width="${r1(w + 12)}" height="${r1(cap * 1.7)}"/></clipPath>`);
  const sid = `dg${String(cap).replace('.', '_')}`;
  if (!STRIPS.has(cap)) {
    const digits = [];
    for (let d = 0; d < 10; d++) digits.push(...textP(String(d), 0, d * pitch, cap));
    STRIPS.set(cap, `<path id="${sid}" class="g" d="${polyD(digits)}"/>`);
  }
  const ref = `<use href="#${sid}" x="${r1(x)}" y="${r1(y)}" class="${cls}"/>`;
  let inner = '';
  const fin = `transform:translateY(${r1(-final * pitch)}px)`;
  if (stops) {
    const st = stops.map(([t, v]) => [t, `transform:translateY(${r1(-v * pitch)}px)`]);
    const k = KF(st);
    const c = `a${(cid++).toString(36)}`;
    css(`.${c}{${fin};${anim(k, 'steps(1,end)')}}`);
    inner = `<g class="${c}">${ref}</g>`;
  }
  if (spin) {
    // spin = { period, from, to }: shows a running digit between from and to
    const kName = `sp${(kid++).toString(36)}`;
    css(`@keyframes ${kName}{from{transform:translateY(0)}to{transform:translateY(${r1(-10 * pitch)}px)}}`);
    const c = `a${(cid++).toString(36)}`;
    css(`.${c}{animation:${kName} ${spin.period}s steps(10,end) ${RUN0}s infinite}`);
    const vis = aClass(KF([[0, 'opacity:0'], [spin.from - 0.01, 'opacity:0'], [spin.from, 'opacity:1'], [spin.to - 0.01, 'opacity:1'], [spin.to, 'opacity:0'], [T, 'opacity:0']]));
    const hid = aClass(KF([[0, 'opacity:1'], [spin.from - 0.01, 'opacity:1'], [spin.from, 'opacity:0'], [spin.to - 0.01, 'opacity:0'], [spin.to, 'opacity:1'], [T, 'opacity:1']]));
    inner = `<g class="spinv ${vis}"><g class="${c}">${ref}</g></g>` +
      `<g class="${hid}"><g style="${fin}">${ref}</g></g>`;
  }
  return `<g clip-path="url(#${id})">${inner}</g>`;
};
// digit stop list for a value sequence: value(t) sampled at its change times
const digitStops = (changes, place, base = 10) => {
  // changes: sorted [[t, value]] (value from that time on); returns per-digit stops
  const st = [[0, 0]];
  let prev = 0;
  for (const [t, v] of changes) {
    const d = Math.floor(v / place) % base;
    if (d !== prev) { st.push([t, d]); prev = d; }
  }
  if (prev !== 0) st.push([RESET, 0]);
  st.push([T, 0]);
  return st;
};
{
  const x0 = SR.x0 + 16, x1 = SR.x1 - 16;
  sp(P(textD('SIM CLOCK', x0, 172, 10), 'cd w1'));
  sp(P(textD('H : M', x1, 172, 10, { align: 'right' }), 'cd w1'));
  // the clock HH:MM, cap 44
  const cap = 44, adv = (6 + 3.4) * cap / 10;
  const cy0 = 228;
  const hTens = [[RUN1, 10]];
  const hOnes = [], mTens = [];
  for (let m = 10; m <= 600; m += 10) {
    mTens.push([tm(m), m]);
    if (m % 60 === 0) hOnes.push([tm(m), m / 60]);
  }
  const cx0 = x0;
  sp(strip(cx0, cy0, cap, 'cw w3', { stops: digitStops(hTens, 10), final: 1 }));
  sp(strip(cx0 + adv, cy0, cap, 'cw w3', { stops: digitStops(hOnes, 1), final: 0 }));
  sp(P(textD(':', cx0 + adv * 2, cy0, cap, { sp: 3.4 }), 'cw w3 blink'));
  sp(strip(cx0 + adv * 3, cy0, cap, 'cw w3', { stops: digitStops(mTens.map(([t, m]) => [t, Math.floor(m / 10) % 6]), 1, 10), final: 0 }));
  sp(strip(cx0 + adv * 4, cy0, cap, 'cw w3', { spin: { period: 10 / RATE, from: RUN0, to: RUN1 }, final: 0 }));
  sp(P(textD('OF', x1, 204, 10, { align: 'right' }), 'cd w1'));
  sp(P(textD('10:00', x1, 226, 13, { align: 'right' }), 'cy w1'));

  // bars counter: 12000 bars of 3 s
  const bcap = 20, badv = (6 + 3) * bcap / 10;
  const by = 270;
  sp(P(textD('BARS PLAYED', x0, by - 4, 10), 'cd w1'));
  sp(P(textD('3 S EACH', x0, by + 12, 9), 'cd w1'));
  const bx = x1 - badv * 5 + 3 * bcap / 10;
  const thou = [], tthou = [];
  for (let b = 1000; b <= 12000; b += 1000) thou.push([RUN0 + b / 500, b]);
  tthou.push([RUN0 + 10000 / 500, 10000]);
  sp(strip(bx, by + 6, bcap, 'cy w2', { stops: digitStops(tthou, 10000), final: 1 }));
  sp(strip(bx + badv, by + 6, bcap, 'cy w2', { stops: digitStops(thou, 1000), final: 2 }));
  sp(strip(bx + badv * 2, by + 6, bcap, 'cy w2', { spin: { period: 2, from: RUN0, to: RUN1 }, final: 0 }));
  sp(strip(bx + badv * 3, by + 6, bcap, 'cy w2', { spin: { period: 0.2, from: RUN0, to: RUN1 }, final: 0 }));
  sp(strip(bx + badv * 4, by + 6, bcap, 'cy w2', { spin: { period: 0.02, from: RUN0, to: RUN1 }, final: 0 }));
  sp(P(polyD([[[x0, 292], [x1, 292]]]), 'cg w0'));

  // the four timers and their event counters
  sp(P(textD('TIMER', x0, 310, 9), 'cd w1'));
  sp(P(textD('EVERY', x0 + 118, 310, 9), 'cd w1'));
  sp(P(textD('EVENTS', x1, 310, 9, { align: 'right' }), 'cd w1'));
  const R = rng(1992);
  const tiers = [
    ['REGULAR', '2-5 MIN', 155],
    ['OCCASIONAL', '12-25 MIN', 30],
    ['RARE', '30-60 MIN', 13],
    ['SUPER RARE', '3-6 HRS', 2],
  ];
  tiers.forEach(([name, every, n], i) => {
    const y = 334 + i * 24;
    sp(P(textD(name, x0, y, 11), 'cw w1'));
    sp(P(textD(every, x0 + 118, y, 11), 'cb w1'));
    // event times: n events spread over the run with seeded jitter
    const times = [];
    for (let k = 0; k < n; k++) times.push(((k + 0.15 + R() * 0.7) / n) * 596 + 2);
    times.sort((a, b) => a - b);
    const ch = times.map((m, k) => [tm(m), k + 1]);
    const ccap = 12, cadv = (6 + 3) * ccap / 10;
    const nd = String(n).length;
    const cx = x1 - (nd * cadv - 3 * ccap / 10);
    for (let d = 0; d < nd; d++) {
      const place = 10 ** (nd - 1 - d);
      const fin = Math.floor(n / place) % 10;
      sp(strip(cx + d * cadv, y + 1, ccap, 'cy w1', { stops: digitStops(ch, place), final: fin }));
    }
  });
  sp(P(textD('MEDIAN OF 200 SIMULATED RUNS', x0, 424, 9), 'cd w1'));
  sp(P(polyD([[[x0, 434], [x1, 434]]]), 'cg w0'));
  // status lamps: idle most of the time, busy during the gags
  // she is busy for each gag; the ship waits until she is, then crosses
  const busyW = [52, 125, 195, 280, 355, 470, 530].map((m) => [tm(m) - 0.2, tm(m) + 1.6]);
  busyW.push([tm(402), tm(410) + 3]);
  busyW.sort((a, b) => a[0] - b[0]);
  const busyOn = aClass(KF([[0, 'opacity:.18'], ...busyW.flatMap(([a, b]) => [[a - 0.01, 'opacity:.18'], [a, 'opacity:1'], [b - 0.01, 'opacity:1'], [b, 'opacity:.18']]), [T, 'opacity:.18']]));
  const idleOn = aClass(KF([[0, 'opacity:1'], ...busyW.flatMap(([a, b]) => [[a - 0.01, 'opacity:1'], [a, 'opacity:.18'], [b - 0.01, 'opacity:.18'], [b, 'opacity:1']]), [T, 'opacity:1']]));
  sp(P(textD('SHE IS', x0, 456, 10), 'cd w1'));
  const lamp = (txt, x, cls, anim) => {
    const w = textW(txt, 11);
    sp(`<g class="${anim}">` + P(polyD([[[x - 5, 442], [x + w + 5, 442], [x + w + 5, 461], [x - 5, 461], [x - 5, 442]]]), `${cls} w1`) + P(textD(txt, x, 457, 11), `${cls} w1`) + '</g>');
  };
  lamp('IDLE', x0 + 76, 'cp', idleOn);
  lamp('BUSY', x0 + 136, 'cr', `${busyOn} busyd`);
  sp(P(textD('NIGHT SCENES', x0, 478, 10), 'cd w1'));
  sp(P(textD('0', x1, 478, 10, { align: 'right' }), 'cy w1'));
  sp(P(textD('BY RULE', x1 - 22, 478, 9, { align: 'right' }), 'cd w1'));
  void x1;
}

// ---------------------------------------------------------------------------
// The monochrome monitor: a typed dialogue with the computer
// ---------------------------------------------------------------------------
const TERM = [];
{
  const x = 46, y0 = 540, lh = 20, cap = 11.5;
  const lines = [
    ['LOGON: DUTY OFFICER', null],
    ['MOLLUSC READY. IT IS ALWAYS DAYTIME HERE.', null],
    ['> STATUS', [1.2, 0.5]],
    ['ISLAND 1. PALM 1. RAFT 1. HER: NODDING.', [2.2, 1.6]],
    ['> WHEN IS THE NEXT EVENT', [6.0, 1.3]],
    ['ON THE NEXT BAR. BARS ARE 3 SECONDS.', [7.8, 1.6]],
    ['> RECOMMENDED ACTION', [12.4, 1.0]],
    ['WAIT. CALMLY. FOR ABOUT TEN HOURS.', [13.8, 1.6]],
  ];
  lines.forEach(([s, ty], i) => {
    const y = y0 + i * lh;
    const user = s.startsWith('>');
    const d = textD(s, x, y, cap, { sp: 3.2 });
    if (!ty) { TERM.push(P(d, `ct w1${user ? ' op8' : ''}`)); return; }
    const w = textW(s, cap, 3.2) + 8;
    const id = `q${(clipN++).toString(36)}`;
    const [t0, dur] = ty;
    const n = s.length;
    const k = KF([[0, 'transform:translateX(0)'], [t0, `transform:translateX(0);animation-timing-function:steps(${n},end)`], [t0 + dur, `transform:translateX(${r1(w)}px)`], [BLANK0 + 0.4, `transform:translateX(${r1(w)}px)`], [BLANK0 + 0.41, 'transform:translateX(0)'], [T, 'transform:translateX(0)']]);
    const c = `a${(cid++).toString(36)}`;
    css(`.${c}{transform:translateX(${r1(w)}px);${anim(k)}}`);
    CLIPS.push(`<clipPath id="${id}"><rect class="${c}" x="${r1(x - 4 - w)}" y="${r1(y - cap - 3)}" width="${r1(w)}" height="${r1(cap + 8)}"/></clipPath>`);
    TERM.push(`<g clip-path="url(#${id})">${P(d, `ct w1${user ? ' op8' : ''}`)}</g>`);
  });
  // a cursor after the last line, blinking once it has been typed
  const lastY = y0 + (lines.length - 1) * lh;
  const cx = x + textW(lines[lines.length - 1][0], cap, 3.2) + 8;
  const cur = aClass(KF([[0, 'opacity:0'], [15.4, 'opacity:0'], [15.41, 'opacity:1'], [BLANK0 + 0.4, 'opacity:1'], [BLANK0 + 0.41, 'opacity:0'], [T, 'opacity:0']]));
  TERM.push(`<g class="${cur}"><path class="ct w2 blink" d="${polyD([[[cx, lastY + 1], [cx + 7, lastY + 1]]])}"/></g>`);
}

// ---------------------------------------------------------------------------
// Noughts and crosses: crab against coconut, always a draw
// ---------------------------------------------------------------------------
const TTT = [];
{
  const GAME = 7.5;   // four games a loop
  const cx = 710, top = 540, cell = 34;
  const gx = cx - cell * 1.5;
  TTT.push(P(textD('CRAB VS COCONUT', cx, 532, 10, { align: 'center' }), 'cw w1'));
  const grid = [];
  for (let i = 1; i < 3; i++) {
    grid.push([[gx + i * cell, top + 4], [gx + i * cell, top + 3 * cell - 4]]);
    grid.push([[gx + 4, top + i * cell], [gx + 3 * cell - 4, top + i * cell]]);
  }
  TTT.push(P(polyD(grid), 'cb w2'));
  // a game that can only be a draw: X = crab, O = coconut
  const moves = [4, 0, 2, 6, 3, 5, 7, 1, 8];
  moves.forEach((c, i) => {
    const mx = gx + (c % 3) * cell + cell / 2, my = top + Math.floor(c / 3) * cell + cell / 2;
    const isX = i % 2 === 0;
    const t0 = 0.35 + i * 0.58;
    const k = KF([[0, 'stroke-dashoffset:1;opacity:1'], [t0, 'stroke-dashoffset:1;opacity:1'], [t0 + 0.3, 'stroke-dashoffset:0;opacity:1'], [6.9, 'stroke-dashoffset:0;opacity:1'], [7.25, 'stroke-dashoffset:0;opacity:0'], [7.3, 'stroke-dashoffset:1;opacity:0'], [GAME, 'stroke-dashoffset:1;opacity:1']].map(([t, d]) => [t * T / GAME, d]));
    const c2 = `a${(cid++).toString(36)}`;
    css(`.${c2}{${anim(k, 'linear', GAME)}}`);
    const r = 10;
    const d = isX ? polyD([[[mx - r, my - r], [mx + r, my + r]], [[mx + r, my - r], [mx - r, my + r]]]) : polyD([E(mx, my, r + 1, r + 1, -90, 270, 18)]);
    TTT.push(`<path class="${isX ? 'cr' : 'cy'} w2 dr ${c2}" pathLength="1" d="${d}"/>`);
  });
  const kRes = KF([[0, 'opacity:.3'], [5.6, 'opacity:.3'], [5.61, 'opacity:1'], [7.2, 'opacity:1'], [7.21, 'opacity:.3'], [GAME, 'opacity:.3']].map(([t, d]) => [t * T / GAME, d]));
  const cRes = `a${(cid++).toString(36)}`;
  css(`.${cRes}{${anim(kRes, 'linear', GAME)}}`);
  TTT.push(`<g class="${cRes}">${P(textD('RESULT: DRAW', cx, 662, 11, { align: 'center' }), 'cy w1')}</g>`);
  TTT.push(P(textD('BEST OF 12000', cx, 682, 9, { align: 'center' }), 'cd w1'));
}

// ---------------------------------------------------------------------------
// How to run it
// ---------------------------------------------------------------------------
const RUNP = [];
{
  const x = 850;
  RUNP.push(P(textD('TO OPEN THE BOARD AT HOME', x, 536, 10), 'cd w1'));
  RUNP.push(P(textD('> PYTHON TOOLS/SERVE.PY', x, 566, 15, { sp: 3 }), 'cy w2'));
  RUNP.push(P(textD('> OPEN 127.0.0.1:8765', x, 594, 15, { sp: 3 }), 'cw w2'));
  RUNP.push(P(polyD([[[x, 608], [1234, 608]]]), 'cg w0'));
  RUNP.push(P(textD('EVERY SOUND IS SYNTHESIZED FROM CODE.', x, 628, 10.5), 'cb w1'));
  RUNP.push(P(textD('NO SAMPLES. NO RECORDINGS. 150+ SOUNDS.', x, 646, 10.5), 'cb w1'));
  RUNP.push(P(textD('80 BPM · F MAJOR · 3 S BARS · -14 LUFS', x, 664, 10.5), 'cb w1'));
  RUNP.push(P(textD('LISTENED TO SO FAR BY: NOBODY', x, 682, 9.5), 'cd w1'));
}

// ---------------------------------------------------------------------------
// Assemble
// ---------------------------------------------------------------------------
const blankCls = aClass(KF([[0, 'opacity:1'], [BLANK0, 'opacity:1'], [BLANK1, 'opacity:0'], [UNBLANK - 0.01, 'opacity:0'], [UNBLANK, 'opacity:1'], [T, 'opacity:1']]));

// glow passes: halo, glow, line, hot core
const style = `
.cw{--c:${C.wht}}.cy{--c:${C.yel}}.cb{--c:${C.coast}}.cg{--c:${C.grid}}.cr{--c:${C.track}}
.cd{--c:${C.dim}}.cp{--c:${C.palm}}.cc{--c:${C.coral}}.cf{--c:${C.raft}}.ct{--c:${C.term}}
.co{--c:#ff8a3d}.cg2{--c:${C.cyan}}
.w0{--w:.8}.w1{--w:1.25}.w2{--w:1.8}.w3{--w:3}.w4{--w:4.5}.w5{--w:4.4}
#ALL path,#ALL circle,.g{fill:none;stroke:var(--hot,var(--c));stroke-width:calc(var(--w) * var(--m) * 1px + var(--a) * 1px);stroke-linecap:round;stroke-linejoin:round}
.cg{opacity:.55}.op6{opacity:.6}.op8{opacity:.8}
.dot{stroke-dasharray:0 5}.dash{stroke-dasharray:6 6}.dash2{stroke-dasharray:3 7}.dotr{stroke-dasharray:1 2.6}
.dr{stroke-dasharray:1 1}
.ring{transform-box:fill-box;transform-origin:center}
.nod{transform-box:fill-box;transform-origin:center;animation:nod .75s ease-out infinite}
@keyframes nod{0%{transform:scale(.6);opacity:1}100%{transform:scale(2.6);opacity:0}}
.orbit{transform-origin:${IC[0]}px ${IC[1]}px;animation:orb 15s linear infinite}
@keyframes orb{to{transform:rotate(360deg)}}
.bob{transform-box:fill-box;transform-origin:center bottom;animation:bob .75s steps(2,end) infinite}
@keyframes bob{50%{transform:translateY(2px)}}
.grow{transform-box:fill-box;transform-origin:center bottom;animation:grow ${T}s steps(1,end) infinite}
.blink{animation:blink 1s steps(2,end) infinite}
@keyframes blink{50%{opacity:.25}}
.tk{opacity:0}.tkd{opacity:1}.gone{opacity:0}.spinv{opacity:0}.busyd{opacity:.18}
.u1{--m:1;--a:7;opacity:.1}.u2{--m:1;--a:2.6;opacity:.3}.u3{--m:1;--a:0}.u4{--m:.42;--a:0;--hot:#fff;opacity:.55}
.flick{animation:flick 7.5s linear infinite}
@keyframes flick{0%,100%{opacity:1}31%{opacity:.965}33%{opacity:1}71%{opacity:.975}72%{opacity:1}}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}
`;
// kumara growth: 8 steps over the run, small again at the reset
{
  const st = [[0, 'transform:scale(.3)']];
  for (let i = 1; i <= 8; i++) st.push([RUN0 + (i / 8) * (RUN1 - RUN0 - 0.5), `transform:scale(${r1((0.3 + 0.7 * i / 8) * 100) / 100})`]);
  st.push([RESET, 'transform:scale(1)'], [RESET + 0.01, 'transform:scale(.3)'], [T, 'transform:scale(.3)']);
  css(`@keyframes grow{${st.map(([t, d]) => `${pc(t)}{${d}}`).join('')}}`);
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="ttl dsc">
<title id="ttl">CASTAWAY: a war-room big board for a ten-hour lo-fi island video</title>
<desc id="dsc">Three rear-projected vector screens and a console replay a ten-hour run of Castaway at high speed: an island chart, a Pacific map with tracks arriving at one tiny island, and climbing counters. Below, a typed dialogue with the board's computer, a noughts-and-crosses game that always ends in a draw, and how to run it.</desc>
<style>${style}${CSS.join('\n')}</style>
<defs>
<radialGradient id="room" cx="50%" cy="40%" r="75%"><stop offset="0" stop-color="#0b1118"/><stop offset="1" stop-color="#05070b"/></radialGradient>
<radialGradient id="scr" cx="50%" cy="48%" r="70%"><stop offset="0" stop-color="#0a1622"/><stop offset=".65" stop-color="#050b12"/><stop offset="1" stop-color="#020407"/></radialGradient>
<radialGradient id="tscr" cx="50%" cy="50%" r="70%"><stop offset="0" stop-color="#06160c"/><stop offset="1" stop-color="#020604"/></radialGradient>
${CLIPS.join('\n')}
${[...STRIPS.values()].join('\n')}
<g id="ALL">
${ALL.join('\n')}
<g class="${blankCls}">
${SCREEN.join('\n')}
</g>
${TICK.join('\n')}
${TERM.join('\n')}
${TTT.join('\n')}
${RUNP.join('\n')}
</g>
</defs>
${BACK.join('\n')}
<g class="flick">
<use href="#ALL" class="u1"/>
<use href="#ALL" class="u2"/>
<use href="#ALL" class="u3"/>
<use href="#ALL" class="u4"/>
</g>
</svg>
`;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, svg);
console.log(`wrote ${path.relative(process.cwd(), OUT)} (${(svg.length / 1024).toFixed(1)} KB)`);
