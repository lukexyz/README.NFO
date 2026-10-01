#!/usr/bin/env node
// Hand-pixelled chrome logo: README header generator for CASTAWAY.
//
//   node examples/castaway/src/35-hand-pixelled-chrome-logo_opus_5.5.mjs
//
// Writes examples/castaway/assets/35-hand-pixelled-chrome-logo_opus_5.5.svg
// (the banner) and ...-magnify.svg (the same logo up close, with notes).
// Plain Node, no dependencies, no clock, no Math.random: the same bytes on
// every run. The .md beside the assets is hand-written, not generated.
//
// The style (catalogue entry c64-12) is the 1988-93 Amiga / Atari ST group
// logo drawn dot by dot at 320 pixels wide in 16 or 32 colours: metal capitals
// that reflect an imaginary sky above a hard zigzag horizon and an imaginary
// desert below it, banded because the palette is tiny, with a one-pixel dark
// outline, a lit top-left edge, an extruded side down and to the right, and
// white sparkle stars on the corners. Here the imaginary desert is a beach:
// the sky is violet to white, the ground is coral to sand, the horizon is a
// row of little waves, and one letter's horizon has an island in it.
// Letterforms, palette choices, the cat and the tiny font are original;
// nothing is traced from any real logo.
//
// The angle: a chrome logo is the thing a demo shows you while you wait, and
// Castaway is ten hours of waiting, so this one is built to be stared at. It
// barely moves. The shine waits for the next bar of the music like every gag
// in the video does, the sparkles twinkle on the beat, and the grey tabby
// from the stray-cat gag has found something flatter than a palm to nap on.
//
// Timing (whole multiples of the 0.75 s beat of the 80 BPM theme):
//   sparkles  one twinkle per bar (3 s), staggered by a beat
//   ripple    the reflection shifts once per beat, 3 s cycle
//   glint     sweeps the letters in 3 beats from the top of every 4th bar
//   cat       tail flicks every 2 beats; one "z" per 2 beats, 6 s cycle
//   subtitle  6 lines x 6 s (two bars each, hard cuts) = 36 s loop
// The whole picture is one 36 s loop. The first frame already shows the
// complete logo; with reduced motion it holds that frame (big sparkles, no
// glint, subtitle line 1).
//
// How it is drawn (no <text>, no filters, no opacity blending): every pixel is
// chosen in a 320 x 140 indexed buffer, then each colour becomes a filled
// path of merged rectangles plus a stroked path of one-row runs (a 1-unit
// line through the middle of a row covers exactly that row, in far fewer
// bytes). Every colour on screen is a 12-bit Amiga value
// (one hex digit per channel) and the generator checks that the banner uses
// no more than 32 of them, then prints the used count in the palette strip.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '35-hand-pixelled-chrome-logo_opus_5.5';
const OUT_MAIN = path.resolve(here, `../assets/${SLUG}.svg`);
const OUT_ZOOM = path.resolve(here, `../assets/${SLUG}-magnify.svg`);

// ----------------------------------------------------------------- canvas
const W = 320;
const H = 140;
const TOP = 22; // first row of the letter faces
const LH = 44; // letter height in rows
const BASE = TOP + LH; // first row below the faces
const DEPTH = 5; // extrusion, pixels down and right
const SEA_TOP = 75; // the horizon line of the floor
const SEA_H = 29;
const TEXT1_Y = 109;
const TEXT2_Y = 120;
const STRIP_Y = 132;
const BEAT = 0.75;
const BAR = 3;
const LOOP = 36;

// ---------------------------------------------------------------- palette
// One cool ramp (sky), one warm ramp (sand), a sea ramp for the floor, three
// greys and a pink for the cat, black and white. All 12-bit.
const PAL = {
  K: '#000',
  C0: '#213', C1: '#325', C2: '#437', C3: '#54a', C4: '#66c', C5: '#89e', C6: '#bcf',
  WH: '#fff',
  W0: '#301', W1: '#612', W2: '#923', W3: '#c42', W4: '#e63', W5: '#f94', W6: '#fc6', W7: '#fe9',
  S0: '#6ad', S1: '#48b', S2: '#369', S3: '#257', S4: '#146', S5: '#035', S6: '#024', S7: '#013',
  G0: '#445', G1: '#889', G2: '#ccd', PK: '#f9a',
};
const COOL = ['C0', 'C1', 'C2', 'C3', 'C4', 'C5', 'C6'];
const WARM = ['W0', 'W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7'];
for (const [k, v] of Object.entries(PAL)) {
  if (!/^#[0-9a-f]{3}$/.test(v)) throw new Error(`${k} is not a 12-bit colour: ${v}`);
}

// ----------------------------------------------------------------- helpers
function mulberry32(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = mulberry32(1992);

class Buf {
  constructor(w, h) { this.w = w; this.h = h; this.a = new Array(w * h).fill(null); }
  get(x, y) { return x < 0 || y < 0 || x >= this.w || y >= this.h ? null : this.a[y * this.w + x]; }
  set(x, y, k) {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    if (k && !PAL[k]) throw new Error(`unknown colour ${k}`);
    this.a[y * this.w + x] = k;
  }
}

// Merge each colour's pixels into rectangles: horizontal runs first, then runs
// with the same span on consecutive rows stack into one rect.
function rectsOf(buf, x0 = 0, y0 = 0, x1 = buf.w, y1 = buf.h) {
  const out = new Map();
  let open = new Map();
  const close = (r) => { if (!out.has(r.k)) out.set(r.k, []); out.get(r.k).push(r); };
  for (let y = y0; y < y1; y++) {
    const next = new Map();
    let x = x0;
    while (x < x1) {
      const k = buf.get(x, y);
      if (!k) { x++; continue; }
      let e = x + 1;
      while (e < x1 && buf.get(e, y) === k) e++;
      const key = `${k}|${x}|${e}`;
      const prev = open.get(key);
      if (prev) { prev.h++; next.set(key, prev); open.delete(key); }
      else next.set(key, { k, x, y, w: e - x, h: 1 });
      x = e;
    }
    for (const r of open.values()) close(r);
    open = next;
  }
  for (const r of open.values()) close(r);
  return out;
}
// Rects as one path, each subpath relative to the previous one's corner.
function rectD(rs, dx = 0, dy = 0) {
  let px = 0; let py = 0; let first = true;
  return rs.map((r) => {
    const x = r.x + dx; const y = r.y + dy;
    const m = first ? `M${x} ${y}` : `m${x - px} ${y - py}`;
    first = false; px = x; py = y;
    return `${m}h${r.w}v${r.h}h-${r.w}z`;
  }).join('');
}
// One-row runs as a single stroked path (a 1-unit line through the middle of
// the row covers exactly that row), each move relative to the last run's end.
function runD(rs, dx = 0, dy = 0) {
  let px = 0; let py = 0; let first = true;
  return rs.map((r) => {
    const x = r.x + dx; const y = r.y + dy;
    const m = first ? `M${x} ${y}.5` : `m${x - px} ${y - py}`;
    first = false; px = x + r.w; py = y;
    return `${m}h${r.w}`;
  }).join('');
}
function pathsOf(buf, opts = {}) {
  const { order = Object.keys(PAL), x0, y0, x1, y1, dx = 0, dy = 0 } = opts;
  const m = rectsOf(buf, x0, y0, x1, y1);
  return order.filter((k) => m.has(k)).map((k) => {
    const all = m.get(k);
    const tall = all.filter((r) => r.h > 1);
    const thin = all.filter((r) => r.h === 1).sort((a, b) => a.y - b.y || a.x - b.x);
    let out = '';
    if (tall.length) out += `<path fill="${PAL[k]}" d="${rectD(tall, dx, dy)}"/>`;
    if (thin.length) out += `<path fill="none" stroke="${PAL[k]}" d="${runD(thin, dx, dy)}"/>`;
    return out;
  }).join('');
}
const usedIn = (buf) => new Set(buf.a.filter(Boolean));

// --------------------------------------------------------------- the font
// A small proportional face, 7 rows, drawn for this banner. '#' = ink.
const FONT = {
  A: '.##.|#..#|#..#|####|#..#|#..#|#..#', B: '###.|#..#|#..#|###.|#..#|#..#|###.',
  C: '.###|#...|#...|#...|#...|#...|.###', D: '###.|#..#|#..#|#..#|#..#|#..#|###.',
  E: '####|#...|#...|###.|#...|#...|####', F: '####|#...|#...|###.|#...|#...|#...',
  G: '.###|#...|#...|#.##|#..#|#..#|.###', H: '#..#|#..#|#..#|####|#..#|#..#|#..#',
  I: '###|.#.|.#.|.#.|.#.|.#.|###', J: '..##|...#|...#|...#|...#|#..#|.##.',
  K: '#..#|#..#|#.#.|##..|#.#.|#..#|#..#', L: '#...|#...|#...|#...|#...|#...|####',
  M: '#...#|##.##|#.#.#|#.#.#|#...#|#...#|#...#', N: '#..#|##.#|##.#|#.##|#.##|#..#|#..#',
  O: '.##.|#..#|#..#|#..#|#..#|#..#|.##.', P: '###.|#..#|#..#|###.|#...|#...|#...',
  Q: '.##.|#..#|#..#|#..#|#..#|#.#.|.#.#', R: '###.|#..#|#..#|###.|#.#.|#..#|#..#',
  S: '.###|#...|#...|.##.|...#|...#|###.', T: '#####|..#..|..#..|..#..|..#..|..#..|..#..',
  U: '#..#|#..#|#..#|#..#|#..#|#..#|.##.', V: '#...#|#...#|#...#|.#.#.|.#.#.|.#.#.|..#..',
  W: '#...#|#...#|#...#|#.#.#|#.#.#|##.##|#...#', X: '#..#|#..#|.##.|.##.|.##.|#..#|#..#',
  Y: '#...#|#...#|.#.#.|..#..|..#..|..#..|..#..', Z: '####|...#|..#.|.##.|.#..|#...|####',
  0: '.##.|#..#|#.##|####|##.#|#..#|.##.', 1: '.#.|##.|.#.|.#.|.#.|.#.|###',
  2: '.##.|#..#|...#|..#.|.#..|#...|####', 3: '###.|...#|...#|.##.|...#|...#|###.',
  4: '#..#|#..#|#..#|####|...#|...#|...#', 5: '####|#...|###.|...#|...#|#..#|.##.',
  6: '.##.|#...|###.|#..#|#..#|#..#|.##.', 7: '####|...#|..#.|..#.|.#..|.#..|.#..',
  8: '.##.|#..#|#..#|.##.|#..#|#..#|.##.', 9: '.##.|#..#|#..#|.###|...#|...#|.##.',
  '.': '.|.|.|.|.|.|#', ',': '.|.|.|.|.|#|#', ':': '.|.|#|.|.|#|.', "'": '#|#|.|.|.|.|.',
  '-': '...|...|...|###|...|...|...', '/': '..#|..#|.#.|.#.|.#.|#..|#..',
  '·': '.|.|.|#|.|.|.', '!': '#|#|#|#|#|.|#', '(': '.#|#.|#.|#.|#.|#.|.#', ')': '#.|.#|.#|.#|.#|.#|#.',
  '>': '#..|.#.|..#|..#|..#|.#.|#..', '?': '###.|...#|..#.|.#..|.#..|....|.#..',
  ' ': '..|..|..|..|..|..|..',
};
const glyph = (ch) => {
  const g = FONT[ch];
  if (!g) throw new Error(`no glyph for ${JSON.stringify(ch)}`);
  return g.split('|');
};
const textW = (s, track = 1) => [...s].reduce((w, ch) => w + glyph(ch)[0].length + track, 0) - track;

// Draw text into a buffer: top rows in one colour, lower rows in another, and
// a one-pixel shadow straight down in a third.
function drawText(buf, s, x, y, top, bottom, shadow, track = 1) {
  const ink = [];
  let cx = x;
  for (const ch of s) {
    const g = glyph(ch);
    g.forEach((row, ry) => [...row].forEach((c, rx) => { if (c === '#') ink.push([cx + rx, y + ry, ry]); }));
    cx += g[0].length + track;
  }
  if (shadow) for (const [px, py] of ink) if (!buf.get(px, py + 1)) buf.set(px, py + 1, shadow);
  for (const [px, py, ry] of ink) buf.set(px, py, ry < 4 ? top : bottom);
}

// ------------------------------------------------------------ the letters
// Each letter is drawn upright on a grid LH rows tall, as an ordered list of
// chamfered rectangles: '+' fills, '-' cuts, and the last one that covers a
// point wins. Chamfers are [top-left, top-right, bottom-right, bottom-left].
// The italic is applied when the letters are rasterised.
const LETTERS = {
  C: { w: 34, ops: [
    ['+', [0, 0, 34, 44, 9, 3, 3, 9]],
    ['-', [11, 10, 40, 34, 3, 0, 0, 3]],
    ['+', [25, 10, 34, 14, 0, 0, 0, 3]],
    ['+', [25, 30, 34, 34, 3, 0, 0, 0]],
  ] },
  A: { w: 36, ops: [
    ['+', [0, 0, 36, 44, 11, 11, 0, 0]],
    ['-', [11, 11, 25, 21, 3, 3, 0, 0]],
    ['-', [11, 30, 25, 50, 2, 2, 0, 0]],
  ] },
  S: { w: 34, ops: [
    ['+', [0, 0, 34, 44, 9, 3, 9, 3]],
    ['-', [11, 10, 40, 17, 2, 0, 0, 2]],
    ['+', [25, 10, 34, 13, 0, 0, 0, 2]],
    ['-', [-6, 27, 23, 34, 0, 2, 2, 0]],
    ['+', [0, 31, 9, 34, 0, 2, 0, 0]],
  ] },
  T: { w: 34, ops: [
    ['+', [0, 0, 34, 10, 3, 3, 2, 2]],
    ['+', [11.5, 0, 22.5, 44, 0, 0, 2, 2]],
  ] },
  W: { w: 50, ops: [
    ['+', [0, 0, 50, 44, 2, 2, 9, 9]],
    ['-', [11, -1, 19.5, 34, 0, 0, 4, 4]],
    ['-', [30.5, -1, 39, 34, 0, 0, 4, 4]],
    ['-', [19.5, -1, 30.5, 15]],
  ] },
  Y: { w: 36, ops: [
    ['+', [0, 0, 36, 30, 2, 2, 10, 10]],
    ['-', [11, -1, 25, 20, 0, 0, 3, 3]],
    ['+', [12.5, 26, 23.5, 44, 0, 0, 2, 2]],
  ] },
};
function inCR(r, x, y) {
  const [x0, y0, x1, y1, tl = 0, tr = 0, br = 0, bl = 0] = r;
  if (x < x0 || x > x1 || y < y0 || y > y1) return false;
  if (tl && x - x0 + (y - y0) < tl) return false;
  if (tr && x1 - x + (y - y0) < tr) return false;
  if (br && x1 - x + (y1 - y) < br) return false;
  if (bl && x - x0 + (y1 - y) < bl) return false;
  return true;
}
const inLetter = (L, x, y) => {
  let v = false;
  for (const [op, r] of L.ops) if (inCR(r, x, y)) v = op === '+';
  return v;
};

const NAME = 'CASTAWAY';
const OVERLAP = 2;
const SLANT = 1 / 3; // one pixel of lean every three rows
const lean = (py) => (BASE - (py + 0.5)) * SLANT;
const upright = [...NAME].reduce((w, ch) => w + LETTERS[ch].w, 0) - OVERLAP * (NAME.length - 1);
const span = upright + LH * SLANT + DEPTH + 2;
const X0 = Math.round((W - span) / 2) + 1;

// One mask per letter (screen pixels), plus where each letter starts.
const letters = [];
{
  let ox = X0;
  for (const ch of NAME) {
    const L = LETTERS[ch];
    const m = new Uint8Array(W * H);
    for (let py = TOP; py < BASE; py++) {
      for (let px = 0; px < W; px++) {
        if (inLetter(L, px + 0.5 - lean(py) - ox, py + 0.5 - TOP)) m[py * W + px] = 1;
      }
    }
    letters.push({ ch, ox, m, at: (x, y) => x >= 0 && y >= 0 && x < W && y < H && m[y * W + x] === 1 });
    ox += L.w - OVERLAP;
  }
}
const anyFace = (x, y) => letters.some((l) => l.at(x, y));

// The horizon: a row of small waves per letter (hand variation from the
// seeded generator), a little over halfway down. In the W's left stem the
// reflected world has an island in it, with one palm, leaning with the italic.
const HZ = 25; // horizon row (letter rows 0..43); waves lift it by up to 2
const ISLAND_LETTER = 5; // the W
const waves = letters.map(() => ({ ph: Math.floor(rnd() * 8), amp: rnd() < 0.5 ? 1 : 2 }));
const islandX = (yr = HZ) => Math.floor(letters[ISLAND_LETTER].ox + 5.5 + lean(TOP + yr));
function horizonAt(li, x) {
  const { ph, amp } = waves[li];
  const t = (x + ph) % 8;
  return HZ - Math.round((amp * Math.abs(t - 4)) / 4);
}
// The island sits on the horizon in front of the glare: a low dome and one
// palm, as a silhouette in the ground colour.
const PALM = [
  '.##.##.',
  '#.###.#',
  '...#...',
  '...#...',
  '....#..',
];
const DOME = [3, 3, 2, 1];
function islandAt(li, x, yr) {
  if (li !== ISLAND_LETTER) return false;
  const d = Math.abs(x - islandX(yr));
  const top = d < DOME.length ? HZ - DOME[d] : 99;
  if (yr >= top && yr < HZ) return true;
  const r = yr - (HZ - 3 - PALM.length);
  const c = x - (islandX(yr) - 3);
  return r >= 0 && r < PALM.length && c >= 0 && c < 7 && PALM[r][c] === '#';
}

// Face colour for a pixel of letter li, before the bevel.
function bandAt(li, x, y) {
  const yr = y - TOP;
  const h = horizonAt(li, x);
  if (islandAt(li, x, yr)) return { zone: 'warm', i: 0, island: true };
  if (yr === h - 1) return { zone: 'glare', i: 7 };
  if (yr < h - 1) {
    // sky: five bands from violet to pale blue, a checkerboard row where
    // the lighter ones meet
    const edges = [0, 5, 10, 14, 18];
    let b = 0;
    while (b < 4 && yr >= edges[b + 1]) b++;
    if (b >= 2 && yr === edges[b] && (x + y) % 2 === 0) b--;
    return { zone: 'cool', i: b + 2 };
  }
  // ground: eight bands, darkest at the horizon, sand at the bottom
  const edges = [0, HZ + 2, HZ + 4, HZ + 6, HZ + 9, HZ + 12, HZ + 15, HZ + 17];
  let i = 0;
  while (i < 7 && yr >= edges[i + 1]) i++;
  if (i >= 2 && yr === edges[i] && (x + y) % 2 === 1) i--;
  return { zone: 'warm', i };
}
const rampKey = (zone, i) => (zone === 'cool' ? COOL : WARM)[Math.max(0, Math.min(zone === 'cool' ? 6 : 7, i))];

function faceColour(li, x, y) {
  const L = letters[li];
  const b = bandAt(li, x, y);
  const up = L.at(x, y - 1); const left = L.at(x - 1, y);
  const down = L.at(x, y + 1); const right = L.at(x + 1, y);
  if (b.island) return 'W0';
  if (b.zone === 'glare') return !down || !right ? 'C6' : 'WH';
  if (!up) return b.zone === 'cool' ? 'WH' : 'W7'; // lit top edge
  if (!left) return rampKey(b.zone, b.i + 2); // lit left edge
  if (!down) return rampKey(b.zone, b.i - 3); // shaded bottom edge
  if (!right) return rampKey(b.zone, b.i - 2); // shaded right edge
  return rampKey(b.zone, b.i);
}

// ------------------------------------------------------- compose the logo
// Draws the given letters (indices into `letters`) into a fresh buffer.
function compose(which) {
  const buf = new Buf(W, H);
  const face = (x, y) => which.some((li) => letters[li].at(x, y));
  // Extrusion: everything the faces sweep over on their way down-right.
  // Pixels nearer a face straight above them are underside (darker); pixels
  // nearer a face straight to the left are the right-hand sides.
  for (let y = TOP; y < BASE + DEPTH + 1; y++) {
    for (let x = 0; x < W; x++) {
      if (face(x, y)) continue;
      let hit = false;
      for (let k = 1; k <= DEPTH && !hit; k++) if (face(x - k, y - k)) hit = true;
      if (!hit) continue;
      let du = 99; let dl = 99;
      for (let k = 1; k <= DEPTH + 1; k++) { if (du === 99 && face(x, y - k)) du = k; if (dl === 99 && face(x - k, y)) dl = k; }
      buf.set(x, y, dl < du ? 'C1' : 'C0');
    }
  }
  // Faces, right to left so that each letter overlaps its right-hand
  // neighbour, each with its own one-pixel black outline.
  for (const li of [...which].sort((p, q) => q - p)) {
    const L = letters[li];
    for (let y = TOP - 1; y <= BASE; y++) {
      for (let x = 0; x < W; x++) {
        if (L.at(x, y)) continue;
        let ring = false;
        for (let dy = -1; dy <= 1 && !ring; dy++) for (let dx = -1; dx <= 1; dx++) if (L.at(x + dx, y + dy)) { ring = true; break; }
        if (ring) buf.set(x, y, 'K');
      }
    }
    for (let y = TOP; y < BASE; y++) for (let x = 0; x < W; x++) if (L.at(x, y)) buf.set(x, y, faceColour(li, x, y));
  }
  return buf;
}
const art = compose(letters.map((_, i) => i));

// The union of the faces, for the glint's clip path and the reflection.
const faceMask = new Buf(W, H);
for (let y = TOP; y < BASE; y++) for (let x = 0; x < W; x++) if (anyFace(x, y)) faceMask.set(x, y, 'WH');

// ------------------------------------------------------------- the floor
// A sea that recedes to a pale horizon; band heights grow towards the viewer.
const sea = new Buf(W, H);
const SEA_BANDS = [['C6', 1], ['S0', 1], ['S1', 2], ['S2', 2], ['S3', 3], ['S4', 4], ['S5', 5], ['S6', 5], ['S7', 6]];
{
  let y = SEA_TOP;
  SEA_BANDS.forEach(([k, n], bi) => {
    for (let r = 0; r < n; r++, y++) {
      for (let x = 1; x < W - 1; x++) {
        let c = k;
        if (r === 0 && bi >= 3 && (x + y) % 2 === 0) c = SEA_BANDS[bi - 1][0];
        sea.set(x, y, c);
      }
    }
  });
}
// The reflection: the faces flipped about the waterline, one to three steps
// darker the further out it is, thinned by a checkerboard at the far edge,
// and drawn in strips with a one-row gap so the water lines show through.
// Each strip ripples sideways on the beat.
const DIM = {
  WH: 'C5', C6: 'C4', C5: 'C3', C4: 'C2', C3: 'C2', C2: 'C1', C1: 'C0', C0: 'C0',
  W7: 'W5', W6: 'W4', W5: 'W3', W4: 'W3', W3: 'W2', W2: 'W1', W1: 'W0', W0: 'W0',
};
const strips = [];
for (let r = 0; r < SEA_H - 1; r++) {
  if (r % 3 === 2) continue; // water line
  const y = SEA_TOP + 1 + r;
  const ys = BASE - 1 - r;
  const si = Math.floor(r / 3);
  if (!strips[si]) strips[si] = { px: [] };
  for (let x = 0; x < W; x++) {
    if (!faceMask.get(x, ys)) continue;
    if (r >= 21 && (x + y) % 2 === 0) continue;
    let k = DIM[art.get(x, ys)];
    if (!k) continue;
    if (r >= 2) k = DIM[k];
    if (r >= 14) k = DIM[k];
    strips[si].px.push([x, y, k]);
  }
}

// --------------------------------------------------------------- the cat
// The stray grey tabby (white chest) asleep on the T's crossbar, facing left,
// tail hanging over the end. Its own design; it is not any famous cat.
const T = letters[3];
let tRight = 0;
for (let x = 0; x < W; x++) if (T.at(x, TOP)) tRight = x;
const CAT = [
  '..k..k........',
  '.kgkkgk.......',
  '.kggggkkkkkk..',
  'kgkgkgdgdgdgk.',
  'kwpwgggdggdggk',
  'kwwwwgggggggggk',
];
const catX = tRight - 14;
const catY = TOP - CAT.length;
const catMap = { k: 'K', g: 'G1', d: 'G0', w: 'G2', p: 'PK' };
const catBuf = new Buf(W, H);
CAT.forEach((row, ry) => [...row].forEach((c, rx) => { if (catMap[c]) catBuf.set(catX + rx, catY + ry, catMap[c]); }));
const tailX = catX + CAT[CAT.length - 1].length;
// two tail frames: straight down, and flicked
const TAIL_A = [[0, 0], [1, 0], [1, 1], [1, 2], [1, 3], [1, 4], [1, 5], [2, 6]];
const TAIL_B = [[0, 0], [1, 0], [1, 1], [1, 2], [1, 3], [2, 4], [3, 4], [4, 3]];

// ------------------------------------------------------ sparkles + flare
function sparkle(cx, cy, big) {
  const px = [[0, 0, 'WH'], [1, 0, 'WH'], [-1, 0, 'WH'], [0, 1, 'WH'], [0, -1, 'WH']];
  if (big) {
    px.push([2, 0, 'C6'], [-2, 0, 'C6'], [0, 2, 'C6'], [0, -2, 'C6'],
      [3, 0, 'C5'], [-3, 0, 'C5'], [0, 3, 'C5'], [0, -3, 'C5'],
      [1, 1, 'C5'], [-1, 1, 'C5'], [1, -1, 'C5'], [-1, -1, 'C5']);
  } else {
    px[1][2] = 'C6'; px[2][2] = 'C6'; px[3][2] = 'C6'; px[4][2] = 'C6';
  }
  return px.map(([dx, dy, k]) => [cx + dx, cy + dy, k]);
}
const cornerOf = (li, which) => {
  const L = letters[li];
  if (which === 'tl') { for (let y = TOP; y < BASE; y++) for (let x = 0; x < W; x++) if (L.at(x, y)) return [x + 1, y + 1]; }
  if (which === 'tr') { for (let y = TOP; y < BASE; y++) for (let x = W - 1; x >= 0; x--) if (L.at(x, y)) return [x - 1, y + 1]; }
  if (which === 'br') { for (let y = BASE - 1; y >= TOP; y--) for (let x = W - 1; x >= 0; x--) if (L.at(x, y)) return [x - 1, y - 1]; }
  if (which === 'bl') { for (let y = BASE - 1; y >= TOP; y--) for (let x = 0; x < W; x++) if (L.at(x, y)) return [x + 1, y - 1]; }
  throw new Error(which);
};
// The flare: a fixed star on the C's top-left corner with long dotted streaks.
const [fx, fy] = cornerOf(0, 'tl');
const flare = new Buf(W, H);
for (let d = -34; d <= 34; d++) {
  const a = Math.abs(d);
  const k = a <= 3 ? 'WH' : a <= 9 ? 'C6' : a <= 18 ? 'C5' : 'C4';
  if (a > 18 && a % 2) continue;
  flare.set(fx + d, fy, k);
}
for (let d = -10; d <= 10; d++) {
  const a = Math.abs(d);
  const k = a <= 2 ? 'WH' : a <= 5 ? 'C6' : 'C5';
  if (a > 5 && a % 2) continue;
  flare.set(fx, fy + d, k);
}
for (const [x, y, k] of sparkle(fx, fy, true)) flare.set(x, y, k);
// Twinkling stars on other corners, one beat apart.
const SPARKS = [
  cornerOf(2, 'tl'), cornerOf(5, 'tr'), cornerOf(7, 'br'), cornerOf(4, 'bl'), cornerOf(1, 'tr'),
];

// --------------------------------------------------------------- the text
const LINE1 = 'A TEN-HOUR LO-FI ISLAND VIDEO';
const ROTATE = [
  'SHE IDLES. EVERY SO OFTEN, SOMETHING HAPPENS.',
  'MORE THAN 90 ACTIVITIES ON FOUR TIMERS',
  'EVERY GAG STARTS ON THE NEXT BAR OF THE MUSIC',
  'EVERY SOUND SYNTHESIZED FROM CODE. NO SAMPLES.',
  'RUN IT: PYTHON TOOLS/SERVE.PY',
  'THE SHINE ALSO WAITS FOR THE NEXT BAR.',
];
const text = new Buf(W, H);
const spaced = (s) => [...s].join(' ').replace(/   /g, '  ');
{
  const s = spaced(LINE1);
  drawText(text, s, Math.round((W - textW(s)) / 2), TEXT1_Y, 'C6', 'C5', 'C1');
}
const rotBufs = ROTATE.map((s) => {
  const b = new Buf(W, H);
  if (textW(s) > W - 16) throw new Error(`subtitle too wide: ${s}`);
  drawText(b, s, Math.round((W - textW(s)) / 2), TEXT2_Y, 'W7', 'W5', 'W1');
  return b;
});

// ------------------------------------------------------- palette strip
const used = new Set();
for (const b of [art, sea, catBuf, flare, text, ...rotBufs]) for (const k of usedIn(b)) used.add(k);
['WH', 'C6', 'C5', 'G1', 'G0', 'K'].forEach((k) => used.add(k)); // sparkles, glint, tail
for (const s of strips) for (const [, , k] of s.px) used.add(k);
const usedKeys = Object.keys(PAL).filter((k) => used.has(k));
if (usedKeys.length > 32) throw new Error(`palette overflow: ${usedKeys.length} colours`);
const strip = new Buf(W, H);
{
  // 32 slots, used ones filled in palette order, empty ones left as dark frames
  const x0 = 8;
  for (let i = 0; i < 32; i++) {
    const k = usedKeys[i];
    const sx = x0 + i * 4;
    for (let dy = 0; dy < 3; dy++) for (let dx = 0; dx < 3; dx++) {
      if (k) strip.set(sx + dx, STRIP_Y + 1 + dy, k === 'K' ? 'C0' : k);
      else if (dy === 0 || dx === 0 || dy === 2 || dx === 2) strip.set(sx + dx, STRIP_Y + 1 + dy, 'C0');
    }
  }
  const label = `32 COLOURS, ${usedKeys.length} USED`;
  drawText(strip, label, x0 + 32 * 4 + 4, STRIP_Y, 'C3', 'C3', null);
  const tag = 'LOGO: BRACKISH';
  drawText(strip, tag, W - 8 - textW(tag), STRIP_Y, 'C3', 'C3', null);
}

// ---------------------------------------------------------- write banner
const css = [];
css.push(`svg{shape-rendering:crispEdges}`);
// sparkles: small on beats 2 and 4, big on beat 3, off on beat 1
css.push(`.ss{opacity:0;animation:ss ${BAR}s step-end infinite}@keyframes ss{0%{opacity:0}25%{opacity:1}50%{opacity:0}75%{opacity:1}}`);
css.push(`.sb{animation:sb ${BAR}s step-end infinite}@keyframes sb{0%{opacity:0}50%{opacity:1}75%{opacity:0}}`);
// glint: crosses in three beats from the top of every fourth bar, in 3 px steps
const GL_FROM = -24; const GL_TO = W + 61; const GL_STEPS = (GL_TO - GL_FROM) / 3;
css.push(`.gl{transform:translateX(${W + 60}px);animation:gl ${BAR * 4}s linear infinite}`
  + `@keyframes gl{0%{transform:translateX(${GL_FROM}px);animation-timing-function:steps(${GL_STEPS},end)}`
  + `${(((BEAT * 3) / (BAR * 4)) * 100).toFixed(3)}%,100%{transform:translateX(${GL_TO}px)}}`);
// ripple: each strip steps sideways once a beat
const RIPPLE = [[0, 1, 0, -1], [1, 0, -1, 0], [0, -1, 0, 1], [-1, 0, 1, 0]];
RIPPLE.forEach((seq, i) => {
  css.push(`.r${i}{animation:r${i} ${BAR}s step-end infinite}@keyframes r${i}{${seq.map((v, j) => `${j * 25}%{transform:translateX(${v}px)}`).join('')}}`);
});
// cat: tail flick every two beats, z's one every two beats over two bars
css.push(`.ta{animation:ta ${BEAT * 2}s step-end infinite}@keyframes ta{0%{opacity:1}50%{opacity:0}}`);
css.push(`.tb{opacity:0;animation:tb ${BEAT * 2}s step-end infinite}@keyframes tb{0%{opacity:0}50%{opacity:1}}`);
[1, 2, 3].forEach((z) => {
  const on = ((z * 2 - 1) / 8) * 100;
  css.push(`.z${z}{opacity:${z === 1 ? 1 : 0};animation:z${z} ${BAR * 2}s step-end infinite}@keyframes z${z}{0%{opacity:0}${on.toFixed(2)}%{opacity:1}87.5%{opacity:0}}`);
});
// subtitle: six lines, two bars each, hard cuts
const SLOT = LOOP / ROTATE.length;
css.push(`.rt{opacity:0;animation:rt ${LOOP}s step-end infinite}@keyframes rt{0%{opacity:1}${(Math.floor((SLOT / LOOP) * 1e6) / 1e4)}%{opacity:0}}`);
css.push(`.rt0{opacity:1}`);
// glints on the water: one beat on, three off, staggered
css.push(`.ws{opacity:0;animation:ws ${BAR}s step-end infinite}@keyframes ws{0%{opacity:1}25%{opacity:0}}`);
css.push(`@media (prefers-reduced-motion:reduce){*{animation:none!important}.gl{opacity:0}}`);

const parts = [];
parts.push(`<rect x="0" y="0" width="${W}" height="${H}" rx="4" fill="#000"/>`);
parts.push(`<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="3.5" fill="none" stroke="#213"/>`);
parts.push(`<g>${pathsOf(sea)}</g>`);
// reflection strips
strips.forEach((s, si) => {
  const b = new Buf(W, H);
  for (const [x, y, k] of s.px) b.set(x, y, k);
  parts.push(`<g class="r${si % 4}">${pathsOf(b)}</g>`);
});
parts.push(`<g>${pathsOf(art)}</g>`);
// glint, clipped to the faces
parts.push(`<g clip-path="url(#fc)"><g class="gl"><path fill="${PAL.WH}" d="M0 ${TOP - 2}h4l-${LH + 4} ${LH + 4}h-4zM7 ${TOP - 2}h2l-${LH + 4} ${LH + 4}h-2z"/></g></g>`);
parts.push(`<g>${pathsOf(catBuf)}</g>`);
const tailPath = (pts, k) => `<path fill="${PAL[k]}" d="${pts.map(([dx, dy]) => `M${tailX + dx} ${catY + CAT.length - 2 + dy}h1v1h-1z`).join('')}"/>`;
parts.push(`<g class="ta">${tailPath(TAIL_A, 'G1')}</g><g class="tb">${tailPath(TAIL_B, 'G1')}</g>`);
// z's above the cat's head
const ZG = ['####', '..#.', '.#..', '####'];
[[catX - 3, catY - 5], [catX - 7, catY - 10], [catX - 11, catY - 14]].forEach(([zx, zy], i) => {
  const d = ZG.flatMap((row, ry) => [...row].map((c, rx) => (c === '#' ? `M${zx + rx} ${zy + ry}h1v1h-1z` : ''))).join('');
  parts.push(`<path class="z${i + 1}" fill="${PAL.C6}" d="${d}"/>`);
});
// sun glints on the sea, in the open water between reflections
{
  const spots = [];
  let guard = 0;
  while (spots.length < 6 && guard++ < 500) {
    const x = 12 + Math.floor(rnd() * (W - 24));
    const y = SEA_TOP + 2 + Math.floor(rnd() * 12);
    const clear = [-2, -1, 0, 1, 2].every((d) => !strips.some((st) => st.px.some(([px, py]) => Math.abs(px - x) <= 2 && py === y + (d % 2))));
    if (clear && spots.every(([sx]) => Math.abs(sx - x) > 30)) spots.push([x, y]);
  }
  spots.forEach(([x, y], i) => {
    parts.push(`<path class="ws" style="animation-delay:${(-((i * 3) % 4) * BEAT).toFixed(2)}s" fill="${PAL.WH}" d="M${x} ${y}h1v1h-1zM${x - 1} ${y}h1v1h-1zM${x + 1} ${y}h1v1h-1z"/>`);
  });
}
parts.push(`<g>${pathsOf(flare)}</g>`);
SPARKS.forEach(([sx, sy], i) => {
  const delay = (-i * BEAT).toFixed(2);
  const bs = new Buf(W, H); for (const [x, y, k] of sparkle(sx, sy, false)) bs.set(x, y, k);
  const bb = new Buf(W, H); for (const [x, y, k] of sparkle(sx, sy, true)) bb.set(x, y, k);
  parts.push(`<g class="ss" style="animation-delay:${delay}s">${pathsOf(bs)}</g>`);
  parts.push(`<g class="sb" style="animation-delay:${delay}s">${pathsOf(bb)}</g>`);
});
parts.push(`<g>${pathsOf(text)}</g>`);
rotBufs.forEach((b, i) => {
  const delay = i === 0 ? 0 : -(LOOP - i * SLOT);
  parts.push(`<g class="rt rt${i}" style="animation-delay:${delay}s">${pathsOf(b)}</g>`);
});
parts.push(`<g>${pathsOf(strip)}</g>`);

const title = 'CASTAWAY: a ten-hour lo-fi island video, as a hand-pixelled chrome logo';
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W * 3}" height="${H * 3}" role="img" aria-labelledby="t">`
  + `<title id="t">${title}</title>`
  + `<style>${css.join('')}</style>`
  + `<defs><clipPath id="fc"><path d="${rectD([...rectsOf(faceMask).values()].flat())}"/></clipPath></defs>`
  + parts.join('')
  + `</svg>\n`;
fs.mkdirSync(path.dirname(OUT_MAIN), { recursive: true });
fs.writeFileSync(OUT_MAIN, svg);
console.log(`wrote ${path.relative(process.cwd(), OUT_MAIN)} (${(svg.length / 1024).toFixed(1)} KB, ${usedKeys.length} colours)`);

// ============================================================ the plate
// The same logo up close, the way a paint program's magnify mode shows it:
// the W, lifted out on its own, at 3 units a pixel with the pixel grid drawn
// over it, and notes pointing at the conventions that make it chrome.
const PW = 400;
const PH = 200;
const Z = 3; // plate units per logo pixel
const IL = letters[ISLAND_LETTER];
const CROP = { x: IL.ox - 1, y: TOP - 2, w: Math.ceil(LETTERS[IL.ch].w + LH * SLANT + DEPTH + 3), h: LH + DEPTH + 4 };
const CX = 8; const CY = 10; // where the crop sits on the plate
const plateArt = compose([ISLAND_LETTER]);
const at = (x, y) => [CX + (x - CROP.x + 0.5) * Z, CY + (y - CROP.y + 0.5) * Z];
const inCrop = (x, y) => x >= CROP.x && x < CROP.x + CROP.w && y >= CROP.y && y < CROP.y + CROP.h;
const findPx = (pred, from = 'top') => {
  const ys = [...Array(CROP.h).keys()].map((i) => CROP.y + i);
  if (from === 'bottom') ys.reverse();
  for (const y of ys) for (let x = CROP.x; x < CROP.x + CROP.w; x++) if (pred(x, y)) return [x, y];
  throw new Error(`feature not found in crop ${JSON.stringify(CROP)}`);
};
const leftOf = (L, yr) => { for (let x = 0; x < W; x++) if (L.at(x, TOP + yr)) return x; throw new Error(`row ${yr} empty`); };
const rightOf = (L, yr) => { for (let x = W - 1; x >= 0; x--) if (L.at(x, TOP + yr)) return x; throw new Error(`row ${yr} empty`); };
const NOTES = [
  ['LIT TOP EDGE: WHITE ROW', [rightOf(IL, 0) - 5, TOP]],
  ['SKY: VIOLET TO PALE BLUE', [rightOf(IL, 6) - 4, TOP + 6]],
  ['ONE-PIXEL BLACK OUTLINE', [rightOf(IL, 11) + 1, TOP + 11]],
  ['BANDS MEET: CHECKERBOARD', [rightOf(IL, 14) - 4, TOP + 14]],
  ['AN ISLAND IN THE CHROME', [islandX(HZ - 5), TOP + HZ - 5]],
  ['HORIZON: GLARE, ZIGZAG', findPx((x, y) => IL.at(x, y) && plateArt.get(x, y) === 'WH' && y - TOP > 20 && x > rightOf(IL, 23) - 8)],
  ['EXTRUDED 5 PX DOWN-RIGHT', [rightOf(IL, 32) + 3, TOP + 32]],
  ['SAND: DARK TO LIGHT', [rightOf(IL, 39) - 6, TOP + 39]],
];
const plate = [];
plate.push(`<rect x="0" y="0" width="${PW}" height="${PH}" rx="4" fill="#000"/>`);
plate.push(`<rect x="0.5" y="0.5" width="${PW - 1}" height="${PH - 1}" rx="3.5" fill="none" stroke="#213"/>`);
// the crop, scaled
plate.push(`<g transform="translate(${CX - CROP.x * Z} ${CY - CROP.y * Z}) scale(${Z})">`
  + `<clipPath id="cc"><rect x="${CROP.x}" y="${CROP.y}" width="${CROP.w}" height="${CROP.h}"/></clipPath>`
  + `<g clip-path="url(#cc)">${pathsOf(plateArt, { x0: CROP.x, y0: CROP.y, x1: CROP.x + CROP.w, y1: CROP.y + CROP.h })}</g></g>`);
// the pixel grid
{
  let d = '';
  for (let i = 1; i < CROP.w; i++) d += `M${CX + i * Z} ${CY}v${CROP.h * Z}`;
  for (let j = 1; j < CROP.h; j++) d += `M${CX} ${CY + j * Z}h${CROP.w * Z}`;
  plate.push(`<path d="${d}" fill="none" stroke="#000" stroke-width="0.22" shape-rendering="geometricPrecision"/>`);
  plate.push(`<rect x="${CX - 0.5}" y="${CY - 0.5}" width="${CROP.w * Z + 1}" height="${CROP.h * Z + 1}" fill="none" stroke="${PAL.C2}"/>`);
}
// notes: text on the right, a leader line to the pixel, a ring on the pixel
const plateText = new Buf(PW, PH);
const NX = CX + CROP.w * Z + 14;
{
  const title = 'ONE LETTER, UP CLOSE';
  drawText(plateText, title, NX, 10, 'W6', 'W4', 'W1');
}
const leaders = [];
NOTES.forEach(([label, [px, py]], i) => {
  if (!inCrop(px, py)) throw new Error(`note outside the crop: ${label}`);
  const ty = 27 + i * 18;
  if (textW(label) > PW - NX - 6) throw new Error(`note too wide: ${label}`);
  drawText(plateText, label, NX, ty, 'C6', 'C5', 'C1');
  const [ax, ay] = at(px, py);
  leaders.push(`M${NX - 3} ${ty + 3.5}H${CX + CROP.w * Z + 4}L${ax + 2.2} ${ay}`);
  leaders.push(`M${ax - 2} ${ay - 2}h4v4h-4z`);
});
plate.push(`<path d="${leaders.join('')}" fill="none" stroke="${PAL.W6}" stroke-width="0.6" shape-rendering="geometricPrecision"/>`);
// the palette, every colour the banner uses, in its slots
const PAL_Y = CY + CROP.h * Z + 6;
{
  const label = `THE BANNER'S PALETTE: 32 SLOTS, ${usedKeys.length} USED, ALL 12-BIT`;
  drawText(plateText, label, CX, PAL_Y, 'C5', 'C4', 'C1');
}
plate.push(`<g>${pathsOf(plateText)}</g>`);
{
  const sw = (PW - 2 * CX) / 32;
  let d = '';
  for (let i = 0; i < 32; i++) {
    const k = usedKeys[i];
    const x = CX + i * sw;
    if (k) plate.push(`<rect x="${x.toFixed(2)}" y="${PAL_Y + 10}" width="${(sw - 1).toFixed(2)}" height="7" fill="${PAL[k]}" stroke="${PAL.C1}" stroke-width="0.5"/>`);
    else d += `M${(x + 0.25).toFixed(2)} ${PAL_Y + 10.25}h${(sw - 1.5).toFixed(2)}v6.5h-${(sw - 1.5).toFixed(2)}z`;
  }
  plate.push(`<path d="${d}" fill="none" stroke="${PAL.C1}" stroke-width="0.5"/>`);
}
const plateTitle = 'CASTAWAY logo, magnified: the conventions of a 16-bit chrome logo, labelled';
const plateSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${PW} ${PH}" width="${PW * 3}" height="${PH * 3}" role="img" aria-labelledby="t">`
  + `<title id="t">${plateTitle}</title>`
  + `<style>svg{shape-rendering:crispEdges}</style>`
  + plate.join('')
  + `</svg>\n`;
fs.writeFileSync(OUT_ZOOM, plateSvg);
console.log(`wrote ${path.relative(process.cwd(), OUT_ZOOM)} (${(plateSvg.length / 1024).toFixed(1)} KB)`);
