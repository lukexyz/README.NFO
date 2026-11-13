#!/usr/bin/env node
// Piano roll, editor form: README header generator for MediaLog.
//
//   node examples/medialog/src/07-piano-roll_opus_5.5.mjs
//
// Writes examples/medialog/assets/07-piano-roll_opus_5.5.svg.
// Plain Node, no dependencies, no clock and no Math.random: the same bytes every run.
//
// The style is the piano roll in its editor form (the family that runs from the Music
// Animation Machine to chip-music editors and black MIDI): a keyboard down the left
// edge, time running left to right, one flat bar per note, a strip of coloured pattern
// blocks above the roll with one row per channel, a ruler, and keys that light in the
// note's colour as the playhead strikes them. Nothing is copied from any real editor,
// and no real tune is transcribed: the "tune" is a picture.
//
// What the roll holds is a pretend diary, because a piano roll already is a timeline:
//   * Time runs in years. The song is in 5/4, one beat per year, so one bar is five
//     years: MediaLog's own "a log, five years at a time". One column is one month.
//   * The notes are entries, arranged (black-MIDI fashion) so that they spell MediaLog.
//     Each letter is one kind of media in that kind's colour: M the films, e the box
//     sets, d the books, i the comics, a the games, L the podcasts, o the albums, g the
//     videos. Eight letters, eight colours, one person going through phases.
//   * A note's length is how precisely you know when it happened, so the two entries
//     filed under "sometime in" are bass pedals held for an entire five-year bar.
//   * Velocity is how it was: tall for a heart, middling for a thumbs-up, and a little
//     face for a verdict in your own words.
//   * Ghost notes are what friends logged, the way an editor shows other channels faintly.
// As the playhead crosses a letter, its keys light, its notes flash, the channel header
// names the kind, the line at the top swaps its verb (watched, read, played, listened
// to), and the status bar reads out one entry. At NOW (10 Oct 2026) it stops, the line
// says all four verbs at once, and the status bar asks the home page's question.
//
// Lettering: a condensed monoline face for the UI, a heavy condensed wordmark echoing
// the app's own, and the MIDI-art letters in the roll. All are paths, never <text>.
// Motion is one 30 s CSS loop; prefers-reduced-motion shows that finale frame, still.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '07-piano-roll_opus_5.5';
const OUT = path.resolve(HERE, `../assets/${SLUG}.svg`);

// ------------------------------------------------------------------ palette
const C = {
  panel: '#0b0f18', chrome: '#121825', chromeLine: '#252d3f', inset: '#070a10',
  strip: '#0f131c', roll: '#161b25', rollBlack: '#11151d',
  ink: '#e8ecf4', dim: '#98a1b5', faint: '#5d6679', gold: '#ffd56b',
  wkey: '#e4e7ee', wkeyEdge: '#8f97a8', bkey: '#141822', keyInk: '#5f6676',
};
// MediaLog's kind colours, sampled from the app (#c23b3b, #2879b8, #a96d12, #b8327f,
// #5f8a14, #6c44bf, #0e8a73, a dark plum) and lifted for a dark roll, hue kept.
const KINDS = {
  movies: { label: 'MOVIES', one: 'MOVIE', col: '#ec5a51', verb: 'WATCHED' },
  tv: { label: 'TV SHOWS · ANIME', one: 'TV SHOW', col: '#3d9be3', verb: 'WATCHED' },
  books: { label: 'BOOKS', one: 'BOOK', col: '#e69d2c', verb: 'READ' },
  comics: { label: 'COMICS · MANGA', one: 'COMIC', col: '#e5509f', verb: 'READ' },
  games: { label: 'GAMES', one: 'GAME', col: '#91c63b', verb: 'PLAYED' },
  podcasts: { label: 'PODCASTS', one: 'PODCAST', col: '#9a72f0', verb: 'LISTENED TO' },
  music: { label: 'MUSIC', one: 'MUSIC', col: '#22c4a0', verb: 'LISTENED TO' },
  videos: { label: 'VIDEOS', one: 'VIDEO', col: '#c27ab4', verb: 'WATCHED' },
};
const KIND_ORDER = ['movies', 'tv', 'books', 'comics', 'games', 'podcasts', 'music', 'videos'];

// ------------------------------------------------------------------ helpers
const f = (n) => { const s = (Math.round(n * 100) / 100).toString(); return s === '-0' ? '0' : s; };
const pct = (fr) => `${+(Math.min(1, Math.max(0, fr)) * 100).toFixed(3)}%`;
function prng(seed) {                       // mulberry32: deterministic jitter
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = prng(20261010);

// ------------------------------------------------------------------ the UI face
// A condensed monoline with straight sides and small rounded corners. Cap height 10,
// y = 0 cap line, y = 10 baseline. [advance width, path].
const RO = (w) => `M1.9 0H${f(w - 1.9)}Q${w} 0 ${w} 1.9V8.1Q${w} 10 ${f(w - 1.9)} 10H1.9Q0 10 0 8.1V1.9Q0 0 1.9 0Z`;
const GLYPHS = {
  A: [4.8, 'M0 10V2.1Q0 0 2.1 0H2.7Q4.8 0 4.8 2.1V10M0 5.5H4.8'],
  B: [4.8, 'M0 10V0H3Q4.6 0 4.6 1.7V3.1Q4.6 4.8 3 4.8H0M3 4.8H3.1Q4.8 4.8 4.8 6.5V8.3Q4.8 10 3.1 10H0'],
  C: [4.6, 'M4.6 2Q4.6 0 2.6 0H2Q0 0 0 2V8Q0 10 2 10H2.6Q4.6 10 4.6 8'],
  D: [4.8, 'M0 0V10H2.8Q4.8 10 4.8 8V2Q4.8 0 2.8 0Z'],
  E: [4.2, 'M4.2 0H0V10H4.2M0 4.9H3.4'],
  F: [4.2, 'M4.2 0H0V10M0 4.9H3.4'],
  G: [4.8, 'M4.6 2Q4.6 0 2.6 0H2Q0 0 0 2V8Q0 10 2 10H2.8Q4.8 10 4.8 8V5.3H2.6'],
  H: [4.8, 'M0 0V10M4.8 0V10M0 4.9H4.8'],
  I: [1.2, 'M0.6 0V10'],                    // side bearings, so I never fuses with M, N or H
  J: [3.8, 'M3.8 0V8Q3.8 10 1.9 10Q0 10 0 8'],
  K: [4.7, 'M0 0V10M4.5 0L0 6.1M1.7 4.2L4.7 10'],
  L: [4, 'M0 0V10H4'],
  M: [6.4, 'M0 10V0L3.2 6.6L6.4 0V10'],
  N: [4.8, 'M0 10V0L4.8 10V0'],
  O: [4.8, RO(4.8)],
  P: [4.6, 'M0 10V0H2.9Q4.6 0 4.6 1.8V3.6Q4.6 5.4 2.9 5.4H0'],
  Q: [4.8, `${RO(4.8)}M2.9 7.9L4.9 10.9`],
  R: [4.6, 'M0 10V0H2.9Q4.6 0 4.6 1.8V3.4Q4.6 5.2 2.9 5.2H0M2.5 5.2L4.6 10'],
  S: [4.6, 'M4.5 1.9Q4.4 0 2.4 0H2.1Q0.1 0 0.1 2V2.8Q0.1 4.4 1.9 4.8L2.8 5Q4.6 5.4 4.6 7.2V8Q4.6 10 2.5 10H2.1Q0.1 10 0 8.1'],
  T: [4.6, 'M0 0H4.6M2.3 0V10'],
  U: [4.8, 'M0 0V8Q0 10 2 10H2.8Q4.8 10 4.8 8V0'],
  V: [5, 'M0 0L2.5 10L5 0'],
  W: [7, 'M0 0L1.6 10L3.5 2.4L5.4 10L7 0'],
  X: [4.8, 'M0 0L4.8 10M4.8 0L0 10'],
  Y: [4.8, 'M0 0L2.4 5.4L4.8 0M2.4 5.4V10'],
  Z: [4.4, 'M0 0H4.4L0 10H4.4'],
  0: [4.4, RO(4.4)],
  1: [2.4, 'M0 1.8L2.4 0V10'],
  2: [4.4, 'M0.1 2Q0.2 0 2.2 0Q4.4 0 4.4 2.2V2.9Q4.4 4.1 3.4 5L0 8V10H4.4'],
  3: [4.4, 'M0 1.9Q0.2 0 2.2 0Q4.3 0 4.3 2.1V2.8Q4.3 4.7 2.3 4.7H1.4M2.3 4.7Q4.4 4.7 4.4 6.8V7.9Q4.4 10 2.2 10Q0.2 10 0 8.1'],
  4: [4.6, 'M3.5 10V0L0 7H4.6'],
  5: [4.4, 'M4.2 0H0.5L0.2 4.6Q0.9 4.1 2.2 4.1Q4.4 4.1 4.4 6.3V7.9Q4.4 10 2.2 10Q0.2 10 0 8.2'],
  6: [4.4, 'M4.2 1.6Q3.9 0 2.2 0Q0 0 0 2.2V7.9Q0 10 2.2 10Q4.4 10 4.4 7.9V6.4Q4.4 4.3 2.2 4.3Q0.4 4.3 0 5.6'],
  7: [4.2, 'M0 0H4.2L1.3 10'],
  8: [4.6, 'M2.3 4.7Q0.3 4.7 0.3 2.6V2.1Q0.3 0 2.3 0Q4.3 0 4.3 2.1V2.6Q4.3 4.7 2.3 4.7Q0 4.7 0 6.9V7.8Q0 10 2.3 10Q4.6 10 4.6 7.8V6.9Q4.6 4.7 2.3 4.7Z'],
  9: [4.4, 'M0.2 8.4Q0.5 10 2.2 10Q4.4 10 4.4 7.8V2.1Q4.4 0 2.2 0Q0 0 0 2.1V3.6Q0 5.7 2.2 5.7Q4 5.7 4.4 4.4'],
  '.': [0, 'M0 9.9V10'],
  ',': [0.8, 'M0.8 9.5L0 11.6'],
  ':': [0, 'M0 3.4V3.5M0 9.9V10'],
  '-': [3, 'M0 5.4H3'],
  '/': [3.6, 'M0 11L3.6 -1'],
  '·': [0, 'M0 5.2V5.3'],
  '+': [4.2, 'M0 5.2H4.2M2.1 3.1V7.3'],
  "'": [0, 'M0 0V2.6'],
  '(': [1.8, 'M1.8 -1Q0 2 0 5Q0 8 1.8 11'],
  ')': [1.8, 'M0 -1Q1.8 2 1.8 5Q1.8 8 0 11'],
  '!': [0, 'M0 0V6.8M0 9.9V10'],
  '?': [4.2, 'M0 2.1Q0.1 0 2.1 0Q4.2 0 4.2 2.1Q4.2 3.5 2.9 4.4Q2.1 5 2.1 6.5M2.1 9.9V10'],
  '&': [5.2, 'M5 10L1.4 4.7Q0.7 3.6 0.7 2.5Q0.7 0 2.5 0Q4.2 0 4.2 2.2Q4.2 3.6 2.6 4.8L1.4 5.7Q0 6.7 0 8Q0 10 2.2 10Q3.9 10 5.2 7.4'],
  '#': [4.6, 'M1.5 0.6L1 9.4M3.7 0.6L3.2 9.4M0 3.4H4.6M0 6.6H4.4'],
  '=': [4, 'M0 3.8H4M0 6.8H4'],
  '"': [1.6, 'M0 0V2.6M1.6 0V2.6'],
  '@': [6.6, 'M4.7 3.2V6.4Q4.7 7.3 5.5 7.3Q6.6 7.3 6.6 5.4V4Q6.6 0.6 3.3 0.6Q0 0.6 0 4V6.2Q0 9.6 3.4 9.6H5M4.7 4.6Q4.7 3.2 3.3 3.2Q1.9 3.2 1.9 4.6V5.2Q1.9 6.7 3.3 6.7Q4.7 6.7 4.7 5.2'],
};
const GAP = 1.9, SPACE = 3.2;
const glyphUse = new Map();
function gid(ch) {
  if (!GLYPHS[ch]) throw new Error(`no glyph for ${JSON.stringify(ch)}`);
  if (!glyphUse.has(ch)) glyphUse.set(ch, `g${glyphUse.size.toString(36)}`);
  return glyphUse.get(ch);
}

// ------------------------------------------------------------------ icons (10-unit box)
const ICON = {
  heart: 'M5 9.4L1.3 5.7Q-0.4 4 0.5 2.1Q1.5 0.2 3.4 0.6Q4.4 0.8 5 1.9Q5.6 0.8 6.6 0.6Q8.5 0.2 9.5 2.1Q10.4 4 8.7 5.7Z',
  thumb: 'M0.3 4.5H2.5V9.8H0.3ZM3.3 4.6L5.4 0.6Q6.8 0.1 7 1.5L6.6 3.7H9Q10.1 3.7 9.9 4.9L9.2 8.8Q9 9.8 8 9.8H3.3Z',
  face: 'M5 0.2A4.8 4.8 0 1 0 5 9.8A4.8 4.8 0 1 0 5 0.2ZM2.8 3.1H4V5H2.8ZM6 3.1H7.2V5H6ZM2.3 6Q5 9.2 7.7 6Z',
  play: 'M1 0.4L9.6 5L1 9.6Z',
  stop: 'M1 1H9V9H1Z',
  crotchet: 'M7.2 0.2H8.4V7.4Q8.4 9.6 5.6 9.9Q3.4 10.1 3.2 8.7Q3.1 7.4 5 6.8Q6.3 6.4 7.2 6.8Z',
};
const ICON_EVENODD = new Set(['face']);
const icon = (name, x, y, size, fill, extra = '') =>
  `<path transform="translate(${f(x)} ${f(y)}) scale(${f(size / 10)})" d="${ICON[name]}" fill="${fill}"${ICON_EVENODD.has(name) ? ' fill-rule="evenodd"' : ''}${extra}/>`;

// ------------------------------------------------------------------ text layout
// A line is a list of parts: { s, col, sw?, skew? } for lettering, { icon, col } for an
// icon (one cap high), { gap } for extra space in glyph units. The pen runs across parts.
function line(parts, x, y, cap, { anchor = 'start', sw = 0.9, cls = '', op = 1 } = {}) {
  const s = cap / 10;
  const placed = [];                         // [partIndex, ch|icon, pen]
  let pen = 0, lastWasGlyph = false;
  parts.forEach((p, pi) => {
    if (p.gap != null) { pen += p.gap; lastWasGlyph = false; return; }
    if (p.icon) {
      placed.push([pi, null, pen]);
      pen += 10 + GAP;
      lastWasGlyph = true;
      return;
    }
    for (const ch of p.s) {
      if (ch === ' ') { pen += SPACE; lastWasGlyph = false; continue; }
      if (!GLYPHS[ch]) throw new Error(`no glyph for ${JSON.stringify(ch)} in "${p.s}"`);
      placed.push([pi, ch, pen]);
      pen += GLYPHS[ch][0] + GAP;
      lastWasGlyph = true;
    }
  });
  const width = (lastWasGlyph ? pen - GAP : pen) * s;
  const ox = anchor === 'start' ? 0 : anchor === 'middle' ? -width / 2 : -width;
  let body = '';
  parts.forEach((p, pi) => {
    const mine = placed.filter((q) => q[0] === pi);
    if (!mine.length) return;
    if (p.icon) {
      const [, , pen0] = mine[0];
      body += `<path transform="translate(${f(pen0)} 0)" d="${ICON[p.icon]}" fill="${p.col}"${ICON_EVENODD.has(p.icon) ? ' fill-rule="evenodd"' : ''}/>`;
      return;
    }
    let uses = '';
    for (const [, ch, pen0] of mine) uses += `<use href="#${gid(ch)}"${pen0 ? ` x="${f(pen0)}"` : ''}/>`;
    const w = (p.sw ?? sw) / s;
    const sk = p.skew ? ` transform="skewX(${p.skew})"` : '';
    body += `<g stroke="${p.col}" stroke-width="${f(w)}"${sk}>${uses}</g>`;
  });
  const one = parts.length === 1 && !parts[0].icon && parts[0].gap == null && !parts[0].skew;
  if (one) {
    const p = parts[0];
    const uses = placed.map(([, ch, pen0]) => `<use href="#${gid(ch)}"${pen0 ? ` x="${f(pen0)}"` : ''}/>`).join('');
    body = uses;
    const html = `<g class="t${cls ? ` ${cls}` : ''}" transform="translate(${f(x + ox)} ${f(y)}) scale(${f(s)})" stroke="${p.col}" stroke-width="${f((p.sw ?? sw) / s)}"${op === 1 ? '' : ` opacity="${op}"`}>${body}</g>`;
    return { svg: html, w: width };
  }
  const html = `<g class="t${cls ? ` ${cls}` : ''}" transform="translate(${f(x + ox)} ${f(y)}) scale(${f(s)})"${op === 1 ? '' : ` opacity="${op}"`}>${body}</g>`;
  return { svg: html, w: width };
}
const text = (str, x, y, cap, col, opts = {}) => line([{ s: str, col, skew: opts.skew }], x, y, cap, opts).svg;
const textW = (str, cap) => line([{ s: str, col: '#000' }], 0, 0, cap).w;

// ------------------------------------------------------------------ the wordmark
// A heavy condensed face for the eight letters of the name only, echoing the app's own
// display type. Units: cap height 100, baseline y = 100, x-height 74. [advance, path].
const WM = {
  M: [84, 'M0 100V0H25L42 58L59 0H84V100H63V44L50 88H34L21 44V100Z'],
  e: [56, 'M20 26H36Q56 26 56 46V69H22V79H56Q56 100 36 100H20Q0 100 0 80V46Q0 26 20 26ZM26 42H30Q34 42 34 46V55H22V46Q22 42 26 42Z'],
  d: [56, 'M34 0H56V100H20Q0 100 0 80V46Q0 26 20 26H34ZM26 42H34V84H26Q22 84 22 80V46Q22 42 26 42Z'],
  i: [23, 'M0 0H23V18H0ZM0 26H23V100H0Z'],
  a: [56, 'M0 50V46Q0 26 20 26H36Q56 26 56 46V100H18Q0 100 0 82V75Q0 58 18 58H34V46Q34 42 30 42H26Q22 42 22 46V50ZM26 72H34V86H26Q22 86 22 82V76Q22 72 26 72Z'],
  L: [50, 'M0 0H23V79H50V100H0Z'],
  o: [56, 'M20 26H36Q56 26 56 46V80Q56 100 36 100H20Q0 100 0 80V46Q0 26 20 26ZM26 42H30Q34 42 34 46V80Q34 84 30 84H26Q22 84 22 80V46Q22 42 26 42Z'],
  g: [56, 'M20 26H56V108Q56 128 36 128H20Q2 128 0 112H22Q23 114 27 114H30Q34 114 34 110V100H20Q0 100 0 80V46Q0 26 20 26ZM26 42H34V84H26Q22 84 22 80V46Q22 42 26 42Z'],
};
const WM_TRACK = 7;
const wordmarkW = (str, cap) => ([...str].reduce((a, ch) => a + WM[ch][0] + WM_TRACK, 0) - WM_TRACK) * cap / 100;
function wordmark(str, x, baseline, cap, fill, extra = '') {
  const s = cap / 100;
  let pen = 0, d = '';
  for (const ch of str) {
    d += `<path transform="translate(${pen} 0)" d="${WM[ch][1]}"/>`;
    pen += WM[ch][0] + WM_TRACK;
  }
  return `<g transform="translate(${f(x)} ${f(baseline - cap)}) scale(${f(s)})" fill="${fill}" fill-rule="evenodd"${extra}>${d}</g>`;
}

// ------------------------------------------------------------------ geometry
const W = 924;
const LC0 = 12, LC1 = 97;                 // left column: labels, keyboard
const X0 = 102;                           // roll left edge
const COLS = 150, COLW = 5.4;             // one column = one month; 2015.0 .. 2027.5
const X1 = X0 + COLS * COLW;              // 912
const YEAR0 = 2015;
const colOfYear = (y) => (y - YEAR0) * 12;
const xc = (c) => X0 + c * COLW;
const NOW_COL = colOfYear(2026 + (9 + 9.5 / 31) / 12);   // 10 October 2026

const TB_Y = 12, TB_H = 48;               // title bar
const PS_Y = TB_Y + TB_H + 7;             // pattern strip: header, then one row per kind
const PS_HEAD = 13, PS_ROW = 10;
const PS_BODY = PS_Y + PS_HEAD;
const PS_END = PS_BODY + KIND_ORDER.length * PS_ROW;
const RU_Y = PS_END + 5, RU_H = 22;       // ruler
const ROLL_Y = RU_Y + RU_H;
const ROWS = 19, ROWH = 12;
const ROLL_END = ROLL_Y + ROWS * ROWH;
const VL_Y = ROLL_END + 3, VL_H = 36;     // velocity lane
const ST_Y = VL_Y + VL_H + 5, ST_H = 22;  // status bar
const H = ST_Y + ST_H + 12;
const yr = (r) => ROLL_Y + r * ROWH;

// ------------------------------------------------------------------ timing
const LOOP = 30;                          // seconds
const T_MOVE = 26.5;                      // the playhead runs 2015.0 .. NOW, then holds
const tOfCol = (c) => Math.min(c, NOW_COL) / NOW_COL * T_MOVE;
const frOfCol = (c) => tOfCol(c) / LOOP;
const FR_NOW = T_MOVE / LOOP;

// ------------------------------------------------------------------ the title, in notes
// 14 rows: rows 0-10 cap height, 3-10 x-height, 11-13 descender. One cell = one column
// (a month) by one key. Each run of # in a row is one note. Heavy and condensed, like the
// app's display face: five-month stems, two-key bars.
const ART = {
  M: ['########......########', '#########....#########', '#####.####..####.#####', '#####..########..#####',
    '#####...######...#####', '#####....####....#####', '#####............#####', '#####............#####',
    '#####............#####', '#####............#####', '#####............#####'],
  e: ['', '', '', '..##########..', '.############.', '#####....#####', '##############', '#####.........',
    '#####......###', '.############.', '..##########..'],
  d: ['.........#####', '.........#####', '.........#####', '..############', '.#############', '#####....#####',
    '#####....#####', '#####....#####', '#####....#####', '.#############', '..############'],
  i: ['#####', '#####', '', '#####', '#####', '#####', '#####', '#####', '#####', '#####', '#####'],
  a: ['', '', '', '..##########..', '.############.', '.........#####', '..############', '.#############',
    '#####....#####', '.#############', '..############'],
  L: ['#####.......', '#####.......', '#####.......', '#####.......', '#####.......', '#####.......', '#####.......',
    '#####.......', '#####.......', '############', '############'],
  o: ['', '', '', '..##########..', '.############.', '#####....#####', '#####....#####', '#####....#####',
    '#####....#####', '.############.', '..##########..'],
  g: ['', '', '', '..############', '.#############', '#####....#####', '#####....#####', '#####....#####',
    '#####....#####', '.#############', '..############', '.........#####', '.############.', '..##########..'],
};
const ART_W = { M: 22, e: 14, d: 14, i: 5, a: 14, L: 12, o: 14, g: 14 };
const LETTER_GAP = 4, TITLE_COL0 = 2;
const TITLE_ROW0 = 1;                      // roll row of art row 0
const PEDAL_ROW = 17;

// ------------------------------------------------------------------ the diary
// One featured entry per letter (the status bar reads it out while the letter plays).
// Every title, creator and note is invented.
const LETTERS = [
  { ch: 'M', kind: 'movies', title: 'THE POLITE WEREWOLF', react: 'heart', creator: 'AGNES MOLLOY-FITCH', when: '12 NOV 2015', note: 'CLAPPED AT THE END. WAS AT HOME.' },
  { ch: 'e', kind: 'tv', title: 'BAKERS OF THE FJORD', react: 'thumb', creator: 'FENN & DAUGHTER', detail: 'S3 E1-8', when: 'FEB 2018', note: 'BOUGHT A WHISK.' },
  { ch: 'd', kind: 'books', title: 'THE PATIENT HEDGE', react: 'heart', creator: 'MARGIT OYELARAN', detail: 'EBOOK', when: '3 JUN 2019', note: 'FINISHED IT ON A BUS. KEPT RIDING.' },
  { ch: 'i', kind: 'comics', title: 'CAPTAIN TUESDAY', react: 'face', verdict: 'MOSTLY CAPES', creator: 'R. P. QUILL', when: 'SEP 2020' },
  { ch: 'a', kind: 'games', title: 'TINY FERRY TYCOON', react: 'thumb', creator: 'PUFFIN HAT GAMES', when: 'MAR 2022', note: 'THE FERRIES HAVE NAMES NOW.' },
  { ch: 'L', kind: 'podcasts', title: 'SPOONS, RANKED', react: 'heart', creator: 'DILYS & BRAM', when: '14 APR 2023', note: 'DISAGREED WITH NUMBER FOUR. OUT LOUD.' },
  { ch: 'o', kind: 'music', title: 'HYMNS FOR A DAMP ALLOTMENT', react: 'face', verdict: 'BANGER, PROBABLY', creator: 'THE LUKEWARM KETTLES', when: 'JUL 2024' },
  { ch: 'g', kind: 'videos', title: 'MAN RESTORES ONE TEASPOON', react: 'thumb', creator: 'MILDLY RESTORED', when: '9 MAY 2026', note: 'WATCHED ALL FOUR HOURS.' },
];
// The two entries filed under "sometime in": each is held for its whole five-year bar.
const PEDALS = [
  { c0: 0, c1: 60, kind: 'movies', head: 'SOMETIME IN 2015-2019', title: 'MIDNIGHT AT THE GARDEN CENTRE', react: 'face', verdict: 'DEFINITELY SAW IT' },
  { c0: 60, c1: 120, kind: 'books', head: 'SOMETIME IN 2020-2024', title: 'AN UNABRIDGED HISTORY OF TOAST', detail: 'AUDIOBOOK', react: 'thumb' },
];
const VELOCITY = { heart: 1, thumb: 0.66, face: 0.46 };

// lay the letters out, LETTER_GAP columns apart
const notes = [];        // { c0, c1, row, kind, letter, pedal }
{
  let c = TITLE_COL0;
  LETTERS.forEach((L, li) => {
    const rows = ART[L.ch];
    const w = ART_W[L.ch];
    rows.forEach((row, r) => {
      if (row && row.length !== w) throw new Error(`${L.ch} row ${r} is ${row.length} wide, expected ${w}`);
      for (let i = 0; i < row.length;) {
        if (row[i] !== '#') { i++; continue; }
        const s = i;
        while (i < row.length && row[i] === '#') i++;
        notes.push({ c0: c + s, c1: c + i, row: TITLE_ROW0 + r, kind: L.kind, letter: li });
      }
    });
    L.c0 = c; L.c1 = c + w;
    c += w + LETTER_GAP;
  });
  const last = LETTERS[LETTERS.length - 1];
  if (last.c1 > NOW_COL) throw new Error(`the title runs past NOW (${last.c1} > ${NOW_COL.toFixed(2)})`);
}
for (const p of PEDALS) notes.push({ c0: p.c0, c1: p.c1, row: PEDAL_ROW, kind: p.kind, letter: -1, pedal: p });
const occupied = new Set(notes.map((n) => { const s = []; for (let c = n.c0; c < n.c1; c++) s.push(`${n.row}:${c}`); return s; }).flat());

// Ghost notes: friends' entries, shown faintly (they do not sound). Kept clear of the letters.
const GHOSTS = [
  { c0: 29, c1: 39, row: 1, kind: 'music', who: 'TOVE' },
  { c0: 74, c1: 84, row: 2, kind: 'tv', who: 'OSKAR' },
  { c0: 109, c1: 119, row: 1, kind: 'games', who: 'NADIA' },
  { c0: 6, c1: 17, row: 13, kind: 'books', who: 'TOVE' },
  { c0: 48, c1: 59, row: 14, kind: 'movies', who: 'OSKAR' },
  { c0: 80, c1: 91, row: 13, kind: 'podcasts', who: 'NADIA' },
];
for (const g of GHOSTS) for (let c = g.c0 - 1; c <= g.c1; c++) for (const r of [g.row - 1, g.row, g.row + 1]) {
  if (occupied.has(`${r}:${c}`) && r === g.row) throw new Error(`ghost ${g.who} at ${g.row}:${g.c0} touches a note`);
}

// ------------------------------------------------------------------ pitch
const MIDI_TOP = 53;                       // roll row 0 is F3; the pedal row is C2
const midiOf = (r) => MIDI_TOP - r;
const isBlack = (r) => [1, 3, 6, 8, 10].includes(midiOf(r) % 12);
const NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const noteName = (r) => `${NAMES[midiOf(r) % 12]}${Math.floor(midiOf(r) / 12) - 1}`;
if (noteName(PEDAL_ROW) !== 'C2') throw new Error(`pedal row is ${noteName(PEDAL_ROW)}`);

// ------------------------------------------------------------------ CSS keyframe helpers
// Visible (opacity 1) during the given [fr0, fr1) intervals of the loop, else 0. Stepped.
function showFrames(name, intervals) {
  const iv = intervals.map(([a, b]) => [Math.max(0, a), Math.min(1, b)]).filter(([a, b]) => b > a).sort((p, q) => p[0] - q[0]);
  const stops = [];
  const put = (fr, v) => {
    const p = pct(fr);
    if (stops.length && stops[stops.length - 1][0] === p) stops[stops.length - 1][1] = v;
    else stops.push([p, v]);
  };
  put(0, 0);
  for (const [a, b] of iv) { put(a, 1); if (b < 1) put(b, 0); }
  const outS = [];
  for (const s of stops) if (!outS.length || outS[outS.length - 1][1] !== s[1]) outS.push(s);
  return `@keyframes ${name}{${outS.map(([p, v]) => `${p}{opacity:${v}}`).join('')}}`;
}
// The same, for a readout that owns the start or the end of the loop: it fades out over
// the last half second (with the playhead) and fades back in as the loop restarts, so the
// wrap from NOW back to 2015 reads as a sequencer looping, not a cut. Linear timing, with
// near-coincident stops so the other changes stay instant.
const FADE_IN = 0.012, FADE_OUT = 0.984, EPS = 0.0001;
function showRule(name, intervals) {
  const [[a0, b0]] = intervals;
  if (intervals.length !== 1 || (a0 > 0 && b0 < 1)) return [showFrames(name, intervals), `.${name}{animation-name:${name}}`];
  const st = [];
  if (a0 <= 0) st.push([0, 0], [FADE_IN, 1]); else st.push([0, 0], [a0 - EPS, 0], [a0, 1]);
  if (b0 >= 1) st.push([FADE_OUT, 1], [1, 0]); else st.push([b0 - EPS, 1], [b0, 0], [1, 0]);
  return [`@keyframes ${name}{${st.map(([p, v]) => `${pct(p)}{opacity:${v}}`).join('')}}`,
    `.${name}{animation-name:${name};animation-timing-function:linear}`];
}

// ------------------------------------------------------------------ regions of the loop
// Each letter owns the loop from its first column to the next letter's first column; the
// first letter also owns the lead-in, and the finale owns NOW to the end of the loop.
const regions = LETTERS.map((L, i) => [i === 0 ? 0 : frOfCol(L.c0), i + 1 < LETTERS.length ? frOfCol(LETTERS[i + 1].c0) : FR_NOW]);
const FINALE = [FR_NOW, 1];

const cssParts = [];
let WORD_END, TAG_END, NOW_FLAG;       // set by the title bar and the ruler, used later
// A flash from column c0 to c1: keyframe sets are shared by duration and shifted into place
// with a negative delay, so a hundred notes need only a handful of @keyframes.
// Each flash holds while the note sounds, then fades for TRAIL seconds, as visualisers do.
const TRAIL = 0.55;
const durKF = new Map();
function flashStyle(c0, c1) {
  const d = frOfCol(c1) - frOfCol(c0);
  const key = pct(d);
  if (!durKF.has(key)) {
    const name = `d${durKF.size.toString(36)}`;
    durKF.set(key, name);
    cssParts.push(`@keyframes ${name}{0%,${key}{opacity:1}${pct(d + TRAIL / LOOP)},100%{opacity:0}}`);
  }
  const t0 = tOfCol(c0);
  return ` style="animation-name:${durKF.get(key)}${t0 ? `;animation-delay:${f(t0 - LOOP)}s` : ''}"`;
}
const defs = [];
const out = [];                            // body, in paint order

// ------------------------------------------------------------------ panel
out.push(`<rect width="${W}" height="${H}" rx="14" fill="${C.panel}"/>`);
out.push(`<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="13.5" fill="none" stroke="#fff" stroke-opacity=".1"/>`);

// ------------------------------------------------------------------ title bar
{
  out.push(`<rect x="${LC0}" y="${TB_Y}" width="${X1 - LC0}" height="${TB_H}" rx="8" fill="${C.chrome}" stroke="${C.chromeLine}"/>`);
  // logo mark: an open book, a play triangle on the left page, a pen on the right page
  // (the app's own mark, redrawn)
  const lx = LC0 + 12, ly = TB_Y + 11, lw = 34, lh = 26;
  const page = (x0, dir) => {
    const xi = x0 + dir * (lw / 2 - 1.2);
    return `M${f(x0)} ${f(ly + 2)}Q${f((x0 + xi) / 2)} ${f(ly - 1)} ${f(xi)} ${f(ly + 2)}V${f(ly + lh)}Q${f((x0 + xi) / 2)} ${f(ly + lh - 3)} ${f(x0)} ${f(ly + lh)}Z`;
  };
  out.push(`<path d="${page(lx, 1)}${page(lx + lw, -1)}" fill="none" stroke="${C.ink}" stroke-width="2.4" stroke-linejoin="round"/>`);
  out.push(`<path d="M${f(lx + 5.2)} ${f(ly + 8.2)}L${f(lx + 12.4)} ${f(ly + 13.8)}L${f(lx + 5.2)} ${f(ly + 19.4)}Z" fill="${C.ink}" stroke="${C.ink}" stroke-width="1.2" stroke-linejoin="round"/>`);
  const px0 = lx + lw / 2 + 4.6, py0 = ly + 20.4, px1 = lx + lw - 3.8, py1 = ly + 6;
  out.push(`<path d="M${f(px0 + 1.4)} ${f(py0 - 2.2)}L${f(px1)} ${f(py1)}" stroke="${C.ink}" stroke-width="3.6" stroke-linecap="round"/>`);
  out.push(`<path d="M${f(px0 - 0.6)} ${f(py0 + 0.8)}L${f(px0 + 1.4)} ${f(py0 - 2.2)}" stroke="${C.gold}" stroke-width="2.2" stroke-linecap="round"/>`);
  // wordmark, with the app's hard offset shadow
  const wx = lx + lw + 10, wcap = 27, wbase = TB_Y + 36;
  out.push(wordmark('MediaLog', wx + 2.2, wbase + 2.2, wcap, '#000', ' opacity=".6"'));
  out.push(wordmark('MediaLog', wx, wbase, wcap, C.ink));
  WORD_END = wx + wordmarkW('MediaLog', wcap);
}

// --- the line, its verb cycling (one variant per letter, then all four at NOW)
const TAG_CAP = 9.2, TAG_SW = 1.45;
const TAG_X = WORD_END + 24, TAG_Y = TB_Y + 10;
{
  const pre = "EVERYTHING YOU'VE ";
  out.push(line([{ s: pre, col: C.ink }], TAG_X, TAG_Y, TAG_CAP, { sw: TAG_SW }).svg);
  const vx = TAG_X + line([{ s: pre, col: C.ink }], 0, 0, TAG_CAP).w;   // (the width includes the trailing space)
  defs.push(`<g id="tsfx">${line([{ s: ', ON ONE TIMELINE.', col: C.ink }], 0, TAG_Y, TAG_CAP, { sw: TAG_SW }).svg}</g>`);
  LETTERS.forEach((L, i) => {
    const k = KINDS[L.kind];
    const verb = line([{ s: k.verb, col: k.col }], vx, TAG_Y, TAG_CAP, { sw: TAG_SW });
    out.push(`<g class="sw tv${i}" opacity="0">${verb.svg}<use href="#tsfx" x="${f(vx + verb.w + GAP * TAG_CAP / 10)}"/></g>`);
    cssParts.push(...showRule(`tv${i}`, [regions[i]]));
  });
  const full = line([
    { s: 'WATCHED', col: KINDS.movies.col }, { s: ', ', col: C.ink }, { s: 'READ', col: KINDS.books.col }, { s: ', ', col: C.ink },
    { s: 'PLAYED', col: KINDS.games.col }, { s: ', ', col: C.ink }, { s: 'LISTENED TO', col: KINDS.podcasts.col }, { s: ', ON ONE TIMELINE.', col: C.ink },
  ], vx, TAG_Y, TAG_CAP, { sw: TAG_SW, cls: 'sw tvF' });
  out.push(full.svg);
  cssParts.push(...showRule('tvF', [FINALE]));
  TAG_END = vx + full.w;
  out.push(text('A MEDIA DIARY YOU SHARE. LOG IT, WHEN AND HOW IT WAS, THEN SEE WHAT THE PEOPLE YOU KNOW HAVE BEEN INTO.', TAG_X, TAG_Y + 17.6, 5.9, C.dim, { sw: 0.92 }));
}

// --- transport: play, stop, loop, a year counter, the time signature and the tempo
{
  const bx = X1 - 206, by = TB_Y + 7, bw = 198, bh = 34;
  if (TAG_END > bx - 12) throw new Error(`the line (${TAG_END.toFixed(1)}) runs into the transport (${bx})`);
  out.push(`<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="5" fill="${C.inset}" stroke="${C.chromeLine}"/>`);
  // buttons
  out.push(`<rect x="${bx + 6}" y="${by + 6}" width="22" height="22" rx="4" fill="${C.gold}" fill-opacity=".14" stroke="${C.gold}" stroke-opacity=".7"/>`);
  out.push(icon('play', bx + 11.5, by + 11.5, 11, C.gold, ' class="pp"'));
  out.push(icon('stop', bx + 33, by + 12.5, 9, C.faint));
  out.push(`<path transform="translate(${bx + 47} ${by + 11}) scale(1.2)" d="M1 5.2V4.2Q1 2.2 3 2.2H8.2M6.6 0.6L8.2 2.2L6.6 3.8M9 4.8V5.8Q9 7.8 7 7.8H1.8M3.4 9.4L1.8 7.8L3.4 6.2" fill="none" stroke="${C.gold}" stroke-width="1.15" stroke-linecap="round" stroke-linejoin="round"/>`);
  // year counter: an LCD with ghost segments, stepping one year per beat
  const yx = bx + 68, ycap = 15;
  out.push(`<rect x="${yx - 4}" y="${by + 4}" width="${f(textW('8888', ycap) + 8)}" height="${bh - 8}" rx="3" fill="#000" fill-opacity=".35"/>`);
  out.push(text('8888', yx, by + 9.5, ycap, C.gold, { sw: 2, op: 0.09 }));
  const years = [];
  for (let y = 2015; y <= 2026; y++) years.push(y);
  years.forEach((y, i) => {
    const a = i === 0 ? 0 : frOfCol(colOfYear(y));
    const b = y === 2026 ? 1 : frOfCol(colOfYear(y + 1));
    out.push(line([{ s: String(y), col: C.gold }], yx, by + 9.5, ycap, { sw: 2, cls: `sw yr${i}`, op: y === 2026 ? 1 : 0 }).svg);
    cssParts.push(...showRule(`yr${i}`, [[a, b]]));
  });
  // time signature and tempo
  const tx = yx + textW('8888', ycap) + 12;
  out.push(text('5/4', tx, by + 6, 8.5, C.ink, { sw: 1.4 }));
  out.push(text('FIVE YEARS A BAR', tx + textW('5/4', 8.5) + 5, by + 8.2, 5, C.dim, { sw: 0.82 }));
  out.push(icon('crotchet', tx - 1, by + 19.5, 8.2, C.ink));
  out.push(text('= 1 YEAR', tx + 9, by + 21, 5.6, C.ink, { sw: 0.95 }));
  if (tx + textW('5/4', 8.5) + 5 + textW('FIVE YEARS A BAR', 5) > bx + bw - 4) throw new Error('transport text overflows');
}

// ------------------------------------------------------------------ pattern strip
// One row per kind (the app's chips), one clip per letter, sitting right above it: the
// strip reads as a staircase of colours that spells the same word, diagonally. Each clip
// previews its notes in miniature, as pattern blocks in chip editors do.
const DRAWERS = [[0, '2015-2019'], [60, '2020-2024'], [120, '2025-2029']];
{
  out.push(`<rect x="${X0}" y="${PS_Y}" width="${X1 - X0}" height="${PS_END - PS_Y}" fill="${C.strip}"/>`);
  // header: one drawer per five-year bar
  if (textW('EACH KIND HAS ITS COLOUR', 5) > LC1 - LC0 - 3) throw new Error('kind header does not fit the left column');
  out.push(text('EACH KIND HAS ITS COLOUR', LC0 + 2, PS_Y + 4, 5, C.dim, { sw: 0.85 }));
  for (const [d0, label] of DRAWERS) {
    const x = xc(d0);
    out.push(`<rect x="${f(x + 0.5)}" y="${PS_Y + 0.5}" width="${f(Math.min(xc(d0 + 60), X1) - x - 1)}" height="${PS_HEAD - 2}" rx="2" fill="#fff" fill-opacity=".05"/>`);
    out.push(text(label, x + 5, PS_Y + 2.6, 6.4, C.ink, { sw: 1.1 }));
  }
  out.push(text('A LOG, FIVE YEARS AT A TIME', X1 - 5, PS_Y + 3.6, 4.8, C.dim, { anchor: 'end', sw: 0.8 }));
  // drawer dividers and faint year lines
  let yl = '';
  for (let c = 12; c < COLS; c += 12) if (c % 60) yl += `M${f(xc(c))} ${PS_BODY}V${PS_END}`;
  out.push(`<path d="${yl}" stroke="#fff" stroke-opacity=".035"/>`);
  for (const [d0] of DRAWERS.slice(1)) out.push(`<path d="M${f(xc(d0))} ${PS_Y}V${PS_END}" stroke="#fff" stroke-opacity=".18"/>`);
  const LAB = 5.6;
  KIND_ORDER.forEach((key, i) => {
    const k = KINDS[key];
    const y = PS_BODY + i * PS_ROW;
    if (i % 2 === 1) out.push(`<rect x="${X0}" y="${y}" width="${X1 - X0}" height="${PS_ROW}" fill="#fff" fill-opacity=".018"/>`);
    // label, dim, and lit while its letter plays (all lit at NOW)
    out.push(`<rect x="${LC0 + 2}" y="${f(y + (PS_ROW - LAB) / 2)}" width="${LAB}" height="${LAB}" rx="1.2" fill="${k.col}"/>`);
    out.push(text(k.label, LC0 + 11, y + (PS_ROW - LAB) / 2, LAB, C.dim, { sw: 0.9 }));
    const li = LETTERS.findIndex((L) => L.kind === key);
    out.push(text(k.label, LC0 + 11, y + (PS_ROW - LAB) / 2, LAB, k.col, { sw: 1.05, cls: `sw pl${i}` }));
    cssParts.push(showFrames(`pl${i}`, [regions[li], FINALE]), `.pl${i}{animation-name:pl${i}}`);
    // the pedal clip ("sometime in"), a long low bar under the row
    for (const p of PEDALS.filter((q) => q.kind === key)) {
      out.push(`<rect x="${f(xc(p.c0) + 0.8)}" y="${f(y + PS_ROW - 2.6)}" width="${f((p.c1 - p.c0) * COLW - 1.6)}" height="1.8" rx=".9" fill="${k.col}" fill-opacity=".55"/>`);
    }
    // the letter clip
    const L = LETTERS[li];
    const cx0 = xc(L.c0 - 1) + 0.6, cx1 = xc(L.c1 + 1) - 0.6;
    out.push(`<rect x="${f(cx0)}" y="${f(y + 0.8)}" width="${f(cx1 - cx0)}" height="${f(PS_ROW - 1.6)}" rx="1.8" fill="${k.col}" fill-opacity=".85"/>`);
    out.push(`<rect class="sw pc${i}" x="${f(cx0 - 0.8)}" y="${f(y)}" width="${f(cx1 - cx0 + 1.6)}" height="${PS_ROW}" rx="2.4" fill="#fff" fill-opacity=".28" stroke="#fff" stroke-opacity=".7" stroke-width=".8" opacity="0"/>`);
    cssParts.push(showFrames(`pc${i}`, [[frOfCol(L.c0), frOfCol(L.c1)]]), `.pc${i}{animation-name:pc${i}}`);
    let d = '';
    const top = y + 1.7, unit = (PS_ROW - 3.4) / 14;
    for (const n of notes.filter((q) => q.letter === li)) {
      d += `M${f(xc(n.c0))} ${f(top + (n.row - TITLE_ROW0) * unit)}h${f((n.c1 - n.c0) * COLW)}v${f(unit)}h${f(-(n.c1 - n.c0) * COLW)}z`;
    }
    out.push(`<path d="${d}" fill="#000" fill-opacity=".55"/>`);
  });
}

// ------------------------------------------------------------------ ruler
{
  out.push(`<rect x="${X0}" y="${RU_Y}" width="${X1 - X0}" height="${RU_H}" fill="${C.chrome}"/>`);
  out.push(`<path d="M${X0} ${RU_Y + 0.5}H${X1}M${X0} ${ROLL_Y - 0.5}H${X1}" stroke="${C.chromeLine}"/>`);
  // loop region, 2015 to NOW
  out.push(`<rect x="${f(xc(0))}" y="${RU_Y + 1}" width="${f(xc(NOW_COL) - xc(0))}" height="4" fill="${C.gold}" fill-opacity=".22"/>`);
  out.push(`<path d="M${f(xc(0) + 0.6)} ${RU_Y + 1}v6M${f(xc(NOW_COL) - 0.6)} ${RU_Y + 1}v6" stroke="${C.gold}" stroke-opacity=".8" stroke-width="1.2"/>`);
  let ticks = '';
  for (let c = 0; c <= COLS; c++) {
    const x = xc(c);
    if (c % 60 === 0) ticks += `M${f(x)} ${RU_Y + 6}V${ROLL_Y}`;
    else if (c % 12 === 0) ticks += `M${f(x)} ${ROLL_Y - 9}V${ROLL_Y}`;
    else if (c % 3 === 0) ticks += `M${f(x)} ${ROLL_Y - 3.5}V${ROLL_Y}`;
    else ticks += `M${f(x)} ${ROLL_Y - 1.8}V${ROLL_Y}`;
  }
  out.push(`<path d="${ticks}" stroke="${C.dim}" stroke-opacity=".55" stroke-width=".8"/>`);
  for (let y = 2015; y <= 2027; y++) {
    const c = colOfYear(y);
    const bar = (y - 2015) % 5 === 0;
    out.push(text(String(y), xc(c) + 2.5, RU_Y + 9, bar ? 6.4 : 5.4, bar ? C.ink : C.dim, { sw: bar ? 1.15 : 0.85 }));
  }
  // NOW flag
  const nx = xc(NOW_COL);
  const nw = textW('NOW', 5) + 6;
  // (painted after the playhead, so the playhead parks behind it at the end)
  NOW_FLAG = `<g class="nowf"><rect x="${f(nx - nw / 2)}" y="${RU_Y + 6.5}" width="${f(nw)}" height="8.5" rx="2" fill="${C.gold}" stroke="${C.chrome}" stroke-width="1.2"/>${text('NOW', nx, RU_Y + 8.3, 5, C.inset, { anchor: 'middle', sw: 1 })}</g>`;
  // left: the channel being edited
  out.push(text('EDITING', LC0 + 2, RU_Y + 2.5, 4.4, C.faint, { sw: 0.75 }));
  LETTERS.forEach((L, i) => {
    const k = KINDS[L.kind];
    out.push(line([{ s: k.label.split(' · ')[0], col: k.col }], LC0 + 2, RU_Y + 10, 6.4, { sw: 1.15, cls: `sw ed${i}`, op: 0 }).svg);
    cssParts.push(...showRule(`ed${i}`, [regions[i]]));
  });
  out.push(line([{ s: 'EVERYTHING', col: C.ink }], LC0 + 2, RU_Y + 10, 6.4, { sw: 1.15, cls: 'sw edF' }).svg);
  cssParts.push(...showRule('edF', [FINALE]));
}

// ------------------------------------------------------------------ the roll: lanes and grid
{
  out.push(`<rect x="${X0}" y="${ROLL_Y}" width="${X1 - X0}" height="${ROWS * ROWH}" fill="${C.roll}"/>`);
  let blackRows = '';
  for (let r = 0; r < ROWS; r++) if (isBlack(r)) blackRows += `M${X0} ${yr(r)}h${X1 - X0}v${ROWH}h${-(X1 - X0)}z`;
  out.push(`<path d="${blackRows}" fill="${C.rollBlack}"/>`);
  // alternating beat (year) columns a shade lighter
  let alt = '';
  for (let y = 0; y < 13; y += 2) {
    const a = xc(y * 12), b = Math.min(xc(y * 12 + 12), X1);
    alt += `M${f(a)} ${ROLL_Y}H${f(b)}V${ROLL_END}H${f(a)}z`;
  }
  out.push(`<path d="${alt}" fill="#fff" fill-opacity=".022"/>`);
  let rowsD = '', colsD = '', yearsD = '', barsD = '';
  for (let r = 1; r < ROWS; r++) rowsD += `M${X0} ${yr(r) - 0.5}H${X1}`;
  for (let c = 1; c < COLS; c++) {
    const x = f(xc(c));
    if (c % 60 === 0) barsD += `M${x} ${ROLL_Y}V${ROLL_END}`;
    else if (c % 12 === 0) yearsD += `M${x} ${ROLL_Y}V${ROLL_END}`;
    else if (c % 3 === 0) colsD += `M${x} ${ROLL_Y}V${ROLL_END}`;
  }
  out.push(`<path d="${rowsD}" stroke="#fff" stroke-opacity=".04"/>`);
  out.push(`<path d="${colsD}" stroke="#fff" stroke-opacity=".028"/>`);
  out.push(`<path d="${yearsD}" stroke="#fff" stroke-opacity=".085"/>`);
  out.push(`<path d="${barsD}" stroke="#fff" stroke-opacity=".2"/>`);
  // the future: not logged yet
  defs.push(`<pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0V6" stroke="#fff" stroke-opacity=".07" stroke-width="2"/></pattern>`);
  out.push(`<rect x="${f(xc(NOW_COL))}" y="${ROLL_Y}" width="${f(X1 - xc(NOW_COL))}" height="${ROWS * ROWH}" fill="url(#hatch)"/>`);
  out.push(`<rect x="${f(xc(NOW_COL))}" y="${ROLL_Y}" width="${f(X1 - xc(NOW_COL))}" height="${ROWS * ROWH}" fill="#000" fill-opacity=".18"/>`);
}

// ------------------------------------------------------------------ the roll: notes
const NOTE_Y = 0.7, NOTE_H = ROWH - 1.4;
const nx0 = (n) => xc(n.c0) + 0.6;
const nw = (n) => (n.c1 - n.c0) * COLW - 1.2;
const ny = (n) => yr(n.row) + NOTE_Y;
{
  // ghost notes first (behind)
  for (const g of GHOSTS) {
    const k = KINDS[g.kind];
    const x = xc(g.c0) + 0.6, w = (g.c1 - g.c0) * COLW - 1.2, y = yr(g.row) + NOTE_Y;
    out.push(`<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${NOTE_H}" rx="2.2" fill="${k.col}" fill-opacity=".08" stroke="${k.col}" stroke-opacity=".5" stroke-width=".9" stroke-dasharray="2.4 1.6"/>`);
    out.push(`<circle cx="${f(x + 5.4)}" cy="${f(y + NOTE_H / 2)}" r="2.7" fill="${k.col}" fill-opacity=".55"/>`);
    out.push(text(g.who, x + 10, y + 2.9, 4.4, k.col, { sw: 0.8, op: 0.9 }));
  }
  // solid notes, per kind
  const byKind = new Map();
  let edges = '', sheen = '', labels = '';
  for (const n of notes) {
    if (n.pedal) continue;
    const k = n.kind;
    byKind.set(k, (byKind.get(k) || '') + `<rect x="${f(nx0(n))}" y="${f(ny(n))}" width="${f(nw(n))}" height="${NOTE_H}" rx="2.2"/>`);
    edges += `M${f(nx0(n) + 0.6)} ${f(ny(n) + 0.6)}h2.2v${f(NOTE_H - 1.2)}h-2.2z`;
    sheen += `M${f(nx0(n) + 2.8)} ${f(ny(n) + 0.7)}h${f(nw(n) - 4.2)}v1.3h${f(-(nw(n) - 4.2))}z`;
    if (n.c1 - n.c0 >= 8) labels += text(noteName(n.row), nx0(n) + 4, ny(n) + 3, 4.2, '#000', { sw: 0.8, op: 0.45 });
  }
  for (const key of KIND_ORDER) if (byKind.has(key)) out.push(`<g fill="${KINDS[key].col}" stroke="#000" stroke-opacity=".3" stroke-width=".8">${byKind.get(key)}</g>`);
  out.push(`<path d="${edges}" fill="#fff" fill-opacity=".45"/>`);
  out.push(`<path d="${sheen}" fill="#fff" fill-opacity=".16"/>`);
  out.push(labels);
  // pedal notes: "sometime in", fuzzy at both ends, held for the whole bar
  for (const n of notes.filter((q) => q.pedal)) {
    const p = n.pedal, k = KINDS[p.kind];
    defs.push(`<linearGradient id="pd${p.c0}" x1="0" x2="1"><stop offset="0" stop-color="${k.col}" stop-opacity=".12"/><stop offset=".1" stop-color="${k.col}" stop-opacity=".62"/><stop offset=".9" stop-color="${k.col}" stop-opacity=".62"/><stop offset="1" stop-color="${k.col}" stop-opacity=".12"/></linearGradient>`);
    out.push(`<rect x="${f(nx0(n))}" y="${f(ny(n))}" width="${f(nw(n))}" height="${NOTE_H}" rx="2.2" fill="url(#pd${p.c0})" stroke="${k.col}" stroke-width=".9" stroke-dasharray="3 2"/>`);
    const parts = [{ s: `${p.head}: `, col: C.ink, sw: 0.95 }, { s: p.title, col: '#fff', sw: 1.02 }];
    if (p.detail) parts.push({ s: `, ${p.detail}`, col: C.ink, sw: 0.95 });
    parts.push({ gap: 4 }, { icon: p.react, col: '#fff' });
    if (p.verdict) parts.push({ gap: 2 }, { s: p.verdict, col: '#fff', sw: 0.95 });
    const L = line(parts, nx0(n) + 14, ny(n) + 2.2, 5.6, {});
    if (L.w > nw(n) - 20) throw new Error(`pedal label too long: ${p.title} (${L.w.toFixed(1)} > ${(nw(n) - 20).toFixed(1)})`);
    out.push(L.svg);
    out.push(text('C2', nx0(n) + 3.5, ny(n) + 2.9, 4.2, '#fff', { sw: 0.8, op: 0.6 }));
  }
  // 2025-2029: a whole-bar rest
  const rx = xc(122.4), ry = yr(PEDAL_ROW) + 3;
  out.push(`<path d="M${f(rx)} ${f(ry)}h11" stroke="${C.dim}" stroke-width="1"/><rect x="${f(rx + 2.5)}" y="${f(ry)}" width="6" height="3.2" fill="${C.dim}"/>`);
  out.push(text('NOTHING VAGUE YET', rx + 15, ry - 0.6, 5, C.dim, { sw: 0.85 }));
}

// ------------------------------------------------------------------ the roll: notes lighting up
// Notes that start and stop together share one overlay and one keyframe set.
{
  const groups = new Map();
  for (const n of notes) {
    const key = `${n.c0}-${n.c1}`;
    if (!groups.has(key)) groups.set(key, { c0: n.c0, c1: n.c1, d: '', pedal: !!n.pedal });
    groups.get(key).d += `M${f(nx0(n))} ${f(ny(n))}h${f(nw(n))}v${NOTE_H}h${f(-nw(n))}z`;
  }
  for (const g of groups.values()) {
    out.push(`<path class="fl ${g.pedal ? 'fp' : 'fn'}" d="${g.d}"${flashStyle(g.c0, g.c1)}/>`);
  }
}

// The finale: everything, on one timeline, lit at once (a slow fade, not a flash).
{
  let d = '';
  for (const n of notes) if (!n.pedal) d += `M${f(nx0(n))} ${f(ny(n))}h${f(nw(n))}v${NOTE_H}h${f(-nw(n))}z`;
  out.push(`<path class="fin" d="${d}" fill="#fff" fill-opacity=".2" opacity="0"/>`);
  cssParts.push(`.fin{animation:fin ${LOOP}s linear infinite}@keyframes fin{0%,${pct(FR_NOW)}{opacity:0}${pct(FR_NOW + 0.03)},${pct(0.975)}{opacity:1}100%{opacity:0}}`);
}

// ------------------------------------------------------------------ keyboard
{
  const KB0 = LC0, KB1 = LC1, KBW = KB1 - KB0;
  const BKW = KBW * 0.6;
  // a white key reaches halfway into the black rows on either side of it
  const whiteSpan = (r) => {
    const top = r > 0 && isBlack(r - 1) ? yr(r) - ROWH / 2 : yr(r);
    const bot = r < ROWS - 1 && isBlack(r + 1) ? yr(r + 1) + ROWH / 2 : yr(r + 1);
    return [Math.max(top, ROLL_Y), Math.min(bot, ROLL_END)];
  };
  let whites = '', seps = '', blacks = '', litW = '', litB = '', names = '';
  for (let r = 0; r < ROWS; r++) {
    const hits = notes.filter((n) => n.row === r).sort((a, b) => a.c0 - b.c0);
    let cls = '';
    if (hits.length) {
      cls = `k k${r}`;
      const stops = [];
      const put = (fr, col) => {
        const p = pct(fr);
        if (stops.length && stops[stops.length - 1][0] === p) stops[stops.length - 1][1] = col;
        else stops.push([p, col]);
      };
      put(0, '#0000');
      hits.forEach((n, j) => {
        put(frOfCol(n.c0), KINDS[n.kind].col);
        const next = hits[j + 1];
        if (!next || next.c0 > n.c1) put(frOfCol(n.c1), '#0000');
      });
      cssParts.push(`@keyframes k${r}{${stops.map(([p, col]) => `${p}{fill:${col}}`).join('')}}.k${r}{animation-name:k${r}}`);
    }
    if (isBlack(r)) {
      blacks += `M${KB0} ${f(yr(r) + 0.6)}h${f(BKW)}v${ROWH - 1.2}h${f(-BKW)}z`;
      if (cls) litB += `<rect class="${cls}" x="${KB0 + 1.5}" y="${f(yr(r) + 2)}" width="${f(BKW - 3)}" height="${ROWH - 4}" rx="1"/>`;
    } else {
      const [t, b] = whiteSpan(r);
      whites += `M${KB0} ${f(t)}H${KB1}V${f(b)}H${KB0}z`;
      seps += `M${KB0} ${f(b)}H${KB1}`;
      if (cls) litW += `<rect class="${cls}" x="${KB0 + 0.5}" y="${f(t + 0.6)}" width="${KBW - 1}" height="${f(b - t - 1.2)}"/>`;
      if (midiOf(r) % 12 === 0) names += text(noteName(r), KB1 - 3, (t + b) / 2 - 2.1, 4.2, C.keyInk, { anchor: 'end', sw: 0.8 });
    }
  }
  defs.push(`<linearGradient id="ksh" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".22"/><stop offset=".12" stop-color="#000" stop-opacity="0"/><stop offset=".9" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".18"/></linearGradient>`);
  out.push(`<path d="${whites}" fill="${C.wkey}"/>`);
  out.push(`<g opacity=".92">${litW}</g>`);
  out.push(`<rect x="${KB0}" y="${ROLL_Y}" width="${KBW}" height="${ROWS * ROWH}" fill="url(#ksh)"/>`);
  out.push(`<path d="${seps}" stroke="${C.wkeyEdge}" stroke-width=".8"/>`);
  out.push(names);
  out.push(`<path d="${blacks}" fill="${C.bkey}"/>`);
  out.push(`<g opacity=".95">${litB}</g>`);
  out.push(`<path d="M${KB1 + 0.5} ${ROLL_Y}V${ROLL_END}" stroke="#000" stroke-width="1.5"/>`);
  out.push(`<rect x="${KB0}" y="${ROLL_Y}" width="${X1 - KB0}" height="${ROWS * ROWH}" fill="none" stroke="#fff" stroke-opacity=".12"/>`);
}

// ------------------------------------------------------------------ velocity lane: how it was
{
  out.push(`<rect x="${X0}" y="${VL_Y}" width="${X1 - X0}" height="${VL_H}" fill="${C.strip}"/>`);
  out.push(`<path d="M${X0} ${VL_Y + VL_H - 3.5}H${X1}" stroke="#fff" stroke-opacity=".12"/>`);
  for (const fr of [0.25, 0.5, 0.75]) out.push(`<path d="M${X0} ${f(VL_Y + VL_H - 3.5 - fr * (VL_H - 10))}H${X1}" stroke="#fff" stroke-opacity=".035" stroke-dasharray="2 3"/>`);
  out.push(`<rect x="${f(xc(NOW_COL))}" y="${VL_Y}" width="${f(X1 - xc(NOW_COL))}" height="${VL_H}" fill="url(#hatch)"/>`);
  out.push(text('VELOCITY', LC0 + 2, VL_Y + 3, 4.4, C.faint, { sw: 0.75 }));
  out.push(text('= HOW IT WAS', LC0 + 2, VL_Y + 10.5, 5.6, C.ink, { sw: 0.95 }));
  // legend: icon + dynamic
  let lx = LC0 + 2;
  for (const [ic, dyn] of [['heart', 'FF'], ['thumb', 'MF'], ['face', 'MP']]) {
    out.push(icon(ic, lx, VL_Y + 21.5, 6, C.dim));
    out.push(text(dyn, lx + 8, VL_Y + 22.5, 4.4, C.dim, { sw: 0.8, skew: -12 }));
    lx += 8 + textW(dyn, 4.4) + 7;
  }
  // stems: one per note start in each letter, height by the letter's reaction
  const base = VL_Y + VL_H - 3.5, span = VL_H - 12;
  const stems = new Map();                // key letter:c0 -> { x, h, col }
  for (const n of notes) {
    const key = `${n.letter}:${n.c0}`;
    if (stems.has(key)) continue;
    const react = n.pedal ? n.pedal.react : LETTERS[n.letter].react;
    const h = span * VELOCITY[react] * (0.86 + 0.14 * rnd());
    stems.set(key, { x: xc(n.c0) + 2.2, h, col: KINDS[n.kind].col, n, react });
  }
  const byCol = new Map();
  for (const s of stems.values()) {
    byCol.set(s.col, (byCol.get(s.col) || '') + `M${f(s.x)} ${base}V${f(base - s.h)}`);
  }
  let heads = '';
  for (const [col, d] of byCol) out.push(`<path d="${d}" stroke="${col}" stroke-width="1.3"/>`);
  for (const s of stems.values()) heads += `<circle cx="${f(s.x)}" cy="${f(base - s.h)}" r="1.6" fill="${s.col}"/>`;
  out.push(heads);
  // one reaction icon per letter, over its tallest stem
  LETTERS.forEach((L, li) => {
    const mine = [...stems.values()].filter((s) => s.n.letter === li);
    const top = mine.reduce((a, s) => (s.h > a.h ? s : a));
    out.push(icon(L.react, top.x - 3.5, base - top.h - 9.5, 7, KINDS[L.kind].col));
  });
  for (const p of PEDALS) {
    const s = stems.get(`-1:${p.c0}`);
    out.push(icon(p.react, s.x - 3.5, base - s.h - 9.5, 7, KINDS[p.kind].col));
  }
  // stems flash as they are struck
  const flash = new Map();
  for (const s of stems.values()) {
    const key = s.n.c0;
    if (!flash.has(key)) flash.set(key, '');
    flash.set(key, flash.get(key) + `M${f(s.x - 1.6)} ${f(base - s.h - 1.6)}h3.2v${f(s.h + 1.6)}h-3.2z`);
  }
  for (const [c0, d] of flash) {
    out.push(`<path class="fl fs" d="${d}"${flashStyle(c0, c0 + 1.8)}/>`);
  }
}

// ------------------------------------------------------------------ status bar: the entry being played
{
  out.push(`<rect x="${X0}" y="${ST_Y}" width="${X1 - X0}" height="${ST_H}" rx="4" fill="${C.inset}" stroke="${C.chromeLine}"/>`);
  out.push(icon('crotchet', LC0 + 1, ST_Y + 6.5, 8, C.gold));
  out.push(text('LOG ENTRY', LC0 + 11, ST_Y + 8, 5.4, C.dim, { sw: 0.9 }));
  const sx = X0 + 8, sy = ST_Y + 7.2, cap = 6.6;
  // the ghost-note filter, on the right (the app's feed switch)
  const gParts = [['FRIENDS & ME', true], ['FRIENDS', false], ['EVERYONE', false]];
  let gx = X1 - 6;
  const gcap = 4.8;
  for (let j = gParts.length - 1; j >= 0; j--) {
    const [lab, on] = gParts[j];
    const w = textW(lab, gcap) + 8;
    gx -= w;
    if (on) out.push(`<rect x="${f(gx)}" y="${ST_Y + 5}" width="${f(w)}" height="12" rx="6" fill="${C.ink}"/>`);
    out.push(text(lab, gx + 4, ST_Y + 8.6, gcap, on ? C.inset : C.dim, { sw: 0.85 }));
    gx -= 2;
  }
  out.push(`<rect x="${f(gx - 1)}" y="${ST_Y + 4}" width="${f(X1 - 6 - gx + 2)}" height="14" rx="7" fill="none" stroke="${C.chromeLine}"/>`);
  const gl = 'GHOST NOTES';
  out.push(text(gl, gx - 6, ST_Y + 8.6, gcap, C.faint, { anchor: 'end', sw: 0.8 }));
  const ghostLeft = gx - 6 - textW(gl, gcap);
  LETTERS.forEach((L, i) => {
    const k = KINDS[L.kind];
    const parts = [{ s: L.title, col: '#fff', sw: 1.12 }, { gap: 4 }, { icon: L.react, col: k.col }];
    if (L.verdict) parts.push({ gap: 2.5 }, { s: L.verdict, col: k.col, sw: 1.05 });
    parts.push({ gap: 9 }, { s: k.one, col: k.col, sw: 1.05 }, { s: `, ${L.creator}${L.detail ? `, ${L.detail}` : ''}`, col: C.dim, sw: 0.95 });
    parts.push({ gap: 9 }, { s: L.when, col: C.gold, sw: 1.05 });
    if (L.note) parts.push({ gap: 9 }, { s: 'NOTE: ', col: C.faint, sw: 0.95 }, { s: L.note, col: C.ink, sw: 0.95, skew: -10 });
    const res = line(parts, sx, sy, cap, { cls: `sw st${i}`, op: 0 });
    if (sx + res.w > ghostLeft - 10) throw new Error(`status for ${L.title} is too long (${(sx + res.w).toFixed(1)} > ${(ghostLeft - 10).toFixed(1)})`);
    out.push(res.svg);
    cssParts.push(...showRule(`st${i}`, [regions[i]]));
  });
  // the finale: the home page's question (with a pun it did not ask for)
  const q = line([{ s: 'WHAT DID YOU PLAY?', col: '#fff', sw: 1.35 }], sx, sy - 0.6, 7.6, {});
  const cx = sx + q.w + 3;
  const fin = `<g class="sw stF">${q.svg}<rect class="cur" x="${f(cx)}" y="${f(sy - 1.4)}" width="1.6" height="9.4" fill="${C.gold}"/>${text('SEARCH BY TITLE, AUTHOR OR ARTIST', cx + 10, sy + 1, 5.6, C.faint, { sw: 0.9 })}</g>`;
  out.push(fin);
  cssParts.push(...showRule('stF', [FINALE]));
}

// ------------------------------------------------------------------ playhead
{
  const x = X0;
  const top = PS_BODY, bot = VL_Y + VL_H;
  defs.push(`<linearGradient id="phg" x1="0" x2="1"><stop offset="0" stop-color="${C.gold}" stop-opacity="0"/><stop offset=".75" stop-color="${C.gold}" stop-opacity=".16"/><stop offset="1" stop-color="${C.gold}" stop-opacity="0"/></linearGradient>`);
  const ph = [
    `<rect x="${x - 16}" y="${ROLL_Y}" width="18" height="${ROWS * ROWH}" fill="url(#phg)"/>`,
    `<path d="M${x} ${top}V${bot}" stroke="${C.gold}" stroke-width="1.3"/>`,
    `<path d="M${x - 4.2} ${RU_Y + 15.5}h8.4l-4.2 5.6z" fill="${C.gold}"/>`,
  ].join('');
  const nowX = xc(NOW_COL) - X0;
  out.push(`<g class="phf"><g class="ph" transform="translate(${f(nowX)} 0)">${ph}</g></g>`);
  cssParts.push(`.ph{animation:ph ${LOOP}s linear infinite}@keyframes ph{0%{transform:translateX(0)}${pct(FR_NOW)}{transform:translateX(${f(nowX)}px)}100%{transform:translateX(${f(nowX)}px)}}`);
  cssParts.push(`.phf{animation:phf ${LOOP}s linear infinite}@keyframes phf{0%{opacity:0}1%{opacity:1}98.6%{opacity:1}100%{opacity:0}}`);
  out.push(NOW_FLAG);
}

// ------------------------------------------------------------------ assemble
const glyphDefs = [...glyphUse].map(([ch, id]) => `<path id="${id}" d="${GLYPHS[ch][1]}"/>`).join('');
const css = [
  '.t{fill:none;stroke-linecap:round;stroke-linejoin:round}',
  `.sw{animation:${LOOP}s step-end infinite}`,
  `.k{fill:#0000;animation:${LOOP}s step-end infinite}`,
  `.fl{opacity:0;animation:${LOOP}s linear infinite}`,
  '.fn,.fp{fill:#fff;stroke:#fff;stroke-width:2.2px;stroke-linejoin:round}.fn{fill-opacity:.42;stroke-opacity:.3}.fp{fill-opacity:.2;stroke-opacity:.25}.fs{fill:#fff;fill-opacity:.7}',
  '.cur{animation:cur 1s step-end infinite}@keyframes cur{0%{opacity:1}50%{opacity:0}}',
  `.nowf{animation:nowf ${LOOP}s linear infinite}@keyframes nowf{0%,${pct(FR_NOW - 0.01)}{opacity:.55}${pct(FR_NOW)},100%{opacity:1}}`,
  '.pp{animation:pp 2s ease-in-out infinite}@keyframes pp{50%{opacity:.55}}',
  ...cssParts,
  '@media (prefers-reduced-motion:reduce){.sw,.k,.ph,.phf,.cur,.nowf,.pp,.fin,.fl{animation:none!important}}',
].join('');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="MediaLog: everything you've watched, read, played, listened to, on one timeline. A piano roll whose notes spell MediaLog.">
<title>MediaLog: a media diary, as a piano roll</title>
<defs>
<style>${css}</style>
${glyphDefs}
${defs.join('\n')}
</defs>
${out.join('\n')}
</svg>
`;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, svg);
const kb = (Buffer.byteLength(svg) / 1024).toFixed(1);
console.log(`${path.relative(process.cwd(), OUT)}: ${kb} KB, ${W}x${H}, ${notes.length} notes (${notes.filter((n) => n.pedal).length} pedals), ${GHOSTS.length} ghosts`);
LETTERS.forEach((L, i) => console.log(`  ${L.ch} cols ${L.c0}-${L.c1 - 1}  t ${(regions[i][0] * LOOP).toFixed(2)}-${(regions[i][1] * LOOP).toFixed(2)} s  ${L.kind}`));
