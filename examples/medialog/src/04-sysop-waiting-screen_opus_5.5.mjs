#!/usr/bin/env node
// MediaLog as a sysop's waiting-for-caller screen: the local console a DOS bulletin board showed
// its owner while nobody was dialled in. Style reference: the WFC screens of early-90s BBS
// packages, here the RemoteAccess flavour (a grey stipple of shade characters, black windows framed
// in cyan double lines with each title set into the right end of the top border: Status, Modem,
// Time and a tall System window of label : value lines ending in ON/OFF switches, then a key legend
// along the bottom with an ALT group). Nothing is copied from that package: no names, no board, no
// screen text. Every word, name and letterform here is MediaLog's own or invented for it.
//
// Regenerate:  node examples/medialog/src/04-sysop-waiting-screen_opus_5.5.mjs
// Writes assets/04-sysop-waiting-screen_opus_5.5.svg and 04-sysop-waiting-screen_opus_5.5.md (the
// markdown quotes the screen, so both come from the same data).
//
// Plain Node, no dependencies, deterministic (no clock, no randomness). The screen is an 80 x 41
// grid of 9 x 16 cells (VGA text mode: 8-pixel glyphs plus a ninth column that box-drawing and block
// characters fill) drawn with a CP437-style bitmap font defined below. Text is <use> references to
// glyph paths, never <text>, so it looks the same for every viewer. Animation is CSS only, so
// prefers-reduced-motion switches it off and leaves a complete, readable frame (the t = 0 frame).
//
// What moves:
//   - the verb in the line under the logo: watched, read, played, listened to, each in the colour
//     of its kind;
//   - the clock in the Time window ticks once a second (each digit is its own strip with its own
//     period, so it carries properly and never visibly loops);
//   - every CALL seconds a friend "calls": the modem RINGs, CONNECTs, the entry they are logging
//     types itself into the Modem window (Snoop is ON), the Status line says who and what, the
//     System window's last caller changes, their kind lights up in the key along the bottom and its
//     letter in the logo lifts off its shadow; then NO CARRIER, and they log off with a deadpan
//     remark. The modem is re-initialised and the board goes back to waiting, so each call ends
//     exactly where it began and the loop point is invisible (the clock just keeps going).
//
// The sample media, the friends and the sysop's own (telephone-themed) log are all invented, apart
// from one public-domain classic. MediaLog keeps a diary of what you watched, read, played and
// listened to; nothing on this board carries the media itself.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '04-sysop-waiting-screen_opus_5.5';
const SVG_OUT = path.join(HERE, '..', 'assets', `${SLUG}.svg`);
const MD_OUT = path.join(HERE, '..', `${SLUG}.md`);

// ---------------------------------------------------------------------------------------------
// Screen geometry and row map
// ---------------------------------------------------------------------------------------------
const COLS = 80, ROWS = 41, CW = 9, CH = 16, PAD = 14;
const SW = COLS * CW, SH = ROWS * CH;
const VBW = SW + PAD * 2, VBH = SH + PAD * 2;
// The logo is placed in half-cell pixels: LOGO_Y is the half-row of the letters' cap line.
const R = { title: 0, line: 9, win: 11, log: 29, kinds: 39, keys: 40 };
const LOGO_Y = 5;

// The DOS sixteen, for the console's own furniture.
const BLK = '#000000', CYN = '#00AAAA', LGR = '#AAAAAA', DGR = '#555555', LGN = '#55FF55',
  LRD = '#FF5555', YEL = '#FFFF55', WHT = '#FFFFFF', LCY = '#55FFFF';
// MediaLog's navy, from the app's ink and logo.
const NAVY = '#18223a';
// MediaLog's own kind colours, sampled from the app (base), and lighter versions that read as
// text on a black window (lit). "Each kind has its colour."
const KINDS = {
  movie: { label: 'Movies', a: 'a movie', base: '#c23b3b', lit: '#ff6f61' },
  tv: { label: 'TV shows', a: 'a TV show', base: '#2879b8', lit: '#5fb2f2' },
  anime: { label: 'Anime', a: 'an anime', base: '#2879b8', lit: '#5fb2f2' },
  book: { label: 'Books', a: 'a book', base: '#a96d12', lit: '#f2a83c' },
  comics: { label: 'Comics', a: 'a comic', base: '#b8327f', lit: '#f466b8' },
  manga: { label: 'Manga', a: 'a manga', base: '#b8327f', lit: '#f466b8' },
  game: { label: 'Games', a: 'a game', base: '#5f8a14', lit: '#9fd43c' },
  podcast: { label: 'Podcasts', a: 'a podcast', base: '#6c44bf', lit: '#a987f7' },
  music: { label: 'Music', a: 'an album', base: '#0e8a73', lit: '#33d6b3' },
  video: { label: 'Videos', a: 'a video', base: '#6e3a63', lit: '#c983b8' },
};
const KIND_ORDER = ['movie', 'tv', 'anime', 'book', 'comics', 'manga', 'game', 'podcast', 'music', 'video'];

// ---------------------------------------------------------------------------------------------
// CP437-style 8x16 bitmap font. Rows are '#'/'.' strings placed from row `top` of the cell.
// Capitals sit on rows 2-11 with VGA's 2-pixel stems; lowercase x-height starts on row 5.
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
  ';': [5, '...##.. ...##.. ....... ....... ...##.. ...##.. ...##.. ..##...'],
  '!': [2, '...##.. ..####. ..####. ..####. ...##.. ...##.. ...##.. ....... ...##.. ...##..'],
  '?': [2, '.#####. ##...## ##...## ....##. ...##.. ...##.. ...##.. ....... ...##.. ...##..'],
  "'": [1, '...##.. ...##.. ..##...'],
  '"': [1, '.##..##. .##..##. ..#..#..'],
  '-': [7, '#######'],
  '_': [13, '########'],
  '/': [4, '......# .....## ....##. ...##.. ..##... .##.... ##..... #......'],
  '(': [2, '....##. ...##.. ..##... ..##... ..##... ..##... ..##... ..##... ...##.. ....##.'],
  ')': [2, '.##.... ..##... ...##.. ...##.. ...##.. ...##.. ...##.. ...##.. ..##... .##....'],
  '[': [2, '.####.. .##.... .##.... .##.... .##.... .##.... .##.... .##.... .##.... .####..'],
  ']': [2, '.####.. ...##.. ...##.. ...##.. ...##.. ...##.. ...##.. ...##.. ...##.. .####..'],
  '>': [3, '.##.... ..##... ...##.. ....##. .....## ....##. ...##.. ..##... .##....'],
  '<': [3, '....##. ...##.. ..##... .##.... ##..... .##.... ..##... ...##.. ....##.'],
  '#': [2, '.##.##. .##.##. ####### .##.##. .##.##. .##.##. ####### .##.##. .##.##.'],
  '+': [5, '...##... ...##... .######. ...##... ...##...'],
  '=': [6, '.######. ........ ........ .######.'],
  '*': [5, '.##..##. ..####.. ######## ..####.. .##..##.'],
  '%': [4, '##....# ##...## ....##. ...##.. ..##... .##.... ##..##. #...##.'],
  '&': [2, '.###... ##.##.. ##.##.. .###... .###.## ##.###. ##..##. ##..##. ##..##. .###.##'],
  '@': [3, '.#####. ##...## ##...## ##.#### ##.#### ##.#### ##.###. ##..... .#####.'],
  '~': [2, '.###.## ##.###.'],
  '·': [7, '...##... ...##...'],
  // CP437 symbols used as MediaLog's reactions: 0x03 heart (loved) and 0x01 smiley (the little
  // face on a custom verdict). Liked is a thumbs-up, which CP437 lacks, so it is drawn in the same
  // 8x16 grid the way a DOS program would load one custom glyph into the character generator.
  // It is keyed to '¤' in the strings below.
  '♥': [4, '.##.##.. ######## ######## ######## .######. ..####.. ...##... ........'],
  '☺': [2, '.######. #......# #.#..#.# #......# #......# #.####.# #..##..# #......# #......# .######.'],
  '¤': [2, '....#... ...##... ...##... ..##.... ##.####. ##.#...# ##.####. ##.#...# ##.####. ##.#...# ##..###.'],
  '■': [4, '........ .######. .######. .######. .######. .######. .######.'],
};
for (const [ch, [top, rows]] of Object.entries(PUNCT)) def(ch, top, rows);
FONT.set(' ', new Array(16).fill(0));

// Block elements and the single line, as whole-cell glyphs.
const block = (ch, fn) => { const g = new Array(16).fill(0); for (let y = 0; y < 16; y++) for (let x = 0; x < 8; x++) if (fn(x, y)) g[y] |= 1 << (7 - x); FONT.set(ch, g); };
block('█', () => true);
block('▌', (x) => x < 4);
block('▐', (x) => x >= 4);
block('─', (x, y) => y === 7);
// Glyphs whose strokes run off the right edge carry on through the ninth column (VGA does this
// for the C0-DF range).
const NINTH = new Set(['█', '▐', '─']);

// Bitmap -> compact path (greedy merge of horizontal runs into rectangles).
function bitmapPath(rows, width, sx = 1, sy = 1, ox = 0, oy = 0) {
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
  return rects.map((r) => `M${ox + r.x * sx} ${oy + r.y * sy}h${r.w * sx}v${r.h * sy}h${-r.w * sx}z`).join('');
}
const bit = (v, x, ninth) => (x < 8 ? (v >> (7 - x)) & 1 : ninth ? v & 1 : 0);
const glyphPath = (ch) => bitmapPath(FONT.get(ch).map((v) => (x) => bit(v, x, NINTH.has(ch))), CW);

const glyphIds = new Map();
function gid(ch) {
  if (!FONT.has(ch)) throw new Error(`no glyph for ${JSON.stringify(ch)} (U+${ch.codePointAt(0).toString(16)})`);
  if (!glyphIds.has(ch)) glyphIds.set(ch, `g${glyphIds.size.toString(36)}`);
  return glyphIds.get(ch);
}
const len = (s) => [...s].length;

// Colour classes, so every fill in the picture is a short class name.
const colourClass = new Map();
function cc(colour) {
  if (!colourClass.has(colour)) colourClass.set(colour, `c${colourClass.size.toString(36)}`);
  return colourClass.get(colour);
}

// Text for animated layers: coloured segments on one row, as <use> runs inside a group that
// carries the row offset. Parts are [text, fg] or [text, fg, bg].
function text(r, c, parts) {
  let out = '';
  for (const [t, fg, bgc] of parts) {
    if (bgc) out += `<rect class="${cc(bgc)}" x="${c * CW}" y="${r * CH}" width="${len(t) * CW}" height="${CH}"/>`;
    let u = '';
    for (const ch of t) {
      if (ch !== ' ') u += `<use href="#${gid(ch)}" x="${c * CW}"/>`;
      c++;
    }
    if (u) out += `<g class="${cc(fg)}" transform="translate(0 ${r * CH})">${u}</g>`;
  }
  return out;
}
const width = (parts) => parts.reduce((a, [t]) => a + len(t), 0);
const plain = (parts) => parts.map(([t]) => t).join('');
const centre = (n, c0 = 0, w = COLS) => c0 + Math.floor((w - n) / 2);

// ---------------------------------------------------------------------------------------------
// Screen buffers. `grid` is the static text layer. `txt` is the whole screen at rest as plain
// characters (static text plus the resting state of everything animated), for the text version.
// ---------------------------------------------------------------------------------------------
const grid = Array.from({ length: ROWS }, () => new Array(COLS).fill(null));
const txt = Array.from({ length: ROWS }, () => new Array(COLS).fill(' '));
const bgRuns = [];
const frameRects = [];   // [x, y, w, h, colour] for the double-line frames
function rest(r, c, str) { for (const ch of str) txt[r][c++] = ch; }
function put(r, c, str, fg) {
  for (const ch of str) {
    if (c < 0 || c >= COLS || r < 0 || r >= ROWS) throw new Error(`off screen at ${r},${c}: ${str}`);
    grid[r][c] = ch === ' ' ? null : { ch, fg };
    txt[r][c] = ch;
    c++;
  }
  return c;
}
function bg(r, c, n, colour) { bgRuns.push({ r, c, n, colour }); }
function seg(r, c, parts) { for (const [t, fg, bgc] of parts) { if (bgc) bg(r, c, len(t), bgc); c = put(r, c, t, fg); } return c; }

// ---------------------------------------------------------------------------------------------
// Windows: black, framed in CP437 double lines with VGA metrics (horizontal strokes on pixel rows
// 5 and 7 of the cell, vertical strokes two pixels wide at x 2-3 and 5-6), the title set into the
// right end of the top border with one stroke of frame after it.
// ---------------------------------------------------------------------------------------------
function win({ r0, r1, c0, c1, title, line = CYN, head = WHT }) {
  for (let r = r0; r <= r1; r++) bg(r, c0, c1 - c0 + 1, BLK);
  const X0 = c0 * CW, X1 = c1 * CW, Y0 = r0 * CH, Y1 = r1 * CH;
  const tl = c1 - 1 - len(title);                      // first title column
  const add = (x, y, w, h) => frameRects.push([x, y, w, h, line]);
  // Corners: ╔ ╗ ╚ ╝.
  add(X0 + 2, Y0 + 5, CW - 2, 1); add(X0 + 2, Y0 + 5, 2, CH - 5); add(X0 + 5, Y0 + 7, CW - 5, 1); add(X0 + 5, Y0 + 7, 2, CH - 7);
  add(X1, Y0 + 5, 7, 1); add(X1 + 5, Y0 + 5, 2, CH - 5); add(X1, Y0 + 7, 4, 1); add(X1 + 2, Y0 + 7, 2, CH - 7);
  add(X0 + 2, Y1, 2, 8); add(X0 + 2, Y1 + 7, CW - 2, 1); add(X0 + 5, Y1, 2, 6); add(X0 + 5, Y1 + 5, CW - 5, 1);
  add(X1 + 5, Y1, 2, 8); add(X1, Y1 + 7, 7, 1); add(X1 + 2, Y1, 2, 6); add(X1, Y1 + 5, 4, 1);
  // Top edge, broken by the title; bottom edge.
  for (const [a, b] of [[c0 + 1, tl - 1], [c1 - 1, c1 - 1]]) { add(a * CW, Y0 + 5, (b - a + 1) * CW, 1); add(a * CW, Y0 + 7, (b - a + 1) * CW, 1); }
  add((c0 + 1) * CW, Y1 + 5, (c1 - c0 - 1) * CW, 1); add((c0 + 1) * CW, Y1 + 7, (c1 - c0 - 1) * CW, 1);
  // Sides.
  const h = (r1 - r0 - 1) * CH;
  add(X0 + 2, Y0 + CH, 2, h); add(X0 + 5, Y0 + CH, 2, h); add(X1 + 2, Y0 + CH, 2, h); add(X1 + 5, Y0 + CH, 2, h);
  // The text version of the frame.
  rest(r0, c0, '╔' + '═'.repeat(c1 - c0 - 1) + '╗');
  for (let r = r0 + 1; r < r1; r++) { rest(r, c0, '║'); rest(r, c1, '║'); }
  rest(r1, c0, '╚' + '═'.repeat(c1 - c0 - 1) + '╝');
  put(r0, tl, title, head);
  return { r0, r1, c0, c1, in0: c0 + 2, in1: c1 - 2, inner: c1 - c0 - 3, row: (k) => r0 + 1 + k };
}

// ---------------------------------------------------------------------------------------------
// Animation helpers.
// ---------------------------------------------------------------------------------------------
const css = [];
const defs = [];
const layers = [];   // animated pieces, drawn above the static layer
const num = (v) => +v.toFixed(4);
let animCount = 0;
const pct = (t, period) => `${num((100 * t) / period)}%`;

// A class that shows its element only during the given [from, to) windows of a `period`-second
// loop. With animation switched off, the element rests in its t = 0 state.
function showWhen(period, wins) {
  const name = `v${(animCount++).toString(36)}`;
  const norm = [];
  for (let [a, b] of wins) {
    if (b > period) { norm.push([a, period]); norm.push([0, b - period]); } else norm.push([a, b]);
  }
  const on0 = norm.some(([a, b]) => a <= 0 && b > 0);
  const pts = [];
  for (const [a, b] of norm) {
    if (a > 0) pts.push([a, 1]);
    if (b < period) pts.push([b, 0]);
  }
  pts.sort((p, q) => p[0] - q[0] || p[1] - q[1]);
  let kf = `0%{opacity:${on0 ? 1 : 0}}`;
  for (const [t, v] of pts) kf += `${pct(t, period)}{opacity:${v}}`;
  kf += `100%{opacity:${on0 ? 1 : 0}}`;
  css.push(`@keyframes ${name}{${kf}}.${name}{${on0 ? '' : 'opacity:0;'}animation:${name} ${period}s step-end infinite}`);
  return name;
}
const shown = (period, wins, inner) => `<g class="${showWhen(period, wins)}">${inner}</g>`;

// An odometer: each field is a vertical strip of its values behind a one-row clip, stepping on its
// own period, so the counter carries at the right moment and never resets. `fields` runs from the
// least significant: [how many values, how many characters, seconds per step].
const strips = new Set();
function odometer({ r, c, start, fields, seps, fg }) {
  const total = fields.reduce((a, [, w]) => a + w, 0) + [...seps.values()].reduce((a, s) => a + len(s), 0);
  let col = c + total, out = '', shownText = '';
  fields.forEach(([n, w, step], i) => {
    const value0 = Math.floor(start / step) % n;
    const into = start % step;                     // seconds already spent on the current value
    col -= w;
    let strip = '';
    for (let k = 0; k < n; k++) strip += text(r + k, col, [[String((value0 + k) % n).padStart(w, '0'), fg]]);
    shownText = String(value0).padStart(w, '0') + shownText;
    if (!strips.has(n)) { strips.add(n); css.push(`@keyframes o${n}{to{transform:translateY(${-n * CH}px)}}`); }
    out += `<g style="animation:o${n} ${n * step}s steps(${n}) ${num(-into)}s infinite">${strip}</g>`;
    if (seps.has(i)) { const s = seps.get(i); col -= len(s); out += text(r, col, [[s, fg]]); shownText = s + shownText; }
  });
  rest(r, c, shownText);
  const id = `o${(animCount++).toString(36)}`;
  defs.push(`<clipPath id="${id}"><rect x="${c * CW}" y="${r * CH}" width="${total * CW}" height="${CH}"/></clipPath>`);
  return `<g clip-path="url(#${id})">${out}</g>`;
}

// ---------------------------------------------------------------------------------------------
// Row 0: the title bar.
// ---------------------------------------------------------------------------------------------
bg(R.title, 0, COLS, BLK);
{
  const parts = [['MediaLog', WHT], ['  -  ', DGR], ['A MEDIA DIARY YOU SHARE', LGR]];
  seg(R.title, centre(width(parts)), parts);
}

// ---------------------------------------------------------------------------------------------
// The logo, drawn into the stipple in half blocks (one cell wide, half a cell tall per pixel):
// the MediaLog mark (an open book with a play triangle on the left page and a pen on the right)
// and the name in heavy condensed lowercase, every letter in one kind's colour, light on top and
// the app's own shade underneath, with a hard offset shadow like the one under the app's search box.
// ---------------------------------------------------------------------------------------------
const PX = CW, PY = CH / 2;
// Cap height 9 pixels (rows 0-8), x-height 6 (rows 3-8), descender rows 9-10.
const LETTERS = {
  M: ['##...##', '###.###', '#######', '##.#.##', '##...##', '##...##', '##...##', '##...##', '##...##'],
  e: [null, null, null, '.###.', '##.##', '#####', '##...', '##.##', '.###.'],
  d: ['...##', '...##', '...##', '.####', '##.##', '##.##', '##.##', '##.##', '.####'],
  i: ['##', '##', '..', '##', '##', '##', '##', '##', '##'],
  a: [null, null, null, '.###.', '...##', '.####', '##.##', '##.##', '.####'],
  L: ['##...', '##...', '##...', '##...', '##...', '##...', '##...', '##...', '#####'],
  o: [null, null, null, '.###.', '##.##', '##.##', '##.##', '##.##', '.###.'],
  g: [null, null, null, '.####', '##.##', '##.##', '##.##', '##.##', '.####', '...##', '####.'],
};
const WORD = [['M', 'movie'], ['e', 'tv'], ['d', 'book'], ['i', 'comics'], ['a', 'game'], ['L', 'podcast'], ['o', 'music'], ['g', 'video']];
// The mark (W page, N navy ink). Its pen pokes out of the top corner, so it starts two pixels
// above the letters; its cover sits one pixel under the baseline.
const BOOK = [
  '.................N',
  'NNNNN......NNNNNNN',
  'NWWWWNNN.NNNWWWNN.',
  'NWWWWWWWNWWWWWNNWN',
  'NWWNWWWWNWWWWNNWWN',
  'NWWNNWWWNWWWNNWWWN',
  'NWWNNNWWNWWNNWWWWN',
  'NWWNNWWWNWNNWWWWWN',
  'NWWNWWWWNWNWWWWWWN',
  'NWWWWWWWNWWWWWWWWN',
  'NNNNNNNNNNNNNNNNNN',
  '.NNNNNNN.NNNNNNNN.',
];
const BOOK_RISE = 2;
const LOGO = { shadow: '', mark: '', letters: [] };
{
  const gapMark = 3, gapLetter = 1;
  const wordW = WORD.reduce((a, [ch]) => a + LETTERS[ch].find((r) => r).length, 0) + gapLetter * (WORD.length - 1);
  const markW = BOOK[0].length;
  const total = markW + gapMark + wordW + 1;   // +1 for the shadow hanging off the right
  const x0 = Math.floor((COLS - total) / 2);
  const cells = [];                             // [x, y, colour, owner]
  const shadow = new Set();
  const plot = (x, y, colour, owner) => { cells.push([x, y, colour, owner]); shadow.add(`${x + 1},${y + 1}`); };
  BOOK.forEach((row, y) => [...row].forEach((ch, x) => {
    if (ch === 'W') plot(x0 + x, LOGO_Y - BOOK_RISE + y, WHT, 'mark');
    else if (ch === 'N') plot(x0 + x, LOGO_Y - BOOK_RISE + y, NAVY, 'mark');
  }));
  let x = x0 + markW + gapMark;
  for (const [li, [ch, kind]] of WORD.entries()) {
    const rows = LETTERS[ch];
    const w = rows.find((r) => r).length;
    rows.forEach((row, y) => {
      if (!row) return;
      [...row].forEach((p, dx) => { if (p === '#') plot(x + dx, LOGO_Y + y, y >= 7 ? KINDS[kind].base : KINDS[kind].lit, li); });
    });
    x += w + gapLetter;
  }
  const pathFor = (set) => {
    const pts = [...set].map((k) => k.split(',').map(Number));
    const minY = Math.min(...pts.map((p) => p[1])), maxY = Math.max(...pts.map((p) => p[1]));
    const rows = [];
    for (let yy = minY; yy <= maxY; yy++) rows.push((xx) => set.has(`${xx},${yy}`));
    return bitmapPath(rows, COLS, PX, PY, 0, minY * PY);
  };
  // One group for the mark and one per letter (so a letter can lift off its shadow later).
  const paths = (list) => {
    const byColour = new Map();
    for (const [cx, cy, colour] of list) {
      if (!byColour.has(colour)) byColour.set(colour, new Set());
      byColour.get(colour).add(`${cx},${cy}`);
    }
    return [...byColour].map(([colour, set]) => `<path class="${cc(colour)}" d="${pathFor(set)}"/>`).join('');
  };
  LOGO.shadow = `<path class="${cc(BLK)}" d="${pathFor(shadow)}"/>`;
  LOGO.mark = paths(cells.filter((p) => p[3] === 'mark'));
  WORD.forEach(([, kind], i) => LOGO.letters.push({ kind, d: paths(cells.filter((p) => p[3] === i)) }));
}

// ---------------------------------------------------------------------------------------------
// Row 9: the line, its verb cycling through the kinds that own it.
// ---------------------------------------------------------------------------------------------
const VERBS = [['watched', 'movie'], ['read', 'book'], ['played', 'game'], ['listened to', 'music']];
const VERB_STEP = 2.5;
const LINE = ([verb, kind]) => [['Everything you\'ve ', WHT], [verb, KINDS[kind].lit], [', on one timeline.', WHT]];
{
  const w = Math.max(...VERBS.map((v) => width(LINE(v)))) + 4;
  bg(R.line, centre(w), w, BLK);
  const P = VERBS.length * VERB_STEP;
  VERBS.forEach((v, i) => {
    const parts = LINE(v);
    layers.push(shown(P, [[i * VERB_STEP, (i + 1) * VERB_STEP]], text(R.line, centre(width(parts)), parts)));
    if (!i) rest(R.line, centre(width(parts)), plain(parts));
  });
}

// ---------------------------------------------------------------------------------------------
// The windows.
// ---------------------------------------------------------------------------------------------
const L0 = 1, L1 = 42, Q0 = 45, Q1 = 78;
const status = win({ r0: R.win, r1: R.win + 2, c0: L0, c1: L1, title: 'Status' });
const modem = win({ r0: R.win + 4, r1: R.win + 10, c0: L0, c1: L1, title: 'Modem' });
const time = win({ r0: R.win + 12, r1: R.win + 16, c0: L0, c1: L1, title: 'Time' });
const system = win({ r0: R.win, r1: R.win + 16, c0: Q0, c1: Q1, title: 'System' });
const mylog = win({ r0: R.log, r1: R.log + 8, c0: L0, c1: Q1, title: 'My log' });

// The modem's init string. &F is factory settings and S0=1 answers on the first ring, as on any
// AT-command modem; &W &R &P &L are watched, read, played and listened to. The modem has not decided
// either.
const INIT = 'AT&F&W&R&P&L S0=1';
put(modem.row(0), modem.in0, INIT, LGR);

// Time: a ticking clock (it is a Saturday night in October 2026) and where we are in the drawers.
const CLOCK0 = 21 * 3600 + 58 * 60 + 7;
layers.push(odometer({
  r: time.row(0), c: time.in0, start: CLOCK0, fg: LCY,
  fields: [[10, 1, 1], [6, 1, 10], [10, 1, 60], [6, 1, 600], [24, 2, 3600]],
  seps: new Map([[1, ':'], [3, ':']]),
}));
seg(time.row(0), time.in0 + 8, [['  (Sat)  ', LGR], ['10-Oct-2026', LCY]]);
seg(time.row(1), time.in0, [['Drawer ', LGR], ['2025-2029', WHT], [', year 2 of 5.', LGR]]);
seg(time.row(2), time.in0, [['Next drawer opens 01-Jan-2030.', LGR]]);

// System: label : value, three groups, the last a block of switches.
const LABEL_W = 11;
const sysRow = (k, label, value, vfg = LCY) => seg(system.row(k), system.in0, [[label.padEnd(LABEL_W), LGR], [' : ', DGR], [value, vfg]]);
const SYS = [
  [['Board', 'MediaLog'], ['Sysop', 'you'], ['Line', 'one timeline'], ['Drawer', '2025-2029'], ['Verb', 'undecided']],
  [['Last caller', null], ['Logged', null], ['When', null], ['Threads', '3 new', LRD]],
  [['Snoop', 'ON', LGN], ['Sometime in', 'ON', LGN], ['Judging', 'OFF', LRD], ['Answer', 'ON', LGN]],
];
const SYS_ROW = {};
{
  let k = 0;
  SYS.forEach((group, gi) => {
    if (gi) k++;
    for (const [label, value, vfg] of group) {
      SYS_ROW[label] = k;
      if (value === null) seg(system.row(k), system.in0, [[label.padEnd(LABEL_W), LGR], [' : ', DGR]]);
      else sysRow(k, label, value, vfg);
      k++;
    }
  });
}

// ---------------------------------------------------------------------------------------------
// My log: the sysop's own log, five years at a time. The sysop, who waits by a telephone for a
// living, only logs things about telephones. The screen shows the entries marked `screen`; the
// whole log is MYLOG.TXT in the markdown.
// Reactions: loved (a heart), liked (a thumbs-up) or a verdict of your own (with a little face).
// ---------------------------------------------------------------------------------------------
const REACT = {
  loved: { glyph: '♥', fg: LRD, text: '<3' },
  liked: { glyph: '¤', fg: YEL, text: '+1' },
  verdict: { glyph: '☺', fg: YEL, text: ':)' },
};
const MYLOG = [
  { drawer: '2025-2029', groups: [
    { head: '2026', entries: [
      { when: '9 Oct', kind: 'tv', title: 'The Night Switchboard', react: 'loved', detail: 'TV show, S2 E1-10', note: `"Shouted 'pick up!'"`, screen: true },
      { when: 'Aug', kind: 'comics', title: 'The Crossed Line', react: 'liked', detail: 'Comics, Hal Brindle', screen: true },
      { when: 'Jun', kind: 'movie', title: 'Ringing Off', react: 'verdict', verdict: 'Ends on a dial tone', detail: 'Movie, Ida Fenwick' },
      { when: '14 Mar', kind: 'book', title: 'A Year on Hold', react: 'liked', detail: 'Book, Petula Graves, audiobook', note: '"Listened to it on hold."' },
    ] },
    { head: '2025', entries: [
      { when: '30 Dec', kind: 'music', title: 'Operator, Please', react: 'loved', detail: 'Music, The Party Lines' },
    ] },
  ] },
  { drawer: '2020-2024', groups: [
    { head: '2022', entries: [
      { when: '2 Feb', kind: 'game', title: 'Dial Tone Detective', react: 'liked', detail: 'Game, Pulse Dial Games', note: '"Solved it. It was the cat."' },
    ] },
    { head: 'Sometime in 2020-2024', entries: [
      { when: '', kind: 'movie', title: 'Please Hang Up First', react: 'loved', detail: 'Movie, Ines Vale', note: '"Called my mum after."' },
    ] },
  ] },
  { drawer: '2015-2019', groups: [
    { head: '2016', entries: [
      { when: '3 Dec', kind: 'video', title: 'Payphones of Wales, Pt 3', react: 'liked', detail: 'Video, Coinbox Carol', screen: true },
    ] },
    { head: 'Sometime in 2015-2019', entries: [
      { when: '', kind: 'music', title: 'Extension 4', react: 'verdict', verdict: 'Hummable', detail: 'Music, The Engaged Tones', screen: true },
    ] },
  ] },
  { drawer: '2010-2014', groups: [
    { head: 'Sometime in 2010-2014', entries: [
      { when: '', kind: 'book', title: 'Three Men in a Boat', react: 'liked', detail: 'Book, Jerome K. Jerome', note: '"No phones in it. Restful."' },
    ] },
  ] },
];
{
  const onScreen = MYLOG.map((d) => ({ ...d, groups: d.groups.map((g) => ({ ...g, entries: g.entries.filter((e) => e.screen) })).filter((g) => g.entries.length) }))
    .filter((d) => d.groups.length);
  const cols = [mylog.in0, mylog.in0 + 38];
  if (onScreen.length !== cols.length) throw new Error('My log shows two drawers');
  onScreen.forEach((d, i) => {
    const c = cols[i], limit = i + 1 < cols.length ? cols[i + 1] - 2 : mylog.in1;
    let k = 0;
    const line = (parts, at = c) => {
      if (at + width(parts) - 1 > limit) throw new Error(`My log line too long: ${plain(parts)}`);
      seg(mylog.row(k++), at, parts);
    };
    line([[d.drawer, WHT]]);
    for (const g of d.groups) {
      line([[g.head, LGR]]);
      for (const e of g.entries) {
        const K = KINDS[e.kind], X = REACT[e.react];
        line([[` ${e.when}`.padEnd(8), LGR], ['▌', K.lit], [e.title, WHT], [` ${X.glyph}`, X.fg], ...(e.verdict ? [[` ${e.verdict}`, LGR]] : [])]);
        line([[e.detail, K.lit]], c + 9);
        if (e.note) line([[e.note, LGR]], c + 9);
      }
    }
    if (k > mylog.r1 - mylog.r0 - 1) throw new Error('My log overflows');
  });
}

// ---------------------------------------------------------------------------------------------
// The last two rows: the kinds, each in its colour (the app's filter chips), and the key legend.
// ---------------------------------------------------------------------------------------------
const CHIP = {};
bg(R.kinds, 0, COLS, BLK);
{
  const total = KIND_ORDER.reduce((a, k) => a + len(KINDS[k].label) + 1, 0) + KIND_ORDER.length - 1;
  let c = centre(total);
  for (const key of KIND_ORDER) {
    const K = KINDS[key];
    CHIP[key] = c;
    put(R.kinds, c++, '■', K.lit);
    c = put(R.kinds, c, K.label, K.lit) + 1;
  }
}
bg(R.keys, 0, COLS, BLK);
const KEYS = [['L', 'Log it'], ['Esc', 'Exit']];
const ALT_KEYS = [['H', 'Home'], ['D', 'Discover'], ['M', 'My log'], ['T', 'Threads'], ['F', 'Feed']];
{
  let c = 1;
  for (const [k, w] of KEYS) c = seg(R.keys, c, [[k, WHT], [`-${w}`, LGR]]) + 2;
  c = seg(R.keys, c + 2, [['ALT:', WHT]]) + 1;
  for (const [k, w] of ALT_KEYS) c = seg(R.keys, c, [[k, WHT], [`-${w}`, LGR]]) + 2;
}

// ---------------------------------------------------------------------------------------------
// The calls. Five friends take turns, one every CALL seconds.
// ---------------------------------------------------------------------------------------------
const CALL = 18;
const T = { ring1: 3, ringOff: 4, ring2: 4.6, connect: 6, type: 6.4, hangup: 12, init: 15.4, wait: 16.2, ok: 16.4 };
const TYPE = 0.045;   // seconds per character, as the entry types itself in
const CALLERS = [
  { name: 'Nell', kind: 'book', title: 'Forty Years of Doorbells', react: 'liked', detail: 'Book, Morwenna Pike, ebook', when: 'Feb', bye: 'Read the end first.' },
  { name: 'Big Gav', short: 'Gav', kind: 'game', title: 'Milk Float Rally', react: 'loved', detail: 'Game, Dawn Round Games', when: '2010-2014', note: '"Delivered 400 milks. Proud."', bye: '2010-2014, he thinks.' },
  { name: 'Auntie Gwen', short: 'Gwen', kind: 'podcast', title: 'Shed Tapes', react: 'loved', detail: 'Podcast, Clive & Norm, E41-44', when: 'Sep', note: '"E43 is about a hinge. I...', more: true, bye: 'Left a long note.',
    full: 'E43 is about a hinge. I thought it would be about the door. It is not about the door. Norm talks about the hinge for forty minutes and Clive says \'right\' eleven times. I counted. I have ordered the hinge.' },
  { name: 'Ozzie', kind: 'anime', title: 'Lunchbox Ranger', react: 'liked', detail: 'Anime, Studio Thermos, S1 E1-12', when: '9 Oct', bye: 'Episode 13 called.' },
  { name: 'Theo', kind: 'movie', title: 'Gravy Boat', react: 'verdict', verdict: 'Too much gravy', detail: 'Movie, Ida Fenwick', when: '10 Oct', bye: 'Gone to make gravy.' },
];
const CYCLE = CALL * CALLERS.length;
const LAST = CALLERS[CALLERS.length - 1];   // on screen at t = 0, and whenever animation is off

// The modem's result word, the same in every call.
{
  const r = modem.row(4);
  const word = (w, fg) => text(r, centre(len(w), modem.in0, modem.inner), [[w, fg]]);
  layers.push(shown(CALL, [[0, T.ring1], [T.ok, CALL]], word('OK', WHT)));
  layers.push(shown(CALL, [[T.ring1, T.ringOff], [T.ring2, T.connect]], word('RING', YEL)));
  layers.push(shown(CALL, [[T.connect, T.hangup]], word('CONNECT 2400', LGN)));
  layers.push(shown(CALL, [[T.hangup, T.init]], word('NO CARRIER', LRD)));
  rest(r, centre(2, modem.in0, modem.inner), 'OK');
  // The init string is sent again after every call.
  layers.push(shown(CALL, [[T.init, T.ok]], text(modem.row(0), modem.in0, [[INIT, WHT]])));
}

// The Status window: one sentence.
{
  const r = status.row(0);
  const say = (parts) => {
    if (width(parts) > status.inner) throw new Error(`status too long: ${plain(parts)}`);
    return text(r, status.in0, parts);
  };
  const IDLE = [['Waiting for anyone to finish anything.', WHT]];
  layers.push(shown(CALL, [[0, T.ring1], [T.wait, CALL]], say(IDLE)));
  layers.push(shown(CALL, [[T.ring1, T.connect]], say([['RING. ', YEL], ['Somebody finished something.', WHT]])));
  layers.push(shown(CALL, [[T.init, T.wait]], say([['Initialising modem...', LGR]])));
  rest(r, status.in0, plain(IDLE));
  CALLERS.forEach((p, i) => {
    const t0 = i * CALL;
    const who = p.short || p.name;
    layers.push(shown(CYCLE, [[t0 + T.connect, t0 + T.hangup]], say([[p.name, YEL], [` is logging ${KINDS[p.kind].a}.`, WHT]])));
    layers.push(shown(CYCLE, [[t0 + T.hangup, t0 + T.init]], say([[who, YEL], [' logged off. ', LRD], [p.bye, WHT]])));
  });
}

// The System window's caller rows, from each CONNECT to the next.
CALLERS.forEach((p, i) => {
  const from = i * CALL + T.connect;
  const c = system.in0 + LABEL_W + 3;
  const vals = [[SYS_ROW['Last caller'], p.name], [SYS_ROW.Logged, KINDS[p.kind].a], [SYS_ROW.When, p.when]];
  let inner = '';
  for (const [k, v] of vals) {
    if (len(v) > system.in1 - c + 1) throw new Error(`system value too long: ${v}`);
    inner += text(system.row(k), c, [[v, k === SYS_ROW.Logged ? KINDS[p.kind].lit : LCY]]);
    if (p === LAST) rest(system.row(k), c, v);
  }
  layers.push(shown(CYCLE, [[from, from + CALL]], inner));
});

// The entry each caller logs, typing itself into the Modem window, and their kind lit up in the key.
{
  const rows = [modem.row(1), modem.row(2), modem.row(3)];
  rows.forEach((r, j) => defs.push(`<clipPath id="ml${j}"><rect x="${modem.in0 * CW}" y="${r * CH}" width="${modem.inner * CW}" height="${CH}"/></clipPath>`));
  CALLERS.forEach((p, i) => {
    const t0 = i * CALL;
    const K = KINDS[p.kind];
    const lines = [
      [['▌', K.lit], [p.title, WHT], [` ${REACT[p.react].glyph}`, REACT[p.react].fg], ...(p.verdict ? [[` ${p.verdict}`, LGR]] : [])],
      [[p.detail, K.lit], [`  ${p.when}`, LGR]],
      ...(p.note ? [[[p.note, LGR], ...(p.more ? [[' Read more', WHT]] : [])]] : []),
    ];
    let at = t0 + T.type, inner = '';
    lines.forEach((parts, j) => {
      const n = width(parts);
      if (n > modem.inner) throw new Error(`modem line too long: ${plain(parts)}`);
      const r = rows[j];
      const start = at, end = at + n * TYPE;
      const leave = j < lines.length - 1 ? end + 0.2 : t0 + T.hangup;
      at = end + 0.2;
      const far = (modem.inner + 2) * CW;
      const name = `ty${i}${j}`;
      // A black cover slides off the line a character at a time, carrying the cursor with it. The
      // cursor only shows on the line being typed (the first line's waits there from CONNECT).
      css.push(`@keyframes ${name}{0%,${pct(start, CYCLE)}{transform:translateX(0);animation-timing-function:steps(${n},end)}`
        + `${pct(end, CYCLE)}{transform:translateX(${n * CW}px);animation-timing-function:step-end}`
        + `${pct(leave, CYCLE)},100%{transform:translateX(${far}px)}}.${name}{animation:${name} ${CYCLE}s infinite}`);
      const cursor = shown(CYCLE, [[j ? start : t0 + T.connect, leave]], text(r, modem.in0, [['_', LGR]]));
      inner += `<g clip-path="url(#ml${j})">${text(r, modem.in0, parts)}`
        + `<g class="${name}"><rect class="${cc(BLK)}" x="${modem.in0 * CW}" y="${r * CH}" width="${far}" height="${CH}"/>${cursor}</g></g>`;
    });
    layers.push(shown(CYCLE, [[t0 + T.connect, t0 + T.init]], inner));
    // The kind's swatch, lit up while it is on the line.
    const c = CHIP[p.kind];
    layers.push(shown(CYCLE, [[t0 + T.connect, t0 + T.init]],
      text(R.kinds, c, [['■', BLK, K.lit], [K.label, BLK, K.lit]])));
  });
}

// The logo: while a kind is on the line, its letter lifts off its shadow by one half-cell pixel.
{
  let logo = LOGO.shadow + `<g>${LOGO.mark}</g>`;
  LOGO.letters.forEach(({ kind, d }) => {
    const wins = CALLERS.map((p, i) => [i * CALL + T.connect, i * CALL + T.init, p])
      .filter(([, , p]) => KINDS[p.kind].base === KINDS[kind].base).map(([a, b]) => [a, b]);
    if (!wins.length) { logo += `<g>${d}</g>`; return; }
    const name = `u${(animCount++).toString(36)}`;
    let kf = '0%{transform:translateY(0)}';
    for (const [a, b] of wins) kf += `${pct(a, CYCLE)}{transform:translateY(${-PY}px)}${pct(b, CYCLE)}{transform:translateY(0)}`;
    css.push(`@keyframes ${name}{${kf}100%{transform:translateY(0)}}.${name}{animation:${name} ${CYCLE}s step-end infinite}`);
    logo += `<g class="${name}">${d}</g>`;
  });
  defs.push(`<g id="logo">${logo}</g>`);
}

css.push('@media (prefers-reduced-motion:reduce){*{animation:none!important}}');

// ---------------------------------------------------------------------------------------------
// Emit the SVG.
// ---------------------------------------------------------------------------------------------
let staticLayer = '';
for (const { r, c, n, colour } of bgRuns) staticLayer += `<rect class="${cc(colour)}" x="${c * CW}" y="${r * CH}" width="${n * CW}" height="${CH}"/>`;
{
  const byColour = new Map();
  for (const [x, y, w, h, colour] of frameRects) byColour.set(colour, (byColour.get(colour) || '') + `M${x} ${y}h${w}v${h}h${-w}z`);
  for (const [colour, d] of byColour) staticLayer += `<path class="${cc(colour)}" d="${d}"/>`;
}
for (let r = 0; r < ROWS; r++) {
  const byFg = new Map();
  for (let c = 0; c < COLS; c++) {
    const cell = grid[r][c];
    if (cell) byFg.set(cell.fg, (byFg.get(cell.fg) || '') + `<use href="#${gid(cell.ch)}" x="${c * CW}"/>`);
  }
  for (const [fg, u] of byFg) staticLayer += `<g class="${cc(fg)}" transform="translate(0 ${r * CH})">${u}</g>`;
}

const glyphDefs = [...glyphIds].map(([ch, id]) => `<path id="${id}" d="${glyphPath(ch)}"/>`).join('');
const palette = [...colourClass].map(([colour, name]) => `.${name}{fill:${colour}}`).join('');

// The words for people who cannot see the picture: the alt text in the markdown, and the SVG's own
// title and description.
const xml = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const ALT = 'MediaLog drawn as the screen a 1990s bulletin board showed its sysop while waiting for a call: '
  + 'black windows framed in cyan double lines on a grey stipple. The title bar reads MediaLog, a media diary you share. '
  + 'Below it, in big pixel letters, the MediaLog mark (an open book with a play triangle and a pen) and the name, each letter in one kind\'s colour. '
  + 'Under the logo: Everything you\'ve watched, on one timeline, with the verb turning into read, played and listened to. '
  + 'Status: Waiting for anyone to finish anything. Modem: the init string AT&F&W&R&P&L S0=1, then OK. '
  + 'Time: a ticking clock, Saturday 10 October 2026, drawer 2025-2029, year 2 of 5, next drawer opens 1 January 2030. '
  + 'System: board MediaLog, sysop you, line one timeline, drawer 2025-2029, verb undecided, the last caller, 3 new in threads, '
  + 'and four switches: Snoop on, Sometime in on, Judging off, Answer on. '
  + `Every ${CALL} seconds a friend calls. The modem rings and connects, the entry they are logging types itself into the Modem window, `
  + 'their kind\'s letter in the logo lifts off its shadow and their kind lights up in the key at the bottom, then NO CARRIER as they log off with a deadpan remark: '
  + 'Nell read the end first, Big Gav played his game in 2010-2014 (he thinks), Auntie Gwen left a long note about a hinge, '
  + 'Ozzie went because episode 13 called, and Theo has gone to make gravy. '
  + 'A My log window holds the sysop\'s own entries, all about telephones, in two five-year drawers: The Night Switchboard, '
  + 'The Crossed Line, Payphones of Wales part 3 and, filed under sometime in 2015-2019, the album Extension 4 by The Engaged Tones. '
  + 'Along the bottom, the ten kinds in their colours, and a key legend: Log it, Exit, Home, Discover, My log, Threads, Feed.';
const TITLE = 'MediaLog, as a sysop\'s waiting-for-caller screen';
const DESC = 'MediaLog as a 1990s bulletin board\'s waiting-for-caller screen: the logo in the kinds\' colours, '
  + 'Everything you\'ve watched, read, played, listened to, on one timeline, and Status, Modem, Time, System and My log windows. '
  + 'Friends call in, log what they finished and hang up.';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VBW} ${VBH}" width="${VBW}" height="${VBH}" shape-rendering="crispEdges" role="img" aria-labelledby="t d">
<title id="t">${xml(TITLE)}</title>
<desc id="d">${xml(DESC)}</desc>
<style>${palette}
${css.join('\n')}</style>
<defs>${glyphDefs}${defs.join('')}<pattern id="st" width="2" height="2" patternUnits="userSpaceOnUse"><rect width="2" height="2" fill="#000"/><rect x="1" width="1" height="1" fill="${LGR}"/><rect y="1" width="1" height="1" fill="${LGR}"/></pattern><clipPath id="scr"><rect width="${SW}" height="${SH}"/></clipPath></defs>
<rect x=".5" y=".5" width="${VBW - 1}" height="${VBH - 1}" rx="10" fill="#000" stroke="#2b3245"/>
<g transform="translate(${PAD} ${PAD})" clip-path="url(#scr)">
<rect width="${SW}" height="${SH}" fill="url(#st)"/>
<use href="#logo"/>
${staticLayer}
${layers.join('\n')}
</g>
</svg>
`;
fs.mkdirSync(path.dirname(SVG_OUT), { recursive: true });
fs.writeFileSync(SVG_OUT, svg);
console.log(`wrote ${path.relative(process.cwd(), SVG_OUT)} (${(svg.length / 1024).toFixed(1)} KB, ${glyphIds.size} glyphs)`);

// ---------------------------------------------------------------------------------------------
// The markdown. Everything it quotes (the log, the calls, the config) comes from the same data as
// the picture, so the two cannot drift apart.
// ---------------------------------------------------------------------------------------------
const two = (n) => String(n).padStart(2, '0');
const clock = (t) => { const v = Math.floor(CLOCK0 + t); return `${two(Math.floor(v / 3600) % 24)}:${two(Math.floor(v / 60) % 60)}:${two(v % 60)}`; };
function textBlock(lines, max = 80) {
  return lines.map((l) => {
    const t = l.replace(/\s+$/, '');
    if (len(t) > max) throw new Error(`text block line over ${max} columns (${len(t)}): ${t}`);
    if (/[–—\t]/.test(t)) throw new Error(`dash or tab in a text block: ${t}`);
    return t;
  }).join('\n');
}
function wrap(t, w) {
  const out = [];
  let cur = '';
  for (const word of t.split(' ')) {
    if (cur && len(cur) + 1 + len(word) > w) { out.push(cur); cur = word; } else cur = cur ? `${cur} ${word}` : word;
  }
  if (cur) out.push(cur);
  return out;
}

// MYLOG.TXT: the sysop's whole log, as a window framed the way the screen frames its windows.
const mylogText = (() => {
  const W = 80, IN = W - 4, title = 'My log';
  const row = (t = '') => {
    if (len(t) > IN) throw new Error(`MYLOG line too long: ${t}`);
    return `║ ${t}${' '.repeat(IN - len(t))} ║`;
  };
  const lines = ['╔' + '═'.repeat(W - 3 - len(title)) + title + '═╗', row()];
  MYLOG.forEach((d, i) => {
    if (i) lines.push(row());
    lines.push(row(`${d.drawer} ${'─'.repeat(IN - len(d.drawer) - 1)}`));
    for (const g of d.groups) {
      lines.push(row(`  ${g.head}`));
      for (const e of g.entries) {
        const X = REACT[e.react];
        lines.push(row(`    ${e.when.padEnd(8)} ${e.title}  ${X.text}${e.verdict ? ` ${e.verdict}` : ''}`));
        lines.push(row(`${' '.repeat(13)}${e.detail}`));
        if (e.note) lines.push(row(`${' '.repeat(13)}${e.note}`));
      }
    }
  });
  lines.push(row(), '╚' + '═'.repeat(W - 2) + '╝');
  const legend = '  <3 loved   +1 liked   :) a verdict of your own', tail = 'a log, five years at a time';
  lines.push(legend + ' '.repeat(W - 2 - len(legend) - len(tail)) + tail);
  return textBlock(lines);
})();

// CALLS.LOG: the five calls on the screen, timed by the same clock, with the long note in full.
const callsText = (() => {
  const W = 79;
  const left = ' CALLS.LOG', mid = 'MediaLog, node 1', right = 'Sat 10-Oct-2026';
  const at = Math.floor((W - len(mid)) / 2);
  const rule = ' ' + '─'.repeat(W - 1);
  const lines = [left + ' '.repeat(at - len(left)) + mid + ' '.repeat(W - at - len(mid) - len(right)) + right, rule];
  const L = (t, what, txt = '') => ` ${t === null ? ' '.repeat(8) : clock(t)}  ${what.padEnd(11)} ${txt}`;
  const more = (txt) => `${' '.repeat(23)}${txt}`;
  CALLERS.forEach((p, i) => {
    const t0 = i * CALL, X = REACT[p.react];
    lines.push(L(t0 + T.ring1, 'RING'), L(t0 + T.ring2, 'RING'));
    lines.push(L(t0 + T.connect, 'CONNECT', `2400  ${p.name}, logging ${KINDS[p.kind].a}`));
    lines.push(L(null, 'LOGGED', `${p.title}  ${X.text}${p.verdict ? ` ${p.verdict}` : ''}`));
    lines.push(more(`${p.detail}  ${p.when}`));
    if (p.full) {
      if (!p.full.startsWith(p.note.replace(/^"|\.\.\.$/g, ''))) throw new Error('the full note must start like the short one');
      for (const l of wrap(`"${p.full}"`, W - 23)) lines.push(more(l));
    } else if (p.note) lines.push(more(p.note));
    lines.push(L(t0 + T.hangup, 'NO CARRIER', `${p.short || p.name} logged off. ${p.bye}`));
  });
  lines.push(L((CALLERS.length - 1) * CALL + T.ok, 'OK', 'Waiting for anyone to finish anything.'));
  lines.push(rule, ` ${CALLERS.length} calls. ${CALLERS.length} things finished. 0 things judged.`);
  return textBlock(lines);
})();

// SYSOP.CFG: the init string, the switches, the drawers and the keys, explained.
const cfgText = (() => {
  const W = 79;
  const left = ' SYSOP.CFG', right = 'MediaLog, node 1';
  const lines = [left + ' '.repeat(W - len(left) - len(right)) + right, ' ' + '─'.repeat(W - 1)];
  const kv = (k, v) => ` ${k.padEnd(14)}${v}`;
  lines.push(' [Modem]', kv('Init', INIT));
  for (const [code, what] of [['AT', 'attention, modem'], ['&F', 'factory settings'], ['&W', 'watched'], ['&R', 'read'],
    ['&P', 'played'], ['&L', 'listened to'], ['S0=1', 'answer on the first ring']]) lines.push(kv('', `${code.padEnd(6)}${what}`));
  [['RING', 'somebody you know finished something'], ['CONNECT', 'they are logging it: when, and how it was'],
    ['NO CARRIER', 'they have gone to start the next thing'], ['OK', 'back to waiting']]
    .forEach(([code, what], i) => lines.push(kv(i ? '' : 'Results', `${code.padEnd(12)}${what}`)));
  lines.push('', ' [Switches]');
  const SWITCH_NOTES = {
    Snoop: 'see what the people you know have been into',
    'Sometime in': 'for whatever you can only place roughly',
    Judging: 'their taste is fine. Gravy Boat is a lot, but fine.',
    Answer: 'always. Somebody might have finished something.',
  };
  for (const [label, value] of SYS[2]) lines.push(kv(label, `${value.padEnd(5)}${SWITCH_NOTES[label]}`));
  lines.push('', ' [Drawers]',
    kv('Size', 'five years'),
    kv('Open', '2025-2029, year 2 of 5'),
    kv('Next', 'opens 01-Jan-2030. The sysop will be here.'),
    kv('Closed', '2020-2024, 2015-2019, 2010-2014. Still in there.'),
    '', ' [Keys]',
    kv(KEYS[0][0], `${KEYS[0][1]}: a film, a book, a show, a game, an album or a podcast`),
    kv(KEYS[1][0], `${KEYS[1][1]}. Never pressed.`),
    kv('ALT-H, D, M', 'Home, Discover, My log'),
    kv('ALT-T', 'Threads (3 new)'),
    kv('ALT-F', 'Feed: Friends & me, Friends or Everyone'),
    kv('', 'in order: Recently logged, or By date'));
  return textBlock(lines);
})();

const md = `<!-- Header ${SLUG} for MediaLog. Generated by src/${SLUG}.mjs: edit that, not this. -->

<p align="center">
  <img src="assets/${SLUG}.svg" width="${VBW}" alt="${xml(ALT)}">
</p>

<h1 align="center">MediaLog</h1>

<p align="center"><b>Everything you've watched, read, played, listened to, on one timeline.</b></p>

<p align="center">A media diary you share. Log a film, a book, a show, a game, an album or a podcast: when, and how it was. Then see what the people you know have been into.</p>

The picture is MediaLog as a bulletin board's waiting-for-caller screen, the console a sysop watched all night while the phone mostly did not ring. On this board a call is somebody you know finishing something: the modem rings, their entry types itself in, the letter for its kind jumps up, and they log off to go and start the next thing. Each kind has its colour. Your own log is kept five years to a drawer, and anything you can only place roughly is filed under *sometime in*. The sysop is you. MediaLog is still in development, so for now the board is waiting for its first caller.

<details>
<summary><b>MYLOG.TXT</b> · the sysop's own log, five years at a time</summary>

\`\`\`text
${mylogText}
\`\`\`

</details>

<details>
<summary><b>CALLS.LOG</b> · tonight's callers, and Auntie Gwen's note in full</summary>

\`\`\`text
${callsText}
\`\`\`

</details>

<details>
<summary><b>SYSOP.CFG</b> · the init string, the switches and the keys, explained</summary>

\`\`\`text
${cfgText}
\`\`\`

</details>

<p><sub>Every person, title, band, studio and channel on this board is invented, apart from <i>Three Men in a Boat</i>, which is old enough to belong to everybody.</sub></p>
`;
if (/[–—]/.test(md)) throw new Error('no dashes of that kind in the markdown');
fs.writeFileSync(MD_OUT, md);
console.log(`wrote ${path.relative(process.cwd(), MD_OUT)}`);
