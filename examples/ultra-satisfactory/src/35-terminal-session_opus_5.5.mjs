#!/usr/bin/env node
// ULTRA-SATISFACTORY as a dial-up terminal program session (style xfer-05 in styles/styles.json).
//
// Regenerate:  node examples/ultra-satisfactory/src/35-terminal-session_opus_5.5.mjs
// Writes assets/35-terminal-session_opus_5.5.svg (the animated screen) and 35-terminal-session_opus_5.5.md
// (the header itself: its plain-text dialing directory and command menu are measured here too).
//
// The caller's side of a BBS, 1984-1996: an 80 x 25 DOS text screen where a modem init string is
// typed and answered, a dialing directory pops up, a redialer gets BUSY and tries the next tagged
// entry, the line CONNECTs, a Zmodem box pulls a file down, and the Alt-Z command menu closes the
// call. The style's lineage is Telix
// (grey on black, red status bar) and Qmodem (blue pop-up windows, yellow keys, cyan labels);
// both are credited references only. Nothing here is copied from either program: the banner,
// window layouts, labels and lettering are this generator's own.
//
// What is real: the file being received is this app's own open data (data/data.json, 1,553,963
// bytes, top-level sections at the byte offsets in SECTIONS below), the Rotor recipe, the item,
// recipe and building counts, the two run commands and the live URL. What is staged: everything
// else. The thing on the line is always the app, never the game.
//
// Plain Node, no dependencies, fully deterministic (no clock, no unseeded randomness). Text is a
// bitmap font defined below, placed with <use>, never <text>. Animation is CSS only, one 35.5 s
// loop of stepped keyframes on the character grid, and the un-animated state of every element is
// the "transfer complete" frame, so prefers-reduced-motion shows a whole, readable screen.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '35-terminal-session_opus_5.5';
const OUT = path.join(HERE, '..', 'assets', `${SLUG}.svg`);

// ---------------------------------------------------------------------------------------------
// Geometry
// ---------------------------------------------------------------------------------------------
const COLS = 80, ROWS = 25, CW = 8, CH = 16;
const SW = COLS * CW, SH = ROWS * CH;          // 640 x 400: the text screen
const EDGE = 12, OVER = 8;                     // panel edge, and the tube's black overscan border
const OX = EDGE + OVER, OY = EDGE + OVER;      // origin of the character grid
const MODEM = { gap: 10, h: 40 };
const VBW = SW + OX * 2;
const VBH = OY + SH + OVER + MODEM.gap + MODEM.h + EDGE;

// The 16-colour DOS palette.
const PAL = ['#000000', '#0000AA', '#00AA00', '#00AAAA', '#AA0000', '#AA00AA', '#AA5500', '#AAAAAA',
  '#555555', '#5555FF', '#55FF55', '#55FFFF', '#FF5555', '#FF55FF', '#FFFF55', '#FFFFFF'];
const [BLK, BLU, GRN, CYN, RED, MAG, BRN, LGR, DGR, LBL, LGN, LCY, LRD, LMG, YEL, WHT] = PAL.map((_, i) => i);

// ---------------------------------------------------------------------------------------------
// The real numbers
// ---------------------------------------------------------------------------------------------
const LIVE = 'lukexyz.github.io/ULTRA-SATISFACTORY';
const FILE = { name: 'data.json', bytes: 1553963, block: 1024 };
FILE.blocks = Math.ceil(FILE.bytes / FILE.block);
// Byte offsets of data.json's top-level keys, measured on 2026-09-30. The transfer box's status
// line names the section the byte counter is actually inside.
const SECTIONS = [['items', 6], ['recipes', 90935], ['schematics', 791210], ['generators', 1197631],
  ['resources', 1199410], ['miners', 1202312], ['buildings', 1204769]];
const BPS = 38400, CPS_MAX = BPS / 10;         // 8 data bits + start + stop = 10 bits a character
const XFER_SECONDS = 410;                      // 1,553,963 bytes at about 3,790 characters a second

// ---------------------------------------------------------------------------------------------
// Timeline (seconds). One loop; every element is visible for one or more [from, to) intervals.
// ---------------------------------------------------------------------------------------------
const T = 35.5;
const INIT = 'AT&F&C1&D2 S0=0 M1 L3';
const tm = {};
tm.init0 = 0.3; tm.init1 = tm.init0 + INIT.length * 0.05;
tm.ok = tm.init1 + 0.3;
tm.dir = 2.2;                                  // the dialing directory pops open
tm.dirFull = tm.dir + 0.14;
tm.bar = [tm.dirFull, tm.dirFull + 2.0, tm.dirFull + 4.0];
tm.tag = tm.bar.map((t) => t + 1.0);
tm.red = tm.dirFull + 5.8;                     // Enter: the redialer opens over it
tm.redFull = tm.red + 0.14;
tm.dial1 = tm.redFull + 0.05;
tm.busy = tm.dial1 + 1.8;
tm.cycle = tm.busy + 1.5;
tm.connect = tm.cycle + 1.7;
tm.close = tm.connect + 1.0;                   // both windows close; the session is on screen
tm.desk = tm.close + 0.4;
tm.ask0 = tm.desk + 0.6; tm.ask1 = tm.ask0 + 5 * 0.09;
tm.card = tm.ask1 + 0.3;
tm.home = tm.card + 1.25;
tm.send = tm.home + 1.4;
tm.rz = tm.send + 0.4; tm.zhdr = tm.rz + 0.15;
tm.box = tm.zhdr + 0.25; tm.boxFull = tm.box + 0.14;
tm.x0 = tm.boxFull + 0.16;
const STEPS = 25, STEP = 0.3;
tm.x1 = tm.x0 + STEPS * STEP;                  // transfer complete
tm.boxClose = tm.x1 + 2.4;
tm.hang = tm.boxClose + 0.4;
tm.menu = tm.hang + 1.1;                    // Alt-Z: the command menu pops up over the dead line
tm.menuFull = tm.menu + 0.14;
tm.clear = tm.menu + 3.6;                      // Alt-X: the menu closes and the screen clears
const HOLD = tm.x1 + 1.3;                      // the frame shown when animation is off
if (tm.clear > T - 0.5) throw new Error(`timeline overruns the loop: clear at ${tm.clear}`);

// ---------------------------------------------------------------------------------------------
// CP437-style 8x16 bitmap font. Rows are '#'/'.' strings, placed from row `top` of the cell.
// Capitals sit on rows 2-11 with the VGA habit of 2-pixel stems; lowercase x-height is row 5.
// (Own lettering, shared with the other character-grid headers in this folder.)
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
  '%': [4, '##....#. ##...##. ....##.. ...##... ..##.... .##..... ##...##. #....##.'],
  '·': [7, '...##... ...##...'],
  // CP437 0xFB, the tag mark of every dialing directory.
  '√': [1, '....#### ....##.. ....##.. ....##.. ....##.. ....##.. ###.##.. .##.##.. .##.##.. ..####.. ...###.. ....##..'],
};
for (const [ch, [top, rows]] of Object.entries(PUNCT)) def(ch, top, rows);
FONT.set(' ', new Array(16).fill(0));

// Blocks, a CP437 shade, and box drawing generated from arm descriptions: single lines on
// row 7 / column 3, double lines on rows 6+9 / columns 2+5.
const rowsOf = (fn) => Array.from({ length: 16 }, (_, y) => fn(y));
FONT.set('█', rowsOf(() => 0xFF));
FONT.set('░', rowsOf((y) => (y % 2 ? 0x88 : 0x22)));
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
box('═', ({ hline }) => { hline(6, 0, 7); hline(9, 0, 7); });
box('║', ({ vline }) => { vline(2, 0, 15); vline(5, 0, 15); });
box('╔', ({ hline, vline }) => { hline(6, 2, 7); vline(2, 6, 15); hline(9, 5, 7); vline(5, 9, 15); });
box('╗', ({ hline, vline }) => { hline(6, 0, 5); vline(5, 6, 15); hline(9, 0, 2); vline(2, 9, 15); });
box('╚', ({ hline, vline }) => { hline(9, 2, 7); vline(2, 0, 9); hline(6, 5, 7); vline(5, 0, 6); });
box('╝', ({ hline, vline }) => { hline(9, 0, 5); vline(5, 0, 9); hline(6, 0, 2); vline(2, 0, 6); });
box('╟', ({ hline, vline }) => { vline(2, 0, 15); vline(5, 0, 15); hline(7, 5, 7); });
box('╢', ({ hline, vline }) => { vline(2, 0, 15); vline(5, 0, 15); hline(7, 0, 2); });
const MERGED = new Set(['─', '│', '═', '║', '╔', '╗', '╚', '╝', '╟', '╢', '█', '░']);

// Bitmap -> compact path (greedy merge of horizontal runs into rectangles).
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

const len = (str) => [...str].length;

// ---------------------------------------------------------------------------------------------
// Build state. The screen is built twice: the first pass only counts how often each glyph and
// each word is drawn, so the second can give the busiest glyphs one-letter ids and define any
// word that appears more than once (the live URL appears ten times) a single time.
// ---------------------------------------------------------------------------------------------
let S = null;
const fresh = (tally) => ({ css: [], vis: new Map(), types: 0, glyphs: new Map(), words: new Map(), seen: { glyphs: new Map(), words: new Map() }, tally });
const bump = (map, key) => map.set(key, (map.get(key) || 0) + 1);
const IDS = [...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'];
function gid(ch) {
  if (!FONT.has(ch)) throw new Error(`no glyph for ${JSON.stringify(ch)} (U+${ch.codePointAt(0).toString(16)})`);
  bump(S.seen.glyphs, ch);
  if (!S.glyphs.has(ch)) {
    const n = S.glyphs.size;
    S.glyphs.set(ch, n < IDS.length ? IDS[n] : IDS[Math.floor(n / IDS.length) - 1] + IDS[n % IDS.length]);
  }
  return S.glyphs.get(ch);
}
const WORD_MIN = 5;
function word(str) {
  bump(S.seen.words, str);
  if (!S.tally || (S.tally.words.get(str) || 0) < 2) return null;
  if (!S.words.has(str)) S.words.set(str, `w${S.words.size.toString(36)}`);
  return S.words.get(str);
}

// ---------------------------------------------------------------------------------------------
// A patch of the character grid: background runs, text, and box-drawing cells. Box and block
// cells are rasterised together and merged into long rectangles; letters are <use> references.
// ---------------------------------------------------------------------------------------------
class Patch {
  constructor() { this.bgs = []; this.text = new Map(); this.boxes = new Map(); }
  put(r, c, str, fg) {
    for (const ch of str) {
      if (c < 0 || c >= COLS || r < 0 || r >= ROWS) throw new Error(`off screen at ${r},${c}: ${str}`);
      if (ch !== ' ') {
        const bucket = MERGED.has(ch) ? this.boxes : this.text;
        if (!bucket.has(fg)) bucket.set(fg, []);
        bucket.get(fg).push([r, c, ch]);
      }
      c++;
    }
    return c;
  }
  seg(r, c, parts) { for (const [t, fg] of parts) c = this.put(r, c, t, fg); return c; }
  fill(r, c, n, color, rows = 1) { this.bgs.push({ r, c, n, color, rows }); return this; }
  svg() {
    let out = '';
    for (const b of this.bgs) out += `<rect class="c${b.color}" x="${b.c * CW}" y="${b.r * CH}" width="${b.n * CW}" height="${b.rows * CH}"/>`;
    for (const [fg, cells] of this.boxes) {
      const r0 = Math.min(...cells.map((k) => k[0])), r1 = Math.max(...cells.map((k) => k[0]));
      const c0 = Math.min(...cells.map((k) => k[1])), c1 = Math.max(...cells.map((k) => k[1]));
      const w = (c1 - c0 + 1) * CW, h = (r1 - r0 + 1) * CH;
      const px = new Uint8Array(w * h);
      for (const [r, c, ch] of cells) {
        const g = FONT.get(ch);
        for (let y = 0; y < 16; y++) for (let x = 0; x < 8; x++) if ((g[y] >> (7 - x)) & 1) px[((r - r0) * CH + y) * w + (c - c0) * CW + x] = 1;
      }
      out += `<path class="c${fg}" d="${bitmapPath(Array.from({ length: h }, (_, y) => (x) => px[y * w + x]), w, 1, 1, c0 * CW, r0 * CH)}"/>`;
    }
    for (const [fg, cells] of this.text) {
      const byRow = new Map();
      for (const [r, c, ch] of cells) { if (!byRow.has(r)) byRow.set(r, new Map()); byRow.get(r).set(c, ch); }
      let inner = '';
      for (const [r, map] of byRow) {
        // Split the row into unbroken runs of cells; a run drawn elsewhere too becomes one <use>.
        const cols = [...map.keys()].sort((a, b) => a - b);
        const items = [];
        for (let i = 0; i < cols.length;) {
          let j = i;
          while (j + 1 < cols.length && cols[j + 1] === cols[j] + 1) j++;
          const str = cols.slice(i, j + 1).map((c) => map.get(c)).join('');
          const id = j - i + 1 >= WORD_MIN ? word(str) : null;
          if (id) items.push([cols[i], id]);
          else for (let k = i; k <= j; k++) items.push([cols[k], gid(map.get(cols[k]))]);
          i = j + 1;
        }
        if (items.length >= 5) inner += `<g transform="translate(0 ${r * CH})">${items.map(([c, id]) => `<use href="#${id}" x="${c * CW}"/>`).join('')}</g>`;
        else inner += items.map(([c, id]) => `<use href="#${id}" x="${c * CW}" y="${r * CH}"/>`).join('');
      }
      out += `<g class="c${fg}">${inner}</g>`;
    }
    return out;
  }
}
const patch = (fn) => { const p = new Patch(); fn(p); return p.svg(); };

// ---------------------------------------------------------------------------------------------
// Visibility: a class per distinct set of intervals. step-end keyframes switch opacity on the
// grid's own beat. Every timed element is hidden at rest except those on screen at HOLD (class
// "h"), so with animation off the picture is the finished transfer.
// ---------------------------------------------------------------------------------------------
const pct = (t) => +((100 * t) / T).toFixed(3);
function vis(...iv) {
  iv = iv.filter(([a, b]) => b > a).sort((p, q) => p[0] - q[0]);
  for (const [a, b] of iv) if (a < 0 || b > T + 1e-9) throw new Error(`interval outside the loop: ${a}-${b}`);
  const key = iv.map(([a, b]) => `${a.toFixed(3)}-${b.toFixed(3)}`).join('|');
  if (S.vis.has(key)) return S.vis.get(key);
  const name = `v${S.vis.size.toString(36)}`;
  const on = (t) => (iv.some(([a, b]) => t >= a && t < b) ? 1 : 0);
  const pts = new Map([[0, on(0)]]);
  for (const [a, b] of iv) { if (a > 0) pts.set(a, 1); if (b < T) pts.set(b, on(b)); }
  const kf = [...pts].sort((p, q) => p[0] - q[0]).map(([t, o]) => `${pct(t)}%{opacity:${o}}`).join('');
  S.css.push(`@keyframes ${name}{${kf}}.${name}{animation-name:${name}}`);
  const cls = `a ${name}${on(HOLD) ? ' h' : ''}`;
  S.vis.set(key, cls);
  return cls;
}
const show = (iv, inner) => `<g class="${vis(...(Array.isArray(iv[0]) ? iv : [iv]))}">${inner}</g>`;

// Text that changes over time. Each frame is [from, to, text, colour], back to back. Every column
// is cut into runs of frames where its character stays put, and cells that share a run share a
// group, so a counter's leading digits are drawn once, not once a step.
class Runs {
  constructor() { this.buckets = new Map(); }
  add(r, c, frames) {
    const rows = frames.map(([a, b, text, fg]) => ({ a, b, chars: [...text], fg }));
    const width = Math.max(...rows.map((f) => f.chars.length));
    for (let i = 0; i < width; i++) {
      for (let k = 0; k < rows.length;) {
        const ch = rows[k].chars[i] ?? ' ', fg = rows[k].fg;
        let j = k;
        while (j + 1 < rows.length && (rows[j + 1].chars[i] ?? ' ') === ch && rows[j + 1].fg === fg && Math.abs(rows[j + 1].a - rows[j].b) < 1e-9) j++;
        if (ch !== ' ') {
          const key = `${rows[k].a.toFixed(3)}|${rows[j].b.toFixed(3)}`;
          if (!this.buckets.has(key)) this.buckets.set(key, { iv: [rows[k].a, rows[j].b], cells: [] });
          this.buckets.get(key).cells.push([r, c + i, ch, fg]);
        }
        k = j + 1;
      }
    }
    return this;
  }
  svg() {
    let out = '';
    for (const { iv, cells } of this.buckets.values()) out += show(iv, patch((p) => cells.forEach(([r, c, ch, fg]) => p.put(r, c, ch, fg))));
    return out;
  }
}

// The DOS cursor: two scanlines at the foot of the cell, blinking.
const cursorAt = (r, c) => `<rect class="cb c7" x="${c * CW}" y="${r * CH + 13}" width="${CW}" height="2"/>`;

// Typing: the whole line is drawn at once under a black cover that steps right one cell a key,
// carrying the cursor on its leading edge.
function typing(r, c, n, a, b) {
  const name = `y${S.types++}`;
  const w = n * CW;
  S.css.push(`@keyframes ${name}{0%{transform:translateX(0)}${pct(a)}%{transform:translateX(0);animation-timing-function:steps(${n},end)}${pct(b)}%{transform:translateX(${w}px)}100%{transform:translateX(${w}px)}}`
    + `.${name}{transform:translateX(${w}px);animation:${name} ${T}s linear infinite}`);
  return show([a, b], `<g class="${name}"><rect x="${c * CW}" y="${r * CH}" width="${w}" height="${CH}" fill="#000"/>${cursorAt(r, c)}</g>`);
}

// A pop-up window: shadow, blue field, double-line frame with a centred title. Windows "explode"
// open in two stepped frames, as DOS text UIs did.
function frame(p, { r0, c0, r1, c1, title, fg = WHT, bg = BLU }) {
  p.fill(r0, c0, c1 - c0 + 1, bg, r1 - r0 + 1);
  let top = '═'.repeat(c1 - c0 - 1);
  if (title) {
    const t = ` ${title} `;
    const at = Math.floor((c1 - c0 - 1 - len(t)) / 2);
    top = top.slice(0, at) + ' '.repeat(len(t)) + top.slice(at + len(t));
    p.put(r0, c0 + 1 + at, t, YEL);
  }
  p.put(r0, c0, `╔${top}╗`, fg);
  for (let r = r0 + 1; r < r1; r++) { p.put(r, c0, '║', fg); p.put(r, c1, '║', fg); }
  p.put(r1, c0, '╚' + '═'.repeat(c1 - c0 - 1) + '╝', fg);
}
const rule = (p, r, c0, c1, fg = WHT) => p.put(r, c0, '╟' + '─'.repeat(c1 - c0 - 1) + '╢', fg);
function shadow({ r0, c0, r1, c1 }) {
  const x1 = Math.min(COLS, c1 + 3) * CW;
  const right = `<rect x="${(c1 + 1) * CW}" y="${(r0 + 1) * CH}" width="${x1 - (c1 + 1) * CW}" height="${(r1 - r0) * CH}"/>`;
  const below = `<rect x="${(c0 + 2) * CW}" y="${(r1 + 1) * CH}" width="${x1 - (c0 + 2) * CW}" height="${CH}"/>`;
  return `<g fill="#000" opacity=".62">${right}${below}</g>`;
}
function popup(box, open, full, close, body) {
  const mid = (k) => {
    const hr = (box.r1 - box.r0) / 2, hc = (box.c1 - box.c0) / 2, cr = (box.r0 + box.r1) / 2, cc = (box.c0 + box.c1) / 2;
    const b = { r0: Math.round(cr - hr * k), r1: Math.round(cr + hr * k), c0: Math.round(cc - hc * k), c1: Math.round(cc + hc * k) };
    return shadow(b) + patch((p) => frame(p, b));
  };
  const half = (full - open) / 2;
  return show([open, open + half], mid(0.3)) + show([open + half, full], mid(0.65))
    + show([full, close], shadow(box) + body);
}
// The grey hint row at the foot of a window: key names in red, what they do in black.
function hints(p, r, c0, c1, keys) {
  p.fill(r, c0 + 1, c1 - c0 - 1, LGR);
  let c = c0 + 2;
  for (const [key, label] of keys) { c = p.put(r, c, key, RED); c = p.put(r, c, `-${label}`, BLK) + 2; }
  if (c - 2 > c1 - 1) throw new Error('hint row too wide');
}

// ---------------------------------------------------------------------------------------------
// 1. The start-up banner: the name in half-block capitals (a 3 x 7 face on the 80 x 50 half-cell
//    grid, with one half-cell of extrusion), then two lines of plain text. Always on screen.
// ---------------------------------------------------------------------------------------------
const FACE = {
  U: '#.# #.# #.# #.# #.# #.# ###',
  L: '#.. #.. #.. #.. #.. #.. ###',
  T: '### .#. .#. .#. .#. .#. .#.',
  R: '##. #.# #.# ##. #.# #.# #.#',
  A: '.#. #.# #.# ### #.# #.# #.#',
  S: '### #.. #.. ### ..# ..# ###',
  I: '### .#. .#. .#. .#. .#. ###',
  F: '### #.. #.. ##. #.. #.. #..',
  C: '### #.. #.. #.. #.. #.. ###',
  O: '### #.# #.# #.# #.# #.# ###',
  Y: '#.# #.# #.# .#. .#. .#. .#.',
  '-': '... ... ... ### ... ... ...',
};
const NAME = 'ULTRA-SATISFACTORY';
function banner() {
  const HP = 8;                                   // a half cell: 8 x 8 px
  const cols = [];                                // cols[x] = { bits[7], ink }
  [...NAME].forEach((ch, i) => {
    if (i) cols.push(null);
    const rows = FACE[ch].split(' ');
    const ink = i < 5 ? 'u' : i === 5 ? 'd' : 's';
    for (let x = 0; x < 3; x++) cols.push({ bits: rows.map((row) => row[x] === '#'), ink });
  });
  const x0 = Math.floor((COLS - cols.length) / 2) * CW;
  const face = (ink) => bitmapPath(Array.from({ length: 7 }, (_, y) => (x) => cols[x] && cols[x].ink === ink && cols[x].bits[y]), cols.length, HP, HP, x0, 0);
  // Extrusion: the half cell under every foot of a letter, in the darker shade of its colour.
  const under = (ink) => bitmapPath(Array.from({ length: 8 }, (_, y) => (x) => y > 0 && cols[x] && cols[x].ink === ink && cols[x].bits[y - 1] && !(y < 7 && cols[x].bits[y])), cols.length, HP, HP, x0, 0);
  let out = `<path class="c${CYN}" d="${under('u')}"/><path class="c${DGR}" d="${under('s')}"/>`
    + `<path class="c${LCY}" d="${face('u')}"/><path class="c${DGR}" d="${face('d')}"/><path class="c${WHT}" d="${face('s')}"/>`;
  const l1 = 'Every recipe, building and Space Elevator objective, one click apart.';
  const l2 = [['A companion app for the game ', LGR], ['Satisfactory', WHT], ['. Unofficial fan project. ', LGR], ['Apache 2.0', WHT], ['.', LGR]];
  const w2 = l2.reduce((a, [t]) => a + len(t), 0);
  if (len(l1) > COLS || w2 > COLS) throw new Error('banner text too wide');
  out += patch((p) => {
    p.put(4, Math.floor((COLS - len(l1)) / 2), l1, YEL);
    p.seg(5, Math.floor((COLS - w2) / 2), l2);
  });
  return out;
}

// ---------------------------------------------------------------------------------------------
// 2. The session transcript, rows 7-22. Lines of 45 columns or fewer, so the transfer box can
//    open beside them. Text stays until the screen clears at the end of the loop.
// ---------------------------------------------------------------------------------------------
const ROW = { init: 7, ok: 8, dial1: 9, busy: 10, dial2: 11, connect: 12, desk: 14, card: 15, home: 17, send: 20, z: 21, hang: 22 };
const TEXT_MAX = 45;
function transcript() {
  let out = '';
  const line = (from, r, parts, to = tm.clear) => {
    const w = parts.reduce((a, [t]) => a + len(t), 0);
    if (w > TEXT_MAX) throw new Error(`transcript row ${r} is ${w} columns: ${parts.map(([t]) => t).join('')}`);
    out += show([from, to], patch((p) => p.seg(r, 0, parts)));
  };
  // The modem dialogue, in capitals.
  line(tm.init0, ROW.init, [[INIT, LGR]]);
  out += typing(ROW.init, 0, len(INIT), tm.init0, tm.init1);
  line(tm.ok, ROW.ok, [['OK', WHT]]);
  line(tm.dial1, ROW.dial1, [['ATDT ', LGR], [`${LIVE},,1`, LGR]]);
  line(tm.busy, ROW.busy, [['BUSY', LRD]]);
  line(tm.cycle + 0.05, ROW.dial2, [['ATDT ', LGR], [`${LIVE},,2`, LGR]]);
  line(tm.connect, ROW.connect, [['CONNECT ', LGN], [`${BPS}/STLITE/WASM`, LGN]]);
  // The far end: the ITEMS tab answers, and a lookup is typed.
  const ask = [['ITEMS', LRD], [': ', LGR], ['140', WHT], [' items, ', LGR], ['211', WHT], [' recipes. Item? ', LGR]];
  const askW = ask.reduce((a, [t]) => a + len(t), 0);
  line(tm.desk, ROW.desk, ask);
  out += show([tm.ask0, tm.clear], patch((p) => p.put(ROW.desk, askW, 'ROTOR', YEL)));
  if (askW + 5 > TEXT_MAX) throw new Error('lookup line too wide');
  out += typing(ROW.desk, askW, 5, tm.ask0, tm.ask1);
  // Verified against the app's data: 5 Iron Rod + 25 Screw -> 1 Rotor, Assembler, 15 s, 15 MW, 4/min.
  line(tm.card, ROW.card, [[' 5', YEL], [' Iron Rod + ', LGR], ['25', YEL], [' Screw -> ', LGR], ['1', YEL], [' Rotor ', WHT], ['(4/min)', LGN]]);
  line(tm.card + 0.15, ROW.card + 1, [[' Assembler', LCY], [', ', LGR], ['15 s', WHT], [', ', LGR], ['15 MW', WHT], ['. Yes: 25 screws.', LGR]]);
  line(tm.home, ROW.home, [['Want this desk at home? Two commands:', LGR]]);
  line(tm.home + 0.12, ROW.home + 1, [[' python -m pip install -r requirements.txt', WHT]]);
  line(tm.home + 0.24, ROW.home + 2, [[' python -m streamlit run app/app.py', WHT]]);
  line(tm.send, ROW.send, [['Sending ', LGR], [FILE.name, WHT], ['. Start your receive.', LGR]]);
  // The sender's auto-start string: "rz" and a carriage return, so the header overprints it.
  line(tm.rz, ROW.z, [['rz', LGR]], tm.zhdr);
  line(tm.zhdr, ROW.z, [['**B00000000000000', LGR]]);
  line(tm.hang, ROW.hang, [['NO CARRIER', LRD]]);

  // Where the cursor waits between events.
  const idle = [
    [tm.clear, T, ROW.init, 0], [0, tm.init0, ROW.init, 0],
    [tm.init1, tm.ok, ROW.init, len(INIT)], [tm.ok, tm.dial1, ROW.dial1, 0],
    [tm.connect, tm.desk, ROW.connect + 1, 0], [tm.desk, tm.ask0, ROW.desk, askW],
    [tm.ask1, tm.card, ROW.desk, askW + 5], [tm.card, tm.home, ROW.home, 0],
    [tm.home, tm.send, ROW.send, 0], [tm.send, tm.rz, ROW.z, 0],
    [tm.zhdr, tm.hang, ROW.hang, 0], [tm.hang, tm.menu, ROW.hang + 1, 0],
  ];
  for (const [a, b, r, c] of idle) out += show([a, b], cursorAt(r, c));
  return out;
}

// ---------------------------------------------------------------------------------------------
// 3. The dialing directory. Entries 1-3 are the app's tabs (extensions ,,1 ,,2 ,,3 of the live
//    number: commas are dial pauses), then where to run it and where the source lives.
// ---------------------------------------------------------------------------------------------
const DIR = { r0: 7, c0: 0, r1: 20, c1: 77 };
const ENTRIES = [
  { name: 'OBJECTIVES', ink: LMG, num: `${LIVE},,1`, last: 'Tonight', note: 'Pick a Space Elevator phase: the parts it needs, and how many.' },
  { name: 'ITEMS', ink: LRD, num: `${LIVE},,2`, last: '2 min ago', note: 'Search as you type: rates per minute, machine, cycle time, power.' },
  { name: 'BUILDINGS', ink: LCY, num: `${LIVE},,3`, last: 'Tonight', note: 'Every building and what it makes, by tier, with Mk upgrade paths.' },
  { name: 'RUN IT AT HOME', ink: WHT, num: 'localhost:8501', last: 'Yesterday' },
  { name: 'THE SOURCE', ink: WHT, num: 'github.com/lukexyz/ULTRA-SATISFACTORY', last: 'Every push' },
  { name: 'THE MANIFOLD', ink: WHT, num: 'please hold. It fills up eventually.', last: 'On hold' },
  { name: 'PIPE IN THE WALL', ink: WHT, num: 'unlisted. We do not discuss it.', last: 'Never. Shh.' },
];
const DCOL = { tag: DIR.c0 + 2, idx: DIR.c0 + 4, name: DIR.c0 + 7, num: DIR.c0 + 25, last: DIR.c0 + 65 };
function directory() {
  const { r0, c0, r1, c1 } = DIR;
  const inner = c1 - c0 - 3;
  const rowOf = (i) => r0 + 3 + i;
  const draw = (p, i, colours) => {
    const e = ENTRIES[i], r = rowOf(i);
    if (len(e.name) > 16 || len(e.num) > 39 || len(e.last) > 11) throw new Error(`directory entry ${i + 1} too wide`);
    p.put(r, DCOL.idx, String(i + 1).padStart(2), colours.idx);
    p.put(r, DCOL.name, e.name, colours.name ?? e.ink);
    p.put(r, DCOL.num, e.num, colours.num);
    p.put(r, DCOL.last, e.last, colours.last);
  };
  let body = patch((p) => {
    frame(p, { ...DIR, title: 'Dialing Directory' });
    p.put(r0 + 1, DCOL.idx + 1, '#', LCY); p.put(r0 + 1, DCOL.name, 'Name', LCY);
    p.put(r0 + 1, DCOL.num, 'Number', LCY); p.put(r0 + 1, DCOL.last, 'Last call', LCY);
    rule(p, r0 + 2, c0, c1);
    ENTRIES.forEach((_, i) => draw(p, i, { idx: LGR, num: LGR, last: LGR }));
    rule(p, r1 - 3, c0, c1);
    hints(p, r1 - 1, c0, c1, [['Enter', 'Dial'], ['Space', 'Tag'], ['R', 'Revise'], ['F', 'Find'], ['PgDn', 'More'], ['Esc', 'Exit']]);
  });
  // The light bar walks down the three tabs, tagging each; the note line explains the one it is on.
  const barEnd = [tm.bar[1], tm.bar[2], tm.close];
  for (let i = 0; i < 3; i++) {
    const e = ENTRIES[i];
    if (len(e.note) > inner) throw new Error(`note ${i + 1} too wide`);
    body += show([tm.bar[i], barEnd[i]], patch((p) => {
      p.fill(rowOf(i), c0 + 1, c1 - c0 - 1, LGR);
      draw(p, i, { idx: BLK, name: BLK, num: BLK, last: BLK });
      p.put(r1 - 2, c0 + 2, e.note, YEL);
    }));
    body += show([tm.tag[i], barEnd[i]], patch((p) => p.put(rowOf(i), DCOL.tag, '√', RED)));
    body += show([barEnd[i], tm.close], patch((p) => p.put(rowOf(i), DCOL.tag, '√', YEL)));
  }
  return popup(DIR, tm.dir, tm.dirFull, tm.close, body);
}

// ---------------------------------------------------------------------------------------------
// 4. The redialer: OBJECTIVES is BUSY, so it cycles to the next tagged entry and CONNECTs.
// ---------------------------------------------------------------------------------------------
// It opens over the directory's Number column, leaving the tagged names showing beside it.
const RED_BOX = { r0: 10, c0: 24, r1: 19, c1: 75 };
function redialer() {
  const { r0, c0, r1, c1 } = RED_BOX;
  const L = c0 + 2, V = c0 + 11;
  const labels = ['Name', 'Number', 'Script', 'Last', 'Attempt'];
  let body = patch((p) => {
    frame(p, { ...RED_BOX, title: 'Redialing tagged entries' });
    labels.forEach((t, i) => { p.put(r0 + 1 + i, L, t, LCY); p.put(r0 + 1 + i, V - 2, ':', LCY); });
    p.put(r0 + 3, V, 'TIDYUP.SCR (not found)', WHT);
    rule(p, r0 + 6, c0, c1);
    hints(p, r1 - 1, c0, c1, [['C', 'Cycle'], ['K', 'Kill'], ['X', 'Extend'], ['Esc', 'Give up']]);
  });
  const attempt = (a, b, i, last, n) => show([a, b], patch((p) => {
    p.put(r0 + 1, V, ENTRIES[i].name, ENTRIES[i].ink);
    p.put(r0 + 2, V, ENTRIES[i].num, WHT);
    p.put(r0 + 4, V, last, last === 'BUSY' ? LRD : WHT);
    p.put(r0 + 5, V, `${n} of 3 tagged`, WHT);
  }));
  body += attempt(tm.redFull, tm.cycle, 0, 'none yet', 1) + attempt(tm.cycle, tm.close, 1, 'BUSY', 2);
  // The countdown is in real seconds: 45, 44, then an answer.
  const status = (a, b, parts) => { body += show([a, b], patch((p) => p.seg(r0 + 7, L, parts))); };
  const runs = new Runs();
  const dialing = (a, b) => {
    status(a, b, [['Dialing...', YEL], ['     seconds left', WHT]]);
    const frames = [];
    for (let k = 0; a + k < b; k++) frames.push([a + k, Math.min(a + k + 1, b), String(45 - k), WHT]);
    runs.add(r0 + 7, L + 12, frames);
  };
  dialing(tm.redFull, tm.busy);
  status(tm.busy, tm.cycle, [['BUSY', LRD], ['. The Space Elevator is on the other line.', WHT]]);
  dialing(tm.cycle, tm.connect);
  status(tm.connect, tm.close, [['CONNECT ', LGN], [`${BPS}/STLITE/WASM`, LGN], ['. Somebody picked up.', WHT]]);
  return popup(RED_BOX, tm.red, tm.redFull, tm.close, body + runs.svg());
}

// ---------------------------------------------------------------------------------------------
// 5. The transfer box. 25 steps; every figure on a step is consistent with the others: bytes are
//    whole 1024-byte blocks, elapsed and remaining are bytes over the average rate, and the
//    status line names the section of data.json those bytes fall in.
// ---------------------------------------------------------------------------------------------
const XBOX = { r0: 7, c0: 46, r1: 21, c1: 77 };
const mmss = (sec) => `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(Math.round(sec) % 60).padStart(2, '0')}`;
const commas = (n) => String(n).replace(/\B(?=(\d{3})+$)/g, ',');
// A small seeded generator (mulberry32) for the characters-per-second wobble.
function prng(seed) {
  return () => {
    seed = (seed + 0x6D2B79F5) | 0;
    let z = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    z = (z + Math.imul(z ^ (z >>> 7), 61 | z)) ^ z;
    return ((z ^ (z >>> 14)) >>> 0) / 4294967296;
  };
}
const RESEND = 16;                              // the step where one block has to be sent again
const xferSteps = (() => {
  const rnd = prng(35);
  const avg = Math.round(FILE.bytes / XFER_SECONDS);
  return Array.from({ length: STEPS + 1 }, (_, k) => {
    const done = k === STEPS;
    const blocks = done ? FILE.blocks : Math.floor((FILE.bytes * k) / STEPS / FILE.block);
    const bytes = done ? FILE.bytes : blocks * FILE.block;
    const elapsed = Math.round((XFER_SECONDS * k) / STEPS);
    const cps = k === 0 ? 0 : done ? avg : avg + Math.round((rnd() - 0.5) * 60);
    const section = [...SECTIONS].reverse().find(([, off]) => bytes >= off);
    let status = [`Receiving "${section ? section[0] : SECTIONS[0][0]}"`, WHT];
    if (k === 0) status = ['Header OK. Here it comes.', WHT];
    if (k === RESEND) status = ['Belt reversed. Block resent.', LRD];
    if (done) status = ['CRC-32 OK. File complete.', LGN];
    return { k, bytes, blocks, elapsed, cps, status, errors: k >= RESEND ? 1 : 0, pct: done ? 100 : Math.floor((100 * bytes) / FILE.bytes) };
  });
})();
const stepAt = (k) => [k === 0 ? tm.boxFull : tm.x0 + k * STEP, k === STEPS ? tm.boxClose : tm.x0 + (k + 1) * STEP];
function transferBox() {
  const { r0, c0, r1, c1 } = XBOX;
  const L = c0 + 2, V = c0 + 16, W = c1 - c0 - 3;
  const BAR = W - 5;
  const labels = ['File', 'Bytes total', 'Bytes recvd', 'Blocks', 'Block size', 'Errors', 'Efficiency', 'Chars/sec', 'Elapsed', 'Remaining'];
  let body = patch((p) => {
    frame(p, { ...XBOX, title: 'Zmodem Download' });
    labels.forEach((t, i) => { p.put(r0 + 1 + i, L, t, LCY); p.put(r0 + 1 + i, V - 2, ':', LCY); });
    p.put(r0 + 1, V, FILE.name, WHT);
    p.put(r0 + 2, V, commas(FILE.bytes), WHT);
    p.put(r0 + 5, V, String(FILE.block), WHT);
    rule(p, r1 - 3, c0, c1);
  });
  // The empty completion bar is the CP437 light shade, as one patterned rectangle.
  body += `<rect x="${L * CW}" y="${(r1 - 1) * CH}" width="${BAR * CW}" height="${CH}" fill="url(#_b)"/>`;
  const runs = new Runs();
  const field = (r, c, text, fg = WHT) => {
    const frames = xferSteps.map((s) => [...stepAt(s.k), text(s), typeof fg === 'function' ? fg(s) : fg]);
    for (const f of frames) if (c + len(f[2]) > c1 - 1) throw new Error(`transfer value too wide: ${f[2]}`);
    runs.add(r, c, frames);
  };
  field(r0 + 3, V, (s) => commas(s.bytes).padStart(9));
  field(r0 + 4, V, (s) => `${String(s.blocks).padStart(4)} of ${FILE.blocks}`);
  field(r0 + 6, V, (s) => String(s.errors), (s) => (s.errors ? LRD : WHT));
  field(r0 + 7, V, (s) => (s.cps ? `${((100 * s.cps) / CPS_MAX).toFixed(1)}%` : '--'));
  field(r0 + 8, V, (s) => (s.cps ? commas(s.cps) : '--'));
  field(r0 + 9, V, (s) => `00:${mmss(s.elapsed)}`);
  field(r0 + 10, V, (s) => `00:${mmss(XFER_SECONDS - s.elapsed)}`);
  field(r1 - 1, L + BAR + 1, (s) => `${String(s.pct).padStart(3)}%`, YEL);
  field(r1 - 2, L, (s) => s.status[0], (s) => s.status[1]);
  // The completion bar fills a cell at a time, in step with the byte counter.
  field(r1 - 1, L, (s) => '█'.repeat(s.k === STEPS ? BAR : Math.floor((BAR * s.bytes) / FILE.bytes)), LCY);
  return popup(XBOX, tm.box, tm.boxFull, tm.boxClose, body + runs.svg());
}

// ---------------------------------------------------------------------------------------------
// 6. The Alt-Z command menu: yellow keys and cyan labels on blue, under centred rule headings.
//    The same table feeds the picture (after NO CARRIER) and the linked plain-text copy in the
//    markdown. Every entry is this project's own; only the five group headings are the lineage's.
// ---------------------------------------------------------------------------------------------
const MENU_BOX = { r0: 7, c0: 0, r1: 20, c1: 79 };   // the full width of the screen
const MENU_W = 24;                              // one column of the menu
const MENU_COLS = [2, 4 + MENU_W, 6 + MENU_W * 2];
const MENU_ITEMS = [                            // [key, label, link in the markdown copy]
  [['Alt-D', 'Dialing directory', '#whats-inside'], ['Alt-O', 'Objectives', '#whats-inside'], ['Alt-H', 'Hang up. You won\'t']],
  [['Alt-L', 'Live, no install', `https://${LIVE}/`], ['Alt-I', 'Items', '#whats-inside'], ['Alt-X', 'Exit to factory']],
  [['Alt-R', 'Run it locally', '#run-it-locally'], ['Alt-B', 'Buildings', '#whats-inside'], ['Alt-C', 'Data & credits', '#data--credits']],
  [['Alt-S', 'Read the source', 'app/app.py'], ['PgDn', `Receive ${FILE.name}`], ['Alt-A', 'Apache 2.0', '#license']],
];
const MENU_SETUP = [['Alt-P', 'Line', `${BPS} N81`], ['Alt-T', 'Emulation', 'ANSI-BBS'], ['Alt-V', 'Version', '0.0.1'],
  ['Alt-Y', 'Python', '3.10+'], ['Alt-W', 'Second monitor', 'YES']];
const MENU_TOGGLES = [['Tidy factory', 'OFF'], ['Spaghetti', 'ON'], ['Manifolds', 'ON'], ['Load balancers', 'OFF'], ['Overclock', 'ON'],
  ['Belt direction', 'WRONG'], ['Fuse', 'BLOWN'], ['Pipe in the wall', 'SHH'], ['"Temporary"', 'FOREVER']];
for (const row of MENU_ITEMS) for (const [key, label] of row) if (len(key) > 5 || 6 + len(label) > MENU_W) throw new Error(`menu item too wide: ${label}`);
for (const [, label, value] of MENU_SETUP) if (6 + len(label) + 1 + len(value) > MENU_W) throw new Error(`menu setting too wide: ${label}`);
const toggleDots = ([name, state]) => {
  const n = MENU_W - 4 - len(name) - len(state);
  if (n < 1) throw new Error(`menu toggle too wide: ${name}`);
  return '.'.repeat(n);
};
const headingParts = (text, w) => { const room = w - len(text) - 2, a = Math.floor(room / 2); return ['─'.repeat(a), text, '─'.repeat(room - a)]; };
function menu() {
  const { r0, c0, c1 } = MENU_BOX;
  const cols = MENU_COLS.map((c) => c0 + c);
  if (cols[2] + MENU_W > c1 - 1) throw new Error('menu too wide for its window');
  const body = patch((p) => {
    frame(p, { ...MENU_BOX, title: 'Alt-Z  Command Menu' });
    const head = (r, c, text, w) => {
      const [a, t, b] = headingParts(text, w);
      p.put(r, c, a, LGR); p.put(r, c + len(a) + 1, t, WHT); p.put(r, c + len(a) + len(t) + 2, b, LGR);
    };
    ['Before', 'During', 'After'].forEach((t, i) => head(r0 + 1, cols[i], t, MENU_W));
    MENU_ITEMS.forEach((row, i) => row.forEach(([key, label], k) => {
      p.put(r0 + 2 + i, cols[k], key, YEL); p.put(r0 + 2 + i, cols[k] + 6, label, LCY);
    }));
    const r = r0 + 3 + MENU_ITEMS.length;
    head(r, cols[0], 'Setup', MENU_W); head(r, cols[1], 'Toggles', cols[2] + MENU_W - cols[1]);
    MENU_SETUP.forEach(([key, label, value], i) => {
      p.put(r + 1 + i, cols[0], key, YEL); p.put(r + 1 + i, cols[0] + 6, label, LCY);
      p.put(r + 1 + i, cols[0] + MENU_W - len(value), value, WHT);
    });
    const ink = (state) => (state === 'ON' ? LGN : state === 'OFF' ? LGR : state === 'SHH' || state === 'FOREVER' ? WHT : LRD);
    MENU_TOGGLES.forEach(([name, state], i) => {
      const c = cols[i < 5 ? 1 : 2], row = r + 1 + (i % 5);
      p.put(row, c, String(i + 1), YEL); p.put(row, c + 2, name, LCY);
      p.put(row, c + 3 + len(name), toggleDots([name, state]), CYN);
      p.put(row, c + MENU_W - len(state), state, ink(state));
    });
    if (r + MENU_SETUP.length + 1 !== MENU_BOX.r1) throw new Error('menu rows do not fill its window');
  });
  return popup(MENU_BOX, tm.menu, tm.menuFull, tm.clear, body);
}

// ---------------------------------------------------------------------------------------------
// 7. The status bar: red, in cells. The last cell is the line state, with the time online written
//    like the transfer box's clocks. The transfer is a time lapse, so the clock jumps with it and
//    both agree at the end.
// ---------------------------------------------------------------------------------------------
function statusBar() {
  const r = ROWS - 1;
  const cells = [[['Alt-Z', YEL], [' Help', WHT]], [['ANSI-BBS', WHT]], [[`${BPS} N81 FDX`, WHT]], [['v0.0.1', WHT]], [['Apache 2.0', WHT]]];
  let stateAt = 0;
  let out = patch((p) => {
    p.fill(r, 0, COLS, RED);
    let c = 0;
    for (const parts of cells) { c = p.seg(r, c + 1, parts) + 1; c = p.put(r, c, '│', LRD); }
    stateAt = c + 1;
  });
  if (stateAt + 15 > COLS) throw new Error('status bar too wide');
  out += show([[0, tm.connect], [tm.hang, T]], patch((p) => p.put(r, stateAt, 'Offline', YEL)));
  out += show([tm.connect, tm.hang], patch((p) => p.put(r, stateAt, 'Online', YEL)));
  // Clock frames: real seconds before and after the transfer, the transfer's own clock during it.
  const marks = [];
  let t = tm.connect, sec = 0;
  for (; t + 1 <= tm.x0 + STEP; t += 1, sec++) marks.push([t, sec]);
  const base = sec;
  for (let k = 1; k <= STEPS; k++) marks.push([tm.x0 + k * STEP, base + xferSteps[k].elapsed]);
  sec = base + XFER_SECONDS;
  for (t = tm.x1 + 1; t < tm.hang; t += 1) marks.push([t, ++sec]);
  marks.sort((p, q) => p[0] - q[0]);
  const frames = marks.map(([a, s], i) => [a, i + 1 < marks.length ? marks[i + 1][0] : tm.hang, `00:${mmss(s)}`, WHT]);
  return out + new Runs().add(r, stateAt + 7, frames).svg();
}

// ---------------------------------------------------------------------------------------------
// 8. The modem under the monitor: an invented maker, a speaker grille and eight lights that
//    follow the session (SD when we send, RD when the line answers, OH off hook, CD carrier).
// ---------------------------------------------------------------------------------------------
function modem() {
  const x = OX - OVER, y = OY + SH + OVER + MODEM.gap, w = SW + OVER * 2, h = MODEM.h;
  let out = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="#1b1b20"/>`
    + `<rect x="${x + 2}" y="${y}" width="${w - 4}" height="1" fill="#3a3a44"/><rect x="${x + 2}" y="${y + h - 1}" width="${w - 4}" height="1" fill="#09090b"/>`;
  // The speaker (M1 L3: on, and loud). While a number is dialled, a glow runs along the grille:
  // three frames, each slot lit once every 0.6 s.
  const slot = (i) => `M${x + 16 + i * 5} ${y + 11}h2v18h-2z`;
  const slots = Array.from({ length: 9 }, (_, i) => i);
  out += `<path d="${slots.map(slot).join('')}" fill="#0a0a0c"/>`;
  const screech = [[tm.dial1, tm.busy], [tm.cycle + 0.05, tm.connect + 0.3]];
  for (let k = 0; k < 3; k++) {
    const iv = [];
    for (const [a, b] of screech) for (let t = a + k * 0.2; t + 0.2 <= b + 1e-9; t += 0.6) iv.push([+t.toFixed(3), +(t + 0.2).toFixed(3)]);
    out += show(iv, `<path d="${slots.filter((i) => i % 3 === k).map(slot).join('')}" fill="#d9a441"/>`);
  }
  const text = (tx, ty, str, fill) => `<g fill="${fill}" transform="translate(${tx} ${ty})">${[...str].map((ch, i) => (ch === ' ' ? '' : `<use href="#${gid(ch)}" x="${i * CW}"/>`)).join('')}</g>`;
  out += text(x + 72, y + 4, 'WIDDERSHINS DATACOM', '#9c9caa') + text(x + 72, y + 20, `Mk.1 ${BPS} external. Runs warm.`, '#6a6a78');

  // Short pulses: `blips(from, to, every, on)`.
  const blips = (a, b, every, on) => { const iv = []; for (let t = a; t + on <= b; t += every) iv.push([+t.toFixed(3), +(t + on).toFixed(3)]); return iv; };
  const LEDS = [
    ['HS', [[tm.connect, tm.hang]]],
    ['AA', []],
    ['CD', [[tm.connect, tm.hang]]],
    ['OH', [[tm.dial1, tm.busy + 0.3], [tm.cycle, tm.hang]]],
    ['RD', [[tm.ok, tm.ok + 0.15], [tm.busy, tm.busy + 0.2], [tm.connect, tm.connect + 0.3], [tm.desk, tm.desk + 0.2],
      ...blips(tm.ask0, tm.ask1, 0.09, 0.05), [tm.card, tm.card + 0.35], [tm.home, tm.home + 0.45], [tm.send, tm.send + 0.2],
      [tm.rz, tm.zhdr + 0.15], [tm.x0, tm.x1], [tm.hang, tm.hang + 0.2]]],
    ['SD', [...blips(tm.init0, tm.init1, 0.1, 0.06), [tm.dial1, tm.dial1 + 0.3], [tm.cycle + 0.05, tm.cycle + 0.35],
      ...blips(tm.ask0, tm.ask1, 0.09, 0.05), [tm.box, tm.box + 0.15], ...blips(tm.x0 + 0.4, tm.x1, 0.9, 0.12), [tm.boxClose + 0.2, tm.boxClose + 0.4]]],
    ['TR', null],
    ['MR', null],
  ];
  const pitch = 38, lx0 = x + w - 20 - pitch * LEDS.length + 10;
  LEDS.forEach(([name, iv], i) => {
    const lx = lx0 + i * pitch;
    out += text(lx, y + 3, name, '#77778a');
    out += `<rect x="${lx + 1}" y="${y + 24}" width="14" height="6" rx="1" fill="#3b0e0e"/>`;
    const lit = `<rect x="${lx - 1}" y="${y + 22}" width="18" height="10" rx="3" fill="#ff3b30" opacity=".22"/>`
      + `<rect x="${lx + 1}" y="${y + 24}" width="14" height="6" rx="1" fill="#ff4a3d"/><rect x="${lx + 3}" y="${y + 25}" width="10" height="2" fill="#ffb4a6"/>`;
    if (iv === null) out += lit;
    // While the file comes down RD shimmers instead of sitting solid (a small light, 2.4 Hz).
    else if (iv.length) out += show(iv, name === 'RD' ? `<g class="rd">${lit}</g>` : lit);
  });
  return out;
}

// ---------------------------------------------------------------------------------------------
// Assemble (twice: see "Build state")
// ---------------------------------------------------------------------------------------------
function build(tally) {
  S = fresh(tally);
  // Busiest glyphs first, so they get the one-letter ids.
  if (tally) [...tally.glyphs].sort((p, q) => q[1] - p[1]).forEach(([ch]) => gid(ch));
  const screen = [banner(), transcript(), directory(), redialer(), transferBox(), menu(), statusBar()].join('\n');
  const hardware = modem();
  const head = [
    PAL.map((c, i) => `.c${i}{fill:${c}}`).join(''),
    // Blocks, frames and fields snap to device pixels; letters are left antialiased, which keeps
    // their stems even when the image is scaled to the width of the page.
    'use{shape-rendering:auto}',
    `.a{opacity:0;animation:${T}s step-end infinite}.h{opacity:1}`,
    '@keyframes cb{0%{opacity:1}50%{opacity:0}}.cb{animation:cb .54s step-end infinite}',
    '@keyframes rd{0%{opacity:1}30%{opacity:.45}55%{opacity:1}}.rd{animation:rd .42s step-end infinite}',
  ];
  const tail = ['@media (prefers-reduced-motion:reduce){*{animation:none!important}}'];
  const dots = bitmapPath([(x) => x === 2, (x) => x === 0], 4);
  const defs = [...S.glyphs].map(([ch, id]) => `<path id="${id}" d="${glyphPath(FONT.get(ch))}"/>`).join('')
    + [...S.words].map(([str, id]) => `<g id="${id}">${[...str].map((ch, i) => `<use href="#${gid(ch)}"${i ? ` x="${i * CW}"` : ''}/>`).join('')}</g>`).join('')
    + `<pattern id="_b" width="4" height="2" patternUnits="userSpaceOnUse"><path class="c${LBL}" d="${dots}"/></pattern>`
    + `<clipPath id="_s"><rect width="${SW}" height="${SH}"/></clipPath>`;
  return { screen, hardware, css: [...head, ...S.css, ...tail].join('\n'), defs, seen: S.seen, stats: `${S.glyphs.size} glyphs, ${S.words.size} shared words, ${S.vis.size} timings` };
}
const B = build(build(null).seen);

const TITLE = 'ULTRA-SATISFACTORY: a dial-up terminal program session';
const DESC = 'An 80 by 25 DOS text screen under the name ULTRA-SATISFACTORY in cyan and white block capitals. '
  + 'A modem init string is typed and answered OK. A blue dialing directory opens: its first three entries are the app\'s tabs, OBJECTIVES, ITEMS and BUILDINGS, '
  + `each an extension of ${LIVE}, followed by localhost:8501 and the GitHub source. A redialer finds OBJECTIVES busy, cycles to ITEMS and connects at ${BPS}. `
  + 'The far end answers with 140 items and 211 recipes, looks up ROTOR (5 Iron Rod and 25 Screw make 1 Rotor in an Assembler, 15 seconds, 15 megawatts, 4 a minute), '
  + 'prints the two commands that run the app locally, then sends data.json. A Zmodem download box counts all 1,553,963 bytes in, and the line drops with NO CARRIER. '
  + 'The Alt-Z command menu then opens: yellow keys and cyan labels under the headings Before, During, After, Setup and Toggles. '
  + 'A red status bar shows the line settings, version 0.0.1, Apache 2.0 and the time online. Under the screen, an external modem blinks its lights.';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VBW} ${VBH}" width="${VBW}" height="${VBH}" role="img" aria-labelledby="_t _d">
<title id="_t">${TITLE}</title>
<desc id="_d">${DESC}</desc>
<style>${B.css}</style>
<defs>${B.defs}</defs>
<rect x=".5" y=".5" width="${VBW - 1}" height="${VBH - 1}" rx="9" fill="#101014" stroke="#30303c"/>
<rect x="${OX - OVER}" y="${OY - OVER}" width="${SW + OVER * 2}" height="${SH + OVER * 2}" rx="4" fill="#000"/>
<g transform="translate(${OX} ${OY})" clip-path="url(#_s)" shape-rendering="crispEdges">
${B.screen}
</g>
<g shape-rendering="crispEdges">${B.hardware}</g>
</svg>
`;

// ---------------------------------------------------------------------------------------------
// The markdown half: pitch, a plain-text dialing directory whose entries are real links, the two
// commands, and two collapsed extras. Built here so every column is measured, not eyeballed.
// ---------------------------------------------------------------------------------------------
const LIVE_URL = `https://${LIVE}/`;
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const WIDE = 80;
class Line {
  constructor() { this.n = 0; this.html = ''; }
  add(text, href, bold) {
    this.n += len(text);
    let x = esc(text);
    if (bold) x = `<b>${x}</b>`;
    if (href) x = `<a href="${href}">${x}</a>`;
    this.html += x;
    return this;
  }
  to(col) { if (col < this.n) throw new Error(`line overflows column ${col}: ${this.html}`); return this.add(' '.repeat(col - this.n)); }
  end(ch = '║') { this.to(WIDE - 1).add(ch); return this.html; }
}
const titled = (l, title, r, fillCh = '═') => {
  const t = title ? ` ${title} ` : '';
  const room = WIDE - 2 - len(t), a = Math.floor(room / 2);
  return l + fillCh.repeat(a) + t + fillCh.repeat(room - a) + r;
};

function directoryText() {
  const rows = [
    [1, 'OBJECTIVES', '#whats-inside', `${LIVE},,1`, LIVE_URL, '5 phases'],
    [1, 'ITEMS', '#whats-inside', `${LIVE},,2`, LIVE_URL, '140 items'],
    [1, 'BUILDINGS', '#whats-inside', `${LIVE},,3`, LIVE_URL, '477 buildings'],
    [0, 'RUN IT AT HOME', '#run-it-locally', 'localhost:8501', null, '2 commands'],
    [0, 'HOW IT\'S BUILT', '#how-its-built', 'app/app.py', 'app/app.py', 'one app'],
    [0, 'THE CLOUD ONE', '#how-its-built', 'modal_app.py', 'modal_app.py', 'on Modal'],
    [0, 'DATA & CREDITS', '#data--credits', 'greeny/SatisfactoryTools', 'https://github.com/greeny/SatisfactoryTools', 'the recipes'],
    [0, 'THE SMALL PRINT', '#license', 'LICENSE', 'LICENSE', 'Apache 2.0'],
    [0, 'THE MANIFOLD', null, 'please hold. It fills up eventually.', null, 'On hold'],
  ];
  const out = [titled('╔', 'Dialing Directory', '╗')];
  out.push(new Line().add('║').to(5).add('#').to(7).add('Name').to(25).add('Number').to(65).add('On the line').end());
  out.push(titled('╟', '', '╢', '─'));
  rows.forEach(([tag, name, nameHref, num, numHref, note], i) => {
    out.push(new Line().add('║ ').add(tag ? '•' : ' ').add(' ').add(String(i + 1).padStart(2)).add(' ')
      .add(name, nameHref, true).to(25).add(num, numHref).to(65).add(note).end());
  });
  out.push(titled('╟', '', '╢', '─'));
  out.push(new Line().add('║ ').add('Enter', null, true).add('-Dial: click a ').add('Name', null, true).add(' for this README, or a ').add('Number', null, true).add(' for the real thing.').end());
  out.push(titled('╚', '', '╝'));
  return out;
}

function menuText() {
  const out = [titled('╔', 'Alt-Z  Command Menu', '╗')];
  const item = (L, col, key, label, href) => L.to(col).add(key, null, true).to(col + 6).add(label, href);
  const cols = MENU_COLS;
  const head = (text, w) => headingParts(text, w).join(' ');
  out.push(new Line().add('║ ').add(head('Before', MENU_W)).add('  ').add(head('During', MENU_W)).add('  ').add(head('After', MENU_W)).end());
  for (const row of MENU_ITEMS) { const L = new Line().add('║'); row.forEach(([k, t, h], i) => item(L, cols[i], k, t, h)); out.push(L.end()); }
  out.push(new Line().add('║').end());
  out.push(new Line().add('║ ').add(head('Setup', MENU_W)).add('  ').add(head('Toggles', MENU_W * 2 + 2)).end());
  const toggle = (L, col, i) => {
    if (i >= MENU_TOGGLES.length) return;
    const [name, state] = MENU_TOGGLES[i];
    L.to(col).add(String(i + 1), null, true).add(' ').add(name).add(' ').add(toggleDots(MENU_TOGGLES[i])).add(' ').add(state);
  };
  MENU_SETUP.forEach(([k, label, value], i) => {
    const L = new Line().add('║');
    item(L, cols[0], k, label).to(cols[0] + MENU_W - len(value)).add(value);
    toggle(L, cols[1], i); toggle(L, cols[2], i + 5);
    out.push(L.end());
  });
  out.push(titled('╚', '', '╝'));
  return out;
}

const capRule = (title) => `-- ${title} `.padEnd(76, '-');
const CAPTURE = [
  capRule('SESSION.CAP: capture opened'),
  `ATDT ${LIVE},,1`,
  `CONNECT ${BPS}/STLITE/WASM`,
  '',
  'OBJECTIVES: 5 Space Elevator phases on file. Which one? ALL OF THEM',
  '',
  ' 1 Automation basics     Smart Plating x50, Versatile Framework x100,',
  '                         Automated Wiring x500',
  ' 2 Logistics & steel     Automated Wiring x500, Modular Frame x500,',
  '                         Smart Plating x100, Versatile Framework x500',
  ' 3 Oil & computers       Versatile Framework x2500, Modular Engine x500,',
  '                         Adaptive Control Unit x100',
  ' 4 Nuclear & endgame     Assembly Director System x1000,',
  '                         Magnetic Field Generator x500, Nuclear Pasta x100,',
  '                         Thermal Propulsion Rocket x25',
  ' 5 Alien tech & quantum  Biochemical Sculptor x500, AI Expansion Server x100,',
  '                         Neural-Quantum Processor x100,',
  '                         Ballistic Warp Drive x100',
  '',
  'Click a part for its recipe. Part? NUCLEAR PASTA',
  ' Particle Accelerator, 120 s a cycle, 0.5 a minute.',
  ' Phase 4 wants 100. That is 200 minutes of one machine. Pack a lunch.',
  '',
  'BUILDINGS: 477 on file. 9 of them do the actual work:',
  ' Assembler, Blender, Constructor, Foundry, Manufacturer, Packager,',
  ' Particle Accelerator, Refinery, Smelter.',
  ' The other 468: 333 structure pieces, 59 logistics, 26 decor, 15 power,',
  ' 14 transit, 7 special, 7 storage, 7 extraction.',
  '',
  capRule('what is real in the picture'),
  ` ${FILE.name} is ${commas(FILE.bytes)} bytes: ${commas(FILE.blocks)} blocks of ${commas(FILE.block)}, the last one short.`,
  ` At ${BPS} N81 the line carries ${commas(CPS_MAX)} characters a second at best. At the`,
  ` ${commas(Math.round(FILE.bytes / XFER_SECONDS))} in the box, the file takes ${Math.floor(XFER_SECONDS / 60)} min ${XFER_SECONDS % 60} s. The picture does it in ${STEPS * STEP} s:`,
  ' the only thing overclocked here is the clock.',
  ' The status line names the file\'s real top-level sections as the byte',
  ' counter passes them:',
  `   ${SECTIONS.map(([k]) => k).join(', ')}.`,
  ` Three of those are ${commas(SECTIONS[6][1] - SECTIONS[3][1])} bytes between them, under two seconds of line`,
  ' time, so they go by between two updates of the box.',
  ' The Rotor really is 5 Iron Rod + 25 Screw, Assembler, 15 s, 15 MW.',
  ' The belt did not really reverse. That one is on the modem.',
  '',
  capRule('credits'),
  ' Game data ........ greeny/SatisfactoryTools',
  ' Images ........... the Satisfactory Wiki, CC BY-NC-SA 4.0',
  ' Code ............. Apache 2.0. Registration: not required. Nag screen: none.',
  ' The game ......... Satisfactory, by Coffee Stain Studios. Not on this line.',
  ' Modem ............ Widdershins Datacom Mk.1. Invented. So is its warranty.',
  '',
  'Callers today: 1. It was you. It is always you.',
  '+++ATH0',
  'NO CARRIER',
  capRule('capture closed'),
];
for (const l of CAPTURE) if (len(l) > WIDE) throw new Error(`capture line is ${len(l)} columns: ${l}`);

const ALT = 'ULTRA-SATISFACTORY, a companion app for the game Satisfactory, shown as a dial-up terminal session on an 80 by 25 DOS text screen. '
  + 'Under the name in cyan and white block capitals, a blue dialing directory lists the three tabs of the app, OBJECTIVES, ITEMS and BUILDINGS. '
  + `The redialer gets BUSY, then CONNECT ${BPS}. The far end looks up the Rotor recipe and prints the two commands that run the app at home. `
  + `A Zmodem box downloads ${FILE.name}, all ${commas(FILE.bytes)} bytes, then NO CARRIER and the Alt-Z command menu. `
  + `The red status bar reads ${BPS} N81 FDX, v0.0.1, Apache 2.0. An external modem blinks underneath.`;
if (/"/.test(ALT)) throw new Error('alt text must not contain a double quote');

const F = '```';
const md = `<!-- Header ${SLUG} for ULTRA-SATISFACTORY. Generated by src/${SLUG}.mjs: edit that, not this. -->

<p align="center">
  <a href="${LIVE_URL}"><img src="assets/${SLUG}.svg" width="100%" alt="${ALT}"></a>
</p>

<p align="center">
  ⚡ <i>You have reached the factory floor. All of our Assemblers are currently starved of one input. Your call is important to the Space Elevator.</i>
</p>

⚡ **ULTRA-SATISFACTORY** is a companion app for the factory-building game *Satisfactory*: every recipe, building and Space Elevator objective, one click apart. Leave it on a second monitor, a phone, or the far side of an alt-tab, and look the thing up before the Assembler finishes starving.

⚡ Three tabs, one number. **Objectives**: pick a Space Elevator phase, see the parts it wants and how many. **Items**: search as you type; recipe cards give per-minute rates, the machine, its cycle time and its power draw. **Buildings**: every building and what it makes, by tier, with Mk-by-Mk upgrade paths. Everything links to everything else, which is more than can be said for your pipes.

<pre>
${directoryText().join('\n')}
</pre>

⚡ No modem required. It is [live in your browser](${LIVE_URL}) with nothing to install, or it is two commands at home (Python 3.10+, from the repo root, answers on \`http://localhost:8501\`; more under [Run it locally](#run-it-locally)):

${F}
python -m pip install -r requirements.txt
python -m streamlit run app/app.py
${F}

<p><sub>⚡ An unofficial fan project, not affiliated with Coffee Stain Studios. The only thing coming down the line is this app's own open data. The game is not in the download: bring your own copy, and your own spaghetti.</sub></p>

<details>
<summary>⚡ <b>Alt-Z</b>: the command menu again, with links that work and nine toggles nobody has ever switched the right way</summary>

<pre>
${menuText().join('\n')}
</pre>

</details>

<details>
<summary>⚡ <b>SESSION.CAP</b>: the capture log. All five Space Elevator phases, what is real in the picture, credits</summary>

${F}text
${CAPTURE.join('\n')}
${F}

</details>
`;
const MD = path.join(HERE, '..', `${SLUG}.md`);
for (const l of md.split('\n')) if (/[ \t]+$/.test(l)) throw new Error(`trailing whitespace: ${JSON.stringify(l)}`);
if (md.includes(String.fromCharCode(0x2014))) throw new Error('em dash in the markdown');
fs.writeFileSync(MD, md);

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, svg);
console.log(`wrote ${path.relative(process.cwd(), MD)} and ${path.relative(process.cwd(), OUT)} (${(svg.length / 1024).toFixed(1)} KB, ${B.stats}, loop ${T}s, hold ${HOLD.toFixed(2)}s)`);
