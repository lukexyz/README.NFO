#!/usr/bin/env node
// 90-pc-98-adventure-screen_opus_5.5: the "PC-98 Adventure Screen" README
// header for CASTAWAY (catalogue entry asia-02: a late-80s / early-90s
// Japanese computer adventure screen, with a dithered 16-colour picture in a
// framed panel, a command menu of verbs, and a message window that types).
//
// The rules of that machine are the look, so the generator keeps them:
//   * a 640 x 400 screen, laid out on the 80 x 25 grid of 8 x 16 cells
//     (status line on row 0, a prompt with the run command on row 24);
//   * the picture uses exactly 16 colours, every one a 12-bit #rgb value,
//     and fakes every other shade with ordered (Bayer 4 x 4) dither
//     patterns of two of those 16: sky, sea, clouds, sand, title;
//   * hard 1-pixel black outlines on everything that is not sky or sea;
//   * the lettering (menu, status, messages) sits on a separate text layer
//     that may only use the 8 pure digital colours (#000 #00f #f00 #f0f
//     #0f0 #0ff #ff0 #fff), drawn from an 8 x 16 half-width font and a few
//     16 x 16 full-width kana and kanji, all drawn pixel by pixel in this file
//     (zero with a slash, single-pixel strokes);
//   * nothing tweens: every change is a hard cut, typing goes one character
//     at a time (a kanji appears whole), and the menu cursor steps.
//
// The adventure: the command menu reads 見る LOOK, 話す TALK, 待つ WAIT,
// 聞く LISTEN, 出る LEAVE, 実行 RUN. TALK is greyed out, because there is
// nobody to talk to. The loop is 60 seconds, the length of the project's
// theme: 20 bars of 3 seconds at 80 BPM. Every 4 bars the cursor picks the
// next verb, on the bar, and the message window types its answer while the
// picture shows it (a shark in headphones for WAIT, notes for LISTEN, the
// walk over the water and the iced coffee for LEAVE, the drone for RUN).
// She nods on every beat throughout; the bar counter in the status box
// counts the 20 bars. At the loop point the picture is wiped and redrawn
// one interlaced line in eight at a time, like a picture being loaded.
//
// Every animated value also gets the value it has on the first frame as its
// static style, so under prefers-reduced-motion the screen stops on that
// frame: the picture, the menu on LOOK and the first message, fully typed.
//
// No <text>, no fonts, nothing external. Pixels become merged rectangles in
// one <path> per colour or dither pattern; glyphs are <path>s in <defs>,
// placed with <use>. Deterministic: a seeded PRNG places the wave dashes and
// cloud puffs.
//
//   node 90-pc-98-adventure-screen_opus_5.5.mjs           write the SVG
//   node 90-pc-98-adventure-screen_opus_5.5.mjs --glyphs  also print glyphs
//   node ... --at=40 --out=proof.svg   a proof opening 40 s into the loop

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '90-pc-98-adventure-screen_opus_5.5';
const argv = (name) => process.argv.find((a) => a.startsWith(`--${name}=`))?.split('=')[1];
// --at=S --out=FILE writes a proof that opens S seconds into the loop
const OUT = argv('out') ?? path.join(HERE, '..', 'assets', `${SLUG}.svg`);
const SHOW_GLYPHS = process.argv.includes('--glyphs');

// ================================================================ colours
// The 16 graphics colours (12-bit, as the 4096-colour palette allows).
const PAL = {
  k: '#000', w: '#fff', n: '#148', b: '#36b', l: '#8cf', t: '#199', a: '#6dc', y: '#fe9',
  d: '#c96', c: '#f76', s: '#fca', h: '#742', g: '#2a4', G: '#052', m: '#fec', v: '#879',
};
if (Object.keys(PAL).length !== 16) throw new Error('the picture must use exactly 16 colours');
// The text layer: the 8 digital colours only.
const TXT = { xw: '#fff', xc: '#0ff', xy: '#ff0', xm: '#f0f', xg: '#0f0', xr: '#f00', xb: '#00f' };

// Bayer 4 x 4: a pattern "XYn" is colour X with n of every 16 pixels in Y.
const BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];
const usedPatterns = new Set();
function patternDef(name) {
  const [x, y] = name;
  const n = Number(name.slice(2));
  let s = `<pattern id="p${name}" width="4" height="4" patternUnits="userSpaceOnUse"><path class="${x}" d="M0 0h4v4H0z"/><path class="${y}" d="`;
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) if (BAYER[r][c] < n) s += `M${c} ${r}h1v1h-1z`;
  return s + '"/></pattern>';
}

// ================================================================ PRNG
function mulberry32(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ================================================================ raster
// A layer of pixels, each holding a material: a palette letter, or a dither
// pattern name like "bl8". Layers are emitted separately and stacked, so big
// flat areas stay one rectangle each.
const PW = 448, PH = 240; // the picture
class Raster {
  constructor(w = PW, h = PH) { this.w = w; this.h = h; this.p = new Array(w * h).fill(null); }
  in(x, y) { return x >= 0 && y >= 0 && x < this.w && y < this.h; }
  set(x, y, m) {
    x = Math.round(x); y = Math.round(y);
    if (!this.in(x, y) || m == null) return;
    this.p[y * this.w + x] = typeof m === 'function' ? m(x, y) : m;
  }
  get(x, y) { return this.in(x, y) ? this.p[y * this.w + x] : null; }
  rect(x, y, w, h, m) { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) this.set(i, j, m); return this; }
  // fill every pixel whose centre passes test(x + .5, y + .5)
  fill(x0, y0, x1, y1, test, m) {
    for (let y = Math.max(0, Math.floor(y0)); y <= Math.min(this.h - 1, Math.ceil(y1)); y++)
      for (let x = Math.max(0, Math.floor(x0)); x <= Math.min(this.w - 1, Math.ceil(x1)); x++)
        if (test(x + 0.5, y + 0.5)) this.set(x, y, m);
    return this;
  }
  ellipse(cx, cy, rx, ry, m) {
    return this.fill(cx - rx - 1, cy - ry - 1, cx + rx + 1, cy + ry + 1, (x, y) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1, m);
  }
  disc(cx, cy, r, m) { return this.ellipse(cx, cy, r, r, m); }
  poly(rings, m) {
    const xs = rings.flat().map((p) => p[0]), ys = rings.flat().map((p) => p[1]);
    return this.fill(Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys), (x, y) => {
      let inside = false;
      for (const ring of rings) for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        const [xi, yi] = ring[i], [xj, yj] = ring[j];
        if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
      }
      return inside;
    }, m);
  }
  line(x0, y0, x1, y1, m) {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let e = dx + dy;
    for (;;) {
      this.set(x0, y0, m);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * e;
      if (e2 >= dy) { e += dy; x0 += sx; }
      if (e2 <= dx) { e += dx; y0 += sy; }
    }
    return this;
  }
  // ASCII sprite; '.' and ' ' are transparent, map translates letters
  stamp(rows, ox, oy, map = {}) {
    rows.forEach((row, j) => [...row].forEach((ch, i) => {
      if (ch === '.' || ch === ' ') return;
      this.set(ox + i, oy + j, map[ch] ?? ch);
    }));
    return this;
  }
  // paint m on every empty pixel that touches a filled one
  outline(m = 'k', diag = false) {
    const add = [];
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) {
      if (this.get(x, y) !== null) continue;
      const n = [[1, 0], [-1, 0], [0, 1], [0, -1]];
      if (diag) n.push([1, 1], [1, -1], [-1, 1], [-1, -1]);
      if (n.some(([dx, dy]) => this.get(x + dx, y + dy) !== null)) add.push([x, y]);
    }
    for (const [x, y] of add) this.set(x, y, m);
    return this;
  }
  // copy another raster on top (null pixels are transparent)
  over(o, dx = 0, dy = 0) {
    for (let y = 0; y < o.h; y++) for (let x = 0; x < o.w; x++) { const m = o.get(x, y); if (m !== null) this.set(x + dx, y + dy, m); }
    return this;
  }
  bbox() {
    let x0 = Infinity, y0 = Infinity, x1 = -1, y1 = -1;
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) if (this.get(x, y) !== null) {
      x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y);
    }
    return { x0, y0, x1, y1 };
  }
}

// Merge each material's pixels into rectangles: runs along a row, then runs
// with the same span on consecutive rows.
function rectsOf(cells) { // cells: Map y -> sorted x list
  const runs = [];
  for (const [y, xs] of [...cells].sort((a, b) => a[0] - b[0])) {
    xs.sort((a, b) => a - b);
    let s = xs[0], p = xs[0];
    for (let i = 1; i <= xs.length; i++) {
      if (i < xs.length && xs[i] === p + 1) { p = xs[i]; continue; }
      runs.push({ x: s, y, w: p - s + 1, h: 1 });
      if (i < xs.length) s = p = xs[i];
    }
  }
  const open = new Map(), out = [];
  for (const r of runs) {
    const key = r.x + ',' + r.w, o = open.get(key);
    if (o && o.y + o.h === r.y) { o.h++; continue; }
    open.set(key, r); out.push(r);
  }
  return out;
}
// After "z" the pen is back at the rectangle's corner, so every rectangle
// after the first can start with a short relative move.
function rectPath(rs, ox = 0, oy = 0) {
  let d = '', px = 0, py = 0;
  rs.forEach((r, i) => {
    const x = r.x + ox, y = r.y + oy;
    d += (i ? `m${x - px} ${y - py}` : `M${x} ${y}`) + `h${r.w}v${r.h}h-${r.w}z`;
    px = x; py = y;
  });
  return d.replace(/ -/g, '-');
}
function fillAttr(m) {
  if (m.length === 1) return `class="${m}"`;
  usedPatterns.add(m);
  return `fill="url(#p${m})"`;
}
function emit(r, ox = 0, oy = 0) {
  const byMat = new Map();
  for (let y = 0; y < r.h; y++) for (let x = 0; x < r.w; x++) {
    const m = r.get(x, y);
    if (m === null) continue;
    if (!byMat.has(m)) byMat.set(m, new Map());
    const rows = byMat.get(m);
    if (!rows.has(y)) rows.set(y, []);
    rows.get(y).push(x);
  }
  let s = '';
  for (const [m, cells] of byMat) s += `<path ${fillAttr(m)} d="${rectPath(rectsOf(cells), ox, oy)}"/>`;
  return s;
}

// ================================================================ fonts
// Half-width 8 x 16 cell: glyphs drawn in columns 0-6, column 7 left empty.
// Capitals and figures sit on rows 3-12, x-height is rows 6-12, descenders
// reach row 15. Single-pixel strokes, zero with a slash. My own drawings.
const LAT = {
  A: [3, '...#...|..#.#..|..#.#..|.#...#.|.#...#.|#.....#|#######|#.....#|#.....#|#.....#'],
  B: [3, '######.|#.....#|#.....#|#.....#|######.|#.....#|#.....#|#.....#|#.....#|######.'],
  C: [3, '..####.|.#....#|#......|#......|#......|#......|#......|#......|.#....#|..####.'],
  D: [3, '#####..|#....#.|#.....#|#.....#|#.....#|#.....#|#.....#|#.....#|#....#.|#####..'],
  E: [3, '#######|#......|#......|#......|######.|#......|#......|#......|#......|#######'],
  F: [3, '#######|#......|#......|#......|######.|#......|#......|#......|#......|#......'],
  G: [3, '..####.|.#....#|#......|#......|#......|#...###|#.....#|#.....#|.#....#|..####.'],
  H: [3, '#.....#|#.....#|#.....#|#.....#|#######|#.....#|#.....#|#.....#|#.....#|#.....#'],
  I: [3, '.#####.|...#...|...#...|...#...|...#...|...#...|...#...|...#...|...#...|.#####.'],
  J: [3, '...####|.....#.|.....#.|.....#.|.....#.|.....#.|.....#.|#....#.|#....#.|.####..'],
  K: [3, '#....#.|#...#..|#..#...|#.#....|##.....|#.#....|#..#...|#...#..|#....#.|#.....#'],
  L: [3, '#......|#......|#......|#......|#......|#......|#......|#......|#......|#######'],
  M: [3, '#.....#|##...##|#.#.#.#|#.#.#.#|#..#..#|#..#..#|#.....#|#.....#|#.....#|#.....#'],
  N: [3, '#.....#|##....#|#.#...#|#.#...#|#..#..#|#..#..#|#...#.#|#...#.#|#....##|#.....#'],
  O: [3, '..###..|.#...#.|#.....#|#.....#|#.....#|#.....#|#.....#|#.....#|.#...#.|..###..'],
  P: [3, '######.|#.....#|#.....#|#.....#|#.....#|######.|#......|#......|#......|#......'],
  Q: [3, '..###..|.#...#.|#.....#|#.....#|#.....#|#.....#|#..#..#|#...#.#|.#...#.|..###.#'],
  R: [3, '######.|#.....#|#.....#|#.....#|######.|#..#...|#...#..|#....#.|#.....#|#.....#'],
  S: [3, '.#####.|#.....#|#......|#......|.#####.|......#|......#|......#|#.....#|.#####.'],
  T: [3, '#######|...#...|...#...|...#...|...#...|...#...|...#...|...#...|...#...|...#...'],
  U: [3, '#.....#|#.....#|#.....#|#.....#|#.....#|#.....#|#.....#|#.....#|.#...#.|..###..'],
  V: [3, '#.....#|#.....#|#.....#|.#...#.|.#...#.|.#...#.|..#.#..|..#.#..|...#...|...#...'],
  W: [3, '#.....#|#.....#|#.....#|#.....#|#..#..#|#..#..#|#.#.#.#|#.#.#.#|##...##|#.....#'],
  X: [3, '#.....#|#.....#|.#...#.|..#.#..|...#...|...#...|..#.#..|.#...#.|#.....#|#.....#'],
  Y: [3, '#.....#|#.....#|.#...#.|..#.#..|...#...|...#...|...#...|...#...|...#...|...#...'],
  Z: [3, '#######|......#|......#|.....#.|....#..|...#...|..#....|.#.....|#......|#######'],
  a: [6, '.#####.|......#|......#|.######|#.....#|#....##|.####.#'],
  b: [3, '#......|#......|#......|#.####.|##....#|#.....#|#.....#|#.....#|##....#|#.####.'],
  c: [6, '.#####.|#.....#|#......|#......|#......|#.....#|.#####.'],
  d: [3, '......#|......#|......#|.####.#|#....##|#.....#|#.....#|#.....#|#....##|.####.#'],
  e: [6, '.#####.|#.....#|#.....#|#######|#......|#.....#|.#####.'],
  f: [3, '...###.|..#...#|..#....|..#....|######.|..#....|..#....|..#....|..#....|..#....'],
  g: [6, '.####.#|#....##|#.....#|#.....#|#....##|.####.#|......#|#.....#|.#####.'],
  h: [3, '#......|#......|#......|#.####.|##....#|#.....#|#.....#|#.....#|#.....#|#.....#'],
  i: [4, '...#...|.......|..##...|...#...|...#...|...#...|...#...|...#...|.#####.'],
  j: [4, '.....#.|.......|....##.|.....#.|.....#.|.....#.|.....#.|.....#.|.....#.|.....#.|#....#.|.####..'],
  k: [3, '#......|#......|#......|#....#.|#...#..|#..#...|###....|#..#...|#...#..|#....#.'],
  l: [3, '..##...|...#...|...#...|...#...|...#...|...#...|...#...|...#...|...#...|.#####.'],
  m: [6, '###.##.|#..#..#|#..#..#|#..#..#|#..#..#|#..#..#|#..#..#'],
  n: [6, '#.####.|##....#|#.....#|#.....#|#.....#|#.....#|#.....#'],
  o: [6, '.#####.|#.....#|#.....#|#.....#|#.....#|#.....#|.#####.'],
  p: [6, '#.####.|##....#|#.....#|#.....#|#.....#|##....#|#.####.|#......|#......|#......'],
  q: [6, '.####.#|#....##|#.....#|#.....#|#.....#|#....##|.####.#|......#|......#|......#'],
  r: [6, '#.####.|##....#|#......|#......|#......|#......|#......'],
  s: [6, '.#####.|#.....#|#......|.#####.|......#|#.....#|.#####.'],
  t: [4, '..#....|..#....|######.|..#....|..#....|..#....|..#....|..#....|...###.'],
  u: [6, '#.....#|#.....#|#.....#|#.....#|#.....#|#....##|.####.#'],
  v: [6, '#.....#|#.....#|.#...#.|.#...#.|..#.#..|..#.#..|...#...'],
  w: [6, '#.....#|#.....#|#..#..#|#..#..#|#..#..#|#..#..#|.##.##.'],
  x: [6, '#.....#|.#...#.|..#.#..|...#...|..#.#..|.#...#.|#.....#'],
  y: [6, '#.....#|#.....#|#.....#|#.....#|#....##|.####.#|......#|......#|#.....#|.#####.'],
  z: [6, '#######|.....#.|....#..|...#...|..#....|.#.....|#######'],
  0: [3, '..###..|.#...#.|#.....#|#....##|#...#.#|#..#..#|#.#...#|##....#|.#...#.|..###..'],
  1: [3, '...#...|..##...|.#.#...|...#...|...#...|...#...|...#...|...#...|...#...|.#####.'],
  2: [3, '.#####.|#.....#|......#|......#|.....#.|...##..|..#....|.#.....|#......|#######'],
  3: [3, '.#####.|#.....#|......#|......#|..####.|......#|......#|......#|#.....#|.#####.'],
  4: [3, '....##.|...#.#.|..#..#.|.#...#.|#....#.|#....#.|#######|.....#.|.....#.|.....#.'],
  5: [3, '#######|#......|#......|######.|......#|......#|......#|......#|#.....#|.#####.'],
  6: [3, '..####.|.#.....|#......|#......|######.|#.....#|#.....#|#.....#|#.....#|.#####.'],
  7: [3, '#######|#.....#|......#|.....#.|....#..|...#...|...#...|...#...|...#...|...#...'],
  8: [3, '.#####.|#.....#|#.....#|#.....#|.#####.|#.....#|#.....#|#.....#|#.....#|.#####.'],
  9: [3, '.#####.|#.....#|#.....#|#.....#|#.....#|.######|......#|......#|.....#.|.####..'],
  '.': [11, '...##..|...##..'],
  ',': [11, '...##..|...##..|....#..|...#...'],
  ':': [6, '...##..|...##..|.......|.......|.......|...##..|...##..'],
  ';': [6, '...##..|...##..|.......|.......|.......|...##..|...##..|....#..|...#...'],
  '!': [3, '...#...|...#...|...#...|...#...|...#...|...#...|...#...|.......|.......|...#...'],
  '?': [3, '.#####.|#.....#|......#|.....#.|....#..|...#...|...#...|.......|.......|...#...'],
  "'": [3, '...#...|...#...|...#...'],
  '"': [3, '..#.#..|..#.#..|..#.#..'],
  '-': [8, '.#####.'],
  '/': [3, '......#|......#|.....#.|....#..|....#..|...#...|..#....|..#....|.#.....|#......'],
  '(': [3, '....#..|...#...|..#....|..#....|..#....|..#....|..#....|..#....|...#...|....#..'],
  ')': [3, '..#....|...#...|....#..|....#..|....#..|....#..|....#..|....#..|...#...|..#....'],
  '>': [4, '#......|.#.....|..#....|...#...|....#..|...#...|..#....|.#.....|#......'],
  '<': [4, '......#|.....#.|....#..|...#...|..#....|...#...|....#..|.....#.|......#'],
  '_': [14, '#######'],
  '=': [6, '#######|.......|.......|#######'],
  '+': [5, '...#...|...#...|...#...|#######|...#...|...#...|...#...'],
  '%': [3, '.#....#|#.#..#.|.#...#.|....#..|....#..|...#...|..#....|..#..#.|.#..#.#|#....#.'],
  '♪': [3, '...#...|...##..|...#.#.|...#..#|...#...|...#...|...#...|.###...|####...|.##....'],
  '▶': [4, '##.....|####...|######.|#######|######.|####...|##.....'],
  '▼': [5, '#######|.#####.|.#####.|..###..|..###..|...#...'],
  '█': [3, '#######|#######|#######|#######|#######|#######|#######|#######|#######|#######'],
  '·': [7, '...##..|...##..'],
  '☀': [3, '...#...|.#...#.|..###..|.#...#.|##...##|.#...#.|..###..|.#...#.|...#...'],
};
// Full-width 16 x 16: kana and kanji, my own pixel drawings (not traced from
// any font). Meanings: コマンド "command", 見る look, 話す talk, 待つ wait,
// 聞く listen, 出る go out / leave, 実行 run (execute), キャストアウェイ
// "castaway" in katakana, 島から出ますか？ "will you leave the island?",
// はい yes, いいえ no.
const JP = {
  'コ': '................|................|..###########...|............#...|............#...|............#...|............#...|............#...|............#...|............#...|............#...|............#...|..###########...|............#...|................|................',
  'マ': '................|................|.#############..|.............#..|............#...|...........#....|..........#.....|...#.....#......|....#...#.......|.....#.#........|......#.........|.......#........|........#.......|.........#......|................|................',
  'ン': '................|................|................|.##.............|...##...........|.....#......##..|...........#....|..........#.....|.........#......|........#.......|......##........|....##..........|..##............|................|................|................',
  'ド': '................|...#......#.#...|...#.......#.#..|...#............|...#............|...#............|...###..........|...#..##........|...#....##......|...#......#.....|...#............|...#............|...#............|...#............|...#............|................',
  'ト': '................|.....#..........|.....#..........|.....#..........|.....#..........|.....#..........|.....###........|.....#..##......|.....#....##....|.....#......#...|.....#..........|.....#..........|.....#..........|.....#..........|.....#..........|................',
  'キ': '................|......#.........|......#.........|......#.........|..###########...|.......#........|.......#........|.......#........|.##############.|........#.......|........#.......|........#.......|........#.......|........#.......|........#.......|................',
  'ャ': '................|................|................|................|................|.....#..........|.....#..........|..###########...|......#....#....|......#...#.....|......#..#......|.......#........|.......#........|.......#........|.......#........|................',
  'ス': '................|................|..##########....|...........#....|..........#.....|.........#......|........#.......|.......##.......|......#..#......|.....#....#.....|....#......#....|...#........#...|.##..........#..|................|................|................',
  'ア': '................|................|.#############..|............#...|...........#....|......#...#.....|......#.##......|......#.........|......#.........|.....#..........|.....#..........|....#...........|..##............|................|................|................',
  'ウ': '................|.......#........|.......#........|.#############..|.#...........#..|.#...........#..|.#..........#...|............#...|...........#....|..........#.....|.........#......|........#.......|......##........|....##..........|................|................',
  'ェ': '................|................|................|................|................|................|...#########....|.......#........|.......#........|.......#........|.......#........|.......#........|..###########...|................|................|................',
  'イ': '................|............#...|...........#....|..........#.....|.........#......|........##......|......##.#......|....##...#......|..##.....#......|.........#......|.........#......|.........#......|.........#......|.........#......|.........#......|................',
  'る': '................|................|...#########....|...........#....|..........#.....|.........#......|........#.......|.......#..###...|......#.##...#..|.....#.#......#.|....##........#.|...#..........#.|........###...#.|.......#...#.#..|........####....|................',
  'す': '................|.........#......|.........#......|.#############..|.........#......|.......###......|......#..#......|......#..#......|.......###......|.........#......|.........#......|........#.......|.......#........|.....##.........|................|................',
  'つ': '................|................|................|................|................|.......####.....|.######....#....|............#...|............#...|............#...|...........#....|..........#.....|........##......|.....###........|................|................',
  'く': '................|..........#.....|.........#......|........#.......|.......#........|......#.........|.....#..........|......#.........|.......#........|........#.......|.........#......|..........#.....|...........#....|................|................|................',
  'か': '................|.....#..........|.....#..........|.....#......#...|.#########...#..|....#....#....#.|....#....#......|....#....#......|...#.....#......|...#.....#......|..#......#......|..#..#..#.......|.#....##........|................|................|................',
  'ら': '................|....##..........|......##........|................|...#............|...#............|...#............|...#.#####......|...##.....#.....|...#.......#....|...........#....|..........#.....|........##......|.....###........|................|................',
  'ま': '................|.......#........|..###########...|.......#........|.......#........|...#########....|.......#........|.......#........|.......#........|....####........|...#...##.......|...#...#.##.....|....###....##...|................|................|................',
  'は': '................|................|.#..............|.#.........#....|.#..#########...|.#.........#....|.#.........#....|.#.........#....|.#.........#....|.#.........#....|.#......####....|.#.....#...##...|.##....#...#.##.|.#......###.....|................|................',
  'い': '................|................|................|..#.............|..#.........#...|..#..........#..|..#..........#..|..#...........#.|..#...........#.|..#.............|...#............|...#..#.........|....##..........|................|................|................',
  'え': '................|......##........|........##......|................|..##########....|.........#......|........#.......|.......#........|......####......|.....#...#......|....#....#......|...#.....#......|..#......#......|.#.......####...|................|................',
  '？': '................|................|.....#####......|....#.....#.....|..........#.....|..........#.....|.........#......|........#.......|.......#........|.......#........|................|................|.......#........|................|................|................',
  '見': '................|...#########....|...#.......#....|...#.......#....|...#########....|...#.......#....|...#.......#....|...#########....|...#.......#....|...#.......#....|...#########....|.....#..#.......|.....#..#.......|....#...#.....#.|...#....#.....#.|.##......######.',
  '話': '................|..#..........##.|...#......###...|#####.....#.....|..........#.....|####..##########|..........#.....|####......#.....|..........#.....|####...#######..|#..#...#.....#..|#..#...#.....#..|#..#...#.....#..|#..#...#.....#..|####...#######..|................',
  '待': '................|...#......#.....|..#....#######..|.#........#.....|...#.###########|..##............|.#.#.......#....|#..#.###########|...#........#...|...#..#.....#...|...#...#....#...|...#........#...|...#........#...|...#........#...|...#......###...|................',
  '聞': '................|.######..######.|.#....#..#....#.|.######..######.|.#....#..#....#.|.######..######.|.#............#.|.#..########..#.|.#...#....#...#.|.#...######...#.|.#...#....#...#.|.#...######...#.|.#..########..#.|.#........#...#.|.#........#..##.|................',
  '出': '................|.......#........|..#....#....#...|..#....#....#...|..#....#....#...|..#....#....#...|..###########...|.......#........|.#.....#.....#..|.#.....#.....#..|.#.....#.....#..|.#.....#.....#..|.#.....#.....#..|.#.....#.....#..|.#############..|................',
  '実': '.......#........|.......#........|.##############.|.#............#.|...#########....|.......#........|...#########....|.......#........|###############.|.......#........|......#.#.......|.....#...#......|....#.....#.....|..##.......##...|##...........##.|................',
  '行': '................|...#............|..#...#########.|.#..............|...#............|..##............|.#.#.###########|#..#........#...|...#........#...|...#........#...|...#........#...|...#........#...|...#........#...|...#........#...|...#......###...|................',
  '島': '.......#........|......#.........|..##########....|..#........#....|..##########....|..#........#....|..##########....|..#.............|..#############.|..............#.|....#..#..#...#.|....#..#..#...#.|....#..#..#...#.|....########..#.|.............#..|...........##...',
};

const glyphPx = new Map(); // char -> [[x,y]...]
for (const [ch, [top, rows]] of Object.entries(LAT)) {
  const px = [];
  rows.split('|').forEach((r, j) => {
    if (r.length !== 7) throw new Error(`LAT ${ch} row ${j} is ${r.length} wide`);
    [...r].forEach((c, i) => { if (c === '#') px.push([i, top + j]); });
  });
  glyphPx.set(ch, px);
}
for (const [ch, rows] of Object.entries(JP)) {
  const rs = rows.split('|');
  if (rs.length !== 16) throw new Error(`JP ${ch} has ${rs.length} rows`);
  const px = [];
  rs.forEach((r, j) => {
    if (r.length !== 16) throw new Error(`JP ${ch} row ${j} is ${r.length} wide`);
    [...r].forEach((c, i) => { if (c === '#') px.push([i, j]); });
  });
  glyphPx.set(ch, px);
}
if (SHOW_GLYPHS) for (const ch of Object.keys(JP)) {
  console.log(ch);
  console.log(JP[ch].split('|').map((r) => r.replace(/\./g, ' ').replace(/#/g, '█')).join('\n'));
}
const isWide = (ch) => JP[ch] !== undefined || ch === '　'; // the full-width space is two cells too
const cellsOf = (s) => [...s].reduce((n, ch) => n + (isWide(ch) ? 2 : 1), 0);

const usedGlyphs = new Map(); // char -> id
function glyphId(ch) {
  if (!glyphPx.has(ch)) throw new Error(`no glyph for ${JSON.stringify(ch)}`);
  if (!usedGlyphs.has(ch)) usedGlyphs.set(ch, 'g' + usedGlyphs.size.toString(36));
  return usedGlyphs.get(ch);
}
function glyphDefs() {
  let s = '';
  for (const [ch, id] of usedGlyphs) {
    const cells = new Map();
    for (const [x, y] of glyphPx.get(ch)) { if (!cells.has(y)) cells.set(y, []); cells.get(y).push(x); }
    s += `<path id="${id}" d="${rectPath(rectsOf(cells))}"/>`;
  }
  return s;
}
// A run of text on the 8 x 16 grid. Returns svg and its width in pixels.
function text(str, x, y, cls, extra = '') {
  let u = '', cx = 0;
  for (const ch of str) {
    if (ch === ' ') { cx += 8; continue; }
    if (ch === '　') { cx += 16; continue; }
    u += `<use href="#${glyphId(ch)}"${cx ? ` x="${cx}"` : ''}/>`;
    cx += isWide(ch) ? 16 : 8;
  }
  return { svg: `<g class="${cls}${extra ? ' ' + extra : ''}" transform="translate(${x} ${y})">${u}</g>`, w: cx };
}

// ================================================================ timeline
// One loop is 60 s: the theme's 20 bars of 3 s at 80 BPM (a beat is 0.75 s).
// The visitor's first frame is T0 seconds in, when the first message has
// finished typing; every animated value's first-frame value is also its
// static style, which is what reduced motion shows.
const LOOP = 60, BEAT = 0.75, BAR = 3, T0 = Number(argv('at') ?? 7);
const css = [];
let animN = 0;
const animCache = new Map();
const pc = (t, period) => {
  const v = Math.round((t / period) * 100000) / 1000;
  return `${v}%`;
};
// steps: [[t, decl, timing?]] with t in [0, period). Values hold until the
// next step (step-end), unless a step names its own timing for the segment.
function anim(steps, period = LOOP) {
  steps = [...steps].sort((a, b) => a[0] - b[0]);
  const at = (t) => { let d = steps[steps.length - 1][1]; for (const s of steps) if (s[0] <= t + 1e-9) d = s[1]; return d; };
  const frames = new Map();
  if (steps[0][0] > 0) frames.set(pc(0, period), [at(0)]);
  for (const [t, d, tf] of steps) frames.set(pc(t, period), tf ? [d, tf] : [d]);
  frames.set('100%', [at(period - 1e-6)]);
  const body = [...frames].map(([p, [d, tf]]) => `${p}{${d}${tf ? `;animation-timing-function:${tf}` : ''}}`).join('');
  const key = period + body;
  if (animCache.has(key)) return animCache.get(key);
  const name = 'a' + (animN++).toString(36);
  animCache.set(key, name);
  css.push(`@keyframes ${name}{${body}}`);
  const first = at((T0 % period + period) % period);
  css.push(`.${name}{${first};animation:${name} ${period}s step-end -${T0}s infinite}`);
  return name;
}
// visible inside the windows [a, b), hidden elsewhere
function windows(wins, period = LOOP) {
  const steps = [[0, 'opacity:0']];
  for (const [a, b] of wins) { steps.push([a, 'opacity:1']); if (b < period) steps.push([b, 'opacity:0']); }
  // a later window starting exactly where one ends must win
  const map = new Map();
  for (const s of steps) {
    if (s[1] === 'opacity:1' || !map.has(s[0])) map.set(s[0], s);
  }
  return anim([...map.values()], period);
}
// a sequence of positions: [[t, x, y]]
function moves(list, period = LOOP) {
  return anim(list.map(([t, x, y]) => [t, `transform:translate(${x}px,${y}px)`]), period);
}

// ================================================================ the picture
const rnd = mulberry32(1992);
const layers = []; // svg strings inside the picture group, back to front

// ---- sky: deep blue at the top, dithered down to pale blue
const HORIZON = 128;
{
  const r = new Raster();
  const bands = [[0, 'b'], [20, 'bl2'], [28, 'bl4'], [36, 'bl8'], [44, 'bl12'], [52, 'bl14'], [60, 'l'], [96, 'lw2'], [106, 'lw4'], [116, 'lw8']];
  bands.forEach(([y0, m], i) => r.rect(0, y0, PW, (bands[i + 1]?.[0] ?? HORIZON) - y0, m));
  layers.push(emit(r));
}
// ---- clouds: towers of cumulus sitting on the horizon, and a few flat
// streaks higher up. Each puff is lit from above: white on top, a 25% blue
// mesh in the middle, a 50% checker underneath, so the puffs in front read
// against the ones behind.
function cloud(r, puffs) {
  for (const [cx, cy, rad] of puffs) {
    r.fill(cx - rad - 1, cy - rad - 1, cx + rad + 1, Math.min(HORIZON - 1, cy + rad + 1), (x, y) => (x - cx) ** 2 + (y - cy) ** 2 <= rad * rad && y < HORIZON, (x, y) => {
      const u = (y - cy) / rad, v = (x - cx) / rad;
      if (u > 0.5) return 'lw8';
      if (u > 0.18 || (u > -0.1 && v > 0.6)) return 'wl4';
      return 'w';
    });
  }
}
{
  const r = new Raster();
  // [centre x, height]: a lumpy skyline, tallest behind the palm and on the left
  const towers = [[-6, 18], [40, 30], [92, 16], [138, 24], [190, 13], [236, 36], [292, 20], [340, 28], [394, 17], [440, 26]];
  const puffs = [];
  for (const [tx, ht] of towers) {
    const n = 6;
    for (let i = 0; i < n; i++) {
      const u = (i / (n - 1)) * 2 - 1;
      const rad = ht * (0.32 + 0.3 * (1 - Math.abs(u))) * (0.85 + rnd() * 0.3);
      const x = tx + u * ht * 1.25 + (rnd() - 0.5) * 4;
      const top = HORIZON - 2 - ht * (1 - 0.55 * Math.abs(u)) * (0.8 + rnd() * 0.25);
      puffs.push([x, top + rad, rad]);
    }
    // a crown puff on the tallest part
    puffs.push([tx + (rnd() - 0.5) * 6, HORIZON - 2 - ht + ht * 0.3, ht * 0.32]);
  }
  // far (higher on screen) puffs first, nearer and lower ones over them
  puffs.sort((a, b) => a[1] - a[2] - (b[1] - b[2]));
  cloud(r, puffs);
  r.rect(0, HORIZON - 3, PW, 3, 'lw8');
  // flat streaks high up
  for (const [x, y, w] of [[300, 64, 34], [330, 70, 22], [392, 52, 40], [410, 58, 26], [160, 84, 30], [176, 90, 18]]) {
    r.ellipse(x, y, w / 2, 2.2, (px, py) => (py < y ? 'w' : 'wl4'));
  }
  layers.push(emit(r));
}

// ---- the title: CASTAWAY in outlined capitals, dithered white to coral
// Letter outlines on a 28 x 36 box, 8-pixel strokes, 45-degree chamfers.
const LETTERS = {
  C: [[[8, 0], [28, 0], [28, 8], [12, 8], [8, 12], [8, 24], [12, 28], [28, 28], [28, 36], [8, 36], [0, 28], [0, 8]]],
  A: [[[8, 0], [20, 0], [28, 8], [28, 36], [20, 36], [20, 25], [8, 25], [8, 36], [0, 36], [0, 8]], [[11, 8], [17, 8], [20, 11], [20, 17], [8, 17], [8, 11]]],
  S: [[[8, 0], [28, 0], [28, 8], [11, 8], [8, 11], [8, 12], [11, 14], [20, 14], [28, 22], [28, 28], [20, 36], [0, 36], [0, 28], [17, 28], [20, 25], [20, 24], [17, 22], [8, 22], [0, 14], [0, 8]]],
  T: [[[0, 0], [28, 0], [28, 8], [18, 8], [18, 36], [10, 36], [10, 8], [0, 8]]],
  W: [[[0, 0], [8, 0], [8, 27], [11, 27], [11, 12], [17, 12], [17, 27], [20, 27], [20, 0], [28, 0], [28, 30], [22, 36], [16, 36], [14, 34], [12, 36], [6, 36], [0, 30]]],
  Y: [[[0, 0], [8, 0], [8, 9], [14, 15], [20, 9], [20, 0], [28, 0], [28, 12], [18, 22], [18, 36], [10, 36], [10, 22], [0, 12]]],
};
const TITLE_FILL = (y) => (y < 6 ? 'w' : y < 9 ? 'wy8' : y < 15 ? 'y' : y < 18 ? 'yc8' : y < 21 ? 'yc12' : y < 30 ? 'c' : 'ch4');
function letterRaster(ch) {
  const r = new Raster(36, 44);
  const shape = new Raster(36, 44).poly(LETTERS[ch].map((ring) => ring.map(([x, y]) => [x + 1, y + 1])), 'x');
  // extrusion: the shape pushed down and right, in deep blue
  for (let k = 3; k >= 1; k--) r.over(shape, k, k);
  for (let i = 0; i < r.p.length; i++) if (r.p[i] !== null) r.p[i] = 'n';
  for (let y = 0; y < shape.h; y++) for (let x = 0; x < shape.w; x++) if (shape.get(x, y)) {
    // 1-pixel highlight on the top and left edges
    const edge = !shape.get(x, y - 1) || !shape.get(x - 1, y);
    r.set(x, y, edge && y < 20 ? 'w' : TITLE_FILL(y - 1));
  }
  r.outline('k');
  return r;
}
const TITLE = 'CASTAWAY', TX = 14, TY = 9, TPITCH = 31;
const letterDefs = [];
const letterIds = {};
for (const ch of new Set(TITLE)) {
  letterIds[ch] = 'L' + ch;
  letterDefs.push(`<g id="L${ch}">${emit(letterRaster(ch), -1, -1)}</g>`);
}
const titleSvg = [...TITLE].map((ch, i) => `<use href="#L${ch}" x="${TX + i * TPITCH}" y="${TY}"/>`).join('');

// ---- the sea
{
  const r = new Raster();
  const bands = [[HORIZON, 'n'], [HORIZON + 2, 'nb8'], [HORIZON + 5, 'b'], [HORIZON + 22, 'bt4'], [HORIZON + 30, 'bt8'], [HORIZON + 38, 'bt12'], [HORIZON + 46, 't']];
  bands.forEach(([y0, m], i) => r.rect(0, y0, PW, (bands[i + 1]?.[0] ?? PH) - y0, m));
  layers.push(emit(r));
}
// ---- shallows round the island
const IX = 300, IY = 206;
{
  const r = new Raster();
  r.ellipse(IX, IY + 3, 150, 32, 'ta4');
  r.ellipse(IX, IY + 3, 134, 28, 'ta8');
  r.ellipse(IX, IY + 2, 116, 24, 'a');
  layers.push(emit(r));
}
// ---- wave dashes on the open sea (static) and glints (two blinking sets)
const inShallows = (x, y) => ((x - IX) / 152) ** 2 + ((y - IY - 3) / 34) ** 2 <= 1;
{
  const r = new Raster();
  const g1 = new Raster(), g2 = new Raster();
  for (let i = 0; i < 210; i++) {
    const y = HORIZON + 3 + Math.floor((rnd() ** 1.6) * (PH - HORIZON - 4));
    const depth = (y - HORIZON) / (PH - HORIZON);
    const len = Math.max(1, Math.round(2 + depth * 9 * (0.5 + rnd())));
    const x = Math.floor(rnd() * PW);
    if (inShallows(x, y) || inShallows(x + len, y)) continue;
    const m = y < HORIZON + 22 ? 'l' : y < HORIZON + 46 ? (rnd() < 0.5 ? 'l' : 'a') : rnd() < 0.7 ? 'a' : 'l';
    const which = rnd();
    const target = which < 0.12 ? g1 : which < 0.24 ? g2 : r;
    target.rect(x, y, len, 1, target === r ? m : 'w');
  }
  layers.push(emit(r));
  layers.push(`<g class="${anim([[0, 'opacity:1'], [1.5, 'opacity:0']], 3)}">${emit(g1)}</g>`);
  layers.push(`<g class="${anim([[0, 'opacity:0'], [1.5, 'opacity:1']], 3)}">${emit(g2)}</g>`);
}
// ---- a sailboat far out on the horizon
{
  const r = new Raster();
  r.stamp([
    '...k....',
    '...kk...',
    '...kwk..',
    '...kwwk.',
    '...kwwwk',
    '...kkkkk',
    'kkkkkkkkk',
    '.kvvvvvk',
    '..kkkkk.',
  ], 52, HORIZON - 7);
  layers.push(emit(r));
}
// ---- two gulls
{
  const r = new Raster();
  r.stamp(['k...k', '.k.k.', '..k..'], 196, 88);
  r.stamp(['k..k', '.kk.'], 214, 80);
  layers.push(emit(r));
}

// ---- the island: sand with a lit top and a wet rim, then foam
{
  const r = new Raster();
  r.ellipse(IX, IY, 94, 16, (x, y) => {
    const u = (y - IY) / 16;
    if (u > 0.78) return 'd';
    if (u > 0.5) return 'yd8';
    if (u > 0.25) return 'yd2';
    return 'y';
  });
  // a few darker specks: shells and footprints
  for (const [x, y] of [[262, 199], [276, 212], [292, 202], [352, 210], [240, 207], [318, 214], [370, 201]]) r.set(x, y, 'd');
  layers.push(emit(r));
}
{
  // foam: a broken ring where the sand meets the shallows, two frames
  const f1 = new Raster(), f2 = new Raster();
  for (let a = 0; a < 360; a += 1) {
    const rad = (a * Math.PI) / 180;
    const x = IX + Math.cos(rad) * 98, y = IY + 1 + Math.sin(rad) * 18.5;
    const on1 = Math.floor(a / 7) % 3 !== 0, on2 = Math.floor((a + 10) / 7) % 3 !== 0;
    if (y < IY - 6) continue; // the far side is hidden by the sand
    if (on1) f1.set(x, y, 'w');
    if (on2) f2.set(x, y + 1, 'w');
  }
  layers.push(`<g class="${anim([[0, 'opacity:1'], [1.5, 'opacity:0']], 3)}">${emit(f1)}</g>`);
  layers.push(`<g class="${anim([[0, 'opacity:0'], [1.5, 'opacity:1']], 3)}">${emit(f2)}</g>`);
}

// ---- the raft, pulled up on the right-hand shore: five round logs side by
// side, cut ends showing, lashed with two cream ropes
{
  const r = new Raster();
  for (let i = 0; i < 5; i++) {
    const x = 372 + i * 3, y = 196 + i * 5;
    r.rect(x + 2, y, 36, 5, (px, py) => (py === y ? 'y' : py === y + 1 ? 'yd8' : py === y + 4 ? 'h' : 'd'));
    r.ellipse(x + 2, y + 2, 1.6, 2.5, 'd');
    // the cut end: a pale disc with a ring
    r.ellipse(x + 38, y + 2, 2.6, 2.6, 'y');
    r.set(x + 38, y + 2, 'd'); r.set(x + 39, y + 2, 'd');
  }
  for (let i = 0; i < 5; i++) for (const rx of [380, 404]) r.rect(rx + i * 3, 196 + i * 5, 2, 5, (px, py) => (py === 196 + i * 5 + 4 ? 'd' : 'm'));
  r.outline('k');
  layers.push(emit(r));
}
// ---- the palm: a tall, slender, segmented trunk leaning left
const PALM_BASE = [340, 205], PALM_TOP = [314, 58];
{
  const r = new Raster();
  const [x0, y0] = PALM_BASE, [x2, y2] = PALM_TOP, x1 = 356, y1 = 124;
  let s = 0, prev = null;
  for (let t = 0; t <= 1; t += 0.0015) {
    const px = (1 - t) ** 2 * x0 + 2 * (1 - t) * t * x1 + t * t * x2;
    const py = (1 - t) ** 2 * y0 + 2 * (1 - t) * t * y1 + t * t * y2;
    const dx = 2 * (1 - t) * (x1 - x0) + 2 * t * (x2 - x1), dy = 2 * (1 - t) * (y1 - y0) + 2 * t * (y2 - y1);
    const len = Math.hypot(dx, dy), nx = -dy / len, ny = dx / len;
    if (prev) s += Math.hypot(px - prev[0], py - prev[1]);
    prev = [px, py];
    const half = (9 - 4.5 * t) / 2;
    for (let o = -half; o <= half; o += 0.25) {
      const u = o / half; // -1 left .. 1 right (normal points left-ish)
      const ring = s % 6 < 1.1;
      const m = ring ? 'h' : u > 0.45 ? 'dh8' : u < -0.5 ? 'dy8' : 'd';
      r.set(px + nx * o, py + ny * o, m);
    }
  }
  // flare at the base
  r.ellipse(x0, y0 - 1, 6, 2.5, 'd');
  r.outline('k');
  layers.push(emit(r));
}
// ---- bushes round the foot of the palm
{
  const r = new Raster();
  const blobs = [[318, 203, 6], [327, 199, 7], [337, 203, 6], [349, 200, 7], [360, 204, 5], [309, 207, 4], [368, 207, 4]];
  for (const [cx, cy, rad] of blobs) r.disc(cx, cy, rad, (x, y) => (y - cy < -rad * 0.3 ? 'g' : y - cy < rad * 0.4 ? 'gG4' : 'G'));
  // leaf ticks along the tops
  for (const [cx, cy, rad] of blobs) for (let a = 200; a <= 340; a += 35) {
    const t = (a * Math.PI) / 180;
    r.set(cx + Math.cos(t) * (rad - 1), cy + Math.sin(t) * (rad - 1), 'a');
  }
  r.outline('k');
  layers.push(emit(r));
}
// ---- the crown: tapered blades that droop under their own weight, a light
// midrib, a serrated lower edge for the leaflet tips, outlined in black
{
  const r = new Raster();
  const [cx, cy] = PALM_TOP;
  // [direction x, direction y, length, droop, widest], back to front
  const fronds = [
    [-0.15, -1, 30, 12, 6], [0.55, -0.9, 40, 18, 8], [-0.75, -0.8, 44, 22, 8],
    [1, -0.35, 64, 34, 9], [-1, -0.25, 62, 34, 9], [0.1, 0.45, 28, 20, 6],
    [0.85, 0.3, 48, 30, 8], [-0.9, 0.28, 50, 30, 8],
  ];
  for (const [vx, vy, L, droop, wmax] of fronds) {
    const n = Math.hypot(vx, vy), ux = vx / n, uy = vy / n;
    let s = 0, prev = null;
    for (let t = 0; t <= 1; t += 0.004) {
      const px = cx + ux * L * t, py = cy + uy * L * t + droop * t * t;
      if (prev) s += Math.hypot(px - prev[0], py - prev[1]);
      prev = [px, py];
      const tx = ux * L, ty = uy * L + 2 * droop * t, tl = Math.hypot(tx, ty);
      let nx = -ty / tl, ny = tx / tl;
      if (ny < 0 || (Math.abs(ny) < 0.2 && nx < 0)) { nx = -nx; ny = -ny; } // the side facing down
      const w = wmax * (t < 0.12 ? 0.35 + (t / 0.12) * 0.65 : 1 - ((t - 0.12) / 0.88) ** 1.5);
      const tooth = (s % 4) / 4;
      const up = 0.45 * w, dn = w * (0.3 + 1.0 * tooth);
      for (let o = -up; o <= dn; o += 0.35) {
        const m = o < 0.5 ? 'g' : o < w * 0.45 ? 'gG8' : 'G';
        r.set(px + nx * o, py + ny * o, m);
      }
    }
  }
  for (const [x, y] of [[cx - 3, cy + 4], [cx + 3, cy + 5], [cx, cy + 8]]) r.disc(x, y, 3.2, (px, py) => (px < x && py < y ? 'd' : 'h'));
  r.outline('k');
  layers.push(emit(r));
}
// ---- a message in a bottle, bobbing in the shallows' edge
{
  const r = new Raster();
  r.stamp([
    '..kkkkkk...',
    'kkkawwaakk.',
    'khkaaaaaaak',
    'kkkaaaaaak.',
    '..kkkkkkk..',
  ], 0, 0, { a: 'l' });
  const b = emit(r, 138, 222);
  layers.push(`<g class="${anim([[0, 'transform:translate(0,0)'], [1.5, 'transform:translate(0,1px)']], 3)}">${b}</g>`);
}

// ================================================================ her
// Small and simple, built from shapes and then outlined: brown hair in a
// loose low bun, cream headphones, coral tank top, cream shorts, bare feet.
// Eyes closed: she is listening. The head is its own layer so it can nod.
const HX = 3;            // her left margin inside her own raster
const HER_W = 24, HER_H = 46;
function herBody(variant = 'idle', frame = 0) {
  const r = new Raster(HER_W, HER_H);
  const o = HX;
  r.rect(o + 7, 13, 3, 4, 's');               // neck
  r.rect(o + 4, 16, 9, 2, 's');               // shoulders
  r.rect(o + 6, 16, 5, 11, 'c');              // tank top, straps at the edges
  r.rect(o + 7, 16, 3, 1, 's');               // scoop neck
  r.set(o + 8, 17, 's');
  r.rect(o + 6, 26, 5, 1, 'cs4');             // hem
  r.rect(o + 3, 17, 2, 10, 's');              // arms
  r.rect(o + 12, 17, 2, 10, 's');
  r.rect(o + 6, 27, 5, 3, 'm');               // shorts, flared at the legs
  r.rect(o + 5, 29, 7, 2, 'm');
  if (variant.startsWith('walk') && frame === 0) {
    for (let y = 31; y <= 41; y++) {
      const k = (y - 31) / 10;
      r.rect(Math.round(o + 6 - 2.5 * k), y, 2, 1, 's');
      r.rect(Math.round(o + 9 + 2.5 * k), y, 2, 1, 's');
    }
    r.rect(o + 2, 42, 3, 1, 's');
    r.rect(o + 12, 42, 3, 1, 's');
  } else {
    r.rect(o + 6, 31, 2, 11, 's');            // legs
    r.rect(o + 9, 31, 2, 11, 's');
    r.rect(o + 5, 42, 3, 1, 's');             // bare feet
    r.rect(o + 9, 42, 3, 1, 's');
  }
  r.outline('k');
  if (variant.endsWith('coffee')) {
    // an iced coffee in her right hand: clear cup, coffee, ice, coral straw
    const cup = new Raster(HER_W, HER_H);
    cup.rect(o + 2, 20, 1, 3, 'c');
    cup.rect(o + 0, 23, 5, 1, 'w');
    cup.rect(o + 0, 24, 5, 5, (x, y) => (y === 24 ? 'l' : x === o ? 'w' : 'h'));
    cup.set(o + 2, 25, 'm');
    cup.rect(o + 1, 29, 3, 1, 'h');
    cup.outline('k');
    r.over(cup);
  }
  return r;
}
function herHead() {
  const r = new Raster(HER_W, 17);
  const o = HX;
  r.ellipse(o + 8.5, 7, 5.6, 6.1, 'h');                // hair
  r.disc(o + 3.4, 11.6, 2.3, 'h');                     // the low bun
  r.fill(o + 4, 7, o + 13, 14, (x, y) => ((x - o - 9.1) / 3.7) ** 2 + ((y - 9.6) / 4) ** 2 <= 1 && y > 7.6, 's'); // face
  r.rect(o + 5, 7, 3, 1, 'h');                         // side-swept bangs
  r.set(o + 5, 8, 'h');
  for (const [x, y] of [[o + 5, 3], [o + 6, 2], [o + 7, 2], [o + 4, 5]]) r.set(x, y, 'd'); // shine
  r.outline('k');
  r.set(o + 7, 10, 'k'); r.set(o + 8, 10, 'k');        // closed eyes
  r.set(o + 10, 10, 'k'); r.set(o + 11, 10, 'k');
  r.set(o + 9, 12, 'c');                               // a small smile
  r.set(o + 11, 11, 'cs8'); r.set(o + 6, 11, 'cs8');   // cheeks
  // headphones: a band over the top and two cups, outlined on their own
  const hp = new Raster(HER_W, 17);
  for (let a = 196; a <= 344; a += 1) {
    const t = (a * Math.PI) / 180;
    hp.set(o + 8.5 + Math.cos(t) * 6.9, 7.4 + Math.sin(t) * 7.2, 'm');
  }
  hp.ellipse(o + 1.9, 9.2, 1.5, 2.6, 'm');
  hp.ellipse(o + 15.1, 9.2, 1.5, 2.6, 'm');
  hp.outline('k');
  r.over(hp);
  return r;
}
const NOD = anim([[0, 'transform:translate(0,1px)'], [BEAT / 2, 'transform:translate(0,0)']], BEAT);
// each pose is drawn once, in <defs>, and placed with <use>
const spriteDefs = [];
const herIds = {};
function herSprite(variant, frame = 0) {
  const key = variant + frame;
  if (!herIds[key]) {
    herIds[key] = 'H' + key;
    spriteDefs.push(`<g id="H${key}">${emit(herBody(variant, frame))}</g>`);
  }
  if (!herIds.head) { herIds.head = 'Hh'; spriteDefs.push(`<g id="Hh">${emit(herHead())}</g>`); }
  return `<use href="#${herIds[key]}"/><use class="${NOD}" href="#Hh"/>`;
}
function herShadow() {
  const r = new Raster(HER_W, HER_H + 2);
  r.ellipse(HX + 8.5, 43, 7.5, 1.6, 'yd8');
  return emit(r);
}
function ripple() {
  const r = new Raster(HER_W + 6, HER_H + 3);
  const inner = new Raster(HER_W + 6, HER_H + 3).ellipse(HX + 8.5, 43, 7.5, 1.1, 'x');
  r.ellipse(HX + 8.5, 43, 10, 2.4, 'w');
  for (let i = 0; i < r.p.length; i++) if (inner.p[i]) r.p[i] = null;
  return emit(r);
}

// ================================================================ the menu
const MENU = [
  { jp: '見る', en: 'LOOK' },
  { jp: '話す', en: 'TALK', off: true }, // nobody to talk to
  { jp: '待つ', en: 'WAIT' },
  { jp: '聞く', en: 'LISTEN' },
  { jp: '出る', en: 'LEAVE' },
  { jp: '実行', en: 'RUN' },
];
// Five commands, four bars (12 s) each, each picked on the bar.
const SCENES = [{ item: 0, t: 0 }, { item: 2, t: 12 }, { item: 3, t: 24 }, { item: 4, t: 36 }, { item: 5, t: 48 }];

// ================================================================ events in the picture
const HOME = [232, 214 - 43]; // her raster's origin, feet on the sand
const WALK_OUT = [214, 184, 154, 124, 94, 64, 34, 4, -26];
const WALK_BACK = [-26, 4, 34, 64, 94, 124, 154, 184, 214];
const STEP = BEAT / 2;
const LEAVE_T = 39;
const GONE_T = LEAVE_T + WALK_OUT.length * STEP;
const BACK_T = 43.5;
const HOME_T = BACK_T + WALK_BACK.length * STEP;
const pic = [];
{
  const [hx, hy] = HOME;
  pic.push(`<g transform="translate(${hx} ${hy})"><g class="${windows([[0, LEAVE_T]])}">${herShadow()}${herSprite('idle')}</g><g class="${windows([[HOME_T, LOOP]])}">${herShadow()}${herSprite('coffee')}</g></g>`);
  // over the water and out of the picture, then back with a coffee
  const steps = [[0, -80, hy]];
  WALK_OUT.forEach((x, i) => steps.push([LEAVE_T + i * STEP, x, hy]));
  steps.push([GONE_T, -80, hy]);
  WALK_BACK.forEach((x, i) => steps.push([BACK_T + i * STEP, x, hy]));
  steps.push([HOME_T, -80, hy]);
  const stride = [];
  WALK_OUT.forEach((_, i) => { if (i % 2 === 0) stride.push([LEAVE_T + i * STEP, LEAVE_T + (i + 1) * STEP]); });
  WALK_BACK.forEach((_, i) => { if (i % 2 === 0) stride.push([BACK_T + i * STEP, BACK_T + (i + 1) * STEP]); });
  const strideA = windows(stride);
  const strideB = anim([[0, 'opacity:1'], ...stride.flatMap(([a, b]) => [[a, 'opacity:0'], [b, 'opacity:1']])]);
  pic.push(`<g class="${moves(steps)}">${ripple()}` +
    `<g class="${windows([[LEAVE_T, GONE_T]])}"><g class="${strideA}">${herSprite('walk', 0)}</g><g class="${strideB}">${herSprite('idle')}</g></g>` +
    `<g class="${windows([[BACK_T, HOME_T]])}"><g class="${strideA}">${herSprite('walkcoffee', 0)}</g><g class="${strideB}">${herSprite('coffee')}</g></g></g>`);
}
// WAIT: a shark in headphones surfaces on the next bar and nods along
const SHARK_UP = 15, SHARK_DOWN = 22.5, SHARK_GONE = 23.25;
{
  // side view, facing the island, snout raised: a tilted ellipse for the
  // head, white jaw, a closed smile, gills, and headphones (one cup on the
  // near side, the band over the top)
  const WL = 17;                                  // waterline
  const SW = 44;
  const th = (-24 * Math.PI) / 180, [hcx, hcy] = [26, 13], RX = 12.5, RY = 6.6;
  const toLocal = (x, y) => [(x - hcx) * Math.cos(th) + (y - hcy) * Math.sin(th), -(x - hcx) * Math.sin(th) + (y - hcy) * Math.cos(th)];
  const toScreen = (u, v) => [hcx + u * Math.cos(th) - v * Math.sin(th), hcy + u * Math.sin(th) + v * Math.cos(th)];
  const finShape = (r, dx) => { r.poly([[[1 + dx, WL], [6 + dx, 7], [9 + dx, 5], [12 + dx, WL]]], (x) => (x < 5 + dx ? 'vw4' : 'v')); r.outline('k'); return r; };
  const fin = finShape(new Raster(SW, 22), 0);       // behind the raised head
  const finOnly = finShape(new Raster(SW, 22), 14);  // just the fin, circling
  const head = new Raster(SW, 22);
  head.fill(0, 0, SW, WL - 1, (x, y) => {
    const [u, v] = toLocal(x, y);
    const ry = RY * (u > 0 ? 1 - 0.4 * (u / RX) ** 1.5 : 1); // a pointed snout
    return (u / RX) ** 2 + (v / ry) ** 2 <= 1;
  }, (x, y) => {
    const [u, v] = toLocal(x, y);
    return v > 1.4 && u > -7 ? 'w' : v < -4.4 ? 'vw4' : 'v';
  });
  head.outline('k');
  for (let u = 1; u <= 10.5; u += 0.5) head.set(...toScreen(u, 1.2 - (u > 9 ? (u - 9) * 0.9 : 0)), 'k'); // a closed smile
  const [ex, ey] = toScreen(6, -2.4);
  head.rect(Math.round(ex), Math.round(ey) - 1, 2, 2, 'k'); head.set(Math.round(ex) + 1, Math.round(ey) - 1, 'w');
  // headphones: the band over the top, then the near cup over the band
  const band = new Raster(SW, 22);
  for (let k = 0; k <= 1; k += 0.04) band.set(...toScreen(-1.6 + k * 1.2, -2.6 - k * 5.2), 'm');
  band.outline('k');
  head.over(band);
  const cup = new Raster(SW, 22);
  cup.ellipse(...toScreen(-1.8, -0.6), 1.8, 2.5, 'm');
  cup.outline('k');
  head.over(cup);
  const wake = new Raster(SW, 22);
  wake.rect(0, WL, 42, 1, 'w');
  wake.rect(4, WL + 1, 34, 1, 'a');
  const finWake = new Raster(SW, 22);
  finWake.rect(13, WL, 15, 1, 'w');
  const [sx, sy] = [52, 162];
  pic.push(`<g transform="translate(${sx} ${sy})">` +
    `<g class="${windows([[SHARK_UP, SHARK_UP + BEAT], [SHARK_DOWN, SHARK_GONE]])}">${emit(finWake)}${emit(finOnly)}</g>` +
    `<g class="${windows([[SHARK_UP + BEAT, SHARK_DOWN]])}">${emit(wake)}${emit(fin)}<g class="${NOD}">${emit(head)}</g></g></g>`);
}
// LISTEN: notes float up from her headphones, one beat apart
{
  const note = (two) => {
    const r = new Raster(12, 12);
    if (two) {
      r.rect(3, 1, 6, 1, 'w'); r.rect(3, 1, 1, 7, 'w'); r.rect(8, 1, 1, 7, 'w');
      r.ellipse(2, 8.5, 1.7, 1.3, 'w'); r.ellipse(7, 8.5, 1.7, 1.3, 'w');
    } else {
      r.rect(5, 1, 1, 7, 'w'); r.rect(6, 2, 1, 1, 'w'); r.rect(7, 3, 1, 2, 'w');
      r.ellipse(4, 8.5, 1.7, 1.3, 'w');
    }
    r.outline('k');
    return emit(r);
  };
  const vis = windows([[24, 36]]);
  const [hx, hy] = HOME;
  let s = `<g class="${vis}">`;
  [[hx + 20, hy - 2, false, 0], [hx - 8, hy + 2, true, 1], [hx + 24, hy + 6, true, 2]].forEach(([x, y, two, k]) => {
    const path = [];
    for (let b = 0; b < 4; b++) path.push([((b + k) % 4) * BEAT, x + [0, 3, 5, 4][b], y - b * 6]);
    path.sort((a, b) => a[0] - b[0]);
    s += `<g class="${moves(path, BAR)}">${note(two)}</g>`;
  });
  pic.push(s + '</g>');
}
// RUN: a drone brings a parcel (another pair of headphones) and leaves
{
  const drone = (spin) => {
    const r = new Raster(24, 12);
    if (spin) { r.rect(0, 0, 8, 1, 'v'); r.rect(15, 0, 8, 1, 'v'); } else { r.rect(2, 0, 4, 1, 'v'); r.rect(17, 0, 4, 1, 'v'); }
    r.rect(3, 1, 2, 2, 'v'); r.rect(18, 1, 2, 2, 'v');
    r.rect(3, 3, 17, 3, (x, y) => (y === 3 ? 'w' : 'v'));
    r.rect(8, 6, 7, 1, 'v');
    r.set(11, 4, 'c');
    r.outline('k');
    return emit(r);
  };
  const parcel = new Raster(14, 12);
  parcel.rect(0, 0, 11, 7, (x, y) => (x === 5 ? 'm' : y === 0 ? 'y' : 'd'));
  parcel.outline('k');
  const D0 = 48.75;
  const dsteps = [[0, 460, 40]];
  const dpath = [[460, 40], [430, 58], [400, 76], [370, 94], [340, 112], [310, 128], [284, 140], [262, 148]];
  dpath.forEach(([x, y], i) => dsteps.push([D0 + i * STEP, x, y]));
  const drop = D0 + dpath.length * STEP + BEAT; // hover a beat, then let go
  const away = [[268, 138], [290, 116], [320, 92], [356, 66], [396, 40], [440, 14], [470, -20]];
  away.forEach(([x, y], i) => dsteps.push([drop + BEAT + i * STEP, x, y]));
  const spinA = anim([[0, 'opacity:1'], [0.1875, 'opacity:0']], 0.375);
  const spinB = anim([[0, 'opacity:0'], [0.1875, 'opacity:1']], 0.375);
  pic.push(`<g class="${windows([[D0, drop + BEAT + away.length * STEP]])}"><g class="${moves(dsteps)}"><g class="${spinA}">${drone(true)}</g><g class="${spinB}">${drone(false)}</g></g></g>`);
  // the parcel hangs under the drone, then drops in three steps beside her
  const psteps = [[0, -40, 0]];
  dpath.forEach(([x, y], i) => psteps.push([D0 + i * STEP, x + 6, y + 8]));
  const [lx, ly] = [HOME[0] + 26, 204];
  [[262 + 6, 166], [262 + 8, 184], [lx, ly - 2], [lx, ly]].forEach(([x, y], i) => psteps.push([drop + i * (STEP / 2), x, y]));
  pic.push(`<g class="${windows([[D0, LOOP]])}"><g class="${moves(psteps)}">${emit(parcel)}</g></g>`);
}

// The loop point: the picture is wiped and redrawn one interlaced line in
// eight at a time, so the reset to the first scene reads as the next
// picture loading.
const blindDefs = [];
{
  const ORDER = [0, 4, 2, 6, 1, 5, 3, 7], dt = BEAT / 8;
  let s = '';
  for (let k = 1; k <= 8; k++) {
    const rows = ORDER.slice(0, k).map((y) => `M0 ${y}h8v1h-8z`).join('');
    if (k < 8) blindDefs.push(`<pattern id="w${k}" width="8" height="8" patternUnits="userSpaceOnUse"><path class="k" d="${rows}"/></pattern>`);
    const wins = k < 8
      ? [[LOOP - BEAT + (k - 1) * dt, LOOP - BEAT + k * dt], [(8 - k) * dt, (9 - k) * dt]]
      : [[0, dt], [LOOP - dt, LOOP]];
    s += `<path ${k < 8 ? `fill="url(#w${k})" class="${windows(wins)}"` : `class="k ${windows(wins)}"`} d="M0 0h${PW}v${PH}H0z"/>`;
  }
  pic.push(s);
}

// ================================================================ the screen
const W = 640, H = 400;
const PX = 12, PY = 24;                 // picture origin
const MX = 476, MY = 24, MW = 152, MH = 160;    // menu
const SX = 476, SY = 196, SW = 152, SH = 68;    // status box
const QX = 12, QY = 280, QW = 616, QH = 96;     // message window
function frame(x, y, w, h) {
  const r = (dx, cls) => `<path class="${cls}" d="M${x - dx} ${y - dx}h${w + 2 * dx}v${h + 2 * dx}h-${w + 2 * dx}z"/>`;
  return r(4, 'w') + r(3, 'v') + r(1, 'k');
}
const ui = [];
// row 0: the status line, text layer
ui.push(text('CASTAWAY', 8, 0, 'xc').svg);
ui.push(text('a ten-hour lo-fi island video', 8 + 10 * 8, 0, 'xw').svg);
{
  const s = '☀ always daytime';
  ui.push(text(s, W - 8 - cellsOf(s) * 8, 0, 'xy').svg);
}
// the picture
ui.push(frame(PX, PY, PW, PH));
// the title over the picture, and its reading on the text layer
const SUB = 'キャストアウェイ';
const subX = TX + Math.round((TPITCH * 7 + 28 - cellsOf(SUB) * 8) / 2);
const picSvg = `<g transform="translate(${PX} ${PY})" clip-path="url(#pic)">${layers.join('')}${titleSvg}` +
  [[-1, 0], [1, 0], [0, -1], [0, 1], [1, 1]].map(([dx, dy]) => text(SUB, subX + dx, 54 + dy, 'n').svg).join('') + text(SUB, subX, 54, 'xw').svg + `${pic.join('')}</g>`;
ui.push(picSvg);
// the command menu
ui.push(frame(MX, MY, MW, MH));
{
  const head = 'コマンド';
  ui.push(text(head, MX + (MW - cellsOf(head) * 8) / 2, MY + 4, 'xc').svg);
  ui.push(`<path class="v" d="M${MX + 6} ${MY + 25}h${MW - 12}v1h-${MW - 12}z"/>`);
}
const itemY = (i) => MY + 32 + i * 20;
{
  // the cursor bar and arrow step to each command on the bar, and blink twice when it is picked
  const steps = SCENES.map((s) => [s.t, `transform:translate(0,${itemY(s.item) - itemY(0)}px)`]);
  const blinks = [[0, 'opacity:1']];
  for (const s of SCENES) blinks.push([s.t, 'opacity:0'], [s.t + 0.1875, 'opacity:1'], [s.t + 0.375, 'opacity:0'], [s.t + 0.5625, 'opacity:1']);
  ui.push(`<g class="${anim(steps)}"><path class="${anim(blinks)} n" d="M${MX + 2} ${itemY(0) - 2}h${MW - 4}v20h-${MW - 4}z"/>${text('▶', MX + 6, itemY(0), 'xy').svg}</g>`);
}
MENU.forEach((m, i) => {
  ui.push(text(m.jp, MX + 20, itemY(i), m.off ? 'v' : 'xw').svg);
  ui.push(text(m.en, MX + 60, itemY(i), m.off ? 'v' : 'xc').svg);
});
// the status box: run length, seed, bar counter, beat lights
ui.push(frame(SX, SY, SW, SH));
ui.push(text('RUN', SX + 8, SY + 1, 'xc').svg + text('10:00:00', SX + 8 + 5 * 8, SY + 1, 'xw').svg);
ui.push(text('SEED', SX + 8, SY + 17, 'xc').svg + text('1992', SX + 8 + 5 * 8, SY + 17, 'xw').svg);
ui.push(text('BAR', SX + 8, SY + 33, 'xc').svg + text('/20', SX + 8 + 7 * 8, SY + 33, 'xw').svg);
{
  // tens and ones of the bar number, 1 to 20, three seconds each
  const bx = SX + 8 + 5 * 8, by = SY + 33;
  const tens = { 0: [[0, 27]], 1: [[27, 57]], 2: [[57, 60]] };
  for (const [d, w] of Object.entries(tens)) ui.push(text(String(d), bx, by, `xw ${windows(w)}`).svg);
  for (let d = 0; d < 10; d++) {
    const w = [];
    for (let b = 1; b <= 20; b++) if (b % 10 === d) w.push([(b - 1) * BAR, b * BAR]);
    ui.push(text(String(d), bx + 8, by, `xw ${windows(w)}`).svg);
  }
}
ui.push(text('BEAT', SX + 8, SY + 49, 'xc').svg);
for (let i = 0; i < 4; i++) {
  const x = SX + 8 + 5 * 8 + i * 12, y = SY + 49 + 5;
  ui.push(`<path class="v" d="M${x} ${y}h7v7h-7z"/>`);
  ui.push(`<path class="${i === 0 ? 'xr' : 'xy'} ${windows([[i * BEAT, (i + 1) * BEAT]], BAR)}" d="M${x} ${y}h7v7h-7z"/>`);
}

// ================================================================ the message window
const LINE_X = QX + 12, LINE_Y = [QY + 6, QY + 24, QY + 42, QY + 60], CPS = 50, MAXC = 72;
const MSGS = [
  { win: [0, 12], lines: [
    [0.75, 'A tiny island: one tall palm, one raft, and her, in cream headphones,'],
    [null, 'nodding to the beat. It is a ten-hour lo-fi video in which almost'],
    [null, 'nothing happens, on purpose. Every so often, something does.'],
    [5.2, 'Try WAIT.', 'xy'],
  ] },
  { win: [12, 24], lines: [
    [12.75, 'Time passes.'],
    [SHARK_UP, 'On the next bar, a shark in headphones surfaces and nods along.'],
    [null, 'More than 90 activities. Four timers: every 2-5 min, 12-25 min,'],
    [null, '30-60 min and, rarely, every 3-6 hours. The rest of the time: this.'],
  ] },
  { win: [24, 36], lines: [
    [24.75, 'Electric piano, a kalimba lead, soft drums, vinyl crackle: 80 BPM,'],
    [null, 'F major, one 60-second loop with no seam. Every sound is synthesized'],
    [null, 'from code. No samples, no recordings, no third-party licences.'],
    [null, 'Nobody has listened to it yet. It measures -14 LUFS, though.'],
  ] },
  { win: [36, LEAVE_T], lines: [
    [36.75, '島から出ますか？　(Leave the island?)'],
    [37.5, '　　 はい　　YES', 'xw', true],
    [37.5, '　　 いいえ　NO', 'xw', true],
  ], choice: true },
  { win: [LEAVE_T, 48], lines: [
    [LEAVE_T, 'She could leave any time. She walks out over the water...'],
    [BACK_T, '...and comes back with an iced coffee.'],
    [null, 'Super rare, at most once a run, and never explained.'],
  ] },
  { win: [48, 60], lines: [
    [48.75, 'A drone drops off a parcel: another pair of headphones. Anyway:'],
    [null, 'A>python tools/serve.py', 'xy'],
    [null, 'Then open http://127.0.0.1:8765/ for the live preview, and export a'],
    [null, 'YouTube-ready MP4, 1080p at 30 fps, from the browser. No build step.'],
  ] },
];
ui.push(frame(QX, QY, QW, QH));
const msg = [];
for (const m of MSGS) {
  let s = `<g class="${windows([m.win])}">`;
  let t = null;
  m.lines.forEach(([start, str, cls = 'xw', instant], i) => {
    const cells = cellsOf(str);
    if (cells > MAXC) throw new Error(`message line too long (${cells}): ${str}`);
    t = start ?? t + 0.1;
    const x = LINE_X, y = LINE_Y[i];
    s += text(str, x, y, cls).svg;
    if (!instant) {
      const end = t + cells / CPS, w = cells * 8 + 8;
      let cover;
      if ([...str].some(isWide)) {
        // a full-width character appears whole, not half at a time
        const steps = [[0, 'transform:translate(0,0)']];
        let c = 0;
        for (const ch of str) {
          const cw = isWide(ch) ? 2 : 1;
          steps.push([t + c / CPS, `transform:translate(${(c + cw) * 8}px,0)`]);
          c += cw;
        }
        cover = anim(steps);
      } else {
        cover = anim([[0, 'transform:translate(0,0)'], [t, 'transform:translate(0,0)', `steps(${cells},end)`], [end, `transform:translate(${cells * 8}px,0)`]]);
      }
      s += `<path class="k ${cover}" d="M${x} ${y}h${w}v16h-${w}z"/>`;
      t = end;
    } else {
      // appears whole; covered until then
      s += `<path class="k ${windows([[m.win[0], start]])}" d="M${x} ${y}h${cells * 8 + 8}v16h-${cells * 8 + 8}z"/>`;
    }
  });
  if (m.choice) {
    // the choice cursor sits on はい, and はい blinks when it is taken
    const pick = 38.25;
    const y = LINE_Y[1];
    s += `<g class="${windows([[37.5, LEAVE_T]])}"><path class="n ${anim([[0, 'opacity:0'], [pick, 'opacity:1'], [pick + 0.1875, 'opacity:0'], [pick + 0.375, 'opacity:1']])}" d="M${LINE_X + 36} ${y - 1}h${12 * 8}v18h-${12 * 8}z"/>${text('▶', LINE_X + 24, y, 'xy').svg}${text('はい　　YES', LINE_X + 40, y, 'xw').svg}</g>`;
  } else {
    // the "more" marker blinks once the text is all out
    s += `<g class="${windows([[t, m.win[1]]])}">${text('▼', QX + QW - 20, QY + QH - 20, `xy ${anim([[0, 'opacity:1'], [0.5, 'opacity:0']], 1)}`).svg}</g>`;
  }
  msg.push(s + '</g>');
}
ui.push(`<g clip-path="url(#msg)">${msg.join('')}</g>`);
// row 24: the prompt with the one command that matters
ui.push(text('A>python tools/serve.py', 8, 384, 'xw').svg);
ui.push(text('█', 8 + 23 * 8, 384, `xw ${anim([[0, 'opacity:1'], [0.5, 'opacity:0']], 1)}`).svg);
{
  const s = 'then open http://127.0.0.1:8765/';
  ui.push(text(s, W - 8 - cellsOf(s) * 8, 384, 'xc').svg);
}

// ================================================================ assembly
const svg = [
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" shape-rendering="crispEdges">`,
  `<title>CASTAWAY: a late-80s Japanese computer adventure screen</title>`,
  `<desc>A dithered 16-colour island picture under the title CASTAWAY, a command menu (look, talk greyed out, wait, listen, leave, run) and a message window that types; the last message gives the run command, python tools/serve.py, then http://127.0.0.1:8765/.</desc>`,
  `<style>${Object.entries(PAL).map(([k, v]) => `.${k}{fill:${v}}`).join('')}${Object.entries(TXT).map(([k, v]) => `.${k}{fill:${v}}`).join('')}${css.join('')}@media (prefers-reduced-motion:reduce){*{animation:none!important}}</style>`,
  `<defs><clipPath id="scr"><rect width="${W}" height="${H}" rx="10"/></clipPath><clipPath id="pic"><rect width="${PW}" height="${PH}"/></clipPath><clipPath id="msg"><rect x="${QX}" y="${QY}" width="${QW}" height="${QH}"/></clipPath>`,
  // patterns and glyphs are collected while drawing, so they go last
  null,
  `</defs><g clip-path="url(#scr)"><path class="k" d="M0 0h${W}v${H}H0z"/>${ui.join('')}</g></svg>`,
];
svg[svg.indexOf(null)] = `${blindDefs.join('')}${[...usedPatterns].map(patternDef).join('')}${glyphDefs()}${letterDefs.join('')}${spriteDefs.join('')}`;
const out = svg.join('');
fs.writeFileSync(OUT, out);
console.log(`wrote ${OUT} (${(out.length / 1024).toFixed(1)} KB, ${usedGlyphs.size} glyphs, ${usedPatterns.size} patterns, ${animN} animations)`);
