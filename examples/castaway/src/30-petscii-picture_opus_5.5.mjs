#!/usr/bin/env node
// 30-petscii-picture_opus_5.5: the "PETSCII picture" README header for Castaway.
//
// A Commodore 64 text-mode picture, drawn the way PETSCII artists draw: a
// 40x25 screen of 8x8 character cells, ONE background colour for the whole
// picture ($D021, here cyan: the sky), and one foreground colour per cell.
// Every cell holds a glyph from a C64-style character set (blocks, quarter
// blocks, wedges, lines, arcs, a circle, a club, a spade, a pi, ROM capitals)
// or its reverse.
// The glyph shapes are redrawn here as plain 8x8 bitmaps; nothing is ripped.
//
// The rule is enforced, not imitated: the picture is a cell model, so a cell
// can never show two foreground colours. Where the sand meets the sea, the
// cell shows yellow and cyan, and the cyan reads as shallow water. The title
// is written in reverse video in the sea, so its letters are the background
// colour: the sky shows through the water.
//
// Animation is cell changes only, on the music's grid (80 BPM: a beat is
// 0.75 s, a bar 3 s, the loop 20 bars = 60 s, like the project's theme). A
// timeline function builds the screen for every quarter beat; the generator
// diffs the 320 screens, finds the cells that change, and emits each state as
// a group with a step-end opacity track (shortened to its own period when it
// repeats). No smooth movement anywhere.
//
// It writes two SVGs: the animated picture, and its still frame with the colour
// switched off (every character in light blue on blue, the C64 start-up look).
//
//   node 30-petscii-picture_opus_5.5.mjs          regenerate both SVGs
//   node 30-petscii-picture_opus_5.5.mjs --text   also print the screen as text
//
// Plain Node, no dependencies, no randomness: every cell is placed by hand.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, '..', 'assets', '30-petscii-picture_opus_5.5.svg');
const SHOW_TEXT = process.argv.includes('--text');

// ---------------------------------------------------------------- palette
// The 16 fixed VIC-II colours ("Colodore" measurements), by C64 colour number.
const PAL = [
  '#000000', '#ffffff', '#813338', '#75cec8', '#8e3c97', '#56ac4d', '#2e2c9b', '#edf171',
  '#8e5029', '#553800', '#c46c71', '#4a4a4a', '#7b7b7b', '#a9ff9f', '#706deb', '#b2b2b2',
];
const NAMES = ['black', 'white', 'red', 'cyan', 'purple', 'green', 'blue', 'yellow',
  'orange', 'brown', 'light red', 'dark grey', 'grey', 'light green', 'light blue', 'light grey'];
const BG = 3;       // $D021: cyan, the sky. The one background colour.
const BORDER = 14;  // $D020: light blue, the C64's own default border.

// ---------------------------------------------------------------- geometry
const COLS = 40, ROWS = 25, CELL = 8;
const BX = 32, BY = 28;                              // border, in C64 pixels
const W = COLS * CELL + BX * 2, H = ROWS * CELL + BY * 2;

// ---------------------------------------------------------------- timeline
const BEAT = 0.75, BAR = 3, LOOP = 60;              // 80 BPM, 20 bars of 3 s
const STEP = BEAT / 4;                               // quarter beat
const N = Math.round(LOOP / STEP);                   // 320 screens per loop
const SB = 4, SBAR = 16;                             // steps per beat, per bar
// The still frame for reduced motion: the coconut walking off, crab inside.
const STILL = 176;

// ---------------------------------------------------------------- the character set
// Each glyph is an 8x8 bitmap (64 bytes, 1 = foreground). Only shapes the C64
// ROM offers, or their reverse, are allowed in the picture.
const GLYPH = new Map();
const def = (name, fn) => {
  const b = new Uint8Array(64);
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) b[y * 8 + x] = fn(x, y) ? 1 : 0;
  GLYPH.set(name, b);
};
const defRows = (name, rows) => def(name, (x, y) => rows[y][x] === '#');

// Quarter blocks: bit 1 upper left, 2 upper right, 4 lower left, 8 lower right.
const QUAD = { '▘': 1, '▝': 2, '▀': 3, '▖': 4, '▌': 5, '▞': 6, '▛': 7, '▗': 8, '▚': 9, '▐': 10, '▜': 11, '▄': 12, '▙': 13, '▟': 14, '█': 15 };
for (const [ch, m] of Object.entries(QUAD)) def(ch, (x, y) => m & ((y < 4 ? 1 : 4) << (x < 4 ? 0 : 1)));
def(' ', () => 0);
// Wedges. The ROM has the two upper triangles; the lower two are their reverse.
def('◤', (x, y) => x + y <= 7);
def('◥', (x, y) => x >= y);
def('◢', (x, y) => x + y >= 8);
def('◣', (x, y) => x < y);
// Bars and lines (verticals two pixels wide, as the C64 font draws them).
def('▔', (x, y) => y === 0);
def('▁', (x, y) => y === 7);
def('▂', (x, y) => y >= 6);
def('▃', (x, y) => y >= 5);
def('▆', (x, y) => y >= 2);
def('▇', (x, y) => y >= 1);
def('▏', (x) => x <= 1);
def('▕', (x) => x >= 6);
def('─', (x, y) => y === 3 || y === 4);
def('│', (x) => x === 3 || x === 4);
def('╱', (x, y) => x + y >= 6 && x + y <= 8);
def('╲', (x, y) => y - x >= -1 && y - x <= 1);
def('▒', (x, y) => ((x >> 1) + y) % 2 === 0);
defRows('╭', ['........', '........', '........', '.....###', '....####', '...###..', '...##...', '...##...']);
defRows('╮', ['........', '........', '........', '###.....', '####....', '..###...', '...##...', '...##...']);
defRows('╰', ['...##...', '...##...', '...###..', '....####', '.....###', '........', '........', '........']);
defRows('╯', ['...##...', '...##...', '..###...', '####....', '###.....', '........', '........', '........']);
defRows('●', ['..####..', '.######.', '########', '########', '########', '########', '.######.', '..####..']);
defRows('○', ['..####..', '.##..##.', '##....##', '##....##', '##....##', '##....##', '.##..##.', '..####..']);
defRows('π', ['........', '........', '.######.', '########', '.##..##.', '.##..##.', '##....##', '........']);
defRows('♣', ['...##...', '..####..', '..####..', '##.##.##', '########', '##.##.##', '...##...', '..####..']);
defRows('♠', ['...##...', '..####..', '.######.', '########', '########', '.##.###.', '...##...', '..####..']);

// ROM-style capitals and punctuation (C64-like: two-pixel verticals).
const FONT_SRC = `
A ...##... ..####.. .##..##. .######. .##..##. .##..##. .##..##. ........
B .#####.. .##..##. .##..##. .#####.. .##..##. .##..##. .#####.. ........
C ..####.. .##..##. .##..... .##..... .##..... .##..##. ..####.. ........
D .####... .##.##.. .##..##. .##..##. .##..##. .##.##.. .####... ........
E .######. .##..... .##..... .####... .##..... .##..... .######. ........
F .######. .##..... .##..... .####... .##..... .##..... .##..... ........
G ..####.. .##..##. .##..... .##.###. .##..##. .##..##. ..####.. ........
H .##..##. .##..##. .##..##. .######. .##..##. .##..##. .##..##. ........
I ..####.. ...##... ...##... ...##... ...##... ...##... ..####.. ........
J ...####. ....##.. ....##.. ....##.. ....##.. .##.##.. ..###... ........
K .##..##. .##.##.. .####... .###.... .####... .##.##.. .##..##. ........
L .##..... .##..... .##..... .##..... .##..... .##..... .######. ........
M .##...## .###.### .####### .##.#.## .##...## .##...## .##...## ........
N .##..##. .###.##. .######. .######. .##.###. .##..##. .##..##. ........
O ..####.. .##..##. .##..##. .##..##. .##..##. .##..##. ..####.. ........
P .#####.. .##..##. .##..##. .#####.. .##..... .##..... .##..... ........
Q ..####.. .##..##. .##..##. .##..##. .##..##. ..####.. ....###. ........
R .#####.. .##..##. .##..##. .#####.. .####... .##.##.. .##..##. ........
S ..####.. .##..##. .##..... ..####.. .....##. .##..##. ..####.. ........
T .######. ...##... ...##... ...##... ...##... ...##... ...##... ........
U .##..##. .##..##. .##..##. .##..##. .##..##. .##..##. ..####.. ........
V .##..##. .##..##. .##..##. .##..##. .##..##. ..####.. ...##... ........
W .##...## .##...## .##...## .##.#.## .####### .###.### .##...## ........
X .##..##. .##..##. ..####.. ...##... ..####.. .##..##. .##..##. ........
Y .##..##. .##..##. .##..##. ..####.. ...##... ...##... ...##... ........
Z .######. .....##. ....##.. ...##... ..##.... .##..... .######. ........
0 ..####.. .##..##. .##.###. .###.##. .##..##. .##..##. ..####.. ........
1 ...##... ..###... ...##... ...##... ...##... ...##... .######. ........
2 ..####.. .##..##. .....##. ....##.. ...##... ..##.... .######. ........
3 ..####.. .##..##. .....##. ...###.. .....##. .##..##. ..####.. ........
4 .....##. ....###. ...####. .##..##. .####### .....##. .....##. ........
5 .######. .##..... .#####.. .....##. .....##. .##..##. ..####.. ........
6 ..####.. .##..##. .##..... .#####.. .##..##. .##..##. ..####.. ........
7 .######. .##..##. ....##.. ...##... ...##... ...##... ...##... ........
8 ..####.. .##..##. .##..##. ..####.. .##..##. .##..##. ..####.. ........
9 ..####.. .##..##. .##..##. ..#####. .....##. .##..##. ..####.. ........
. ........ ........ ........ ........ ........ ...##... ...##... ........
, ........ ........ ........ ........ ........ ...##... ...##... ..##....
: ........ ........ ...##... ........ ........ ...##... ........ ........
- ........ ........ ........ .######. ........ ........ ........ ........
/ ........ ......## .....##. ....##.. ...##... ..##.... .##..... ........
+ ........ ...##... ...##... .######. ...##... ...##... ........ ........
* ........ .##..##. ..####.. ######## ..####.. .##..##. ........ ........
' ...##... ...##... ..##.... ........ ........ ........ ........ ........
! ...##... ...##... ...##... ...##... ........ ........ ...##... ........
( ....##.. ...##... ..##.... ..##.... ..##.... ...##... ....##.. ........
) ..##.... ...##... ....##.. ....##.. ....##.. ...##... ..##.... ........
`;
for (const line of FONT_SRC.trim().split('\n')) {
  const [key, ...rows] = line.trim().split(/\s+/);
  if (rows.length !== 8) throw new Error(`bad font row for ${key}`);
  defRows(key, rows.map((r) => r.slice(0, 8)));
}

// ---------------------------------------------------------------- the screen model
// A cell is { g: glyph, c: colour, rev: reverse video } or null (background).
class Screen {
  constructor() { this.cells = new Array(COLS * ROWS).fill(null); }
  clone() { const s = new Screen(); s.cells = this.cells.slice(); return s; }
  put(x, y, g, c, rev = false) {
    if (x < 0 || y < 0 || x >= COLS || y >= ROWS) return;
    if (!GLYPH.has(g)) throw new Error(`no glyph "${g}" at ${x},${y}`);
    if (c === 0) throw new Error(`colour 0 (black) at ${x},${y}: it is always daytime`);
    this.cells[y * COLS + x] = g === ' ' && !rev ? null : { g, c, rev };
  }
  clear(x, y) { if (x >= 0 && y >= 0 && x < COLS && y < ROWS) this.cells[y * COLS + x] = null; }
  get(x, y) { return this.cells[y * COLS + x]; }
  // A stamp is rows of glyphs plus rows of hex colours; '.' is transparent,
  // '_' clears the cell to the background.
  stamp(x0, y0, art, opts = {}) {
    const gRows = art.g, cRows = art.c;
    gRows.forEach((gr, j) => {
      const gs = [...gr], cs = [...cRows[j]];
      if (gs.length !== cs.length) throw new Error(`stamp row ${j} lengths differ: "${gr}"`);
      gs.forEach((g, i) => {
        if (g === '.') return;
        if (g === '_') { this.clear(x0 + i, y0 + j); return; }
        const c = parseInt(cs[i], 16);
        if (Number.isNaN(c)) throw new Error(`stamp row ${j} col ${i}: glyph "${g}" has no colour`);
        this.put(x0 + i, y0 + j, g, c, !!opts.rev);
      });
    });
  }
  text(x, y, str, c, rev = false) {
    [...str].forEach((ch, i) => this.put(x + i, y, ch, c, rev));
  }
}
const art = (g, c) => ({ g, c });

// ---------------------------------------------------------------- the picture
const HORIZON = 15;          // first sea row
const TITLE_ROW = 18;        // CASTAWAY, 5 rows tall, written in the sea
const CAPTION_ROW = 24;

// The sun: a wedge disc with rays that swap between straight and diagonal on
// every bar (a two-frame character swap).
const SUN_DISC = art(
  ['.....', '.◢█◣.', '.███.', '.◥█◤.', '.....'],
  ['.....', '.777.', '.777.', '.777.', '.....']);
const SUN_RAYS_A = art(['..│..', '.....', '─...─', '.....', '..│..'], ['..1..', '.....', '1...1', '.....', '..1..']);
const SUN_RAYS_B = art(['╲...╱', '.....', '.....', '.....', '╱...╲'], ['1...1', '.....', '.....', '.....', '1...1']);

const CLOUD_BIG = art(
  ['....▗▄▖...', '.▗▄▟███▙▄▖', '▟████████▙', '▀▀▀▀▀▀▀▀▀▀'],
  ['....111...', '.111111111', '1111111111', 'ffffffffff']);
const CLOUD_SMALL = art(
  ['..▗▄▖..', '▗▟███▙▖', '▀▀▀▀▀▀▀'],
  ['..111..', '1111111', 'fffffff']);

// The palm crown, as [row, first column, glyphs, colour] runs. Two big arched
// fronds in light green rise from the crown and droop to a point; under them,
// their leaflets are green wedge pairs (a sawtooth). Mid fronds in light
// green, hanging fronds in green, two coconuts. Where the greens meet, the
// cells clash on purpose.
const CROWN = [
  [0, 15, '▗▄▄▖', 13], [0, 21, '◢◣', 13], [0, 25, '▗▄▄▄▖', 13],
  [1, 13, '▗▟████◣', 13], [1, 20, '◢██◣', 13], [1, 24, '◢█████▙▖', 13],
  [2, 12, '◢█', 13], [2, 14, '◤◥◤◥◤', 5], [2, 19, '██████', 5], [2, 25, '◥◤◥◤◥', 5], [2, 30, '█◣', 13],
  [3, 11, '◢◤', 13], [3, 14, '▗▄▄▄▄', 13], [3, 19, '██', 5], [3, 21, '●●', 9], [3, 23, '██', 5], [3, 25, '▄▄▄▄▖', 13], [3, 31, '◥◣', 13],
  [4, 10, '◢◤', 13], [4, 13, '◢█▀', 13], [4, 17, '◢█◤', 5], [4, 24, '◥█◣', 5], [4, 27, '▀█◣', 13], [4, 32, '◥◣', 13],
  [5, 10, '▘', 13], [5, 12, '◢◤', 13], [5, 16, '◢█◤', 5], [5, 25, '◥█◣', 5], [5, 29, '◥◣', 13], [5, 33, '▝', 13],
  [6, 12, '▘', 13], [6, 15, '◢◤', 5], [6, 27, '◥◣', 5], [6, 30, '▝', 13],
  [7, 15, '▘', 5], [7, 28, '▝', 5],
];
// Trunk: one cell wide, leaning, drawn in half-cell steps (left/right halves),
// segments alternating brown and orange by row.
const TRUNK = [ // [row, half-column of its left edge]
  [4, 43], [5, 43], [6, 44], [7, 44], [8, 45], [9, 46], [10, 47], [11, 48], [12, 49], [13, 50],
];
const BUSHES = [
  [13, 14, '♣♠♣', 5], [12, 18, '▚▞', 7], [13, 17, '▗██▖', 7],
  [13, 23, '♣♠', 5], [13, 26, '♣', 13],
];

// Her: 4 cells wide, 8 tall, facing us. Big headphones (the band arches over
// her brown hair from cup to cup, a round cup at each ear), coral tank top,
// shorts, bare feet. The C64 has no cream: the headphones are white and the
// shorts its pale yellow (white shorts on a block that size read as a nappy).
const HER_X = 9, HER_Y = 6;
const HER = art(
  ['╭──╮', '│▟▙│', '●██●', '▐██▌', '▐██▌', '▝██▘', '.▌▐.', '.▌▐.'],
  ['1111', '1991', '1881', '8aa8', '8aa8', '8778', '.88.', '.88.']);
// Music leaking out of the headphones: on every beat a pair of brackets sits
// beside the cups, then steps one cell further out, then is gone.
const ARCS_NEAR = art(['(....)'], ['1....1']);
const ARCS_FAR = art(['(......)'], ['1......1']);

// A sea turtle: a light green head low at the front, a green domed shell.
const TURTLE_L = art(['▗▟█▙'], ['d555']);
const TURTLE_R = art(['▟█▙▖'], ['555d']);
const SAILBOAT = art(['.◢.', '▗▄▖'], ['.1.', '222']);
const RAFT = art(['█████'], ['98889']);
const GULL_UP = art(['╲╱'], ['11']);
const GULL_DOWN = art(['╱╲'], ['11']);

const ISLAND = art(
  [
    '.◢████████████████████████◣.',
    '◥▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀◤',
  ],
  [
    '.77777777777777777777777777.',
    '7777777777777777777777777777',
  ]);
const ISLAND_X = 6;
// Foam under the island: white scallops on the shallows (cyan), two frames
// that swap every half bar.
const FOAM_X = 6, FOAM_W = 28;
const FOAM = ['╰╯_╰─╯_╰╯__╰╯╰╯_╰─╯__╰╯_╰╯╰╯', '_╰╯_╰─╯_╰╯╰╯__╰╯_╰─╯╰╯__╰─╯╰'];
for (const f of FOAM) if ([...f].length !== FOAM_W) throw new Error(`foam frame is ${[...f].length} cells, not ${FOAM_W}`);
const foam = (phase) => art([FOAM[phase]], [FOAM[phase].replace(/[^_]/g, '1')]);

// Block-glyph title letters: the shape is the cyan part, so each cell is the
// reverse of its glyph in blue. 3 cells wide (W is 5), 5 rows tall.
const LETTERS = {
  C: ['◢█◣', '█..', '█..', '█..', '◥█◤'],
  A: ['◢█◣', '█.█', '███', '█.█', '█.█'],
  S: ['◢█◣', '█..', '◥█◣', '..█', '◥█◤'],
  T: ['███', '.█.', '.█.', '.█.', '.█.'],
  W: ['█...█', '█...█', '█.█.█', '█.█.█', '◥███◤'],
  Y: ['█.█', '█.█', '◥█◤', '.█.', '.█.'],
};
// Reverse of a wedge is the opposite wedge; reverse of a full cell is empty.
// Cells where a letter is solid (pure background): the glint can run through them.
const TITLE_SOLID = new Set();
function titleCells(word, x0, y0, scr) {
  let x = x0;
  for (const ch of word) {
    const L = LETTERS[ch];
    L.forEach((row, j) => [...row].forEach((g, i) => {
      if (g === '.') return;                        // stays sea
      if (g === '█') { scr.clear(x + i, y0 + j); TITLE_SOLID.add((y0 + j) * COLS + x + i); return; } // the sky shows through
      scr.put(x + i, y0 + j, g, 6, true);           // reverse wedge in blue
    }));
    x += [...L[0]].length + 1;
  }
  return x - 1 - x0;
}

function baseScreen() {
  const s = new Screen();
  for (let y = HORIZON; y < ROWS; y++) for (let x = 0; x < COLS; x++) s.put(x, y, '█', 6);
  // the far sea shimmers: the checkerboard glyph in blue over the cyan
  for (let x = 0; x < COLS; x++) s.put(x, HORIZON, '▒', 6);
  s.stamp(1, 0, SUN_DISC);
  s.stamp(32, 0, CLOUD_BIG);
  s.stamp(0, 9, CLOUD_SMALL);
  // trunk
  TRUNK.forEach(([r, h], i) => {
    const c = i % 2 ? 8 : 9;
    if (h % 2 === 0) s.put(h / 2, r, '█', c);
    else { s.put((h - 1) / 2, r, '▐', c); s.put((h + 1) / 2, r, '▌', c); }
  });
  for (const [y, x, g, c] of CROWN) s.text(x, y, g, c);
  s.stamp(ISLAND_X, 14, ISLAND);
  for (const [y, x, g, c] of BUSHES) s.text(x, y, g, c);
  s.stamp(3, 13, SAILBOAT);
  s.stamp(0, 16, RAFT);
  s.stamp(HER_X, HER_Y, HER);
  // the title, centred-ish: 33 cells
  titleCells('CASTAWAY', 3, TITLE_ROW, s);
  // static glints in the sea: reverse lines, cyan on blue
  const glints = [[38, 17, '─'], [37, 21, '─'], [1, 22, '─'], [10, 17, '─'], [28, 17, '─']];
  for (const [x, y, g] of glints) s.put(x, y, g, 6, true);
  return s;
}
// Glints that come and go, one per beat, round an 8-beat cycle. In row 17
// they sit only over the gaps between letters, so they never read as accents.
const GLINTS = [[0, 19], [38, 20], [14, 17], [1, 21], [32, 17], [37, 18], [22, 17], [2, 18]];

// ---------------------------------------------------------------- captions
const CAPTIONS = [
  'SHE IDLES. EVERY SO OFTEN, A GAG.',
  'A HERMIT CRAB. IN NO HURRY.',
  'EVERY GAG STARTS ON THE NEXT BAR.',
  'BONK. A COCONUT FALLS ON THE CRAB.',
  'THE CRAB TRIES IT ON. IT FITS.',
  'THE COCONUT WALKS OFF. CRAB INSIDE.',
  'AND THAT WAS THE ACTION SCENE.',
  '90+ THINGS TO DO. 10 HOURS. NO RUSH.',
  'EVERY SOUND IS SYNTHESIZED FROM CODE.',
  'PYTHON TOOLS/SERVE.PY',
];
for (const c of CAPTIONS) if (c.length > 38) throw new Error(`caption too long: ${c}`);

// ---------------------------------------------------------------- the timeline
// The crab's walk, in steps (quarter beats). It comes up the right-hand shore,
// stops by the palm, a coconut lands on it exactly on the bar, and the pair
// walk off into the sea. Nothing is on screen at the loop point.
const CRAB_IN = [[32, 32], [48, 31], [64, 30], [80, 29]];   // [step, column]
const LAND = 96;                                            // bar 6, on the downbeat
const COCO_COL = 29;
const FALL_FROM = 6;                                        // row it drops out of the crown
const CRAB_OUT = [[160, 30], [168, 31], [176, 32]];
const SPLASH = 208;
function crabAt(s) {
  // returns { crab: [x,y] | null, coco: [x,y] | null, bonk: bool, splash: [x,y] | null }
  const out = { crab: null, coco: null, bonk: false, splash: null };
  if (s >= CRAB_IN[0][0] && s < LAND) {
    let x = CRAB_IN[0][1];
    for (const [t, c] of CRAB_IN) if (s >= t) x = c;
    out.crab = [x, 13];
    const row = 12 - (LAND - s);                            // falls a row per step
    if (row >= FALL_FROM) out.coco = [COCO_COL, row];
    return out;
  }
  if (s >= LAND && s < CRAB_OUT[0][0]) {
    out.crab = [COCO_COL, 13]; out.coco = [COCO_COL, 12];
    out.bonk = s < LAND + SB;
    return out;
  }
  if (s >= CRAB_OUT[0][0] && s < 184) {
    let x = COCO_COL;
    for (const [t, c] of CRAB_OUT) if (s >= t) x = c;
    out.crab = [x, 13]; out.coco = [x, 12];
    return out;
  }
  if (s >= 184 && s < 192) { out.crab = [33, 14]; out.coco = [33, 13]; return out; }
  if (s >= 192 && s < 200) { out.crab = [34, 15]; out.coco = [34, 14]; return out; }
  if (s >= 200 && s < SPLASH) { out.coco = [35, 15]; return out; }
  if (s >= SPLASH && s < SPLASH + 8) { out.splash = [35, 15]; return out; }
  return out;
}

// The second visitor: a sea turtle swims into the shallows under the island,
// a cell per beat, dozes for a while (a Z rises on every beat), and swims off
// again. It is gone well before the loop comes round.
const TURTLE_ROW = 16;
const T_IN = 216, T_STOP = 30, T_DOZE = T_IN + (39 - T_STOP) * SB, T_TURN = 276;
function turtleAt(s) {
  // returns { x, face, z: [x,y] | null } or null
  if (s < T_IN) return null;
  if (s < T_DOZE) return { x: 39 - Math.floor((s - T_IN) / SB), face: 'L', z: null };
  if (s < T_TURN) {
    const b = Math.floor((s - T_DOZE) / SB);
    return { x: T_STOP, face: 'L', z: b < 1 ? null : (b % 2 ? [T_STOP + 4, TURTLE_ROW - 1] : [T_STOP + 5, TURTLE_ROW - 2]) };
  }
  const x = T_STOP + Math.floor((s - T_TURN) / SB);
  return x < COLS ? { x, face: 'R', z: null } : null;
}

function screenAt(base, s) {
  const scr = base.clone();
  const beat = s % SB;
  // the music leaks out of her headphones on every beat
  if (beat < 2) scr.stamp(HER_X - 1, HER_Y + 2, ARCS_NEAR);
  else if (beat === 2) scr.stamp(HER_X - 2, HER_Y + 2, ARCS_FAR);
  // the sun's rays swap every bar
  scr.stamp(1, 0, Math.floor(s / SBAR) % 2 ? SUN_RAYS_B : SUN_RAYS_A);
  // foam washes in and out every half bar
  scr.stamp(FOAM_X, 16, foam(Math.floor(s / (SBAR / 2)) % 2));
  // a gull flaps on every other beat
  scr.stamp(34, 7, Math.floor(s / (2 * SB)) % 2 ? GULL_DOWN : GULL_UP);
  // a glint runs across the title every four bars, two columns a step,
  // starting on the odd bars, between caption changes
  const sinceGlint = (s - SBAR) % (4 * SBAR);
  if (sinceGlint >= 0 && sinceGlint < 24) {
    for (let j = 0; j < 5; j++) {
      for (const dx of [0, 1]) {
        const x = 2 * sinceGlint + dx - 4 + (4 - j);
        const p = (TITLE_ROW + j) * COLS + x;
        if (TITLE_SOLID.has(p)) scr.put(x, TITLE_ROW + j, '╱', 1);
      }
    }
  }
  // one sea glint per beat
  const [gx, gy] = GLINTS[Math.floor(s / SB) % GLINTS.length];
  scr.put(gx, gy, '─', 6, true);
  // the crab and the coconut
  const k = crabAt(s);
  if (k.coco) scr.put(k.coco[0], k.coco[1], '●', 9);
  if (k.crab) scr.put(k.crab[0], k.crab[1], 'π', 2);
  if (k.bonk) { scr.put(COCO_COL - 1, 11, '*', 1); scr.put(COCO_COL + 1, 11, '*', 1); }
  if (k.splash) scr.put(k.splash[0], k.splash[1], '▒', 1);
  // the turtle
  const t = turtleAt(s);
  if (t) {
    scr.stamp(t.x, TURTLE_ROW, t.face === 'L' ? TURTLE_L : TURTLE_R);
    if (t.z) scr.put(t.z[0], t.z[1], 'Z', 1);
  }
  // caption: one per two bars, reverse video in the sea
  const ci = Math.floor(s / (2 * SBAR));
  scr.text(1, CAPTION_ROW, CAPTIONS[ci], 6, true);
  // a blinking cursor: reverse space in blue is solid blue, so the cursor is
  // drawn as a plain space (the background) in the reversed caption row.
  if (ci === CAPTIONS.length - 1 && beat < 2) scr.clear(1 + CAPTIONS[ci].length, CAPTION_ROW);
  return scr;
}

// ---------------------------------------------------------------- render helpers
// A cell is drawn as an underlay colour (a solid 8x8) and an optional overlay
// (a glyph bitmap in one colour). Reverse cells become: foreground underlay,
// background-coloured glyph. Same pixels; fewer elements; runs merge.
const bmKey = (b) => { let s = ''; for (let i = 0; i < 64; i += 4) s += ((b[i] << 3) | (b[i + 1] << 2) | (b[i + 2] << 1) | b[i + 3]).toString(16); return s; };
const FULL = 'f'.repeat(16), EMPTY = '0'.repeat(16);
const BITMAPS = new Map(); // key -> Uint8Array
function decompose(cell) {
  if (!cell) return { u: BG, o: null };
  const b = GLYPH.get(cell.g);
  let k = bmKey(b);
  let u = BG, oc = cell.c;
  if (cell.rev) { u = cell.c; oc = BG; }
  if (k === FULL) return { u: oc, o: null };
  if (k === EMPTY || oc === u) return { u, o: null };
  BITMAPS.set(k, b);
  return { u, o: `${k}:${oc}` };
}

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
const rectsD = (rects, sx = 1, sy = 1) => rects.map(([x, y, w, h]) => `M${x * sx} ${y * sy}h${w * sx}v${h * sy}h${-w * sx}z`).join('');

// ---------------------------------------------------------------- build all screens
const base = baseScreen();
const screens = Array.from({ length: N }, (_, s) => screenAt(base, s));
const U = screens.map((scr) => scr.cells.map((c) => decompose(c).u));
const O = screens.map((scr) => scr.cells.map((c) => decompose(c).o));

const dynamicU = new Set(), dynamicO = new Set();
for (let p = 0; p < COLS * ROWS; p++) {
  for (let s = 1; s < N; s++) {
    if (U[s][p] !== U[0][p]) dynamicU.add(p);
    if (O[s][p] !== O[0][p]) dynamicO.add(p);
  }
}

// glyph defs
const glyphId = new Map();
const glyphDefs = [];
function gid(k) {
  if (!glyphId.has(k)) {
    const b = BITMAPS.get(k);
    const id = `g${glyphId.size.toString(36)}`;
    glyphId.set(k, id);
    glyphDefs.push(`<path id="${id}" d="${rectsD(gridRects((x, y) => b[y * 8 + x], 8, 8))}"/>`);
  }
  return glyphId.get(k);
}

// animation groups: key = mask string, value = { u: [[p, colour]], o: [[p, okey]] }
const groups = new Map();
function addState(kind, p, value, maskArr) {
  const key = maskArr.join('');
  if (!groups.has(key)) groups.set(key, { mask: maskArr, u: [], o: [] });
  groups.get(key)[kind].push([p, value]);
}
for (const [kind, set, M] of [['u', dynamicU, U], ['o', dynamicO, O]]) {
  for (const p of set) {
    const states = new Map();
    for (let s = 0; s < N; s++) {
      const v = M[s][p];
      if (kind === 'u' && v === BG) continue;
      if (kind === 'o' && v === null) continue;
      if (!states.has(v)) states.set(v, new Array(N).fill(0));
      states.get(v)[s] = 1;
    }
    for (const [v, mask] of states) addState(kind, p, v, mask);
  }
}

// ---------------------------------------------------------------- CSS
const css = [];
const kfNames = new Map();
function period(mask) {
  for (let P = 1; P <= N; P++) {
    if (N % P) continue;
    let ok = true;
    for (let s = P; s < N && ok; s++) if (mask[s] !== mask[s % P]) ok = false;
    if (ok) return P;
  }
  return N;
}
function animClass(mask) {
  const P = period(mask);
  let body = '';
  for (let s = 0; s < P; s++) {
    if (s === 0 || mask[s] !== mask[s - 1]) body += `${+(s / P * 100).toFixed(4)}%{opacity:${mask[s]}}`;
  }
  body += `100%{opacity:${mask[P - 1]}}`;
  const dur = +(P * STEP).toFixed(4);
  const sig = `${body}|${dur}`;
  if (!kfNames.has(sig)) {
    const name = `k${kfNames.size.toString(36)}`;
    kfNames.set(sig, name);
    css.push(`@keyframes ${name}{${body}}.${name}{animation:${name} ${dur}s step-end infinite${mask[STILL] ? '' : ';opacity:0'}}`);
  }
  return kfNames.get(sig);
}

// ---------------------------------------------------------------- SVG
const px = (p) => [(p % COLS) * CELL, Math.floor(p / COLS) * CELL];
let pic = `<rect width="${COLS * CELL}" height="${ROWS * CELL}" fill="${PAL[BG]}"/>`;

// static underlays, merged into rectangles per colour
const staticCols = new Set();
for (let p = 0; p < COLS * ROWS; p++) if (!dynamicU.has(p) && U[0][p] !== BG) staticCols.add(U[0][p]);
for (const c of [...staticCols].sort((a, b) => a - b)) {
  const rects = gridRects((x, y) => { const p = y * COLS + x; return !dynamicU.has(p) && U[0][p] === c; }, COLS, ROWS);
  pic += `<path fill="${PAL[c]}" d="${rectsD(rects, CELL, CELL)}"/>`;
}
// dynamic underlays
for (const [, g] of groups) {
  if (!g.u.length) continue;
  const cls = animClass(g.mask);
  const byCol = new Map();
  for (const [p, c] of g.u) { if (!byCol.has(c)) byCol.set(c, []); byCol.get(c).push(p); }
  pic += `<g class="a ${cls}">`;
  for (const [c, ps] of byCol) {
    const set = new Set(ps);
    pic += `<path fill="${PAL[c]}" d="${rectsD(gridRects((x, y) => set.has(y * COLS + x), COLS, ROWS), CELL, CELL)}"/>`;
  }
  pic += '</g>';
}
// static overlays, grouped by colour
const staticO = new Map();
for (let p = 0; p < COLS * ROWS; p++) {
  if (dynamicO.has(p) || !O[0][p]) continue;
  const [k, c] = O[0][p].split(':');
  if (!staticO.has(c)) staticO.set(c, []);
  staticO.get(c).push([p, k]);
}
for (const [c, list] of [...staticO].sort((a, b) => a[0] - b[0])) {
  pic += `<g fill="${PAL[+c]}">`;
  for (const [p, k] of list) { const [x, y] = px(p); pic += `<use href="#${gid(k)}" x="${x}" y="${y}"/>`; }
  pic += '</g>';
}
// dynamic overlays
for (const [, g] of groups) {
  if (!g.o.length) continue;
  const cls = animClass(g.mask);
  pic += `<g class="a ${cls}">`;
  for (const [p, v] of g.o) {
    const [k, c] = v.split(':');
    const [x, y] = px(p);
    pic += `<use href="#${gid(k)}" x="${x}" y="${y}" fill="${PAL[+c]}"/>`;
  }
  pic += '</g>';
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${W} ${H}" width="${W * 2}" height="${H * 2}" shape-rendering="crispEdges" role="img" aria-label="CASTAWAY: a PETSCII picture of a tiny island">
<title>CASTAWAY</title>
<desc>A Commodore 64 style PETSCII picture, 40 by 25 character cells: a woman in big headphones on a tiny island with one palm. A coconut falls on a hermit crab and walks off with the crab inside; later a sea turtle dozes in the shallows. CASTAWAY is cut out of the sea in block letters.</desc>
<style>${css.join('')}@media (prefers-reduced-motion:reduce){.a{animation:none!important}}</style>
<defs>${glyphDefs.join('')}</defs>
<rect width="${W}" height="${H}" rx="10" fill="${PAL[BORDER]}"/>
<g transform="translate(${BX} ${BY})">${pic}</g>
</svg>
`;
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, svg);

// ---------------------------------------------------------------- the same frame, colour RAM ignored
// The still frame drawn in the C64's start-up colours: every cell's character
// in light blue on blue, reverse cells inverted. Static.
{
  const FG = 14, BGX = 6;
  const scr = screens[STILL];
  const solid = new Set();
  const uses = [];
  for (let p = 0; p < COLS * ROWS; p++) {
    const cell = scr.cells[p];
    if (!cell) continue;
    const b = GLYPH.get(cell.g).slice();
    if (cell.rev) for (let i = 0; i < 64; i++) b[i] ^= 1;
    const k = bmKey(b);
    if (k === EMPTY) continue;
    if (k === FULL) { solid.add(p); continue; }
    BITMAPS.set(k, b);
    uses.push([p, k]);
  }
  let x = `<rect width="${COLS * CELL}" height="${ROWS * CELL}" fill="${PAL[BGX]}"/>`;
  x += `<path fill="${PAL[FG]}" d="${rectsD(gridRects((cx, cy) => solid.has(cy * COLS + cx), COLS, ROWS), CELL, CELL)}"/>`;
  x += `<g fill="${PAL[FG]}">`;
  for (const [p, k] of uses) { const [cx, cy] = px(p); x += `<use href="#${gid(k)}" x="${cx}" y="${cy}"/>`; }
  x += '</g>';
  const defsUsed = new Set(uses.map(([, k]) => glyphId.get(k)));
  const xsvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W * 2}" height="${H * 2}" shape-rendering="crispEdges" role="img" aria-label="The CASTAWAY picture with its colours switched off: light blue characters on blue">
<title>CASTAWAY, colour off</title>
<defs>${glyphDefs.filter((d) => defsUsed.has(d.match(/id="([^"]+)"/)[1])).join('')}</defs>
<rect width="${W}" height="${H}" rx="10" fill="${PAL[FG]}"/>
<g transform="translate(${BX} ${BY})">${x}</g>
</svg>
`;
  const XOUT = OUT.replace(/\.svg$/, '-colour-off.svg');
  fs.writeFileSync(XOUT, xsvg);
  console.log(`wrote ${path.relative(process.cwd(), XOUT)}: ${(xsvg.length / 1024).toFixed(1)} KB`);
}

// ---------------------------------------------------------------- report
const used = new Map();
for (const scr of screens) for (const c of scr.cells) if (c) used.set(c.c, (used.get(c.c) || 0) + 1);
const changing = new Set([...dynamicU, ...dynamicO]);
const perStep = [];
for (let s = 0; s < N; s++) {
  const prev = (s + N - 1) % N;
  let n = 0;
  for (let p = 0; p < COLS * ROWS; p++) if (U[s][p] !== U[prev][p] || O[s][p] !== O[prev][p]) n++;
  perStep.push(n);
}
const sorted = perStep.slice().sort((a, b) => a - b);
const shapes = new Set();
for (const scr of screens) for (const c of scr.cells) if (c) shapes.add(c.g);
console.log(`wrote ${path.relative(process.cwd(), OUT)}: ${(svg.length / 1024).toFixed(1)} KB, ${glyphDefs.length} glyph bitmaps, ${kfNames.size} tracks`);
console.log(`cells that ever change: ${changing.size} of ${COLS * ROWS}; per quarter beat: median ${sorted[N >> 1]}, max ${sorted[N - 1]}`);
console.log(`characters used: ${shapes.size} (${[...shapes].join('')})`);
console.log(`colours used: ${[...used.keys()].sort((a, b) => a - b).map((c) => NAMES[c]).join(', ')}; black: ${used.has(0) ? 'USED' : 'never'}`);

// ---------------------------------------------------------------- the README's hand-typed numbers
// The .md is written by hand but quotes these figures; say so if they drift.
{
  const MD = path.join(HERE, '..', '30-petscii-picture_opus_5.5.md');
  if (fs.existsSync(MD)) {
    const md = fs.readFileSync(MD, 'utf8');
    const inPicture = new Set([BG, ...used.keys()]).size;   // the cell colours plus the background
    const expect = [
      [`${changing.size} of the 1000 cells ever change`, 'cells that ever change'],
      [`on a typical quarter beat, ${sorted[N >> 1]} do`, 'median cells per quarter beat'],
      [`CELLS THAT EVER CHANGE ...... ${changing.size}`, 'credits: cells that change'],
      [`COLOURS IN THE PICTURE ...... ${inPicture} OF 16`, 'credits: colours in the picture'],
      [`BLACK ....................... ${used.has(0) ? 'SOME' : 0} CELLS`, 'credits: black cells'],
    ];
    const stale = expect.filter(([needle]) => !md.includes(needle));
    for (const [needle, what] of stale) console.warn(`README out of date (${what}): expected "${needle}"`);
    if (!stale.length) console.log('README figures match the picture');
  }
}

if (SHOW_TEXT) {
  for (const s of [0, STILL]) {
    console.log(`--- step ${s}`);
    const scr = screens[s];
    for (let y = 0; y < ROWS; y++) {
      let line = '';
      for (let x = 0; x < COLS; x++) {
        const c = scr.get(x, y);
        line += c ? (c.rev ? (c.g === ' ' ? '█' : c.g.toLowerCase()) : c.g) : '·';
      }
      console.log(line);
    }
  }
}
