#!/usr/bin/env node
// 68-insert-disk-boot_opus_5.5: the "Insert-Disk Boot Screen" README header for CASTAWAY
// (catalogue entry mach-02: the Kickstart 1.x screens of a late-80s home computer: the white
// insert-disk card, the four-colour blue-and-orange desktop, and the red-on-black alert box
// whose name came from sitting still on a balance board).
//
// One animated SVG, drawn on a model of the real screen: 640 pixels by 200 lines, every
// pixel twice as tall as it is wide (so the viewBox is 640 x 400 and text comes out
// stretched, the way it did on a TV). One 42-second loop, 14 bars of 3 s at 80 BPM, every
// change a hard cut or a step on the beat (the times live in TL below):
//
//    0.00  the insert-disk card: white, black one-pixel outlines, a periwinkle disk with a
//          grey shutter held in a white hand (hers: a coral hair tie on the wrist), the label
//          upside down, and CASTAWAY beside it. The hand bobs the disk on every beat. This
//          is also the reduced-motion frame.
//    5.25  the hand pushes the disk up and away: inserted.
//    6.00  hard cut to the blue desktop ("Shorebench"): title bar, three icons, a pointer that
//          double-clicks the Castaway disk, three zoom outlines, and one window: the island,
//          in the desktop's four colours. She nods on every beat. The screen title bar reads
//          out each gag while it happens: a bottle that washes straight back, a shark in
//          headphones, a drone delivering more headphones, a coconut that keeps a crab.
//   33.00  the alert drops in at the top and pushes the desktop down: black box, red frame
//          that flashes with the beat (on one beat, off the next: 0.67 Hz), two lines of red
//          text. Nothing has failed. She has just been sitting very still.
//   39.00  reboot: dark grey, light grey, white, and at 41.25 the card again.
//
// No <text>, no fonts, nothing external: the 8x8 face and the title face are bitmaps in this
// file, emitted as merged rects. Everything is drawn into pixel canvases (shapes are filled and
// outlined on the pixel grid, so every edge is a real one-pixel line), and colours come from
// four tiny palettes. Deterministic: a seeded PRNG places the sea's wave dashes.
//
//   node 68-insert-disk-boot_opus_5.5.mjs             write assets/<slug>.svg
//   node 68-insert-disk-boot_opus_5.5.mjs --at=13 DIR  instead write a still of second 13 into DIR

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '68-insert-disk-boot_opus_5.5';
const OUT = path.join(HERE, '..', 'assets', `${SLUG}.svg`);

const argAt = process.argv.find((a) => a.startsWith('--at='));
const STILL = argAt ? Number(argAt.slice(5)) : null;         // seconds, for a debug still
const STILL_DIR = argAt ? process.argv[process.argv.indexOf(argAt) + 1] : null;

// ============================================================================ the machine
const SW = 640, SH = 200;                 // hires pixels, lines (NTSC)
const T = 42, BEAT = 0.75, BAR = 3;       // the loop: 14 bars at 80 BPM
const BZ = 14, BZB = 30;                  // bezel: sides/top, bottom strip
const VW = SW + BZ * 2, VH = SH * 2 + BZ + BZB;

const COL = {
  // the card
  w: '#ffffff', k: '#000000', p: '#7777cc', P: '#4646a8', g: '#aaaaaa', c: '#ee7a5f',
  // the bench: blue, white, near-black, orange
  B: '#0055aa', W: '#ffffff', K: '#000022', O: '#ff8800',
  // the alert
  r: '#ff0000',
};

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

// ============================================================================ pixel canvases
// A canvas holds colour keys per pixel. svg() merges runs into rects (horizontal runs, then
// identical runs on following lines) and emits one path per colour, each pixel 1 x 2 units.
class Cv {
  constructor() { this.m = new Map(); }
  set(x, y, c) {
    x = Math.round(x); y = Math.round(y);
    if (x < 0 || y < 0 || x >= SW || y >= SH) return;
    if (c == null) this.m.delete(y * SW + x); else this.m.set(y * SW + x, c);
  }
  get(x, y) { return this.m.get(y * SW + x); }
  rect(x0, y0, x1, y1, c) { for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) this.set(x, y, c); }
  frame(x0, y0, x1, y1, c) { this.rect(x0, y0, x1, y0 + 1, c); this.rect(x0, y1 - 1, x1, y1, c); this.rect(x0, y0, x0 + 1, y1, c); this.rect(x1 - 1, y0, x1, y1, c); }
  svg(remap = {}) {
    const rows = new Map();
    for (const [k, c] of this.m) {
      const y = Math.floor(k / SW), x = k % SW;
      if (!rows.has(y)) rows.set(y, []);
      rows.get(y).push([x, remap[c] || c]);
    }
    const done = [];
    let open = new Map();
    for (const y of [...rows.keys()].sort((a, b) => a - b)) {
      const px = rows.get(y).sort((a, b) => a[0] - b[0]);
      const runs = [];
      for (const [x, c] of px) {
        const last = runs[runs.length - 1];
        if (last && last.c === c && last.x1 === x) last.x1++;
        else runs.push({ x0: x, x1: x + 1, c });
      }
      const next = new Map();
      for (const r of runs) {
        const key = `${r.x0},${r.x1},${r.c}`;
        const o = open.get(key);
        if (o && o.y + o.h === y) { o.h++; next.set(key, o); } else {
          const n = { x: r.x0, y, w: r.x1 - r.x0, h: 1, c: r.c };
          done.push(n); next.set(key, n);
        }
      }
      open = next;
    }
    const by = new Map();
    for (const r of done) { if (!by.has(r.c)) by.set(r.c, []); by.get(r.c).push(r); }
    let s = '';
    for (const [c, rs] of [...by].sort()) {
      let d = '', px = 0, py = 0;
      for (const r of rs) {
        const X = r.x, Y = r.y * 2;
        d += d ? `m${X - px} ${Y - py}` : `M${X} ${Y}`;
        d += `h${r.w}v${r.h * 2}h-${r.w}z`;
        px = X; py = Y;
      }
      s += `<path fill="${COL[c]}" d="${d}"/>`;
    }
    return s;
  }
}

// Shapes are inside-tests in visual units (x, y with y = 2 x line). fill() samples each pixel's
// centre and draws boundary pixels (any of the four neighbours outside) in the line colour.
const inPoly = (pts) => (x, y) => {
  let c = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i], [xj, yj] = pts[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
};
const inEll = (cx, cy, rx, ry) => (x, y) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1;
const inCap = (ax, ay, bx, by, r) => (x, y) => {
  const dx = bx - ax, dy = by - ay;
  const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy || 1)));
  return (x - ax - t * dx) ** 2 + (y - ay - t * dy) ** 2 <= r * r;
};
const inTaper = (ax, ay, ra, bx, by, rb) => (x, y) => {
  const dx = bx - ax, dy = by - ay;
  const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy || 1)));
  const r = ra + (rb - ra) * t;
  return (x - ax - t * dx) ** 2 + (y - ay - t * dy) ** 2 <= r * r;
};
const inRect = (x0, y0, x1, y1) => (x, y) => x >= x0 && x < x1 && y >= y0 && y < y1;
const any = (...fs) => (x, y) => fs.some((f) => f(x, y));
const both = (a, b) => (x, y) => a(x, y) && b(x, y);
const not = (a) => (x, y) => !a(x, y);

function fill(cv, f, fillC, lineC, bb = [0, 0, SW, SH * 2], keep = null) {
  const x0 = Math.max(0, Math.floor(bb[0]) - 1), x1 = Math.min(SW, Math.ceil(bb[2]) + 1);
  const y0 = Math.max(0, Math.floor(bb[1] / 2) - 1), y1 = Math.min(SH, Math.ceil(bb[3] / 2) + 1);
  const m = (x, y) => f(x + 0.5, y * 2 + 1);
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
    if (!m(x, y) || (keep && !keep(x + 0.5, y * 2 + 1))) continue;
    const edge = lineC && (!m(x - 1, y) || !m(x + 1, y) || !m(x, y - 1) || !m(x, y + 1));
    const c = edge ? lineC : fillC;
    if (c) cv.set(x, y, c);
  }
}
// a one-pixel line between two visual points
function line(cv, x0, y0, x1, y1, c) {
  let ax = Math.round(x0), ay = Math.floor(y0 / 2);
  const bx = Math.round(x1), by = Math.floor(y1 / 2);
  const dx = Math.abs(bx - ax), dy = -Math.abs(by - ay), sx = ax < bx ? 1 : -1, sy = ay < by ? 1 : -1;
  let err = dx + dy;
  for (;;) {
    cv.set(ax, ay, c);
    if (ax === bx && ay === by) break;
    const e2 = 2 * err;
    if (e2 >= dy) { err += dy; ax += sx; }
    if (e2 <= dx) { err += dx; ay += sy; }
  }
}
// quadratic bezier sampled as a list of visual points
const quad = (a, b, c, n) => Array.from({ length: n + 1 }, (_, i) => {
  const t = i / n, u = 1 - t;
  return [u * u * a[0] + 2 * u * t * b[0] + t * t * c[0], u * u * a[1] + 2 * u * t * b[1] + t * t * c[1]];
});

// ============================================================================ the 8x8 face
// An original 8x8 screen face: two-pixel stems, slab feet on the capitals that have room for
// them. Shown on tall pixels, so each glyph is 8 units wide and 16 tall.
const FONT_SRC = {
  A: '..###...|.##.##..|##...##.|##...##.|#######.|##...##.|##...##.|........',
  B: '######..|.##..##.|.##..##.|.#####..|.##..##.|.##..##.|######..|........',
  C: '..####..|.##..##.|##......|##......|##......|.##..##.|..####..|........',
  D: '#####...|.##.##..|.##..##.|.##..##.|.##..##.|.##.##..|#####...|........',
  E: '#######.|.##...#.|.##.#...|.####...|.##.#...|.##...#.|#######.|........',
  F: '#######.|.##...#.|.##.#...|.####...|.##.#...|.##.....|####....|........',
  G: '..####..|.##..##.|##......|##......|##..###.|.##..##.|..#####.|........',
  H: '##...##.|##...##.|##...##.|#######.|##...##.|##...##.|##...##.|........',
  I: '.####...|..##....|..##....|..##....|..##....|..##....|.####...|........',
  J: '...####.|....##..|....##..|....##..|##..##..|##..##..|.####...|........',
  K: '###..##.|.##.##..|.####...|.###....|.####...|.##.##..|###..##.|........',
  L: '####....|.##.....|.##.....|.##.....|.##...#.|.##..##.|#######.|........',
  M: '##...##.|###.###.|#######.|##.#.##.|##...##.|##...##.|##...##.|........',
  N: '##...##.|###..##.|####.##.|##.####.|##..###.|##...##.|##...##.|........',
  O: '..###...|.##.##..|##...##.|##...##.|##...##.|.##.##..|..###...|........',
  P: '######..|.##..##.|.##..##.|.#####..|.##.....|.##.....|####....|........',
  Q: '..###...|.##.##..|##...##.|##...##.|##.#.##.|.##.##..|..##.##.|........',
  R: '######..|.##..##.|.##..##.|.#####..|.##.##..|.##..##.|###..##.|........',
  S: '.#####..|##...##.|##......|.#####..|.....##.|##...##.|.#####..|........',
  T: '######..|#.##.#..|..##....|..##....|..##....|..##....|.####...|........',
  U: '##...##.|##...##.|##...##.|##...##.|##...##.|##...##.|.#####..|........',
  V: '##...##.|##...##.|##...##.|##...##.|.##.##..|..###...|...#....|........',
  W: '##...##.|##...##.|##...##.|##.#.##.|#######.|###.###.|##...##.|........',
  X: '##...##.|.##.##..|..###...|..###...|..###...|.##.##..|##...##.|........',
  Y: '##..##..|##..##..|##..##..|.####...|..##....|..##....|.####...|........',
  Z: '#######.|#...##..|...##...|..##....|.##.....|##...#..|#######.|........',
  a: '........|........|.####...|....##..|.#####..|##..##..|.###.##.|........',
  b: '###.....|.##.....|.#####..|.##..##.|.##..##.|.##..##.|##.###..|........',
  c: '........|........|.#####..|##...##.|##......|##...##.|.#####..|........',
  d: '...###..|....##..|.#####..|##..##..|##..##..|##..##..|.###.##.|........',
  e: '........|........|.#####..|##...##.|#######.|##......|.#####..|........',
  f: '..###...|.##.##..|.##.....|####....|.##.....|.##.....|####....|........',
  g: '........|........|.###.##.|##..##..|##..##..|.#####..|....##..|#####...',
  h: '###.....|.##.....|.##.##..|.###.##.|.##..##.|.##..##.|###..##.|........',
  i: '..##....|........|.###....|..##....|..##....|..##....|.####...|........',
  j: '....##..|........|...###..|....##..|....##..|##..##..|##..##..|.####...',
  k: '###.....|.##.....|.##..##.|.##.##..|.####...|.##.##..|###..##.|........',
  l: '.###....|..##....|..##....|..##....|..##....|..##....|.####...|........',
  m: '........|........|##.##...|#######.|##.#.##.|##.#.##.|##...##.|........',
  n: '........|........|##.###..|.##..##.|.##..##.|.##..##.|.##..##.|........',
  o: '........|........|.#####..|##...##.|##...##.|##...##.|.#####..|........',
  p: '........|........|##.###..|.##..##.|.##..##.|.#####..|.##.....|####....',
  q: '........|........|.###.##.|##..##..|##..##..|.#####..|....##..|...####.',
  r: '........|........|##.###..|.###.##.|.##.....|.##.....|####....|........',
  s: '........|........|.#####..|##......|.#####..|.....##.|######..|........',
  t: '...#....|..##....|######..|..##....|..##....|..##.##.|...###..|........',
  u: '........|........|##..##..|##..##..|##..##..|##..##..|.###.##.|........',
  v: '........|........|##...##.|##...##.|##...##.|.##.##..|..###...|........',
  w: '........|........|##...##.|##.#.##.|##.#.##.|#######.|.##.##..|........',
  x: '........|........|##...##.|.##.##..|..###...|.##.##..|##...##.|........',
  y: '........|........|##...##.|##...##.|##...##.|.######.|.....##.|.#####..',
  z: '........|........|#######.|#...##..|..##....|.##...#.|#######.|........',
  0: '..###...|.##.##..|##..###.|##.#.##.|###..##.|.##.##..|..###...|........',
  1: '...##...|..###...|.####...|...##...|...##...|...##...|.######.|........',
  2: '.#####..|##...##.|.....##.|...###..|.###....|##...##.|#######.|........',
  3: '.#####..|##...##.|.....##.|...###..|.....##.|##...##.|.#####..|........',
  4: '....##..|...###..|..####..|.##.##..|#######.|....##..|...####.|........',
  5: '#######.|##......|######..|.....##.|.....##.|##...##.|.#####..|........',
  6: '..####..|.##.....|##......|######..|##...##.|##...##.|.#####..|........',
  7: '#######.|##...##.|....##..|...##...|..##....|..##....|..##....|........',
  8: '.#####..|##...##.|##...##.|.#####..|##...##.|##...##.|.#####..|........',
  9: '.#####..|##...##.|##...##.|.######.|.....##.|....##..|.####...|........',
  '.': '........|........|........|........|........|..##....|..##....|........',
  ',': '........|........|........|........|........|..##....|..##....|.##.....',
  ':': '........|..##....|..##....|........|........|..##....|..##....|........',
  ';': '........|..##....|..##....|........|........|..##....|..##....|.##.....',
  '!': '..##....|..##....|..##....|..##....|..##....|........|..##....|........',
  '?': '.#####..|##...##.|....##..|...##...|...##...|........|...##...|........',
  "'": '..##....|..##....|.##.....|........|........|........|........|........',
  '-': '........|........|........|.#####..|........|........|........|........',
  '(': '...##...|..##....|.##.....|.##.....|.##.....|..##....|...##...|........',
  ')': '.##.....|..##....|...##...|...##...|...##...|..##....|.##.....|........',
  '/': '.....##.|....##..|...##...|..##....|.##.....|##......|........|........',
  '#': '.##.##..|.##.##..|#######.|.##.##..|#######.|.##.##..|.##.##..|........',
  '>': '.##.....|..##....|...##...|....##..|...##...|..##....|.##.....|........',
  '+': '........|..##....|..##....|######..|..##....|..##....|........|........',
  '=': '........|........|######..|........|######..|........|........|........',
  '_': '........|........|........|........|........|........|........|#######.',
};
const FONT = new Map();
for (const [ch, src] of Object.entries(FONT_SRC)) {
  const rows = src.split('|');
  if (rows.length !== 8 || rows.some((r) => r.length !== 8)) throw new Error(`bad glyph ${ch}`);
  FONT.set(ch, rows);
}
// draw a string at pixel x, line y. flip: rotated 180 degrees inside its own box.
function text(cv, s, x, y, c, { flip = false } = {}) {
  const n = [...s].length, w = n * 8;
  [...s].forEach((ch, i) => {
    if (ch === ' ') return;
    const g = FONT.get(ch);
    if (!g) throw new Error(`no glyph for ${JSON.stringify(ch)}`);
    g.forEach((row, gy) => [...row].forEach((v, gx) => {
      if (v !== '#') return;
      const px = i * 8 + gx, py = gy;
      if (flip) cv.set(x + w - 1 - px, y + 7 - py, c); else cv.set(x + px, y + py, c);
    }));
  });
}
const textW = (s) => [...s].length * 8;

// ============================================================================ the title face
// Eleven cells by fourteen, slab serifs, drawn in cells three pixels wide and two lines tall,
// then slanted one pixel every two lines like a version number on a boot card.
const TITLE_SRC = {
  C: [
    '...#####..',
    '.###...###',
    '###.....##',
    '###......#',
    '###.......',
    '###.......',
    '###.......',
    '###.......',
    '###.......',
    '###.......',
    '###......#',
    '###.....##',
    '.###...###',
    '...#####..',
  ],
  A: [
    '...###....',
    '...####...',
    '...####...',
    '..##.###..',
    '..##.###..',
    '..##..###.',
    '.##...###.',
    '.##...###.',
    '.########.',
    '##.....###',
    '##.....###',
    '##.....###',
    '##.....###',
    '###...####',
  ],
  S: [
    '..#####.#.',
    '.###...###',
    '###.....##',
    '###......#',
    '####......',
    '.######...',
    '..#######.',
    '.....#####',
    '.......###',
    '#.......##',
    '##......##',
    '###.....##',
    '####...##.',
    '#.#####...',
  ],
  T: [
    '###########',
    '##..###..##',
    '#...###...#',
    '....###....',
    '....###....',
    '....###....',
    '....###....',
    '....###....',
    '....###....',
    '....###....',
    '....###....',
    '....###....',
    '...#####...',
    '..#######..',
  ],
  W: [
    '###.....###',
    '.##.....##.',
    '.##.....##.',
    '.##.....##.',
    '.##..#..##.',
    '.##.###.##.',
    '.##.###.##.',
    '.##.###.##.',
    '.#########.',
    '.####.####.',
    '.###...###.',
    '.###...###.',
    '.##.....##.',
    '.#.......#.',
  ],
  Y: [
    '####...####',
    '.###....##.',
    '.###....##.',
    '..###..##..',
    '..###..##..',
    '...#####...',
    '...####....',
    '....###....',
    '....###....',
    '....###....',
    '....###....',
    '....###....',
    '...#####...',
    '..#######..',
  ],
};
const TCW = 3, TCH = 2, TGAP = 1;            // cell size and gap between letters, in cells
function titleText(cv, s, x, y, c, slant = true) {
  let cx = 0;
  for (const ch of s) {
    const g = TITLE_SRC[ch];
    g.forEach((row, gy) => [...row].forEach((v, gx) => {
      if (v !== '#') return;
      for (let dy = 0; dy < TCH; dy++) {
        const ly = gy * TCH + dy;
        const sh = slant ? Math.floor((g.length * TCH - 1 - ly) / 4) : 0;
        for (let dx = 0; dx < TCW; dx++) cv.set(x + (cx + gx) * TCW + dx + sh, y + ly, c);
      }
    }));
    cx += g[0].length + TGAP;
  }
}
const titleW = (s) => ([...s].reduce((a, ch) => a + TITLE_SRC[ch][0].length + TGAP, 0) - TGAP) * TCW + 7;

// ============================================================================ the timeline
// vis(): visible during a union of [a, b) intervals (seconds). move(): stepped translate
// through [t, dx, dy] points (visual units), holding each until the next. Both return the
// attributes for a <g>; the base attributes are the state at t = 0, which is also what a
// reduced-motion viewer sees. With --at, they return the state at that second instead.
const css = [];
const DEFS = [];
const kfCache = new Map();
let kc = 0;
const num = (v) => +v.toFixed(3);
const pct = (t) => `${num((t / T) * 100)}%`;
const wrap = (t) => ((t % T) + T) % T;
function keyframes(prefix, body) {
  if (kfCache.has(body)) return kfCache.get(body);
  const name = `${prefix}${(kc++).toString(36)}`;
  css.push(`@keyframes ${name}{${body}}.${name}{animation-name:${name}}`);
  kfCache.set(body, name);
  return name;
}
function vis(intervals) {
  const iv = [];
  for (const [a, b] of intervals) {           // allow intervals that wrap past the loop end
    if (b - a >= T) { iv.push([0, T]); continue; }
    const A = wrap(a), B = A + (b - a);
    if (B <= T) iv.push([A, B]); else { iv.push([A, T]); iv.push([0, B - T]); }
  }
  const on = (t) => iv.some(([a, b]) => t >= a && t < b);
  if (STILL != null) return `opacity="${on(wrap(STILL)) ? 1 : 0}"`;
  const pts = [...new Set([0, ...iv.flat()])].filter((t) => t >= 0 && t < T).sort((a, b) => a - b);
  let body = '', prev = null;
  for (const t of pts) { const v = on(t) ? 1 : 0; if (v !== prev) { body += `${pct(t)}{opacity:${v}}`; prev = v; } }
  body += `100%{opacity:${on(T - 1e-6) ? 1 : 0}}`;
  if (!body.includes('opacity:0') ) return '';
  const name = keyframes('v', body);
  return `class="a ${name}"${on(0) ? '' : ' opacity="0"'}`;
}
function move(points) {
  const pts = points.map(([t, x, y]) => [wrap(t), x, y]).sort((a, b) => a[0] - b[0]);
  const at = (t) => { let cur = pts[pts.length - 1]; for (const p of pts) if (p[0] <= t) cur = p; return cur; };
  const tr = ([, x, y]) => `translate(${num(x)} ${num(y)})`;
  if (STILL != null) return `transform="${tr(at(wrap(STILL)))}"`;
  let body = '';
  const all = [...new Set([0, ...pts.map((p) => p[0])])].sort((a, b) => a - b);
  for (const t of all) { const [, x, y] = at(t); body += `${pct(t)}{transform:translate(${num(x)}px,${num(y)}px)}`; }
  const [, lx, ly] = at(T - 1e-6);
  body += `100%{transform:translate(${num(lx)}px,${num(ly)}px)}`;
  const name = keyframes('m', body);
  return `class="a ${name}" transform="${tr(at(0))}"`;
}
const g = (attrs, inner) => (attrs ? `<g ${attrs}>${inner}</g>` : inner);
const beats = (a, b) => { const out = []; for (let t = a; t < b - 1e-9; t += BEAT) out.push(num(t)); return out; };

// ============================================================================ phases
// Every change lands on a beat (0.75 s); each gag gets whole bars (3 s).
const TL = {
  insert: 5.25,     // the hand pushes the disk in
  bench: 6.0,       // hard cut to the desktop
  icons: 6.75,      // icons and pointer
  select: 8.0,      // double-click on the disk icon
  zoom: 8.25,       // three zoom outlines, a quarter of a second each
  win: 9.0,         // the window opens: theme bar
  bottle: 12.0,     // two bars
  shark: 18.0,      // two bars
  drone: 24.0,      // two bars
  coconut: 30.0,    // one bar
  alert: 33.0,      // two bars
  reboot: 39.0,     // dark grey, light grey, white
  card: 41.25,      // the card again, and round
};
const CARD_ON = [[TL.card, T + TL.bench]];      // the card (wraps through 0)
const BENCH_ON = [[TL.bench, TL.reboot]];
const ALERT_AT = TL.alert, ALERT_END = TL.reboot;
const WIN_AT = TL.win;

// ---------------------------------------------------------------------------- the card
const CARD_DX = -28;
function buildCard() {
  const bg = `<rect width="${SW}" height="${SH * 2}" fill="${COL.w}"/>`;

  // the disk, its shutter, its label (upside down), and the hand that holds it
  const L = 58, TOP = 94, W = 182, H = 190;
  const disk = new Cv();
  const body = inPoly([[L, TOP], [L + W - 18, TOP], [L + W, TOP + 18], [L + W, TOP + H], [L, TOP + H]]);
  fill(disk, body, 'p', 'k', [L, TOP, L + W, TOP + H]);
  // shutter recess and shutter
  fill(disk, inRect(L + 36, TOP, L + 150, TOP + 70), 'P', 'k', [L + 36, TOP, L + 150, TOP + 70]);
  fill(disk, inRect(L + 52, TOP, L + 134, TOP + 66), 'g', 'k', [L + 52, TOP, L + 134, TOP + 66]);
  fill(disk, inRect(L + 106, TOP + 12, L + 124, TOP + 52), 'k', null, [L + 106, TOP + 12, L + 124, TOP + 52]);
  line(disk, L + 56, TOP + 60, L + 130, TOP + 60, 'k');
  // write-protect window, bottom left
  fill(disk, inRect(L + 6, TOP + H - 26, L + 16, TOP + H - 8), 'k', null, [L + 6, TOP + H - 26, L + 16, TOP + H - 8]);
  // label: a white card with a blue band and ruled lines, its writing upside down
  const lx0 = L + 22, lx1 = L + 166, ly0 = TOP + 88, ly1 = TOP + H - 6;
  fill(disk, inRect(lx0, ly0, lx1, ly1), 'w', 'k', [lx0, ly0, lx1, ly1]);
  disk.rect(lx0 + 1, Math.floor(ly1 / 2) - 4, lx1 - 1, Math.floor(ly1 / 2) - 1, 'P');
  const l0 = Math.floor(ly0 / 2);
  for (const r of [l0 + 8, l0 + 20, l0 + 32]) disk.rect(lx0 + 6, r, lx1 - 6, r + 1, 'p');
  text(disk, 'CASTAWAY', lx0 + 40, l0 + 24, 'k', { flip: true });
  text(disk, 'disk 1 of 1', lx0 + 28, l0 + 12, 'P', { flip: true });

  // the hand: four fingers curled over the right edge, the back of the hand beyond, the wrist
  // running off the bottom of the screen with a coral hair tie round it
  const hand = new Cv();
  const fingers = [            // tip x, y, r; base x, y, r: index at the top, little at the bottom
    [216, 150, 8.6, 292, 145, 11],
    [205, 172, 9.2, 296, 169, 11.5],
    [209, 195, 8.8, 296, 195, 11],
    [221, 217, 7.8, 292, 221, 10],
  ].map((v) => inTaper(...v));
  const palm = inPoly([[258, 136], [282, 126], [306, 132], [320, 160], [324, 204], [318, 238], [306, 258], [290, 268], [274, 266], [264, 244]]);
  const wrist = inPoly([[266, 252], [318, 236], [344, 404], [276, 404]]);
  const HBB = [195, 116, 350, 404];
  fill(hand, any(palm, wrist, ...fingers), 'w', 'k', HBB);
  // each finger keeps its own outline up to the knuckles, so they read as four, curled over the
  // disk's front edge, with a crease at the last joint
  fingers.forEach((fg, i) => fill(hand, fg, 'w', 'k', HBB, (x) => x < [262, 270, 270, 264][i]));
  for (const [x, y, r] of [[234, 149, 8], [224, 171, 8.6], [228, 195, 8.2], [238, 218, 7.4]]) line(hand, x, y - r + 4, x - 1, y + r - 4, 'k');
  // fingernails: we see the back of the hand, so each fingertip shows its nail
  for (const [x, y, rx, ry] of [[216, 149, 5, 4.2], [205, 171, 5.4, 4.6], [209, 194, 5.2, 4.4], [221, 216, 4.6, 4]]) {
    fill(hand, inEll(x + 2, y, rx, ry), 'w', 'k', [x - 6, y - 8, x + 10, y + 8]);
  }
  // the edge of the thumb, round the back, and a crease where the wrist bends
  line(hand, 304, 138, 314, 160, 'k');
  line(hand, 310, 250, 298, 262, 'k');
  // hair tie: a coral band round the wrist, with a highlight
  const tie = both(wrist, (x, y) => y > 322 - (x - 280) * 0.14 && y < 334 - (x - 280) * 0.14);
  fill(hand, tie, 'c', 'k', [270, 300, 346, 350]);
  line(hand, 290, 327, 300, 325, 'w');

  // the name and the small print beside it
  const tx = 360;
  const words = new Cv();
  titleText(words, 'CASTAWAY', tx + 1, 51, 'p');       // shadow, one pixel right and one line down
  titleText(words, 'CASTAWAY', tx, 50, 'k');
  text(words, 'a ten-hour lo-fi island video', tx, 88, 'k');
  text(words, 'in which almost nothing happens.', tx, 98, 'k');
  text(words, 'Insert disk. Then wait.', tx, 120, 'P');
  text(words, 'python tools/serve.py', tx, 134, 'k');
  text(words, '127.0.0.1:8765', tx, 144, 'k');
  const ver = new Cv();
  text(ver, 'Sandstart 1.0', SW - 12 - textW('Sandstart 1.0'), SH - 13, 'p');   // the boot ROM's version, small

  // the hand bobs the disk on every beat while it waits, then pushes it up and out of the
  // top of the screen: inserted
  const I = TL.insert;
  const lift = [[0, 0, 0], [I, 0, -16], [I + 0.25, 0, -60], [I + 0.5, 0, -400], [TL.card, 0, 0]];
  for (const t of [...beats(0, I), ...beats(TL.card, T)]) lift.push([t, 0, 2], [t + 0.25, 0, 0]);
  // the disk, hand and name sit CARD_DX pixels left of where they were drawn, so the margins
  // either side of the group match (about 30 pixels each)
  return (
    bg +
    `<g transform="translate(${CARD_DX} 0)">` +
    g(move(lift), disk.svg() + hand.svg()) +
    words.svg() +
    '</g>' +
    ver.svg()
  );
}

// ---------------------------------------------------------------------------- the bench
// Screen title bar, icons, pointer, zoom outlines and the window with the island.
const WX0 = 12, WY0 = 13, WX1 = 520, WY1 = 196;       // window, pixels and lines
const IX0 = WX0 + 2, IY0 = WY0 + 11, IX1 = WX1 - 2, IY1 = WY1 - 2;  // its inside

function iconDisk(cv, x, y, sel) {
  const f = sel ? 'K' : 'W', l = sel ? 'W' : 'K', a = sel ? 'B' : 'O';
  fill(cv, inPoly([[x, y], [x + 34, y], [x + 40, y + 6], [x + 40, y + 36], [x, y + 36]]), f, l, [x, y, x + 40, y + 36]);
  fill(cv, inRect(x + 9, y, x + 31, y + 13), a, l, [x + 9, y, x + 31, y + 13]);
  cv.rect(x + 24, Math.floor(y / 2) + 1, x + 27, Math.floor(y / 2) + 5, l);
  fill(cv, inRect(x + 6, y + 18, x + 34, y + 36), sel ? 'B' : 'W', l, [x + 6, y + 18, x + 34, y + 36]);
  for (const r of [y + 24, y + 30]) line(cv, x + 10, r, x + 30, r, l);
}
function iconRaft(cv, x, y) {
  for (let i = 0; i < 3; i++) fill(cv, inCap(x + 4, y + 6 + i * 9, x + 40, y + 6 + i * 9, 4.6), 'O', 'K', [x, y, x + 46, y + 32]);
  line(cv, x + 12, y + 2, x + 12, y + 30, 'K');
  line(cv, x + 32, y + 2, x + 32, y + 30, 'K');
  // a little mast with a white sail
  line(cv, x + 22, y - 18, x + 22, y + 2, 'K');
  fill(cv, inPoly([[x + 24, y - 18], [x + 38, y - 2], [x + 24, y - 2]]), 'W', 'K', [x + 22, y - 20, x + 40, y]);
}
function iconTide(cv, x, y) {
  // the bench's bin: a sandcastle with the tide coming in over its foot. Whatever goes in, the
  // tide takes.
  const castle = any(
    inRect(x + 6, y + 14, x + 38, y + 36),
    inRect(x + 6, y + 6, x + 12, y + 14), inRect(x + 19, y + 6, x + 25, y + 14), inRect(x + 32, y + 6, x + 38, y + 14),
    inRect(x + 16, y - 6, x + 28, y + 14),
  );
  fill(cv, castle, 'O', 'K', [x, y - 8, x + 44, y + 36]);
  fill(cv, inRect(x + 19, y + 24, x + 25, y + 36), 'K', null, [x + 18, y + 22, x + 26, y + 36]);
  line(cv, x + 22, y - 6, x + 22, y - 18, 'K');
  fill(cv, inPoly([[x + 23, y - 18], [x + 33, y - 14], [x + 23, y - 10]]), 'W', 'K', [x + 22, y - 20, x + 35, y - 8]);
  const wave = (X, Y) => Y > y + 30 + 3 * Math.sin((X - x) / 4) && Y < y + 42;
  fill(cv, both(inRect(x - 4, y + 22, x + 48, y + 42), wave), 'W', 'K', [x - 4, y + 22, x + 48, y + 42]);
}
function pointer(cv, x, y) {
  // sprite pixels are two hires pixels wide: square on screen
  const P = [
    'KK.........',
    'KOK........',
    'KOOK.......',
    'KOWOK......',
    'KOWWOK.....',
    'KOWWWOK....',
    'KOWWWWOK...',
    'KOWWOKKKK..',
    'KOOKOK.....',
    'KK..KOK....',
    '.....KOK...',
    '......KK...',
  ];
  P.forEach((row, ry) => [...row].forEach((v, rx) => { if (v !== '.') { cv.set(x + rx * 2, y + ry, v); cv.set(x + rx * 2 + 1, y + ry, v); } }));
}

function buildBench() {
  let out = `<rect width="${SW}" height="${SH * 2}" fill="${COL.B}"/>`;

  // ---- screen title bar: white, with the text in blue; it reads out what is happening
  const bar = new Cv();
  bar.rect(0, 0, SW, 10, 'W');
  bar.rect(0, 10, SW, 11, 'K');
  // depth gadgets, right end
  for (const [x0, solid] of [[580, false], [608, true]]) {
    bar.rect(x0 - 1, 0, x0, 10, 'K');
    bar.frame(x0 + 5, 2, x0 + 17, 7, 'K');
    if (solid) bar.rect(x0 + 10, 4, x0 + 22, 9, 'B'); else bar.frame(x0 + 10, 4, x0 + 22, 9, 'K');
  }
  out += bar.svg();
  const msgs = [
    [[TL.bench, TL.win], 'Shorebench 1.0.   36000 free seconds.'],
    [[TL.win, TL.bottle], 'Theme: 80 BPM in F major. Every sound made from code.'],
    [[TL.bottle, TL.bottle + 3], 'Post: one bottle, thrown out to sea.'],
    [[TL.bottle + 3, TL.shark], 'Post: delivered, to her. A reply will follow.'],
    [[TL.shark, TL.drone], 'Visitor: one shark, in headphones, nodding along.'],
    [[TL.drone, TL.coconut], 'Drone: one parcel. Contents: more headphones.'],
    [[TL.coconut, TL.alert], 'Coconut: landed on a crab. The crab kept it.'],
    [[TL.alert, TL.reboot], 'Shorebench 1.0.   Idle. Still idle.'],
  ];
  for (const [iv, s] of msgs) { const cv = new Cv(); text(cv, s, 6, 1, 'B'); out += g(vis([iv]), cv.svg()); }

  // ---- icons, right column
  const ix = 566;
  const icons = new Cv();
  iconRaft(icons, ix - 2, 128);
  text(icons, 'Raft Disk', ix + 20 - textW('Raft Disk') / 2, 86, 'W');
  // the bin sits straight under Raft Disk, high enough to stay whole when the alert pushes
  // the screen down
  iconTide(icons, ix, 232);
  text(icons, 'Tide', ix + 22 - textW('Tide') / 2, 140, 'W');
  const iconOn = vis([[TL.icons, TL.reboot]]);
  const diskIcon = new Cv(); iconDisk(diskIcon, ix, 30, false);
  const diskSel = new Cv(); iconDisk(diskSel, ix, 30, true);
  const diskName = new Cv(); text(diskName, 'Castaway', ix + 20 - textW('Castaway') / 2, 35, 'W');
  out += g(iconOn, icons.svg() + diskName.svg() + g(vis([[TL.icons, TL.select]]), diskIcon.svg()) + g(vis([[TL.select, TL.reboot]]), diskSel.svg()));

  // ---- zoom outlines from the icon out to the window
  const zooms = [[TL.zoom, 0.33], [TL.zoom + 0.25, 0.66], [TL.zoom + 0.5, 1]];
  for (const [t, f] of zooms) {
    const z = new Cv();
    const lerp = (a, b) => Math.round(a + (b - a) * f);
    const x0 = lerp(ix, WX0), y0 = lerp(15, WY0), x1 = lerp(ix + 40, WX1), y1 = lerp(33, WY1);
    z.frame(x0, y0, x1, y1, 'O');
    out += g(vis([[t, t + 0.25]]), z.svg());
  }

  // ---- the window
  out += g(vis([[WIN_AT, TL.reboot]]), buildWindow());

  // ---- the pointer: in from the middle, double-click on the disk, then off to rest in the
  // gap between the window and the bin
  const pt = new Cv(); pointer(pt, 300, 110);
  const P0 = TL.icons;
  out += g(vis([[P0, TL.reboot]]), g(move([[0, 0, 0], [P0 + 0.25, 120, -80], [P0 + 0.5, 210, -150], [P0 + 0.75, 282, -186], [WIN_AT + 0.25, 250, 0], [WIN_AT + 0.5, 236, 16]]), pt.svg()));
  return out;
}

// ---------------------------------------------------------------------------- the island
// Everything inside the window, in the bench's four colours. Visual units; scene origin is
// the window's inside corner.
function buildWindow() {
  let out = '';
  const fr = new Cv();
  // frame: white border, title bar with close gadget, title, drag lines, depth gadgets
  fr.rect(WX0, WY0, WX1, WY1, 'W');
  fr.rect(IX0, IY0, IX1, IY1, 'B');
  fr.frame(WX0, WY0, WX1, WY1, 'K');
  fr.rect(WX0, WY0 + 10, WX1, WY0 + 11, 'K');
  // close gadget
  fr.rect(WX0 + 20, WY0, WX0 + 21, WY0 + 10, 'K');
  fr.frame(WX0 + 6, WY0 + 3, WX0 + 14, WY0 + 8, 'K');
  fr.rect(WX0 + 9, WY0 + 4, WX0 + 11, WY0 + 7, 'O');
  text(fr, 'Castaway', WX0 + 28, WY0 + 2, 'B');
  // drag bar lines
  for (let y = WY0 + 2; y < WY0 + 9; y += 2) fr.rect(WX0 + 28 + textW('Castaway') + 8, y, WX1 - 56, y + 1, 'B');
  for (const [x0, solid] of [[WX1 - 52, false], [WX1 - 26, true]]) {
    fr.rect(x0 - 1, WY0, x0, WY0 + 10, 'K');
    fr.frame(x0 + 4, WY0 + 2, x0 + 16, WY0 + 7, 'K');
    if (solid) fr.rect(x0 + 9, WY0 + 4, x0 + 21, WY0 + 9, 'B'); else fr.frame(x0 + 9, WY0 + 4, x0 + 21, WY0 + 9, 'K');
  }
  // sizing gadget
  fr.rect(WX1 - 16, WY1 - 9, WX1 - 1, WY1 - 1, 'W');
  fr.frame(WX1 - 16, WY1 - 9, WX1, WY1, 'K');
  fr.frame(WX1 - 12, WY1 - 6, WX1 - 4, WY1 - 2, 'K');
  const frameSvg = fr.svg();
  DEFS.push(`<clipPath id="win"><rect x="${IX0}" y="${IY0 * 2}" width="${IX1 - IX0}" height="${(IY1 - IY0) * 2}"/></clipPath>`);

  // scene helpers in visual units relative to the inside
  const SX = IX0, SY = IY0 * 2;
  const H0 = 132;                       // horizon, visual units below the inside top
  const sc = (f) => (x, y) => f(x - SX, y - SY);
  const BB = (x0, y0, x1, y1) => [SX + x0, SY + y0, SX + x1, SY + y1];
  const sline = (cv, a, b, c, d, col) => line(cv, SX + a, SY + b, SX + c, SY + d, col);
  const sceneW = IX1 - IX0, sceneH = (IY1 - IY0) * 2;

  // sky haze: white lines closer together towards the horizon
  const sky = new Cv();
  for (const dy of [70, 86, 98, 108, 116, 122, 126, 130]) sky.rect(IX0, Math.floor((SY + dy) / 2), IX1, Math.floor((SY + dy) / 2) + 1, 'W');
  // sun
  fill(sky, sc(inEll(404, 44, 24, 24)), 'O', 'K', BB(378, 18, 430, 70));
  // clouds
  const cloud = (cx, cy, s) => any(sc(inEll(cx, cy, 30 * s, 12 * s)), sc(inEll(cx - 18 * s, cy + 4 * s, 18 * s, 9 * s)), sc(inEll(cx + 20 * s, cy + 3 * s, 20 * s, 9 * s)), sc(inEll(cx - 2 * s, cy - 8 * s, 16 * s, 10 * s)));
  out += sky.svg();
  const clouds = new Cv();
  fill(clouds, cloud(282, 40, 1), 'W', 'K', BB(226, 20, 336, 60));
  fill(clouds, cloud(18, 104, 0.6), 'W', 'K', BB(-20, 90, 50, 120));
  // clouds drift right a pixel a beat while the window is open, then hold
  const drift = [];
  for (let i = 0, t = WIN_AT; t <= ALERT_AT; i++, t += BEAT) drift.push([t, i, 0]);
  drift.push([0, 0, 0]);
  out += g(move(drift), clouds.svg());

  // the sea: horizon line, then wave dashes in two frames that swap every beat
  const sea = new Cv();
  sea.rect(IX0, Math.floor((SY + H0) / 2), IX1, Math.floor((SY + H0) / 2) + 1, 'W');
  out += sea.svg();
  const R = rng(1992);
  const waveA = new Cv(), waveB = new Cv();
  for (let ly = Math.floor((SY + H0) / 2) + 3; ly < IY1 - 1; ly += 3) {
    const depth = (ly - (SY + H0) / 2) / 80;
    for (let x = IX0 + Math.floor(R() * 20); x < IX1 - 12; x += 22 + Math.floor(R() * 40 * (1 - depth * 0.5))) {
      const len = 3 + Math.floor(R() * (4 + depth * 10));
      waveA.rect(x, ly, Math.min(IX1, x + len), ly + 1, 'W');
      waveB.rect(x + 3, ly, Math.min(IX1, x + 3 + len), ly + 1, 'W');
    }
  }
  const beatsOn = (a, b, phase) => beats(a, b).map((t, i) => (i % 2 === phase ? [t, t + BEAT] : null)).filter(Boolean);
  out += g(vis([[0, WIN_AT], ...beatsOn(WIN_AT, ALERT_AT, 0), [ALERT_AT, T]]), waveA.svg());
  out += g(vis(beatsOn(WIN_AT, ALERT_AT, 1)), waveB.svg());

  // The island and everything on it (and the raft beside it) sit LIFT units higher than drawn,
  // so that when the alert pushes the screen down the island and raft stay whole above the
  // bezel and only open sea and the window's lower edge go under it. Whole lines only.
  const LIFT = 24;
  const up = (s) => `<g transform="translate(0 -${LIFT})">${s}</g>`;
  let isle = '';

  // the raft, bobbing a line every other beat
  const raft = new Cv();
  for (let i = 0; i < 3; i++) fill(raft, sc(inCap(372, 260 + i * 7, 430, 258 + i * 7, 4.2)), 'O', 'K', BB(360, 250, 440, 284));
  sline(raft, 384, 252, 384, 280, 'K'); sline(raft, 418, 250, 418, 278, 'K');
  isle += g(move([[0, 0, 0], ...beatsOn(WIN_AT, ALERT_AT, 1).map(([t]) => [t, 0, 2]), ...beatsOn(WIN_AT, ALERT_AT, 0).map(([t]) => [t, 0, 0])]), raft.svg());

  // the island: a low mound of sand with an outline, stippled, and white foam where it meets the sea
  const isl = new Cv();
  const mound = both(sc(inEll(214, 270, 150, 40)), (x, y) => y - SY <= 280);
  fill(isl, mound, 'O', 'K', BB(60, 225, 370, 282));
  for (let ly = Math.floor((SY + 228) / 2); ly < Math.floor((SY + 282) / 2); ly++) for (let x = SX + 60; x < SX + 370; x++) {
    const X = x + 0.5, Y = ly * 2 + 1;
    if ((x * 7 + ly * 13) % 29 || !mound(X, Y) || !mound(X - 4, Y) || !mound(X + 4, Y) || !mound(X, Y - 4) || !mound(X, Y + 4)) continue;
    isl.set(x, ly, 'K');
  }
  isle += isl.svg();
  const foamA = new Cv(), foamB = new Cv();
  for (let x = 70; x < 360; x += 2) {
    const yb = 280;
    const ok = mound(SX + x, SY + yb - 3);
    if (!ok) continue;
    (Math.floor(x / 8) % 2 ? foamA : foamB).set(SX + x, (SY + yb) / 2 + 1, 'W');
    (Math.floor(x / 8) % 2 ? foamB : foamA).set(SX + x + 1, (SY + yb) / 2 + 2, 'W');
  }
  isle += g(vis([[0, WIN_AT], ...beatsOn(WIN_AT, ALERT_AT, 0), [ALERT_AT, T]]), foamA.svg());
  isle += g(vis(beatsOn(WIN_AT, ALERT_AT, 1)), foamB.svg());
  out += up(isle); isle = '';

  // the palm: a curved trunk of capsules with ring marks, black fronds, three coconuts. The
  // crown stays where it is; the trunk's foot moves up with the island.
  const palm = new Cv();
  const trunkPts = quad([150, 262 - LIFT], [176, 150 - LIFT / 2], [126, 54], 14);
  const trunk = any(...trunkPts.slice(1).map((p, i) => { const a = trunkPts[i]; const r = 7.5 - i * 0.22; return sc(inCap(a[0], a[1], p[0], p[1], r)); }));
  fill(palm, trunk, 'O', 'K', BB(100, 40, 200, 270));
  for (let i = 1; i < trunkPts.length - 1; i++) {
    const [x, y] = trunkPts[i]; const r = 6.5 - i * 0.22;
    sline(palm, x - r + 1, y + 1, x + r - 1, y - 2, 'K');
  }
  const frond = (bx, by, mx, my, ex, ey, w) => {
    const pts = quad([bx, by], [mx, my], [ex, ey], 10);
    const up = [], dn = [];
    pts.forEach(([x, y], i) => {
      const t = i / 10; const ww = w * Math.sin(Math.PI * Math.min(1, t * 1.15)) + 0.6;
      const [nx, ny] = i < 10 ? [pts[i + 1][0] - x, pts[i + 1][1] - y] : [x - pts[i - 1][0], y - pts[i - 1][1]];
      const l = Math.hypot(nx, ny) || 1;
      up.push([x - (ny / l) * ww, y + (nx / l) * ww]); dn.push([x + (ny / l) * ww, y - (nx / l) * ww]);
    });
    return sc(inPoly([...up, ...dn.reverse()]));
  };
  const cx = 126, cy = 56;
  const fronds = any(
    frond(cx, cy, 70, 20, 30, 62, 9),
    frond(cx, cy, 90, 40, 62, 96, 8),
    frond(cx, cy, 160, 14, 214, 50, 9),
    frond(cx, cy, 170, 44, 196, 96, 8),
    frond(cx, cy, 120, 10, 88, 8, 7),
    frond(cx, cy, 140, 16, 170, 10, 7),
    frond(cx, cy, 128, 50, 120, 104, 6),
  );
  fill(palm, fronds, 'K', null, BB(20, 0, 230, 110));
  for (const [x, y] of [[120, 66], [132, 68], [126, 76]]) fill(palm, sc(inEll(x, y, 6, 6)), 'O', 'K', BB(x - 7, y - 7, x + 7, y + 7));
  out += palm.svg();

  // ---- her: sitting on the sand to the right of the palm, facing the sea. Drawn in local
  // units and scaled, so the shapes stay simple.
  const S = 1.35, herX = 236, herY = 264;
  const P = (x, y) => [herX + x * S, herY + y * S];
  const capL = (ax, ay, bx, by, r) => sc(inCap(...P(ax, ay), ...P(bx, by), r * S));
  const ellL = (x, y, rx, ry) => sc(inEll(...P(x, y), rx * S, ry * S));
  const polyL = (pts) => sc(inPoly(pts.map(([x, y]) => P(x, y))));
  const HB = BB(herX - 50, herY - 110, herX + 80, herY + 10);
  const her = new Cv();
  // legs out towards the sea, knees up a little, and bare feet
  fill(her, any(capL(0, -6, 22, -18, 5.6), capL(22, -18, 42, -6, 4.6)), 'W', 'K', HB);
  fill(her, ellL(44, -7, 3.6, 3.6), 'W', 'K', HB);
  fill(her, any(capL(2, -4, 27, -14, 5.6), capL(27, -14, 47, 0, 4.6)), 'W', 'K', HB);
  fill(her, ellL(49, -1, 3.6, 3.6), 'W', 'K', HB);
  // shorts
  fill(her, polyL([[-11, -17], [9, -17], [15, -3], [-11, 0]]), 'W', 'K', HB);
  sline(her, ...P(10, -10), ...P(12, -3), 'K');
  // coral tank top, leaning back a touch
  fill(her, polyL([[-13, -44], [3, -44], [8, -16], [-11, -16]]), 'O', 'K', HB);
  isle += her.svg();
  // arms: resting back on the sand, or up for the throw
  const armRest = new Cv();
  fill(armRest, any(capL(-7, -40, -18, -20, 3.2), capL(-18, -20, -22, -2, 3)), 'W', 'K', HB);
  const armUp = new Cv();
  fill(armUp, any(capL(-2, -42, 10, -56, 3.2), capL(10, -56, 15, -74, 3)), 'W', 'K', HB);
  const B0 = TL.bottle, THROW = [B0, B0 + 0.75];
  isle += g(vis([[0, THROW[0]], [THROW[1], T]]), armRest.svg());
  isle += g(vis([THROW]), armUp.svg());
  // head: hair in a low bun, cream headphones, a face turned to the sea; nods on every beat
  const head = new Cv();
  const HX = -4, HY = -57;
  fill(head, capL(-6, -47, -4, -52, 3), 'W', 'K', HB);                                  // neck
  fill(head, ellL(HX, HY, 10, 10.5), 'W', 'K', HB);                                     // face
  fill(head, sc(both(inEll(...P(HX - 0.5, HY - 0.5), 10.6 * S, 11 * S), (x, y) => {    // hair
    const lx = (x - herX) / S, ly = (y - herY) / S;
    return ly < HY - 2.5 + (lx - HX) * -0.25 || lx < HX - 1;
  })), 'K', null, HB);
  fill(head, ellL(HX - 10, HY + 5, 4.6, 4.6), 'K', null, HB);                           // bun
  // the band over the top of the head, and the ear cup
  const band = both(both(inEll(...P(HX - 1, HY), 11.8 * S, 12.2 * S), not(inEll(...P(HX - 1, HY), 9.6 * S, 10 * S))), (x, y) => y < herY + (HY - 1) * S);
  fill(head, sc(band), 'W', null, HB);
  fill(head, sc(inRect(...P(HX - 5.5, HY - 4), ...P(HX + 1.5, HY + 7))), 'W', 'K', HB);
  head.set(Math.round(SX + herX + (HX + 6) * S), Math.floor((SY + herY + (HY - 1) * S) / 2), 'K');  // eye
  const nodDown = [];
  for (const t of beats(WIN_AT, ALERT_AT)) nodDown.push([t, 0, 2], [t + 0.25, 0, 0]);
  isle += g(move([[0, 0, 0], ...nodDown]), head.svg());

  // ---- gag 1: the bottle she throws, which washes straight back
  const bottle = new Cv();
  fill(bottle, sc(inCap(300, 200, 318, 200, 4.4)), 'W', 'K', BB(294, 194, 324, 206));
  fill(bottle, sc(inRect(318, 197, 326, 203)), 'O', 'K', BB(316, 195, 328, 205));
  bottle.set(SX + 306, (SY + 200) / 2, 'O'); bottle.set(SX + 307, (SY + 200) / 2, 'O');
  const bpath = [
    [0, -600, 0], [B0, -54, -40], [B0 + 0.25, 4, -90], [B0 + 0.5, 64, -70], [B0 + 0.75, 104, 24], [B0 + 1.5, 98, 26],
    [B0 + 2.25, 84, 28], [B0 + 3, 70, 32], [B0 + 3.75, 52, 40], [B0 + 4.5, 36, 50], [B0 + 5.25, 30, 52], [TL.shark, -600, 0],
  ];
  isle += g(move(bpath), bottle.svg());
  const splash = new Cv();
  for (const [x, y] of [[398, 214], [404, 208], [410, 214], [392, 220], [416, 220], [404, 222]]) splash.set(SX + x, (SY + y) / 2, 'W');
  isle += g(vis([[B0 + 0.75, B0 + 1.5]]), splash.svg());
  out += up(isle); isle = '';

  // ---- gag 2: a shark in headphones, nodding along with her
  const shark = new Cv();
  const fx = 444, fy = 214, FS = 1.4;              // where the fin meets the water, and its scale
  const F = (x, y) => [fx + x * FS, fy + y * FS];
  const fin = sc(inPoly([[-18, 0], [-8, -22], [2, -40], [6, -44], [8, -36], [10, -20], [18, 0]].map(([x, y]) => F(x, y))));
  const FB = BB(fx - 32, fy - 66, fx + 32, fy + 1);
  fill(shark, fin, 'K', 'W', FB);
  const ring = both(both(inEll(...F(1, -24), 15 * FS, 15 * FS), not(inEll(...F(1, -24), 12 * FS, 12 * FS))), (x, y) => y < fy - 22 * FS);
  fill(shark, sc(ring), 'W', 'K', FB);
  fill(shark, sc(inRect(...F(-18, -26), ...F(-10, -10))), 'W', 'K', FB);
  fill(shark, sc(inRect(...F(12, -26), ...F(20, -10))), 'W', 'K', FB);
  // the shark stays where it was: out at sea, so it does not move with the island
  const sharkWater = new Cv();
  sharkWater.rect(SX + fx - 36, Math.floor((SY + fy) / 2), SX + fx + 38, Math.floor((SY + fy) / 2) + 1, 'W');
  DEFS.push(`<clipPath id="finclip"><rect x="0" y="0" width="${SW}" height="${SY + fy}"/></clipPath>`);
  const K0 = TL.shark, K1 = TL.drone;
  const sharkNod = [[0, 0, 70], [K0, 0, 34], [K0 + 0.25, 0, 0]];
  for (const t of beats(K0 + 0.75, K1 - 0.75)) sharkNod.push([t, 0, 2], [t + 0.25, 0, 0]);
  sharkNod.push([K1 - 0.75, 0, 34], [K1 - 0.5, 0, 70]);
  out += g(vis([[K0, K1 - 0.5]]), `<g clip-path="url(#finclip)">${g(move(sharkNod), shark.svg())}</g>` + sharkWater.svg());

  // ---- gag 3: a delivery drone lowers a parcel; the parcel is more headphones
  const drone = new Cv();
  const dx = 340, dy = 40;
  fill(drone, sc(inRect(dx - 16, dy, dx + 16, dy + 10)), 'K', 'W', BB(dx - 18, dy - 2, dx + 18, dy + 12));
  fill(drone, sc(inRect(dx - 30, dy + 2, dx + 30, dy + 6)), 'K', null, BB(dx - 32, dy, dx + 32, dy + 8));
  for (const s of [-1, 1]) { sline(drone, dx + s * 28, dy - 4, dx + s * 28, dy + 4, 'K'); sline(drone, dx + s * 10, dy + 10, dx + s * 14, dy + 16, 'K'); }
  const propA = new Cv(), propB = new Cv();
  const pl = Math.floor((SY + dy - 6) / 2);
  for (const s of [-1, 1]) {
    propA.rect(SX + dx + s * 28 - 12, pl, SX + dx + s * 28 + 12, pl + 1, 'W');
    propB.rect(SX + dx + s * 28 - 5, pl, SX + dx + s * 28 + 5, pl + 1, 'W');
  }
  const parcel = new Cv();
  fill(parcel, sc(inRect(dx - 12, dy + 26, dx + 12, dy + 46)), 'O', 'K', BB(dx - 13, dy + 25, dx + 13, dy + 47));
  sline(parcel, dx, dy + 27, dx, dy + 45, 'W');
  const tether = new Cv();
  sline(tether, dx, dy + 12, dx, dy + 25, 'W');
  const PROPS = [];
  const D0 = TL.drone;
  for (let t = D0; t < TL.coconut; t += 0.25) PROPS.push([t, t + 0.125]);
  const dropY = 180;                 // drone offset when the parcel touches the sand
  const dPath = [[0, 0, -140], [D0, 0, -60], [D0 + 0.75, 0, 20], [D0 + 1.5, 0, 80], [D0 + 2.25, 0, 140], [D0 + 3, 0, dropY], [D0 + 3.75, 0, 110], [D0 + 4.5, 0, 30], [D0 + 5.25, 0, -60], [TL.coconut, 0, -140]];
  isle += g(vis([[D0, TL.coconut]]), g(move(dPath), drone.svg() + g(vis(PROPS), propA.svg()) + g(vis(PROPS.map(([a, b]) => [b, b + 0.125])), propB.svg()) + g(vis([[D0, D0 + 3.75]]), tether.svg())));
  isle += g(vis([[D0, D0 + 3.75]]), g(move(dPath), parcel.svg()));
  // parcel on the sand, opened, and a pair of headphones popping out
  const opened = new Cv();
  const oy = dy + dropY;
  fill(opened, sc(inRect(dx - 12, oy + 28, dx + 12, oy + 46)), 'O', 'K', BB(dx - 13, oy + 26, dx + 13, oy + 47));
  sline(opened, dx - 12, oy + 28, dx - 20, oy + 18, 'K');
  sline(opened, dx + 12, oy + 28, dx + 20, oy + 18, 'K');
  const phones = new Cv();
  const px0 = dx, py0 = oy + 10;
  fill(phones, sc(both(both(inEll(px0, py0, 12, 12), not(inEll(px0, py0, 9, 9))), (x, y) => y < py0 + 2)), 'W', 'K', BB(px0 - 13, py0 - 13, px0 + 13, py0 + 3));
  fill(phones, sc(inRect(px0 - 15, py0 - 2, px0 - 7, py0 + 12)), 'W', 'K', BB(px0 - 16, py0 - 3, px0 - 6, py0 + 13));
  fill(phones, sc(inRect(px0 + 7, py0 - 2, px0 + 15, py0 + 12)), 'W', 'K', BB(px0 + 6, py0 - 3, px0 + 16, py0 + 13));
  isle += g(vis([[D0 + 3.75, ALERT_END]]), opened.svg());
  isle += g(vis([[D0 + 4.5, ALERT_END]]), g(move([[0, 0, 0], [D0 + 4.5, 0, 8], [D0 + 4.75, 0, 0]]), phones.svg()));

  // ---- gag 4: a coconut falls on a hermit crab, and the crab walks off wearing it
  // The crab: an orange shell, two claws, eyes on stalks. The coconut lands on top and from
  // then on the crab shows only below and in front of it: the bottom of the shell, the claws
  // either side, the eyes poking out ahead, and the legs, all walking left a step a beat.
  const cxb = 122, cyb = 262;                       // where the crab stands on the sand
  const nutC = [cxb, cyb - 16, 12, 11];             // the coconut once it has landed
  const crabBody = sc(inEll(cxb, cyb - 6, 10, 7));
  const CBB = BB(cxb - 24, cyb - 30, cxb + 22, cyb + 4);
  const claws = (cv) => { for (const s of [-1, 1]) fill(cv, sc(inEll(cxb + s * 13, cyb - 9, 3.6, 3.2)), 'O', 'K', CBB); };
  const crab = new Cv();                            // before: sitting, eyes up
  fill(crab, crabBody, 'O', 'K', CBB);
  claws(crab);
  for (const s of [-1, 1]) {
    sline(crab, cxb + s * 3, cyb - 12, cxb + s * 4, cyb - 19, 'K');
    fill(crab, sc(inEll(cxb + s * 4, cyb - 20, 2, 2.4)), 'W', 'K', CBB);
    sline(crab, cxb + s * 7, cyb - 2, cxb + s * 12, cyb + 3, 'K');
  }
  const shell = new Cv();                           // after: the shell under the coconut
  fill(shell, crabBody, 'O', 'K', CBB);
  const nut = new Cv();
  fill(nut, sc(inEll(...nutC)), 'K', null, CBB);
  fill(nut, sc(inEll(cxb - 5, cyb - 21, 2.2, 2.2)), 'O', null, CBB);
  const kit = new Cv();                             // claws and eyes, drawn over the coconut's edge
  claws(kit);
  sline(kit, cxb - 8, cyb - 8, cxb - 16, cyb - 14, 'K'); sline(kit, cxb - 6, cyb - 10, cxb - 12, cyb - 24, 'K');
  fill(kit, sc(inEll(cxb - 17, cyb - 15, 2, 2.4)), 'W', 'K', CBB);
  fill(kit, sc(inEll(cxb - 13, cyb - 25, 2, 2.4)), 'W', 'K', CBB);
  // legs in near-black (orange would vanish into the sand), two frames
  const legsA = new Cv(), legsB = new Cv();
  for (const s of [-1, 1]) {
    sline(legsA, cxb + s * 6, cyb - 3, cxb + s * 12, cyb + 3, 'K'); sline(legsA, cxb + s * 2, cyb - 2, cxb + s * 5, cyb + 3, 'K');
    sline(legsB, cxb + s * 5, cyb - 3, cxb + s * 8, cyb + 3, 'K'); sline(legsB, cxb + s * 1, cyb - 2, cxb + s * 1, cyb + 3, 'K');
  }
  const C0 = TL.coconut;
  const walk = [[0, 0, 0], [C0 + 1.5, -6, 0], [C0 + 2.25, -12, 0], [C0 + 3, -18, 0]];
  const LAND = C0 + 0.75;
  isle += g(vis([[C0, LAND]]), crab.svg());
  isle += g(vis([[LAND, ALERT_END]]), g(move(walk), shell.svg()));
  isle += g(vis([[C0, ALERT_END]]), g(move([[0, 0, LIFT - 170], [C0, 0, LIFT - 170], [C0 + 0.25, 0, -94], [C0 + 0.5, 0, -42], [LAND, 0, 0], ...walk.slice(1)]), nut.svg()));
  isle += g(vis([[LAND, ALERT_END]]), g(move(walk), kit.svg()));
  isle += g(vis([[LAND, C0 + 1.5], [C0 + 2.25, ALERT_END]]), g(move(walk), legsA.svg()));
  isle += g(vis([[C0 + 1.5, C0 + 2.25]]), g(move(walk), legsB.svg()));
  out += up(isle);
  return frameSvg + `<g clip-path="url(#win)">${out}</g>`;
}

// ---------------------------------------------------------------------------- the alert
const ALERT_H = 40;   // lines
function buildAlert() {
  const box = new Cv();
  box.rect(0, 0, SW, ALERT_H, 'k');
  const l1 = 'Nothing has failed.   Nothing has happened.   That is the video.';
  const l2 = 'Island Meditation #00001992.00036000';
  text(box, l1, Math.round((SW - textW(l1)) / 2), 10, 'r');
  text(box, l2, Math.round((SW - textW(l2)) / 2), 23, 'r');
  const frame = new Cv();
  frame.rect(8, 3, SW - 8, 6, 'r'); frame.rect(8, ALERT_H - 6, SW - 8, ALERT_H - 3, 'r');
  frame.rect(8, 3, 16, ALERT_H - 3, 'r'); frame.rect(SW - 16, 3, SW - 8, ALERT_H - 3, 'r');
  const on = beats(ALERT_AT, ALERT_END).map((t, i) => (i % 2 === 0 ? [t, t + BEAT] : null)).filter(Boolean);
  return box.svg() + g(vis(on), frame.svg());
}

// ============================================================================ assemble
const card = buildCard();
const bench = buildBench();
const alert = buildAlert();
const push = move([[0, 0, 0], [ALERT_AT, 0, ALERT_H * 2], [ALERT_END, 0, 0]]);

const screen =
  g(vis([[TL.reboot, TL.reboot + 0.75]]), `<rect width="${SW}" height="${SH * 2}" fill="#333333"/>`) +
  g(vis([[TL.reboot + 0.75, TL.reboot + 1.5]]), `<rect width="${SW}" height="${SH * 2}" fill="#aaaaaa"/>`) +
  g(vis([[TL.reboot + 1.5, TL.card]]), `<rect width="${SW}" height="${SH * 2}" fill="#ffffff"/>`) +
  g(vis(BENCH_ON), g(push, bench)) +
  g(vis([[ALERT_AT, ALERT_END]]), alert) +
  g(vis(CARD_ON), card);

// bezel LEDs: power steady; drive lights while the disk loads and while the window opens
const ledY = BZ + SH * 2 + 14;
const leds =
  `<rect x="${VW - 92}" y="${ledY}" width="14" height="5" rx="1" fill="#3c8f3c"/>` +
  `<rect x="${VW - 56}" y="${ledY}" width="14" height="5" rx="1" fill="#4a3a1e"/>` +
  g(vis([[TL.insert, TL.select], [TL.zoom, WIN_AT + 0.25], [TL.reboot + 0.75, TL.card - 0.25]]), `<rect x="${VW - 56}" y="${ledY}" width="14" height="5" rx="1" fill="#ffb02e"/>`);

const reduce = '@media (prefers-reduced-motion:reduce){.a{animation:none!important}}';
const style = `.a{animation-duration:${T}s;animation-iteration-count:infinite;animation-timing-function:step-end}${css.join('')}${reduce}`;
const desc = 'CASTAWAY: an insert-disk boot card, a blue-and-orange desktop with an island in a window, and a red alert that says nothing has failed.';
const svg =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VW} ${VH}" width="${VW}" height="${VH}" role="img" aria-label="${desc}">` +
  `<title>${desc}</title>` +
  `<style>${style}</style>` +
  `<defs><clipPath id="scr"><rect x="${BZ}" y="${BZ}" width="${SW}" height="${SH * 2}" rx="6"/></clipPath>` +
  DEFS.join('') +
  `<linearGradient id="bz" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b2d33"/><stop offset="1" stop-color="#18191d"/></linearGradient></defs>` +
  `<rect width="${VW}" height="${VH}" rx="16" fill="url(#bz)"/>` +
  `<rect x="${BZ - 3}" y="${BZ - 3}" width="${SW + 6}" height="${SH * 2 + 6}" rx="8" fill="#0b0b0d"/>` +
  `<g clip-path="url(#scr)"><g transform="translate(${BZ} ${BZ})">${screen}</g></g>` +
  leds +
  `</svg>`;

if (STILL != null) {
  const dir = STILL_DIR || '.';
  fs.mkdirSync(dir, { recursive: true });
  const f = path.join(dir, `still-${String(STILL).replace('.', '_')}.svg`);
  fs.writeFileSync(f, svg);
  console.log(`wrote ${f} (${(svg.length / 1024).toFixed(1)} KB)`);
} else {
  fs.writeFileSync(OUT, svg);
  console.log(`wrote ${OUT} (${(svg.length / 1024).toFixed(1)} KB)`);
}
