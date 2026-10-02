#!/usr/bin/env node
// Castaway README header: "Instant Messenger Window" (62-instant-messenger_opus_5.5),
// style catalogue entry vap-14 (the after-school chat window of about 1999-2005).
//
//   node examples/castaway/src/62-instant-messenger_opus_5.5.mjs
//
// Regenerates, next to this file in ../assets/:
//   62-instant-messenger_opus_5.5.svg    the banner (830 x 640, drawn 1:1 for an 830 px README column)
// Plain Node, no dependencies, deterministic (one seeded PRNG, no clock). The .md beside the
// assets is hand-written, not generated.
//
// The style, as the catalogue lists it: a narrow contact list (collapsible groups with counts,
// a status marker and a one-line personal message per contact) beside a wider conversation
// window; a grey "name says:" line above each message, the message indented underneath in the
// sender's own colour and font; two display pictures stacked at the right; a formatting strip
// over the input box with a Send button; a status line saying the other person is typing; a
// toast sliding up from the bottom-right when someone signs in; and one nudge that shakes the
// window. Pale blue gradients inside a blue title-bar frame, green / amber / red status markers.
//
// Nothing here is copied from any real client: no butterfly, no running man, no flower, no real
// product name. The messenger is invented ("Bottle Messenger", its icon a bottle with a note in
// it), the status markers are a generic person glyph, and every icon, emoticon and picture is
// drawn below. The castaway is the project's own character, in her own outfit.
//
// How it is built
//   Chrome lettering: my own proportional pixel sans (cap height 8, x-height 6), modelled on
//   the small unsmoothed UI type of the period. Rows of '#' become merged rects, one <path> per
//   glyph, reused through <use>. No <text> anywhere.
//   Message lettering: my own rounded monoline stroke font (the bowls and stems follow the one in
//   ultra-satisfactory/src/42-aero-gloss, with a single-storey a and serifed I so it reads as the
//   period's casual comic hand), each glyph jittered a little in angle and height by the PRNG.
//   Story: one 20-second timeline in CSS keyframes, played once and then held. Everything's plain
//   attributes are the FINAL frame, so with prefers-reduced-motion (animation: none) the banner
//   is the finished conversation. Endless loops on top: her display picture nods at 80 BPM (the
//   theme's tempo, 0.75 s a beat), glints, a drifting cloud bank, a bobbing bottle, a caret.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const ASSETS = path.join(here, '..', 'assets');
const SLUG = '62-instant-messenger_opus_5.5';

// ------------------------------------------------------------------------------ helpers
const r1 = (n) => { const s = (Math.round(n * 10) / 10).toString(); return s === '-0' ? '0' : s; };
const r2 = (n) => { const s = (Math.round(n * 100) / 100).toString(); return s === '-0' ? '0' : s; };
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
const rng = mulberry32(0x19921001);

const W = 830;
const H = 640;

const C = {
  ink: '#151515',
  grey: '#707070',
  navy: '#163c8c',
  link: '#1f4fb4',
  border: '#7f9db9',
  online: ['#9be36b', '#2f9a22', '#1f6b15'],
  away: ['#ffd36b', '#e99207', '#9a5c00'],
  busy: ['#ff8f7c', '#d3301f', '#8e1a10'],
  offline: ['#e2e6ea', '#9aa4ae', '#69737d'],
  her: '#cf3d27', // castaway's chosen message colour: coral, like her top
  you: '#7a2fc0', // yours: the period's favourite purple
  skin: '#f3c7a3', skinShade: '#e2a883', hair: '#5d3b28', hairDark: '#43291b', hairHi: '#83573c',
  cream: '#f5edda', creamEdge: '#cbb994', coral: '#e2735c', coralShade: '#c3573f', shorts: '#efe4c8',
};

// ------------------------------------------------------------------------------ pixel UI font
// My own proportional pixel sans. Cap height 8, x-height 6, descenders 2 rows below.
// Rows top to bottom, '#' = pixel, glyph width = row length.
const UI = {
  A: '..#..|.#.#.|.#.#.|.#.#.|#...#|#####|#...#|#...#',
  B: '####.|#...#|#...#|####.|#...#|#...#|#...#|####.',
  C: '.###.|#...#|#....|#....|#....|#....|#...#|.###.',
  D: '####.|#...#|#...#|#...#|#...#|#...#|#...#|####.',
  E: '####|#...|#...|####|#...|#...|#...|####',
  F: '####|#...|#...|###.|#...|#...|#...|#...',
  G: '.####.|#.....|#.....|#..###|#....#|#....#|#....#|.####.',
  H: '#...#|#...#|#...#|#####|#...#|#...#|#...#|#...#',
  I: '###|.#.|.#.|.#.|.#.|.#.|.#.|###',
  J: '.##|..#|..#|..#|..#|..#|..#|##.',
  K: '#...#|#..#.|#.#..|##...|##...|#.#..|#..#.|#...#',
  L: '#...|#...|#...|#...|#...|#...|#...|####',
  M: '##...##|##...##|#.#.#.#|#.#.#.#|#..#..#|#..#..#|#.....#|#.....#',
  N: '##...#|##...#|#.#..#|#.#..#|#..#.#|#..#.#|#...##|#...##',
  O: '.####.|#....#|#....#|#....#|#....#|#....#|#....#|.####.',
  P: '####.|#...#|#...#|#...#|####.|#....|#....|#....',
  Q: '.####.|#....#|#....#|#....#|#....#|#....#|#....#|.####.|...#..|....##',
  R: '####.|#...#|#...#|#...#|####.|#..#.|#...#|#...#',
  S: '.####|#....|#....|.###.|....#|....#|....#|####.',
  T: '#####|..#..|..#..|..#..|..#..|..#..|..#..|..#..',
  U: '#...#|#...#|#...#|#...#|#...#|#...#|#...#|.###.',
  V: '#...#|#...#|#...#|.#.#.|.#.#.|.#.#.|..#..|..#..',
  W: '#..#..#|#..#..#|#..#..#|#.#.#.#|#.#.#.#|#.#.#.#|.#...#.|.#...#.',
  X: '#...#|#...#|.#.#.|..#..|..#..|.#.#.|#...#|#...#',
  Y: '#...#|#...#|.#.#.|.#.#.|..#..|..#..|..#..|..#..',
  Z: '#####|....#|...#.|..#..|..#..|.#...|#....|#####',
  a: '....|....|.##.|...#|.###|#..#|#..#|.###',
  b: '#...|#...|###.|#..#|#..#|#..#|#..#|###.',
  c: '....|....|.###|#...|#...|#...|#...|.###',
  d: '...#|...#|.###|#..#|#..#|#..#|#..#|.###',
  e: '....|....|.##.|#..#|####|#...|#...|.###',
  f: '.##|#..|###|#..|#..|#..|#..|#..',
  g: '....|....|.###|#..#|#..#|#..#|#..#|.###|...#|.##.',
  h: '#...|#...|###.|#..#|#..#|#..#|#..#|#..#',
  i: '#|.|#|#|#|#|#|#',
  j: '.#|..|.#|.#|.#|.#|.#|.#|.#|#.',
  k: '#...|#...|#..#|#.#.|##..|##..|#.#.|#..#',
  l: '#|#|#|#|#|#|#|#',
  m: '.......|.......|###.##.|#..#..#|#..#..#|#..#..#|#..#..#|#..#..#',
  n: '....|....|###.|#..#|#..#|#..#|#..#|#..#',
  o: '....|....|.##.|#..#|#..#|#..#|#..#|.##.',
  p: '....|....|###.|#..#|#..#|#..#|#..#|###.|#...|#...',
  q: '....|....|.###|#..#|#..#|#..#|#..#|.###|...#|...#',
  r: '...|...|#.#|##.|#..|#..|#..|#..',
  s: '....|....|.###|#...|.##.|...#|...#|###.',
  t: '...|.#.|###|.#.|.#.|.#.|.#.|..#',
  u: '....|....|#..#|#..#|#..#|#..#|#..#|.###',
  v: '.....|.....|#...#|#...#|.#.#.|.#.#.|..#..|..#..',
  w: '.......|.......|#..#..#|#..#..#|#.#.#.#|#.#.#.#|.#...#.|.#...#.',
  x: '.....|.....|#...#|.#.#.|..#..|..#..|.#.#.|#...#',
  y: '.....|.....|#...#|#...#|.#.#.|.#.#.|..#..|..#..|.#...|#....',
  z: '....|....|####|...#|..#.|.#..|#...|####',
  0: '.###.|#...#|#...#|#...#|#...#|#...#|#...#|.###.',
  1: '..#..|.##..|..#..|..#..|..#..|..#..|..#..|.###.',
  2: '.###.|#...#|....#|...#.|..#..|.#...|#....|#####',
  3: '.###.|#...#|....#|..##.|....#|....#|#...#|.###.',
  4: '...#.|..##.|.#.#.|#..#.|#####|...#.|...#.|...#.',
  5: '#####|#....|#....|####.|....#|....#|#...#|.###.',
  6: '..##.|.#...|#....|####.|#...#|#...#|#...#|.###.',
  7: '#####|....#|...#.|...#.|..#..|..#..|.#...|.#...',
  8: '.###.|#...#|#...#|.###.|#...#|#...#|#...#|.###.',
  9: '.###.|#...#|#...#|#...#|.####|....#|...#.|.##..',
  '.': '.|.|.|.|.|.|.|#',
  ',': '..|..|..|..|..|..|..|.#|#.',
  ':': '.|.|.|#|.|.|.|#',
  '!': '#|#|#|#|#|#|.|#',
  '?': '###.|...#|...#|..#.|.#..|.#..|....|.#..',
  '-': '...|...|...|...|###|...|...|...',
  '(': '..#|.#.|#..|#..|#..|#..|#..|.#.|..#',
  ')': '#..|.#.|..#|..#|..#|..#|..#|.#.|#..',
  '/': '...#|...#|..#.|..#.|.#..|.#..|#...|#...',
  "'": '#|#|.|.|.|.|.|.',
  '+': '.....|.....|..#..|..#..|#####|..#..|..#..|.....',
  '<': '...|...|..#|.#.|#..|.#.|..#|...',
  '>': '...|...|#..|.#.|..#|.#.|#..|...',
  '_': '....|....|....|....|....|....|....|....|####',
  '*': '.....|#.#.#|.###.|#.#.#|.....|.....|.....|.....',
  '·': '.|.|.|.|#|.|.|.',
  '♪': '..#..|..##.|..#.#|..#..|..#..|.##..|###..|.#...',
  '▾': '.....|.....|.....|#####|.###.|..#..|.....|.....',
  '▸': '....|#...|##..|###.|##..|#...|....|....',
  '►': '....|#...|##..|###.|####|###.|##..|#...',
};
// Bold = the glyph OR-ed with itself one pixel to the right; these would clog, so are drawn.
const UI_BOLD = {
  M: '##.....##|###...###|##.#.#.##|##.#.#.##|##..#..##|##..#..##|##.....##|##.....##',
  W: '##.##.##|##.##.##|##.##.##|##.##.##|##.##.##|##.##.##|.##..##.|.##..##.',
  m: '........|........|#######.|##.##.##|##.##.##|##.##.##|##.##.##|##.##.##',
  w: '........|........|##.##.##|##.##.##|##.##.##|##.##.##|.##..##.|.##..##.',
  '*': '..#..|#.#.#|.###.|#.#.#|..#..|.....|.....|.....',
};

// Rows of '#' into one path of merged rectangles (runs merged vertically too).
function bitmapPath(rows, ox = 0, oy = 0) {
  const rects = [];
  let open = new Map();
  rows.forEach((row, y) => {
    const next = new Map();
    for (let x = 0; x < row.length;) {
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

function makeFont(prefix, { bold = false, space = 3 } = {}) {
  const used = new Map();
  const rowsOf = (ch) => {
    if (bold && UI_BOLD[ch]) return UI_BOLD[ch].split('|');
    const src = UI[ch];
    if (src === undefined) throw new Error(`pixel font: no glyph for ${JSON.stringify(ch)}`);
    let rows = src.split('|');
    const w = rows[0].length;
    rows.forEach((r, i) => { if (r.length !== w) throw new Error(`glyph ${ch} row ${i} is ${r.length} wide, expected ${w}`); });
    if (bold) {
      rows = rows.map((r) => {
        const a = `${r}.`, b = `.${r}`;
        return [...a].map((c, i) => (c === '#' || b[i] === '#' ? '#' : '.')).join('');
      });
    }
    return rows;
  };
  const font = {
    adv: (ch) => (ch === ' ' ? space : rowsOf(ch)[0].length + 1),
    id(ch) {
      const id = prefix + ch.codePointAt(0).toString(36);
      if (!used.has(id)) used.set(id, bitmapPath(rowsOf(ch)));
      return id;
    },
    width: (str) => [...str].reduce((w, ch) => w + font.adv(ch), 0) - 1,
    defs: () => [...used].map(([id, d]) => `<path id="${id}" d="${d}"/>`).join(''),
  };
  return font;
}
const ui = makeFont('u');
const uib = makeFont('b', { bold: true, space: 4 });

// A run of pixel glyphs; (x, y) is the top of the cap height.
function px(font, str, x, y, fill, { maxW = Infinity, attrs = '' } = {}) {
  const w = font.width(str);
  if (w > maxW) throw new Error(`pixel text "${str}" is ${w} px wide, room for ${maxW}`);
  let s = `<g transform="translate(${r1(x)} ${r1(y)})" fill="${fill}"${attrs ? ` ${attrs}` : ''}>`;
  let cx = 0;
  for (const ch of str) {
    if (ch !== ' ') s += `<use href="#${font.id(ch)}"${cx ? ` x="${cx}"` : ''}/>`;
    cx += font.adv(ch);
  }
  return `${s}</g>`;
}

// ------------------------------------------------------------------------------ stroke font
// Rounded monoline sans. Glyph box: baseline y = 0, x-height -100, cap height -140, ascender
// -150, descender +45 (y grows down). Entry: [advance, path, sides]; "D x,y" is a dot.
const BOWL_L = 'M100,-50 A50,50 0 1 1 0,-50 A50,50 0 1 1 100,-50';
const BOWL_R = 'M0,-50 A50,50 0 1 1 100,-50 A50,50 0 1 1 0,-50';
const CAP_O = 'M0,-70 A64,70 0 1 1 128,-70 A64,70 0 1 1 0,-70';
const FONT = {
  a: [100, `M100,-100 V0 ${BOWL_L}`, 'os'], // single-storey, as the casual hands of the period
  b: [100, `M0,-150 V0 ${BOWL_R}`, 'so'],
  c: [90, 'M88.3,-82.1 A50,50 0 1 0 88.3,-17.9', 'ov'],
  d: [100, `M100,-150 V0 ${BOWL_L}`, 'os'],
  e: [100, 'M4,-44 L98,-58 C94,-86 74,-100 50,-100 C22,-100 2,-78 2,-50 C2,-20 22,0 52,0 C70,0 83,-6 92,-17', 'oo'],
  f: [62, 'M66,-147 C62,-149 58,-150 53,-150 C36,-150 26,-140 26,-120 V0 M0,-96 L60,-102', 'vv'],
  g: [100, `M100,-100 V6 C100,31 83,45 56,45 C38,45 23,40 12,30 ${BOWL_L}`, 'os'],
  h: [88, 'M0,-150 V0 M0,-56 A44,44 0 0 1 88,-56 V0', 'ss'],
  i: [0, 'M0,-100 V0 D0,-140', 'ss'],
  j: [30, 'M30,-100 V12 C30,33 20,45 0,45 D30,-140', 'vs'],
  k: [80, 'M0,-150 V0 M76,-100 L0,-38 M30,-62 L80,0', 'sv'],
  l: [0, 'M0,-150 V0', 'ss'],
  m: [148, 'M0,-100 V0 M0,-63 A37,37 0 0 1 74,-63 V0 M74,-63 A37,37 0 0 1 148,-63 V0', 'ss'],
  n: [88, 'M0,-100 V0 M0,-56 A44,44 0 0 1 88,-56 V0', 'ss'],
  o: [100, BOWL_R, 'oo'],
  p: [100, `M0,-100 V45 ${BOWL_R}`, 'so'],
  q: [100, `M100,-100 V45 ${BOWL_L}`, 'os'],
  r: [60, 'M0,-100 V0 M0,-54 C4,-84 26,-100 60,-98', 'sv'],
  s: [78, 'M74,-79 C68,-92 56,-100 40,-100 C20,-100 6,-90 6,-74 C6,-58 18,-54 40,-50 C62,-46 76,-42 76,-26 C76,-10 62,0 40,0 C22,0 8,-7 2,-21', 'oo'],
  t: [64, 'M26,-138 V-30 C26,-10 36,0 54,0 C59,0 63,-1 66,-3 M0,-94 L62,-102', 'vv'],
  u: [88, 'M0,-100 V-44 A44,44 0 0 0 88,-44 M88,-100 V0', 'ss'],
  v: [84, 'M0,-100 L42,0 L84,-100', 'vv'],
  w: [128, 'M0,-100 L30,0 L64,-86 L98,0 L128,-100', 'vv'],
  x: [80, 'M0,-100 L80,0 M80,-100 L0,0', 'vv'],
  y: [86, 'M0,-100 L44,-2 M86,-100 L32,28 C26,40 17,45 4,45', 'vv'],
  z: [78, 'M0,-100 H76 L0,0 H78', 'vv'],
  A: [108, 'M0,0 L54,-140 L108,0 M20,-46 H88', 'vv'],
  B: [88, 'M0,0 V-140 H48 A34,34 0 0 1 48,-72 H0 M48,-72 H52 A36,36 0 0 1 52,0 H0', 'so'],
  C: [114, 'M112.4,-113.1 A64,70 0 1 0 112.4,-26.9', 'ov'],
  D: [112, 'M0,0 V-140 H42 A70,70 0 0 1 42,0 H0', 'so'],
  E: [78, 'M78,-140 H0 V0 H78 M0,-72 H64', 'sv'],
  F: [76, 'M76,-140 H0 V0 M0,-70 H60', 'sv'],
  H: [100, 'M0,-140 V0 M100,-140 V0 M0,-72 H100', 'ss'],
  I: [60, 'M0,-140 H60 M30,-140 V0 M0,0 H60', 'vv'],
  M: [124, 'M0,0 V-140 L62,-40 L124,-140 V0', 'ss'],
  N: [100, 'M0,0 V-140 L100,0 V-140', 'ss'],
  O: [128, CAP_O, 'oo'],
  P: [88, 'M0,0 V-140 H48 A39,39 0 0 1 48,-62 H0', 'so'],
  S: [94, 'M92,-112 C84,-130 68,-140 48,-140 C22,-140 6,-126 6,-104 C6,-82 22,-76 48,-70 C76,-64 94,-58 94,-36 C94,-12 76,0 48,0 C24,0 8,-10 0,-30', 'oo'],
  T: [104, 'M0,-140 H104 M52,-140 V0', 'vv'],
  0: [92, 'M0,-70 A46,70 0 1 1 92,-70 A46,70 0 1 1 0,-70', 'oo'],
  1: [42, 'M0,-110 L42,-140 V0', 'vs'],
  2: [88, 'M2,-104 C4,-126 20,-140 44,-140 C68,-140 84,-126 84,-104 C84,-86 74,-74 56,-58 L0,0 H88', 'ov'],
  3: [86, 'M4,-116 C10,-131 24,-140 42,-140 C66,-140 80,-126 80,-106 C80,-86 66,-74 44,-74 H34 M44,-74 C70,-74 86,-60 86,-38 C86,-14 68,0 42,0 C20,0 6,-10 0,-28', 'vo'],
  4: [96, 'M70,0 V-140 L0,-42 H96', 'vv'],
  5: [88, 'M80,-140 H14 L6,-78 C16,-86 28,-90 44,-90 C70,-90 88,-72 88,-46 C88,-18 70,0 42,0 C22,0 8,-8 0,-24', 'vo'],
  6: [90, 'M76,-124 C70,-134 58,-140 46,-140 C18,-140 0,-116 0,-78 V-46 A45,46 0 1 0 90,-46 A45,46 0 1 0 0,-46', 'oo'],
  7: [86, 'M0,-140 H86 L30,0', 'vv'],
  8: [76, 'M38,-140 A33,33 0 1 1 38,-74 A33,33 0 1 1 38,-140 M38,-76 A38,38 0 1 1 38,0 A38,38 0 1 1 38,-76', 'oo'],
  9: [90, 'M14,-16 C20,-6 32,0 44,0 C72,0 90,-24 90,-62 V-94 A45,46 0 1 0 0,-94 A45,46 0 1 0 90,-94', 'oo'],
  '.': [0, 'D0,-3', 'pp'],
  ',': [6, 'D6,-3 M6,-3 L0,22', 'pp'],
  ':': [0, 'D0,-78 D0,-3', 'pp'],
  '-': [44, 'M0,-52 H44', 'vv'],
  '+': [64, 'M0,-58 H64 M32,-90 V-26', 'vv'],
  '/': [58, 'M0,22 L58,-150', 'vv'],
  "'": [0, 'M0,-150 V-116', 'vv'],
  '!': [0, 'M0,-140 V-44 D0,-3', 'ss'],
  '?': [70, 'M0,-110 C4,-128 18,-140 36,-140 C56,-140 70,-128 70,-108 C70,-84 36,-78 36,-44 D36,-3', 'oo'],
};
const SIDE = { s: 13, o: 6, v: 1, p: 9 };
const DOT_R = 4;
const KERN = { ra: -9, ry: -7, rt: -3, ro: -6, re: -6, rs: -4, fa: -9, fo: -8, ta: -3, ct: -4, 'r.': -12, 'r,': -12, 'y.': -10, 'y,': -10, wa: -4, aw: -4, ay: -4, ya: -4, 'T.': -12 };

function placeGlyph(src, ox, oy, s) {
  const tok = src.match(/[MLHVCAZD]|-?\d*\.?\d+/g) || [];
  let out = '';
  let i = 0;
  const X = () => r2(ox + Number(tok[i++]) * s);
  const Y = () => r2(oy + Number(tok[i++]) * s);
  while (i < tok.length) {
    const c = tok[i++];
    if (c === 'M' || c === 'L') out += `${c}${X()} ${Y()}`;
    else if (c === 'H') out += `H${X()}`;
    else if (c === 'V') out += `V${Y()}`;
    else if (c === 'C') out += `C${X()} ${Y()} ${X()} ${Y()} ${X()} ${Y()}`;
    else if (c === 'A') {
      const rx = r2(Number(tok[i++]) * s), ry = r2(Number(tok[i++]) * s);
      const rot = tok[i++], la = tok[i++], sw = tok[i++];
      out += `A${rx} ${ry} ${rot} ${la} ${sw} ${X()} ${Y()}`;
    } else if (c === 'D') {
      const q = r2(DOT_R * s);
      out += `M${r2(ox + Number(tok[i++]) * s - DOT_R * s)} ${Y()}a${q} ${q} 0 1 0 ${r2(2 * DOT_R * s)} 0a${q} ${q} 0 1 0 ${r2(-2 * DOT_R * s)} 0`;
    } else if (c === 'Z') out += 'Z';
    else throw new Error(`bad glyph token "${c}" in "${src}"`);
  }
  return out;
}

// Lay a word out in font units. `wu` is the stroke weight in units (it widens every gap).
function layoutWord(str, wu) {
  const items = [];
  let pen = 0, prev = null, prevCh = '';
  for (const ch of str) {
    const g = FONT[ch];
    if (!g) throw new Error(`stroke font: no glyph for "${ch}" in "${str}"`);
    if (items.length) pen += wu + (prev ? SIDE[prev[2][1]] + SIDE[g[2][0]] + (KERN[prevCh + ch] || 0) : 0);
    items.push({ ch, x: pen, adv: g[0] });
    pen += g[0];
    prev = g; prevCh = ch;
  }
  return { items, width: pen };
}

// ------------------------------------------------------------------------------ the message hand
// Size: x-height 6.8 px. Each glyph is defined once (font units) and placed with a small seeded
// tilt and bounce, which is what makes it read as a casual hand rather than a typeface.
const MS = 0.068;          // font units -> px
const MW = 21;             // stroke weight, font units (1.4 px)
const MG = 16;             // spacing weight: letters sit a little tighter than the stroke implies
const MSPACE = 64;         // word space, font units
const LINE = 16;           // message line height, px
const EMO = 15;            // inline emoticon size, px
const usedK = new Set();
const kid = (ch) => `k${ch.codePointAt(0).toString(36)}`;

function measureWord(w) {
  const m = /^\{(\w+)\}([.,!?]?)$/.exec(w);
  if (m) {
    const tail = m[2] ? layoutWord(m[2], MG).width + MG + 8 : 0;
    return (EMO + 2) / MS + tail;
  }
  return layoutWord(w, MG).width + MG;
}
// Break a message into lines no wider than maxW px.
function wrap(str, maxW) {
  const lines = [];
  let cur = [], curW = 0;
  for (const w of str.split(' ')) {
    const ww = measureWord(w) * MS;
    const add = (cur.length ? MSPACE * MS : 0) + ww;
    if (cur.length && curW + add > maxW) { lines.push(cur); cur = [w]; curW = ww; }
    else { cur.push(w); curW += add; }
  }
  if (cur.length) lines.push(cur);
  return lines;
}
// One line of message text; (x, base) is the left end of the baseline.
function handLine(words, x, base, colour) {
  let g = `<g class="k m" stroke="${colour}" transform="translate(${r1(x)} ${r1(base)}) scale(${MS})">`;
  let emo = '';
  let pen = 0;
  words.forEach((w, wi) => {
    if (wi) pen += MSPACE;
    const m = /^\{(\w+)\}([.,!?]?)$/.exec(w);
    if (m) {
      emo += `<use href="#emo-${m[1]}" x="${r1(x + pen * MS + 1)}" y="${r1(base - 12)}"/>`;
      pen += (EMO + 2) / MS;
      if (m[2]) w = m[2]; else return;
      pen += 8;
    }
    const L = layoutWord(w, MG);
    for (const it of L.items) {
      usedK.add(it.ch);
      const rot = (rng() - 0.5) * 9;
      const dy = (rng() - 0.5) * 10;
      const sc = 0.95 + rng() * 0.1;
      const cx = it.adv / 2;
      g += `<use href="#${kid(it.ch)}" transform="translate(${r1(pen + it.x)} ${r1(dy)}) rotate(${r1(rot)} ${r1(cx)} -50)${Math.abs(sc - 1) > 0.02 ? ` scale(${r2(sc)})` : ''}"/>`;
    }
    pen += L.width + MG;
  });
  return `${g}</g>${emo}`;
}
const kDefs = () => [...usedK].map((ch) => `<path id="${kid(ch)}" d="${placeGlyph(FONT[ch][1], 0, 0, 1)}"/>`).join('');

// Big lettering (the name in the conversation header): absolute path data.
function bigPath(str, x, base, s, wu) {
  const L = layoutWord(str, wu);
  return { d: L.items.map((it) => placeGlyph(FONT[it.ch][1], x + it.x * s, base, s)).join(''), width: L.width * s };
}

// ------------------------------------------------------------------------------ timeline
// One story, played once over STORY seconds and then held on its last frame.
const STORY = 20;
const css = [];
let kn = 0;
const pct = (t) => `${r2(Math.min(100, Math.max(0, (t / STORY) * 100)))}%`;
// Hard cuts of one property: list = [[t, value], ...], starting at t = 0.
function cuts(prop, list) {
  const name = `c${(kn++).toString(36)}`;
  const frames = [];
  list.forEach(([t, v], i) => {
    if (i === 0) frames.push(`0%{${prop}:${v}}`);
    else frames.push(`${pct(t - 0.02)}{${prop}:${list[i - 1][1]}}${pct(t)}{${prop}:${v}}`);
  });
  frames.push(`100%{${prop}:${list[list.length - 1][1]}}`);
  css.push(`@keyframes ${name}{${frames.join('')}}.${name}{animation:${name} ${STORY}s linear both}`);
  return name;
}
const showFrom = (t) => cuts('opacity', [[0, 0], [t, 1]]);
const showDuring = (spans) => {
  const list = [[0, 0]];
  for (const [a, b] of spans) { list.push([a, 1]); if (b < STORY) list.push([b, 0]); }
  return cuts('opacity', list);
};

// The story beats, in seconds.
const BEAT = {
  signIn: 1.2,        // castaway climbs the palm: one bar, she is Online, the toast slides up
  toastOut: 6.0,
  m1: 3.4, m2: 4.6, m3: 7.4, m4: 10.2, m5: 11.4, m6: 14.0, m7: 15.4,
  signOut: 16.4,      // back down the palm: Away
  nudge: 17.4,        // you send a nudge; the window shakes
  away: 18.4,         // and the system tells you what you already know
};
const TYPING = [[2.0, BEAT.m1], [5.2, BEAT.m3], [8.2, BEAT.m4], [12.0, BEAT.m6], [14.6, BEAT.m7]];

// ------------------------------------------------------------------------------ small drawings
const defs = [];
// XP-ish chrome gradients and the status person glyphs
defs.push(
  '<linearGradient id="gTitle" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5fa2ff"/><stop offset=".12" stop-color="#2a7af6"/><stop offset=".5" stop-color="#0a5ce8"/><stop offset=".88" stop-color="#0753df"/><stop offset="1" stop-color="#0646c6"/></linearGradient>',
  '<linearGradient id="gTitleShine" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".2" stop-color="#fff" stop-opacity=".18"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/></linearGradient>',
  '<linearGradient id="gClient" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eef5fd"/><stop offset="1" stop-color="#d3e3f7"/></linearGradient>',
  '<linearGradient id="gHead" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#dbe8f8"/></linearGradient>',
  '<linearGradient id="gBtn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fb3ff"/><stop offset=".45" stop-color="#2b6ff0"/><stop offset="1" stop-color="#1d55d6"/></linearGradient>',
  '<linearGradient id="gClose" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3a089"/><stop offset=".45" stop-color="#e2552e"/><stop offset="1" stop-color="#c63c17"/></linearGradient>',
  '<linearGradient id="gSend" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#f0efe8"/><stop offset="1" stop-color="#d9d6c8"/></linearGradient>',
  '<linearGradient id="gGroupBar" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#dbe8fa"/><stop offset="1" stop-color="#dbe8fa" stop-opacity="0"/></linearGradient>',
  '<linearGradient id="gSand" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f7e8c6"/><stop offset="1" stop-color="#e6c992"/></linearGradient>',
);
for (const [k, [hi, mid, edge]] of Object.entries({ on: C.online, aw: C.away, bz: C.busy, of: C.offline })) {
  defs.push(`<radialGradient id="gb${k}" cx=".38" cy=".3" r=".8"><stop offset="0" stop-color="${hi}"/><stop offset="1" stop-color="${mid}"/></radialGradient>`);
  defs.push(`<g id="bud-${k}"><circle cx="6" cy="4.2" r="3.3" fill="url(#gb${k})" stroke="${edge}" stroke-width=".9"/><path d="M1 13.4C1 9.6 3.2 8 6 8S11 9.6 11 13.4Z" fill="url(#gb${k})" stroke="${edge}" stroke-width=".9"/><circle cx="4.9" cy="3.1" r="1.1" fill="#fff" opacity=".75"/></g>`);
}

// Inline emoticons, 15 x 15 (also drawn larger in the custom emoticon panel).
const EMOTICONS = {
  smile: '<circle cx="7.5" cy="7.5" r="6.8" fill="#ffd23c" stroke="#c98a00"/><circle cx="5.6" cy="4.6" r="2.6" fill="#fff" opacity=".45"/><ellipse cx="5.2" cy="6.3" rx=".9" ry="1.3" fill="#4a2a00"/><ellipse cx="9.8" cy="6.3" rx=".9" ry="1.3" fill="#4a2a00"/><path d="M4.4 9.2Q7.5 12.4 10.6 9.2" fill="none" stroke="#4a2a00" stroke-width="1.1" stroke-linecap="round"/>',
  note: '<circle cx="7.5" cy="7.5" r="6.8" fill="#dff0ff" stroke="#3d7fd0"/><path d="M6.3 10.4V3.6l4 1.3v1.7l-2.6-.8v4.8" fill="none" stroke="#1d4fa8" stroke-width="1.2" stroke-linejoin="round"/><ellipse cx="5" cy="10.6" rx="1.9" ry="1.5" fill="#1d4fa8"/>',
  palm: '<path d="M1 14.5Q7.5 10.5 14 14.5Z" fill="#f0d189" stroke="#c9a456" stroke-width=".8"/><path d="M7.6 13Q8.6 8.5 7.4 4.8" fill="none" stroke="#9a5a3e" stroke-width="1.7" stroke-linecap="round"/><path d="M7.4 4.8Q3.5 2.5 1.2 6.4Q4 4.6 7.4 4.8ZM7.4 4.8Q11.8 2.2 14 6.6Q10.8 4.6 7.4 4.8ZM7.4 4.8Q5.5 1 2.6 1.4Q5.8 2.4 7.4 4.8ZM7.4 4.8Q9.6 .8 12.6 1.6Q9.2 2.6 7.4 4.8Z" fill="#3f9e48" stroke="#25702e" stroke-width=".6" stroke-linejoin="round"/><circle cx="7" cy="6" r="1" fill="#6b4524"/><circle cx="8.3" cy="6.2" r="1" fill="#7a5029"/>',
  crab: '<path d="M2.6 10.6Q2.4 4 7.5 3.6Q12.6 4 12.4 10.6Z" fill="#8a5a33" stroke="#5a3a1e" stroke-width=".8"/><path d="M4.6 6.4Q7.5 5.2 10.4 6.4" fill="none" stroke="#b07c4c" stroke-width=".8"/><path d="M3 10.6L1.4 13M5 11L4.2 13.8M10 11L10.8 13.8M12 10.6L13.6 13" stroke="#d84a2b" stroke-width="1.1" stroke-linecap="round"/><circle cx="1.6" cy="9" r="1.6" fill="#e2552f"/><circle cx="13.4" cy="9" r="1.6" fill="#e2552f"/><path d="M6.2 10.6V8.6M8.8 10.6V8.6" stroke="#d84a2b" stroke-width=".9"/><circle cx="6.2" cy="8.2" r=".9" fill="#222"/><circle cx="8.8" cy="8.2" r=".9" fill="#222"/>',
  turtle: '<ellipse cx="7" cy="9.4" rx="5.6" ry="4" fill="#4c9a54" stroke="#2c6534" stroke-width=".8"/><path d="M4 8.6L7 7L10 8.6L9 11L5 11Z" fill="none" stroke="#2c6534" stroke-width=".7"/><circle cx="13" cy="8.2" r="1.9" fill="#8fc77a" stroke="#4c8a42" stroke-width=".7"/><circle cx="13.5" cy="7.7" r=".45" fill="#222"/><ellipse cx="3" cy="12.8" rx="1.8" ry=".9" fill="#8fc77a"/><ellipse cx="10.6" cy="13" rx="1.8" ry=".9" fill="#8fc77a"/>',
  bottle: '<g transform="rotate(-35 7.5 7.5)"><rect x="5.2" y="1" width="4.6" height="2.6" rx=".8" fill="#b88a55"/><path d="M5.6 3.4H9.4V5.2Q11.6 6.4 11.6 8.6V13Q11.6 14.4 10.2 14.4H4.8Q3.4 14.4 3.4 13V8.6Q3.4 6.4 5.6 5.2Z" fill="#9fe0cf" fill-opacity=".85" stroke="#3f8f7c" stroke-width=".8"/><rect x="5.3" y="8" width="4.4" height="4.2" rx=".6" fill="#fff6dc" stroke="#c8a96a" stroke-width=".5"/><path d="M4.6 7.2V12.6" stroke="#fff" stroke-width=".8" opacity=".8"/></g>',
  drone: '<path d="M3.4 4.2H11.6" stroke="#4a5562" stroke-width="1.4" stroke-linecap="round"/><ellipse cx="3.2" cy="2.8" rx="2.6" ry=".7" fill="#9fb3c6"/><ellipse cx="11.8" cy="2.8" rx="2.6" ry=".7" fill="#9fb3c6"/><rect x="5.4" y="3.6" width="4.2" height="2.6" rx="1" fill="#e9eef3" stroke="#4a5562" stroke-width=".7"/><path d="M7.5 6.2V8" stroke="#4a5562" stroke-width=".7"/><rect x="4.8" y="8" width="5.4" height="5" rx=".5" fill="#d9a865" stroke="#8d6230" stroke-width=".7"/><path d="M7.5 8V13M4.8 10.5H10.2" stroke="#8d6230" stroke-width=".6"/>',
  phones: '<path d="M2.8 9.4Q2.6 2.2 7.5 2.2Q12.4 2.2 12.2 9.4" fill="none" stroke="#cbb994" stroke-width="2.6"/><path d="M2.8 9.4Q2.6 2.2 7.5 2.2Q12.4 2.2 12.2 9.4" fill="none" stroke="#f5edda" stroke-width="1.5"/><rect x="1" y="7.6" width="3.8" height="5.8" rx="1.6" fill="#f5edda" stroke="#a8946a" stroke-width=".8"/><rect x="10.2" y="7.6" width="3.8" height="5.8" rx="1.6" fill="#f5edda" stroke="#a8946a" stroke-width=".8"/>',
};
for (const [k, v] of Object.entries(EMOTICONS)) defs.push(`<g id="emo-${k}">${v}</g>`);

// The invented messenger's icon: a bottle with a note in it, 16 x 16.
defs.push('<g id="appIcon"><g transform="rotate(-40 8 8)"><rect x="5.6" y=".6" width="4.8" height="2.8" rx=".8" fill="#c79358" stroke="#7a5426" stroke-width=".6"/><path d="M6 3.2H10V5.3Q12.6 6.6 12.6 9.2V14Q12.6 15.4 11.2 15.4H4.8Q3.4 15.4 3.4 14V9.2Q3.4 6.6 6 5.3Z" fill="#8fe3d0" stroke="#1d6f61" stroke-width=".9"/><rect x="5.4" y="8.4" width="5.2" height="5" rx=".6" fill="#fffbe9" stroke="#c49a52" stroke-width=".6"/><path d="M6.4 10H9.6M6.4 11.6H8.8" stroke="#3a6ea8" stroke-width=".6"/><path d="M4.7 7.6V13.6" stroke="#fff" stroke-width=".9" opacity=".85"/></g></g>');

// Generic default picture: a person glyph on a pale blue ground (yours).
defs.push('<linearGradient id="gYou" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e6f2ff"/><stop offset="1" stop-color="#9ec5f0"/></linearGradient>');
defs.push('<linearGradient id="gYouFig" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#cfe2f8"/></linearGradient>');
defs.push('<g id="dpYou"><rect width="96" height="96" fill="url(#gYou)"/><circle cx="20" cy="18" r="30" fill="#fff" opacity=".35"/><circle cx="48" cy="38" r="17" fill="url(#gYouFig)" stroke="#7aa6d8" stroke-width="2"/><path d="M14 98C14 72 30 60 48 60S82 72 82 98Z" fill="url(#gYouFig)" stroke="#7aa6d8" stroke-width="2"/></g>');

// Her display picture, 96 x 96: head and shoulders, headphones on, eyes shut, nodding.
defs.push(
  '<linearGradient id="gDpSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2f8fe0"/><stop offset=".66" stop-color="#9fd8f7"/></linearGradient>',
  '<linearGradient id="gDpSea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1f7fcc"/><stop offset="1" stop-color="#27b4cf"/></linearGradient>',
  '<radialGradient id="gSun" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset=".35" stop-color="#fff8d6" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>',
);
const herHead =
  // hair mass behind the face
  `<path d="M28.5 50C26 30 37 21.5 48.5 21.5S71 30 68.5 50C67.6 58 64 62 61 63H36C33 62 29.4 58 28.5 50Z" fill="${C.hair}"/>`
  // face
  + `<path d="M33.5 44.5C33.5 59 40 66.5 48.5 66.5S63.5 59 63.5 44.5C63.5 35 57 29 48.5 29S33.5 35 33.5 44.5Z" fill="${C.skin}"/>`
  + `<path d="M35 52C37 60 42 64.5 48.5 64.6C44 62 40 58 38.6 51Z" fill="${C.skinShade}" opacity=".45"/>`
  // fringe, swept to one side, and two loose strands
  + `<path d="M30.5 47C29.5 32 38 24.5 49.5 24.5C60.5 24.5 68 32 66.5 46C64.5 40.5 61 37 56 35.5C52.5 39.5 45 41.5 37 41.5C35 43 33.4 45 30.5 47Z" fill="${C.hair}"/>`
  + `<path d="M34.2 41.8C32.4 49 32.8 55 35.6 60.6L37 59.6C35.6 54 35.4 48 36.6 42.2Z" fill="${C.hair}"/>`
  + `<path d="M62.8 41C64.6 48 64.4 54 61.8 60L60.4 59.2C61.8 53.4 61.8 47.6 60.6 42Z" fill="${C.hair}"/>`
  + `<path d="M40 29.5C45 27 53 27 58.5 30.5" fill="none" stroke="${C.hairHi}" stroke-width="2" stroke-linecap="round"/>`
  // closed, content eyes, brows, blush, nose, smile
  + `<path d="M38.8 50.4Q41.9 53.2 45 50.4M52 50.4Q55.1 53.2 58.2 50.4" fill="none" stroke="#3d2216" stroke-width="1.6" stroke-linecap="round"/>`
  + `<path d="M39.4 45.6Q42 44.2 44.6 45.2M52.4 45.2Q55 44.2 57.6 45.6" fill="none" stroke="${C.hairDark}" stroke-width="1.1" stroke-linecap="round"/>`
  + `<ellipse cx="38.8" cy="55.6" rx="3.4" ry="1.9" fill="#f38c7c" opacity=".5"/><ellipse cx="58.2" cy="55.6" rx="3.4" ry="1.9" fill="#f38c7c" opacity=".5"/>`
  + `<path d="M48.6 53.4l-.6 2.2" stroke="#cf8f6e" stroke-width="1.1" stroke-linecap="round"/>`
  + `<path d="M45.4 59Q48.5 61.6 51.6 59" fill="none" stroke="#b04e43" stroke-width="1.4" stroke-linecap="round"/>`
  // headphones: band over the top, two cups over the ears
  + `<path d="M29.6 46C27.4 25 69.6 25 67.4 46" fill="none" stroke="${C.creamEdge}" stroke-width="5.6" stroke-linecap="round"/>`
  + `<path d="M29.6 46C27.4 25 69.6 25 67.4 46" fill="none" stroke="${C.cream}" stroke-width="3.6" stroke-linecap="round"/>`
  + `<rect x="24" y="40" width="10" height="17" rx="4.6" fill="${C.cream}" stroke="#a8946a" stroke-width="1.2"/><rect x="31" y="42.5" width="3.4" height="12" rx="1.6" fill="#e3d6b8"/><path d="M26.4 43.5V53.5" stroke="#fff" stroke-width="1.2" stroke-linecap="round" opacity=".8"/>`
  + `<rect x="63" y="40" width="10" height="17" rx="4.6" fill="${C.cream}" stroke="#a8946a" stroke-width="1.2"/><rect x="62.6" y="42.5" width="3.4" height="12" rx="1.6" fill="#e3d6b8"/><path d="M70.4 43.5V53.5" stroke="#fff" stroke-width="1.2" stroke-linecap="round" opacity=".7"/>`;
defs.push(`<g id="dpHer"><rect width="96" height="96" fill="url(#gDpSky)"/><circle cx="14" cy="12" r="30" fill="url(#gSun)"/>`
  + '<g fill="#fff"><circle cx="70" cy="57" r="7"/><circle cx="79" cy="52" r="9"/><circle cx="89" cy="56" r="7"/><circle cx="96" cy="58" r="5"/><rect x="62" y="57" width="36" height="7"/></g>'
  + '<rect y="63" width="96" height="33" fill="url(#gDpSea)"/><path d="M4 70h10M22 74h8M70 72h12M84 78h8M6 84h6" stroke="#fff" stroke-width="1.2" opacity=".55" stroke-linecap="round"/>'
  // a palm frond leaning in from the top right
  + '<path d="M97 6C86 4 74 8 66 18C76 13 86 12 97 15Z" fill="#3f9e48"/><path d="M97 6C90 10 84 18 82 30C87 22 92 17 97 15Z" fill="#2f8540"/><path d="M97 8C86 7 76 11 69 17" fill="none" stroke="#7cc965" stroke-width="1"/>'
  // the bun, low at the back of her neck
  + `<circle cx="31" cy="62.5" r="8.2" fill="${C.hairDark}"/><path d="M26 60Q31 56.5 36 60" fill="none" stroke="${C.hair}" stroke-width="1.6"/>`
  // shoulders, neck, tank top
  + `<path d="M12 97C14 84 24 77.5 37 76.4H60C73 77.5 83 84 85 97Z" fill="${C.skin}"/>`
  + `<path d="M41.6 60H55.4V76Q48.5 81 41.6 76Z" fill="${C.skin}"/><path d="M41.6 64Q48.5 69.4 55.4 64V67.6Q48.5 72 41.6 67.6Z" fill="${C.skinShade}" opacity=".6"/>`
  + `<path d="M22.6 97C23.4 89 28 83.4 34.4 81.6Q48.5 87.8 62.6 81.6C69 83.4 73.6 89 74.4 97Z" fill="${C.coral}"/>`
  + `<path d="M34.4 81.6Q48.5 87.8 62.6 81.6" fill="none" stroke="${C.coralShade}" stroke-width="1.2"/>`
  + `<path d="M35.8 76.6L34.6 82.4M61.2 76.6L62.4 82.4" stroke="${C.coral}" stroke-width="3" stroke-linecap="round"/>`
  // the nodding head (pivot at the neck)
  + `<g class="nod">${herHead}</g>`
  + '<g class="notes"><path d="M80 37V27.5l6 2v2.5l-4-1.3V37" fill="#fff" stroke="#1d4fa8" stroke-width=".9" stroke-linejoin="round"/><ellipse cx="78.6" cy="37.4" rx="2.4" ry="1.8" fill="#fff" stroke="#1d4fa8" stroke-width=".9"/></g>'
  + '</g>');

// A display-picture frame (rounded, glossy border) with a picture inside, at (x, y), 104 x 104.
let clipN = 0;
function dpFrame(x, y, pic, size = 104) {
  const id = `dpc${clipN++}`;
  const inner = size - 8;
  defs.push(`<clipPath id="${id}"><rect x="${x + 4}" y="${y + 4}" width="${inner}" height="${inner}" rx="4"/></clipPath>`);
  return `<rect x="${x + 1}" y="${y + 2}" width="${size}" height="${size}" rx="7" fill="#2b4d7d" opacity=".18"/>`
    + `<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="7" fill="url(#gHead)" stroke="#8eaad4"/>`
    + `<g clip-path="url(#${id})"><use href="#${pic}" transform="translate(${x + 4} ${y + 4}) scale(${r2(inner / 96)})"/></g>`
    + `<rect x="${x + 3.5}" y="${y + 3.5}" width="${inner + 1}" height="${inner + 1}" rx="4.5" fill="none" stroke="#5d7fae" stroke-opacity=".6"/>`;
}

// ------------------------------------------------------------------------------ window chrome
function roundTop(x, y, w, h, r) {
  return `M${x} ${y + h}V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w} ${y + r}V${y + h}Z`;
}
function titleButtons(x, y) {
  // minimise, maximise, close: 21 x 21 each, ending at x
  const b = (bx, fill) => `<rect x="${bx}" y="${y}" width="21" height="21" rx="3" fill="${fill}" stroke="#fff" stroke-width="1"/>`;
  const cx = x - 21, mx = cx - 23, nx = mx - 23;
  return b(nx, 'url(#gBtn)') + `<rect x="${nx + 5}" y="${y + 13}" width="7" height="3" fill="#fff"/>`
    + b(mx, 'url(#gBtn)') + `<path d="M${mx + 5} ${y + 5}h11v11h-11zM${mx + 6} ${y + 8}v7h9v-7z" fill="#fff" fill-rule="evenodd"/>`
    + b(cx, 'url(#gClose)') + `<path d="M${cx + 6} ${y + 6}l9 9M${cx + 15} ${y + 6}l-9 9" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/>`;
}
function xpWindow(x, y, w, h, title, iconId) {
  const th = 28;
  return `<rect x="${x + 3}" y="${y + 5}" width="${w}" height="${h}" rx="8" fill="#5a3d12" opacity=".14"/>`
    + `<rect x="${x + 1}" y="${y + 2}" width="${w}" height="${h}" rx="8" fill="#5a3d12" opacity=".14"/>`
    + `<path d="${roundTop(x, y, w, h, 8)}" fill="#0b56dc" stroke="#06309a"/>`
    + `<path d="${roundTop(x + 0.5, y + 0.5, w - 1, th, 7.5)}" fill="url(#gTitle)"/>`
    + `<path d="${roundTop(x + 0.5, y + 0.5, w - 1, th, 7.5)}" fill="url(#gTitleShine)"/>`
    + `<path d="M${x + 7} ${y + 1.5}H${x + w - 7}" stroke="#a9ccff" stroke-width="1" opacity=".9"/>`
    + `<rect x="${x + 4}" y="${y + th}" width="${w - 8}" height="${h - th - 4}" fill="url(#gClient)"/>`
    + `<use href="#${iconId}" x="${x + 7}" y="${y + 6}"/>`
    + px(uib, title, x + 28, y + 11, '#0a1f6e') + px(uib, title, x + 27, y + 10, '#ffffff')
    + titleButtons(x + w - 6, y + 4);
}

// A pencil for the "is typing" line, 12 x 12.
defs.push('<g id="pencil"><path d="M2 10.4L3 7.6L9.2 1.4L11.2 3.4L5 9.6Z" fill="#f2c230" stroke="#7a5b00" stroke-width=".7" stroke-linejoin="round"/><path d="M9.2 1.4L10 .6Q10.6 0 11.2 .6L11.6 1Q12.2 1.6 11.6 2.2L11.2 3.4Z" fill="#ef8fa0" stroke="#7a5b00" stroke-width=".6"/><path d="M2 10.4L3 7.6L5 9.6Z" fill="#f6dfb7"/><path d="M2 10.4L2.5 9L3.4 9.9Z" fill="#333"/></g>');
// An information "i" and a nudge glyph for system lines, 12 x 12.
defs.push('<g id="info"><circle cx="6" cy="6" r="5.5" fill="#3b78d8" stroke="#1e4f9e" stroke-width=".8"/><rect x="5.2" y="5" width="1.6" height="4.4" fill="#fff"/><rect x="5.2" y="2.6" width="1.6" height="1.6" fill="#fff"/></g>');
defs.push('<g id="nudgeI"><rect x="2.5" y="2.5" width="7" height="7" rx="1" fill="#e8f1fd" stroke="#2f5ea8"/><rect x="2.5" y="2.5" width="7" height="2" fill="#2f6fe0"/><path d="M.6 4V8M11.4 4V8" stroke="#e2552e" stroke-width="1.1" stroke-linecap="round"/></g>');

// ------------------------------------------------------------------------------ the scene
// Header picture of the conversation window: her island, on a sunny day, as a background.
// Local coordinates, 544 x 104.
const SCW = 544, SCH = 104;
defs.push(
  '<linearGradient id="gSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2d8de0"/><stop offset=".55" stop-color="#7cc6f3"/><stop offset=".7" stop-color="#c7ecfc"/></linearGradient>',
  '<linearGradient id="gSea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c74c8"/><stop offset=".45" stop-color="#1e95d0"/><stop offset="1" stop-color="#27bccd"/></linearGradient>',
  '<linearGradient id="gFade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".93"/><stop offset=".42" stop-color="#fff" stop-opacity=".82"/><stop offset=".64" stop-color="#fff" stop-opacity="0"/></linearGradient>',
  '<linearGradient id="gTrunk" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7c4532"/><stop offset=".45" stop-color="#b06d4f"/><stop offset="1" stop-color="#83493a"/></linearGradient>',
  '<linearGradient id="gIsle" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6e2ae"/><stop offset="1" stop-color="#e2c27e"/></linearGradient>',
);
function cloud(cx, cy, s) {
  const puffs = [[-22, 2, 9], [-12, -4, 12], [2, -8, 14], [16, -3, 11], [27, 2, 8]];
  let out = `<g transform="translate(${cx} ${cy}) scale(${s})">`;
  out += puffs.map(([x, y, r]) => `<circle cx="${x}" cy="${y + 2}" r="${r}" fill="#d6ebf8"/>`).join('');
  out += puffs.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff"/>`).join('');
  out += '<rect x="-31" y="2" width="66" height="9" fill="#fff"/><rect x="-31" y="9" width="66" height="2.5" fill="#d6ebf8"/>';
  return `${out}</g>`;
}
// A tapering trunk along a quadratic curve.
function trunkPath(p0, p1, p2, w0, w1) {
  const n = 14, L = [], R = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const x = (1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0];
    const y = (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1];
    const dx = 2 * (1 - t) * (p1[0] - p0[0]) + 2 * t * (p2[0] - p1[0]);
    const dy = 2 * (1 - t) * (p1[1] - p0[1]) + 2 * t * (p2[1] - p1[1]);
    const len = Math.hypot(dx, dy);
    const hw = (w0 + (w1 - w0) * t) / 2;
    L.push([x - (dy / len) * hw, y + (dx / len) * hw]);
    R.push([x + (dy / len) * hw, y - (dx / len) * hw]);
  }
  const pts = [...L, ...R.reverse()];
  return { d: `M${pts.map(([x, y]) => `${r1(x)} ${r1(y)}`).join('L')}Z`, at: (t) => [(1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0], (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1]] };
}
// One frond: from the crown, out at `ang` (radians), drooping, `len` long.
function frond(cx, cy, ang, len, droop, wid, fill, rib) {
  const tip = [cx + Math.cos(ang) * len, cy + Math.sin(ang) * len + droop];
  const mid = [cx + Math.cos(ang) * len * 0.55, cy + Math.sin(ang) * len * 0.55 - droop * 0.35];
  const nx = -Math.sin(ang), ny = Math.cos(ang);
  const a = [mid[0] + nx * wid, mid[1] + ny * wid];
  const b = [mid[0] - nx * wid * 0.55, mid[1] - ny * wid * 0.55];
  return `<path d="M${r1(cx)} ${r1(cy)}Q${r1(a[0])} ${r1(a[1])} ${r1(tip[0])} ${r1(tip[1])}Q${r1(b[0])} ${r1(b[1])} ${r1(cx)} ${r1(cy)}Z" fill="${fill}"/>`
    + `<path d="M${r1(cx)} ${r1(cy)}Q${r1(mid[0])} ${r1(mid[1])} ${r1(tip[0])} ${r1(tip[1])}" fill="none" stroke="${rib}" stroke-width=".7"/>`;
}
// Her, small: standing, feet at (0, 0), about 25 px tall. `nodClass` nods the head.
function herStanding() {
  return `<path d="M-2.5 -8.6h1.8V-.6h-1.8zM.8 -8.6h1.8V-.6H.8z" fill="${C.skin}"/>`
    + `<ellipse cx="-1.8" cy="-.4" rx="1.4" ry=".7" fill="${C.skinShade}"/><ellipse cx="1.9" cy="-.4" rx="1.4" ry=".7" fill="${C.skinShade}"/>`
    + `<path d="M-3.4 -12.2H3.4L3.8 -7.6H.4L0 -8.8L-.4 -7.6H-3.8Z" fill="${C.shorts}" stroke="#cdbf9c" stroke-width=".4"/>`
    + `<path d="M-3.1 -17.6L-4 -10.6M3.1 -17.6L4 -10.6" stroke="${C.skin}" stroke-width="1.5" stroke-linecap="round"/>`
    + `<path d="M-2.9 -18.4H2.9L3.4 -12H-3.4Z" fill="${C.coral}"/>`
    + `<rect x="-.8" y="-20" width="1.6" height="2" fill="${C.skin}"/>`
    + `<g class="nodS">${smallHead(0, -22.2)}</g>`;
}
function smallHead(x, y) {
  return `<circle cx="${r1(x - 2.9)}" cy="${r1(y + 2.1)}" r="1.7" fill="${C.hairDark}"/>`
    + `<circle cx="${x}" cy="${y}" r="3.4" fill="${C.hair}"/>`
    + `<ellipse cx="${r1(x + 0.5)}" cy="${r1(y + 0.7)}" rx="2.5" ry="2.6" fill="${C.skin}"/>`
    + `<path d="M${r1(x - 3.3)} ${r1(y)}Q${x} ${r1(y - 4.6)} ${r1(x + 3.3)} ${r1(y - 0.4)}Q${r1(x + 1)} ${r1(y - 1.6)} ${r1(x - 1.4)} ${r1(y - 0.6)}Z" fill="${C.hair}"/>`
    + `<path d="M${r1(x - 3.5)} ${r1(y + 0.4)}Q${x} ${r1(y - 5.6)} ${r1(x + 3.5)} ${r1(y + 0.4)}" fill="none" stroke="${C.cream}" stroke-width=".9"/>`
    + `<rect x="${r1(x - 4.4)}" y="${r1(y - 0.6)}" width="1.8" height="2.6" rx=".8" fill="${C.cream}" stroke="#a8946a" stroke-width=".35"/>`
    + `<rect x="${r1(x + 2.6)}" y="${r1(y - 0.6)}" width="1.8" height="2.6" rx=".8" fill="${C.cream}" stroke="#a8946a" stroke-width=".35"/>`;
}
// Her, small, sitting on the palm's crown with the phone held up for its one bar of signal.
function herPerched() {
  return `<path d="M-2.6 -1h1.8V5.6h-1.8zM.9 -1h1.8V5.2H.9z" fill="${C.skin}"/>`
    + `<ellipse cx="-1.6" cy="5.8" rx="1.3" ry=".7" fill="${C.skinShade}"/><ellipse cx="1.9" cy="5.4" rx="1.3" ry=".7" fill="${C.skinShade}"/>`
    + `<path d="M-3.6 -3.6H3.6L3.8 .4H-3.8Z" fill="${C.shorts}" stroke="#cdbf9c" stroke-width=".4"/>`
    + `<path d="M-3.1 -9.4L-4 -2.4" stroke="${C.skin}" stroke-width="1.5" stroke-linecap="round"/>`
    + `<path d="M3 -9.6L5.6 -12.8L6 -16.4" fill="none" stroke="${C.skin}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`
    + `<path d="M-2.9 -10.2H2.9L3.4 -3.4H-3.4Z" fill="${C.coral}"/>`
    + `<rect x="-.8" y="-11.8" width="1.6" height="2" fill="${C.skin}"/>`
    + `<g class="nodS">${smallHead(0, -14)}</g>`
    + '<rect x="4.7" y="-21" width="2.8" height="4.6" rx=".6" fill="#2a2f3a"/><rect x="5.2" y="-20.4" width="1.8" height="3" fill="#9fe3ff"/>';
}
// "One bar": a signal meter with four bars, one of them lit.
function signal(x, y) {
  let s = `<g transform="translate(${x} ${y})"><rect x="-2" y="-11.5" width="17" height="13.5" rx="3" fill="#fff" stroke="#1d4fa8" stroke-width=".9"/>`;
  [3, 5, 7, 9].forEach((h, i) => {
    s += `<rect x="${1 + i * 3.2}" y="${-h}" width="2.2" height="${h}" fill="${i === 0 ? '#2f9a22' : '#c9d6e6'}"/>`;
  });
  return `${s}</g>`;
}

function scene(ox, oy) {
  let s = `<g transform="translate(${ox} ${oy})">`;
  defs.push(`<clipPath id="scClip"><rect width="${SCW}" height="${SCH}" rx="3"/></clipPath>`);
  s += '<g clip-path="url(#scClip)">';
  const HZ = 70;
  s += `<rect width="${SCW}" height="${HZ + 1}" fill="url(#gSky)"/>`;
  s += `<circle cx="520" cy="8" r="56" fill="url(#gSun)"/>`;
  // a cloud bank that drifts left, drawn twice one period apart so the loop is seamless
  let bank = '';
  [[60, 62, 1.0], [150, 66, 0.8], [228, 60, 1.15], [330, 64, 0.85], [420, 61, 1.05], [500, 66, 0.75], [110, 34, 0.55], [290, 28, 0.5], [470, 36, 0.45]]
    .forEach(([x, y, k]) => { bank += cloud(x, y, k); });
  s += `<g class="drift">${bank}<g transform="translate(${SCW} 0)">${bank}</g></g>`;
  s += `<rect y="${HZ}" width="${SCW}" height="${SCH - HZ}" fill="url(#gSea)"/>`;
  s += `<path d="M0 ${HZ}.5H${SCW}" stroke="#bfe6fb" stroke-width="1" opacity=".8"/>`;
  // glints, two sets alternating every half bar
  const glints = (n) => {
    let g = '';
    for (let i = 0; i < n; i++) {
      const gx = rng() * SCW, gy = HZ + 4 + rng() * (SCH - HZ - 8), gw = 3 + rng() * 7;
      g += `M${r1(gx)} ${r1(gy)}h${r1(gw)}`;
    }
    return g;
  };
  s += `<path class="glA" d="${glints(26)}" stroke="#fff" stroke-width="1.1" stroke-linecap="round" opacity=".75"/>`;
  s += `<path class="glB" d="${glints(26)}" stroke="#fff" stroke-width="1.1" stroke-linecap="round" opacity=".75"/>`;
  // the island: foam, sand, bushes
  const IX = 438, IY = 95;
  s += `<ellipse cx="${IX}" cy="${IY + 1.5}" rx="80" ry="12" fill="#bff3ef" opacity=".7"/>`;
  s += `<ellipse cx="${IX}" cy="${IY + 1}" rx="74" ry="9.5" fill="#fff" opacity=".85"/>`;
  s += `<ellipse cx="${IX}" cy="${IY}" rx="70" ry="8.5" fill="url(#gIsle)"/>`;
  s += '<path d="M380 92q6-7 13-3q5-6 12-1q6-4 10 2q-14 4-35 2z" fill="#4f9f3d"/><path d="M386 91q5-4 9-1q5-4 9 0q-8 2-18 1z" fill="#7cc35a"/>';
  s += '<path d="M462 91q5-6 11-2q5-4 9 1q-10 3-20 1z" fill="#4f9f3d"/>';
  s += '<ellipse cx="404" cy="99" rx="5" ry="2.6" fill="#8e8a84"/><ellipse cx="403" cy="98.2" rx="3.4" ry="1.4" fill="#b5b1aa"/>';
  // the raft, tied up on the right
  let raft = '<g transform="translate(500 92) rotate(-6)">';
  for (let i = 0; i < 5; i++) raft += `<rect x="${i * 0.6}" y="${i * 2.3}" width="30" height="2.6" rx="1.3" fill="${i % 2 ? '#9a5a3c' : '#b06a46'}" stroke="#6b3a25" stroke-width=".4"/>`;
  raft += '<path d="M6 -.5v12M23 -.5v12" stroke="#d9c08a" stroke-width="1"/></g>';
  s += raft;
  // the palm: tall, slender, segmented, leaning a little
  const tr = trunkPath([450, 94], [462, 62], [441, 33], 6.4, 3.6);
  s += `<path d="${tr.d}" fill="url(#gTrunk)"/>`;
  let rings = '';
  for (let i = 1; i < 12; i++) {
    const [x, y] = tr.at(i / 12);
    rings += `M${r1(x - 3)} ${r1(y)}q3 1.4 6 0`;
  }
  s += `<path d="${rings}" fill="none" stroke="#6b3a28" stroke-width=".7" opacity=".8"/>`;
  const CX = 441, CY = 33;
  let crown = '';
  [[-2.95, 34, 9, 4.6], [-2.4, 32, 4, 4.4], [-1.75, 22, 1, 3.8], [-1.2, 24, 2, 3.8], [-0.55, 32, 6, 4.4], [0.1, 34, 11, 4.6], [2.7, 26, 10, 4], [0.6, 24, 12, 3.6]]
    .forEach(([a, l, d, w], i) => { crown += frond(CX, CY, a, l, d, w, i % 2 ? '#2f8a3e' : '#45a64c', '#1f6a2e'); });
  [[-2.7, 20, 5, 2.6], [-0.4, 20, 4, 2.6], [-1.5, 16, 0, 2.2]].forEach(([a, l, d, w]) => { crown += frond(CX, CY, a, l, d, w, '#7cc965', '#3f9e48'); });
  s += `<g class="sway">${crown}</g>`;
  s += '<circle cx="439" cy="36" r="2.1" fill="#6b4524"/><circle cx="443" cy="36.6" r="2.1" fill="#7a5029"/><circle cx="441" cy="38.6" r="2" fill="#5e3c1f"/>';
  // the bottle, bobbing in the shallows
  s += '<g class="bob"><use href="#emo-bottle" transform="translate(344 89) scale(.75)"/></g>';
  // her: on the sand while Away; up the palm (one bar) while Online
  s += `<g class="${cuts('opacity', [[0, 1], [BEAT.signIn, 0], [BEAT.signOut, 1]])}"><g transform="translate(418 96)">${herStanding()}</g></g>`;
  s += `<g class="${cuts('opacity', [[0, 0], [BEAT.signIn, 1], [BEAT.signOut, 0]])}" opacity="0"><g transform="translate(441 30)">${herPerched()}</g>${signal(452, 17)}</g>`;
  s += '</g>';
  // the white fade on the left that the name sits on
  s += `<rect width="${SCW}" height="${SCH}" rx="3" fill="url(#gFade)"/>`;
  s += `<rect x=".5" y=".5" width="${SCW - 1}" height="${SCH - 1}" rx="3" fill="none" stroke="${C.border}"/>`;
  return `${s}</g>`;
}

// ------------------------------------------------------------------------------ build
function build() {
  const body = [];
  // the desktop: warm sand
  defs.push(`<clipPath id="panel"><rect width="${W}" height="${H}" rx="14"/></clipPath>`);
  body.push(`<g clip-path="url(#panel)">`);
  body.push(`<rect width="${W}" height="${H}" fill="url(#gSand)"/>`);
  let ripples = '';
  for (let i = 0; i < 40; i++) {
    const x = rng() * W, y = rng() * H, w = 14 + rng() * 30;
    ripples += `M${r1(x)} ${r1(y)}q${r1(w / 2)} -3 ${r1(w)} 0`;
  }
  body.push(`<path d="${ripples}" fill="none" stroke="#d2ad6b" stroke-width="1.2" opacity=".35"/>`);

  // ---------------------------------------------------------------- contact list window
  const LX = 12, LY = 12, LW = 236, LH = H - 24;
  let L = xpWindow(LX, LY, LW, LH, 'Bottle Messenger', 'appIcon');
  // your own header: picture, name, status, empty personal message
  L += `<rect x="${LX + 4}" y="${LY + 28}" width="${LW - 8}" height="66" fill="url(#gHead)"/>`;
  L += dpFrame(LX + 10, LY + 34, 'dpYou', 54);
  L += px(uib, 'you (should be working)', LX + 72, LY + 40, C.ink, { maxW: LW - 80 });
  L += px(ui, '(Online)', LX + 72, LY + 54, C.grey) + `<use href="#bud-on" x="${LX + 72 + ui.width('(Online)') + 4}" y="${LY + 51}"/>` + px(ui, '▾', LX + 72 + ui.width('(Online)') + 19, LY + 54, C.grey);
  L += px(ui, '<Type a personal message>', LX + 72, LY + 69, '#9a9a9a', { maxW: LW - 80 });
  // search box
  L += `<rect x="${LX + 10}" y="${LY + 100}" width="${LW - 20}" height="20" rx="2" fill="#fff" stroke="${C.border}"/>`;
  L += px(ui, 'Find a contact...', LX + 16, LY + 106, '#9a9a9a');
  L += `<circle cx="${LX + LW - 24}" cy="${LY + 109}" r="3.6" fill="none" stroke="#557ab0" stroke-width="1.4"/><path d="M${LX + LW - 21.4} ${LY + 111.6}l3.2 3.2" stroke="#557ab0" stroke-width="1.8" stroke-linecap="round"/>`;
  // the list
  const listTop = LY + 126, rowH = 20;
  L += `<rect x="${LX + 10}" y="${listTop}" width="${LW - 20}" height="${rowH * 18 + 8}" fill="#fff" stroke="${C.border}"/>`;
  const rows = [
    ['g', 'Island (9/9)'],
    ['c', 'castaway', '♪ nodding to the music', 'castaway'],
    ['c', 'sea turtle', 'just visiting', 'on'],
    ['c', 'stray cat', 'asleep up the palm', 'aw'],
    ['c', 'shark', '♪ nods to the beat', 'bz'],
    ['c', 'hermit crab', 'wearing a coconut', 'on'],
    ['c', 'delivery drone', 'parcel: headphones', 'on'],
    ['c', 'the bottle', 'washed straight back', 'aw'],
    ['c', 'kumara', 'growing. slowly.', 'on'],
    ['c', 'hydrofoil bro', 'shaka! carving off', 'on'],
    ['g', 'Tools (4/4)'],
    ['c', 'serve.py', 'live preview, MP4 out', 'on'],
    ['c', 'schedule.py', 'simulates 10 hours', 'on'],
    ['c', 'make_audio.py', 'every sound, from code', 'on'],
    ['c', 'render_demo.py', 'dev reel with a HUD', 'on'],
    ['g', 'Offline (2)'],
    ['c', 'the ship', 'waits till she\'s busy', 'of'],
    ['c', 'nighttime', 'not on this island', 'of'],
  ];
  let ry = listTop + 4;
  const rowRight = LX + LW - 14;
  for (const r of rows) {
    if (r[0] === 'g') {
      L += `<rect x="${LX + 11}" y="${ry + 1}" width="${LW - 22}" height="${rowH - 2}" fill="url(#gGroupBar)"/>`;
      L += px(ui, '▾', LX + 16, ry + 6, C.navy) + px(uib, r[1], LX + 24, ry + 6, C.navy);
    } else {
      const [, name, pm, st] = r;
      const nx = LX + 34;
      if (st === 'castaway') {
        L += `<use href="#bud-aw" x="${LX + 18}" y="${ry + 3}"/>`;
        L += `<use class="${cuts('opacity', [[0, 0], [BEAT.signIn, 1], [BEAT.signOut, 0]])}" opacity="0" href="#bud-on" x="${LX + 18}" y="${ry + 3}"/>`;
      } else L += `<use href="#bud-${st}" x="${LX + 18}" y="${ry + 3}"/>`;
      const nameCol = st === 'of' ? '#8a8a8a' : C.ink;
      L += px(ui, name, nx, ry + 5, nameCol);
      const pmx = nx + ui.width(name) + 5;
      L += px(ui, '- ' + pm, pmx, ry + 5, '#8c8c8c', { maxW: rowRight - pmx });
    }
    ry += rowH;
  }
  // the add-a-contact link under the list
  const addY = listTop + rowH * 18 + 16;
  L += `<circle cx="${LX + 22}" cy="${addY + 4}" r="5.5" fill="#3daa35" stroke="#1f6b15"/><path d="M${LX + 22} ${addY + 1}v6M${LX + 19} ${addY + 4}h6" stroke="#fff" stroke-width="1.6"/>`;
  L += px(ui, 'Add a contact', LX + 32, addY, C.link) + `<path d="M${LX + 32} ${addY + 10}h${ui.width('Add a contact')}" stroke="${C.link}" stroke-width="1"/>`;
  // an advert, as the period's contact lists always had one
  const AY = LY + LH - 4 - 6 - 64;
  L += px(ui, 'Advertisement', LX + LW / 2 - ui.width('Advertisement') / 2, AY - 12, '#8c8c8c');
  defs.push('<linearGradient id="gAd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b8fe0"/><stop offset=".55" stop-color="#58bdf0"/><stop offset=".56" stop-color="#1f9bd0"/><stop offset="1" stop-color="#2ac0cf"/></linearGradient>');
  defs.push(`<clipPath id="adClip"><rect x="${LX + 10}" y="${AY}" width="${LW - 20}" height="60"/></clipPath>`);
  L += `<g clip-path="url(#adClip)"><rect x="${LX + 10}" y="${AY}" width="${LW - 20}" height="60" fill="url(#gAd)"/>`;
  L += `<ellipse cx="${LX + 196}" cy="${AY + 60}" rx="34" ry="8" fill="#f2d99e"/><use href="#emo-palm" transform="translate(${LX + 178} ${AY + 18}) scale(2.4)"/>`;
  L += px(uib, '10 HOURS OF', LX + 18, AY + 8, '#0a2a66') + px(uib, '10 HOURS OF', LX + 17, AY + 7, '#ffffff');
  L += px(uib, 'ALMOST NOTHING', LX + 18, AY + 20, '#0a2a66') + px(uib, 'ALMOST NOTHING', LX + 17, AY + 19, '#fff36b');
  const wn = uib.width('WATCH NOW*') + 10;
  L += `<g class="adPulse"><rect x="${LX + 17}" y="${AY + 36}" width="${wn}" height="15" rx="3" fill="#ff9d1c" stroke="#a85300"/>${px(uib, 'WATCH NOW*', LX + 22, AY + 40, '#ffffff')}</g>`;
  L += px(ui, '*no video yet', LX + 17 + wn + 6, AY + 40, '#ffffff', { maxW: 150 - wn });
  L += `</g><rect x="${LX + 10.5}" y="${AY + 0.5}" width="${LW - 21}" height="59" fill="none" stroke="#2b5f99"/>`;
  body.push(L);

  // ---------------------------------------------------------------- conversation window
  const CX0 = 258, CY0 = 12, CW = 560, CH = H - 24;
  const shake = 'shake';
  let V = xpWindow(CX0, CY0, CW, CH, 'castaway - Conversation', 'appIcon');
  // header picture with the name
  const SX = CX0 + 8, SY = CY0 + 32;
  V += scene(SX, SY);
  const name = bigPath('castaway', SX + 14, SY + 50, 0.27, 30);
  defs.push(`<path id="nameD" d="${name.d}"/>`);
  defs.push('<linearGradient id="gName" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b8cff"/><stop offset="1" stop-color="#0a43b8"/></linearGradient>');
  V += `<g class="k"><use href="#nameD" transform="translate(1.5 2.5)" stroke="#0a2a66" stroke-opacity=".28" stroke-width="13"/>`
    + `<use href="#nameD" stroke="#ffffff" stroke-width="13"/>`
    + `<use href="#nameD" stroke="url(#gName)" stroke-width="7.5"/>`
    + `<use href="#nameD" transform="translate(-.6 -1)" stroke="#ffffff" stroke-opacity=".45" stroke-width="2"/></g>`;
  const stX = SX + 14 + name.width + 14;
  V += `<g class="${cuts('opacity', [[0, 1], [BEAT.signIn, 0], [BEAT.signOut, 1]])}">${px(uib, '(Away)', stX, SY + 30, '#5d6b80')}<use href="#bud-aw" x="${stX + uib.width('(Away)') + 4}" y="${SY + 27}"/></g>`;
  // Online only while she is up the palm
  V += `<g class="${cuts('opacity', [[0, 0], [BEAT.signIn, 1], [BEAT.signOut, 0]])}" opacity="0">${px(uib, '(Online)', stX, SY + 30, '#23701a')}<use href="#bud-on" x="${stX + uib.width('(Online)') + 4}" y="${SY + 27}"/></g>`;
  V += px(ui, '♪ castaway theme, 80 BPM, F major (made from code)', SX + 14, SY + 70, '#2c4a7a', { maxW: 300 });
  V += px(ui, '10 hours on one island. almost nothing happens.', SX + 14, SY + 84, '#2c4a7a', { maxW: 300 });

  // the chat pane
  const PX0 = CX0 + 8, PY0 = SY + SCH + 6, PW = 420;
  const DPX = CX0 + CW - 8 - 108;
  const stY = CY0 + CH - 4 - 20;          // status bar top
  const inY = stY - 6 - 52;               // input box top
  const fsY = inY - 4 - 24;               // formatting strip top
  const PH = fsY - 4 - PY0;
  V += `<rect x="${PX0}" y="${PY0}" width="${PW}" height="${PH}" rx="2" fill="#fff" stroke="${C.border}"/>`;
  // messages
  const msgs = [
    ['sys', 0, 'info', 'castaway may not reply because her status is set to Away.'],
    ['you', 0, 'hello?? anyone on this island?'],
    ['her', BEAT.m1, 'hi! one bar of signal up here, top of the palm {smile}'],
    ['you', BEAT.m2, 'what even is this?'],
    ['her', BEAT.m3, 'a 10-hour lo-fi video. me, one palm, one raft and a lot of time. i nod to the music {note}. every few minutes something happens, always on the beat.'],
    ['her', BEAT.m4, 'a drone brought me headphones. more headphones. 90+ activities so far, and every sound is made from code.'],
    ['you', BEAT.m5, 'how do i watch?'],
    ['her', BEAT.m6, 'no video yet. run python tools/serve.py then open 127.0.0.1:8765'],
    ['her', BEAT.m7, 'brb, arms tired {palm}'],
    ['sys', BEAT.nudge, 'nudgeI', 'You have just sent a nudge.'],
    ['sys', BEAT.away, 'info', 'castaway may not reply because her status is set to Away.'],
  ];
  // Consecutive messages from one sender share one "says:" line.
  let my = PY0 + 6;
  const tx = PX0 + 8, textW = PW - 30;
  let lastWho = null;
  for (const m of msgs) {
    let g = '';
    let h;
    if (m[0] === 'sys') {
      g += `<use href="#${m[2]}" x="${tx}" y="${my}"/>` + px(ui, m[3], tx + 17, my + 2, '#666', { maxW: PW - 28 });
      h = 17;
      lastWho = null;
    } else {
      let top = my;
      if (m[0] !== lastWho) {
        const who = m[0] === 'her' ? 'castaway' : 'you (should be working)';
        g += px(ui, `${who} says:`, tx, my, '#7b7b7b');
        top += 12;
      } else top -= 2;
      const lines = wrap(m[2], textW);
      lines.forEach((ln, i) => { g += handLine(ln, tx + 10, top + 12 + i * LINE, m[0] === 'her' ? C.her : C.you); });
      h = top - my + lines.length * LINE + 5;
      lastWho = m[0];
    }
    const t = m[1];
    V += t > 0 ? `<g class="${showFrom(t)}">${g}</g>` : g;
    my += h;
  }
  if (my > PY0 + PH - 2) throw new Error(`messages overflow the pane by ${my - (PY0 + PH - 2)} px (pane ${PH})`);
  console.log(`pane ${PH} px, messages use ${my - PY0} px`);
  // display pictures: hers at the top, yours by the input box
  V += dpFrame(DPX + 2, PY0, 'dpHer');
  V += `<path d="M${DPX + 96} ${PY0 + 110}l4 4 4-4z" fill="#3d5f94"/>`;
  V += dpFrame(DPX + 2, inY + 52 - 104, 'dpYou');
  V += `<path d="M${DPX + 96} ${inY + 54}l4 4 4-4z" fill="#3d5f94"/>`;
  // between them: her custom emoticons (a period feature, and the gags in miniature)
  const EY = PY0 + 120;
  const EH = inY + 52 - 104 - 8 - EY;
  V += `<rect x="${DPX + 2}" y="${EY}" width="104" height="${EH}" rx="4" fill="#fff" fill-opacity=".7" stroke="#a9c0e0"/>`;
  V += px(uib, 'her emoticons', DPX + 54 - uib.width('her emoticons') / 2, EY + 6, C.navy);
  const emos = [['palm', '(palm)'], ['crab', '(crab)'], ['turtle', '(turtle)'], ['bottle', '(bottle)'], ['drone', '(drone)'], ['phones', '(cans)']];
  const cellH = Math.floor((EH - 20 - 42 - 10) / 2); // three rows: icon 30 + label at +34, 10 px clear at the bottom
  emos.forEach(([k, label], i) => {
    const cx = DPX + 2 + 26 + (i % 2) * 52, cy = EY + 20 + Math.floor(i / 2) * cellH;
    V += `<use href="#emo-${k}" transform="translate(${cx - 15} ${cy}) scale(2)"/>`;
    V += px(ui, label, Math.round(cx - ui.width(label) / 2), cy + 34, '#555');
  });
  // formatting strip
  V += `<rect x="${PX0}" y="${fsY}" width="${PW}" height="24" rx="2" fill="url(#gHead)" stroke="#b4c8e4"/>`;
  let fx = PX0 + 6;
  const sep = () => { const s = `<path d="M${fx + 1} ${fsY + 5}v14" stroke="#b4c8e4"/>`; fx += 6; return s; };
  // A for font
  V += `<path d="M${fx + 1} ${fsY + 17}l5-12h1.4l5 12M${fx + 3.2} ${fsY + 13}h7" fill="none" stroke="#163c8c" stroke-width="1.8"/><rect x="${fx}" y="${fsY + 19}" width="14" height="2" fill="#d23"/>`;
  V += px(ui, 'Font', fx + 18, fsY + 8, '#3a4b66');
  fx += 22 + ui.width('Font'); V += sep();
  V += `<use href="#emo-smile" x="${fx}" y="${fsY + 4.5}"/>` + px(ui, '▾', fx + 17, fsY + 8, '#444'); fx += 26; V += sep();
  V += `<use href="#emo-palm" x="${fx}" y="${fsY + 4.5}"/>` + px(ui, '▾', fx + 17, fsY + 8, '#444'); fx += 26; V += sep();
  V += `<rect class="${showDuring([[BEAT.nudge - 0.3, BEAT.nudge + 0.4]])}" opacity="0" x="${fx - 2}" y="${fsY + 2}" width="22" height="20" rx="2" fill="#ffe7a8" stroke="#e0a53a"/>`;
  V += `<use href="#nudgeI" transform="translate(${fx} ${fsY + 4}) scale(1.3)"/>`; fx += 20; V += sep();
  V += `<rect x="${fx + 1}" y="${fsY + 6}" width="15" height="12" rx="1" fill="#8fd0f5" stroke="#3d6fae"/><path d="M${fx + 1.5} ${fsY + 17.5}l5-5 3 3 2-2 4 4z" fill="#3f9e48"/><circle cx="${fx + 12}" cy="${fsY + 9.5}" r="1.6" fill="#fff36b"/>`;
  // input box with a caret, and Send
  V += `<rect x="${PX0}" y="${inY}" width="${PW - 56}" height="52" rx="2" fill="#fff" stroke="${C.border}"/>`;
  const typed = msgs.filter((m) => m[0] === 'you' && m[1] > 0);
  const idle = [];
  let from = 0;
  for (const m of typed) {
    const t1 = m[1] - 0.12, t0 = t1 - 0.06 * m[2].length - 0.2;
    idle.push([from, t0]); from = m[1];
    const words = m[2].split(' ');
    const tw = Math.ceil((words.reduce((a, w) => a + measureWord(w), 0) + MSPACE * (words.length - 1)) * MS) + 4;
    const name = `ty${(kn++).toString(36)}`;
    css.push(`@keyframes ${name}{0%{transform:translate(0,0)}${pct(t0)}{transform:translate(0,0);animation-timing-function:steps(${m[2].length},end)}${pct(t1)}{transform:translate(${tw}px,0)}100%{transform:translate(${tw}px,0)}}.${name}{animation:${name} ${STORY}s linear both}`);
    V += `<g class="${showDuring([[t0, m[1]]])}" opacity="0">${handLine(words, PX0 + 8, inY + 18, C.you)}`
      + `<g class="${name}"><rect x="${PX0 + 6}" y="${inY + 3}" width="${tw + 6}" height="20" fill="#fff"/><rect x="${PX0 + 6}" y="${inY + 6}" width="1" height="14" fill="#111"/></g></g>`;
  }
  idle.push([from, STORY + 1]);
  V += `<g class="${showDuring(idle)}"><rect class="caret" x="${PX0 + 7}" y="${inY + 6}" width="1" height="14" fill="#111"/></g>`;
  V += `<rect x="${PX0 + PW - 50}" y="${inY}" width="50" height="52" rx="3" fill="url(#gSend)" stroke="#003c74"/>`;
  V += `<rect x="${PX0 + PW - 48.5}" y="${inY + 1.5}" width="47" height="49" rx="2" fill="none" stroke="#fff" stroke-opacity=".8"/>`;
  V += px(ui, 'Send', PX0 + PW - 25 - ui.width('Send') / 2, inY + 22, C.ink);
  // status bar: typing, or the last message
  V += `<path d="M${CX0 + 4} ${stY - 2}H${CX0 + CW - 4}" stroke="#b4c8e4"/>`;
  const typingSpans = TYPING;
  V += `<g class="${showDuring(typingSpans)}" opacity="0"><use href="#pencil" x="${PX0 + 2}" y="${stY + 4}"/>${px(ui, 'castaway is typing a message...', PX0 + 18, stY + 6, '#444')}</g>`;
  const lastSpans = [];
  let prev = BEAT.m1;
  for (const [a, b] of TYPING.slice(1)) { lastSpans.push([prev, a]); prev = b; }
  lastSpans.push([prev, STORY + 1]);
  V += `<g class="${showDuring(lastSpans)}">${px(ui, 'Last message received at 10:00:00.', PX0 + 2, stY + 6, '#666')}</g>`;
  body.push(`<g class="${shake}">${V}</g>`);

  // ---------------------------------------------------------------- toast
  const TW = 204, TH = 92;
  const TX = W - 12 - TW, TY = H - 12 - TH;
  let toast = `<rect x="${TX + 2}" y="${TY + 3}" width="${TW}" height="${TH}" rx="5" fill="#0a2a66" opacity=".22"/>`;
  toast += `<rect x="${TX}" y="${TY}" width="${TW}" height="${TH}" rx="5" fill="url(#gHead)" stroke="#3f6fb8"/>`;
  toast += `<path d="${roundTop(TX + 0.5, TY + 0.5, TW - 1, 20, 4.5)}" fill="url(#gTitle)"/>`;
  toast += `<use href="#appIcon" transform="translate(${TX + 5} ${TY + 3}) scale(.85)"/>` + px(uib, 'Bottle Messenger', TX + 22, TY + 6, '#fff');
  toast += `<path d="M${TX + TW - 14} ${TY + 6}l7 7M${TX + TW - 7} ${TY + 6}l-7 7" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>`;
  toast += dpFrame(TX + 8, TY + 28, 'dpHer', 54);
  toast += px(uib, 'castaway', TX + 70, TY + 33, C.link);
  toast += px(ui, 'has just signed in.', TX + 70, TY + 47, C.ink);
  toast += px(ui, '(from the top of', TX + 70, TY + 62, '#777');
  toast += px(ui, 'the palm. one bar.)', TX + 70, TY + 74, '#777');
  defs.push(`<clipPath id="toastClip"><rect x="0" y="0" width="${W}" height="${H - 4}"/></clipPath>`);
  body.push(`<g clip-path="url(#toastClip)"><g class="toast" opacity="0">${toast}</g></g>`);
  body.push('</g>');
  body.push(`<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="14" fill="none" stroke="#c9a764"/>`);

  // ---------------------------------------------------------------- motion
  const tIn = BEAT.signIn, tOut = BEAT.toastOut;
  css.push(`@keyframes toast{0%{opacity:1;transform:translate(0,${TH + 20}px)}${pct(tIn)}{opacity:1;transform:translate(0,${TH + 20}px);animation-timing-function:cubic-bezier(.2,.7,.3,1)}${pct(tIn + 0.5)}{opacity:1;transform:translate(0,0)}${pct(tOut)}{opacity:1;transform:translate(0,0)}${pct(tOut + 0.6)}{opacity:0;transform:translate(0,0)}100%{opacity:0;transform:translate(0,0)}}.toast{animation:toast ${STORY}s linear both}`);
  const n0 = BEAT.nudge;
  const sh = [0, -5, 5, -5, 5, -4, 4, -3, 3, -1, 0];
  css.push(`@keyframes shake{0%{transform:translate(0,0)}${sh.map((v, i) => `${pct(n0 + i * 0.05)}{transform:translate(${v}px,${i % 3 === 1 ? 1 : 0}px)}`).join('')}100%{transform:translate(0,0)}}.shake{animation:shake ${STORY}s linear both}`);
  // her nod on every beat of 80 BPM; the head pivots at the neck (48.5, 70)
  css.push('@keyframes nod{0%{transform:translate(48.5px,70px) rotate(4deg) translate(-48.5px,-68.4px)}30%{transform:none}}.nod{animation:nod .75s steps(1,end) infinite}');
  css.push('@keyframes nodS{0%{transform:translate(0,.7px)}30%{transform:none}}.nodS{animation:nodS .75s steps(1,end) infinite}');
  css.push('@keyframes notes{0%{transform:translate(0,0)}50%{transform:translate(1px,-2px)}}.notes{animation:notes 1.5s steps(1,end) infinite}');
  css.push(`@keyframes drift{from{transform:translate(0,0)}to{transform:translate(-${SCW}px,0)}}.drift{animation:drift 90s linear infinite}`);
  css.push('@keyframes glA{0%{opacity:.8}50%{opacity:.15}}@keyframes glB{0%{opacity:.15}50%{opacity:.8}}.glA{animation:glA 1.5s steps(1,end) infinite}.glB{animation:glB 1.5s steps(1,end) infinite}');
  css.push('@keyframes bob{0%{transform:translate(0,0)}50%{transform:translate(0,1.5px)}}.bob{animation:bob 3s steps(1,end) infinite}');
  css.push('@keyframes sway{0%{transform:translate(441px,33px) rotate(-1.5deg) translate(-441px,-33px)}50%{transform:translate(441px,33px) rotate(1.5deg) translate(-441px,-33px)}}.sway{animation:sway 3s steps(1,end) infinite}');
  css.push('@keyframes caret{0%{opacity:1}50%{opacity:0}}.caret{animation:caret 1.1s steps(1,end) infinite}');
  css.push('@keyframes adPulse{0%{opacity:1}50%{opacity:.72}}.adPulse{animation:adPulse 2s steps(1,end) infinite}');
  css.push('.k{fill:none;stroke-linecap:round;stroke-linejoin:round}');
  css.push(`.m{stroke-width:${MW}px}`);
  css.push('@media (prefers-reduced-motion:reduce){*{animation:none!important}}');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Castaway: a chat window. castaway signs in from the top of her palm tree and explains the 10-hour lo-fi island video.">`
    + `<title>Castaway</title>`
    + '<desc>An invented mid-2000s instant messenger on a sandy desktop. castaway is Away, signs in from the top of her palm with one bar of signal, explains her 10-hour lo-fi island video and how to run it (python tools/serve.py, then 127.0.0.1:8765), and goes Away again just before your nudge.</desc>'
    + `<style>${css.join('')}</style>`
    + `<defs>${defs.join('')}${ui.defs()}${uib.defs()}${kDefs()}</defs>`
    + body.join('')
    + '</svg>';
  return svg;
}

const svg = build();
fs.mkdirSync(ASSETS, { recursive: true });
const out = path.join(ASSETS, `${SLUG}.svg`);
fs.writeFileSync(out, svg);
console.log(`${out}: ${(svg.length / 1024).toFixed(1)} KB`);
