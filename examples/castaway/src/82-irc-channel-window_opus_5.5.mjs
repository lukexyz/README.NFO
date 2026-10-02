#!/usr/bin/env node
// Castaway README header: "IRC Channel Window" (82-irc-channel-window_opus_5.5), style catalogue
// entry hack-11 (the Windows IRC client of about 1995-2005: a channel log, a nick list, the topic
// in the title bar, a bot pasting colour-cell pictures, and a netsplit).
//
//   node examples/castaway/src/82-irc-channel-window_opus_5.5.mjs
//
// Regenerates, next to this file in ../assets/:
//   82-irc-channel-window_opus_5.5.svg    the banner (880 x 676; shown at width 100% it is close to 1:1)
// The .md beside the assets is hand-written, not generated.
// Debug: --freeze=SECONDS --out=FILE writes one still frame of the loop to FILE instead.
//
// Plain Node, no dependencies, deterministic (one seeded PRNG for the sea glints, no clock).
//
// What is invented here and what is not
//   The client ("KelpChat"), the network ("AtollNet", servers shore.atoll.irc and tide.atoll.irc),
//   the bot ("tidebot"), the reader's nick ("Guest1992", after the default seed) and every icon
//   are made up for this banner. No real client's name, icon, menus or event wording are used;
//   the window chrome is generic 9x-style grey. The colour art is drawn from scratch in the
//   documented IRC colour indices (0-15 plus a few of the extended 16-98), nothing is copied from
//   any art archive. The castaway is the project's own character in her own outfit.
//
// How it is built
//   Text pane: my own fixed-pitch 8x15 bitmap font (2-pixel stems, 1-pixel bars, like the system
//   fonts such clients used), one <path> per glyph, placed with <use>. No <text> anywhere.
//   Chrome: a small proportional pixel sans (borrowed from 62-instant-messenger, plus a few glyphs).
//   Colour art: each pasted line is a row of character cells; every cell is either a coloured
//   space or an upper-half block with two colours, so the picture is a 60 x 40 grid of half-cell
//   pixels. Runs are merged into one path per colour per line.
//   The log: one period of P lines is drawn after the last R lines of the previous period, and a
//   single CSS animation steps the whole log up one line per new message. After P lines the view
//   is identical to the first frame, so the 60-second loop has no seam. The bot pastes the full
//   picture at the end of each period and a small logo plate half way, so the name CASTAWAY is
//   on screen nearly all the time. The nick list, the user count, the topic in the title bar,
//   the typing in the input box and one switchbar highlight are all stepped keyframes on the
//   same 60-second clock. 60 s is also the length of the project's theme loop, and her three
//   "nods to the beat" lines arrive one beat apart at the theme's 80 BPM (0.75 s).
//   prefers-reduced-motion: every animation stops on the first frame, which already shows the
//   picture, the logo, the run command, the sound line and the topic.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '82-irc-channel-window_opus_5.5';
const OUT_SVG = path.join(HERE, '..', 'assets', `${SLUG}.svg`);

const ARGS = Object.fromEntries(process.argv.slice(2).filter((a) => a.startsWith('--')).map((a) => {
  const [k, ...v] = a.slice(2).split('=');
  return [k, v.length ? v.join('=') : true];
}));
const FREEZE = ARGS.freeze !== undefined ? Number(ARGS.freeze) : null;
const OUT = ARGS.out ? path.resolve(String(ARGS.out)) : OUT_SVG;

// ------------------------------------------------------------------------------ helpers
const r1 = (n) => { const s = (Math.round(n * 10) / 10).toString(); return s === '-0' ? '0' : s; };
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = mulberry32(1992);

// ------------------------------------------------------------------------------ colours
// IRC colour indices 0-15 as published for the classic client, and the few extended (16-98)
// indices the picture uses, as listed in the modern IRC formatting documentation.
const IRC16 = ['#ffffff', '#000000', '#00007f', '#009300', '#ff0000', '#7f0000', '#9c009c', '#fc7f00',
  '#ffff00', '#00fc00', '#009393', '#00ffff', '#0000fc', '#ff00ff', '#7f7f7f', '#d2d2d2'];
const EXT = {
  29: '#743a00', 32: '#007400', 35: '#004074', 41: '#b56300', 44: '#00b500', 46: '#00b5b5',
  47: '#0063b5', 53: '#ff8c00', 59: '#008cff', 64: '#ff5959', 65: '#ffb459', 67: '#cfff60',
  70: '#6dffff', 71: '#59b4ff', 72: '#5959ff', 76: '#ff9c9c', 77: '#ffd39c', 78: '#ffff9c',
  80: '#9cff9c', 82: '#9cffff', 83: '#9cd3ff', 84: '#9c9cff', 86: '#ff9cff', 97: '#e2e2e2',
};
function col(n) {
  if (n < 16) return IRC16[n];
  if (EXT[n]) return EXT[n];
  throw new Error(`no colour ${n}`);
}

// Window chrome greys (generic 9x style).
const UI = {
  face: '#c0c0c0', light: '#dfdfdf', white: '#ffffff', shadow: '#808080', dark: '#000000',
  titleA: '#000080', titleB: '#1084d0', desk: '#1f7a77', deskHi: '#2a8f8b',
};

// ------------------------------------------------------------------------------ geometry
const CW = 8, CH = 15;                 // text cell
const COLS = 84;                       // chat pane width in cells
const R = 34;                          // visible log rows
const NICK_COLS = 16;
const PAD = 14;                        // desktop margin around the window
const FRAME = 4;                       // window frame thickness
const TITLE_H = 18, MENU_H = 19, TOOL_H = 28, SWITCH_H = 25;
const SB_W = 16;                       // scrollbar
const CHAT_BOX_W = COLS * CW + 4 + 6 + SB_W + 1;
const NICK_BOX_W = NICK_COLS * CW + 4 + 6;
const SPLIT = 3;
const CLIENT_W = CHAT_BOX_W + SPLIT + NICK_BOX_W;
const WIN_W = CLIENT_W + 2 * FRAME + 4;
const W = WIN_W + 2 * PAD;
const CHAT_BOX_H = R * CH + 4 + 4;
const INPUT_H = CH + 8;
const CLIENT_H = CHAT_BOX_H + 3 + INPUT_H;
const WIN_H = FRAME + TITLE_H + 1 + MENU_H + TOOL_H + SWITCH_H + 1 + CLIENT_H + 4 + FRAME;
const H = WIN_H + 2 * PAD;

const T = 60;                          // loop length, seconds (the theme loop is 60 s too)
const pct = (t) => `${+(Math.min(Math.max(t, 0), T) / T * 100).toFixed(2)}%`;

// ------------------------------------------------------------------------------ mono font 8x15
// Rows are '#'/'.' strings placed from row `top` of the 15-row cell. Capitals sit on rows 2-10,
// lowercase x-height is rows 4-10, descenders reach row 13.
const MONO = new Map();
function def(ch, top, rows) {
  const g = new Array(CH).fill('........');
  rows.split(' ').forEach((r, i) => { g[top + i] = r.padEnd(8, '.'); });
  MONO.set(ch, g);
}
const CAPS = {
  A: '..###.. .##.##. ##...## ##...## ##...## ####### ##...## ##...## ##...##',
  B: '######. ##...## ##...## ##...## ######. ##...## ##...## ##...## ######.',
  C: '.#####. ##...## ##..... ##..... ##..... ##..... ##..... ##...## .#####.',
  D: '#####.. ##..##. ##...## ##...## ##...## ##...## ##...## ##..##. #####..',
  E: '####### ##..... ##..... ##..... ######. ##..... ##..... ##..... #######',
  F: '####### ##..... ##..... ##..... ######. ##..... ##..... ##..... ##.....',
  G: '.#####. ##...## ##..... ##..... ##.#### ##...## ##...## ##...## .######',
  H: '##...## ##...## ##...## ##...## ####### ##...## ##...## ##...## ##...##',
  I: '.####.. ..##... ..##... ..##... ..##... ..##... ..##... ..##... .####..',
  J: '...#### .....## .....## .....## .....## .....## ##...## ##...## .#####.',
  K: '##...## ##..##. ##.##.. ####... ###.... ####... ##.##.. ##..##. ##...##',
  L: '##..... ##..... ##..... ##..... ##..... ##..... ##..... ##..... #######',
  M: '##...## ###.### ####### ##.#.## ##...## ##...## ##...## ##...## ##...##',
  N: '##...## ###..## ####.## ##.#### ##..### ##...## ##...## ##...## ##...##',
  O: '.#####. ##...## ##...## ##...## ##...## ##...## ##...## ##...## .#####.',
  P: '######. ##...## ##...## ##...## ######. ##..... ##..... ##..... ##.....',
  Q: '.#####. ##...## ##...## ##...## ##...## ##.#.## ##..### ##..##. .###.##',
  R: '######. ##...## ##...## ##...## ######. ##.##.. ##..##. ##...## ##...##',
  S: '.#####. ##...## ##..... ##..... .#####. .....## .....## ##...## .#####.',
  T: '######. ..##... ..##... ..##... ..##... ..##... ..##... ..##... ..##...',
  U: '##...## ##...## ##...## ##...## ##...## ##...## ##...## ##...## .#####.',
  V: '##...## ##...## ##...## ##...## ##...## .##.##. .##.##. ..###.. ...#...',
  W: '##...## ##...## ##...## ##...## ##.#.## ##.#.## ####### ###.### ##...##',
  X: '##...## ##...## .##.##. ..###.. ..###.. ..###.. .##.##. ##...## ##...##',
  Y: '##...## ##...## ##...## .##.##. ..###.. ..###.. ..###.. ..###.. ..###..',
  Z: '####### .....## ....##. ...##.. ..##... .##.... ##..... ##..... #######',
  0: '.#####. ##...## ##..### ##.#### ####.## ###..## ##...## ##...## .#####.',
  1: '...##.. ..###.. .####.. ...##.. ...##.. ...##.. ...##.. ...##.. .######',
  2: '.#####. ##...## .....## ....##. ...##.. ..##... .##.... ##..... #######',
  3: '.#####. ##...## .....## .....## ..####. .....## .....## ##...## .#####.',
  4: '....##. ...###. ..####. .##.##. ##..##. ####### ....##. ....##. ....##.',
  5: '####### ##..... ##..... ######. .....## .....## .....## ##...## .#####.',
  6: '..####. .##.... ##..... ######. ##...## ##...## ##...## ##...## .#####.',
  7: '####### .....## ....##. ...##.. ..##... ..##... ..##... ..##... ..##...',
  8: '.#####. ##...## ##...## ##...## .#####. ##...## ##...## ##...## .#####.',
  9: '.#####. ##...## ##...## ##...## .###### .....## .....## ....##. .####..',
};
for (const [ch, rows] of Object.entries(CAPS)) def(ch, 2, rows);
const LOWER = {
  a: [4, '.#####. .....## .###### ##...## ##...## ##..### .###.##'],
  b: [2, '##..... ##..... ######. ##...## ##...## ##...## ##...## ##...## ######.'],
  c: [4, '.#####. ##...## ##..... ##..... ##..... ##...## .#####.'],
  d: [2, '.....## .....## .###### ##...## ##...## ##...## ##...## ##...## .######'],
  e: [4, '.#####. ##...## ##...## ####### ##..... ##...## .#####.'],
  f: [2, '...###. ..##... ..##... ######. ..##... ..##... ..##... ..##... ..##...'],
  g: [4, '.###### ##...## ##...## ##...## ##...## ##...## .###### .....## ##...## .#####.'],
  h: [2, '##..... ##..... ######. ##...## ##...## ##...## ##...## ##...## ##...##'],
  i: [2, '..##... ....... .###... ..##... ..##... ..##... ..##... ..##... .####..'],
  j: [2, '....##. ....... ...###. ....##. ....##. ....##. ....##. ....##. ....##. ##..##. .####..'],
  k: [2, '##..... ##..... ##...## ##..##. ##.##.. ####... ##.##.. ##..##. ##...##'],
  l: [2, '.###... ..##... ..##... ..##... ..##... ..##... ..##... ..##... .####..'],
  m: [4, '###.##. ####### ##.#.## ##.#.## ##.#.## ##.#.## ##...##'],
  n: [4, '######. ##...## ##...## ##...## ##...## ##...## ##...##'],
  o: [4, '.#####. ##...## ##...## ##...## ##...## ##...## .#####.'],
  p: [4, '######. ##...## ##...## ##...## ##...## ##...## ######. ##..... ##..... ##.....'],
  q: [4, '.###### ##...## ##...## ##...## ##...## ##...## .###### .....## .....## .....##'],
  r: [4, '##.###. ###..## ##..... ##..... ##..... ##..... ##.....'],
  s: [4, '.###### ##..... ##..... .#####. .....## .....## ######.'],
  t: [2, '..##... ..##... ######. ..##... ..##... ..##... ..##... ..##... ...###.'],
  u: [4, '##...## ##...## ##...## ##...## ##...## ##...## .######'],
  v: [4, '##...## ##...## ##...## ##...## .##.##. ..###.. ...#...'],
  w: [4, '##...## ##...## ##.#.## ##.#.## ##.#.## ####### .##.##.'],
  x: [4, '##...## .##.##. ..###.. ..###.. ..###.. .##.##. ##...##'],
  y: [4, '##...## ##...## ##...## ##...## ##...## ##...## .###### .....## ....##. #####..'],
  z: [4, '####### ....##. ...##.. ..##... .##.... ##..... #######'],
};
for (const [ch, [top, rows]] of Object.entries(LOWER)) def(ch, top, rows);
const PUNCT = {
  '.': [9, '..##... ..##...'],
  ',': [9, '..##... ..##... .##....'],
  ':': [5, '..##... ..##... ....... ....... ..##... ..##...'],
  ';': [5, '..##... ..##... ....... ....... ..##... ..##... .##....'],
  '!': [2, '..##... ..##... ..##... ..##... ..##... ..##... ....... ..##... ..##...'],
  '?': [2, '.#####. ##...## .....## ....##. ...##.. ..##... ....... ..##... ..##...'],
  "'": [2, '..##... ..##... ..##...'],
  '"': [2, '.##.##. .##.##. .##.##.'],
  '-': [6, '.#####.'],
  '_': [12, '########'],
  '/': [2, '......# .....## ....##. ...##.. ..##... .##.... ##..... #......'],
  '\\': [2, '#...... ##..... .##.... ..##... ...##.. ....##. .....## ......#'],
  '|': [1, '..##... ..##... ..##... ..##... ..##... ..##... ..##... ..##... ..##... ..##... ..##... ..##...'],
  '(': [2, '....##. ...##.. ..##... ..##... ..##... ..##... ..##... ...##.. ....##.'],
  ')': [2, '.##.... ..##... ...##.. ...##.. ...##.. ...##.. ...##.. ..##... .##....'],
  '[': [2, '.####.. .##.... .##.... .##.... .##.... .##.... .##.... .##.... .####..'],
  ']': [2, '.####.. ...##.. ...##.. ...##.. ...##.. ...##.. ...##.. ...##.. .####..'],
  '<': [3, '....##. ...##.. ..##... .##.... ..##... ...##.. ....##.'],
  '>': [3, '.##.... ..##... ...##.. ....##. ...##.. ..##... .##....'],
  '#': [2, '.##.##. .##.##. ####### .##.##. .##.##. .##.##. ####### .##.##. .##.##.'],
  '*': [4, '.##.##. ..###.. ####### ..###.. .##.##.'],
  '+': [4, '..##... ..##... ######. ..##... ..##...'],
  '=': [5, '######. ....... ######.'],
  '@': [2, '.#####. ##...## ##.#### ##.#.## ##.#.## ##.#### ##..... ##...## .#####.'],
  '&': [2, '.###... ##.##.. ##.##.. .###... .###.## ##.###. ##..##. ##..##. .###.##'],
  '%': [2, '##...## ##..##. ....##. ...##.. ..##... .##.... .##..## ##...##'],
  '~': [5, '.###.## ##.###.'],
  '^': [2, '..###.. .##.##. ##...##'],
  '♪': [2, '...##... ...###.. ...##.#. ...##... ...##... .####... #####... .###....'],
  '·': [6, '..##... ..##...'],
  '•': [5, '..###.. .#####. .#####. ..###..'],
  '→': [4, '....#.. ....##. ####### ....##. ....#..'],
};
for (const [ch, [top, rows]] of Object.entries(PUNCT)) def(ch, top, rows);
MONO.set(' ', new Array(CH).fill('........'));

// Rows of '#' into one path of merged rectangles (runs merged vertically too).
function bitmapPath(rows, ox = 0, oy = 0) {
  const rects = [];
  let open = new Map();
  rows.forEach((row, y) => {
    const next = new Map();
    for (let x = 0; x < row.length;) {
      if (row[x] !== '#') { x++; continue; }
      let x2 = x;
      while (x2 < row.length && row[x2] === '#') x2++;
      const key = `${x},${x2 - x}`;
      const rc = open.get(key) || (rects.push({ x, y, w: x2 - x, h: 0 }), rects[rects.length - 1]);
      rc.h++;
      next.set(key, rc);
      x = x2;
    }
    open = next;
  });
  return rects.map((r) => `M${ox + r.x} ${oy + r.y}h${r.w}v${r.h}h${-r.w}z`).join('');
}

const monoIds = new Map();
function mid(ch) {
  if (!MONO.has(ch)) throw new Error(`mono font: no glyph for ${JSON.stringify(ch)}`);
  if (!monoIds.has(ch)) monoIds.set(ch, `m${monoIds.size.toString(36)}`);
  return monoIds.get(ch);
}
// <use> elements for a string starting at cell column c (colour from the parent group).
function monoUses(str, c = 0, y = 0) {
  let out = '';
  for (const ch of str) {
    if (ch !== ' ') out += `<use href="#${mid(ch)}"${c ? ` x="${c * CW}"` : ''}${y ? ` y="${y}"` : ''}/>`;
    c++;
  }
  return out;
}
const len = (s) => [...s].length;

// ------------------------------------------------------------------------------ UI font
// Proportional pixel sans for the window chrome (from 62-instant-messenger, plus # [ ] & = %).
// Cap height 8, x-height 6, descenders 2 rows below.
const UIF = {
  A: '..#..|.#.#.|.#.#.|.#.#.|#...#|#####|#...#|#...#',
  B: '####.|#...#|#...#|####.|#...#|#...#|#...#|####.',
  C: '.###.|#...#|#....|#....|#....|#....|#...#|.###.',
  D: '####.|#...#|#...#|#...#|#...#|#...#|#...#|####.',
  E: '####|#...|#...|####|#...|#...|#...|####',
  F: '####|#...|#...|###.|#...|#...|#...|#...',
  G: '.####.|#.....|#.....|#..###|#....#|#....#|#....#|.####.',
  H: '#...#|#...#|#...#|#####|#...#|#...#|#...#|#...#',
  I: '###|.#.|.#.|.#.|.#.|.#.|.#.|###',
  K: '#...#|#..#.|#.#..|##...|##...|#.#..|#..#.|#...#',
  L: '#...|#...|#...|#...|#...|#...|#...|####',
  M: '##...##|##...##|#.#.#.#|#.#.#.#|#..#..#|#..#..#|#.....#|#.....#',
  N: '##...#|##...#|#.#..#|#.#..#|#..#.#|#..#.#|#...##|#...##',
  O: '.####.|#....#|#....#|#....#|#....#|#....#|#....#|.####.',
  P: '####.|#...#|#...#|#...#|####.|#....|#....|#....',
  R: '####.|#...#|#...#|#...#|####.|#..#.|#...#|#...#',
  S: '.####|#....|#....|.###.|....#|....#|....#|####.',
  T: '#####|..#..|..#..|..#..|..#..|..#..|..#..|..#..',
  U: '#...#|#...#|#...#|#...#|#...#|#...#|#...#|.###.',
  V: '#...#|#...#|#...#|.#.#.|.#.#.|.#.#.|..#..|..#..',
  W: '#..#..#|#..#..#|#..#..#|#.#.#.#|#.#.#.#|#.#.#.#|.#...#.|.#...#.',
  Y: '#...#|#...#|.#.#.|.#.#.|..#..|..#..|..#..|..#..',
  a: '....|....|.##.|...#|.###|#..#|#..#|.###',
  b: '#...|#...|###.|#..#|#..#|#..#|#..#|###.',
  c: '....|....|.###|#...|#...|#...|#...|.###',
  d: '...#|...#|.###|#..#|#..#|#..#|#..#|.###',
  e: '....|....|.##.|#..#|####|#...|#...|.###',
  f: '.##|#..|###|#..|#..|#..|#..|#..',
  g: '....|....|.###|#..#|#..#|#..#|#..#|.###|...#|.##.',
  h: '#...|#...|###.|#..#|#..#|#..#|#..#|#..#',
  i: '#|.|#|#|#|#|#|#',
  k: '#...|#...|#..#|#.#.|##..|##..|#.#.|#..#',
  l: '#|#|#|#|#|#|#|#',
  m: '.......|.......|###.##.|#..#..#|#..#..#|#..#..#|#..#..#|#..#..#',
  n: '....|....|###.|#..#|#..#|#..#|#..#|#..#',
  o: '....|....|.##.|#..#|#..#|#..#|#..#|.##.',
  p: '....|....|###.|#..#|#..#|#..#|#..#|###.|#...|#...',
  r: '...|...|#.#|##.|#..|#..|#..|#..',
  s: '....|....|.###|#...|.##.|...#|...#|###.',
  t: '...|.#.|###|.#.|.#.|.#.|.#.|..#',
  u: '....|....|#..#|#..#|#..#|#..#|#..#|.###',
  v: '.....|.....|#...#|#...#|.#.#.|.#.#.|..#..|..#..',
  w: '.......|.......|#..#..#|#..#..#|#.#.#.#|#.#.#.#|.#...#.|.#...#.',
  x: '.....|.....|#...#|.#.#.|..#..|..#..|.#.#.|#...#',
  y: '.....|.....|#...#|#...#|.#.#.|.#.#.|..#..|..#..|.#...|#....',
  0: '.###.|#...#|#...#|#...#|#...#|#...#|#...#|.###.',
  1: '..#..|.##..|..#..|..#..|..#..|..#..|..#..|.###.',
  2: '.###.|#...#|....#|...#.|..#..|.#...|#....|#####',
  3: '.###.|#...#|....#|..##.|....#|....#|#...#|.###.',
  4: '...#.|..##.|.#.#.|#..#.|#####|...#.|...#.|...#.',
  5: '#####|#....|#....|####.|....#|....#|#...#|.###.',
  6: '..##.|.#...|#....|####.|#...#|#...#|#...#|.###.',
  7: '#####|....#|...#.|...#.|..#..|..#..|.#...|.#...',
  8: '.###.|#...#|#...#|.###.|#...#|#...#|#...#|.###.',
  9: '.###.|#...#|#...#|#...#|.####|....#|...#.|.##..',
  '.': '.|.|.|.|.|.|.|#',
  ',': '..|..|..|..|..|..|..|.#|#.',
  ':': '.|.|.|#|.|.|.|#',
  '!': '#|#|#|#|#|#|.|#',
  '-': '...|...|...|...|###|...|...|...',
  '+': '.....|.....|..#..|..#..|#####|..#..|..#..|.....',
  '#': '.#.#.|.#.#.|#####|.#.#.|.#.#.|#####|.#.#.|.#.#.',
  '[': '##|#.|#.|#.|#.|#.|#.|#.|##',
  ']': '##|.#|.#|.#|.#|.#|.#|.#|##',
  '(': '..#|.#.|#..|#..|#..|#..|#..|.#.|..#',
  ')': '#..|.#.|..#|..#|..#|..#|..#|.#.|#..',
  "'": '#|#|.|.|.|.|.|.',
};
function makeUIFont(prefix, { bold = false, space = 3 } = {}) {
  const used = new Map();
  const rowsOf = (ch) => {
    const src = UIF[ch];
    if (src === undefined) throw new Error(`ui font: no glyph for ${JSON.stringify(ch)}`);
    let rows = src.split('|');
    const w = rows[0].length;
    rows.forEach((r, i) => { if (r.length !== w) throw new Error(`ui glyph ${ch} row ${i} is ${r.length} wide, expected ${w}`); });
    if (bold) {
      rows = rows.map((r) => {
        const a = `${r}.`, b = `.${r}`;
        return [...a].map((c, i) => (c === '#' || b[i] === '#' ? '#' : '.')).join('');
      });
    }
    return rows;
  };
  const font = {
    adv: (ch) => (ch === ' ' ? space : rowsOf(ch)[0].length + 1),
    id(ch) {
      const id = prefix + ch.codePointAt(0).toString(36);
      if (!used.has(id)) used.set(id, bitmapPath(rowsOf(ch)));
      return id;
    },
    width: (str) => [...str].reduce((w, ch) => w + font.adv(ch), 0) - 1,
    defs: () => [...used].map(([id, d]) => `<path id="${id}" d="${d}"/>`).join(''),
  };
  return font;
}
const ui = makeUIFont('u');
const uib = makeUIFont('b', { bold: true, space: 4 });
// A run of UI glyphs; (x, y) is the top of the cap height.
function uiText(font, str, x, y, fill, { maxW = Infinity, cls = '', underline = -1 } = {}) {
  const w = font.width(str);
  if (w > maxW) throw new Error(`ui text "${str}" is ${w} px wide, room for ${maxW}`);
  let s = `<g transform="translate(${r1(x)} ${r1(y)})" fill="${fill}"${cls ? ` class="${cls}"` : ''}>`;
  let cx = 0;
  [...str].forEach((ch, i) => {
    if (ch !== ' ') s += `<use href="#${font.id(ch)}"${cx ? ` x="${cx}"` : ''}/>`;
    if (i === underline) s += `<rect x="${cx}" y="9" width="${font.adv(ch) - 1}" height="1"/>`;
    cx += font.adv(ch);
  });
  return `${s}</g>`;
}

// ------------------------------------------------------------------------------ chrome pieces
const rect = (x, y, w, h, fill, extra = '') => `<rect x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h)}" fill="${fill}"${extra}/>`;
// Two-tone 1px bevel: tl colour on top/left, br colour on bottom/right.
function edge(x, y, w, h, tl, br) {
  return rect(x, y, w - 1, 1, tl) + rect(x, y, 1, h - 1, tl) + rect(x, y + h - 1, w, 1, br) + rect(x + w - 1, y, 1, h, br);
}
const raised = (x, y, w, h) => edge(x, y, w, h, UI.light, UI.dark) + edge(x + 1, y + 1, w - 2, h - 2, UI.white, UI.shadow);
const sunken = (x, y, w, h) => edge(x, y, w, h, UI.shadow, UI.white) + edge(x + 1, y + 1, w - 2, h - 2, UI.dark, UI.light);
function button(x, y, w, h, inner = '') {
  return rect(x, y, w, h, UI.face) + raised(x, y, w, h) + inner;
}

// Small bitmaps: '#' pixels, drawn in `fill`.
const bm = (rows, x, y, fill) => `<path fill="${fill}" d="${bitmapPath(rows.split('|'), x, y)}"/>`;
const GLYPH_MIN = '......|......|......|......|......|......|######|######';
const GLYPH_MAX = '#########|#########|#.......#|#.......#|#.......#|#.......#|#.......#|#########';
const GLYPH_RESTORE = '..######|..######|..#....#|######.#|######.#|#....###|#....#..|#....#..|######..';
const GLYPH_CLOSE = '##....##|.##..##.|..####..|...##...|..####..|.##..##.|##....##';

// 16 x 16 icons, one character per pixel.
const ICON_PAL = {
  k: '#000000', w: '#ffffff', g: '#808080', l: '#c0c0c0', y: '#ffff00', o: '#fc7f00', b: '#b56300',
  B: '#5a2d00', G: '#009300', L: '#00e000', d: '#005a00', c: '#00ffff', C: '#008cff', n: '#00007f',
  r: '#ff0000', s: '#ffd39c', S: '#e0b070', m: '#b5006b', p: '#ff59bc', P: '#ff5959', u: '#0000fc',
};
const ICONS = {
  bolt: [
    '................', '.......kkkkk....', '......kyyyyk....', '......kyyyk.....', '.....kyyyk......',
    '.....kyyykkkk...', '....kyyyyyyyk...', '....kkkkyyyk....', '.......kyyk.....', '......kyyk......',
    '......kyk.......', '.....kyk........', '.....kk.........', '....k...........', '................', '................'],
  crate: [
    '................', '.BBBBBBBBBBBBBB.', '.BooooooooooooB.', '.BoBBBBBBBBBBoB.', '.BoBbbbbbbbBBoB.',
    '.BoBbbbbbbBbBoB.', '.BoBbbbbbBbbBoB.', '.BoBbbbbBbbbBoB.', '.BoBbbbBbbbbBoB.', '.BoBbbBbbbbbBoB.',
    '.BoBbBbbbbbbBoB.', '.BoBBbbbbbbbBoB.', '.BoBBBBBBBBBBoB.', '.BooooooooooooB.', '.BBBBBBBBBBBBBB.', '................'],
  list: [
    '................', '..kkkkkkkkkk....', '..kwwwwwwwwkk...', '..kwwwwwwwwkwk..', '..kwwnwwnwwkkkk.',
    '..kwnnnnnnnwwwk.', '..kwwnwwnwwwwwk.', '..kwwnwwnwwwwwk.', '..kwnnnnnnnwwwk.', '..kwwnwwnwwwwwk.',
    '..kwwwwwwwwwwwk.', '..kwgggggggggwk.', '..kwwwwwwwwwwwk.', '..kwgggggggwwwk.', '..kkkkkkkkkkkkk.', '................'],
  bottle: [
    '................', '.......bb.......', '.......bb.......', '......kGGk......', '......kGLk......',
    '.....kGGGGk.....', '....kGLGGGGk....', '....kGLwwwGk....', '....kGLwkwGk....', '....kGLwwwGk....',
    '....kGLwkwGk....', '....kGLwwwGk....', '....kGLGGGGk....', '....kGGGGGGk....', '.....kkkkkk.....', '................'],
  coconut: [
    '................', '................', '.....BBBBBB.....', '....BbbbbbbB....', '...BbobbbbbbB...',
    '..BbobbbbbbbbB..', '..BbbbbbbbbbbB..', '..BbbbBbbBbbbB..', '..BbbbbbbbbbbB..', '..BbbbbBbbbbbB..',
    '..BBbbbbbbbbBB..', '...BBbbbbbbBB...', '....BBBBBBBB....', '................', '................', '................'],
  phones: [
    '................', '....kkkkkkkk....', '...kwwwwwwwwk...', '..kwkkkkkkkkwk..', '..kwk......kwk..',
    '..kwk......kwk..', '..kwk......kwk..', '.kkwkk....kkwkk.', 'kwwwwk....kwwwwk', 'kwlwwk....kwwlwk',
    'kwlwwk....kwwlwk', 'kwlwwk....kwwlwk', 'kwwwwk....kwwwwk', '.kkkk......kkkk.', '................', '................'],
  turtle: [
    '................', '.......dd.......', '......dLLd......', '.......dd.......', '..dd.dddddd.dd..',
    '..dLddGGGGddLd..', '...ddGdGGdGdd...', '....dGGddGGd....', '....dGdGGdGd....', '....dGGddGGd....',
    '...ddGdGGdGdd...', '..dLddGGGGddLd..', '..dd.dddddd.dd..', '.......dd.......', '................', '................'],
  palm: [
    '................', '....GGG.GGG.....', '..GGLLLGLLLGG...', '.GL..GLGLG..LG..', '.G..G.bGb.G..G..',
    '....G..b...G....', '.......b........', '........b.......', '........b.......', '........b.......',
    '.......b........', '.......b........', '......SbSS......', '...ssssssssss...', '.CCCCCCCCCCCCCC.', '................'],
  sun: [
    '................', '.......y........', '..y....y....y...', '...y.......y....', '......ooo.......',
    '.....oyyyo......', '....oyyyyyo.....', 'yy..oyyyyyo..yy.', '....oyyyyyo.....', '.....oyyyo......',
    '......ooo.......', '...y.......y....', '..y....y....y...', '.......y........', '................', '................'],
  kumara: [
    '................', '..........GG....', '.........GLG....', '..........G.....', '......mmmm......',
    '....mmpmmmmm....', '...mpmmmmmmmm...', '..mmmmmmmmmpmm..', '..mmmmpmmmmmmm..', '...mmmmmmmmmm...',
    '....mmmmmpmm....', '......mmmm......', '................', '................', '................', '................'],
  chan: [
    '................', '..kkkkkkkkkkkk..', '.kwwwwwwwwwwwwk.', '.kwwnwwwnwwwwwk.', '.kwnnnnnnnnwwwk.',
    '.kwwnwwwnwwwwwk.', '.kwwnwwwnwwwwwk.', '.kwnnnnnnnnwwwk.', '.kwwnwwwnwwwwwk.', '.kwwwwwwwwwwwwk.',
    '..kkkkkkkkkkkk..', '....kwk.........', '....kk..........', '....k...........', '................', '................'],
  app: [
    '................', '.kkkkkkkkkkkk...', 'kwwwwwwwwwwwwk..', 'kwwwwwwGwwwwwk..', 'kwwwwwGLGGwwwk..',
    'kwwwGGLwbwGGwk..', 'kwwGwwwwbwwwGk..', 'kwwwwwwwbwwwwk..', 'kwwwwwwbwwwwwk..', 'kwwwwwSbSSwwwk..',
    'kwwCCCCCCCCCwk..', '.kkkkkkwkkkkk...', '......kwk.......', '......kk........', '......k.........', '................'],
};
function icon(name, x, y) {
  const rows = ICONS[name];
  if (!rows || rows.length !== 16) throw new Error(`icon ${name} needs 16 rows`);
  const byCol = new Map();
  rows.forEach((row, yy) => {
    if (row.length !== 16) throw new Error(`icon ${name} row ${yy} is ${row.length} wide`);
    [...row].forEach((c, xx) => {
      if (c === '.') return;
      if (!ICON_PAL[c]) throw new Error(`icon ${name}: no colour for ${c}`);
      if (!byCol.has(c)) byCol.set(c, Array.from({ length: 16 }, () => new Array(16).fill('.')));
      byCol.get(c)[yy][xx] = '#';
    });
  });
  return [...byCol].map(([c, g]) => `<path fill="${ICON_PAL[c]}" d="${bitmapPath(g.map((r) => r.join('')), x, y)}"/>`).join('');
}

// ------------------------------------------------------------------------------ colour art
const canvas = (w, h, fill) => Array.from({ length: h }, () => new Array(w).fill(fill));
function put(cv, x, y, c) {
  x = Math.round(x); y = Math.round(y);
  if (y >= 0 && y < cv.length && x >= 0 && x < cv[0].length) cv[y][x] = c;
}
function ellipse(cv, cx, cy, rx, ry, c) {
  for (let y = 0; y < cv.length; y++) for (let x = 0; x < cv[0].length; x++) {
    if (((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1) cv[y][x] = typeof c === 'function' ? c(x, y, cv[y][x]) : c;
  }
}
function quad(p0, p1, p2, steps = 40) {
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps, u = 1 - t;
    pts.push([u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0], u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1], t]);
  }
  return pts;
}

// Letters for the big name: 6 x 10 half-cells (W is 8 wide), 2-cell stems, rounded corners.
const BIG = {
  C: ['.#####', '######', '##....', '##....', '##....', '##....', '##....', '##....', '######', '.#####'],
  A: ['.####.', '######', '##..##', '##..##', '##..##', '######', '######', '##..##', '##..##', '##..##'],
  S: ['.#####', '######', '##....', '##....', '#####.', '.#####', '....##', '....##', '######', '#####.'],
  T: ['######', '######', '..##..', '..##..', '..##..', '..##..', '..##..', '..##..', '..##..', '..##..'],
  W: ['##....##', '##....##', '##....##', '##....##', '##.##.##', '##.##.##', '##.##.##', '########', '.######.', '.##..##.'],
  Y: ['##..##', '##..##', '##..##', '##..##', '######', '.####.', '..##..', '..##..', '..##..', '..##..'],
};
// Lay CASTAWAY out; returns per-letter masks with x offsets. One cell between letters.
function nameLayout(x0) {
  const out = [];
  let x = x0;
  for (const ch of 'CASTAWAY') {
    out.push({ ch, x, rows: BIG[ch] });
    x += BIG[ch][0].length + 1;
  }
  return { letters: out, width: x - x0 - 1 };
}
// Stamp the name: shadow, then a one-pixel outline, then the fill (fill(letterIndex, row) -> colour).
function stampName(cv, x0, y0, fill, outline, shadow) {
  const L = nameLayout(x0);
  const H = cv.length, Wd = cv[0].length;
  const mask = canvas(Wd, H, false);
  L.letters.forEach((lt) => lt.rows.forEach((row, yy) => [...row].forEach((c, xx) => {
    if (c === '#') mask[y0 + yy][lt.x + xx] = true;
  })));
  const at = (m, x, y) => y >= 0 && y < H && x >= 0 && x < Wd && m[y][x];
  const ring = canvas(Wd, H, false);
  for (let y = 0; y < H; y++) for (let x = 0; x < Wd; x++) {
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (at(mask, x + dx, y + dy)) ring[y][x] = true;
  }
  if (shadow !== null) {
    for (let y = 0; y < H; y++) for (let x = 0; x < Wd; x++) if (!ring[y][x] && at(ring, x - 1, y - 1)) put(cv, x, y, shadow);
  }
  for (let y = 0; y < H; y++) for (let x = 0; x < Wd; x++) if (ring[y][x]) put(cv, x, y, outline);
  L.letters.forEach((lt, i) => lt.rows.forEach((row, yy) => [...row].forEach((c, xx) => {
    if (c === '#') put(cv, lt.x + xx, y0 + yy, fill(i, yy));
  })));
  return L;
}

const AW = 60;                         // picture width in cells (the classic pastes run 37-54; this one is a little wider)
const AH = 40;                         // picture height in half-cells (20 lines)

function drawIsland() {
  const A = canvas(AW, AH, 59);
  // sky, in three bands with a checker of the two neighbours where they meet
  // sky, in three bands whose edges roll gently, like the stepped gradients of pasted art
  for (let y = 0; y < 15; y++) for (let x = 0; x < AW; x++) {
    const e1 = 3 + Math.round(Math.sin(x / 3.2) * 0.9), e2 = 7 + Math.round(Math.sin(x / 4.1 + 1.7) * 0.9);
    A[y][x] = y < e1 ? 59 : y < e2 ? 71 : 83;
  }
  // sun with a pale core
  ellipse(A, 54, 4, 3.3, 3.1, 8);
  ellipse(A, 53.6, 3.6, 1.7, 1.5, 78);
  // clouds, drawn by hand: w white, g shaded underside
  const sprite = (rows, x0, y0, pal) => rows.forEach((row, yy) => [...row].forEach((c, xx) => { if (c !== '.') put(A, x0 + xx, y0 + yy, pal[c]); }));
  const CLOUD = { w: 0, g: 97, l: 15 };
  sprite([
    '.......www............',
    '....wwwwwwww...www....',
    '...wwwwwwwwwwwwwwww...',
    '.wwwwwwwwwwwwwwwwwwww.',
    'wwwwwwwwwwwwwwwwwwwwww',
    'gggglwwwggggglwwgggg..',
  ], 0, 8, CLOUD);
  sprite([
    '....www.....',
    '..wwwwwww.w.',
    '.wwwwwwwwwww',
    'ggglwgggglgg',
  ], 47, 9, CLOUD);
  // distant birds
  for (const [bx, by] of [[6, 4], [11, 2]]) { put(A, bx, by, 14); put(A, bx + 1, by + 1, 14); put(A, bx + 2, by, 14); }
  // the sea
  for (let y = 15; y < AH; y++) for (let x = 0; x < AW; x++) {
    const e = 30 + Math.round(Math.sin(x / 2.6) * 1.2);
    A[y][x] = y === 15 ? 47 : y < e ? 59 : 47;
  }
  // a ship on the horizon, minding its own business
  sprite(['..r...', '.www..', 'kkkkkk'], 42, 12, { r: 4, w: 0, k: 14 });
  // glints on the water (seeded, so the same every run)
  for (let y = 17; y < 26; y += 2) {     // none under the name, where they read as specks on its outline
    for (let x = Math.floor(rng() * 9); x < AW; x += 7 + Math.floor(rng() * 9)) {
      const deep = A[y][x] === 47;
      const n = 1 + Math.floor(rng() * 3);
      for (let k = 0; k < n; k++) put(A, x + k, y, deep ? 59 : 71);
      if (!deep && rng() < 0.35) put(A, x + 1, y - 1, 0);
    }
  }
  // the island: turquoise shallows, a ring of foam, sand with a shaded lower edge
  const IX = 31, IY = 20.6;
  ellipse(A, IX, IY + 0.3, 17.5, 4.7, 46);
  ellipse(A, IX, IY + 0.2, 15.6, 4.0, 70);
  ellipse(A, IX, IY, 14.0, 3.4, 0);
  ellipse(A, IX, IY, 12.8, 2.8, (x, y) => (y >= IY + 1.6 ? 65 : y >= IY + 0.6 ? 77 : 78));
  // bushes at the foot of the palm and by the shore
  for (const [bx, by, c] of [[34, 19, 32], [35, 19, 44], [36, 18, 44], [33, 19, 44], [40, 19, 32], [41, 19, 44], [42, 20, 32], [21, 20, 44], [22, 20, 32], [22, 19, 44]]) put(A, bx, by, c);
  // the raft, logs end-on, lashed with rope
  for (let x = 7; x <= 14; x++) {
    for (let y = 20; y <= 22; y++) put(A, x, y, x % 2 ? 41 : 29);
    if (x % 2 === 0) put(A, x, 21, 78);
    put(A, x, 23, 0);
  }
  put(A, 6, 22, 0); put(A, 15, 22, 0);
  // a bottle, bobbing
  put(A, 50, 22, 32); put(A, 51, 22, 44); put(A, 52, 22, 44); put(A, 53, 22, 41); put(A, 51, 23, 0);
  // the palm: a leaning, ringed trunk
  const trunk = quad([39, 20], [41, 11], [35, 4], 60);
  for (const [x, y, t] of trunk) {
    const ring = Math.round(y) % 3 === 0;
    put(A, x, y, ring ? 29 : 41);
    if (t < 0.55) put(A, x + 1, y, 29);
  }
  // fronds: dark underside, leaf, light upper edge, hanging leaflets
  const crown = [35, 4];
  const fronds = [
    [[28, 0], [20, 7]], [[30, 2], [24, 10]], [[42, 0], [50, 6]], [[40, 3], [45, 10]],
    [[32, -1], [27, -1]], [[38, -2], [42, -1]], [[34, 7], [31, 10]], [[37, 7], [38, 10]],
  ];
  for (const [p1, p2] of fronds) {
    const pts = quad(crown, p1, p2, 30);
    pts.forEach(([x, y, t], i) => { if (t > 0.15 && i % 2 === 0) { put(A, x, y + 1, 32); if (t > 0.3) put(A, x, y + 2, 32); } });
    pts.forEach(([x, y]) => put(A, x, y, 44));
    pts.forEach(([x, y, t]) => { if (t > 0.1 && t < 0.7) put(A, x, y - 1, 67); });
  }
  put(A, 34, 5, 29); put(A, 36, 5, 29); put(A, 35, 6, 5);
  // her: brown low bun, cream headphones, coral tank top, cream shorts, bare feet
  sprite([
    '.hhh.',
    'whhhw',
    'wsssw',
    'h.s..',
    '.ccc.',
    'scccs',
    'scccs',
    '.kkk.',
    '.s.s.',
    '.s.s.',
  ], 25, 11, { h: 29, w: 0, s: 77, c: 64, k: 97 });
  // the name, written on the water
  stampName(A, 1, 28, (i, yy) => (yy === 0 ? 78 : yy <= 3 ? 8 : yy <= 6 ? 53 : 64), 1, 2);
  return A;
}

// The smaller logo plate the bot pastes on request: rainbow letters on black, one text line.
function drawPlate() {
  const P = canvas(AW, 12, 1);
  const RAIN = [[4, 76], [7, 65], [8, 78], [9, 80], [11, 82], [72, 84], [13, 86], [4, 76]];
  stampName(P, 1, 1, (i, yy) => (yy <= 2 ? RAIN[i][1] : RAIN[i][0]), 1, null);
  return P;
}

// One pasted line of art: bottom-half colours as full-height runs, top halves laid over them.
function artCells(cv, row) {
  const top = cv[row * 2], bot = cv[row * 2 + 1];
  return top.map((t, i) => [t, bot[i]]);
}
function artSvg(cells, x0, bleedDown) {
  const paths = new Map();
  const add = (c, d) => paths.set(c, (paths.get(c) || '') + d);
  const n = cells.length;
  for (let x = 0; x < n;) {
    const c = cells[x][1];
    let x2 = x;
    while (x2 < n && cells[x2][1] === c) x2++;
    const w = (x2 - x) * CW + (x2 < n ? 0.5 : 0);
    add(c, `M${x0 + x * CW} 0h${w}v${CH + (bleedDown ? 0.5 : 0)}h${-w}z`);
    x = x2;
  }
  for (let x = 0; x < n;) {
    if (cells[x][0] === cells[x][1]) { x++; continue; }
    const c = cells[x][0];
    let x2 = x;
    while (x2 < n && cells[x2][0] === c && cells[x2][0] !== cells[x2][1]) x2++;
    const w = (x2 - x) * CW + (x2 < n ? 0.5 : 0);
    add(c, `M${x0 + x * CW} 0h${w}v${CH / 2}h${-w}z`);
    x = x2;
  }
  return [...paths].map(([c, d]) => `<path fill="${col(c)}" d="${d}"/>`).join('');
}

// ------------------------------------------------------------------------------ the log
// Event colours on the white pane (my own scheme): joins green, parts and quits navy, modes and
// nick changes teal, topics brown, actions purple, timestamps grey.
const K = { ts: 14, text: 1, join: 3, quit: 2, mode: 10, topic: 5, action: 6, you: 12, bot: 10, notice: 5 };
const seg = (t, fg, bg = null, extra = {}) => ({ t, fg, bg, ...extra });
const stamp = (clock) => seg(`[${clock}] `, K.ts);
const chat = (clock, nick, nickCol, ...rest) => [stamp(clock), seg('<', K.ts), seg(nick, nickCol), seg('> ', K.ts), ...rest];
const event = (clock, colour, text) => [stamp(clock), seg(`* ${text}`, colour)];
const you = (clock, text) => chat(clock, 'Guest1992', K.you, seg(text, K.text));
const bot = (clock, ...rest) => chat(clock, 'tidebot', K.bot, ...rest);
const tag = (t, bg) => seg(` ${t} `, 0, bg);
const SPLIT_SERVERS = '(shore.atoll.irc tide.atoll.irc)';

const TOPIC_A = '10 hours. she idles. now and then, a gag';
const TOPIC_B = 'brb, up the palm. one bar of signal';

// The script. `dt` is the pause before the line (seconds); `type` lines are typed into the input
// box first; `fx` changes the nick list / title / switchbar at the moment the line appears.
const TYPE_DT = 0.065;
// Every new line steps the whole log (and any picture in it) up one row, so no two lines may
// arrive less than MIN_STEP apart: at most 5 steps a second, which keeps the big colour picture
// from jumping faster than 2.5 light/dark changes a second (under the 3 Hz flash guideline).
const MIN_STEP = 0.2;
const BURST_DT = 0.2;                  // the netsplit: quits and rejoins as fast as MIN_STEP allows
const SCRIPT = [
  { dt: 1.0, type: 'hi! what happens in here?', line: () => you('00:00', 'hi! what happens in here?') },
  { dt: 1.1, line: () => bot('00:00', seg('mostly this:', K.text)) },
  { dt: 1.1, line: () => event('00:00', K.action, 'castaway nods to the beat') },
  { dt: 0.75, line: () => event('00:01', K.action, 'castaway nods to the beat') },
  { dt: 0.75, line: () => event('00:02', K.action, 'castaway nods to the beat') },
  { dt: 0.7, type: 'oh', line: () => you('00:02', 'oh') },
  { dt: 1.3, line: () => event('00:17', K.quit, 'bottle has left #castaway (out to sea)'), fx: [['part', 'bottle']] },
  { dt: 0.9, line: () => event('00:17', K.join, 'bottle (~note@the.shore) has joined #castaway'), fx: [['join', 'bottle']] },
  { dt: 1.3, line: () => event('00:41', K.action, 'tidebot drops a coconut on hermit_crab') },
  { dt: 0.9, line: () => event('00:41', K.mode, 'hermit_crab is now known as walking_coconut'), fx: [['nick', 'hermit_crab', 'walking_coconut']] },
  { dt: 1.3, line: () => event('01:12', K.mode, 'tidebot sets mode: +v shark'), fx: [['voice', 'shark']] },
  { dt: 0.9, line: () => event('01:12', K.action, 'shark nods to the beat. it has headphones too') },
  { dt: 1.4, line: () => event('02:20', K.topic, `castaway changes topic to '${TOPIC_B}'`), fx: [['topic', TOPIC_B]] },
  { dt: 1.5, line: () => event('03:05', K.quit, `sandcastle has quit ${SPLIT_SERVERS}`), fx: [['part', 'sandcastle']] },
  { dt: BURST_DT, line: () => event('03:05', K.quit, `sea_turtle has quit ${SPLIT_SERVERS}`), fx: [['part', 'sea_turtle']] },
  { dt: BURST_DT, line: () => event('03:05', K.quit, `stray_cat has quit ${SPLIT_SERVERS}`), fx: [['part', 'stray_cat']] },
  { dt: BURST_DT, line: () => event('03:05', K.quit, `walking_coconut has quit ${SPLIT_SERVERS}`), fx: [['part', 'walking_coconut']] },
  { dt: BURST_DT, line: () => event('03:05', K.quit, `shark has quit ${SPLIT_SERVERS}`), fx: [['part', 'shark']] },
  { dt: 0.8, type: 'uh. where did everyone go', line: () => you('03:05', 'uh. where did everyone go') },
  { dt: 1.4, line: () => event('03:06', K.join, 'sea_turtle (~shell@reef) has joined #castaway'), fx: [['join', 'sea_turtle']] },
  { dt: BURST_DT, line: () => event('03:06', K.join, 'stray_cat (~tabby@crate) has joined #castaway'), fx: [['join', 'stray_cat']] },
  { dt: BURST_DT, line: () => event('03:06', K.join, 'hermit_crab (~crab@low.tide) has joined #castaway'), fx: [['join', 'hermit_crab']] },
  { dt: BURST_DT, line: () => event('03:06', K.join, 'shark (~fin@deep.water) has joined #castaway'), fx: [['join', 'shark']] },
  { dt: 0.8, line: () => event('03:06', K.mode, 'tide.atoll.irc sets mode: +vv sea_turtle stray_cat'), fx: [['voice', 'sea_turtle'], ['voice', 'stray_cat']] },
  { dt: 1.0, line: () => bot('03:06', seg('netsplit over. the tide kept the sandcastle', K.text)) },
  { dt: 0.8, type: '!castaway', line: () => you('03:07', '!castaway') },
  { dt: 0.6, plate: true },
  { dt: 2.0, line: () => event('04:30', K.topic, `castaway changes topic to '${TOPIC_A}'`), fx: [['topic', TOPIC_A], ['kumara', true]] },
  { dt: 1.0, type: '!tiers', line: () => you('05:40', '!tiers') },
  { dt: 0.7, line: () => bot('05:40', tag('TIERS', 3), seg(' 90+ activities, 4 timers: 2-5m 12-25m 30-60m 3-6h', K.text)) },
  { dt: 1.0, type: '!sound', line: () => you('05:41', '!sound') },
  { dt: 0.7, line: () => bot('05:41', tag('SOUND', 6), seg(' every sound is synthesized from code. no samples', K.text)) },
  { dt: 1.0, type: '!run', line: () => you('05:42', '!run') },
  { dt: 0.7, line: () => bot('05:42', tag('RUN', 4), seg(' python tools/serve.py', 2), seg(', then open ', K.text), seg('http://127.0.0.1:8765/', 12, null, { u: true })) },
  { dt: 1.8, line: () => event('06:12', K.join, 'sandcastle (~castle@low.tide) has joined #castaway'), fx: [['join', 'sandcastle']] },
  { dt: 1.6, type: 'did she do anything', line: () => you('09:59', 'did she do anything') },
  { dt: 1.0, line: () => bot('09:59', seg('about 200 things happened. she idled between them', K.text)) },
  { dt: 1.2, line: () => bot('09:59', seg('it is that kind of video', K.text)) },
  { dt: 1.6, line: () => event('10:00', K.quit, 'Guest1992 has quit (Quit: 10 hours. worth it)'), fx: [['part', 'Guest1992'], ['kumara', false]] },
  { dt: 1.4, line: () => event('00:00', K.join, 'Guest1992 (~you@README.md) has joined #castaway'), fx: [['join', 'Guest1992']] },
  { dt: 0.5, line: () => event('00:00', K.topic, `Topic is '${TOPIC_A}'`) },
  { dt: 0.6, art: true },
];
const PASTE_DT = 0.2;                  // a bot pastes one line every 0.2 s

// Expand the script into the period's lines with their arrival times, plus the typing spans and
// the effects timeline.
const ISLAND = drawIsland();
const PLATE = drawPlate();
const PLATE_TEXT = '♪ a 10-hour lo-fi island · every sound made from code ♪';
const period = [];       // { at, segs } or { at, cells }
const typing = [];       // { text, t0, t1 }
const effects = [];      // { at, op }
let clock = 0;
for (const s of SCRIPT) {
  clock += s.dt;
  if (s.type) {
    const t0 = clock;
    const t1 = t0 + len(s.type) * TYPE_DT + 0.3;
    typing.push({ text: s.type, t0, t1 });
    clock = t1;
  }
  if (s.art) {
    for (let r = 0; r < AH / 2; r++) {
      period.push({ at: clock, prefix: bot('00:00'), cells: artCells(ISLAND, r), lastArt: r === AH / 2 - 1 });
      if (r < AH / 2 - 1) clock += PASTE_DT;
    }
  } else if (s.plate) {
    for (let r = 0; r < 6; r++) {
      period.push({ at: clock, prefix: bot('03:07'), cells: artCells(PLATE, r) });
      clock += PASTE_DT;
    }
    const pad = AW - len(PLATE_TEXT);
    period.push({ at: clock, segs: [...bot('03:07'), seg(`${' '.repeat(Math.floor(pad / 2))}${PLATE_TEXT}${' '.repeat(Math.ceil(pad / 2))}`, 8, 2)] });
  } else {
    period.push({ at: clock, segs: s.line() });
  }
  for (const op of s.fx || []) effects.push({ at: clock, op });
}
if (clock > T - 6) throw new Error(`script runs to ${clock.toFixed(2)} s; the loop is ${T} s`);
const P = period.length;
// photosensitivity guard: the log never steps faster than MIN_STEP, including across the loop seam
for (let i = 0; i < P; i++) {
  const gap = i ? period[i].at - period[i - 1].at : period[0].at + T - period[P - 1].at;
  if (gap < MIN_STEP - 1e-9) throw new Error(`log lines ${i - 1} and ${i} are ${gap.toFixed(3)} s apart (min ${MIN_STEP})`);
}
const PREFIX_COLS = len('[00:00] <tidebot> ');

// Check widths.
for (const ln of period) {
  const w = ln.segs ? ln.segs.reduce((a, s) => a + len(s.t), 0) : PREFIX_COLS + AW;
  if (w > COLS) throw new Error(`log line is ${w} cells (max ${COLS}): ${ln.segs ? ln.segs.map((s) => s.t).join('') : 'art'}`);
}

// Repeated pieces (timestamps, nicks, the art lines' "[00:00] <tidebot> " head) are drawn once
// in <defs> and reused, which keeps the file small.
const segCount = new Map();
for (const ln of period) for (const s of ln.segs || []) if (s.bg === null) segCount.set(`${s.fg}|${s.t}`, (segCount.get(`${s.fg}|${s.t}`) || 0) + 1);
const segIds = new Map();
const pieceDefs = [];
function segUses(s, c) {
  const key = `${s.fg}|${s.t}`;
  if (s.bg !== null || (segCount.get(key) || 0) < 2 || len(s.t.trim()) < 2) return monoUses(s.t, c);
  if (!segIds.has(key)) {
    segIds.set(key, `s${segIds.size.toString(36)}`);
    pieceDefs.push(`<g id="${segIds.get(key)}">${monoUses(s.t)}</g>`);
  }
  return `<use href="#${segIds.get(key)}"${c ? ` x="${c * CW}"` : ''}/>`;
}
function textSvg(segs) {
  let out = '';
  let c = 0;
  for (const s of segs) {
    if (s.bg !== null) out += rect(c * CW, 0, len(s.t) * CW, CH, col(s.bg));
    c += len(s.t);
  }
  const byCol = new Map();
  c = 0;
  for (const s of segs) {
    byCol.set(s.fg, (byCol.get(s.fg) || '') + segUses(s, c) + (s.u ? rect(c * CW, 12, len(s.t) * CW, 1, col(s.fg)) : ''));
    c += len(s.t);
  }
  for (const [fg, uses] of byCol) if (uses) out += `<g fill="${col(fg)}">${uses}</g>`;
  return out;
}
const headIds = new Map();
function lineSvg(ln) {
  if (!ln.cells) return textSvg(ln.segs);
  const key = JSON.stringify(ln.prefix);
  if (!headIds.has(key)) {
    headIds.set(key, `h${headIds.size}`);
    pieceDefs.push(`<g id="h${headIds.size - 1}">${textSvg(ln.prefix)}</g>`);
  }
  const cols = ln.prefix.reduce((a, s) => a + len(s.t), 0);
  return `<use href="#${headIds.get(key)}"/>${artSvg(ln.cells, cols * CW, !ln.lastArt)}`;
}

// ------------------------------------------------------------------------------ nick list state
const NICKS0 = {
  ops: ['castaway', 'tidebot'],
  voiced: ['sea_turtle', 'stray_cat'],
  plain: ['bottle', 'cloud_shadow', 'drone', 'Guest1992', 'hermit_crab', 'hydrofoil_bro', 'kumara', 'sandcastle', 'shark', 'ship', 'shore_waves', 'tour_boat'],
  away: ['dolphins', 'gecko', 'rain_shower', 'sailboat', 'sandpipers', 'whale_pod'],
};
function initialNicks() {
  const m = new Map();
  for (const n of NICKS0.ops) m.set(n, { pre: '@', away: false });
  for (const n of NICKS0.voiced) m.set(n, { pre: '+', away: false });
  for (const n of NICKS0.plain) m.set(n, { pre: '', away: false });
  for (const n of NICKS0.away) m.set(n, { pre: '', away: true });
  return m;
}
const rank = { '@': 0, '+': 1, '': 2 };
function sorted(m) {
  return [...m].sort((a, b) => rank[a[1].pre] - rank[b[1].pre] || a[0].toLowerCase().localeCompare(b[0].toLowerCase()))
    .map(([n, v]) => ({ label: v.pre + n, away: v.away }));
}
// States over time: [{ at, list, count, topic, kumara }]
const states = [];
{
  const m = initialNicks();
  let topic = TOPIC_A, kumara = false;
  const snap = (at) => states.push({ at, list: sorted(m), count: m.size, topic, kumara });
  snap(0);
  for (const { at, op } of effects) {
    const [kind, a, b] = op;
    if (kind === 'part') { if (!m.delete(a)) throw new Error(`part: ${a} not here`); }
    else if (kind === 'join') { if (m.has(a)) throw new Error(`join: ${a} already here`); m.set(a, { pre: '', away: false }); }
    else if (kind === 'nick') { const v = m.get(a); m.delete(a); m.set(b, v); }
    else if (kind === 'voice') m.get(a).pre = '+';
    else if (kind === 'topic') topic = a;
    else if (kind === 'kumara') kumara = a;
    snap(at);
  }
  // the loop must close: the last state equals the first
  const first = JSON.stringify({ ...states[0], at: 0 }), last = JSON.stringify({ ...states[states.length - 1], at: 0 });
  if (first !== last) throw new Error(`nick list does not loop:\n${first}\n${last}`);
}

// ------------------------------------------------------------------------------ keyframes
const css = [];
let kfN = 0;
// Stepped keyframes for one property: stops = [[t, value], ...] (t in seconds, sorted).
function stepped(prop, stops, fmt = (v) => v, rule = true) {
  const name = `k${(kfN++).toString(36)}`;
  // stops that share a value share one keyframe block ("0%,40.5%{...}"), which keeps the CSS small
  // (several changes at the same instant: the last one wins)
  const byPct = new Map();
  for (const [t, v] of [...stops, [T, stops[stops.length - 1][1]]]) byPct.set(pct(t), v);
  const groups = new Map();
  for (const [p, v] of byPct) {
    const key = fmt(v);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(p);
  }
  const frames = [...groups].map(([v, ps]) => `${ps.join(',')}{${prop}:${v}}`).join('');
  css.push(`@keyframes ${name}{${frames}}${rule ? `.${name}{animation:${name} ${T}s steps(1,end) infinite}` : ''}`);
  return name;
}
// One class running several stepped keyframe sets at once (a second class would override the
// first one's `animation` declaration, so they are combined into one rule).
function combined(names) {
  if (names.length < 2) return names[0] || '';
  const name = `k${(kfN++).toString(36)}`;
  css.push(`.${name}{animation:${names.map((n) => `${n} ${T}s steps(1,end) infinite`).join(',')}}`);
  return name;
}
// Collapse a sampled value list to change points.
function changes(samples) {
  const out = [];
  for (const [t, v] of samples) if (!out.length || out[out.length - 1][1] !== v) out.push([t, v]);
  return out;
}

// ------------------------------------------------------------------------------ build the SVG
const defs = [];
const body = [];

// Desktop panel and the window frame.
const WX = PAD, WY = PAD;
body.push(`<rect width="${W}" height="${H}" rx="12" fill="url(#desk)"/>`);
body.push(rect(WX + 4, WY + 5, WIN_W, WIN_H, '#0b3a38', ' opacity=".45"'));
body.push(rect(WX, WY, WIN_W, WIN_H, UI.face) + raised(WX, WY, WIN_W, WIN_H));
defs.push(`<linearGradient id="desk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${UI.deskHi}"/><stop offset="1" stop-color="${UI.desk}"/></linearGradient>`);
defs.push(`<linearGradient id="ttl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${UI.titleA}"/><stop offset="1" stop-color="${UI.titleB}"/></linearGradient>`);
defs.push('<pattern id="dith" width="2" height="2" patternUnits="userSpaceOnUse"><rect width="2" height="2" fill="#c0c0c0"/><rect width="1" height="1" fill="#fff"/><rect x="1" y="1" width="1" height="1" fill="#fff"/></pattern>');

// Title bar.
const TX = WX + FRAME - 1, TY = WY + FRAME - 1, TW = WIN_W - 2 * FRAME + 2;
body.push(rect(TX, TY, TW, TITLE_H, 'url(#ttl)'));
body.push(icon('app', TX + 2, TY + 1));
{
  const titleY = TY + 5;
  const pre = 'KelpChat - [#castaway [';
  let x = TX + 21;
  body.push(uiText(uib, pre, x, titleY, '#fff'));
  x += uib.width(pre) + 1;
  // the user count, one variant per value
  const counts = [...new Set(states.map((s) => s.count))];
  const cw = Math.max(...counts.map((n) => uib.width(String(n))));
  for (const n of counts) {
    const name = stepped('opacity', changes(states.map((s) => [s.at, s.count === n ? 1 : 0])));
    body.push(uiText(uib, String(n), x, titleY, '#fff', { cls: name }).replace('<g ', `<g opacity="${states[0].count === n ? 1 : 0}" `));
  }
  x += cw + 1;
  const mid = '] [+nt]: ';
  body.push(uiText(uib, mid, x, titleY, '#fff'));
  x += uib.width(mid) + 1;
  for (const tp of [TOPIC_A, TOPIC_B]) {
    const name = stepped('opacity', changes(states.map((s) => [s.at, s.topic === tp ? 1 : 0])));
    body.push(uiText(uib, `${tp}]`, x, titleY, '#fff', { cls: name, maxW: TX + TW - 60 - x }).replace('<g ', `<g opacity="${states[0].topic === tp ? 1 : 0}" `));
  }
  // caption buttons
  const by = TY + 2, bw = 16, bh = 14;
  const bx3 = TX + TW - 2 - bw, bx2 = bx3 - 2 - bw, bx1 = bx2 - bw;
  body.push(button(bx1, by, bw, bh, bm(GLYPH_MIN, bx1 + 4, by + 3, '#000')));
  body.push(button(bx2, by, bw, bh, bm(GLYPH_MAX, bx2 + 3, by + 2, '#000')));
  body.push(button(bx3, by, bw, bh, bm(GLYPH_CLOSE, bx3 + 4, by + 3, '#000')));
}

// Menu bar (the maximized channel window puts its icon at the left and its buttons at the right).
const MY = TY + TITLE_H + 1;
{
  body.push(icon('chan', TX + 2, MY + 1));
  let x = TX + 24;
  for (const m of ['File', 'Edit', 'View', 'Island', 'Tools', 'Window', 'Help']) {
    body.push(uiText(ui, m, x, MY + 5, '#000', { underline: 0 }));
    x += ui.width(m) + 14;
  }
  const bw = 16, bh = 14, by = MY + 2;
  const bx3 = TX + TW - 2 - bw, bx2 = bx3 - 2 - bw, bx1 = bx2 - bw;
  body.push(button(bx1, by, bw, bh, bm(GLYPH_MIN, bx1 + 4, by + 3, '#000')));
  body.push(button(bx2, by, bw, bh, bm(GLYPH_RESTORE, bx2 + 3, by + 2, '#000')));
  body.push(button(bx3, by, bw, bh, bm(GLYPH_CLOSE, bx3 + 4, by + 3, '#000')));
}

// Toolbar: etched line, flat buttons with island icons, etched separators.
const TBY = MY + MENU_H;
{
  body.push(rect(TX, TBY, TW, 1, UI.shadow) + rect(TX, TBY + 1, TW, 1, UI.white));
  let x = TX + 4;
  const groups = [['bolt'], ['crate', 'list'], ['bottle', 'coconut', 'phones'], ['turtle', 'palm', 'sun', 'kumara']];
  groups.forEach((g, gi) => {
    if (gi) { body.push(rect(x + 2, TBY + 5, 1, 20, UI.shadow) + rect(x + 3, TBY + 5, 1, 20, UI.white)); x += 8; }
    for (const name of g) {
      if (name === 'bolt') body.push(raised(x, TBY + 4, 24, 22));
      body.push(icon(name, x + 4, TBY + 7));
      x += 25;
    }
  });
  body.push(rect(TX, TBY + TOOL_H - 1, TW, 1, UI.shadow));
}

// Switchbar: the network status window, this channel (pressed) and a quieter channel.
const SWY = TBY + TOOL_H;
let kumaraName = '';
{
  body.push(rect(TX, SWY, TW, 1, UI.white));
  const items = [['bolt', 'AtollNet', false], ['chan', '#castaway', true], ['chan', '#kumara-watch', false]];
  let x = TX + 2;
  for (const [ic, label, active] of items) {
    const w = 24 + ui.width(label) + 14;
    const y = SWY + 2, h = 21;
    if (active) body.push(rect(x, y, w, h, 'url(#dith)') + sunken(x, y, w, h));
    else body.push(button(x, y, w, h));
    const o = active ? 1 : 0;
    body.push(icon(ic, x + 4 + o, y + 2 + o));
    if (label === '#kumara-watch') {
      // lights up when someone posts a growth update, until the reader leaves
      kumaraName = stepped('opacity', changes(states.map((s) => [s.at, s.kumara ? 1 : 0])));
      body.push(uiText(ui, label, x + 24, y + 7, '#000'));
      body.push(`<g class="${kumaraName}" opacity="0">${rect(x + 23, y + 5, ui.width(label) + 2, 12, UI.face)}${uiText(ui, label, x + 24, y + 7, '#0000fc')}</g>`);
    } else {
      body.push(uiText(active ? uib : ui, label, x + 24 + o, y + 7 + o, '#000'));
    }
    x += w + 3;
  }
}

// Client area: chat pane with scrollbar, splitter, nick list, input box.
const CX = TX + 1, CY = SWY + SWITCH_H + 1;
body.push(sunken(CX - 1, CY - 1, CLIENT_W + 2, CLIENT_H + 2));
const chatX = CX + 1, chatY = CY + 1;
body.push(sunken(chatX, chatY, CHAT_BOX_W, CHAT_BOX_H));
body.push(rect(chatX + 2, chatY + 2, CHAT_BOX_W - 4, CHAT_BOX_H - 4, '#fff'));
const textX = chatX + 2 + 3, textY = chatY + 2 + 2;
// scrollbar, scrolled to the bottom
{
  const sx = chatX + CHAT_BOX_W - 2 - SB_W, sy = chatY + 2, sh = CHAT_BOX_H - 4;
  body.push(rect(sx, sy, SB_W, sh, 'url(#dith)'));
  body.push(button(sx, sy, SB_W, SB_W, bm('...#...|..###..|.#####.|#######', sx + 4, sy + 6, '#000')));
  body.push(button(sx, sy + sh - SB_W, SB_W, SB_W, bm('#######|.#####.|..###..|...#...', sx + 4, sy + sh - SB_W + 6, '#000')));
  const thumbH = 46;
  body.push(button(sx, sy + sh - SB_W - thumbH, SB_W, thumbH));
}
const nickX = chatX + CHAT_BOX_W + SPLIT, nickY = chatY;
body.push(sunken(nickX, nickY, NICK_BOX_W, CHAT_BOX_H));
body.push(rect(nickX + 2, nickY + 2, NICK_BOX_W - 4, CHAT_BOX_H - 4, '#fff'));
const inX = chatX, inY = chatY + CHAT_BOX_H + 3, inW = CLIENT_W;
body.push(sunken(inX, inY, inW, INPUT_H));
body.push(rect(inX + 2, inY + 2, inW - 4, INPUT_H - 4, '#fff'));

// The log: R lines of the previous period, then the period; one stepped scroll animation.
defs.push(`<clipPath id="pane"><rect x="${chatX + 2}" y="${textY}" width="${CHAT_BOX_W - 4 - SB_W}" height="${R * CH}"/></clipPath>`);
period.forEach((ln, i) => defs.push(`<g id="L${i}">${lineSvg(ln)}</g>`));
{
  let s = '';
  for (let k = 0; k < R + P; k++) {
    const idx = ((k - R) % P + P) % P;
    s += `<use href="#L${idx}" y="${k * CH}"/>`;
  }
  const stops = [[0, 0], ...period.map((ln, j) => [ln.at, j + 1])];
  const name = stepped('transform', stops, (v) => `translateY(${-v * CH}px)`);
  body.push(`<g clip-path="url(#pane)"><g transform="translate(${textX} ${textY})"><g class="${name}">${s}</g></g></g>`);
}

// Nick list: one entry per label, each stepping between rows and hiding while absent.
{
  const labels = new Map();
  for (const st of states) st.list.forEach((e) => { if (!labels.has(e.label)) labels.set(e.label, e.away); });
  const nx = nickX + 2 + 3, ny = nickY + 2 + 2;
  for (const [label, away] of labels) {
    if (len(label) > NICK_COLS) throw new Error(`nick ${label} too long`);
    const rowAt = (st) => st.list.findIndex((e) => e.label === label);
    const r0 = rowAt(states[0]);
    const pos = changes(states.map((st) => { const r = rowAt(st); return [st.at, r < 0 ? 'hide' : r]; }));
    // position holds its last visible row while hidden
    let lastRow = r0 >= 0 ? r0 : pos.find(([, v]) => v !== 'hide')[1];
    const tStops = [], oStops = [];
    for (const [t, v] of pos) {
      if (v !== 'hide') lastRow = v;
      tStops.push([t, lastRow]);
      oStops.push([t, v === 'hide' ? 0 : 1]);
    }
    const moves = changes(tStops).length > 1;
    const blinks = changes(oStops).length > 1;
        const startRow = r0 >= 0 ? r0 : tStops[0][1];
    const both = moves && blinks;
    const tName = moves ? stepped('transform', changes(tStops), (v) => `translateY(${v * CH}px)`, !both) : '';
    const oName = blinks ? stepped('opacity', changes(oStops), (v) => v, !both) : '';
    const cls = combined([tName, oName].filter(Boolean));
    body.push(`<g transform="translate(${nx} ${ny})" fill="${col(away ? 14 : 1)}"><g${cls ? ` class="${cls}"` : ''}${startRow ? ` transform="translate(0 ${startRow * CH})"` : ''}${r0 < 0 ? ' opacity="0"' : ''}>${monoUses(label)}</g></g>`);
  }
}

// Input box: each line the reader sends is typed, one character at a time, then cleared on Enter.
{
  const ix = inX + 2 + 3, iy = inY + 2 + 2;
  const caret = '<rect y="2" width="1" height="12" fill="#000"/>';
  const idle = [[0, 1]];
  for (const { text, t0, t1 } of typing) {
    const n = len(text);
    const vis = stepped('opacity', [[0, 0], [t0, 1], [t1, 0]]);
    idle.push([t0, 0], [t1, 1]);
    const cover = [[0, 0]];
    for (let i = 1; i <= n; i++) cover.push([t0 + i * TYPE_DT, i]);
    const cv = stepped('transform', cover, (v) => `translateX(${v * CW}px)`);
    // the white cover slides right one cell per keystroke, carrying the caret on its left edge
    body.push(`<g class="${vis}" opacity="0" transform="translate(${ix} ${iy})"><g fill="#000">${monoUses(text)}</g><g class="${cv}"><rect width="${n * CW + 1}" height="${CH}" fill="#fff"/>${caret}</g></g>`);
  }
  const idleName = stepped('opacity', idle);
  css.push('@keyframes blink{0%{opacity:1}50%{opacity:0}}.blink{animation:blink 1.5s steps(1,end) infinite}');
  body.push(`<g transform="translate(${ix} ${iy})" class="${idleName}"><g class="blink">${caret}</g></g>`);
}

css.push('@media (prefers-reduced-motion:reduce){*{animation:none!important}}');
if (FREEZE !== null) css.push(`*{animation-delay:-${FREEZE}s!important;animation-play-state:paused!important}`);

const glyphDefs = [...monoIds].map(([ch, id]) => `<path id="${id}" d="${bitmapPath(MONO.get(ch))}"/>`).join('');
const TITLE = 'Castaway: #castaway on AtollNet';
const DESC = 'A 9x-style IRC client window. A bot pastes a colour-cell picture of a tiny island with one palm, a raft and the castaway, with CASTAWAY written on the water; the channel log runs through a 10-hour video in a minute: she nods to the beat, a bottle leaves and comes straight back, a hermit crab becomes walking_coconut, a netsplit takes the sandcastle, and the bot answers !tiers, !sound and !run.';
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="t d">`
  + `<title id="t">${TITLE}</title><desc id="d">${DESC}</desc>`
  + `<style>${css.join('')}</style>`
  + `<defs>${pieceDefs.join('')}${defs.join('')}${glyphDefs}${ui.defs()}${uib.defs()}</defs>`
  + body.join('')
  + '</svg>\n';

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, svg);
console.log(`wrote ${path.relative(process.cwd(), OUT)} (${(svg.length / 1024).toFixed(1)} KB, ${W}x${H}, ${P} lines a period, script ends at ${clock.toFixed(2)} s)`);
