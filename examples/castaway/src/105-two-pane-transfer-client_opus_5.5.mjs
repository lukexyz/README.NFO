#!/usr/bin/env node
// Castaway README header: "Two-Pane Transfer Client" (105-two-pane-transfer-client_opus_5.5),
// style catalogue entry xfer-09: the FXP client of about 1998-2008, two remote sites side by
// side, a transfer queue under one and a raw command log under the other.
//
//   node examples/castaway/src/105-two-pane-transfer-client_opus_5.5.mjs
//
// Regenerates ../assets/105-two-pane-transfer-client_opus_5.5.svg. Plain Node, no dependencies,
// deterministic (one seeded PRNG, no clock). The .md beside the assets is hand-written.
//
// The idea: the two sites are the island and the sea, and the client moves Castaway's own gags
// between them. The window keeps the style's signature parts: two file panes with their own
// little toolbars, path boxes and Name / Size / Modified columns (the right pane adds Attr), a
// one-line summary strip under each pane with the active side tinted pale yellow, a queue with
// Name / Target / Size / Remark at the bottom left, and a log of raw command and numbered-reply
// lines at the bottom right, each stamped with a bracketed time. The FXP exchange is there:
// PASV to one side, its 227 reply with six numbers, PORT with the same six to the other side.
// The six numbers are (127,0,0,1,34,61): 127.0.0.1, port 34 * 256 + 61 = 8765, which is where
// `python tools/serve.py` serves the real thing.
//
// The loop is 60 s, one loop of the theme (20 bars of 3 s at 80 BPM), and the log's bracketed
// clock is the theme's clock, so the log scrolls back round to exactly where it started. Five
// queue items each take one slot and go back on the queue afterwards (everything on the
// island repeats on a timer), so the queue also ends where it began:
//   0-12  bottle.msg -> the sea: the full PASV / 227 / PORT exchange, then it washes straight back
//   12-24 sandcastle: built (STOR, then APPE as it grows), a ship crosses while she is busy, the tide takes it
//   24-36 palm/coconut: RNFR / RNTO crab/hat, and the crab walks off wearing it
//   36-45 palm/cat: 450, napping; the shark surfaces and nods (NOOP / 200 Nod) to the beat
//   45-60 castaway: QUIT, 221; she walks off over the water, the island pane disconnects, and she
//         comes back with an iced coffee; meanwhile the client prints its start-up lines (with
//         invented library versions) and the 220 welcome banner carries the quick start, and
//         those six lines are what a visitor sees first.
//
// What is invented, so nothing real is reproduced: the client ("Tombolo FXP": a tombolo is the
// sandbar that ties an island to the land), its colour scheme (a sandy take on the classic
// bevelled Windows look), every icon, the fonts, the island art and the site names. The pane
// layout is the generic two-site arrangement, not any product's toolbar or artwork. Every row
// is one of Castaway's own activities or files.
//
// How it is built: everything sits on a logical pixel grid (viewBox 540 x 381, shown about
// 1.55x), crispEdges; the island scene above the window is drawn at 2 logical px per pixel. Text is pixel glyphs (a proportional UI sans, a 5x7 monospace for the
// log, a big blocky logo face) drawn as merged-rect <path>s and reused through <use>; no <text>,
// no fonts, nothing external. Sprites are rows of palette letters, one merged path per colour.
// Animation is CSS keyframes with step-end timing (hard cuts and stepped movement, which is
// also the project's own motion rule). Every animated element's inline style is its t = 0
// state, so prefers-reduced-motion simply switches animation off and leaves the opening frame:
// connected, the welcome banner in the log, the queue full, the cat asleep up the palm.

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const SLUG = '105-two-pane-transfer-client_opus_5.5';
const OUT = resolve(here, `../assets/${SLUG}.svg`);

// ------------------------------------------------------------------ basics
const W = 540;
const H = 381;
const T = 60; // loop length in seconds: one loop of the theme
const BEAT = 0.75; // 80 BPM
const n3 = (v) => +v.toFixed(3);

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
const rand = mulberry32(1992);

// Window colours: a sandy variant of the classic bevelled scheme, teal title bars.
const P = {
  face: '#d9d1bf',
  light: '#ece6d6',
  hi: '#ffffff',
  shadow: '#968c76',
  dark: '#3d382e',
  ink: '#000000',
  white: '#ffffff',
  sel: '#0f5f6e',
  t1: '#0f5f6e',
  t2: '#79c9c9',
  ti1: '#8e8676',
  ti2: '#cbc3b0',
  strip: '#ffffcc', // the active side's summary strip: pale yellow
  grey: '#8a8270',
  dim: '#a39a85',
};
const LOGC = {
  time: '#7a7466',
  L: '#b3452e', // island side
  R: '#0d6f8f', // sea side
  cmd: '#00007a',
  reply: '#1a1a1a',
  err: '#b00000',
  info: '#00702a',
};

// ------------------------------------------------------------------ fonts
// UI: a proportional pixel sans, cap height 7, x-height 5, two-row descenders. The glyph table
// started from the one in the ULTRA-SATISFACTORY desktop header and was extended.
const UI = {
  A: '..#..|.#.#.|.#.#.|#...#|#####|#...#|#...#',
  B: '####.|#...#|#...#|####.|#...#|#...#|####.',
  C: '.###.|#...#|#....|#....|#....|#...#|.###.',
  D: '####.|#...#|#...#|#...#|#...#|#...#|####.',
  E: '####|#...|#...|###.|#...|#...|####',
  F: '####|#...|#...|###.|#...|#...|#...',
  G: '.###.|#...#|#....|#.###|#...#|#...#|.###.',
  H: '#...#|#...#|#...#|#####|#...#|#...#|#...#',
  I: '#|#|#|#|#|#|#',
  J: '..#|..#|..#|..#|..#|#.#|.#.',
  K: '#...#|#..#.|#.#..|##...|#.#..|#..#.|#...#',
  L: '#...|#...|#...|#...|#...|#...|####',
  M: '#...#|##.##|#.#.#|#.#.#|#...#|#...#|#...#',
  N: '#...#|##..#|##..#|#.#.#|#..##|#..##|#...#',
  O: '.###.|#...#|#...#|#...#|#...#|#...#|.###.',
  P: '####.|#...#|#...#|####.|#....|#....|#....',
  Q: '.###.|#...#|#...#|#...#|#.#.#|#..#.|.##.#',
  R: '####.|#...#|#...#|####.|#.#..|#..#.|#...#',
  S: '.###.|#...#|#....|.###.|....#|#...#|.###.',
  T: '#####|..#..|..#..|..#..|..#..|..#..|..#..',
  U: '#...#|#...#|#...#|#...#|#...#|#...#|.###.',
  V: '#...#|#...#|#...#|.#.#.|.#.#.|..#..|..#..',
  W: '#...#|#...#|#...#|#.#.#|#.#.#|##.##|#...#',
  X: '#...#|#...#|.#.#.|..#..|.#.#.|#...#|#...#',
  Y: '#...#|#...#|.#.#.|..#..|..#..|..#..|..#..',
  Z: '#####|....#|...#.|..#..|.#...|#....|#####',
  a: '....|....|.##.|...#|.###|#..#|.###',
  b: '#...|#...|###.|#..#|#..#|#..#|###.',
  c: '....|....|.###|#...|#...|#...|.###',
  d: '...#|...#|.###|#..#|#..#|#..#|.###',
  e: '....|....|.##.|#..#|####|#...|.###',
  f: '.##|#..|###|#..|#..|#..|#..',
  g: '....|....|.###|#..#|#..#|#..#|.###|...#|.##.',
  h: '#...|#...|###.|#..#|#..#|#..#|#..#',
  i: '#|.|#|#|#|#|#',
  j: '.#|..|.#|.#|.#|.#|.#|.#|#.',
  k: '#...|#...|#..#|#.#.|##..|#.#.|#..#',
  l: '#|#|#|#|#|#|#',
  m: '.....|.....|####.|#.#.#|#.#.#|#.#.#|#.#.#',
  n: '....|....|###.|#..#|#..#|#..#|#..#',
  o: '....|....|.##.|#..#|#..#|#..#|.##.',
  p: '....|....|###.|#..#|#..#|#..#|###.|#...|#...',
  q: '....|....|.###|#..#|#..#|#..#|.###|...#|...#',
  r: '...|...|#.#|##.|#..|#..|#..',
  s: '....|....|.###|#...|.##.|...#|###.',
  t: '.#.|.#.|###|.#.|.#.|.#.|..#',
  u: '....|....|#..#|#..#|#..#|#..#|.###',
  v: '.....|.....|#...#|#...#|.#.#.|.#.#.|..#..',
  w: '.....|.....|#...#|#.#.#|#.#.#|#.#.#|.#.#.',
  x: '....|....|#..#|#..#|.##.|#..#|#..#',
  y: '....|....|#..#|#..#|#..#|#..#|.###|...#|.##.',
  z: '....|....|####|...#|.##.|#...|####',
  0: '.##.|#..#|#..#|#..#|#..#|#..#|.##.',
  1: '.#.|##.|.#.|.#.|.#.|.#.|###',
  2: '.##.|#..#|...#|..#.|.#..|#...|####',
  3: '.##.|#..#|...#|.##.|...#|#..#|.##.',
  4: '...#|..##|.#.#|#..#|####|...#|...#',
  5: '####|#...|###.|...#|...#|#..#|.##.',
  6: '.##.|#...|#...|###.|#..#|#..#|.##.',
  7: '####|...#|...#|..#.|..#.|.#..|.#..',
  8: '.##.|#..#|#..#|.##.|#..#|#..#|.##.',
  9: '.##.|#..#|#..#|.###|...#|...#|.##.',
  '.': '.|.|.|.|.|.|#',
  ',': '..|..|..|..|..|..|.#|#.',
  ':': '.|.|.|#|.|.|#',
  ';': '..|..|..|.#|..|..|.#|#.',
  '!': '#|#|#|#|#|.|#',
  '?': '.##.|#..#|...#|..#.|.#..|....|.#..',
  '-': '...|...|...|...|###|...|...',
  '/': '..#|..#|.#.|.#.|.#.|#..|#..',
  '(': '.#|#.|#.|#.|#.|#.|.#',
  ')': '#.|.#|.#|.#|.#|.#|#.',
  '[': '##|#.|#.|#.|#.|#.|##',
  ']': '##|.#|.#|.#|.#|.#|##',
  '<': '...#|..#.|.#..|#...|.#..|..#.|...#',
  '>': '#...|.#..|..#.|...#|..#.|.#..|#...',
  '"': '#.#|#.#|...|...|...|...|...',
  "'": '#|#|.|.|.|.|.',
  '%': '##..#|##.#.|...#.|..#..|.#...|.#.##|#..##',
  '&': '.#...|#.#..|#.#..|.#...|#.#.#|#..#.|.##.#',
  '+': '.....|.....|..#..|..#..|#####|..#..|..#..',
  '=': '...|...|###|...|###|...|...',
  '_': '....|....|....|....|....|....|....|####',
  '*': '.....|..#..|#.#.#|.###.|#.#.#|..#..|.....',
  '#': '.#.#.|.#.#.|#####|.#.#.|#####|.#.#.|.#.#.',
  '~': '.....|.....|.##.#|#.##.|.....|.....|.....',
  '·': '.|.|.|#|.|.|.',
};

// Log: a 5x7 monospace with two-row descenders, advance 6.
const MONO = {
  A: '.###.|#...#|#...#|#####|#...#|#...#|#...#',
  B: '####.|#...#|#...#|####.|#...#|#...#|####.',
  C: '.###.|#...#|#....|#....|#....|#...#|.###.',
  D: '####.|#...#|#...#|#...#|#...#|#...#|####.',
  E: '#####|#....|#....|####.|#....|#....|#####',
  F: '#####|#....|#....|####.|#....|#....|#....',
  G: '.###.|#...#|#....|#.###|#...#|#...#|.####',
  H: '#...#|#...#|#...#|#####|#...#|#...#|#...#',
  I: '.###.|..#..|..#..|..#..|..#..|..#..|.###.',
  J: '..###|...#.|...#.|...#.|...#.|#..#.|.##..',
  K: '#...#|#..#.|#.#..|##...|#.#..|#..#.|#...#',
  L: '#....|#....|#....|#....|#....|#....|#####',
  M: '#...#|##.##|#.#.#|#.#.#|#...#|#...#|#...#',
  N: '#...#|##..#|#.#.#|#..##|#...#|#...#|#...#',
  O: '.###.|#...#|#...#|#...#|#...#|#...#|.###.',
  P: '####.|#...#|#...#|####.|#....|#....|#....',
  Q: '.###.|#...#|#...#|#...#|#.#.#|#..#.|.##.#',
  R: '####.|#...#|#...#|####.|#.#..|#..#.|#...#',
  S: '.####|#....|#....|.###.|....#|....#|####.',
  T: '#####|..#..|..#..|..#..|..#..|..#..|..#..',
  U: '#...#|#...#|#...#|#...#|#...#|#...#|.###.',
  V: '#...#|#...#|#...#|#...#|#...#|.#.#.|..#..',
  W: '#...#|#...#|#...#|#.#.#|#.#.#|#.#.#|.#.#.',
  X: '#...#|#...#|.#.#.|..#..|.#.#.|#...#|#...#',
  Y: '#...#|#...#|.#.#.|..#..|..#..|..#..|..#..',
  Z: '#####|....#|...#.|..#..|.#...|#....|#####',
  a: '.....|.....|.###.|....#|.####|#...#|.####',
  b: '#....|#....|#.##.|##..#|#...#|#...#|####.',
  c: '.....|.....|.###.|#....|#....|#...#|.###.',
  d: '....#|....#|.##.#|#..##|#...#|#...#|.####',
  e: '.....|.....|.###.|#...#|#####|#....|.###.',
  f: '..##.|.#..#|.#...|###..|.#...|.#...|.#...',
  g: '.....|.....|.####|#...#|#...#|#...#|.####|....#|.###.',
  h: '#....|#....|#.##.|##..#|#...#|#...#|#...#',
  i: '..#..|.....|.##..|..#..|..#..|..#..|.###.',
  j: '...#.|.....|..##.|...#.|...#.|...#.|...#.|#..#.|.##..',
  k: '#....|#....|#..#.|#.#..|##...|#.#..|#..#.',
  l: '.##..|..#..|..#..|..#..|..#..|..#..|.###.',
  m: '.....|.....|##.#.|#.#.#|#.#.#|#.#.#|#...#',
  n: '.....|.....|#.##.|##..#|#...#|#...#|#...#',
  o: '.....|.....|.###.|#...#|#...#|#...#|.###.',
  p: '.....|.....|####.|#...#|#...#|#...#|####.|#....|#....',
  q: '.....|.....|.####|#...#|#...#|#...#|.####|....#|....#',
  r: '.....|.....|#.##.|##..#|#....|#....|#....',
  s: '.....|.....|.####|#....|.###.|....#|####.',
  t: '.#...|.#...|###..|.#...|.#...|.#..#|..##.',
  u: '.....|.....|#...#|#...#|#...#|#..##|.##.#',
  v: '.....|.....|#...#|#...#|#...#|.#.#.|..#..',
  w: '.....|.....|#...#|#...#|#.#.#|#.#.#|.#.#.',
  x: '.....|.....|#...#|.#.#.|..#..|.#.#.|#...#',
  y: '.....|.....|#...#|#...#|#...#|#...#|.####|....#|.###.',
  z: '.....|.....|#####|...#.|..#..|.#...|#####',
  0: '.###.|#...#|#..##|#.#.#|##..#|#...#|.###.',
  1: '..#..|.##..|..#..|..#..|..#..|..#..|.###.',
  2: '.###.|#...#|....#|...#.|..#..|.#...|#####',
  3: '#####|...#.|..#..|...#.|....#|#...#|.###.',
  4: '...#.|..##.|.#.#.|#..#.|#####|...#.|...#.',
  5: '#####|#....|####.|....#|....#|#...#|.###.',
  6: '..##.|.#...|#....|####.|#...#|#...#|.###.',
  7: '#####|....#|...#.|..#..|.#...|.#...|.#...',
  8: '.###.|#...#|#...#|.###.|#...#|#...#|.###.',
  9: '.###.|#...#|#...#|.####|....#|...#.|.##..',
  '.': '.....|.....|.....|.....|.....|.##..|.##..',
  ',': '.....|.....|.....|.....|.....|.##..|.##..|..#..|.#...',
  ':': '.....|.##..|.##..|.....|.##..|.##..|.....',
  '-': '.....|.....|.....|.###.|.....|.....|.....',
  '>': '.#...|..#..|...#.|....#|...#.|..#..|.#...',
  '<': '...#.|..#..|.#...|#....|.#...|..#..|...#.',
  '/': '....#|....#|...#.|..#..|.#...|#....|#....',
  '(': '...#.|..#..|.#...|.#...|.#...|..#..|...#.',
  ')': '.#...|..#..|...#.|...#.|...#.|..#..|.#...',
  '[': '.###.|.#...|.#...|.#...|.#...|.#...|.###.',
  ']': '.###.|...#.|...#.|...#.|...#.|...#.|.###.',
  '"': '.#.#.|.#.#.|.....|.....|.....|.....|.....',
  "'": '..#..|..#..|.....|.....|.....|.....|.....',
  '!': '..#..|..#..|..#..|..#..|..#..|.....|..#..',
  '?': '.###.|#...#|....#|...#.|..#..|.....|..#..',
  _: '.....|.....|.....|.....|.....|.....|#####',
  '*': '.....|..#..|#.#.#|.###.|#.#.#|..#..|.....',
  '=': '.....|.....|#####|.....|#####|.....|.....',
  '+': '.....|..#..|..#..|#####|..#..|..#..|.....',
};

// Logo: blocky 2-stroke capitals on a 7 x 9 grid (W is 8 wide), drawn at 4 px per cell.
const LOGO = {
  C: '..#####|.######|##.....|##.....|##.....|##.....|##.....|.######|..#####',
  A: '..###..|.#####.|##...##|##...##|#######|#######|##...##|##...##|##...##',
  S: '.######|#######|##.....|######.|.######|.....##|.....##|#######|######.',
  T: '######|######|..##..|..##..|..##..|..##..|..##..|..##..|..##..',
  W: '##....##|##....##|##....##|##.##.##|##.##.##|########|########|###..###|##....##',
  Y: '##..##|##..##|##..##|.####.|..##..|..##..|..##..|..##..|..##..',
};

// Rows of '#' into one path of merged rectangles (runs merged vertically too).
function bitmapPath(rows, ox = 0, oy = 0, s = 1) {
  const rects = [];
  let open = new Map();
  rows.forEach((row, y) => {
    const next = new Map();
    for (let x = 0; x < row.length; ) {
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
  return rects.map((r) => `M${ox + r.x * s} ${oy + r.y * s}h${r.w * s}v${r.h * s}h${-r.w * s}z`).join('');
}

// Multi-colour pixel sprite: rows of palette letters, one merged path per colour.
function sprite(rows, pal, ox = 0, oy = 0) {
  const w = rows[0].length;
  rows.forEach((r, i) => { if (r.length !== w) throw new Error(`sprite row ${i} "${r}" is ${r.length} wide, expected ${w}`); });
  let s = '';
  for (const [ch, col] of Object.entries(pal)) {
    const d = bitmapPath(rows.map((r) => [...r].map((c) => (c === ch ? '#' : '.')).join('')), ox, oy);
    if (d) s += `<path fill="${col}" d="${d}"/>`;
  }
  return s;
}

function makeFont(prefix, table, { bold = false, mono = 0, space = 3 } = {}) {
  const used = new Map();
  const rowsOf = (ch) => {
    const src = table[ch];
    if (src === undefined) throw new Error(`font ${prefix}: no glyph for ${JSON.stringify(ch)}`);
    let rows = src.split('|');
    if (bold) {
      rows = rows.map((r) => {
        const a = `${r}.`;
        const b = `.${r}`;
        return [...a].map((c, i) => (c === '#' || b[i] === '#' ? '#' : '.')).join('');
      });
    }
    return rows;
  };
  const font = {
    glyphW: (ch) => rowsOf(ch)[0].length,
    adv: (ch) => (mono || (ch === ' ' ? space : rowsOf(ch)[0].length + 1)),
    id(ch) {
      const id = prefix + ch.codePointAt(0).toString(36);
      if (!used.has(id)) used.set(id, bitmapPath(rowsOf(ch)));
      return id;
    },
    width: (str) => [...str].reduce((w, ch) => w + font.adv(ch), 0) - (mono ? 1 : 1),
    defs: () => [...used].map(([id, d]) => `<path id="${id}" d="${d}"/>`).join(''),
  };
  return font;
}
const ui = makeFont('u', UI);
const uib = makeFont('b', UI, { bold: true, space: 4 });
const mono = makeFont('m', MONO, { mono: 6 });

const defs = [];
// A run of glyphs (fill inherited unless given). `ul` underlines one character (accelerator key).
// Every distinct string is defined once in <defs> and placed with <use>, so repeats cost little.
const textCache = new Map();
function textDef(font, str, ul) {
  const key = `${font.id('.')}|${ul}|${str}`;
  if (!textCache.has(key)) {
    const id = `x${textCache.size.toString(36)}`;
    let s = '';
    let cx = 0;
    [...str].forEach((ch, i) => {
      if (ch !== ' ') s += `<use href="#${font.id(ch)}"${cx ? ` x="${cx}"` : ''}/>`;
      if (i === ul) s += `<path d="M${cx} 8h${font.glyphW(ch)}v1h${-font.glyphW(ch)}z"/>`;
      cx += font.adv(ch);
    });
    defs.push(`<g id="${id}">${s}</g>`);
    textCache.set(key, id);
  }
  return textCache.get(key);
}
function text(font, str, x, y, fill = null, { ul = -1 } = {}) {
  return `<use href="#${textDef(font, str, ul)}" x="${x}" y="${y}"${fill ? ` fill="${fill}"` : ''}/>`;
}
const textR = (font, str, rx, y, fill, o) => text(font, str, rx - font.width(str), y, fill, o);

// ------------------------------------------------------------------ bevels
const rect = (x, y, w, h, fill, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"${extra ? ` ${extra}` : ''}/>`;
const tl = (x, y, w, h) => `M${x} ${y}h${w - 1}v1h${-(w - 2)}v${h - 2}h-1z`;
const br = (x, y, w, h) => `M${x} ${y + h}h${w}v${-h}h-1v${h - 1}h${-(w - 1)}z`;
const BEVEL = {
  win: [P.light, P.hi, P.shadow, P.dark],
  btn: [P.hi, P.light, P.shadow, P.dark],
  sunk: [P.shadow, P.dark, P.light, P.hi],
};
function bevel(x, y, w, h, kind, face = P.face) {
  const [a, b, c, d] = BEVEL[kind];
  return (
    rect(x, y, w, h, face) +
    `<path fill="${a}" d="${tl(x, y, w, h)}"/><path fill="${d}" d="${br(x, y, w, h)}"/>` +
    `<path fill="${b}" d="${tl(x + 1, y + 1, w - 2, h - 2)}"/><path fill="${c}" d="${br(x + 1, y + 1, w - 2, h - 2)}"/>`
  );
}
const thinDown = (x, y, w, h) => `<path fill="${P.shadow}" d="${tl(x, y, w, h)}"/><path fill="${P.hi}" d="${br(x, y, w, h)}"/>`;

// ------------------------------------------------------------------ timeline helpers
// Every animated element carries a piecewise-constant CSS state: segs = [[t, css], ...] with
// segs[0][0] === 0. It gets step-end keyframes and an inline style equal to its t = 0 state.
const css = [];
let kfCount = 0;
const pct = (t) => `${n3((t / T) * 100)}%`;
function animAttr(segs) {
  const ev = [...segs].sort((a, b) => a[0] - b[0]);
  if (ev[0][0] !== 0) throw new Error('segs must start at t = 0');
  const clean = [];
  for (const e of ev) {
    if (clean.length && clean[clean.length - 1][0] === e[0]) clean.pop();
    if (!clean.length || clean[clean.length - 1][1] !== e[1]) clean.push(e);
  }
  if (clean.length === 1) return `style="${clean[0][1]}"`;
  const name = `k${(kfCount++).toString(36)}`;
  let out = `@keyframes ${name}{`;
  for (const [t, v] of clean) out += `${pct(t)}{${v}}`;
  css.push(`${out}}`);
  return `class="a" style="animation-name:${name};${clean[0][1]}"`;
}
// step-end holds the last keyframe to 100%, then the loop restarts at 0%, which is the t = 0
// state by construction, so there is never a jump at the loop point.
css.push(`.a{animation-duration:${T}s;animation-timing-function:step-end;animation-iteration-count:infinite}`);

// Visibility over a list of [from, to) intervals inside [0, T).
function visSegs(iv) {
  const on = (t) => iv.some(([a, b]) => t >= a && t < b);
  const pts = new Set([0]);
  for (const [a, b] of iv) { pts.add(a); if (b < T) pts.add(b); }
  return [...pts].sort((a, b) => a - b).map((t) => [t, on(t + 1e-6) ? 'opacity:1' : 'opacity:0']);
}
const vis = (iv) => animAttr(visSegs(iv));

// Piecewise-constant state machine -> one <g> per distinct state, each with its own visibility.
function stateGroups(times, fn, build) {
  const ts = [...new Set([0, ...times.filter((t) => t >= 0 && t < T)])].sort((a, b) => a - b);
  const segs = [];
  for (const t of ts) {
    const v = fn(t + 1e-6);
    if (!segs.length || segs[segs.length - 1].key !== v.key) segs.push({ t, v, key: v.key });
  }
  const groups = new Map();
  segs.forEach((s, i) => {
    const end = i + 1 < segs.length ? segs[i + 1].t : T;
    if (!groups.has(s.key)) groups.set(s.key, { v: s.v, iv: [] });
    groups.get(s.key).iv.push([s.t, end]);
  });
  let out = '';
  for (const { v, iv } of groups.values()) {
    const inner = build(v);
    out += groups.size === 1 ? inner : `<g ${vis(iv)}>${inner}</g>`;
  }
  return out;
}

// A sprite moved by hard cuts: pts = [[t, x, y] | [t, null]] (null = hidden).
function mover(href, pts) {
  const segs = pts.map(([t, x, y]) => [t, x === null ? 'opacity:0' : `opacity:1;transform:translate(${x}px,${y}px)`]);
  if (segs[0][0] !== 0) segs.unshift([0, 'opacity:0']);
  return `<use href="#${href}" ${animAttr(segs)}/>`;
}
// Two leg frames walking in hard-cut steps. Returns the time the walk ends.
function walker(idA, idB, x0, y0, dx, dy, dt, t0, keepGoing, out, onStep) {
  const a = [[0, null]];
  const b = [[0, null]];
  let x = x0;
  let y = y0;
  let t = t0;
  let f = 0;
  while (keepGoing(x, y, t)) {
    (f ? b : a).push([t, x, y]);
    (f ? a : b).push([t, null]);
    if (onStep) onStep(x, y, t);
    x += dx;
    y += dy;
    t = n3(t + dt);
    f ^= 1;
  }
  a.push([t, null]);
  b.push([t, null]);
  out.push(mover(idA, a), mover(idB, b));
  return { t, x: x - dx, y: y - dy };
}

const parts = [];
const push = (s) => parts.push(s);

// ------------------------------------------------------------------ layout
// The top band is a sunny wallpaper: the logo on the left, the island on the right. The scene is
// pixel art at 2 logical px per pixel ("scene units"); the window sits over the lower part of
// the sea, so the wallpaper still frames it on three sides.
const SC = 2;
const BAND = 130; // window top, logical px
const WY = BAND;
const WH = 243;
const WX = 8;
const WW = W - 16;
if (WY + WH + 8 !== H) throw new Error(`H should be ${WY + WH + 8}`);
const SW = W / SC; // 270 scene units across
const HZ = 38; // horizon, scene units

const scene = [];
const sp = (s) => scene.push(s);

// sky: banded, 256-colour wallpaper style
const SKY = ['#4fb2ea', '#5ebaed', '#6ec2ef', '#7fcaf1', '#90d2f4', '#a3daf6', '#b7e3f8', '#cdecfa'];
SKY.forEach((c, i) => {
  const y0 = Math.round((i * HZ) / SKY.length);
  const y1 = Math.round(((i + 1) * HZ) / SKY.length);
  sp(rect(0, y0, SW, y1 - y0, c));
});
const SEA = [['#36a6d8', 38], ['#2d9bd0', 41], ['#2690c7', 45], ['#2085bd', 50], ['#1a7ab3', 56], ['#156fa8', 63]];
SEA.forEach(([c, y], i) => sp(rect(0, y, SW, (i + 1 < SEA.length ? SEA[i + 1][1] : H / SC) - y, c)));
sp(rect(0, HZ, SW, 1, '#8fd3f0'));

// the sun, soft, top right
{
  const disc = [];
  for (let y = -7; y <= 7; y++) {
    let row = '';
    for (let x = -7; x <= 7; x++) {
      const d = Math.hypot(x, y);
      row += d <= 4.2 ? 's' : d <= 5.6 ? 'g' : d <= 7.1 ? 'h' : '.';
    }
    disc.push(row);
  }
  sp(sprite(disc, { h: '#bfe6fa', g: '#fff1bd', s: '#fffbe8' }, 252 - 7, 11 - 7));
}

// clouds drifting left in 1-px steps; each has a twin one loop-length behind, so it wraps cleanly
const CLOUD_A = [
  '.......wwww..........',
  '.....wwwwwwww..ww....',
  '..wwwwwwwwwwwwwwwww..',
  '.wwwwwwwwwwwwwwwwwwww',
  'bbbwwwwwwwwwwwwwwwbbb',
  '..bbbbbbbbbbbbbbbbb..',
];
const CLOUD_B = [
  '......wwww......',
  '...wwwwwwwww....',
  '.wwwwwwwwwwwwww.',
  'bbwwwwwwwwwwwbbb',
  '..bbbbbbbbbbbb..',
];
defs.push(`<g id="cla">${sprite(CLOUD_A, { w: '#ffffff', b: '#cfeafa' })}</g>`);
defs.push(`<g id="clb">${sprite(CLOUD_B, { w: '#ffffff', b: '#cfeafa' })}</g>`);
const SPAN = SW + 24;
function drift(href, x0, y) {
  let s = '';
  for (const start of [x0, x0 + SPAN]) {
    const name = `k${(kfCount++).toString(36)}`;
    css.push(`@keyframes ${name}{0%{transform:translate(${start}px,${y}px)}100%{transform:translate(${start - SPAN}px,${y}px)}}`);
    s += `<use href="#${href}" style="animation:${name} ${T}s steps(${SPAN}) infinite;transform:translate(${start}px,${y}px)"/>`;
  }
  return s;
}
sp(drift('cla', 150, 13));
sp(drift('clb', 62, 2));
sp(drift('clb', 214, 23));

// gulls, flapping on the beat
defs.push(`<g id="gul">${sprite(['k...k', '.w.w.', '..w..'], { k: '#5d6f7c', w: '#ffffff' })}</g>`);
defs.push(`<g id="gu2">${sprite(['.....', 'kwwwk', '..w..'], { k: '#5d6f7c', w: '#ffffff' })}</g>`);
css.push('@keyframes fA{0%{opacity:1}50%{opacity:0}}@keyframes fB{0%{opacity:0}50%{opacity:1}}');
css.push(`.fA{animation:fA ${BEAT}s step-end infinite}.fB{opacity:0;animation:fB ${BEAT}s step-end infinite}`);
for (const [x, y] of [[226, 21], [235, 17]]) sp(`<use href="#gul" x="${x}" y="${y}" class="fA"/><use href="#gu2" x="${x}" y="${y}" class="fB"/>`);

// sea glints, blinking once a bar each on its own phase
{
  let g = '';
  css.push('@keyframes gl{0%{opacity:0}55%{opacity:.9}80%{opacity:0}}');
  css.push('.gl{fill:#e3f6ff;opacity:0;animation:gl 3s step-end infinite}');
  for (let i = 0; i < 26; i++) {
    const x = Math.floor(rand() * SW);
    const y = HZ + 2 + Math.floor(rand() * 24);
    if (x > 140 && x < 252 && y > 48) continue; // not on the island
    g += `<rect x="${x}" y="${y}" width="${rand() < 0.5 ? 2 : 1}" height="1" class="gl" style="animation-delay:-${n3(rand() * 3)}s"/>`;
  }
  sp(g);
}

// ---- the ship: crosses the horizon right to left while she is busy with the sandcastle.
// Five rows, sitting on the horizon line, so it passes under the tag line instead of behind it.
const SHIP = [
  '.............ff...........',
  '........wwwwwffwww........',
  'wwwwwwwwwbwbwbwbwbwwwwwwww',
  '.rrrrrrrrrrrrrrrrrrrrrrrr.',
  '..dddddddddddddddddddddd..',
];
defs.push(`<g id="ship">${sprite(SHIP, { f: '#e8604c', k: '#3a3a44', w: '#f7f7f2', b: '#4c6a8a', r: '#d4493e', d: '#3b4d6b' })}</g>`);
const SHIP_T0 = 13.5;
const SHIP_T1 = 21.75;
{
  const x0 = SW + 2;
  const x1 = -28;
  const y = HZ - SHIP.length + 1;
  const name = `k${(kfCount++).toString(36)}`;
  css.push(
    `@keyframes ${name}{0%{opacity:0;transform:translate(${x0}px,${y}px)}` +
      `${pct(SHIP_T0)}{opacity:1;transform:translate(${x0}px,${y}px);animation-timing-function:steps(${x0 - x1},end)}` +
      // opacity stays 1 at SHIP_T1 too: the steps() segment interpolates every property, so a 0
      // here would fade the ship out as it crossed. It is off screen by then; step-end hides it.
      `${pct(SHIP_T1)}{opacity:1;transform:translate(${x1}px,${y}px)}${pct(SHIP_T1 + 0.25)}{opacity:0;transform:translate(${x1}px,${y}px)}100%{opacity:0;transform:translate(${x1}px,${y}px)}}`,
  );
  sp(`<use href="#ship" class="a" style="animation-name:${name};opacity:0;transform:translate(${x0}px,${y}px)"/>`);
}

// ---- the island
const ISL = { cx: 197, wl: 62 };
{
  const half = [[50, 14], [51, 24], [52, 31], [53, 36], [54, 40], [55, 43], [56, 45], [57, 47], [58, 48], [59, 49], [60, 49], [61, 48]];
  let sand = '';
  let shade = '';
  let lit = '';
  for (const [y, h] of half) {
    const a = ISL.cx - h;
    sand += `M${a} ${y}h${2 * h}v1h${-2 * h}z`;
    if (y >= 59) shade += `M${a} ${y}h${2 * h}v1h${-2 * h}z`;
    if (y <= 52) lit += `M${a + 3} ${y}h${2 * h - 10}v1h${-(2 * h - 10)}z`;
  }
  const wet = `M${ISL.cx - 47} 62h94v1h-94zM${ISL.cx - 43} 63h86v1h-86z`;
  sp(`<path fill="#f3dba5" d="${sand}"/><path fill="#fae9c0" d="${lit}"/><path fill="#e5c58a" d="${shade}"/><path fill="#c7a46b" d="${wet}"/>`);
  let speck = '';
  for (let i = 0; i < 30; i++) {
    const [y, h] = half[2 + Math.floor(rand() * (half.length - 3))];
    speck += `M${ISL.cx - h + 2 + Math.floor(rand() * (2 * h - 4))} ${y}h1v1h-1z`;
  }
  sp(`<path fill="#d9b679" d="${speck}"/>`);
  // the shore wave: two states swapped every bar, the foam running up the sand and back
  const c = ISL.cx;
  const foamA = `M${c - 52} 60h4v1h-4zM${c - 50} 61h6v1h-6zM${c + 46} 61h6v1h-6zM${c + 49} 60h3v1h-3zM${c - 40} 64h18v1h-18zM${c - 6} 64h26v1h-26zM${c + 28} 64h14v1h-14z`;
  const foamB = `M${c - 50} 59h3v1h-3zM${c - 49} 60h5v1h-5zM${c + 44} 60h5v1h-5zM${c + 47} 59h3v1h-3zM${c - 34} 63h12v1h-12zM${c - 14} 64h20v1h-20zM${c + 14} 63h22v1h-22z`;
  sp(`<path fill="#ffffff" d="${foamA}" class="fA" style="animation-duration:3s"/>`);
  sp(`<path fill="#ffffff" d="${foamB}" class="fB" style="animation-duration:3s"/>`);
  // scrub
  const BUSH = ['...gg.g...', '.gGggggg..', 'gGgGggGgg.', 'GgGGgGGgGg'];
  defs.push(`<g id="bush">${sprite(BUSH, { g: '#52b04c', G: '#2f7d39' })}</g>`);
  sp(`<use href="#bush" x="${c + 18}" y="49"/><use href="#bush" x="${c - 37}" y="52"/>`);
}

// ---- the raft, moored off the left shore, bobbing a pixel every other bar
const RAFT = ['..t.....t.....t..', 'LLLLLLLLLLLLLLLLL', 'lllllllllllllllll', 'LLLLLLLLLLLLLLLLL'];
defs.push(`<g id="raft">${sprite(RAFT, { t: '#efe1b5', L: '#9c6a38', l: '#b98448' })}</g>`);
css.push('@keyframes bob{0%{transform:translateY(0)}50%{transform:translateY(1px)}}');
sp(`<g style="animation:bob 6s step-end infinite"><use href="#raft" x="104" y="57"/></g>`);

// ---- the palm: tall, slender, segmented reddish-tan trunk with a gentle lean
const PALM = { bx: 211, by: 61, tx: 204, ty: 14 };
{
  let trunk = '';
  let ring = '';
  let hl = '';
  const n = PALM.by - PALM.ty;
  for (let i = 0; i <= n; i++) {
    const y = PALM.by - i;
    const f = i / n;
    const x = Math.round(PALM.bx + (PALM.tx - PALM.bx) * (f * f * 0.65 + f * 0.35) + Math.sin(f * Math.PI) * 2);
    const w = f < 0.3 ? 3 : 2;
    trunk += `M${x} ${y}h${w}v1h${-w}z`;
    if (i % 3 === 0) ring += `M${x} ${y}h${w}v1h${-w}z`;
    else hl += `M${x} ${y}h1v1h-1z`;
  }
  sp(`<path fill="#b4774f" d="${trunk}"/><path fill="#d0956a" d="${hl}"/><path fill="#87523a" d="${ring}"/>`);
  const FROND = [
    '...........gggg.............ggg.........',
    '.......gggggGGGgg.......ggggGGGggg......',
    '....ggggGGGGgggGGgg..gggGGGgggGGGGggg...',
    '..gggGGGggg...ggGGggGGGgg....gggGGGGgg..',
    '.ggGGgg.........gGGGGgg.........ggGGGgg.',
    'gGGgg.........ggGGnnGGgg..........gGGgg.',
    'Ggg.........ggGg.nnnn.gGgg..........gGG.',
    'g..........gGg...nNnn...gGg..........gg.',
    '..........gGg.....nn.....gGg.........g..',
    '.........gGg.............gGg............',
    '.........gg...............gg............',
    '........g.................g.............',
  ];
  defs.push(`<g id="crown">${sprite(FROND, { g: '#46a84a', G: '#2b7a35', n: '#6b4526', N: '#8c6038' })}</g>`);
  sp(`<use href="#crown" x="${PALM.tx - 19}" y="${PALM.ty - 5}"/>`);
}

// ---- the cat, a grey tabby with a white chest, curled up asleep in the crown all loop
const CAT = ['........g.g', '..gGgGg.ggg', '.gGgGgGgggg', 'ggggggggWge', 'tgggggggWW.', '.tt........'];
defs.push(`<g id="cat">${sprite(CAT, { g: '#a3a7ac', G: '#6d7178', W: '#f7f7f4', t: '#6d7178', e: '#3a3a3a' })}</g>`);
sp(`<use href="#cat" x="${PALM.tx - 5}" y="${PALM.ty - 10}"/>`);
{
  defs.push(`<path id="zz" fill="#ffffff" d="${bitmapPath(['###', '..#', '.#.', '###'])}"/>`);
  css.push('@keyframes zz{0%{opacity:1;transform:translate(0,0)}33%{transform:translate(2px,-1px)}66%{opacity:1;transform:translate(4px,-3px)}90%{opacity:0}}');
  sp(`<use href="#zz" x="${PALM.tx + 7}" y="${PALM.ty - 10}" style="animation:zz 3s step-end infinite"/>`);
}

// ---- her: brown hair in a loose low bun, cream headphones, coral tank top, cream shorts,
// bare feet. Small and simple: front view sitting, kneeling and throwing, side view walking.
const HER = {
  p: '#fbf4e2', P: '#f1e5c4', K: '#a08756', h: '#6e4528', H: '#4a2c17', s: '#f3c6a0', S: '#d99d76',
  b: '#f2a08a', e: '#3a2620', c: '#ef7a61', C: '#c95d47', w: '#f2e8cc',
  i: '#dff3fb', o: '#9a6440', r: '#ef6f6a', g: '#3c9e6c', G: '#a5e3bf',
};
const HEAD = ['....ppp....', '..pphhhpp..', '.KphhhhhpK.', 'KPhhhhhhhPK', 'KPhssssshPK', '..hsesesh..', '..hbsssbhH.', '...SsssSHH.'];
const SIT_BODY = ['....SsS....', '..ScccccS..', '.s.ccccc.s.', '.s.CcccC.s.', '.swwwwwwws.', 'wwwwwwwwwww', 'ssSsssssSss'];
const SIT_CUP = ['....SsS.r..', '..ScccccSr.', '.s.cccsiis.', '.s.Cccsois.', '.swwwwwwws.', 'wwwwwwwwwww', 'ssSsssssSss'];
const KNEEL_A = ['....SsS....', '..ScccccS..', '.s.ccccc.s.', 's..CcccC..s', 's.wwwwwww.s', '.wwwwwwwww.', '.SsssSsssS.'];
const KNEEL_B = ['....SsS....', '..ScccccS..', '.s.ccccc.s.', '.s.CcccC..s', '.swwwwwww.s', '.wwwwwwwww.', '.SsssSsssS.'];
const LEGS = ['...wwwww...', '...ww.ww...', '...ss.ss...', '...ss.ss...', '...ss.ss...', '...Ss.sS...', '..sss.sss..'];
// standing, the bottle held up in her right hand
const THROW = [
  ...HEAD.map((r, i) => (i === 0 ? `${r.slice(0, 9)}.g` : i === 1 ? `${r.slice(0, 9)}gg` : i < 5 ? `${r.slice(0, 10)}s` : r)),
  '....SsS..s.', '..ScccccSs.', '.s.ccccc...', '.s.CcccC...', '.s.ccccc...', '.swwwwww...', ...LEGS,
];
const SIDE_HEAD = ['...ppp...', '..hhhph..', '.hhhhphh.', '.hhhKPKhs', '.hhhKPKes', 'HhhhhKsss', 'HH.hhsss.', '.....SS..'];
const WALK_A = [...SIDE_HEAD, '....ccc..', '...cccc..', '...ccsc..', '...ccsc..', '...cwsc..', '...wwww..', '...wwww..', '...s..s..', '..s...s..', '..s....s.', '..s....s.', '.ss....ss'];
const WALK_B = [...SIDE_HEAD, '....ccc..', '...cccc..', '...cccs..', '...cccs..', '...cwws..', '...wwww..', '...wwww..', '....ss...', '....ss...', '....ss...', '....ss...', '...sss...'];
// carrying the iced coffee in front of her (drawn facing right, then flipped to walk back left)
const cupRows = (rows) => {
  const out = [...rows];
  out[9] = '...cccc.r';
  out[10] = '...cccsii';
  out[11] = '...cccsoi';
  out[12] = '...cwww..';
  return out;
};
const flip = (rows) => rows.map((r) => [...r].reverse().join(''));
const spr = (id, rows, dy = 0) => defs.push(`<g id="${id}">${sprite(rows, HER, 0, dy)}</g>`);
spr('hhead', HEAD);
spr('hsit', SIT_BODY, 8);
spr('hsitcup', SIT_CUP, 8);
spr('hknA', KNEEL_A, 8);
spr('hknB', KNEEL_B, 8);
spr('hthrow', THROW);
spr('hthrow0', THROW.map((r) => r.replace(/g/g, '.')));
spr('hwA', WALK_A);
spr('hoA', cupRows(WALK_A));
spr('hoB', cupRows(WALK_B));
spr('hwB', WALK_B);
spr('hcA', flip(cupRows(WALK_A)));
spr('hcB', flip(cupRows(WALK_B)));

// props
const PROP = { o: '#c49461', g: '#3c9e6c', G: '#a5e3bf', r: '#ef6f6a', i: '#dff3fb', c: '#9a6440' };
defs.push(`<g id="btl">${sprite(['.o.', 'gg.', 'gGg', 'gGg', 'ggg'], PROP)}</g>`);
defs.push(`<g id="btls">${sprite(['.ggggGo', 'gGGggg.', '.gggg..'], PROP)}</g>`);
defs.push(`<g id="cup">${sprite(['..r', '.r.', 'iii', 'ici', 'ici', '.i.'], PROP)}</g>`);
const SAND_P = { a: '#ecc98a', A: '#c99e5f', r: '#ef7a61', k: '#6b5a4a' };
defs.push(`<g id="sc1">${sprite(['.aaa.', 'aAaAa'], SAND_P)}</g>`);
defs.push(`<g id="sc2">${sprite(['.a.a.a.', '.aaaaa.', 'aaAaAaa', 'AaaaaaA'], SAND_P)}</g>`);
defs.push(`<g id="sc3">${sprite(['....r....', '....k....', '.a.aaa.a.', '.aaaaaaa.', '.aaaAaaa.', 'aaaAAAaaa', 'AaaaaaaaA'], SAND_P)}</g>`);
defs.push(`<g id="sc4">${sprite(['...a.a...', '..aaaaa..', '.aaaAaaa.', 'AaaaaaaaA'], SAND_P)}</g>`);
defs.push(`<g id="sc5">${sprite(['..aaaaa..', 'AaaAaAaaA'], SAND_P)}</g>`);
const CRAB_P = { o: '#e3a867', O: '#a96d36', r: '#e2553a', R: '#a8301f', n: '#6a4527', N: '#93653d', e: '#2a1a14' };
defs.push(`<g id="crA">${sprite(['..ooo.', '.oOOo.', 'eroOoo', 'Rr.r.r'], CRAB_P)}</g>`);
defs.push(`<g id="crB">${sprite(['..ooo.', '.oOOo.', 'eroOoo', 'R.r.r.'], CRAB_P)}</g>`);
defs.push(`<g id="cnA">${sprite(['.nnnn.', 'nNnnNn', 'nnnnnn', 'r.r.rR'], CRAB_P)}</g>`);
defs.push(`<g id="cnB">${sprite(['.nnnn.', 'nNnnNn', 'nnnnnn', '.r.r.R'], CRAB_P)}</g>`);
defs.push(`<g id="coco">${sprite(['.nn.', 'nNnn', 'nnnn', '.nn.'], CRAB_P)}</g>`);
// the shark in profile, snout towards the island: dorsal fin behind, a cream headband over the
// top of its head and one cup on the near side
const SHARK_ROWS = [
  '......pp.....',
  '.....pFFF....',
  '.F..PPFFFFF..',
  '.FF.PPFFFeFF.',
  'FFF.PPFFFFFFF',
  'FFFFFFFFFmmmF',
  'ffffffWWWWWW.',
];
defs.push(`<g id="shark">${sprite(SHARK_ROWS, { p: '#f6eed8', P: '#d9cba3', F: '#6f7f8f', f: '#5b6a79', W: '#e9eff3', e: '#1b2430', m: '#3b4652' })}</g>`);
defs.push(`<path id="wake" fill="#d7f1ff" d="M0 0h3v1h-3zM7 0h3v1h-3z"/>`);

// ---- her timeline. Slots: bottle 0-12, sandcastle 12-24, coconut 24-36, cat and shark 36-45,
// leaving any time 45-60. Positions are each sprite's top-left, in scene units.
const SIT = { x: 176, y: 46 }; // sitting is 15 rows tall: feet on the sand at y 61
const LEAVE = 45;
css.push(`@keyframes nod{0%{transform:translateY(1px)}40%{transform:translateY(0)}}.nod{animation:nod ${BEAT}s step-end infinite}`);
const nodder = (bodyId, x, y, iv) => `<g ${vis(iv)}><use href="#${bodyId}" x="${x}" y="${y}"/><g class="nod"><use href="#hhead" x="${x}" y="${y}"/></g></g>`;

// the bottle: on the sand beside her from 9 s (washed straight back) round to 3 s
sp(`<use href="#btls" x="${SIT.x - 18}" y="58" ${vis([[9, T], [0, 3]])}/>`);
// the cup: on the sand from 3 s until she leaves (in her hand otherwise)
sp(`<use href="#cup" x="${SIT.x - 7}" y="55" ${vis([[3, LEAVE]])}/>`);
// throwing: 3 .. 4.5; the bottle's arc out to sea off the left shore, bobbing, drifting back
sp(`<use href="#hthrow" x="${SIT.x}" y="${SIT.y - 6}" ${vis([[3, 3.75]])}/>`);
sp(`<use href="#hthrow0" x="${SIT.x}" y="${SIT.y - 6}" ${vis([[3.75, 4.5]])}/>`);
sp(
  mover('btl', [
    [0, null], [3.75, SIT.x + 9, 37], [4.125, 176, 31], [4.5, 166, 30], [4.875, 157, 34], [5.25, 149, 41],
    [5.625, 143, 49], [6.0, 139, 56], [6.75, 139, 55], [7.5, 141, 56], [7.875, 143, 55], [8.25, 145, 56],
    [8.625, 147, 55], [9.0, null],
  ]),
);
sp(nodder('hsit', SIT.x, SIT.y, [[4.5, 12], [18, LEAVE]]));

// the sandcastle: she kneels and pats it up on the beat, admires it, and the tide takes it
{
  const kx = SIT.x + 3;
  sp(
    `<g ${vis([[12, 18]])}><use href="#hknA" x="${kx}" y="${SIT.y}" class="fA" style="animation-duration:${BEAT * 2}s"/>` +
      `<use href="#hknB" x="${kx}" y="${SIT.y}" class="fB" style="animation-duration:${BEAT * 2}s"/>` +
      `<g class="nod"><use href="#hhead" x="${kx}" y="${SIT.y}"/></g></g>`,
  );
  const cx = SIT.x + 15;
  const base = 60;
  sp(`<use href="#sc1" x="${cx + 2}" y="${base - 2}" ${vis([[13.5, 15]])}/>`);
  sp(`<use href="#sc2" x="${cx + 1}" y="${base - 4}" ${vis([[15, 16.5]])}/>`);
  sp(`<use href="#sc3" x="${cx}" y="${base - 7}" ${vis([[16.5, 21]])}/>`);
  sp(`<use href="#sc4" x="${cx}" y="${base - 4}" ${vis([[21, 21.75]])}/>`);
  sp(`<use href="#sc5" x="${cx}" y="${base - 2}" ${vis([[21.75, 22.5]])}/>`);
  sp(`<path fill="#ffffff" d="M${cx - 6} ${base}h22v1h-22zM${cx - 10} ${base + 1}h30v1h-30zM${cx - 3} ${base - 1}h10v1h-10z" ${vis([[21, 22.5]])}/>`);
  sp(`<path fill="#d9b679" d="M${cx - 2} ${base - 1}h14v2h-14z" ${vis([[22.5, 24]])}/>`);
}

// coconut and hermit crab
{
  const cy = 56;
  const UNDER = PALM.tx - 2;
  const tA = [];
  const end = walker('crA', 'crB', 244, cy, -4, 0, 0.25, 24.0, (x) => x > UNDER, tA);
  scene.push(...tA);
  const stopX = end.x;
  // the walking frames stay on the last step until the coconut lands
  sp(mover('crA', [[0, null], [end.t, stopX, cy], [27.75, null]]));
  sp(
    mover('coco', [
      [0, null], [27.0, stopX + 1, PALM.ty + 2], [27.25, stopX + 1, 24], [27.5, stopX + 1, 36], [27.625, stopX + 1, 46], [27.75, null],
    ]),
  );
  // the crab, now wearing the coconut, walks off down the beach and into the surf
  const tB = [];
  walker('cnA', 'cnB', stopX, cy, 0, 0, 0.25, 27.75, (x, y, t) => t < 28.5, tB);
  scene.push(...tB);
  const tC = [];
  walker('cnA', 'cnB', stopX + 4, cy + 1, 4, 1, 0.25, 28.5, (x, y) => y < 67, tC);
  scene.push(...tC);
}

// the shark surfaces off the left shore and nods along, 39 .. 44.25
const SHARK = [39, 44.25];
sp(`<g ${vis([SHARK])}><g class="nod"><use href="#shark" x="78" y="${57 - SHARK_ROWS.length}"/></g><path fill="#d7f1ff" d="M75 57h18v1h-18z"/></g>`);

// "She could leave any time": she stands, walks off over the water and out of shot, and walks
// back with an iced coffee.
let HER_AT_SEA = [0, 0];
let SITB = 0;
{
  const WATER_X = ISL.cx + 46;
  const STEP = 6;
  const DT = 0.25;
  const wake = [[0, null]];
  let wetOut = null;
  let dryBack = null;
  const onSea = (x) => x + 5 > WATER_X;
  const tOut = [];
  // out she goes with the empty cup, and back she comes with a full one
  const out = walker('hoA', 'hoB', SIT.x, SIT.y - 5, STEP, 0, DT, LEAVE, (x) => x < SW + 1, tOut, (x, y, t) => {
    if (onSea(x) && wetOut === null) wetOut = t;
    wake.push(onSea(x) ? [t, x, y + 20] : [t, null]);
  });
  scene.push(...tOut);
  wake.push([out.t, null]);
  const back = n3(out.t + 3);
  const tBack = [];
  const ret = walker('hcA', 'hcB', SW + 1, SIT.y - 5, -STEP, 0, DT, back, (x) => x > SIT.x + 2, tBack, (x, y, t) => {
    if (!onSea(x) && dryBack === null) dryBack = t;
    wake.push(onSea(x) ? [t, x - 1, y + 20] : [t, null]);
  });
  scene.push(...tBack);
  SITB = ret.t;
  HER_AT_SEA = [wetOut, dryBack];
  sp(mover('wake', wake));
}
sp(nodder('hsitcup', SIT.x, SIT.y, [[SITB, T], [0, 3]]));

push(`<g transform="scale(${SC})">${scene.join('')}</g>`);

// ------------------------------------------------------------------ the logo and tag line
{
  // The logo sits high enough that the tag line clears the horizon, where the ship sails.
  const s = 5;
  let x = 18;
  const y = 8;
  let glyphs = '';
  for (const ch of 'CASTAWAY') {
    const rows = LOGO[ch].split('|');
    glyphs += bitmapPath(rows, x, y, s);
    x += rows[0].length * s + s;
  }
  defs.push(
    `<linearGradient id="lg" x1="0" y1="${y}" x2="0" y2="${y + 9 * s}" gradientUnits="userSpaceOnUse">` +
      `<stop offset="0" stop-color="#fffaf0"/><stop offset=".42" stop-color="#ffe2a6"/><stop offset=".58" stop-color="#ffb476"/><stop offset="1" stop-color="#ef6c55"/></linearGradient>`,
  );
  defs.push(`<path id="logo" d="${glyphs}"/>`);
  push(`<use href="#logo" x="4" y="4" fill="#123f68" opacity=".5"/>`);
  for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, 1], [1, -1], [-1, 1]]) push(`<use href="#logo" x="${dx}" y="${dy}" fill="#51202e"/>`);
  push(`<use href="#logo" fill="url(#lg)"/>`);
  const tag = 'ten hours of site-to-site transfer, mostly waiting';
  const tagY = y + 9 * s + 6;
  // the ship's funnel is its top row; the tag line's descenders must end above it
  if (tagY + 9 > (HZ - SHIP.length + 1) * SC) throw new Error('tag line would overlap the ship');
  push(text(uib, tag, 19, tagY, '#0d3d61'));
}

// ------------------------------------------------------------------ the window
push(bevel(WX, WY, WW, WH, 'win'));
{
  defs.push(`<linearGradient id="ta" x1="0" x2="1"><stop offset="0" stop-color="${P.t1}"/><stop offset="1" stop-color="${P.t2}"/></linearGradient>`);
  push(rect(WX + 3, WY + 3, WW - 6, 13, 'url(#ta)'));
  // app icon: a tombolo, two blobs of land tied by a sandbar, with a palm on one
  const ICON = ['..g......', 'gGgGg....', '..k......', '..k......', 'yyyyb.yyb', 'yyyyyyyyy', 'bbbbbbbbb'];
  push(sprite(ICON, { g: '#7fe08a', G: '#3fa04a', k: '#c08a5a', y: '#f7dc9a', b: '#7fd0f0' }, WX + 6, WY + 5));
  push(text(uib, 'Tombolo FXP  -  [island]  <->  [the sea]', WX + 19, WY + 6, '#ffffff'));
  const TB = {
    min: '......|......|......|.####.|.####.',
    max: '######|######|#....#|#....#|######',
    close: '##..##|.####.|..##..|.####.|##..##',
  };
  let bx = WX + WW - 3 - 2 - 12;
  for (const k of ['close', 'max', 'min']) {
    push(bevel(bx, WY + 5, 12, 10, 'btn') + `<path fill="${P.ink}" d="${bitmapPath(TB[k].split('|'), bx + 3, WY + 7)}"/>`);
    bx -= k === 'close' ? 14 : 12;
  }
}
{
  const items = ['Session', 'Sites', 'Queue', 'Commands', 'Directory', 'Tide', 'View', 'Help'];
  let x = WX + 8;
  for (const it of items) {
    push(text(ui, it, x, WY + 20, P.ink, { ul: 0 }));
    x += ui.width(it) + 11;
  }
  push(rect(WX + 3, WY + 30, WW - 6, 1, P.shadow) + rect(WX + 3, WY + 31, WW - 6, 1, P.hi));
}

// ---- pane geometry
const PY = WY + 34;
const LP = { x: WX + 4, w: 256 };
const RP = { x: WX + 4 + 256 + 4, w: 256 };
const ROWH = 10;
const NROWS = 6;
const LIST_Y = PY + 31;
const LIST_H = 2 + 12 + NROWS * ROWH + 2;
const STRIP_Y = LIST_Y + LIST_H + 1;
const BY = STRIP_Y + 12 + 4;

const IC = { k: '#1d1d1d', y: '#f5d35a', Y: '#c9a227', o: '#8a6d1a', w: '#ffffff', g: '#9a9a9a', r: '#d6402e', R: '#8f2016', e: '#3aa64a', E: '#1d6e2a', b: '#2d6fd0' };
const ICONS = {
  connect: ['...yyk', '..yyk.', '.yyyyk', 'yyyyk.', '..yk..', '.yk...', 'yk....', 'k.....'],
  refresh: ['..eee...', '.e...e.E', 'e.....EE', 'e....EEE', '.......E', 'E.......', 'E.....e.', '.E...e..', '..EEE...'],
  up: ['..e.....', '.eee....', 'eeeee...', '..e.oooo', '..eyyyyo', '.yyyyyyo', '.yyyyyyo', '.ooooooo'],
  stop: ['.RRRR.', 'RrrrrR', 'RrwwrR', 'RrwwrR', 'RrrrrR', '.RRRR.'],
  send: ['....e...', '....ee..', 'eeeeeee.', 'eeeeeeee', 'eeeeeee.', '....ee..', '....e...'],
  sendL: ['...e....', '..ee....', '.eeeeeee', 'eeeeeeee', '.eeeeeee', '..ee....', '...e....'],
  folder: ['.yyy.....', 'yYYYyyyyy', 'yyyyyyyyy', 'yYYYYYYYo', 'yYYYYYYYo', 'yYYYYYYYo', 'ooooooooo'],
  file: ['gggggg.', 'gwwwwgg', 'gwwwwwg', 'gwgggwg', 'gwwwwwg', 'gwgggwg', 'gwwwwwg', 'ggggggg'],
  wave: ['gggggg.', 'gwwwbgg', 'gwwwbbg', 'gwwwbwg', 'gwbbbwg', 'gbbbbwg', 'gwbbwwg', 'ggggggg'],
  msg: ['ggggggg', 'gwwwwwg', 'gbwwwbg', 'gwbwbwg', 'gwwbwwg', 'gwwwwwg', 'ggggggg'],
  qsend: ['...e...', '...ee..', 'eeeeee.', 'eeeeeee', 'eeeeee.', '...ee..', '...e...'],
  qfail: ['r.....r', '.r...r.', '..r.r..', '...r...', '..r.r..', '.r...r.', 'r.....r'],
};
for (const [k, rows] of Object.entries(ICONS)) defs.push(`<g id="i-${k}">${sprite(rows, IC)}</g>`);

function listFrame(x, y, w, h, cols) {
  let s = bevel(x, y, w, h, 'sunk', P.white);
  let cx = x + 2;
  for (const c of cols) {
    s += bevel(cx, y + 2, c.w, 12, 'btn');
    if (c.right) s += textR(ui, c.label, cx + c.w - 4, y + 4, P.ink);
    else s += text(ui, c.label, cx + 4, y + 4, P.ink);
    if (c.sort) s += `<path fill="${P.shadow}" d="M${cx + 8 + ui.width(c.label)} ${y + 6}h5v1h-1v1h-1v1h-1v-1h-1v-1h-1z"/>`;
    cx += c.w;
  }
  if (cx < x + w - 2) s += bevel(cx, y + 2, x + w - 2 - cx, 12, 'btn');
  return s;
}
function toolbarAndPath(pane, sendIcon) {
  const { x, w } = pane;
  let s = '';
  let bx = x + 2;
  for (const ic of ['connect', 'refresh', 'up', 'stop']) {
    s += `<use href="#i-${ic}" x="${bx + 4}" y="${PY + 3}"/>`;
    bx += 17;
  }
  s += rect(bx + 1, PY + 2, 1, 11, P.shadow) + rect(bx + 2, PY + 2, 1, 11, P.hi);
  s += bevel(x + w - 22, PY + 1, 20, 14, 'btn') + `<use href="#i-${sendIcon}" x="${x + w - 16}" y="${PY + 4}"/>`;
  const py = PY + 17;
  s += bevel(x, py, w, 13, 'sunk', P.white);
  s += bevel(x + w - 13, py + 2, 11, 9, 'btn') + `<path fill="${P.ink}" d="M${x + w - 10} ${py + 5}h5v1h-1v1h-1v1h-1v-1h-1v-1h-1z"/>`;
  // the path text lives in the pane state (it goes blank when the island disconnects)
  return s;
}
push(toolbarAndPath(LP, "send") + toolbarAndPath(RP, "sendL"));

// ---- pane rows, each defined once and placed by the pane states
const DAY1 = '30/09/26';
const DAY2 = '01/10/26';
const ROW = {
  palm: { icon: 'folder', name: 'palm', size: '', date: DAY1, dir: true },
  raft: { icon: 'folder', name: 'raft', size: '', date: DAY1, dir: true },
  bottle: { icon: 'msg', name: 'bottle.msg', size: '1,992', date: DAY1, bytes: 1992 },
  coffee: { icon: 'file', name: 'iced.coffee', size: '1', date: DAY2, bytes: 1 },
  theme: { icon: 'wave', name: 'theme_60s.wav', size: '11,520,044', date: DAY2, bytes: 11520044 },
  sand1: { icon: 'file', name: 'sandcastle', size: '120', date: DAY2, bytes: 120 },
  sand2: { icon: 'file', name: 'sandcastle', size: '480', date: DAY2, bytes: 480 },
  sand3: { icon: 'file', name: 'sandcastle', size: '960', date: DAY2, bytes: 960 },
  deep: { icon: 'folder', name: 'deep', size: '', date: '01/01/70', dir: true, attr: 'drwxr-xr-x' },
  ocean: { icon: 'wave', name: 'ocean_60s.wav', size: '11,520,044', date: DAY2, bytes: 11520044, attr: '-rw-r--r--' },
  shark: { icon: 'file', name: 'shark', size: '1', date: DAY1, bytes: 1, attr: '-rw-r--r--' },
  turtle: { icon: 'file', name: 'turtle', size: '1', date: DAY1, bytes: 1, attr: '-rw-r--r--' },
  ship: { icon: 'file', name: 'ship', size: '1', date: DAY2, bytes: 1, attr: '-r--r--r--' },
  sbottle: { icon: 'msg', name: 'bottle.msg', size: '1,992', date: DAY2, bytes: 1992, attr: '-rw-r--r--' },
  ssand: { icon: 'file', name: 'sandcastle', size: '960', date: DAY2, bytes: 960, attr: '-rw-r--r--' },
  ssand0: { icon: 'file', name: 'sandcastle', size: '0', date: DAY2, bytes: 0, attr: '-rw-r--r--' },
  her: { icon: 'file', name: 'castaway', size: '1', date: DAY2, bytes: 1, attr: '-rwxr-xr-x' },
};
const LCOLS = [{ label: 'Name', w: 130, sort: true }, { label: 'Size', w: 62, right: true }, { label: 'Modified', w: 58 }];
const RCOLS = [{ label: 'Name', w: 92, sort: true }, { label: 'Size', w: 56, right: true }, { label: 'Modified', w: 50 }, { label: 'Attr', w: 52 }];
push(listFrame(LP.x, LIST_Y, LP.w, LIST_H, LCOLS));
push(listFrame(RP.x, LIST_Y, RP.w, LIST_H, RCOLS));

const rowCache = new Map();
function rowDef(r, cols, selected) {
  const key = `${r.name}|${r.size}|${r.date}|${cols.length}|${selected}`;
  if (!rowCache.has(key)) {
    const id = `r${rowCache.size.toString(36)}`;
    let s = '';
    let cx = 2;
    if (selected) s += rect(cx + 13, 0, ui.width(r.name) + 4, ROWH, P.sel);
    s += `<use href="#i-${r.icon}" x="${cx + 3}" y="1"/>`;
    s += text(ui, r.name, cx + 15, 1, selected ? P.white : P.ink);
    cx += cols[0].w;
    s += textR(ui, r.size, cx + cols[1].w - 4, 1, P.ink);
    cx += cols[1].w;
    s += text(ui, r.date, cx + 4, 1, P.ink);
    cx += cols[2].w;
    if (cols[3]) s += text(ui, r.attr, cx + 4, 1, P.ink);
    defs.push(`<g id="${id}">${s}</g>`);
    rowCache.set(key, id);
  }
  return rowCache.get(key);
}
const mb = (bytes) => `${(bytes / 1048576).toFixed(1)} MB`;
function stripText(rows) {
  const d = rows.filter((r) => r.dir).length;
  const f = rows.length - d;
  const bytes = rows.reduce((a, r) => a + (r.bytes || 0), 0);
  return `${d} Folder${d === 1 ? '' : 's'}, ${f} File${f === 1 ? '' : 's'}, ${rows.length} Total (${mb(bytes)})`;
}
const OFF0 = LEAVE + 0.75; // the island disconnects
const ON0 = 57; // and is back, on the bar
function leftState(t) {
  if (t >= OFF0 && t < ON0) return { key: 'off', off: true, active: false };
  const rows = [ROW.palm, ROW.raft];
  if (!(t >= 6 && t < 9)) rows.push(ROW.bottle);
  rows.push(ROW.coffee);
  if (t >= 12 && t < 15) rows.push(ROW.sand1);
  else if (t >= 15 && t < 16.5) rows.push(ROW.sand2);
  else if (t >= 16.5 && t < 21) rows.push(ROW.sand3);
  rows.push(ROW.theme);
  let sel = null;
  if (t >= 3 && t < 6) sel = 'bottle.msg';
  if (t >= 18 && t < 21) sel = 'sandcastle';
  if ((t >= 27 && t < 30) || (t >= 36 && t < 37.5)) sel = 'palm';
  const active = !((t >= 9 && t < 12) || (t >= 21 && t < 24) || (t >= SHARK[0] && t < SHARK[1]));
  return { key: `${rows.map((r) => r.name + r.size).join()}|${sel}|${active}`, rows, sel, active };
}
function rightState(t) {
  const rows = [ROW.deep];
  if (t >= 6 && t < 9) rows.push(ROW.sbottle);
  if (t >= HER_AT_SEA[0] && t < HER_AT_SEA[1]) rows.push(ROW.her);
  rows.push(ROW.ocean);
  if (t >= 21.75 && t < 22.5) rows.push(ROW.ssand);
  if (t >= 22.5 && t < 24) rows.push(ROW.ssand0);
  rows.push(ROW.shark);
  if (t >= SHIP_T0 && t < SHIP_T1) rows.push(ROW.ship);
  rows.push(ROW.turtle);
  let sel = null;
  if (t >= 9 && t < 10.5) sel = 'bottle.msg';
  if (t >= SHARK[0] && t < SHARK[1]) sel = 'shark';
  const active = (t >= 9 && t < 12) || (t >= 21 && t < 24) || (t >= SHARK[0] && t < SHARK[1]) || (t >= OFF0 && t < ON0);
  return { key: `${rows.map((r) => r.name + r.size).join()}|${sel}|${active}`, rows, sel, active };
}
const PANE_TIMES = [3, 6, 9, 10.5, 12, 15, 16.5, 18, 21, 21.75, 22.5, 24, 27, 30, 36, 37.5, ...SHARK, OFF0, ...HER_AT_SEA, ON0, SHIP_T0, SHIP_T1];
function paneBuild(pane, cols, pathLabel, siteName, siteCol) {
  return (st) => {
    let s = '';
    const top = LIST_Y + 2 + 12;
    if (!st.off) {
      st.rows.slice(0, NROWS).forEach((r, i) => { s += `<use href="#${rowDef(r, cols, st.sel === r.name)}" x="${pane.x}" y="${top + i * ROWH}"/>`; });
      s += text(ui, pathLabel, pane.x + 4, PY + 20, P.ink);
    }
    s += bevel(pane.x, STRIP_Y, pane.w, 12, 'sunk', st.active ? P.strip : P.face);
    const msg = st.off ? 'Not connected. The island sits empty.' : stripText(st.rows);
    s += text(ui, msg, pane.x + 4, STRIP_Y + 3, st.off ? P.grey : P.ink);
    s += textR(uib, siteName, pane.x + pane.w - 5, STRIP_Y + 3, siteCol);
    return s;
  };
}
push(stateGroups(PANE_TIMES, leftState, paneBuild(LP, LCOLS, '/island', 'island', LOGC.L)));
push(stateGroups(PANE_TIMES, rightState, paneBuild(RP, RCOLS, '/sea', 'the sea', LOGC.R)));

// ---- the queue (bottom left): the schedule, one item per slot, each requeued afterwards
const QP = { x: WX + 4, w: 214 };
const LGP = { x: QP.x + QP.w + 4, w: WW - 8 - QP.w - 4 };
const BH = 2 + 12 + 5 * ROWH + 2;
const QCOLS = [{ label: 'Name', w: 76 }, { label: 'Target', w: 34 }, { label: 'Size', w: 30, right: true }, { label: 'Remark', w: 70 }];
push(listFrame(QP.x, BY, QP.w, BH, QCOLS));
const Q = {
  B: { name: 'bottle.msg', target: '/sea', size: '1,992', remark: 'occasional' },
  S: { name: 'sandcastle', target: '/sea', size: '960', remark: 'regular + tide' },
  C: { name: 'palm/coconut', target: '/crab', size: '1', remark: 'occasional' },
  K: { name: 'palm/cat', target: '/sea', size: '1', remark: 'rare' },
  X: { name: 'castaway', target: '/sea', size: '1', remark: 'super rare' },
};
const QSEQ = [
  [0, 'BSCKX', null],
  [3, 'BSCKX', ['B', 'Transferring']],
  [6, 'SCKX', null],
  [9, 'SCKXB', null],
  [21, 'SCKXB', ['S', 'Tide coming']],
  [22.5, 'CKXB', null],
  [24, 'CKXBS', null],
  [27, 'CKXBS', ['C', 'Renaming']],
  [30, 'KXBS', null],
  [33, 'KXBSC', null],
  [36, 'KXBSC', ['K', '450 napping']],
  [37.5, 'XBSCK', null],
  [LEAVE, 'XBSCK', ['X', 'Leaving']],
  [LEAVE + 1.5, 'BSCK', null],
  [ON0, 'BSCKX', null],
];
const qrowCache = new Map();
function qrowDef(k, act) {
  const key = `${k}|${act ? act[1] : ''}`;
  if (!qrowCache.has(key)) {
    const id = `q${qrowCache.size.toString(36)}`;
    const q = Q[k];
    const fail = act && act[1].startsWith('450');
    const fill = act ? P.white : P.ink;
    let s = act ? rect(3, 0, QP.w - 6, ROWH, P.sel) : '';
    let cx = 2;
    s += `<use href="#i-${fail ? 'qfail' : 'qsend'}" x="${cx + 3}" y="1"/>`;
    s += text(ui, q.name, cx + 13, 1, fill);
    cx += QCOLS[0].w;
    s += text(ui, q.target, cx + 3, 1, fill);
    cx += QCOLS[1].w;
    s += textR(ui, q.size, cx + QCOLS[2].w - 4, 1, fill);
    cx += QCOLS[2].w;
    s += text(ui, act ? act[1] : q.remark, cx + 4, 1, act ? (fail ? '#ffc4b8' : '#fff6a8') : P.ink);
    defs.push(`<g id="${id}">${s}</g>`);
    qrowCache.set(key, id);
  }
  return qrowCache.get(key);
}
function queueState(t) {
  let cur = QSEQ[0];
  for (const s of QSEQ) if (t >= s[0]) cur = s;
  return { key: `${cur[1]}|${cur[2] ? cur[2].join() : ''}`, order: cur[1], act: cur[2] };
}
push(
  stateGroups(QSEQ.map((s) => s[0]), queueState, (st) =>
    [...st.order].map((k, i) => `<use href="#${qrowDef(k, st.act && st.act[0] === k ? st.act : null)}" x="${QP.x}" y="${BY + 14 + i * ROWH}"/>`).join(''),
  ),
);

// ---- the log (bottom right): raw commands and numbered replies, on the theme's clock
// [t, side, text, kind]; side 'L' is the island, 'R' the sea, '' the client itself
const LOG = [
  [3.0, 'R', 'PASV', 'cmd'],
  [3.25, 'R', '227 Passive Mode (127,0,0,1,34,61)', 'reply'],
  [3.5, 'L', 'PORT 127,0,0,1,34,61', 'cmd'],
  [3.75, 'L', '200 PORT command successful.', 'reply'],
  [4.5, 'L', 'RETR bottle.msg', 'cmd'],
  [4.75, 'R', 'STOR bottle.msg', 'cmd'],
  [6.0, 'R', '226 Transfer complete.', 'reply'],
  [9.0, 'R', '451 Washed straight back.', 'err'],
  [12.0, 'L', 'STOR sandcastle', 'cmd'],
  [12.25, 'L', '226 120 bytes of sand.', 'reply'],
  [15.0, 'L', 'APPE sandcastle', 'cmd'],
  [18.0, 'L', '226 Appended: 960 bytes of sand.', 'reply'],
  [21.0, '', 'Tide: sandcastle -> the sea', 'info'],
  [22.5, 'R', '226 Transfer complete.', 'reply'],
  [24.0, 'L', 'REST 0', 'cmd'],
  [24.25, 'L', '350 Restarting at 0.', 'reply'],
  [27.0, 'L', 'RNFR palm/coconut', 'cmd'],
  [27.25, 'L', '350 Ready for destination name.', 'reply'],
  [30.0, 'L', 'RNTO crab/hat', 'cmd'],
  [30.25, 'L', '250 Rename successful. It fits.', 'reply'],
  [33.0, 'L', 'NOOP', 'cmd'],
  [33.25, 'L', '200 Nod.', 'reply'],
  [36.0, 'L', 'RETR palm/cat', 'cmd'],
  [36.25, 'L', '450 Busy: napping. Try later.', 'err'],
  [39.0, 'R', 'NOOP', 'cmd'],
  [39.25, 'R', '200 Nod. (shark)', 'reply'],
  [42.0, 'L', 'NOOP', 'cmd'],
  [42.25, 'L', '200 Nod.', 'reply'],
  [45.0, 'L', 'QUIT', 'cmd'],
  [45.25, 'L', '221 Goodbye. Back in a bit.', 'reply'],
  [48.0, '', 'Island closed the connection.', 'info'],
  // the client's start-up lines, with its (invented) library versions, as these clients print
  [51.0, '', 'Tombolo FXP 1.992 ready.', 'info'],
  [51.25, '', 'Using libsand 3.0, libtide 0.6', 'info'],
  [51.5, '', 'Connecting to island ...', 'info'],
  [54.0, 'L', '220-Castaway: always daytime.', 'reply'],
  [54.25, 'L', '220-Run: python tools/serve.py', 'reply'],
  [54.5, 'L', '220-Open http://127.0.0.1:8765/', 'reply'],
  [54.75, 'L', '220 Every sound is made in code.', 'reply'],
  [57.0, 'L', 'USER castaway', 'cmd'],
  [57.25, 'L', '230 Back, with an iced coffee.', 'reply'],
];
const LOG_LINES = 6;
const LOG_LH = 10;
{
  const { x, w } = LGP;
  const y = BY;
  push(bevel(x, y, w, BH, 'sunk', P.white));
  const sbx = x + w - 2 - 11;
  push(rect(sbx, y + 2, 11, BH - 4, '#ebe5d6'));
  push(bevel(sbx, y + 2, 11, 11, 'btn') + `<path fill="${P.ink}" d="M${sbx + 3} ${y + 8}h5v-1h-1v-1h-1v-1h-1v1h-1v1h-1z"/>`);
  push(bevel(sbx, y + BH - 13, 11, 11, 'btn') + `<path fill="${P.ink}" d="M${sbx + 3} ${y + BH - 9}h5v1h-1v1h-1v1h-1v-1h-1v-1h-1z"/>`);
  push(bevel(sbx, y + BH - 13 - 12, 11, 12, 'btn'));
  const show = [...LOG.slice(-LOG_LINES), ...LOG];
  const stamp = (t) => `[00:${String(Math.floor(t / 3) * 3).padStart(2, '0')}]`;
  let lines = '';
  show.forEach(([t, side, msg, kind], i) => {
    const ly = i * LOG_LH;
    lines += text(mono, stamp(t), 0, ly, LOGC.time);
    let lx = 8 * 6;
    if (side) {
      lines += text(mono, `[${side}]`, lx, ly, LOGC[side]);
      lx += 4 * 6;
    }
    lines += text(mono, msg, lx, ly, LOGC[kind]);
    const len = 8 + (side ? 4 : 0) + msg.length;
    if (len > 46) console.warn(`log line too long (${len}): ${msg}`);
  });
  const segs = [[0, 'transform:translate(0px,0px)']];
  LOG.forEach(([t], i) => segs.push([t, `transform:translate(0px,${-(i + 1) * LOG_LH}px)`]));
  // The clip starts one row below the frame so the descenders of the line that has just
  // scrolled out (the g of "msg", the y of "bytes") do not peek in at the top.
  defs.push(`<clipPath id="logclip"><rect x="${x + 2}" y="${y + 3}" width="${w - 4 - 11}" height="${BH - 5}"/></clipPath>`);
  push(`<g clip-path="url(#logclip)"><g transform="translate(${x + 5} ${y + 4})"><g ${animAttr(segs)}>${lines}</g></g></g>`);
}

// ---- status bar
{
  const y = BY + BH + 2;
  const cells = [300, 64, 56, WW - 8 - 300 - 64 - 56 - 6];
  let x = WX + 4;
  const xs = [];
  for (const cw of cells) {
    push(thinDown(x, y, cw, 13));
    xs.push(x);
    x += cw + 2;
  }
  push(text(ui, '80 BPM', xs[2] + 5, y + 3, P.ink));
  push(text(ui, 'run 10:00:00', xs[3] + 5, y + 3, P.ink));
  const qcount = (t) => {
    const out = (t >= 6 && t < 9) || (t >= 22.5 && t < 24) || (t >= 30 && t < 33) || (t >= LEAVE + 1.5 && t < ON0);
    return { key: out ? 4 : 5 };
  };
  push(stateGroups([6, 9, 22.5, 24, 30, 33, LEAVE + 1.5, ON0], qcount, (v) => text(ui, `Queue: ${v.key}`, xs[1] + 5, y + 3, P.ink)));
  const msgs = [
    [0, 'Idle. Nodding along.'],
    [3, 'FXP bottle.msg: island -> the sea', [3, 6]],
    [6, 'Transferred 1,992 bytes in 3 s (664 B/s).'],
    [9, 'bottle.msg came straight back. Requeued.'],
    [12, 'Idle. She is building something.'],
    [21, 'Tide: sandcastle -> the sea', [21, 22.5]],
    [22.5, 'Idle. Nodding along.'],
    [27, 'Renaming palm/coconut to crab/hat.'],
    [30, 'Idle. Nodding along.'],
    [36, 'Skipped palm/cat (napping). Requeued.'],
    [37.5, 'Idle. Nodding along.'],
    [LEAVE, 'Island disconnected. She could leave any time.'],
    [ON0, 'Idle. Nodding along.'],
  ];
  const msgAt = (t) => {
    let m = msgs[0];
    for (const mm of msgs) if (t >= mm[0]) m = mm;
    return { key: m[1], m };
  };
  push(
    stateGroups(msgs.map((m) => m[0]), msgAt, (v) => {
      let s = text(ui, v.m[1], xs[0] + 5, y + 3, P.ink);
      if (v.m[2]) {
        const [a, b] = v.m[2];
        const px = xs[0] + 5 + ui.width(v.m[1]) + 8;
        s += thinDown(px, y + 2, 76, 9);
        for (let i = 0; i < 12; i++) s += rect(px + 2 + i * 6, y + 4, 5, 5, P.sel, vis([[n3(a + ((b - a) * i) / 12), b]]));
      }
      return s;
    }),
  );
}

// ------------------------------------------------------------------ assemble
css.push('@media (prefers-reduced-motion: reduce){*{animation:none!important}}');
const fontDefs = ui.defs() + uib.defs() + mono.defs();
const svg =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W * 2}" height="${H * 2}" shape-rendering="crispEdges" role="img" aria-labelledby="t">` +
  `<title id="t">Castaway: an FXP client moving gags between an island and the sea</title>` +
  `<desc>A pixel-art island with one palm and a woman in headphones above an invented two-site transfer client. ` +
  `Over a 60-second loop a bottle comes straight back, the tide takes a sandcastle, a coconut becomes a crab's hat, ` +
  `the napping cat cannot be moved, a shark in headphones nods along, and she leaves over the water and returns with an iced coffee. ` +
  `Quick start in the log: python tools/serve.py, then open http://127.0.0.1:8765/. Every sound is made in code.</desc>` +
  `<style>${css.join('')}</style>` +
  `<defs>${fontDefs}${defs.join('')}<clipPath id="round"><rect width="${W}" height="${H}" rx="6"/></clipPath></defs>` +
  `<g clip-path="url(#round)">${parts.join('')}</g></svg>`;

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, svg);
console.log(`wrote ${OUT} (${(svg.length / 1024).toFixed(1)} KB)`);
