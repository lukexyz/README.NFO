#!/usr/bin/env node
// CASTAWAY as a DOS screen whose letters fall off their lines and become an island.
//
// Style: "Falling-letters screen" (catalogue hack-10). The look of the late-1980s DOS screen
// pranks remembered from the Cascade payload: an ordinary 80 x 25 text screen, light grey on
// black, where the characters drop out of their lines one by one, fall a row at a time and pile
// up along the bottom. Only the visual idea is borrowed. Nothing here is code from, or a copy
// of, any real program: the text, the font, the island and the people on it are drawn for this
// banner, and the thing that misbehaves is this project's own readme, typed out at the prompt.
//
// Regenerate:  node examples/castaway/src/81-falling-letters-screen_opus_5.5.mjs
//              (add --debug to print the settled heap as text)
//
// Plain Node, no dependencies, deterministic (seeded PRNG, no clock). The screen is a real
// 80 x 25 grid of 8 x 16 cells. Text is <use> of glyph paths from the bitmap font below, never
// <text>. The fall is a falling-sand automaton run at generation time on the cell grid: a loose
// letter drops a row per tick, rests on anything solid (including text that has not let go yet),
// and tumbles one cell sideways down a slope, so the heap settles like sand. Every letter gets
// its own short CSS keyframes, made of steps() runs, one step per row.
//
// One loop is 42 s: fourteen bars of the project's theme (80 BPM, a bar every 3 s, a beat every
// 0.75 s). The clock of the automaton is a 32nd note, and every letter lets go on a 16th note,
// because in Castaway everything starts on the beat.
//   bars 1-2   the screen, intact. One "o" lets go early and lands on a hermit crab, who leaves
//              wearing it
//   bars 3-6   the cascade: the grey letters let go, slowly and then all at once, and heap up
//   bar 7      the sea comes in over the bottom of the heap, the rest turns to sand, the sky
//              fills in tile by tile, and a palm grows out of the top
//   bars 8-12  she walks in over the water with an iced coffee and idles under the palm
//   bar 13     palette fade to black
//   bars 13-14 the screen is printed again, a line per 16th note, as it was
// The title stays put throughout. The resting frame (prefers-reduced-motion) is the intact
// screen at 1 s, before anything lets go.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '81-falling-letters-screen_opus_5.5';
const OUT = path.join(HERE, '..', 'assets', `${SLUG}.svg`);
const DEBUG = process.argv.includes('--debug');

// ---------------------------------------------------------------------------------------------
// Geometry and clock
// ---------------------------------------------------------------------------------------------
const COLS = 80, ROWS = 25, CW = 8, CH = 16;
const SW = COLS * CW, SH = ROWS * CH; // 640 x 400
const BEZ = 22; // monitor bezel around the screen
const VBW = SW + BEZ * 2, VBH = SH + BEZ * 2;

const T = 42; // the loop: 14 bars
const BEAT = 0.75, S16 = 0.1875, TICK = 0.09375; // a beat, a 16th, a 32nd note
const tk = (s) => Math.round(s / TICK); // seconds -> ticks
const NT = tk(T); // 448 ticks

const AT = {
  oLand: 3.0, // the first letter to go lands on the crab, on the downbeat of bar 2
  crabGo: 3.375, // and the crab leaves wearing it, a cell per 32nd note
  cascade0: 6.0, // the cascade proper (first release)
  cascade1: 15.0, // last release
  sea: 18.0, // the sea comes in, a row per tick
  sand: 18.75, // the rest of the heap turns to sand, from the waterline up
  sky0: 18.75, sky1: 21.0, // the sky fills in, tile by tile
  palm: 19.5, // the palm grows, a row per tick
  glyphsOff: 21.0, // the grey heap is fully covered by now
  walk: 21.0, // she walks in from the right, over the water
  fade: 36.0, // palette fade, eight steps over two beats
  black: 37.5,
  reprint: 38.25, // the screen comes back, a line per 16th note
  reset: 30.0, // (hidden) every letter goes home
};
const REST = 1.0; // the frame shown with reduced motion: the screen, intact

// ---------------------------------------------------------------------------------------------
// Seeded PRNG (the default run's seed)
// ---------------------------------------------------------------------------------------------
function mulberry32(a) {
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = mulberry32(1992);
const shuffle = (a, r = rnd) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

// ---------------------------------------------------------------------------------------------
// An 8 x 16 text-mode font in the manner of the VGA ROM (drawn for this banner). Rows are
// '#'/'.' strings placed from row `top` of the cell.
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
  '<': [4, '....##. ...##.. ..##... .##.... ..##... ...##.. ....##.'],
  '>': [4, '.##.... ..##... ...##.. ....##. ...##.. ..##... .##....'],
  '~': [2, '.###.## ##.###.'],
  '(': [2, '....##. ...##.. ..##... ..##... ..##... ..##... ..##... ..##... ...##.. ....##.'],
  ')': [2, '.##.... ..##... ...##.. ...##.. ...##.. ...##.. ...##.. ...##.. ..##... .##....'],
  '·': [7, '...##.. ...##..'],
  '=': [6, '....... ####### ....... ....... #######'],
  '+': [5, '...##.. ...##.. ####### ...##.. ...##..'],
};
for (const [ch, [top, rows]] of Object.entries(PUNCT)) def(ch, top, rows);
FONT.set(' ', new Array(16).fill(0));
// Shade and block characters, as the ROM has them
{
  const fill = (fn) => Array.from({ length: 16 }, (_, y) => fn(y));
  FONT.set('░', fill((y) => (y % 4 === 0 ? 0x88 : y % 4 === 2 ? 0x22 : 0)));
  FONT.set('▒', fill((y) => (y % 2 === 0 ? 0xAA : 0x55)));
  FONT.set('▓', fill((y) => (y % 2 === 0 ? 0xEE : 0xBB)));
  FONT.set('█', fill(() => 0xFF));
  FONT.set('▀', fill((y) => (y < 8 ? 0xFF : 0)));
  FONT.set('▄', fill((y) => (y >= 8 ? 0xFF : 0)));
  FONT.set('≈', fill((y) => [0, 0, 0, 0, 0, 0x76, 0xDC, 0, 0, 0x76, 0xDC, 0, 0, 0, 0, 0][y]));
}

// Bitmap -> compact path: horizontal runs, merged downwards while they line up.
function runsToPath(rowRuns, ox = 0, oy = 0) {
  const rects = [];
  let open = [];
  for (let y = 0; y < rowRuns.length; y++) {
    const next = [];
    for (const [x0, w] of rowRuns[y]) {
      const o = open.find((r) => r.x === x0 && r.w === w && r.y + r.h === y);
      if (o) { o.h++; next.push(o); } else { const r = { x: x0, w, y, h: 1 }; rects.push(r); next.push(r); }
    }
    open = next;
  }
  return rects.map((r) => `M${ox + r.x} ${oy + r.y}h${r.w}v${r.h}h${-r.w}z`).join('');
}
function glyphPath(g) {
  const rows = g.map((v) => {
    const runs = [];
    for (let x = 0; x < 8;) {
      if ((v >> (7 - x)) & 1) { const s = x; while (x < 8 && ((v >> (7 - x)) & 1)) x++; runs.push([s, x - s]); } else x++;
    }
    return runs;
  });
  return runsToPath(rows);
}
const glyphIds = new Map();
function gid(ch) {
  if (!FONT.has(ch)) throw new Error(`no glyph for ${JSON.stringify(ch)} (U+${ch.codePointAt(0).toString(16)})`);
  if (!glyphIds.has(ch)) glyphIds.set(ch, `g${glyphIds.size.toString(36)}`);
  return glyphIds.get(ch);
}
const len = (s) => [...s].length;
const useG = (ch, x, y, extra = '') => `<use href="#${gid(ch)}" x="${x}" y="${y}"${extra}/>`;
// A run of text at cell (r, c), as one group of <use>.
function text(r, c, str) {
  let out = '';
  [...str].forEach((ch, i) => { if (ch !== ' ') out += useG(ch, (c + i) * CW, 0); });
  return out ? `<g transform="translate(0 ${r * CH})">${out}</g>` : '';
}

// ---------------------------------------------------------------------------------------------
// The screen. Grey text is ordinary and will fall. The title and the white line under it are
// the only things on screen that hold on.
// ---------------------------------------------------------------------------------------------
const pad = (s, n) => s + ' '.repeat(Math.max(0, n - len(s)));
const padL = (s, n) => ' '.repeat(Math.max(0, n - len(s))) + s;
// MS-DOS style entries: name, ext, size or <DIR>, date, time; then a 4DOS-style description.
const entry = (name, ext, size, date, time, note) => {
  const head = size === null
    ? `${pad(name, 13)}<DIR>${' '.repeat(9)}${date}${padL(time, 8)}`
    : `${pad(name, 8)} ${pad(ext, 3)}${padL(size, 14)} ${date}${padL(time, 8)}`;
  return `${pad(head, 45)}${note}`;
};
// The page being typed: centred, and set narrowing line by line like the top of an hourglass.
const FUNNEL = [
  'CASTAWAY is a ten-hour lo-fi video of one tiny island, one tall palm,',
  'a raft and a young woman in cream headphones. She idles. She',
  'nods to the beat. Every so often, something happens:',
  'a bottle washes back, a crab leaves in a coconut.',
  'More than 90 activities, every',
  'sound synthesized from code,',
  'and for hours on end,',
  'almost nothing',
  'happens.',
];
const FUNNEL_ROW = 11;
const centreCol = (s) => Math.floor((COLS - len(s)) / 2);
const LINES = {
  0: String.raw`C:\CASTAWAY>type readme.md`,
  24: String.raw`C:\CASTAWAY>python tools\serve.py`,
};
FUNNEL.forEach((s, i) => { LINES[FUNNEL_ROW + i] = ' '.repeat(centreCol(s)) + s; });
const CURSOR = { r: 24, c: len(LINES[24]) };
const SUB_ROW = 9;
const SUBTITLE = 'ten hours on a tiny island.  everything falls into place, eventually.';

// The block title: CASTAWAY in letters eight cells wide and seven rows tall, rows 1-7. Each
// cell of a letter is an inverse-video cell whose own character spells the name again.
const TITLE_ROW = 1;
const BIG = {
  C: ['.######.', '##....##', '##......', '##......', '##......', '##....##', '.######.'],
  A: ['..####..', '.##..##.', '##....##', '##....##', '########', '##....##', '##....##'],
  S: ['.######.', '##....##', '##......', '.######.', '......##', '##....##', '.######.'],
  T: ['########', '...##...', '...##...', '...##...', '...##...', '...##...', '...##...'],
  W: ['##....##', '##....##', '##....##', '##.##.##', '##.##.##', '########', '.##..##.'],
  Y: ['##....##', '##....##', '.##..##.', '..####..', '...##...', '...##...', '...##...'],
};
const TITLE_WORD = 'CASTAWAY';
const TITLE_C0 = 4; // eight letters, eight cells each, one cell apart: columns 4..74
const titleCells = []; // {r, c}
[...TITLE_WORD].forEach((L, i) => {
  BIG[L].forEach((row, j) => [...row].forEach((px, k) => { if (px === '#') titleCells.push({ r: TITLE_ROW + j, c: TITLE_C0 + i * 9 + k }); }));
});
const isTitle = new Set(titleCells.map(({ r, c }) => r * COLS + c));

// ---------------------------------------------------------------------------------------------
// The letters that fall, and the crab
// ---------------------------------------------------------------------------------------------
const glyphs = []; // {ch, r0, c0, rel (tick), path: [[tick, r, c]...]}
for (const [rs, str] of Object.entries(LINES)) {
  const r = Number(rs);
  if (len(str) > COLS) throw new Error(`line ${r} too long (${len(str)})`);
  [...str].forEach((ch, c) => { if (ch !== ' ') glyphs.push({ ch, r0: r, c0: c }); });
}
// The first letter to go: the lowest-row "o" with a clear drop to the bottom row, and the
// crab who is sitting under it.
let O = null;
for (const g of glyphs) {
  if (g.ch !== 'o' || g.r0 >= ROWS - 2) continue;
  const clear = glyphs.every((h) => h === g || h.c0 !== g.c0 || h.r0 <= g.r0);
  if (clear && (!O || g.r0 < O.r0 || (g.r0 === O.r0 && g.c0 > O.c0))) O = g;
}
if (!O) throw new Error('no o with a clear drop');
glyphs.splice(glyphs.indexOf(O), 1);
const CRAB = { r: ROWS - 1, c: O.c0 };
const oLand = tk(AT.oLand); // tick it reaches the crab's cell
AT.oDrop = (oLand - (CRAB.r - O.r0 - 1)) * TICK; // it lets go so as to land on the beat
const crabStepTicks = 1; // a cell per 32nd note: crabs are quick
const crabStart = tk(AT.crabGo);
const crabCol = (t) => (t < crabStart ? CRAB.c : CRAB.c + Math.floor((t - crabStart) / crabStepTicks) + 1);
const crabGone = crabStart + (COLS - CRAB.c) * crabStepTicks; // tick it has left the screen

// Release times: on the 16th-note grid, slowly at first and then all at once.
{
  const order = shuffle([...glyphs]);
  const a = tk(AT.cascade0), b = tk(AT.cascade1);
  order.forEach((g, i) => {
    const u = (i + 0.5) / order.length;
    const t = a + (b - a) * Math.pow(u, 0.55);
    g.rel = Math.round(t / 2) * 2;
  });
}

const SLIDE = 2; // how far a letter will slide along the heap to find a way down
// The automaton. Solid: text that has not let go, settled letters, the crab and its shell.
{
  const occ = new Int16Array(COLS * ROWS).fill(-1);
  const at = (r, c) => (r < 0 || r >= ROWS || c < 0 || c >= COLS ? -2 : occ[r * COLS + c]);
  glyphs.forEach((g, i) => { g.r = g.r0; g.c = g.c0; g.path = []; occ[g.r * COLS + g.c] = i; });
  const CRAB_CELL = -3; // solid, but not a letter
  let lastMove = 0;
  for (let t = 0; t < NT; t++) {
    // the crab (and the o) are solid where they are this tick
    const marks = [];
    const mark = (r, c) => { if (c >= 0 && c < COLS && occ[r * COLS + c] === -1) { occ[r * COLS + c] = CRAB_CELL; marks.push(r * COLS + c); } };
    if (t < tk(AT.oDrop)) mark(O.r0, O.c0);
    else if (t < oLand) mark(O.r0 + (t - tk(AT.oDrop)) + 1, O.c0);
    if (t < crabGone) mark(CRAB.r, crabCol(t));
    for (let r = ROWS - 1; r >= 0; r--) {
      const row = [];
      for (let c = 0; c < COLS; c++) { const i = occ[r * COLS + c]; if (i >= 0 && glyphs[i].rel <= t) row.push(i); }
      for (const i of shuffle(row)) {
        const g = glyphs[i];
        let nr = g.r, nc = g.c;
        if (at(g.r + 1, g.c) === -1) nr = g.r + 1;
        else {
          const dirs = shuffle([-1, 1]);
          for (const d of dirs) {
            if (at(g.r, g.c + d) === -1 && at(g.r + 1, g.c + d) === -1) { nr = g.r + 1; nc = g.c + d; break; }
          }
          // no drop beside it: slide a cell along the surface towards a drop up to SLIDE cells away
          if (nr === g.r) {
            search: for (let k = 2; k <= SLIDE; k++) for (const d of dirs) {
              let ok = true;
              for (let j = 1; j <= k && ok; j++) ok = at(g.r, g.c + d * j) === -1;
              if (ok && at(g.r + 1, g.c + d * k) === -1) { nc = g.c + d; break search; }
            }
          }
        }
        if (nr !== g.r || nc !== g.c) {
          occ[g.r * COLS + g.c] = -1; occ[nr * COLS + nc] = i;
          g.r = nr; g.c = nc; g.path.push([t, nr, nc]); lastMove = Math.max(lastMove, t);
        }
      }
    }
    for (const m of marks) occ[m] = -1;
  }
  if (lastMove >= tk(AT.sea)) throw new Error(`heap still moving at ${(lastMove * TICK).toFixed(2)} s`);
  if (DEBUG) console.log(`last letter settles at ${(lastMove * TICK).toFixed(2)} s; ${glyphs.length} letters + the o`);
}

// The settled heap
const heap = new Map(); // cell -> glyph
for (const g of glyphs) heap.set(g.r * COLS + g.c, g);
const top = Array.from({ length: COLS }, (_, c) => {
  for (let r = 0; r < ROWS; r++) if (heap.has(r * COLS + c)) return r;
  return ROWS;
});
if (DEBUG) {
  const grid = Array.from({ length: ROWS }, () => Array(COLS).fill(' '));
  for (const { r, c } of titleCells) grid[r][c] = '#';
  for (const g of glyphs) grid[g.r][g.c] = g.ch;
  console.log(grid.map((row, r) => `${String(r).padStart(2)}|${row.join('')}|`).join('\n'));
  console.log(`tops: ${top.join(',')}`);
}
if (DEBUG) console.log(`the o: row ${O.r0}, col ${O.c0}; lands on the crab at ${(oLand * TICK).toFixed(2)} s; crab gone at ${(crabGone * TICK).toFixed(2)} s`);

// ---------------------------------------------------------------------------------------------
// The island that the heap becomes
// ---------------------------------------------------------------------------------------------
const WL = 22; // the waterline: rows WL..24 are sea
const SKY_ROW = SUB_ROW + 1; // the sky starts under the white line
const isHeap = (r, c) => heap.has(r * COLS + c);
const peakCol = (() => {
  let best = 0;
  for (let c = 0; c < COLS; c++) if (top[c] < top[best] || (top[c] === top[best] && Math.abs(c - 40) < Math.abs(best - 40))) best = c;
  return best;
})();
const shoreR = (() => { let c = peakCol; while (c < COLS && top[c] < WL) c++; return c; })(); // first sea column right of the island
const shoreL = (() => { let c = peakCol; while (c >= 0 && top[c] < WL) c--; return c; })();
if (DEBUG) console.log(`peak col ${peakCol} (row ${top[peakCol]}), island cols ${shoreL + 1}..${shoreR - 1}`);

// ---------------------------------------------------------------------------------------------
// Colours. The screen keeps the plain text attributes; the island is drawn after the
// sixteen palette registers have been reprogrammed to something sunnier.
// ---------------------------------------------------------------------------------------------
const C = {
  black: '#000000', grey: '#AAAAAA', dark: '#555555', white: '#FFFFFF', crab: '#FF5555', crabDk: '#C93A3A',
  sky: ['#3F8FE6', '#5EA9EE', '#86C6F4', '#B3DEF8'],
  cloud: '#FFFFFF', cloudLo: '#D6ECFA',
  sun: '#FFE15A', sunHi: '#FFF6B8', sunRing: '#FFEE8A',
  sea: ['#2A86D6', '#1F70C2', '#195FAE', '#144E99'], seaHi: '#BDEBFF', wave: '#8ED6FA', sub: ['#5AA7EA', '#4793DC', '#3C81CB', '#326FB8'],
  sand: '#EFCB86', sandTop: '#F8DFA6', sandInk: '#C79A55', wetSand: '#D9AE68', wetInk: '#B07F3E', foam: '#F2FBFF',
  trunk: '#A8693A', trunkDk: '#7E4A27', trunkHi: '#CC8D55',
  leaf: ['#1F6B34', '#2E8B3E', '#48AE48', '#86D45A'], nut: '#6A4224',
  hair: '#6B4326', hairHi: '#8C5C36', skin: '#F2C196', skinDk: '#D79C6E', phone: '#F6ECD3', phoneDk: '#CDBE98',
  top: '#F2765F', topDk: '#C9563F', shorts: '#EFE3C4', shortsDk: '#CBBB95', eye: '#3B2415',
  cup: '#E9F7FF', coffee: '#8C5A2C', straw: '#F25C5C', ice: '#FFFFFF',
};

// ---------------------------------------------------------------------------------------------
// Animation helpers. Every change is a hard step, the way a text screen is rewritten.
// ---------------------------------------------------------------------------------------------
const css = [];
const pct = (t) => `${+((100 * t) / T).toFixed(2)}%`;
const visCache = new Map();
let animN = 0;
// A class that shows its element only during the given [from, to) intervals (seconds).
function stepVis(intervals) {
  const iv = intervals.map(([a, b]) => [Math.max(0, a), Math.min(T, b)]).filter(([a, b]) => b > a).sort((p, q) => p[0] - q[0]);
  const key = JSON.stringify(iv);
  if (visCache.has(key)) return visCache.get(key);
  const on = (t) => iv.some(([a, b]) => t >= a && t < b);
  const name = `v${(animN++).toString(36)}`;
  const pts = new Map([[0, on(0)]]);
  for (const [a, b] of iv) { if (a > 0) pts.set(a, true); if (b < T) pts.set(b, on(b)); }
  let kf = '';
  for (const [t, v] of [...pts].sort((p, q) => p[0] - q[0])) kf += `${pct(t)}{visibility:${v ? 'visible' : 'hidden'}}`;
  css.push(`@keyframes ${name}{${kf}}.${name}{animation:${name} ${T}s step-end infinite}`);
  visCache.set(key, name);
  return name;
}
const show = (intervals, inner) => (inner ? `<g class="${stepVis(intervals)}">${inner}</g>` : '');
const fillG = (hex, inner) => (inner ? `<g fill="${hex}">${inner}</g>` : '');

// A pixel canvas (screen coordinates). Output: one path per colour, rects merged.
class Canvas {
  constructor(w = SW, h = SH) { this.w = w; this.h = h; this.px = new Array(w * h).fill(null); }
  set(x, y, c) { if (c === null || c === undefined) return; x = Math.round(x); y = Math.round(y); if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.px[y * this.w + x] = c; }
  get(x, y) { return x >= 0 && y >= 0 && x < this.w && y < this.h ? this.px[y * this.w + x] : null; }
  rect(x, y, w, h, c) { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) this.set(i, j, c); }
  sprite(rows, x, y, key) { rows.forEach((r, j) => [...r].forEach((ch, i) => { if (key[ch]) this.set(x + i, y + j, key[ch]); })); }
  disc(cx, cy, r, c) { for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) if (i * i + j * j <= r * r + r * 0.5) this.set(cx + i, cy + j, c); }
  toSvg(filter = null) {
    const byCol = new Map();
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w;) {
        const c = this.px[y * this.w + x];
        if (c === null || (filter && !filter(x, y))) { x++; continue; }
        const s = x;
        while (x < this.w && this.px[y * this.w + x] === c && (!filter || filter(x, y))) x++;
        if (!byCol.has(c)) byCol.set(c, Array.from({ length: this.h }, () => []));
        byCol.get(c)[y].push([s, x - s]);
      }
    }
    return [...byCol].map(([c, rows]) => `<path fill="${c}" d="${runsToPath(rows)}"/>`).join('');
  }
}

// ---------------------------------------------------------------------------------------------
// Layer 1: the grey letters. One <use> per letter, its own keyframes made of steps() runs.
// Grouped by the row they started on, so the screen can be printed again a line at a time.
// ---------------------------------------------------------------------------------------------
const PRINT_ROWS = [...new Set([...glyphs.map((g) => g.r0), O.r0])].sort((a, b) => a - b);
const printAt = (r) => AT.reprint + PRINT_ROWS.indexOf(r) * S16;
const PRINTED = printAt(PRINT_ROWS[PRINT_ROWS.length - 1]) + S16;
const kfs = [];
const offs = (r, c, g) => {
  const dx = (c - g.c0) * CW, dr = r - g.r0; // rows in em: the layer's font-size is one row
  return dx === 0 && dr === 0 ? '0' : `${dx ? `${dx}px` : 0} ${dr}em`;
};
function keyframesFor(g, name) {
  const runs = [];
  let pr = g.r0, pc = g.c0;
  for (const [t, r, c] of g.path) {
    const d = [r - pr, c - pc];
    const last = runs[runs.length - 1];
    if (last && last.t1 === t - 1 && last.d[0] === d[0] && last.d[1] === d[1]) { last.t1 = t; last.n++; } else runs.push({ t0: t, t1: t, n: 1, d, from: [pr, pc], to: null });
    runs[runs.length - 1].to = [r, c];
    pr = r; pc = c;
  }
  const stops = new Map(); // tick -> {v, fn}
  // A run of n moves shown at ticks t0..t1 is one interval from t0-1 to t1 with steps(n): the
  // value jumps at the end of each tick, one cell per tick.
  // (A single move needs no timing function: the default step-end already jumps at the stop.)
  // (Runs of one or two moves are cheaper written out a stop per tick.)
  for (const run of runs) {
    if (run.n > 2) stops.set(run.t0 - 1, { v: offs(run.from[0], run.from[1], g), fn: `steps(${run.n})` });
    else if (run.n === 2) stops.set(run.t0, { v: offs(run.from[0] + run.d[0], run.from[1] + run.d[1], g) });
    stops.set(run.t1, { v: offs(run.to[0], run.to[1], g) });
  }
  stops.set(tk(AT.reset), { v: '0' });
  let kf = '';
  // (one decimal is enough: ticks are 0.22% apart, and 21 ms either way is not visible)
  for (const [t, s] of [...stops].sort((a, b) => a[0] - b[0])) kf += `${+((100 * t * TICK) / T).toFixed(1)}%{translate:${s.v}${s.fn ? `;animation-timing-function:${s.fn}` : ''}}`;
  return kf;
}
const kfNames = new Map(); // identical paths share their keyframes
const letterLayer = (() => {
  let out = '';
  for (const r of PRINT_ROWS) {
    let row = '';
    const inRow = glyphs.filter((g) => g.r0 === r).sort((a, b) => a.c0 - b.c0);
    for (const g of inRow) {
      const body = keyframesFor(g);
      if (!kfNames.has(body)) { kfNames.set(body, `a${kfNames.size.toString(36)}`); kfs.push(`@keyframes ${kfNames.get(body)}{${body}}`); }
      row += `<use href="#${gid(g.ch)}" x="${g.c0 * CW}" style="animation-name:${kfNames.get(body)}"/>`;
    }
    out += `<g class="${stepVis([[0, AT.glyphsOff], [printAt(r), T]])}" transform="translate(0 ${r * CH})">${row}</g>`;
  }
  return out;
})();
css.push(`.F{font-size:${CH}px}.F use{animation:${T}s step-end infinite}`);

// The "o" and the crab. The o falls into the crab's cell; the two leave together to the right.
const crabSprites = (() => {
  const key = { r: C.crab, d: C.crabDk, e: C.white, k: C.black, g: C.grey };
  const alone = new Canvas(8, 16), worn = new Canvas(8, 16);
  alone.sprite([
    '.r....r.',
    'rr.ek.rr',
    'r.....r.',
    '.rrrrrr.',
    'rrrrrrrr',
    '.dddddd.',
    'r.r..r.r',
  ], 0, 9, key);
  // wearing the o as a shell: the letter's own pixels, legs and a claw out from under it
  worn.sprite([
    '.ggggg..',
    'gg...gg.',
    'gg...gg.',
    'gg...ggr',
    'gg...gge',
    'gg...ggr',
    '.ggggg.r',
    '.dddddd.',
    'r.r..r.r',
  ], 0, 6, key);
  return { alone: alone.toSvg(), worn: worn.toSvg() };
})();
const crabLayer = (() => {
  const oFall = tk(AT.oDrop);
  const crabSteps = COLS - CRAB.c; // cells until it is off the screen
  css.push(`@keyframes oo{${pct(AT.oDrop)}{transform:none;animation-timing-function:steps(${oLand - oFall + 1},start)}${pct((oLand + 1) * TICK)}{transform:translate(0,${(CRAB.r - O.r0) * CH}px)}${pct(AT.reset)}{transform:none}}`);
  const oAlone = show([[0, (oLand + 1) * TICK], [printAt(O.r0), T]], `<g class="F" fill="${C.grey}">${useG('o', O.c0 * CW, O.r0 * CH, ' style="animation-name:oo"')}</g>`);
  css.push(`@keyframes cw{${pct(AT.crabGo)}{transform:none;animation-timing-function:steps(${crabSteps},start)}${pct(AT.crabGo + crabSteps * TICK)}{transform:translate(${crabSteps * CW}px,0)}${pct(AT.reset)}{transform:none}}.cw{animation:cw ${T}s step-end infinite}`);
  return `<g transform="translate(${CRAB.c * CW} ${CRAB.r * CH})">`
    + show([[0, (oLand + 1) * TICK], [printAt(CRAB.r), T]], crabSprites.alone)
    + show([[(oLand + 1) * TICK, AT.crabGo + crabSteps * TICK]], `<g class="cw">${crabSprites.worn}</g>`)
    + '</g>' + oAlone;
})();

// The cursor: an underscore after the command, blinking on 8th notes.
const cursor = (() => {
  const iv = [];
  // (on the loop's own 8th-note grid, so the blink carries straight across the loop point)
  const blink = (a, b) => { for (let t = Math.ceil(a / (BEAT / 2) - 1e-9) * (BEAT / 2); t < b - 1e-9; t += BEAT / 2) iv.push([t, Math.min(b, t + BEAT / 4)]); };
  blink(0, AT.cascade0);
  blink(PRINTED, T);
  return show(iv, `<rect x="${CURSOR.c * CW}" y="${CURSOR.r * CH + 13}" width="${CW}" height="2"/>`);
})();

if (DEBUG) console.log(`letter keyframes: ${kfs.join('').length} bytes`);

// ---------------------------------------------------------------------------------------------
// Layer 2: the island. Sea first (it comes in over the bottom of the heap, a row per tick),
// then the heap above the water turns to sand (from the waterline up), then the sky fills in,
// two cells at a time in random order, and the palm grows out of the top of the heap.
// ---------------------------------------------------------------------------------------------
const HORIZON = 18; // the far sea starts at this row; the near water (and the shallows) at WL
const seaAt = (r) => ['#5DB1EA', '#4B9FE0', '#3D8ED4', '#3480C9', '#2C72BC', '#2565AF', '#1F58A1'][r - HORIZON];
// the heap under water: turquoise shallows just under the surface round the island, fading
// with depth and, a cell at a time, with distance from the beach (f: 0 at the beach, 1 at the
// far end of the heap in that row), so that where the heap ends it is the open sea's own
// colour (no seams) and the letters out there only just show
const mix = (a, b, t) => `#${[1, 3, 5].map((i) => Math.round(parseInt(a.slice(i, i + 2), 16) * (1 - t) + parseInt(b.slice(i, i + 2), 16) * t).toString(16).padStart(2, '0')).join('')}`;
const lagoonBg = (r, f) => { const b = [0, 0.42, 0.79][r - WL]; return mix('#4FCAD0', seaAt(r), b + (1 - b) * f); };
const lagoonInk = (r, f) => mix(lagoonBg(r, f), '#FFFFFF', 0.07 + (0.25 - 0.08 * (r - WL)) * (1 - f));
const seaRowAt = (r) => AT.sea + (ROWS - 1 - r) * TICK;
const sandRowAt = (r) => AT.sand + (WL - 1 - r) * TICK;

// Sea rows, bottom up. Behind the island (rows HORIZON..WL-1) only the cells that are not sand.
const seaLayer = (() => {
  let out = '';
  for (let r = ROWS - 1; r >= HORIZON; r--) {
    const cv = new Canvas(SW, CH);
    const inks = new Map(); // ink colour -> glyph uses
    // how far the submerged heap runs out from the beach on either side, in this row
    let lEnd = shoreL, rEnd = shoreR;
    while (lEnd >= 0 && isHeap(r, lEnd)) lEnd--;
    while (rEnd < COLS && isHeap(r, rEnd)) rEnd++;
    const spanL = shoreL - lEnd, spanR = rEnd - shoreR;
    for (let c = 0; c < COLS; c++) {
      if (r < WL && isHeap(r, c)) continue;
      if (isHeap(r, c)) {
        // the heap under water: turquoise shallows round the island, fading into the deep with
        // depth and with distance from the beach; the letters still legible through it
        const away = c <= shoreL ? shoreL + 1 - c : c >= shoreR ? c - shoreR + 1 : 0;
        const span = c <= shoreL ? spanL : spanR;
        const f = away === 0 ? 0 : span ? Math.min(1, away / span) : 1;
        cv.rect(c * CW, 0, CW, CH, lagoonBg(r, f));
        const inkHex = lagoonInk(r, f);
        if (!inks.has(inkHex)) inks.set(inkHex, []);
        inks.get(inkHex).push(useG(heap.get(r * COLS + c).ch, c * CW, 0));
      } else cv.rect(c * CW, 0, CW, CH, seaAt(r));
    }
    if (r === HORIZON) for (let x = 0; x < SW; x++) if (!isHeap(r, Math.floor(x / CW))) cv.set(x, 0, '#D6F1FF');
    const ink = [...inks].map(([hex, list]) => fillG(hex, list.join(''))).join('');
    out += show([[seaRowAt(Math.max(r, WL)), T]], `<g transform="translate(0 ${r * CH})">${cv.toSvg()}${ink}</g>`);
  }
  return out;
})();

// Waves: '≈' in the open water, two sets that swap on every beat.
const waveLayer = (() => {
  const sets = [[], []];
  const r2 = mulberry32(80);
  for (let r = HORIZON; r < ROWS; r++) for (let c = 1; c < COLS - 1; c++) {
    if (isHeap(r, c) || isHeap(r, c - 1) || isHeap(r, c + 1)) continue;
    if (r2() < (r < WL ? 0.07 : 0.05)) sets[r2() < 0.5 ? 0 : 1].push([r, c]);
  }
  const ink = (r) => (r < WL ? '#BFE6FB' : '#7FC3EE');
  const draw = (list) => list.map(([r, c]) => `<g fill="${ink(r)}">${useG('≈', c * CW, r * CH)}</g>`).join('');
  css.push(`@keyframes sw{0%{visibility:visible}50%{visibility:hidden}}.sw0,.sw1{animation:sw ${BEAT * 2}s step-end infinite}.sw1{animation-delay:-${BEAT}s}`);
  return show([[AT.sea + 5 * TICK, T]], `<g class="sw0">${draw(sets[0])}</g><g class="sw1">${draw(sets[1])}</g>`);
})();

// Sand: the heap above the water. The letters stay, darker, like writing in the sand.
const sandLayer = (() => {
  let out = '';
  for (let r = WL - 1; r >= 0; r--) {
    const cv = new Canvas(SW, CH);
    let any = false, ink = '';
    const wet = r === WL - 1;
    for (let c = 0; c < COLS; c++) {
      if (!isHeap(r, c)) continue;
      any = true;
      const surface = !isHeap(r - 1, c);
      cv.rect(c * CW, 0, CW, CH, wet ? C.wetSand : C.sand);
      if (surface) cv.rect(c * CW, 0, CW, 3, C.sandTop);
      ink += useG(heap.get(r * COLS + c).ch, c * CW, 0);
    }
    // a line of foam where the sand meets the water, on either side
    if (wet) for (let c = 0; c < COLS; c++) if (isHeap(r, c) && (!isHeap(r, c - 1) || !isHeap(r, c + 1))) cv.rect(c * CW, CH - 3, CW, 3, C.foam);
    if (any) out += show([[sandRowAt(r), T]], `<g transform="translate(0 ${r * CH})">${cv.toSvg()}${fillG(wet ? C.wetInk : C.sandInk, ink)}</g>`);
  }
  return out;
})();

// The sky: bands from the deep blue under the white line to a pale haze at the horizon,
// joined by rows of the 50% shade character; a sun, and clouds quantised to half cells.
const skyCanvas = (() => {
  const cv = new Canvas();
  const band = [C.sky[0], C.sky[0], 'd01', C.sky[1], C.sky[1], 'd12', C.sky[2], 'd23'];
  for (let r = SKY_ROW; r < HORIZON; r++) {
    const b = band[r - SKY_ROW];
    for (let c = 0; c < COLS; c++) {
      if (isHeap(r, c)) continue;
      cv.rect(c * CW, r * CH, CW, CH, b.startsWith('d') ? `url(#${b})` : b);
    }
  }
  // the sun, upper right: a disc with a paler middle and a ring of light
  const sx = 67 * CW + 4, sy = SKY_ROW * CH + 22;
  for (let j = -22; j <= 22; j++) for (let i = -22; i <= 22; i++) {
    const d = Math.sqrt(i * i + j * j);
    if (d > 21.5 || isHeap(Math.floor((sy + j) / CH), Math.floor((sx + i) / CW))) continue;
    if (d <= 13) cv.set(sx + i, sy + j, d <= 7 ? C.sunHi : C.sun);
    else if (d > 17.5 && d <= 19.5 && (Math.round(Math.atan2(j, i) * 8 / Math.PI) & 1) === 0) cv.set(sx + i, sy + j, C.sunRing);
  }
  // clouds: puffs, filled in 8 x 8 half-cell squares, with a cooler underside
  const cloud = (puffs) => {
    const inside = (x, y) => puffs.some(([cx, cy, rx, ry]) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 < 1);
    for (let y = SKY_ROW * CH; y < HORIZON * CH; y += 8) for (let x = 0; x < SW; x += 8) {
      if (!inside(x + 4, y + 4) || isHeap(Math.floor(y / CH), Math.floor(x / CW))) continue;
      cv.rect(x, y, 8, 8, inside(x + 4, y + 12) ? C.cloud : C.cloudLo);
    }
  };
  cloud([[64, 196, 30, 10], [98, 190, 26, 14], [128, 199, 22, 9]]);
  cloud([[428, 172, 22, 8], [456, 166, 22, 12], [484, 174, 18, 8]]);
  cloud([[244, 238, 18, 6], [262, 234, 14, 8]]);
  return cv;
})();
// Covers for the tile-by-tile fill: two cells per tile, each tile gone on its own 32nd note.
const skyCovers = (() => {
  const tiles = [];
  for (let r = SKY_ROW; r < HORIZON; r++) for (let c = 0; c < COLS; c += 2) {
    const cells = [c, c + 1].filter((cc) => !isHeap(r, cc));
    if (cells.length === 2 || cells.length === 1) tiles.push({ r, cells });
  }
  shuffle(tiles);
  const steps = tk(AT.sky1) - tk(AT.sky0);
  const buckets = Array.from({ length: steps }, () => []);
  tiles.forEach((t, i) => buckets[Math.floor((i * steps) / tiles.length)].push(t));
  return buckets.map((b, k) => {
    const d = b.map(({ r, cells }) => `M${cells[0] * CW} ${r * CH}h${cells.length * CW}v${CH}h-${cells.length * CW}z`).join('');
    return show([[0, AT.sky0 + (k + 1) * TICK]], `<path d="${d}"/>`);
  }).join('');
})();

// ---------------------------------------------------------------------------------------------
// The palm, drawn into a canvas and shown a cell row at a time from the base up
// ---------------------------------------------------------------------------------------------
const PALM = { c: peakCol, base: top[peakCol] * CH };
const palmCanvas = (() => {
  const cv = new Canvas();
  const bx = PALM.c * CW + 3, by = PALM.base + 2;
  const tx = bx - 10, ty = SKY_ROW * CH + 34; // the crown, a little to the left: it leans
  // trunk: a gentle curve, five pixels wide tapering to four, banded
  const N = by - ty;
  for (let k = 0; k <= N; k++) {
    const t = k / N;
    const x = bx + (tx - bx) * t + Math.sin(t * Math.PI) * 5;
    const y = by - k;
    const w = t < 0.5 ? 6 : 5;
    for (let i = 0; i < w; i++) cv.set(x - w / 2 + i, y, i === 0 ? C.trunkDk : i === w - 1 ? C.trunkHi : C.trunk);
    if (k % 6 === 0) for (let i = 0; i < w; i++) cv.set(x - w / 2 + i, y, C.trunkDk);
  }
  // fronds: arcs with a dark underside, drooping at the tips
  const frond = (ang, length, droop) => {
    for (let k = 0; k <= length; k++) {
      const t = k / length;
      const x = tx + Math.cos(ang) * k;
      const y = ty - Math.sin(ang) * k + droop * t * t * length;
      const half = Math.max(0, Math.round(3.2 * Math.sin(Math.PI * Math.min(1, t * 1.15)) - 0.2));
      for (let j = -half; j <= half; j++) cv.set(x, y + j, j > 0 ? C.leaf[0] : j === -half ? C.leaf[3] : j < 0 ? C.leaf[2] : C.leaf[1]);
    }
  };
  frond(Math.PI * 0.94, 46, 0.55);
  frond(Math.PI * 0.80, 40, 0.75);
  frond(Math.PI * 0.62, 30, 0.9);
  frond(Math.PI * 0.40, 34, 0.85);
  frond(Math.PI * 0.18, 42, 0.7);
  frond(Math.PI * 0.04, 46, 0.5);
  frond(Math.PI * 1.08, 30, 0.6);
  frond(-Math.PI * 0.08, 30, 0.6);
  // coconuts
  for (const [dx, dy] of [[-3, 4], [2, 5], [-1, 8]]) { cv.disc(tx + dx, ty + dy, 2, C.nut); cv.set(tx + dx - 1, ty + dy - 1, '#94643C'); }
  return cv;
})();
const palmLayer = (() => {
  let out = '';
  const rTop = SKY_ROW, rBase = Math.floor((PALM.base + 2) / CH);
  for (let r = rBase, k = 0; r >= rTop - 2; r -= 2, k++) {
    const y0 = (r - 1) * CH;
    const svg = palmCanvas.toSvg((x, y) => y >= y0 && y < y0 + 2 * CH);
    if (svg) out += show([[AT.palm + k * S16, T]], svg);
  }
  return out;
})();

// ---------------------------------------------------------------------------------------------
// Her. Small and simple: brown hair in a loose low bun, cream headphones, coral tank top,
// cream shorts, bare feet, and an iced coffee. 12 x 34 pixels.
// ---------------------------------------------------------------------------------------------
const HER_KEY = {
  h: C.hair, H: C.hairHi, k: C.skin, K: C.skinDk, c: C.phone, C: C.phoneDk, e: C.eye,
  t: C.top, T: C.topDk, s: C.shorts, S: C.shortsDk, w: C.cup, b: C.coffee, r: C.straw,
};
// facing left, walking (two frames: legs apart, legs passing)
const HEAD_L = [
  '....ccc.....',
  '...hhcchh...',
  '..hhhcchhh..',
  '..hhhcchhhh.',
  '.hhhCCChhhh.',
  '.kkhCccChhh.',
  '.kekCccChhhh',
  'kkkkCCChhhHh',
  '.kkkkkhhhHHh',
  '..kkkkhhhHH.',
  '...kkkk.....',
];
const BODY_WALK_A = [
  '...kkk......',
  '..ttttt.....',
  '.ttttttt....',
  '.tttttttT...',
  '.ttttttTT...',
  'kktttttTk...',
  'r.ttttttk...',
  'r.ttttttk...',
  'ww.tttttk...',
  'wb.tttttT...',
  'wb.sssssS...',
  'ww.ssssssS..',
  '...ssssssS..',
  '..sss..sssS.',
  '..kk....kkK.',
  '.kk......kK.',
  '.kk......kK.',
  'kk........kK',
  'kk........kK',
  'kk.........k',
  'kk.........k',
  'kk.........k',
  'kkk........k',
];
const BODY_WALK_B = [
  '...kkk......',
  '..ttttt.....',
  '.ttttttt....',
  '.tttttttT...',
  '.ttttttTT...',
  'kktttttTk...',
  'r.ttttttk...',
  'r.ttttttk...',
  'ww.tttttk...',
  'wb.tttttT...',
  'wb.sssssS...',
  'ww.ssssssS..',
  '...ssssssS..',
  '...sss.sss..',
  '....kk.kK...',
  '....kk.kK...',
  '....kk.kK...',
  '....kk.kK...',
  '....kkkK....',
  '....kkkK....',
  '....kkK.....',
  '....kkK.....',
  '...kkkK.....',
];
// facing us, idling: head up / head down a pixel on the beat; and sipping
const HEAD_F = [
  '....cccc....',
  '...chhhhc...',
  '..chhhhhhc..',
  '..chHhhhhc..',
  '.CChhhhhhCC.',
  '.CChkkkkhCC.',
  '.CCkekkekCC.',
  '..hkkkkkkhH.',
  '..hkkkkkkhHh',
  '...kkkkkk.Hh',
  '.....kk.....',
];
const BODY_F = [
  '.....kk.....',
  '...tttttt...',
  '..tttttttt..',
  '.kttttttttk.',
  '.kttttttttk.',
  '.kTttttttTk.',
  '.k.tttttt.k.',
  '.k.tttttt.k.',
  'rk.TttttT.k.',
  'rk.tttttt.k.',
  'ww.ssssss.k.',
  'wb.ssssss.K.',
  'wb.sss.sss..',
  'ww.sss.sss..',
  '...kk...kk..',
  '...kk...kk..',
  '...kk...kk..',
  '...kk...kk..',
  '...kK...kK..',
  '...kK...kK..',
  '...kK...kK..',
  '...kK...kK..',
  '..kkK...kkK.',
];
const BODY_SIP = BODY_F.map((row, i) => {
  // the cup comes up to her mouth; that hand leaves her side
  if (i >= 8 && i <= 13) return '..' + row.slice(2);
  return row;
});
const HER_H = HEAD_F.length + BODY_F.length; // 34 pixels: a little over two cells
function herSprite(head, body, headDy = 0, cupAt = null) {
  const cv = new Canvas(12, HER_H);
  cv.sprite(head, 0, headDy, HER_KEY);
  cv.sprite(body, 0, 11 + (headDy > 0 ? 0 : 0), HER_KEY);
  if (cupAt) cv.sprite(['r..', 'r..', 'ww.', 'wb.', 'wb.', 'ww.'], cupAt[0], cupAt[1], HER_KEY);
  return cv.toSvg();
}
const HER = {
  walkA: herSprite(HEAD_L, BODY_WALK_A),
  walkB: herSprite(HEAD_L, BODY_WALK_B),
  up: herSprite(HEAD_F, BODY_F),
  nod: herSprite(HEAD_F.slice(0, 10), BODY_F, 1),
  sip: herSprite(HEAD_F, BODY_SIP, 0, [2, 6]),
};

// Her walk: in from the right over the water, a cell per 16th note, up the beach to the palm.
const herLayer = (() => {
  const stopC = PALM.c + 3; // her left cell: just right of the trunk
  const path = []; // [time, x, footY, frame]
  let c = COLS, t = AT.walk, f = 0;
  const footRow = (cc) => Math.min(WL, top[cc] ?? ROWS, top[cc + 1] ?? ROWS);
  while (c > stopC) {
    c--;
    path.push([t, c * CW + 2, footRow(c) * CH, f ? 'walkB' : 'walkA']);
    t += S16; f ^= 1;
  }
  const arrive = t;
  // keyframes for the position (translate), and visibility per frame
  let kf = '';
  path.forEach(([tt, x, y]) => { kf += `${pct(tt)}{transform:translate(${x}px,${y - HER_H}px)}`; });
  css.push(`@keyframes hw{0%{transform:translate(${SW}px,${WL * CH - HER_H}px)}${kf}}.hw{animation:hw ${T}s step-end infinite}`);
  // Frames alternate by two short loops on the music's grid: the walk swaps on every 16th note
  // (it set off on a beat), the nod is down for the first 8th of every beat. Two keyframe sets
  // (first half, second half) rather than one with an offset, so a paused frame shows one pose.
  css.push(`@keyframes h1{0%{opacity:1}50%{opacity:0}}@keyframes h2{0%{opacity:0}50%{opacity:1}}`
    + `.w1{animation:h1 ${S16 * 2}s step-end infinite}.w2{animation:h2 ${S16 * 2}s step-end infinite}`
    + `.n1{animation:h1 ${BEAT}s step-end infinite}.n2{animation:h2 ${BEAT}s step-end infinite}`);
  if (Math.abs(AT.walk / (S16 * 2) - Math.round(AT.walk / (S16 * 2))) > 1e-9) throw new Error('walk must start on an 8th note');
  const sip = [30.75, 32.25];
  return `<g class="hw">`
    + show([[AT.walk, arrive]], `<g class="w1">${HER.walkA}</g><g class="w2">${HER.walkB}</g>`)
    + show([[arrive, sip[0]], [sip[1], T]], `<g class="n1">${HER.nod}</g><g class="n2">${HER.up}</g>`)
    + show([sip], HER.sip)
    + '</g>';
})();

// The crab comes back, still wearing the o, and settles on the beach by her feet.
const crabBack = (() => {
  const steps = [];
  let c = shoreR, t = 27.0;
  const stop = shoreR - 5;
  steps.push([t, c]);
  while (c > stop) { c--; t += S16; steps.push([t, c]); }
  let kf = '';
  steps.forEach(([tt, cc]) => { kf += `${pct(tt)}{transform:translate(${cc * CW}px,${(Math.min(top[cc], WL) - 1) * CH}px)}`; });
  css.push(`@keyframes cb{0%{transform:translate(${shoreR * CW}px,${(WL - 1) * CH}px)}${kf}}.cb{animation:cb ${T}s step-end infinite}`);
  return show([[27.0, T]], `<g class="cb"><g transform="matrix(-1 0 0 1 8 0)">${crabSprites.worn}</g></g>`);
})();

// ---------------------------------------------------------------------------------------------
// The title: inverse-video cells, light grey with dark grey letters that spell the name again
// ---------------------------------------------------------------------------------------------
const titleLayer = (() => {
  let bg = '', fg = '', sh = '';
  const word = 'castaway';
  const byRow = new Map();
  for (const cell of titleCells) { if (!byRow.has(cell.r)) byRow.set(cell.r, []); byRow.get(cell.r).push(cell); }
  for (const [r, cells] of byRow) {
    cells.sort((a, b) => a.c - b.c);
    let row = '';
    cells.forEach(({ c }, i) => {
      bg += `M${c * CW} ${r * CH}h${CW}v${CH}h-${CW}z`;
      row += `<use href="#${gid(word[(i + r * 3) % word.length])}" x="${c * CW}"/>`;
    });
    fg += `<g transform="translate(0 ${r * CH})">${row}</g>`;
  }
  // a drop shadow, half a cell down and one cell right, in the dark shade character
  const shCv = new Canvas();
  for (const { r, c } of titleCells) {
    for (const [dr, dc] of [[0, 1], [1, 0], [1, 1]]) {
      const rr = r + dr, cc = c + dc;
      if (isTitle.has(rr * COLS + cc)) continue;
      const x = cc * CW, y = rr * CH;
      const h = dr === 1 ? 8 : CH;
      const y0 = dr === 1 ? y : y + 8 * (dr === 0 ? 1 : 0);
      shCv.rect(x, y0, CW, h, 'url(#sh)');
    }
  }
  sh = shCv.toSvg();
  return sh + `<path fill="${C.grey}" d="${bg}"/><g fill="#848484">${fg}</g>`;
})();
const subtitleLayer = (() => {
  const c = centreCol(SUBTITLE);
  return `<rect x="${c * CW - 4}" y="${SUB_ROW * CH}" width="${len(SUBTITLE) * CW + 8}" height="${CH}"/>`
    + `<g fill="${C.white}">${text(SUB_ROW, c, SUBTITLE)}</g>`;
})();

// ---------------------------------------------------------------------------------------------
// Assembly
// ---------------------------------------------------------------------------------------------
const island = [seaLayer, sandLayer, waveLayer, skyCanvas.toSvg(), `<g fill="#000">${skyCovers}</g>`, palmLayer, crabBack, herLayer].join('');
// The island is shown from the moment the sea comes in; it fades out in eight palette steps.
// (opacity, not visibility: the layers inside switch their own visibility on, which would
// override a hidden parent)
css.push(`@keyframes isl{0%{opacity:0}${pct(AT.sea)}{opacity:1}${pct(AT.fade)}{opacity:1;animation-timing-function:steps(8)}${pct(AT.black)}{opacity:0}}.isl{animation:isl ${T}s step-end infinite}`);
css.push(`@media (prefers-reduced-motion:reduce){*{animation-delay:-${REST}s!important;animation-play-state:paused!important}}`);

// The 50% shade character as a fill: two colours in a one-pixel checker.
const checker = (id, lo, hi) => `<pattern id="${id}" width="2" height="2" patternUnits="userSpaceOnUse"><rect width="2" height="2" fill="${lo}"/><path d="M0 0h1v1h-1zM1 1h1v1h-1z" fill="${hi}"/></pattern>`;
const PATTERNS = checker('d01', C.sky[0], C.sky[1]) + checker('d12', C.sky[1], C.sky[2]) + checker('d23', C.sky[2], C.sky[3])
  + `<pattern id="sh" width="2" height="2" patternUnits="userSpaceOnUse"><path d="M0 0h1v1h-1zM1 1h1v1h-1z" fill="#4A4A4A"/></pattern>`;
const glyphDefs = [...glyphIds].map(([ch, id]) => `<path id="${id}" d="${glyphPath(FONT.get(ch))}"/>`).join('');
const TITLE_TEXT = 'CASTAWAY: a DOS screen whose letters fall off their lines and become a small island';
const DESC = 'An 80 by 25 text screen, grey on black: CASTAWAY in big inverse-video block letters, a centred paragraph about a ten-hour lo-fi island video, and a prompt with python tools\\serve.py typed and waiting. One o drops onto a hermit crab, who walks off wearing it. Then every grey letter lets go, a row at a time, and heaps up at the bottom like sand. The sea comes in over the heap, the top of it turns to an island, the sky fills in tile by tile, a palm grows, and a young woman in cream headphones walks in over the water with an iced coffee and nods to the beat. Then the screen is printed again.';
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VBW} ${VBH}" width="${VBW}" height="${VBH}" role="img" aria-labelledby="t d">`
  + `<title id="t">${TITLE_TEXT}</title><desc id="d">${DESC.replace(/&/g, '&amp;')}</desc>`
  + `<style>${css.join('')}${kfs.join('')}</style>`
  + `<defs>${glyphDefs}${PATTERNS}<pattern id="scan" width="4" height="2" patternUnits="userSpaceOnUse"><rect width="4" height="1" fill="#000" opacity=".16"/></pattern>`
  + `<radialGradient id="glass" cx=".5" cy=".45" r=".75"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></radialGradient></defs>`
  // the monitor
  + `<rect width="${VBW}" height="${VBH}" rx="20" fill="#1B1D22"/><rect x="2" y="2" width="${VBW - 4}" height="${VBH - 4}" rx="18" fill="none" stroke="#33373F" stroke-width="2"/>`
  + `<rect x="${BEZ - 6}" y="${BEZ - 6}" width="${SW + 12}" height="${SH + 12}" rx="10" fill="#000"/>`
  + `<g transform="translate(${BEZ} ${BEZ})">`
  + `<rect width="${SW}" height="${SH}" fill="#000"/>`
  + `<g class="F" fill="${C.grey}">${letterLayer}</g>`
  + crabLayer
  + `<g fill="${C.grey}">${cursor}</g>`
  + `<g class="isl">${island}</g>`
  + titleLayer + subtitleLayer
  + `<rect width="${SW}" height="${SH}" fill="url(#scan)"/>`
  + `</g>`
  + `<rect x="${BEZ - 6}" y="${BEZ - 6}" width="${SW + 12}" height="${SH + 12}" rx="10" fill="url(#glass)"/>`
  + `</svg>\n`;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, svg);
console.log(`wrote ${path.relative(process.cwd(), OUT)} (${(svg.length / 1024).toFixed(1)} KB, ${glyphs.length + 1} letters, ${kfs.length} keyframe sets)`);
if (DEBUG) for (const [k, v] of Object.entries({ letterLayer, crabLayer, seaLayer, sandLayer, waveLayer, sky: skyCanvas.toSvg(), skyCovers, palmLayer, crabBack, herLayer, titleLayer, css: css.join(''), kfs: kfs.join('') })) console.log(k.padEnd(12), (v.length / 1024).toFixed(1), 'KB');
