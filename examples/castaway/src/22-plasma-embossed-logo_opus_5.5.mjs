#!/usr/bin/env node
// CASTAWAY pressed into a palette-cycling plasma: a README banner.
//
//   node examples/castaway/src/22-plasma-embossed-logo_opus_5.5.mjs
//   node examples/castaway/src/22-plasma-embossed-logo_opus_5.5.mjs --roll=crimson --out=x.svg
//   node examples/castaway/src/22-plasma-embossed-logo_opus_5.5.mjs --debug=some/dir
//   node examples/castaway/src/22-plasma-embossed-logo_opus_5.5.mjs --ascii
//
// Regenerates ../assets/22-plasma-embossed-logo_opus_5.5.svg. Plain Node, no
// dependencies, deterministic: the only randomness is a seeded PRNG (seed
// 1992, the same seed as the video's default run), never the clock.
// --roll forces a palette; --out writes elsewhere; --debug writes the flat
// lettering and four palette-applied frames as PNGs into a folder; --ascii
// also prints the README's tide table.
//
// The style: the mid-90s DOS intro screen that is nothing but a one-hue
// plasma with a big serif wordmark pressed into it, letterboxed, with a tiny
// sprite and a line of white text in the top-left corner (catalogue pc-02;
// the Razor 1911 intros #02 and #03 by Hetero, 1996-97, are the credited
// reference). Nothing is copied from them: the letters, the field, the
// palettes, the sprite and the words are all drawn here, for this project.
//
// How the SVG does it (the real mechanism, not a picture of it)
//   * The field is computed ONCE, here, as a 320 x 90 index image (a sum of
//     sines, 85 palette steps per period) and embedded as a small greyscale
//     PNG drawn with nearest-neighbour scaling: chunky VGA pixels. (That
//     has to be the CSS image-rendering:pixelated; Chrome ignores the old
//     optimizeSpeed attribute under a filter, smooths the indices, and the
//     palette wrap shows as pale contour lines.)
//   * Palette cycling is an SVG filter doing exactly the 256-colour trick.
//     Stage one adds an offset to every index (feFunc type=linear, intercept
//     animated by SMIL across one whole period); stage two looks the shifted
//     index up in a periodic colour table. The shapes never move, only the
//     colours do. One period takes 12 s, four bars of the theme at 80 BPM.
//   * The name is not drawn on top: it lives in the index data. Inside the
//     letters a second copy of the field (half a period out of phase, nudged
//     up and left) is drawn through a second table, the same ramp lifted
//     towards the pale end, so the word is a raised, lighter patch of the
//     same plasma and its bands jump at every edge. A static third PNG adds
//     the chiselled 1-pixel highlight, shade and drop shadow.
//   * The letters are a heavy Roman capital set drawn for this file from
//     polygons, ellipses and a broad-nib pen, rasterised here with 4 x 4
//     supersampling through a perspective homography, so the word leans back.
//   * The hue is rolled per build from the seeded PRNG, the way the original
//     picked its colour scheme at random on start.
//   * Ten pages of white text type themselves out in the top-left corner
//     (SMIL, discrete clip widths, one 6-pixel glyph per step), next to a
//     tiny sprite of her nodding on every beat. The banner loops every 60 s,
//     like the theme: twenty bars of three seconds, five palette cycles.
//   * prefers-reduced-motion: the cycling filters are swapped for frozen
//     copies, the first page is shown complete and she stops nodding.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '22-plasma-embossed-logo_opus_5.5';
const argv = process.argv.slice(2);
const opt = (k, d) => {
  const a = argv.find((s) => s.startsWith(`--${k}=`));
  return a ? a.slice(k.length + 3) : d;
};
const OUT = path.resolve(opt('out', path.join(HERE, '..', 'assets', `${SLUG}.svg`)));
const DEBUG = opt('debug', null);

// ------------------------------------------------------------------ PRNG
function mulberry32(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const SEED = 1992;
const rnd = mulberry32(SEED);

// ------------------------------------------------------------------ screen and clock
const W = 320, H = 100, BAR = 5, PH = H - 2 * BAR; // the plasma is 320 x 90
// Index levels per palette period. 85 = 255 / 3, so one period is exactly a
// third of the filter's 0..1 range: the index image holds 0..84, the offset
// runs 0..1/3, and their sum never leaves the table.
const STEPS = 85;
const PERIOD = STEPS / 255;
const CYCLE = 12; // seconds per palette period: four bars at 80 BPM
const LOOP = 60; // the whole banner: twenty bars, like the theme
const BEAT = 0.75; // 80 BPM
const PAGE = 6; // seconds per text page: two bars

// ------------------------------------------------------------------ palettes
// One hue per roll: near-black, through the hue, to a pale tint.
const ROLLS = {
  crimson: ['#1a0010', '#6e0634', '#d01e6c', '#ff5aa0', '#ffd0e4'],
  green: ['#001a00', '#0b4a0c', '#27a020', '#7dff5a', '#dcffc8'],
  coral: ['#1c0604', '#6a1d10', '#d2492c', '#ff8a66', '#ffe0cc'],
  sun: ['#170e00', '#5c3c00', '#c48a00', '#ffd23a', '#fff4c4'],
  violet: ['#0d0020', '#341070', '#6a3ad0', '#a88aff', '#ece4ff'],
  lagoon: ['#001519', '#04505a', '#0aa4ac', '#4ff0e2', '#d4fff8'],
};
const ROLL_NAMES = Object.keys(ROLLS);
const ROLLED = ROLL_NAMES[Math.floor(rnd() * ROLL_NAMES.length)];
const ROLL = opt('roll', ROLLED);
if (!ROLLS[ROLL]) throw new Error(`unknown roll ${ROLL}; pick one of ${ROLL_NAMES.join(', ')}`);

const hex2 = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const lerp = (a, b, t) => a + (b - a) * t;
function ramp(stops, s) {
  const f = Math.min(0.999999, Math.max(0, s)) * (stops.length - 1);
  const i = Math.floor(f), t = f - i;
  const a = hex2(stops[i]), b = hex2(stops[i + 1]);
  return [0, 1, 2].map((k) => lerp(a[k], b[k], t));
}
// p in [0,1) is a position in one period: darkest at 0, palest at 0.5. The
// letters use the same ramp lifted towards the pale end (`lo`).
function paletteAt(stops, p, lo = 0) {
  const s = 0.5 - 0.5 * Math.cos(2 * Math.PI * p);
  return ramp(stops, lo + (1 - lo) * Math.pow(s, 0.9));
}
const LIFT_LO = 0.4;
const PAL = Array.from({ length: STEPS }, (_, i) => paletteAt(ROLLS[ROLL], i / STEPS));
const PAL_IN = Array.from({ length: STEPS }, (_, i) => paletteAt(ROLLS[ROLL], i / STEPS, LIFT_LO));

// ------------------------------------------------------------------ PNG out
const CRC = new Uint32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = CRC[(c ^ b) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
// colorType 0 = grey, 2 = RGB, 4 = grey+alpha, 6 = RGBA. Each row gets the
// PNG filter (none/sub/up/average/paeth) with the smallest absolute sum.
function png(w, h, colorType, rows) {
  const bpp = { 0: 1, 2: 3, 4: 2, 6: 4 }[colorType];
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = colorType;
  const out = [];
  let prev = new Uint8Array(w * bpp);
  for (const r of rows) {
    const cur = Uint8Array.from(r);
    let best = null, bestSum = Infinity;
    for (let f = 0; f < 5; f++) {
      const line = new Uint8Array(cur.length + 1);
      line[0] = f;
      let sum = 0;
      for (let i = 0; i < cur.length; i++) {
        const a = i >= bpp ? cur[i - bpp] : 0, b = prev[i], c = i >= bpp ? prev[i - bpp] : 0;
        let pred = 0;
        if (f === 1) pred = a;
        else if (f === 2) pred = b;
        else if (f === 3) pred = (a + b) >> 1;
        else if (f === 4) {
          const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
          pred = pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
        }
        const v = (cur[i] - pred) & 255;
        line[i + 1] = v;
        sum += v < 128 ? v : 256 - v;
      }
      if (sum < bestSum) { bestSum = sum; best = line; }
    }
    out.push(best);
    prev = cur;
  }
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(Buffer.concat(out), { level: 9 })), chunk('IEND', Buffer.alloc(0)),
  ]);
}
const dataUri = (buf) => `data:image/png;base64,${buf.toString('base64')}`;

// ------------------------------------------------------------------ letter geometry
// Cap height 100, y down, baseline at y=100. A glyph is a list of ops applied
// in order: ['+', shape] paints, ['-', shape] erases.
const bboxOf = (pts) => {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const [x, y] of pts) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  return [x0, y0, x1, y1];
};
const poly = (pts) => ({ t: 'poly', pts, bb: bboxOf(pts) });
const rect = (x, y, w, h) => poly([[x, y], [x + w, y], [x + w, y + h], [x, y + h]]);
const ell = (cx, cy, rx, ry) => ({ t: 'ell', cx, cy, rx, ry, bb: [cx - rx, cy - ry, cx + rx, cy + ry] });
// A concave bracket at a square inside corner: the b x b square there, minus
// the quarter circle centred on the square's far corner.
const fillet = (x, y, b, dx, dy) => ({
  t: 'fil', x, y, b, cx: x + dx * b, cy: y + dy * b,
  bb: [Math.min(x, x + dx * b), Math.min(y, y + dy * b), Math.max(x, x + dx * b), Math.max(y, y + dy * b)],
});
// A bracket between a slab serif and a slanted stem: the corner where they
// meet, where it ends on the slab and where it ends on the stem; the free
// edge bows in towards the corner.
const bracket = (corner, onSlab, onStem, n = 8) => {
  const pts = [corner, onSlab];
  for (let i = 1; i < n; i++) {
    const t = i / n, u = 1 - t;
    pts.push([0, 1].map((k) => u * u * onSlab[k] + 2 * u * t * corner[k] + t * t * onStem[k]));
  }
  pts.push(onStem);
  return poly(pts);
};
function inPoly(pts, x, y) {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i], [xj, yj] = pts[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
function hit(s, x, y) {
  const [x0, y0, x1, y1] = s.bb;
  if (x < x0 || x > x1 || y < y0 || y > y1) return false;
  if (s.t === 'poly') return inPoly(s.pts, x, y);
  if (s.t === 'ell') return ((x - s.cx) / s.rx) ** 2 + ((y - s.cy) / s.ry) ** 2 <= 1;
  if (s.t === 'fil') return Math.hypot(x - s.cx, y - s.cy) > s.b;
  return false;
}
function hull(points) {
  const p = points.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], up = [];
  for (const q of p) { while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
  for (const q of p.reverse()) { while (up.length >= 2 && cross(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
  return lo.slice(0, -1).concat(up.slice(0, -1));
}
const bez = ([p0, p1, p2, p3], t) => {
  const u = 1 - t;
  return [0, 1].map((k) => u * u * u * p0[k] + 3 * u * u * t * p1[k] + 3 * u * t * t * p2[k] + t * t * t * p3[k]);
};
// A broad-nib pen (a Wn x T rectangle held at `ang` degrees, rising to the
// right) dragged along cubic Beziers: heavy on downstrokes to the right,
// light on the horizontals, which is where Roman capitals got their stress.
function nib(segs, Wn, ang, T, n = 18) {
  const a = (ang * Math.PI) / 180;
  const ux = (Math.cos(a) * Wn) / 2, uy = (-Math.sin(a) * Wn) / 2;
  const vx = (Math.sin(a) * T) / 2, vy = (Math.cos(a) * T) / 2;
  const corners = ([x, y]) => [[x + ux + vx, y + uy + vy], [x + ux - vx, y + uy - vy], [x - ux + vx, y - uy + vy], [x - ux - vx, y - uy - vy]];
  const out = [];
  let prev = null;
  for (const seg of segs) {
    for (let i = 0; i <= n; i++) {
      const p = bez(seg, i / n);
      if (prev) out.push(['+', poly(hull([...corners(prev), ...corners(p)]))]);
      prev = p;
    }
  }
  return out;
}

const G = {};
// C: a fat oval ring, stressed on the left, opened on the right, a beak
// serif on each terminal.
G.C = [
  ['+', ell(43, 50, 41, 51)],
  ['-', ell(49.5, 50, 24.5, 39)],
  ['-', rect(60, 24, 40, 52)],
  ['+', poly([[64, 5.5], [74, 7], [85, 10], [85, 33], [78, 33], [77, 24], [68, 24]])],
  ['+', poly([[64, 94.5], [74, 93], [85, 89], [85, 70], [78, 70], [77, 76], [68, 76]])],
];
// A: hairline left leg, heavy right leg, thin bar, bracketed slab feet.
G.A = [
  ['+', poly([[36, 0], [44, 0], [16, 100], [8, 100]])],
  ['+', poly([[34, 0], [55, 0], [87, 100], [62, 100]])],
  ['+', poly([[26, 0], [36, 0], [36, 6]])],
  ['+', rect(23, 62, 38, 8)],
  ['+', rect(0, 93, 26, 7)],
  ['+', bracket([9.96, 93], [1, 93], [12.5, 84])],
  ['+', bracket([17.96, 93], [25, 93], [19.9, 86])],
  ['+', rect(53, 93, 43, 7)],
  ['+', bracket([60.04, 93], [54, 93], [58.1, 86])],
  ['+', bracket([84.76, 93], [95, 93], [81.9, 84])],
];
// S: one broad-nib stroke, with a beak serif at each end.
G.S = [
  ...nib([
    [[62, 20], [60, 10], [50, 7], [38, 7]],
    [[38, 7], [24, 7], [14, 15], [14, 27]],
    [[14, 27], [14, 41], [27, 46], [38, 50]],
    [[38, 50], [51, 54], [61, 60], [61, 72]],
    [[61, 72], [61, 86], [51, 93], [36, 93]],
    [[36, 93], [22, 93], [13, 88], [10, 80]],
  ], 22, 22, 6),
  ['+', poly([[58, 3.5], [68, 5], [73, 8], [73, 31], [66, 31], [54, 23.5], [65, 20]])],
  ['+', poly([[0, 67], [7, 67], [20, 76.5], [10, 82], [5, 88], [0, 89]])],
];
// T: thin bar with drop serifs, heavy stem, bracketed foot.
G.T = [
  ['+', rect(0, 0, 84, 11)],
  ['+', poly([[0, 0], [10, 0], [10, 13], [6, 31], [2, 31], [0, 27]])],
  ['+', poly([[84, 0], [74, 0], [74, 13], [78, 31], [82, 31], [84, 27]])],
  ['+', rect(31, 0, 22, 100)],
  ['+', rect(16, 93, 52, 7)],
  ['+', fillet(31, 93, 7, -1, -1)],
  ['+', fillet(53, 93, 7, 1, -1)],
];
// W: heavy, hairline, heavy, hairline, slab serifs along the top.
G.W = [
  ['+', poly([[6, 0], [28, 0], [51, 100], [33, 100]])],
  ['+', poly([[44, 100], [51, 100], [67, 0], [60, 0]])],
  ['+', poly([[54, 0], [76, 0], [99, 100], [81, 100]])],
  ['+', poly([[92, 100], [99, 100], [117, 0], [110, 0]])],
  ['+', rect(0, 0, 34, 7)],
  ['+', bracket([7.9, 7], [1, 7], [10.05, 15])],
  ['+', bracket([29.6, 7], [33.5, 7], [31, 13])],
  ['+', rect(50, 0, 34, 7)],
  ['+', bracket([55.9, 7], [50.5, 7], [57.6, 12])],
  ['+', bracket([77.6, 7], [83.5, 7], [79, 13])],
  ['+', rect(103, 0, 22, 7)],
  ['+', bracket([108.7, 7], [103.5, 7], [107.7, 13])],
  ['+', bracket([115.7, 7], [124.5, 7], [114.3, 15])],
];
// Y: heavy left arm, hairline right arm, heavy stem from half way down.
G.Y = [
  ['+', poly([[5, 0], [28, 0], [57, 50], [35, 50]])],
  ['+', poly([[73, 0], [81, 0], [56, 52], [47, 52]])],
  ['+', rect(35, 42, 22, 58)],
  ['+', rect(0, 0, 37, 7)],
  ['+', bracket([9.2, 7], [0.5, 7], [14, 15])],
  ['+', bracket([32.1, 7], [36.5, 7], [34.4, 11])],
  ['+', rect(64, 0, 25, 7)],
  ['+', bracket([69.5, 7], [64.5, 7], [67.5, 11])],
  ['+', bracket([77.6, 7], [88.5, 7], [73.8, 15])],
  ['+', rect(20, 93, 52, 7)],
  ['+', fillet(35, 93, 7, -1, -1)],
  ['+', fillet(57, 93, 7, 1, -1)],
];
for (const k of Object.keys(G)) {
  const bbs = G[k].filter(([op]) => op === '+').map(([, s]) => s.bb);
  G[k] = { ops: G[k], x0: Math.min(...bbs.map((b) => b[0])), x1: Math.max(...bbs.map((b) => b[2])) };
}
function glyphHit(g, x, y) {
  let on = false;
  for (const [op, s] of g.ops) if (hit(s, x, y)) on = op === '+';
  return on;
}

// Lay out the word. Gaps are between ink boxes, in cap-height units; the
// diagonal pairs tuck under each other.
const WORD = 'CASTAWAY';
const GAP = { CA: 3, AS: 4, ST: 4, TA: -12, AW: -13, WA: -13, AY: -12 };
const placed = [];
let LW = 0;
for (let i = 0; i < WORD.length; i++) {
  const g = G[WORD[i]];
  if (i) LW += GAP[WORD[i - 1] + WORD[i]] ?? 5;
  placed.push({ g, ox: LW - g.x0 });
  LW += g.x1 - g.x0;
}
function wordHit(u, v) {
  if (v < -2 || v > 102) return false;
  for (const p of placed) {
    const x = u - p.ox;
    if (x >= p.g.x0 - 1 && x <= p.g.x1 + 1 && glyphHit(p.g, x, v)) return true;
  }
  return false;
}

// ------------------------------------------------------------------ perspective
// The word's plane (0..LW x 0..100) maps onto a trapezoid narrower at the top
// than at the foot, so the letters lean away like a title crawl.
const TRAP = { top: 30, foot: 88, topL: 32, topR: 288, footL: 14, footR: 306 };
function solve(A, b) {
  const n = b.length, M = A.map((r, i) => [...r, b[i]]);
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    [M[c], M[p]] = [M[p], M[c]];
    for (let r = 0; r < n; r++) {
      if (r === c) continue;
      const f = M[r][c] / M[c][c];
      for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k];
    }
  }
  return M.map((r, i) => r[n] / r[i]);
}
function homography(src, dst) {
  const A = [], b = [];
  for (let i = 0; i < 4; i++) {
    const [x, y] = src[i], [X, Y] = dst[i];
    A.push([x, y, 1, 0, 0, 0, -X * x, -X * y]); b.push(X);
    A.push([0, 0, 0, x, y, 1, -Y * x, -Y * y]); b.push(Y);
  }
  return [...solve(A, b), 1];
}
const toPlane = homography(
  [[TRAP.topL, TRAP.top], [TRAP.topR, TRAP.top], [TRAP.footR, TRAP.foot], [TRAP.footL, TRAP.foot]],
  [[0, 0], [LW, 0], [LW, 100], [0, 100]],
);
const proj = (m, x, y) => {
  const w = m[6] * x + m[7] * y + m[8];
  return [(m[0] * x + m[1] * y + m[2]) / w, (m[3] * x + m[4] * y + m[5]) / w];
};

// ------------------------------------------------------------------ the mask
// Word coverage of every plasma pixel (4 x 4 samples), in plasma coordinates:
// y = 0 is the first row under the top letterbox bar.
const SS = 4;
const cover = new Float32Array(W * PH);
for (let y = 0; y < PH; y++) {
  const sy0 = y + BAR;
  if (sy0 < TRAP.top - 2 || sy0 > TRAP.foot + 2) continue;
  for (let x = 0; x < W; x++) {
    let n = 0;
    for (let j = 0; j < SS; j++) {
      for (let i = 0; i < SS; i++) {
        const [u, v] = proj(toPlane, x + (i + 0.5) / SS, sy0 + (j + 0.5) / SS);
        if (wordHit(u, v)) n++;
      }
    }
    cover[y * W + x] = n / (SS * SS);
  }
}
const inside = (x, y) => x >= 0 && y >= 0 && x < W && y < PH && cover[y * W + x] >= 0.5;

// ------------------------------------------------------------------ the field
// The classic sum of sines: two plane waves, two ripples and a slow diagonal,
// computed once. One unit of field = one palette period.
function field(x, y) {
  x *= 0.85; y *= 0.85;
  const a = Math.sin(x / 15.5 + 0.6);
  const b = Math.sin((x * 0.5 + y) / 10.5 + 1.9);
  const c = Math.sin(Math.hypot(x - 200.6, y - 11.9) / 9.0);
  const d = Math.sin(Math.hypot(x - 54.4, y - 62.9) / 11.5 + 0.8);
  const e = Math.sin((x - y * 1.6) / 23.0 + 2.2);
  return (0.7 * (a + b + c + d + e)) / 2.5;
}
// Inside the letters: the second copy, half a period out and nudged.
const lifted = (x, y) => field(x - 4, y - 3) + 0.5;
const frac = (v) => v - Math.floor(v);
const level = (v) => Math.floor(frac(v) * STEPS) % STEPS;
const idxOut = new Uint8Array(W * PH), idxIn = new Uint8Array(W * PH);
for (let y = 0; y < PH; y++) {
  for (let x = 0; x < W; x++) {
    idxOut[y * W + x] = level(field(x, y + BAR));
    idxIn[y * W + x] = level(lifted(x, y + BAR));
  }
}

// ------------------------------------------------------------------ the emboss
// Light from the top left. Inside each letter the rim pixels facing the light
// get a white highlight and the ones facing away a dark shade; outside, a
// dark rim all round and a soft drop shadow down and to the right.
const LIGHT = [-Math.SQRT1_2, -Math.SQRT1_2];
const shadeG = new Uint8Array(W * PH), shadeA = new Uint8Array(W * PH);
const setShade = (k, g, a) => { shadeG[k] = g; shadeA[k] = Math.round(255 * a); };
function edgeVec(x, y, want) {
  let ox = 0, oy = 0;
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if ((dx || dy) && inside(x + dx, y + dy) === want) { ox += dx; oy += dy; }
  return [ox, oy];
}
const ST = { hi: 0.7, lo: 0.55, rim: 0.5, drop: 0.32 };
for (let y = 0; y < PH; y++) {
  for (let x = 0; x < W; x++) {
    const k = y * W + x;
    if (inside(x, y)) {
      const [ox, oy] = edgeVec(x, y, false);
      const len = Math.hypot(ox, oy);
      if (!len) {
        // one pixel further in: a softer highlight, on the lit side only
        if (!inside(x - 2, y - 2) || !inside(x - 1, y - 2) || !inside(x - 2, y - 1)) setShade(k, 255, ST.hi * 0.35);
        continue;
      }
      const s = (ox * LIGHT[0] + oy * LIGHT[1]) / len;
      if (s > 0.2) setShade(k, 255, ST.hi * (0.55 + 0.45 * s));
      else if (s < -0.2) setShade(k, 0, ST.lo * (0.55 + 0.45 * -s));
      else setShade(k, 255, ST.hi * 0.25);
    } else {
      const [ix, iy] = edgeVec(x, y, true);
      if (ix || iy) {
        const len = Math.hypot(ix, iy);
        const s = (ix * LIGHT[0] + iy * LIGHT[1]) / len; // > 0: the letter is up and left of us
        setShade(k, 0, ST.rim * (0.7 + 0.3 * Math.max(0, s)));
      } else if (inside(x - 2, y - 2) || inside(x - 1, y - 2) || inside(x - 2, y - 1)) {
        setShade(k, 0, ST.drop);
      }
    }
  }
}

// ------------------------------------------------------------------ her, tiny
// Top-left corner sprite: sitting, eyes closed, cream headphones, coral top,
// cream shorts, brown hair in a low bun. The head nods on every beat.
const SPR = {
  h: '#5a321e', H: '#82502e', s: '#f2c49c', d: '#cf9670', K: '#6a3a26', m: '#c4705a',
  c: '#f6eedb', C: '#c9b996', t: '#ee6e5a', T: '#c04e3d', w: '#efe3c3', W: '#c3b088',
};
const HEAD = [
  '.....CCCCC....',
  '....CHHhhhC...',
  '...chHhhhhhc..',
  '..CChhhhhhhCC.',
  '..CChsssssdCC.',
  '..CCsKKsKKsCC.',
  '...hssssssd...',
  '...hhsmmsdhhh.',
  '.....dssd..hh.',
];
const BODY = [
  '....tttttt....',
  '...sttttttTs..',
  '..ssttttttTss.',
  '..sdTttttTTds.',
  '..sswwwwwwWss.',
  '.sssswwwwWssss',
  '.dddd....dddd.',
];
function spriteLayer(rows, y0, totalH) {
  const w = rows[0].length;
  const px = Array.from({ length: totalH }, () => new Array(w).fill(null));
  rows.forEach((r, y) => [...r].forEach((ch, x) => { if (ch !== '.') px[y0 + y][x] = SPR[ch]; }));
  return px;
}
// A one-pixel dark outline round a layer, so it reads on any band.
function outlined(px) {
  const h = px.length, w = px[0].length;
  const out = Array.from({ length: h + 2 }, () => new Array(w + 2).fill(null));
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (!px[y][x]) continue;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (!out[y + 1 + dy][x + 1 + dx]) out[y + 1 + dy][x + 1 + dx] = '#120a06';
  }
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (px[y][x]) out[y + 1][x + 1] = px[y][x];
  return out;
}
const rgbaPng = (px) => png(px[0].length, px.length, 6, px.map((r) => r.flatMap((c) => (c ? [...hex2(c), 255] : [0, 0, 0, 0]))));
const headPx = outlined(spriteLayer(HEAD, 0, HEAD.length)).slice(0, -1); // no outline under the neck
const bodyPx = outlined(spriteLayer(BODY, 0, BODY.length));

// ------------------------------------------------------------------ small white font
// 5 x 7 capitals on a 6-pixel advance, each with a dark one-pixel outline.
const FONT5 = {
  A: '.###.|#...#|#...#|#...#|#####|#...#|#...#', B: '####.|#...#|#...#|####.|#...#|#...#|####.',
  C: '.###.|#...#|#....|#....|#....|#...#|.###.', D: '###..|#..#.|#...#|#...#|#...#|#..#.|###..',
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
  Y: '#...#|#...#|#...#|.#.#.|..#..|..#..|..#..', Z: '#####|....#|...#.|..#..|.#...|#....|#####',
  0: '.###.|#...#|#..##|#.#.#|##..#|#...#|.###.', 1: '..#..|.##..|..#..|..#..|..#..|..#..|.###.',
  2: '.###.|#...#|....#|...#.|..#..|.#...|#####', 3: '#####|...#.|..#..|...#.|....#|#...#|.###.',
  4: '...#.|..##.|.#.#.|#..#.|#####|...#.|...#.', 5: '#####|#....|####.|....#|....#|#...#|.###.',
  6: '..##.|.#...|#....|####.|#...#|#...#|.###.', 7: '#####|....#|...#.|..#..|.#...|.#...|.#...',
  8: '.###.|#...#|#...#|.###.|#...#|#...#|.###.', 9: '.###.|#...#|#...#|.####|....#|...#.|.##..',
  '.': '.....|.....|.....|.....|.....|.##..|.##..', ',': '.....|.....|.....|.....|.##..|..#..|.#...',
  ':': '.....|.##..|.##..|.....|.##..|.##..|.....', '-': '.....|.....|.....|#####|.....|.....|.....',
  "'": '..#..|..#..|.#...|.....|.....|.....|.....', '!': '..#..|..#..|..#..|..#..|..#..|.....|..#..',
  '/': '....#|....#|...#.|..#..|.#...|#....|#....', '?': '.###.|#...#|....#|...#.|..#..|.....|..#..',
  '(': '...#.|..#..|.#...|.#...|.#...|..#..|...#.', ')': '.#...|..#..|...#.|...#.|...#.|..#..|.#...',
};
const glyphPath = (cells) => {
  // one rect per horizontal run
  let d = '';
  cells.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      if (!row[x]) { x++; continue; }
      let e = x;
      while (e < row.length && row[e]) e++;
      d += `M${x} ${y}h${e - x}v1h${x - e}z`;
      x = e;
    }
  });
  return d;
};
function glyphSymbol(ch) {
  const rows = FONT5[ch].split('|').map((r) => [...r].map((c) => c === '#'));
  const ring = Array.from({ length: 9 }, (_, y) => Array.from({ length: 7 }, (_, x) => {
    if (rows[y - 1]?.[x - 1]) return false;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (rows[y - 1 + dy]?.[x - 1 + dx]) return true;
    return false;
  }));
  return `<symbol id="g${ch.codePointAt(0)}" overflow="visible"><path class="ko" transform="translate(-1 -1)" d="${glyphPath(ring)}"/><path class="kw" d="${glyphPath(rows)}"/></symbol>`;
}

// ------------------------------------------------------------------ the pages
const TEXT_X = 26, LINE_Y = [9, 18], MAX_COLS = Math.floor((W - 4 - TEXT_X) / 6);
const PAGES = [
  ['CASTAWAY: A TEN-HOUR LO-FI ISLAND VIDEO.', 'SHE IDLES. EVERY SO OFTEN, SOMETHING HAPPENS.'],
  ['THIS PLASMA WAS DRAWN ONCE. ONLY THE COLOURS', 'MOVE. THE VIDEO IS TEN HOURS OF MOSTLY THAT.'],
  ['A MESSAGE IN A BOTTLE WASHES UP.', 'IT WASHES STRAIGHT BACK OUT AGAIN.'],
  ['A COCONUT FALLS ON A HERMIT CRAB.', 'THE COCONUT WALKS OFF. THE CRAB IS WEARING IT.'],
  ['A SHARK IN HEADPHONES NODS TO THE BEAT.', 'EVERY GAG WAITS FOR THE NEXT BAR (3 S).'],
  ['SHE COULD LEAVE ANY TIME. SHE WALKS OUT OVER', 'THE WATER AND COMES BACK WITH AN ICED COFFEE.'],
  ['EVERY SOUND IS SYNTHESIZED FROM CODE.', 'NO SAMPLES, NO RECORDINGS, NO BORROWED LOOPS.'],
  ['THE NAME IS PRESSED IN, LIKE A NAME IN SAND.', `THE TIDE COMES ROUND EVERY ${CYCLE} S. IT STAYS PUT.`],
  [`PALETTE ROLLED WITH SEED ${SEED}: ${ROLL.toUpperCase()}.`, 'SAME SEED, SAME TEN HOURS. ALWAYS DAYTIME.'],
  ['RUN IT: PYTHON TOOLS/SERVE.PY', 'THEN OPEN HTTP://127.0.0.1:8765/ AND WAIT.'],
];
if (PAGES.length * PAGE !== LOOP) throw new Error('pages must fill the loop exactly');
const usedChars = new Set();
for (const p of PAGES) for (const line of p) {
  if (line.length > MAX_COLS) throw new Error(`line too long (${line.length} > ${MAX_COLS}): ${line}`);
  for (const ch of line) if (ch !== ' ') { if (!FONT5[ch]) throw new Error(`no glyph for ${ch}`); usedChars.add(ch); }
}
const CHAR_T = 0.025; // typing speed: forty characters a second
const lineUses = (line) => [...line].map((ch, i) => (ch === ' ' ? '' : `<use href="#g${ch.codePointAt(0)}" x="${TEXT_X + i * 6}"/>`)).join('');
const r5 = (v) => +v.toFixed(5);
function typing(pi, li) {
  const l0 = PAGES[pi][0];
  const start = pi * PAGE + 0.2 + (li ? l0.length * CHAR_T + 0.25 : 0);
  const end = (pi + 1) * PAGE - 0.35;
  const line = PAGES[pi][li];
  const keys = [[0, 0]];
  for (let k = 1; k <= line.length; k++) keys.push([start + k * CHAR_T, k * 6 + 1]);
  keys.push([end, 0]);
  return `<animate attributeName="width" dur="${LOOP}s" repeatCount="indefinite" calcMode="discrete" keyTimes="${keys.map(([t]) => r5(t / LOOP)).join(';')}" values="${keys.map(([, v]) => v).join(';')}"/>`;
}

// ------------------------------------------------------------------ filters
// Stage one: index + offset (animated over one period). Stage two: periodic
// colour tables, three periods of 32 entries across the 0..1 range, so any
// index plus any offset lands on the same colour as one period later.
const TABLE_N = 96;
const tableFor = (pal, ch) => {
  const vals = [];
  for (let k = 0; k <= TABLE_N; k++) {
    const p = frac((k / TABLE_N) / PERIOD); // position within a period
    const c = paletteAt(ROLLS[ROLL], p, pal === PAL_IN ? LIFT_LO : 0)[ch] / 255;
    vals.push(c.toFixed(3).replace(/^0\./, '.').replace(/^1\.000$/, '1'));
  }
  return vals.join(' ');
};
function filter(id, pal, animated) {
  const shift = (f) => `<feFunc${f} type="linear" slope="1" intercept="0">${animated ? `<animate attributeName="intercept" values="0;${PERIOD.toFixed(6)}" dur="${CYCLE}s" repeatCount="indefinite"/>` : ''}</feFunc${f}>`;
  const look = (f, ch) => `<feFunc${f} type="table" tableValues="${tableFor(pal, ch)}"/>`;
  return `<filter id="${id}" x="0" y="0" width="1" height="1" color-interpolation-filters="sRGB">`
    + `<feComponentTransfer>${shift('R')}${shift('G')}${shift('B')}</feComponentTransfer>`
    + `<feComponentTransfer>${look('R', 0)}${look('G', 1)}${look('B', 2)}</feComponentTransfer></filter>`;
}

// ------------------------------------------------------------------ images
const grey = (idx) => Array.from({ length: PH }, (_, y) => Array.from(idx.subarray(y * W, (y + 1) * W), (v) => Math.round((v * 255) / 255)));
const outPng = png(W, PH, 0, grey(idxOut));
// The letters: cropped to their box, grey + alpha.
let bx0 = W, by0 = PH, bx1 = 0, by1 = 0;
for (let y = 0; y < PH; y++) for (let x = 0; x < W; x++) if (inside(x, y)) { bx0 = Math.min(bx0, x); by0 = Math.min(by0, y); bx1 = Math.max(bx1, x); by1 = Math.max(by1, y); }
const inRows = [];
for (let y = by0; y <= by1; y++) {
  const r = [];
  for (let x = bx0; x <= bx1; x++) r.push(idxIn[y * W + x], inside(x, y) ? 255 : 0);
  inRows.push(r);
}
const inPng = png(bx1 - bx0 + 1, by1 - by0 + 1, 4, inRows);
let sx0 = W, sy0 = PH, sx1 = 0, sy1 = 0;
for (let y = 0; y < PH; y++) for (let x = 0; x < W; x++) if (shadeA[y * W + x]) { sx0 = Math.min(sx0, x); sy0 = Math.min(sy0, y); sx1 = Math.max(sx1, x); sy1 = Math.max(sy1, y); }
const shRows = [];
for (let y = sy0; y <= sy1; y++) {
  const r = [];
  for (let x = sx0; x <= sx1; x++) r.push(shadeG[y * W + x], shadeA[y * W + x]);
  shRows.push(r);
}
const shadePng = png(sx1 - sx0 + 1, sy1 - sy0 + 1, 4, shRows);

// ------------------------------------------------------------------ SVG
const SPR_X = 5, SPR_Y = 8; // where the sprite's outline box starts
const desc = 'CASTAWAY, pressed into a full-frame plasma as heavy Roman serif capitals that lean back in perspective. '
  + `The plasma is one hue (${ROLL}): soft bands from near-black to a pale tint that crawl as the palette cycles, while the shapes stay put. `
  + 'The letters are a lighter, raised patch of the same plasma with a chiselled highlight and shadow. Thin black letterbox bars top and bottom. '
  + 'In the top-left corner a tiny sprite of her, sitting in cream headphones and a coral top, nods on every beat, and pages of small white text type themselves out: '
  + PAGES.map((p) => p.join(' ')).join(' ').toLowerCase().replace(/(^|\. )([a-z])/g, (m, a, b) => a + b.toUpperCase());

// The filters are attached with the CSS filter property, so reduced motion
// can swap in the frozen pair without a second copy of the images. Pixelated
// scaling matters: smoothing would blend index 84 into index 0 and draw a
// pale contour wherever the palette wraps.
const css = `
.px{image-rendering:optimizeSpeed;image-rendering:pixelated}
.po{filter:url(#fo)}.pi{filter:url(#fi)}
.ko{fill:#000;fill-opacity:.82}.kw{fill:#fff}
.still{display:none}
.nod{animation:nod ${BEAT}s step-end infinite}
@keyframes nod{0%{transform:translateY(1px)}30%{transform:translateY(0)}}
@media (prefers-reduced-motion:reduce){.po{filter:url(#fo0)}.pi{filter:url(#fi0)}.anim{display:none}.still{display:inline}.nod{animation:none}}
`.trim();

const svg = [];
svg.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W * 3}" height="${H * 3}" role="img" aria-labelledby="t d">`);
svg.push(`<title id="t">CASTAWAY</title><desc id="d">${desc.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</desc>`);
svg.push(`<style>${css}</style>`);
svg.push('<defs>');
svg.push(filter('fo', PAL, true), filter('fi', PAL_IN, true), filter('fo0', PAL, false), filter('fi0', PAL_IN, false));
for (const ch of [...usedChars].sort()) svg.push(glyphSymbol(ch));
PAGES.forEach((p, pi) => p.forEach((line, li) => {
  const base = pi === 0 ? line.length * 6 + 1 : 0; // without SMIL, page one simply shows
  svg.push(`<clipPath id="k${pi}${li}"><rect x="${TEXT_X - 1}" y="${LINE_Y[li] - 1}" width="${base}" height="9">${typing(pi, li)}</rect></clipPath>`);
}));
svg.push(`<clipPath id="round"><rect width="${W}" height="${H}" rx="3"/></clipPath>`);
svg.push('</defs>');
svg.push('<g clip-path="url(#round)">');
svg.push(`<rect width="${W}" height="${H}" fill="#000"/>`);
svg.push(`<g transform="translate(0 ${BAR})">`);
svg.push(`<image class="px po" width="${W}" height="${PH}" preserveAspectRatio="none" href="${dataUri(outPng)}"/>`);
svg.push(`<image class="px pi" x="${bx0}" y="${by0}" width="${bx1 - bx0 + 1}" height="${by1 - by0 + 1}" preserveAspectRatio="none" href="${dataUri(inPng)}"/>`);
svg.push(`<image x="${sx0}" y="${sy0}" width="${sx1 - sx0 + 1}" height="${sy1 - sy0 + 1}" class="px" preserveAspectRatio="none" href="${dataUri(shadePng)}"/>`);
svg.push('</g>');
// her
svg.push(`<image x="${SPR_X}" y="${SPR_Y + HEAD.length}" width="${bodyPx[0].length}" height="${bodyPx.length}" class="px" href="${dataUri(rgbaPng(bodyPx))}"/>`);
svg.push(`<g class="nod"><image x="${SPR_X}" y="${SPR_Y}" width="${headPx[0].length}" height="${headPx.length}" class="px" href="${dataUri(rgbaPng(headPx))}"/></g>`);
// pages
svg.push('<g class="anim">');
PAGES.forEach((p, pi) => p.forEach((line, li) => {
  svg.push(`<g clip-path="url(#k${pi}${li})"><g transform="translate(0 ${LINE_Y[li]})">${lineUses(line)}</g></g>`);
}));
svg.push('</g>');
svg.push('<g class="still">');
PAGES[0].forEach((line, li) => svg.push(`<g transform="translate(0 ${LINE_Y[li]})">${lineUses(line)}</g>`));
svg.push('</g>');
svg.push('</g>');
svg.push('</svg>');
const out = svg.join('\n') + '\n';
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, out);
console.log(`wrote ${path.relative(process.cwd(), OUT)} (${(out.length / 1024).toFixed(1)} KB, roll ${ROLL}${ROLL === ROLLED ? ', as rolled' : ', forced'}; png ${outPng.length}+${inPng.length}+${shadePng.length} bytes)`);

// ------------------------------------------------------------------ --ascii
// The tide table in the README: the palette ring (index 0..84 left to right,
// blank = darkest, full block = palest) at five moments of one period. The
// picture never changes; this row is the only thing that moves.
if (argv.includes('--ascii')) {
  const SH = [' ', '░', '▒', '▓', '█'], cols = 64;
  for (const t of [0, 3, 6, 9, 12]) {
    const shift = Math.round((t / CYCLE) * STEPS);
    let line = '';
    for (let i = 0; i < cols; i++) {
      const g = Math.round((i * (STEPS - 1)) / (cols - 1));
      const p = ((g + shift) % STEPS) / STEPS;
      line += SH[Math.min(4, Math.floor((0.5 - 0.5 * Math.cos(2 * Math.PI * p)) * 5))];
    }
    console.log(`  ${String(t).padStart(2)} s  │${line}│`);
  }
}

// ------------------------------------------------------------------ debug output
if (DEBUG) {
  fs.mkdirSync(DEBUG, { recursive: true });
  const S2 = 3, fw = Math.ceil(LW * S2) + 20, fh = 100 * S2 + 20, rows = [];
  for (let y = 0; y < fh; y++) {
    const r = [];
    for (let x = 0; x < fw; x++) {
      const u = (x - 10) / S2, v = (y - 10) / S2;
      const line = Math.abs(v) < 0.3 || Math.abs(v - 100) < 0.3;
      r.push(...(wordHit(u, v) ? [20, 20, 20] : line ? [230, 120, 120] : [250, 248, 240]));
    }
    rows.push(r);
  }
  fs.writeFileSync(path.join(DEBUG, 'word-flat.png'), png(fw, fh, 2, rows));
  for (const shift of [0, 21, 42, 63]) {
    const Z = 3, o = [];
    for (let y = 0; y < H * Z; y++) {
      const r = [];
      for (let x = 0; x < W * Z; x++) {
        const px = Math.floor(x / Z), py = Math.floor(y / Z) - BAR;
        if (py < 0 || py >= PH) { r.push(0, 0, 0); continue; }
        const k = py * W + px;
        const ins = inside(px, py);
        let c = (ins ? PAL_IN : PAL)[((ins ? idxIn : idxOut)[k] + shift) % STEPS];
        const a = shadeA[k] / 255, g = shadeG[k];
        c = c.map((v) => v * (1 - a) + g * a);
        r.push(...c.map((v) => Math.round(v)));
      }
      o.push(r);
    }
    fs.writeFileSync(path.join(DEBUG, `frame-${shift}.png`), png(W * Z, H * Z, 2, o));
  }
  const big = (px, z) => png(px[0].length * z, px.length * z, 6, Array.from({ length: px.length * z }, (_, y) => px[Math.floor(y / z)].flatMap((c, x) => Array(z).fill(c ? [...hex2(c), 255] : [0, 0, 0, 0]).flat())));
  fs.writeFileSync(path.join(DEBUG, 'sprite-head.png'), big(headPx, 12));
  fs.writeFileSync(path.join(DEBUG, 'sprite-body.png'), big(bodyPx, 12));
  console.log(`debug PNGs in ${DEBUG}`);
}
