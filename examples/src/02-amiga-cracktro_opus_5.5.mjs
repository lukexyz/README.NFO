// Amiga cracktro README banner for Dance Vision.
//
//   node examples/src/02-amiga-cracktro_opus_5.5.mjs
//
// Regenerates ../assets/02-amiga-cracktro_opus_5.5.svg. Plain Node, no deps,
// deterministic (seeded PRNG). Everything is drawn on a 320x128 "lowres"
// pixel grid: chrome logo, copper bars, parallax stars, stick-figure crew and
// a sine scroller. All lettering comes from the bitmap fonts below, so no
// viewer ever sees a fallback system font.
//
// Loop maths: the scroller moves at SPEED px/s through a stationary sine of
// WAVE px. A character at screen x has y = AMP*sin(2*pi*x/WAVE), so every
// character bobs with period WAVE/SPEED and a phase set by its index modulo
// WAVE/8. Characters that share a phase share one animated <g>. The text is
// padded to a whole number of wavelengths, so after one full scroll the
// duplicated head of the text sits exactly where the original started, in
// the same phase: no jump at the loop point.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(here, '../assets/02-amiga-cracktro_opus_5.5.svg');

const W = 320;
const H = 128;
// Rows of the three 5px tiny-font lines. Stars keep out of these bands so the
// small print never gets a stray pixel through a letter.
const PRESENTS_Y = 5;
const SUB_Y = 49;
const STATUS_Y = 117; // quick-start line
const TEXT_BANDS = [[PRESENTS_Y - 1, PRESENTS_Y + 5], [SUB_Y - 1, SUB_Y + 5], [STATUS_Y - 1, STATUS_Y + 5]];

// ---------------------------------------------------------------- utilities
function mulberry32(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(0xa500);
const n = (v) => (Number.isInteger(v) ? String(v) : String(+v.toFixed(3)));

class Grid {
  constructor(w, h) { this.w = w; this.h = h; this.a = new Uint8Array(w * h); }
  get(x, y) { return x >= 0 && y >= 0 && x < this.w && y < this.h ? this.a[y * this.w + x] : 0; }
  set(x, y, v = 1) { if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.a[y * this.w + x] = v; }
  count() { let c = 0; for (const v of this.a) c += v ? 1 : 0; return c; }
}

// Turn lit cells into a compact path: horizontal runs, merged down rows.
function cellsToPath(isOn, w, h, ox = 0, oy = 0) {
  const rects = [];
  let active = new Map();
  for (let y = 0; y < h; y++) {
    const next = new Map();
    let x = 0;
    while (x < w) {
      if (!isOn(x, y)) { x++; continue; }
      let x1 = x;
      while (x1 < w && isOn(x1, y)) x1++;
      const key = `${x},${x1}`;
      const r = active.get(key);
      if (r) { r.h++; next.set(key, r); } else { const nr = { x, y, w: x1 - x, h: 1 }; rects.push(nr); next.set(key, nr); }
      x = x1;
    }
    active = next;
  }
  return rects.map((r) => `M${n(r.x + ox)} ${n(r.y + oy)}h${r.w}v${r.h}h${-r.w}z`).join('');
}
const gridPath = (g, pred = (v) => v) => cellsToPath((x, y) => pred(g.get(x, y)), g.w, g.h);

function lerpHex(a, b, t) {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return `#${pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, '0')).join('')}`;
}
function ramp(keys, count) { // keys: [[row, '#hex'], ...] sorted by row
  const out = [];
  for (let r = 0; r < count; r++) {
    let k = 0;
    while (k < keys.length - 2 && r > keys[k + 1][0]) k++;
    const [r0, c0] = keys[k];
    const [r1, c1] = keys[k + 1];
    out.push(r <= r0 ? c0 : r >= r1 ? c1 : lerpHex(c0, c1, (r - r0) / (r1 - r0)));
  }
  return out;
}
// Hard-edged vertical gradient: one flat colour per pixel row.
function rowGradient(id, y0, colors) {
  const h = colors.length;
  const stops = colors.map((c, i) => `<stop offset="${n(i / h)}" stop-color="${c}"/><stop offset="${n((i + 1) / h)}" stop-color="${c}"/>`).join('');
  return `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="${y0}" x2="0" y2="${y0 + h}">${stops}</linearGradient>`;
}

// ------------------------------------------------------------ 8x8 scroll font
// Bold Topaz-ish capitals. '$' is a heart, '^' a quaver.
const F8 = {
  A: ['..###..', '.##.##.', '##...##', '##...##', '#######', '##...##', '##...##'],
  B: ['######.', '##...##', '##...##', '######.', '##...##', '##...##', '######.'],
  C: ['.#####.', '##...##', '##.....', '##.....', '##.....', '##...##', '.#####.'],
  D: ['#####..', '##..##.', '##...##', '##...##', '##...##', '##..##.', '#####..'],
  E: ['#######', '##.....', '##.....', '######.', '##.....', '##.....', '#######'],
  F: ['#######', '##.....', '##.....', '######.', '##.....', '##.....', '##.....'],
  G: ['.#####.', '##...##', '##.....', '##.####', '##...##', '##...##', '.######'],
  H: ['##...##', '##...##', '##...##', '#######', '##...##', '##...##', '##...##'],
  I: ['######', '..##..', '..##..', '..##..', '..##..', '..##..', '######'],
  J: ['....###', '.....##', '.....##', '.....##', '##...##', '##...##', '.#####.'],
  K: ['##...##', '##..##.', '##.##..', '####...', '##.##..', '##..##.', '##...##'],
  L: ['##.....', '##.....', '##.....', '##.....', '##.....', '##.....', '#######'],
  M: ['##...##', '###.###', '#######', '##.#.##', '##...##', '##...##', '##...##'],
  N: ['##...##', '###..##', '####.##', '##.####', '##..###', '##...##', '##...##'],
  O: ['.#####.', '##...##', '##...##', '##...##', '##...##', '##...##', '.#####.'],
  P: ['######.', '##...##', '##...##', '######.', '##.....', '##.....', '##.....'],
  Q: ['.#####.', '##...##', '##...##', '##...##', '##.#.##', '##..##.', '.###.##'],
  R: ['######.', '##...##', '##...##', '######.', '##.##..', '##..##.', '##...##'],
  S: ['.#####.', '##...##', '##.....', '.#####.', '.....##', '##...##', '.#####.'],
  T: ['######', '..##..', '..##..', '..##..', '..##..', '..##..', '..##..'],
  U: ['##...##', '##...##', '##...##', '##...##', '##...##', '##...##', '.#####.'],
  V: ['##...##', '##...##', '##...##', '##...##', '.##.##.', '..###..', '...#...'],
  W: ['##...##', '##...##', '##...##', '##.#.##', '#######', '###.###', '##...##'],
  X: ['##...##', '##...##', '.##.##.', '..###..', '.##.##.', '##...##', '##...##'],
  Y: ['##..##', '##..##', '##..##', '.####.', '..##..', '..##..', '..##..'],
  Z: ['#######', '....##.', '...##..', '..##...', '.##....', '##.....', '#######'],
  0: ['.#####.', '##..###', '##.####', '####.##', '###..##', '##...##', '.#####.'],
  1: ['..##..', '.###..', '..##..', '..##..', '..##..', '..##..', '######'],
  2: ['.#####.', '##...##', '.....##', '..####.', '.##....', '##.....', '#######'],
  3: ['.#####.', '##...##', '.....##', '..####.', '.....##', '##...##', '.#####.'],
  4: ['...###.', '..####.', '.##.##.', '##..##.', '#######', '....##.', '....##.'],
  5: ['#######', '##.....', '######.', '.....##', '.....##', '##...##', '.#####.'],
  6: ['.#####.', '##.....', '##.....', '######.', '##...##', '##...##', '.#####.'],
  7: ['#######', '.....##', '....##.', '...##..', '..##...', '..##...', '..##...'],
  8: ['.#####.', '##...##', '##...##', '.#####.', '##...##', '##...##', '.#####.'],
  9: ['.#####.', '##...##', '##...##', '.######', '.....##', '.....##', '.#####.'],
  '.': ['...', '...', '...', '...', '...', '.##', '.##'],
  ',': ['...', '...', '...', '...', '...', '.##', '.##', '##.'],
  '!': ['..##', '..##', '..##', '..##', '..##', '....', '..##'],
  '?': ['.#####.', '##...##', '....##.', '...##..', '...##..', '.......', '...##..'],
  "'": ['..##', '..##', '.##.'],
  '"': ['.##.##', '.##.##', '.#..#.'],
  '-': ['......', '......', '......', '.#####', '.#####'],
  ':': ['...', '.##', '.##', '...', '.##', '.##'],
  '/': ['.....##', '....##.', '...##..', '..##...', '.##....', '##.....', '#......'],
  '(': ['...##', '..##.', '.##..', '.##..', '.##..', '..##.', '...##'],
  ')': ['##...', '.##..', '..##.', '..##.', '..##.', '.##..', '##...'],
  '*': ['.......', '.##.##.', '..###..', '#######', '..###..', '.##.##.'],
  '+': ['......', '..##..', '..##..', '######', '..##..', '..##..'],
  '=': ['......', '......', '######', '......', '######'],
  '&': ['.###...', '##.##..', '.###...', '.###.##', '##.###.', '##..##.', '.###.##'],
  '>': ['.##....', '..##...', '...##..', '....##.', '...##..', '..##...', '.##....'],
  '<': ['....##.', '...##..', '..##...', '.##....', '..##...', '...##..', '....##.'],
  $: ['.##.##.', '#######', '#######', '#######', '.#####.', '..###..', '...#...'],
  '^': ['...###.', '...#.##', '...#...', '...#...', '.###...', '####...', '.##....'],
};

// ---------------------------------------------------------- 5px tiny font
const F5 = {
  A: ['.#.', '#.#', '###', '#.#', '#.#'], B: ['##.', '#.#', '##.', '#.#', '##.'],
  C: ['.##', '#..', '#..', '#..', '.##'], D: ['##.', '#.#', '#.#', '#.#', '##.'],
  E: ['###', '#..', '##.', '#..', '###'], F: ['###', '#..', '##.', '#..', '#..'],
  G: ['.##', '#..', '#.#', '#.#', '.##'], H: ['#.#', '#.#', '###', '#.#', '#.#'],
  I: ['###', '.#.', '.#.', '.#.', '###'], J: ['..#', '..#', '..#', '#.#', '.#.'],
  K: ['#.#', '#.#', '##.', '#.#', '#.#'], L: ['#..', '#..', '#..', '#..', '###'],
  M: ['#...#', '##.##', '#.#.#', '#...#', '#...#'], N: ['#..#', '##.#', '#.##', '#..#', '#..#'],
  O: ['.#.', '#.#', '#.#', '#.#', '.#.'], P: ['##.', '#.#', '##.', '#..', '#..'],
  Q: ['.#.', '#.#', '#.#', '##.', '.##'], R: ['##.', '#.#', '##.', '#.#', '#.#'],
  S: ['.##', '#..', '.#.', '..#', '##.'], T: ['###', '.#.', '.#.', '.#.', '.#.'],
  U: ['#.#', '#.#', '#.#', '#.#', '###'], V: ['#.#', '#.#', '#.#', '#.#', '.#.'],
  W: ['#...#', '#...#', '#.#.#', '##.##', '#...#'], X: ['#.#', '#.#', '.#.', '#.#', '#.#'],
  Y: ['#.#', '#.#', '.#.', '.#.', '.#.'], Z: ['###', '..#', '.#.', '#..', '###'],
  0: ['###', '#.#', '#.#', '#.#', '###'], 1: ['.#.', '##.', '.#.', '.#.', '###'],
  2: ['##.', '..#', '.#.', '#..', '###'], 3: ['##.', '..#', '.#.', '..#', '##.'],
  4: ['#.#', '#.#', '###', '..#', '..#'], 5: ['###', '#..', '##.', '..#', '##.'],
  6: ['.##', '#..', '###', '#.#', '###'], 7: ['###', '..#', '.#.', '.#.', '.#.'],
  8: ['###', '#.#', '###', '#.#', '###'], 9: ['###', '#.#', '###', '..#', '##.'],
  '.': ['.', '.', '.', '.', '#'], ',': ['.', '.', '.', '#', '#'], ':': ['.', '#', '.', '#', '.'],
  '!': ['#', '#', '#', '.', '#'], "'": ['#', '#', '.', '.', '.'], '-': ['...', '...', '###', '...', '...'],
  '>': ['#..', '.#.', '..#', '.#.', '#..'], '<': ['..#', '.#.', '#..', '.#.', '..#'],
  '/': ['..#', '..#', '.#.', '#..', '#..'], '*': ['...', '#.#', '.#.', '#.#', '...'],
  '=': ['...', '###', '...', '###', '...'], '+': ['...', '.#.', '###', '.#.', '...'],
  '(': ['.#', '#.', '#.', '#.', '.#'], ')': ['#.', '.#', '.#', '.#', '#.'],
  '?': ['##.', '..#', '.#.', '...', '.#.'], $: ['.#.#.', '#####', '#####', '.###.', '..#..'],
  '#': ['.#.#.', '#####', '.#.#.', '#####', '.#.#.'],
};
const tinyWidth = (s) => [...s].reduce((w, ch) => w + (ch === ' ' ? 3 : (F5[ch] ? F5[ch][0].length + 1 : 4)), 0) - 1;
function drawTiny(grid, s, x, y) {
  for (const ch of s) {
    if (ch === ' ') { x += 3; continue; }
    const g = F5[ch];
    if (!g) throw new Error(`tiny font lacks ${JSON.stringify(ch)}`);
    g.forEach((row, r) => [...row].forEach((c, k) => { if (c === '#') grid.set(x + k, y + r); }));
    x += g[0].length + 1;
  }
  return x;
}

// ------------------------------------------------------------- chrome logo
const LW = 23; // letter width
const LH = 28; // letter height
const ST = 7; // stroke
const CH = 6; // outer chamfer
const ch = 2; // inner chamfer
const Y1 = 11; // middle bar top (E, S)
const Y2 = 17; // middle bar bottom
const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
const LETTERS = {
  D: { w: LW, add: [[[0, 0], [LW - CH, 0], [LW, CH], [LW, LH - CH], [LW - CH, LH], [0, LH]]],
    sub: [[[ST, ST], [LW - ST - ch, ST], [LW - ST, ST + ch], [LW - ST, LH - ST - ch], [LW - ST - ch, LH - ST], [ST, LH - ST]]] },
  A: { w: LW, add: [[[0, CH], [CH, 0], [LW - CH, 0], [LW, CH], [LW, LH], [LW - ST, LH], [LW - ST, 19], [ST, 19], [ST, LH], [0, LH]]],
    sub: [[[ST + ch, ST], [LW - ST - ch, ST], [LW - ST, ST + ch], [LW - ST, 13], [ST, 13], [ST, ST + ch]]] },
  N: { w: LW, add: [rect(0, 0, ST, LH), rect(LW - ST, 0, LW, LH), [[0, 0], [ST + 1.5, 0], [LW, LH], [LW - ST - 1.5, LH]]],
    sub: [[[0, 0], [3, 0], [0, 3]], [[LW, LH], [LW - 3, LH], [LW, LH - 3]]] },
  C: { w: LW, add: [[[CH, 0], [LW, 0], [LW, ST], [ST + ch, ST], [ST, ST + ch], [ST, LH - ST - ch], [ST + ch, LH - ST], [LW, LH - ST], [LW, LH], [CH, LH], [0, LH - CH], [0, CH]]], sub: [] },
  E: { w: LW, add: [[[CH, 0], [LW, 0], [LW, ST], [ST, ST], [ST, Y1], [LW - 4, Y1], [LW - 4, Y2], [ST, Y2], [ST, LH - ST], [LW, LH - ST], [LW, LH], [CH, LH], [0, LH - CH], [0, CH]]], sub: [] },
  V: { w: LW, add: [[[0, 0], [ST, 0], [ST, 12], [LW / 2, LH - ST - 1], [LW - ST, 12], [LW - ST, 0], [LW, 0], [LW, 14], [LW / 2 + 3.5, LH], [LW / 2 - 3.5, LH], [0, 14]]], sub: [] },
  I: { w: ST, add: [rect(0, 0, ST, LH)], sub: [] },
  S: { w: LW, add: [[[CH, 0], [LW, 0], [LW, ST], [ST, ST], [ST, Y1], [LW - CH, Y1], [LW, Y2], [LW, LH - CH], [LW - CH, LH], [0, LH], [0, LH - ST], [LW - ST, LH - ST], [LW - ST, Y2], [CH, Y2], [0, Y1], [0, CH]]], sub: [] },
  O: { w: LW, add: [[[CH, 0], [LW - CH, 0], [LW, CH], [LW, LH - CH], [LW - CH, LH], [CH, LH], [0, LH - CH], [0, CH]]],
    sub: [[[ST + ch, ST], [LW - ST - ch, ST], [LW - ST, ST + ch], [LW - ST, LH - ST - ch], [LW - ST - ch, LH - ST], [ST + ch, LH - ST], [ST, LH - ST - ch], [ST, ST + ch]]] },
};
function inPoly(px, py, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

const LOGO_TEXT = 'DANCE VISION';
const GAP = 3;
const WORD_GAP = 18; // wide enough that the words never read as one at phone size
const logoWidth = [...LOGO_TEXT].reduce((w, c, i) => w + (c === ' ' ? WORD_GAP - GAP : LETTERS[c].w + (i < LOGO_TEXT.length - 1 ? GAP : 0)), 0);
const LX = Math.round((W - logoWidth - 4) / 2);
const LY = 14;

const face = new Grid(W, H);
const letterBoxes = {};
{
  let x = LX;
  [...LOGO_TEXT].forEach((c, i) => {
    if (c === ' ') { x += WORD_GAP - GAP; return; }
    const L = LETTERS[c];
    (letterBoxes[c] ||= []).push(x);
    for (let yy = 0; yy < LH; yy++) {
      for (let xx = 0; xx < L.w; xx++) {
        const px = xx + 0.5;
        const py = yy + 0.5;
        if (L.add.some((p) => inPoly(px, py, p)) && !L.sub.some((p) => inPoly(px, py, p))) face.set(x + xx, LY + yy);
      }
    }
    x += L.w + GAP;
  });
}
// 3D extrusion down-right, then a black outline around everything.
const extrude = new Grid(W, H);
for (let d = 1; d <= 3; d++) {
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (face.get(x, y) && !face.get(x + d, y + d) && !extrude.get(x + d, y + d)) extrude.set(x + d, y + d, d);
  }
}
const outline = new Grid(W, H);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  if (face.get(x, y) || extrude.get(x, y)) continue;
  let near = false;
  for (let dy = -1; dy <= 1 && !near; dy++) for (let dx = -1; dx <= 1; dx++) if (face.get(x + dx, y + dy) || extrude.get(x + dx, y + dy)) near = true;
  if (near) outline.set(x, y);
}
// A dark halo round the OUTSIDE of each word (counters left alone), so the
// copper bars can't blur DANCE and VISION into one word at phone size.
const HALO = 2; // rings of dark halo outside the black outline
const halo = new Grid(W, H);
{
  const solid = (x, y) => face.get(x, y) || extrude.get(x, y) || outline.get(x, y);
  const outside = new Grid(W, H);
  const stack = [[0, 0]];
  while (stack.length) {
    const [x, y] = stack.pop();
    if (x < 0 || y < 0 || x >= W || y >= H || outside.get(x, y) || solid(x, y)) continue;
    outside.set(x, y);
    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }
  let ring = outline;
  for (let r = 0; r < HALO; r++) {
    const next = new Grid(W, H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      if (!outside.get(x, y) || halo.get(x, y)) continue;
      if (ring.get(x - 1, y) || ring.get(x + 1, y) || ring.get(x, y - 1) || ring.get(x, y + 1)) next.set(x, y);
    }
    for (let i = 0; i < next.a.length; i++) if (next.a[i]) halo.a[i] = 1;
    ring = next;
  }
  // Darken the word space itself, so it reads as a space and not a hyphen of
  // copper stripes between E and V.
  let top = H; let bottom = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (halo.get(x, y)) { top = Math.min(top, y); bottom = Math.max(bottom, y); }
  const x0 = letterBoxes.E[0] + LW;
  const x1 = letterBoxes.V[0];
  for (let y = top; y <= bottom; y++) for (let x = x0; x < x1; x++) if (outside.get(x, y)) halo.set(x, y);
}
const edge = (dx, dy) => cellsToPath((x, y) => face.get(x, y) && !face.get(x + dx, y + dy), W, H);
const CHROME = ramp([
  [0, '#ffffff'], [3, '#d6ecff'], [8, '#84b6f0'], [12, '#3f70c8'], [14, '#1d3c86'], [15, '#0b1640'],
  [16, '#3c2208'], [19, '#8c4e14'], [23, '#e8a030'], [26, '#fff2b0'], [27, '#d09848'],
], LH);

// ---------------------------------------------------------------- starfield
function starLayer(count, yMin, yMax, w = 1) {
  const g = new Grid(W * 2, H);
  for (let i = 0; i < count; i++) {
    const x = Math.floor(rand() * W);
    const y = yMin + Math.floor(rand() * (yMax - yMin));
    if (TEXT_BANDS.some(([a, b]) => y >= a && y <= b)) { i--; continue; }
    for (let k = 0; k < w; k++) { g.set(x + k, y); g.set(x + k + W, y); }
  }
  return gridPath(g);
}
const STARS = [
  { cls: 'st1', color: '#3c3f78', d: starLayer(70, 3, 125), dur: 64 },
  { cls: 'st2', color: '#8088c8', d: starLayer(34, 3, 125), dur: 32 },
  { cls: 'st3', color: '#ffffff', d: starLayer(16, 3, 125, 2), dur: 12 },
];

// ------------------------------------------------------------- copper bars
const COPPER = [
  ['#3a0012', '#80102c', '#c82a3c', '#ff6a5a', '#ffd6c8'],
  ['#3a1800', '#824200', '#c87410', '#ffb030', '#fff2b8'],
  ['#00300c', '#006a22', '#12a842', '#56e074', '#d6ffdc'],
  ['#002a3c', '#00607c', '#10a0c2', '#56e2ff', '#dcf8ff'],
  ['#0c0c44', '#22228e', '#4444d4', '#8888ff', '#e4e4ff'],
  ['#30002e', '#720072', '#b422b4', '#f264f2', '#ffdcff'],
];
const BAR_TOP = 11;
const BAR_TRAVEL = 30;
const BAR_PERIOD = 3.4; // one sweep down and back up
const BAR_STAGGER = 0.2;

// ------------------------------------------------------- stick-figure crew
// Joints relative to the feet (y negative is up). hd = head centre.
const BASE = { hd: [0, -20], nk: [0, -17], hp: [0, -9], eL: [-3, -14], hL: [-4, -10], eR: [3, -14], hR: [4, -10], kL: [-2, -5], fL: [-3, 0], kR: [2, -5], fR: [3, 0] };
const POSES = {
  stand: {},
  up: { eL: [-3, -19], hL: [-5, -23], eR: [3, -19], hR: [5, -23] },
  hips: { eL: [-4, -14], hL: [-2, -10], eR: [4, -14], hR: [2, -10], kL: [-2, -5], fL: [-4, 0], kR: [2, -5], fR: [4, 0] },
  pointR: { hp: [-1, -9], eL: [-3, -13], hL: [-5, -10], eR: [3, -20], hR: [6, -24], kL: [-2, -5], fL: [-3, 0], kR: [1, -4], fR: [3, 0] },
  squat: { hd: [0, -17], nk: [0, -14], hp: [0, -7], eL: [-4, -14], hL: [-8, -14], eR: [4, -14], hR: [8, -14], kL: [-4, -4], fL: [-3, 0], kR: [4, -4], fR: [3, 0] },
  clap: { eL: [-4, -20], hL: [-1, -24], eR: [4, -20], hR: [1, -24] },
  robotA: { eL: [-4, -17], hL: [-4, -21], eR: [4, -17], hR: [4, -13] },
  kickR: { eL: [-4, -16], hL: [-7, -18], eR: [3, -13], hR: [5, -11], kL: [-1, -5], fL: [-1, 0], kR: [4, -10], fR: [7, -6] },
  swayR: { hd: [1, -20], nk: [1, -17], hp: [-1, -9], eL: [-2, -14], hL: [-4, -11], eR: [5, -16], hR: [8, -19], kL: [-2, -5], fL: [-3, 0], kR: [2, -5], fR: [3, 0] },
};
const mirror = (p) => {
  const full = { ...BASE, ...p };
  const m = {};
  for (const [k, [x, y]] of Object.entries(full)) {
    const mk = k.endsWith('L') ? `${k.slice(0, -1)}R` : k.endsWith('R') ? `${k.slice(0, -1)}L` : k;
    m[mk] = [-x, y];
  }
  return m;
};
POSES.pointL = mirror(POSES.pointR);
POSES.robotB = mirror(POSES.robotA);
POSES.kickL = mirror(POSES.kickR);
POSES.swayL = mirror(POSES.swayR);

const SP = 12; // sprite half-width
const SH = 27; // sprite height
function line(g, [x0, y0], [x1, y1]) {
  const dx = Math.abs(x1 - x0); const sx = x0 < x1 ? 1 : -1;
  const dy = -Math.abs(y1 - y0); const sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  for (;;) {
    g.set(x0 + SP, y0 + SH - 1);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) { err += dy; x0 += sx; }
    if (e2 <= dx) { err += dx; y0 += sy; }
  }
}
function drawFigure(poseName) {
  const p = { ...BASE, ...POSES[poseName] };
  const body = new Grid(SP * 2 + 1, SH);
  const joints = new Grid(SP * 2 + 1, SH);
  [['nk', 'hp'], ['nk', 'eL'], ['eL', 'hL'], ['nk', 'eR'], ['eR', 'hR'], ['hp', 'kL'], ['kL', 'fL'], ['hp', 'kR'], ['kR', 'fR']]
    .forEach(([a, b]) => line(body, p[a], p[b]));
  const [hx, hy] = p.hd;
  ['.###.', '#...#', '#...#', '#...#', '.###.'].forEach((row, r) => [...row].forEach((c, k) => { if (c === '#') body.set(hx + SP + k - 2, hy + SH - 1 + r - 2); }));
  for (const k of ['hL', 'hR', 'fL', 'fR', 'eL', 'eR', 'kL', 'kR']) joints.set(p[k][0] + SP, p[k][1] + SH - 1);
  return {
    body: cellsToPath((x, y) => body.get(x, y) && !joints.get(x, y), body.w, body.h, -SP, -(SH - 1)),
    joints: cellsToPath((x, y) => joints.get(x, y), joints.w, joints.h, -SP, -(SH - 1)),
  };
}
const FLOOR_Y = 82;
const BEAT = 0.5; // 120 BPM
const CREW = [
  { x: 34, color: '#54f0ff', joint: '#ffffff', moves: ['up', 'hips', 'up', 'hips'] },
  { x: 76, color: '#ff66e0', joint: '#ffffff', moves: ['pointR', 'pointL', 'pointR', 'pointL'] },
  { x: 118, color: '#ffe45a', joint: '#ffffff', moves: ['squat', 'up', 'squat', 'clap'] },
  { x: 160, color: '#ffffff', joint: '#ffcc33', moves: ['up', 'pointR', 'squat', 'pointL'], lead: true },
  { x: 202, color: '#6cff6c', joint: '#ffffff', moves: ['robotA', 'robotB', 'robotA', 'robotB'] },
  { x: 244, color: '#ffa040', joint: '#ffffff', moves: ['kickR', 'stand', 'kickL', 'stand'] },
  // Always half a beat late. Every crew has one.
  { x: 286, color: '#b48cff', joint: '#ffffff', moves: ['swayL', 'swayR', 'swayL', 'clap'], late: BEAT / 2 },
];
const SPOT_ORDER = [3, 5, 1, 6, 2, 0, 4];
const SPOT_HOLD = 1.7;
const SPOT_MOVE = 0.5;

// ------------------------------------------------------------ sine scroller
const SCROLL = [
  'NO VIDEO LEAVES THE PHONE: JUST JOINTS! ',
  '      YO HACKNEY! THE JOINT VENTURE PROUDLY PRESENTS ... DANCE VISION!  ^ ^ ^  ',
  'YOUR PHONE IS THE MOCAP RIG, YOUR TELLY IS THE DANCE FLOOR.  ',
  'SCAN THE QR, PROP THE PHONE AGAINST THE TELLY AND BOOM: YOU ARE A STICK FIGURE ON TV.  ',
  "NO APP. NO ACCOUNT. THE POSE MODEL RUNS IN THE PHONE'S BROWSER AND ONLY 33 JOINTS (X,Y,Z) ",
  'GO DOWN THE WEBSOCKET, ABOUT 1.6 KB A FRAME. THE ONLY JOINTS WE PASS AROUND, OFFICER.  ',
  'WHAT HAPPENS ON THE PHONE STAYS ON THE PHONE.  ',
  'UP TO SIX PHONES, A BACKING CREW AND SIX EAST LONDON VENUES: BIG SCREEN ENERGY, MAIN CHARACTER SYNDROME, ',
  'GENTRIFRIED CHICKEN, MIND THE GYRATE, OUR LADY OF PERPETUAL SQUATS AND HOSTILE TWERKOVER.  ',
  'EVERY MINUTE OR SO A COUNTDOWN NAMES A DANCER, THEN THEY GET THE CAMERA, A SPIN AND A CHEERING CREW. ',
  'NOWHERE TO HIDE, BRUV.  ',
  'YOUTUBE DANCE VIDEOS GET MAPPED INTO CHOREOGRAPHY, SO THE CREW NICKS THE MOVES STRAIGHT OFF THE TELLY.  ',
  'NPM RUN PARTY -> 127.0.0.1:8787 -> GET ON THE FLOOR.  ',
  'BIG SHOUT TO THE PURPLE ONE ON THE RIGHT: HALF A BEAT LATE SINCE 2021.  ',
  'GREETZ: DALSTON DISCO DIVISION * KINGSLAND ROAD KNEE POPPERS * HOMERTON HIP ENGINEERS * ',
  'EVERYONE STILL WAITING FOR THE OVERGROUND * WHOEVER DID THE WORM IN THE CHICKEN SHOP AT 3AM.  ',
  "PROTECTION: NONE. DIGNITY: ALSO NONE.  $ $ $  LET'S WRAP ...        ",
].join('');
const SPEED = 80; // px per second
const WAVE = 160; // wavelength in px
const AMP = 9;
const SCROLL_Y = 95; // glyph top at rest
const PHASES = WAVE / 8;
const PERIOD = WAVE / SPEED; // bob period (s)
const scrollChars = [...SCROLL];
while (scrollChars.length % PHASES) scrollChars.push(' ');
const SCROLL_LEN = scrollChars.length * 8;
const SCROLL_T = SCROLL_LEN / SPEED;
const SCROLL_X0 = 4;

const SCROLL_COLORS = ['#ffffff', '#fff6b0', '#ffe066', '#ffbe30', '#ff8e22', '#ff5a3a', '#e8347a', '#a8249a'];

// ---------------------------------------------------------------- assemble
const css = [];
const defs = [];
const body = [];

css.push(
  '.st1{animation:sx 64s linear infinite}.st2{animation:sx 32s linear infinite}.st3{animation:sx 12s linear infinite}',
  `@keyframes sx{from{transform:translateX(0)}to{transform:translateX(-${W}px)}}`,
  `.cb{animation:cb ${BAR_PERIOD / 2}s cubic-bezier(.37,0,.63,1) infinite alternate}`,
  `@keyframes cb{from{transform:translateY(0)}to{transform:translateY(${BAR_TRAVEL}px)}}`,
  '.rb{animation:rb 1.6s linear infinite}@keyframes rb{from{transform:translateX(0)}to{transform:translateX(-64px)}}',
  '.shine{animation:shine 6s linear infinite}',
  `@keyframes shine{0%{transform:translateX(${LX - 30}px)}22%{transform:translateX(${LX + logoWidth + 20}px)}100%{transform:translateX(${LX + logoWidth + 20}px)}}`,
  '.spk{transform-box:fill-box;transform-origin:center;opacity:0;animation:spk 4.8s ease-in-out infinite}',
  '@keyframes spk{0%,100%{opacity:0;transform:scale(.2)}6%{opacity:1;transform:scale(1)}13%{opacity:0;transform:scale(.2)}}',
  `.fr{animation:fr ${BEAT * 4}s step-end infinite}.f1,.f2,.f3{opacity:0}`,
  '@keyframes fr{0%{opacity:1}25%{opacity:0}100%{opacity:0}}',
  `.bob{animation:bob ${BEAT}s cubic-bezier(.37,0,.63,1) infinite}`,
  '@keyframes bob{0%,100%{transform:translateY(1px)}50%{transform:translateY(-1px)}}',
  `.scr{animation:scr ${n(SCROLL_T)}s linear infinite}`,
  `@keyframes scr{from{transform:translateX(0)}to{transform:translateX(-${SCROLL_LEN}px)}}`,
  `@keyframes sw{from{transform:translateY(${-AMP}px)}to{transform:translateY(${AMP}px)}}`,
);

// panel
defs.push(`<clipPath id="panel"><rect width="${W}" height="${H}" rx="6"/></clipPath>`);
body.push(`<rect width="${W}" height="${H}" fill="#07040f"/>`);

// stars
STARS.forEach((s) => body.push(`<path class="${s.cls}" fill="${s.color}" d="${s.d}"/>`));

// copper bars (drawn last-first so bar 0 leads on top)
const barPaths = COPPER.map((rampC) => {
  const rows = [0, 1, 2, 3, 4, 3, 2, 1, 0];
  const byColor = new Map();
  rows.forEach((ri, y) => { const c = rampC[ri]; byColor.set(c, (byColor.get(c) || '') + `M0 ${BAR_TOP + y}h${W}v1h-${W}z`); });
  return [...byColor].map(([c, d]) => `<path fill="${c}" d="${d}"/>`).join('');
});
[...barPaths.keys()].reverse().forEach((i) => {
  const still = Math.round(BAR_TRAVEL * (0.5 - 0.5 * Math.cos(Math.PI * i / (COPPER.length - 1))));
  body.push(`<g class="cb" style="animation-delay:${n(-i * BAR_STAGGER)}s" transform="translate(0 ${still})">${barPaths[i]}</g>`);
});

// color-cycling raster lines
const HUES = ['#ff2a55', '#ff5a2a', '#ff9a1a', '#ffd21a', '#d6ff2a', '#6aff3a', '#2aff9a', '#1affe0', '#1ac8ff', '#2a86ff', '#4a4aff', '#8a3aff', '#c82aff', '#ff2ae0', '#ff2aa8', '#ff2a78'];
{
  const rows = [2, FLOOR_Y, 125];
  const paths = HUES.map((c, h) => {
    let d = '';
    for (let m = 0; m < 7; m++) for (const y of rows) d += `M${h * 4 + m * 64} ${y}h4v1h-4z`;
    return `<path fill="${c}" d="${d}"/>`;
  }).join('');
  defs.push(`<clipPath id="rbclip">${rows.map((y) => `<rect x="${y === FLOOR_Y ? 0 : 8}" y="${y}" width="${y === FLOOR_Y ? W : W - 16}" height="1"/>`).join('')}</clipPath>`);
  body.push(`<g clip-path="url(#rbclip)"><g class="rb">${paths}</g></g>`);
}

// tiny text lines
{
  const top = new Grid(W, H);
  const presents = '-=*  THE JOINT VENTURE PRESENTS  *=-';
  drawTiny(top, presents, Math.round((W - tinyWidth(presents)) / 2), PRESENTS_Y);
  body.push(`<path class="aa" fill="#8c8cff" d="${gridPath(top)}"/>`);
  const subA = 'YOUR PHONE IS THE MOCAP RIG';
  const subB = 'YOUR TELLY IS THE DANCE FLOOR';
  const total = tinyWidth(subA) + 13 + tinyWidth(subB);
  const x0 = Math.round((W - total) / 2);
  const sa = new Grid(W, H); const sb = new Grid(W, H); const sm = new Grid(W, H);
  drawTiny(sa, subA, x0, SUB_Y);
  drawTiny(sm, '*', x0 + tinyWidth(subA) + 5, SUB_Y);
  drawTiny(sb, subB, x0 + tinyWidth(subA) + 13, SUB_Y);
  body.push(`<g class="aa"><path fill="#7fe8ff" d="${gridPath(sa)}"/><path fill="#ff70d0" d="${gridPath(sm)}"/><path fill="#ffe070" d="${gridPath(sb)}"/></g>`);

  // bottom status bar: the quick start, flanked by tracker VU meters
  const parts = [['NPM RUN PARTY', '#ffffff'], ['  ->  ', '#ff70d0'], ['HTTP://127.0.0.1:8787', '#7fe8ff']];
  const qw = tinyWidth(parts.map((p) => p[0]).join(''));
  let qx = Math.round((W - qw) / 2);
  const left = qx;
  for (const [s, c] of parts) {
    const g = new Grid(W, H);
    const end = drawTiny(g, s, qx, STATUS_Y);
    body.push(`<path class="aa" fill="${c}" d="${gridPath(g)}"/>`);
    qx = end;
  }
  const right = left + qw;
  const VU_ROWS = ['#ff3a4a', '#ffa030', '#ffe040', '#8aff5a', '#34d84a'];
  const VU_PATTERNS = ['53425342', '42515324', '35243152', '52315432'];
  VU_PATTERNS.forEach((pat, i) => {
    const frames = [...pat].map((lv, k) => `${n((k / pat.length) * 100)}%{transform:scaleY(${n(Number(lv) / 5)})}`).join('');
    css.push(`@keyframes vu${i}{${frames}100%{transform:scaleY(${n(Number(pat[0]) / 5)})}}.vu${i}{transform-box:fill-box;transform-origin:50% 100%;animation:vu${i} ${BEAT * 2}s step-end infinite}`);
    const bar = VU_ROWS.map((c, r) => `<path fill="${c}" d="M0 ${r}h3v1h-3z"/>`).join('');
    for (const x of [left - 9 - i * 5, right + 6 + i * 5]) body.push(`<g transform="translate(${x} ${STATUS_Y})"><g class="vu${i}">${bar}</g></g>`);
  });
}

// logo
defs.push(rowGradient('chrome', LY, CHROME));
defs.push(`<path id="face" d="${gridPath(face)}"/>`);
defs.push(`<clipPath id="faceclip"><use href="#face"/></clipPath>`);
if (HALO) body.push(`<path fill="#07040f" fill-opacity=".85" d="${gridPath(halo)}"/>`);
body.push(`<path fill="#000000" d="${gridPath(outline)}"/>`);
[['#7a46c0', 1], ['#4e2690', 2], ['#2a1060', 3]].forEach(([c, d]) => body.push(`<path fill="${c}" d="${gridPath(extrude, (v) => v === d)}"/>`));
body.push('<use href="#face" fill="url(#chrome)"/>');
body.push(`<path fill="#ffffff" fill-opacity=".45" d="${edge(-1, 0)}"/>`);
body.push(`<path fill="#ffffff" fill-opacity=".8" d="${edge(0, -1)}"/>`);
body.push(`<path fill="#000000" fill-opacity=".35" d="${edge(1, 0)}"/>`);
body.push(`<path fill="#000000" fill-opacity=".4" d="${edge(0, 1)}"/>`);
body.push(`<g clip-path="url(#faceclip)"><path class="shine" fill="#ffffff" fill-opacity=".7" shape-rendering="auto" d="M0 ${LY}h7l-12 ${LH}h-7zM11 ${LY}h3l-12 ${LH}h-3z"/></g>`);
{
  const sparkle = 'M2 0h1v2h2v1h-2v2h-1v-2h-2v-1h2z';
  const xs = letterBoxes;
  const spots = [[xs.D[0] + 1, LY - 2], [xs.E[0] + LW - 3, LY - 2], [xs.O[0] + LW - 6, LY - 2], [xs.N[1] + LW - 3, LY + LH - 3], [xs.A[0] + 3, LY + LH - 4]];
  spots.forEach(([x, y], i) => body.push(`<g transform="translate(${x - 2} ${y - 2})"><path class="spk" style="animation-delay:${n(i * 0.96)}s" fill="#ffffff" d="${sparkle}"/></g>`));
}

// spotlight + crew
{
  const holds = SPOT_ORDER.map((i) => CREW[i].x - W / 2);
  const per = SPOT_HOLD + SPOT_MOVE;
  const total = per * holds.length;
  const frames = [];
  holds.forEach((x, k) => {
    frames.push(`${n((k * per) / total * 100)}%{transform:translateX(${x}px)}`);
    frames.push(`${n(((k * per + SPOT_HOLD) / total) * 100)}%{transform:translateX(${x}px)}`);
  });
  frames.push(`100%{transform:translateX(${holds[0]}px)}`);
  css.push(`.spot{animation:spot ${n(total)}s cubic-bezier(.45,0,.55,1) infinite}@keyframes spot{${frames.join('')}}`);
  defs.push('<linearGradient id="beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff6d0" stop-opacity="0"/><stop offset="1" stop-color="#fff6d0" stop-opacity=".26"/></linearGradient>');
  defs.push('<radialGradient id="pool"><stop offset="0" stop-color="#fff6d0" stop-opacity=".5"/><stop offset="1" stop-color="#fff6d0" stop-opacity="0"/></radialGradient>');
  body.push(`<g class="spot" transform="translate(${holds[0]} 0)" shape-rendering="auto"><path fill="url(#beam)" d="M${W / 2 - 3} 57h6l9 ${FLOOR_Y - 57}h-24z"/><ellipse cx="${W / 2}" cy="${FLOOR_Y}" rx="14" ry="2.5" fill="url(#pool)"/></g>`);

  const frameCss = new Set();
  CREW.forEach((d) => {
    const lift = d.lead ? 2 : 0;
    const feet = FLOOR_Y - lift;
    if (d.lead) body.push(`<path fill="#3a3a5a" d="M${d.x - 10} ${feet}h21v${lift}h-21z"/><path fill="#8a8ac0" d="M${d.x - 10} ${feet}h21v1h-21z"/>`);
    const late = d.late || 0;
    const frames = d.moves.map((m, k) => {
      const f = drawFigure(m);
      const delay = n(k * BEAT - BEAT * 4 + late);
      frameCss.add(delay);
      return `<g class="fr f${k}" style="animation-delay:${delay}s"><path fill="${d.color}" d="${f.body}"/><path fill="${d.joint}" d="${f.joints}"/></g>`;
    }).join('');
    body.push(`<g class="aa" transform="translate(${d.x} ${feet})"><g class="bob"${late ? ` style="animation-delay:${n(late - BEAT)}s"` : ''}>${frames}</g></g>`);
  });
}

// scroller
{
  defs.push(rowGradient('sg', 0, SCROLL_COLORS));
  const used = new Set(scrollChars.filter((c) => c !== ' '));
  for (const c of used) {
    const g = F8[c];
    if (!g) throw new Error(`scroll font lacks ${JSON.stringify(c)}`);
    const on = (x, y) => (g[y] || '')[x] === '#';
    const shadow = cellsToPath((x, y) => on(x - 1, y - 1) && !on(x, y), 9, 9);
    defs.push(`<g id="c${c.charCodeAt(0)}"><path fill="#3a1470" d="${shadow}"/><path fill="url(#sg)" d="${cellsToPath(on, 8, 8)}"/></g>`);
  }
  const groups = Array.from({ length: PHASES }, () => []);
  const place = (c, i, x) => { if (c !== ' ') groups[i % PHASES].push(`<use href="#c${c.charCodeAt(0)}" x="${x}"/>`); };
  scrollChars.forEach((c, i) => place(c, i, SCROLL_X0 + i * 8));
  const tail = Math.ceil(W / 8) + 1;
  for (let i = 0; i < tail; i++) place(scrollChars[i], i + scrollChars.length, SCROLL_X0 + SCROLL_LEN + i * 8);
  const g = groups.map((uses, j) => {
    const x0 = SCROLL_X0 + j * 8 + 4; // glyph centre
    const d = PERIOD * (((x0 / WAVE + 0.25) % 1 + 1) % 1) - PERIOD;
    return `<g style="animation:sw ${n(PERIOD / 2)}s cubic-bezier(.37,0,.63,1) ${n(d)}s infinite alternate">${uses.join('')}</g>`;
  }).join('');
  body.push(`<g class="aa" transform="translate(0 ${SCROLL_Y})"><g class="scr">${g}</g></g>`);
  // soft edges so glyphs slide in and out of the dark
  defs.push('<linearGradient id="fadeL"><stop offset="0" stop-color="#07040f"/><stop offset="1" stop-color="#07040f" stop-opacity="0"/></linearGradient>');
  defs.push('<linearGradient id="fadeR"><stop offset="0" stop-color="#07040f" stop-opacity="0"/><stop offset="1" stop-color="#07040f"/></linearGradient>');
  body.push(`<rect y="83" width="6" height="32" fill="url(#fadeL)"/><rect x="${W - 6}" y="83" width="6" height="32" fill="url(#fadeR)"/>`);
}

css.push('.aa{shape-rendering:geometricPrecision}');
css.push('@media (prefers-reduced-motion:reduce){*{animation:none!important}.spk{opacity:0}}');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W * 3}" height="${H * 3}" shape-rendering="crispEdges" role="img" aria-labelledby="t">
<title id="t">Dance Vision: an Amiga-style cracktro with a chrome logo, copper bars, a stick-figure crew and a sine scroller</title>
<style>${css.join('')}</style>
<defs>${defs.join('')}</defs>
<g clip-path="url(#panel)">${body.join('\n')}</g>
</svg>
`;
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, svg);
console.log(`wrote ${path.relative(process.cwd(), OUT)} (${(svg.length / 1024).toFixed(1)} KB), scroll ${scrollChars.length} chars, loop ${n(SCROLL_T)}s`);

// ------------------------------------------------ closing copper rule SVG
// A thin colour-cycling copper bar that closes the header section.
{
  const RULE = OUT.replace(/\.svg$/, '-rule.svg');
  const shade = (hex, k) => lerpHex('#000000', hex, k);
  const levels = [0.35, 1, 0.7, 0.3];
  const paths = HUES.map((c, h) => levels.map((k, y) => {
    let d = '';
    for (let m = 0; m < 7; m++) d += `M${h * 4 + m * 64} ${y}h4v1h-4z`;
    return `<path fill="${shade(c, k)}" d="${d}"/>`;
  }).join('')).join('');
  const rule = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${levels.length}" width="${W * 3}" height="${levels.length * 3}" shape-rendering="crispEdges" role="img" aria-labelledby="t">
<title id="t">A colour-cycling copper bar</title>
<style>.rb{animation:rb 1.6s linear infinite}@keyframes rb{from{transform:translateX(0)}to{transform:translateX(-64px)}}@media (prefers-reduced-motion:reduce){.rb{animation:none}}</style>
<defs><clipPath id="c"><rect width="${W}" height="${levels.length}" rx="1.5"/></clipPath></defs>
<g clip-path="url(#c)"><g class="rb">${paths}</g></g>
</svg>
`;
  fs.writeFileSync(RULE, rule);
  console.log(`wrote ${path.relative(process.cwd(), RULE)} (${(rule.length / 1024).toFixed(1)} KB)`);
}
