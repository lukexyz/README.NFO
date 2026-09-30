#!/usr/bin/env node
// ULTRA-SATISFACTORY on THE CLOGGED MERGER BBS: a 1990s ANSI login screen for a factory floor.
//
// Regenerate:  node examples/ultra-satisfactory/src/06-ansi-bbs_opus_5.5.mjs
//
// Plain Node, no dependencies, fully deterministic (no clock, no randomness). Everything sits on
// a 100 x 33 grid of 8 x 16 cells, like a DOS text screen, using a CP437-style bitmap font
// defined below. Text is <use> references to glyph paths, never <text>, so it looks the same
// for every viewer. Animation is CSS only, so prefers-reduced-motion can switch it all off.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '06-ansi-bbs_opus_5.5';
const OUT = path.join(HERE, '..', 'assets', `${SLUG}.svg`);

// ---------------------------------------------------------------------------------------------
// Screen geometry and timing
// ---------------------------------------------------------------------------------------------
const COLS = 100, ROWS = 33, CW = 8, CH = 16, PAD = 16;
const SW = COLS * CW, SH = ROWS * CH;
const VBW = SW + PAD * 2, VBH = SH + PAD * 2;

const TICK = 0.25;              // the factory clock: everything is a multiple of this
const BELT = 48;                // belt speed, px per second (one 2 px sprite pixel every TICK / 6)
const s = (t) => `${+t.toFixed(5)}s`;

// The one-off intro (modem dials, CONNECT, then the screen is drawn row by row). The loops below
// are timed against it, so the lightbar starts on phase 1 and the file transfer starts from zero
// at the moment the intro uncovers them, instead of being caught halfway through a cycle.
const INTRO = { typeAt: 0.3, typeDur: 0.68, connectAt: 1.2, drawAt: 1.4, drawDur: 1.8 };

// Row map of the screen.
const R = { modem: 0, logo: 1, tag: 11, items: 13, panels: 20, xfer: 28, prompt: 30, scroll: 31, status: 32 };

// The 16-colour DOS/ANSI palette.
const PAL = ['#000000', '#0000AA', '#00AA00', '#00AAAA', '#AA0000', '#AA00AA', '#AA5500', '#AAAAAA',
  '#555555', '#5555FF', '#55FF55', '#55FFFF', '#FF5555', '#FF55FF', '#FFFF55', '#FFFFFF'];
const [BLK, BLU, GRN, CYN, RED, MAG, BRN, LGR, DGR, LBL, LGN, LCY, LRD, LMG, YEL, WHT] = PAL.map((_, i) => i);

// ---------------------------------------------------------------------------------------------
// CP437-style 8x16 bitmap font. Rows are '#'/'.' strings, placed from row `top` of the cell.
// Capitals sit on rows 2-11 with the VGA habit of 2-pixel stems; lowercase x-height is row 5.
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

// Blocks and CP437 shades.
const rowsOf = (fn) => Array.from({ length: 16 }, (_, y) => fn(y));
FONT.set('█', rowsOf(() => 0xFF));
FONT.set('▀', rowsOf((y) => (y < 8 ? 0xFF : 0)));
FONT.set('▄', rowsOf((y) => (y >= 8 ? 0xFF : 0)));
FONT.set('▌', rowsOf(() => 0xF0));
FONT.set('▐', rowsOf(() => 0x0F));
FONT.set('░', rowsOf((y) => (y % 2 ? 0x88 : 0x22)));
FONT.set('▒', rowsOf((y) => (y % 2 ? 0xAA : 0x55)));
FONT.set('▓', rowsOf((y) => (y % 2 ? 0x77 : 0xDD)));

// Box drawing, generated from arm descriptions: single lines on row 7 / column 3,
// double lines on rows 6+9 / columns 2+5.
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
box('┴', ({ hline, vline }) => { hline(7, 0, 7); vline(3, 0, 7); });
box('├', ({ hline, vline }) => { hline(7, 3, 7); vline(3, 0, 15); });
box('┤', ({ hline, vline }) => { hline(7, 0, 3); vline(3, 0, 15); });
box('═', ({ hline }) => { hline(6, 0, 7); hline(9, 0, 7); });
box('║', ({ vline }) => { vline(2, 0, 15); vline(5, 0, 15); });
box('╔', ({ hline, vline }) => { hline(6, 2, 7); vline(2, 6, 15); hline(9, 5, 7); vline(5, 9, 15); });
box('╗', ({ hline, vline }) => { hline(6, 0, 5); vline(5, 6, 15); hline(9, 0, 2); vline(2, 9, 15); });
box('╚', ({ hline, vline }) => { hline(9, 2, 7); vline(2, 0, 9); hline(6, 5, 7); vline(5, 0, 6); });
box('╝', ({ hline, vline }) => { hline(9, 0, 5); vline(5, 0, 9); hline(6, 0, 2); vline(2, 0, 6); });

// Glyph bitmap -> compact path (greedy merge of horizontal runs into rectangles).
function bitmapPath(rows, width, scaleX = 1, scaleY = 1, ox = 0, oy = 0) {
  const rects = [];
  let open = [];
  for (let y = 0; y < rows.length; y++) {
    const runs = [];
    for (let x = 0; x < width;) {
      if (rows[y](x)) { const s0 = x; while (x < width && rows[y](x)) x++; runs.push([s0, x - s0]); } else x++;
    }
    const next = [];
    for (const [x0, w] of runs) {
      const o = open.find((r) => r.x === x0 && r.w === w && r.y + r.h === y);
      if (o) { o.h++; next.push(o); } else { const r = { x: x0, w, y, h: 1 }; rects.push(r); next.push(r); }
    }
    open = next;
  }
  return rects.map((r) => `M${ox + r.x * scaleX} ${oy + r.y * scaleY}h${r.w * scaleX}v${r.h * scaleY}h${-r.w * scaleX}z`).join('');
}
const glyphPath = (g) => bitmapPath(g.map((v) => (x) => (v >> (7 - x)) & 1), 8);

const glyphIds = new Map();
function gid(ch) {
  if (!FONT.has(ch)) throw new Error(`no glyph for ${JSON.stringify(ch)} (U+${ch.codePointAt(0).toString(16)})`);
  if (!glyphIds.has(ch)) glyphIds.set(ch, `g${glyphIds.size.toString(36)}`);
  return glyphIds.get(ch);
}
// <use> elements for a string at a cell position (colour comes from the parent group).
function uses(r, c, str) {
  let out = '';
  for (const ch of str) {
    if (ch !== ' ') out += `<use href="#${gid(ch)}" x="${c * CW}" y="${r * CH}"/>`;
    c++;
  }
  return out;
}
const len = (str) => [...str].length;

// ---------------------------------------------------------------------------------------------
// Static screen buffer
// ---------------------------------------------------------------------------------------------
const grid = Array.from({ length: ROWS }, () => new Array(COLS).fill(null));
const bgRuns = [];
function put(r, c, str, fg) {
  for (const ch of str) {
    if (c < 0 || c >= COLS || r < 0 || r >= ROWS) throw new Error(`off screen at ${r},${c}: ${str}`);
    grid[r][c] = ch === ' ' ? null : { ch, fg };
    c++;
  }
  return c;
}
// A row of coloured segments: seg(r, c, [[text, fg], ...])
function seg(r, c, parts) { for (const [t, fg] of parts) c = put(r, c, t, fg); return c; }
function bg(r, c, n, color) { bgRuns.push({ r, c, n, color }); }
const centre = (n) => Math.floor((COLS - n) / 2);
const width = (parts) => parts.reduce((a, [t]) => a + len(t), 0);

// A double-line panel with a coloured "tab" set into its top border, a title after the tab and
// an optional note on the right: the app's three tabs, drawn the way a BBS door would.
function panel({ r0, r1, c0, c1, frame, tab, tabFg, tabBg, title = [], note = [] }) {
  put(r0, c0, '╔═', frame);
  let c = c0 + 2;
  bg(r0, c, len(tab) + 2, tabBg);
  c = put(r0, c, ` ${tab} `, tabFg);
  c = put(r0, c, '═', frame);
  c = seg(r0, c, title);
  const noteAt = c1 - 1 - width(note);
  if (noteAt < c) throw new Error(`panel "${tab}": top border too long`);
  put(r0, c, '═'.repeat(noteAt - c), frame);
  seg(r0, noteAt, note);
  put(r0, c1 - 1, '═╗', frame);
  for (let r = r0 + 1; r < r1; r++) { put(r, c0, '║', frame); put(r, c1, '║', frame); }
  put(r1, c0, '╚' + '═'.repeat(c1 - c0 - 1) + '╝', frame);
}

// Row 0: the modem line. The number dialled is the inventory: 140 items, 211 recipes, 477 buildings.
const DIAL = 'ATDT 0140 211 477';
put(R.modem, 0, DIAL, LGR);
put(R.modem, 19, 'CONNECT 14400/ARQ/V42BIS', WHT);
// The obligatory tracker module. There is no sound: the little equaliser (animated below) is for show.
const TUNE = { c: 46, text: '♪ ONE_MORE_BELT.MOD' };
seg(R.modem, TUNE.c, [['♪ ', LMG], ['ONE_MORE_BELT.MOD', LGR]]);
put(R.modem, 79, '03:07 AM', LCY);
const SHIFT = { c: 90, text: '■ ON SHIFT' };

// Rows 1-5, right of the big ULTRA: who you have dialled, and who you are.
const IDENT_C = 64;
put(R.logo, IDENT_C, 'THE CLOGGED MERGER BBS', YEL);
put(R.logo + 1, IDENT_C, 'factory-floor bulletin board', LGR);
seg(R.logo + 2, IDENT_C, [['SysOp ', LGR], ['····', DGR], [' Belt Daddy', WHT]]);
seg(R.logo + 3, IDENT_C, [['Node 1 ', LGR], ['···', DGR], [' Pioneer ', WHT], ['#0140', YEL]]);
seg(R.logo + 4, IDENT_C, [['Last on ', LGR], ['··', DGR], [' 3 A.M., "one more belt"', LMG]]);

// Row 11: the flyer tagline.
{
  const parts = [['▒▓█ ', LBL], ['A COMPANION APP FOR SATISFACTORY', YEL], [' ░ ', DGR],
    ['EVERY RECIPE, BUILDING & OBJECTIVE', WHT], [' ░ ', DGR], ['ONE CLICK APART', LCY], [' █▓▒', LBL]];
  seg(R.tag, centre(width(parts)), parts);
}

// Rows 13-19: the ITEMS tab as a production line. The recipe is the real one (checked against
// the app's data): 3 Reinforced Iron Plate + 12 Iron Rod -> 2 Modular Frame, Assembler, 60 s, 15 MW.
const ITEMS = { r0: R.items, r1: R.items + 6, c0: 1, c1: 98 };
const MACHINE = { c: 50, w: 15, r: ITEMS.r0 + 1, h: 5 };
// Belts: `y` is the belt surface in px, `pitch` the gap between items in px. Everything rides at
// one speed, so the pitch is the recipe's per-minute rate to scale: rods (12/min) are packed 4x
// tighter than plates (3/min), and frames (2/min) leave at two thirds the density of the plates.
// `port` is the side of the belt that runs into the machine: a black hatch in the casing, one cell
// wide, that the items slide into (or out of). The input belts start at a small grey feeder box,
// so parts come out of something instead of appearing in mid-air.
const BELTS = [
  { y: (ITEMS.r0 + 2) * CH + 8, c0: 28, c1: 49, pitch: 96, sprite: 'plate', port: 'end' },   // 3 a minute
  { y: (ITEMS.r0 + 5) * CH + 8, c0: 28, c1: 49, pitch: 24, sprite: 'rod', port: 'end' },     // 12 a minute
  { y: (ITEMS.r0 + 4) * CH, c0: 65, c1: 97, pitch: 144, sprite: 'frame', port: 'start' },    // 2 a minute
];
{
  panel({
    ...ITEMS, frame: LMG, tab: 'ITEMS', tabFg: BLK, tabBg: LMG,
    title: [[' RECIPE CARD: ', LGR], ['MODULAR FRAME ', WHT]],
    note: [[' 140', WHT], [' items ', LGR], ['·', DGR], [' 211', WHT], [' recipes (', LGR], ['88', WHT], [' alternates) ', LGR]],
  });
  const input = (r, qty, name, rate) => {
    put(r, 3, qty.padStart(2), YEL);
    put(r, 6, name, WHT);
    seg(r + 1, 4, [['└ ', DGR], [rate, LGN]]);
  };
  input(ITEMS.r0 + 1, '3', 'Reinforced Iron Plate', '3/min');
  input(ITEMS.r0 + 4, '12', 'Iron Rod', '12/min');

  // The machine: a slab of DOS brown (hazard tape top and bottom is drawn below) with its name,
  // a row of chevrons (animated below) and its stats.
  for (let i = 0; i < MACHINE.h; i++) bg(MACHINE.r + i, MACHINE.c, MACHINE.w, BRN);
  put(MACHINE.r + 1, MACHINE.c + 3, 'ASSEMBLER', WHT);
  seg(MACHINE.r + 3, MACHINE.c + 2, [['60 s', YEL], [' · ', BLK], ['15 MW', YEL]]);

  const x = 67;
  const name = '2 Modular Frame ', rate = ' 2/min';
  seg(ITEMS.r0 + 1, x, [['2', YEL], [' Modular Frame ', WHT], ['·'.repeat(98 - 1 - x - len(name) - len(rate)), DGR], [rate, LGN]]);
  put(ITEMS.r0 + 5, x, 'click a part, get its recipe.', LGR);
}

// Rows 20-26: OBJECTIVES (the Space Elevator line-up, flyer style) and BUILDINGS (the shift roster).
const OBJ = { c0: 1, c1: 55, r0: R.panels, r1: R.panels + 6, n: 5 };
{
  const { c0, c1, r0, r1 } = OBJ, w = c1 - c0 - 3;
  panel({
    r0, r1, c0, c1, frame: MAG, tab: 'OBJECTIVES', tabFg: WHT, tabBg: MAG,
    title: [[' SPACE ELEVATOR LINE-UP ', WHT]], note: [[' 5', WHT], [' phases ', LGR]],
  });
  const phases = [
    ['AUTOMATION BASICS', 'Smart Plating', 'x50'],
    ['LOGISTICS & STEEL', 'Modular Frame', 'x500'],
    ['OIL & COMPUTERS', 'Modular Engine', 'x500'],
    ['NUCLEAR & ENDGAME', 'Nuclear Pasta', 'x100'],
    ['ALIEN TECH & QUANTUM', 'Ballistic Warp Drive', 'x100'],
  ];
  phases.forEach(([name, part, qty], i) => {
    const dots = w - 2 - len(name) - len(part) - len(qty) - 3;
    if (dots < 2) throw new Error(`phase ${i + 1} too long`);
    seg(r0 + 1 + i, c0 + 2, [[`${i + 1} `, LMG], [name, WHT], [' ' + '·'.repeat(dots) + ' ', DGR], [part, LCY], [' ' + qty, YEL]]);
  });
}
{
  const c0 = 57, c1 = 98, r0 = R.panels, r1 = R.panels + 6, w = c1 - c0 - 3;
  panel({
    r0, r1, c0, c1, frame: LBL, tab: 'BUILDINGS', tabFg: WHT, tabBg: LBL,
    title: [[' SHIFT ROSTER ', WHT]], note: [[' 477', WHT], [' total ', LGR]],
  });
  const x = c0 + 2;
  const row = (r, parts) => { if (seg(r, x, parts) > x + w) throw new Error(`roster row ${r} too long`); };
  const names = (list) => list.flatMap((n, i) => (i ? [[' · ', DGR], [n, WHT]] : [[n, WHT]]));
  row(r0 + 1, [['9 production machines', LCY], [', ', LGR], ['0 tea breaks', LCY]]);
  row(r0 + 2, names(['Assembler', 'Blender', 'Constructor']));
  row(r0 + 3, names(['Foundry', 'Manufacturer', 'Packager']));
  row(r0 + 4, names(['Particle Accelerator', 'Refinery']));
  row(r0 + 5, [['Smelter', WHT], [' + ', DGR], ['468', YEL], [' more things to build', LGR]]);
}

// Row 28: the file transfer (the moving parts are animated below).
const XFER = { r: R.xfer, c0: 11, barW: 24 };
XFER.cName = XFER.c0 + 12; XFER.cBar = XFER.cName + 13; XFER.cCount = XFER.cBar + XFER.barW + 1; XFER.cStat = XFER.cCount + 9;
put(XFER.r, XFER.c0, 'DOWNLOADING', LGR);
put(XFER.r, XFER.cBar, '█'.repeat(XFER.barW), LGN);

// Row 30: the prompt (the blinking part is animated below), row 32: terminal status bar.
const PROMPT = { lead: '▓▒░ ', word: 'PRESS ANY KEY', tail: ' ░▒▓', aside: '  (it\'s a README. the real menu is below.)' };
const PROMPT_C = centre(len(PROMPT.lead + PROMPT.word + PROMPT.tail + PROMPT.aside));
put(R.prompt, PROMPT_C, PROMPT.lead, LBL);
put(R.prompt, PROMPT_C + len(PROMPT.lead) + len(PROMPT.word), PROMPT.tail, LBL);
put(R.prompt, PROMPT_C + len(PROMPT.lead + PROMPT.word + PROMPT.tail), PROMPT.aside, DGR);

bg(R.status, 0, COLS, BLU);
const SPIN_C = seg(R.status, 0, [
  [' RUN: ', YEL], ['python -m streamlit run app/app.py', WHT], [' ', 0], ['│', LCY],
  [' LIVE: ', YEL], ['lukexyz.github.io/ULTRA-SATISFACTORY', WHT], [' ', 0], ['│', LCY], [' ONLINE ', LGN],
]);

// ---------------------------------------------------------------------------------------------
// The logo: ULTRA (10 px tall) over SATISFACTORY (8 px tall) on an 8x8 half-block grid, filled
// with CP437 shade ramps and a dithered drop shadow. Own lettering: nothing here is traced.
// ---------------------------------------------------------------------------------------------
const rep = (row, n) => new Array(n).fill(row);
const BIG = {
  U: [...rep('##....##', 8), '########', '.######.'],
  L: [...rep('##.....', 8), '#######', '#######'],
  T: ['########', '########', ...rep('...##...', 8)],
  R: ['#######.', '########', '##....##', '##....##', '########', '#######.', '##.###..', '##..###.', '##...###', '##....##'],
  A: ['.######.', '########', '##....##', '##....##', '########', '########', ...rep('##....##', 4)],
};
const SMALL = {
  S: ['.######', '#######', '##.....', '######.', '.######', '.....##', '#######', '######.'],
  A: ['.#####.', '#######', '##...##', '##...##', '#######', '#######', '##...##', '##...##'],
  T: ['######', '######', ...rep('..##..', 6)],
  I: rep('##', 8),
  F: ['#######', '#######', '##.....', '######.', '######.', '##.....', '##.....', '##.....'],
  C: ['.######', '#######', '##.....', '##.....', '##.....', '##.....', '#######', '.######'],
  O: ['.#####.', '#######', '##...##', '##...##', '##...##', '##...##', '#######', '.#####.'],
  R: ['######.', '#######', '##...##', '#######', '######.', '##.##..', '##..##.', '##...##'],
  Y: ['##..##', '##..##', '##..##', '######', '.####.', '..##..', '..##..', '..##..'],
};
const LP = 8;                       // logo pixel size
const UH = 10, SHH = 8, SY = 11;    // ULTRA height, SATISFACTORY height and its row offset (logo px)
const LH = SY + SHH;                // whole lockup height in logo px
function wordBitmap(word, face) {
  const cols = [];
  [...word].forEach((ch, i) => {
    if (i) cols.push(null);
    const L = face[ch];
    for (let x = 0; x < L[0].length; x++) cols.push(L.map((row) => row[x] === '#'));
  });
  return cols; // cols[x][y]
}
const wordU = wordBitmap('ULTRA', BIG), wordS = wordBitmap('SATISFACTORY', SMALL);
const LOGO_W = Math.max(wordU.length, wordS.length);
const LOGO_X = Math.round((SW - (LOGO_W + 1) * LP) / 2 / CW) * CW; // grid aligned, shadow included
const LOGO_Y = R.logo * CH;
const colsPath = (cols, h, oy) => bitmapPath(Array.from({ length: h }, (_, y) => (x) => cols[x] && cols[x][y]), cols.length, LP, LP, 0, oy * LP);
const pathU = colsPath(wordU, UH, 0), pathS = colsPath(wordS, SHH, SY);

// Ramps per logo row: [colour, shade] where shade is full, or a CP437 shade pattern.
const SHADES = { '▓': ['##.#', '.###'], '▒': ['#.#.', '.#.#'], '░': ['..#.', '#...'] };
const RAMP = [
  // The shading stops short of the last rows on purpose: the feet of U and L and the bowls of
  // S, C and O live down there, and the words stop reading if those strokes dither away.
  [WHT], [LCY], [LCY], [LCY], [LCY], [CYN], [CYN], [CYN], [CYN], [CYN, '▓'],   // ULTRA
  null,
  [WHT], [WHT], [WHT], [WHT], [LGR], [LGR], [LGR], [LGR, '▓'],                 // SATISFACTORY
];
function rampPattern(id, ramp) {
  let d = '';
  const byColor = new Map();
  ramp.forEach((step, i) => {
    if (!step) return;
    const [color, shade] = step;
    let p = byColor.get(color) || '';
    if (!shade) p += `M0 ${i * LP}h4v${LP}h-4z`;
    else {
      const pat = SHADES[shade];
      p += bitmapPath(Array.from({ length: LP }, (_, y) => (x) => pat[y % 2][x] === '#'), 4, 1, 1, 0, i * LP);
    }
    byColor.set(color, p);
  });
  for (const [color, p] of byColor) d += `<path d="${p}" fill="${PAL[color]}"/>`;
  return `<pattern id="${id}" width="4" height="${ramp.length * LP}" patternUnits="userSpaceOnUse">${d}</pattern>`;
}
function shadePattern(id, shade, color) {
  const pat = SHADES[shade];
  return `<pattern id="${id}" width="4" height="2" patternUnits="userSpaceOnUse"><path d="${bitmapPath(pat.map((row) => (x) => row[x] === '#'), 4)}" fill="${PAL[color]}"/></pattern>`;
}

// ---------------------------------------------------------------------------------------------
// Animated pieces
// ---------------------------------------------------------------------------------------------
const css = [];
const under = [];   // drawn beneath the static text
const layers = [];  // drawn above it
const defs = [];

// Colour classes.
css.push(PAL.map((c, i) => `.c${i}{fill:${c}}`).join(''));

// n-step frame visibility: classes `${p}0..${p}${n-1}`, each visible for one n-th of `dur`.
const stepKeys = (name, n, k) => {
  const a = (100 * k) / n, b = (100 * (k + 1)) / n;
  const parts = [];
  parts.push(`0%{opacity:${k === 0 ? 1 : 0}}`);
  if (k > 0) parts.push(`${+a.toFixed(3)}%{opacity:1}`);
  if (k < n - 1) parts.push(`${+b.toFixed(3)}%{opacity:0}`);
  parts.push(`100%{opacity:${k === n - 1 ? 1 : 0}}`);
  return `@keyframes ${name}${k}{${parts.join('')}}`;
};
function frames(p, n, dur, restAll = false, startAt = 0) {
  const ks = Array.from({ length: n }, (_, k) => k);
  css.push(ks.map((k) => stepKeys(p, n, k)).join(''));
  css.push(`${ks.filter((k) => restAll || k > 0).map((k) => `.${p}${k}`).join(',')}{opacity:0}`);
  const start = startAt ? ` ${s(startAt)} backwards` : '';
  css.push(ks.map((k) => `.${p}${k}{animation:${p}${k} ${s(dur)} steps(1,end) infinite${start}}`).join(''));
}

// Logo: shadow, fills, and a shine that sweeps through the whole lockup every eight seconds.
{
  defs.push(`<path id="lgU" d="${pathU}"/><path id="lgS" d="${pathS}"/>`);
  defs.push(rampPattern('ramp', RAMP), shadePattern('shadow', '▒', BLU));
  defs.push(`<clipPath id="lgclip"><use href="#lgU"/><use href="#lgS"/></clipPath>`);
  // The glint is white over the cyan word and cyan over the white one, so it shows on both.
  let shineU = '', shineS = '';
  for (let y = 0; y < LH; y++) {
    const d = `M${-Math.floor(y / 2) * LP} ${y * LP}h${2 * LP}v${LP}h${-2 * LP}z`;
    if (y < SY) shineU += d; else shineS += d;
  }
  const lean = Math.floor((LH - 1) / 2) * LP;
  const sweep = Math.ceil((LOGO_W * LP + lean + 32) / 8) * 8;
  css.push(`@keyframes sh{0%{transform:translateX(-24px);animation-timing-function:steps(${sweep / 8},end)}20%{transform:translateX(${sweep - 24}px)}100%{transform:translateX(${sweep - 24}px)}}.sh{transform:translateX(${sweep - 24}px);animation:sh 8s 3s infinite}`);
  layers.push(`<g transform="translate(${LOGO_X} ${LOGO_Y})">`
    + `<use href="#lgU" x="${LP}" y="${LP}" fill="url(#shadow)"/><use href="#lgS" x="${LP}" y="${LP}" fill="url(#shadow)"/>`
    + `<use href="#lgU" fill="#000"/><use href="#lgS" fill="#000"/>` // so the shadow never shows through the dithered rows
    + `<use href="#lgU" fill="url(#ramp)"/><use href="#lgS" fill="url(#ramp)"/>`
    + `<g clip-path="url(#lgclip)"><g class="sh"><path d="${shineU}" fill="#FFF" opacity=".7"/><path d="${shineS}" fill="${PAL[LCY]}" opacity=".8"/></g></g>`
    + `</g>`);
}

// The emblem: a hexagon with a cog inside, echoing the app's own, redrawn as 2 px pixel art.
// Shapes are rasterised here from simple geometry; the cog turns one tooth a second.
{
  const N = 40, PX = 2, U = 120 / N;
  const X0 = 52 * CW, Y0 = LOGO_Y;
  const rad = (deg) => (deg * Math.PI) / 180;
  const hexPts = (rr) => Array.from({ length: 6 }, (_, k) => [60 + rr * Math.cos(rad(k * 60 - 90)), 60 + rr * Math.sin(rad(k * 60 - 90))]);
  const segDist = ([px, py], [ax, ay], [bx, by]) => {
    const dx = bx - ax, dy = by - ay;
    const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
    return Math.hypot(px - ax - t * dx, py - ay - t * dy);
  };
  const polyDist = (p, pts) => Math.min(...pts.map((a, i) => segDist(p, a, pts[(i + 1) % pts.length])));
  const raster = (test) => bitmapPath(Array.from({ length: N }, (_, j) => (i) => test([(i + 0.5) * U, (j + 0.5) * U])), N, PX, PX);
  const polar = ([x, y]) => [Math.hypot(x - 60, y - 60), (Math.atan2(y - 60, x - 60) * 180) / Math.PI + 360];
  const outer = hexPts(55);
  const TEETH = 8, FRAMES = 4;
  const hex = raster((p) => polyDist(p, outer) < 1.6);
  const ring = raster((p) => { const [d, a] = polar(p); return Math.abs(d - 40) < 1.6 && (a % 30) < 17; });
  const body = raster((p) => { const [d] = polar(p); return d < 23.5 && d > 8.5; });
  const hub = raster((p) => { const [d] = polar(p); return d < 15 && d > 8.5; });
  const tooth = (rot) => raster((p) => {
    const [d, a] = polar(p);
    if (d < 22 || d > 32.5) return false;
    const pitch = 360 / TEETH;
    const off = (((a - rot) % pitch) + pitch) % pitch;
    const ang = Math.min(off, pitch - off);
    return rad(ang) * d < 5.2;
  });
  frames('cg', FRAMES, 1);
  frames('nd', 6, 3, true);
  let out = `<path class="c11" d="${hex}"/><path class="c9" d="${ring}"/>`;
  for (let k = 0; k < FRAMES; k++) out += `<path class="c14 cg${k}" d="${tooth((k * 360) / TEETH / FRAMES)}"/>`;
  out += `<path class="c14" d="${body}"/><path class="c6" d="${hub}"/>`;
  // Six corner nodes, with a yellow light running round them.
  const node = ([x, y]) => { const i = Math.round(x / U - 0.5), j = Math.round(y / U - 0.5); return `M${(i - 1) * PX} ${(j - 1) * PX}h${3 * PX}v${3 * PX}h${-3 * PX}z`; };
  const nodes = hexPts(54);
  out += `<path class="c15" d="${nodes.map(node).join('')}"/>`;
  nodes.forEach((n, k) => { out += `<path class="c14 nd${k}" d="${node(n)}"/>`; });
  layers.push(`<g transform="translate(${X0} ${Y0})">${out}</g>`);
}

// "ON SHIFT" light (row 0) pulses every two seconds.
css.push(`@keyframes air{0%{opacity:1}50%{opacity:.3}100%{opacity:.3}}.air{animation:air 2s steps(1,end) infinite}`);
layers.push(`<g class="c12 air">${uses(R.modem, SHIFT.c, SHIFT.text)}</g>`);

// Row 0 equaliser: six 4 px bars stepping through a fixed eight-step pattern, four steps a second.
// Lit bars are drawn once; a black cover over each one slides up and down to set its level.
{
  const LEVELS = [
    [6, 3, 4, 2, 5, 3, 4, 2], [4, 5, 2, 4, 3, 6, 2, 3], [2, 4, 6, 3, 2, 4, 5, 3],
    [5, 2, 3, 5, 4, 2, 6, 3], [3, 6, 2, 4, 6, 3, 2, 5], [2, 3, 5, 2, 3, 5, 3, 4],
  ];
  const x0 = (TUNE.c + len(TUNE.text) + 1) * CW + 2, y0 = R.modem * CH + 1, H = 12, UNIT = 2;
  let lit = '', tip = '', covers = '', clip = '';
  LEVELS.forEach((steps, b) => {
    const x = x0 + b * 6;
    lit += `M${x} ${y0 + 4}h4v${H - 4}h-4z`;
    tip += `M${x} ${y0}h4v4h-4z`;
    clip += `<rect x="${x}" y="${y0}" width="4" height="${H}"/>`;
    let kf = '';
    steps.forEach((lv, i) => { kf += `${(100 * i) / steps.length}%{transform:translateY(${-lv * UNIT}px)}`; });
    kf += `100%{transform:translateY(${-steps[0] * UNIT}px)}`;
    css.push(`@keyframes eq${b}{${kf}}.eq${b}{transform:translateY(${-steps[1] * UNIT}px);animation:eq${b} ${s(steps.length * TICK)} steps(1,end) infinite}`);
    covers += `<rect class="eq${b}" x="${x}" y="${y0}" width="4" height="${H}" fill="#000"/>`;
  });
  defs.push(`<clipPath id="eqclip">${clip}</clipPath>`);
  layers.push(`<path class="c10" d="${lit}"/><path class="c14" d="${tip}"/><g clip-path="url(#eqclip)">${covers}</g>`);
}

// Conveyors and the machine's hazard tape. Sprites are tiny side-on block art at 2 px a pixel,
// drawn from character maps; the bottom row rests on the belt.
{
  const PX = 2;
  const INK = { W: WHT, L: LGR, D: DGR, Y: YEL, B: BRN };
  const SPRITES = {
    plate: [
      '.WWWWWWWWWWWWWW.', 'WLLLLLLLLLLLLLLD', 'WLDLLLLLLLLLLDLD', 'WLLLLLLLLLLLLLLD', 'WLLLLLLLLLLLLLLD',
      'WLLLLLLLLLLLLLLD', 'WLDLLLLLLLLLLDLD', 'WLLLLLLLLLLLLLLD', '.DDDDDDDDDDDDDD.',
    ],
    rod: ['.WWWWWW.', 'WLLLLLLD', '.LLLLLL.'],
    frame: [
      'YYYYYYYYYYYYYY', 'YBBBBBBBBBBBBY', 'YB..........BY', 'YB.YY....YY.BY', 'YB..YY..YY..BY', 'YB...YYYY...BY', 'YB....YY....BY',
      'YB...YYYY...BY', 'YB..YY..YY..BY', 'YB.YY....YY.BY', 'YB..........BY', 'YBBBBBBBBBBBBY', 'YYYYYYYYYYYYYY',
    ],
  };
  for (const [name, rows] of Object.entries(SPRITES)) {
    let g = '';
    for (const [ch, color] of Object.entries(INK)) {
      const d = bitmapPath(rows.map((row) => (x) => row[x] === ch), rows[0].length, PX, PX, 0, -rows.length * PX);
      if (d) g += `<path class="c${color}" d="${d}"/>`;
    }
    defs.push(`<g id="sp-${name}">${g}</g>`);
  }
  let legs = '', out = '', ports = '', feedBody = '', feedLid = '';
  const pitches = new Set([16]);
  const mTop = MACHINE.r * CH + 8, mBot = (MACHINE.r + MACHINE.h) * CH - 8; // casing between the tapes
  BELTS.forEach((b, i) => {
    const x0 = b.c0 * CW, x1 = (b.c1 + 1) * CW;
    // The belt carries on one cell into the machine, through its hatch.
    const cx0 = b.port === 'start' ? x0 - CW : x0, cx1 = b.port === 'end' ? x1 + CW : x1;
    const tall = SPRITES[b.sprite].length * PX;
    const py0 = Math.max(mTop, b.y - tall - 2), py1 = Math.min(mBot, b.y + 4);
    ports += `M${b.port === 'start' ? cx0 : x1} ${py0}h${CW}v${py1 - py0}h${-CW}z`;
    if (b.port === 'end') {
      const fy = b.y - tall - 4;
      feedBody += `M${x0} ${fy + 2}h${CW}v${b.y + 6 - fy}h${-CW}z`;
      feedLid += `M${x0 - 2} ${fy}h${CW + 4}v2h${-CW - 4}z`;
    }
    defs.push(`<clipPath id="belt${i}"><rect x="${cx0}" y="${b.y - 28}" width="${cx1 - cx0}" height="32"/></clipPath>`);
    for (let x = x0 + 6; x < x1 - 2; x += 32) legs += `M${x} ${b.y + 4}h4v4h-4z`;
    let tread = '';
    for (let x = cx0 - 16; x < cx1; x += 16) tread += `M${x} ${b.y}h12v4h-12z`;
    let items = '';
    for (let x = x0 - b.pitch; x < cx1; x += b.pitch) items += `<use href="#sp-${b.sprite}" x="${x + 4}" y="${b.y}"/>`;
    out += `<g clip-path="url(#belt${i})"><path class="c8 bm16" d="${tread}"/><g class="bm${b.pitch}">${items}</g></g>`;
    pitches.add(b.pitch);
  });
  for (const p of pitches) css.push(`@keyframes bm${p}{from{transform:translateX(0)}to{transform:translateX(${p}px)}}.bm${p}{animation:bm${p} ${s(p / BELT)} steps(${p / PX},end) infinite}`);
  // Hazard tape: 4 px diagonal stripes, yellow on black, along the top and bottom of the machine.
  defs.push(`<pattern id="hz" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#000"/><path class="c14" d="${bitmapPath(Array.from({ length: 8 }, (_, y) => (x) => (x + y) % 8 < 4), 8)}"/></pattern>`);
  const mx = MACHINE.c * CW, mw = MACHINE.w * CW, my = MACHINE.r * CH;
  layers.push(`<path class="c8" d="${legs}"/><path class="c0" d="${ports}"/>${out}<path class="c8" d="${feedBody}"/><path class="c7" d="${feedLid}"/>`
    + `<rect x="${mx}" y="${my}" width="${mw}" height="8" fill="url(#hz)"/><rect x="${mx}" y="${my + MACHINE.h * CH - 8}" width="${mw}" height="8" fill="url(#hz)"/>`);
}

// OBJECTIVES lightbar: the classic BBS menu highlight, stepping down the five phases as if
// someone were choosing one. It sits under the text; the phase number turns white on the bar.
{
  frames('lb', OBJ.n, OBJ.n * 1.5, true, INTRO.drawAt + (INTRO.drawDur * OBJ.r0) / (ROWS - 1));
  for (let k = 0; k < OBJ.n; k++) {
    const r = OBJ.r0 + 1 + k;
    under.push(`<rect class="c5 lb${k}" x="${(OBJ.c0 + 1) * CW}" y="${r * CH}" width="${(OBJ.c1 - OBJ.c0 - 1) * CW}" height="${CH}"/>`);
    layers.push(`<g class="c15 lb${k}">${uses(r, OBJ.c0 + 2, String(k + 1))}</g>`);
  }
}

// The Assembler's chevrons: dark ones stamped into the casing, a lit set running through them.
{
  const r = MACHINE.r + 2, cols = [0, 1, 2, 3, 4, 5].map((i) => MACHINE.c + 2 + i * 2);
  frames('ch', 3, TICK * 3, true);
  let out = `<g class="c0">${cols.map((c) => uses(r, c, '►')).join('')}</g>`;
  for (let k = 0; k < 3; k++) out += `<g class="c14 ch${k}">${cols.filter((_, i) => i % 3 === k).map((c) => uses(r, c, '►')).join('')}</g>`;
  layers.push(out);
}

// File transfer: three files in turn, a bar that fills in cells and a counter that ends on the
// real totals (140 items, 211 recipes, 477 buildings). With animation off, it rests on a
// finished RECIPES.DAT.
{
  const { r, cName, cBar, cCount, cStat, barW } = XFER;
  const files = [['ITEMS.DAT', 140], ['RECIPES.DAT', 211], ['BUILDING.DAT', 477]];
  const SLOT = 4, FILL = 3, STEPS = 12, T = SLOT * files.length;
  const BUSY = '14400 bps, no retries', DONE = 'CRC OK. back to work.';
  // The cycle starts as the intro uncovers this row. Delays are negative (mid-cycle starts), so
  // nothing here depends on fill modes.
  const START = INTRO.drawAt + (INTRO.drawDur * (r - 1)) / (ROWS - 1);
  const x = cBar * CW, y = r * CH, w = barW * CW;
  defs.push(`<clipPath id="xclip"><rect x="${x}" y="${y}" width="${w}" height="${CH}"/></clipPath>`);
  css.push(`@keyframes xc{0%{transform:translateX(0);animation-timing-function:steps(${barW},end)}${(100 * FILL) / SLOT}%{transform:translateX(${w}px)}100%{transform:translateX(${w}px)}}.xc{transform:translateX(${w}px);animation:xc ${s(SLOT)} ${s(START - SLOT)} infinite}`);
  layers.push(`<g clip-path="url(#xclip)"><g class="xc"><rect x="${x}" y="${y}" width="${w}" height="${CH}" fill="#000"/><g class="c8">${uses(r, cBar, '░'.repeat(barW))}</g></g></g>`);
  frames('xn', files.length, T, true);
  css.push(`${files.map((_, f) => `.xn${f}`).join(',')}{animation-delay:${s(START - T)}}`);
  const pct = (t) => +((100 * t) / T).toFixed(4);
  css.push(`@keyframes q{0%{opacity:1}${pct(FILL / STEPS)}%{opacity:0}100%{opacity:0}}@keyframes qh{0%{opacity:1}${pct(SLOT - FILL)}%{opacity:0}100%{opacity:0}}`
    + `.q,.qh{opacity:0;animation:q ${s(T)} steps(1,end) infinite}.qh{animation-name:qh}`);
  css.push(`@keyframes xa{0%{opacity:1}${(100 * FILL) / SLOT}%{opacity:0}100%{opacity:0}}@keyframes xb{0%{opacity:0}${(100 * FILL) / SLOT}%{opacity:1}100%{opacity:1}}`
    + `.xa,.xb{opacity:0;animation:xa ${s(SLOT)} steps(1,end) ${s(START - SLOT)} infinite}.xb{animation-name:xb}`);
  css.push(`@keyframes off{0%{opacity:0}100%{opacity:0}}.rest{animation:off 1s steps(1,end) infinite}`);
  const at = (t) => `style="animation-delay:${s(((t + START) % T) - T)}"`;
  let out = '';
  files.forEach(([name, total], f) => {
    out += `<g class="xn${f}"><g class="c15">${uses(r, cName, name)}</g><g class="c7">${uses(r, cCount + 3, `/${total}`)}</g></g>`;
    for (let k = 0; k < STEPS; k++) {
      out += `<g class="c15 q" ${at(f * SLOT + (k * FILL) / STEPS)}>${uses(r, cCount, String(Math.floor((total * k) / STEPS)).padStart(3))}</g>`;
    }
    out += `<g class="c15 qh" ${at(f * SLOT + FILL)}>${uses(r, cCount, String(total))}</g>`;
  });
  out += `<g class="c7 xa">${uses(r, cStat, BUSY)}</g><g class="c10 xb">${uses(r, cStat, DONE)}</g>`;
  out += `<g class="rest"><g class="c15">${uses(r, cName, files[1][0])}${uses(r, cCount, String(files[1][1]))}</g><g class="c7">${uses(r, cCount + 3, `/${files[1][1]}`)}</g><g class="c10">${uses(r, cStat, DONE)}</g></g>`;
  layers.push(out);
}

// PRESS ANY KEY blinks (1.5 s on, 0.5 s off: 0.5 Hz, nowhere near flash territory).
css.push(`@keyframes bl{0%{opacity:1}75%{opacity:0}100%{opacity:0}}.bl{animation:bl 2s steps(1,end) infinite}`);
layers.push(`<g class="c15 bl">${uses(R.prompt, PROMPT_C + len(PROMPT.lead), PROMPT.word)}</g>`);

// Status bar spinner.
frames('sp', 4, TICK * 4);
layers.push(['|', '/', '─', '\\'].map((ch, k) => `<g class="c14 sp${k}">${uses(R.status, SPIN_C, ch)}</g>`).join(''));

// Sysop scroller: white text through a fixed palette gradient mask, 1 px per step. The gradient
// runs through the three tab colours: purple, pink, (white), cyan, blue.
{
  const text = '     ♪ WELCOME TO THE CLOGGED MERGER BBS, PIONEER. YOU ARE CALLER #0140 AND IT IS 3 A.M. AGAIN ♪ '
    + 'ULTRA-SATISFACTORY: EVERY RECIPE, BUILDING AND SPACE ELEVATOR OBJECTIVE, ONE CLICK APART ♪ '
    + 'ON SHIFT TONIGHT: ASSEMBLER, BLENDER, CONSTRUCTOR, FOUNDRY, MANUFACTURER, PACKAGER, PARTICLE ACCELERATOR, REFINERY AND SMELTER ♪ '
    + '211 RECIPES, 88 OF THEM ALTERNATES, FOR WHEN A FACTORY THAT WORKS IS NOT ENOUGH ♪ '
    + 'PROTECTION: NONE, IT\'S APACHE 2.0 ♪ UNOFFICIAL FAN PROJECT, NOT AFFILIATED WITH COFFEE STAIN STUDIOS ♪ '
    + 'MANAGEMENT REMINDS YOU THAT SPAGHETTI IS A LAYOUT, NOT A FAILURE ♪ JUST ONE MORE BELT, THEN BED ♪ +++ATH0 (YOU WON\'T) ♪';
  const n = len(text);
  const Wtxt = n * CW;
  const r = R.scroll, x0 = CW, x1 = SW - CW;
  const speed = 64; // px per second
  const dur = Wtxt / speed;
  const stops = [[0, MAG], [0.1, LMG], [0.32, WHT], [0.68, LCY], [0.9, LBL]];
  let g = '';
  stops.forEach(([o, c], i) => {
    const end = i + 1 < stops.length ? stops[i + 1][0] : 1;
    g += `<stop offset="${o}" stop-color="${PAL[c]}"/><stop offset="${end}" stop-color="${PAL[c]}"/>`;
  });
  defs.push(`<linearGradient id="scg" gradientUnits="userSpaceOnUse" x1="${x0}" x2="${x1}" y1="0" y2="0">${g}</linearGradient>`);
  defs.push(`<mask id="scm" maskUnits="userSpaceOnUse" x="${x0}" y="${r * CH}" width="${x1 - x0}" height="${CH}"><g class="sc" fill="#FFF"><g id="scr">${uses(r, 1, text)}</g><use href="#scr" x="${Wtxt}"/></g></mask>`);
  css.push(`@keyframes sc{from{transform:translateX(0)}to{transform:translateX(${-Wtxt}px)}}.sc{animation:sc ${s(dur)} steps(${Wtxt},end) infinite}`);
  layers.push(`<rect x="${x0}" y="${r * CH}" width="${x1 - x0}" height="${CH}" fill="url(#scg)" mask="url(#scm)"/>`);
}

// ---------------------------------------------------------------------------------------------
// One-off intro: the modem dials, CONNECT, then the screen arrives at 14400 baud, row by row.
// Runs once (fill-mode both), so there is no loop point. Hidden entirely for reduced motion.
// ---------------------------------------------------------------------------------------------
{
  const typed = len(DIAL);
  const drawRows = ROWS - 1;
  const rowDur = INTRO.drawDur / drawRows;
  css.push(`@keyframes ty{from{transform:translateX(0)}to{transform:translateX(${typed * CW}px)}}.ty{animation:ty ${s(INTRO.typeDur)} steps(${typed},end) ${s(INTRO.typeAt)} both}`);
  css.push(`@keyframes gone{from{opacity:1}to{opacity:0}}.gone{animation:gone 1ms ${s(INTRO.connectAt)} both}`);
  css.push(`@keyframes ra{from{transform:translateY(${2 * CH}px)}to{transform:translateY(${(2 + drawRows) * CH}px)}}.ra{animation:ra ${s(INTRO.drawDur)} steps(${drawRows},end) ${s(INTRO.drawAt)} both}`);
  css.push(`@keyframes rb{from{transform:translateY(${CH}px)}to{transform:translateY(${(1 + drawRows) * CH}px)}}.rb{animation:rb ${s(INTRO.drawDur)} steps(${drawRows},end) ${s(INTRO.drawAt)} both}`);
  css.push(`@keyframes sw{from{transform:translateX(0)}to{transform:translateX(${SW}px)}}.sw{animation:sw ${s(rowDur)} steps(10,end) ${s(INTRO.drawAt)} ${drawRows} both}`);
  css.push(`@keyframes cb{0%{opacity:1}50%{opacity:0}100%{opacity:0}}.cb{animation:cb .5s steps(1,end) infinite}`);
  css.push(`@keyframes show{from{opacity:0}to{opacity:1}}.show{animation:show 1ms ${s(INTRO.drawAt)} both}`);
  // Resting (un-animated) state = the finished screen, so a renderer that skips CSS animation
  // shows the full BBS screen instead of a black panel. fill-mode `both` supplies the intro's
  // covering state during the delays, so animated viewers see exactly the same intro.
  css.push(`.gone{opacity:0}.ra{transform:translateY(${(2 + drawRows) * CH}px)}.rb{transform:translateY(${(1 + drawRows) * CH}px)}.sw{transform:translateX(${SW}px)}`);
  layers.push(`<g class="intro" clip-path="url(#screen)">`
    + `<g class="gone"><g class="ty"><rect width="${SW}" height="${CH}" fill="#000"/><rect class="cb" y="12" width="8" height="3" fill="${PAL[LGR]}"/></g></g>`
    + `<g class="ra"><rect width="${SW}" height="${SH}" fill="#000"/></g>`
    + `<g class="rb"><g class="sw"><rect width="${SW}" height="${CH}" fill="#000"/><rect class="show" y="12" width="8" height="3" fill="${PAL[LGR]}"/></g></g>`
    + `</g>`);
}
defs.push(`<clipPath id="screen"><rect width="${SW}" height="${SH}"/></clipPath>`);

css.push(`@media (prefers-reduced-motion:reduce){*{animation:none!important}.intro,.sh{display:none}}`);

// ---------------------------------------------------------------------------------------------
// Emit the static text layer
// ---------------------------------------------------------------------------------------------
const RUNNABLE = new Set(['─', '═', '▀', '▄', '█']);
const staticUses = new Map(); // fg -> string
const staticRuns = new Map(); // fg -> path d
for (let r = 0; r < ROWS; r++) {
  for (let c = 0; c < COLS;) {
    const cell = grid[r][c];
    if (!cell) { c++; continue; }
    if (RUNNABLE.has(cell.ch)) {
      let n = 1;
      while (c + n < COLS && grid[r][c + n] && grid[r][c + n].ch === cell.ch && grid[r][c + n].fg === cell.fg) n++;
      const g = FONT.get(cell.ch);
      const d = bitmapPath(g.map((v) => (x) => (v >> (7 - (x % 8))) & 1), 8 * n, 1, 1, c * CW, r * CH);
      staticRuns.set(cell.fg, (staticRuns.get(cell.fg) || '') + d);
      c += n;
    } else {
      staticUses.set(cell.fg, (staticUses.get(cell.fg) || '') + `<use href="#${gid(cell.ch)}" x="${c * CW}" y="${r * CH}"/>`);
      c++;
    }
  }
}
let staticLayer = '';
for (const { r, c, n, color } of bgRuns) staticLayer += `<rect class="c${color}" x="${c * CW}" y="${r * CH}" width="${n * CW}" height="${CH}"/>`;
for (const [fg, d] of staticRuns) staticLayer += `<path class="c${fg}" d="${d}"/>`;
for (const [fg, u] of staticUses) staticLayer += `<g class="c${fg}">${u}</g>`;

// Glyph definitions (after everything has asked for its ids).
const glyphDefs = [...glyphIds].map(([ch, id]) => `<path id="${id}" d="${glyphPath(FONT.get(ch))}"/>`).join('');

const TITLE = 'ULTRA-SATISFACTORY: an ANSI BBS login screen for a factory floor';
const DESC = 'A modem dials in and a 1990s ANSI screen draws itself: a big cyan and white ULTRA SATISFACTORY logo beside a hexagon-and-cog emblem, '
  + 'the ident of THE CLOGGED MERGER BBS (sysop Belt Daddy, caller Pioneer #0140, 3 A.M.), and three panels in the app\'s tab colours. '
  + 'ITEMS is a recipe card drawn as a production line: 3 Reinforced Iron Plate and 12 Iron Rod ride conveyors into an Assembler (60 s, 15 MW) and 2 Modular Frame ride out. '
  + 'OBJECTIVES lists the five Space Elevator phases as a rave line-up. BUILDINGS is the shift roster of nine production machines. '
  + 'Below: a file transfer counting up to 140 items, 211 recipes and 477 buildings, a blinking PRESS ANY KEY, a scroller, '
  + 'and a status bar with the run command and the live URL.';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VBW} ${VBH}" width="${VBW}" height="${VBH}" shape-rendering="crispEdges" role="img" aria-labelledby="t d">
<title id="t">${TITLE}</title>
<desc id="d">${DESC}</desc>
<style>${css.join('\n')}</style>
<defs>${glyphDefs}${defs.join('')}</defs>
<rect x=".5" y=".5" width="${VBW - 1}" height="${VBH - 1}" rx="10" fill="#000" stroke="#3a3a4a"/>
<g transform="translate(${PAD} ${PAD})">
${under.join('')}
${staticLayer}
${layers.join('\n')}
</g>
</svg>
`;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, svg);
console.log(`wrote ${path.relative(process.cwd(), OUT)} (${(svg.length / 1024).toFixed(1)} KB, ${glyphIds.size} glyphs)`);
