#!/usr/bin/env node
// CASTAWAY as a Y2K / cybercore techno poster: README header generator.
//
//   node examples/castaway/src/63-y2k-cybercore_opus_5.5.mjs
//
// Writes examples/castaway/assets/63-y2k-cybercore_opus_5.5.svg. The .md beside
// the assets is hand-written, not generated. Plain Node, no dependencies, no
// clock, no Math.random: the same bytes on every run.
//
// The style (catalogue entry vap-15, "Y2K / cybercore"): the millennium's idea
// of the future, done from the graphic-design half of the look. A white and
// ice-blue ground with a lens flare; the name in wide, squared, cut-corner
// capitals inside a glossy candy-blue lozenge; thin orbit ellipses, a turning
// crosshair, registration marks, barcodes and tiny numerals; stacks of
// invented corporate marks and slogans; lime, orange and hot pink against
// white and chrome; and one chrome ring as the accent, with a highlight
// travelling round it. Every mark, maker and slogan here is invented (the
// banner's IDLECORE and its ISL-01; the page's credits add LAGOONICS and
// NODTRONIC); nothing is taken from a real studio, label, game or product,
// and all lettering is drawn by this script.
//
// The angle: the year-2000 future, sold as a product whose only feature is
// waiting. The island sits in a lime lens like a planet, the gags orbit it as
// little icons in circles (a turtle, a bottle, a drone, a shark in
// headphones...), and the four orbits of the brochure are the four timers of
// the real schedule. It is millennium-proof by design: it is always daytime,
// so midnight never comes.
//
// Timing. One loop is 60 s, the length of the project's theme (80 BPM, a bar
// every 3 s, a beat every 0.75 s):
//   satellites  eight gag icons, one lap of the orbit per 60 s
//   chrome ring the highlight travels round once every 12 s (four bars)
//   reticle     the crosshair round the lens turns once per 60 s
//   glint       sweeps the name every 12 s; the lozenge scan line too, 6 s later
//   readout     ten 6 s messages (two bars each, hard cuts), in sync with the
//               little events in the lens: bottle, drone, wave, shark, coconut,
//               signal
//   counter     BAR 01/20 to 20/20, one per bar; four beat lights
//   her         nods on every beat (stepped, like the project's own motion)
// Graphic layer: smooth and weightless. Island layer: hard cuts and steps.
// prefers-reduced-motion stops everything on the first frame, which is a
// complete poster (readout line 1, BAR 01, every satellite in place).
//
// How it is drawn: no <text>, no fonts, no filters, no external anything.
// Two fonts live in this file: a 5x7 bitmap face for the tiny captions (one
// <path> per glyph, text is <use>) and a squared, cut-corner, extended stroke
// face for the big lettering (polylines on an 8 x 6 grid, stroked with square
// caps and mitred joins). Animation is CSS only, so reduced motion can stop
// all of it.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '63-y2k-cybercore_opus_5.5';
const OUT = path.join(HERE, '..', 'assets', `${SLUG}.svg`);

const W = 1200;
const H = 640;
const LOOP = 60;
const BEAT = 0.75;
const BAR = 3;
const PI = Math.PI;

const n = (v, d = 2) => {
  const s = Number(v).toFixed(d).replace(/\.?0+$/, '');
  return s === '-0' ? '0' : s;
};

// ------------------------------------------------------------------ palette
const C = {
  ink: '#0b1a3f', ink2: '#2c4672', line: '#7fa3c6', lineLt: '#b4cde3',
  g0: '#ffffff', g1: '#e6f0f8', g2: '#cadced',
  ice: '#7fd6ff', iceLt: '#cdf0ff', blue: '#2160e4', blueD: '#0c2f8c', blueDD: '#061c58',
  lime: '#b8ec1e', limeD: '#78a800', orange: '#ff7d1f', pink: '#ff2f92',
  coral: '#ec7560', coralD: '#c95844', cream: '#f4ead6', creamD: '#d8c8a6',
  skin: '#ecb58f', skinD: '#cf936f', hair: '#5a3523',
  sand: '#f4dca6', sandD: '#ddb977', leaf: '#3aa84b', leafL: '#7fd25a', leafD: '#22793a',
  trunk: '#b8744d', trunkD: '#8a4f33',
};

// ------------------------------------------------------------------ PRNG
function mulberry32(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ------------------------------------------------------------------ output
const defs = [];
const css = [];
const body = [];

// =================================================================== 5x7 FONT
// Tiny captions. One path per glyph in <defs>; a line of text is <use>s.
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
  J: '..###|...#.|...#.|...#.|...#.|#..#.|.##..',
  K: '#...#|#..#.|#.#..|##...|#.#..|#..#.|#...#',
  L: '#....|#....|#....|#....|#....|#....|#####',
  M: '#...#|##.##|#.#.#|#.#.#|#...#|#...#|#...#',
  N: '#...#|#...#|##..#|#.#.#|#..##|#...#|#...#',
  O: '.###.|#...#|#...#|#...#|#...#|#...#|.###.',
  P: '####.|#...#|#...#|####.|#....|#....|#....',
  Q: '.###.|#...#|#...#|#...#|#.#.#|#..#.|.##.#',
  R: '####.|#...#|#...#|####.|#.#..|#..#.|#...#',
  S: '.####|#....|#....|.###.|....#|....#|####.',
  T: '#####|..#..|..#..|..#..|..#..|..#..|..#..',
  U: '#...#|#...#|#...#|#...#|#...#|#...#|.###.',
  V: '#...#|#...#|#...#|#...#|#...#|.#.#.|..#..',
  W: '#...#|#...#|#...#|#.#.#|#.#.#|#.#.#|.#.#.',
  X: '#...#|#...#|.#.#.|..#..|.#.#.|#...#|#...#',
  Y: '#...#|#...#|.#.#.|..#..|..#..|..#..|..#..',
  Z: '#####|....#|...#.|..#..|.#...|#....|#####',
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
  ',': '.....|.....|.....|.....|.##..|.##..|.#...',
  ':': '.....|.##..|.##..|.....|.##..|.##..|.....',
  '-': '.....|.....|.....|.###.|.....|.....|.....',
  '/': '....#|....#|...#.|..#..|.#...|#....|#....',
  '(': '...#.|..#..|.#...|.#...|.#...|..#..|...#.',
  ')': '.#...|..#..|...#.|...#.|...#.|..#..|.#...',
  '?': '.###.|#...#|....#|...#.|..#..|.....|..#..',
  '!': '..#..|..#..|..#..|..#..|..#..|.....|..#..',
  "'": '..#..|..#..|.#...|.....|.....|.....|.....',
  '+': '.....|..#..|..#..|#####|..#..|..#..|.....',
  '=': '.....|.....|#####|.....|#####|.....|.....',
  '>': '.#...|..#..|...#.|....#|...#.|..#..|.#...',
  '<': '...#.|..#..|.#...|#....|.#...|..#..|...#.',
  '~': '.....|.....|.##.#|#..#.|.....|.....|.....',
  '·': '.....|.....|.....|.##..|.##..|.....|.....',
  '$': '..#..|.####|#.#..|.###.|..#.#|####.|..#..',
  '#': '.#.#.|.#.#.|#####|.#.#.|#####|.#.#.|.#.#.',
  '%': '##...|##..#|...#.|..#..|.#...|#..##|...##',
  '_': '.....|.....|.....|.....|.....|.....|#####',
  '*': '.....|..#..|#.#.#|.###.|#.#.#|..#..|.....',
  '"': '.#.#.|.#.#.|.....|.....|.....|.....|.....',
  '|': '..#..|..#..|..#..|..#..|..#..|..#..|..#..',
};
function bitmapPath(rows) {
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
  return rects.map((r) => `M${r.x} ${r.y}h${r.w}v${r.h}h${-r.w}z`).join('');
}
const glyphIds = new Map();
const gid = (ch) => {
  if (!F5[ch]) throw new Error(`no 5x7 glyph for ${JSON.stringify(ch)}`);
  if (!glyphIds.has(ch)) glyphIds.set(ch, `q${glyphIds.size.toString(36)}`);
  return glyphIds.get(ch);
};
const pxW = (str, s) => ([...str].length * 6 - 1) * s;
function px(str, x, y, s, fill, extra = '') {
  let u = '';
  [...str.toUpperCase()].forEach((ch, i) => { if (ch !== ' ') u += `<use href="#${gid(ch)}" x="${i * 6}"/>`; });
  return `<g transform="translate(${n(x)} ${n(y)}) scale(${n(s, 3)})" fill="${fill}"${extra}>${u}</g>`;
}
const pxC = (str, cx, y, s, fill, extra) => px(str, cx - pxW(str, s) / 2, y, s, fill, extra);
const pxR = (str, rx, y, s, fill, extra) => px(str, rx - pxW(str, s), y, s, fill, extra);

// =================================================================== TECHNO FONT
// Squared, extended capitals with cut corners. Each glyph is a polyline set on
// a grid 6 high (stroke centres), drawn with square caps and mitred joins, so
// a glyph's outer box is [-sw/2, w+sw/2] x [-sw/2, 6+sw/2].
const TF = {
  A: [8, 'M0 6V1L1 0H7L8 1V6M0 3.4H8'],
  B: [8, 'M0 0H7L8 1V2L7 3L8 4V5L7 6H0ZM0 3H7'],
  C: [8, 'M8 0H1L0 1V5L1 6H8'],
  D: [8, 'M0 0H7L8 1V5L7 6H0Z'],
  E: [8, 'M8 0H0V6H8M0 3H6'],
  F: [8, 'M8 0H0V6M0 3H6'],
  G: [8, 'M8 0H1L0 1V5L1 6H7L8 5V3.2H4.6'],
  H: [8, 'M0 0V6M8 0V6M0 3H8'],
  I: [0, 'M0 0V6'],
  J: [8, 'M8 0V5L7 6H1L0 5V4'],
  K: [8, 'M0 0V6M0 3H5.5L8 0.5V0M5.5 3L8 5.5V6'],
  L: [8, 'M0 0V6H8'],
  M: [10, 'M0 6V1L1 0H9L10 1V6M5 0V4.4'],
  N: [8, 'M0 6V1L1 0H7L8 1V6'],
  O: [8, 'M1 0H7L8 1V5L7 6H1L0 5V1Z'],
  P: [8, 'M0 6V0H7L8 1V2.4L7 3.4H0'],
  Q: [8, 'M1 0H7L8 1V5L7 6H1L0 5V1ZM5.4 4.4L7.6 6.6'],
  R: [8, 'M0 6V0H7L8 1V2.4L7 3.4H0M5 3.4L8 6'],
  S: [8, 'M8 0H1L0 1V2L1 3H7L8 4V5L7 6H0'],
  T: [8, 'M0 0H8M4 0V6'],
  U: [8, 'M0 0V5L1 6H7L8 5V0'],
  V: [8, 'M0 0V2.6L4 6L8 2.6V0'],
  W: [10, 'M0 0V5L1 6H9L10 5V0M5 6V1.6'],
  X: [8, 'M0 0L8 6M8 0L0 6'],
  Y: [8, 'M0 0V2L1 3H7L8 2V0M4 3V6'],
  Z: [8, 'M0 0H8V1L0 5V6H8'],
  0: [8, 'M1 0H7L8 1V5L7 6H1L0 5V1ZM2.6 4L5.4 2'],
  1: [3, 'M0 1.2L1.6 0H3V6'],
  2: [8, 'M0 0H7L8 1V2L7 3H1L0 4V6H8'],
  3: [8, 'M0 0H7L8 1V5L7 6H0M2.4 3H8'],
  4: [8, 'M0 0V3.4H8M6.4 1.4V6'],
  5: [8, 'M8 0H0V3H7L8 4V5L7 6H0'],
  6: [8, 'M8 0H1L0 1V5L1 6H7L8 5V4L7 3H0'],
  7: [8, 'M0 0H8V1.6L5 6'],
  8: [8, 'M1 0H7L8 1V5L7 6H1L0 5V1ZM0 3H8'],
  9: [8, 'M0 6H7L8 5V1L7 0H1L0 1V2L1 3H8'],
  '-': [4, 'M0 3H4'],
  '/': [4, 'M0 6L4 0'],
  '+': [5, 'M0 3H5M2.5 0.5V5.5'],
  '>': [4, 'M0 0.5L4 3L0 5.5'],
  '(': [2, 'M2 0H1L0 1V5L1 6H2'],
  ')': [2, 'M0 0H1L2 1V5L1 6H0'],
  ' ': [3.2, ''],
};
// Dots depend on the stroke width, so they are made per call.
function tfGlyph(ch, sw) {
  const h = sw / 2;
  if (ch === '.') return [0, `M0 ${n(6 - h, 3)}V${n(6 + h, 3)}`];
  if (ch === ':') return [0, `M0 ${n(1.6 - h, 3)}V${n(1.6 + h, 3)}M0 ${n(6 - h, 3)}V${n(6 + h, 3)}`];
  if (ch === '·') return [0, `M0 ${n(3 - h, 3)}V${n(3 + h, 3)}`];
  if (ch === "'") return [0, 'M0 0V2'];
  if (ch === '!') return [0, `M0 0V3.8M0 ${n(6 - h, 3)}V${n(6 + h, 3)}`];
  if (!TF[ch]) throw new Error(`no techno glyph for ${JSON.stringify(ch)}`);
  return TF[ch];
}
// Re-emit a glyph's mini path (M L H V Z, absolute) scaled by k and moved.
function tfPath(src, ox, oy, k) {
  const tok = src.match(/[MLHVZ]|-?\d*\.?\d+/g) || [];
  let out = '';
  let cmd = '';
  let i = 0;
  while (i < tok.length) {
    if (/[MLHVZ]/.test(tok[i])) { cmd = tok[i++]; if (cmd === 'Z') { out += 'Z'; continue; } }
    if (cmd === 'M' || cmd === 'L') {
      const x = +tok[i++]; const y = +tok[i++];
      out += `${cmd}${n(ox + x * k)} ${n(oy + y * k)}`;
    } else if (cmd === 'H') out += `H${n(ox + +tok[i++] * k)}`;
    else if (cmd === 'V') out += `V${n(oy + +tok[i++] * k)}`;
  }
  return out;
}
const TF_GAP = 2.3; // grid units between glyph outer edges, plus the stroke
function tfWidth(str, sw, gap = TF_GAP) {
  const g = [...str].map((ch) => tfGlyph(ch, sw)[0]);
  return g.reduce((a, b) => a + b, 0) + (g.length - 1) * (gap + sw) + sw;
}
// Returns { d, w, h } for a string whose outer box starts at (x, y) and whose
// cap height (outer) is capH.
function techno(str, x, y, capH, sw = 1.3, gap = TF_GAP) {
  const k = capH / (6 + sw);
  let cx = x + (sw / 2) * k;
  const oy = y + (sw / 2) * k;
  let d = '';
  for (const ch of str) {
    const [w, src] = tfGlyph(ch, sw);
    if (src) d += tfPath(src, cx, oy, k);
    cx += (w + gap + sw) * k;
  }
  return { d, w: tfWidth(str, sw, gap) * k, h: capH, sw: sw * k, k };
}
function tfText(str, x, y, capH, colour, { sw = 1.3, gap = TF_GAP, anchor = 'start', extra = '' } = {}) {
  const w = tfWidth(str, sw, gap) * (capH / (6 + sw));
  const x0 = anchor === 'middle' ? x - w / 2 : anchor === 'end' ? x - w : x;
  const t = techno(str, x0, y, capH, sw, gap);
  return `<path d="${t.d}" fill="none" stroke="${colour}" stroke-width="${n(t.sw, 3)}" stroke-linecap="square" stroke-miterlimit="4"${extra}/>`;
}

// =================================================================== CSS helpers
// Visible for one window of `len` seconds starting at `at`, every LOOP.
// Implemented with positive delays: before its delay an element shows its own
// (attribute) opacity, which is also the reduced-motion frame.
const winNames = new Map();
function windowClass(len) {
  const key = `w${String(len).replace('.', '_')}`;
  if (!winNames.has(key)) {
    winNames.set(key, true);
    css.push(`@keyframes ${key}{0%{opacity:1}${n((len / LOOP) * 100, 4)}%{opacity:0}100%{opacity:0}}`);
  }
  return key;
}
// keyframes from [t, value] pairs over a period, as transform translate
function kfTranslate(name, period, pts, timing = 'linear') {
  const kf = pts.map(([t, x, y, extra = '']) => `${n((t / period) * 100, 3)}%{transform:translate(${n(x)}px,${n(y)}px)${extra}}`).join('');
  css.push(`@keyframes ${name}{${kf}}`);
  return (delay = 0) => ` style="animation:${name} ${n(period, 3)}s ${timing} ${n(delay, 3)}s infinite"`;
}

// =================================================================== GEOMETRY
const PILL = { x: 168, y: 182, w: 884, h: 136 };
PILL.r = PILL.h / 2;
PILL.cy = PILL.y + PILL.r;
const LENS = { cx: 254, cy: 250, r: 113, glass: 100 };
const RING = { cx: 612, cy: 250, rx: 512, ry: 116, tilt: -4, sw: 17 };
const ORB = { cx: 612, cy: 250, rx: 556, ry: 170, tilt: -4 };
const TITLE = { x0: 396, x1: 1012, top: 203, cap: 60 };
const HUB = { cx: 704, cy: 250 };

// =================================================================== DEFS
defs.push(
  `<radialGradient id="gGround" cx=".52" cy=".38" r=".75"><stop offset="0" stop-color="${C.g0}"/><stop offset=".55" stop-color="#f1f7fb"/><stop offset="1" stop-color="${C.g2}"/></radialGradient>`,
  `<pattern id="pGrid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="#c3d7e9" stroke-width="1"/></pattern>`,
  `<radialGradient id="gFlare" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff"/><stop offset=".18" stop-color="#fff" stop-opacity=".9"/><stop offset=".45" stop-color="#e9f7ff" stop-opacity=".45"/><stop offset="1" stop-color="#e9f7ff" stop-opacity="0"/></radialGradient>`,
  `<linearGradient id="gStreak" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`,
  `<linearGradient id="gStreakV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`,
  `<radialGradient id="gCore" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff"/><stop offset=".35" stop-color="#e6f6ff"/><stop offset=".7" stop-color="#9fd8ff" stop-opacity=".55"/><stop offset="1" stop-color="#9fd8ff" stop-opacity="0"/></radialGradient>`,
  `<radialGradient id="gHalo" cx=".5" cy=".5" r=".5"><stop offset=".35" stop-color="#bfe8ff" stop-opacity="0"/><stop offset=".62" stop-color="#a6dcff" stop-opacity=".45"/><stop offset=".72" stop-color="#ffd2ea" stop-opacity=".25"/><stop offset="1" stop-color="#a6dcff" stop-opacity="0"/></radialGradient>`,
  // candy-blue lozenge
  `<linearGradient id="gPill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4c93ff"/><stop offset=".48" stop-color="${C.blue}"/><stop offset=".52" stop-color="#1650c8"/><stop offset="1" stop-color="${C.blueD}"/></linearGradient>`,
  `<linearGradient id="gGloss" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".62"/><stop offset="1" stop-color="#fff" stop-opacity=".04"/></linearGradient>`,
  `<linearGradient id="gGlint" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.lime}" stop-opacity="0"/><stop offset=".45" stop-color="#f4ffd0" stop-opacity=".95"/><stop offset=".55" stop-color="#fff" stop-opacity="1"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`,
  `<linearGradient id="gScan" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.ice}" stop-opacity="0"/><stop offset="1" stop-color="${C.ice}" stop-opacity=".55"/></linearGradient>`,
  // lime candy bezel
  `<radialGradient id="gBezel" cx=".38" cy=".3" r=".8"><stop offset="0" stop-color="#f1ffb5"/><stop offset=".45" stop-color="${C.lime}"/><stop offset=".85" stop-color="#8fc400"/><stop offset="1" stop-color="#5f8a00"/></radialGradient>`,
  `<linearGradient id="gSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2f86e4"/><stop offset=".7" stop-color="#78c6f5"/><stop offset="1" stop-color="#bfe7fb"/></linearGradient>`,
  `<linearGradient id="gSea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2cc0e0"/><stop offset=".45" stop-color="#159dd2"/><stop offset="1" stop-color="#0b64ac"/></linearGradient>`,
  `<radialGradient id="gSun" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff"/><stop offset=".3" stop-color="#fffbe0" stop-opacity=".9"/><stop offset="1" stop-color="#fff6c8" stop-opacity="0"/></radialGradient>`,
  `<linearGradient id="gSand" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff0c8"/><stop offset=".6" stop-color="${C.sand}"/><stop offset="1" stop-color="${C.sandD}"/></linearGradient>`,
  `<linearGradient id="gTrunk" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#d08a5c"/><stop offset=".6" stop-color="${C.trunk}"/><stop offset="1" stop-color="${C.trunkD}"/></linearGradient>`,
  `<linearGradient id="gGlass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`,
  `<radialGradient id="gDisc" cx=".38" cy=".3" r=".8"><stop offset="0" stop-color="#fff"/><stop offset=".7" stop-color="#eef6fc"/><stop offset="1" stop-color="#c9dbea"/></radialGradient>`,
  `<linearGradient id="gPanel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".88"/><stop offset="1" stop-color="#eef5fb" stop-opacity=".78"/></linearGradient>`,
  `<linearGradient id="gRun" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2d6cf0"/><stop offset=".5" stop-color="${C.blueD}"/><stop offset="1" stop-color="${C.blueDD}"/></linearGradient>`,
  `<clipPath id="cPanel"><rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="26"/></clipPath>`,
  `<clipPath id="cPill"><rect x="${PILL.x}" y="${PILL.y}" width="${PILL.w}" height="${PILL.h}" rx="${PILL.r}"/></clipPath>`,
  `<clipPath id="cGlass"><circle cx="${LENS.cx}" cy="${LENS.cy}" r="${LENS.glass}"/></clipPath>`,
  // local half-planes for the tilted ring and orbit (back = far side)
  `<clipPath id="cBack"><rect x="-700" y="-400" width="1400" height="400"/></clipPath>`,
  `<clipPath id="cFront"><rect x="-700" y="0" width="1400" height="400"/></clipPath>`,
);

// Chrome: a world-up reflection on a vertical gradient through the ring's
// local box, so the far side shows sky, a dark horizon band and a grey floor
// across its thickness, the near side the same again, and the sides blend.
{
  const top = -RING.ry - RING.sw / 2 - 1;
  const bot = RING.ry + RING.sw / 2 + 1;
  const span = bot - top;
  const at = (y) => n((y - top) / span, 4);
  const far = -RING.ry;
  const near = RING.ry;
  const hw = RING.sw / 2;
  const stops = [
    [top, '#ffffff'], [far - hw * 0.45, '#eef4fa'], [far - hw * 0.05, '#9aa8bb'],
    [far + hw * 0.1, '#16203a'], [far + hw * 0.45, '#5a6a84'], [far + hw, '#e9f0f7'],
    [far + 40, '#c9d4e1'], [0, '#8796ac'], [near - 40, '#dfe7f0'],
    [near - hw, '#ffffff'], [near - hw * 0.4, '#d6e0ea'], [near - hw * 0.05, '#7c8ca3'],
    [near + hw * 0.12, '#141d36'], [near + hw * 0.5, '#4f5f7a'], [near + hw, '#c3cfdc'], [bot, '#e4ebf2'],
  ];
  defs.push(`<linearGradient id="gChrome" x1="0" y1="${n(top)}" x2="0" y2="${n(bot)}" gradientUnits="userSpaceOnUse">${stops.map(([y, c]) => `<stop offset="${at(y)}" stop-color="${c}"/>`).join('')}</linearGradient>`);
}

// =================================================================== CSS
css.push(
  `@keyframes spin{to{transform:rotate(360deg)}}`,
  `@keyframes dash{to{stroke-dashoffset:-1000}}`,
  `@keyframes dashB{from{stroke-dashoffset:-6.5}to{stroke-dashoffset:-1006.5}}`,
  `@keyframes glint{0%{transform:translate(-260px,0)}14%{transform:translate(860px,0)}100%{transform:translate(860px,0)}}`,
  `@keyframes scan{0%{transform:translate(0,0);opacity:0}2%{opacity:1}22%{transform:translate(${PILL.w - 40}px,0);opacity:1}24%{transform:translate(${PILL.w - 40}px,0);opacity:0}100%{transform:translate(${PILL.w - 40}px,0);opacity:0}}`,
  `@keyframes flare{0%,100%{opacity:.75}50%{opacity:1}}`,
  `@keyframes streak{0%,100%{transform:scale(1,1)}50%{transform:scale(1.18,1)}}`,
  `@keyframes nod{0%{transform:translate(0,0)}50%{transform:translate(0,1.3px)}100%{transform:translate(0,1.3px)}}`,
  `@keyframes beatL{0%{opacity:1}25%{opacity:.18}100%{opacity:.18}}`,
  `@keyframes sway{0%,100%{transform:rotate(-1.6deg)}50%{transform:rotate(1.6deg)}}`,
  `@keyframes waveA{0%{opacity:1}50%{opacity:0}}`,
  `@keyframes waveB{0%{opacity:0}50%{opacity:1}}`,
  `@keyframes blink{0%{opacity:1}50%{opacity:.15}}`,
  `.sp{transform-box:fill-box;transform-origin:center}`,
);

// =================================================================== BACKGROUND
body.push(`<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="27" fill="url(#gGround)"/>`);
body.push(`<g clip-path="url(#cPanel)">`);
body.push(`<rect width="${W}" height="${H}" fill="url(#pGrid)" opacity=".5"/>`);

// Lens flare, top right: a halo, a white core and tapered rays.
const FL = { x: 1112, y: 98 };
{
  const { x: fx, y: fy } = FL;
  const ray = (len, wid, ang, fill, op) => `<path d="M${-len} 0L0 ${-wid}L${len} 0L0 ${wid}Z" fill="${fill}" opacity="${op}" transform="rotate(${ang})"/>`;
  body.push(`<g transform="translate(${fx} ${fy})"><g style="animation:flare 6s ease-in-out infinite">` +
    `<circle r="150" fill="url(#gHalo)"/><circle r="90" fill="url(#gFlare)"/>` +
    `<g style="animation:streak 6s ease-in-out infinite">${ray(360, 4.4, 0, '#7fcaff', 0.8)}${ray(320, 1.4, 0, '#fff', 1)}</g>` +
    `${ray(120, 2.6, 90, '#8fd3ff', 0.7)}${ray(110, 0.9, 90, '#fff', 1)}${ray(60, 2, 45, '#8fd3ff', 0.6)}${ray(60, 2, -45, '#8fd3ff', 0.6)}` +
    `<circle r="34" fill="url(#gCore)"/><circle r="6" fill="#fff"/>` +
    `</g></g>`);
}

// Hairlines with ticks through the lens centre and the hub.
{
  const y = LENS.cy;
  let ticks = '';
  for (let x = 12; x < W - 12; x += 12) {
    const big = (x - 12) % 96 === 0;
    ticks += `M${x} ${y - (big ? 6 : 3)}V${y + (big ? 6 : 3)}`;
  }
  body.push(`<path d="M8 ${y}H${W - 8}M${LENS.cx} 70V${H - 200}M${HUB.cx} 64V${H - 196}" stroke="${C.line}" stroke-width="1" fill="none"/>`);
  body.push(`<path d="${ticks}" stroke="${C.line}" stroke-width="1" fill="none" opacity=".8"/>`);
  for (let i = 0; i < 6; i++) {
    const x = 12 + 96 * (i * 2 + 1);
    if (x > 1150 || (x > PILL.x - 10 && x < PILL.x + PILL.w + 10)) continue;
    body.push(pxC(String(i * 2 + 1).padStart(3, '0'), x, y + 10, 1.1, C.line));
  }
}

// Concentric circles and dashed orbit lines behind the name.
{
  const { cx, cy } = HUB;
  body.push(`<g fill="none" stroke="${C.line}">`);
  body.push(`<circle cx="${cx}" cy="${cy}" r="186" stroke-width="1.2" opacity=".75"/>`);
  body.push(`<g transform="translate(${cx} ${cy})"><circle r="160" stroke-width="2" stroke-dasharray="2 10" pathLength="1000" style="animation:dash 60s linear infinite" opacity=".9"/></g>`);
  body.push(`<circle cx="${cx}" cy="${cy}" r="214" stroke-width="1" stroke-dasharray="40 8 4 8" opacity=".55"/>`);
  body.push(`</g>`);
  // tiny numerals round the hub
  for (let a = 0; a < 360; a += 45) {
    const r = 198;
    const x = cx + r * Math.cos((a - 90) * PI / 180);
    const y = cy + r * Math.sin((a - 90) * PI / 180);
    if (Math.abs(y - cy) < 80 || a === 0) continue;
    body.push(pxC(String(a).padStart(3, '0'), x, y - 4, 1.1, C.ink2, ' opacity=".7"'));
  }
  // tilted dashed orbits (no riders): the dashes do the orbiting
  const orbits = [[430, 74, 9, 30, '6 7'], [560, 132, -13, 45, '1.5 6'], [300, 52, -22, 20, '10 6 2 6']];
  for (const [rx, ry, rot, dur, da] of orbits) {
    body.push(`<g transform="translate(${ORB.cx} ${ORB.cy}) rotate(${rot})"><ellipse rx="${rx}" ry="${ry}" fill="none" stroke="${C.ink2}" stroke-width="1.3" stroke-dasharray="${da}" pathLength="1000" opacity=".5" style="animation:dash ${dur}s linear infinite"/></g>`);
  }
}

// =================================================================== ORBIT + SATELLITES
// The satellite orbit, drawn as a clean line with a tick at each timer label.
const ORB_PATH = `M${ORB.rx} 0A${ORB.rx} ${ORB.ry} 0 1 1 ${-ORB.rx} 0A${ORB.rx} ${ORB.ry} 0 1 1 ${ORB.rx} 0Z`;
body.push(`<g transform="translate(${ORB.cx} ${ORB.cy}) rotate(${ORB.tilt})"><path d="${ORB_PATH}" fill="none" stroke="${C.ink}" stroke-width="1.6" opacity=".55"/></g>`);

// Gag icons, each a 40 x 40 drawing centred on 0,0 inside a disc of r 18.
const ICON = {};
ICON.bottle = `<g transform="rotate(-28)"><rect x="-4.5" y="-6" width="9" height="15" rx="3.5" fill="#56c08a" stroke="${C.ink}" stroke-width="1.2"/><rect x="-2.2" y="-11" width="4.4" height="6" fill="#56c08a" stroke="${C.ink}" stroke-width="1.2"/><rect x="-2" y="-13.5" width="4" height="3.2" rx="1" fill="#c48a52" stroke="${C.ink}" stroke-width="1"/><rect x="-2.6" y="-3" width="5.2" height="8" rx="1" fill="${C.cream}" opacity=".95"/><path d="M-2.4 -4.4V7" stroke="#fff" stroke-width="1.2" opacity=".7"/></g>`;
ICON.drone = `<g><path d="M-11 -6H11" stroke="${C.ink}" stroke-width="1.6"/><ellipse cx="-11" cy="-8" rx="5" ry="1.4" fill="${C.ink2}"/><ellipse cx="11" cy="-8" rx="5" ry="1.4" fill="${C.ink2}"/><rect x="-6" y="-7" width="12" height="5" rx="2" fill="#dfe6ee" stroke="${C.ink}" stroke-width="1.2"/><path d="M-3 -2V2M3 -2V2" stroke="${C.ink}" stroke-width="1.1"/><rect x="-6" y="2" width="12" height="9" fill="#c99358" stroke="${C.ink}" stroke-width="1.2"/><path d="M0 2V11M-6 6H6" stroke="#8e5f2e" stroke-width="1"/></g>`;
ICON.shark = `<g><path d="M-13 9C-6 6 6 6 13 9" stroke="#2a9fd6" stroke-width="2.4" fill="none"/><path d="M-8 8C-5 0 0 -9 6 -11C4 -4 4 3 7 8Z" fill="#6f8496" stroke="${C.ink}" stroke-width="1.2"/><path d="M-4 -1C-2 -9 6 -10 8 -4" fill="none" stroke="${C.cream}" stroke-width="2"/><rect x="-6.5" y="-3" width="4" height="6" rx="1.6" fill="${C.cream}" stroke="${C.ink}" stroke-width="1"/><rect x="6" y="-6" width="4" height="6" rx="1.6" fill="${C.cream}" stroke="${C.ink}" stroke-width="1"/></g>`;
ICON.turtle = `<g><ellipse cx="0" cy="1" rx="10" ry="7.5" fill="#5bb04f" stroke="${C.ink}" stroke-width="1.2"/><path d="M-5 -3L0 -5L5 -3L5 4L0 6L-5 4Z" fill="#8bd06a" stroke="#2f7a32" stroke-width="1"/><circle cx="12.5" cy="-1" r="3.6" fill="#a9d98a" stroke="${C.ink}" stroke-width="1.1"/><circle cx="13.6" cy="-2" r=".9" fill="${C.ink}"/><path d="M-6 7L-10 11M6 7L9 11M-7 -5L-11 -8M6 -6L9 -9" stroke="${C.ink}" stroke-width="2" stroke-linecap="round"/></g>`;
ICON.cat = `<g><path d="M-10 -5L-9 -14L-3 -8H3L9 -14L10 -5C11 4 6 9 0 9C-6 9 -11 4 -10 -5Z" fill="#9aa1a8" stroke="${C.ink}" stroke-width="1.2"/><path d="M-4 3C-2 7 2 7 4 3C3 9 -3 9 -4 3Z" fill="#fff"/><path d="M-2 -8V-4M2 -8V-4M-9 -1H-6M6 -1H9" stroke="#5f666d" stroke-width="1.2"/><path d="M-5 -1.5h2.4M2.6 -1.5h2.4" stroke="${C.ink}" stroke-width="1.4"/><path d="M-1 2.4h2" stroke="#e98a96" stroke-width="1.4"/></g>`;
ICON.crab = `<g><circle cx="0" cy="-2" r="9" fill="#7b4a2a" stroke="${C.ink}" stroke-width="1.2"/><path d="M-5 -7C-2 -9 2 -9 4 -7" stroke="#a8724a" stroke-width="1.6" fill="none"/><circle cx="-2" cy="-3" r="1" fill="#2a170c"/><circle cx="2" cy="-4" r="1" fill="#2a170c"/><circle cx="0.4" cy="-0.6" r="1" fill="#2a170c"/><path d="M-7 5L-11 10M-3 6L-5 11M3 6L5 11M7 5L11 10" stroke="${C.orange}" stroke-width="2" stroke-linecap="round"/></g>`;
ICON.coffee = `<g><path d="M-7 -6H7L5 11H-5Z" fill="#e7f4fb" stroke="${C.ink}" stroke-width="1.2"/><path d="M-6 0H6L5 10H-5Z" fill="#a8693c"/><rect x="-4" y="-3" width="3.5" height="3.5" fill="#fff" opacity=".9" transform="rotate(14 -2 -1)"/><rect x="1" y="-4" width="3.5" height="3.5" fill="#fff" opacity=".9" transform="rotate(-10 3 -2)"/><path d="M-8.5 -7H8.5" stroke="${C.ink}" stroke-width="2"/><path d="M2 -7L6 -14H9" stroke="${C.pink}" stroke-width="2" fill="none"/></g>`;
ICON.signal = `<g><rect x="-11" y="5" width="4.5" height="5" fill="${C.limeD}" stroke="${C.ink}" stroke-width="1"/><rect x="-4.5" y="0" width="4.5" height="10" fill="none" stroke="${C.ink2}" stroke-width="1" stroke-dasharray="2 1.5"/><rect x="2" y="-5" width="4.5" height="15" fill="none" stroke="${C.ink2}" stroke-width="1" stroke-dasharray="2 1.5"/><rect x="8.5" y="-10" width="4.5" height="20" fill="none" stroke="${C.ink2}" stroke-width="1" stroke-dasharray="2 1.5"/></g>`;
const SATS = [
  ['turtle', 'G01'], ['bottle', 'G02'], ['drone', 'G03'], ['cat', 'G04'],
  ['shark', 'G05'], ['crab', 'G06'], ['signal', 'G07'], ['coffee', 'G08'],
];
for (const [name, tag] of SATS) {
  defs.push(`<g id="i_${name}"><circle r="19" fill="url(#gDisc)" stroke="${C.ink}" stroke-width="2"/><circle r="15.5" fill="none" stroke="${C.lineLt}" stroke-width="1"/>${ICON[name]}` +
    `<rect x="11" y="-25" width="${pxW(tag, 1) + 6}" height="11" rx="5.5" fill="${C.ink}"/>${px(tag, 14, -23, 1, '#fff')}</g>`);
}
// Keyframes: parametric ellipse (a circle seen from above at an angle), with
// a depth scale; 120 samples, linear between.
{
  const N = 120;
  let kf = '';
  for (let i = 0; i <= N; i++) {
    const th = (2 * PI * i) / N;
    const x = ORB.rx * Math.cos(th), y = ORB.ry * Math.sin(th);
    const s = 0.8 + 0.2 * Math.sin(th);
    kf += `${n((i / N) * 100, 3)}%{transform:translate(${n(x, 1)}px,${n(y, 1)}px) scale(${n(s, 3)})}`;
  }
  css.push(`@keyframes orbit{${kf}}`);
}
function satLayer(side) {
  let s = `<g transform="translate(${ORB.cx} ${ORB.cy}) rotate(${ORB.tilt})"><g clip-path="url(#c${side})"${side === 'Back' ? ' opacity=".8"' : ''}>`;
  SATS.forEach(([name], i) => {
    const d = (i * LOOP) / SATS.length; // seconds ahead
    const th = (2 * PI * d) / LOOP + 0.18;
    const x = ORB.rx * Math.cos(th), y = ORB.ry * Math.sin(th);
    const sc = 0.8 + 0.2 * Math.sin(th);
    s += `<g transform="translate(${n(x, 1)} ${n(y, 1)}) scale(${n(sc, 3)})" style="animation:orbit ${LOOP}s linear ${n(-d - (0.18 / (2 * PI)) * LOOP, 3)}s infinite"><use href="#i_${name}" transform="rotate(${-ORB.tilt})"/></g>`;
  });
  return s + '</g></g>';
}
body.push(satLayer('Back'));

// =================================================================== CHROME RING (full, behind)
const RING_PATH = `M${RING.rx} 0A${RING.rx} ${RING.ry} 0 1 1 ${-RING.rx} 0A${RING.rx} ${RING.ry} 0 1 1 ${RING.rx} 0Z`;
function ringLayer(clip) {
  const c = clip ? ` clip-path="url(#c${clip})"` : '';
  return `<g transform="translate(${RING.cx} ${RING.cy}) rotate(${RING.tilt})"><g${c}>` +
    `<path d="${RING_PATH}" fill="none" stroke="${C.ink}" stroke-width="${RING.sw + 3.4}"/>` +
    `<path d="${RING_PATH}" fill="none" stroke="url(#gChrome)" stroke-width="${RING.sw}"/>` +
    `<path d="M${RING.rx - 4} 0A${RING.rx - 4} ${RING.ry - 4} 0 1 1 ${-(RING.rx - 4)} 0A${RING.rx - 4} ${RING.ry - 4} 0 1 1 ${RING.rx - 4} 0Z" fill="none" stroke="#fff" stroke-width="1.4" opacity=".55"/>` +
    `<path d="${RING_PATH}" fill="none" stroke="#fff" stroke-width="${RING.sw - 6}" stroke-linecap="round" pathLength="1000" stroke-dasharray="22 978" opacity=".55" style="animation:dash 12s linear infinite"/>` +
    `<path d="${RING_PATH}" fill="none" stroke="#fff" stroke-width="${RING.sw - 11}" stroke-linecap="round" pathLength="1000" stroke-dasharray="9 991" stroke-dashoffset="-6.5" style="animation:dashB 12s linear infinite"/>` +
    `</g></g>`;
}
body.push(ringLayer(null));

// =================================================================== LOZENGE
{
  const { x, y, w, h, r } = PILL;
  body.push(`<rect x="${x - 7}" y="${y - 7}" width="${w + 14}" height="${h + 14}" rx="${r + 7}" fill="none" stroke="${C.ink}" stroke-width="1.2" opacity=".55"/>`);
  body.push(`<rect x="${x + 5}" y="${y + 9}" width="${w}" height="${h}" rx="${r}" fill="${C.ink}" opacity=".16"/>`);
  body.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="url(#gPill)" opacity=".94"/>`);
  // inner structure, seen through the candy plastic
  let s = `<g clip-path="url(#cPill)" fill="none">`;
  let lines = '';
  for (let yy = y + 6; yy < y + h; yy += 6) lines += `M${x} ${yy}H${x + w}`;
  s += `<path d="${lines}" stroke="#7fb2ff" stroke-width=".8" opacity=".22"/>`;
  s += `<circle cx="${HUB.cx}" cy="${HUB.cy}" r="118" stroke="#9cc6ff" stroke-width="1.2" opacity=".35"/><circle cx="${HUB.cx}" cy="${HUB.cy}" r="92" stroke="#9cc6ff" stroke-width="1" stroke-dasharray="3 5" opacity=".45"/>`;
  // traces
  const tr = [
    `M${x + 260} ${y + 12}H${x + 380}L${x + 392} ${y + 24}H${x + 520}`,
    `M${x + 610} ${y + 124}H${x + 700}L${x + 712} ${y + 112}H${x + 800}`,
    `M${x + 214} ${y + 124}H${x + 300}L${x + 310} ${y + 114}`,
    `M${x + 640} ${y + 14}H${x + 760}L${x + 770} ${y + 24}H${x + 820}`,
  ];
  s += `<path d="${tr.join('')}" stroke="${C.ice}" stroke-width="1.4" opacity=".55"/>`;
  for (const [cx, cy] of [[x + 520, y + 24], [x + 310, y + 114], [x + 800, y + 112], [x + 820, y + 24]]) s += `<circle cx="${cx}" cy="${cy}" r="2.6" fill="${C.ice}" opacity=".7"/>`;
  // scan line
  s += `<g style="animation:scan 12s linear 6s infinite" opacity="0"><rect x="${x + 20}" y="${y}" width="40" height="${h}" fill="url(#gScan)"/><rect x="${x + 59}" y="${y}" width="2" height="${h}" fill="${C.lime}"/></g>`;
  s += `</g>`;
  body.push(s);
  // gloss
  body.push(`<rect x="${x + 16}" y="${y + 5}" width="${w - 32}" height="${h * 0.44}" rx="${h * 0.22}" fill="url(#gGloss)"/>`);
  body.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="none" stroke="${C.ink}" stroke-width="3.2"/>`);
  body.push(`<path d="M${x + r} ${y + h - 6}H${x + w - r}" stroke="${C.ice}" stroke-width="1.6" opacity=".7"/>`);
}

// =================================================================== TITLE
{
  const str = 'CASTAWAY';
  const sw = 1.75, gap = 2.15;
  const unitW = tfWidth(str, sw, gap);
  const k0 = (TITLE.x1 - TITLE.x0) / unitW;
  const cap = k0 * (6 + sw);
  TITLE.cap = cap;
  const t = techno(str, TITLE.x0, TITLE.top, cap, sw, gap);
  const swp = n(t.sw, 3);
  // stencil slit through the letters (a mask), a classic techno detail
  const slitY = TITLE.top + cap * 0.6;
  defs.push(`<mask id="mSlit" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#fff"/><rect x="${TITLE.x0 - 10}" y="${n(slitY - 1.6)}" width="${TITLE.x1 - TITLE.x0 + 20}" height="3.2" fill="#000"/></mask>`);
  defs.push(`<mask id="mTitle" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><path d="${t.d}" fill="none" stroke="#fff" stroke-width="${swp}" stroke-linecap="square"/><rect x="${TITLE.x0 - 10}" y="${n(slitY - 1.6)}" width="${TITLE.x1 - TITLE.x0 + 20}" height="3.2" fill="#000"/></mask>`);
  defs.push(`<linearGradient id="gLetter2" x1="0" y1="${n(TITLE.top)}" x2="0" y2="${n(TITLE.top + cap)}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="#f4fbff"/><stop offset=".6" stop-color="#b9e6ff"/><stop offset="1" stop-color="#e6f7ff"/></linearGradient>`);
  body.push(`<g mask="url(#mSlit)">`);
  body.push(`<path d="${t.d}" transform="translate(4 5)" fill="none" stroke="${C.blueDD}" stroke-width="${swp}" stroke-linecap="square" opacity=".75"/>`);
  body.push(`<path d="${t.d}" fill="none" stroke="url(#gLetter2)" stroke-width="${swp}" stroke-linecap="square"/>`);
  body.push(`</g>`);
  // glint: a lime-white band through the letters every 12 s
  body.push(`<g mask="url(#mTitle)"><g transform="translate(-260 0)" style="animation:glint 12s ease-in-out infinite"><rect x="${TITLE.x0 - 80}" y="${TITLE.top - 10}" width="70" height="${n(cap + 20)}" fill="url(#gGlint)" transform="skewX(-24)"/></g></g>`);
  // caption line inside the lozenge
  const capY = TITLE.top + cap + 15;
  const line = 'LO-FI ISLAND VIDEO · 10:00:00 · SEED 1992 · ALWAYS DAYTIME';
  body.push(pxC(line, (TITLE.x0 + TITLE.x1) / 2, capY, 1.5, C.iceLt));
  // tiny mark above the letters
  body.push(px('FIG. 1: ONE TINY ISLAND', TITLE.x0 + 2, TITLE.top - 14, 1.2, C.blueD, ' opacity=".8"'));
  body.push(pxR('UNOFFICIAL · INSPIRED BY A 1992 SCREENSAVER', TITLE.x1 - 2, TITLE.top - 14, 1.2, C.blueD, ' opacity=".8"'));
}

// =================================================================== LENS (the island)
const LX = LENS.cx, LY = LENS.cy;
const HORIZON = LY - 2;
{
  // reticle round the lens, turning once a loop
  let ticks = '';
  for (let a = 0; a < 360; a += 5) {
    const big = a % 30 === 0;
    const r1 = 121, r2 = big ? 131 : 126;
    const c = Math.cos(a * PI / 180), s = Math.sin(a * PI / 180);
    ticks += `M${n(r1 * c)} ${n(r1 * s)}L${n(r2 * c)} ${n(r2 * s)}`;
  }
  let nums = '';
  for (const a of [0, 90, 180, 270]) {
    const r = 142;
    const c = Math.cos((a - 90) * PI / 180), s = Math.sin((a - 90) * PI / 180);
    nums += `<g transform="rotate(${a} ${n(r * c)} ${n(r * s)})">${pxC(String(a).padStart(3, '0'), r * c, r * s - 3.5, 1.05, C.ink2)}</g>`;
  }
  body.push(`<g transform="translate(${LX} ${LY})"><g style="animation:spin ${LOOP}s linear infinite"><circle r="121" fill="none" stroke="${C.ink2}" stroke-width="1.2"/><path d="${ticks}" stroke="${C.ink2}" stroke-width="1.2"/>${nums}` +
    `<path d="M0 -150V-136M0 136V150M-150 0H-136M136 0H150" stroke="${C.pink}" stroke-width="2.4"/></g></g>`);

  // bezel
  body.push(`<circle cx="${LX + 4}" cy="${LY + 7}" r="${LENS.r}" fill="${C.ink}" opacity=".16"/>`);
  body.push(`<circle cx="${LX}" cy="${LY}" r="${LENS.r}" fill="url(#gBezel)" stroke="${C.ink}" stroke-width="3"/>`);
  let bt = '';
  for (let a = 0; a < 360; a += 15) {
    const c = Math.cos(a * PI / 180), s = Math.sin(a * PI / 180);
    bt += `M${n(LX + 103 * c)} ${n(LY + 103 * s)}L${n(LX + 107.5 * c)} ${n(LY + 107.5 * s)}`;
  }
  body.push(`<path d="${bt}" stroke="${C.limeD}" stroke-width="1.6"/>`);
  body.push(`<path d="M${LX - 96} ${LY - 40}A104 104 0 0 1 ${LX - 30} ${LY - 100}" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" opacity=".8"/>`);

  // ---------------------------------------------------------------- inside the glass
  let g = `<g clip-path="url(#cGlass)">`;
  g += `<rect x="${LX - 101}" y="${LY - 101}" width="202" height="${HORIZON - (LY - 101)}" fill="url(#gSky)"/>`;
  g += `<circle cx="${LX + 52}" cy="${LY - 62}" r="34" fill="url(#gSun)"/>`;
  // clouds drift across, wrapping outside the glass
  const cloud = (cx, cy, s) => `<g transform="translate(${cx} ${cy}) scale(${s})"><path d="M-30 6H30C34 6 36 0 31 -3C30 -10 21 -12 16 -8C13 -16 1 -18 -4 -10C-10 -14 -20 -10 -19 -3C-26 -4 -34 4 -30 6Z" fill="#fff"/><path d="M-28 6H30" stroke="#d6ecfa" stroke-width="2"/></g>`;
  css.push(`@keyframes cloudA{0%{transform:translate(-80px,0)}100%{transform:translate(170px,0)}}`);
  css.push(`@keyframes cloudB{0%{transform:translate(-150px,0)}100%{transform:translate(100px,0)}}`);
  g += `<g transform="translate(-80 0)" style="animation:cloudA 60s linear infinite">${cloud(LX - 40, LY - 70, 0.9)}</g>`;
  g += `<g transform="translate(-150 0)" style="animation:cloudB 60s linear -30s infinite">${cloud(LX + 40, LY - 36, 0.6)}</g>`;
  // sea
  g += `<rect x="${LX - 101}" y="${HORIZON}" width="202" height="${LY + 101 - HORIZON}" fill="url(#gSea)"/>`;
  g += `<path d="M${LX - 101} ${HORIZON}H${LX + 101}" stroke="#e8f8ff" stroke-width="1.2"/>`;
  // wave dashes, two sets, swapping on the beat
  const waves = (seed) => {
    const r = mulberry32(seed);
    let d = '';
    for (let row = 0; row < 9; row++) {
      const y = HORIZON + 6 + row * row * 1.15 + row * 3;
      const len = 4 + row * 1.6;
      for (let x = LX - 104 + r() * 20; x < LX + 104; x += 18 + row * 4 + r() * 12) d += `M${n(x)} ${n(y)}h${n(len)}`;
    }
    return d;
  };
  g += `<path d="${waves(7)}" stroke="#e9fbff" stroke-width="1.5" opacity=".8" style="animation:waveA 1.5s step-end infinite"/>`;
  g += `<path d="${waves(11)}" stroke="#e9fbff" stroke-width="1.5" opacity="0" style="animation:waveB 1.5s step-end infinite"/>`;
  // island
  const IX = LX + 8, IY = LY + 50;
  g += `<ellipse cx="${IX}" cy="${IY + 3}" rx="80" ry="17" fill="#7fe0ee" opacity=".55"/>`;
  g += `<ellipse cx="${IX}" cy="${IY + 2}" rx="74" ry="14" fill="none" stroke="#fff" stroke-width="2" opacity=".85" stroke-dasharray="10 4 3 4"/>`;
  g += `<ellipse cx="${IX}" cy="${IY}" rx="68" ry="12.5" fill="url(#gSand)"/>`;
  g += `<path d="M${IX - 66} ${IY + 2}C${IX - 40} ${IY + 13} ${IX + 40} ${IY + 13} ${IX + 66} ${IY + 2}" fill="none" stroke="${C.sandD}" stroke-width="2"/>`;
  // shrubs
  const shrub = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-9 0C-10 -6 -5 -8 -2 -6C-1 -11 6 -11 6 -5C10 -7 13 -2 10 0Z" fill="${C.leaf}"/><path d="M-5 -4C-3 -7 0 -7 1 -5M3 -6C5 -8 7 -7 8 -4" stroke="${C.leafL}" stroke-width="1.4" fill="none"/></g>`;
  g += shrub(IX - 50, IY - 2, 0.9) + shrub(IX + 46, IY - 3, 0.8) + shrub(IX - 14, IY - 6, 0.7);
  // rock
  g += `<path d="M${IX - 60} ${IY + 6}C${IX - 60} ${IY} ${IX - 50} ${IY - 1} ${IX - 48} ${IY + 6}Z" fill="#8d95a0"/>`;
  // raft, off the right of the island
  {
    let r = `<g transform="translate(${IX + 70} ${IY + 4}) rotate(-6)">`;
    for (let i = 0; i < 4; i++) r += `<rect x="${i * 6.4}" y="-4" width="6" height="14" rx="3" fill="${i % 2 ? '#9a5a3a' : '#b06a45'}" stroke="#5c3320" stroke-width=".8"/>`;
    r += `<path d="M-1 0H26M-1 6H26" stroke="#e3c48a" stroke-width="1.3"/></g>`;
    g += r;
  }
  // palm: a tall slender trunk leaning left, crown swaying
  const PB = { x: IX + 26, y: IY - 3 };
  const PC = { x: IX + 4, y: LY - 72 };
  g += `<path d="M${PB.x - 3.4} ${PB.y}C${PB.x - 6} ${PB.y - 40} ${PC.x + 10} ${PC.y + 50} ${PC.x - 2} ${PC.y + 2}L${PC.x + 3} ${PC.y + 2}C${PC.x + 15} ${PC.y + 50} ${PB.x + 1} ${PB.y - 40} ${PB.x + 3.4} ${PB.y}Z" fill="url(#gTrunk)" stroke="${C.trunkD}" stroke-width=".8"/>`;
  {
    let seg = '';
    for (let i = 1; i < 14; i++) {
      const t = i / 14;
      // a point on the centre curve (approx.)
      const mt = 1 - t;
      const bx = mt ** 3 * PB.x + 3 * mt * mt * t * (PB.x - 2) + 3 * mt * t * t * (PC.x + 12) + t ** 3 * (PC.x + 0.5);
      const by = mt ** 3 * PB.y + 3 * mt * mt * t * (PB.y - 40) + 3 * mt * t * t * (PC.y + 50) + t ** 3 * (PC.y + 2);
      const hw = 3.4 - 0.9 * t;
      seg += `M${n(bx - hw)} ${n(by)}L${n(bx + hw)} ${n(by - 1)}`;
    }
    g += `<path d="${seg}" stroke="${C.trunkD}" stroke-width=".9" opacity=".8"/>`;
  }
  // crown
  const frond = (ang, len, col) => {
    const a = ang * PI / 180;
    const ex = Math.cos(a) * len, ey = Math.sin(a) * len;
    const mx = Math.cos(a) * len * 0.5, my = Math.sin(a) * len * 0.5 - len * 0.22;
    const nx = -Math.sin(a), ny = Math.cos(a);
    return `<path d="M0 0Q${n(mx + nx * 6)} ${n(my + ny * 6 - 3)} ${n(ex)} ${n(ey + 6)}Q${n(mx - nx * 2)} ${n(my - ny * 2 + 4)} 0 0Z" fill="${col}" stroke="${C.leafD}" stroke-width=".8"/>` +
      `<path d="M0 0Q${n(mx)} ${n(my)} ${n(ex)} ${n(ey + 6)}" fill="none" stroke="${C.leafD}" stroke-width=".9" opacity=".7"/>`;
  };
  let crown = '';
  for (const [a, l, c] of [[200, 42, C.leaf], [-20, 44, C.leaf], [160, 36, C.leafL], [20, 38, C.leafL], [235, 30, C.leaf], [-55, 30, C.leaf], [120, 28, C.leafD], [60, 26, C.leafD], [270, 22, C.leafL]]) crown += frond(a, l, c);
  crown += `<circle cx="-2" cy="3" r="3" fill="#7b4a2a"/><circle cx="3" cy="4" r="3" fill="#6a3f22"/>`;
  g += `<g transform="translate(${PC.x} ${PC.y})"><g style="animation:sway 3s ease-in-out infinite">${crown}</g></g>`;

  // her: small and simple, coral tank top, cream shorts, cream headphones,
  // brown hair in a low bun, bare feet. She nods on every beat.
  const HX = IX - 30, HF = IY - 1; // feet line
  let her = '';
  her += `<ellipse cx="${HX}" cy="${HF + 1.5}" rx="9" ry="2" fill="#b89659" opacity=".5"/>`;
  her += `<path d="M${HX - 4.6} ${HF - 18}V${HF - 1}M${HX + 1.6} ${HF - 18}V${HF - 1}" stroke="${C.skin}" stroke-width="3.6"/>`;
  her += `<path d="M${HX - 6.4} ${HF}H${HX - 2.4}M${HX - 0.2} ${HF}H${HX + 4}" stroke="${C.skinD}" stroke-width="2" stroke-linecap="round"/>`;
  her += `<path d="M${HX - 7.2} ${HF - 28}H${HX + 4.4}L${HX + 5} ${HF - 17}H${HX - 1}L${HX - 1.6} ${HF - 19}L${HX - 2.2} ${HF - 17}H${HX - 7.8}Z" fill="${C.cream}" stroke="${C.creamD}" stroke-width=".7"/>`;
  her += `<path d="M${HX - 7} ${HF - 42}C${HX - 7.5} ${HF - 36} ${HX - 7.6} ${HF - 32} ${HX - 7.4} ${HF - 27.5}H${HX + 4.6}C${HX + 4.6} ${HF - 32} ${HX + 4.4} ${HF - 36} ${HX + 4} ${HF - 42}Z" fill="${C.coral}" stroke="${C.coralD}" stroke-width=".8"/>`;
  her += `<path d="M${HX - 9.4} ${HF - 41}C${HX - 10.4} ${HF - 35} ${HX - 10.4} ${HF - 30} ${HX - 9.6} ${HF - 25}M${HX + 6.6} ${HF - 41}C${HX + 7.8} ${HF - 35} ${HX + 7.8} ${HF - 30} ${HX + 7} ${HF - 25}" stroke="${C.skin}" stroke-width="2.8" fill="none" stroke-linecap="round"/>`;
  her += `<path d="M${HX - 9.2} ${HF - 41.5}L${HX - 6.5} ${HF - 42.4}M${HX + 6.2} ${HF - 41.5}L${HX + 3.5} ${HF - 42.4}" stroke="${C.coral}" stroke-width="2.4" stroke-linecap="round"/>`;
  her += `<rect x="${HX - 3}" y="${HF - 46}" width="4" height="4.5" fill="${C.skinD}"/>`;
  let head = '';
  head += `<circle cx="${HX - 1}" cy="${HF - 51}" r="6.2" fill="${C.skin}"/>`;
  head += `<path d="M${HX - 7.3} ${HF - 50}C${HX - 8} ${HF - 58} ${HX + 4} ${HF - 60.5} ${HX + 5.3} ${HF - 52}C${HX + 2} ${HF - 55} ${HX - 3} ${HF - 55} ${HX - 7.3} ${HF - 50}Z" fill="${C.hair}"/>`;
  head += `<circle cx="${HX - 7.6}" cy="${HF - 46.6}" r="2.9" fill="${C.hair}"/>`;
  head += `<path d="M${HX - 7.2} ${HF - 52}C${HX - 7} ${HF - 60.6} ${HX + 5} ${HF - 60.6} ${HX + 5.2} ${HF - 52}" fill="none" stroke="${C.cream}" stroke-width="1.6"/>`;
  head += `<rect x="${HX - 9.2}" y="${HF - 54}" width="3.6" height="5.6" rx="1.6" fill="${C.cream}" stroke="${C.creamD}" stroke-width=".6"/>`;
  head += `<rect x="${HX + 3.6}" y="${HF - 54}" width="3.6" height="5.6" rx="1.6" fill="${C.cream}" stroke="${C.creamD}" stroke-width=".6"/>`;
  head += `<path d="M${HX - 3.4} ${HF - 50.4}h1.8M${HX + 0.4} ${HF - 50.4}h1.8" stroke="#3a2418" stroke-width=".9"/>`;
  head += `<path d="M${HX - 1.8} ${HF - 47.6}q1 .7 2 0" stroke="#b5654f" stroke-width=".8" fill="none"/>`;
  her += `<g style="animation:nod ${BEAT}s step-end infinite">${head}</g>`;
  g += her;

  // ------------------------------------------------ events (stepped motion)
  // 6-12 s: a message in a bottle washes in to her feet and straight back.
  {
    const steps = [];
    const sx = LX + 120, sy = IY + 18, ex = HX + 10, ey = IY + 9;
    for (let i = 0; i <= 8; i++) steps.push([6 + i * 0.375, sx + (ex - sx) * (i / 8), sy + (ey - sy) * (i / 8)]);
    steps.push([10.5, ex, ey]);
    for (let i = 1; i <= 4; i++) steps.push([10.5 + i * 0.375, ex + (sx - ex) * (i / 4), ey + (sy - ey) * (i / 4)]);
    steps.push([12.01, sx, sy]);
    const pts = [[0, sx, sy], ...steps, [60, sx, sy]].map(([t, x, y]) => [t, x - sx, y - sy]);
    const st = kfTranslate('evBottle', LOOP, pts, 'step-end');
    g += `<g transform="translate(${sx} ${sy})"><g${st()}><g transform="rotate(-70)"><rect x="-3" y="-5" width="6" height="11" rx="2.6" fill="#56c08a" stroke="${C.ink}" stroke-width=".8"/><rect x="-1.5" y="-8.5" width="3" height="4" fill="#56c08a" stroke="${C.ink}" stroke-width=".8"/><rect x="-1.5" y="-10.4" width="3" height="2.2" fill="#c48a52"/><rect x="-1.6" y="-2.6" width="3.2" height="6" fill="${C.cream}"/></g></g></g>`;
  }
  // 18-24 s: a drone lowers a parcel and leaves; 24-30 s: a wave takes the box.
  {
    const bx = IX + 48, by = IY - 4;
    const dTop = LY - 130;
    const pts = [[0, 0, dTop - by]];
    for (let i = 0; i <= 6; i++) pts.push([18 + i * 0.375, 0, (dTop - by) * (1 - i / 6) + (-14) * (i / 6)]);
    pts.push([21, 0, -14]);
    for (let i = 1; i <= 6; i++) pts.push([21 + i * 0.375, 0, -14 + (dTop - by + 14) * (i / 6)]);
    pts.push([24, 0, dTop - by], [60, 0, dTop - by]);
    const drone = kfTranslate('evDrone', LOOP, pts, 'step-end');
    g += `<g transform="translate(${bx} ${by})"><g transform="translate(0 ${dTop - by})"${drone()}><path d="M-12 -14H12" stroke="${C.ink}" stroke-width="1.6"/><ellipse cx="-12" cy="-16" rx="6" ry="1.5" fill="${C.ink2}" opacity=".8"/><ellipse cx="12" cy="-16" rx="6" ry="1.5" fill="${C.ink2}" opacity=".8"/><rect x="-6" y="-15" width="12" height="6" rx="2.4" fill="#e3e9f0" stroke="${C.ink}" stroke-width="1"/><circle cx="0" cy="-12" r="1.3" fill="${C.pink}"/><path d="M-3 -9V-4M3 -9V-4" stroke="${C.ink}" stroke-width="1"/></g></g>`;
    // the box: rides with the drone, sits on the sand 21-27, then floats off
    const bp = [[0, 0, dTop - by + 9]];
    for (let i = 0; i <= 6; i++) bp.push([18 + i * 0.375, 0, (dTop - by + 9) * (1 - i / 6) + (-5) * (i / 6)]);
    bp.push([21, 0, 0], [27, 0, 0]);
    for (let i = 1; i <= 8; i++) bp.push([27 + i * 0.375, i * 6.5, i * 2.2]);
    bp.push([30.01, 0, dTop - by + 9], [60, 0, dTop - by + 9]);
    const box = kfTranslate('evBox', LOOP, bp, 'step-end');
    g += `<g transform="translate(${bx} ${by})"><g transform="translate(0 ${dTop - by + 9})"${box()}><rect x="-6" y="-9" width="12" height="9" fill="#c99358" stroke="#6e4a22" stroke-width=".9"/><path d="M0 -9V0M-6 -5H6" stroke="#8e5f2e" stroke-width=".9"/></g></g>`;
    // the wave that takes it
    css.push(`@keyframes evWave{0%{opacity:0;transform:translate(-30px,0)}${n(26.25 / 60 * 100, 3)}%{opacity:0;transform:translate(-30px,0)}${n(26.25 / 60 * 100 + 0.01, 3)}%{opacity:1;transform:translate(-30px,0)}${n(27.75 / 60 * 100, 3)}%{opacity:1;transform:translate(0,0)}${n(29 / 60 * 100, 3)}%{opacity:1;transform:translate(14px,0)}${n(29 / 60 * 100 + 0.01, 3)}%{opacity:0}100%{opacity:0}}`);
    g += `<g opacity="0" style="animation:evWave 60s steps(1,end) infinite"><path d="M${bx - 30} ${by + 4}C${bx - 16} ${by - 4} ${bx} ${by - 6} ${bx + 18} ${by + 4}" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/><path d="M${bx - 20} ${by + 7}C${bx - 8} ${by + 2} ${bx + 4} ${by + 2} ${bx + 14} ${by + 7}" fill="none" stroke="#dff7ff" stroke-width="2" stroke-linecap="round"/></g>`;
  }
  // 30-36 s: a shark in headphones crosses in front, nodding on the beat.
  {
    const sy = IY + 26;
    const pts = [[0, -130, 0]];
    const N = 16;
    for (let i = 0; i <= N; i++) pts.push([30 + i * 0.375, -130 + 260 * (i / N), i % 2 ? 1.6 : 0]);
    pts.push([36.01, -130, 0], [60, -130, 0]);
    const shark = kfTranslate('evShark', LOOP, pts, 'step-end');
    g += `<g transform="translate(${LX} ${sy})"><g transform="translate(-130 0)"${shark()}><path d="M-12 2C-8 -2 8 -2 12 2" stroke="#e9fbff" stroke-width="1.6" fill="none"/><path d="M-6 1C-4 -6 0 -13 6 -15C4 -9 4 -3 6 1Z" fill="#6f8496" stroke="${C.ink}" stroke-width="1"/><path d="M-3 -4C-2 -12 5 -13 7 -8" fill="none" stroke="${C.cream}" stroke-width="1.6"/><rect x="-5.4" y="-6" width="3.2" height="4.6" rx="1.3" fill="${C.cream}" stroke="${C.ink}" stroke-width=".7"/><rect x="5" y="-9.6" width="3.2" height="4.6" rx="1.3" fill="${C.cream}" stroke="${C.ink}" stroke-width=".7"/></g></g>`;
  }
  // 42-48 s: a coconut drops on a hermit crab; the coconut walks off.
  {
    const cx0 = PC.x + 2, cy0 = PC.y + 6;
    const fx = IX + 14, fy = IY - 4;
    // crab walks in 42-43.5, coconut falls 43.5-44.25, walks off 45-48
    const crabPts = [[0, -60, 0]];
    for (let i = 0; i <= 4; i++) crabPts.push([42 + i * 0.375, -60 + 60 * (i / 4), 0]);
    crabPts.push([44.25, 0, 0], [44.26, 0, 400], [60, -60, 0]);
    // keep the crab hidden outside its window
    const crab = kfTranslate('evCrab', LOOP, crabPts, 'step-end');
    css.push(`@keyframes evCrabV{0%{opacity:0}70%{opacity:1}73.75%{opacity:0}100%{opacity:0}}`);
    g += `<g transform="translate(${fx} ${fy})"><g opacity="0" style="animation:evCrabV 60s step-end infinite"><g transform="translate(-60 0)"${crab()}><path d="M-4 0C-4 -6 4 -6 4 0Z" fill="${C.orange}" stroke="#a5400c" stroke-width=".8"/><path d="M-5 0L-7 2M5 0L7 2M-3 -4L-5 -7M3 -4L5 -7" stroke="#a5400c" stroke-width="1"/></g></g></g>`;
    const cocoPts = [[0, 0, 0], [43.5, 0, 0]];
    const dy = fy - 4 - cy0, dx = fx - cx0;
    for (let i = 1; i <= 3; i++) cocoPts.push([43.5 + i * 0.25, dx * (i / 3), dy * (i / 3) * (i / 3)]);
    cocoPts.push([45, dx, dy]);
    for (let i = 1; i <= 8; i++) cocoPts.push([45 + i * 0.375, dx + i * 9, dy + (i % 2 ? -1 : 0)]);
    cocoPts.push([48.01, 0, 0], [60, 0, 0]);
    const coco = kfTranslate('evCoco', LOOP, cocoPts, 'step-end');
    css.push(`@keyframes evLegs{0%{opacity:0}${n(44.25 / 60 * 100, 3)}%{opacity:1}${n(48 / 60 * 100, 3)}%{opacity:0}}`);
    g += `<g transform="translate(${cx0} ${cy0})"><g${coco()}><g opacity="0" style="animation:evLegs 60s step-end infinite"><path d="M-4 2L-7 6M-1 3L-2 7M2 3L3 7M4 2L7 6" stroke="${C.orange}" stroke-width="1.4"/></g><circle r="4" fill="#7b4a2a" stroke="#3f2414" stroke-width=".8"/><circle cx="-1" cy="-1" r=".7" fill="#2a170c"/><circle cx="1.4" cy="-1.5" r=".7" fill="#2a170c"/></g></g>`;
  }
  // 48-54 s: the signal hunt: one bar, at the top of the palm.
  {
    css.push(`@keyframes evSig{0%{opacity:0}80%{opacity:1}90%{opacity:0}100%{opacity:0}}`);
    const sx = PC.x + 18, sy = PC.y - 8;
    g += `<g opacity="0" style="animation:evSig 60s step-end infinite"><path d="M${sx} ${sy + 12}L${sx - 9} ${sy + 15}L${sx} ${sy + 6}Z" fill="#fff" stroke="${C.ink}" stroke-width="1"/><rect x="${sx}" y="${sy - 4}" width="30" height="20" rx="5" fill="#fff" stroke="${C.ink}" stroke-width="1.2"/>` +
      `<rect x="${sx + 5}" y="${sy + 8}" width="4" height="4" fill="${C.limeD}" stroke="${C.ink}" stroke-width=".7" style="animation:blink ${BEAT}s step-end infinite"/><rect x="${sx + 11}" y="${sy + 4}" width="4" height="8" fill="none" stroke="${C.ink2}" stroke-width=".8" stroke-dasharray="1.6 1.2"/><rect x="${sx + 17}" y="${sy}" width="4" height="12" fill="none" stroke="${C.ink2}" stroke-width=".8" stroke-dasharray="1.6 1.2"/><rect x="${sx + 23}" y="${sy - 1}" width="3" height="13" fill="none"/></g>`;
  }
  // glass sheen
  g += `<path d="M${LX - 88} ${LY - 20}A92 92 0 0 1 ${LX + 20} ${LY - 92}A100 100 0 0 0 ${LX - 88} ${LY - 20}Z" fill="#fff" opacity=".25"/>`;
  g += `<ellipse cx="${LX - 30}" cy="${LY - 62}" rx="50" ry="24" fill="url(#gGlass)" transform="rotate(-30 ${LX - 30} ${LY - 62})" opacity=".6"/>`;
  g += `</g>`;
  body.push(g);
  body.push(`<circle cx="${LX}" cy="${LY}" r="${LENS.glass}" fill="none" stroke="${C.ink}" stroke-width="2.2"/>`);
}

// =================================================================== FRONT LAYERS
body.push(ringLayer('Front'));
body.push(satLayer('Front'));

// Hard white sparkles on the shiny things, one per beat in turn.
{
  css.push(`@keyframes twinkle{0%{transform:scale(.25);opacity:.3}12%{transform:scale(1);opacity:1}30%{transform:scale(.25);opacity:.3}100%{transform:scale(.25);opacity:.3}}`);
  const star = (r) => `M0 ${-r}C${r * 0.09} ${-r * 0.09} ${r * 0.09} ${-r * 0.09} ${r} 0C${r * 0.09} ${r * 0.09} ${r * 0.09} ${r * 0.09} 0 ${r}C${-r * 0.09} ${r * 0.09} ${-r * 0.09} ${r * 0.09} ${-r} 0C${-r * 0.09} ${-r * 0.09} ${-r * 0.09} ${-r * 0.09} 0 ${-r}Z`;
  defs.push(`<g id="spk"><path d="${star(13)}" fill="#fff"/><circle r="2.2" fill="#fff"/></g>`);
  const spots = [[PILL.x + 466, PILL.y + 9, 1], [LX - 70, LY - 76, 0.9], [1050, 21, 0.75], [RING.cx + 300, RING.cy + 96, 0.9]];
  spots.forEach(([x, y, sc], i) => {
    body.push(`<g transform="translate(${n(x)} ${n(y)}) scale(${sc})"><use href="#spk" class="sp" style="animation:twinkle ${BAR}s ease-out ${n(i * BEAT, 2)}s infinite"/></g>`);
  });
}

// Callouts from the lens (leader lines with a dot on the thing).
{
  const callout = (x0, y0, x1, y1, x2, label, col) =>
    `<path d="M${x0} ${y0}L${x1} ${y1}H${x2}" fill="none" stroke="${C.ink}" stroke-width="1.2"/><circle cx="${x0}" cy="${y0}" r="2.6" fill="${col}" stroke="${C.ink}" stroke-width="1"/>` + label;
  // to the top of the palm
  body.push(callout(LX + 11, LY - 80, LX - 40, LY - 150, LX - 226, '', C.lime));
  body.push(px('SIGNAL: 1 BAR', 28, LY - 166, 1.5, C.ink));
  body.push(px('(AT THE TOP OF THE PALM)', 28, LY - 148 + 2, 1.1, C.ink2));
  // to her
  body.push(callout(LX - 33, LY + 20, LX - 128, LY + 166, LX - 228, '', C.coral));
  body.push(px('OPERATOR: IDLE', 26, LY + 172, 1.5, C.ink));
  body.push(px('NODDING, ON THE BEAT', 26, LY + 186, 1.1, C.ink2));
}

// =================================================================== TOP STRIP
{
  const reg = (x, y, r = 9) => `<g fill="none" stroke="${C.ink}" stroke-width="1.3"><circle cx="${x}" cy="${y}" r="${r}"/><circle cx="${x}" cy="${y}" r="${r * 0.45}"/><path d="M${x - r - 6} ${y}H${x + r + 6}M${x} ${y - r - 6}V${y + r + 6}"/></g>`;
  body.push(reg(34, 34));
  // invented corporate mark: IDLECORE, an orbit logo
  body.push(`<g transform="translate(76 34)"><circle r="12" fill="${C.ink}"/><circle r="5" fill="${C.lime}"/><ellipse rx="20" ry="6.5" fill="none" stroke="${C.ink}" stroke-width="2.2" transform="rotate(-20)"/><ellipse rx="20" ry="6.5" fill="none" stroke="${C.lime}" stroke-width="1" transform="rotate(-20)"/></g>`);
  body.push(tfText('IDLECORE', 104, 22, 15, C.ink, { sw: 1.6 }));
  body.push(px('SYSTEMS 2000 · ISLAND DIVISION', 104, 42, 1.2, C.ink2));
  // slogan
  body.push(tfText('THE FUTURE OF DOING NOTHING', 612, 24, 13, C.ink, { sw: 1.4, anchor: 'middle' }));
  body.push(pxC('NOW SHOWING EVERY SO OFTEN · ON THE BAR · ON SCHEDULE', 612, 44, 1.1, C.ink2));
  // model pill, top right (inside the flare)
  defs.push(`<linearGradient id="gChromeP" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset=".38" stop-color="#d9e2ec"/><stop offset=".5" stop-color="#8796ad"/><stop offset=".56" stop-color="#1a2440"/><stop offset=".7" stop-color="#6e7f99"/><stop offset="1" stop-color="#e9f0f6"/></linearGradient>`);
  body.push(`<rect x="938" y="17" width="114" height="30" rx="15" fill="url(#gChromeP)" stroke="${C.ink}" stroke-width="2"/>`);
  body.push(`<rect x="950" y="20" width="90" height="7" rx="3.5" fill="#fff" opacity=".85"/>`);
  body.push(tfText('ISL-01', 995, 25.5, 13, C.ink, { sw: 1.6, anchor: 'middle', extra: ' stroke-linejoin="round"' }).replace(/stroke-width="([\d.]+)"/, (m, w) => `stroke-width="${n(+w + 4, 2)}"`).replace(`stroke="${C.ink}"`, 'stroke="#fff"'));
  body.push(tfText('ISL-01', 995, 25.5, 13, C.ink, { sw: 1.6, anchor: 'middle' }));
  body.push(reg(1166, 34));
}

// =================================================================== INFO BAND
const BAND_Y = 452, BAND_H = 148;
function frame(x, y, w, h, tab, tabCol, tabInk, deco = true) {
  const c = 12;
  const d = `M${x + c} ${y}H${x + w}V${y + h - c}L${x + w - c} ${y + h}H${x}V${y + c}Z`;
  const tw = tfWidth(tab, 1.5) * (11 / 7.5) + 26;
  return `<path d="${d}" fill="url(#gPanel)" stroke="${C.ink}" stroke-width="1.6"/>` +
    `<path d="M${x + c + 4} ${y - 1}H${x + c + 4 + tw}L${x + c + tw + 14} ${y + 17}H${x + c + 4}Z" fill="${tabCol}" stroke="${C.ink}" stroke-width="1.4"/>` +
    tfText(tab, x + c + 14, y + 3.5, 11, tabInk, { sw: 1.5 }) +
    (deco ? `<path d="M${x + w - 34} ${y + 8}H${x + w - 8}M${x + w - 34} ${y + 12}H${x + w - 16}" stroke="${C.ink}" stroke-width="1.3"/>` : '');
}
// --- SPEC SHEET
{
  const x = 26, y = BAND_Y, w = 352, h = BAND_H;
  body.push(frame(x, y, w, h, 'SPEC SHEET', C.lime, C.ink));
  const rows = [
    ['RUNTIME', '10:00:00 · SEED 1992'],
    ['PICTURE', '16:9 · 1080P · 30 FPS'],
    ['SCHEDULE', '90+ ACTIVITIES · 4 TIMERS'],
    ['THEME', '60 S LOOP, 80 BPM, F MAJOR'],
    ['SOUND', '150+ FILES, ALL FROM CODE'],
    ['SAMPLES', '0 · MIX -14 LUFS'],
    ['NIGHT', 'NONE. ALWAYS DAYTIME'],
  ];
  rows.forEach(([k, v], i) => {
    const yy = y + 28 + i * 16.4;
    body.push(px(k, x + 14, yy, 1.5, C.ink2));
    body.push(px(v, x + 96, yy, 1.5, C.ink));
  });
}
// --- LIVE READOUT
{
  const x = 392, y = BAND_Y, w = 420, h = BAND_H;
  body.push(frame(x, y, w, h, 'LIVE READOUT', C.orange, C.ink, false));
  body.push(pxR('SPED UP FOR THE BROCHURE', x + w - 14, y + 7, 1.1, C.ink2));
  const MSG = [
    ['IDLE', 'NODDING TO THE BEAT.', 'NOTHING TO REPORT.'],
    ['OCCASIONAL', 'MESSAGE IN A BOTTLE.', 'IT WASHES STRAIGHT BACK.'],
    ['IDLE', 'STILL NODDING.', 'THE SEA IS FINE.'],
    ['RARE', 'DRONE DELIVERY.', 'PARCEL: MORE HEADPHONES.'],
    ['CHAINED', 'A WAVE TAKES', 'THE EMPTY BOX.'],
    ['RARE', 'A SHARK IN HEADPHONES', 'NODS TO THE SAME BEAT.'],
    ['IDLE', 'VERY, VERY CALM.', 'NO SHIPS. PROBABLY.'],
    ['OCCASIONAL', 'COCONUT MEETS HERMIT CRAB.', 'THE COCONUT WALKS OFF.'],
    ['RARE', 'SIGNAL HUNT: ONE BAR,', 'AT THE TOP OF THE PALM.'],
    ['IDLE', 'NODDING. THE FUTURE', 'IS EXTREMELY CALM.'],
  ];
  const TAGCOL = { IDLE: C.ice, OCCASIONAL: C.lime, RARE: C.pink, CHAINED: C.orange };
  const win = windowClass(6);
  MSG.forEach(([tag, a, b], i) => {
    const t0 = i * 6;
    const tw = pxW(tag, 1.4) + 14;
    let s = `<rect x="${x + 16}" y="${y + 26}" width="${n(tw)}" height="15" rx="7.5" fill="${TAGCOL[tag]}" stroke="${C.ink}" stroke-width="1.1"/>`;
    s += px(tag, x + 23, y + 29, 1.4, tag === 'RARE' ? '#fff' : C.ink);
    s += px(`T+${String(t0).padStart(2, '0')}S`, x + 28 + tw, y + 30, 1.2, C.ink2);
    s += px(a, x + 16, y + 48, 2, C.ink);
    s += px(b, x + 16, y + 66, 2, C.ink);
    body.push(`<g${i ? ' opacity="0"' : ''} style="animation:${win} ${LOOP}s step-end ${t0}s infinite">${s}</g>`);
  });
  // bar counter + beat lights
  const cy = y + 90;
  body.push(px('BAR', x + 16, cy, 1.6, C.ink2));
  const w3 = windowClass(3);
  for (let b = 1; b <= 20; b++) {
    body.push(`<g${b > 1 ? ' opacity="0"' : ''} style="animation:${w3} ${LOOP}s step-end ${(b - 1) * BAR}s infinite">${px(String(b).padStart(2, '0'), x + 50, cy, 1.6, C.ink)}</g>`);
  }
  body.push(px('/20', x + 69, cy, 1.6, C.ink2));
  for (let i = 0; i < 4; i++) {
    body.push(`<circle cx="${x + 120 + i * 14}" cy="${cy + 5.5}" r="4.4" fill="${C.lime}" stroke="${C.ink}" stroke-width="1"${i ? ' opacity=".18"' : ''} style="animation:beatL ${BAR}s step-end ${i * BEAT}s infinite"/>`);
    body.push(`<circle cx="${x + 120 + i * 14}" cy="${cy + 5.5}" r="4.4" fill="none" stroke="${C.ink}" stroke-width="1"/>`);
  }
  body.push(px('80 BPM · ONE BAR = 3 S', x + 182, cy, 1.6, C.ink2));
  // run pill
  const ry = y + 108;
  body.push(`<rect x="${x + 14}" y="${ry}" width="${w - 30}" height="30" rx="15" fill="url(#gRun)" stroke="${C.ink}" stroke-width="1.4"/>`);
  body.push(`<rect x="${x + 26}" y="${ry + 3}" width="${w - 54}" height="10" rx="5" fill="#fff" opacity=".18"/>`);
  body.push(`<circle cx="${x + 30}" cy="${ry + 15}" r="8" fill="${C.lime}" stroke="${C.ink}" stroke-width="1"/><path d="M${x + 27.5} ${ry + 11}L${x + 33.5} ${ry + 15}L${x + 27.5} ${ry + 19}Z" fill="${C.ink}"/>`);
  body.push(px('PYTHON TOOLS/SERVE.PY', x + 46, ry + 9.5, 1.5, '#fff'));
  body.push(px('> 127.0.0.1:8765', x + 46 + pxW('PYTHON TOOLS/SERVE.PY ', 1.5) + 4, ry + 9.5, 1.5, C.lime));
}
// --- ORBIT TABLE: the four timers
{
  const x = 826, y = BAND_Y, w = 348, h = BAND_H;
  body.push(frame(x, y, w, h, 'ORBIT TABLE', C.pink, '#fff'));
  const rows = [
    ['REGULAR', '2-5 MIN', '~155', 0.5],
    ['OCCASIONAL', '12-25 MIN', '~30', 0.8],
    ['RARE', '30-60 MIN', '~13', 1.1],
    ['SUPER RARE', '3-6 H', '~2', 1.4],
  ];
  body.push(px('TIMER', x + 50, y + 26, 1.2, C.ink2));
  body.push(px('EVERY', x + 176, y + 26, 1.2, C.ink2));
  body.push(pxR('PER 10 H', x + w - 14, y + 26, 1.2, C.ink2));
  rows.forEach(([k, every, cnt, rr], i) => {
    const yy = y + 42 + i * 21;
    // orbit glyph: a planet with a ring that gets wider for rarer timers
    const gx = x + 30, gy = yy + 5.5;
    body.push(`<g transform="translate(${gx} ${gy})"><ellipse rx="${n(8 * rr + 4)}" ry="${n(2.6 * rr + 1.6)}" fill="none" stroke="${C.ink2}" stroke-width="1" transform="rotate(-12)"/><circle r="3.4" fill="${C.ink}"/><circle cx="${n((8 * rr + 4) * Math.cos(1 + i))}" cy="${n((2.6 * rr + 1.6) * Math.sin(1 + i))}" r="2.2" fill="${[C.ice, C.lime, C.pink, C.orange][i]}" stroke="${C.ink}" stroke-width=".8" transform="rotate(-12)"/></g>`);
    body.push(px(k, x + 50, yy, 1.6, C.ink));
    body.push(px(every, x + 176, yy, 1.6, C.ink));
    body.push(pxR(cnt, x + w - 14, yy, 1.6, C.ink));
  });
  body.push(px('+ CHAINED FOLLOW-UPS · MEDIAN OF 200 RUNS', x + 16, y + h - 18, 1.1, C.ink2));
}

// =================================================================== BOTTOM STRIP
{
  const y = 610;
  const chips = [
    ['IDLE ABOUT 2/3 OF THE TIME', C.ice, C.ink],
    ['EVERY GAG LANDS ON THE BAR', C.lime, C.ink],
    ['EVERY SOUND SYNTHESIZED', C.pink, '#fff'],
    ['MILLENNIUM READY: NO MIDNIGHT', C.orange, C.ink],
  ];
  let cx = 26;
  for (const [t, col, ink] of chips) {
    const w = pxW(t, 1.3) + 22;
    body.push(`<rect x="${cx}" y="${y}" width="${n(w)}" height="18" rx="9" fill="${col}" stroke="${C.ink}" stroke-width="1.2"/>`);
    body.push(px(t, cx + 11, y + 4.5, 1.3, ink));
    cx += w + 8;
  }
  // barcode with the real numbers under it
  let bars = '';
  let bx = 1036;
  const r = mulberry32(80);
  while (bx < 1150) {
    const bw = [1, 1, 2, 3][Math.floor(r() * 4)];
    bars += `M${bx + bw / 2} ${y - 4}V${y + 12}`;
    bx += bw + [1, 2, 2, 3][Math.floor(r() * 4)];
  }
  body.push(`<path d="${bars}" stroke="${C.ink}" stroke-width="1" fill="none"/>`);
  body.push(px('1992 · 080 · 003', 1036, y + 15, 1.05, C.ink));
}

body.push(`</g>`); // panel clip
body.push(`<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="27" fill="none" stroke="#8fb0cf" stroke-width="2"/>`);

// =================================================================== ASSEMBLE
const glyphDefs = [...glyphIds].map(([ch, id]) => `<path id="${id}" d="${bitmapPath(F5[ch].split('|'))}"/>`).join('');
const title = 'CASTAWAY: a Y2K techno poster for a lo-fi island video';
const desc = 'CASTAWAY in wide squared white capitals inside a glossy candy-blue lozenge, ringed by one chrome ring. At the left end of the lozenge a lime lens shows a tiny island in daytime: one tall palm, a raft, and a young woman in cream headphones, a coral tank top and cream shorts, nodding on the beat. Eight gag icons in circles orbit the logo. A readout cycles through the gags. Run it with python tools/serve.py and open http://127.0.0.1:8765/.';
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="t d">` +
  `<title id="t">${title}</title><desc id="d">${desc}</desc>` +
  `<style>${css.join('')}@media (prefers-reduced-motion: reduce){*{animation:none!important}}</style>` +
  `<defs>${glyphDefs}${defs.join('')}</defs>` +
  body.join('') + `</svg>\n`;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, svg);
console.log(`wrote ${path.relative(process.cwd(), OUT)} (${(svg.length / 1024).toFixed(1)} KB)`);
