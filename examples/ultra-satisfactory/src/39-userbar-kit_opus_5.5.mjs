#!/usr/bin/env node
// ULTRA-SATISFACTORY README header: "Userbar Kit" (39-userbar-kit_opus_5.5).
// Plain Node, no dependencies, fully deterministic (no clock, no randomness).
//   node examples/ultra-satisfactory/src/39-userbar-kit_opus_5.5.mjs
// writes examples/ultra-satisfactory/assets/39-userbar-kit_opus_5.5.svg        (the wide title piece)
//    and examples/ultra-satisfactory/assets/39-userbar-kit_opus_5.5-<name>.svg (one file per userbar)
//    and ...-short.svg / ...-<name>-short.svg (narrow-screen forms of the banner and the six signature bars)
//
// The style is the mid-2000s forum "userbar": a 350 x 19 strip with a 1 px black border, a
// saturated left-to-right gradient, a picture on the left that fades into it, 45-degree stripes,
// a pale half-ellipse of gloss over the top half, and a short pixel caption on the right in white
// with a 1 px black outline. The period font was Visitor TT2 BRK; nothing of it is used here.
// Every letter below comes from a 5 x 5 alphabet drawn from scratch for this file, and every
// picture is an original glyph (no product logos, which is what real userbars were made of).
//
// Nothing is <text>: captions are pixel runs merged into paths, so they look the same for every
// viewer. Each bar is authored on the real 350 x 19 grid and shown at 1x or exactly 2x. The six
// signature bars also come in the era's 150 x 19 short form (-short.svg), and the banner in a
// 150 x 72 one, which the README swaps in on narrow screens through <picture>, so the captions stay
// readable on a phone.
// Motion is CSS only and deliberately small: one highlight that sweeps each bar, and in the title
// piece a belt that carries freshly rolled userbars past. prefers-reduced-motion stops all of it.

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const ASSETS = resolve(here, '../assets');
const SLUG = '39-userbar-kit_opus_5.5';

const f = (v) => {
  const s = (Math.round(v * 100) / 100).toString();
  return s === '-0' ? '0' : s;
};
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// ------------------------------------------------------------------ the 5 x 5 alphabet
// Original letters: wide, square, capitals only, five rows high. '#' is ink.
const FONT = {
  A: ['..#..', '.#.#.', '#...#', '#####', '#...#'],
  B: ['####.', '#...#', '####.', '#...#', '####.'],
  C: ['.####', '#....', '#....', '#....', '.####'],
  D: ['####.', '#...#', '#...#', '#...#', '####.'],
  E: ['#####', '#....', '####.', '#....', '#####'],
  F: ['#####', '#....', '####.', '#....', '#....'],
  G: ['.####', '#....', '#..##', '#...#', '.####'],
  H: ['#...#', '#...#', '#####', '#...#', '#...#'],
  I: ['###', '.#.', '.#.', '.#.', '###'],
  J: ['..###', '....#', '....#', '#...#', '.###.'],
  K: ['#...#', '#..#.', '###..', '#..#.', '#...#'],
  L: ['#....', '#....', '#....', '#....', '#####'],
  M: ['#...#', '##.##', '#.#.#', '#...#', '#...#'],
  N: ['#...#', '##..#', '#.#.#', '#..##', '#...#'],
  O: ['.###.', '#...#', '#...#', '#...#', '.###.'],
  P: ['####.', '#...#', '####.', '#....', '#....'],
  Q: ['.###.', '#...#', '#...#', '#..#.', '.##.#'],
  R: ['####.', '#...#', '####.', '#..#.', '#...#'],
  S: ['.####', '#....', '.###.', '....#', '####.'],
  T: ['#####', '..#..', '..#..', '..#..', '..#..'],
  U: ['#...#', '#...#', '#...#', '#...#', '.###.'],
  V: ['#...#', '#...#', '#...#', '.#.#.', '..#..'],
  W: ['#...#', '#...#', '#.#.#', '##.##', '#...#'],
  X: ['#...#', '.#.#.', '..#..', '.#.#.', '#...#'],
  Y: ['#...#', '.#.#.', '..#..', '..#..', '..#..'],
  Z: ['#####', '...#.', '..#..', '.#...', '#####'],
  0: ['.###.', '#..##', '#.#.#', '##..#', '.###.'],
  1: ['.#.', '##.', '.#.', '.#.', '###'],
  2: ['####.', '....#', '.###.', '#....', '#####'],
  3: ['####.', '....#', '.###.', '....#', '####.'],
  4: ['#..#.', '#..#.', '#####', '...#.', '...#.'],
  5: ['#####', '#....', '####.', '....#', '####.'],
  6: ['.###.', '#....', '####.', '#...#', '.###.'],
  7: ['#####', '....#', '...#.', '..#..', '..#..'],
  8: ['.###.', '#...#', '.###.', '#...#', '.###.'],
  9: ['.###.', '#...#', '.####', '....#', '.###.'],
  ' ': ['..', '..', '..', '..', '..'],
  '.': ['.', '.', '.', '.', '#'],
  ',': ['..', '..', '..', '.#', '#.'],
  ':': ['.', '#', '.', '#', '.'],
  '·': ['...', '...', '.#.', '...', '...'],
  '-': ['...', '...', '###', '...', '...'],
  '+': ['...', '.#.', '###', '.#.', '...'],
  '/': ['..#', '..#', '.#.', '#..', '#..'],
  '!': ['#', '#', '#', '.', '#'],
  '?': ['###.', '...#', '.##.', '....', '.#..'],
  "'": ['#', '#', '.', '.', '.'],
  '(': ['.#', '#.', '#.', '#.', '.#'],
  ')': ['#.', '.#', '.#', '.#', '#.'],
  '*': ['#.#', '.#.', '#.#', '...', '...'],
  '%': ['#...#', '...#.', '..#..', '.#...', '#...#'],
  '>': ['#..', '.#.', '..#', '.#.', '#..'],
};

// ------------------------------------------------------------------ bitmap helpers
// A bitmap is { w, h, d: Uint8Array } with d[y * w + x] = 1 for ink.
const bmp = (w, h) => ({ w, h, d: new Uint8Array(w * h) });
const get = (b, x, y) => (x < 0 || y < 0 || x >= b.w || y >= b.h ? 0 : b.d[y * b.w + x]);

function glyph(ch) {
  const rows = FONT[ch];
  if (!rows) throw new Error(`no glyph for "${ch}"`);
  const b = bmp(rows[0].length, 5);
  rows.forEach((r, y) => [...r].forEach((c, x) => { if (c === '#') b.d[y * b.w + x] = 1; }));
  return b;
}

// Lay a string out at 1x with 1 px between letters.
function line(str) {
  const gs = [...str].map(glyph);
  const w = gs.reduce((n, g) => n + g.w, 0) + gs.length - 1;
  const out = bmp(w, 5);
  let x = 0;
  for (const g of gs) {
    for (let yy = 0; yy < 5; yy++) for (let xx = 0; xx < g.w; xx++) if (g.d[yy * g.w + xx]) out.d[yy * w + x + xx] = 1;
    x += g.w + 1;
  }
  return out;
}

// Scale3x (the pixel-art upscaler): triples a bitmap and steps the diagonals instead of leaving
// 3 x 3 blocks, so the big title letters get chamfered corners without being redrawn by hand.
function scale3x(src) {
  const out = bmp(src.w * 3, src.h * 3);
  for (let y = 0; y < src.h; y++) {
    for (let x = 0; x < src.w; x++) {
      const A = get(src, x - 1, y - 1), B = get(src, x, y - 1), C = get(src, x + 1, y - 1);
      const D = get(src, x - 1, y), E = get(src, x, y), F = get(src, x + 1, y);
      const G = get(src, x - 1, y + 1), H = get(src, x, y + 1), I = get(src, x + 1, y + 1);
      let e = [E, E, E, E, E, E, E, E, E];
      if (B !== H && D !== F) {
        e = [
          D === B ? D : E,
          (D === B && E !== C) || (B === F && E !== A) ? B : E,
          B === F ? F : E,
          (D === B && E !== G) || (D === H && E !== A) ? D : E,
          E,
          (B === F && E !== I) || (H === F && E !== C) ? F : E,
          D === H ? D : E,
          (D === H && E !== I) || (H === F && E !== G) ? H : E,
          H === F ? F : E,
        ];
      }
      for (let k = 0; k < 9; k++) out.d[(y * 3 + Math.floor(k / 3)) * out.w + x * 3 + (k % 3)] = e[k];
    }
  }
  return out;
}

// Scale2x, the same idea at double size: used for the short-form banner.
function scale2x(src) {
  const out = bmp(src.w * 2, src.h * 2);
  for (let y = 0; y < src.h; y++) {
    for (let x = 0; x < src.w; x++) {
      const B = get(src, x, y - 1), D = get(src, x - 1, y), E = get(src, x, y), F = get(src, x + 1, y), H = get(src, x, y + 1);
      let e = [E, E, E, E];
      if (B !== H && D !== F) e = [D === B ? D : E, B === F ? F : E, D === H ? D : E, H === F ? F : E];
      for (let k = 0; k < 4; k++) out.d[(y * 2 + (k >> 1)) * out.w + x * 2 + (k & 1)] = e[k];
    }
  }
  return out;
}

// Grow the ink by r pixels. round = false gives the square 8-neighbour outline a 1 px stroke makes;
// round = true gives a disc, used for the soft pixel glow. The result is padded by r on each side.
function dilate(src, r, round = false) {
  const out = bmp(src.w + 2 * r, src.h + 2 * r);
  const offs = [];
  for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (!round || dx * dx + dy * dy <= r * r + r) offs.push([dx, dy]);
  for (let y = 0; y < src.h; y++) for (let x = 0; x < src.w; x++) {
    if (!src.d[y * src.w + x]) continue;
    for (const [dx, dy] of offs) out.d[(y + r + dy) * out.w + x + r + dx] = 1;
  }
  return out;
}

// Merge ink into horizontal runs, then stack identical runs into taller rectangles: one path.
function toPath(b, ox, oy) {
  const open = new Map();
  const rects = [];
  for (let y = 0; y <= b.h; y++) {
    const now = new Map();
    if (y < b.h) {
      let x = 0;
      while (x < b.w) {
        if (!b.d[y * b.w + x]) { x++; continue; }
        let e = x;
        while (e < b.w && b.d[y * b.w + e]) e++;
        const key = `${x},${e - x}`;
        const prev = open.get(key);
        if (prev) { prev.h++; now.set(key, prev); open.delete(key); } else now.set(key, { x, y, w: e - x, h: 1 });
        x = e;
      }
    }
    for (const r of open.values()) rects.push(r);
    open.clear();
    for (const [k, r] of now) open.set(k, r);
  }
  rects.sort((a, c) => a.y - c.y || a.x - c.x);
  return rects.map((r) => `M${r.x + ox} ${r.y + oy}h${r.w}v${r.h}h${-r.w}z`).join('');
}

// A caption: white pixels over the same pixels grown by one in black. x is the left edge.
function caption(str, x, y, fill = '#fff') {
  const b = line(str);
  return `<path fill="#000" d="${toPath(dilate(b, 1), x - 1, y - 1)}"/><path fill="${fill}" d="${toPath(b, x, y)}"/>`;
}
const widthOf = (str) => line(str).w;

// ------------------------------------------------------------------ shared bar parts
const BAR_W = 350;
const BAR_H = 19;

// 45-degree stripes, lower left to upper right, as a 4 x 4 staircase of single pixels.
const stripes = (id, op) =>
  `<pattern id="${id}" width="4" height="4" patternUnits="userSpaceOnUse"><path fill="#fff" fill-opacity="${op}" d="M0 3h1v1h-1zM1 2h1v1h-1zM2 1h1v1h-1zM3 0h1v1h-1z"/></pattern>`;

const CSS_SWEEP = (dur, delay, from, to) =>
  `.sw{animation:sw ${dur}s linear ${delay}s infinite backwards}` +
  `@keyframes sw{0%{transform:translateX(${from}px)}14%{transform:translateX(${to}px)}100%{transform:translateX(${to}px)}}`;

function cogPath(cx, cy, ro, ri, hole, teeth = 8) {
  const step = (Math.PI * 2) / teeth;
  const tb = step * 0.3; // half-width of a tooth at its root
  const tt = step * 0.19; // and at its tip
  const pt = (r, a) => `${f(cx + r * Math.cos(a))} ${f(cy + r * Math.sin(a))}`;
  let d = '';
  for (let k = 0; k < teeth; k++) {
    const a = k * step - Math.PI / 2;
    d += `${k ? 'L' : 'M'}${pt(ri, a - tb)}L${pt(ro, a - tt)}L${pt(ro, a + tt)}L${pt(ri, a + tb)}`;
    d += `A${f(ri)} ${f(ri)} 0 0 1 ${pt(ri, a + step - tb)}`;
  }
  d += `zM${f(cx - hole)} ${f(cy)}a${f(hole)} ${f(hole)} 0 1 0 ${f(hole * 2)} 0a${f(hole)} ${f(hole)} 0 1 0 ${f(-hole * 2)} 0z`;
  return d;
}
const hexPoints = (cx, cy, r, rot = 0) =>
  Array.from({ length: 6 }, (_, k) => {
    const a = rot + (k * Math.PI) / 3;
    return `${f(cx + r * Math.cos(a))},${f(cy + r * Math.sin(a))}`;
  }).join(' ');

// ------------------------------------------------------------------ the left-hand pictures
// Each is an original glyph in bar coordinates (350 x 19), bigger than the strip where it can be
// so the strip crops it, and it fades into the gradient on its right.
const W = (a) => `fill="#fff" fill-opacity="${a}"`;
const S = (a, sw) => `fill="none" stroke="#fff" stroke-opacity="${a}" stroke-width="${sw}"`;
const K = (a) => `fill="#000" fill-opacity="${a}"`;

const PICS = {
  // five phases: five pillars, the last one leaving the strip
  phases: () =>
    [4, 7, 10, 13].map((h, i) => `<rect x="${5 + i * 11}" y="${19 - h}" width="8" height="${h}" ${W(f(0.5 + i * 0.1))}/>`).join('') +
    `<rect x="49" y="-2" width="8" height="22" ${W(0.95)}/>` +
    `<path ${K(0.28)} d="M5 17h8v2h-8zM16 17h8v2h-8zM27 17h8v2h-8zM38 17h8v2h-8zM49 17h8v2h-8z"/>` +
    `<path ${S(0.75, 1.2)} d="M63 15l4-4 4 4M63 10l4-4 4 4M63 5l4-4 4 4"/>`,
  // items: a hex nut and an ingot
  items: () =>
    `<path ${W(0.9)} fill-rule="evenodd" d="M${hexPoints(15, 9.5, 12).replace(/ /g, 'L')}zM10 9.5a5 5 0 1 0 10 0a5 5 0 1 0-10 0z"/>` +
    `<path ${W(0.92)} d="M36 16l4-8h16l4 8z"/><path ${W(0.62)} d="M40 8l4-3.5h16l-4 3.5z"/><path ${W(0.4)} d="M56 8l4-3.5 4 8-4 3.5z"/>`,
  // buildings: a sawtooth-roofed factory and its chimneys
  buildings: () =>
    `<path ${W(0.9)} d="M4 19V4l12 6V4l12 6V4l12 6h22v9z"/><path ${W(0.9)} d="M46-2h6v12h-6zM55 3h5v7h-5z"/>` +
    `<path ${K(0.34)} d="M8 13h4v3h-4zM16 13h4v3h-4zM24 13h4v3h-4zM32 13h4v3h-4zM44 13h5v6h-5zM53 13h4v3h-4z"/>`,
  // live: a play button sending rings out
  live: () =>
    `<circle cx="16" cy="9.5" r="11.5" ${S(0.92, 2.6)}/><path ${W(0.96)} d="M12.2 4.4v10.2l9.4-5.1z"/>` +
    [20, 27, 34].map((r, i) => {
      const a = 0.62;
      return `<path ${S(f(0.75 - i * 0.2), 2)} d="M${f(16 + r * Math.cos(-a))} ${f(9.5 + r * Math.sin(-a))}A${r} ${r} 0 0 1 ${f(16 + r * Math.cos(a))} ${f(9.5 + r * Math.sin(a))}"/>`;
    }).join(''),
  // run: a shell prompt and a block cursor
  run: () =>
    `<path ${S(0.96, 3.4)} d="M7 2.5l9.5 7-9.5 7"/><rect class="cur" x="22" y="13.2" width="12" height="3.4" ${W(0.96)}/>` +
    `<path ${W(0.42)} d="M40 3.5h20v2h-20zM40 8.5h13v2h-13z"/>`,
  // fan project: a heart
  fan: () =>
    `<path ${W(0.92)} d="M18 18.5C3 9 8-2.5 18 4.6C28-2.5 33 9 18 18.5z"/><path ${W(0.75)} d="M40 3h2v4h4v2h-4v4h-2v-4h-4v-2h4z"/>` +
    `<path ${W(0.5)} d="M53 9h1.4v2.6h2.6v1.4h-2.6v2.6h-1.4v-2.6h-2.6v-1.4h2.6z"/>`,
  // the project's own bar: a hexagon with a cog inside (original drawing)
  user: () =>
    `<polygon points="${hexPoints(16, 9.5, 9.6)}" ${W(0.22)}/><polygon points="${hexPoints(16, 9.5, 9.6)}" ${S(0.97, 1.8)}/>` +
    `<path ${W(0.97)} fill-rule="evenodd" d="${cogPath(16, 9.5, 5.9, 4.1, 1.8)}"/>` +
    `<polygon points="${hexPoints(40, 9.5, 9.6)}" ${S(0.5, 1.2)}/><polygon points="${hexPoints(61, 9.5, 9.6)}" ${S(0.3, 1.2)}/>`,
  monitor: () =>
    `<rect x="4" y="2" width="24" height="12" ${S(0.95, 2)}/><path ${W(0.95)} d="M14 14h4v3h4v1.5h-12v-1.5h4z"/>` +
    `<rect x="34" y="2" width="24" height="12" ${W(0.4)}/><rect x="34" y="2" width="24" height="12" ${S(0.95, 2)}/><path ${W(0.95)} d="M44 14h4v3h4v1.5h-12v-1.5h4z"/>` +
    `<path ${W(0.9)} d="M37 5h12v1.5h-12zM37 8h17v1.5h-17z"/>`,
  alttab: () =>
    `<rect x="4" y="2" width="28" height="14" ${W(0.4)}/><rect x="4" y="2" width="28" height="3.4" ${W(0.8)}/>` +
    `<rect x="18" y="7" width="32" height="14" ${W(0.72)}/><rect x="18" y="7" width="32" height="3.6" ${W(1)}/>` +
    `<path ${K(0.35)} d="M21 13h18v1.6h-18zM21 16.4h26v1.6h-26z"/><path ${S(0.8, 1.6)} d="M55 6l5 3.5-5 3.5"/>`,
  // a phone leaning on a mug, screen towards you
  phone: () =>
    `<path ${W(0.92)} d="M36 6h13v9.5a3 3 0 0 1-3 3h-7a3 3 0 0 1-3-3z"/><path ${S(0.92, 1.8)} d="M49 8.5h2.4a2.6 2.6 0 0 1 0 6.4h-2.4"/>` +
    `<path ${S(0.6, 1.2)} d="M39.5 4c-1.6-1.6 1.6-2.6 0-4.4M44.5 4c-1.6-1.6 1.6-2.6 0-4.4"/>` +
    `<g transform="rotate(24 24 18)"><rect x="17" y="0.5" width="11" height="19" rx="2" ${W(0.95)}/><path ${K(0.4)} d="M19 3.5h7v11h-7z"/>` +
    `<path ${W(0.85)} d="M20 5h5v1h-5zM20 7.4h5v1h-5zM20 9.8h3v1h-3z"/></g>`,
  manifold: () =>
    `<path ${W(0.95)} d="M-1 2.4h70v2.6h-70z"/>` +
    [8, 22, 36, 50].map((x) => `<path ${W(0.95)} d="M${x} 5h2.6v6h-2.6z"/><rect x="${x - 3.2}" y="10.6" width="9" height="6" ${W(0.85)}/>`).join('') +
    `<path ${K(0.3)} d="M6 13h6.6v1.4h-6.6zM20 13h6.6v1.4h-6.6zM34 13h6.6v1.4h-6.6zM48 13h6.6v1.4h-6.6z"/>`,
  balancer: () =>
    `<path ${S(0.95, 2)} stroke-linejoin="round" d="M-1 9.5h13M12 9.5l9-5h6M12 9.5l9 5h6M27 4.5l9-2.6h5M27 4.5l9 2.6h5M27 14.5l9-2.6h5M27 14.5l9 2.6h5"/>` +
    [0.4, 5.6, 10.4, 15.6].map((y) => `<rect x="41" y="${y}" width="7" height="3" ${W(0.9)}/>`).join(''),
  spaghetti: () =>
    `<path ${S(0.5, 2.4)} d="M-2 9C8 1 22 21 40 14S60 1 76 16"/>` +
    `<path ${S(0.95, 2.4)} d="M-2 3.5C10-7 14 25 28 10S50-3 72 12"/>` +
    `<path ${S(0.72, 2.4)} d="M-2 15C12 27 18-5 34 8S52 23 74 3"/>` +
    `<path ${S(0.9, 2.4)} d="M6 20C8 8 30-6 38 4S26 20 44 17S58 6 64 20"/>`,
  tidy: () => {
    let d = '';
    for (let r = 0; r < 3; r++) for (let c = 0; c < 7; c++) d += `M${4 + c * 9} ${2 + r * 5.5}h6.5v3.5h-6.5z`;
    return `<path ${W(0.9)} d="${d}"/>`;
  },
  overclock: () => {
    const cx = 19, cy = 17.5, r = 14;
    const p = (rr, deg) => `${f(cx + rr * Math.cos((deg * Math.PI) / 180))} ${f(cy + rr * Math.sin((deg * Math.PI) / 180))}`;
    let ticks = '';
    for (let a = 180; a <= 360; a += 30) ticks += `M${p(r - 1, a)}L${p(r - 4.5, a)}`;
    return (
      `<path ${S(0.95, 2.4)} d="M${p(r, 180)}A${r} ${r} 0 0 1 ${p(r, 360)}"/><path ${S(0.8, 1.3)} d="${ticks}"/>` +
      `<path ${S(1, 2.2)} stroke-linecap="round" d="M${cx} ${cy}L${p(11.5, 338)}"/><circle cx="${cx}" cy="${cy}" r="2.6" ${W(1)}/>` +
      `<path ${W(0.95)} d="M51 0l-9 10.5h5.5l-4 8.5 11-11.5h-5.5l4.5-7.5z"/>`
    );
  },
  alts: () =>
    `<path ${S(0.95, 2.4)} d="M2 4.5h10c9 0 9 10 18 10h9"/><path ${S(0.6, 2.4)} d="M2 14.5h10c9 0 9-10 18-10h9"/>` +
    `<path ${W(0.95)} d="M38 10.5l7.5 4-7.5 4z"/><path ${W(0.6)} d="M38 .5l7.5 4-7.5 4z"/>`,
  screws: () => {
    const screw = (x, y, rot, a) =>
      `<g transform="translate(${x} ${y}) rotate(${rot})"><path ${W(a)} d="M0-3.6h2.6v7.2h-2.6zM2.6-1.3h10l2.6 1.3-2.6 1.3h-10z"/><path ${K(0.4)} d="M5-1.3h1v2.6h-1zM7.5-1.3h1v2.6h-1zM10-1.3h1v2.6h-1z"/></g>`;
    return screw(4, 5, 18, 0.95) + screw(24, 15, -22, 0.8) + screw(34, 4, 200, 0.9) + screw(44, 13, 36, 0.95) + screw(62, 5, 160, 0.7) + screw(16, 16, 172, 0.6);
  },
  cone: () =>
    `<path ${W(0.95)} d="M15.6 1h4.8l5.2 14h-15.2z"/><path ${W(0.95)} d="M6 15h24v3.4h-24z"/><path ${K(0.42)} d="M14 5.6h8l1.4 3.6h-10.8z"/>` +
    `<path ${S(0.75, 1.6)} d="M38 0v19M56 0v19M38 2l18 15M56 2l-18 15"/><path ${W(0.75)} d="M35 8.6h24v1.8h-24z"/>`,
  pipe: () =>
    `<rect x="-2" y="5.5" width="72" height="8" ${W(0.5)}/><path ${W(0.8)} d="M-2 5.5h72v2h-72z"/>` +
    `<path ${W(0.92)} d="M9 4h3.4v11h-3.4zM52 4h3.4v11h-3.4z"/>` +
    `<rect x="26" y="-1" width="13" height="21" ${W(0.78)}/><path ${K(0.34)} d="M26 3h13v1h-13zM26 8h13v1h-13zM26 13h13v1h-13zM32-1h1v4h-1zM29 4h1v4h-1zM35 4h1v4h-1zM32 9h1v4h-1zM29 14h1v5h-1zM35 14h1v5h-1z"/>` +
    `<rect x="26" y="5.5" width="13" height="8" ${W(0.55)}/>`,
  fuse: () =>
    `<rect x="7" y="4.5" width="46" height="10" rx="2" ${S(0.85, 1.8)}/><path ${W(0.92)} d="M7 4.5h9v10h-9zM44 4.5h9v10h-9z"/>` +
    `<path ${S(0.95, 1.6)} d="M16 9.5h8M36 9.5h8"/><path ${S(1, 1.4)} stroke-linejoin="miter" d="M25.5 5.5l2.6 4.6 2.4-3 3 6"/>` +
    `<path ${W(0.9)} d="M60 2h1.6v2.6h-1.6zM64 6h2.6v1.6h-2.6zM60 9.6h1.6v2.6h-1.6z"/>`,
  sheet: () =>
    `<rect x="3" y="1.5" width="58" height="16" ${W(0.28)}/><rect x="3" y="1.5" width="58" height="4" ${W(0.95)}/>` +
    `<path ${S(0.85, 1)} d="M3 1.5h58v16h-58zM3 9.5h58M3 13.5h58M3 5.5h58M17.5 1.5v16M32.5 1.5v16M47.5 1.5v16"/>` +
    `<path ${W(0.9)} d="M20 7h9v1.4h-9zM35 11h9v1.4h-9zM6 15h8v1.4h-8z"/>`,
  ruler: () => {
    let d = '';
    for (let x = 3; x <= 66; x += 3) d += `M${x} ${x % 12 === 3 ? 9 : x % 6 === 3 ? 12 : 14.5}h1.2V19h-1.2z`;
    return `<path ${W(0.9)} d="${d}"/><path ${S(0.85, 1.4)} d="M4 4.5h60M4 1.5v6M64 1.5v6"/><path ${W(0.9)} d="M8 2l-4 2.5 4 2.5zM60 2l4 2.5-4 2.5z"/>`;
  },
};

// ------------------------------------------------------------------ one 350 x 19 userbar
function userbar({ name, c1, c2, pic, fact, cap, delay = 0.4, fade, alt, css = '', still = '', w = BAR_W }) {
  const BAR_W = w; // 350, or 150 for the short form
  const short = w < 350;
  const capW = widthOf(cap);
  const capX = BAR_W - 7 - capW;
  if (capX < 30) throw new Error(`${name}: caption too long for a ${w} px bar`);
  if (short) { fact = null; fade = [Math.max(12, capX - 30), capX - 3]; }
  if (!fade) fade = fact ? [48, 82] : [42, 94];
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${BAR_W} ${BAR_H}" width="${BAR_W}" height="${BAR_H}" role="img" aria-label="${esc(alt)}">`;
  s += `<title>${esc(alt)}</title>`;
  s += '<defs>';
  s += `<linearGradient id="bg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>`;
  s += '<linearGradient id="sh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></linearGradient>';
  s += '<linearGradient id="gl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".5"/><stop offset="1" stop-color="#fff" stop-opacity=".2"/></linearGradient>';
  s += `<linearGradient id="fd" gradientUnits="userSpaceOnUse" x1="${fade[0]}" y1="0" x2="${fade[1]}" y2="0"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#000"/></linearGradient>`;
  s += '<linearGradient id="sg" gradientUnits="userSpaceOnUse" x1="9.5" y1="9.5" x2="17.5" y2="17.5"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".62"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>';
  s += `<mask id="fm" maskUnits="userSpaceOnUse" x="-4" y="-4" width="${BAR_W}" height="28"><rect x="-4" y="-4" width="${BAR_W}" height="28" fill="url(#fd)"/></mask>`;
  s += `<clipPath id="cl"><rect width="${BAR_W}" height="${BAR_H}"/></clipPath>`;
  s += stripes('st', 0.14);
  s += `<style>${CSS_SWEEP(9, delay, -40, BAR_W + 30)}${css}@media (prefers-reduced-motion:reduce){.sw{animation:none;display:none}${still}}</style>`;
  s += '</defs>';
  s += '<g clip-path="url(#cl)">';
  s += `<rect width="${BAR_W}" height="${BAR_H}" fill="url(#bg)"/>`;
  s += `<rect width="${BAR_W}" height="${BAR_H}" fill="url(#sh)"/>`;
  const art = PICS[pic]();
  const shade = art.replace(/#fff/g, '#000');
  s += `<g mask="url(#fm)"><g transform="translate(1 1)" opacity=".3">${shade}</g>${art}</g>`;
  s += `<rect width="${BAR_W}" height="${BAR_H}" fill="url(#st)" shape-rendering="crispEdges"/>`;
  s += `<ellipse cx="${f(BAR_W / 2)}" cy="-7" rx="${f((BAR_W * 222) / 350)}" ry="16.5" fill="url(#gl)"/>`;
  s += '<g shape-rendering="crispEdges">';
  if (fact) {
    // the quiet line: pressed into the bar, dark with a light lower lip
    const b = line(fact);
    const fx = 84;
    if (fx + b.w > capX - 10) throw new Error(`${name}: fact and caption collide`);
    s += `<path fill="#fff" fill-opacity=".3" d="${toPath(b, fx, 8)}"/><path fill="#000" fill-opacity=".72" d="${toPath(b, fx, 7)}"/>`;
  }
  s += caption(cap, capX, 7);
  s += '</g>';
  s += `<polygon class="sw" points="19,0 35,0 16,19 0,19" fill="url(#sg)"/>`;
  s += `<rect x="1.5" y="1.5" width="${BAR_W - 3}" height="${BAR_H - 3}" fill="none" stroke="#fff" stroke-opacity=".22" shape-rendering="crispEdges"/>`;
  s += `<rect x=".5" y=".5" width="${BAR_W - 1}" height="${BAR_H - 1}" fill="none" stroke="#000" shape-rendering="crispEdges"/>`;
  s += '</g></svg>\n';
  return s;
}

// The six bars of the signature, in tab colours where a tab exists. `delay` staggers the sweep so
// the highlight runs down the stack like a row of shutters.
const MAIN = [
  { name: 'objectives', c1: '#b673ff', c2: '#4a10b0', pic: 'phases', fact: '5 SPACE ELEVATOR PHASES', cap: 'OBJECTIVES USER',
    alt: 'Userbar, purple: OBJECTIVES USER. 5 Space Elevator phases.' },
  { name: 'items', c1: '#ff5cad', c2: '#ad0f55', pic: 'items', fact: '140 ITEMS · 211 RECIPES', cap: 'ITEMS USER',
    alt: 'Userbar, hot pink: ITEMS USER. 140 items, 211 recipes.' },
  { name: 'buildings', c1: '#4fc6ff', c2: '#0a4fa6', pic: 'buildings', fact: '477 BUILDINGS · 9 MACHINES', cap: 'BUILDINGS USER',
    alt: 'Userbar, electric blue: BUILDINGS USER. 477 buildings, 9 of them production machines.' },
  { name: 'live', c1: '#ffd42e', c2: '#c87a00', pic: 'live', fact: 'NO INSTALL · RUNS IN A TAB', cap: 'LIVE BROWSER USER',
    alt: 'Userbar, gold: LIVE BROWSER USER. No install, runs in a tab.' },
  { name: 'run', c1: '#52dc7c', c2: '#0b7030', pic: 'run', fact: '2 COMMANDS · PYTHON 3.10+', cap: 'LOCALHOST:8501 USER',
    css: '.cur{animation:cur 1.2s steps(1) infinite}@keyframes cur{0%{opacity:1}60%{opacity:0}}', still: '.cur{animation:none}',
    alt: 'Userbar, green: LOCALHOST:8501 USER. 2 commands, Python 3.10+.' },
  { name: 'fan', c1: '#d3dae3', c2: '#566273', pic: 'fan', fact: 'UNOFFICIAL · APACHE 2.0', cap: 'FAN PROJECT USER',
    alt: 'Userbar, silver: FAN PROJECT USER. Unofficial, Apache 2.0.' },
];

// The rest of the kit: declare your allegiance, 2006 style. Classic single caption, no small print.
const KIT = [
  { name: 'user', c1: '#1fd6ff', c2: '#0a45b4', pic: 'user', cap: 'ULTRA-SATISFACTORY USER' },
  { name: 'ruler', c1: '#ec7cff', c2: '#8f0fa3', pic: 'ruler', cap: '350 X 19 USER' },
  { name: 'monitor', c1: '#93a2b8', c2: '#283347', pic: 'monitor', cap: 'SECOND MONITOR USER' },
  { name: 'alttab', c1: '#7f8aff', c2: '#2b21a0', pic: 'alttab', cap: 'ALT-TAB USER' },
  { name: 'phone', c1: '#3fdcc6', c2: '#0a6a62', pic: 'phone', cap: 'PHONE AGAINST THE MUG USER' },
  { name: 'sheet', c1: '#3fd672', c2: '#0f5c2a', pic: 'sheet', cap: 'EX-SPREADSHEET USER' },
  { name: 'manifold', c1: '#9fdc32', c2: '#35720c', pic: 'manifold', cap: 'MANIFOLD USER' },
  { name: 'balancer', c1: '#b39cff', c2: '#5a1cc0', pic: 'balancer', cap: 'LOAD BALANCER USER' },
  { name: 'spaghetti', c1: '#ffab4f', c2: '#d41c1c', pic: 'spaghetti', cap: 'SPAGHETTI USER' },
  { name: 'tidy', c1: '#dbe2ea', c2: '#566273', pic: 'tidy', cap: 'TIDY FACTORY USER' },
  { name: 'overclock', c1: '#ffc928', c2: '#dc1f1f', pic: 'overclock', cap: 'OVERCLOCK USER' },
  { name: 'fuse', c1: '#5d5d68', c2: '#08080a', pic: 'fuse', cap: 'TRIPPED FUSE USER' },
  { name: 'alts', c1: '#ffc83a', c2: '#ad4e08', pic: 'alts', cap: '88 ALTERNATE RECIPES USER' },
  { name: 'screws', c1: '#e39a68', c2: '#6f350e', pic: 'screws', cap: 'BOX FULL OF SCREWS USER' },
  { name: 'cone', c1: '#ffd21f', c2: '#b87a00', pic: 'cone', cap: 'TEMPORARY SETUP USER (LOAD-BEARING)' },
  { name: 'pipe', c1: '#72b0ff', c2: '#19327f', pic: 'pipe', cap: 'WHAT PIPE? USER' },
];

// ------------------------------------------------------------------ the wide title piece
// A signature banner in userbar dress: 350 x 76 on the same pixel grid, shown at exactly 2x.
const MINI = [
  ['#b673ff', '#4a10b0'],
  ['#ff5cad', '#ad0f55'],
  ['#4fc6ff', '#0a4fa6'],
  ['#ffd42e', '#c87a00'],
  ['#52dc7c', '#0b7030'],
  ['#d3dae3', '#566273'],
];

function titleWord(word, x, y, gap, k = 3) {
  // each letter enlarged k times (Scale3x or Scale2x), set `gap` apart
  const up = k === 3 ? scale3x : scale2x;
  let cx = x;
  const parts = [];
  for (const ch of word) {
    const g = up(glyph(ch));
    parts.push({ g, x: cx });
    cx += g.w + gap;
  }
  const w = cx - gap - x;
  const h = 5 * k;
  const all = bmp(w, h);
  for (const p of parts) for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < p.g.w; xx++) if (p.g.d[yy * p.g.w + xx]) all.d[yy * w + (p.x - x) + xx] = 1;
  return { b: all, x, y, w, h };
}
const titleWidth = (word, gap, k) => [...word].reduce((n, ch) => n + glyph(ch).w * k + gap, -gap);

// Two layouts share one drawing routine: the 350 x 76 banner, and a 150 x 72 short form for narrow
// screens with the name stacked on two lines.
const HERO_LAYOUTS = {
  wide: { W: 350, H: 76, cx: 27, cy: 27, hexR: 33, cog: [21, 15.5, 6.5], hexSW: [7, 2.2], cogSW: [5, 1.8], fade: [34, 72], beltY: 58, pitch: 'EVERY RECIPE, BUILDING AND OBJECTIVE, ONE CLICK APART', pitchY: 33 },
  short: { W: 150, H: 72, cx: 15, cy: 11, hexR: 18, cog: [11.5, 8.4, 3.5], hexSW: [5, 1.8], cogSW: [3.5, 1.4], fade: [24, 50], beltY: 60, pitch: 'RECIPES, ONE CLICK APART', pitchY: 40 },
};

function hero(kind = 'wide') {
  const L = HERO_LAYOUTS[kind];
  const { W: HERO_W, H: HERO_H, cx, cy, beltY } = L;
  const alt = kind === 'wide'
    ? 'ULTRA SATISFACTORY: every recipe, building and objective, one click apart.'
    : 'ULTRA SATISFACTORY: recipes, one click apart.';
  let ultra, satis;
  if (kind === 'wide') {
    const GAP = 2;
    const wordGap = 9;
    const ultraW = titleWidth('ULTRA', GAP, 3);
    const total = ultraW + wordGap + titleWidth('SATISFACTORY', GAP, 3);
    const tx = HERO_W - 9 - total;
    ultra = titleWord('ULTRA', tx, 12, GAP, 3);
    satis = titleWord('SATISFACTORY', tx + ultraW + wordGap, 12, GAP, 3);
  } else {
    // stacked and right-aligned: ULTRA at 3x over SATISFACTORY at 2x
    ultra = titleWord('ULTRA', HERO_W - 9 - titleWidth('ULTRA', 2, 3), 7, 2, 3);
    satis = titleWord('SATISFACTORY', HERO_W - 9 - titleWidth('SATISFACTORY', 1, 2), 26, 1, 2);
  }
  const pitch = L.pitch;
  const pitchX = HERO_W - 9 - widthOf(pitch);
  if (pitchX < 8) throw new Error(`hero ${kind}: pitch too long`);

  const glow = (t, r, color, op) => `<path fill="${color}" fill-opacity="${op}" d="${toPath(dilate(t.b, r, true), t.x - r, t.y - r)}"/>`;
  const word = (t, fill) =>
    `<path fill="#000" d="${toPath(dilate(t.b, 1), t.x - 1, t.y - 1)}"/><path fill="${fill}" d="${toPath(t.b, t.x, t.y)}"/>`;
  // a one-pixel light catch along the top row of each letter, a darker foot along the bottom
  const band = (t, y0, h, fill, op) => {
    const b = bmp(t.b.w, t.b.h);
    for (let yy = y0; yy < y0 + h; yy++) for (let xx = 0; xx < b.w; xx++) b.d[yy * b.w + xx] = t.b.d[yy * b.w + xx];
    return `<path fill="${fill}" fill-opacity="${op}" d="${toPath(b, t.x, t.y)}"/>`;
  };

  // the belt: minis ride a band that moves one whole pixel at a time, like a GIF would
  const SPACING = 56;
  const LOOP = SPACING * MINI.length; // 336
  let minis = '';
  for (let k = -7; k < 7; k++) {
    const x = 6 + k * SPACING;
    if (x > HERO_W) continue;
    const idx = ((k % MINI.length) + MINI.length) % MINI.length;
    const y = beltY - 9;
    minis += `<g transform="translate(${x} ${y})"><rect width="42" height="9" fill="#000"/><rect x="1" y="1" width="40" height="7" fill="url(#m${idx})"/>`;
    minis += `<path fill="#fff" fill-opacity=".34" d="M1 1h40v3h-40z"/><path fill="#fff" fill-opacity=".9" d="M3 3h4v3h-4zM${22 + (idx % 3) * 2} 4h4v2h-4zM${28 + (idx % 3) * 2} 4h2v2h-2zM32 4h${7 - (idx % 3) * 2}v2h${-(7 - (idx % 3) * 2)}z"/></g>`;
  }
  let marks = '';
  for (let x = -LOOP - 8; x < HERO_W + 8; x += 8) marks += `M${x} ${beltY + 2}h3v2h-3z`;
  let legs = '';
  for (let x = 22; x < HERO_W; x += 52) legs += `M${x} ${beltY + 6}h3v${HERO_H - beltY - 6}h-3zM${x - 3} ${HERO_H - 4}h9v3h-9z`;

  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${HERO_W} ${HERO_H}" width="${HERO_W * 2}" height="${HERO_H * 2}" role="img" aria-label="${esc(alt)}">`;
  s += `<title>${esc(alt)}</title>`;
  s += '<defs>';
  s += '<linearGradient id="bg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#010507"/><stop offset=".42" stop-color="#03202d"/><stop offset="1" stop-color="#0a86b4"/></linearGradient>';
  s += '<linearGradient id="vg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".5"/></linearGradient>';
  s += '<linearGradient id="gl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".34"/><stop offset="1" stop-color="#fff" stop-opacity=".1"/></linearGradient>';
  s += '<linearGradient id="tu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6fe6ff"/><stop offset=".5" stop-color="#00cfff"/><stop offset="1" stop-color="#009ed0"/></linearGradient>';
  s += '<linearGradient id="ts" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset=".55" stop-color="#fff"/><stop offset="1" stop-color="#c4dcea"/></linearGradient>';
  s += `<linearGradient id="fd" gradientUnits="userSpaceOnUse" x1="${L.fade[0]}" y1="0" x2="${L.fade[1]}" y2="0"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#000"/></linearGradient>`;
  const hh = HERO_H / 2;
  s += `<linearGradient id="sg" gradientUnits="userSpaceOnUse" x1="${hh}" y1="${hh}" x2="${hh + 17}" y2="${hh + 17}"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".5"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`;
  MINI.forEach(([a, b], i) => { s += `<linearGradient id="m${i}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`; });
  s += `<mask id="fm" maskUnits="userSpaceOnUse" x="-10" y="-10" width="${HERO_W}" height="${HERO_H + 20}"><rect x="-10" y="-10" width="${HERO_W}" height="${HERO_H + 20}" fill="url(#fd)"/></mask>`;
  s += `<clipPath id="cl"><rect width="${HERO_W}" height="${HERO_H}"/></clipPath>`;
  s += stripes('st', 0.085);
  s += '<style>';
  s += CSS_SWEEP(9, 0.25, -120, HERO_W + 10);
  s += `.belt{animation:belt 28s steps(${LOOP}) infinite}@keyframes belt{to{transform:translateX(${LOOP}px)}}`;
  s += `.cog{transform-origin:${cx}px ${cy}px;animation:cog 40s linear infinite}@keyframes cog{to{transform:rotate(360deg)}}`;
  s += '@media (prefers-reduced-motion:reduce){.sw,.belt,.cog{animation:none}.sw{display:none}}';
  s += '</style>';
  s += '</defs>';
  s += '<g clip-path="url(#cl)">';
  s += `<rect width="${HERO_W}" height="${HERO_H}" fill="url(#bg)"/>`;
  s += `<rect width="${HERO_W}" height="${HERO_H}" fill="url(#vg)"/>`;
  // the emblem: a hexagon with a cog inside, cropped by the strip and fading right
  const hex = hexPoints(cx, cy, L.hexR, Math.PI / 6);
  const cog = cogPath(cx, cy, ...L.cog);
  s += '<g mask="url(#fm)">';
  s += `<polygon points="${hex}" fill="#00cfff" fill-opacity=".1"/>`;
  s += `<polygon points="${hex}" fill="none" stroke="#00cfff" stroke-opacity=".22" stroke-width="${L.hexSW[0]}"/>`;
  s += `<polygon points="${hex}" fill="none" stroke="#7fe9ff" stroke-width="${L.hexSW[1]}"/>`;
  s += `<g class="cog"><path fill="#00cfff" fill-opacity=".22" stroke="#00cfff" stroke-opacity=".25" stroke-width="${L.cogSW[0]}" fill-rule="evenodd" d="${cog}"/>`;
  s += `<path fill="#00cfff" fill-opacity=".3" stroke="#9ff0ff" stroke-width="${L.cogSW[1]}" stroke-linejoin="round" fill-rule="evenodd" d="${cog}"/></g>`;
  s += '</g>';
  // the belt and what rides on it
  s += '<g shape-rendering="crispEdges">';
  s += `<path fill="#1b242e" d="${legs}"/>`;
  s += `<rect x="0" y="${beltY}" width="${HERO_W}" height="6" fill="#0d1219"/>`;
  s += `<rect x="0" y="${beltY}" width="${HERO_W}" height="1" fill="#5b6b7b"/><rect x="0" y="${beltY + 5}" width="${HERO_W}" height="1" fill="#000"/>`;
  s += `<g class="belt"><path fill="#34414e" d="${marks}"/>${minis}</g>`;
  s += '</g>';
  s += `<rect width="${HERO_W}" height="${HERO_H}" fill="url(#st)" shape-rendering="crispEdges"/>`;
  s += `<ellipse cx="${f(HERO_W / 2)}" cy="${f((-34 * HERO_H) / 76)}" rx="${f((270 * HERO_W) / 350)}" ry="${f((64 * HERO_H) / 76)}" fill="url(#gl)"/>`;
  s += '<g shape-rendering="crispEdges">';
  s += glow(ultra, 4, '#00cfff', 0.1) + glow(ultra, 3, '#00cfff', 0.14) + glow(ultra, 2, '#00cfff', 0.2);
  s += glow(satis, 4, '#bfeeff', 0.07) + glow(satis, 3, '#bfeeff', 0.1) + glow(satis, 2, '#bfeeff', 0.14);
  s += word(ultra, 'url(#tu)') + word(satis, 'url(#ts)');
  s += band(ultra, 0, 1, '#fff', 0.6) + band(satis, satis.h - 1, 1, '#7aa7bd', 0.55);
  s += caption(pitch, pitchX, L.pitchY);
  s += '</g>';
  s += `<polygon class="sw" points="${HERO_H},0 ${HERO_H + 34},0 34,${HERO_H} 0,${HERO_H}" fill="url(#sg)"/>`;
  s += `<rect x="1.5" y="1.5" width="${HERO_W - 3}" height="${HERO_H - 3}" fill="none" stroke="#fff" stroke-opacity=".16" shape-rendering="crispEdges"/>`;
  s += `<rect x=".5" y=".5" width="${HERO_W - 1}" height="${HERO_H - 1}" fill="none" stroke="#000" shape-rendering="crispEdges"/>`;
  s += '</g></svg>\n';
  return s;
}

// ------------------------------------------------------------------ write everything
mkdirSync(ASSETS, { recursive: true });
const written = [];
const put = (name, svg) => {
  const file = resolve(ASSETS, name);
  writeFileSync(file, svg);
  written.push(`${name}  ${(svg.length / 1024).toFixed(1)} KB`);
};
put(`${SLUG}.svg`, hero('wide'));
put(`${SLUG}-short.svg`, hero('short'));
MAIN.forEach((b, i) => put(`${SLUG}-${b.name}.svg`, userbar({ ...b, delay: f(0.55 + i * 0.16) })));
// the same six in the 150 x 19 short form, caption only, for narrow screens
MAIN.forEach((b, i) =>
  put(`${SLUG}-${b.name}-short.svg`, userbar({ ...b, w: 150, delay: f(0.55 + i * 0.16), alt: `Userbar, short form: ${b.cap}.` })));
KIT.forEach((b, i) =>
  put(`${SLUG}-${b.name}.svg`, userbar({ ...b, delay: f(0.4 + Math.floor(i / 2) * 0.16 + (i % 2) * 0.5), alt: `Userbar: ${b.cap}.` })));
console.log(written.join('\n'));
