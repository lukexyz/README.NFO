#!/usr/bin/env node
// 16-poster-installer_opus_5.5: the "Text-Mode Poster Installer" README header
// for ULTRA-SATISFACTORY.
//
// The style is the one-screen character-cell installer poster (catalogue entry
// pc-07: Razor 1911's 2024-26 installers, graphics by Goto80): the title built
// as enormous block letters that fill the frame, two or three flat inks, a
// one-line title strip, an inverse-video path field and exactly two tiny
// buttons, bottom right. Nothing here is copied from those screens: the
// letterforms, the composition, the border and the 8x8 label font are all drawn
// in this file, and the crew on the name plate (SOFT CLEARANCE) is made up.
//
// The twist is that the poster is a factory seen from above. ULTRA is five
// slabs with a belt channel cut down the middle of every stroke, SATISFACTORY
// is twelve machine blocks with one-unit slits, the gap between the two words
// is the main bus, and the gaps between the small letters are a manifold.
// Gold parts tick along all of it, one cell per step.
//
// Everything sits on one grid. A "unit" is half a character cell (8 px); a
// character cell is 2x2 units (16 px) and holds one 8x8 glyph at 2 px a pixel.
//
//   node 16-poster-installer_opus_5.5.mjs          regenerate the SVG (and the
//                                                  POSTER.TXT block in the .md)
//   node 16-poster-installer_opus_5.5.mjs --txt    print the text poster (no links)
//
// Plain Node, no dependencies, no randomness: the output is byte-stable.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '16-poster-installer_opus_5.5';

// ---------------------------------------------------------------- the words
// Every string on the poster lives here, so the SVG and the text poster agree.
const CREW = 'SOFT CLEARANCE';     // invented for this header; no such group exists
const PLATE = `${CREW} PRESENTS:`;
const STRIP = 'THE UNOFFICIAL SATISFACTORY COMPANION APP';
const TABS = 'OBJECTIVES + ITEMS + BUILDINGS, ONE CLICK APART';
const RUN_CMD = 'python -m streamlit run app/app.py';
const WEB_URL = 'lukexyz.github.io/ULTRA-SATISFACTORY';
const COUNTS = { items: 140, recipes: 211, buildings: 477, phases: 5 };   // what the app shows
const OUT = path.join(HERE, '..', 'assets', `${SLUG}.svg`);
const MD = path.join(HERE, '..', `${SLUG}.md`);

// ---------------------------------------------------------------- palette
// Black field and three flat inks, all lifted from the app: its cyan ULTRA,
// its white SATISFACTORY and its gold accent. No tints, no gradients.
const INK = { k: '#000000', c: '#00cfff', w: '#ffffff', g: '#e8d44d' };

// ---------------------------------------------------------------- geometry
const U = 8;                       // one unit, in px (half a character cell)
const CELL = 2 * U;                // one character cell
const CX = 4.5, CY = 4.5;          // content origin, in units (margin 1 + border 2 + margin 1.5)
const CW = 95;                     // content width: 12 small letters of 7 + 11 gaps of 1
const BIG_H = 22, SMALL_H = 11;    // letter heights
const MID_Y = BIG_H;               // the main bus, one unit tall, between the words
const SMALL_Y = MID_Y + 1;
const ROW_A = SMALL_Y + SMALL_H + 1.5; // title strip
const ROW_B = ROW_A + 3;               // tab line
const ROW_C = ROW_B + 3;               // path field
const ROW_D = ROW_C + 3.5;             // progress + buttons
const CH = ROW_D + 2;              // content height (47)
const WU = CX + CW + CX, HU = CY + CH + CY;
const W = WU * U, H = HU * U;
const COLS = Math.floor(CW / 2);   // 47 text columns
const TX = (CX + (CW - COLS * 2) / 2) * U;   // text origin, px
const tx = (col) => TX + col * CELL;
const ty = (rowU) => (CY + rowU) * U;

// ---------------------------------------------------------------- timeline (seconds)
const CYCLE = 16;
const T = {
  press: 2.0,                      // INSTALL goes down
  stage: [2.0, 4.0, 6.0, 8.0],     // the four things that get unpacked
  done: 9.5,                       // bar full, focus hops to QUIT
  web: 11.5,                       // the punchline: the path field swaps to the no-install URL
  reset: 15.5,                     // QUIT: everything back to the first frame
};
const PART_GAP = 5;                // units between parts on a belt
const PART_STEP = 0.2;             // seconds per one-unit step

// ---------------------------------------------------------------- 8x8 label font
// Drawn for this poster: two-pixel verticals, one-pixel horizontals, column 0
// and column 7 clear so inverse-video bars get a margin. Descenders use row 7.
const FONT_SRC = `
A
..####..
.##..##.
.##..##.
.######.
.##..##.
.##..##.
.##..##.
........
B
.#####..
.##..##.
.##..##.
.#####..
.##..##.
.##..##.
.#####..
........
C
..####..
.##..##.
.##.....
.##.....
.##.....
.##..##.
..####..
........
D
.#####..
.##..##.
.##..##.
.##..##.
.##..##.
.##..##.
.#####..
........
E
.######.
.##.....
.##.....
.#####..
.##.....
.##.....
.######.
........
F
.######.
.##.....
.##.....
.#####..
.##.....
.##.....
.##.....
........
G
..####..
.##..##.
.##.....
.##.###.
.##..##.
.##..##.
..#####.
........
H
.##..##.
.##..##.
.##..##.
.######.
.##..##.
.##..##.
.##..##.
........
I
..####..
...##...
...##...
...##...
...##...
...##...
..####..
........
J
....###.
.....##.
.....##.
.....##.
.##..##.
.##..##.
..####..
........
K
.##..##.
.##.##..
.####...
.###....
.####...
.##.##..
.##..##.
........
L
.##.....
.##.....
.##.....
.##.....
.##.....
.##.....
.######.
........
M
##...##.
###.###.
#######.
##.#.##.
##...##.
##...##.
##...##.
........
N
.##..##.
.###.##.
.######.
.######.
.##.###.
.##..##.
.##..##.
........
O
..####..
.##..##.
.##..##.
.##..##.
.##..##.
.##..##.
..####..
........
P
.#####..
.##..##.
.##..##.
.#####..
.##.....
.##.....
.##.....
........
Q
..####..
.##..##.
.##..##.
.##..##.
.##..##.
.##.##..
..##.##.
........
R
.#####..
.##..##.
.##..##.
.#####..
.####...
.##.##..
.##..##.
........
S
..####..
.##..##.
.##.....
..####..
.....##.
.##..##.
..####..
........
T
.######.
...##...
...##...
...##...
...##...
...##...
...##...
........
U
.##..##.
.##..##.
.##..##.
.##..##.
.##..##.
.##..##.
..####..
........
V
.##..##.
.##..##.
.##..##.
.##..##.
.##..##.
..####..
...##...
........
W
##...##.
##...##.
##...##.
##.#.##.
#######.
###.###.
##...##.
........
X
.##..##.
.##..##.
..####..
...##...
..####..
.##..##.
.##..##.
........
Y
.##..##.
.##..##.
.##..##.
..####..
...##...
...##...
...##...
........
Z
.######.
.....##.
....##..
...##...
..##....
.##.....
.######.
........
0
..####..
.##..##.
.##.###.
.###.##.
.##..##.
.##..##.
..####..
........
1
...##...
..###...
...##...
...##...
...##...
...##...
.######.
........
2
..####..
.##..##.
.....##.
....##..
..##....
.##.....
.######.
........
3
..####..
.##..##.
.....##.
...###..
.....##.
.##..##.
..####..
........
4
....##..
...###..
..####..
.##.##..
.######.
....##..
....##..
........
5
.######.
.##.....
.#####..
.....##.
.....##.
.##..##.
..####..
........
6
..####..
.##..##.
.##.....
.#####..
.##..##.
.##..##.
..####..
........
7
.######.
.##..##.
....##..
...##...
...##...
...##...
...##...
........
8
..####..
.##..##.
.##..##.
..####..
.##..##.
.##..##.
..####..
........
9
..####..
.##..##.
.##..##.
..#####.
.....##.
.##..##.
..####..
........
a
........
........
..####..
.....##.
..#####.
.##..##.
..#####.
........
b
.##.....
.##.....
.#####..
.##..##.
.##..##.
.##..##.
.#####..
........
c
........
........
..####..
.##.....
.##.....
.##.....
..####..
........
d
.....##.
.....##.
..#####.
.##..##.
.##..##.
.##..##.
..#####.
........
e
........
........
..####..
.##..##.
.######.
.##.....
..####..
........
f
...###..
..##....
.#####..
..##....
..##....
..##....
..##....
........
g
........
........
..#####.
.##..##.
.##..##.
..#####.
.....##.
.#####..
h
.##.....
.##.....
.#####..
.##..##.
.##..##.
.##..##.
.##..##.
........
i
...##...
........
..###...
...##...
...##...
...##...
..####..
........
j
.....##.
........
.....##.
.....##.
.....##.
.....##.
.##..##.
..####..
k
.##.....
.##.....
.##..##.
.##.##..
.####...
.##.##..
.##..##.
........
l
..###...
...##...
...##...
...##...
...##...
...##...
..####..
........
m
........
........
###.##..
#######.
##.#.##.
##.#.##.
##...##.
........
n
........
........
.#####..
.##..##.
.##..##.
.##..##.
.##..##.
........
o
........
........
..####..
.##..##.
.##..##.
.##..##.
..####..
........
p
........
........
.#####..
.##..##.
.##..##.
.#####..
.##.....
.##.....
q
........
........
..#####.
.##..##.
.##..##.
..#####.
.....##.
.....##.
r
........
........
.##.###.
.###....
.##.....
.##.....
.##.....
........
s
........
........
..#####.
.##.....
..####..
.....##.
.#####..
........
t
..##....
..##....
.#####..
..##....
..##....
..##....
...###..
........
u
........
........
.##..##.
.##..##.
.##..##.
.##..##.
..#####.
........
v
........
........
.##..##.
.##..##.
.##..##.
..####..
...##...
........
w
........
........
##...##.
##.#.##.
##.#.##.
#######.
.##.##..
........
x
........
........
.##..##.
..####..
...##...
..####..
.##..##.
........
y
........
........
.##..##.
.##..##.
.##..##.
..#####.
.....##.
.#####..
z
........
........
.######.
....##..
...##...
..##....
.######.
........
.
........
........
........
........
........
...##...
...##...
........
,
........
........
........
........
........
...##...
...##...
..##....
:
........
...##...
...##...
........
...##...
...##...
........
........
-
........
........
........
.######.
........
........
........
........
_
........
........
........
........
........
........
........
########
/
......#.
.....##.
....##..
...##...
..##....
.##.....
.#......
........
\\
.#......
.##.....
..##....
...##...
....##..
.....##.
......#.
........
+
........
...##...
...##...
.######.
...##...
...##...
........
........
!
...##...
...##...
...##...
...##...
........
...##...
...##...
........
?
..####..
.##..##.
.....##.
....##..
...##...
........
...##...
........
'
...##...
...##...
..##....
........
........
........
........
........
>
.##.....
..##....
...##...
....##..
...##...
..##....
.##.....
........
■
........
.######.
.######.
.######.
.######.
.######.
.######.
........
·
........
........
........
...##...
...##...
........
........
........
█
########
########
########
########
########
########
########
########
◢
.......#
......##
.....###
....####
...#####
..######
.######.
########
◤
########
#######.
######..
#####...
####....
###.....
##......
#.......
`;
const FONT = {};
{
  const lines = FONT_SRC.split('\n').map((l) => l.trimEnd()).filter((l) => l.length);
  for (let i = 0; i < lines.length; i += 9) {
    const key = lines[i];
    const rows = lines.slice(i + 1, i + 9);
    if ([...key].length !== 1 || rows.length !== 8 || rows.some((r) => !/^[.#]{8}$/.test(r))) {
      throw new Error(`bad glyph near font line ${i}: ${key}`);
    }
    FONT[key] = rows;
  }
  // The hazard-tape triangles are exact halves: cut along the anti-diagonal.
  FONT['◢'] = Array.from({ length: 8 }, (_, j) => Array.from({ length: 8 }, (_, i) => (i + j >= 8 ? '#' : '.')).join(''));
  FONT['◤'] = Array.from({ length: 8 }, (_, j) => Array.from({ length: 8 }, (_, i) => (i + j <= 7 ? '#' : '.')).join(''));
}
const gid = (ch) => `g${ch.codePointAt(0).toString(16)}`;
const usedGlyphs = new Set();

// ---------------------------------------------------------------- grid helpers
class Grid {
  constructor(w, h) { this.w = w; this.h = h; this.a = new Uint8Array(w * h); }
  set(x, y, v = 1) { if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.a[y * this.w + x] = v; }
  get(x, y) { return x >= 0 && y >= 0 && x < this.w && y < this.h ? this.a[y * this.w + x] : 0; }
  fill(x, y, w, h, v = 1) { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, v); }
  carve(x, y, w, h) { this.fill(x, y, w, h, 0); }
}
// Horizontal runs of set cells, merged downwards into rectangles.
function gridRects(get, w, h) {
  const open = new Map();
  const rects = [];
  for (let y = 0; y <= h; y++) {
    const runs = new Set();
    if (y < h) {
      for (let x = 0; x < w;) {
        if (!get(x, y)) { x++; continue; }
        const s = x;
        while (x < w && get(x, y)) x++;
        runs.add(`${s},${x - s}`);
      }
    }
    for (const [k, r] of open) {
      if (runs.has(k)) { r[3]++; runs.delete(k); } else { rects.push(r); open.delete(k); }
    }
    for (const k of runs) { const [s, len] = k.split(',').map(Number); open.set(k, [s, y, len, 1]); }
  }
  return rects;
}
const rectsD = (rects, k = 1, ox = 0, oy = 0) => rects
  .map(([x, y, w, h]) => `M${ox + x * k} ${oy + y * k}h${w * k}v${h * k}h${-w * k}z`).join('');

// ---------------------------------------------------------------- the lettering
// Two grids in units, one per ink. Letters are built the way a sign painter
// would cut them from a slab: fill a block, then carve the slits.
const big = new Grid(CW, BIG_H);           // ULTRA, cyan
const small = new Grid(CW, SMALL_H);       // SATISFACTORY, white
const belts = new Map();                   // "x,y" (content units) -> step index along its belt

// Flood a belt outwards from its source(s) through the listed cells, so every
// cell knows how many steps it is from where its parts appear.
function runBelt(cells, sources, offset = 0, inOrder = false) {
  const want = new Set(cells.map(([x, y]) => `${x},${y}`));
  const dist = new Map();
  if (inOrder) {
    // A belt that loops back on itself: number it in drawing order instead.
    cells.forEach(([x, y], n) => { if (belts.has(`${x},${y}`)) throw new Error(`two belts share cell ${x},${y}`); belts.set(`${x},${y}`, n + offset); });
    return;
  }
  let frontier = sources.map(([x, y]) => `${x},${y}`);
  frontier.forEach((k) => { if (!want.has(k)) throw new Error(`belt source ${k} is not on the belt`); dist.set(k, 0); });
  while (frontier.length) {
    const next = [];
    for (const k of frontier) {
      const [x, y] = k.split(',').map(Number);
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const n = `${x + dx},${y + dy}`;
        if (want.has(n) && !dist.has(n)) { dist.set(n, dist.get(k) + 1); next.push(n); }
      }
    }
    frontier = next;
  }
  if (dist.size !== want.size) throw new Error('belt has cells its source cannot reach');
  for (const [k, d] of dist) {
    if (belts.has(k)) throw new Error(`two belts share cell ${k}`);
    belts.set(k, d + offset);
  }
}
// Cells along a polyline of [x, y] corners (axis-aligned segments).
function line(pts) {
  const out = [];
  for (let i = 0; i + 1 < pts.length; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
    for (let s = i ? 1 : 0; s <= n; s++) out.push([x0 + Math.sign(x1 - x0) * s, y0 + Math.sign(y1 - y0) * s]);
  }
  return out;
}

// ULTRA: strokes 7 units wide (a 3-unit band, a 1-unit belt, a 3-unit band),
// counters and letter gaps 3 units. Each letter: ops on the big grid, plus the
// belt that runs down the middle of its strokes (corners, then sources).
const BIG = [
  { ch: 'U', x: 0, w: 17,
    ops: [['fill', 0, 0, 17, 22], ['carve', 7, 0, 3, 15]],
    belts: [{ path: [[3, 3], [3, 18], [13, 18], [13, 3]], from: [[3, 3]] }] },
  { ch: 'L', x: 20, w: 17,
    ops: [['fill', 0, 0, 7, 22], ['fill', 0, 15, 17, 7]],
    belts: [{ path: [[3, 3], [3, 18], [13, 18]], from: [[3, 3]] }] },
  { ch: 'T', x: 40, w: 15,
    ops: [['fill', 0, 0, 15, 7], ['fill', 4, 0, 7, 22]],
    belts: [{ path: [[3, 3], [11, 3]], extra: [[7, 3], [7, 18]], from: [[3, 3]] }] },
  { ch: 'R', x: 58, w: 17,
    ops: [['fill', 0, 0, 17, 22], ['carve', 7, 7, 3, 3], ['carve', 7, 17, 3, 5], ['carve', 14, 17, 3, 2]],
    belts: [{ path: [[3, 18], [3, 3], [13, 3], [13, 13], [4, 13]], from: [[3, 18]], inOrder: true }] },
  { ch: 'A', x: 78, w: 17,
    ops: [['fill', 3, 0, 11, 7], ['fill', 0, 7, 17, 15], ['carve', 7, 7, 3, 3], ['carve', 7, 17, 3, 5]],
    belts: [
      { path: [[3, 18], [3, 10]], extra: [[3, 13], [13, 13]], extra2: [[13, 10], [13, 18]], from: [[3, 18]] },
      { path: [[6, 3], [10, 3]], from: [[6, 3]] },
    ] },
];
for (const L of BIG) {
  for (const [op, x, y, w, h] of L.ops) big[op](L.x + x, y, w, h);
  for (const b of L.belts) {
    const seen = new Set();
    const cells = [...line(b.path), ...(b.extra ? line(b.extra) : []), ...(b.extra2 ? line(b.extra2) : [])]
      .map(([x, y]) => [L.x + x, y])
      .filter(([x, y]) => (seen.has(`${x},${y}`) ? false : seen.add(`${x},${y}`)));
    for (const [x, y] of cells) {
      if (!big.get(x, y)) throw new Error(`belt cell ${x},${y} of ${L.ch} is not inside the letter`);
      big.carve(x, y, 1, 1);
    }
    runBelt(cells, b.from.map(([x, y]) => [L.x + x, y]), 0, !!b.inOrder);
  }
}

// SATISFACTORY: twelve 7x11 blocks, strokes 3 units, every slit 1 unit.
const SMALL = {
  S: [['fill', 0, 0, 7, 11], ['carve', 3, 3, 4, 1], ['carve', 0, 7, 4, 1]],
  A: [['fill', 0, 0, 7, 11], ['carve', 3, 3, 1, 2], ['carve', 3, 8, 1, 3], ['carve', 0, 0, 1, 1], ['carve', 6, 0, 1, 1]],
  T: [['fill', 0, 0, 7, 3], ['fill', 2, 3, 3, 8]],
  I: [['fill', 0, 0, 7, 3], ['fill', 2, 3, 3, 5], ['fill', 0, 8, 7, 3]],
  F: [['fill', 0, 0, 7, 7], ['fill', 0, 7, 3, 4], ['carve', 3, 3, 4, 1]],
  C: [['fill', 0, 0, 7, 11], ['carve', 3, 3, 1, 5], ['carve', 4, 5, 3, 1]],
  O: [['fill', 0, 0, 7, 11], ['carve', 3, 3, 1, 5]],
  R: [['fill', 0, 0, 7, 11], ['carve', 3, 3, 1, 2], ['carve', 3, 8, 1, 3], ['carve', 5, 8, 2, 1]],
  Y: [['fill', 0, 0, 7, 7], ['carve', 3, 0, 1, 4], ['fill', 2, 7, 3, 4]],
};
[...'SATISFACTORY'].forEach((ch, i) => {
  for (const [op, x, y, w, h] of SMALL[ch]) small[op](i * 8 + x, y, w, h);
});

// The main bus runs left to right between the two words; at every gap between
// the small letters a branch drops off it. That is a manifold. We checked.
runBelt(line([[0, MID_Y], [CW - 1, MID_Y]]), [[0, MID_Y]]);
for (let i = 0; i < 11; i++) {
  const x = i * 8 + 7;
  line([[x, SMALL_Y], [x, SMALL_Y + SMALL_H - 1]]).forEach(([bx, by], n) => belts.set(`${bx},${by}`, x + 1 + n));
}

// ---------------------------------------------------------------- CSS timeline
const css = [];
const tracks = new Map();
const pct = (t) => `${+(t / CYCLE * 100).toFixed(3)}%`;
// A step-end opacity track over the cycle, visible during the given windows.
function win(...spans) {
  const pts = [];
  let on = false;
  const push = (t, v) => { if (pts.length && pts[pts.length - 1][0] === t) pts[pts.length - 1][1] = v; else pts.push([t, v]); };
  push(0, 0);
  for (const [a, b] of spans) { push(a, 1); if (b < CYCLE) push(b, 0); else on = true; }
  const body = pts.map(([t, v]) => `${pct(t)}{opacity:${v}}`).join('') + `100%{opacity:${on ? 1 : 0}}`;
  let name = tracks.get(body);
  if (!name) {
    name = `t${tracks.size}`;
    tracks.set(body, name);
    css.push(`@keyframes ${name}{${body}}.${name}{animation:${name} ${CYCLE}s step-end infinite}`);
  }
  return name;
}

// ---------------------------------------------------------------- text
function text(str, col, rowU, fill, cls = '') {
  let s = `<g transform="translate(${tx(col)} ${ty(rowU)})" fill="${fill}"${cls ? ` class="${cls}"` : ''}>`;
  [...str].forEach((ch, i) => {
    if (ch === ' ') return;
    if (!FONT[ch]) throw new Error(`no glyph for "${ch}"`);
    usedGlyphs.add(ch);
    s += `<use href="#${gid(ch)}"${i ? ` x="${i * CELL}"` : ''}/>`;
  });
  return `${s}</g>`;
}
// Inverse-video bars run one label pixel past the cell, top and bottom, so
// capitals (rows 0-6) and descenders (row 7) both keep a rim of ink.
const PAD = 2;
const barPx = (x, rowU, w, fill) => `<rect x="${x}" y="${ty(rowU) - PAD}" width="${w}" height="${CELL + 2 * PAD}" fill="${fill}"/>`;
const bar = (col, rowU, cols, fill) => barPx(tx(col), rowU, cols * CELL, fill);
const cell = (col, rowU, fill) => `<rect x="${tx(col)}" y="${ty(rowU)}" width="${CELL}" height="${CELL}" fill="${fill}"/>`;
const len = (s) => [...s].length;

// ================================================================= the poster
let out = '';
out += `<rect width="${W}" height="${H}" fill="${INK.k}"/>`;

// Hazard-tape border: one character cell thick, two triangle glyphs, the
// stripe phase set by (column + row) so the tape turns the corners cleanly.
{
  const bc = (WU - 2) / 2, br = (HU - 2) / 2;
  if (!Number.isInteger(bc) || !Number.isInteger(br)) throw new Error('border does not land on the cell grid');
  // The crew's name plate is let into the top run of tape, on the same cells,
  // with one clear cell either side. The tape must stop on a whole stripe on
  // the left (an odd cell) and start on a whole stripe on the right (an even
  // one), which pins the plate to an even number of characters.
  const p0 = (bc - 1 - len(PLATE)) / 2;                 // first character cell
  const gap0 = p0 - 1, gap1 = p0 + len(PLATE);          // first and last cleared cells
  if (!Number.isInteger(p0) || gap0 % 2 !== 0 || (gap1 + 1) % 2 !== 0) throw new Error('name plate would cut a stripe in half');
  let s = `<g fill="${INK.g}">`;
  [...PLATE].forEach((ch, i) => {
    if (ch === ' ') return;
    if (!FONT[ch]) throw new Error(`no glyph for "${ch}"`);
    usedGlyphs.add(ch);
    s += `<use href="#${gid(ch)}" x="${U + (p0 + i) * CELL}" y="${U}"/>`;
  });
  for (let r = 0; r < br; r++) {
    for (let c = 0; c < bc; c++) {
      if (r > 0 && r < br - 1 && c > 0 && c < bc - 1) continue;
      if (r === 0 && c >= gap0 && c <= gap1) continue;
      const ch = (c + r) % 2 ? '◤' : '◢';
      usedGlyphs.add(ch);
      s += `<use href="#${gid(ch)}" x="${U + c * CELL}" y="${U + r * CELL}"/>`;
    }
  }
  out += `${s}</g>`;
}

// The two words.
out += `<path fill="${INK.c}" d="${rectsD(gridRects((x, y) => big.get(x, y), CW, BIG_H), U, CX * U, CY * U)}"/>`;
out += `<path fill="${INK.w}" d="${rectsD(gridRects((x, y) => small.get(x, y), CW, SMALL_H), U, CX * U, (CY + SMALL_Y) * U)}"/>`;

// The hex-and-cog emblem, tucked into the notch of the L. Drawn at label
// resolution (2 px) from plain geometry: a hexagon ring and an eight-tooth cog.
{
  const PX = 2, n = 40;                        // 80 x 80 px canvas
  const cx = n / 2, cy = n / 2;
  const hex = (dx, dy, r) => Math.abs(dx) <= r * 0.8660254 && Math.abs(dy) + Math.abs(dx) / 1.7320508 <= r;
  const cog = (dx, dy) => {
    const rho = Math.hypot(dx, dy);
    if (rho < 3.2) return false;
    if (rho <= 7.4) return true;
    for (let k = 0; k < 8; k++) {
      const a = k * Math.PI / 4;
      const along = dx * Math.cos(a) + dy * Math.sin(a);
      const across = Math.abs(-dx * Math.sin(a) + dy * Math.cos(a));
      if (along > 0 && along <= 10.6 && across <= 2.1) return true;
    }
    return false;
  };
  const on = (i, j) => {
    const dx = i + 0.5 - cx, dy = j + 0.5 - cy;
    return (hex(dx, dy, 19.5) && !hex(dx, dy, 15.6)) || cog(dx, dy);
  };
  const ox = (CX + 20 + 7) * U, oy = CY * U + 16;
  out += `<path fill="${INK.g}" d="${rectsD(gridRects(on, n, n), PX, ox, oy)}"/>`;
}

// Parts on the belts: PART_GAP frames, each holding every part whose belt
// index lands on that frame. Frame f is lit for one step, so every part
// appears to tick one unit along its belt per step, forever, with no seam.
{
  const period = +(PART_GAP * PART_STEP).toFixed(3);
  for (let f = 0; f < PART_GAP; f++) {
    const g = new Grid(CW, CH);
    for (const [k, idx] of belts) {
      // A part sits at index idx at step s when (idx - s) is a multiple of the gap.
      if (((idx - f) % PART_GAP + PART_GAP) % PART_GAP === 0) { const [x, y] = k.split(',').map(Number); g.set(x, y); }
    }
    out += `<path class="p p${f}" fill="${INK.g}" d="${rectsD(gridRects((x, y) => g.get(x, y), CW, CH), U, CX * U, CY * U)}"/>`;
    const a = +(f / PART_GAP * 100).toFixed(3), b = +((f + 1) / PART_GAP * 100).toFixed(3);
    const kf = f === 0 ? `0%{opacity:1}${b}%{opacity:0}100%{opacity:0}`
      : f === PART_GAP - 1 ? `0%{opacity:0}${a}%{opacity:1}100%{opacity:1}`
        : `0%{opacity:0}${a}%{opacity:1}${b}%{opacity:0}100%{opacity:0}`;
    css.push(`@keyframes p${f}{${kf}}.p${f}{animation:p${f} ${period}s step-end infinite}`);
  }
  css.push(`${Array.from({ length: PART_GAP - 1 }, (_, i) => `.p${i + 1}`).join(',')}{opacity:0}`);
}

// Row A: the one-line title strip, inverse video.
{
  if (len(STRIP) > COLS) throw new Error('row A too long');
  out += barPx(CX * U, ROW_A, CW * U, INK.c);
  out += text(STRIP, Math.floor((COLS - len(STRIP)) / 2), ROW_A, INK.k);
}
// Row B: the three tabs.
{
  if (len(TABS) > COLS) throw new Error('row B too long');
  out += text(TABS, Math.floor((COLS - len(TABS)) / 2), ROW_B, INK.w);
}
// Row C: the path field. An inverse-video bar that holds the run command
// until the install has finished, and then the URL that needed no install.
{
  const runCmd = RUN_CMD, webUrl = WEB_URL;
  const fieldCol = 4, fieldCols = COLS - fieldCol;
  if (len(webUrl) + 2 > fieldCols) throw new Error('path field too short');
  out += barPx(tx(fieldCol), ROW_C, (CX + CW) * U - tx(fieldCol), INK.w);
  const a = win([0, T.web], [T.reset, CYCLE]), b = win([T.web, T.reset]);
  css.push(`.${b}{opacity:0}`);
  const cursor = (n) => `<rect class="cur" x="${tx(fieldCol + 1 + n)}" y="${ty(ROW_C) + 2}" width="${CELL - 4}" height="${CELL - 4}" fill="${INK.k}"/>`;
  out += `<g class="${a}">${text('RUN', 0, ROW_C, INK.c)}${text(runCmd, fieldCol + 1, ROW_C, INK.k)}${cursor(len(runCmd))}</g>`;
  out += `<g class="${b}">${text('WEB', 0, ROW_C, INK.c)}${text(webUrl, fieldCol + 1, ROW_C, INK.k)}${cursor(len(webUrl))}</g>`;
  css.push('@keyframes cur{0%{opacity:1}50%{opacity:0}100%{opacity:0}}.cur{animation:cur 1s step-end infinite}');
}
// Row D: progress cells and a status word on the left, the two buttons on the right.
{
  const BAR = 12;
  const labels = [
    ['PRESS INSTALL', [[0, T.press], [T.reset, CYCLE]]],
    [`+ ${COUNTS.items} ITEMS`, [[T.stage[0], T.stage[1]]]],
    [`+ ${COUNTS.recipes} RECIPES`, [[T.stage[1], T.stage[2]]]],
    [`+ ${COUNTS.buildings} BUILDINGS`, [[T.stage[2], T.stage[3]]]],
    [`+ ${COUNTS.phases} PHASES`, [[T.stage[3], T.done]]],
    ['DONE. B.Y.O. GAME', [[T.done, T.web]]],
    ['NO INSTALL NEEDED', [[T.web, T.reset]]],
  ];
  // Empty cells are dots, filled cells are blocks; a cell fills and stays
  // filled until QUIT clears the lot.
  out += text('·'.repeat(BAR), 0, ROW_D, INK.g);
  const fillAt = [2.3, 2.9, 3.5, 4.3, 4.9, 5.5, 6.2, 6.7, 7.2, 7.7, 8.4, 9.0];
  if (fillAt.length !== BAR) throw new Error('one fill time per cell');
  fillAt.forEach((t, i) => {
    const c = win([t, T.reset]);
    css.push(`.${c}{opacity:0}`);
    out += `<g class="${c}">${cell(i, ROW_D, INK.k)}${text('■', i, ROW_D, INK.g)}</g>`;
  });
  labels.forEach(([s, spans], i) => {
    if (len(s) > 17) throw new Error(`status "${s}" too long`);
    const c = win(...spans);
    if (i) css.push(`.${c}{opacity:0}`);
    out += text(s, BAR + 1, ROW_D, INK.w, c);
  });
  // Buttons: focus is an inverse-video cell block, the other one is plain ink.
  const qCol = COLS - 6, iCol = qCol - 10;
  // Each press is one short blink of the focused button.
  const BLINK = 0.12;
  const fi = win([0, T.press], [T.press + BLINK, T.done], [T.reset, CYCLE]);
  const fq = win([T.done, T.reset - 0.3], [T.reset - 0.3 + BLINK, T.reset]);
  css.push(`.${fq}{opacity:0}`);
  out += text('INSTALL', iCol + 1, ROW_D, INK.g);
  out += text('QUIT', qCol + 1, ROW_D, INK.g);
  out += `<g class="${fi}">${bar(iCol, ROW_D, 9, INK.g)}${text('INSTALL', iCol + 1, ROW_D, INK.k)}</g>`;
  // The QUIT bar runs to the content edge, flush with the strips above it.
  out += `<g class="${fq}">${barPx(tx(qCol), ROW_D, (CX + CW) * U - tx(qCol), INK.g)}${text('QUIT', qCol + 1, ROW_D, INK.k)}</g>`;
}

// ---------------------------------------------------------------- assemble
const glyphDefs = [...usedGlyphs].sort().map((ch) => {
  const rows = FONT[ch];
  return `<path id="${gid(ch)}" d="${rectsD(gridRects((x, y) => rows[y][x] === '#', 8, 8), 2)}"/>`;
}).join('');
css.push('@media (prefers-reduced-motion:reduce){*{animation:none!important}}');

const title = 'ULTRA-SATISFACTORY';
const desc = 'A one-screen text-mode installer poster in black, cyan, white and gold. ULTRA fills the top in giant cyan '
  + 'block letters and SATISFACTORY sits under it in white ones, packed edge to edge inside a hazard-tape border with a '
  + `name plate let into the top of the tape, reading ${CREW} PRESENTS. Every stroke of ULTRA has a belt channel down its middle and small `
  + 'gold parts tick along it; more parts run along the gap between the two words and drop down between the letters of '
  + 'SATISFACTORY. A hexagon-and-cog emblem sits in the notch of the L. Underneath: a title strip reading '
  + `${STRIP}, the line ${TABS}, a path field holding ${RUN_CMD}, a twelve-cell progress bar that unpacks `
  + `${COUNTS.items} items, ${COUNTS.recipes} recipes, ${COUNTS.buildings} buildings and ${COUNTS.phases} phases, and two tiny `
  + 'buttons at the bottom right: INSTALL and QUIT. Once the bar is full the status reads DONE. B.Y.O. GAME, then the path '
  + `field swaps to ${WEB_URL} and the status to NO INSTALL NEEDED.`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" shape-rendering="crispEdges" role="img" aria-labelledby="ttl dsc">
<title id="ttl">${title}</title>
<desc id="dsc">${desc}</desc>
<style>
${css.join('\n')}
</style>
<defs>${glyphDefs}</defs>
${out}
</svg>
`;

// ---------------------------------------------------------------- text poster
// The same poster in plain characters, for the POSTER.TXT block in the README
// (and for anyone reading with images off): the lettering as half blocks, two
// unit rows per text row, between two runs of tape, then the strip, the tab
// line, the path field and the two buttons, which here are real links.
const LINKS = {
  install: '#run-it-locally',
  dont: `https://${WEB_URL}/`,
};
function textPoster(html = true) {
  const get = (x, y) => (y < BIG_H ? big.get(x, y) : y >= SMALL_Y ? small.get(x, y - SMALL_Y) : 0);
  const total = SMALL_Y + SMALL_H;
  const centre = (str, pad) => {
    const n = CW - len(str) - 2, l = Math.floor(n / 2);
    return `${pad.repeat(l)} ${str} ${pad.repeat(n - l)}`.trimEnd();
  };
  const rows = [centre(PLATE, '/')];
  for (let y = 0; y < total; y += 2) {
    let r = '';
    for (let x = 0; x < CW; x++) {
      const a = get(x, y), b = y + 1 < total ? get(x, y + 1) : 0;
      r += a && b ? '█' : a ? '▀' : b ? '▄' : ' ';
    }
    rows.push(r.trimEnd());
  }
  rows.push(centre(STRIP, '░'));
  rows.push(centre(TABS, ' '));
  const left = `RUN  ${RUN_CMD}`;
  const link = (label, href) => (html ? `<a href="${href}">${label}</a>` : label);
  const right = [`[ ${link('INSTALL', LINKS.install)} ]`, `[ ${link("DON'T", LINKS.dont)} ]`];
  const rightLen = len("[ INSTALL ]  [ DON'T ]");
  rows.push(`${left}${' '.repeat(CW - len(left) - rightLen)}${right.join('  ')}`);
  rows.push('/'.repeat(CW));
  const plain = rows.map((r) => r.replace(/<[^>]+>/g, ''));
  if (plain.some((r) => len(r) > CW || /\s$/.test(r) || /[&<>]/.test(r))) throw new Error('text poster row is too wide, padded or needs escaping');
  return rows.join('\n');
}

if (process.argv.includes('--txt')) {
  process.stdout.write(`${textPoster(false)}\n`);
} else {
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, svg);
  console.log(`wrote ${path.relative(process.cwd(), OUT)} (${(Buffer.byteLength(svg) / 1024).toFixed(1)} KB, ${W}x${H})`);
  // Keep the text poster in the README header in step with the lettering.
  if (fs.existsSync(MD)) {
    const md = fs.readFileSync(MD, 'utf8');
    const re = /(<!-- POSTER\.TXT:BEGIN[^>]*-->\r?\n\r?\n<pre>\r?\n)[\s\S]*?(\r?\n<\/pre>\r?\n\r?\n<!-- POSTER\.TXT:END -->)/;
    if (!re.test(md)) throw new Error('POSTER.TXT markers not found in the .md');
    const next = md.replace(re, (_, a, b) => `${a}${textPoster()}${b}`);
    if (next !== md) { fs.writeFileSync(MD, next); console.log(`updated POSTER.TXT in ${path.basename(MD)}`); }
  }
}
