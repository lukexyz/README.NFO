// Newschool ASCII header for the Castaway README (style catalogue entry nfo-08).
// Plain Node, no dependencies, deterministic. Run:
//   node examples/castaway/src/45-newschool-ascii_opus_5.5.mjs          (rewrites the .md)
//   ... --dump      also prints the header art      ... --island   prints the island piece
//   ... --small     prints the small heading words
// It rewrites examples/castaway/45-newschool-ascii_opus_5.5.md. Edit this file, not the .md.
//
// The style: PC "newschool" ASCII, the text-only art of the mid-1990s ASCII groups on the PC
// (Katharsis and Remorse 1981 are the credited references, with The Upright Man, Kresile and
// Discyple, and Axel Barebones's tonal texture screens of 1997). Letters are poured solid from
// runs of the dollar sign; stroke tops open with d and b and bottoms close with Y and P, so
// corners look rounded; edges soften into commas, full stops, backticks and quotes used as
// half-height pixels; straight walls alternate l and colon; wedges widen one cell per row
// between a d and a b; and texture is laid with the five-step ramp ; i I S $. A lowercase
// signature and date sit underneath, and bold against normal stands in for the ANSI two-tone.
// None of their letterforms, logos, names or tags is reproduced: the alphabet here is drawn
// from scratch, and the group (sargasso), its pack name (sgso) and the artist tag (brine) are
// invented for this file.
//
// THE PIECE
// CASTAWAY is too long for one 78-column line of ten-row letters, so it is set as CAST over
// AWAY, staggered, with a ramp-shaded sun in the top-right gap, a few deadpan lowercase lines
// set ragged-left along the slope of the first A in the bottom-left gap, and a strip of sea in
// the ramp along the bottom with the signature floated in it. The <details> blocks reuse the
// same alphabet at eight rows for their headings, and the first one holds a larger island
// scene (palm, raft and, to scale, her: one lowercase i).
//
// HOW THE SHAPES ARE MADE
// Every shape (letter, palm, island, raft, sun) is a signed distance field built from tapered
// strokes, arcs, splines and rounded polygons, smooth-unioned so joins swell like liquid. The
// page is sampled four times across and eight times down each character cell (GitHub's 1.45
// line height makes a cell about 2.5 times taller than wide; design units are one column
// across and half a row down). Each cell's four quadrant coverages pick its character: full is
// $, a cell open at the top-left is d, top-right b, bottom-left Y, bottom-right P; half cells
// become s or a quote, side walls l and : by row parity, single quadrants . , ` and '. A shape
// in front carves a one-unit gap around itself out of the shapes behind, which is what keeps
// overlapping letters apart. Tonal areas (the sun, the sea) use the ; i I S $ ramp instead.
// Two-tone: letter cells are bold, except along the lower-right rim of each stroke, which
// stays in normal weight like the shadow side of an ANSI bold/normal logo.
//
// Everything is 7-bit ASCII at most 78 columns wide, so it lines up in every monospace font.
// The script refuses a wider line, a character outside printable ASCII or trailing whitespace.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '45-newschool-ascii_opus_5.5';
const OUT = path.resolve(HERE, '..', `${SLUG}.md`);
const DUMP = process.argv.includes('--dump');
const COLS = 78;

// Counts that move as the project grows, checked read-only in D:/python/castaway on AS_OF:
//   python -B -c "import tomllib; print(len(tomllib.load(open('activities.toml','rb'))['activities']))"
//   python -B -c "import json; print(len(json.load(open('media/audio/audio_catalog.json'))['files']))"
// The copy says "more than 90" and "more than 150" so it ages well; re-check before use.
// Also checked then: [video] fps = 24 (a user decision of 2026-10-01, in MUSING.md), the lanes
// (castaway, cat, turtle, sea_sky, shore, garden) and 31 gags on the rare timer.
const AS_OF = '2026-10-02';
const ACTIVITIES = 94; // of which DEV_ONLY have status = "dev_only" and never come up in a run
const DEV_ONLY = 4;
const SOUND_FILES = 181;
const FPS = 24;

// ---------------------------------------------------------------------------------------------
// 1. Distance-field toolkit. Design units: x = columns, y = rows * K.
// ---------------------------------------------------------------------------------------------
const K = 2.0;
const SX = 4, SY = 8; // samples per cell, across and down
const hyp = Math.hypot;
// mulberry32: a small seeded generator, so the sea comes out the same every run
function prng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

function segD(px, py, [x0, y0, r0, x1, y1, r1]) {
  const dx = x1 - x0, dy = y1 - y0;
  const t = clamp(((px - x0) * dx + (py - y0) * dy) / (dx * dx + dy * dy || 1e-9), 0, 1);
  return hyp(px - (x0 + t * dx), py - (y0 + t * dy)) - (r0 + (r1 - r0) * t);
}
function polyD(px, py, pts, round = 0) {
  let d = Infinity, inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i], [xj, yj] = pts[j];
    const dx = xi - xj, dy = yi - yj;
    const t = clamp(((px - xj) * dx + (py - yj) * dy) / (dx * dx + dy * dy), 0, 1);
    d = Math.min(d, hyp(px - (xj + t * dx), py - (yj + t * dy)));
    if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return (inside ? -d : d) - round;
}
function ellD(px, py, [cx, cy, rx, ry]) {
  return (hyp((px - cx) / rx, (py - cy) / ry) - 1) * Math.min(rx, ry);
}
function smin(a, b, k) {
  if (k <= 0 || !Number.isFinite(a)) return Math.min(a, b);
  const h = clamp(0.5 + (0.5 * (b - a)) / k, 0, 1);
  return b + (a - b) * h - k * h * (1 - h);
}
// An arc of strokes. keys = [[degrees, radius], ...] sets the stroke radius along the sweep.
// Angles are counter-clockwise from +x with y pointing down the page.
function arc(cx, cy, rx, ry, a0, a1, keys, n = 20) {
  const rAt = (a) => {
    for (let i = 0; i < keys.length - 1; i++) {
      const [d0, q0] = keys[i], [d1, q1] = keys[i + 1];
      if ((a - d0) * (a - d1) <= 0) return q0 + ((q1 - q0) * (a - d0)) / (d1 - d0 || 1);
    }
    return keys[keys.length - 1][1];
  };
  const P = (a) => [cx + rx * Math.cos((a * Math.PI) / 180), cy - ry * Math.sin((a * Math.PI) / 180), rAt(a)];
  const out = [];
  for (let i = 0; i < n; i++) {
    const p = P(a0 + ((a1 - a0) * i) / n), q = P(a0 + ((a1 - a0) * (i + 1)) / n);
    out.push({ seg: [p[0], p[1], p[2], q[0], q[1], q[2]] });
  }
  return out;
}
// A stroke along a polyline of [x, y, r] points.
function path3(pts) {
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) out.push({ seg: [...pts[i], ...pts[i + 1]] });
  return out;
}
// A smooth stroke through control points (Catmull-Rom), its radius set by rOf(t), t in 0..1.
function spline(pts, rOf, n = 24) {
  const P = (i) => pts[Math.max(0, Math.min(pts.length - 1, i))];
  const at = (u) => {
    const seg = Math.min(pts.length - 2, Math.floor(u * (pts.length - 1)));
    const t = u * (pts.length - 1) - seg;
    const [p0, p1, p2, p3] = [P(seg - 1), P(seg), P(seg + 1), P(seg + 2)];
    const f = (k) => 0.5 * (2 * p1[k] + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t * t + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t * t * t);
    return [f(0), f(1), rOf(u)];
  };
  const out = [];
  for (let i = 0; i < n; i++) out.push({ seg: [...at(i / n), ...at((i + 1) / n)] });
  return out;
}
function primD(p, x, y) {
  if (p.seg) return segD(x, y, p.seg);
  if (p.poly) return polyD(x, y, p.poly, p.round || 0);
  return ellD(x, y, p.ell);
}
// A shape: parts smooth-unioned, holes cut, optional clip box [x0, y0, x1, y1].
function shapeD(s, x, y) {
  let d = Infinity;
  for (const p of s.parts) d = smin(d, primD(p, x, y), p.k ?? s.k ?? 0.8);
  for (const h of s.holes || []) d = Math.max(d, -primD(h, x, y));
  if (s.clip) {
    const [x0, y0, x1, y1] = s.clip;
    d = Math.max(d, y0 - y, y - y1, x0 - x, x - x1);
  }
  return d;
}

// ---------------------------------------------------------------------------------------------
// 2. The alphabet: heavy rounded capitals, 20 units (10 rows) tall, drawn for this file.
// ---------------------------------------------------------------------------------------------
const GLYPH = {
  C: { w: 13, parts: arc(7, 10, 4.5, 7.6, 38, 324, [[38, 2.8], [60, 2.4], [90, 2.4], [180, 2.9], [270, 2.4], [300, 2.4], [324, 2.7]]) },
  A: { w: 14, parts: [{ poly: [[7, 0.2], [13.7, 13], [13.7, 19.8], [0.3, 19.8], [0.3, 13]], round: 0.3 }],
    holes: [{ poly: [[7, 7.0], [9.0, 11.6], [5.0, 11.6]], round: 0.6 }, { poly: [[5.0, 15.8], [9.0, 15.8], [9.0, 22], [5.0, 22]], round: 0.6 }] },
  S: { w: 13, parts: path3([[11.1, 5.6, 1.8], [10.7, 3.7, 2.1], [9.0, 2.4, 2.4], [6.4, 2.2, 2.4], [4.0, 2.7, 2.4], [2.6, 4.8, 2.5],
    [3.0, 7.3, 2.5], [5.4, 9.1, 2.4], [8.4, 10.6, 2.4], [10.4, 12.8, 2.5], [10.4, 15.8, 2.5], [8.4, 17.6, 2.4], [5.0, 17.6, 2.4], [2.8, 16.2, 2.2], [2.4, 14.8, 1.9]]), k: 0.5 },
  T: { w: 12, parts: [{ poly: [[0.9, 0.9], [11.1, 0.9], [11.1, 3.2], [0.9, 3.2]], round: 0.9 }, { seg: [6, 3, 2.4, 6, 17.6, 2.4] }], k: 1.2 },
  W: { w: 18, parts: [
    { seg: [2.4, 2.2, 2.2, 5.0, 17.8, 2.2] }, { seg: [9, 6.0, 1.8, 5.0, 17.8, 2.2] },
    { seg: [9, 6.0, 1.8, 13.0, 17.8, 2.2] }, { seg: [15.6, 2.2, 2.2, 13.0, 17.8, 2.2] }] },
  Y: { w: 14, parts: [{ seg: [2.6, 2.4, 2.3, 7, 10.5, 2.4] }, { seg: [11.4, 2.4, 2.3, 7, 10.5, 2.4] }, { seg: [7, 10, 2.5, 7, 17.6, 2.4] }] },
  // G starts its arc higher than C and drops its bar lower, so the mouth stays open at eight rows
  G: { w: 13, parts: [...arc(7, 10, 4.5, 7.6, 50, 350, [[50, 2.6], [90, 2.4], [180, 2.9], [270, 2.4], [350, 2.4]]),
    { seg: [8.2, 12.0, 1.9, 11.3, 12.0, 2.1] }, { seg: [11.3, 12.0, 2.2, 11.3, 15.2, 2.3] }] },
  I: { w: 6, parts: [{ seg: [3, 2.4, 2.6, 3, 17.6, 2.6] }] },
  O: { w: 14, parts: arc(7, 10, 4.6, 7.6, 0, 360, [[0, 2.6], [90, 2.4], [180, 2.6], [270, 2.4], [360, 2.6]], 28) },
  U: { w: 14, parts: [{ seg: [2.6, 2.4, 2.4, 2.6, 12, 2.5] }, { seg: [11.4, 2.4, 2.4, 11.4, 12, 2.5] },
    ...arc(7, 12, 4.4, 5.6, 180, 360, [[180, 2.5], [270, 2.4], [360, 2.5]], 14)] },
  N: { w: 14, parts: [{ seg: [2.6, 2.4, 2.4, 2.6, 17.6, 2.4] }, { seg: [11.4, 2.4, 2.4, 11.4, 17.6, 2.4] }, { seg: [2.6, 2.4, 2.4, 11.4, 17.6, 2.4] }] },
  D: { w: 14, parts: [{ seg: [2.6, 2.4, 2.4, 2.6, 17.6, 2.4] }, { seg: [2.6, 2.4, 2.4, 6.5, 2.4, 2.4] }, { seg: [2.6, 17.6, 2.4, 6.5, 17.6, 2.4] },
    ...arc(6.5, 10, 4.9, 7.6, 90, -90, [[90, 2.4], [0, 2.6], [-90, 2.4]], 16)] },
  R: { w: 14, parts: [{ seg: [2.6, 2.4, 2.4, 2.6, 17.6, 2.4] }, { seg: [2.6, 2.4, 2.4, 7, 2.4, 2.4] }, { seg: [2.6, 10.4, 2.3, 7, 10.4, 2.3] },
    ...arc(7, 6.4, 4.2, 4.0, 90, -90, [[90, 2.4], [0, 2.5], [-90, 2.3]], 12), { seg: [7, 10.4, 2.3, 11.4, 17.6, 2.5] }] },
  // V as two swelling strokes rather than a notched wedge: at eight rows the wedge came out lopsided
  V: { w: 14, parts: [{ seg: [2.6, 2.4, 2.5, 7, 17.4, 2.5] }, { seg: [11.4, 2.4, 2.5, 7, 17.4, 2.5] }], k: 0.6 },
  E: { w: 12, parts: [{ poly: [[0.3, 0.3], [11.7, 0.3], [11.7, 4.4], [5.4, 4.4], [5.4, 7.8], [10.2, 7.8], [10.2, 12.2], [5.4, 12.2],
    [5.4, 15.6], [11.7, 15.6], [11.7, 19.7], [0.3, 19.7]], round: 0.3 }] },
};
// The small headings use a stouter A and W: a flat-topped apex and a thicker crossbar, which would
// otherwise thin out to a row of full stops at eight rows tall.
GLYPH.a = { w: 14, parts: [{ poly: [[6.0, 0.2], [8.0, 0.2], [13.7, 12], [13.7, 19.8], [0.3, 19.8], [0.3, 12]], round: 0.3 }],
  holes: [{ poly: [[7, 5.6], [9.2, 10.4], [4.8, 10.4]], round: 0.6 }, { poly: [[5.0, 16.2], [9.0, 16.2], [9.0, 22], [5.0, 22]], round: 0.6 }] };
GLYPH.w = { w: 18, parts: [
  { seg: [2.4, 2.2, 2.2, 5.0, 17.8, 2.2] }, { seg: [9, 4.2, 2.3, 5.0, 17.8, 2.2] },
  { seg: [9, 4.2, 2.3, 13.0, 17.8, 2.2] }, { seg: [15.6, 2.2, 2.2, 13.0, 17.8, 2.2] }] };
for (const g of Object.values(GLYPH)) g.clip = [-1, 0, g.w + 1, 20];

// ---------------------------------------------------------------------------------------------
// 3. A scene: a list of objects, each a distance function plus a bounding box. Later objects sit
//    in front and carve a gap (in design units) out of whatever is behind them.
// ---------------------------------------------------------------------------------------------
function makeScene() {
  const objs = [];
  const add = (o) => (objs.push({ gap: 1.0, tag: 'n', ...o }), o);
  return {
    objs,
    add,
    // A letter at column x, row `row`, scaled by sc (1 = ten rows tall).
    glyph(ch, x, row, tag = 'L', sc = 1, gap = 1.0) {
      const g = GLYPH[ch];
      const y0 = row * K;
      return add({ tag, gap, box: [x - 2, y0 - 2, x + g.w * sc + 2, y0 + 20 * sc + 2],
        d: (gx, gy) => shapeD(g, (gx - x) / sc, (gy - y0) / sc) * sc });
    },
    // kern: columns to pull each following letter in by (one number for all, or one per gap)
    word(w, x, row, kern = 1, tag = 'L', sc = 1) {
      [...w].forEach((ch, i) => {
        this.glyph(ch, x, row, tag, sc);
        x += Math.round(GLYPH[ch].w * sc) - (Array.isArray(kern) ? kern[i] ?? 0 : kern);
      });
      return x;
    },
    shape(s, tag = 'n', gap = 1.0, box = null) {
      return add({ tag, gap, box: box || [-1e9, -1e9, 1e9, 1e9], d: (gx, gy) => shapeD(s, gx, gy) });
    },
  };
}

// Rasterise: per sample, which object owns it (-1 none, -2 carved gap).
function rasterise(scene, rows) {
  const W = COLS * SX, Hs = rows * SY;
  const own = new Int16Array(W * Hs).fill(-1);
  const { objs } = scene;
  for (let j = 0; j < Hs; j++) {
    const gy = ((j + 0.5) / SY) * K;
    for (let i = 0; i < W; i++) {
      const gx = (i + 0.5) / SX;
      for (let n = objs.length - 1; n >= 0; n--) {
        const o = objs[n];
        if (gx < o.box[0] || gx > o.box[2] || gy < o.box[1] || gy > o.box[3]) continue;
        const d = o.d(gx, gy);
        if (d < 0) { own[j * W + i] = n; break; }
        if (d < o.gap) { own[j * W + i] = -2; break; }
      }
    }
  }
  return { own, W, rows };
}

// One cell: quadrant coverage [tl, tr, bl, br], how much of it is gap, and its main owner.
function cellInfo(R, c, r) {
  const { own, W } = R;
  const v = [0, 0, 0, 0];
  let gap = 0;
  const count = new Map();
  for (let j = 0; j < SY; j++) for (let i = 0; i < SX; i++) {
    const o = own[(r * SY + j) * W + c * SX + i];
    if (o >= 0) { v[(j < SY / 2 ? 0 : 2) + (i < SX / 2 ? 0 : 1)]++; count.set(o, (count.get(o) || 0) + 1); }
    else if (o === -2) gap++;
  }
  const n = (SX * SY) / 4;
  let best = -1, bestN = 0;
  for (const [o, m] of count) if (m > bestN) { best = o; bestN = m; }
  return { q: v.map((x) => x / n), gap: gap / (SX * SY), owner: best };
}

// The newschool edge alphabet.
function edgeChar([tl, tr, bl, br], r) {
  const tot = (tl + tr + bl + br) / 4;
  if (tot < 0.06) return ' ';
  const T = 0.45;
  const pat = (tl >= T ? 8 : 0) + (tr >= T ? 4 : 0) + (bl >= T ? 2 : 0) + (br >= T ? 1 : 0);
  switch (pat) {
    case 15: return '$';
    case 7: return 'd';
    case 11: return 'b';
    case 13: return 'Y';
    case 14: return 'P';
    case 3: return tot > 0.4 ? 's' : '.';
    case 12: return tot > 0.25 ? '"' : "'";
    case 5: return r % 2 ? ':' : 'l';
    case 10: return r % 2 ? 'l' : ':';
    case 1: return tr + bl > 0.4 ? 'd' : '.';
    case 2: return tl + br > 0.4 ? 'b' : ',';
    case 4: return tl + br > 0.4 ? 'Y' : '`';
    case 8: return tr + bl > 0.4 ? 'P' : "'";
    case 6: return bl > tr ? 'd' : 'P';
    case 9: return tl > br ? 'b' : 'Y';
    default: return '.';
  }
}

// Render a scene to rows of {ch, tag}. `bg(c, r)` may supply texture for empty, uncarved cells.
const RIM = [1.2, 1.6]; // how far down and right the shadow test looks, in design units
function renderScene(scene, rows, bg = null) {
  const R = rasterise(scene, rows);
  const grid = [];
  for (let r = 0; r < rows; r++) {
    const line = [];
    for (let c = 0; c < COLS; c++) {
      const info = cellInfo(R, c, r);
      const o = info.owner >= 0 ? scene.objs[info.owner] : null;
      let ch = edgeChar(info.q, r);
      let tag = o ? o.tag : 'n';
      if (o && o.shade && ch !== ' ') ch = o.shade(c, r, ch);
      if (ch === ' ' && info.gap < 0.2 && bg) { const t = bg(c, r); if (t) { ch = t; tag = 'bg'; } }
      // Two-tone: a letter cell whose neighbour down and to the right is outside the letter is
      // on the shadow rim, and is set in normal weight; the rest of the letter is bold.
      let rim = false;
      if (o && tag === 'L' && ch !== ' ') rim = o.d(c + 0.5 + RIM[0], (r + 0.5) * K + RIM[1]) > -0.3;
      line.push({ ch, tag, rim });
    }
    grid.push(line);
  }
  return grid;
}

// ---------------------------------------------------------------------------------------------
// 4. The main piece.
// ---------------------------------------------------------------------------------------------
function mainPiece() {
  const S = makeScene();
  // The sun, top right: a disc shaded with the five-step ramp, densest in the middle.
  const sun = { cx: 66.5, cy: 8.6, r: 7.6 };
  S.add({ tag: 'sun', gap: 1.0, box: [50, -4, 80, 22], d: (x, y) => hyp(x - sun.cx, y - sun.cy) - sun.r,
    shade: (c, r) => {
      const d = hyp(c + 0.5 - sun.cx, (r + 0.5) * K - sun.cy) / sun.r;
      return d < 0.42 ? '$' : d < 0.62 ? 'S' : d < 0.8 ? 'I' : d < 0.93 ? 'i' : ';';
    } });
  // The word, in two lines: CAST up top, AWAY below it and to the right. The first A sits a
  // column clear of the C and carves a wider gap out of it, so the C's lower tail keeps its own
  // shape and stops short of the A's crossbar instead of reading as a G joined to the A.
  const cast = S.objs.length;
  S.word('CAST', 1, 0, [-1, -1, 0]);
  S.objs[cast + 1].gap = 2.0; // the A
  S.word('AWAY', 21, 11, 1);
  const grid = renderScene(S, 23);
  // A calm strip of sea under everything, and the signature set into it.
  seaStrip(grid, [[21, 0.55], [22, 1]], 1992);
  const sig = ' brine/sgso . o1.1o.2o26 ';
  stamp(grid, [sig], COLS - sig.length - 2, 22, 'txt', true);
  // The bottom-left corner holds a few lowercase lines, set ragged left along the A's slope.
  POEM.forEach(([text, row]) => {
    const end = 19 + Math.max(0, 16 - row); // the A's slope leaves more room higher up
    stamp(grid, [text], end - text.length, row, 'txt');
  });
  return grid;
}
const POEM = [
  ['ten hours.', 12], ['one island.', 13], ['one palm.', 14], ['one raft.', 15],
  ['nearly nothing', 17], ['happens.', 18], ['on purpose.', 19],
];

// Waves in the five-step ramp: runs that swell in the middle, a few to a row. Fills only empty
// cells, so it never paints over a shape.
function seaStrip(grid, rows, seed) {
  const rnd = prng(seed);
  for (const [row, dens] of rows) {
    let c = Math.floor(rnd() * 4);
    while (c < COLS) {
      const len = 3 + Math.floor(rnd() * 9);
      const peak = dens * (0.45 + rnd() * 0.55);
      for (let k = 0; k < len && c + k < COLS; k++) {
        const t = Math.sin((Math.PI * (k + 0.5)) / len) * peak;
        if (grid[row][c + k].ch === ' ') grid[row][c + k] = { ch: t < 0.18 ? '.' : t < 0.4 ? ';' : t < 0.62 ? 'i' : t < 0.85 ? 'I' : 'S', tag: 'sea' };
      }
      c += len + 1 + Math.floor(rnd() * 4);
    }
  }
}
function stamp(grid, lines, c0, r0, tag, opaque = false) {
  lines.forEach((l, i) => {
    if (opaque) for (let k = 0; k < l.length; k++) grid[r0 + i][c0 + k] = { ch: ' ', tag };
    if (c0 + l.length > COLS) throw new Error(`stamp row ${i} runs past column ${COLS}`);
    for (let k = 0; k < l.length; k++) if (l[k] !== ' ') grid[r0 + i][c0 + k] = { ch: l[k], tag };
  });
}

// ---------------------------------------------------------------------------------------------
// 5. Output helpers.
// ---------------------------------------------------------------------------------------------
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function gridToHtml(grid, isBold) {
  return grid.map((line) => {
    let out = '', run = '', bold = false;
    const flush = () => { if (run) out += bold ? `<b>${esc(run)}</b>` : esc(run); run = ''; };
    // trailing spaces never count
    let end = line.length;
    while (end > 0 && line[end - 1].ch === ' ') end--;
    for (let i = 0; i < end; i++) {
      const b = line[i].ch !== ' ' && isBold(line[i]);
      const { ch } = line[i];
      if (b !== bold && ch !== ' ') { flush(); bold = b; }
      run += ch;
    }
    flush();
    return out;
  });
}
const plain = (grid) => grid.map((l) => l.map((x) => x.ch).join('').replace(/\s+$/, ''));

function islandPiece() {
  const S = makeScene();
  const ROWS = 17;
  // raft, moored off the right-hand beach: logs, so every third column is a seam
  S.add({ tag: 'raft', gap: 1.0, box: [50, 20, 78, 34], d: (x, y) => polyD(x, y, [[59, 28.6], [71, 28.6], [72.2, 31.0], [57.8, 31.0]], 0.5),
    shade: (c, r, ch) => (ch === '$' && c % 3 === 1 ? ':' : ch) });
  // island and trunk in one shape, so the trunk grows out of the sand with a fillet
  const trunk = [[40, 29, 2.3], [39.4, 25, 2.1], [37.8, 21, 1.9], [35.6, 17.5, 1.8], [33.4, 14.2, 1.7], [31.6, 12.2, 1.6]];
  S.shape({ parts: [{ ell: [34, 34.2, 22, 6.2], k: 0 }, ...path3(trunk)], clip: [0, -10, 78, 31.8], k: 1.6 }, 'palm', 1.0);
  // the crown: every frond in one shape, so fronds part where they part and never carve each
  // other. Two long fronds arch out (the right one higher) with leaflets hanging from their
  // undersides; two short ones hang down either side of the trunk. Earlier, fuller crowns read
  // as an umbrella: the gaps between fronds are what make it a palm.
  const C0 = [31, 10.4];
  const frondR = (big) => (t) => 0.3 + big * Math.pow(Math.sin(Math.PI * Math.pow(t, 0.7)), 0.8);
  const fronds = [
    [[[25.6, 4.8], [17.4, 3.4], [10.4, 6.0], [6.0, 11.8]], 1.6, -1], // upper left, arching low
    [[[27.4, 13.6], [23.4, 16.6], [20.6, 21.2]], 1.2, 0],          // lower left, hanging
    [[[36.4, 3.2], [44.4, 1.2], [51.8, 3.4], [57.0, 8.6]], 1.6, 1],  // upper right, arching high
    [[[36.6, 12.6], [41.8, 15.2], [45.2, 20.0]], 1.2, 0],          // lower right, clear of the trunk
  ];
  const parts = [];
  fronds.forEach(([pts, big, out]) => {
    const f = spline([C0, ...pts], frondR(big), 28);
    parts.push(...f);
    if (!out) return;
    // leaflets, longest mid-frond
    for (const i of [8, 11, 14, 17, 20, 23]) {
      const [x0, y0, r0] = f[i].seg;
      const len = 2.0 + 1.2 * Math.sin((Math.PI * (i - 6)) / 20);
      parts.push({ seg: [x0, y0 + r0 * 0.4, 0.55, x0 + out * 1.2, y0 + r0 + len, 0.25], k: 0.2 });
    }
  });
  parts.push({ ell: [29.8, 12.6, 1.4, 1.3] }, { ell: [32.6, 12.8, 1.4, 1.3] }); // coconuts
  S.shape({ parts, k: 0.3 }, 'palm', 1.0);
  for (const o of S.objs) o.box = o.box || [-1e9, -1e9, 1e9, 1e9];
  const grid = renderScene(S, ROWS);
  seaStrip(grid, [[15, 0.5], [16, 1]], 7);
  // her, to scale: one lowercase i, nodding, with a label so nobody misses her
  stamp(grid, ['her, idling -->'], 13, 13, 'txt', true);
  stamp(grid, [' i '], 30, 13, 'her', true);
  return grid;
}
if (process.argv.includes('--island')) console.log(plain(islandPiece()).join('\n'));

// A small heading word, eight rows tall, from the same alphabet.
function title(word) {
  const S = makeScene();
  S.word(word.replace(/A/g, 'a').replace(/W/g, 'w'), 2, 0, -1, 'L', 0.8);
  return renderScene(S, 8);
}

// ---------------------------------------------------------------------------------------------
// 6. The words. Text lines inside <pre> blocks: {path} becomes a link to that file (or URL).
// ---------------------------------------------------------------------------------------------
function textLines(t) {
  return t.replace(/^\n/, '').replace(/\n\s*$/, '').split('\n').map((l) =>
    esc(l).replace(/\{([^}]+)\}/g, (m, href) => `<a href="${href}">${href}</a>`));
}
const visible = (h) => h.replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
function pre(lines) {
  lines.forEach((l, i) => {
    const v = visible(l);
    if (v.length > COLS) throw new Error(`pre line ${i + 1} is ${v.length} columns: ${v}`);
    if (/\s$/.test(v)) throw new Error(`pre line ${i + 1} has trailing whitespace: ${v}`);
    if (/[^\x20-\x7e]/.test(v)) throw new Error(`pre line ${i + 1} has a character outside printable ASCII: ${v}`);
  });
  return `<pre>\n${lines.join('\n')}\n</pre>`;
}
// Bold: the letters (but not their shadow rim), her, and the two densest steps of the sun.
const html = (grid) => gridToHtml(grid, ({ ch, tag, rim }) =>
  (tag === 'L' && !rim) || tag === 'her' || (tag === 'sun' && (ch === '$' || ch === 'S')));

const art = mainPiece();
if (DUMP) console.log(plain(art).join('\n'));
if (process.argv.includes('--small')) {
  for (const w of ['GAGS', 'WAIT', 'SOUND', 'RUN', 'WAVE']) console.log(plain(title(w)).join('\n'));
}
const DOLLARS = plain(art).join('').split('$').length - 1;
const thousands = (n) => String(n).replace(/\B(?=(\d{3})+$)/g, ',');

// The schedule chart: one mark per five events in a typical run (the file's own medians).
const TIERS = [
  ['regular', '2 to 5 minutes', 155, 'i'],
  ['occasional', '12 to 25 minutes', 30, 'I'],
  ['rare', '30 to 60 minutes', 13, 'S'],
  ['super rare', '3 to 6 hours, max 3', 2, '$'],
  ['chained', 'straight after another', 20, ';'],
];
const chart = TIERS.map(([name, every, n, ch]) =>
  `  ${name.padEnd(12)}${every.padEnd(24)}~${String(n).padEnd(5)}${ch.repeat(Math.max(1, Math.round(n / 5)))}`).join('\n');

const FENCE = '```';
const md = `<!-- Header ${SLUG} for Castaway. Generated by src/${SLUG}.mjs: edit that, not this. -->

${pre(html(art))}

**Castaway** (working title) is a ten-hour lo-fi video for YouTube in which a young woman sits on a very small island with one tall palm and a raft, nods to the music on her headphones, and waits. Every so often something happens. Then she goes back to nodding. It is an unofficial remake inspired by the small-island routines and visual comedy of *Johnny Castaway*, the 1992 desert-island screensaver: an oldschool idea, made new, sunny, hand-painted and always daytime.

About 90 activities take turns, most of them on four timers that go off anywhere from every couple of minutes to once every few hours. A message in a bottle washes straight back. A drone delivers a parcel, and the parcel is another pair of headphones. A shark in headphones nods along. A coconut falls on a hermit crab, then walks off with the crab wearing it. Every gag starts on the next bar of the music, so it lands on the beat. Ten hours is 12,000 bars, and she is busy for about a third of them.

The header above is drawn with ${thousands(DOLLARS)} dollar signs, and none of them went on samples: every sound, from the kalimba to the vinyl crackle to the sea, is synthesized from code by [tools/make_audio.py](tools/make_audio.py), so no third-party licence applies.

${FENCE}sh
python tools/serve.py      # then open http://127.0.0.1:8765/
${FENCE}

<p><sub>The renderer is a web page with a live preview that exports a YouTube-ready MP4. In development: no video has been published yet. She is used to waiting.</sub></p>

<details>
<summary><b>the set</b>: one island, one palm, one raft, and her</summary>

${pre([...html(islandPiece()), '', ...textLines(`
  the whole cast, to scale. she is the lowercase i. the frame is 16:9,
  1080p at ${FPS} frames a second, it is always daytime, and the camera never
  moves: everything that happens, happens in this one shot.`)])}

</details>

<details>
<summary><b>gags</b>: what interrupts the nodding, inked by rarity</summary>

${pre([...html(title('GAGS')), '', ...textLines(String.raw`
  the rarer it is, the more ink it gets. the mark is the timer that
  picks it:
    i goes off every 2 to 5 min       I every 12 to 25 min
    S every 30 to 60 min              $ every 3 to 6 hours, 3 a run at most
    ; no timer: only ever straight after another

  $  she could leave any time    walks out over the water and comes back
                                 with an iced coffee. the island says nothing
  $  waving for rescue           once in a very long while
  S  delivery drone              the parcel is another pair of headphones
  S  stray cat                   grey tabby, white chest. arrives on a crate,
                                 climbs the palm, naps, and one day floats
                                 away again. another day, it comes back
  S  shark                       wears headphones. nods to the beat
  S  signal hunt                 one bar of signal, at the top of the palm
  S  tour boat                   a boatload of selfie-takers
  S  hydrofoil bro               a shaka, and he carves off
  S  bushcraft                   fire by friction, a hammock, a lookout up
                                 the palm, spear fishing
  I  message in a bottle         washes straight back
  ;  a different bottle          brings a reply, hours later
  I  sea turtle                  swims in and dozes off beside her
  I  coconut                     lands on a hermit crab, then walks off with
                                 the crab wearing it
  I  kumara                      planted once, grows over the video
  i  everyday                    coconut sipping, fishing, jogging laps, and
                                 a sandcastle that the tide takes

  the S timer has far more gags than turns, so most S gags sit out any
  given ten hours. they wait. everyone here waits.`)])}

</details>

<details>
<summary><b>wait</b>: the schedule, four timers and 12,000 bars</summary>

${pre([...html(title('WAIT')), '', ...textLines(`
  10:00:00 of video, seed 1992, in 12,000 bars of exactly 3 seconds. every
  activity starts on the next bar, so every gag lands on the beat.

  tier        comes round every       typical run
${chart}
                                            one mark is about five events

  typical is the median of 200 simulated runs, as {activities.toml} says.
  it lists more than 90 activities (${ACTIVITIES} on ${AS_OF}, ${DEV_ONLY} of them for
  development only). she is busy about a third of the time and idles for
  the rest: nodding, mostly.

  lanes let things overlap. she has one; the cat, the turtle, the sea and
  sky, the shore and the kumara patch each have their own. so a visit
  from the cat can go on for a while, and she gets on with her day
  around it.

  scene life: 26 entries, 4 always on and 22 timed. shore waves and
  drifting cloud shadows are in; distant birds, planes with vapour trails,
  whale pods, dolphins, sailboats, sandpipers, a gecko, a rain shower and
  a nest in the palm that has chicks hours later are on the way.

  python {tools/schedule.py}       validates it all, simulates a 10-hour run`)])}

</details>

<details>
<summary><b>sound</b>: more than 150 files, no samples, no listeners yet</summary>

${pre([...html(title('SOUND')), '', ...textLines(`
  samples ........ 0     every sound is synthesized from code by
  loop packs ..... 0     {tools/make_audio.py}, so no third-party licence
  recordings ..... 0     applies. more than 150 files (${SOUND_FILES} on ${AS_OF}),
  licences owed .. 0     and counting.

  the theme       a seamless 60-second loop at 80 BPM in F major: ii-V-I-vi,
                  20 bars of exactly 3 seconds, on electric piano, a kalimba
                  lead, soft drums and vinyl crackle
  the sea         a seamless 60-second loop as well
  the mix         -14 LUFS, true peak at or below -1 dBTP. levels are set in
                  master and per routine
  reviews         none yet. nobody has listened to it`)])}

</details>

<details>
<summary><b>run</b>: the renderer and the tools</summary>

${pre([...html(title('RUN')), '', ...textLines(`
  python {tools/serve.py}         then open {http://127.0.0.1:8765/} for the
                                live preview, and export a YouTube-ready MP4
                                from the same page
  python {tools/schedule.py}      validate the schedule, simulate ten hours
  python {tools/render_demo.py} --dev
                                a dev reel of every activity with a heads-up
                                display (the older Python reference renderer)

  the page, {web/index.html}, is plain ES modules: no build step, no npm
  packages. the browser encodes frame-exact H.264 with WebCodecs (timed at
  68 to 78 frames a second at 1080p30 in Chrome), and the server mixes in
  the sound and joins the two into one MP4. hard cuts and stepped movement
  are the motion defaults. the notes, the decisions and the lessons live
  in {MUSING.md}.`)])}

</details>

<details>
<summary><b>wave</b>: greetz, respect and the small print</summary>

${pre([...html(title('WAVE')), '', ...textLines(`
  waves to the hermit crab, who wears a coconut well. to the grey tabby,
  who travels by crate. to the shark, for keeping the headphones on. to the
  turtle, for the visit. to the drone, for the spare pair. to the kumara,
  for growing, which is more than most of us managed today. to the
  hydrofoil bro: shaka returned. and to the tide, for taking the sandcastle
  every single time.

  castaway is an unofficial remake inspired by johnny castaway, the 1992
  screensaver. it has its own character, art and music, and is not
  affiliated with that screensaver or with its owners.

  the header is drawn in the manner of 1990s pc newschool ascii: letters
  poured from dollar signs, corners rounded with d, b, Y and P, edges
  softened with punctuation, and texture in the ramp ; i I S $. every
  letter, the sun, the palm and the waves were drawn for this file, and
  sargasso (sgso for short) and brine are made up. ${thousands(DOLLARS)} dollar signs up
  top, and not one of them was spent.

                                         brine/sgso . o1.1o.2o26`)])}

</details>
`;
if (/—/.test(md)) throw new Error('no em dashes');
fs.writeFileSync(OUT, md);
console.log(`wrote ${path.relative(process.cwd(), OUT)} (${DOLLARS} dollar signs in the header)`);
