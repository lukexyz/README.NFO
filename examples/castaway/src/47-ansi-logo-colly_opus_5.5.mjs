#!/usr/bin/env node
// CASTAWAY as a page from a 1990s PC ANSI "logo colly": one tall text file of block-letter logos,
// each drawn by hand from full and half blocks, shaded top to bottom through the CP437 shade
// characters, with a dim tagline, a "phone number" stacked six times and fading, an artist's tag
// over the first letter, and cut lines between the logos so every board could snip out its own.
// Style: catalogue entry ansi-01 ("ANSI logo colly"). The ramp technique, the cut-line layout and
// the fading repeat are the genre's; every letterform, colour choice, name and word here is new.
//
// Regenerate:  node examples/castaway/src/47-ansi-logo-colly_opus_5.5.mjs
// Writes ../assets/47-ansi-logo-colly_opus_5.5.svg        (the hero: the CASTAWAY logo)
//        ../assets/47-ansi-logo-colly_opus_5.5-colly.svg  (the rest of the colly, for <details>)
// The .md beside them is written by hand; `node ... --pre` prints its ROSTER block (text art).
//
// Plain Node, no dependencies, no clock, no Math.random: the same script writes the same bytes.
// Everything is drawn on an 80-column grid of 8x16 cells, the way an ANSI viewer shows it. Text is
// an 8x16 CP437-style bitmap font as <use> glyphs (never <text>); full and half blocks are merged
// rectangles, one path per colour; the shade characters are 4x2 dot patterns copied from the VGA
// bitmaps (25, 50 and 75 percent) over a background colour, exactly as a 16-colour text screen
// mixes two colours in one cell. Background colours are limited to the eight low-intensity ones,
// as on a real VGA text screen without iCE colours.
// Motion is CSS only and runs on the soundtrack's grid (80 BPM: a beat is 0.75 s, a bar is 3 s):
// palette steps, hard cuts, nothing tweened. Each SVG loops on a whole number of bars.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '47-ansi-logo-colly_opus_5.5';
const ASSETS = path.join(HERE, '..', 'assets');

const BEAT = 0.75;            // seconds, 80 BPM
const CW = 8, CH = 16;        // one text cell
const PAD = 12;               // panel padding round the 80-column page

// The 16-colour VGA text palette.
const PAL = ['#000000', '#0000AA', '#00AA00', '#00AAAA', '#AA0000', '#AA00AA', '#AA5500', '#AAAAAA',
  '#555555', '#5555FF', '#55FF55', '#55FFFF', '#FF5555', '#FF55FF', '#FFFF55', '#FFFFFF'];
const [BLK, BLU, GRN, CYN, RED, MAG, BRN, LGR, DGR, LBL, LGN, LCY, LRD, LMG, YEL, WHT] = PAL.map((_, i) => i);

// ---------------------------------------------------------------------------------------------
// 8x16 CP437-style bitmap font (capitals on rows 2-11, x-height from row 5), adapted from the
// font in this folder's 02 generator. Rows are '#'/'.' strings placed from row `top`.
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
  '<': [3, '....##. ...##.. ..##... .##.... ##..... .##.... ..##... ...##.. ....##.'],
  '>': [3, '.##.... ..##... ...##.. ....##. .....## ....##. ...##.. ..##... .##....'],
  '#': [2, '.##.##. .##.##. ####### .##.##. .##.##. .##.##. ####### .##.##. .##.##.'],
  '*': [5, '.##..##. ..####.. ######## ..####.. .##..##.'],
  '+': [5, '...##... ...##... .######. ...##... ...##...'],
  '=': [6, '.######. ........ ........ .######.'],
  '&': [2, '.###... ##.##.. ##.##.. .###... .###.## ##.###. ##..##. ##..##. ##..##. .###.##'],
  '%': [2, '.##....# #..#..## #..#.##. .##.##.. ...##... ..##.##. .##.#..# ##..#..# #....##.'],
  '^': [1, '...#... ..###.. .##.##. ##...##'],
  '~': [6, '.###.## ##.###.'],
  '♪': [3, '...##... ...###.. ...####. ...##.##. ...##..#. ...##... ...##... .####... #####... .###....'],
  '·': [7, '...##... ...##...'],
  '»': [5, '##..##.. .##..##. ..##..## .##..##. ##..##..'],
  '«': [5, '..##..## .##..##. ##..##.. .##..##. ..##..##'],
  '→': [5, '....##.. .....##. ######## .....##. ....##..'],
  '■': [5, '.######. .######. .######. .######. .######. .######.'],
};
for (const [ch, [top, rows]] of Object.entries(PUNCT)) def(ch, top, rows);
FONT.set(' ', new Array(16).fill(0));
// box-drawing horizontals, for rules
def('─', 7, '########');
def('═', 6, '######## ........ ........ ########');
// the second frame of the waterline shimmer: '~' mirrored
def('∽', 6, '##.###. .###.##');

// Bitmap rows -> compact path (merge horizontal runs, then stack equal runs into rectangles).
function bitmapPath(rows, width, ox = 0, oy = 0) {
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
  return rects.map((r) => `M${ox + r.x} ${oy + r.y}h${r.w}v${r.h}h${-r.w}z`).join('');
}
const glyphPath = (g) => bitmapPath(g.map((v) => (x) => (v >> (7 - x)) & 1), 8);

// ---------------------------------------------------------------------------------------------
// A drawing context per SVG: glyph ids, shade patterns, CSS.
// ---------------------------------------------------------------------------------------------
// CP437 shades as the VGA font draws them, as 4x2 tiles: ░ = 0x22/0x88, ▒ = 0x55/0xAA,
// ▓ = 0xDD/0x77 (only the first four bits matter, the pattern repeats every 4 pixels).
const SHADE_TILE = {
  '░': ['..#.', '#...'],
  '▒': ['.#.#', '#.#.'],
  '▓': ['##.#', '.###'],
};
const SHADE_NAME = { '░': 'l', '▒': 'm', '▓': 'd' };
const BLOCKS = new Set(['█', '▀', '▄', '▌', '▐', '░', '▒', '▓']);

function makeCtx() {
  const glyphs = new Map();
  const patterns = new Map();
  return {
    gid(ch) {
      if (!FONT.has(ch)) throw new Error(`no glyph for ${JSON.stringify(ch)} (U+${ch.codePointAt(0).toString(16)})`);
      if (!glyphs.has(ch)) glyphs.set(ch, `g${glyphs.size.toString(36)}`);
      return glyphs.get(ch);
    },
    pat(ch, fg) {
      const id = `${SHADE_NAME[ch]}${fg.toString(16)}`;
      if (!patterns.has(id)) {
        const t = SHADE_TILE[ch];
        patterns.set(id, `<pattern id="${id}" width="4" height="2" patternUnits="userSpaceOnUse"><path fill="${PAL[fg]}" d="${bitmapPath(t.map((row) => (x) => row[x] === '#'), 4)}"/></pattern>`);
      }
      return id;
    },
    defs() {
      return [...glyphs].map(([ch, id]) => `<path id="${id}" d="${glyphPath(FONT.get(ch))}"/>`).join('')
        + [...patterns.values()].join('');
    },
  };
}

// Merge same-colour rectangles: first along rows, then down columns.
function mergeRects(rects) {
  const a = rects.map((r) => ({ ...r })).sort((p, q) => p.y - q.y || p.h - q.h || p.x - q.x);
  const h = [];
  for (const r of a) {
    const l = h[h.length - 1];
    if (l && l.y === r.y && l.h === r.h && l.x + l.w === r.x) l.w += r.w; else h.push(r);
  }
  h.sort((p, q) => p.x - q.x || p.w - q.w || p.y - q.y);
  const v = [];
  for (const r of h) {
    const l = v[v.length - 1];
    if (l && l.x === r.x && l.w === r.w && l.y + l.h === r.y) l.h += r.h; else v.push(r);
  }
  return v;
}
const rectsPath = (rs) => mergeRects(rs).map((r) => `M${r.x} ${r.y}h${r.w}v${r.h}h${-r.w}z`).join('');

// Render a list of cells {r, c, ch, fg, bg} at pixel offset (ox, oy). Background colours first,
// then solid blocks, then shade patterns, then text glyphs. forceBg paints black backgrounds too,
// so a layer can sit opaquely over another.
function renderCells(ctx, cells, { ox = 0, oy = 0, forceBg = false } = {}) {
  const bg = new Map(), solid = new Map(), shade = new Map(), text = new Map();
  const add = (m, k, r) => { if (!m.has(k)) m.set(k, []); m.get(k).push(r); };
  for (const { r, c, ch, fg, bg: b = 0 } of cells) {
    const x = ox + c * CW, y = oy + r * CH;
    if (b || forceBg) add(bg, b, { x, y, w: CW, h: CH });
    if (ch === ' ') continue;
    if (ch === '█') add(solid, fg, { x, y, w: CW, h: CH });
    else if (ch === '▀') add(solid, fg, { x, y, w: CW, h: CH / 2 });
    else if (ch === '▄') add(solid, fg, { x, y: y + CH / 2, w: CW, h: CH / 2 });
    else if (ch === '▌') add(solid, fg, { x, y, w: CW / 2, h: CH });
    else if (ch === '▐') add(solid, fg, { x: x + CW / 2, y, w: CW / 2, h: CH });
    else if (SHADE_TILE[ch]) add(shade, ctx.pat(ch, fg), { x, y, w: CW, h: CH });
    else {
      if (!text.has(fg)) text.set(fg, '');
      text.set(fg, text.get(fg) + `<use href="#${ctx.gid(ch)}" x="${x}" y="${y}"/>`);
    }
  }
  let s = '';
  for (const [k, rs] of bg) s += `<path fill="${PAL[k]}" d="${rectsPath(rs)}"/>`;
  for (const [k, rs] of solid) s += `<path fill="${PAL[k]}" d="${rectsPath(rs)}"/>`;
  for (const [k, rs] of shade) s += `<path fill="url(#${k})" d="${rectsPath(rs)}"/>`;
  for (const [k, u] of text) s += `<g fill="${PAL[k]}">${u}</g>`;
  return s;
}

// A text page: rows of cells. seg() writes runs of [string, colour] pairs.
class Page {
  constructor(cols, rows) { this.cols = cols; this.rows = rows; this.cells = []; }
  put(r, c, ch, fg, bg = 0) {
    if (r < 0 || c < 0 || c >= this.cols || r >= this.rows) return;
    this.cells.push({ r, c, ch, fg, bg });
  }
  text(r, c, s, fg, bg = 0) {
    let i = 0;
    for (const ch of s) { if (ch !== ' ' || bg) this.put(r, c + i, ch, fg, bg); i++; }
    return c + i;
  }
  seg(r, c, parts) {
    for (const [s, fg] of parts) c = this.text(r, c, s, fg);
    return c;
  }
}
const len = (s) => [...s].length;

// A full-width cut line: dim dashes with a bracketed tag near each end, the tags in bright blue.
function cutLine(page, r, left = '[ cut here ]', right = '[ cut here ]', cols = page.cols) {
  page.text(r, 0, '-'.repeat(cols), DGR);
  page.cells = page.cells.filter((k) => !(k.r === r && ((k.c >= 3 && k.c < 3 + len(left)) || (k.c >= cols - 3 - len(right) && k.c < cols - 3))));
  page.text(r, 3, left, LBL);
  page.text(r, cols - 3 - len(right), right, LBL);
}

// ---------------------------------------------------------------------------------------------
// Block lettering. Letters are drawn on a grid of square "pixels", one column wide and half a row
// tall, so two pixel rows make one text row: both set is █, top only ▀, bottom only ▄. Each logo
// then gets a ramp: per text row, what a full cell becomes (a block or a shade, foreground over
// background) and what colour its half-block edges take. Accent slivers (▌ ▐) go in counters.
// ---------------------------------------------------------------------------------------------
function assemble(letters) {
  // letters: [{ px: [strings], gap, accents: [[col, row, ch]] }]
  const h = letters[0].px.length;
  let w = 0;
  const placed = [];
  for (const L of letters) {
    if (L.px.length !== h) throw new Error('letter height mismatch');
    const lw = L.px[0].length;
    if (L.px.some((row) => row.length !== lw)) throw new Error(`ragged letter: ${L.px.join('|')}`);
    placed.push({ x: w + (L.shift || 0), L });
    w += lw + (L.gap ?? 1) + (L.shift || 0);
  }
  w -= letters[letters.length - 1].gap ?? 1;
  const bmp = Array.from({ length: h }, () => new Array(w).fill(0));
  const accents = [];
  placed.forEach(({ x, L }, i) => {
    L.px.forEach((row, y) => { for (let c = 0; c < row.length; c++) if (row[c] === '#') bmp[y][x + c] = i + 1; });
    for (const [c, r, ch, fg] of L.accents || []) accents.push({ c: x + c, r, ch, fg });
  });
  return { w, h, bmp, accents, placed };
}

// Turn the bitmap into cells with a ramp. ramp[row] = { full: [ch, fg, bg], top: fg, bot: fg }.
function shadeLogo(logo, ramp, { accentFg } = {}) {
  const cells = [];
  for (let r = 0; r < logo.h / 2; r++) {
    const R = ramp[r];
    for (let c = 0; c < logo.w; c++) {
      const t = logo.bmp[2 * r][c], b = logo.bmp[2 * r + 1][c];
      if (t && b) cells.push({ r, c, ch: R.full[0], fg: R.full[1], bg: R.full[2] || 0 });
      else if (t) cells.push({ r, c, ch: '▀', fg: R.top, bg: 0 });
      else if (b) cells.push({ r, c, ch: '▄', fg: R.bot, bg: 0 });
    }
  }
  for (const a of logo.accents) cells.push({ r: a.r, c: a.c, ch: a.ch, fg: a.fg ?? accentFg, bg: 0 });
  return cells;
}

// ---------------------------------------------------------------------------------------------
// THE HERO: CASTAWAY, ten text rows tall, sand lit from above and wading in the sea from the
// waterline down. Every letter is drawn on its own; the three A's are three different A's.
// ---------------------------------------------------------------------------------------------
const L_C = {
  px: [
    '..######',
    '.#######',
    '########',
    '###...##',
    '###....#',
    '###.....',
    '###.....',
    '###.....',
    '###.....',
    '###.....',
    '###.....',
    '###.....',
    '###.....',
    '###.....',
    '###.....',
    '###....#',
    '###...##',
    '########',
    '.#######',
    '..######',
  ],
  accents: [[3, 3, '▌'], [3, 4, '▌'], [3, 5, '▌']],
};
const L_A1 = {   // flat top, squared left shoulder, crossbar three pixels deep
  px: [
    '########.',
    '#########',
    '#########',
    '###...###',
    '###...###',
    '###...###',
    '###...###',
    '###...###',
    '###...###',
    '#########',
    '#########',
    '#########',
    '###...###',
    '###...###',
    '###...###',
    '###...###',
    '###...###',
    '###...###',
    '###...###',
    '###...###',
  ],
  accents: [[3, 2, '▌'], [3, 3, '▌']],
};
const L_S = {
  px: [
    '..######',
    '.#######',
    '########',
    '###...##',
    '###.....',
    '###.....',
    '###.....',
    '#######.',
    '########',
    '.#######',
    '.....###',
    '.....###',
    '.....###',
    '.....###',
    '.....###',
    '##...###',
    '##...###',
    '########',
    '#######.',
    '######..',
  ],
  accents: [[3, 2, '▌'], [4, 5, '▐'], [4, 6, '▐']],
};
const L_T = {   // the arms droop at the tips, like fronds; the stem gets a foot in the water
  px: [
    '#########',
    '#########',
    '#########',
    '#..###..#',
    '...###...',
    '...###...',
    '...###...',
    '...###...',
    '...###...',
    '...###...',
    '...###...',
    '...###...',
    '...###...',
    '...###...',
    '...###...',
    '...###...',
    '...###...',
    '...###...',
    '..#####..',
    '..#####..',
  ],
  gap: 0,
};
const L_A2 = {   // pointed apex; sits tucked under the T's arm
  px: [
    '...###...',
    '..#####..',
    '.#######.',
    '.###.###.',
    '###...###',
    '###...###',
    '###...###',
    '###...###',
    '###...###',
    '###...###',
    '#########',
    '#########',
    '###...###',
    '###...###',
    '###...###',
    '###...###',
    '###...###',
    '###...###',
    '###...###',
    '###...###',
  ],
  accents: [[3, 2, '▌'], [3, 3, '▌'], [3, 4, '▌']],
};
const L_W = {
  px: [
    '###......###',
    '###......###',
    '###......###',
    '###......###',
    '###......###',
    '###......###',
    '###......###',
    '###..##..###',
    '###..##..###',
    '###..##..###',
    '###..##..###',
    '###..##..###',
    '###..##..###',
    '###..##..###',
    '###..##..###',
    '###..##..###',
    '############',
    '############',
    '.##########.',
    '..###..###..',
  ],
  accents: [[3, 0, '▌'], [3, 1, '▌'], [3, 2, '▌'], [7, 4, '▌'], [7, 5, '▌'], [7, 6, '▌']],
};
const L_A3 = {   // rounded both shoulders, a notch at the top of the counter, crossbar higher
  px: [
    '.#######.',
    '#########',
    '####.####',
    '###...###',
    '###...###',
    '###...###',
    '###...###',
    '###...###',
    '#########',
    '#########',
    '###...###',
    '###...###',
    '###...###',
    '###...###',
    '###...###',
    '###...###',
    '###...###',
    '###...###',
    '###...###',
    '###...###',
  ],
  accents: [[3, 2, '▌'], [3, 3, '▌']],
};
const L_Y = {
  px: [
    '###...###',
    '###...###',
    '###...###',
    '###...###',
    '###...###',
    '###...###',
    '####.####',
    '#########',
    '.#######.',
    '..#####..',
    '...###...',
    '...###...',
    '...###...',
    '...###...',
    '...###...',
    '...###...',
    '...###...',
    '...###...',
    '..#####..',
    '..#####..',
  ],
  accents: [[3, 0, '▌'], [3, 1, '▌'], [3, 2, '▌']],
};

// Sun on sand above the waterline (white, yellow, yellow over brown, brown), then a foam row and
// the sea below it (cyan over blue). Text row 7 is the waterline.
const HERO_RAMP = [
  { full: ['█', WHT], top: WHT, bot: WHT },
  { full: ['█', YEL], top: YEL, bot: YEL },
  { full: ['█', YEL], top: YEL, bot: YEL },
  { full: ['▓', YEL, BRN], top: YEL, bot: YEL },
  { full: ['▒', YEL, BRN], top: YEL, bot: YEL },
  { full: ['░', YEL, BRN], top: YEL, bot: BRN },
  { full: ['█', BRN], top: BRN, bot: BRN },
  { full: ['▀', WHT, CYN], top: WHT, bot: CYN },
  { full: ['▓', CYN, BLU], top: CYN, bot: CYN },
  { full: ['▒', CYN, BLU], top: CYN, bot: BLU },
];
// The same rows two steps brighter: the palette-cycle "shine" that steps down the letters.
const HERO_LIT = HERO_RAMP.map((_, r) => (r === 7 ? { full: ['█', WHT], top: WHT, bot: WHT }
  : r === 8 ? { full: ['▓', LCY, CYN], top: LCY, bot: LCY }
    : r === 9 ? { full: ['▓', CYN, BLU], top: CYN, bot: CYN } : HERO_RAMP[Math.max(0, r - 2)]));
const WATERLINE = 7;

// The palm on the A, as pixels: g light green, G green, c coconut, t trunk. Fronds arch out and
// droop at the tips; two coconuts hang either side of the crown's heart, above the trunk.
const PALM = [
  '....ggg.ggg....',
  '..gg..gGg..gg..',
  '.g..ggGGGgg..g.',
  'g..g..cGc..g..g',
  '.......t.......',
  '........t......',
  '........t......',
  '.......t.......',
];
const PALM_ROOT = 7;   // the trunk's column

// A pixel sprite (one column by half a row per pixel) to cells, two colours a cell at most.
// Background colours must be one of the eight low-intensity ones, as on a real text screen.
function sprite(rows, colours) {
  const cells = [];
  for (let r = 0; r < rows.length / 2; r++) {
    for (let c = 0; c < rows[0].length; c++) {
      const t = colours[rows[2 * r][c]], b = colours[rows[2 * r + 1][c]];
      if (t == null && b == null) continue;
      if (t === b) cells.push({ r, c, ch: '█', fg: t });
      else if (b == null) cells.push({ r, c, ch: '▀', fg: t });
      else if (t == null) cells.push({ r, c, ch: '▄', fg: b });
      else if (b < 8) cells.push({ r, c, ch: '▀', fg: t, bg: b });
      else if (t < 8) cells.push({ r, c, ch: '▄', fg: b, bg: t });
      else throw new Error('two bright colours in one cell');
    }
  }
  return cells;
}

function buildHero() {
  const ctx = makeCtx();
  const COLS = 80;
  const LOGO_ROW = 5, TAG_ROW = LOGO_ROW + 11, INFO_ROW = TAG_ROW + 2, CUT_ROW = INFO_ROW + 6, ROWS = CUT_ROW + 1;
  const page = new Page(COLS, ROWS);

  const logo = assemble([L_C, L_A1, L_S, L_T, L_A2, L_W, L_A3, L_Y]);
  const lox = Math.round(((COLS * CW) - logo.w * CW) / 2);   // centre to the pixel (half a column)
  const loy = LOGO_ROW * CH;
  const base = shadeLogo(logo, HERO_RAMP, { accentFg: LCY });

  // waterline shimmer between the letters and out to both edges, two frames a beat apart
  const occ = (r) => new Set(base.filter((k) => k.r === r).map((k) => k.c));
  const shimmerA = [], shimmerB = [], sea = [];
  const onLine = occ(WATERLINE);
  for (let c = 0; c < logo.w; c++) {
    if (onLine.has(c)) continue;
    shimmerA.push({ r: WATERLINE, c, ch: c % 2 ? '~' : '∽', fg: c % 3 ? LBL : LCY });
    shimmerB.push({ r: WATERLINE, c, ch: c % 2 ? '∽' : '~', fg: c % 3 ? LCY : LBL });
  }
  // the sea between the feet: a dim dither of blue
  for (let r = WATERLINE + 1; r < logo.h / 2; r++) {
    const o = occ(r);
    for (let c = 0; c < logo.w; c++) if (!o.has(c)) sea.push({ r, c, ch: '░', fg: BLU });
  }

  // one tall palm (well, tall for three text rows), growing out of the pointed A
  const a2 = logo.placed[4].x;
  const palm = sprite(PALM, { g: LGN, G: GRN, t: BRN, c: BRN }).map((k) => ({ ...k, r: k.r - PALM.length / 2, c: k.c + a2 + 4 - PALM_ROOT }));
  const crown = palm.filter((k) => k.r < -2), trunk = palm.filter((k) => k.r >= -2);   // the crown sways on the beat

  // the artist's tag over the first letter
  page.text(LOGO_ROW - 1, 0, 'wk/stl', DGR);
  page.text(LOGO_ROW - 1, COLS - len('colly 01 of 05'), 'colly 01 of 05', DGR);
  cutLine(page, 0);

  // tagline, dim and lowercase, with runs of dots
  const tag = [['ten hours', LGR], [' . ', DGR], ['one island', LGR], [' ..... ', DGR], ['she idles', LGR],
    [' ..... ', DGR], ['now and then, something happens', LGR]];
  const tagLen = tag.reduce((n, [s]) => n + len(s), 0);
  page.seg(TAG_ROW, Math.floor((COLS - tagLen) / 2), tag);

  // the board-ad block: labels in eLiTe capitals, the island's number stacked and fading at right
  const INFO = [
    [['SHe', WHT], [' ......... ', DGR], ['idles. nods along. waits. mostly that', LGR]],
    [['THeN', WHT], [' ........ ', DGR], ['a bottle, a drone, a turtle, a cat', LGR]],
    [['TiMeRS', WHT], [' ...... ', DGR], ['90+ activities, every one on the beat', LGR]],
    [['SouND', WHT], [' ....... ', DGR], ['synthesized from code. no samples', LGR]],
    [['RuN', WHT], [' ......... ', DGR], ['python tools/serve.py', YEL]],
    [['DiaL', WHT], [' ........ ', DGR], ['local calls only', LGR], [' ......... ', DGR], ['»', LBL]],
  ];
  const NUM = '127.0.0.1:8765';
  const FADE = [WHT, WHT, LGR, LGR, DGR, DGR];
  const numCol = COLS - 1 - len(NUM);
  INFO.forEach((parts, i) => page.seg(INFO_ROW + i, 1, parts));
  const numbers = FADE.map((fg, i) => renderCells(ctx, [...NUM].map((ch, k) => ({ r: INFO_ROW + i, c: numCol + k, ch, fg })).filter((k) => k.ch !== ' '), { ox: 0, oy: 0 }));
  const numbersLit = FADE.map((_, i) => renderCells(ctx, [...NUM].map((ch, k) => ({ r: INFO_ROW + i, c: numCol + k, ch, fg: i < 2 ? LCY : WHT })), {}));
  const cursorCol = 1 + INFO[5].reduce((n, [s]) => n + len(s), 0) + 1;

  cutLine(page, CUT_ROW, '[ cut here ]', '[ already cut off ]');

  // ---- assemble the SVG ----
  const W = COLS * CW, H = ROWS * CH;
  const lit = HERO_LIT.map((_, r) => renderCells(ctx,
    shadeLogo({ ...logo, accents: [] }, HERO_LIT).filter((k) => k.r === r),
    { ox: lox, oy: loy, forceBg: true }));

  const LOOP = 16 * BEAT;                       // 4 bars = 12 s
  const css = [];
  // the shine: a band two rows deep moves down one row a beat, then rests till the loop ends
  css.push(`.sh{opacity:0;animation:sh ${LOOP}s step-end infinite}`);
  css.push(`@keyframes sh{0%{opacity:1}${(200 / 16).toFixed(4)}%{opacity:0}100%{opacity:0}}`);
  css.push(`@keyframes nr{0%{opacity:1}${(100 / 16).toFixed(4)}%{opacity:0}100%{opacity:0}}`);
  lit.forEach((_, r) => css.push(`.sh${r}{animation-delay:${(r * BEAT).toFixed(2)}s}`));
  // the shimmer swaps frames every beat
  css.push(`.wa{animation:wa ${2 * BEAT}s step-end infinite}.wb{opacity:0;animation:wa ${2 * BEAT}s step-end infinite;animation-delay:${BEAT}s}`);
  css.push('@keyframes wa{0%{opacity:1}50%{opacity:0}100%{opacity:0}}');
  // the number rings down the stack after the shine reaches the sea: one line a beat
  css.push(`.nl{opacity:0;animation:nr ${LOOP}s step-end infinite}`);
  FADE.forEach((_, i) => css.push(`.nl${i}{animation-delay:${((10 + i) * BEAT).toFixed(2)}s}`));
  // the palm's crown leans one column with the beat and back
  css.push(`.pa{animation:wa ${2 * BEAT}s step-end infinite}.pb{opacity:0;animation:wa ${2 * BEAT}s step-end infinite;animation-delay:${BEAT}s}`);
  // a cursor waiting at the end of the dial line
  css.push(`.cu{animation:wa ${2 * BEAT}s step-end infinite}`);
  css.push('@media (prefers-reduced-motion:reduce){.sh,.nl,.wb,.pb{animation:none;opacity:0}.wa,.cu,.pa{animation:none;opacity:1}}');

  const body = [
    renderCells(ctx, page.cells),
    numbers.join(''),
    numbersLit.map((s, i) => `<g class="nl nl${i}">${s}</g>`).join(''),
    `<g class="cu">${renderCells(ctx, [{ r: INFO_ROW + 5, c: cursorCol, ch: '_', fg: LGR }])}</g>`,
    renderCells(ctx, [...sea, ...base, ...trunk], { ox: lox, oy: loy }),
    `<g class="pa">${renderCells(ctx, crown, { ox: lox, oy: loy })}</g>`,
    `<g class="pb">${renderCells(ctx, crown.map((k) => ({ ...k, c: k.c + 1 })), { ox: lox, oy: loy })}</g>`,
    lit.map((s, r) => `<g class="sh sh${r}">${s}</g>`).join(''),
    `<g class="wa">${renderCells(ctx, shimmerA, { ox: lox, oy: loy })}</g>`,
    `<g class="wb">${renderCells(ctx, shimmerB, { ox: lox, oy: loy })}</g>`,
  ].join('\n');

  const title = 'CASTAWAY: an ANSI logo colly page';
  const desc = 'CASTAWAY as a hand-drawn ANSI block-letter logo on a black 80-column text screen, between two dashed cut lines tagged "cut here" in bright blue; the bottom line\'s second tag reads "already cut off". '
    + 'The eight capitals are shaded top to bottom like sun on sand: white, yellow, yellow dithered over brown, brown. A row of white foam crosses them two thirds of the way down, and below it their feet are cyan and blue, wading in the sea, with a shimmer of small waves between the letters. '
    + 'Thin light-cyan slivers sit inside the counters. The T\'s arms droop at the tips like fronds, each of the three A\'s is drawn differently, and a small palm with two coconuts grows out of the point of the second A, which makes that letter an island; its crown sways a column to the right and back on the beat. A brighter step of the palette slides down the letters one row per beat. '
    + 'Over the C, the artist\'s tag wk/stl; over the Y, colly 01 of 05. Under the logo, in dim lowercase: ten hours, one island, she idles, now and then, something happens. '
    + 'Then a board ad: SHe, idles, nods along, waits, mostly that. THeN, a bottle, a drone, a turtle, a cat. TiMeRS, 90+ activities, every one on the beat. SouND, synthesized from code, no samples. RuN, python tools/serve.py. DiaL, local calls only. '
    + 'At the right, the island\'s number, 127.0.0.1:8765, stacked six times and fading from white to dark grey.';

  return svgDoc(ctx, W, H, title, desc, css, body);
}

function svgDoc(ctx, W, H, title, desc, css, body) {
  const VBW = W + PAD * 2, VBH = H + PAD * 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VBW} ${VBH}" width="${VBW}" height="${VBH}" shape-rendering="crispEdges" role="img" aria-labelledby="t d">
<title id="t">${title}</title>
<desc id="d">${desc}</desc>
<style>${css.join('\n')}</style>
<defs>${ctx.defs()}</defs>
<rect x=".5" y=".5" width="${VBW - 1}" height="${VBH - 1}" rx="10" fill="#000" stroke="#30363d"/>
<g transform="translate(${PAD} ${PAD})">
${body}
</g>
</svg>
`;
}

// ---------------------------------------------------------------------------------------------
// THE REST OF THE COLLY: four more logos, one for each of the island's regular callers, each by a
// different (invented) Strandline artist in their own letterforms, ramp and small motion.
// ---------------------------------------------------------------------------------------------
// 02 DRONE, by cw: squared chrome capitals, white to light grey to dark grey, rotors on top.
const DRONE = [
  { px: [
    '########.',
    '#########',
    '###...###',
    '###...###',
    '###...###',
    '###...###',
    '###...###',
    '###...###',
    '###...###',
    '###...###',
    '###...###',
    '###...###',
    '#########',
    '########.',
  ], accents: [[3, 1, '▌'], [3, 3, '▌']] },
  { px: [
    '########.',
    '#########',
    '###...###',
    '###...###',
    '###...###',
    '#########',
    '########.',
    '###.###..',
    '###..###.',
    '###...###',
    '###...###',
    '###...###',
    '###...###',
    '###...###',
  ], accents: [[3, 1, '▌']] },
  { px: [
    '.#######.',
    '#########',
    '###...###',
    '###...###',
    '###...###',
    '###...###',
    '###...###',
    '###...###',
    '###...###',
    '###...###',
    '###...###',
    '###...###',
    '#########',
    '.#######.',
  ], accents: [[3, 1, '▌'], [3, 3, '▌']] },
  { px: [
    '###...###',
    '####..###',
    '#####.###',
    '#########',
    '###.#####',
    '###..####',
    '###...###',
    '###...###',
    '###...###',
    '###...###',
    '###...###',
    '###...###',
    '###...###',
    '###...###',
  ], accents: [[3, 4, '▌'], [3, 5, '▌']] },
  { px: [
    '########',
    '########',
    '###.....',
    '###.....',
    '###.....',
    '#######.',
    '#######.',
    '###.....',
    '###.....',
    '###.....',
    '###.....',
    '###.....',
    '########',
    '########',
  ] },
];
const DRONE_RAMP = [
  { full: ['█', WHT], top: WHT, bot: WHT },
  { full: ['▓', WHT, LGR], top: WHT, bot: WHT },
  { full: ['▒', WHT, LGR], top: WHT, bot: LGR },
  { full: ['█', LGR], top: LGR, bot: LGR },
  { full: ['▓', LGR, BLK], top: LGR, bot: DGR },
  { full: ['█', DGR], top: DGR, bot: DGR },
  { full: ['▒', DGR, BLK], top: DGR, bot: DGR },
];

// 03 SHARK, by lmp: rounded letters in sea blues; the A is a dorsal fin wearing headphones.
const SHARK = [
  { px: [
    '..######.',
    '.########',
    '###....##',
    '###......',
    '###......',
    '########.',
    '.########',
    '......###',
    '......###',
    '......###',
    '##....###',
    '#########',
    '########.',
    '.######..',
  ], accents: [[3, 1, '▌'], [5, 4, '▐']] },
  { px: [
    '.##...##.',
    '###...###',
    '###...###',
    '###...###',
    '###...###',
    '#########',
    '#########',
    '###...###',
    '###...###',
    '###...###',
    '###...###',
    '###...###',
    '###...###',
    '.##...##.',
  ], accents: [[3, 0, '▌'], [3, 1, '▌']] },
  { px: [
    '.......###',
    '......####',
    '.....#####',
    '....######',
    '...###.###',
    '..###..###',
    '.###...###',
    '###....###',
    '##########',
    '##########',
    '###....###',
    '###....###',
    '###....###',
    '.##....##.',
  ], accents: [[6, 2, '▐'], [6, 3, '▌']] },
  { px: [
    '#######..',
    '########.',
    '###...###',
    '###...###',
    '###..####',
    '########.',
    '#######..',
    '###.###..',
    '###..###.',
    '###...###',
    '###...###',
    '###...###',
    '###...###',
    '.##...##.',
  ], accents: [[3, 1, '▌']] },
  { px: [
    '.##...###',
    '###..###.',
    '###.###..',
    '######...',
    '#####....',
    '######...',
    '#######..',
    '###.###..',
    '###..###.',
    '###...###',
    '###...###',
    '###...###',
    '###...###',
    '.##...##.',
  ] },
];
const SHARK_RAMP = [
  { full: ['█', LCY], top: LCY, bot: LCY },
  { full: ['▓', LCY, CYN], top: LCY, bot: LCY },
  { full: ['▒', LCY, CYN], top: LCY, bot: CYN },
  { full: ['█', CYN], top: CYN, bot: CYN },
  { full: ['▓', CYN, BLU], top: CYN, bot: CYN },
  { full: ['▒', CYN, BLU], top: CYN, bot: BLU },
  { full: ['█', BLU], top: BLU, bot: BLU },
];

// 04 CRAB, by cnc: squat, wide letters in coral and red, a coconut worn on the B, eight legs.
const CRAB = [
  { px: [
    '..#########',
    '.##########',
    '####.....##',
    '###........',
    '###........',
    '###........',
    '###........',
    '###........',
    '###........',
    '####.....##',
    '.##########',
    '..#########',
  ], accents: [[3, 2, '▌'], [3, 3, '▌']] },
  { px: [
    '#########.',
    '##########',
    '###....###',
    '###....###',
    '#########.',
    '########..',
    '###..###..',
    '###...###.',
    '###....###',
    '###....###',
    '###....###',
    '###....###',
  ], accents: [[3, 1, '▌']] },
  { px: [
    '..#######..',
    '.#########.',
    '####...####',
    '###.....###',
    '###.....###',
    '###########',
    '###########',
    '###.....###',
    '###.....###',
    '###.....###',
    '###.....###',
    '###.....###',
  ], accents: [[3, 1, '▌']] },
  { px: [
    '#########.',
    '##########',
    '###....###',
    '###....###',
    '#########.',
    '#########.',
    '###....###',
    '###....###',
    '###....###',
    '###....###',
    '##########',
    '#########.',
  ], accents: [[3, 1, '▌'], [3, 3, '▌'], [3, 4, '▌']] },
];
const CRAB_RAMP = [
  { full: ['█', LRD], top: LRD, bot: LRD },
  { full: ['▓', LRD, RED], top: LRD, bot: LRD },
  { full: ['▒', LRD, RED], top: LRD, bot: LRD },
  { full: ['░', LRD, RED], top: LRD, bot: RED },
  { full: ['█', RED], top: RED, bot: RED },
  { full: ['▓', RED, BLK], top: RED, bot: RED },
];

// 05 BOTTLE, by nau: the outline variant. Hollow letters traced in underscores, slashes and pipes,
// coloured row by row, on a hatched blue slab with dotted rules out to both edges.
const BOTTLE = [
  [' _______ ',
   '|   __  \\',
   '|  |__) /',
   '|   __ < ',
   '|  |__) \\',
   '|_______/'],
  ['  _____  ',
   ' /  _  \\ ',
   '|  | |  |',
   '|  | |  |',
   '|  |_|  |',
   ' \\_____/ '],
  [' _______ ',
   '|__   __|',
   '   | |   ',
   '   | |   ',
   '   | |   ',
   '   |_|   '],
  [' _______ ',
   '|_     _|',
   '  |   |  ',
   '  |   |  ',
   '  |   |  ',
   '  |___|  '],
  [' __      ',
   '|  |     ',
   '|  |     ',
   '|  |     ',
   '|  |____ ',
   '|_______|'],
  [' _______ ',
   '|   ____|',
   '|  |__   ',
   '|   __|  ',
   '|  |____ ',
   '|_______|'],
];
const BOTTLE_ROWS = [LGN, LGN, LCY, LCY, CYN, CYN];

function buildColly() {
  const ctx = makeCtx();
  const COLS = 80;
  const page = new Page(COLS, 200);
  const anim = [];        // [className, svg] layers that move
  const css = [];
  const LOOP = 16 * BEAT;
  let row = 0;
  const FADE = [WHT, WHT, LGR, LGR, DGR, DGR];
  const stack = (r0, c0, s, last) => FADE.forEach((fg, i) => page.text(r0 + i, c0, i === 5 && last ? last : s, i === 5 && last ? YEL : fg));
  const tagline = (r, parts) => {
    const n = parts.reduce((k, [s]) => k + len(s), 0);
    page.seg(r, Math.floor((COLS - n) / 2), parts);
  };
  const header = (r, n, sig, sigCol) => {
    page.text(r, sigCol, sig, DGR);
    page.text(r, COLS - len(`colly 0${n} of 05`), `colly 0${n} of 05`, DGR);
  };

  // ---- 02 DRONE ----------------------------------------------------------------------------
  cutLine(page, row);
  {
    const top = row + 2;              // rotors on row top-1, the logo from row `top`
    const logo = assemble(DRONE);
    const lc = 2;
    const cells = shadeLogo(logo, DRONE_RAMP, { accentFg: LCY });
    header(row + 1, 2, 'cw/stl', lc + logo.w + 2);
    const ox = lc * CW, oy = top * CH;
    // rotors over the D and the E: a short mast that stays put (the bottom half of the hub cell, so
    // each cell is still one character in two colours), and a wide blade and a narrow one on top of
    // it, swapped every half beat
    const d0 = logo.placed[0].x, e0 = logo.placed[4].x;
    const masts = [d0 + 1, e0].map((x0) => ({ r: -1, c: x0 + 3, ch: '▄', fg: LGR }));
    const rotor = (frame) => [d0 + 1, e0].flatMap((x0) => (frame
      ? [...Array(7)].map((_, k) => ({ r: -1, c: x0 + k, ch: '▀', fg: LGR }))
      : [...Array(3)].map((_, k) => ({ r: -1, c: x0 + 2 + k, ch: '▀', fg: WHT }))));
    const body = renderCells(ctx, [...cells, ...masts], { ox, oy });
    anim.push(['dr', `${body}<g class="ra">${renderCells(ctx, rotor(1), { ox, oy })}</g><g class="rb">${renderCells(ctx, rotor(0), { ox, oy })}</g>`]);
    stack(top, COLS - 1 - len('headphones'), 'headphones');
    tagline(top + 8, [['a delivery drone', LGR], [' ..... ', DGR], ['one parcel', LGR], [' ..... ', DGR],
      ['inside it, another pair of headphones', LGR]]);
    row = top + 10;
  }
  // ---- 03 SHARK ----------------------------------------------------------------------------
  cutLine(page, row);
  {
    const top = row + 2;
    const logo = assemble(SHARK);
    const lc = COLS - 1 - logo.w;
    const cells = shadeLogo(logo, SHARK_RAMP, { accentFg: WHT });
    header(row + 1, 3, 'lmp/stl', lc);
    // headphones on the fin: a band over the tip, a cup either side
    const a = logo.placed[2].x;
    const phones = [
      { r: -1, c: a + 5, ch: '▄', fg: WHT }, { r: -1, c: a + 6, ch: '▀', fg: WHT }, { r: -1, c: a + 7, ch: '▀', fg: WHT },
      { r: -1, c: a + 8, ch: '▀', fg: WHT }, { r: -1, c: a + 9, ch: '▀', fg: WHT }, { r: -1, c: a + 10, ch: '▄', fg: WHT },
      { r: 0, c: a + 5, ch: '█', fg: YEL }, { r: 0, c: a + 10, ch: '█', fg: YEL },
    ];
    const ox = lc * CW, oy = top * CH;
    anim.push(['sk', renderCells(ctx, [...cells, ...phones], { ox, oy })]);
    stack(top, 1, 'nod . nod . nod');
    tagline(top + 8, [['a shark in headphones', LGR], [' ..... ', DGR], ['nods on the beat', LGR], [' ..... ', DGR],
      ['same playlist, apparently', LGR]]);
    row = top + 10;
  }
  // ---- 04 CRAB -----------------------------------------------------------------------------
  cutLine(page, row);
  {
    const top = row + 3;              // two rows of coconut above the B
    const logo = assemble(CRAB);
    const lc = 2;
    const cells = shadeLogo(logo, CRAB_RAMP, { accentFg: YEL });
    header(row + 1, 4, 'cnc/stl', lc);
    const b = logo.placed[3].x;
    const nut = [];
    for (let k = 2; k <= 7; k++) nut.push({ r: -2, c: b + k, ch: '▄', fg: BRN });
    for (let k = 1; k <= 8; k++) nut.push({ r: -1, c: b + k, ch: k === 3 || k === 6 ? '▒' : '▓', fg: BRN });
    // eight legs, two under each letter, drawn in half blocks: a thigh straight down from the
    // letter's foot, then a shin that kinks out (splayed) or in (tucked), swapped every beat
    const legs = (f) => logo.placed.flatMap(({ x, L }) => {
      const w = L.px[0].length, l = x + 1, r = x + w - 2;
      return f
        ? [{ r: 6, c: l, ch: '▌', fg: LRD }, { r: 7, c: l - 1, ch: '▐', fg: RED },
          { r: 6, c: r, ch: '▐', fg: LRD }, { r: 7, c: r + 1, ch: '▌', fg: RED }]
        : [{ r: 6, c: l, ch: '▐', fg: LRD }, { r: 7, c: l + 1, ch: '▌', fg: RED },
          { r: 6, c: r, ch: '▌', fg: LRD }, { r: 7, c: r - 1, ch: '▐', fg: RED }];
    });
    const ox = lc * CW, oy = top * CH;
    anim.push(['cb', `${renderCells(ctx, [...nut, ...cells], { ox, oy })}<g class="la">${renderCells(ctx, legs(1), { ox, oy })}</g><g class="lb">${renderCells(ctx, legs(0), { ox, oy })}</g>`]);
    stack(top, COLS - 1 - len('click . clack'), 'click . clack');
    tagline(top + 8, [['a coconut lands on a hermit crab', LGR], [' ..... ', DGR], ['the crab keeps it', LGR],
      [' ..... ', DGR], ['walks off in it', LGR]]);
    row = top + 10;
  }
  // ---- 05 BOTTLE ---------------------------------------------------------------------------
  cutLine(page, row);
  {
    const top = row + 3;
    header(row + 1, 5, 'nau/stl', 0);
    const lw = BOTTLE.reduce((n, L) => n + L[0].length, 0) + BOTTLE.length - 1;
    const lc = Math.floor((COLS - lw) / 2);
    // the slab: a hatch of blue, one row deeper than the letters top and bottom
    const s0 = lc - 3, s1 = lc + lw + 2;
    const slab = [];
    for (let r = top - 1; r <= top + 6; r++) for (let c = s0; c <= s1; c++) slab.push({ r, c, ch: '░', fg: BLU });
    // dotted rules out to the edges, level with the middle of the slab
    for (let c = 1; c < s0 - 1; c += 2) { page.put(top + 2, c, '·', DGR); page.put(top + 3, c + 1, '·', BLU); }
    for (let c = s1 + 2; c < COLS - 1; c += 2) { page.put(top + 2, c, '·', DGR); page.put(top + 3, c + 1, '·', BLU); }
    // letters: the outline glyphs, plus every cell they enclose (flood-filled from outside),
    // painted black so each letter reads as a hole in the hatch. A top-edge underscore keeps the
    // hatch above it, since it only draws the letter's top line.
    const letters = [];
    let x = 0;
    for (const L of BOTTLE) {
      const H = L.length, Wd = L[0].length;
      const out = Array.from({ length: H }, () => new Array(Wd).fill(false));
      const q = [];
      for (let r = 0; r < H; r++) for (let c = 0; c < Wd; c++) if ((r === 0 || c === 0 || c === Wd - 1) && L[r][c] === ' ') { out[r][c] = true; q.push([r, c]); }
      while (q.length) {
        const [r, c] = q.pop();
        for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const rr = r + dr, cc = c + dc;
          if (rr < 0 || cc < 0 || rr >= H || cc >= Wd || out[rr][cc] || L[rr][cc] !== ' ') continue;
          out[rr][cc] = true; q.push([rr, cc]);
        }
      }
      L.forEach((line, r) => [...line].forEach((ch, k) => {
        if (ch !== ' ') letters.push({ r, c: x + k, ch, fg: BOTTLE_ROWS[r], bg: 0, solid: !(ch === '_' && (r === 0 || out[r - 1][k])) });
        else if (!out[r][k]) letters.push({ r, c: x + k, ch: ' ', fg: 0, bg: 0, solid: true });
      }));
      x += Wd + 1;
    }
    page.cells.push(...slab);
    const holes = letters.filter((k) => k.solid).map((k) => ({ ...k, ch: ' ' }));
    anim.push(['bt', renderCells(ctx, holes, { ox: lc * CW, oy: top * CH, forceBg: true })
      + renderCells(ctx, letters.filter((k) => k.ch !== ' '), { ox: lc * CW, oy: top * CH })]);
    tagline(top + 8, [['she throws a bottle', LGR], [' ..... ', DGR], ['it washes straight back', LGR],
      [' ..... ', DGR], ['later, a reply', LGR]]);
    row = top + 10;
  }
  cutLine(page, row, '[ cut here ]', '[ end of colly ]');
  page.seg(row + 1, 1, [['logos', DGR], [' . ', DGR], ['wk cw lmp cnc nau', LGR], [' of ', DGR], ['strandline', LGR]]);
  const credit = 'no samples were harmed';
  page.text(row + 1, COLS - 1 - len(credit), credit, DGR);
  const ROWS = row + 2;

  // ---- motion: all of it on the beat, all of it looping on 4 bars -------------------------
  const pct = (beats) => `${((beats / 16) * 100).toFixed(4)}%`;
  // the drone hovers: half a row down for two beats, back up for two
  css.push(`.dr{animation:dr ${4 * BEAT}s step-end infinite}@keyframes dr{0%{transform:translateY(0)}50%{transform:translateY(${CH / 2}px)}100%{transform:translateY(0)}}`);
  css.push(`.ra{animation:wa ${BEAT}s step-end infinite}.rb{opacity:0;animation:wa ${BEAT}s step-end infinite;animation-delay:${BEAT / 2}s}`);
  css.push('@keyframes wa{0%{opacity:1}50%{opacity:0}100%{opacity:0}}');
  // the shark nods: down on every beat, up on the off-beat
  css.push(`.sk{animation:sk ${BEAT}s step-end infinite}@keyframes sk{0%{transform:translateY(${CH / 2}px)}50%{transform:translateY(0)}100%{transform:translateY(${CH / 2}px)}}`);
  // the crab walks sideways, a column a beat: four steps right, four back
  const walk = [0, 1, 2, 3, 4, 3, 2, 1];
  css.push(`.cb{animation:cb ${8 * BEAT}s step-end infinite}@keyframes cb{${walk.map((n, i) => `${((i / 8) * 100).toFixed(2)}%{transform:translateX(${n * CW}px)}`).join('')}100%{transform:translateX(0)}}`);
  css.push(`.la{animation:wa ${2 * BEAT}s step-end infinite}.lb{opacity:0;animation:wa ${2 * BEAT}s step-end infinite;animation-delay:${BEAT}s}`);
  // the bottle bobs on its slab: half a row down for a bar, back up for a bar
  css.push(`.bt{animation:bt ${8 * BEAT}s step-end infinite}@keyframes bt{0%{transform:translateY(0)}50%{transform:translateY(${CH / 2}px)}100%{transform:translateY(0)}}`);
  css.push('@media (prefers-reduced-motion:reduce){.dr,.sk,.cb,.bt,.ra,.la{animation:none;transform:none;opacity:1}.rb,.lb{animation:none;opacity:0}}');
  void pct; void LOOP;

  const body = [renderCells(ctx, page.cells), ...anim.map(([k, s]) => `<g class="${k}">${s}</g>`)].join('\n');
  const title = 'The rest of the Castaway logo colly: DRONE, SHARK, CRAB and BOTTLE';
  const desc = 'Four more ANSI block-letter logos on one black 80-column page, separated by dashed cut lines with bright blue "cut here" tags, each logo tagged by a different artist of Strandline and numbered colly 02 to 05 of 05. '
    + 'DRONE, by cw/stl: squared chrome capitals shaded white to light grey to dark grey, with light-cyan slivers in the counters and two rotors on short masts, their blades flickering between wide and narrow while the whole word hovers up and down. At the right, the word headphones stacked six times and fading. Tagline: a delivery drone, one parcel, inside it, another pair of headphones. '
    + 'SHARK, by lmp/stl: rounded capitals in light cyan, cyan and blue, where the A is a dorsal fin wearing headphones; the word nods down on every beat. At the left, nod . nod . nod stacked and fading. Tagline: a shark in headphones, nods on the beat, same playlist, apparently. '
    + 'CRAB, by cnc/stl: squat, wide capitals in coral and red with yellow slivers, a brown coconut shell worn on top of the B and eight half-block legs underneath, two per letter, kicking out and tucking in on alternate beats; the word walks sideways a column per beat, four steps right and four back. At the right, click . clack stacked and fading. Tagline: a coconut lands on a hermit crab, the crab keeps it, walks off in it. '
    + 'BOTTLE, by nau/stl: the outline variant, hollow black letters traced in underscores, slashes and pipes, coloured row by row from light green to cyan, bobbing on a hatched blue slab with dotted rules out to both edges. Tagline: she throws a bottle, it washes straight back, later, a reply. '
    + 'The page ends with a cut line tagged end of colly, the artists wk, cw, lmp, cnc and nau of Strandline, and the line: no samples were harmed.';
  return svgDoc(ctx, COLS * CW, ROWS * CH, title, desc, css, body);
}

// ---------------------------------------------------------------------------------------------
// The monochrome section logo in the .md (a <pre> block): a small block alphabet, each pixel two
// columns wide, shaded row by row through the ramp. `node ... --pre` prints it for pasting.
// ---------------------------------------------------------------------------------------------
// Two R's, because no two letters in a colly logo are the same letter twice: the last one kicks.
const MINI = {
  R: ['####.', '#...#', '####.', '#..#.', '#...#'],
  R2: ['####.', '#...#', '####.', '#.#..', '#..##'],
  O: ['.###.', '#...#', '#...#', '#...#', '.###.'],
  S: ['.####', '#....', '.###.', '....#', '####.'],
  T: ['#####', '..#..', '..#..', '..#..', '..#..'],
  E: ['#####', '#....', '####.', '#....', '#####'],
};
function preLogo(keys, ramp = ['█', '█', '▓', '▒', '░'], indent = 6) {
  return ramp.map((sh, y) => (' '.repeat(indent) + keys.map((k) => [...MINI[k][y]].map((p) => (p === '#' ? sh + sh : '  ')).join('')).join('  ')).trimEnd());
}
function rosterBlock() {
  const W = 78;
  const cut = (l, r) => `---${l}${'-'.repeat(W - 6 - len(l) - len(r))}${r}---`;
  const no = 'colly 06 of 05';
  return [cut('[ cut here ]', '[ cut here ]'), ' wk/stl', ...preLogo(['R', 'O', 'S', 'T', 'E', 'R2'], undefined, 4),
    `${' '.repeat(W - len(no))}${no}`, cut('[ cut here ]', '[ cut here ]')].join('\n');
}
if (process.argv.includes('--pre')) {
  console.log(rosterBlock());
  process.exit(0);
}

const OUT = [[`${SLUG}.svg`, buildHero()], [`${SLUG}-colly.svg`, buildColly()]];
fs.mkdirSync(ASSETS, { recursive: true });
for (const [name, svg] of OUT) {
  fs.writeFileSync(path.join(ASSETS, name), svg);
  console.log(`wrote assets/${name} (${(svg.length / 1024).toFixed(1)} KB)`);
}

// The .md is hand-written, except for the ROSTER logo at the top of its member list: that block
// (from its first cut line to its second) is kept in step with preLogo() here, in place.
{
  const md = path.join(HERE, '..', `${SLUG}.md`);
  if (fs.existsSync(md)) {
    const src = fs.readFileSync(md, 'utf8');
    const re = /(```text\n)---\[ cut here \]-+\[ cut here \]---\n wk\/stl\n[\s\S]*?\n---\[ cut here \]-+\[ cut here \]---\n/;
    if (!re.test(src)) console.warn(`${SLUG}.md: ROSTER block not found, left as it is`);
    else {
      const out = src.replace(re, (m, fence) => `${fence}${rosterBlock()}\n`);
      if (out !== src) { fs.writeFileSync(md, out); console.log(`updated the ROSTER block in ${SLUG}.md`); }
    }
  }
}
