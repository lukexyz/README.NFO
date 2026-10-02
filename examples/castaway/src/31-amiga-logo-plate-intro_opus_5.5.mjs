// "Amiga logo-plate intro" README banner for CASTAWAY.
//
//   node examples/castaway/src/31-amiga-logo-plate-intro_opus_5.5.mjs
//   node examples/castaway/src/31-amiga-logo-plate-intro_opus_5.5.mjs --at=13 --out=some/dir
//
// Regenerates ../assets/31-amiga-logo-plate-intro_opus_5.5.svg (the intro)
// and ../assets/31-amiga-logo-plate-intro_opus_5.5-textpage.svg (the text
// page). Plain Node, no deps, deterministic (no clock, no Math.random). --at
// bakes a head start (in seconds) into every animation so later pages can be
// checked without waiting; use it only together with --out, never in place.
//
// The style: the framed two-panel Amiga intro of 1990-91 (catalogue entry
// c64-05, after Sector9's work for a Norwegian group's Amiga section). On
// black, a short mid-grey strip holds a small logo plate: a dark capsule with
// a chrome rim and red outlined capitals with white highlights, a small bar
// ornament either side. Under a pair of thin light-blue rules, a tall navy
// panel carries three lines of wide, slanted, rounded capitals whose fill is
// one horizontal rainbow, between dashed rainbow rules, with a four-point
// star at each end of the first line. The rainbow cycles, the letters wave.
// The text-page variant is the second file: dense 8-pixel capitals on dark
// blue, in blocks tinted magenta, white, orange and light blue.
//
// Nothing of the original is copied: no group name, wordmark, letterform or
// release wording. Both fonts, the plate lettering and every word are drawn
// and written here. Where the original's text page said who supplied the
// release, this one says the tide did. It also takes things back.
//
// How the SVG does it
//   * Rainbow letters are rasterised from stroke skeletons with an elliptical
//     pen (so the capitals come out rounded), sheared for the slant, merged
//     into pixel runs, and filled from ONE userSpaceOnUse linearGradient with
//     48 hard 12-bit steps across the panel width. Each letter is its own
//     path at its real x, so the gradient runs across the whole line instead
//     of restarting in every letter. A discrete SMIL translate on the
//     gradient moves it one step every quarter second: colour cycling.
//   * Each letter sits in two nested groups: the outer one folds it in and
//     out (scaleY about the line's centre) when the page changes, staggered
//     left to right; the inner one bobs it up and down in whole pixels, one
//     sine wave per bar of the theme (3 s), phased by x. The middle line runs
//     in opposite phase, as the originals alternated.
//   * Pages change every two bars (6 s), eight pages, 48 s per loop, and page
//     one is fully in place at time zero, so the first frame already reads.
//   * prefers-reduced-motion stops every CSS animation, hides pages 2 to 8
//     and swaps the letters to a static copy of the gradient (CSS can't stop
//     SMIL, but it can stop using it).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const arg = (name) => {
  const hit = process.argv.slice(2).find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : null;
};
const T0 = Number(arg('at') || 0);
const OUTDIR = arg('out') ? path.resolve(arg('out')) : path.resolve(here, '../assets');
// --scale only changes the intrinsic width/height (for close-up checks)
const SCALE = Number(arg('scale') || 2);
const SLUG = '31-amiga-logo-plate-intro_opus_5.5';

const n = (v, d = 3) => String(+(+v).toFixed(d));
const dly = (s) => `${n(s - T0, 3)}s`;

// 12-bit Amiga colours, written the way the copper list would: 'F80'.
const c12 = (s) => '#' + [...s].map((h) => h + h).join('').toLowerCase();

// ------------------------------------------------------------------ pixels
const key = (x, y) => `${x},${y}`;
const unkey = (k) => k.split(',').map(Number);
// Merge pixels into horizontal runs, stack identical runs into rects, emit
// one path. ox/oy offset.
function pathOf(set, ox = 0, oy = 0) {
  const rows = new Map();
  for (const k of set) {
    const [x, y] = unkey(k);
    if (!rows.has(y)) rows.set(y, []);
    rows.get(y).push(x);
  }
  const runs = [];
  for (const [y, xs] of rows) {
    xs.sort((a, b) => a - b);
    let st = xs[0];
    let p = xs[0];
    for (let i = 1; i <= xs.length; i++) {
      if (i < xs.length && xs[i] === p + 1) { p = xs[i]; continue; }
      runs.push([st, p + 1, y]);
      if (i < xs.length) { st = xs[i]; p = xs[i]; }
    }
  }
  runs.sort((a, b) => a[2] - b[2] || a[0] - b[0]);
  const live = new Set(runs.map((r) => `${r[0]},${r[1]},${r[2]}`));
  const out = [];
  let cx = 0;
  let cy = 0;
  let first = true;
  for (const r of runs) {
    const k0 = `${r[0]},${r[1]},${r[2]}`;
    if (!live.has(k0)) continue;
    live.delete(k0);
    let h = 1;
    while (live.has(`${r[0]},${r[1]},${r[2] + h}`)) { live.delete(`${r[0]},${r[1]},${r[2] + h}`); h++; }
    const x = ox + r[0];
    const y = oy + r[2];
    const w = r[1] - r[0];
    // relative moves keep the path short; the subpath closes back to its start
    out.push(first ? `M${n(x)} ${n(y)}` : `m${n(x - cx)} ${n(y - cy)}`);
    out.push(`h${w}v${h}h${-w}z`);
    cx = x; cy = y; first = false;
  }
  return out.join('');
}
// The same pixels as one-pixel-high stroked runs ("M x y.5 h w"): about a
// third shorter than rects for the slanted letters, whose rows rarely stack.
// Draw with stroke-width 1 and no fill.
function runsOf(set, ox = 0, oy = 0) {
  const rows = new Map();
  for (const k of set) {
    const [x, y] = unkey(k);
    if (!rows.has(y)) rows.set(y, []);
    rows.get(y).push(x);
  }
  const out = [];
  let px = null;
  let py = null;
  for (const y of [...rows.keys()].sort((a, b) => a - b)) {
    const xs = rows.get(y).sort((a, b) => a - b);
    let st = xs[0];
    for (let i = 1; i <= xs.length; i++) {
      if (i < xs.length && xs[i] === xs[i - 1] + 1) continue;
      const end = xs[i - 1] + 1;
      const ax = ox + st;
      const ay = oy + y + 0.5;
      out.push(px === null ? `M${n(ax)} ${n(ay)}` : `m${n(ax - px)} ${n(ay - py)}`);
      out.push(`h${end - st}`);
      px = ox + end; py = ay;
      if (i < xs.length) st = xs[i];
    }
  }
  return out.join('').replace(/ -/g, '-');
}
// Group a Map(key -> colour) into one path per colour.
function pathsByColour(map, ox = 0, oy = 0, attr = (c) => `fill="${c}"`) {
  const by = new Map();
  for (const [k, c] of map) {
    if (!by.has(c)) by.set(c, new Set());
    by.get(c).add(k);
  }
  return [...by].map(([c, set]) => `<path ${attr(c)} d="${pathOf(set, ox, oy)}"/>`).join('');
}

// ------------------------------------------------------------------ strokes
// A glyph is a list of strokes; a stroke is "x,y x,y* x,y ...", where a
// trailing * rounds that corner with a fillet. Strokes are rasterised with an
// elliptical pen (rx, ry): a pixel is set when its centre is within the pen
// of the skeleton. slant shears the result (top leans right).
function expandStroke(spec, R) {
  const pts = spec.trim().split(/\s+/).map((t) => {
    const round = t.endsWith('*');
    const [x, y] = t.replace('*', '').split(',').map(Number);
    return { x, y, round };
  });
  const out = [];
  pts.forEach((p, i) => {
    if (!p.round || i === 0 || i === pts.length - 1) { out.push([p.x, p.y]); return; }
    const a = pts[i - 1];
    const b = pts[i + 1];
    const la = Math.hypot(a.x - p.x, a.y - p.y);
    const lb = Math.hypot(b.x - p.x, b.y - p.y);
    const ta = Math.min(R / la, 0.5);
    const tb = Math.min(R / lb, 0.5);
    const p1 = [p.x + (a.x - p.x) * ta, p.y + (a.y - p.y) * ta];
    const p2 = [p.x + (b.x - p.x) * tb, p.y + (b.y - p.y) * tb];
    const N = 8;
    for (let k = 0; k <= N; k++) {
      const t = k / N;
      const u = 1 - t;
      out.push([u * u * p1[0] + 2 * u * t * p.x + t * t * p2[0], u * u * p1[1] + 2 * u * t * p.y + t * t * p2[1]]);
    }
  });
  return out;
}
function segDist2(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const L = dx * dx + dy * dy;
  let t = L ? ((px - ax) * dx + (py - ay) * dy) / L : 0;
  t = Math.max(0, Math.min(1, t));
  const qx = ax + t * dx - px;
  const qy = ay + t * dy - py;
  return qx * qx + qy * qy;
}
function rasterGlyph(g, pen) {
  const { rx, ry, slant, H, R } = pen;
  const polys = g.s.map((s) => expandStroke(s, R).map(([x, y]) => [x / rx, y / ry]));
  const set = new Set();
  const lean = Math.ceil(slant * H);
  for (let y = -2; y < H + 3; y++) {
    for (let x = -2; x < g.w + lean + 2; x++) {
      const cy = y + 0.5;
      const cx = x + 0.5 - slant * (H - cy);
      const px = cx / rx;
      const py = cy / ry;
      let hit = false;
      for (const poly of polys) {
        if (poly.length === 1) {
          if ((poly[0][0] - px) ** 2 + (poly[0][1] - py) ** 2 <= 1.0001) { hit = true; break; }
        }
        for (let i = 0; i + 1 < poly.length; i++) {
          if (segDist2(px, py, poly[i][0], poly[i][1], poly[i + 1][0], poly[i + 1][1]) <= 1.0001) { hit = true; break; }
        }
        if (hit) break;
      }
      if (hit) set.add(key(x, y));
    }
  }
  return set;
}

// ------------------------------------------------------------------ rainbow font
// Wide, slanted, rounded capitals, 15 pixels high. Skeleton coordinates are
// pixels: stems are centred 2 px in from the glyph edge (the pen is 4 px
// wide), bars at y 1.5 / 7.5 / 13.5 (the pen is 3 px tall). w is the glyph's
// unslanted width; the slant adds about 4 px at the top.
const RB = {
  A: { w: 14, s: ['2,13.5 2,1.5* 12,1.5* 12,13.5', '2,7.5 12,7.5'] },
  B: { w: 14, s: ['2,1.5 2,13.5', '2,1.5 10,1.5* 10,7.5* 2,7.5', '2,7.5 12,7.5* 12,13.5* 2,13.5'] },
  C: { w: 14, s: ['12,1.5 2,1.5* 2,13.5* 12,13.5'] },
  D: { w: 14, s: ['2,1.5 2,13.5 12,13.5* 12,1.5* 2,1.5'] },
  E: { w: 14, s: ['12,1.5 2,1.5* 2,13.5* 12,13.5', '2,7.5 10,7.5'] },
  F: { w: 14, s: ['12,1.5 2,1.5* 2,13.5', '2,7.5 10,7.5'] },
  G: { w: 14, s: ['12,1.5 2,1.5* 2,13.5* 12,13.5* 12,7.5 7,7.5'] },
  H: { w: 14, s: ['2,1.5 2,13.5', '12,1.5 12,13.5', '2,7.5 12,7.5'] },
  I: { w: 4, s: ['2,1.5 2,13.5'] },
  J: { w: 14, s: ['12,1.5 12,13.5* 2,13.5* 2,9.5'] },
  K: { w: 14, s: ['2,1.5 2,13.5', '2,7.5 6,7.5* 12,1.5', '6,7.5 12,13.5'] },
  L: { w: 13, s: ['2,1.5 2,13.5* 12,13.5'] },
  M: { w: 18, s: ['2,13.5 2,1.5* 16,1.5* 16,13.5', '9,1.5 9,10.5'] },
  N: { w: 14, s: ['2,13.5 2,1.5 12,13.5 12,1.5'] },
  O: { w: 14, s: ['2,7.5 2,1.5* 12,1.5* 12,13.5* 2,13.5* 2,7.5'] },
  P: { w: 14, s: ['2,13.5 2,1.5 12,1.5* 12,7.5* 2,7.5'] },
  Q: { w: 15, s: ['2,7.5 2,1.5* 12,1.5* 12,13.5* 2,13.5* 2,7.5', '8,10 13,14.5'] },
  R: { w: 14, s: ['2,13.5 2,1.5 12,1.5* 12,7.5* 2,7.5', '8,7.5 12,13.5'] },
  S: { w: 14, s: ['12,1.5 2,1.5* 2,7.5* 12,7.5* 12,13.5* 2,13.5'] },
  T: { w: 14, s: ['1,1.5 13,1.5', '7,1.5 7,13.5'] },
  U: { w: 14, s: ['2,1.5 2,13.5* 12,13.5* 12,1.5'] },
  V: { w: 14, s: ['2,1.5 7,13.5 12,1.5'] },
  W: { w: 18, s: ['2,1.5 2,13.5* 16,13.5* 16,1.5', '9,4.5 9,13.5'] },
  X: { w: 14, s: ['2,1.5 12,13.5', '12,1.5 2,13.5'] },
  Y: { w: 14, s: ['2,1.5 7,7.5 12,1.5', '7,7.5 7,13.5'] },
  Z: { w: 14, s: ['2,1.5 12,1.5 2,13.5 12,13.5'] },
  0: { w: 13, s: ['2,7.5 2,1.5* 11,1.5* 11,13.5* 2,13.5* 2,7.5', '9,4 4,11'] },
  1: { w: 8, s: ['1.5,4 5,1.5 5,13.5'] },
  2: { w: 14, s: ['2,1.5 12,1.5* 12,7.5* 2,7.5* 2,13.5 12,13.5'] },
  3: { w: 14, s: ['2,1.5 12,1.5* 12,13.5* 2,13.5', '5,7.5 12,7.5'] },
  4: { w: 14, s: ['2,1.5 2,8.5* 12,8.5', '10,3.5 10,13.5'] },
  5: { w: 14, s: ['12,1.5 2,1.5 2,7.5 12,7.5* 12,13.5* 2,13.5'] },
  6: { w: 14, s: ['12,1.5 2,1.5* 2,13.5* 12,13.5* 12,7.5* 2,7.5'] },
  7: { w: 14, s: ['2,1.5 12,1.5* 12,4.5 7,13.5'] },
  8: { w: 14, s: ['2,7.5 2,1.5* 12,1.5* 12,13.5* 2,13.5* 2,7.5', '2,7.5 12,7.5'] },
  9: { w: 14, s: ['12,7.5 2,7.5* 2,1.5* 12,1.5* 12,13.5* 2,13.5'] },
  '.': { w: 4, s: ['2,12.5 2,13.5'] },
  ',': { w: 5, s: ['3,12.5 1.5,15.5'] },
  ':': { w: 4, s: ['2,4 2,5', '2,12.5 2,13.5'] },
  '!': { w: 4, s: ['2,1.5 2,8.5', '2,12.5 2,13.5'] },
  '?': { w: 14, s: ['2,1.5 12,1.5* 12,7.5* 7,7.5* 7,8.5', '7,12.5 7,13.5'] },
  '-': { w: 10, s: ['2,7.5 8,7.5'] },
  '+': { w: 12, s: ['2,7.5 10,7.5', '6,4 6,11'] },
  '/': { w: 12, s: ['10,1.5 2,13.5'] },
  "'": { w: 4, s: ['2,1.5 2,4.5'] },
  '(': { w: 8, s: ['6,1.5 2,1.5* 2,13.5* 6,13.5'] },
  ')': { w: 8, s: ['2,1.5 6,1.5* 6,13.5* 2,13.5'] },
  ' ': { w: 6, s: [] },
};
const RB_PEN = { rx: 2, ry: 1.5, slant: 0.25, H: 15, R: 4 };
const RB_GAP = 2;
const RB_SET = new Map();
const rbGlyph = (ch) => {
  if (!RB[ch]) throw new Error(`rainbow font has no "${ch}"`);
  if (!RB_SET.has(ch)) RB_SET.set(ch, RB[ch].s.length ? rasterGlyph(RB[ch], RB_PEN) : new Set());
  return RB_SET.get(ch);
};
const rbWidth = (str) => [...str].reduce((a, ch) => a + RB[ch].w + RB_GAP, -RB_GAP) + Math.ceil(RB_PEN.slant * RB_PEN.H);

// ------------------------------------------------------------------ plate lettering
// Heavier, upright capitals for the logo plate: 16 high, stems 5 px, bars
// 4 px, square-ish with soft corners. Only the letters of the name.
const PL = {
  C: { w: 17, s: ['14.5,2 2.5,2* 2.5,14* 14.5,14'] },
  A: { w: 17, s: ['2.5,15 2.5,2* 14.5,2* 14.5,15', '2.5,8.5 14.5,8.5'] },
  S: { w: 17, s: ['14.5,2 2.5,2* 2.5,8* 14.5,8* 14.5,14* 2.5,14'] },
  T: { w: 17, s: ['1,2 16,2', '8.5,2 8.5,15'] },
  W: { w: 23, s: ['2.5,1 2.5,14* 20.5,14* 20.5,1', '11.5,5 11.5,14'] },
  Y: { w: 17, s: ['2.5,1 2.5,6* 14.5,6*', '14.5,1 14.5,14* 2.5,14'] },
};
const PL_PEN = { rx: 2.5, ry: 2, slant: 0, H: 16, R: 4 };

// ------------------------------------------------------------------ palette
const P = {
  black: '#000000',
  rule: c12('8BF'),
  ruleDim: c12('469'),
  grey: [c12('BBB'), c12('AAA'), c12('999'), c12('888'), c12('888'), c12('777'), c12('666')],
  navy: [c12('002'), c12('003'), c12('004'), c12('005'), c12('005'), c12('004'), c12('003'), c12('002')],
  star: c12('9CF'),
  starHi: c12('FFF'),
};
// The rainbow: 24 hand-picked 12-bit hues, kept light in the blues so every
// step stays readable on navy, then doubled to 48 steps by quantised
// in-betweens. (Pure yellow, FF0, arrives as the in-between of FE0 and EF0.)
const RING24 = ['F00', 'F40', 'F70', 'FA0', 'FC0', 'FE0', 'EF0', 'CF0', '9F0', '5F2', '0F5', '0F9',
  '0FC', '0EF', '2CF', '4AF', '69F', '88F', 'A7F', 'C6F', 'E5E', 'F4B', 'F38', 'F24'];
const hex3 = (s) => [...s].map((h) => parseInt(h, 16));
const RING = [];
RING24.forEach((c, i) => {
  const a = hex3(c);
  const b = hex3(RING24[(i + 1) % 24]);
  RING.push(c12(c));
  RING.push(c12(a.map((v, j) => Math.round((v + b[j]) / 2).toString(16)).join('')));
});
// the README promises 48 different colours; hold it to that
if (new Set(RING).size !== RING.length) throw new Error('the rainbow repeats a colour');

// ------------------------------------------------------------------ banner geometry
const W = 384;
const BEAT = 0.75;         // 80 BPM
const BAR = 4 * BEAT;      // 3 s: every activity starts on one of these
const PAGE = 2 * BAR;      // 6 s per page
const STEP = 8;            // rainbow step width (px)
const PERIOD = RING.length * STEP; // 384: one rainbow across the panel
const STEP_T = 0.25;       // one colour step every quarter second

const Y_RULE1 = 6;
const Y_STRIP = 8;
const STRIP_H = 40;
const Y_RULE2 = Y_STRIP + STRIP_H + 1; // 49
const Y_NAVY = Y_RULE2 + 3;            // 52
const NAVY_H = 98;
const LINE_Y = [Y_NAVY + 18, Y_NAVY + 42, Y_NAVY + 66]; // tops of the 15-px lines
const DASH_Y = [Y_NAVY + 7, Y_NAVY + NAVY_H - 9];
const Y_RULE3 = Y_NAVY + NAVY_H + 1;
const H = Y_RULE3 + 2 + 6;

// ------------------------------------------------------------------ the words
// Eight pages, two bars each. Page one is the pitch, so the first frame reads.
const PAGES = [
  ['A TEN-HOUR LO-FI', 'ISLAND VIDEO IN WHICH', 'VERY LITTLE HAPPENS.'],
  ['SHE IDLES. SHE NODS.', 'AND EVERY SO OFTEN', 'SOMETHING HAPPENS.'],
  ['A BOTTLE COMES BACK.', 'A DRONE DELIVERS', 'MORE HEADPHONES.'],
  ['A COCONUT FALLS.', 'IT WALKS OFF', 'WITH A CRAB INSIDE.'],
  ['90+ ACTIVITIES.', '4 TIMERS. EACH ONE', 'STARTS ON THE BAR.'],
  ['EVERY SOUND IS CODE.', 'NO SAMPLES. 80 BPM.', 'F MAJOR. NO SEAMS.'],
  ['PYTHON TOOLS/SERVE.PY', 'OPEN 127.0.0.1:8765', 'AND WAIT. CALMLY.'],
  ['SUPPLIED BY THE TIDE.', 'RETURNED BY THE TIDE.', 'ALWAYS DAYTIME.'],
];
const CYCLE = PAGES.length * PAGE; // 48 s
const FOLD = 0.25;                 // one letter folds in this long
const FOLD_STAGGER = 0.022;        // per 8-px column, left to right
const WAVE_AMP = 2;

// ------------------------------------------------------------------ banner: rainbow lines
const glyphDefs = [];
let defN = 0;
const rainbowLines = [];
const foldClasses = new Set();
const waveClasses = new Set();
let widest = 0;
PAGES.forEach((lines, pi) => {
  const parts = [];
  lines.forEach((str, li) => {
    const wpx = rbWidth(str);
    widest = Math.max(widest, wpx);
    let x = Math.round((W - wpx) / 2);
    const g = [];
    for (const ch of str) {
      const set = rbGlyph(ch);
      if (set.size) {
        const id = `q${(defN++).toString(36)}`;
        glyphDefs.push(`<path id="${id}" d="${runsOf(set, x, -7.5)}"/>`);
        const col = Math.max(0, Math.floor((x + 6) / 8));
        const wb = (Math.floor((x + 6) / 8) + (li === 1 ? 12 : 0)) % 24;
        foldClasses.add(col);
        waveClasses.add(wb);
        g.push(`<g class="k${pi} s${col}"><g class="w${wb}"><use href="#${id}" class="h"/><use href="#${id}"/></g></g>`);
      }
      x += RB[ch].w + RB_GAP;
    }
    parts.push(`<g transform="translate(0 ${LINE_Y[li] + 7.5})">${g.join('')}</g>`);
  });
  rainbowLines.push(`<g class="pg${pi} t">${parts.join('')}</g>`);
});
if (widest > W - 40) throw new Error(`a rainbow line is ${widest}px wide; keep it under ${W - 40}`);

// ------------------------------------------------------------------ banner: plate
function plateWordmark(word) {
  let x = 0;
  const set = new Set();
  for (const ch of word) {
    const s = rasterGlyph(PL[ch], PL_PEN);
    for (const k of s) {
      const [gx, gy] = unkey(k);
      set.add(key(gx + x, gy));
    }
    x += PL[ch].w + 3;
  }
  return { set, w: x - 3 };
}
const WM = plateWordmark('CASTAWAY');
// Shading: rows from bright red-pink at the top to deep red at the bottom
// (12-bit steps), white on every top edge, pale pink on left edges in the
// upper half, then a one-pixel dark outline round the lot.
function shadeWordmark(set) {
  let minY = Infinity;
  let maxY = -Infinity;
  for (const k of set) { const y = unkey(k)[1]; minY = Math.min(minY, y); maxY = Math.max(maxY, y); }
  const ramp = ['F99', 'F66', 'F44', 'F22', 'E00', 'E00', 'D00', 'C00', 'C00', 'B00', 'A00', 'A00', '900', '800', '700', '600'].map(c12);
  const out = new Map();
  for (const k of set) {
    const [x, y] = unkey(k);
    const t = (y - minY) / Math.max(1, maxY - minY);
    let c = ramp[Math.min(ramp.length - 1, Math.floor(t * ramp.length))];
    if (!set.has(key(x, y - 1))) c = c12('FFF');
    else if (!set.has(key(x - 1, y)) && t < 0.55) c = c12('FCC');
    else if (!set.has(key(x + 1, y)) || !set.has(key(x, y + 1))) c = c12('500');
    out.set(k, c);
  }
  for (const k of set) {
    const [x, y] = unkey(k);
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const kk = key(x + dx, y + dy);
        if (!set.has(kk) && !out.has(kk)) out.set(kk, c12('200'));
      }
    }
  }
  // a drop shadow, down and right, on the plate's dark face
  for (const k of set) {
    const [x, y] = unkey(k);
    const kk = key(x + 2, y + 2);
    if (!out.has(kk)) out.set(kk, '#000000');
  }
  return out;
}
// The capsule: rounded ends, a 3-px chrome rim in a sky-over-ground ramp, a
// one-pixel black edge, and a dark face.
// Is pixel (x, y) inside a w x h rounded rectangle of corner radius r, shrunk
// by inset on every side?
function insideRR(x, y, w, h, r, inset) {
  const cx = x + 0.5;
  const cy = y + 0.5;
  const rr = Math.max(0.5, r - inset);
  if (cx < inset || cx > w - inset || cy < inset || cy > h - inset) return false;
  const ex = Math.min(Math.max(cx, inset + rr), w - inset - rr);
  const ey = Math.min(Math.max(cy, inset + rr), h - inset - rr);
  return (cx - ex) ** 2 + (cy - ey) ** 2 <= rr * rr;
}
function capsule(w, h, r = h / 2) {
  const inside = (x, y, inset) => insideRR(x, y, w, h, r, inset);
  const chrome = ['FFF', 'EEF', 'DDE', 'CCE', 'BBD', 'AAC', '99B', '88A', '779', '668', '557', '446',
    '335', '224', '335', '446', '557', '668', '779', '88A', '99B', 'AAC'].map(c12);
  const face = ['223', '223', '112', '112', '112', '001', '001', '001', '000', '000'].map(c12);
  const out = new Map();
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!inside(x, y, 0)) continue;
      let c;
      if (!inside(x, y, 1)) c = '#000000';
      else if (!inside(x, y, 4)) {
        const t = y / (h - 1);
        c = chrome[Math.min(chrome.length - 1, Math.floor(t * chrome.length))];
        // a hot spot on the upper left of the rim
        if (y < h * 0.3 && x < w * 0.35 && x > r * 0.4) c = c12('FFF');
      } else if (!inside(x, y, 5)) c = c12('000');
      else {
        const t = (y - 5) / (h - 10);
        c = face[Math.min(face.length - 1, Math.max(0, Math.floor(t * face.length)))];
      }
      out.set(key(x, y), c);
    }
  }
  return out;
}
const PLATE_H = 32;
const PLATE_W = WM.w + 2 * 22;
const PLATE_X = Math.round((W - PLATE_W) / 2);
const PLATE_Y = Y_STRIP + Math.round((STRIP_H - PLATE_H) / 2);
const WM_X = PLATE_X + Math.round((PLATE_W - WM.w) / 2);
const WM_Y = PLATE_Y + 8;
const plateSvg = pathsByColour(capsule(PLATE_W, PLATE_H), PLATE_X, PLATE_Y);
const wmShaded = shadeWordmark(WM.set);
const wordmarkSvg = pathsByColour(wmShaded, WM_X, WM_Y);
// the glint that sweeps the letters once every two bars
const wmClip = `<clipPath id="wmc"><path d="${pathOf(WM.set, WM_X, WM_Y)}"/></clipPath>`;

// Bar ornaments either side: three light-blue chrome bars, longest nearest
// the plate, each with a dark grey shadow.
function ornament(side) {
  const out = new Map();
  const lens = [20, 14, 8];
  const rows = [c12('EFF'), c12('9CF'), c12('47A')];
  lens.forEach((len, i) => {
    const y0 = PLATE_Y + 10 + i * 5;
    const at = (x) => (side < 0 ? PLATE_X - 4 - x : PLATE_X + PLATE_W + 3 + x);
    for (let dy = 0; dy < 3; dy++) {
      for (let x = 0; x < len; x++) {
        if (x === len - 1 && dy !== 1) continue; // rounded far end
        out.set(key(at(x), y0 + dy), rows[dy]);
      }
    }
    for (let x = 0; x < len; x++) {
      const kk = key(at(x) + 1, y0 + 3);
      if (!out.has(kk)) out.set(kk, c12('555'));
    }
  });
  return out;
}
const ornamentSvg = pathsByColour(new Map([...ornament(-1), ...ornament(1)]));

// ------------------------------------------------------------------ banner: the two windows
// Two small 16:9 windows in the grey strip, framed in the plate's chrome:
// on the left the island itself (one tall palm, a raft, and her, nodding to
// the music on her headphones), on the right the shark, surfaced in its
// headphones and nodding along. Both nod on every beat of the theme.
// 49 x 32 with a 5-px frame leaves a 39 x 22 picture: 16:9 to the pixel.
const WIN_W = 49;
const WIN_H = 32;
const WIN_Y = Y_STRIP + Math.round((STRIP_H - WIN_H) / 2);
const WIN_X = [12, W - 12 - WIN_W];
const PAL = {
  L: c12('9E5'), G: c12('4B3'), g: c12('283'), T: c12('B86'), t: c12('754'), c: c12('542'),
  e: c12('FEC'), E: c12('FFE'), b: c12('421'), h: c12('742'), s: c12('FCA'), k: c12('EB9'),
  r: c12('F75'), R: c12('C54'), w: c12('FED'), f: c12('FCA'),
  F: c12('79A'), d: c12('567'), D: c12('456'), K: c12('223'), W: c12('FFF'), o: c12('EFF'), n: c12('FFF'),
  P: c12('A64'), p: c12('753'), N: c12('236'),
};
function sprite(map, rows, ox, oy) {
  rows.forEach((r, y) => [...r].forEach((ch, x) => { if (ch !== '.') map.set(key(ox + x, oy + y), PAL[ch]); }));
  return map;
}
const PALM = [
  '......LLLL......',
  '...LLLGGGGLLL...',
  '.LLGGGgggGGGLL..',
  'LGGg..TccTg.gGGL',
  'Gg...gTtc..g..gG',
  'g...g.Tt....g..g',
  '......Tt........',
  '.....Tt.........',
  '.....Tt.........',
  '.....Tt.........',
  '....Tt..........',
  '....Tt..........',
  '....Tt..........',
  '...Tt...........',
  '...Tt...........',
];
const HER_HEAD = [
  '..eee.',
  '.hheh.',
  'bhhEss',
  'bhhEss',
  '..hhs.',
];
const HER_BODY = [
  '..rrr.....',
  '..rrrss...',
  '..rRrsk...',
  '..wwwkkk..',
  '..wwww.kk.',
  '........kf',
];
const RAFT = ['PPPPPPP', 'ppppppp'];
const CLOUD = ['..WW....', '.WWWWW..', 'WWWWWWWW'];
// the shark, surfaced and facing us, fin up behind, headphones on: two
// eyes, and a grin with its teeth showing (it is enjoying the track)
const FIN = [
  '........F........',
  '........Fd.......',
  '.......FFd.......',
  '.......FFdd......',
  '....KKKKKKKKK....',
  '...KeeeeeeeeeK...',
  '..KeKFFKFFKddKeK.',
  '..KeKFFFFFdddKeK.',
  '.KEEEKKFFFdKKEEEK',
  '.KEEEKFWWWWdKEEEK',
  '.KEEEKFKKKKdKEEEK',
  '..KKKFFFFFdddKKK.',
  '..FFFFFFFFddddd..',
  '.FFFFFFFFFdddddd.',
  'FFFFFFFFFFddddddd',
];
// music notes in deep navy, so they read against the pale sky
const NOTE = ['..NN', '..NN', '..N.', 'NNN.', 'NNN.'];
const NOTE2 = ['.NNNN', '.N..N', '.N..N', 'NN.NN', 'NN.NN'];
// The scene inside a window, in window-local pixels; returns the still part
// and the part that nods.
function windowScene(kind) {
  const still = new Map();
  const nod = new Map();
  const ix = 4;
  const iy = 4;
  const sky = ['6BF', '6BF', '7CF', '7CF', '8CF', '8CF', '9DF', '9DF', 'ADF', 'BEF', 'BEF'].map(c12);
  const sea = ['2AD', '2AD', '29C', '29C', '29C', '28B', '28B', '28B', '17A', '17A', '17A', '16A', '16A'].map(c12);
  for (let y = 0; y < 24; y++) {
    for (let x = 0; x < 40; x++) {
      still.set(key(ix + x, iy + y), y < 11 ? sky[y] : sea[y - 11]);
    }
  }
  // glints on the water
  [[3, 13], [9, 15], [33, 14], [24, 22], [36, 20], [16, 21], [5, 19]].forEach(([x, y]) => {
    still.set(key(ix + x, iy + y), c12('BEF'));
    still.set(key(ix + x + 1, iy + y), c12('BEF'));
  });
  if (kind === 'island') {
    sprite(still, CLOUD, ix + 27, iy + 2);
    // sand
    const sand = [[16, 8, 25], [17, 6, 27], [18, 5, 29], [19, 4, 30], [20, 4, 31]];
    for (const [y, x0, x1] of sand) {
      for (let x = x0; x <= x1; x++) still.set(key(ix + x, iy + y), y === 20 ? c12('DB8') : c12('FDA'));
    }
    for (const [x, y] of [[2, 20], [3, 20], [32, 18], [3, 21], [30, 21], [5, 21], [28, 21], [4, 19]]) still.set(key(ix + x, iy + y), c12('EFF'));
    sprite(still, PALM, ix + 5, iy + 2);
    sprite(still, RAFT, ix + 31, iy + 19);
    sprite(still, HER_BODY, ix + 18, iy + 12);
    sprite(nod, HER_HEAD, ix + 18, iy + 7);
  } else {
    // the cloud sits up and out of the way of the notes and the fin
    sprite(still, CLOUD, ix + 21, iy + 1);
    // a far-off island on the horizon
    for (let x = 30; x <= 35; x++) still.set(key(ix + x, iy + 10), c12('7AB'));
    for (let x = 31; x <= 34; x++) still.set(key(ix + x, iy + 9), c12('7AB'));
    sprite(nod, FIN, ix + 12, iy + 5);
    sprite(nod, NOTE, ix + 5, iy + 6);
    sprite(nod, NOTE2, ix + 30, iy + 3);
    // foam round the fin
    for (const x of [10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 29]) still.set(key(ix + x, iy + 20), c12('EFF'));
    for (const x of [8, 9, 30, 31]) still.set(key(ix + x, iy + 21), c12('BEF'));
  }
  return { still, nod };
}
function windowSvg(wx, kind) {
  const frame = capsule(WIN_W, WIN_H, 7);
  const { still, nod } = windowScene(kind);
  const merged = new Map();
  for (const [k, c] of frame) {
    const [x, y] = unkey(k);
    merged.set(k, insideRR(x, y, WIN_W, WIN_H, 7, 5) && still.has(k) ? still.get(k) : c);
  }
  return `<g>${pathsByColour(merged, wx, WIN_Y)}</g><g class="nd">${pathsByColour(nod, wx, WIN_Y)}</g>`;
}
const windowsSvg = windowSvg(WIN_X[0], 'island') + windowSvg(WIN_X[1], 'shark');

// ------------------------------------------------------------------ banner: frame
const rect = (x, y, w, h, fill, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"${extra}/>`;
function stripSvg() {
  const out = [];
  const bands = P.grey.length;
  for (let i = 0; i < bands; i++) {
    const y0 = Y_STRIP + Math.round((i * STRIP_H) / bands);
    const y1 = Y_STRIP + Math.round(((i + 1) * STRIP_H) / bands);
    out.push(rect(6, y0, W - 12, y1 - y0, P.grey[i]));
  }
  out.push(rect(6, Y_STRIP, W - 12, 1, c12('DDD')));
  out.push(rect(6, Y_STRIP + STRIP_H - 1, W - 12, 1, c12('555')));
  return out.join('');
}
function navySvg() {
  const out = [];
  const bands = P.navy.length;
  for (let i = 0; i < bands; i++) {
    const y0 = Y_NAVY + Math.round((i * NAVY_H) / bands);
    const y1 = Y_NAVY + Math.round(((i + 1) * NAVY_H) / bands);
    out.push(rect(6, y0, W - 12, y1 - y0, P.navy[i]));
  }
  return out.join('');
}
// Dashed rainbow rules: 6-px dashes on an 8-px pitch, lined up with the
// gradient's steps so each dash is one colour.
function dashPath(y) {
  const d = [];
  for (let x = 16; x + 6 <= W - 16; x += 8) d.push(`M${x} ${y + 0.5}h6m-6 1h6`);
  return d.join('');
}
// Four-point stars, two frames that swap on the beat.
const STAR_SMALL = ['...#...', '...#...', '..#@#..', '##@@@##', '..#@#..', '...#...', '...#...'];
const STAR_BIG = ['...#...', '...#...', '...#...', '.#.@.#.', '###@###', '.#.@.#.', '...#...', '...#...', '...#...'];
function starPath(rows, cx, cy, ch) {
  const set = new Set();
  const h = rows.length;
  const w = rows[0].length;
  rows.forEach((r, y) => [...r].forEach((c, x) => { if (ch.includes(c)) set.add(key(cx - (w >> 1) + x, cy - (h >> 1) + y)); }));
  return pathOf(set);
}
function starsSvg() {
  const cy = LINE_Y[0] + 7;
  const xs = [16, W - 17];
  const small = xs.map((x) => starPath(STAR_SMALL, x, cy, '#')).join('');
  const smallC = xs.map((x) => starPath(STAR_SMALL, x, cy, '@')).join('');
  const big = xs.map((x) => starPath(STAR_BIG, x, cy, '#')).join('');
  const bigC = xs.map((x) => starPath(STAR_BIG, x, cy, '@')).join('');
  return `<g class="sa"><path fill="${P.star}" d="${small}"/><path fill="${P.starHi}" d="${smallC}"/></g>`
    + `<g class="sb"><path fill="${P.star}" d="${big}"/><path fill="${P.starHi}" d="${bigC}"/></g>`;
}

// ------------------------------------------------------------------ banner: css
const pct = (t) => `${n((t / CYCLE) * 100, 4)}%`;
function foldKeyframes(pi) {
  const S = 'transform:scale(1,1)';
  const Z = 'transform:scale(1,0)';
  const tIn0 = pi * PAGE - FOLD;
  const tIn1 = pi * PAGE;
  const tOut0 = (pi + 1) * PAGE - 2 * FOLD;
  const tOut1 = (pi + 1) * PAGE - FOLD;
  if (pi === 0) {
    return `@keyframes f0{0%{${S}}${pct(tOut0)}{${S}}${pct(tOut1)}{${Z}}${pct(CYCLE - FOLD)}{${Z}}100%{${S}}}`;
  }
  return `@keyframes f${pi}{0%{${Z}}${pct(tIn0)}{${Z}}${pct(tIn1)}{${S}}${pct(tOut0)}{${S}}${pct(tOut1)}{${Z}}100%{${Z}}}`;
}
function waveKeyframes() {
  const steps = 24;
  const fr = [];
  let last = null;
  for (let i = 0; i < steps; i++) {
    const v = Math.round(WAVE_AMP * Math.sin((2 * Math.PI * i) / steps)) || 0;
    if (v === last) continue;
    fr.push(`${n((i / steps) * 100, 3)}%{transform:translate(0,${v}px)}`);
    last = v;
  }
  fr.push('100%{transform:translate(0,0)}');
  return `@keyframes wv{${fr.join('')}}`;
}
function bannerCss() {
  const css = [];
  css.push('.t{fill:none;stroke:url(#rb)}.h{stroke:#000;transform:translate(1px,1px)}');
  PAGES.forEach((_, pi) => {
    css.push(foldKeyframes(pi));
    css.push(`.k${pi}{animation:f${pi} ${CYCLE}s linear infinite both}`);
  });
  for (const c of [...foldClasses].sort((a, b) => a - b)) css.push(`.s${c}{animation-delay:${dly(c * FOLD_STAGGER)}}`);
  css.push(waveKeyframes());
  for (const w of [...waveClasses].sort((a, b) => a - b)) {
    css.push(`.w${w}{animation:wv ${BAR}s step-end ${dly(-(w / 24) * BAR)} infinite}`);
  }
  // stars: swap frames on every beat
  css.push(`@keyframes sa{0%{opacity:1}50%{opacity:0}}@keyframes sb{0%{opacity:0}50%{opacity:1}}`);
  css.push(`.sa{animation:sa ${2 * BEAT}s step-end ${dly(0)} infinite}.sb{opacity:0;animation:sb ${2 * BEAT}s step-end ${dly(0)} infinite}`);
  // she and the shark nod on every beat
  css.push(`@keyframes nd{0%{transform:translate(0,1px)}30%{transform:translate(0,0)}}.nd{animation:nd ${BEAT}s step-end ${dly(0)} infinite}`);
  // the plate glint: crosses the name in 0.8 s, once every two bars
  const g0 = 0.6;
  const g1 = 1.4;
  css.push(`@keyframes gl{0%{transform:translate(0,0)}${n((g0 / PAGE) * 100)}%{transform:translate(0,0)}${n((g1 / PAGE) * 100)}%{transform:translate(${WM.w + 40}px,0)}100%{transform:translate(${WM.w + 40}px,0)}}`);
  css.push(`.gl{animation:gl ${PAGE}s steps(${Math.round((WM.w + 40) / 2)},end) ${dly(0)} infinite}`);
  css.push(`@media (prefers-reduced-motion:reduce){*{animation:none!important}${PAGES.slice(1).map((_, i) => `.pg${i + 1}`).join(',')}{display:none}.t{stroke:url(#rbs)}.sb{opacity:0}.sa{opacity:1}}`);
  return css.join('');
}

// The glint: a slanted staircase band, clipped to the letters, moved across
// in 2-px steps with steps() timing.
function glintSvg() {
  const set = new Set();
  for (let y = 0; y < 18; y++) {
    const x0 = -30 + Math.floor((17 - y) / 2);
    for (let x = x0; x < x0 + 4; x++) set.add(key(x, y));
    for (let x = x0 + 6; x < x0 + 7; x++) set.add(key(x, y));
  }
  return `<g clip-path="url(#wmc)"><g class="gl"><path fill="#ffffff" fill-opacity=".85" d="${pathOf(set, WM_X, WM_Y - 1)}"/></g></g>`;
}

function gradients() {
  const stops = [];
  RING.forEach((c, i) => {
    const a = n((i / RING.length) * 100, 4);
    const b = n(((i + 1) / RING.length) * 100, 4);
    stops.push(`<stop offset="${a}%" stop-color="${c}"/><stop offset="${b}%" stop-color="${c}"/>`);
  });
  const values = [];
  for (let i = 0; i < RING.length; i++) values.push(`${i * STEP} 0`);
  values.push(`${PERIOD} 0`);
  const begin = T0 ? `${n(-T0)}s` : '0s';
  return `<linearGradient id="rb" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${PERIOD}" y2="0" spreadMethod="repeat">${stops.join('')}`
    + `<animateTransform attributeName="gradientTransform" type="translate" calcMode="discrete" dur="${RING.length * STEP_T}s" begin="${begin}" repeatCount="indefinite" values="${values.join(';')}"/></linearGradient>`
    + '<linearGradient id="rbs" href="#rb" gradientTransform="translate(0 0)"/>';
}

function banner() {
  const parts = [];
  parts.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W * SCALE}" height="${H * SCALE}" shape-rendering="crispEdges">`);
  parts.push(`<title>CASTAWAY: an Amiga logo-plate intro</title>`);
  parts.push(`<style>${bannerCss()}</style>`);
  parts.push(`<defs>${gradients()}${wmClip}${glyphDefs.join('')}</defs>`);
  parts.push(`<rect width="${W}" height="${H}" rx="6" fill="#000"/>`);
  // rules
  parts.push(rect(6, Y_RULE1, W - 12, 1, P.rule));
  parts.push(stripSvg());
  parts.push(rect(6, Y_RULE2 - 1, W - 12, 1, P.rule));
  parts.push(rect(6, Y_RULE2 + 1, W - 12, 1, P.ruleDim));
  parts.push(navySvg());
  parts.push(rect(6, Y_RULE3, W - 12, 1, P.rule));
  // plate
  parts.push(`<g>${ornamentSvg}${windowsSvg}${plateSvg}${wordmarkSvg}${glintSvg()}</g>`);
  // dashed rainbow rules
  parts.push(`<path class="t" d="${dashPath(DASH_Y[0])}${dashPath(DASH_Y[1])}"/>`);
  parts.push(starsSvg());
  parts.push(rainbowLines.join(''));
  parts.push('</svg>');
  return parts.join('\n');
}

// ================================================================== text page
// 8-pixel capitals, 6 wide and 7 high with two-pixel stems and rounded
// corners, drawn for this file (M and W take 7). One blank row and column.
const F8 = {
  A: ['.####.', '##..##', '##..##', '######', '##..##', '##..##', '##..##'],
  B: ['#####.', '##..##', '##..##', '#####.', '##..##', '##..##', '#####.'],
  C: ['.####.', '##..##', '##....', '##....', '##....', '##..##', '.####.'],
  D: ['####..', '##.##.', '##..##', '##..##', '##..##', '##.##.', '####..'],
  E: ['######', '##....', '##....', '#####.', '##....', '##....', '######'],
  F: ['######', '##....', '##....', '#####.', '##....', '##....', '##....'],
  G: ['.####.', '##..##', '##....', '##.###', '##..##', '##..##', '.#####'],
  H: ['##..##', '##..##', '##..##', '######', '##..##', '##..##', '##..##'],
  I: ['######', '..##..', '..##..', '..##..', '..##..', '..##..', '######'],
  J: ['....##', '....##', '....##', '....##', '##..##', '##..##', '.####.'],
  K: ['##..##', '##.##.', '####..', '###...', '####..', '##.##.', '##..##'],
  L: ['##....', '##....', '##....', '##....', '##....', '##....', '######'],
  M: ['##...##', '###.###', '#######', '##.#.##', '##...##', '##...##', '##...##'],
  N: ['##..##', '###.##', '######', '##.###', '##..##', '##..##', '##..##'],
  O: ['.####.', '##..##', '##..##', '##..##', '##..##', '##..##', '.####.'],
  P: ['#####.', '##..##', '##..##', '#####.', '##....', '##....', '##....'],
  Q: ['.####.', '##..##', '##..##', '##..##', '##.###', '##.##.', '.##.##'],
  R: ['#####.', '##..##', '##..##', '#####.', '####..', '##.##.', '##..##'],
  S: ['.####.', '##..##', '##....', '.####.', '....##', '##..##', '.####.'],
  T: ['######', '..##..', '..##..', '..##..', '..##..', '..##..', '..##..'],
  U: ['##..##', '##..##', '##..##', '##..##', '##..##', '##..##', '.####.'],
  V: ['##..##', '##..##', '##..##', '.#..#.', '.####.', '..##..', '..##..'],
  W: ['##...##', '##...##', '##...##', '##.#.##', '#######', '###.###', '##...##'],
  X: ['##..##', '##..##', '.####.', '..##..', '.####.', '##..##', '##..##'],
  Y: ['##..##', '##..##', '##..##', '.####.', '..##..', '..##..', '..##..'],
  Z: ['######', '....##', '...##.', '..##..', '.##...', '##....', '######'],
  0: ['.####.', '##..##', '##.###', '######', '###.##', '##..##', '.####.'],
  1: ['..##..', '.###..', '..##..', '..##..', '..##..', '..##..', '.####.'],
  2: ['.####.', '##..##', '....##', '..###.', '.##...', '##....', '######'],
  3: ['.####.', '##..##', '....##', '..###.', '....##', '##..##', '.####.'],
  4: ['...##.', '..###.', '.####.', '##.##.', '######', '...##.', '...##.'],
  5: ['######', '##....', '#####.', '....##', '....##', '##..##', '.####.'],
  6: ['.####.', '##....', '##....', '#####.', '##..##', '##..##', '.####.'],
  7: ['######', '....##', '...##.', '..##..', '..##..', '..##..', '..##..'],
  8: ['.####.', '##..##', '##..##', '.####.', '##..##', '##..##', '.####.'],
  9: ['.####.', '##..##', '##..##', '.#####', '....##', '...##.', '.###..'],
  '.': ['......', '......', '......', '......', '......', '..##..', '..##..'],
  ',': ['......', '......', '......', '......', '......', '..##..', '..##..', '.##...'],
  ':': ['......', '..##..', '..##..', '......', '......', '..##..', '..##..'],
  ';': ['......', '..##..', '..##..', '......', '......', '..##..', '..##..', '.##...'],
  '-': ['......', '......', '......', '.####.', '......', '......', '......'],
  '/': ['......', '....##', '...##.', '..##..', '.##...', '##....', '......'],
  '(': ['...##.', '..##..', '.##...', '.##...', '.##...', '..##..', '...##.'],
  ')': ['.##...', '..##..', '...##.', '...##.', '...##.', '..##..', '.##...'],
  '!': ['..##..', '..##..', '..##..', '..##..', '..##..', '......', '..##..'],
  '?': ['.####.', '##..##', '...##.', '..##..', '..##..', '......', '..##..'],
  "'": ['..##..', '..##..', '.##...', '......', '......', '......', '......'],
  '+': ['......', '..##..', '..##..', '######', '..##..', '..##..', '......'],
  '=': ['......', '......', '######', '......', '######', '......', '......'],
  '>': ['.##...', '..##..', '...##.', '....##', '...##.', '..##..', '.##...'],
  '<': ['...##.', '..##..', '.##...', '##....', '.##...', '..##..', '...##.'],
  '*': ['......', '.#..#.', '..##..', '######', '..##..', '.#..#.', '......'],
  ' ': [],
};
const F8_ID = new Map();
const f8Defs = [];
function f8(ch) {
  if (F8_ID.has(ch)) return F8_ID.get(ch);
  const rows = F8[ch];
  if (!rows) throw new Error(`8-pixel font has no "${ch}"`);
  const set = new Set();
  rows.forEach((r, y) => [...r].forEach((c, x) => { if (c === '#') set.add(key(x, y)); }));
  const id = `e${F8_ID.size.toString(36)}`;
  F8_ID.set(ch, id);
  if (set.size) f8Defs.push(`<path id="${id}" d="${pathOf(set)}"/>`);
  return id;
}

const TP_COLS = 44;
const TP_X = 16;
const TP_W = TP_COLS * 8 + 2 * TP_X; // 384
// The page, top to bottom. '~' is a dashed rule (8 px), '' a half-row gap
// (4 px), 'T' the double-size title (18 px); any other row is a list of
// text segments (9 px: 7-px capitals and two pixels of leading), placed at
// a column or centred, with a colour class.
const LEAD = (a, b, width) => `${a} ${'.'.repeat(Math.max(2, width - a.length - b.length - 2))} ${b}`;
const info = (a, b) => [{ t: LEAD(a, b, 40), c: 'w', at: 2 }];
const two = (a, b, c = 'o2') => [{ t: a, c, at: 2 }, { t: b, c, at: 23 }];
const TP = [
  '~', '',
  'T',
  '',
  [{ t: 'A TEN-HOUR LO-FI ISLAND VIDEO IN WHICH', c: 'm2', center: true }],
  [{ t: 'VERY LITTLE HAPPENS, ON PURPOSE.', c: 'm2', center: true }],
  '', '~', '',
  info('SUPPLIED BY', 'THE TIDE'),
  info('RETURNED BY', 'ALSO THE TIDE'),
  info('BUILT BY', 'THE PALM READERS'),
  info('INSPIRED BY', 'A 1992 SCREENSAVER'),
  info('STATUS', 'UNOFFICIAL. IN DEVELOPMENT.'),
  info('SOUND BY', 'CODE. NO SAMPLES.'),
  info('PICTURE', '16:9, 1080P, 30 FPS'),
  info('RUNTIME', '10:00:00, SEED 1992'),
  info('NIGHTS', 'NONE. ALWAYS DAYTIME.'),
  '', '~', '',
  two('SIGNAL:', 'POST:', 'o'),
  two('TOP OF THE PALM.', 'BY BOTTLE. IT WILL'),
  two('ONE BAR, ON A GOOD', 'WASH STRAIGHT BACK.'),
  two('DAY. WORTH THE', 'A REPLY COMES LATER'),
  two('CLIMB.', 'IN ANOTHER BOTTLE.'),
  '',
  two('PARCELS:', 'PREVIEW:', 'o'),
  two('BY DRONE.', 'TOOLS/SERVE.PY,'),
  two('CONTENTS: MORE', 'THEN OPEN'),
  two('HEADPHONES.', '127.0.0.1:8765'),
  '', '~', '',
  [{ t: 'GREETINGS TO THE REGULARS (EVERY 2 TO 5', c: 'b', at: 2 }],
  [{ t: 'MINUTES), THE OCCASIONALS (12 TO 25),', c: 'b', at: 2 }],
  [{ t: 'THE RARES (30 TO 60) AND THE SUPER RARES', c: 'b', at: 2 }],
  [{ t: '(3 TO 6 HOURS). SEE YOU LATER. NO HURRY.', c: 'b', at: 2 }],
  '', '~', '',
  [{ t: 'PRESS LEFT MOUSE BUTTON TO KEEP WAITING', c: 'cy', center: true }],
  '',
];
const rowH = (row) => (row === '~' ? 8 : row === '' ? 4 : row === 'T' ? 18 : 9);

function textPage() {
  const TOP = 6;
  const TH = TOP * 2 + TP.reduce((a, r) => a + rowH(r), 0);
  const out = [];
  const css = [];
  const C = {
    bg: [c12('013'), c12('014'), c12('014'), c12('013')],
    m2: c12('E9E'), w: c12('FFF'), wd: c12('77A'), o: c12('FB3'), o2: c12('F80'), b: c12('9DF'),
  };
  css.push(`.m2{fill:${C.m2}}.w{fill:${C.w}}.wd{fill:${C.wd}}.o{fill:${C.o}}.o2{fill:${C.o2}}.b{fill:${C.b}}.m{fill:url(#tg)}`);
  // the bottom line cycles through the rainbow, one colour step per column
  const cycCols = RING.filter((_, i) => i % 3 === 0);
  const cdur = cycCols.length * 0.25;
  css.push(`@keyframes cc{${cycCols.map((c, i) => `${n((i / cycCols.length) * 100, 3)}%{fill:${c}}`).join('')}100%{fill:${cycCols[0]}}}`);
  // the title is shaded by row, copper style: pink at the top to deep magenta
  const tRamp = ['FCF', 'FAF', 'F8F', 'F6F', 'F4F', 'E3E', 'C2C'].map(c12);
  const tStops = tRamp.map((c, i) => `<stop offset="${n((i / 7) * 100)}%" stop-color="${c}"/><stop offset="${n(((i + 1) / 7) * 100)}%" stop-color="${c}"/>`).join('');
  const defs = [`<linearGradient id="tg" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="7">${tStops}</linearGradient>`];
  out.push(`<rect width="${TP_W}" height="${TH}" rx="6" fill="#000"/>`);
  const by0 = 4;
  const bh = TH - 8;
  C.bg.forEach((c, i) => {
    const y0 = by0 + Math.round((i * bh) / C.bg.length);
    const y1 = by0 + Math.round(((i + 1) * bh) / C.bg.length);
    out.push(rect(4, y0, TP_W - 8, y1 - y0, c));
  });
  out.push(rect(4, by0, TP_W - 8, 1, P.rule));
  out.push(rect(4, by0 + bh - 1, TP_W - 8, 1, P.rule));
  const dashByColour = new Map();
  const usedCycle = new Set();
  let y = TOP;
  for (const row of TP) {
    const h = rowH(row);
    if (row === '~') {
      for (let x = TP_X; x + 6 <= TP_W - TP_X; x += 8) {
        const c = RING[Math.floor(x / 8) % RING.length];
        if (!dashByColour.has(c)) dashByColour.set(c, []);
        dashByColour.get(c).push(`M${x} ${y + 3}h6v2h-6z`);
      }
    } else if (row === 'T') {
      const word = 'CASTAWAY';
      const adv = 16;
      let x = Math.round((TP_W - (word.length * adv - 2)) / 2);
      for (const ch of word) {
        out.push(`<use href="#${f8(ch)}" class="m" transform="translate(${x} ${y + 1}) scale(2)"/>`);
        x += adv;
      }
    } else if (row) {
      for (const seg of row) {
        const cols = seg.center ? Math.floor((TP_COLS - seg.t.length) / 2) : seg.at;
        if (cols + seg.t.length > TP_COLS - 2) throw new Error(`text page row too long: ${seg.t}`);
        let x = TP_X + cols * 8;
        [...seg.t].forEach((ch, i) => {
          const id = f8(ch);
          if (ch !== ' ') {
            if (seg.c === 'cy') {
              const col = cols + i;
              usedCycle.add(col);
              out.push(`<use href="#${id}" x="${x}" y="${y + 1}" class="c${col}"/>`);
            } else {
              const leader = seg.c === 'w' && ch === '.' && (seg.t[i - 1] === '.' || seg.t[i + 1] === '.');
              out.push(`<use href="#${id}" x="${x}" y="${y + 1}" class="${leader ? 'wd' : seg.c}"/>`);
            }
          }
          x += 8;
        });
      }
    }
    y += h;
  }
  // Each letter also gets its first-frame colour as a plain fill, so the line
  // still reads (as a still rainbow) when reduced motion turns the cycle off.
  const cyc = [...usedCycle].map((col) => `.c${col}{fill:${cycCols[col % cycCols.length]};animation:cc ${cdur}s step-end ${dly(-(col % cycCols.length) * 0.25)} infinite}`);
  css.push(cyc.join(''));
  css.push('@media (prefers-reduced-motion:reduce){*{animation:none!important}}');
  const dashSvg = [...dashByColour].map(([c, ds]) => `<path fill="${c}" d="${ds.join('')}"/>`).join('');
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${TP_W} ${TH}" width="${TP_W * SCALE}" height="${TH * SCALE}" shape-rendering="crispEdges">`,
    '<title>CASTAWAY: the text page</title>',
    `<style>${css.join('')}</style>`,
    `<defs>${defs.join('')}${f8Defs.join('')}</defs>`,
    out.join(''),
    dashSvg,
    '</svg>',
  ].join('\n');
}


// ------------------------------------------------------------------ write
fs.mkdirSync(OUTDIR, { recursive: true });
const files = [
  [`${SLUG}.svg`, banner()],
  [`${SLUG}-textpage.svg`, textPage()],
];
for (const [name, svg] of files) {
  const p = path.join(OUTDIR, name);
  fs.writeFileSync(p, svg + '\n');
  console.log(`${p}  ${(Buffer.byteLength(svg) / 1024).toFixed(1)} KB`);
}
