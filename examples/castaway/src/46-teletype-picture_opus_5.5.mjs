// Teletype picture header for the Castaway README (catalogue style nfo-11: teletype,
// line-printer and typewriter pictures).
// Plain Node, no dependencies, deterministic (seeded PRNG, no clock). Run:
//   node examples/castaway/src/46-teletype-picture_opus_5.5.mjs        (add --debug for tables)
// It rewrites, relative to this file:
//   ../46-teletype-picture_opus_5.5.md            the header itself (markdown + HTML)
//   ../assets/46-teletype-picture_opus_5.5.svg    the teletype picture, being typed (animated)
// Edit this file, not those.
//
// The style. Before home computers, radio amateurs typed pictures to each other over
// radioteletype: capitals, digits and a little punctuation only (5-bit code, no lowercase),
// tone made from letter weight, edges finished in punctuation, and the darkest parts struck
// twice, the second pass sent after a bare carriage return so the ink piles up. Here the
// whole sheet is made that way: a transmission header, the name CASTAWAY left as bare paper
// in a solid ground of overstruck M and W, a typed telegram line, a tonal picture of the island
// and a sign-off. The only second colour is a red ribbon half, used for her coral top.
//
// Everything is drawn from scratch: the stroke typeface below, the scene (painted as a
// grey-level function, then transcribed to letters by a converter that matches each cell's
// tone and shape against the typeface), her figure (too small for the converter, so typed by
// hand, character by character) and the little typing head. No real picture, station,
// call sign or machine is copied. TOP FROND RELAY, the sending station, is invented.
//
// How it is built. Every glyph is a <pattern> one cell wide; every glyph's cells are merged into
// horizontal runs, and each run is a rectangle filled with that pattern, so a 100-column page
// costs a few thousand tiny rectangles, not ten thousand glyph copies. Pass 2 (the overstrike)
// is the same thing nudged by half a pixel. Ink density varies by row through a static mask.
//
// How the animation works (one loop, LOOP seconds, all CSS step keyframes):
//   hold   the finished sheet sits still with the typing head parked under it (t = 0, so the
//          first frame a visitor sees is the whole picture, name included);
//   feed   the paper advances: the sheet steps up and out of view, blank paper follows;
//   print  the sheet is typed again from the top, one pass per slot: each line is struck once,
//          and if it has dark cells the head returns and strikes it again, a moment later.
// Each print pass is revealed by a mask: a rectangle covering the finished rows plus a
// rectangle sweeping the current row in column steps. Rows change at 2% into a slot, while the
// sweep is at column 0; finished rows are committed at 92%, while the sweep is at full width,
// so no frame ever shows a gap. The loop ends exactly in the state it began in.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '46-teletype-picture_opus_5.5';
const OUT_MD = path.resolve(HERE, '..', `${SLUG}.md`);
const OUT_SVG = path.resolve(HERE, '..', 'assets', `${SLUG}.svg`);
const SVG_REF = `assets/${SLUG}.svg`;
const DEBUG = process.argv.includes('--debug');

// ------------------------------------------------------------------ helpers
const f1 = (n) => String(Math.round(n * 10) / 10);
const f2 = (n) => String(Math.round(n * 100) / 100);
const f3 = (n) => String(Math.round(n * 1000) / 1000);
const f4 = (n) => String(Math.round(n * 10000) / 10000);
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
function mulberry32(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
// a stable 0..1 hash of two integers (for per-cell decisions that must not depend on order)
function hash2(a, b) {
  let h = Math.imul(a | 0, 374761393) ^ Math.imul(b | 0, 668265263) ^ 0x5bd1e995;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

// ------------------------------------------------------------------ the page grid
const COLS = 100;            // a wide carriage: 100 columns
const CW = 8.8;              // cell width  (10 characters to the inch, scaled)
const CH = 14;               // cell height (6 lines to the inch: a tall cell, as on the machine)
const VB_W = 1000;
const X0 = (VB_W - COLS * CW) / 2;   // left edge of column 0
const Y0 = 20;                       // top edge of row 0

// ------------------------------------------------------------------ the typeface
// A teletype-style gothic: capitals, digits and the punctuation a 5-bit machine had. Each glyph
// is polylines on a 4 x 6 grid (u right, v down, baseline v = 6), drawn with a round-capped pen.
// A one-point polyline is a full stop.
const GX0 = 1.4, GU = 1.5, GY0 = 2.0, GV = 1.6, SW = 1.32;
const O_ = [[1, 0], [3, 0], [4, 1], [4, 5], [3, 6], [1, 6], [0, 5], [0, 1], [1, 0]];
const FONT = {
  A: [[[0, 6], [2, 0], [4, 6]], [[0.75, 3.9], [3.25, 3.9]]],
  B: [[[0, 3], [0, 0], [2.8, 0], [3.7, 0.8], [3.7, 2.2], [2.8, 3], [0, 3], [0, 6], [3, 6], [4, 5.1], [4, 3.9], [3, 3]]],
  C: [[[4, 1], [3, 0], [1, 0], [0, 1], [0, 5], [1, 6], [3, 6], [4, 5]]],
  D: [[[0, 0], [0, 6], [2.4, 6], [4, 4.4], [4, 1.6], [2.4, 0], [0, 0]]],
  E: [[[4, 0], [0, 0], [0, 6], [4, 6]], [[0, 3], [3, 3]]],
  F: [[[4, 0], [0, 0], [0, 6]], [[0, 3], [3, 3]]],
  G: [[[4, 1], [3, 0], [1, 0], [0, 1], [0, 5], [1, 6], [3, 6], [4, 5], [4, 3.4], [2.2, 3.4]]],
  H: [[[0, 0], [0, 6]], [[4, 0], [4, 6]], [[0, 3], [4, 3]]],
  I: [[[2, 0], [2, 6]], [[1, 0], [3, 0]], [[1, 6], [3, 6]]],
  J: [[[2.4, 0], [4, 0], [4, 5], [3, 6], [1, 6], [0, 5]]],
  K: [[[0, 0], [0, 6]], [[4, 0], [0, 3.8]], [[1.4, 2.5], [4, 6]]],
  L: [[[0, 0], [0, 6], [4, 6]]],
  M: [[[0, 6], [0, 0], [2, 3.6], [4, 0], [4, 6]]],
  N: [[[0, 6], [0, 0], [4, 6], [4, 0]]],
  O: [O_],
  P: [[[0, 6], [0, 0], [3, 0], [4, 1], [4, 2.2], [3, 3.2], [0, 3.2]]],
  Q: [O_, [[2.4, 4.4], [4.2, 6.4]]],
  R: [[[0, 6], [0, 0], [3, 0], [4, 1], [4, 2.2], [3, 3.2], [0, 3.2]], [[2, 3.2], [4, 6]]],
  S: [[[4, 1], [3, 0], [1, 0], [0, 1], [0, 2], [1, 3], [3, 3], [4, 4], [4, 5], [3, 6], [1, 6], [0, 5]]],
  T: [[[0, 0], [4, 0]], [[2, 0], [2, 6]]],
  U: [[[0, 0], [0, 5], [1, 6], [3, 6], [4, 5], [4, 0]]],
  V: [[[0, 0], [2, 6], [4, 0]]],
  W: [[[0, 0], [1, 6], [2, 2.4], [3, 6], [4, 0]]],
  X: [[[0, 0], [4, 6]], [[4, 0], [0, 6]]],
  Y: [[[0, 0], [2, 3], [4, 0]], [[2, 3], [2, 6]]],
  Z: [[[0, 0], [4, 0], [0, 6], [4, 6]]],
  0: [[[1.3, 0], [2.7, 0], [3.6, 1], [3.6, 5], [2.7, 6], [1.3, 6], [0.4, 5], [0.4, 1], [1.3, 0]]],
  1: [[[1, 1.1], [2, 0], [2, 6]], [[1, 6], [3, 6]]],
  2: [[[0, 1], [1, 0], [3, 0], [4, 1], [4, 2.1], [0, 6], [4, 6]]],
  3: [[[0, 0], [4, 0], [2, 2.5], [3, 2.5], [4, 3.5], [4, 5], [3, 6], [1, 6], [0, 5]]],
  4: [[[3, 6], [3, 0], [0, 4], [4, 4]]],
  5: [[[4, 0], [0, 0], [0, 2.6], [3, 2.6], [4, 3.6], [4, 5], [3, 6], [1, 6], [0, 5]]],
  6: [[[3.4, 0], [2, 0], [0, 2], [0, 5], [1, 6], [3, 6], [4, 5], [4, 3.7], [3, 2.8], [1, 2.8], [0, 3.7]]],
  7: [[[0, 0], [4, 0], [1.4, 6]]],
  8: [[[1, 3], [0, 2], [0, 1], [1, 0], [3, 0], [4, 1], [4, 2], [3, 3], [1, 3], [0, 4], [0, 5], [1, 6], [3, 6], [4, 5], [4, 4], [3, 3]]],
  9: [[[0.6, 6], [2, 6], [4, 4], [4, 1], [3, 0], [1, 0], [0, 1], [0, 2.3], [1, 3.2], [3, 3.2], [4, 2.3]]],
  '.': [[[2, 5.9]]],
  ',': [[[2.1, 5.7], [2.1, 6.1], [1.4, 7]]],
  "'": [[[2, 0], [2, 1.7]]],
  '"': [[[1.2, 0], [1.2, 1.7]], [[2.8, 0], [2.8, 1.7]]],
  ':': [[[2, 2.2]], [[2, 5.9]]],
  ';': [[[2, 2.2]], [[2.1, 5.7], [2.1, 6.1], [1.4, 7]]],
  '-': [[[0.6, 3.3], [3.4, 3.3]]],
  '=': [[[0.3, 2.3], [3.7, 2.3]], [[0.3, 4.4], [3.7, 4.4]]],
  '+': [[[0.3, 3.3], [3.7, 3.3]], [[2, 1.6], [2, 5]]],
  '(': [[[2.9, -0.3], [1.6, 1.2], [1.1, 3], [1.6, 4.8], [2.9, 6.3]]],
  ')': [[[1.1, -0.3], [2.4, 1.2], [2.9, 3], [2.4, 4.8], [1.1, 6.3]]],
  '/': [[[3.7, -0.3], [0.3, 6.3]]],
  '?': [[[0, 1], [1, 0], [3, 0], [4, 1], [4, 2], [2, 3.4], [2, 4.3]], [[2, 5.9]]],
  '!': [[[2, 0], [2, 4.3]], [[2, 5.9]]],
  '#': [[[1.3, 0.3], [1.1, 5.7]], [[2.9, 0.3], [2.7, 5.7]], [[0, 2], [4, 2]], [[0, 4], [4, 4]]],
  '$': [[[4, 1], [3, 0], [1, 0], [0, 1], [0, 2], [1, 3], [3, 3], [4, 4], [4, 5], [3, 6], [1, 6], [0, 5]], [[2, -0.7], [2, 6.7]]],
  '&': [[[4, 6], [1, 2.2], [1, 0.8], [1.8, 0], [2.6, 0.8], [2.6, 1.8], [0, 4], [0, 5.2], [1, 6], [2.4, 6], [4, 3.6]]],
};
// glyph geometry in cell pixels
const GLYPH = {};
for (const [ch, lines] of Object.entries(FONT)) {
  GLYPH[ch] = lines.map((pl) => pl.map(([u, v]) => [GX0 + u * GU, GY0 + v * GV]));
}
// SVG path data for a glyph, in cell pixels, relative to the cell's top-left corner
function glyphD(ch, dx = 0, dy = 0) {
  let d = '';
  for (const pl of GLYPH[ch]) {
    if (pl.length === 1) { d += `M${f2(pl[0][0] + dx)} ${f2(pl[0][1] + dy)}h.01`; continue; }
    d += `M${f2(pl[0][0] + dx)} ${f2(pl[0][1] + dy)}`;
    for (let i = 1; i < pl.length; i++) d += `L${f2(pl[i][0] + dx)} ${f2(pl[i][1] + dy)}`;
  }
  return d;
}

// ------------------------------------------------------------------ coverage of each glyph
// Each cell is measured on an SX x SY grid of sub-cells (5 x 5 test points each): how much of
// that sub-cell the pen covers. Overstruck pairs are measured as the union, second strike
// nudged by the misregistration. Blurred copies are what the converter compares.
const SX = 4, SY = 6, SUB = SX * SY;
const MIS = [0.5, 0.38];   // pass-2 misregistration in pixels
function segDist2(px, py, ax, ay, bx, by) {
  const vx = bx - ax, vy = by - ay;
  const l2 = vx * vx + vy * vy;
  let t = l2 ? ((px - ax) * vx + (py - ay) * vy) / l2 : 0;
  t = clamp(t, 0, 1);
  const dx = px - (ax + t * vx), dy = py - (ay + t * vy);
  return dx * dx + dy * dy;
}
function segsOf(ch, ox = 0, oy = 0) {
  const out = [];
  for (const pl of GLYPH[ch]) {
    if (pl.length === 1) { out.push([pl[0][0] + ox, pl[0][1] + oy, pl[0][0] + ox + 0.01, pl[0][1] + oy]); continue; }
    for (let i = 1; i < pl.length; i++) out.push([pl[i - 1][0] + ox, pl[i - 1][1] + oy, pl[i][0] + ox, pl[i][1] + oy]);
  }
  return out;
}
function coverage(segs) {
  const r2 = (SW / 2) * (SW / 2);
  const cov = new Float64Array(SUB);
  const sw = CW / SX, sh = CH / SY;
  for (let j = 0; j < SY; j++) for (let i = 0; i < SX; i++) {
    let n = 0;
    for (let b = 0; b < 5; b++) for (let a = 0; a < 5; a++) {
      const px = (i + (a + 0.5) / 5) * sw, py = (j + (b + 0.5) / 5) * sh;
      for (const s of segs) if (segDist2(px, py, s[0], s[1], s[2], s[3]) <= r2) { n++; break; }
    }
    cov[j * SX + i] = n / 25;
  }
  return cov;
}
function blur(v) {
  const o = new Float64Array(SUB);
  for (let j = 0; j < SY; j++) for (let i = 0; i < SX; i++) {
    let s = 0, w = 0;
    for (let b = -1; b <= 1; b++) for (let a = -1; a <= 1; a++) {
      const ii = i + a, jj = j + b;
      if (ii < 0 || jj < 0 || ii >= SX || jj >= SY) continue;
      const k = a === 0 && b === 0 ? 2 : 1;
      s += v[jj * SX + ii] * k; w += k;
    }
    o[j * SX + i] = s / w;
  }
  return o;
}
const mean = (v) => { let s = 0; for (const x of v) s += x; return s / v.length; };
const SPEC = {};   // spec ('M' or 'MW' = M struck, then W over it) -> { a, b, cov, bl, m }
function spec(s) {
  if (SPEC[s]) return SPEC[s];
  const a = s[0], b = s.length > 1 ? s[1] : null;
  const segs = a === ' ' ? [] : segsOf(a);
  if (b) segs.push(...segsOf(b, MIS[0], MIS[1]));
  const cov = coverage(segs);
  return (SPEC[s] = { s, a, b, cov, bl: blur(cov), m: mean(cov) });
}

// ------------------------------------------------------------------ tone ramps
// Flat areas are typed as fields from a ramp (ordered-dithered between neighbours), the way
// the old pictures were: a field of one letter, heavier letters for darker ground. Each part of
// the scene has its own family so sky, sea, sand, leaves and wood each get their own texture.
const RAMPS = {
  sky: [' ', '.', ':', '-', '='],
  sea: [' ', '-', '=', 'Z', 'W', 'W=', 'WZ', 'MW'],
  shallow: [' ', '-', '=', 'Z', 'W'],
  sand: [' ', '.', ',', ':', ';'],
  skin: [' ', ':', '=', 'C', 'O'],
  leaf: [' ', '/', 'K', 'X', 'XK', 'X#', '#M'],
  line: [' ', '-', '=', 'O', 'H', 'HI', 'MW'],
  dark: [' ', 'I', 'H', 'N', 'M', 'HI', 'MI', 'MW', 'M#'],
  red: [' ', '=', 'O', 'X', 'H', 'XO', 'MW'],
  band: [' ', ':', 'I', 'H', 'M', 'HI', 'MI', 'MW'],
  hair: [' ', 'O', 'H', 'M', 'MW', 'M#'],
};
// glyphs the converter may use where a cell straddles an edge (shape matters more than tone)
const EDGE = [' ', '.', ',', "'", ':', ';', '-', '=', '(', ')', '/', 'I', 'L', 'J', 'T', 'V', 'Y', 'N', 'Z', '7', 'O', 'C', 'D', '((', '))', '//', '=-'];
const MAXC = 0.6;            // ink coverage that scene tone 1.0 maps to
const FLAT = 0.2;            // a cell whose tones span less than this is typed from the ramp
let rampCov = {};
function rampOf(fam) {
  if (rampCov[fam]) return rampCov[fam];
  const list = RAMPS[fam].map(spec).sort((p, q) => p.m - q.m);
  return (rampCov[fam] = list);
}
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);
// how a family chooses between two neighbouring ramp letters: the sea in wave-shaped runs,
// sand as a random stipple, everything else on an ordered 4 x 4 pattern
function dither(fam, c, r) {
  if (fam === 'sea' || fam === 'shallow') return 0.5 + 0.46 * Math.sin(c * 0.52 + r * 1.9 + 1.4 * Math.sin(c * 0.13 + r * 0.7));
  if (fam === 'sand') return hash2(c * 3 + 1, r * 5 + 2);
  if (fam === 'sky') return 0.5;   // no dither: each row a band of one letter, like a typed gradient
  return BAYER[(r % 4) * 4 + (c % 4)];
}

// ------------------------------------------------------------------ geometry helpers for scenes
const inEll = (x, y, cx, cy, rx, ry) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1;
const ellV = (x, y, cx, cy, rx, ry) => Math.sqrt(((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2);
function inPoly(x, y, pts) {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i], [xj, yj] = pts[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
function bez2(p0, p1, p2, n) {
  const out = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, u = 1 - t;
    out.push([u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0], u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1], t]);
  }
  return out;
}
// nearest point on a sampled curve: returns [dist, t]
function nearCurve(x, y, pts) {
  let best = 1e9, bt = 0;
  for (let i = 1; i < pts.length; i++) {
    const [ax, ay, at] = pts[i - 1], [bx, by, btt] = pts[i];
    const vx = bx - ax, vy = by - ay, l2 = vx * vx + vy * vy;
    const t = clamp(((x - ax) * vx + (y - ay) * vy) / l2, 0, 1);
    const dx = x - (ax + t * vx), dy = y - (ay + t * vy);
    const d = dx * dx + dy * dy;
    if (d < best) { best = d; bt = at + (btt - at) * t; }
  }
  return [Math.sqrt(best), bt];
}

// ------------------------------------------------------------------ the picture (a grey-level scene)
// Coordinates in pixels inside the picture box (COLS x PIC_ROWS cells). The scene returns
// { k: ink 0..1, f: ramp family, red: true for the red ribbon }. Always daytime: a light sky, a
// sun, fair-weather clouds, birds and a sailboat; a sea that darkens toward the horizon; a small
// island with one tall palm and a raft. She is typed by hand on top (see HER_ART).
const PIC_ROWS = 30;
const PW = COLS * CW, PH = PIC_ROWS * CH;
const HOR = 224;                                   // horizon (a row boundary)
const SUN = [104, 74, 32];
const CLOUDS = [
  { base: 118, circles: [[200, 108, 15], [228, 98, 24], [262, 80, 32], [304, 70, 37], [348, 80, 30], [382, 98, 20]] },
  { base: 86, circles: [[774, 74, 16], [804, 58, 26], [840, 66, 20], [866, 78, 12]] },
];
const ISL = { cx: 470, cy: 370, rx: 300, ry: 34 };
const PALM = { base: [606, 362], ctrl: [664, 232], top: [584, 72] };
const TRUNK = bez2(PALM.base, PALM.ctrl, PALM.top, 48);
const FRONDS = (() => {
  // angle (deg, 0 = right, 90 = up), length, droop
  const spec = [[170, 176, 0.62], [146, 150, 0.46], [118, 108, 0.24], [88, 80, 0.06], [58, 118, 0.3], [30, 162, 0.5], [6, 176, 0.68], [206, 128, 0.66], [-32, 124, 0.6]];
  const [cx, cy] = PALM.top;
  return spec.map(([deg, len, droop]) => {
    const a = (deg * Math.PI) / 180;
    const dx = Math.cos(a), dy = -Math.sin(a);
    const p2 = [cx + dx * len, cy + dy * len + droop * len * 0.9];
    const p1 = [cx + dx * len * 0.55, cy + dy * len * 0.55 - len * 0.12];
    const pts = bez2([cx, cy], p1, p2, 26);
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const [x, y] of pts) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
    return { pts, box: [x0 - 22, y0 - 22, x1 + 22, y1 + 22], len };
  });
})();
const RAFT = { x0: 752, x1: 876, y0: 364, y1: 398 };

function seaTone(x, y) {
  const u = y - HOR;                                 // depth below the horizon
  let k = 0.66 - 0.36 * smooth(0, 110, u) + 0.2 * (1 - smooth(0, 16, u));
  const ph = Math.sqrt(u + 6) * 2.4 + 0.8 * Math.sin(x * 0.011 + u * 0.02) + 0.45 * Math.sin(x * 0.037 - u * 0.05);
  k += 0.12 * Math.sin(ph * Math.PI) * smooth(0, 20, u);
  return clamp(k, 0, 1);
}
function picScene(x, y) {
  let k, f = 'sky', red = false;
  if (y < HOR) {
    // sky: a faint field at the top that clears toward the horizon
    k = 0.3 * (1 - smooth(0, HOR - 14, y)) + 0.02;
    // the sun: a bare disc with a ring, its rays cut through the sky field as bare paper
    const ds = Math.hypot(x - SUN[0], y - SUN[1]);
    if (ds < SUN[2]) k = 0;
    else if (ds < SUN[2] + 5) { f = 'line'; k = 0.8; }
    else if (ds < SUN[2] + 12) k = 0;
    else if (ds < SUN[2] + 52) {
      const a = Math.atan2(y - SUN[1], x - SUN[0]);
      const m = Math.abs((((a / (Math.PI * 2)) * 8 + 100.5) % 1) - 0.5);
      if (m * ds * 0.785 < 6.5) k = 0;
    }
    // clouds: bare paper with a shaded underside and an outline
    for (const c of CLOUDS) {
      let sd = 1e9;
      for (const [cx, cy, r] of c.circles) sd = Math.min(sd, Math.hypot(x - cx, y - cy) - r);
      sd = Math.max(sd, y - c.base);
      if (sd < -4) { f = 'sky'; k = y > c.base - 12 ? 0.22 : 0; }
      else if (sd < 0) { f = 'line'; k = 0.75; }
    }
    // a distant sailboat on the horizon: a tall thin sail and a sliver of hull
    if (inPoly(x, y, [[200, 170], [200, 219], [221, 219]]) || inPoly(x, y, [[195, 182], [195, 219], [183, 219]])) { f = 'dark'; k = 0.85; }
    if (y > 218 && x > 180 && x < 226) { f = 'dark'; k = 1; }
  } else {
    f = 'sea';
    k = seaTone(x, y);
    // glitter under the sun: bare cells scattered in a column
    const cx = Math.floor(x / CW), cy = Math.floor(y / CH);
    const g = Math.exp(-(((x - SUN[0]) / 40) ** 2)) * (1 - smooth(HOR, HOR + 140, y));
    if (hash2(cx * 7 + 3, cy * 13 + 1) < g * 0.9) k *= 0.1;
    // the shallows, the foam ring and the sand
    const e = ellV(x, y, ISL.cx, ISL.cy + 6, ISL.rx + 44, ISL.ry + 22);
    if (e < 1) { f = 'shallow'; k = 0.2 + 0.06 * Math.sin(x * 0.05 + y * 0.3); }
    const wob = 0.035 * Math.sin(Math.atan2(y - ISL.cy, x - ISL.cx) * 9) + 0.02 * Math.sin(x * 0.2);
    const ei = ellV(x, y, ISL.cx, ISL.cy, ISL.rx, ISL.ry);
    if (ei < 1.1 + wob) { f = 'shallow'; k = 0; }
    if (ei < 1) {
      f = 'sand';
      k = 0.2 * smooth(0.5, 1, ei) * (y > ISL.cy ? 1 : 0.25);
      // the palm's shadow, and two rocks at the waterline
      if (inEll(x, y, 548, 384, 70, 7)) k = 0.32;
      if (inEll(x, y, 372, 398, 12, 6) || inEll(x, y, 566, 402, 9, 5)) { f = 'dark'; k = 0.85; }
    }
    // the raft, moored off the east end: logs and lashings
    const sl = (y - RAFT.y0) * 0.5;
    if (y > RAFT.y0 && y < RAFT.y1 && x > RAFT.x0 - sl && x < RAFT.x1 - sl) {
      f = 'dark';
      const lane = (y - RAFT.y0) / 6.8;
      k = Math.abs((lane % 1) - 0.5) < 0.34 ? 0.6 : 0.95;
      const xr = x + sl;
      if (Math.abs(xr - (RAFT.x0 + 22)) < 3 || Math.abs(xr - (RAFT.x1 - 22)) < 3) k = 1;
    }
  }
  // bushes at the foot of the palm
  for (const [bx, by, r] of [[546, 352, 20], [576, 344, 22], [520, 362, 14], [640, 354, 17], [666, 362, 11], [404, 368, 10]]) {
    if (Math.hypot(x - bx, (y - by) * 1.3) < r) { f = 'leaf'; k = 0.62 + 0.25 * (y > by ? 1 : 0); }
  }
  // the palm trunk: tapering, ringed, lit from the left
  if (x > 540 && x < 700 && y > 60 && y < 380) {
    const [d, t] = nearCurve(x, y, TRUNK);
    const w = 11 - 5 * t;
    if (y > HOR && ellV(x, y, ISL.cx, ISL.cy, ISL.rx, ISL.ry) > 1) {
      const qx = (Math.floor(x / CW) + 0.5) * CW, qy = (Math.floor(y / CH) + 0.5) * CH;
      if (nearCurve(qx, qy, TRUNK)[0] < 11 - 5 * t + 7) k = 0;
    }
    if (d < w) {
      f = 'dark';
      const i = Math.min(TRUNK.length - 2, Math.floor(t * (TRUNK.length - 1)));
      const [ax, ay] = TRUNK[i], [bx, by] = TRUNK[i + 1];
      const side = (bx - ax) * (y - ay) - (by - ay) * (x - ax);
      const ring = Math.abs((((1 - t) * 22) % 1) - 0.5) < 0.17;
      k = (side > 0 ? 0.55 : 0.85) + (ring ? 0.3 : 0);
    }
  }
  // fronds: thick tapering curves with a bare midrib and ragged leaflets
  for (const fr of FRONDS) {
    const [bx0, by0, bx1, by1] = fr.box;
    if (x < bx0 || x > bx1 || y < by0 || y > by1) continue;
    const [d, t] = nearCurve(x, y, fr.pts);
    const saw = ((t * fr.len) / 9) % 1;
    const w = 12 * Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.04)), 0.6) * (0.5 + 0.5 * saw) + 1.5;
    if (d < w) { f = 'leaf'; k = d < 1.6 && t > 0.1 && t < 0.9 ? 0.15 : 0.92; }
  }
  // coconuts
  for (const [cx, cy] of [[570, 88], [590, 92], [579, 102]]) if (Math.hypot(x - cx, y - cy) < 8) { f = 'dark'; k = 1; }
  return { k, f, red };
}

// ------------------------------------------------------------------ the title band
// CASTAWAY as bare paper in a solid ground: 7-row letters, stems two columns wide, bars one row
// tall, on a 9-row ground of overstruck M and W. Letters are vector shapes; the converter
// finishes their curves and diagonals in lighter letters and punctuation.
const BAND_ROWS = 9;
const LW = { C: 8, A: 8, S: 8, T: 8, W: 10, Y: 8 };
const WORD = 'CASTAWAY';
function rrect(x, y, x0, y0, x1, y1, r) {
  if (x < x0 || x > x1 || y < y0 || y > y1) return false;
  const cx = clamp(x, x0 + r, x1 - r), cy = clamp(y, y0 + r * 1.2, y1 - r * 1.2);
  return ((x - cx) / r) ** 2 + ((y - cy) / (r * 1.2)) ** 2 <= 1;
}
// in-letter test, x and y in pixels inside a letter box (w x 98)
function letterBody(ch, x, y) {
  const w = LW[ch] * CW, h = 7 * CH;   // 70.4 or 88 by 98
  const S2 = 2 * CW, B1 = CH;          // stem and bar
  switch (ch) {
    case 'C':
      return (rrect(x, y, 0, 0, w, h, 17) && !(x > S2 && y > B1 && y < h - B1)) || (x > w - S2 && ((y > B1 && y < 2 * B1) || (y > h - 2 * B1 && y < h - B1)));
    case 'A': {
      const outer = inPoly(x, y, [[0, h], [13, 0], [w - 13, 0], [w, h]]);
      if (!outer) return false;
      const inner = inPoly(x, y, [[S2, h], [13 + S2 - 2, B1], [w - 13 - S2 + 2, B1], [w - S2, h]]);
      const bar = y > 4 * B1 && y < 5 * B1;
      return !inner || bar;
    }
    case 'S': {
      if (!rrect(x, y, 0, 0, w, h, 17)) return false;
      return y < B1 || y > h - B1 || (y > 3 * B1 && y < 4 * B1) || (x < S2 && y < 4 * B1) || (x > w - S2 && y > 3 * B1)
        || (x > w - S2 && y < 2 * B1) || (x < S2 && y > h - 2 * B1);
    }
    case 'T':
      return y < B1 || (x > (w - S2) / 2 && x < (w + S2) / 2);
    case 'W': {
      const legL = inPoly(x, y, [[0, 0], [S2, 0], [S2 + 10, h], [10, h]]);
      const legR = inPoly(x, y, [[w, 0], [w - S2, 0], [w - S2 - 10, h], [w - 10, h]]);
      const inL = inPoly(x, y, [[10, h], [S2 + 10, h], [w / 2 + 2, 2.6 * B1], [w / 2 - S2 + 6, 2.6 * B1]]);
      const inR = inPoly(x, y, [[w - 10, h], [w - S2 - 10, h], [w / 2 - 2, 2.6 * B1], [w / 2 + S2 - 6, 2.6 * B1]]);
      return legL || legR || inL || inR;
    }
    case 'Y': {
      const armL = inPoly(x, y, [[0, 0], [S2 + 1, 0], [w / 2 + CW, 3.6 * B1], [w / 2 - CW, 3.6 * B1]]);
      const armR = inPoly(x, y, [[w, 0], [w - S2 - 1, 0], [w / 2 - CW, 3.6 * B1], [w / 2 + CW, 3.6 * B1]]);
      const stem = x > w / 2 - CW && x < w / 2 + CW && y > 3 * B1;
      return armL || armR || stem;
    }
  }
  return false;
}
const WORD_COLS = [...WORD].reduce((s, c) => s + LW[c], 0) + (WORD.length - 1) * 2;
const WORD_X = Math.floor((COLS - WORD_COLS) / 2) * CW;
const LETTER_X = (() => { const o = []; let c = 0; for (const ch of WORD) { o.push(WORD_X + c * CW); c += LW[ch] + 2; } return o; })();
function bandScene(x, y) {
  const ly = y - CH;   // letters sit on band rows 1..7
  if (ly < 0 || ly > 7 * CH) return { k: 1, f: 'band', red: false };
  for (let i = 0; i < WORD.length; i++) {
    const lx = x - LETTER_X[i];
    const w = LW[WORD[i]] * CW;
    if (lx < -1 || lx > w + 1) continue;
    if (letterBody(WORD[i], lx, ly)) return { k: 0, f: 'band', red: false };
  }
  return { k: 1, f: 'band', red: false };
}

// ------------------------------------------------------------------ the converter
// For each cell: sample the scene on the SX x SY grid (3 x 3 points per sub-cell). Flat cells get
// their family's ramp, ordered-dithered; cells with an edge in them get whichever glyph or
// overstruck pair best matches the blurred shape and the tone.
function convert(sceneFn, cols, rows, cw, ch, opts = {}) {
  const singles = !!opts.singles;
  const out = [];
  const famCount = {};
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      const T = new Float64Array(SUB);
      const fams = {};
      let reds = 0, n = 0;
      for (let j = 0; j < SY; j++) for (let i = 0; i < SX; i++) {
        let s = 0;
        for (let b = 0; b < 3; b++) for (let a = 0; a < 3; a++) {
          const x = (c + (i + (a + 0.5) / 3) / SX) * cw, y = (r + (j + (b + 0.5) / 3) / SY) * ch;
          const p = sceneFn(x, y);
          s += p.k;
          fams[p.f] = (fams[p.f] || 0) + 1 + p.k * 2;
          if (p.red) reds++;
          n++;
        }
        T[j * SX + i] = (s / 9) * MAXC;
      }
      let fam = 'sky', best = -1;
      for (const [k, v] of Object.entries(fams)) if (v > best) { best = v; fam = k; }
      famCount[fam] = (famCount[fam] || 0) + 1;
      const red = reds > n * 0.4;
      let lo = 1, hi = 0;
      for (const v of T) { lo = Math.min(lo, v); hi = Math.max(hi, v); }
      const m = mean(T);
      let ramp = rampOf(fam);
      if (singles) ramp = ramp.filter((g) => !g.b);
      let pick;
      if (hi - lo < FLAT) {
        // flat: dither between the two nearest ramp levels
        let j = 0;
        while (j < ramp.length - 1 && ramp[j + 1].m <= m) j++;
        if (j >= ramp.length - 1) pick = ramp[ramp.length - 1];
        else {
          const fr = (m - ramp[j].m) / (ramp[j + 1].m - ramp[j].m);
          pick = fr > dither(fam, c, r) ? ramp[j + 1] : ramp[j];
        }
      } else {
        const Tb = blur(T);
        let bestE = 1e9;
        const cands = [...ramp, ...EDGE.map(spec)].filter((g) => !(singles && g.b));
        for (const g of cands) {
          let e = 0;
          for (let q = 0; q < SUB; q++) { const d = Tb[q] - g.bl[q]; e += d * d; }
          e = e / SUB + 2.2 * (m - g.m) ** 2 + (g.b ? 0.0015 : 0);
          if (e < bestE) { bestE = e; pick = g; }
        }
      }
      row.push({ a: pick.a, b: pick.b, red });
    }
    out.push(row);
  }
  if (DEBUG) console.log('families', famCount);
  return out;
}

// ------------------------------------------------------------------ the sheet
// Text rows are typed as they are; the band and the picture come from the converter.
const HEAD_LINE = 'ZCZC PIX001  PRIORITY NONE  FM TOP FROND RELAY  TO ALL SHIPS: PLEASE STOP  RYRYRYRYRYRY';
const TELEGRAM = '10 HOURS OF ONE ISLAND STOP SHE NODS STOP EVERY SO OFTEN SOMETHING HAPPENS STOP';
const SIGN_OFF = 'ISLAND REPORT ENDS STOP SENT FROM TOP OF PALM (1 BAR) STOP 2026-10-01 STOP 73  NNNN';
const RED_WORDS = ['STOP'];
function textRow(s, center = true) {
  const pad = center ? Math.floor((COLS - s.length) / 2) : 0;
  const row = [];
  for (let c = 0; c < COLS; c++) row.push({ a: ' ', b: null, red: false });
  for (let i = 0; i < s.length; i++) row[pad + i].a = s[i];
  // the telegram's STOPs go in red, like a typist switching to the other half of the ribbon
  for (const w of RED_WORDS) {
    let at = s.indexOf(w);
    while (at >= 0) { for (let i = 0; i < w.length; i++) row[pad + at + i].red = true; at = s.indexOf(w, at + 1); }
  }
  return row;
}
const blankRow = () => textRow('');

// Her, typed by hand, from behind: she is looking out to sea. Cream headphone band over the
// top, cups either side, brown hair (struck twice) in a low bun, a coral tank top in the red half
// of the ribbon (H struck over with X), cream shorts, bare feet. Three layers per row: the first
// strike, the overstrike, and the ribbon colour (r = red).
const HER_ART = [
  ['  .---.  ', '         ', '         '],
  [' O(MMM)O ', '   WWW   ', '         '],
  [' O(MMM)O ', '   WWW   ', '         '],
  ['   (M)   ', '    W    ', '         '],
  ['  ,-I-,  ', '         ', '         '],
  [' (HHHHH) ', '  XXXXX  ', '  rrrrr  '],
  [' (HHHHH) ', '  XXXXX  ', '  rrrrr  '],
  [' (HHHHH) ', '  XXXXX  ', '  rrrrr  '],
  [' .(===). ', '         ', '         '],
  ['  (=I=)  ', '         ', '         '],
  ['   I I   ', '         ', '         '],
  ['   I I   ', '         ', '         '],
  ['   J L   ', '         ', '         '],
];
const HER_AT = [13, 32];   // picture row and column of the block's top-left corner
// Lay hand-typed art over a converted picture. Each row is opaque from its first to its last
// typed character; below the horizon a one-cell margin of bare paper keeps it clear of the sea.
function overlay(pic, art, r0, c0, horizonRow) {
  art.forEach(([p1, p2, co], i) => {
    const r = r0 + i;
    const first = p1.search(/\S/), last = p1.length - 1 - [...p1].reverse().join('').search(/\S/);
    if (first < 0) return;
    for (let j = first - (r >= horizonRow ? 1 : 0); j <= last + (r >= horizonRow ? 1 : 0); j++) {
      const c = c0 + j;
      const a = p1[j] || ' ', b = (p2[j] || ' ').trim() || null;
      pic[r][c] = { a, b, red: (co[j] || ' ') === 'r' };
    }
  });
}

function buildSheet() {
  const band = convert(bandScene, COLS, BAND_ROWS, CW, CH);
  const pic = convert(picScene, COLS, PIC_ROWS, CW, CH);
  // hand-typed touches, as the operators did: birds over the sea
  for (const [r, c, ch] of [[1, 22, 'V'], [2, 26, 'V'], [1, 30, 'V'], [9, 88, 'V'], [10, 92, 'V']]) pic[r][c] = { a: ch, b: null, red: false };
  // and her, typed by hand: too small for the converter, so every character is chosen
  overlay(pic, HER_ART, HER_AT[0], HER_AT[1], Math.round(HOR / CH));
  const rows = [];
  rows.push(textRow(HEAD_LINE));
  rows.push(blankRow());
  const BAND_AT = rows.length;
  rows.push(...band);
  rows.push(blankRow());
  rows.push(textRow(TELEGRAM));
  rows.push(blankRow());
  const PIC_AT = rows.length;
  rows.push(...pic);
  rows.push(blankRow());
  rows.push(textRow(SIGN_OFF));
  return { rows, BAND_AT, PIC_AT };
}

// ------------------------------------------------------------------ SVG
function buildSvg(sheet) {
  const { rows } = sheet;
  const NR = rows.length;
  const SHEET_H = NR * CH;
  const GUIDE_H = 17;
  const VB_H = Math.round(Y0 + SHEET_H + GUIDE_H + 12);

  // ---- runs: for each (pass, colour, glyph), merge equal neighbours along each row
  const runs = {};   // key `${pass}|${red}|${glyph}` -> [[r, c0, c1)...]
  const used = new Set();
  const pass2Rows = new Set();
  for (let r = 0; r < NR; r++) {
    for (const pass of [1, 2]) {
      let c = 0;
      while (c < COLS) {
        const cell = rows[r][c];
        const g = pass === 1 ? cell.a : cell.b;
        if (!g || g === ' ') { c++; continue; }
        let e = c + 1;
        while (e < COLS) {
          const n = rows[r][e];
          const gn = pass === 1 ? n.a : n.b;
          if (gn !== g || n.red !== cell.red) break;
          e++;
        }
        const key = `${pass}|${cell.red ? 1 : 0}|${g}`;
        (runs[key] = runs[key] || []).push([r, c, e]);
        used.add(`${cell.red ? 1 : 0}|${g}`);
        if (pass === 2) pass2Rows.add(r);
        c = e;
      }
    }
  }
  // ---- patterns: one per glyph and ink
  const pid = (red, g) => {
    const name = /[A-Z0-9]/.test(g) ? g : 'p' + g.charCodeAt(0).toString(36);
    return (red === '1' || red === 1 ? 'r' : 'k') + name;
  };
  let defs = '';
  for (const u of [...used].sort()) {
    const [red, g] = [u.slice(0, 1), u.slice(2)];
    defs += `<pattern id="${pid(red, g)}" width="1" height="1" patternUnits="userSpaceOnUse"><path class="${red === '1' ? 'ir' : 'ik'}" transform="scale(${f4(1 / CW)} ${f4(1 / CH)})" d="${glyphD(g)}"/></pattern>`;
  }
  // ---- run paths, in cell units (the group scales them to pixels)
  const pathsFor = (pass) => {
    let s = '';
    for (const [key, list] of Object.entries(runs).sort()) {
      const [p, red, g] = key.split('|');
      if (+p !== pass) continue;
      let d = '';
      for (const [r, c0, c1] of list) d += `M${c0} ${r}h${c1 - c0}v1h${c0 - c1}z`;
      s += `<path fill="url(#${pid(red, g)})" d="${d}"/>`;
    }
    return s;
  };

  // ---- timeline: slots of TS seconds; hold, feed, then one slot per pass
  const TS = 0.3;
  const HOLD = 27, FEED = 4;
  const passes = [];
  for (let r = 0; r < NR; r++) {
    const has1 = rows[r].some((c) => c.a !== ' ');
    if (has1) passes.push({ r, p: 1 });
    if (pass2Rows.has(r)) passes.push({ r, p: 2 });
  }
  const NSLOT = HOLD + FEED + passes.length;
  const LOOP = NSLOT * TS;
  const pct = (slot) => f4((slot / NSLOT) * 100) + '%';
  const PRINT0 = HOLD + FEED;

  const kf = (name, frames) => `@keyframes ${name}{${frames.map(([s, v]) => `${pct(s)}{${v}}`).join('')}}`;
  const ty = (v) => `transform:translateY(${f2(v)}px)`;
  const TOP = Y0;
  const BIG = SHEET_H + 40;

  // feed: the content steps up and out over the first 80% of the feed, the masks empty at 85%,
  // and the content returns home at 95%, already invisible.
  const feedSteps = Math.ceil((VB_H - TOP + 4) / CH);
  const feedK = [[0, ty(0)]];
  for (let i = 1; i <= feedSteps; i++) feedK.push([HOLD + (FEED * 0.8 * i) / feedSteps, ty(-i * CH)]);
  feedK.push([HOLD + FEED * 0.95, ty(0)]);
  feedK.push([NSLOT, ty(0)]);

  // done-rows rectangles (D) and current-row sweepers (R) for the two passes
  const mk = () => ({ D: [[0, ty(BIG)]], R: [[0, ty(NR * CH)]] });
  const M1 = mk(), M2 = mk();
  for (const m of [M1, M2]) {
    m.D.push([HOLD + FEED * 0.85, ty(0)]);
    m.R.push([HOLD + FEED * 0.85, ty(-3 * CH)]);
  }
  const gyK = [[0, ty(NR * CH)]];
  const hvK = [[0, 'opacity:0'], [PRINT0, 'opacity:1']];
  passes.forEach(({ r, p }, i) => {
    const s = PRINT0 + i;
    const m = p === 1 ? M1 : M2;
    m.R.push([s + 0.02, ty(r * CH)]);
    m.D.push([s + 0.92, ty((r + 1) * CH)]);
    gyK.push([s + 0.02, ty((r + 1) * CH)]);
  });
  // after the last pass: commit everything, park the head below the sheet
  for (const m of [M1, M2]) { m.D.push([NSLOT - 0.04, ty(BIG)]); }
  gyK.push([NSLOT - 0.04, ty(NR * CH)]);
  hvK.push([NSLOT - 0.04, 'opacity:0']);
  for (const m of [M1, M2]) { m.D.push([NSLOT, ty(BIG)]); m.R.push([NSLOT, ty(NR * CH)]); }
  gyK.push([NSLOT, ty(NR * CH)]);
  hvK.push([NSLOT, 'opacity:0']);
  const hpK = hvK.map(([s, v]) => [s, v === 'opacity:0' ? 'opacity:1' : 'opacity:0']);

  // the sweep inside each slot: column steps over the first 85%, then carriage return
  const NSTEP = 25;
  const sweep = [[0, 'transform:translateX(0px)']];
  for (let i = 1; i <= NSTEP; i++) sweep.push([(0.04 + (0.81 * i) / NSTEP), `transform:translateX(${f2((COLS * CW * i) / NSTEP)}px)`]);
  const sweepK = `@keyframes sx{${sweep.map(([t, v]) => `${f2(t * 100)}%{${v}}`).join('')}100%{transform:translateX(${f2(COLS * CW)}px)}}`;

  const css = `
.ik{fill:none;stroke:#1d1b1a;stroke-width:${SW};stroke-linecap:round;stroke-linejoin:round}
.ir{fill:none;stroke:#c23b2e;stroke-width:${SW};stroke-linecap:round;stroke-linejoin:round}
.an{animation-duration:${f3(LOOP)}s;animation-iteration-count:infinite;animation-timing-function:step-end}
.fd{animation-name:fd}.d1{animation-name:d1}.d2{animation-name:d2}.r1{animation-name:r1}.r2{animation-name:r2}
.gy{animation-name:gy}.hv{animation-name:hv}.hp{animation-name:hp}
.sx{animation:sx ${TS}s step-end infinite}
${kf('fd', feedK)}${kf('d1', M1.D)}${kf('d2', M2.D)}${kf('r1', M1.R)}${kf('r2', M2.R)}${kf('gy', gyK)}${kf('hv', hvK)}${kf('hp', hpK)}${sweepK}
@media (prefers-color-scheme:dark){.pm{stop-color:#e8e3d6}.pe{stop-color:#d9d2bf}}
@media (prefers-reduced-motion:reduce){.an,.sx{animation:none!important}}`;

  // ---- paper, ink-density mask and the typing head
  const rnd = mulberry32(1992);
  let inkRows = '';
  for (let r = 0; r < NR; r++) {
    const g = Math.round(255 * (0.8 + 0.2 * rnd()));
    inkRows += `<rect y="${f1(TOP + r * CH)}" width="${VB_W}" height="${CH}" fill="rgb(${g},${g},${g})"/>`;
  }
  // a couple of worn patches in the ribbon
  for (let i = 0; i < 5; i++) {
    inkRows += `<ellipse cx="${f1(X0 + rnd() * COLS * CW)}" cy="${f1(TOP + rnd() * SHEET_H)}" rx="${f1(60 + rnd() * 120)}" ry="${f1(20 + rnd() * 40)}" fill="#000" opacity="${f2(0.08 + rnd() * 0.08)}"/>`;
  }
  const maskRect = (cls, extra) => `<rect class="an ${cls}" x="0" y="${f1(TOP - BIG)}" width="${VB_W}" height="${f1(BIG)}" fill="#fff" transform="translate(0 ${BIG})"${extra || ''}/>`;
  const sweeper = (cls) => `<g class="an ${cls}" transform="translate(0 ${NR * CH})"><rect class="sx" x="${f1(X0 - COLS * CW - 2)}" y="${f1(TOP - 1.5)}" width="${f1(COLS * CW + 2)}" height="${CH + 3}" fill="#fff"/></g>`;

  // paper fibres: a small tile of faint specks
  let fib = '';
  const rf = mulberry32(7);
  for (let i = 0; i < 26; i++) {
    const x = rf() * 90, y = rf() * 90, l = 1 + rf() * 3, a = rf() * Math.PI;
    fib += `M${f1(x)} ${f1(y)}l${f1(Math.cos(a) * l)} ${f1(Math.sin(a) * l)}`;
  }

  // ruler numbers on the card guide
  let ticks = '', nums = '';
  for (let c = 0; c <= COLS; c++) {
    const x = X0 + c * CW;
    const h = c % 10 === 0 ? 6 : c % 5 === 0 ? 4 : 2.4;
    ticks += `M${f1(x)} 1.5v${h}`;
    if (c % 10 === 0 && c > 0 && c < COLS) {
      const s = String(c);
      for (let i = 0; i < s.length; i++) nums += glyphD(s[i], (x + 2 + i * 5.2 - 1.4 * 0.55) / 0.55, (1.2 - 2 * 0.55) / 0.55);
    }
  }

  const headX = X0;   // the head's print point at column 0; the sweep moves it
  const head = `<g transform="translate(${f1(headX)} ${f1(-CH / 2 + 1)})">
<rect x="-1" y="-12.5" width="16" height="17" rx="3" fill="#2a2e31"/>
<rect x="1.5" y="-10" width="11" height="3" rx="1" fill="#4a5055"/>
<rect x="-7" y="-4.5" width="28" height="3.4" fill="#26222b"/><rect x="-7" y="-1.1" width="28" height="3.4" fill="#a3362c"/>
<rect x="-1" y="4.5" width="16" height="2" fill="#16191b"/></g>`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VB_W} ${VB_H}" width="${VB_W}" height="${VB_H}" role="img" aria-label="CASTAWAY, a radioteletype picture of the island being typed">
<title>CASTAWAY: a teletype picture of one island, one palm and one raft</title>
<desc>A sheet of teletype paper. A transmission header; the name CASTAWAY left as bare paper in a solid ground of overstruck capitals; a typed telegram; a tonal picture made only of capitals and punctuation: a banded sky with a bare sun, two clouds, birds and a distant sailboat; the sea; a small island with one tall palm and a raft; and her, typed by hand from behind, in headphones, her top struck in red; then a sign-off. A typing head under a card guide prints it line by line, striking the dark lines twice; then the paper feeds and it starts again.</desc>
<style>${css}</style>
<defs>
<clipPath id="panel"><rect width="${VB_W}" height="${VB_H}" rx="14"/></clipPath>
<linearGradient id="pg" x1="0" y1="0" x2="1" y2="0"><stop class="pe" offset="0" stop-color="#e9e3d2"/><stop class="pm" offset=".07" stop-color="#f4f0e5"/><stop class="pm" offset=".93" stop-color="#f4f0e5"/><stop class="pe" offset="1" stop-color="#e7e1cf"/></linearGradient>
<pattern id="fib" width="90" height="90" patternUnits="userSpaceOnUse"><path d="${fib}" stroke="#8a7a5a" stroke-width=".5" opacity=".18" fill="none"/></pattern>
<linearGradient id="gw" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".16"/></linearGradient>
<mask id="ink" maskUnits="userSpaceOnUse" x="0" y="0" width="${VB_W}" height="${f1(TOP + SHEET_H + 10)}">${inkRows}<rect width="${VB_W}" height="${f1(TOP + SHEET_H + 10)}" fill="url(#gw)"/></mask>
<mask id="m1" maskUnits="userSpaceOnUse" x="0" y="0" width="${VB_W}" height="${f1(TOP + SHEET_H + 10)}">${maskRect('d1')}${sweeper('r1')}</mask>
<mask id="m2" maskUnits="userSpaceOnUse" x="0" y="0" width="${VB_W}" height="${f1(TOP + SHEET_H + 10)}">${maskRect('d2')}${sweeper('r2')}</mask>
${defs}
</defs>
<g clip-path="url(#panel)">
<rect width="${VB_W}" height="${VB_H}" fill="url(#pg)"/>
<rect width="${VB_W}" height="${VB_H}" fill="url(#fib)"/>
<g class="an fd">
<g mask="url(#ink)">
<g mask="url(#m1)" opacity=".86"><g transform="translate(${f2(X0)} ${f2(TOP)}) scale(${CW} ${CH})">${pathsFor(1)}</g></g>
<g mask="url(#m2)" opacity=".8"><g transform="translate(${f2(X0 + MIS[0])} ${f2(TOP + MIS[1])}) scale(${CW} ${CH})">${pathsFor(2)}</g></g>
</g>
</g>
<g class="an gy" transform="translate(0 ${NR * CH})"><g transform="translate(0 ${f1(TOP + 1)})">
<rect x="0" y="0" width="${VB_W}" height="${GUIDE_H}" fill="#5d7480" opacity=".13"/>
<path d="M0 .5H${VB_W}" stroke="#c23b2e" stroke-width="1" opacity=".55"/>
<path d="${ticks}" stroke="#4d5b62" stroke-width=".7" opacity=".7"/>
<path d="${nums}" transform="scale(.55)" fill="none" stroke="#4d5b62" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" opacity=".75"/>
<g class="an hv" opacity="0"><g class="sx">${head}</g></g>
<g class="an hp">${head}</g>
</g></g>
</g>
<rect x=".5" y=".5" width="${VB_W - 1}" height="${VB_H - 1}" rx="14" fill="none" stroke="#cbc3ad"/>
</svg>
`;
  if (DEBUG) console.log('passes', passes.length, 'loop', f2(LOOP), 's', 'rows', NR, 'VB_H', VB_H);
  return { svg, LOOP, VB_H };
}

// ------------------------------------------------------------------ the received copy (plain text)
// The same transmission as a 78-column single-strike text, for a code block: no overstrike and
// no red in a <pre>, and GitHub's line height makes each cell about 2.4 times taller than wide,
// so the picture is transcribed again at that shape, the band uses a smaller hand-set alphabet,
// and she is typed again at the smaller size.
const TXT_COLS = 78;
const TXT_ROWS = 15;
const TXT_LETTERS = {
  C: ['.xxxxx.', 'xx...xx', 'xx.....', 'xx.....', 'xx.....', 'xx...xx', '.xxxxx.'],
  A: ['..xxx..', '.xx.xx.', 'xx...xx', 'xx...xx', 'xxxxxxx', 'xx...xx', 'xx...xx'],
  S: ['.xxxxx.', 'xx...xx', 'xx.....', '.xxxxx.', '.....xx', 'xx...xx', '.xxxxx.'],
  T: ['xxxxxxx', '..xxx..', '..xxx..', '..xxx..', '..xxx..', '..xxx..', '..xxx..'],
  W: ['xx.....xx', 'xx.....xx', 'xx.....xx', 'xx..x..xx', 'xx.xxx.xx', 'xxxx.xxxx', 'xxx...xxx'],
  Y: ['xx...xx', 'xx...xx', '.xx.xx.', '..xxx..', '..xxx..', '..xxx..', '..xxx..'],
};
const TXT_HER = [
  ' .-. ',
  'O(M)O',
  ' (M) ',
  '(XXX)',
  ' (=) ',
  ' I I ',
  ' J L ',
];
function centre(s, w = TXT_COLS) {
  const pad = Math.max(0, Math.floor((w - s.length) / 2));
  return (' '.repeat(pad) + s).replace(/\s+$/, '');
}
function buildTextCopy() {
  const out = [];
  out.push(centre('ZCZC PIX001  PRIORITY NONE  FM TOP FROND RELAY  TO ALL SHIPS: PLEASE STOP'));
  out.push('');
  // the band: a field of M with the letters left as bare paper
  const word = [...WORD].map((ch) => TXT_LETTERS[ch]);
  const wordW = word.reduce((s, l) => s + l[0].length, 0) + (word.length - 1) * 2;
  const left = Math.floor((TXT_COLS - wordW) / 2);
  const field = 'M'.repeat(TXT_COLS);
  out.push(field);
  for (let r = 0; r < 7; r++) {
    const row = [...field];
    let c = left;
    for (const l of word) {
      for (let i = 0; i < l[r].length; i++) if (l[r][i] === 'x') row[c + i] = ' ';
      c += l[r].length + 2;
    }
    out.push(row.join(''));
  }
  out.push(field);
  out.push('');
  out.push(centre('10 HOURS OF ONE ISLAND STOP SHE NODS STOP'));
  out.push(centre('EVERY SO OFTEN SOMETHING HAPPENS STOP'));
  out.push('');
  // the picture, single strike only, at the code block's cell shape
  const pic = convert(picScene, TXT_COLS, TXT_ROWS, PW / TXT_COLS, PH / TXT_ROWS, { singles: true });
  const rows = pic.map((row) => row.map((c) => c.a));
  // birds, and her (feet on the sand, a margin of bare paper round her below the horizon)
  for (const [r, c] of [[1, 19], [1, 23], [5, 68]]) rows[r][c] = 'V';
  const herR = 6, herC = Math.round(HER_AT[1] * TXT_COLS / COLS) + 1, horizon = Math.round(HOR / (PH / TXT_ROWS));
  TXT_HER.forEach((line, i) => {
    const r = herR + i;
    const first = line.search(/\S/), last = line.length - 1 - [...line].reverse().join('').search(/\S/);
    const m = r >= horizon ? 1 : 0;
    for (let j = first - m; j <= last + m; j++) rows[r][herC + j] = line[j] || ' ';
  });
  for (const row of rows) out.push(row.join('').replace(/\s+$/, ''));
  out.push('');
  out.push(centre('ISLAND REPORT ENDS STOP SENT FROM TOP OF PALM (1 BAR) STOP'));
  out.push(centre('2026-10-01 STOP 73  NNNN'));
  return out.join('\n');
}

// ------------------------------------------------------------------ the README header (markdown)
function buildMarkdown(textCopy) {
  const alt = 'CASTAWAY, typed on a sheet of teletype paper. At the top a transmission header: ZCZC PIX001, PRIORITY NONE, FM TOP FROND RELAY, TO ALL SHIPS: PLEASE STOP, then a row of RY test letters. Below it the name CASTAWAY in tall capitals left as bare paper in a solid block of overstruck M and W, and a typed telegram: 10 HOURS OF ONE ISLAND STOP SHE NODS STOP EVERY SO OFTEN SOMETHING HAPPENS STOP, each STOP in red. Then a tonal picture made only of capitals and punctuation: a banded sky with a bare sun and its rays, two fair-weather clouds, a few birds and a distant sailboat; a sea of wave-shaped runs of letters; a small island with one tall ringed palm, bushes and a raft moored at the east end; and her, typed by hand from behind, looking out to sea: headphone cups either side of her dark hair, a low bun, a coral top struck in red, cream shorts, bare feet. The sign-off reads: ISLAND REPORT ENDS STOP SENT FROM TOP OF PALM (1 BAR) STOP 2026-10-01 STOP 73 NNNN. A typing head under a card guide with a column scale types the sheet line by line, going over the dark lines a second time; then the paper feeds up and it starts again.';
  return `<!-- Header ${SLUG} for Castaway. Generated by src/${SLUG}.mjs: edit that, not this. -->

<p align="center">
  <img src="${SVG_REF}" width="100%" alt="${esc(alt)}">
</p>

<h1 align="center">Castaway</h1>

<p align="center">
  <b>Ten hours of one small island, sent a line at a time. Almost nothing happens. That is the picture.</b><br>
  <sub>PIX001 &nbsp;·&nbsp; PRIORITY NONE &nbsp;·&nbsp; 10:00:00 &nbsp;·&nbsp; SEED 1992 &nbsp;·&nbsp; ALWAYS DAYTIME &nbsp;·&nbsp; 73</sub>
</p>

Castaway (working title) is a stationary-frame lo-fi video for YouTube, the ten-hour kind you leave on: a young woman alone on a tiny island with one tall palm, a raft and a lot of time. She mostly idles, nodding to the music on her headphones. Every so often something happens. Then she goes back to nodding. It is an unofficial remake inspired by the small-island routines and visual comedy of Johnny Castaway, the 1992 desert-island screensaver, repainted in sunny, hand-painted coastal lo-fi: 16:9, 1080p at 30 fps, and always daytime. In development; no video is out yet.

**The traffic so far.** A message in a bottle washes straight back; a different bottle later brings a reply. A drone delivers a parcel, and the parcel is another pair of headphones. A coconut falls on a hermit crab, and the crab walks off wearing it. The only signal on the island is one bar, at the top of the palm, which is where this picture was sent from. [activities.toml](activities.toml) schedules more than 90 activities on four timers, from every few minutes to every few hours, and every one starts on the next bar of the music, every 3 seconds, so the gags land on the beat.

**Every sound is synthesized from code** by [tools/make_audio.py](tools/make_audio.py): more than 150 files and not one sample, loop or recording, so no third-party licence applies. Nobody has listened to it yet, and this station only receives pictures.

\`\`\`sh
python tools/serve.py        # then open http://127.0.0.1:8765/
\`\`\`

That page is the renderer: a live preview, then export to a YouTube-ready MP4. It encodes frame-exact H.264 in the browser with WebCodecs, and the server mixes in the sound and joins the two. Plain ES modules, no build step, no npm packages. The working log, decisions and open questions included, is [MUSING.md](MUSING.md).

<details>
<summary><b>Received copy</b>: the same transmission as plain text, single strike, 78 columns</summary>

<br>

\`\`\`text
${textCopy}
\`\`\`

Single strike only: a code block cannot type over itself, so the dark parts are a shade lighter than on the sheet, and the red half of the ribbon is not available.

</details>

<details>
<summary><b>Traffic log</b>: the gags, as received</summary>

<br>

\`\`\`text
MSG 01  BOTTLE THROWN STOP BOTTLE WASHED STRAIGHT BACK STOP
MSG 02  DIFFERENT BOTTLE ARRIVED STOP IT CONTAINED A REPLY STOP
MSG 03  DRONE DELIVERED A PARCEL STOP CONTENTS: MORE HEADPHONES STOP
MSG 04  SEA TURTLE VISITED STOP NO FURTHER BUSINESS STOP
MSG 05  CAT ARRIVED ON A CRATE STOP CLIMBED PALM STOP NAPPED STOP
MSG 06  CAT FLOATED AWAY ON THE CRATE STOP CAME BACK ANOTHER DAY STOP
MSG 07  SIGNAL FOUND: ONE BAR, TOP OF PALM STOP THIS PICTURE SENT FROM THERE
MSG 08  SHARK IN HEADPHONES NODDING ON THE BEAT STOP NO CAUSE FOR ALARM STOP
MSG 09  TOUR BOAT PASSED STOP SELFIES TAKEN STOP SHE WAVED STOP BOAT LEFT STOP
MSG 10  COCONUT FELL ON A HERMIT CRAB STOP CRAB LEFT WEARING COCONUT STOP
MSG 11  SHE WALKED OUT OVER THE WATER STOP CAME BACK WITH AN ICED COFFEE STOP
MSG 12  HYDROFOIL BRO WAVED SHAKA STOP CARVED OFF STOP
MSG 13  FIRE BY FRICTION STOP HAMMOCK STOP LOOKOUT UP THE PALM STOP
MSG 14  KUMARA PLANTED STOP IT GROWS OVER THE VIDEO STOP WILL ADVISE STOP
MSG 15  SANDCASTLE BUILT STOP TIDE TOOK SANDCASTLE STOP
MSG 16  SHIP SIGHTED STOP NOT BY HER STOP SHE WAS BUSY WITH A COCONUT STOP
MSG 17  NOTHING HAPPENED STOP NOTHING HAPPENED STOP SHE NODDED STOP
\`\`\`

Coconut sipping, fishing, jogging laps, spear fishing and waving for rescue come round between those, and in between everything she idles. The scene keeps itself busy too: shore waves and drifting cloud shadows are built, and distant birds, planes with vapour trails, whale pods, dolphins, sailboats, sandpipers, a gecko and a rain shower are planned.

</details>

<details>
<summary><b>Operating schedule</b>: four timers and a metronome</summary>

<br>

| Timer | Comes round every | In a typical 10-hour run |
| --- | --- | --- |
| regular | 2 to 5 minutes | about 155 events |
| occasional | 12 to 25 minutes | about 30 |
| rare | 30 to 60 minutes | about 13 |
| super rare | 3 to 6 hours, 3 a run at most | about 2 |

Typical counts are the median of 200 simulated runs, as the header of [activities.toml](activities.toml) states, plus chained follow-ups such as the reply in the second bottle or the tide coming for the sandcastle. She is busy about a third of the time and idling the rest. Lanes let things overlap, so a ship can sail past while she is busy with a coconut, and it will wait for her to get busy. The default run is 10:00:00 with seed 1992; same seed, same ten hours.

\`\`\`sh
python tools/schedule.py            # validate, then simulate ten hours
python tools/render_demo.py --dev   # every activity in turn, with a HUD
\`\`\`

</details>

<details>
<summary><b>Station notes</b>: sound, video and the small print</summary>

<br>

- **Sound.** The theme is a seamless 60-second loop at 80 BPM in F major: a ii-V-I-vi, 20 bars of exactly 3 seconds, with electric piano, a kalimba lead, soft drums and vinyl crackle, all synthesized. The ocean is its own seamless 60-second loop. The mix sits at -14 LUFS with true peak at or below -1 dBTP, and levels are adjustable in master and per routine.
- **Video.** The browser export runs at 68 to 78 frames a second at 1080p30 in Chrome. Hard cuts and stepped movement are the motion defaults, which suits a machine that moves one character at a time. [web/index.html](web/index.html) is the page; [tools/render_demo.py](tools/render_demo.py) is the older Python reference renderer.
- **Unofficial.** Castaway is inspired by Johnny Castaway (1992). That screensaver, its castaway and its publishers belong to their owners, and this project is not affiliated with any of them.
- **This header.** A radioteletype picture, the way amateurs typed them: capitals, digits and a little punctuation, tone from the weight of the letters, and the dark lines struck twice with a bare carriage return between. The scene was painted as shades of grey and transcribed cell by cell by a script that picks the letter whose weight and shape fit best; she was too small for that, so she was typed by hand. TOP FROND RELAY and its operator are invented, and there is no call sign. ZCZC and NNNN open and close a message, RY is the tuning test, 73 means best regards.

</details>
`;
}

// ------------------------------------------------------------------ main
if (DEBUG) {
  const all = Object.keys(FONT).map(spec).sort((a, b) => a.m - b.m);
  console.log(all.map((g) => `${g.s}:${f3(g.m)}`).join('  '));
  const pairs = ['HI', 'MI', 'MW', 'M#', 'XO', 'XK', 'X#', '#M', 'W=', 'WZ', '==', '((', '))', '//', '=-'].map(spec);
  console.log(pairs.map((g) => `${g.s}:${f3(g.m)}`).join('  '));
}
const sheet = buildSheet();
const { svg, LOOP } = buildSvg(sheet);
fs.mkdirSync(path.dirname(OUT_SVG), { recursive: true });
fs.writeFileSync(OUT_SVG, svg);
console.log(`wrote ${OUT_SVG} (${(svg.length / 1024).toFixed(1)} KB, loop ${f2(LOOP)} s)`);
const textCopy = buildTextCopy();
fs.writeFileSync(OUT_MD, buildMarkdown(textCopy));
console.log(`wrote ${OUT_MD}`);
if (DEBUG) console.log(textCopy);
if (DEBUG) {
  for (const row of sheet.rows) console.log(row.map((c) => c.a).join('').replace(/\s+$/, ''));
}
