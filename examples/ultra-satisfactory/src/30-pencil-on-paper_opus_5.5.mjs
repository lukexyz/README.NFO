#!/usr/bin/env node
// ULTRA-SATISFACTORY as a page that draws itself: blue paper with a woven grain, chalk-white
// line art, and a green pencil that travels along every stroke while the line appears behind
// it. The style is the late-90s DOS "pencil on paper" intro (catalogue entry pc-09: Razor 1911
// Cracktro #11, code and graphics by Hetero). Nothing from it is reproduced here: the subject,
// the mascot, the lettering and the wording are all original.
//
// What gets drawn: a three-machine factory plan whose numbers are real standard recipes from
// the app's data (Smelter: Iron Ingot 30/min; Constructor: Iron Plate 20/min; Assembler:
// Reinforced Iron Plate 5/min, which needs 60 Screws/min that nobody has connected), a cog
// on legs sprinting in with a crate of screws, the three tabs and a p.s. Then the page is
// held, wiped, and the heading (the name and the one-line pitch) is written again.
//
// Regenerate:  node examples/ultra-satisfactory/src/30-pencil-on-paper_opus_5.5.mjs
//   --specimen <file.svg>   writes a font specimen sheet instead (for checking glyphs)
//   --still <file.svg>      writes the finished page with no animation (for checking layout)
//
// Plain Node, no dependencies, fully deterministic (one seeded PRNG, no clock).
//
// How the animation works
//   * Handwriting is a single-stroke font defined below: every glyph is a few pen strokes
//     given as points, smoothed with a Catmull-Rom spline and jittered per letter, so no two
//     letters are identical. It is emitted as <path> data, never <text>.
//   * Every stroke is one <path> with pathLength = the seconds it takes to draw and
//     stroke-dasharray = "seconds it stays visible, seconds it stays hidden" (the two add up
//     to the loop length). That puts every stroke on a common clock, so ONE shared keyframe
//     rule, stroke-dashoffset running from CLEAR to CLEAR - LOOP, draws all of them in order,
//     holds them, and un-draws them together when the page clears. No per-stroke CSS.
//   * The pencil rides one SMIL animateMotion along the same points, with keyTimes/keyPoints
//     taken from the same timeline, so its point sits on the end of the newest line.
//   * The pencil's angle is a second SMIL track worked out from where its point is: it lies
//     flatter near the bottom edge and hangs steeper near the right edge, so it stays on the
//     paper instead of sliding off it.
//   * The loop starts at "heading just written", so the first frame already shows the name
//     and the pitch, and the pencil goes straight to work on the factory. The heading is
//     rewritten at the end of each loop, after the page clears.
//   * CSS cannot pause SMIL, so the travelling pencil has a still twin that
//     prefers-reduced-motion swaps in; the strokes just drop their animation, which leaves the
//     finished page.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '30-pencil-on-paper_opus_5.5';
const OUT = path.join(HERE, '..', 'assets', `${SLUG}.svg`);

const W = 1000, H = 540;
const PAPER = '#2b5fa8';
const CHALK = '#eaf1ff';

// ---------------------------------------------------------------------------------------------
// Seeded PRNG (mulberry32)
// ---------------------------------------------------------------------------------------------
function makeRng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
let rnd = makeRng(477211);
const J = (a) => (rnd() * 2 - 1) * a;          // jitter in [-a, a]
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// ---------------------------------------------------------------------------------------------
// The handwriting. Glyph box: baseline y = 0, x-height 10, cap height 16, y grows upwards.
// Each entry is [advance width, stroke, stroke, ...]; a stroke is "x,y x,y ..." in pen order.
// Points are joined by a smooth curve; a "!" after a point makes it a hard corner.
// ---------------------------------------------------------------------------------------------
const BOWL = '7.6,7.8 5.6,9.9 3,9.6 1,7 0.6,4 1.8,1.2 4,0 6.2,1.6 7.6,5';
const OVAL = '5.4,16 2.4,14.2 0.7,8 2.2,2 5,0 7.9,2 9.4,8 7.9,14 4.8,16';
const GLYPHS = {
  A: [10, '0,0! 5,16! 10,0', '2.1,5.6 8,5.9'],
  B: [10, '1,16! 1,0', '0.4,16! 5,16.1 8,14.6 8.3,11.6 5.6,9 1.2,8.5! 6,8.4 9.3,6.3 9.4,3 6.8,0.4 0.4,0'],
  C: [10, '9,12.8 7.2,15.4 4.6,16 1.8,13.6 0.6,8 1.8,2.6 4.8,0 7.6,0.8 9.4,3.4'],
  D: [10.5, '1.2,16! 1.2,0', '0.3,16! 4.6,15.9 8.6,13 9.9,8 8.6,3 4.6,0.1 0.3,0'],
  E: [9.5, '8.6,16! 1,16! 1,0! 9,0', '1,8.3 7,8.5'],
  F: [9, '9,16! 1,16! 1,0', '1,8.3 6.8,8.5'],
  G: [10.5, '9,12.8 7.2,15.4 4.6,16 1.8,13.6 0.6,8 1.8,2.6 4.8,0 7.8,0.9 9.5,3.6 9.6,7.2! 5.6,7.2'],
  H: [10, '1,16! 1,0', '9,16! 9,0', '1,8.2 9,8.5'],
  I: [6, '0.6,16 5.4,16', '3,16! 3,0', '0.6,0 5.4,0'],
  J: [8.5, '7.2,16! 7.2,4.4 6.2,1.4 3.8,0 1.4,1.2 0.5,4'],
  K: [10, '1.2,16! 1.2,0', '9,16! 1.4,7.2', '4.2,9.6! 9.6,0'],
  L: [9, '1.2,16! 1.2,0! 8.6,0'],
  M: [12, '1,0! 1,16! 6,5! 11,16! 11,0'],
  N: [10, '1,0! 1,16! 9,0! 9,16'],
  O: [10, OVAL],
  P: [9.5, '1.2,16! 1.2,0', '0.4,16! 5.4,16 8.7,14.2 9,11 6.2,8.2 1.2,7.8'],
  Q: [10.5, OVAL, '5.6,4.2 10,-1.2'],
  R: [10, '1.2,16! 1.2,0', '0.4,16! 5.4,16 8.7,14.2 9,11.2 6.2,8.4 1.2,8! 4.6,8! 9.6,0'],
  S: [9.5, '8.8,13.2 7,15.5 4.6,16 1.9,14.8 1,12.2 2.4,9.4 5,8.2 7.8,6.6 9,4 8,1.4 5,0 2,0.7 0.5,3.2'],
  T: [10, '0,16 10,16', '5,16! 5,0'],
  U: [10, '1,16 1,5.4 2.2,1.6 5,0 7.8,1.6 9,5.4 9,16'],
  V: [10, '0.5,16! 5,0! 9.5,16'],
  W: [14, '0.5,16! 3.6,0! 7,11! 10.4,0! 13.5,16'],
  X: [10, '1,16! 9,0', '9,16! 1,0'],
  Y: [10, '0.5,16! 5,8! 9.5,16', '5,8! 5,0'],
  Z: [10, '1,16! 9,16! 1,0! 9.2,0'],
  a: [10, BOWL, '7.7,10! 7.7,2.4 8.3,0.5 9.6,0.6'],
  b: [9.5, '1.2,16.5! 1.2,0', '1.2,6.4 3,9.2 5.6,10 8,8.2 8.6,5 7.6,1.6 5.2,0 2.8,0.8 1.2,3.2'],
  c: [8.5, '7.6,7.8 5.8,9.9 3.2,9.6 1.1,7 0.6,4 1.8,1.1 4.4,0 6.8,0.9 8,2.6'],
  d: [10, BOWL, '7.7,16.5! 7.7,2.4 8.3,0.5 9.6,0.6'],
  e: [9, '1.1,5! 7.9,5.5! 7.3,8.2 5.3,10 3,9.5 1.2,7.2 0.7,4 1.9,1.1 4.5,0 7,0.8 8.3,2.6'],
  f: [7, '7,14.6 5.8,16.4 4.2,16 3.3,13.6 3.2,8 3.2,0', '0.6,9.6 6.2,9.9'],
  g: [9.5, BOWL, '7.7,10! 7.7,-2.4 6.6,-5.2 4.2,-6 1.6,-5'],
  h: [9.5, '1.2,16.5! 1.2,0', '1.2,6 3,9 5.4,10 7.5,8.6 8,6 8,0'],
  i: [4, '1.6,10! 1.6,2.2 2.1,0.5 3.3,0.5', '1.5,13.4 1.8,13.9'],
  j: [4.8, '3.2,10! 3.2,-3 2.2,-5.4 0.2,-5.6', '3.1,13.4 3.4,13.9'],
  k: [8.5, '1.2,16.5! 1.2,0', '7.4,10! 1.4,4.4', '3.4,6.2! 8,0'],
  l: [4, '1.6,16.5! 1.6,2.2 2.1,0.5 3.4,0.5'],
  m: [13.5, '1.2,10! 1.2,0', '1.2,6.4 2.8,9.2 4.8,10 6.3,8.6 6.6,6 6.6,0', '6.6,6.4 8.2,9.2 10.2,10 11.7,8.6 12,6 12,0'],
  n: [9.5, '1.2,10! 1.2,0', '1.2,6 3,9 5.4,10 7.5,8.6 8,6 8,0'],
  o: [9.5, '4.8,10 2.4,9 0.8,5 2,1.2 4.6,0 7.2,1.2 8.5,5 7.2,8.8 4.4,9.9'],
  p: [9.5, '1.2,10! 1.2,-6', '1.2,6.4 3,9.2 5.6,10 8,8.2 8.6,5 7.6,1.6 5.2,0 2.8,0.8 1.2,3.2'],
  q: [9.2, BOWL, '7.7,10! 7.7,-6'],
  r: [7.5, '1.2,10! 1.2,0', '1.2,6 2.8,8.8 4.8,10 7,9.2'],
  s: [8, '7,8.2 5.4,9.8 3.4,10 1.6,9 1.2,7 2.8,5.6 5.2,4.6 7,3.2 7,1.4 5.2,0.1 3,0 0.8,1.4'],
  t: [7.5, '3.2,14.5! 3.2,2.6 3.9,0.6 5.4,0.2 6.8,1.2', '0.4,9.7 6.4,10'],
  u: [10, '1.2,10 1.2,4 2.2,1 4.3,0 6.3,1.2 7.8,4.4', '7.8,10! 7.8,2.2 8.4,0.4 9.6,0.6'],
  v: [8.5, '0.6,10! 4.2,0! 8,10'],
  w: [12, '0.6,10! 3.1,0! 6,8! 9,0! 11.5,10'],
  x: [8.4, '0.8,10! 7.6,0', '7.6,10! 0.8,0'],
  y: [8.8, '0.8,10! 4.5,0.8', '8.2,10! 3.4,-3.4 1.9,-5.4 0.1,-5.7'],
  z: [8.8, '0.8,10! 7.6,10! 0.8,0! 8,0'],
  0: [9, '4.6,16 2,14 0.8,8 2,2 4.5,0 7,2 8.2,8 7,14 4.2,16'],
  1: [7, '1,12.4! 4.6,16! 4.6,0'],
  2: [9.5, '1,12.4 2.4,15.2 5,16 7.4,14.8 8,12 6.4,8.6 0.8,0! 8.8,0'],
  3: [9.5, '1,14 3,15.8 5.4,16 7.7,14.3 7.5,11 4.4,8.6! 7.4,7.6 8.6,4.6 7.5,1.6 4.8,0 2,0.5 0.6,2.6'],
  4: [10, '7,0! 7,16! 0.5,5! 9.8,5'],
  5: [9.5, '8.4,16! 2,16! 1.5,9.2! 4.4,10.2 7.4,9 8.7,5.6 7.4,1.8 4.4,0 1.8,0.6 0.5,2.6'],
  6: [9, '8,14.6 6,16 3.6,15 1.6,11.6 0.8,6 1.8,2 4.5,0 7.2,1.4 8.3,4.8 7.2,8.2 4.6,9.4 2.2,8.4 1,5.6'],
  7: [9.5, '0.8,16! 9,16! 3.6,0', '3.2,8 8,8.3'],
  8: [10, '5,8.6 2.2,10.6 1.6,13.3 3,15.5 5,16 7,15.4 8.2,13.2 7.4,10.6 5,8.6 2,6.6 0.8,3.6 2.2,1 5,0 7.8,1 9,3.8 7.8,6.6 5.2,8.7'],
  9: [9.5, '8.3,12 7,15 4.6,16 2,14.8 1,11.6 2.2,8.6 4.8,7.6 7.2,8.8 8.3,12! 8.2,5 6.4,1 3.4,0'],
  '-': [8, '1,5.8 7,6.1'],
  ',': [3.6, '1.9,1 1.7,-1 0.6,-2.8'],
  '.': [3.6, '1.5,0.2 1.9,0.7'],
  '/': [7, '0.4,-1.5 6.6,16.8'],
  '&': [10, '9.4,0.2! 2.6,11.6 2.4,14 3.8,15.9 5.6,15 6,13 4.6,10.6 1.6,6.6 0.8,3.6 2.2,0.9 4.8,0 7,1.4 9.2,6.4'],
  ':': [3.8, '1.6,7.4 2,7.9', '1.5,0.2 1.9,0.7'],
  '!': [4.2, '2,16 2,4.6', '1.9,0.2 2.3,0.7'],
  "'": [3, '1.7,16.6 1.3,13'],
  '(': [5, '4.2,17.5 1.9,12 1.2,6 2.2,0 4.2,-3'],
  ')': [5, '0.8,17.5 3.1,12 3.8,6 2.8,0 0.8,-3'],
  '+': [9, '1,6 8,6.2', '4.5,9.8 4.5,2.4'],
  '=': [9, '1,7.8 8,8', '1,4 8,4.2'],
  '?': [9, '1,12.6 2.4,15.2 4.8,16 7.2,14.8 7.7,12.2 6,9.4 4.3,7.4 4.2,4.8', '4.2,0.2 4.6,0.7'],
};
const parsed = new Map();
function glyph(ch) {
  if (!parsed.has(ch)) {
    const g = GLYPHS[ch];
    if (!g) throw new Error(`no glyph for "${ch}"`);
    parsed.set(ch, {
      w: g[0],
      strokes: g.slice(1).map((s) => s.trim().split(/\s+/).map((tok) => {
        const c = tok.endsWith('!');
        const [x, y] = (c ? tok.slice(0, -1) : tok).split(',').map(Number);
        return { x, y, c };
      })),
    });
  }
  return parsed.get(ch);
}
const SPACE = 5.8;
function measure(str, s, track = 1.7) {
  let w = 0;
  for (const ch of str) w += ch === ' ' ? SPACE * s : (glyph(ch).w + track) * s;
  return w - track * s;
}

// ---------------------------------------------------------------------------------------------
// Stroke store. A stroke is { pts: [{x, y, c}], w: width key, v: drawing speed (units/s) }.
// ---------------------------------------------------------------------------------------------
const WIDTHS = { T: 7.4, M: 3.3, S: 2.7, D: 3.1, F: 3.5 };
const SPEED = { title: 950, tag: 1200, small: 1020, draw: 1500, dash: 1900 };
const page = [];   // everything the pencil draws under the heading, in drawing order
const title = [];  // the heading: name, underlines, pitch (written at the end of the loop, so it is there at the start of the next)
let target = page;
let curW = 'D', curV = SPEED.draw;
const P = (x, y, c = false) => ({ x, y, c });
let pendingPause = 0;
function add(pts, w = curW, v = curV) { target.push({ pts, w, v, pause: pendingPause }); pendingPause = 0; }
const pause = (sec) => { pendingPause += sec; };   // the pencil hesitates before the next stroke

// Write a string by hand. (x, y) is the left end of the baseline; s scales the glyph box.
function hand(str, x, y, s, o = {}) {
  const { w = 'S', v = SPEED.small, slant = 0.1, track = 1.7, wob = 0.45, tilt = 0.06, size = 0.07, angle = 0 } = o;
  let pen = 0, by = 0;
  const ca = Math.cos(angle), sa = Math.sin(angle);
  const jit = 0.1 + 0.11 * s;
  for (const ch of str) {
    if (ch === ' ') { pen += SPACE * s; continue; }
    const g = glyph(ch);
    by = clamp(by + J(wob) * s, -wob * 1.7 * s, wob * 1.7 * s);
    const rot = J(tilt), sc = 1 + J(size);
    const cr = Math.cos(rot), sr = Math.sin(rot);
    for (const st of g.strokes) {
      add(st.map((p) => {
        const gx = p.x - g.w / 2, gy = p.y;
        let X = (gx * cr + gy * sr) * sc + g.w / 2;
        const Y = (-gx * sr + gy * cr) * sc;
        X += slant * Y;
        const lx = pen + X * s + J(jit), ly = by - Y * s + J(jit);
        return P(x + lx * ca - ly * sa, y + lx * sa + ly * ca, p.c);
      }), w, v);
    }
    pen += (g.w + track + J(0.3)) * s;
  }
  return x + pen * ca;
}

// A straight line drawn freehand: gently wavy, never quite where it was aimed.
function wl(x1, y1, x2, y2, o = {}) {
  const { amp = 0.9, w, v, step = 30 } = o;
  const len = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / len, uy = (y2 - y1) / len;
  const n = Math.max(1, Math.round(len / step));
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, off = J(i === 0 || i === n ? amp * 0.5 : amp);
    pts.push(P(x1 + (x2 - x1) * t - uy * off + J(0.3), y1 + (y2 - y1) * t + ux * off + J(0.3)));
  }
  add(pts, w, v);
}
// A polyline with hard corners, each edge a little wobbly. close = come back to the start.
function pl(list, o = {}) {
  const { amp = 0.7, w, v, close = false, step = 34 } = o;
  const src = close ? [...list, list[0]] : list;
  const pts = [];
  for (let i = 0; i < src.length; i++) {
    const [x, y] = src[i];
    if (i > 0) {
      const [px, py] = src[i - 1];
      const len = Math.hypot(x - px, y - py), n = Math.floor(len / step);
      for (let k = 1; k <= n; k++) {
        const t = k / (n + 1), off = J(amp);
        pts.push(P(px + (x - px) * t - ((y - py) / len) * off, py + (y - py) * t + ((x - px) / len) * off));
      }
    }
    const miss = close && i === src.length - 1 ? 1.3 : 0;
    pts.push(P(x + J(amp * 0.6) + J(miss), y + J(amp * 0.6) + J(miss), true));
  }
  add(pts, w, v);
}
// A smooth curve through points [x, y, corner?].
function cv(list, o = {}) {
  const { amp = 0.5, w, v } = o;
  add(list.map(([x, y, c]) => P(x + J(amp), y + J(amp), !!c)), w, v);
}
// A freehand circle or ellipse: the ends overlap instead of meeting.
function circ(cx, cy, rx, ry = rx, o = {}) {
  const { start = -1.9, over = 0.4, amp = 0.035, w, v } = o;
  const n = o.n || Math.max(7, Math.round((rx + ry) / 3));
  const total = Math.PI * 2 + over, steps = Math.ceil((n * total) / (Math.PI * 2));
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const a = start - (total * i) / steps, k = 1 + J(amp) + (i / steps) * 0.04;
    pts.push(P(cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k));
  }
  add(pts, w, v);
}
// A gear outline as one pen stroke.
function gear(cx, cy, ro, rr, teeth, phase, o = {}) {
  const { amp = 0.6, w, v, map = (x, y) => [x, y] } = o;
  const pts = [];
  const at = (deg, r, c) => {
    const a = (deg * Math.PI) / 180;
    const [x, y] = map(cx + Math.cos(a) * r + J(amp), cy + Math.sin(a) * r + J(amp));
    pts.push(P(x, y, c));
  };
  const pitch = 360 / teeth, half = pitch * 0.22, flank = pitch * 0.075;
  for (let k = 0; k <= teeth; k++) {
    const a0 = phase + k * pitch;
    at(a0 - half, rr, true);
    at(a0 - half + flank, ro, true);
    if (k === teeth) break;               // overlap the first flank so the outline closes
    at(a0 + half - flank, ro, true);
    at(a0 + half, rr, true);
    at(a0 + pitch / 2, rr * 0.985, false);
  }
  add(pts, w, v);
}
function arrowHead(tx, ty, dx, dy, size, o = {}) {
  const l = Math.hypot(dx, dy), ux = dx / l, uy = dy / l;
  const bx = tx - ux * size, by = ty - uy * size, k = size * 0.55;
  pl([[bx - uy * k, by + ux * k], [tx, ty], [bx + uy * k, by - ux * k]], { amp: 0.4, ...o });
}

// ---------------------------------------------------------------------------------------------
// The page
// ---------------------------------------------------------------------------------------------
const TITLE = 'ULTRA-SATISFACTORY';
const TAG = 'every recipe, building & Space Elevator objective - one click apart';

// The heading: the name, underlined twice, and the pitch. It is written at the END of each
// loop, so the first frame a visitor sees already carries both.
function drawHeading() {
  target = title;
  const s = 3.85, track = 2.5;
  const w = measure(TITLE, s, track);
  const x0 = (W - w) / 2 - 6, x1 = x0 + w;
  hand(TITLE, x0, 102, s, { w: 'T', v: SPEED.title, track, wob: 0.42, tilt: 0.06, size: 0.065, slant: 0.09 });
  // underline it twice, the second one shorter
  curV = 1500;
  pause(0.12);
  wl(x0 - 6, 119, x1 + 16, 116, { amp: 1.3, w: 'M', step: 90 });
  wl(x0 + 250, 127.5, x1 + 2, 125, { amp: 1.1, w: 'M', step: 90 });
  // and a few ticks of emphasis at either end, the way you do when you are pleased with it
  for (const [x, y, a] of [[x1 + 22, 48, -0.95], [x1 + 30, 66, -0.35], [x1 + 31, 86, 0.2]]) {
    wl(x, y, x + Math.cos(a) * 17, y + Math.sin(a) * 17, { amp: 0.3, w: 'M', step: 40 });
  }
  for (const [x, y, a] of [[x0 - 20, 86, 2.95], [x0 - 19, 66, 3.5], [x0 - 11, 48, 4.1]]) {
    wl(x, y, x + Math.cos(a) * 17, y + Math.sin(a) * 17, { amp: 0.3, w: 'M', step: 40 });
  }
  // the pitch, with a dash and an underline
  pause(0.2);
  {
    const ts = 1.2;
    const tw = measure(TAG, ts);
    const end = hand(TAG, (W - tw) / 2, 162, ts, { w: 'M', v: SPEED.tag, wob: 0.4 });
    const uw = measure('one click apart', ts);
    wl(end - uw - 2, 171, end + 4, 169.5, { amp: 0.8, w: 'M', v: 1300, step: 60 });
  }
  target = page;
}

function drawPage() {
  // 1. the factory plan
  curW = 'D'; curV = SPEED.draw;
  const BY1 = 268, BY2 = 282, GY = 312, LBL = 214;
  const belt = (x1, x2, chev) => {
    wl(x1, BY1, x2, BY1, { amp: 0.6 });
    wl(x1, BY2, x2, BY2, { amp: 0.6 });
    for (const c of chev) pl([[c - 4, BY1 + 3.4], [c + 3, (BY1 + BY2) / 2], [c - 4, BY2 - 3.4]], { amp: 0.3 });
  };
  const label = (str, cx, y, s = 1) => hand(str, cx - measure(str, s) / 2, y, s);
  // a few strokes of shading in a bottom right corner
  const hatch = (x, y, n = 4) => {
    for (let i = 0; i < n; i++) {
      const d = 5 + i * 4.5;
      wl(x - d, y - 2.5, x - 2.5, y - d, { amp: 0.3, w: 'S', v: SPEED.dash });
    }
  };

  // ore pile
  cv([[33, GY, 1], [37, 300], [45, 292], [54, 291], [60, 297, 1], [66, 288], [76, 286], [85, 294], [91, GY, 1]], { amp: 0.6 });
  cv([[45, 292], [49, 300], [47, 306]], { amp: 0.3, w: 'S' });
  cv([[76, 286], [73, 296], [78, 303]], { amp: 0.3, w: 'S' });
  wl(28, GY + 1, 98, GY, { amp: 0.6 });
  label('ore', 60, 277);
  belt(95, 128, [111]);

  // smelter
  pl([[128, GY], [128, 250], [216, 250], [216, GY]], { close: true });
  pl([[138, 250], [132, 234], [170, 234], [164, 250]]);
  pl([[184, 250], [184, 227], [202, 227], [202, 250]]);
  wl(180, 227, 206, 226.5, { amp: 0.3 });
  cv([[193, 221], [199, 213], [191, 207], [198, 199], [207, 201], [205, 208]]);
  cv([[150, GY, 1], [150, 293], [157, 285], [166, 282], [175, 285], [182, 293], [182, GY, 1]]);
  cv([[157, 309], [159, 298], [163, 304], [166, 292], [169, 303], [173, 297], [175, 309]], { amp: 0.4 });
  hatch(216, GY);
  label('smelter', 148, LBL);

  belt(216, 300, [246, 272]);
  label('30/min', 258, 261, 0.92);
  label('ingots', 258, 305, 0.95);

  // constructor
  pl([[300, GY], [300, 240], [404, 240], [404, GY]], { close: true });
  gear(352, 277, 25, 18, 8, -90, { amp: 0.4 });
  circ(352, 277, 6.5);
  pl([[338, 240], [338, 229], [366, 229], [366, 240]]);
  wl(346, 224, 358, 224, { amp: 0.3 });
  hatch(404, GY);
  label('constructor', 352, LBL);

  belt(404, 488, [434, 460]);
  label('20/min', 446, 261, 0.92);
  label('plates', 446, 305, 0.95);

  // assembler: two arms on top, and it is not happy
  pl([[488, GY], [488, 246], [620, 246], [620, GY]], { close: true });
  pl([[512, 246], [522, 229], [545, 238]]);
  pl([[549, 233], [545, 238], [549, 243]], { amp: 0.3 });
  pl([[596, 246], [586, 229], [563, 238]]);
  pl([[559, 233], [563, 238], [559, 243]], { amp: 0.3 });
  wl(528, 263, 541, 259, { amp: 0.3 });
  wl(567, 259, 580, 263, { amp: 0.3 });
  wl(535.5, 267, 535.5, 275, { amp: 0.2 });
  wl(572.5, 267, 572.5, 275, { amp: 0.2 });
  cv([[539, 299], [546, 292], [554, 289.5], [562, 292], [569, 299]], { amp: 0.4 });
  hatch(620, GY);
  label('assembler', 554, LBL);

  belt(620, 694, [646, 672]);
  pl([[692, 261], [707, 275], [692, 289]], { amp: 0.4 });
  label('5/min', 656, 261, 0.92);
  hand('reinforced iron plate', 718, 280, 1);

  // 2. the problem
  pause(0.45);
  hand('needs 60 screws/min.', 54, 358, 1.12, { w: 'S' });
  pause(0.4);
  const hx = hand('has: 0.', 54, 386, 1.12, { w: 'S' });
  wl(54, 392, hx + 2, 391, { amp: 0.6, w: 'S' });
  cv([[290, 352], [350, 361], [420, 358], [484, 340], [520, 321]], { amp: 0.8 });
  arrowHead(526, 318, 36, -19, 13);

  // 3. the cavalry: a nine-toothed cog on legs (one tooth per production machine), sprinting
  //    in with a crate of screws. Local units: the cog is 57 across the teeth; K scales it up.
  pause(0.45);
  curW = 'F';
  const cx = 800, cy = 384, K = 1.27, lean = -0.13;
  const cl = Math.cos(lean), sl = Math.sin(lean);
  const m = (dx, dy, c) => [cx + dx * K, cy + dy * K, c];                       // upright parts
  const mp = (dx, dy, c) => [cx + (dx * cl - dy * sl) * K, cy + (dx * sl + dy * cl) * K, c]; // leaning parts
  const mpts = (list) => list.map(([dx, dy, c]) => mp(dx, dy, c));
  const xy = ([x, y]) => [x, y];
  gear(0, 0, 57, 46, 9, -90 + 8, { amp: 0.5, map: (x, y) => xy(mp(x, y)) });
  circ(...xy(mp(0, 0)), 35 * K, 35 * K, { start: -2.4 });
  // face: tired eyes looking where it is going, gritted teeth
  const eye = (ex, ey, r) => {
    circ(...xy(mp(ex, ey)), r * K, r * 1.08 * K, { start: -0.4, n: 10 });
    cv(mpts([[ex - r * 1.02, ey - r * 0.3], [ex, ey - r * 0.4], [ex + r * 1.02, ey - r * 0.24]]), { amp: 0.3 });
    circ(...xy(mp(ex - r * 0.36, ey + r * 0.26)), 1.7 * K, 1.7 * K, { n: 5, over: 2.5 });
    cv(mpts([[ex - r * 0.72, ey + r + 3.4], [ex, ey + r + 5.6], [ex + r * 0.72, ey + r + 3.2]]), { amp: 0.3, w: 'S' });
  };
  eye(-15, -8, 9.4);
  eye(11, -10, 8.4);
  cv(mpts([[-28, -23], [-18, -28.5], [-7, -27]]), { amp: 0.3 });
  cv(mpts([[2, -28.5], [12, -30], [21, -24]]), { amp: 0.3 });
  pl(mpts([[-19, 12], [6, 11], [7, 21.5], [-18, 22.5]]).map(xy), { close: true, amp: 0.4 });
  cv(mpts([[-19, 17.2], [-6, 16.6], [7, 16.4]]), { amp: 0.3, w: 'S' });
  for (const mx of [-12.5, -6, 0.5]) cv(mpts([[mx, 12], [mx + 0.3, 22]]), { amp: 0.2, w: 'S' });
  // sweat
  const drop = (dx, dy, a, k = 1) => {
    const c = Math.cos(a), s2 = Math.sin(a);
    const q = (x, y) => xy(m(dx + (x * c - y * s2) * k, dy + (x * s2 + y * c) * k));
    cv([q(0, -6), q(-3, 0), q(-2.4, 3), q(0, 4.2), q(2.4, 3), q(3, 0), q(0.3, -6)], { amp: 0.2, w: 'D' });
  };
  drop(50, -60, 0.9);
  drop(66, -47, 1.1, 0.8);
  // arms and mittens
  cv(mpts([[-50, -8], [-66, 0], [-80, -6], [-91, -9]]), { amp: 0.5 });
  circ(...xy(mp(-97, -9)), 6.8 * K, 6.8 * K, { n: 8 });
  cv(mpts([[-44, 28], [-62, 38], [-78, 36], [-90, 31]]), { amp: 0.5 });
  circ(...xy(mp(-96, 30)), 6.8 * K, 6.8 * K, { n: 8 });
  // the crate
  const kt = -0.1, kc = Math.cos(kt), ks = Math.sin(kt);
  const kp = (dx, dy) => xy(m(-136 + dx * kc - dy * ks, 10 + dx * ks + dy * kc));
  pl([kp(-31, -24), kp(31, -24), kp(31, 24), kp(-31, 24)], { close: true });
  pl([kp(-31, -24), kp(-20, -35), kp(42, -35), kp(31, -24)], { amp: 0.5 });
  pl([kp(42, -35), kp(42, -22)], { amp: 0.3 });
  cv([kp(-31, -9), kp(0, -8.4), kp(31, -9)], { amp: 0.4, w: 'D' });
  hand('SCREWS', ...kp(-23.5, 13.5), 0.66 * K, { angle: kt, w: 'D', track: 1.9, wob: 0.2 });
  // screws making a break for it
  const screw = (dx, dy, a, k = 1) => {
    const c = Math.cos(a), s2 = Math.sin(a);
    const q = (x, y) => xy(m(-136 + dx + (x * c - y * s2) * k, 10 + dy + (x * s2 + y * c) * k));
    cv([q(-5, 0), q(5, 0)], { amp: 0.2 });
    cv([q(0, 0), q(0, 15)], { amp: 0.2, w: 'D' });
    cv([q(-2.8, 5), q(2.8, 6.8)], { amp: 0.1, w: 'S' });
    cv([q(-2.8, 9.4), q(2.8, 11.2)], { amp: 0.1, w: 'S' });
  };
  screw(-6, -50, 0.5);
  screw(20, -62, -0.8);
  screw(-36, -42, 1.3, 0.9);
  screw(47, -54, 0.25, 0.9);
  // legs and boots
  const boot = (ax, ay, a) => {
    const c = Math.cos(a), s2 = Math.sin(a);
    const q = (dx, dy, k) => m(ax + dx * c - dy * s2, ay + dx * s2 + dy * c, k);
    cv([q(-4.5, -3, 1), q(-5.5, 6), q(-15, 7), q(-23, 10.5), q(-24, 15.5), q(-20, 18.5, 1), q(9, 18.5, 1), q(10, 8), q(6.5, -3, 1)], { amp: 0.4 });
  };
  cv([m(-16, 53), m(-38, 58), m(-54, 68), m(-60, 86)], { amp: 0.5 });
  boot(-61, 90, 0.16);
  cv([m(14, 55), m(23, 69), m(36, 76), m(50, 69), m(61, 60)], { amp: 0.5 });
  boot(64, 57, -2.09);
  // ground, dust, speed
  wl(...xy(m(-108, 111)), ...xy(m(-30, 112)), { amp: 0.5, w: 'D' });
  cv([m(78, 112), m(80, 103), m(90, 100), m(96, 106), m(101, 97), m(113, 98), m(116, 107), m(126, 106), m(128, 113)], { amp: 0.4, w: 'D' });
  curV = SPEED.dash;
  wl(...xy(m(76, -38)), ...xy(m(136, -39)), { amp: 0.5, step: 60 });
  wl(...xy(m(86, -12)), ...xy(m(146, -13)), { amp: 0.5, step: 60 });
  wl(...xy(m(80, 16)), ...xy(m(124, 16)), { amp: 0.5, step: 60 });
  wl(...xy(m(106, 40)), ...xy(m(146, 40)), { amp: 0.5, step: 60 });
  curV = SPEED.draw;

  pause(0.3);
  // 4. the three tabs, along the bottom edge
  curW = 'D';
  const TY = 516;
  const tabs = [['Objectives', 48, 174], ['Items', 183, 262], ['Buildings', 271, 384]];
  for (const [name, x0, x1] of tabs) {
    pl([[x0, TY], [x0 + 7, TY - 35], [x1 - 7, TY - 35], [x1, TY]], { amp: 0.6 });
    label(name, (x0 + x1) / 2, TY - 10, 1.05);
  }
  wl(38, TY + 1, 398, TY, { amp: 0.8, step: 70 });

  // 5. the small print. The pencil comes to rest after the last full stop, in the one patch
  //    of paper left empty for it.
  pause(0.35);
  const px = hand('p.s. unofficial fan project.', 50, 446, 0.98);
  pause(0.65);                                       // comic timing
  hand('obviously.', px + (SPACE - 1.7) * 0.98, 446, 0.98);
}

// ---------------------------------------------------------------------------------------------
// Geometry: strokes to bezier segments, path data, lengths and sample points
// ---------------------------------------------------------------------------------------------
function segmentsOf(pts) {
  const runs = [];
  let run = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    run.push(pts[i]);
    if (pts[i].c && i < pts.length - 1) { runs.push(run); run = [pts[i]]; }
  }
  runs.push(run);
  const segs = [];
  for (const r of runs) {
    if (r.length === 2) { segs.push({ line: true, p0: r[0], p3: r[1] }); continue; }
    for (let i = 0; i < r.length - 1; i++) {
      const a = r[i - 1] || r[i], b = r[i], c = r[i + 1], d = r[i + 2] || r[i + 1];
      segs.push({
        first: i === 0, p0: b, p3: c,
        p1: { x: b.x + (c.x - a.x) / 6, y: b.y + (c.y - a.y) / 6 },
        p2: { x: c.x - (d.x - b.x) / 6, y: c.y - (d.y - b.y) / 6 },
      });
    }
  }
  return segs;
}
function segPoint(s, t) {
  if (s.line) return { x: s.p0.x + (s.p3.x - s.p0.x) * t, y: s.p0.y + (s.p3.y - s.p0.y) * t };
  const u = 1 - t, a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t;
  return { x: a * s.p0.x + b * s.p1.x + c * s.p2.x + d * s.p3.x, y: a * s.p0.y + b * s.p1.y + c * s.p2.y + d * s.p3.y };
}
function segLength(s) {
  if (s.line) return Math.hypot(s.p3.x - s.p0.x, s.p3.y - s.p0.y);
  let len = 0, prev = s.p0;
  for (let i = 1; i <= 12; i++) { const p = segPoint(s, i / 12); len += Math.hypot(p.x - prev.x, p.y - prev.y); prev = p; }
  return len;
}
const t10 = (v) => Math.round(v * 10);             // work in integer tenths so deltas are exact
function fmtT(n) {                                  // integer tenths -> shortest decimal string
  if (n === 0) return '0';
  const neg = n < 0, a = Math.abs(n), i = Math.floor(a / 10), f = a % 10;
  return (neg ? '-' : '') + (i === 0 && f ? '' : String(i)) + (f ? `.${f}` : '');
}
function joinNums(nums) {
  let out = '';
  nums.forEach((n, i) => { const s = fmtT(n); out += (i > 0 && s[0] !== '-' ? ' ' : '') + s; });
  return out;
}
function finish(st) {
  const segs = segmentsOf(st.pts);
  let x = t10(st.pts[0].x), y = t10(st.pts[0].y);
  let d = `M${fmtT(x)} ${fmtT(y)}`, last = 'M', len = 0;
  const samples = [{ x: st.pts[0].x, y: st.pts[0].y }];
  for (const s of segs) {
    const ex = t10(s.p3.x), ey = t10(s.p3.y);
    let cmd, nums;
    if (s.line) { cmd = 'l'; nums = [ex - x, ey - y]; }
    else if (s.first) { cmd = 'c'; nums = [t10(s.p1.x) - x, t10(s.p1.y) - y, t10(s.p2.x) - x, t10(s.p2.y) - y, ex - x, ey - y]; }
    else { cmd = 's'; nums = [t10(s.p2.x) - x, t10(s.p2.y) - y, ex - x, ey - y]; }
    const body = joinNums(nums);
    d += cmd === last ? (body[0] === '-' ? '' : ' ') + body : cmd + body;
    last = cmd; x = ex; y = ey;
    const l = segLength(s);
    len += l;
    const steps = Math.max(1, Math.ceil(l / 8));
    for (let i = 1; i <= steps; i++) samples.push(segPoint(s, i / steps));
  }
  st.d = d; st.len = len; st.samples = samples;
  st.dur = Math.max(0.016, len / st.v);
  return st;
}

// ---------------------------------------------------------------------------------------------
// Build the page and the timeline
// ---------------------------------------------------------------------------------------------
drawHeading();
drawPage();
page.forEach(finish);
title.forEach(finish);

const PEN_UP = 5200;                 // units/s between strokes
const HOLD = 7.5;                    // seconds the finished page is held
const CLEAR = 1.25;                  // seconds for the page to clear
const TAIL = 0.35;                   // pause after the name is written, before the loop point
const hop = (a, b) => clamp(Math.hypot(b.x - a.x, b.y - a.y) / PEN_UP, 0.006, 0.2);
const lastOf = (st) => st.samples[st.samples.length - 1];

const START = 0.3;                   // the pencil is already poised under the name at t = 0
const FIRST = page[0].samples[0];
let t = START;
let pos = FIRST;
for (const st of page) { st.hop = st === page[0] ? 0 : hop(pos, st.samples[0]); t += st.pause + st.hop; st.t = t; t += st.dur; pos = lastOf(st); }
const T_DRAWN = t;
const T_CLEAR = Math.round((T_DRAWN + HOLD) * 100) / 100;
t = T_CLEAR + CLEAR;
const T_WRITE = t;
pos = title[0].samples[0];
for (const st of title) { st.hop = st === title[0] ? 0 : hop(pos, st.samples[0]); t += st.pause + st.hop; st.t = t; t += st.dur; pos = lastOf(st); }
const T_NAMED = t;
const LOOP = Math.ceil((t + TAIL + 0.3) * 5) / 5;          // a whole number of 0.2 s steps
const maxDur = Math.max(...page.map((s) => s.dur), ...title.map((s) => s.dur));
if (maxDur > CLEAR - 0.25) throw new Error(`longest stroke (${maxDur.toFixed(2)} s) does not un-draw inside the clear`);

// Pencil route: every stroke in drawing order joined by straight hops, in whole units.
const route = [];                                    // integer points
const keys = [];                                     // [time, distance along the route]
let dist = 0;
function moveTo(p) {
  const q = { x: Math.round(p.x), y: Math.round(p.y) };
  const prev = route[route.length - 1];
  if (prev) {
    if (prev.x === q.x && prev.y === q.y) return;
    dist += Math.hypot(q.x - prev.x, q.y - prev.y);
  }
  route.push(q);
}
moveTo(FIRST);
keys.push([0, 0]);
for (const st of [...page, ...title]) {
  if (st === title[0]) keys.push([T_CLEAR + 0.15, dist]);      // rest, then lift off as the page clears
  if (st.pause) keys.push([st.t - st.hop, dist]);
  moveTo(st.samples[0]);
  keys.push([st.t, dist]);
  for (const p of st.samples.slice(1)) moveTo(p);
  keys.push([st.t + st.dur, dist]);
}
keys.push([T_NAMED + TAIL, dist]);                    // a beat to admire the name, then back under it
moveTo(FIRST);
keys.push([LOOP - 0.04, dist]);
keys.push([LOOP, dist]);
const REST = lastOf(page[page.length - 1]);

// ---------------------------------------------------------------------------------------------
// SVG pieces
// ---------------------------------------------------------------------------------------------
const f2 = (n) => String(Math.round(n * 100) / 100);
const f3 = (n) => String(Math.round(n * 1000) / 1000).replace(/^0\./, '.');
const frac = (n, dp) => {
  const s = (Math.round(n * 10 ** dp) / 10 ** dp).toString();
  return s.replace(/^0\./, '.');
};

function inkPaths(list, animated) {
  let out = '', w = null;
  for (const st of list) {
    if (st.w !== w) { out += `${w === null ? '' : '</g>'}<g stroke-width="${WIDTHS[st.w]}">`; w = st.w; }
    if (animated) {
      const vis = (((T_CLEAR - st.t) % LOOP) + LOOP) % LOOP;   // seconds between starting to draw and the clear
      const dash = Math.round(vis * 1000) / 1000;
      const gap = Math.round((LOOP - dash) * 1000) / 1000;
      out += `<path pathLength="${f3(st.dur)}" stroke-dasharray="${f3(dash)} ${f3(gap)}" d="${st.d}"/>`;
    } else out += `<path d="${st.d}"/>`;
  }
  return `${out}</g>`;
}

// Paper: a woven grain underneath, and the same weave laid back over the chalk so the line
// breaks up where the "threads" dip, as if it had been dragged across them.
function weave() {
  const r = makeRng(9021);
  const S = 96;
  // thread positions at an uneven pitch, the way a real weave wanders
  const threads = () => {
    const a = [];
    for (let c = 1.2 + r(); c < S - 1.6; c += 2.7 + r() * 1.5) a.push(c);
    return a;
  };
  const hs = threads(), vs = threads();
  const DARK = [0.1, 0.17, 0.26], LIGHT = [0.06, 0.11, 0.17], SKIP = [0.26, 0.4, 0.56];
  const bucket = () => [[], [], []];
  const dh = bucket(), dv = bucket(), lh = bucket(), lv = bucket(), sk = bucket();
  const pick = () => Math.floor(r() * 3);
  for (const y of hs) {
    dh[pick()].push(`M0 ${f2(y)}H${S}`);
    lh[pick()].push(`M0 ${f2(y + 1.5)}H${S}`);
    for (let p = r() * 6; p < S - 1;) {           // stretches of thread the chalk skips
      const l = Math.min(1.5 + r() * 6, S - p);
      sk[pick()].push(`M${f2(p)} ${f2(y + J2(r, 0.3))}h${f2(l)}`);
      p += l + 1.5 + r() * 7;
    }
  }
  for (const x of vs) {
    dv[pick()].push(`M${f2(x)} 0V${S}`);
    lv[pick()].push(`M${f2(x + 1.5)} 0V${S}`);
    for (let p = r() * 8; p < S - 1;) {
      const l = Math.min(1.5 + r() * 5, S - p);
      sk[pick()].push(`M${f2(x + J2(r, 0.3))} ${f2(p)}v${f2(l)}`);
      p += l + 2.5 + r() * 9;
    }
  }
  let under = '', over = '';
  for (let i = 0; i < 3; i++) {
    under += `<path d="${dh[i].join('')}" stroke="#1a4382" stroke-opacity="${DARK[i]}" stroke-width="1"/>`
      + `<path d="${dv[i].join('')}" stroke="#1a4382" stroke-opacity="${f2(DARK[i] * 0.85)}" stroke-width="1"/>`
      + `<path d="${lh[i].join('')}" stroke="#6b9be0" stroke-opacity="${LIGHT[i]}" stroke-width=".9"/>`
      + `<path d="${lv[i].join('')}" stroke="#6b9be0" stroke-opacity="${f2(LIGHT[i] * 0.85)}" stroke-width=".9"/>`;
    over += `<path d="${sk[i].join('')}" stroke-opacity="${SKIP[i]}"/>`;
  }
  // a few bare specks where the chalk missed altogether
  let specks = '';
  for (let i = 0; i < 110; i++) specks += `M${f2(r() * S)} ${f2(r() * S)}h${f2(0.3 + r() * 1.3)}`;
  over += `<path d="${specks}" stroke-width="1.15" stroke-opacity=".62"/>`;
  return `<pattern id="wv" width="${S}" height="${S}" patternUnits="userSpaceOnUse"><g fill="none">${under}</g></pattern>`
    + `<pattern id="th" width="${S}" height="${S}" patternUnits="userSpaceOnUse"><g fill="none" stroke="${PAPER}" stroke-width=".75" stroke-linecap="round">${over}</g></pattern>`;
}
const J2 = (r, a) => (r() * 2 - 1) * a;

// The pencil: point at (0, 0), lying along +x. Green barrel, yellow band, white lead.
const PENCIL_ANGLE = 29;               // lying down and to the right of its point, over paper not yet drawn on
const PENCIL_LEN = 204;
const PENCIL = (() => {
  const hw = 8.5, L = PENCIL_LEN, cone = 34;
  const sil = `M0 0L10-2.5 ${cone}-${hw}H${L - 3}a3 3 0 0 1 3 3v11a3 3 0 0 1-3 3H${cone}L10 2.5z`;
  return `<symbol id="pn" overflow="visible">`
    + `<path d="${sil}" fill="#0a2550" fill-opacity=".34" transform="rotate(5.5)"/>`
    + `<path d="M${cone}-${hw}Q${cone - 6}-5.8 ${cone}-3H${L}V-5.5a3 3 0 0 0-3-3z" fill="#63d35f"/>`
    + `<path d="M${cone}-3Q${cone - 7} 0 ${cone} 3H${L}V-3z" fill="#3cb043"/>`
    + `<path d="M${cone} 3Q${cone - 6} 5.8 ${cone} ${hw}H${L - 3}a3 3 0 0 0 3-3V3z" fill="#1d6b2a"/>`
    + `<path d="M10-2.5L${cone}-${hw}Q${cone - 6}-5.8 ${cone}-3Q${cone - 7} 0 ${cone} 3Q${cone - 6} 5.8 ${cone} ${hw}L10 2.5z" fill="#ecc994"/>`
    + `<path d="M10 .6L${cone - 5} 2.2Q${cone - 5} 4 ${cone} ${hw}L10 2.5z" fill="#c4935a"/>`
    + `<path d="M0 0L10-2.5V2.5z" fill="#f6f9ff"/><path d="M0 0L10 .4V2.5z" fill="#b4c2dc"/>`
    + `<path d="M170-${hw}h14v5.5h-14z" fill="#ffe873"/><path d="M170-3h14v6h-14z" fill="#ffd400"/><path d="M170 3h14v5.5h-14z" fill="#c79a00"/>`
    + `<path d="M${cone + 8}-6.2H164M188-6.2h10" stroke="#fff" stroke-opacity=".45" stroke-width="1.1" stroke-linecap="round"/>`
    + `<path d="${sil}" fill="none" stroke="#0b2346" stroke-opacity=".75" stroke-width="1" stroke-linejoin="round"/>`
    + `</symbol>`;
})();

// How the pencil lies. It would rather lie at PENCIL_ANGLE, but a real one does not hang off
// the desk: near the bottom edge it flattens out, and near the right edge it swings round to
// hang more steeply, so the whole pencil (yellow band included) stays on the paper. The angle
// is worked out from where the point is at each moment, then smoothed so it turns like a hand
// and not like a compass needle. The bottom edge wins where both cannot be had.
const LIE = (() => {
  const cum = [0];
  for (let i = 1; i < route.length; i++) cum.push(cum[i - 1] + Math.hypot(route[i].x - route[i - 1].x, route[i].y - route[i - 1].y));
  const pointAt = (tt) => {                           // where the pencil point is at time tt
    let k = 1;
    while (k < keys.length - 1 && keys[k][0] < tt) k++;
    const [t0, d0] = keys[k - 1], [t1, d1] = keys[k];
    const dd = t1 > t0 ? d0 + (d1 - d0) * clamp((tt - t0) / (t1 - t0), 0, 1) : d1;
    let lo = 0, hi = cum.length - 1;
    while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (cum[mid] <= dd) lo = mid; else hi = mid; }
    const f = cum[hi] > cum[lo] ? (dd - cum[lo]) / (cum[hi] - cum[lo]) : 0;
    return { x: route[lo].x + (route[hi].x - route[lo].x) * f, y: route[lo].y + (route[hi].y - route[lo].y) * f };
  };
  const deg = (r) => (r * 180) / Math.PI;
  const FINE = 0.1, n = Math.round(LOOP / FINE), WIN = 5;      // fine samples; +-0.5 s windows
  const flat = [], steep = [];
  for (let i = 0; i < n; i++) {
    const p = pointAt(i * FINE);
    flat.push(deg(Math.asin(clamp((H - 15 - p.y) / PENCIL_LEN, -0.2, 1))));                  // the flattest it must lie
    steep.push(Math.min(80, deg(Math.acos(clamp((W - 12 - p.x) / PENCIL_LEN, 0, 1)))));      // the steepest it would like
  }
  // Look half a second ahead and behind (so it turns before it gets there), then smooth. A mean
  // of windowed minima never exceeds the value at the centre, so the cap is a guarantee.
  const pick = (a, fn) => a.map((_, i) => { let v = a[i]; for (let k = -WIN; k <= WIN; k++) v = fn(v, a[(i + k + n) % n]); return v; });
  const mean = (a) => a.map((_, i) => { let sum = 0; for (let k = -WIN; k <= WIN; k++) sum += a[(i + k + n) % n]; return sum / (2 * WIN + 1); });
  const cap = mean(pick(flat, Math.min));
  const floor = mean(mean(pick(steep, Math.max)));
  // a little life while it works; dead still while the page is held
  const r = makeRng(3107);
  const STEP = 2, N = n / STEP;                                   // one value every 0.2 s
  if (!Number.isInteger(N)) throw new Error('loop length must be a whole number of 0.2 s steps');
  const values = [];
  let rock = 0, next = 0;
  for (let i = 0; i <= N; i++) {
    const tt = i * STEP * FINE, j = (i * STEP) % n;
    const busy = tt < T_DRAWN - 0.2 || tt > T_WRITE - 0.3;
    if (i % 2 === 0) { rock = next; next = busy && i + 2 < N ? (r() * 2 - 1) * 3.2 : 0; }
    const wob = i === 0 || i === N ? 0 : i % 2 === 0 ? rock : (rock + next) / 2;
    values.push(Math.round(Math.min(Math.max(PENCIL_ANGLE + wob, floor[j]), cap[j]) * 10) / 10);
  }
  values[N] = values[0];
  const rest = values[Math.round((T_DRAWN + 2) / (STEP * FINE))];
  return { values, rest };
})();

function pencilMotion() {
  let d = `M${route[0].x} ${route[0].y}l`;
  let body = '';
  for (let i = 1; i < route.length; i++) {
    const dx = route[i].x - route[i - 1].x, dy = route[i].y - route[i - 1].y;
    const s = `${dx}${dy < 0 ? '' : ' '}${dy}`;
    body += (body && s[0] !== '-' ? ' ' : '') + s;
  }
  d += body;
  // keep keyTimes strictly usable: monotonic, 0..1
  const kt = [], kp = [];
  let lastT = -1;
  for (const [tt, dd] of keys) {
    let a = Math.round((tt / LOOP) * 1e5) / 1e5;
    if (a < lastT) a = lastT;
    lastT = a;
    kt.push(frac(Math.min(1, a), 5));
    kp.push(frac(Math.min(1, dd / dist), 5));
  }
  kt[0] = '0'; kt[kt.length - 1] = '1'; kp[kp.length - 1] = '1';
  return `<g class="live"><animateMotion dur="${LOOP}s" repeatCount="indefinite" calcMode="linear" keyTimes="${kt.join(';')}" keyPoints="${kp.join(';')}" path="${d}"/>`
    + `<g><animateTransform attributeName="transform" type="rotate" dur="${LOOP}s" repeatCount="indefinite" values="${LIE.values.join(';')}"/>`
    + `<use href="#pn"/></g></g>`
    + `<use class="still" href="#pn" transform="translate(${f2(REST.x)} ${f2(REST.y)}) rotate(${LIE.rest})"/>`;
}

const pct = (tt) => `${Math.round((tt / LOOP) * 1e4) / 100}%`;
const CSS = `
.ink path{animation:ink ${LOOP}s linear infinite}
@keyframes ink{from{stroke-dashoffset:${f2(T_CLEAR)}}to{stroke-dashoffset:${f2(T_CLEAR - LOOP)}}}
.pg{animation:clr ${LOOP}s linear infinite}
@keyframes clr{0%,${pct(T_CLEAR)}{opacity:1}${pct(T_CLEAR + 0.5)},${pct(T_WRITE - 0.1)}{opacity:0}${pct(T_WRITE - 0.08)},100%{opacity:1}}
.still{display:none}
@media (prefers-reduced-motion:reduce){
.ink path,.pg{animation:none}
.live{display:none}
.still{display:inline}
}`;

const TITLE_TEXT = 'ULTRA-SATISFACTORY: a page that draws itself in pencil';
const DESC = 'Blue paper with a woven grain. A green pencil with a yellow band writes ULTRA-SATISFACTORY in chalk-white capitals, underlines it twice, and adds: every recipe, building and Space Elevator objective, one click apart. Then it sketches a factory plan: ore, a smelter (30 ingots a minute), a constructor (20 plates a minute) and an unhappy assembler (5 reinforced iron plates a minute), with a note: needs 60 screws a minute, has 0. A cog on legs sprints in with a crate marked SCREWS. Three tabs: Objectives, Items, Buildings. P.S. unofficial fan project. Obviously.';

function svgDoc({ animated }) {
  const paper = `<rect width="${W}" height="${H}" rx="9" fill="${PAPER}"/><rect width="${W}" height="${H}" rx="9" fill="url(#lt)"/><rect width="${W}" height="${H}" rx="9" fill="url(#wv)"/>`;
  const ink = `<g class="pg"><g class="ink" fill="none" stroke="${CHALK}" stroke-opacity=".95" stroke-linecap="round" stroke-linejoin="round">${inkPaths(title, animated)}${inkPaths(page, animated)}</g></g>`;
  const tooth = `<rect width="${W}" height="${H}" rx="9" fill="url(#th)"/>`;
  // faint smears where the page has been wiped before
  const smudge = [[250, 330, 210, 60, -8], [690, 205, 190, 46, 5], [470, 470, 170, 50, -4], [140, 90, 120, 40, 10]]
    .map(([x, y, rx, ry, a]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" transform="rotate(${a} ${x} ${y})" fill="url(#sm)"/>`).join('');
  const pencil = animated
    ? pencilMotion()
    : `<use href="#pn" transform="translate(${f2(REST.x)} ${f2(REST.y)}) rotate(${LIE.rest})"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="t d">`
    + `<title id="t">${TITLE_TEXT}</title><desc id="d">${DESC}</desc>`
    + `<!-- Generated by examples/ultra-satisfactory/src/${SLUG}.mjs: edit that, not this. Style: pencil on paper (catalogue pc-09). -->`
    + (animated ? `<style>${CSS}</style>` : '')
    + `<defs><radialGradient id="lt" cx=".42" cy=".36" r=".8"><stop offset="0" stop-color="#7fb0ee" stop-opacity=".2"/><stop offset=".55" stop-color="#2b5fa8" stop-opacity="0"/><stop offset="1" stop-color="#0c2a5c" stop-opacity=".36"/></radialGradient>`
    + `<radialGradient id="sm"><stop offset="0" stop-color="#dbe8ff" stop-opacity=".09"/><stop offset=".6" stop-color="#dbe8ff" stop-opacity=".045"/><stop offset="1" stop-color="#dbe8ff" stop-opacity="0"/></radialGradient>`
    + weave() + PENCIL + `<clipPath id="cp"><rect width="${W}" height="${H}" rx="9"/></clipPath></defs>`
    + `<g clip-path="url(#cp)">${paper}${smudge}${ink}${tooth}${pencil}</g></svg>\n`;
}

// ---------------------------------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------------------------------
function specimen(file) {
  const rows = ['ABCDEFGHIJKLM', 'NOPQRSTUVWXYZ', 'abcdefghijklm', 'nopqrstuvwxyz', "0123456789 -,./&:!'()+=?", 'ULTRA-SATISFACTORY', 'needs 60 screws/min. 5/min 30/min 20/min'];
  const save = [page.length];
  target = page;
  const from = page.length;
  rows.forEach((r, i) => hand(r, 30, 70 + i * 72, i < 5 ? 2.9 : i === 5 ? 3.6 : 1.4, { w: i === 6 ? 'S' : 'M' }));
  const list = page.slice(from).map(finish);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="${PAPER}"/>`
    + `<g fill="none" stroke="${CHALK}" stroke-linecap="round" stroke-linejoin="round">${inkPaths(list, false)}</g></svg>\n`;
  fs.writeFileSync(file, svg);
  console.log(`specimen -> ${file} (${save[0]} page strokes untouched)`);
}

const args = process.argv.slice(2);
const argAfter = (flag) => { const i = args.indexOf(flag); return i >= 0 ? args[i + 1] : null; };
if (argAfter('--specimen')) specimen(argAfter('--specimen'));
else if (argAfter('--still')) {
  fs.writeFileSync(argAfter('--still'), svgDoc({ animated: false }));
  console.log(`still -> ${argAfter('--still')}`);
} else {
  const svg = svgDoc({ animated: true });
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, svg);
  const ink = [...page, ...title].reduce((a, s) => a + s.len, 0);
  console.log(`${path.relative(process.cwd(), OUT)}: ${(svg.length / 1024).toFixed(1)} KB`);
  console.log(`strokes ${page.length + title.length} (heading ${title.length}), ink ${Math.round(ink)} units, route ${route.length} points`);
  console.log(`page drawn at ${T_DRAWN.toFixed(1)} s, clears at ${T_CLEAR.toFixed(1)} s, heading rewritten from ${T_WRITE.toFixed(1)} s, loop ${LOOP} s, longest stroke ${maxDur.toFixed(2)} s`);
  // The header's notes quote the stroke count and the loop length: say so if they have drifted.
  const md = path.join(HERE, '..', `${SLUG}.md`);
  if (fs.existsSync(md)) {
    const quoted = /(\d+) strokes, redrawn\s+every ([\d.]+) seconds/.exec(fs.readFileSync(md, 'utf8'));
    if (!quoted || Number(quoted[1]) !== page.length + title.length || Number(quoted[2]) !== LOOP) {
      console.warn(`WARNING: ${SLUG}.md should say "${page.length + title.length} strokes, redrawn every ${LOOP} seconds"`);
    }
  }
}
