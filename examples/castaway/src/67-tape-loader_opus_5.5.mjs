#!/usr/bin/env node
// 67-tape-loader_opus_5.5: the "ZX Spectrum tape loader" README header for
// Castaway (catalogue entry mach-01: border stripes and loading-screen build-up).
//
// The banner is one 8-bit home-computer screen in its TV: a 256x192 picture
// inside the border, cropped to what a TV of the day showed of it (48 pixels at
// the sides, 24 above and below), and it obeys the machine's rules on purpose,
// because the rules are the look:
//   * 32x24 attribute cells of 8x8 pixels: one INK and one PAPER per cell, from
//     eight colours, with one BRIGHT bit that both share (so the colour clash
//     around her head and the palm is real, not drawn on);
//   * the picture is a 1-bit bitmap plus that grid of attributes, and it loads
//     in memory order: three thirds, and inside each third pixel line 0 of all
//     eight character rows, then line 1, and so on (the venetian blind);
//   * the colour arrives last, one attribute row at a time, top to bottom;
//   * the border shows the tape signal: slow thick red/cyan bands for the
//     pilot tone, thin blue/yellow stripes for data, where a 1 bit is twice as
//     thick as a 0 bit (the data stripes here are real bits, of "CASTAWAY").
//
// The loop is 24 seconds, which is 8 bars of Castaway's 80 BPM theme, and every
// phase starts on a bar line, because in Castaway everything waits for the
// next bar:
//    0- 3 s  the finished loading screen (first frame: the name is already up)
//    3 s     NEW: white paper, white border, LOAD "" at the bottom
//    4 s     pilot tone, then a short data burst, then "Program: CASTAWAY"
//    6 s     pilot again; 7 s data: the bitmap arrives in 24 interleaved steps
//   13 s     the attributes sweep down and the picture turns to colour
//   15 s     the border snaps to sea blue and she gets on with it: her head
//            bobs with the beat, so does the shark's, the waves shift, a note
//            FLASHes, the coconut scuttles off on hermit-crab legs and comes
//            back, and the bottom two lines change on every bar
//   24 s     = 0 s, the same finished screen, so the loop has no seam
//
// (The style is the ZX Spectrum's tape loader; nothing here is copied from the
// machine: the font, the logo letters and the picture are drawn from scratch.)
//
// Everything is drawn from the 8x8 font and the pixel art in this file (no
// <text>, no fonts, nothing external). Motion is CSS keyframes with step
// timing, so it runs inside GitHub's <img>; prefers-reduced-motion switches the
// animation off and leaves the finished screen. Output is deterministic (the
// one PRNG is seeded with 1992, the run seed of the real schedule).
//
//   node 67-tape-loader_opus_5.5.mjs               regenerate the SVG
//   node 67-tape-loader_opus_5.5.mjs --png=<file>  also write a 4x PNG of the
//                                                  finished screen (debugging)
//   node 67-tape-loader_opus_5.5.mjs --mono=<file> and of the 1-bit bitmap
//   node 67-tape-loader_opus_5.5.mjs --crop=x,y,w,h --cropfile=<file>
//                                                  a 10x close-up of one area

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '67-tape-loader_opus_5.5';
const OUT = path.join(HERE, '..', 'assets', `${SLUG}.svg`);
const arg = (name) => { const a = process.argv.find((s) => s.startsWith(`--${name}=`)); return a ? a.slice(name.length + 3) : null; };

// ================================================================ palette
// Eight colours at two intensities. The usual emulator convention: #D8 per
// channel for normal, #FF for BRIGHT (nobody measured the real thing). Black
// has no bright twin. In the drawing code a lower-case letter is normal and an
// upper-case letter is BRIGHT.
const NORMAL = ['#000000', '#0000d8', '#d80000', '#d800d8', '#00d800', '#00d8d8', '#d8d800', '#d8d8d8'];
const BRIGHT = ['#000000', '#0000ff', '#ff0000', '#ff00ff', '#00ff00', '#00ffff', '#ffff00', '#ffffff'];
const LETTERS = 'kbrmgcyw';
const idx = (ch) => LETTERS.indexOf(ch.toLowerCase());
const isBright = (ch) => ch !== ch.toLowerCase();
const hex = (i, br) => (br ? BRIGHT : NORMAL)[i];
const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));

// ================================================================ timing
const T = 24;                                   // loop, seconds: 8 bars of 3 s
const BEAT = 0.75;                              // 80 BPM
const pc = (s) => `${+(s / T * 100).toFixed(4)}%`;
const t = {
  cls: 3.0,                                     // NEW: the screen clears
  pilot1: 4.0, head: 5.4, gap: 5.8, pilot2: 6.0,
  data: 7.0, step: 0.25,                        // 24 bitmap steps of 0.25 s
  attrs: 13.0, attrStep: 0.05,                  // 24 attribute rows
  done: 15.0,                                   // border to black, hold starts
};
const layerTime = (n) => t.data + n * t.step;   // n = third * 8 + pixel line

// ================================================================ geometry
const SW = 256, SH = 192;                       // the picture
const BX = 48, BY = 24;                         // border, as much as a TV showed
const FW = SW + BX * 2, FH = SH + BY * 2;       // 352 x 240 frame
const BEZEL = 10;
const VW = FW + BEZEL * 2, VH = FH + BEZEL * 2; // 372 x 260, shown at 2x
const OX = BEZEL + BX, OY = BEZEL + BY;         // picture origin in the SVG

// ================================================================ PRNG
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let x = a;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

// ================================================================ 8x8 font
// An original thin face: one-pixel strokes, capitals seven pixels tall in rows
// 0-6, a five-pixel x-height, descenders in row 7, glyphs in columns 1-6.
const FONT_SRC = `
A
...##...
..#..#..
.#....#.
.#....#.
.######.
.#....#.
.#....#.
........
B
.#####..
.#....#.
.#....#.
.#####..
.#....#.
.#....#.
.#####..
........
C
..####..
.#....#.
.#......
.#......
.#......
.#....#.
..####..
........
D
.####...
.#...#..
.#....#.
.#....#.
.#....#.
.#...#..
.####...
........
E
.######.
.#......
.#......
.####...
.#......
.#......
.######.
........
F
.######.
.#......
.#......
.####...
.#......
.#......
.#......
........
G
..####..
.#....#.
.#......
.#..###.
.#....#.
.#....#.
..####..
........
H
.#....#.
.#....#.
.#....#.
.######.
.#....#.
.#....#.
.#....#.
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
......#.
......#.
......#.
......#.
.#....#.
..####..
........
K
.#....#.
.#...#..
.#..#...
.###....
.#..#...
.#...#..
.#....#.
........
L
.#......
.#......
.#......
.#......
.#......
.#......
.######.
........
M
.#....#.
.##..##.
.#.##.#.
.#....#.
.#....#.
.#....#.
.#....#.
........
N
.#....#.
.##...#.
.#.#..#.
.#..#.#.
.#...##.
.#....#.
.#....#.
........
O
..####..
.#....#.
.#....#.
.#....#.
.#....#.
.#....#.
..####..
........
P
.#####..
.#....#.
.#....#.
.#####..
.#......
.#......
.#......
........
Q
..####..
.#....#.
.#....#.
.#....#.
.#..#.#.
.#...#..
..###.#.
........
R
.#####..
.#....#.
.#....#.
.#####..
.#..#...
.#...#..
.#....#.
........
S
..####..
.#....#.
.#......
..####..
......#.
.#....#.
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
.#....#.
.#....#.
.#....#.
.#....#.
.#....#.
.#....#.
..####..
........
V
.#....#.
.#....#.
.#....#.
.#....#.
..#..#..
..#..#..
...##...
........
W
.#....#.
.#....#.
.#....#.
.#....#.
.#.##.#.
.##..##.
.#....#.
........
X
.#....#.
.#....#.
..#..#..
...##...
..#..#..
.#....#.
.#....#.
........
Y
.#....#.
.#....#.
..#..#..
...##...
...##...
...##...
...##...
........
Z
.######.
......#.
.....#..
...##...
..#.....
.#......
.######.
........
a
........
........
..####..
......#.
..#####.
.#....#.
..#####.
........
b
.#......
.#......
.#####..
.#....#.
.#....#.
.#....#.
.#####..
........
c
........
........
..####..
.#......
.#......
.#......
..####..
........
d
......#.
......#.
..#####.
.#....#.
.#....#.
.#....#.
..#####.
........
e
........
........
..####..
.#....#.
.######.
.#......
..####..
........
f
...###..
..#.....
..#.....
.####...
..#.....
..#.....
..#.....
........
g
........
........
..#####.
.#....#.
.#....#.
..#####.
......#.
..####..
h
.#......
.#......
.#####..
.#....#.
.#....#.
.#....#.
.#....#.
........
i
...#....
........
..##....
...#....
...#....
...#....
..###...
........
j
.....#..
........
....##..
.....#..
.....#..
.....#..
.....#..
..###...
k
.#......
.#......
.#...#..
.#..#...
.###....
.#..#...
.#...#..
........
l
..##....
...#....
...#....
...#....
...#....
...#....
...##...
........
m
........
........
.##.##..
.#.#..#.
.#.#..#.
.#.#..#.
.#.#..#.
........
n
........
........
.#####..
.#....#.
.#....#.
.#....#.
.#....#.
........
o
........
........
..####..
.#....#.
.#....#.
.#....#.
..####..
........
p
........
........
.#####..
.#....#.
.#....#.
.#####..
.#......
.#......
q
........
........
..#####.
.#....#.
.#....#.
..#####.
......#.
......#.
r
........
........
.#.###..
.##.....
.#......
.#......
.#......
........
s
........
........
..#####.
.#......
..####..
......#.
.#####..
........
t
..#.....
..#.....
.####...
..#.....
..#.....
..#.....
...##...
........
u
........
........
.#....#.
.#....#.
.#....#.
.#....#.
..#####.
........
v
........
........
.#....#.
.#....#.
.#....#.
..#..#..
...##...
........
w
........
........
.#....#.
.#....#.
.#.##.#.
.#.##.#.
..#..#..
........
x
........
........
.#....#.
..#..#..
...##...
..#..#..
.#....#.
........
y
........
........
.#....#.
.#....#.
.#....#.
..#####.
......#.
..####..
z
........
........
.######.
.....#..
...##...
..#.....
.######.
........
0
..####..
.#...##.
.#..#.#.
.#.#..#.
.##...#.
.#....#.
..####..
........
1
...##...
..#.#...
....#...
....#...
....#...
....#...
..#####.
........
2
..####..
.#....#.
......#.
..####..
.#......
.#......
.######.
........
3
..####..
.#....#.
......#.
...###..
......#.
.#....#.
..####..
........
4
....##..
...#.#..
..#..#..
.#...#..
.######.
.....#..
.....#..
........
5
.######.
.#......
.#####..
......#.
......#.
.#....#.
..####..
........
6
..####..
.#......
.#......
.#####..
.#....#.
.#....#.
..####..
........
7
.######.
......#.
.....#..
....#...
...#....
...#....
...#....
........
8
..####..
.#....#.
.#....#.
..####..
.#....#.
.#....#.
..####..
........
9
..####..
.#....#.
.#....#.
..#####.
......#.
......#.
..####..
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
..#.....
:
........
........
...##...
...##...
........
...##...
...##...
........
;
........
........
...##...
...##...
........
...##...
...##...
..#.....
!
...##...
...##...
...##...
...##...
...##...
........
...##...
........
?
..####..
.#....#.
......#.
....##..
...#....
........
...#....
........
'
...##...
...##...
..#.....
........
........
........
........
........
"
..#..#..
..#..#..
..#..#..
........
........
........
........
........
-
........
........
........
.#####..
........
........
........
........
+
........
...#....
...#....
.#####..
...#....
...#....
........
........
=
........
........
.#####..
........
.#####..
........
........
........
*
........
.#.#.#..
..###...
.#####..
..###...
.#.#.#..
........
........
/
......#.
.....#..
.....#..
....#...
...#....
..#.....
.#......
........
(
....#...
...#....
..#.....
..#.....
..#.....
...#....
....#...
........
)
..#.....
...#....
....#...
....#...
....#...
...#....
..#.....
........
#
..#..#..
.######.
..#..#..
..#..#..
.######.
..#..#..
........
........
>
..#.....
...#....
....#...
.....#..
....#...
...#....
..#.....
........
~
........
........
..##..#.
.#..##..
........
........
........
........
♪
....##..
....#.#.
....#..#
....#...
..###...
.####...
..##....
........
`;
const FONT = { ' ': Array(8).fill('........') };
{
  const lines = FONT_SRC.split('\n').filter((l) => l.length);
  for (let i = 0; i < lines.length; i += 9) {
    const rows = lines.slice(i + 1, i + 9);
    if ([...lines[i]].length !== 1 || rows.length !== 8 || rows.some((r) => r.length !== 8)) throw new Error(`bad glyph near "${lines[i]}"`);
    FONT[lines[i]] = rows;
  }
}
const glyph = (ch) => { if (!FONT[ch]) throw new Error(`no glyph for "${ch}"`); return FONT[ch]; };

// ================================================================ the logo
// CASTAWAY in chunky letters drawn on a 13x16 grid of 2x2-pixel units, so each
// letter is 26x32 pixels: exactly four attribute rows tall.
const LOGO_SRC = {
  C: [
    '..###########', '.############', '#############', '####.........', '###..........', '###..........', '###..........', '###..........',
    '###..........', '###..........', '###..........', '###..........', '####.........', '#############', '.############', '..###########'],
  A: [
    '..#########..', '.###########.', '#############', '###.......###', '###.......###', '###.......###', '###.......###', '#############',
    '#############', '#############', '###.......###', '###.......###', '###.......###', '###.......###', '###.......###', '###.......###'],
  S: [
    '..###########', '.############', '#############', '###..........', '###..........', '###..........', '############.', '#############',
    '.############', '..........###', '..........###', '..........###', '..........###', '#############', '############.', '###########..'],
  T: [
    '#############', '#############', '#############', '.....###.....', '.....###.....', '.....###.....', '.....###.....', '.....###.....',
    '.....###.....', '.....###.....', '.....###.....', '.....###.....', '.....###.....', '.....###.....', '.....###.....', '.....###.....'],
  W: [
    '###.......###', '###.......###', '###.......###', '###.......###', '###.......###', '###.......###', '###..###..###', '###..###..###',
    '###..###..###', '###..###..###', '###..###..###', '###..###..###', '#############', '#############', '.###########.', '..####.####..'],
  Y: [
    '###.......###', '###.......###', '###.......###', '###.......###', '###.......###', '####.....####', '#############', '.###########.',
    '..#########..', '.....###.....', '.....###.....', '.....###.....', '.....###.....', '.....###.....', '.....###.....', '.....###.....'],
};

// ================================================================ the picture model
// A picture is drawn in "intent" colours (any of the 15) with each pixel marked
// as background (sky, sea, sand) or foreground (logo, text, palm, figures).
// convert() then does what an artist on the real machine had to do: per 8x8
// cell, PAPER is the main background colour, INK the main foreground colour,
// and anything else is forced into one of the two (the clash).
class Pic {
  constructor(src) {
    this.c = src ? src.c.map((r) => r.slice()) : Array.from({ length: SH }, () => Array(SW).fill('b'));
    this.f = src ? src.f.map((r) => r.slice()) : Array.from({ length: SH }, () => Array(SW).fill(false));
    this.u = src ? src.u.map((r) => r.slice()) : Array.from({ length: SH }, () => Array(SW).fill('b'));
    this.ov = new Map(src ? src.ov : []);
  }
  set(x, y, ch, fg) {
    x = Math.round(x); y = Math.round(y);
    if (x < 0 || y < 0 || x >= SW || y >= SH) return;
    this.c[y][x] = ch; this.f[y][x] = fg;
    if (!fg) this.u[y][x] = ch;                 // what lies under the foreground
  }
  bg(x, y, ch) { this.set(x, y, ch, false); }
  fg(x, y, ch) { this.set(x, y, ch, true); }
  rect(x, y, w, h, ch, fg = false) { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) this.set(i, j, ch, fg); }
  // stamp a sprite: rows of characters, map from character to colour (or null)
  sprite(x, y, rows, map, fg = true) {
    rows.forEach((row, j) => [...row].forEach((ch, i) => { const c = map[ch]; if (c) this.set(x + i, y + j, c, fg); }));
  }
  text(str, x, y, ch) {
    [...str].forEach((s, i) => glyph(s).forEach((row, j) => [...row].forEach((b, k) => { if (b === '#') this.fg(x + i * 8 + k, y + j, ch); })));
  }
  // fix a cell's attributes by hand: { ink, paper } as colour letters
  attr(col, row, ink, paper) { this.ov.set(`${col},${row}`, { ink, paper }); }
}

function convert(p) {
  const attr = Array.from({ length: 24 }, () => Array(32));
  const bmp = Array.from({ length: SH }, () => new Uint8Array(SW));
  const dist = (a, b, br) => { const A = rgb(hex(a, br)), B = rgb(hex(b, br)); return Math.hypot(A[0] - B[0], A[1] - B[1], A[2] - B[2]); };
  for (let r = 0; r < 24; r++) for (let c = 0; c < 32; c++) {
    const bgN = new Array(8).fill(0), fgN = new Array(8).fill(0), uN = new Array(8).fill(0);
    let vote = 0;
    for (let y = r * 8; y < r * 8 + 8; y++) for (let x = c * 8; x < c * 8 + 8; x++) {
      const ch = p.c[y][x], i = idx(ch);
      (p.f[y][x] ? fgN : bgN)[i]++;
      uN[idx(p.u[y][x])]++;
      // sand wins the BRIGHT vote, so the beach never turns olive at its edge
      if (i) vote += (isBright(ch) ? 1 : -1) * (ch === 'Y' && !p.f[y][x] ? 4 : 1);
    }
    const best = (n, not) => { let b = -1; n.forEach((v, i) => { if (v && i !== not && (b < 0 || v > n[b])) b = i; }); return b; };
    let paper, ink, bright;
    const ov = p.ov.get(`${c},${r}`);
    if (ov) {
      paper = idx(ov.paper); ink = idx(ov.ink); bright = isBright(ov.paper) || isBright(ov.ink);
    } else {
      paper = best(bgN, -1);
      if (paper < 0) paper = best(uN, -1);       // all foreground: keep what is underneath
      if (paper < 0) paper = best(fgN, -1);
      ink = best(fgN, paper);
      if (ink < 0) ink = best(bgN, paper);
      if (ink < 0) ink = paper === 0 ? 7 : 0;
      bright = vote > 0;
    }
    attr[r][c] = { ink, paper, bright };
    for (let y = r * 8; y < r * 8 + 8; y++) for (let x = c * 8; x < c * 8 + 8; x++) {
      const i = idx(p.c[y][x]);
      let bit;
      if (i === paper) bit = 0;
      else if (i === ink) bit = 1;
      else if (p.f[y][x] && !ov) bit = 1;
      else bit = dist(i, ink, bright) < dist(i, paper, bright) ? 1 : 0;
      bmp[y][x] = bit;
    }
  }
  const at = (x, y) => { const a = attr[y >> 3][x >> 3]; return hex(bmp[y][x] ? a.ink : a.paper, a.bright); };
  return { attr, bmp, at };
}

// ================================================================ drawing helpers
const bayer4 = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];
const dither = (x, y, f) => (bayer4[y & 3][x & 3] + 0.5) / 16 < f;
const ellD = (x, y, cx, cy, rx, ry) => Math.hypot((x - cx) / rx, (y - cy) / ry);

// ================================================================ the scene
const ISLAND = { cx: 128, cy: 138, rx: 76, ry: 17 };
const SHALLOWS = { cx: 128, cy: 139, rx: 96, ry: 25 };
const HER = { col: 12, row: 16 };               // top-left cell of her 1x3 cells
const NOTE = { col: 13, row: 16 };              // the FLASHing note
const SHARK = { x: 20, y: 104 };
const CRAB = { x: 139, y: 136 };                // exactly one attribute row: row 17
// The text band is the bottom three rows of cells. Its two lines have different
// INKs, so they may not share a cell row: the second line keeps row 23 to
// itself and the first sits across rows 21-22, which leaves a few pixel lines
// of leading between them (the font fills all eight rows of a cell).
const BAND_ROW = 21;
const BAND_Y = [173, 184];                      // top pixel line of each line of text

// Her, three cells tall. Each cell gets two colours, so: dark hair, outline
// and headphones on sand-coloured skin; a coral (bright red) tank top; legs and
// cream shorts in outline. She is small on purpose.
// (Hair and headphones share the head cell's one INK, so the hair is drawn
// dark and the low bun sits at the nape on her left, lower right here.)
const HER_HEAD = [
  '..####..',
  '.######.',
  '##.##.##',
  '##k..k##',
  '##....##',
  '.#....##',
  '..#..###',
  '...##.#.',
];
const HER_HEAD_NOD = [                          // one pixel lower: the nod
  '........',
  '..####..',
  '.######.',
  '##.##.##',
  '##k..k##',
  '##....##',
  '.#....##',
  '..######',
];
const HER_BODY = [
  '..R..R..',
  '.RRRRRR.',
  '.RRRRRR.',
  '..RRRR..',
  '..RRRR..',
  '..RRRR..',
  '..RRRR..',
  '..RRRR..',
];
const HER_LEGS = [
  '.kkkkkk.',
  '.k....k.',
  '.k.kk.k.',
  '..k..k..',
  '..k..k..',
  '..k..k..',
  '.kk..kk.',
  '........',
];
// The shark: a fin wearing headphones, nodding to the beat.
const SHARK_FIN = [
  '....hhhhhhh.....',
  '...h.......h....',
  '..h......f..h...',
  '.hhh....ff.hhh..',
  '.hhh...fff.hhh..',
  '.hhh..ffff.hhh..',
  '.hhh.fffff.hhh..',
  '....ffffff......',
  '...fffffff......',
  '..ffffffff.f....',
  '.fffffffffff....',
];
const SHARK_FIN_NOD = [
  '................',
  '....hhhhhhh.....',
  '...h.......h....',
  '..h.....ff..h...',
  '.hhh....ff.hhh..',
  '.hhh...fff.hhh..',
  '.hhh.ffff..hhh..',
  '.hhhffffff.hhh..',
  '...fffffff......',
  '..ffffffff.f....',
  '.fffffffffff....',
];

function paintScene(p, opts = {}) {
  const rng = mulberry32(1992);                 // the run seed of the real schedule
  // ---- sky: bright blue, all the way down to the horizon
  for (let y = 0; y < 88; y++) for (let x = 0; x < SW; x++) p.bg(x, y, 'B');
  // ---- clouds: unions of discs with flat bottoms
  const cloud = (cx, cy, parts) => {
    for (const [dx, dy, r] of parts) for (let y = cy + dy - r; y <= cy + dy + r; y++) for (let x = cx + dx - r; x <= cx + dx + r; x++) {
      if (y > cy + 3) continue;
      if (Math.hypot(x - cx - dx, y - cy - dy) <= r + 0.3) p.fg(x, y, 'W');
    }
  };
  cloud(38, 74, [[-20, 0, 4], [-11, -3, 6], [0, -5, 7], [10, -2, 5], [19, 0, 4]]);
  cloud(104, 68, [[-10, 0, 3], [-3, -3, 5], [6, -1, 4], [12, 1, 2]]);
  cloud(250, 76, [[-7, 0, 3], [0, -3, 4], [7, 0, 3]]);
  // ---- gulls
  for (const [gx, gy] of [[132, 70], [143, 64]]) p.sprite(gx, gy, ['W...W', '.W.W.', '..W..'], { W: 'W' });

  // ---- sea, with a glittering horizon and wave dashes that get longer and
  // sparser as they come closer
  for (let y = 88; y < 176; y++) for (let x = 0; x < SW; x++) p.bg(x, y, 'b');
  const shark = (x, y) => (x > SHARK.x - 6 && x < SHARK.x + 24 && y > SHARK.y - 4 && y < SHARK.y + 16)
    || (x > 220 && y > 132 && y < 154);       // and keep the raft's cells clear
  const ws = opts.waveShift ? 1 : 0;
  for (let x = 0; x < SW; x++) if ((x + ws * 3) % 7 < 4) p.fg(x, 89, 'c');
  for (let y = 92; y < 176; y += 3 + Math.floor((y - 89) / 20)) {
    const near = (y - 88) / 88;
    let x = Math.floor(rng() * 10);
    while (x < SW) {
      const len = 2 + Math.floor(rng() * (2 + near * 6));
      const shift = ws * (2 + Math.floor(near * 3));
      for (let i = 0; i < len; i++) {
        const xx = x + i + shift;
        if (ellD(xx, y, SHALLOWS.cx, SHALLOWS.cy, SHALLOWS.rx + 6, SHALLOWS.ry + 4) < 1 || shark(xx, y)) continue;
        if (xx < SW) p.fg(xx, y, 'c');
      }
      x += len + 6 + Math.floor(rng() * (10 + near * 18));
    }
  }
  // ---- shallows: dithered into the deep water at the edge
  for (let y = 112; y < 176; y++) for (let x = 0; x < SW; x++) {
    const d = ellD(x, y, SHALLOWS.cx, SHALLOWS.cy, SHALLOWS.rx, SHALLOWS.ry);
    if (d < 1) p.bg(x, y, d > 0.8 ? (dither(x, y, (1 - d) / 0.2) ? 'C' : 'b') : 'C');
  }
  // ---- island: sand, and a few bushes
  for (let y = 120; y < 176; y++) for (let x = 0; x < SW; x++) {
    if (ellD(x, y, ISLAND.cx, ISLAND.cy, ISLAND.rx, ISLAND.ry) < 1) p.bg(x, y, 'Y');
  }
  const bush = (cx, cy, r) => {
    for (let y = cy - r; y <= cy + 1; y++) for (let x = cx - r * 2; x <= cx + r * 2; x++) {
      const d = Math.hypot((x - cx) / 2, y - cy);
      if (d <= r && ((x * 7 + y * 3) % 5 !== 0 || d < r - 1.5)) p.fg(x, y, 'G');
    }
  };
  bush(70, 133, 3); bush(80, 129, 2); bush(150, 127, 3); bush(162, 130, 2); bush(197, 136, 2);

  // ---- the palm: tall, slender, slightly curved, with ring marks on the bark
  const P0 = [178, 143], P1 = [164, 104], P2 = [190, 66];
  for (let s = 0; s <= 1; s += 0.002) {
    const x = (1 - s) ** 2 * P0[0] + 2 * (1 - s) * s * P1[0] + s * s * P2[0];
    const y = Math.round((1 - s) ** 2 * P0[1] + 2 * (1 - s) * s * P1[1] + s * s * P2[1]);
    const w = 4.4 - 2 * s;
    for (let i = Math.round(x - w / 2); i <= Math.round(x + w / 2); i++) {
      if (y % 4 === 0 && i >= Math.round(x)) continue;
      p.fg(i, y, 'r');                          // BRIGHT over the sky and sand, dark over the sea
    }
  }
  // fronds: a spine that arcs out and droops, leaflets hanging off both sides
  const C = [190, 64];
  const fronds = [
    // angle (0 = right, -90 = up), length, droop
    [-172, 38, 0.95], [-148, 30, 0.75], [-118, 20, 0.55], [-85, 13, 0.6],
    [-55, 22, 0.6], [-22, 32, 0.8], [-2, 38, 1.0], [150, 22, 0.55], [32, 22, 0.55],
  ];
  for (const [deg, L, droop] of fronds) {
    const a = deg * Math.PI / 180, dx = Math.cos(a), dy = Math.sin(a);
    let prev = null, run = 0, next = 2;
    const green = (x, y) => p.fg(x, y, Math.round(y) < 88 ? 'G' : 'g');   // match the cell's BRIGHT
    for (let s = 0; s <= 1; s += 0.3 / L) {
      const x = C[0] + dx * s * L, y = C[1] + dy * s * L + droop * L * s * s;
      green(x, y); green(x + 0.5, y + 1);
      if (prev) run += Math.hypot(x - prev[0], y - prev[1]);
      if (prev && s > 0.1 && run >= next) {     // a pair of leaflets every two pixels
        next += 2;
        const tx = x - prev[0], ty = y - prev[1], tl = Math.hypot(tx, ty) || 1;
        const leaf = (1 - s) * 6 + 2.5;
        for (const side of [-1, 1]) {
          const nx = -ty / tl * side;
          const lx = nx * 0.45 - tx / tl * 0.5, ly = 0.85;          // leaflets hang down and back
          for (let k = 0; k < leaf; k += 0.6) green(x + lx * k, y + ly * k);
        }
      }
      prev = [x, y];
    }
  }

  // ---- her: three cells, black hair and outline, coral top, cream shorts
  const hx = HER.col * 8, hy = HER.row * 8;
  p.sprite(hx, hy, opts.nod ? HER_HEAD_NOD : HER_HEAD, { '#': 'k', k: 'k' });
  p.sprite(hx, hy + 8, HER_BODY, { R: 'R' });
  p.sprite(hx, hy + 16, HER_LEGS, { k: 'k' });
  p.attr(HER.col, HER.row, 'k', 'Y');
  p.attr(HER.col, HER.row + 1, 'R', 'Y');
  p.attr(HER.col, HER.row + 2, 'k', 'Y');
  // the note she is nodding to; FLASH swaps its ink and paper on the beat
  p.sprite(NOTE.col * 8, NOTE.row * 8, glyph('♪'), { '#': 'k' });
  p.attr(NOTE.col, NOTE.row, opts.flash ? 'Y' : 'k', opts.flash ? 'k' : 'Y');

  // ---- the coconut that walks off with a hermit crab in it
  // (it scuttles sideways in beat-sized steps while the screen holds; legs swap each step)
  p.sprite(CRAB.x + (opts.crab || 0), CRAB.y, [
    '.......k.k',
    '..kkkk..k.',
    '.kkkkkk.k.',
    'kkkkkkkk.k',
    'kkkkkkkkk.',
    '.kkkkkk...',
    ...(opts.legs ? ['.k.kk.k...', 'k.k..k.k..'] : ['k.k..k.k..', '.k.kk.k...']),
  ], { k: 'k' });

  // ---- the raft, just off the island: four logs and two lashings
  p.sprite(227, 141, [
    '.yyyyyyyyyyyyyyyyyyyyyy.',
    'yyyy.yyyyyyyyyyyyy.yyyyy',
    '........................',
    'yyyy.yyyyyyyyyyyyy.yyyyy',
    'yyyyyyyyyyyyyyyyyyyyyyyy',
    '........................',
    'yyyy.yyyyyyyyyyyyy.yyyyy',
    '.yyyyyyyyyyyyyyyyyyyyyy.',
  ], { y: 'y' });

  // ---- the shark in headphones
  p.sprite(SHARK.x, SHARK.y, opts.nod ? SHARK_FIN_NOD : SHARK_FIN, { f: 'w', h: 'w' });
  for (let i = -3; i < 20; i++) if ((i + ws) % 3) p.fg(SHARK.x + i, SHARK.y + 11, 'w');

  // ---- a bottle, on its way back again
  p.sprite(54, 157, ['.gggggg....', 'gggggggggg.', '.gggggg....'], { g: 'g' });

  // ---- the logo, a tagline, and the black band of text at the bottom
  const logoCols = ['W', 'Y', 'Y', 'R'];
  const word = 'CASTAWAY', pitch = 30, lw = 26;
  const x0 = Math.round((SW - (word.length - 1) * pitch - lw) / 2), y0 = 8;
  [...word].forEach((ch, n) => LOGO_SRC[ch].forEach((row, j) => [...row].forEach((b, i) => {
    if (b !== '#') return;
    for (let yy = 0; yy < 2; yy++) for (let xx = 0; xx < 2; xx++) {
      const y = y0 + j * 2 + yy;
      const slit = [20, 25, 29].includes(y - y0);
      if (!slit) p.fg(x0 + n * pitch + i * 2 + xx, y, logoCols[(y - y0) >> 3]);
    }
  })));
  const tag = 'a ten-hour lo-fi island video';
  p.text(tag, Math.round((SW - tag.length * 8) / 2), 48, 'W');

  p.rect(0, BAND_ROW * 8, SW, SH - BAND_ROW * 8, 'B');
  const msg = opts.message || MESSAGES[0];
  msg.forEach((ln, k) => p.text(ln.s, Math.round((SW - ln.s.length * 8) / 2), BAND_Y[k], ln.c));
}

// The bottom two lines: MESSAGES[0] is in the loaded picture (and is what the
// reduced-motion frame shows); the others take a bar each after loading.
const MESSAGES = [
  [{ s: 'she idles. every so often', c: 'Y' }, { s: 'something happens.', c: 'C' }],
  [{ s: 'LOADED. now we wait.', c: 'W' }, { s: 'that is most of the plot.', c: 'C' }],
  [{ s: '90+ activities. four timers:', c: 'Y' }, { s: '2-5m 12-25m 30-60m 3-6h', c: 'G' }],
  [{ s: 'every sound is made by code.', c: 'M' }, { s: 'no samples. no recordings.', c: 'C' }],
];
const MSG_SLOTS = [null, [15, 18], [18, 21], [21, 24]];

// ================================================================ build the screens
const basePic = new Pic(); paintScene(basePic);
const base = convert(basePic);
const variant = (opts) => { const p = new Pic(); paintScene(p, opts); return convert(p); };

// ================================================================ PNG (debugging only)
function writePNG(file, w, h, colourAt, scale = 4) {
  const W = w * scale, H = h * scale;
  const raw = Buffer.alloc((W * 3 + 1) * H);
  for (let y = 0; y < H; y++) {
    raw[y * (W * 3 + 1)] = 0;
    for (let x = 0; x < W; x++) {
      const [r, g, b] = rgb(colourAt(Math.floor(x / scale), Math.floor(y / scale)));
      const o = y * (W * 3 + 1) + 1 + x * 3; raw[o] = r; raw[o + 1] = g; raw[o + 2] = b;
    }
  }
  const crcT = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
  const crc = (buf) => { let c = 0xffffffff; for (const b of buf) c = crcT[(c ^ b) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
  const chunk = (type, data) => { const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const td = Buffer.concat([Buffer.from(type), data]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([len, td, c]); };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4); ihdr[8] = 8; ihdr[9] = 2;
  fs.writeFileSync(file, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]));
}
if (arg('png')) writePNG(arg('png'), SW, SH, base.at);
if (arg('crop')) { const [cx, cy, cw, ch] = arg('crop').split(',').map(Number); writePNG(arg('cropfile'), cw, ch, (x, y) => base.at(cx + x, cy + y), 10); }
if (arg('mono')) writePNG(arg('mono'), SW, SH, (x, y) => (base.bmp[y][x] ? '#000000' : '#d8d8d8'));

// ================================================================ SVG helpers
const num = (v) => +v.toFixed(3);
// Merge a boolean grid into rectangles (runs, then runs stacked vertically).
function rectPath(test, w, h, unit = 1) {
  const out = [];
  let open = new Map();
  for (let y = 0; y <= h; y++) {
    const runs = [];
    if (y < h) {
      let x = 0;
      while (x < w) {
        if (test(x, y)) { const s0 = x; while (x < w && test(x, y)) x++; runs.push([s0, x]); } else x++;
      }
    }
    const next = new Map();
    for (const [a, b] of runs) {
      const k = `${a},${b}`, o = open.get(k);
      if (o) { o.h++; next.set(k, o); open.delete(k); } else next.set(k, { x: a, y, w: b - a, h: 1 });
    }
    for (const o of open.values()) out.push(o);
    open = next;
  }
  return out.map((o) => `M${o.x * unit} ${o.y * unit}h${o.w * unit}v${o.h * unit}h-${o.w * unit}z`).join('');
}
// Runs of set pixels on the given lines, as a 1-unit-wide stroke path.
function linePath(ys, bits) {
  let d = '';
  for (const y of ys) {
    let x = 0, first = true, last = 0;
    while (x < SW) {
      if (bits[y][x]) {
        const s0 = x;
        while (x < SW && bits[y][x]) x++;
        d += first ? `M${s0} ${y + 0.5}h${x - s0}` : `m${s0 - last} 0h${x - s0}`;
        first = false; last = x;
      } else x++;
    }
  }
  return d;
}
const textBits = (str, col, row, inverse = []) => {
  const bits = Array.from({ length: SH }, () => new Uint8Array(SW));
  [...str].forEach((ch, i) => glyph(ch).forEach((r, j) => [...r].forEach((b, k) => {
    const on = (b === '#') !== inverse.includes(i);
    if (on) bits[row * 8 + j][(col + i) * 8 + k] = 1;
  })));
  return bits;
};

// ================================================================ CSS timeline
const css = [];
// a property stepped through [time, declaration] pairs over the whole loop
function timeline(cls, frames) {
  const kf = frames.map(([s0, v]) => `${pc(s0)}{${v}}`).join('');
  css.push(`@keyframes ${cls}{${kf}100%{${frames[frames.length - 1][1]}}}`);
  css.push(`.${cls}{${frames[0][1]};animation:${cls} ${T}s steps(1,end) infinite}`);
}
// on for the second half of every period (a beat-synced two-frame toggle)
function toggle(cls, period) {
  css.push(`@keyframes ${cls}{0%{opacity:0}50%{opacity:1}100%{opacity:1}}`);
  css.push(`.${cls}{opacity:0;animation:${cls} ${period}s steps(1,end) infinite}`);
}

// ================================================================ the border
// Pilot: about 10 lines per half-pulse, so thick bands, red and cyan. Data: a
// half-pulse is about 4 lines for a 0 bit and 8 for a 1 bit, blue and yellow.
// The data stripes are the bits of "CASTAWAY", in order.
const PILOT_P = 20;
const dataStripes = [];
{
  let y = 0, n = 0;
  for (const ch of 'CASTAWAY') {
    const v = ch.charCodeAt(0);
    for (let b = 7; b >= 0; b--) {
      const h = (v >> b) & 1 ? 8 : 4;
      for (let half = 0; half < 2; half++) { dataStripes.push({ y, h, c: n % 2 ? '#d8d800' : '#0000d8' }); y += h; n++; }
    }
  }
}
const DATA_P = dataStripes.reduce((a, s0) => a + s0.h, 0);
// Both roll in whole pixels and slowly, for photosensitivity: a run of 0 bits
// is a stack of 4-pixel stripes, so at 15 px a second one point of the border
// changes colour at most about 4 times a second (2 flashes, under the limit of
// 3), and the pilot's 10-pixel bands at 25 px a second change 2.5 times.
const DATA_ROLL = 360;                                            // px per 24-s loop: 15 px a second
const pilotDur = 0.8;                                             // 20 px in 0.8 s: 25 px a second

const HOLD_BORDER = '#0000d8';                  // once loaded, the border matches the sea
timeline('bd', [[0, `fill:${HOLD_BORDER}`], [t.cls, 'fill:#d8d8d8'], [t.done, `fill:${HOLD_BORDER}`]]);
timeline('pv', [[0, 'opacity:0'], [t.pilot1, 'opacity:1'], [t.head, 'opacity:0'], [t.pilot2, 'opacity:1'], [t.data, 'opacity:0']]);
timeline('dv', [[0, 'opacity:0'], [t.head, 'opacity:1'], [t.gap, 'opacity:0'], [t.data, 'opacity:1'], [t.done, 'opacity:0']]);
css.push(`@keyframes ps{from{transform:translateY(-${PILOT_P}px)}to{transform:translateY(0)}}.ps{animation:ps ${pilotDur}s steps(${PILOT_P},end) infinite}`);
css.push(`@keyframes ds{from{transform:translateY(-${DATA_ROLL}px)}to{transform:translateY(0)}}.ds{animation:ds ${T}s steps(${DATA_ROLL},end) infinite}`);

// ================================================================ the picture
// One path per pixel line of the bitmap, arriving in memory order: line y is
// in step n = third * 8 + (pixel line within its character row), 24 steps,
// and inside a step the eight character rows of that third take their turn,
// top to bottom, so each step is a quick sweep down the third (the venetian
// blind, drawn one pixel line at a time as the bytes come in).
const lineTime = (y) => layerTime((y >> 6) * 8 + (y & 7)) + ((y >> 3) & 7) * (t.step / 8);
const bitLines = [];
for (let y = 0; y < SH; y++) {
  const d = linePath([y], base.bmp);
  if (d) bitLines.push({ y, d });
}
// Every line shares one keyframe: on for 10 s from its own start time (set
// by animation-delay), off for the other 14. A line only matters while its
// row is under a white cover (3 s until the colour reaches it, by 14.2 s), and
// every start time lies between 7 and 13 s, so on-for-10 covers every case.
css.push(`@keyframes m{0%{opacity:1}${pc(10)}{opacity:0}100%{opacity:0}}.m{opacity:0;animation:m ${T}s steps(1,end) infinite}`);
for (const l of bitLines) css.push(`.l${l.y}{animation-delay:${num(lineTime(l.y))}s}`);
// PAPER cells, then INK cells shown through the bitmap
const paperHex = (r, c) => hex(base.attr[r][c].paper, base.attr[r][c].bright);
const inkHex = (r, c) => hex(base.attr[r][c].ink, base.attr[r][c].bright);
const cellInked = (r, c) => { for (let y = r * 8; y < r * 8 + 8; y++) for (let x = c * 8; x < c * 8 + 8; x++) if (base.bmp[y][x]) return true; return false; };
const papers = [...new Set(base.attr.flat().map((a) => hex(a.paper, a.bright)))];
const inks = [...new Set(base.attr.flatMap((row, r) => row.flatMap((a, c) => (cellInked(r, c) ? [hex(a.ink, a.bright)] : []))))];
const paperLayer = papers.map((h) => `<path fill="${h}" d="${rectPath((c, r) => paperHex(r, c) === h, 32, 24, 8)}"/>`).join('\n');
const inkLayer = inks.map((h) => `<path fill="${h}" d="${rectPath((c, r) => inkHex(r, c) === h && cellInked(r, c), 32, 24, 8)}"/>`).join('\n');
// The colour picture is always there underneath. While loading, each row of
// cells is covered by white paper carrying its share of the black bitmap, and
// the colour arrives by taking those covers away, one attribute row at a time.
for (let r = 0; r < 24; r++) timeline(`v${r}`, [[0, 'opacity:0'], [t.cls, 'opacity:1'], [t.attrs + (r + 1) * t.attrStep, 'opacity:0']]);

// "Program: CASTAWAY", printed after the header block, then overwritten line by
// line as the first third of the picture arrives
const progBits = textBits('Program: CASTAWAY', 0, 0);
const progLines = Array.from({ length: 8 }, (_, k) => {
  timeline(`p${k}`, [[0, 'opacity:0'], [t.gap, 'opacity:1'], [layerTime(k), 'opacity:0']]);
  return `<path class="p${k}" d="${linePath([k], progBits)}"/>`;
}).join('');
// LOAD "" typed at the bottom, with the inverse L cursor after it
const loadBits = textBits('LOAD ""L', 0, 23, [7]);
timeline('ld', [[0, 'opacity:0'], [t.cls, 'opacity:1'], [t.pilot1, 'opacity:0']]);
const loadLine = `<path class="ld" d="${linePath(Array.from({ length: 8 }, (_, k) => 184 + k), loadBits)}"/>`;

// ================================================================ the hold: small changes on the beat
function overlay(v, cls) {
  const cols = new Set();
  for (let y = 0; y < SH; y++) for (let x = 0; x < SW; x++) { const a = v.at(x, y); if (a !== base.at(x, y)) cols.add(a); }
  const paths = [...cols].map((h) => `<path fill="${h}" d="${rectPath((x, y) => { const a = v.at(x, y); return a === h && a !== base.at(x, y); }, SW, SH)}"/>`);
  return `<g class="${cls}">${paths.join('')}</g>`;
}
timeline('hd', [[0, 'opacity:1'], [t.cls, 'opacity:0'], [t.done, 'opacity:1']]);
toggle('nd', BEAT * 2);                         // her head and the shark: down on every other beat
toggle('fl', BEAT * 2);                         // FLASH, on the beat
toggle('wv', 3);                                // the waves shift every half bar
const holdParts = [
  overlay(variant({ nod: true }), 'nd'),
  overlay(variant({ flash: true }), 'fl'),
  overlay(variant({ waveShift: true }), 'wv'),
];
// the coconut walks: out three pixels a beat, a pause, and back, home by the loop point
{
  const path = [0, 3, 5, 8, 10, 13, 15, 15, 12, 9, 6, 3];          // one entry per beat from 15 s
  path.forEach((dx, i) => {
    if (!dx) return;
    const a = t.done + i * BEAT, b = a + BEAT;
    timeline(`c${i}`, [[0, 'opacity:0'], [a, 'opacity:1'], ...(b < T - 1e-6 ? [[b, 'opacity:0']] : [])]);
    holdParts.push(overlay(variant({ crab: dx, legs: i % 2 }), `c${i}`));
  });
}
MESSAGES.forEach((m, i) => {
  if (!MSG_SLOTS[i]) return;
  const [a, b] = MSG_SLOTS[i];
  timeline(`g${i}`, [[0, 'opacity:0'], [a, 'opacity:1'], ...(b < T ? [[b, 'opacity:0']] : [])]);
  holdParts.push(overlay(variant({ message: m }), `g${i}`));
});

// ================================================================ assemble
css.push('@media (prefers-reduced-motion:reduce){*{animation:none!important}}');
const escXml = (s0) => s0.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const title = 'CASTAWAY: an 8-bit tape loading screen for a ten-hour lo-fi island video';
const desc = 'A small TV showing an 8-bit home computer with a blue border. It holds a finished loading screen: CASTAWAY in chunky white, yellow and red letters on a blue sky, '
  + 'the line a ten-hour lo-fi island video, clouds and two gulls, a tall palm on a small sandy island, a young woman with her dark hair in a low bun, headphones and a coral top, nodding beside a flashing music note, '
  + 'a coconut on hermit-crab legs that scuttles off and back, a raft, a bottle, and a shark fin wearing headphones, nodding too. Then the screen clears to white, LOAD "" appears, '
  + 'the border fills with rolling red and cyan bands, then thin blue and yellow stripes, Program: CASTAWAY is printed, and the picture loads again in black and white '
  + 'in the machine\'s interleaved order before the colour sweeps down it row by row. Once loaded, the bottom lines take turns: she idles, every so often something happens; '
  + 'loaded, now we wait, that is most of the plot; 90+ activities, four timers; every sound is made by code, no samples, no recordings.';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VW} ${VH}" width="${VW * 2}" height="${VH * 2}" shape-rendering="crispEdges" role="img" aria-labelledby="ttl dsc">
<title id="ttl">${escXml(title)}</title>
<desc id="dsc">${escXml(desc)}</desc>
<style>
${css.join('\n')}
</style>
<defs>
<clipPath id="tube"><rect x="${BEZEL}" y="${BEZEL}" width="${FW}" height="${FH}" rx="8"/></clipPath>
<clipPath id="bord"><path clip-rule="evenodd" d="M${BEZEL} ${BEZEL}h${FW}v${FH}h-${FW}zM${OX} ${OY}v${SH}h${SW}v-${SH}z"/></clipPath>
<pattern id="pil" width="${FW}" height="${PILOT_P}" patternUnits="userSpaceOnUse"><rect width="${FW}" height="${PILOT_P / 2}" fill="#d80000"/><rect y="${PILOT_P / 2}" width="${FW}" height="${PILOT_P / 2}" fill="#00d8d8"/></pattern>
<pattern id="dat" width="${FW}" height="${DATA_P}" patternUnits="userSpaceOnUse">${dataStripes.map((st) => `<rect y="${st.y}" width="${FW}" height="${st.h}" fill="${st.c}"/>`).join('')}</pattern>
${bitLines.map((l) => `<path id="q${l.y}" fill="none" d="${l.d}"/>`).join('\n')}
<mask id="bm" maskUnits="userSpaceOnUse" x="0" y="0" width="${SW}" height="${SH}"><g stroke="#fff">${bitLines.map((l) => `<use href="#q${l.y}"/>`).join('')}</g></mask>
<radialGradient id="vig" cx="50%" cy="50%" r="72%"><stop offset="0.7" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.2"/></radialGradient>
<linearGradient id="glass" x1="0" y1="0" x2="0.55" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0.11"/><stop offset="0.45" stop-color="#fff" stop-opacity="0"/></linearGradient>
</defs>
<rect width="${VW}" height="${VH}" rx="16" fill="#1d1f25"/>
<rect x="1" y="1" width="${VW - 2}" height="${VH - 2}" rx="15" fill="none" stroke="#3a3d46" stroke-width="1" shape-rendering="geometricPrecision"/>
<g clip-path="url(#tube)">
<rect class="bd" x="${BEZEL}" y="${BEZEL}" width="${FW}" height="${FH}"/>
<g clip-path="url(#bord)">
<g class="pv"><rect class="ps" x="${BEZEL}" y="${BEZEL}" width="${FW}" height="${FH + PILOT_P}" fill="url(#pil)"/></g>
<g class="dv"><rect class="ds" x="${BEZEL}" y="${BEZEL}" width="${FW}" height="${FH + DATA_P}" fill="url(#dat)"/></g>
</g>
<g transform="translate(${OX} ${OY})">
${paperLayer}
<g mask="url(#bm)">
${inkLayer}
</g>
${Array.from({ length: 24 }, (_, r) => `<g class="v${r}"><rect y="${r * 8}" width="${SW}" height="8" fill="#d8d8d8"/><g fill="none" stroke="#000">`
  + bitLines.filter((l) => l.y >> 3 === r).map((l) => `<use href="#q${l.y}" class="m l${l.y}"/>`).join('')
  + (r === 0 ? progLines : '') + (r === 23 ? loadLine : '') + '</g></g>').join('\n')}
<g class="hd">
${holdParts.join('\n')}
</g>
</g>
<rect x="${BEZEL}" y="${BEZEL}" width="${FW}" height="${FH}" fill="url(#vig)"/>
<rect x="${BEZEL}" y="${BEZEL}" width="${FW}" height="${FH}" fill="url(#glass)"/>
</g>
</svg>
`;
fs.writeFileSync(OUT, svg);
console.log(`wrote ${path.relative(process.cwd(), OUT)}: ${(svg.length / 1024).toFixed(1)} KB; data stripes ${DATA_P} px, rolling ${DATA_ROLL / T} px a second`);
