#!/usr/bin/env node
// 54-text-mode-demo-effect_opus_5.5: the "Text-Mode Demo Effect" README header for Castaway
// (catalogue entry ansi-11: real-time effects forced through the plain 80x50 text screen, the
// way the text-mode demo competitions of 1996-2017 did it).
//
// The banner is one VGA text screen, 80 columns by 50 rows of 9x8 character cells, 16 colours,
// and it keeps the rules of that screen on purpose, because the rules are the look:
//   * every cell is one character with one foreground and one background colour;
//   * in-between colours come only from the shade characters (light, medium and dark shade)
//     laid over a background, so every gradient is banded and dithered;
//   * effects are colour changes on a fixed grid: nothing is drawn between cells, edges
//     stair-step, and the 9th dot of each cell repeats the 8th, as the VGA did for these glyphs.
//
// What is on it:
//   rows  1-13  the plate: CASTAWAY in solid block letters (drawn here, half-cell pixels, a
//               shaded fill and a drop shadow), a double-line frame with captions in it, and
//               one line of tagline
//   sky         cloud streaks drifting left, a sun of rings that flow outward, horizon haze
//   sea         swells that roll in, and a lagoon whose rings spread out from the island
//   island      sand, foam, a tall palm, a raft, and her: cream headphones, coral top, cream
//               shorts, nodding on every beat (80 BPM). At 0:24 a message in a bottle goes out
//               and washes straight back, one cell per beat
//   row  49     the scroller, one character cell at a time
//   0:51-0:57   a hard cut to the demo's second part: a tunnel, for her super-rare walk off
//               over the water. Cut back, and she is home with an iced coffee. Same as the
//               video: hard cuts, stepped movement.
//
// How it moves without a script: each effect is a phase map worked out once here, one number
// per cell, quantised to 48 or 32 classes. Every class is one path, drawn four times (one copy
// per "atom" of the shade characters: the four sets of dots that light, medium and dark shade
// are built from, three of them masked by a static dot lattice). All the classes of an effect
// share one set of CSS keyframes, a ramp with one colour step per class, and differ only by a
// negative animation-delay (calc of the class number, --k): palette cycling, done in CSS.
// Static cells are plain paths and pattern fills. No <text>, no fonts, nothing external;
// everything is deterministic.
//
//   node 54-text-mode-demo-effect_opus_5.5.mjs            regenerate the SVG
//   node 54-text-mode-demo-effect_opus_5.5.mjs --scroll   print the scroller text and its timing
//
// Plain Node, no dependencies, no randomness.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SLUG = '54-text-mode-demo-effect_opus_5.5';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, '..', 'assets', `${SLUG}.svg`);

// ------------------------------------------------------------------------------ geometry
const COLS = 80, ROWS = 50, CW = 9, CH = 8;          // VGA 80x50: 720x400 dots, 9x8 cells
const SW = COLS * CW, SH = ROWS * CH;
const BZ = 12;                                        // bezel around the screen
const VBW = SW + BZ * 2, VBH = SH + BZ * 2;
const LOOP = 60;                                      // seconds: one pass of the theme
const BEAT = 0.75;                                    // 80 BPM
const BAR = 3;                                        // seconds per bar
const T_CUT = 51, T_BACK = 57;                        // the second part: bars 18 and 19

// --------------------------------------------------------------------------- the palette
// The 16 text colours of the VGA, in the usual order. All of them shorten to #rgb.
const VGA = ['#000', '#00a', '#0a0', '#0aa', '#a00', '#a0a', '#a50', '#aaa',
  '#555', '#55f', '#5f5', '#5ff', '#f55', '#f5f', '#ff5', '#fff'];
const [BLK, BLU, GRN, CYN, RED, MAG, BRN, LGR, DGR, LBL, LGN, LCY, LRD, LMG, YEL, WHT] =
  [...Array(16).keys()];

// ------------------------------------------------------------------- the shade characters
// Light, medium and dark shade (CP437 B0, B1, B2) as 8-dot rows that repeat every two rows,
// with the 9th dot copied from the 8th. Their dots fall into four sets ("atoms"):
//   A: lit only in dark shade        B: lit in medium and dark shade
//   C: lit only in light shade       D: lit in light and medium shade
// so any cell look (character, foreground, background) is four solid colours, one per atom.
// The atoms are 9x2 tiles; A is drawn everywhere, B, C and D through masks.
const ATOM_DOTS = {
  A: [[0, 4], [1, 3, 5, 7, 8]],
  B: [[1, 3, 5, 7, 8], [2, 6]],
  C: [[2, 6], []],
  D: [[], [0, 4]],
};
const SHADE_SETS = { '░': ['C', 'D'], '▒': ['B', 'D'], '▓': ['A', 'B'] };
function atomColour(look, atom) {
  const [ch, fg, bg] = look;
  if (ch === ' ') return bg;
  if (ch === '█') return fg;
  return SHADE_SETS[ch].includes(atom) ? fg : bg;
}
function shadeDots(ch) {                          // the lit dots of a shade glyph, per tile row
  const rows = [[], []];
  for (const a of SHADE_SETS[ch]) ATOM_DOTS[a].forEach((r, y) => rows[y].push(...r));
  return rows.map((r) => r.sort((p, q) => p - q));
}

// ------------------------------------------------------------------------ the 8x8 font
// An original face in the spirit of the PC's 8x8 text font: 2-dot stems, capitals 7 rows tall.
// Each glyph is 8 rows of 7 dots (dot 8 and the 9th column stay dark).
const FONT = new Map();
const G = (ch, rows) => FONT.set(ch, rows.split(' '));
G('A', '.#####. ##...## ##...## ####### ##...## ##...## ##...## .......');
G('B', '######. ##...## ##...## ######. ##...## ##...## ######. .......');
G('C', '.#####. ##...## ##..... ##..... ##..... ##...## .#####. .......');
G('D', '#####.. ##..##. ##...## ##...## ##...## ##..##. #####.. .......');
G('E', '####### ##..... ##..... #####.. ##..... ##..... ####### .......');
G('F', '####### ##..... ##..... #####.. ##..... ##..... ##..... .......');
G('G', '.#####. ##...## ##..... ##.#### ##...## ##...## .#####. .......');
G('H', '##...## ##...## ##...## ####### ##...## ##...## ##...## .......');
G('I', '.####.. ..##... ..##... ..##... ..##... ..##... .####.. .......');
G('J', '...#### .....## .....## .....## ##...## ##...## .#####. .......');
G('K', '##...## ##..##. ##.##.. ####... ##.##.. ##..##. ##...## .......');
G('L', '##..... ##..... ##..... ##..... ##..... ##..... ####### .......');
G('M', '##...## ###.### ####### ##.#.## ##...## ##...## ##...## .......');
G('N', '##...## ###..## ####.## ##.#### ##..### ##...## ##...## .......');
G('O', '.#####. ##...## ##...## ##...## ##...## ##...## .#####. .......');
G('P', '######. ##...## ##...## ######. ##..... ##..... ##..... .......');
G('Q', '.#####. ##...## ##...## ##...## ##.#.## ##..##. .###.## .......');
G('R', '######. ##...## ##...## ######. ##.##.. ##..##. ##...## .......');
G('S', '.#####. ##...## ##..... .#####. .....## ##...## .#####. .......');
G('T', '######. ..##... ..##... ..##... ..##... ..##... ..##... .......');
G('U', '##...## ##...## ##...## ##...## ##...## ##...## .#####. .......');
G('V', '##...## ##...## ##...## ##...## .##.##. ..###.. ...#... .......');
G('W', '##...## ##...## ##...## ##.#.## ####### ###.### ##...## .......');
G('X', '##...## ##...## .##.##. ..###.. .##.##. ##...## ##...## .......');
G('Y', '##..##. ##..##. ##..##. .####.. ..##... ..##... ..##... .......');
G('Z', '####### ....##. ...##.. ..##... .##.... ##..... ####### .......');
G('a', '....... ....... .#####. .....## .###### ##...## .###### .......');
G('b', '##..... ##..... ######. ##...## ##...## ##...## ######. .......');
G('c', '....... ....... .#####. ##..... ##..... ##..... .#####. .......');
G('d', '.....## .....## .###### ##...## ##...## ##...## .###### .......');
G('e', '....... ....... .#####. ##...## ####### ##..... .#####. .......');
G('f', '...###. ..##... ######. ..##... ..##... ..##... ..##... .......');
G('g', '....... ....... .###### ##...## ##...## .###### .....## ######.');
G('h', '##..... ##..... ######. ##...## ##...## ##...## ##...## .......');
G('i', '..##... ....... .###... ..##... ..##... ..##... .####.. .......');
G('j', '....##. ....... ...###. ....##. ....##. ....##. ##..##. .####..');
G('k', '##..... ##..... ##..##. ##.##.. ####... ##.##.. ##..##. .......');
G('l', '.###... ..##... ..##... ..##... ..##... ..##... .####.. .......');
G('m', '....... ....... ###.##. ####### ##.#.## ##.#.## ##...## .......');
G('n', '....... ....... ######. ##...## ##...## ##...## ##...## .......');
G('o', '....... ....... .#####. ##...## ##...## ##...## .#####. .......');
G('p', '....... ....... ######. ##...## ##...## ######. ##..... ##.....');
G('q', '....... ....... .###### ##...## ##...## .###### .....## .....##');
G('r', '....... ....... ##.###. ###..## ##..... ##..... ##..... .......');
G('s', '....... ....... .###### ##..... .#####. .....## ######. .......');
G('t', '..##... ..##... ######. ..##... ..##... ..##... ...###. .......');
G('u', '....... ....... ##...## ##...## ##...## ##...## .###### .......');
G('v', '....... ....... ##...## ##...## ##...## .##.##. ..###.. .......');
G('w', '....... ....... ##...## ##.#.## ##.#.## ####### .##.##. .......');
G('x', '....... ....... ##...## .##.##. ..###.. .##.##. ##...## .......');
G('y', '....... ....... ##...## ##...## ##...## .###### .....## ######.');
G('z', '....... ....... ####### ....##. ..###.. .##.... ####### .......');
G('0', '.#####. ##...## ##..### ##.#.## ###..## ##...## .#####. .......');
G('1', '..##... .###... ..##... ..##... ..##... ..##... .####.. .......');
G('2', '.#####. ##...## .....## ..####. .##.... ##..... ####### .......');
G('3', '.#####. ##...## .....## ..####. .....## ##...## .#####. .......');
G('4', '...###. ..####. .##.##. ##..##. ####### ....##. ....##. .......');
G('5', '####### ##..... ######. .....## .....## ##...## .#####. .......');
G('6', '..####. .##.... ##..... ######. ##...## ##...## .#####. .......');
G('7', '####### ##...## ....##. ...##.. ..##... ..##... ..##... .......');
G('8', '.#####. ##...## ##...## .#####. ##...## ##...## .#####. .......');
G('9', '.#####. ##...## ##...## .###### .....## ....##. .####.. .......');
G('.', '....... ....... ....... ....... ....... ..##... ..##... .......');
G(',', '....... ....... ....... ....... ....... ..##... ..##... .##....');
G(':', '....... ..##... ..##... ....... ....... ..##... ..##... .......');
G(';', '....... ..##... ..##... ....... ....... ..##... ..##... .##....');
G('/', '.....## ....##. ...##.. ..##... .##.... ##..... #...... .......');
G('-', '....... ....... ....... .#####. ....... ....... ....... .......');
G('_', '....... ....... ....... ....... ....... ....... ....... #######');
G('(', '...##.. ..##... .##.... .##.... .##.... ..##... ...##.. .......');
G(')', '.##.... ..##... ...##.. ...##.. ...##.. ..##... .##.... .......');
G('!', '..##... ..##... ..##... ..##... ..##... ....... ..##... .......');
G('?', '.#####. ##...## ....##. ...##.. ...##.. ....... ...##.. .......');
G("'", '..##... ..##... .##.... ....... ....... ....... ....... .......');
G('"', '.##.##. .##.##. .#..#.. ....... ....... ....... ....... .......');
G('+', '....... ..##... ..##... ######. ..##... ..##... ....... .......');
G('=', '....... ....... ######. ....... ######. ....... ....... .......');
G('*', '....... .#.#.#. ..###.. ####### ..###.. .#.#.#. ....... .......');
G('<', '....##. ...##.. ..##... .##.... ..##... ...##.. ....##. .......');
G('>', '.##.... ..##... ...##.. ....##. ...##.. ..##... .##.... .......');
G('·', '....... ....... ....... ...##.. ...##.. ....... ....... .......');
G('♪', '...###. ...#.## ...#... ...#... .###... ####... .##.... .......');
G('%', '##...## ##..##. ...##.. ..##... .##.... ##..##. #...##. .......');

// Box drawing for the plate's frame: double lines, 9 dots wide so they join up.
const BOX = new Map();
{
  const H = [2, 5], V = [2, 6];                       // rows of the two horizontals, columns of the verticals
  const make = (fn) => { const rows = []; for (let y = 0; y < 8; y++) { let s = ''; for (let x = 0; x < 9; x++) s += fn(x, y) ? '#' : '.'; rows.push(s); } return rows; };
  BOX.set('═', make((x, y) => H.includes(y)));
  BOX.set('║', make((x, y) => V.includes(x)));
  BOX.set('╔', make((x, y) => (y === H[0] && x >= V[0]) || (y === H[1] && x >= V[1]) || (x === V[0] && y >= H[0]) || (x === V[1] && y >= H[1])));
  BOX.set('╗', make((x, y) => (y === H[0] && x <= V[1]) || (y === H[1] && x <= V[0]) || (x === V[1] && y >= H[0]) || (x === V[0] && y >= H[1])));
  BOX.set('╚', make((x, y) => (y === H[1] && x >= V[0]) || (y === H[0] && x >= V[1]) || (x === V[0] && y <= H[1]) || (x === V[1] && y <= H[0])));
  BOX.set('╝', make((x, y) => (y === H[1] && x <= V[1]) || (y === H[0] && x <= V[0]) || (x === V[1] && y <= H[1]) || (x === V[0] && y <= H[0])));
  BOX.set('╡', make((x, y) => (H.includes(y) && x <= V[0]) || x === V[0]));  // a tab: verticals end the caption
  BOX.set('╞', make((x, y) => (H.includes(y) && x >= V[1]) || x === V[1]));
}

const gid = (ch) => `g${ch.codePointAt(0).toString(36)}`;
const usedGlyphs = new Set();
function glyphRows(ch) {
  if (BOX.has(ch)) return BOX.get(ch);
  if (!FONT.has(ch)) throw new Error(`no glyph for ${JSON.stringify(ch)}`);
  return FONT.get(ch);
}
function glyphPath(ch) {
  let d = '';
  glyphRows(ch).forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      if (row[x] === '#') { let w = 1; while (row[x + w] === '#') w++; d += `M${x} ${y}h${w}v1h-${w}z`; x += w; } else x++;
    }
  });
  return d;
}

// ------------------------------------------------------------------------- small helpers
const r2 = (v) => Math.round(v * 1000) / 1000;
const pct = (v) => `${r2(v * 100)}%`;
// Horizontal runs of cells -> rectangle sub-paths in dot units.
function runsPath(runs, y0 = 0, h = CH, x0 = 0, w0 = CW) {
  // runs: [{c, r, n}] -> rectangles x = c*CW + x0, width n*CW - (CW - w0) ... only used for full cells
  let d = '';
  for (const { c, r, n } of runs) d += `M${c * CW + x0} ${r * CH + y0}h${n * CW - (CW - w0)}v${h}h-${n * CW - (CW - w0)}z`;
  return d;
}
// Stroke-path for full-cell runs: one horizontal line per run, 8 dots wide. Relative moves keep
// it small.
function strokeRuns(cells) {               // cells: [[c, r]] sorted by r then c
  let d = '', lastR = -1, lastEnd = 0;
  for (let i = 0; i < cells.length;) {
    const [c, r] = cells[i];
    let n = 1;
    while (i + n < cells.length && cells[i + n][1] === r && cells[i + n][0] === c + n) n++;
    if (r !== lastR) d += `M${c * CW} ${r * CH + 4}h${n * CW}`;
    else d += `m${c * CW - lastEnd} 0h${n * CW}`;
    lastR = r; lastEnd = (c + n) * CW;
    i += n;
  }
  return d;
}
const sortCells = (cells) => cells.sort((a, b) => a[1] - b[1] || a[0] - b[0]);

// ============================================================================== the cells
// A scene is a grid of cells. A cell is either an effect cell {fx, k} (region + phase class)
// or a static look [ch, fg, bg] (bg null = see-through: the cell below shows in the gaps).
// Static cells sit on top of effect cells; a static cell with a background hides the effect
// under it, so that effect cell is not drawn at all.
function makeScene() {
  return { fx: Array.from({ length: ROWS }, () => Array(COLS).fill(null)), st: Array.from({ length: ROWS }, () => Array(COLS).fill(null)) };
}
const inScreen = (c, r) => c >= 0 && c < COLS && r >= 0 && r < ROWS;

// The plate covers these cells in every part, so nothing is drawn under it.
const PLATE = { c0: 4, c1: 75, r0: 1, r1: 13 };
const underPlate = (c, r) => c >= PLATE.c0 && c <= PLATE.c1 && r >= PLATE.r0 && r <= PLATE.r1;
const SCROLL_ROW = 49;

// Half-cell pixel canvas -> cells. A pixel is a "paint": {full: look, half: colour}. Where both
// halves of a cell share a paint the cell takes the paint's full look (which may be a shade
// character); otherwise it becomes an upper or lower half block in plain colours.
function pixelsToCells(px, scene, opts = {}) {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const top = px[r * 2]?.[c] ?? null, bot = px[r * 2 + 1]?.[c] ?? null;
      if (!top && !bot) continue;
      let look;
      if (top && bot && top === bot) look = top.full;
      else if (top && bot) look = ['▀', top.half, bot.half];
      else if (top) look = ['▀', top.half, null];
      else look = ['▄', bot.half, null];
      scene.st[r][c] = look;
    }
  }
}
const paint = (full, half) => ({ full: Array.isArray(full) ? full : ['█', full, full], half: half ?? (Array.isArray(full) ? full[1] : full) });
const newPixels = () => Array.from({ length: ROWS * 2 }, () => Array(COLS).fill(null));

// ===================================================================== the effect ramps
// Each effect's phase map is quantised to this many classes, and its ramp has as many steps.
const CLASSES = { sea: 48, lag: 48, sky: 48, sun: 32, tun: 32 };
// A ramp is a cycle of n looks; each region turns through it once per period.
function rampFrom(steps, n) {          // steps: [[look, weight]] -> n looks
  const total = steps.reduce((s, [, w]) => s + w, 0);
  const out = [];
  let acc = 0;
  for (const [look, w] of steps) {
    const from = Math.round((acc / total) * n); acc += w;
    const to = Math.round((acc / total) * n);
    for (let i = from; i < to; i++) out.push(look);
  }
  return out;
}
// up then down: a ping-pong through a list of looks, with dwell weights
const pingPong = (list) => (n) => rampFrom([...list, ...list.slice(1, -1).reverse()], n);

const RAMPS = {
  // the open sea: blue to cyan, light cyan only on the crests
  sea: pingPong([
    [[' ', BLU, BLU], 6], [['░', CYN, BLU], 2], [['▒', CYN, BLU], 2], [['▓', CYN, BLU], 1.5],
    [['█', CYN, CYN], 2], [['░', LCY, CYN], 1], [['▒', LCY, CYN], 0.8], [['▓', LCY, CYN], 0.5],
  ]),
  // the lagoon round the island: cyan to light cyan to white
  lag: pingPong([
    [['█', CYN, CYN], 4], [['░', LCY, CYN], 1.5], [['▒', LCY, CYN], 1.5], [['▓', LCY, CYN], 1],
    [['█', LCY, LCY], 2], [['░', WHT, LCY], 1], [['▒', WHT, LCY], 0.7],
  ]),
  // the sky: light blue, with cloud streaks of light cyan and a little white
  sky: pingPong([
    [['█', LBL, LBL], 14], [['░', LCY, LBL], 1.5], [['▒', LCY, LBL], 1.5], [['▓', LCY, LBL], 1.2],
    [['█', LCY, LCY], 1.2], [['░', WHT, LCY], 0.7],
  ]),
  // the sun: yellow and white rings
  sun: pingPong([
    [['█', YEL, YEL], 2.5], [['░', WHT, YEL], 1], [['▒', WHT, YEL], 1], [['▓', WHT, YEL], 1], [['█', WHT, WHT], 1.5],
  ]),
  // the tunnel: a red-and-gold checker that never arrives
  tun: pingPong([
    [[' ', BLK, BLK], 2.5], [['▒', RED, BLK], 1], [['█', RED, RED], 2], [['▒', LRD, RED], 1], [['█', LRD, LRD], 1],
    [['▒', YEL, LRD], 1], [['█', YEL, YEL], 1.2], [['░', WHT, YEL], 0.6],
  ]),
};
const PERIOD = { sea: 9, lag: 6, sky: 30, sun: 4, tun: 2.4 };
for (const fx in RAMPS) RAMPS[fx] = RAMPS[fx](CLASSES[fx]);
const fract = (v) => v - Math.floor(v);

// ======================================================================= part 1: island
const HZ = 25;                                   // first sea row
const SUN = { c: 65, r: 18.6, R: 4.7 };          // in cells
const ISLAND = { c: 34.5, r: 37.6, a: 12.6, b: 3.3 };
const LAGOON = 1.45;                              // the lagoon reaches this far, in island radii
const PALM_BASE = { x: 37.5, y: 36.6 };          // in cells (fractional)
const PALM_TOP = { x: 31.5, y: 16.3 };

function buildIsland() {
  const S = makeScene();
  // --- effects
  for (let r = 0; r < ROWS - 1; r++) {
    for (let c = 0; c < COLS; c++) {
      if (underPlate(c, r)) continue;
      const x = c + 0.5, y = r + 0.5;
      if (r < HZ) {
        const du = Math.hypot((x - SUN.c) * CW, (y - SUN.r) * CH) / CH;     // distance in rows
        if (du <= SUN.R) {
          S.fx[r][c] = { fx: 'sun', p: fract(-du / 3.4) };
        } else {
          // cloud streaks drifting left: wider apart and faster up top, packed in at the horizon
          const depth = HZ - y;                                            // 0.5 at the horizon .. 25 at the top
          const lam = 22 + depth * 1.8;                                    // streak spacing in columns
          const p = x / lam + 0.12 * Math.sin(x * 0.07 + y * 0.42) + 0.05 * Math.sin(x * 0.19 - y * 0.8) + y * 0.045;
          S.fx[r][c] = { fx: 'sky', p: fract(p) };
        }
      } else {
        const d = y - (HZ - 1.2);                                          // rows below the horizon line
        const X = (x - 40) / d;                                            // across the sea, in perspective
        const e = Math.hypot((x - ISLAND.c) / ISLAND.a, (y - ISLAND.r) / ISLAND.b);   // 1 on the shore
        if (e < LAGOON) {
          const ang = Math.atan2((y - ISLAND.r) / ISLAND.b, (x - ISLAND.c) / ISLAND.a);
          S.fx[r][c] = { fx: 'lag', p: fract(-(e - 1) * 1.7 - 0.06 * Math.sin(ang * 3)) };
        } else {
          const swell = 1.75 * Math.log(d) + 0.13 * Math.sin(X * 1.9 + 0.5) + 0.06 * Math.sin(X * 4.3 + Math.log(d) * 2);
          const near = 1.2 * (1 - Math.exp(-(e - 1) * 0.6));                // the island bends the swells round it
          S.fx[r][c] = { fx: 'sea', p: fract(-swell - near) };             // falling phase: they roll towards you
        }
      }
    }
  }
  // --- static: haze on the horizon (see-through white shade over the sky)
  for (let c = 0; c < COLS; c++) S.st[HZ - 1][c] = ['░', WHT, null];
  // a halo round the sun
  for (let r = 0; r < HZ; r++) {
    for (let c = 0; c < COLS; c++) {
      if (underPlate(c, r)) continue;
      const du = Math.hypot((c + 0.5 - SUN.c) * CW, (r + 0.5 - SUN.r) * CH) / CH;
      if (du > SUN.R && du <= SUN.R + 1.25) S.st[r][c] = ['░', WHT, null];
    }
  }

  const px = newPixels();
  const P = (c, h, pt) => { if (c >= 0 && c < COLS && h >= 0 && h < ROWS * 2) px[h][c] = pt; };

  // --- the island: foam ring (see-through), sand, wet edge
  const SAND = paint(['░', BRN, YEL], YEL);
  const SAND_SH = paint(['▒', BRN, YEL], BRN);
  for (let h = 0; h < ROWS * 2; h++) {
    for (let c = 0; c < COLS; c++) {
      const x = c + 0.5, y = (h + 0.5) / 2;
      const e = Math.hypot((x - ISLAND.c) / ISLAND.a, (y - ISLAND.r) / ISLAND.b);
      if (e <= 1) P(c, h, y > ISLAND.r + ISLAND.b * 0.45 ? SAND_SH : SAND);
    }
  }
  // rocks at the front edge
  const ROCK = paint(DGR, DGR), ROCK_HI = paint(LGR, LGR);
  for (const [c, h] of [[27, 81], [28, 81], [27, 80], [41, 81], [42, 81]]) P(c, h, ROCK);
  P(27, 80, ROCK_HI); P(41, 80, ROCK_HI);
  // bushes at the foot of the palm
  const BUSH = paint(['▒', LGN, GRN], GRN), BUSH_HI = paint(LGN, LGN);
  const bushes = [[30, 70], [31, 70], [32, 70], [29, 71], [30, 71], [31, 71], [32, 71], [33, 71], [34, 71],
    [39, 71], [40, 71], [41, 71], [40, 70], [42, 72], [41, 72], [28, 72], [29, 72]];
  for (const [c, h] of bushes) P(c, h, BUSH);
  for (const [c, h] of [[31, 69], [40, 69], [30, 70]]) P(c, h, BUSH_HI);

  // --- the raft, right of the island
  const LOG = paint(['▒', LRD, BRN], BRN), LOG_DK = paint(RED, RED);
  for (let c = 50; c <= 56; c++) { P(c, 75, LOG); P(c, 76, c % 2 ? LOG : LOG_DK); }
  P(50, 74, paint(BRN, BRN)); P(56, 74, paint(BRN, BRN));

  // --- the palm: a slender trunk leaning left, stair-stepped one cell wide
  const BARK_A = paint(BRN, BRN), BARK_B = paint(LRD, LRD);
  const tTop = PALM_TOP.y * 2, tBase = PALM_BASE.y * 2;
  for (let h = Math.ceil(tTop); h <= tBase; h++) {
    const t = (h - tTop) / (tBase - tTop);                              // 0 at the crown
    const x = PALM_TOP.x + (PALM_BASE.x - PALM_TOP.x) * (t * t * 0.55 + t * 0.45);
    P(Math.floor(x), h, (h % 3 === 0) ? BARK_B : BARK_A);
  }
  // coconuts
  const NUT = paint(BRN, BRN);
  const nc = Math.floor(PALM_TOP.x), nh = Math.round(PALM_TOP.y * 2) + 2;
  P(nc - 1, nh, NUT); P(nc, nh, NUT); P(nc, nh + 1, NUT);
  // fronds: drooping arcs from the crown, a light spine with darker leaflets under it
  const SPINE = paint(LGN, LGN), LEAF = paint(GRN, GRN);
  const cx = PALM_TOP.x * CW, cy = PALM_TOP.y * CH;                     // crown, in dots
  const fronds = [
    [182, 104, 26], [-2, 104, 26], [158, 76, 30], [22, 76, 30], [205, 70, 12], [-25, 70, 12], [120, 40, 22], [60, 40, 22],
  ];  // [angle in degrees (0 = right, 90 = up), length in dots, droop in dots]
  for (const [deg, len, droop] of fronds) {
    const a = (deg * Math.PI) / 180;
    for (let s = 0; s <= 1.0001; s += 0.01) {
      const x = cx + Math.cos(a) * len * s;
      const y = cy - Math.sin(a) * len * s + droop * s * s;
      const c = Math.floor(x / CW), h = Math.floor(y / 4);
      P(c, h + 1, LEAF);
      if (s > 0.15 && s < 0.85) P(c, h + 2, LEAF);
    }
    for (let s = 0; s <= 1.0001; s += 0.01) {
      const x = cx + Math.cos(a) * len * s;
      const y = cy - Math.sin(a) * len * s + droop * s * s;
      P(Math.floor(x / CW), Math.floor(y / 4), SPINE);
    }
  }
  pixelsToCells(px, S);

  // the foam: see-through white light shade in the sea cells that touch the sand
  for (let r = HZ; r < ROWS - 1; r++) {
    for (let c = 0; c < COLS; c++) {
      if (S.st[r][c]) continue;
      const x = c + 0.5, y = r + 0.5;
      const e = Math.hypot((x - ISLAND.c) / (ISLAND.a + 1.4), (y - ISLAND.r) / (ISLAND.b + 0.9));
      if (e <= 1) S.st[r][c] = ['░', WHT, null];
    }
  }
  return S;
}

// Her, standing on the sand left of the palm, hands in her pockets: a column one cell wide
// with half-cell shoulders, so she is centred on the middle cell. Two head frames make the nod:
// on every beat the hair comes down half a cell and her face dips out of sight. Brown hair,
// cream headphones either side of her head, coral top, cream shorts, bare feet.
const HER = { c: 24, r: 30 };
const SKIN = ['▒', YEL, LRD];
function herCells(frame) {                       // [dc, dr, look]
  const head = frame === 'up'
    ? [[1, 0, ['▄', BRN, null]], [1, 1, ['▀', BRN, YEL]]]
    : [[1, 1, ['█', BRN, BRN]]];
  return [
    ...head,
    [0, 1, ['▐', WHT, null]], [2, 1, ['▌', WHT, null]],                        // headphones
    [0, 2, ['▐', LRD, null]], [1, 2, ['▀', YEL, LRD]], [2, 2, ['▌', LRD, null]], // chin, coral top
    [0, 3, ['▐', LRD, null]], [1, 3, ['█', LRD, LRD]], [2, 3, ['▌', LRD, null]],
    [0, 4, ['▐', WHT, null]], [1, 4, ['░', YEL, WHT]], [2, 4, ['▌', WHT, null]], // cream shorts
    [1, 5, SKIN], [1, 6, ['▀', YEL, null]],                                   // legs, bare feet
    [2, 6, ['▒', BRN, null]],                                                  // her shadow on the sand
  ];
}
const CUP_HAND = [[3, 3, ['▌', WHT, null]], [3, 4, ['▌', BRN, null]]];   // iced coffee, held at her side
const CUP_SAND = [[3, 6, ['▄', WHT, null]]];                            // the empty cup, later, on the sand

// The message in a bottle: thrown out to the left at 0:24, lands, and washes straight back to
// the sand at her feet, one cell per beat. [time, column, row]; null hides it.
const BOTTLE = [
  [0, null], [24, 23, 31], [24.375, 21, 30], [24.75, 19, 29], [25.125, 17, 29], [25.5, 15, 30],
  [25.875, 13, 31], [26.25, 12, 32], [26.625, 11, 33],
  ...Array.from({ length: 10 }, (_, i) => [27.75 + i * BEAT, 12 + i, 33]),
  [35.25, 22, 34], [36, 23, 35], [36.75, 24, 36], [T_CUT, null],
];
const SPLASH = [[0, null], [26.625, 11, 32], [27.75, null]];

// ======================================================================= part 2: tunnel
const TUN = { c: 40, r: 31.5 };
const LABEL = { c0: 19, c1: 60, r0: 27, r1: 35 };
function buildTunnel() {
  const S = makeScene();
  for (let r = 0; r < ROWS - 1; r++) {
    for (let c = 0; c < COLS; c++) {
      if (underPlate(c, r)) continue;
      if (c >= LABEL.c0 && c <= LABEL.c1 && r >= LABEL.r0 && r <= LABEL.r1) continue;
      const dx = (c + 0.5 - TUN.c) * CW, dy = (r + 0.5 - TUN.r) * CH;
      const d = Math.hypot(dx, dy) / CH;
      const ang = Math.atan2(dy, dx) / (2 * Math.PI) + 0.5;               // 0..1
      const depth = -2.1 * Math.log(d + 0.5);                              // log-polar: evenly spaced rings
      const seg = Math.floor(ang * 8 - depth * 0.35 + 8) % 2;             // 8 slices, twisted
      S.fx[r][c] = { fx: 'tun', p: fract(depth + seg * 0.5) };
    }
  }
  return S;
}


// ================================================================== the plate and the logo
// CASTAWAY in block letters on half-cell pixels: 14 half-rows tall, 2-cell stems.
const LOGO_GLYPHS = {
  C: ['.######', '#######', '#######', '##.....', '##.....', '##.....', '##.....', '##.....', '##.....', '##.....', '##.....', '#######', '#######', '.######'],
  A: ['.#####.', '#######', '#######', '##...##', '##...##', '##...##', '#######', '#######', '#######', '##...##', '##...##', '##...##', '##...##', '##...##'],
  S: ['.######', '#######', '#######', '##.....', '##.....', '######.', '#######', '.######', '.....##', '.....##', '.....##', '#######', '#######', '######.'],
  T: ['######', '######', '######', '..##..', '..##..', '..##..', '..##..', '..##..', '..##..', '..##..', '..##..', '..##..', '..##..', '..##..'],
  W: ['##.....##', '##.....##', '##.....##', '##.....##', '##.....##', '##..#..##', '##..#..##', '##.###.##', '##.###.##', '##.###.##', '#########', '#########', '#########', '.###.###.'],
  Y: ['##...##', '##...##', '##...##', '##...##', '##...##', '#######', '#######', '.#####.', '..###..', '..###..', '..###..', '..###..', '..###..', '..###..'],
};
const LOGO_WORD = 'CASTAWAY';
// The fill, top to bottom: white, yellow, light red, red; where a whole cell is inside a letter
// it takes a shade character between two of them, so the gradient is banded the text-mode way.
const LOGO_FULL = [['█', WHT, WHT], ['▓', WHT, YEL], ['█', YEL, YEL], ['▒', LRD, YEL], ['█', LRD, LRD], ['▒', RED, LRD], ['▓', RED, LRD]];
const LOGO_HALF = [WHT, WHT, WHT, YEL, YEL, YEL, YEL, LRD, LRD, LRD, LRD, RED, LRD, RED];
const LOGO_SHADOW = DGR;

function buildPlate() {
  const S = makeScene();
  const { c0, c1, r0, r1 } = PLATE;
  for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) S.st[r][c] = [' ', BLK, BLK];
  // the logo, on half-cell pixels: t 1 = letter, t 2 = shadow
  const width = [...LOGO_WORD].reduce((s, ch) => s + LOGO_GLYPHS[ch][0].length, 0) + LOGO_WORD.length - 1;
  const lc0 = c0 + 1 + Math.floor((c1 - c0 - 1 - (width + 1)) / 2);
  const lh0 = (r0 + 2) * 2;
  const pix = new Map();
  const key = (c, h) => `${c},${h}`;
  let x = lc0;
  for (const ch of LOGO_WORD) {
    const g = LOGO_GLYPHS[ch];
    g.forEach((row, i) => [...row].forEach((v, j) => { if (v === '#') pix.set(key(x + j, lh0 + i), { t: 1, i }); }));
    x += g[0].length + 1;
  }
  for (const [k, v] of [...pix]) {
    const [c, h] = k.split(',').map(Number);
    if (v.t === 1 && !pix.has(key(c + 1, h + 1))) pix.set(key(c + 1, h + 1), { t: 2 });
  }
  for (let r = r0 + 2; r <= r0 + 9; r++) {
    for (let c = c0 + 1; c < c1; c++) {
      const top = pix.get(key(c, r * 2)), bot = pix.get(key(c, r * 2 + 1));
      if (!top && !bot) continue;
      const tl = top?.t === 1, bl = bot?.t === 1;
      if (tl && bl) S.st[r][c] = LOGO_FULL[top.i >> 1];
      else if (tl) S.st[r][c] = ['▀', LOGO_HALF[top.i], bot ? LOGO_SHADOW : BLK];
      else if (bl) S.st[r][c] = ['▄', LOGO_HALF[bot.i], top ? LOGO_SHADOW : BLK];
      else if (top && bot) S.st[r][c] = ['█', LOGO_SHADOW, LOGO_SHADOW];
      else if (top) S.st[r][c] = ['▀', LOGO_SHADOW, BLK];
      else S.st[r][c] = ['▄', LOGO_SHADOW, BLK];
    }
  }
  // the frame, with captions set into it
  const FR = CYN;
  frame(S, c0, r0, c1, r1, FR);
  caption(S, r0, c0 + 3, [['crawlspace', LCY], [' presents', LGR]], FR);
  caption(S, r0, null, [['80x50', WHT], [' · ', DGR], ['16 colours', WHT], [' · ', DGR], ['1 island', WHT]], FR, c1 - 3);
  caption(S, r1, null, [['python tools/serve.py', YEL]], FR, null, true);
  // the tagline
  write(S, r0 + 10, null, [['she idles. every so often, ', LGR], ['something happens.', WHT]], BLK, true);
  return S;
}
function frame(S, c0, r0, c1, r1, col) {
  for (let c = c0 + 1; c < c1; c++) { S.st[r0][c] = ['═', col, BLK]; S.st[r1][c] = ['═', col, BLK]; }
  for (let r = r0 + 1; r < r1; r++) { S.st[r][c0] = ['║', col, BLK]; S.st[r][c1] = ['║', col, BLK]; }
  S.st[r0][c0] = ['╔', col, BLK]; S.st[r0][c1] = ['╗', col, BLK]; S.st[r1][c0] = ['╚', col, BLK]; S.st[r1][c1] = ['╝', col, BLK];
}
// Text into cells. segs: [[text, colour]]. center: centred on the screen.
function segLen(segs) { return segs.reduce((s, [t]) => s + [...t].length, 0); }
function write(S, r, col, segs, bg = BLK, center = false) {
  let c = center ? Math.floor((COLS - segLen(segs)) / 2) : col;
  for (const [t, fg] of segs) for (const ch of t) { S.st[r][c] = [ch, fg, bg]; c++; }
}
// a caption set into a frame line, between tabs
function caption(S, r, col, segs, frameCol, rightEdge = null, center = false) {
  const n = segLen(segs) + 4;
  const c = center ? Math.floor((COLS - n) / 2) : rightEdge != null ? rightEdge - n + 1 : col;
  S.st[r][c] = ['╡', frameCol, BLK]; S.st[r][c + 1] = [' ', BLK, BLK];
  write(S, r, c + 2, segs);
  S.st[r][c + n - 2] = [' ', BLK, BLK]; S.st[r][c + n - 1] = ['╞', frameCol, BLK];
}

function buildLabel(S) {
  const { c0, c1, r0, r1 } = LABEL;
  for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) S.st[r][c] = [' ', BLK, BLK];
  frame(S, c0, r0, c1, r1, YEL);
  caption(S, r0, null, [['part two', LRD]], YEL, null, true);
  write(S, r0 + 2, null, [['SUPER RARE EVENT', WHT]], BLK, true);
  write(S, r0 + 4, null, [['she could leave any time.', YEL]], BLK, true);
  write(S, r0 + 6, null, [['(she walks out over the water)', LGR]], BLK, true);
  caption(S, r1, null, [['at most once in ten hours', LGR]], YEL, null, true);
}

// ================================================================================ render
// Static cells: backgrounds as 8-dot strokes, half blocks as rectangles, shade characters as
// pattern fills, letters and frame pieces as <use> of glyph paths.
const patterns = new Map();
function shadePattern(ch, fg) {
  const id = `p${'░▒▓'.indexOf(ch)}${fg.toString(16)}`;
  if (!patterns.has(id)) {
    let d = '';
    shadeDots(ch).forEach((xs, y) => { for (const x of xs) d += `M${x} ${y}h1v1h-1z`; });
    patterns.set(id, `<pattern id="${id}" width="9" height="2" patternUnits="userSpaceOnUse"><path fill="${VGA[fg]}" d="${d}"/></pattern>`);
  }
  return id;
}
// rectangles for runs of cells, optionally only a band of dot rows inside the cell
function cellRects(cells, y0 = 0, h = CH) {
  let d = '';
  for (let i = 0; i < cells.length;) {
    const [c, r] = cells[i];
    let n = 1;
    while (i + n < cells.length && cells[i + n][1] === r && cells[i + n][0] === c + n) n++;
    d += `M${c * CW} ${r * CH + y0}h${n * CW}v${h}h-${n * CW}z`;
    i += n;
  }
  return d;
}
function renderStatic(st) {
  const bgCells = new Map(), half = new Map(), shade = new Map(), glyphs = new Map();
  const push = (m, k, v) => { if (!m.has(k)) m.set(k, []); m.get(k).push(v); };
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const look = st[r][c];
      if (!look) continue;
      const [ch, fg, bg] = look;
      if (ch === '█') { push(bgCells, fg, [c, r]); continue; }
      if (bg != null) push(bgCells, bg, [c, r]);
      if (ch === ' ') continue;
      if ('▀▄▌▐'.includes(ch)) push(half, `${ch}${fg}`, [c, r]);
      else if ('░▒▓'.includes(ch)) push(shade, `${ch}${fg}`, [c, r]);
      else { usedGlyphs.add(ch); push(glyphs, fg, [c, r, ch]); }
    }
  }
  let out = '';
  for (const [col, cells] of bgCells) out += `<path stroke="${VGA[col]}" d="${strokeRuns(sortCells(cells))}"/>`;
  for (const [k, cells] of shade) {
    const ch = k[0], fg = Number(k.slice(1));
    out += `<path fill="url(#${shadePattern(ch, fg)})" d="${cellRects(sortCells(cells))}"/>`;
  }
  for (const [k, cells] of half) {
    const ch = k[0], fg = Number(k.slice(1));
    let d = '';
    if (ch === '▀' || ch === '▄') d = cellRects(sortCells(cells), ch === '▀' ? 0 : 4, 4);
    else for (const [c, r] of cells) d += ch === '▌' ? `M${c * CW} ${r * CH}h4v8h-4z` : `M${c * CW + 4} ${r * CH}h5v8h-5z`;
    out += `<path fill="${VGA[fg]}" d="${d}"/>`;
  }
  for (const [fg, cells] of glyphs) {
    out += `<g fill="${VGA[fg]}">`;
    for (const [c, r, ch] of cells) out += `<use href="#${gid(ch)}" x="${c * CW}" y="${r * CH}"/>`;
    out += '</g>';
  }
  return out;
}
const hides = (look) => look && (look[0] === '█' || look[2] != null);

// Effects: one path per (region, class), referenced once per atom layer.
const FX_ID = { sea: 's', lag: 'l', sky: 'k', sun: 'u', tun: 't' };
function effectDefs(S, part) {
  const groups = new Map();
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const f = S.fx[r][c];
      if (!f || hides(S.st[r][c])) continue;
      const n = CLASSES[f.fx];
      const k = Math.floor(f.p * n) % n;
      const key = `${f.fx}:${String(k).padStart(2, '0')}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push([c, r]);
    }
  }
  let defs = '';
  const byRegion = new Map();
  for (const [key, cells] of [...groups].sort()) {
    const [fx, ks] = key.split(':');
    const k = Number(ks);
    const id = `${FX_ID[fx]}${k}`;
    defs += `<path id="${id}" d="${strokeRuns(sortCells(cells))}"/>`;
    if (!byRegion.has(fx)) byRegion.set(fx, []);
    byRegion.get(fx).push([id, k]);
  }
  const layer = (atom) => [...byRegion].map(([fx, list]) => `<g class="${FX_ID[fx]}${atom}">${list.map(([id, k]) => `<use href="#${id}"${k ? ` style="--k:${k}"` : ''}/>`).join('')}</g>`).join('');
  return { defs, layer, regions: [...byRegion.keys()] };
}

function effectCss(regions) {
  let css = '';
  for (const fx of regions) {
    const f = FX_ID[fx], T = PERIOD[fx], ramp = RAMPS[fx], K = CLASSES[fx];
    if (ramp.length !== K) throw new Error(`ramp ${fx} has ${ramp.length} steps`);
    // every class runs the same keyframes; class k starts k steps in (its --k), which is the
    // whole of palette cycling
    css += `.${f}A use,.${f}B use,.${f}C use,.${f}D use{animation-duration:${T}s;animation-delay:calc(var(--k) * -${r2(T / K)}s)}`;
    for (const atom of 'ABCD') {
      const seq = ramp.map((look) => atomColour(look, atom));
      let kf = '';
      seq.forEach((col, i) => { if (i === 0 || col !== seq[i - 1]) kf += `${i === 0 ? '0%' : pct(i / K)}{stroke:${VGA[col]}}`; });
      kf += `to{stroke:${VGA[seq[K - 1]]}}`;
      css += `@keyframes ${f}${atom}{${kf}}.${f}${atom} use{animation-name:${f}${atom}}`;
    }
  }
  return css;
}

// ----------------------------------------------------------------------------- scroller
const SCROLL = [
  ['CASTAWAY', YEL], [': a ten-hour lo-fi video of one tiny island, one tall palm, one raft and one young woman in cream headphones. ', LCY],
  ['She idles. Every so often, something happens. ', WHT],
  ['·  ·  ·  ', DGR],
  ['A message in a bottle washes straight back. A drone delivers a parcel: it is another pair of headphones. A coconut falls on a hermit crab, and the coconut walks off. A shark in headphones nods on the beat. ', LCY],
  ['·  ·  ·  ', DGR],
  ['Every gag waits for the next bar of the music, every 3 seconds, the way this scroller waits for the next character cell. ', WHT],
  ['·  ·  ·  ', DGR],
  ['Every sound is synthesized from code: no samples, no loop libraries, no recordings. ', LCY],
  ['·  ·  ·  ', DGR],
  ['This sea was worked out once, cell by cell; since then only the colours have moved. The video is ten hours of roughly that, plus a cat. ', WHT],
  ['·  ·  ·  ', DGR],
  ['Run it: python tools/serve.py, then open 127.0.0.1:8765 ', YEL],
  ['·  ·  ·  ', DGR],
  ['Crawlspace greets the Ninth Dot Preservation League, the Ramp Rotary Club and the Horse Latitudes text mode compo, where this entry is still waiting to be shown. ', LGR],
  ['·  ·  ·  ·  ·  ·  ', DGR],
];
const SCROLL_CPS = 7.5;                                     // character cells per second

function scrollerSvg() {
  const segs = [];
  for (const [t, col] of SCROLL) for (const ch of t) segs.push([ch, col]);
  const N = segs.length;
  const all = [...segs, ...segs.slice(0, COLS)];
  const byCol = new Map();
  all.forEach(([ch, col], i) => {
    if (ch === ' ') return;
    usedGlyphs.add(ch);
    if (!byCol.has(col)) byCol.set(col, '');
    byCol.set(col, byCol.get(col) + `<use href="#${gid(ch)}" x="${i * CW}"/>`);
  });
  const dur = r2(N / SCROLL_CPS);
  const css = `.scr{animation:scr ${dur}s steps(${N}) infinite}@keyframes scr{to{transform:translateX(-${N * CW}px)}}`;
  let body = `<g clip-path="url(#row)"><g transform="translate(0 ${SCROLL_ROW * CH})"><g class="scr">`;
  for (const [col, uses] of byCol) body += `<g fill="${VGA[col]}">${uses}</g>`;
  body += '</g></g></g>';
  return { body, css, N, dur, text: segs.map(([c]) => c).join('') };
}

// ================================================================================ build
// A sprite moved by whole cells on the loop's clock: step-end keyframes of translate().
function moverCss(cls, track) {
  let kf = '';
  for (const [t, c, r] of track) {
    const tr = c == null ? `translate(-${SW}px,0)` : `translate(${c * CW}px,${r * CH}px)`;
    kf += `${t === 0 ? '0%' : pct(t / LOOP)}{transform:${tr}}`;
  }
  return `.${cls}{animation:${cls} ${LOOP}s step-end infinite}@keyframes ${cls}{${kf}}`;
}
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function build() {
  const island = buildIsland();
  const tunnel = buildTunnel();
  buildLabel(tunnel);
  const plate = buildPlate();

  // the scroller row: a dithered fade at both ends, drawn over the moving text
  const edge = makeScene();
  [['▓', 0], ['▒', 1], ['░', 2]].forEach(([ch, i]) => { edge.st[SCROLL_ROW][i] = [ch, BLK, null]; edge.st[SCROLL_ROW][COLS - 1 - i] = [ch, BLK, null]; });

  const fxI = effectDefs(island, 'i');
  const fxT = effectDefs(tunnel, 't');
  const regions = [...new Set([...fxI.regions, ...fxT.regions])];

  // her, in two nod frames, and the iced coffee
  const herScene = (fr) => { const S = makeScene(); for (const [dc, dr, look] of herCells(fr)) S.st[HER.r + dr][HER.c + dc] = look; return S; };
  const cupHand = makeScene(); for (const [dc, dr, look] of CUP_HAND) cupHand.st[HER.r + dr][HER.c + dc] = look;
  const cupSand = makeScene(); for (const [dc, dr, look] of CUP_SAND) cupSand.st[HER.r + dr][HER.c + dc] = look;
  // the bottle and its splash are drawn in the top-left cell and moved by whole cells
  const bottleCell = makeScene(); bottleCell.st[0][0] = ['▄', LGN, null];
  const splashCell = makeScene(); splashCell.st[0][0] = ['*', WHT, null];
  const bottle = renderStatic(bottleCell.st), splash = renderStatic(splashCell.st);

  const scr = scrollerSvg();
  const islandStatic = renderStatic(island.st);
  const tunnelStatic = renderStatic(tunnel.st);
  const plateStatic = renderStatic(plate.st);
  const edgeStatic = renderStatic(edge.st);
  const herUp = renderStatic(herScene('up').st), herDown = renderStatic(herScene('down').st);
  const cupH = renderStatic(cupHand.st), cupS = renderStatic(cupSand.st);

  // masks: the B, C and D dots of the shade characters, as 9x2 tiles
  let defs = '';
  for (const a of 'BCD') {
    let d = '';
    ATOM_DOTS[a].forEach((xs, y) => { for (const x of xs) d += `M${x} ${y}h1v1h-1z`; });
    defs += `<pattern id="t${a}" width="9" height="2" patternUnits="userSpaceOnUse"><path fill="#fff" d="${d}"/></pattern>`;
    defs += `<mask id="m${a}" maskUnits="userSpaceOnUse" x="0" y="0" width="${SW}" height="${SH}"><rect width="${SW}" height="${SH}" fill="url(#t${a})"/></mask>`;
  }
  defs += `<clipPath id="scrn"><rect width="${SW}" height="${SH}" rx="5"/></clipPath>`;
  defs += `<clipPath id="row"><rect y="${SCROLL_ROW * CH}" width="${SW}" height="${CH}"/></clipPath>`;
  for (const ch of [...usedGlyphs].sort()) defs += `<path id="${gid(ch)}" d="${glyphPath(ch)}"/>`;
  defs += [...patterns.values()].join('');
  const fxDefs = `<g class="fx">${fxI.defs}${fxT.defs}</g>`;

  const cut = T_CUT / LOOP, back = T_BACK / LOOP, drink = 21 / LOOP;
  const css = [
    'svg{shape-rendering:crispEdges}',
    'path[stroke]{fill:none;stroke-width:8}',
    'use{animation-timing-function:step-end;animation-iteration-count:infinite}',
    effectCss(regions),
    `.pI{animation:pI ${LOOP}s step-end infinite}@keyframes pI{0%{visibility:visible}${pct(cut)}{visibility:hidden}${pct(back)}{visibility:visible}}`,
    `.pT{visibility:hidden;animation:pT ${LOOP}s step-end infinite}@keyframes pT{0%{visibility:hidden}${pct(cut)}{visibility:visible}${pct(back)}{visibility:hidden}}`,
    // the nod: head down for the first 30% of every beat; started 40% in, so the opening frame
    // (and the reduced-motion still) shows her face
    `.nd{visibility:hidden;animation:nd ${BEAT}s step-end -${r2(BEAT * 0.4)}s infinite}@keyframes nd{0%{visibility:visible}30%{visibility:hidden}}`,
    `.nu{animation:nu ${BEAT}s step-end -${r2(BEAT * 0.4)}s infinite}@keyframes nu{0%{visibility:hidden}30%{visibility:visible}}`,
    `.ch{animation:ch ${LOOP}s step-end infinite}@keyframes ch{0%{visibility:visible}${pct(drink)}{visibility:hidden}${pct(back)}{visibility:visible}}`,
    `.cs{visibility:hidden;animation:cs ${LOOP}s step-end infinite}@keyframes cs{0%{visibility:hidden}${pct(drink)}{visibility:visible}${pct(cut)}{visibility:hidden}}`,
    moverCss('bt', BOTTLE), moverCss('sp', SPLASH),
    scr.css,
    '@media (prefers-reduced-motion:reduce){*{animation-play-state:paused!important}}',
  ].join('');

  const desc = 'CASTAWAY, as a text-mode demo screen: 80 columns by 50 rows of character cells in the 16 VGA colours, every gradient made of light, medium and dark shade characters. '
    + 'At the top, a black plate framed in double lines holds CASTAWAY in big block letters, shaded white to yellow to light red to red with a grey drop shadow, captioned crawlspace presents, 80x50, 16 colours, 1 island, and python tools/serve.py, over the tagline: she idles. every so often, something happens. '
    + 'Below it, a light blue sky with dithered cloud streaks drifting left, a sun of yellow and white rings flowing outward, and a sea of blue and cyan bands with light cyan crests rolling towards you, and lagoon rings of cyan and white spreading out from a tiny sandy island. '
    + 'On the island stand a tall leaning palm and a young woman in cream headphones, a coral tank top and cream shorts, nodding on every beat; a raft floats beside it. '
    + 'At 0:24 she throws a message in a bottle out to the left; it lands with a splash and drifts straight back to her feet, one cell per beat. '
    + 'Once a minute the screen hard-cuts for two bars to a red and gold checkered tunnel with a label: part two, super rare event, she could leave any time, she walks out over the water, at most once in ten hours. '
    + 'Then it cuts back, and she is standing there with an iced coffee. '
    + `Along the bottom row a scroller moves one character at a time: ${scr.text.replace(/[·\s]{4,}/g, ' ... ').replace(/\s+/g, ' ').trim()}`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VBW} ${VBH}" width="${VBW}" height="${VBH}" role="img" aria-labelledby="t d">`
    + `<title id="t">CASTAWAY</title><desc id="d">${esc(desc)}</desc>`
    + `<style>${css}</style>`
    + `<defs>${defs}${fxDefs}</defs>`
    + `<rect width="${VBW}" height="${VBH}" rx="14" fill="#16161c"/>`
    + `<rect x="${BZ - 3}" y="${BZ - 3}" width="${SW + 6}" height="${SH + 6}" rx="7" fill="#000" stroke="#2c2c36" stroke-width="2"/>`
    + `<g transform="translate(${BZ} ${BZ})" clip-path="url(#scrn)">`
    + `<g fill="none" stroke-width="8"><g class="pI">${fxI.layer('A')}</g><g class="pT">${fxT.layer('A')}</g></g>`
    + ['B', 'C', 'D'].map((a) => `<g fill="none" stroke-width="8" mask="url(#m${a})"><g class="pI">${fxI.layer(a)}</g><g class="pT">${fxT.layer(a)}</g></g>`).join('')
    + `<g class="pI">${islandStatic}<g class="nu">${herUp}</g><g class="nd">${herDown}</g><g class="ch">${cupH}</g><g class="cs">${cupS}</g>`
    + `<g class="bt">${bottle}</g><g class="sp">${splash}</g></g>`
    + `<g class="pT">${tunnelStatic}</g>`
    + plateStatic
    + scr.body + edgeStatic
    + '</g></svg>';
  return { svg, scr };
}

// ================================================================================== main
const args = process.argv.slice(2);
const { svg, scr } = build();
if (args.includes('--scroll')) {
  console.log(scr.text);
  console.log(`\n${scr.N} cells, ${scr.dur} s per pass`);
} else {
  fs.writeFileSync(OUT, svg + '\n');
  console.log(`wrote ${path.relative(process.cwd(), OUT)} (${(svg.length / 1024).toFixed(1)} KB)`);
}
