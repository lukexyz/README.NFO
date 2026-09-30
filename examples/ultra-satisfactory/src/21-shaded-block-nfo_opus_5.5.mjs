#!/usr/bin/env node
// ULTRA-SATISFACTORY as a shaded block NFO.
//
// Regenerate:  node examples/ultra-satisfactory/src/21-shaded-block-nfo_opus_5.5.mjs
// (add --dump to print the screen as text)
//
// Style reference (catalogue entry nfo-02): the shaded school of PC release-scene NFO art, the
// manner associated with Superior Art Creations and the artists who signed Roy, cH, Ferrex and
// nERv. They are credited here as the reference only: no logo, name, tag or letterform of theirs
// is reproduced, and the crew and artist tag in this piece are invented. What is reused is the
// technique: the three CP437 shade characters used as paint, two-tone modelling with a shaded
// band on the shadow side of every stroke, stems that dissolve downward through dark, medium
// and light shade into single dots, debris, broken bands of light shade behind the logo, frame
// walls stacked from solid, dark, medium and light cells, a three-row half-block heading font,
// and field rows with leaders.
//
// Plain Node, no dependencies, deterministic (seeded PRNG, no clock). The whole piece is a
// 96 x 44 text screen of 8 x 16 cells. Every cell holds one character, as it would in a real
// .NFO, and the generator turns the characters into SVG geometry: block elements become merged
// rectangles, the shades become three 1-pixel dither tiles that follow the VGA ROM patterns, and
// text becomes <use> references to an 8 x 16 bitmap font defined below (never <text>).
// Animation is CSS only and stepped in whole cells, so the dither never swims, and
// prefers-reduced-motion switches all of it off on a complete frame.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '21-shaded-block-nfo_opus_5.5';
const OUT = path.join(HERE, '..', 'assets', `${SLUG}.svg`);

// ---------------------------------------------------------------------------------------------
// Screen geometry
// ---------------------------------------------------------------------------------------------
const COLS = 96, ROWS = 44, CW = 8, CH = 16, PAD = 16;
const SW = COLS * CW, SH = ROWS * CH;
// 800 x 736. The README shows it at 800 px, one screen pixel per unit on a desktop page, so the
// 1-pixel dither and the bitmap font land exactly; anywhere narrower it is antialiased down.
const VBW = SW + PAD * 2, VBH = SH + PAD * 2;

// Row map.
const R = { cap: 0, ultra: 2, frame: 13, satis: 15, tag: 22, what: 25, fields: 28, tabsRule: 32, tabs: 33, run: 37, cmds: 40, foot: 43 };
const WALL = { l: 0, r: COLS - 2 };     // two-cell frame walls down both margins
const IN = { c0: 2, c1: COLS - 3 };     // first and last column between the walls
const TXT = { c0: 5, c1: 90 };          // text block

// Inks. The style is one ink on black in four tones; here there are two (the app's neon cyan
// for ULTRA, the frame that grows out of it and the headings set into that frame, DOS light grey
// for SATISFACTORY), plus greys for the type and the app's gold and three tab colours as small
// accents.
const INK = {
  cy: '#00cfff',   // ULTRA, frame walls
  wh: '#c6cdd6',   // SATISFACTORY
  hi: '#eef2f6',   // values
  fr: '#8b949e',   // labels, captions
  dm: '#565e69',   // leaders, rules
  go: '#e8d44d',   // the tag line, numbers, the artist tag
  bc: '#0a82a6',   // background band behind ULTRA
  bg: '#6a727d',   // background band behind SATISFACTORY
  pu: '#a855f7', pk: '#ec4899', bl: '#38bdf8',   // the three tab colours
  mk: '#ffffff',   // mask white
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
const len = (str) => [...str].length;

// ---------------------------------------------------------------------------------------------
// The screen buffer. One character per cell, with an ink and a layer (layers are how the
// animated parts are kept apart; on a real text screen they would all be the same page).
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
const width = (parts) => parts.reduce((a, [t]) => a + len(t), 0);
const centre = (n, c0 = IN.c0, c1 = IN.c1) => c0 + Math.floor((c1 - c0 + 1 - n) / 2);
const spaced = (str) => [...str].join(' ');

// The five CP437 block elements as quadrant bits (TL 1, TR 2, BL 4, BR 8), and the three shades
// as tones.
const QUAD = { '█': 15, '▀': 3, '▄': 12, '▌': 5, '▐': 10 };
const SHADE = { '░': 1, '▒': 2, '▓': 3 };
const TONE = [null, '░', '▒', '▓', '█'];

// Thin rules (2 px, on the cell's centre line) are kept as a list of cell runs.
const rules = [];
function hrule(r, c0, c1, ink = 'dm') { if (c1 >= c0) rules.push({ r, c0, c1, ink }); }
// A rule that runs from c0 to c1 but steps round anything already on that row.
function hruleFree(r, c0, c1, ink = 'dm') {
  const free = (c) => c >= c0 && c <= c1 && !scr[r][c] && !scr[r][c - 1] && !scr[r][c + 1];
  for (let c = c0; c <= c1;) {
    if (!free(c)) { c++; continue; }
    const s0 = c;
    while (free(c)) c++;
    hrule(r, s0, c - 1, ink);
  }
}

// ---------------------------------------------------------------------------------------------
// ULTRA: slab capitals, 13 or 14 cells wide and 8 rows tall. Own lettering, designed on the cell
// grid for this piece. '#' full cell, '^' upper half, '_' lower half (wedge cuts, kept to the lit
// side). Modelling is by rule, with the light in the upper left: the last cell of every run is
// medium shade and the one before it dark (the shadow side of a stroke), and the underside of
// every bar is dark. Below the baseline each stem carries on as a tail that dissolves through
// dark, medium and light shade into single dots.
// ---------------------------------------------------------------------------------------------
const rep = (row, n) => new Array(n).fill(row);
const BIG = {
  U: ['_###....._###', ...rep('####.....####', 5), '#############', '^############'],
  L: ['_###.........', ...rep('####.........', 5), '#############', '#############'],
  T: ['_#############', '##############', ...rep('.....####.....', 6)],
  R: ['_###########.', '#############', '####.....####', '####.....####', '#############', '###########..', '####..####...', '####...^#####'],
  A: ['._##########.', '_############', '####.....####', '####.....####', '#############', '#############', '####.....####', '####.....####'],
};
const TAILS = { U: [0, 9], L: [0], T: [5], R: [0, 9], A: [0, 9] };   // first column of each stem's foot
// Tones down each of a tail's four columns (3 dark, 2 medium, 1 light, 0 a single dot).
const TAIL_PAT = [[3, 2, 1, 0], [3, 3, 2, 1], [2, 2, 1, 0], [1, 0]];
const BIG_H = 8, BIG_GAP = 3, TAIL_H = 4;
const ULTRA_W = [...'ULTRA'].reduce((a, ch) => a + BIG[ch][0].length, 0) + 4 * BIG_GAP;
const ULTRA_C = centre(ULTRA_W);

function model(rows, r0, c0, ink, layer) {
  const H = rows.length;
  const full = (r, c) => r >= 0 && r < H && rows[r][c] === '#';
  rows.forEach((row, r) => [...row].forEach((k, c) => {
    if (k === '.') return;
    if (k !== '#') { put(r0 + r, c0 + c, k === '^' ? '▀' : '▄', ink, layer); return; }
    let top = r, bot = r;
    while (full(top - 1, c)) top--;
    while (full(bot + 1, c)) bot++;
    let left = c, right = c;
    while (row[left - 1] === '#') left--;
    while (row[right + 1] === '#') right++;
    const wide = right - left + 1 >= 6, low = bot - top + 1 <= 3;      // part of a bar, not a stem
    const edge = row[c + 1] === undefined || row[c + 1] === '.';
    const under = wide && low && bot === r && (r === H - 1 || rows[r + 1][c] === '.');
    const edge2 = !edge && (row[c + 2] === undefined || row[c + 2] === '.');
    put(r0 + r, c0 + c, edge ? '▒' : edge2 || under ? '▓' : '█', ink, layer);
  }));
}
{
  let c0 = ULTRA_C;
  for (const ch of 'ULTRA') {
    model(BIG[ch], R.ultra, c0, 'cy', 'logoU');
    for (const t of TAILS[ch]) {
      TAIL_PAT.forEach((col, k) => col.forEach((tone, d) => {
        const r = R.ultra + BIG_H + d, c = c0 + t + k;
        if (tone) put(r, c, TONE[tone], 'cy', `f${d}`);           // one layer per row of the tail
        else put(r, c, '·', 'cy', (r + c) % 2 ? 'dA' : 'dB');     // dots, in two sets that swap
      }));
    }
    c0 += BIG[ch][0].length + BIG_GAP;
  }
}

// ---------------------------------------------------------------------------------------------
// SATISFACTORY: condensed capitals, 6 x 6 cells, two-tone: strokes are two cells wide, a solid
// cell and a dark-shade cell on the shadow side. The middle bars of S and F sit on a row boundary,
// built from a lower-half row over an upper-half row.
// ---------------------------------------------------------------------------------------------
const MID = {
  S: ['_#####', '##....', '##____', '^^^^##', '....##', '#####^'],
  A: ['_####_', '##..##', '##..##', '######', '##..##', '##..##'],
  T: ['######', ...rep('..##..', 5)],
  I: rep('##', 6),
  F: ['######', '##....', '##___.', '##^^^.', '##....', '##....'],
  C: ['_#####', '##....', '##....', '##....', '##....', '^#####'],
  O: ['_####_', '##..##', '##..##', '##..##', '##..##', '^####^'],
  R: ['#####_', '##..##', '##..##', '#####^', '##.##_', '##..##'],
  Y: ['##..##', '##..##', '^####^', '..##..', '..##..', '..##..'],
};
const MID_GAP = 2;
const SATIS = 'SATISFACTORY';
const SATIS_W = [...SATIS].reduce((a, ch) => a + MID[ch][0].length, 0) + (SATIS.length - 1) * MID_GAP;
const SATIS_C = centre(SATIS_W);
{
  let c0 = SATIS_C;
  for (const ch of SATIS) {
    MID[ch].forEach((row, r) => [...row].forEach((k, c) => {
      if (k === '.') return;
      const next = row[c + 1];
      const glyph = k === '^' ? '▀' : k === '_' ? '▄' : (next === undefined || next === '.') ? '▓' : '█';
      put(R.satis + r, c0 + c, glyph, 'wh', 'logoS');
    }));
    c0 += MID[ch][0].length + MID_GAP;
  }
}

// ---------------------------------------------------------------------------------------------
// Frame walls: two cells wide down each margin, stacked from solid, dark, medium and light
// shade, fading out between the rows where something is anchored to them and back in again.
// ---------------------------------------------------------------------------------------------
{
  const anchors = [R.cap, R.frame, R.what + 1, R.run + 1, R.foot];
  for (let r = 0; r < ROWS; r++) {
    const d = Math.min(...anchors.map((a) => Math.abs(a - r)));
    const outer = Math.max(1, Math.min(4, 5 - d)), inner = Math.max(0, Math.min(4, 4 - d));
    if (TONE[outer]) { put(r, WALL.l, TONE[outer], 'cy'); put(r, WALL.r + 1, TONE[outer], 'cy'); }
    if (TONE[inner]) { put(r, WALL.l + 1, TONE[inner], 'cy'); put(r, WALL.r, TONE[inner], 'cy'); }
  }
}
// End caps: the wall fades into a row, dark to light.
function caps(r, ink = 'cy') {
  text(r, IN.c0, '▓▓▒▒░░', ink, 'art');
  text(r, IN.c1 - 5, '░░▒▒▓▓', ink, 'art');
}
// The frame grows out of the logo: its top rule runs from wall to wall through the last row of
// ULTRA's tails, which pass in front of it.
put(R.frame, IN.c0, '▓', 'cy'); put(R.frame, IN.c0 + 1, '▒', 'cy'); put(R.frame, IN.c0 + 2, '░', 'cy');
put(R.frame, IN.c1, '▓', 'cy'); put(R.frame, IN.c1 - 1, '▒', 'cy'); put(R.frame, IN.c1 - 2, '░', 'cy');

// ---------------------------------------------------------------------------------------------
// The three-row heading font: half blocks, 1 to 5 cells a letter.
// ---------------------------------------------------------------------------------------------
const MINI = {
  A: ['█▀▀█', '█▀▀█', '▀  ▀'], B: ['█▀▀▄', '█▀▀▄', '▀▀▀ '], C: ['█▀▀▀', '█   ', '▀▀▀▀'], D: ['█▀▀▄', '█  █', '▀▀▀ '],
  E: ['█▀▀▀', '█▀▀ ', '▀▀▀▀'], F: ['█▀▀▀', '█▀▀ ', '▀   '], G: ['█▀▀▀', '█ ▀█', '▀▀▀▀'], H: ['█  █', '█▀▀█', '▀  ▀'],
  I: ['█', '█', '▀'], i: ['▀', '█', '▀'], J: ['   █', '▄  █', '▀▀▀▀'], K: ['█ ▄▀', '█▀▄ ', '▀  ▀'], L: ['█   ', '█   ', '▀▀▀▀'],
  M: ['█▄ ▄█', '█ ▀ █', '▀   ▀'], N: ['█▄ █', '█ ▀█', '▀  ▀'], O: ['█▀▀█', '█  █', '▀▀▀▀'], P: ['█▀▀█', '█▀▀▀', '▀   '],
  Q: ['█▀▀█', '█ ▄█', '▀▀▀▀'], R: ['█▀▀█', '█▀█▄', '▀  ▀'], S: ['█▀▀▀', '▀▀▀█', '▀▀▀▀'], T: ['▀█▀', ' █ ', ' ▀ '],
  U: ['█  █', '█  █', '▀▀▀▀'], V: ['█  █', '█ ▄▀', '▀▀  '], W: ['█   █', '█ █ █', '▀▀▀▀▀'], X: ['▀▄▄▀', '▄▀▀▄', '▀  ▀'],
  Y: ['█ █', '▀█▀', ' ▀ '], Z: ['▀▀▀█', '█▀▀▀', '▀▀▀▀'], ' ': ['  ', '  ', '  '], '-': ['  ', '▀▀', '  '], '.': [' ', ' ', '▀'],
};
const miniWidth = (str) => [...str].reduce((a, ch) => a + len(MINI[ch][0]) + 1, -1);
function mini(r, c, str, ink) {
  for (const ch of str) {
    const g = MINI[ch];
    if (!g) throw new Error(`no mini glyph for ${ch}`);
    g.forEach((row, i) => text(r + i, c, row, ink, 'art'));
    c += len(g[0]) + 1;
  }
  return c;
}
// A heading set into a rule: a short stub and a small square, the word, then a rule to the wall.
function heading(r, str) {
  const c = TXT.c0 + 5, w = miniWidth(str);
  hrule(r + 1, IN.c0, c - 5); put(r + 1, c - 3, '■', 'dm', 'txt');
  mini(r, c, str, 'cy');
  put(r + 1, c + w + 2, '■', 'dm', 'txt'); hrule(r + 1, c + w + 5, IN.c1);
}

// ---------------------------------------------------------------------------------------------
// The words
// ---------------------------------------------------------------------------------------------
// Row 0: who is to blame.
{
  caps(R.cap);
  const parts = [[spaced('MERGED CELLS'), 'hi'], ['   ·   ', 'dm'], [spaced('presents'), 'fr']];
  seg(R.cap, centre(width(parts)), parts);
}
// Two letter-spaced caption rows under the logo.
{
  const a = spaced('every recipe, building & objective');
  text(R.tag, centre(len(a)), a, 'fr');
  const b = [['·:·   ', 'dm'], [spaced('one click apart'), 'go'], ['   ·:·', 'dm']];
  seg(R.tag + 1, centre(width(b)), b);
}
// Field rows, mirrored about a centre mark: value :.... LABEL ·· LABEL ....: value
{
  heading(R.what, 'WHAT iT iS');
  const rows = [
    ['ULTRA-SATISFACTORY', 'cy', 'RELEASE', 'iTEMS', [['140', 'go'], [' craftable', 'hi']]],
    ['Satisfactory companion app', 'hi', 'TYPE', 'RECiPES', [['211', 'go'], [' (', 'hi'], ['88', 'go'], [' of them alternates)', 'hi']]],
    ['unofficial fan project', 'hi', 'STATUS', 'BUiLDiNGS', [['477', 'go'], [' player-buildable', 'hi']]],
    ["none. it's Apache 2.0", 'hi', 'PROTECTiON', 'ELEVATOR', [['5', 'go'], [' phases of demands', 'hi']]],
  ];
  const LV = 31, LC = 33, LL = 45, M0 = 47, RL = 50, RC = 62, RV = 64;   // columns
  rows.forEach(([lv, lvInk, ll, rl, rv], i) => {
    const r = R.fields + i;
    if (len(lv) > LV - TXT.c0 + 1) throw new Error(`left value too long: ${lv}`);
    text(r, LV - len(lv) + 1, lv, lvInk);
    text(r, LC, ':', 'fr');
    text(r, LC + 1, '.'.repeat(LL - len(ll) - LC - 1), 'dm');
    text(r, LL - len(ll) + 1, ll, 'fr');
    text(r, M0, '··', 'cy');
    text(r, RL, rl, 'fr');
    text(r, RL + len(rl) + 1, '.'.repeat(RC - RL - len(rl) - 1), 'dm');
    text(r, RC, ':', 'fr');
    if (seg(r, RV, rv) > TXT.c1 + 1) throw new Error(`right value too long in row ${i}`);
  });
}
// A thin rule with a caption, then the three tabs: line leaders ending in a small square.
{
  const cap = ' three tabs. every ingredient, product and machine in them is a link ';
  const c = centre(len(cap));
  hrule(R.tabsRule, TXT.c0, c - 1); text(R.tabsRule, c, cap, 'fr'); hrule(R.tabsRule, c + len(cap), TXT.c1);
  const tabs = [
    ['pu', 'OBJECTiVES', 'pick a Space Elevator phase: the parts it wants, and how many'],
    ['pk', 'iTEMS', 'search as you type: ingredients, rates, machine, cycle time, MW'],
    ['bl', 'BUiLDiNGS', 'every building by tier, what it makes, Mk-by-Mk upgrade paths'],
  ];
  tabs.forEach(([ink, name, what], i) => {
    const r = R.tabs + i;
    put(r, TXT.c0, '■', ink, 'txt');
    text(r, TXT.c0 + 2, name, ink);
    hrule(r, TXT.c0 + 3 + len(name), 20);
    put(r, 21, '■', 'dm', 'txt');
    if (text(r, 23, what, 'fr') > TXT.c1 + 1) throw new Error(`tab text too long: ${what}`);
  });
}
// The two commands, and the way round them.
{
  heading(R.run, 'RUN iT');
  const cmds = [
    ['01', 'python -m pip install -r requirements.txt', 'hi', 'Python 3.10+, from the repo root'],
    ['02', 'python -m streamlit run app/app.py', 'hi', 'then open http://localhost:8501'],
    ['or', 'https://lukexyz.github.io/ULTRA-SATISFACTORY/', 'cy', 'in your browser, zero install'],
  ];
  cmds.forEach(([n, cmd, ink, note], i) => {
    const r = R.cmds + i;
    text(r, TXT.c0, n, 'go');
    hrule(r, TXT.c0 + 3, 11);
    put(r, 12, '■', 'dm', 'txt');
    const end = text(r, 14, cmd, ink);
    const at = TXT.c1 - len(note) + 1;
    if (at < end + 2) throw new Error(`command row ${n} too long`);
    text(r, at, note, 'fr');
  });
}
// The foot, with the artist tag set into the rule at lower right.
{
  caps(R.foot);
  const greet = 'greetz to every spreadsheet that outgrew its factory';
  const tag = 'dr!MRG';
  const c = IN.c0 + 8;
  text(R.foot, c, greet, 'fr');
  const tagAt = IN.c1 - 7 - len(tag);
  hrule(R.foot, c + len(greet) + 1, tagAt - 4);
  put(R.foot, tagAt - 3, '■', 'dm', 'txt');
  text(R.foot, tagAt - 1, tag, 'go');
}

// ---------------------------------------------------------------------------------------------
// Debris: small squares, half blocks, dots and 2-4 cell shards, thinning out with distance from
// the logo. Nothing lands inside a counter or directly above or below a letter (a half block
// sitting on top of an A reads as an accent), so it gathers on the flanks and between the tails.
// ---------------------------------------------------------------------------------------------
const drifters = [];                                  // the path each loose square takes
const DRIFT = [[1, 1], [-1, 1], [1, -1], [-1, -1]];   // [dx, dy] in cells
{
  const rnd = prng(0x21AC0DE);
  const logo = [];
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (scr[r][c] && /^(logo|f\d|d[AB])/.test(scr[r][c].layer)) logo.push([r, c]);
  const dist = (r, c) => {
    let d = 99;
    for (const [lr, lc] of logo) { const dd = Math.hypot(c - lc, (r - lr) * 2); if (dd < d) d = dd; }
    return d;
  };
  const ultraBox = { r0: R.ultra, r1: R.ultra + BIG_H - 1, c0: ULTRA_C - 1, c1: ULTRA_C + ULTRA_W };
  const inside = (b, r, c) => r >= b.r0 && r <= b.r1 && c >= b.c0 && c <= b.c1;
  const squares = [];
  const scatter = (r0, r1, near, far, density, ink, kinds) => {
    const free = (r, c) => c >= IN.c0 + 1 && c <= IN.c1 - 1 && !scr[r][c] && !inside(ultraBox, r, c) && dist(r, c) >= near;
    for (let r = r0; r <= r1; r++) {
      for (let c = IN.c0 + 1; c <= IN.c1 - 1; c++) {
        if (!free(r, c)) continue;
        const d = dist(r, c);
        if (d > far || rnd() > density * (1 - (d - near) / (far - near + 1))) continue;
        const k = kinds[Math.floor(rnd() * kinds.length)];
        if (k === 'shard') {                // 2-4 cells of one half block
          const n = 2 + Math.floor(rnd() * 3), ch = rnd() < 0.5 ? '▀' : '▄';
          for (let i = 0; i < n && free(r, c + i); i++) put(r, c + i, ch, ink, 'art');
        } else if (k === 'half') put(r, c, rnd() < 0.5 ? '▄' : '▀', ink, 'art');
        else if (k === 'square') { put(r, c, '■', ink, 'art'); squares.push([r, c]); }
        else put(r, c, '·', ink, 'art');
      }
    }
  };
  // Round ULTRA and between its tails: everything. Under SATISFACTORY: crumbs only.
  scatter(R.cap + 1, R.frame - 1, 3, 10, 0.27, 'cy', ['shard', 'half', 'half', 'square', 'square', 'dot', 'dot']);
  scatter(R.satis + 6, R.satis + 6, 2, 4, 0.14, 'wh', ['square', 'dot', 'dot']);
  // A few of the small squares round ULTRA come loose: each gets a layer of its own so it can
  // drift two cells and fade, along whichever of three paths crosses only empty cells.
  for (const [r, c] of squares) {
    if (drifters.length === 9 || r >= R.frame) continue;
    const clear = (rr, cc) => rr > R.cap && rr < R.frame && cc > IN.c0 && cc < IN.c1 && !scr[rr][cc];
    const n = drifters.length;
    for (let j = 0; j < DRIFT.length; j++) {
      const k = (n + j) % DRIFT.length, [dx, dy] = DRIFT[k];
      if (!(clear(r, c + dx) && clear(r + dy, c + dx) && clear(r + dy, c + 2 * dx))) continue;
      scr[r][c].layer = `db${n}`;
      drifters.push(k);
      break;
    }
  }
}
hruleFree(R.frame, IN.c0 + 4, IN.c1 - 4, 'bc');

// ---------------------------------------------------------------------------------------------
// Background bands: broken runs of light shade behind the logo, the full width between the walls.
// They scroll sideways one cell at a time; the cells the logo occupies are knocked out of them.
// ---------------------------------------------------------------------------------------------
const BAND_PERIOD = 48;
const bands = [];
{
  const rnd = prng(0xBA2D5);
  const mk = (r, ink, group) => {
    const cells = new Uint8Array(BAND_PERIOD);
    let c = 0;
    while (c < BAND_PERIOD) {
      const run = 4 + Math.floor(rnd() * 12), gap = 1 + Math.floor(rnd() * 4);
      for (let i = 0; i < run && c < BAND_PERIOD - 1; i++) cells[c++] = 1;
      c += gap;
    }
    bands.push({ r, ink, group, cells });
  };
  mk(R.ultra + 2, 'bc', 'bL'); mk(R.ultra + 3, 'bc', 'bL'); mk(R.ultra + 4, 'bc', 'bR');
  mk(R.satis + 2, 'bg', 'bR'); mk(R.satis + 3, 'bg', 'bL');
}

// ---------------------------------------------------------------------------------------------
// Emit
// ---------------------------------------------------------------------------------------------
if (process.argv.includes('--dump')) {
  console.log(scr.map((row, r) => row.map((cell, c) => {
    if (cell) return cell.ch;
    const b = bands.find((x) => x.r === r);
    return b && c >= IN.c0 && c <= IN.c1 && b.cells[c % BAND_PERIOD] ? '░' : ' ';
  }).join('').replace(/\s+$/, '')).join('\n'));
}

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
// Greedy rectangle merge over a w x h bitmap (Uint8Array), scaled to pixels.
function gridPath(bits, w, h, sx, sy) {
  return bitmapPath(Array.from({ length: h }, (_, y) => (x) => bits[y * w + x]), w, sx, sy);
}
// Everything on one layer, as path data: solid geometry per ink, each shade per ink, and glyphs.
function layerParts(name) {
  const solid = new Map(), shade = new Map(), uses = new Map();
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = scr[r][c];
      if (!cell || cell.layer !== name) continue;
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
function layerSvg(name) {
  const p = layerParts(name);
  return p.solid.map(({ ink, d }) => `<path fill="${INK[ink]}" d="${d}"/>`).join('')
    + p.shade.map(({ ink, tone, d }) => `<path fill="${pat(ink, tone)}" d="${d}"/>`).join('')
    + p.uses.map(({ ink, u }) => `<g fill="${INK[ink]}">${u}</g>`).join('');
}

const layers = [];

// 1. Bands, clipped to the space between the walls, then the knock-out.
{
  defs.push(`<clipPath id="in"><rect x="${IN.c0 * CW}" y="0" width="${(IN.c1 - IN.c0 + 1) * CW}" height="${SH}"/></clipPath>`);
  const groups = new Map();
  for (const b of bands) {
    let d = '';
    for (let c = 0; c < COLS + BAND_PERIOD;) {
      if (!b.cells[c % BAND_PERIOD]) { c++; continue; }
      const c0 = c;
      while (c < COLS + BAND_PERIOD && b.cells[c % BAND_PERIOD]) c++;
      d += `M${c0 * CW} ${b.r * CH}h${(c - c0) * CW}v${CH}h${-(c - c0) * CW}z`;
    }
    groups.set(b.group, (groups.get(b.group) || '') + `<path fill="${pat(b.ink, 1)}" d="${d}"/>`);
  }
  let g = '';
  for (const [cls, body] of groups) g += `<g class="${cls}">${body}</g>`;
  layers.push(`<g clip-path="url(#in)">${g}</g>`);
  const px = BAND_PERIOD * CW;
  css.push(`.bL{animation:bL 40s steps(${BAND_PERIOD}) infinite}.bR{transform:translateX(${-px}px);animation:bR 64s steps(${BAND_PERIOD}) infinite}`);
  css.push(`@keyframes bL{to{transform:translateX(${-px}px)}}@keyframes bR{to{transform:translateX(0)}}`);

  // Knock-out: every occupied cell in a band row, widened by one cell each side.
  const ko = new Uint8Array(COLS * ROWS);
  for (const b of bands) for (let c = 0; c < COLS; c++) if (scr[b.r][c]) for (let k = -1; k <= 1; k++) if (c + k >= 0 && c + k < COLS) ko[b.r * COLS + c + k] = 1;
  layers.push(`<path fill="#000" d="${gridPath(ko, COLS, ROWS, CW, CH)}"/>`);
}

// 2. Static art: walls, caps, debris, headings.
layers.push(layerSvg('art'));

// 3. The logo. Its geometry is drawn in its inks, and again in white as the mask for the
//    highlight that sweeps across it (so the glint lights only the dither dots of a shaded cell,
//    never the black between them).
{
  let ink = '', mask = '';
  for (const name of ['logoU', 'logoS']) {
    const p = layerParts(name);
    p.solid.forEach(({ ink: k, d }) => {
      defs.push(`<path id="${name}" d="${d}"/>`);
      ink += `<use href="#${name}" fill="${INK[k]}"/>`;
      mask += `<use href="#${name}" fill="#fff"/>`;
    });
    p.shade.forEach(({ ink: k, tone, d }, i) => {
      defs.push(`<path id="${name}${i}" d="${d}"/>`);
      ink += `<use href="#${name}${i}" fill="${pat(k, tone)}"/>`;
      mask += `<use href="#${name}${i}" fill="${pat('mk', tone)}"/>`;
    });
  }
  const y0 = R.ultra * CH, rows = R.satis + 6 - R.ultra;
  defs.push(`<mask id="lm" maskUnits="userSpaceOnUse" x="0" y="${y0}" width="${SW}" height="${rows * CH}">${mask}</mask>`);
  layers.push(ink);

  // The dissolve: the tail rows dim one after another, and two sets of dots swap places.
  for (let d = 0; d < TAIL_H; d++) layers.push(`<g class="fz f${d}">${layerSvg(`f${d}`)}</g>`);
  layers.push(`<g class="dA">${layerSvg('dA')}</g><g class="dB">${layerSvg('dB')}</g>`);
  css.push(`.fz{animation:fz 5.6s step-end infinite}.f1{animation-delay:.2s}.f2{animation-delay:.4s}.f3{animation-delay:.6s}`);
  css.push(`@keyframes fz{0%{opacity:1}80%{opacity:.3}85%{opacity:1}}`);
  css.push(`.dA{animation:dA 2.4s step-end infinite}.dB{opacity:0;animation:dB 2.4s step-end infinite}`);
  css.push(`@keyframes dA{0%{opacity:1}50%{opacity:0}}@keyframes dB{0%{opacity:0}50%{opacity:1}}`);

  // The glint: a diagonal band quantised to the cell grid (one cell further left on each row
  // down), moving a cell at a time. It rests off to the left, which is also its reduced-motion pose.
  let halo = '', core = '';
  for (let i = 0; i < rows; i++) {
    const y = (R.ultra + i) * CH, x = -i * CW;
    halo += `M${x} ${y}h${7 * CW}v${CH}h${-7 * CW}z`;
    core += `M${x + 2 * CW} ${y}h${3 * CW}v${CH}h${-3 * CW}z`;
  }
  const x0 = -6 * CW, steps = 122, x1 = x0 + steps * CW;
  layers.push(`<g mask="url(#lm)"><g class="sw" fill="#fff"><path opacity=".3" d="${halo}"/><path opacity=".55" d="${core}"/></g></g>`);
  css.push(`.sw{transform:translateX(${x0}px);animation:sw 9s infinite}`);
  css.push(`@keyframes sw{0%{transform:translateX(${x0}px);animation-timing-function:steps(${steps})}30%,100%{transform:translateX(${x1}px)}}`);
}

// 4. Drifting debris.
drifters.forEach((k, i) => {
  layers.push(`<g class="db k${k}" style="animation-delay:${-((i * 1.7) % 9).toFixed(2)}s">${layerSvg(`db${i}`)}</g>`);
});
css.push(`.db{animation:9s step-end infinite}${DRIFT.map((_, k) => `.k${k}{animation-name:k${k}}`).join('')}`);
const drift = (name, dx, dy) => `@keyframes ${name}{0%{opacity:1;transform:translate(0,0)}52%{opacity:1;transform:translate(${dx}px,0)}60%{opacity:.6;transform:translate(${dx}px,${dy}px)}68%{opacity:.3;transform:translate(${2 * dx}px,${dy}px)}76%{opacity:0;transform:translate(${2 * dx}px,${dy}px)}90%{opacity:.4;transform:translate(0,0)}95%{opacity:1;transform:translate(0,0)}}`;
css.push(...DRIFT.map(([dx, dy], k) => drift(`k${k}`, dx * CW, dy * CH)));

// 5. Thin rules and the text.
{
  const by = new Map();
  for (const { r, c0, c1, ink } of rules) by.set(ink, (by.get(ink) || '') + `M${c0 * CW} ${r * CH + 7}h${(c1 - c0 + 1) * CW}v2h${-(c1 - c0 + 1) * CW}z`);
  for (const [ink, d] of by) layers.push(`<path fill="${INK[ink]}" d="${d}"/>`);
  layers.push(layerSvg('txt'));
}

css.push(`@media (prefers-reduced-motion:reduce){*{animation:none!important}}`);

const glyphDefs = [...glyphIds].map(([ch, id]) => `<path id="${id}" d="${glyphPath(FONT.get(ch))}"/>`).join('');

const TITLE = 'ULTRA-SATISFACTORY: a shaded block NFO header';
const DESC = 'A 1990s release-scene NFO screen drawn in block and shade characters. ULTRA stands in cyan slab capitals with a dark dithered band on the shadow side of every stroke; below the baseline each stem dissolves through dark, medium and light dither into single dots. '
  + 'Under it SATISFACTORY is set in grey two-tone condensed capitals, with debris around both words, broken bands of light shade behind them, and frame walls stacked from fading shade blocks down both margins. '
  + 'Caption: every recipe, building and objective, one click apart. Field rows: release ULTRA-SATISFACTORY, type Satisfactory companion app, status unofficial fan project, protection none (it is Apache 2.0); '
  + '140 craftable items, 211 recipes of which 88 are alternates, 477 player-buildable buildings, 5 Space Elevator phases. Three tabs: Objectives, Items, Buildings. '
  + 'Run it: python -m pip install -r requirements.txt, then python -m streamlit run app/app.py, or open https://lukexyz.github.io/ULTRA-SATISFACTORY/ in a browser. Presented by the invented crew Merged Cells, signed dr!MRG.';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VBW} ${VBH}" width="${VBW}" height="${VBH}" role="img" aria-labelledby="t d">
<title id="t">${TITLE}</title>
<desc id="d">${DESC}</desc>
<style>${css.join('\n')}</style>
<defs>${glyphDefs}${defs.join('')}</defs>
<rect x=".5" y=".5" width="${VBW - 1}" height="${VBH - 1}" rx="10" fill="#000" stroke="#30363d"/>
<g transform="translate(${PAD} ${PAD})">
${layers.join('\n')}
</g>
</svg>
`;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, svg);
console.log(`wrote ${path.relative(process.cwd(), OUT)} (${(svg.length / 1024).toFixed(1)} KB, ${glyphIds.size} glyphs)`);
