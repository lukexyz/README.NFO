#!/usr/bin/env node
// CASTAWAY README header: "One-Bit Desktop" (60-one-bit-desktop_opus_5.5).
// Plain Node, no dependencies, fully deterministic (no clock, no Math.random).
//   node examples/castaway/src/60-one-bit-desktop_opus_5.5.mjs
// writes examples/castaway/assets/60-one-bit-desktop_opus_5.5.svg
//
// The style (catalogue entry vap-11) is the classic 1-bit System 6/7 desktop:
// black and white only, every grey a dither, a white menu bar with bold menu
// titles, pinstriped title bars with a close box, hard black window shadows,
// 32x32 icons with their names on little white plates, a scroll bar with a
// checkered track, an alert box with a double frame and a fat default button.
//
// Here the desktop belongs to the island. The window "Castaway" holds a
// one-bit painting of her island with the name lettered across the sky in
// the old Shadow text style. A modal dialog waits for something to happen,
// its dithered progress bar filling one beat at a time. When it is full the
// Gags menu drops down by itself, a gag blinks, and on the next bar line it
// happens in the painting: a message in a bottle that washes straight back,
// a shark in headphones nodding on the beat, a coconut that falls on a
// hermit crab and walks off wearing it. Then the waiting starts again.
//
// Nothing is copied from a real system: no logo, no Kare icon, no Chicago.
// The fonts (a bold system face, a small body face and the big display
// letters), the icons, the palm, the girl and every gag are drawn in this
// file, pixel by pixel or from rounded rectangles, into an indexed 1-bit
// raster whose runs are merged into rectangles. Greys are SVG <pattern>
// dithers in user space, so they line up across every layer.
//
// Logical screen 416x280, shown at 2x (832 px). Animation is CSS keyframes,
// all stepped (hard cuts), one 36 s loop = 12 bars of the 80 BPM theme, three
// 12 s rounds of wait (4.5 s), menu (1.5 s) and gag (6 s, starting on a bar
// line). Reduced motion freezes on the shark round, mid nod.

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const SLUG = '60-one-bit-desktop_opus_5.5';
const OUT = resolve(here, `../assets/${SLUG}.svg`);

const W = 416;
const H = 280;
const T = 36; // loop, seconds (12 bars of 3 s)
const BEAT = 0.75;
const STATIC = 21.6; // reduced-motion frame: the shark, mid nod

// ---------------------------------------------------------------- inks
// 0 = transparent, 1 = black, 2 = white, 3+ = dither patterns.
const CLEAR = 0, B = 1, Wt = 2;
const PATTERNS = {
  // name: [rows], grey level used when the image is shown too small to dither
  chk: { rows: ['#.', '.#'], grey: '#808080' },
  lg: { rows: ['#...', '..#.'], grey: '#bfbfbf' },
  vlg: { rows: ['#...', '....', '..#.', '....'], grey: '#dfdfdf' },
  dot: { rows: ['#.......', '........', '....#...', '........', '..#.....', '........', '......#.', '........'], grey: '#efefef' },
  dg: { rows: ['.###', '##.#'], grey: '#404040' },
  sea1: { rows: ['###.###.', '........', '#.###.##', '........'], grey: '#a0a0a0' },
  sea2: { rows: ['##......', '........', '....##..', '........'], grey: '#e0e0e0' },
  sea3: {
    rows: ['###.............', '................', '................', '................',
      '..........##....', '................', '................', '................'],
    grey: '#f4f4f4',
  },
  sand: { rows: ['........', '..#.....', '........', '......#.', '........', '#.......', '........', '....#...'], grey: '#efefef' },
  diag: { rows: ['#...', '.#..', '..#.', '...#'], grey: '#bfbfbf' },
};
const INK = { clear: CLEAR, black: B, white: Wt };
Object.keys(PATTERNS).forEach((k, i) => { INK[k] = 3 + i; });
const PAT_OF = Object.fromEntries(Object.entries(INK).filter(([, v]) => v >= 3).map(([k, v]) => [v, k]));

// ---------------------------------------------------------------- raster
class Raster {
  constructor(w, h, x0 = 0, y0 = 0) {
    this.w = w; this.h = h; this.x0 = x0; this.y0 = y0;
    this.px = new Uint8Array(w * h);
  }
  // all coordinates are absolute screen coordinates
  set(x, y, ink) {
    x -= this.x0; y -= this.y0;
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    this.px[y * this.w + x] = ink;
  }
  get(x, y) {
    x -= this.x0; y -= this.y0;
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return CLEAR;
    return this.px[y * this.w + x];
  }
  rect(x, y, w, h, ink) {
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) this.set(i, j, ink);
  }
  frame(x, y, w, h, ink = B) {
    this.rect(x, y, w, 1, ink); this.rect(x, y + h - 1, w, 1, ink);
    this.rect(x, y, 1, h, ink); this.rect(x + w - 1, y, 1, h, ink);
  }
  hline(x, y, w, ink = B) { this.rect(x, y, w, 1, ink); }
  vline(x, y, h, ink = B) { this.rect(x, y, 1, h, ink); }
  // fill every pixel whose centre passes test(cx, cy) inside the box
  fill(x, y, w, h, test, ink) {
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (test(i + 0.5, j + 0.5)) this.set(i, j, ink);
  }
  ellipse(cx, cy, rx, ry, ink) {
    this.fill(Math.floor(cx - rx - 1), Math.floor(cy - ry - 1), Math.ceil(rx * 2 + 3), Math.ceil(ry * 2 + 3),
      (px, py) => ((px - cx) / rx) ** 2 + ((py - cy) / ry) ** 2 <= 1, ink);
  }
  // even-odd polygon fill (pixel centres)
  poly(pts, ink) {
    const ys = pts.map((p) => p[1]);
    const y0 = Math.floor(Math.min(...ys)), y1 = Math.ceil(Math.max(...ys));
    for (let y = y0; y <= y1; y++) {
      const cy = y + 0.5;
      const xs = [];
      for (let i = 0; i < pts.length; i++) {
        const [ax, ay] = pts[i], [bx, by] = pts[(i + 1) % pts.length];
        if ((ay <= cy && by > cy) || (by <= cy && ay > cy)) xs.push(ax + ((cy - ay) / (by - ay)) * (bx - ax));
      }
      xs.sort((a, b) => a - b);
      for (let k = 0; k + 1 < xs.length; k += 2) {
        for (let x = Math.ceil(xs[k] - 0.5); x <= Math.floor(xs[k + 1] - 0.5); x++) this.set(x, y, ink);
      }
    }
  }
  // 1-px Bresenham line
  line(x0, y0, x1, y1, ink = B) {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    for (;;) {
      this.set(x0, y0, ink);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
  }
  // blit a sprite: rows of characters, legend maps char -> ink (missing = skip)
  sprite(rows, x, y, legend = SPR) {
    rows.forEach((row, j) => [...row].forEach((ch, i) => {
      const ink = legend[ch];
      if (ink !== undefined) this.set(x + i, y + j, ink);
    }));
  }
  // set a 1-bit mask (array of arrays of booleans) at x, y
  mask(m, x, y, ink) {
    m.forEach((row, j) => row.forEach((on, i) => { if (on) this.set(x + i, y + j, ink); }));
  }
  // rounded rectangle outline/fill helpers
  rrect(x, y, w, h, r, ink) {
    this.fill(x, y, w, h, (px, py) => inRR(px, py, x, y, x + w, y + h, r), ink);
  }
  rring(x, y, w, h, r, t, ink) {
    this.fill(x, y, w, h, (px, py) => inRR(px, py, x, y, x + w, y + h, r) &&
      !inRR(px, py, x + t, y + t, x + w - t, y + h - t, Math.max(0, r - t)), ink);
  }
}
// sprite legend: '#' black, '.' white, ':' 50% checker, '+' light grey,
// '%' dark grey, '~' very light grey; anything else (space) is transparent
const SPR = { '#': B, '.': Wt, ':': INK.chk, '+': INK.lg, '%': INK.dg, '~': INK.vlg };

function inRR(px, py, x0, y0, x1, y1, r) {
  if (px < x0 || px > x1 || py < y0 || py > y1) return false;
  if (r <= 0) return true;
  const cx = Math.min(Math.max(px, x0 + r), x1 - r);
  const cy = Math.min(Math.max(py, y0 + r), y1 - r);
  return (px - cx) ** 2 + (py - cy) ** 2 <= r * r;
}

// Greedy rectangle cover of one ink: horizontal runs, grown downwards.
function rectsOf(R, ink) {
  const { w, h, px } = R;
  const used = new Uint8Array(w * h);
  const out = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const k = y * w + x;
      if (px[k] !== ink || used[k]) continue;
      let x2 = x;
      while (x2 < w && px[y * w + x2] === ink && !used[y * w + x2]) x2++;
      let y2 = y + 1;
      grow: for (; y2 < h; y2++) {
        for (let i = x; i < x2; i++) if (px[y2 * w + i] !== ink || used[y2 * w + i]) break grow;
      }
      for (let j = y; j < y2; j++) for (let i = x; i < x2; i++) used[j * w + i] = 1;
      out.push([x + R.x0, y + R.y0, x2 - x, y2 - y]);
    }
  }
  return out;
}
// rectangles as one path; each starts with a move relative to the last one
function pathOf(rects) {
  let s = '';
  let px = 0, py = 0;
  rects.forEach(([x, y, w, h], i) => {
    const dx = x - px, dy = y - py;
    s += i ? `m${dx}${dy < 0 ? '' : ' '}${dy}` : `M${x} ${y}`;
    s += `h${w}v${h}h${-w}z`;
    px = x; py = y;
  });
  return s;
}

// A raster with no transparent pixels starts from one rectangle of its
// commonest ink (black or white); everything else is drawn over it.
function emit(R) {
  const counts = new Map();
  for (const v of R.px) counts.set(v, (counts.get(v) || 0) + 1);
  let s = '';
  let bg = null;
  if (!counts.has(CLEAR)) {
    bg = (counts.get(B) || 0) > (counts.get(Wt) || 0) ? B : Wt;
    s += `<rect x="${R.x0}" y="${R.y0}" width="${R.w}" height="${R.h}"${bg === Wt ? ' class="w"' : ''}/>`;
  }
  const order = [Wt, ...Object.keys(PAT_OF).map(Number), B];
  for (const ink of order) {
    if (!counts.has(ink) || ink === bg) continue;
    const d = pathOf(rectsOf(R, ink));
    if (ink === B) s += `<path d="${d}"/>`;
    else if (ink === Wt) s += `<path class="w" d="${d}"/>`;
    else s += `<path class="p${PAT_OF[ink]}" d="${d}"/>`;
  }
  return s;
}

// ---------------------------------------------------------------- fonts
// SYS: a bold system face of my own, cap height 8, x-height 6, 2-px stems.
const SYS = {
  A: '..##..|.####.|##..##|##..##|######|##..##|##..##|##..##',
  B: '#####.|##..##|##..##|#####.|##..##|##..##|##..##|#####.',
  C: '.####.|##..##|##....|##....|##....|##....|##..##|.####.',
  D: '####..|##.##.|##..##|##..##|##..##|##..##|##.##.|####..',
  E: '######|##....|##....|#####.|##....|##....|##....|######',
  F: '######|##....|##....|#####.|##....|##....|##....|##....',
  G: '.####.|##..##|##....|##....|##.###|##..##|##..##|.#####',
  H: '##..##|##..##|##..##|######|##..##|##..##|##..##|##..##',
  I: '##|##|##|##|##|##|##|##',
  J: '....##|....##|....##|....##|....##|##..##|##..##|.####.',
  K: '##..##|##.##.|####..|###...|####..|##.##.|##..##|##..##',
  L: '##....|##....|##....|##....|##....|##....|##....|######',
  M: '##...##|###.###|#######|##.#.##|##...##|##...##|##...##|##...##',
  N: '##...##|###..##|####.##|##.####|##..###|##...##|##...##|##...##',
  O: '.####.|##..##|##..##|##..##|##..##|##..##|##..##|.####.',
  P: '#####.|##..##|##..##|##..##|#####.|##....|##....|##....',
  R: '#####.|##..##|##..##|##..##|#####.|##.##.|##..##|##..##',
  S: '.####.|##..##|##....|.####.|....##|....##|##..##|.####.',
  T: '######|..##..|..##..|..##..|..##..|..##..|..##..|..##..',
  U: '##..##|##..##|##..##|##..##|##..##|##..##|##..##|.####.',
  V: '##..##|##..##|##..##|##..##|##..##|.####.|.####.|..##..',
  W: '##...##|##...##|##...##|##.#.##|##.#.##|#######|###.###|.#...#.',
  Y: '##..##|##..##|##..##|.####.|..##..|..##..|..##..|..##..',
  a: '......|......|.####.|....##|.#####|##..##|##..##|.#####',
  b: '##....|##....|#####.|##..##|##..##|##..##|##..##|#####.',
  c: '.....|.....|.####|##...|##...|##...|##...|.####',
  d: '....##|....##|.#####|##..##|##..##|##..##|##..##|.#####',
  e: '......|......|.####.|##..##|######|##....|##....|.####.',
  f: '..###|.##..|####.|.##..|.##..|.##..|.##..|.##..',
  g: '......|......|.#####|##..##|##..##|##..##|##..##|.#####|....##|.####.',
  h: '##....|##....|#####.|##..##|##..##|##..##|##..##|##..##',
  i: '##|..|##|##|##|##|##|##',
  j: '...##|.....|...##|...##|...##|...##|...##|...##|##.##|.###.',
  k: '##....|##....|##..##|##.##.|####..|#####.|##.##.|##..##',
  l: '##|##|##|##|##|##|##|##',
  m: '........|........|#######.|##.##.##|##.##.##|##.##.##|##.##.##|##.##.##',
  n: '......|......|#####.|##..##|##..##|##..##|##..##|##..##',
  o: '......|......|.####.|##..##|##..##|##..##|##..##|.####.',
  p: '......|......|#####.|##..##|##..##|##..##|##..##|#####.|##....|##....',
  q: '......|......|.#####|##..##|##..##|##..##|##..##|.#####|....##|....##',
  r: '.....|.....|##.##|####.|###..|##...|##...|##...',
  s: '......|......|.####.|##....|.####.|....##|....##|#####.',
  t: '.##..|.##..|#####|.##..|.##..|.##..|.##..|..###',
  u: '......|......|##..##|##..##|##..##|##..##|##..##|.#####',
  v: '......|......|##..##|##..##|##..##|##..##|.####.|..##..',
  w: '........|........|##.##.##|##.##.##|##.##.##|##.##.##|##.##.##|.######.',
  x: '......|......|##..##|##..##|.####.|.####.|##..##|##..##',
  y: '......|......|##..##|##..##|##..##|##..##|##..##|.#####|....##|.####.',
  z: '......|......|######|...##.|..##..|.##...|##....|######',
  0: '.####.|##..##|##..##|##..##|##..##|##..##|##..##|.####.',
  1: '..##|.###|####|..##|..##|..##|..##|..##',
  2: '.####.|##..##|....##|...##.|..##..|.##...|##....|######',
  3: '.####.|##..##|....##|..###.|....##|....##|##..##|.####.',
  4: '...##.|..###.|.####.|##.##.|##.##.|######|...##.|...##.',
  5: '######|##....|#####.|....##|....##|....##|##..##|.####.',
  6: '..###.|.##...|##....|#####.|##..##|##..##|##..##|.####.',
  7: '######|....##|...##.|...##.|..##..|..##..|.##...|.##...',
  8: '.####.|##..##|##..##|.####.|##..##|##..##|##..##|.####.',
  9: '.####.|##..##|##..##|##..##|.#####|....##|...##.|.###..',
  '.': '..|..|..|..|..|..|##|##',
  ',': '..|..|..|..|..|..|##|##|.#|#.',
  ':': '..|..|##|##|..|..|##|##',
  '-': '....|....|....|....|####|....|....|....',
  '+': '......|......|..##..|..##..|######|..##..|..##..|......',
  '…': '........|........|........|........|........|........|##.##.##|##.##.##',
  '?': '.####.|##..##|....##|...##.|..##..|..##..|......|..##..',
  '!': '##|##|##|##|##|##|..|##',
  "'": '##|##|#.|..|..|..|..|..',
  '⌘': '.##...##.|#..#.#..#|#..#.#..#|.#######.|...#.#...|.#######.|#..#.#..#|#..#.#..#|.##...##.',
};
// BODY: a small regular face, cap height 7, x-height 5, 1-px stems.
// (The core of this table is carried over from this repo's 03 desktop
// generator; the rest is new.)
const BODY = {
  A: '..#..|.#.#.|.#.#.|#...#|#####|#...#|#...#',
  B: '####.|#...#|#...#|####.|#...#|#...#|####.',
  C: '.###.|#...#|#....|#....|#....|#...#|.###.',
  D: '####.|#...#|#...#|#...#|#...#|#...#|####.',
  E: '####|#...|#...|###.|#...|#...|####',
  F: '####|#...|#...|###.|#...|#...|#...',
  G: '.###.|#...#|#....|#.###|#...#|#...#|.###.',
  H: '#...#|#...#|#...#|#####|#...#|#...#|#...#',
  I: '#|#|#|#|#|#|#',
  J: '...#|...#|...#|...#|...#|#..#|.##.',
  K: '#...#|#..#.|#.#..|##...|#.#..|#..#.|#...#',
  L: '#...|#...|#...|#...|#...|#...|####',
  M: '#...#|##.##|#.#.#|#.#.#|#...#|#...#|#...#',
  N: '#...#|##..#|##..#|#.#.#|#..##|#..##|#...#',
  O: '.###.|#...#|#...#|#...#|#...#|#...#|.###.',
  P: '####.|#...#|#...#|####.|#....|#....|#....',
  Q: '.###.|#...#|#...#|#...#|#.#.#|#..#.|.##.#',
  R: '####.|#...#|#...#|####.|#.#..|#..#.|#...#',
  S: '.###.|#...#|#....|.###.|....#|#...#|.###.',
  T: '#####|..#..|..#..|..#..|..#..|..#..|..#..',
  U: '#...#|#...#|#...#|#...#|#...#|#...#|.###.',
  V: '#...#|#...#|#...#|.#.#.|.#.#.|.#.#.|..#..',
  W: '#...#|#...#|#...#|#.#.#|#.#.#|##.##|#...#',
  X: '#...#|#...#|.#.#.|..#..|.#.#.|#...#|#...#',
  Y: '#...#|#...#|.#.#.|..#..|..#..|..#..|..#..',
  Z: '#####|....#|...#.|..#..|.#...|#....|#####',
  a: '....|....|.##.|...#|.###|#..#|.###',
  b: '#...|#...|###.|#..#|#..#|#..#|###.',
  c: '....|....|.###|#...|#...|#...|.###',
  d: '...#|...#|.###|#..#|#..#|#..#|.###',
  e: '....|....|.##.|#..#|####|#...|.###',
  f: '.##|#..|###|#..|#..|#..|#..',
  g: '....|....|.###|#..#|#..#|#..#|.###|...#|.##.',
  h: '#...|#...|###.|#..#|#..#|#..#|#..#',
  i: '#|.|#|#|#|#|#',
  j: '.#|..|.#|.#|.#|.#|.#|.#|#.',
  k: '#...|#...|#..#|#.#.|##..|#.#.|#..#',
  l: '#|#|#|#|#|#|#',
  m: '.....|.....|####.|#.#.#|#.#.#|#.#.#|#.#.#',
  n: '....|....|###.|#..#|#..#|#..#|#..#',
  o: '....|....|.##.|#..#|#..#|#..#|.##.',
  p: '....|....|###.|#..#|#..#|#..#|###.|#...|#...',
  q: '....|....|.###|#..#|#..#|#..#|.###|...#|...#',
  r: '...|...|#.#|##.|#..|#..|#..',
  s: '....|....|.###|#...|.##.|...#|###.',
  t: '.#.|.#.|###|.#.|.#.|.#.|..#',
  u: '....|....|#..#|#..#|#..#|#..#|.###',
  v: '.....|.....|#...#|#...#|.#.#.|.#.#.|..#..',
  w: '.....|.....|#...#|#.#.#|#.#.#|#.#.#|.#.#.',
  x: '....|....|#..#|#..#|.##.|#..#|#..#',
  y: '....|....|#..#|#..#|#..#|#..#|.###|...#|.##.',
  z: '....|....|####|...#|.##.|#...|####',
  0: '.##.|#..#|#..#|#..#|#..#|#..#|.##.',
  1: '.#.|##.|.#.|.#.|.#.|.#.|###',
  2: '.##.|#..#|...#|..#.|.#..|#...|####',
  3: '.##.|#..#|...#|.##.|...#|#..#|.##.',
  4: '..#.|.##.|#.#.|#.#.|####|..#.|..#.',
  5: '####|#...|###.|...#|...#|#..#|.##.',
  6: '.##.|#...|#...|###.|#..#|#..#|.##.',
  7: '####|...#|..#.|..#.|.#..|.#..|.#..',
  8: '.##.|#..#|#..#|.##.|#..#|#..#|.##.',
  9: '.##.|#..#|#..#|.###|...#|...#|.##.',
  '.': '.|.|.|.|.|.|#',
  ',': '.|.|.|.|.|.|#|#',
  ':': '.|.|#|.|.|.|#',
  '-': '...|...|...|###|...|...|...',
  '+': '...|...|.#.|###|.#.|...|...',
  '/': '...#|...#|..#.|..#.|.#..|.#..|#...',
  '(': '.#|#.|#.|#.|#.|#.|.#',
  ')': '#.|.#|.#|.#|.#|.#|#.',
  "'": '#|#|.|.|.|.|.',
  '!': '#|#|#|#|#|.|#',
  '?': '.##.|#..#|...#|..#.|.#..|....|.#..',
  '·': '.|.|.|#|.|.|.',
  '…': '.....|.....|.....|.....|.....|.....|#.#.#',
  _: '....|....|....|....|....|....|....|####',
};
function makeFont(table, { space, gap = 1 }) {
  const cache = new Map();
  const glyph = (ch) => {
    if (!cache.has(ch)) {
      const src = table[ch];
      if (src === undefined) throw new Error(`no glyph for ${JSON.stringify(ch)}`);
      const rows = src.split('|');
      const w = rows[0].length;
      rows.forEach((r) => { if (r.length !== w) throw new Error(`glyph ${ch} row "${r}" is not ${w} wide`); });
      cache.set(ch, rows);
    }
    return cache.get(ch);
  };
  const adv = (ch) => (ch === ' ' ? space : glyph(ch)[0].length + gap);
  return {
    glyph, adv,
    width: (str) => [...str].reduce((w, ch) => w + adv(ch), 0) - gap,
  };
}
const sys = makeFont(SYS, { space: 4 });
const body = makeFont(BODY, { space: 3 });

// draw text with its cap top at y; returns the advance width
function text(R, font, str, x, y, ink = B) {
  let cx = x;
  for (const ch of str) {
    if (ch !== ' ') {
      font.glyph(ch).forEach((row, j) => [...row].forEach((c, i) => { if (c === '#') R.set(cx + i, y + j, ink); }));
    }
    cx += font.adv(ch);
  }
  return cx - x;
}
const textC = (R, font, str, cx, y, ink) => text(R, font, str, Math.round(cx - font.width(str) / 2), y, ink);
const textR = (R, font, str, rx, y, ink) => text(R, font, str, rx - font.width(str), y, ink);

// ---------------------------------------------------------------- display letters
// "Castaway" in a heavy rounded face built from rounded rectangles, then
// set in the old Shadow style: white letters, a 1-px outline and a 2-px
// shadow down and to the right.
const CAP = 22; // baseline row (cap height 22), x-height 16, descender 6
const XT = 6; // x-height top
const DISP = {
  C: {
    w: 17,
    t: (x, y) => inRR(x, y, 0, 0, 17, 22, 8) && !inRR(x, y, 4, 3, 13, 19, 4) && !(x > 9 && y > 8 && y < 14),
  },
  a: {
    w: 15,
    t: (x, y) => (inRR(x, y, 0, XT, 15, 22, 6) && !inRR(x, y, 4, XT + 3, 11, 19, 2.5)) || (x >= 11 && x <= 15 && y >= XT && y <= 22),
  },
  s: {
    w: 13,
    t: (x, y) => (inRR(x, y, 0, XT, 13, 15.5, 5) && !inRR(x, y, 4, XT + 3, 14, 12.5, 1.5) && y <= 15.5) ||
      (inRR(x, y, 0, 12.5, 13, 22, 5) && !inRR(x, y, -1, 15.5, 9, 19, 1.5)),
  },
  t: {
    w: 11,
    t: (x, y) => (x >= 3 && x <= 7 && y >= 1 && y <= 18) ||
      (inRR(x, y, 3, 10, 12, 22, 5) && !(x > 7 && y < 19)) ||
      (x >= 0 && x <= 11 && y >= XT && y <= XT + 3),
  },
  w: {
    w: 21,
    t: (x, y) => (inRR(x, y, 0, XT, 21, 22, 5) && !(x > 4 && x < 17 && y < 19)) || (x >= 8.5 && x <= 12.5 && y >= XT + 4 && y <= 20),
  },
  y: {
    w: 15,
    t: (x, y) => (inRR(x, y, 0, XT, 15, 22, 5) && !(x > 4 && x < 11 && y < 19)) || (x >= 11 && x <= 15 && y >= XT && y <= 25) ||
      (inRR(x, y, 1, 19, 15, 28.5, 4) && !(x < 11 && y < 25.5)),
  },
};
function displayMask(word, gap, S = 1) {
  const ws = [...word].map((ch) => Math.round(DISP[ch].w * S));
  const total = ws.reduce((a, b) => a + b, 0) + gap * (word.length - 1);
  const h = Math.ceil(29 * S);
  const m = Array.from({ length: h }, () => new Array(total).fill(false));
  let ox = 0;
  [...word].forEach((ch, k) => {
    const g = DISP[ch];
    for (let y = 0; y < h; y++) for (let x = 0; x < ws[k]; x++) if (g.t((x + 0.5) / S, (y + 0.5) / S)) m[y][ox + x] = true;
    ox += ws[k] + gap;
  });
  return m;
}
// Shadow style: returns { white: mask, black: mask } with a 1-px border and 2-px shadow
function shadowStyle(m) {
  const h = m.length, w = m[0].length;
  const P = 1, S = 2;
  const H2 = h + P * 2 + S, W2 = w + P * 2 + S;
  const at = (x, y) => y >= 0 && y < h && x >= 0 && x < w && m[y][x];
  const white = [], black = [];
  for (let y = 0; y < H2; y++) {
    white.push([]); black.push([]);
    for (let x = 0; x < W2; x++) {
      const gx = x - P, gy = y - P;
      const inside = at(gx, gy);
      let near = false;
      for (let s = 0; s <= S && !near; s++) {
        for (let dy = -1; dy <= 1 && !near; dy++) for (let dx = -1; dx <= 1 && !near; dx++) if (at(gx - s + dx, gy - s + dy)) near = true;
      }
      white[y].push(inside);
      black[y].push(!inside && near);
    }
  }
  return { white, black, w: W2, h: H2 };
}

// ---------------------------------------------------------------- CSS timeline helpers
const css = [];
let kc = 0;
const pct = (t, dur = T) => `${+((t / dur) * 100).toFixed(3)}%`;
// visible during the union of [a, b) intervals (seconds into the loop)
function vis(intervals) {
  const name = `v${(kc++).toString(36)}`;
  const on = (t) => intervals.some(([a, b]) => t >= a && t < b);
  const pts = [...new Set([0, ...intervals.flat()])].filter((t) => t >= 0 && t < T).sort((a, b) => a - b);
  let s = `@keyframes ${name}{`;
  for (const t of pts) s += `${pct(t)}{opacity:${on(t) ? 1 : 0}}`;
  s += `100%{opacity:${on(T - 1e-6) ? 1 : 0}}}`;
  css.push(s, `.${name}{animation-name:${name}}`);
  return `class="a ${name}"`;
}
// a short loop of n frames, each shown 1/n of the period
function frames(period, n) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const name = `f${(kc++).toString(36)}`;
    const a = (i / n) * 100, b = ((i + 1) / n) * 100;
    let s = `@keyframes ${name}{0%{opacity:${i === 0 ? 1 : 0}}`;
    if (i > 0) s += `${+a.toFixed(3)}%{opacity:1}`;
    if (b < 100) s += `${+b.toFixed(3)}%{opacity:0}`;
    s += `100%{opacity:${i === n - 1 ? 1 : 0}}}`;
    css.push(s, `.${name}{animation:${name} ${period}s step-end infinite}`);
    out.push(`class="${name}"`);
  }
  return out;
}


// ---------------------------------------------------------------- layout
const MBH = 14; // menu bar: white rows 0..13, black line on row 14
const WIN = { x: 8, y: 21, w: 284, h: 196 }; // the "Castaway" window (outer frame)
const TB = 19; // title bar rows, top border to bottom line inclusive
const HDR = 16; // header strip under the title bar (text, line, gap, line)
const SB = 16; // scroll bar width, sharing the window's right border
const SCN = { x: WIN.x + 1, y: WIN.y + TB + HDR, w: WIN.w - SB - 1, h: WIN.h - TB - HDR - 1 };
const sx = (v) => SCN.x + v; // scene-local to screen
const sy = (v) => SCN.y + v;
const HZ = sy(74); // horizon row
const DLG = { x: 118, y: 210, w: 238, h: 64 }; // the modal dialog

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------- window chrome
function windowFrame(R, { x, y, w, h, title }) {
  R.rect(x, y, w, h, Wt);
  R.frame(x, y, w, h);
  R.hline(x + 1, y + h, w); // hard shadow, bottom
  R.vline(x + w, y + 1, h); // hard shadow, right
  R.hline(x, y + TB - 1, w);
  for (let k = 0; k < 6; k++) R.hline(x + 2, y + 4 + k * 2, w - 4); // pinstripes
  R.rect(x + 7, y + 3, 13, 13, Wt); // close box, with a clearing round it
  R.frame(x + 8, y + 4, 11, 11);
  R.rect(x + w - 20, y + 3, 13, 13, Wt); // zoom box
  R.frame(x + w - 19, y + 4, 11, 11);
  R.frame(x + w - 19, y + 4, 7, 7);
  const tw = sys.width(title);
  const tx = Math.round(x + w / 2 - tw / 2);
  R.rect(tx - 7, y + 2, tw + 14, TB - 4, Wt);
  text(R, sys, title, tx, y + 5);
}
const ARROW_UP = [
  '.....#.....',
  '....#.#....',
  '...#...#...',
  '..#.....#..',
  '.#.......#.',
  '####...####',
  '...#...#...',
  '...#...#...',
  '...#####...',
];
function vScrollBar(R, x, y, h) {
  R.rect(x, y, SB, h, INK.chk);
  R.vline(x, y, h);
  R.vline(x + SB - 1, y, h);
  const box = (by) => { R.rect(x + 1, by + 1, SB - 2, SB - 2, Wt); R.hline(x, by, SB); R.hline(x, by + SB - 1, SB); };
  box(y);
  R.sprite(ARROW_UP, x + 3, y + 3, { '#': B });
  const g = y + h - SB; // grow box
  const dn = g - SB + 1;
  box(dn);
  R.sprite([...ARROW_UP].reverse(), x + 3, dn + 4, { '#': B });
  box(y + SB + 6); // thumb, near the top: it is early in a ten-hour video
  box(g);
  R.frame(x + 3, g + 3, 6, 6);
  R.rect(x + 5, g + 5, 8, 8, Wt);
  R.frame(x + 5, g + 5, 8, 8);
}

// ---------------------------------------------------------------- icons (32x32, my own)
function docPage(R, x, y) {
  R.poly([[x + 5, y + 1], [x + 20, y + 1], [x + 27, y + 8], [x + 27, y + 31], [x + 5, y + 31]], Wt);
  R.hline(x + 5, y + 1, 15);
  R.line(x + 20, y + 1, x + 26, y + 7);
  R.vline(x + 26, y + 8, 23);
  R.hline(x + 5, y + 30, 22);
  R.vline(x + 5, y + 1, 30);
  R.vline(x + 20, y + 1, 7);
  R.hline(x + 20, y + 7, 7);
}
const ICONS = {
  floppy(R, x, y) {
    R.poly([[x + 2, y + 2], [x + 27, y + 2], [x + 30, y + 5], [x + 30, y + 30], [x + 2, y + 30]], Wt);
    R.hline(x + 2, y + 2, 25); R.line(x + 27, y + 2, x + 29, y + 4); R.vline(x + 29, y + 5, 25);
    R.hline(x + 2, y + 29, 28); R.vline(x + 2, y + 2, 28);
    R.rect(x + 9, y + 3, 13, 9, INK.lg); R.frame(x + 8, y + 2, 15, 11); R.rect(x + 17, y + 4, 3, 7, B);
    R.frame(x + 6, y + 16, 20, 14); R.rect(x + 7, y + 17, 18, 12, Wt);
    R.sprite(['##.##', '#####', '..#..', '..#..', '..#..', '#####'], x + 9, y + 19, { '#': B });
    R.hline(x + 16, y + 21, 7); R.hline(x + 16, y + 24, 5);
    R.rect(x + 4, y + 26, 2, 2, B);
  },
  musing(R, x, y) {
    docPage(R, x, y);
    [[4, 6], [9], [3, 5, 4], [7, 4], [10], [2, 8], [6]].forEach((ws, i) => {
      let cx = x + 8;
      ws.forEach((w) => { R.hline(cx, y + 11 + i * 3, w); cx += w + 2; });
    });
  },
  toml(R, x, y) {
    docPage(R, x, y);
    for (let i = 0; i < 5; i++) {
      const yy = y + 10 + i * 4;
      R.frame(x + 8, yy, 3, 3);
      if (i < 3) R.set(x + 9, yy + 1, B);
      R.hline(x + 13, yy + 1, [9, 6, 8, 5, 7][i]);
    }
  },
  audio(R, x, y) {
    docPage(R, x, y);
    R.rect(x + 13, y + 10, 8, 2, B);
    R.vline(x + 13, y + 10, 9); R.vline(x + 20, y + 10, 9);
    R.ellipse(x + 11.5, y + 19.5, 2.2, 1.6, B); R.ellipse(x + 18.5, y + 19.5, 2.2, 1.6, B);
    let prev = null;
    for (let i = 0; i <= 16; i++) {
      const p = [x + 8 + i, y + 26 - Math.round(Math.sin((i / 16) * Math.PI * 2) * 2)];
      if (prev) R.line(...prev, ...p);
      prev = p;
    }
  },
  app(R, x, y) {
    R.rect(x + 3, y + 5, 26, 22, Wt);
    R.frame(x + 3, y + 5, 26, 22);
    R.hline(x + 4, y + 27, 26); R.vline(x + 29, y + 6, 22);
    R.hline(x + 3, y + 10, 26);
    for (let k = 0; k < 2; k++) R.hline(x + 5, y + 6 + k * 2, 22);
    R.rect(x + 13, y + 6, 6, 4, Wt);
    R.poly([[x + 12, y + 13], [x + 21, y + 18.5], [x + 12, y + 24]], B);
  },
  trash(R, x, y) {
    R.poly([[x + 8, y + 13], [x + 24, y + 13], [x + 23, y + 31], [x + 9, y + 31]], Wt);
    R.line(x + 8, y + 13, x + 9, y + 30); R.line(x + 24, y + 13, x + 23, y + 30);
    R.hline(x + 9, y + 30, 15);
    for (const rx of [12, 16, 20]) R.vline(x + rx, y + 16, 12);
    // what the tide took: a sandcastle with a flag, under a lid that no longer shuts
    R.rect(x + 10, y + 8, 12, 6, INK.lg);
    R.frame(x + 10, y + 8, 12, 6);
    R.rect(x + 10, y + 6, 3, 2, B); R.rect(x + 15, y + 6, 2, 2, B); R.rect(x + 19, y + 6, 3, 2, B);
    R.vline(x + 16, y + 1, 5);
    R.sprite(['####', '###', '##'], x + 17, y + 1, { '#': B });
    R.poly([[x + 4.5, y + 13], [x + 25, y + 9], [x + 26, y + 12], [x + 5.5, y + 16]], Wt);
    R.line(x + 5, y + 13, x + 25, y + 9); R.line(x + 6, y + 16, x + 26, y + 12);
    R.line(x + 5, y + 13, x + 6, y + 16); R.line(x + 25, y + 9, x + 26, y + 12);
  },
};
function icon(R, kind, cx, y, label, { selected = false } = {}) {
  const x = cx - 16;
  const L = new Raster(32, 32, x, y);
  ICONS[kind](L, x, y);
  for (let j = 0; j < 32; j++) for (let i = 0; i < 32; i++) {
    let v = L.get(x + i, y + j);
    if (v === CLEAR) continue;
    if (selected) v = v === B ? Wt : v === Wt ? B : v;
    R.set(x + i, y + j, v);
  }
  if (!label) return;
  const lw = body.width(label);
  const lx = Math.round(cx - lw / 2);
  R.rect(lx - 2, y + 33, lw + 4, 11, selected ? B : Wt);
  text(R, body, label, lx, y + 35, selected ? Wt : B);
}

// ---------------------------------------------------------------- the menu bar
const PALM_GLYPH = [
  '..###...##..',
  '.#####.####.',
  '##...###..##',
  '#...#.##...#',
  '...#..##....',
  '......##....',
  '.......##...',
  '.......##...',
  '......##....',
  '..########..',
  '.##########.',
];
const WATCH_SMALL = [
  '..###..',
  '..###..',
  '.#...#.',
  '#..#..#',
  '#..#..#',
  '#...#.#',
  '.#...#.',
  '..###..',
  '..###..',
];
const MENUS = ['Island', 'Gags', 'Schedule', 'Sound', 'Run'];
const menuX = {};
function menuBar(R) {
  R.rect(0, 0, W, MBH, Wt);
  R.hline(0, MBH, W);
  R.sprite(PALM_GLYPH, 14, 2, { '#': B });
  let x = 40;
  for (const m of MENUS) {
    menuX[m] = x;
    x += text(R, sys, m, x, 3) + 14;
  }
  const clock = '10:00:00';
  const cw = sys.width(clock);
  textR(R, sys, clock, W - 14, 3);
  R.sprite(WATCH_SMALL, W - 14 - cw - 13, 2, { '#': B, '.': Wt });
}

// ---------------------------------------------------------------- the painting
const ISL = { cx: sx(148), cy: sy(130), rx: 94, ry: 17 };
const onIsland = (px, py, pad = 0) => ((px - ISL.cx) / (ISL.rx + pad)) ** 2 + ((py - ISL.cy) / (ISL.ry + pad * 0.55)) ** 2 <= 1;
const PALM = { base: [sx(192), sy(124)], ctrl: [sx(178), sy(80)], top: [sx(215), sy(42)] };
const RAFT = { x: sx(226), y: sy(128) };
const HER = { x: sx(118), y: sy(100) }; // sprite top-left
const qb = (p0, p1, p2, t) => [(1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0], (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1]];

function sky(R) {
  R.rect(SCN.x, SCN.y, SCN.w, HZ - SCN.y, Wt);
  R.rect(SCN.x, SCN.y, SCN.w, 5, INK.lg);
  R.rect(SCN.x, SCN.y + 5, SCN.w, 8, INK.vlg);
  R.rect(SCN.x, SCN.y + 13, SCN.w, 12, INK.dot);
}
function sun(R, cx, cy) {
  R.ellipse(cx, cy, 9.5, 9.5, B);
  R.ellipse(cx, cy, 8.5, 8.5, Wt);
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2 + 0.13;
    const r2 = k % 2 ? 14 : 16;
    R.line(cx + Math.cos(a) * 12, cy + Math.sin(a) * 12, cx + Math.cos(a) * r2, cy + Math.sin(a) * r2);
  }
}
function cloud(R, x, y, puffs) {
  // puffs: [dx, dy, r]; a flat-bottomed cumulus with a shaded belly
  const inside = (px, py) => py <= y + 1 && puffs.some(([dx, dy, r]) => (px - x - dx) ** 2 + (py - y - dy) ** 2 <= r * r);
  const x1 = Math.max(...puffs.map(([dx, , r]) => dx + r));
  for (let j = y - 24; j <= y; j++) for (let i = x - 8; i <= x + x1 + 2; i++) {
    const cx = i + 0.5, cy = j + 0.5;
    if (!inside(cx, cy)) continue;
    const edge = !inside(cx - 1, cy) || !inside(cx + 1, cy) || !inside(cx, cy - 1) || j === y;
    R.set(i, j, edge ? B : j >= y - 2 ? INK.lg : Wt);
  }
}
// the sea: engraved dashes, closer together towards the horizon; two frames
function seaLines(R, phase) {
  const bottom = SCN.y + SCN.h;
  const prng = mulberry32(1992);
  R.rect(SCN.x, HZ + 1, SCN.w, bottom - HZ - 1, Wt);
  R.hline(SCN.x, HZ, SCN.w);
  let y = HZ + 2;
  while (y < bottom) {
    const d = (y - HZ) / (bottom - HZ);
    let x = SCN.x - Math.floor(prng() * 12);
    const shift = phase ? (y % 2 ? 2 : -2) : 0;
    while (x < SCN.x + SCN.w) {
      const len = 2 + Math.floor(prng() * (2 + d * 9));
      const gap = 1 + Math.floor(prng() * (2 + d * 18)) + Math.round(d * 10);
      for (let i = 0; i < len; i++) {
        const px = x + i + shift;
        if (!onIsland(px + 0.5, y + 0.5, 6)) R.set(px, y, B);
      }
      x += len + gap;
    }
    y += 2 + Math.floor(d * 4.5);
  }
  // foam round the island, broken differently in each frame
  const { cx, cy, rx, ry } = ISL;
  for (let a = 0; a < Math.PI * 2; a += 0.02) {
    const on = Math.sin(a * 11 + (phase ? 1.6 : 0)) > -0.1;
    const px = Math.round(cx + Math.cos(a) * (rx + 6)), py = Math.round(cy + 1 + Math.sin(a) * (ry + 4));
    R.set(px, py, on ? B : Wt);
  }
}
function island(R) {
  const { cx, cy, rx, ry } = ISL;
  R.ellipse(cx, cy + 1, rx + 5, ry + 3.4, Wt); // foam
  R.ellipse(cx, cy, rx, ry, B);
  R.ellipse(cx, cy, rx - 1, ry - 1, INK.sand);
  // wet sand along the front edge
  R.fill(cx - rx, cy, rx * 2, ry + 1, (px, py) => ((px - cx) / (rx - 1)) ** 2 + ((py - cy) / (ry - 1)) ** 2 <= 1 &&
    ((px - cx) / (rx - 5)) ** 2 + ((py - cy + 2) / (ry - 3)) ** 2 > 1 && py > cy, INK.vlg);
}
function bush(R, x, y, s, seed) {
  const prng = mulberry32(seed);
  for (let i = 0; i < 11 * s; i++) {
    const a = prng() * Math.PI, d = prng() * 5 * s;
    R.ellipse(x + Math.cos(a) * d * 1.5, y - Math.sin(a) * d * 0.8, 2.2 + prng() * 1.6, 1.8 + prng(), B);
  }
  for (let i = 0; i < 7 * s; i++) R.set(Math.round(x - 6 * s + prng() * 12 * s), Math.round(y - 1 - prng() * 4 * s), Wt);
}
function rock(R, x, y, rx, ry) {
  R.ellipse(x, y, rx, ry, B);
  R.ellipse(x - 0.5, y - 0.5, rx - 1, ry - 1, Wt);
  R.fill(Math.floor(x - rx), Math.floor(y), Math.ceil(rx * 2), Math.ceil(ry), (px, py) => ((px - x) / (rx - 1)) ** 2 + ((py - y) / (ry - 1)) ** 2 <= 1 && py > y + 0.5, INK.chk);
}
function trunk(R) {
  const { base, ctrl, top } = PALM;
  const rows = new Map();
  for (let t = 0; t <= 1; t += 0.002) {
    const [px, py] = qb(base, ctrl, top, t);
    const y = Math.round(py);
    if (!rows.has(y)) rows.set(y, [px, 3.6 - t * 1.5]);
  }
  for (const [y, [px, half]] of rows) {
    const l = Math.round(px - half), r = Math.round(px + half);
    for (let x = l; x <= r; x++) R.set(x, y, x === l || x === r ? B : x === l + 1 ? INK.chk : Wt);
    // ring scars: short chevrons, one side then the other
    const seg = (base[1] - y) % 4;
    if (seg === 0) for (let x = l + 1; x <= Math.round(px); x++) R.set(x, y, B);
    if (seg === 1) for (let x = Math.round(px); x < r; x++) R.set(x, y, B);
  }
  R.hline(Math.round(base[0]) - 5, base[1] + 1, 11);
  R.set(Math.round(base[0]) - 4, base[1], B); R.set(Math.round(base[0]) + 4, base[1], B);
}
function frond(R, p0, p1, p2, maxW) {
  const n = 56;
  const L = [], Rr = [], spine = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const [x, y] = qb(p0, p1, p2, t);
    const [x2, y2] = qb(p0, p1, p2, Math.min(1, t + 0.01));
    const [x1, y1] = qb(p0, p1, p2, Math.max(0, t - 0.01));
    let tx = x2 - x1, ty = y2 - y1;
    const len = Math.hypot(tx, ty) || 1; tx /= len; ty /= len;
    const w = maxW * Math.sin(Math.PI * (0.12 + t * 0.88)) ** 0.6;
    L.push([x - ty * w, y + tx * w]); Rr.push([x + ty * w, y - tx * w]);
    spine.push([x, y, tx, ty, w]);
  }
  R.poly([...L, ...Rr.reverse()], B);
  // notches along both edges: short white cuts angled back to the stem
  for (let i = 6; i < n - 3; i += 3) {
    const [x, y, tx, ty, w] = spine[i];
    for (const side of [1, -1]) {
      const nx = -ty * side, ny = tx * side;
      const ox = x + nx * (w + 0.5), oy = y + ny * (w + 0.5);
      R.line(ox, oy, ox - nx * 2.4 - tx * 2.2, oy - ny * 2.4 - ty * 2.2, Wt);
    }
  }
  for (let i = 4; i < n - 6; i++) R.set(Math.round(spine[i][0]), Math.round(spine[i][1]), Wt); // midrib
}
const COCONUTS = [[-4, 4], [2, 5], [-1, 8]];
const FALLING = 1; // the coconut that drops on the crab
function crown(R) {
  const [cx, cy] = PALM.top;
  const F = [
    [[-3, -2], [-24, -14], [-36, 10]],
    [[-2, -3], [-17, -24], [-33, -19]],
    [[0, -3], [-4, -26], [-20, -32]],
    [[1, -3], [12, -28], [27, -27]],
    [[2, -2], [26, -18], [46, -4]],
    [[2, 0], [30, 0], [44, 22]],
    [[-2, 0], [-22, 4], [-30, 26]],
    [[1, 1], [10, 12], [14, 30]],
  ];
  for (const [a, b, c] of F) frond(R, [cx + a[0], cy + a[1]], [cx + b[0], cy + b[1]], [cx + c[0], cy + c[1]], 4.6);
  COCONUTS.forEach(([dx, dy], i) => { if (i !== FALLING) nut(R, cx + dx, cy + dy, 3); });
}
function nut(R, x, y, r) {
  R.ellipse(x, y, r, r, B);
  R.ellipse(x, y, r - 1, r - 1, INK.dg);
  R.set(Math.round(x - 1), Math.round(y - 1), Wt);
}
function raft(R, x, y) {
  for (let i = 0; i < 4; i++) {
    const ly = y + i * 4, lx = x + (3 - i) * 2;
    R.rrect(lx, ly, 36, 5, 2, B);
    R.rect(lx + 1, ly + 1, 34, 3, INK.lg);
    R.hline(lx + 2, ly + 1, 31, Wt);
  }
  for (const rx of [7, 26]) { R.vline(x + rx, y, 16, B); R.vline(x + rx + 1, y + 1, 14, Wt); R.vline(x + rx + 2, y, 16, B); }
}

// Fill a shape given by test(x, y) on pixel centres, with a black outline.
function blob(R, x0, y0, w, h, test, fill = Wt) {
  const inside = (x, y) => test(x + 0.5, y + 0.5);
  for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) {
    if (!inside(x, y)) continue;
    const edge = !inside(x - 1, y) || !inside(x + 1, y) || !inside(x, y - 1) || !inside(x, y + 1);
    R.set(x, y, edge ? B : typeof fill === 'function' ? fill(x, y) : fill);
  }
}
// a sprite as its own small raster, so it can be shown and hidden; it gets
// a 1-px white knockout round its edge so it stands clear of the sea's dashes
function sprite(w, h, x, y, draw, halo = true) {
  const R = new Raster(w + 2, h + 2, x - 1, y - 1);
  draw(R, x, y);
  if (halo) {
    const ring = [];
    for (let j = R.y0; j < R.y0 + R.h; j++) for (let i = R.x0; i < R.x0 + R.w; i++) {
      if (R.get(i, j) !== CLEAR) continue;
      let near = false;
      for (let dy = -1; dy <= 1 && !near; dy++) for (let dx = -1; dx <= 1 && !near; dx++) {
        const v = R.get(i + dx, j + dy);
        if (v !== CLEAR) near = true;
      }
      if (near) ring.push([i, j]);
    }
    for (const [i, j] of ring) R.set(i, j, Wt);
  }
  return R;
}

// ---------------------------------------------------------------- her (my own, front view, sitting)
// Brown hair is the dark dither, the coral top the checker; skin, the cream
// headphones and the cream shorts are white with a black outline.
const HER_UP = [
  '         #######         ',
  '       ##.......##       ',
  '      #..#######..#      ',
  '     #.##%%%%%%%##.#     ',
  '    #.#%%%%%%%%%%%#.#    ',
  '    #.#%%%%%%%%%%%#.#    ',
  '   ###%%%%%%%%%%%%%###   ',
  '  #...#%%%%%%%%%%%#...#  ',
  '  #...#%%%.....%%%#...#  ',
  '  #.#.#%%.......%%#.#.#  ',
  '  #.#.#%..#...#..%#.#.#  ',
  '  #.#.#%..#...#..%#.#.#  ',
  '  #...#%.........%#...#  ',
  '  #...#%%...##..%%#...#  ',
  '   ###%%%%.....%%%%###   ',
  ' ##%%#%%%%#####%%%%#     ',
  '#%%%%#   #.....#         ',
  '#%%%%#  ##.....##        ',
  ' ####  #..::...::..#     ',
  '      #..#:::::::#..#    ',
  '      #.#:::::::::#.#    ',
  '      #.#:::::::::#.#    ',
  '      #.#:::::::::#.#    ',
  '      #.##:::::::##.#    ',
  '      #.#.........#.#    ',
  '     #..##.......##..#   ',
  '    #....#########....#  ',
  '   #.......#...#.......# ',
  '  #......##.....##......#',
  '  #....##.........##....#',
  '   ####             #### ',
];
// the nod: the head comes down a pixel and the neck shortens
const HER_DOWN = ['                         ', ...HER_UP.slice(0, 16), ...HER_UP.slice(17)];
// eyes closed, for the moment the bottle comes home
const HER_LOOK = HER_DOWN.map((r, i) => (i === 11 ? '  #.#.#%.........%#.#.#  ' : i === 12 ? '  #.#.#%..#...#..%#.#.#  ' : r));
// the throw: her right arm up beside her head, a bottle in her hand
function throwPose(R, x, y) {
  const rows = HER_UP.map((r, i) => {
    const fix = {
      18: ' ####  #..::...::.#      ',
      19: '      #..#:::::::##      ',
      20: '      #.#:::::::::#      ',
      21: '      #.#:::::::::#      ',
      22: '      #.#:::::::::#      ',
      23: '      #.##:::::::##      ',
      24: '      #.#.........#      ',
      25: '     #..##.......##      ',
    };
    return fix[i] ?? r;
  });
  R.sprite(rows, x, y);
  // the arm, a white band with an outline, from the shoulder to above the head
  blob(R, x + 15, y - 2, 12, 23, (px, py) => {
    const ax = x + 17.5, ay = y + 19, bx = x + 23.5, by = y + 2;
    const t = Math.max(0, Math.min(1, ((px - ax) * (bx - ax) + (py - ay) * (by - ay)) / ((bx - ax) ** 2 + (by - ay) ** 2)));
    return Math.hypot(px - (ax + t * (bx - ax)), py - (ay + t * (by - ay))) <= 1.9;
  });
  bottle(R, x + 21, y - 10, 0);
}
// a bottle with a rolled note in it: angle 0 is upright
function bottle(R, x, y, ang) {
  const c = Math.cos(ang), s = Math.sin(ang);
  // local frame: u across, v down the bottle; body 5 wide, neck 3, 12 long
  blob(R, x - 4, y - 4, 16, 16, (px, py) => {
    const dx = px - (x + 3.5), dy = py - (y + 6);
    const u = dx * c + dy * s, v = -dx * s + dy * c;
    return (Math.abs(u) <= 2.6 && v >= -1.5 && v <= 6.5) || (Math.abs(u) <= 1.4 && v >= -6 && v < -1.5);
  }, (px, py) => {
    const dx = px + 0.5 - (x + 3.5), dy = py + 0.5 - (y + 6);
    const u = dx * c + dy * s, v = -dx * s + dy * c;
    if (v < -4.6) return B; // the cork
    if (Math.abs(u) < 0.8 && v > 0 && v < 5) return INK.chk; // the note
    return Wt;
  });
}

// her portrait for the dialog: eyes closed while nothing happens, open when
// something does. Same hair, headphones and top as the little figure.
const FACE_CLOSED = [
  '           ##########           ',
  '         ##..........##         ',
  '        #..##########..#        ',
  '       #..#%%%%%%%%%%#..#       ',
  '      #..#%%%%%%%%%%%%#..#      ',
  '      #.#%%%%%%%%%%%%%%#.#      ',
  '     #.#%%%%%%%%%%%%%%%%#.#     ',
  '     #.#%%%%%%%%%%%%%%%%#.#     ',
  '    ####%%%%%%%%%%%%%%%%####    ',
  '   #....#%%%%%%%%%%%%%%#....#   ',
  '   #....#%%%%%....%%%%%#....#   ',
  '   #.##.#%%%%........%%#.##.#   ',
  '   #.##.#%%%..........%#.##.#   ',
  '   #.##.#%%...........%#.##.#   ',
  '   #.##.#%...........%%#.##.#   ',
  '   #.##.#%.###....###.%#.##.#   ',
  '   #....#%#...#..#...#%#....#   ',
  '   #....#%............%#....#   ',
  '    ####%%.....##.....%%####    ',
  '      ##%%%..#....#..%%##       ',
  '   ###  ##%#..####..#%##        ',
  '  #%%%#   ##........##          ',
  ' #%%%%%#   #........#           ',
  ' #%%%%%#  ##........##          ',
  '  #%%%#  #............#         ',
  '   ###  #..::......::..#        ',
  '      #....::......::....#      ',
  '     #.....::::::::::.....#     ',
  '    #......::::::::::......#    ',
  '    #.....#::::::::::#.....#    ',
  '    #.....#::::::::::#.....#    ',
  '    #######::::::::::#######    ',
];
const FACE_OPEN_ROWS = [
  '   #.##.#%..##....##.%%#.##.#   ',
  '   #.##.#%..##....##..%#.##.#   ',
  '   #....#%..#.....#...%#....#   ',
  '   #....#%............%#....#   ',
  '    ####%%.....##.....%%####    ',
  '      ##%%%...#..#...%%##       ',
  '   ###  ##%#...##...#%##        ',
];
const FACE_OPEN = FACE_CLOSED.map((r, i) => (i >= 14 && i <= 20 ? FACE_OPEN_ROWS[i - 14] : r));
const faceNod = (rows) => ['', ...rows.slice(0, 21), ...rows.slice(22)].map((r) => r.padEnd(32));

// ---------------------------------------------------------------- the gags' props (my own)
function splash(R, x, y) {
  R.sprite([
    ' #    #    # ',
    '  #  .#.  #  ',
    '#  #.....#  #',
    '  #.......#  ',
    ' #.........# ',
    '###.......###',
  ], x, y);
}
function fin(R, x, y) {
  blob(R, x, y, 12, 10, (px, py) => py <= y + 9 && px >= x + 1 + (y + 9 - py) * 0.2 && px <= x + 10 - (y + 9 - py) * 0.95 + (py - y) * 0.1 && py >= y + 1, INK.chk);
  R.sprite(['#..##..##..#'], x - 1, y + 9);
}
// the shark surfaces facing her, cream headphones on, nodding on the beat.
// (x, wl) is the tail end at the waterline; it is 44 wide and 24 tall.
function shark(R, x, wl, down) {
  const oy = down ? 1 : 0;
  const top = (u) => (u <= 30 ? 14 * Math.sin((u / 30) * Math.PI / 2) ** 0.8 : 5 + 9 * Math.sqrt(Math.max(0, 1 - ((u - 30) / 12.5) ** 2)));
  const U = (px) => px + 0.5 - x, Hh = (py) => wl + oy - (py + 0.5); // pixel to (u, h)
  // dorsal fin: a hooked triangle on the back
  blob(R, x + 4, wl - 26 + oy, 20, 22, (px, py) => {
    const u = px - x, h = wl + oy - py;
    return h >= 5 && h <= 21 && u >= 6 + (h - 5) * 0.2 && u <= 22 - (h - 5) * 0.75 - ((h - 5) / 16) ** 2 * 2;
  }, INK.chk);
  // the head and back, out of the water
  blob(R, x - 1, wl - 16 + oy, 46, 17, (px, py) => {
    const u = px - x, h = wl + oy - py;
    return u >= 0 && u <= 42.5 && h >= -0.5 + oy && h <= top(u);
  }, (px, py) => (Hh(py) < 4.5 && U(px) > 24 ? Wt : INK.chk));
  // headphones: the band rides high over its head, the near cup sits behind the eye
  blob(R, x + 20, wl + oy - 21, 18, 12, (px, py) => {
    const r = Math.hypot((px - (x + 29)) / 1.1, py - (wl + oy - 12));
    return py <= wl + oy - 11 && r <= 5.6 && r >= 3.6;
  }, Wt);
  blob(R, x + 19, wl + oy - 14, 11, 11, (px, py) => Math.hypot(px - (x + 24.5), py - (wl + oy - 8)) <= 4.5,
    (px, py) => (Math.hypot(px + 0.5 - (x + 24.5), py + 0.5 - (wl + oy - 8)) < 2 ? INK.dg : Wt));
  // eye, with a glint, and a big easy grin
  R.rect(x + 36, wl + oy - 9, 2, 3, B); R.set(x + 36, wl + oy - 9, Wt); R.set(x + 38, wl + oy - 8, B);
  R.line(x + 32, wl + oy - 4, x + 37, wl + oy - 2);
  R.line(x + 37, wl + oy - 2, x + 42, wl + oy - 5);
  // the waterline, which does not nod
  R.rect(x - 2, wl + 1, 48, 2, Wt);
  R.sprite(['##..###..####..###..####..###..####..###..###'], x - 2, wl + 1);
}
function crab(R, x, y, step) {
  // a hermit crab in a spiral shell, walking left
  blob(R, x + 4, y, 12, 10, (px, py) => ((px - (x + 9.5)) / 5.2) ** 2 + ((py - (y + 5)) / 4.6) ** 2 <= 1, Wt);
  R.line(x + 9, y + 5, x + 11, y + 4); R.line(x + 11, y + 4, x + 12, y + 6); R.line(x + 12, y + 6, x + 9, y + 8); R.line(x + 9, y + 8, x + 7, y + 5);
  R.rect(x + 1, y + 6, 5, 3, B); R.rect(x + 2, y + 7, 3, 1, INK.chk); // body
  R.vline(x + 2, y + 3, 3); R.vline(x + 4, y + 3, 3); R.set(x + 2, y + 2, B); R.set(x + 4, y + 2, B); // eyes on stalks
  R.sprite(['##.', '#.#', '##.'], x - 2, y + 5); // claw
  R.sprite(step ? ['# # # #'] : [' # # # #'], x + 1, y + 10);
}
function nutCrab(R, x, y, step) {
  // the same crab, now wearing the coconut
  nut(R, x + 9, y + 6, 6.2);
  R.ellipse(x + 7, y + 3, 1.6, 1.2, Wt);
  R.vline(x + 1, y + 6, 4); R.vline(x + 3, y + 6, 4); R.set(x + 1, y + 5, B); R.set(x + 3, y + 5, B);
  R.sprite(['##.', '#.#', '##.'], x - 2, y + 9);
  R.sprite(step ? ['# # # # #'] : [' # # # # #'], x + 3, y + 13);
}
function bonk(R, x, y) {
  R.sprite([
    '#   #   #',
    ' #  #  # ',
    '  #   #  ',
    '##     ##',
  ], x, y);
}

// ---------------------------------------------------------------- the static screen
const base = new Raster(W, H);
base.rect(0, 0, W, H, INK.chk); // the desktop: the oldest grey there is
menuBar(base);
windowFrame(base, { ...WIN, title: 'Castaway' });
{
  // header strip, Finder style: the facts
  const y = WIN.y + TB;
  const items = ['90+ activities', 'all sound synthesized', '10 hours a run'];
  const ws = items.map((s) => body.width(s));
  const gap = (WIN.w - 24 - ws.reduce((a, b) => a + b, 0)) / (items.length - 1);
  if (gap < 10) throw new Error(`header strip too long (gap ${gap})`);
  let x = WIN.x + 12;
  items.forEach((s, i) => { text(base, body, s, Math.round(x), y + 3); x += ws[i] + gap; });
  base.hline(WIN.x, y + HDR - 3, WIN.w);
  base.hline(WIN.x, y + HDR - 1, WIN.w);
}
vScrollBar(base, WIN.x + WIN.w - SB, SCN.y - 1, SCN.h + 2);

// the painting is drawn into its own raster, clipped to the window
const scene = new Raster(SCN.w, SCN.h, SCN.x, SCN.y);
sky(scene);
sun(scene, sx(256), sy(15));
cloud(scene, sx(8), HZ - 1, [[6, -3, 5], [14, -7, 8], [25, -6, 7], [34, -3, 5]]);
cloud(scene, sx(98), HZ - 1, [[5, -2, 4], [11, -5, 6], [19, -3, 5]]);
cloud(scene, sx(238), HZ - 1, [[5, -3, 5], [13, -6, 7], [22, -3, 6]]);
const seaFrames = [0, 1].map((ph) => { const r = new Raster(SCN.w, SCN.h - (HZ - SCN.y), SCN.x, HZ); seaLines(r, ph); return r; });
island(scene);
bush(scene, ISL.cx - 62, ISL.cy - 2, 1, 11);
bush(scene, ISL.cx + 30, ISL.cy - 7, 0.8, 23);
rock(scene, ISL.cx - 80, ISL.cy + 5, 4, 2.6);
rock(scene, ISL.cx + 20, ISL.cy + 12, 3, 2);
// the palm's shade, which is where she sits
scene.fill(ISL.cx - 50, ISL.cy - 12, 110, 24, (px, py) => ((px - sx(150)) / 38) ** 2 + ((py - sy(128)) / 6) ** 2 <= 1 && onIsland(px, py, -1), INK.lg);
trunk(scene);
crown(scene);
raft(scene, RAFT.x, RAFT.y);
// her coconut, with a straw, on the sand beside her
scene.sprite([
  '     ## ',
  '     #  ',
  '  ###.# ',
  ' #.....#',
  ' #%%%%%#',
  ' #%%%%%#',
  '  ##### ',
], HER.x + 25, HER.y + 22);
{
  const st = shadowStyle(displayMask('Castaway', 3, 1.1));
  const tx = sx(12), ty = sy(7);
  scene.mask(st.black, tx, ty, B);
  scene.mask(st.white, tx, ty, Wt);
}
// copy the painting in; where it is still empty the sea shows through (the
// sea lives in two frames of its own, cut to these holes further down)
const HOLE = 250;
for (let y = SCN.y; y < SCN.y + SCN.h; y++) for (let x = SCN.x; x < SCN.x + SCN.w; x++) {
  const v = scene.get(x, y);
  base.set(x, y, v === CLEAR ? HOLE : v);
}

// the icons down the right-hand side
const ICX = 376;
icon(base, 'floppy', ICX, 20, 'Castaway');
icon(base, 'app', ICX - 56, 44, 'serve.py', { selected: true });
icon(base, 'musing', ICX, 68, 'MUSING.md');
icon(base, 'toml', ICX, 116, 'activities.toml');
icon(base, 'audio', ICX, 164, 'make_audio.py');
icon(base, 'trash', ICX + 2, 224, 'The Tide');

// the dialog, alert style: double frame and an icon at the left
const BAR = { x: DLG.x + 52, y: DLG.y + 40, w: 112, h: 11 };
const BTN = { x: DLG.x + DLG.w - 62, y: DLG.y + 38, w: 46, h: 15 };
{
  const { x, y, w, h } = DLG;
  base.rect(x, y, w, h, Wt);
  base.frame(x, y, w, h);
  base.frame(x + 2, y + 2, w - 4, h - 4);
  base.frame(x + 3, y + 3, w - 6, h - 6);
  base.frame(BAR.x, BAR.y, BAR.w, BAR.h);
  // the default button: rounded, with a fat ring round it
  base.rring(BTN.x - 4, BTN.y - 4, BTN.w + 8, BTN.h + 8, 8, 3, B);
  base.rring(BTN.x, BTN.y, BTN.w, BTN.h, 5, 1, B);
  textC(base, sys, 'Wait', BTN.x + BTN.w / 2, BTN.y + 4);
}
// the screen: rounded corners, see-through outside them, and a 1-px black
// edge so the white menu bar still has a top on a white page
const SCREEN = new Raster(W, H);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (inRR(x + 0.5, y + 0.5, 0, 0, W, H, 7)) SCREEN.set(x, y, B);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  if (SCREEN.get(x, y) !== B) { base.set(x, y, Wt); continue; }
  let edge = x === 0 || y === 0 || x === W - 1 || y === H - 1;
  for (let dy = -1; dy <= 1 && !edge; dy++) for (let dx = -1; dx <= 1 && !edge; dx++) if (SCREEN.get(x + dx, y + dy) !== B) edge = true;
  if (edge) base.set(x, y, B);
}
// the sea's white goes into the base; its two frames keep only their black
for (const r of seaFrames) {
  for (let y = r.y0; y < r.y0 + r.h; y++) for (let x = r.x0; x < r.x0 + r.w; x++) {
    if (base.get(x, y) !== HOLE || r.get(x, y) !== B) r.set(x, y, CLEAR);
  }
}
for (let i = 0; i < base.px.length; i++) if (base.px[i] === HOLE) base.px[i] = Wt;

// ---------------------------------------------------------------- animated layers
const layers = [];
const layer = (R, attrs) => layers.push(`<g ${attrs}>${emit(R)}</g>`);
const spriteLayer = (rows, x, y, attrs, legend = SPR) => {
  const R = new Raster(Math.max(...rows.map((r) => r.length)), rows.length, x, y);
  R.sprite(rows, x, y, legend);
  layer(R, attrs);
};
// the sea shimmers: two frames, a beat pair each
{
  const [a, b] = frames(BEAT * 2, 2);
  layer(seaFrames[0], a);
  layer(seaFrames[1], b);
}
// rounds: wait 0-4.5, menu 4.5-6, gag 6-12 (on a bar line), three times
const R0 = [0, 12, 24];
const GAG = R0.map((t) => [t + 6, t + 12]);
const MENU = R0.map((t) => [t + 4.5, t + 6]);
const at = (r, a, b) => [R0[r] + a, R0[r] + b];

// her: nodding on the beat, except while she throws and when the bottle comes home
{
  const idle = vis([[0, 6], at(0, 6.75, 10.5), [12, T]]);
  const [down, up] = frames(BEAT, 2);
  const mk = (rows) => emit(sprite(25, 31, HER.x, HER.y, (R, x, y) => R.sprite(rows, x, y)));
  layers.push(`<g ${idle}><g ${down}>${mk(HER_DOWN)}</g><g ${up}>${mk(HER_UP)}</g></g>`);
  layer(sprite(30, 45, HER.x, HER.y - 14, (R, x) => throwPose(R, x, HER.y)), vis([at(0, 6, 6.75)]));
  layer(sprite(25, 31, HER.x, HER.y, (R, x, y) => R.sprite(HER_LOOK, x, y)), vis([at(0, 10.5, 12)]));
}
// gag 1: the message in a bottle, which washes straight back
layer(sprite(16, 16, sx(92), sy(56), (R) => bottle(R, sx(96), sy(59), -0.9)), vis([at(0, 6.75, 7.5)]));
layer(sprite(13, 6, sx(38), sy(88), (R, x, y) => splash(R, x, y)), vis([at(0, 7.5, 8.25)]));
const bob = (x, y) => sprite(9, 12, x - 4, y - 2, (R) => { bottle(R, x - 1, y, 0.2); R.sprite(['##..#..##'], x - 4, y + 8); });
layer(bob(sx(46), sy(84)), vis([at(0, 8.25, 9)]));
layer(bob(sx(64), sy(94)), vis([at(0, 9, 9.75)]));
layer(bob(sx(82), sy(104)), vis([at(0, 9.75, 10.5)]));
layer(sprite(16, 12, sx(98), sy(126), (R) => bottle(R, sx(102), sy(127), Math.PI / 2 - 0.15)), vis([at(0, 10.5, 12)]));
// gag 2: a shark in headphones, nodding to the beat
layer(sprite(13, 11, sx(0), sy(89), (R, x, y) => fin(R, x + 1, y)), vis([at(1, 6, 6.75)]));
layer(sprite(13, 11, sx(10), sy(89), (R, x, y) => fin(R, x + 1, y)), vis([at(1, 6.75, 7.5)]));
layer(sprite(13, 11, sx(20), sy(89), (R, x, y) => fin(R, x + 1, y)), vis([at(1, 7.5, 8.25)]));
{
  const g = vis([at(1, 8.25, 11.25)]);
  const [down, up] = frames(BEAT, 2);
  const mk = (d) => emit(sprite(50, 28, sx(2), sy(74), (R) => shark(R, sx(5), sy(98), d)));
  layers.push(`<g ${g}><g ${down}>${mk(true)}</g><g ${up}>${mk(false)}</g></g>`);
}
layer(sprite(13, 11, sx(8), sy(89), (R, x, y) => fin(R, x + 1, y)), vis([at(1, 11.25, 12)]));
// gag 3: a coconut falls on a hermit crab, which walks off wearing it
const NUT0 = [PALM.top[0] + COCONUTS[FALLING][0], PALM.top[1] + COCONUTS[FALLING][1]];
const CRAB_Y = sy(117);
layer(sprite(20, 12, sx(228) - 2, CRAB_Y, (R, x) => crab(R, x + 2, CRAB_Y, 0)), vis([at(2, 6, 6.75)]));
layer(sprite(20, 12, sx(216) - 2, CRAB_Y, (R, x) => crab(R, x + 2, CRAB_Y, 1)), vis([at(2, 6.75, 7.5)]));
layer(sprite(20, 12, sx(204) - 2, CRAB_Y, (R, x) => crab(R, x + 2, CRAB_Y, 0)), vis([at(2, 7.5, 8.25)]));
layer(sprite(9, 14, Math.round(NUT0[0]) - 4, sy(84), (R, x, y) => {
  nut(R, NUT0[0], y + 10, 3);
  R.vline(Math.round(NUT0[0]) - 2, y, 4); R.vline(Math.round(NUT0[0]) + 2, y + 1, 3);
}), vis([at(2, 7.5, 8.25)]));
layer(sprite(20, 16, sx(204) - 2, CRAB_Y - 3, (R, x) => nutCrab(R, x + 2, CRAB_Y - 3, 0)), vis([at(2, 8.25, 9)]));
layer(sprite(9, 4, sx(208), CRAB_Y - 9, (R, x, y) => bonk(R, x, y)), vis([at(2, 8.25, 9)]));
[[212, 1, 9], [220, 0, 9.75], [228, 1, 10.5], [236, 0, 11.25]].forEach(([px, st, t]) => {
  layer(sprite(20, 16, sx(px) - 2, CRAB_Y - 3, (R, x) => nutCrab(R, x + 2, CRAB_Y - 3, st)), vis([at(2, t, t + 0.75)]));
});
{
  // the coconut that falls is missing from the crown until the loop comes round
  const R = sprite(9, 9, Math.round(NUT0[0]) - 4, Math.round(NUT0[1]) - 4, (r) => nut(r, NUT0[0], NUT0[1], 3));
  layer(R, vis([[0, at(2, 7.5, 0)[0]]]));
}

// ---------------------------------------------------------------- the dialog's moods
const MOODS = [
  { when: [[0, 4.5], [12, 16.5], [24, 28.5]], l1: 'Please wait…', l2: 'Something happens every 2 to 5 minutes.' },
  { when: MENU, l1: 'Something is coming…', l2: 'It starts on the next bar, on the beat.' },
  { when: [GAG[0]], l1: 'Something is happening!', l2: 'A message in a bottle. It came back.' },
  { when: [GAG[1]], l1: 'Something is happening!', l2: 'A shark in headphones, nodding along.' },
  { when: [GAG[2]], l1: 'Something is happening!', l2: 'The crab is wearing the coconut now.' },
];
for (const m of MOODS) {
  const x = DLG.x + 52, y = DLG.y + 10;
  const R = new Raster(DLG.w - 60, 24, x, y);
  R.rect(x, y, DLG.w - 60, 24, Wt);
  text(R, sys, m.l1, x, y);
  const w2 = text(R, body, m.l2, x, y + 13);
  if (x + w2 > DLG.x + DLG.w - 8) throw new Error(`dialog line too long: ${m.l2}`);
  layer(R, vis(m.when));
}
// her face at the left of the dialog: nodding with her eyes shut while she
// waits, eyes open from the moment the menu drops
{
  const fx = DLG.x + 12, fy = DLG.y + 15;
  const mk = (rows) => emit(sprite(32, 32, fx, fy, (R) => R.sprite(rows, fx, fy)));
  const waiting = vis(MOODS[0].when);
  const [down, up] = frames(BEAT, 2);
  layers.push(`<g ${waiting}><g ${down}>${mk(faceNod(FACE_CLOSED))}</g><g ${up}>${mk(FACE_CLOSED)}</g></g>`);
  layers.push(`<g ${vis([...MENU, ...GAG])}>${mk(FACE_OPEN)}</g>`);
}
// the progress bar fills a beat at a time, then stays full while the gag plays
for (let k = 1; k <= 6; k++) {
  const x0 = BAR.x + 1 + Math.round(((k - 1) / 6) * (BAR.w - 2));
  const x1 = BAR.x + 1 + Math.round((k / 6) * (BAR.w - 2));
  const R = new Raster(x1 - x0, BAR.h - 2, x0, BAR.y + 1);
  R.rect(x0, BAR.y + 1, x1 - x0, BAR.h - 2, INK.dg);
  layer(R, vis(R0.map((t) => [t + k * BEAT, t + 12])));
}

// ---------------------------------------------------------------- the Gags menu, pulled down by the schedule
const ITEMS = [
  ['Message in a Bottle', 'B'],
  ['Delivery Drone', 'D'],
  ['Sea Turtle Visit', 'T'],
  ['Shark in Headphones', 'S'],
  ['Coconut Meets Crab', 'K'],
  ['Stray Cat Visit', 'C'],
  null,
  ['Get Rescued', null],
];
const PICK = [0, 3, 4]; // which item each round chooses
{
  const mx = menuX.Gags;
  const tw = sys.width('Gags');
  // the inverted title
  const T1 = new Raster(tw + 14, MBH, mx - 7, 0);
  T1.rect(mx - 7, 0, tw + 14, MBH, B);
  text(T1, sys, 'Gags', mx, 3, Wt);
  layer(T1, vis(MENU));
  // the menu itself
  const IH = 13;
  const mw = Math.max(...ITEMS.filter(Boolean).map(([s]) => sys.width(s))) + 46;
  const mh = ITEMS.reduce((h, it) => h + (it ? IH : 7), 0) + 2;
  const x0 = mx - 7, y0 = MBH;
  const M = new Raster(mw, mh, x0, y0);
  M.rect(x0, y0, mw, mh, Wt);
  M.frame(x0, y0, mw, mh);
  const shadow = `<path d="M${x0 + mw} ${y0 + 2}h1v${mh - 1}h-1zM${x0 + 2} ${y0 + mh}h${mw - 2}v1h${2 - mw}z"/>`;
  let y = y0 + 1;
  const rows = [];
  for (const it of ITEMS) {
    if (!it) { for (let x = x0 + 1; x < x0 + mw - 1; x++) if (x % 2) M.set(x, y + 3, B); y += 7; continue; }
    const [label, key] = it;
    text(M, sys, label, x0 + 12, y + 3, key ? B : INK.chk); // a disabled item is drawn in grey
    if (key) {
      const kw = sys.width(key);
      text(M, sys, key, x0 + mw - 8 - kw, y + 3);
      text(M, sys, '⌘', x0 + mw - 10 - kw - 10, y + 2);
    }
    rows.push(y);
    y += IH;
  }
  layers.push(`<g ${vis(MENU)}>${emit(M)}${shadow}</g>`);
  // the chosen item, inverted, blinking twice before the menu closes
  PICK.forEach((i, r) => {
    const yy = rows[i];
    const [label, key] = ITEMS[i];
    const S = new Raster(mw - 2, IH, x0 + 1, yy);
    S.rect(x0 + 1, yy, mw - 2, IH, B);
    text(S, sys, label, x0 + 12, yy + 3, Wt);
    const kw = sys.width(key);
    text(S, sys, key, x0 + mw - 8 - kw, yy + 3, Wt);
    text(S, sys, '⌘', x0 + mw - 10 - kw - 10, yy + 2, Wt);
    const t = R0[r] + 4.5;
    layer(S, vis([[t, t + 0.9], [t + 1.1, t + 1.25], [t + 1.4, t + 1.5]]));
  });
}

// ---------------------------------------------------------------- the wristwatch cursor
// parked on the desktop, its hand ticking round once every two bars
{
  const WATCH = [
    '    ######      ',
    '    #....#      ',
    '    #....#      ',
    '   ########     ',
    '  #........#    ',
    ' #..........#   ',
    ' #..........##  ',
    ' #..........#.# ',
    ' #..........##  ',
    ' #..........#   ',
    '  #........#    ',
    '   ########     ',
    '    #....#      ',
    '    #....#      ',
    '    ######      ',
  ];
  const cx0 = 92, cy0 = 238;
  const R = new Raster(16, 15, cx0, cy0);
  R.sprite(WATCH, cx0, cy0, { '#': B, '.': Wt });
  // twelve o'clock and the hour marks
  for (const [dx, dy] of [[6, 5], [6, 10], [3, 7], [10, 7]]) R.set(cx0 + dx, cy0 + dy, B);
  layer(R, '');
  const hands = frames(BEAT * 8, 8);
  const c = [cx0 + 6.5, cy0 + 7.5];
  for (let k = 0; k < 8; k++) {
    const H1 = new Raster(16, 15, cx0, cy0);
    const a = (k / 8) * Math.PI * 2 - Math.PI / 2;
    H1.line(c[0], c[1], c[0] + Math.cos(a) * 3.8, c[1] + Math.sin(a) * 3.8);
    H1.set(Math.round(c[0]), Math.round(c[1]), B);
    layer(H1, hands[k]);
  }
}

// ---------------------------------------------------------------- write the SVG
const ALT = 'Castaway, drawn as a black-and-white desktop from an old one-bit computer. ' +
  'A window called Castaway holds a dithered painting of a tiny island with one tall palm and a raft, the name lettered ' +
  'across the sky in outlined shadow type, and a young woman in headphones sitting under the palm, nodding to the beat. ' +
  'A dialog with her face in it, eyes shut, says: Please wait. Something happens every 2 to 5 minutes. ' +
  'Its progress bar fills a beat at a time, then the Gags menu drops down by itself and a gag plays: ' +
  'a message in a bottle that washes straight back, a shark in headphones nodding along, ' +
  'a coconut that falls on a hermit crab and walks off wearing it.';
function svg() {
  const pats = Object.entries(PATTERNS).map(([k, p]) => {
    const pw = p.rows[0].length, ph = p.rows.length;
    let d = '';
    p.rows.forEach((r, j) => [...r].forEach((c, i) => { if (c === '#') d += `M${i} ${j}h1v1h-1z`; }));
    return `<pattern id="${k}" width="${pw}" height="${ph}" patternUnits="userSpaceOnUse"><rect width="${pw}" height="${ph}" fill="#fff"/><path d="${d}"/></pattern>`;
  }).join('');
  const style = [
    'svg{shape-rendering:crispEdges}',
    'path{fill:#000}',
    '.w{fill:#fff}',
    Object.keys(PATTERNS).map((k) => `.p${k}{fill:url(#${k})}`).join(''),
    `.a{animation-duration:${T}s;animation-iteration-count:infinite;animation-timing-function:step-end}`,
    ...css,
    // too small to dither cleanly on a low-density screen: flat greys instead
    `@media (max-width:560px) and (max-resolution:1.5dppx){${Object.entries(PATTERNS).map(([k, p]) => `.p${k}{fill:${p.grey}}`).join('')}}`,
    `@media (prefers-reduced-motion:reduce){*{animation-delay:-${STATIC}s!important;animation-play-state:paused!important}}`,
  ].join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W * 2}" height="${H * 2}" role="img" aria-label="${ALT}">` +
    `<title>${ALT}</title><defs>${pats}<clipPath id="scr"><path d="${pathOf(rectsOf(SCREEN, B))}"/></clipPath></defs><style>${style}</style>` +
    `<g clip-path="url(#scr)">${emit(base)}</g>` + layers.join('') + '</svg>';
}
mkdirSync(dirname(OUT), { recursive: true });
const out = svg();
writeFileSync(OUT, out);
console.log(`wrote ${OUT} (${(out.length / 1024).toFixed(1)} KB)`);
