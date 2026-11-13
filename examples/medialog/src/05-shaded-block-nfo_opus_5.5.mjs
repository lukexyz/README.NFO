#!/usr/bin/env node
// MediaLog as a shaded block NFO (catalogue entry nfo-02).
//
// Regenerate:  node examples/medialog/src/05-shaded-block-nfo_opus_5.5.mjs
// (add --dump to print the screen as text)
//
// Style reference: the shaded school of PC release-scene NFO art (the manner associated with
// Superior Art Creations and the artists who signed Roy, cH, Ferrex and nERv). They are credited
// as the reference only: no logo, name, tag or letterform of theirs is reproduced, and the art
// crew and tag in this piece are invented. What is reused is technique: the three CP437 shade
// characters as paint, a dark band on the shadow side of every stroke, stems that dissolve
// downward through dark, medium and light shade into dots, debris, broken bands of light shade
// behind the logo, letter tiles with a corner fade, a three-row half-block heading font, frames
// that grow out of the logo, and leader rows.
//
// The idea for MediaLog: on a shade ramp, solid means sure. A log entry with a day is a solid
// block, one with just a month is dark shade, "sometime in" is medium shade, and below that the
// timeline dissolves into dots, exactly the way an NFO letter's foot does.
//
// The animation follows the verb, which cannot decide: watched, read, played, listened to, three
// seconds each. Each verb builds up through light, medium and dark shade to solid and dissolves
// back down; the shadow-side bands of the logo change to that kind's colour letter by letter;
// the kind chips that go with the verb light up, and so do the leaders of the matching entries.
// Around that, the usual business of the style: background bands scroll, loose squares drift, the
// g's fringe dissolves row by row, and once a loop a bright cell runs down the spine.
//
// Plain Node, no dependencies, deterministic (seeded PRNG, no clock). The piece is a 96 x 39
// text screen of 8 x 16 cells; every cell holds one character, and the generator turns the
// characters into SVG geometry: block elements become merged rectangles, the shades become
// 1-pixel dither tiles in the VGA pattern, and text is <use> references to an 8 x 16 bitmap font
// defined below (never <text>). Animation is CSS only, stepped, and prefers-reduced-motion
// switches it off on a complete frame (WATCHED, every chip lit).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '05-shaded-block-nfo_opus_5.5';
const OUT = path.join(HERE, '..', 'assets', `${SLUG}.svg`);

// ---------------------------------------------------------------------------------------------
// Screen geometry
// ---------------------------------------------------------------------------------------------
const COLS = 96, ROWS = 39, CW = 8, CH = 16, PAD = 16;
const SW = COLS * CW, SH = ROWS * CH;
const VBW = SW + PAD * 2, VBH = SH + PAD * 2;

// Inks. The logo is one ink in four tones, as an NFO is: MediaLog's own page colour, turned into
// ink on a screen of its navy taken almost to black. The shadow-side bands of the logo and the
// caption's verb take the colour of a kind of media, and the log entries wear their kind's colour.
const BG = '#0a0e18';
const INK = {
  pw: '#eef1f5',   // paper white: wordmark, emblem
  pd: '#9aa4b8',   // dim paper: debris, key
  bn: '#2f4478',   // navy bands behind the logo
  sp: '#8e9bbb',   // the spine
  tx: '#c8cfdb',   // titles
  dm: '#7d879c',   // captions, meta
  ld: '#3c475f',   // leaders, rules
  hi: '#ffffff',   // the cell that runs down the spine
  // The kinds, as on MediaLog's chips, lifted a little to read on black.
  mv: '#e2524f',   // Movies
  tv: '#3f97dc',   // TV shows, Anime
  bk: '#d9962a',   // Books
  cm: '#dc4e9b',   // Comics, Manga
  gm: '#8cbf30',   // Games
  pc: '#9a75ea',   // Podcasts
  mu: '#25b896',   // Music
  vd: '#b0609f',   // Videos
};

// Seeded PRNG (mulberry32).
function prng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------------------------------------
// 8 x 16 bitmap font in the VGA manner. Rows are '#'/'.' strings placed from row `top`.
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
  '!': [2, '...##.. ..####. ..####. ..####. ...##.. ...##.. ...##.. ....... ...##.. ...##..'],
  '?': [2, '.#####. ##...## ##...## ....##. ...##.. ...##.. ...##.. ....... ...##.. ...##..'],
  "'": [1, '...##.. ...##.. ..##...'],
  '"': [1, '.##..##. .##..##. ..#..#..'],
  '-': [7, '#######'],
  '/': [4, '......# .....## ....##. ...##.. ..##... .##.... ##..... #......'],
  '(': [2, '....##. ...##.. ..##... ..##... ..##... ..##... ..##... ..##... ...##.. ....##.'],
  ')': [2, '.##.... ..##... ...##.. ...##.. ...##.. ...##.. ...##.. ...##.. ..##... .##....'],
  '&': [2, '.###... ##.##.. ##.##.. .###... .###.## ##.###. ##..##. ##..##. ##..##. .###.##'],
  '+': [5, '...##... ...##... .######. ...##... ...##...'],
  '·': [7, '...##... ...##...'],
  '•': [6, '...##... ..####.. ..####.. ...##...'],
  '■': [5, '.######. .######. .######. .######. .######. .######.'],
  '▪': [6, '..####.. ..####.. ..####.. ..####..'],
  '►': [3, '#....... ##...... ###..... ####.... #####... ####.... ###..... ##...... #.......'],
  '♥': [4, '.##.##. ####### ####### ####### .#####. ..###.. ...#...'],
  '»': [5, '##..##.. .##..##. ..##..## .##..##. ##..##..'],
  '└': [0, '...##... ...##... ...##... ...##... ...##... ...##... ...##... ...##... ...##### ...#####'],
  // CP437 1: the little face that goes with a custom verdict.
  '☺': [3, '.######. #......# #.#..#.# #......# #.#..#.# #..##..# #......# .######.'],
  // Not CP437: a thumbs-up for "liked", drawn in the same hand (thumb, fist, cuff).
  '': [2, '....#... ...##... ...##... ..###... ##.##### ##.####. ##.##### ##.####. ##..###.'],
};
for (const [ch, [top, rows]] of Object.entries(PUNCT)) def(ch, top, rows);
FONT.set(' ', new Array(16).fill(0));
const THUMB = '';

// Greedy merge of a bitmap (rows of predicates) into rectangles, as path data.
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
const len = (str) => [...str].length;

// ---------------------------------------------------------------------------------------------
// The screen buffer: one character per cell, with an ink and a layer (layers keep the animated
// parts apart; on a real text screen they would all be one page).
// ---------------------------------------------------------------------------------------------
const scr = Array.from({ length: ROWS }, () => new Array(COLS).fill(null));
function put(r, c, ch, ink, layer = 'art') {
  if (r < 0 || r >= ROWS || c < 0 || c >= COLS) throw new Error(`off screen at ${r},${c}: ${ch}`);
  if (ch === ' ') return;
  if (!INK[ink]) throw new Error(`no ink ${ink}`);
  scr[r][c] = { ch, ink, layer };
}
function text(r, c, str, ink, layer = 'txt') { for (const ch of str) { put(r, c, ch, ink, layer); c++; } return c; }
function seg(r, c, parts, layer = 'txt') { for (const [t, ink] of parts) c = text(r, c, t, ink, layer); return c; }
const spaced = (str) => [...str].join(' ');

// The five CP437 block elements as quadrant bits (TL 1, TR 2, BL 4, BR 8), and the three shades
// as tones (1 light, 2 medium, 3 dark; 4 is the full block).
const QUAD = { '█': 15, '▀': 3, '▄': 12, '▌': 5, '▐': 10 };
const SHADE = { '░': 1, '▒': 2, '▓': 3 };
const TONE = [null, '░', '▒', '▓', '█'];

// ---------------------------------------------------------------------------------------------
// Layout (rows)
// ---------------------------------------------------------------------------------------------
const R = {
  intro: 0, logo: 2, cap: 12, kinds: 18,
  d1: 20, y1: 23, d2: 28, y2: 31, some: 33, key: 37, foot: 38,
};

// ---------------------------------------------------------------------------------------------
// The wordmark: MediaLog, capital M and capital L as on the app. Own lettering on the cell grid:
// heavy stems three cells wide against hairline bars of half blocks, the way the shaded school
// drew its capitals; nine rows to the cap height, six to the x-height.
// ---------------------------------------------------------------------------------------------
const H = (n, row) => new Array(n).fill(row);
const WM = {
  M: ['███▄   ▄███', '████▄ ▄████', '███▀█▄█▀███', '███ ▀█▀ ███', '███  ▀  ███', ...H(4, '███     ███')],
  e: [...H(3, ''), '▄██▀▀██▄', '███  ███', '███▀▀▀▀▀', '███', '███  ▄▄▄', '▀██▄▄██▀'],
  d: [...H(3, '     ███'), '▄██▀▀███', ...H(4, '███  ███'), '▀██▄▄███'],
  i: ['', '███', '', ...H(6, '███')],
  a: [...H(3, ''), '▀▀▀▀▀██▄', '     ███', '▄██▀▀███', '███  ███', '███  ███', '▀██▄▄███'],
  L: [...H(8, '███'), '███▄▄▄▄'],
  o: [...H(3, ''), '▄██▀▀██▄', ...H(4, '███  ███'), '▀██▄▄██▀'],
  g: [...H(3, ''), '▄██▀▀███', ...H(4, '███  ███'), '▀██▄▄███'],
};
const WM_W = { M: 11, e: 8, d: 8, i: 3, a: 8, L: 7, o: 8, g: 8 };
const WM_GAP = 1;
const WORD = 'MediaLog';

// The emblem: MediaLog's own mark, an open book with a play triangle on the left page and a pen
// on the right. Each page is a tile with a light-shade paper fill ('.') and the three-step fade
// of the tile school in its lower-left corner ('3' dark, '2' medium); the pen breaks out of the
// top. The book's spine, at the bottom of the gutter, is where the timeline starts.
const EMBLEM = [
  '               ▄▄',
  '▄▄▄▄▄▄▄▄ ▄▄▄▄▄██▀',
  '█.█▄...█ █...▄█▀█',
  '█.███▄.█ █..▄█▀.█',
  '█.███▀.█ █.▄█▀..█',
  '█.█▀...█ █▐█▀...█',
  '█2.....█ █3▀....█',
  '█32....█ █32....█',
  '▀▀▀▀▀▀▀█▄█▀▀▀▀▀▀▀',
].map((row) => row.replace(/\./g, '░').replace(/3/g, '▓').replace(/2/g, '▒'));

const EMB_W = EMBLEM[0].length;
const wordCells = [...WORD].map((ch) => WM[ch].map((row) => row.padEnd(WM_W[ch], ' ')));
const WORD_W = wordCells.reduce((a, g) => a + g[0].length, 0) + (WORD.length - 1) * WM_GAP;
const LOCK_GAP = 3;
const LOCK_W = EMB_W + LOCK_GAP + WORD_W;
const LOCK_C = Math.floor((COLS - LOCK_W) / 2);
const EMB_C = LOCK_C, WORD_C = LOCK_C + EMB_W + LOCK_GAP;
const WORD_END = WORD_C + WORD_W;       // first column after the g
const WORD_MID = WORD_C + Math.floor(WORD_W / 2);
const CAP_MID = WORD_MID - 3;           // the caption sits a little left, clear of the g's tail
const SPINE = EMB_C + 8;                // the book's spine, and the timeline's
const G_C = WORD_END - 8;               // the g's first column
const TX = SPINE + 3;                   // the timeline's text column
const RIGHT = COLS - 3;                 // last text column

const letterOf = new Map();             // "r,c" -> 0 for the emblem, 1..8 for the letters
EMBLEM.forEach((row, r) => [...row].forEach((ch, c) => {
  if (ch === ' ') return;
  put(R.logo + r, EMB_C + c, ch, 'pw', 'logo');
  letterOf.set(`${R.logo + r},${EMB_C + c}`, 0);
}));
{
  let c0 = WORD_C;
  wordCells.forEach((g, i) => {
    g.forEach((row, r) => [...row].forEach((ch, c) => {
      if (ch === ' ') return;
      const rr = R.logo + r, cc = c0 + c;
      put(rr, cc, ch, 'pw', 'logo');
      letterOf.set(`${rr},${cc}`, i + 1);
    }));
    c0 += g[0].length + WM_GAP;
  });
}

// The g's descender is the one stroke in the word allowed to dissolve. Its hook is drawn whole,
// so the word still reads as MediaLog; the fringe hanging under it goes down through dark, medium
// and light shade into dots, one layer per row so the dissolve can be stepped.
const G_HOOK = ['     ███', '▀▀▀▀▀██▀'];
G_HOOK.forEach((row, d) => [...row].forEach((ch, dc) => {
  if (ch === ' ') return;
  put(R.logo + 9 + d, G_C + dc, ch, 'pw', 'logo');
  letterOf.set(`${R.logo + 9 + d},${G_C + dc}`, WORD.length);
}));
const G_TAIL = [
  '▓▒▓▓▒▓▓ ',
  '▒ ░▒ ▒░ ',
  '░  ░  ░ ',
  '·   ·  ·',
];
G_TAIL.forEach((row, d) => [...row].forEach((ch, dc) => {
  if (ch !== ' ') put(R.logo + 11 + d, G_C + dc, ch, 'pd', `gt${d}`);
}));

// Two-tone modelling. The light comes from the upper left, so the last full cell of every stroke
// before empty space is its shadow side: that cell becomes dark shade, in the colour of a kind of
// media. Each letter keeps its own band, so the colour can change letter by letter.
const BAND = new Map();                 // "r,c" -> letter index
for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS - 1; c++) {
  const cell = scr[r][c];
  if (!cell || cell.layer !== 'logo' || cell.ch !== '█' || scr[r][c + 1]) continue;
  BAND.set(`${r},${c}`, letterOf.get(`${r},${c}`));
}
for (const k of BAND.keys()) { const [r, c] = k.split(',').map(Number); scr[r][c] = null; }

// ---------------------------------------------------------------------------------------------
// The three-row heading font: half blocks, three to five cells a letter. Own design.
// ---------------------------------------------------------------------------------------------
const MINI = {
  A: ['▄▀▀▄', '█▄▄█', '█  █'], C: ['▄▀▀▀', '█   ', '▀▄▄▄'], D: ['█▀▀▄', '█  █', '█▄▄▀'],
  E: ['█▀▀▀', '█▀▀ ', '█▄▄▄'], H: ['█  █', '█▀▀█', '█  █'], I: ['█', '█', '█'],
  L: ['█   ', '█   ', '█▄▄▄'], N: ['█▄ █', '█ ▀█', '█  █'], O: ['▄▀▀▄', '█  █', '▀▄▄▀'],
  P: ['█▀▀▄', '█▄▄▀', '█   '], R: ['█▀▀▄', '█▄▄▀', '█ ▀▄'], S: ['▄▀▀▀', ' ▀▀▄', '▄▄▄▀'],
  T: ['▀█▀', ' █ ', ' █ '], W: ['█   █', '█ █ █', '█▀ ▀█'], Y: ['█ █', '▀█▀', ' █ '],
  0: ['▄▀▀▄', '█▄▀█', '▀▄▄▀'], 1: ['▄█ ', ' █ ', '▄█▄'], 2: ['▄▀▀▄', ' ▄▀ ', '█▄▄▄'],
  5: ['█▀▀▀', '▀▀▀▄', '▄▄▄▀'], 6: ['▄▀▀ ', '█▀▀▄', '▀▄▄▀'], 9: ['▄▀▀▄', '▀▄▄█', ' ▄▄▀'],
  ' ': ['  ', '  ', '  '], '-': ['   ', '▀▀▀', '   '],
};
const miniW = (str) => [...str].reduce((a, ch) => a + len(MINI[ch][0]) + 1, -1);
// Set a word in the heading font, onto the screen, or (with `out`) into a cell list of its own.
function mini(r, c, str, ink, layer, out) {
  for (const ch of str) {
    const g = MINI[ch];
    if (!g) throw new Error(`no mini glyph for ${ch}`);
    g.forEach((row, i) => [...row].forEach((k, j) => {
      if (k === ' ') return;
      if (out) out.push([r + i, c + j, k]); else put(r + i, c + j, k, ink, layer);
    }));
    c += len(g[0]) + 1;
  }
  return c;
}
// Half-block cells to merged path data.
function cellsPath(cells) {
  const W2 = COLS * 2, b = new Uint8Array(W2 * ROWS * 2);
  for (const [r, c, ch] of cells) {
    const q = QUAD[ch];
    if (q & 1) b[(2 * r) * W2 + 2 * c] = 1;
    if (q & 2) b[(2 * r) * W2 + 2 * c + 1] = 1;
    if (q & 4) b[(2 * r + 1) * W2 + 2 * c] = 1;
    if (q & 8) b[(2 * r + 1) * W2 + 2 * c + 1] = 1;
  }
  return bitmapPath(Array.from({ length: ROWS * 2 }, (_, y) => (x) => b[y * W2 + x]), W2, CW / 2, CH / 2);
}

// ---------------------------------------------------------------------------------------------
// Thin rules (2 px on a cell's centre line), kept as a list of cell runs.
// ---------------------------------------------------------------------------------------------
const rules = [];
function hrule(r, c0, c1, ink = 'ld') { if (c1 >= c0) rules.push({ r, c0, c1, ink }); }

// ---------------------------------------------------------------------------------------------
// The words
// ---------------------------------------------------------------------------------------------
const centreAt = (mid, n) => mid - Math.floor(n / 2);
// Row 0, the way an NFO opens: a letter-spaced line set into a rule between fading end caps.
function capped(r, c0, c1) {
  text(r, c0, '▓▒░', 'sp', 'art');
  text(r, c1 - 2, '░▒▓', 'sp', 'art');
}
{
  const s = spaced('a media diary you share');
  const c = centreAt(Math.floor(COLS / 2), len(s));
  text(R.intro, c, s, 'pd');
  capped(R.intro, 0, COLS - 1);
  hrule(R.intro, 4, c - 3);
  put(R.intro, c - 2, '■', 'ld', 'txt');
  put(R.intro, c + len(s) + 1, '■', 'ld', 'txt');
  hrule(R.intro, c + len(s) + 3, COLS - 5);
}

// The caption. The verb cannot decide, so it cycles: four phases, each in the colour of a kind,
// and in each one the kinds that go with the verb light up, as the app's filter chips do.
const PHASES = [
  { verb: 'WATCHED', ink: 'mv', kinds: ['Movies', 'TV shows', 'Anime', 'Videos'] },
  { verb: 'READ', ink: 'bk', kinds: ['Books', 'Comics', 'Manga'] },
  { verb: 'PLAYED', ink: 'gm', kinds: ['Games'] },
  { verb: 'LISTENED TO', ink: 'pc', kinds: ['Podcasts', 'Music'] },
];
const phaseOfKind = (name) => PHASES.findIndex((p) => p.kinds.includes(name));
{
  const a = spaced("everything you've"), b = spaced('on one timeline.');
  text(R.cap, centreAt(CAP_MID, len(a)), a, 'dm');
  text(R.cap + 4, centreAt(CAP_MID, len(b)), b, 'dm');
  PHASES.forEach((p) => { p.cells = []; mini(R.cap + 1, centreAt(CAP_MID, miniW(p.verb)), p.verb, p.ink, null, p.cells); });
}

// Kinds of media, each in its colour, as the app's filter chips.
const KINDS = [
  ['Movies', 'mv'], ['TV shows', 'tv'], ['Anime', 'tv'], ['Books', 'bk'], ['Comics', 'cm'],
  ['Manga', 'cm'], ['Games', 'gm'], ['Podcasts', 'pc'], ['Music', 'mu'], ['Videos', 'vd'],
];
{
  const w = KINDS.reduce((a, [t]) => a + len(t), 0) + (KINDS.length - 1) * 2;
  let c = centreAt(Math.floor((TX + RIGHT) / 2), w);
  // Drawn dimmed all the time and at full strength while its verb is up (layer kb<phase>).
  for (const [t, ink] of KINDS) c = text(R.kinds, c, t, ink, `kb${phaseOfKind(t)}`) + 2;
}

// ---------------------------------------------------------------------------------------------
// The timeline. Its spine grows out of the book's spine and runs down the page; the further back
// it goes, the less sure it is: solid through 2025-2029, dark shade through 2015-2019, medium
// shade for "sometime in", and then it dissolves, like the foot of an NFO letter.
// ---------------------------------------------------------------------------------------------
function spineTone(r) {
  if (r < R.d2) return 4;
  if (r < R.some) return 3;
  if (r < R.some + 3) return 2;
  if (r === R.some + 3) return 1;
  return 0;
}
for (let r = R.logo + 9; r < R.foot; r++) {
  const t = spineTone(r);
  if (t) put(r, SPINE, TONE[t], 'sp', 'art');
  else put(r, SPINE, '·', 'sp', 'art');
}

// A five-year drawer: its first year big in the heading font, the last one small beside it,
// set into a rule that runs from the spine to the far edge.
function drawer(r, from, to, ink) {
  put(r + 1, SPINE + 1, '■', 'sp', 'txt');
  hrule(r + 1, SPINE + 2, TX);
  const end = mini(r, TX + 2, from, ink, 'art');
  text(r + 2, end + 1, `-${to}`, 'dm');
  hrule(r + 1, end + 1, RIGHT - 1);
  put(r + 1, RIGHT, '■', 'ld', 'txt');
}
drawer(R.d1, '2025', '2029', 'pw');
drawer(R.d2, '2015', '2019', 'pd');

// An entry: when (if known), a swatch in the kind's colour whose tone says how sure the date is,
// the title and how it was, then a leader to the kind, the creator and any details.
const SURE = { day: 4, month: 3, some: 2 };
const glows = [];                       // leader runs that light up in their kind's phase
function entry(r, { when, sure, ink, kind, title, how, meta }) {
  if (when) text(r, TX, when, 'tx');
  text(r, TX + 7, TONE[SURE[sure]].repeat(3), ink, 'art');
  let c = text(r, TX + 11, title, 'tx');
  if (how) c = seg(r, c + 1, how);
  const m0 = RIGHT - len(meta) + 1;
  if (m0 < c + 3) throw new Error(`entry too long: ${title}`);
  text(r, c + 1, '.'.repeat(m0 - c - 2), 'ld');
  glows.push({ r, c0: c + 1, c1: m0 - 2, ink, phase: phaseOfKind(kind) });
  text(r, m0, meta, 'dm');
}
text(R.y1, TX, '2026', 'pw');
entry(R.y1 + 1, { when: '21 Mar', sure: 'day', ink: 'tv', kind: 'TV shows', title: 'Quorum', how: [['♥', 'mv']], meta: 'TV show · S2 E1-10' });
seg(R.y1 + 2, TX + 11, [['└ ', 'ld'], ['Watched the vote twice.', 'dm']]);
entry(R.y1 + 3, { when: 'Feb', sure: 'month', ink: 'bk', kind: 'Books', title: 'Middlemarch', how: [[THUMB, 'tx']], meta: 'Book · George Eliot · audiobook' });
text(R.y2, TX, '2016', 'pd');
entry(R.y2 + 1, { when: '12 Nov', sure: 'day', ink: 'gm', kind: 'Games', title: 'Pigeon Census', how: [['♥', 'mv']], meta: 'Game · Breadcrumb Interactive' });
seg(R.some, TX, [['sometime in ', 'dm'], ['2015-2019', 'pd']]);
entry(R.some + 1, { sure: 'some', ink: 'mv', kind: 'Movies', title: 'Moderately Large Shark', how: [['☺ ', 'bk'], ['Big enough', 'dm']], meta: 'Movie · Lorna Fathom' });
entry(R.some + 2, { sure: 'some', ink: 'mu', kind: 'Music', title: 'Songs to Defrost a Freezer To', how: [[THUMB, 'tx']], meta: 'Music · The Damp Tuesdays' });

// The key: on a shade ramp, solid means sure.
{
  const parts = [];
  [[4, 'to the day'], [3, 'to the month'], [2, 'sometime in'], [1, 'not logged yet']].forEach(([t, what], i) => {
    if (i) parts.push(['   ', 'dm']);
    parts.push([TONE[t].repeat(3), 'pd'], [` ${what}`, 'dm']);
  });
  seg(R.key, TX, parts);
}
// The foot: the app's own line, and the artist's tag set into the rule at lower right.
{
  capped(R.foot, 0, COLS - 1);
  const tag = 'nib!5yd';
  const line = spaced('a log, five years at a time');
  const c = text(R.foot, TX, line, 'dm');
  const t0 = COLS - 5 - len(tag);
  hrule(R.foot, c + 1, t0 - 3);
  put(R.foot, t0 - 2, '■', 'ld', 'txt');
  text(R.foot, t0, tag, 'pd');
}

// ---------------------------------------------------------------------------------------------
// Debris: small squares, half blocks, dots and 2-4 cell shards scattered round the logo, thinning
// out with distance. A few loose squares wear the kinds' colours and drift.
// ---------------------------------------------------------------------------------------------
const drifters = [];
{
  const rnd = prng(0x5EDB10C);
  const logo = [];
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    const cell = scr[r][c];
    if ((cell && /^(logo|gt\d)$/.test(cell.layer)) || BAND.has(`${r},${c}`)) logo.push([r, c]);
  }
  const dist = (r, c) => {
    let d = 99;
    for (const [lr, lc] of logo) { const dd = Math.hypot(c - lc, (r - lr) * 2); if (dd < d) d = dd; }
    return d;
  };
  const taken = (r, c) => r < 0 || r >= ROWS || c < 1 || c >= COLS - 1 || scr[r][c] || BAND.has(`${r},${c}`);
  // A piece lands only where it touches nothing already drawn, and never in the caption block.
  const capBox = { r0: R.cap - 1, r1: R.cap + 5, c0: CAP_MID - 29, c1: CAP_MID + 28 };
  const inCap = (r, c) => r >= capBox.r0 && r <= capBox.r1 && c >= capBox.c0 && c <= capBox.c1;
  const free = (r, c) => !taken(r, c) && !inCap(r, c) && !taken(r - 1, c) && !taken(r + 1, c) && !taken(r, c - 1) && !taken(r, c + 1) && c !== SPINE;
  const squares = [];
  for (let r = 1; r <= R.kinds - 1; r++) {
    for (let c = 1; c < COLS - 1; c++) {
      if (!free(r, c)) continue;
      const d = dist(r, c);
      if (d < 2.5 || d > 7.5) continue;
      if (rnd() > 0.3 * (1 - (d - 2.5) / 5.5)) continue;
      const k = rnd();
      if (k < 0.18) {
        const n = 2 + Math.floor(rnd() * 3), ch = rnd() < 0.5 ? '▀' : '▄';
        for (let i = 0; i < n && free(r, c + i); i++) put(r, c + i, ch, 'pd', 'art');
      } else if (k < 0.45) put(r, c, rnd() < 0.5 ? '▄' : '▀', 'pd', 'art');
      else if (k < 0.7) { put(r, c, '■', 'pd', 'art'); squares.push([r, c]); }
      else if (k < 0.8) put(r, c, '░', 'pd', 'art');
      else put(r, c, '·', 'pd', 'art');
    }
  }
  // Eight of the small squares come loose, one per kind colour, and drift.
  const inks = ['mv', 'tv', 'bk', 'cm', 'gm', 'pc', 'mu', 'vd'];
  const order = squares.map((s) => [rnd(), s]).sort((a, b) => a[0] - b[0]).map(([, s]) => s);
  for (const [r, c] of order) {
    if (drifters.length === inks.length) break;
    if (!(free(r - 1, c + 1) || free(r + 1, c + 1))) continue;
    const ink = inks[drifters.length];
    scr[r][c] = { ch: '■', ink, layer: `dr${drifters.length}` };
    drifters.push({ r, c, dy: free(r - 1, c + 1) ? -1 : 1 });
  }
}

// Background bands: broken runs of light shade across the full width behind the logo. They
// scroll sideways one cell at a time, and every occupied cell is knocked out of them.
const BAND_PERIOD = 40;
const bgBands = [];
{
  const rnd = prng(0xBA2D);
  for (const [r, group] of [[R.logo + 1, 'sR'], [R.logo + 4, 'sL'], [R.logo + 5, 'sR'], [R.logo + 7, 'sL']]) {
    const cells = new Uint8Array(BAND_PERIOD);
    let c = 0;
    while (c < BAND_PERIOD) {
      const run = 3 + Math.floor(rnd() * 10), gap = 1 + Math.floor(rnd() * 4);
      for (let i = 0; i < run && c < BAND_PERIOD - 1; i++) cells[c++] = 1;
      c += gap;
    }
    bgBands.push({ r, group, cells });
  }
}

if (process.argv.includes('--dump')) {
  console.log(scr.map((row, r) => row.map((cell, c) => {
    if (cell) return cell.ch;
    if (BAND.has(`${r},${c}`)) return '▓';
    const b = bgBands.find((x) => x.r === r);
    return b && b.cells[c % BAND_PERIOD] ? '░' : ' ';
  }).join('').replace(/\s+$/, '')).join('\n'));
}

// ---------------------------------------------------------------------------------------------
// Emit
// ---------------------------------------------------------------------------------------------
const defs = [], css = [];
const pats = new Set();
function pat(ink, tone) {
  const id = `p${ink}${tone}`;
  if (!pats.has(id)) {
    pats.add(id);
    // The VGA ROM dither rows: 25% is 0x22/0x88, 50% is 0x55/0xAA, 75% is 0xDD/0x77.
    const tile = tone === 1 ? ['4', 'M2 0h1v1h-1zM0 1h1v1h-1z'] : tone === 2 ? ['2', 'M1 0h1v1h-1zM0 1h1v1h-1z'] : ['4', 'M0 0h2v1h-2zM3 0h1v1h-1zM1 1h3v1h-3z'];
    defs.push(`<pattern id="${id}" width="${tile[0]}" height="2" patternUnits="userSpaceOnUse"><path fill="${INK[ink]}" d="${tile[1]}"/></pattern>`);
  }
  return `url(#${id})`;
}
function gridPath(bits, w, h, sx, sy) {
  return bitmapPath(Array.from({ length: h }, (_, y) => (x) => bits[y * w + x]), w, sx, sy);
}
function layerParts(test) {
  const solid = new Map(), shade = new Map(), uses = new Map();
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = scr[r][c];
      if (!cell || !test(cell.layer)) continue;
      const ink = cell.ink;
      if (QUAD[cell.ch]) {
        if (!solid.has(ink)) solid.set(ink, new Uint8Array(COLS * 2 * ROWS * 2));
        const b = solid.get(ink), q = QUAD[cell.ch], W2 = COLS * 2;
        if (q & 1) b[(2 * r) * W2 + 2 * c] = 1;
        if (q & 2) b[(2 * r) * W2 + 2 * c + 1] = 1;
        if (q & 4) b[(2 * r + 1) * W2 + 2 * c] = 1;
        if (q & 8) b[(2 * r + 1) * W2 + 2 * c + 1] = 1;
      } else if (SHADE[cell.ch]) {
        const k = `${ink}${SHADE[cell.ch]}`;
        if (!shade.has(k)) shade.set(k, { ink, tone: SHADE[cell.ch], bits: new Uint8Array(COLS * ROWS) });
        shade.get(k).bits[r * COLS + c] = 1;
      } else {
        uses.set(ink, (uses.get(ink) || '') + `<use href="#${gid(cell.ch)}" x="${c * CW}" y="${r * CH}"/>`);
      }
    }
  }
  return {
    solid: [...solid].map(([ink, b]) => ({ ink, d: gridPath(b, COLS * 2, ROWS * 2, CW / 2, CH / 2) })),
    shade: [...shade.values()].map(({ ink, tone, bits }) => ({ ink, tone, d: gridPath(bits, COLS, ROWS, CW, CH) })),
    uses: [...uses].map(([ink, u]) => ({ ink, u })),
  };
}
function layerSvg(test) {
  const t = typeof test === 'string' ? (l) => l === test : test;
  const p = layerParts(t);
  return p.solid.map(({ ink, d }) => `<path fill="${INK[ink]}" d="${d}"/>`).join('')
    + p.shade.map(({ ink, tone, d }) => `<path fill="${pat(ink, tone)}" d="${d}"/>`).join('')
    + p.uses.map(({ ink, u }) => `<g fill="${INK[ink]}">${u}</g>`).join('');
}

// Step-end opacity keyframes from a list of visible windows (seconds) in a loop.
function onOff(name, wins, period) {
  const segs = [];
  for (const [a0, b0] of wins) {
    const a = ((a0 % period) + period) % period, d = b0 - a0;
    if (a + d <= period + 1e-9) segs.push([a, Math.min(period, a + d)]);
    else { segs.push([a, period]); segs.push([0, a + d - period]); }
  }
  const at = (t) => (segs.some(([a, b]) => t >= a - 1e-9 && t < b - 1e-9) ? 1 : 0);
  const ts = [...new Set([0, ...segs.flat()])].filter((t) => t < period - 1e-9).sort((x, y) => x - y);
  const kf = [];
  let last = null;
  for (const t of ts) { const v = at(t); if (v !== last) { kf.push(`${(100 * t / period).toFixed(3)}%{opacity:${v}}`); last = v; } }
  kf.push(`100%{opacity:${at(0)}}`);
  return `@keyframes ${name}{${kf.join('')}}`;
}

// The loop: four phases of three seconds. Phase k starts at k * PH + T0, so the loop opens one
// second into WATCHED, with the verb solid and the bands red on the very first frame.
const LOOP = 12, PH = LOOP / PHASES.length, STEP = 0.12, T0 = -1;
const layers = [];

// 0. Background bands, clipped to the screen, scrolling; then the knock-out.
{
  defs.push(`<clipPath id="scr"><rect x="${CW}" y="0" width="${(COLS - 2) * CW}" height="${SH}"/></clipPath>`);
  const groups = new Map();
  for (const b of bgBands) {
    let d = '';
    for (let c = 0; c < COLS + BAND_PERIOD;) {
      if (!b.cells[c % BAND_PERIOD]) { c++; continue; }
      const c0 = c;
      while (c < COLS + BAND_PERIOD && b.cells[c % BAND_PERIOD]) c++;
      d += `M${c0 * CW} ${b.r * CH}h${(c - c0) * CW}v${CH}h${-(c - c0) * CW}z`;
    }
    groups.set(b.group, (groups.get(b.group) || '') + `<path fill="${pat('bn', 1)}" d="${d}"/>`);
  }
  let g = '';
  for (const [cls, body] of groups) g += `<g class="${cls}">${body}</g>`;
  layers.push(`<g clip-path="url(#scr)">${g}</g>`);
  const px = BAND_PERIOD * CW;
  css.push(`.sL{animation:sL 36s steps(${BAND_PERIOD}) infinite}.sR{transform:translateX(${-px}px);animation:sR 52s steps(${BAND_PERIOD}) infinite}`);
  css.push(`@keyframes sL{to{transform:translateX(${-px}px)}}@keyframes sR{to{transform:translateX(0)}}`);
  // The knock-out: every occupied cell in a band row, so dithered cells never show band through.
  const ko = new Uint8Array(COLS * ROWS);
  for (const b of bgBands) for (let c = 0; c < COLS; c++) {
    if (scr[b.r][c] || BAND.has(`${b.r},${c}`) || c === SPINE) ko[b.r * COLS + c] = 1;
  }
  layers.push(`<path fill="${BG}" d="${gridPath(ko, COLS, ROWS, CW, CH)}"/>`);
}

// 1. The two-tone bands, once per phase colour, letter by letter. The colour change wipes
//    across the word from the book to the g while the new verb builds.
{
  const nL = WORD.length + 1;
  for (let j = 0; j < nL; j++) {
    const bits = new Uint8Array(COLS * ROWS);
    for (const [k, li] of BAND) if (li === j) { const [r, c] = k.split(',').map(Number); bits[r * COLS + c] = 1; }
    defs.push(`<path id="b${j}" d="${gridPath(bits, COLS, ROWS, CW, CH)}"/>`);
    PHASES.forEach((p, k) => {
      const t0 = k * PH + T0 + STEP * 2 + j * 0.07;
      css.push(onOff(`b${j}k${k}`, [[t0, t0 + PH]], LOOP));
      layers.push(`<use href="#b${j}" fill="${pat(p.ink, 3)}" class="bd" style="opacity:${k ? 0 : 1};animation-name:b${j}k${k}"/>`);
    });
  }
  css.push(`.bd{animation-duration:${LOOP}s;animation-timing-function:step-end;animation-iteration-count:infinite}`);
}
// 2. The logo itself, and the g's descender a row at a time.
layers.push(layerSvg('logo'));
for (let d = 0; d < G_TAIL.length; d++) layers.push(`<g class="gt gt${d}">${layerSvg(`gt${d}`)}</g>`);
css.push(`.gt{animation:gt 6s step-end infinite}.gt1{animation-delay:.25s}.gt2{animation-delay:.5s}.gt3{animation-delay:.75s}`);
css.push(`@keyframes gt{0%{opacity:1}84%{opacity:.25}90%{opacity:1}}`);
// 3. The verbs: each one builds up through light, medium and dark shade to solid, holds, and
//    dissolves back down again. The old verb's last light-shade step ends the moment the new
//    one's first begins, so the caption is never empty.
PHASES.forEach((p, k) => {
  defs.push(`<path id="v${k}" d="${cellsPath(p.cells)}"/>`);
  const s = k * PH + T0;
  const wins = {
    1: [[s, s + STEP], [s + PH - STEP, s + PH]],
    2: [[s + STEP, s + 2 * STEP], [s + PH - 2 * STEP, s + PH - STEP]],
    3: [[s + 2 * STEP, s + 3 * STEP], [s + PH - 3 * STEP, s + PH - 2 * STEP]],
    4: [[s + 3 * STEP, s + PH - 3 * STEP]],
  };
  for (const t of [1, 2, 3, 4]) {
    css.push(onOff(`v${k}t${t}`, wins[t], LOOP));
    const fill = t === 4 ? INK[p.ink] : pat(p.ink, t);
    layers.push(`<use href="#v${k}" fill="${fill}" class="bd" style="opacity:${k === 0 && t === 4 ? 1 : 0};animation-name:v${k}t${t}"/>`);
  }
});
// 4. Rules and everything else.
{
  const by = new Map();
  for (const { r, c0, c1, ink } of rules) by.set(ink, (by.get(ink) || '') + `M${c0 * CW} ${r * CH + 7}h${(c1 - c0 + 1) * CW}v2h${-(c1 - c0 + 1) * CW}z`);
  for (const [ink, d] of by) layers.push(`<path fill="${INK[ink]}" d="${d}"/>`);
}
layers.push(layerSvg((l) => l === 'art' || l === 'txt'));

// 4b. The kind chips: dimmed, with the verb's own kinds at full strength in its phase. With
//     motion reduced they all stay lit. The log's leaders glow in the colour of their kind.
layers.push(`<g opacity=".38">${layerSvg((l) => /^kb/.test(l))}</g>`);
PHASES.forEach((p, k) => {
  const s = k * PH + T0 + STEP * 3;
  css.push(onOff(`kb${k}`, [[s, s + PH - STEP * 6]], LOOP));
  layers.push(`<g class="bd" style="animation-name:kb${k}">${layerSvg(`kb${k}`)}</g>`);
  const glow = glows.filter((g) => g.phase === k);
  if (!glow.length) return;
  let body = '';
  for (const g of glow) {
    let u = '';
    for (let c = g.c0; c <= g.c1; c++) u += `<use href="#${gid('.')}" x="${c * CW}" y="${g.r * CH}"/>`;
    body += `<g fill="${INK[g.ink]}">${u}</g>`;
  }
  layers.push(`<g class="bd" style="opacity:0;animation-name:kb${k}">${body}</g>`);
});

// 4c. Time passing: once a loop a bright cell leaves the book and runs down the spine a row at
//     a time, dimming as the spine does, and is gone by the dots. Hidden with motion reduced.
{
  const r0 = R.logo + 9, r1 = R.foot - 2, n = r1 - r0;
  const keys = [];
  for (let i = 0; i <= n; i++) {
    const t = spineTone(r0 + i);
    const pct = (i / n) * 70;
    keys.push(`${pct.toFixed(2)}%{transform:translateY(${i * CH}px);opacity:${[0, 0.25, 0.45, 0.7, 1][t]}}`);
  }
  keys.push('72%{opacity:0;transform:translateY(0)}100%{opacity:0;transform:translateY(0)}');
  css.push(`.pl{opacity:0;animation:pl ${LOOP}s step-end infinite}@keyframes pl{${keys.join('')}}`);
  layers.push(`<rect class="pl" x="${SPINE * CW}" y="${r0 * CH}" width="${CW}" height="${CH}" fill="${INK.hi}"/>`);
}

// 5. Loose squares in the kinds' colours drift a cell, fade, and settle back.
drifters.forEach(({ dy }, i) => {
  layers.push(`<g class="dr" style="animation-name:${dy < 0 ? 'du' : 'dd'};animation-delay:${-(i * 1.37 % 9).toFixed(2)}s">${layerSvg(`dr${i}`)}</g>`);
});
css.push(`.dr{animation-duration:9s;animation-timing-function:step-end;animation-iteration-count:infinite}`);
const drift = (name, dy) => `@keyframes ${name}{0%{opacity:1;transform:translate(0,0)}55%{opacity:1;transform:translate(${CW}px,0)}63%{opacity:.6;transform:translate(${CW}px,${dy * CH}px)}71%{opacity:.3;transform:translate(${2 * CW}px,${dy * CH}px)}79%{opacity:0;transform:translate(${2 * CW}px,${dy * CH}px)}90%{opacity:.5;transform:translate(0,0)}95%{opacity:1;transform:translate(0,0)}}`;
css.push(drift('du', -1), drift('dd', 1));

css.push(`@media (prefers-reduced-motion:reduce){*{animation:none!important}}`);
const glyphDefs = [...glyphIds].map(([ch, id]) => `<path id="${id}" d="${glyphPath(FONT.get(ch))}"/>`).join('');
const TITLE = 'MediaLog: a media diary you share, as a shaded block NFO';
const DESC = 'A 1990s shaded block NFO screen, drawn in block and shade characters. MediaLog in heavy condensed block letters beside the app\'s open-book mark (a play triangle on the left page, a pen on the right), '
  + 'each stroke with a band of dark shade on its shadow side in the colour of a kind of media; the g\'s tail dissolves into dots, with debris and broken bands of light shade behind. '
  + 'Caption: everything you\'ve watched, on one timeline, the verb cycling through watched, read, played and listened to, each in a kind\'s colour. '
  + 'Kinds: Movies, TV shows, Anime, Books, Comics, Manga, Games, Podcasts, Music, Videos. A timeline grows from the book\'s spine and fades as it goes back: '
  + '2025-2029, 2026: 21 Mar, Quorum, TV show, S2 E1-10, loved, note Watched the vote twice; Feb, Middlemarch, Book, George Eliot, audiobook, liked. '
  + '2015-2019, 2016: 12 Nov, Pigeon Census, Game, Breadcrumb Interactive, loved. Sometime in 2015-2019: Moderately Large Shark, Movie, Lorna Fathom, Big enough; Songs to Defrost a Freezer To, Music, The Damp Tuesdays, liked. '
  + 'Key: solid, to the day; dark shade, to the month; medium shade, sometime in; light shade, not logged yet. Footer: a log, five years at a time. Signed nib!5yd.';
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VBW} ${VBH}" width="${VBW}" height="${VBH}" role="img" aria-labelledby="t d">
<title id="t">${TITLE}</title>
<desc id="d">${DESC}</desc>
<style>${css.join('\n')}</style>
<defs>${glyphDefs}${defs.join('')}</defs>
<rect x=".5" y=".5" width="${VBW - 1}" height="${VBH - 1}" rx="10" fill="${BG}" stroke="#2b3550"/>
<g transform="translate(${PAD} ${PAD})">
${layers.join('\n')}
</g>
</svg>
`;
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, svg);
console.log(`wrote ${path.relative(process.cwd(), OUT)} (${(svg.length / 1024).toFixed(1)} KB, ${glyphIds.size} glyphs)`);
