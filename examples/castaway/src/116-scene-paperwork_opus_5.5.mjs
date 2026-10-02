// Header 116-scene-paperwork_opus_5.5 for Castaway.
// Style: scene paperwork (catalogue print-05): the photocopied tick-box swap letter
// that C64 and Amiga swappers posted with their disks, with a "spread by" note in red
// felt-tip and the spreader's sticker in the corner, as kept by paper archives of the
// scene. Here the letter is the island's own: it went out in a bottle and the bottle
// came straight back, so it lies on the sand with the bottle on it as a paperweight,
// and a red pen ticks the boxes.
//
//   node examples/castaway/src/116-scene-paperwork_opus_5.5.mjs
//
// Writes ../assets/116-scene-paperwork_opus_5.5.svg (the README text around it, with
// the pre-invitation and the typed carbon copy of this letter, is written by hand in
// ../116-scene-paperwork_opus_5.5.md: keep the two in step). Plain Node, no dependencies,
// deterministic (seeded PRNG). Every letter on the page is drawn here: the typed form
// is a monoline stroke font defined below, the blue and red handwriting is a
// stroke-font script, and the CASTAWAY logo is chamfered block letters with rough,
// photocopied edges. Nothing is copied from any real form: the headings follow the
// generic layout of the genre and every line of wording is new.
//
// Motion (CSS only, plays once and stays): a red pen leaves its resting place, ticks
// the boxes one after another and lies back down; a "spread by" note writes itself
// across the top. With prefers-reduced-motion everything is shown filled in at once.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '116-scene-paperwork_opus_5.5';
const OUT = path.join(HERE, '..', 'assets', `${SLUG}.svg`);

const W = 1200, H = 860;            // the panel (sand)
const SW = 1096, SH = 772;          // the sheet
const SX = (W - SW) / 2, SY = 38;   // sheet position before rotation
const SROT = -1.1;                  // the sheet sits a little crooked

const PAPER = '#f6f4ec';
const TONER = '#171717';
const RED = '#d0202b';
const BLUE = '#2747a8';

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
let rnd = makeRng(1992);
const J = (a) => (rnd() * 2 - 1) * a;
const f1 = (n) => {
  const v = Math.round(n * 10) / 10;
  return Object.is(v, -0) ? '0' : String(v);
};
const f2 = (n) => {
  const v = Math.round(n * 100) / 100;
  return Object.is(v, -0) ? '0' : String(v);
};

// ---------------------------------------------------------------------------------------------
// 1. The typed form: a narrow monoline capital font, the kind a plotter or a daisy-wheel
//    office printer put on a pre-printed form. Grid: x 0..5, y 0 (cap top) .. 9 (baseline).
//    Strokes are polylines, separated by "|".
// ---------------------------------------------------------------------------------------------
const TYPE_SRC = {
  A: '0,9 0,2 1.5,0 3.5,0 5,2 5,9|0,5.2 5,5.2',
  B: '0,0 0,9 3.9,9 5,7.9 5,5.6 3.9,4.5 0,4.5|0,0 3.6,0 4.7,1.1 4.7,3.4 3.6,4.5',
  C: '5,1.4 3.9,0 1.1,0 0,1.4 0,7.6 1.1,9 3.9,9 5,7.6',
  D: '0,0 0,9 3,9 5,7 5,2 3,0 0,0',
  E: '5,0 0,0 0,9 5,9|0,4.5 3.7,4.5',
  F: '5,0 0,0 0,9|0,4.5 3.7,4.5',
  G: '5,1.4 3.9,0 1.1,0 0,1.4 0,7.6 1.1,9 3.9,9 5,7.6 5,5 2.7,5',
  H: '0,0 0,9|5,0 5,9|0,4.5 5,4.5',
  I: '1,0 4,0|2.5,0 2.5,9|1,9 4,9',
  J: '5,0 5,7.6 3.9,9 1.1,9 0,7.6',
  K: '0,0 0,9|5,0 0.2,5.4|1.7,3.9 5,9',
  L: '0,0 0,9 5,9',
  M: '0,9 0,0 2.5,5 5,0 5,9',
  N: '0,9 0,0 5,9 5,0',
  O: '1.1,0 3.9,0 5,1.4 5,7.6 3.9,9 1.1,9 0,7.6 0,1.4 1.1,0',
  P: '0,9 0,0 3.9,0 5,1.1 5,3.8 3.9,4.9 0,4.9',
  Q: '1.1,0 3.9,0 5,1.4 5,7.6 3.9,9 1.1,9 0,7.6 0,1.4 1.1,0|3,6.8 5.2,9.6',
  R: '0,9 0,0 3.9,0 5,1.1 5,3.8 3.9,4.9 0,4.9|2.4,4.9 5,9',
  S: '5,1.4 3.9,0 1.1,0 0,1.4 0,3.4 1.1,4.5 3.9,4.5 5,5.6 5,7.6 3.9,9 1.1,9 0,7.6',
  T: '0,0 5,0|2.5,0 2.5,9',
  U: '0,0 0,7.6 1.1,9 3.9,9 5,7.6 5,0',
  V: '0,0 2.5,9 5,0',
  W: '0,0 0.7,9 2.5,3.2 4.3,9 5,0',
  X: '0,0 5,9|5,0 0,9',
  Y: '0,0 2.5,4.6 5,0|2.5,4.6 2.5,9',
  Z: '0,0 5,0 0,9 5,9',
  0: '1.2,0 3.8,0 4.7,1.5 4.7,7.5 3.8,9 1.2,9 0.3,7.5 0.3,1.5 1.2,0',
  1: '1,1.8 2.8,0 2.8,9|1.2,9 4.4,9',
  2: '0,1.4 1.1,0 3.9,0 5,1.4 5,3.4 0,9 5,9',
  3: '0,1.1 1.1,0 3.9,0 5,1.2 5,3.3 3.9,4.4 1.8,4.4|3.9,4.4 5,5.6 5,7.8 3.9,9 1.1,9 0,7.9',
  4: '3.8,9 3.8,0 0,6.3 5,6.3',
  5: '5,0 0.4,0 0.1,4.1 3.8,3.8 5,5 5,7.8 3.9,9 1.1,9 0,7.9',
  6: '4.7,0.6 3.6,0 1.2,0 0,1.6 0,7.6 1.1,9 3.9,9 5,7.6 5,5.5 3.9,4.4 1.1,4.4 0,5.5',
  7: '0,0 5,0 1.6,9',
  8: '1.1,4.5 0,3.4 0,1.1 1.1,0 3.9,0 5,1.1 5,3.4 3.9,4.5 1.1,4.5 0,5.6 0,7.8 1.1,9 3.9,9 5,7.8 5,5.6 3.9,4.5',
  9: '0.3,8.4 1.4,9 3.8,9 5,7.4 5,1.4 3.9,0 1.1,0 0,1.4 0,3.5 1.1,4.6 3.9,4.6 5,3.5',
  '.': '2.5,8.7 2.5,9',
  ',': '2.7,8.4 2.7,9 2,10.4',
  ':': '2.5,2.7 2.5,3|2.5,8.7 2.5,9',
  '-': '1,4.6 4,4.6',
  '/': '4.6,-0.3 0.4,9.3',
  '(': '3.6,-0.5 1.9,1.6 1.5,4.5 1.9,7.4 3.6,9.5',
  ')': '1.4,-0.5 3.1,1.6 3.5,4.5 3.1,7.4 1.4,9.5',
  "'": '2.5,0 2.5,2.4',
  '"': '1.5,0 1.5,2.4|3.5,0 3.5,2.4',
  '!': '2.5,0 2.5,6.2|2.5,8.7 2.5,9',
  '?': '0.2,1.4 1.2,0 3.8,0 4.8,1.4 4.8,3 2.5,5 2.5,6.4|2.5,8.7 2.5,9',
  '+': '2.5,2.6 2.5,7.4|0.6,5 4.4,5',
  '*': '2.5,1 2.5,6|0.4,2.2 4.6,4.8|4.6,2.2 0.4,4.8',
  '=': '0.6,3.5 4.4,3.5|0.6,6.2 4.4,6.2',
  '&': '5,9 1,2.8 1,1 2,0 3,0 4,1 4,2.6 0.4,5.6 0.2,7.6 1.3,9 3,9 5,6',
};
const CAP = 13;                  // cap height of the typed form
const GU = CAP / 9;              // grid unit
const ADV = 6.6 * GU;            // monospaced advance
const typeIds = new Map();
function typeId(ch) {
  if (!TYPE_SRC[ch]) throw new Error(`no typed glyph for ${JSON.stringify(ch)}`);
  if (!typeIds.has(ch)) typeIds.set(ch, `t${ch.codePointAt(0).toString(16)}`);
  return typeIds.get(ch);
}
function typeGlyphPath(ch) {
  return TYPE_SRC[ch].split('|').map((s) => s.trim().split(/\s+/).map((tok, i) => {
    const [x, y] = tok.split(',').map(Number);
    return `${i ? (i === 1 ? 'L' : ' ') : 'M'}${f2(x * GU)} ${f2(y * GU - CAP)}`;
  }).join('')).join('');
}

const typedMain = [];
const typedPale = [];   // a few letters came out of the copier lighter
// Type a string with its baseline at (x, y). Returns the x after the last character.
function type(str, x, y, o = {}) {
  const { spacing = ADV } = o;
  let cx = x;
  for (const ch of str) {
    if (ch !== ' ') {
      const id = typeId(ch);
      const u = `<use href="#${id}" x="${f1(cx + J(0.18))}" y="${f1(y + J(0.32))}"/>`;
      (rnd() < 0.14 ? typedPale : typedMain).push(u);
    }
    cx += spacing;
  }
  return cx;
}
const tw = (str) => str.length * ADV;

// ---------------------------------------------------------------------------------------------
// 2. Handwriting: a stroke-font script (glyph box: baseline 0, x-height 10, cap 16, y up).
//    "!" after a point marks a hard corner; other points are smoothed.
//    (Adapted from the pencil header's hand in examples/ultra-satisfactory.)
// ---------------------------------------------------------------------------------------------
const BOWL = '7.6,7.8 5.6,9.9 3,9.6 1,7 0.6,4 1.8,1.2 4,0 6.2,1.6 7.6,5';
const HAND = {
  H: [10, '1,16! 1,0', '9,16! 9,0', '1,8.2 9,8.5'],
  a: [10, BOWL, '7.7,10! 7.7,2.4 8.3,0.5 9.6,0.6'],
  b: [9.5, '1.2,16.5! 1.2,0', '1.2,6.4 3,9.2 5.6,10 8,8.2 8.6,5 7.6,1.6 5.2,0 2.8,0.8 1.2,3.2'],
  c: [8.5, '7.6,7.8 5.8,9.9 3.2,9.6 1.1,7 0.6,4 1.8,1.1 4.4,0 6.8,0.9 8,2.6'],
  d: [10, BOWL, '7.7,16.5! 7.7,2.4 8.3,0.5 9.6,0.6'],
  e: [9, '1.1,5! 7.9,5.5! 7.3,8.2 5.3,10 3,9.5 1.2,7.2 0.7,4 1.9,1.1 4.5,0 7,0.8 8.3,2.6'],
  f: [7, '7,14.6 5.8,16.4 4.2,16 3.3,13.6 3.2,8 3.2,0', '0.6,9.6 6.2,9.9'],
  g: [9.5, BOWL, '7.7,10! 7.7,-2.4 6.6,-5.2 4.2,-6 1.6,-5'],
  h: [9.5, '1.2,16.5! 1.2,0', '1.2,6 3,9 5.4,10 7.5,8.6 8,6 8,0'],
  i: [4, '1.6,10! 1.6,2.2 2.1,0.5 3.3,0.5', '1.5,13.4 1.8,13.9'],
  k: [8.5, '1.2,16.5! 1.2,0', '7.4,10! 1.4,4.4', '3.4,6.2! 8,0'],
  l: [4, '1.6,16.5! 1.6,2.2 2.1,0.5 3.4,0.5'],
  m: [13.5, '1.2,10! 1.2,0', '1.2,6.4 2.8,9.2 4.8,10 6.3,8.6 6.6,6 6.6,0', '6.6,6.4 8.2,9.2 10.2,10 11.7,8.6 12,6 12,0'],
  n: [9.5, '1.2,10! 1.2,0', '1.2,6 3,9 5.4,10 7.5,8.6 8,6 8,0'],
  o: [9.5, '4.8,10 2.4,9 0.8,5 2,1.2 4.6,0 7.2,1.2 8.5,5 7.2,8.8 4.4,9.9'],
  p: [9.5, '1.2,10! 1.2,-6', '1.2,6.4 3,9.2 5.6,10 8,8.2 8.6,5 7.6,1.6 5.2,0 2.8,0.8 1.2,3.2'],
  r: [7.5, '1.2,10! 1.2,0', '1.2,6 2.8,8.8 4.8,10 7,9.2'],
  s: [8, '7,8.2 5.4,9.8 3.4,10 1.6,9 1.2,7 2.8,5.6 5.2,4.6 7,3.2 7,1.4 5.2,0.1 3,0 0.8,1.4'],
  t: [7.5, '3.2,14.5! 3.2,2.6 3.9,0.6 5.4,0.2 6.8,1.2', '0.4,9.7 6.4,10'],
  u: [10, '1.2,10 1.2,4 2.2,1 4.3,0 6.3,1.2 7.8,4.4', '7.8,10! 7.8,2.2 8.4,0.4 9.6,0.6'],
  v: [8.5, '0.6,10! 4.2,0! 8,10'],
  w: [12, '0.6,10! 3.1,0! 6,8! 9,0! 11.5,10'],
  y: [8.8, '0.8,10! 4.5,0.8', '8.2,10! 3.4,-3.4 1.9,-5.4 0.1,-5.7'],
  0: [9, '4.6,16 2,14 0.8,8 2,2 4.5,0 7,2 8.2,8 7,14 4.2,16'],
  1: [7, '1,12.4! 4.6,16! 4.6,0'],
  5: [9.5, '8.4,16! 2,16! 1.5,9.2! 4.4,10.2 7.4,9 8.7,5.6 7.4,1.8 4.4,0 1.8,0.6 0.5,2.6'],
  9: [9.5, '8.3,12 7,15 4.6,16 2,14.8 1,11.6 2.2,8.6 4.8,7.6 7.2,8.8 8.3,12! 8.2,5 6.4,1 3.4,0'],
  ',': [3.6, '1.9,1 1.7,-1 0.6,-2.8'],
  '.': [3.6, '1.5,0.2 1.9,0.7'],
  ':': [3.8, '1.6,7.4 2,7.9', '1.5,0.2 1.9,0.7'],
  '!': [4.2, '2,16 2,4.6', '1.9,0.2 2.3,0.7'],
  '(': [5, '4.2,17.5 1.9,12 1.2,6 2.2,0 4.2,-3'],
  ')': [5, '0.8,17.5 3.1,12 3.8,6 2.8,0 0.8,-3'],
  '+': [9, '1,6 8,6.2', '4.5,9.8 4.5,2.4'],
};
const handParsed = new Map();
function handGlyph(ch) {
  if (!handParsed.has(ch)) {
    const g = HAND[ch];
    if (!g) throw new Error(`no hand glyph for ${JSON.stringify(ch)}`);
    handParsed.set(ch, {
      w: g[0],
      strokes: g.slice(1).map((s) => s.trim().split(/\s+/).map((tok) => {
        const c = tok.endsWith('!');
        const [x, y] = (c ? tok.slice(0, -1) : tok).split(',').map(Number);
        return { x, y, c };
      })),
    });
  }
  return handParsed.get(ch);
}
const HSPACE = 5.8;
// Write by hand with the baseline's left end at (x, y). Returns an array of letters, each an
// array of strokes, each an array of points {x, y, c}.
function hand(str, x, y, s, o = {}) {
  const { slant = 0.16, track = 1.6, wob = 0.5, angle = 0 } = o;
  const letters = [];
  let pen = 0, by = 0;
  const ca = Math.cos(angle), sa = Math.sin(angle);
  for (const ch of str) {
    if (ch === ' ') { pen += HSPACE * s; continue; }
    const g = handGlyph(ch);
    by = Math.max(-wob * 1.6 * s, Math.min(wob * 1.6 * s, by + J(wob) * s));
    const rot = J(0.05), sc = 1 + J(0.06);
    const cr = Math.cos(rot), sr = Math.sin(rot);
    letters.push(g.strokes.map((st) => st.map((p) => {
      const gx = p.x - g.w / 2, gy = p.y;
      let X = (gx * cr + gy * sr) * sc + g.w / 2;
      const Y = (-gx * sr + gy * cr) * sc;
      X += slant * Y;
      const lx = pen + X * s + J(0.12), ly = by - Y * s + J(0.12);
      return { x: x + lx * ca - ly * sa, y: y + lx * sa + ly * ca, c: p.c };
    })));
    pen += (g.w + track + J(0.3)) * s;
  }
  letters.endX = x + pen * ca;
  letters.endY = y + pen * sa;
  return letters;
}
// One Chaikin pass on each run between hard corners, then a polyline in relative moves.
function strokeD(pts) {
  const out = [pts[0]];
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1];
    const smoothA = i > 0 && !a.c, smoothB = i + 1 < pts.length - 1 && !b.c;
    if (smoothA) out.push({ x: a.x * 0.75 + b.x * 0.25, y: a.y * 0.75 + b.y * 0.25 });
    if (smoothB) out.push({ x: a.x * 0.25 + b.x * 0.75, y: a.y * 0.25 + b.y * 0.75 });
    else out.push(b);
  }
  let d = `M${f1(out[0].x)} ${f1(out[0].y)}`;
  let px = Math.round(out[0].x * 10) / 10, py = Math.round(out[0].y * 10) / 10;
  if (out.length === 2 && Math.hypot(out[1].x - out[0].x, out[1].y - out[0].y) < 0.8) {
    return `${d}l${f1(out[1].x - out[0].x || 0.1)} ${f1(out[1].y - out[0].y)}`;
  }
  d += 'l';
  const parts = [];
  for (let i = 1; i < out.length; i++) {
    const nx = Math.round(out[i].x * 10) / 10, ny = Math.round(out[i].y * 10) / 10;
    const dx = nx - px, dy = ny - py;
    if (Math.abs(dx) < 0.05 && Math.abs(dy) < 0.05 && i < out.length - 1) continue;
    parts.push(`${f1(dx)} ${f1(dy)}`);
    px = nx; py = ny;
  }
  return d + parts.join(' ').replace(/ -/g, '-');
}
const lettersD = (letters) => letters.map((l) => l.map(strokeD).join('')).join('');

// ---------------------------------------------------------------------------------------------
// 3. The logo: CASTAWAY in wide chamfered block capitals, 12 x 12 grid units each (W is 14),
//    printed solid, cut by a white wave, striped below it like a reflection, with a hatched
//    shadow. The edges are roughened so it reads as a photocopy of a photocopy.
// ---------------------------------------------------------------------------------------------
const LOGO = {
  C: { w: 12, polys: [[[2.6, 0], [12, 0], [12, 3], [3.2, 3], [3.2, 9], [12, 9], [12, 12], [2.6, 12], [0, 9.4], [0, 2.6]]] },
  A: { w: 12, polys: [[[2.6, 0], [9.4, 0], [12, 2.6], [12, 12], [8.8, 12], [8.8, 8.6], [3.2, 8.6], [3.2, 12], [0, 12], [0, 2.6]], [[3.2, 3], [8.8, 3], [8.8, 5.6], [3.2, 5.6]]] },
  S: { w: 12, polys: [[[2.6, 0], [12, 0], [12, 3], [3.2, 3], [3.2, 4.5], [9.4, 4.5], [12, 7.1], [12, 9.4], [9.4, 12], [0, 12], [0, 9], [8.8, 9], [8.8, 7.5], [2.6, 7.5], [0, 4.9], [0, 2.6]]] },
  T: { w: 12, polys: [[[0, 0], [12, 0], [12, 3], [7.6, 3], [7.6, 12], [4.4, 12], [4.4, 3], [0, 3]]] },
  W: { w: 14, polys: [[[0, 0], [3.2, 0], [3.2, 9], [5.4, 9], [5.4, 4.2], [8.6, 4.2], [8.6, 9], [10.8, 9], [10.8, 0], [14, 0], [14, 9.4], [11.4, 12], [2.6, 12], [0, 9.4]]] },
  Y: { w: 12, polys: [[[0, 0], [3.2, 0], [3.2, 4.4], [8.8, 4.4], [8.8, 0], [12, 0], [12, 5], [9.6, 7.4], [7.6, 7.4], [7.6, 12], [4.4, 12], [4.4, 7.4], [2.4, 7.4], [0, 5]]] },
};
const LU = 6.74;           // logo grid unit
const LGAP = 1.25;         // gap between letters, in grid units
function roughPoly(poly, ox, oy) {
  const pts = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length];
    const ax = ox + a[0] * LU, ay = oy + a[1] * LU, bx = ox + b[0] * LU, by = oy + b[1] * LU;
    const len = Math.hypot(bx - ax, by - ay);
    const n = Math.max(1, Math.round(len / 5.5));
    const nx = -(by - ay) / len, ny = (bx - ax) / len;
    for (let k = 0; k < n; k++) {
      const t = k / n;
      let off = k === 0 ? J(0.25) : J(0.6);
      if (k > 0 && rnd() < 0.05) off -= 1.4 + rnd() * 1.4;   // a toner bite
      pts.push([ax + (bx - ax) * t + nx * off, ay + (by - ay) * t + ny * off]);
    }
  }
  let d = `M${f1(pts[0][0])} ${f1(pts[0][1])}l`;
  const parts = [];
  for (let i = 1; i < pts.length; i++) parts.push(`${f1(pts[i][0] - pts[i - 1][0])} ${f1(pts[i][1] - pts[i - 1][1])}`);
  return d + parts.join(' ').replace(/ -/g, '-') + 'z';
}
function logoPath(word, x, y) {
  let cx = x, d = '';
  for (const ch of word) {
    const L = LOGO[ch];
    for (const p of L.polys) d += roughPoly(p, cx, y);
    cx += (L.w + LGAP) * LU;
  }
  return { d, w: cx - x - LGAP * LU };
}

// ---------------------------------------------------------------------------------------------
// 4. Lay out the sheet (all coordinates below are sheet-local, 0..SW x 0..SH)
// ---------------------------------------------------------------------------------------------
const M = 50;                                   // left margin
const LH = 23;                                  // line height of the typed form
const boxes = [];                               // {x, y, tick}
const dots = [];                                // dotted blanks: [x1, x2, y]
const blue = [];                                // static blue ballpoint letters
const blueExtra = [];                           // blue doodles and the circle (raw path data)

// The logo
const LOGO_X = M, LOGO_Y = 64;
const logo = logoPath('CASTAWAY', LOGO_X, LOGO_Y);
const LOGO_H = 12 * LU;

// Place and date, right of the logo
const DATE_Y = LOGO_Y + LOGO_H;
{
  const x = SW - M - 262;
  const x2 = type('THE ISLAND,', x, DATE_Y);
  dots.push([x2 + 2, SW - M, DATE_Y + 1]);
  blue.push(...hand('daytime, as usual', x2 + 6, DATE_Y - 3, 0.93));
}

// Hi ... of ...
const HI_Y = DATE_Y + 50;
{
  type('HI', M, HI_Y);
  dots.push([M + 26, M + 430, HI_Y + 1]);
  blue.push(...hand('whoever finds this', M + 46, HI_Y - 3, 1.12));
  type('OF', M + 452, HI_Y);
  dots.push([M + 478, M + 900, HI_Y + 1]);
  blue.push(...hand('wherever it washes up', M + 496, HI_Y - 3, 1.12, { angle: -0.012 }));
}

// A column of tick boxes. items: [tick, text] or [tick, null] for a dotted blank.
function column(x, y, heading, items, width) {
  type(heading, x, y);
  items.forEach(([tick, text], i) => {
    const by = y + LH * (i + 1);
    boxes.push({ x: x + 1, y: by - CAP + 0.5, tick });
    if (text === null) dots.push([x + 22, x + width, by + 1]);
    else type(text, x + 22, by);
  });
  return y + LH * items.length;
}

const R1 = HI_Y + 46;
const C3 = (SW - 2 * M) / 3;
column(M, R1, 'THANX FOR...', [
  [1, 'THE HEADPHONES (BY DRONE).'],
  [1, 'THE ICED COFFEE.'],
  [1, "THE TURTLE'S VISIT."],
  [1, 'ONE BAR OF SIGNAL (PALM TOP).'],
  [0, 'THE RESCUE.'],
], C3 - 30);
column(M + C3, R1, 'PLEASE SEND, TIDE PERMITTING...', [
  [1, 'A REPLY, BY BOTTLE.'],
  [1, 'MORE COCONUTS.'],
  [0, 'A SHIP THAT LOOKS THIS WAY.'],
  [0, 'A SECOND PALM.'],
  [0, null],
], C3 - 40);
column(M + 2 * C3, R1, 'MY LAST BOTTLE WAS...', [
  [0, 'FOUND.'],
  [0, 'READ.'],
  [0, 'ANSWERED.'],
  [1, 'BACK HERE BY THE NEXT WAVE.'],
  [0, null],
], C3 - 30);

const R2 = R1 + LH * 5 + 42;
const C2 = 548;
type('A FEW NOTES...', M, R2);
column(M, R2, '', [
  [1, 'NOTHING MUCH HAPPENS HERE. ON PURPOSE.'],
  [1, 'EVERY GAG STARTS ON THE NEXT BAR (3 S).'],
  [1, 'CHECK COCONUTS FOR HERMIT CRABS.'],
  [1, 'THE SHARK WEARS HEADPHONES. NOD BACK.'],
  [1, "THE SHIP ONLY PASSES WHILE I'M BUSY. RUDE."],
  [1, "SEE YOU ON YOUTUBE, ONCE IT'S FINISHED."],
], 0);
column(M + C2, R2, '', [
  [1, 'PLEASE SEND THE CORK BACK.'],
  [1, 'DO NOT WRITE "ISLAND" ON THE BOTTLE.'],
  [0, 'USE A BETTER BOTTLE.'],
  [1, 'THE CAT IS NOT MINE. IT COMES BY CRATE.'],
  [1, 'IT IS ALWAYS DAYTIME. HOUSE RULE.'],
  [1, 'I COULD LEAVE ANY TIME.'],
], 0);
blue.push(...hand('(did once: iced coffee)', M + C2 + 22 + tw('I COULD LEAVE ANY TIME.') + 12, R2 + LH * 6 - 1, 0.98, { angle: -0.02 }));

const R3 = R2 + LH * 6 + 42;
type('THIS BOTTLE CONTAINS...', M, R3);
{
  let y = R3 + LH;
  boxes.push({ x: M + 1, y: y - CAP + 0.5, tick: 1 });
  dots.push([M + 22, M + 78, y + 1]);
  blue.push(...hand('90+', M + 30, y - 2, 1.12));
  type('ACTIVITIES, FOUR TIMERS:', M + 84, y);
  y += LH;
  type('EVERY 2-5 MIN, 12-25 MIN, 30-60 MIN, 3-6 H.', M + 22, y);
  y += LH;
  boxes.push({ x: M + 1, y: y - CAP + 0.5, tick: 1 });
  dots.push([M + 22, M + 78, y + 1]);
  blue.push(...hand('150+', M + 26, y - 2, 1.12));
  type('SOUNDS, ALL SYNTHESIZED FROM CODE.', M + 84, y);
  y += LH;
  boxes.push({ x: M + 1, y: y - CAP + 0.5, tick: 1 });
  type('10:00:00 OF VIDEO, SEED 1992.', M + 22, y);
  y += LH;
  boxes.push({ x: M + 1, y: y - CAP + 0.5, tick: 1 });
  type('1 PALM. 1 RAFT. 0 NIGHTS.', M + 22, y);
}

// Write back to
const WB_X = M + C2;
let circle = null;
{
  type('WRITE BACK TO:', WB_X, R3);
  type('PYTHON TOOLS/SERVE.PY', WB_X + 22, R3 + LH);
  // leave room for the ballpoint loop, so it goes round the address and not through "OPEN"
  const x2 = type('THEN OPEN', WB_X + 22, R3 + LH * 2) + ADV * 2.6;
  const url = 'HTTP://127.0.0.1:8765/';
  type(url, x2, R3 + LH * 2);
  circle = { cx: x2 + tw(url) / 2 - 4, cy: R3 + LH * 2 - CAP / 2, rx: tw(url) / 2 + 10.5, ry: 14.5 };
  type("(NO RUSH. SHE'S IN.)", WB_X + 22, R3 + LH * 3);
  type('SIGNED, SEALED, CORKED:', WB_X, R3 + LH * 4 + 12);
  blue.push(...hand('her, under the palm', WB_X + 40, R3 + LH * 5 + 22, 1.22, { angle: -0.035 }));
}

// A ballpoint doodle in the margin: the island, the tall palm, her sitting under it, and a
// bottle that goes out and comes straight back. Curves go through the same smoothing as
// the handwriting.
function doodle(ox, oy, k = 1) {
  const P = [];
  const pt = (x, y, c = false) => ({ x: ox + x * k + J(0.22), y: oy + y * k + J(0.22), c });
  const curve = (pts) => P.push(strokeD(pts.map(([x, y, c]) => pt(x, y, c))));
  const ring = (cx, cy, r, n = 10) => curve(Array.from({ length: n + 1 }, (_, i) => [cx + Math.cos((i / n) * 6.35) * r, cy + Math.sin((i / n) * 6.35) * r]));
  // a frond: a thin leaf around a drooping centreline
  const frond = (c) => {
    const n = 8, L = [], R = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n, seg = Math.min(c.length - 2, Math.floor(t * (c.length - 1)));
      const u = t * (c.length - 1) - seg;
      const a = c[seg], b = c[seg + 1];
      const x = a[0] + (b[0] - a[0]) * u, y = a[1] + (b[1] - a[1]) * u;
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      const nx = -(b[1] - a[1]) / len, ny = (b[0] - a[0]) / len;
      const w = 2.5 * Math.sin(Math.PI * Math.min(1, t * 1.15));
      L.push([x + nx * w, y + ny * w]);
      R.push([x - nx * w * 0.8, y - ny * w * 0.8]);
    }
    curve([...L, ...R.reverse().slice(1)]);
  };
  // sea, with a little wave either side
  curve([[-4, 50], [4, 48.6], [12, 50.4], [20, 48.8], [62, 49], [70, 50.6], [78, 48.8], [86, 50.4], [94, 49]]);
  // the island
  curve([[6, 49.4, true], [12, 43], [22, 39.6], [34, 38.8], [46, 40.6], [54, 45], [58, 49.4, true]]);
  // the palm: tall, slender, gently curved, with segment ticks
  curve([[27, 39.6], [27.4, 30], [28.8, 21], [31.4, 12], [35.4, 4]]);
  for (const [x, y] of [[27.4, 33], [28, 26], [29.4, 19], [31.4, 12.4]]) curve([[x - 1.8, y + 0.8, true], [x + 1.8, y - 0.4, true]]);
  frond([[35.4, 4], [27, 0], [19, 1.6], [13, 7]]);
  frond([[35.4, 4], [44, 0.4], [52, 2], [57.5, 8]]);
  frond([[35.4, 4], [31, -5], [24, -8.5], [17.5, -7]]);
  frond([[35.4, 4], [41, -6], [48.5, -9], [55, -7.5]]);
  frond([[35.4, 4], [35.6, -5], [33.6, -12]]);
  ring(34.2, 6.4, 1.15, 7);
  ring(37, 6.8, 1.15, 7);
  // her, sitting by the trunk with her knees up and her headphones on
  ring(38.6, 27.4, 2.9);
  ring(35.6, 28.4, 1.25, 7);                                         // the low bun
  curve([[36, 26], [37.4, 24.1], [39.8, 24], [41.3, 25.9]]);         // headband
  ring(38.4, 28, 1.15, 7);                                           // ear cup
  curve([[37.6, 30.3, true], [37.2, 34], [37.4, 38.4, true]]);        // back
  curve([[37.8, 31, true], [41, 31.3, true], [40.8, 35.2, true], [37.4, 35.2, true]]); // tank top
  curve([[37.4, 38.4, true], [43.6, 32.4, true], [46.6, 38.6, true], [48.6, 38.6, true]]); // knee up, bare foot
  curve([[40.6, 31.8, true], [43.4, 33.6, true]]);                    // arm on the knee
  // a bottle on the water
  curve([[69, 47.2, true], [78, 45.2], [80, 46.4, true], [70.2, 49.4, true], [69, 47.2, true]]);
  curve([[80, 45.8, true], [83.4, 45, true]]);
  // the round trip, as two arrows: out over the top to the bottle, and straight back
  // underneath to the island
  curve([[53, 39.4], [58, 33.4], [66, 30.6], [74, 31.6], [79.6, 36.4], [81, 41.6, true]]);
  curve([[77.6, 39.4, true], [81, 41.6, true], [83.2, 38, true]]);
  curve([[86, 52], [80, 55.4], [71, 56.4], [63, 55], [57.6, 52.6, true]]);
  curve([[61.4, 50.6, true], [57.6, 52.6, true], [61, 55.8, true]]);
  return P.join('');
}
blueExtra.push(doodle(SW - M - 124, R3 + 66, 1.4));

// The blue circle around the address, drawn twice round like a ballpoint does
{
  const { cx, cy, rx, ry } = circle;
  const pts = [];
  const n = 46;
  for (let i = 0; i <= n * 1.12; i++) {
    const a = -2.6 + (i / n) * Math.PI * 2;
    const k = 1 + 0.028 * Math.sin(i * 0.7) + (i / n) * 0.022;
    pts.push([cx + Math.cos(a) * rx * k + J(0.4), cy + Math.sin(a) * ry * k + J(0.3)]);
  }
  blueExtra.push(`M${pts.map(([x, y]) => `${f1(x)} ${f1(y)}`).join(' ')}`);
}

// ---------------------------------------------------------------------------------------------
// 5. The red pen's route: an X in every ticked box, one after another
// ---------------------------------------------------------------------------------------------
const ticks = [];   // strokes: {a: [x, y], b: [x, y], t0, dur}
const PEN_REST = { x: 404, y: SH - 32, rot: 52 };
const T_START = 0.5;
let t = T_START + 0.55;
let prev = [PEN_REST.x, PEN_REST.y];
const penKeys = [{ t: 0, x: PEN_REST.x, y: PEN_REST.y, r: PEN_REST.rot, s: 1 }, { t: T_START, x: PEN_REST.x, y: PEN_REST.y, r: PEN_REST.rot, s: 1 }];
for (const b of boxes.filter((bx) => bx.tick)) {
  const big = rnd() < 0.25 ? 2.6 : 0;
  const s1a = [b.x + 1.4 + J(1), b.y + 1.2 + J(1) - big], s1b = [b.x + 10.8 + J(1.3) + big, b.y + 11.6 + J(1)];
  const s2a = [b.x + 10.6 + J(1) + big * 0.6, b.y + 0.8 + J(1) - big], s2b = [b.x + 0.8 + J(1.3), b.y + 12 + J(1) + big * 0.4];
  const travel = Math.hypot(s1a[0] - prev[0], s1a[1] - prev[1]);
  const move = penKeys.length === 2 ? 0.55 : 0.07 + travel / 2100;
  if (penKeys.length > 2) {
    penKeys.push({ t: t + 0.015, x: prev[0] + (s1a[0] - prev[0]) * 0.15, y: prev[1] + (s1a[1] - prev[1]) * 0.15 - 2, r: 0, s: 1.035 });
  }
  t += move;
  const d1 = 0.075 + rnd() * 0.02, d2 = 0.075 + rnd() * 0.02, lift = 0.05;
  penKeys.push({ t, x: s1a[0], y: s1a[1], r: 0, s: 1 });
  ticks.push({ a: s1a, b: s1b, t0: t, dur: d1 });
  t += d1;
  penKeys.push({ t, x: s1b[0], y: s1b[1], r: 0, s: 1 });
  penKeys.push({ t: t + lift * 0.5, x: (s1b[0] + s2a[0]) / 2, y: (s1b[1] + s2a[1]) / 2 - 1.5, r: 0, s: 1.03 });
  t += lift;
  penKeys.push({ t, x: s2a[0], y: s2a[1], r: 0, s: 1 });
  ticks.push({ a: s2a, b: s2b, t0: t, dur: d2 });
  t += d2;
  penKeys.push({ t, x: s2b[0], y: s2b[1], r: 0, s: 1 });
  prev = s2b;
}
penKeys.push({ t: t + 0.05, x: prev[0] + 6, y: prev[1] - 6, r: 0, s: 1.04 });
t += 0.75;
penKeys.push({ t, x: PEN_REST.x, y: PEN_REST.y, r: PEN_REST.rot, s: 1 });
const T_PEN = t;

// The "spread by" note writes itself in red felt-tip along the top while the pen works.
const spread = hand('spread by: the tide of Highwater', M + 6, 40, 1.42, { angle: -0.022, slant: 0.2, wob: 0.7 });
const T_SPREAD = 0.35, SPREAD_PER = 0.075;

// ---------------------------------------------------------------------------------------------
// 6. The paper: speckle, a copier streak, fold creases, a soft grey edge
// ---------------------------------------------------------------------------------------------
function speckle(n, seed) {
  const r = makeRng(seed);
  const groups = [[], [], []];
  for (let i = 0; i < n; i++) {
    // more toner dust near the edges, as copies of copies have
    let x = r() * SW, y = r() * SH;
    if (r() < 0.45) {
      const e = r() * 4 | 0, d = Math.pow(r(), 2.2) * 60;
      if (e === 0) x = d; else if (e === 1) x = SW - d; else if (e === 2) y = d; else y = SH - d;
    }
    groups[r() < 0.6 ? 0 : r() < 0.75 ? 1 : 2].push(`M${Math.round(x)} ${Math.round(y)}h0`);
  }
  return groups;
}
const dust = speckle(900, 7);

function crease(x1, y1, x2, y2) {
  const n = 14, pts = [];
  for (let i = 0; i <= n; i++) {
    const tt = i / n;
    pts.push([x1 + (x2 - x1) * tt + (x1 === x2 ? J(0.8) : 0), y1 + (y2 - y1) * tt + (y1 === y2 ? J(0.8) : 0)]);
  }
  return `M${pts.map(([x, y]) => `${f1(x)} ${f1(y)}`).join(' ')}`;
}
// The original lay a little skew on the copier glass: a dark ragged wedge along the left edge.
const wedge = (() => {
  const pts = [[0, 0]];
  for (let y = 0; y <= SH * 0.62; y += 9) pts.push([Math.max(0, 7.5 * (1 - y / (SH * 0.62)) + J(0.9)), y]);
  pts.push([0, SH * 0.62]);
  return `M${pts.map(([x, y]) => `${f1(x)} ${f1(y)}`).join(' ')}Z`;
})();
// A ring from the bottom of an iced coffee, set down on the letter after it was copied.
const coffee = (() => {
  const cx = 690, cy = 16, r = 37, pts = [];
  for (let i = 0; i <= 40; i++) {
    const a = 0.3 + (i / 40) * Math.PI * 1.9;
    const rr = r + Math.sin(i * 1.7) * 0.7 + J(0.35);
    pts.push(`${f1(cx + Math.cos(a) * rr)} ${f1(cy + Math.sin(a) * rr * 0.97)}`);
  }
  return { ring: `M${pts.join(' ')}`, cx, cy, r };
})();
const creaseV = crease(SW * 0.5 + 6, 0, SW * 0.5 + 6, SH);
const creaseH = crease(0, SH * 0.5 - 4, SW, SH * 0.5 - 4);

// ---------------------------------------------------------------------------------------------
// 7. Props: the bottle (paperweight), the cork, the red pen, the sticker
// ---------------------------------------------------------------------------------------------
// The red pen, drawn with its tip at the origin and its body along +x, then turned so that it
// leans up and to the right like a pen in a right hand.
const PEN_LEN = 186, PEN_ANG = -57;
function penSvg() {
  const outline = [[0, 0], [5, -1.5], [24, -5.4], [28, -5.6], [174, -5.6], [176, -4.6], [186, -4.4], [187, 0], [186, 4.4], [176, 4.6], [174, 5.6], [28, 5.6], [24, 5.4], [5, 1.5]];
  // the shadow falls down and to the right and grows towards the raised end
  const a = (-PEN_ANG * Math.PI) / 180;
  const shadow = outline.map(([x, y]) => {
    const k = 1.5 + (x / PEN_LEN) * 20;
    const gx = k * 0.62, gy = k * 0.78;                      // global offset direction
    const lx = gx * Math.cos(a) - gy * Math.sin(a), ly = gx * Math.sin(a) + gy * Math.cos(a);
    return [x + lx, y + ly];
  });
  const poly = (pts) => pts.map(([x, y]) => `${f1(x)},${f1(y)}`).join(' ');
  return `<g transform="rotate(${PEN_ANG})">`
    + `<polygon points="${poly(shadow)}" fill="#000" fill-opacity=".2"/>`
    + `<polygon points="0,0 5,-1.5 5,1.5" fill="#6e6e6e"/>`
    + `<polygon points="5,-1.5 24,-5.4 24,5.4 5,1.5" fill="#efe9dc" stroke="#8a8378" stroke-width=".6"/>`
    + `<rect x="24" y="-5.6" width="150" height="11.2" rx="1.5" fill="#c51d28"/>`
    + `<rect x="24" y="-2.2" width="150" height="2.6" fill="#e75a63"/>`
    + `<rect x="24" y="3" width="150" height="2.6" fill="#9a1019"/>`
    + `<rect x="30" y="-5.6" width="1.4" height="11.2" fill="#9a1019" opacity=".7"/>`
    + `<rect x="174" y="-4.6" width="13" height="9.2" rx="2" fill="#a8141f"/>`
    + `<rect x="176" y="-1.6" width="10" height="1.8" fill="#d8434c"/>`
    + `</g>`;
}

function bottleSvg(cx, cy, ang, k = 1) {
  // local frame: the base at +x, the neck towards -x
  const body = 'M-30,-25 C-12,-27 70,-27 92,-25 C102,-24 104,-12 104,0 C104,12 102,24 92,25 C70,27 -12,27 -30,25 C-44,23 -50,13 -64,10 L-96,9 C-99,9 -100,7 -100,0 C-100,-7 -99,-9 -96,-9 L-64,-10 C-50,-13 -44,-23 -30,-25 Z';
  return `<g transform="translate(${cx} ${cy}) rotate(${ang}) scale(${k})">`
    // shadow and the green light the glass throws onto the paper
    + `<path d="${body}" transform="translate(9 17)" fill="#000" fill-opacity=".16"/>`
    + `<ellipse cx="30" cy="30" rx="44" ry="7" fill="#9fe0bf" fill-opacity=".35"/>`
    + `<path d="${body}" fill="#2f8a62" fill-opacity=".42" stroke="#1d5c40" stroke-opacity=".75" stroke-width="1.6"/>`
    + `<path d="M-96,-6 L-64,-7 C-50,-10 -44,-19 -30,-21 C-12,-23 70,-23 90,-21" fill="none" stroke="#e9fff4" stroke-opacity=".75" stroke-width="3.2" stroke-linecap="round"/>`
    + `<path d="M-20,17 C10,20 60,20 88,18" fill="none" stroke="#0f3d29" stroke-opacity=".35" stroke-width="4" stroke-linecap="round"/>`
    + `<path d="M96,-18 C101,-10 101,10 96,18" fill="none" stroke="#1d5c40" stroke-opacity=".55" stroke-width="2.2"/>`
    + `<rect x="-104" y="-11" width="9" height="22" rx="3" fill="#2f8a62" fill-opacity=".55" stroke="#1d5c40" stroke-opacity=".8" stroke-width="1.4"/>`
    + `</g>`;
}
function corkSvg(cx, cy, ang) {
  return `<g transform="translate(${cx} ${cy}) rotate(${ang})">`
    + `<rect x="-11" y="-7" width="22" height="16" rx="3" fill="#000" fill-opacity=".14" transform="translate(3 4)"/>`
    + `<rect x="-11" y="-8" width="22" height="16" rx="3" fill="#c49a62" stroke="#8a6436" stroke-width="1.2"/>`
    + `<ellipse cx="11" cy="0" rx="2.5" ry="7.6" fill="#d9b47e" stroke="#8a6436" stroke-width="1"/>`
    + `<path d="M-6,-3h3M-1,2h4M-7,4h2M2,-4h3" stroke="#8a6436" stroke-width="1" stroke-linecap="round"/>`
    + `</g>`;
}

function stickerSvg() {
  // The spreader's sticker, stuck on after copying, so crisp white: a scalloped oval seal
  // with the group's name, its motto (tides do come round twice a day) and a little swell.
  const cx = SW - M - 80, cy = 57, rx = 80, ry = 43;
  let s = `<g transform="translate(${cx} ${cy}) rotate(5)">`;
  const scallop = (ox, oy, rx0, ry0, bumps, depth) => {
    const pts = [];
    const n = bumps * 6;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const k = 1 - depth * (0.5 - 0.5 * Math.cos((i / 6) * Math.PI * 2));
      pts.push(`${f1(ox + Math.cos(a) * rx0 * k)} ${f1(oy + Math.sin(a) * ry0 * k)}`);
    }
    return `M${pts.join(' ')}Z`;
  };
  s += `<path d="${scallop(2.5, 3.5, rx, ry, 30, 0.045)}" fill="#000" fill-opacity=".13"/>`;
  s += `<path d="${scallop(0, 0, rx, ry, 30, 0.045)}" fill="#fff" stroke="#cfcabd" stroke-width=".8"/>`;
  s += `<ellipse rx="${rx - 9}" ry="${ry - 8}" fill="none" stroke="#000" stroke-width="2.2"/>`;
  s += `<ellipse rx="${rx - 13.5}" ry="${ry - 12.5}" fill="none" stroke="#000" stroke-width=".9"/>`;
  // the name in heavy condensed capitals: the typed font, stretched tall and stroked fat
  const word = 'HIGHWATER';
  const sx = 1.62, sy = 2.45, adv = 6.6 * sx;
  const wx = -((word.length - 1) * adv + 5 * sx) / 2, wy = -9.5;
  let d = '';
  word.split('').forEach((ch, i) => {
    d += TYPE_SRC[ch].split('|').map((st) => st.trim().split(/\s+/).map((tok, k) => {
      const [gx, gy] = tok.split(',').map(Number);
      return `${k ? (k === 1 ? 'L' : ' ') : 'M'}${f1(wx + i * adv + gx * sx)} ${f1(wy + gy * sy)}`;
    }).join('')).join('');
  });
  s += `<path d="${d}" fill="none" stroke="#000" stroke-width="3.3" stroke-linecap="square" stroke-linejoin="miter"/>`;
  // the motto above, small
  const motto = 'TWICE DAILY', ms = 0.62;
  s += `<g class="ty" style="stroke:#000;stroke-width:2" transform="translate(${f1(-(motto.length * ADV - (ADV - 5 * GU)) * ms / 2)} -14.5) scale(${ms})">`;
  motto.split('').forEach((ch, i) => { if (ch !== ' ') s += `<use href="#${typeId(ch)}" x="${f1(i * ADV)}" y="0"/>`; });
  s += `</g>`;
  // a small swell underneath, three crests
  const sw = [];
  for (let i = 0; i <= 36; i++) {
    const x = -33 + (i / 36) * 66;
    sw.push(`${f1(x)} ${f1(22.5 - Math.abs(Math.sin((i / 36) * Math.PI * 3)) * 4.2)}`);
  }
  s += `<path d="M${sw.join(' ')}" fill="none" stroke="#000" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`;
  return s + '</g>';
}

// ---------------------------------------------------------------------------------------------
// 8. Assemble
// ---------------------------------------------------------------------------------------------
const SAND = (() => {
  const r = makeRng(31);
  const dark = [], light = [];
  for (let i = 0; i < 1500; i++) {
    const x = Math.round(r() * W), y = Math.round(r() * H);
    (r() < 0.55 ? dark : light).push(`M${x} ${y}h0`);
  }
  return { dark: dark.join(''), light: light.join('') };
})();

function inkTicks() {
  return ticks.map((k) => `<path d="M${f1(k.a[0])} ${f1(k.a[1])}L${f1(k.b[0])} ${f1(k.b[1])}" pathLength="1" style="animation-delay:${f2(k.t0)}s;animation-duration:${f2(k.dur)}s"/>`).join('');
}
function inkSpread() {
  return spread.map((l, i) => `<path d="${l.map(strokeD).join('')}" pathLength="1" style="animation-delay:${f2(T_SPREAD + i * SPREAD_PER)}s;animation-duration:${f2(SPREAD_PER * 1.25)}s"/>`).join('');
}
function penKeyframes() {
  const pct = (tt) => `${f2((tt / T_PEN) * 100)}%`;
  const frame = (k) => `transform:translate(${f1(k.x)}px,${f1(k.y)}px) rotate(${k.r}deg) scale(${k.s})`;
  return `@keyframes pen{${penKeys.map((k) => `${pct(k.t)}{${frame(k)}}`).join('')}}`;
}

const CSS = [
  `.ty{fill:none;stroke:${TONER};stroke-width:1.45;stroke-linecap:round;stroke-linejoin:round}`,
  `.ty2{stroke:#4a4a4a;stroke-width:1.3}`,
  `.bx{fill:none;stroke:${TONER};stroke-width:1.3;stroke-linejoin:miter}`,
  `.dt{fill:none;stroke:${TONER};stroke-width:1.5;stroke-linecap:round;stroke-dasharray:0 3.6}`,
  `.bl{fill:none;stroke:${BLUE};stroke-width:1.45;stroke-linecap:round;stroke-linejoin:round;stroke-opacity:.92}`,
  `.rd path{stroke-dasharray:1 1.1;animation-name:wr;animation-timing-function:linear;animation-fill-mode:both}`,
  `.tk{fill:none;stroke:${RED};stroke-width:1.9;stroke-linecap:round;stroke-opacity:.92}`,
  `.sp{fill:none;stroke:${RED};stroke-width:3.3;stroke-linecap:round;stroke-linejoin:round;stroke-opacity:.88}`,
  `@keyframes wr{from{stroke-dashoffset:1.05}to{stroke-dashoffset:0}}`,
  `.pen{transform:translate(${PEN_REST.x}px,${PEN_REST.y}px) rotate(${PEN_REST.rot}deg);animation:pen ${f2(T_PEN)}s linear both}`,
  penKeyframes(),
  `@media (prefers-reduced-motion:reduce){.rd path,.pen{animation:none}.rd path{stroke-dasharray:none}}`,
].join('');

const typedDefs = [...typeIds].map(([ch, id]) => `<path id="${id}" d="${typeGlyphPath(ch)}"/>`).join('');

const TITLE_TEXT = 'CASTAWAY: a tick-box form letter from a very small island';
const DESC = 'A photocopied tick-box swap letter lying on sunny sand, with a green glass bottle on its corner as a paperweight and its cork beside it. '
  + 'The CASTAWAY logo runs across the top in wide black block capitals, cut by a white wave, with thin white bands below it like a reflection. '
  + 'In red felt-tip across the top: spread by: the tide of Highwater, and a scalloped sticker in the corner reads HIGHWATER, twice daily. '
  + 'Filled in with blue ballpoint: The island, daytime, as usual. Hi whoever finds this, of wherever it washes up. '
  + 'A red pen ticks the boxes. Thanx for: the headphones (by drone), the iced coffee, the turtle\'s visit, one bar of signal (palm top); not the rescue. '
  + 'Please send, tide permitting: a reply, by bottle; more coconuts; not ticked: a ship that looks this way, a second palm. '
  + 'My last bottle was: back here by the next wave. '
  + 'A few notes: nothing much happens here, on purpose. Every gag starts on the next bar (3 s). Check coconuts for hermit crabs. The shark wears headphones, nod back. '
  + 'The ship only passes while I\'m busy, rude. See you on YouTube, once it\'s finished. Please send the cork back. Do not write island on the bottle. '
  + 'The cat is not mine, it comes by crate. It is always daytime, house rule. I could leave any time (did once: iced coffee). '
  + 'This bottle contains: 90+ activities, four timers: every 2-5 min, 12-25 min, 30-60 min, 3-6 h; 150+ sounds, all synthesized from code; 10:00:00 of video, seed 1992; 1 palm, 1 raft, 0 nights. '
  + 'Write back to: python tools/serve.py, then open http://127.0.0.1:8765/ (circled). No rush, she\'s in. Signed, sealed, corked: her, under the palm, beside a doodle of the island with arrows showing a bottle going out and coming straight back.';

const sheetBody = [
  // paper
  `<rect width="${SW}" height="${SH}" fill="${PAPER}"/>`,
  `<rect width="${SW}" height="${SH}" fill="url(#edge)"/>`,
  `<rect x="${SW - 70}" width="70" height="${SH}" fill="url(#edgeR)"/>`,
  `<rect x="-200" y="${SH * 0.32}" width="${SW + 400}" height="46" fill="url(#streak)" transform="rotate(-8 ${SW / 2} ${SH / 2})"/>`,
  `<path d="M${SW - 16} 0V${SH}" stroke="url(#copyline)" stroke-width="1.2"/>`,
  `<path d="${wedge}" fill="#1c1c1c" fill-opacity=".82"/>`,
  // fold creases: a shadow and a highlight
  `<g fill="none"><path d="${creaseV}" stroke="#000" stroke-opacity=".07" stroke-width="2.2" transform="translate(1.2 0)"/><path d="${creaseV}" stroke="#fff" stroke-opacity=".9" stroke-width="1.1"/>`,
  `<path d="${creaseH}" stroke="#000" stroke-opacity=".07" stroke-width="2.2" transform="translate(0 1.2)"/><path d="${creaseH}" stroke="#fff" stroke-opacity=".9" stroke-width="1.1"/></g>`,
  // the logo: hatched shadow, solid letters, then the wave and stripes cut out of them
  `<use href="#lg" x="5.5" y="5.5" fill="url(#hatch)"/>`,
  `<use href="#lg" fill="${TONER}"/>`,
  `<g clip-path="url(#lc)" fill="${PAPER}">${logoBands()}</g>`,
  // the typed form
  `<g class="ty">${typedMain.join('')}<g class="ty2">${typedPale.join('')}</g></g>`,
  `<path class="bx" d="${boxes.map((b) => `M${f1(b.x + J(0.2))} ${f1(b.y + J(0.2))}h12v12.5h-12z`).join('')}"/>`,
  `<path class="dt" d="${dots.map(([a, b, y]) => `M${f1(a)} ${f1(y)}H${f1(b)}`).join('')}"/>`,
  // blue ballpoint, filled in before the letter went in the bottle
  `<path class="bl" d="${lettersD(blue)}${blueExtra.join('')}"/>`,
  stickerSvg(),
  `<g clip-path="url(#sheetclip)"><circle cx="${coffee.cx}" cy="${coffee.cy}" r="${coffee.r}" fill="#a7743c" fill-opacity=".045"/>`,
  `<path d="${coffee.ring}" fill="none" stroke="#8a5a2b" stroke-opacity=".2" stroke-width="2.2" stroke-linecap="round"/>`,
  `<path d="${coffee.ring}" fill="none" stroke="#8a5a2b" stroke-opacity=".08" stroke-width="7" stroke-linecap="round" transform="translate(${f1(coffee.cx * 0.04)} ${f1(coffee.cy * 0.04)}) scale(.96)"/></g>`,
  // toner dust over everything printed
  `<g fill="none" stroke="#222" stroke-linecap="round"><path d="${dust[0].join('')}" stroke-width="1" stroke-opacity=".38"/><path d="${dust[1].join('')}" stroke-width="1.7" stroke-opacity=".45"/><path d="${dust[2].join('')}" stroke-width="2.6" stroke-opacity=".5"/></g>`,
  // red ink, animated
  `<g class="rd tk">${inkTicks()}</g>`,
  `<g class="rd sp">${inkSpread()}</g>`,
  // the pen
  `<g class="pen">${penSvg()}</g>`,
].join('');

function logoBands() {
  const x0 = LOGO_X - 10, x1 = LOGO_X + logo.w + 10;
  // a white wave a little below the middle
  const wy = LOGO_Y + LOGO_H * 0.47;
  const top = [], bot = [];
  for (let x = x0; x <= x1; x += 6) {
    const ph = (x - x0) / 34;
    // a swell: rounded crests, a thicker band at each crest
    const c = Math.sin(ph);
    top.push(`${f1(x)} ${f1(wy + c * 5.2 - 2.6 - Math.max(0, -c) * 1.2)}`);
    bot.push(`${f1(x)} ${f1(wy + Math.sin(ph - 0.35) * 5.2 + 2.4)}`);
  }
  let d = `M${top.join(' L')} L${bot.reverse().join(' L')}Z`;
  // stripes below it, getting thicker towards the bottom, like a reflection
  for (let i = 0; i < 4; i++) {
    const y = wy + 12.5 + i * 7.4;
    const th = 1.1 + i * 0.95;
    d += `M${x0} ${f1(y)}H${x1}v${f1(th)}H${x0}z`;
  }
  // and one thin highlight line near the top
  d += `M${x0} ${f1(LOGO_Y + 6.5)}H${x1}v1.5H${x0}z`;
  return `<path d="${d}"/>`;
}

const cx = SX + SW / 2, cy = SY + SH / 2;
const sheetT = `translate(${cx} ${cy}) rotate(${SROT}) translate(${-SW / 2} ${-SH / 2})`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="t d">`
  + `<title id="t">${TITLE_TEXT}</title><desc id="d">${DESC.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</desc>`
  + `<!-- Generated by examples/castaway/src/${SLUG}.mjs: edit that, not this. Style: scene paperwork (catalogue print-05). -->`
  + `<style>${CSS}</style>`
  + `<defs>`
  + typedDefs
  + `<path id="lg" d="${logo.d}" fill-rule="evenodd"/>`
  + `<clipPath id="lc"><path d="${logo.d}" clip-rule="evenodd"/></clipPath>`
  + `<pattern id="hatch" width="3.6" height="3.6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0V3.6" stroke="${TONER}" stroke-width="1.15"/></pattern>`
  + `<linearGradient id="edge" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".09"/><stop offset=".035" stop-color="#000" stop-opacity="0"/></linearGradient>`
  + `<linearGradient id="edgeR" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".06"/></linearGradient>`
  + `<linearGradient id="streak" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset=".5" stop-color="#000" stop-opacity=".045"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>`
  + `<linearGradient id="copyline" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".5"/><stop offset=".3" stop-color="#000" stop-opacity=".12"/><stop offset=".55" stop-color="#000" stop-opacity=".4"/><stop offset="1" stop-color="#000" stop-opacity=".2"/></linearGradient>`
  + `<radialGradient id="sun" cx=".3" cy=".2" r="1"><stop offset="0" stop-color="#f6e4bd"/><stop offset=".6" stop-color="#ebd09c"/><stop offset="1" stop-color="#d9b77d"/></radialGradient>`
  + `<clipPath id="sheetclip"><rect width="${SW}" height="${SH}"/></clipPath>`
  + `<clipPath id="panel"><rect width="${W}" height="${H}" rx="18"/></clipPath>`
  + `</defs>`
  + `<g clip-path="url(#panel)">`
  + `<rect width="${W}" height="${H}" fill="url(#sun)"/>`
  + `<g fill="none" stroke-linecap="round"><path d="${SAND.dark}" stroke="#b48d55" stroke-opacity=".5" stroke-width="1.6"/><path d="${SAND.light}" stroke="#fff6df" stroke-opacity=".7" stroke-width="1.4"/></g>`
  // the sheet's shadow on the sand
  + `<g transform="${sheetT}"><rect x="7" y="10" width="${SW}" height="${SH}" fill="#5a3f17" fill-opacity=".1"/><rect x="3" y="5" width="${SW}" height="${SH}" fill="#5a3f17" fill-opacity=".12"/></g>`
  + `<g transform="${sheetT}">${sheetBody}</g>`
  + corkSvg(918, 838, 18)
  + bottleSvg(1068, 818, -9, 1.12)
  + `</g></svg>\n`;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, svg);
console.log(`${path.relative(process.cwd(), OUT)}: ${(svg.length / 1024).toFixed(1)} KB`);
console.log(`typed glyphs ${typedMain.length + typedPale.length}, boxes ${boxes.length} (ticked ${boxes.filter((b) => b.tick).length}), pen ${T_PEN.toFixed(2)} s, spread-by done at ${(T_SPREAD + spread.length * SPREAD_PER).toFixed(2)} s`);
