#!/usr/bin/env node
// Castaway README header: "Shift_JIS AA" (05-shiftjis-aa_opus_5.5).
// Plain Node, no dependencies, fully deterministic.
//   node examples/castaway/src/05-shiftjis-aa_opus_5.5.mjs
// writes examples/castaway/assets/05-shiftjis-aa_opus_5.5.svg
//   ... --png=<file> also writes a 1:1 raster proof (handy while drawing).
//
// The style is Japanese text-board AA (Shift_JIS art, roughly 1999-2008):
// line drawings typed in a proportional font inside an anonymous forum post,
// black on the board's pale grey, a numbered header with name, date and ID.
// It is credited here, not copied: no existing AA character, no pasted art,
// no board's name or logo, and no proprietary font outlines. Everything is
// drawn for this file:
//
//   * THE FONT. A 16 px bitmap font drawn below, pixel by pixel. Only its
//     advance widths follow the convention the craft was built on (half-width
//     space 5 px, full-width space 11 px, period 3 px, kanji 16 px; 18 px line
//     pitch), because AA only lines up when the widths match. The shapes,
//     kanji included, are my own.
//   * THE ART. Every AA line below is typed as real text. Sprites are written
//     as runs of characters at pixel positions; a solver turns each gap into
//     the full-width / half-width spaces an AA editor would type, and the
//     result is checked against the two drafting taboos (never start a line
//     with a half-width space, never type two in a row). The finished post
//     text is stored in the SVG's <desc>, so the drawing is the text.
//   * THE PAGE. A numbered thread page in the board manner: red thread title,
//     post headers with a bold green name, blue >> reply links. All invented.
//
// Rendering: each distinct glyph becomes one merged-rect <path> in <defs> and
// every character on the page is a <use>. No <text>, no fonts, nothing
// external. A little "Flash AA" motion on CSS keyframes, all stepped: she nods
// on every beat of the 80 BPM theme (0.75 s), the shark nods too, the sea
// glints change every bar (3 s), and the ship sounds its horn once every four
// bars, which nobody hears (headphones). The loop is 12 s. The un-animated
// state is a complete frame, and prefers-reduced-motion switches motion off.

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateSync } from 'node:zlib';

const here = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(here, '../assets/05-shiftjis-aa_opus_5.5.svg');
const PNG_ARG = process.argv.find((a) => a.startsWith('--png='));

// ================================================================ metrics
// Advance widths in px at 16 px: the reference board font's metrics, which is
// what width-compatible free AA fonts copy too. Numbers only, no outlines.
const ADV = {
  ' ': 5, '　': 11,
  a: 8, b: 8, c: 8, d: 8, e: 8, f: 5, g: 7, h: 8, i: 3, j: 4, k: 7, l: 3, m: 12,
  n: 8, o: 8, p: 8, q: 8, r: 6, s: 7, t: 6, u: 8, v: 8, w: 10, x: 7, y: 7, z: 7,
  A: 10, C: 11, D: 10, I: 4, P: 10, S: 10, T: 10, W: 12, Y: 10,
  0: 8, 1: 8, 2: 8, 3: 8, 4: 8, 5: 8, 6: 8, 7: 8, 8: 8, 9: 8,
  '.': 3, ',': 3, ':': 3, ';': 3, "'": 3, '"': 8, '`': 7, '-': 8, '(': 5, ')': 5,
  '[': 5, ']': 5, '>': 8, '<': 8, '_': 5, '|': 4, '~': 7, '=': 8, '@': 11, '/': 8,
  'ｨ': 7, 'ﾞ': 4, 'ﾟ': 4, 'ﾘ': 8, 'ｰ': 10, 'ﾆ': 10, 'ﾉ': 8, 'ﾎ': 10, 'ﾁ': 10,
  'ｭ': 8, '･': 7, 'ﾍ': 10, '､': 7, 'ﾛ': 9,
  '：': 8, '【': 8, '】': 8, 'ｏ': 10, '⌒': 16, 'ヽ': 12, 'ノ': 11, 'ゝ': 12,
  'ー': 15, 'ι': 16, '≡': 16, '⊂': 16, '♪': 16, '○': 16, '◎': 16,
  '／': 16, '＼': 16, '￣': 16, '＿': 16, '｜': 16, '（': 8, '）': 8, '～': 16, '‐': 8,
  'し': 12, 'の': 16, '人': 16, '木': 16, '名': 16, '無': 16, '民': 16, '時': 16,
  '間': 16, '島': 16, 'ψ': 16, '｀': 8,
};
const PITCH = 18;
const wid = (s) => [...s].reduce((a, c) => {
  if (ADV[c] === undefined) throw new Error(`no advance for ${JSON.stringify(c)}`);
  return a + ADV[c];
}, 0);

// ================================================================ the font
// My own 16 px bitmap glyphs. PIX entries are [top row, left column,
// 'row|row|...'] with '#' for ink; row 13 is the Latin baseline, rows 0-15
// the full-width cell, rows 16-17 the line gap (descenders may dip into it).
const PIX = {
  // ---------------------------------------------------------------- lowercase
  a: [7, 1, '.####.|.....#|.....#|.#####|#....#|#...##|.###.#'],
  b: [3, 1, '#.....|#.....|#.....|#.....|#.###.|##...#|#....#|#....#|#....#|##...#|#.###.'],
  c: [7, 1, '.####.|#....#|#.....|#.....|#.....|#....#|.####.'],
  d: [3, 1, '.....#|.....#|.....#|.....#|.###.#|#...##|#....#|#....#|#....#|#...##|.###.#'],
  e: [7, 1, '.####.|#....#|#....#|######|#.....|#....#|.####.'],
  f: [3, 0, '..##|.#..|.#..|.#..|####|.#..|.#..|.#..|.#..|.#..|.#..'],
  g: [7, 0, '.###.#|#...##|#....#|#....#|#....#|#...##|.###.#|.....#|#....#|.####.'],
  h: [3, 1, '#.....|#.....|#.....|#.....|#.###.|##...#|#....#|#....#|#....#|#....#|#....#'],
  i: [4, 1, '#|.|.|#|#|#|#|#|#|#'],
  j: [4, 0, '..#|...|...|..#|..#|..#|..#|..#|..#|..#|..#|..#|##.'],
  k: [3, 1, '#....|#....|#....|#....|#...#|#..#.|#.#..|##...|#.#..|#..#.|#...#'],
  l: [3, 1, '#|#|#|#|#|#|#|#|#|#|#'],
  m: [7, 1, '#.##..##.|##..##..#|#...#...#|#...#...#|#...#...#|#...#...#|#...#...#'],
  n: [7, 1, '#.###.|##...#|#....#|#....#|#....#|#....#|#....#'],
  o: [7, 1, '.####.|#....#|#....#|#....#|#....#|#....#|.####.'],
  p: [7, 1, '#.###.|##...#|#....#|#....#|#....#|##...#|#.###.|#.....|#.....|#.....'],
  q: [7, 1, '.###.#|#...##|#....#|#....#|#....#|#...##|.###.#|.....#|.....#|.....#'],
  r: [7, 1, '#.##|##..|#...|#...|#...|#...|#...'],
  s: [7, 1, '.####|#....|#....|.###.|....#|....#|####.'],
  t: [5, 1, '.#..|.#..|####|.#..|.#..|.#..|.#..|.#..|..##'],
  u: [7, 1, '#....#|#....#|#....#|#....#|#....#|#...##|.###.#'],
  v: [7, 1, '#....#|#....#|.#..#.|.#..#.|.#..#.|..##..|..##..'],
  w: [7, 0, '#...#...#|#...#...#|#...#...#|.#.#.#.#.|.#.#.#.#.|..#...#..|..#...#..'],
  x: [7, 0, '#....#|.#..#.|.#..#.|..##..|.#..#.|.#..#.|#....#'],
  y: [7, 0, '#....#|#....#|.#..#.|.#..#.|..#.#.|..##..|...#..|...#..|..#...|##....'],
  z: [7, 0, '######|....#.|...#..|..#...|.#....|#.....|######'],
  // ---------------------------------------------------------------- capitals used
  A: [3, 0, '....#....|...#.#...|...#.#...|..#...#..|..#...#..|.#.....#.|.#######.|.#.....#.|#.......#|#.......#|#.......#'],
  C: [3, 1, '..#####..|.#.....#.|#.......#|#........|#........|#........|#........|#........|#.......#|.#.....#.|..#####..'],
  D: [3, 1, '######..|#.....#.|#......#|#......#|#......#|#......#|#......#|#......#|#......#|#.....#.|######..'],
  I: [3, 1, '#|#|#|#|#|#|#|#|#|#|#'],
  P: [3, 1, '#######.|#......#|#......#|#......#|#......#|#######.|#.......|#.......|#.......|#.......|#.......'],
  S: [3, 1, '.######.|#......#|#.......|#.......|.#......|..####..|......#.|.......#|.......#|#......#|.######.'],
  T: [3, 0, '#########|....#....|....#....|....#....|....#....|....#....|....#....|....#....|....#....|....#....|....#....'],
  W: [3, 0, '#.........#|#.........#|#.........#|#....#....#|.#...#...#.|.#..#.#..#.|.#..#.#..#.|.#..#.#..#.|..##...##..|..#.....#..|..#.....#..'],
  Y: [3, 0, '#.......#|.#.....#.|.#.....#.|..#...#..|...#.#...|....#....|....#....|....#....|....#....|....#....|....#....'],
  // ---------------------------------------------------------------- digits
  0: [3, 1, '.####.|#....#|#....#|#....#|#....#|#....#|#....#|#....#|#....#|#....#|.####.'],
  1: [3, 1, '..#...|.##...|#.#...|..#...|..#...|..#...|..#...|..#...|..#...|..#...|#####.'],
  2: [3, 1, '.####.|#....#|.....#|.....#|....#.|...#..|..#...|.#....|#.....|#.....|######'],
  3: [3, 1, '.####.|#....#|.....#|.....#|.....#|..###.|.....#|.....#|.....#|#....#|.####.'],
  4: [3, 1, '....#.|...##.|..#.#.|..#.#.|.#..#.|.#..#.|#...#.|######|....#.|....#.|....#.'],
  5: [3, 1, '######|#.....|#.....|#.....|#####.|.....#|.....#|.....#|.....#|#....#|.####.'],
  6: [3, 1, '..###.|.#....|#.....|#.....|#.###.|##...#|#....#|#....#|#....#|#....#|.####.'],
  7: [3, 1, '######|.....#|.....#|....#.|....#.|...#..|...#..|..#...|..#...|..#...|..#...'],
  8: [3, 1, '.####.|#....#|#....#|#....#|.#..#.|..##..|.#..#.|#....#|#....#|#....#|.####.'],
  9: [3, 1, '.####.|#....#|#....#|#....#|#....#|#...##|.###.#|.....#|.....#|....#.|.###..'],
  // ---------------------------------------------------------------- ascii punctuation
  '.': [13, 1, '#'],
  ',': [13, 0, '.#|.#|#.'],
  ':': [7, 1, '#|.|.|.|.|.|#'],
  ';': [7, 0, '.#|..|..|..|..|..|.#|.#|#.'],
  "'": [3, 1, '#|#|#'],
  '"': [3, 1, '#..#|#..#|#..#'],
  '`': [3, 2, '#...|.##.|...#'],
  '｀': [2, 2, '#...|.#..|..##'],
  '-': [8, 1, '######'],
  '(': [2, 1, '..#|.#.|.#.|#..|#..|#..|#..|#..|#..|#..|.#.|.#.|..#'],
  ')': [2, 1, '#..|.#.|.#.|..#|..#|..#|..#|..#|..#|..#|.#.|.#.|#..'],
  '[': [2, 1, '###|#..|#..|#..|#..|#..|#..|#..|#..|#..|#..|#..|###'],
  ']': [2, 1, '###|..#|..#|..#|..#|..#|..#|..#|..#|..#|..#|..#|###'],
  '>': [5, 1, '#.....|.##...|...##.|.....#|...##.|.##...|#.....'],
  '<': [5, 1, '.....#|...##.|.##...|#.....|.##...|...##.|.....#'],
  '_': [15, 0, '#####'],
  '|': [1, 1, '#|#|#|#|#|#|#|#|#|#|#|#|#|#|#'],
  '~': [6, 0, '.##...|#..#.#|....#.'],
  '=': [7, 1, '######|......|......|######'],
  '@': [4, 1, '..#####..|.#.....#.|#..###..#|#.#..#..#|#.#..#..#|#.#..#..#|#..##.##.|.#.......|..######.'],
  // ---------------------------------------------------------------- half-width kana
  'ｨ': [7, 0, '.....#|....#.|.####.|#..#..|...#..|...#..|...#..'],
  'ﾞ': [1, 0, '.#.#|#.#.'],
  'ﾟ': [1, 0, '.#.|#.#|.#.'],
  'ﾘ': [2, 1, '#...#|#...#|#...#|#...#|#...#|#...#|....#|....#|....#|...#.|...#.|..#..|.#...'],
  'ｰ': [8, 0, '#########'],
  'ﾆ': [4, 1, '.######.|........|........|........|........|........|........|........|########'],
  'ﾉ': [2, 0, '......#|......#|......#|.....#.|.....#.|.....#.|....#..|....#..|...#...|..#....|.#.....|#......'],
  'ﾍ': [6, 0, '...#.....|..#.#....|.#...#...|#.....#..|.......#.|........#'],
  'ﾎ': [2, 0, '....#....|....#....|#########|....#....|....#....|.#..#..#.|.#..#..#.|#...#...#|#...#...#|....#....|..###....'],
  'ﾁ': [2, 0, '.......##|..#####..|....#....|#########|....#....|....#....|....#....|...#.....|..#......|.#.......|#........'],
  'ｭ': [8, 0, '.###..|...#..|...#..|...#..|######'],
  'ﾛ': [5, 1, '#######|#.....#|#.....#|#.....#|#.....#|#.....#|#######'],
  '･': [8, 2, '##|##'],
  '､': [11, 1, '#..|.#.|..#'],
  // ---------------------------------------------------------------- full-width marks
  '：': [5, 3, '##|##|..|..|..|..|##|##'],
  '【': [0, 3, '#####|####.|###..|##...|##...|##...|##...|##...|##...|##...|##...|##...|##...|###..|####.|#####'],
  '】': [0, 0, '#####|.####|..###|...##|...##|...##|...##|...##|...##|...##|...##|...##|...##|..###|.####|#####'],
  'ｏ': [7, 1, '..####..|.#....#.|#......#|#......#|#......#|.#....#.|..####..'],
  '⌒': [2, 0, '.....######.....|...##......##...|..#..........#..|.#............#.'],
  'ヽ': [3, 3, '#.....|.#....|..#...|...#..|....#.|.....#|.....#'],
  'ノ': [1, 1, '........#|........#|........#|.......#.|.......#.|.......#.|......#..|.....#...|....#....|...#.....|..#......|.#.......|#........'],
  'ゝ': [3, 2, '##.......|..##.....|....#....|.....#...|......#..|.......#.|......#..|.....#...|...##....|.##......|#........'],
  'ー': [7, 1, '#############'],
  'ι': [6, 6, '#..|#..|#..|#..|#..|#..|.##'],
  'ψ': [2, 0, '.......#.......|.#.....#.....#.|.#.....#.....#.|.#.....#.....#.|.#.....#.....#.|..#....#....#..|...##..#..##...|.....#####.....|.......#.......|.......#.......|.......#.......|.......#.......'],
  '♪': [1, 5, '....#.....|....##....|....#.#...|....#..#..|....#..#..|....#.#...|....#.....|....#.....|....#.....|.####.....|#####.....|####......|.##.......'],
  '≡': [4, 1, '##############|..............|..............|..............|##############|..............|..............|..............|##############'],
  '⊂': [3, 1, '....#########|..##.........|.#...........|#............|#............|#............|.#...........|..##.........|....#########'],
  // ---------------------------------------------------------------- kana / kanji (16 x 16, my own drawings)
  'し': [1, 2, '#........|#........|#........|#........|#........|#........|#........|#........|#........|#........|#......#.|.#....#..|..####...'],
  'の': [2, 0, '......####......|....##..#.##....|...#....#...#...|..#.....#....#..|.#.....#......#.|.#.....#......#.|#.....#.......#.|#.....#.......#.|#....#.......#..|#...#........#..|.###........#...|..........##....|........##......'],
  '人': [0, 0, '.......#........|.......#........|.......#........|.......#........|.......#........|.......##.......|......#..#......|......#..#......|.....#....#.....|.....#....#.....|....#......#....|...#........#...|..#..........#..|.#............##|#...............'],
  '木': [0, 0, '.......#........|.......#........|.......#........|################|.......#........|......###.......|.....#.#.#......|....#..#..#.....|...#...#...#....|..#....#....#...|.#.....#.....#..|#......#......##|.......#........|.......#........|.......#........'],
  '名': [0, 0, '.....#..........|....#######.....|...#......#.....|..#.#....#......|.#...#..#.......|......##........|.....##.........|...##...........|.##.##########..|#...#........#..|....#........#..|....#........#..|....#........#..|....##########..|....#........#..'],
  '無': [0, 0, '....#...........|...#............|..############..|.#.#..#..#..#...|...#..#..#..#...|.##############.|...#..#..#..#...|...#..#..#..#...|...#..#..#..#...|################|................|..#..#....#..#..|.#...#.....#..#.|#...#......#...#'],
  '民': [1, 0, '..##########....|..#........#....|..#........#....|..##########....|..#.....#.......|..#......#......|..#############.|..#.......#.....|..#........#....|..#.........#...|..#....##....#..|..#..##.......#.|..###..........#|..............##'],
  '時': [0, 0, '...........#....|...........#....|#####..#########|#...#......#....|#...#......#....|#...#.##########|#####...........|#...#.......#...|#...############|#...#...#...#...|#####....#..#...|#...#.......#...|#...#.......#...|............#...|..........###...'],
  '間': [0, 0, '.#####..######..|.#...#..#....#..|.#####..######..|.#...#..#....#..|.#####..######..|.#...........#..|.#..#######..#..|.#..#.....#..#..|.#..#######..#..|.#..#.....#..#..|.#..#######..#..|.#...........#..|.#...........#..|.#.........###..'],
  '島': [0, 0, '........#.......|.......#........|...##########...|...#........#...|...##########...|...#........#...|...##########...|...#............|..#############.|..............#.|......#.......#.|...#..#..#....#.|...#..#..#....#.|...#######....#.|..............#.|............##..'],
};
// Line-art glyphs drawn with strokes on the 16 px cell
const STROKES = {
  '／': [[0, 15, 15, 0]],
  '＼': [[0, 0, 15, 15]],
  '/': [[0, 14, 6, 2]],
  '￣': [[0, 0, 15, 0]],
  '＿': [[0, 15, 15, 15]],
  '｜': [[7, 0, 7, 15]],
  '‐': [[1, 8, 6, 8]],
};
// Curves drawn as point lists (polyline)
const POLY = {
  '（': [[6, 0], [4, 2], [3, 4], [3, 11], [4, 13], [6, 15]],
  '）': [[1, 0], [3, 2], [4, 4], [4, 11], [3, 13], [1, 15]],
  '～': [[0, 8], [1, 6], [2, 5], [4, 5], [6, 6], [9, 8], [11, 8], [13, 7], [14, 5]],
};
const CIRCLES = {
  '○': [[7.5, 7.5, 6.6]],
  '◎': [[7.5, 7.5, 6.6], [7.5, 7.5, 3.2]],
};

// ================================================================ glyph rasteriser
function bresenham(set, x0, y0, x1, y1) {
  let dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), e = dx + dy;
  const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  for (;;) {
    set.add(`${x0},${y0}`);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * e;
    if (e2 >= dy) { e += dy; x0 += sx; }
    if (e2 <= dx) { e += dx; y0 += sy; }
  }
}
const GLYPH = new Map();
function glyph(ch, bold = false) {
  const key = (bold ? 'b' : '') + ch;
  if (GLYPH.has(key)) return GLYPH.get(key);
  const set = new Set();
  if (PIX[ch]) {
    const [t, l, rows] = PIX[ch];
    rows.split('|').forEach((r, y) => [...r].forEach((c, x) => { if (c === '#') set.add(`${x + l},${y + t}`); }));
  } else if (STROKES[ch]) for (const s of STROKES[ch]) bresenham(set, ...s);
  else if (POLY[ch]) { const p = POLY[ch]; for (let i = 1; i < p.length; i++) bresenham(set, ...p[i - 1], ...p[i]); }
  else if (CIRCLES[ch]) {
    for (const [cx, cy, r] of CIRCLES[ch]) for (let a = 0; a < 360; a += 2) {
      set.add(`${Math.round(cx + r * Math.cos(a * Math.PI / 180))},${Math.round(cy + r * Math.sin(a * Math.PI / 180))}`);
    }
  } else if (ch !== ' ' && ch !== '　') throw new Error(`no glyph for ${JSON.stringify(ch)}`);
  let px = [...set].map((k) => k.split(',').map(Number));
  if (bold) { const b = new Set(set); for (const [x, y] of px) b.add(`${x + 1},${y}`); px = [...b].map((k) => k.split(',').map(Number)); }
  const g = { px, id: null };
  GLYPH.set(key, g);
  return g;
}
// pixels -> merged rectangles -> one compact path
function glyphPath(px) {
  const rows = new Map();
  for (const [x, y] of px) { if (!rows.has(y)) rows.set(y, []); rows.get(y).push(x); }
  const runs = [];
  for (const [y, xs] of rows) {
    xs.sort((a, b) => a - b);
    let s = xs[0], p = xs[0];
    for (let i = 1; i <= xs.length; i++) {
      if (i < xs.length && xs[i] === p + 1) { p = xs[i]; continue; }
      runs.push({ x: s, y, w: p - s + 1, h: 1 });
      if (i < xs.length) { s = p = xs[i]; }
    }
  }
  // merge vertically when a run sits exactly under one of the same span
  runs.sort((a, b) => a.x - b.x || a.w - b.w || a.y - b.y);
  const rects = [];
  for (const r of runs) {
    const last = rects[rects.length - 1];
    if (last && last.x === r.x && last.w === r.w && last.y + last.h === r.y) last.h++;
    else rects.push({ ...r });
  }
  return rects.map((r) => `M${r.x} ${r.y}h${r.w}v${r.h}h${-r.w}z`).join('');
}

// ================================================================ AA composer
// A sprite is a list of lines; each line is runs of text placed by markers:
//   '@120 text'  run starts at x=120 (sprite-relative)
//   '@c120 text' run is centred on x=120;  '@r120 text' run ends at x=120
//   two or more ASCII spaces advance the pen 5 px each (drafting shorthand)
function parseSprite(lines) {
  return lines.map((l) => {
    const segs = [];
    let pen = 0, align = '';
    for (const t of l.replace(/ (?=@[cr]?-?\d+ )/g, '').split(/(@[cr]?-?\d+ |  +)/).filter((v) => v !== '')) {
      if (t[0] === '@') { const m = t.slice(1, -1); pen = +m.replace(/^[cr]/, ''); align = /^[cr]/.test(m) ? m[0] : ''; continue; }
      if (/^ {2,}$/.test(t)) { pen += 5 * t.length; continue; }
      if (align === 'c') pen = Math.round(pen - wid(t) / 2); else if (align === 'r') pen -= wid(t);
      align = '';
      segs.push([pen, t]);
      pen += wid(t);
    }
    return segs;
  });
}
// The spaces an AA editor would type to cover a gap: full-width (11) and
// half-width (5) spaces, never two half-widths in a row, never a half-width
// first on a line. Returns the closest reachable width.
function spacesFor(gap, atStart, prevHalf) {
  let best = null;
  for (let F = 0; F <= 90; F++) {
    const maxH = F + (atStart || prevHalf ? 0 : 1);
    for (let H = 0; H <= maxH; H++) {
      const v = 11 * F + 5 * H, sc = Math.abs(v - gap) * 100 + F + H;
      if (!best || sc < best.sc) best = { sc, F, H };
    }
  }
  let { F, H } = best, s = '', half = !atStart && !prevHalf && H === F + 1;
  while (F || H) { if (half && H) { s += ' '; H--; } else if (F) { s += '　'; F--; } else { s += ' '; H--; } half = !half; }
  return s;
}
// sprites -> one array of placed runs per line, plus the typed line text
function compose(nLines, sprites) {
  const rows = Array.from({ length: nLines }, () => []);
  for (const sp of sprites) {
    if (!sp.lines) continue;
    parseSprite(sp.lines).forEach((segs, i) => {
      const r = sp.y + i;
      if (r < 0 || r >= nLines) return;
      for (const [dx, t] of segs) rows[r].push({ x: sp.x + dx, t, who: sp.name });
    });
  }
  // background fills (horizon, rules): repeat a character through every gap
  for (const sp of sprites) if (sp.fill) for (const [r, x0, x1, ch, pad = 3] of sp.fill) {
    const segs = rows[r].slice().sort((a, b) => a.x - b.x);
    let cur = 0;
    const gaps = [];
    for (const s of segs) { gaps.push([cur, s.x]); cur = Math.max(cur, s.x + wid(s.t)); }
    gaps.push([cur, 1e9]);
    for (let [a, b] of gaps) {
      a = Math.max(a + (a ? pad : 0), x0); b = Math.min(b - pad, x1);
      const n = Math.floor((b - a) / wid(ch));
      if (n > 0) rows[r].push({ x: a, t: ch.repeat(n), who: sp.name });
    }
  }
  const problems = [];
  const lines = rows.map((segs, r) => {
    segs.sort((a, b) => a.x - b.x);
    let text = '', pen = 0;
    const placed = [];
    for (const s of segs) {
      if (s.x < pen) problems.push(`line ${r}: "${s.t}" (${s.who}) starts at ${s.x}, inside the previous run (pen ${pen})`);
      const sp = spacesFor(Math.max(0, s.x - pen), text === '', text.endsWith(' '));
      text += sp; pen += wid(sp);
      placed.push({ x: pen, t: s.t, who: s.who });
      text += s.t; pen += wid(s.t);
    }
    // the two taboos, checked on the finished line
    if (text.startsWith(' ')) problems.push(`line ${r}: starts with a half-width space`);
    if (text.includes('  ')) problems.push(`line ${r}: two half-width spaces in a row`);
    return { text, placed, width: pen };
  });
  if (process.env.AA_DEBUG) rows.forEach((segs, r) => console.log(r, segs.map((q) => `${q.x}:${q.t}`).join(' | ')));
  if (problems.length) throw new Error('AA layout:\n  ' + problems.join('\n  '));
  return lines;
}

// ================================================================ the drawing
// The title: CASTAWAY spelled in 島 ("island"), one kanji per dot.
const BIG = {
  C: ['.##', '#..', '#..', '#..', '.##'],
  A: ['.#.', '#.#', '###', '#.#', '#.#'],
  S: ['###', '#..', '###', '..#', '###'],
  T: ['###', '.#.', '.#.', '.#.', '.#.'],
  W: ['#...#', '#...#', '#.#.#', '#.#.#', '.#.#.'],
  Y: ['#.#', '#.#', '.#.', '.#.', '.#.'],
};
function bigWord(word, ink, cell = 16, gap = 16) {
  const lines = ['', '', '', '', ''];
  let x = 0;
  for (const ch of word) {
    const g = BIG[ch];
    g.forEach((row, r) => [...row].forEach((c, i) => { if (c === '#') lines[r] += `@${x + i * cell} ${ink}`; }));
    x += g[0].length * cell + gap;
  }
  return lines.map((l) => l.trim());
}

// The scene, as typed. "== name x y" starts a sprite at that pixel x and
// line y; "(blank)" is an empty row. Positions are sprite-relative.
const ART = String.raw`
== palm 470 0
@c160 ,.-‐''"￣"''‐-.,
@70 -‐'"ﾞ''‐-.,ﾘ| ｜ |ﾘ,.-‐''ﾞ"'‐-.,
@58 ,ｨ'ﾘ @84 ,.ｨ'"ﾞ'ｰ.,ﾘ|ﾘ,.ｰ'"ﾞ'ｰ., ﾘﾘﾘﾘ"'ｰ.,
@64 ／ﾘﾘﾘﾘ /ﾘﾘ ｏ8ｏ ﾘﾘ＼ ﾘﾘﾘﾘ＼  ﾘﾘ＼
@64 ／ﾘﾘ  @c156 )ﾆ(  @206 ﾘﾘ＼  @284 ﾘ
@c154 )ﾆ(
@c150 )ﾆ(
@c146 )ﾆ(
@c142 )ﾆ(
@c138 )ﾆ(
@c134 )ﾆ(
@c130 )ﾆ(
@c126 )ﾆ(
== clouds 0 5
@38 ,⌒ヽ⌒ヽ @136 ,⌒ヽ
@14 ,⌒  @102 ヽ⌒ヽ⌒  @184 ヽ､
== ship 270 5
@26 ,;⌒
@14 __|￣|__
＼＿＿＿＿＿／
== toot 326 5
ﾎﾞｰ
== birds 372 5
ﾍ  @30 ﾍ
@14 ﾍ
== fin 150 8
@62 ♪
@37 ／|
@21 ／ @53 |
== shark 150 10
～ @57 ～～
== head 420 7
@13 ,.-‐''￣''‐-.,
@8 ／,ﾉﾉﾉﾉﾉ､＼
@4 ◎ﾘ -　 - ﾘ◎
@-2 (@) @25 ヽ @c49 ‐ @61 ノ
== note 526 9
♪
== body 420 11
@17 ／|ヽ_ノ|＼⊂(○)
@31 |_人_|
@31 ι @48 ι
== sip 556 11
ﾁｭｰ
== island 360 12
@30 ,,.-‐'' @172 ''"￣ @254 ￣"''‐-..,,
～ ,ｨ'' @136 :.:..:.:: @204 ψﾉ''ヽψ @266 .:.:: ''ヽ,
～～ ﾞ''‐-..,,＿＿＿＿＿＿＿＿＿,,..-‐''ﾞ ～～
== raft 670 13
@4 ,(＿＿ﾘ＿＿ﾘ＿)
(＿＿ﾘ＿＿ﾘ＿)ﾞ
== turtle 170 13
@20 ,.-‐''￣''‐-.,
,ｨ'＼／＼／＼／ヽ_(･ )
@-2 ～ヽ'ｰ‐---‐‐---‐'ﾉ ～
== bottle 30 11
～ ﾛ=(≡≡≡) ～
== glint 0 8
@660 ･ﾟ
@96 ﾟ  @760 ･
(blank)
@262 ﾟ･
(blank)
@20 ･ﾟ
== glint2 0 8
@740 ﾟ
(blank)
@300 ･
@690 ﾟ･
@110 ﾟ
== waves 0 8
@330 ‐-  @700 -‐
@20 ‐-
(blank)
@330 ～ ～
(blank)
(blank)
(blank)
@0 ～ ～～ @390 ～～ ～   @540 ～～ ～   @720 ～ ～
@60 ～～ ～  @380 ～ ～～  @620 ～ ～～ ～
`;
const SPRITES = [{ name: 'title', x: 0, y: 0, lines: bigWord('CASTAWAY', '島') }];
for (const block of ART.split(/^== /m).slice(1)) {
  const [head, ...lines] = block.replace(/\n$/, '').split('\n');
  const [name, x, y] = head.trim().split(/\s+/);
  SPRITES.push({ name, x: +x, y: +y, lines: lines.map((l) => (l === '(blank)' ? '' : l)) });
}
SPRITES.push({ name: 'horizon', fill: [[7, 0, 780, '￣']] });
const AA = compose(17, SPRITES);

// ================================================================ the page
const W = 830;
const COL = { bg: '#efefef', ink: '#000000', title: '#ff0000', name: '#228b22', link: '#0000ff', edge: '#c4c4c4' };
const ANIM = { head: 'nod', note: 'hop', fin: 'nod', toot: 'toot', glint: 'tw1', glint2: 'tw2' };
const marks = [];   // {ch, x, y, color, bold, cls}
const rules = [];   // underlines: {x, y, w, color}
function type(text, x, y, color = COL.ink, { bold = false, cls = '', underline = false } = {}) {
  const x0 = x;
  for (const ch of text) {
    if (ch !== ' ' && ch !== '　') marks.push({ ch, x, y, color, bold, cls });
    x += ADV[ch] ?? wid(ch);
  }
  if (underline) rules.push({ x: x0, y: y + 15, w: x - x0, color });
  return x;
}
const X0 = 12;        // left edge of post headers
const BODY = 34;      // post bodies are indented, as on the boards
let y = 12;
// thread title
type('【無人島】CASTAWAY Part1【10時間】', X0, y, COL.title, { bold: true });
y += 30;
function header(n, time, id) {
  let x = type(`${n} ：`, X0, y);
  x = type('名無しの島民', x, y, COL.name, { bold: true });
  type(`：2026/10/01(木) ${time} ID:${id}`, x, y);
  y += PITCH + 6;
}
header(1, '10:00:00', 'seed1992');
AA.forEach((ln, i) => {
  for (const p of ln.placed) type(p.t, BODY + p.x, y + i * PITCH, COL.ink, { cls: ANIM[p.who] || '' });
});
y += AA.length * PITCH + 8;
const POST = [
  'a lo-fi video for youtube: one tiny island, one tall palm, one raft and ten hours. she idles, nodding along.',
  'every so often something happens: a routine every 2-5 min, a small gag every 12-25, a set piece every 30-60,',
  'and every 3-6 hours something very rare. each one starts on the next bar of the music, so gags land on the beat.',
  'every sound is synthesized from code. to watch: python tools/serve.py, then open http://127.0.0.1:8765/',
];
for (const l of POST) {
  if (wid(l) > W - BODY - 12) throw new Error(`post line too wide (${wid(l)} px): ${l}`);
  type(l, BODY, y); y += PITCH;
}
y += 16;
header(2, '10:00:03', 'k0k0nut5');
let x = type('>>1', BODY, y, COL.link, { underline: true });
type(' a ship just sailed past. she was busy with a coconut.', x, y);
y += PITCH + 16;
header(3, '10:00:06', 'seed1992');
x = type('>>2', BODY, y, COL.link, { underline: true });
type(' it does that.', x, y);
y += PITCH + 12;
const H = y;

// ================================================================ svg
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
let nextId = 0;
const defs = [];
for (const m of marks) {
  const g = glyph(m.ch, m.bold);
  if (g.id === null) { g.id = 'g' + (nextId++).toString(36); defs.push(`<path id="${g.id}" d="${glyphPath(g.px)}"/>`); }
  m.id = g.id;
}
const groups = new Map();
for (const m of marks) {
  const k = `${m.cls}|${m.color}`;
  if (!groups.has(k)) groups.set(k, []);
  groups.get(k).push(`<use href="#${m.id}" x="${m.x}" y="${m.y}"/>`);
}
const body = [...groups].map(([k, uses]) => {
  const [cls, color] = k.split('|');
  return `<g${cls ? ` class="${cls}"` : ''} fill="${color}">${uses.join('')}</g>`;
}).join('\n');
const underl = rules.map((r) => `<rect x="${r.x}" y="${r.y}" width="${r.w}" height="1" fill="${r.color}"/>`).join('');

const source = [
  '【無人島】CASTAWAY Part1【10時間】', '',
  '1 ：名無しの島民：2026/10/01(木) 10:00:00 ID:seed1992',
  ...AA.map((l) => l.text), ...POST, '',
  '2 ：名無しの島民：2026/10/01(木) 10:00:03 ID:k0k0nut5',
  '>>1 a ship just sailed past. she was busy with a coconut.', '',
  '3 ：名無しの島民：2026/10/01(木) 10:00:06 ID:seed1992',
  '>>2 it does that.',
].join('\n');

const css = `
.nod{animation:nod .75s steps(1,end) infinite}
.hop{animation:hop 1.5s steps(1,end) infinite}
.toot{animation:toot 12s steps(1,end) infinite}
.tw1{animation:tw 6s steps(1,end) infinite}
.tw2{animation:tw 6s steps(1,end) -3s infinite}
@keyframes nod{0%{transform:translateY(2px)}45%{transform:translateY(0)}}
@keyframes hop{0%{transform:translate(0,0)}50%{transform:translate(5px,-4px)}}
@keyframes toot{0%{opacity:1}25%{opacity:0}}
@keyframes tw{0%{opacity:1}50%{opacity:0}}
@media (prefers-reduced-motion:reduce){.nod,.hop,.toot,.tw1,.tw2{animation:none}}`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="t d">
<title id="t">Castaway: a text-board thread, drawn in Shift_JIS-style text art</title>
<desc id="d">${esc(source)}</desc>
<style>${css}
</style>
<defs>${defs.join('')}</defs>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="3" fill="${COL.bg}" stroke="${COL.edge}"/>
${body}
${underl}
</svg>
`;
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, svg);
console.log(`wrote ${OUT} (${(svg.length / 1024).toFixed(1)} KB, ${marks.length} glyphs, ${defs.length} distinct, ${W}x${H})`);
console.log(`AA block: ${AA.length} lines, widest ${Math.max(...AA.map((l) => l.width))} px, title typed with ${SPRITES[0].lines.join('').split('島').length - 1} x 島`);

// ================================================================ optional raster proof
if (PNG_ARG) {
  const file = PNG_ARG.slice(6);
  const hex = (c) => parseInt(c.slice(1), 16);
  const px = new Int32Array(W * H).fill(hex(COL.bg));
  const dot = (x, y, c) => { if (x >= 0 && x < W && y >= 0 && y < H) px[y * W + x] = c; };
  for (const m of marks) for (const [gx, gy] of glyph(m.ch, m.bold).px) dot(m.x + gx, m.y + gy, hex(m.color));
  for (const r of rules) for (let i = 0; i < r.w; i++) dot(r.x + i, r.y, hex(r.color));
  const crcT = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
  const crc = (b) => { let c = 0xffffffff; for (const v of b) c = crcT[(c ^ v) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
  const chunk = (t, d) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([l, td, c]); };
  const raw = Buffer.alloc((W * 3 + 1) * H);
  for (let yy = 0; yy < H; yy++) for (let xx = 0; xx < W; xx++) { const v = px[yy * W + xx], o = yy * (W * 3 + 1) + 1 + xx * 3; raw[o] = v >> 16 & 255; raw[o + 1] = v >> 8 & 255; raw[o + 2] = v & 255; }
  const ih = Buffer.alloc(13); ih.writeUInt32BE(W, 0); ih.writeUInt32BE(H, 4); ih[8] = 8; ih[9] = 2;
  writeFileSync(file, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ih), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]));
  console.log(`wrote ${file}`);
}

