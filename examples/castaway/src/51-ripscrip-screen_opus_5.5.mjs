#!/usr/bin/env node
// RIPscrip vector BBS screen: README header generator for CASTAWAY.
//
//   node examples/castaway/src/51-ripscrip-screen_opus_5.5.mjs
//
// Writes examples/castaway/assets/51-ripscrip-screen_opus_5.5.svg.
// Plain Node, no dependencies, no clock, no Math.random: the same bytes on
// every run. (The .md beside the assets is hand-written, not generated.)
//
// The style (catalogue entry ansi-07) is the RIPscrip BBS screen of 1993-98:
// a 640x350 EGA picture sent as a list of drawing commands, so the caller
// watched it build itself over the modem, primitive by primitive: outlines
// first, then flood fills popping in one region at a time, then text, then the
// clickable buttons. Sixteen fixed colours, 8x8 fill patterns doing the
// in-between tones, thick black outlines, stroke fonts with visibly straight
// segments (a gothic for headings, a serif and a sans for labels), a menu on a
// parchment scroll in the middle of a painted scene, and a bevelled grey
// button at the lower right. Nothing here is copied from any real RIP screen,
// terminal program, icon set or font: every shape and glyph is drawn below.
//
// What changes for Castaway:
//   * the concentric dithered rings behind the title are the daytime sky, a
//     sun-glare that steps from white to deep blue in EGA checker patterns;
//   * the parchment is a door-game menu of her actual activities, with the
//     lightbar parked on "Nod to the music" for most of the minute;
//   * the board is ISLE WAIT BBS (sysop SEA LEVEL); the art is signed by
//     DITHER DINGHY of FLOODFILL ATOLL. All of these are invented.
//
// The loop is 60 s, one pass of the theme: 20 bars of 3 s at 80 BPM. Every
// event starts on a beat (0.75 s) and the big ones on a bar line.
//    0 s   the finished screen: the frame a visitor sees first, and the
//          reduced-motion frame. She nods on every beat.
//    6 s   a bottle draws itself in the sea and hops ashore, one hop a beat
//   12 s   she throws it back; it splashes, turns round, and is at her feet
//          again by 18 s ("returned to sender")
//   21 s   a shark fin in cream headphones draws itself and nods along with
//          her, beat for beat, until 30 s, when it sinks in three steps
//   30 s   the mouse pointer drifts to "(L) Leave (any time)", thinks about
//          it, and goes to the CONTINUE button instead
//   36 s   click (bar 12). One beat later the screen clears and the board
//          sends the next screen at 2400 bps: the sky rings, the title, the
//          sea, the island, the palm, the raft, her, the scroll, its text,
//          and last of all the button. The next screen is the same island.
//          It is finished by 54 s and holds until the loop comes round.
//   all the while: clouds, a sailboat and two gulls drift a step at a time
//          until the click; the redraw puts them back, so there is no seam
//
// How it is built: a 640x366 viewBox (350 EGA rows plus a 16-row terminal
// status bar) shown 1.5x taller than wide, so the pixels are tall like EGA's
// on a 4:3 tube and every fill pattern lands on whole device pixels at
// width 640 on a 2x screen. Outlines that trace themselves are paths with
// pathLength=1 and an animated dash offset; fills pop with stepped opacity.
// Each primitive's visibility is "drawn, cleared at 36.75 s, drawn again at
// its own command time", one tiny keyframe rule per distinct command time.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '51-ripscrip-screen_opus_5.5';
const OUT = path.resolve(here, `../assets/${SLUG}.svg`);

// ------------------------------------------------------------------ facts
// Checked 2026-10-01 against D:/python/castaway (read-only): 94 activities in
// activities.toml and growing; four timers; starts snap to 3 s bars; theme is
// a seamless 60 s loop at 80 BPM; every sound comes from tools/make_audio.py.
// The image only shows activities that exist: bottle (washes straight back),
// shark_nod (surfaces in headphones and nods to the beat), coconut, fishing,
// the signal hunt up the palm, the sandcastle and the tide, waving for rescue,
// and "she could leave any time".

// ------------------------------------------------------------------ canvas
const W = 640;
const SH = 350; // the EGA screen
const BH = 16; // the terminal's status bar under it
const H = SH + BH;
const ASPECT = 1.5; // each logical row is shown 1.5x taller than wide
const LOOP = 60;
const BEAT = 0.75;
const CLICK = 36; // bar 12: the pointer clicks CONTINUE
const CLEAR = CLICK + BEAT; // one beat later the screen clears for the redraw
const SINK = 30; // bar 10: the shark goes

const E = {
  k: '#000000', b: '#0000aa', g: '#00aa00', c: '#00aaaa', r: '#aa0000', m: '#aa00aa', br: '#aa5500', lg: '#aaaaaa',
  dg: '#555555', lb: '#5555ff', lgn: '#55ff55', lc: '#55ffff', lr: '#ff5555', lm: '#ff55ff', y: '#ffff55', w: '#ffffff',
};

const r2 = (n) => {
  const v = Math.round(n * 100) / 100;
  return Object.is(v, -0) ? '0' : String(v);
};
const pc = (t) => r2((t / LOOP) * 100) + '%';

// seeded PRNG (mulberry32)
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ------------------------------------------------------------------ fill patterns
// EGA-style 2-colour fills on the screen's own pixel grid (userSpaceOnUse).
const patDefs = [];
const patIds = new Map();
function pat(kind, a, b) {
  const key = `${kind}|${a}|${b}`;
  if (patIds.has(key)) return patIds.get(key);
  const id = `p${patIds.size}`;
  let w = 2, h = 2, dots = '';
  if (kind === 'c50') dots = 'M0 0h1v1H0zM1 1h1v1H1z'; // checker
  else if (kind === 'c25') dots = 'M0 0h1v1H0z'; // close dots, 25%
  else if (kind === 'c12') { w = 4; h = 4; dots = 'M0 0h1v1H0zM2 2h1v1H2z'; } // wide dots
  else if (kind === 'hl') { w = 1; h = 2; dots = 'M0 1h1v1H0z'; } // line every other row
  else if (kind === 'wood') { w = 8; h = 4; dots = 'M0 1h5v1H0zM3 3h5v1H3z'; } // brown-on-yellow grain
  else if (kind === 'diag') { w = 4; h = 4; dots = 'M0 3h1v1H0zM1 2h1v1H1zM2 1h1v1H2zM3 0h1v1H3z'; }
  patDefs.push(`<pattern id="${id}" width="${w}" height="${h}" patternUnits="userSpaceOnUse"><path d="M0 0h${w}v${h}H0z" fill="${E[a]}"/><path d="${dots}" fill="${E[b]}"/></pattern>`);
  const url = `url(#${id})`;
  patIds.set(key, url);
  return url;
}
const F = (spec) => {
  // 'y' -> solid, 'c50:y:br' -> pattern
  if (!spec.includes(':')) return E[spec];
  const [k, a, b] = spec.split(':');
  return pat(k, a, b);
};

// ------------------------------------------------------------------ geometry helpers
const pts = (list) => list.map(([x, y]) => `${r2(x)} ${r2(y)}`).join(' ');
const polyD = (list) => `M${pts(list)}Z`;
const lineD = (list) => `M${pts(list)}`;
function ellPts(cx, cy, rx, ry, n = 32, a0 = 0) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const a = a0 + (i / n) * Math.PI * 2;
    out.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]);
  }
  return out;
}
const off = (list, dx, dy) => list.map(([x, y]) => [x + dx, y + dy]);

// ------------------------------------------------------------------ timeline classes
// vis(t): drawn at frame 0, gone at CLEAR, back at t. trace(t, d): the same,
// and the outline's dash runs from nothing to whole over d seconds from t.
// shared settings first, so each per-time class only has to name its keyframes
const css = [`[class^=v]{animation:${LOOP}s step-end infinite}[class^=x]{stroke-dasharray:1 1}`];
const extraDefs = [];
const visIds = new Map();
function vis(t) {
  const key = r2(t);
  if (visIds.has(key)) return visIds.get(key);
  const id = `v${visIds.size}`;
  css.push(`@keyframes ${id}{${pc(CLEAR)}{opacity:0}${pc(t)}{opacity:1}}.${id}{animation-name:${id}}`);
  visIds.set(key, id);
  return id;
}
const traceIds = new Map();
function trace(t, d) {
  const key = `${r2(t)}|${r2(d)}`;
  if (traceIds.has(key)) return traceIds.get(key);
  const v = vis(t);
  const td = `d${r2(d * 100)}`;
  if (!css.some((c) => c.startsWith(`@keyframes ${td}{`))) css.push(`@keyframes ${td}{0%{stroke-dashoffset:1}${pc(d)}{stroke-dashoffset:0}}`);
  const id = `x${traceIds.size}`;
  css.push(`.${id}{animation:${v} ${LOOP}s step-end infinite,${td} ${LOOP}s linear ${r2(t)}s infinite}`);
  traceIds.set(key, id);
  return id;
}

// drift(name, dx, steps): things that wander between redraws. They move in
// hard steps from 0 s to the click at 36 s, vanish with the screen at CLEAR, and the redraw
// puts them back where they started, which is what makes the loop seamless.
function drift(name, dx, steps) {
  css.push(`@keyframes ${name}{0%{transform:translate(0px,0px)}${pc(CLICK)},${pc(CLEAR)}{transform:translate(${dx}px,0px)}${pc(CLEAR + 0.01)},100%{transform:translate(0px,0px)}}.${name}{animation:${name} ${LOOP}s steps(${steps},end) infinite}`);
  return name;
}

// The command list: every primitive of the redraw, in the order the board
// sends it. T is the clock of the redraw; cmd() hands out start times.
let T = CLEAR + 0.25;
const cmd = (dur) => {
  const t = T;
  T = Math.round((T + dur) * 1000) / 1000;
  return t;
};
const commandLog = [];
const log = (t, what) => commandLog.push([t, what]);

const body = [];
const add = (s) => body.push(s);

function fillShape(d, fill, t, extra = '') {
  add(`<path d="${d}" fill="${F(fill)}" class="${vis(t)}"${extra}/>`);
}
function outline(d, t, dur, colour = 'k', sw = 1, extra = '') {
  add(`<path d="${d}" fill="none" stroke="${E[colour]}" stroke-width="${sw}" pathLength="1" class="${trace(t, dur)}"${extra}/>`);
}
// a filled polygon whose black outline traces first and whose fill pops after
function plotPoly(list, fill, opts = {}) {
  const d = polyD(list);
  const dur = opts.dur ?? 0.3;
  const t = opts.t ?? cmd(dur + (opts.gap ?? 0.05));
  fillShape(d, fill, Math.round((t + dur) * 100) / 100);
  if (opts.sw !== 0) outline(d, t, dur, opts.stroke ?? 'k', opts.sw ?? 1);
  return t;
}

// ------------------------------------------------------------------ stroke fonts
// SANS/SERIF: single-line glyphs on a grid with caps 0..9, x-height 3,
// descenders to 12. Straight segments only, like a plotter. Serif strokes are
// listed after a '|' and only drawn by the serif face.
const GL = {
  A: [8, '0,9 4,0 8,9;1.8,5.6 6.2,5.6', '-1,9 1,9;7,9 9,9'],
  B: [7, '0,0 0,9;0,0 5,0 6.5,1.2 6.5,3.1 5,4.3 0,4.3;5,4.3 7,5.6 7,7.8 5.6,9 0,9', '-1,0 0,0;-1,9 0,9'],
  C: [7.5, '7.5,1.5 6,0 2,0 0,2 0,7 2,9 6,9 7.5,7.5', '7.5,0 7.5,2'],
  D: [7.5, '0,0 0,9;0,0 4.5,0 7.5,2.5 7.5,6.5 4.5,9 0,9', '-1,0 0,0;-1,9 0,9'],
  E: [6.5, '6.5,0 0,0 0,9 6.5,9;0,4.4 4.5,4.4', '-1,0 0,0;-1,9 0,9;6.5,0 6.5,1.5;6.5,9 6.5,7.5'],
  F: [6, '6,0 0,0 0,9;0,4.4 4.5,4.4', '-1,0 0,0;-1,9 1.5,9;6,0 6,1.5'],
  G: [8, '7.5,1.5 6,0 2,0 0,2 0,7 2,9 6,9 8,7.5 8,5 4.5,5', ''],
  H: [7.5, '0,0 0,9;7.5,0 7.5,9;0,4.4 7.5,4.4', '-1,0 1,0;-1,9 1,9;6.5,0 8.5,0;6.5,9 8.5,9'],
  I: [2, '1,0 1,9', '-0.2,0 2.2,0;-0.2,9 2.2,9'],
  J: [5.5, '5.5,0 5.5,7 4,9 1.5,9 0,7.5', '4.5,0 6.5,0'],
  K: [7, '0,0 0,9;7,0 0,5.5;2.4,4 7,9', '-1,0 1,0;-1,9 1,9;6,0 8,0;6,9 8,9'],
  L: [6, '0,0 0,9 6,9', '-1,0 1,0;-1,9 0,9;6,9 6,7.5'],
  M: [9, '0,9 0,0 4.5,6.5 9,0 9,9', '-1,9 1,9;8,9 10,9'],
  N: [7.5, '0,9 0,0 7.5,9 7.5,0', '-1,9 1,9;6.5,0 8.5,0;-1,0 0,0'],
  O: [8, '2,0 6,0 8,2 8,7 6,9 2,9 0,7 0,2 2,0', ''],
  P: [7, '0,9 0,0 5,0 7,1.5 7,3.5 5,5 0,5', '-1,0 0,0;-1,9 1,9'],
  Q: [8, '2,0 6,0 8,2 8,7 6,9 2,9 0,7 0,2 2,0;4.5,6.5 8,10', ''],
  R: [7, '0,9 0,0 5,0 7,1.5 7,3.5 5,5 0,5;4,5 7,9', '-1,0 0,0;-1,9 1,9'],
  S: [7, '7,1.5 5.5,0 1.5,0 0,1.5 0,3 1.5,4.3 5.5,4.7 7,6 7,7.5 5.5,9 1.5,9 0,7.5', ''],
  T: [7.5, '0,0 7.5,0;3.75,0 3.75,9', '0,0 0,1.5;7.5,0 7.5,1.5;2.5,9 5,9'],
  U: [7.5, '0,0 0,7 2,9 5.5,9 7.5,7 7.5,0', '-1,0 1,0;6.5,0 8.5,0'],
  V: [8, '0,0 4,9 8,0', '-1,0 1,0;7,0 9,0'],
  W: [10, '0,0 2.5,9 5,2 7.5,9 10,0', '-1,0 1,0;9,0 11,0'],
  X: [7.5, '0,0 7.5,9;7.5,0 0,9', ''],
  Y: [7.5, '0,0 3.75,4.5 7.5,0;3.75,4.5 3.75,9', '-1,0 1,0;6.5,0 8.5,0;2.5,9 5,9'],
  Z: [7, '0,0 7,0 0,9 7,9', ''],
  a: [6, '1,3 4.5,3 5.5,4 5.5,9;5.5,5.6 1.5,5.6 0,6.6 0,8 1,9 4.5,9 5.5,8', ''],
  b: [6, '0,0 0,9;0,4.5 1.5,3 4.5,3 6,4.5 6,7.5 4.5,9 1.5,9 0,7.5', ''],
  c: [5.5, '5.5,4 4.5,3 1.5,3 0,4.5 0,7.5 1.5,9 4.5,9 5.5,8', ''],
  d: [6, '6,0 6,9;6,4.5 4.5,3 1.5,3 0,4.5 0,7.5 1.5,9 4.5,9 6,7.5', ''],
  e: [6, '0,6 6,6 6,4.5 4.5,3 1.5,3 0,4.5 0,7.5 1.5,9 5,9 6,8', ''],
  f: [4, '4,0.5 3.5,0 2.5,0 1.5,1 1.5,9;0,3 4,3', ''],
  g: [6, '6,3 6,10.5 4.5,12 1.5,12 0.5,11;6,4.5 4.5,3 1.5,3 0,4.5 0,7 1.5,8.5 4.5,8.5 6,7', ''],
  h: [6, '0,0 0,9;0,4.5 1.5,3 4.5,3 6,4.5 6,9', ''],
  i: [1.5, '0.75,3 0.75,9;0.75,0.7 0.75,1.3', ''],
  j: [3, '2.5,3 2.5,10.5 1,12 0,12;2.5,0.7 2.5,1.3', ''],
  k: [5.5, '0,0 0,9;5.5,3 0,6.5;2,5.2 5.5,9', ''],
  l: [1.5, '0.75,0 0.75,9', ''],
  m: [9, '0,3 0,9;0,4.5 1,3 3.5,3 4.5,4.5 4.5,9;4.5,4.5 5.5,3 8,3 9,4.5 9,9', ''],
  n: [6, '0,3 0,9;0,4.5 1.5,3 4.5,3 6,4.5 6,9', ''],
  o: [6, '1.5,3 4.5,3 6,4.5 6,7.5 4.5,9 1.5,9 0,7.5 0,4.5 1.5,3', ''],
  p: [6, '0,3 0,12;0,4.5 1.5,3 4.5,3 6,4.5 6,7.5 4.5,9 1.5,9 0,7.5', ''],
  q: [6, '6,3 6,12;6,4.5 4.5,3 1.5,3 0,4.5 0,7.5 1.5,9 4.5,9 6,7.5', ''],
  r: [4.5, '0,3 0,9;0,5 2,3 4.5,3', ''],
  s: [5.5, '5.5,4 4.5,3 1,3 0,4 0,5 1,6 4.5,6 5.5,7 5.5,8 4.5,9 1,9 0,8', ''],
  t: [4, '1.5,0.5 1.5,8 2.5,9 4,9;0,3 4,3', ''],
  u: [6, '0,3 0,7.5 1.5,9 4.5,9 6,7.5;6,3 6,9', ''],
  v: [6, '0,3 3,9 6,3', ''],
  w: [8.5, '0,3 2,9 4.25,4 6.5,9 8.5,3', ''],
  x: [5.5, '0,3 5.5,9;5.5,3 0,9', ''],
  y: [6, '0,3 3,9;6,3 2,11 1,12 0,12', ''],
  z: [5.5, '0,3 5.5,3 0,9 5.5,9', ''],
  0: [6, '1.5,0 4.5,0 6,1.5 6,7.5 4.5,9 1.5,9 0,7.5 0,1.5 1.5,0', ''],
  1: [5, '0.5,1.5 2.5,0 2.5,9;0.5,9 4.5,9', ''],
  2: [6, '0,1.5 1.5,0 4.5,0 6,1.5 6,3 0,9 6,9', ''],
  3: [6, '0,1 1,0 5,0 6,1 6,3.3 4.8,4.4 2,4.4;4.8,4.4 6,5.5 6,8 5,9 1,9 0,8', ''],
  4: [6, '4.5,9 4.5,0 0,6.5 6,6.5', ''],
  5: [6, '6,0 1,0 0.5,4 4.5,4 6,5.5 6,7.5 4.5,9 1,9 0,8', ''],
  6: [6, '5.5,0.5 4.5,0 2,0 0,2 0,7.5 1.5,9 4.5,9 6,7.5 6,5.5 4.5,4.2 1.5,4.2 0,5.5', ''],
  7: [6, '0,0 6,0 2,9', ''],
  8: [6, '1.5,0 4.5,0 5.7,1.2 5.7,3.2 4.5,4.4 1.5,4.4 0.3,3.2 0.3,1.2 1.5,0;1.5,4.4 0,5.8 0,7.6 1.4,9 4.6,9 6,7.6 6,5.8 4.5,4.4', ''],
  9: [6, '6,3.5 4.5,4.8 1.5,4.8 0,3.5 0,1.5 1.5,0 4.5,0 6,1.5 6,7 4,9 1.5,9 0.5,8.5', ''],
  ' ': [3.2, '', ''],
  '.': [1.5, '0.75,8.3 0.75,9', ''],
  ',': [1.5, '1,8.3 1,9.4 0.2,10.6', ''],
  ':': [1.5, '0.75,3.5 0.75,4.2;0.75,8.3 0.75,9', ''],
  '-': [4, '0,5.5 4,5.5', ''],
  '(': [3, '2.5,-0.5 0.5,2 0.5,7 2.5,9.5', ''],
  ')': [3, '0.5,-0.5 2.5,2 2.5,7 0.5,9.5', ''],
  "'": [1.5, '0.75,0 0.75,2.5', ''],
  '/': [5, '0,9.5 5,-0.5', ''],
  '?': [5.5, '0,1.5 1.5,0 4,0 5.5,1.5 5.5,3 2.75,5 2.75,6.5;2.75,8.3 2.75,9', ''],
  '!': [1.5, '0.75,0 0.75,6.5;0.75,8.3 0.75,9', ''],
  '+': [6, '3,2.5 3,8.5;0,5.5 6,5.5', ''],
  '>': [5, '0,2.5 5,5.5 0,8.5', ''],
};
const parseStrokes = (s) => (s ? s.split(';').map((st) => st.trim().split(/\s+/).map((p) => p.split(',').map(Number))) : []);
const GLYPH = {};
for (const [ch, [w, main, serif]] of Object.entries(GL)) GLYPH[ch] = { w, main: parseStrokes(main), serif: parseStrokes(serif) };

// returns {d, w}: one path for the whole string. sx = px per unit across,
// sy = rows per unit down (the font is drawn a little tall, like on EGA).
function strokeText(str, x, y, sx, sy, opts = {}) {
  const track = opts.track ?? 1.6;
  let cx = 0;
  const segs = [];
  for (const ch of str) {
    const g = GLYPH[ch];
    if (!g) throw new Error(`no glyph for ${JSON.stringify(ch)}`);
    const strokes = opts.serif ? [...g.main, ...g.serif] : g.main;
    for (const st of strokes) segs.push('M' + st.map(([gx, gy]) => `${r2(x + (cx + gx) * sx)} ${r2(y + gy * sy)}`).join(' '));
    cx += g.w + track;
  }
  return { d: segs.join(''), w: (cx - track) * sx };
}
const textWidth = (str, sx, track = 1.6) => {
  let w = 0;
  for (const ch of str) w += GLYPH[ch].w + track;
  return (w - track) * sx;
};

// GOTHIC: a broad-nib blackletter for the scroll's heading. Each stroke is a
// polyline the nib's corner follows; the drawn shape is the nib swept along
// it, so verticals come out heavy and up-strokes hairline, all straight.
const GOTH = {
  T: [7.6, '-0.2,1.8 0.8,0.8 2.4,1.3 4.6,0.6 6.6,1.3 7.6,0.6;3.6,1.0 3.6,8.0 2.6,9.2 1.2,9.2 0.4,8.6'],
  h: [5.4, '0,0.9 0.7,0.2 0.7,8.5 1.3,9.1;0.7,4.3 1.9,3.1 3.3,4.2 3.3,9.8 2.5,10.8'],
  i: [3.0, '0,3.7 0.7,3 0.7,8.4 1.4,9.1;0.5,1.1 1.1,1.7'],
  n: [5.6, '0,3.7 0.7,3 0.7,8.5 1.3,9.1;0.7,4.3 1.9,3.1 3.4,4.2 3.4,8.4 4.1,9.1'],
  g: [4.8, '0.7,3.8 1.6,3 2.8,3 3.5,3.7 3.5,8.3 2.6,9 1.3,9 0.7,8.4 0.7,3.8;3.5,8.3 3.5,10.7 2.5,11.7 1.0,11.7 0.3,11.1'],
  s: [4.4, '3.4,3.6 2.6,3 1.4,3 0.6,3.8 0.6,5.0 3.2,7.0 3.2,8.4 2.4,9.2 1.0,9.2 0.2,8.6'],
  t: [3.7, '0.7,1.5 0.7,8.4 1.5,9.2 2.5,8.7;-0.2,3.4 2.6,3.4'],
  o: [4.8, '0.7,3.8 1.6,3 2.8,3 3.5,3.7 3.5,8.3 2.6,9 1.3,9 0.7,8.4 0.7,3.8'],
  D: [7.4, '1.0,1.4 1.0,8.4;0,1.3 1.4,0.4 4.0,0.4 5.9,2.0 6.4,4.6 6.0,7.2 4.1,9.0 1.5,9.0 0.3,8.4'],
  ' ': [2.6, ''],
};
function gothText(str, x, y, sx, sy, nib = 1.15) {
  const polys = [];
  let cx = 0;
  for (const ch of str) {
    const [w, src] = GOTH[ch];
    for (const st of parseStrokes(src)) {
      for (let i = 0; i + 1 < st.length; i++) {
        const [ax, ay] = st[i];
        const [bx, by] = st[i + 1];
        const P = (px, py) => [x + (cx + px) * sx, y + py * sy];
        polys.push(polyD([P(ax, ay), P(bx, by), P(bx + nib, by - nib), P(ax + nib, ay - nib)]));
      }
    }
    cx += w + 0.8;
  }
  return { d: polys.join(''), w: (cx - 0.8) * sx };
}
const gothWidth = (str, sx) => {
  let w = 0;
  for (const ch of str) w += GOTH[ch][0] + 0.8;
  return (w - 0.8) * sx;
};

// 8x8 BITMAP font for the terminal's status bar: 5x7 shapes, drawn bold
// (each lit pixel also lights the one to its right), one <use> per character.
const BM = {
  A: '.###.|#...#|#...#|#####|#...#|#...#|#...#', B: '####.|#...#|#...#|####.|#...#|#...#|####.',
  C: '.###.|#...#|#....|#....|#....|#...#|.###.', D: '####.|#...#|#...#|#...#|#...#|#...#|####.',
  E: '#####|#....|#....|####.|#....|#....|#####', F: '#####|#....|#....|####.|#....|#....|#....',
  G: '.###.|#...#|#....|#.###|#...#|#...#|.####', H: '#...#|#...#|#...#|#####|#...#|#...#|#...#',
  I: '.###.|..#..|..#..|..#..|..#..|..#..|.###.', J: '..###|...#.|...#.|...#.|...#.|#..#.|.##..',
  K: '#...#|#..#.|#.#..|##...|#.#..|#..#.|#...#', L: '#....|#....|#....|#....|#....|#....|#####',
  M: '#...#|##.##|#.#.#|#.#.#|#...#|#...#|#...#', N: '#...#|#...#|##..#|#.#.#|#..##|#...#|#...#',
  O: '.###.|#...#|#...#|#...#|#...#|#...#|.###.', P: '####.|#...#|#...#|####.|#....|#....|#....',
  Q: '.###.|#...#|#...#|#...#|#.#.#|#..#.|.##.#', R: '####.|#...#|#...#|####.|#.#..|#..#.|#...#',
  S: '.####|#....|#....|.###.|....#|....#|####.', T: '#####|..#..|..#..|..#..|..#..|..#..|..#..',
  U: '#...#|#...#|#...#|#...#|#...#|#...#|.###.', V: '#...#|#...#|#...#|#...#|#...#|.#.#.|..#..',
  W: '#...#|#...#|#...#|#.#.#|#.#.#|#.#.#|.#.#.', X: '#...#|#...#|.#.#.|..#..|.#.#.|#...#|#...#',
  Y: '#...#|#...#|.#.#.|..#..|..#..|..#..|..#..', Z: '#####|....#|...#.|..#..|.#...|#....|#####',
  0: '.###.|#...#|#..##|#.#.#|##..#|#...#|.###.', 1: '..#..|.##..|..#..|..#..|..#..|..#..|.###.',
  2: '.###.|#...#|....#|...#.|..#..|.#...|#####', 3: '#####|...#.|..#..|...#.|....#|#...#|.###.',
  4: '...#.|..##.|.#.#.|#..#.|#####|...#.|...#.', 5: '#####|#....|####.|....#|....#|#...#|.###.',
  6: '..##.|.#...|#....|####.|#...#|#...#|.###.', 7: '#####|....#|...#.|..#..|.#...|.#...|.#...',
  8: '.###.|#...#|#...#|.###.|#...#|#...#|.###.', 9: '.###.|#...#|#...#|.####|....#|...#.|.##..',
  '.': '.....|.....|.....|.....|.....|..#..|..#..', ',': '.....|.....|.....|.....|..#..|..#..|.#...',
  ':': '.....|..#..|..#..|.....|..#..|..#..|.....', '-': '.....|.....|.....|.###.|.....|.....|.....',
  '/': '....#|....#|...#.|..#..|.#...|#....|#....', '(': '...#.|..#..|.#...|.#...|.#...|..#..|...#.',
  ')': '.#...|..#..|...#.|...#.|...#.|..#..|.#...', "'": '..#..|..#..|.#...|.....|.....|.....|.....',
  '!': '..#..|..#..|..#..|..#..|..#..|.....|..#..', '?': '.###.|#...#|....#|...#.|..#..|.....|..#..',
  '+': '.....|..#..|..#..|#####|..#..|..#..|.....', '>': '.#...|..#..|...#.|....#|...#.|..#..|.#...',
  '*': '.....|..#..|#.#.#|.###.|#.#.#|..#..|.....', '=': '.....|.....|#####|.....|#####|.....|.....',
};
const bmDefs = [];
const bmUsed = new Set();
function bmGlyph(ch) {
  const id = `f${ch.charCodeAt(0)}`;
  if (!bmUsed.has(ch)) {
    bmUsed.add(ch);
    const rows = BM[ch].split('|');
    let d = '';
    rows.forEach((row, y) => {
      // bold: OR with itself shifted right one pixel, then merge runs
      const bits = [...row].map((c) => c === '#');
      const bold = bits.map((b, i) => b || (i > 0 && bits[i - 1]));
      bold.push(bits[bits.length - 1]);
      let x = 0;
      while (x < bold.length) {
        if (!bold[x]) { x++; continue; }
        let e = x;
        while (e < bold.length && bold[e]) e++;
        d += `M${x} ${y}h${e - x}v1H${x}z`;
        x = e;
      }
    });
    bmDefs.push(`<path id="${id}" d="${d}"/>`);
  }
  return id;
}
function bmText(str, x, y, colour) {
  let s = '';
  let cx = x;
  for (const ch of str) {
    if (ch !== ' ') {
      if (!BM[ch]) throw new Error(`no bitmap glyph for ${JSON.stringify(ch)}`);
      s += `<use href="#${bmGlyph(ch)}" x="${cx}" y="${y}"/>`;
    }
    cx += 7;
  }
  return `<g fill="${E[colour]}">${s}</g>`;
}

// ================================================================== THE SCREEN
// Everything below is emitted in command order: later primitives paint over
// earlier ones, exactly as the board's drawing commands would.

// ---- 1. the sky: concentric dithered rings, largest first ----------------
const SKY_CX = 320;
const SKY_CY = 38;
const HORIZON = 176;
const RINGS = [
  [296, 'c25:b:lb'], [270, 'c50:b:lb'], [246, 'c25:lb:b'], [222, 'lb'], [199, 'c25:lb:lc'], [176, 'c50:lb:lc'],
  [153, 'c25:lc:lb'], [130, 'lc'], [108, 'c25:lc:w'], [86, 'c50:lc:w'], [64, 'c25:w:lc'], [42, 'w'],
];
{
  const t0 = cmd(0.12);
  log(t0, 'RESET. Fill the sky, blue.');
  add(`<g clip-path="url(#sky)">`);
  fillShape(`M0 0h${W}v${HORIZON}H0z`, 'b', t0);
  const tr = T;
  RINGS.forEach(([r, fill]) => {
    const t = cmd(0.08);
    add(`<ellipse cx="${SKY_CX}" cy="${SKY_CY}" rx="${r}" ry="${r2(r / ASPECT)}" fill="${F(fill)}" class="${vis(t)}"/>`);
  });
  log(tr, `FILL ELLIPSE x${RINGS.length}, outside in: the rings`);
  add('</g>');
}

// ---- 2. the title: hand-plotted polygon capitals, banded yellow to red ----
// Letters are designed on a square grid 80 units tall and shown 53 rows tall
// (so they look 80 tall on the stretched screen), sheared into an italic.
const TL = {
  C: [56, [[[12, 0], [56, 0], [56, 16], [19, 16], [16, 19], [16, 61], [19, 64], [56, 64], [56, 80], [12, 80], [0, 68], [0, 12]]]],
  A: [56, [[[0, 80], [0, 12], [12, 0], [44, 0], [56, 12], [56, 80], [40, 80], [40, 52], [16, 52], [16, 80]], [[19, 16], [37, 16], [40, 19], [40, 37], [16, 37], [16, 19]]]],
  S: [56, [[[12, 0], [56, 0], [56, 16], [16, 16], [16, 32], [44, 32], [56, 44], [56, 68], [44, 80], [0, 80], [0, 64], [40, 64], [40, 48], [12, 48], [0, 36], [0, 12]]]],
  T: [56, [[[0, 0], [56, 0], [56, 16], [36, 16], [36, 80], [20, 80], [20, 16], [0, 16]]]],
  W: [72, [[[0, 0], [16, 0], [16, 64], [28, 64], [28, 28], [44, 28], [44, 64], [56, 64], [56, 0], [72, 0], [72, 68], [60, 80], [12, 80], [0, 68]]]],
  Y: [56, [[[0, 0], [16, 0], [16, 30], [40, 30], [40, 0], [56, 0], [56, 38], [44, 50], [36, 50], [36, 80], [20, 80], [20, 50], [12, 50], [0, 38]]]],
};
const TITLE = 'CASTAWAY';
const TGAP = 9;
const TSHEAR = 0.2;
const TTOP = 9;
const TS = 1 / ASPECT; // rows per unit
const titleW = [...TITLE].reduce((a, ch) => a + TL[ch][0], 0) + TGAP * (TITLE.length - 1) + 80 * TSHEAR;
const TX0 = Math.round(SKY_CX - titleW / 2);
const titleLetters = []; // per letter: list of contours in screen coords
{
  let x = TX0;
  for (const ch of TITLE) {
    const [w, contours] = TL[ch];
    titleLetters.push(contours.map((c, ci) => (ci ? [...c].reverse() : c).map(([u, v]) => [x + u + (80 - v) * TSHEAR, TTOP + v * TS])));
    x += w + TGAP;
  }
}
const letterD = (contours, dx = 0, dy = 0) => contours.map((c) => polyD(off(c, dx, dy))).join('');
const TITLE_BOTTOM = TTOP + 80 * TS;
const BANDS = [
  [0, 9, 'c50:w:y'], [9, 25, 'y'], [25, 35, 'c25:y:lr'], [35, 45, 'c50:y:lr'], [45, 55, 'c25:lr:y'], [55, 67, 'lr'], [67, 80, 'c50:lr:r'],
];
{
  // extrusion: the letter repeated 5 times down-right, dark blue, outlined
  const t = cmd(0.25);
  log(t, 'POLY x40: the title\'s blue extrusion');
  const EX = 5;
  let ex = '';
  for (let k = EX; k >= 1; k--) ex += titleLetters.map((c) => letterD(c, k, k / ASPECT)).join('');
  add(`<g class="${vis(t)}"><path d="${ex}" fill="none" stroke="#000" stroke-width="3" stroke-linejoin="round"/><path d="${ex}" fill="${E.b}" fill-rule="nonzero"/></g>`);
  // front faces: outlines trace letter by letter
  const tl = T;
  const allD = titleLetters.map((c) => letterD(c)).join('');
  add(`<clipPath id="tclip"><path d="${allD}" fill-rule="evenodd"/></clipPath>`);
  // a black under-fill so the face is never see-through while the bands pop
  const tf = Math.round((tl + titleLetters.length * 0.17 + 0.1) * 100) / 100;
  add(`<path d="${allD}" fill="#000" fill-rule="evenodd" class="${vis(tf)}"/>`);
  // bands pop top to bottom, clipped to the letters
  const tb = tf + 0.05;
  add(`<g clip-path="url(#tclip)">`);
  BANDS.forEach(([v0, v1, fill], i) => {
    const t1 = Math.round((tb + i * 0.12) * 100) / 100;
    add(`<path d="M0 ${r2(TTOP + v0 * TS)}H${W}V${r2(TTOP + v1 * TS)}H0z" fill="${F(fill)}" class="${vis(t1)}"/>`);
  });
  add('</g>');
  titleLetters.forEach((c, i) => {
    const t1 = cmd(0.17);
    add(`<path d="${letterD(c)}" fill="none" stroke="#000" stroke-width="2" stroke-linejoin="round" pathLength="1" class="${trace(t1, 0.22)}"/>`);
  });
  log(tl, 'POLY x8, traced: C A S T A W A Y');
  cmd(0.1 + BANDS.length * 0.12);
  log(tb, `FILL x${BANDS.length}: yellow to red, in bands`);
}

// ---- 3. the subtitle, in the serif face -----------------------------------
const SUB = 'a ten-hour lo-fi island video in which almost nothing happens';
const SUB_SX = 1.04;
const SUB_SY = 1.04 / 1.3;
{
  const t = cmd(0.4);
  const w = textWidth(SUB, SUB_SX);
  const x = Math.round(SKY_CX - w / 2);
  const y = TITLE_BOTTOM + 12;
  const main = strokeText(SUB, x, y, SUB_SX, SUB_SY);
  // the triplex trick: every stroke drawn twice, a hair apart, for weight
  extraDefs.push(`<path id="sub" d="${main.d}" fill="none" stroke-width="1.2"/>`);
  add(`<g class="${vis(t)}"><use href="#sub" x="1.2" y="1" stroke="${E.w}"/><use href="#sub" x="1.9" y="1" stroke="${E.w}"/><use href="#sub" stroke="${E.b}"/><use href="#sub" x="0.7" stroke="${E.b}"/></g>`);
  log(t, 'TEXT: the subtitle');
}

// ---- 4. clouds -----------------------------------------------------------------
function cloudPts(x0, x1, yb, bumps) {
  // a flat-bottomed cloud: the upper envelope of a run of overlapping bumps,
  // sampled every 2 pixels, so the scallops meet in sharp little cusps
  const n = bumps.length;
  const span = (x1 - x0) / n;
  const top = (x) => {
    let y = yb;
    bumps.forEach((h, i) => {
      const cx = x0 + span * (i + 0.5);
      const rx = span * 0.8;
      const u = (x - cx) / rx;
      if (Math.abs(u) < 1) y = Math.min(y, yb - 1 - (h * Math.sqrt(1 - u * u)) / ASPECT);
    });
    return y;
  };
  const out = [[x0, yb]];
  for (let x = x0; x <= x1; x += 2) out.push([x, top(x)]);
  out.push([x1, yb]);
  return out;
}
const CLOUDS = [
  [14, 136, 148, [12, 22, 28, 19, 11]],
  [342, 398, 171, [9, 14, 8]],
];
{
  const t0 = T;
  add(`<g class="${drift('dc', 13, 13)}">`);
  for (const [x0, x1, yb, bumps] of CLOUDS) {
    const p = cloudPts(x0, x1, yb, bumps);
    const t = cmd(0.4);
    fillShape(polyD(p), 'w', t + 0.3);
    fillShape(`M${x0} ${yb - 4}H${x1}V${yb}H${x0}z`, 'c50:w:lc', t + 0.33);
    fillShape(`M${x0} ${yb - 2}H${x1}V${yb}H${x0}z`, 'c25:lc:w', t + 0.35);
    outline(polyD(p), t, 0.3);
    // a few puff lines inside, the way a RIP artist would hint at volume
    const span = (x1 - x0) / bumps.length;
    let puffs = '';
    bumps.forEach((h, i) => {
      if (i === 0 || i === bumps.length - 1 || h < 12) return;
      const cx = x0 + span * (i + 0.5);
      const arc = [];
      for (let k = 0; k <= 4; k++) {
        const a = Math.PI * 1.1 + (k / 4) * Math.PI * 0.55;
        arc.push([cx + Math.cos(a) * span * 0.5, yb - 3 + (Math.sin(a) * h * 0.55) / ASPECT]);
      }
      puffs += lineD(arc);
    });
    if (puffs) add(`<path d="${puffs}" fill="none" stroke="${E.lc}" stroke-width="1" class="${vis(t + 0.36)}"/>`);
  }
  add('</g>');
  log(t0, 'POLY x2, traced and filled: clouds');
}

// ---- 5. the sea ----------------------------------------------------------------
const SEA = [[HORIZON, 186, 'b'], [186, 204, 'c25:b:lb'], [204, 232, 'c50:b:lb'], [232, SH, 'c25:lb:b']];
{
  const t = cmd(0.3);
  outline(`M0 ${HORIZON + 0.5}H${W}`, t, 0.3, 'lc', 1);
  log(t, 'LINE: the horizon');
  const ts = T;
  SEA.forEach(([y0, y1, fill]) => {
    const tt = cmd(0.15);
    fillShape(`M0 ${y0}H${W}V${y1}H0z`, fill, tt);
  });
  // re-draw the horizon line on top, since the bands pop over it
  add(`<path d="M0 ${HORIZON + 0.5}H${W}" stroke="${E.lc}" stroke-width="1" class="${vis(ts + 0.6)}"/>`);
  log(ts, 'BAR x4: the sea, darker far away');
  // a sailboat on the horizon (scene life), one pixel a beat to the right
  const [bx, by] = [52, HORIZON + 2.5];
  const S = 0.8;
  const B = (list) => list.map(([u, v]) => [bx + u * S, by + (v * S) / 1.2]);
  const tb = cmd(0.2);
  add(`<g class="${drift('db', 52, 52)}"><g class="${vis(tb)}">`
    + `<path d="${polyD(B([[1, -16], [1, -1.5], [9, -1.5]]))}${polyD(B([[-1, -13], [-1, -1.5], [-6.5, -1.5]]))}" fill="${E.w}" stroke="#000" stroke-width="1"/>`
    + `<path d="${polyD(B([[-8, -1], [9, -1], [6.5, 2.5], [-6, 2.5]]))}" fill="${E.r}" stroke="#000" stroke-width="1"/></g></g>`);
  log(tb, 'POLY x3: a sailboat, far away');
}

// ---- 6. the island ---------------------------------------------------------------
const IS = { cx: 186, cy: 290 };
{
  const t0 = T;
  // shallows: two lagoon ellipses
  let t = cmd(0.15);
  add(`<ellipse cx="${IS.cx}" cy="${IS.cy}" rx="178" ry="${r2(64 / ASPECT)}" fill="${F('c50:lb:c')}" class="${vis(t)}"/>`);
  t = cmd(0.15);
  add(`<ellipse cx="${IS.cx}" cy="${IS.cy}" rx="150" ry="${r2(52 / ASPECT)}" fill="${E.c}" class="${vis(t)}"/>`);
  t = cmd(0.15);
  add(`<ellipse cx="${IS.cx}" cy="${IS.cy}" rx="132" ry="${r2(44 / ASPECT)}" fill="${F('c50:c:lc')}" class="${vis(t)}"/>`);
  // foam ring
  const rnd = rng(1992);
  const foam = ellPts(IS.cx, IS.cy + 1, 122, 37 / ASPECT, 40).map(([x, y]) => [x + (rnd() - 0.5) * 3, y + (rnd() - 0.5) * 1.5]);
  t = cmd(0.35);
  outline(polyD(foam), t, 0.3, 'w', 2);
  // sand: wet rim, then dry
  const sand = ellPts(IS.cx, IS.cy, 112, 31 / ASPECT, 36).map(([x, y], i) => {
    const j = 1 + (rnd() - 0.5) * 0.06 + (i % 5 === 0 ? 0.03 : 0);
    return [IS.cx + (x - IS.cx) * j, IS.cy + (y - IS.cy) * j];
  });
  t = plotPoly(sand, 'c50:y:br', { dur: 0.3 });
  const dry = sand.map(([x, y]) => [IS.cx + (x - IS.cx) * 0.93, IS.cy - 2 + (y - IS.cy) * 0.8]);
  t = cmd(0.1);
  fillShape(polyD(dry), 'y', t);
  // a few darker speckles on the dry sand
  t = cmd(0.1);
  fillShape(polyD(dry.map(([x, y]) => [IS.cx + (x - IS.cx) * 0.55, IS.cy - 5 + (y - IS.cy) * 0.45])), 'c12:y:br', t);
  // rocks
  for (const [rx, ry, s] of [[150, 306, 1], [256, 302, 0.8], [96, 296, 0.6]]) {
    const rp = ellPts(rx, ry, 6 * s, 5 * s / ASPECT, 12).map(([x, y]) => [x, Math.min(y, ry + 0.5)]);
    plotPoly(rp, 'lg', { dur: 0.12, gap: 0 });
    fillShape(polyD(ellPts(rx + 1.5 * s, ry + 0.2, 3.5 * s, 2 * s / ASPECT, 8)), 'c50:lg:dg', T);
  }
  log(t0, 'ELLIPSE x3, POLY x5: shallows, foam, sand, rocks');
}

// bushes
function bushPts(cx, by, w, h, n, rnd) {
  const out = [[cx - w / 2, by]];
  for (let i = 0; i <= n * 2; i++) {
    const u = i / (n * 2);
    const a = Math.PI - u * Math.PI;
    const big = i % 2 === 0;
    const rr = big ? 1 : 0.62 + rnd() * 0.12;
    out.push([cx + Math.cos(a) * (w / 2) * rr * (big ? 1.08 : 1), by - Math.sin(a) * h * rr]);
  }
  out.push([cx + w / 2, by]);
  return out;
}
{
  const rnd = rng(7);
  const t0 = T;
  for (const [cx, by, w, h] of [[172, 284, 30, 11], [244, 290, 26, 9], [196, 300, 22, 7]]) {
    const p = bushPts(cx, by, w, h, 5, rnd);
    plotPoly(p, 'g', { dur: 0.2, gap: 0 });
    fillShape(polyD(bushPts(cx - 2, by - 2, w * 0.6, h * 0.7, 4, rnd)), 'c50:g:lgn', T);
  }
  log(t0, 'POLY x3: bushes');
}

// ---- 7. the palm -----------------------------------------------------------------
const PALM = { base: [214, 288], ctrl: [224, 196], top: [256, 118] };
const CROWN = PALM.top;
{
  const t0 = T;
  const N = 14;
  const qp = (u) => {
    const [x0, y0] = PALM.base, [x1, y1] = PALM.ctrl, [x2, y2] = PALM.top;
    const a = (1 - u) * (1 - u), b = 2 * (1 - u) * u, c = u * u;
    return [a * x0 + b * x1 + c * x2, a * y0 + b * y1 + c * y2];
  };
  const left = [], right = [];
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const [x, y] = qp(u);
    const w = 10.5 - 4.5 * u + (i === 0 ? 2.5 : 0);
    left.push([x - w / 2, y]);
    right.push([x + w / 2, y]);
  }
  const trunk = [...left, ...right.reverse()];
  plotPoly(trunk, 'br', { dur: 0.45 });
  // reddish-tan light side
  const hl = [];
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const [x, y] = qp(u);
    const w = 10.5 - 4.5 * u;
    hl.push([x - w / 2 + 1, y]);
  }
  for (let i = N; i >= 0; i--) {
    const u = i / N;
    const [x, y] = qp(u);
    hl.push([x - 0.5, y]);
  }
  const th = cmd(0.1);
  fillShape(polyD(hl), 'c50:br:lr', th);
  // the bark segments: black strokes across the trunk
  let seg = '';
  for (let yy = PALM.base[1] - 6; yy > PALM.top[1] + 3; yy -= 6.5) {
    // find u for this y (monotonic): simple search
    let u = 0;
    while (u < 1 && qp(u)[1] > yy) u += 0.005;
    const [x] = qp(u);
    const w = 10.5 - 4.5 * u;
    seg += lineD([[x - w / 2 + 0.5, yy - 1], [x, yy + 0.6], [x + w / 2 - 0.5, yy - 1]]);
  }
  const ts = cmd(0.35);
  outline(seg, ts, 0.3, 'k', 1);
  log(t0, 'POLY, traced; LINE x24: the trunk and its bark');
}
// fronds: a spine bent by "gravity", leaflet zigzag on both edges
function frond(angleDeg, len, droop, width, rnd) {
  const cx = CROWN[0], cy = CROWN[1] * ASPECT; // work in square units
  let dx = Math.cos((angleDeg * Math.PI) / 180), dy = Math.sin((angleDeg * Math.PI) / 180);
  const n = 12;
  const step = len / n;
  const sp = [[cx, cy]];
  let x = cx, y = cy;
  for (let i = 0; i < n; i++) {
    dy += droop;
    const m = Math.hypot(dx, dy);
    dx /= m; dy /= m;
    x += dx * step; y += dy * step;
    sp.push([x, y]);
  }
  const up = [], down = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const [px, py] = sp[i];
    const [qx, qy] = sp[Math.min(n, i + 1)];
    const [ox, oy] = sp[Math.max(0, i - 1)];
    let tx = qx - ox, ty = qy - oy;
    const m = Math.hypot(tx, ty) || 1;
    tx /= m; ty /= m;
    const nx = -ty, ny = tx; // normal
    const wv = width * Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.15)), 0.7) + (i === 0 ? 1.2 : 0);
    const zig = i % 2 === 0 ? 1 : 0.45;
    up.push([px - nx * wv * (i % 2 ? 0.75 : 1) - tx * (i % 2 ? 0 : 2), py - ny * wv * (i % 2 ? 0.75 : 1) - ty * (i % 2 ? 0 : 2)]);
    down.push([px + nx * wv * 1.25 * zig + tx * (i % 2 ? 0 : 2.5), py + ny * wv * 1.25 * zig + ty * (i % 2 ? 0 : 2.5)]);
  }
  const toS = ([px, py]) => [px, py / ASPECT];
  return { poly: [...up, ...down.reverse()].map(toS), spine: sp.map(toS) };
}
{
  const rnd = rng(3);
  const t0 = T;
  const FRONDS = [
    [-150, 78, 0.14, 6, 'g'], [-30, 80, 0.14, 6, 'g'], [-100, 46, 0.25, 5, 'g'], [-78, 48, 0.25, 5, 'g'],
    [172, 88, 0.1, 7, 'lgn'], [8, 92, 0.1, 7, 'lgn'], [-128, 70, 0.2, 6.5, 'lgn'], [-52, 74, 0.2, 6.5, 'lgn'],
    [146, 62, 0.16, 6, 'lgn'], [36, 64, 0.16, 6, 'lgn'],
  ];
  for (const [a, len, droop, wid, col] of FRONDS) {
    const f = frond(a, len, droop, wid, rnd);
    const t = cmd(0.13);
    fillShape(polyD(f.poly), col === 'g' ? 'c25:g:k' : 'c25:lgn:g', t + 0.12);
    outline(polyD(f.poly), t, 0.12);
    add(`<path d="${lineD(f.spine)}" fill="none" stroke="${E.k}" stroke-width="1" class="${vis(t + 0.14)}"/>`);
  }
  // coconuts
  const t = cmd(0.15);
  let nuts = '';
  for (const [x, y] of [[250, 122], [257, 125], [263, 121]]) nuts += polyD(ellPts(x, y, 3.2, 3.2 / ASPECT, 10));
  add(`<path d="${nuts}" fill="${E.br}" stroke="#000" stroke-width="1" class="${vis(t)}"/>`);
  log(t0, 'POLY x10, traced: fronds; ELLIPSE x3: coconuts');
}

// ---- 8. the raft -----------------------------------------------------------------
{
  const t0 = T;
  const x0 = 298, x1 = 372, y0 = 298, lh = 4.2, N = 5;
  // its shadow in the shallows
  fillShape(polyD(ellPts(334, 312, 46, 10, 20)), 'c50:c:b', cmd(0.1));
  const logs = [];
  for (let i = 0; i < N; i++) {
    const sx = -i * 1.8; // a little perspective: lower logs sit further left
    const yy = y0 + i * lh;
    const body = [[x0 + sx, yy + 0.4], [x1 + sx, yy + 0.4], [x1 + sx, yy + lh], [x0 + sx, yy + lh], [x0 + sx - 1.4, yy + lh / 2 + 0.2]];
    logs.push({ body, sx, yy });
  }
  const tl = cmd(0.35);
  for (const { body, sx, yy } of logs) {
    fillShape(polyD(body), 'br', tl + 0.3);
    fillShape(`M${r2(x0 + sx)} ${r2(yy + 0.4)}H${r2(x1 + sx)}V${r2(yy + 2.2)}H${r2(x0 + sx)}z`, 'wood:y:br', tl + 0.32);
  }
  outline(logs.map(({ body }) => polyD(body)).join(''), tl, 0.3);
  // log ends: cut faces with a growth ring
  const te = cmd(0.15);
  let ends = '', rings = '';
  for (const { sx, yy } of logs) {
    ends += polyD(ellPts(x1 + sx, yy + lh / 2 + 0.2, 2.6, lh / 2, 10));
    rings += polyD(ellPts(x1 + sx, yy + lh / 2 + 0.2, 1.1, lh / 4, 8));
  }
  add(`<g class="${vis(te)}"><path d="${ends}" fill="${E.y}" stroke="#000" stroke-width="1"/><path d="${rings}" fill="none" stroke="${E.br}" stroke-width="1"/></g>`);
  // grain: short black strokes along each log
  let grain = '';
  const rnd = rng(31);
  for (const { sx, yy } of logs) {
    for (let k = 0; k < 3; k++) {
      const gx = x0 + 8 + k * 22 + Math.floor(rnd() * 8);
      grain += lineD([[gx + sx, yy + 2.6], [gx + sx + 6 + Math.floor(rnd() * 5), yy + 2.6]]);
    }
  }
  const tg = cmd(0.2);
  outline(grain, tg, 0.2);
  // two rope lashings across the logs
  let rope = '';
  for (const rx of [316, 352]) {
    rope += polyD([[rx - 1.6, y0 - 0.6], [rx + 1.6, y0 - 0.6], [rx + 1.6 - 1.8 * N, y0 + N * lh + 0.6], [rx - 1.6 - 1.8 * N, y0 + N * lh + 0.6]]);
  }
  const trp = cmd(0.15);
  add(`<path d="${rope}" fill="${F('c50:w:y')}" stroke="#000" stroke-width="1" class="${vis(trp)}"/>`);
  log(t0, 'POLY x5, traced; LINE x15: the raft, brown on yellow');
}

// ---- 9. her ------------------------------------------------------------------------
// Feet at FEET; drawn in screen units (rows are 1.5x tall on screen).
const FEET = [124, 292];
const SKIN = 'c50:y:lr';
const herParts = (pose) => {
  const P = (list) => list.map(([x, y]) => [FEET[0] + x, FEET[1] + y]);
  const parts = [];
  parts.push([P([[-8, 0.5], [-1.5, 0.5], [-1.5, -1.6], [-5.5, -1.8]]), SKIN]); // feet, toes to the left
  parts.push([P([[-2.8, 0.5], [3.8, 0.5], [3.8, -1.6], [-0.8, -1.8]]), SKIN]);
  parts.push([P([[-4.6, -1.2], [-1.6, -1.2], [-1.2, -15], [-4.9, -15]]), SKIN]); // legs
  parts.push([P([[1.0, -1.2], [3.8, -1.2], [4.6, -15], [1.0, -15]]), SKIN]);
  parts.push([P([[-5.6, -13.8], [-0.7, -13.8], [0, -16], [0.7, -13.8], [5.6, -13.8], [5.3, -22], [-5.3, -22]]), 'c25:w:y']); // shorts
  if (pose === 'throw') {
    parts.push([P([[-5.4, -30.5], [-7.4, -30], [-12.5, -26.8], [-12.6, -25.2], [-11, -25], [-6.4, -27.5]]), SKIN]); // arm out front
  } else {
    parts.push([P([[-5.4, -30.8], [-7.3, -30.2], [-8.4, -20.2], [-7.4, -18.6], [-6.2, -19.4], [-6.1, -26.6]]), SKIN]);
  }
  parts.push([P([[-5.3, -22], [5.3, -22], [5.7, -29.6], [4.3, -33.2], [2.7, -33.2], [1.6, -31], [-1.6, -31], [-2.7, -33.2], [-4.3, -33.2], [-5.7, -29.6]]), 'lr']); // tank top
  if (pose === 'throw') {
    parts.push([P([[5.4, -30.6], [7.4, -31.2], [7.6, -40], [6.6, -46.4], [5, -46.2], [5.2, -40], [5.2, -33.4]]), SKIN]); // arm up
  } else {
    parts.push([P([[5.4, -30.8], [7.3, -30.2], [8.4, -20.2], [7.4, -18.6], [6.2, -19.4], [6.1, -26.6]]), SKIN]);
  }
  parts.push([P([[-1.3, -31], [1.3, -31], [1.1, -35], [-1.1, -35]]), SKIN]); // neck
  return parts;
};
const herHead = () => {
  const P = (list) => list.map(([x, y]) => [FEET[0] + x, FEET[1] + y]);
  return [
    [P(ellPts(5.3, -36.7, 2.3, 1.8, 12)), 'br'], // the low bun, at the back
    [P(ellPts(-0.6, -39.2, 4.6, 4.1, 16)), SKIN], // head
    [P([[-4.9, -40.0], [-4.4, -42.0], [-2.8, -43.4], [-0.4, -43.9], [2.2, -43.5], [3.8, -42.2], [4.5, -40.0], [4.3, -37.4], [3.3, -35.6], [2.2, -35.8], [2.3, -37.5], [1.4, -40.6], [-1.2, -41.3], [-3.4, -41.0]]), 'br'], // hair
  ];
};
function emitHer(pose, cls) {
  let s = `<g${cls ? ` class="${cls}"` : ''}>`;
  for (const [p, fill] of herParts(pose)) s += `<path d="${polyD(p)}" fill="${F(fill)}" stroke="#000" stroke-width="1"/>`;
  s += '<g class="nod">';
  for (const [p, fill] of herHead()) s += `<path d="${polyD(p)}" fill="${F(fill)}" stroke="#000" stroke-width="1"/>`;
  const [fx, fy] = FEET;
  // eye, and the headphones: band over the top, cream cup over the near ear
  s += `<path d="M${r2(fx - 4)} ${r2(fy - 39.6)}h1v1h-1z" fill="#000"/>`;
  const band = lineD([[fx + 1.7, fy - 40.6], [fx + 1.1, fy - 43.6], [fx - 1.0, fy - 44.6], [fx - 3.4, fy - 43.9], [fx - 4.6, fy - 41.9]]);
  s += `<path d="${band}" fill="none" stroke="#000" stroke-width="2.2"/><path d="${band}" fill="none" stroke="${E.w}" stroke-width="0.9"/>`;
  s += `<path d="${polyD(ellPts(fx + 1.6, fy - 38.6, 2.0, 2.4, 10))}" fill="${F('c25:w:lg')}" stroke="#000" stroke-width="1"/>`;
  s += '</g>';
  if (pose === 'throw') s += bottleSVG(fx + 6, fy - 48.5, -60);
  return s + '</g>';
}
// a small green bottle with a cork and a rolled note, centred on (x, y)
function bottleSVG(x, y, rot = 0) {
  const P = (list) => list.map(([u, v]) => {
    const a = (rot * Math.PI) / 180;
    const ux = u * Math.cos(a) - v * ASPECT * Math.sin(a);
    const uy = u * Math.sin(a) + v * ASPECT * Math.cos(a);
    return [x + ux, y + uy / ASPECT];
  });
  const glass = P([[-2, -2.2], [4, -2.2], [5.4, -1.4], [5.4, 1.4], [4, 2.2], [-2, 2.2], [-3.4, 1.0], [-6, 0.9], [-6, -0.9], [-3.4, -1.0]]);
  const cork = P([[-8.2, -0.9], [-6, -0.9], [-6, 0.9], [-8.2, 0.9]]);
  const note = P([[-1.2, -0.6], [3.2, -0.6], [3.2, 0.8], [-1.2, 0.8]]);
  return `<path d="${polyD(glass)}" fill="${F('c50:g:lgn')}" stroke="#000" stroke-width="1"/><path d="${polyD(note)}" fill="${E.w}"/><path d="${polyD(cork)}" fill="${E.br}" stroke="#000" stroke-width="1"/>`;
}
{
  const t0 = T;
  // shadow on the sand, then her, outlines first then all the fills at once
  fillShape(polyD(ellPts(FEET[0] + 1, FEET[1] + 0.5, 10, 1.8, 14)), 'c50:y:br', cmd(0.1));
  const tOut = cmd(0.45);
  const tFill = cmd(0.15);
  // the outline-only pass (what traces), then the real figure pops in over it
  let outl = '';
  for (const [p] of herParts('idle')) outl += polyD(p);
  for (const [p] of herHead()) outl += polyD(p);
  add(`<path d="${outl}" fill="none" stroke="#000" stroke-width="1" pathLength="1" class="${trace(tOut, 0.4)}"/>`);
  add(`<g class="${vis(tFill)}"><g class="pIdle">${emitHer('idle')}</g><g class="pThrow">${emitHer('throw')}</g></g>`);
  log(t0, 'POLY x14, traced, then filled: her');
}
add('<!--GAGS-->');

// ---- 10. little waves and two gulls ------------------------------------------------
{
  const rnd = rng(80);
  const sets = ['', ''];
  const inLagoon = (x, y) => ((x - IS.cx) / 186) ** 2 + ((y - IS.cy) / (70 / ASPECT)) ** 2 < 1;
  const inScroll = (x, y) => x > 392 && y < 318;
  const inButton = (x, y) => x > 506 && y > 312;
  let n = 0;
  while (n < 120) {
    const y = HORIZON + 4 + Math.floor(rnd() * (SH - HORIZON - 8));
    const x = Math.floor(rnd() * W);
    const len = 2 + Math.round(((y - HORIZON) / (SH - HORIZON)) * 7 + rnd() * 2);
    if (inLagoon(x, y) || inScroll(x, y) || inButton(x, y) || x + len > W) continue;
    const s = n % 2;
    sets[s] += `M${x} ${y + 0.5}h${len}`;
    n++;
  }
  const t = cmd(0.2);
  add(`<g class="${vis(t)}" fill="none" stroke-width="1"><path class="wA" d="${sets[0]}" stroke="${E.w}"/><path class="wB" d="${sets[1]}" stroke="${E.lc}"/></g>`);
  log(t, 'LINE x120: the waves');
  const gull = (x, y, up) => (up ? lineD([[x - 5, y - 2], [x - 2, y], [x, y + 0.5], [x + 2, y], [x + 5, y - 2]]) : lineD([[x - 5, y + 1.5], [x - 2.5, y - 1], [x, y + 0.5], [x + 2.5, y - 1], [x + 5, y + 1.5]]));
  const tg = cmd(0.2);
  const GULLS = [[352, 132], [372, 124]];
  add(`<g class="${drift('dg', -26, 26)}"><g class="${vis(tg)}" fill="none" stroke="#000" stroke-width="1"><path class="gA" d="${GULLS.map(([x, y]) => gull(x, y, true)).join('')}"/><path class="gB" d="${GULLS.map(([x, y]) => gull(x, y, false)).join('')}"/></g></g>`);
  log(tg, 'LINE x8: two gulls');
}

// ---- 11. the scroll: a door-game menu of her activities -----------------------------
const SC = { x0: 410, x1: 622, y0: 112, y1: 304 };
const MENU = [
  ['W', 'Wait'],
  ['N', 'Nod to the music'],
  ['B', 'Bottle a message'],
  ['C', 'Sip a coconut'],
  ['F', 'Fish, patiently'],
  ['U', 'Up the palm: 1 bar'],
  ['S', 'Sandcastle vs. tide'],
  ['R', 'Wave for rescue'],
  ['L', 'Leave (any time)'],
];
const MENU_X = SC.x0 + 22;
const MENU_Y0 = 157; // top of the first line's capitals
const MENU_DY = 13.5;
const MENU_SX = 0.92;
const MENU_SY = 0.92 / 1.25;
const LIGHT_Y = (i) => MENU_Y0 + i * MENU_DY - 2.2;
{
  const t0 = T;
  // drop shadow, body, aged edges, outline
  const bodyP = [[SC.x0, SC.y0], [SC.x1, SC.y0], [SC.x1, SC.y1], [SC.x0, SC.y1]];
  let t = cmd(0.12);
  fillShape(polyD(off(bodyP, 5, 4)), 'c50:k:b', t);
  t = cmd(0.15);
  fillShape(polyD(bodyP), 'y', t);
  t = cmd(0.12);
  fillShape(`M${SC.x0} ${SC.y0}h7V${SC.y1}h-7zM${SC.x1 - 7} ${SC.y0}h7V${SC.y1}h-7z`, 'c50:y:br', t);
  t = cmd(0.12);
  fillShape(`M${SC.x0 + 7} ${SC.y0}h4V${SC.y1}h-4zM${SC.x1 - 11} ${SC.y0}h4V${SC.y1}h-4z`, 'c25:y:br', t);
  t = cmd(0.3);
  outline(polyD(bodyP), t, 0.3, 'k', 2);
  // rolls, top and bottom: cylinders with curled ends
  const roll = (yc) => {
    const rh = 7;
    const cyl = [[SC.x0 - 8, yc - rh], [SC.x1 + 8, yc - rh], [SC.x1 + 8, yc + rh], [SC.x0 - 8, yc + rh]];
    const tt = cmd(0.3);
    fillShape(polyD(cyl), 'y', tt + 0.2);
    fillShape(`M${SC.x0 - 8} ${yc + 1}H${SC.x1 + 8}V${yc + rh}H${SC.x0 - 8}z`, 'c50:y:br', tt + 0.22);
    fillShape(`M${SC.x0 - 8} ${yc + 4}H${SC.x1 + 8}V${yc + rh}H${SC.x0 - 8}z`, 'br', tt + 0.24);
    fillShape(`M${SC.x0 - 8} ${yc - rh}H${SC.x1 + 8}V${yc - rh + 2}H${SC.x0 - 8}z`, 'w', tt + 0.24);
    outline(polyD(cyl), tt, 0.2, 'k', 2);
    // curled ends
    for (const ex of [SC.x0 - 8, SC.x1 + 8]) {
      const e = ellPts(ex, yc, 5, rh, 16);
      fillShape(polyD(e), 'c50:y:br', tt + 0.28);
      add(`<path d="${polyD(e)}${polyD(ellPts(ex, yc, 2.2, 3.2, 10))}" fill="none" stroke="#000" stroke-width="1.5" class="${vis(tt + 0.3)}"/>`);
    }
  };
  roll(SC.y0 - 1);
  roll(SC.y1 + 1);
  log(t0, 'BAR, POLY, ELLIPSE x4: the scroll and its rolls');

  // heading in the gothic face: glyph strokes pop one after another
  const HEAD = 'Things to Do';
  const gsx = 2.55, gsy = 2.55 / 1.45;
  const gw = gothWidth(HEAD, gsx);
  const gx = Math.round((SC.x0 + SC.x1) / 2 - gw / 2);
  const gy = 122;
  const th = T;
  const shadow = gothText(HEAD, gx + 1.5, gy + 1, gsx, gsy);
  const main = gothText(HEAD, gx, gy, gsx, gsy);
  const tt = cmd(0.6);
  add(`<g class="${vis(tt)}"><path d="${shadow.d}" fill="${E.br}"/></g>`);
  // split the heading's polygons per glyph so it writes on left to right
  let cxu = 0;
  for (const ch of HEAD) {
    const gl = GOTH[ch];
    if (ch !== ' ') {
      const one = gothText(ch, gx + cxu * gsx, gy, gsx, gsy);
      add(`<path d="${one.d}" fill="${E.r}" stroke="${E.r}" stroke-width="0.3" class="${vis(Math.round((th + (cxu / 60) * 0.6) * 20) / 20)}"/>`);
    }
    cxu += gl[0] + 0.8;
  }
  log(th, 'TEXT, gothic: Things to Do');
  // a rule with a diamond
  const ry = 149;
  const mid = (SC.x0 + SC.x1) / 2;
  const tr = cmd(0.2);
  outline(`M${SC.x0 + 22} ${ry + 0.5}H${mid - 7}M${mid + 7} ${ry + 0.5}H${SC.x1 - 22}`, tr, 0.15, 'k', 1);
  fillShape(polyD([[mid - 5, ry + 0.5], [mid, ry - 2.5], [mid + 5, ry + 0.5], [mid, ry + 3.5]]), 'r', tr + 0.15);

  // the lightbar (it moves; see the CSS), drawn before the text
  const tl = cmd(0.15);
  const bar = `<g class="lbar"><path d="M${SC.x0 + 16} ${LIGHT_Y(0) - 1.5}h${SC.x1 - SC.x0 - 32}v12h-${SC.x1 - SC.x0 - 32}z" fill="${E.w}" stroke="#000" stroke-width="1"/><path d="${polyD([[SC.x0 + 10, LIGHT_Y(0) + 1], [SC.x0 + 15, LIGHT_Y(0) + 4.5], [SC.x0 + 10, LIGHT_Y(0) + 8]])}" fill="${E.r}" stroke="#000" stroke-width="0.8"/></g>`;
  add(`<g class="${vis(tl)}">${bar}</g>`);

  // the nine menu lines, one text command each; hotkeys in red
  const tm = T;
  MENU.forEach(([key, label], i) => {
    const t1 = cmd(0.16);
    const y = MENU_Y0 + i * MENU_DY;
    const k1 = strokeText('(', MENU_X, y, MENU_SX, MENU_SY);
    const kk = strokeText(key, MENU_X + k1.w + 1.6 * MENU_SX, y, MENU_SX, MENU_SY, { serif: true });
    const kx = MENU_X + k1.w + 1.6 * MENU_SX + kk.w + 1.6 * MENU_SX;
    const k2 = strokeText(')', kx, y, MENU_SX, MENU_SY);
    const lab = strokeText(label, MENU_X + 30, y, MENU_SX, MENU_SY);
    add(`<g class="${vis(t1)}" fill="none" stroke-width="1"><path d="${k1.d}${k2.d}${lab.d}" stroke="#000"/><path d="${kk.d}" stroke="${E.r}" stroke-width="1.3"/></g>`);
  });
  log(tm, `TEXT x${MENU.length}: the menu, hotkeys in red`);
  // the footer: how to run it
  const FOOT = 'python tools/serve.py';
  const fsx = 0.8, fsy = 0.8 / 1.25;
  const fw = textWidth(FOOT, fsx);
  const tf = cmd(0.25);
  const foot = strokeText(FOOT, Math.round(mid - fw / 2), 286, fsx, fsy);
  add(`<g class="${vis(tf)}"><path d="${foot.d}" fill="none" stroke="${E.b}" stroke-width="1"/></g>`);
  log(tf, 'TEXT: python tools/serve.py');
}

// ---- 12. the button, last of all ------------------------------------------------------
const BTN = { x0: 516, y0: 318, x1: 626, y1: 342 };
function buttonSVG(down) {
  const { x0, y0, x1, y1 } = BTN;
  const lt = down ? E.dg : E.w;
  const rb = down ? E.w : E.dg;
  const o = down ? 1 : 0;
  const label = 'Continue';
  const sx = 0.98, sy = 0.98 / 1.25;
  const lw = textWidth(label, sx);
  const lx = Math.round((x0 + x1) / 2 - lw / 2 - 5) + o;
  const ly = Math.round((y0 + y1) / 2 - 4.5 * sy) + o;
  const lab = strokeText(label, lx, ly, sx, sy, { serif: true });
  const ax = lx + lw + 6;
  const arrow = polyD([[ax, ly + 1], [ax + 6, ly + 4.2 * sy + 1.2], [ax, ly + 9 * sy]]);
  return `<path d="M${x0} ${y0}H${x1}V${y1}H${x0}z" fill="${E.lg}" stroke="#000" stroke-width="2"/>`
    + `<path d="M${x0 + 1} ${y1 - 1}V${y0 + 1}H${x1 - 1}V${y0 + 3}H${x0 + 3}V${y1 - 1}z" fill="${lt}"/>`
    + `<path d="M${x1 - 1} ${y0 + 1}V${y1 - 1}H${x0 + 1}V${y1 - 3}H${x1 - 3}V${y0 + 1}z" fill="${rb}"/>`
    + `<path d="${lab.d}" fill="none" stroke="#000" stroke-width="1.2"/><path d="${arrow}" fill="${E.r}" stroke="#000" stroke-width="1"/>`;
}
{
  const t = cmd(0.3);
  add(`<g class="${vis(t)}"><g class="bUp">${buttonSVG(false)}</g><g class="bDn">${buttonSVG(true)}</g></g>`);
  log(t, 'BUTTON: Continue');
}
const DRAW_DONE = T;

// ================================================================== THE GAGS
// These are not part of the redraw; they happen between 6 s and 36 s, on the beat.

// bottle: positions per beat (screen coords of its centre)
const BOTTLE_PATH = [
  [6.0, 46, 334], [7.5, 58, 326], [8.25, 70, 320], [9.0, 80, 314], [9.75, 90, 308], [10.5, 99, 304], [11.25, 106, 299],
  [12.0, null], // in her hand
  [12.75, 98, 262], [12.9375, 84, 258], [13.125, 70, 264], [13.3125, 58, 276], [13.5, 48, 292], [13.6875, 42, 306],
  [15.0, 52, 305], [15.75, 66, 304], [16.5, 80, 303], [17.25, 94, 301], [18.0, 106, 299],
];
function stepKeyframes(name, frames, prop, base) {
  // frames: [[t, value|null]] in seconds; value null means hidden. Hidden
  // before the first frame and from CLEAR on.
  let k = `@keyframes ${name}{0%{opacity:0;${prop}:${base}}`;
  for (const [t, v] of frames) k += `${pc(t)}{${v === null ? 'opacity:0' : `opacity:1;${prop}:${v}`}}`;
  k += `${pc(CLEAR)}{opacity:0}}`;
  return k;
}
{
  const [, bx, by] = BOTTLE_PATH[0];
  const frames = BOTTLE_PATH.map(([t, x, y]) => [t, x === null ? null : `translate(${r2(x - bx)}px,${r2(y - by)}px)`]);
  css.push(stepKeyframes('bot', frames, 'transform', 'translate(0px,0px)'));
  css.push(`.bot{opacity:0;animation:bot ${LOOP}s step-end infinite}`);
  // the bottle draws itself on arrival: outline first, then the glass
  css.push(`@keyframes botfill{0%,${pc(6.3)}{opacity:0}${pc(6.31)},100%{opacity:1}}.botfill{animation:botfill ${LOOP}s step-end infinite}`);
}
// splash where it lands
css.push(`@keyframes spl{0%{opacity:0}${pc(13.6875)}{opacity:1}${pc(14.25)}{opacity:0}${pc(14.4375)}{opacity:1}${pc(14.8125)}{opacity:0}}.spl{opacity:0;animation:spl ${LOOP}s step-end infinite}`);
// her poses: throw for one beat at 12 s
css.push(`@keyframes pthrow{0%{opacity:0}${pc(12)}{opacity:1}${pc(12.75)}{opacity:0}}.pThrow{opacity:0;animation:pthrow ${LOOP}s step-end infinite}`);
css.push(`@keyframes pidle{0%{opacity:1}${pc(12)}{opacity:0}${pc(12.75)}{opacity:1}}.pIdle{animation:pidle ${LOOP}s step-end infinite}`);
// nodding: down on every beat, up on the off-beat (80 beats a loop)
css.push(`@keyframes nod{0%{transform:translate(0px,0.67px)}50%{transform:translate(0px,0px)}}.nod{animation:nod ${BEAT}s step-end infinite}`);

// shark fin in headphones
const SHARK = [352, 236];
{
  css.push(`@keyframes shk{0%{opacity:0}${pc(21)}{opacity:1}${pc(SINK)}{opacity:1;transform:translate(0px,0px)}${pc(SINK + 0.25)}{transform:translate(0px,5px)}${pc(SINK + 0.5)}{transform:translate(0px,10px)}${pc(SINK + 0.75)}{opacity:0;transform:translate(0px,16px)}}.shk{opacity:0;animation:shk ${LOOP}s step-end infinite}`);
  css.push(`@keyframes shkfill{0%{opacity:0}${pc(21.3)}{opacity:1}}.shkfill{animation:shkfill ${LOOP}s step-end infinite}`);
  css.push(`@keyframes shkph{0%{opacity:0}${pc(21.75)}{opacity:1}}.shkph{animation:shkph ${LOOP}s step-end infinite}`);
  css.push(`@keyframes shkline{0%{stroke-dashoffset:1}${pc(0.3)}{stroke-dashoffset:0}}.shkline{stroke-dasharray:1 1;animation:shkline ${LOOP}s linear 21s infinite}`);
  css.push(`@keyframes shnod{0%{transform:rotate(-7deg)}50%{transform:rotate(0deg)}}.shnod{transform-box:view-box;transform-origin:${SHARK[0]}px ${SHARK[1]}px;animation:shnod ${BEAT}s step-end infinite}`);
}

// the pointer: rest, the Leave line, the button, and home again
const REST = [388, 214];
const LEAVE_PT = [MENU_X + 98, MENU_Y0 + 8 * MENU_DY + 6];
const BTN_PT = [BTN.x0 + 64, BTN.y0 + 15];
{
  const tr = (p) => `translate(${r2(p[0] - REST[0])}px,${r2(p[1] - REST[1])}px)`;
  css.push(`@keyframes ptr{0%,${pc(30)}{transform:${tr(REST)};animation-timing-function:ease-in-out}${pc(31.5)},${pc(33.75)}{transform:${tr(LEAVE_PT)};animation-timing-function:ease-in-out}${pc(35.25)},${pc(57)}{transform:${tr(BTN_PT)};animation-timing-function:ease-in-out}${pc(59.25)},100%{transform:${tr(REST)}}}.ptr{animation:ptr ${LOOP}s infinite}`);
}
// the button goes down for half a beat at the click
css.push(`@keyframes bdn{0%{opacity:0}${pc(CLICK)}{opacity:1}${pc(CLICK + 0.375)}{opacity:0}}.bDn{opacity:0;animation:bdn ${LOOP}s step-end infinite}`);
// the lightbar: on Wait; on Bottle while the bottle is hers; on Nod while the
// shark nods with her; on Leave while the pointer thinks about it
{
  const ty = (i) => `translate(0px,${r2(i * MENU_DY)}px)`;
  css.push(`@keyframes lbar{0%{transform:${ty(0)}}${pc(11.25)}{transform:${ty(2)}}${pc(18.75)}{transform:${ty(0)}}${pc(22.5)}{transform:${ty(1)}}${pc(SINK + 0.75)}{transform:${ty(0)}}${pc(31.5)}{transform:${ty(8)}}${pc(33.75)}{transform:${ty(0)}}}.lbar{transform:${ty(0)};animation:lbar ${LOOP}s step-end infinite}`);
}
// waves shimmer every beat; gulls flap every half beat
css.push(`@keyframes wA{0%{opacity:1}50%{opacity:0}}@keyframes wB{0%{opacity:0}50%{opacity:1}}.wA{animation:wA ${BEAT * 2}s step-end infinite}.wB{opacity:0;animation:wB ${BEAT * 2}s step-end infinite}`);
css.push(`@keyframes gA{0%{opacity:1}50%{opacity:0}}@keyframes gB{0%{opacity:0}50%{opacity:1}}.gA{animation:gA ${BEAT}s step-end infinite}.gB{opacity:0;animation:gB ${BEAT}s step-end infinite}`);

// ================================================================== STATUS BAR
const MSGS = [
  [0, 6, 'ISLE WAIT BBS * NODE 1 * NOTHING IS HAPPENING'],
  [6, 11.25, 'INCOMING: ONE BOTTLE. SLOWLY.'],
  [11.25, 15, 'BOTTLE RECEIVED. SENDING IT BACK...'],
  [15, 18, 'BOTTLE SENT. BOTTLE COMING BACK.'],
  [18, 21, 'RETURNED TO SENDER. SENDER: HER.'],
  [21, SINK + 0.75, 'SHARK IN HEADPHONES. SAME BEAT. SAME NOD.'],
  [SINK + 0.75, 31.5, 'NOTHING IS HAPPENING. AS SCHEDULED.'],
  [31.5, 33.75, 'LEAVE? ANY TIME. MAYBE AFTER THIS SONG.'],
  [33.75, CLICK, 'STAYING.'],
  [CLICK, CLEAR, 'CONTINUE.'],
  [CLEAR, DRAW_DONE + 0.2, 'RECEIVING SCREEN AT 2400 BPS'],
  [DRAW_DONE + 0.2, 60, 'SCREEN RECEIVED. STILL AN ISLAND.'],
];
function statusBar() {
  let s = `<g><path d="M0 ${SH}H${W}V${H}H0z" fill="${E.lg}"/><path d="M0 ${SH + 0.5}H${W}" stroke="${E.w}" stroke-width="1"/>`;
  const field = (x0, x1) => `<path d="M${x0} ${SH + 3}H${x1}V${H - 2}H${x0}z" fill="${E.lg}"/><path d="M${x0} ${H - 2}V${SH + 3}H${x1}" fill="none" stroke="${E.dg}" stroke-width="1" transform="translate(0.5 0.5)"/><path d="M${x1} ${SH + 3}V${H - 2}H${x0}" fill="none" stroke="${E.w}" stroke-width="1" transform="translate(0.5 0.5)"/>`;
  s += field(3, 434) + field(439, 530) + field(535, 636);
  const ty = SH + 5;
  MSGS.forEach(([t0, t1, msg], i) => {
    if (t0 === 0) {
      css.push(`@keyframes m${i}{0%{opacity:1}${pc(t1)}{opacity:0}}.m${i}{animation:m${i} ${LOOP}s step-end infinite}`);
    } else {
      css.push(`@keyframes m${i}{0%{opacity:0}${pc(t0)}{opacity:1}${pc(t1)}{opacity:0}}.m${i}{opacity:0;animation:m${i} ${LOOP}s step-end infinite}`);
    }
    s += `<g class="m${i}">${bmText(msg, 8, ty, 'k')}</g>`;
  });
  // progress bar while the screen is received: steps across the free part of the field
  const px0 = 8 + 7 * 'RECEIVING SCREEN AT 2400 BPS'.length + 8;
  const px1 = 428;
  const steps = 24;
  const dur = DRAW_DONE - CLEAR;
  css.push(`@keyframes prg{0%{opacity:0}${pc(CLEAR)}{opacity:1}${pc(DRAW_DONE + 0.2)}{opacity:0}}.prg{opacity:0;animation:prg ${LOOP}s step-end infinite}`);
  css.push(`@keyframes prgw{0%{transform:scaleX(0)}${pc(dur)},100%{transform:scaleX(1)}}.prgw{transform-box:view-box;transform-origin:${px0}px 0px;transform:scaleX(0);animation:prgw ${LOOP}s steps(${steps},end) ${r2(CLEAR)}s infinite}`);
  s += `<g class="prg"><path d="M${px0 - 1} ${ty - 1}H${px1 + 1}V${ty + 8}H${px0 - 1}z" fill="${E.k}"/><path class="prgw" d="M${px0} ${ty}H${px1}V${ty + 7}H${px0}z" fill="${E.b}"/></g>`;
  s += `<g>${bmText('2400 BPS', 451, ty, 'k')}${bmText('80 BPM', 548, ty, 'k')}</g>`;
  // beat light: on for the first quarter of every beat
  css.push(`@keyframes led{0%{opacity:1}25%{opacity:0}}.led{animation:led ${BEAT}s step-end infinite}`);
  s += `<path d="M600 ${ty}h22v7h-22z" fill="${E.dg}"/><path class="led" d="M600 ${ty}h22v7h-22z" fill="${E.lgn}"/>`;
  return s + '</g>';
}

// ================================================================== GAG LAYER
function gagLayer() {
  let s = '';
  // the bottle (it lives at BOTTLE_PATH[0] and is moved by the CSS)
  const [, bx, by] = BOTTLE_PATH[0];
  css.push(`@keyframes botl{0%{stroke-dashoffset:1}${pc(0.3)}{stroke-dashoffset:0}}.botl{stroke-dasharray:1 1;animation:botl ${LOOP}s linear 6s infinite}`);
  const glassOutline = polyD([[bx - 2, by - 2.2], [bx + 4, by - 2.2], [bx + 5.4, by - 1.4], [bx + 5.4, by + 1.4], [bx + 4, by + 2.2], [bx - 2, by + 2.2], [bx - 3.4, by + 1], [bx - 8.2, by + 0.9], [bx - 8.2, by - 0.9], [bx - 3.4, by - 1]]);
  s += `<g class="bot"><g class="botfill">${bottleSVG(bx, by)}</g><path class="botl" d="${glassOutline}" fill="none" stroke="#000" stroke-width="1" pathLength="1"/>`;
  s += `<path d="M${bx + 7} ${by + 2.5}h5M${bx - 12} ${by + 3}h6" stroke="${E.w}" stroke-width="1"/></g>`;
  // splash where the throw lands
  const [sx, sy] = [42, 306];
  s += `<path class="spl" d="M${sx - 7} ${sy - 1}l-3 -4M${sx} ${sy - 3}v-6M${sx + 7} ${sy - 1}l3 -4M${sx - 3} ${sy - 9}h1M${sx + 4} ${sy - 10}h1M${sx - 10} ${sy + 1}h20" fill="none" stroke="${E.w}" stroke-width="1.5"/>`;
  // the shark: fin, cream headphones, ripples; clipped at the water line
  const [fx, fy] = SHARK;
  const SC = 1.35;
  const P = (list) => list.map(([x, y]) => [fx + x * SC, fy + y * SC]);
  const fin = P([[-10, 0], [-5.5, -4.5], [-1.5, -9.5], [2.2, -12.6], [3.6, -11.6], [4.2, -6.5], [8, 0]]);
  const finHi = P([[-8, 0], [-4.5, -4], [-1, -8.6], [1.6, -10.6], [0.4, -6], [-2, 0]]);
  const band = lineD(P([[-4.2, -7.6], [-2.2, -12.2], [1.6, -14.6], [5.2, -12.6], [6.2, -7.2]]));
  const cupL = polyD(P(ellPts(-4.6, -6.2, 2.2, 2.6, 10)));
  const cupR = polyD(P(ellPts(6.2, -5.6, 2.2, 2.6, 10)));
  css.push(`@keyframes shr{0%{opacity:0}${pc(21)}{opacity:1}${pc(SINK + 0.75)}{opacity:0}}.shr{opacity:0;animation:shr ${LOOP}s step-end infinite}`);
  s += `<g class="shr"><path d="M${fx - 24} ${fy + 0.5}h10M${fx - 10} ${fy + 2.5}h22M${fx + 14} ${fy + 0.5}h11M${fx - 5} ${fy + 4.5}h12" stroke="${E.w}" stroke-width="1"/></g>`;
  s += `<g clip-path="url(#shclip)"><g class="shk"><g class="shnod">`;
  s += `<g class="shkfill"><path d="${polyD(fin)}" fill="${E.dg}" stroke="#000" stroke-width="1"/><path d="${polyD(finHi)}" fill="${F('c50:dg:lg')}"/></g>`;
  s += `<path class="shkline" d="${polyD(fin)}" fill="none" stroke="#000" stroke-width="1" pathLength="1"/>`;
  s += `<g class="shkph"><path d="${band}" fill="none" stroke="#000" stroke-width="2.6"/><path d="${band}" fill="none" stroke="${E.w}" stroke-width="1.2"/><path d="${cupL}${cupR}" fill="${F('c25:w:lg')}" stroke="#000" stroke-width="1"/></g>`;
  s += '</g></g></g>';
  return s;
}

// ================================================================== POINTER
function pointer() {
  const [x, y] = REST;
  const arrow = [[0, 0], [0, 16], [4, 12.5], [7, 18.5], [9.6, 17.4], [6.6, 11.5], [11.4, 11.5]].map(([u, v]) => [x + u, y + v / ASPECT]);
  return `<g class="ptr"><path d="${polyD(arrow)}" fill="${E.w}" stroke="#000" stroke-width="1"/></g>`;
}

// ================================================================== ASSEMBLY
const gags = gagLayer();
const status = statusBar();
const ptr = pointer();
const bodyStr = body.join('\n').replace('<!--GAGS-->', gags);

const ALT = 'CASTAWAY drawn as a RIPscrip BBS screen: sky rings, a palm island, her, a parchment menu and a Continue button.';
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${r2(H * ASPECT)}" preserveAspectRatio="none" shape-rendering="crispEdges" role="img" aria-label="${ALT}">
<title>${ALT}</title>
<style>
${css.join('\n')}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}
</style>
<defs>
${patDefs.join('\n')}
<clipPath id="sky"><path d="M0 0H${W}V${HORIZON + 1}H0z"/></clipPath>
<clipPath id="shclip"><path d="M0 0H${W}V${SHARK[1] + 0.5}H0z"/></clipPath>
${bmDefs.join('\n')}
${extraDefs.join('\n')}
</defs>
<path d="M0 0H${W}V${SH}H0z" fill="#000"/>
${bodyStr}
${status}
${ptr}
</svg>
`;

// ================================================================== LINK BUTTONS
// Buttons inside a picture cannot be clicked, so the README repeats them as
// four small button pictures, each wrapped in its own link. Same bevel, same
// serif face, a little EGA icon on the left. Static.
function linkButton(label, icon) {
  const sx = 1.0, sy = 1.0 / 1.25;
  const lw = textWidth(label, sx);
  const bw = Math.round(30 + lw + 12);
  const bh = 22;
  const lx = 28, ly = Math.round(bh / 2 - 4.5 * sy);
  const lab = strokeText(label, lx, ly, sx, sy, { serif: true });
  const key = strokeText(label[0], lx, ly, sx, sy, { serif: true });
  const cx = 15, cy = bh / 2;
  let ic = '';
  if (icon === 'run') ic = `<path d="${polyD([[cx - 4, cy - 5.5], [cx + 6, cy], [cx - 4, cy + 5.5]])}" fill="${E.lgn}" stroke="#000" stroke-width="1"/>`;
  if (icon === 'clock') ic = `<path d="${polyD(ellPts(cx, cy, 6.5, 6.5 / ASPECT * 1.15, 16))}" fill="${E.w}" stroke="#000" stroke-width="1"/><path d="M${cx} ${cy}V${r2(cy - 3.6)}M${cx} ${cy}H${cx + 4}" fill="none" stroke="${E.r}" stroke-width="1"/>`;
  if (icon === 'note') ic = `<path d="${polyD(ellPts(cx - 2.5, cy + 3.2, 3, 2.1, 10))}${polyD(ellPts(cx + 4.5, cy + 2.2, 3, 2.1, 10))}" fill="${E.b}" stroke="#000" stroke-width="1"/><path d="M${cx + 0.5} ${cy + 3}V${cy - 6}L${cx + 7.5} ${cy - 7}V${cy + 2}" fill="none" stroke="#000" stroke-width="1.4"/>`;
  if (icon === 'scroll') ic = `<path d="M${cx - 6} ${cy - 6}H${cx + 6}V${cy + 6}H${cx - 6}z" fill="${E.y}" stroke="#000" stroke-width="1"/><path d="M${cx - 3.5} ${cy - 3.5}h7M${cx - 3.5} ${cy - 1}h7M${cx - 3.5} ${cy + 1.5}h7M${cx - 3.5} ${cy + 4}h4" fill="none" stroke="${E.br}" stroke-width="1"/>`;
  const svgB = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${bw} ${bh}" width="${bw}" height="${r2(bh * ASPECT)}" preserveAspectRatio="none" shape-rendering="crispEdges" role="img" aria-label="${label}">
<title>${label}</title>
<path d="M0 0H${bw}V${bh}H0z" fill="#000"/>
<path d="M1 1H${bw - 1}V${bh - 1}H1z" fill="${E.lg}"/>
<path d="M1 ${bh - 1}V1H${bw - 1}V3H3V${bh - 1}z" fill="${E.w}"/>
<path d="M${bw - 1} 1V${bh - 1}H1V${bh - 3}H${bw - 3}V1z" fill="${E.dg}"/>
${ic}
<path d="${lab.d}" fill="none" stroke="#000" stroke-width="1.2"/>
<path d="${key.d}" fill="none" stroke="${E.r}" stroke-width="1.4"/>
</svg>
`;
  return svgB;
}
const BUTTONS = [['run', 'Run it', 'run'], ['schedule', 'Schedule', 'clock'], ['sound', 'Sound', 'note'], ['log', 'Log', 'scroll']];

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, svg);
const kb = (Buffer.byteLength(svg) / 1024).toFixed(1);
console.log(`wrote ${path.relative(process.cwd(), OUT)} (${kb} KB); redraw ${CLEAR}s -> ${DRAW_DONE}s; ${visIds.size} draw times`);
for (const [slug, label, icon] of BUTTONS) {
  const f = path.resolve(here, `../assets/${SLUG}-btn-${slug}.svg`);
  fs.writeFileSync(f, linkButton(label, icon));
  console.log(`wrote ${path.relative(process.cwd(), f)}`);
}
if (process.argv.includes('--log')) for (const [t, w] of commandLog) console.log(`${t.toFixed(2).padStart(6)}  ${w}`);
