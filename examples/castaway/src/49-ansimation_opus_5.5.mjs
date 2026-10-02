#!/usr/bin/env node
// CASTAWAY as an ANSImation: an 80x25 .ANS screen that arrives over a modem, one character at a
// time behind a solid cursor, and then plays as a little cartoon by cursor-addressed
// erase-and-redraw. The block-letter title is already on screen when you arrive; the rest
// (the island stage, the facts, the run line) paints in row by row at the line speed. Then the
// stage loops a 12-bar cartoon on the soundtrack's own grid (80 BPM, 3-second bars): she nods
// on every beat, a hermit crab walks in, a coconut lands on it on the downbeat and walks off
// with the crab inside, a fin glides in and a shark surfaces below her in headphones to nod in
// time with her, and the palm grows another coconut. A typewriter caption line narrates, and
// the cursor flits to whatever is being redrawn before parking, blinking, at the end of the run
// command.
// Style: "ANSImation: the modem-speed draw-in" (catalogue entry ansi-04), after the 1990s
// ANSI animations made for BBS modems. Every letterform, sprite and name here is original:
// pumice, Half Duplex and the BEACHCOMM terminal are invented for this header.
//
// Regenerate:  node examples/castaway/src/49-ansimation_opus_5.5.mjs
// Writes ../assets/49-ansimation_opus_5.5.svg and ../49-ansimation_opus_5.5.md.
//
// Plain Node, no dependencies, deterministic (no clock; the sea's wave dashes come from a seeded
// PRNG, seed 1992 like the default run). Text is an 8x16 CP437-style bitmap font drawn as
// <use> glyphs, never <text>. Art is drawn on the half-block grid an ANSI artist works on:
// 80 columns by 50 half-rows, so one "pixel" is half a character cell, 8x8 units. The draw-in
// timing follows a byte count: the generator models the screen as an ANSI stream (SGR colour
// codes, cursor-forward for gaps, CR LF per row; it counts the bytes but writes no .ANS file) and
// each row takes its byte count over the line speed.
// Animation is CSS only, stepped (steps(1,end)), and honours prefers-reduced-motion by showing a
// finished frame: the coconut has just landed.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '49-ansimation_opus_5.5';
const OUT_SVG = path.join(HERE, '..', 'assets', `${SLUG}.svg`);
const OUT_MD = path.join(HERE, '..', `${SLUG}.md`);

// ---------------------------------------------------------------------------------------------
// Screen, line speed, music grid
// ---------------------------------------------------------------------------------------------
const COLS = 80, ROWS = 25, CW = 8, CH = 16, PX = 8, PAD = 14;
const SROWS = ROWS + 1;                      // + the terminal program's own status line
const SW = COLS * CW, SH = SROWS * CH;
const VBW = SW + PAD * 2, VBH = SH + PAD * 2;
const BAUD = 9600, BPS = BAUD / 10;          // 8N1: ten bits on the wire per byte
const BEAT = 0.75, HALF = BEAT / 2, BAR = 3; // 80 BPM; every activity starts on the next bar
const LOOP_BARS = 12, LOOP = LOOP_BARS * BAR;
const TYPE_CPS = 16;                         // the caption typewriter: slower than the line, to be read
const FIRST_ROW = 6;                         // rows 0-5 (the title) are already on screen
const s = (t) => `${+t.toFixed(3)}s`;

// The 16-colour DOS/ANSI palette.
const PAL = ['#000000', '#0000AA', '#00AA00', '#00AAAA', '#AA0000', '#AA00AA', '#AA5500', '#AAAAAA',
  '#555555', '#5555FF', '#55FF55', '#55FFFF', '#FF5555', '#FF55FF', '#FFFF55', '#FFFFFF'];
const [BLK, BLU, GRN, CYN, RED, MAG, BRN, LGR, DGR, LBL, LGN, LCY, LRD, LMG, YEL, WHT] = PAL.map((_, i) => i);

// Seeded PRNG (mulberry32). Seed 1992, the default run's seed.
function prng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------------------------------------
// CP437-style 8x16 bitmap font (rows are '#'/'.' strings placed from row `top` of the cell).
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
  '-': [7, '#######'],
  '_': [14, '########'],
  '/': [4, '......# .....## ....##. ...##.. ..##... .##.... ##..... #......'],
  '\\': [4, '#...... ##..... .##.... ..##... ...##.. ....##. .....## ......#'],
  '(': [2, '....##. ...##.. ..##... ..##... ..##... ..##... ..##... ..##... ...##.. ....##.'],
  ')': [2, '.##.... ..##... ...##.. ...##.. ...##.. ...##.. ...##.. ...##.. ..##... .##....'],
  '<': [3, '....##. ...##.. ..##... .##.... ##..... .##.... ..##... ...##.. ....##.'],
  '>': [3, '.##.... ..##... ...##.. ....##. .....## ....##. ...##.. ..##... .##....'],
  '*': [5, '.##..##. ..####.. ######## ..####.. .##..##.'],
  '+': [5, '...##... ...##... .######. ...##... ...##...'],
  '=': [6, '.######. ........ ........ .######.'],
  '·': [7, '...##... ...##...'],
  '•': [6, '...##... ..####.. ..####.. ...##...'],
  '→': [5, '....##.. .....##. ######## .....##. ....##..'],
  '♪': [3, '...##... ...###.. ...####. ...##.##. ...##..#. ...##... ...##... .####... #####... .###....'],
  '»': [5, '##..##.. .##..##. ..##..## .##..##. ##..##..'],
  '«': [5, '..##..## .##..##. ##..##.. .##..##. ..##..##'],
};
for (const [ch, [top, rows]] of Object.entries(PUNCT)) def(ch, top, rows);
FONT.set(' ', new Array(16).fill(0));
const rowsOf = (fn) => Array.from({ length: 16 }, (_, y) => fn(y));
FONT.set('█', rowsOf(() => 0xFF));
FONT.set('▀', rowsOf((y) => (y < 8 ? 0xFF : 0)));
FONT.set('▄', rowsOf((y) => (y >= 8 ? 0xFF : 0)));
FONT.set('▌', rowsOf(() => 0xF0));
FONT.set('▐', rowsOf(() => 0x0F));
FONT.set('░', rowsOf((y) => (y % 2 ? 0x88 : 0x22)));
FONT.set('▒', rowsOf((y) => (y % 2 ? 0xAA : 0x55)));
FONT.set('▓', rowsOf((y) => (y % 2 ? 0x77 : 0xDD)));
function box(ch, spec) {
  const g = new Array(16).fill(0);
  const set = (x, y) => { g[y] |= 1 << (7 - x); };
  const hline = (y, x0, x1) => { for (let x = x0; x <= x1; x++) set(x, y); };
  const vline = (x, y0, y1) => { for (let y = y0; y <= y1; y++) set(x, y); };
  spec({ hline, vline });
  FONT.set(ch, g);
}
box('─', ({ hline }) => hline(7, 0, 7));
box('│', ({ vline }) => vline(3, 0, 15));
box('┌', ({ hline, vline }) => { hline(7, 3, 7); vline(3, 7, 15); });
box('┐', ({ hline, vline }) => { hline(7, 0, 3); vline(3, 7, 15); });
box('└', ({ hline, vline }) => { hline(7, 3, 7); vline(3, 0, 7); });
box('┘', ({ hline, vline }) => { hline(7, 0, 3); vline(3, 0, 7); });
box('├', ({ hline, vline }) => { hline(7, 3, 7); vline(3, 0, 15); });
box('┤', ({ hline, vline }) => { hline(7, 0, 3); vline(3, 0, 15); });

// Glyph bitmap -> compact path (greedy merge of runs into rectangles).
function runsPath(rowsFn, w, h, sx = 1, sy = 1, ox = 0, oy = 0) {
  const rects = [];
  let open = [];
  for (let y = 0; y < h; y++) {
    const runs = [];
    for (let x = 0; x < w;) {
      if (rowsFn(x, y)) { const x0 = x; while (x < w && rowsFn(x, y)) x++; runs.push([x0, x - x0]); } else x++;
    }
    const next = [];
    for (const [x0, rw] of runs) {
      const o = open.find((r) => r.x === x0 && r.w === rw && r.y + r.h === y);
      if (o) { o.h++; next.push(o); } else { const r = { x: x0, w: rw, y, h: 1 }; rects.push(r); next.push(r); }
    }
    open = next;
  }
  return rects.map((r) => `M${ox + r.x * sx} ${oy + r.y * sy}h${r.w * sx}v${r.h * sy}h${-r.w * sx}z`).join('');
}
const glyphPath = (g) => runsPath((x, y) => (g[y] >> (7 - x)) & 1, 8, 16);
const glyphIds = new Map();
function gid(ch) {
  if (!FONT.has(ch)) throw new Error(`no glyph for ${JSON.stringify(ch)} (U+${ch.codePointAt(0).toString(16)})`);
  if (!glyphIds.has(ch)) glyphIds.set(ch, `g${glyphIds.size.toString(36)}`);
  return glyphIds.get(ch);
}
const len = (str) => [...str].length;
function uses(r, c, str) {
  let out = '';
  for (const ch of str) {
    if (ch !== ' ') out += `<use href="#${gid(ch)}" x="${c * CW}" y="${r * CH}"/>`;
    c++;
  }
  return out;
}

// ---------------------------------------------------------------------------------------------
// Pixels. A pixel value is a palette index, or a shade cell: {sh: '░'|'▒'|'▓', fg, bg}.
// Sprites are written as strings with this legend.
// ---------------------------------------------------------------------------------------------
const shade = (sh, fg, bg) => ({ sh, fg, bg, key: `${sh}${fg}_${bg}` });
const SKIN = shade('▒', LRD, YEL);           // peach: light red stippled over yellow
const LEGEND = {
  k: BLK, b: BLU, g: GRN, c: CYN, r: RED, n: BRN, l: LGR, d: DGR,
  B: LBL, G: LGN, C: LCY, R: LRD, Y: YEL, W: WHT, s: SKIN,
  1: shade('░', LCY, LBL), 2: shade('▒', LCY, LBL), 3: shade('▓', LCY, LBL),
  4: shade('▒', YEL, BRN), 5: shade('░', LBL, BLU), 6: shade('▒', LGN, GRN), 7: shade('▒', CYN, BLK),
};
const pkey = (v) => (typeof v === 'number' ? `c${v}` : v.key);
// Parse a sprite: rows of legend chars ('.' is transparent).
function sprite(rows) {
  const px = [];
  rows.forEach((row, y) => [...row].forEach((ch, x) => {
    if (ch === '.' || ch === ' ') return;
    if (!(ch in LEGEND)) throw new Error(`legend has no ${ch}`);
    px.push([x, y, LEGEND[ch]]);
  }));
  return { px, w: Math.max(...rows.map((r) => r.length)), h: rows.length };
}
// Pixel list -> one path per colour (merged), at an offset in pixels.
const patterns = new Map();
function fillOf(v) {
  if (typeof v === 'number') return { cls: `c${v}` };
  if (!patterns.has(v.key)) patterns.set(v.key, v);
  return { url: `p${v.key.replace(/[░▒▓]/, (m) => ({ '░': 'a', '▒': 'b', '▓': 'c' })[m])}` };
}
function emitPixels(px, ox = 0, oy = 0) {
  const by = new Map();
  for (const [x, y, v] of px) {
    const k = pkey(v);
    if (!by.has(k)) by.set(k, { v, set: new Set() });
    by.get(k).set.add(`${x},${y}`);
  }
  let out = '';
  for (const { v, set } of by.values()) {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const k of set) { const [x, y] = k.split(',').map(Number); x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
    const d = runsPath((x, y) => set.has(`${x + x0},${y + y0}`), x1 - x0 + 1, y1 - y0 + 1, PX, PX, (ox + x0) * PX, (oy + y0) * PX);
    const f = fillOf(v);
    out += f.cls ? `<path class="${f.cls}" d="${d}"/>` : `<path fill="url(#${f.url})" d="${d}"/>`;
  }
  return out;
}

// ---------------------------------------------------------------------------------------------
// The screen buffer: text cells and the half-block pixel layer (80 x 50). The full-frame copy
// (with every sprite in its opening pose) feeds the ANSI byte count.
// ---------------------------------------------------------------------------------------------
const cells = Array.from({ length: SROWS }, () => new Array(COLS).fill(null));
const pix = Array.from({ length: SROWS * 2 }, () => new Array(COLS).fill(null));
const framePix = Array.from({ length: SROWS * 2 }, () => new Array(COLS).fill(null)); // sprites, opening pose
function put(r, c, str, fg, bg = BLK) {
  for (const ch of str) {
    if (c < 0 || c >= COLS || r < 0 || r >= SROWS) throw new Error(`off screen at ${r},${c}: ${str}`);
    cells[r][c] = ch === ' ' && bg === BLK ? null : { ch, fg, bg };
    c++;
  }
  return c;
}
function seg(r, c, parts, bg = BLK) { for (const [t, fg] of parts) c = put(r, c, t, fg, bg); return c; }
const width = (parts) => parts.reduce((a, [t]) => a + len(t), 0);
function plot(layer, x, y, v) { if (x >= 0 && x < COLS && y >= 0 && y < SROWS * 2) layer[y][x] = v; }


// ---------------------------------------------------------------------------------------------
// Layout, in cells. Rows 0-5: the title. Row 6: the stage frame's top edge. Rows 7-21: the
// stage. Row 22: the frame's foot. Row 23: the caption line. Row 24: the run line. Row 25: the
// terminal program's status line. Four facts run down a column on the right.
// ---------------------------------------------------------------------------------------------
const STG = { c: 1, r: 7, w: 43, h: 15 };          // 43 x 30 half-block pixels
const SX = STG.c, SY = STG.r * 2;                  // the stage's origin, in pixels
const SPW = STG.w, SPH = STG.h * 2;
const FRAME = { c0: 0, c1: STG.c + STG.w, r0: STG.r - 1, r1: STG.r + STG.h };
const RC = FRAME.c1 + 2;                           // the facts column
const R = { caption: 23, prompt: 24, status: 25 };

// ---------------------------------------------------------------------------------------------
// The title: CASTAWAY in toony block capitals on the half-block grid, 10 pixels tall, yellow
// with a white top edge, a shine down the left of each stroke and a brown foot, over a dithered
// cyan drop shadow. Each letter is its own sprite so it can hop on the beat. Own lettering.
// ---------------------------------------------------------------------------------------------
const LETTERS = {
  C: ['..######', '.#######', '###....#', '###.....', '###.....', '###.....', '###.....', '###....#', '.#######', '..######'],
  A: ['..####..', '.######.', '###..###', '###..###', '###..###', '########', '########', '###..###', '###..###', '###..###'],
  S: ['.#######', '########', '###.....', '###.....', '.######.', '.#######', '.....###', '.....###', '########', '#######.'],
  T: ['#########', '#########', '...###...', '...###...', '...###...', '...###...', '...###...', '...###...', '...###...', '...###...'],
  W: ['###...###', '###...###', '###...###', '###.#.###', '###.#.###', '###.#.###', '#########', '#########', '.###.###.', '..#...#..'],
  Y: ['###...###', '###...###', '###...###', '.###.###.', '..#####..', '...###...', '...###...', '...###...', '...###...', '...###...'],
};
const TITLE = 'CASTAWAY';
const LETTER_ROW = ['W', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', '4', 'n']; // colour per letter row
const LOGO_Y = 1;                                  // resting top, in pixels; a hop lifts it to 0
const letterSprites = [];
{
  const widths = [...TITLE].map((ch) => LETTERS[ch][0].length);
  const total = widths.reduce((a, b) => a + b, 0) + widths.length - 1 + 1;
  let x = Math.floor((COLS - total) / 2);
  [...TITLE].forEach((ch, i) => {
    const L = LETTERS[ch];
    const on = (xx, yy) => yy >= 0 && yy < L.length && L[yy][xx] === '#';
    const px = [];
    for (let yy = 0; yy <= L.length; yy++) {
      for (let xx = 0; xx <= widths[i]; xx++) {
        if (on(xx, yy)) {
          let v = LEGEND[LETTER_ROW[yy]];
          if ((yy === 1 || yy === 2) && !on(xx - 1, yy)) v = WHT;    // a shine down the left edge
          px.push([xx, yy, v]);
        } else if (on(xx - 1, yy - 1)) px.push([xx, yy, LEGEND[7]]); // drop shadow
      }
    }
    letterSprites.push({ ch, x, px });
    for (const [xx, yy, v] of px) plot(framePix, x + xx, LOGO_Y + yy, v);
    x += widths[i] + 1;
  });
}

// ---------------------------------------------------------------------------------------------
// The stage, 43 x 30. Background first (sky bands in shade characters, sea, shallows, sand),
// then props by hand: sun, clouds, the palm, a bush, the raft, a coconut that stays put.
// Characters get a black outline, the way toony ANSI figures do, so they read on sand and sky.
// ---------------------------------------------------------------------------------------------
const stage = Array.from({ length: SPH }, () => new Array(SPW).fill(BLU));
const stagePut = (x, y, v) => { if (x >= 0 && x < SPW && y >= 0 && y < SPH) stage[y][x] = v; };
const stamp = (spr, ox, oy) => { for (const [x, y, v] of spr.px) stagePut(ox + x, oy + y, v); };
function outlined(spr, col = BLK) {
  const on = new Set(spr.px.map(([x, y]) => `${x},${y}`));
  const ring = [];
  for (let y = -1; y <= spr.h; y++) for (let x = -1; x <= spr.w; x++) {
    if (on.has(`${x},${y}`)) continue;
    if ([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => on.has(`${x + dx},${y + dy}`))) ring.push([x, y, col]);
  }
  return { px: [...ring, ...spr.px], w: spr.w, h: spr.h };
}
const ISLAND = { cx: 21.5, cy: 20.0, rx: 15, ry: 3.2 };
const SHALLOW = { cx: 21.5, cy: 20.2, rx: 20, ry: 4.3 };
const inEll = (e, x, y, gx = 0, gy = 0) => ((x + 0.5 - e.cx) / (e.rx + gx)) ** 2 + ((y + 0.5 - e.cy) / (e.ry + gy)) ** 2 <= 1;
const HORIZON = 14;
const SKY = [LBL, LBL, LBL, LBL, LBL, LBL, LEGEND[1], LEGEND[1], LEGEND[2], LEGEND[2], LEGEND[3], LEGEND[3], LCY, LCY];
const surfA = [], surfB = [];
for (let y = 0; y < SPH; y++) {
  for (let x = 0; x < SPW; x++) {
    let v = y < HORIZON ? SKY[y] : y < HORIZON + 2 ? LEGEND[5] : BLU;
    if (y >= HORIZON + 2 && inEll(SHALLOW, x, y)) v = CYN;
    if (inEll(ISLAND, x, y)) {
      v = YEL;
      if (!inEll(ISLAND, x, y + 1)) v = BRN;                       // wet sand at the waterline
      else if (!inEll(ISLAND, x, y + 2) && y > ISLAND.cy) v = LEGEND[4];
    } else if (y > ISLAND.cy - 1 && inEll(ISLAND, x, y, 1.6, 0.9)) (((x + y) % 2) ? surfA : surfB).push([x, y, WHT]);
    stage[y][x] = v;
  }
}
for (const [x, y] of [[10, 21], [16, 22], [26, 22], [33, 20], [24, 19], [13, 19]]) if (stage[y][x] === YEL) stage[y][x] = LEGEND[4];

const SUN = sprite([
  '..YYY..',
  '.YWWYY.',
  'YWWYYYY',
  'YYYYYYY',
  '.YYYYY.',
  '..YYY..',
]);
const CLOUD1 = sprite([
  '......WWW.....',
  '...WWWWWWW.WW.',
  '.WWWWWWWWWWWWW',
  'WWWWWWWWWWWWWW',
  '.lWWllWWWlll..',
]);
const CLOUD2 = sprite([
  '..WWW..',
  '.WWWWWW',
  '.lllWl.',
]);
// The palm: a crown of arching fronds, light on top and dark beneath, on a tall, slender,
// segmented reddish trunk that leans a little.
const CROWN = (() => {
  const W = SPW, H = 12;
  const g = Array.from({ length: H }, () => new Array(W).fill('.'));
  const set = (x, y, c, over = true) => { if (x >= 0 && x < W && y >= 0 && y < H && (over || g[y][x] === '.')) g[y][x] = c; };
  const leaves = [
    [[19, 3], [18, 2], [17, 2], [16, 1], [15, 1], [14, 1], [13, 1], [12, 1], [11, 2], [10, 2], [9, 3], [8, 4]],
    [[21, 3], [22, 2], [23, 2], [24, 1], [25, 1], [26, 1], [27, 1], [28, 1], [29, 2], [30, 2], [31, 3], [32, 4]],
    [[18, 4], [17, 4], [16, 4], [15, 4], [14, 5], [13, 5], [12, 5], [11, 6], [10, 7], [9, 8], [8, 9]],
    [[22, 4], [23, 4], [24, 4], [25, 4], [26, 5], [27, 5], [28, 5], [29, 6], [30, 7], [31, 8], [32, 9]],
    [[20, 2], [19, 1], [18, 0]],
    [[20, 2], [21, 1], [22, 0]],
  ];
  for (const leaf of leaves) leaf.forEach(([x, y]) => set(x, y + 1, 'g', false));
  for (const leaf of leaves) leaf.forEach(([x, y], i) => set(x, y, i >= leaf.length - 2 ? 'g' : 'G'));
  for (const [x, y] of [[19, 3], [20, 3], [21, 3], [19, 4], [21, 4]]) set(x, y, 'G');
  set(20, 4, 'g');
  return sprite(g.map((r) => r.join('')));
})();
const TRUNK = [];
for (let y = 5; y <= 19; y++) {
  const lx = 19 + Math.floor((y - 5) / 5);
  TRUNK.push([lx, y, y % 3 === 0 ? LEGEND[4] : BRN], [lx + 1, y, RED]);
}
TRUNK.push([20, 19, BRN], [23, 19, RED]);
const NUT = outlined(sprite(['.nnn.', 'nYnnn', 'nnnnn', '.nnn.']));
const NUT_HOME = [13, 5];                         // where the coconut that falls hangs
const NUT_STAYS = [22, 5];                        // the one that stays
const BUSH = sprite([
  '..G.GG.G',
  '.GG6GG6G',
  'G6g6g6gg',
]);
// The raft: three lashed logs, staggered at the ends, moored in the shallows.
const RAFT = outlined(sprite([
  '.4l44l.',
  'nnlnnln',
  '.rlrrl.',
]));
stamp(SUN, 2, 1);
stamp(CLOUD1, 28, 2);
stamp(CLOUD2, 35, 10);
for (const [x, y, v] of TRUNK) stagePut(x, y, v);
stamp(CROWN, 0, 0);
stamp(NUT, ...NUT_STAYS);
stamp(BUSH, 24, 16);
stamp(RAFT, 35, 19);

// Wave dashes on the open sea, two sets that swap on the beat, with the surf line.
const rnd = prng(1992);
const wavesA = [], wavesB = [];
for (let i = 0; i < 90; i++) {
  const y = HORIZON + 2 + Math.floor(rnd() * (SPH - HORIZON - 2));
  const x = Math.floor(rnd() * (SPW - 2));
  const n = 1 + Math.floor(rnd() * 3);
  const v = rnd() < 0.2 ? WHT : LBL;
  let ok = true;
  for (let k = -1; k <= n; k++) if (inEll(SHALLOW, x + k, y, 0.8, 0.5) || x + k >= SPW) ok = false;
  if (!ok) continue;
  for (let k = 0; k < n; k++) (i % 2 ? wavesB : wavesA).push([x + k, y, v]);
}
wavesA.push(...surfA);
wavesB.push(...surfB);

// Her: front on, cream headphones (band over the top, a cup each side), brown hair with the low
// bun peeking out, coral tank top, cream shorts, bare feet. Two poses swapped on the
// beat: head up, and head down into the nod.
const HER_UP = outlined(sprite([
  '.nWWWn.',
  'WnnnnnW',
  'WsksksW',
  '..sssn.',
  '...s...',
  '.RRRRR.',
  '.sRRRs.',
  '.sRRRs.',
  '.sWWWs.',
  '..s.s..',
  '..s.s..',
]));
const HER_DOWN = outlined(sprite([
  '.......',
  '.nWWWn.',
  'WnnnnnW',
  'WsksksW',
  '..sssn.',
  '.RRRRR.',
  '.sRRRs.',
  '.sRRRs.',
  '.sWWWs.',
  '..s.s..',
  '..s.s..',
]));
const HER_AT = [28, 10];

// The hermit crab (walking right, two leg poses), the coconut with the crab inside it (walking
// left), the impact stars, and the shark in headphones (two poses: up, and nodding).
const CRAB = [
  outlined(sprite(['.....W.W', '.ll..R.R', 'lWllRRRr', '.R.R.R.R'])),
  outlined(sprite(['.....W.W', '.ll..R.R', 'lWllRRRr', 'R.R.R.R.'])),
];
const NUTCRAB = [
  outlined(sprite(['W..nnn.', 'R.nYnnn', 'rrnnnnn', '...nnn.', '.R.R.R.'])),
  outlined(sprite(['W..nnn.', 'R.nYnnn', 'rrnnnnn', '...nnn.', 'R.R.R.R'])),
];
const STARS = sprite(['Y.......Y', '.Y.....Y.']);
// The shark: first just a fin (gliding left), then it surfaces facing us in cream headphones like
// hers (band over the top, yellow cups) and grins; two surfaced poses, head up and nodding down.
// The surfaced shark's fin sits in column SHARK_FIN_DX, so the dive can reuse the fin sprite there.
const SHARK_HEAD = [
  '.....dl.....',
  '....ddll....',
  '..WWWWWWWW..',
  '.W.llllll.W.',
  'YYlkllllklYY',
  'YYllllllllYY',
  '..lWWWWWWl..',
  '..lkWkWkWl..',
];
const SHARK_FIN_DX = 3;
const SHARK = [
  outlined(sprite(['..dl', '.ddl', 'dddl', 'Wddl', 'WCCC'])),
  outlined(sprite(SHARK_HEAD)),
  outlined(sprite(['', ...SHARK_HEAD])),
];

// Static stage into the pixel layer.
for (let y = 0; y < SPH; y++) for (let x = 0; x < SPW; x++) plot(pix, SX + x, SY + y, stage[y][x]);

// ---------------------------------------------------------------------------------------------
// Text
// ---------------------------------------------------------------------------------------------
put(FRAME.r0, FRAME.c0, '┌' + '─'.repeat(FRAME.c1 - FRAME.c0 - 1) + '┐', DGR);
put(FRAME.r1, FRAME.c0, '└' + '─'.repeat(FRAME.c1 - FRAME.c0 - 1) + '┘', DGR);
for (let r = FRAME.r0 + 1; r < FRAME.r1; r++) { put(r, FRAME.c0, '│', DGR); put(r, FRAME.c1, '│', DGR); }
seg(FRAME.r0, 2, [['┤', DGR], [' the island ', WHT], ['·', DGR], [' always daytime ', YEL], ['├', DGR]]);
{
  // no frame rate here: the video's fps has changed before ([video] in activities.toml) and is still open
  const parts = [['┤', DGR], [' 16:9 ', LGR], ['·', DGR], [' 1080p ', LGR], ['·', DGR], [' seed 1992 ', LGR], ['├', DGR]];
  seg(FRAME.r1, FRAME.c1 - 1 - width(parts), parts);
}
const FACTS = [
  ['WHAT', ['an unofficial lo-fi remake', 'of a 1992 desert-island', 'screensaver. ten hours, one', 'tiny island, one tall palm.', 'she idles. now and then, on', 'the beat, something happens.']],
  ['GAGS', ['a coconut that walks off.', 'a shark in headphones. a', 'cat on a crate. a bottle', 'that washes straight back.']],
  ['WHEN', ['more than 90 activities.', 'four timers: every 2-5 min', 'up to every 3-6 hours.']],
  ['SOUND', ['synthesized from code. all', 'of it. no samples, no mics.']],
];
{
  let r = FRAME.r0;
  FACTS.forEach(([label, lines], i) => {
    if (i) r++;
    put(r, RC, label, LCY);
    lines.forEach((t, k) => {
      if (RC + 6 + len(t) > COLS) throw new Error(`fact too long: ${t}`);
      put(r + k, RC + 6, t, k === 0 ? WHT : LGR);
    });
    r += lines.length;
  });
  if (r > R.prompt) throw new Error(`facts run into the run line (row ${r})`);
}
// The run line; the cursor parks after it.
const PROMPT_END = seg(R.prompt, 1, [['C:\\CASTAWAY>', LGR], ['python tools/serve.py', WHT], ['  then open ', LGR], ['http://127.0.0.1:8765/', LCY]]);
const PARK = { r: R.prompt, c: PROMPT_END };

// The terminal program's status line (not part of the file): inverse grey.
const STATUS = [[' BEACHCOMM ', BLK], ['│', DGR], [' ANSI ', BLK], ['│', DGR], [` ${BAUD} 8N1 `, BLK], ['│', DGR],
  [' castaway.ans ', BLK], ['│', DGR], [' 80x25 ', BLK], ['│', DGR]];
const STATUS_END = seg(R.status, 0, STATUS, LGR);
put(R.status, STATUS_END, ' '.repeat(COLS - STATUS_END), BLK, LGR);
{
  const tail = [['│', DGR], [' ♪ 80 BPM ', BLK]];
  seg(R.status, COLS - width(tail), tail, LGR);
}
const STATUS_RECV = ' RECEIVING';
const STATUS_IDLE = ' IDLE';

// Opening poses into the full frame (for the byte count): the coconut at home, her head up.
for (const [x, y, v] of NUT.px) plot(framePix, SX + NUT_HOME[0] + x, SY + NUT_HOME[1] + y, v);
for (const [x, y, v] of HER_UP.px) plot(framePix, SX + HER_AT[0] + x, SY + HER_AT[1] + y, v);

// ---------------------------------------------------------------------------------------------
// The ANSI stream: encode each row (half-block pixels become ▀ ▄ █ or a shade character with
// fg/bg, gaps become cursor-forward codes, colour changes become SGR codes) and count the
// bytes. Each row takes its bytes over the line speed.
// ---------------------------------------------------------------------------------------------
function cellAt(r, c) {
  const t = cells[r][c];
  if (t) return t;
  const top = framePix[r * 2][c] ?? pix[r * 2][c];
  const bot = framePix[r * 2 + 1][c] ?? pix[r * 2 + 1][c];
  if (top == null && bot == null) return null;
  const sh = [top, bot].find((v) => v && typeof v === 'object');
  if (sh) return { ch: sh.sh, fg: sh.fg, bg: sh.bg };
  const tp = top ?? BLK, bt = bot ?? BLK;
  if (tp === bt) return tp === BLK ? null : { ch: '█', fg: tp, bg: BLK };
  if (bt < 8) return { ch: '▀', fg: tp, bg: bt };
  if (tp < 8) return { ch: '▄', fg: bt, bg: tp };
  return { ch: '▀', fg: tp, bg: bt };                              // iCE colours (bright bg)
}
const sgr = { bold: false, blink: false, fg: 7, bg: 0 };
function sgrBytes(fg, bg) {
  const want = { bold: fg > 7, blink: bg > 7, fg: fg & 7, bg: bg & 7 };
  const p = [];
  if ((sgr.bold && !want.bold) || (sgr.blink && !want.blink)) {
    p.push('0');
    if (want.bold) p.push('1');
    if (want.blink) p.push('5');
    if (want.fg !== 7) p.push(`3${want.fg}`);
    if (want.bg !== 0) p.push(`4${want.bg}`);
  } else {
    if (want.bold && !sgr.bold) p.push('1');
    if (want.blink && !sgr.blink) p.push('5');
    if (want.fg !== sgr.fg) p.push(`3${want.fg}`);
    if (want.bg !== sgr.bg) p.push(`4${want.bg}`);
  }
  Object.assign(sgr, want);
  return p.length ? 3 + p.join(';').length : 0;
}
const rowInfo = [];
let totalBytes = 0;
for (let r = 0; r < ROWS; r++) {
  const row = Array.from({ length: COLS }, (_, c) => cellAt(r, c));
  let last = -1;
  row.forEach((cl, c) => { if (cl) last = c; });
  let bytes = 0;
  for (let c = 0; c <= last;) {
    if (!row[c]) {
      let n = 0;
      while (c + n <= last && !row[c + n]) n++;
      bytes += n >= 4 ? 3 + String(n).length : n + (sgr.bg ? sgrBytes(sgr.fg + (sgr.bold ? 8 : 0), 0) : 0);
      c += n;
      continue;
    }
    bytes += sgrBytes(row[c].fg, row[c].bg) + 1;
    c++;
  }
  bytes += 2;                                                      // CR LF
  totalBytes += bytes;
  rowInfo.push({ r, n: last + 1, bytes });
}
let tcur = 0.2;                                                    // a breath, then the stream resumes
for (const ri of rowInfo) {
  if (ri.r < FIRST_ROW) continue;
  ri.t0 = tcur;
  ri.dur = ri.bytes / BPS;
  tcur += ri.dur;
}
const T0 = Math.ceil((tcur + 0.15) * 20) / 20;                     // the cartoon starts here
const streamRows = rowInfo.filter((ri) => ri.r >= FIRST_ROW);
const streamBytes = streamRows.reduce((a, ri) => a + ri.bytes, 0);

// ---------------------------------------------------------------------------------------------
// The cartoon, in beats from the start of each loop (48 beats = 12 bars = 36 s).
// ---------------------------------------------------------------------------------------------
const B = (b) => b * BEAT;
const CAPTIONS = [
  [B(0), '» she idles. she nods. 80 bpm, F major.'],
  [B(8), '» a hermit crab walks in, on the beat.'],
  [B(16) + 0.1, '» a coconut lands. on the beat. on him.'],
  [B(20), '» the crab moves into the coconut.'],
  [B(28), '» she keeps nodding. it is a long video.'],
  [B(32), '» a fin. it is in no hurry either.'],
  [B(36), '» it surfaces in headphones. same beat.'],
  [B(44), '» the palm reloads. 9:59:24 to go.'],
];
for (const [, t] of CAPTIONS) if (1 + len(t) > STG.c + STG.w) throw new Error(`caption too long: ${t}`);
const CRAB_X0 = -2, CRAB_STOP = 10, CRAB_Y = 17, KLONK = { r: 14, c: SX + 2 };
const FALL = [[0, NUT_HOME[1]], [0.1, 7], [0.19, 10], [0.27, 13], [0.34, CRAB_Y - 1]]; // [dt, y]
const LAND_T = B(16);                                              // the coconut lands on the downbeat
const FALL_T = LAND_T - FALL[FALL.length - 1][0];
const RELOAD_T = B(47);
const REST_T = LAND_T + 0.5;                                       // the still frame (reduced motion)

// A track is a list of [t, state], state {x, y, f} or null (hidden). A move flickers: the old
// copy is erased a moment before the new one is drawn, as cursor-addressed redraws do.
const FLICK = 0.034;
function stateAt(track, t) { let st = track[0][1]; for (const [tt, sv] of track) if (tt <= t + 1e-9) st = sv; return st; }
function withFlicker(track) {
  const out = [];
  track.forEach(([t, st], i) => {
    const prev = i ? track[i - 1][1] : null;
    if (prev && st && (prev.x !== st.x || prev.y !== st.y) && t > 0) out.push([t, null], [t + FLICK, st]);
    else out.push([t, st]);
  });
  return out;
}
const crabTrack = [[0, null]];
for (let k = 0; k <= CRAB_STOP - CRAB_X0; k++) crabTrack.push([B(8) + k * HALF, { x: SX + CRAB_X0 + k, y: SY + CRAB_Y, f: k % 2 }]);
crabTrack.push([LAND_T, null]);
const nutTrack = [[0, { x: SX + NUT_HOME[0], y: SY + NUT_HOME[1], f: 0 }]];
FALL.slice(1).forEach(([dt, y]) => nutTrack.push([FALL_T + dt, { x: SX + NUT_HOME[0], y: SY + y, f: 0 }]));
nutTrack.push([LAND_T + 0.04, null], [RELOAD_T, { x: SX + NUT_HOME[0], y: SY + NUT_HOME[1], f: 0 }]);
const NC_X0 = SX + NUT_HOME[0] - 2, NC_Y = SY + CRAB_Y - 1;
const ncTrack = [[0, null], [LAND_T + 0.04, { x: NC_X0, y: NC_Y, f: 0 }]];
for (let k = 1; k <= 22; k++) ncTrack.push([B(20) + k * HALF, { x: NC_X0 - k, y: NC_Y, f: k % 2 }]);
ncTrack.push([B(20) + 23 * HALF, null]);
const starTrack = [[0, null], [LAND_T + 0.04, { x: 0, y: 0, f: 0 }], [B(19.5), null]];
// The fin comes in from the right edge on bar 8 and glides left a pixel every half beat; on bar 10
// the shark surfaces right below her and nods with her, down on every beat, for two bars; then it sinks.
const SH_HEAD = { x: SX + 26, y: SY + SPH - SHARK_HEAD.length };   // right below her
const SH_FIN_Y = SY + SPH - 5;
const sharkTrack = [[0, null]];
for (let k = 0; k < 16; k++) sharkTrack.push([B(28) + k * HALF, { x: SX + SPW + 1 - k, y: SH_FIN_Y, f: 0 }]);
for (let b = 36; b < 44; b++) sharkTrack.push([B(b), { ...SH_HEAD, f: 2 }], [B(b) + HALF, { ...SH_HEAD, f: 1 }]);
[1, 3, 5].forEach((dy, i) => sharkTrack.push([B(44 + i * 0.5), { x: SH_HEAD.x + SHARK_FIN_DX, y: SH_HEAD.y + dy, f: 0 }]));
sharkTrack.push([B(45.5), null]);
const hopTracks = letterSprites.map((L, i) => [[0, { x: 0, y: 0, f: 0 }], [B(i + 1), { x: 0, y: -1, f: 0 }], [B(i + 1) + HALF, { x: 0, y: 0, f: 0 }]]);

// ---------------------------------------------------------------------------------------------
// CSS
// ---------------------------------------------------------------------------------------------
const css = [];
const pct = (t) => `${+((100 * t) / LOOP).toFixed(3)}%`;
const loopAnim = (name) => `animation:${name} ${s(LOOP)} steps(1,end) ${s(T0)} infinite both`;
let kfCount = 0;
function trackCss(name, track, nFrames, rest) {
  const key = (st) => (st ? `${st.x},${st.y},${st.f}` : '-');
  if (key(stateAt(track, 0)) !== key(stateAt(track, LOOP - 1e-6))) throw new Error(`${name} does not loop cleanly`);
  const tr = (st) => `transform:translate(${st.x * PX}px,${st.y * PX}px)`;
  const pos = [];
  let lastPos = track.find(([, st]) => st)[1];
  for (const [t, st] of track) { if (st) lastPos = st; pos.push([t, lastPos]); }
  const kf = (list, fn) => {
    const out = [`0%{${fn(stateAt(list, 0))}}`];
    let prev = fn(stateAt(list, 0));
    for (const [t, v] of list) { const f = fn(v); if (t > 0 && f !== prev) { out.push(`${pct(t)}{${f}}`); prev = f; } }
    out.push(`100%{${fn(stateAt(list, LOOP))}}`);
    kfCount += out.length;
    return out.join('');
  };
  css.push(`@keyframes ${name}{${kf(pos, tr)}}.${name}{${tr(stateAt(pos, rest))};${loopAnim(name)}}`);
  for (let f = 0; f < nFrames; f++) {
    const op = (st) => `opacity:${st && st.f === f ? 1 : 0}`;
    css.push(`@keyframes ${name}f${f}{${kf(track, op)}}.${name}f${f}{${op(stateAt(track, rest))};${loopAnim(`${name}f${f}`)}}`);
  }
}
// Two frames swapped on the beat grid: `${a}` shows for the first `onFor` of each period, `${b}`
// for the rest. `restB` picks which one the still frame shows.
function swapCss(a, b, period, onFor, restB = true) {
  const p = +((100 * onFor) / period).toFixed(3);
  css.push(`@keyframes ${a}{0%{opacity:1}${p}%{opacity:0}100%{opacity:0}}.${a}{opacity:${restB ? 0 : 1};animation:${a} ${s(period)} steps(1,end) ${s(T0)} infinite both}`
    + `@keyframes ${b}{0%{opacity:0}${p}%{opacity:1}100%{opacity:1}}.${b}{opacity:${restB ? 1 : 0};animation:${b} ${s(period)} steps(1,end) ${s(T0)} infinite both}`);
}

trackCss('cr', withFlicker(crabTrack), 2, REST_T);
trackCss('nt', withFlicker(nutTrack), 1, REST_T);
trackCss('nc', withFlicker(ncTrack), 2, REST_T);
trackCss('st', starTrack, 1, REST_T);
trackCss('sh', withFlicker(sharkTrack), 3, REST_T);
hopTracks.forEach((tk, i) => trackCss(`L${i}`, withFlicker(tk), 1, REST_T));
swapCss('nd', 'nu', BEAT, HALF, true);        // her nod: down on the beat, up on the off-beat
swapCss('wa', 'wb', 2 * BEAT, BEAT, false);   // wave sets A and B

// The cursor. Intro: rides the stream, row by row. Loop: types each caption, drops in on the
// coconut as it falls and on the palm as it grows a new one, and otherwise parks at the end of
// the run line, blinking on the beat.
const jobs = CAPTIONS.map(([t, text]) => ({ t0: t, t1: t + len(text) / TYPE_CPS + 0.12, kind: 'type', n: len(text) }));
jobs.push({ t0: FALL_T, t1: LAND_T + 0.08, kind: 'fall' });
jobs.push({ t0: RELOAD_T, t1: RELOAD_T + 0.3, kind: 'at', r: Math.floor((SY + NUT_HOME[1] + 1) / 2), c: SX + NUT_HOME[0] + 5 });
jobs.sort((a, b) => a.t0 - b.t0);
const cur = [];                                     // [t, {r, c} | null, steps]
{
  let t = 0;
  const parkUntil = (t1) => {
    while (t < t1 - 1e-9) {
      const beat0 = Math.floor(t / BEAT + 1e-9) * BEAT;
      const on = t - beat0 < HALF - 1e-9;
      cur.push([t, on ? PARK : null]);
      t = Math.min(t1, on ? beat0 + HALF : beat0 + BEAT);
    }
  };
  for (const j of jobs) {
    if (j.t0 < t - 1e-9) throw new Error('cursor jobs overlap');
    parkUntil(j.t0);
    if (j.kind === 'type') {
      cur.push([j.t0, { r: R.caption, c: 1 }, j.n]);
      cur.push([j.t0 + j.n / TYPE_CPS, { r: R.caption, c: 1 + j.n }]);
    } else if (j.kind === 'fall') {
      FALL.forEach(([dt, y]) => cur.push([FALL_T + dt, { r: Math.floor((SY + y + 2) / 2), c: SX + NUT_HOME[0] + 5 }]));
    } else cur.push([j.t0, { r: j.r, c: j.c }]);
    t = j.t1;
  }
  parkUntil(LOOP);
  const tr = (p) => `transform:translate(${p.c * CW}px,${p.r * CH}px)`;
  const kfs = [];
  let lastP = PARK;
  for (const [tt, p, steps] of cur) {
    const P = p || lastP;
    if (p) lastP = p;
    kfs.push(`${tt === 0 ? '0%' : pct(tt)}{${tr(P)};opacity:${p ? 1 : 0}${steps ? `;animation-timing-function:steps(${steps},end)` : ''}}`);
  }
  kfs.push(`100%{${tr(PARK)};opacity:1}`);
  kfCount += kfs.length;
  css.push(`@keyframes cu{${kfs.join('')}}.cu{${tr(PARK)};${loopAnim('cu')}}`);
}
// The intro: the cursor rides the stream and a black cover steps off each row behind it.
{
  const P = (t) => `${+((100 * t) / T0).toFixed(3)}%`;
  const kfs = [`0%{transform:translate(0px,${FIRST_ROW * CH}px);opacity:1}`];
  for (const ri of streamRows) {
    kfs.push(`${P(ri.t0)}{transform:translate(0px,${ri.r * CH}px);opacity:1;animation-timing-function:steps(${Math.max(1, ri.n)},end)}`);
    kfs.push(`${P(ri.t0 + ri.dur)}{transform:translate(${ri.n * CW}px,${ri.r * CH}px);opacity:1}`);
  }
  kfs.push(`100%{transform:translate(${PARK.c * CW}px,${PARK.r * CH}px);opacity:0}`);
  css.push(`@keyframes ic{${kfs.join('')}}.ic{opacity:0;animation:ic ${s(T0)} steps(1,end) 0s 1 both}`);
  for (const ri of streamRows) {
    css.push(`@keyframes v${ri.r}{0%{transform:translateX(0)}${P(ri.t0)}{transform:translateX(0);animation-timing-function:steps(${Math.max(1, ri.n)},end)}`
      + `${P(ri.t0 + ri.dur)}{transform:translateX(${ri.n * CW}px)}100%{transform:translateX(${SW}px)}}`
      + `.v${ri.r}{transform:translateX(${SW}px);animation:v${ri.r} ${s(T0)} steps(1,end) 0s 1 both}`);
  }
  // the status line says RECEIVING until the screen is in, then IDLE; the loop waits for it too
  css.push(`@keyframes rx{0%{opacity:1}100%{opacity:0}}.rx{opacity:0;animation:rx ${s(T0)} steps(1,end) 0s 1 both}`);
  css.push(`@keyframes ix{0%{opacity:0}100%{opacity:1}}.ix{animation:ix ${s(T0)} steps(1,end) 0s 1 both}`);
}
// Captions: each line is erased and typed fresh, a black cover stepping off it a character at a
// time (the cursor rides the same steps).
CAPTIONS.forEach(([t0, text], i) => {
  const t1 = i + 1 < CAPTIONS.length ? CAPTIONS[i + 1][0] : LOOP;
  const n = len(text);
  const shown = (t) => t >= t0 - 1e-9 && t < t1 - 1e-9;
  const op = [`0%{opacity:${shown(0) ? 1 : 0}}`];
  if (t0 > 0) op.push(`${pct(t0)}{opacity:1}`);
  if (t1 < LOOP) op.push(`${pct(t1)}{opacity:0}`);
  op.push(`100%{opacity:${shown(LOOP - 1e-6) ? 1 : 0}}`);
  css.push(`@keyframes cp${i}{${op.join('')}}.cp${i}{opacity:${shown(REST_T) ? 1 : 0};${loopAnim(`cp${i}`)}}`);
  const cv = [`0%{transform:translateX(0)}`, `${t0 === 0 ? '0%' : pct(t0)}{transform:translateX(0);animation-timing-function:steps(${n},end)}`,
    `${pct(t0 + n / TYPE_CPS)}{transform:translateX(${n * CW}px)}`, `100%{transform:translateX(${n * CW}px)}`];
  css.push(`@keyframes cc${i}{${cv.join('')}}.cc${i}{transform:translateX(${n * CW}px);${loopAnim(`cc${i}`)}}`);
});
css.push(PAL.map((c, i) => `.c${i}{fill:${c}}`).join(''));
css.push('@media (prefers-reduced-motion:reduce){*{animation:none!important}}');

// ---------------------------------------------------------------------------------------------
// Assemble the SVG
// ---------------------------------------------------------------------------------------------
function textLayer(rows) {
  const byFg = new Map();
  for (const r of rows) for (let c = 0; c < COLS; c++) {
    const cl = cells[r][c];
    if (!cl || cl.ch === ' ') continue;
    byFg.set(cl.fg, (byFg.get(cl.fg) || '') + uses(r, c, cl.ch));
  }
  return [...byFg].map(([fg, u]) => `<g class="c${fg}">${u}</g>`).join('');
}
const body = [];
{
  const px = [];
  for (let y = 0; y < SROWS * 2; y++) for (let x = 0; x < COLS; x++) if (pix[y][x] != null) px.push([x, y, pix[y][x]]);
  body.push(emitPixels(px));
}
body.push(`<g class="wa">${emitPixels(wavesA, SX, SY)}</g><g class="wb">${emitPixels(wavesB, SX, SY)}</g>`);
body.push(textLayer(Array.from({ length: ROWS }, (_, r) => r)));
const spr = (name, frames) => `<g class="${name}">${frames.map((f, k) => `<g class="${name}f${k}">${emitPixels(f.px)}</g>`).join('')}</g>`;
body.push(`<g clip-path="url(#stage)">${spr('sh', SHARK)}${spr('nc', NUTCRAB)}${spr('cr', CRAB)}${spr('nt', [NUT])}</g>`);
{
  const hx = SX + HER_AT[0], hy = SY + HER_AT[1];
  body.push(`<g class="nu">${emitPixels(HER_UP.px, hx, hy)}</g><g class="nd">${emitPixels(HER_DOWN.px, hx, hy)}</g>`);
}
{
  const word = ' KLONK! ';
  body.push(`<g class="st"><g class="stf0">${emitPixels(STARS.px, SX + NUT_HOME[0] - 2, SY + CRAB_Y - 3)}`
    + `<rect class="c${RED}" x="${KLONK.c * CW}" y="${KLONK.r * CH}" width="${len(word) * CW}" height="${CH}"/>`
    + `<g class="c${WHT}">${uses(KLONK.r, KLONK.c, word)}</g></g></g>`);
}
letterSprites.forEach((L, i) => body.push(`<g class="L${i}"><g class="L${i}f0">${emitPixels(L.px, L.x, LOGO_Y)}</g></g>`));
body.push(`<g clip-path="url(#cap)">`);
CAPTIONS.forEach(([, text], i) => {
  body.push(`<g class="cp${i}"><g class="c${LCY}">${uses(R.caption, 1, '»')}</g><g class="c${WHT}">${uses(R.caption, 3, text.slice(2))}</g>`
    + `<rect class="c0 cc${i}" x="${CW}" y="${R.caption * CH}" width="${len(text) * CW}" height="${CH}"/></g>`);
});
body.push(`</g>`);
body.push(`<g clip-path="url(#scr)">${streamRows.map((ri) => `<rect class="c0 v${ri.r}" x="0" y="${ri.r * CH}" width="${SW}" height="${CH}"/>`).join('')}</g>`);
{
  const runs = [];
  for (let c = 0; c < COLS;) {
    const cl = cells[R.status][c];
    if (cl && cl.bg !== BLK) { const c0 = c; while (c < COLS && cells[R.status][c] && cells[R.status][c].bg === cl.bg) c++; runs.push(`<rect class="c${cl.bg}" x="${c0 * CW}" y="${R.status * CH}" width="${(c - c0) * CW}" height="${CH}"/>`); } else c++;
  }
  body.push(runs.join(''), textLayer([R.status]));
  body.push(`<g class="rx c${BLK}">${uses(R.status, STATUS_END, STATUS_RECV)}</g><g class="ix c${BLK}">${uses(R.status, STATUS_END, STATUS_IDLE)}</g>`);
}
body.push(`<rect class="ic c${LGR}" width="${CW}" height="${CH}"/>`);
body.push(`<g class="ix"><rect class="cu c${LGR}" width="${CW}" height="${CH}"/></g>`);

const glyphDefs = [...glyphIds].map(([ch, id]) => `<path id="${id}" d="${glyphPath(FONT.get(ch))}"/>`).join('');
const patDefs = [...patterns.values()].map((p) => {
  const g = FONT.get(p.sh);
  const id = `p${p.key.replace(/[░▒▓]/, (m) => ({ '░': 'a', '▒': 'b', '▓': 'c' })[m])}`;
  const d = runsPath((x, y) => (g[y] >> (7 - x)) & 1, 8, 2);      // the shade repeats every 8 x 2
  return `<pattern id="${id}" width="8" height="2" patternUnits="userSpaceOnUse"><rect width="8" height="2" fill="${PAL[p.bg]}"/><path fill="${PAL[p.fg]}" d="${d}"/></pattern>`;
}).join('');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VBW} ${VBH}" width="${VBW}" height="${VBH}" shape-rendering="crispEdges">`
  + `<title>CASTAWAY, an ANSImation: a lo-fi island video, painted in at modem speed</title>`
  + `<style>${css.join('')}</style>`
  + `<defs>${glyphDefs}${patDefs}<clipPath id="stage"><rect x="${SX * PX}" y="${SY * PX}" width="${SPW * PX}" height="${SPH * PX}"/></clipPath>`
  + `<clipPath id="cap"><rect x="${CW}" y="${R.caption * CH}" width="${STG.w * CW}" height="${CH}"/></clipPath>`
  + `<clipPath id="scr"><rect width="${SW}" height="${ROWS * CH}"/></clipPath></defs>`
  + `<rect width="${VBW}" height="${VBH}" rx="10" fill="#000"/><rect x="0.5" y="0.5" width="${VBW - 1}" height="${VBH - 1}" rx="10" fill="none" stroke="#3a3a3a"/>`
  + `<g transform="translate(${PAD} ${PAD})">${body.join('')}</g></svg>`;

fs.mkdirSync(path.dirname(OUT_SVG), { recursive: true });
fs.writeFileSync(OUT_SVG, svg);
console.log(`${path.basename(OUT_SVG)}: ${(svg.length / 1024).toFixed(1)} KB, ${kfCount} keyframes`);
console.log(`stream: ${totalBytes} bytes in all, ${streamBytes} after the title; draw-in ${T0}s at ${BAUD} baud; loop ${LOOP}s`);
console.log(`at 2400 baud the whole screen would take ${(totalBytes / 240).toFixed(1)}s`);

// ---------------------------------------------------------------------------------------------
// The README header (markdown). The capture block is the same screen as text, the way a
// terminal's capture file keeps it once the colour codes are stripped: the pictures do not
// survive, the words do, and every caption the line typed is in the log.
// ---------------------------------------------------------------------------------------------
const fmt = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const sec = (t) => (Math.round(t * 100) / 100).toString();
const streamSecs = streamBytes / BPS;
const pauseSecs = Math.round(T0 * 100) / 100 - Math.round(streamSecs * 100) / 100;   // the breath before and after
function captureText() {
  const lines = [];
  lines.push(`CAPTURE.TXT · castaway.ans · 80x25 · ${totalBytes} bytes · ${BAUD} 8N1 · colour stripped`);
  lines.push('');
  lines.push('   C  A  S  T  A  W  A  Y      (block capitals: they do not capture as text)');
  lines.push('');
  const picture = [
    '',
    '',
    '(a picture of the island was here)',
    '',
    'one tall palm, two coconuts, a sun,',
    'two clouds, a raft. she stands by',
    'the palm in cream headphones, a',
    'coral tank top and cream shorts,',
    'nodding on the beat.',
    '',
    'a hermit crab is on its way.',
  ];
  for (let r = FRAME.r0; r <= R.prompt; r++) {
    const row = [];
    for (let c = 0; c < COLS; c++) { const cl = cells[r][c]; row.push(cl ? cl.ch : ' '); }
    if (r > FRAME.r0 && r < FRAME.r1) {
      const t = [...(picture[r - FRAME.r0 - 1] || '')];
      const pad = Math.floor((STG.w - t.length) / 2);
      for (let c = STG.c; c < STG.c + STG.w; c++) row[c] = t[c - STG.c - pad] || ' ';
    }
    lines.push(row.join('').replace(/\s+$/, ''));
  }
  lines.push('');
  lines.push('-- the caption line, as typed, bar by bar ------------------------------------');
  for (const [t, text] of CAPTIONS) lines.push(`bar ${String(Math.floor(t / BAR + 1e-9) + 1).padStart(2)}   ${text}`);
  for (const l of lines) if (len(l) > 80) throw new Error(`capture line too long (${len(l)}): ${l}`);
  return lines.join('\n');
}

const ALT = 'CASTAWAY, as a 1990s ANSI animation on a black 80-column text screen. Big yellow block capitals with a dithered shadow '
  + 'spell CASTAWAY and are already there when you arrive; the rest of the file paints in below them, row by row, behind a grey '
  + 'block cursor, while the terminal status line reads BEACHCOMM, ANSI, 9600 8N1, castaway.ans, 80x25, RECEIVING and then IDLE, '
  + 'with 80 BPM at the end. On the left, a framed stage titled the island, always daytime: a half-block pixel island with one '
  + 'tall palm and two coconuts, a sun, clouds, a log raft and a blue sea. A young woman in cream headphones, a coral tank top '
  + 'and cream shorts stands by the palm and nods on every beat. A hermit crab walks in from the sea. On the downbeat a '
  + 'coconut drops onto it with a red KLONK! and stars, and the coconut walks off on crab legs, into the sea. Later a fin '
  + 'glides in, and a grinning shark surfaces right below her in headphones and nods in time with her for two bars '
  + 'before it sinks again, and the palm grows another coconut. '
  + 'The title letters hop one at a time to the beat. A caption line under the stage types out each event. On the right, four '
  + 'facts: an unofficial lo-fi remake of a 1992 desert-island screensaver, ten hours, one tiny island, one tall palm, she idles '
  + 'and now and then, on the beat, something happens; gags: a coconut that walks off, a shark in headphones, a cat on a crate, '
  + 'a bottle that washes straight back; more than 90 activities, four timers, every 2 to 5 minutes up to every 3 to 6 hours; '
  + 'sound synthesized from code, no samples, no mics. The last line is the run command: python tools/serve.py, then open '
  + 'http://127.0.0.1:8765/.';

const FENCE = '```';
const md = `<!-- Header ${SLUG} for Castaway. Generated by src/${SLUG}.mjs: edit that, not this. -->
<!-- Style: ANSImation, the modem-speed draw-in (catalogue entry ansi-04). Links are written for the castaway project root. -->

<p align="center">
  <img src="assets/${SLUG}.svg" width="832" alt="${ALT}">
</p>

<p align="center">
  <b>CASTAWAY</b> <i>(working title)</i>: ten hours of one tiny island, received one character at a time.<br>
  <sub>an unofficial lo-fi remake, inspired by the 1992 screensaver <i>Johnny Castaway</i> · in development · no video published yet</sub>
</p>

**Castaway** is a stationary-frame lo-fi video for YouTube, in the spirit of the ten-hour streams: a young woman, a tiny island, one tall palm, a raft and a great deal of time. She stands about. She nods along to her headphones. Every so often, on the next bar of the music, something happens: a coconut lands on a hermit crab, who keeps it; a shark surfaces in headphones and nods along to the same beat; a stray cat drifts in on a crate and naps at the top of the palm. Then she goes back to standing about. The header above takes ${sec(T0)} seconds to arrive at ${BAUD} baud. The video takes ten hours. Nobody here is in a hurry.

The happenings are booked in [activities.toml](activities.toml): more than 90 activities, most of them on four timers (regular every 2 to 5 minutes, occasional every 12 to 25, rare every 30 to 60, super rare every 3 to 6 hours and three a run at most) and the rest follow-ups that only ever come after something else. A typical ten-hour run (the median of 200 simulated runs) has about 155 regular, 30 occasional, 13 rare and 2 super-rare events, and she is busy for about a third of it. Each one waits for the next bar of the music, every 3 seconds, so the gags land on the beat, like the coconut above. Lanes let them overlap, which is how a ship gets past while she is busy with a coconut (it waits until she is). The default run is 10:00:00 on seed 1992, and it is always daytime.

Every sound is synthesized from code by [tools/make_audio.py](tools/make_audio.py): more than 150 sound files and no samples, loops or recordings, so no third-party licence applies. The theme is a seamless 60-second loop at 80 BPM in F major (ii-V-I-vi), 20 bars of exactly 3 seconds, with electric piano, a kalimba lead, soft drums and vinyl crackle, and the ocean is a seamless 60-second loop too. The mix sits at -14 LUFS with true peak at or below -1 dBTP, and the levels are adjustable in master and per routine. Nobody has listened to any of it yet. The status line already knows the tempo.

${FENCE}sh
python tools/serve.py              # then open http://127.0.0.1:8765/
python tools/schedule.py           # validate it all, simulate a 10-hour run
python tools/render_demo.py --dev  # dev reel of every activity, with a HUD
${FENCE}

The page at [web/index.html](web/index.html) previews live and exports a YouTube-ready MP4: the browser encodes frame-exact H.264 (WebCodecs: 68 to 78 frames a second in Chrome, measured at 1080p30), and the server mixes in the sound and joins the two. Plain ES modules, no build step, no npm packages. Hard cuts and stepped movement are the project's motion defaults, which this header approves of. Decisions and notes live in [MUSING.md](MUSING.md).

<details>
<summary><b>CAPTURE.TXT</b>: the same screen with the colour codes stripped, and every caption it typed</summary>

${FENCE}text
${captureText()}
${FENCE}

</details>

<details>
<summary><b>LINE SPEED</b>: why the header takes ${sec(T0)} seconds, and what the cursor is up to</summary>

Before it draws anything, the generator works out what this screen would cost as an ANSI stream (it counts the bytes; no .ANS file is written): half-block pixels become ▀, ▄, █ or a shade character with a foreground and a background colour, gaps become cursor-forward codes, every colour change costs an escape sequence, and each row ends in CR LF. By that count the whole 80x25 screen is ${fmt(totalBytes)} bytes. The title is already up when you arrive; the other ${fmt(streamBytes)} bytes take ${sec(streamSecs)} seconds at ${BAUD} baud (${fmt(BPS)} bytes a second), and with ${sec(pauseSecs)} seconds of pauses, before and after, the screen is in at ${sec(T0)} seconds. Each row takes exactly as long as its bytes do, so rows of sea and sand crawl and the empty ones flash past. At 2400 baud the full screen would take ${(totalBytes / 240).toFixed(1)} seconds.

Then it plays as a cartoon on the soundtrack's grid: 80 BPM, a beat every 0.75 seconds and a bar every 3. Sprites move by erase and redraw, with the faint flicker that comes with it. The caption line is wiped and retyped at ${TYPE_CPS} characters a second, far slower than the line could carry it, because a caption that arrives in about a twentieth of a second is not much of a caption. The cursor follows the work: along the caption as it types, down with the coconut, up to the palm when it grows a new one, then back to the end of the run line, where it blinks on the beat. The shark nods on the same beat as she does. Nobody told it to. The cartoon loops every ${LOOP_BARS} bars (${LOOP} seconds). With reduced motion you get one finished frame: the coconut has just landed.

</details>

<details>
<summary><b>SAUCE</b>: credits, greetz and small print</summary>

${FENCE}text
TITLE     castaway.ans, an ANSImation for the Castaway README
AUTHOR    pumice
GROUP     Half Duplex (one of us talks at a time)
SIZE      ${totalBytes} bytes · 80x25 · 16 colours · half-block pixels
TERMINAL  BEACHCOMM · ${BAUD} 8N1
FONT      an 8x16 bitmap drawn for this header
COMMENT   unofficial · inspired by a 1992 screensaver · always daytime
${FENCE}

Greetz to the hermit crab (new address), the shark (same beat), the cat on the crate (wherever it floated off to this time), the ship (busy waiting for her to be busy), and anyone who ever sat through ${(totalBytes / 240).toFixed(1)} seconds at 2400 baud to see a palm tree.

pumice, Half Duplex and BEACHCOMM are invented for this header. The ANSImation style belongs to the 1990s BBS art scene; no group, artist, board, file or logo from it is reproduced here, and every letter, sprite and pixel is drawn new. *Johnny Castaway* and its castaway belong to their owners; Castaway is an unofficial remake inspired by it and is not affiliated with them.

</details>
`;
if (/—/.test(md)) throw new Error('house style: no em dashes');
fs.writeFileSync(OUT_MD, md);
console.log(`${path.basename(OUT_MD)}: ${(md.length / 1024).toFixed(1)} KB`);
