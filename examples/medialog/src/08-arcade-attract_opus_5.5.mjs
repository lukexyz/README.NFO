#!/usr/bin/env node
// Arcade Attract Mode: README header generator for MediaLog.
//
//   node examples/medialog/src/08-arcade-attract_opus_5.5.mjs
//
// Writes examples/medialog/assets/08-arcade-attract_opus_5.5.svg.
// Plain Node, no dependencies, no randomness, no clock: the same bytes every run.
//
// The picture is a cocktail-table arcade machine seen from above: a navy laminate top with
// MediaLog's hard offset shadow under it, the tube under glass, player 1's control panel at
// the bottom (1UP: ME) and player 2's across the table, upside down (2UP: FRIENDS). Tea, a
// remote, headphones and a paperback stand in for watched, read and listened to; the table
// itself is played. The tube is a 368 x 184 raster (46 x 23 cells of 8 x 8), each pixel
// 2 x 2 units, and runs a 30 second attract loop with hard cuts:
//
//    0.0 s  TITLE        MediaLog in log lines, the verb rolling like a score counter
//    7.0 s  HOW TO PLAY  the pitch, then each kind and its colour as a score-advance table
//   12.0 s  DEMO PLAY    the MediaLog book walks the timeline, five years to a screen
//   21.5 s  HIGH SCORES  friends & me, by date: the scores are dates (YYYYMMDD, padded)
//   28.0 s  2UP          the picture turns round to face player 2, as cocktail tables do
//
// The score header (1UP, HI-SCORE, 2UP) and the bottom row (WHAT DID YOU PLAY? blinking,
// STAYED FOR THE CREDITS) stay on throughout. Colour is one colour per line, and the colours
// are MediaLog's kind colours pushed to arcade brightness.
//
// Nothing is <text>: every letter is a <use> of a glyph path from the original 8 x 8 face
// below; the logo is its own face, built from horizontal bands (one band per line of the
// log, each band a kind colour) over a hard offset shadow. Animation is CSS only and stepped;
// every period divides the 30 s loop, so it repeats without a jump. prefers-reduced-motion
// freezes the title card and swaps the rolling verb for the whole sentence.
//
// Facts come from the owner's description and screenshots of the app in development. The
// style references (attract mode, the high-score table, initials, cocktail cabinets that
// turn the picture for player 2) are generic; no real game, font, logo or sprite is copied.
// Every title, creator and set of initials in the sample log is invented, except one
// public-domain classic (Proust).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '08-arcade-attract_opus_5.5';
const OUT = path.resolve(HERE, `../assets/${SLUG}.svg`);

// ------------------------------------------------------------------ geometry
const W = 830, H = 520;
const PX = 2;                                  // one raster pixel = 2 x 2 units
const RW = 368, RH = 184;                      // the raster: 46 x 23 cells of 8 x 8
const SW = RW * PX, SH = RH * PX;              // 736 x 368 units
const SX = (W - SW) / 2, SY = 74;              // screen origin (47, 74)

// ------------------------------------------------------------------ palette
// MediaLog's kind colours, pushed to arcade brightness for a black tube.
const K = {
  movie: '#ff4d4d', tv: '#3ea6ff', book: '#ffae1a', comic: '#ff4fb0',
  game: '#93dd1f', pod: '#a383ff', music: '#1fe0b4', video: '#c0629f',
};
const UI = { w: '#f4f6ff', g: '#8b93ad', d: '#4a5170', k: '#05060a' };
const NAVY = '#18223a';
const BANDS = [K.movie, K.book, K.game, K.music, K.tv, K.pod, K.comic, K.video];

// ------------------------------------------------------------------ the face
// An original 7 x 7 face in an 8 x 8 cell: 2-pixel stems, 1-pixel bars, slashed zero.
// Three reaction glyphs live in the font too: heart (loved), thumb (liked), face (a verdict).
const FONT = {
  A: '..###..|.##.##.|##...##|##...##|#######|##...##|##...##',
  B: '######.|##...##|##...##|######.|##...##|##...##|######.',
  C: '.#####.|##...##|##.....|##.....|##.....|##...##|.#####.',
  D: '#####..|##..##.|##...##|##...##|##...##|##..##.|#####..',
  E: '#######|##.....|##.....|######.|##.....|##.....|#######',
  F: '#######|##.....|##.....|######.|##.....|##.....|##.....',
  G: '.#####.|##...##|##.....|##.####|##...##|##...##|.#####.',
  H: '##...##|##...##|##...##|#######|##...##|##...##|##...##',
  I: '######.|..##...|..##...|..##...|..##...|..##...|######.',
  J: '...####|.....##|.....##|.....##|##...##|##...##|.#####.',
  K: '##...##|##..##.|##.##..|####...|##.##..|##..##.|##...##',
  L: '##.....|##.....|##.....|##.....|##.....|##.....|#######',
  M: '##...##|###.###|#######|##.#.##|##...##|##...##|##...##',
  N: '##...##|###..##|####.##|##.####|##..###|##...##|##...##',
  O: '.#####.|##...##|##...##|##...##|##...##|##...##|.#####.',
  P: '######.|##...##|##...##|######.|##.....|##.....|##.....',
  Q: '.#####.|##...##|##...##|##...##|##.#.##|##..##.|.###.##',
  R: '######.|##...##|##...##|######.|##.##..|##..##.|##...##',
  S: '.#####.|##...##|##.....|.#####.|.....##|##...##|.#####.',
  T: '######.|..##...|..##...|..##...|..##...|..##...|..##...',
  U: '##...##|##...##|##...##|##...##|##...##|##...##|.#####.',
  V: '##...##|##...##|##...##|##...##|.##.##.|..###..|...#...',
  W: '##...##|##...##|##...##|##.#.##|#######|###.###|##...##',
  X: '##...##|##...##|.##.##.|..###..|.##.##.|##...##|##...##',
  Y: '##..##.|##..##.|##..##.|.####..|..##...|..##...|..##...',
  Z: '#######|....##.|...##..|..##...|.##....|##.....|#######',
  0: '.#####.|##...##|##..###|##.#.##|###..##|##...##|.#####.',
  1: '..##...|.###...|..##...|..##...|..##...|..##...|######.',
  2: '.#####.|##...##|.....##|..####.|.##....|##.....|#######',
  3: '.#####.|##...##|.....##|..####.|.....##|##...##|.#####.',
  4: '...###.|..####.|.##.##.|##..##.|#######|....##.|....##.',
  5: '#######|##.....|######.|.....##|.....##|##...##|.#####.',
  6: '.#####.|##.....|##.....|######.|##...##|##...##|.#####.',
  7: '#######|##...##|....##.|...##..|..##...|..##...|..##...',
  8: '.#####.|##...##|##...##|.#####.|##...##|##...##|.#####.',
  9: '.#####.|##...##|##...##|.######|.....##|.....##|.#####.',
  '.': '.......|.......|.......|.......|.......|..##...|..##...',
  ',': '.......|.......|.......|.......|.......|..##...|..##...|.##....',
  ':': '.......|..##...|..##...|.......|..##...|..##...|.......',
  "'": '..##...|..##...|.##....|.......|.......|.......|.......',
  '-': '.......|.......|.......|.#####.|.......|.......|.......',
  '!': '..##...|..##...|..##...|..##...|..##...|.......|..##...',
  '?': '.#####.|##...##|.....##|...###.|..##...|.......|..##...',
  '&': '.###...|##.##..|##.##..|.###...|##.####|##..##.|.###.##',
  '/': '.....##|.....##|....##.|...##..|..##...|.##....|##.....',
  '=': '.......|.......|######.|.......|######.|.......|.......',
  '·': '.......|.......|.......|..##...|..##...|.......|.......',
  '_': '.......|.......|.......|.......|.......|.......|######.',
  '♥': '.##.##.|#######|#######|#######|.#####.|..###..|...#...',
  '†': '..##...|..##...|..###..|#.#####|#.#####|#.#####|#.####.',
  '☺': '.#####.|#######|##.#.##|#######|#.###.#|##...##|.#####.',
};
const GLYPH = {};
for (const [ch, src] of Object.entries(FONT)) {
  const rows = src.split('|');
  if (rows.length < 7 || rows.length > 8 || rows.some((r) => r.length !== 7)) throw new Error(`bad glyph ${ch}`);
  GLYPH[ch] = rows.map((r) => [...r].map((c) => (c === '#' ? 1 : 0)));
}

// ------------------------------------------------------------------ helpers
const len = (s) => [...s].length;
const n2 = (n) => +n.toFixed(3);
const rect = (x, y, w, h, fill, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"${extra}/>`;

// Bitmap (rows of 0/1) -> [x, y, w, h] rectangles, runs merged across then down.
function bmRects(bm) {
  const rects = [];
  let open = [];
  bm.forEach((row, y) => {
    const next = [];
    for (let x = 0; x < row.length;) {
      if (!row[x]) { x++; continue; }
      const x0 = x;
      while (x < row.length && row[x]) x++;
      const o = open.find((r) => r[0] === x0 && r[2] === x - x0 && r[1] + r[3] === y);
      if (o) { o[3]++; next.push(o); } else { const r = [x0, y, x - x0, 1]; rects.push(r); next.push(r); }
    }
    open = next;
  });
  return rects;
}
const rectsD = (rs, s = 1, ox = 0, oy = 0) => rs.map(([x, y, w, h]) => `M${n2(x * s + ox)} ${n2(y * s + oy)}h${n2(w * s)}v${n2(h * s)}h${n2(-w * s)}z`).join('');

// Glyphs become <path id> in <defs>, one per character actually used.
const glyphIds = new Map();
function gid(ch) {
  if (!GLYPH[ch]) throw new Error(`no glyph for ${JSON.stringify(ch)}`);
  if (!glyphIds.has(ch)) glyphIds.set(ch, `g${glyphIds.size.toString(36)}`);
  return glyphIds.get(ch);
}
function uses(str) {
  let out = '';
  [...str].forEach((ch, i) => {
    if (ch === ' ') return;
    out += `<use href="#${gid(ch)}"${i ? ` x="${i * 8}"` : ''}/>`;
  });
  return out;
}
// One run of text at raster pixel (x, y), one colour class, scale s.
function txt(x, y, str, cls, s = 1) {
  return `<g${cls ? ` class="${cls}"` : ''} transform="translate(${n2(x)} ${n2(y)})${s === 1 ? '' : ` scale(${s})`}">${uses(str)}</g>`;
}
const tw = (str, s = 1) => len(str) * 8 * s - s;               // ink width of a run
const cx = (str, s = 1) => Math.round((RW - tw(str, s)) / 2);
const ctr = (y, str, cls, s = 1) => txt(cx(str, s), y, str, cls, s);
const rgt = (xr, y, str, cls, s = 1) => txt(xr - tw(str, s), y, str, cls, s);
const col = (c) => c * 8;                                        // raster x of a text column

// Pictures from a character map and a palette (each char one pixel).
function picture(map, pal, scale = 1) {
  const rows = Array.isArray(map) ? map : map.split('|');
  let out = '';
  for (const [k, fill] of Object.entries(pal)) {
    const bm = rows.map((r) => [...r].map((c) => (c === k ? 1 : 0)));
    const d = rectsD(bmRects(bm), scale);
    if (d) out += `<path fill="${fill}" d="${d}"/>`;
  }
  return { svg: out, w: rows[0].length * scale, h: rows.length * scale };
}

// ------------------------------------------------------------------ CSS and timing
const LOOP = 30;                               // seconds; every period below divides it
const SCENE = { title: [0, 7], kinds: [7, 12], demo: [12, 21.5], scores: [21.5, 28], flip: [28, 30] };
const pct = (sec) => `${n2((sec / LOOP) * 100)}%`;
const css = [];
const anim = (name, dur, extra = '') => `animation:${name} ${dur}s step-end infinite${extra}`;
// Keyframes from [seconds, declarations, timing function to the next stop] on the loop.
function keyframes(name, stops) {
  const body = stops.map(([t, decl, ease]) => `${pct(t)}{${decl}${ease ? `;animation-timing-function:${ease}` : ''}}`).join('');
  css.push(`@keyframes ${name}{${body}}`);
}
// A group that is visible only between `a` and `b` seconds of the loop.
const windows = new Map();
function during(a, b) {
  const key = `${a}-${b}`;
  if (!windows.has(key)) {
    const cls = `q${windows.size.toString(36)}`;
    windows.set(key, cls);
    const stops = a === 0 ? [[0, 'opacity:1'], [b, 'opacity:0']] : [[0, 'opacity:0'], [a, 'opacity:1']];
    if (a !== 0 && b < LOOP) stops.push([b, 'opacity:0']);
    keyframes(cls, stops);
    css.push(`.${cls}{${a === 0 ? '' : 'opacity:0;'}${anim(cls, LOOP)}}`);
  }
  return windows.get(key);
}
const show = (a, b, inner) => `<g class="${during(a, b)}">${inner}</g>`;

const fills = { ...K, ...UI };
for (const [k, v] of Object.entries(fills)) css.push(`.${k}{fill:${v}}`);
css.push('@keyframes bl{0%{opacity:1}50%{opacity:0}}.bl{animation:bl 1s step-end infinite}.bl2{animation:bl 2s step-end infinite}');

// ------------------------------------------------------------------ the logo: MediaLog in log lines
// Each letter is a stack of horizontal bands, one band per line of the log, each band a kind
// colour. Columns are 2 raster pixels wide; a band is 5 pixels of colour and 1 pixel of gap.
const LOGO = {
  M: { w: 20, rows: { 0: '#####..........#####', 1: '######........######', 2: '#######......#######', 3: '#####.###..###.#####', 4: '#####..######..#####', 5: '#####...####...#####', 6: '#####....##....#####', 7: '#####..........#####' } },
  e: { w: 15, rows: { 3: '...#########...', 4: '#####.....#####', 5: '###############', 6: '#####..........', 7: '...############' } },
  d: { w: 15, rows: { 0: '..........#####', 1: '..........#####', 2: '..........#####', 3: '...############', 4: '#####.....#####', 5: '#####.....#####', 6: '#####.....#####', 7: '...############' } },
  i: { w: 5, rows: { 1: '#####', 3: '#####', 4: '#####', 5: '#####', 6: '#####', 7: '#####' } },
  a: { w: 15, rows: { 3: '...#########...', 4: '..........#####', 5: '...############', 6: '#####.....#####', 7: '...############' } },
  L: { w: 13, rows: { 0: '#####........', 1: '#####........', 2: '#####........', 3: '#####........', 4: '#####........', 5: '#####........', 6: '#####........', 7: '#############' } },
  o: { w: 15, rows: { 3: '...#########...', 4: '#####.....#####', 5: '#####.....#####', 6: '#####.....#####', 7: '...#########...' } },
  g: { w: 15, rows: { 3: '...############', 4: '#####.....#####', 5: '#####.....#####', 6: '#####.....#####', 7: '...############', 8: '..........#####', 9: '...#########...' } },
};
const LC = 2, BAND = 6, INK = 5, LGAP = 2;      // column width, band pitch, band ink, letter gap (columns)
function logoBands(word) {
  const bands = Array.from({ length: 10 }, () => []);   // per band: [x0, x1) runs in pixels
  let c = 0;
  for (const ch of word) {
    const g = LOGO[ch];
    for (const [r, s] of Object.entries(g.rows)) {
      for (let x = 0; x < s.length;) {
        if (s[x] !== '#') { x++; continue; }
        const x0 = x;
        while (x < s.length && s[x] === '#') x++;
        bands[r].push([(c + x0) * LC, (c + x) * LC]);
      }
    }
    c += g.w + LGAP;
  }
  return { bands, width: (c - LGAP) * LC };
}

// ------------------------------------------------------------------ sprites
// MediaLog's own mark, redrawn for the tube: an open book, a play triangle on the left page,
// a pencil writing on the right page, the cover underneath. 23 x 17, drawn at 2x.
const MARK = [
  '.......................',
  '.WWWWW...........WWWWW.',
  '.WWWWWWWW.....WWWWWWWW.',
  '.WWWWWWWWWWsWWWWWWWWWW.',
  '.WWWWWWWWWWsWWWWWWWWWW.',
  '.WWWnWWWWWWsWWllllllWnn',
  '.WWWnnWWWWWsWWWWWWWnnn.',
  '.WWWnnnWWWWsWWllllnnnW.',
  '.WWWnnnnWWWsWWWWWnnnWW.',
  '.WWWnnnWWWWsWWllnnnWWW.',
  '.WWWnnWWWWWsWWWnnnWWWW.',
  '.WWWnWWWWWWsWWnnnWWWWW.',
  '.WWWWWWWWWWsWWnnWWWWWW.',
  '.WWWWWWWWWWsWWWWWWWWWW.',
  '.ggggggggggggggggggggg.',
  'ccccccccccccccccccccccc',
  '.cccccccccc.cccccccccc.',
];
const MARK_PAL = { W: '#f4f6ff', n: NAVY, g: '#aab2cc', s: '#8590b0', c: '#5d6a99', l: '#aab2cc' };

// The same book on two legs: the demo's player. 16 wide; feet on the bottom row.
const BOOK = [
  '.WWW........WWW.',
  '.WWWWWW..WWWWWW.',
  '.WWWWWWggWWWWWn.',
  '.WWnWWWggWWWWnn.',
  '.WWnnWWggWWWnnW.',
  '.WWnnnWggWWnnWW.',
  '.WWnnWWggWnnWWW.',
  '.WWnWWWggWnWWWW.',
  '.WWWWWWggWWWWWW.',
  '.gggggggggggggg.',
  'cccccccccccccccc',
  '.cccccc..cccccc.',
];
const LEGS_A = ['.....w....w.....', '....w......w....', '...rr......rr...'];
const LEGS_B = ['......w..w......', '......w..w......', '.....rr..rr.....'];
const LEGS_S = ['.....w....w.....', '.....w....w.....', '....rr....rr....'];
const BOOK_PAL = { W: '#f4f6ff', n: NAVY, g: '#9aa3c0', c: '#5d6a99', w: '#d9deea', r: '#ff4d4d' };

// Kind icons, 12 x 12, one colour each (TV shows and anime share blue, comics and manga magenta).
const ICON = {
  movie: ['.........XXX', '......XXX.XX', '...XXX.XXX..', 'XXX.XXX.....', 'XXXX........', 'XXXXXXXXXXXX', 'X..XX..XX..X', 'XXXXXXXXXXXX', 'X..........X', 'X..........X', 'X..........X', 'XXXXXXXXXXXX'],
  tv: ['..X......X..', '...X....X...', '....X..X....', 'XXXXXXXXXXXX', 'X........XXX', 'X........X.X', 'X........XXX', 'X........X.X', 'X........XXX', 'XXXXXXXXXXXX', '.XX......XX.', '............'],
  anime: ['....X.......', '....X.......', '...XXX......', '..XXXXX.....', 'XXXXXXXXX...', '..XXXXX.....', '...XXX...X..', '....X....X..', '....X..XXXXX', '.........X..', '.........X..', '............'],
  book: ['............', '.XXX....XXX.', 'X...XX.X...X', 'X.....X....X', 'X.XX..X.XX.X', 'X.....X....X', 'X.XX..X.XX.X', 'X.....X....X', 'X.XX..X.XX.X', 'XXXXX.X.XXXX', '.....XXX....', '............'],
  comic: ['.....XXXXXX.', '....XXXXXX..', '...XXXXXX...', '..XXXXXX....', '.XXXXXXXXXX.', '......XXXX..', '.....XXXX...', '....XXXX....', '...XXX......', '..XXX.......', '.XX.........', 'X...........'],
  manga: ['.XXXXXXXXXX.', '.X........XX', '.X.X.X.X..XX', '.X.X.X.X..XX', '.X.X.X.X..XX', '.X.X.X....XX', '.X.X.X....XX', '.X...X....XX', '.X........XX', '.XXXXXXXXXXX', '..XXXXXXXXXX', '............'],
  game: ['............', '............', '.XXXXXXXXXX.', 'XXX.XXXXX.XX', 'XX...XXX.X.X', 'XXX.XXXXX.XX', 'XXXXXXXXXXXX', 'XXXX....XXXX', 'XXX......XXX', '.X........X.', '............', '............'],
  pod: ['....XXXX....', '...XXXXXX...', '...X.XX.X...', '...XXXXXX...', '...X.XX.X...', '.X.XXXXXX.X.', '.X..XXXX..X.', '..X......X..', '...XXXXXX...', '.....XX.....', '...XXXXXX...', '............'],
  music: ['...XXXXXX...', '..XXXXXXXX..', '.XX.XXXXXXX.', 'XX.XXXXXXXXX', 'XX.XX..XXXXX', 'XXXX....XXXX', 'XXXX....XXXX', 'XXXXX..XX.XX', 'XXXXXXXXX.XX', '.XXXXXXX.XX.', '..XXXXXXXX..', '...XXXXXX...'],
  video: ['............', '............', 'XXXXXXXX....', 'X......X..XX', 'X.XX...X.XXX', 'X......XXXXX', 'X......XXXXX', 'X......X.XXX', 'X......X..XX', 'XXXXXXXX....', '............', '............'],
  mystery: ['.X.X.X.X.X..', 'X.........X.', '...XXXXX....', 'X.XX...XX.X.', '.......XX...', 'X....XXX..X.', '....XX......', 'X.........X.', '....XX......', 'X.........X.', '.X.X.X.X.X..', '............'],
};
const ICON_KIND = { movie: 'movie', tv: 'tv', anime: 'tv', book: 'book', comic: 'comic', manga: 'comic', game: 'game', pod: 'pod', music: 'music', video: 'video', mystery: 'w' };

const defs = [];
// Shared pictures go in <defs> once and are placed with <use>.
for (const [k, map] of Object.entries(ICON)) defs.push(`<path id="i_${k}" d="${rectsD(bmRects(map.map((r) => [...r].map((c) => (c === 'X' ? 1 : 0)))))}"/>`);
const icon = (k, x, y, cls = ICON_KIND[k]) => `<use href="#i_${k}" class="${cls}" x="${x}" y="${y}"/>`;
defs.push(`<g id="s_mark">${picture(MARK, MARK_PAL, 2).svg}</g>`);
defs.push(`<g id="s_walkA">${picture([...BOOK, ...LEGS_A], BOOK_PAL).svg}</g>`);
defs.push(`<g id="s_walkB">${picture([...BOOK, ...LEGS_B], BOOK_PAL).svg}</g>`);
defs.push(`<g id="s_stand">${picture([...BOOK, ...LEGS_S], BOOK_PAL).svg}</g>`);
const BOOK_H = BOOK.length + LEGS_A.length;     // 15

// ------------------------------------------------------------------ the sample log
// Everything here is invented, apart from one public-domain classic (Proust, who would
// understand not knowing exactly when). Dates are YYYYMMDD, which is also how an arcade
// would write them: a month with no day is padded with zeros, and "sometime in" is padded
// with question marks. Initials, as cabinets insist.
const LOG = [
  { score: '20261009', who: 'YOU', what: 'PARKING 2: REVERSE', kind: 'movie', how: '♥', date: [2026, 10, 9], label: '♥ 9 OCT' },
  { score: '20260900', who: 'KIT', what: 'VERY SMALL HORSES', kind: 'tv', how: '†' },
  { score: '20260412', who: 'BEA', what: 'FITTED SHEETS, PART 4', kind: 'video', how: '†', date: [2026, 4, 12], label: '† 12 APR', icon: 'video' },
  { score: '20250300', who: 'OLU', what: 'SALARYMAN BEEKEEPER', kind: 'comic', how: '☺', date: [2025, 3, 0], label: '☺ MAR: MORE BEES', icon: 'manga' },
  { score: '20220200', who: 'ROZ', what: 'LIGHTHOUSE KEEPER 2', kind: 'game', how: '☺', date: [2022, 2, 0], label: '☺ FEB: TOO MANY STAIRS' },
  { score: '202?????', who: 'TAM', what: 'WAITING FOR THE KETTLE', kind: 'pod', how: '†', block: 2020 },
  { score: '20170813', who: 'IDA', what: 'DAMP SEASON', kind: 'music', how: '♥', date: [2017, 8, 13], label: '♥ 13 AUG' },
  { score: '201?????', who: 'YOU', what: 'IN SEARCH OF LOST TIME', kind: 'book', how: '♥', block: 2015 },
];

// ------------------------------------------------------------------ persistent rows
// Score header across the top, prompt and credit counter along the bottom.
const always = [];
always.push(txt(8, 4, '1UP', 'movie') + txt(40, 4, 'ME', 'w'));
always.push(ctr(4, 'HI-SCORE', 'w'));
always.push(rgt(RW - 8, 4, 'FRIENDS', 'w') + rgt(RW - 72, 4, '2UP', 'tv'));
always.push(ctr(13, '20261009', 'w'));
always.push(rgt(RW - 8, 13, '20260900', 'g'));
always.push(`<g class="bl">${txt(8, 172, 'WHAT DID YOU PLAY?', 'w')}</g>`);
always.push(rgt(RW - 8, 172, 'STAYED FOR THE CREDITS', 'g'));
// 1UP shows the last game until the demo starts a new one and walks it up the timeline.
const oneUp = [];   // [seconds, value], filled in by the demo

// ------------------------------------------------------------------ scene: title
const sTitle = [];
{
  const { bands, width } = logoBands('MediaLog');
  const markW = MARK[0].length * 2, gap = 12;
  const x0 = Math.round((RW - (markW + gap + width)) / 2), y0 = 26;
  const lx = x0 + markW + gap;
  // The hard offset navy shadow MediaLog puts under its search box, here under the logo.
  let shadow = '';
  bands.forEach((runs, r) => runs.forEach(([a, b]) => { shadow += `M${a + 3} ${r * BAND + 3}h${b - a}v${BAND}h${a - b}z`; }));
  sTitle.push(`<path fill="#26356e" transform="translate(${lx} ${y0})" d="${shadow}"/>`);
  bands.forEach((runs, r) => {
    if (!runs.length) return;
    const d = runs.map(([a, b]) => `M${a} ${r * BAND}h${b - a}v${INK}h${a - b}z`).join('');
    sTitle.push(`<path fill="${BANDS[r % 8]}" transform="translate(${lx} ${y0})" d="${d}"/>`);
    // A shine runs down the lines twice per title card, one band at a time.
    sTitle.push(`<path class="sh${r}" fill="#fff" transform="translate(${lx} ${y0})" d="${d}"/>`);
    const t1 = 1.2 + r * 0.06, t2 = 4.6 + r * 0.06;
    keyframes(`sh${r}`, [[0, 'opacity:0'], [t1, 'opacity:.85'], [t1 + 0.12, 'opacity:0'], [t2, 'opacity:.85'], [t2 + 0.12, 'opacity:0']]);
    css.push(`.sh${r}{opacity:0;${anim(`sh${r}`, LOOP)}}`);
  });
  sTitle.push(`<use href="#s_mark" x="${x0}" y="${y0 + 6}"/>`);

  // The verb that cannot decide: a rolling counter, like a score.
  sTitle.push(`<g class="roll">${ctr(90, "EVERYTHING YOU'VE", 'w')}`);
  const VERBS = [['WATCHED,', 'movie'], ['READ,', 'book'], ['PLAYED,', 'game'], ['LISTENED TO,', 'music']];
  const VY = 101, PITCH = 18;
  defs.push(`<clipPath id="verbclip"><rect x="0" y="${VY - 1}" width="${RW}" height="${16}"/></clipPath>`);
  let strip = '';
  VERBS.forEach(([v, c], i) => { strip += ctr(VY + i * PITCH, v, c, 2); });
  sTitle.push(`<g clip-path="url(#verbclip)"><g class="vr">${strip}</g></g>`);
  const hold = [0, 1.7, 3.4, 5.1];
  const stops = [[0, 'transform:translateY(0)']];
  hold.slice(1).forEach((t, i) => {
    stops.push([t, `transform:translateY(${-i * PITCH}px)`, 'steps(3,end)']);
    stops.push([t + 0.18, `transform:translateY(${-(i + 1) * PITCH}px)`]);
  });
  stops.push([SCENE.title[1], 'transform:translateY(0)']);
  keyframes('vr', stops);
  css.push(`.vr{${anim('vr', LOOP)}}`);
  sTitle.push(`${ctr(121, 'ON ONE TIMELINE.', 'w')}</g>`);
  // Reduced motion gets the whole sentence at once instead of the roller.
  let line = '', x = cx('WATCHED, READ, PLAYED, LISTENED TO,');
  for (const [v, c] of VERBS) { line += txt(x, 104, v, c); x += (len(v) + 1) * 8; }
  sTitle.push(`<g class="rm">${ctr(90, "EVERYTHING YOU'VE", 'w')}${line}${ctr(118, 'ON ONE TIMELINE.', 'w')}</g>`);
  css.push('.rm{display:none}');

  sTitle.push(ctr(136, 'A MEDIA DIARY YOU SHARE.', 'g'));
  // The kinds parade along the bottom, each in its colour, bobbing one after another.
  const PARADE = ['movie', 'tv', 'anime', 'book', 'comic', 'manga', 'game', 'pod', 'music', 'video'];
  const step = 22, px0 = Math.round((RW - (PARADE.length - 1) * step - 12) / 2);
  PARADE.forEach((k, i) => {
    css.push(`.pw${i}{animation:pw 1s step-end ${n2(i * 0.1 - 1)}s infinite}`);
    sTitle.push(`<g class="pw${i}">${icon(k, px0 + i * step, 151)}</g>`);
  });
  css.push('@keyframes pw{0%{transform:translateY(0)}10%{transform:translateY(-2px)}20%{transform:translateY(0)}}');
}

// ------------------------------------------------------------------ scene: how to play
const sKinds = [];
{
  const [a] = SCENE.kinds;
  sKinds.push(ctr(24, '- HOW TO PLAY -', 'w'));
  sKinds.push(ctr(37, 'LOG A FILM, A BOOK, A SHOW, A GAME, AN ALBUM', 'g'));
  sKinds.push(ctr(47, 'OR A PODCAST: WHEN, AND HOW IT WAS.', 'g'));
  sKinds.push(ctr(62, 'EACH KIND HAS ITS COLOUR', 'w'));
  const LEG = [
    ['movie', 'MOVIES'], ['tv', 'TV SHOWS'], ['anime', 'ANIME'], ['book', 'BOOKS'], ['comic', 'COMICS'],
    ['manga', 'MANGA'], ['game', 'GAMES'], ['pod', 'PODCASTS'], ['music', 'MUSIC'], ['video', 'VIDEOS'],
  ];
  LEG.forEach(([k, name], i) => {
    const c = Math.floor(i / 5), r = i % 5;
    const x = 52 + c * 152, y = 76 + r * 14;
    sKinds.push(show(a + 0.5 + i * 0.22, SCENE.kinds[1], icon(k, x, y) + txt(x + 18, y + 3, '=', 'w') + txt(x + 34, y + 3, name, ICON_KIND[k])));
  });
  sKinds.push(show(a + 3.0, SCENE.kinds[1], icon('mystery', 92, 148) + txt(110, 151, '= SOMETIME IN', 'w')));
  sKinds.push(show(a + 3.0, SCENE.kinds[1], `<g class="bl2">${txt(222, 151, '???', 'w')}</g>`));
}

// ------------------------------------------------------------------ scene: the demo
// The book walks the shared timeline five years to a screen. Dated entries hover over their
// month; "sometime in" entries can only be placed in their block, so they span all of it.
const sDemo = [];
{
  const [D0] = SCENE.demo;
  const V = 110;                            // walking speed, pixels a second
  const GROUND = 136, YEAR = 72, X0 = 4;    // a year is 72 pixels, a month 6
  const xOf = (y0, [y, m]) => X0 + (y - y0) * YEAR + (m - 1) * 6 + 3;
  const STAGES = [
    { y0: 2015, t0: D0, t1: D0 + 3.5, stop: null, cap: 'A LOG, FIVE YEARS AT A TIME.' },
    { y0: 2020, t0: D0 + 3.5, t1: D0 + 7.0, stop: null, cap: 'A DAY, A MONTH, OR SOMETIME IN.' },
    { y0: 2025, t0: D0 + 7.0, t1: SCENE.demo[1], stop: 140, cap: 'HOW WAS IT? ♥ † OR A VERDICT ☺' },
  ];
  let tStop = 0;
  const xStops = [[0, 'transform:translateX(-16px)']];
  const yStops = [[0, 'transform:translateY(0)']];
  const hops = [];                          // [tStart, height, duration]
  const at = (st, centreX) => st.t0 + (centreX - 8 + 16) / V;   // when the book's centre reaches x

  STAGES.forEach((st, si) => {
    const g = [];
    const yEnd = st.y0 + 4;
    g.push(txt(8, 24, `STAGE ${st.y0}-${yEnd}`, 'w'));
    g.push(`<g class="bl2">${rgt(RW - 8, 24, 'DEMO PLAY', 'g')}</g>`);
    g.push(ctr(38, st.cap, 'g'));
    // The ground is the timeline: a rail, a tick a month, a taller tick a year.
    const solidTo = st.stop ? X0 + YEAR + 10 * 6 : X0 + 5 * YEAR;
    g.push(rect(X0, GROUND, solidTo - X0, 2, '#c9cfe0'));
    let ticks = '';
    for (let x = X0; x <= solidTo; x += 6) ticks += `M${x} ${GROUND + 2}h1v${(x - X0) % YEAR ? 1 : 4}h-1z`;
    g.push(`<path fill="#8b93ad" d="${ticks}"/>`);
    if (st.stop) {
      let dash = '';
      for (let x = solidTo + 3; x < X0 + 5 * YEAR; x += 6) dash += `M${x} ${GROUND}h3v2h-3z`;
      g.push(`<path fill="#3a4160" d="${dash}"/>`);
      const later = `${st.y0 + 2}-${yEnd}: NOT YET.`;
      g.push(txt(Math.round(solidTo + (X0 + 5 * YEAR - solidTo - tw(later)) / 2), 114, later, 'd'));
    }
    for (let k = 0; k < 5; k++) g.push(txt(X0 + k * YEAR + (YEAR - tw(String(st.y0 + k))) / 2, GROUND + 8, String(st.y0 + k), st.stop && k >= 2 ? 'd' : 'g'));
    // Faint year lines rising from the ground: the drawer's dividers.
    const lines = [1, 2, 3, 4].map((k) => X0 + k * YEAR).filter((x) => x < solidTo);
    if (lines.length) g.unshift(`<path stroke="#262e4d" stroke-dasharray="2 2" d="${lines.map((x) => `M${x + 0.5} 114V${GROUND}`).join('')}"/>`);

    // "Sometime in": a bar across the whole block, printed with its title. The book bumps it.
    const vague = LOG.find((e) => e.block === st.y0);
    if (vague) {
      const bx = X0, bw = 5 * YEAR, by = 82;
      const hitX = st.y0 === 2015 ? 112 : 84;
      const tJump = at(st, hitX), tHit = tJump + 0.3;
      hops.push([tJump, 30, 0.6]);
      const name = `bump${si}`;
      keyframes(name, [[0, 'transform:translateY(0)'], [tHit, 'transform:translateY(-2px)'], [tHit + 0.12, 'transform:translateY(0)']]);
      css.push(`.${name}{${anim(name, LOOP)}}`);
      const fill = K[vague.kind];
      const title = vague.what;
      g.push(`<g class="${name}">${rect(bx, by, bw, 11, fill)}${rect(bx, by, bw, 1, '#fff', ' opacity=".55"')}${rect(bx, by + 10, bw, 1, '#000', ' opacity=".35"')}`
        + [8, 12, bw - 14, bw - 10].map((x) => rect(bx + x, by + 1, 1, 9, '#000', ' opacity=".3"')).join('')
        + txt(bx + Math.round((bw - tw(title)) / 2), by + 2, title, 'k') + '</g>');
      g.push(show(tHit, st.t1, ctr(70, `SOMETIME IN ${st.y0}-${yEnd}`, vague.kind)));
      oneUp.push([tHit, vague.score]);
    }
    // Dated entries hover over their month; the book hops up to log them.
    LOG.filter((e) => e.date && e.date[0] >= st.y0 && e.date[0] <= yEnd).sort((p, q) => xOf(st.y0, p.date) - xOf(st.y0, q.date)).forEach((e, i) => {
      const x = xOf(st.y0, e.date);
      const tJump = at(st, x) - 0.16, tHit = tJump + 0.16;
      hops.push([tJump, 13, 0.32]);
      g.push(show(st.t0, tHit, `<g class="bob">${icon(e.icon || e.kind, x - 6, 103)}</g>`));
      // Each logged entry leaves a caption: its title in its kind's colour, then how and when.
      // The last stage holds three entries close together, so their captions stack in tiers.
      const ly = st.stop ? 50 + i * 22 : 97;
      const place = (s) => Math.max(8, Math.min(RW - 8 - tw(s), Math.round(x - tw(s) / 2)));
      g.push(show(tHit, st.t1, txt(place(e.what), ly, e.what, e.kind) + txt(place(e.label), ly + 10, e.label, 'w')));
      oneUp.push([tHit, e.score]);
    });
    sDemo.push(show(st.t0, st.t1, g.join('')));

    // The walk: from off the left edge to off the right edge, or to today.
    const xEnd = st.stop ? st.stop - 8 : RW;
    const tEnd = st.t0 + (xEnd + 16) / V;
    if (st.stop) tStop = tEnd;
    xStops.push([st.t0, 'transform:translateX(-16px)', `steps(${xEnd + 16},end)`]);
    xStops.push([tEnd, `transform:translateX(${xEnd}px)`]);
  });
  css.push(`@keyframes bob{0%{transform:translateY(0)}50%{transform:translateY(-1px)}}.bob{animation:bob .5s step-end infinite}`);
  // Hops: a parabola sampled every 40 ms, rounded to whole pixels.
  hops.sort((p, q) => p[0] - q[0]).forEach(([t, h, d]) => {
    const n = Math.round(d / 0.04);
    for (let k = 0; k <= n; k++) {
      const u = k / n;
      yStops.push([t + u * d, `transform:translateY(${-Math.round(4 * h * u * (1 - u))}px)`]);
    }
  });
  keyframes('wx', xStops);
  keyframes('wy', yStops.sort((p, q) => p[0] - q[0]));
  css.push(`.wx{${anim('wx', LOOP)}}.wy{${anim('wy', LOOP)}}`);
  css.push('@keyframes wf{0%{opacity:1}50%{opacity:0}}.wa{animation:wf .25s step-end infinite}.wb{animation:wf .25s step-end -.125s infinite}');
  const walking = `<g class="wa"><use href="#s_walkA" y="${GROUND - BOOK_H}"/></g><g class="wb"><use href="#s_walkB" y="${GROUND - BOOK_H}"/></g>`;
  sDemo.push(`<g class="wx"><g class="wy">${show(SCENE.demo[0], tStop, walking)}${show(tStop, SCENE.demo[1], `<use href="#s_stand" y="${GROUND - BOOK_H}"/>`)}</g></g>`);
}

// ------------------------------------------------------------------ scene: high scores
const sScores = [];
{
  const [a, b] = SCENE.scores;
  css.push(`@keyframes hi{0%{fill:${K.movie}}50%{fill:#fff}}.hi{fill:${K.movie};animation:hi 1s step-end infinite}`);
  sScores.push(ctr(24, '- HIGH SCORES -', 'w'));
  sScores.push(ctr(35, 'FRIENDS & ME · BY DATE', 'g'));
  sScores.push(txt(col(1), 49, 'RANK', 'w') + txt(col(6), 49, 'SCORE', 'w') + txt(col(15), 49, 'NAME', 'w') + txt(col(20), 49, 'WHAT', 'w'));
  const RANKS = ['1ST', '2ND', '3RD', '4TH', '5TH', '6TH', '7TH', '8TH'];
  LOG.forEach((e, i) => {
    const y = 61 + i * 11;
    const c = i === 0 ? 'hi' : e.kind;
    const row = txt(col(1), y, RANKS[i], c) + txt(col(6), y, e.score, c) + txt(col(15), y, e.who, c)
      + txt(col(20), y, e.what, c) + txt(col(43), y, e.how, c);
    sScores.push(show(a + 0.4 + i * 0.3, b, row));
  });
  sScores.push(show(a + 3.2, b, ctr(154, 'RANKED BY DATE, NOT BY TASTE.', 'w')));
}

// ------------------------------------------------------------------ scene: player 2
// On a cocktail table, player 2's turn turns the picture round to face them.
const sFlip = [];
{
  sFlip.push(ctr(56, '2UP', 'tv', 3));
  sFlip.push(ctr(92, 'FRIENDS, YOUR TURN.', 'w'));
  sFlip.push(ctr(108, 'THE TABLE TURNS.', 'g'));
}

// 1UP: the last game's score, then a new demo game that climbs the timeline.
{
  const [D0] = SCENE.demo;
  const steps = [[0, '20261009'], [D0, '00000000'], ...oneUp.sort((p, q) => p[0] - q[0])];
  // The final hit restores the last game's score, so the loop closes on the same value.
  steps.forEach(([t, v], i) => {
    const t1 = i + 1 < steps.length ? steps[i + 1][0] : LOOP;
    always.push(show(t, t1, txt(8, 13, v, 'g')));
  });
}

// ------------------------------------------------------------------ the tube
const screen = [];
{
  const cxs = SX + SW / 2, cys = SY + SH / 2;
  keyframes('flip', [[0, 'transform:rotate(0deg)'], [SCENE.flip[0], 'transform:rotate(180deg)']]);
  css.push(`.flip{${anim('flip', LOOP)}}`);
  defs.push(`<clipPath id="tube"><rect x="${SX}" y="${SY}" width="${SW}" height="${SH}" rx="16"/></clipPath>`);
  defs.push(`<pattern id="scan" width="4" height="${PX}" patternUnits="userSpaceOnUse"><rect y="${PX - 0.7}" width="4" height="0.7" fill="#000" opacity=".35"/></pattern>`);
  defs.push(`<radialGradient id="vig" cx=".5" cy=".5" r=".75"><stop offset=".7" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></radialGradient>`);
  screen.push(rect(SX, SY, SW, SH, '#020308', ' rx="16"'));
  screen.push(`<g clip-path="url(#tube)"><g transform="translate(${cxs} ${cys})"><g class="flip"><g transform="translate(${SX - cxs} ${SY - cys}) scale(${PX})">`
    + always.join('')
    + show(...SCENE.title, sTitle.join(''))
    + show(...SCENE.kinds, sKinds.join(''))
    + show(...SCENE.demo, sDemo.join(''))
    + show(...SCENE.scores, sScores.join(''))
    + show(...SCENE.flip, sFlip.join(''))
    + `</g></g></g>${rect(SX, SY, SW, SH, 'url(#scan)')}${rect(SX, SY, SW, SH, 'url(#vig)')}</g>`);
}

// ------------------------------------------------------------------ the cocktail table
// Seen from above: a navy laminate top with a chrome edge, the tube under the glass, and a
// control panel at each end. Player 1 sits at the bottom; player 2 sits opposite, so their
// panel (and, on their turn, the picture) is upside down.
const TB = { x: 15, y: 10, w: 800, h: 496 };
const BZ = { x: SX - 18, y: SY - 14, w: SW + 36, h: SH + 28 };
const table = [];
{
  defs.push('<linearGradient id="lam" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#22305a"/><stop offset=".45" stop-color="#18223a"/><stop offset="1" stop-color="#121a2e"/></linearGradient>');
  defs.push('<pattern id="fleck" width="9" height="7" patternUnits="userSpaceOnUse"><rect x="1" y="2" width="1" height="1" fill="#fff" opacity=".05"/><rect x="6" y="5" width="1" height="1" fill="#000" opacity=".18"/><rect x="4" y="0" width="1" height="1" fill="#fff" opacity=".035"/></pattern>');
  defs.push('<linearGradient id="glass" x1="0" y1="0" x2="1" y2=".55"><stop offset="0" stop-color="#fff" stop-opacity=".10"/><stop offset=".22" stop-color="#fff" stop-opacity=".02"/><stop offset=".38" stop-color="#fff" stop-opacity="0"/><stop offset=".62" stop-color="#fff" stop-opacity="0"/><stop offset=".7" stop-color="#fff" stop-opacity=".05"/><stop offset=".74" stop-color="#fff" stop-opacity="0"/></linearGradient>');
  // MediaLog's hard offset navy shadow, under the whole table.
  table.push(rect(TB.x + 8, TB.y + 8, TB.w, TB.h, '#0b1020', ' rx="22"'));
  table.push(rect(TB.x, TB.y, TB.w, TB.h, 'url(#lam)', ' rx="22"'));
  table.push(rect(TB.x, TB.y, TB.w, TB.h, 'url(#fleck)', ' rx="22"'));
  table.push(`<rect x="${TB.x + 1.5}" y="${TB.y + 1.5}" width="${TB.w - 3}" height="${TB.h - 3}" rx="21" fill="none" stroke="#9aa6c4" stroke-width="3"/>`);
  table.push(`<rect x="${TB.x + 4}" y="${TB.y + 4}" width="${TB.w - 8}" height="${TB.h - 8}" rx="18" fill="none" stroke="#0b1020" stroke-width="1.5" opacity=".7"/>`);
  table.push(rect(BZ.x - 3, BZ.y - 3, BZ.w + 6, BZ.h + 6, '#0b1020', ' rx="23"'));
  table.push(rect(BZ.x, BZ.y, BZ.w, BZ.h, '#050608', ' rx="20"'));
}
const glassTop = `<rect x="${BZ.x}" y="${BZ.y}" width="${BZ.w}" height="${BZ.h}" rx="20" fill="url(#glass)"/>`;

// A control panel, drawn for player 1 and turned round for player 2.
function panel(label, sub) {
  const pw = 310, ph = 48;
  let o = rect(5, 5, pw, ph, '#0b1020', ' rx="9"');
  o += rect(0, 0, pw, ph, '#dfe4ea', ' rx="9"') + rect(0, 0, pw, 6, '#c6cdd8', ' rx="3"');
  o += `<rect x="1" y="1" width="${pw - 2}" height="${ph - 2}" rx="8" fill="none" stroke="${NAVY}" stroke-width="2"/>`;
  o += `<circle cx="40" cy="25" r="17" fill="#0b1020"/><circle cx="40" cy="25" r="15.5" fill="#2a3352"/><circle cx="40" cy="25" r="4" fill="#0b1020"/>`;
  o += `<path d="M40 25 L47 32" stroke="#000" stroke-width="5" opacity=".35" stroke-linecap="round"/><circle cx="46" cy="31" r="10" fill="#000" opacity=".3"/><circle cx="38" cy="22" r="11" fill="#e2333b"/><circle cx="38" cy="22" r="11" fill="none" stroke="#a51d24" stroke-width="1.5"/>`;
  o += `<circle cx="34.5" cy="18.5" r="4" fill="#ff9a9e"/><circle cx="33.5" cy="17.5" r="1.6" fill="#fff"/>`;
  const btn = (bx, glyph) => `<circle cx="${bx + 2}" cy="27" r="11" fill="#000" opacity=".25"/><circle cx="${bx}" cy="25" r="11" fill="${NAVY}"/><circle cx="${bx}" cy="24" r="9" fill="#f7f8fb"/>`
    + `<g transform="translate(${bx - 6.5} 17.5) scale(1.86)" fill="${NAVY}">${uses(glyph)}</g>`;
  o += btn(92, '♥') + btn(126, '†');
  o += `<g fill="${NAVY}" transform="translate(152 13) scale(1.5)">${uses(label)}</g>`;
  o += `<g fill="#5b6785" transform="translate(152 32)">${uses(sub)}</g>`;
  return { svg: o, w: pw, h: ph };
}
{
  const p1 = panel('1UP · ME', 'LOVED · LIKED');
  const p2 = panel('2UP · FRIENDS', 'LOVED · LIKED');
  const px = Math.round(W / 2 - p1.w / 2) - 4;
  table.push(`<g transform="translate(${px} ${TB.y + TB.h - 40})">${p1.svg}</g>`);
  table.push(`<g transform="translate(${px + p2.w} ${TB.y + 40}) rotate(180)">${p2.svg}</g>`);
}

// ------------------------------------------------------------------ on the table
// Watched, read, listened to: a remote, a paperback, headphones. Played: the table itself.
// Plus the tea. Ordinary vector shapes: only the tube is made of pixels.
const props = [];
{
  const shade = (svg, dx = 4, dy = 4) => `<g transform="translate(${dx} ${dy})" fill="#000" opacity=".35">${svg}</g>`;
  // Tea on a cork coaster, by player 1's left hand.
  {
    const x = 150, y = 482;
    props.push(`<circle cx="${x + 3}" cy="${y + 3}" r="21" fill="#000" opacity=".3"/><circle cx="${x}" cy="${y}" r="21" fill="#b98a5c"/><circle cx="${x}" cy="${y}" r="18.5" fill="none" stroke="#a27447" stroke-width="1"/>`);
    props.push(`<rect x="${x + 13}" y="${y - 5}" width="15" height="10" rx="5" fill="#000" opacity=".3" transform="translate(3 3)"/><rect x="${x + 13}" y="${y - 5}" width="15" height="10" rx="5" fill="#e9edf4"/><rect x="${x + 17}" y="${y - 2}" width="7" height="4" rx="2" fill="#b98a5c"/>`);
    props.push(`<circle cx="${x + 3}" cy="${y + 3}" r="15" fill="#000" opacity=".3"/><circle cx="${x}" cy="${y}" r="15" fill="#f4f6fa"/><circle cx="${x}" cy="${y}" r="12" fill="#8a5a2b"/><path d="M${x - 8} ${y - 6}a10 10 0 0 1 9 -4" fill="none" stroke="#c99a68" stroke-width="2" stroke-linecap="round"/>`);
  }
  // The TV remote, by player 1's right hand.
  {
    const x = 688, y = 482;
    const body = `<rect x="-38" y="-10" width="76" height="20" rx="9"/>`;
    props.push(`<g transform="translate(${x} ${y}) rotate(-9)">${shade(body, 3, 4)}<rect x="-38" y="-10" width="76" height="20" rx="9" fill="#2b303d"/><rect x="-36" y="-8" width="72" height="14" rx="7" fill="#383e4e"/>`
      + `<circle cx="-28" cy="-1" r="3.2" fill="#e2333b"/><circle cx="-12" cy="-1" r="5.5" fill="#596078"/><circle cx="-12" cy="-1" r="2" fill="#2b303d"/>`
      + [0, 7, 14, 21].map((dx) => `<rect x="${2 + dx}" y="-5" width="4" height="3" rx="1" fill="#8b93ad"/><rect x="${2 + dx}" y="1" width="4" height="3" rx="1" fill="#8b93ad"/>`).join('')
      + '</g>');
  }
  // Headphones on player 2's side, lying flat.
  {
    const x = 150, y = 35;
    const arc = 'M-27 8 C-30 -30 30 -30 27 8';
    let o = `<path d="${arc}" fill="none" stroke="#000" stroke-width="7" opacity=".3" transform="translate(3 3)"/>`;
    o += `<path d="${arc}" fill="none" stroke="#3a4157" stroke-width="7" stroke-linecap="round"/><path d="${arc}" fill="none" stroke="#7a83a3" stroke-width="1.5" stroke-linecap="round" transform="translate(0 -1.5)"/>`;
    for (const side of [-1, 1]) {
      const cup = `<rect x="-10" y="-13" width="20" height="26" rx="9"/>`;
      o += `<g transform="translate(${side * 28} 10) rotate(${side * 12})">`
        + `<g transform="translate(3 3)" fill="#000" opacity=".3">${cup}</g><g fill="#2b303d">${cup}</g>`
        + `<rect x="-7" y="-10" width="14" height="20" rx="7" fill="none" stroke="${K.music}" stroke-width="2.5"/><rect x="-4" y="-7" width="4" height="6" rx="2" fill="#fff" opacity=".25"/></g>`;
    }
    props.push(`<g transform="translate(${x} ${y})">${o}</g>`);
  }
  // A paperback on player 2's side, face up, so its title reads upside down from here.
  {
    const x = 690, y = 33;
    const body = `<rect x="-30" y="-19" width="60" height="38" rx="2"/>`;
    props.push(`<g transform="translate(${x} ${y}) rotate(172)">${shade(body, 3, -4)}<rect x="-30" y="-19" width="60" height="38" rx="2" fill="#f1ead8"/><rect x="-31" y="-20" width="60" height="38" rx="2" fill="#e09a1a"/>`
      + `<rect x="-31" y="-20" width="7" height="38" fill="#b8740c"/><rect x="-18" y="-13" width="38" height="4" fill="#fff4dc"/><rect x="-18" y="-6" width="28" height="3" fill="#fff4dc" opacity=".8"/>`
      + `<rect x="-18" y="8" width="16" height="2" fill="#7a4b06"/><path d="M14 18 l0 9 l3 -3 l3 3 l0 -9z" fill="${K.movie}"/></g>`);
  }
}

// ------------------------------------------------------------------ assemble
css.push('@media (prefers-reduced-motion:reduce){*{animation:none!important}.roll{display:none}.rm{display:inline}}');
const glyphDefs = [...glyphIds.entries()].map(([ch, id]) => `<path id="${id}" d="${rectsD(bmRects(GLYPH[ch]))}"/>`).join('');
const TITLE = 'MediaLog: an arcade cocktail table in attract mode';
const DESC = 'A cocktail-table arcade seen from above, with player 1 (1UP: ME) at the bottom and player 2 (2UP: FRIENDS) '
  + 'across the table, a mug of tea, a remote, headphones and a paperback beside the controls. Every score on the screen '
  + 'is a date. The attract loop hard-cuts between a title card (MediaLog in striped letters, one stripe per kind colour, '
  + "and EVERYTHING YOU'VE WATCHED, READ, PLAYED, LISTENED TO, ON ONE TIMELINE, with a rolling verb), a how-to-play card "
  + 'with the kinds and their colours, a demo where the MediaLog book walks the timeline five years to a screen, '
  + "a high-score table of friends' entries ranked by date, not by taste, and a turn for player 2 with the picture upside down. "
  + 'WHAT DID YOU PLAY? blinks along the bottom.';
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="t d">
<title id="t">${TITLE}</title>
<desc id="d">${DESC}</desc>
<style>${css.join('\n')}</style>
<defs>${glyphDefs}${defs.join('')}</defs>
${table.join('')}
${props.join('')}
${screen.join('')}
${glassTop}
</svg>
`;
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, svg);
console.log(`wrote ${path.relative(process.cwd(), OUT)} (${(svg.length / 1024).toFixed(1)} KB, ${glyphIds.size} glyphs)`);
