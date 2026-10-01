#!/usr/bin/env node
// CASTAWAY README header: "Fake Desktop Takeover" (03-desktop-takeover_opus_5.5).
// Plain Node, no dependencies, fully deterministic (seeded PRNG, no clock).
//   node examples/castaway/src/03-desktop-takeover_opus_5.5.mjs
// writes examples/castaway/assets/03-desktop-takeover_opus_5.5.svg
//
// The style (catalogue entry pc-10) is the cracktro that pretends to be the
// viewer's own desktop: a flat teal desktop with the name as a huge darker-teal
// lowercase wallpaper wordmark, two icons, a grey taskbar, and one small
// dialog with the info in monospace on a teal-green panel. It looks like
// nothing special. That is the joke.
//
// Castaway is a remake of a screensaver, so here the desktop goes idle and the
// island takes over. While you page through the dialog, a palm grows up behind
// it and shallow water creeps out from under it. The window is minimised, the
// teal turns out to have been sea all along, the wordmark turns into the
// clouds, and she sits under the palm nodding to her headphones. Then the
// project's oldest joke plays out: she sips a coconut, eyes closed, and a ship
// crosses the horizon exactly then. Two lanes busy at once, so the taskbar
// shows two running tasks (named after real entries in activities.toml). By
// the time she looks up and waves, the sea is empty. Somebody moves the mouse,
// the island is gone in one hard cut, and the dialog comes back.
//
// Nothing is copied from a real desktop: no logos, wordmarks, icons or fonts.
// The wordmark letters, pixel fonts, icons, palm, girl, ship and crab are all
// drawn in this file. Text is merged pixel glyphs or vector paths: no <text>.
// Drawn on a 416x234 logical grid (16:9, like the video), shown at 2x.
// Animation is CSS keyframes only, one 30 s loop (10 bars of the 80 BPM theme,
// 40 beats). Reduced motion freezes every animation on the 16.5 s frame: the
// coconut, the ship mid-horizon, both lanes busy.

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const SLUG = '03-desktop-takeover_opus_5.5';
const OUT = resolve(here, `../assets/${SLUG}.svg`);

// ---------------------------------------------------------------- basics
const W = 416;
const H = 234;
const TBY = 219; // taskbar top
const HZ = 106; // horizon
const T = 30; // loop length, seconds (10 bars of 3 s)
const BEAT = 0.75;
const STATIC = 16.5; // the frame shown when motion is reduced

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(1992); // the project's default seed
const n1 = (v) => +v.toFixed(1);
const n2 = (v) => +v.toFixed(2);

// ---------------------------------------------------------------- palette
const P = {
  face: '#c0c0c0',
  hi: '#ffffff',
  light: '#dfdfdf',
  shadow: '#808080',
  frame: '#0a0a0a',
  navy: '#000080',
  teal: '#008080',
  wall: '#006667', // the wallpaper wordmark, a darker teal
  ink: '#000000',
  panel: '#0e6a58', // teal-green dialog panel
  pText: '#d4f5e6',
  pHead: '#ffec8a',
  pCmd: '#ffffff',
};
const C = {
  sky0: '#2b86da', sky1: '#5fb3ec', sky2: '#b9e4f8', sky3: '#e3f6fd',
  sea0: '#1b72c4', sea1: '#1690cf', sea2: '#19acd0', sea3: '#2cc3cc',
  shallow: '#5fdccb', shallow2: '#9ff0de',
  foam: '#ffffff',
  sand: '#f5e1a8', sandHi: '#fcf0cc', sandSh: '#e3c584', sandWet: '#d7bd85',
  trunk: '#a9653f', trunkHi: '#cf9262', trunkSh: '#7c4329',
  leafD: '#1f7a37', leaf: '#3aa845', leafL: '#86d35b', leafBack: '#1b6532', leafBack2: '#2c8a3d',
  nut: '#6a4426', nutHi: '#8f6238',
  rock: '#8e9aa3', rockSh: '#66727c', rockHi: '#b8c2c8',
  shrub: '#3f9b40', shrubL: '#6cc04f', shrubD: '#2c7834',
  log: '#a65a3a', logD: '#7b3e27', logEnd: '#d9a06c', rope: '#ead39a',
  skin: '#f0c19c', skinSh: '#d79c78', hair: '#6a3c21', hairHi: '#8c5733',
  hp: '#f6eedb', hpSh: '#d3c39f', coral: '#ee7a62', coralSh: '#cc5d48',
  shorts: '#f2e8d0', shortsSh: '#d9cba9', eye: '#3a2317',
  cloud: '#ffffff', cloudSh: '#c3d9ef', cloudSh2: '#a9c6e6',
  hull: '#26344f', hullRed: '#c8483a', cabin: '#f4f1ea', funnel: '#e9a23b',
};

// ---------------------------------------------------------------- pixel fonts
// UI font: proportional pixel sans, cap height 7, 2-row descenders.
// (Technique and glyph table carried over from this repo's ultra-satisfactory
// desktop generator; extended with '_' and a few more.)
const UI = {
  A: '..#..|.#.#.|.#.#.|#...#|#####|#...#|#...#',
  B: '####.|#...#|#...#|####.|#...#|#...#|####.',
  C: '.###.|#...#|#....|#....|#....|#...#|.###.',
  D: '####.|#...#|#...#|#...#|#...#|#...#|####.',
  E: '####|#...|#...|###.|#...|#...|####',
  F: '####|#...|#...|###.|#...|#...|#...',
  G: '.###.|#...#|#....|#.###|#...#|#...#|.###.',
  H: '#...#|#...#|#...#|#####|#...#|#...#|#...#',
  I: '#|#|#|#|#|#|#',
  M: '#...#|##.##|#.#.#|#.#.#|#...#|#...#|#...#',
  N: '#...#|##..#|##..#|#.#.#|#..##|#..##|#...#',
  O: '.###.|#...#|#...#|#...#|#...#|#...#|.###.',
  P: '####.|#...#|#...#|####.|#....|#....|#....',
  R: '####.|#...#|#...#|####.|#.#..|#..#.|#...#',
  S: '.###.|#...#|#....|.###.|....#|#...#|.###.',
  T: '#####|..#..|..#..|..#..|..#..|..#..|..#..',
  U: '#...#|#...#|#...#|#...#|#...#|#...#|.###.',
  W: '#...#|#...#|#...#|#.#.#|#.#.#|##.##|#...#',
  a: '....|....|.##.|...#|.###|#..#|.###',
  b: '#...|#...|###.|#..#|#..#|#..#|###.',
  c: '....|....|.###|#...|#...|#...|.###',
  d: '...#|...#|.###|#..#|#..#|#..#|.###',
  e: '....|....|.##.|#..#|####|#...|.###',
  f: '.##|#..|###|#..|#..|#..|#..',
  g: '....|....|.###|#..#|#..#|#..#|.###|...#|.##.',
  h: '#...|#...|###.|#..#|#..#|#..#|#..#',
  i: '#|.|#|#|#|#|#',
  k: '#...|#...|#..#|#.#.|##..|#.#.|#..#',
  l: '#|#|#|#|#|#|#',
  m: '.....|.....|####.|#.#.#|#.#.#|#.#.#|#.#.#',
  n: '....|....|###.|#..#|#..#|#..#|#..#',
  o: '....|....|.##.|#..#|#..#|#..#|.##.',
  p: '....|....|###.|#..#|#..#|#..#|###.|#...|#...',
  r: '...|...|#.#|##.|#..|#..|#..',
  s: '....|....|.###|#...|.##.|...#|###.',
  t: '.#.|.#.|###|.#.|.#.|.#.|..#',
  u: '....|....|#..#|#..#|#..#|#..#|.###',
  v: '.....|.....|#...#|#...#|.#.#.|.#.#.|..#..',
  w: '.....|.....|#...#|#.#.#|#.#.#|#.#.#|.#.#.',
  x: '....|....|#..#|#..#|.##.|#..#|#..#',
  y: '....|....|#..#|#..#|#..#|#..#|.###|...#|.##.',
  0: '.##.|#..#|#..#|#..#|#..#|#..#|.##.',
  1: '.#.|##.|.#.|.#.|.#.|.#.|###',
  2: '.##.|#..#|...#|..#.|.#..|#...|####',
  3: '.##.|#..#|...#|.##.|...#|#..#|.##.',
  '.': '.|.|.|.|.|.|#',
  ':': '.|.|.|#|.|.|#',
  '-': '...|...|...|...|###|...|...',
  _: '....|....|....|....|....|....|....|####',
  '<': '...|..#|.#.|#..|.#.|..#|...',
  '>': '...|#..|.#.|..#|.#.|#..|...',
};
const BOLD = {
  A: '..###..|.##.##.|.##.##.|##...##|#######|##...##|##...##',
  M: '##...##|###.###|#######|##.#.##|##...##|##...##|##...##',
  W: '##...##|##...##|##...##|##.#.##|##.#.##|#######|.##.##.',
  m: '.......|.......|######.|##.#.##|##.#.##|##.#.##|##.#.##',
  w: '.......|.......|##...##|##.#.##|##.#.##|#######|.##.##.',
};
// 5x7 monospace for the dialog panel.
const F5 = {
  A: '.###.|#...#|#...#|#####|#...#|#...#|#...#',
  B: '####.|#...#|#...#|####.|#...#|#...#|####.',
  C: '.###.|#...#|#....|#....|#....|#...#|.###.',
  D: '###..|#..#.|#...#|#...#|#...#|#..#.|###..',
  E: '#####|#....|#....|####.|#....|#....|#####',
  F: '#####|#....|#....|####.|#....|#....|#....',
  G: '.###.|#...#|#....|#.###|#...#|#...#|.####',
  H: '#...#|#...#|#...#|#####|#...#|#...#|#...#',
  I: '.###.|..#..|..#..|..#..|..#..|..#..|.###.',
  K: '#...#|#..#.|#.#..|##...|#.#..|#..#.|#...#',
  L: '#....|#....|#....|#....|#....|#....|#####',
  M: '#...#|##.##|#.#.#|#.#.#|#...#|#...#|#...#',
  N: '#...#|#...#|##..#|#.#.#|#..##|#...#|#...#',
  O: '.###.|#...#|#...#|#...#|#...#|#...#|.###.',
  P: '####.|#...#|#...#|####.|#....|#....|#....',
  R: '####.|#...#|#...#|####.|#.#..|#..#.|#...#',
  S: '.####|#....|#....|.###.|....#|....#|####.',
  T: '#####|..#..|..#..|..#..|..#..|..#..|..#..',
  U: '#...#|#...#|#...#|#...#|#...#|#...#|.###.',
  V: '#...#|#...#|#...#|#...#|#...#|.#.#.|..#..',
  W: '#...#|#...#|#...#|#.#.#|#.#.#|#.#.#|.#.#.',
  Y: '#...#|#...#|.#.#.|..#..|..#..|..#..|..#..',
  a: '.....|.....|.###.|....#|.####|#...#|.####',
  b: '#....|#....|#.##.|##..#|#...#|#...#|####.',
  c: '.....|.....|.###.|#....|#....|#...#|.###.',
  d: '....#|....#|.##.#|#..##|#...#|#...#|.####',
  e: '.....|.....|.###.|#...#|#####|#....|.###.',
  f: '..##.|.#..#|.#...|###..|.#...|.#...|.#...',
  g: '.....|.....|.####|#...#|#...#|#...#|.####|....#|.###.',
  h: '#....|#....|#.##.|##..#|#...#|#...#|#...#',
  i: '..#..|.....|.##..|..#..|..#..|..#..|.###.',
  k: '#....|#....|#..#.|#.#..|##...|#.#..|#..#.',
  l: '.##..|..#..|..#..|..#..|..#..|..#..|.###.',
  m: '.....|.....|##.#.|#.#.#|#.#.#|#.#.#|#...#',
  n: '.....|.....|#.##.|##..#|#...#|#...#|#...#',
  o: '.....|.....|.###.|#...#|#...#|#...#|.###.',
  p: '.....|.....|####.|#...#|#...#|#...#|####.|#....|#....',
  q: '.....|.....|.####|#...#|#...#|#...#|.####|....#|....#',
  r: '.....|.....|#.##.|##..#|#....|#....|#....',
  s: '.....|.....|.####|#....|.###.|....#|####.',
  t: '.#...|.#...|###..|.#...|.#...|.#..#|..##.',
  u: '.....|.....|#...#|#...#|#...#|#..##|.##.#',
  v: '.....|.....|#...#|#...#|#...#|.#.#.|..#..',
  w: '.....|.....|#...#|#...#|#.#.#|#.#.#|.#.#.',
  x: '.....|.....|#...#|.#.#.|..#..|.#.#.|#...#',
  y: '.....|.....|#...#|#...#|#...#|#...#|.####|....#|.###.',
  z: '.....|.....|#####|...#.|..#..|.#...|#####',
  0: '.###.|#...#|#..##|#.#.#|##..#|#...#|.###.',
  1: '..#..|.##..|..#..|..#..|..#..|..#..|.###.',
  2: '.###.|#...#|....#|...#.|..#..|.#...|#####',
  3: '#####|...#.|..#..|...#.|....#|#...#|.###.',
  4: '...#.|..##.|.#.#.|#..#.|#####|...#.|...#.',
  5: '#####|#....|####.|....#|....#|#...#|.###.',
  6: '..##.|.#...|#....|####.|#...#|#...#|.###.',
  7: '#####|....#|...#.|..#..|.#...|.#...|.#...',
  8: '.###.|#...#|#...#|.###.|#...#|#...#|.###.',
  9: '.###.|#...#|#...#|.####|....#|...#.|.##..',
  '.': '.....|.....|.....|.....|.....|.##..|.##..',
  ',': '.....|.....|.....|.....|.....|.##..|.##..|..#..|.#...',
  ':': '.....|.##..|.##..|.....|.##..|.##..|.....',
  '-': '.....|.....|.....|.###.|.....|.....|.....',
  '>': '.#...|..#..|...#.|....#|...#.|..#..|.#...',
  '/': '....#|....#|...#.|..#..|.#...|#....|#....',
  '_': '.....|.....|.....|.....|.....|.....|.....|#####',
  '+': '.....|..#..|..#..|#####|..#..|..#..|.....',
};

// Rows of '#' into one path of merged rectangles (runs merged vertically too).
function bitmapPath(rows, ox = 0, oy = 0) {
  const rects = [];
  let open = new Map();
  rows.forEach((row, y) => {
    const next = new Map();
    for (let x = 0; x < row.length; ) {
      if (row[x] !== '#') { x++; continue; }
      let x2 = x;
      while (x2 < row.length && row[x2] === '#') x2++;
      const key = `${x},${x2 - x}`;
      const rc = open.get(key) || (rects.push({ x, y, w: x2 - x, h: 0 }), rects[rects.length - 1]);
      rc.h++;
      next.set(key, rc);
      x = x2;
    }
    open = next;
  });
  return rects.map((r) => `M${ox + r.x} ${oy + r.y}h${r.w}v${r.h}h${-r.w}z`).join('');
}
// Multi-colour pixel sprite: rows of palette characters, one merged path per colour.
function sprite(rows, pal, ox = 0, oy = 0) {
  const w = rows[0].length;
  rows.forEach((r, i) => { if (r.length !== w) throw new Error(`sprite row ${i} "${r}" is ${r.length} wide, expected ${w}`); });
  let s = '';
  for (const [ch, col] of Object.entries(pal)) {
    const d = bitmapPath(rows.map((r) => [...r].map((c) => (c === ch ? '#' : '.')).join('')), ox, oy);
    if (d) s += `<path fill="${col}" d="${d}"/>`;
  }
  return s;
}

function makeFont(prefix, table, { bold = false, mono = 0, space = 3 } = {}) {
  const used = new Map();
  const rowsOf = (ch) => {
    if (bold && BOLD[ch]) return BOLD[ch].split('|');
    const src = table[ch];
    if (src === undefined) throw new Error(`font ${prefix}: no glyph for ${JSON.stringify(ch)}`);
    let rows = src.split('|');
    if (bold) {
      rows = rows.map((r) => {
        const a = `${r}.`;
        const b = `.${r}`;
        return [...a].map((c, i) => (c === '#' || b[i] === '#' ? '#' : '.')).join('');
      });
    }
    return rows;
  };
  const font = {
    adv: (ch) => (mono || (ch === ' ' ? space : rowsOf(ch)[0].length + 1)),
    id(ch) {
      const id = prefix + ch.codePointAt(0).toString(36);
      if (!used.has(id)) used.set(id, bitmapPath(rowsOf(ch)));
      return id;
    },
    width: (str) => [...str].reduce((w, ch) => w + font.adv(ch), 0) - (mono ? 0 : 1),
    defs: () => [...used].map(([id, d]) => `<path id="${id}" d="${d}"/>`).join(''),
  };
  return font;
}
const ui = makeFont('u', UI);
const uib = makeFont('b', UI, { bold: true, space: 4 });
const mono = makeFont('m', F5, { mono: 6 });

function text(font, str, x, y, fill = P.ink, attrs = '') {
  let s = `<g transform="translate(${x} ${y})" fill="${fill}"${attrs ? ` ${attrs}` : ''}>`;
  let cx = 0;
  for (const ch of str) {
    if (ch !== ' ') s += `<use href="#${font.id(ch)}"${cx ? ` x="${cx}"` : ''}/>`;
    cx += font.adv(ch);
  }
  return `${s}</g>`;
}
const textC = (font, str, cx, y, fill, attrs) => text(font, str, Math.round(cx - font.width(str) / 2), y, fill, attrs);

// ---------------------------------------------------------------- bevels
const rect = (x, y, w, h, fill, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"${extra ? ` ${extra}` : ''}/>`;
const tl = (x, y, w, h) => `M${x} ${y}h${w - 1}v1h${-(w - 2)}v${h - 2}h-1z`;
const br = (x, y, w, h) => `M${x} ${y + h}h${w}v${-h}h-1v${h - 1}h${-(w - 1)}z`;
const BEVEL = {
  win: [P.light, P.hi, P.shadow, P.frame],
  btn: [P.hi, P.light, P.shadow, P.frame],
  sunk: [P.shadow, P.frame, P.light, P.hi],
  down: [P.frame, P.shadow, P.light, P.hi],
};
function bevel(x, y, w, h, kind, face = P.face) {
  const [a, b, c, d] = BEVEL[kind];
  return (
    rect(x, y, w, h, face) +
    `<path fill="${a}" d="${tl(x, y, w, h)}"/><path fill="${d}" d="${br(x, y, w, h)}"/>` +
    `<path fill="${b}" d="${tl(x + 1, y + 1, w - 2, h - 2)}"/><path fill="${c}" d="${br(x + 1, y + 1, w - 2, h - 2)}"/>`
  );
}
const thin = (x, y, w, h) => `<path fill="${P.shadow}" d="${tl(x, y, w, h)}"/><path fill="${P.hi}" d="${br(x, y, w, h)}"/>`;

// ---------------------------------------------------------------- CSS timeline helpers
const css = [];
let kc = 0;
const pct = (t, dur = T) => `${+((t / dur) * 100).toFixed(3)}%`;
// Visible during the union of [a, b) intervals (seconds into the loop).
function vis(intervals) {
  const name = `v${(kc++).toString(36)}`;
  const on = (t) => intervals.some(([a, b]) => t >= a && t < b);
  const pts = [...new Set([0, ...intervals.flat()])].filter((t) => t >= 0 && t < T).sort((a, b) => a - b);
  let s = `@keyframes ${name}{`;
  for (const t of pts) s += `${pct(t)}{opacity:${on(t) ? 1 : 0}}`;
  s += `100%{opacity:${on(T - 1e-6) ? 1 : 0}}}`;
  css.push(s, `.${name}{animation-name:${name}}`);
  return `class="a ${name}"`;
}
// Translate keyframes: [[t, x, y, easing-for-the-next-segment]], must cover 0 and T.
function move(points) {
  const name = `m${(kc++).toString(36)}`;
  let s = `@keyframes ${name}{`;
  for (const [t, x, y, ease = 'linear'] of points) {
    s += `${pct(t)}{transform:translate(${n2(x)}px,${n2(y)}px);animation-timing-function:${ease}}`;
  }
  css.push(`${s}}`, `.${name}{animation-name:${name}}`);
  return `class="a ${name}"`;
}
// A short loop of N frames (each frame shown 1/N of the period).
function frames(period, n) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const name = `f${(kc++).toString(36)}`;
    const a = (i / n) * 100, b = ((i + 1) / n) * 100;
    let s = `@keyframes ${name}{0%{opacity:${i === 0 ? 1 : 0}}`;
    if (i > 0) s += `${+a.toFixed(3)}%{opacity:1}`;
    if (b < 100) s += `${+b.toFixed(3)}%{opacity:0}`;
    s += `100%{opacity:${i === n - 1 ? 1 : 0}}}`;
    css.push(s, `.${name}{animation:${name} ${period}s step-end infinite}`);
    out.push(`class="${name}"`);
  }
  return out;
}
// A smooth back-and-forth drift, period seconds.
function drift(period, dx, dy = 0) {
  const name = `d${(kc++).toString(36)}`;
  css.push(
    `@keyframes ${name}{0%,100%{transform:translate(0,0)}50%{transform:translate(${dx}px,${dy}px)}}`,
    `.${name}{animation:${name} ${period}s ease-in-out infinite}`,
  );
  return `class="${name}"`;
}
// A stepped bob: offset for the second half of each period.
function bob(period, dx, dy) {
  const name = `b${(kc++).toString(36)}`;
  css.push(
    `@keyframes ${name}{0%{transform:translate(0,0)}50%{transform:translate(${dx}px,${dy}px)}100%{transform:translate(${dx}px,${dy}px)}}`,
    `.${name}{animation:${name} ${period}s step-end infinite}`,
  );
  return `class="${name}"`;
}
const between = (a, b, f) => a + (b - a) * f;

// ---------------------------------------------------------------- the timeline
// 0-9 s: the desktop. Three pages of the dialog, one bar each. The island creeps.
// 9 s: minimised. 9.75 sea, 10.5 sky. 13.5-21.75 coconut_sip; 14.25-21 the ship.
// 22.5 she waves at an empty sea. 26.25 the mouse moves. 27 hard cut. 28.8 restored.
const TL = {
  page: [[0, 3], [3, 6], [6, 9]],
  dlgOff: 9.0,
  dlgOn: 28.8,
  tealWaves: 3.0,
  frondsA: 4.5,
  palm: 6.0,
  island: 7.5,
  sea: 9.75,
  sky: 10.5,
  dune: 11.25,
  sip: [13.5, 21.75],
  ship: [14.25, 21.0],
  wave: 22.5,
  crab: [15.0, 24.0],
  jiggle: 26.25,
  cut: 27.0,
  restoreClick: 28.5,
};
const DLG_SPANS = [[0, TL.dlgOff], [TL.dlgOn, T]];

// ---------------------------------------------------------------- the wordmark
// A heavy geometric lowercase of my own, built from strokes and polygons in
// design units: baseline 0, x-height 42, stroke 12.
const GL = {
  c: { adv: 38, parts: [{ s: 'M32.15 -31.04A15 15 0 1 0 32.15 -10.96', w: 12 }] },
  a: {
    adv: 42,
    parts: [
      { s: 'M36 -21A15 15 0 1 0 6 -21A15 15 0 1 0 36 -21', w: 12 },
      { p: [[30, -42], [42, -42], [42, 0], [30, 0]] },
    ],
  },
  s: { adv: 34, parts: [{ s: 'M27.2 -33.4A11.5 8 0 1 0 17 -21A11.5 8 0 1 1 6.8 -8.6', w: 10.5 }] },
  t: {
    adv: 27,
    parts: [
      { p: [[5, -49], [17, -55], [17, -14], [5, -14]] },
      { s: 'M11 -16A9 9 0 0 0 20 -6.5H26', w: 12 },
      { p: [[0, -42], [26, -42], [26, -31], [0, -31]] },
    ],
  },
  w: {
    adv: 61,
    parts: [
      { p: [[0, -42], [13, -42], [25, 0], [12, 0]] },
      { p: [[12, 0], [25, 0], [37, -42], [24, -42]] },
      { p: [[24, -42], [37, -42], [49, 0], [36, 0]] },
      { p: [[36, 0], [49, 0], [61, -42], [48, -42]] },
    ],
  },
  y: {
    adv: 37,
    parts: [
      { p: [[0, -42], [13, -42], [25, 0], [12, 0]] },
      { p: [[24, -42], [37, -42], [21, 14], [8, 14]] },
    ],
  },
};
const WORD = 'castaway';
const WGAP = 5;
const wordW = [...WORD].reduce((w, ch) => w + GL[ch].adv, 0) + WGAP * (WORD.length - 1);
const WS = 0.905; // scale to logical pixels
const WX = Math.round((W - wordW * WS) / 2) + 6;
const WY = 59; // baseline
function wordmark(fill, fatten = 0, dy = 0) {
  let out = `<g transform="translate(${WX} ${WY + dy}) scale(${WS})" fill="${fill}" stroke="${fill}"${fatten ? ' stroke-linejoin="round" stroke-linecap="round"' : ''}>`;
  let cx = 0;
  for (const ch of WORD) {
    const g = GL[ch];
    out += `<g transform="translate(${cx} 0)">`;
    for (const part of g.parts) {
      if (part.s) out += `<path d="${part.s}" fill="none" stroke-width="${part.w + fatten}"/>`;
      else out += `<path d="M${part.p.map((q) => q.join(' ')).join('L')}Z"${fatten ? ` stroke-width="${fatten}"` : ' stroke="none"'}/>`;
    }
    out += '</g>';
    cx += g.adv + WGAP;
  }
  return `${out}</g>`;
}

// ---------------------------------------------------------------- geometry helpers
const q2 = (a, b, c, t) => [(1 - t) * (1 - t) * a[0] + 2 * (1 - t) * t * b[0] + t * t * c[0], (1 - t) * (1 - t) * a[1] + 2 * (1 - t) * t * b[1] + t * t * c[1]];
const q2d = (a, b, c, t) => [2 * (1 - t) * (b[0] - a[0]) + 2 * t * (c[0] - b[0]), 2 * (1 - t) * (b[1] - a[1]) + 2 * t * (c[1] - b[1])];
const c3 = (p0, p1, p2, p3, t) => {
  const u = 1 - t;
  return [0, 1].map((k) => u * u * u * p0[k] + 3 * u * u * t * p1[k] + 3 * u * t * t * p2[k] + t * t * t * p3[k]);
};
const c3d = (p0, p1, p2, p3, t) => {
  const u = 1 - t;
  return [0, 1].map((k) => 3 * u * u * (p1[k] - p0[k]) + 6 * u * t * (p2[k] - p1[k]) + 3 * t * t * (p3[k] - p2[k]));
};
const norm = (v) => { const l = Math.hypot(v[0], v[1]) || 1; return [v[0] / l, v[1] / l]; };
const poly = (pts) => `M${pts.map((p) => `${n1(p[0])} ${n1(p[1])}`).join('L')}Z`;
// Closed smooth blob through points (quadratic midpoints).
function blob(pts) {
  const m = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const n = pts.length;
  let d = `M${n1(m(pts[n - 1], pts[0])[0])} ${n1(m(pts[n - 1], pts[0])[1])}`;
  for (let i = 0; i < n; i++) {
    const p = pts[i], mm = m(p, pts[(i + 1) % n]);
    d += `Q${n1(p[0])} ${n1(p[1])} ${n1(mm[0])} ${n1(mm[1])}`;
  }
  return `${d}Z`;
}
function ellipseBlob(cx, cy, rx, ry, jitter, n = 18) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const j = 1 + (rand() - 0.5) * jitter;
    pts.push([cx + Math.cos(a) * rx * j, cy + Math.sin(a) * ry * j]);
  }
  return blob(pts);
}

// ---------------------------------------------------------------- scene pieces
const defs = [];
const parts = [];
const push = (s) => parts.push(s);

// Sky and sea gradients, shallow-water glow.
defs.push(
  `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="${HZ}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${C.sky0}"/><stop offset=".45" stop-color="${C.sky1}"/><stop offset=".85" stop-color="${C.sky2}"/><stop offset="1" stop-color="${C.sky3}"/></linearGradient>`,
  `<linearGradient id="sea" x1="0" y1="${HZ}" x2="0" y2="${TBY}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${C.sea0}"/><stop offset=".3" stop-color="${C.sea1}"/><stop offset=".7" stop-color="${C.sea2}"/><stop offset="1" stop-color="${C.sea3}"/></linearGradient>`,
  `<radialGradient id="shoal" cx="210" cy="181" r="140" gradientTransform="translate(0 ${181 * 0.78}) scale(1 0.22)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${C.shallow2}"/><stop offset=".45" stop-color="${C.shallow}"/><stop offset=".8" stop-color="${C.shallow}" stop-opacity=".55"/><stop offset="1" stop-color="${C.shallow}" stop-opacity="0"/></radialGradient>`,
  `<pattern id="dith" width="2" height="2" patternUnits="userSpaceOnUse"><rect width="2" height="2" fill="${P.face}"/><rect width="1" height="1" fill="${P.hi}"/><rect x="1" y="1" width="1" height="1" fill="${P.hi}"/></pattern>`,
  `<clipPath id="scr"><rect width="${W}" height="${H}"/></clipPath>`,
  `<clipPath id="bank"><rect x="-40" y="-80" width="${wordW + 80}" height="88"/></clipPath>`,
);

// Wave crests: short white arcs, smaller and denser towards the horizon.
function crests(count, avoid, yMin = HZ + 3, yMax = TBY - 4) {
  let d = '';
  let made = 0, guard = 0;
  while (made < count && guard++ < 5000) {
    const f = rand() ** 1.35;
    const y = yMin + f * (yMax - yMin);
    const x = 4 + rand() * (W - 8);
    if (avoid && avoid(x, y)) continue;
    const len = 2 + f * 9 + rand() * 3;
    const lift = 0.4 + f * 1.2;
    d += `M${n1(x)} ${n1(y)}q${n1(len / 2)} ${n1(-lift)} ${n1(len)} 0`;
    made++;
  }
  return d;
}
const nearIsland = (x, y) => ((x - 210) / 150) ** 2 + ((y - 183) / 34) ** 2 < 1;

// ---- the island (vector, painted look)
function islandBase() {
  let s = '';
  // shallow water glow
  s += `<ellipse cx="210" cy="181" rx="140" ry="31" fill="url(#shoal)"/>`;
  // foam rings: shore waves, one bar in, one bar out
  // Each ring is a run of tapered brush strokes: fat on the near shore, thin
  // round the back, with ragged gaps, so it reads as foam and not as a dashed
  // outline.
  const [fa, fb] = frames(3, 2);
  const ring = (rx, ry, wMax, seed, op) => {
    const pr = mulberry32(seed);
    const cx = 210, cy = 181.5;
    let d = '';
    let a = pr() * 0.6;
    const end = a + Math.PI * 2 - 0.06;
    while (a < end - 0.08) {
      const len = Math.min(0.2 + pr() * 0.42, end - a);
      const j = 1 + (pr() - 0.5) * 0.05; // each stroke sits a little in or out
      const N = Math.max(4, Math.round(len * 16));
      const out = [], inn = [];
      for (let i = 0; i <= N; i++) {
        const t = i / N, th = a + len * t;
        const near = 0.3 + 0.7 * Math.max(0, Math.sin(th)); // sin > 0 is the near side
        const w = (wMax * near * Math.sin(Math.PI * t) ** 0.6) / 2;
        const p = [cx + rx * j * Math.cos(th), cy + ry * j * Math.sin(th)];
        const n = norm([Math.cos(th) / rx, Math.sin(th) / ry]);
        out.push([p[0] + n[0] * w, p[1] + n[1] * w]);
        inn.push([p[0] - n[0] * w, p[1] - n[1] * w]);
      }
      d += poly([...out, ...inn.reverse()]);
      a += len + 0.04 + pr() * 0.14;
    }
    return `<path d="${d}" opacity="${op}"/>`;
  };
  s += `<g fill="${C.foam}">`;
  s += `<g ${fa}>${ring(77, 17.2, 2.6, 11, 0.95)}${ring(87, 20.5, 1.2, 12, 0.6)}</g>`;
  s += `<g ${fb}>${ring(74.5, 16.2, 2.9, 13, 0.95)}${ring(83, 19, 1.2, 14, 0.6)}</g>`;
  s += '</g>';
  // wet sand, dry sand, highlight
  s += `<path fill="${C.sandWet}" d="${ellipseBlob(210, 181, 70, 14, 0.08)}"/>`;
  s += `<path fill="${C.sand}" d="${ellipseBlob(210, 179.5, 66, 12.2, 0.07)}"/>`;
  s += `<path fill="${C.sandHi}" d="${ellipseBlob(200, 176.5, 40, 5.5, 0.1, 12)}" opacity=".8"/>`;
  s += `<path fill="${C.sandSh}" d="M150 182q30 9 66 9.5q34 -.5 58 -8q-8 7 -58 10q-50 -2 -66 -11.5z" opacity=".7"/>`;
  // rocks
  for (const [x, y, r] of [[160, 188.5, 4.2], [252, 190.5, 3.4], [258, 189, 2.1]]) {
    s += `<path fill="${C.rockSh}" d="${ellipseBlob(x, y, r * 1.25, r * 0.85, 0.15, 9)}"/>`;
    s += `<path fill="${C.rock}" d="${ellipseBlob(x - r * 0.2, y - r * 0.2, r * 1.0, r * 0.62, 0.15, 9)}"/>`;
    s += `<ellipse cx="${n1(x - r * 0.45)}" cy="${n1(y - r * 0.5)}" rx="${n1(r * 0.4)}" ry="${n1(r * 0.22)}" fill="${C.rockHi}"/>`;
  }
  // shrubs: clumps of small leaves
  for (const [x, y, k] of [[178, 172, 1.0], [192, 175.5, 0.8], [168, 177, 0.7], [246, 174.5, 0.75], [236, 177.5, 0.6]]) {
    for (let i = 0; i < 9; i++) {
      const a = -Math.PI * (0.1 + 0.8 * (i / 8));
      const L = (5 + rand() * 3) * k;
      const x2 = x + Math.cos(a) * L, y2 = y + Math.sin(a) * L * 0.75;
      const col = i % 3 === 0 ? C.shrubD : i % 3 === 1 ? C.shrub : C.shrubL;
      s += `<path fill="${col}" d="M${n1(x)} ${n1(y)}Q${n1((x + x2) / 2 - 1.6)} ${n1((y + y2) / 2 - 1.4)} ${n1(x2)} ${n1(y2)}Q${n1((x + x2) / 2 + 1.6)} ${n1((y + y2) / 2 + 1.2)} ${n1(x)} ${n1(y)}Z"/>`;
    }
  }
  return s;
}

function raft() {
  // five logs, long axis left-right, tied with rope; bobs one beat in two
  let s = `<g ${bob(BEAT * 2, 0, 0.6)}>`;
  s += `<ellipse cx="302" cy="196.4" rx="19.5" ry="2.6" fill="${C.foam}" opacity=".5"/>`;
  for (let i = 0; i < 5; i++) {
    const y = 188.2 + i * 1.75, x = 285 + i * 1.3;
    s += `<rect x="${n1(x)}" y="${n1(y)}" width="29" height="2.2" rx="1.1" fill="${i % 2 ? C.logD : C.log}"/>`;
    s += `<ellipse cx="${n1(x + 28.6)}" cy="${n1(y + 1.1)}" rx=".85" ry="1.05" fill="${C.logEnd}"/>`;
  }
  s += `<path d="M290.5 187.8l2.6 9.2M310.5 187.8l2.6 9.2" stroke="${C.rope}" stroke-width="1"/>`;
  return `${s}</g>`;
}

// ---- the palm
const TRUNK = [[228, 174], [232.5, 146], [216, 108], [200.5, 90]];
function palmTrunk() {
  const N = 26, L = [], R = [], HL = [], HR = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const p = c3(...TRUNK, t);
    const d = norm(c3d(...TRUNK, t));
    const n = [-d[1], d[0]];
    const w = 4.0 * (1 - t) + 2.1 * t + (t < 0.08 ? (0.08 - t) * 22 : 0);
    L.push([p[0] - n[0] * w, p[1] - n[1] * w]);
    R.push([p[0] + n[0] * w, p[1] + n[1] * w]);
    HL.push([p[0] - n[0] * w * 0.15, p[1] - n[1] * w * 0.15]);
    HR.push([p[0] + n[0] * w * 0.75, p[1] + n[1] * w * 0.75]);
  }
  // L/R depend on normal direction; whichever side is screen-left gets the light
  const leftIsL = L[10][0] < R[10][0];
  const lit = leftIsL ? HL : HR; // inner edge of the lit strip
  const edge = leftIsL ? L : R;
  let s = `<path fill="${C.trunk}" d="${poly([...L, ...R.reverse()])}"/>`;
  R.reverse();
  s += `<path fill="${C.trunkHi}" d="${poly([...edge, ...lit.slice().reverse()])}" opacity=".85"/>`;
  // segment rings
  let d = '';
  for (let t = 0.05; t < 0.97; t += 0.046) {
    const p = c3(...TRUNK, t);
    const dd = norm(c3d(...TRUNK, t));
    const n = [-dd[1], dd[0]];
    const w = 4.0 * (1 - t) + 2.1 * t;
    const a = [p[0] - n[0] * w, p[1] - n[1] * w], b = [p[0] + n[0] * w, p[1] + n[1] * w];
    d += `M${n1(a[0])} ${n1(a[1])}Q${n1(p[0] + dd[0] * 1.1)} ${n1(p[1] + dd[1] * 1.1 + 0.9)} ${n1(b[0])} ${n1(b[1])}`;
  }
  s += `<path d="${d}" fill="none" stroke="${C.trunkSh}" stroke-width=".6" opacity=".85"/>`;
  return s;
}
const CROWN = [200.5, 89.5];
function frond(ang, len, droop, wid, { back = false } = {}) {
  const a = (ang * Math.PI) / 180;
  const dx = Math.cos(a), dy = Math.sin(a);
  const p0 = CROWN;
  const p2 = [p0[0] + dx * len, p0[1] + dy * len + droop];
  const p1 = [p0[0] + dx * len * 0.55, p0[1] + dy * len * 0.55 - len * 0.22 * Math.abs(dx) - 2];
  const N = 18, up = [], dn = [], mid = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const p = q2(p0, p1, p2, t);
    const tg = norm(q2d(p0, p1, p2, t));
    let n = [-tg[1], tg[0]];
    if (n[1] > 0 || (Math.abs(n[1]) < 0.15 && n[0] * dx > 0)) n = [-n[0], -n[1]];
    const env = Math.sin(Math.PI * Math.min(1, t * 1.08 + 0.03)) ** 0.75;
    const tip = i % 2 ? 0.35 : 1; // alternate leaflet tip and notch
    const fw = wid * env * tip;
    const sweep = i % 2 ? 0 : wid * env * 0.7; // leaflets sweep towards the tip
    up.push([p[0] + n[0] * fw * 0.75 + tg[0] * sweep, p[1] + n[1] * fw * 0.75 + tg[1] * sweep]);
    dn.push([p[0] - n[0] * fw * 1.15 + tg[0] * sweep, p[1] - n[1] * fw * 1.15 + tg[1] * sweep + fw * 0.35]);
    mid.push(p);
  }
  const full = poly([...up, ...dn.slice().reverse()]);
  const lower = poly([...mid, ...dn.slice().reverse()]);
  const rib = `M${mid.map((p) => `${n1(p[0])} ${n1(p[1])}`).join('L')}`;
  if (back) return `<path fill="${C.leafBack}" d="${full}"/><path fill="${C.leafBack2}" d="${poly([...up, ...mid.slice().reverse()])}"/>`;
  return `<path fill="${C.leaf}" d="${full}"/><path fill="${C.leafD}" d="${lower}"/><path d="${rib}" fill="none" stroke="${C.leafL}" stroke-width=".7" stroke-linecap="round"/>`;
}
// fronds: angle (0 = right, -90 = up), length, droop, width
const FRONDS_UP = [[-112, 27, 2, 4.2], [-66, 27, 2, 4.2]];
const FRONDS_BACK = [[-140, 26, 6, 4], [-38, 26, 6, 4], [-90, 22, 0, 3.6]];
const FRONDS_FRONT = [[-176, 40, 15, 5], [-4, 40, 15, 5], [-152, 35, 9, 4.6], [-26, 35, 9, 4.6], [150, 27, 8, 4], [32, 28, 8, 4]];
function coconuts() {
  let s = '';
  for (const [x, y] of [[197.5, 93.5], [203.5, 94], [200.5, 96.5]]) {
    s += `<circle cx="${x}" cy="${y}" r="2.7" fill="${C.nut}"/><circle cx="${x - 0.9}" cy="${y - 0.9}" r=".9" fill="${C.nutHi}"/>`;
  }
  return s;
}

// ---- her: small and simple, sitting against the palm, facing left.
// Coral tank top, cream shorts, cream headphones, brown hair in a low bun, bare feet.
function herLegs() {
  let s = '';
  // far leg (darker), near leg in front
  s += `<path d="M0 -3.5L-7.6 -10.2L-10.4 -1.6" fill="none" stroke="${C.skinSh}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" transform="translate(1.6 0.4)"/>`;
  s += `<ellipse cx="-10.6" cy="-0.6" rx="1.9" ry=".9" fill="${C.skinSh}" transform="translate(1.6 0.4)"/>`;
  s += `<path d="M-4.2 -7.4L-7.6 -10.2L-10.4 -1.6" fill="none" stroke="${C.skin}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`;
  s += `<ellipse cx="-11" cy="-0.8" rx="2" ry=".95" fill="${C.skin}"/>`;
  // shorts over the hips and upper thighs
  s += `<path d="M3.2 -1.2Q3.6 -5.8 2.2 -7.2L-5.4 -8.6L-3.4 -5.2Q-1.5 -2 -0.8 0.2L2.6 0.4Z" fill="${C.shorts}"/>`;
  s += `<path d="M-5.4 -8.6L-3.4 -5.2Q-1.5 -2 -0.8 0.2L0.6 0.2Q-0.6 -3.2 -2.2 -6.6Z" fill="${C.shortsSh}" opacity=".7"/>`;
  return s;
}
function herTorso() {
  // tank top, leaning back a little against the trunk
  return (
    `<path d="M-2.6 -6.2Q-3.2 -10.6 -2.6 -14.6Q0 -16 2.6 -14.8Q3.6 -10.4 3.4 -6.4Q0.4 -5.4 -2.6 -6.2Z" fill="${C.coral}"/>` +
    `<path d="M1.6 -15Q3.6 -10.4 3.4 -6.4Q2.6 -6 1.8 -5.9Q2.4 -10.4 1.6 -15Z" fill="${C.coralSh}"/>` +
    `<rect x="-0.9" y="-17.6" width="2" height="2.6" fill="${C.skinSh}"/>`
  );
}
function herHead({ closed = false, tilt = 0 } = {}) {
  let s = `<g transform="rotate(${tilt} 0 -16.8)">`;
  s += `<circle cx="0.2" cy="-20.6" r="4.3" fill="${C.hair}"/>`; // back of the head
  s += `<circle cx="3.7" cy="-17.9" r="2" fill="${C.hair}"/><circle cx="3.3" cy="-18.5" r=".8" fill="${C.hairHi}"/>`; // low bun
  s += `<ellipse cx="-1.7" cy="-19.7" rx="2.85" ry="3.3" fill="${C.skin}"/>`; // face
  s += `<path d="M-4.4 -21.2Q-3.6 -25 0.4 -24.9Q-1.6 -23.6 -2.2 -21.4Q-3.2 -22.4 -4.4 -21.2Z" fill="${C.hair}"/>`; // fringe
  s += closed
    ? `<path d="M-3.9 -19.9q.6 .5 1.2 0" fill="none" stroke="${C.eye}" stroke-width=".5" stroke-linecap="round"/>`
    : `<ellipse cx="-3.3" cy="-20" rx=".42" ry=".6" fill="${C.eye}"/>`;
  s += `<path d="M1 -21.5Q0.6 -25.6 -2.8 -24.6" fill="none" stroke="${C.hp}" stroke-width="1.1" stroke-linecap="round"/>`; // band
  s += `<ellipse cx="1.1" cy="-19.9" rx="1.55" ry="2.05" fill="${C.hp}"/><ellipse cx="1.4" cy="-19.7" rx=".75" ry="1.15" fill="${C.hpSh}"/>`; // ear cup
  return `${s}</g>`;
}
function her() {
  const base = 'transform="translate(218.5 174.6) scale(1.08)"';
  const nod = bob(BEAT, 0, 0.9); // head dips on every beat
  let s = '';
  // shadow on the sand
  s += `<ellipse cx="212" cy="175.2" rx="10" ry="1.6" fill="${C.sandSh}" opacity=".9"/>`;
  // idle: arms round her knees, nodding
  const idle = vis([[TL.island, TL.sip[0]], [TL.sip[1], TL.wave]]);
  s += `<g ${idle}><g ${base}>${herLegs()}${herTorso()}<g ${nod}>${herHead()}</g>`;
  s += `<path d="M-1.4 -13.6L-4.9 -9.6L-7.4 -10.4" fill="none" stroke="${C.skin}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></g></g>`;
  // coconut_sip: eyes closed, head back, coconut up
  const sip = vis([TL.sip]);
  s += `<g ${sip}><g ${base}>${herLegs()}${herTorso()}${herHead({ closed: true, tilt: 13 })}`;
  s += `<path d="M-1.2 -13.8L-5.4 -12.2L-6.2 -18.2" fill="none" stroke="${C.skin}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`;
  s += `<path d="M-5 -21.4L-3.2 -20" stroke="${C.hp}" stroke-width=".55" stroke-linecap="round"/>`; // straw
  s += `<circle cx="-6.6" cy="-20.6" r="2.7" fill="${C.nut}"/><circle cx="-7.5" cy="-21.4" r=".9" fill="${C.nutHi}"/></g></g>`;
  // waving at an empty sea, two frames a beat
  const wave = vis([[TL.wave, TL.cut]]);
  const [wa, wb] = frames(BEAT, 2);
  s += `<g ${wave}><g ${base}>${herLegs()}${herTorso()}<g ${nod}>${herHead()}</g>`;
  s += `<path d="M-1.4 -13.6L-4.9 -9.6L-7.4 -10.4" fill="none" stroke="${C.skinSh}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`;
  s += `<g ${wa}><path d="M-1.2 -14.2L-4.6 -18.6L-6.4 -24.6" fill="none" stroke="${C.skin}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="-6.6" cy="-25.2" r="1.05" fill="${C.skin}"/></g>`;
  s += `<g ${wb}><path d="M-1.2 -14.2L-4.2 -19L-3.2 -25.4" fill="none" stroke="${C.skin}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="-3" cy="-26" r="1.05" fill="${C.skin}"/></g>`;
  s += '</g></g>';
  return s;
}

// ---- the ship that sails past while she is busy
function ship() {
  let s = '';
  s += `<path d="M0 0L27 0L24.5 3.6L2.6 3.6Z" fill="${C.hull}"/>`;
  s += `<rect x="1.4" y="2.1" width="24" height="1" fill="${C.hullRed}"/>`;
  s += `<path d="M7 0V-3.8H18.5V0Z" fill="${C.cabin}"/><path d="M9 -3.8V-6H15V-3.8Z" fill="${C.cabin}"/>`;
  s += `<path d="M8 -2.4h9.4" stroke="${C.hull}" stroke-width=".6" stroke-dasharray="1 1"/>`;
  s += `<path d="M11.2 -6V-9.4H13.8V-6Z" fill="${C.funnel}"/><rect x="11.2" y="-10.2" width="2.6" height=".9" fill="${C.hull}"/>`;
  s += `<path d="M3 0V-5M3 -5L7 -3.8" stroke="${C.hull}" stroke-width=".5"/>`;
  // smoke, puff-puff, one beat each
  const [pa, pb] = frames(BEAT * 2, 2);
  s += `<g fill="#eef3f7" opacity=".9"><g ${pa}><circle cx="11" cy="-12.4" r="1.8"/><circle cx="7.6" cy="-14" r="1.4"/><circle cx="4.6" cy="-14.8" r="1"/></g>`;
  s += `<g ${pb}><circle cx="10.4" cy="-12.8" r="1.6"/><circle cx="6.8" cy="-14.4" r="1.6"/><circle cx="3.4" cy="-15.4" r=".9"/></g></g>`;
  // wake
  s += `<path d="M-1 3.4q-6 .8 -14 .3" stroke="#ffffff" stroke-width=".7" fill="none" opacity=".8"/>`;
  return s;
}

// ---- clouds: the wallpaper wordmark becomes the cloud bank
function cloudWord() {
  // a lumpy cumulus bank under the letters (flat-bottomed), then the letters
  // in white with a thin blue rim and a soft underside
  const pr = mulberry32(80);
  let puffs = '';
  for (let x = 4; x < wordW - 4; x += 7 + pr() * 7) {
    const edge = Math.min(x, wordW - x) / 40; // smaller at the ends
    const r = (5 + pr() * 7) * Math.min(1, 0.55 + edge);
    puffs += `<circle cx="${n1(x)}" cy="${n1(6 + r * 0.2 - pr() * 3)}" r="${n1(r)}"/>`;
  }
  const bank = (fill, dy) => `<g transform="translate(${WX} ${n1(WY + dy)}) scale(${WS})" fill="${fill}" clip-path="url(#bank)">${puffs}</g>`;
  let s = '';
  s += bank(C.cloudSh2, 1.5);
  s += bank(C.cloudSh, -0.5);
  s += bank(C.cloud, -2.6);
  s += wordmark(C.cloudSh, 7.5, 1.6);
  s += wordmark(C.cloudSh, 6, 0);
  s += wordmark(C.cloud, 3.5, 0);
  return s;
}
function smallCloud(x, y, k, seed) {
  const pr = mulberry32(seed);
  let a = '', b = '';
  for (let i = 0; i < 6; i++) {
    const cx = x + (i - 2.5) * 6 * k + (pr() - 0.5) * 3;
    const r = (4 + pr() * 4) * k * (i === 2 || i === 3 ? 1.35 : 1);
    a += `<circle cx="${n1(cx)}" cy="${n1(y - r * 0.4)}" r="${n1(r)}"/>`;
    b += `<circle cx="${n1(cx)}" cy="${n1(y - r * 0.4 + 1.6)}" r="${n1(r)}"/>`;
  }
  return `<g fill="${C.cloudSh}">${b}</g><g fill="${C.cloud}">${a}</g><rect x="${n1(x - 22 * k)}" y="${n1(y)}" width="${n1(44 * k)}" height="6" fill="url(#sky)"/>`;
}

// ---------------------------------------------------------------- pixel art (UI)
const PAL = {
  k: P.frame, w: '#ffffff', s: '#c0c0c0', g: '#808080', r: '#e46a52', R: '#b4472f', y: '#f2d27a', Y: '#d9b25a',
  e: '#2f9a3c', E: '#7ed35a', o: '#8a4f2c', b: '#2a7fd0', B: '#9fd6f5', n: P.navy, h: '#6a3c21', c: '#f6eedb', f: '#f0c19c',
  t: '#008080', N: '#5b3a22', M: '#8f6238', O: '#f08a3a', D: '#3b2414', H: '#c28a52',
};
const ICON_NOTES = [
  'kkkkkkkkkkk....',
  'kwwwwwwwwwkk...',
  'kwwwwwwwwwkwk..',
  'kwrrrrrrwwkwwk.',
  'kwwwwwwwwwkkkkk',
  'kwwwwwwwwwwwwsk',
  'kwggggggggggwsk',
  'kwwwwwwwwwwwwsk',
  'kwgggggggggwwsk',
  'kwwwwwwwwwwwwsk',
  'kwggggggggggwsk',
  'kwwwwwwwwwwwwsk',
  'kwgggggwwBBwwsk',
  'kwwwwwwwBBBBwsk',
  'kwsssssssssssgk',
  'kkkkkkkkkkkkkkk',
];
const ICON_CAL = [
  '..k...k...k...k..',
  'kkrkkkrkkkrkkkrkk',
  'krrrrrrrrrrrrrrrk',
  'krrRRRrrrrrrRRRrk',
  'kkkkkkkkkkkkkkkkk',
  'kwwwwwwwwwwwwwwsk',
  'kwgwgwgwgwgwgwwsk',
  'kwwwwwwwwwwwwwwsk',
  'kwgwgwgwyywgwgwsk',
  'kwwwwwwwyywwwwwsk',
  'kwgwgwgwgwgwgwwsk',
  'kwwwwwwwwwwwwwwsk',
  'kwgwgwgwgwwwwwwsk',
  'kwwwwwwwwwwwwwwsk',
  'kwsssssssssssssgk',
  'kkkkkkkkkkkkkkkkk',
];
const PALM9 = [
  '.EE.e.EE.',
  'EeeEeEeeE',
  'e..eoe..e',
  '...oo...e',
  '....o....',
  '....o....',
  '...o.....',
  '.yyoyyy..',
  'yyyyyyyyY',
];
const LANE_HER = [
  '..hhhh..',
  '.hhhhhhc',
  'hhffffcc',
  'hfkffhcc',
  '.ffffhh.',
  '..ff....',
  '.rrrr...',
  'rrrrrr..',
];
const LANE_SHIP = [
  '....N....',
  '...wwN...',
  '..wwwwk..',
  'kkkkkkkkk',
  '.kkkkkkk.',
  'bbBbbbBbb',
  '.b.b.b.b.',
];
const NOTE = [
  '..kkkk',
  '..k..k',
  '..k..k',
  '..k...',
  'kkk...',
  'kkk...',
];
const ARROW = [
  'k...........',
  'kk..........',
  'kwk.........',
  'kwwk........',
  'kwwwk.......',
  'kwwwwk......',
  'kwwwwwk.....',
  'kwwwwwwk....',
  'kwwwwwwwk...',
  'kwwwwwwwwk..',
  'kwwwwwwwwwk.',
  'kwwwwwwkkkkk',
  'kwwwkwwk....',
  'kwwk.kwwk...',
  'kwk..kwwk...',
  'kk....kwwk..',
  'k.....kwwk..',
  '.......kk...',
];
// The hermit crab wearing the coconut: a lit, fibrous shell with the three
// coconut eyes, the crab's claw and eye stalks out in front, legs underneath.
// step 0/1 are the two walking frames.
function makeCrab(step) {
  const CW = 20, CH = 13;
  const g = Array.from({ length: CH }, () => Array(CW).fill('.'));
  const set = (x, y, c) => { if (x >= 0 && x < CW && y >= 0 && y < CH) g[y][x] = c; };
  const pr = mulberry32(31); // same fibres in both frames
  const cx = 12.6, cy = 5.6, rx = 6.9, ry = 5.4;
  for (let y = 0; y <= 9; y++) {
    for (let x = 0; x < CW; x++) {
      const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry;
      const r = dx * dx + dy * dy;
      if (r > 1) continue;
      const lit = -dx * 0.55 - dy * 0.85;
      let c = r > 0.7 && lit < 0.5 ? 'D' : lit > 0.42 ? 'H' : lit > -0.05 ? 'M' : 'N';
      if (c !== 'D' && pr() < 0.2) c = c === 'H' ? 'M' : c === 'M' ? 'N' : 'D'; // husk fibre
      set(x, y, c);
    }
  }
  set(9, 4, 'D'); set(10, 3, 'D'); set(9, 6, 'D'); // the coconut's three eyes
  // eye stalks
  set(3, 0, 'k'); set(5, 0, 'k'); set(3, 1, 'O'); set(5, 1, 'O'); set(3, 2, 'O'); set(4, 3, 'O'); set(5, 2, 'O');
  // the claw, held up in front
  // (an open pincer: upper jaw, hinge, lower jaw, then the arm back to the body)
  for (const [x, y] of [[0, 3], [1, 3], [2, 4], [3, 4], [0, 5], [1, 5], [2, 5], [3, 5], [1, 6], [2, 6], [3, 6], [4, 6], [4, 7], [5, 7]]) set(x, y, 'O');
  set(2, 6, 'R'); set(3, 6, 'R');
  // body, peeking out from under the shell
  for (let x = 4; x <= 7; x++) { set(x, 8, 'O'); set(x, 9, x % 2 ? 'R' : 'O'); }
  set(5, 6, 'O'); set(6, 7, 'O'); set(5, 7, 'O'); set(6, 6, 'O');
  // legs: four pairs, two poses
  for (const bx of [6, 9, 12, 15]) {
    set(bx, 10, 'O');
    if (step === 0) { set(bx - 1, 11, 'O'); set(bx - 1, 12, 'O'); }
    else { set(bx + 1, 11, 'O'); set(bx + 1, 12, 'O'); }
  }
  return g.map((row) => row.join(''));
}
const CRAB_A = makeCrab(0);
const CRAB_B = makeCrab(1);
const TBTN = {
  min: '......|......|......|.####.|.####.',
  max: '######|######|#....#|#....#|######',
  close: '##..##|.####.|..##..|.####.|##..##',
};

// ---------------------------------------------------------------- build: background layers
push(rect(0, 0, W, H, P.teal));
push(wordmark(P.wall));

// creeping waves on the teal (the desktop starts to ripple)
push(`<g ${vis([[TL.tealWaves, TL.sea + 0.01]])}><g ${drift(6, -3)}><path d="${crests(26, (x, y) => nearIsland(x, y), 112, 214)}" fill="none" stroke="#7fd0cc" stroke-width=".9" stroke-linecap="round" opacity=".75"/></g></g>`);

// the sunny sea (hard cut in at 9.75)
{
  let s = `<g ${vis([[TL.sea, TL.cut]])}>`;
  s += rect(0, HZ, W, TBY - HZ, 'url(#sea)');
  // drifting cloud shadows (a built scene effect in the project)
  s += `<g ${move([[0, -30, 0], [TL.sea, -30, 0], [TL.cut, 26, 0], [T, 26, 0]])} fill="#0b3f7a" opacity=".13">`;
  s += `<ellipse cx="80" cy="150" rx="58" ry="7"/><ellipse cx="300" cy="128" rx="44" ry="4.5"/><ellipse cx="190" cy="206" rx="70" ry="8"/></g>`;
  s += `<g ${drift(6, -3)}><path d="${crests(70, nearIsland)}" fill="none" stroke="#ffffff" stroke-width=".9" stroke-linecap="round" opacity=".8"/></g>`;
  const [ga, gb] = frames(1.5, 2);
  const glints = (seed) => {
    const pr = mulberry32(seed);
    let d = '';
    for (let i = 0; i < 14; i++) {
      const x = 250 + pr() * 160, y = HZ + 2 + pr() ** 1.6 * 40;
      d += `M${n1(x - 1.6)} ${n1(y)}h3.2M${n1(x)} ${n1(y - 0.6)}v1.2`;
    }
    return d;
  };
  s += `<path ${ga} d="${glints(5)}" stroke="#ffffff" stroke-width=".6" opacity=".9"/>`;
  s += `<path ${gb} d="${glints(6)}" stroke="#ffffff" stroke-width=".6" opacity=".9"/>`;
  s += rect(0, HZ, W, 1, '#d8f1fb', 'opacity=".55"');
  s += '</g>';
  push(s);
}
// the sky and the cloud wordmark (hard cut in at 10.5)
{
  let s = `<g ${vis([[TL.sky, TL.cut]])}>`;
  s += rect(0, 0, W, HZ, 'url(#sky)');
  s += `<g ${move([[0, 0, 0], [TL.sky, 0, 0], [TL.cut, 10, 0], [T, 10, 0]])}>`;
  s += smallCloud(30, HZ - 1, 0.75, 7) + smallCloud(70, HZ - 1, 0.5, 8) + smallCloud(360, HZ - 1, 0.85, 9) + smallCloud(398, HZ - 1, 0.5, 10);
  s += '</g>';
  // two distant birds
  const [ba, bb] = frames(BEAT, 2);
  s += `<g fill="none" stroke="#1d4f86" stroke-width=".8" stroke-linecap="round"><g ${move([[0, 0, 0], [TL.sky, 0, 0], [TL.cut, -60, 4], [T, -60, 4]])}>`;
  s += `<path ${ba} d="M352 88q2 -2 4 0q2 -2 4 0M366 82q1.6 -1.6 3.2 0q1.6 -1.6 3.2 0"/>`;
  s += `<path ${bb} d="M352 87q2 1 4 0q2 1 4 0M366 81q1.6 1 3.2 0q1.6 1 3.2 0"/>`;
  s += '</g></g>';
  s += cloudWord();
  s += '</g>';
  push(s);
}
// the ship, on the horizon
push(`<g ${vis([TL.ship])}><g ${move([[0, -32, 0], [TL.ship[0], -32, 0], [TL.ship[1], W + 6, 0], [T, W + 6, 0]])}><g transform="translate(0 ${HZ - 2.4})">${ship()}</g></g></g>`);

// the island, which has been there behind the dialog since 7.5 s
push(`<g ${vis([[TL.island, TL.cut]])}>${islandBase()}${raft()}</g>`);
// the palm: two fronds first (4.5 s), then the rest (6 s)
{
  let s = `<g ${vis([[TL.palm, TL.cut]])}>`;
  for (const f of FRONDS_BACK) s += frond(...f, { back: true });
  s += palmTrunk();
  s += '</g>';
  push(s);
  push(`<g ${vis([[TL.island, TL.cut]])}>${her()}</g>`);
  let c = `<g ${vis([[TL.frondsA, TL.cut]])}>`;
  for (const f of FRONDS_UP) c += frond(...f);
  c += '</g>';
  c += `<g ${vis([[TL.palm, TL.cut]])}>`;
  for (const f of FRONDS_FRONT) c += frond(...f);
  c += coconuts();
  c += '</g>';
  push(c);
}

// ---------------------------------------------------------------- the dialog
const DX = 96, DY = 82, DW = 224, DH = 122;
const MINB = { x: DX + DW - 3 - 1 - 11 - 13 - 11, y: DY + 4 }; // the minimise button
const NEXTB = { x: DX + DW - 6 - 46, y: DY + DH - 6 - 14, w: 46, h: 14 };
const TASKB = { x: 43, y: TBY + 3, w: 70, h: 11 };
const PAGES = [
  [
    ['h', 'CASTAWAY          working title'],
    ['', 'A 10-hour lo-fi island video,'],
    ['', 'after a 1992 screensaver.'],
    ['', ''],
    ['', 'One woman, one palm, one raft'],
    ['', 'and a lot of time. She idles.'],
    ['', 'Every so often, a gag happens.'],
    ['', 'Then she idles some more.'],
  ],
  [
    ['h', 'THE SCHEDULE   activities.toml'],
    ['', '92 activities, 81 on 4 timers:'],
    ['', '  regular     every 2-5 min'],
    ['', '  occasional  every 12-25 min'],
    ['', '  rare        every 30-60 min'],
    ['', '  super rare  every 3-6 hours'],
    ['', 'Each gag waits for the next'],
    ['', 'bar of the music: 3 seconds.'],
  ],
  [
    ['h', 'SOUND'],
    ['', 'Every sound is synthesized'],
    ['', 'in code: 151 files, no samples.'],
    ['h', 'RUN IT'],
    ['c', '> python tools/serve.py'],
    ['c', '> open 127.0.0.1:8765'],
    ['', 'Preview it, export an MP4,'],
    ['', 'then wait. Calmly.'],
  ],
];
function titleButton(x, y, kind, down = false) {
  const o = down ? 1 : 0;
  return bevel(x, y, 11, 9, down ? 'down' : 'btn') + `<path fill="${P.ink}" d="${bitmapPath(TBTN[kind].split('|'), x + 2 + o, y + 2 + o)}"/>`;
}
function button(x, y, w, h, label, { down = false, def = false } = {}) {
  const o = down ? 1 : 0;
  let s = '';
  if (def) { s += rect(x - 1, y - 1, w + 2, h + 2, P.frame); }
  s += bevel(x, y, w, h, down ? 'down' : 'btn');
  s += textC(ui, label, x + w / 2 + o, y + Math.floor((h - 7) / 2) + o, P.ink);
  return s;
}
{
  let s = `<g ${vis(DLG_SPANS)}>`;
  s += bevel(DX, DY, DW, DH, 'win');
  s += rect(DX + 3, DY + 3, DW - 6, 11, P.navy);
  s += sprite(PALM9, PAL, DX + 5, DY + 4);
  s += text(uib, 'Castaway', DX + 17, DY + 5, P.hi);
  s += titleButton(MINB.x, MINB.y, 'min') + titleButton(MINB.x + 11, MINB.y, 'max') + titleButton(MINB.x + 24, MINB.y, 'close');
  s += `<g ${vis([[8.85, 9.0]])}>${titleButton(MINB.x, MINB.y, 'min', true)}</g>`;
  // the panel
  const px = DX + 6, py = DY + 18, pw = DW - 12, ph = 82;
  s += bevel(px, py, pw, ph, 'sunk', P.panel);
  PAGES.forEach((lines, i) => {
    const spans = i === 0 ? [[0, 3], [TL.dlgOn, T]] : [TL.page[i]];
    let g = `<g ${vis(spans)}>`;
    lines.forEach(([kind, str], j) => {
      if (!str) return;
      const col = kind === 'h' ? P.pHead : kind === 'c' ? P.pCmd : P.pText;
      g += text(mono, str, px + 5, py + 5 + j * 9, col);
    });
    if (i === 2) {
      // a blinking block caret after the last command
      const [ca] = frames(1.0, 2);
      g += `<g ${ca}>${rect(px + 5 + 22 * 6, py + 5 + 5 * 9, 5, 7, P.pCmd)}</g>`;
    }
    g += text(ui, `Page ${i + 1} of 3`, DX + 8, DY + DH - 16, P.ink);
    s += `${g}</g>`;
  });
  // buttons: < Back, Next >
  s += button(NEXTB.x - 50, NEXTB.y, 46, 14, '< Back');
  s += button(NEXTB.x, NEXTB.y, NEXTB.w, NEXTB.h, 'Next >', { def: true });
  s += `<g ${vis([[3.0, 3.15], [6.0, 6.15]])}>${button(NEXTB.x, NEXTB.y, NEXTB.w, NEXTB.h, 'Next >', { down: true, def: true })}</g>`;
  s += '</g>';
  push(`<g shape-rendering="crispEdges">${s}</g>`);
}
// minimise / restore: the title bar flies to the taskbar and back
{
  let s = '';
  const from = { x: DX + 3, y: DY + 3, w: DW - 6, h: 11 };
  for (let k = 1; k <= 4; k++) {
    const f = k / 5;
    const r = {
      x: Math.round(between(from.x, TASKB.x, f)), y: Math.round(between(from.y, TASKB.y, f)),
      w: Math.round(between(from.w, TASKB.w, f)), h: 11,
    };
    const step = 0.06;
    const out = [TL.dlgOff + (k - 1) * step, TL.dlgOff + k * step];
    const back = [TL.restoreClick + 0.05 + (4 - k) * step, TL.restoreClick + 0.05 + (5 - k) * step];
    s += `<g ${vis([out, back])}>${rect(r.x, r.y, r.w, r.h, P.navy)}${rect(r.x + 1, r.y + 1, r.w - 2, r.h - 2, 'none', `stroke="${P.face}" stroke-width="1" opacity=".5"`)}</g>`;
  }
  push(`<g shape-rendering="crispEdges">${s}</g>`);
}

// ---------------------------------------------------------------- desktop icons
{
  let s = '';
  const icon = (rows, cx, top, labels) => {
    const w = rows[0].length;
    let g = sprite(rows, PAL, cx - Math.floor(w / 2), top);
    labels.forEach((l, i) => {
      g += textC(ui, l, cx + 1, top + rows.length + 4 + i * 9, '#003b3b');
      g += textC(ui, l, cx, top + rows.length + 3 + i * 9, P.hi);
    });
    return g;
  };
  s += icon(ICON_NOTES, 24, 6, ['MUSING.md']);
  s += icon(ICON_CAL, 24, 41, ['activities', '.toml']);
  push(`<g shape-rendering="crispEdges">${s}</g>`);
}

// ---------------------------------------------------------------- the taskbar
{
  let s = '';
  s += rect(0, TBY, W, H - TBY, P.face);
  s += rect(0, TBY, W, 1, P.light) + rect(0, TBY + 1, W, 1, P.hi);
  // the start button, which says what this project is mostly about
  s += bevel(2, TBY + 3, 38, 11, 'btn');
  s += sprite(PALM9, PAL, 5, TBY + 4);
  s += text(uib, 'Wait', 16, TBY + 5, P.ink);
  // window button: pressed while the dialog is up
  const winBtn = (down) => {
    let b = bevel(TASKB.x, TASKB.y, TASKB.w, TASKB.h, down ? 'down' : 'btn', down ? 'url(#dith)' : P.face);
    b += sprite(PALM9, PAL, TASKB.x + 3 + (down ? 1 : 0), TASKB.y + 1 + (down ? 1 : 0));
    b += text(ui, 'Castaway', TASKB.x + 15 + (down ? 1 : 0), TASKB.y + 2 + (down ? 1 : 0), P.ink);
    return b;
  };
  s += winBtn(false);
  s += `<g ${vis([[0, TL.dlgOff], [TL.restoreClick, T]])}>${winBtn(true)}</g>`;
  // lane buttons: two lanes busy at once is how the ship gets past
  const lane = (x, w, icon, label, spans) => {
    let b = bevel(x, TASKB.y, w, TASKB.h, 'btn');
    b += sprite(icon, PAL, x + 3, TASKB.y + 2);
    b += text(ui, label, x + 14, TASKB.y + 2, P.ink);
    return `<g ${vis(spans)}>${b}</g>`;
  };
  const w1 = ui.width('coconut_sip') + 19;
  const w2 = ui.width('ship_passes_unseen') + 20;
  s += lane(TASKB.x + TASKB.w + 3, w1, LANE_HER, 'coconut_sip', [TL.sip]);
  s += lane(TASKB.x + TASKB.w + 3 + w1 + 3, w2, LANE_SHIP, 'ship_passes_unseen', [TL.ship]);
  // tray: a note and a clock that reads the length of a run
  const clock = '10:00:00';
  const cw = ui.width(clock);
  const tx = W - 4 - (cw + 20);
  s += thin(tx, TBY + 3, cw + 20, 11);
  const [na, nb] = frames(BEAT, 2);
  s += `<g ${na}>${sprite(NOTE, PAL, tx + 4, TBY + 5)}</g><g ${nb}>${sprite(NOTE, PAL, tx + 4, TBY + 4)}</g>`;
  s += text(ui, clock, tx + 14, TBY + 5, P.ink);
  push(`<g shape-rendering="crispEdges">${s}</g>`);
}
// the shoreline now runs along the top of the taskbar, and sand spills over it
{
  let s = `<g ${vis([[TL.sea, TL.cut]])}>`;
  const [fa, fb] = frames(3, 2);
  const foam = (seed, amp) => {
    const pr = mulberry32(seed);
    let d = `M0 ${TBY}`;
    for (let x = 0; x <= W; x += 8) d += `Q${x + 4} ${n1(TBY - 1.6 - pr() * amp)} ${x + 8} ${TBY}`;
    return d;
  };
  s += `<path ${fa} d="${foam(3, 1.6)}" fill="#ffffff" opacity=".85"/>`;
  s += `<path ${fb} d="${foam(4, 2.6)}" fill="#ffffff" opacity=".85"/>`;
  s += '</g>';
  // the dune, from 11.25 s
  let d = `<g ${vis([[TL.dune, TL.cut]])}>`;
  d += `<path d="M300 ${TBY + 0.5}Q310 ${TBY - 6} 324 ${TBY - 6.5}Q338 ${TBY - 6} 348 ${TBY - 1}Q353 ${TBY + 2} 352 ${TBY + 6}Q346 ${TBY + 4} 342 ${TBY + 7}Q336 ${TBY + 3.5} 330 ${TBY + 5}Q322 ${TBY + 2.5} 312 ${TBY + 3}Q304 ${TBY + 2} 300 ${TBY + 0.5}Z" fill="${C.sand}"/>`;
  d += `<path d="M304 ${TBY + 1.4}Q316 ${TBY - 3.6} 330 ${TBY - 4}" fill="none" stroke="${C.sandHi}" stroke-width="1.2" stroke-linecap="round"/>`;
  d += `<path d="M314 ${TBY + 2.8}Q328 ${TBY + 1.5} 344 ${TBY + 4.6}" fill="none" stroke="${C.sandSh}" stroke-width="1"/>`;
  d += `<g fill="${C.sandSh}"><circle cx="318" cy="${TBY - 2}" r=".5"/><circle cx="333" cy="${TBY - 3}" r=".5"/><circle cx="340" cy="${TBY + 1}" r=".5"/><circle cx="356" cy="${TBY + 8}" r=".6"/><circle cx="358.5" cy="${TBY + 11}" r=".5"/></g>`;
  d += '</g>';
  push(s + d);
}
// the hermit crab in its coconut, walking the taskbar right to left
{
  const duneY = (x) => (x > 300 && x < 350 ? -Math.sin(((x - 300) / 50) * Math.PI) * 6 : 0);
  const X0 = W + 2; // walks in from off screen
  const pts = [[0, X0, 0], [TL.crab[0], X0, 0]];
  const N = 20;
  for (let i = 1; i <= N; i++) {
    const t = TL.crab[0] + ((TL.crab[1] - TL.crab[0]) * i) / N;
    const x = X0 - (X0 - 150) * (i / N);
    pts.push([t, x, duneY(x + 10)]); // feet, not the tip of the claw, follow the sand
  }
  pts.push([T, 150, 0]);
  const [ca, cb] = frames(0.5, 2);
  const body = `<g ${ca}>${sprite(CRAB_A, PAL, 0, -CRAB_A.length)}</g><g ${cb}>${sprite(CRAB_B, PAL, 0, -CRAB_B.length)}</g>`;
  push(`<g ${vis([[TL.crab[0], TL.cut]])} shape-rendering="crispEdges"><g ${move(pts)}><g transform="translate(0 ${TBY})">${body}</g></g></g>`);
}

// ---------------------------------------------------------------- the pointer
{
  const at = (b, ox, oy) => [b.x + ox, b.y + oy];
  const nextP = at(NEXTB, 30, 8);
  const minP = at(MINB, 5, 5);
  const taskP = at(TASKB, 61, 6);
  const pts = [
    [0, ...taskP, 'ease-in-out'],
    [0.6, ...taskP, 'ease-in-out'],
    [2.2, ...nextP, 'linear'],
    [3.6, ...nextP, 'ease-in-out'],
    [4.4, nextP[0] + 44, nextP[1] - 26, 'ease-in-out'],
    [5.4, ...nextP, 'linear'],
    [8.1, ...nextP, 'ease-in-out'],
    [8.8, ...minP, 'linear'],
    [TL.jiggle, ...minP, 'linear'],
    [TL.jiggle + 0.2, minP[0] + 7, minP[1] + 4, 'linear'],
    [TL.jiggle + 0.4, minP[0] - 5, minP[1] + 8, 'linear'],
    [TL.jiggle + 0.6, minP[0] + 3, minP[1] + 2, 'linear'],
    [TL.cut + 0.15, minP[0] + 3, minP[1] + 2, 'ease-in-out'],
    [TL.restoreClick - 0.1, ...taskP, 'linear'],
    [T, ...taskP, 'linear'],
  ];
  push(`<g ${vis([[0, TL.sea], [TL.jiggle, T]])} shape-rendering="crispEdges"><g ${move(pts)}>${sprite(ARROW, PAL, 0, 0)}</g></g>`);
}

// ---------------------------------------------------------------- assemble
css.unshift(
  `.a{animation-duration:${T}s;animation-iteration-count:infinite;animation-timing-function:step-end}`,
);
css.push(`@media (prefers-reduced-motion:reduce){*{animation-delay:-${STATIC}s!important;animation-play-state:paused!important}}`);

const title = 'Castaway: the desktop goes idle and the island takes over';
const svg = [
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W * 2}" height="${H * 2}" role="img" aria-label="${title}">`,
  `<title>${title}</title>`,
  `<style>${css.join('')}</style>`,
  `<defs>${defs.join('')}${ui.defs()}${uib.defs()}${mono.defs()}</defs>`,
  `<g clip-path="url(#scr)">${parts.join('')}</g>`,
  '</svg>',
].join('\n');

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, svg);
console.log(`wrote ${OUT} (${(svg.length / 1024).toFixed(1)} KB)`);
