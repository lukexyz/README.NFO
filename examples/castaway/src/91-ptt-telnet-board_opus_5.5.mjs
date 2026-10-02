#!/usr/bin/env node
// Castaway README header: "PTT telnet board" (91-ptt-telnet-board_opus_5.5).
// Style: catalogue entry asia-03, the Taiwanese telnet BBS dialect (MapleBBS family, the
// big one at National Taiwan University): an 80-column terminal where every Chinese
// character fills two cells, blue/white reverse header labels, a cyan rule, a column of
// one-line push / boo / arrow comments with yellow IDs and olive text, colour-coded
// popularity (HOT, then the "explode" character), coloured status-bar segments, and
// users' own pictures drawn in double-width block characters (eighth bars and corner
// triangles), each cell with one foreground and one background colour.
//
// Credited, not copied: no board, station, logo, user ID or comment from the real site
// appears here, no art is traced, and the GPL source was read for layout and colour rules
// only (no code or files taken from it). The station, board, IDs and every comment are
// invented for this file and describe only the Castaway project.
//
//   node examples/castaway/src/91-ptt-telnet-board_opus_5.5.mjs
// writes ../assets/91-ptt-telnet-board_opus_5.5.svg            (the article, with comments)
//        ../assets/91-ptt-telnet-board_opus_5.5-boards.svg     (the board list)
//   --proof=<file.svg>  also writes a glyph proof sheet (for drawing the font)
//
// Plain Node, no dependencies, deterministic (no clock, no Math.random).
//
// TEXT: no <text> anywhere. Half-width Latin is my own 8x16 bitmap font (1-pixel strokes,
// the thin look of the 16-pixel Ming-style terminal fonts people ran their clients in);
// Traditional Chinese is my own 16x16 bitmap set, drawn stroke by stroke below in a tiny
// line language and rasterised to pixels. Each glyph is one merged-rect <path> in <defs>
// and every character on screen is a <use>.
//
// PICTURE: painted at 8-pixel resolution, then each double-width cell becomes the block
// character that fits its 2 x 2 dots (see "the picture" below); the palm's crown, the raft
// and her are then placed cell by cell, as a block artist would type them. Block shapes
// are exact rects and triangles, drawn crisp.
//
// MOTION (CSS only, on the soundtrack's grid: 80 BPM, a bar every 3 s): a new comment
// lands at the bottom of the column on every bar and the column steps up one line,
// cycling through twelve comments (36 s: the last six lines repeat the first, a day later);
// she nods on every beat (0.75 s); the glints on the water swap every half bar. On the
// board list the cursor steps down one board per bar (60 s). prefers-reduced-motion
// leaves a complete still frame.

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const SLUG = '91-ptt-telnet-board_opus_5.5';
const OUT_MAIN = resolve(HERE, '..', 'assets', `${SLUG}.svg`);
const OUT_BOARDS = resolve(HERE, '..', 'assets', `${SLUG}-boards.svg`);
const PROOF = (process.argv.find((a) => a.startsWith('--proof=')) || '').slice(8);

// ================================================================== palette
// The 16 ANSI colours as the board's own web front end paints them (the 0x80 / 0xC0
// set): olive comment text, khaki-free. Index = SGR colour + 8 for the bold (bright) set.
const PAL = [
  '#000000', '#800000', '#008000', '#808000', '#000080', '#800080', '#008080', '#c0c0c0',
  '#808080', '#ff0000', '#00ff00', '#ffff00', '#0000ff', '#ff00ff', '#00ffff', '#ffffff',
];
const [BLK, RED, GRN, YEL, BLU, MAG, CYN, WHT, DGR, LRD, LGN, LYL, LBL, LMG, LCY, LWH] = PAL.map((_, i) => i);

// ================================================================== Latin 8x16
// My own thin face: caps on rows 2-12, x-height from row 5, descenders to row 15.
const LATIN = new Map(); // ch -> array of 16 row bitmasks (bit 7 = column 0)
function defL(ch, top, rows) {
  const g = new Array(16).fill(0);
  rows.trim().split(/\s+/).forEach((r, i) => {
    let v = 0;
    for (let c = 0; c < 8; c++) if (r[c] === '#') v |= 1 << (7 - c);
    g[top + i] = v;
  });
  LATIN.set(ch, g);
}
const CAPS = {
  A: '...#... ..#.#.. ..#.#.. .#...#. .#...#. #.....# #.....# ####### #.....# #.....# #.....#',
  B: '######. #.....# #.....# #.....# #....#. #####.. #....#. #.....# #.....# #.....# ######.',
  C: '..####. .#....# #...... #...... #...... #...... #...... #...... #...... .#....# ..####.',
  D: '#####.. #....#. #.....# #.....# #.....# #.....# #.....# #.....# #.....# #....#. #####..',
  E: '####### #...... #...... #...... #...... ######. #...... #...... #...... #...... #######',
  F: '####### #...... #...... #...... #...... ######. #...... #...... #...... #...... #......',
  G: '..####. .#....# #...... #...... #...... #..#### #.....# #.....# #.....# .#...## ..###.#',
  H: '#.....# #.....# #.....# #.....# #.....# ####### #.....# #.....# #.....# #.....# #.....#',
  I: '.#####. ...#... ...#... ...#... ...#... ...#... ...#... ...#... ...#... ...#... .#####.',
  J: '..##### .....#. .....#. .....#. .....#. .....#. .....#. .....#. #....#. #....#. .####..',
  K: '#.....# #....#. #...#.. #..#... #.#.... ##..... #.#.... #..#... #...#.. #....#. #.....#',
  L: '#...... #...... #...... #...... #...... #...... #...... #...... #...... #...... #######',
  M: '#.....# ##...## ##...## #.#.#.# #.#.#.# #..#..# #..#..# #.....# #.....# #.....# #.....#',
  N: '#.....# ##....# ##....# #.#...# #.#...# #..#..# #...#.# #...#.# #....## #....## #.....#',
  O: '..###.. .#...#. #.....# #.....# #.....# #.....# #.....# #.....# #.....# .#...#. ..###..',
  P: '######. #.....# #.....# #.....# #.....# ######. #...... #...... #...... #...... #......',
  Q: '..###.. .#...#. #.....# #.....# #.....# #.....# #.....# #..#..# #...#.# .#...#. ..###.#',
  R: '######. #.....# #.....# #.....# #.....# ######. #..#... #...#.. #....#. #.....# #.....#',
  S: '.#####. #.....# #...... #...... .#..... ..###.. .....#. ......# ......# #.....# .#####.',
  T: '####### ...#... ...#... ...#... ...#... ...#... ...#... ...#... ...#... ...#... ...#...',
  U: '#.....# #.....# #.....# #.....# #.....# #.....# #.....# #.....# #.....# #.....# .#####.',
  V: '#.....# #.....# #.....# .#...#. .#...#. .#...#. ..#.#.. ..#.#.. ..#.#.. ...#... ...#...',
  W: '#.....# #.....# #.....# #.....# #..#..# #..#..# #.#.#.# #.#.#.# ##...## ##...## #.....#',
  X: '#.....# #.....# .#...#. .#...#. ..#.#.. ...#... ..#.#.. .#...#. .#...#. #.....# #.....#',
  Y: '#.....# #.....# .#...#. .#...#. ..#.#.. ...#... ...#... ...#... ...#... ...#... ...#...',
  Z: '####### ......# .....#. .....#. ....#.. ...#... ..#.... .#..... .#..... #...... #######',
  0: '..###.. .#...#. #.....# #....## #...#.# #..#..# #.#...# ##....# #.....# .#...#. ..###..',
  1: '...#... ..##... .#.#... ...#... ...#... ...#... ...#... ...#... ...#... ...#... .#####.',
  2: '.#####. #.....# ......# ......# .....#. ....#.. ...#... ..#.... .#..... #...... #######',
  3: '.#####. #.....# ......# ......# ......# ..####. ......# ......# ......# #.....# .#####.',
  4: '.....#. ....##. ...#.#. ..#..#. .#...#. #....#. ####### .....#. .....#. .....#. .....#.',
  5: '####### #...... #...... #...... ######. ......# ......# ......# ......# #.....# .#####.',
  6: '..####. .#..... #...... #...... ######. #.....# #.....# #.....# #.....# #.....# .#####.',
  7: '####### #.....# ......# .....#. .....#. ....#.. ....#.. ...#... ...#... ...#... ...#...',
  8: '.#####. #.....# #.....# #.....# .#####. #.....# #.....# #.....# #.....# #.....# .#####.',
  9: '.#####. #.....# #.....# #.....# #.....# .###### ......# ......# ......# .....#. .####..',
};
for (const [ch, rows] of Object.entries(CAPS)) defL(ch, 2, rows);
const LOWER = {
  a: [5, '.#####. ......# ......# .###### #.....# #.....# #....## .####.#'],
  b: [2, '#...... #...... #...... #.###.. ##...#. #.....# #.....# #.....# #.....# ##...#. #.###..'],
  c: [5, '..####. .#....# #...... #...... #...... #...... .#....# ..####.'],
  d: [2, '......# ......# ......# ..###.# .#...## #.....# #.....# #.....# #.....# .#...## ..###.#'],
  e: [5, '..###.. .#...#. #.....# ####### #...... #...... .#....# ..####.'],
  f: [2, '...###. ..#...# ..#.... ..#.... ######. ..#.... ..#.... ..#.... ..#.... ..#.... ..#....'],
  g: [5, '..###.# .#...## #.....# #.....# #.....# .#...## ..###.# ......# ......# #....#. .####..'],
  h: [2, '#...... #...... #...... #.###.. ##...#. #.....# #.....# #.....# #.....# #.....# #.....#'],
  i: [2, '...#... ....... ....... .###... ...#... ...#... ...#... ...#... ...#... ...#... .#####.'],
  j: [2, '.....#. ....... ....... ...###. .....#. .....#. .....#. .....#. .....#. .....#. .....#. #....#. .####..'],
  k: [2, '#...... #...... #...... #....#. #...#.. #..#... #.#.... ###.... #..#... #...#.. #....#.'],
  l: [2, '.###... ...#... ...#... ...#... ...#... ...#... ...#... ...#... ...#... ...#... .#####.'],
  m: [5, '###.##. #..#..# #..#..# #..#..# #..#..# #..#..# #..#..# #..#..#'],
  n: [5, '#.###.. ##...#. #.....# #.....# #.....# #.....# #.....# #.....#'],
  o: [5, '..###.. .#...#. #.....# #.....# #.....# #.....# .#...#. ..###..'],
  p: [5, '#.###.. ##...#. #.....# #.....# #.....# #.....# ##...#. #.###.. #...... #...... #......'],
  q: [5, '..###.# .#...## #.....# #.....# #.....# #.....# .#...## ..###.# ......# ......# ......#'],
  r: [5, '#.####. ##....# #...... #...... #...... #...... #...... #......'],
  s: [5, '.#####. #.....# #...... .#####. ......# ......# #.....# .#####.'],
  t: [3, '..#.... ..#.... ######. ..#.... ..#.... ..#.... ..#.... ..#.... ..#...# ...###.'],
  u: [5, '#.....# #.....# #.....# #.....# #.....# #.....# #....## .####.#'],
  v: [5, '#.....# #.....# .#...#. .#...#. ..#.#.. ..#.#.. ...#... ...#...'],
  w: [5, '#.....# #.....# #..#..# #..#..# #..#..# #.#.#.# ##...## #.....#'],
  x: [5, '#.....# .#...#. ..#.#.. ...#... ...#... ..#.#.. .#...#. #.....#'],
  y: [5, '#.....# #.....# #.....# #.....# #.....# .#...## ..###.# ......# ......# #....#. .####..'],
  z: [5, '####### .....#. ....#.. ...#... ..#.... .#..... #...... #######'],
};
for (const [ch, [top, rows]] of Object.entries(LOWER)) defL(ch, top, rows);
const PUNCT = {
  '.': [11, '..##... ..##...'],
  ',': [11, '..##... ..##... ...#... ..#....'],
  ':': [5, '..##... ..##... ....... ....... ....... ....... ..##... ..##...'],
  ';': [5, '..##... ..##... ....... ....... ....... ....... ..##... ..##... ...#... ..#....'],
  '!': [2, '...#... ...#... ...#... ...#... ...#... ...#... ...#... ...#... ....... ...#... ...#...'],
  '?': [2, '.#####. #.....# ......# ......# .....#. ....#.. ...#... ...#... ....... ...#... ...#...'],
  "'": [2, '...#... ...#... ...#...'],
  '"': [2, '.#...#. .#...#. .#...#.'],
  '`': [2, '..#.... ...#...'],
  '-': [7, '.#####.'],
  '_': [14, '########'],
  '=': [6, '####### ....... ....... #######'],
  '+': [4, '...#... ...#... ...#... ####### ...#... ...#... ...#...'],
  '*': [4, '...#... #..#..# .#.#.#. ..###.. .#.#.#. #..#..# ...#...'],
  '/': [2, '......# ......# .....#. .....#. ....#.. ...#... ..#.... .#..... .#..... #...... #......'],
  '\\': [2, '#...... #...... .#..... .#..... ..#.... ...#... ....#.. .....#. .....#. ......# ......#'],
  '|': [1, '...#... ...#... ...#... ...#... ...#... ...#... ...#... ...#... ...#... ...#... ...#... ...#... ...#... ...#...'],
  '(': [2, '....#.. ...#... ..#.... ..#.... .#..... .#..... .#..... ..#.... ..#.... ...#... ....#..'],
  ')': [2, '..#.... ...#... ....#.. ....#.. .....#. .....#. .....#. ....#.. ....#.. ...#... ..#....'],
  '[': [1, '.####.. .#..... .#..... .#..... .#..... .#..... .#..... .#..... .#..... .#..... .#..... .#..... .####..'],
  ']': [1, '.####.. ....#.. ....#.. ....#.. ....#.. ....#.. ....#.. ....#.. ....#.. ....#.. ....#.. ....#.. .####..'],
  '<': [3, '.....#. ....#.. ...#... ..#.... .#..... ..#.... ...#... ....#.. .....#.'],
  '>': [3, '.#..... ..#.... ...#... ....#.. .....#. ....#.. ...#... ..#.... .#.....'],
  '#': [2, '..#.#.. ..#.#.. ..#.#.. ####### ..#.#.. ..#.#.. ..#.#.. ####### ..#.#.. ..#.#.. ..#.#..'],
  '%': [2, '.##...# #..#..# #..#.#. .##..#. ....#.. ...#... ..#.... .#..##. .#.#..# #..#..# #...##.'],
  '&': [2, '..##... .#..#.. .#..#.. .#..#.. ..##... ..#.... .#.#..# #...#.# #....#. #...#.# .###..#'],
  '@': [2, '..###.. .#...#. #.....# #..##.# #.#.#.# #.#.#.# #.#.#.# #..##.. #...... .#....# ..####.'],
  '~': [6, '.##...# #..#..# #...##.'],
  '^': [2, '...#... ..#.#.. .#...#.'],
};
for (const [ch, [top, rows]] of Object.entries(PUNCT)) defL(ch, top, rows);
LATIN.set(' ', new Array(16).fill(0));

// ================================================================== wide 16x16
// Traditional Chinese and the double-width Big5 symbols, drawn in a little line language
// on a 15 x 15 box (x 0-14, y 0-14; the glyph sits one row down in its 16 x 16 cell):
//   hY,X0,X1  horizontal   vX,Y0,Y1  vertical   lX0,Y0,X1,Y1  straight line (Bresenham)
//   rX0,Y0,X1,Y1  rectangle outline   pX,Y[,X,Y...]  single pixels
// Radicals that repeat are small functions, so a 木 or a 言 looks the same everywhere.
const WIDE = new Map(); // ch -> Set of "x,y"
function raster(src) {
  const px = new Set();
  const put = (x, y) => px.add(`${x},${y}`);
  const line = (x0, y0, x1, y1) => {
    const dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1;
    const dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    for (;;) {
      put(x0, y0);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
  };
  for (const m of src.matchAll(/([hvlrpc])(-?\d+(?:,-?\d+)*(?:,f)?)/g)) {
    const fill = m[2].endsWith(',f');
    const n = m[2].replace(/,f$/, '').split(',').map(Number);
    switch (m[1]) {
      case 'c': for (let y = n[1] - n[2] - 1; y <= n[1] + n[2] + 1; y++) for (let x = n[0] - n[2] - 1; x <= n[0] + n[2] + 1; x++) {
        const d = Math.hypot(x - n[0], y - n[1]);
        if (fill ? d <= n[2] + 0.4 : Math.abs(d - n[2]) < 0.5) put(x, y);
      } break;
      case 'h': line(n[1], n[0], n[2], n[0]); break;
      case 'v': line(n[0], n[1], n[0], n[2]); break;
      case 'l': line(n[0], n[1], n[2], n[3]); break;
      case 'r': line(n[0], n[1], n[2], n[1]); line(n[0], n[3], n[2], n[3]);
        line(n[0], n[1], n[0], n[3]); line(n[2], n[1], n[2], n[3]); break;
      case 'p': for (let i = 0; i < n.length; i += 2) put(n[i], n[i + 1]); break;
    }
  }
  return px;
}
// bitmap fragments: rows of '#'/'.' placed at (x0, y0)
const bits = (x0, y0, rows) => rows.trim().split(/\s+/).flatMap((r, j) =>
  [...r].map((c, i) => (c === '#' ? `p${x0 + i},${y0 + j}` : '')).filter(Boolean)).join(' ');

// radicals ---------------------------------------------------------------
const MU = (o = 0) => `h3,${o},${o + 4} v${o + 2},0,14 l${o + 1},5,${o},8 p${o + 3},5,${o + 4},6`;      // 木 (left)
const SHOU = (o = 0) => `h4,${o},${o + 4} v${o + 2},0,13 p${o + 1},14 l${o},11,${o + 4},8`;          // 扌
const REN = (o = 0) => `l${o + 3},0,${o},5 v${o + 2},2,14`;                                       // 亻
const YAN = (o = 0) => `p${o + 2},0 h2,${o},${o + 4} h4,${o + 1},${o + 3} h6,${o + 1},${o + 3} r${o + 1},8,${o + 4},13`; // 言
const SHUI = (o = 0) => `p${o + 1},1,${o + 2},2,${o},5,${o + 1},6 l${o},13,${o + 3},9`;            // 氵
const MEN = 'r0,0,5,5 h2,0,5 v0,6,14 r9,0,14,5 h2,9,14 v14,6,13 p13,14';                        // 門
const CHUO = 'p1,0,2,1 h4,0,2 p2,5,1,6 v2,7,11 p1,12,0,13 l3,12,4,13 h13,4,14';                    // 辶
const KOU = (x0, y0, x1, y1) => `r${x0},${y0},${x1},${y1}`;                                       // 口
const RI = (x0, y0, x1, y1, m = (y0 + y1) >> 1) => `r${x0},${y0},${x1},${y1} h${m},${x0},${x1}`;   // 日
const YE = (x0) => `h0,${x0},14 p${(x0 + 15) >> 1},1 r${x0 + 1},2,13,10 h4,${x0 + 1},13 h7,${x0 + 1},13 p${x0 + 2},11,${x0 + 1},12 p12,11,13,12`; // 頁 (right)
const JIN = (o = 0) => `l${o + 3},0,${o},3 l${o + 3},0,${o + 6},3 h5,${o + 1},${o + 5} h8,${o + 1},${o + 5} v${o + 3},5,13 p${o + 1},10,${o + 5},10 h13,${o},${o + 2} p${o + 4},12,${o + 5},11`; // 金 (left)
const SI = (o = 0) => bits(o, 0, '..#.. .#... #..#. .##.. .#..# ##### ..#.. #.#.# ..#.. ..#..') + ` v${o + 2},10,14`; // 糸 (left)

// glyphs (first pass; refined against the proof sheet) --------------------
const HAN = {
  '一': 'h7,1,13',
  '十': 'h6,0,14 v7,0,14',
  '人': 'v7,0,4 l6,5,0,13 l8,6,14,14',
  '小': 'v7,0,13 p6,14,5,13 l4,4,1,10 l10,4,13,9',
  '上': 'v6,0,14 h5,7,12 h14,0,14',
  '中': 'r1,3,13,10 v7,0,14',
  '天': 'h2,2,12 h6,0,14 v7,2,6 l6,7,1,13 p0,14 l8,7,14,14',
  '四': 'r0,1,14,14 v5,1,7 l4,8,2,10 v9,1,9 h10,10,13',
  '文': 'v7,0,1 h3,0,14 l3,4,13,14 l11,4,1,14',
  '子': 'h1,2,11 l11,2,8,4 v7,5,13 p6,14,5,13 h8,0,14',
  '目': 'r3,0,11,14 h5,4,10 h9,4,10',
  '日': 'r3,1,11,13 h7,4,10',
  '自': 'p7,0,6,1 r2,2,12,14 h6,3,11 h10,3,11',
  '主': 'p7,0,8,1 h3,2,12 h8,3,11 h14,1,13 v7,3,14',
  '公': 'l5,1,1,6 l9,1,13,6 l7,7,3,12 h13,3,12 l10,10,12,12',
  '告': 'l5,0,3,2 h3,3,11 v7,0,7 h6,0,14 r2,9,12,14',
  '個': REN() + ' r5,0,14,14 h3,7,12 v9,1,7 r7,8,11,12',
  '座': 'v8,0,1 h2,1,14 v1,2,10 l1,11,0,14 l5,4,3,8 l5,6,7,8 l11,4,9,8 l11,6,13,8 v8,3,13 h10,4,12 h14,2,14',
  '島': 'p6,0 r2,1,11,5 h3,2,11 v2,6,7 h7,2,13 v13,8,13 p12,14,11,13 v4,9,11 v7,9,11 v10,9,11 h11,4,10',
  '樹': 'h3,0,3 v2,0,14 l1,5,0,8 p3,5 h1,4,9 v6,0,3 h3,5,8 r4,5,9,8 p5,10,8,10 h12,4,9 h4,10,14 v13,1,13 p12,14 p11,8,11,9',
  '椰': MU() + ' h1,4,9 v5,1,10 v8,1,14 h4,5,8 h7,5,8 l4,11,9,9 v10,0,14 h0,10,13 l13,1,11,4 l12,5,13,7 l13,8,11,10',
  '棵': MU() + ' r5,0,13,6 h3,5,13 v9,0,6 h9,4,14 v9,7,14 l8,10,5,13 l10,10,13,13',
  '標': MU() + ' h0,5,14 r6,2,13,6 v8,2,6 v11,2,6 h8,7,12 h10,5,14 v9,10,13 p8,14 l7,12,5,14 l11,12,13,14',
  '題': 'r1,0,5,4 h2,1,5 h6,0,6 v3,7,12 h9,4,5 l2,8,0,11 l1,12,2,13 h14,3,14 h0,7,14 p10,1 r8,2,13,10 h4,8,13 h7,8,13 p9,11,8,12 p12,11,13,12',
  '時': 'r0,2,4,11 h6,1,3 v10,0,5 h2,7,13 h5,6,14 h8,6,14 v12,8,13 p11,14,10,13 p8,10,9,11',
  '間': MEN + ' r4,7,10,13 h10,5,9',
  '開': MEN + ' h7,3,11 h10,2,12 v5,7,11 l4,12,3,13 v9,7,13',
  '作': REN() + ' l9,0,6,4 h2,7,14 v7,3,14 h7,8,13 h11,8,13',
  '者': 'h2,2,10 v6,0,4 h5,0,14 l12,1,5,8 r3,8,11,14 h11,4,10',
  '看': 'l12,0,4,1 h3,2,12 h5,0,14 l7,3,1,12 r5,7,13,14 h9,6,12 h11,6,12',
  '板': MU() + ' h1,6,14 v6,1,9 l6,10,4,14 h5,7,13 l13,6,8,13 l9,8,14,14',
  '發': bits(0, 0, '.####....#..#.. ....#.#...##... ...#...#.#..#.. ..#.#...#....#. .#...#.#......#') + ' h5,1,5 v5,5,8 h8,1,5 v1,8,11 h11,1,5 v5,11,13 p4,14 h5,9,12 v9,5,8 p8,9 v12,5,8 p13,9,14,9 h10,8,13 l13,10,9,14 l9,11,14,14',
  '信': REN() + ' p9,0 h2,5,14 h4,6,13 h6,6,13 r6,9,13,14',
  '站': 'p2,0,3,1 h3,0,5 l1,5,2,8 l5,5,4,9 l0,12,5,10 v9,0,7 h3,10,13 r7,8,14,14',
  '來': 'h2,0,14 v7,0,14 l3,4,1,9 l3,6,5,9 l11,4,9,9 l11,6,13,9 l6,10,1,14 l8,10,13,14',
  '頂': 'h1,0,6 v3,1,13 p2,14,1,13 ' + YE(7),
  '推': SHOU() + ' l9,0,6,4 v7,3,14 p11,0,12,1 h2,8,14 v10,2,14 h5,8,13 h8,8,13 h11,8,13 h14,8,14',
  '噓': 'r0,4,3,9 v9,0,2 h1,9,13 h3,6,14 v6,3,11 l6,12,5,14 p13,4 h5,8,12 v9,5,7 h7,9,13 v8,9,12 v11,9,12 p7,10,12,10 h13,7,14',
  '瀏': SHUI() + ' r4,1,6,4 v8,0,5 h1,8,10 v10,1,4 p9,4 l7,5,4,8 l7,5,10,8 h9,5,9 h11,5,9 v7,9,14 p5,12,9,12 h14,4,10 v12,2,10 v14,0,13 p13,14',
  '覽': 'h0,0,5 v0,0,6 h6,0,5 r2,2,5,4 l10,0,8,2 h1,10,14 l10,2,9,5 p12,3,13,4 h5,8,14 r3,7,11,11 h9,3,11 l5,12,2,14 v8,12,13 h14,8,13',
  '第': 'l3,0,1,3 h1,2,6 p4,2,5,3 l10,0,8,3 h1,9,14 p11,2,12,3 h5,2,12 v12,5,8 h8,2,12 v2,8,11 h11,2,13 v13,11,13 p12,14 v7,4,14 l6,11,3,14',
  '頁': 'h0,0,14 p7,1 r2,2,12,10 h4,2,12 h7,2,12 l5,11,1,14 l9,11,13,14',
  '前': 'p3,0,4,1,11,0,10,1 h2,0,14 v1,4,13 p0,14 h4,1,7 v7,4,13 p6,14 h7,1,7 h10,1,7 v10,5,11 v13,4,13 p12,14',
  '顯': 'r1,0,6,4 h2,1,6 ' + bits(0, 5, '..#...#. .#...#.. #.#.#.#. .#...#.. #.#.#.#. ..#...#. ######## .#.#.#.# #.#..#.#') + ' ' + YE(8),
  '示': 'h1,2,12 h5,0,14 v7,5,13 p6,14,5,13 l4,9,1,13 l10,9,13,12',
  '行': 'l4,0,1,3 l5,4,0,9 v3,6,14 h2,7,13 h6,6,14 v11,6,13 p10,14,9,13',
  '離': 'v3,0,1 h1,0,7 l2,3,5,6 l5,3,2,6 v1,3,6 v6,3,6 h6,1,6 v0,8,14 h8,0,7 v7,8,13 p6,14 l4,9,2,13 h13,2,5 p5,12 l10,0,8,4 v9,3,14 p12,0 h2,9,14 v11,2,14 h5,10,13 h8,10,13 h11,10,13 h14,9,14',
  '按': SHOU() + ' v10,0,1 h2,6,14 p6,3,14,3 l9,4,7,10 h8,6,14 l12,9,8,14 l8,11,14,14',
  '鍵': JIN() + ' h1,8,13 h3,7,14 h5,8,13 h7,9,13 v11,0,10 l7,6,6,9 l6,10,8,12 h13,8,14 l7,12,8,13',
  '說': YAN() + ' p7,0,8,1,13,0,12,1 r7,2,13,6 v9,7,11 l8,12,6,14 v11,7,13 h14,12,14 p14,13',
  '明': 'r0,2,4,11 h6,1,3 h0,7,13 v7,0,11 l7,12,5,14 v13,0,13 p12,14 h4,8,12 h8,8,12',
  '列': 'h1,0,7 l3,1,0,6 h4,2,6 l6,5,1,13 p3,8,4,9 v10,3,11 v13,0,13 p12,14',
  '表': 'h1,2,12 h4,3,11 h7,0,14 v7,0,7 l6,8,1,13 l4,11,4,14 l4,14,6,12 l12,8,10,10 l8,9,14,14',
  '回': 'r1,0,13,14 r4,4,10,10',
  '層': 'h0,1,13 v13,0,3 h3,1,13 v1,0,9 l1,10,0,14 p5,4,6,5,11,4,10,5 r4,6,12,9 v8,6,9 r5,10,11,14 h12,5,11',
  '閱': MEN + ' p4,6,9,6 r4,7,9,10 l5,11,3,14 v8,11,14 h14,8,11',
  '讀': YAN() + ' v10,0,3 h1,7,13 h3,8,12 r6,4,14,7 v9,4,7 v11,4,7 r7,8,13,12 h10,7,13 p8,13,7,14,12,13,13,14',
  '選': CHUO + ' r5,0,8,2 v5,2,4 h4,5,8 r10,0,13,2 v10,2,4 h4,10,13 v7,5,9 v11,5,9 h6,5,13 h9,4,14 p6,11,12,11',
  '擇': SHOU() + ' r6,0,14,3 v9,0,3 v11,0,3 h5,7,13 h8,6,14 h11,7,13 v10,4,14 p8,9,12,9',
  '求': 'p11,0,12,1 h3,0,14 v7,3,13 p6,14,5,13 l1,6,4,9 l1,13,5,10 l13,5,9,8 l9,9,14,14',
  '助': 'h0,1,5 v1,0,12 v5,0,12 h4,1,5 h8,1,5 h12,0,6 h3,7,14 v14,3,13 p13,14,12,13 v10,0,8 l10,9,7,14',
  '編': SI() + ' p10,0 h1,7,13 r7,2,13,4 v7,5,9 l7,10,6,14 r8,7,14,14 v10,7,14 v12,7,14 h10,8,14',
  '號': 'r1,0,5,4 h6,0,6 l2,7,1,9 h9,1,6 v6,9,13 p5,14 v10,0,2 h1,10,14 h3,7,14 v7,3,10 l7,11,6,14 p14,4 h6,9,13 v11,7,12 h13,11,14',
  '類': 'p0,0,4,0 h2,0,5 v2,0,6 p1,4,0,5,3,4,4,5 h9,0,6 v3,7,9 l3,10,0,14 l4,10,6,14 p5,7 ' + YE(7),
  '別': 'r1,0,6,5 h8,0,7 v7,8,13 p6,14 l3,9,1,14 v10,2,11 v13,0,13 p12,14',
  '敘': 'l3,0,0,3 l3,0,6,3 h4,1,5 h6,0,6 v3,6,13 p2,14 l2,9,0,12 l4,9,6,12 l9,0,7,4 h3,8,14 l12,4,7,14 l9,8,14,14',
  '述': CHUO + ' h3,4,14 v9,0,11 l8,5,4,10 l10,5,14,9 p12,0,13,1',
  '氣': 'l5,0,2,4 h1,4,14 h4,4,11 h7,2,12 v12,7,13 p13,14,14,13 p3,8,4,9,9,8,8,9 h10,2,10 v6,8,14 l5,11,2,14 l7,11,10,14',
  '排': SHOU() + ' v9,0,14 h2,6,9 h6,6,9 h10,5,9 v11,0,14 h2,11,14 h6,11,14 h10,11,14',
  '程': 'l5,0,1,1 h4,0,5 v3,1,14 l2,6,0,10 p4,6,5,7 r8,0,13,4 h7,7,14 v10,7,14 h10,8,13 h14,6,14',
  '音': 'v7,0,1 h2,2,12 p4,4,5,5 l10,4,9,6 h6,0,14 r3,8,11,14 h11,3,11',
  '樂': 'p7,0 r5,1,9,6 h3,5,9 ' + bits(0, 0, '.#.. #... .#.# ..#. .#.. ####') + ' ' + bits(11, 0, '.#.. #... .#.# ..#. .#.. ####') + ' h8,0,14 v7,7,14 l6,9,1,13 l8,9,13,13',
  '畫': 'h1,2,12 v7,0,5 h3,0,14 h5,2,12 r2,7,12,12 v7,7,12 h10,2,12 h14,1,13',
  '面': 'h0,0,14 p7,1,6,2 r1,3,13,14 v5,3,14 v9,3,14 h7,5,9 h10,5,9',
  '周': 'h0,1,13 v1,0,12 p0,13,0,14 v13,1,13 p12,14 h4,4,10 v7,2,7 h7,3,11 r4,9,10,13',
  '每': 'l5,0,2,3 h2,4,13 h5,3,12 l3,5,2,13 v12,5,13 p11,14 h9,0,14 h13,2,11 p7,6,7,7,7,11,7,12',
  '都': 'h2,1,7 v4,0,4 h5,0,8 l8,1,2,8 r1,8,7,14 h11,2,6 v10,0,14 h0,10,13 l13,1,11,4 l12,5,13,7 l13,8,11,10',
  '是': 'r3,0,11,6 h3,4,10 h8,0,14 v7,9,13 h11,8,11 v3,10,12 l3,12,1,14 h13,4,14 p14,14',
  '晴': 'r0,2,4,11 h6,1,3 h1,6,14 v10,0,5 h3,7,13 h5,6,14 v7,7,13 p6,14 h7,7,13 v13,7,13 p12,14 h9,7,13 h11,7,13',
  '線': SI() + ' p10,0 r7,1,13,6 h4,7,13 v10,7,13 p9,14,8,13 l7,8,9,10 l13,8,11,10 l11,10,14,14 l8,10,6,13',
  '我': 'l7,0,2,2 h4,0,14 v5,2,13 p4,14,3,13 l0,11,7,8 l8,0,14,14 l13,7,9,11 p11,1,12,2',
  '呼': 'r0,3,3,10 l13,0,6,2 p7,4,8,5,12,4,11,5 h7,5,14 v10,3,13 p9,14,8,13',
  '叫': 'r0,3,4,10 v7,1,11 l7,11,10,8 v12,0,14',
  '器': 'r1,0,5,3 r9,0,13,3 h6,0,14 v7,4,6 l6,7,2,9 l8,7,12,9 p10,4,11,5 r1,11,5,14 r9,11,13,14',
  '打': SHOU() + ' h2,6,14 v11,2,13 p10,14,9,13',
  '常': 'v7,0,2 p3,1,4,2,11,1,10,2 h3,0,14 v0,4,5 v14,4,5 r4,5,10,8 h10,2,12 v2,10,13 v12,10,13 p11,14 v7,9,14',
  '爆':'p0,4,1,5,4,3 v2,1,8 l2,9,0,13 l3,10,4,12 r7,0,12,4 h2,7,12 v8,5,8 v11,5,8 h6,6,13 h8,5,14 v10,9,13 p9,14 l7,10,6,12 l13,10,14,12 p8,12,12,12',
};
// double-width Big5 symbols
const SYM = {
  '※': 'l3,3,11,11 l11,3,3,11 p7,1,1,7,13,7,7,13',
  '‧': 'p6,6,7,6,6,7,7,7',
  '→': 'h7,1,13 l13,7,10,4 l13,7,10,10',
  '←': 'h7,1,13 l1,7,4,4 l1,7,4,10',
  '↑': 'v7,1,13 l7,1,4,4 l7,1,10,4',
  '↓': 'v7,1,13 l7,13,4,10 l7,13,10,10',
  '，': 'p2,11,3,11,3,12,2,13',
  '。': bits(1, 10, '.##. #..# #..# .##.'),
  '【': bits(9, 0, '##### ####. ###.. ###.. ###.. ###.. ###.. ###.. ###.. ###.. ###.. ###.. ###.. ####. #####'),
  '】': bits(1, 0, '##### .#### ..### ..### ..### ..### ..### ..### ..### ..### ..### ..### ..### .#### #####'),
  '《': 'l13,2,9,7 l9,7,13,12 l11,2,7,7 l7,7,11,12',
  '》': 'l1,2,5,7 l5,7,1,12 l3,2,7,7 l7,7,3,12',
  '◎': 'c7,7,6 c7,7,3',
  '●': 'c7,7,6,f',
  '□': 'r2,2,12,12',
  'ˇ': 'l5,1,7,3 l9,1,7,3',
  '─': 'h7,0,15',
};

function defW(ch, src) { WIDE.set(ch, raster(src)); }
for (const [ch, src] of Object.entries(HAN)) defW(ch, src);
for (const [ch, src] of Object.entries(SYM)) defW(ch, src);

// ================================================================== proof sheet
function glyphRects(px, ox, oy, s) {
  let d = '';
  for (const k of px) {
    const [x, y] = k.split(',').map(Number);
    d += `M${ox + x * s} ${oy + y * s}h${s}v${s}h${-s}z`;
  }
  return d;
}
if (PROOF) {
  const S = 6, CELL = 16 * S + 24;
  const chars = [...WIDE.keys()];
  const cols = 10;
  const rows = Math.ceil(chars.length / cols);
  let body = '';
  chars.forEach((ch, i) => {
    const ox = 12 + (i % cols) * CELL, oy = 12 + Math.floor(i / cols) * CELL;
    body += `<rect x="${ox}" y="${oy}" width="${16 * S}" height="${16 * S}" fill="#112"/>`;
    for (let k = 0; k <= 16; k += 1) {
      body += `<path d="M${ox} ${oy + k * S}h${16 * S}M${ox + k * S} ${oy}v${16 * S}" stroke="#223" stroke-width=".5"/>`;
    }
    body += `<path d="${glyphRects(WIDE.get(ch), ox, oy + S, S)}" fill="#ffd"/>`;
    // 1:1 and 2:1 renditions underneath
    body += `<path d="${glyphRects(WIDE.get(ch), ox, oy + 16 * S + 4, 1)}" fill="#ff0"/>`;
    body += `<path d="${glyphRects(WIDE.get(ch), ox + 22, oy + 16 * S + 2, 1.25)}" fill="#ccc"/>`;
  });
  // Latin sample
  const sample = 'The quick brown fox jumps over 0123456789 ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz .,:;!?\'"-_=+*/\\|()[]<>#%&@~^';
  let lat = '';
  [...sample].forEach((ch, i) => {
    const g = LATIN.get(ch);
    if (!g) return;
    for (let y = 0; y < 16; y++) for (let x = 0; x < 8; x++) if ((g[y] >> (7 - x)) & 1) lat += `M${12 + (i % 64) * 16 + x * 2} ${12 + rows * CELL + Math.floor(i / 64) * 36 + y * 2}h2v2h-2z`;
  });
  const W = 24 + cols * CELL, H = rows * CELL + 120;
  writeFileSync(PROOF, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#000"/>${body}<path d="${lat}" fill="#fff"/></svg>`);
  console.log('proof ->', PROOF, chars.length, 'wide glyphs');
}

// ================================================================== glyph <defs>
// Greedy rect merge: horizontal runs, stacked when they line up exactly.
function mergedPath(w, h, on, ox = 0, oy = 0) {
  const rects = [];
  let open = [];
  for (let y = 0; y < h; y++) {
    const runs = [];
    for (let x = 0; x < w;) {
      if (on(x, y)) { const s = x; while (x < w && on(x, y)) x++; runs.push([s, x - s]); } else x++;
    }
    const next = [];
    for (const [x0, rw] of runs) {
      const o = open.find((r) => r.x === x0 && r.w === rw && r.y + r.h === y);
      if (o) { o.h++; next.push(o); } else { const r = { x: x0, w: rw, y, h: 1 }; rects.push(r); next.push(r); }
    }
    open = next;
  }
  return rects.map((r) => `M${ox + r.x} ${oy + r.y}h${r.w}v${r.h}h${-r.w}z`).join('');
}
const GLYPH_IDS = new Map();
function gid(ch) {
  if (!GLYPH_IDS.has(ch)) {
    if (!LATIN.has(ch) && !WIDE.has(ch)) throw new Error(`no glyph for ${JSON.stringify(ch)}`);
    GLYPH_IDS.set(ch, `g${GLYPH_IDS.size.toString(36)}`);
  }
  return GLYPH_IDS.get(ch);
}
function glyphDefs(used) {
  return [...used].map((ch) => {
    let d;
    if (WIDE.has(ch)) { const px = WIDE.get(ch); d = mergedPath(16, 16, (x, y) => px.has(`${x},${y - 1}`)); }
    else { const g = LATIN.get(ch); d = mergedPath(8, 16, (x, y) => (g[y] >> (7 - x)) & 1); }
    return `<path id="${gid(ch)}" d="${d}"/>`;
  }).join('');
}

// ================================================================== the terminal
const COLS = 80, CW = 8, CH = 16;
const isWide = (ch) => WIDE.has(ch);
const colsOf = (s) => [...s].reduce((a, ch) => a + (isWide(ch) ? 2 : 1), 0);
const newScreen = (rows) => Array.from({ length: rows }, () => Array.from({ length: COLS }, () => ({ ch: ' ', fg: WHT, bg: BLK })));
function put(scr, r, c, text, fg = WHT, bg = BLK) {
  for (const ch of text) {
    const w = isWide(ch) ? 2 : 1;
    if (c + w > COLS) throw new Error(`row ${r} overflows at "${text}"`);
    gid(ch);
    scr[r][c] = { ch, fg, bg };
    if (w === 2) scr[r][c + 1] = { cont: true, fg, bg };
    c += w;
  }
  return c;
}
const segs = (scr, r, c, list) => list.reduce((cc, [t, fg, bg]) => put(scr, r, cc, t, fg, bg), c);
function fillRow(scr, r, c0, c1, bg, fg = WHT) { for (let c = c0; c < c1; c++) scr[r][c] = { ch: ' ', fg, bg }; }
const putArt = (scr, r, c, a) => { scr[r][c] = { art: a.g, fg: a.fg, bg: a.bg }; scr[r][c + 1] = { cont: true, fg: a.fg, bg: a.bg }; };

// Block-character shapes in a 16 x 16 double-width cell (the Big5 block set: eighth
// bars, the 1/8 top and right edges, four corner triangles, full block).
const EIGHTHS_LO = ' ▁▂▃▄▅▆▇█';
const EIGHTHS_LEFT = ' ▏▎▍▌▋▊▉█';
function artShape(g, x, y) {
  let k = EIGHTHS_LO.indexOf(g);
  if (g === '█') return `M${x} ${y}h16v16h-16z`;
  if (k > 0) return `M${x} ${y + 16 - 2 * k}h16v${2 * k}h-16z`;
  k = EIGHTHS_LEFT.indexOf(g);
  if (k > 0) return `M${x} ${y}h${2 * k}v16h${-2 * k}z`;
  switch (g) {
    case '▔': return `M${x} ${y}h16v2h-16z`;
    case '▕': return `M${x + 14} ${y}h2v16h-2z`;
    case '◢': return `M${x + 16} ${y}v16h-16z`;
    case '◣': return `M${x} ${y}v16h16z`;
    case '◤': return `M${x} ${y}h16l-16 16z`;
    case '◥': return `M${x} ${y}h16v16z`;
  }
  throw new Error(`no art shape ${g}`);
}

// Render a screen to SVG layers. Background runs and art shapes are merged per colour.
function renderScreen(scr, ox = 0, oy = 0) {
  const bg = new Map(), art = new Map(), txt = new Map();
  const add = (m, k, s) => m.set(k, (m.get(k) || '') + s);
  scr.forEach((row, r) => {
    const y = oy + r * CH;
    let c = 0;
    while (c < COLS) {
      const b = row[c].bg;
      let e = c;
      while (e < COLS && row[e].bg === b) e++;
      if (b !== BLK) add(bg, b, `M${ox + c * CW} ${y}h${(e - c) * CW}v${CH}h${-(e - c) * CW}z`);
      c = e;
    }
    row.forEach((cell, c2) => {
      const x = ox + c2 * CW;
      if (cell.art && cell.art !== ' ') add(art, cell.fg, artShape(cell.art, x, y));
      else if (cell.ch && cell.ch !== ' ') add(txt, cell.fg, `<use href="#${gid(cell.ch)}" x="${x}" y="${y}"/>`);
    });
  });
  let out = '';
  for (const [k, d] of bg) out += `<path class="k${k}" d="${d}"/>`;
  for (const [k, d] of art) out += `<path class="k${k}" d="${d}"/>`;
  for (const [k, u] of txt) out += `<g class="k${k}">${u}</g>`;
  return out;
}
// Only the cells of `b` that differ from `a`, as a layer (for frame-flip overlays).
function diffScreen(a, b) {
  const d = newScreen(a.length);
  const mask = a.map(() => new Array(COLS).fill(false));
  a.forEach((row, r) => row.forEach((cell, c) => {
    const o = b[r][c];
    if (JSON.stringify(cell) !== JSON.stringify(o)) {
      let c0 = c;
      if (o.cont || cell.cont) c0 = c - 1;
      mask[r][c0] = mask[r][c0 + 1] = true;
    }
  }));
  let out = '';
  // emit only changed cells: background boxes for every changed cell, then shapes
  const one = newScreen(a.length);
  let bgd = new Map();
  b.forEach((row, r) => row.forEach((cell, c) => {
    if (!mask[r][c]) { one[r][c] = { ch: ' ', fg: WHT, bg: BLK, skip: true }; return; }
    one[r][c] = cell;
    bgd.set(cell.bg, (bgd.get(cell.bg) || '') + `M${c * CW} ${r * CH}h${CW}v${CH}h${-CW}z`);
  }));
  for (const [k, dd] of bgd) out += `<path class="k${k}" d="${dd}"/>`;
  const art = new Map(), txt = new Map();
  one.forEach((row, r) => row.forEach((cell, c) => {
    if (cell.skip) return;
    if (cell.art && cell.art !== ' ') art.set(cell.fg, (art.get(cell.fg) || '') + artShape(cell.art, c * CW, r * CH));
    else if (cell.ch && cell.ch !== ' ') txt.set(cell.fg, (txt.get(cell.fg) || '') + `<use href="#${gid(cell.ch)}" x="${c * CW}" y="${r * CH}"/>`);
  }));
  for (const [k, dd] of art) out += `<path class="k${k}" d="${dd}"/>`;
  for (const [k, u] of txt) out += `<g class="k${k}">${u}</g>`;
  return out;
}

// deterministic PRNG (mulberry32), seeded with the default run's seed
function prng(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// ================================================================== the picture
// 40 double-width cells x 9 rows. I paint it at 8-pixel resolution (each block
// character is 2 x 2 of these "dots"), then every cell becomes the Big5 block character
// that fits its four dots: a full block, a lower or left half, or a corner triangle where
// a dot sits alone (that turns a staircase into a diagonal). Each cell gets one
// foreground and one background colour, and backgrounds can only be the eight normal
// colours: that rule shapes the whole picture (bright colours can only be the drawn
// shape, never the ground, so the sea can only brighten towards the viewer, and the sand
// needs dark water to sit on). Always daytime.
const ART_COLS = 40, ART_ROWS = 9, DW = ART_COLS * 2, DH = ART_ROWS * 2;
const DARK_OF = { [LBL]: BLU, [LCY]: CYN, [LGN]: GRN, [LYL]: YEL, [LRD]: RED, [LMG]: MAG, [LWH]: WHT, [DGR]: WHT };
const isDark = (k) => k < 8;
function cellFromDots(a, b, c, d) {
  const dots = [a, b, c, d];
  const count = new Map();
  dots.forEach((k) => count.set(k, (count.get(k) || 0) + 1));
  const order = [...count.keys()].sort((x, y) => count.get(y) - count.get(x) || dots.indexOf(x) - dots.indexOf(y));
  if (order.length === 1) return isDark(a) ? { g: ' ', fg: a, bg: a } : { g: '█', fg: a, bg: DARK_OF[a] };
  const P = order[0], Q = order[1];
  const m = dots.map((k) => (k === Q ? 1 : k === P ? 0 : (DIST2(k, Q) < DIST2(k, P) ? 1 : 0)));
  const key = m.join('');
  const bgOf = (k) => (isDark(k) ? k : DARK_OF[k]);
  // pick the glyph whose foreground is the bright one when there is one
  const pick = (g, fg, bg) => ({ g, fg, bg: bgOf(bg) });
  const lower = (top, bot) => (isDark(top) || !isDark(bot) ? pick('▄', bot, top) : pick('▄', bot, top));
  const left = (l, r) => pick('▌', l, r);
  switch (key) {
    case '0011': return lower(P, Q);
    case '1100': return lower(Q, P);
    case '1010': return isDark(P) ? left(Q, P) : left(Q, P);
    case '0101': return left(P, Q);
    // one odd dot: it becomes a triangle (the bright colour drawn, the dark one ground)
    case '0001': return isDark(P) ? pick('◢', Q, P) : pick('◤', P, Q);
    case '0010': return isDark(P) ? pick('◣', Q, P) : pick('◥', P, Q);
    case '1000': return isDark(P) ? pick('◤', Q, P) : pick('◢', P, Q);
    case '0100': return isDark(P) ? pick('◥', Q, P) : pick('◣', P, Q);
    case '1110': return isDark(Q) ? pick('◤', P, Q) : pick('◢', Q, P);
    case '1101': return isDark(Q) ? pick('◥', P, Q) : pick('◣', Q, P);
    case '1011': return isDark(Q) ? pick('◣', P, Q) : pick('◥', Q, P);
    case '0111': return isDark(Q) ? pick('◢', P, Q) : pick('◤', Q, P);
    default: return isDark(P) ? { g: ' ', fg: P, bg: P } : { g: '█', fg: P, bg: DARK_OF[P] };
  }
}
function DIST2(x, y) { const a = RGB[x], b = RGB[y]; return (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2; }
const RGB = PAL.map((h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)));

function paintDots() {
  const D = Array.from({ length: DH }, () => new Array(DW).fill(CYN));
  const set = (x, y, k) => { if (x >= 0 && y >= 0 && x < DW && y < DH) D[y][x] = k; };
  const line = (pts, k) => {
    for (let i = 0; i + 1 < pts.length; i++) {
      let [x0, y0] = pts[i]; const [x1, y1] = pts[i + 1];
      const dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1, dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1;
      let err = dx + dy;
      for (;;) { set(x0, y0, k); if (x0 === x1 && y0 === y1) break; const e2 = 2 * err; if (e2 >= dy) { err += dy; x0 += sx; } if (e2 <= dx) { err += dx; y0 += sy; } }
    }
  };
  // sea from the horizon (dot row 10) down
  for (let x = 0; x < DW; x++) for (let y = 10; y < DH; y++) set(x, y, BLU);
  // the island: a low, flat oval of sand in a ring of teal shallows, painted row by row
  // so its bottom edge falls on a cell boundary (sand can never sit on top of a darker
  // colour inside one cell: the bright colour has to be the drawn shape)
  for (const [y, x0, x1] of SHALLOWS) for (let x = x0; x <= x1; x++) set(x, y, CYN);
  for (const [y, x0, x1] of SAND) for (let x = x0; x <= x1; x++) set(x, y, LYL);
  // the palm trunk: one dot wide, curving up and a little left from the sand
  // (it steps right only on a cell boundary, so every trunk cell is a clean half block)
  line([[67, 3], [67, 7]], RED); line([[68, 8], [68, 11]], RED); line([[69, 12], [69, 13]], RED);
  return D;
}
// [dot row, first x, last x]
const SHALLOWS = [[11, 58, 69], [12, 54, 73], [13, 53, 74], [14, 52, 75], [15, 52, 75], [16, 53, 74], [17, 56, 71]];
const SAND = [[12, 58, 69], [13, 57, 70], [14, 54, 73], [15, 55, 72]];
// The crown, placed cell by cell after the dots are converted: two long fronds rise from
// the crown and droop to thin tips (eighth bars, the left one reaching over the title),
// with a fringe of dark leaflets (corner triangles) hanging under them, and two lower
// fronds slanting down either side. Glyph rows start at cell 24; colour codes below.
const CROWN = [
  ['▁▂▃▄▅▆██◣ ◢██▆▄▂', 'gGGGGGGGG GGGGGG'],
  ['     ◥◤◥█▄█◥◤◥◤', '     gggGoGgggg'],
  ['       ◢◤ ◥◣', '       GG GG'],
  ['     ◢◤     ◥◣', '     GG     GG'],
];
const CROWN_C = { G: LGN, g: GRN, o: YEL };
const HER = 30; // her cell column
function seaCells(band) {
  // rows 5-8 of the sea as eighth bars: bright blue rising out of navy
  const R = prng(1992);
  const base = [1, 3, 5, 7];
  for (let r = 5; r < ART_ROWS; r++) for (let c = 0; c < ART_COLS; c++) {
    const cell = band[r][c];
    if (!(cell.bg === BLU && (cell.g === ' ' || cell.fg === BLU))) continue;
    const n = Math.max(0, Math.min(8, base[r - 5] + Math.round((R() - 0.5) * 2.4)));
    band[r][c] = n === 0 ? { g: ' ', fg: BLU, bg: BLU } : { g: EIGHTHS_LO[n], fg: LBL, bg: BLU };
  }
}
function artBand({ nod = 0, wave = 0 } = {}) {
  const D = paintDots();
  const band = [];
  for (let r = 0; r < ART_ROWS; r++) {
    const row = [];
    for (let c = 0; c < ART_COLS; c++) row.push(cellFromDots(D[2 * r][2 * c], D[2 * r][2 * c + 1], D[2 * r + 1][2 * c], D[2 * r + 1][2 * c + 1]));
    band.push(row);
  }
  seaCells(band);
  const set = (c, r, g, fg, bg) => { const o = band[r][c]; band[r][c] = { g, fg, bg: bg ?? o.bg }; };
  // glints on the darker water: two alternating sets (the wave frames)
  const gl = prng(80);
  for (let i = 0; i < 40; i++) {
    const c = Math.floor(gl() * 28), r = 5 + Math.floor(gl() * 2);
    const cell = band[r][c];
    if (i % 2 === wave && r === 6 && cell.bg === BLU && EIGHTHS_LO.indexOf(cell.g) <= 3) set(c, r, '▁', LWH, BLU);
  }
  // a bank of cloud on the horizon
  [['▁', 19], ['▃', 20], ['▅', 21], ['▃', 22], ['▂', 23], ['▄', 24], ['▃', 25], ['▁', 26]].forEach(([g, c]) => set(c, 4, g, LWH, CYN));
  CROWN.forEach(([gl, co], r) => [...gl].forEach((g, i) => {
    if (g === ' ') return;
    set(24 + i, r, g, CROWN_C[co[i]], co[i] === 'o' ? GRN : undefined);
  }));
  // the raft, moored just off the right-hand shore
  set(38, 7, '▄', RED, BLU); set(39, 7, '▄', RED, BLU);
  // her, standing on the sand left of the palm, her head above the horizon: hair in a low
  // bun, coral tank top, cream shorts, feet in the sand. She nods on the beat.
  set(HER, 4, nod ? '▂' : '▄', RED, CYN);
  set(HER, 5, '█', LRD);
  set(HER, 6, '▄', LYL, WHT);
  return band;
}

// "CASTAWAY" in the board's own lettering habit: full blocks, corner triangles and a
// lower-half bar, three rows tall, letters one half-width space apart.
const LOGO = {
  C: ['◢██', '█  ', '◥██'],
  A: ['◢█◣', '█▄█', '█ █'],
  S: ['◢██', '◥█◣', '██◤'],
  T: ['███', ' █ ', ' █ '],
  W: ['█  █', '█◢◣█', '◥◤◥◤'],
  Y: ['█ █', '◥█◤', ' █ '],
};
function drawLogo(scr, row0, col0, word, fg, bg) {
  for (let r = 0; r < 3; r++) {
    let c = col0;
    [...word].forEach((L, i) => {
      if (i) { fillRow(scr, row0 + r, c, c + 1, bg); c += 1; }
      for (const g of LOGO[L][r]) { putArt(scr, row0 + r, c, { g: g === ' ' ? ' ' : g, fg: g === ' ' ? bg : fg, bg }); c += 2; }
    });
  }
}

// ================================================================== facts (snapshot)
// Checked read-only against D:/python/castaway on 2026-10-01 and again on 2026-10-02 (94
// activities, 181 sound files, [video] fps = 24). The comment times are real events of the
// default run (seed 1992, `python -B tools/schedule.py`), written as clock times with the
// video starting at 08:00, so 0:24:18 into the run is "10/01 08:24". They will drift if
// the schedule is rebalanced or activities are added.
const SNAP = {
  date: '10/01',
  next: '10/02',      // the wrapped repeat of the column: same seed, same ten hours, next day
  activities: 94,     // [activities.*] tables in activities.toml today
};
// [mark, id, text, time]; the cycle loops, like the video does
const COMMENTS = [
  ['推', 'NotStopping', 'pass 1 of 9. she was sipping a coconut.', '08:24'],          // ship 0:24:18, coconut 0:24:09
  ['推', 'PalmTopCat', 'came in on a crate. the top of the palm is mine.', '08:44'],   // cat_visit 0:44:06
  ['噓', 'TheTide', 'that sandcastle was in my lane.', '09:07'],                       // tide_takes_sandcastle 1:07:57
  ['→', 'lowbun', '(nods)', '09:12'],                                                 // idle, 1:11:29 to 1:13:15
  ['推', 'NotStopping', 'pass 3 of 9. coconut again. she did not look up.', '09:44'], // ship 1:44:30, coconut 1:44:06
  ['噓', 'BackToSender', 'thrown out to sea. washed straight back.', '11:04'],         // message_in_bottle 3:04:15
  ['推', 'ShellSuit', 'a coconut landed on me. it is my shell now. bye.', '11:36'],     // coconut_crab 3:36:03
  ['推', 'HornSection', 'she waved! we honked back! we sailed on.', '13:14'],          // rescue_almost 5:14:06
  ['→', 'lowbun', '(shrugs, puts the music back on)', '13:16'],                      // rescue_almost ends 5:16:00
  ['推', 'AmberBottle', 'a reply, three hours later. she smiled.', '14:05'],           // bottle_reply 6:05:06
  ['→', 'lowbun', 'one bar of signal. top of the palm. worth it.', '14:07'],          // signal_hunt 6:07:24
  ['推', 'NotStopping', 'pass 9 of 9. sandcastle this time. sightings: 0.', '17:05'], // ship 9:05:27, sandcastle 9:04:30
];
const BAR = 3; // seconds: one bar of the 80 BPM theme; a new comment lands on every bar

function commentLine(scr, r, [mark, id, text, time], date = SNAP.date) {
  const maxlength = 62 - id.length; // the board's own arithmetic: 78 - lead - date - time - id
  // the board puts nothing after the colon; commenters type their own leading space
  const msg = ' ' + text;
  if (msg.length > maxlength) throw new Error(`comment too long: ${text}`);
  let c = put(scr, r, 0, mark, mark === '推' ? LWH : LRD);
  c = put(scr, r, c, ' ');
  c = put(scr, r, c, id, LYL);
  c = put(scr, r, c, ':' + msg.padEnd(maxlength), YEL);
  put(scr, r, c, ` ${date} ${time}`, WHT);
}

// ================================================================== screen 1: the article
function articleScreen(frame) {
  const s = newScreen(24);
  const L1 = [BLU, WHT], L2 = [WHT, BLU];
  // header (pmore): label blue on light grey, value light grey on blue, 78 columns
  segs(s, 0, 0, [[' 作者 ', ...L1], [' ' + 'lowbun (nodding along)'.padEnd(55), ...L2], [' 看板 ', ...L1], [' Castaway ', ...L2]]);
  segs(s, 1, 0, [[' 標題 ', ...L1], [' ', ...L2]]);
  let c = put(s, 1, 7, '[公告] CASTAWAY: ten hours on one tiny island, on purpose', ...L2);
  fillRow(s, 1, c, 78, BLU);
  segs(s, 2, 0, [[' 時間 ', ...L1], [' ' + 'Thu Oct  1 08:00:00 2026'.padEnd(71), ...L2]]);
  put(s, 3, 0, '─'.repeat(39), CYN);
  // the picture
  artBand(frame).forEach((row, r) => row.forEach((a, cx) => putArt(s, 4 + r, cx * 2, a)));
  for (let r = 5; r <= 7; r++) fillRow(s, r, 0, 58, CYN);
  drawLogo(s, 5, 1, 'CASTAWAY', LWH, CYN);
  fillRow(s, 8, 0, 36, CYN);
  put(s, 8, 2, '一座小島，一棵椰子樹，十個小時。', LWH, CYN);
  // the article text
  segs(s, 13, 0, [['One tiny island, one tall palm, ', WHT], ['ten hours', LYL], [' of lo-fi. She idles, nodding along;', WHT]]);
  segs(s, 14, 0, [['every so often, on the next bar of the beat, ', WHT], ['something happens', LWH], ['. Every sound', WHT]]);
  segs(s, 15, 0, [['is synthesized from code.  ', WHT], ['python tools/serve.py', LCY], ['  then open ', WHT], ['127.0.0.1:8765', LCY]]);
  put(s, 16, 0, '※ 發信站: 一棵椰子樹(127.0.0.1:8765), 來自: 樹頂', GRN);
  // footer (pmore): viewed-all summary, detail, help
  c = segs(s, 23, 0, [['  瀏覽 第 2/2 頁 (100%) ', WHT, BLU], [' 目前顯示: 第 05~27 行', DGR, WHT]]);
  const right = [['←[q]', RED, WHT], ['離開 ', BLK, WHT], ['(h)', RED, WHT], ['按鍵說明 ', BLK, WHT]];
  const rw = right.reduce((a, [t]) => a + colsOf(t), 0);
  fillRow(s, 23, c, 80 - rw, WHT);
  segs(s, 23, 80 - rw, right);
  return s;
}
function commentScreen() {
  const K = COMMENTS.length, VIS = 6;
  const s = newScreen(K + VIS);
  // the last six lines repeat the first six, dated the next day, so every frame of the
  // scroll reads in time order and the loop point is a plain one-line step
  for (let i = 0; i < K + VIS; i++) commentLine(s, i, COMMENTS[i % K], i < K ? SNAP.date : SNAP.next);
  return s;
}

// ================================================================== screen 2: the board list
const BOARDS = [
  // name, class, description, popularity (an honest count for one default 10-hour run), BM, fav, unread
  ['Castaway', '公告', 'start here. one island, ten hours', 1, 'lowbun', 1, 1],
  ['Idle', '日常', 'bars spent idling, ~72% of a run', 8640, 'lowbun', 1, 0],     // 72% idle in seed 1992: 0.72 x 12000 bars
  ['Regular', '排程', 'every 2 to 5 minutes, ~155 a run', 155, 'Timekeeper', 0, 1],
  ['Occasional', '排程', 'every 12 to 25 minutes', 30, 'Timekeeper', 0, 1],
  ['Rare', '排程', 'every 30 to 60 minutes', 13, 'Timekeeper', 0, 0],
  ['SuperRare', '排程', 'every 3 to 6 hours, never 4', 2, 'Timekeeper', 0, 1],
  ['Chained', '排程', 'follow-ups: the reply bottle', 20, 'Timekeeper', 0, 0],
  ['Activities', '排程', `all of them, as of ${SNAP.date}`, SNAP.activities, 'Timekeeper', 0, 1],
  ['Ships', '島上', 'sails past. she never sees it', 9, 'NotStopping', 1, 1],   // ship_passes_unseen, seed 1992
  ['Coconuts', '島上', 'sipped with eyes closed', 29, 'ShellSuit', 0, 0],
  ['Sandcastle', '島上', 'built 10 times. tide wins 10-0', 10, 'TheTide', 0, 1],
  ['Cat', '島上', 'arrives by crate, naps up top', 5, 'PalmTopCat', 1, 0],
  ['Signal', '島上', 'one bar. top of the palm only', 1, 'lowbun', 0, 0],
  ['Theme', '音樂', '60 s loop, F major, 600 a run', 600, 'EightyBPM', 1, 0],
  ['Bars', '音樂', '3 s each. gags land on one', 12000, 'EightyBPM', 0, 0],
  ['Beats', '音樂', '80 BPM for ten hours', 48000, 'EightyBPM', 0, 0],
  ['Synth', '音樂', 'every sound made from code', 181, 'MakeAudio', 1, 1],      // audio_catalog.json files on 10/02: HOT either way
  ['Samples', '音樂', 'recordings used: none', 0, 'MakeAudio', 0, 0],
  ['Frames', '畫面', '1080p, 24 fps, for 10:00:00', 864000, 'FrameExact', 0, 0], // [video] fps = 24 since 10/01: 36000 s x 24
  ['Night', '天氣', 'always daytime. no nights', 0, '', 0, 0],
];
// Class colour: hashed from the tag's Big5 bytes exactly as the board does it.
const BIG5 = (() => {
  const dec = new TextDecoder('big5');
  const want = new Set(BOARDS.flatMap((b) => [...b[1]]));
  const map = new Map();
  for (let hi = 0xa1; hi <= 0xf9 && map.size < want.size; hi++) for (let lo = 0x40; lo <= 0xfe; lo++) {
    const ch = dec.decode(new Uint8Array([hi, lo]));
    if (want.has(ch) && !map.has(ch)) map.set(ch, [hi, lo]);
  }
  return map;
})();
function classColour(tag) {
  const b = [...tag].flatMap((ch) => BIG5.get(ch));
  const i = (b[0] + b[1] + b[2] + b[3]) & 7;
  return [WHT, GRN, YEL, CYN, LBL, LWH, LGN, LYL][i];
}
// popularity cell: plain to 10, bright yellow to 50, bright red to 99, HOT from 100, then
// the explode character, recoloured at 1000 / 2000 / 5000 / 10000 / 30000 / 60000 / 100000
function popCell(n) {
  if (n < 1) return [['   ', WHT]];
  if (n <= 10) return [[String(n).padStart(2) + ' ', WHT]];
  if (n <= 50) return [[String(n).padStart(2), LYL], [' ', WHT]];
  if (n < 100) return [[String(n).padStart(2), LRD], [' ', WHT]];
  if (n < 1000) return [['HOT', LWH]];
  const k = n >= 100000 ? LMG : n >= 60000 ? LYL : n >= 30000 ? LGN : n >= 10000 ? LCY : n >= 5000 ? LBL : n >= 2000 ? LRD : LWH;
  return [['爆!', k]];
}
function boardScreen(cursor) {
  const s = newScreen(24);
  // title bar
  fillRow(s, 0, 0, 80, BLU);
  put(s, 0, 0, '【看板列表】', WHT, BLU);
  put(s, 0, 40 - 5, '一棵椰子樹', LYL, BLU);
  const tail = '看板《Castaway》';
  put(s, 0, 80 - colsOf(tail), tail, WHT, BLU);
  put(s, 1, 0, '[←][q]回上層 [→][r]閱讀 [↑↓]選擇 [h]求助', WHT);
  fillRow(s, 2, 0, 80, WHT, BLK);
  put(s, 2, 0, '   編號   看  板       類別   中   文   敘   述               人氣 板   主', BLK, WHT);
  BOARDS.forEach(([name, tag, desc, pop, bm, fav, unread], i) => {
    const r = 3 + i;
    let c = put(s, r, 0, String(i + 1).padStart(7) + ' ', WHT);
    c = unread ? put(s, r, c, 'ˇ', LRD) : put(s, r, c, '  ');
    c = put(s, r, c, name.padEnd(13), fav ? LCY : WHT);
    c = put(s, r, c, tag + ' ', classColour(tag));
    c = put(s, r, c, '◎', WHT);
    if (desc.length > 34) throw new Error(`board desc too long: ${desc}`);
    c = put(s, r, c, desc.padEnd(34), WHT);
    c = segs(s, r, c, popCell(pop));
    put(s, r, c, bm, WHT);
  });
  // cursor
  put(s, 3 + cursor, 0, '●', LWH);
  // status bar: date, notice, online (one user), help
  let c = segs(s, 23, 0, [['10/1周四 8:00', BLU, CYN], ['每天都是晴天'.padEnd(14 - 6), LYL, MAG]]);
  c = segs(s, 23, c, [[' 線上', BLK, WHT], ['1', RED, WHT], ['人,我是', BLK, WHT], ['lowbun', RED, WHT], [',呼叫器', BLK, WHT], ['打開', BLU, WHT]]);
  fillRow(s, 23, c, 80 - 7, WHT);
  segs(s, 23, 80 - 7, [['(h)', RED, WHT], ['說明', BLK, WHT]]);
  return s;
}

// ================================================================== SVG assembly
const PADX = 12, PADY = 12;
const TW = COLS * CW, TH = 24 * CH;
const VBW = TW + 2 * PADX, VBH = TH + 2 * PADY;
const CSS_COLOURS = PAL.map((h, i) => `.k${i}{fill:${h}}`).join('');
function svgDoc({ title, desc, body, extraCss = '' }) {
  const used = new Set(GLYPH_IDS.keys());
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VBW} ${VBH}" width="${VBW}" height="${VBH}" role="img" aria-labelledby="t d">
<title id="t">${title}</title>
<desc id="d">${desc}</desc>
<style>${CSS_COLOURS}.bg path,.art path{shape-rendering:crispEdges}${extraCss}</style>
<defs>${glyphDefs(used)}</defs>
<rect x=".5" y=".5" width="${VBW - 1}" height="${VBH - 1}" rx="9" fill="#000" stroke="#30363d"/>
${body}
</svg>
`;
}

function buildMain() {
  const base = articleScreen({ nod: 0, wave: 0 });
  const nod = articleScreen({ nod: 2, wave: 0 });
  const wave = articleScreen({ nod: 0, wave: 1 });
  const K = COMMENTS.length;
  const cs = commentScreen();
  const scrollPx = K * CH;
  // blank the comment rows on the base screen: they live in the scrolling layer
  for (let r = 17; r <= 22; r++) fillRow(base, r, 0, 80, BLK);
  const body = `<g transform="translate(${PADX} ${PADY})">
<g class="scr">${renderScreen(base)}</g>
<g class="nod">${diffScreen(base, nod)}</g>
<g class="wave">${diffScreen(base, wave)}</g>
<clipPath id="cw"><rect x="0" y="${17 * CH}" width="${TW}" height="${6 * CH}"/></clipPath>
<g clip-path="url(#cw)"><g transform="translate(0 ${17 * CH})"><g class="scroll">${renderScreen(cs)}</g></g></g>
</g>`;
  const css = `.nod,.wave{opacity:0}
.nod{animation:nod .75s infinite}@keyframes nod{0%,49.9%{opacity:0}50%,100%{opacity:1}}
.wave{animation:wave ${BAR}s infinite}@keyframes wave{0%,49.9%{opacity:0}50%,100%{opacity:1}}
.scroll{animation:scroll ${K * BAR}s steps(${K}) infinite}@keyframes scroll{from{transform:translateY(0)}to{transform:translateY(-${scrollPx}px)}}
@media (prefers-reduced-motion:reduce){.nod,.wave,.scroll{animation:none}}`;
  return svgDoc({
    title: 'CASTAWAY, a post on the Castaway board of the 一棵椰子樹 station',
    desc: 'A Taiwanese telnet bulletin board article in an 80-column terminal. Header: author lowbun (nodding along), board Castaway, title [公告] CASTAWAY: ten hours on one tiny island, on purpose. A picture made of block characters: CASTAWAY in white block letters on a teal sky with the caption 一座小島，一棵椰子樹，十個小時 (one small island, one coconut palm, ten hours); a palm whose long frond reaches over the title, on a small flat sandy island in teal shallows; a raft moored off the shore; a navy-to-blue sea with glints; and a tiny figure with dark hair, a coral top and light shorts who nods on every beat. Text: one tiny island, one tall palm, ten hours of lo-fi; she idles, nodding along; every so often, on the next bar of the beat, something happens; every sound is synthesized from code; python tools/serve.py then open 127.0.0.1:8765. Under it, comments arrive one per bar: a ship that passes nine times unseen, a cat, the tide, a bottle, a hermit crab, a ship that honks back, a reply bottle, and lowbun herself.',
    body, extraCss: css,
  });
}

function buildBoards() {
  const N = BOARDS.length;
  const frames = Array.from({ length: N }, (_, i) => boardScreen(i));
  const base = frames[0];
  let layers = '';
  // the cursor walks down the list one row per bar
  for (let i = 1; i < N; i++) layers += `<g class="cur" style="animation-delay:${i * BAR - N * BAR}s">${diffScreen(base, frames[i])}</g>`;
  const pct = (100 / N).toFixed(3);
  const css = `.cur{opacity:0;animation:cur ${N * BAR}s infinite}@keyframes cur{0%,${(+pct - 0.001).toFixed(3)}%{opacity:1}${pct}%,100%{opacity:0}}
@media (prefers-reduced-motion:reduce){.cur{animation:none}}`;
  const body = `<g transform="translate(${PADX} ${PADY})"><g class="scr">${renderScreen(base)}</g>${layers}</g>`;
  return svgDoc({
    title: 'The 一棵椰子樹 board list: Castaway, by the numbers',
    desc: 'A Taiwanese telnet bulletin board list, 80 columns. Each board is a part of Castaway, and its popularity column counts that thing in one ten-hour run: the timer boards show a typical run (medians of 200 simulated runs), the rest the default run (seed 1992). Castaway 1 (one person on the island), Idle about 8640 bars (72 percent of the run), Regular HOT (about 155), Occasional 30, Rare 13, SuperRare 2, Chained 20, Activities ' + SNAP.activities + ' as of ' + SNAP.date + ', Ships 9, Coconuts 29, Sandcastle 10 (the tide wins 10-0), Cat 5, Signal 1, Theme HOT (600 loops), Bars 12000, Beats 48000, Synth HOT (more than 150 sounds made from code), Samples none, Frames 864000 (24 fps), Night none. Counts from 1000 up show the explode character, recoloured as they climb. Status bar: 10/1 Thursday 8:00, 每天都是晴天 (every day is a sunny day), 1 user online, I am lowbun.',
    body, extraCss: css,
  });
}

if (!PROOF) {
  mkdirSync(dirname(OUT_MAIN), { recursive: true });
  const main = buildMain();
  writeFileSync(OUT_MAIN, main);
  console.log(OUT_MAIN, (main.length / 1024).toFixed(1), 'KB');
  GLYPH_IDS.clear();
  const boards = buildBoards();
  writeFileSync(OUT_BOARDS, boards);
  console.log(OUT_BOARDS, (boards.length / 1024).toFixed(1), 'KB');
}

