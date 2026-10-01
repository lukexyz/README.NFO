#!/usr/bin/env node
// Castaway as a fetch card in a desktop screenshot (style hack-06 in styles/styles.json).
//
// Regenerate:  node examples/castaway/src/78-fetch-card_opus_5.5.mjs
// Writes assets/78-fetch-card_opus_5.5.svg (the animated screenshot) and 78-fetch-card_opus_5.5.md
// (the header; its plain-text card is built from the same rows as the picture).
//
// The style: the system-info card that Unix desktop customisers paste into every screenshot (a
// shell prompt, a command, an ASCII logo on the left, "user@host" over a hyphen underline and a
// column of "Key: value" rows on the right, then two strips of the terminal's 16 colours).
// screenFetch (2010) and neofetch (2015, archived 2024) are the best-known programs that print
// one; both are credited references only. No distribution logo, mascot or vendor mark is used:
// the emblem (a palm, the sun, the island, the raft) and the CASTAWAY lettering are drawn by
// this generator, and the command, "islandfetch", is invented.
//
// The joke: every 9 seconds somebody reruns islandfetch to see what is happening on the island.
// "Now: idling", every time. Meanwhile, in the live-preview window in the corner, a sea turtle,
// a shark in headphones, a delivery drone and a coconut-wearing crab come and go, and each rerun
// reports the one you just missed. The light terminal theme is the project's own rule: it is
// always daytime.
//
// What is real (from D:/python/castaway, read 2026-10-01): the four timers and their medians in
// a 10-hour run, seed 1992, 80 BPM in F major (ii-V-I-vi, 60 s loop), 0 samples, 1920x1080 at
// 24 fps ([video] fps in activities.toml), WebCodecs H.264 in the browser, tools/serve.py and
// the line it prints. What is staged: the uptimes, the order of the gags, and the tick strips in
// the schedule widget (drawn from this file's own seeded PRNG at the real intervals and median
// counts, not the real seed-1992 run).
//
// Plain Node, no dependencies, deterministic (seeded PRNG, no clock). All lettering is a
// monoline stroke font defined below, placed with <use>, never <text>. Animation is CSS only:
// one 36 s loop (four reruns of 9 s, three bars of the theme each). The un-animated state of
// every element is the frame at 0 s, a complete card, so prefers-reduced-motion shows a whole,
// readable screen.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '78-fetch-card_opus_5.5';
const OUT_SVG = path.join(HERE, '..', 'assets', `${SLUG}.svg`);
const OUT_MD = path.join(HERE, '..', `${SLUG}.md`);

// ---------------------------------------------------------------------------------------------
// Seeded PRNG
// ---------------------------------------------------------------------------------------------
function mulberry32(a) {
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = mulberry32(1992);
const f1 = (v) => +v.toFixed(1);
const f2 = (v) => +v.toFixed(2);

// ---------------------------------------------------------------------------------------------
// Geometry and time
// ---------------------------------------------------------------------------------------------
const W = 1120, H = 626;
const CW = 9, CH = 18;                 // terminal cell
const T = 36;                          // the loop: four reruns of 9 s (three bars each)
const CYCLE = 9;
const BEAT = 0.75;                     // 80 BPM
const BLINK = 0.375;                   // cursor half-period (an eighth note)

// ---------------------------------------------------------------------------------------------
// The terminal theme: "Lagoon Noon", a light scheme, because it is always daytime
// ---------------------------------------------------------------------------------------------
const ANSI = [
  '#2d3b43', '#e0604c', '#4f9a3c', '#c4892f', '#2a86c2', '#c15f9b', '#1f9d9b', '#d3c6ac',
  '#8b6b4e', '#f2846e', '#79bf55', '#e6a52a', '#5aaee3', '#e08ac0', '#4fcbc3', '#fffcf4',
];
const TERM_BG = '#f7f0e0', FG = '#2d3b43', DIM = '#8a8f8a';
const PAL = {
  fg: FG, dim: DIM, mute: '#b2ab9b', cream: '#fffaf0', bar: '#2d3b43',
  ...Object.fromEntries(ANSI.map((c, i) => [`c${i}`, c])),
};
const PK = Object.keys(PAL);
const S = (k) => `s${PK.indexOf(k)}`;   // stroke colour class
const F = (k) => `f${PK.indexOf(k)}`;   // fill colour class

// ---------------------------------------------------------------------------------------------
// Monoline stroke font. Glyph box: x 0..6, caps y 0..10, x-height y 3, descenders to y 13.
// Placed at (1.5, 4) inside a 9 x 18 cell.
// ---------------------------------------------------------------------------------------------
const O_CAP = 'M2.6 0H3.4Q6 0 6 2.6V7.4Q6 10 3.4 10H2.6Q0 10 0 7.4V2.6Q0 0 2.6 0Z';
const GLYPHS = {
  A: 'M0 10L3 0L6 10M1 6.7H5',
  B: 'M0 0V10H3.8Q6 10 6 7.6Q6 5 3.6 5H0M3.4 5Q5.6 5 5.6 2.5Q5.6 0 3.4 0H0',
  C: 'M6 2Q5.4 0 3.2 0H2.6Q0 0 0 2.6V7.4Q0 10 2.6 10H3.2Q5.4 10 6 8',
  D: 'M0 0V10H2.8Q6 10 6 7V3Q6 0 2.8 0Z',
  E: 'M6 0H0V10H6M0 5H4.6',
  F: 'M6 0H0V10M0 5H4.6',
  G: 'M6 2Q5.4 0 3.2 0H2.6Q0 0 0 2.6V7.4Q0 10 2.6 10H3.4Q6 10 6 7.4V5.2H3.4',
  H: 'M0 0V10M6 0V10M0 5H6',
  I: 'M1.2 0H4.8M3 0V10M1.2 10H4.8',
  J: 'M2.4 0H6V7.4Q6 10 3.4 10H2.6Q0 10 0 7.6',
  K: 'M0 0V10M6 0L0.4 6M2.2 4.2L6 10',
  L: 'M0 0V10H6',
  M: 'M0 10V0L3 5.6L6 0V10',
  N: 'M0 10V0L6 10V0',
  O: O_CAP,
  P: 'M0 10V0H3.4Q6 0 6 2.8Q6 5.6 3.4 5.6H0',
  Q: O_CAP + 'M3.6 7.6L6.2 11.4',
  R: 'M0 10V0H3.4Q6 0 6 2.8Q6 5.6 3.4 5.6H0M3.2 5.6L6 10',
  S: 'M5.8 1.6Q5 0 3 0Q0.2 0 0.2 2.6Q0.2 4.6 3 5Q5.8 5.4 5.8 7.4Q5.8 10 3 10Q0.8 10 0 8.2',
  T: 'M0 0H6M3 0V10',
  U: 'M0 0V7.4Q0 10 2.6 10H3.4Q6 10 6 7.4V0',
  V: 'M0 0L3 10L6 0',
  W: 'M0 0L1.3 10L3 3.6L4.7 10L6 0',
  X: 'M0 0L6 10M6 0L0 10',
  Y: 'M0 0L3 5.2L6 0M3 5.2V10',
  Z: 'M0 0H6L0 10H6',
  0: O_CAP + 'M4.4 2.6L1.6 7.4',
  1: 'M0.8 2.2L3.2 0V10M0.6 10H5.6',
  2: 'M0.2 2.2Q0.8 0 3 0Q5.8 0 5.8 2.8Q5.8 4.6 3.8 6L0 10H6',
  3: 'M0.2 1.6Q1 0 3 0Q5.6 0 5.6 2.5Q5.6 5 2.8 5H2M2.8 5Q6 5 6 7.5Q6 10 3 10Q0.8 10 0 8.2',
  4: 'M4.4 10V0L0 7H6',
  5: 'M5.6 0H0.6L0.2 4.8Q1.4 3.8 3 3.8Q6 3.8 6 6.9Q6 10 3 10Q0.9 10 0 8.4',
  6: 'M5.2 0.8Q4.4 0 3 0Q0 0 0 4.2V7.2Q0 10 3 10Q6 10 6 7.1Q6 4.3 3 4.3Q0.9 4.3 0 6',
  7: 'M0 0H6L2.2 10',
  8: 'M3 4.8Q0.5 4.8 0.5 2.4Q0.5 0 3 0Q5.5 0 5.5 2.4Q5.5 4.8 3 4.8Q0 4.8 0 7.4Q0 10 3 10Q6 10 6 7.4Q6 4.8 3 4.8Z',
  9: 'M0.8 9.2Q1.6 10 3 10Q6 10 6 5.8V2.8Q6 0 3 0Q0 0 0 2.9Q0 5.7 3 5.7Q5.1 5.7 6 4',
  a: 'M0.6 3.6Q1.4 3 3 3Q5.6 3 5.6 5.4V10M5.6 6.2H2.6Q0 6.2 0 8.1Q0 10 2.4 10Q4.6 10 5.6 8.4',
  b: 'M0 0V10H3.4Q6 10 6 7.4V5.6Q6 3 3.4 3H0',
  c: 'M5.8 3.8Q5 3 3.4 3H2.6Q0 3 0 5.6V7.4Q0 10 2.6 10H3.4Q5 10 5.8 9.2',
  d: 'M6 0V10H2.6Q0 10 0 7.4V5.6Q0 3 2.6 3H6',
  e: 'M0 6.6H6V5.6Q6 3 3.4 3H2.6Q0 3 0 5.6V7.4Q0 10 2.6 10H3.6Q5.1 10 5.8 9.2',
  f: 'M5.6 0.6Q5 0 4 0Q2.2 0 2.2 2V10M0.2 3.4H5',
  g: 'M6 3V10.6Q6 13 3.4 13H1M6 9.8H2.6Q0 9.8 0 7.4V5.4Q0 3 2.6 3H6',
  h: 'M0 0V10M0 3H3.4Q6 3 6 5.6V10',
  i: 'M0.8 3H3.2V10M0.6 10H5.6M3 0.1V0.8',
  j: 'M1.4 3H4.6V10.6Q4.6 13 2.2 13H0.6M4.6 0.1V0.8',
  k: 'M0.4 0V10M5.6 3L0.4 7.4M2.4 5.8L6 10',
  l: 'M0.6 0H3V7.6Q3 10 5 10H6',
  m: 'M0 10V3H4.4Q6 3 6 4.6V10M3 3V10',
  n: 'M0 10V3H3.4Q6 3 6 5.6V10',
  o: 'M2.6 3H3.4Q6 3 6 5.6V7.4Q6 10 3.4 10H2.6Q0 10 0 7.4V5.6Q0 3 2.6 3Z',
  p: 'M0 13V3H3.4Q6 3 6 5.6V7.4Q6 10 3.4 10H0',
  q: 'M6 13V3H2.6Q0 3 0 5.6V7.4Q0 10 2.6 10H6',
  r: 'M0.6 3V10M0.6 5.8Q0.6 3 3.4 3H5.8',
  s: 'M5.6 3.6Q4.8 3 3.2 3H2.6Q0.3 3 0.3 4.8Q0.3 6.4 3 6.4Q5.8 6.4 5.8 8.2Q5.8 10 3.2 10H2.6Q0.8 10 0 9.2',
  t: 'M2.2 0.6V7.6Q2.2 10 4.4 10H5.8M0 3H5.4',
  u: 'M0 3V7.4Q0 10 2.6 10H6V3',
  v: 'M0 3L3 10L6 3',
  w: 'M0 3L1.4 10L3 5L4.6 10L6 3',
  x: 'M0 3L6 10M6 3L0 10',
  y: 'M0 3L3 9.6M6 3L2.4 11.8Q1.9 13 0.6 13',
  z: 'M0 3H6L0 10H6',
  '.': 'M3 9.3V9.9',
  ',': 'M3.2 9.2V9.8L2.2 11.8',
  ':': 'M3 3.7V4.3M3 9.3V9.9',
  ';': 'M3 3.7V4.3M3.2 9.2V9.8L2.2 11.8',
  '!': 'M3 0V7M3 9.3V9.9',
  '?': 'M0.4 1.8Q1 0 3 0Q5.8 0 5.8 2.6Q5.8 4.2 3 5.2V7M3 9.3V9.9',
  "'": 'M3 0V3',
  '"': 'M1.8 0V3M4.2 0V3',
  '-': 'M1 6.2H5',
  '_': 'M0 12H6',
  '/': 'M5.6 -0.4L0.4 10.4',
  '|': 'M3 -1.5V11.5',
  '(': 'M4.4 -0.6Q1.6 2 1.6 5Q1.6 8 4.4 10.6',
  ')': 'M1.6 -0.6Q4.4 2 4.4 5Q4.4 8 1.6 10.6',
  '[': 'M4.6 -1.5H2V11.5H4.6',
  ']': 'M1.4 -1.5H4V11.5H1.4',
  '<': 'M5.4 2.4L0.6 6.2L5.4 10',
  '>': 'M0.6 2.4L5.4 6.2L0.6 10',
  '#': 'M2 1V10M4.4 1V10M0 3.8H6M0 7.2H6',
  '*': 'M3 2.4V8.4M0.4 3.9L5.6 6.9M0.4 6.9L5.6 3.9',
  '+': 'M3 3.2V9.2M0 6.2H6',
  '=': 'M0.4 4.6H5.6M0.4 7.8H5.6',
  '%': 'M5.6 0.4L0.4 9.6M0.2 1.6a1 1 0 1 0 2 0a1 1 0 1 0 -2 0M3.8 8.4a1 1 0 1 0 2 0a1 1 0 1 0 -2 0',
  '~': 'M0 6.6Q1.5 4.8 3 6.2Q4.5 7.6 6 5.8',
  '·': 'M3 6V6.6',
  '→': 'M0 6.2H5.6M3.2 3.6L5.8 6.2L3.2 8.8',
};
Object.assign(GLYPHS, {
  '\\': 'M0.4 -0.4L5.6 10.4',
  '`': 'M2.2 0.2L3.8 2.2',
  '^': 'M0.8 4.2L3 0.6L5.2 4.2',
  '$': 'M5.6 2.2Q4.9 1 3 1Q0.4 1 0.4 3Q0.4 4.8 3 5.1Q5.8 5.5 5.8 7.4Q5.8 9.2 3 9.2Q1 9.2 0.2 8M3 -0.6V10.6',
  '@': 'M4.3 4.4Q4.3 3.2 3.1 3.2Q1.7 3.2 1.7 5.3Q1.7 7.4 3.1 7.4Q4.3 7.4 4.3 6.1V3.4M4.3 6.4Q4.3 7.8 5.1 7.8Q6 7.8 6 5.4Q6 0.4 3 0.4Q0 0.4 0 5.2Q0 10 3.2 10Q4.6 10 5.6 9.2',
});
Object.assign(GLYPHS, {
  '❯': 'M1.2 2.2L5.2 6.2L1.2 10.2',
  '♪': 'M4.4 8.4V0.8L6.2 2.4M4.4 8.4Q4.4 10 2.8 10Q1.4 10 1.4 9Q1.4 7.8 3 7.8Q4.4 7.8 4.4 8.4',
});

// Ids: one <path> per glyph in <defs>, placed with <use>
const IDS = [...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'];
let idN = 0;
const nextId = () => { const n = idN++; return n < IDS.length ? IDS[n] : IDS[Math.floor(n / IDS.length) - 1] + IDS[n % IDS.length]; };
const glyphIds = new Map();
function gid(ch) {
  if (!(ch in GLYPHS)) throw new Error(`no glyph for ${JSON.stringify(ch)}`);
  if (!glyphIds.has(ch)) glyphIds.set(ch, nextId());
  return glyphIds.get(ch);
}
// One run of text as uses, x relative to the run start.
function uses(str, x0 = 0, y = null) {
  let out = '';
  [...str].forEach((ch, i) => {
    if (ch === ' ') return;
    const x = x0 + i * CW;
    out += `<use href="#${gid(ch)}"${x ? ` x="${f1(x)}"` : ''}${y ? ` y="${y}"` : ''}/>`;
  });
  return out;
}
// A line of text: parts = [[str, colourKey, weight?], ...]
function textLine(x, y, parts, extraCls = '') {
  let col = 0, out = '';
  const groups = new Map();
  for (const [str, k, wt] of parts) {
    const key = `${k}|${wt || ''}`;
    if (!groups.has(key)) groups.set(key, '');
    groups.set(key, groups.get(key) + uses(str, col * CW));
    col += [...str].length;
  }
  for (const [key, body] of groups) {
    if (!body) continue;
    const [k, wt] = key.split('|');
    out += `<g class="${S(k)}${wt ? ' ' + wt : ''}">${body}</g>`;
  }
  if (!out) return '';
  return `<g transform="translate(${f1(x)} ${f1(y)})" class="t${extraCls ? ' ' + extraCls : ''}">${out}</g>`;
}

// ---------------------------------------------------------------------------------------------
// Animation helpers. Each animated element gets a class whose keyframes are built from a state
// function sampled between exact breakpoints; timing is step-end, so values hold.
// ---------------------------------------------------------------------------------------------
const css = [];
const pctT = (t) => +(t / T * 100).toFixed(3);
const stepCache = new Map();
let stepN = 0;
// breaks: times in [0, T); state(t) -> string of CSS declarations (e.g. 'opacity:0')
function stepAnim(breaks, state) {
  const bs = [...new Set([0, ...breaks.map((b) => +(((b % T) + T) % T).toFixed(4))])].sort((a, b) => a - b);
  const frames = [];
  let prev = null;
  bs.forEach((b, i) => {
    const next = i + 1 < bs.length ? bs[i + 1] : T;
    const s = state((b + next) / 2);
    if (s !== prev) frames.push([b, s]);
    prev = s;
  });
  if (frames.length === 1) return { cls: '', base: frames[0][1] };
  const key = frames.map(([b, s]) => `${b}:${s}`).join(',');
  if (stepCache.has(key)) return stepCache.get(key);
  const name = 'k' + (stepN++).toString(36);
  const kf = frames.map(([b, s]) => `${pctT(b)}%{${s}}`).join('') + `100%{${frames[frames.length - 1][1]}}`;
  css.push(`.${name}{${frames[0][1]};animation:${name} ${T}s step-end infinite}@keyframes ${name}{${kf}}`);
  const out = { cls: name, base: frames[0][1] };
  stepCache.set(key, out);
  return out;
}
const visCls = (breaks, on) => {
  const r = stepAnim(breaks, (t) => `opacity:${on(t) ? 1 : 0}`);
  if (!r.cls) return r.base === 'opacity:1' ? '' : null;
  return r.cls;
};
// Smooth keyframes: frames = [[t, decl], ...] over the whole loop (linear between frames).
let smoothN = 0;
function smoothAnim(frames, { dur = T, ease = 'linear', base = null } = {}) {
  const name = 'm' + (smoothN++).toString(36);
  const kf = frames.map(([t, d]) => `${+(t / dur * 100).toFixed(3)}%{${d}}`).join('');
  css.push(`.${name}{${base ?? frames[0][1]};animation:${name} ${dur}s ${ease} infinite}@keyframes ${name}{${kf}}`);
  return name;
}

// ---------------------------------------------------------------------------------------------
// The rerun timeline (seconds within each 9 s cycle)
// ---------------------------------------------------------------------------------------------
const CMD = 'islandfetch';
const TYPE0 = 5.25;
const TYPED = [0, 0.13, 0.24, 0.37, 0.47, 0.6, 0.74, 0.83, 0.95, 1.06, 1.17];
const CLEAR = 6.75;            // ctrl+L: the screen clears, the typed line jumps to the top
const ENTER = 7.05;            // the logo prints at once
const ROW0 = 7.12, ROWDT = 0.045;
const BACK = 8.35;             // the next prompt
const rowAt = (j) => ROW0 + j * ROWDT;
const cyc = (t) => Math.floor(t / CYCLE) % 4;
const loc = (t) => t - Math.floor(t / CYCLE) * CYCLE;
const allCycles = (rel) => [0, 1, 2, 3].map((c) => c * CYCLE + rel);
const BLINKS = Array.from({ length: Math.round(T / BLINK) }, (_, i) => i * BLINK);
const CARD_BREAKS = (j) => [...allCycles(CLEAR), ...allCycles(rowAt(j))];

// ---------------------------------------------------------------------------------------------
// The gags. Each cycle's gag plays in the preview window; the rerun at the end of the cycle
// reports it as missed. Uptimes are staged, one per rerun.
// ---------------------------------------------------------------------------------------------
const GAGS = [
  { id: 'turtle', missed: 'a sea turtle, visiting', uptime: '47 mins', min: 47 },
  { id: 'shark', missed: 'a shark in headphones', uptime: '3 hours, 41 mins', min: 221 },
  { id: 'drone', missed: 'a drone. parcel: headphones', uptime: '6 hours, 9 mins', min: 369 },
  { id: 'crab', missed: 'a crab, wearing a coconut', uptime: '9 hours, 31 mins', min: 571 },
];
// Which variant a rerun-updated row shows at time t (and whether it is visible at all)
const variantAt = (t, j) => {
  const c = cyc(t), u = loc(t);
  if (u >= CLEAR && u < rowAt(j)) return -1;
  return u >= rowAt(j) ? c : (c + 3) % 4;
};

// ---------------------------------------------------------------------------------------------
// The emblem: tone-ramp ASCII (coverage -> letter density), one colour per region, drawn from
// vector shapes in square units (x = column, y = row * 2)
// ---------------------------------------------------------------------------------------------
const LOGO_COLS = 40, EMB_ROWS = 17;
function buildEmblem() {
  const RAMP = '.:-+osyhdNM'.split('');
  const bez = (p0, p1, p2, t) => [(1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0], (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1]];
  function stroke(p0, p1, p2, wf) {
    const pts = [];
    for (let i = 0; i <= 160; i++) { const t = i / 160; pts.push([...bez(p0, p1, p2, t), wf(t)]); }
    const pad = Math.max(...pts.map((p) => p[2]));
    const minX = Math.min(...pts.map((p) => p[0])) - pad, maxX = Math.max(...pts.map((p) => p[0])) + pad;
    const minY = Math.min(...pts.map((p) => p[1])) - pad, maxY = Math.max(...pts.map((p) => p[1])) + pad;
    const f = (x, y) => {
      if (x < minX || x > maxX || y < minY || y > maxY) return false;
      for (let i = 0; i < pts.length; i++) {
        const [px, py, w] = pts[i];
        if ((x - px) ** 2 + (y - py) ** 2 <= (w / 2) ** 2) { f.t = i / (pts.length - 1); return true; }
      }
      return false;
    };
    return f;
  }
  // a frond: swells over the first third, then tapers to a point
  const leaf = (wmax, base = 1.2) => (t) => (t < 0.3 ? base + (wmax - base) * Math.sin((t / 0.3) * Math.PI / 2) : wmax * Math.cos(((t - 0.3) / 0.7) * Math.PI / 2) ** 0.9 + 0.05);
  const disc = (cx, cy, r) => (x, y) => (x - cx) ** 2 + (y - cy) ** 2 <= r * r;
  const ellipse = (cx, cy, rx, ry) => (x, y) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1;
  const CROWN = [15, 8];
  // five fronds: [control point, tip, widest], all from the crown
  const fronds = [
    [[7, -1], [0, 11], 4.4],
    [[8, 7], [2, 18], 3.8],
    [[12, -2], [7, 0], 2.6],
    [[22, -2], [28, 9], 4.4],
    [[21, 6], [24, 18], 3.8],
  ].map(([c, t, w]) => stroke(CROWN, c, t, leaf(w)));
  const MIN_COV = 0.12;                                   // below this a cell stays blank
  const trunk = stroke([11, 26], [9, 16], [15, 9], (t) => 2.6 - 1.0 * t);
  const SUN = [33, 7.5, 6.6];
  const sun = disc(...SUN);
  const SEA_Y = 26.4;
  const island = ellipse(14, 27.6, 12.5, 3.0);
  const nuts = [disc(13.9, 10, 1.15), disc(16.3, 10.3, 1.15)];
  const raft = (x, y) => x >= 28 && x <= 35 && y >= 28.2 && y <= 29.8;
  let lastFrond = {};
  const REG = [
    ['nut', (x, y) => nuts.some((f) => f(x, y)), 'c8'],
    ['frond', (x, y) => fronds.some((f) => { const h = f(x, y); if (h) lastFrond = f; return h; }), 'c2'],
    ['trunk', trunk, 'c8'],
    ['raft', raft, 'c8'],
    ['island', (x, y) => island(x, y) && y <= SEA_Y + 1.6, 'c3'],
    ['sun', sun, 'c11'],
  ];
  const RAMPS = { island: '.:-+os'.split('') };
  const shade = { frond: () => 1 - 0.35 * (lastFrond.t ?? 0) };
  const HALO = 1.4;
  const fgAt = (x, y) => REG[0][1](x, y) || REG[1][1](x, y) || REG[2][1](x, y);
  const nearFg = (x, y) => {
    for (let a = 0; a < 8; a++) if (fgAt(x + Math.cos(a * Math.PI / 4) * HALO, y + Math.sin(a * Math.PI / 4) * HALO)) return true;
    return false;
  };
  const SEA = [
    [14, 1, 38, '~~-~~~ ~-~~ ~~~-~ ~~ ', 'c4'],
    [15, 3, 36, '-~ -~-- -~ --~- -- ~-', 'c6'],
    [16, 7, 32, ' - -  -- -  - --  - ', 'c12'],
  ];
  const N = 6;
  const rows = [];
  for (let r = 0; r < EMB_ROWS; r++) {
    const row = [];
    for (let c = 0; c < LOGO_COLS; c++) {
      const cnt = REG.map(() => 0), sh = REG.map(() => 0);
      for (let i = 0; i < N; i++) for (let j = 0; j < 2 * N; j++) {
        const x = c + (i + 0.5) / N, y = r * 2 + (j + 0.5) / N;
        for (let k = 0; k < REG.length; k++) if (REG[k][1](x, y)) {
          if (REG[k][0] === 'sun' && nearFg(x, y)) break;
          cnt[k]++; sh[k] += (shade[REG[k][0]] || (() => 1))(x, y); break;
        }
      }
      let best = -1;
      for (let k = 0; k < REG.length; k++) if (cnt[k] > (best < 0 ? 0 : cnt[best])) best = k;
      let ch = ' ', ink = null;
      if (best >= 0) {
        const name = REG[best][0];
        const cov = sh[best] / (2 * N * N);
        const ramp = RAMPS[name] || RAMP;
        if (name === 'raft') { ch = '=#'[c % 2]; ink = REG[best][2]; }
        else if (cov >= MIN_COV) { ch = ramp[Math.min(ramp.length - 1, Math.floor((cov - 0.07) / 0.93 * ramp.length))]; ink = REG[best][2]; }
      }
      const sea = SEA.find(([sr]) => sr === r);
      if (ch === ' ' && sea && c >= sea[1] && c <= sea[2]) {
        const s = sea[3][(c + (r - 14) * 7) % sea[3].length];
        if (s !== ' ') { ch = s; ink = sea[4]; }
      }
      row.push([ch, ink]);
    }
    rows.push(row);
  }
  return rows;
}
// The lettering: 4 x 5 cells a letter (W is 5 wide), 'd b Y P' for the rounded corners
const LETTERS = {
  C: ['dMMb', 'M   ', 'M   ', 'M   ', 'YMMP'],
  A: ['dMMb', 'M  M', 'MMMM', 'M  M', 'M  M'],
  S: ['dMMb', 'M   ', 'YMMb', '   M', 'YMMP'],
  T: ['MMMM', ' MM ', ' MM ', ' MM ', ' MM '],
  W: ['M   M', 'M   M', 'M M M', 'M M M', 'YMMMP'],
  Y: ['M  M', 'M  M', 'YMMP', ' MM ', ' MM '],
};
function buildLogo() {
  const rows = buildEmblem();
  rows.push(Array.from({ length: LOGO_COLS }, () => [' ', null]));
  for (let r = 0; r < 5; r++) {
    const line = [...'CASTAWAY'].map((ch) => LETTERS[ch][r]).join(' ');
    rows.push([...line.padEnd(LOGO_COLS)].map((ch) => [ch, ch === ' ' ? null : (r < 1 ? 'c9' : 'c1')]));
  }
  return rows;
}
const LOGO = buildLogo();

// ---------------------------------------------------------------------------------------------
// The info column. Keys in the accent colour, values in the foreground, neofetch's default order
// (OS, Host, Kernel, Uptime, Packages, Shell, Resolution, DE, WM, Theme, Terminal, CPU, GPU,
// Memory), then the optional ones people switch on (Disk, Song, Local IP), then two of our own.
// ---------------------------------------------------------------------------------------------
const FIELDS = [
  ['OS', 'Castaway (working title) lo-fi'],
  ['Host', '1 island, 1 tall palm, 1 raft'],
  ['Kernel', '1992 (same seed, same video)'],
  ['Uptime', null],
  ['Packages', '90+ (toml), 150+ (wav)'],
  ['Shell', 'coconut, worn by a hermit crab'],
  ['Resolution', '1920x1080 @ 24 fps'],
  ['DE', 'Daytime (always. house rule)'],
  ['WM', 'shore waves, cloud shadows'],
  ['Theme', 'hand-painted coastal [lo-fi]'],
  ['Terminal', 'web/index.html (preview)'],
  ['CPU', 'Castaway (1) @ 80 BPM'],
  ['GPU', 'WebCodecs H.264 (in browser)'],
  ['Memory', '~200 / 600 min (busy)'],
  ['Disk', '0 samples, 0 loops, all code'],
  ['Song', 'F major, ii-V-I-vi, 60 s loop'],
  ['Local IP', '1 bar (top of the palm)'],
  ['Missed', null],
  ['Now', 'idling. nodding to the beat'],
];
const TITLE_USER = 'castaway', TITLE_HOST = 'island';
const INFO_ROWS = 2 + FIELDS.length + 1 + 2;       // title, rule, fields, gap, two swatch rows
const fieldText = (k, v) => `${k}: ${v}`;
for (const [k, v] of FIELDS) if (v && fieldText(k, v).length > 37) throw new Error(`too wide: ${k}: ${v}`);
for (const g of GAGS) {
  if (fieldText('Missed', g.missed).length > 37) throw new Error(`too wide: ${g.missed}`);
  if (fieldText('Uptime', g.uptime).length > 37) throw new Error(`too wide: ${g.uptime}`);
}

// ---------------------------------------------------------------------------------------------
// Layout: a tiling desktop. The fetch terminal is the big window; the live preview, a music
// visualiser and a schedule widget are stacked on the right; the server runs in a strip below.
// ---------------------------------------------------------------------------------------------
const GAP = 10;
const BAR = { x: 10, y: 10, w: W - 20, h: 24 };
const FETCH = { x: 10, y: 44, w: 80 * CW + 28, h: 27 * CH + 24 };
const STRIP = { x: 10, y: FETCH.y + FETCH.h + GAP, w: FETCH.w, h: 2 * CH + 16 };
const RX = FETCH.x + FETCH.w + GAP, RW = W - 10 - RX;
const PREV = { x: RX, y: FETCH.y, w: RW, h: Math.round(RW * 9 / 16) };
const VIS = { x: RX, y: PREV.y + PREV.h + GAP, w: RW, h: 110 };
const SCHED = { x: RX, y: VIS.y + VIS.h + GAP, w: RW, h: STRIP.y + STRIP.h - (VIS.y + VIS.h + GAP) };
if (STRIP.y + STRIP.h + 10 !== H) throw new Error(`H should be ${STRIP.y + STRIP.h + 10}`);
const X0 = FETCH.x + 14, Y0 = FETCH.y + 12;            // terminal text origin
const INFO_COL = LOGO_COLS + 3;
const P0 = 4;                                          // column where typing starts: "~ ❯ "
const PROMPT = [['~', 'c4', 'b'], [' ', 'fg'], ['❯', 'c1', 'b'], [' ', 'fg']];

// ---------------------------------------------------------------------------------------------
// The fetch terminal
// ---------------------------------------------------------------------------------------------
function fetchTerminal() {
  let out = '';
  const rowY = (r) => Y0 + r * CH;
  // top line: the command, always there (after ctrl+L the typed line is redrawn up here)
  out += textLine(X0, rowY(0), [...PROMPT, [CMD, 'fg']]);
  // the logo prints all at once
  const logoVis = visCls([...allCycles(CLEAR), ...allCycles(ENTER)], (t) => !(loc(t) >= CLEAR && loc(t) < ENTER));
  let logo = '';
  LOGO.forEach((row, r) => {
    const parts = [];
    for (const [ch, ink] of row) {
      const k = ink || 'fg';
      if (parts.length && parts[parts.length - 1][1] === k) parts[parts.length - 1][0] += ch;
      else parts.push([ch, k]);
    }
    logo += textLine(X0, rowY(1 + r), parts.map(([str, k]) => [str, k, 'b']));
  });
  out += `<g class="${logoVis}">${logo}</g>`;
  // the info column, a row at a time
  const ix = X0 + INFO_COL * CW;
  const rowCls = (j) => visCls(CARD_BREAKS(j), (t) => !(loc(t) >= CLEAR && loc(t) < rowAt(j)));
  out += textLine(ix, rowY(1), [[TITLE_USER, 'c1', 'b'], ['@', 'fg'], [TITLE_HOST, 'c1', 'b']], rowCls(0));
  out += textLine(ix, rowY(2), [['-'.repeat(TITLE_USER.length + 1 + TITLE_HOST.length), 'fg']], rowCls(1));
  FIELDS.forEach(([k, v], i) => {
    const j = 2 + i;
    const parts = (val) => [[k, 'c1', 'b'], [':', 'fg'], [' ' + val, 'fg']];
    if (v !== null) { out += textLine(ix, rowY(1 + j), parts(v), rowCls(j)); return; }
    GAGS.forEach((g, n) => {
      const val = k === 'Uptime' ? g.uptime : g.missed;
      const cls = visCls(CARD_BREAKS(j), (t) => variantAt(t, j) === n);
      out += textLine(ix, rowY(1 + j), parts(val), cls ?? 'gone');
    });
  });
  // the colour strips: 0-7 and 8-15, three cells wide, one row high
  const j0 = 2 + FIELDS.length + 1;
  for (const half of [0, 1]) {
    let sw = '';
    for (let i = 0; i < 8; i++) {
      const n = half * 8 + i;
      sw += `<rect x="${ix + i * 3 * CW}" y="${rowY(1 + j0 + half)}" width="${3 * CW}" height="${CH}" class="${F(`c${n}`)}"/>`;
    }
    out += `<g class="${rowCls(j0 + half)}">${sw}</g>`;
  }
  // a hairline round the lightest swatch, which is nearly the background
  out += `<rect x="${ix + 7 * 3 * CW + 0.5}" y="${rowY(1 + j0 + 1) + 0.5}" width="${3 * CW - 1}" height="${CH - 1}" fill="none" stroke="#e2d7bf" class="${rowCls(j0 + 1)}"/>`;
  // the next prompt, and what gets typed into it
  out += textLine(X0, rowY(26), PROMPT, visCls([...allCycles(CLEAR), ...allCycles(BACK)], (t) => !(loc(t) >= CLEAR && loc(t) < BACK)));
  [...CMD].forEach((ch, k) => {
    const at = TYPE0 + TYPED[k];
    out += textLine(X0 + (P0 + k) * CW, rowY(26), [[ch, 'fg']], visCls([...allCycles(at), ...allCycles(CLEAR)], (t) => loc(t) >= at && loc(t) < CLEAR));
  });
  // the cursor
  const breaks = [...BLINKS, ...TYPED.flatMap((o) => allCycles(TYPE0 + o)), ...allCycles(TYPE0), ...allCycles(CLEAR), ...allCycles(ENTER), ...allCycles(BACK)];
  const cur = stepAnim(breaks, (t) => {
    const u = loc(t);
    const blink = Math.floor(t / BLINK + 1e-6) % 2 === 0 ? 1 : 0;
    let col = P0, row = 26, on = blink;
    if (u >= TYPE0 && u < CLEAR) { col = P0 + TYPED.filter((o) => TYPE0 + o <= u).length; on = 1; }
    else if (u >= CLEAR && u < ENTER) { col = P0 + CMD.length; row = 0; on = 1; }
    else if (u >= ENTER && u < BACK) on = 0;
    return `transform:translate(${col * CW}px,${row * CH}px);opacity:${on}`;
  });
  out += `<rect x="${X0 + 1}" y="${Y0 + 1}" width="${CW - 1}" height="${CH - 2}" rx="1" class="${F('fg')} ${cur.cls}"/>`;
  return out;
}

// ---------------------------------------------------------------------------------------------
// The server, in a strip under the fetch terminal (the line is the one tools/serve.py prints)
// ---------------------------------------------------------------------------------------------
function serveStrip() {
  const x = STRIP.x + 14, y = STRIP.y + 8;
  const url = 'http://127.0.0.1:8765/';
  const lead = 'Castaway web renderer: ';
  let out = textLine(x, y, [...PROMPT, ['python tools/serve.py', 'fg']]);
  out += textLine(x, y + CH, [[lead, 'fg'], [url, 'c4']]);
  const ux = x + lead.length * CW + 1.5, uw = url.length * CW - 3;
  out += `<path d="M${ux} ${y + CH + 16.2}h${uw}" class="${S('c4')}" stroke-width="0.9"/>`;
  return out;
}

// ---------------------------------------------------------------------------------------------
// Shapes for the drawn parts
// ---------------------------------------------------------------------------------------------
// A tapered leaf along a quadratic curve, as a closed path
function leafPath(p0, p1, p2, wmax, n = 18) {
  const pt = (t) => [(1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0], (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1]];
  const L = [], R = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, [x, y] = pt(t), [x2, y2] = pt(Math.min(1, t + 0.01)), [x1, y1] = pt(Math.max(0, t - 0.01));
    const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
    const w = wmax * Math.sin(Math.PI * Math.min(1, 0.08 + t * 0.92)) ** 0.8 / 2;
    L.push([x - dy / len * w, y + dx / len * w]); R.push([x + dy / len * w, y - dx / len * w]);
  }
  const pts = [...L, ...R.reverse()];
  return 'M' + pts.map(([x, y]) => `${f1(x)} ${f1(y)}`).join('L') + 'Z';
}
const SKIN = '#f1c6a1', HAIR = '#6b4a33', HEADPHONE = '#f6eedc', TOP = '#ec7462', SHORTS = '#efe2c4';

// ---------------------------------------------------------------------------------------------
// The live preview: the island, her, and the four gags (one per rerun)
// ---------------------------------------------------------------------------------------------
function preview() {
  const { w, h } = PREV;
  const HZ = 104;                                          // horizon
  let o = '';
  o += `<rect width="${w}" height="${HZ + 1}" fill="url(#psky)"/>`;
  o += `<circle cx="${w - 46}" cy="34" r="34" fill="url(#pglow)"/><circle cx="${w - 46}" cy="34" r="13" fill="#fff6cf"/>`;
  // clouds drift right; the jump at the end of each lap is off-screen
  const cloud = (s) => `<path d="M0 ${10 * s}h${46 * s}a${7 * s} ${7 * s} 0 0 0-${9 * s}-${9 * s}a${10 * s} ${10 * s} 0 0 0-${19 * s}-${3 * s}a${8 * s} ${8 * s} 0 0 0-${15 * s} ${4 * s}a${6 * s} ${6 * s} 0 0 0-${3 * s} ${8 * s}z" fill="#fff" opacity=".92"/>`;
  const drift = smoothAnim([[0, 'transform:translateX(-80px)'], [T, `transform:translateX(${w + 20}px)`]]);
  o += `<g transform="translate(0 22)"><g class="${drift}" style="animation-delay:-8s">${cloud(1)}</g></g>`;
  o += `<g transform="translate(0 50)"><g class="${drift}" style="animation-delay:-26s">${cloud(0.7)}</g></g>`;
  o += `<rect y="${HZ}" width="${w}" height="${h - HZ}" fill="url(#psea)"/>`;
  o += `<path d="M0 ${HZ + 0.5}H${w}" stroke="#d8f3fb" stroke-width="1" opacity=".8"/>`;
  // sparkles on the water, on the beat
  const sparkA = smoothAnim([[0, 'opacity:.9'], [0.375, 'opacity:.15'], [0.75, 'opacity:.9']], { dur: 0.75, ease: 'step-end' });
  const sparkB = smoothAnim([[0, 'opacity:.15'], [0.375, 'opacity:.9'], [0.75, 'opacity:.15']], { dur: 0.75, ease: 'step-end' });
  let sa = '', sb = '';
  for (let i = 0; i < 14; i++) {
    const x = 8 + rnd() * (w - 16), y = HZ + 6 + rnd() * (h - HZ - 12), l = 4 + rnd() * 7;
    if (x > 50 && x < 290 && y > 146) continue;
    if (i % 2) sa += `M${f1(x)} ${f1(y)}h${f1(l)}`; else sb += `M${f1(x)} ${f1(y)}h${f1(l)}`;
  }
  o += `<path d="${sa}" stroke="#effbff" stroke-width="1.4" stroke-linecap="round" class="${sparkA}"/><path d="${sb}" stroke="#effbff" stroke-width="1.4" stroke-linecap="round" class="${sparkB}"/>`;
  // a far sail, keeping its distance
  o += `<path d="M58 ${HZ - 1}l5-11v11zM64 ${HZ - 1}l4-7v7z" fill="#fffaf0" opacity=".9"/><path d="M56 ${HZ}h14" stroke="#7c8c96" stroke-width="1.2"/>`;
  // the shark, far out (gag 1)
  o += sharkGag(HZ);
  // island
  const IX = 168, IY = 168;
  const foam = smoothAnim([[0, 'transform:scale(1)'], [1.5, 'transform:scale(1.035)'], [3, 'transform:scale(1)']], { dur: 3, ease: 'ease-in-out' });
  o += `<ellipse cx="${IX}" cy="${IY + 2}" rx="119" ry="23" fill="#e8f8fb" opacity=".75" class="${foam}" style="transform-box:fill-box;transform-origin:50% 50%"/>`;
  o += `<ellipse cx="${IX}" cy="${IY}" rx="110" ry="20" fill="#e9cf98"/><ellipse cx="${IX - 4}" cy="${IY - 4}" rx="96" ry="14" fill="#f4e2b6"/>`;
  // the raft, beached at the left
  let raft = `<path d="M3 9L37 9L33 16L-1 16Z" fill="#8b5e37"/><path d="M5 2L39 2L37 9L3 9Z" fill="#c08d51"/>`;
  for (let i = 1; i < 6; i++) raft += `<path d="M${5 + i * 5.7} 2L${3 + i * 5.7} 9" stroke="#8b5e37" stroke-width="0.9"/>`;
  raft += `<path d="M9 2.4L7 8.6M31 2.4L29 8.6" stroke="#f0dfb8" stroke-width="1.1"/>`;
  o += `<g transform="translate(26 158)"><ellipse cx="18" cy="16" rx="24" ry="3.4" fill="#e8f8fb" opacity=".7"/>${raft}</g>`;
  // palm: trunk, then back leaves, coconuts, front leaves
  const C = [164, 74];
  o += `<path d="M138 ${IY - 2}Q130 120 ${C[0] - 2} ${C[1] + 4}" stroke="#8b5e37" stroke-width="7.5" fill="none" stroke-linecap="round"/>`;
  o += `<path d="M138 ${IY - 2}Q130 120 ${C[0] - 2} ${C[1] + 4}" stroke="#b07a46" stroke-width="3" fill="none" stroke-dasharray="1.6 5.4" stroke-linecap="round"/>`;
  const back = [[[150, 46], [130, 40], 10], [[180, 44], [204, 46], 10], [[140, 76], [114, 112], 11], [[188, 78], [206, 112], 11]];
  const front = [[[128, 54], [94, 94], 14], [[198, 54], [230, 90], 14], [[160, 50], [150, 34], 9]];
  o += back.map(([c, t, wd]) => `<path d="${leafPath(C, c, t, wd)}" fill="#3e7f31"/>`).join('');
  o += `<g fill="#7a5230"><circle cx="${C[0] - 5}" cy="${C[1] + 5}" r="4"/><circle cx="${C[0] + 3}" cy="${C[1] + 6}" r="4"/><circle cx="${C[0] - 1}" cy="${C[1] + 9}" r="3.8"/></g>`;
  o += front.map(([c, t, wd]) => `<path d="${leafPath(C, c, t, wd)}" fill="#54a23f"/>`).join('');
  o += front.map(([c, t]) => `<path d="M${C[0]} ${C[1]}Q${c[0]} ${c[1]} ${t[0]} ${t[1]}" stroke="#3e7f31" stroke-width=".9" fill="none"/>`).join('');
  // her, sitting in the shade, facing the sea, nodding on every beat
  o += her(198, IY - 3);
  // the other gags
  o += turtleGag(IY);
  o += droneGag();
  o += crabGag(C, IY);
  // the overlay label
  o += `<rect x="8" y="8" width="${15 * CW + 16}" height="20" rx="10" fill="#fffaf0" opacity=".88"/>`;
  o += `<circle cx="18" cy="18" r="3.2" class="${F('c1')}"/>`;
  o += textLine(24, 9, [['127.0.0.1:8765', 'fg']]);
  return o;
}

function her(x, y) {
  const nod = smoothAnim([[0, 'transform:rotate(0deg)'], [0.22, 'transform:rotate(9deg)'], [0.5, 'transform:rotate(0deg)'], [0.75, 'transform:rotate(0deg)']], { dur: BEAT, ease: 'ease-in-out' });
  let o = `<g transform="translate(${x} ${y}) scale(1.25)">`;
  o += `<path d="M3 -3L10 -9.5L13 -1" stroke="${SKIN}" stroke-width="2.7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  o += `<path d="M13 -1L16.2 -0.6" stroke="${SKIN}" stroke-width="2.1" stroke-linecap="round"/>`;
  o += `<path d="M-4.2 0L-3.8 -7.2L4 -7.6L9.2 -10L10.8 -7.2L4.4 -2.4L4.2 0Z" fill="${SHORTS}" stroke="#d2bd92" stroke-width=".5"/>`;
  o += `<path d="M-3.9 -6.6Q-4.8 -13 -2.8 -17.2L2.8 -17.6Q4.4 -13 4.1 -7Z" fill="${TOP}"/>`;
  o += `<path d="M2 -15.6Q4.6 -11.2 9.6 -10" stroke="${SKIN}" stroke-width="2.1" fill="none" stroke-linecap="round"/>`;
  o += `<path d="M0.2 -17L0.6 -19.2" stroke="${SKIN}" stroke-width="2.6" stroke-linecap="round"/>`;
  o += `<g transform="translate(0.6 -19.2)"><g class="${nod}" style="transform-box:fill-box;transform-origin:52% 96%">`;
  o += `<circle cx="0.8" cy="-4" r="4" fill="${SKIN}"/>`;
  o += `<path d="M-3.4 -2.6Q-4.2 -8.8 1 -8.5Q4.6 -8.3 4.9 -5.1Q2 -6.5 -0.6 -5.7Q-1.6 -3.6 -1.3 -0.8Z" fill="${HAIR}"/>`;
  o += `<circle cx="-3.5" cy="-1.4" r="2.2" fill="${HAIR}"/>`;
  o += `<path d="M-2.4 -6.4Q0.4 -10.8 4.1 -6.6" stroke="${HEADPHONE}" stroke-width="1.3" fill="none"/>`;
  o += `<ellipse cx="-0.1" cy="-3.6" rx="1.7" ry="2.2" fill="${HEADPHONE}" stroke="#cdbf9f" stroke-width=".5"/>`;
  o += `<circle cx="3.4" cy="-4.3" r=".55" fill="#3a2a20"/>`;
  o += `</g></g></g>`;
  return o;
}

// Keyframes for a sprite that is only around for part of the loop: frames [[t, x, y, extra]]
function spriteMove(frames) {
  const kf = [];
  const first = frames[0], last = frames[frames.length - 1];
  if (first[0] > 0) kf.push([0, `transform:translate(${first[1]}px,${first[2]}px);opacity:0`], [first[0] - 0.01, `transform:translate(${first[1]}px,${first[2]}px);opacity:0`]);
  for (const [t, x, y] of frames) kf.push([t, `transform:translate(${f1(x)}px,${f1(y)}px);opacity:1`]);
  kf.push([last[0] + 0.01, `transform:translate(${last[1]}px,${last[2]}px);opacity:0`]);
  if (last[0] + 0.01 < T) kf.push([T, `transform:translate(${last[1]}px,${last[2]}px);opacity:0`]);
  return smoothAnim(kf, { base: `transform:translate(${first[1]}px,${first[2]}px);opacity:0` });
}
const paddle = () => smoothAnim([[0, 'transform:rotate(-22deg)'], [0.375, 'transform:rotate(18deg)'], [0.75, 'transform:rotate(-22deg)']], { dur: BEAT, ease: 'ease-in-out' });

function turtleGag(IY) {
  // cycle 0: swims in from the right, says hello at the shore, turns, swims off
  const y = IY + 13;
  const mv = spriteMove([[0.4, PREV.w + 20, y], [2.6, 286, y], [3.9, 286, y], [6.3, PREV.w + 24, y + 2]]);
  const turn = smoothAnim([[0, 'transform:scaleX(1)'], [3.9, 'transform:scaleX(-1)'], [6.5, 'transform:scaleX(1)']], { ease: 'step-end' });
  const pd = paddle();
  const hello = smoothAnim([[0, 'transform:translateY(0)'], [2.9, 'transform:translateY(-2px)'], [3.2, 'transform:translateY(0)'], [3.5, 'transform:translateY(-2px)'], [3.8, 'transform:translateY(0)']], { ease: 'step-end' });
  let o = `<g class="${mv}"><g class="${turn}" style="transform-box:fill-box;transform-origin:50% 50%">`;
  o += `<g class="${pd}" style="transform-box:fill-box;transform-origin:80% 20%"><ellipse cx="-6" cy="4" rx="4.4" ry="1.6" fill="#6aa45a"/></g>`;
  o += `<ellipse cx="6.5" cy="3.6" rx="3.4" ry="1.4" fill="#6aa45a"/>`;
  o += `<ellipse cx="0" cy="0" rx="9.5" ry="5.4" fill="#4b8a46"/><ellipse cx="0" cy="-0.4" rx="6.3" ry="3.4" fill="#5c9c50"/>`;
  o += `<path d="M-6 -0.4h12M0 -3.8v6.8" stroke="#3f7a3b" stroke-width=".8"/>`;
  o += `<g class="${hello}"><circle cx="-11" cy="-0.8" r="3.2" fill="#7cb26a"/><circle cx="-12.2" cy="-1.6" r=".6" fill="#23331f"/></g>`;
  o += `</g></g>`;
  return o;
}

function sharkGag(HZ) {
  // cycle 1: a fin in headphones crosses the far water, nodding on the beat
  const y = HZ + 20;
  const mv = spriteMove([[9.4, -24, y], [15.6, PREV.w + 24, y]]);
  const bob = smoothAnim([[0, 'transform:translateY(0)'], [0.25, 'transform:translateY(-2px)'], [0.75, 'transform:translateY(0)']], { dur: BEAT, ease: 'ease-in-out' });
  let o = `<g class="${mv}"><path d="M-10 1.5h24" stroke="#e9f8fc" stroke-width="1.6" stroke-linecap="round" opacity=".85"/><g class="${bob}">`;
  o += `<path d="M0 0L5.4 -12.6Q7.6 -13.4 10.4 0Z" fill="#5f7480"/>`;
  o += `<path d="M1.6 -6.6Q5.6 -18.6 10.8 -5.2" stroke="${HEADPHONE}" stroke-width="1.5" fill="none"/>`;
  o += `<circle cx="1.6" cy="-6" r="2.2" class="${F('c1')}"/><circle cx="10.6" cy="-4.8" r="2.2" class="${F('c1')}"/>`;
  o += `</g></g>`;
  return o;
}

function parcel() {
  return `<rect x="-4.6" y="0" width="9.2" height="7.6" rx="0.8" fill="#c99a5b"/><path d="M0 0v7.6M-4.6 3.2h9.2" stroke="#f3e6c8" stroke-width="1.1"/>`;
}
function droneGag() {
  // cycle 2: a drone delivers a parcel (more headphones) beside her and leaves
  const mv = spriteMove([[18.4, PREV.w + 30, 18], [20.2, 232, 112], [20.8, 232, 136], [21.1, 232, 136], [21.7, 236, 108], [23.6, -40, 14]]);
  const carried = smoothAnim([[0, 'opacity:1'], [20.95, 'opacity:0'], [T, 'opacity:0']], { ease: 'step-end', base: 'opacity:1' });
  const rotor = smoothAnim([[0, 'opacity:.75'], [0.1, 'opacity:.35'], [0.2, 'opacity:.75']], { dur: 0.2, ease: 'step-end' });
  let o = `<g class="${mv}">`;
  o += `<g class="${carried}"><path d="M0 2.4v3" stroke="#3d4a52" stroke-width=".8"/><g transform="translate(0 5.4)">${parcel()}</g></g>`;
  o += `<path d="M-9 -3.2h18" stroke="#3d4a52" stroke-width="1.4"/><rect x="-5.5" y="-2.6" width="11" height="5" rx="2" fill="#3d4a52"/><circle cx="0" cy="-0.2" r="1.1" class="${F('c1')}"/>`;
  o += `<g class="${rotor}"><ellipse cx="-9" cy="-4.4" rx="5" ry="1.1" fill="#3d4a52"/><ellipse cx="9" cy="-4.4" rx="5" ry="1.1" fill="#3d4a52"/></g>`;
  o += `</g>`;
  // the parcel stays on the sand until a wave takes it, during the next cycle (box_washed_away)
  const box = spriteMove([[20.95, 232, 141.4], [21.2, 232, 156], [28.2, 232, 156], [29.4, 262, 176], [33.6, PREV.w + 16, 178]]);
  o += `<g class="${box}">${parcel()}</g>`;
  return o;
}

function crabGag(C, IY) {
  // cycle 3: a crab scuttles under the palm; a coconut lands on it; the coconut walks off
  const y = IY + 4, X = C[0] - 2;
  const legs = smoothAnim([[0, 'transform:translateY(0)'], [0.12, 'transform:translateY(-1px)'], [0.25, 'transform:translateY(0)']], { dur: 0.25, ease: 'step-end' });
  const crabLegs = (cls) => `<g class="${cls}" stroke="#c4432f" stroke-width="1.1" stroke-linecap="round"><path d="M-3 1.2l-3.4 2.6M-1 2l-2 2.8M1 2l2 2.8M3 1.2l3.4 2.6"/></g>`;
  const crab = spriteMove([[27.3, -16, y], [29.4, X, y], [29.95, X, y]]);
  let o = `<g class="${crab}">${crabLegs(legs)}<ellipse cx="0" cy="0" rx="4.8" ry="3" fill="#e2553f"/>`;
  o += `<path d="M-4 -1.6l-3 -3.2M4 -1.6l3 -3.2" stroke="#e2553f" stroke-width="1.4"/><circle cx="-7.2" cy="-5.2" r="1.9" fill="#e2553f"/><circle cx="7.2" cy="-5.2" r="1.9" fill="#e2553f"/>`;
  o += `<path d="M-1.4 -2.6v-2M1.4 -2.6v-2" stroke="#c4432f" stroke-width=".8"/><circle cx="-1.4" cy="-4.8" r=".8" fill="#2b2b2b"/><circle cx="1.4" cy="-4.8" r=".8" fill="#2b2b2b"/></g>`;
  // the coconut falls (accelerating), and lands on the crab
  const fall = smoothAnim([
    [0, `transform:translate(${C[0] - 1}px,${C[1] + 9}px);opacity:0`], [29.55, `transform:translate(${C[0] - 1}px,${C[1] + 9}px);opacity:0`],
    [29.6, `transform:translate(${C[0] - 1}px,${C[1] + 9}px);opacity:1`], [29.75, `transform:translate(${X}px,${f1(C[1] + 9 + (y - 4 - C[1] - 9) * 0.3)}px);opacity:1`],
    [29.95, `transform:translate(${X}px,${y - 4}px);opacity:1`], [29.97, `transform:translate(${X}px,${y - 4}px);opacity:0`], [T, `transform:translate(${X}px,${y - 4}px);opacity:0`],
  ], { base: 'opacity:0' });
  o += `<g class="${fall}"><circle r="4.4" fill="#7a5230"/><circle cx="-1.4" cy="-1.4" r="1.1" fill="#9a6d43"/></g>`;
  // bonk
  const stars = smoothAnim([[0, 'opacity:0'], [29.95, 'opacity:1'], [30.7, 'opacity:0']], { ease: 'step-end', base: 'opacity:0' });
  const star = (sx, sy, s) => `<path d="M${sx} ${sy - 3 * s}l${s} ${2 * s} ${2 * s} ${s} -${2 * s} ${s} -${s} ${2 * s} -${s} -${2 * s} -${2 * s} -${s} ${2 * s} -${s}z" class="${F('c11')}"/>`;
  o += `<g class="${stars}">${star(X - 7, y - 14, 1.3)}${star(X + 7, y - 16, 1)}</g>`;
  // the coconut, now with legs, walks off
  const walker = spriteMove([[29.96, X, y - 1], [30.7, X, y - 1], [33.5, -20, y + 1]]);
  o += `<g class="${walker}">${crabLegs(legs)}<circle cy="-3.4" r="4.4" fill="#7a5230"/><circle cx="-1.4" cy="-4.8" r="1.1" fill="#9a6d43"/></g>`;
  return o;
}

// ---------------------------------------------------------------------------------------------
// The visualiser: the theme at 80 BPM, eighth notes, one bar (3 s) repeated
// ---------------------------------------------------------------------------------------------
function visualiser() {
  const x0 = VIS.x + 14, base = VIS.y + VIS.h - 12, maxH = 66;
  const n = 30, step = (VIS.w - 28) / n, bw = step - 3;
  const ramp = ['c4', 'c4', 'c6', 'c6', 'c2', 'c10', 'c11', 'c11', 'c9', 'c1'];
  let o = textLine(VIS.x + 12, VIS.y + 6, [['♪', 'c1', 'b'], [' theme', 'fg'], ['  F major  80 BPM  synth', 'dim']]);
  for (let i = 0; i < n; i++) {
    const hs = [];
    for (let s = 0; s < 8; s++) {
      let v = 0.14 + 0.32 * Math.exp(-i / 11);
      if (s === 0 || s === 4) v += 0.55 * Math.exp(-i / 5);
      if (s === 2 || s === 6) v += 0.38 * Math.exp(-(((i - 13) / 5) ** 2));
      v += 0.16 * (i / n) * (s % 2 ? 0.55 : 1);
      v += 0.22 * Math.exp(-(((i - 19) / 6) ** 2)) * rnd();
      hs.push(Math.max(0.07, Math.min(1, v)));
    }
    const kf = [];
    hs.forEach((v, s) => { kf.push([s * 0.375, `transform:scaleY(${f2(v)})`]); kf.push([s * 0.375 + 0.25, `transform:scaleY(${f2(v * 0.62)})`]); });
    kf.push([3, `transform:scaleY(${f2(hs[0])})`]);
    const cls = smoothAnim(kf, { dur: 3, base: `transform:scaleY(${f2(hs[3])})` });
    const k = ramp[Math.floor(i / n * ramp.length)];
    o += `<rect x="${f1(x0 + i * step)}" y="${base - maxH}" width="${f1(bw)}" height="${maxH}" rx="1.5" class="${F(k)} ${cls}" style="transform-box:fill-box;transform-origin:50% 100%"/>`;
  }
  o += `<path d="M${x0} ${base + 0.5}H${VIS.x + VIS.w - 14}" stroke="#d9cdb2" stroke-width="1"/>`;
  return o;
}

// ---------------------------------------------------------------------------------------------
// The schedule widget: four timers over ten hours (ticks drawn at the real intervals and median
// counts with this file's PRNG; the playhead follows the uptime of each rerun)
// ---------------------------------------------------------------------------------------------
const TIERS = [
  ['regular', '2-5 min', 155, 'c4', [2, 5]],
  ['occasional', '12-25 min', 30, 'c6', [12, 25]],
  ['rare', '30-60 min', 13, 'c5', [30, 60]],
  ['super rare', '3-6 h', 2, 'c1', [180, 360]],
];
function scheduleWidget() {
  const x = SCHED.x + 12, sw = SCHED.w - 24;
  let y = SCHED.y + 8;
  let o = textLine(x, y, [['schedule', 'c1', 'b'], [' 10:00:00, typical', 'dim']]);
  y += CH + 8;
  const strips = [];
  for (const [name, every, med, k, [a, b]] of TIERS) {
    o += textLine(x, y, [[name.padEnd(11), 'fg'], ['every ' + every, 'dim']]);
    o += textLine(x + sw - 4 * CW, y, [[('~' + med).padStart(4), k, 'b']]);
    y += CH + 2;
    strips.push(y);
    const gaps = Array.from({ length: med + 1 }, () => a + rnd() * (b - a));
    const total = gaps.reduce((s, g) => s + g, 0);
    let acc = 0, d = '';
    for (let i = 0; i < med; i++) { acc += gaps[i]; d += `M${f1(x + acc / total * sw)} ${y}v12`; }
    o += `<rect x="${x}" y="${y}" width="${sw}" height="12" rx="2" fill="#fffaf0" opacity=".7"/>`;
    o += `<path d="${d}" class="${S(k)}" stroke-width="${med > 100 ? 1 : 1.6}"/>`;
    y += 12 + 9;
  }
  // the playhead: where each rerun's uptime sits in the 10 hours
  const jUp = 2 + FIELDS.findIndex(([k2]) => k2 === 'Uptime');
  GAGS.forEach((g, n) => {
    const px = f1(x + g.min / 600 * sw);
    const cls = visCls(CARD_BREAKS(jUp), (t) => variantAt(t, jUp) === n);
    const marks = strips.map((sy) => `M${px} ${sy - 2.5}v17`).join('');
    o += `<path d="${marks}" class="${S('fg')} ${cls ?? 'gone'}" stroke-width="2" stroke-linecap="round"/>`;
  });
  o += textLine(x, y, [['busy ~1/3, idle the rest', 'dim']]);
  o += textLine(x, y + CH, [['+ chained follow-ups', 'dim']]);
  return o;
}

// ---------------------------------------------------------------------------------------------
// The top bar
// ---------------------------------------------------------------------------------------------
function topBar() {
  const cy = BAR.y + BAR.h / 2, ty = BAR.y + 3;
  let o = `<rect x="${BAR.x}" y="${BAR.y}" width="${BAR.w}" height="${BAR.h}" rx="12" fill="#fffaf0" opacity=".9"/>`;
  // a tiny emblem: the sun behind a palm
  const ex = BAR.x + 18;
  o += `<circle cx="${ex + 3}" cy="${cy - 1}" r="7" class="${F('c11')}"/>`;
  o += `<path d="M${ex - 2} ${cy + 8}Q${ex - 3} ${cy + 2} ${ex} ${cy - 3}" stroke="#8b5e37" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
  o += `<path d="${leafPath([ex, cy - 3], [ex - 5, cy - 8], [ex - 9, cy - 2], 3.4)}${leafPath([ex, cy - 3], [ex + 5, cy - 8], [ex + 9, cy - 1], 3.4)}${leafPath([ex, cy - 3], [ex - 1, cy - 9], [ex - 5, cy - 9.5], 2.6)}" class="${F('c2')}"/>`;
  // workspaces
  let wx = BAR.x + 38;
  for (let i = 1; i <= 5; i++) {
    if (i === 1) o += `<rect x="${wx}" y="${BAR.y + 3}" width="22" height="18" rx="9" class="${F('c1')}"/>`;
    o += textLine(wx + 6.5, ty, [[String(i), i === 1 ? 'cream' : 'dim', i === 1 ? 'b' : '']]);
    wx += 24;
  }
  o += textLine(wx + 8, ty, [['islandfetch', 'dim']]);
  // the name, in the middle
  const name = 'c a s t a w a y';
  o += textLine(W / 2 - name.length * CW / 2, ty, [[name, 'c1', 'b']]);
  // right: signal (one bar), headphones, daylight
  let rx = BAR.x + BAR.w - 14;
  const right = (str) => { rx -= str.length * CW; o += textLine(rx, ty, [[str, 'fg']]); };
  right('day'); rx -= 18;
  o += `<circle cx="${rx + 7}" cy="${cy}" r="3.4" class="${F('c11')}"/><path d="M${rx + 7} ${cy - 7.5}v2M${rx + 7} ${cy + 5.5}v2M${rx - 0.5} ${cy}h2M${rx + 12.5} ${cy}h2M${rx + 1.8} ${cy - 5.2}l1.4 1.4M${rx + 10.8} ${cy + 3.8}l1.4 1.4M${rx + 1.8} ${cy + 5.2}l1.4 -1.4M${rx + 10.8} ${cy - 3.8}l1.4 -1.4" class="${S('c11')}" stroke-width="1.3" stroke-linecap="round"/>`;
  rx -= 16;
  right('100%'); rx -= 18;
  o += `<path d="M${rx + 1.5} ${cy + 3}v-3a5.5 5.5 0 0 1 11 0v3" stroke="${FG}" stroke-width="1.4" fill="none"/><rect x="${rx}" y="${cy + 1}" width="3.4" height="5.4" rx="1.2" class="${F('fg')}"/><rect x="${rx + 10.6}" y="${cy + 1}" width="3.4" height="5.4" rx="1.2" class="${F('fg')}"/>`;
  rx -= 16;
  right('1 bar'); rx -= 22;
  for (let i = 0; i < 4; i++) o += `<rect x="${rx + i * 4.6}" y="${cy + 5 - (i + 1) * 2.8}" width="3" height="${(i + 1) * 2.8}" rx=".8" fill="${i === 0 ? FG : '#cfc6b2'}"/>`;
  return o;
}

// ---------------------------------------------------------------------------------------------
// Assemble
// ---------------------------------------------------------------------------------------------
function windowFrame(r, { active = false, fill = TERM_BG, opacity = 1 } = {}) {
  const sh = [3, 6, 10].map((g, i) => `<rect x="${r.x - g / 2}" y="${r.y + 2 + g / 3}" width="${r.w + g}" height="${r.h + g / 2}" rx="${12 + g / 2}" fill="#16384a" opacity="${[0.09, 0.06, 0.035][i]}"/>`).join('');
  return sh + `<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" rx="10" fill="${fill}"${opacity < 1 ? ` fill-opacity="${opacity}"` : ''} stroke="${active ? ANSI[1] : '#e3d5b8'}" stroke-width="${active ? 2 : 1.5}"/>`;
}

function buildSvg() {
  const parts = [];
  // wallpaper: a noon sky over the sea
  parts.push(`<rect width="${W}" height="${H}" fill="url(#sky)"/>`);
  parts.push(`<circle cx="${W - 150}" cy="120" r="170" fill="url(#glow)"/>`);
  parts.push(`<rect y="468" width="${W}" height="${H - 468}" fill="url(#sea)"/>`);
  parts.push(`<path d="M0 468.5H${W}" stroke="#e6f6fb" stroke-width="1.2" opacity=".8"/>`);
  parts.push(topBar());
  parts.push(windowFrame(FETCH, { active: true }));
  parts.push(windowFrame(STRIP));
  parts.push(windowFrame(PREV, { fill: '#9fd8ef' }));
  parts.push(windowFrame(VIS));
  parts.push(windowFrame(SCHED, { opacity: 0.88 }));
  parts.push(fetchTerminal(), serveStrip(), visualiser(), scheduleWidget());
  parts.push(`<g clip-path="url(#pclip)"><g transform="translate(${PREV.x} ${PREV.y})">${preview()}</g></g>`);
  parts.push(`<rect x="${PREV.x}" y="${PREV.y}" width="${PREV.w}" height="${PREV.h}" rx="10" fill="none" stroke="#e3d5b8" stroke-width="1.5"/>`);

  const glyphDefs = [...glyphIds].map(([ch, id]) => `<path id="${id}" d="${GLYPHS[ch]}" transform="translate(1.5 4)"/>`).join('');
  const colourCss = PK.map((k, i) => `.s${i}{stroke:${PAL[k]}}.f${i}{fill:${PAL[k]}}`).join('');
  const style = [
    `.t{fill:none;stroke-width:1.45;stroke-linecap:round;stroke-linejoin:round}`,
    `.t .b{stroke-width:1.95}`,
    `.gone{opacity:0}`,
    colourCss,
    ...css,
    `@media (prefers-reduced-motion:reduce){*{animation:none!important}}`,
  ].join('\n');
  const defs = `<defs>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6cbde8"/><stop offset=".55" stop-color="#b8e2f4"/><stop offset=".74" stop-color="#f3efdc"/></linearGradient>
<radialGradient id="glow"><stop offset="0" stop-color="#fffbe6" stop-opacity=".95"/><stop offset=".35" stop-color="#fff6d2" stop-opacity=".55"/><stop offset="1" stop-color="#fff6d2" stop-opacity="0"/></radialGradient>
<linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4fb8da"/><stop offset="1" stop-color="#1f7fb0"/></linearGradient>
<linearGradient id="psky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7cc8ee"/><stop offset="1" stop-color="#d6f1fa"/></linearGradient>
<radialGradient id="pglow"><stop offset=".3" stop-color="#fff6cf" stop-opacity=".7"/><stop offset="1" stop-color="#fff6cf" stop-opacity="0"/></radialGradient>
<linearGradient id="psea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4dbbdd"/><stop offset="1" stop-color="#1f86b6"/></linearGradient>
<clipPath id="pclip"><rect x="${PREV.x}" y="${PREV.y}" width="${PREV.w}" height="${PREV.h}" rx="10"/></clipPath>
<clipPath id="panel"><rect width="${W}" height="${H}" rx="16"/></clipPath>
${glyphDefs}
</defs>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="ttl">
<title id="ttl">Castaway: islandfetch, a system-info card for a lo-fi island, on a sunny desktop</title>
<style>
${style}
</style>
${defs}
<g clip-path="url(#panel)">
${parts.join('\n')}
</g>
</svg>
`;
}

const svg = buildSvg();
fs.mkdirSync(path.dirname(OUT_SVG), { recursive: true });
fs.writeFileSync(OUT_SVG, svg);
console.log(`wrote ${path.relative(process.cwd(), OUT_SVG)} (${(svg.length / 1024).toFixed(1)} KB)`);

// ---------------------------------------------------------------------------------------------
// The header markdown. The text card is the picture's card at 0:00, monochrome, 80 columns,
// with the colour strips as shade blocks picked by each colour's lightness.
// ---------------------------------------------------------------------------------------------
function textCard() {
  const lum = (hex) => {
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  // four shades by lightness rank: the darkest four colours are full blocks, the lightest four light shade
  const rank = ANSI.map((c, i) => [lum(c), i]).sort((a, b) => a[0] - b[0]).map(([, i]) => i);
  const shadeOf = (hex) => '█▓▒░'[Math.floor(rank.indexOf(ANSI.indexOf(hex)) / 4)];
  const t0 = 0.001;
  const info = [`${TITLE_USER}@${TITLE_HOST}`, '-'.repeat(TITLE_USER.length + 1 + TITLE_HOST.length)];
  for (const [k, v] of FIELDS) {
    const val = v ?? (k === 'Uptime' ? GAGS[variantAt(t0, 2 + FIELDS.findIndex(([k2]) => k2 === k))].uptime : GAGS[variantAt(t0, 2 + FIELDS.findIndex(([k2]) => k2 === k))].missed);
    info.push(fieldText(k, val));
  }
  info.push('');
  for (const half of [0, 1]) info.push(ANSI.slice(half * 8, half * 8 + 8).map((c) => shadeOf(c).repeat(3)).join(''));
  const lines = ['~ $ islandfetch --mono'];
  const n = Math.max(LOGO.length, info.length);
  for (let r = 0; r < n; r++) {
    const logo = (LOGO[r] || []).map(([ch]) => ch).join('').padEnd(LOGO_COLS);
    lines.push((logo + '   ' + (info[r] || '')).trimEnd());
  }
  lines.push('', '~ $');
  for (const l of lines) if ([...l].length > 80) throw new Error(`text card too wide: ${l}`);
  return lines.join('\n');
}

const ALT = 'Castaway, as a screenshot of a sunny desktop. In a cream-coloured terminal the command islandfetch prints a system-info card: on the left, an ASCII emblem of a palm tree, the sun, a sandy island, a raft and the sea, above the word CASTAWAY in capitals built from letters; on the right, castaway@island over a hyphen rule and a column of fields, among them OS: Castaway (working title) lo-fi, Kernel: 1992 (same seed, same video), CPU: Castaway (1) @ 80 BPM, Disk: 0 samples, 0 loops, all code, Missed: a crab, wearing a coconut, and Now: idling. nodding to the beat, then two strips of colour swatches. Every nine seconds the card is run again; only Uptime and Missed ever change. Beside it, a live preview at 127.0.0.1:8765 shows a young woman in cream headphones, a coral tank top and cream shorts sitting under the palm and nodding to the beat, while a sea turtle visits, a shark in headphones glides past, a drone drops off a parcel, and a coconut lands on a crab and walks away with it. Below the preview, a music visualiser for the theme (F major, 80 BPM), a schedule widget with four timers across ten hours, and under the card, a terminal running python tools/serve.py.';

const MD = `<!-- Header ${SLUG} for Castaway. Generated by src/${SLUG}.mjs: edit that, not this. -->

<p align="center">
  <img src="assets/${SLUG}.svg" width="100%" alt="${ALT}">
</p>

<h1 align="center">Castaway</h1>

<p align="center">
  <b>Ten hours on one tiny island. Status: idling.</b><br>
  <sub>A lo-fi island video in the spirit of <i>Johnny Castaway</i>, the 1992 desert-island screensaver. Unofficial, and not affiliated with it or its owners.</sub>
</p>

**Castaway** (working title) is a stationary-frame lo-fi video for YouTube, in the spirit of the 10-hour lofi streams: a young woman alone on a tiny island with one tall palm, a raft and a lot of time. She sits in the shade with her headphones on, nodding to the beat. Every so often, something happens. You will probably miss it.

Up there, somebody keeps running \`islandfetch\` to check on her. **Now: idling**, every single time. Meanwhile, in the preview in the corner, a sea turtle drops by, a shark in headphones nods past, a drone delivers more headphones and a coconut lands on a crab, which leaves wearing it, and each rerun reports the one you just missed. More than 90 activities wait on four timers, from every 2 to 5 minutes to every 3 to 6 hours, and each one starts on the next bar of the music, so the gags land on the beat. Every sound is synthesized from code: no samples, no loops, no recordings.

\`\`\`sh
python tools/serve.py       # then open http://127.0.0.1:8765/
python tools/schedule.py    # check the schedule, simulate a 10-hour run
\`\`\`

<p align="center">
  <a href="tools/serve.py"><kbd>run</kbd></a>&nbsp;
  <a href="activities.toml"><kbd>activities</kbd></a>&nbsp;
  <a href="tools/schedule.py"><kbd>schedule</kbd></a>&nbsp;
  <a href="tools/make_audio.py"><kbd>sound</kbd></a>&nbsp;
  <a href="web/index.html"><kbd>renderer</kbd></a>&nbsp;
  <a href="tools/render_demo.py"><kbd>dev reel</kbd></a>&nbsp;
  <a href="MUSING.md"><kbd>notes</kbd></a>
</p>

<details>
<summary><b>islandfetch --mono</b>: the same card, as plain text</summary>

\`\`\`text
${textCard()}
\`\`\`

</details>

<details>
<summary><b>Every field, explained</b> (they are all true, give or take a pun)</summary>
<br>

| Field | What it means |
| --- | --- |
| **OS** | Castaway, working title. A stationary-frame lo-fi video for YouTube, in 16:9. In development: no video is out yet. |
| **Host** | The whole set: one tiny island, one tall palm, one raft. Sunny, hand-painted, coastal anime by way of lo-fi. |
| **Kernel** | The seed. The default run is 10:00:00 with seed 1992: same seed, same video, event for event. |
| **Uptime** | How far into the ten hours we are. Each rerun up there jumps ahead; nothing much happened in between. |
| **Packages** | [\`activities.toml\`](activities.toml) holds more than 90 activities, and [\`tools/make_audio.py\`](tools/make_audio.py) writes more than 150 sound files. Both numbers keep going up. |
| **Shell** | The coconut that falls on a hermit crab. The crab keeps it and walks off inside. |
| **Resolution** | 1920x1080, 24 frames a second (the \`[video]\` table in \`activities.toml\`, as of 2026-10-01). |
| **DE** | Daytime Environment. It is always daytime: no night scenes, by house rule. Hence the light terminal theme. |
| **WM** | Wave Manager. Shore waves and drifting cloud shadows are built; distant birds, planes with vapour trails, whale pods, dolphins, sailboats, sandpipers, a gecko and a rain shower are planned. |
| **Terminal** | The renderer is a web page with a live preview and export to a YouTube-ready MP4. Plain ES modules, no build step, no npm packages. |
| **CPU** | One castaway, at 80 BPM. Every activity starts on the next bar of the theme, every 3 seconds. |
| **GPU** | Frame-exact H.264 encoded in the browser with WebCodecs; the server mixes the sound and joins the two into an MP4. |
| **Memory** | She is busy about a third of the time and idling the rest. The idling is the point. |
| **Disk** | Every sound is synthesized from code: no samples, loops or recordings, so no third-party licence applies. |
| **Song** | The theme: a seamless 60-second loop at 80 BPM in F major (ii-V-I-vi), 20 bars of exactly 3 seconds, with electric piano, a kalimba lead, soft drums and vinyl ticks and pops. Mixed to -14 LUFS, true peak at or below -1 dBTP, with levels adjustable in the master and per routine. Nobody has listened to it yet, so no review is offered. |
| **Local IP** | The signal hunt: one bar of signal, at the very top of the palm. |
| **Missed** | Whatever just happened while you were reading this. |
| **Now** | Idling. Nodding to the beat. |

</details>

<details>
<summary><b>The schedule</b>: four timers, one beat, very calm</summary>
<br>

[\`activities.toml\`](activities.toml) lists every activity with its beats, how long it lasts and how often it comes round, on four timers:

| Timer | Every | In a typical 10-hour run |
| --- | --- | --- |
| regular | 2 to 5 minutes | about 155 |
| occasional | 12 to 25 minutes | about 30 |
| rare | 30 to 60 minutes | about 13 |
| super rare | 3 to 6 hours (at most 3 a run) | about 2 |

Those counts are the median of 200 simulated runs, as the file itself says, plus chained follow-ups: the tide comes for the sandcastle, a different bottle brings a reply. Lanes let things overlap, so a visitor can come and go while she is busy with a coconut, and she will never know. [\`tools/schedule.py\`](tools/schedule.py) validates the file and simulates a run; [\`tools/render_demo.py\`](tools/render_demo.py) \`--dev\` renders a reel of every activity with a heads-up display (the older Python reference renderer). Hard cuts and stepped movement are the motion defaults.

</details>

<details>
<summary><b>Things you will probably miss</b></summary>
<br>

- A message in a bottle that washes straight back. Much later, a different bottle brings a reply.
- A delivery drone. The parcel: another pair of headphones.
- A sea turtle, visiting. A shark in headphones, nodding along.
- A grey tabby with a white chest who arrives on a crate, climbs the palm, naps, and one day floats away again (and comes back another time).
- The signal hunt: one bar, at the top of the palm.
- A tour boat of selfie-takers. A bro on an electric hydrofoil who waves a shaka and carves off.
- Bushcraft: fire by friction, a hammock, a lookout up the palm, spear fishing.
- A kumara, planted, that grows over the course of the video.
- Coconut sipping, fishing, jogging laps, a sandcastle the tide takes, waving for rescue.
- She could leave any time: she walks out over the water and comes back with an iced coffee.

</details>

<sub>The look borrows the system-info card that desktop customisers print into their screenshots (screenFetch and neofetch are the classic programs; both are credited here as references only). <code>islandfetch</code> is not a real program, and the emblem, lettering and "Lagoon Noon" colours are drawn for this page. Castaway is unofficial and the owner's own work; the 1992 screensaver that inspired it belongs to its owners.</sub>
`;
fs.writeFileSync(OUT_MD, MD);
console.log(`wrote ${path.relative(process.cwd(), OUT_MD)}`);

