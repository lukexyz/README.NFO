#!/usr/bin/env node
// DANCE VISION 87.87 FM: an ANSI BBS login screen crossed with a pirate radio rave flyer.
//
// Regenerate:  node examples/dance-vision/src/06-ansi-bbs-pirate-fm_opus_5.5.mjs
//
// Plain Node, no dependencies, fully deterministic (seeded PRNG). Everything is drawn on a
// 100 x 30 grid of 8 x 16 cells, like a DOS text screen, using a CP437-style bitmap font
// defined below. Text is <use> references to glyph paths, never <text>, so it looks the same
// for every viewer. Animation is CSS only, so prefers-reduced-motion can switch it all off.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '06-ansi-bbs-pirate-fm_opus_5.5';
const OUT = path.join(HERE, '..', 'assets', `${SLUG}.svg`);

// ---------------------------------------------------------------------------------------------
// Screen geometry and timing
// ---------------------------------------------------------------------------------------------
const COLS = 100, ROWS = 30, CW = 8, CH = 16, PAD = 16;
const SW = COLS * CW, SH = ROWS * CH;
const VBW = SW + PAD * 2, VBH = SH + PAD * 2;

const BPM = 128;
const BEAT = 60 / BPM;          // 0.46875 s
const BAR = BEAT * 4;           // 1.875 s
const LOOP = BAR * 2;           // 3.75 s: the VU meter pattern
const s = (t) => `${+t.toFixed(5)}s`;

// The 16-colour DOS/ANSI palette.
const PAL = ['#000000', '#0000AA', '#00AA00', '#00AAAA', '#AA0000', '#AA00AA', '#AA5500', '#AAAAAA',
  '#555555', '#5555FF', '#55FF55', '#55FFFF', '#FF5555', '#FF55FF', '#FFFF55', '#FFFFFF'];
const [BLK, BLU, GRN, CYN, RED, MAG, BRN, LGR, DGR, LBL, LGN, LCY, LRD, LMG, YEL, WHT] = PAL.map((_, i) => i);

// Seeded PRNG (mulberry32) so the VU meter is identical on every run.
function prng(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

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
// A row of coloured segments: put(r, c, [[text, fg], ...])
function seg(r, c, parts) { for (const [t, fg] of parts) c = put(r, c, t, fg); return c; }
function bg(r, c, n, color) { bgRuns.push({ r, c, n, color }); }
const centre = (n) => Math.floor((COLS - n) / 2);
function leader(label, value, width, dot = '·') {
  const n = width - len(label) - len(value) - 2;
  if (n < 1) throw new Error(`leader too long: ${label} ${value}`);
  return [label + ' ', dot.repeat(n), ' ' + value];
}

// Row 0: the modem line.
put(0, 0, 'ATDT 020 7946 0878', LGR);
put(0, 20, 'CONNECT 14400/ARQ/V42BIS', WHT);
put(0, 82, '87.87 MHz', LCY);

// Row 7: the flyer tagline.
{
  const parts = [['░▒▓█ ', LBL], ['THE PIRATE MOTION-CAPTURE SOUND SYSTEM', YEL], [' ░ ', DGR], ['87.87 FM', LMG], [' ░ ', DGR], ['EAST LONDON', LCY], [' █▓▒░', LBL]];
  const n = parts.reduce((a, [t]) => a + len(t), 0);
  seg(7, centre(n), parts);
}

// Rows 9-14: phone -> relay -> TV.
const PHONE = { c: 2, r: 9 };
put(9, 2, '┌─ ', LGR); put(9, 5, 'PHONE', WHT); put(9, 10, ' ─┐', LGR);
for (let r = 10; r <= 13; r++) { put(r, 2, '│', LGR); put(r, 12, '│', LGR); }
put(13, 4, 'pose ML', CYN);
put(14, 2, '└─────────┘', LGR);

const ARROWS = [{ c0: 14, c1: 32, r: 11 }, { c0: 47, c1: 61, r: 11 }];
for (const a of ARROWS) { put(a.r, a.c0, '·'.repeat(a.c1 - a.c0 + 1), DGR); put(a.r, a.c1 + 1, '►', LCY); }
seg(10, 14, [['33 joints ', WHT], ['× {x,y,z}', LGR]]);
put(12, 15, 'no video. ever.', LGN);
// The relay is the pirate rig on the tower block roof: a mast (drawn below) rises from the ┴.
const MAST_C = 40;
put(10, 35, '┌────┴────┐', LGR);
put(11, 35, '│', LGR); put(11, 37, 'ws', LGR); put(11, 40, ':8787', YEL); put(11, 45, '│', LGR);
put(12, 35, '└─ ', LGR); put(12, 38, 'RELAY', WHT); put(12, 43, ' ─┘', LGR);
put(10, 47, '~1.6 KB a frame', LGR);
put(12, 47, 'up to 6 phones', LGR);

const TV = { c0: 63, c1: 97, r0: 9, r1: 14 };
put(9, TV.c0, '╔' + '═'.repeat(TV.c1 - TV.c0 - 1) + '╗', LBL);
for (let r = 10; r <= 13; r++) { put(r, TV.c0, '║', LBL); put(r, TV.c1, '║', LBL); }
{
  const title = '[ TV · STUDIO · three.js ]';
  const c = seg(14, TV.c0, [['╚═', LBL], ['[ ', LBL], ['TV', WHT], [' · ', DGR], ['STUDIO', WHT], [' · ', DGR], ['three.js', LCY], [' ]', LBL]]);
  put(14, c, '═'.repeat(TV.c1 - c) + '╝', LBL);
  if (c - TV.c0 !== 2 + len(title)) throw new Error('tv title');
}
const DANCER_COLS = [67, 73, 79, 85, 91];

// Rows 16-25: caller panel (left) and line-up flyer (right).
{
  const c0 = 1, c1 = 44, r0 = 16, r1 = 25, w = c1 - c0 - 3;
  const title = ' CALLER #8787 ';
  put(r0, c0, '┌─', CYN); put(r0, c0 + 2, title, BLK); bg(r0, c0 + 2, len(title), CYN);
  put(r0, c0 + 2 + len(title), '─'.repeat(c1 - c0 - 2 - len(title)) + '┐', CYN);
  for (let r = r0 + 1; r < r1; r++) { put(r, c0, '│', CYN); put(r, c1, '│', CYN); }
  put(r1, c0, '└' + '─'.repeat(c1 - c0 - 1) + '┘', CYN);
  const x = c0 + 2;
  // BBS-style fields: "Label ····· value", values all starting on the same column.
  const field = (label) => [[label + ' ', LGR], ['·'.repeat(10 - len(label)), DGR], [' ', 0]];
  const row = (r, label, ...value) => { const end = seg(r, x, [...field(label), ...value]); if (end > x + w) throw new Error(`caller row ${r} too long`); };
  seg(r0 + 1, x, [['Node 1', WHT], [' · ', DGR], ['Dalston', YEL], [' ', 0], ['·'.repeat(w - 30), DGR], [' caller ', LGR], ['#8787', YEL]]);
  row(r0 + 2, 'Line', ['websocket relay, port 8787', WHT]);
  row(r0 + 3, 'Uplink', ['33 joints', WHT], [' · ', DGR], ['~1.6 KB a frame', WHT]);
  row(r0 + 4, 'Video', ['NONE.', LGN], [' never leaves the phone', WHT]);
  row(r0 + 5, 'App', ['none', WHT], ['   Account ', LGR], ['····', DGR], [' none', WHT]);
  row(r0 + 6, 'Protection', ['none', WHT], ['   Phones ', LGR], ['·····', DGR], [' 6 a room', WHT]);
  row(r0 + 7, 'Time left', ['all night', YEL]);
  seg(r0 + 8, x, [['Last caller: ', LGR], ['your nan. did the robot.', LMG]]);
}
{
  const c0 = 47, c1 = 98, r0 = 16, r1 = 25, w = c1 - c0 - 3;
  const title = ' TONITE ON 87.87 FM ';
  put(r0, c0, '╔═', MAG); put(r0, c0 + 2, title, WHT); bg(r0, c0 + 2, len(title), MAG);
  put(r0, c0 + 2 + len(title), '═'.repeat(c1 - c0 - 2 - len(title)) + '╗', MAG);
  for (let r = r0 + 1; r < r1; r++) { put(r, c0, '║', MAG); put(r, c1, '║', MAG); }
  put(r1, c0, '╚' + '═'.repeat(c1 - c0 - 1) + '╝', MAG);
  const x = c0 + 2;
  seg(r0 + 1, x, [['MC POSE MODEL', YEL], [' b2b ', LGR], ['DJ 33 JOINTS', YEL], [' at 33 rpm', LGR]]);
  seg(r0 + 2, x, [['+ ', DGR], ['DJ THREE.JS', LCY], [' on visuals · ', LGR], ['spotlights all night', WHT]]);
  const rooms = [
    ['BIG SCREEN ENERGY', 'Hackney Wick'],
    ['MAIN CHARACTER SYNDROME', 'Shoreditch roof'],
    ['GENTRIFRIED CHICKEN', 'Dalston, 3am'],
    ['MIND THE GYRATE', 'Night Tube'],
    ['OUR LADY OF PERPETUAL SQUATS', 'Hackney'],
    ['HOSTILE TWERKOVER', 'Canary Wharf'],
  ];
  rooms.forEach(([name, place], i) => {
    const [a, b, v] = leader(name, place, w - 2);
    seg(r0 + 3 + i, x, [[`${i + 1} `, LMG], [a, LCY], [b, DGR], [v, LGR]]);
  });
}

// Row 27: the prompt (the blinking part is animated below), row 29: terminal status bar.
const PROMPT = { lead: '▓▒░ ', word: 'PRESS ANY KEY', tail: ' ░▒▓', aside: '  (it\'s a README. nothing will happen.)' };
const promptLen = len(PROMPT.lead + PROMPT.word + PROMPT.tail + PROMPT.aside);
const PROMPT_C = centre(promptLen);
put(27, PROMPT_C, PROMPT.lead, LBL);
put(27, PROMPT_C + len(PROMPT.lead) + len(PROMPT.word), PROMPT.tail, LBL);
put(27, PROMPT_C + len(PROMPT.lead + PROMPT.word + PROMPT.tail), PROMPT.aside, DGR);

bg(29, 0, COLS, BLU);
const statusEnd = seg(29, 0, [
  [' ALT-Z HELP ', WHT], ['│', LCY], [' ANSI ', WHT], ['│', LCY], [' 14400 N81 FDX ', WHT], ['│', LCY],
  [' QUICK START: ', YEL], ['npm run party', WHT], [' → ', LCY], ['http://127.0.0.1:8787/', WHT], [' ', 0], ['│', LCY], [' ONLINE ', LGN],
]);
const SPIN_C = statusEnd;

// ---------------------------------------------------------------------------------------------
// The logo: "DANCE VISION" as chunky ANSI letters on an 8x8 half-block grid (10 px tall),
// filled with CP437 shade ramps and a dithered drop shadow.
// ---------------------------------------------------------------------------------------------
const LOGO = {
  D: ['#######.', '########', '##....##', '##....##', '##....##', '##....##', '##....##', '##....##', '########', '#######.'],
  A: ['.######.', '########', '##....##', '##....##', '########', '########', '##....##', '##....##', '##....##', '##....##'],
  N: ['###...##', '###...##', '####..##', '####..##', '##.##.##', '##.##.##', '##..####', '##..####', '##...###', '##...###'],
  C: ['.#######', '########', '##......', '##......', '##......', '##......', '##......', '##......', '########', '.#######'],
  E: ['#######', '#######', '##.....', '##.....', '######.', '######.', '##.....', '##.....', '#######', '#######'],
  V: ['##....##', '##....##', '##....##', '##....##', '##....##', '###..###', '.##..##.', '.######.', '..####..', '...##...'],
  I: ['##', '##', '##', '##', '##', '##', '##', '##', '##', '##'],
  S: ['.#######', '########', '##......', '##......', '#######.', '.#######', '......##', '......##', '########', '#######.'],
  O: ['.######.', '########', '##....##', '##....##', '##....##', '##....##', '##....##', '##....##', '########', '.######.'],
};
const LP = 8;          // logo pixel size
const LH = 10;         // logo height in logo pixels
function wordBitmap(word) {
  const cols = [];
  [...word].forEach((ch, i) => {
    if (i) cols.push(0);
    const L = LOGO[ch];
    for (let x = 0; x < L[0].length; x++) cols.push(L.map((row) => row[x] === '#'));
  });
  return cols; // cols[x][y]
}
const wordD = wordBitmap('DANCE'), wordV = wordBitmap('VISION');
const LOGO_W = wordD.length + 3 + wordV.length;
const LOGO_X = Math.round((SW - (LOGO_W + 1) * LP) / 2 / CW) * CW; // grid aligned, shadow included
const LOGO_Y = 1 * CH;
const colsPath = (cols, ox) => bitmapPath(Array.from({ length: LH }, (_, y) => (x) => cols[x] && cols[x][y]), cols.length, LP, LP, ox * LP, 0);
const pathD = colsPath(wordD, 0), pathV = colsPath(wordV, wordD.length + 3);

// Ramps per logo row: [colour, shade] where shade is full, or a CP437 shade pattern.
const SHADES = { '▓': ['##.#', '.###'], '▒': ['#.#.', '.#.#'], '░': ['..#.', '#...'] };
const RAMP_D = [[WHT], [LMG], [LMG], [LMG], [LMG], [MAG], [MAG], [MAG, '▓'], [MAG, '▓'], [MAG, '▒']];
const RAMP_V = [[WHT], [LCY], [LCY], [LCY], [LCY], [CYN], [CYN], [CYN, '▓'], [CYN, '▓'], [CYN, '▒']];
function rampPattern(id, ramp) {
  let d = '';
  const byColor = new Map();
  ramp.forEach(([color, shade], i) => {
    let p = byColor.get(color) || '';
    if (!shade) p += `M0 ${i * LP}h4v${LP}h-4z`;
    else {
      const pat = SHADES[shade];
      p += bitmapPath(Array.from({ length: LP }, (_, y) => (x) => pat[y % 2][x] === '#'), 4, 1, 1, 0, i * LP);
    }
    byColor.set(color, p);
  });
  for (const [color, p] of byColor) d += `<path d="${p}" fill="${PAL[color]}"/>`;
  return `<pattern id="${id}" width="4" height="${LH * LP}" patternUnits="userSpaceOnUse">${d}</pattern>`;
}
function shadePattern(id, shade, color) {
  const pat = SHADES[shade];
  return `<pattern id="${id}" width="4" height="2" patternUnits="userSpaceOnUse"><path d="${bitmapPath(pat.map((row) => (x) => row[x] === '#'), 4)}" fill="${PAL[color]}"/></pattern>`;
}

// ---------------------------------------------------------------------------------------------
// Animated pieces
// ---------------------------------------------------------------------------------------------
const css = [];
const layers = [];
const defs = [];

// Colour classes.
css.push(PAL.map((c, i) => `.c${i}{fill:${c}}`).join(''));

// 4-step frame visibility (reused for dance frames and the spinner) and 5-step spotlight.
const stepKeys = (name, n, k) => {
  const a = (100 * k) / n, b = (100 * (k + 1)) / n;
  const parts = [];
  parts.push(`0%{opacity:${k === 0 ? 1 : 0}}`);
  if (k > 0) parts.push(`${+a.toFixed(3)}%{opacity:1}`);
  if (k < n - 1) parts.push(`${+b.toFixed(3)}%{opacity:0}`);
  parts.push(`100%{opacity:${k === n - 1 ? 1 : 0}}`);
  return `@keyframes ${name}${k}{${parts.join('')}}`;
};
for (let k = 0; k < 4; k++) css.push(stepKeys('k', 4, k));
for (let k = 0; k < 5; k++) css.push(stepKeys('s', 5, k));
css.push(`.f1,.f2,.f3,.p1,.p2,.p3,.s1,.s2,.s3,.s4{opacity:0}`);
css.push([0, 1, 2, 3].map((k) => `.f${k}{animation:k${k} ${s(BAR)} steps(1,end) infinite}`).join(''));
css.push([0, 1, 2, 3].map((k) => `.p${k}{animation:k${k} ${s(BEAT)} steps(1,end) infinite}`).join(''));
css.push([0, 1, 2, 3, 4].map((k) => `.s${k}{animation:s${k} ${s(BAR * 10)} steps(1,end) infinite}`).join(''));

// VU meters flanking the logo: 4 bars per side, 10 LED segments, 16th-note steps at 128 BPM.
{
  const STEPS = 32;
  const bands = [
    [10, 7, 6, 5], // kick
    [9, 7, 8, 6],  // bass
    [5, 4, 8, 4],  // snare-ish, pushed on 2 and 4 below
    [4, 7, 5, 8],  // hats
  ];
  const leftCols = [4, 3, 2, 1], rightCols = [95, 96, 97, 98];
  const segs = [];
  const covers = [];
  const segColor = (i) => (i < 6 ? LGN : i < 8 ? YEL : LRD);
  const bars = [...leftCols.map((c, b) => ({ c, b, seed: 87 + b })), ...rightCols.map((c, b) => ({ c, b, seed: 8787 + b }))];
  const vuClip = [];
  bars.forEach(({ c, b, seed }, idx) => {
    const rnd = prng(seed);
    const levels = [];
    for (let st = 0; st < STEPS; st++) {
      let v = bands[b][st % 4];
      if (b === 2 && st % 8 === 4) v += 2;
      if (b === 0 && st % 16 === 14) v += 2;
      v += Math.round((rnd() - 0.5) * 3);
      levels.push(Math.max(2, Math.min(10, v)));
    }
    const x = c * CW;
    for (let i = 0; i < 10; i++) segs.push({ x, y: LOGO_Y + 80 - 8 * (i + 1) + 1, color: segColor(i) });
    let kf = '';
    let prev = null;
    levels.forEach((lv, st) => {
      if (lv !== prev) kf += `${+((100 * st) / STEPS).toFixed(3)}%{transform:translateY(${-lv * 8}px)}`;
      prev = lv;
    });
    kf += `100%{transform:translateY(${-levels[0] * 8}px)}`;
    css.push(`@keyframes v${idx}{${kf}}.v${idx}{transform:translateY(${-levels[3] * 8}px);animation:v${idx} ${s(LOOP)} steps(1,end) infinite}`);
    covers.push(`<g transform="translate(${x} ${LOGO_Y})"><rect class="v${idx}" width="6" height="80" fill="url(#unlit)"/></g>`);
    vuClip.push(`<rect x="${x}" y="${LOGO_Y}" width="6" height="80"/>`);
  });
  defs.push(`<pattern id="unlit" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#000"/><rect y="1" width="6" height="6" fill="#1c1c3a"/></pattern>`);
  defs.push(`<clipPath id="vuclip">${vuClip.join('')}</clipPath>`);
  const byColor = new Map();
  for (const sg of segs) byColor.set(sg.color, (byColor.get(sg.color) || '') + `M${sg.x} ${sg.y}h6v6h-6z`);
  let out = '';
  for (const [color, d] of byColor) out += `<path class="c${color}" d="${d}"/>`;
  layers.push(`<g clip-path="url(#vuclip)">${out}${covers.join('')}</g>`);
}

// Logo: shadow, fills, split line and a shine that sweeps through every two loops.
{
  defs.push(`<path id="lgD" d="${pathD}"/><path id="lgV" d="${pathV}"/>`);
  defs.push(rampPattern('rampD', RAMP_D), rampPattern('rampV', RAMP_V), shadePattern('shadow', '▒', BLU));
  defs.push(`<clipPath id="lgclip"><use href="#lgD"/><use href="#lgV"/></clipPath>`);
  let shine = '';
  for (let y = 0; y < LH; y++) shine += `M${-Math.floor(y / 2) * LP} ${y * LP}h${2 * LP}v${LP}h${-2 * LP}z`;
  const sweep = LOGO_W * LP + 64;
  css.push(`@keyframes sh{0%{transform:translateX(-24px);animation-timing-function:steps(${Math.round(sweep / 8)},end)}22%{transform:translateX(${sweep - 24}px)}100%{transform:translateX(${sweep - 24}px)}}.sh{transform:translateX(-24px);animation:sh ${s(LOOP * 2)} 2s infinite}`);
  layers.push(`<g transform="translate(${LOGO_X} ${LOGO_Y})">`
    + `<use href="#lgD" x="${LP}" y="${LP}" fill="url(#shadow)"/><use href="#lgV" x="${LP}" y="${LP}" fill="url(#shadow)"/>`
    + `<use href="#lgD" fill="url(#rampD)"/><use href="#lgV" fill="url(#rampV)"/>`
    + `<g clip-path="url(#lgclip)"><g class="sh"><path d="${shine}" fill="#FFF" opacity=".7"/></g></g>`
    + `<rect y="${5 * LP - 1}" width="${LOGO_W * LP + LP}" height="2" fill="#000"/>`
    + `</g>`);
}

// ON AIR light (row 0) pulses once a bar.
css.push(`@keyframes air{0%{opacity:1}50%{opacity:.3}100%{opacity:.3}}.air{animation:air ${s(BAR)} steps(1,end) infinite}`);
layers.push(`<g class="c12 air">${uses(0, 92, '■ ON AIR')}</g>`);

// Dancers: "you" on the phone and on the telly, plus four of the crew. One frame per beat.
const MOVES = {
  UP: ['\\o/', ' | ', '/ \\'],
  DOWN: [' o ', '/|\\', '/ \\'],
  RIGHT: [' o/', '/| ', '/ \\'],
  LEFT: ['\\o ', ' |\\', '/ \\'],
  FLEX: ['_o_', ' | ', '/ \\'],
  HIPS: [' o ', '<|>', '/ \\'],
  KICK: [' o ', '/|\\', '/ >'],
  WIDE: ['\\o/', ' | ', '| |'],
};
const CREW = [
  { col: DANCER_COLS[0], color: YEL, seq: ['UP', 'RIGHT', 'UP', 'LEFT'] },   // you
  { col: DANCER_COLS[1], color: LMG, seq: ['RIGHT', 'LEFT', 'RIGHT', 'LEFT'] },
  { col: DANCER_COLS[2], color: LCY, seq: ['FLEX', 'DOWN', 'FLEX', 'HIPS'] },
  { col: DANCER_COLS[3], color: LGN, seq: ['DOWN', 'UP', 'HIPS', 'WIDE'] },
  { col: DANCER_COLS[4], color: LRD, seq: ['LEFT', 'KICK', 'RIGHT', 'FLEX'] },
];
function figure(col, row, seq, color) {
  let out = '';
  seq.forEach((m, k) => {
    const f = MOVES[m];
    out += `<g class="c${color} f${k}">${f.map((line, i) => uses(row + i, col, line)).join('')}</g>`;
  });
  return out;
}
// Disco floor: two alternating tile layers, swapping on every beat.
{
  const x = (TV.c0 + 1) * CW, y = 13 * CH, w = (TV.c1 - TV.c0 - 1) * CW;
  defs.push(`<pattern id="flA" width="16" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="${PAL[MAG]}"/><rect x="8" width="8" height="8" fill="${PAL[BLU]}"/></pattern>`);
  defs.push(`<pattern id="flB" width="16" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="${PAL[BLU]}"/><rect x="8" width="8" height="8" fill="${PAL[CYN]}"/></pattern>`);
  css.push(`@keyframes fl{0%{opacity:0}50%{opacity:1}100%{opacity:1}}.fl{opacity:0;animation:fl ${s(BEAT * 2)} steps(1,end) infinite}`);
  layers.push(`<rect x="${x}" y="${y}" width="${w}" height="8" fill="url(#flA)"/><rect class="fl" x="${x}" y="${y}" width="${w}" height="8" fill="url(#flB)"/>`);
}

// Spotlight moment: a light hops along the TV's top border, "you" first, one dancer per
// 2 bars, with a dithered beam (CP437 ░ in yellow) falling on whoever has the camera.
{
  defs.push(shadePattern('beam', '░', BRN));
  let beams = '', marks = '';
  DANCER_COLS.forEach((c, k) => {
    const y = 10 * CH;
    const beam = `M${c * CW} ${y}h${3 * CW}v${CH}h${-3 * CW}z`
      + `M${(c - 1) * CW} ${y + CH}h${5 * CW}v${2 * CH}h${-5 * CW}z`;
    // A lit pool on the dance floor under whoever has the spotlight.
    const pool = `M${(c - 1) * CW} ${13 * CH}h${5 * CW}v8h${-5 * CW}z`;
    beams += `<g class="s${k}"><path d="${beam}" fill="url(#beam)"/><path class="c14" d="${pool}"/><path class="c15" d="M${(c + 1) * CW} ${13 * CH}h${CW}v8h${-CW}z"/></g>`;
    marks += `<g class="s${k}"><rect x="${(c + 1) * CW}" y="${9 * CH}" width="${CW}" height="${CH}" fill="#000"/><g class="c14">${uses(9, c + 1, '▼')}</g></g>`;
  });
  layers.push(beams);
  let out = figure(6, 10, CREW[0].seq, YEL);
  for (const d of CREW) out += figure(d.col, 10, d.seq, d.color);
  layers.push(out, marks);
}

// Packets: joints flowing phone -> relay -> TV, one cell per 16th note.
{
  let clip = '';
  let out = '';
  ARROWS.forEach((a, i) => {
    const x0 = a.c0 * CW, x1 = (a.c1 + 1) * CW;
    clip += `<rect x="${x0}" y="${a.r * CH}" width="${x1 - x0}" height="${CH}"/>`;
    let pk = '';
    for (let c = a.c0 - 4 + (i ? 2 : 0); c <= a.c1; c += 4) pk += uses(a.r, c, '■');
    out += `<g class="c11 pk">${pk}</g>`;
  });
  defs.push(`<clipPath id="pkclip">${clip}</clipPath>`);
  css.push(`@keyframes pk{from{transform:translateX(0)}to{transform:translateX(32px)}}.pk{animation:pk ${s(BEAT)} steps(4,end) infinite}`);
  layers.push(`<g clip-path="url(#pkclip)">${out}</g>`);
}

// Pirate radio mast on the relay: a little lattice pylon with a red beacon (blinking with ON AIR)
// and three pairs of radio-wave arcs. Dim arcs are always there; a bright ripple travels outward
// once every two beats. 1 px lines to match the box-drawing weight.
{
  // Beacon centre sits 5 px above row 9 so the 16 px outer arc clears the tagline glyphs on row 7.
  const cx = MAST_C * CW + 3, top = 10 * CH + 7, cy = 9 * CH - 5, spread = cy + 10;
  const px = new Set();
  const dot = (x, y) => px.add(`${x},${y}`);
  const half = (y) => (y < spread ? 0 : Math.floor((y - spread) / 5));
  for (let y = cy + 2; y < top; y++) { dot(cx - half(y), y); dot(cx + half(y), y); }
  for (const y of [spread + 5, spread + 10, spread + 15]) for (let x = cx - half(y); x <= cx + half(y); x++) dot(x, y);
  const toPath = (set) => {
    const pts = [...set].map((k) => k.split(',').map(Number));
    const ys = pts.map((p) => p[1]), xs = pts.map((p) => p[0]);
    const x0 = Math.min(...xs), y0 = Math.min(...ys);
    const w = Math.max(...xs) - x0 + 1, h = Math.max(...ys) - y0 + 1;
    const rows = Array.from({ length: h }, (_, y) => (x) => set.has(`${x0 + x},${y0 + y}`));
    return bitmapPath(rows, w, 1, 1, x0, y0);
  };
  const arc = (r) => {
    const set = new Set();
    for (let a = -50; a <= 50; a += 0.5) {
      const dx = Math.round(r * Math.cos((a * Math.PI) / 180)), dy = Math.round(r * Math.sin((a * Math.PI) / 180));
      set.add(`${cx + dx},${cy + dy}`); set.add(`${cx - dx},${cy + dy}`);
    }
    return toPath(set);
  };
  const radii = [6, 11, 16];
  css.push(`.w1,.w2{opacity:0}` + radii.map((_, k) => `.w${k}{animation:k${k} ${s(BEAT * 2)} steps(1,end) infinite}`).join(''));
  layers.push(`<path class="c7" d="${toPath(px)}"/>`
    + radii.map((r) => `<path class="c1" d="${arc(r)}"/>`).join('')
    + radii.map((r, k) => `<path class="c11 w${k}" d="${arc(r)}"/>`).join('')
    + `<rect class="c12 air" x="${cx - 1}" y="${cy - 1}" width="3" height="3"/>`);
}

// PRESS ANY KEY blinks (3 beats on, 1 off: about 0.5 Hz, nowhere near flash territory).
css.push(`@keyframes bl{0%{opacity:1}75%{opacity:0}100%{opacity:0}}.bl{animation:bl ${s(BAR)} steps(1,end) infinite}`);
layers.push(`<g class="c15 bl">${uses(27, PROMPT_C + len(PROMPT.lead), PROMPT.word)}</g>`);

// Status bar spinner.
layers.push(['|', '/', '─', '\\'].map((ch, k) => `<g class="c14 p${k}">${uses(29, SPIN_C, ch)}</g>`).join(''));

// Shout-out scroller: white text through a fixed palette gradient mask, 1 px per step.
{
  const text = '     ♪ YOU\'RE LOCKED TO DANCE VISION 87.87 FM ♪ THE PIRATE MOTION-CAPTURE SOUND SYSTEM, '
    + 'TRANSMITTING FROM A PHONE PROPPED AGAINST THE TELLY ♪ NO APP ♪ NO ACCOUNT ♪ NO VIDEO LEAVES YOUR PHONE, '
    + 'JUST THE JOINTS ♪ HOLD TIGHT HACKNEY WICK, SHOREDITCH, DALSTON AND EVERYONE ON THE NIGHT TUBE ♪ '
    + 'SPOTLIGHT MOMENTS EVERY MINUTE OR SO, SO KEEP YOUR ELBOWS WHERE THE CREW CAN SEE THEM ♪ '
    + 'TEXT YOUR SHOUT-OUTS TO THE STUDIO LINE (THERE IS NO STUDIO LINE) ♪ '
    + 'BIG UP THE CHICKEN SHOP ON THE CORNER ♪ SELECTA, WHEEL IT UP ♪ REWIND!';
  const n = len(text);
  const Wtxt = n * CW;
  const r = 28, x0 = CW, x1 = SW - CW;
  const speed = 64; // px per second
  const dur = Wtxt / speed;
  const stops = [[0, BLU], [0.08, LBL], [0.2, CYN], [0.33, LCY], [0.44, WHT], [0.56, LCY], [0.67, CYN], [0.8, LBL], [0.92, BLU]];
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
const INTRO = { typeAt: 0.3, typeDur: 0.72, connectAt: 1.2, drawAt: 1.4, drawDur: 1.8 };
{
  const typed = len('ATDT 020 7946 0878');
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

const TITLE = 'Dance Vision 87.87 FM: an ANSI BBS login screen';
const DESC = 'A modem dials in and a 1990s ANSI screen draws itself: the DANCE VISION logo between bouncing VU meters, '
  + 'a phone sending only 33 joints through a websocket relay on port 8787, crowned with a pirate radio mast, '
  + 'to a TV studio where five stick figures dance under a hopping spotlight, '
  + 'a caller panel (no video, no app, no account, 6 phones a room), tonight\'s line-up of six East London venues, a blinking PRESS ANY KEY, '
  + 'a shout-out scroller and the quick start command npm run party.';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VBW} ${VBH}" width="${VBW}" height="${VBH}" shape-rendering="crispEdges" role="img" aria-labelledby="t d">
<title id="t">${TITLE}</title>
<desc id="d">${DESC}</desc>
<style>${css.join('\n')}</style>
<defs>${glyphDefs}${defs.join('')}</defs>
<rect x=".5" y=".5" width="${VBW - 1}" height="${VBH - 1}" rx="10" fill="#000" stroke="#3a3a4a"/>
<g transform="translate(${PAD} ${PAD})">
${staticLayer}
${layers.join('\n')}
</g>
</svg>
`;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, svg);
console.log(`wrote ${path.relative(process.cwd(), OUT)} (${(svg.length / 1024).toFixed(1)} KB, ${glyphIds.size} glyphs)`);
