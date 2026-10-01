#!/usr/bin/env node
// CASTAWAY as the Info Page of a DOS text-mode tracker.
//
// Style: "DOS text-mode trackers" (catalogue trk-04): the keyboard-driven PC trackers of
// 1993-1999 that ran in character mode yet looked like bevelled control panels. The look here
// follows the tan Impulse Tracker school (panel tan, black insets with a brown top-left edge
// and a cream bottom-right edge, yellow field values, green pattern data, dot-leader key hints,
// a status line, channel tabs, every fourth row tinted). Nothing is copied from any real
// screen: the program name, its maker, every label value, the 8x8 font and the layout maths
// are invented for this project. Unhurried Tracker and Copra Software do not exist.
//
// The idea: the ten-hour video read as a module. Eight channels (her six lanes from
// activities.toml, plus the theme and the ocean loop), one row per beat at 80 BPM, and almost
// every cell empty, because almost nothing happens. That is the song.
//
// The word CASTAWAY is the pattern view itself: each letter is one channel's black window, cut
// to the letter's shape, with a channel tab above it (C = her, A = the cat, S = the turtle,
// T = sea and sky, A = the shore, W = the garden, A = the theme, Y = the ocean). The rows step
// up once a beat under a fixed current-row band.
//
// One loop is 60 s, exactly one pass of the project's 60-second theme (20 bars of 3 s, 80
// rows of one beat), so every counter wraps where the music really does:
//   bar 1   the ocean loop retriggers, she idles, the cat is asleep up the palm; the theme
//           channel shows the real chord roots, one per bar (ii-V-I-vi in F)
//   bar 7   (18 s) a fin: the sea-and-sky channel starts, its pan dot circles the island
//   bar 9   (24 s) the shark surfaces in headphones; its level meter and pan dot now nod in
//           exact sync with hers
//   bar 15  (42 s) note off; it swims away
// The theme meter follows the real arrangement (intro, groove, theme, breakdown).
// Reduced motion: everything pauses on the 30 s frame (shark and her, nodding together).
//
// Regenerate:  node examples/castaway/src/40-text-mode-tracker_opus_5.5.mjs
// Plain Node, no dependencies, deterministic (no clock, no randomness).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '40-text-mode-tracker_opus_5.5';
const OUT = path.join(HERE, '..', 'assets', `${SLUG}.svg`);

// ---------------------------------------------------------------------------------------------
// Geometry: an 80-column screen of 8x8 cells (the tracker's own text mode), 38 rows tall.
// ---------------------------------------------------------------------------------------------
const COLS = 80, ROWS = 42, CW = 8, CH = 8, BZ = 10, MG = 5;   // bezel, tan margin
const SW = COLS * CW, SH = ROWS * CH;
const VBW = SW + (BZ + MG) * 2, VBH = SH + (BZ + MG) * 2;
const X = (c) => c * CW;
const Y = (r) => r * CH;

const LOOP = 60;          // seconds: one pass of the theme
const BEAT = 0.75;        // 80 BPM
const BAR = 3;            // seconds
const NROWS = 80;         // pattern rows per loop, one per beat

// Palette: the tan school, re-measured values from the catalogue entry.
const P = {
  tan: '#B69679', black: '#000000', ink: '#0B0907', dark: '#34302C', darkHi: '#45403A',
  brown: '#7D5945', brownDk: '#59413C', green: '#459A49', greenDim: '#2C6A31',
  cream: '#EBEBCB', yellow: '#FFFF55', bezel: '#211D1A', bezelHi: '#3A332D',
};

// ---------------------------------------------------------------------------------------------
// An original 8x8 face: 2-pixel stems, 1-pixel bars, capitals 7 rows tall (rows 0-6), one row
// for descenders. Each glyph is 8 rows of 7 columns; column 7 is the gap.
// ---------------------------------------------------------------------------------------------
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
G('[', '.####.. .##.... .##.... .##.... .##.... .##.... .####.. .......');
G(']', '.####.. ...##.. ...##.. ...##.. ...##.. ...##.. .####.. .......');
G('!', '..##... ..##... ..##... ..##... ..##... ....... ..##... .......');
G('?', '.#####. ##...## ....##. ...##.. ...##.. ....... ...##.. .......');
G("'", '..##... ..##... .##.... ....... ....... ....... ....... .......');
G('+', '....... ..##... ..##... ######. ..##... ..##... ....... .......');
G('=', '....... ....... ######. ....... ######. ....... ....... .......');
G('#', '.##.##. .##.##. ####### .##.##. ####### .##.##. .##.##. .......');
G('*', '....... .#.#.#. ..###.. ####### ..###.. .#.#.#. ....... .......');
G('<', '....##. ...##.. ..##... .##.... ..##... ...##.. ....##. .......');
G('>', '.##.... ..##... ...##.. ....##. ...##.. ..##... .##.... .......');
G('|', '..##... ..##... ..##... ..##... ..##... ..##... ..##... ..##...');
G('&', '.###... ##.##.. .###... .###.## ##.###. ##..##. .###.## .......');
G('%', '##...## ##..##. ...##.. ..##... .##.... ##..##. #...##. .......');
G('^', '...#... ..###.. .##.##. ##...## ....... ....... ....... .......');
G('~', '....... ....... .###.## ##.###. ....... ....... ....... .......');
G('@', '.#####. ##...## ##.#### ##.#### ##.###. ##..... .#####. .......');
G('·', '....... ....... ....... ....... ...#... ....... ....... .......'); // empty-cell dot

const gid = (ch) => `g${ch.codePointAt(0).toString(36)}`;
const used = new Set();
function glyphPath(ch) {
  const rows = FONT.get(ch);
  let d = '';
  rows.forEach((row, y) => {
    let x = 0;
    while (x < 8) {
      if (row[x] === '#') {
        let w = 1;
        while (row[x + w] === '#') w++;
        d += `M${x} ${y}h${w}v1h-${w}z`;
        x += w;
      } else x++;
    }
  });
  return d;
}

// Text as <use> of glyph paths, one per character; spaces cost nothing.
function txt(col, row, str, dx = 0, dy = 0) {
  let out = '';
  [...str].forEach((ch, i) => {
    if (ch === ' ') return;
    if (!FONT.has(ch)) throw new Error(`no glyph for ${JSON.stringify(ch)} in ${JSON.stringify(str)}`);
    used.add(ch);
    out += `<use href="#${gid(ch)}" x="${X(col + i) + dx}" y="${Y(row) + dy}"/>`;
  });
  return out;
}
const ink = (fill, body, extra = '') => (body ? `<g fill="${fill}"${extra}>${body}</g>` : '');
const rect = (x, y, w, h, fill, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"${extra}/>`;

// A black inset over cells c0..c1 x r0..r1, with the tan school's edges: brown on the top and
// left, cream on the bottom and right, one pixel outside the black.
function inset(c0, r0, c1, r1, fill = P.black) {
  const x = X(c0), y = Y(r0), w = X(c1 + 1) - x, h = Y(r1 + 1) - y;
  return rect(x, y, w, h, fill)
    + rect(x - 1, y - 1, w + 1, 1, P.brown) + rect(x - 1, y, 1, h, P.brown)
    + rect(x, y + h, w + 1, 1, P.cream) + rect(x + w, y - 1, 1, h + 1, P.cream);
}

// Right-aligned label (ending at column `end`), black on tan.
const labelR = (end, row, s) => txt(end - s.length + 1, row, s);

// ---------------------------------------------------------------------------------------------
// CSS animation registry
// ---------------------------------------------------------------------------------------------
const css = [];
let animN = 0;
// Discrete keyframes: list of [timeSeconds, cssDeclarations], held until the next one.
function holdAnim(period, frames) {
  const name = `k${(animN++).toString(36)}`;
  const body = frames
    .map(([t, decl]) => `${+((t / period) * 100).toFixed(3)}%{${decl}}`)
    .join('');
  css.push(`@keyframes ${name}{${body}}`);
  css.push(`.${name}{animation:${name} ${period}s steps(1,end) infinite}`);
  return name;
}
// A strip that steps upward by `step` px, n times per `period` (then wraps to 0).
function stepAnim(period, n, step) {
  const name = `k${(animN++).toString(36)}`;
  css.push(`@keyframes ${name}{to{transform:translateY(-${n * step}px)}}`);
  css.push(`.${name}{animation:${name} ${period}s steps(${n}) infinite}`);
  return name;
}

// A counter: a column of strings in a clipping viewport, stepping through `values` evenly.
function ticker(col, row, width, values, period, fill) {
  const cls = stepAnim(period, values.length, CH);
  const lines = values.map((v, i) => txt(0, i, v)).join('');
  return `<svg x="${X(col)}" y="${Y(row)}" width="${X(width)}" height="${CH}"><g class="${cls}" fill="${fill}">${lines}</g></svg>`;
}
const pad = (n, w) => String(n).padStart(w, '0');

// ---------------------------------------------------------------------------------------------
// The story of the minute (see the header comment). Times in seconds.
// ---------------------------------------------------------------------------------------------
const SHARK_IN = 18, SHARK_UP = 24, SHARK_OFF = 42, SHARK_GONE = 45;

// Lanes as channels. tab: the tab text above each letter; info: the Info Page line.
const CH8 = [
  { tab: 'Her', lane: 'Her', act: 'idle_music_nod', on: true, alt: 'shark_nod (nodding back)' },
  { tab: 'Cat', lane: 'Cat', act: 'cat_visit (up the palm)', on: true },
  { tab: 'Turtle', lane: 'Turtle', act: '', on: false },
  { tab: 'Sea+Sky', lane: 'Sea+Sky', act: 'shark_nod (in headphones)', on: false, shark: true },
  { tab: 'Shore', lane: 'Shore', act: '', on: false },
  { tab: 'Garden', lane: 'Garden', act: '', on: false },
  { tab: 'Theme', lane: 'Theme', act: 'castaway_lofi_theme_loop_60s', on: true },
  { tab: 'Ocean', lane: 'Ocean', act: 'ambience_ocean_loop_60s', on: true },
];

// ---------------------------------------------------------------------------------------------
// Screen content
// ---------------------------------------------------------------------------------------------
const body = [];
const black = [];   // black-ink text, merged into one group
const cream = [];
const yellow = [];
const green = [];
const brown = [];

// Row 0: title line.
const TITLE_LINE = 'Unhurried Tracker v1.992, (C) 2026 Copra Software. All rows reserved.';
black.push(txt(Math.floor((COLS - TITLE_LINE.length) / 2), 0, TITLE_LINE));

// Rows 2-6: the header fields.
const HR = 2;
black.push(labelR(9, HR, 'Song Name'), labelR(9, HR + 1, 'File Name'), labelR(9, HR + 2, 'Order'),
  labelR(9, HR + 3, 'Pattern'), labelR(9, HR + 4, 'Row'));
body.push(inset(11, HR, 36, HR), inset(11, HR + 1, 27, HR + 1), inset(11, HR + 2, 17, HR + 4));
yellow.push(txt(11, HR, 'Castaway (working title)'), txt(11, HR + 1, 'activities.toml'));
// Order / Pattern / Row values: "00n" ticking, "/" in brown, totals static.
for (let i = 0; i < 3; i++) brown.push(txt(14, HR + 2 + i, '/'));
yellow.push(txt(15, HR + 2, '004'), txt(15, HR + 3, '004'), txt(15, HR + 4, '015'));
const ordVals = [0, 1, 2, 3, 4].map((n) => pad(n, 3));
const rowVals = Array.from({ length: 16 }, (_, n) => pad(n, 3));
body.push(ticker(11, HR + 2, 3, ordVals, LOOP, P.yellow));
body.push(ticker(11, HR + 3, 3, ordVals, LOOP, P.yellow));
body.push(ticker(11, HR + 4, 3, rowVals, 16 * BEAT, P.yellow));

// Key hints, dot leaders (the real commands are in the README's key list).
black.push(txt(20, HR + 2, 'F1...Help'), txt(20, HR + 3, 'F5...Play'), txt(20, HR + 4, 'ESC..Leave (any time)'));
black.push(txt(31, HR + 2, 'F9....Load'), txt(31, HR + 3, 'F8....Stop'));

// Right-hand fields.
black.push(labelR(49, HR, 'Instrument'), labelR(49, HR + 1, 'Speed/Tempo'), labelR(49, HR + 2, 'Seed'),
  labelR(49, HR + 3, 'Run'));
body.push(inset(51, HR, 77, HR), inset(51, HR + 1, 57, HR + 1), inset(51, HR + 2, 54, HR + 2),
  inset(51, HR + 3, 58, HR + 3));
yellow.push(txt(51, HR, '02 Kalimba (synthesized)'), txt(51, HR + 1, '024'), txt(55, HR + 1, '080'),
  txt(51, HR + 2, '1992'), txt(51, HR + 3, '10:00:00'));
brown.push(txt(54, HR + 1, '/'));
// FreeMem / FreeEMS become the sound budget.
black.push(txt(62, HR + 3, 'Samples'), txt(62, HR + 4, 'Synthesized'));
black.push(txt(76 - 1, HR + 3, '0k'), txt(74, HR + 4, '150+'));

// Row 8: the status line. Values in cream, some of them ticking.
const SR = 8;
// columns: 'Playing, Order: ' 1-16, value 17, '/5' 18-19, ', Pattern: ' 20-30, value 31,
// ', Row: ' 32-38, value 39-40, '/16' 41-43, ', ' 44-45, '8' 46, ' Channels' 47-55.
black.push(txt(1, SR, 'Playing, Order:'), txt(20, SR, ', Pattern:'), txt(32, SR, ', Row:'),
  txt(44, SR, ','), txt(48, SR, 'Channels'));
body.push(ticker(17, SR, 1, ['0', '1', '2', '3', '4'], LOOP, P.cream));
body.push(ticker(31, SR, 1, ['0', '1', '2', '3', '4'], LOOP, P.cream));
body.push(ticker(39, SR, 2, Array.from({ length: 16 }, (_, n) => pad(n, 2)), 16 * BEAT, P.cream));
cream.push(txt(18, SR, '/5'), txt(41, SR, '/16'), txt(46, SR, '8'));
black.push(txt(66, SR, 'Time'));
cream.push(txt(71, SR, '0:00:'));
body.push(ticker(76, SR, 1, ['0', '1', '2', '3', '4', '5'], LOOP, P.cream));
body.push(ticker(77, SR, 1, ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'], 10, P.cream));

// Row 10: centred section title on a dotted rule.
const TR = 10;
const SECTION = 'Info Page (F5)';
const sc = Math.floor((COLS - SECTION.length) / 2);
black.push(txt(sc, TR, SECTION));
{
  let dots = '';
  for (let x = X(1); x < X(sc - 1); x += 3) dots += `M${x} ${Y(TR) + 4}h1v1h-1z`;
  for (let x = X(sc + SECTION.length + 1); x < X(COLS - 1); x += 3) dots += `M${x} ${Y(TR) + 4}h1v1h-1z`;
  body.push(`<path d="${dots}" fill="${P.brown}"/>`);
}

// ---------------------------------------------------------------------------------------------
// The logo: eight channel windows shaped as C A S T A W A Y, 8 cells wide, 14 rows tall.
// ---------------------------------------------------------------------------------------------
const LETTERS = {
  C: ['.######.', '########', '###..###', '##....##', '##......', '##......', '##......',
    '##......', '##......', '##......', '##....##', '###..###', '########', '.######.'],
  A: ['.######.', '########', '###..###', '##....##', '##....##', '##....##', '########',
    '########', '##....##', '##....##', '##....##', '##....##', '##....##', '##....##'],
  S: ['.######.', '########', '###..###', '##....##', '##......', '##......', '#######.',
    '.#######', '......##', '......##', '##....##', '###..###', '########', '.######.'],
  T: ['########', '########', '...##...', '...##...', '...##...', '...##...', '...##...',
    '...##...', '...##...', '...##...', '...##...', '...##...', '...##...', '...##...'],
  W: ['##....##', '##....##', '##....##', '##.##.##', '##.##.##', '##.##.##', '##.##.##',
    '##.##.##', '##.##.##', '##.##.##', '##.##.##', '########', '########', '.######.'],
  Y: ['##....##', '##....##', '##....##', '##....##', '##....##', '###..###', '.######.',
    '..####..', '...##...', '...##...', '...##...', '...##...', '...##...', '...##...'],
};
const WORD = 'CASTAWAY';
const LT = 13, LH = 14;           // logo top row, height in rows
const LC0 = 6, LSTRIDE = 9;       // first letter column; 8 cells + 1 gap
const BAND = 6;                   // current-row band, logo row index
const NUMC = 2;                   // row-number column (3 digits)
const letterCol = (i) => LC0 + i * LSTRIDE;
const LX0 = X(LC0), LX1 = X(letterCol(7) + 8);   // logo pixel extent
const LY0 = Y(LT), LY1 = Y(LT + LH);

// Cells of the union shape, and the clip path built from merged horizontal runs.
const inShape = new Set();
let clipD = '';
[...WORD].forEach((L, i) => {
  LETTERS[L].forEach((row, r) => {
    let c = 0;
    while (c < 8) {
      if (row[c] === '#') {
        let w = 1;
        while (row[c + w] === '#') w++;
        clipD += `M${X(letterCol(i) + c)} ${Y(LT + r)}h${w * CW}v${CH}h-${w * CW}z`;
        for (let k = 0; k < w; k++) inShape.add(`${letterCol(i) + c + k},${LT + r}`);
        c += w;
      } else c++;
    }
  });
});
const has = (c, r) => inShape.has(`${c},${r}`);

// Bevel edges around the letter shapes: brown above and left, cream below and right.
function bevelPaths() {
  const segs = { top: [], left: [], bottom: [], right: [] };
  for (const key of inShape) {
    const [c, r] = key.split(',').map(Number);
    if (!has(c, r - 1)) segs.top.push([c, r]);
    if (!has(c, r + 1)) segs.bottom.push([c, r]);
    if (!has(c - 1, r)) segs.left.push([c, r]);
    if (!has(c + 1, r)) segs.right.push([c, r]);
  }
  // merge horizontal runs (top/bottom) and vertical runs (left/right)
  const hRuns = (list, yOf) => {
    const byRow = new Map();
    list.forEach(([c, r]) => { if (!byRow.has(r)) byRow.set(r, []); byRow.get(r).push(c); });
    let d = '';
    for (const [r, cs] of byRow) {
      cs.sort((a, b) => a - b);
      let s = cs[0], prev = cs[0];
      const flush = (a, b) => { d += `M${X(a) - 1} ${yOf(r)}h${X(b + 1) - X(a) + 2}v1h-${X(b + 1) - X(a) + 2}z`; };
      for (let k = 1; k <= cs.length; k++) {
        if (k < cs.length && cs[k] === prev + 1) { prev = cs[k]; continue; }
        flush(s, prev);
        if (k < cs.length) { s = cs[k]; prev = cs[k]; }
      }
    }
    return d;
  };
  const vRuns = (list, xOf) => {
    const byCol = new Map();
    list.forEach(([c, r]) => { if (!byCol.has(c)) byCol.set(c, []); byCol.get(c).push(r); });
    let d = '';
    for (const [c, rs] of byCol) {
      rs.sort((a, b) => a - b);
      let s = rs[0], prev = rs[0];
      const flush = (a, b) => { d += `M${xOf(c)} ${Y(a)}h1v${Y(b + 1) - Y(a)}h-1z`; };
      for (let k = 1; k <= rs.length; k++) {
        if (k < rs.length && rs[k] === prev + 1) { prev = rs[k]; continue; }
        flush(s, prev);
        if (k < rs.length) { s = rs[k]; prev = rs[k]; }
      }
    }
    return d;
  };
  const dark = hRuns(segs.top, (r) => Y(r) - 1) + vRuns(segs.left, (c) => X(c) - 1);
  const light = hRuns(segs.bottom, (r) => Y(r + 1)) + vRuns(segs.right, (c) => X(c + 1));
  return `<path d="${dark}" fill="${P.brown}"/><path d="${light}" fill="${P.cream}"/>`;
}

// Pattern data for the 80-row loop: channel index -> { row: 7-char cell }.
// Empty cells are drawn as the dot texture. Notes: the theme channel carries the theme's real
// chord roots, one per bar, ii-V-I-vi in F (Gm9, C13, Fmaj9, Dm9 over bass roots G2, C2, F2,
// D2 in tools/make_audio.py); the ocean loop retriggers on row 0; the shark (instrument 12 in
// the README's list) arrives on bar 7 and gets a note off on bar 15. shark_nod uses two lanes,
// sea and sky and hers, so her channel takes the same notes; otherwise it stays empty, because
// she is idling.
const NOTES = {
  0: { 24: 'C-512··', 56: '===····' },
  3: { 24: 'C-512··', 32: 'C-51240', 56: '===····' },
  6: {},
  7: { 0: 'C-5····' },
};
for (let bar = 0; bar < NROWS / 4; bar++) NOTES[6][bar * 4] = `${'GCFD'[bar % 4]}-2····`;
// The strip: element k shows loop row (k - BAND) mod 80, so row 0 sits on the band at t = 0.
const NSTRIP = NROWS + LH;
const stripRow = (k) => (((k - BAND) % NROWS) + NROWS) % NROWS;

// Dots: one green pixel per character cell (columns 0-6 of each channel), as a pattern fill on
// per-row rectangles that skip the cells holding notes.
let dotRects = '';
const noteUses = [];
{
  // Group consecutive strip rows with no notes into one tall rect.
  let runStart = null;
  const flushRun = (k0, k1) => {
    dotRects += `<rect x="${LX0}" y="${LY0 + k0 * CH}" width="${LX1 - LX0}" height="${(k1 - k0 + 1) * CH}"/>`;
  };
  for (let k = 0; k < NSTRIP; k++) {
    const r = stripRow(k);
    const chans = Object.keys(NOTES).map(Number).filter((c) => NOTES[c][r]);
    if (!chans.length) {
      if (runStart === null) runStart = k;
      continue;
    }
    if (runStart !== null) { flushRun(runStart, k - 1); runStart = null; }
    // this row: dot segments around the note cells
    let x = LX0;
    chans.sort((a, b) => a - b).forEach((c) => {
      const cx = X(letterCol(c));
      if (cx > x) dotRects += `<rect x="${x}" y="${LY0 + k * CH}" width="${cx - x}" height="${CH}"/>`;
      x = cx + X(7);
      noteUses.push(txt(letterCol(c), LT + k, NOTES[c][r]));
    });
    if (x < LX1) dotRects += `<rect x="${x}" y="${LY0 + k * CH}" width="${LX1 - x}" height="${CH}"/>`;
  }
  if (runStart !== null) flushRun(runStart, NSTRIP - 1);
}
// Bar-line rows (every fourth row: where every gag is allowed to start) tinted a shade lighter.
// Every sixteenth row (a pattern's first row, one ii-V-I-vi round) a shade lighter again.
let barRows = '', patRows = '';
for (let k = 0; k < NSTRIP; k++) {
  const r = stripRow(k), d = `M${LX0} ${LY0 + k * CH}h${LX1 - LX0}v${CH}h-${LX1 - LX0}z`;
  if (r % 16 === 0) patRows += d;
  else if (r % 4 === 0) barRows += d;
}

const scrollCls = stepAnim(LOOP, NROWS, CH);
const bandY = Y(LT + BAND);
const logo = [];
logo.push(`<g clip-path="url(#lg)">`);
logo.push(rect(LX0, LY0, LX1 - LX0, LY1 - LY0, P.black));
logo.push(`<g class="${scrollCls}"><path d="${barRows}" fill="${P.dark}"/><path d="${patRows}" fill="${P.darkHi}"/></g>`);
logo.push(rect(LX0, bandY, LX1 - LX0, CH, P.brownDk));
logo.push(`<g class="${scrollCls}"><g fill="url(#dt)">${dotRects}</g>${ink(P.green, noteUses.join(''))}</g>`);
// the same notes again in cream, seen only through the band: the row being played lights up
logo.push(`<svg x="${LX0}" y="${bandY}" width="${LX1 - LX0}" height="${CH}" viewBox="${LX0} ${bandY} ${LX1 - LX0} ${CH}">`
  + `<g class="${scrollCls}">${ink(P.cream, noteUses.join(''))}</g></svg>`);
logo.push('</g>');
logo.push(bevelPaths());

// Channel tabs above the letters (brown tabs; cream text while the channel is sounding).
const sharkOn = holdAnim(LOOP, [[0, 'opacity:0'], [SHARK_IN, 'opacity:1'], [SHARK_GONE, 'opacity:0']]);
const sharkOff = holdAnim(LOOP, [[0, 'opacity:1'], [SHARK_IN, 'opacity:0'], [SHARK_GONE, 'opacity:1']]);
CH8.forEach((ch, i) => {
  const c = letterCol(i);
  body.push(rect(X(c), Y(LT - 1), X(8), CH, P.brown));
  const tc = c + Math.floor((8 - ch.tab.length) / 2);
  if (ch.shark) {
    body.push(ink(P.ink, txt(tc, LT - 1, ch.tab), ` class="${sharkOff}"`));
    body.push(ink(P.cream, txt(tc, LT - 1, ch.tab), ` class="${sharkOn}"`));
  } else (ch.on ? cream : black).push(txt(tc, LT - 1, ch.tab));
});

// Row numbers, 3 digits, the current one in cream on the band.
{
  const rnCls = stepAnim(16 * BEAT, 16, CH);
  const n = 16 + LH;
  const nums = (fill) => {
    let s = '';
    for (let k = 0; k < n; k++) s += txt(NUMC, LT + k, pad((((k - BAND) % 16) + 16) % 16, 3));
    return `<g class="${rnCls}" fill="${fill}">${s}</g>`;
  };
  body.push(rect(X(NUMC) - 2, bandY, X(3) + 4, CH, P.brownDk));
  body.push(`<svg x="${X(NUMC)}" y="${LY0}" width="${X(3)}" height="${LY1 - LY0}" viewBox="${X(NUMC)} ${LY0} ${X(3)} ${LY1 - LY0}">${nums(P.ink)}</svg>`);
  body.push(`<svg x="${X(NUMC)}" y="${bandY}" width="${X(3)}" height="${CH}" viewBox="${X(NUMC)} ${bandY} ${X(3)} ${CH}">${nums(P.cream)}</svg>`);
}

// ---------------------------------------------------------------------------------------------
// The Info Page windows: level meters, what each channel is playing, pan dots.
// ---------------------------------------------------------------------------------------------
const WR = LT + LH + 2;           // first channel row
const VU0 = 4, VU1 = 23, IN0 = 25, IN1 = 62, PN0 = 64, PN1 = 78;
body.push(inset(VU0, WR, VU1, WR + 7), inset(IN0, WR, IN1, WR + 7), inset(PN0, WR, PN1, WR + 7));

// Channel numbers on the tan: cream while sounding, brown when silent.
CH8.forEach((ch, i) => {
  const s = pad(i + 1, 2);
  if (ch.shark) {
    body.push(ink(P.brown, txt(1, WR + i, s), ` class="${sharkOff}"`));
    body.push(ink(P.cream, txt(1, WR + i, s), ` class="${sharkOn}"`));
  } else (ch.on ? cream : brown).push(txt(1, WR + i, s));
});

// Info lines: lane in cream, what it is playing in green; silent lanes are dots.
CH8.forEach((ch, i) => {
  const r = WR + i;
  const lane = ch.lane.padEnd(9, ' ');
  if (ch.shark) {
    body.push(ink(P.brown, txt(IN0 + 1, r, lane), ` class="${sharkOff}"`));
    body.push(ink(P.greenDim, txt(IN0 + 10, r, '·'.repeat(8)), ` class="${sharkOff}"`));
    body.push(ink(P.cream, txt(IN0 + 1, r, lane), ` class="${sharkOn}"`));
    body.push(ink(P.green, txt(IN0 + 10, r, ch.act), ` class="${sharkOn}"`));
  } else if (ch.alt) {
    cream.push(txt(IN0 + 1, r, lane));
    body.push(ink(P.green, txt(IN0 + 10, r, ch.act), ` class="${sharkOff}"`));
    body.push(ink(P.green, txt(IN0 + 10, r, ch.alt), ` class="${sharkOn}"`));
  } else if (ch.on) {
    cream.push(txt(IN0 + 1, r, lane));
    green.push(txt(IN0 + 10, r, ch.act));
  } else {
    brown.push(txt(IN0 + 1, r, lane));
    body.push(ink(P.greenDim, txt(IN0 + 10, r, '·'.repeat(8))));
  }
});

// Level meters: yellow ticks (1 px on, 1 px off), revealed by a black cover that steps right.
// Pump shapes are held per eighth of a beat. Nested groups: the outer scales the cover's
// reach about the meter's left edge (an envelope), the inner pumps on the beat. Scaling also
// shrinks the cover, so it is made absurdly wide: at the smallest envelope (0.001) it is still
// 2000 px, well past the meter's end.
const MX = X(VU0) + 2, ML = X(VU1 + 1) - 2 - MX;   // meter x, length
const pumpCurve = [1.0, 0.9, 0.8, 0.72, 0.66, 0.61, 0.57, 0.54];
function pumpAnim(period, curve, scale, base) {
  const frames = curve.map((v, i) => [(i * period) / curve.length, `transform:translateX(${Math.round(ML * (base + (v - base) * scale))}px)`]);
  return holdAnim(period, frames);
}
function envAnim(frames) {
  return holdAnim(LOOP, frames.map(([t, v]) => [t, `transform:scaleX(${v})`]));
}
css.push('.env{transform-origin:' + MX + 'px 0px}');
const meters = [];
function meter(i, pumpCls, envCls) {
  const y = Y(WR + i);
  let cover = `<rect x="${MX}" y="${y}" width="2000000" height="${CH}" fill="${P.black}"/>`;
  cover = `<g class="${pumpCls}">${cover}</g>`;
  if (envCls) cover = `<g class="env ${envCls}">${cover}</g>`;
  meters.push(rect(MX, y + 1, ML, 6, 'url(#tk)') + cover);
}
// Her: nodding, one pump per beat.
const herPump = pumpAnim(BEAT, pumpCurve, 0.62, 0.0);
meter(0, herPump, null);
// Cat: asleep, a slow purr (one breath per bar).
meter(1, pumpAnim(BAR, [0.22, 0.24, 0.26, 0.27, 0.27, 0.26, 0.24, 0.22], 1, 0), null);
// Sea+Sky: silent, then a fin (small, slow), then the same pump as hers, then gone.
meter(3, herPump, envAnim([[0, 0.001], [SHARK_IN, 0.35], [SHARK_UP, 1], [SHARK_OFF, 0.6], [43.5, 0.3], [SHARK_GONE, 0.001]]));
// Theme: on the beat, at the real arrangement's levels: intro (keys only) 0-6 s, groove 6-30,
// theme 30-48, breakdown 48-60 (kick and rim only).
meter(6, pumpAnim(BEAT, pumpCurve, 0.5, 0.0), envAnim([[0, 0.55], [6, 0.82], [30, 1], [48, 0.66]]));
// Ocean: a slow swell, one wave every six seconds.
meter(7, pumpAnim(6, [0.34, 0.4, 0.46, 0.5, 0.52, 0.5, 0.45, 0.39], 1, 0), null);
// Silent lanes: the cover sits at the left edge.
[2, 4, 5].forEach((i) => meters.push(rect(MX, Y(WR + i) + 1, 1, 6, P.greenDim)));
meters.push(rect(MX, Y(WR + 3) + 1, 1, 6, P.greenDim, ` class="${sharkOff}"`));
body.push(`<svg x="${X(VU0)}" y="${Y(WR)}" width="${X(VU1 + 1 - VU0)}" height="${Y(8)}" viewBox="${X(VU0)} ${Y(WR)} ${X(VU1 + 1 - VU0)} ${Y(8)}">${meters.join('')}</svg>`);

// Pan dots: one small tan square per sounding channel, at its place across the island.
const PX0 = X(PN0) + 4, PL = X(PN1 + 1) - 4 - PX0 - 5;
const panX = (p) => Math.round(PX0 + p * PL);
const nod = holdAnim(BEAT, [[0, 'transform:translateY(1px)'], [BEAT * 0.375, 'transform:translateY(0px)']]);
const dot = (x, i, extra = '') => `<rect x="${x}" y="${Y(WR + i) + 2}" width="5" height="4" fill="${P.tan}"${extra}/>`;
body.push(`<g class="${nod}">${dot(panX(0.68), 0)}</g>`);   // her, at home right of the palm
body.push(dot(panX(0.42), 1));                                // the cat, up the palm
body.push(dot(panX(0.5), 6));                                 // the theme, centre
body.push(dot(panX(0.08), 7) + dot(panX(0.92), 7));           // the ocean, both sides
{
  // The shark: circles once per bar as a fin, then parks beside her and nods on her beat.
  const frames = [[0, `transform:translateX(${panX(1.08) - panX(0)}px)`]];
  for (let t = SHARK_IN; t < SHARK_UP; t += BEAT) {
    const a = ((t - SHARK_IN) / BAR) * Math.PI * 2;
    frames.push([t, `transform:translateX(${panX(0.5 + 0.46 * Math.cos(a)) - panX(0)}px)`]);
  }
  frames.push([SHARK_UP, `transform:translateX(${panX(0.86) - panX(0)}px)`]);
  for (let t = SHARK_OFF; t < SHARK_GONE; t += BEAT) {
    frames.push([t, `transform:translateX(${panX(0.86 + (0.3 * (t - SHARK_OFF + BEAT)) / (SHARK_GONE - SHARK_OFF)) - panX(0)}px)`]);
  }
  frames.push([SHARK_GONE, `transform:translateX(${panX(1.08) - panX(0)}px)`]);
  const move = holdAnim(LOOP, frames);
  body.push(`<svg x="${X(PN0)}" y="${Y(WR)}" width="${X(PN1 + 1 - PN0)}" height="${Y(8)}" viewBox="${X(PN0)} ${Y(WR)} ${X(PN1 + 1 - PN0)} ${Y(8)}">`
    + `<g class="${move}"><g class="${nod}">${dot(panX(0), 3)}</g></g></svg>`);
}

// Under the windows: channel count, the master level (the project's real loudness target), and
// the speed joke; then the way in, as two value boxes like the header fields.
const AR = WR + 9;
black.push(txt(1, AR, 'Active Channels:'), txt(20, AR, '(8)'), txt(26, AR, 'Global Volume:'),
  txt(52, AR, 'Speed 24: one row a beat'));
cream.push(txt(41, AR, '-14 LUFS'));
body.push(ink(P.cream, txt(18, AR, '4'), ` class="${sharkOff}"`));
body.push(ink(P.cream, txt(18, AR, '5'), ` class="${sharkOn}"`));
const KR = AR + 2;
black.push(labelR(10, KR, 'Play'), labelR(42, KR, 'then open'));
body.push(inset(12, KR, 32, KR), inset(44, KR, 65, KR));
yellow.push(txt(12, KR, 'python tools/serve.py'), txt(44, KR, 'http://127.0.0.1:8765/'));

// The mouse pointer (text-mode trackers drew one out of redefined characters), idling.
const POINTER = ['#.......', '##......', '#c#.....', '#cc#....', '#ccc#...', '#cccc#..', '#ccccc#.',
  '#cc####.', '#c#.....', '##......', '#.......'];
function pointer(px, py) {
  let dk = '', lt = '';
  POINTER.forEach((row, y) => [...row].forEach((ch, x) => {
    if (ch === '#') dk += `M${px + x} ${py + y}h1v1h-1z`;
    if (ch === 'c') lt += `M${px + x} ${py + y}h1v1h-1z`;
  }));
  return `<path d="${dk}" fill="${P.ink}"/><path d="${lt}" fill="${P.cream}"/>`;
}
body.push(pointer(X(67) + 2, Y(KR) + 3));

// ---------------------------------------------------------------------------------------------
// Assemble
// ---------------------------------------------------------------------------------------------
const textLayer = ink(P.ink, black.join('')) + ink(P.brown, brown.join('')) + ink(P.cream, cream.join(''))
  + ink(P.yellow, yellow.join('')) + ink(P.green, green.join(''));

const glyphDefs = [...used].sort().map((ch) => `<path id="${gid(ch)}" d="${glyphPath(ch)}"/>`).join('');
// dots texture: tile = one letter stride (9 cells), dots in cells 0-6 at (3, 4)
let dotTile = '';
for (let i = 0; i < 7; i++) dotTile += `<rect x="${i * CW + 3}" y="4" width="1" height="1" fill="${P.green}"/>`;
const defs = `<defs>${glyphDefs}`
  + `<pattern id="dt" patternUnits="userSpaceOnUse" x="${LX0}" y="0" width="${LSTRIDE * CW}" height="${CH}">${dotTile}</pattern>`
  + `<pattern id="tk" patternUnits="userSpaceOnUse" x="${MX}" y="0" width="2" height="8"><rect width="1" height="8" fill="${P.yellow}"/></pattern>`
  + `<clipPath id="lg"><path d="${clipD}"/></clipPath></defs>`;

css.unshift('svg{shape-rendering:crispEdges}');
// Reduced motion: hold the 30 s frame (bar 11: the shark up and nodding, the theme at full).
css.push('@media (prefers-reduced-motion:reduce){*{animation-play-state:paused!important;animation-delay:-30s!important}}');

const TITLE = 'CASTAWAY, as the Info Page of a DOS text-mode tracker';
const DESC = 'An invented 1990s tracker screen in tan, black and green. The word CASTAWAY is the '
  + 'pattern view: eight letter-shaped channel windows (her, the cat, the turtle, sea and sky, the '
  + 'shore, the garden, the theme, the ocean) with rows of mostly empty cells stepping up once a beat '
  + 'at 80 BPM. Below, level meters, what each channel is playing, and pan dots: a shark arrives, '
  + 'surfaces in headphones and nods in sync with her, then leaves. Play: python tools/serve.py, then '
  + 'open http://127.0.0.1:8765/.';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VBW} ${VBH}" width="${VBW}" height="${VBH}" role="img" aria-labelledby="t d">`
  + `<title id="t">${TITLE}</title><desc id="d">${DESC}</desc>`
  + `<style>${css.join('')}</style>${defs}`
  + `<rect width="${VBW}" height="${VBH}" rx="12" fill="${P.bezel}"/>`
  + `<rect x="1.5" y="1.5" width="${VBW - 3}" height="${VBH - 3}" rx="11" fill="none" stroke="${P.bezelHi}"/>`
  + `<g transform="translate(${BZ + MG} ${BZ + MG})">`
  + rect(-MG, -MG, SW + MG * 2, SH + MG * 2, P.tan)
  + body.join('') + logo.join('') + textLayer
  + '</g></svg>\n';

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, svg);
console.log(`wrote ${path.relative(process.cwd(), OUT)} (${(svg.length / 1024).toFixed(1)} KB)`);
