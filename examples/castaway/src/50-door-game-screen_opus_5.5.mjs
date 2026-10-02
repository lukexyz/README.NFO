#!/usr/bin/env node
// CASTAWAY, played as a BBS door game: the kind of text adventure a 1990s bulletin board handed
// you in daily turns. One 80x25 ANSI screen that plays a short session on a loop:
//   1. the title screen: a white stencil block logo with grey undersides in two stacked words
//      (CAST / AWAY), red block numerals (the time left today), a sun limb in shade characters
//      in the top-right corner (a planet limb, in daylight), a grey ship silhouette on the
//      horizon, thin blue speed lines for the sea, and a magenta bracketed prompt bottom left;
//   2. a location screen: white title, a dash, the place name in green, a dark-blue -=-=- rule,
//      a green paragraph of second-person narration ending in an ellipsis, choices with the
//      hotkey letter in round brackets, an orange status line, and a magenta prompt with the
//      time left and the default answer in square brackets in yellow. A key types itself;
//   3. a story screen: green narration wrapped beside two small ANSI vignettes, each in a thin
//      blue single-line box, an orange status line and a magenta prompt below.
// Then the title redraws and it starts again. Style: "Door game screen" (catalogue entry
// ansi-06), after the fantasy and space-trading doors of 1989-1997. All lettering, prose and
// art in this file are original; no game's name, places, characters or text are used.
//
// A second, static SVG shows the same island in the space-trader manner: label : value sector
// lines, a paths line with unexplored places in round brackets, a five-column report under a
// dashed header, and a command prompt carrying the time left and the sector number.
//
// Regenerate:  node examples/castaway/src/50-door-game-screen_opus_5.5.mjs
// Writes ../assets/50-door-game-screen_opus_5.5.svg, ../assets/50-door-game-screen_opus_5.5-stats.svg
// and ../50-door-game-screen_opus_5.5.md.
//
// Plain Node, no dependencies, deterministic (no clock; the only randomness is a seeded PRNG,
// seed 1992, the project's default run seed). Text is drawn from a CP437-style 8x16 bitmap font
// as <use> glyphs, never <text>. Animation is CSS only, stepped, on the soundtrack's grid:
// 80 BPM = one beat every 0.75 s, a bar every 3 s; screens cut on bar lines; the loop is 39 s (13 bars).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '50-door-game-screen_opus_5.5';
const OUT_SVG = path.join(HERE, '..', 'assets', `${SLUG}.svg`);
const OUT_STATS = path.join(HERE, '..', 'assets', `${SLUG}-stats.svg`);
const OUT_MD = path.join(HERE, '..', `${SLUG}.md`);

// ---------------------------------------------------------------------------------------------
// Facts used on screen, checked read-only against D:/python/castaway on 2026-10-01:
//   activities.toml: 94 activities (81 on the four timers + 13 chained); the README says
//   "more than 90", most on four timers, the rest follow-ups. [video] fps = 24 (since
//   2026-10-01, MUSING.md "Current state"), so the README says 24 fps, not 30.
//   tiers: regular 2-5 min, occasional 12-25 min, rare 30-60 min, super rare 3-6 h (max 3 a run).
//   typical 10-hour run (the file's own header, medians of 200 simulated runs): about 155
//   regular, 30 occasional, 13 rare and 2 super-rare events, plus chained follow-ups.
//   run: 10:00:00, seed 1992, every start snapped to the next 3.0 s bar.
//   message_in_bottle: "it washes straight back to her feet"; bottle_reply comes 1-3 hours
//   later, a different bottle. hammock: "looks around for a second tree. There isn't one."
//   media/audio/audio_catalog.json: 181 files; the README says "more than 150".
//   fishing_quiet: "Fishes from the shore" (so the menu says shore, not raft).
// Re-checked by the reviewer on 2026-10-02: still 94 activities and 181 sound files.
// ---------------------------------------------------------------------------------------------

// Seeded PRNG (mulberry32), seed 1992.
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
// Screen geometry, palette, timing
// ---------------------------------------------------------------------------------------------
const COLS = 80, ROWS = 25, CW = 8, CH = 16, PAD = 16;
const SW = COLS * CW, SH = ROWS * CH;
const PX = 8;                                  // one half-block pixel is 8 x 8
const PAL = ['#000000', '#0000AA', '#00AA00', '#00AAAA', '#AA0000', '#AA00AA', '#AA5500', '#AAAAAA',
  '#555555', '#5555FF', '#55FF55', '#55FFFF', '#FF5555', '#FF55FF', '#FFFF55', '#FFFFFF'];
const [BLK, BLU, GRN, CYN, RED, MAG, BRN, LGR, DGR, LBL, LGN, LCY, LRD, LMG, YEL, WHT] = PAL.map((_, i) => i);

const BEAT = 0.75, BAR = 3;
const LOOP = 39;                               // 13 bars
// The session, in seconds. Every cut lands on a bar line.
const T = {
  islandAt: 9,                                 // title for 3 bars, then the location screen
  storyAt: 24,                                 // location for 5 bars, then the story screen
  titleAt: LOOP - BEAT,                        // story for ~5 bars, then the title redraws
  draw: BEAT,                                  // a screen paints top to bottom in one beat
  keyAt: 22.5,                                 // the key typed at the location prompt
};
const beatAt = (k) => T.storyAt + T.draw + k * BEAT;   // story-screen beats, k = 0..17

// ---------------------------------------------------------------------------------------------
// CP437-style 8x16 bitmap font. Rows are '#'/'.' strings, placed from row `top` of the cell.
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
  '|': [2, '...##.. ...##.. ...##.. ...##.. ...##.. ...##.. ...##.. ...##.. ...##.. ...##.. ...##.. ...##..'],
  '(': [2, '....##. ...##.. ..##... ..##... ..##... ..##... ..##... ..##... ...##.. ....##.'],
  ')': [2, '.##.... ..##... ...##.. ...##.. ...##.. ...##.. ...##.. ...##.. ..##... .##....'],
  '[': [2, '.####.. .##.... .##.... .##.... .##.... .##.... .##.... .##.... .##.... .####..'],
  ']': [2, '.####.. ...##.. ...##.. ...##.. ...##.. ...##.. ...##.. ...##.. ...##.. .####..'],
  '<': [3, '....##. ...##.. ..##... .##.... ##..... .##.... ..##... ...##.. ....##.'],
  '>': [3, '.##.... ..##... ...##.. ....##. .....## ....##. ...##.. ..##... .##....'],
  '#': [2, '.##.##. .##.##. ####### .##.##. .##.##. .##.##. ####### .##.##. .##.##.'],
  '*': [5, '.##..##. ..####.. ######## ..####.. .##..##.'],
  '+': [5, '...##... ...##... .######. ...##... ...##...'],
  '=': [6, '.######. ........ ........ .######.'],
  '&': [2, '.###... ##.##.. ##.##.. .###... .###.## ##.###. ##..##. ##..##. ##..##. .###.##'],
  '%': [2, '.##....# #..#..## #..#.##. .##.##.. ...##... ..##.##. .##.#..# ##..#..# #....##.'],
  '~': [6, '.###.## ##.###.'],
  '·': [7, '...##... ...##...'],
  '♪': [3, '...##... ...###.. ...####. ...##.##. ...##..#. ...##... ...##... .####... #####... .###....'],
};
for (const [ch, [top, rows]] of Object.entries(PUNCT)) def(ch, top, rows);
FONT.set(' ', new Array(16).fill(0));
// two frames of a text-mode gull, on private code points: wings up, wings level
const GULL_UP = '\u0001', GULL_LEVEL = '\u0002';
def(GULL_UP, 5, '#......# .#....#. ..#..#.. ...##...');
def(GULL_LEVEL, 7, '.##..##. #..##..#');

// Box drawing: single lines on row 7 / column 3.
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

// One glyph registry per SVG file.
function glyphSet() {
  const ids = new Map();
  return {
    id(ch) {
      if (!FONT.has(ch)) throw new Error(`no glyph for ${JSON.stringify(ch)} (U+${ch.codePointAt(0).toString(16)})`);
      if (!ids.has(ch)) ids.set(ch, `g${ids.size.toString(36)}`);
      return ids.get(ch);
    },
    defs() { return [...ids].map(([ch, id]) => `<path id="${id}" d="${glyphPath(FONT.get(ch))}"/>`).join(''); },
  };
}

// ---------------------------------------------------------------------------------------------
// Text screens. A line of markup switches colour with {k}: k is one of the keys below.
// ---------------------------------------------------------------------------------------------
const KEY = { k: BLK, b: BLU, g: GRN, c: CYN, r: RED, m: MAG, n: BRN, l: LGR, d: DGR, B: LBL, G: LGN, C: LCY, R: LRD, M: LMG, Y: YEL, W: WHT };
function parse(markup, fg) {
  const out = [];
  const re = /\{([a-zA-Z])\}/g;
  let last = 0, m;
  while ((m = re.exec(markup))) {
    if (m.index > last) out.push([markup.slice(last, m.index), fg]);
    if (!(m[1] in KEY)) throw new Error(`bad colour key ${m[1]}`);
    fg = KEY[m[1]];
    last = re.lastIndex;
  }
  if (last < markup.length) out.push([markup.slice(last), fg]);
  return out;
}
const vis = (markup) => parse(markup, 0).map(([t]) => t).join('');
class Screen {
  constructor(name) { this.name = name; this.cells = new Map(); }
  put(r, c, str, fg) {
    for (const ch of str) {
      if (c < 0 || c >= COLS || r < 0 || r >= ROWS) throw new Error(`${this.name}: off screen at ${r},${c}: ${str}`);
      if (ch !== ' ') this.cells.set(r * COLS + c, { ch, fg });
      else this.cells.delete(r * COLS + c);
      c++;
    }
    return c;
  }
  // markup at (r, c); `max` is the last column the line may reach
  mk(r, c, markup, fg = GRN, max = COLS - 1) {
    const w = [...vis(markup)].length;
    if (c + w - 1 > max) throw new Error(`${this.name}: row ${r} runs to col ${c + w - 1} (max ${max}): ${vis(markup)}`);
    for (const [t, f] of parse(markup, fg)) c = this.put(r, c, t, f);
    return c;
  }
  // a choice: "(W)ait" with the bracketed hotkey anywhere inside the word
  choice(r, c, text, max) {
    const m = /^(.*?)\((.)\)(.*)$/.exec(text);
    if (!m) throw new Error(`no hotkey in ${text}`);
    return this.mk(r, c, `{g}${m[1]}{m}({M}${m[2]}{m}){g}${m[3]}`, GRN, max);
  }
  // emit as <use> glyphs grouped by colour, then by row
  svg(G) {
    const byFg = new Map();
    for (const [k, { ch, fg }] of this.cells) {
      const r = Math.floor(k / COLS), c = k % COLS;
      if (!byFg.has(fg)) byFg.set(fg, new Map());
      const rows = byFg.get(fg);
      if (!rows.has(r)) rows.set(r, []);
      rows.get(r).push([c, ch]);
    }
    let out = '';
    for (const [fg, rows] of [...byFg].sort((a, b) => a[0] - b[0])) {
      out += `<g class="f${fg}">`;
      for (const [r, cells] of [...rows].sort((a, b) => a[0] - b[0])) {
        cells.sort((a, b) => a[0] - b[0]);
        out += `<g transform="translate(0 ${r * CH})">${cells.map(([c, ch]) => `<use href="#${G.id(ch)}" x="${c * CW}"/>`).join('')}</g>`;
      }
      out += '</g>';
    }
    return out;
  }
}
// One string as glyphs at a cell (for small animated bits: typed keys, counters).
function glyphs(G, r, c, str, fg) {
  let out = `<g class="f${fg}">`;
  for (const ch of str) { if (ch !== ' ') out += `<use href="#${G.id(ch)}" x="${c * CW}" y="${r * CH}"/>`; c++; }
  return out + '</g>';
}
const rule = (n) => Array.from({ length: n }, (_, i) => (i % 2 ? '=' : '-')).join('');

// ---------------------------------------------------------------------------------------------
// Pixels: a canvas of palette indices or CP437 shade dithers {fg, bg, shade}.
// ---------------------------------------------------------------------------------------------
const dith = (fg, bg, shade) => ({ fg, bg, shade });
const canvas = (w, h) => ({ w, h, px: Array.from({ length: h }, () => new Array(w).fill(null)) });
const setPx = (cv, x, y, v) => { if (x >= 0 && y >= 0 && x < cv.w && y < cv.h) cv.px[y][x] = v; };
const SHADES = { '░': ['..#.', '#...'], '▒': ['#.#.', '.#.#'], '▓': ['##.#', '.###'] };
const SHADE_KEY = { '░': 'a', '▒': 'b', '▓': 'c' };
function patternBank() {
  const pats = new Map();
  return {
    id(fg, shade) {
      const id = `s${fg.toString(16)}${SHADE_KEY[shade]}`;
      if (!pats.has(id)) {
        const p = SHADES[shade];
        pats.set(id, `<pattern id="${id}" width="4" height="2" patternUnits="userSpaceOnUse"><path d="${bitmapPath(p.map((row) => (x) => row[x] === '#'), 4)}" fill="${PAL[fg]}"/></pattern>`);
      }
      return id;
    },
    defs() { return [...pats.values()].join(''); },
  };
}
function ptsPath(pts, ox, oy) {
  const set = new Set(pts.map(([x, y]) => `${x},${y}`));
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (const [x, y] of pts) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  const rows = Array.from({ length: y1 - y0 + 1 }, (_, y) => (x) => set.has(`${x + x0},${y + y0}`));
  return bitmapPath(rows, x1 - x0 + 1, PX, PX, ox + x0 * PX, oy + y0 * PX);
}
// ox, oy in screen pixels
function emitPixels(P, cv, ox = 0, oy = 0) {
  const solid = new Map(), pat = new Map();
  const add = (m, k, x, y) => { if (!m.has(k)) m.set(k, []); m.get(k).push([x, y]); };
  for (let y = 0; y < cv.h; y++) {
    for (let x = 0; x < cv.w; x++) {
      const v = cv.px[y][x];
      if (v == null) continue;
      if (typeof v === 'number') add(solid, v, x, y);
      else { if (v.bg != null) add(solid, v.bg, x, y); add(pat, P.id(v.fg, v.shade), x, y); }
    }
  }
  let out = '';
  for (const [c, pts] of solid) out += `<path class="f${c}" d="${ptsPath(pts, ox, oy)}"/>`;
  for (const [id, pts] of pat) out += `<path fill="url(#${id})" d="${ptsPath(pts, ox, oy)}"/>`;
  return out;
}
// Sprites: one character per pixel.
const SKIN = dith(YEL, LRD, '▒');
const CREAM = dith(YEL, WHT, '░');
const LEGEND = {
  '.': null, K: BLK, b: BLU, g: GRN, c: CYN, r: RED, m: MAG, n: BRN, l: LGR, d: DGR,
  B: LBL, G: LGN, C: LCY, R: LRD, M: LMG, Y: YEL, W: WHT,
  p: SKIN, w: CREAM,
  s: dith(YEL, BRN, '░'),          // sand in shadow
  t: dith(BRN, RED, '▒'),          // palm bark, the darker band
  f: dith(WHT, LCY, '▒'),          // spray
  o: dith(GRN, BRN, '▒'),          // coconut
};
function sprite(rows) {
  const cv = canvas(Math.max(...rows.map((r) => r.length)), rows.length);
  rows.forEach((row, y) => [...row].forEach((ch, x) => {
    if (!(ch in LEGEND)) throw new Error(`sprite legend has no ${ch}`);
    if (LEGEND[ch] !== null) cv.px[y][x] = LEGEND[ch];
  }));
  return cv;
}
const mirror = (rows) => rows.map((r) => [...r].reverse().join(''));
const stamp = (cv, spr, ox, oy) => { for (let y = 0; y < spr.h; y++) for (let x = 0; x < spr.w; x++) if (spr.px[y][x] != null) setPx(cv, ox + x, oy + y, spr.px[y][x]); };

// ---------------------------------------------------------------------------------------------
// Animation: CSS keyframes on the 39 s loop, all stepped. A class per distinct timeline.
// The base (non-animated) style of everything is its state at t = 0, so with reduced motion
// the screen rests on the complete title.
// ---------------------------------------------------------------------------------------------
function animBank() {
  const rules = [];
  const seen = new Map();
  const pc = (t) => `${+((t / LOOP) * 100).toFixed(4)}%`;
  const add = (body, base, dur = LOOP, timing = 'step-end') => {
    const key = `${body}|${base}|${dur}|${timing}`;
    if (seen.has(key)) return seen.get(key);
    const name = `a${seen.size.toString(36)}`;
    seen.set(key, name);
    rules.push(`@keyframes ${name}{${body}}.${name}{${base}animation:${name} ${dur}s ${timing} infinite}`);
    return name;
  };
  return {
    // visible inside the windows [[t0, t1], ...] (seconds, within one loop)
    show(windows) {
      const inside = (t) => windows.some(([a, b]) => a <= t && t < b);
      const ts = new Set([0]);
      for (const [a, b] of windows) { ts.add(a); if (b < LOOP) ts.add(b); }
      const pts = [...ts].filter((t) => t < LOOP).sort((a, b) => a - b);
      const body = pts.map((t) => `${pc(t)}{opacity:${inside(t) ? 1 : 0}}`).join('') + `100%{opacity:${inside(0) ? 1 : 0}}`;
      return add(body, `opacity:${inside(0) ? 1 : 0};`);
    },
    // stepped transforms: keys = [[t, 'translate(...)'], ...], first key at t = 0
    move(keys, dur = LOOP) {
      const body = keys.map(([t, tr]) => `${pc((t / dur) * LOOP)}{transform:${tr}}`).join('') + `100%{transform:${keys[0][1]}}`;
      return add(body, `transform:${keys[0][1]};`, dur);
    },
    raw(name, body, base, dur, timing) { return add(body, base, dur, timing); },
    pc,
    css() { return rules.join(''); },
  };
}

// ---------------------------------------------------------------------------------------------
// THE TITLE SCREEN (the art is on the 80 x 50 half-block grid)
// ---------------------------------------------------------------------------------------------
// Stencil block letters, 10 tall, my own: bridges cut through the bars (C, S), the apex (A),
// under the T's bar and across the Y. Rows 8-9 are the grey underside of each letter.
const LOGO_FONT = {
  C: ['..####.####', '.#####.####', '###........', '###........', '###........', '###........', '###........', '###........', '.#####.####', '..####.####'],
  A: ['...##.##...', '..###.###..', '.###...###.', '###.....###', '###.....###', '###########', '###########', '###.....###', '###.....###', '###.....###'],
  S: ['..####.####', '.#####.####', '###........', '###........', '.#########.', '..#########', '........###', '........###', '####.#####.', '####.####..'],
  T: ['###########', '###########', '...........', '....###....', '....###....', '....###....', '....###....', '....###....', '....###....', '....###....'],
  W: ['###.......###', '###.......###', '###.......###', '###..###..###', '###..###..###', '###..###..###', '###..###..###', '###..###..###', '######.######', '.#####.#####.'],
  Y: ['###.....###', '###.....###', '###.....###', '.###...###.', '..#######..', '...........', '....###....', '....###....', '....###....', '....###....'],
};
function logoWord(cv, word, ox, oy) {
  let x = ox;
  for (const ch of word) {
    const L = LOGO_FONT[ch];
    L.forEach((row, y) => [...row].forEach((v, dx) => { if (v === '#') setPx(cv, x + dx, oy + y, y >= 8 ? LGR : WHT); }));
    x += L[0].length + 1;
  }
  return x - 1;
}
// Grey undersides: a dark-grey lip under every downward-facing edge.
function underside(cv, colour) {
  const lip = [];
  for (let y = 0; y < cv.h; y++) for (let x = 0; x < cv.w; x++) {
    if (cv.px[y][x] != null && y + 1 < cv.h && cv.px[y + 1][x] == null) lip.push([x, y + 1]);
  }
  for (const [x, y] of lip) cv.px[y][x] = colour;
}
// Red numerals, 3 x 5, with a dark-red underside row.
const DIGITS = {
  0: ['###', '#.#', '#.#', '#.#', '###'], 1: ['##.', '.#.', '.#.', '.#.', '###'],
  ':': ['.', '#', '.', '#', '.'],
};
function numerals(cv, str, ox, oy) {
  let x = ox;
  for (const ch of str) {
    const D = DIGITS[ch];
    D.forEach((row, y) => [...row].forEach((v, dx) => { if (v === '#') setPx(cv, x + dx, oy + y, y === 4 ? RED : LRD); }));
    x += D[0].length + 1;
  }
  return x - 1;
}

// Her, front on, 5 px wide and 10 tall: brown hair falling past a loose low bun, cream
// headphones, a coral tank top (bare shoulders), cream shorts, bare feet. The head (rows 0-2)
// is split off so she can nod on the beat. Throw poses add an arm on the sea side.
const HER_HEAD = ['.nnn.', 'wnppw', 'wpppw'];
const HER_BODY = ['.npn.', 'pRRRp', 'pRRRp', 'pRRRp', '.www.', '.p.p.', '.p.p.'];
const HEAD_HOLD = ['.nnn..G', 'wnppw.g', 'wpppwp.'];      // arm up, the bottle in her hand
const BODY_HOLD = ['.npnp..', 'pRRRp..', 'pRRR...', 'pRRR...', '.www...', '.p.p...', '.p.p...'];
const BODY_THROWN = ['.npn...', 'pRRRppp', 'pRRR...', 'pRRR...', '.www...', '.p.p...', '.p..p..'];
const HEAD_LOOK = ['.nnn...', 'wnppwp.', 'wpppwp.'];      // a hand up to shade her eyes
const BODY_LOOK = ['.npnp..', 'pRRRp..', 'pRRR...', 'pRRR...', '.www...', '.p.p...', '.p.p...'];

// The palm: a slender, segmented trunk with a gentle lean, and a crown of arching fronds, each
// a bright spine with darker leaflets hanging under it.
const FRONDS = [
  [[-1, -1], [-2, -2], [-3, -2], [-4, -2], [-5, -2], [-6, -1], [-7, -1], [-8, 0], [-9, 1], [-10, 2], [-10, 3]],
  [[-1, 0], [-2, 0], [-3, 1], [-4, 1], [-5, 2], [-6, 3], [-6, 4]],
  [[0, -1], [0, -2], [1, -3], [2, -3], [3, -3], [4, -2]],
  [[1, -1], [2, -2], [3, -2], [4, -2], [5, -1], [6, -1], [7, 0], [8, 1], [9, 2], [9, 3]],
  [[1, 0], [2, 1], [3, 1], [4, 2], [5, 2], [6, 3], [7, 4], [7, 5]],
  [[-2, -1], [-3, -3], [-4, -3], [-5, -3]],
];
function palm(cv, baseX, baseY, topX, topY, fronds = FRONDS) {
  const h = baseY - topY;
  for (let y = baseY; y >= topY; y--) {
    const t = (baseY - y) / h;
    const x = Math.round(baseX + (topX - baseX) * t * t);
    const band = (baseY - y) % 3 === 2;
    setPx(cv, x, y, band ? LEGEND.t : BRN);
    if (t < 0.4) setPx(cv, x + 1, y, band ? RED : LEGEND.t);
  }
  for (const f of fronds) {
    f.forEach(([dx, dy], i) => {
      const x = topX + dx, y = topY + dy;
      if (i >= 2 && i < f.length - 1) setPx(cv, x, y + 1, GRN);
    });
  }
  for (const f of fronds) f.forEach(([dx, dy], i) => setPx(cv, topX + dx, topY + dy, i === f.length - 1 ? GRN : LGN));
  setPx(cv, topX, topY, GRN);
  setPx(cv, topX - 1, topY + 1, LEGEND.o); setPx(cv, topX + 1, topY + 1, LEGEND.o); setPx(cv, topX, topY + 1, BRN);
}

function titleScreen(G, P, A) {
  const S = new Screen('title');
  const cv = canvas(COLS, ROWS * 2);
  // the sun's limb, top right, in shade-character rings
  const SUN = { x: 85, y: -7, r: 15 };
  for (let y = 0; y < 26; y++) for (let x = 52; x < COLS; x++) {
    const d = Math.hypot((x + 0.5 - SUN.x) * 1, (y + 0.5 - SUN.y) * 1);
    let v = null;
    if (d < SUN.r) v = YEL;
    else if (d < SUN.r + 1.4) v = dith(WHT, YEL, '░');
    else if (d < SUN.r + 2.6) v = dith(YEL, BRN, '▓');
    else if (d < SUN.r + 3.8) v = dith(YEL, BRN, '▒');
    else if (d < SUN.r + 5.0) v = dith(BRN, null, '▓');
    else if (d < SUN.r + 6.4) v = dith(BRN, null, '▒');
    else if (d < SUN.r + 8.0) v = dith(BRN, null, '░');
    if (v != null) setPx(cv, x, y, v);
  }
  // the logo: CAST over AWAY, the second word stepped right
  const logo = canvas(COLS, ROWS * 2);
  const castEnd = logoWord(logo, 'CAST', 2, 2);
  const awayEnd = logoWord(logo, 'AWAY', 6, 15);
  underside(logo, DGR);
  const digits = canvas(COLS, ROWS * 2);
  const digEnd = numerals(digits, '10:00:00', 2, 30);
  underside(digits, DGR);
  if (castEnd > 52 || awayEnd > 56) throw new Error(`logo too wide: ${castEnd} ${awayEnd}`);

  // the island: sand, foam, a raft, the palm (in front of the sun), and her
  const isl = canvas(COLS, ROWS * 2);
  const HZ = 37;                              // horizon, px row
  for (let y = HZ + 1; y <= HZ + 3; y++) {
    const half = [8, 10, 9][y - HZ - 1];
    const cx = 68;
    for (let x = cx - half; x <= cx + half; x++) {
      const edge = x === cx - half || x === cx + half;
      setPx(isl, x, y, y === HZ + 3 ? (edge ? null : LEGEND.s) : edge ? LEGEND.s : YEL);
    }
  }
  // foam round the sand
  for (const [x, y] of [[59, 39], [58, 40], [59, 41], [60, 41], [77, 40], [78, 39], [76, 41], [75, 41], [61, 41], [74, 41]]) setPx(isl, x, y, WHT);
  // a scrap of green at the back of the sand
  for (const [x, y, c] of [[64, 38, GRN], [65, 38, LGN], [73, 38, GRN], [74, 38, LGN], [72, 38, GRN]]) setPx(isl, x, y, c);
  // the raft, moored on the right: logs end on, lashed; it stops two columns short of the
  // screen's right edge so it reads as floating, not cut off by the frame
  stamp(isl, sprite(['.n.n.n', 'ntntnt', 'dddddd']), 72, 40);
  palm(isl, 70, 38, 67, 13);
  const herBody = canvas(COLS, ROWS * 2);
  stamp(herBody, sprite(HER_BODY), 60, 31);
  const herHead = canvas(COLS, ROWS * 2);
  stamp(herHead, sprite(HER_HEAD), 60, 28);

  // the passing ship: a grey silhouette on the horizon
  const ship = canvas(14, 5);
  stamp(ship, sprite(['.....dd.....', '..lllllll...', 'dddddddddddd', '.dddddddddd.']), 0, 0);

  // thin speed lines for the sea, scrolling a column per beat
  const rnd = prng(1992);
  const PER = 16;                             // pattern repeats every 16 columns
  const sea = [];
  const seaRows = [
    { y: HZ * PX + 2, c: LBL, h: 2, dash: [10, 16] },
    { y: HZ * PX + 9, c: BLU, h: 2, dash: [2, 6] },
    { y: HZ * PX + 16, c: BLU, h: 2, dash: [3, 7] },
    { y: HZ * PX + 23, c: LBL, h: 2, dash: [2, 5] },
    { y: HZ * PX + 31, c: CYN, h: 2, dash: [2, 6] },
    { y: HZ * PX + 39, c: LBL, h: 2, dash: [3, 8] },
    { y: HZ * PX + 48, c: CYN, h: 2, dash: [3, 7] },
    { y: HZ * PX + 58, c: LCY, h: 2, dash: [2, 5] },
  ];
  const seaByC = new Map();
  for (const row of seaRows) {
    // one period of dashes, tiled across the width plus one period
    const segs = [];
    let x = Math.floor(rnd() * 4);
    while (x < PER) {
      const len = row.dash[0] + Math.floor(rnd() * (row.dash[1] - row.dash[0] + 1));
      const gap = 1 + Math.floor(rnd() * 3);
      segs.push([x, Math.min(len, PER - x)]);
      x += len + gap;
    }
    if (row === seaRows[0]) { segs.length = 0; segs.push([0, PER]); }   // the horizon is unbroken
    let d = '';
    for (let k = 0; k * PER < COLS + PER; k++) for (const [sx, len] of segs) d += `M${(k * PER + sx) * CW} ${row.y}h${len * CW}v${row.h}h${-len * CW}z`;
    seaByC.set(row.c, (seaByC.get(row.c) || '') + d);
  }
  for (const [c, d] of seaByC) sea.push(`<path class="f${c}" d="${d}"/>`);
  const seaScroll = A.raw('sea', `0%{transform:translateX(0)}100%{transform:translateX(${-PER * CW}px)}`, 'transform:translateX(0);', 12, `steps(${PER},end)`);

  // glints: single dots on the water, three sets twinkling a beat apart
  const glint = [[], [], []];
  for (let i = 0; i < 18; i++) {
    const x = Math.floor(rnd() * 56) * CW + 3;
    const y = HZ * PX + 5 + Math.floor(rnd() * 7) * 8;
    glint[i % 3].push(`M${x} ${y}h2v2h-2z`);
  }
  const glints = glint.map((ds, i) => {
    const cls = A.raw(`gl${i}`, `0%{opacity:${i === 0 ? 1 : 0}}${A.pc(0)}{opacity:${i === 0 ? 1 : 0}}33.333%{opacity:${i === 1 ? 1 : 0}}66.667%{opacity:${i === 2 ? 1 : 0}}`, `opacity:${i === 0 ? 1 : 0};`, 3 * BEAT);
    return `<path class="f${WHT} ${cls}" d="${ds.join('')}"/>`;
  }).join('');

  // words on the title
  S.mk(13, 6, '{C}a ten-hour lo-fi island video {d}·{C} one turn a day', CYN, 56);
  S.mk(15, 30, '{W}TIME LEFT TODAY', WHT, 57);
  S.mk(16, 30, '{l}one turn, ten hours long', LGR, 57);
  S.mk(23, 1, '{l}Windward Doorworks {d}·{l} registered to one tall palm {d}·{Y} always daytime', LGR, 78);
  const promptEnd = S.mk(24, 1, '{M}[Any key. Or no key: waiting counts.]', LMG, 78);

  // motion: the ship slides a column per beat while the title is up, the cloud a column a bar,
  // and she nods on every beat.
  const shipKeys = [];
  for (let k = 0; k * BEAT < T.islandAt; k++) shipKeys.push([k * BEAT, `translateX(${k * PX}px)`]);
  shipKeys.push([T.titleAt, 'translateX(0px)']);
  const shipMove = A.move(shipKeys);
  // three text-mode gulls near the sun, flapping on alternate beats
  const flapA = A.raw('flapA', '0%{opacity:1}50%{opacity:0}', 'opacity:1;', 2 * BEAT);
  const flapB = A.raw('flapB', '0%{opacity:0}50%{opacity:1}', 'opacity:0;', 2 * BEAT);
  const gulls = [[3, 51, LGR], [5, 55, WHT], [2, 57, LGR]].map(([r, c, f], i) =>
    `<g class="${i % 2 ? flapB : flapA}">${glyphs(G, r, c, GULL_UP, f)}</g><g class="${i % 2 ? flapA : flapB}">${glyphs(G, r, c, GULL_LEVEL, f)}</g>`).join('');
  const nod = A.raw('nod', `0%{transform:translateY(${PX}px)}50%{transform:translateY(0)}`, 'transform:translateY(0);', BEAT);

  const shipX = 32, shipY = HZ - 3;
  const cursor = `<g class="${A.raw('blink', '0%{opacity:1}50%{opacity:0}', 'opacity:1;', BEAT)}"><rect class="f${WHT}" x="${promptEnd * CW + 1}" y="${24 * CH + 12}" width="7" height="3"/></g>`;
  return `
<g clip-path="url(#seaClip)"><g class="${seaScroll}">${sea.join('')}</g></g>${glints}
${emitPixels(P, cv)}
${gulls}
<g class="${shipMove}">${emitPixels(P, ship, shipX * PX, shipY * PX)}</g>
${emitPixels(P, isl)}${emitPixels(P, herBody)}<g class="${nod}">${emitPixels(P, herHead)}</g>
${emitPixels(P, logo)}${emitPixels(P, digits)}
${S.svg(G)}${cursor}`;
}

// ---------------------------------------------------------------------------------------------
// THE LOCATION SCREEN
// ---------------------------------------------------------------------------------------------
function islandScreen(G, A) {
  const S = new Screen('island');
  S.mk(1, 1, '{W}Castaway{l} - {G}Under the Palm', WHT);
  S.mk(1, 66, '{d}Day {l}1{d} of {l}1', DGR);
  S.put(2, 1, rule(78), BLU);
  const story = [
    'You are on a very small island. There is {G}one tall palm{g}, a raft, and a',
    'great deal of time. Your headphones are playing something in F major at',
    '80 beats a minute, and you are {G}nodding along{g}. Every so often, on the next',
    'bar of the music, {G}something happens{g}. Mostly it does not. That is the game.',
    'In the sand at your feet: one empty bottle, and one short, polite note...',
  ];
  story.forEach((l, i) => S.mk(4 + i, 1, l, GRN, 78));
  const choices = [
    ['(W)ait for something', '(C)oconut: have one', '(P)alm: climb for signal'],
    ['(N)od to the beat', '(F)ish from the shore', '(K)umara: still growing'],
    ['(B)ottle: send the note', '(S)andcastle vs tide', 'Ha(m)mock: find 2nd tree'],
    ['(J)og a short lap', 'Wave for (R)escue', '(L)eave (any time)'],
    ['(V)iew stats', '(?) Help', '(Q)uit to the board'],
  ];
  choices.forEach((row, i) => row.forEach((t, j) => S.choice(10 + i, 2 + j * 26, t, 1 + (j + 1) * 26)));
  S.mk(16, 1, '{n}Day {Y}1{n} of {Y}1{n}  ·  Turns left {Y}1{n} (ten hours long)  ·  Signal {Y}none{n} (try the palm)', BRN, 78);
  const pEnd = S.mk(18, 1, '{M}[        left] Your move, castaway ({Y}?{M} for menu) [{Y}W{M}]: ', LMG, 78);
  S.mk(18, 2, '{W}9:59:', WHT);
  S.mk(24, 1, '{d}Port Nowhere BBS · node 1 of 1 · sysop Spindrift · a Windward Doorworks door', DGR, 78);

  // the clock: seconds tick down while you think (9:59:51 at 9 s ... 9:59:37 at 23 s)
  const n = T.storyAt - T.islandAt;
  let strip = '';
  for (let k = 0; k < n; k++) {
    const s = String(60 - T.islandAt - k).padStart(2, '0');
    strip += glyphs(G, 0, 0, s, WHT).replace('<g ', `<g transform="translate(0 ${k * CH})" `);
  }
  const tick = A.raw('tick', `0%{transform:translateY(0)}${A.pc(T.islandAt)}{transform:translateY(0);animation-timing-function:steps(${n},end)}${A.pc(T.storyAt)}{transform:translateY(${-n * CH}px)}`, 'transform:translateY(0);', LOOP);
  const clock = `<g transform="translate(${7 * CW} ${18 * CH})"><g clip-path="url(#clockClip)"><g class="${tick}">${strip}</g></g></g>`;

  // the typed key, and the cursor before and after it
  const blink = A.raw('blink', '0%{opacity:1}50%{opacity:0}', 'opacity:1;', BEAT);
  const cur = (c) => `<g class="${blink}"><rect class="f${WHT}" x="${c * CW + 1}" y="${18 * CH + 12}" width="7" height="3"/></g>`;
  const typed = `<g class="${A.show([[T.keyAt, T.storyAt]])}">${glyphs(G, 18, pEnd, 'B', WHT)}${cur(pEnd + 1)}</g>`;
  const before = `<g class="${A.show([[T.islandAt, T.keyAt]])}">${cur(pEnd)}</g>`;
  // the door echoes the choice, a beat after the key
  const echo = `<g class="${A.show([[T.keyAt + BEAT, T.storyAt]])}">${glyphs(G, 20, 1, 'You pick up the bottle, and the note...', GRN)}</g>`;
  return S.svg(G) + clock + typed + before + echo;
}

// ---------------------------------------------------------------------------------------------
// THE STORY SCREEN: two vignettes, the bottle going out and the bottle coming back
// ---------------------------------------------------------------------------------------------
const VW = 30, VH = 14;                       // each vignette: 30 x 7 cells = 30 x 14 pixels
// Sky in shade steps from periwinkle to aqua, a horizon, then the sea darkening and paling
// towards the shore, with a few deliberate wave dashes.
function seaBackdrop(horizon, waves, w = VW, h = VH) {
  const cv = canvas(w, h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let v;
    if (y < horizon) v = y === 0 ? LBL : y === 1 ? dith(LCY, LBL, '▒') : y === 2 ? dith(LCY, LBL, '▓') : LCY;
    else if (y === horizon) v = dith(LBL, BLU, '▒');
    else {
      const d = y - horizon;
      v = d <= 2 ? BLU : d === 3 ? dith(CYN, BLU, '░') : d === 4 ? dith(CYN, BLU, '▒') : d === 5 ? dith(CYN, BLU, '▓') : CYN;
    }
    cv.px[y][x] = v;
  }
  for (const [x, y, n] of waves) for (let i = 0; i < n; i++) setPx(cv, x + i, y, y - horizon <= 3 ? LBL : LCY);
  return cv;
}
// clouds sitting low over the horizon, as in the project's own scene
function lowClouds(cv, y, xs) {
  for (const x of xs) stamp(cv, sprite(['..WW....', '.WWWWW.W', 'WWWWWWWW', '.ffffff.']), x, y);
}
function storyScreen(G, P, A) {
  const S = new Screen('story');
  S.mk(1, 1, "{W}Castaway{l} - {G}The Water's Edge", WHT);
  S.mk(1, 66, '{d}Day {l}1{d} of {l}1', DGR);
  S.put(2, 1, rule(78), BLU);
  const B1 = { r: 3, c: 1 }, B2 = { r: 12, c: 1 };
  for (const b of [B1, B2]) {
    S.put(b.r, b.c, '┌' + '─'.repeat(VW) + '┐', BLU);
    for (let i = 1; i <= VH / 2; i++) { S.put(b.r + i, b.c, '│', BLU); S.put(b.r + i, b.c + VW + 1, '│', BLU); }
    S.put(b.r + VH / 2 + 1, b.c, '└' + '─'.repeat(VW) + '┘', BLU);
  }
  const N1 = [
    'You fold the note twice, roll it up, push it',
    'into the bottle and cork it. Then you throw',
    'it as far as you can. It is a {G}lovely throw{g},',
    'maybe your best. You watch it bob away, past',
    'the reef, towards the horizon, and right out',
    'of the story...',
  ];
  const N2 = [
    '...and then {G}straight back into it{g}. The tide',
    'sets the bottle down at your feet, unopened,',
    'the way a cat brings you a present. You nod.',
    'That seems fair. Somewhere out there, hours',
    'from now, another bottle is writing back.',
    'It is in no hurry. Neither are you...',
  ];
  N1.forEach((l, i) => S.mk(B1.r + 1 + i, 35, l, GRN, 78));
  // the second paragraph prints only when the bottle comes back into the story
  const S2 = new Screen('story, part 2');
  N2.forEach((l, i) => S2.mk(B2.r + 2 + i, 35, l, GRN, 78));
  const sEnd = S.mk(22, 1, '{n}Bottles thrown {Y}1{n}  ·  Bottles back {Y} {n}  ·  Replies: due in a few hours', BRN, 78);
  const backCol = 1 + vis('Bottles thrown 1  ·  Bottles back ').length;
  const pEnd = S.mk(24, 1, '{M}[Press any key to keep waiting]', LMG, 78);

  const o1 = { x: (B1.c + 1) * CW, y: (B1.r + 1) * CH };
  const o2 = { x: (B2.c + 1) * CW, y: (B2.r + 1) * CH };
  const bank = []; // [svg, windows]
  const at = (k) => beatAt(k);
  const END = T.titleAt;
  // a bottle: dark green glass and a brown cork against the sky, bright glass and a white
  // glint on the water; lying down when it is in the air or on the sand
  const bottle = (x, y, lying, onSea) => {
    const c = canvas(VW, VH);
    const [glass, cork] = onSea ? [LGN, WHT] : [GRN, BRN];
    if (lying) { setPx(c, x, y, glass); setPx(c, x + 1, y, glass); setPx(c, x + 2, y, cork); } else { setPx(c, x, y, cork); setPx(c, x, y + 1, glass); }
    return c;
  };

  // Vignette 1: on the sand under the palm, she throws; the bottle arcs out and lands far off.
  const HZ1 = 8;
  const v1 = seaBackdrop(HZ1, [[15, 10, 3], [22, 11, 2], [18, 12, 3], [27, 10, 2], [25, 13, 3]]);
  stamp(v1, sprite(['..YYY', '.YYYY', '..YYY']), 25, 0);         // the sun, half out of frame
  for (const [x, y] of [[24, 0], [23, 1], [24, 2], [25, 3], [26, 3], [27, 3], [28, 3], [29, 3], [24, 3]]) setPx(v1, x, y, dith(YEL, LCY, '░'));
  lowClouds(v1, 3, [13, 21]);
  for (let y = 10; y < VH; y++) {                                // the sand, bottom left
    const end = [11, 13, 14, 15][y - 10];
    for (let x = 0; x <= end; x++) v1.px[y][x] = y === 10 && x >= end - 1 ? LEGEND.s : YEL;
    setPx(v1, end + 1, y, WHT);
    setPx(v1, end + 2, y, LEGEND.f);
  }
  palm(v1, 2, 11, 1, 1, [
    [[1, 0], [2, 0], [3, 0], [4, 1], [5, 2]], [[-1, 0], [-1, 1], [-1, 2]],
    [[1, -1], [2, -1], [3, -1], [4, -1]], [[0, -1], [-1, -1]],
  ]);
  bank.push([emitPixels(P, v1, o1.x, o1.y), null]);
  const HX = 7, HY = 2;                                          // her, head at (7, 2), feet on row 11
  const pose = (head, body) => { const c = canvas(VW, VH); stamp(c, sprite(head), HX, HY); stamp(c, sprite(body), HX, HY + 3); return c; };
  bank.push([emitPixels(P, pose(HEAD_HOLD, BODY_HOLD), o1.x, o1.y), [[T.storyAt, at(2)]]]);
  bank.push([emitPixels(P, pose(HER_HEAD, BODY_THROWN), o1.x, o1.y), [[at(2), at(5)]]]);
  bank.push([emitPixels(P, pose(HEAD_LOOK, BODY_LOOK), o1.x, o1.y), [[at(5), END]]]);
  // the flight, one position a beat, then a splash far out, then bobbing on the swell
  const flight = [[15, 0, 1], [19, 0, 1], [22, 2, 0], [25, 5, 0]];
  flight.forEach(([x, y, ly], i) => bank.push([emitPixels(P, bottle(x, y, ly, false), o1.x, o1.y), [[at(2 + i), at(3 + i)]]]));
  const splash = canvas(VW, VH); stamp(splash, sprite(['W.W.W', '.WfW.']), 24, HZ1);
  bank.push([emitPixels(P, splash, o1.x, o1.y), [[at(6), at(7)]]]);
  // it bobs for two beats, shrinks to a dot on the horizon, and leaves the story; only then
  // does it start back in the second vignette (one bottle, never in two places at once)
  bank.push([emitPixels(P, bottle(26, HZ1 + 1, 0, true), o1.x, o1.y), [[at(7), at(8)]]]);
  bank.push([emitPixels(P, bottle(26, HZ1, 0, true), o1.x, o1.y), [[at(8), at(9)]]]);
  const dot = canvas(VW, VH); setPx(dot, 28, HZ1, LGN);
  bank.push([emitPixels(P, dot, o1.x, o1.y), [[at(9), at(10)]]]);

  // Vignette 2: the water's edge; the bottle rides a wave in and stops at her feet.
  const HZ2 = 6;
  const v2 = seaBackdrop(HZ2, [[3, 8, 3], [9, 9, 2], [2, 11, 3], [8, 12, 2]]);
  lowClouds(v2, 1, [1, 10]);
  const shore = { 7: 27, 8: 25, 9: 22, 10: 20, 11: 18, 12: 17, 13: 16 };   // first sand column per row
  for (let y = 7; y < VH; y++) {
    for (let x = shore[y]; x < VW; x++) v2.px[y][x] = x === shore[y] ? LEGEND.s : YEL;
    setPx(v2, shore[y] - 1, y, WHT);
    if (y > 9) setPx(v2, shore[y] - 2, y, LEGEND.f);
  }
  bank.push([emitPixels(P, v2, o2.x, o2.y), null]);
  const H2X = 23, H2Y = 3;                                       // feet on row 12
  const her2b = canvas(VW, VH); stamp(her2b, sprite(HER_BODY), H2X, H2Y + 3);
  const her2h = canvas(VW, VH); stamp(her2h, sprite(HER_HEAD), H2X, H2Y);
  bank.push([emitPixels(P, her2b, o2.x, o2.y), null]);
  const nod = A.raw('nod', `0%{transform:translateY(${PX}px)}50%{transform:translateY(0)}`, 'transform:translateY(0);', BEAT);
  bank.push([`<g class="${nod}">${emitPixels(P, her2h, o2.x, o2.y)}</g>`, null]);
  // the way back, starting the beat after it left the first vignette: far out, riding the
  // foam in, then lying on the sand by her feet
  const back = [[1, 7], [5, 8], [9, 9], [12, 10], [15, 11], [19, 12]];
  const startK = 10;
  back.forEach(([x, y], i) => {
    const home = i === back.length - 1;
    const c = bottle(x, y, 1, !home);
    if (i > 0 && !home) for (let dx = 1; dx <= 3; dx++) setPx(c, x - dx, y + 1, dx === 3 ? LEGEND.f : WHT);
    const win = home ? [[at(startK + i), END]] : [[at(startK + i), at(startK + i + 1)]];
    bank.push([emitPixels(P, c, o2.x, o2.y), win]);
  });
  const landed = at(startK + back.length - 1);

  // the counter in the status line: 0, then 1 once the bottle is home
  const zero = `<g class="${A.show([[T.storyAt, landed]])}">${glyphs(G, 22, backCol, '0', YEL)}</g>`;
  const one = `<g class="${A.show([[landed, END]])}">${glyphs(G, 22, backCol, '1', WHT)}</g>`;
  const blink = A.raw('blink', '0%{opacity:1}50%{opacity:0}', 'opacity:1;', BEAT);
  const cursor = `<g class="${blink}"><rect class="f${WHT}" x="${pEnd * CW + 1}" y="${24 * CH + 12}" width="7" height="3"/></g>`;
  const pieces = bank.map(([svg, win]) => (win ? `<g class="${A.show(win)}">${svg}</g>` : svg)).join('');
  void sEnd;
  const part2 = `<g class="${A.show([[at(startK), END]])}">${S2.svg(G)}</g>`;
  return pieces + S.svg(G) + part2 + zero + one + cursor;
}

// ---------------------------------------------------------------------------------------------
// Assemble the animated header
// ---------------------------------------------------------------------------------------------
function styleBlock(A) {
  const fills = PAL.map((c, i) => `.f${i}{fill:${c}}`).join('');
  return `<style>${fills}${A.css()}@media (prefers-reduced-motion:reduce){*{animation:none!important}}</style>`;
}
function frame(w, h, body, defs, style, title, desc) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-labelledby="t d" shape-rendering="crispEdges">
<title id="t">${title}</title><desc id="d">${desc}</desc>
<defs>${defs}</defs>${style}
<rect width="${w}" height="${h}" rx="12" fill="#000"/><rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="11" fill="none" stroke="#1b1b3a" stroke-width="2"/>
<g transform="translate(${PAD} ${PAD})">${body}</g>
</svg>
`;
}

function buildHeader() {
  const G = glyphSet(), P = patternBank(), A = animBank();
  const title = titleScreen(G, P, A);
  const island = islandScreen(G, A);
  const story = storyScreen(G, P, A);
  const showTitle = A.show([[0, T.islandAt], [T.titleAt, LOOP]]);
  const showIsland = A.show([[T.islandAt, T.storyAt]]);
  const showStory = A.show([[T.storyAt, T.titleAt]]);
  // the redraw: a black cover drops away a row at a time at each cut, like a screen painting
  // at modem speed. At t = 0 (and with reduced motion) it is out of sight below the screen.
  const cuts = [T.islandAt, T.storyAt, T.titleAt];
  let body = '0%{transform:translateY(400px)}';
  for (const t of cuts) body += `${A.pc(t)}{transform:translateY(0);animation-timing-function:steps(${ROWS},end)}${A.pc(t + T.draw)}{transform:translateY(${SH}px)}`;
  const cover = A.raw('cover', body.replace(/100%\{[^}]*\}$/, ''), `transform:translateY(${SH}px);`, LOOP);
  const defs = `<clipPath id="scr"><rect width="${SW}" height="${SH}"/></clipPath>`
    + `<clipPath id="seaClip"><rect y="${37 * PX}" width="${SW}" height="${9 * PX + 4}"/></clipPath>`
    + `<clipPath id="clockClip"><rect width="${2 * CW}" height="${CH}"/></clipPath>`;
  const bodySvg = `<g clip-path="url(#scr)">
<g class="${showTitle}">${title}</g>
<g class="${showIsland}">${island}</g>
<g class="${showStory}">${story}</g>
<rect class="f0 ${cover}" width="${SW}" height="${SH}"/></g>`;
  const w = SW + PAD * 2, h = SH + PAD * 2;
  const svg = frame(w, h, bodySvg, defs + G.defs() + P.defs(), styleBlock(A),
    'CASTAWAY: a lo-fi island video, played as a BBS door game',
    'An 80 by 25 ANSI door-game session on a loop: a title screen with a white stencil CAST AWAY logo and a sun, a location screen with narration and bracketed hotkey choices, and a story screen where a bottle thrown out to sea comes straight back.');
  return svg;
}

// ---------------------------------------------------------------------------------------------
// The stats screen (static): the island in the space-trader manner
// ---------------------------------------------------------------------------------------------
function buildStats() {
  const G = glyphSet(), P = patternBank(), A = animBank();
  const S = new Screen('stats');
  let r = 1;
  S.mk(r, 1, '{M}<{Y}Scan{M}>', LMG);
  S.mk(r, 66, '{d}Day {l}1{d} of {l}1', DGR);
  r = 3;
  const kv = (label, value) => S.mk(r++, 1, `{G}${label.padEnd(9)}{Y}:{C} ${value}`, LGN, 52);
  kv('Sector', '{Y}1992{C} in The Island {d}(the default seed)');
  kv('Port', 'Timer Exchange, {n}Class 0{C} (sells events)');
  kv('Moored', 'one raft, one tall palm, one of her');
  kv('Passing', '{l}one ship{C}, on schedule, unseen');
  kv('Weather', 'sunny. {Y}It is always daytime here.');
  kv('Radio', '80 BPM, F major, a 60 s loop');
  r++;
  S.mk(r++, 1, '{G}Paths to {Y}:{C} Palm {G}-{C} Raft {G}-{C} Shallows {G}-{C} ({B}Reef{C}) {G}-{C} ({B}Horizon{C}) {G}-{C} ({B}Iced coffee{C})', LGN, 78);
  r++;
  S.mk(r++, 1, '{M}Trading today at the {Y}Timer Exchange{M}: the schedule, from activities.toml', LMG, 78);
  const cols = [1, 15, 26, 46, 62];
  const head = ['Timer', 'Status', 'Every', 'In 10 hours', 'Most a run'];
  head.forEach((t, i) => S.mk(r, cols[i], `{W}${t}`, WHT));
  r++;
  [12, 9, 18, 14, 12].forEach((n, i) => S.put(r, cols[i], '-'.repeat(n), DGR));
  r++;
  const rows = [
    ['Regular', 'Firing', '2 to 5 minutes', 'about 155', '-'],
    ['Occasional', 'Firing', '12 to 25 minutes', 'about 30', '-'],
    ['Rare', 'Firing', '30 to 60 minutes', 'about 13', '-'],
    ['Super rare', 'Firing', '3 to 6 hours', 'about 2', '3'],
    ['Chained', 'Waiting', 'after another one', 'follow-ups', '-'],
  ];
  for (const row of rows) {
    S.mk(r, cols[0], `{C}${row[0]}`);
    S.mk(r, cols[1], row[1] === 'Firing' ? `{G}${row[1]}` : `{g}${row[1]}`);
    S.mk(r, cols[2], `{C}${row[2]}`);
    S.mk(r, cols[3], `{Y}${row[3]}`);
    S.mk(r, cols[4], `{C}${row[4]}`);
    r++;
  }
  r++;
  S.mk(r++, 1, '{n}Busy about a third of the run · idle the rest · every start on the next bar', BRN, 78);
  r++;
  const pEnd = S.mk(r, 1, '{M}Orders [{Y}9:59:51{M} left] [{Y}1992{M}] ({Y}?{M}=help) : ', LMG, 78);
  const R = r + 1;
  // a small vignette in a thin blue box at the top right: the sector, as seen from the scanner
  const BX = { r: 2, c: 54, w: 23, h: 6 };
  S.put(BX.r, BX.c, '┌' + '─'.repeat(BX.w) + '┐', BLU);
  for (let i = 1; i <= BX.h; i++) { S.put(BX.r + i, BX.c, '│', BLU); S.put(BX.r + i, BX.c + BX.w + 1, '│', BLU); }
  S.put(BX.r + BX.h + 1, BX.c, '└' + '─'.repeat(BX.w) + '┘', BLU);
  const cv = seaBackdrop(6, [[2, 8, 3], [8, 10, 2], [4, 11, 2]], BX.w, BX.h * 2);
  stamp(cv, sprite(['..YYY', '.YYYY', '..YYY']), 19, 0);
  for (const [x, y] of [[18, 0], [17, 1], [18, 2], [19, 3], [20, 3], [21, 3], [22, 3], [18, 3]]) setPx(cv, x, y, dith(YEL, LCY, '░'));
  stamp(cv, sprite(['....d...', '...dd...', '.lllll..', 'dddddddd']), 2, 3);   // the ship, unseen
  for (let y = 9; y <= 10; y++) for (let x = 11 + (y - 9); x <= 20 - (y - 9); x++) setPx(cv, x, y, y === 10 ? LEGEND.s : YEL);
  setPx(cv, 10, 9, WHT); setPx(cv, 21, 9, WHT); setPx(cv, 11, 10, WHT); setPx(cv, 20, 10, WHT);
  palm(cv, 16, 9, 15, 3, [
    [[-1, 0], [-2, 0], [-3, 1], [-4, 2]], [[1, 0], [2, 0], [3, 1], [4, 2], [4, 3]],
    [[0, -1], [-1, -2], [-2, -2]], [[1, -1], [2, -2], [3, -2]],
  ]);
  stamp(cv, sprite(['nnn', 'ddd']), 20, 10);                                    // the raft
  setPx(cv, 12, 6, BRN); setPx(cv, 12, 7, LRD); setPx(cv, 12, 8, LEGEND.w);           // her, small, by the palm
  const art = emitPixels(P, cv, (BX.c + 1) * CW, (BX.r + 1) * CH);
  const blink = A.raw('blink', '0%{opacity:1}50%{opacity:0}', 'opacity:1;', BEAT);
  const cursor = `<g class="${blink}"><rect class="f${WHT}" x="${pEnd * CW + 1}" y="${r * CH + 12}" width="7" height="3"/></g>`;
  const body = art + S.svg(G) + cursor;
  const w = SW + PAD * 2, h = R * CH + PAD * 2;
  return frame(w, h, body, G.defs() + P.defs(), styleBlock(A),
    'CASTAWAY stats, in the space-trader manner',
    'Sector 1992 in The Island: the Timer Exchange and its schedule report, regular, occasional, rare, super rare and chained, with how often each fires and how many land in a typical ten-hour run.');
}

// ---------------------------------------------------------------------------------------------
// The README header
// ---------------------------------------------------------------------------------------------
function pre(lines) {
  for (const l of lines) {
    const w = [...l.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')].length;
    if (w > 80) throw new Error(`pre line is ${w} wide: ${l}`);
    if (/\s$/.test(l)) throw new Error(`trailing space: ${l}`);
  }
  return `<pre>\n${lines.join('\n')}\n</pre>`;
}
function menuLine(href, label, note) {
  const dots = ' ' + '.'.repeat(Math.max(2, 25 - label.length - 1)) + ' ';
  return ` <a href="${href}">${label}</a>${dots}${note}`;
}
function buildMd() {
  const RULE = ' ' + rule(77);
  const menu = pre([
    ' <b>Castaway</b> - The Top of the README',
    RULE,
    ' You are at the top of a README. The island is just above you, in colour,',
    ' and the rest of the repository is below. Every choice on this screen is a',
    ' real file. None of them gets you off the island, and that is fine...',
    '',
    menuLine('tools/serve.py', '(S)erve the island', 'python tools/serve.py, then 127.0.0.1:8765'),
    menuLine('web/index.html', '(W)eb page', 'the renderer: live preview, MP4 export'),
    menuLine('activities.toml', '(A)ctivities', 'more than 90: four timers, plus follow-ups'),
    menuLine('tools/schedule.py', '(C)heck the schedule', 'validate it, simulate a ten-hour run'),
    menuLine('tools/make_audio.py', '(M)ake the sound', 'every sound, synthesized from code'),
    menuLine('tools/render_demo.py', '(D)ev reel', 'every activity in a row, with a HUD'),
    menuLine('MUSING.md', '(L)og of the project', 'start at "Current state"'),
    '',
    ' [10:00:00 left] Your move, castaway (S,W,A,C,M,D,L) [S]: _',
  ]);
  const NEWS_RULE = ' ' + rule(73);
  const sep = '                                  -=-';
  const news = pre([
    ' <b>The Wrack Line</b> · all the news from one small island · Day 1 (still)',
    NEWS_RULE,
    '  She threw a bottle out to sea. The sea gave it straight back.',
    sep,
    '  A delivery drone dropped off a parcel. It was another pair of headphones.',
    sep,
    '  A sea turtle came to visit. Nobody was in a hurry.',
    sep,
    '  A grey tabby with a white chest arrived on a crate, climbed the palm and',
    '  had a nap. One day it floated away again. Another day, it came back.',
    sep,
    '  One bar of signal was found, at the very top of the palm. It is staying',
    '  there.',
    sep,
    '  A shark in headphones went by, nodding to the beat.',
    sep,
    '  A tour boat came past. Everybody on board took a selfie.',
    sep,
    '  A coconut fell on a hermit crab. The coconut then walked off, with the',
    '  crab inside it, wearing it.',
    sep,
    '  A bro on an electric hydrofoil waved a shaka and carved off.',
    sep,
    '  She made fire by friction, strung a hammock from the palm to the raft',
    '  (there is no second tree), and built a lookout up the palm.',
    sep,
    '  The kumara she planted is coming along. The sandcastle is not: the tide',
    '  took it.',
    sep,
    '  She walked out over the water and came back with an iced coffee. She',
    '  could leave any time. She has not, yet.',
    sep,
    '  Hours later, a different bottle washed up. It was a reply.',
  ]);
  const md = `<!-- Header ${SLUG} for Castaway. Generated by src/${SLUG}.mjs: edit that, not this. -->

<p align="center">
  <img src="assets/${SLUG}.svg" width="832" alt="CASTAWAY, played as a 1990s BBS door game on an 80 by 25 ANSI screen, on a loop. First the title screen: CAST and AWAY stacked in white stencil block letters with grey undersides, red block numerals reading 10:00:00 for the time left today, a yellow sun limb in shade characters in the top-right corner with three text-mode gulls, a tall palm in front of it on a tiny island where a woman in cream headphones and a coral top nods to the beat, a grey ship sliding along the horizon, thin blue speed lines for the sea, and a magenta prompt: any key, or no key, waiting counts. Then the location screen, Castaway - Under the Palm: green narration about one tall palm, a raft and a great deal of time, fifteen choices with bracketed hotkeys such as (W)ait for something, (P)alm: climb for signal and (L)eave (any time), an orange status line, and a magenta prompt with the seconds ticking down from 9:59:51, where the key B types itself. Then the story screen, The Water's Edge: in two small blue-boxed vignettes she throws a bottle far out to sea and the tide brings it straight back to her feet, while the status line's bottles-back count goes from 0 to 1.">
</p>

<p align="center">
  <b>CASTAWAY</b> (working title) · a ten-hour lo-fi island video, played like an old BBS door game: one turn a day, ten hours long<br>
  <sub>an unofficial remake, inspired by the 1992 screensaver Johnny Castaway · in development · no video published yet</sub>
</p>

**Castaway** is a stationary-frame lo-fi video for YouTube: one young woman, one tiny island, one tall palm, a raft and a great deal of time. Mostly she idles, nodding along to her headphones. Every so often, on the next bar of the music, something happens. She throws a bottle out to sea and it comes straight back. A delivery drone brings her another pair of headphones. A shark in headphones nods along to the same beat. Then nothing happens for a while, beautifully, which is the main thing it does.

More than 90 activities are booked in [activities.toml](activities.toml), most of them on four timers that go off anywhere from every 2 to 5 minutes to once every 3 to 6 hours, and the rest as follow-ups. Every sound is synthesized from code by [tools/make_audio.py](tools/make_audio.py): no samples, no stock loops, no recordings. It is always daytime. Your move:

\`\`\`sh
python tools/serve.py     # then open http://127.0.0.1:8765/
\`\`\`

${menu}

<details>
<summary><b>(V)iew stats</b> · the island in the space-trader manner: sector, paths, and the timer report</summary>

<p align="center">
  <img src="assets/${SLUG}-stats.svg" width="832" alt="A space-trader style sector screen. Sector 1992 in The Island. Port: Timer Exchange, Class 0, sells events. Moored: one raft, one tall palm, one of her. Passing: one ship, on schedule, unseen. Weather: sunny, it is always daytime here. Radio: 80 BPM, F major, a 60-second loop. Paths to: Palm, Raft, Shallows, and the unexplored Reef, Horizon and Iced coffee. Trading today at the Timer Exchange: regular, every 2 to 5 minutes, about 155 in ten hours; occasional, every 12 to 25 minutes, about 30; rare, every 30 to 60 minutes, about 13; super rare, every 3 to 6 hours, about 2, at most 3 a run; chained, waiting, after another one, follow-ups. A brown status line: busy about a third of the run, idle the rest, every start on the next bar. A magenta prompt: orders, 9:59:51 left, sector 1992, question mark for help.">
</p>

The numbers are the schedule's own. In a typical ten-hour run (the median of 200 simulated runs) that is about 155 regular, 30 occasional, 13 rare and 2 super-rare events, plus the chained follow-ups, and she is busy about a third of the time. Lanes let things overlap, so a ship can sail past while she is busy with a coconut, and every activity starts on the next bar of the music (every 3 seconds), so the gags land on the beat. The sector number is the default seed: the default run is 10:00:00 on seed 1992.

</details>

<details>
<summary><b>(T)oday's news</b> · The Wrack Line, the island's only newspaper</summary>

${news}

</details>

<details>
<summary><b>(?) Help</b> · how the door works, the sound, credits and the small print</summary>

**The video.** 16:9, 1080p at 24 fps, and always daytime: night scenes are against the rules here. Shore waves and drifting cloud shadows are built; distant birds, planes with vapour trails, whale pods, dolphins, sailboats, sandpipers, a gecko and a rain shower are planned.

**The renderer** is a web page with live preview: \`python tools/serve.py\`, then open http://127.0.0.1:8765/. Plain ES modules, no build step, no npm packages. It exports frame-exact video in the browser (WebCodecs H.264, 68 to 78 frames a second at 1080p in Chrome, well ahead of real time), and the server mixes in the sound and joins the two into a YouTube-ready MP4. \`python tools/schedule.py\` validates the schedule and simulates a ten-hour run; \`python tools/render_demo.py --dev\` renders a dev reel of every activity with a heads-up display (the older Python reference renderer). Hard cuts and stepped movement are the defaults, which is also how this header moves.

**The sound** is all synthesized from code by [tools/make_audio.py](tools/make_audio.py), more than 150 sound files and counting, with no samples, stock loops or recordings, so no third-party licence applies. The theme is a seamless 60-second loop at 80 BPM in F major (ii-V-I-vi): 20 bars of exactly 3 seconds, with electric piano, a kalimba lead, soft drums and vinyl crackle. The ocean ambience is a seamless 60-second loop too. The mix sits at -14 LUFS with true peak at or below -1 dBTP, and levels are adjustable in master and per routine. Nobody has listened to any of it yet. It is on the list, just after waiting.

<pre>
 CASTAWAY door ............ Windward Doorworks
 Board .................... Port Nowhere BBS, node 1 of 1
 Sysop .................... Spindrift
 Newspaper ................ The Wrack Line
 Registered to ............ one tall palm

 Greetings to the sea turtle, the grey tabby, the shark in headphones, the
 hermit crab in the coconut, the hydrofoil bro, the drone, the tour boat, and
 the bottle, which always comes back.
</pre>

<sub>Castaway is an unofficial project, inspired by the small-island routines and visual comedy of the 1992 screensaver Johnny Castaway, which belongs to its owners; this project is not affiliated with them. The door game on this page is a costume: there is no BBS, no door and no Windward Doorworks, and the screens borrow only the general look of 1990s door games, not any game's name, places or text. Status: in development, no video published yet.</sub>

</details>
`;
  return md;
}

// ---------------------------------------------------------------------------------------------
fs.mkdirSync(path.dirname(OUT_SVG), { recursive: true });
const header = buildHeader();
fs.writeFileSync(OUT_SVG, header);
const stats = buildStats();
fs.writeFileSync(OUT_STATS, stats);
fs.writeFileSync(OUT_MD, buildMd());
console.log(`wrote ${path.basename(OUT_SVG)} (${(header.length / 1024).toFixed(1)} KB), ${path.basename(OUT_STATS)} (${(stats.length / 1024).toFixed(1)} KB), ${path.basename(OUT_MD)}`);
