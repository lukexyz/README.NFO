#!/usr/bin/env node
// ULTRA-SATISFACTORY README header: "Keygen Dialog" (03-keygen-dialog_opus_5.5).
// Plain Node, no dependencies, fully deterministic (seeded PRNG).
//   node examples/ultra-satisfactory/src/03-keygen-dialog_opus_5.5.mjs
// writes examples/ultra-satisfactory/assets/03-keygen-dialog_opus_5.5.svg
//
// A mid-2000s skinned keygen window that generates RECIPES, not keys.
// Everything is drawn in "logical pixels" (viewBox 420 x 268, shown at 2x).
// Text is pixel-font glyphs drawn as merged-run <path>s reused with <use>:
// no <text>, no web fonts, nothing external. Animation is CSS only, so
// prefers-reduced-motion can switch it all off and leave a sensible still.
//
// Every recipe below was checked against the app's own data loader
// (ultra_satisfactory.data.get_item_recipe) before it was typed in here.

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(here, '../assets/03-keygen-dialog_opus_5.5.svg');

// ---------------------------------------------------------------- basics
const W = 420;
const H = 268;
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
const rand = mulberry32(0xfac70);
const n2 = (v) => +v.toFixed(2);
const n3 = (v) => +v.toFixed(3);
const pct = (t, T) => `${n3((t / T) * 100)}%`;

// The app's own palette: black, neon cyan, white, gold, and the three tab colours.
const C = {
  cyan: '#00cfff',
  cyanHot: '#b5f1ff',
  gold: '#e8d44d',
  goldHot: '#fff6b0',
  purple: '#a855f7',
  pink: '#ec4899',
  blue: '#38bdf8',
  txt: '#e9ecf2',
  dim: '#8c93a1',
  dim2: '#555b68',
  label: '#70778a',
  recess: '#030405',
  lcd: '#02090c',
  hi: '#6a7280',
  lo: '#010102',
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
  '!': '..#..|..#..|..#..|..#..|..#..|.....|..#..',
  '?': '.###.|#...#|....#|...#.|..#..|.....|..#..',
  '-': '.....|.....|.....|.###.|.....|.....|.....',
  _: '.....|.....|.....|.....|.....|.....|.....|#####',
  '=': '.....|.....|#####|.....|#####|.....|.....',
  '+': '.....|..#..|..#..|#####|..#..|..#..|.....',
  '/': '....#|....#|...#.|..#..|.#...|#....|#....',
  '(': '...#.|..#..|.#...|.#...|.#...|..#..|...#.',
  ')': '.#...|..#..|...#.|...#.|...#.|..#..|.#...',
  '[': '.###.|.#...|.#...|.#...|.#...|.#...|.###.',
  ']': '.###.|...#.|...#.|...#.|...#.|...#.|.###.',
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
  '♪': '..#..|..##.|..#.#|..#..|.##..|###..|.#...',
  '·': '.....|.....|.....|..#..|.....|.....|.....',
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
  ')': '.#.|..#|..#|..#|.#.', '!': '.#.|.#.|.#.|...|.#.', '?': '##.|..#|.#.|...|.#.',
  '>': '#..|.#.|..#|.#.|#..', '<': '..#|.#.|#..|.#.|..#', '=': '...|###|...|###|...',
  "'": '.#.|.#.|...|...|...', _: '...|...|...|...|###', '·': '...|...|.#.|...|...',
  '%': '#.#|..#|.#.|#..|#.#', '&': '.#.|#.#|.#.|#.#|.##',
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

// Multi-colour pixel sprite: rows of palette characters, one merged path per colour.
function sprite(rows, pal, ox = 0, oy = 0) {
  const w = rows[0].length;
  rows.forEach((r, i) => { if (r.length !== w) throw new Error(`sprite row ${i} is ${r.length} wide, expected ${w}`); });
  let s = '';
  for (const [ch, col] of Object.entries(pal)) {
    const d = bitmapPath(rows.map((r) => [...r].map((c) => (c === ch ? '#' : '.')).join('')), ox, oy);
    if (d) s += `<path fill="${col}" d="${d}"/>`;
  }
  return s;
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
const centred = (font, parts, cx, y) => spans(font, parts, Math.round(cx - lineWidth(font, parts) / 2), y);

// ---------------------------------------------------------------- CSS helpers
const css = [];
const delayCss = []; // delay-only rules, emitted last so they win over the shorthands
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
    `<path fill="#3b414d" d="M${x + 1} ${y + h - 1}h${w - 1}v1h${-(w - 1)}zM${x + w - 1} ${y + 1}h1v${h - 1}h-1z"/>` +
    rect(x + 1, y + 1, w - 2, h - 2, fill)
  );
}
// Raised bevel: black outline, light top/left, dark bottom/right, gradient face.
function raised(x, y, w, h, face = 'url(#btn)', hi = C.hi, lo = '#08090c') {
  return (
    rect(x, y, w, h, '#010102') +
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
const hexPts = (r, cx = 0, cy = 0) =>
  Array.from({ length: 6 }, (_, k) => {
    const a = ((-90 + 60 * k) * Math.PI) / 180;
    return [n2(cx + r * Math.cos(a)), n2(cy + r * Math.sin(a))];
  });

// ---------------------------------------------------------------- window silhouette
// Title tab on top, hazard-striped fins on both sides, a chin at the bottom,
// and a hexagonal emblem socket bolted over the top-left corner.
const SHAPE = [
  [22, 24], [50, 24], [66, 8], [370, 8], [386, 24], [398, 24], [406, 32],
  [406, 96], [414, 104], [414, 166], [406, 174], [406, 240], [398, 248],
  [318, 248], [310, 256], [110, 256], [102, 248], [22, 248], [14, 240],
  [14, 174], [6, 166], [6, 104], [14, 96], [14, 32],
];
const HEX = { x: 25, y: 25, r: 16 };

const parts = [];
const push = (s) => parts.push(s);
const extraDefs = [];

// drop shadow + body
push(
  `<g fill="#000" opacity=".5" transform="translate(3 4)" filter="url(#soft)"><path d="${polyD(SHAPE)}"/>` +
    `<path d="${polyD(hexPts(HEX.r + 4, HEX.x, HEX.y))}"/></g>`,
);
push(`<path d="${polyD(SHAPE)}" fill="#010102"/>`);
push(`<path d="${polyD(inset(SHAPE, 1))}" fill="${C.hi}"/>`);
push(`<path d="${polyD(inset(SHAPE, 1))}" fill="#060709" transform="translate(1 1)" clip-path="url(#bodyClip)"/>`);
push(`<path d="${polyD(inset(SHAPE, 2))}" fill="url(#face)"/>`);
push(`<path d="${polyD(inset(SHAPE, 2))}" fill="url(#plate)" opacity=".6"/>`);
push(`<path d="${polyD(inset(SHAPE, 2))}" fill="url(#gloss)"/>`);

// fins: hazard stripes and beat LEDs on the left, the three tab lamps on the right
{
  push(sunken(8, 110, 5, 50, '#0a0a08'));
  push(rect(9, 111, 3, 48, 'url(#hz)', 'shape-rendering="auto"'));
  push(rect(9, 105, 3, 2, C.cyan, 'class="led"') + rect(9, 163, 3, 2, C.gold, 'class="led led2"'));
  push(sunken(407, 110, 5, 50, '#0a0a08'));
  push(rect(408, 111, 3, 48, 'url(#hz)', 'shape-rendering="auto"'));
  push(rect(408, 105, 3, 2, C.gold, 'class="led led2"') + rect(408, 163, 3, 2, C.cyan, 'class="led"'));
}
for (const [sx, sy] of [[20, 241], [397, 241], [18, 66], [399, 66]]) {
  push(rect(sx, sy, 3, 3, '#010102') + rect(sx, sy, 2, 2, '#8c93a1') + rect(sx + 1, sy + 1, 1, 1, '#2a2e36'));
}

// blueprint grid and welding sparks behind the logo
push(rect(18, 27, 384, 40, 'url(#grid)'));
{
  const srand = mulberry32(0x5fa2c);
  let s = '';
  for (let i = 0; i < 40; i++) {
    const x = 46 + Math.floor(srand() * 350);
    const y = 27 + Math.floor(srand() * 36);
    const big = srand() < 0.2;
    const col = ['#ffffff', C.cyan, C.gold, '#8c93a1'][Math.floor(srand() * 4)];
    const d = big ? `M${x - 1} ${y}h3v1h-3zM${x} ${y - 1}h1v3h-1z` : `M${x} ${y}h1v1h-1z`;
    s += `<path d="${d}" fill="${col}" class="tw tw${i % 4}"/>`;
  }
  push(s);
  css.push(
    '.tw{opacity:.35;animation:tw 3s ease-in-out infinite}.tw1{animation-duration:2.2s;animation-delay:-.7s}' +
      '.tw2{animation-duration:3.7s;animation-delay:-1.9s}.tw3{animation-duration:2.9s;animation-delay:-2.4s}' +
      '@keyframes tw{0%,100%{opacity:.1}50%{opacity:.9}}',
  );
}

// the neon chaser that runs round the rim
const chaser = polyD(inset(SHAPE, 0.5));
push(`<path d="${chaser}" fill="none" stroke="${C.cyan}" stroke-width="1" pathLength="1000" stroke-dasharray="46 454" class="chase" filter="url(#glow)" shape-rendering="auto"/>`);
push(`<path d="${chaser}" fill="none" stroke="${C.gold}" stroke-width="1" pathLength="1000" stroke-dasharray="22 478" stroke-dashoffset="250" class="chase" filter="url(#glow)" shape-rendering="auto"/>`);

// ---------------------------------------------------------------- hex + cog emblem
// The app's emblem, redrawn: hexagon outline, dashed gear ring, cog with a
// centre hole, a node on each of the six corners. The cog turns; the ring
// counter-rotates; the nodes light up one after another.
{
  const { x, y, r } = HEX;
  const hex = (rr) => polyD(hexPts(rr));
  let g = `<g transform="translate(${x} ${y})" shape-rendering="auto">`;
  g += `<path d="${hex(r + 4)}" fill="#010102"/><path d="${hex(r + 3)}" fill="${C.hi}"/>`;
  g += `<path d="${hex(r + 3)}" fill="#060709" transform="translate(.8 .8)" clip-path="url(#hexClip)"/>`;
  g += `<path d="${hex(r + 2)}" fill="url(#face)"/><path d="${hex(r + 0.5)}" fill="#010102"/>`;
  g += `<path d="${hex(r - 2)}" fill="none" stroke="${C.cyan}" stroke-width="1.2" stroke-linejoin="round" filter="url(#glow)"/>`;
  g += `<path d="${hex(r - 5.5)}" fill="#000" stroke="#8c93a1" stroke-width=".5"/>`;
  g += `<circle r="7.4" fill="none" stroke="#fff" stroke-width="1" pathLength="12" stroke-dasharray=".62 .38" class="spinr"/>`;
  g += '<g class="spin"><circle r="4.6" fill="#2b2f37" stroke="#fff" stroke-width=".8"/>';
  for (let k = 0; k < 8; k++) {
    const a = (k * Math.PI) / 4;
    g += `<path d="M${n2(4.6 * Math.cos(a))} ${n2(4.6 * Math.sin(a))}L${n2(6.2 * Math.cos(a))} ${n2(6.2 * Math.sin(a))}" stroke="#fff" stroke-width="1.2" stroke-linecap="round"/>`;
  }
  g += `<circle r="1.9" fill="#000" stroke="#fff" stroke-width=".7"/><path d="M0 -4.6v2.4" stroke="${C.gold}" stroke-width=".9"/></g>`;
  hexPts(r - 2).forEach(([nx, ny], k) => {
    g += `<circle cx="${nx}" cy="${ny}" r="1.5" fill="#fff" class="nd nd${k}"/>`;
  });
  g += `<path d="M${n2(-(r + 1) * 0.866)} ${n2(-(r + 1) * 0.5)}L0 ${-(r + 1)}" fill="none" stroke="#fff" stroke-opacity=".18" stroke-width="2"/>`;
  g += '</g>';
  push(g);
  css.push(
    `.spin{animation:spin ${8 * BEAT}s linear infinite}.spinr{animation:spin ${16 * BEAT}s linear infinite reverse}@keyframes spin{to{rotate:360deg}}`,
    `.nd{animation:nd ${6 * BEAT}s step-end infinite}@keyframes nd{0%{fill:${C.gold}}16.6%{fill:#fff}100%{fill:#fff}}`,
  );
  for (let k = 1; k < 6; k++) delayCss.push(`.nd${k}{animation-delay:${n2(-(6 - k) * BEAT)}s}`);
}

// ---------------------------------------------------------------- title bar
push(rect(68, 11, 300, 11, 'url(#titleBar)'));
push(rect(68, 22, 300, 1, '#010102'));
// tiny cog icon
push(`<path fill="${C.cyan}" d="${bitmapPath('..#.#..|.#####.|###.###|.#...#.|###.###|.#####.|..#.#..'.split('|'), 72, 13)}"/>`);
push(text(f5, 'ultra_satisfactory_recipegen.exe', 83, 12, `fill="${C.txt}"`));
push(spans(f5, [['[', C.dim], ['DSL', C.gold], [']', C.dim]], 300, 12));
for (const [bx, glyph] of [[338, '_'], [351, 'X']]) {
  push(raised(bx, 12, 11, 10));
  push(text(t3, glyph, bx + 4, 14, `fill="${C.txt}"`));
}

// ---------------------------------------------------------------- logo
// Squared-off 6x9 industrial letters, drawn for this header.
const LOGO = {
  U: '##..##|##..##|##..##|##..##|##..##|##..##|##..##|######|.####.',
  L: '##....|##....|##....|##....|##....|##....|##....|######|######',
  T: '######|######|..##..|..##..|..##..|..##..|..##..|..##..|..##..',
  R: '#####.|######|##..##|##..##|######|#####.|####..|##.##.|##..##',
  A: '..##..|.####.|######|##..##|##..##|######|######|##..##|##..##',
  S: '.#####|######|##....|###...|.####.|...###|....##|######|#####.',
  I: '##|##|##|##|##|##|##|##|##',
  F: '######|######|##....|##....|#####.|#####.|##....|##....|##....',
  C: '.#####|######|##....|##....|##....|##....|##....|######|.#####',
  O: '.####.|######|##..##|##..##|##..##|##..##|##..##|######|.####.',
  Y: '##..##|##..##|##..##|######|.####.|..##..|..##..|..##..|..##..',
};
const LS = 3; // logical px per logo cell
const SLANT = 1; // px of italic lean per cell row
const KERN = { LT: -1 }; // cells: tuck the T's bar over the L's foot
function buildLogo(words) {
  const out = { runs: [], hi: '', sh: '', width: 0 };
  let cx = 0;
  words.forEach((word, wi) => {
    let d = '';
    [...word].forEach((ch, i) => {
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
      cx += gw + 1 + (KERN[ch + (word[i + 1] || '')] || 0);
    });
    out.runs[wi] = d;
    if (wi < words.length - 1) cx += 3;
  });
  out.width = (cx - 1) * LS + SLANT * 8;
  return out;
}
const logo = buildLogo(['ULTRA', 'SATISFACTORY']);
const LX = Math.round((W - logo.width) / 2) + 6;
const LY = 30;
const LH = 9 * LS;
const chrome = (stops) =>
  stops.map((c, i) => `<stop offset="${n3(i / stops.length)}" stop-color="${c}"/><stop offset="${n3((i + 1) / stops.length)}" stop-color="${c}"/>`).join('');
const logoDefs =
  `<path id="lgU" d="${logo.runs[0]}"/><path id="lgS" d="${logo.runs[1]}"/>` +
  `<g id="lg"><use href="#lgU"/><use href="#lgS"/></g>` +
  `<linearGradient id="gU" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="${LH}">${chrome(['#e9fbff', '#b5f1ff', '#6fe2ff', '#22d5ff', '#0077a8', '#00a6d8', '#00cfff', '#52dcff', '#a8eeff'])}</linearGradient>` +
  `<linearGradient id="gS" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="${LH}">${chrome(['#ffffff', '#f6f8fc', '#e6eaf2', '#cfd6e2', '#7d8696', '#a9b3c4', '#cbd4e2', '#e4e9f2', '#f8fafd'])}</linearGradient>` +
  `<clipPath id="lgClip"><use href="#lgU"/><use href="#lgS"/></clipPath>` +
  `<filter id="lglow" x="-10%" y="-70%" width="120%" height="240%"><feGaussianBlur stdDeviation="3.6"/></filter>`;
{
  let g = `<g transform="translate(${LX} ${LY})">`;
  g += `<use href="#lgU" fill="${C.cyan}" filter="url(#lglow)" class="lglow" opacity=".6" shape-rendering="auto"/>`;
  g += `<use href="#lgS" fill="#bfe9ff" filter="url(#lglow)" class="lglow lglow2" opacity=".4" shape-rendering="auto"/>`;
  for (const [dx, dy] of [[-1, 0], [0, -1], [-1, -1], [1, -1], [-1, 1], [4, 3], [3, 4], [4, 4]]) g += `<use href="#lg" fill="#010102" x="${dx}" y="${dy}"/>`;
  const exU = ['#0084b0', '#00506e', '#002c3d'];
  const exS = ['#737b8a', '#454b57', '#23272e'];
  for (let k = 3; k >= 1; k--) g += `<use href="#lgU" fill="${exU[k - 1]}" x="${k}" y="${k}"/><use href="#lgS" fill="${exS[k - 1]}" x="${k}" y="${k}"/>`;
  g += `<use href="#lgU" fill="url(#gU)"/><use href="#lgS" fill="url(#gS)"/>`;
  g += `<path d="${logo.hi}" fill="#fff" opacity=".8"/><path d="${logo.sh}" fill="#000" opacity=".22"/>`;
  g += `<g clip-path="url(#lgClip)"><path class="sheen" d="M0 -2h7l-12 ${LH + 4}h-7z" fill="#fff" opacity=".8"/><path class="sheen" d="M11 -2h3l-12 ${LH + 4}h-3z" fill="#fff" opacity=".6"/></g>`;
  g += '</g>';
  push(g);
}

// release credits under the logo (the crew is made up)
push(
  centred(
    t3,
    [
      ['RELEASED BY ', C.dim], ['DEPT. OF SPAGHETTI LOGISTICS', C.gold], ['  ·  ', C.dim2],
      ['SUPPLIED BY ', C.dim], ['A PIONEER AT 3AM', C.cyan], ['  ·  ', C.dim2],
      ['V1.0', C.txt],
    ],
    W / 2 + 4,
    65,
  ),
);

// ---------------------------------------------------------------- now-playing ticker
const MQ = { x: 20, y: 75, w: 380, h: 14 };
push(sunken(MQ.x, MQ.y, MQ.w, MQ.h, C.lcd));
push(rect(MQ.x + 1, MQ.y + 1, 44, MQ.h - 2, C.cyan));
push(text(f5, '♪ XM>', MQ.x + 6, MQ.y + 4, `fill="${C.lcd}"`));
const tick =
  '♪ now playing: ultra_satisfactory.xm ♪   4 channels, 1 tracker, 0 idle machines   ::   ' +
  'every recipe, building and space elevator objective, one click apart   ::   ' +
  '140 items, 211 recipes (88 of them alternates), 477 buildings, 5 phases   ::   ' +
  'alt-tab at 3 a.m., look it up, alt-tab back before the belts notice   ::   ' +
  'greetz to everyone whose factory is 40% spaghetti and 60% "temporary"   ::   ' +
  'unofficial fan project, not affiliated with coffee stain studios   ::   ';
const tickW = [...tick].length * f5.adv;
const TICK_SPEED = 30; // logical px per second
{
  extraDefs.push(text(f5, tick, 0, 0, 'id="tk"'));
  push(
    `<g clip-path="url(#mqClip)" fill="${C.cyan}" filter="url(#glow)"><g transform="translate(${MQ.x + 50} ${MQ.y + 3})">` +
      `<g class="mq"><use href="#tk"/><use href="#tk" x="${tickW}"/></g></g></g>`,
  );
  css.push(`.mq{animation:mq ${n2(tickW / TICK_SPEED)}s steps(${tickW}) infinite}@keyframes mq{to{transform:translate(-${tickW}px,0)}}`);
}
push(rect(MQ.x + 1, MQ.y + 1, MQ.w - 2, MQ.h - 2, 'url(#scan)', 'shape-rendering="auto"'));

// ---------------------------------------------------------------- the recipe generator
// Four real recipes, one per phase. `recipe` is what goes in per cycle,
// `machine` is where, how long, how hungry, and what comes out per minute.
const RECIPES = [
  {
    item: 'Modular Frame',
    recipe: '3 Reinforced Iron Plate + 12 Iron Rod',
    machine: 'Assembler · 60 s · 15 MW · out 2/min',
    status: '3/min + 12/min in, 2/min out. no key required.',
  },
  {
    item: 'Versatile Framework',
    recipe: '1 Modular Frame + 12 Steel Beam',
    machine: 'Assembler · 24 s · 15 MW · out 5/min',
    status: '2.5/min + 30/min in. phase 3 wants 2500. oh no.',
  },
  {
    item: 'Iron Plate',
    recipe: '3 Iron Ingot',
    machine: 'Constructor · 6 s · 4 MW · out 20/min',
    status: '30/min in, 20/min out. everyone starts here.',
  },
  {
    item: 'Rotor',
    recipe: '5 Iron Rod + 25 Screw',
    machine: 'Assembler · 15 s · 15 MW · out 4/min',
    status: '20/min + 100/min in. yes, 100 screws a minute.',
  },
];
const PHASE = 7;
const LOOP = PHASE * RECIPES.length;
const T_CLEAR = 0.3; // the ITEM field is wiped
const T_TYPE0 = 0.45; // first keystroke
const T_TYPE_DT = 0.055;
const T_CLICK = 1.85; // GENERATE goes down
const T_SCRAMBLE = 1.95;
const T_SETTLE0 = 2.3;
const T_STEP = 0.035;
const ROW_LAG = 0.3; // the MACHINE row runs this far behind the RECIPE row
const COLS = 38;
const T_DONE = n2(T_SETTLE0 + T_STEP * COLS + ROW_LAG + 0.1);
const SCRAMBLE_K = 6;
const SCRAMBLE_DT = 0.06;
const SCRAMBLE_CHARS = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ#$%&*+=?@';
// Every phase-timed element runs OFFSET seconds ahead, so the first thing a
// visitor sees is recipe #1 already generated, then the next order coming in.
const OFFSET = 4.2;

const FX = 72;
const FW = COLS * 6 + 8;
const ITEM_Y = 95;
const REC_Y = 113;
const MAC_Y = 131;
push(text(f5, 'ITEM:', 22, ITEM_Y + 4, `fill="${C.dim}"`));
push(text(f5, 'RECIPE:', 22, REC_Y + 4, `fill="${C.dim}"`));
push(text(f5, 'MACHINE:', 22, MAC_Y + 4, `fill="${C.dim}"`));
push(sunken(FX, ITEM_Y, FW, 14));
push(sunken(FX, REC_Y, FW, 14));
push(sunken(FX, MAC_Y, FW, 14));
{
  // the ITEMS tab searches as you type, so the field says so
  const hint = 'SEARCH 140 ITEMS';
  const hx = FX + FW - 5 - t3.width(hint);
  push(`<path fill="${C.dim2}" d="${bitmapPath(['.##..', '#..#.', '#..#.', '.##..', '....#'], hx - 8, ITEM_Y + 4)}"/>`);
  push(text(t3, hint, hx, ITEM_Y + 5, `fill="${C.dim2}"`));
}
for (const r of RECIPES) {
  if (r.recipe.length > COLS || r.machine.length > COLS || r.item.length > COLS) throw new Error(`too long for the field: ${r.item}`);
}

// phase delays: p = on the beat, q = the lagging MACHINE row
for (let p = 0; p < RECIPES.length; p++) {
  delayCss.push(`.p${p}{animation-delay:${-n3((LOOP - p * PHASE + OFFSET) % LOOP)}s}`);
  delayCss.push(`.q${p}{animation-delay:${-n3((LOOP - p * PHASE + OFFSET - ROW_LAG) % LOOP)}s}`);
}
delayCss.push(`.ja{animation-delay:${-OFFSET}s}.jb{animation-delay:${-n3(OFFSET - ROW_LAG)}s}`);

// Shared timing for every generated glyph; the per-column rules below only
// have to name their keyframes. (.S use is written in longhands so that it
// cannot clobber the per-phase animation-delay rules, which are less specific.)
css.push(
  `.J{animation:${PHASE}s step-end infinite}` +
    `.S use{animation-duration:${LOOP}s;animation-timing-function:step-end;animation-iteration-count:infinite}`,
);
// per-column keyframes, shared by both generated rows
for (let i = 0; i < COLS; i++) {
  const settle = T_SETTLE0 + i * T_STEP;
  stepKF(`g${i}`, PHASE, [[0, 'opacity:0'], [T_SCRAMBLE, 'opacity:1'], [settle, 'opacity:0']]);
  stepKF(`s${i}`, LOOP, [
    [0, 'opacity:0'],
    [settle, 'opacity:1;fill:#fff'],
    [settle + 0.16, 'opacity:1;fill:currentColor'],
    [PHASE + T_SCRAMBLE, 'opacity:0'],
  ]);
  css.push(`.g${i}{animation-name:g${i}}.s${i}{animation-name:s${i}}`);
}
css.push(`.jm{animation:jm ${n2(SCRAMBLE_K * SCRAMBLE_DT)}s steps(${SCRAMBLE_K}) infinite}@keyframes jm{to{translate:0 -${SCRAMBLE_K * 10}px}}`);
css.push('.S use,.J{opacity:0}.S .p0,.S .q0{opacity:1}');

// Scramble junk: a handful of vertical strips of shuffled glyphs, reused by
// every column. Each column is a 9px-tall window onto its strip, which steps
// upwards; the strip holds its sequence twice so a column can start anywhere.
const JUNK_STRIPS = 12;
{
  const pool = [...SCRAMBLE_CHARS];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  for (let n = 0; n < JUNK_STRIPS; n++) {
    let g = `<g id="jk${n}">`;
    for (let k = 0; k < SCRAMBLE_K * 2; k++) {
      const r = pool[(n * SCRAMBLE_K + (k % SCRAMBLE_K)) % pool.length];
      g += `<use href="#${f5.id(r)}"${k ? ` y="${k * 10}"` : ''}/>`;
    }
    extraDefs.push(`${g}</g>`);
  }
}

function generatedRow(y, key, colour, junkColour, delay, junkDelay, staleClass) {
  const at = `transform="translate(${FX + 4} ${y + 3})"`;
  const len = Math.max(...RECIPES.map((r) => r[key].length));
  let junk = `<svg x="${FX + 4}" y="${y + 3}" width="${len * 6}" height="9"><g fill="${junkColour}" class="jm">`;
  let strip = Math.floor(rand() * JUNK_STRIPS);
  for (let i = 0; i < len; i++) {
    const x = i * 6;
    strip = (strip + 1 + Math.floor(rand() * (JUNK_STRIPS - 1))) % JUNK_STRIPS; // never the same strip twice running
    const start = Math.floor(rand() * SCRAMBLE_K);
    junk += `<use href="#jk${strip}"${x ? ` x="${x}"` : ''}${start ? ` y="${-start * 10}"` : ''} class="J g${i} ${junkDelay}"/>`;
  }
  push(`${junk}</g></svg>`);
  let good = `<g class="${staleClass}"><g ${at} fill="${colour}" color="${colour}" class="S">`;
  RECIPES.forEach((r, p) => {
    [...r[key]].forEach((ch, i) => {
      if (ch !== ' ') good += `<use href="#${f5.id(ch)}" class="s${i} ${delay}${p}"${i ? ` x="${i * 6}"` : ''}/>`;
    });
  });
  push(`${good}</g></g>`);
}
generatedRow(REC_Y, 'recipe', C.gold, C.pink, 'p', 'ja', 'stA');
generatedRow(MAC_Y, 'machine', C.cyan, C.purple, 'q', 'jb', 'stB');
// the old answer dims while the next order is being typed
stepKF('stA', PHASE, [[0, 'opacity:1'], [T_CLEAR, 'opacity:.3'], [T_SCRAMBLE, 'opacity:1']]);
stepKF('stB', PHASE, [[0, 'opacity:1'], [T_CLEAR, 'opacity:.3'], [T_SCRAMBLE + ROW_LAG, 'opacity:1']]);
css.push(`.stA{animation:stA ${PHASE}s step-end infinite -${OFFSET}s}.stB{animation:stB ${PHASE}s step-end infinite -${OFFSET}s}`);

// the ITEM field is typed in, one keystroke at a time
{
  const len = Math.max(...RECIPES.map((r) => r.item.length));
  for (let i = 0; i < len; i++) {
    stepKF(`n${i}`, LOOP, [[0, 'opacity:0'], [T_TYPE0 + i * T_TYPE_DT, 'opacity:1'], [PHASE + T_CLEAR, 'opacity:0']]);
    css.push(`.n${i}{animation-name:n${i}}`);
  }
  let typed = `<g transform="translate(${FX + 4} ${ITEM_Y + 3})" fill="${C.txt}" class="S">`;
  const caret = [];
  RECIPES.forEach((r, p) => {
    caret.push([p * PHASE + T_CLEAR, 'translate:0 0']);
    [...r.item].forEach((ch, i) => {
      if (ch !== ' ') typed += `<use href="#${f5.id(ch)}" class="n${i} p${p}"${i ? ` x="${i * 6}"` : ''}/>`;
      caret.push([p * PHASE + T_TYPE0 + i * T_TYPE_DT, `translate:${(i + 1) * 6}px 0`]);
    });
  });
  push(`${typed}</g>`);
  stepKF('car', LOOP, caret);
  push(`<g transform="translate(${FX + 4} ${ITEM_Y + 3})"><rect class="caret" width="5" height="8" fill="${C.cyan}"/></g>`);
  css.push(
    `.caret{translate:${RECIPES[0].item.length * 6}px 0;animation:car ${LOOP}s step-end infinite -${OFFSET}s,blink 1s step-end infinite}` +
      '@keyframes blink{50%{opacity:0}}',
  );
}

// ---------------------------------------------------------------- protection readout + buttons
const BY = 151;
const BH = 17;
{
  const x = 20;
  const w = 102;
  push(sunken(x, BY, w, BH, C.lcd));
  // an open padlock: the shackle has swung clear of the body
  push(
    sprite(
      ['.###.....', '#...#....', '#...#....', '....#....', '...######', '...######', '...##.###', '...##.###', '...######'],
      { '#': C.gold },
      x + 5,
      BY + 4,
    ),
  );
  push(spans(t3, [['PROTECTION: ', C.dim], ['NONE', C.gold]], x + 19, BY + 3));
  push(spans(t3, [['LICENCE: ', C.dim], ['APACHE 2.0', C.cyan]], x + 19, BY + 10));
  push(rect(x + 1, BY + 1, w - 2, BH - 2, 'url(#scan)', 'shape-rendering="auto"'));
}
const buttons = [['GENERATE', C.cyan], ['ABOUT', C.txt], ['EXIT', C.txt]];
const bw = buttons.map(([l]) => f5.width(l) + 16);
const BGAP = 7;
let bx = Math.round(128 + (FX + FW - 128 - (bw.reduce((a, b) => a + b, 0) + BGAP * 2)) / 2);
const btnPos = [];
buttons.forEach(([label, col], i) => {
  push(raised(bx, BY, bw[i], BH));
  push(text(f5, label, bx + 8, BY + 5, `fill="${col}"`));
  btnPos.push(bx);
  bx += bw[i] + BGAP;
});
{
  // GENERATE pressed state (shown briefly at every click)
  const x = btnPos[0];
  const w = bw[0];
  push(
    `<g class="press">${rect(x, BY, w, BH, '#010102')}${rect(x + 1, BY + 1, w - 2, BH - 2, '#08090c')}` +
      `${rect(x + 2, BY + 2, w - 3, BH - 3, '#3f4653')}${rect(x + 2, BY + 2, w - 4, BH - 4, 'url(#btnDown)')}` +
      `${text(f5, 'GENERATE', x + 9, BY + 6, `fill="${C.cyanHot}"`)}</g>`,
  );
  stepKF('press', PHASE, [[0, 'opacity:0'], [T_CLICK, 'opacity:1'], [T_CLICK + 0.22, 'opacity:0']]);
  css.push(`.press{opacity:0;animation:press ${PHASE}s step-end infinite -${OFFSET}s}`);
}

{
  // EXIT hovered: the button has opinions
  const x = btnPos[2];
  const w = bw[2];
  push(`<g class="hov">${raised(x, BY, w, BH, 'url(#btnHot)', '#8c93a1')}${text(f5, 'NOPE', x + 8, BY + 5, `fill="${C.pink}"`)}</g>`);
  stepKF('hov', PHASE, [[0, 'opacity:1'], [0.78, 'opacity:0'], [T_DONE + 1.15, 'opacity:1']]);
  css.push(`.hov{opacity:0;animation:hov ${PHASE}s step-end infinite -${OFFSET}s}`);
}

// ---------------------------------------------------------------- spectrum analyser
const SP = { x: 314, y: 95, w: 86, h: 73 };
push(sunken(SP.x, SP.y, SP.w, SP.h, '#020304'));
const BARS = 13;
const BAR_W = 5;
const BAR_TOP = SP.y + 5;
const SEGS = 18;
const BAR_H = SEGS * 3;
const bar0 = SP.x + Math.round((SP.w - (BARS * 6 - 1)) / 2);
{
  // lit colour bands under everything, one rect per band across all bars
  const band = (seg) => (seg >= 16 ? C.pink : seg >= 12 ? C.gold : seg >= 6 ? C.cyan : '#0095c8');
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
    const kind = b < 3 ? 'bass' : b < 10 ? 'mid' : 'hat';
    const lv = [];
    for (let s = 0; s < STEPS; s++) {
      let a;
      if (kind === 'bass') {
        a = s % 4 === 0 ? 1 - b * 0.04 : s % 4 === 2 ? 0.6 : 0.32;
        a += (rand() - 0.5) * 0.08;
      } else if (kind === 'mid') {
        const note = 3 + arp[s % arp.length] * 0.52;
        const dist = Math.abs(b - note);
        a = 0.24 + Math.max(0, 0.7 - dist * 0.2) + (s === 4 || s === 12 ? 0.26 : 0) + rand() * 0.16;
      } else {
        a = (s % 2 === 1 ? 0.6 : 0.26) - (b - 10) * 0.05 + rand() * 0.16;
      }
      lv.push(Math.min(1, Math.max(0.07, a)));
    }
    const decay = kind === 'bass' ? 0.45 : kind === 'mid' ? 0.62 : 0.4;
    const levelAt = (t) => {
      const s = Math.floor(t / DT) % STEPS;
      const u = (t - s * DT) / DT;
      if (u < 0.8) return lv[s] + (lv[s] * decay - lv[s]) * (u / 0.8);
      const nxt = lv[(s + 1) % STEPS];
      return lv[s] * decay + (nxt - lv[s] * decay) * ((u - 0.8) / 0.2);
    };
    // Real LED analysers light whole segments, so levels are quantised to
    // segments and sampled on a 24 Hz grid with step-end (no half-lit LEDs).
    // The cover rect is the unlit part of the bar, so it scales from the top.
    const seg = (v) => Math.max(1, Math.min(SEGS, Math.round(v * SEGS)));
    const cover = (n) => String(n3(1 - n / SEGS)).replace(/^0\./, '.');
    // peaks: hold 0.15 s then fall; simulate three loops so the last one is periodic
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
    push(`<g transform="translate(${x} ${BAR_TOP})"><rect class="b${b}" width="${BAR_W}" height="${BAR_H}" fill="#10141a"/></g>`);
    caps.push(`<g transform="translate(${x} ${BAR_TOP})"><rect class="k${b}" width="${BAR_W}" height="2"/></g>`);
  }
  // segment gaps and bar gutters drawn on top
  let d = '';
  for (let s = 1; s <= SEGS; s++) d += `M${bar0} ${BAR_TOP + s * 3 - 1}h${BARS * 6 - 1}v1h${-(BARS * 6 - 1)}z`;
  for (let b = 1; b < BARS; b++) d += `M${bar0 + b * 6 - 1} ${BAR_TOP}h1v${BAR_H}h-1z`;
  push(`<path fill="#020304" d="${d}"/>`);
  push(`<g fill="#f4f7ff">${caps.join('')}</g>`);
  const ly = BAR_TOP + BAR_H + 3;
  push(spans(t3, [['BASS', C.label]], bar0, ly));
  push(centred(t3, [['120 BPM', C.label]], bar0 + (BARS * 6 - 1) / 2, ly));
  push(spans(t3, [['HATS', C.label]], bar0 + BARS * 6 - 1 - t3.width('HATS'), ly));
  push(rect(SP.x + 1, SP.y + 1, SP.w - 2, SP.h - 2, 'url(#scan)', 'shape-rendering="auto"'));
}

// ---------------------------------------------------------------- everything links
// The three tabs in their own colours, joined by conveyor belts:
// OBJECTIVES -> click a part -> ITEMS -> click the machine -> BUILDINGS.
const FL = { x: 20, y: 177, w: 380, h: 46 };
push(sunken(FL.x, FL.y, FL.w, FL.h, '#030405'));
{
  const ICON_Y = FL.y + 5;
  const ICON_W = 24;
  const ICON_H = 36;
  const PILL_Y = FL.y + 7;
  const BELT_Y = FL.y + 22;
  const clips = [];

  // a tab "pill" plus three caption lines
  const station = (x, name, colour, lines) => {
    const pw = t3.width(name) + 8;
    let s = `<path fill="${colour}" d="M${x + 1} ${PILL_Y}h${pw - 2}v1h1v8h${-pw}v-8h1z"/>`;
    s += text(t3, name, x + 4, PILL_Y + 2, 'fill="#08090c"');
    lines.forEach((parts_, i) => { s += spans(t3, parts_, x, PILL_Y + 13 + i * 8); });
    return s;
  };

  // a stretch of conveyor: rollers, moving chevrons, parts riding along
  const belt = (x0, x1, colour, id, top, bottom) => {
    const w = x1 - x0;
    let s = rect(x0, BELT_Y - 1, w, 1, '#3b414d') + rect(x0, BELT_Y, w, 5, '#0b0d11') + rect(x0, BELT_Y + 5, w, 1, '#1d2026');
    let chev = '';
    for (let x = x0 - 8; x < x1 + 8; x += 8) chev += `M${x} ${BELT_Y + 1}h1v1h1v1h-1v1h-1v-1h1v-1h-1z`;
    let cargo = '';
    for (let x = x0 - 16; x < x1 + 16; x += 16) cargo += `M${x} ${BELT_Y - 4}h4v3h-4z`;
    clips.push(`<clipPath id="${id}"><rect x="${x0}" y="${BELT_Y - 6}" width="${w}" height="13"/></clipPath>`);
    s += `<g clip-path="url(#${id})"><path class="chev" fill="#3b414d" d="${chev}"/><path class="cargo" fill="${colour}" filter="url(#glow)" d="${cargo}"/></g>`;
    // arrow head into the next station
    s += `<path fill="${colour}" d="M${x1 + 1} ${BELT_Y - 2}h1v9h-1zM${x1 + 2} ${BELT_Y - 1}h1v7h-1zM${x1 + 3} ${BELT_Y}h1v5h-1zM${x1 + 4} ${BELT_Y + 1}h1v3h-1zM${x1 + 5} ${BELT_Y + 2}h1v1h-1z"/>`;
    s += centred(t3, [[top, C.txt]], (x0 + x1) / 2 + 1, BELT_Y - 12);
    s += centred(t3, [[bottom, C.dim]], (x0 + x1) / 2 + 1, BELT_Y + 11);
    return s;
  };
  css.push(
    '.chev{animation:chev .5s steps(8) infinite}@keyframes chev{to{transform:translate(8px,0)}}' +
      '.cargo{animation:cargo 1s steps(16) infinite}@keyframes cargo{to{transform:translate(16px,0)}}',
  );

  // layout: three stations (icon + text) with the belts sharing what is left
  const TEXT_W = [60, 52, 52];
  const stationW = TEXT_W.map((w) => ICON_W + 4 + w);
  const X0 = FL.x + 4;
  const zone = Math.floor((FL.w - 8 - stationW.reduce((a, b) => a + b, 0)) / 2);
  const s1 = X0;
  const s2 = s1 + stationW[0] + zone;
  const s3 = s2 + stationW[1] + zone;

  // --- station 1: OBJECTIVES, with a little space elevator
  {
    const rows = [
      '...........cc...........', '...........cc...........', '...........cc...........', '...........cc...........',
      '...........cc...........', '...........cc...........', '...........cc...........', '...........cc...........',
      '...........cc...........', '...........cc...........', '...........cc...........', '...........cc...........',
      '...........cc...........', '...........cc...........',
      '..........wPPw..........',
      '.........PPPPPP.........',
      '..........pppp..........',
      '..........pdpp..........',
      '..........pdpp..........',
      '.........ppdppp.........',
      '........PPPPPPPP........',
      '.........pdppdp.........',
      '.........pdppdp.........',
      '........ppdppdpp........',
      '.......pppdppdppp.......',
      '......PPPPPPPPPPPP......',
      '.......ppdppppdpp.......',
      '......pppdppppdppp......',
      '.....ppppdpwwpdpppp.....',
      '....ppp.pdpwwpdp.ppp....',
      '...ppp..pdppppdp..ppp...',
      '..ppp...pppppppp...ppp..',
      '.ppp....pppppppp....ppp.',
      'gggggggggggggggggggggggg',
      'GGGGGGGGGGGGGGGGGGGGGGGG',
      '........................',
    ];
    const pal = { c: '#6d28d9', p: C.purple, P: '#d8b4fe', d: '#581c87', w: '#ffffff', g: '#8c93a1', G: '#3b414d' };
    let s = `<svg x="${s1}" y="${ICON_Y}" width="${ICON_W}" height="${ICON_H}">`;
    s += `<path fill="#fff" class="tw tw1" d="M3 5h1v1h-1zM19 9h1v1h-1zM6 15h1v1h-1z"/><path fill="${C.purple}" class="tw tw3" d="M20 3h1v1h-1zM2 22h1v1h-1zM17 18h1v1h-1z"/>`;
    s += sprite(rows, pal);
    // the climber: a payload pod riding the cable into orbit
    s += `<g class="climb"><path fill="#fff" d="M10 0h4v3h-4z"/><path fill="${C.gold}" d="M11 3h2v1h-2z"/></g>`;
    s += '</svg>';
    push(s);
    css.push('.climb{translate:0 6px;animation:climb 3s steps(24) infinite}@keyframes climb{0%{translate:0 12px}100%{translate:0 -6px}}');
    push(
      station(s1 + ICON_W + 4, 'OBJECTIVES', C.purple, [
        [['SPACE ELEVATOR', C.txt]],
        [['5 PHASES', C.txt]],
        [['PARTS + AMOUNTS', C.dim]],
      ]),
    );
  }

  // --- station 2: ITEMS, with a recipe card
  {
    let s = `<g transform="translate(${s2} ${ICON_Y})">`;
    s += rect(0, 1, ICON_W, 33, C.pink) + rect(1, 2, ICON_W - 2, 31, '#150710');
    s += rect(1, 2, ICON_W - 2, 5, '#5c1a3d') + rect(3, 4, 9, 1, '#f9a8d4') + rect(18, 4, 3, 1, '#f9a8d4');
    // two ingredients: a plate and a pair of rods
    s += rect(3, 10, 7, 5, '#9aa3b2') + rect(3, 10, 7, 1, '#e0e5ee') + rect(3, 14, 7, 1, '#5d6573');
    s += `<path fill="#fff" d="M12 11h1v3h-1zM11 12h3v1h-3z"/>`;
    s += rect(15, 10, 6, 2, '#9aa3b2') + rect(15, 10, 6, 1, '#e0e5ee') + rect(15, 13, 6, 2, '#9aa3b2') + rect(15, 13, 6, 1, '#e0e5ee');
    // arrow down
    s += `<path fill="#fff" d="M11 17h2v3h-2zM9 20h6v1h-6zM10 21h4v1h-4zM11 22h2v1h-2z"/>`;
    // the product: a cross-braced frame
    s += `<g class="prod">${sprite(
      ['oooooooo', 'oO....Oo', 'o.O..O.o', 'o..OO..o', 'o..OO..o', 'o.O..O.o', 'oO....Oo', 'oooooooo'],
      { o: C.gold, O: '#a3912a' },
      8,
      24,
    )}</g>`;
    s += '</g>';
    push(s);
    css.push(`.prod{animation:prod ${2 * BEAT}s ease-out infinite}@keyframes prod{0%{opacity:1}100%{opacity:.55}}`);
    push(
      station(s2 + ICON_W + 4, 'ITEMS', C.pink, [
        [['140 ITEMS', C.txt]],
        [['211 RECIPES', C.txt]],
        [['88 ALTERNATES', C.dim]],
      ]),
    );
  }

  // --- station 3: BUILDINGS, with a machine that never stops
  {
    let s = `<svg x="${s3}" y="${ICON_Y}" width="${ICON_W}" height="${ICON_H}">`;
    // smoke
    s += `<g fill="#8c93a1"><path class="puff" d="M17 6h3v3h-3z"/><path class="puff puff2" d="M16 6h3v3h-3z"/><path class="puff puff3" d="M18 6h2v2h-2z"/></g>`;
    // chimney + hopper
    s += rect(16, 10, 4, 7, '#555b68') + rect(15, 9, 6, 2, '#8c93a1') + rect(16, 12, 4, 1, C.gold);
    s += `<path fill="#7dd3fc" d="${bitmapPath(['##########', '.########.', '.########.', '..######..', '..######..', '...####...'], 2, 11)}"/>`;
    s += `<path fill="#0369a1" d="${bitmapPath(['..........', '..........', '.......##.', '......##..', '......##..', '.....##...'], 2, 11)}"/>`;
    // body
    s += rect(0, 17, 24, 15, '#010102') + rect(1, 18, 22, 13, '#0c3047') + rect(1, 18, 22, 1, C.blue) + rect(1, 30, 22, 1, '#06202f');
    // display
    s += rect(3, 21, 9, 7, '#02090c') + rect(4, 22, 7, 1, C.cyan, 'class="led"') + rect(4, 24, 5, 1, C.gold) + rect(4, 26, 6, 1, C.cyan, 'class="led led2"');
    // press
    s += rect(14, 20, 7, 9, '#02090c') + rect(15, 27, 5, 1, C.gold);
    s += `<g class="ram">${rect(17, 20, 1, 3, '#8c93a1')}${rect(15, 23, 5, 2, '#e9ecf2')}</g>`;
    // base
    s += rect(0, 32, 24, 2, '#555b68') + rect(0, 32, 24, 1, '#8c93a1') + rect(2, 34, 4, 1, '#3b414d') + rect(18, 34, 4, 1, '#3b414d');
    s += '</svg>';
    push(s);
    css.push(
      `.ram{translate:0 -3px;animation:ram ${BEAT}s steps(3) infinite alternate}@keyframes ram{0%{translate:0 -3px}100%{translate:0 2px}}` +
        '.puff{opacity:0;animation:puff 2s linear infinite}.puff2{animation-delay:-.66s}.puff3{animation-delay:-1.33s}' +
        '@keyframes puff{0%{opacity:0;transform:translate(0,2px)}15%{opacity:.8}100%{opacity:0;transform:translate(-3px,-9px)}}',
    );
    push(
      station(s3 + ICON_W + 4, 'BUILDINGS', C.blue, [
        [['477 BUILDINGS', C.txt]],
        [['9 MACHINES', C.txt]],
        [['MK UPGRADES', C.dim]],
      ]),
    );
  }

  push(belt(s1 + stationW[0] + 4, s2 - 10, C.pink, 'c1', 'CLICK A PART', 'OPEN RECIPE'));
  push(belt(s2 + stationW[1] + 4, s3 - 10, C.blue, 'c2', 'CLICK MACHINE', 'OPEN BUILDING'));
  extraDefs.push(clips.join(''));
  // the legend sits on the panel's top edge, like a fieldset
  {
    const legend = '// EVERYTHING LINKS //';
    const lw = t3.width(legend) + 8;
    const lx = Math.round(FL.x + (FL.w - lw) / 2);
    push(rect(lx, FL.y - 3, lw, 7, '#0b0c10') + text(t3, legend, lx + 4, FL.y - 2, `fill="${C.gold}"`));
  }
}

// ---------------------------------------------------------------- status bar
const ST = { x: 20, y: 228, w: 380, h: 14 };
push(sunken(ST.x, ST.y, ST.w, ST.h, '#030405'));
push(text(f5, 'STATUS>', ST.x + 4, ST.y + 3, `fill="${C.dim}"`));
{
  const sx = ST.x + 4 + 8 * 6;
  const maxChars = Math.floor((ST.w - 8 - 8 * 6) / 6);
  const check = (m) => { if ([...m].length > maxChars) throw new Error(`status too long (${[...m].length} > ${maxChars}): ${m}`); return m; };
  push(`<g class="stt">${text(f5, check('new order on the belt. press GENERATE.'), sx, ST.y + 3, `fill="${C.dim}"`)}</g>`);
  // while it generates: the message plus a chunky progress bar that fills as the columns settle
  const PG = { w: 79, segs: 16 };
  const pgx = ST.x + ST.w - 5 - PG.w;
  let pg = rect(pgx - 2, ST.y + 3, PG.w + 3, 8, '#3b414d') + rect(pgx - 1, ST.y + 4, PG.w + 1, 6, '#030405');
  let segs = '';
  for (let i = 0; i < PG.segs; i++) segs += `M${pgx + i * 5} ${ST.y + 5}h4v4h-4z`;
  pg += `<path fill="${C.gold}" d="${segs}"/>`;
  // the cover hides the unlit segments; it is anchored on its right edge and shrinks towards it
  pg += `<g transform="translate(${pgx + PG.w} ${ST.y + 5})"><rect class="pg" x="${-PG.w}" width="${PG.w}" height="4" fill="#030405"/></g>`;
  push(`<g class="stg">${text(f5, check('generating... untangling the spaghetti'), sx, ST.y + 3, `fill="${C.gold}"`)}${pg}</g>`);
  {
    const ev = [[0, 'scale:1 1']];
    for (let i = 1; i <= PG.segs; i++) {
      const t = T_SCRAMBLE + ((T_DONE - 0.12 - T_SCRAMBLE) * i) / PG.segs;
      ev.push([t, `scale:${n3(1 - (i * 5 - (i === PG.segs ? 1 : 0)) / PG.w)} 1`]);
    }
    ev.push([T_DONE + 0.2, 'scale:1 1']);
    stepKF('pg', PHASE, ev);
    css.push(`.pg{scale:0 1;animation:pg ${PHASE}s step-end infinite -${OFFSET}s}`);
  }
  stepKF('stt', PHASE, [[0, 'opacity:0'], [T_CLEAR, 'opacity:1'], [T_SCRAMBLE, 'opacity:0']]);
  stepKF('stg', PHASE, [[0, 'opacity:0'], [T_SCRAMBLE, 'opacity:1'], [T_DONE, 'opacity:0']]);
  stepKF('st', LOOP, [[0, 'opacity:0'], [T_DONE, 'opacity:1'], [PHASE + T_CLEAR, 'opacity:0']]);
  css.push(
    `.stt{opacity:0;animation:stt ${PHASE}s step-end infinite -${OFFSET}s}.stg{opacity:0;animation:stg ${PHASE}s step-end infinite -${OFFSET}s}` +
      `.st{opacity:0;animation:st ${LOOP}s step-end infinite}.st.p0{opacity:1}`,
  );
  RECIPES.forEach((r, p) => push(`<g class="st p${p}">${text(f5, check(`OK: ${r.status}`), sx, ST.y + 3, `fill="${C.cyan}"`)}</g>`));
}

// chin
push(centred(t3, [['MAKES RECIPES, NOT KEYS', C.dim], ['  ·  ', C.dim2], ['UNOFFICIAL FAN TOOL', C.dim]], W / 2, 248));

// ---------------------------------------------------------------- mouse cursor
// It clicks GENERATE, waits for the recipe, drifts over to EXIT, thinks
// better of it and comes back. Just one more belt.
{
  // The tip lands just past each label so the label stays readable, and high
  // enough on GENERATE that the arrow's tail clears the legend underneath.
  const target = [btnPos[0] + bw[0] - 7, BY + 7];
  const rest = [btnPos[2] + bw[2] - 9, BY + 12];
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
      `<path fill="#010102" d="${bitmapPath(black)}"/><path fill="#fff" d="${bitmapPath(white)}"/></g></g>`,
  );
  const ease = 'animation-timing-function:cubic-bezier(.5,0,.2,1)';
  css.push(
    `@keyframes cur{0%{transform:translate(0,0);${ease}}${pct(0.7, PHASE)}{transform:translate(0,0);${ease}}` +
      `${pct(T_CLICK - 0.14, PHASE)}{transform:translate(${dx}px,${dy}px)}` +
      `${pct(T_CLICK, PHASE)}{transform:translate(${dx + 1}px,${dy + 1}px)}` +
      `${pct(T_CLICK + 0.2, PHASE)}{transform:translate(${dx}px,${dy}px);${ease}}` +
      `${pct(T_DONE + 0.5, PHASE)}{transform:translate(${dx}px,${dy}px);${ease}}` +
      `${pct(T_DONE + 1.5, PHASE)}{transform:translate(2px,-1px);${ease}}` +
      `${pct(T_DONE + 1.9, PHASE)}{transform:translate(-2px,1px);${ease}}` +
      `${pct(T_DONE + 2.3, PHASE)}{transform:translate(0,0)}100%{transform:translate(0,0)}}` +
      `.cur{animation:cur ${PHASE}s linear infinite -${OFFSET}s}`,
  );
  if (T_DONE + 2.3 >= PHASE) throw new Error('cursor timeline overruns the phase');
}

// ---------------------------------------------------------------- remaining CSS
css.push(
  '.chase{animation:chase 6s linear infinite}@keyframes chase{to{stroke-dashoffset:-500}}',
  `.sheen{transform:translate(-40px,0);animation:sheen 7s linear infinite}@keyframes sheen{0%{transform:translate(-40px,0)}24%{transform:translate(${logo.width + 80}px,0)}100%{transform:translate(${logo.width + 80}px,0)}}`,
  '.lglow{animation:lglow 4s ease-in-out infinite}.lglow2{animation-delay:-2s}@keyframes lglow{0%,100%{opacity:.4}50%{opacity:.8}}',
  `.led{animation:led ${BEAT}s ease-out infinite}.led2{animation-delay:-${BEAT / 2}s}@keyframes led{0%{opacity:1}100%{opacity:.25}}`,
);
const style =
  css.join('') +
  delayCss.join('') +
  '@media (prefers-reduced-motion:reduce){*{animation:none!important}.cur{display:none}}';

// ---------------------------------------------------------------- defs + assemble
const defs =
  `<linearGradient id="face" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#262a32"/><stop offset=".3" stop-color="#15171c"/><stop offset="1" stop-color="#08090b"/></linearGradient>` +
  `<linearGradient id="gloss" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".08"/><stop offset=".28" stop-color="#fff" stop-opacity=".025"/><stop offset=".28" stop-color="#fff" stop-opacity="0"/></linearGradient>` +
  `<linearGradient id="titleBar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2f4450"/><stop offset=".5" stop-color="#17222a"/><stop offset="1" stop-color="#0c1216"/></linearGradient>` +
  `<linearGradient id="btn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#353a45"/><stop offset=".5" stop-color="#20242b"/><stop offset="1" stop-color="#15181d"/></linearGradient>` +
  `<linearGradient id="btnHot" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a3043"/><stop offset=".5" stop-color="#2e1d2a"/><stop offset="1" stop-color="#1d131b"/></linearGradient>` +
  `<linearGradient id="btnDown" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#01303f"/><stop offset="1" stop-color="#024a61"/></linearGradient>` +
  `<pattern id="plate" width="4" height="4" patternUnits="userSpaceOnUse"><path fill="#000" opacity=".4" d="M0 0h2v2H0zM2 2h2v2H2z"/><path fill="#fff" opacity=".02" d="M2 0h2v2H2zM0 2h2v2H0z"/></pattern>` +
  `<pattern id="grid" width="8" height="8" patternUnits="userSpaceOnUse"><path fill="${C.cyan}" opacity=".07" d="M0 0h8v1H0zM0 1h1v7H0z"/></pattern>` +
  `<pattern id="hz" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="#0b0b09"/><path fill="${C.gold}" d="M0 6L6 0H3L0 3zM6 6V3L3 6z"/></pattern>` +
  `<pattern id="scan" width="4" height="1" patternUnits="userSpaceOnUse"><rect width="4" height=".5" y=".5" fill="#000" opacity=".3"/></pattern>` +
  `<filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.1" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>` +
  `<filter id="soft" x="-5%" y="-5%" width="110%" height="115%"><feGaussianBlur stdDeviation="3"/></filter>` +
  `<clipPath id="bodyClip"><path d="${polyD(inset(SHAPE, 1))}"/></clipPath>` +
  `<clipPath id="hexClip"><path d="${polyD(hexPts(HEX.r + 3))}"/></clipPath>` +
  `<clipPath id="mqClip"><rect x="${MQ.x + 46}" y="${MQ.y + 1}" width="${MQ.w - 47}" height="${MQ.h - 2}"/></clipPath>` +
  extraDefs.join('') +
  logoDefs +
  f5.defs() +
  t3.defs();

const svg =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W * 2}" height="${H * 2}" shape-rendering="crispEdges">` +
  `<title>ULTRA-SATISFACTORY recipe generator, released by the (fictional) Dept. of Spaghetti Logistics</title>` +
  `<style>${style}</style><defs>${defs}</defs>${parts.join('')}</svg>\n`;

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, svg);
console.log(`wrote ${OUT} (${(svg.length / 1024).toFixed(1)} KB)`);
