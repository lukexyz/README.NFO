#!/usr/bin/env node
// 52-teletext-page_opus_5.5: the "Teletext page" README header for Castaway.
//
// A broadcast teletext page (the Ceefax-era look) for an invented service,
// RAFTEXT, built the way a teletext decoder builds it, not imitated:
//
//   * Page memory is 25 rows of 40 bytes. Bytes 0x00-0x1F are Level 1
//     control codes (alpha colour, graphics colour, new background, double
//     height, flash, conceal...). Each one occupies a character cell and
//     shows as a blank, so every colour change costs a visible space and
//     mosaic pictures get notches where colours switch.
//   * A decoder walks each row left to right with the real set-at and
//     set-after rules and turns it into cells: a background colour plus one
//     foreground glyph (a character from a self-drawn 5x9 dot-matrix font,
//     smoothed on the diagonals to 10x18, or a 2x3 mosaic).
//   * The island picture is drawn as 80x39 chunky pixels and converted to
//     page bytes by a dynamic-programming encoder that chooses where the
//     colour codes go (one foreground and one background per cell, a code
//     cell for every change), picking the cheapest damage.
//   * Eight colours only: black, red, green, yellow, blue, magenta, cyan,
//     white, at full saturation.
//
// Motion, on the music's grid (80 BPM: a beat is 0.75 s, a bar 3 s, and the
// loop is 20 bars = 60 s, the length of the project's theme):
//   * the page cycles 100 -> 200 -> 300 -> 400 -> 500 like someone pressing
//     the four coloured Fastext keys; before each page arrives the header's
//     page counter rolls while the old page stays up;
//   * she nods on every beat, the waves change every bar, the surf every
//     half bar, and a coconut falls on a hermit crab, which walks off
//     wearing it, right past her feet;
//   * one word flashes (about once a second, a few cells only): NOW on page
//     100, and on page 200 while the crab gag is actually playing above it;
//   * page 500 has concealed text that is revealed after a few seconds;
//   * the header clock ticks with CSS steps(), one strip per digit, as a
//     10-hour loop from 08:00:00 to 17:59:59 (always daytime), starting at
//     11:59:45 when the page loads.
//
// Every frame is a page in memory, decoded and diffed: cells that change
// get one group per state with a step-end opacity track. Reduced motion
// shows the first frame with the clock stopped.
//
//   node 52-teletext-page_opus_5.5.mjs        regenerate the SVG
// Diagnostics, printed as well:
//   --text            every page as text (control codes shown as a dot)
//   --pic STEP        the scene's pixels at a step, and what each row lost
//   --costs           every step where the encoder had to give up pixels
//   --dbg STEP R      wanted vs shown sextants for picture row R (0 = page row 1)
//   --codes ROW       the control codes in one page row of the first frame
//
// Plain Node, no dependencies, no randomness beyond a seeded PRNG.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, '..', 'assets', '52-teletext-page_opus_5.5.svg');
const SHOW_TEXT = process.argv.includes('--text');

// ---------------------------------------------------------------- palette
// The eight teletext colours, by their Level 1 colour number.
const PAL = ['#000000', '#ff0000', '#00ff00', '#ffff00', '#0000ff', '#ff00ff', '#00ffff', '#ffffff'];
const K = 0, R = 1, G = 2, Y = 3, B = 4, M = 5, C = 6, W = 7;

// ---------------------------------------------------------------- geometry
// A cell is 12x20 units (the SAA5050 character cell); the page is 480x500,
// then stretched 4:3 the way a television shows it.
const COLS = 40, ROWS = 25, CW = 12, CH = 20;
const SX = 4 / 3;
const MX = 26, MY = 24;                         // black margin inside the panel
const PW = COLS * CW * SX, PH = ROWS * CH;      // 640 x 500
const W_ = Math.round(PW + MX * 2), H_ = PH + MY * 2;

// ---------------------------------------------------------------- timeline
const BEAT = 0.75, BAR = 3, LOOP = 60;
const STEP = BEAT / 2;                          // half a beat
const N = Math.round(LOOP / STEP);              // 160 frames a loop
const PAGE_STEPS = N / 5;                       // 32 steps (12 s) per page
const ROLL = 4;                                 // header rolls for 4 steps (1.5 s)
const STILL = 0;                                // reduced motion: the first frame

// ---------------------------------------------------------------- seeded PRNG
function mulberry32(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------- the font
// A 5x9 dot matrix, drawn for this header: capitals 7 dots tall, two rows of
// descenders. Teletext decoders smooth it to 10x18 by filling the corners of
// every diagonal step; the same rule is applied below.
const FONT = {
  ' ': [],
  '!': ['..#..', '..#..', '..#..', '..#..', '..#..', '.....', '..#..'],
  '"': ['.#.#.', '.#.#.', '.#.#.'],
  '#': ['.#.#.', '.#.#.', '#####', '.#.#.', '#####', '.#.#.', '.#.#.'],
  '$': ['.###.', '#.#.#', '#.#..', '.###.', '..#.#', '#.#.#', '.###.'],
  '%': ['##...', '##..#', '...#.', '..#..', '.#...', '#..##', '...##'],
  '&': ['.#...', '#.#..', '#.#..', '.#...', '#.#.#', '#..#.', '.##.#'],
  "'": ['..#..', '..#..', '.#...'],
  '(': ['...#.', '..#..', '.#...', '.#...', '.#...', '..#..', '...#.'],
  ')': ['.#...', '..#..', '...#.', '...#.', '...#.', '..#..', '.#...'],
  '*': ['..#..', '#.#.#', '.###.', '..#..', '.###.', '#.#.#', '..#..'],
  '+': ['.....', '..#..', '..#..', '#####', '..#..', '..#..', '.....'],
  ',': ['.....', '.....', '.....', '.....', '.....', '..#..', '..#..', '.#...'],
  '-': ['.....', '.....', '.....', '.###.', '.....', '.....', '.....'],
  '.': ['.....', '.....', '.....', '.....', '.....', '.....', '..#..'],
  '/': ['.....', '....#', '...#.', '..#..', '.#...', '#....', '.....'],
  '0': ['..#..', '.#.#.', '#...#', '#...#', '#...#', '.#.#.', '..#..'],
  '1': ['..#..', '.##..', '..#..', '..#..', '..#..', '..#..', '.###.'],
  '2': ['.###.', '#...#', '....#', '..##.', '.#...', '#....', '#####'],
  '3': ['#####', '....#', '...#.', '..##.', '....#', '#...#', '.###.'],
  '4': ['...#.', '..##.', '.#.#.', '#..#.', '#####', '...#.', '...#.'],
  '5': ['#####', '#....', '####.', '....#', '....#', '#...#', '.###.'],
  '6': ['..##.', '.#...', '#....', '####.', '#...#', '#...#', '.###.'],
  '7': ['#####', '....#', '...#.', '..#..', '.#...', '.#...', '.#...'],
  '8': ['.###.', '#...#', '#...#', '.###.', '#...#', '#...#', '.###.'],
  '9': ['.###.', '#...#', '#...#', '.####', '....#', '...#.', '.##..'],
  ':': ['.....', '.....', '..#..', '.....', '.....', '..#..', '.....'],
  ';': ['.....', '.....', '..#..', '.....', '.....', '..#..', '..#..', '.#...'],
  '<': ['...#.', '..#..', '.#...', '#....', '.#...', '..#..', '...#.'],
  '=': ['.....', '.....', '#####', '.....', '#####', '.....', '.....'],
  '>': ['.#...', '..#..', '...#.', '....#', '...#.', '..#..', '.#...'],
  '?': ['.###.', '#...#', '...#.', '..#..', '..#..', '.....', '..#..'],
  '@': ['.###.', '#...#', '#.###', '#.#.#', '#.###', '#....', '.###.'],
  'A': ['..#..', '.#.#.', '#...#', '#...#', '#####', '#...#', '#...#'],
  'B': ['####.', '#...#', '#...#', '####.', '#...#', '#...#', '####.'],
  'C': ['.###.', '#...#', '#....', '#....', '#....', '#...#', '.###.'],
  'D': ['####.', '#...#', '#...#', '#...#', '#...#', '#...#', '####.'],
  'E': ['#####', '#....', '#....', '####.', '#....', '#....', '#####'],
  'F': ['#####', '#....', '#....', '####.', '#....', '#....', '#....'],
  'G': ['.###.', '#...#', '#....', '#....', '#..##', '#...#', '.####'],
  'H': ['#...#', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  'I': ['.###.', '..#..', '..#..', '..#..', '..#..', '..#..', '.###.'],
  'J': ['....#', '....#', '....#', '....#', '....#', '#...#', '.###.'],
  'K': ['#...#', '#..#.', '#.#..', '##...', '#.#..', '#..#.', '#...#'],
  'L': ['#....', '#....', '#....', '#....', '#....', '#....', '#####'],
  'M': ['#...#', '##.##', '#.#.#', '#.#.#', '#...#', '#...#', '#...#'],
  'N': ['#...#', '#...#', '##..#', '#.#.#', '#..##', '#...#', '#...#'],
  'O': ['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  'P': ['####.', '#...#', '#...#', '####.', '#....', '#....', '#....'],
  'Q': ['.###.', '#...#', '#...#', '#...#', '#.#.#', '#..#.', '.##.#'],
  'R': ['####.', '#...#', '#...#', '####.', '#.#..', '#..#.', '#...#'],
  'S': ['.###.', '#...#', '#....', '.###.', '....#', '#...#', '.###.'],
  'T': ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..'],
  'U': ['#...#', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  'V': ['#...#', '#...#', '#...#', '.#.#.', '.#.#.', '..#..', '..#..'],
  'W': ['#...#', '#...#', '#...#', '#.#.#', '#.#.#', '#.#.#', '.#.#.'],
  'X': ['#...#', '#...#', '.#.#.', '..#..', '.#.#.', '#...#', '#...#'],
  'Y': ['#...#', '#...#', '.#.#.', '..#..', '..#..', '..#..', '..#..'],
  'Z': ['#####', '....#', '...#.', '..#..', '.#...', '#....', '#####'],
  '[': ['.###.', '.#...', '.#...', '.#...', '.#...', '.#...', '.###.'],
  ']': ['.###.', '...#.', '...#.', '...#.', '...#.', '...#.', '.###.'],
  '_': ['.....', '.....', '.....', '.....', '.....', '.....', '.....', '.....', '#####'],
  'a': ['.....', '.....', '.###.', '....#', '.####', '#...#', '.####'],
  'b': ['#....', '#....', '####.', '#...#', '#...#', '#...#', '####.'],
  'c': ['.....', '.....', '.####', '#....', '#....', '#....', '.####'],
  'd': ['....#', '....#', '.####', '#...#', '#...#', '#...#', '.####'],
  'e': ['.....', '.....', '.###.', '#...#', '#####', '#....', '.###.'],
  'f': ['..##.', '.#...', '.#...', '###..', '.#...', '.#...', '.#...'],
  'g': ['.....', '.....', '.####', '#...#', '#...#', '#...#', '.####', '....#', '.###.'],
  'h': ['#....', '#....', '####.', '#...#', '#...#', '#...#', '#...#'],
  'i': ['..#..', '.....', '.##..', '..#..', '..#..', '..#..', '.###.'],
  'j': ['...#.', '.....', '..##.', '...#.', '...#.', '...#.', '...#.', '...#.', '.##..'],
  'k': ['.#...', '.#...', '.#..#', '.#.#.', '.##..', '.#.#.', '.#..#'],
  'l': ['.##..', '..#..', '..#..', '..#..', '..#..', '..#..', '.###.'],
  'm': ['.....', '.....', '##.#.', '#.#.#', '#.#.#', '#.#.#', '#.#.#'],
  'n': ['.....', '.....', '####.', '#...#', '#...#', '#...#', '#...#'],
  'o': ['.....', '.....', '.###.', '#...#', '#...#', '#...#', '.###.'],
  'p': ['.....', '.....', '####.', '#...#', '#...#', '#...#', '####.', '#....', '#....'],
  'q': ['.....', '.....', '.####', '#...#', '#...#', '#...#', '.####', '....#', '....#'],
  'r': ['.....', '.....', '#.##.', '##..#', '#....', '#....', '#....'],
  's': ['.....', '.....', '.####', '#....', '.###.', '....#', '####.'],
  't': ['.#...', '.#...', '###..', '.#...', '.#...', '.#..#', '..##.'],
  'u': ['.....', '.....', '#...#', '#...#', '#...#', '#..##', '.##.#'],
  'v': ['.....', '.....', '#...#', '#...#', '.#.#.', '.#.#.', '..#..'],
  'w': ['.....', '.....', '#...#', '#...#', '#.#.#', '#.#.#', '.#.#.'],
  'x': ['.....', '.....', '#...#', '.#.#.', '..#..', '.#.#.', '#...#'],
  'y': ['.....', '.....', '#...#', '#...#', '#...#', '#...#', '.####', '....#', '.###.'],
  'z': ['.....', '.....', '#####', '...#.', '..#..', '.#...', '#####'],
  '|': ['..#..', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..'],
  '~': ['.....', '.....', '.#...', '#.#.#', '...#.', '.....', '.....'],
};

// 5x9 -> 10x18 with diagonal smoothing.
function smooth(rows) {
  const d = (x, y) => (y >= 0 && y < 9 && x >= 0 && x < 5 && rows[y] && rows[y][x] === '#') ? 1 : 0;
  const hi = new Uint8Array(10 * 18);
  const set = (x, y) => { if (x >= 0 && x < 10 && y >= 0 && y < 18) hi[y * 10 + x] = 1; };
  for (let y = 0; y < 9; y++) for (let x = 0; x < 5; x++) if (d(x, y)) { set(2 * x, 2 * y); set(2 * x + 1, 2 * y); set(2 * x, 2 * y + 1); set(2 * x + 1, 2 * y + 1); }
  for (let y = 0; y < 8; y++) for (let x = 0; x < 4; x++) {
    const a = d(x, y), b = d(x + 1, y), c = d(x, y + 1), e = d(x + 1, y + 1);
    if (a && e && !b && !c) { set(2 * x + 2, 2 * y + 1); set(2 * x + 1, 2 * y + 2); }
    if (b && c && !a && !e) { set(2 * x + 1, 2 * y + 1); set(2 * x + 2, 2 * y + 2); }
  }
  return hi;
}
const HIRES = new Map();
for (const [ch, rows] of Object.entries(FONT)) HIRES.set(ch.charCodeAt(0), smooth(rows));

// ---------------------------------------------------------------- rectangles
function gridRects(get, w, h) {
  const open = new Map();
  const rects = [];
  for (let y = 0; y <= h; y++) {
    const runs = new Set();
    if (y < h) {
      for (let x = 0; x < w;) {
        if (!get(x, y)) { x++; continue; }
        const s = x;
        while (x < w && get(x, y)) x++;
        runs.add(`${s},${x - s}`);
      }
    }
    for (const [k, r] of open) {
      if (runs.has(k)) { r[3]++; runs.delete(k); } else { rects.push(r); open.delete(k); }
    }
    for (const k of runs) { const [s, len] = k.split(',').map(Number); open.set(k, [s, y, len, 1]); }
  }
  return rects;
}
const num = (v) => +v.toFixed(3);
const rectsD = (rects) => rects.map(([x, y, w, h]) => `M${num(x)} ${num(y)}h${num(w)}v${num(h)}h${num(-w)}z`).join('');

// ---------------------------------------------------------------- glyph shapes (in cell units)
// Character: 10x18 dots at (1,1) inside the 12x20 cell. Double height: the
// smoothed 10x18 is doubled vertically to 10x36 over two cells; each half is
// its own shape.
const glyphDefs = new Map();     // id -> path d
function charGlyph(code, part) {  // part: 'n' normal, 't' top half, 'b' bottom half
  const id = `${part}${code.toString(16)}`;
  if (glyphDefs.has(id)) return id;
  const hi = HIRES.get(code);
  if (!hi) throw new Error(`no glyph for ${String.fromCharCode(code)} (${code})`);
  let rects;
  if (part === 'n') {
    rects = gridRects((x, y) => hi[y * 10 + x], 10, 18).map(([x, y, w, h]) => [x + 1, y + 1, w, h]);
  } else {
    const tall = (x, y) => hi[(y >> 1) * 10 + x];
    const all = gridRects(tall, 10, 36).map(([x, y, w, h]) => [x + 1, y + 2, w, h]);
    rects = [];
    const lo = part === 't' ? 0 : 20;
    for (const [x, y, w, h] of all) {
      const y0 = Math.max(y, lo), y1 = Math.min(y + h, lo + 20);
      if (y1 > y0) rects.push([x, y0 - lo, w, y1 - y0]);
    }
  }
  glyphDefs.set(id, rectsD(rects));
  return id;
}
// Mosaic: bits b0 top-left, b1 top-right, b2 mid-left, b3 mid-right, b4
// bottom-left, b5 bottom-right. Rows are 6, 8 and 6 units tall.
const SEXT_Y = [[0, 6], [6, 14], [14, 20]];
function mosaicGlyph(bits, sep) {
  const id = `m${bits.toString(16)}${sep ? 's' : ''}`;
  if (glyphDefs.has(id)) return id;
  const rects = [];
  for (let i = 0; i < 6; i++) {
    if (!(bits & (1 << i))) continue;
    const cx = i & 1, ry = i >> 1;
    let x0 = cx * 6, x1 = x0 + 6, [y0, y1] = SEXT_Y[ry];
    if (sep) { x0 += 1; x1 -= 1; y0 += 1; y1 -= 1; }
    rects.push([x0, y0, x1 - x0, y1 - y0]);
  }
  // merge vertical neighbours (contiguous only)
  const merged = sep ? rects : gridRects((x, y) => {
    const cx = x < 6 ? 0 : 1; const ry = y < 6 ? 0 : y < 14 ? 1 : 2;
    return bits & (1 << (ry * 2 + cx));
  }, 12, 20);
  glyphDefs.set(id, rectsD(merged));
  return id;
}
const mosaicChar = (bits) => 0x20 | (bits & 0x1f) | ((bits & 0x20) << 1);
const charBits = (code) => (code & 0x1f) | ((code & 0x40) >> 1);

// ---------------------------------------------------------------- page markup
// {r}{g}{y}{b}{m}{c}{w}: alpha colours. {R}{G}{Y}{B}{M}{C}{W}: graphics
// colours. {fl} flash, {st} steady, {nh} normal height, {dh} double height,
// {cn} conceal, {con}/{sep} contiguous/separated, {bk} black background,
// {nb} new background, {hold}/{rel} hold/release graphics.
const TOK = {
  r: 0x01, g: 0x02, y: 0x03, b: 0x04, m: 0x05, c: 0x06, w: 0x07,
  R: 0x11, G: 0x12, Y: 0x13, B: 0x14, M: 0x15, C: 0x16, W: 0x17,
  fl: 0x08, st: 0x09, nh: 0x0c, dh: 0x0d, cn: 0x18, con: 0x19, sep: 0x1a, bk: 0x1c, nb: 0x1d, hold: 0x1e, rel: 0x1f,
};
function parse(markup) {
  const out = [];
  for (let i = 0; i < markup.length;) {
    if (markup[i] === '{') {
      const j = markup.indexOf('}', i);
      const t = markup.slice(i + 1, j);
      if (t.startsWith('x')) out.push(parseInt(t.slice(1), 16));
      else if (t in TOK) out.push(TOK[t]);
      else throw new Error(`bad token {${t}}`);
      i = j + 1;
    } else { out.push(markup.charCodeAt(i)); i++; }
  }
  return out;
}
const blankPage = () => Array.from({ length: ROWS }, () => new Uint8Array(COLS).fill(0x20));
function put(page, row, col, markup) {
  const bytes = parse(markup);
  if (col + bytes.length > COLS) throw new Error(`row ${row} overflows (${col + bytes.length} cells): ${markup}`);
  for (let i = 0; i < bytes.length; i++) page[row][col + i] = bytes[i];
}
// An index line: label, a dot leader or padding, and a right-aligned number.
function indexLine(label, n, { lc = 'w', nc = 'y', lead = ' ', from = 0, to = COLS } = {}) {
  const ns = String(n);
  const space = to - from - 1 - 1 - ns.length;    // label code, number code
  if (label.length > space) throw new Error(`index label too long: ${label}`);
  const pad = label.length === space ? '' : ' ' + lead.repeat(Math.max(0, space - label.length - 1));
  return `{${lc}}${label}${pad}{${nc}}${ns}`;
}

// ---------------------------------------------------------------- decoder
// Level 1 attribute rules. Returns, per cell: bg, fg, glyph kind and flags.
function decodeRow(bytes) {
  let fg = W, gfx = false, bg = K, flash = false, conceal = false, dh = false, sep = false, hold = false;
  let held = 0x20, heldSep = false;
  const cells = [];
  for (let col = 0; col < COLS; col++) {
    const c = bytes[col];
    // set-at
    if (c === 0x09) flash = false;
    if (c === 0x0c) { dh = false; held = 0x20; }
    if (c === 0x18) conceal = true;
    if (c === 0x19) sep = false;
    if (c === 0x1a) sep = true;
    if (c === 0x1c) bg = K;
    if (c === 0x1d) bg = fg;
    if (c === 0x1e) hold = true;
    let cell;
    if (c < 0x20) {
      if (hold && gfx && held !== 0x20) cell = { bg, fg, kind: 'mos', bits: charBits(held), sep: heldSep, flash, conceal, dh };
      else cell = { bg, fg, kind: 'space', dh };
    } else if (gfx && (c & 0x20)) {
      cell = { bg, fg, kind: 'mos', bits: charBits(c), sep, flash, conceal, dh };
      held = c; heldSep = sep;
    } else {
      cell = { bg, fg, kind: c === 0x20 ? 'space' : 'chr', code: c, flash, conceal, dh };
    }
    cells.push(cell);
    // set-after
    if (c >= 0x01 && c <= 0x07) { fg = c; gfx = false; conceal = false; held = 0x20; }
    if (c >= 0x11 && c <= 0x17) { fg = c - 0x10; gfx = true; conceal = false; }
    if (c === 0x08) flash = true;
    if (c === 0x0d) { dh = true; held = 0x20; }
    if (c === 0x1f) hold = false;
  }
  return cells;
}
// The visible look of each cell: an underlay of six sextant colours (the
// background, with contiguous mosaics merged in) and an optional overlay
// glyph (a character, or a separated or flashing mosaic) as "id:colour:flash".
function decodePage(page, { reveal = false } = {}) {
  const look = [];
  let lowerOf = null;
  for (let r = 0; r < ROWS; r++) {
    let cells = decodeRow(page[r]);
    let part = 'n';
    if (lowerOf) { cells = lowerOf; part = 'b'; lowerOf = null; } else if (cells.some((c) => c.dh && c.kind !== 'space')) { lowerOf = cells; part = 't'; }
    for (let col = 0; col < COLS; col++) {
      const c = cells[col];
      const u = new Array(6).fill(c.bg);
      let o = null;
      const visible = !(c.conceal && !reveal);
      if (visible && c.kind === 'chr') {
        if (part === 'n' || c.dh) o = { g: charGlyph(c.code, c.dh ? part : 'n'), c: c.fg, f: c.flash };
      } else if (visible && c.kind === 'mos' && c.fg !== c.bg && c.bits && part === 'n') {
        if (!c.sep && !c.flash) { for (let i = 0; i < 6; i++) if (c.bits & (1 << i)) u[i] = c.fg; }
        else o = { g: mosaicGlyph(c.bits, c.sep), c: c.fg, f: c.flash };
      }
      look.push({ u: u.join(''), o: o ? `${o.g}:${o.c}:${o.f ? 1 : 0}` : null });
    }
  }
  return look;
}

// ---------------------------------------------------------------- picture -> page bytes
// One row of cells, six pixels each, with a weight per pixel. States are
// (background, foreground) with foreground 8 meaning "still in alpha mode".
const EPS = 0.01;
const dpCache = new Map();
function encodeRow(px, wt) {           // px, wt: arrays of 40 cells x 6
  const key = px.join('') + '|' + wt.join(',');
  if (dpCache.has(key)) return dpCache.get(key);
  const S = 8 * 9, INF = 1e9;
  let cost = new Float64Array(S).fill(INF);
  cost[K * 9 + 8] = 0;
  const back = [];
  const spaceCost = (col, bgc) => { let s = 0; for (let i = 0; i < 6; i++) if (px[col * 6 + i] !== bgc) s += wt[col * 6 + i]; return s; };
  for (let col = 0; col < COLS; col++) {
    const next = new Float64Array(S).fill(INF);
    const from = new Array(S);
    const relax = (s, v, f, byte) => { if (v < next[s]) { next[s] = v; from[s] = [f, byte]; } };
    for (let s = 0; s < S; s++) {
      const base = cost[s];
      if (base >= INF) continue;
      const bg = Math.floor(s / 9), fg = s % 9;
      // draw a mosaic (or a blank)
      if (fg < 8) {
        let c = 0, bits = 0;
        for (let i = 0; i < 6; i++) {
          const p = px[col * 6 + i];
          if (p === fg && fg !== bg) bits |= 1 << i;
          else if (p !== bg) c += wt[col * 6 + i];
        }
        relax(s, base + c, s, mosaicChar(bits));
      } else {
        relax(s, base + spaceCost(col, bg), s, 0x20);
      }
      const sp = spaceCost(col, bg);
      // graphics colour (set-after: this cell shows the old background)
      for (let g = 0; g < 8; g++) if (g !== fg && g !== K) relax(bg * 9 + g, base + sp + EPS, s, 0x10 + g);
      // new background (set-at)
      const nb = fg < 8 ? fg : W;
      relax(nb * 9 + fg, base + spaceCost(col, nb) + EPS, s, 0x1d);
      // black background (set-at)
      if (bg !== K) relax(K * 9 + fg, base + spaceCost(col, K) + EPS, s, 0x1c);
    }
    back.push(from);
    cost = next;
  }
  let best = 0;
  for (let s = 1; s < S; s++) if (cost[s] < cost[best]) best = s;
  const bytes = new Uint8Array(COLS);
  let s = best;
  for (let col = COLS - 1; col >= 0; col--) { const [f, byte] = back[col][s]; bytes[col] = byte; s = f; }
  const res = { bytes, cost: cost[best] };
  dpCache.set(key, res);
  return res;
}

// ---------------------------------------------------------------- the island picture
// 80 x 39 chunky pixels = page rows 1-13. Pixel (x, y) sits in cell
// (x >> 1, 1 + floor(y / 3)). Sky above y 27 (blue), sea below (cyan).
const PXW = 80, PXH = 39, PIC_ROW0 = 1;
const HORIZON = 27;

const LETTERS = {
  C: ['..######', '.#######', '###.....', '##......', '##......', '##......', '##......', '##......', '##......', '###.....', '.#######', '..######'],
  A: ['..####..', '.######.', '###..###', '##....##', '##....##', '##....##', '########', '########', '##....##', '##....##', '##....##', '##....##'],
  S: ['..######', '.#######', '###.....', '##......', '###.....', '.######.', '..######', '.....###', '......##', '.....###', '#######.', '######..'],
  T: ['########', '########', '...##...', '...##...', '...##...', '...##...', '...##...', '...##...', '...##...', '...##...', '...##...', '...##...'],
  W: ['##....##', '##....##', '##....##', '##....##', '##....##', '##.##.##', '##.##.##', '##.##.##', '##.##.##', '########', '########', '.##..##.'],
  Y: ['##....##', '##....##', '##....##', '###..###', '.######.', '..####..', '...##...', '...##...', '...##...', '...##...', '...##...', '...##...'],
};
const TITLE = 'CASTAWAY', TITLE_X = 6, TITLE_Y = 3, TITLE_PITCH = 9;
// Colour of the letters by cell row (rows 2-5): sun-bleached top, sand below.
const TITLE_ROW_COL = [W, Y, Y, Y];

// The still parts of the scene, one character per pixel: '.' is sky or sea.
const SCENE = {
  // sun, x 8-15, y 15-21
  sun: { x: 7, y: 17, c: Y, w: 2, art: ['..####..', '.######.', '########', '########', '########', '.######.', '..####..'] },
  // clouds
  cloud1: { x: 17, y: 16, c: W, w: 2, art: ['.....####...', '..#########.', '############'] },
  cloud2: { x: 71, y: 21, c: W, w: 2, art: ['...####..', '.########', '#########'] },
  cloud3: { x: 66, y: 24, c: W, w: 1, art: ['..###...', '########'] },
  // bushes on the island
  bush1: { x: 36, y: 30, c: G, w: 2, art: ['.##..##.', '########', '##.##.##'] },
  // raft, off the right of the island
  raft: { x: 70, y: 33, c: R, w: 3, art: ['.########', '#########', '########.'] },
};
// Island outline: [y, x0, x1] (inclusive)
const ISLAND = [
  [27, 27, 34], [28, 26, 36], [29, 25, 38], [30, 24, 63], [31, 23, 63], [32, 22, 64], [33, 22, 65],
  [34, 23, 64], [35, 26, 61],
];
// The trunk leans: one pixel wide, with an overlap at every step so it stays joined.
const TRUNK = [[52, 21], [52, 22], [52, 23], [53, 23], [53, 24], [53, 25], [53, 26], [54, 26], [54, 27], [54, 28], [54, 29], [55, 29], [55, 30], [55, 31], [55, 32], [56, 32], [55, 33], [56, 33]];
const FALLER = [48, 21];          // the coconut that falls: 2x2, hanging under the crown

function makeCanvas() {
  const px = new Uint8Array(PXW * PXH);
  const wt = new Float32Array(PXW * PXH).fill(1);
  for (let y = 0; y < PXH; y++) for (let x = 0; x < PXW; x++) px[y * PXW + x] = y < HORIZON ? B : C;
  const set = (x, y, c, w = 1) => {
    if (x < 0 || x >= PXW || y < 0 || y >= PXH) return;
    px[y * PXW + x] = c; wt[y * PXW + x] = Math.max(wt[y * PXW + x], w);
  };
  const art = ({ x, y, c, w, art: rows }) => {
    rows.forEach((row, dy) => [...row].forEach((ch, dx) => { if (ch === '#') set(x + dx, y + dy, c, w); }));
  };
  return { px, wt, set, art };
}

// Palm crown: six fronds, each a quadratic curve from the heart, thick at the
// base and thin at the tip, rasterised onto the pixel grid.
const HEART = [52.5, 19.6];
const FRONDS = [
  // [ctrlX, ctrlY, tipX, tipY, base radius]
  [44, 14.2, 36.5, 21.8, 1.35],
  [61, 14.2, 68.5, 21.8, 1.35],
  [49, 15.5, 44.5, 16.6, 1.2],
  [56, 15.5, 60.5, 16.6, 1.2],
  [47, 19, 42, 23.4, 1.1],
  [58, 19, 63, 23.4, 1.1],
];
function drawCrown(set) {
  const [hx, hy] = HEART;
  for (const [cx, cy, tx, ty, r0] of FRONDS) {
    for (let t = 0; t <= 1.0001; t += 0.01) {
      const x = (1 - t) * (1 - t) * hx + 2 * (1 - t) * t * cx + t * t * tx;
      const y = (1 - t) * (1 - t) * hy + 2 * (1 - t) * t * cy + t * t * ty;
      const r = r0 * (1 - 0.62 * t);
      for (let py = Math.floor(y - 2); py <= y + 2; py++) for (let px = Math.floor(x - 2); px <= x + 2; px++) {
        if ((px + 0.5 - x) ** 2 + (py + 0.5 - y) ** 2 <= r * r) set(px, py, G, 4);
      }
    }
  }
  for (let y = 18; y <= 20; y++) for (let x = 51; x <= 54; x++) set(x, y, G, 4);
}

// The scene at step s (a half beat).
function drawPicture(s) {
  const cv = makeCanvas();
  const { set, art } = cv;
  const barN = Math.floor(s / 8);

  // --- title letters (heavy weight: they must survive)
  for (let i = 0; i < TITLE.length; i++) {
    const L = LETTERS[TITLE[i]];
    for (let y = 0; y < 12; y++) for (let x = 0; x < 8; x++) {
      if (L[y][x] === '#') set(TITLE_X + i * TITLE_PITCH + x, TITLE_Y + y, TITLE_ROW_COL[Math.floor(y / 3)], 6);
    }
  }

  // --- sky
  for (const k of ['sun', 'cloud1', 'cloud2', 'cloud3']) art(SCENE[k]);


  // --- island, with foam that changes every half bar
  for (const [y, x0, x1] of ISLAND) for (let x = x0; x <= x1; x++) set(x, y, Y, 3);
  {
    const ph = Math.floor(s / 4) % 2;
    const [yb, xb0, xb1] = ISLAND[ISLAND.length - 1];
    for (let x = xb0 - 2; x <= xb1 + 2; x++) if ((x + 2 * ph) % 5 !== 0) set(x, yb + 1, W, 0.6);
    for (let x = xb0 + 3; x <= xb1 - 3; x++) if ((x + 2 * ph) % 7 < 3) set(x, yb + 2, W, 0.6);
  }
  art(SCENE.bush1); art(SCENE.raft);

  // --- the palm
  for (const [x, y] of TRUNK) set(x, y, R, 4);
  drawCrown(set);
  // keep the cells either side of the trunk clear below the crown (they hold colour codes)
  for (let y = 21; y <= 23; y++) for (let x = 50; x <= 55; x++) if (cv.px[y * PXW + x] === G) set(x, y, B, 1);

  // --- her: headphone band, face, coral top, cream shorts (legs in the sand).
  // She nods on every beat: her head dips forward for half a beat.
  {
    const nod = s % 2;
    const hx = 30 + nod;
    set(hx, 20, W, 8); set(hx + 1, 20, W, 8);                       // headphones
    set(hx, 21, Y, 8); set(hx + 1, 21, Y, 8); set(hx, 22, Y, 8); set(hx + 1, 22, Y, 8);
    set(31, 23, Y, 8);                                               // neck
    for (let y = 24; y <= 26; y++) { set(30, y, R, 8); set(31, y, R, 8); }   // tank top
    set(29, 24, R, 8); set(32, 24, R, 8);                            // shoulders
    set(30, 27, W, 8); set(31, 27, W, 8); set(30, 28, W, 8); set(31, 28, W, 8); // shorts
  }

  // --- the coconut and the hermit crab
  // The crab walks in from the right (steps 8-40) and stops under the crown.
  // The coconut drops (44-47) and lands on it (48). The crab walks off
  // wearing it (56 on), behind the bush, past her feet and into the sea.
  // She is nodding the whole time. A new coconut has grown by 140.
  {
    const fallY = [21, 24, 27, 29, 31];
    let crabX = null, coco = null, wearing = false, star = false;
    if (s >= 8 && s < 40) crabX = Math.round(60 - (s - 8) * (60 - 48) / 32);
    else if (s >= 40 && s < 56) crabX = 48;
    else if (s >= 56 && s < 134) { crabX = 48 - Math.floor((s - 56) / 3); wearing = true; }
    if (s < 44 || s >= 140) coco = FALLER;
    else if (s < 48) coco = [48, fallY[s - 44 + 1]];
    if (s >= 48 && s < 56) { wearing = true; star = s % 2 === 0; }
    if (coco) for (let dy = 0; dy < 2; dy++) for (let dx = 0; dx < 2; dx++) set(coco[0] + dx, coco[1] + dy, G, 5);
    // It leaves by a hard cut at x 26, just past her: walking it on to the
    // shoreline was tried, but the shore's own colour codes leave no room for
    // it there (the encoder turns it into a solid green block).
    if (crabX !== null && crabX <= 62 && crabX >= 26) {
      const legs = s % 2;
      if (wearing) { for (let dy = 0; dy < 2; dy++) for (let dx = 0; dx < 2; dx++) set(crabX + dx, 31 + dy, G, 5); }
      else { set(crabX, 32, R, 5); set(crabX + 1, 32, R, 5); }
      set(crabX - 1 + legs, 33, R, 5); set(crabX + 2 - legs, 33, R, 5);
    }
    // impact lines either side of the landing, pointing down at it: \ /
    if (star) { set(46, 28, W, 3); set(47, 29, W, 3); set(51, 28, W, 3); set(50, 29, W, 3); }
  }

  // --- sea marks, last, and only in cells that are plain sea: a broken
  // line on the horizon and short blue dashes, two patterns a bar apart
  {
    const cellPlain = (x, y) => {
      const x0 = x & ~1, y0 = Math.floor(y / 3) * 3;
      for (let yy = y0; yy < y0 + 3; yy++) for (let xx = x0; xx < x0 + 2; xx++) if (cv.px[yy * PXW + xx] !== C) return false;
      return true;
    };
    // dashes: [x, y, length, colour]; each goes in only if every cell it
    // touches, and the cells either side, are still plain sea
    const dashes = [];
    for (let x = 6; x < PXW; x += 9) dashes.push([x - 2 * (barN % 2) + 2, HORIZON, 4, W]);
    const rnd = mulberry32(1992 + (barN % 2));
    for (let k = 0; k < 40; k++) {
      const y = HORIZON + 2 + Math.floor(rnd() * (PXH - HORIZON - 2));
      const x = 6 + Math.floor(rnd() * 70);
      dashes.push([x, y, 2 + Math.floor(rnd() * 3), B]);
    }
    for (const [x, y, len, c] of dashes) {
      let ok = true;
      for (let xx = x - 2; xx <= x + len + 1 && ok; xx += 1) if (xx >= 0 && xx < PXW && !cellPlain(xx, y)) ok = false;
      if (ok) for (let i = 0; i < len; i++) if (x + i < PXW) set(x + i, y, c, 0.5);
    }
  }
  return cv;
}

function pictureRows(s) {
  const cv = drawPicture(s);
  const rows = [];
  let total = 0;
  const costs = [];
  for (let r = 0; r < PXH / 3; r++) {
    const px = [], wt = [];
    for (let col = 0; col < COLS; col++) {
      for (let i = 0; i < 6; i++) {
        const x = col * 2 + (i & 1), y = r * 3 + (i >> 1);
        // column 0 always holds the first colour code, so it stays black
        px.push(col === 0 ? K : cv.px[y * PXW + x]);
        wt.push(col === 0 ? 1 : cv.wt[y * PXW + x]);
      }
    }
    const { bytes, cost } = encodeRow(px, wt);
    total += cost;
    costs.push(cost);
    rows.push(bytes);
  }
  return { rows, cost: total, costs };
}

// ---------------------------------------------------------------- the pages (rows 14-23)
const SUN_ICON = [   // 12 x 12 pixels, a weather symbol
  '....#..#....',
  '.#........#.',
  '....####....',
  '...######...',
  '#.########.#',
  '..########..',
  '..########..',
  '#.########.#',
  '...######...',
  '....####....',
  '.#........#.',
  '....#..#....',
];
function iconRows(icon, colour) {     // -> 4 rows of 6 cells of mosaic bytes
  const out = [];
  for (let r = 0; r < icon.length / 3; r++) {
    let s = `{${'xRGYBMCW'[colour]}}`;
    for (let c = 0; c < icon[0].length / 2; c++) {
      let bits = 0;
      for (let i = 0; i < 6; i++) if (icon[r * 3 + (i >> 1)][c * 2 + (i & 1)] === '#') bits |= 1 << i;
      s += `{x${mosaicChar(bits).toString(16)}}`;
    }
    out.push(s);
  }
  return out;
}

const tableLine = (a, b, n) => `{w}${a.padEnd(12)}${b.padEnd(13)}{y}${n.padStart(11)}`;

const PAGES = [
  {
    n: 100,
    rows: {
      14: '{dh}{y}Ten hours. One island. Not much else.',
      16: '{w}She idles, nodding to her headphones.',
      17: '{w}Every so often, something happens.',
      19: indexLine('Gags', 200, { lc: 'c', lead: '.', to: 20 }) + indexLine('Timers', 300, { lc: 'c', lead: '.', from: 20 }),
      20: indexLine('Weather', 400, { lc: 'c', lead: '.', to: 20 }) + indexLine('Sound', 500, { lc: 'c', lead: '.', from: 20 }),
      21: '{c}Run it{w}python tools/serve.py' + ' ' + '.'.repeat(6) + '{y}700',
      23: '{g}{fl}NOW{st}{w}Idling.{g}NEXT{w}Something. Maybe.',
    },
  },
  {
    n: 200,
    rows: {
      14: '{r}{nb}{dh}{w}Island gags, on the beat',
      16: indexLine('Crab moves out, wearing a coconut', 201),
      17: indexLine('Bottle sent; the sea sends it back', 202),
      18: indexLine('Drone delivers: more headphones', 203),
      19: indexLine('Stray cat arrives on a crate, naps', 204),
      20: indexLine('Shark in headphones nods along', 205),
      21: indexLine('Hydrofoil bro: shaka, carves off', 206),
      22: indexLine('Walks out to sea. Back with coffee', 207),
      23: '{c}Every gag starts on the next bar: 3 s',
    },
    // While gag 201 is actually happening in the picture above (the coconut
    // lands at step 48), the page says so. Steps are absolute, within P200.
    swap: { from: 48, to: 60, row: 23, markup: '{g}{fl}NOW{st}{w}201, live, above. She missed it.' },
  },
  {
    n: 300,
    rows: {
      14: '{g}{nb}{dh}{b}90+ things to do, 4 timers',
      16: '{c}TIMER       EVERY          PER 10 HRS',
      17: tableLine('Regular', '2 to 5 min', '155'),
      18: tableLine('Occasional', '12 to 25 min', '30'),
      19: tableLine('Rare', '30 to 60 min', '13'),
      20: tableLine('Super rare', '3 to 6 hours', '2'),
      21: tableLine('Chained', 'follow-ups', '~20'),
      22: '{c}Busy a third of the time; idle the rest',
      23: '{g}Median of 200 simulated 10-hour runs',
    },
  },
  {
    n: 400,
    rows: {
      14: '{y}{nb}{dh}{b}Island weather',
      16: '{y}TODAY   {w}Sunny. Daytime.',
      17: '{y}TONIGHT {w}Not scheduled.',
      18: '{w}         No night scenes, ever.',
      19: '{y}SEA     {w}Calm. Small waves.',
      20: '{y}OUTLOOK {w}A rain shower is planned.',
      21: '{y}LATER   {w}Whales, dolphins, a gecko.',
      23: '{c}Sunny, hand-painted, 16:9, 1080p, 30fps',
    },
    icon: { rows: iconRows(SUN_ICON, Y), row: 16, col: 32 },
  },
  {
    n: 500,
    rows: {
      14: '{m}{nb}{dh}{w}Sound, all made in code',
      16: '{w}THEME {c}80 BPM, F major, ii-V-I-vi',
      17: '{w}      {c}20 bars of 3 s: a 60 s loop',
      18: '{w}PLAYS {c}electric piano, kalimba,',
      19: '{w}      {c}soft drums, vinyl crackle',
      20: '{w}OCEAN {c}a seamless 60 s loop too',
      21: '{w}FILES {c}150+, no samples or recordings',
      22: '{y}Q{w} So what does it sound like?{m}[?]',
      23: '{y}A{w}{cn}Nobody knows. Nobody\'s heard it yet.',
    },
    reveal: 16,    // steps after the page arrives
  },
];
const FASTEXT = '{r}Gags     {g}Timers   {y}Weather  {c}Sound';

// ---------------------------------------------------------------- header row
const CLOCK_COL = 32;                 // HH:MM/SS at cols 32-39
const T0 = 11 * 3600 + 59 * 60 + 45;  // 11:59:45 when the page loads
const CLOCK_START = 8 * 3600;         // the clock's loop starts at 08:00:00
function headerRow(page, requested, shown) {
  // cols 0-7: the page the viewer asked for; cols 8-39: the broadcast header
  put(page, 0, 0, `{w}P${requested}`);
  put(page, 0, 8, `{y}RAFTEXT{w}${shown}{c}Thu 01 Oct{y}  :  /  `);
}

// ---------------------------------------------------------------- frames
const rollRnd = mulberry32(80);
const ROLLS = PAGES.map(() => Array.from({ length: ROLL }, () => {
  const hex = '0123456789ABCDEF';
  const m = 1 + Math.floor(rollRnd() * 8);
  const a = rollRnd() < 0.2 ? hex[10 + Math.floor(rollRnd() * 6)] : hex[Math.floor(rollRnd() * 10)];
  const b = rollRnd() < 0.2 ? hex[10 + Math.floor(rollRnd() * 6)] : hex[Math.floor(rollRnd() * 10)];
  return `${m}${a}${b}`;
}));

let worstPicture = 0;
function frame(s) {
  const page = blankPage();
  const k = Math.floor(s / PAGE_STEPS), into = s % PAGE_STEPS;
  const P = PAGES[k];
  // header: in the last ROLL steps of a page the next one is being searched for
  if (into >= PAGE_STEPS - ROLL) {
    const nk = (k + 1) % PAGES.length;
    headerRow(page, PAGES[nk].n, ROLLS[nk][into - (PAGE_STEPS - ROLL)]);
  } else headerRow(page, P.n, P.n);
  // picture
  const pic = pictureRows(s);
  worstPicture = Math.max(worstPicture, pic.cost);
  for (let r = 0; r < pic.rows.length; r++) page[PIC_ROW0 + r] = pic.rows[r];
  // page body
  const rows = { ...P.rows };
  if (P.swap && s >= P.swap.from && s < P.swap.to) rows[P.swap.row] = P.swap.markup;
  for (const [row, markup] of Object.entries(rows)) put(page, +row, 0, markup);
  if (P.icon) P.icon.rows.forEach((m, i) => put(page, P.icon.row + i, P.icon.col, m));
  // Fastext
  put(page, 24, 0, FASTEXT);
  const reveal = P.reveal !== undefined && into >= P.reveal;
  return { page, reveal };
}

const frames = Array.from({ length: N }, (_, s) => frame(s));
const looks = frames.map(({ page, reveal }) => decodePage(page, { reveal }));

// The clock digits are drawn by strips; blank them out of the frames.
const CLOCK_DIGITS = [0, 1, 3, 4, 6, 7].map((i) => CLOCK_COL + i);
for (const L of looks) for (const col of CLOCK_DIGITS) L[col].o = null;

// ---------------------------------------------------------------- diagnostics (flags at the top)
function rowText(bytes) {
  let s = '';
  for (const b of bytes) s += b < 0x20 ? '·' : (b >= 0x20 && b < 0x7f ? String.fromCharCode(b) : '?');
  return s;
}
if (process.argv.includes('--dbg')) {
  const i = process.argv.indexOf('--dbg'); const st = +process.argv[i + 1], r = +process.argv[i + 2];
  const cv = drawPicture(st); const pr = pictureRows(st);
  const cells = decodeRow(pr.rows[r]);
  let want = ['', '', ''], got = ['', '', ''];
  for (let col = 0; col < COLS; col++) {
    const c = cells[col];
    for (let yy = 0; yy < 3; yy++) {
      for (let xx = 0; xx < 2; xx++) {
        const w = cv.px[(r * 3 + yy) * PXW + col * 2 + xx];
        const bit = 1 << (yy * 2 + xx);
        const g = c.kind === 'mos' && (c.bits & bit) ? c.fg : c.bg;
        want[yy] += 'KRGYBMCW'[w]; got[yy] += (g === w ? 'KRGYBMCW'[g].toLowerCase() : 'KRGYBMCW'[g]);
      }
      want[yy] += ' '; got[yy] += ' ';
    }
  }
  console.log(want.join(String.fromCharCode(10))); console.log(got.join(String.fromCharCode(10)));
  console.log(rowText(pr.rows[r]));
}
if (process.argv.includes('--codes')) {
  const r = +process.argv[process.argv.indexOf('--codes') + 1];
  const NAMES = { 0x1d: 'NB', 0x1c: 'BB', 0x08: 'FL', 0x09: 'ST', 0x0d: 'DH', 0x0c: 'NH', 0x18: 'CN' };
  const out = [];
  frames[0].page[r].forEach((b, col) => {
    if (b < 0x20) out.push(col + ':' + (NAMES[b] || ((b & 0x10 ? 'g' : 'a') + 'KRGYBMCW'[b & 7])));
  });
  console.log(out.join(' '));
}
if (process.argv.includes('--costs')) {
  for (let st = 0; st < N; st++) { const pr = pictureRows(st); if (pr.cost > 9) console.log(st, pr.costs.map((c) => c.toFixed(0)).join(' ')); }
}
if (process.argv.includes('--pic')) {
  const st = +(process.argv[process.argv.indexOf('--pic') + 1] || 0);
  const cv = drawPicture(st);
  for (let y = 0; y < PXH; y++) { let l = ''; for (let x = 0; x < PXW; x++) l += 'KRGYBMCW'[cv.px[y * PXW + x]]; console.log(String(y).padStart(2) + ' ' + l.replace(/B/g, '.').replace(/C/g, '~')); }
  const pr = pictureRows(st);
  console.log('row costs', pr.costs.map((c) => c.toFixed(1)).join(' '));
}
if (SHOW_TEXT) {
  for (const k of [0, 1, 2, 3, 4]) {
    const f = frames[k * PAGE_STEPS + 1];
    console.log(`--- page ${PAGES[k].n}`);
    for (let r = 0; r < ROWS; r++) console.log(String(r).padStart(2) + ' ' + rowText(f.page[r]));
  }
}

// ---------------------------------------------------------------- diff + SVG
const NC = COLS * ROWS;
const U = looks.map((L) => L.map((c) => c.u));
const O = looks.map((L) => L.map((c) => c.o));
const dynU = new Set(), dynO = new Set();
for (let p = 0; p < NC; p++) for (let s = 1; s < N; s++) {
  if (U[s][p] !== U[0][p]) dynU.add(p);
  if (O[s][p] !== O[0][p]) dynO.add(p);
}

const css = [];
const kf = new Map();
function period(mask) {
  for (let P = 1; P <= N; P++) {
    if (N % P) continue;
    let ok = true;
    for (let s = P; s < N && ok; s++) if (mask[s] !== mask[s % P]) ok = false;
    if (ok) return P;
  }
  return N;
}
function animClass(mask) {
  const P = period(mask);
  let body = '';
  for (let s = 0; s < P; s++) if (s === 0 || mask[s] !== mask[s - 1]) body += `${+(s / P * 100).toFixed(4)}%{opacity:${mask[s]}}`;
  body += `100%{opacity:${mask[P - 1]}}`;
  const dur = +(P * STEP).toFixed(4);
  const sig = `${body}|${dur}|${mask[STILL]}`;
  if (!kf.has(sig)) {
    const name = `k${kf.size.toString(36)}`;
    kf.set(sig, name);
    css.push(`@keyframes ${name}{${body}}.${name}{animation:${name} ${dur}s step-end infinite${mask[STILL] ? '' : ';opacity:0'}}`);
  }
  return kf.get(sig);
}

const groups = new Map();
function addState(kind, p, value, mask) {
  const key = mask.join('');
  if (!groups.has(key)) groups.set(key, { mask, u: [], o: [] });
  groups.get(key)[kind].push([p, value]);
}
// Underlays: the base layer draws every cell in its first-frame state, so it
// is one continuous surface; other states are opaque patches laid over it.
// Overlays are transparent glyphs, so every state of a changing one is a group.
for (const p of dynU) {
  const states = new Map();
  for (let s = 0; s < N; s++) {
    const v = U[s][p];
    if (v === U[STILL][p]) continue;
    if (!states.has(v)) states.set(v, new Array(N).fill(0));
    states.get(v)[s] = 1;
  }
  for (const [v, mask] of states) addState('u', p, v, mask);
}
for (const p of dynO) {
  const states = new Map();
  for (let s = 0; s < N; s++) {
    const v = O[s][p];
    if (v === null) continue;
    if (!states.has(v)) states.set(v, new Array(N).fill(0));
    states.get(v)[s] = 1;
  }
  for (const [v, mask] of states) addState('o', p, v, mask);
}

const cellXY = (p) => [(p % COLS) * CW, Math.floor(p / COLS) * CH];
// sextant grid: 80 x 75; sextant rows are 6, 8 and 6 units tall
const SY = (gy) => Math.floor(gy / 3) * CH + [0, 6, 14][gy % 3];
const underlay = (cells, withBlack) => {     // cells: [p, six colour digits]
  const byCol = new Map();
  for (const [p, u] of cells) {
    const col = p % COLS, row = Math.floor(p / COLS);
    for (let i = 0; i < 6; i++) {
      const c = +u[i];
      if (c === K && !withBlack) continue;
      if (!byCol.has(c)) byCol.set(c, new Set());
      byCol.get(c).add((row * 3 + (i >> 1)) * 80 + col * 2 + (i & 1));
    }
  }
  let out = '';
  for (const [c, set] of [...byCol].sort((a, b) => a[0] - b[0])) {
    const rects = gridRects((x, y) => set.has(y * 80 + x), 80, ROWS * 3)
      .map(([x, y, w, h]) => [x * 6, SY(y), w * 6, SY(y + h) - SY(y)]);
    out += `<path fill="${PAL[c]}" d="${rectsD(rects)}"/>`;
  }
  return out ? `<g shape-rendering="crispEdges">${out}</g>` : '';
};
const overlay = (cells) => {          // cells: [p, key]
  const byCol = new Map();
  for (const [p, key] of cells) {
    const [g, c, f] = key.split(':');
    const k = `${c}:${f}`;
    if (!byCol.has(k)) byCol.set(k, []);
    byCol.get(k).push([p, g]);
  }
  let out = '';
  for (const [k, list] of [...byCol].sort()) {
    const [c, f] = k.split(':');
    out += `<g fill="${PAL[+c]}"${f === '1' ? ' class="fl"' : ''}>`;
    for (const [p, g] of list) { const [x, y] = cellXY(p); out += `<use href="#${g}" x="${x}" y="${y}"/>`; }
    out += '</g>';
  }
  return out;
};

let body = '';
// static underlay
body += underlay([...Array(NC).keys()].map((p) => [p, U[STILL][p]]), false);
// dynamic underlays
for (const [, g] of groups) if (g.u.length) body += `<g class="a ${animClass(g.mask)}">${underlay(g.u, true)}</g>`;
// static overlays
body += overlay([...Array(NC).keys()].filter((p) => !dynO.has(p) && O[STILL][p]).map((p) => [p, O[STILL][p]]));
// dynamic overlays
for (const [, g] of groups) if (g.o.length) body += `<g class="a ${animClass(g.mask)}">${overlay(g.o)}</g>`;

// ---------------------------------------------------------------- the clock
// One strip of glyphs per digit, moved by steps(); all six share one delay,
// so the whole clock reads T0 at load and never disagrees with itself.
let clock = '';
const clips = [];
{
  const delay = -(T0 - CLOCK_START);
  const strips = [
    { cols: [0, 1], vals: Array.from({ length: 10 }, (_, i) => String(8 + i).padStart(2, '0')), per: 3600 },
    { cols: [3], vals: '012345'.split(''), per: 600 },
    { cols: [4], vals: '0123456789'.split(''), per: 60 },
    { cols: [6], vals: '012345'.split(''), per: 10 },
    { cols: [7], vals: '0123456789'.split(''), per: 1 },
  ];
  strips.forEach((st, i) => {
    const x = (CLOCK_COL + st.cols[0]) * CW, w = st.cols.length * CW;
    clips.push(`<clipPath id="q${i}"><rect x="${x}" y="0" width="${w}" height="${CH}"/></clipPath>`);
    const dur = st.per * st.vals.length;
    css.push(`@keyframes c${i}{to{transform:translateY(${-CH * st.vals.length}px)}}.c${i}{animation:c${i} ${dur}s steps(${st.vals.length}) ${delay}s infinite}`);
    let uses = '';
    st.vals.forEach((v, j) => {
      for (let d = 0; d < v.length; d++) uses += `<use href="#${charGlyph(v.charCodeAt(d), 'n')}" x="${x + d * CW}" y="${j * CH}"/>`;
    });
    clock += `<g clip-path="url(#q${i})"><g class="clk c${i}">${uses}</g></g>`;
  });
}
clock = `<g fill="${PAL[Y]}">${clock}</g>`;

css.push('@keyframes fl{0%{opacity:1}66.6667%{opacity:0}100%{opacity:0}}.fl{animation:fl 1.5s step-end infinite}');
css.push('@media (prefers-reduced-motion:reduce){.a,.fl{animation:none!important}.clk{animation-play-state:paused!important}}');

const defs = [...glyphDefs].map(([id, d]) => `<path id="${id}" d="${d}"/>`).join('') + clips.join('');
const ALT = 'CASTAWAY on RAFTEXT page 100: a teletext page with a blue sky, a yellow mosaic title and a tiny island';
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W_} ${H_}" width="${W_}" height="${H_}" role="img" aria-label="${ALT}">
<title>CASTAWAY</title>
<style>${css.join('')}</style>
<defs>${defs}</defs>
<rect width="${W_}" height="${H_}" rx="18" fill="#000"/>
<rect x="1" y="1" width="${W_ - 2}" height="${H_ - 2}" rx="17" fill="none" stroke="#2a2a2a" stroke-width="2"/>
<g transform="translate(${MX} ${MY}) scale(${num(SX)} 1)">${body}${clock}</g>
</svg>
`;
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, svg);
console.log(`wrote ${path.relative(process.cwd(), OUT)}: ${(svg.length / 1024).toFixed(1)} KB, ${groups.size} animated groups, ${kf.size} tracks, worst picture cost ${worstPicture.toFixed(2)}`);
