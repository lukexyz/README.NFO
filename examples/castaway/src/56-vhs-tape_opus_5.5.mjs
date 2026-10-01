#!/usr/bin/env node
// CASTAWAY README header: "VHS Tape" (56-vhs-tape_opus_5.5).
// Plain Node, no dependencies, fully deterministic (seeded PRNG, no clock reads).
//   node examples/castaway/src/56-vhs-tape_opus_5.5.mjs
// writes examples/castaway/assets/56-vhs-tape_opus_5.5.svg        (the banner: one worn tape)
//    and examples/castaway/assets/56-vhs-tape_opus_5.5-timer.svg  (the VCR's timer menu: the schedule)
//
// THE STYLE is the picture off a worn VHS tape in a dark room, as revived by
// late-night lo-fi and the vaporwave edits: a 4:3 frame with rounded corners on a
// black surround, a blocky on-screen display (PLAY with a triangle, SP under it, a
// two-line date stamp bottom left), a tracking band crawling up the picture with
// the image torn sideways inside it, a ragged head-switching strip along the bottom,
// colour smeared to the right, lifted blacks, scanlines and the odd white dropout.
// Everything here is drawn by this script: the island, her, the crab, the lettering.
// No show footage, no real tape label, no real font.
//
// THE JOKE is generation loss. A ten-hour video in which almost nothing happens has
// one tape-worn patch, and it is this one: a coconut falls on a hermit crab, exactly
// on the bar line, and walks off wearing it, right past her feet. She is nodding to
// the music with her eyes shut. Then somebody presses REW and watches it again.
// The rewind is also what makes the loop seamless: the picture runs backwards at
// five times speed to exactly where it started, so there is no jump to hide.
// The closed captions describe the sound, and every sound in Castaway is made from
// code, so the captions say so.
//
// ONE 18-SECOND LOOP = SIX BARS of the theme (80 BPM, one bar every 3 s):
//   0-15 s  PLAY (blinking for the first bar, then held). The crab walks in; the
//           coconut drops at 6.0 s, on a bar line; at 9.0 s it walks off. A new
//           caption on every bar. The counter ticks once a second.
//  15-18 s  REW at 5x: noise bars roll, the picture runs backwards, the counter
//           spins back, the coconut flies back up into the palm.
// The tracking band (14 s), the head-switching jitter (1.5 s) and the noise flicker
// (0.5 s) run on their own short periods, so they never line up into a visible seam.
//
// LETTERING, no <text> anywhere:
//   * "Tracking Mono": a squared, chamfered monoline capital face on a 5x7 grid,
//     stroked thick with square caps, in the spirit of VCR character generators.
//     Each glyph is defined once in <defs> and placed with <use>.
//   * The title, CASTAWAY, is a heavier wide cut of the same idea (6x8 grid), with a
//     sunny two-tone fill, a deep purple extrude and a red/cyan chroma fringe. It is
//     part of the recording, so it shakes with the picture, but it is never blurred.
//
// prefers-reduced-motion stops everything on 0:11.6 of the loop: PLAY held, the
// coconut walking past her feet, the caption reading [COCONUT FOOTSTEPS].

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const SLUG = '56-vhs-tape_opus_5.5';
const OUT = resolve(here, `../assets/${SLUG}.svg`);
const OUT_TIMER = resolve(here, `../assets/${SLUG}-timer.svg`);

const W = 840; // whole banner
const H = 640;
const FX = 20; // the 4:3 picture, inset on the black surround
const FY = 20;
const FW = 800;
const FH = 600;

const n2 = (v) => +(+v).toFixed(2);
const n1 = (v) => +(+v).toFixed(1);
const P = (pts) => pts.map(([x, y]) => `${n1(x)} ${n1(y)}`).join('L');

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
const rand = mulberry32(1992);
const rr = (a, b) => a + (b - a) * rand();

// ------------------------------------------------------------------ palette
// A sunny island, graded through a tired tape: periwinkle sky, lilac haze, teal shallows,
// pink sand, and blacks that are never black.
const C = {
  surround: '#060409',
  lifted: '#1b1530',
  sky0: '#4d5fcf',
  sky1: '#7b82ea',
  sky2: '#b9a2f0',
  sky3: '#f1c3e8',
  haze: '#ffdcef',
  sun: '#fffbea',
  sunGlow: '#ffe6f6',
  cloud: '#fff6fb',
  cloudShade: '#dcc6f4',
  cloudDeep: '#b9a3ec',
  sea0: '#7a76dc',
  sea1: '#4f6fdc',
  sea2: '#3e8ae2',
  sea3: '#3b9fe4',
  glint: '#d8dcff',
  shallow: '#4cc2da',
  shallow2: '#8be4dd',
  foam: '#ffffff',
  sand: '#f6d6c8',
  sandLit: '#fde8da',
  sandShade: '#e2a7bb',
  wet: '#c99bc4',
  leafLight: '#86e3ad',
  leaf: '#37b48d',
  leafDark: '#21867c',
  leafDeep: '#1a5f70',
  trunk: '#c97f7d',
  trunkLit: '#eaa999',
  trunkDark: '#8e4c6a',
  nut: '#6e3b4b',
  nutLit: '#9a5a63',
  rock: '#a197c8',
  rockDark: '#7a6fa8',
  log: '#b5626f',
  logDark: '#7d3d5c',
  logEnd: '#f2c3ab',
  rope: '#f4e0c4',
  skin: '#f8c4ae',
  skinDark: '#e0a093',
  hair: '#5e3448',
  hairDark: '#45243b',
  coral: '#ff6a6f',
  coralDark: '#d94b65',
  cream: '#fff1dd',
  creamDark: '#dcc0b0',
  ink: '#3a1f3e',
  blush: '#ff8f9f',
  crab: '#ff7c5a',
  crabDark: '#d4515a',
  shell: '#f6abc8',
  shellLine: '#b8628f',
  osd: '#f8f5ff',
  osdShadow: '#120a26',
  cc: '#0a0710',
  ccText: '#fbf8ff',
  tA: '#ffffff',
  tB: '#fff3dc',
  tC: '#ffb48c',
  tD: '#ff6c92',
  tOutline: '#22104a',
  tExtrude: '#3a1a6a',
  red: '#ff3d7a',
  cyan: '#3ff0ff',
};

// ------------------------------------------------------------------ the timeline
const LOOP = 18; // six bars of the theme
const PLAY_END = 15; // five bars of PLAY...
const RATE = 5; // ...then one bar of REW at five times speed
const BEAT = 0.75; // 80 BPM
const STILL = 11.6; // the reduced-motion frame
const SPS = 24; // timeline samples per second
const EPS = 1e-6;
// Where in the recording the picture is at real time t (seconds into the loop).
const fwd = (t) => (t <= PLAY_END ? t : PLAY_END - (t - PLAY_END) * RATE);

const css = [];
let uid = 0;
const decl = (v) => {
  const out = [];
  if (v.x !== undefined || v.y !== undefined) out.push(`transform:translate(${n2(v.x || 0)}px,${n2(v.y || 0)}px)`);
  if (v.o !== undefined) out.push(`opacity:${v.o}`);
  return out.join(';');
};
const attrOf = (v) => {
  let s = '';
  if (v.x !== undefined || v.y !== undefined) s += ` transform="translate(${n2(v.x || 0)} ${n2(v.y || 0)})"`;
  if (v.o !== undefined) s += ` opacity="${v.o}"`;
  return s;
};
// Samples sample(t) -> {x, y, o} across the loop and writes hard-cut keyframes for it.
// Returns the attributes for the element: its class, and its state in the still frame.
function track(sample, { dur = LOOP, still = STILL, sps = SPS } = {}) {
  const name = 'k' + (uid++).toString(36);
  const n = Math.round(dur * sps);
  const frames = [];
  let prev = null;
  for (let i = 0; i <= n; i++) {
    const t = i / sps;
    const v = decl(sample(i === n ? 0 : t));
    if (v !== prev || i === n) {
      frames.push(`${+((i / n) * 100).toFixed(4)}%{${v}}`);
      prev = v;
    }
  }
  css.push(`@keyframes ${name}{${frames.join('')}}.${name}{animation:${name} ${dur}s step-end infinite}`);
  return ` class="${name}"${attrOf(sample(still))}`;
}
const shown = (fn, opts) => track((t) => ({ o: fn(t) ? 1 : 0 }), opts);

// ------------------------------------------------------------------ "Tracking Mono"
// 5x7 grid (x 0..4, y 0..6), polylines stroked 1.2 thick with square caps; closed
// polylines repeat their first point. FILL holds solid shapes, DOTS holds square dots.
const OSD = {
  A: [[[0, 6], [0, 1], [1, 0], [3, 0], [4, 1], [4, 6]], [[0, 3.2], [4, 3.2]]],
  B: [[[0, 0], [3, 0], [4, 1], [4, 2], [3, 3], [0, 3]], [[3, 3], [4, 4], [4, 5], [3, 6], [0, 6], [0, 0]]],
  C: [[[4, 0], [1, 0], [0, 1], [0, 5], [1, 6], [4, 6]]],
  D: [[[0, 0], [3, 0], [4, 1], [4, 5], [3, 6], [0, 6], [0, 0]]],
  E: [[[4, 0], [0, 0], [0, 6], [4, 6]], [[0, 3], [3, 3]]],
  F: [[[4, 0], [0, 0], [0, 6]], [[0, 3], [3, 3]]],
  G: [[[4, 0], [1, 0], [0, 1], [0, 5], [1, 6], [4, 6], [4, 3], [2.2, 3]]],
  H: [[[0, 0], [0, 6]], [[4, 0], [4, 6]], [[0, 3], [4, 3]]],
  I: [[[0.8, 0], [3.2, 0]], [[2, 0], [2, 6]], [[0.8, 6], [3.2, 6]]],
  J: [[[1.5, 0], [4, 0], [4, 5], [3, 6], [1, 6], [0, 5]]],
  K: [[[0, 0], [0, 6]], [[4, 0], [4, 0.8], [1.8, 3], [0, 3]], [[1.8, 3], [4, 5.2], [4, 6]]],
  L: [[[0, 0], [0, 6], [4, 6]]],
  M: [[[0, 6], [0, 0], [2, 2.2], [4, 0], [4, 6]], [[2, 2.2], [2, 3.6]]],
  N: [[[0, 6], [0, 0], [4, 4.6]], [[4, 0], [4, 6]]],
  O: [[[1, 0], [3, 0], [4, 1], [4, 5], [3, 6], [1, 6], [0, 5], [0, 1], [1, 0]]],
  P: [[[0, 6], [0, 0], [3, 0], [4, 1], [4, 2.2], [3, 3.2], [0, 3.2]]],
  Q: [[[1, 0], [3, 0], [4, 1], [4, 5], [3, 6], [1, 6], [0, 5], [0, 1], [1, 0]], [[2.4, 4.4], [4, 6]]],
  R: [[[0, 6], [0, 0], [3, 0], [4, 1], [4, 2.2], [3, 3.2], [0, 3.2]], [[2, 3.2], [4, 5.2], [4, 6]]],
  S: [[[4, 0], [1, 0], [0, 1], [0, 2], [1, 3], [3, 3], [4, 4], [4, 5], [3, 6], [0, 6]]],
  T: [[[0, 0], [4, 0]], [[2, 0], [2, 6]]],
  U: [[[0, 0], [0, 5], [1, 6], [3, 6], [4, 5], [4, 0]]],
  V: [[[0, 0], [0, 3], [2, 6], [4, 3], [4, 0]]],
  W: [[[0, 0], [0, 6], [2, 4], [4, 6], [4, 0]], [[2, 4], [2, 2.6]]],
  X: [[[0, 0], [0, 0.8], [4, 5.2], [4, 6]], [[4, 0], [4, 0.8], [0, 5.2], [0, 6]]],
  Y: [[[0, 0], [0, 1], [2, 3], [4, 1], [4, 0]], [[2, 3], [2, 6]]],
  Z: [[[0, 0], [4, 0], [4, 1], [0, 5], [0, 6], [4, 6]]],
  0: [[[1, 0], [3, 0], [4, 1], [4, 5], [3, 6], [1, 6], [0, 5], [0, 1], [1, 0]], [[1.4, 4], [2.6, 2]]],
  1: [[[0.8, 1.2], [2, 0], [2, 6]], [[0.8, 6], [3.2, 6]]],
  2: [[[0, 1], [1, 0], [3, 0], [4, 1], [4, 2], [3, 3], [1, 3], [0, 4], [0, 6], [4, 6]]],
  3: [[[0, 0], [3, 0], [4, 1], [4, 2], [3, 3], [1.2, 3]], [[3, 3], [4, 4], [4, 5], [3, 6], [0, 6]]],
  4: [[[0, 0], [0, 4], [4, 4]], [[3, 1.6], [3, 6]]],
  5: [[[4, 0], [0, 0], [0, 3], [3, 3], [4, 4], [4, 5], [3, 6], [0, 6]]],
  6: [[[3.4, 0], [1, 0], [0, 1], [0, 5], [1, 6], [3, 6], [4, 5], [4, 4], [3, 3], [0, 3]]],
  7: [[[0, 0], [4, 0], [4, 1.2], [2, 3.4], [2, 6]]],
  8: [[[1, 0], [3, 0], [4, 1], [4, 2], [3, 3], [1, 3], [0, 2], [0, 1], [1, 0]], [[1, 3], [0, 4], [0, 5], [1, 6], [3, 6], [4, 5], [4, 4], [3, 3]]],
  9: [[[4, 3], [1, 3], [0, 2], [0, 1], [1, 0], [3, 0], [4, 1], [4, 5], [3, 6], [0.6, 6]]],
  '-': [[[0.8, 3], [3.2, 3]]],
  '(': [[[3, 0], [2, 1], [2, 5], [3, 6]]],
  ')': [[[1, 0], [2, 1], [2, 5], [1, 6]]],
  '[': [[[3, 0], [1.4, 0], [1.4, 6], [3, 6]]],
  ']': [[[1, 0], [2.6, 0], [2.6, 6], [1, 6]]],
  '/': [[[4, 0], [4, 0.6], [0, 5.4], [0, 6]]],
  "'": [[[2, 0], [2, 1.6]]],
  ',': [[[2, 5.4], [2, 6.2], [1.2, 7]]],
  '+': [[[2, 1.4], [2, 4.6]], [[0.4, 3], [3.6, 3]]],
  '=': [[[0.4, 2], [3.6, 2]], [[0.4, 4], [3.6, 4]]],
  '>': [[[0.6, 0.4], [3.6, 3], [0.6, 5.6]]],
  '<': [[[3.4, 0.4], [0.4, 3], [3.4, 5.6]]],
  '~': [[[0, 3.4], [1, 2.4], [3, 3.6], [4, 2.6]]],
  '%': [[[4, 0], [4, 0.6], [0, 5.4], [0, 6]]],
  '♪': [[[2.8, 4.8], [2.8, 0], [4.2, 1.2]]],
  '■': [],
  '□': [[[0.2, 0.6], [3.8, 0.6], [3.8, 5.4], [0.2, 5.4], [0.2, 0.6]]],
  ' ': [],
  '.': [],
  ':': [],
  '!': [[[2, 0], [2, 3.8]]],
  '?': [[[0, 1], [1, 0], [3, 0], [4, 1], [4, 2], [2, 3.4], [2, 4]]],
  '·': [],
  '▶': [],
  '◀': [],
};
const OSD_FILL = {
  '▶': [[0.2, -0.4], [4.4, 3], [0.2, 6.4]],
  '◀': [[4.2, -0.4], [0, 3], [4.2, 6.4]],
  '■': [[-0.4, 0.2], [4.4, 0.2], [4.4, 5.8], [-0.4, 5.8]],
};
const OSD_DOTS = {
  '.': [[2, 6]],
  ':': [[2, 1.6], [2, 4.6]],
  '!': [[2, 6]],
  '?': [[2, 6]],
  '·': [[2, 3]],
  '%': [[0.6, 0.6], [3.4, 5.4]],
};
const OSD_BLOBS = { '♪': [[1.5, 5, 1.6, 1.25]] }; // ellipses: cx, cy, rx, ry
const OSD_ADV = 7;
const OSD_SW = 1.25;
const oid = (ch) => 'o' + ch.codePointAt(0).toString(16);
const usedOsd = new Set();

function polyD(lines) {
  return lines
    .map((pts) => {
      const closed = pts.length > 2 && pts[0][0] === pts.at(-1)[0] && pts[0][1] === pts.at(-1)[1];
      const p = closed ? pts.slice(0, -1) : pts;
      return 'M' + P(p) + (closed ? 'Z' : '');
    })
    .join('');
}
function osdGlyphDef(ch) {
  let s = `<g id="${oid(ch)}">`;
  if (OSD[ch] && OSD[ch].length) s += `<path fill="none" stroke-linecap="square" stroke-linejoin="miter" stroke-miterlimit="2" d="${polyD(OSD[ch])}"/>`;
  let f = '';
  if (OSD_FILL[ch]) f += 'M' + P(OSD_FILL[ch]) + 'Z';
  for (const [x, y] of OSD_DOTS[ch] || []) f += `M${n2(x - 0.68)} ${n2(y - 0.68)}h1.36v1.36h-1.36Z`;
  if (f) s += `<path stroke="none" d="${f}"/>`;
  for (const [cx, cy, rx, ry] of OSD_BLOBS[ch] || []) s += `<ellipse stroke="none" cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"/>`;
  return s + '</g>';
}
const osdWidth = (str, u) => ([...str].length * OSD_ADV - (OSD_ADV - 4)) * u;

// One run of Tracking Mono with its grid top-left at (x, y), grid unit u.
function osdRun(str, x, y, u, { fill = C.osd, anchor = 'start', extra = '' } = {}) {
  const chars = [...str];
  const w = osdWidth(str, u);
  const x0 = anchor === 'middle' ? x - w / 2 : anchor === 'end' ? x - w : x;
  let s = `<g transform="translate(${n2(x0)} ${n2(y)}) scale(${u})" fill="${fill}" stroke="${fill}" stroke-width="${OSD_SW}"${extra}>`;
  chars.forEach((ch, i) => {
    if (ch === ' ') return;
    if (!(ch in OSD)) throw new Error(`no glyph for "${ch}"`);
    usedOsd.add(ch);
    s += `<use href="#${oid(ch)}"${i ? ` x="${i * OSD_ADV}"` : ''}/>`;
  });
  return s + '</g>';
}
// An on-screen-display line: a soft dark shadow, then the glyphs.
function osdText(str, x, y, u, opts = {}) {
  const d = u * 0.5;
  return osdRun(str, x + d, y + d, u, { ...opts, fill: C.osdShadow, extra: ' opacity=".7"' }) + osdRun(str, x, y, u, opts);
}

// ------------------------------------------------------------------ the title face
// A heavier, wider cut on a 6x8 grid (W is wider), stroked 2.2 thick.
const TITLE = {
  C: [6, [[[6, 0], [1.6, 0], [0, 1.6], [0, 6.4], [1.6, 8], [6, 8]]]],
  A: [6, [[[0, 8], [0, 2], [2, 0], [4, 0], [6, 2], [6, 8]], [[0, 4.9], [6, 4.9]]]],
  S: [6, [[[6, 0], [1.5, 0], [0, 1.5], [0, 2.6], [1.4, 4], [4.6, 4], [6, 5.4], [6, 6.5], [4.5, 8], [0, 8]]]],
  T: [6.4, [[[0, 0], [6.4, 0]], [[3.2, 0], [3.2, 8]]]],
  W: [7.8, [[[0, 0], [0, 6.5], [1.5, 8], [2.4, 8], [3.9, 6.5], [5.4, 8], [6.3, 8], [7.8, 6.5], [7.8, 0]], [[3.9, 3], [3.9, 6.5]]]],
  Y: [6, [[[0, 0], [0, 2.4], [2, 4.4], [4, 4.4], [6, 2.4], [6, 0]], [[3, 4.4], [3, 8]]]],
};
const TITLE_SW = 2.2;
const TITLE_GAP = 3.3;
function titlePath(word) {
  let x = 0;
  let d = '';
  for (const ch of word) {
    const [w, lines] = TITLE[ch];
    d += polyD(lines.map((pts) => pts.map(([px, py]) => [px + x, py])));
    x += w + TITLE_GAP;
  }
  return { d, width: x - TITLE_GAP };
}

// ------------------------------------------------------------------ drawing helpers
const ell = (cx, cy, rx, ry, fill, extra = '') => `<ellipse cx="${n2(cx)}" cy="${n2(cy)}" rx="${n2(rx)}" ry="${n2(ry)}" fill="${fill}"${extra}/>`;
const circ = (cx, cy, r, fill, extra = '') => `<circle cx="${n2(cx)}" cy="${n2(cy)}" r="${n2(r)}" fill="${fill}"${extra}/>`;
const poly = (pts, fill, extra = '') => `<path d="M${P(pts)}Z" fill="${fill}"${extra}/>`;
const line = (pts, stroke, sw, extra = '') => `<path d="M${P(pts)}" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"${extra}/>`;

// Many small rectangles as a few paths, grouped by colour and (bucketed) opacity.
function rectPaths(list) {
  const groups = new Map();
  for (const { x, y, w, h, fill, op } of list) {
    const key = `${fill}|${(Math.round(op * 10) / 10).toFixed(1)}`;
    if (!groups.has(key)) groups.set(key, '');
    groups.set(key, groups.get(key) + `M${n2(x)} ${n2(y)}h${n2(w)}v${n2(h)}h${n2(-w)}z`);
  }
  return [...groups].map(([k, d]) => {
    const [fill, op] = k.split('|');
    return `<path fill="${fill}"${op === '1.0' ? '' : ` opacity="${+op}"`} d="${d}"/>`;
  }).join('');
}

function blob(cx, cy, rx, ry, wob, seed, n = 56) {
  const r = mulberry32(seed);
  const ph = [r() * 6.28, r() * 6.28, r() * 6.28];
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const k = 1 + wob * (0.55 * Math.sin(3 * a + ph[0]) + 0.3 * Math.sin(5 * a + ph[1]) + 0.15 * Math.sin(8 * a + ph[2]));
    pts.push([cx + rx * k * Math.cos(a), cy + ry * k * Math.sin(a)]);
  }
  return pts;
}

// A cumulus heap: overlapping puffs on a flat base, shaded from below.
function cloud(cx, cy, w, h, seed) {
  const r = mulberry32(seed);
  const puffs = [];
  const n = Math.max(4, Math.round(w / 26));
  for (let i = 0; i < n; i++) {
    const u = i / (n - 1);
    const px = cx - w / 2 + u * w;
    const hump = Math.sin(Math.PI * (0.15 + 0.7 * u));
    const pr = (h * 0.42 + h * 0.38 * hump) * (0.8 + 0.35 * r());
    puffs.push([px, cy - pr * 0.55 - h * 0.25 * hump * r(), pr]);
  }
  const base = `<rect x="${n2(cx - w / 2 - 4)}" y="${n2(cy - h * 0.18)}" width="${n2(w + 8)}" height="${n2(h * 0.18 + 2)}" rx="${n2(h * 0.09)}"`;
  let s = `<g>`;
  s += puffs.map(([x, y, pr]) => circ(x + 3, y + 5, pr, C.cloudDeep)).join('') + base.replace('<rect', `<rect fill="${C.cloudDeep}" transform="translate(3 4)"`) + '/>';
  s += puffs.map(([x, y, pr]) => circ(x, y + 2, pr, C.cloudShade)).join('') + base.replace('<rect', `<rect fill="${C.cloudShade}"`) + '/>';
  s += puffs.map(([x, y, pr]) => circ(x - 1.5, y - 1.5, pr * 0.9, C.cloud)).join('');
  return s + '</g>';
}

// A palm frond: a drooping midrib with sawtooth leaflets, light side up.
function frond(cx, cy, angDeg, len, droop, wid, light, dark, rib) {
  const a = (angDeg * Math.PI) / 180;
  const Pt = (s) => [cx + Math.cos(a) * len * s, cy + Math.sin(a) * len * s + droop * len * s * s];
  const Tn = (s) => {
    const dx = Math.cos(a) * len;
    const dy = Math.sin(a) * len + 2 * droop * len * s;
    const m = Math.hypot(dx, dy);
    return [dx / m, dy / m];
  };
  const n = 13;
  let out = '';
  for (const side of [1, -1]) {
    const pts = [Pt(0)];
    for (let k = 1; k <= n; k++) {
      const s1 = k / n;
      const s0 = (k - 0.55) / n;
      const [tx, ty] = Tn(s1);
      const nx = -ty * side;
      const ny = tx * side;
      const w = wid * Math.pow(Math.sin(Math.PI * Math.min(0.97, 0.12 + s1 * 0.85)), 0.75);
      const [px, py] = Pt(Math.min(1, s1));
      const [qx, qy] = Pt(s0);
      const tip = [px + nx * w + tx * w * 0.6, py + ny * w + ty * w * 0.6 + w * 0.45];
      pts.push([qx + nx * w * 0.1, qy + ny * w * 0.1], tip);
    }
    pts.push(Pt(1));
    for (let k = n; k >= 0; k--) pts.push(Pt(k / n));
    const up = -Tn(0.5)[0] * side < 0; // which side faces the sky
    out += poly(pts, up ? light : dark);
  }
  const rib1 = [];
  for (let k = 0; k <= 12; k++) rib1.push(Pt(k / 12));
  out += line(rib1, rib, 1.3);
  return out;
}

// ------------------------------------------------------------------ the island scene
const HORIZON = 300;
const TRUNK_BASE = [474, 446];
const CROWN = [532, 262];
const NUT_HOME = [541, 276]; // the coconut that falls, in the crown
const GROUND = 464; // where the crab walks
const HER = [459, 452]; // her seat, back against the trunk
const ISLE_S = 1.15; // island zoom
const ISLE_C = [412, 470];

function sky() {
  let s = `<rect width="${FW}" height="${HORIZON + 2}" fill="url(#gSky)"/>`;
  // sun high up, posterised glow rings
  const [sx, sy] = [318, 46];
  s += circ(sx, sy, 46, C.sunGlow, ' opacity=".16"') + circ(sx, sy, 34, C.sunGlow, ' opacity=".28"') + circ(sx, sy, 28, C.sunGlow, ' opacity=".5"') + circ(sx, sy, 19, C.sun);
  // two gulls, far off
  s += line([[222, 226], [228, 222], [233, 226], [238, 222], [244, 226]], '#5b4a96', 1.6);
  s += line([[256, 214], [261, 211], [265, 214], [269, 211], [274, 214]], '#5b4a96', 1.4);
  return s;
}
function clouds() {
  // a cloud bank sitting on the horizon, plus a few loose ones; it drifts 1 px every 2 s
  const bank =
    cloud(96, 300, 190, 62, 11) + cloud(250, 302, 120, 40, 12) + cloud(612, 300, 150, 52, 13) + cloud(742, 298, 150, 70, 14) + cloud(400, 303, 90, 22, 15);
  const loose = cloud(130, 236, 96, 26, 16) + cloud(690, 214, 80, 22, 17) + cloud(330, 258, 60, 16, 18);
  const drift = track((t) => ({ x: Math.round(fwd(t) * 0.5) }));
  const drift2 = track((t) => ({ x: Math.round(fwd(t) * 0.8) }));
  return `<g${drift}>${bank}</g><g${drift2}>${loose}</g>`;
}
function sea() {
  let s = `<rect y="${HORIZON}" width="${FW}" height="${FH - HORIZON}" fill="url(#gSea)"/>`;
  s += `<rect y="${HORIZON - 1}" width="${FW}" height="3" fill="${C.haze}" opacity=".85"/>`;
  // two sets of glints, swapped on every beat (stepped shimmer)
  const sets = [[], []];
  const r = mulberry32(77);
  for (let row = 0; row < 22; row++) {
    const v = row / 21;
    const y = HORIZON + 6 + 290 * Math.pow(v, 1.55);
    const len = 4 + 22 * v;
    const count = 7 + Math.round(5 * (1 - v));
    for (let i = 0; i < count; i++) {
      const x = r() * FW;
      const dx = (x - 412) / 345;
      const dy = (y - 459) / 90;
      if (dx * dx + dy * dy < 1) continue; // not over the island and its shallows
      const set = (i + row) % 2;
      const op = n2(0.35 + 0.45 * r());
      sets[set].push({ x, y, w: len * (0.6 + 0.8 * r()), h: 1 + v * 1.6, fill: r() < 0.3 ? C.foam : C.glint, op });
    }
  }
  const beatParity = (t) => Math.floor(fwd(t) / BEAT + EPS) % 2;
  s += `<g${shown((t) => beatParity(t) === 0)}>${rectPaths(sets[0])}</g>`;
  s += `<g${shown((t) => beatParity(t) === 1)}>${rectPaths(sets[1])}</g>`;
  return s;
}
function island() {
  let s = '';
  s += ell(412, 460, 304, 80, C.shallow, ' opacity=".8"');
  s += ell(412, 456, 262, 64, C.shallow2, ' opacity=".85"');
  // foam ring, two dash phases swapped on the beat
  const beatParity = (t) => Math.floor(fwd(t) / BEAT + EPS) % 2;
  const foam = (off) => `<ellipse cx="412" cy="452" rx="232" ry="53" fill="none" stroke="${C.foam}" stroke-width="2.6" stroke-dasharray="18 9 6 9" stroke-dashoffset="${off}" opacity=".9"/>`;
  s += `<g${shown((t) => beatParity(t) === 0)}>${foam(0)}</g><g${shown((t) => beatParity(t) === 1)}>${foam(14)}</g>`;
  // sand: wet rim, shaded body, lit top
  s += poly(blob(412, 449, 222, 49, 0.05, 3), C.wet);
  s += poly(blob(412, 446, 214, 45, 0.05, 3), C.sandShade);
  s += poly(blob(408, 441, 204, 38, 0.05, 3), C.sand);
  s += poly(blob(392, 434, 150, 22, 0.06, 4), C.sandLit, ' opacity=".9"');
  // ripples in the sand
  s += line([[300, 452], [318, 450], [336, 452]], C.sandShade, 1.2, ' opacity=".7"');
  s += line([[560, 444], [578, 442], [596, 444]], C.sandShade, 1.2, ' opacity=".7"');
  s += line([[352, 470], [372, 468], [392, 470]], C.sandShade, 1.2, ' opacity=".6"');
  // rocks
  s += ell(290, 482, 14, 7, C.rockDark) + ell(288, 480, 12, 5.5, C.rock);
  s += ell(560, 486, 10, 5, C.rockDark) + ell(559, 484.5, 8.5, 4, C.rock);
  return s;
}
// Low tropical plants: a fan of pointed leaf blades.
function bushes(xs) {
  let s = '';
  for (const [cx, cy, sc] of xs) {
    const r = mulberry32(Math.round(cx * 7 + cy));
    s += ell(cx + 2, cy + 1, 15 * sc, 3.6 * sc, C.sandShade, ' opacity=".9"');
    const n = 9;
    for (let pass = 0; pass < 2; pass++) {
      for (let i = 0; i < n; i++) {
        const a = Math.PI * (1.06 + 0.88 * (i / (n - 1))) + (r() - 0.5) * 0.2;
        const L = (13 + 7 * Math.sin(Math.PI * (i / (n - 1))) + r() * 4) * sc * (pass ? 0.78 : 1);
        const droop = 0.35 * L * Math.abs(Math.cos(a));
        const tip = [cx + Math.cos(a) * L, cy + Math.sin(a) * L + droop];
        const mid = [cx + Math.cos(a) * L * 0.5, cy + Math.sin(a) * L * 0.5 + droop * 0.2];
        const nx = -Math.sin(a);
        const ny = Math.cos(a);
        const w = 3.2 * sc;
        const fill = pass ? (i % 2 ? C.leaf : C.leafLight) : i % 2 ? C.leafDeep : C.leafDark;
        s += `<path d="M${n2(cx)} ${n2(cy)}Q${n2(mid[0] + nx * w)} ${n2(mid[1] + ny * w)} ${n2(tip[0])} ${n2(tip[1])}Q${n2(mid[0] - nx * w)} ${n2(mid[1] - ny * w)} ${n2(cx)} ${n2(cy)}Z" fill="${fill}"/>`;
      }
    }
  }
  return s;
}
function raft() {
  let s = ell(672, 486, 62, 9, '#2f6fb4', ' opacity=".35"');
  for (let i = 0; i < 6; i++) {
    const y = 458 + i * 5.2;
    const x0 = 622 + i * 3.2;
    const x1 = 714 + i * 1.6;
    s += line([[x0, y + 1.6], [x1, y - 3.4]], C.logDark, 6.4);
    s += line([[x0, y], [x1, y - 5]], C.log, 4.6);
    s += line([[x0 + 4, y - 1.4], [x1 - 6, y - 6]], C.trunkLit, 1.1, ' opacity=".55"');
    s += ell(x1 + 0.5, y - 4.2, 2.6, 3, C.logEnd);
  }
  s += line([[638, 452], [650, 486]], C.rope, 1.8) + line([[694, 448], [704, 482]], C.rope, 1.8);
  return s;
}
function palm(layer) {
  if (layer === 'trunk') {
    const [bx, by] = TRUNK_BASE;
    const [kx, ky] = [496, 352];
    const [tx, ty] = [CROWN[0] - 2, CROWN[1] + 6];
    const Q = (s) => [(1 - s) * (1 - s) * bx + 2 * (1 - s) * s * kx + s * s * tx, (1 - s) * (1 - s) * by + 2 * (1 - s) * s * ky + s * s * ty];
    const Qd = (s) => {
      const dx = 2 * (1 - s) * (kx - bx) + 2 * s * (tx - kx);
      const dy = 2 * (1 - s) * (ky - by) + 2 * s * (ty - ky);
      const m = Math.hypot(dx, dy);
      return [dx / m, dy / m];
    };
    const left = [];
    const right = [];
    const N = 28;
    for (let i = 0; i <= N; i++) {
      const sv = i / N;
      const [x, y] = Q(sv);
      const [dx, dy] = Qd(sv);
      const w = (i === 0 ? 10.5 : 8.6 - 3.4 * sv) + (i < 2 ? 2 : 0);
      left.push([x + dy * w, y - dx * w]);
      right.push([x - dy * w, y + dx * w]);
    }
    let s = ell(bx + 8, by + 4, 26, 6, C.sandShade, ' opacity=".9"');
    s += poly([...left, ...right.reverse()], C.trunk);
    // lit strip down the left side
    const lit = [];
    for (let i = 0; i <= N; i++) {
      const sv = i / N;
      const [x, y] = Q(sv);
      const [dx, dy] = Qd(sv);
      const w = 8.6 - 3.4 * sv;
      lit.push([x + dy * w * 0.55, y - dx * w * 0.55]);
    }
    s += line(lit, C.trunkLit, 3.2, ' opacity=".75"');
    // ring marks
    let rings = '';
    for (let sv = 0.05; sv < 0.97; sv += 0.058) {
      const [x, y] = Q(sv);
      const [dx, dy] = Qd(sv);
      const w = 8.6 - 3.4 * sv;
      rings += `M${n2(x + dy * w)} ${n2(y - dx * w)}Q${n2(x + dx * 2.4)} ${n2(y + dy * 2.4 + 2.2)} ${n2(x - dy * w)} ${n2(y + dx * w)}`;
    }
    s += `<path d="${rings}" fill="none" stroke="${C.trunkDark}" stroke-width="1.5" opacity=".8"/>`;
    return s;
  }
  const [cx, cy] = CROWN;
  if (layer === 'back') {
    return (
      frond(cx, cy, -150, 92, 0.55, 15, C.leaf, C.leafDeep, C.leafDark) +
      frond(cx, cy, -112, 64, 0.95, 12, C.leaf, C.leafDeep, C.leafDark) +
      frond(cx, cy, -62, 68, 0.9, 12, C.leaf, C.leafDeep, C.leafDark) +
      frond(cx, cy, -26, 96, 0.55, 15, C.leaf, C.leafDeep, C.leafDark)
    );
  }
  if (layer === 'nuts') {
    return circ(cx - 9, cy + 9, 7, C.nut) + circ(cx - 11, cy + 7, 2.6, C.nutLit) + circ(cx + 1, cy + 13, 7, C.nut) + circ(cx - 1, cy + 11, 2.6, C.nutLit);
  }
  return (
    frond(cx, cy, -176, 104, 0.72, 16, C.leafLight, C.leafDark, C.leaf) +
    frond(cx, cy, 158, 76, 0.55, 14, C.leafLight, C.leafDark, C.leaf) +
    frond(cx, cy, -94, 50, 1.25, 12, C.leafLight, C.leafDark, C.leaf) +
    frond(cx, cy, 2, 104, 0.72, 16, C.leafLight, C.leafDark, C.leaf) +
    frond(cx, cy, 30, 78, 0.55, 14, C.leafLight, C.leafDark, C.leaf) +
    circ(cx, cy + 2, 6, C.leafDark)
  );
}

// Her: sitting with her back to the trunk, knees up, eyes shut, nodding on the beat.
// Drawn facing +x in local units, then mirrored to face left, away from the palm.
function her() {
  const nod = track((t) => {
    const f = fwd(t);
    const ph = (((f % BEAT) + BEAT) % BEAT) / BEAT;
    return { y: ph < 0.34 ? 1.4 : 0 };
  });
  const sk = C.skin;
  let s = `<g transform="translate(${HER[0]} ${HER[1]}) scale(-1.28 1.28)">`;
  s += ell(14, 1.2, 24, 3.6, '#b77ea2', ' opacity=".45"');
  // far arm and far leg (in shade)
  s += line([[2, -26], [9, -17], [19, -22]], C.skinDark, 4);
  s += line([[4, -8], [18, -22], [24, -2]], C.skinDark, 6);
  s += line([[24, -2], [30, -1.2]], C.skinDark, 3.4);
  // torso: coral tank top, cream shorts
  s += poly([[-6, -6], [8, -6], [6.5, -27], [3, -31], [-3, -31], [-6.2, -27]], C.coral);
  s += poly([[-6, -6], [-1.5, -6], [-3, -27], [-6.2, -27]], C.coralDark, ' opacity=".7"');
  s += line([[-2.6, -31], [-2.6, -33.2]], C.coral, 1.4) + line([[2.6, -31], [2.6, -33.2]], C.coral, 1.4);
  s += poly([[-6.6, -8], [9, -8], [16, -15], [20, -10], [10, -1.5], [-6.6, -1.5]], C.cream);
  s += line([[-6, -1.6], [10, -1.6]], C.creamDark, 1.2, ' opacity=".8"');
  // near leg: thigh out of the shorts, shin, foot
  s += line([[15, -14], [19.5, -21]], sk, 6.6);
  s += line([[19.5, -21], [26, -2]], sk, 5.6);
  s += line([[25, -1.5], [32, -0.8]], sk, 3.6);
  // near arm, resting on the knee
  s += line([[1, -26], [7.5, -15.5], [18, -19.5]], sk, 4.2);
  s += circ(18.6, -19.6, 2.3, sk);
  // neck
  s += line([[0.5, -31], [1.6, -35]], sk, 4.2);
  // the head nods
  s += `<g${nod}>`;
  s += `<path d="M-3.5 -48C-1 -53.5 7.5 -53.5 9.8 -46.5L10.2 -44.4L-8 -38.5Z" fill="${C.hair}"/>`;
  s += circ(1.6, -42.5, 8.7, sk);
  s += circ(10, -41.6, 1.8, sk);
  s += `<path d="M-7.2 -38.4C-8.8 -44 -6 -51.2 1.6 -51.4C6.5 -51.6 10 -48.6 10.4 -45.6C7.6 -47.6 4 -47.2 2 -45.6C-0.6 -43.4 -1.6 -40.2 -3 -35.4Z" fill="${C.hair}"/>`;
  s += circ(-7.4, -35.6, 4.6, C.hairDark) + circ(-8.4, -36.8, 1.8, C.hair);
  s += line([[5.2, -42.4], [6.6, -41.6], [8, -42.4]], C.ink, 1.05);
  s += ell(6.6, -38.9, 1.9, 1.05, C.blush, ' opacity=".75"');
  s += line([[7.2, -36.2], [8.4, -36.6]], C.ink, 0.9);
  // headphones: band over the top, a cream cup over the ear
  s += `<path d="M-1.6 -42C-2.6 -49.6 2 -54.4 7.2 -52.4" fill="none" stroke="${C.cream}" stroke-width="2.4" stroke-linecap="round"/>`;
  s += ell(-0.6, -41.2, 3.8, 4.8, C.cream, ` stroke="${C.creamDark}" stroke-width=".9"`);
  s += ell(-0.2, -41.2, 1.6, 2.6, C.creamDark, ' opacity=".55"');
  s += '</g></g>';
  return s;
}

// The hermit crab walks in from the raft side, stepping on the half-beat.
function crabShape(legsPhase) {
  const legs = legsPhase
    ? [[[-4, -3], [-7, 0]], [[-1, -3], [-2, 0.4]], [[2, -3], [4, 0]], [[5, -3], [8, -0.4]]]
    : [[[-4, -3], [-6, 0.4]], [[-1, -3], [-3, 0]], [[2, -3], [3, 0.4]], [[5, -3], [9, 0]]];
  return legs.map((l) => line(l, C.crabDark, 1.6)).join('');
}
function crabBody() {
  let s = '';
  s += ell(0, 1, 11, 2.4, '#b77ea2', ' opacity=".4"');
  s += circ(-8, -4.6, 3, C.crab) + circ(-9.4, -5.4, 1.4, '#ffb39a');
  s += line([[-6, -6], [-7, -11]], C.crabDark, 1.2) + line([[-4, -6.5], [-4.2, -11.6]], C.crabDark, 1.2);
  s += circ(-7, -11.6, 1.5, C.ink) + circ(-4.2, -12.2, 1.5, C.ink);
  s += circ(2, -8, 7.4, C.shell) + `<path d="M2 -8m-4.6 0a4.6 4.6 0 1 1 4.6 4.6a2.8 2.8 0 1 1 -2.4 -4.4" fill="none" stroke="${C.shellLine}" stroke-width="1.3"/>`;
  s += circ(-0.2, -11.6, 1.4, '#fff', ' opacity=".7"');
  return s;
}
function nutShape() {
  return ell(0, -8.6, 8.6, 7.8, C.nut) + ell(-2.6, -11.4, 3.2, 2.2, C.nutLit, ' opacity=".9"') + circ(-3, -7, 1, '#3c1f2e') + circ(-0.6, -6, 1, '#3c1f2e') + circ(-2.2, -4.8, 1, '#3c1f2e');
}

const CRAB_FROM = 608;
const CRAB_TO = NUT_HOME[0];
const STEP = 0.375; // half a beat
const ACT_S = 1.3; // the crab and the coconut, drawn a touch larger than life
function crabX(f) {
  const k = Math.min(12, Math.floor(f / STEP + EPS));
  return CRAB_FROM - ((CRAB_FROM - CRAB_TO) * k) / 12;
}
function nutPos(f) {
  if (f < 5.55) return [NUT_HOME[0], NUT_HOME[1] + 8.6];
  if (f < 6) {
    const k = Math.floor((f - 5.55) / 0.15 + EPS); // 0,1,2
    const v = [0.18, 0.48, 0.8][Math.min(2, k)];
    return [NUT_HOME[0], NUT_HOME[1] + 8.6 + (GROUND - NUT_HOME[1] - 8.6) * v];
  }
  if (f < 9) return [NUT_HOME[0], GROUND];
  const k = Math.min(16, Math.floor((f - 9) / STEP + EPS));
  return [NUT_HOME[0] - k * 15.5, GROUND + Math.min(k, 4) * 1.4];
}
function actors() {
  let s = '';
  // the crab, before the bonk
  const crabMove = track((t) => {
    const f = fwd(t);
    return { x: crabX(f), y: GROUND, o: f < 6 ? 1 : 0 };
  });
  const stepPar = (t) => Math.floor(fwd(t) / STEP + EPS) % 2;
  const walking = (t) => fwd(t) < 4.5;
  s += `<g${crabMove}><g transform="scale(${ACT_S})">${crabBody()}<g${shown((t) => !walking(t) || stepPar(t) === 0)}>${crabShape(0)}</g><g${shown((t) => walking(t) && stepPar(t) === 1)}>${crabShape(1)}</g></g></g>`;
  // the coconut: in the crown, falling, sitting, then walking off on crab legs
  const nutMove = track((t) => {
    const [x, y] = nutPos(fwd(t));
    return { x, y };
  });
  const legsOut = (t) => fwd(t) >= 8.25;
  const walk2 = (t) => fwd(t) >= 9;
  const par2 = (t) => Math.floor((fwd(t) - 9) / STEP + EPS) % 2;
  let legs = `<g${shown((t) => legsOut(t) && (!walk2(t) || par2(t) === 0))}>${crabShape(0)}</g>`;
  legs += `<g${shown((t) => legsOut(t) && walk2(t) && par2(t) === 1)}>${crabShape(1)}</g>`;
  const eyes = `<g${shown(legsOut)}>${line([[-6, -9], [-8.6, -14]], C.crabDark, 1.2)}${line([[-3.4, -10], [-4.4, -15]], C.crabDark, 1.2)}${circ(-8.6, -14.4, 1.5, C.ink)}${circ(-4.4, -15.4, 1.5, C.ink)}</g>`;
  const nutStr = `<g${nutMove}><g transform="scale(${ACT_S})">${legs}${nutShape()}${eyes}</g></g>`;
  // the bonk: impact lines for half a second on the bar line
  const bonk = shown((t) => {
    const f = fwd(t);
    return f >= 6 && f < 6.6;
  });
  const [bx, by] = [NUT_HOME[0], GROUND - 11];
  const star = [];
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2 - Math.PI / 2;
    const rad = i % 2 ? 9 : 19 + (i % 4 === 0 ? 4 : 0);
    star.push([bx + Math.cos(a) * rad * 1.15, by + Math.sin(a) * rad * 0.9]);
  }
  let rays = poly(star, '#fff7d6', ` stroke="${C.coralDark}" stroke-width="1.4" stroke-linejoin="round"`);
  for (let i = 0; i < 5; i++) {
    const a = Math.PI * (1.15 + (i / 4) * 0.7);
    rays += line([[bx + Math.cos(a) * 25, by + Math.sin(a) * 21], [bx + Math.cos(a) * 33, by + Math.sin(a) * 28]], C.foam, 2.4);
  }
  s += `<g${bonk}>${rays}</g>` + nutStr;
  return s;
}

// The title card: recorded onto the tape, so it shakes with the picture; never blurred.
function title() {
  const { d, width } = titlePath('CASTAWAY');
  const U = 7.55;
  const skew = Math.tan((9 * Math.PI) / 180);
  const top = 90;
  const x0 = FW / 2 - (width * U) / 2 + (skew * 8 * U) / 2;
  let s = `<g transform="translate(${n2(x0)} ${top}) scale(${U}) skewX(-9)" fill="none" stroke-linecap="square" stroke-linejoin="miter" stroke-miterlimit="3">`;
  const layer = (dx, dy, stroke, sw, extra = '') => `<use href="#tw" transform="translate(${n2(dx)} ${n2(dy)})" stroke="${stroke}" stroke-width="${sw}"${extra}/>`;
  for (let k = 4; k >= 1; k--) s += layer(k * 0.24, k * 0.3, C.tExtrude, TITLE_SW + 1);
  s += layer(0, 0, C.tOutline, TITLE_SW + 1.1);
  s += layer(-0.32, 0, C.red, TITLE_SW, ' opacity=".9"');
  s += layer(0.32, 0, C.cyan, TITLE_SW, ' opacity=".9"');
  s += layer(0, 0, 'url(#gTitle)', TITLE_SW);
  s += '</g>';
  // the strapline underneath, in Tracking Mono
  s += osdText('A TEN-HOUR LO-FI ISLAND VIDEO', FW / 2, 185, 2.35, { anchor: 'middle', fill: '#fff4ea' });
  return s;
}

// ------------------------------------------------------------------ on-screen display
const OSD_U = 3.1;
const COUNTER0 = 4 * 3600 + 21 * 60 + 57;
const hms = (v) => `${Math.floor(v / 3600)}:${String(Math.floor(v / 60) % 60).padStart(2, '0')}:${String(v % 60).padStart(2, '0')}`;
function osd() {
  let s = '';
  // PLAY, blinking at 1 Hz for the first bar, then held; REW for the last bar
  const play = shown((t) => t < PLAY_END && (t >= 3 || t % 1 < 0.5));
  s += `<g${play}>${osdText('PLAY ▶', 40, 38, OSD_U)}</g>`;
  s += `<g${shown((t) => t >= PLAY_END)}>${osdText('◀◀ REW', 40, 38, OSD_U)}</g>`;
  s += osdText('SP', 40, 72, OSD_U);
  // tape counter, top right: one second a second, then spun back by the rewind
  for (let k = 0; k <= PLAY_END; k++) {
    const vis = shown((t) => Math.min(PLAY_END, Math.floor(fwd(t) + EPS)) === k);
    s += `<g${vis}>${osdText(hms(COUNTER0 + k), 762, 38, OSD_U, { anchor: 'end' })}</g>`;
  }
  // the date stamp, bottom left: the clock was never set, so it says noon and blinks
  s += osdText('PM', 40, 522, OSD_U);
  s += `<g class="blink">${osdText('12:00', 40 + 3 * OSD_ADV * OSD_U, 522, OSD_U)}</g>`;
  s += osdText('JAN. 01 1992', 40, 554, OSD_U);
  return s;
}

// Closed captions: decoded by the television, so they sit still while the tape wobbles.
const CAPTIONS = [
  ['♪ KALIMBA, 80 BPM ♪', '[MADE FROM CODE]'],
  ['[SYNTHESIZED SURF]', '[CRAB FEET TICKING]'],
  ['[BONK]', '(ON THE BEAT)'],
  ['[COCONUT', 'FOOTSTEPS]'],
  ['♪ KALIMBA CONTINUES ♪', '[SHE MISSED IT]'],
];
const CC_U = 2.45;
function captions() {
  let s = '';
  const right = 762;
  const rowH = 30;
  const bottom = 576;
  CAPTIONS.forEach((rows, i) => {
    const vis = shown((t) => t < PLAY_END && Math.floor(t / 3 + EPS) === i);
    let g = '';
    rows.forEach((row, r) => {
      const y = bottom - (rows.length - r) * rowH;
      const w = osdWidth(row, CC_U);
      const pad = 9;
      g += `<rect x="${n2(right - w - pad * 2)}" y="${n2(y)}" width="${n2(w + pad * 2)}" height="${rowH}" fill="${C.cc}" opacity=".86"/>`;
      g += osdRun(row, right - pad, y + (rowH - 6 * CC_U) / 2, CC_U, { anchor: 'end', fill: C.ccText });
    });
    s += `<g${vis}>${g}</g>`;
  });
  return s;
}

// ------------------------------------------------------------------ tape defects
// White and dark streaks in a strip of the given height, NF frames for flicker.
function noiseFrames(seed, w, h, count, nf, { x0 = 0, dark = 0.25, maxLen = 70, op = [0.35, 0.95] } = {}) {
  const r = mulberry32(seed);
  const frames = [];
  for (let f = 0; f < nf; f++) {
    const list = [];
    for (let i = 0; i < count; i++) {
      const len = 3 + r() * maxLen * (r() < 0.2 ? 2.2 : 1);
      const x = x0 + r() * w;
      const y = Math.floor(r() * h);
      const hh = r() < 0.7 ? 1 : 2;
      const fill = r() < dark ? '#241a3c' : '#ffffff';
      list.push({ x, y, w: len, h: hh, fill, op: op[0] + (op[1] - op[0]) * r() });
    }
    frames.push(rectPaths(list));
  }
  return frames;
}
function flicker(frames, period) {
  const nf = frames.length;
  // each frame is shown for 1/nf of the period, staggered so exactly one is up at a time
  const kf = `@keyframes nz${nf}{0%{opacity:1}${n2(100 / nf)}%{opacity:0}100%{opacity:0}}.nz${nf}{animation-name:nz${nf};animation-timing-function:step-end;animation-iteration-count:infinite}`;
  if (!css.includes(kf)) css.push(kf);
  return frames.map((f, i) => `<g class="nz${nf}" style="animation-duration:${period}s;animation-delay:${n2((-i * period) / nf)}s" opacity="${i === 0 ? 1 : 0}">${f}</g>`).join('');
}

const BAND_H = 12;
const BAND_SHIFT = 24;
const BAND_PERIOD = 14;
const BAND_STILL = 470;
const HS_H = 16; // head-switching strip
function trackingBand() {
  // the band crawls up the frame at 15 steps a second; inside it, the picture is torn
  // sideways and streaked. Two transforms with identical timing cancel for the copy.
  const steps = BAND_PERIOD * 15;
  css.push(`@keyframes band{from{transform:translate(0,${FH + 4}px)}to{transform:translate(0,${-BAND_H - 4}px)}}`);
  css.push(`@keyframes bandc{from{transform:translate(${BAND_SHIFT}px,${-FH - 4}px)}to{transform:translate(${BAND_SHIFT}px,${BAND_H + 4}px)}}`);
  css.push(`.band{animation:band ${BAND_PERIOD}s steps(${steps}) infinite}.bandc{animation:bandc ${BAND_PERIOD}s steps(${steps}) infinite}`);
  const nz = noiseFrames(404, FW, BAND_H, 22, 4, { maxLen: 90, dark: 0.15 });
  let s = `<g class="band" transform="translate(0 ${BAND_STILL})">`;
  s += `<g clip-path="url(#cBand)"><use href="#pic" class="bandc" transform="translate(${BAND_SHIFT} ${-BAND_STILL})"/>`;
  s += `<rect width="${BAND_SHIFT}" height="${BAND_H}" fill="${C.lifted}"/>`;
  s += `<rect width="${FW}" height="${BAND_H}" fill="#e9e4ff" opacity=".16"/></g>`;
  s += flicker(nz, 0.5);
  s += `<rect y="-1" width="${FW}" height="1" fill="#ffffff" opacity=".22"/>`;
  return s + '</g>';
}
function headSwitch() {
  // the bottom scanlines, torn sideways in two steps and ragged, jittering at 8 fps
  const y0 = FH - HS_H;
  const shifts = [16, 22, 14, 26, 19, 12, 24, 17, 21, 15, 27, 18];
  const k1 = shifts.map((v, i) => `${n2((i / shifts.length) * 100)}%{transform:translate(${v}px,0)}`).join('');
  const k2 = shifts.map((v, i) => `${n2((i / shifts.length) * 100)}%{transform:translate(${Math.round(v * 0.4)}px,0)}`).join('');
  css.push(`@keyframes hs1{${k1}100%{transform:translate(${shifts[0]}px,0)}}@keyframes hs2{${k2}100%{transform:translate(${Math.round(shifts[0] * 0.4)}px,0)}}`);
  css.push(`.hs1{animation:hs1 1.5s step-end infinite}.hs2{animation:hs2 1.5s step-end infinite}`);
  let s = `<g clip-path="url(#cHs2)"><use href="#pic" class="hs2" transform="translate(6 0)"/></g>`;
  s += `<g clip-path="url(#cHs1)"><use href="#pic" class="hs1" transform="translate(16 0)"/></g>`;
  s += `<rect y="${y0}" width="${FW}" height="${HS_H}" fill="#f1ecff" opacity=".13"/>`;
  s += `<rect y="${y0}" width="${FW}" height="1" fill="#ffffff" opacity=".35"/>`;
  const nz = noiseFrames(505, FW, HS_H, 46, 4, { maxLen: 70, dark: 0.35, op: [0.45, 1] });
  s += `<g transform="translate(0 ${y0})">${flicker(nz, 0.5)}</g>`;
  return s;
}
function rewindBars() {
  // during REW: noise bars rolling down the frame and a washed-out picture
  const nz = noiseFrames(606, FW + 300, 34, 190, 2, { x0: -150, maxLen: 36, dark: 0.4, op: [0.5, 1] });
  let bar = `<rect x="-160" width="${FW + 320}" height="34" fill="#ebe6ff" opacity=".5"/><rect x="-160" y="34" width="${FW + 320}" height="10" fill="#1b1530" opacity=".22"/>${flicker(nz, 0.25)}`;
  css.push(`@keyframes roll{from{transform:translate(0,0)}to{transform:translate(0,200px)}}.roll{animation:roll 1s steps(12) infinite}`);
  let s = `<g${shown((t) => t >= PLAY_END)}>`;
  s += `<rect width="${FW}" height="${FH}" fill="#d8ccff" opacity=".12"/>`;
  s += `<g class="roll">`;
  for (let i = -1; i < 3; i++) s += `<g transform="translate(${(i * 37) % 60} ${30 + i * 200})">${bar}</g>`;
  s += '</g></g>';
  return s;
}
function dropouts() {
  // one-line white dropouts, each for a single frame or two
  const at = [1.7, 4.15, 7.4, 10.3, 13.05, 16.2];
  let s = '';
  at.forEach((t0, i) => {
    const r = mulberry32(900 + i);
    const y = 60 + r() * 460;
    const x = r() * 640;
    const w = 40 + r() * 150;
    const vis = shown((t) => t >= t0 && t < t0 + 2 / 24);
    s += `<rect${vis} x="${n2(x)}" y="${n2(y)}" width="${n2(w)}" height="1.6" fill="#fff"/>`;
  });
  return s;
}
function chromaNoise() {
  // faint static streaks of colour across the picture: the tape's chroma noise
  const r = mulberry32(321);
  const list = [];
  for (let i = 0; i < 110; i++) {
    const y = Math.floor(r() * FH);
    const x = r() * FW;
    const w = 20 + r() * 140;
    list.push({ x, y, w, h: 1, fill: r() < 0.5 ? '#ff5fd0' : '#5fe6ff', op: 0.06 + r() * 0.06 });
  }
  return rectPaths(list);
}
function jitter() {
  // the whole picture slips a pixel or two sideways now and then; more during REW
  const r = mulberry32(55);
  const rew = [];
  for (let i = 0; i < 36; i++) rew.push(Math.round(r() * 6 - 3));
  return track((t) => {
    if (t >= PLAY_END) return { x: rew[Math.floor((t - PLAY_END) * 12) % 36] };
    for (const [a, b, v] of [[2.1, 2.25, 2], [5.4, 5.5, -1], [7.9, 8.05, 2], [11.0, 11.12, 1], [13.6, 13.8, -2]]) if (t >= a && t < b) return { x: v };
    return { x: 0 };
  });
}

// ------------------------------------------------------------------ assemble the banner
function banner() {
  const isle = island() + bushes([[402, 432, 1.1], [520, 440, 0.9], [330, 446, 0.8]]) + raft() + palm('back') + palm('trunk') + palm('nuts') + her() + actors() + palm('front');
  // the camera sits a little closer than the island was drawn: scale it up about its waterline
  const scene = sky() + clouds() + sea() + `<g transform="translate(${n2(ISLE_C[0] * (1 - ISLE_S))} ${n2(ISLE_C[1] * (1 - ISLE_S))}) scale(${ISLE_S})">${isle}</g>`;
  const pic = `<g id="scene">${scene}</g><g id="ttl">${title()}</g>`;
  const osdLayer = osd() + captions();

  const defs = `<defs>
<linearGradient id="gSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.sky0}"/><stop offset=".42" stop-color="${C.sky1}"/><stop offset=".78" stop-color="${C.sky2}"/><stop offset=".96" stop-color="${C.sky3}"/><stop offset="1" stop-color="${C.haze}"/></linearGradient>
<linearGradient id="gSea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.sea0}"/><stop offset=".12" stop-color="${C.sea1}"/><stop offset=".55" stop-color="${C.sea2}"/><stop offset="1" stop-color="${C.sea3}"/></linearGradient>
<linearGradient id="gTitle" gradientUnits="userSpaceOnUse" x1="0" y1="-1.1" x2="0" y2="9.1"><stop offset="0" stop-color="${C.tA}"/><stop offset=".48" stop-color="${C.tB}"/><stop offset=".5" stop-color="${C.tC}"/><stop offset="1" stop-color="${C.tD}"/></linearGradient>
<radialGradient id="gVig" cx=".5" cy=".5" r=".72"><stop offset=".6" stop-color="#1a0b33" stop-opacity="0"/><stop offset="1" stop-color="#1a0b33" stop-opacity=".55"/></radialGradient>
<linearGradient id="gGlare" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".10"/><stop offset=".35" stop-color="#fff" stop-opacity="0"/></linearGradient>
<pattern id="pScan" width="8" height="3" patternUnits="userSpaceOnUse"><rect width="8" height="1.1" fill="#12062a" opacity=".15"/></pattern>
<clipPath id="cFrame"><rect width="${FW}" height="${FH}" rx="30"/></clipPath>
<clipPath id="cBand"><rect width="${FW}" height="${BAND_H}"/></clipPath>
<clipPath id="cHs1"><rect y="${FH - HS_H / 2}" width="${FW}" height="${HS_H / 2}"/></clipPath>
<clipPath id="cHs2"><rect y="${FH - HS_H}" width="${FW}" height="${HS_H / 2}"/></clipPath>
<path id="tw" d="${titlePath('CASTAWAY').d}"/>
${[...usedOsd].map(osdGlyphDef).join('\n')}
</defs>`;

  const jit = jitter();
  const body =
    `<rect width="${W}" height="${H}" rx="24" fill="${C.surround}"/>` +
    `<g transform="translate(${FX} ${FY})"><g clip-path="url(#cFrame)">` +
    `<rect width="${FW}" height="${FH}" fill="${C.lifted}"/>` +
    `<g${jit}><g id="pic">${pic}</g>` +
    // chroma smear: the colour picture again, nudged right and faint
    `<use href="#scene" transform="translate(5 0)" opacity=".2"/><use href="#scene" transform="translate(10 0)" opacity=".08"/></g>` +
    chromaNoise() +
    trackingBand() +
    headSwitch() +
    rewindBars() +
    dropouts() +
    `<g stroke-linecap="square" stroke-linejoin="miter" stroke-miterlimit="2">${osdLayer}</g>` +
    `<rect width="${FW}" height="${FH}" fill="url(#pScan)"/>` +
    `<rect width="${FW}" height="${FH}" fill="url(#gVig)"/>` +
    `<rect width="${FW}" height="${FH}" fill="url(#gGlare)"/>` +
    `</g><rect x=".75" y=".75" width="${FW - 1.5}" height="${FH - 1.5}" rx="30" fill="none" stroke="#2c2340" stroke-width="1.5"/></g>`;

  css.push(`@keyframes blink{0%{opacity:1}50%{opacity:0}100%{opacity:0}}.blink{animation:blink 1s step-end infinite}`);
  css.push(`@media (prefers-reduced-motion:reduce){*{animation:none!important}}`);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="CASTAWAY, a ten-hour lo-fi island video, playing off a worn VHS tape">
<title>CASTAWAY: a ten-hour lo-fi island video, on a worn VHS tape</title>
<style>${css.join('\n')}</style>
${defs}
${body}
</svg>
`;
}

// ------------------------------------------------------------------ the timer menu
// The four schedule timers, shown as the four programmes of a VCR's timer-recording
// menu: the classic blue screen nobody could ever work. The highlight steps down one
// programme per bar (3 s) and the loop is four bars.
function timerMenu() {
  css.length = 0;
  usedOsd.clear();
  const TW = 840;
  const TH = 372;
  const SW = 800;
  const SH = 332;
  const u = 2.5;
  const x0 = 38;
  const col = (c) => x0 + c * OSD_ADV * u;
  const rowY = (r) => 30 + r * 31;
  const DIM = '#b9b3ff';
  const GOLD = '#ffe7a6';
  const HI_BG = '#f4f1ff';
  const HI_FG = '#2a2db4';
  const PERIOD = 12;
  const rows = [
    ['1', 'REGULAR', '2-5 MIN', '~155'],
    ['2', 'OCCASIONAL', '12-25 MIN', '~30'],
    ['3', 'RARE', '30-60 MIN', '~13'],
    ['4', 'SUPER RARE', '3-6 H', '~2 (MAX 3)'],
  ];
  const cols = [0, 3, 16, 28];
  const rowText = (cells, y, fill) => cells.map((c, i) => osdRun(c, col(cols[i]), y, u, { fill })).join('');
  let body = '';
  body += osdText('TIMER REC · CASTAWAY', col(0), rowY(0), u, { fill: GOLD });
  body += osdText('CLOCK', col(35), rowY(0), u, { fill: GOLD, anchor: 'end' });
  body += rowText(['PR', 'TIER', 'EVERY', 'PER 10 H'], rowY(1) + 4, DIM);
  body += `<rect x="${col(0) - 6}" y="${rowY(2) - 4}" width="${n2(col(41) - col(0) + 12)}" height="1.5" fill="${DIM}" opacity=".6"/>`;
  rows.forEach((cells, i) => {
    const y = rowY(2) + 4 + i * 31;
    const vis = track((t) => ({ o: Math.floor(t / 3 + EPS) % 4 === i ? 1 : 0 }), { dur: PERIOD, still: 1 });
    body += `<g stroke-linecap="square">${osdRun(cells[0], col(0) + u * 0.45, y + u * 0.45, u, { fill: C.osdShadow, extra: ' opacity=".6"' })}${cells.slice(1).map((c, k) => osdRun(c, col(cols[k + 1]) + u * 0.45, y + u * 0.45, u, { fill: C.osdShadow, extra: ' opacity=".6"' })).join('')}${rowText(cells, y, C.osd)}</g>`;
    body += `<g${vis}><rect x="${col(0) - 8}" y="${y - 7}" width="${n2(col(41) - col(0) + 16)}" height="${n2(6 * u + 14)}" fill="${HI_BG}"/>${rowText(cells, y, HI_FG)}</g>`;
  });
  body += osdRun('+  FOLLOW-UPS   CHAINED     ~20', col(0), rowY(6) + 4, u, { fill: DIM });
  body += `<rect x="${col(0) - 6}" y="${rowY(7) - 2}" width="${n2(col(41) - col(0) + 12)}" height="1.5" fill="${DIM}" opacity=".6"/>`;
  body += osdText('EACH ONE STARTS ON THE NEXT BAR (3 S)', col(0), rowY(7) + 8, u);
  body += osdText('LENGTH 10:00:00', col(0), rowY(8) + 8, u);
  body += osdText('SEED 1992', col(41), rowY(8) + 8, u, { anchor: 'end' });
  // the blinking clock nobody set, bottom right of the menu
  const clock = osdText('12:00', col(41), rowY(0), u, { anchor: 'end', fill: GOLD });
  // a little tape grain on the blue
  const r = mulberry32(2026);
  const grain = [];
  for (let i = 0; i < 70; i++) grain.push({ x: r() * SW, y: Math.floor(r() * SH), w: 10 + r() * 90, h: 1, fill: r() < 0.5 ? '#ff7fe0' : '#7ff0ff', op: 0.1 });
  const nz = noiseFrames(707, SW, 10, 30, 4, { maxLen: 60, dark: 0.3, op: [0.4, 1] });
  const nzStrip = flicker(nz, 0.5);
  css.push(`@keyframes blink{0%{opacity:1}50%{opacity:0}100%{opacity:0}}.blink{animation:blink 1s step-end infinite}`);
  css.push(`@media (prefers-reduced-motion:reduce){*{animation:none!important}}`);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${TW} ${TH}" width="${TW}" height="${TH}" role="img" aria-label="The Castaway schedule as a VCR timer menu: four programmes, regular, occasional, rare and super rare">
<title>CASTAWAY timer menu: the schedule's four timers</title>
<style>${css.join('\n')}</style>
<defs>
<linearGradient id="gMenu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2f37cf"/><stop offset="1" stop-color="#3b25ab"/></linearGradient>
<radialGradient id="gVig" cx=".5" cy=".5" r=".75"><stop offset=".55" stop-color="#12062a" stop-opacity="0"/><stop offset="1" stop-color="#12062a" stop-opacity=".55"/></radialGradient>
<pattern id="pScan" width="8" height="3" patternUnits="userSpaceOnUse"><rect width="8" height="1.1" fill="#0c0420" opacity=".22"/></pattern>
<clipPath id="cMenu"><rect width="${SW}" height="${SH}" rx="26"/></clipPath>
${[...usedOsd].map(osdGlyphDef).join('\n')}
</defs>
<rect width="${TW}" height="${TH}" rx="24" fill="${C.surround}"/>
<g transform="translate(20 20)"><g clip-path="url(#cMenu)">
<rect width="${SW}" height="${SH}" fill="url(#gMenu)"/>
${rectPaths(grain)}
${body}
<g class="blink">${clock}</g>
<g transform="translate(0 ${SH - 10})"><rect width="${SW}" height="10" fill="#f1ecff" opacity=".1"/>${nzStrip}</g>
<rect width="${SW}" height="${SH}" fill="url(#pScan)"/>
<rect width="${SW}" height="${SH}" fill="url(#gVig)"/>
</g><rect x=".75" y=".75" width="${SW - 1.5}" height="${SH - 1.5}" rx="26" fill="none" stroke="#2c2340" stroke-width="1.5"/></g>
</svg>
`;
}

mkdirSync(dirname(OUT), { recursive: true });
const svg = banner();
writeFileSync(OUT, svg);
console.log(`wrote ${OUT} (${(svg.length / 1024).toFixed(1)} KB)`);
const svg2 = timerMenu();
writeFileSync(OUT_TIMER, svg2);
console.log(`wrote ${OUT_TIMER} (${(svg2.length / 1024).toFixed(1)} KB)`);
