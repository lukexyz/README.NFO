#!/usr/bin/env node
// Castaway as a full-screen terminal process monitor (style hack-07 in styles/styles.json).
//
// Regenerate:  node examples/castaway/src/18-tui-monitor_opus_5.5.mjs
// Writes assets/18-tui-monitor_opus_5.5.svg (the animated screen) and 18-tui-monitor_opus_5.5.md
// (the header: its plain-text screen and process listing are built from the same data here).
//
// The style: the monitor every Unix user leaves running in a corner (htop, first released in
// 2004, is the best-known one) under a terminal multiplexer's status line (tmux's, black on
// green). Both are credited references only. Bracketed bar meters, an inverse table header, a
// function-key strip and a status line are generic TUI furniture; the program name ("palmtop"),
// every label, the layout, the colours and the lettering are this generator's own.
//
// The joke: the island is a computer with six cores, one per schedule lane (her, the cat, the
// turtle, the sea and sky, the shore, the garden), and every activity in activities.toml is a
// process. Lanes run in parallel, so a ship can sail past on core 3 while she is busy with a
// coconut on core 0. Load average: 0.33 0.33 0.33 (she is busy about a third of the time).
//
// What is real (from D:/python/castaway, read 2026-10-01): activity names, tiers, weights,
// durations, lanes and chains; the tier intervals; 80 BPM, F major, 20 bars of 3 s and the
// bar map of the theme (intro, groove, theme, breakdown); 0 samples; serve.py and its URL.
// What is staged: the uptime, the PIDs and the 60-second story itself (coconut and ship, the
// shark, the sandcastle and the tide), which is compressed so it fits one theme loop while the
// music meter keeps real time. Fill levels and CPU% are decoration, not telemetry.
//
// Plain Node, no dependencies, deterministic (seeded PRNG, no clock). Text is a monoline stroke
// font defined below, placed with <use>, never <text>. Animation is CSS only, one 60 s loop
// (the length of the theme) on a 0.75 s beat grid, and the un-animated state of every element is
// the frame at 2.25 s (ship passing, coconut in hand), so prefers-reduced-motion shows a whole,
// readable screen.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '18-tui-monitor_opus_5.5';
const OUT_SVG = path.join(HERE, '..', 'assets', `${SLUG}.svg`);
const OUT_MD = path.join(HERE, '..', `${SLUG}.md`);

// ---------------------------------------------------------------------------------------------
// Geometry and time
// ---------------------------------------------------------------------------------------------
const COLS = 100, ROWS = 28, CW = 9, CH = 18, PAD = 14;
const VBW = COLS * CW + PAD * 2, VBH = ROWS * CH + PAD * 2;
const T = 60;              // the theme loop: 20 bars of 3 s
const BEAT = 0.75;         // 80 BPM
const NB = T / BEAT;       // 80 beats a loop
const HOLD = 3;            // beat shown when animation is off (2.25 s)

// ---------------------------------------------------------------------------------------------
// Palette: terminal black (the screen's, not the sky's: it is always daytime on the island),
// cream, and five island colours
// ---------------------------------------------------------------------------------------------
const PAL = {
  bg: '#0a1218', edge: '#22323c', ink: '#071015',
  cream: '#f4eddc', text: '#cdd6d8', dim: '#8496a0', mute: '#5c6c76', shadow: '#4a5b66',
  coral: '#ff7f6e', sand: '#f3d173', palm: '#93d55c', sea: '#47d4d0', sky: '#64b1ff',
  deep: '#173039',
};
const CLS = Object.keys(PAL);
const S = (k) => `s${CLS.indexOf(k)}`;   // stroke class
const F = (k) => `f${CLS.indexOf(k)}`;   // fill class

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
const ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));

// ---------------------------------------------------------------------------------------------
// Monoline stroke font. Glyph box: x 0..6, caps y 0..10, x-height y 3, descenders to y 13.
// Placed at (1.5, 3.5) inside a 9 x 18 cell. Own lettering: squared-off rounded terminal shapes.
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
// Box drawing, in cell coordinates (9 x 18), through the cell centre (4.5, 9).
const BOX = {
  '─': 'M-0.3 9H9.3',
  '│': 'M4.5 -0.3V18.3',
  '├': 'M4.5 -0.3V18.3M4.5 9H9.3',
  '└': 'M4.5 -0.3V9H9.3',
};

// ---------------------------------------------------------------------------------------------
// Ids: glyphs and shared text runs live in <defs>
// ---------------------------------------------------------------------------------------------
const IDS = [...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'];
let idN = 0;
const nextId = () => { const n = idN++; return n < IDS.length ? IDS[n] : IDS[Math.floor(n / IDS.length) - 1] + IDS[n % IDS.length]; };
const glyphIds = new Map();
function gid(ch) {
  if (!(ch in GLYPHS) && !(ch in BOX)) throw new Error(`no glyph for ${JSON.stringify(ch)}`);
  if (!glyphIds.has(ch)) glyphIds.set(ch, nextId());
  return glyphIds.get(ch);
}
const runIds = new Map();      // text run -> id of a <g> of glyph uses
function rid(str) {
  if (!runIds.has(str)) runIds.set(str, 'r' + runIds.size.toString(36));
  return runIds.get(str);
}
const runDef = (str) => {
  let out = '';
  [...str].forEach((ch, i) => { if (ch !== ' ') out += `<use href="#${gid(ch)}"${i ? ` x="${i * CW}"` : ''}/>`; });
  return out;
};

// ---------------------------------------------------------------------------------------------
// Animation helpers. Every keyframe sits on the beat grid; timing is step-end, so values hold.
// ---------------------------------------------------------------------------------------------
const css = [];
const pct = (b) => +(b / NB * 100).toFixed(4);
const visCache = new Map();
// on: boolean[NB]. Returns '' (always on), null (never on) or a class name.
function vis(on) {
  if (on.every(Boolean)) return '';
  if (!on.some(Boolean)) return null;
  const key = on.map((v) => (v ? 1 : 0)).join('');
  if (visCache.has(key)) return visCache.get(key);
  const name = 'v' + visCache.size.toString(36);
  const frames = [`0%{opacity:${on[0] ? 1 : 0}}`];
  for (let b = 1; b < NB; b++) if (on[b] !== on[b - 1]) frames.push(`${pct(b)}%{opacity:${on[b] ? 1 : 0}}`);
  frames.push(`100%{opacity:${on[NB - 1] ? 1 : 0}}`);
  css.push(`.${name}{opacity:${on[HOLD] ? 1 : 0};animation:${name} ${T}s step-end infinite}@keyframes ${name}{${frames.join('')}}`);
  visCache.set(key, name);
  return name;
}
// Seconds-based visibility (the uptime clock ticks in seconds, not beats).
const visSecCache = new Map();
function visSec(intervals, holdOn) {
  const key = intervals.map((i) => i.join('-')).join(',');
  if (visSecCache.has(key)) return visSecCache.get(key);
  const name = 'u' + visSecCache.size.toString(36);
  const frames = [];
  let on0 = intervals.some(([a]) => a === 0);
  frames.push(`0%{opacity:${on0 ? 1 : 0}}`);
  for (const [a, b] of intervals) {
    if (a > 0) frames.push(`${+(a / T * 100).toFixed(4)}%{opacity:1}`);
    if (b < T) frames.push(`${+(b / T * 100).toFixed(4)}%{opacity:0}`);
  }
  const lastOn = intervals.some(([, b]) => b === T);
  frames.push(`100%{opacity:${lastOn ? 1 : 0}}`);
  css.push(`.${name}{opacity:${holdOn ? 1 : 0};animation:${name} ${T}s step-end infinite}@keyframes ${name}{${frames.join('')}}`);
  visSecCache.set(key, name);
  return name;
}
// values: number[NB] -> a translateX animation in px.
let moveN = 0;
function moveX(values, scale = CW) {
  const name = 'm' + (moveN++).toString(36);
  const frames = [`0%{transform:translateX(${values[0] * scale}px)}`];
  for (let b = 1; b < NB; b++) if (values[b] !== values[b - 1]) frames.push(`${pct(b)}%{transform:translateX(${values[b] * scale}px)}`);
  frames.push(`100%{transform:translateX(${values[NB - 1] * scale}px)}`);
  css.push(`.${name}{transform:translateX(${values[HOLD] * scale}px);animation:${name} ${T}s step-end infinite}@keyframes ${name}{${frames.join('')}}`);
  return name;
}
const beats = (fn) => Array.from({ length: NB }, (_, b) => fn(b));

// ---------------------------------------------------------------------------------------------
// The story: one theme loop (60 s, 20 bars). Every start lands on a bar line (every 4 beats).
// Spans are [start beat, end beat).
// ---------------------------------------------------------------------------------------------
const SPAN = {
  coconut_sip: [76, 87],            // 0:57, she wanders into the shade with a coconut (wraps)
  ship_passes_unseen: [0, 6],       // 0:00, a ship crosses the horizon. She never sees it.
  shark_nod: [24, 32],              // 0:18, a shark in headphones nods along. So does she.
  sandcastle: [44, 52],             // 0:33
  tide_takes_sandcastle: [60, 65],  // 0:45, as is tradition
};
const within = ([s, e], b) => (b >= s && b < e) || (b + NB >= s && b + NB < e);
const on = (name, b) => within(SPAN[name], b);
const HER = ['coconut_sip', 'shark_nod', 'sandcastle'];
const herAct = (b) => HER.find((n) => on(n, b)) || null;

// Meter fills, in cells of 44. htop-style: refreshed every 2 beats (1.5 s); the nod is per beat.
const INNER = 44;
const nod = beats((b) => (b % 2 === 0 ? 4 : 2));
const held = (fn) => { const out = []; for (let b = 0; b < NB; b++) out.push(b % 2 === 0 || b === 0 ? fn(b) : null); for (let b = 1; b < NB; b++) if (out[b] === null) out[b] = out[b - 1]; return out; };
const herFill = held((b) => (herAct(b) ? ri(25, 35) : 0));
const seaFill = held((b) => (on('ship_passes_unseen', b) ? ri(17, 27) : on('shark_nod', b) ? ri(23, 33) : 0));
const WAVES = [1, 1, 2, 3, 3, 2, 2, 1];
const shoreFill = held((b) => (on('tide_takes_sandcastle', b) ? ri(36, 42) : WAVES[b % 8]));
const catFill = beats((b) => (b % 4 === 0 ? 2 : 1));        // purrs once a bar
const turtleFill = beats(() => 0);                          // away
const gardenFill = beats(() => 1);                          // the kumara, growing
// Make the starts honest: a fill that begins mid-refresh begins on its own start beat.
for (const [arr, names] of [[herFill, HER], [seaFill, ['ship_passes_unseen', 'shark_nod']], [shoreFill, ['tide_takes_sandcastle']]]) {
  for (let b = 0; b < NB; b++) {
    const active = names.some((n) => on(n, b));
    if (active && arr[b] < 10) arr[b] = ri(24, 32);
    if (!active && arr === herFill) arr[b] = 0;
    if (!active && arr === seaFill) arr[b] = 0;
    if (!active && arr === shoreFill) arr[b] = WAVES[b % 8];
  }
}
// The theme's bar map: intro 0-6 s, groove 6-30 s, theme 30-48 s, breakdown 48-60 s.
const musBar = beats((b) => Math.floor(b / 4) + 1);          // 1..20
const musFill = beats((b) => Math.round(INNER * musBar[b] / 20));
const SECTION = (k) => (k <= 2 ? 'intro' : k <= 10 ? 'groove' : k <= 16 ? 'theme' : 'break');

// ---------------------------------------------------------------------------------------------
// Screen buffer: background rects and text, each optionally tied to a visibility class
// ---------------------------------------------------------------------------------------------
const bgs = [];            // {r, c, n, rows, cls, vis}
const texts = new Map();   // `${row}|${cls}` -> [[col, ch]]
const layers = [];         // raw svg snippets drawn above static text
function put(r, c, str, k) {
  const key = `${r}|${S(k)}`;
  if (!texts.has(key)) texts.set(key, []);
  [...str].forEach((ch, i) => {
    if (c + i >= COLS) throw new Error(`off screen: row ${r}: ${str}`);
    if (ch !== ' ') texts.get(key).push([c + i, ch]);
  });
  return c + [...str].length;
}
const seg = (r, c, parts) => { for (const [str, k] of parts) c = put(r, c, str, k); return c; };
const fill = (r, c, n, k, v = '', rows = 1) => { if (v !== null) bgs.push({ r, c, n, rows, k, v }); };
// A shared run placed once, optionally with a visibility class.
const runAt = (r, c, str, k, v = '') => {
  if (v === null || !str.trim()) return '';
  return `<use href="#${rid(str)}" x="${c * CW}" y="${r * CH}" class="${S(k)}${v ? ' ' + v : ''}"/>`;
};
const padL = (s, n) => String(s).padStart(n);
const padR = (s, n) => String(s).padEnd(n);

// ---------------------------------------------------------------------------------------------
// Header, left column: six cores (one per lane), the music, the samples, her history graph
// ---------------------------------------------------------------------------------------------
const clipDefs = [];
const COMB = 'k0';
// A bar meter, drawn the way the real thing behaves: a run of pipes per segment, cumulative from
// the left, with the label text right-aligned inside the brackets. Where the fill reaches the
// text, the letters take the segment's colour; elsewhere they sit in the shadow colour.
// Only ordinary elements move: each segment's comb of pipes slides right, a cell at a time,
// under one static clip, and each text cell is recoloured by visibility. (No animated clip
// paths, which some browsers do not repaint.)
// segs: left to right, {k, ends: cells[NB]} with cumulative ends. txt: [{str, on: bool[NB]|null}].
const METER_CLIP = 'q1';
const meterCombs = [];
function meter(r, label, labelK, segs, txt, txtShadowK = 'shadow') {
  put(r, 0, padL(label, 3), labelK);
  put(r, 3, '[', 'cream');
  put(r, 4 + INNER, ']', 'cream');
  const x0 = 4 * CW, y0 = r * CH;
  for (let i = segs.length - 1; i >= 0; i--) {
    const sg = segs[i];
    if (sg.ends.every((e) => e === 0)) continue;
    meterCombs.push(`<use href="#${COMB}" x="${x0 - INNER * CW}" y="${y0}" class="${S(sg.k)} ${moveX(sg.ends)}"/>`);
  }
  let out = '';
  for (const t of txt) {
    const v = t.on ? vis(t.on) : '';
    const tc = 4 + INNER - t.str.length;
    out += `<rect x="${tc * CW - 2}" y="${y0}" width="${t.str.length * CW + 2}" height="${CH}" class="${F('bg')}${v ? ' ' + v : ''}"/>`;
    out += runAt(r, tc, t.str, txtShadowK, v);
    [...t.str].forEach((ch, j) => {
      if (ch === ' ') return;
      const cell = INNER - t.str.length + j;
      segs.forEach((sg, k) => {
        const lit = beats((b) => (!t.on || t.on[b]) && cell < sg.ends[b] && (k === 0 || cell >= segs[k - 1].ends[b]));
        const cv = vis(lit);
        if (cv === null) return;
        out += `<use href="#${gid(ch)}" x="${(tc + j) * CW}" y="${y0}" class="${S(sg.k)}${cv ? ' ' + cv : ''}"/>`;
      });
    });
  }
  layers.push(out);
}
const cum = (...arrs) => { const acc = beats(() => 0); return arrs.map((a) => { for (let b = 0; b < NB; b++) acc[b] += a[b]; return [...acc]; }); };

{
  const [nodEnd, herEnd] = cum(nod, herFill);
  meter(0, '0', 'sea', [{ k: 'palm', ends: nodEnd }, { k: 'coral', ends: herEnd }], [{ str: 'castaway', on: null }]);
  meter(1, '1', 'sea', [{ k: 'sand', ends: catFill }], [{ str: 'cat', on: null }]);
  meter(2, '2', 'sea', [{ k: 'palm', ends: turtleFill }], [{ str: 'turtle', on: null }]);
  meter(3, '3', 'sea', [{ k: 'sea', ends: seaFill }], [{ str: 'sea_sky', on: null }]);
  meter(4, '4', 'sea', [{ k: 'sky', ends: shoreFill }], [{ str: 'shore', on: null }]);
  meter(5, '5', 'sea', [{ k: 'palm', ends: gardenFill }], [{ str: 'garden', on: null }]);
  // Music: the fill is the position in the 20-bar theme, coloured by section.
  const capAt = (n) => beats((b) => Math.min(musFill[b], n));
  const musTxt = [];
  for (let k = 1; k <= 20; k++) {
    const str = `${SECTION(k).padStart(6)}  bar ${String(k).padStart(2, '0')}/20`;
    musTxt.push({ str, on: beats((b) => musBar[b] === k) });
  }
  meter(6, 'Mus', 'sea', [
    { k: 'sea', ends: capAt(4) }, { k: 'palm', ends: capAt(22) }, { k: 'sand', ends: capAt(35) }, { k: 'coral', ends: capAt(44) },
  ], musTxt);
  meter(7, 'Smp', 'sea', [], [{ str: '0 samples: every sound is code', on: null }], 'dim');
  clipDefs.push(`<clipPath id="${METER_CLIP}"><rect x="${4 * CW}" y="0" width="${INNER * CW}" height="${8 * CH}"/></clipPath>`);
}
// Her history graph: 2 rows of braille-style dots, newest on the right, one column a beat.
const graph = { r: 8, c: 4, w: INNER };
{
  put(graph.r, 0, 'Her', 'sea');
  put(graph.r + 1, 0, '1/3', 'mute');
  const level = beats((b) => (herAct(b) ? Math.max(5, Math.min(8, Math.round(8 * (nod[b] + herFill[b]) / INNER) + 1)) : (nod[b] === 4 ? 2 : 1)));
  const gx0 = graph.c * CW, gy0 = graph.r * CH;
  const colsVisible = graph.w * 2;                  // 88 dot columns
  const DY = [15, 11, 7, 3].map((y) => gy0 + CH + y).concat([15, 11, 7, 3].map((y) => gy0 + y)); // bottom-up
  let low = '', high = '';
  for (let b = -(colsVisible - 1); b < NB; b++) {
    const lv = level[((b % NB) + NB) % NB];
    const x = +(gx0 + 2.25 + (b + colsVisible - 1) * 4.5).toFixed(2);
    for (let d = 0; d < lv; d++) {
      const dot = `M${x} ${DY[d]}v0.01`;
      if (d < 2) low += dot; else high += dot;
    }
  }
  const scroll = moveX(beats((b) => -b), 4.5);
  clipDefs.push(`<clipPath id="q0"><rect x="${gx0}" y="${gy0}" width="${graph.w * CW}" height="${CH * 2}"/></clipPath>`);
  layers.push(`<g clip-path="url(#q0)"><g class="${scroll}"><path class="dot ${S('palm')}" d="${low}"/><path class="dot ${S('coral')}" d="${high}"/></g></g>`);
}

// ---------------------------------------------------------------------------------------------
// Header, right column: the title (a big box-drawn meter), the pitch and three text meters
// ---------------------------------------------------------------------------------------------
const TITLE_C0 = 51;
const LETTERS = {
  C: [[[4, 0], [0, 0], [0, 4], [4, 4]]],
  A: [[[0, 4], [0, 0], [4, 0], [4, 4]], [[0, 2], [4, 2]]],
  S: [[[4, 0], [0, 0], [0, 2], [4, 2], [4, 4], [0, 4]]],
  T: [[[0, 0], [4, 0]], [[2, 0], [2, 4]]],
  W: [[[0, 0], [0, 4], [4, 4], [4, 0]], [[2, 2], [2, 4]]],
  Y: [[[0, 0], [0, 2], [4, 2], [4, 0]], [[2, 2], [2, 4]]],
};
function rounded(pts, R) {
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x, y] = pts[i];
    if (i === pts.length - 1) { d += `L${x} ${y}`; break; }
    const [px, py] = pts[i - 1], [nx, ny] = pts[i + 1];
    const l1 = Math.hypot(x - px, y - py), l2 = Math.hypot(nx - x, ny - y);
    const r = Math.min(R, l1 / 2, l2 / 2);
    const ax = x + (px - x) / l1 * r, ay = y + (py - y) / l1 * r;
    const bx = x + (nx - x) / l2 * r, by = y + (ny - y) / l2 * r;
    d += `L${+ax.toFixed(2)} ${+ay.toFixed(2)}Q${x} ${y} ${+bx.toFixed(2)} ${+by.toFixed(2)}`;
  }
  return d;
}
let titleD = '';
[...'CASTAWAY'].forEach((ch, k) => {
  for (const line of LETTERS[ch]) {
    const pts = line.map(([gx, gy]) => [(TITLE_C0 + 6 * k + gx) * CW + 4.5, gy * CH + 9]);
    titleD += rounded(pts, 7);
  }
});
const TX0 = TITLE_C0 * CW, TX1 = (TITLE_C0 + 47) * CW;

put(5, 51, '10 hours of lo-fi island.', 'cream');
put(5, 77, 'now and then, a gag.', 'dim');
// Counted in activities.toml on 2026-10-01: 92 entries, of which 81 are on the four timers
// (9 regular, 35 occasional, 31 rare, 6 super rare) and 11 are chained. Other sessions are still
// adding activities: recount and change these two when they drift.
const ACTS = 81, CHAINED = 11;
// Tasks: running count follows the table below.
// Load average: she is busy about a third of the time.
seg(7, 51, [['Load average: ', 'sea'], ['0.33 ', 'cream'], ['0.33 ', 'text'], ['0.33', 'dim']]);
seg(8, 51, [['Uptime: ', 'sea'], ['03:41:', 'cream']]);
seg(8, 67, [[' of ', 'dim'], ['10:00:00', 'text'], [', seed ', 'dim'], ['1992', 'text']]);
seg(9, 51, [['Tiers: ', 'sea'], ['2-5m ', 'palm'], ['12-25m ', 'sand'], ['30-60m ', 'coral'], ['3-6h', 'sky']]);
// Uptime seconds: two digit cells, one use per digit value, shown on the second it is due.
{
  const holdSec = Math.floor(HOLD * BEAT);
  for (let d = 0; d < 6; d++) {
    const iv = [[d * 10, d * 10 + 10]];
    layers.push(runAt(8, 65, String(d), 'cream', visSec(iv, Math.floor(holdSec / 10) === d)));
  }
  for (let d = 0; d < 10; d++) {
    const iv = [];
    for (let s = d; s < 60; s += 10) iv.push([s, s + 1]);
    layers.push(runAt(8, 66, String(d), 'cream', visSec(iv, holdSec % 10 === d)));
  }
}

// ---------------------------------------------------------------------------------------------
// The process table (tree view, sorted by PID)
// ---------------------------------------------------------------------------------------------
const COL = { pid: 0, user: 7, tier: 16, wt: 23, every: 26, lasts: 34, s: 46, cpu: 48, cmd: 54 };
const TIER_K = { '-': 'mute', idle: 'dim', reg: 'palm', occ: 'sand', rare: 'coral', 's.rare': 'sky', chain: 'mute' };
const LANE_K = { island: 'cream', castaway: 'coral', cat: 'sand', turtle: 'palm', sea_sky: 'sea', shore: 'sky', garden: 'palm' };
// [pid, user, tier, weight, every, lasts, tree, name, flags]
const PROCS = [
  [1992, 'island', '-', '-', '-', '10:00:00', '', 'python tools/serve.py', ' # http://127.0.0.1:8765/'],
  [2001, 'castaway', 'idle', 4, 'between', '0:45-3:00', '├─ ', 'idle_music_nod', ' --to-the-beat'],
  [2047, 'castaway', 'reg', 3, '2-5m', '0:27-0:51', '├─ ', 'coconut_sip', ' --in-the-shade --eyes-closed'],
  [2093, 'castaway', 'reg', 2, '2-5m', '0:57-1:54', '├─ ', 'sandcastle', ' --until-the-tide'],
  [2094, 'shore', 'chain', '-', '+5-30m', '0:05-0:08', '│  └─ ', 'tide_takes_sandcastle', ''],
  [2118, 'sea_sky', 'occ', 4, '12-25m', '1:30-2:30', '├─ ', 'ship_passes_unseen', ' --while-busy'],
  [2161, 'castaway', 'occ', 2, '12-25m', '1:17-2:17', '├─ ', 'message_in_bottle', ' --returns-to-sender'],
  [2162, 'castaway', 'chain', '-', '+1-3h', '0:40-1:07', '│  └─ ', 'bottle_reply', ' --a-different-bottle'],
  [2205, 'turtle', 'occ', 2, '12-25m', '3:13-6:06', '├─ ', 'turtle_visit', ' --doze-off-together'],
  [2240, 'cat', 'rare', 2, '30-60m', '11:04-26:46', '├─ ', 'cat_visit', ' --via=crate --nap=palm'],
  [2286, 'castaway', 'rare', 2, '30-60m', '1:54-4:10', '├─ ', 'signal_hunt', ' --bars=1 --top-of-palm'],
  [2331, 'sea_sky', 'rare', 2, '30-60m', '0:39-0:57', '├─ ', 'delivery_drone', ' --parcel=headphones'],
  [2379, 'sea_sky', 'rare', 2, '30-60m', '0:49-1:17', '├─ ', 'shark_nod', ' --headphones --bpm=80'],
  [2412, 'castaway', 's.rare', 1, '3-6h', '1:19-1:59', '└─ ', 'leave_any_time', ' --back-with=iced-coffee'],
];
const TABLE_R = 11;
const rowOf = (name) => TABLE_R + 1 + PROCS.findIndex((p) => p[7] === name);
// Running state per beat, and CPU% (the lane's meter, as a share of 44 cells, plus a little jitter).
const jit = beats(() => ri(0, 9) / 10);
const cpuOf = (cells, b) => (Math.min(99.9, cells / INNER * 100 + jit[b - (b % 2)])).toFixed(1);
const STATE = {
  idle_music_nod: (b) => (!herAct(b) ? cpuOf(nod[b - (b % 2)], b) : null),
  coconut_sip: (b) => (on('coconut_sip', b) ? cpuOf(nod[b - (b % 2)] + herFill[b], b) : null),
  sandcastle: (b) => (on('sandcastle', b) ? cpuOf(nod[b - (b % 2)] + herFill[b], b) : null),
  shark_nod: (b) => (on('shark_nod', b) ? cpuOf(seaFill[b], b) : null),
  ship_passes_unseen: (b) => (on('ship_passes_unseen', b) ? cpuOf(seaFill[b], b) : null),
  tide_takes_sandcastle: (b) => (on('tide_takes_sandcastle', b) ? cpuOf(shoreFill[b], b) : null),
};
// The selection bar follows whatever started last.
const SELECT = [[0, 'ship_passes_unseen'], [24, 'shark_nod'], [44, 'sandcastle'], [60, 'tide_takes_sandcastle'], [69, 'idle_music_nod'], [76, 'coconut_sip']];
const selAt = (b) => { let s = SELECT[0][1]; for (const [at, n] of SELECT) if (b >= at) s = n; return s; };

{
  // Header row: inverse video, the sort column (PID) picked out.
  const H = `${padL('PID', 6)} ${padR('USER', 9)}${padR('TIER', 7)}${padL('WT', 2)} ${padR('EVERY', 8)}${padR('LASTS', 12)}S  CPU% Command`;
  fill(TABLE_R, 0, COLS, 'palm');
  fill(TABLE_R, 3, 3, 'sea');
  put(TABLE_R, 0, H, 'ink');

  PROCS.forEach((p, i) => {
    const r = TABLE_R + 1 + i;
    const [pid, user, tier, wt, every, lasts, tree, name, flags] = p;
    const parts = [
      [COL.pid, padL(pid, 6), 'dim'],
      [COL.user, user, LANE_K[user]],
      [COL.tier, tier, TIER_K[tier]],
      [COL.wt, padL(wt, 2), 'text'],
      [COL.every, every, 'text'],
      [COL.lasts, lasts, 'text'],
      [COL.cmd, tree, 'mute'],
      [COL.cmd + [...tree].length, name, 'cream'],
      [COL.cmd + [...tree].length + name.length, flags, i === 0 ? 'sand' : 'dim'],
    ];
    const selOn = beats((b) => selAt(b) === name);
    const everSel = selOn.some(Boolean);
    const normV = everSel ? vis(selOn.map((v) => !v)) : '';
    if (everSel) fill(r, 0, COLS, 'sea', vis(selOn));
    for (const [c, str, k] of parts) {
      if (!everSel) put(r, c, str, k);
      else {
        layers.push(runAt(r, c, str, k, normV));
        layers.push(runAt(r, c, str, 'ink', vis(selOn)));
      }
    }
    // State and CPU% (variants keyed by what is shown and whether the row is selected).
    const st = STATE[name];
    const variants = new Map();
    for (let b = 0; b < NB; b++) {
      const cpu = st ? st(b) : null;
      const key = `${cpu === null ? 'S' : 'R'}|${cpu === null ? '0.0' : cpu}|${selOn[b] ? 1 : 0}`;
      if (!variants.has(key)) variants.set(key, beats(() => false));
      variants.get(key)[b] = true;
    }
    for (const [key, onArr] of variants) {
      const [s, cpu, sel] = key.split('|');
      const v = variants.size === 1 ? '' : vis(onArr);
      const ks = sel === '1' ? 'ink' : s === 'R' ? 'palm' : 'mute';
      const kc = sel === '1' ? 'ink' : s === 'R' ? 'cream' : 'mute';
      if (v === '' ) { put(r, COL.s, s, ks); put(r, COL.cpu, padL(cpu, 5), kc); }
      else { layers.push(runAt(r, COL.s, s, ks, v)); layers.push(runAt(r, COL.cpu, padL(cpu, 5), kc, v)); }
    }
  });
}
// Tasks: N running (every R row except the renderer).
{
  const running = beats((b) => Object.values(STATE).filter((fn) => fn(b) !== null).length);
  seg(6, 51, [['Tasks: ', 'sea'], [String(ACTS), 'cream'], [', ', 'dim'], [String(CHAINED), 'cream'], [' chained; ', 'dim']]);
  for (const n of [...new Set(running)]) {
    layers.push(runAt(6, 51 + `Tasks: ${ACTS}, ${CHAINED} chained; `.length, `${n} running`, 'palm', vis(running.map((x) => x === n))));
  }
}

// ---------------------------------------------------------------------------------------------
// Function-key strip and the multiplexer's status line
// ---------------------------------------------------------------------------------------------
const FKEYS = [['F1', 'Run'], ['F2', 'Gags'], ['F3', 'Tiers'], ['F4', 'Sound'], ['F5', 'Notes'], ['F6', 'Reel'],
  ['F7', 'Calm -'], ['F8', 'Calm +'], ['F9', 'Wave'], ['F10', 'Stay']];
{
  const r = ROWS - 2;
  let c = 0;
  for (const [key, label] of FKEYS) {
    c = put(r, c, key, 'cream');
    fill(r, c, 6, 'sea');
    put(r, c, padR(label, 6), 'ink');
    c += 6;
  }
  fill(r, c, COLS - c, 'sea');
}
const MESSAGES = [
  [0, 8, 'a ship is passing. she is busy with a coconut. she will never know.'],
  [12, 20, 'nothing is happening. this is working as intended.'],
  [25, 33, 'a shark in headphones surfaces, nodding at 80 BPM. she nods back.'],
  [45, 53, 'sandcastle built. the tide has been notified.'],
  [61, 69, 'the tide took the sandcastle. as is tradition.'],
];
{
  const r = ROWS - 1;
  const msgOn = beats((b) => MESSAGES.some(([a, z]) => within([a, z], b)));
  const statusV = vis(msgOn.map((v) => !v));
  fill(r, 0, COLS, 'palm');
  const left = '[castaway] 0:palmtop* 1:serve.py- 2:schedule.py  3:make_audio.py';
  const right = '"127.0.0.1:8765" 12:00 01-Oct-26';
  layers.push(runAt(r, 0, left, 'ink', statusV));
  layers.push(runAt(r, COLS - right.length, right, 'ink', statusV));
  for (const [a, z, msg] of MESSAGES) {
    const v = vis(beats((b) => within([a, z], b)));
    fill(r, 0, COLS, 'sand', v);
    layers.push(runAt(r, 0, msg, 'ink', v));
  }
}

// ---------------------------------------------------------------------------------------------
// Assemble
// ---------------------------------------------------------------------------------------------
function staticText() {
  const byRow = new Map();
  for (const [key, cells] of texts) {
    if (!cells.length) continue;
    const [r, cls] = key.split('|');
    if (!byRow.has(r)) byRow.set(r, []);
    byRow.get(r).push([cls, cells]);
  }
  let out = '';
  for (const [r, groups] of byRow) {
    out += `<g transform="translate(0 ${r * CH})">`;
    for (const [cls, cells] of groups) {
      out += `<g class="${cls}">` + cells.sort((a, b) => a[0] - b[0]).map(([c, ch]) => `<use href="#${gid(ch)}"${c ? ` x="${c * CW}"` : ''}/>`).join('') + '</g>';
    }
    out += '</g>';
  }
  return out;
}
function bgRects() {
  return bgs.map(({ r, c, n, rows, k, v }) => `<rect x="${c * CW}" y="${r * CH}" width="${n * CW}" height="${rows * CH}" class="${F(k)}${v ? ' ' + v : ''}"/>`).join('');
}

const ALT_TITLE = 'Castaway: the island as a process monitor';
const DESC = 'A full-screen terminal process monitor for Castaway, a 10-hour lo-fi island video. '
  + 'Top right, CASTAWAY in big rounded box-drawing capitals, coral to sand to sea. Six bar meters, one per lane: castaway, cat, turtle, sea_sky, shore and garden. '
  + 'A music meter steps through the 20 bars of the theme in real time; a samples meter reads 0. Load average 0.33 0.33 0.33. '
  + 'The process table lists activities as processes with their tiers, weights, intervals and durations: python tools/serve.py at the root, then idle_music_nod, coconut_sip, sandcastle and the tide, ship_passes_unseen, message_in_bottle and its reply, turtle_visit, cat_visit, signal_hunt, delivery_drone, shark_nod and leave_any_time. '
  + 'A ship passes on core 3 while she sips a coconut on core 0; she never sees it.';

function build() {
  // Static text and layers first, so every glyph and run is known before defs are written.
  const bodyBg = bgRects();
  const bodyText = staticText();
  const bodyLayers = layers.join('');
  const combD = 'M4.5 2V15' + 'm9 -13v13'.repeat(INNER - 1);
  let defs = '';
  for (const [ch, id] of glyphIds) {
    if (ch in BOX) defs += `<path id="${id}" class="bx" d="${BOX[ch]}"/>`;
    else defs += `<path id="${id}" transform="translate(1.5 3.5)" d="${GLYPHS[ch]}"/>`;
  }
  for (const [str, id] of runIds) defs += `<g id="${id}">${runDef(str)}</g>`;
  defs += `<path id="${COMB}" d="${combD}"/>`;
  defs += `<linearGradient id="g0" gradientUnits="userSpaceOnUse" x1="${TX0}" y1="0" x2="${TX1}" y2="0"><stop offset="0" stop-color="${PAL.coral}"/><stop offset="0.5" stop-color="${PAL.sand}"/><stop offset="1" stop-color="${PAL.sea}"/></linearGradient>`;
  defs += clipDefs.join('');
  // runDef may have allocated new glyph ids after the loop above: emit any stragglers.
  for (const [ch, id] of glyphIds) if (!defs.includes(`id="${id}"`)) defs += `<path id="${id}" transform="translate(1.5 3.5)" d="${GLYPHS[ch]}"/>`;

  const colours = CLS.map((k, i) => `.s${i}{stroke:${PAL[k]}}.f${i}{fill:${PAL[k]}}`).join('');
  const style = [
    colours,
    `.t{fill:none;stroke-width:1.45;stroke-linecap:round;stroke-linejoin:round}`,
    `.bx{stroke-width:1.3;stroke-linecap:butt}`,
    `.dot{stroke-width:2.3}`,
    `.tt{fill:none;stroke-width:4.4;stroke-linecap:round;stroke-linejoin:round}`,
    ...css,
    `@media (prefers-reduced-motion:reduce){*{animation:none!important}}`,
  ].join('\n');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VBW} ${VBH}" width="${VBW}" height="${VBH}" role="img" aria-labelledby="ttl dsc">
<title id="ttl">${ALT_TITLE}</title>
<desc id="dsc">${DESC}</desc>
<style>
${style}
</style>
<defs>${defs}</defs>
<rect x="0.5" y="0.5" width="${VBW - 1}" height="${VBH - 1}" rx="10" fill="${PAL.bg}" stroke="${PAL.edge}"/>
<g transform="translate(${PAD} ${PAD})">
${bodyBg}
<path class="tt" stroke="${PAL.deep}" transform="translate(2.5 3)" d="${titleD}"/>
<path class="tt" stroke="url(#g0)" d="${titleD}"/>
<g class="t">
<g clip-path="url(#${METER_CLIP})">${meterCombs.join('')}</g>
${bodyText}
${bodyLayers}
</g>
</g>
</svg>
`;
}

const svg = build();
fs.mkdirSync(path.dirname(OUT_SVG), { recursive: true });
fs.writeFileSync(OUT_SVG, svg);
console.log(`wrote ${path.relative(process.cwd(), OUT_SVG)}: ${(svg.length / 1024).toFixed(1)} KB, ${glyphIds.size} glyphs, ${runIds.size} runs, ${css.length} animations`);

// =============================================================================================
// The markdown header. Its text screens are built from the same data, at the same frozen beat.
// Code blocks stay within 80 columns, ASCII plus box drawing.
// =============================================================================================
const W80 = 80;
const check80 = (lines, what) => {
  for (const l of lines) {
    if ([...l].length > W80) throw new Error(`${what}: ${[...l].length} columns: ${l}`);
    if (/\s$/.test(l)) throw new Error(`${what}: trailing space: ${l}`);
  }
  return lines.join('\n');
};

// F5 Notes: the screen at the frozen beat, re-laid for 80 columns.
function frozenScreen() {
  const b = HOLD, IN = 35;
  const bar = (label, cells44, txt) => {
    const n = Math.round(cells44 * IN / INNER);
    const body = ('|'.repeat(n) + ' '.repeat(IN)).slice(0, IN);
    const t = txt.length ? body.slice(0, IN - txt.length - 1).padEnd(IN - txt.length) + txt : body;
    return `${padL(label, 3)}[${t}]`;
  };
  const left = [
    bar('0', nod[b] + herFill[b], 'castaway'),
    bar('1', catFill[b], 'cat'),
    bar('2', turtleFill[b], 'turtle'),
    bar('3', seaFill[b], 'sea_sky'),
    bar('4', shoreFill[b], 'shore'),
    bar('5', gardenFill[b], 'garden'),
    bar('Mus', musFill[b], `${SECTION(musBar[b])} bar ${String(musBar[b]).padStart(2, '0')}/20`),
    bar('Smp', 0, '0 samples, all code'),
  ];
  const running = Object.values(STATE).filter((fn) => fn(b) !== null).length;
  const right = [
    'C A S T A W A Y',
    '10 hours of lo-fi island.',
    'now and then, a gag.',
    `Tasks: ${ACTS}, ${CHAINED} chained; ${running} running`,
    'Load average: 0.33 0.33 0.33',
    `Uptime: 03:41:${String(Math.floor(b * BEAT)).padStart(2, '0')} of 10:00:00`,
    'Tiers: 2-5m 12-25m 30-60m 3-6h',
    'seed 1992',
  ];
  const lines = left.map((l, i) => `${l}  ${right[i]}`.trimEnd());
  lines.push('');
  lines.push(` ${padL('PID', 4)} ${padR('USER', 8)} ${padR('TIER', 6)} ${padR('EVERY', 7)} ${padR('LASTS', 11)} S  CPU% Command`);
  for (const p of PROCS) {
    const [pid, user, tier, , every, lasts, tree, name] = p;
    const st = STATE[name] ? STATE[name](b) : null;
    const sel = selAt(b) === name ? '>' : ' ';
    lines.push(`${sel}${padL(pid, 4)} ${padR(user, 8)} ${padR(tier, 6)} ${padR(every, 7)} ${padR(lasts, 11)} ${st === null ? 'S' : 'R'} ${padL(st === null ? '0.0' : st, 5)} ${tree}${name}`.trimEnd());
  }
  lines.push('F1Run   F2Gags  F3Tiers F4Sound F5Notes F6Reel  F7Calm -F8Calm +F9Wave  F10Stay');
  const msg = MESSAGES.find(([a, z]) => within([a, z], b));
  lines.push(msg ? `-- ${msg[2]} --` : '[castaway] 0:palmtop* 1:serve.py- 2:schedule.py');
  return check80(lines, 'frozen screen');
}

// F2 Gags: a longer process list. Real activity ids, tiers and timers; the gloss is ours.
const LONG = [
  ['', 'python tools/serve.py', '-', '-', 'the renderer, on 127.0.0.1:8765'],
  ['├─ ', 'idle_music_nod', 'idle', 'between', 'nods to the music. most of it'],
  ['├─ ', 'coconut_sip', 'reg', '2-5m', 'a coconut in the shade, eyes closed'],
  ['├─ ', 'fishing_quiet', 'reg', '2-5m', 'nibbles, nothing. the usual'],
  ['├─ ', 'jog_lap', 'reg', '2-5m', 'the length of the island and back'],
  ['├─ ', 'sandcastle', 'reg', '2-5m', 'stays up until the tide comes'],
  ['│  └─ ', 'tide_takes_sandcastle', 'chain', '+5-30m', 'a bigger wave. gone.'],
  ['├─ ', 'ship_passes_unseen', 'occ', '12-25m', 'crosses while she is busy. unseen'],
  ['├─ ', 'message_in_bottle', 'occ', '12-25m', 'thrown. washes straight back'],
  ['│  └─ ', 'bottle_reply', 'chain', '+1-3h', 'a different bottle. a reply'],
  ['├─ ', 'turtle_visit', 'occ', '12-25m', 'a sea turtle. they both doze off'],
  ['├─ ', 'coconut_crab', 'occ', '12-25m', 'coconut meets crab. coconut leaves'],
  ['├─ ', 'kumara_leafs', 'chain', '+1.5-2.5h', 'her kumara: leafy now. no remarks'],
  ['│  └─ ', 'kumara_flowers', 'chain', '+2-3h', 'pale lavender flowers'],
  ['├─ ', 'cat_visit', 'rare', '30-60m', 'a grey tabby on a crate. palm naps'],
  ['├─ ', 'signal_hunt', 'rare', '30-60m', 'one bar, at the top of the palm'],
  ['├─ ', 'delivery_drone', 'rare', '30-60m', 'the parcel: more headphones'],
  ['│  └─ ', 'box_washed_away', 'chain', '+20-90m', 'the empty box floats off to sea'],
  ['├─ ', 'shark_nod', 'rare', '30-60m', 'a shark in headphones. same beat'],
  ['├─ ', 'tour_boat_selfies', 'rare', '30-60m', 'selfies with her. no lift offered'],
  ['├─ ', 'efoil_bro', 'rare', '30-60m', 'a hydrofoil, a shaka, gone'],
  ['├─ ', 'fire_by_friction', 'rare', '30-60m', 'a flame, at last. then a wave'],
  ['├─ ', 'hammock', 'rare', '30-60m', 'no second tree. tied to the raft'],
  ['├─ ', 'lookout', 'rare', '30-60m', 'the palm bends to ground level'],
  ['├─ ', 'spear_fishing', 'rare', '30-60m', 'a heroic lunge. a miss'],
  ['├─ ', 'rescue_almost', 's.rare', '3-6h', 'waves. a horn toots back. sails on'],
  ['└─ ', 'leave_any_time', 's.rare', '3-6h', 'leaves over the water. iced coffee'],
];
function longList() {
  const lines = [`${padR('COMMAND', 27)} ${padR('TIER', 6)} ${padR('EVERY', 9)} WHAT HAPPENS`];
  for (const [tree, name, tier, every, what] of LONG) {
    lines.push(`${padR(tree + name, 27)} ${padR(tier, 6)} ${padR(every, 9)} ${what}`.trimEnd());
  }
  return check80(lines, 'long list');
}

const HELP = check80([
  'palmtop: a process monitor for one palm, one raft and one person',
  '(not a real program. the island is real enough.)',
  '',
  'Keys',
  '  F1  Run     python tools/serve.py, then open http://127.0.0.1:8765/',
  '  F2  Gags    activities.toml: every activity, its beats, tier and timer',
  '  F3  Tiers   python tools/schedule.py: validate, then simulate 10 hours',
  '  F4  Sound   tools/make_audio.py: every sound, synthesized from code',
  '  F5  Notes   MUSING.md: decisions, rules and open questions',
  '  F6  Reel    python tools/render_demo.py --dev: every activity, with a HUD',
  '  F7  Calm -  disabled',
  '  F8  Calm +  already at maximum',
  '  F9  Wave    for rescue. a ship may toot back. it will not stop.',
  '  F10 Stay    she could leave any time.',
  '',
  'Meters',
  '  0-5    one core per lane: castaway, cat, turtle, sea_sky, shore, garden.',
  '         lanes run in parallel, which is the whole ship joke.',
  '  Mus    where the theme is: 20 bars of 3 s (intro, groove, theme, break).',
  '  Smp    samples used: 0. loops used: 0. recordings used: 0.',
  '  Her    her lane, as history. busy about a third of the time.',
  `  Tasks  ${ACTS} activities on a timer, ${CHAINED} chained (counted 2026-10-01).`,
  '  Uptime island time. the seconds tick. the minutes are not in a hurry.',
  '',
  'Columns',
  '  TIER  idle, reg, occ, rare, s.rare, or chain (started by another)',
  '  EVERY how often the tier comes round; +x: that long after its starter',
  '  LASTS how long one go takes',
  '  S     R running, S sleeping (the cat, mostly)',
  '  CPU%  decoration, like the PIDs and the meter fills.',
  '',
  'The screen',
  '  a 60-second highlight reel, one loop of the theme. in a real run the',
  '  tide comes 5 to 30 minutes after the sandcastle, and the shark is rare.',
  '  the real timings are the LASTS and EVERY columns, from activities.toml.',
], 'help');

const ALT = 'Castaway, drawn as a full-screen terminal process monitor. '
  + 'Top right, CASTAWAY in big rounded capitals shaded coral to sand to sea, over: 10 hours of lo-fi island, now and then, a gag. '
  + 'Top left, six bracketed bar meters, one per schedule lane (castaway, cat, turtle, sea_sky, shore, garden), '
  + 'a music meter stepping through the 20 bars of the theme, and a samples meter reading 0: every sound is code. '
  + 'Below, a process table of activities with their tiers, intervals and durations, under python tools/serve.py at http://127.0.0.1:8765/. '
  + 'In a 60-second loop a ship passes on core 3 while she sips a coconut on core 0, a shark in headphones nods along, '
  + 'and the tide takes a sandcastle, while the status line comments: she will never know.';

const MD = `<!-- Header ${SLUG} for Castaway. Generated by src/${SLUG}.mjs: edit that, not this. -->

<p align="center">
  <img src="assets/${SLUG}.svg" width="100%" alt="${ALT}">
</p>

<h1 align="center">Castaway</h1>

<p align="center">
  <b>A 10-hour lo-fi island video in which almost nothing happens, on purpose.</b><br>
  <sub>Unofficial. Inspired by the small-island routines of the 1992 screensaver <i>Johnny Castaway</i>.</sub>
</p>

**Castaway** (working title) is a stationary-frame lo-fi video for YouTube, in the spirit of the 10-hour lofi streams: a young woman alone on a tiny island with one tall palm, a raft and a lot of time. She mostly idles, nodding to the music on her headphones. Every so often, something happens. Then she goes back to nodding. Sunny, hand-painted, 16:9 at 1080p and 30 fps, and always daytime.

Above is her process monitor. Every lane of the schedule is a core, so a ship can sail past on core 3 while she is busy with a coconut on core 0. She never sees it. ${ACTS} activities wait their turn in four timed tiers, from **regular** (every 2 to 5 minutes) to **super rare** (every 3 to 6 hours), plus chained follow-ups, and each one starts on the next bar of the music, so the gags land on the beat. **Smp: 0.** Every sound is synthesized from code: no samples, no loops, no recordings.

\`\`\`sh
python tools/serve.py               # then open http://127.0.0.1:8765/
python tools/schedule.py            # check the schedule, simulate a 10-hour run
python tools/render_demo.py --dev   # every activity in a row, with a dev HUD
\`\`\`

<p align="center">
  <kbd>F1</kbd>&nbsp;<a href="tools/serve.py">Run</a> &nbsp;
  <kbd>F2</kbd>&nbsp;<a href="activities.toml">Gags</a> &nbsp;
  <kbd>F3</kbd>&nbsp;<a href="tools/schedule.py">Tiers</a> &nbsp;
  <kbd>F4</kbd>&nbsp;<a href="tools/make_audio.py">Sound</a> &nbsp;
  <kbd>F5</kbd>&nbsp;<a href="MUSING.md">Notes</a> &nbsp;
  <kbd>F6</kbd>&nbsp;<a href="tools/render_demo.py">Reel</a> &nbsp;
  <kbd>F7</kbd>&nbsp;Calm&nbsp;- &nbsp;
  <kbd>F8</kbd>&nbsp;Calm&nbsp;+ &nbsp;
  <kbd>F9</kbd>&nbsp;Wave &nbsp;
  <kbd>F10</kbd>&nbsp;Stay
</p>

<details>
<summary><b>F3 Tiers</b>: the schedule, the sound and the renderer, in numbers</summary>
<br>

**The schedule.** [\`activities.toml\`](activities.toml) lists every activity with its step-by-step beats, how long it lasts and how often it comes round. **Regular** every 2 to 5 minutes, **occasional** every 12 to 25, **rare** every 30 to 60, **super rare** every 3 to 6 hours (at most 3 a run). A typical 10-hour run (the median of 200 simulated runs) comes to about 155 regular, 30 occasional, 13 rare and 2 super-rare events, plus about 20 chained follow-ups: the tide comes for the sandcastle, a reply turns up for the bottle. She is busy about a third of the time and idle the rest, hence the load average. Lanes let things overlap, which is the whole ship joke. The default run is 10:00:00 with seed 1992, and [\`tools/schedule.py\`](tools/schedule.py) validates the file and simulates it.

**The sound.** Every sound is synthesized by [\`tools/make_audio.py\`](tools/make_audio.py): no samples, loops or recordings, so no third-party licence applies. The theme is a seamless 60-second loop at 80 BPM in F major (a ii-V-I-vi progression): 20 bars of exactly 3 seconds, electric piano, a kalimba lead, soft drums and vinyl ticks and pops. The ocean is a seamless 60-second loop too. The mix sits at -14 LUFS with true peak at or below -1 dBTP, and levels are adjustable in the master and per routine. Nobody has listened to any of it yet, so no review is offered here.

**The renderer.** A web page ([\`web/index.html\`](web/index.html), served by [\`tools/serve.py\`](tools/serve.py)) with live preview and export to a YouTube-ready MP4. Plain ES modules, no build step, no npm packages. It encodes frame-exact H.264 in the browser with WebCodecs (68 to 78 frames a second at 1080p30 in Chrome), and the server mixes the sound and joins the two. Hard cuts and stepped movement are the defaults. [\`tools/render_demo.py\`](tools/render_demo.py) is the older Python reference renderer; with \`--dev\` it renders a reel of every activity with a heads-up display.

**Status.** In development. No video is out yet, so there is nothing to link to. She is not in a hurry.

</details>

<details>
<summary><b>No pictures?</b> The same screen, frozen at 0:0${Math.floor(HOLD * BEAT)}, in plain text</summary>

\`\`\`text
${frozenScreen()}
\`\`\`

</details>

<details>
<summary><b>F2 Gags</b>: a longer process list (some of these are still waiting for their art)</summary>

\`\`\`text
${longList()}
\`\`\`

</details>

<details>
<summary><b>F1 Help</b>: keys, meters and columns</summary>

\`\`\`text
${HELP}
\`\`\`

<sub>The look borrows the furniture of the bar-meter process monitors and multiplexer status lines that live in the corners of Unix terminals. <code>palmtop</code> is not a real program. Castaway is unofficial and the owner's own work; the 1992 screensaver that inspired it belongs to its owners.</sub>

</details>
`;
if (/[–—]/.test(MD)) throw new Error('en or em dash in the markdown');
fs.writeFileSync(OUT_MD, MD);
console.log(`wrote ${path.relative(process.cwd(), OUT_MD)}: ${(MD.length / 1024).toFixed(1)} KB`);
