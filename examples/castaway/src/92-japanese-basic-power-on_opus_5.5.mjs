#!/usr/bin/env node
// CASTAWAY as the screen a Japanese home computer showed when you switched it on with no disk in
// the drive: a self-test count that ends in OK, ROM BASIC asking a question nobody understood,
// a banner, "Ok", a block cursor, and a row of reverse-video function-key boxes along the bottom.
//
// Style: "Japanese 8/16-bit BASIC power-on" (catalogue asia-06): the PC-88 / PC-98 start-up
// screen of N88-BASIC, and the blue MSX BASIC screen. Nothing is copied from them: no maker,
// product or version names, no copyright lines, no ROM font. The question, the banner, the
// key labels, both bitmap fonts and the island are new, and everything describes Castaway.
//
// Regenerate:  node examples/castaway/src/92-japanese-basic-power-on_opus_5.5.mjs
// Writes:      assets/92-japanese-basic-power-on_opus_5.5.svg      (the 80 x 25 power-on screen)
//              assets/92-japanese-basic-power-on_opus_5.5-msx.svg  (the 40-column blue screen)
//
// Plain Node, no dependencies, deterministic (seeded PRNG, no clock).
//
// How the main screen is built. Two planes, as on the real machines:
//  * a TEXT plane, 80 x 25 cells of 8 x 16, drawn with <use> of glyph paths from the thin
//    single-stroke font below (never <text>);
//  * a GRAPHICS plane, 640 x 200 "200-line" pixels in the eight digital colours, each pixel
//    one wide and two tall, with every other scanline left black (one striped overlay), so solid
//    colour looks striped while the text floats crisp on top. Extra shades are checker dithers,
//    drawn as pattern fills. The island is rasterised in code (boxes, ellipses, lines, paints,
//    the way a BASIC program would draw it) and merged into runs.
//
// One loop is 36 s, twelve bars of the project's theme (80 BPM, a bar every 3 s):
//   0-21 s  the program is running and asking "Wait another bar (Y/N)?". She idles and nods
//           on every beat; the lit function key says what she is doing. Bar 2: she throws a
//           bottle; it washes straight back. Bar 5: a shark in headphones surfaces and nods
//           along. Bar 7: she waves for rescue, and somebody finally answers the question: N.
//   21 s    so it starts again: power off. The self-test counts up 12000 BARS (ten hours of
//           3-second bars) and says OK; BASIC asks "How many hours(0-15)?", someone answers 10,
//           the banner prints and someone types run "castaway". The program paints the sky,
//           the sea, the sun, blows the font up into the title, and draws the island, the palm,
//           the raft and her.
//   36 s    the same frame as 0 s.
// With prefers-reduced-motion (or no animation) it rests on the finished screen.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '92-japanese-basic-power-on_opus_5.5';
const ASSETS = path.join(HERE, '..', 'assets');

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

const fmt = (n) => {
  const s = (Math.round(n * 1000) / 1000).toString();
  return s === '-0' ? '0' : s;
};

// ---------------------------------------------------------------------------------------------
// The thin 8 x 16 font: single-pixel strokes, tall narrow capitals, slashed zero. Each glyph is
// a list of row strings placed from row `top` of the cell, starting at column 1 (column 0 and,
// for most glyphs, column 7 are spacing).
// ---------------------------------------------------------------------------------------------
const THIN = new Map();
function defThin(ch, top, rows) {
  const g = new Array(16).fill(0);
  rows.split(' ').forEach((r, i) => {
    let v = 0;
    for (let c = 0; c < r.length; c++) if (r[c] === '#') v |= 1 << (6 - c); // col 1 + c
    g[top + i] = v;
  });
  THIN.set(ch, g);
}
const CAP = {
  A: '..##.. .#..#. #....# #....# #....# ###### #....# #....# #....# #....# #....#',
  B: '#####. #....# #....# #....# #....# #####. #....# #....# #....# #....# #####.',
  C: '.####. #....# #..... #..... #..... #..... #..... #..... #..... #....# .####.',
  D: '####.. #...#. #....# #....# #....# #....# #....# #....# #....# #...#. ####..',
  E: '###### #..... #..... #..... #..... #####. #..... #..... #..... #..... ######',
  F: '###### #..... #..... #..... #..... #####. #..... #..... #..... #..... #.....',
  G: '.####. #....# #..... #..... #..... #..### #....# #....# #....# #...## .###.#',
  H: '#....# #....# #....# #....# #....# ###### #....# #....# #....# #....# #....#',
  I: '.###.. ..#... ..#... ..#... ..#... ..#... ..#... ..#... ..#... ..#... .###..',
  J: '...### ....#. ....#. ....#. ....#. ....#. ....#. ....#. #...#. #...#. .###..',
  K: '#....# #....# #...#. #..#.. #.#... ##.... #.#... #..#.. #...#. #....# #....#',
  L: '#..... #..... #..... #..... #..... #..... #..... #..... #..... #..... ######',
  M: '#....# ##..## #.##.# #.##.# #....# #....# #....# #....# #....# #....# #....#',
  N: '#....# ##...# ##...# #.#..# #.#..# #..#.# #..#.# #...## #...## #....# #....#',
  O: '.####. #....# #....# #....# #....# #....# #....# #....# #....# #....# .####.',
  P: '#####. #....# #....# #....# #....# #####. #..... #..... #..... #..... #.....',
  Q: '.####. #....# #....# #....# #....# #....# #....# #....# #..#.# #...#. .###.#',
  R: '#####. #....# #....# #....# #....# #####. #.#... #..#.. #...#. #....# #....#',
  S: '.####. #....# #..... #..... .#.... ..##.. ....#. .....# .....# #....# .####.',
  T: '#####. ..#... ..#... ..#... ..#... ..#... ..#... ..#... ..#... ..#... ..#...',
  U: '#....# #....# #....# #....# #....# #....# #....# #....# #....# #....# .####.',
  V: '#...#. #...#. #...#. #...#. #...#. #...#. .#.#.. .#.#.. .#.#.. ..#... ..#...',
  W: '#....# #....# #....# #....# #....# #....# #.##.# #.##.# #.##.# ##..## #....#',
  X: '#...#. #...#. .#.#.. .#.#.. ..#... ..#... ..#... .#.#.. .#.#.. #...#. #...#.',
  Y: '#...#. #...#. #...#. .#.#.. .#.#.. ..#... ..#... ..#... ..#... ..#... ..#...',
  Z: '###### .....# .....# ....#. ...#.. ..#... .#.... #..... #..... #..... ######',
  0: '.####. #....# #...## #...## #..#.# #..#.# #.#..# ##...# ##...# #....# .####.',
  1: '..#... .##... #.#... ..#... ..#... ..#... ..#... ..#... ..#... ..#... #####.',
  2: '.####. #....# .....# .....# ....#. ...#.. ..#... .#.... #..... #..... ######',
  3: '.####. #....# .....# .....# .....# ..###. .....# .....# .....# #....# .####.',
  4: '....#. ...##. ..#.#. .#..#. #...#. #...#. ###### ....#. ....#. ....#. ....#.',
  5: '###### #..... #..... #..... #####. .....# .....# .....# .....# #....# .####.',
  6: '..###. .#.... #..... #..... #####. #....# #....# #....# #....# #....# .####.',
  7: '###### #....# .....# ....#. ....#. ...#.. ...#.. ..#... ..#... ..#... ..#...',
  8: '.####. #....# #....# #....# #....# .####. #....# #....# #....# #....# .####.',
  9: '.####. #....# #....# #....# #....# .##### .....# .....# .....# ....#. .###..',
  '?': '.####. #....# .....# .....# ....#. ...#.. ..#... ..#... ...... ..#... ..#...',
  '!': '..#... ..#... ..#... ..#... ..#... ..#... ..#... ..#... ...... ..#... ..#...',
  '/': '.....# .....# ....#. ....#. ...#.. ...#.. ..#... .#.... .#.... #..... #.....',
};
for (const [ch, rows] of Object.entries(CAP)) defThin(String(ch), 3, rows);
const LOW = {
  a: [6, '.####. .....# .....# .##### #....# #....# #...## .###.#'],
  b: [3, '#..... #..... #..... #.###. ##...# #....# #....# #....# #....# ##...# #.###.'],
  c: [6, '.####. #....# #..... #..... #..... #..... #....# .####.'],
  d: [3, '.....# .....# .....# .###.# #...## #....# #....# #....# #....# #...## .###.#'],
  e: [6, '.####. #....# #....# ###### #..... #..... #....# .####.'],
  f: [3, '..###. .#...# .#.... .#.... ####.. .#.... .#.... .#.... .#.... .#.... .#....'],
  g: [6, '.###.# #...## #....# #....# #....# #...## .###.# .....# #....# .####.'],
  h: [3, '#..... #..... #..... #.###. ##...# #....# #....# #....# #....# #....# #....#'],
  i: [4, '..#... ...... .##... ..#... ..#... ..#... ..#... ..#... ..#... .###..'],
  j: [4, '....#. ...... ...##. ....#. ....#. ....#. ....#. ....#. ....#. ....#. #...#. .###..'],
  k: [3, '#..... #..... #..... #...#. #..#.. #.#... ##.... #.#... #..#.. #...#. #....#'],
  l: [3, '.##... ..#... ..#... ..#... ..#... ..#... ..#... ..#... ..#... ..#... .###..'],
  m: [6, '##.#.. #.#.#. #.#.#. #.#.#. #.#.#. #.#.#. #.#.#. #.#.#.'],
  n: [6, '#.###. ##...# #....# #....# #....# #....# #....# #....#'],
  o: [6, '.####. #....# #....# #....# #....# #....# #....# .####.'],
  p: [6, '#.###. ##...# #....# #....# #....# ##...# #.###. #..... #..... #.....'],
  q: [6, '.###.# #...## #....# #....# #....# #...## .###.# .....# .....# .....#'],
  r: [6, '#.###. ##...# #..... #..... #..... #..... #..... #.....'],
  s: [6, '.####. #....# #..... .####. .....# .....# #....# .####.'],
  t: [4, '.#.... .#.... ####.. .#.... .#.... .#.... .#.... .#.... .#...# ..###.'],
  u: [6, '#....# #....# #....# #....# #....# #....# #...## .###.#'],
  v: [6, '#...#. #...#. #...#. #...#. .#.#.. .#.#.. ..#... ..#...'],
  w: [6, '#...#. #...#. #...#. #.#.#. #.#.#. #.#.#. #.#.#. .#.#..'],
  x: [6, '#...#. .#.#.. .#.#.. ..#... ..#... .#.#.. .#.#.. #...#.'],
  y: [6, '#....# #....# #....# #....# #....# #...## .###.# .....# #....# .####.'],
  z: [6, '###### .....# ....#. ...#.. ..#... .#.... #..... ######'],
  '(': [2, '...#.. ..#... ..#... .#.... .#.... .#.... .#.... .#.... .#.... .#.... ..#... ..#... ...#..'],
  ')': [2, '.#.... ..#... ..#... ...#.. ...#.. ...#.. ...#.. ...#.. ...#.. ...#.. ..#... ..#... .#....'],
  '-': [8, '#####.'],
  '.': [12, '.##... .##...'],
  ',': [12, '.##... ..#... .#....'],
  ':': [6, '.##... .##... ...... ...... ...... ...... .##... .##...'],
  ';': [6, '.##... .##... ...... ...... ...... ...... .##... ..#... .#....'],
  '"': [3, '.#.#.. .#.#.. .#.#..'],
  "'": [3, '..#... ..#... .#....'],
  '=': [7, '#####. ...... #####.'],
  '+': [6, '..#... ..#... ..#... #####. ..#... ..#... ..#...'],
  '*': [6, '..#... #.#.#. .###.. ..#... .###.. #.#.#. ..#...'],
  '<': [4, '....#. ...#.. ..#... .#.... #..... .#.... ..#... ...#.. ....#.'],
  '>': [4, '#..... .#.... ..#... ...#.. ....#. ...#.. ..#... .#.... #.....'],
  '_': [15, '#######'],
  '↵': [8, '.....# ..#..# .##### ..#...'], // the little carriage-return mark on some keys
};
for (const [ch, [top, rows]] of Object.entries(LOW)) defThin(ch, top, rows);
THIN.set(' ', new Array(16).fill(0));

// The chunky 6 x 8 font of the 40-column blue screen (two-pixel verticals, MSX-like weight).
// Rows are 6 wide (columns 0..5, column 5 usually spacing), 7 rows from the top.
const CHUNKY = new Map();
function defChunky(ch, rows) {
  const g = new Array(8).fill(0);
  rows.split(' ').forEach((r, i) => {
    let v = 0;
    for (let c = 0; c < r.length; c++) if (r[c] === '#') v |= 1 << (5 - c);
    g[i] = v;
  });
  CHUNKY.set(ch, g);
}
const CH6 = {
  A: '.##.. #..#. #..#. ####. #..#. #..#. #..#.', B: '###.. #..#. #..#. ###.. #..#. #..#. ###..',
  C: '.##.. #..#. #.... #.... #.... #..#. .##..', D: '###.. #..#. #..#. #..#. #..#. #..#. ###..',
  E: '####. #.... #.... ###.. #.... #.... ####.', F: '####. #.... #.... ###.. #.... #.... #....',
  G: '.##.. #..#. #.... #.##. #..#. #..#. .###.', H: '#..#. #..#. #..#. ####. #..#. #..#. #..#.',
  I: '###.. .#... .#... .#... .#... .#... ###..', J: '..##. ...#. ...#. ...#. #..#. #..#. .##..',
  K: '#..#. #.#.. ##... #.... ##... #.#.. #..#.', L: '#.... #.... #.... #.... #.... #.... ####.',
  M: '#...# ##.## #.#.# #.#.# #...# #...# #...#', N: '#..#. ##.#. ##.#. #.##. #.##. #..#. #..#.',
  O: '.##.. #..#. #..#. #..#. #..#. #..#. .##..', P: '###.. #..#. #..#. ###.. #.... #.... #....',
  Q: '.##.. #..#. #..#. #..#. #.##. #..#. .##.#', R: '###.. #..#. #..#. ###.. #.#.. #..#. #..#.',
  S: '.##.. #..#. #.... .##.. ...#. #..#. .##..', T: '###.. .#... .#... .#... .#... .#... .#...',
  U: '#..#. #..#. #..#. #..#. #..#. #..#. .##..', V: '#..#. #..#. #..#. #..#. #..#. .##.. .##..',
  W: '#...# #...# #...# #.#.# #.#.# ##.## #...#', X: '#..#. #..#. .##.. .##.. .##.. #..#. #..#.',
  Y: '#.#.. #.#.. #.#.. .#... .#... .#... .#...', Z: '####. ...#. ..#.. .#... #.... #.... ####.',
  0: '.##.. #..#. #.##. ##.#. #..#. #..#. .##..', 1: '.#... ##... .#... .#... .#... .#... ###..',
  2: '.##.. #..#. ...#. ..#.. .#... #.... ####.', 3: '.##.. #..#. ...#. .##.. ...#. #..#. .##..',
  4: '..#.. .##.. #.#.. #.#.. ####. ..#.. ..#..', 5: '####. #.... ###.. ...#. ...#. #..#. .##..',
  6: '.##.. #.... ###.. #..#. #..#. #..#. .##..', 7: '####. ...#. ..#.. ..#.. .#... .#... .#...',
  8: '.##.. #..#. #..#. .##.. #..#. #..#. .##..', 9: '.##.. #..#. #..#. .###. ...#. ..#.. .#...',
  '.': '..... ..... ..... ..... ..... ..... .#...', ':': '..... .#... ..... ..... ..... .#... .....',
  '/': '...#. ...#. ..#.. ..#.. .#... .#... #....', '-': '..... ..... ..... ####. ..... ..... .....',
  '(': '..#.. .#... #.... #.... #.... .#... ..#..', ')': '#.... .#... ..#.. ..#.. ..#.. .#... #....',
  '"': '#.#.. #.#.. ..... ..... ..... ..... .....', "'": '.#... .#... ..... ..... ..... ..... .....',
  ',': '..... ..... ..... ..... ..... .#... #....', '?': '.##.. #..#. ...#. ..#.. .#... ..... .#...',
  '_': '..... ..... ..... ..... ..... ..... #####', '=': '..... ..... ####. ..... ####. ..... .....',
  '!': '.#... .#... .#... .#... .#... ..... .#...', '#': '.#.#. ##### .#.#. .#.#. ##### .#.#. .....',
};
for (const [ch, rows] of Object.entries(CH6)) defChunky(String(ch), rows);
// lower case for the blue screen: x-height of five rows; descenders use the cell's last row
const SMALLCAP = {
  a: '..... ..... .##.. ...#. .###. #..#. .###.', b: '#.... #.... ###.. #..#. #..#. #..#. ###..',
  c: '..... ..... .##.. #.... #.... #.... .##..', d: '...#. ...#. .###. #..#. #..#. #..#. .###.',
  e: '..... ..... .##.. #..#. ####. #.... .##..', f: '..##. .#... ###.. .#... .#... .#... .#...',
  g: '..... ..... .###. #..#. #..#. .###. ...#. .##..', h: '#.... #.... ###.. #..#. #..#. #..#. #..#.',
  i: '.#... ..... ##... .#... .#... .#... ###..', j: '..#.. ..... .##.. ..#.. ..#.. ..#.. ..#.. ##...',
  k: '#.... #.... #..#. #.#.. ##... #.#.. #..#.', l: '##... .#... .#... .#... .#... .#... ###..',
  m: '..... ..... ##.#. #.#.# #.#.# #.#.# #...#', n: '..... ..... ###.. #..#. #..#. #..#. #..#.',
  o: '..... ..... .##.. #..#. #..#. #..#. .##..', p: '..... ..... ###.. #..#. #..#. ###.. #.... #....',
  q: '..... ..... .###. #..#. #..#. .###. ...#. ...#.', r: '..... ..... #.##. ##... #.... #.... #....',
  s: '..... ..... .###. #.... .##.. ...#. ###..', t: '.#... .#... ###.. .#... .#... .#... ..##.',
  u: '..... ..... #..#. #..#. #..#. #..#. .###.', v: '..... ..... #...# #...# .#.#. .#.#. ..#..',
  w: '..... ..... #...# #.#.# #.#.# #.#.# .#.#.', x: '..... ..... #..#. #..#. .##.. #..#. #..#.',
  y: '..... ..... #..#. #..#. #..#. .###. ...#. .##..', z: '..... ..... ####. ...#. .##.. #.... ####.',
};
for (const [ch, rows] of Object.entries(SMALLCAP)) defChunky(ch, rows);
CHUNKY.set(' ', new Array(8).fill(0));

// A glyph bitmap -> path data (one rect per horizontal run, runs merged down the rows).
function bitsToPath(bits, width, px = 1, py = 1) {
  const runs = [];
  bits.forEach((v, y) => {
    let x = 0;
    while (x < width) {
      if (v & (1 << (width - 1 - x))) {
        let e = x;
        while (e < width && v & (1 << (width - 1 - e))) e++;
        runs.push({ x, y, w: e - x, h: 1 });
        x = e;
      } else x++;
    }
  });
  // vertical merge of identical runs
  const out = [];
  for (const r of runs) {
    const prev = out.find((o) => o.x === r.x && o.w === r.w && o.y + o.h === r.y);
    if (prev) prev.h++;
    else out.push({ ...r });
  }
  return out.map((r) => `M${r.x * px} ${r.y * py}h${r.w * px}v${r.h * py}h${-r.w * px}z`).join('');
}

// ---------------------------------------------------------------------------------------------
// CSS animation helpers. Every timed thing is a class whose keyframes hold each value until the
// next keyframe (step-end): hard cuts, as on the real screen and in the project.
// ---------------------------------------------------------------------------------------------
function makeAnim(T, REST) {
  const css = [];
  const cache = new Map();
  let n = 0;
  const pct = (t) => fmt((t / T) * 100);
  const on = (iv, t) => iv.some(([a, b]) => t >= a - 1e-9 && t < b - 1e-9);
  // Visible during the given intervals (seconds within one loop).
  function vis(iv) {
    const key = 'v' + JSON.stringify(iv);
    if (cache.has(key)) return cache.get(key);
    const cls = `v${(n++).toString(36)}`;
    const ts = [...new Set([0, ...iv.flat()])].filter((t) => t >= 0 && t < T).sort((a, b) => a - b);
    const frames = ts.map((t) => `${pct(t)}%{opacity:${on(iv, t) ? 1 : 0}}`);
    frames.push(`100%{opacity:${on(iv, T - 1e-6) ? 1 : 0}}`);
    css.push(`.${cls}{animation:${cls}k ${T}s step-end infinite${on(iv, REST) ? '' : ';opacity:0'}}`);
    css.push(`@keyframes ${cls}k{${frames.join('')}}`);
    cache.set(key, cls);
    return cls;
  }
  // Stepped moves: points [[t, dx, dy], ...]; each position holds until the next point.
  function move(points) {
    const key = 'm' + JSON.stringify(points);
    if (cache.has(key)) return cache.get(key);
    const cls = `m${(n++).toString(36)}`;
    const pts = [...points].sort((a, b) => a[0] - b[0]);
    const at = (t) => { let p = pts[pts.length - 1]; for (const q of pts) if (q[0] <= t + 1e-9) p = q; return p; };
    const ts = [...new Set([0, ...pts.map((p) => p[0])])].filter((t) => t >= 0 && t < T).sort((a, b) => a - b);
    const tr = (p) => `transform:translate(${fmt(p[1])}px,${fmt(p[2])}px)`;
    const frames = ts.map((t) => `${pct(t)}%{${tr(at(t))}}`);
    frames.push(`100%{${tr(at(T - 1e-6))}}`);
    const rest = at(REST);
    css.push(`.${cls}{animation:${cls}k ${T}s step-end infinite;${tr(rest)}}`);
    css.push(`@keyframes ${cls}k{${frames.join('')}}`);
    cache.set(key, cls);
    return cls;
  }
  // A short repeating cycle (period divides T): visible for [a,b) of each period.
  function cycle(period, iv) {
    const key = 'c' + period + JSON.stringify(iv);
    if (cache.has(key)) return cache.get(key);
    const cls = `c${(n++).toString(36)}`;
    const p = (t) => fmt((t / period) * 100);
    const ts = [...new Set([0, ...iv.flat()])].filter((t) => t >= 0 && t < period).sort((a, b) => a - b);
    const frames = ts.map((t) => `${p(t)}%{opacity:${on(iv, t) ? 1 : 0}}`);
    frames.push(`100%{opacity:${on(iv, period - 1e-6) ? 1 : 0}}`);
    css.push(`.${cls}{animation:${cls}k ${period}s step-end infinite${on(iv, 0) ? '' : ';opacity:0'}}`);
    css.push(`@keyframes ${cls}k{${frames.join('')}}`);
    cache.set(key, cls);
    return cls;
  }
  return { css, vis, move, cycle };
}

// ---------------------------------------------------------------------------------------------
// Graphics plane: 640 x 200 pixels, eight digital colours plus checker dithers.
// ---------------------------------------------------------------------------------------------
const DIGI = ['#000000', '#0000ff', '#ff0000', '#ff00ff', '#00ff00', '#00ffff', '#ffff00', '#ffffff'];
const K = 0, BLU = 1, RED = 2, MAG = 3, GRN = 4, CYN = 5, YEL = 6, WHT = 7;
// dithers: [colour on even pixels, colour on odd pixels]
const DITHER = {
  8: [BLU, CYN], // sky haze, shallow sea
  9: [RED, K], // her hair: a dark red-brown
  10: [RED, YEL], // orange: palm bark, wet sand
  11: [YEL, WHT], // cream: her shorts, sand highlights
  12: [GRN, K], // shade under the fronds and bushes
  13: [CYN, WHT], // foam, cloud bellies
  14: [RED, WHT], // her skin
  15: [GRN, YEL], // sunlit fronds
  16: [WHT, K], // grey: rocks, the shark
  19: [MAG, WHT], // pink
  20: [WHT, BLU], // blue-grey: the shark
};
const GW = 640, GH = 200;
class Raster {
  constructor(w = GW, h = GH) { this.w = w; this.h = h; this.p = new Uint8Array(w * h).fill(255); }
  set(x, y, c) { x = Math.round(x); y = Math.round(y); if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.p[y * this.w + x] = c; }
  get(x, y) { return x >= 0 && y >= 0 && x < this.w && y < this.h ? this.p[y * this.w + x] : 255; }
  box(x0, y0, x1, y1, c) { for (let y = Math.round(y0); y <= Math.round(y1); y++) for (let x = Math.round(x0); x <= Math.round(x1); x++) this.set(x, y, c); }
  hline(x0, x1, y, c) { for (let x = Math.round(x0); x <= Math.round(x1); x++) this.set(x, y, c); }
  // filled ellipse in pixel units (ry is in rows, so a round circle has ry = rx / 2)
  ellipse(cx, cy, rx, ry, c, test) {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
      const dy = (y - cy) / ry;
      if (Math.abs(dy) > 1) continue;
      const hw = rx * Math.sqrt(1 - dy * dy);
      for (let x = Math.round(cx - hw); x <= Math.round(cx + hw); x++) if (!test || test(x, y)) this.set(x, y, c);
    }
  }
  line(x0, y0, x1, y1, c) {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    for (;;) {
      this.set(x0, y0, c);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
  }
  // A one-pixel black outline around everything drawn (sprites on 8-colour screens had one).
  outline(c = 0) {
    const q = new Uint8Array(this.p);
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) {
      if (q[y * this.w + x] !== 255) continue;
      const n = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => { const v = x + dx >= 0 && y + dy >= 0 && x + dx < this.w && y + dy < this.h ? q[(y + dy) * this.w + x + dx] : 255; return v !== 255 && v !== c; });
      if (n) this.p[y * this.w + x] = c;
    }
  }
  // ASCII sprite: map of chars -> colour codes ('.' = transparent)
  sprite(x, y, rows, map) {
    rows.forEach((r, j) => [...r].forEach((ch, i) => { if (ch !== '.' && ch !== ' ') this.set(x + i, y + j, map[ch]); }));
  }
}
// Raster -> { code: pathData } with runs merged down the rows. Each pixel is sx wide, sy tall.
function rasterPaths(r, ox = 0, oy = 0, sx = 1, sy = 2) {
  const open = new Map(); // key x,w,c -> rect
  const rects = [];
  for (let y = 0; y < r.h; y++) {
    const seen = new Set();
    let x = 0;
    while (x < r.w) {
      const c = r.p[y * r.w + x];
      if (c === 255) { x++; continue; }
      let e = x;
      while (e < r.w && r.p[y * r.w + e] === c) e++;
      const key = `${x},${e - x},${c}`;
      const o = open.get(key);
      if (o && o.y + o.h === y) { o.h++; seen.add(key); }
      else { const nr = { x, y, w: e - x, h: 1, c }; rects.push(nr); open.set(key, nr); seen.add(key); }
      x = e;
    }
    for (const k of [...open.keys()]) if (!seen.has(k)) open.delete(k);
  }
  const byC = new Map();
  for (const q of rects) {
    const d = `M${ox + q.x * sx} ${oy + q.y * sy}h${q.w * sx}v${q.h * sy}h${-q.w * sx}z`;
    byC.set(q.c, (byC.get(q.c) || '') + d);
  }
  return byC;
}
const fillOf = (c) => (c < 8 ? DIGI[c] : `url(#d${c})`);
function pathsSvg(byC, attrs = '') {
  return [...byC.entries()].map(([c, d]) => `<path fill="${fillOf(c)}"${attrs} d="${d}"/>`).join('');
}
function ditherDefs(sx = 1, sy = 2) {
  return Object.entries(DITHER).map(([k, [a, b]]) =>
    `<pattern id="d${k}" width="${2 * sx}" height="${2 * sy}" patternUnits="userSpaceOnUse">` +
    `<rect width="${2 * sx}" height="${2 * sy}" fill="${DIGI[a]}"/>` +
    `<rect x="${sx}" width="${sx}" height="${sy}" fill="${DIGI[b]}"/><rect y="${sy}" width="${sx}" height="${sy}" fill="${DIGI[b]}"/></pattern>`).join('');
}

// =============================================================================================
// MAIN SCREEN
// =============================================================================================
function buildMain() {
  const T = 36, BEAT = 0.75, REST = 0;
  const A = makeAnim(T, REST);
  const COLS = 80, ROWS = 25, CW = 8, CH = 16;
  const SW = COLS * CW, SH = ROWS * CH; // 640 x 400
  const BZ = 22, CHIN = 34; // bezel
  const VBW = SW + BZ * 2, VBH = SH + BZ + CHIN;
  const OX = BZ, OY = BZ;

  // ---- timeline -------------------------------------------------------------------------
  const OFF = 21.0; // power cycled
  const COUNT0 = 21.6, COUNT_STEP = 0.1, COUNT_N = 12; // 1000 .. 12000 bars
  const CLEAR = 23.3; // BASIC starts: the question
  const ANS = [24.0, 24.25], ENTER1 = 24.75;
  const BAN = [24.85, 24.95, 25.05, 25.15]; // banner rows 1-4
  const TYPE0 = 25.7, TYPE_STEP = 0.12;
  const CMD = 'run "castaway"';
  const ENTER2 = TYPE0 + CMD.length * TYPE_STEP + 0.3; // 27.68
  const G0 = ENTER2 + 0.15; // the program starts drawing
  const SKY = G0, SKY_STEP = 0.1; // sky bands
  const SEA = SKY + 14 * SKY_STEP; // sea bands
  const SUN = SEA + 9 * SKY_STEP + 0.1;
  const CLOUD = SUN + 0.35;
  const TITLE = CLOUD + 0.5, TITLE_STEP = 0.125;
  const TAG = TITLE + 8 * TITLE_STEP + 0.15;
  const ISLE = TAG + 0.3;
  const PALM = ISLE + 0.45, PALM_STEP = 0.1;
  const CROWN = PALM + 7 * PALM_STEP;
  const RAFT = CROWN + 0.35;
  const HER = RAFT + 0.3;
  const PROMPT = HER + 0.35;
  // phase-1 beats
  const THROW = 3.0, SPLASH = 4.5, BACK = 9.0, BOTTLE_END = 10.5;
  const SHARK = 12.0, SHARK_END = 18.0, WAVE = 18.0;
  const NKEY = 19.8; // somebody answers the program's question
  if (PROMPT > 35.5) throw new Error(`boot too long: ${PROMPT}`);
  const shown = (t) => [[0, OFF], [t, T]]; // drawn at t during the boot, kept until power-off

  // ---- text plane -----------------------------------------------------------------------
  const usedGlyphs = new Set();
  const gid = (ch) => { usedGlyphs.add(ch); return `g${ch.codePointAt(0).toString(16)}`; };
  const textRun = (s, col, row) => [...s].map((ch, i) => (ch === ' ' ? '' : `<use href="#${gid(ch)}" x="${(col + i) * CW}" y="${row * CH}"/>`)).join('');
  const text = [];
  const tline = (s, col, row, cls, fill) => text.push(`<g${cls ? ` class="${cls}"` : ''}${fill ? ` fill="${fill}"` : ''}>${textRun(s, col, row)}</g>`);

  // Banner (the power-on text). Row 0 is BASIC's question, answered.
  const Q = 'How many hours(0-15)? ';
  tline(Q, 0, 0, A.vis([[0, OFF], [CLEAR, T]]));
  tline('1', Q.length, 0, A.vis(shown(ANS[0])));
  tline('0', Q.length + 1, 0, A.vis(shown(ANS[1])));
  const BANNER = [
    'CASTAWAY Island BASIC  (working title)',
    '(C) 2026  Every sound synthesized from code',
    '36000 Seconds free',
    'Ok',
  ];
  BANNER.forEach((s, i) => tline(s, 0, i + 1, A.vis(shown(BAN[i]))));
  [...CMD].forEach((ch, i) => tline(ch, i, 5, A.vis(shown(TYPE0 + i * TYPE_STEP))));
  // Printed by the program once the picture is up.
  const TAGLINE = 'She idles. Every so often, something happens.';
  tline(TAGLINE, 3, 11, A.vis(shown(TAG)));
  const PROMPT_S = 'Wait another bar (Y/N)? ';
  tline(PROMPT_S, 0, 22, A.vis(shown(PROMPT)));
  // ... and at the end of the bar somebody finally answers it. N. So it starts again.
  tline('N', PROMPT_S.length, 22, A.vis([[NKEY, OFF]]));

  // The self-test count: 1000 .. 12000 BARS, then OK.
  for (let i = 0; i < COUNT_N; i++) {
    const v = String((i + 1) * 1000).padStart(5, ' ');
    const t0 = COUNT0 + i * COUNT_STEP, t1 = i === COUNT_N - 1 ? CLEAR : t0 + COUNT_STEP;
    tline(v, 0, 0, A.vis([[t0, t1]]));
  }
  tline('BARS', 6, 0, A.vis([[COUNT0, CLEAR]]));
  tline('OK', 11, 0, A.vis([[COUNT0 + COUNT_N * COUNT_STEP + 0.15, CLEAR]]));

  // Cursor: a solid block, blinking, moved in steps.
  const cur = [
    [0, 24, 22], // final state: after the program's question
    [NKEY, 25, 22],
    [NKEY + 0.6, -99, 0],
    [OFF, -99, 0],
    [COUNT0, 0, 1], // under the count
    [CLEAR, Q.length, 0],
    [ANS[0], Q.length + 1, 0],
    [ANS[1], Q.length + 2, 0],
    [ENTER1, -99, 0],
    [BAN[3] + 0.05, 0, 5],
    ...[...CMD].map((_, i) => [TYPE0 + i * TYPE_STEP, i + 1, 5]),
    [ENTER2, -99, 0],
    [PROMPT, 24, 22],
  ].map(([t, c, r]) => [t, c * CW, r * CH]);
  const curMove = A.move(cur);
  const curBlink = A.cycle(0.75, [[0, 0.375]]);
  const cursor = `<g class="${curMove}"><g class="${curBlink}"><rect width="${CW}" height="${CH}" fill="#fff"/></g></g>`;

  // Function-key bar: ten reverse-video boxes; the one for what she is doing lights yellow.
  const KEYS = ['idle', 'nod', 'sip', 'bottle', 'wave↵', 'shark', 'turtle', 'drone', 'crab', 'wait↵'];
  const KW = 6, KGAP = 1, GGAP = 4;
  const KPAD = 2; // each box reaches 2 px past its 6 cells, so a 6-letter label clears both edges
  const kx = (i) => 4 + i * (KW + KGAP) + (i >= 5 ? GGAP - KGAP : 0);
  const barOn = A.vis([[0, OFF], [BAN[0], T]]);
  const lit = {
    0: [[0, THROW], [BOTTLE_END, SHARK], [HER, T]],
    3: [[THROW, BOTTLE_END]],
    5: [[SHARK, SHARK_END]],
    4: [[WAVE, OFF]],
  };
  let bar = `<g class="${barOn}">`;
  KEYS.forEach((k, i) => {
    const x = kx(i) * CW - KPAD, y = 24 * CH, w = KW * CW + 2 * KPAD;
    bar += `<rect x="${x}" y="${y}" width="${w}" height="${CH}" fill="#fff"/>`;
    if (lit[i]) bar += `<rect class="${A.vis(lit[i])}" x="${x}" y="${y}" width="${w}" height="${CH}" fill="${DIGI[YEL]}"/>`;
    bar += `<g fill="#000">${textRun(k, kx(i), 24)}</g>`;
  });
  bar += '</g>';

  // ---- graphics plane -------------------------------------------------------------------
  const rnd = mulberry32(1992);
  const HORIZON = 116;
  const layers = [];
  const addLayer = (r, cls, sx = 1) => layers.push(`<g${cls ? ` class="${cls}"` : ''}>${pathsSvg(rasterPaths(r, 0, 0, sx, 2))}</g>`);
  // Shade a blob: sunlit rim on top, shadow underneath (pixels of `code` only).
  const rimShade = (r, code, top, bottom) => {
    const q = new Uint8Array(r.p);
    for (let y = 0; y < r.h; y++) for (let x = 0; x < r.w; x++) {
      if (q[y * r.w + x] !== code) continue;
      if (y > 0 && q[(y - 1) * r.w + x] === 255 && top != null) r.p[y * r.w + x] = top;
      else if (y < r.h - 1 && q[(y + 1) * r.w + x] === 255 && bottom != null) r.p[y * r.w + x] = bottom;
    }
  };

  // Sky, painted top-down in bands (the PAINT command filling a region line by line).
  const skyCode = (y) => (y < 98 ? BLU : y < 105 ? 8 : CYN);
  for (let b = 0; b < 14; b++) {
    const r = new Raster();
    const y0 = Math.round((b * HORIZON) / 14), y1 = Math.round(((b + 1) * HORIZON) / 14) - 1;
    for (let y = y0; y <= y1; y++) r.hline(0, GW - 1, y, skyCode(y));
    addLayer(r, A.vis(shown(SKY + b * SKY_STEP)));
  }
  // Sea, painted from the horizon down: a bright line at the horizon, then deep blue.
  const seaCode = (y) => (y === HORIZON ? CYN : y === HORIZON + 1 ? 8 : BLU);
  for (let b = 0; b < 9; b++) {
    const r = new Raster();
    const y0 = HORIZON + Math.round((b * (GH - HORIZON)) / 9), y1 = HORIZON + Math.round(((b + 1) * (GH - HORIZON)) / 9) - 1;
    for (let y = y0; y <= y1; y++) r.hline(0, GW - 1, y, seaCode(y));
    addLayer(r, A.vis(shown(SEA + b * SKY_STEP)));
  }
  // Sun: an outline, then painted, then its rays.
  {
    const sx = 588, sy = 25, sr = 22;
    const ring = new Raster();
    for (let a = 0; a < 360; a += 2) ring.set(sx + sr * Math.cos((a * Math.PI) / 180), sy + (sr / 2) * Math.sin((a * Math.PI) / 180), YEL);
    addLayer(ring, A.vis(shown(SUN)));
    const disc = new Raster();
    disc.ellipse(sx, sy, sr, sr / 2, YEL);
    disc.ellipse(sx - 7, sy - 4, 7, 2.5, 11);
    for (let k = 0; k < 12; k++) {
      const a = (k / 12) * Math.PI * 2 + 0.13;
      disc.line(sx + Math.cos(a) * (sr + 6), sy + Math.sin(a) * (sr / 2 + 3), sx + Math.cos(a) * (sr + 13), sy + Math.sin(a) * (sr / 2 + 6.5), YEL);
    }
    addLayer(disc, A.vis(shown(SUN + 0.15)));
  }
  // Clouds: a low bank along the horizon, round puffs with a foam-tinted belly.
  {
    const puffs = [
      // (the tallest puff stays below text row 11, so it never underlines the tagline)
      [[8, 110, 22], [40, 109, 24], [76, 108, 22], [104, 111, 16], [128, 113, 12]],
      [[236, 112, 12], [258, 109, 15], [282, 112, 11]],
      [[372, 113, 10], [390, 111, 12]],
      [[560, 111, 16], [592, 106, 24], [626, 108, 22], [648, 104, 20]],
    ];
    puffs.forEach((g, gi) => {
      const r = new Raster();
      for (const [x, y, rr] of g) r.ellipse(x, y, rr, rr / 2, WHT, (px, py) => py < HORIZON);
      for (const [x, y, rr] of g) r.ellipse(x, y + rr / 3, rr * 0.75, rr / 5, 13, (px, py) => py < HORIZON && r.get(px, py) === WHT);
      addLayer(r, A.vis(shown(CLOUD + gi * 0.1)));
    });
  }
  // Title: the font blown up, the way BASIC programs read the character ROM and drew each dot
  // as a box. Made bold by OR-ing each glyph with itself shifted one dot right.
  const TITLE_S = 'CASTAWAY';
  const DW = 6, DH = 3, TX = 22, TY = 52;
  TITLE_S.split('').forEach((ch, i) => {
    const g = THIN.get(ch);
    const shadow = new Raster(), face = new Raster();
    let minx = 7, maxx = 0;
    for (let row = 3; row <= 13; row++) for (let c = 0; c < 8; c++) if (g[row] & (1 << (7 - c))) { minx = Math.min(minx, c); maxx = Math.max(maxx, c); }
    const shift = Math.round((7 - (maxx - minx + 2)) / 2) - minx + 1; // bold adds one column
    for (let row = 3; row <= 13; row++) {
      const v = g[row] | (g[row] >> 1);
      for (let c = 0; c < 8; c++) {
        if (!(v & (1 << (7 - c)))) continue;
        const x = TX + i * 8 * DW + (c + shift) * DW, y = TY + (row - 3) * DH;
        shadow.box(x + 3, y + 2, x + 3 + DW - 1, y + 2 + DH - 1, RED);
        face.box(x, y, x + DW - 1, y + DH - 1, row === 3 ? WHT : row < 9 ? YEL : 11);
      }
    }
    layers.push(`<g class="${A.vis(shown(TITLE + i * TITLE_STEP))}">${pathsSvg(rasterPaths(shadow))}${pathsSvg(rasterPaths(face))}</g>`);
  });

  // The island: foam, shallows, wet sand, dry sand, bushes, two rocks.
  const IX = 486, IY = 157;
  {
    const r = new Raster();
    r.ellipse(IX, IY + 2, 118, 17, 13);
    r.ellipse(IX, IY + 2, 111, 15, CYN);
    r.ellipse(IX, IY + 0.5, 94, 11.5, 10);
    r.ellipse(IX - 2, IY - 1, 91, 10, YEL);
    r.ellipse(IX - 34, IY - 3, 34, 3.5, 11);
    r.ellipse(IX + 40, IY - 5, 22, 2, 11);
    addLayer(r, A.vis(shown(ISLE)));
    const b = new Raster();
    const bush = (bx, by, w, n) => {
      for (let k = 0; k < n; k++) {
        const x = bx + (k - (n - 1) / 2) * w * 0.32 + (k % 2 ? 2 : -1);
        b.ellipse(x, by - (k % 2) * 2 - (k === Math.floor(n / 2) ? 2 : 0), w * 0.26, 3.3, GRN);
      }
    };
    bush(468, 152, 30, 6);
    bush(536, 153, 18, 4);
    bush(438, 158, 14, 3);
    rimShade(b, GRN, 15, 12);
    // leaf ticks
    for (let k = 0; k < 40; k++) {
      const x = 420 + rnd() * 140, y = 146 + rnd() * 12;
      if (b.get(Math.round(x), Math.round(y)) === GRN) b.set(x, y, (k % 3) ? 12 : 15);
    }
    addLayer(b, A.vis(shown(ISLE + 0.15)));
    const k2 = new Raster();
    k2.ellipse(408, 165, 8, 2.5, 16); k2.ellipse(406, 164, 4, 1, WHT);
    k2.ellipse(566, 165, 6, 2, 16); k2.ellipse(565, 164, 3, 1, WHT);
    addLayer(k2, A.vis(shown(ISLE + 0.15)));
  }
  // Wave dashes and foam: three sets, taking turns on the beat.
  const waveSets = [new Raster(), new Raster(), new Raster()];
  for (let k = 0; k < 150; k++) {
    const x = Math.floor(rnd() * GW), y = HORIZON + 3 + Math.floor(rnd() * (GH - HORIZON - 12));
    if (Math.hypot((x - IX) / 126, (y - IY - 2) / 20) < 1.05) continue;
    if (y > 172 && y < 188 && x < 210) continue; // keep the prompt line clear
    const len = 2 + Math.floor(rnd() * (4 + (y - HORIZON) / 7));
    waveSets[k % 3].hline(x, x + len, y, rnd() < 0.35 ? WHT : CYN);
  }
  for (let k = 0; k < 45; k++) {
    const a = rnd() * Math.PI * 2;
    const x = IX + Math.cos(a) * 113, y = IY + 2 + Math.sin(a) * 16;
    if (y < IY - 5) continue;
    waveSets[k % 3].hline(x - 2, x + 2, y, WHT);
  }
  const waves = waveSets.map((r, i) => `<g class="${A.cycle(2.25, [[i * BEAT, (i + 1) * BEAT]])}">${pathsSvg(rasterPaths(r))}</g>`).join('');
  layers.push(`<g class="${A.vis(shown(SEA + 9 * SKY_STEP))}">${waves}</g>`);

  // Palm: a slender, slightly curved trunk drawn up in segments, then the crown.
  const PB = [518, 151], PT = [532, 80];
  {
    const pts = [];
    for (let k = 0; k <= (PB[1] - PT[1]); k++) {
      const t = k / (PB[1] - PT[1]);
      const x = PB[0] + (PT[0] - PB[0]) * t + Math.sin(t * Math.PI) * 10 - t * t * 3;
      pts.push([x, PB[1] - k, 4.4 - 2.0 * t, k]);
    }
    for (let s = 0; s < 7; s++) {
      const r = new Raster();
      for (const [x, y, w, k] of pts) {
        if (Math.min(6, Math.floor((k / pts.length) * 7)) !== s) continue;
        const ring = k % 5 === 0;
        r.hline(x - w, x + w, y, ring ? RED : 10);
        r.set(x - w, y, ring ? 10 : YEL);
        r.set(x + w, y, ring ? 9 : RED);
      }
      layers.push(`<g class="${A.vis(shown(PALM + s * PALM_STEP))}">${pathsSvg(rasterPaths(r))}</g>`);
    }
  }
  {
    const r = new Raster();
    const cx = PT[0], cy = PT[1] * 2 - 2; // crown centre, in screen pixels
    const frond = (dx, L, rise, droop, shade) => {
      const sgn = Math.sign(dx) || 1;
      const N = Math.round(L * 1.4);
      for (let k = 0; k <= N; k++) {
        const t = k / N;
        const x = cx + dx * L * t;
        const y = cy - rise * 4 * t * (1 - t) + droop * t * t;
        const ll = (3 + 17 * Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.1)), 0.7)) * (1 - 0.3 * t);
        if (t > 0.06 && k % 2 === 0 && k % 10 !== 4) {
          const ex = x + sgn * ll * 0.42, ey = y + ll;
          r.line(x, y / 2, ex, ey / 2, shade ? 12 : GRN);
          r.line(x + 1, y / 2, ex + 1, ey / 2, shade ? 12 : GRN);
          r.set(ex, ey / 2, 12);
          if (t < 0.9) r.line(x, y / 2, x + sgn * ll * 0.55, (y - ll * 0.45) / 2, shade ? GRN : 15);
        }
      }
      for (let k = 0; k <= N; k++) {
        const t = k / N;
        const x = cx + dx * L * t, y = cy - rise * 4 * t * (1 - t) + droop * t * t;
        r.set(x, y / 2, shade ? GRN : 15);
      }
    };
    // back fronds first, in shade; then the sunlit ones in front
    frond(-0.75, 60, 6, 44, true);
    frond(0.7, 62, 6, 46, true);
    frond(-0.15, 26, 26, 6, true);
    frond(-1.0, 80, 14, 52, false);
    frond(-0.8, 58, 26, 26, false);
    frond(-0.32, 34, 30, 10, false);
    frond(0.35, 36, 30, 12, false);
    frond(0.85, 62, 26, 28, false);
    frond(1.0, 84, 14, 56, false);
    // coconuts
    r.ellipse(cx - 3, PT[1] + 2, 2.5, 1.3, 9);
    r.ellipse(cx + 3, PT[1] + 3, 2.5, 1.3, 9);
    r.ellipse(cx, PT[1] + 4, 2.5, 1.3, 10);
    layers.push(`<g class="${A.vis(shown(CROWN))}">${pathsSvg(rasterPaths(r))}</g>`);
  }
  // Raft, moored at the right.
  {
    const r = new Raster();
    for (let k = 0; k < 5; k++) {
      const y = 157 + k * 2;
      r.hline(592 - k * 3, 636 - k * 3, y, k % 2 ? RED : 10);
      r.hline(592 - k * 3, 636 - k * 3, y + 1, 9);
    }
    r.box(600, 156, 601, 166, YEL);
    r.box(626, 156, 627, 166, YEL);
    r.hline(578, 640, 167, 13);
    addLayer(r, A.vis(shown(RAFT)));
  }

  // ---- her: sprites drawn with double-width pixels, so she stays in proportion ----------
  const HERMAP = { P: WHT, H: 9, S: 19, R: RED, C: 11, k: K, G: GRN, h: 10 };
  const HEAD = [
    '....PPPP....',
    '...PHHHHP...',
    '..PHHHHHHP..',
    '..PHSSSSHP..',
    '..PHkSSkHPH.',
    '...HSSSSHHH.',
    '....SSSS..H.',
  ];
  const BODY = [
    '.....SS.....',
    '...RRRRRR...',
    '..RRRRRRRR..',
    '..SRRRRRRS..',
    '..SRRRRRRS..',
    '..S.RRRR.S..',
    '..S.RRRR.S..',
    '...CCCCCC...',
    '...CCCCCC...',
    '...CC..CC...',
    '...SS..SS...',
    '...SS..SS...',
    '...SS..SS...',
    '..SSS..SSS..',
  ];
  const HX = 410, HY = 136; // top-left (graphics pixels); 12 x 21 sprite, feet on the sand at 156
  const herFrame = (head, body, dy = 0, extra) => {
    const r = new Raster(16, 26);
    r.sprite(2, 1 + 3 + 7, body, HERMAP);
    r.sprite(2, 1 + 3 + dy, head, HERMAP);
    if (extra) extra(r);
    r.outline();
    return pathsSvg(rasterPaths(r, HX - 4, (HY - 4) * 2, 2, 2));
  };
  const armless = BODY.map((s, j) => (j >= 3 && j <= 6 ? s.replace(/^\.\.S/, '...').replace(/S\.\.$/, '...') : s));
  // raised arms, in raster cells (the sprite sits at column 2, row 1; shoulders on row 13)
  const ARM_UP = [[3, 13], [3, 12], [3, 11], [2, 10], [2, 9], [2, 8], [2, 7], [2, 6]];
  const ARM_WIDE = [[3, 13], [3, 12], [2, 11], [2, 10], [1, 9], [1, 8], [1, 7]];
  const arm = (r, side, spread) => {
    for (const [x, y] of spread ? ARM_WIDE : ARM_UP) r.set(side < 0 ? x : 15 - x, y, HERMAP.S);
  };
  const herIdle = [[0, THROW], [THROW + BEAT, BACK], [BOTTLE_END, WAVE], [HER, T]];
  const nodA = A.cycle(1.5, [[0, BEAT]]), nodB = A.cycle(1.5, [[BEAT, 1.5]]);
  let her = `<g class="${A.vis(herIdle)}"><g class="${nodA}">${herFrame(HEAD, BODY, 0)}</g><g class="${nodB}">${herFrame(HEAD, BODY, 1)}</g></g>`;
  // throw: one arm up with the bottle in her hand
  her += `<g class="${A.vis([[THROW, THROW + BEAT]])}">${herFrame(HEAD, armless.map((s, j) => (j >= 3 && j <= 6 ? s.slice(0, 9) + 'S' + s.slice(10) : s)), 0, (r) => { arm(r, -1, false); r.box(2, 3, 3, 5, GRN); r.set(2, 2, WHT); })}</g>`;
  // the bottle is back at her feet: she looks down at it
  her += `<g class="${A.vis([[BACK, BOTTLE_END]])}">${herFrame(HEAD, BODY, 1)}</g>`;
  // waving for rescue: both arms up, swapping wide and narrow on the beat
  her += `<g class="${A.vis([[WAVE, OFF]])}"><g class="${nodA}">${herFrame(HEAD, armless, 0, (r) => { arm(r, -1, true); arm(r, 1, true); })}</g><g class="${nodB}">${herFrame(HEAD, armless, 0, (r) => { arm(r, -1, false); arm(r, 1, false); })}</g></g>`;

  // ---- the bottle: thrown in an arc, a splash, bobbing, then straight back -------------
  const bottleR = new Raster(7, 4);
  bottleR.sprite(1, 1, ['GGGG.', 'GGGGW'], { G: GRN, W: WHT });
  bottleR.set(1, 1, 15);
  bottleR.outline();
  const bottleSvg = pathsSvg(rasterPaths(bottleR, -2, -2, 2, 2));
  const from = [HX + 2, HY + 1], to = [292, 138];
  const bpath = [[0, from[0], from[1] * 2]];
  for (let k = 0; k <= 6; k++) {
    const t = k / 6;
    bpath.push([THROW + BEAT + k * 0.125, from[0] + (to[0] - from[0]) * t, (from[1] + (to[1] - from[1]) * t - 24 * Math.sin(t * Math.PI)) * 2]);
  }
  for (let k = 1; k < 4; k++) bpath.push([SPLASH + k * 0.375, to[0] + (k % 2), (to[1] + (k % 2)) * 2]);
  const home = [HX - 12, 160];
  for (let k = 1; k <= 8; k++) {
    const t = k / 8;
    bpath.push([6.0 + (k - 1) * 0.375, to[0] + (home[0] - to[0]) * t, (to[1] + (home[1] - to[1]) * t - (k % 2)) * 2]);
  }
  bpath.push([BACK, home[0], home[1] * 2]);
  const bottle = `<g class="${A.vis([[THROW + BEAT, OFF]])}"><g class="${A.move(bpath)}">${bottleSvg}</g></g>`;
  // splash: two frames of spray where it lands
  const splashR = [new Raster(16, 8), new Raster(16, 8)];
  [[2, 5], [5, 3], [8, 2], [11, 3], [14, 5], [7, 6], [9, 6], [4, 6], [12, 6]].forEach(([x, y]) => splashR[0].set(x, y, WHT));
  [[0, 6], [3, 4], [8, 1], [13, 4], [15, 6], [6, 3], [10, 3], [1, 7], [14, 7]].forEach(([x, y]) => splashR[1].set(x, y, x % 2 ? WHT : CYN));
  const splash = splashR.map((r, i) => `<g class="${A.vis([[SPLASH + i * 0.25, SPLASH + (i + 1) * 0.25]])}">${pathsSvg(rasterPaths(r, to[0] - 14, (to[1] - 6) * 2, 2, 2))}</g>`).join('');

  // ---- the shark in headphones, nodding along ------------------------------------------
  // A grey fin with a white headband over its tip and a solid yellow cup on each side, so the
  // headphones read at README size; the band and cups tip one dot on the off-beat.
  const FIN = [
    '.......PPPPPP.........',
    '......P......P........',
    '.....P...LD...P.......',
    '....YYY.LGD..YYY......',
    '....YYYLGGD..YYY......',
    '....YYYLGGGD.YYY......',
    '......LGGGGD..........',
    '.....LGGGGGGD.........',
    '....LGGGGGGGGD........',
    '...LGGGGGGGGGGD.......',
    '..LGGGGGGGGGGGGDD.....',
    '.LGGGGGGGGGGGGGGGDD...',
  ];
  const finFrames = [FIN, FIN.map((row, j) => (j < 6 ? '.' + row.slice(0, -1) : row))];
  const SHX = 128, SHY = 129;
  const finSvg = finFrames.map((rows) => {
    const r = new Raster(24, 15);
    r.sprite(1, 1, rows, { P: WHT, G: 16, Y: YEL, L: WHT, D: 20 });
    r.outline();
    r.hline(0, 22, 13, 13);
    r.hline(3, 19, 14, CYN);
    return pathsSvg(rasterPaths(r, SHX, SHY * 2, 2, 2));
  });
  const shark = `<g class="${A.vis([[SHARK, SHARK_END]])}"><g class="${nodA}">${finSvg[0]}</g><g class="${nodB}">${finSvg[1]}</g></g>`;

  // ---- assemble -------------------------------------------------------------------------
  const glyphDefs = [...usedGlyphs].map((ch) => `<path id="g${ch.codePointAt(0).toString(16)}" d="${bitsToPath(THIN.get(ch).map((v) => v), 8)}"/>`).join('');
  const css = [
    'svg{shape-rendering:crispEdges}',
    ...A.css,
    '@media (prefers-reduced-motion:reduce){*{animation:none!important}}',
  ].join('\n');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VBW} ${VBH}" width="${VBW}" height="${VBH}" role="img" aria-labelledby="ttl">
<title id="ttl">CASTAWAY: a Japanese home computer powers on into Island BASIC and runs the island</title>
<style>
${css}
</style>
<defs>${ditherDefs()}<pattern id="scan" width="8" height="2" patternUnits="userSpaceOnUse"><rect y="1" width="8" height="1" fill="#000"/></pattern>${glyphDefs}</defs>
<rect width="${VBW}" height="${VBH}" rx="16" fill="#d9d2c0"/>
<rect x="3" y="3" width="${VBW - 6}" height="${VBH - 6}" rx="13" fill="none" stroke="#efe9da" stroke-width="2"/>
<rect x="${OX - 6}" y="${OY - 6}" width="${SW + 12}" height="${SH + 12}" rx="6" fill="#2a2824"/>
<g transform="translate(${OX} ${OY})">
<rect width="${SW}" height="${SH}" fill="#000"/>
<g>${layers.join('')}${her}${bottle}${splash}${shark}</g>
<rect width="${SW}" height="${SH}" fill="url(#scan)"/>
<g fill="#fff">${text.join('')}</g>
${bar}
${cursor}
</g>
<circle cx="${VBW - 40}" cy="${VBH - CHIN / 2 + 1}" r="3" fill="#3fbf4f"/>
<rect x="${VBW - 58}" y="${VBH - CHIN / 2 - 1}" width="10" height="3" rx="1" fill="#b8b09c"/>
</svg>
`;
  return svg;
}

// =============================================================================================
// THE 40-COLUMN BLUE SCREEN: a centred sign-on, then BASIC in white on blue, and the run
// instructions typed in as if they were BASIC. 256 x 192 pixels, 40 x 24 cells of 6 x 8.
// =============================================================================================
function buildMsx() {
  const T = 24, REST = 20;
  const A = makeAnim(T, REST);
  const CW = 6, CH = 8, COLS = 40, ROWS = 24, LM = 8;
  const SW = 256, SH = 192, BZ = 14, CHIN = 22;
  const VBW = SW + BZ * 2, VBH = SH + BZ + CHIN;
  const BLUE = '#2020ff';
  const used = new Set();
  const gid = (ch) => { used.add(ch); return `h${ch.codePointAt(0).toString(16)}`; };
  const run = (s, col, row) => [...s].map((ch, i) => (ch === ' ' ? '' : `<use href="#${gid(ch)}" x="${LM + (col + i) * CW}" y="${row * CH}"/>`)).join('');
  const out = [];
  const line = (s, col, row, iv) => out.push(`<g class="${A.vis(iv)}">${run(s, col, row)}</g>`);
  const centre = (s, row, iv) => line(s, Math.floor((COLS - s.length) / 2), row, iv);

  // sign-on, about three seconds, centred
  const SIGN = [[0, 3.0]];
  centre('CASTAWAY  island system', 8, SIGN);
  centre('version 10:00:00, seed 1992', 10, SIGN);
  centre('no samples, no recordings, only code', 13, SIGN);

  // BASIC
  const B0 = 3.2;
  const after = (t) => [[t, T]];
  const BAN = ['CASTAWAY BASIC version 10:00:00', 'Synthesized 2026, sampled never', '36000 seconds free', 'Ok'];
  BAN.forEach((s, i) => line(s, 0, i, after(B0 + i * 0.1)));
  const KEYS = ['nod', 'idle', 'wait', 'list', 'run'];
  KEYS.forEach((k, i) => line(k, i * 8, 23, after(B0)));
  const STEP = 0.11;
  const typed = [
    ['python tools/serve.py', 4, 4.0, 'Ok'],
    ['open http://127.0.0.1:8765/', 6, 7.6, 'Ok'],
    ['wait 36000', 8, 11.8, 'Ok'],
  ];
  const cur = [[0, -99, 0], [B0 + 0.4, 0, 4]];
  for (const [cmd, row, t0, reply] of typed) {
    [...cmd].forEach((ch, i) => { line(ch, i, row, after(t0 + i * STEP)); cur.push([t0 + i * STEP, i + 1, row]); });
    const tEnter = t0 + cmd.length * STEP + 0.35;
    const tReply = cmd.startsWith('wait') ? tEnter + 3.0 : tEnter + 0.15;
    cur.push([tEnter, -99, 0]);
    line(reply, 0, row + 1, after(tReply));
    cur.push([tReply + 0.05, 0, row + 2]);
  }
  const curMove = A.move(cur.map(([t, c, r]) => [t, LM + c * CW, r * CH]));
  const curBlink = A.cycle(0.75, [[0, 0.375]]);
  const cursor = `<g class="${curMove}"><g class="${curBlink}"><rect width="${CW}" height="${CH}" fill="#fff"/></g></g>`;

  const defs = [...used].map((ch) => `<path id="h${ch.codePointAt(0).toString(16)}" d="${bitsToPath(CHUNKY.get(ch), 6)}"/>`).join('');
  const css = ['svg{shape-rendering:crispEdges}', ...A.css, '@media (prefers-reduced-motion:reduce){*{animation:none!important}}'].join('\n');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VBW} ${VBH}" width="${VBW * 2}" height="${VBH * 2}" role="img" aria-labelledby="ttl">
<title id="ttl">CASTAWAY on a 40-column blue BASIC screen: python tools/serve.py, then open http://127.0.0.1:8765/</title>
<style>
${css}
</style>
<defs>${defs}</defs>
<rect width="${VBW}" height="${VBH}" rx="10" fill="#2b2b30"/>
<rect x="2" y="2" width="${VBW - 4}" height="${VBH - 4}" rx="8" fill="none" stroke="#45454c" stroke-width="1"/>
<rect x="${BZ - 3}" y="${BZ - 3}" width="${SW + 6}" height="${SH + 6}" rx="4" fill="#111"/>
<g transform="translate(${BZ} ${BZ})">
<rect width="${SW}" height="${SH}" fill="${BLUE}"/>
<g fill="#fff">${out.join('')}</g>
${cursor}
</g>
<circle cx="${VBW - 22}" cy="${VBH - CHIN / 2 + 1}" r="2" fill="#e04040"/>
<rect x="${VBW - 40}" y="${VBH - CHIN / 2}" width="10" height="2" rx="1" fill="#55555c"/>
</svg>
`;
}

fs.mkdirSync(ASSETS, { recursive: true });
const main = buildMain();
fs.writeFileSync(path.join(ASSETS, `${SLUG}.svg`), main);
console.log(`${SLUG}.svg: ${(main.length / 1024).toFixed(1)} KB`);
const msx = buildMsx();
fs.writeFileSync(path.join(ASSETS, `${SLUG}-msx.svg`), msx);
console.log(`${SLUG}-msx.svg: ${(msx.length / 1024).toFixed(1)} KB`);
