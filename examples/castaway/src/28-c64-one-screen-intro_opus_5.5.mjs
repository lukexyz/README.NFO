// "C64 one-screen intro" README banner for CASTAWAY.
//
//   node examples/castaway/src/28-c64-one-screen-intro_opus_5.5.mjs
//   node examples/castaway/src/28-c64-one-screen-intro_opus_5.5.mjs --at=40 --out=some/where.svg
//   node examples/castaway/src/28-c64-one-screen-intro_opus_5.5.mjs --sprites=some/where.svg
//
// Regenerates ../assets/28-c64-one-screen-intro_opus_5.5.svg. Plain Node, no
// deps, deterministic (no clock, no Math.random). --at bakes a head start (in
// seconds) into every animation delay so late frames of the scroller can be
// checked without waiting; use it only together with --out, never in place.
// --sprites writes a big contact sheet of the two sprites, for pixel work.
//
// The style: the single-screen Commodore 64 crack intro of 1986-89 (catalogue
// entry c64-01). One black screen on a 40-column grid: a big logo whose
// colour changes by scanline, a fenced PRESENTS, one line on a pink raster bar
// and one on a blue one, a "... ON dd/mm/yy BY ..." line, a small info block,
// a blinking PRESS SPACE and one double-size scroller near the bottom. No
// group's logo, charset or scrolltext is copied: the letters, the 8x8 font,
// the sprites and every word are drawn and written for this file. The line
// that used to name a cracker now says who stranded her, and the info block
// that used to list trainers lists the plot (minimal).
//
// How the SVG does it
//   * The logo is a character mosaic: every letter is 4 or 5 character cells
//     wide and 6 high, each cell full, empty, a half block or a 45-degree
//     wedge, exactly the pieces a C64 charset logo was built from. The pixels
//     are merged into one path and used as a clipPath over a tall stack of
//     one-scanline stripes (sea ramp, then sand ramp) that is moved up one
//     scanline per step with steps() timing: the raster split, rolling.
//   * The two text bars are 11 one-scanline rects each, shaded in five
//     luminance steps of the VIC-II palette, extending into the border as
//     raster bars do. Their text is black, so it reads as cut out of them.
//   * Text is an 8x8 font defined below, each glyph one <path> in <defs>,
//     placed with <use>. The colour-wash line gives every character cell its
//     own fill animation with a per-column delay: C64 colour-RAM cycling.
//   * The scroller is the same font at 2x2, shaded per scanline by one
//     hard-stop gradient, moved two pixels per step at 30 steps a second, and
//     drawn twice back to back so the loop has no seam.
//   * PRESS SPACE blinks on the beat of the theme (80 BPM: on one beat, off
//     one beat), and the two expanded sprites (her island, and the shark in
//     headphones) nod on every beat. No pixel peaks more than twice a
//     second (the logo ramps hit white twice per 1.2 s cycle).
//   * prefers-reduced-motion stops everything on the first frame, which is a
//     complete screen: the logo, every line, and the first words of the scroll.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const arg = (name) => {
  const hit = process.argv.slice(2).find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : null;
};
const T0 = Number(arg('at') || 0);
const OUT = arg('out') ? path.resolve(arg('out')) : path.resolve(here, '../assets/28-c64-one-screen-intro_opus_5.5.svg');
const SPRITE_SHEET = arg('sprites') ? path.resolve(arg('sprites')) : null;

const n = (v, d = 3) => String(+(+v).toFixed(d));
const dly = (s) => `${n(s - T0, 3)}s`;

// ------------------------------------------------------------------ palette
// The 16 VIC-II colours, Pepto's measured values. Nothing else is used on
// the screen itself.
const C = {
  black: '#000000', white: '#ffffff', red: '#68372b', cyan: '#70a4b2',
  purple: '#6f3d86', green: '#588d43', blue: '#352879', yellow: '#b8c76f',
  orange: '#6f4f25', brown: '#433900', lred: '#9a6759', dgrey: '#444444',
  grey: '#6c6c6c', lgreen: '#9ad284', lblue: '#6c5eb5', lgrey: '#959595',
};

// ------------------------------------------------------------------ screen
// Virtual units are C64 pixels. The 320-pixel screen sits in a black border
// (raster bars run out into it, text does not).
const BX = 16;
const BY = 8;
const SW = 320;
const ROWS = 26;
const SH = ROWS * 8;
const W = SW + 2 * BX;
const H = SH + 2 * BY;
const SCALE = 3;          // intrinsic size of the <svg>; GitHub scales it anyway
const BEAT = 0.75;        // 80 BPM
const rowY = (r) => BY + r * 8;

// ------------------------------------------------------------------ pixels
const key = (x, y) => `${x},${y}`;
const unkey = (k) => k.split(',').map(Number);
// Merge pixels into horizontal runs, stack identical runs into rects, emit
// one path. ox/oy offset, s = pixel size.
function pathOf(set, ox = 0, oy = 0, s = 1) {
  const rows = new Map();
  for (const k of set) {
    const [x, y] = unkey(k);
    if (!rows.has(y)) rows.set(y, []);
    rows.get(y).push(x);
  }
  const runs = [];
  for (const [y, xs] of rows) {
    xs.sort((a, b) => a - b);
    let st = xs[0];
    let p = xs[0];
    for (let i = 1; i <= xs.length; i++) {
      if (i < xs.length && xs[i] === p + 1) { p = xs[i]; continue; }
      runs.push([st, p + 1, y]);
      if (i < xs.length) { st = xs[i]; p = xs[i]; }
    }
  }
  runs.sort((a, b) => a[2] - b[2] || a[0] - b[0]);
  const live = new Set(runs.map((r) => `${r[0]},${r[1]},${r[2]}`));
  const out = [];
  for (const r of runs) {
    const k0 = `${r[0]},${r[1]},${r[2]}`;
    if (!live.has(k0)) continue;
    live.delete(k0);
    let h = 1;
    while (live.has(`${r[0]},${r[1]},${r[2] + h}`)) { live.delete(`${r[0]},${r[1]},${r[2] + h}`); h++; }
    out.push(`M${n(ox + r[0] * s)} ${n(oy + r[2] * s)}h${n((r[1] - r[0]) * s)}v${n(h * s)}h${n(-(r[1] - r[0]) * s)}z`);
  }
  return out.join('');
}

// ------------------------------------------------------------------ 8x8 font
// Drawn for this file: squared "computer" capitals, two-pixel verticals and
// one-pixel horizontals, seven pixels wide and seven high, one blank column
// and row. Rows past the seventh are blank unless given (comma, underscore).
const FONT = {
  A: ['.#####.', '##...##', '##...##', '#######', '##...##', '##...##', '##...##'],
  B: ['######.', '##...##', '##...##', '######.', '##...##', '##...##', '######.'],
  C: ['.######', '##.....', '##.....', '##.....', '##.....', '##.....', '.######'],
  D: ['#####..', '##..##.', '##...##', '##...##', '##...##', '##..##.', '#####..'],
  E: ['#######', '##.....', '##.....', '#####..', '##.....', '##.....', '#######'],
  F: ['#######', '##.....', '##.....', '#####..', '##.....', '##.....', '##.....'],
  G: ['.######', '##.....', '##.....', '##..###', '##...##', '##...##', '.######'],
  H: ['##...##', '##...##', '##...##', '#######', '##...##', '##...##', '##...##'],
  I: ['.#####.', '..###..', '..###..', '..###..', '..###..', '..###..', '.#####.'],
  J: ['.....##', '.....##', '.....##', '.....##', '.....##', '##...##', '.#####.'],
  K: ['##...##', '##..##.', '##.##..', '####...', '##.##..', '##..##.', '##...##'],
  L: ['##.....', '##.....', '##.....', '##.....', '##.....', '##.....', '#######'],
  M: ['##...##', '###.###', '#######', '##.#.##', '##...##', '##...##', '##...##'],
  N: ['##...##', '###..##', '####.##', '##.####', '##..###', '##...##', '##...##'],
  O: ['.#####.', '##...##', '##...##', '##...##', '##...##', '##...##', '.#####.'],
  P: ['######.', '##...##', '##...##', '######.', '##.....', '##.....', '##.....'],
  Q: ['.#####.', '##...##', '##...##', '##...##', '##.#.##', '##..##.', '.###.##'],
  R: ['######.', '##...##', '##...##', '######.', '##.##..', '##..##.', '##...##'],
  S: ['.######', '##.....', '##.....', '.#####.', '.....##', '.....##', '######.'],
  T: ['#######', '..###..', '..###..', '..###..', '..###..', '..###..', '..###..'],
  U: ['##...##', '##...##', '##...##', '##...##', '##...##', '##...##', '.#####.'],
  V: ['##...##', '##...##', '##...##', '##...##', '.##.##.', '..###..', '...#...'],
  W: ['##...##', '##...##', '##...##', '##.#.##', '#######', '###.###', '##...##'],
  X: ['##...##', '##...##', '.##.##.', '..###..', '.##.##.', '##...##', '##...##'],
  Y: ['##...##', '##...##', '.##.##.', '..###..', '..###..', '..###..', '..###..'],
  Z: ['#######', '....##.', '...##..', '..##...', '.##....', '##.....', '#######'],
  0: ['.#####.', '##...##', '##..###', '##.#.##', '###..##', '##...##', '.#####.'],
  1: ['..###..', '.####..', '..###..', '..###..', '..###..', '..###..', '.#####.'],
  2: ['.#####.', '##...##', '.....##', '..####.', '.##....', '##.....', '#######'],
  3: ['.#####.', '##...##', '.....##', '...###.', '.....##', '##...##', '.#####.'],
  4: ['...###.', '..####.', '.##.##.', '##..##.', '#######', '....##.', '....##.'],
  5: ['#######', '##.....', '######.', '.....##', '.....##', '##...##', '.#####.'],
  6: ['.#####.', '##.....', '##.....', '######.', '##...##', '##...##', '.#####.'],
  7: ['#######', '.....##', '....##.', '...##..', '..##...', '..##...', '..##...'],
  8: ['.#####.', '##...##', '##...##', '.#####.', '##...##', '##...##', '.#####.'],
  9: ['.#####.', '##...##', '##...##', '.######', '.....##', '.....##', '.#####.'],
  '.': ['.......', '.......', '.......', '.......', '.......', '..##...', '..##...'],
  ',': ['.......', '.......', '.......', '.......', '.......', '..##...', '..##...', '.##....'],
  ':': ['.......', '..##...', '..##...', '.......', '.......', '..##...', '..##...'],
  "'": ['..##...', '..##...', '.##....', '.......', '.......', '.......', '.......'],
  '!': ['..##...', '..##...', '..##...', '..##...', '..##...', '.......', '..##...'],
  '?': ['.#####.', '##...##', '....##.', '...##..', '...##..', '.......', '...##..'],
  '-': ['.......', '.......', '.......', '.#####.', '.......', '.......', '.......'],
  '=': ['.......', '.......', '#######', '.......', '#######', '.......', '.......'],
  '+': ['.......', '..##...', '..##...', '######.', '..##...', '..##...', '.......'],
  '/': ['.....##', '....##.', '...##..', '..##...', '.##....', '##.....', '.......'],
  '(': ['...##..', '..##...', '.##....', '.##....', '.##....', '..##...', '...##..'],
  ')': ['.##....', '..##...', '...##..', '...##..', '...##..', '..##...', '.##....'],
  '_': ['.......', '.......', '.......', '.......', '.......', '.......', '.......', '#######'],
  '$': ['...#...', '.######', '##.#...', '.#####.', '...#.##', '######.', '...#...'],
  '*': ['.......', '##.#.##', '.#####.', '#######', '.#####.', '##.#.##', '.......'],
  // a quaver, for the scroller's separators
  '~': ['...##..', '...###.', '...#.##', '...#...', '.###...', '####...', '.##....'],
  ' ': [],
};
const GLYPH_ID = new Map();
const glyphDefs = [];
function glyph(ch) {
  if (GLYPH_ID.has(ch)) return GLYPH_ID.get(ch);
  const rows = FONT[ch];
  if (!rows) throw new Error(`no glyph for "${ch}"`);
  const set = new Set();
  rows.forEach((r, y) => [...r].forEach((c, x) => { if (c === '#') set.add(key(x, y)); }));
  const id = `g${GLYPH_ID.size.toString(36)}`;
  GLYPH_ID.set(ch, id);
  if (set.size) glyphDefs.push(`<path id="${id}" d="${pathOf(set)}"/>`);
  return id;
}
// <use> elements for a line of text, starting at virtual (x, y).
function uses(str, x, y, attrs = () => '') {
  const out = [];
  [...str].forEach((ch, i) => {
    const id = glyph(ch);
    if (ch === ' ') return;
    out.push(`<use href="#${id}" x="${x + i * 8}" y="${y}"${attrs(i, ch)}/>`);
  });
  return out.join('');
}
const centreX = (str) => BX + Math.round((SW - str.length * 8) / 2);

// ------------------------------------------------------------------ logo
// A character mosaic. Cell pieces: F full, . empty, l/r/t/u half blocks
// (left, right, top, bottom), and wedges named by the corner they fill:
// 1 lower-right, 2 lower-left, 3 upper-right, 4 upper-left.
const LOGO_LETTERS = {
  C: ['1FFF', 'F...', 'F...', 'F...', 'F...', '3FFF'],
  A: ['1FF2', 'F..F', 'F..F', 'FFFF', 'F..F', 'F..F'],
  S: ['1FFF', 'F...', '3FF2', '...F', '...F', 'FFF4'],
  T: ['FFFF', '.rl.', '.rl.', '.rl.', '.rl.', '.rl.'],
  W: ['F...F', 'F...F', 'F...F', 'F.F.F', 'F.F.F', '3FFF4'],
  Y: ['F..F', 'F..F', 'F..F', '3FF4', '.rl.', '.rl.'],
};
function cellPixels(piece, x, y) {
  switch (piece) {
    case 'F': return true;
    case '.': return false;
    case 'l': return x < 4;
    case 'r': return x >= 4;
    case 't': return y < 4;
    case 'u': return y >= 4;
    case '1': return x + y >= 7;
    case '2': return y >= x;
    case '3': return y <= x;
    case '4': return x + y <= 7;
    default: throw new Error(`bad piece ${piece}`);
  }
}
const LOGO_WORD = 'CASTAWAY';
const LOGO_GAP = 4;
const logoWidth = [...LOGO_WORD].reduce((a, ch) => a + LOGO_LETTERS[ch][0].length * 8, 0) + LOGO_GAP * (LOGO_WORD.length - 1);
const LOGO_X = BX + Math.round((SW - logoWidth) / 2);
const LOGO_Y = rowY(1);
const LOGO_H = 48;
const logoSet = new Set();
{
  let lx = 0;
  for (const ch of LOGO_WORD) {
    const L = LOGO_LETTERS[ch];
    L.forEach((row, cy) => [...row].forEach((piece, cx) => {
      for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
        if (cellPixels(piece, x, y)) logoSet.add(key(lx + cx * 8 + x, cy * 8 + y));
      }
    }));
    lx += L[0].length * 8 + LOGO_GAP;
  }
}
const logoPath = pathOf(logoSet, LOGO_X, LOGO_Y);
const logoShadow = pathOf(logoSet, LOGO_X + 2, LOGO_Y + 2);

// Raster table for the logo: one colour per scanline, sea ramp then sand
// ramp. Each colour of the ramp is held for two lines.
const SEA = ['blue', 'lblue', 'cyan', 'white', 'cyan', 'lblue'];
const SAND = ['brown', 'orange', 'yellow', 'white', 'yellow', 'orange'];
const LOGO_TABLE = [...SEA, ...SAND].flatMap((c) => [c, c]);
const ROLL_STEP = 0.05;            // one scanline every 50 ms (20 lines a second)
const ROLL_DUR = LOGO_TABLE.length * ROLL_STEP;

function stripes(table, x, y0, w, lines) {
  // one path per colour, lines y0 .. y0+lines-1, colour = table[i % len]
  const byColour = new Map();
  for (let i = 0; i < lines; i++) {
    const c = table[i % table.length];
    if (!byColour.has(c)) byColour.set(c, []);
    byColour.get(c).push(i);
  }
  const out = [];
  for (const [c, is] of byColour) {
    // merge consecutive lines
    const parts = [];
    let s = is[0];
    let p = is[0];
    for (let k = 1; k <= is.length; k++) {
      if (k < is.length && is[k] === p + 1) { p = is[k]; continue; }
      parts.push(`M${x} ${y0 + s}h${w}v${p - s + 1}h${-w}z`);
      if (k < is.length) { s = is[k]; p = is[k]; }
    }
    out.push(`<path fill="${C[c]}" d="${parts.join('')}"/>`);
  }
  return out.join('');
}

// ------------------------------------------------------------------ sprites
// Two expanded hi-res sprites (24x21, every sprite pixel 2x2 screen pixels),
// several sprites overlaid for colour as the C64 allowed. Drawn for this file.
const SPRITE_INK = {
  G: 'green', g: 'lgreen', T: 'brown', t: 'orange', Y: 'yellow', o: 'orange',
  H: 'brown', W: 'white', w: 'lgrey', S: 'lred', R: 'red', B: 'blue',
  L: 'lblue', c: 'cyan', k: 'black', d: 'dgrey', m: 'grey',
};
// Her island: the palm, the sand and her, sitting, facing the middle of the
// screen. Rows marked in HEAD are the ones that nod.
const ISLAND = [
  '...........ggg..........',
  '......gggg.gGGgggg......',
  '....ggGGGGgGGGGGGGGgg...',
  '...gGGG..GGtTGG..GGGGg..',
  '..gGG...GG.TtT.GG...GGg.',
  '..GG...G..tTtT..G....GG.',
  '..G........tT....G....G.',
  '...........tT...........',
  '....WWW....tT...........',
  '...WHHHH....tT..........',
  '..HHHHHSS...tT..........',
  '..HWWHSkS...tT..........',
  '...WWHSSS...Tt..........',
  '....HSS......tT.........',
  '....RRRS.....tT.........',
  '...RRRRSSSS..Tt.........',
  '...RRRwwwS.S.tT.........',
  '..wwwwwww..SStTYY.......',
  '.YYYYYYYYYYYYYYYYYYYY...',
  'LLLcLLLLLcLLLLLLcLLLLLL.',
  'B.BBBB..BBBBBB..BBBBB..B',
];
const ISLAND_HEAD = [8, 13];   // inclusive rows that move on the nod
// The shark in headphones, facing the middle of the screen.
const SHARK = [
  '........................',
  '...............d........',
  '..............dd........',
  '.............ddd........',
  '............dddd........',
  '.......WWW..dddd........',
  '......W...W.mmmdd.......',
  '.....mmmmmWmmmmmmd......',
  '....mmmmmmWmmmmmmmd.....',
  '...mmmmmmWWWmmmmmmmd....',
  '..mmmkkmWWWWWmmmmmmdd...',
  '.mmmmkWmWWWWWmmmmmmmdd..',
  'mmmmmmmmmWWWmmmmmmmmmdd.',
  'mmmmmmmmmmmmmmmmmmmmmdd.',
  '.kkmmmmmmkmmmmmmmmmmmdd.',
  '..wkkkkkkmmmmmmmmmmmdd..',
  '...wwwwwwwmmmmmmmmmdd...',
  '....wwwwwwwwwwwmmmdd....',
  '..cc.LLLLLLLLLLLLLL.cc..',
  'LLLcLLLLLcLLLLLLcLLLLLL.',
  'B.BBBB..BBBBBB..BBBBB..B',
];
const SHARK_HEAD = [1, 17];

function spriteLayers(rows, x0, y0, px = 2, mirror = false) {
  const byInk = new Map();
  rows.forEach((r, y) => [...r].forEach((ch, x) => {
    if (ch === '.') return;
    const xx = mirror ? r.length - 1 - x : x;
    if (!byInk.has(ch)) byInk.set(ch, new Set());
    byInk.get(ch).add(key(xx, y));
  }));
  return [...byInk].map(([ch, set]) => `<path fill="${C[SPRITE_INK[ch]]}" d="${pathOf(set, x0, y0, px)}"/>`).join('');
}
function splitRows(rows, [a, b]) {
  const head = rows.map((r, y) => (y >= a && y <= b ? r : '.'.repeat(r.length)));
  const rest = rows.map((r, y) => (y >= a && y <= b ? '.'.repeat(r.length) : r));
  return [head, rest];
}

// ------------------------------------------------------------------ copy
const PRESENTS = '- P R E S E N T S -';
const PINK_LINE = 'TEN HOURS OF ALMOST NOTHING.';
const BLUE_LINE = 'STRANDED ON 01/10/26 BY SEED 1992';
const STATS = [
  ['RUNTIME', '10:00:00'],
  ['ACTIVITIES', '90 PLUS'],
  ['PLOT', 'MINIMAL'],
  ['SIGNAL', 'ONE BAR'],
];
const STAT_W = 24;
const PRESS = 'PRESS SPACE TO KEEP WAITING';
const WASH = 'EVERY SOUND IS SYNTHESIZED FROM CODE';
export const SCROLL = [
  'WELCOME TO CASTAWAY!',
  'YOU ARE WATCHING THE INTRO. THE MAIN FEATURE IS TEN HOURS OF ONE TINY ISLAND, ONE TALL PALM, ONE RAFT AND ONE YOUNG WOMAN IN HEADPHONES, AND IT IS MOSTLY THIS CALM.',
  'SHE IDLES, NODDING TO THE MUSIC. EVERY SO OFTEN SOMETHING HAPPENS, AND IT ALWAYS STARTS ON THE NEXT BAR, SO EVERY GAG LANDS ON THE BEAT.',
  'AN UNOFFICIAL LO-FI REMAKE, INSPIRED BY THE SMALL-ISLAND ROUTINES OF A CERTAIN 1992 DESERT-ISLAND SCREENSAVER. ALWAYS DAYTIME. HOUSE RULE.',
  'MORE THAN 90 ACTIVITIES ON FOUR TIMERS: EVERY 2 TO 5 MINUTES, 12 TO 25 MINUTES, 30 TO 60 MINUTES, AND EVERY 3 TO 6 HOURS FOR THE VERY RARE ONES.',
  'GREETINGS TO THE SEA TURTLE ... THE GREY TABBY ON THE CRATE (SEE YOU NEXT TIME) ... THE SHARK IN HEADPHONES (NICE NODDING) ... THE HERMIT CRAB (SORRY ABOUT THE COCONUT. IT SUITS YOU) ... THE DELIVERY DRONE (THANKS FOR THE SPARE HEADPHONES) ... THE BRO ON THE HYDROFOIL (SHAKA RECEIVED) ... THE TOUR BOAT (NO PHOTOS, PLEASE) ... THE KUMARA (LOOKING TALLER) ... AND THE BOTTLE THAT KEEPS COMING BACK.',
  'NO GREETINGS TO THE SHIP. IT KNOWS WHAT IT DID.',
  'EVERY NOTE, WAVE AND GULL IS MADE BY CODE IN TOOLS/MAKE_AUDIO.PY: NO SAMPLES, NO BORROWED LOOPS, NO RECORDINGS. THE THEME IS 60 SECONDS AT 80 BPM IN F MAJOR, AND IT COMES ROUND WITHOUT A SEAM.',
  'TO RUN IT: PYTHON TOOLS/SERVE.PY, THEN OPEN 127.0.0.1:8765 FOR A LIVE PREVIEW AND A YOUTUBE-READY MP4.',
  'FOR A SIGNAL, CLIMB THE PALM. ONE BAR. WORTH IT.',
  'SHE COULD LEAVE ANY TIME, YOU KNOW. ONCE IN A VERY LONG WHILE SHE WALKS OUT OVER THE WATER, AND COMES BACK WITH AN ICED COFFEE.',
  'THAT IS ALL. PRESS SPACE, OR DO NOT. SHE WILL WAIT.',
];
const SCROLL_TEXT = `${SCROLL.join(' ~ ')} ~ `;
// --print-scroll: the scroll text wrapped at 40 columns, for the README
if (process.argv.includes('--print-scroll')) {
  const out = [];
  let line = '';
  for (const word of SCROLL.join(' ~ ').split(' ')) {
    if ((line + (line ? ' ' : '') + word).length > 40) { out.push(line); line = word; } else line += (line ? ' ' : '') + word;
  }
  out.push(line);
  console.log(out.join('\n').replace(/~/g, '♪'));
  process.exit(0);
}

// ------------------------------------------------------------------ build
const css = [];
const body = [];

// panel: black screen and border, a faint edge so it reads on dark pages
body.push(`<rect width="${W}" height="${H}" rx="5" fill="${C.black}"/>`);

// --- rules above and below the logo: raster lines across the full width
const rule = (y, cols) => cols.map((c, i) => `<rect x="0" y="${y + i}" width="${W}" height="1" fill="${C[c]}"/>`).join('');
body.push(rule(BY + 2, ['red', 'lred', 'red']));
body.push(rule(rowY(7) + 3, ['red', 'lred', 'red']));

// --- the logo: shadow, then the rolling raster split clipped to the letters
body.push(`<path fill="${C.blue}" d="${logoShadow}"/>`);
body.push(`<clipPath id="logo"><path d="${logoPath}"/></clipPath>`);
const rollLines = LOGO_H + LOGO_TABLE.length;
body.push(`<g clip-path="url(#logo)"><g class="roll">${stripes(LOGO_TABLE, LOGO_X - 2, LOGO_Y, logoWidth + 4, rollLines)}</g></g>`);
css.push(`.roll{animation:roll ${n(ROLL_DUR)}s steps(${LOGO_TABLE.length}) infinite;animation-delay:${dly(0)}}`);
css.push(`@keyframes roll{from{transform:translateY(0)}to{transform:translateY(-${LOGO_TABLE.length}px)}}`);

// --- PRESENTS, fading through the grey ramp in luminance order
const FADE = ['white', 'white', 'white', 'white', 'lgrey', 'grey', 'dgrey', 'grey', 'lgrey'];
body.push(`<g class="fade" fill="${C.white}">${uses(PRESENTS, centreX(PRESENTS), rowY(8))}</g>`);
{
  const st = FADE.map((c, i) => `${n((i / FADE.length) * 100, 2)}%{fill:${C[c]}}`).join('');
  css.push(`.fade{animation:fade ${n(FADE.length * BEAT)}s step-end infinite;animation-delay:${dly(0)}}`);
  css.push(`@keyframes fade{${st}100%{fill:${C.white}}}`);
}

// --- two raster bars with black text
const BAR_PINK = ['red', 'purple', 'lred', 'lred', 'lred', 'lred', 'lred', 'lred', 'lred', 'purple', 'red'];
const BAR_BLUE = ['blue', 'lblue', 'cyan', 'cyan', 'cyan', 'cyan', 'cyan', 'cyan', 'cyan', 'lblue', 'blue'];
// A one-line glint rolls down through the middle of each bar once a beat,
// the blue one half a beat behind the pink one.
function bar(row, ramp, glint, text, phase) {
  const y0 = rowY(row) - 2;
  const id = `bar${row}`;
  const inner = ramp.length - 4;           // lines 2 .. len-3 carry the glint
  body.push(rule(y0, ramp));
  body.push(`<clipPath id="${id}"><rect x="0" y="${y0 + 2}" width="${W}" height="${inner}"/></clipPath>`);
  body.push(`<g clip-path="url(#${id})"><rect class="glint" style="animation-delay:${dly(phase)}" x="0" y="${y0 + 2}" width="${W}" height="1" fill="${C[glint]}"/></g>`);
  body.push(`<g fill="${C.black}">${uses(text, centreX(text), rowY(row))}</g>`);
  return inner;
}
const GLINT_LINES = bar(10, BAR_PINK, 'white', PINK_LINE, 0);
bar(12, BAR_BLUE, 'white', BLUE_LINE, -BEAT / 2);
css.push(`.glint{animation:glint ${BEAT}s steps(${GLINT_LINES}) infinite}`);
css.push(`@keyframes glint{from{transform:translateY(0)}to{transform:translateY(${GLINT_LINES}px)}}`);

// --- info block: label in light blue, dot leader in dark grey, value in yellow
{
  const x0 = centreX('#'.repeat(STAT_W));
  const lab = [];
  const dots = [];
  const val = [];
  STATS.forEach(([l, v], i) => {
    const y = rowY(14 + i);
    const nd = STAT_W - l.length - v.length - 2;
    lab.push(uses(l, x0, y));
    dots.push(uses('.'.repeat(nd), x0 + (l.length + 1) * 8, y));
    val.push(uses(v, x0 + (STAT_W - v.length) * 8, y));
  });
  body.push(`<g fill="${C.lblue}">${lab.join('')}</g><g fill="${C.dgrey}">${dots.join('')}</g><g fill="${C.yellow}">${val.join('')}</g>`);
}

// --- the two sprites either side of the info block, nodding on the beat
{
  const sy = rowY(14) - 4;
  const [ih, ib] = splitRows(ISLAND, ISLAND_HEAD);
  const [sh, sb] = splitRows(SHARK, SHARK_HEAD);
  const lx = BX + 2;
  const rx = BX + SW - 48 - 2;
  body.push(`<g>${spriteLayers(ib, lx, sy)}<g class="nod">${spriteLayers(ih, lx, sy)}</g></g>`);
  body.push(`<g>${spriteLayers(sb, rx, sy)}<g class="nod">${spriteLayers(sh, rx, sy)}</g></g>`);
  css.push(`.nod{animation:nod ${BEAT}s step-end infinite;animation-delay:${dly(0)}}`);
  css.push('@keyframes nod{0%{transform:translateY(0)}60%{transform:translateY(2px)}100%{transform:translateY(0)}}');
}

// --- PRESS SPACE, on one beat and off the next
body.push(`<g class="blink" fill="${C.white}">${uses(PRESS, centreX(PRESS), rowY(19))}</g>`);
css.push(`.blink{animation:blink ${2 * BEAT}s step-end infinite;animation-delay:${dly(0)}}`);
css.push('@keyframes blink{0%{opacity:1}50%{opacity:0}100%{opacity:1}}');

// --- colour-wash line: every character cell cycles through a ramp, each
// column a step behind its left neighbour, so the colours run to the right
const WASH_RAMP = ['blue', 'lblue', 'cyan', 'lgreen', 'white', 'yellow', 'lred', 'purple'];
const WASH_STEP = 0.1;
{
  const st = WASH_RAMP.map((c, i) => `${n((i / WASH_RAMP.length) * 100, 2)}%{fill:${C[c]}}`).join('');
  css.push(`.w{animation:wash ${n(WASH_RAMP.length * WASH_STEP)}s step-end infinite}`);
  css.push(`@keyframes wash{${st}100%{fill:${C[WASH_RAMP[0]]}}}`);
  const x0 = centreX(WASH);
  body.push(`<g fill="${C.white}">${uses(WASH, x0, rowY(21), (i) => ` class="w" style="animation-delay:${dly(-((WASH.length - i) % WASH_RAMP.length) * WASH_STEP)}"`)}</g>`);
}

// --- scroller: 2x2 characters, shaded per scanline, clipped to the screen
const SCR_Y = rowY(23);
const SCR_RAMP = ['lred', 'yellow', 'yellow', 'white', 'white', 'cyan', 'lblue']; // per font row, 2 lines each
{
  const stops = [];
  SCR_RAMP.forEach((c, i) => {
    stops.push(`<stop offset="${n(i / 8)}" stop-color="${C[c]}"/><stop offset="${n((i + 1) / 8)}" stop-color="${C[c]}"/>`);
  });
  glyphDefs.push(`<linearGradient id="sg" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="8">${stops.join('')}</linearGradient>`);
  const L8 = SCROLL_TEXT.length * 8;     // in 1x units inside the scale(2) group
  const STEPS_PER_S = 30;                // two screen pixels per step
  const dur = L8 / STEPS_PER_S;
  glyphDefs.push(`<g id="st">${uses(SCROLL_TEXT, 0, 0)}</g>`);
  body.push(`<clipPath id="scr"><rect x="${BX}" y="${SCR_Y - 1}" width="${SW}" height="18"/></clipPath>`);
  body.push(`<g clip-path="url(#scr)"><g transform="translate(${BX} ${SCR_Y}) scale(2)" fill="url(#sg)"><g class="scroll"><use href="#st"/><use href="#st" x="${L8}"/></g></g></g>`);
  css.push(`.scroll{animation:scroll ${n(dur)}s steps(${L8}) infinite;animation-delay:${dly(0)}}`);
  css.push(`@keyframes scroll{from{transform:translateX(0)}to{transform:translateX(-${L8}px)}}`);
}
// thin raster lines under the scroller: the sea
body.push(rule(rowY(25) + 3, ['blue', 'lblue', 'blue']));

css.push('@media (prefers-reduced-motion: reduce){.roll,.fade,.nod,.blink,.w,.scroll,.glint{animation:none}}');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W * SCALE}" height="${H * SCALE}" shape-rendering="crispEdges" role="img" aria-label="CASTAWAY: a Commodore 64 style one-screen intro">
<style>${css.join('')}</style>
<defs>${glyphDefs.join('')}</defs>
${body.join('\n')}
</svg>
`;
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, svg);
console.log(`wrote ${path.relative(process.cwd(), OUT)} (${(svg.length / 1024).toFixed(1)} KB, scroll ${SCROLL_TEXT.length} chars)`);

if (SPRITE_SHEET) {
  const sheet = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 50" width="1200" height="500" shape-rendering="crispEdges"><rect width="120" height="50" fill="#000"/>${spriteLayers(ISLAND, 4, 4)}${spriteLayers(SHARK, 64, 4)}</svg>`;
  fs.writeFileSync(SPRITE_SHEET, sheet);
}
