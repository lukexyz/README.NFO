#!/usr/bin/env node
// ULTRA-SATISFACTORY as a "poster NFO": a full-canvas shaded block painting with the text set
// inside it. The style is the extravagant end of the 2000s PC release-scene .NFO, where the file
// opens with dozens of rows of shaded block art (the four CP437 tones: light, medium and dark
// shade plus the solid block) before the first word, the logo sits at the foot of the painting
// in tall condensed letters, and the details run between two solid pillars as mirrored
// dot-leader rows. Nothing here is copied from any group's file: the painting (a factory at
// night, a Space Elevator, a banded planet), the lettering and every name are original.
//
// Regenerate:  node examples/ultra-satisfactory/src/22-poster-nfo_opus_5.5.mjs
//              (add --txt to also print the character grid to the console)
// It writes assets/22-poster-nfo_opus_5.5.svg and refreshes the two generated text blocks in
// 22-poster-nfo_opus_5.5.md (between their marker comments); the rest of the .md is hand-written.
//
// Plain Node, no dependencies, fully deterministic (seeded hash noise, no clock, no Math.random).
// Everything sits on a 100 x 45 grid of 8 x 16 cells, exactly like a text file in a DOS font:
// every mark in the picture is a character (the eight CP437 block and shade characters, plus a
// few punctuation marks for stars), so the painting could be typed out. The solid cells are
// merged into a few paths; the three shade characters are the same solid cells with a dither
// pattern of black holes laid over them. Text is a bitmap font defined below (the CP437-style
// table the ANSI BBS header in this folder also uses) and placed with <use>, never <text>.
// Animation is CSS only.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '22-poster-nfo_opus_5.5';
const OUT = path.join(HERE, '..', 'assets', `${SLUG}.svg`);

// ---------------------------------------------------------------------------------------------
// Canvas geometry
// ---------------------------------------------------------------------------------------------
const COLS = 100, ROWS = 45, CW = 8, CH = 16, PAD = 15;
const SW = COLS * CW, SH = ROWS * CH;
const VBW = SW + PAD * 2, VBH = SH + PAD * 2;
const s = (t) => `${+t.toFixed(4)}s`;

// Row map. The painting is rows 0-23; its last two rows are the conveyor that carries parts
// across the whole width. The logo stands directly under it.
const R = {
  paintEnd: 24,       // first row that is not painting
  lane: 22,           // parts ride along the bottom half of this row
  belt: 23,           // the belt itself
  logo: 24,           // 7 rows of letters
  fade: 31,           // 3 rows: dark, medium, light
  name: 35, slogan: 36,
  fields: 38,         // 5 mirrored leader rows
  foot: 44,
};

// ---------------------------------------------------------------------------------------------
// Deterministic noise
// ---------------------------------------------------------------------------------------------
function hash2(x, y, seed = 0) {
  let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(seed | 0, 1442695041)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
// Smooth value noise, roughly 0..1.
function vnoise(x, y, seed = 0) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const fx = x - xi, fy = y - yi;
  const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
  const a = hash2(xi, yi, seed), b = hash2(xi + 1, yi, seed), c = hash2(xi, yi + 1, seed), d = hash2(xi + 1, yi + 1, seed);
  return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
}
const clamp = (v, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v));
const mix = (a, b, t) => a + (b - a) * t;

// ---------------------------------------------------------------------------------------------
// CP437-style 8x16 bitmap font for the plain text. Rows are '#'/'.' strings, placed from row
// `top` of the cell. Capitals sit on rows 2-11, lowercase x-height starts at row 5.
// ---------------------------------------------------------------------------------------------
const FONT = new Map();
function def(ch, top, rows) {
  const g = new Array(16).fill(0);
  rows.split(' ').forEach((r, i) => {
    let v = 0;
    for (let c = 0; c < 8; c++) if (r[c] === '#') v |= 1 << (7 - c);
    g[top + i] = v;
  });
  FONT.set(ch, g);
}
const CAPS = {
  A: '...#... ..###.. .##.##. ##...## ##...## ####### ##...## ##...## ##...## ##...##',
  B: '######. .##..## .##..## .##..## .#####. .##..## .##..## .##..## .##..## ######.',
  C: '..####. .##..## ##....# ##..... ##..... ##..... ##..... ##....# .##..## ..####.',
  D: '#####.. .##.##. .##..## .##..## .##..## .##..## .##..## .##..## .##.##. #####..',
  E: '####### .##..## .##...# .##.#.. .####.. .##.#.. .##.... .##...# .##..## #######',
  F: '####### .##..## .##...# .##.#.. .####.. .##.#.. .##.... .##.... .##.... ####...',
  G: '..####. .##..## ##....# ##..... ##..... ##.#### ##...## ##...## .##..## ..###.#',
  H: '##...## ##...## ##...## ##...## ####### ##...## ##...## ##...## ##...## ##...##',
  I: '.####.. ..##... ..##... ..##... ..##... ..##... ..##... ..##... ..##... .####..',
  J: '...#### ....##. ....##. ....##. ....##. ....##. ##..##. ##..##. ##..##. .####..',
  K: '###..## .##..## .##.##. .##.##. .####.. .####.. .##.##. .##..## .##..## ###..##',
  L: '####... .##.... .##.... .##.... .##.... .##.... .##.... .##...# .##..## #######',
  M: '##...## ###.### ####### ####### ##.#.## ##...## ##...## ##...## ##...## ##...##',
  N: '##...## ###..## ####.## ####### ##.#### ##..### ##...## ##...## ##...## ##...##',
  O: '.#####. ##...## ##...## ##...## ##...## ##...## ##...## ##...## ##...## .#####.',
  P: '######. .##..## .##..## .##..## .#####. .##.... .##.... .##.... .##.... ####...',
  R: '######. .##..## .##..## .##..## .#####. .##.##. .##..## .##..## .##..## ###..##',
  S: '.#####. ##...## ##...## .##.... ..###.. ....##. .....## ##...## ##...## .#####.',
  T: '.######. .######. .#.##.#. ...##... ...##... ...##... ...##... ...##... ...##... ..####..',
  U: '##...## ##...## ##...## ##...## ##...## ##...## ##...## ##...## ##...## .#####.',
  V: '##...## ##...## ##...## ##...## ##...## ##...## ##...## .##.##. ..###.. ...#...',
  W: '##...## ##...## ##...## ##...## ##.#.## ##.#.## ##.#.## ####### .##.##. .##.##.',
  X: '##...## ##...## .##.##. .#####. ..###.. ..###.. .#####. .##.##. ##...## ##...##',
  Y: '.##..##. .##..##. .##..##. .##..##. ..####.. ...##... ...##... ...##... ...##... ..####..',
  Z: '####### ##...## #...##. ...##.. ..##... .##.... ##..... ##....# ##...## #######',
  0: '..###.. .##.##. ##...## ##...## ##.#.## ##.#.## ##...## ##...## .##.##. ..###..',
  1: '..##... .###... ####... ..##... ..##... ..##... ..##... ..##... ..##... ######.',
  2: '.#####. ##...## .....## ....##. ...##.. ..##... .##.... ##..... ##...## #######',
  3: '.#####. ##...## .....## .....## ..####. .....## .....## .....## ##...## .#####.',
  4: '....##. ...###. ..####. .##.##. ##..##. ####### ....##. ....##. ....##. ...####',
  5: '####### ##..... ##..... ##..... ######. .....## .....## .....## ##...## .#####.',
  6: '..###.. .##.... ##..... ##..... ######. ##...## ##...## ##...## ##...## .#####.',
  7: '####### ##...## .....## ....##. ...##.. ..##... ..##... ..##... ..##... ..##...',
  8: '.#####. ##...## ##...## ##...## .#####. ##...## ##...## ##...## ##...## .#####.',
  9: '.#####. ##...## ##...## ##...## .###### .....## .....## .....## ....##. .####..',
};
for (const [ch, rows] of Object.entries(CAPS)) def(ch, 2, rows);
def('Q', 2, '.#####. ##...## ##...## ##...## ##...## ##...## ##...## ##.#.## ##.#### .#####. ....##. ....###');

const LOWER = {
  a: [5, '.####.. ....##. .#####. ##..##. ##..##. ##..##. .###.##'],
  b: [2, '###.... .##.... .##.... .####.. .##.##. .##..## .##..## .##..## .##..## .#####.'],
  c: [5, '.#####. ##...## ##..... ##..... ##..... ##...## .#####.'],
  d: [2, '...###. ....##. ....##. ..####. .##.##. ##..##. ##..##. ##..##. ##..##. .###.##'],
  e: [5, '.#####. ##...## ####### ##..... ##..... ##...## .#####.'],
  f: [2, '..###.. .##.##. .##..#. .##.... ####... .##.... .##.... .##.... .##.... ####...'],
  g: [5, '.###.## ##..##. ##..##. ##..##. ##..##. ##..##. .#####. ....##. ##..##. .####..'],
  h: [2, '###.... .##.... .##.... .##.##. .###.## .##..## .##..## .##..## .##..## ###..##'],
  i: [2, '..##... ..##... ....... .###... ..##... ..##... ..##... ..##... ..##... .####..'],
  j: [2, '....##. ....##. ....... ...###. ....##. ....##. ....##. ....##. ....##. ....##. .##.##. .##.##. ..###..'],
  k: [2, '###.... .##.... .##.... .##..## .##.##. .####.. .####.. .##.##. .##..## ###..##'],
  l: [2, '.###... ..##... ..##... ..##... ..##... ..##... ..##... ..##... ..##... .####..'],
  m: [5, '###.##. ####### ##.#.## ##.#.## ##.#.## ##.#.## ##...##'],
  n: [5, '##.###. .##..## .##..## .##..## .##..## .##..## .##..##'],
  o: [5, '.#####. ##...## ##...## ##...## ##...## ##...## .#####.'],
  p: [5, '##.###. .##..## .##..## .##..## .##..## .##..## .#####. .##.... .##.... ####...'],
  q: [5, '.###.## ##..##. ##..##. ##..##. ##..##. ##..##. .#####. ....##. ....##. ...####'],
  r: [5, '##.###. .###.## .##..## .##.... .##.... .##.... ####...'],
  s: [5, '.#####. ##...## .##.... ..###.. ....##. ##...## .#####.'],
  t: [2, '...#... ..##... ..##... ######. ..##... ..##... ..##... ..##... ..##.## ...###.'],
  u: [5, '##..##. ##..##. ##..##. ##..##. ##..##. ##..##. .###.##'],
  v: [5, '##...## ##...## ##...## ##...## .##.##. ..###.. ...#...'],
  w: [5, '##...## ##...## ##.#.## ##.#.## ##.#.## ####### .##.##.'],
  x: [5, '##...## .##.##. ..###.. ..###.. ..###.. .##.##. ##...##'],
  y: [5, '##...## ##...## ##...## ##...## ##...## ##...## .###### .....## ....##. #####..'],
  z: [5, '####### ##..##. ...##.. ..##... .##.... ##...## #######'],
};
for (const [ch, [top, rows]] of Object.entries(LOWER)) def(ch, top, rows);

const PUNCT = {
  '.': [10, '...##.. ...##..'],
  ',': [9, '...##.. ...##.. ...##.. ..##...'],
  ':': [5, '...##.. ...##.. ....... ....... ...##.. ...##..'],
  ';': [5, '...##.. ...##.. ....... ....... ...##.. ...##.. ..##...'],
  '!': [2, '...##.. ..####. ..####. ..####. ...##.. ...##.. ...##.. ....... ...##.. ...##..'],
  '?': [2, '.#####. ##...## ##...## ....##. ...##.. ...##.. ...##.. ....... ...##.. ...##..'],
  "'": [1, '...##.. ...##.. ..##...'],
  '"': [1, '.##..##. .##..##. ..#..#..'],
  '-': [7, '#######'],
  '_': [14, '########'],
  '/': [4, '......# .....## ....##. ...##.. ..##... .##.... ##..... #......'],
  '\\': [4, '#...... ##..... .##.... ..##... ...##.. ....##. .....## ......#'],
  '|': [2, '...##.. ...##.. ...##.. ...##.. ...##.. ...##.. ...##.. ...##.. ...##.. ...##.. ...##.. ...##..'],
  '(': [2, '....##. ...##.. ..##... ..##... ..##... ..##... ..##... ..##... ...##.. ....##.'],
  ')': [2, '.##.... ..##... ...##.. ...##.. ...##.. ...##.. ...##.. ...##.. ..##... .##....'],
  '[': [2, '.####.. .##.... .##.... .##.... .##.... .##.... .##.... .##.... .##.... .####..'],
  ']': [2, '.####.. ...##.. ...##.. ...##.. ...##.. ...##.. ...##.. ...##.. ...##.. .####..'],
  '{': [2, '....### ...##.. ...##.. ...##.. .###... ...##.. ...##.. ...##.. ...##.. ....###'],
  '}': [2, '###.... ..##... ..##... ..##... ...###. ..##... ..##... ..##... ..##... ###....'],
  '<': [3, '....##. ...##.. ..##... .##.... ##..... .##.... ..##... ...##.. ....##.'],
  '>': [3, '.##.... ..##... ...##.. ....##. .....## ....##. ...##.. ..##... .##....'],
  '#': [2, '.##.##. .##.##. ####### .##.##. .##.##. .##.##. ####### .##.##. .##.##.'],
  '*': [5, '.##..##. ..####.. ######## ..####.. .##..##.'],
  '+': [5, '...##... ...##... .######. ...##... ...##...'],
  '=': [6, '.######. ........ ........ .######.'],
  '@': [2, '.#####. ##...## ##...## ##.#### ##.#### ##.#### ##.###. ##..... ##..... .#####.'],
  '&': [2, '.###... ##.##.. ##.##.. .###... .###.## ##.###. ##..##. ##..##. ##..##. .###.##'],
  '%': [4, '##....#. ##...##. ....##.. ...##... ..##.... .##..... ##...##. #....##.'],
  '~': [2, '.###.## ##.###.'],
  '♪': [3, '...##... ...###.. ...####. ...##.##. ...##..#. ...##... ...##... .####... #####... .###....'],
  '►': [3, '#....... ##...... ###..... ####.... #####... ####.... ###..... ##...... #.......'],
  '◄': [3, '....#... ...##... ..###... .####... #####... .####... ..###... ...##... ....#...'],
  '▼': [5, '#######. .#####.. ..###... ...#....'],
  '▲': [7, '...#.... ..###... .#####.. #######.'],
  '×': [6, '##...##. .##.##.. ..###... .##.##.. ##...##.'],
  '·': [7, '...##... ...##...'],
  '•': [6, '...##... ..####.. ..####.. ...##...'],
  '→': [5, '....##.. .....##. ######## .....##. ....##..'],
  '■': [5, '.######. .######. .######. .######. .######. .######.'],
  '♥': [4, '.##.##. ####### ####### ####### .#####. ..###.. ...#...'],
};
for (const [ch, [top, rows]] of Object.entries(PUNCT)) def(ch, top, rows);
FONT.set(' ', new Array(16).fill(0));

// A two-cell double-headed arrow for the centre marker of the mirrored rows.
def('◄', 4, '...#.... ..##.... .####### ######## .####### ..##.... ...#....');
def('►', 4, '....#... ....##.. #######. ######## #######. ....##.. ....#...');

// ---------------------------------------------------------------------------------------------
// The character grid. Each cell is null or { ch, k } where k is a colour class:
//   p painting (each tone has its own colour)   x the pillars (one gradient down the page)
//   u "ULTRA" cyan   w white   t body text   d dot leaders   g gold
//   o / i / b the app's three tab colours
// ---------------------------------------------------------------------------------------------
const BLOCKS = new Set([...'█▀▄▌▐░▒▓']);
const SHADE = [' ', '░', '▒', '▓', '█'];
const grid = Array.from({ length: ROWS }, () => new Array(COLS).fill(null));
function setCell(r, c, ch, k = 'p') {
  if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return;
  grid[r][c] = ch === ' ' ? null : { ch, k };
}
const isEmpty = (r, c) => r < 0 || r >= ROWS || c < 0 || c >= COLS || !grid[r][c];
// Write a string; spaces are transparent.
function put(r, c, str, k = 'p') {
  for (const ch of str) {
    if (ch !== ' ') {
      if (!BLOCKS.has(ch) && !FONT.has(ch)) throw new Error(`no glyph for ${JSON.stringify(ch)}`);
      if (c < 0 || c >= COLS || r < 0 || r >= ROWS) throw new Error(`off canvas at ${r},${c}: ${str}`);
      setCell(r, c, ch, k);
    }
    c++;
  }
  return c;
}
// Hand-drawn block art: an array of rows. Space is transparent, '.' punches a black hole (used
// to cut a dark edge between an object and whatever is behind it).
function sprite(r, c, lines, k = 'p', { halo = false } = {}) {
  if (halo) {
    lines.forEach((ln, i) => [...ln].forEach((ch, j) => {
      if (ch === ' ') return;
      for (const dc of [-1, 1]) if ((ln[j + dc] || ' ') === ' ') setCell(r + i, c + j + dc, ' ');
    }));
  }
  lines.forEach((ln, i) => {
    let cc = c;
    for (const ch of ln) {
      if (ch === '.') setCell(r + i, cc, ' ');
      else if (ch !== ' ') {
        if (!BLOCKS.has(ch)) throw new Error(`sprite: ${JSON.stringify(ch)} is not a block character`);
        setCell(r + i, cc, ch, k);
      }
      cc++;
    }
  });
}
const len = (str) => [...str].length;

// Tone (0..1) to one of the five levels, with a little per-cell jitter so ramps break up the way
// hand shading does instead of banding along perfect contour lines.
function level(t, c, r, jitter = 0.06) {
  const v = t + (hash2(c, r, 7) - 0.5) * 2 * jitter;
  return v < 0.10 ? 0 : v < 0.34 ? 1 : v < 0.58 ? 2 : v < 0.82 ? 3 : 4;
}

// The procedural brush. `inside(x, y)` and `tone(x, y)` work in pixels. Every cell is sampled at
// its four quadrant centres: fully covered cells take the shade for their tone; partly covered
// cells become a solid half block where the surface is bright (a crisp lit edge) and dissolve
// into a lighter shade where it is dark. That is the block-art convention: hard edge on the lit
// side, the shadow side melts into the background.
const QUADS = [[2, 4], [6, 4], [2, 12], [6, 12]];
function paint({ inside, tone, k = 'p', c0 = 0, c1 = COLS - 1, r0 = 0, r1 = R.paintEnd - 1, jitter = 0.06, clear = true, soft = false, into = null }) {
  const write = into || ((r, c, ch) => setCell(r, c, ch, k));
  for (let r = Math.max(0, r0); r <= Math.min(ROWS - 1, r1); r++) {
    for (let c = Math.max(0, c0); c <= Math.min(COLS - 1, c1); c++) {
      const q = QUADS.map(([qx, qy]) => inside(c * CW + qx, r * CH + qy));
      const n = q[0] + q[1] + q[2] + q[3];
      if (!n) continue;
      const lv = level(tone(c * CW + 4, r * CH + 8), c, r, jitter);
      if (n === 4) {
        if (lv === 0) { if (clear) write(r, c, ' '); } else write(r, c, SHADE[lv]);
        continue;
      }
      if (lv >= 3 && !soft) {
        if (n === 3) write(r, c, '█');
        else if (n === 2) {
          if (q[0] && q[1]) write(r, c, '▀');
          else if (q[2] && q[3]) write(r, c, '▄');
          else if (q[0] && q[2]) write(r, c, '▌');
          else if (q[1] && q[3]) write(r, c, '▐');
        }
      } else if (n === 3 && lv > 0) write(r, c, SHADE[lv]);
      else if (n === 2 && lv > 1) write(r, c, SHADE[lv - 1]);
    }
  }
}

// =============================================================================================
// THE PAINTING (rows 0-23): a factory at night. A Space Elevator stands on the picture's axis
// in front of a banded planet; stacks and a sawtooth hall to the left, a refinery to the right,
// one conveyor across the foot. Light comes from the upper left. Drawn back to front.
// =============================================================================================
const AXIS = 404;                                     // centre of column 50

// Shading across a cylinder, u = -1 (left edge) .. 1 (right edge): a highlight just inside the
// lit edge, then a ramp down into shadow.
const CYL = [[-1, 1], [-0.62, 1], [-0.4, 0.78], [0.1, 0.52], [0.62, 0.22], [0.8, 0.2], [0.86, 0.72], [1, 0.72]];
// The same for the elevator, kept mostly solid so it reads as the brightest thing in the picture.
const CYL_HERO = [[-1, 1], [-0.25, 1], [0.05, 0.76], [0.45, 0.66], [0.62, 0.46], [0.8, 0.44], [0.86, 0.95], [1, 0.95]];
const ramp = (pts) => (u) => {
  if (u <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) if (u <= pts[i][0]) return mix(pts[i - 1][1], pts[i][1], (u - pts[i - 1][0]) / (pts[i][0] - pts[i - 1][0]));
  return pts[pts.length - 1][1];
};
const cyl = ramp(CYL), cylHero = ramp(CYL_HERO);

// Paint a shape with a dark gap around it, so it stands clear of whatever is behind.
function shape(inside, tone, { halo = 0, ...opts } = {}) {
  if (halo) paint({ ...opts, inside: (x, y) => inside(x, y, halo), tone: () => 0, soft: true, clear: true });
  paint({ ...opts, inside: (x, y) => inside(x, y, 0), tone });
}

// --- The planet: a lit sphere with cloud bands, its night side lost in the dark. -------------
const PLANET = { x: AXIS, y: 156, r: 152 };
{
  const P = PLANET;
  const ln = Math.hypot(-0.62, -0.50, 0.60);
  const L = [-0.62 / ln, -0.50 / ln, 0.60 / ln];
  paint({
    inside: (x, y) => Math.hypot(x - P.x, y - P.y) < P.r,
    tone: (x, y) => {
      const dx = (x - P.x) / P.r, dy = (y - P.y) / P.r;
      const d = Math.hypot(dx, dy);
      const nz = Math.sqrt(Math.max(0, 1 - d * d));
      const lam = clamp(dx * L[0] + dy * L[1] + nz * L[2]);
      const lat = 0.94 * dy - 0.34 * nz;                  // bands bow towards the viewer
      const band = 0.86 + 0.14 * Math.sin(lat * 7.5 + 0.8 * Math.sin(lat * 3 + 0.5));
      // Kept to the three shade tones, so the solid structures in front stand out; only the
      // lit limb gets a solid edge.
      let t = Math.min(0.79, Math.pow(lam, 0.62) * band * 0.86);
      if (d > 0.945 && lam > 0.3) t = 1;
      if (d > 0.9 && t < 0.2) t = 0.2;                    // a breath of atmosphere on the night limb
      return t;
    },
    jitter: 0.015,
  });
}

// --- Left: the stacks. The tallest stands on the left margin and carries on down the page as
//     the left pillar of the text.
function stack(c, rTop, rBot, body, { lip = true, stripes = [], k = 'p' } = {}) {
  const w = len(body);
  if (lip) sprite(rTop - 1, c - 1, ['▄'.repeat(w + 2)], k);
  for (let r = rTop; r <= rBot; r++) sprite(r, c, [stripes.includes(r - rTop) ? '█'.repeat(w) : body], k);
}
stack(0, 9, 23, '██▓', { stripes: [1, 3], k: 'x' });
stack(9, 11, 17, '█▓▒', { stripes: [1, 3] });
stack(21, 13, 17, '█▒');

// --- The sawtooth hall. ---------------------------------------------------------------------
sprite(15, 4, [
  '   ▄█  ▄█  ▄█  ▄█  ▄█  ▄█ ',
  ' ▄▓▓█▄▓▓█▄▓▓█▄▓▓█▄▓▓█▄▓▓█ ',
  ' █▓▓▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒░░▐ ',
  ' █▓▒▄▄▒▄▄▒▄▄▒▄▄▒▄▄▒▄▄▒░░▐ ',
  ' █▓▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒░░▐ ',
  ' █▓▒▀▀▒▀▀▒▀▀▒▀▀▒▀▀▒▀▀▒░░▐ ',
  ' ██▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒▐ ',
]);
// the night shift has the lights on
for (const r of [18, 20]) for (let c = 8; c <= 24; c++) if (grid[r][c] && '▄▀'.includes(grid[r][c].ch)) grid[r][c].k = 'g';
// a small furnace house between the hall and the elevator
sprite(17, 31, [
  '  ▄▄  ',
  '  █▒  ',
  '▄▄█▒▄▄',
  '█▓▓▒▒▐',
  '█▓▄▄▒▐',
], 'p', { halo: true });
for (const c of [33, 34]) grid[21][c].k = 'g';         // the furnace mouth

// --- The Space Elevator: a mast off the top of the picture that flares into a wide foot. ----
const ELEV = { x: AXIS, flare: 11 * CH, bot: 22 * CH, mast: 18, foot: 124 };
const elevHalf = (y) => ELEV.mast + (ELEV.foot - ELEV.mast) * Math.pow(clamp((y - ELEV.flare) / (ELEV.bot - ELEV.flare)), 2.3);
const elevInside = (x, y, g = 0) => {
  if (y >= ELEV.bot) return 0;
  const dx = Math.abs(x - ELEV.x);
  if (dx >= elevHalf(y) + g) return 0;
  // the gate in the foot, where the parts go in
  if (g === 0 && (dx / 16) ** 2 + ((ELEV.bot - y) / 30) ** 2 < 1) return 0;
  return 1;
};
shape(elevInside, (x, y) => cylHero((x - ELEV.x) / elevHalf(y)), { halo: 7, jitter: 0.02 });
// two collars, the docking ring, and a gallery round the foot
sprite(2, 46, ['  ▄▄▄▄▄  ', '▐██▓▓▒▒▓▌', '  ▀▀▀▀▀  '], 'p', { halo: true });
sprite(9, 40, ['▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄', '▀▀▀▀▀▀▀██▓▓▒▒▓▀▀▀▀▀▀▀'], 'p', { halo: true });
for (const r of [14]) {
  const half = Math.round(elevHalf((r + 1) * CH) / CW) + 1;
  sprite(r, 50 - half, ['▄'.repeat(half * 2 + 1)], 'p', { halo: true });
}

// --- Right: a tank, a cooling tower, a column, a flare stack, and the tower on the right
//     margin that carries on down the page as the right pillar.
function ball(cx, cy, rad) {
  const ln = Math.hypot(-0.6, -0.55, 0.58), L = [-0.6 / ln, -0.55 / ln, 0.58 / ln];
  shape((x, y, g) => Math.hypot(x - cx, y - cy) < rad + g, (x, y) => {
    const dx = (x - cx) / rad, dy = (y - cy) / rad;
    const nz = Math.sqrt(Math.max(0, 1 - dx * dx - dy * dy));
    return 0.16 + 1.05 * Math.pow(clamp(dx * L[0] + dy * L[1] + nz * L[2]), 0.8);
  }, { halo: 6, jitter: 0.03 });
}
ball(69.5 * CW, 18.6 * CH, 29);
sprite(21, 67, ['▐▌ ▐▌']);

{
  const cx = 78.5 * CW, top = 13 * CH + 2, bot = 22 * CH, waistY = 15.5 * CH;
  const halfW = (y) => 25 + 27 * Math.pow(Math.abs(y - waistY) / (bot - waistY), 1.6);
  shape((x, y, g) => y > top - g && y < bot && Math.abs(x - cx) < halfW(y) + g,
    (x, y) => cyl((x - cx) / halfW(y)), { halo: 6, jitter: 0.03 });
}

function column(c, rTop, rBot, body, decks = []) {
  const w = len(body);
  sprite(rTop - 1, c, ['▄'.repeat(w)], 'p', { halo: true });
  for (let r = rTop; r <= rBot; r++) sprite(r, c - 1, [decks.includes(r - rTop) ? `▀${body}▀` : `.${body}.`]);
}
column(87, 8, 21, '█▓▒', [2, 6, 10]);
sprite(18, 84, ['▄▄▄']);

// flare stack (its flame is animated below)
const FLARE = { c: 93, top: 6 };
for (let r = FLARE.top; r <= 21; r++) sprite(r, FLARE.c - 1, [(r - FLARE.top) % 5 === 4 ? '▐█▌' : '.█.']);

stack(97, 3, 23, '▓██', { lip: false, stripes: [1, 3], k: 'x' });
sprite(2, 96, ['▄▄▄▄'], 'x');

// --- The conveyor: the full width of the picture, right above the logo. ---------------------
const BELT = { c0: 3, c1: 96 };
for (let c = BELT.c0; c <= BELT.c1; c++) {
  setCell(R.belt, c, (c - BELT.c0) % 12 === 5 ? '█' : '▀');
  const cell = grid[R.lane][c];
  if (cell && !'░▒'.includes(cell.ch)) setCell(R.lane, c, ' ');
}

// --- Stars: the punctuation marks every NFO artist reaches for. Only on empty sky. -----------
const STARS = [];
{
  const marks = ['·', '·', '·', '.', '.', '+', '·', '*'];
  for (let r = 0; r < 18; r++) {
    for (let c = 0; c < COLS; c++) {
      if (hash2(c, r, 31) < 0.915) continue;
      let open = true;
      for (let dr = -1; dr <= 1; dr++) for (let dc = -2; dc <= 2; dc++) if (!isEmpty(r + dr, c + dc)) open = false;
      if (open) STARS.push({ r, c, ch: marks[Math.floor(hash2(c, r, 32) * marks.length)] });
    }
  }
}

// =============================================================================================
// THE LOGO (rows 24-30) and its faded stems (rows 31-33).
// Tall condensed capitals, one cell of stem, half-block bars. Own lettering.
// =============================================================================================
const TALL = {
  U: ['▄  ▄', '█  █', '█  █', '█  █', '█  █', '█  █', '█▄▄█'],
  L: ['▄   ', '█   ', '█   ', '█   ', '█   ', '█   ', '█▄▄▄'],
  T: ['▄▄▄▄▄', '  █  ', '  █  ', '  █  ', '  █  ', '  █  ', '  █  '],
  R: ['▄▄▄▄', '█  █', '█  █', '█▄▄█', '█ █ ', '█ ▐▌', '█  █'],
  A: ['▄▄▄▄', '█  █', '█  █', '█▄▄█', '█  █', '█  █', '█  █'],
  S: ['▄▄▄▄', '█  ▀', '█   ', '█▄▄▄', '   █', '▄  █', '█▄▄█'],
  I: ['▄', '█', '█', '█', '█', '█', '█'],
  F: ['▄▄▄▄', '█   ', '█   ', '█▄▄ ', '█   ', '█   ', '█   '],
  C: ['▄▄▄▄', '█  ▀', '█   ', '█   ', '█   ', '█  ▄', '█▄▄█'],
  O: ['▄▄▄▄', '█  █', '█  █', '█  █', '█  █', '█  █', '█▄▄█'],
  Y: ['▄   ▄', '█   █', '█   █', '▀▄ ▄▀', '  █  ', '  █  ', '  █  '],
};
const WORDS = [['ULTRA', 'u'], ['SATISFACTORY', 'w']];
const WORD_GAP = 4;
const wordW = (w) => [...w].reduce((a, ch) => a + TALL[ch][0].length + 1, -1);
const LOGO_W = WORDS.reduce((a, [w]) => a + wordW(w), 0) + WORD_GAP * (WORDS.length - 1);
const LOGO_C = Math.floor((COLS - LOGO_W) / 2);
{
  let c = LOGO_C;
  for (const [word, k] of WORDS) {
    for (const ch of word) {
      const g = TALL[ch];
      g.forEach((row, i) => put(R.logo + i, c, row, k));
      // the stems run on below the baseline as a ramp: dark, medium, light
      [...g[6]].forEach((b, i) => {
        if (b === '█' || b === '▄') ['▓', '▒', '░'].forEach((sh, j) => setCell(R.fade + j, c + i, sh, k));
      });
      c += g[0].length + 1;
    }
    c += WORD_GAP - 1;
  }
}

// =============================================================================================
// THE TEXT, set between two pillars that carry the painting down the page.
// =============================================================================================
{
  // Pillar strength per row: 4 solid, lower values are the breaks at section changes.
  const strength = (r) => ({ [R.fade + 2]: 3, [R.name - 1]: 1, [R.slogan + 1]: 1, [R.foot - 2]: 3, [R.foot - 1]: 1, [R.foot]: 2 }[r] ?? 4);
  for (let r = R.logo; r < ROWS; r++) {
    const st = strength(r);
    for (let i = 0; i < 3; i++) {
      const base = [4, 4, 3][i];                       // lit edge outwards, like the stacks
      let lv = Math.min(base, st === 4 ? 4 : st - (hash2(i, r, 5) > 0.5 ? 1 : 0));
      if (st === 1 && hash2(i, r, 6) > 0.6) lv = 0;
      if (lv > 0) { setCell(r, i, SHADE[lv], 'x'); setCell(r, COLS - 1 - i, SHADE[lv], 'x'); }
    }
  }
}

const centred = (r, parts) => {
  const w = parts.reduce((a, [t]) => a + len(t), 0);
  let c = Math.floor((COLS - w) / 2);
  for (const [t, k] of parts) c = put(r, c, t, k);
};
centred(R.name, [['U L T R A', 'u'], [' - ', 'd'], ['S A T I S F A C T O R Y', 'w']]);
centred(R.slogan, [['every recipe, building and Space Elevator objective, one click apart', 't']]);

// Mirrored rows: value, dots, LABEL, a two-headed arrow, LABEL, dots, value.
const FIELD = { c0: 4, c1: 95 };
const FIELDS = [
  [[['a companion app', 't']], 'TYPE', 'FOR', [['the game Satisfactory', 't']]],
  [[['140 items, 211 recipes', 't']], 'PAYLOAD', 'BUILDINGS', [['477, nine of them machines', 't']]],
  [[['Objectives', 'o'], [', ', 't'], ['Items', 'i'], [', ', 't'], ['Buildings', 'b']], 'TABS', 'ELEVATOR', [['5 phases, no refunds', 't']]],
  [[['python -m streamlit run app/app.py', 't']], 'RUN', 'WEB', [['lukexyz.github.io/ULTRA-SATISFACTORY', 'u']]],
  [[['none, it\'s Apache 2.0', 't']], 'PROTECTION', 'AFFILIATION', [['none, unofficial fan project', 't']]],
];
{
  const half = (FIELD.c1 - FIELD.c0 + 1 - 4) / 2;
  const mid = FIELD.c0 + half;
  FIELDS.forEach(([lv, ll, rl, rv], i) => {
    const r = R.fields + i;
    const wl = lv.reduce((a, [t]) => a + len(t), 0), wr = rv.reduce((a, [t]) => a + len(t), 0);
    const dl = half - wl - len(ll) - 2, dr = half - wr - len(rl) - 2;
    if (dl < 3 || dr < 3) throw new Error(`field row ${i} is too long (${dl}, ${dr} dots)`);
    let c = FIELD.c0;
    for (const [t, k] of lv) c = put(r, c, t, k);
    c = put(r, c + 1, '.'.repeat(dl), 'd');
    c = put(r, c + 1, ll, 'w');
    put(r, mid + 1, '◄►', 'g');
    c = put(r, mid + 4, rl, 'w');
    c = put(r, c + 1, '.'.repeat(dr), 'd');
    for (const [t, k] of rv) c = put(r, c + (t === rv[0][0] ? 1 : 0), t, k);
  });
}
centred(R.foot, [['░▒▓ ', 'x'], ['blocks by ', 't'], ['soot', 'w'], [' of ', 't'], ['HALF-PASTA', 'w'], [' · ', 'd'],
  ['0.5 a minute, like the Nuclear kind', 't'], [' ▓▒░', 'x']]);

// =============================================================================================
// Rendering: cells to geometry
// =============================================================================================
// Greedy rectangle merge of a boolean grid: horizontal runs, stacked when identical.
function rectPath(get, W, H, sx, sy) {
  const rects = [];
  let open = [];
  for (let y = 0; y < H; y++) {
    const next = [];
    for (let x = 0; x < W;) {
      if (!get(x, y)) { x++; continue; }
      const x0 = x;
      while (x < W && get(x, y)) x++;
      const o = open.find((q) => q.x === x0 && q.w === x - x0);
      if (o) { o.h++; next.push(o); } else { const q = { x: x0, y, w: x - x0, h: 1 }; rects.push(q); next.push(q); }
    }
    open = next;
  }
  return rects.map((q) => `M${q.x * sx} ${q.y * sy}h${q.w * sx}v${q.h * sy}h${-q.w * sx}z`).join('');
}

const glyphIds = new Map();
function gid(ch) {
  if (!FONT.has(ch)) throw new Error(`no glyph for ${JSON.stringify(ch)}`);
  if (!glyphIds.has(ch)) glyphIds.set(ch, `g${glyphIds.size.toString(36)}`);
  return glyphIds.get(ch);
}
const glyphPath = (g) => rectPath((x, y) => (g[y] >> (7 - x)) & 1, 8, 16, 1, 1);

// A layer is a list of { r, c, ch, k }. Returns SVG: one path per colour for everything solid
// (on a half-cell grid, so half blocks merge with their neighbours), one path per shade level
// for the dither holes, and <use> glyphs for text.
function renderLayer(cells) {
  const solids = new Map(), uses = new Map();
  const holes = [null, new Uint8Array(ROWS * COLS), new Uint8Array(ROWS * COLS), new Uint8Array(ROWS * COLS)];
  const used = [false, false, false, false];
  for (const { r, c, ch, k } of cells) {
    if (!BLOCKS.has(ch)) {
      uses.set(k, (uses.get(k) || '') + `<use href="#${gid(ch)}" x="${c * CW}" y="${r * CH}"/>`);
      continue;
    }
    const lv = SHADE.indexOf(ch);
    // In the painting each of the four tones also has its own colour.
    const kk = k === 'p' && lv >= 1 && lv <= 3 ? `p${lv}` : k;
    if (!solids.has(kk)) solids.set(kk, new Uint8Array(ROWS * 2 * COLS * 2));
    const g = solids.get(kk);
    const on = (hx, hy) => { g[(r * 2 + hy) * COLS * 2 + c * 2 + hx] = 1; };
    if (ch !== '▄' && ch !== '▐') on(0, 0);
    if (ch !== '▄' && ch !== '▌') on(1, 0);
    if (ch !== '▀' && ch !== '▐') on(0, 1);
    if (ch !== '▀' && ch !== '▌') on(1, 1);
    if (lv >= 1 && lv <= 3) { holes[lv][r * COLS + c] = 1; used[lv] = true; }
  }
  let out = '';
  for (const [k, g] of solids) out += `<path class="k${k}" d="${rectPath((x, y) => g[y * COLS * 2 + x], COLS * 2, ROWS * 2, CW / 2, CH / 2)}"/>`;
  for (let lv = 1; lv <= 3; lv++) if (used[lv]) out += `<path class="h${lv}" d="${rectPath((x, y) => holes[lv][y * COLS + x], COLS, ROWS, CW, CH)}"/>`;
  for (const [k, u] of uses) out += `<g class="k${k}">${u}</g>`;
  return out;
}

const staticCells = [];
for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (grid[r][c]) staticCells.push({ r, c, ...grid[r][c] });

const css = [], defs = [], over = [], under = [];

// Colours.
const COL = { u: '#00cfff', w: '#ffffff', t: '#c3d0d8', d: '#51626c', g: '#e8d44d', o: '#a855f7', i: '#ec4899', b: '#38bdf8' };
defs.push(`<linearGradient id="ink" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="${SH}">`
  + `<stop offset="0" stop-color="#43c4ff"/><stop offset=".26" stop-color="#7fe6ff"/><stop offset=".55" stop-color="#e9fbff"/>`
  + `<stop offset=".8" stop-color="#f1e9a6"/><stop offset="1" stop-color="#e8d44d"/></linearGradient>`);
css.push('.kp,.kx{fill:url(#ink)}.kp1{fill:#8d7bff}.kp2{fill:#4a90ff}.kp3{fill:#10c0ff}');
for (const [k, v] of Object.entries(COL)) css.push(`.k${k}{fill:${v}}`);

// The three shade characters, as black holes punched in a solid cell. The dots are 2 px, the
// DOS font's dither doubled so it survives being scaled: light shade keeps a quarter of the ink,
// medium shade is a checkerboard, dark shade loses a quarter.
defs.push('<pattern id="p1" width="8" height="4" patternUnits="userSpaceOnUse"><path d="M0 0h4v2h-4zM6 0h2v2h-2zM2 2h6v2h-6z"/></pattern>');
defs.push('<pattern id="p2" width="4" height="4" patternUnits="userSpaceOnUse"><path d="M0 0h2v2h-2zM2 2h2v2h-2z"/></pattern>');
defs.push('<pattern id="p3" width="8" height="4" patternUnits="userSpaceOnUse"><path d="M4 0h2v2h-2zM0 2h2v2h-2z"/></pattern>');
css.push('.h1{fill:url(#p1)}.h2{fill:url(#p2)}.h3{fill:url(#p3)}');
// At full size every edge sits on a pixel, so snap them: the picture stays sharp even when the
// page puts the image half a pixel off, or the display is scaled 125%. Scaled down, snapping
// would drop the font's 1 px strokes, so there the default anti-aliasing is kept.
css.push(`@media (min-width:${VBW}px){svg{shape-rendering:crispEdges}}`);
// Shown small (a phone), 2 px dots alias into moire, so the holes become flat tones instead.
css.push('@media (max-width:600px){.h1{fill:#000;fill-opacity:.74}.h2{fill:#000;fill-opacity:.5}.h3{fill:#000;fill-opacity:.25}}');

// ---------------------------------------------------------------------------------------------
// Things that move. Each is a small layer of cells over the static painting, drawn with the
// same characters and the same renderer.
// ---------------------------------------------------------------------------------------------

// Stars: most are fixed, every third one breathes.
{
  let fixed = '';
  STARS.forEach((st, i) => {
    const at = `href="#${gid(st.ch)}" x="${st.c * CW}" y="${st.r * CH}"`;
    if (i % 3 === 0) over.push(`<g class="kp"><use class="tw" style="animation-duration:${s(3.2 + hash2(i, 1, 40) * 4)};animation-delay:${s(-hash2(i, 2, 41) * 6)}" ${at}/></g>`);
    else fixed += `<use ${at}/>`;
  });
  under.push(`<g class="kp" opacity=".75">${fixed}</g>`);
  // stepped, not eased: a star changes brightness a few times a cycle, so the image is only
  // repainted when something actually changes
  css.push('@keyframes tw{0%,100%{opacity:.85}50%{opacity:.12}}.tw{opacity:.85;animation:tw 4s steps(3) infinite}');
}

// Smoke and steam: puffs travel along each plume's path, swelling and thinning as they go. The
// plume is sampled at SMOKE.n phases of one puff spacing, so the last frame hands over to the
// first with no jump, and each frame is painted with the same brush as the rest of the picture.
const SMOKE = { n: 6, dur: 3.0 };
const PLUMES = [
  { // the margin stack
    len: 240, gap: 30, r0: 9, grow: 0.17, amp: 1.15,
    path: (u) => [12 + 0.42 * u + 0.0011 * u * u, 122 - 0.60 * u + 6 * Math.sin(u / 36)],
  },
  { // the second stack
    len: 190, gap: 28, r0: 8, grow: 0.15, amp: 1.0,
    path: (u) => [84 + 0.52 * u + 0.0009 * u * u, 154 - 0.50 * u + 5 * Math.sin(u / 30 + 2)],
  },
  { // steam off the cooling tower
    len: 150, gap: 26, r0: 20, grow: 0.19, amp: 0.66,
    path: (u) => [628 + 0.16 * u + 0.0014 * u * u, 198 - 0.74 * u + 4 * Math.sin(u / 24 + 1)],
  },
];
function smokeDensity(x, y, t) {
  let best = 0;
  for (const p of PLUMES) {
    for (let i = 0; (i + t) * p.gap <= p.len; i++) {
      const u = (i + t) * p.gap;
      const [px, py] = p.path(u);
      const q = Math.hypot(x - px, y - py) / (p.r0 + p.grow * u);
      if (q < 1) best = Math.max(best, p.amp * Math.pow(1 - u / p.len, 0.75) * (1 - q * q));
    }
  }
  return best * (0.55 + 0.55 * vnoise(x / 22, y / 18, 21) + 0.35 * vnoise(x / 9, y / 9, 22));
}
function smokeFrame(f) {
  const t = f / SMOKE.n, cells = [];
  paint({
    inside: (x, y) => smokeDensity(x, y, t) > 0.11,
    tone: (x, y) => smokeDensity(x, y, t) * 0.92,
    r0: 0, r1: 14, soft: true, clear: false, jitter: 0.04,
    into: (r, c, ch) => { if (ch !== ' ' && isEmpty(r, c)) cells.push({ r, c, ch, k: 'p' }); },
  });
  return cells;
}
{
  const frames = [];
  for (let f = 0; f < SMOKE.n; f++) frames.push(smokeFrame(f));
  SMOKE.frames = frames;
  frames.forEach((cells, f) => over.push(`<g class="fr${f ? '' : ' fr0'}" style="animation-delay:${s(f ? -(SMOKE.dur - f * SMOKE.dur / SMOKE.n) : 0)}">${renderLayer(cells)}</g>`));
  const on = (100 / SMOKE.n).toFixed(3);
  css.push(`@keyframes fr{0%{opacity:1}${on}%{opacity:0}100%{opacity:0}}.fr{opacity:0;animation:fr ${s(SMOKE.dur)} step-end infinite}.fr0{opacity:1}`);
}

// Parts on the conveyor: crates, plates and the odd tall one, all riding at one speed.
{
  const PERIOD = 36, SPEED = 24;                         // cells, px per second
  const kinds = [[0, '▄'], [5, '▄▄'], [12, '█'], [17, '▄'], [23, '▄▄'], [29, '▄']];
  const cells = [];
  for (let base = BELT.c0 - PERIOD; base <= BELT.c1; base += PERIOD) {
    for (const [off, str] of kinds) [...str].forEach((ch, i) => {
      const c = base + off + i;
      if (c >= 0 && c < COLS) cells.push({ r: R.lane, c, ch, k: 'g' });
    });
  }
  // a second copy one period to the left, so the belt is already full when the loop restarts
  const d = renderLayer(cells);
  defs.push(`<clipPath id="cb"><rect x="${BELT.c0 * CW}" y="${R.lane * CH}" width="${(BELT.c1 - BELT.c0 + 1) * CW}" height="${CH}"/></clipPath>`);
  over.push(`<g clip-path="url(#cb)"><g class="items">${d}<g transform="translate(${-PERIOD * CW} 0)">${d}</g></g></g>`);
  // half a cell per step: every frame is still something the half-block characters could spell
  css.push(`@keyframes belt{to{transform:translateX(${PERIOD * CW}px)}}.items{animation:belt ${s(PERIOD * CW / SPEED)} steps(${PERIOD * 2}) infinite}`);
}

// The climber: one car going up the mast, out of the top of the picture, for ever.
{
  const top = 15;                                        // rows of mast the car is seen on
  defs.push(`<clipPath id="cm"><rect x="${48 * CW}" y="0" width="${5 * CW}" height="${top * CH}"/></clipPath>`);
  const car = renderLayer([{ r: top, c: 49, ch: '▐', k: 'g' }, { r: top, c: 50, ch: '█', k: 'g' }, { r: top, c: 51, ch: '▌', k: 'g' }]);
  over.push(`<g clip-path="url(#cm)"><g class="car">${car}</g></g>`);
  css.push(`@keyframes lift{to{transform:translateY(${-(top + 1) * CH}px)}}.car{animation:lift 9s steps(${(top + 1) * 2}) infinite}`);
}

// Warning lights on everything tall.
{
  const lights = [[7, 1], [9, 10], [1, 98], [6, 88], [2, 50]];
  lights.forEach(([r, c], i) => over.push(`<g class="bk" style="animation-delay:${s(-i * 0.47)}">${renderLayer([{ r, c, ch: '▄', k: 'g' }])}</g>`));
  css.push('@keyframes bk{0%{opacity:1}55%{opacity:.18}100%{opacity:.18}}.bk{animation:bk 2.2s step-end infinite}');
}

// The fuse: one window of the hall drops out now and then, stutters, and comes back.
{
  const FUSE = { r: 20, c: [17, 18] };
  for (const c of FUSE.c) if (!grid[FUSE.r][c] || grid[FUSE.r][c].k !== 'g') throw new Error('the fuse is not on a lit window');
  over.push(`<g class="fz">${renderLayer(FUSE.c.map((c) => ({ r: FUSE.r, c, ch: grid[FUSE.r][c].ch, k: 'z' })))}</g>`);
  css.push('.kz{fill:#131c22}@keyframes fz{0%{opacity:0}70%{opacity:1}72%{opacity:0}74%{opacity:1}93%{opacity:0}100%{opacity:0}}.fz{opacity:0;animation:fz 11s step-end infinite}');
}

// The flare stack burns off whatever the refinery did not want: two frames of gold shade.
{
  const { c, top } = FLARE;
  const a = [{ r: top - 1, c, ch: '█' }, { r: top - 2, c, ch: '▓' }, { r: top - 3, c, ch: '░' }];
  const b = [{ r: top - 1, c, ch: '▓' }, { r: top - 2, c, ch: '▒' }, { r: top - 2, c: c + 1, ch: '░' }];
  over.push(`<g class="fa">${renderLayer(a.map((q) => ({ ...q, k: 'g' })))}</g><g class="fb">${renderLayer(b.map((q) => ({ ...q, k: 'g' })))}</g>`);
  css.push('@keyframes fa{0%{opacity:1}50%{opacity:0}100%{opacity:0}}.fa{animation:fa .9s step-end infinite}.fb{opacity:0;animation:fa .9s step-end -.45s infinite}');
}

// The terminal draw: on load the painting comes up to full strength top to bottom, a row at a
// time, the way a long file scrolls onto a slow screen. It starts dimmed, not black, and the
// logo and the text are there at full strength from the first frame.
{
  const h = R.paintEnd * CH;
  defs.push(`<clipPath id="cp"><rect width="${SW}" height="${h}"/></clipPath>`);
  over.push(`<g clip-path="url(#cp)"><rect class="intro" width="${SW}" height="${h}" fill="#000" fill-opacity=".8"/></g>`);
  css.push(`@keyframes draw{to{transform:translateY(${h}px)}}.intro{animation:draw 1.5s steps(${R.paintEnd}) .15s both}`);
}

css.push('@media (prefers-reduced-motion:reduce){*{animation:none!important}.intro{display:none}}');

// ---------------------------------------------------------------------------------------------
// Assemble
// ---------------------------------------------------------------------------------------------
const staticLayer = renderLayer(staticCells);
const glyphDefs = [...glyphIds].map(([ch, id]) => `<path id="${id}" d="${glyphPath(FONT.get(ch))}"/>`).join('');

const TITLE = 'ULTRA-SATISFACTORY: a poster NFO, a whole factory painted in shaded block characters';
const DESC = 'The header of a companion app for the game Satisfactory, drawn as a poster-style .NFO text file: it opens with a full-canvas painting made only of block characters in four tones. '
  + 'A factory at night: a Space Elevator mast rises off the top of the picture in front of a huge banded planet, with a gold car climbing it; '
  + 'striped smokestacks and a sawtooth-roofed hall with lit windows on the left; a tank, a steaming cooling tower, a column and a flare stack on the right; '
  + 'a conveyor carrying gold parts across the full width. At the foot stands the name ULTRA SATISFACTORY in tall condensed block capitals whose stems fade downwards. '
  + 'Below, between two pillars, the name again letter-spaced, the line "every recipe, building and Space Elevator objective, one click apart", '
  + 'and five mirrored dot-leader rows: a companion app for the game Satisfactory; 140 items, 211 recipes, 477 buildings, nine of them machines; '
  + 'tabs Objectives, Items, Buildings; 5 Space Elevator phases; run with python -m streamlit run app/app.py; live at lukexyz.github.io/ULTRA-SATISFACTORY; '
  + 'protection none, it is Apache 2.0; affiliation none, an unofficial fan project. Signed: blocks by soot of HALF-PASTA.';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VBW} ${VBH}" width="${VBW}" height="${VBH}" role="img" aria-labelledby="t d">
<title id="t">${TITLE}</title>
<desc id="d">${DESC}</desc>
<style>${css.join('\n')}</style>
<defs>${glyphDefs}${defs.join('')}</defs>
<rect x=".5" y=".5" width="${VBW - 1}" height="${VBH - 1}" rx="10" fill="#000" stroke="#2a3238"/>
<g transform="translate(${PAD} ${PAD})">
${under.join('')}
${staticLayer}
${over.join('\n')}
</g>
</svg>
`;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, svg);
console.log(`wrote ${path.relative(process.cwd(), OUT)} (${(svg.length / 1024).toFixed(1)} KB, ${glyphIds.size} glyphs)`);

if (process.argv.includes('--txt')) {
  const starAt = new Map(STARS.map((st) => [`${st.r},${st.c}`, st.ch]));
  console.log(grid.map((row, r) => row.map((cell, c) => (cell ? cell.ch : starAt.get(`${r},${c}`) || ' ')).join('').replace(/\s+$/, '')).join('\n'));
}

// =============================================================================================
// The rest of the file. A poster NFO keeps going after the painting: body text between the two
// pillars, which break into shade fragments at each section change, and more mirrored rows.
// As README text it cannot carry the painting (rows of solid blocks show gaps at GitHub's line
// height), so this half lives in a collapsed code block in the .md, 80 columns wide, and is
// written here so the columns always add up. Every figure is from the app's data.
// =============================================================================================
const MD = path.join(HERE, '..', `${SLUG}.md`);
{
  const INNER = 72, lines = [];
  const row = (text = '', l = '███', r = '███') => {
    if (len(text) > INNER) throw new Error(`NFO line too long (${len(text)}): ${text}`);
    lines.push(`${l} ${text}${' '.repeat(INNER - len(text))} ${r}`.replace(/\s+$/, ''));
  };
  const centre = (text) => row(' '.repeat(Math.floor((INNER - len(text)) / 2)) + text);
  // a section change: the pillars thin out, break, and come back
  const section = (title) => {
    row('', '▓▓▓', '▓▓▓');
    row('', ' ▒░', '░▒');
    row(`░▒▓ ${title} ▓▒░`, ' ░ ', ' ░');
    row('', '▒▓▓', '▓▓▒');
  };
  const HALF = 33;
  const mirror = (lv, ll, rl, rv) => {
    const dl = HALF - len(lv) - len(ll) - 2, dr = HALF - len(rv) - len(rl) - 2;
    if (dl < 2 || dr < 2) throw new Error(`NFO mirror row too long: ${lv} / ${rv}`);
    row(` ${lv} ${'.'.repeat(dl)} ${ll} <-> ${rl} ${'.'.repeat(dr)} ${rv}`);
  };
  const para = (text) => {
    let line = '';
    for (const word of text.split(' ')) {
      if (len(line) + len(word) + 1 > INNER - 4) { row(`  ${line}`); line = word; } else line = line ? `${line} ${word}` : word;
    }
    if (line) row(`  ${line}`);
  };

  row();
  centre('U L T R A - S A T I S F A C T O R Y');
  centre('every recipe, building and Space Elevator objective, one click apart');
  row();
  centre('(the painting is upstairs. this is the part with the words.)');

  section('THE FILE');
  mirror('a companion app', 'TYPE', 'FOR', 'the game Satisfactory');
  mirror('140 items', 'PAYLOAD', 'RECIPES', '211, 88 alternate');
  mirror('477, all buildable', 'BUILDINGS', 'MACHINES', '9 that do the work');
  mirror('Python + Streamlit', 'MADE OF', 'LICENCE', 'Apache 2.0');
  mirror('none, it is open', 'PROTECTION', 'AFFILIATION', 'none, fan project');

  section('THE PAINTING, LEFT TO RIGHT');
  para('The stack on the left margin smokes all day and holds this text up.');
  para('The hall with the sawtooth roof is where the Screws go. All of them.');
  para('One window in the hall keeps going dark. That is the fuse. It picks its moments.');
  para('The mast in the middle is the Space Elevator. One car, going up.');
  para('The planet is decorative. It is not in the data. Do not look it up.');
  para('The conveyor runs the full width, left to right. Nothing is backed up. We would say.');
  para('The flare stack burns off whatever the Refinery did not want.');
  para('The tower on the right margin holds up the other side. Teamwork.');

  section('THE ELEVATOR WANTS');
  mirror('Automation basics', 'PHASE 1', 'x500', 'Automated Wiring');
  mirror('Logistics & steel', 'PHASE 2', 'x500', 'Modular Frame');
  mirror('Oil & computers', 'PHASE 3', 'x2500', 'Versatile Framework');
  mirror('Nuclear & endgame', 'PHASE 4', 'x1000', 'Assembly Director System');
  mirror('Alien tech & quantum', 'PHASE 5', 'x500', 'Biochemical Sculptor');
  row();
  para('One headline demand per phase. The full lists are in the Objectives tab, and every part on them is one click from its recipe.');

  section('SIX RECIPES, AS THE ITEMS TAB TELLS THEM');
  mirror('Iron Plate', '20/min', '6 s', 'Constructor, 4 MW');
  mirror('Screw', '40/min', '6 s', 'Constructor, 4 MW');
  mirror('Modular Frame', '2/min', '60 s', 'Assembler, 15 MW');
  mirror('Versatile Framework', '5/min', '24 s', 'Assembler, 15 MW');
  mirror('Heavy Modular Frame', '2/min', '30 s', 'Manufacturer, 55 MW');
  mirror('Nuclear Pasta', '0.5/min', '120 s', 'Particle Accelerator');

  section('INSTALL');
  row('  1. python -m pip install -r requirements.txt');
  row('  2. python -m streamlit run app/app.py');
  row('  3. open http://localhost:8501');
  row('  or skip all three: https://lukexyz.github.io/ULTRA-SATISFACTORY/');

  section('NOTES FROM THE FLOOR');
  para('A manifold is a load balancer that stopped caring. Both welcome.');
  para('The fuse blows while you are reading a recipe. Hence the recipe on the other monitor.');
  para('Every factory has one splitter facing the wrong way. This app will not find it. It will tell you what the machine behind it was hoping to receive.');
  para('A storage box full of Screws is a lifestyle, not a bug.');
  para('The pipe that goes through the wall is structural now. Say nothing.');
  para('"Temporary" is a tier.');

  section('GREETZ');
  para('The Flare Stack Ratepayers. The Observatory for a Planet That Is Not in the Data. The Grid Congregation and the Free-Range Conveyor Heretics, who read the same recipe card and draw different conclusions. The Dot Rationing Inspectorate, without whom these rows would not reach. The 88 alternate recipes: in the data, off the card, waiting for their moment. Whoever is in the elevator car. It has not come back down. Everyone whose power line was only meant to last the afternoon.');
  row();
  para('Real thanks: game data from greeny/SatisfactoryTools, item and building images from the Satisfactory Wiki (CC BY-NC-SA 4.0).');

  section('SMALL PRINT');
  para('Unofficial fan project, not affiliated with Coffee Stain Studios. The game is not in this file and never was: go and buy it, it is very good. The app is free and the code is Apache 2.0. HALF-PASTA and soot are made up. So is the planet.');
  row();
  centre('blocks by soot of HALF-PASTA');
  centre('(0.5 a minute, like the Nuclear kind)');
  row('', '▓▓▓', '▓▓▓');
  row('', '▒▒▒', '▒▒▒');
  row('', '░░░', '░░░');

  for (const ln of lines) if (len(ln) > 80 || /\s$/.test(ln) || /\t/.test(ln)) throw new Error(`bad NFO line: ${JSON.stringify(ln)}`);

  // The signposts under the pitch: the same mirrored rows, as real text with real links.
  const NAV = [
    [['what\'s inside', '#whats-inside'], 'TABS', 'RUN', ['two commands', '#run-it-locally']],
    [['how it\'s built', '#how-its-built'], 'CODE', 'DATA', ['who to thank', '#data--credits']],
    [['live in your browser', 'https://lukexyz.github.io/ULTRA-SATISFACTORY/'], 'WEB', 'LICENCE', ['Apache 2.0', '#license']],
    [['app/app.py', 'app/app.py'], 'SOURCE', 'CLOUD', ['modal_app.py', 'modal_app.py']],
  ];
  const NAV_HALF = 35;
  const link = ([text, href]) => `<a href="${href}">${text.replace(/&/g, '&amp;')}</a>`;
  const nav = NAV.map(([l, ll, rl, r]) => {
    const dl = NAV_HALF - len(l[0]) - len(ll) - 2, dr = NAV_HALF - len(r[0]) - len(rl) - 2;
    if (dl < 2 || dr < 2) throw new Error(`nav row too long: ${l[0]} / ${r[0]}`);
    return `${link(l)} ${'.'.repeat(dl)} ${ll} &lt;-&gt; ${rl} ${'.'.repeat(dr)} ${link(r)}`;
  });

  // Both blocks go into the .md between marker comments; everything else in it is hand-written.
  if (fs.existsSync(MD)) {
    let md = fs.readFileSync(MD, 'utf8');
    const before = md;
    const fill = (name, body) => {
      const a = md.match(new RegExp(`<!-- ${name}:begin[^>]*-->`)), b = md.indexOf(`<!-- ${name}:end -->`);
      if (!a || b < a.index) throw new Error(`${path.basename(MD)}: markers for "${name}" not found`);
      md = `${md.slice(0, a.index + a[0].length)}\n\n${body}\n\n${md.slice(b)}`;
    };
    // every row is the same width, so centring the block keeps the columns lined up
    fill('nav', `<div align="center">\n<pre>\n${nav.join('\n')}\n</pre>\n</div>`);
    fill('nfo', `\`\`\`text\n${lines.join('\n')}\n\`\`\``);
    if (md !== before) fs.writeFileSync(MD, md);
    console.log(`wrote ${path.relative(process.cwd(), MD)} (signposts ${nav.length} rows, NFO text ${lines.length} lines)`);
  }
}
