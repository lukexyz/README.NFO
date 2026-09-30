#!/usr/bin/env node
// Dance Vision README header: "Keygen Dialog" (03-keygen-dialog_opus_5.5).
// Plain Node, no dependencies, fully deterministic (seeded PRNG).
//   node examples/src/03-keygen-dialog_opus_5.5.mjs
// writes examples/assets/03-keygen-dialog_opus_5.5.svg
//
// Everything is drawn in "logical pixels" (viewBox 420 x 252, shown at 2x).
// Text is pixel-font glyphs drawn as merged-run <path>s reused with <use>:
// no <text>, no web fonts, nothing external. Animation is CSS only, so
// prefers-reduced-motion can switch it all off and leave a sensible still.

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(here, '../assets/03-keygen-dialog_opus_5.5.svg');

// ---------------------------------------------------------------- basics
const W = 420;
const H = 252;
const BEAT = 0.5; // 120 BPM, the tempo of the imaginary chiptune

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
const rand = mulberry32(0xda7ce);
const n2 = (v) => +v.toFixed(2);
const n3 = (v) => +v.toFixed(3);
const pct = (t, T) => `${n3((t / T) * 100)}%`;

const C = {
  lime: '#c6ff3d',
  limeHot: '#eaffa0',
  green: '#7dff2e',
  mag: '#ff3da8',
  cyan: '#3de8ff',
  amber: '#ffc23d',
  txt: '#dfe6f2',
  dim: '#8793a8',
  dim2: '#566074',
  label: '#737e95',
  recess: '#05070b',
  lcd: '#071009',
  hi: '#6f7c96',
  lo: '#020305',
};

// ---------------------------------------------------------------- fonts
// 5x7 font with 2-row descenders. Rows top to bottom, '#' = pixel.
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
  a: '.....|.....|.###.|....#|.####|#...#|.####',
  b: '#....|#....|#.##.|##..#|#...#|#...#|####.',
  c: '.....|.....|.###.|#....|#....|#...#|.###.',
  d: '....#|....#|.##.#|#..##|#...#|#...#|.####',
  e: '.....|.....|.###.|#...#|#####|#....|.###.',
  f: '..##.|.#..#|.#...|###..|.#...|.#...|.#...',
  g: '.....|.....|.####|#...#|#...#|#...#|.####|....#|.###.',
  h: '#....|#....|#.##.|##..#|#...#|#...#|#...#',
  i: '..#..|.....|.##..|..#..|..#..|..#..|.###.',
  j: '...#.|.....|..##.|...#.|...#.|...#.|...#.|#..#.|.##..',
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
  ';': '.....|.##..|.##..|.....|.##..|.##..|..#..|.#...',
  '!': '..#..|..#..|..#..|..#..|..#..|.....|..#..',
  '?': '.###.|#...#|....#|...#.|..#..|.....|..#..',
  '-': '.....|.....|.....|.###.|.....|.....|.....',
  _: '.....|.....|.....|.....|.....|.....|.....|#####',
  '=': '.....|.....|#####|.....|#####|.....|.....',
  '+': '.....|..#..|..#..|#####|..#..|..#..|.....',
  '/': '....#|....#|...#.|..#..|.#...|#....|#....',
  '\\': '#....|#....|.#...|..#..|...#.|....#|....#',
  '(': '...#.|..#..|.#...|.#...|.#...|..#..|...#.',
  ')': '.#...|..#..|...#.|...#.|...#.|..#..|.#...',
  '[': '.###.|.#...|.#...|.#...|.#...|.#...|.###.',
  ']': '.###.|...#.|...#.|...#.|...#.|...#.|.###.',
  '{': '..##.|.#...|.#...|#....|.#...|.#...|..##.',
  '}': '.##..|...#.|...#.|....#|...#.|...#.|.##..',
  '<': '...#.|..#..|.#...|#....|.#...|..#..|...#.',
  '>': '.#...|..#..|...#.|....#|...#.|..#..|.#...',
  '*': '.....|..#..|#.#.#|.###.|#.#.#|..#..|.....',
  $: '..#..|.####|#.#..|.###.|..#.#|####.|..#..',
  '#': '.#.#.|.#.#.|#####|.#.#.|#####|.#.#.|.#.#.',
  '@': '.###.|#...#|#.###|#.#.#|#.###|#....|.###.',
  "'": '..#..|..#..|.#...|.....|.....|.....|.....',
  '"': '.#.#.|.#.#.|.....|.....|.....|.....|.....',
  '&': '.##..|#..#.|#.#..|.#...|#.#.#|#..#.|.##.#',
  '%': '##...|##..#|...#.|..#..|.#...|#..##|...##',
  '~': '.....|.....|.#...|#.#.#|...#.|.....|.....',
  '|': '..#..|..#..|..#..|..#..|..#..|..#..|..#..',
  '^': '..#..|.#.#.|#...#|.....|.....|.....|.....',
  '♪': '..#..|..##.|..#.#|..#..|.##..|###..|.#...', // ♪
  '►': '#....|##...|###..|####.|###..|##...|#....', // ►
  '·': '.....|.....|.....|..#..|.....|.....|.....', // ·
  '£': '..##.|.#..#|.#...|###..|.#...|.#...|#####', // £
  '•': '.....|.....|.###.|.###.|.###.|.....|.....', // •
};

// 3x5 font, capitals and digits only (lowercase is folded to capitals).
const T3 = {
  A: '.#.|#.#|###|#.#|#.#', B: '##.|#.#|##.|#.#|##.', C: '.##|#..|#..|#..|.##',
  D: '##.|#.#|#.#|#.#|##.', E: '###|#..|##.|#..|###', F: '###|#..|##.|#..|#..',
  G: '.##|#..|#.#|#.#|.##', H: '#.#|#.#|###|#.#|#.#', I: '###|.#.|.#.|.#.|###',
  J: '..#|..#|..#|#.#|.#.', K: '#.#|#.#|##.|#.#|#.#', L: '#..|#..|#..|#..|###',
  M: '#.#|###|###|#.#|#.#', N: '##.|#.#|#.#|#.#|#.#', O: '.#.|#.#|#.#|#.#|.#.',
  P: '##.|#.#|##.|#..|#..', Q: '.#.|#.#|#.#|##.|.##', R: '##.|#.#|##.|#.#|#.#',
  S: '.##|#..|.#.|..#|##.', T: '###|.#.|.#.|.#.|.#.', U: '#.#|#.#|#.#|#.#|###',
  V: '#.#|#.#|#.#|#.#|.#.', W: '#.#|#.#|###|###|#.#', X: '#.#|#.#|.#.|#.#|#.#',
  Y: '#.#|#.#|.#.|.#.|.#.', Z: '###|..#|.#.|#..|###',
  0: '###|#.#|#.#|#.#|###', 1: '.#.|##.|.#.|.#.|###', 2: '##.|..#|.#.|#..|###',
  3: '##.|..#|.#.|..#|##.', 4: '#.#|#.#|###|..#|..#', 5: '###|#..|##.|..#|##.',
  6: '.##|#..|###|#.#|###', 7: '###|..#|.#.|.#.|.#.', 8: '###|#.#|###|#.#|###',
  9: '###|#.#|###|..#|##.',
  '.': '...|...|...|...|.#.', ':': '...|.#.|...|.#.|...', '-': '...|...|###|...|...',
  '/': '..#|..#|.#.|#..|#..', '+': '...|.#.|###|.#.|...', ',': '...|...|...|.#.|#..',
  '[': '##.|#..|#..|#..|##.', ']': '.##|..#|..#|..#|.##', '(': '.#.|#..|#..|#..|.#.',
  ')': '.#.|..#|..#|..#|.#.', '{': '.##|.#.|#..|.#.|.##', '}': '##.|.#.|..#|.#.|##.',
  '!': '.#.|.#.|.#.|...|.#.', '?': '##.|..#|.#.|...|.#.', '>': '#..|.#.|..#|.#.|#..',
  '<': '..#|.#.|#..|.#.|..#', '=': '...|###|...|###|...', "'": '.#.|.#.|...|...|...',
  '~': '...|.##|##.|...|...', _: '...|...|...|...|###', '*': '#.#|.#.|#.#|...|...',
  '·': '...|...|.#.|...|...', '%': '#.#|..#|.#.|#..|#.#', '&': '.#.|#.#|.#.|#.#|.##',
};

// Rows of '#' into one path of merged rectangles (runs merged vertically too).
function bitmapPath(rows, ox = 0, oy = 0, s = 1) {
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
  return rects.map((r) => `M${ox + r.x * s} ${oy + r.y * s}h${r.w * s}v${r.h * s}h${-r.w * s}z`).join('');
}

// A set of "x,y" pixels into merged-run path data.
function pixelsPath(px) {
  const rows = new Map();
  for (const k of px) {
    const [x, y] = k.split(',').map(Number);
    if (!rows.has(y)) rows.set(y, []);
    rows.get(y).push(x);
  }
  let d = '';
  for (const y of [...rows.keys()].sort((a, b) => a - b)) {
    const xs = rows.get(y).sort((a, b) => a - b);
    for (let i = 0; i < xs.length; ) {
      let j = i;
      while (j + 1 < xs.length && xs[j + 1] === xs[j] + 1) j++;
      d += `M${xs[i]} ${y}h${j - i + 1}v1h${-(j - i + 1)}z`;
      i = j + 1;
    }
  }
  return d;
}

function makeFont(prefix, table, adv, fold = false) {
  const used = new Map();
  return {
    adv,
    id(ch) {
      const key = fold ? ch.toUpperCase() : ch;
      const rows = table[key];
      if (rows === undefined) throw new Error(`${prefix}: no glyph for ${JSON.stringify(ch)}`);
      const id = prefix + key.codePointAt(0).toString(36);
      if (!used.has(id)) used.set(id, bitmapPath(rows.split('|')));
      return id;
    },
    width: (str) => [...str].length * adv - 1,
    defs: () => [...used].map(([id, d]) => `<path id="${id}" d="${d}"/>`).join(''),
  };
}
const f5 = makeFont('a', F5, 6);
const t3 = makeFont('t', T3, 4, true);

// A run of glyphs. attrs is raw attribute text for the wrapping <g>.
function text(font, str, x, y, attrs = '') {
  let s = `<g transform="translate(${x} ${y})"${attrs ? ` ${attrs}` : ''}>`;
  let cx = 0;
  for (const ch of str) {
    if (ch !== ' ') s += `<use href="#${font.id(ch)}"${cx ? ` x="${cx}"` : ''}/>`;
    cx += font.adv;
  }
  return `${s}</g>`;
}
// Several coloured runs on one line: [[str, fill], ...]
function spans(font, parts, x, y) {
  let s = '';
  let cx = x;
  for (const [str, fill] of parts) {
    if (str.trim()) s += text(font, str, cx, y, `fill="${fill}"`);
    cx += [...str].length * font.adv;
  }
  return s;
}
const lineWidth = (font, parts) => parts.reduce((w, [str]) => w + [...str].length * font.adv, 0) - 1;

// ---------------------------------------------------------------- CSS helpers
const css = [];
// Discrete keyframes (use with step-end): events = [[time, 'css'], ...] within [0, T).
function stepKF(name, T, events) {
  const ev = [...events].sort((a, b) => a[0] - b[0]);
  const at0 = ev.filter(([t]) => t <= 0).pop() || ev[ev.length - 1];
  let out = `@keyframes ${name}{0%{${at0[1]}}`;
  for (const [t, v] of ev) if (t > 0 && t < T) out += `${pct(t, T)}{${v}}`;
  out += `100%{${ev[ev.length - 1][1]}}}`;
  css.push(out);
}

// ---------------------------------------------------------------- shapes
const rect = (x, y, w, h, fill, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"${extra ? ` ${extra}` : ''}/>`;

// Sunken panel: dark top/left, light bottom/right, filled centre.
function sunken(x, y, w, h, fill = C.recess) {
  return (
    `<path fill="${C.lo}" d="M${x} ${y}h${w}v1h${-w}zM${x} ${y}h1v${h}h-1z"/>` +
    `<path fill="#3e4759" d="M${x + 1} ${y + h - 1}h${w - 1}v1h${-(w - 1)}zM${x + w - 1} ${y + 1}h1v${h - 1}h-1z"/>` +
    rect(x + 1, y + 1, w - 2, h - 2, fill)
  );
}
// Raised bevel: black outline, light top/left, dark bottom/right, gradient face.
function raised(x, y, w, h, face = 'url(#btn)', hi = C.hi, lo = '#0b0e14') {
  return (
    rect(x, y, w, h, '#010203') +
    rect(x + 1, y + 1, w - 2, h - 2, lo) +
    rect(x + 1, y + 1, w - 3, h - 3, hi) +
    rect(x + 2, y + 2, w - 4, h - 4, face)
  );
}

// Offset a clockwise (screen coordinates) polygon inwards by d.
function inset(pts, d) {
  const n = pts.length;
  const lines = pts.map((p, i) => {
    const q = pts[(i + 1) % n];
    const dx = q[0] - p[0];
    const dy = q[1] - p[1];
    const len = Math.hypot(dx, dy);
    const nx = -dy / len;
    const ny = dx / len;
    return { p: [p[0] + nx * d, p[1] + ny * d], u: [dx / len, dy / len] };
  });
  return pts.map((_, i) => {
    const a = lines[(i + n - 1) % n];
    const b = lines[i];
    const den = a.u[0] * b.u[1] - a.u[1] * b.u[0];
    const t = ((b.p[0] - a.p[0]) * b.u[1] - (b.p[1] - a.p[1]) * b.u[0]) / den;
    return [n2(a.p[0] + a.u[0] * t), n2(a.p[1] + a.u[1] * t)];
  });
}
const polyD = (pts) => `M${pts.map((p) => p.join(' ')).join('L')}z`;

// ---------------------------------------------------------------- window silhouette
// Title tab on top, speaker fins on both sides, a chin at the bottom.
const SHAPE = [
  [22, 24], [34, 24], [50, 8], [370, 8], [386, 24], [398, 24], [406, 32],
  [406, 88], [414, 96], [414, 180], [406, 188], [406, 232], [398, 240],
  [290, 240], [282, 248], [138, 248], [130, 240], [22, 240], [14, 232],
  [14, 188], [6, 180], [6, 96], [14, 88], [14, 32],
];

const DISC = { x: 25, y: 25, r: 15 };
const parts = [];
const push = (s) => parts.push(s);
const extraDefs = [];

// drop shadow + body
push(`<g fill="#000" opacity=".45" transform="translate(3 4)" filter="url(#soft)"><path d="${polyD(SHAPE)}"/><circle cx="${DISC.x}" cy="${DISC.y}" r="${DISC.r + 4}"/></g>`);
push(`<path d="${polyD(SHAPE)}" fill="#010203"/>`);
push(`<path d="${polyD(inset(SHAPE, 1))}" fill="${C.hi}"/>`);
push(`<path d="${polyD(inset(SHAPE, 1))}" fill="#0a0d13" transform="translate(1 1)" clip-path="url(#bodyClip)"/>`);
push(`<path d="${polyD(inset(SHAPE, 2))}" fill="url(#face)"/>`);
push(`<path d="${polyD(inset(SHAPE, 2))}" fill="url(#carbon)" opacity=".55"/>`);
push(`<path d="${polyD(inset(SHAPE, 2))}" fill="url(#gloss)"/>`);

// fin grilles, LEDs and screws
for (const [fx, dir] of [[6, 1], [414, -1]]) {
  const gx = dir > 0 ? fx + 3 : fx - 8;
  for (let y = 104; y <= 170; y += 4) push(rect(gx, y, 5, 2, '#020305') + rect(gx, y + 2, 5, 1, '#3a4356'));
  push(rect(gx + 1, 100 - 2, 3, 2, C.lime, 'class="led"'));
  push(rect(gx + 1, 175, 3, 2, C.mag, 'class="led led2"'));
}
for (const [sx, sy] of [[395, 30], [22, 231], [395, 231]]) {
  push(rect(sx, sy, 3, 3, '#020305') + rect(sx, sy, 2, 2, '#8c98b0') + rect(sx + 1, sy + 1, 1, 1, '#2b3140'));
}

// twinkling starfield behind the logo
{
  const srand = mulberry32(0x57a7);
  let s = '';
  for (let i = 0; i < 46; i++) {
    const x = 22 + Math.floor(srand() * 376);
    const y = 27 + Math.floor(srand() * 44);
    const big = srand() < 0.18;
    const col = ['#ffffff', C.lime, C.cyan, '#9aa6bd'][Math.floor(srand() * 4)];
    const d = big ? `M${x - 1} ${y}h3v1h-3zM${x} ${y - 1}h1v3h-1z` : `M${x} ${y}h1v1h-1z`;
    s += `<path d="${d}" fill="${col}" class="tw tw${i % 4}"/>`;
  }
  push(s);
  css.push(
    '.tw{opacity:.35;animation:tw 3s ease-in-out infinite}.tw1{animation-duration:2.2s;animation-delay:-.7s}' +
      '.tw2{animation-duration:3.7s;animation-delay:-1.9s}.tw3{animation-duration:2.9s;animation-delay:-2.4s}' +
      '@keyframes tw{0%,100%{opacity:.12}50%{opacity:.9}}',
  );
}

// the neon chaser that runs round the rim
const chaser = polyD(inset(SHAPE, 0.5));
push(`<path d="${chaser}" fill="none" stroke="${C.lime}" stroke-width="1" pathLength="1000" stroke-dasharray="46 454" class="chase" filter="url(#glow)" shape-rendering="auto"/>`);
push(`<path d="${chaser}" fill="none" stroke="${C.mag}" stroke-width="1" pathLength="1000" stroke-dasharray="22 478" stroke-dashoffset="250" class="chase" filter="url(#glow)" shape-rendering="auto"/>`);

// ---------------------------------------------------------------- vinyl badge
// A round socket bolted over the top-left corner: the odd bit of the skin.
{
  const { x, y, r } = DISC;
  let g = `<g transform="translate(${x} ${y})" shape-rendering="auto">`;
  g += `<circle r="${r + 4}" fill="#010203"/><circle r="${r + 3}" fill="${C.hi}"/><circle r="${r + 3}" cx=".8" cy=".8" fill="#0a0d13"/>`;
  g += `<circle r="${r + 2}" fill="url(#face)"/><circle r="${r + 0.5}" fill="#010203"/>`;
  g += `<g class="spin"><circle r="${r}" fill="#0c0e13"/>`;
  for (let gr = 7; gr < r; gr += 1.5) g += `<circle r="${gr}" fill="none" stroke="#1d2230" stroke-width=".5"/>`;
  g += `<circle r="6" fill="${C.mag}"/><circle r="6" fill="none" stroke="#7a0f4a" stroke-width=".6"/>`;
  g += text(t3, 'PPP', -5.5, -2.5, 'fill="#2a0218"');
  g += `<path d="M0 -${r}v4" stroke="${C.lime}" stroke-width="1"/></g>`;
  g += `<circle r="1.2" fill="#dfe6f2"/>`;
  g += `<path d="M-${r - 2} -4A${r - 2} ${r - 2} 0 0 1 -4 -${r - 2}" fill="none" stroke="#fff" stroke-opacity=".22" stroke-width="2.5"/>`;
  g += '</g>';
  push(g);
  css.push(`.spin{animation:spin ${4 * BEAT}s linear infinite}@keyframes spin{to{rotate:360deg}}`);
}

// ---------------------------------------------------------------- title bar
push(rect(52, 11, 316, 11, 'url(#titleBar)'));
push(rect(52, 22, 316, 1, '#020305'));
// tiny dancing-man icon
push(`<path fill="${C.lime}" d="${bitmapPath('#.###.#|.#.#.#.|..###..|...#...|..###..|.#...#.|.#...#.'.split('|'), 56, 13)}"/>`);
push(text(f5, 'dance_vision_keygen.exe', 67, 12, `fill="${C.txt}"`));
push(spans(f5, [['[', C.dim], ['PPP', C.mag], [']', C.dim]], 296, 12));
for (const [bx, glyph] of [[334, '_'], [347, 'x']]) {
  push(raised(bx, 12, 11, 10));
  push(text(t3, glyph === '_' ? '_' : 'X', bx + 4, 14, `fill="${C.txt}"`));
}

// ---------------------------------------------------------------- logo
const LOGO = {
  D: '#####..|######.|##..###|##...##|##...##|##...##|##..###|######.|#####..',
  A: '..###..|.#####.|###.###|##...##|##...##|#######|#######|##...##|##...##',
  N: '##...##|###..##|###..##|####.##|##.####|##..###|##..###|##...##|##...##',
  C: '..#####|.######|###....|##.....|##.....|##.....|###....|.######|..#####',
  E: '#######|#######|##.....|##.....|######.|##.....|##.....|#######|#######',
  V: '##...##|##...##|##...##|##...##|###.###|.##.##.|.#####.|..###..|...#...',
  I: '##|##|##|##|##|##|##|##|##',
  S: '.######|#######|##.....|###....|.#####.|....###|.....##|#######|######.',
  O: '..###..|.#####.|###.###|##...##|##...##|##...##|###.###|.#####.|..###..',
};
const LS = 4; // logical px per logo cell
const SLANT = 1; // px of italic lean per cell row
function buildLogo(words) {
  const out = { runs: [], hi: '', sh: '', width: 0 };
  let cx = 0;
  words.forEach((word, wi) => {
    let d = '';
    for (const ch of word) {
      if (ch === ' ') { cx += 3; continue; }
      const rows = LOGO[ch].split('|');
      const gw = rows[0].length;
      const filled = (r, c) => r >= 0 && r < rows.length && c >= 0 && c < gw && rows[r][c] === '#';
      rows.forEach((row, r) => {
        const sx = SLANT * (rows.length - 1 - r);
        for (let c = 0; c < gw; ) {
          if (!filled(r, c)) { c++; continue; }
          let c2 = c;
          while (filled(r, c2)) c2++;
          const x = (cx + c) * LS + sx;
          const w = (c2 - c) * LS;
          d += `M${x} ${r * LS}h${w}v${LS}h${-w}z`;
          c = c2;
        }
        for (let c = 0; c < gw; c++) {
          if (!filled(r, c)) continue;
          const x = (cx + c) * LS + sx;
          if (!filled(r - 1, c)) out.hi += `M${x} ${r * LS}h${LS}v1h${-LS}z`;
          if (!filled(r + 1, c)) out.sh += `M${x} ${r * LS + LS - 1}h${LS}v1h${-LS}z`;
        }
      });
      cx += gw + 1;
    }
    out.runs[wi] = d;
    if (wi < words.length - 1) cx += 2;
  });
  out.width = (cx - 1) * LS + SLANT * 8;
  return out;
}
const logo = buildLogo(['DANCE', 'VISION']);
const LX = Math.round((W - logo.width) / 2) - 1;
const LY = 30;
const LH = 9 * LS;
const chrome = (stops) =>
  stops.map((c, i) => `<stop offset="${n3(i / stops.length)}" stop-color="${c}"/><stop offset="${n3((i + 1) / stops.length)}" stop-color="${c}"/>`).join('');
const logoDefs =
  `<path id="lgD" d="${logo.runs[0]}"/><path id="lgV" d="${logo.runs[1]}"/>` +
  `<g id="lg"><use href="#lgD"/><use href="#lgV"/></g>` +
  `<linearGradient id="gD" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="${LH}">${chrome(['#ffffff', '#f2f5fb', '#dfe6f1', '#c3cde0', '#6f7c97', '#9fb0d0', '#c3d2ef', '#dce6fb', '#f4f8ff'])}</linearGradient>` +
  `<linearGradient id="gV" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="${LH}">${chrome(['#fbffe0', '#efffa6', '#dcff6a', '#c6ff3d', '#3f8f00', '#6fd400', '#94f51c', '#b8ff45', '#dcff8a'])}</linearGradient>` +
  `<clipPath id="lgClip"><use href="#lgD"/><use href="#lgV"/></clipPath>` +
  `<filter id="lglow" x="-10%" y="-60%" width="120%" height="220%"><feGaussianBlur stdDeviation="4.5"/></filter>`;
{
  let g = `<g transform="translate(${LX} ${LY})">`;
  g += `<use href="#lg" fill="${C.green}" filter="url(#lglow)" class="lglow" opacity=".5" shape-rendering="auto"/>`;
  for (const [dx, dy] of [[-1, 0], [0, -1], [-1, -1], [1, -1], [-1, 1], [5, 4], [4, 5], [5, 5]]) g += `<use href="#lg" fill="#010203" x="${dx}" y="${dy}"/>`;
  const exD = ['#8494b3', '#4b5673', '#2b3246', '#171b27'];
  const exV = ['#5aa800', '#2f6a00', '#1a4200', '#0d2400'];
  for (let k = 4; k >= 1; k--) g += `<use href="#lgD" fill="${exD[k - 1]}" x="${k}" y="${k}"/><use href="#lgV" fill="${exV[k - 1]}" x="${k}" y="${k}"/>`;
  g += `<use href="#lgD" fill="url(#gD)"/><use href="#lgV" fill="url(#gV)"/>`;
  g += `<path d="${logo.hi}" fill="#fff" opacity=".85"/><path d="${logo.sh}" fill="#000" opacity=".22"/>`;
  g += `<g clip-path="url(#lgClip)"><path class="sheen" d="M0 -2h7l-14 ${LH + 4}h-7z" fill="#fff" opacity=".8"/><path class="sheen" d="M11 -2h3l-14 ${LH + 4}h-3z" fill="#fff" opacity=".6"/></g>`;
  g += '</g>';
  push(g);
}

// crack credits under the logo
{
  const line = [
    ['CRACKED BY ', C.dim], ['PERI-PERI POSSE', C.mag], ['  ·  ', C.dim2],
    ['SUPPLIED BY ', C.dim], ['A BLOKE IN DALSTON', C.cyan], ['  ·  ', C.dim2],
    ['PROTECTION: ', C.dim], ['NONE', C.lime],
  ];
  push(spans(t3, line, Math.round((W - lineWidth(t3, line)) / 2), 74));
}

// ---------------------------------------------------------------- now-playing ticker
const MQ = { x: 20, y: 83, w: 380, h: 14 };
push(sunken(MQ.x, MQ.y, MQ.w, MQ.h, C.lcd));
push(rect(MQ.x + 1, MQ.y + 1, 44, MQ.h - 2, C.lime));
push(text(f5, '♪ XM>', MQ.x + 6, MQ.y + 4, `fill="${C.lcd}"`));
const tick =
  '♪ now playing: dance_vision_keygen.xm ♪   4 channels, 1 tracker, 0 regrets   ::   ' +
  'phone in, telly out: not one frame of video leaves your phone, just 33 joints, one per rpm on your nan\'s records   ::   ' +
  'scan the qr, prop the phone against the telly, become a stick figure   ::   ' +
  'greetz to hackney, dalston, shoreditch, the 3am chicken shop and everyone still waiting for the overground   ::   ' +
  'big apologies to the downstairs neighbours   ::   ';
const tickW = [...tick].length * f5.adv;
const TICK_SPEED = 30; // logical px per second
{
  extraDefs.push(text(f5, tick, 0, 0, 'id="tk"'));
  push(
    `<g clip-path="url(#mqClip)" fill="${C.lime}" filter="url(#glow)"><g transform="translate(${MQ.x + 50} ${MQ.y + 3})">` +
      `<g class="mq"><use href="#tk"/><use href="#tk" x="${tickW}"/></g></g></g>`,
  );
  css.push(`.mq{animation:mq ${n2(tickW / TICK_SPEED)}s steps(${tickW}) infinite}@keyframes mq{to{transform:translate(-${tickW}px,0)}}`);
}
push(rect(MQ.x + 1, MQ.y + 1, MQ.w - 2, MQ.h - 2, 'url(#scan)', 'shape-rendering="auto"'));

// ---------------------------------------------------------------- NAME / SERIAL
const FX = 68;
const FW = 188;
const NAME_Y = 102;
const SER_Y = 121;
push(text(f5, 'NAME:', 22, NAME_Y + 4, `fill="${C.dim}"`));
push(text(f5, 'SERIAL:', 22, SER_Y + 4, `fill="${C.dim}"`));
push(sunken(FX, NAME_Y, FW, 14));
push(sunken(FX, SER_Y, FW, 14));
const NAME = 'your phone + a telly';
push(text(f5, NAME, FX + 4, NAME_Y + 3, `fill="${C.txt}"`));
push(rect(FX + 4 + [...NAME].length * 6, NAME_Y + 3, 5, 8, C.lime, 'class="caret"'));
css.push('.caret{animation:blink 1s step-end infinite}@keyframes blink{50%{opacity:0}}');

// The serial generator. Four phases of 5 s each, one serial per phase.
const PHASE = 5;
const SERIALS = ['33-JOINTS-0-PIXELS', 'NO-APP-NO-ACCOUNT', 'PHONE-RELAY-TELLY', '3AM-CHICKEN-SHOP-DISCO'];
const STATUS = [
  ['33 joints a frame. 0 pixels uploaded.', C.lime],
  ['runs in the phone browser. no app, no signup.', C.lime],
  ['joints ride a websocket relay, ~1.6 KB a frame.', C.lime],
  ['6 east london venues unlocked. mind the gyrate.', C.lime],
];
const LOOP = PHASE * SERIALS.length;
const T_CLICK = 1.0;
const T_SCRAMBLE = 1.1;
const T_SETTLE0 = 1.45;
const T_STEP = 0.055;
const T_DONE = T_SETTLE0 + T_STEP * 22 + 0.1;
const SCRAMBLE_K = 6;
const SCRAMBLE_DT = 0.06;
const SCRAMBLE_CHARS = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ#$%&*+=?@';
const maxLen = Math.max(...SERIALS.map((s) => s.length));
// Every phase-timed element runs OFFSET seconds ahead, so the first thing a
// visitor sees is serial #1 already cracked, then the next one generating.
const OFFSET = 3;
for (let i = 0; i < maxLen; i++) {
  const settle = T_SETTLE0 + i * T_STEP;
  // junk for position i: one gate with a window in every phase long enough to reach it
  const junkEvents = [[0, 'opacity:0']];
  SERIALS.forEach((serial, p) => {
    if (i < serial.length) junkEvents.push([p * PHASE + T_SCRAMBLE, 'opacity:1'], [p * PHASE + settle, 'opacity:0']);
  });
  stepKF(`g${i}`, LOOP, junkEvents);
  stepKF(`s${i}`, LOOP, [
    [0, 'opacity:0'],
    [settle, `opacity:1;fill:#fff`],
    [settle + 0.16, `opacity:1;fill:${C.lime}`],
    [PHASE + T_SCRAMBLE, 'opacity:0'],
  ]);
  css.push(`.g${i}{animation:g${i} ${LOOP}s step-end infinite}.s${i}{animation:s${i} ${LOOP}s step-end infinite}`);
}
css.push(`.jm{animation:jm ${n2(SCRAMBLE_K * SCRAMBLE_DT)}s steps(${SCRAMBLE_K}) infinite}@keyframes jm{to{translate:0 -${SCRAMBLE_K * 10}px}}`);
css.push('.S use,.J{opacity:0}.S .p0{opacity:1}');
for (let p = 0; p < SERIALS.length; p++) css.push(`.p${p}{animation-delay:${-((LOOP - p * PHASE + OFFSET) % LOOP)}s}`);
{
  const at = `transform="translate(${FX + 4} ${SER_Y + 3})"`;
  let junk = `<svg x="${FX + 4}" y="${SER_Y + 3}" width="${maxLen * 6}" height="9"><g fill="${C.cyan}" class="jm">`;
  for (let i = 0; i < maxLen; i++) {
    const x = i * 6;
    junk += `<g class="J g${i} p0">`;
    for (let k = 0; k < SCRAMBLE_K; k++) {
      const r = SCRAMBLE_CHARS[Math.floor(rand() * SCRAMBLE_CHARS.length)];
      junk += `<use href="#${f5.id(r)}"${x ? ` x="${x}"` : ''}${k ? ` y="${k * 10}"` : ''}/>`;
    }
    junk += '</g>';
  }
  push(`${junk}</g></svg>`);
  let good = `<g ${at} fill="${C.lime}" class="S">`;
  SERIALS.forEach((serial, p) => {
    [...serial].forEach((ch, i) => {
      if (ch !== ' ') good += `<use href="#${f5.id(ch)}" class="s${i} p${p}"${i ? ` x="${i * 6}"` : ''}/>`;
    });
  });
  push(`${good}</g>`);
}

// ---------------------------------------------------------------- buttons + cursor
const BY = 142;
const BH = 17;
const buttons = [['GENERATE', C.lime], ['ABOUT', C.txt], ['EXIT', C.txt]];
const bw = buttons.map(([l]) => f5.width(l) + 16);
let bx = Math.round(20 + (236 - (bw.reduce((a, b) => a + b, 0) + 8 * 2)) / 2);
const btnPos = [];
buttons.forEach(([label, col], i) => {
  push(raised(bx, BY, bw[i], BH));
  push(text(f5, label, bx + 8, BY + 5, `fill="${col}"`));
  btnPos.push(bx);
  bx += bw[i] + 8;
});
{
  // GENERATE pressed state (shown briefly at every click)
  const x = btnPos[0];
  const w = bw[0];
  push(
    `<g class="press">${rect(x, BY, w, BH, '#010203')}${rect(x + 1, BY + 1, w - 2, BH - 2, '#0b0e14')}` +
      `${rect(x + 2, BY + 2, w - 3, BH - 3, '#4b5670')}${rect(x + 2, BY + 2, w - 4, BH - 4, 'url(#btnDown)')}` +
      `${text(f5, 'GENERATE', x + 9, BY + 6, `fill="${C.limeHot}"`)}</g>`,
  );
  stepKF('press', PHASE, [[0, 'opacity:0'], [T_CLICK, 'opacity:1'], [T_CLICK + 0.22, 'opacity:0']]);
  css.push(`.press{opacity:0;animation:press ${PHASE}s step-end infinite -${OFFSET}s}`);
}

// ---------------------------------------------------------------- spectrum analyser
const SP = { x: 264, y: 102, w: 136, h: 57 };
push(sunken(SP.x, SP.y, SP.w, SP.h, '#04060a'));
const BARS = 22;
const BAR_W = 5;
const BAR_TOP = SP.y + 4;
const SEGS = 15;
const BAR_H = SEGS * 3;
const bar0 = SP.x + Math.round((SP.w - (BARS * 6 - 1)) / 2);
{
  // lit colour bands under everything, one rect per band across all bars
  const band = (seg) => (seg >= 13 ? C.mag : seg >= 10 ? C.amber : seg >= 5 ? C.lime : C.green);
  for (let s = 0; s < SEGS; s++) {
    const y = BAR_TOP + BAR_H - (s + 1) * 3;
    push(rect(bar0, y, BARS * 6 - 1, 3, band(s)));
  }
  // per-bar covers (unlit LEDs) that scale down from the top, then peak caps
  const STEPS = 16;
  const DT = (4 * BEAT) / STEPS;
  const LOOP_S = STEPS * DT;
  const arp = [0, 3, 7, 12, 7, 3, 10, 5];
  const caps = [];
  for (let b = 0; b < BARS; b++) {
    const kind = b < 4 ? 'bass' : b < 16 ? 'mid' : 'hat';
    const lv = [];
    for (let s = 0; s < STEPS; s++) {
      let a;
      if (kind === 'bass') {
        a = s % 4 === 0 ? 1 - b * 0.03 : s % 4 === 2 ? 0.62 : 0.34;
        a += (rand() - 0.5) * 0.08;
      } else if (kind === 'mid') {
        const note = 4 + arp[s % arp.length] * 0.9;
        const dist = Math.abs(b - note);
        a = 0.26 + Math.max(0, 0.7 - dist * 0.15) + (s === 4 || s === 12 ? 0.28 : 0) + rand() * 0.18;
      } else {
        a = (s % 2 === 1 ? 0.62 : 0.28) - (b - 16) * 0.035 + rand() * 0.16;
      }
      lv.push(Math.min(1, Math.max(0.07, a)));
    }
    const decay = kind === 'bass' ? 0.45 : kind === 'mid' ? 0.62 : 0.4;
    // level at time t within the loop
    const levelAt = (t) => {
      const s = Math.floor(t / DT) % STEPS;
      const u = (t - s * DT) / DT;
      if (u < 0.8) return lv[s] + (lv[s] * decay - lv[s]) * (u / 0.8);
      const nxt = lv[(s + 1) % STEPS];
      return lv[s] * decay + (nxt - lv[s] * decay) * ((u - 0.8) / 0.2);
    };
    // Real LED analysers light whole segments, so levels are quantised to
    // segments and sampled on a 24 Hz grid with step-end (no half-lit LEDs).
    // Individual transform properties (scale/translate) keep the keyframes short.
    // The cover rect is the unlit part of the bar, so it scales from the top.
    const seg = (v) => Math.max(1, Math.min(SEGS, Math.round(v * SEGS)));
    const cover = (n) => String(n3(1 - n / SEGS)).replace(/^0\./, '.');
    // peaks: hold 0.15 s then fall a segment at a time; simulate three loops so the last one is periodic
    const fine = STEPS * 12;
    let peak = 0;
    let held = 0;
    const lit = [];
    const peaks = [];
    for (let loop = 0; loop < 3; loop++) {
      for (let i = 0; i < fine; i++) {
        const l = levelAt((i / fine) * LOOP_S);
        if (l >= peak) { peak = l; held = 0; } else if ((held += LOOP_S / fine) > 0.15) peak = Math.max(l, peak - (1.2 * LOOP_S) / fine);
        if (loop === 2) { lit.push(seg(l)); peaks.push(seg(peak)); }
      }
    }
    // the peak cap is a white LED sitting on segment `p` (1 = bottom)
    const capY = (p) => (SEGS - p) * 3;
    const SUB = 3; // samples per sixteenth
    let kf = '';
    let pk = '';
    let lastB = null;
    let lastK = null;
    for (let i = 0; i < STEPS * SUB; i++) {
      const j = (i * fine) / (STEPS * SUB);
      const at = `${n2((i / (STEPS * SUB)) * 100)}%`;
      const bv = cover(lit[j]);
      const kv = capY(peaks[j]);
      if (bv !== lastB) { kf += `${at}{scale:1 ${bv}}`; lastB = bv; }
      if (kv !== lastK) { pk += `${at}{translate:0 ${kv}px}`; lastK = kv; }
    }
    kf += `100%{scale:1 ${cover(lit[0])}}`;
    pk += `100%{translate:0 ${capY(peaks[0])}px}`;
    const still = seg(0.25 + 0.5 * lv[0]);
    css.push(
      `@keyframes b${b}{${kf}}.b${b}{scale:1 ${cover(still)};animation:b${b} ${LOOP_S}s step-end infinite}` +
        `@keyframes k${b}{${pk}}.k${b}{translate:0 ${capY(Math.min(SEGS, still + 1))}px;animation:k${b} ${LOOP_S}s step-end infinite}`,
    );
    const x = bar0 + b * 6;
    push(`<g transform="translate(${x} ${BAR_TOP})"><rect class="b${b}" width="${BAR_W}" height="${BAR_H}" fill="#121822"/></g>`);
    caps.push(`<g transform="translate(${x} ${BAR_TOP})"><rect class="k${b}" width="${BAR_W}" height="2"/></g>`);
  }
  // segment gaps and bar gutters drawn on top
  let d = '';
  for (let s = 1; s <= SEGS; s++) d += `M${bar0} ${BAR_TOP + s * 3 - 1}h${BARS * 6 - 1}v1h${-(BARS * 6 - 1)}z`;
  for (let b = 1; b < BARS; b++) d += `M${bar0 + b * 6 - 1} ${BAR_TOP}h1v${BAR_H}h-1z`;
  push(`<path fill="#04060a" d="${d}"/>`);
  push(`<g fill="#f4f7ff">${caps.join('')}</g>`);
  push(spans(t3, [['BASS', C.label]], bar0, BAR_TOP + BAR_H + 2));
  push(spans(t3, [['CH 1-4 · 120 BPM', C.label]], bar0 + Math.round((BARS * 6 - 1 - t3.width('CH 1-4 · 120 BPM')) / 2), BAR_TOP + BAR_H + 2));
  push(spans(t3, [['HATS', C.label]], bar0 + BARS * 6 - 1 - t3.width('HATS'), BAR_TOP + BAR_H + 2));
  push(rect(SP.x + 1, SP.y + 1, SP.w - 2, SP.h - 2, 'url(#scan)', 'shape-rendering="auto"'));
}

// ---------------------------------------------------------------- phone -> relay -> telly
const FL = { x: 20, y: 165, w: 380, h: 44 };
push(sunken(FL.x, FL.y, FL.w, FL.h, '#05070b'));

// stick-figure dancer sprites, rasterised from joint poses (the app's own trick)
const FIG_W = 15;
const FIG_H = 19;
const POSES = {
  star: { H: [7, 2], N: [7, 4], P: [7, 10], lE: [4, 2], lW: [2, 0], rE: [10, 2], rW: [12, 0], lK: [5, 14], lA: [3, 18], rK: [9, 14], rA: [11, 18] },
  point: { H: [8, 3], N: [7, 5], P: [6, 11], lE: [4, 8], lW: [6, 10], rE: [10, 3], rW: [13, 0], lK: [5, 15], lA: [5, 18], rK: [9, 14], rA: [10, 18] },
  plane: { H: [7, 3], N: [7, 5], P: [7, 11], lE: [4, 5], lW: [1, 4], rE: [10, 5], rW: [13, 4], lK: [6, 15], lA: [6, 18], rK: [10, 12], rA: [9, 16] },
  squat: { H: [7, 5], N: [7, 7], P: [7, 12], lE: [4, 8], lW: [4, 5], rE: [10, 8], rW: [10, 5], lK: [4, 15], lA: [3, 18], rK: [10, 15], rA: [11, 18] },
  clap: { H: [7, 3], N: [7, 5], P: [7, 11], lE: [5, 2], lW: [7, 0], rE: [9, 2], rW: [7, 0], lK: [6, 15], lA: [5, 18], rK: [8, 15], rA: [9, 18] },
  swing: { H: [8, 3], N: [8, 5], P: [8, 11], lE: [6, 8], lW: [4, 11], rE: [11, 7], rW: [13, 9], lK: [6, 14], lA: [5, 18], rK: [10, 15], rA: [12, 18] },
};
const mirror = (p) => Object.fromEntries(Object.entries(p).map(([k, [x, y]]) => [k.replace(/^l/, '#').replace(/^r/, 'l').replace(/^#/, 'r'), [FIG_W - 1 - x, y]]));
const ROUTINE = [POSES.star, POSES.plane, POSES.point, mirror(POSES.point), POSES.squat, POSES.clap, POSES.swing, mirror(POSES.swing)];
const FRAMES_PER_BEAT = 4;
const DANCE_FRAMES = ROUTINE.length * FRAMES_PER_BEAT;
const DANCE_LOOP = ROUTINE.length * BEAT;
function raster(pose) {
  const px = new Set();
  const put = (x, y) => { if (x >= 0 && x < FIG_W && y >= 0 && y < FIG_H) px.add(`${x},${y}`); };
  const line = ([x0, y0], [x1, y1]) => {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0); const sx = x0 < x1 ? 1 : -1;
    const dy = -Math.abs(y1 - y0); const sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    for (;;) {
      put(x0, y0);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
  };
  const [hx, hy] = pose.H.map(Math.round);
  for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) put(hx + dx, hy + dy);
  line(pose.N, pose.P);
  line(pose.N, pose.lE); line(pose.lE, pose.lW);
  line(pose.N, pose.rE); line(pose.rE, pose.rW);
  line(pose.P, pose.lK); line(pose.lK, pose.lA);
  line(pose.P, pose.rK); line(pose.rK, pose.rA);
  return px;
}
const lerpPose = (a, b, t) => Object.fromEntries(Object.keys(a).map((k) => [k, [a[k][0] + (b[k][0] - a[k][0]) * t, a[k][1] + (b[k][1] - a[k][1]) * t]]));
const bob = (p, dy) => Object.fromEntries(Object.entries(p).map(([k, [x, y]]) => [k, [x, /A$/.test(k) ? y : y + dy]]));
let danceDefs = '';
for (let f = 0; f < DANCE_FRAMES; f++) {
  const beat = Math.floor(f / FRAMES_PER_BEAT);
  const sub = f % FRAMES_PER_BEAT;
  const a = ROUTINE[beat];
  const b = ROUTINE[(beat + 1) % ROUTINE.length];
  const pose = sub === 0 ? bob(a, 1) : sub === 1 ? a : lerpPose(a, b, sub === 2 ? 0.35 : 0.78);
  danceDefs += `<path id="d${f}" d="${pixelsPath(raster(pose))}"/>`;
}
// One sprite strip (all frames side by side) per dancer, stepped through a
// clipping window: a single animation per dancer instead of one per frame.
const frameDur = DANCE_LOOP / DANCE_FRAMES;
const STRIP = FIG_W + 1;
let strip = '';
for (let f = 0; f < DANCE_FRAMES; f++) strip += `<use href="#d${f}"${f ? ` x="${f * STRIP}"` : ''}/>`;
extraDefs.push(`<g id="strip">${strip}</g>`);
css.push(`.ds{animation:ds ${DANCE_LOOP}s steps(${DANCE_FRAMES}) infinite}@keyframes ds{to{translate:-${DANCE_FRAMES * STRIP}px 0}}`);
for (let lag = 1; lag <= 2; lag++) css.push(`.ds${lag}{animation-delay:${n3(-(DANCE_LOOP - lag * frameDur))}s}`);
function dancer(x, y, fill, lag = 0) {
  return `<svg x="${x}" y="${y}" width="${FIG_W}" height="${FIG_H}"><use href="#strip" fill="${fill}" class="ds${lag ? ` ds${lag}` : ''}"/></svg>`;
}

{
  // phone
  const px = 30;
  const py = 168;
  push(rect(px, py, 22, 38, '#010203') + rect(px + 1, py + 1, 20, 36, '#3a4254') + rect(px + 2, py + 2, 18, 34, '#161a23'));
  push(rect(px + 3, py + 5, 16, 26, '#0a1406'));
  push(rect(px + 9, py + 3, 4, 1, '#566074') + rect(px + 10, py + 33, 2, 2, '#566074'));
  push(dancer(px + 3, py + 8, C.lime, 0));
  push(rect(px + 3, py + 5, 16, 26, 'url(#scan)', 'shape-rendering="auto"'));

  // track 1: phone -> relay
  const trackY = 186;
  const packets = (x0, x1, col, cls) => {
    let dots = '';
    for (let x = x0; x <= x1; x += 2) dots += `M${x} ${trackY}h1v1h-1z`;
    let pk = '';
    for (let x = x0 - 12; x <= x1 + 12; x += 12) pk += `M${x} ${trackY - 1}h3v3h-3z`;
    return `<path fill="#2c3342" d="${dots}"/><g clip-path="url(#${cls}Clip)"><path class="pk" fill="${col}" filter="url(#glow)" d="${pk}"/></g>`;
  };
  push(packets(58, 150, C.lime, 't1'));
  css.push('.pk{animation:pk .5s steps(12) infinite}@keyframes pk{to{transform:translate(12px,0)}}');
  push(spans(t3, [['33 JOINTS ', C.txt], ['{XYZ}', C.lime]], 60, 176));
  push(spans(t3, [['VIDEO SENT: ', C.dim], ['0 BYTES', C.mag]], 60, 193));
  push(`<path fill="${C.lime}" d="M151 183h1v7h-1zM152 184h1v5h-1zM153 185h1v3h-1zM154 186h1v1h-1z"/>`);

  // relay box
  const rx = 158;
  push(raised(rx, 175, 38, 22));
  push(text(t3, 'RELAY', rx + 9, 179, `fill="${C.dim}"`));
  push(text(f5, 'ws', rx + 13, 185, `fill="${C.txt}"`));
  push(rect(rx + 4, 179, 2, 2, C.lime, 'class="led"') + rect(rx + 32, 179, 2, 2, C.mag, 'class="led led2"'));

  // track 2: relay -> telly
  push(packets(200, 280, C.cyan, 't2'));
  push(spans(t3, [['1.6 KB', C.txt], ['/FRAME', C.dim]], 202, 176));
  push(spans(t3, [['WEBSOCKET', C.dim]], 202, 193));
  push(`<path fill="${C.cyan}" d="M281 183h1v7h-1zM282 184h1v5h-1zM283 185h1v3h-1zM284 186h1v1h-1z"/>`);

  // the telly, with the crew
  const tx = 290;
  const ty = 172;
  push(`<path fill="#8793a8" d="M${tx + 24} ${ty - 1}h1v1h-1zM${tx + 23} ${ty - 3}h1v2h-1zM${tx + 22} ${ty - 5}h1v2h-1zM${tx + 36} ${ty - 1}h1v1h-1zM${tx + 37} ${ty - 3}h1v2h-1zM${tx + 38} ${ty - 5}h1v2h-1z"/>`);
  push(raised(tx, ty, 62, 32, 'url(#btn)'));
  push(rect(tx + 4, ty + 3, 54, 26, '#030509'));
  push(rect(tx + 5, ty + 4, 52, 24, 'url(#tv)'));
  push(dancer(tx + 6, ty + 7, C.mag, 1) + dancer(tx + 23, ty + 7, '#ffffff', 0) + dancer(tx + 40, ty + 7, C.cyan, 2));
  push(rect(tx + 5, ty + 4, 52, 24, 'url(#scan)', 'shape-rendering="auto"'));
  push(rect(tx + 14, ty + 32, 4, 2, '#2b3140') + rect(tx + 44, ty + 32, 4, 2, '#2b3140'));

  push(spans(t3, [['STUDIO', C.txt]], 358, 172));
  push(spans(t3, [['THREE.JS', C.dim]], 358, 180));
  push(spans(t3, [['UP TO 6', C.dim]], 358, 188));
  push(spans(t3, [['PHONES', C.dim]], 358, 196));
}

// ---------------------------------------------------------------- status bar
const ST = { x: 20, y: 214, w: 380, h: 14 };
push(sunken(ST.x, ST.y, ST.w, ST.h, '#05070b'));
push(text(f5, 'STATUS>', ST.x + 4, ST.y + 3, `fill="${C.dim}"`));
{
  const sx = ST.x + 4 + 8 * 6;
  push(`<g class="stg">${text(f5, 'generating... do not unplug the telly', sx, ST.y + 3, `fill="${C.amber}"`)}</g>`);
  stepKF('stg', PHASE, [[0, 'opacity:0'], [T_SCRAMBLE, 'opacity:1'], [T_DONE, 'opacity:0']]);
  stepKF('st', LOOP, [[0, 'opacity:0'], [T_DONE, 'opacity:1'], [PHASE + T_SCRAMBLE, 'opacity:0']]);
  css.push(`.stg{opacity:0;animation:stg ${PHASE}s step-end infinite -${OFFSET}s}.st{opacity:0;animation:st ${LOOP}s step-end infinite}.st.p0{opacity:1}`);
  STATUS.forEach(([msg, col], p) => push(`<g class="st p${p}">${text(f5, `OK: ${msg}`, sx, ST.y + 3, `fill="${col}"`)}</g>`));
}

// chin
{
  const s = [['DANCE LIKE THE NEIGHBOURS ARE OUT', C.dim]];
  push(spans(t3, s, Math.round((W - lineWidth(t3, s)) / 2), 240));
}

// ---------------------------------------------------------------- mouse cursor
{
  const target = [btnPos[0] + Math.round(bw[0] / 2) + 2, BY + 9];
  const rest = [240, 136];
  const ARROW = [
    '#.........', '##........', '#o#.......', '#oo#......', '#ooo#.....', '#oooo#....', '#ooooo#...',
    '#oooooo#..', '#ooooooo#.', '#oooo####', '#oo#o#....', '#o#.#o#...', '##..#o#...', '.....#o#..', '.....###..',
  ];
  const black = ARROW.map((r) => r.replace(/o/g, '.'));
  const white = ARROW.map((r) => r.replace(/#/g, '.').replace(/o/g, '#'));
  const dx = target[0] - rest[0];
  const dy = target[1] - rest[1];
  push(
    `<g transform="translate(${rest[0]} ${rest[1]})"><g class="cur">` +
      `<path fill="#010203" d="${bitmapPath(black)}"/><path fill="#fff" d="${bitmapPath(white)}"/></g></g>`,
  );
  const ease = 'animation-timing-function:cubic-bezier(.5,0,.2,1)';
  css.push(
    `@keyframes cur{0%{transform:translate(0,0);${ease}}8%{transform:translate(0,0);${ease}}` +
      `${pct(T_CLICK - 0.12, PHASE)}{transform:translate(${dx}px,${dy}px)}` +
      `${pct(T_CLICK, PHASE)}{transform:translate(${dx + 1}px,${dy + 1}px)}` +
      `${pct(T_CLICK + 0.2, PHASE)}{transform:translate(${dx}px,${dy}px);${ease}}` +
      `${pct(2.6, PHASE)}{transform:translate(${dx}px,${dy}px);${ease}}` +
      `${pct(3.6, PHASE)}{transform:translate(-6px,-10px);${ease}}` +
      `${pct(4.4, PHASE)}{transform:translate(0,0)}100%{transform:translate(0,0)}}` +
      `.cur{animation:cur ${PHASE}s linear infinite -${OFFSET}s}`,
  );
}

// ---------------------------------------------------------------- remaining CSS
css.push(
  '.chase{animation:chase 6s linear infinite}@keyframes chase{to{stroke-dashoffset:-500}}',
  `.sheen{transform:translate(-40px,0);animation:sheen 7s linear infinite}@keyframes sheen{0%{transform:translate(-40px,0)}22%{transform:translate(${logo.width + 80}px,0)}100%{transform:translate(${logo.width + 80}px,0)}}`,
  '.lglow{animation:lglow 4s ease-in-out infinite}@keyframes lglow{0%,100%{opacity:.45}50%{opacity:.85}}',
  `.led{animation:led ${BEAT}s ease-out infinite}.led2{animation-delay:-${BEAT / 2}s}@keyframes led{0%{opacity:1}100%{opacity:.25}}`,
);
// delay-only rules go last so they win over the animation shorthands above
const frameDelays = css.filter((r) => /^\.ds\d\{animation-delay/.test(r));
const phaseDelays = css.filter((r) => /^\.p\d\{animation-delay/.test(r));
const rest = css.filter((r) => !frameDelays.includes(r) && !phaseDelays.includes(r));
const style =
  rest.join('') +
  frameDelays.join('') +
  phaseDelays.join('') +
  '@media (prefers-reduced-motion:reduce){*{animation:none!important}.cur{display:none}}';

// ---------------------------------------------------------------- defs + assemble
const defs =
  `<linearGradient id="face" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2c3447"/><stop offset=".35" stop-color="#1c2130"/><stop offset="1" stop-color="#0e1118"/></linearGradient>` +
  `<linearGradient id="gloss" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".09"/><stop offset=".3" stop-color="#fff" stop-opacity=".03"/><stop offset=".3" stop-color="#fff" stop-opacity="0"/></linearGradient>` +
  `<linearGradient id="titleBar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a4560"/><stop offset=".5" stop-color="#232a3b"/><stop offset="1" stop-color="#161a25"/></linearGradient>` +
  `<linearGradient id="btn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b4459"/><stop offset=".5" stop-color="#262c3b"/><stop offset="1" stop-color="#1a1e29"/></linearGradient>` +
  `<linearGradient id="btnDown" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1d3a06"/><stop offset="1" stop-color="#2f5c08"/></linearGradient>` +
  `<radialGradient id="tv" cx=".5" cy=".45" r=".7"><stop offset="0" stop-color="#1a2440"/><stop offset="1" stop-color="#070a12"/></radialGradient>` +
  `<pattern id="carbon" width="4" height="4" patternUnits="userSpaceOnUse"><path fill="#000" opacity=".35" d="M0 0h2v2H0zM2 2h2v2H2z"/><path fill="#fff" opacity=".025" d="M2 0h2v2H2zM0 2h2v2H0z"/></pattern>` +
  `<pattern id="scan" width="4" height="1" patternUnits="userSpaceOnUse"><rect width="4" height=".5" y=".5" fill="#000" opacity=".3"/></pattern>` +
  `<filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.1" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>` +
  `<filter id="soft" x="-5%" y="-5%" width="110%" height="115%"><feGaussianBlur stdDeviation="3"/></filter>` +
  `<clipPath id="bodyClip"><path d="${polyD(inset(SHAPE, 1))}"/></clipPath>` +
  `<clipPath id="mqClip"><rect x="${MQ.x + 46}" y="${MQ.y + 1}" width="${MQ.w - 47}" height="${MQ.h - 2}"/></clipPath>` +
  `<clipPath id="t1Clip"><rect x="58" y="180" width="93" height="12"/></clipPath>` +
  `<clipPath id="t2Clip"><rect x="200" y="180" width="81" height="12"/></clipPath>` +
  extraDefs.join('') +
  logoDefs +
  danceDefs +
  f5.defs() +
  t3.defs();

const svg =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W * 2}" height="${H * 2}" shape-rendering="crispEdges">` +
  `<title>Dance Vision keygen by the (fictional) PERi-PERi POSSE</title>` +
  `<style>${style}</style><defs>${defs}</defs>${parts.join('')}</svg>\n`;

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, svg);
console.log(`wrote ${OUT} (${(svg.length / 1024).toFixed(1)} KB)`);
