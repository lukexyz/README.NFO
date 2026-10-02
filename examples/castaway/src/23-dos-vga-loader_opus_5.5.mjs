#!/usr/bin/env node
// Early DOS VGA loader: README header generator for CASTAWAY.
//
//   node examples/castaway/src/23-dos-vga-loader_opus_5.5.mjs
//
// Writes examples/castaway/assets/23-dos-vga-loader_opus_5.5.svg.
// Plain Node, no dependencies, no clock, no Math.random: the same bytes on
// every run. (The .md beside the assets is hand-written, not generated.)
//
// The style (catalogue entry pc-04) is the first generation of graphical PC
// intros, 1990-93, in VGA mode 13h: 320 pixels across, 256 colours from a
// palette of 6-bit DAC values. Blunt next to the Amiga, which is the charm:
//   - a heavy grey bevelled plate with the name in "chrome" capitals, sky
//     above and ground below (the ground is sand here, with a strip of sea
//     on the horizon),
//   - a background of concentric diamonds in one hue, moved only by palette
//     rotation: no pixel of it ever changes place,
//   - purple, orange and blue gradient bars, some sliding behind the plate,
//   - small magenta capitals set on an arc under the plate,
//   - ONE oversized gradient scroller that steps sideways four pixels at a
//     time (the period ones were famously choppy).
// The groups who made the originals are style references only; every
// letterform, sprite and name here is invented for this banner.
//
// The joke: the magenta arc is a hammock. It hangs from the plate's bottom
// corners and she lies in it, nodding to her headphones, which is about as
// eventful as Castaway gets between gags. The loader is silent, as many of
// the originals were, and so far so is the project's synthesized audio, in
// the sense that nobody has heard it yet. The palette rotation is the
// project's "stationary frame" in miniature, and the stepped scroll is its
// house motion style (hard cuts, stepped movement).
//
// Timing (each loop is a whole number of 0.75 s beats at 80 BPM):
//   diamonds     16-colour rotation, one turn per bar (3 s)
//   bars         6 s swing (2 bars), three bars chasing each other
//   nod / toes   every beat
//   glints       every 6 s, staggered
//   scroller     4 px steps, 16 steps a second; the text is followed by a
//                copy of its own head, and the strip moves by exactly the
//                text's width per lap, so the wrap is invisible
// With prefers-reduced-motion everything stops on the first frame, which
// already reads CASTAWAY twice (plate and scroller).
//
// How it is drawn (no <text>, no filters): lit pixels are merged into runs of
// rects and written as one <path> per colour; vertical ramps are
// userSpaceOnUse linearGradients with paired hard stops, one band per pixel
// row; the diamond field is one 32x32 <pattern> mirrored into four quadrants;
// the scroller is <use> references to one symbol per glyph.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '23-dos-vga-loader_opus_5.5';
const OUT = path.resolve(here, `../assets/${SLUG}.svg`);

// ------------------------------------------------------------------ facts
// Verified 2026-10-01 against D:/python/castaway (read-only): 94 activities
// in activities.toml, 81 of them on the four tier timers and 13 chained
// follow-ups (the header says "more than 90", "most on four timers"); 181
// synthesized sound files in media/audio/audio_catalog.json (it says "more
// than 150"); starts snap to 3 s bars; run 10:00:00, seed 1992; the hammock
// is a rare-tier activity; tools/serve.py serves http://127.0.0.1:8765/.

// ------------------------------------------------------------------ canvas
const W = 320; // mode 13h width; the SVG scales the pixels up
const BAR = 3; // seconds per bar of the theme (80 BPM, 4/4)
const BEAT = BAR / 4;

// vertical layout (pixel rows)
const TOPBAR = 0; // 7-row purple bar
const PRES_Y = 11; // "ANOTHER LONG WAIT FROM ..." (8 px font)
const PLATE = { x: 29, y: 23, w: 262, h: 54 };
const FRAME = 8; // outline 1, bevel 1, face 5, inner bevel 1
const LH = 28; // logo letter height
const DEPTH = 2; // extrusion
const HAM_Y = 84; // top of the hammock text at its two ends
const SAG = 15; // how far the middle hangs below the ends
const SB_Y = 108; // scroller band top
const SB_H = 26;
const ORANGE_Y = SB_Y + SB_H + 2; // 6-row orange bar
const KEY_Y = ORANGE_Y + 10; // "PRESS ANY KEY..."
const H = KEY_Y + 8 + 4 + 7; // ... then the bottom purple bar
const BOTBAR = H - 7;

// ----------------------------------------------------------------- helpers
const n = (v) => (Number.isInteger(v) ? String(v) : String(+v.toFixed(3)));
const hex6 = (h) => {
  h = h.replace('#', '');
  return h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
};
const rgb = (h) => [0, 2, 4].map((i) => parseInt(hex6(h).slice(i, i + 2), 16));
const toHex = (a) => `#${a.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('')}`;
// Snap to the VGA DAC: 6 bits per channel, scaled back up the way a
// 0-63 register reads on a modern screen.
const q = (h) => toHex(rgb(h).map((v) => Math.round((Math.round((v * 63) / 255) * 255) / 63)));
const mix = (a, b, t) => toHex(rgb(a).map((v, i) => v + (rgb(b)[i] - v) * t));
// keys: [[row, '#hex'], ...] sorted by row -> one VGA colour per row
function ramp(keys, count) {
  const out = [];
  for (let r = 0; r < count; r++) {
    let k = 0;
    while (k < keys.length - 2 && r > keys[k + 1][0]) k++;
    const [r0, c0] = keys[k];
    const [r1, c1] = keys[k + 1];
    out.push(q(r <= r0 ? c0 : r >= r1 ? c1 : mix(c0, c1, (r - r0) / (r1 - r0))));
  }
  return out;
}
// Hard-edged vertical gradient, one flat band per run of equal rows.
function rowGradient(id, y0, colors) {
  const h = colors.length;
  let stops = '';
  for (let i = 0; i < h;) {
    let j = i;
    while (j < h && colors[j] === colors[i]) j++;
    stops += `<stop offset="${n(i / h)}" stop-color="${colors[i]}"/><stop offset="${n(j / h)}" stop-color="${colors[i]}"/>`;
    i = j;
  }
  return `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="${y0}" x2="0" y2="${y0 + h}">${stops}</linearGradient>`;
}

class Grid {
  constructor(w, h) { this.w = w; this.h = h; this.a = new Uint8Array(w * h); }
  get(x, y) { return x >= 0 && y >= 0 && x < this.w && y < this.h ? this.a[y * this.w + x] : 0; }
  set(x, y, v = 1) { if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.a[y * this.w + x] = v; }
}
// Lit cells -> compact path: horizontal runs, merged down identical rows.
function cellsToPath(isOn, w, h, ox = 0, oy = 0) {
  const rects = [];
  let active = new Map();
  for (let y = 0; y < h; y++) {
    const next = new Map();
    let x = 0;
    while (x < w) {
      if (!isOn(x, y)) { x++; continue; }
      let x1 = x;
      while (x1 < w && isOn(x1, y)) x1++;
      const key = `${x},${x1}`;
      const r = active.get(key);
      if (r) { r.h++; next.set(key, r); } else { const nr = { x, y, w: x1 - x, h: 1 }; rects.push(nr); next.set(key, nr); }
      x = x1;
    }
    active = next;
  }
  return rects.map((r) => `M${n(r.x + ox)} ${n(r.y + oy)}h${r.w}v${r.h}h${-r.w}`).join('');
}
const gridPath = (g, pred = (v) => v) => cellsToPath((x, y) => pred(g.get(x, y)), g.w, g.h);

function inPoly(px, py, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
function bitmapOf(rows) {
  const w = Math.max(...rows.map((r) => r.length));
  const g = new Grid(w, rows.length);
  rows.forEach((row, y) => [...row].forEach((c, x) => { if (c === '#') g.set(x, y); }));
  return g;
}

// ================================================================ build
const defs = [];
const css = [];
const body = [];

// ------------------------------------------------------- 8 px loader font
// Our own BIOS-flavoured face: 2 px stems, 1 px bars, square counters, and a
// slanted cut on the top-left (and often bottom-right) corner of the round
// letters. Used as-is for the small lines and doubled for the scroller.
// '%' is a palm, '&' a coconut with a straw, '*' a note.
const F8 = {
  A: ['.######', '##...##', '##...##', '##...##', '#######', '##...##', '##...##', '##...##'],
  B: ['######.', '##...##', '##...##', '######.', '##...##', '##...##', '##...##', '######.'],
  C: ['.######', '##.....', '##.....', '##.....', '##.....', '##.....', '##.....', '.######'],
  D: ['######.', '##...##', '##...##', '##...##', '##...##', '##...##', '##...##', '######.'],
  E: ['#######', '##.....', '##.....', '######.', '##.....', '##.....', '##.....', '#######'],
  F: ['#######', '##.....', '##.....', '######.', '##.....', '##.....', '##.....', '##.....'],
  G: ['.######', '##.....', '##.....', '##..###', '##...##', '##...##', '##...##', '.######'],
  H: ['##...##', '##...##', '##...##', '#######', '##...##', '##...##', '##...##', '##...##'],
  I: ['######', '..##..', '..##..', '..##..', '..##..', '..##..', '..##..', '######'],
  J: ['.....##', '.....##', '.....##', '.....##', '.....##', '##...##', '##...##', '######.'],
  K: ['##...##', '##..##.', '##.##..', '####...', '####...', '##.##..', '##..##.', '##...##'],
  L: ['##.....', '##.....', '##.....', '##.....', '##.....', '##.....', '##.....', '#######'],
  M: ['##...##', '###.###', '#######', '##.#.##', '##...##', '##...##', '##...##', '##...##'],
  N: ['##...##', '###..##', '####.##', '##.####', '##..###', '##...##', '##...##', '##...##'],
  O: ['.######', '##...##', '##...##', '##...##', '##...##', '##...##', '##...##', '######.'],
  P: ['######.', '##...##', '##...##', '##...##', '######.', '##.....', '##.....', '##.....'],
  Q: ['.######', '##...##', '##...##', '##...##', '##...##', '##.#.##', '##..##.', '####.##'],
  R: ['######.', '##...##', '##...##', '##...##', '######.', '##.##..', '##..##.', '##...##'],
  S: ['.######', '##.....', '##.....', '.#####.', '.....##', '.....##', '.....##', '######.'],
  T: ['######', '..##..', '..##..', '..##..', '..##..', '..##..', '..##..', '..##..'],
  U: ['##...##', '##...##', '##...##', '##...##', '##...##', '##...##', '##...##', '######.'],
  V: ['##...##', '##...##', '##...##', '##...##', '##...##', '.##.##.', '..###..', '...#...'],
  W: ['##...##', '##...##', '##...##', '##.#.##', '##.#.##', '#######', '###.###', '##...##'],
  X: ['##...##', '##...##', '.##.##.', '..###..', '..###..', '.##.##.', '##...##', '##...##'],
  Y: ['##..##', '##..##', '##..##', '.####.', '..##..', '..##..', '..##..', '..##..'],
  Z: ['#######', '.....##', '....##.', '...##..', '..##...', '.##....', '##.....', '#######'],
  0: ['.######', '##...##', '##..###', '##.#.##', '###..##', '##...##', '##...##', '######.'],
  1: ['..##..', '.###..', '####..', '..##..', '..##..', '..##..', '..##..', '######'],
  2: ['######.', '.....##', '.....##', '.#####.', '##.....', '##.....', '##.....', '#######'],
  3: ['######.', '.....##', '.....##', '..####.', '.....##', '.....##', '.....##', '######.'],
  4: ['##...##', '##...##', '##...##', '#######', '.....##', '.....##', '.....##', '.....##'],
  5: ['#######', '##.....', '##.....', '######.', '.....##', '.....##', '.....##', '######.'],
  6: ['.######', '##.....', '##.....', '######.', '##...##', '##...##', '##...##', '######.'],
  7: ['#######', '.....##', '.....##', '....##.', '...##..', '..##...', '..##...', '..##...'],
  8: ['.#####.', '##...##', '##...##', '.#####.', '##...##', '##...##', '##...##', '.#####.'],
  9: ['.######', '##...##', '##...##', '##...##', '.######', '.....##', '.....##', '######.'],
  '.': ['..', '..', '..', '..', '..', '..', '##', '##'],
  ',': ['...', '...', '...', '...', '...', '.##', '.##', '##.'],
  ':': ['..', '..', '##', '##', '..', '..', '##', '##'],
  '!': ['##', '##', '##', '##', '##', '##', '..', '##'],
  '?': ['######.', '.....##', '.....##', '..####.', '..##...', '..##...', '.......', '..##...'],
  '-': ['.....', '.....', '.....', '#####', '#####', '.....', '.....', '.....'],
  "'": ['##', '##', '#.', '..', '..', '..', '..', '..'],
  '/': ['.....##', '.....##', '....##.', '...##..', '..##...', '.##....', '##.....', '##.....'],
  '(': ['..##', '.##.', '##..', '##..', '##..', '##..', '.##.', '..##'],
  ')': ['##..', '.##.', '..##', '..##', '..##', '..##', '.##.', '##..'],
  '%': [
    '.###...###.',
    '#####.#####',
    '##..###..##',
    '#..#####..#',
    '....##.....',
    '....##.....',
    '.....##....',
    '..#######..',
  ],
  '&': ['...#..', '...#..', '..#...', '.####.', '######', '######', '######', '.####.'],
  '*': ['...###', '...#.#', '...#..', '...#..', '...#..', '####..', '####..', '.##...'],
};
const F8_SPACE = 4;
const f8Width = (s) => [...s].reduce((w, c) => w + (c === ' ' ? F8_SPACE : F8[c][0].length + 1), 0) - 1;
function drawF8(grid, s, x, y) {
  for (const c of s) {
    if (c === ' ') { x += F8_SPACE; continue; }
    const g = F8[c];
    if (!g) throw new Error(`loader font lacks ${JSON.stringify(c)}`);
    g.forEach((row, r) => [...row].forEach((ch, k) => { if (ch === '#') grid.set(x + k, y + r); }));
    x += g[0].length + 1;
  }
}

// --------------------------------------------------------- 5x7 arc font
const F5 = {
  A: '.###.|#...#|#...#|#####|#...#|#...#|#...#', B: '####.|#...#|#...#|####.|#...#|#...#|####.',
  C: '.###.|#...#|#....|#....|#....|#...#|.###.', D: '####.|#...#|#...#|#...#|#...#|#...#|####.',
  E: '#####|#....|#....|####.|#....|#....|#####', F: '#####|#....|#....|####.|#....|#....|#....',
  G: '.###.|#...#|#....|#.###|#...#|#...#|.####', H: '#...#|#...#|#...#|#####|#...#|#...#|#...#',
  I: '###|.#.|.#.|.#.|.#.|.#.|###', L: '#....|#....|#....|#....|#....|#....|#####',
  M: '#...#|##.##|#.#.#|#.#.#|#...#|#...#|#...#', N: '#...#|##..#|#.#.#|#.#.#|#..##|#...#|#...#',
  O: '.###.|#...#|#...#|#...#|#...#|#...#|.###.', P: '####.|#...#|#...#|####.|#....|#....|#....',
  R: '####.|#...#|#...#|####.|#.#..|#..#.|#...#', S: '.####|#....|#....|.###.|....#|....#|####.',
  T: '#####|..#..|..#..|..#..|..#..|..#..|..#..', U: '#...#|#...#|#...#|#...#|#...#|#...#|.###.',
  V: '#...#|#...#|#...#|#...#|.#.#.|.#.#.|..#..', W: '#...#|#...#|#...#|#.#.#|#.#.#|##.##|#...#',
  Y: '#...#|#...#|.#.#.|..#..|..#..|..#..|..#..',
  ',': '..|..|..|..|..|.#|#.', '.': '.|.|.|.|.|.|#', '-': '....|....|....|####|....|....|....',
};

// =================================================================== palette
// Diamond field: one electric-blue ramp, up and back down, 16 entries.
const DIA = [];
for (let i = 0; i < 16; i++) {
  const t = i <= 8 ? i / 8 : (16 - i) / 8;
  DIA.push(q(mix('#000008', '#1a40d8', Math.pow(t, 1.9))));
}
// copper bars, 9 rows, dark-light-dark
const barRamp = (dark, mid, peak) => {
  const c = [dark, mix(dark, mid, 0.5), mid, mix(mid, peak, 0.55), peak];
  return [...c, ...c.slice(0, 4).reverse()].map(q);
};
const PURPLE = barRamp('#33064f', '#a032b8', '#ffb4ff');
const ORANGE = barRamp('#4a1000', '#d06000', '#ffe08a');
const BLUE = barRamp('#00134a', '#1a62d0', '#b8e6ff');

// ===================================================== 1. black + diamonds
const CX = W / 2;
const CY = PLATE.y + PLATE.h / 2;
{
  // One 32x32 tile of 45-degree stripes, 2 px each: (x + y) div 2 mod 16.
  // Each stripe is a run of 1x2 dominoes down the tile. Mirrored into the four
  // quadrants around (CX, CY), it makes concentric diamonds.
  let tile = '';
  for (let k = 0; k < 16; k++) {
    let d = '';
    for (let x = 0; x < 32; x++) {
      const y = (((2 * k - x) % 32) + 32) % 32;
      d += y === 31 ? `M${x} 31h1v1h-1M${x} 0h1v1h-1` : `M${x} ${y}h1v2h-1`;
    }
    tile += `<path class="d${k}" fill="${DIA[k]}" d="${d}"/>`;
  }
  defs.push(`<pattern id="dia" patternUnits="userSpaceOnUse" x="${CX}" y="${CY}" width="32" height="32">${tile}</pattern>`);
  defs.push(`<rect id="dq" x="${CX}" y="${CY}" width="${W - CX}" height="${H}" fill="url(#dia)"/>`);
  body.push(`<rect width="${W}" height="${H}" fill="#000"/>`);
  body.push(`<use href="#dq"/><use href="#dq" transform="matrix(-1 0 0 1 ${2 * CX} 0)"/>`);
  body.push(`<use href="#dq" transform="matrix(1 0 0 -1 0 ${2 * CY})"/><use href="#dq" transform="matrix(-1 0 0 -1 ${2 * CX} ${2 * CY})"/>`);
  // Palette rotation: stripe k shows DIA[(k - step) mod 16], one step per
  // 1/16 bar, so the bright band travels outward while nothing moves.
  const dt = BAR / 16;
  let kf = '';
  for (let s = 0; s < 16; s++) kf += `${n((s / 16) * 100)}%{fill:${DIA[(16 - s) % 16]}}`;
  css.push(`@keyframes pc{${kf}100%{fill:${DIA[0]}}}`);
  for (let k = 0; k < 16; k++) {
    css.push(`.d${k}{animation:pc ${BAR}s step-end infinite;animation-delay:-${n(((16 - k) % 16) * dt)}s}`);
  }
}

// ================================================= 2. bars behind the plate
const BAR_TOP = PLATE.y - 2;
let BARS_SVG = '';
const BAR_BOT = PLATE.y + PLATE.h - 7;
{
  defs.push(rowGradient('cbP', 0, PURPLE), rowGradient('cbO', 0, ORANGE), rowGradient('cbB', 0, BLUE));
  // Drawn twice (here, and dimmed inside the plate) rather than through
  // <use>, so the swing never depends on a browser animating a <use> clone.
  BARS_SVG = ['cbB', 'cbO', 'cbP']
    .map((id, i) => `<g class="cb cb${i}"><rect width="${W}" height="9" fill="url(#${id})"/></g>`)
    .join('');
  body.push(`<g>${BARS_SVG}</g>`);
  css.push(`@keyframes sw{from{transform:translateY(${BAR_TOP}px)}to{transform:translateY(${BAR_BOT}px)}}`);
  css.push(`.cb{animation:sw ${BAR}s ease-in-out infinite alternate}`);
  css.push(`.cb0{transform:translateY(${BAR_TOP}px)}.cb1{animation-delay:-.45s;transform:translateY(${BAR_TOP + 5}px)}.cb2{animation-delay:-.9s;transform:translateY(${BAR_TOP + 15}px)}`);
}

// ======================================================= 3. top/bottom bars
defs.push(rowGradient('tb', TOPBAR, PURPLE.slice(1, 8)), rowGradient('bb', BOTBAR, PURPLE.slice(1, 8)));
defs.push(rowGradient('ob', ORANGE_Y, ORANGE.filter((_, i) => i !== 2 && i !== 6)));
body.push(`<rect y="${TOPBAR}" width="${W}" height="7" fill="url(#tb)"/>`);
body.push(`<rect y="${BOTBAR}" width="${W}" height="7" fill="url(#bb)"/>`);

// ============================================================ 4. small lines
function smallLine(s, y, id, colors, cls = '') {
  const g = new Grid(W, 8);
  const x0 = Math.round((W - f8Width(s)) / 2);
  drawF8(g, s, x0, 0);
  const shadow = new Grid(W, 9);
  for (let yy = 0; yy < 8; yy++) for (let x = 0; x < W; x++) if (g.get(x, yy)) { shadow.set(x + 1, yy + 1); }
  defs.push(rowGradient(id, y, colors));
  return `<g${cls ? ` class="${cls}"` : ''}><path fill="#000" d="${cellsToPath((x, yy) => shadow.get(x, yy), W, 9, 0, y)}"/><path fill="url(#${id})" d="${cellsToPath((x, yy) => g.get(x, yy), W, 8, 0, y)}"/></g>`;
}
const PRESENTS = 'ANOTHER LONG WAIT FROM IDLE HANDS';
body.push(smallLine(PRESENTS, PRES_Y, 'pr', ramp([[0, '#ffffff'], [3, '#e8ecff'], [7, '#8ea0d8']], 8)));

// ================================================================ 5. plate
{
  const { x: X0, y: Y0, w: PW, h: PH } = PLATE;
  const X1 = X0 + PW;
  const Y1 = Y0 + PH;
  // mitred bevel bands: [inset a, inset b, top, left, bottom, right]
  const band = (a, b, top, left, bot, right) => {
    const P = (pts) => pts.map(([x, y]) => `${x},${y}`).join(' ');
    return [
      `<polygon fill="${q(top)}" points="${P([[X0 + a, Y0 + a], [X1 - a, Y0 + a], [X1 - b, Y0 + b], [X0 + b, Y0 + b]])}"/>`,
      `<polygon fill="${q(left)}" points="${P([[X0 + a, Y0 + a], [X0 + b, Y0 + b], [X0 + b, Y1 - b], [X0 + a, Y1 - a]])}"/>`,
      `<polygon fill="${q(bot)}" points="${P([[X0 + a, Y1 - a], [X0 + b, Y1 - b], [X1 - b, Y1 - b], [X1 - a, Y1 - a]])}"/>`,
      `<polygon fill="${q(right)}" points="${P([[X1 - a, Y0 + a], [X1 - a, Y1 - a], [X1 - b, Y1 - b], [X1 - b, Y0 + b]])}"/>`,
    ].join('');
  };
  const parts = [];
  parts.push(`<rect x="${X0 - 1}" y="${Y0 - 1}" width="${PW + 2}" height="${PH + 2}" fill="#000"/>`);
  parts.push(band(0, 1, '#20202a', '#20202a', '#08080c', '#08080c'));
  parts.push(band(1, 2, '#f4f4fc', '#dcdce8', '#34343e', '#44444e'));
  parts.push(band(2, 7, '#b4b4c4', '#9a9aae', '#5c5c6c', '#70707e'));
  parts.push(band(7, 8, '#24242c', '#2c2c36', '#d8d8e4', '#c4c4d0'));
  // the face of the frame gets a brushed line along its middle
  parts.push(`<rect x="${X0 + 7}" y="${Y0 + 4}" width="${PW - 14}" height="1" fill="${q('#cacada')}"/>`);
  parts.push(`<rect x="${X0 + 7}" y="${Y1 - 5}" width="${PW - 14}" height="1" fill="${q('#68687a')}"/>`);
  // interior: a dark recessed field
  const IY = Y0 + FRAME;
  const IH = PH - 2 * FRAME;
  defs.push(rowGradient('pf', IY, ramp([[0, '#000008'], [IH - 1, '#0a1640']], IH)));
  parts.push(`<rect x="${X0 + FRAME}" y="${IY}" width="${PW - 2 * FRAME}" height="${IH}" fill="url(#pf)"/>`);
  // the copper bars show through the plate, dimmed, behind the letters
  defs.push(`<clipPath id="pin"><rect x="${X0 + FRAME}" y="${IY}" width="${PW - 2 * FRAME}" height="${IH}"/></clipPath>`);
  parts.push(`<g clip-path="url(#pin)" opacity=".32">${BARS_SVG}</g>`);
  // rivets in the four corners of the frame face
  const rivet = (cx, cy) => `<rect x="${cx - 1}" y="${cy - 1}" width="3" height="3" fill="${q('#7a7a8c')}"/><rect x="${cx - 1}" y="${cy - 1}" width="2" height="1" fill="#fff"/><rect x="${cx - 1}" y="${cy}" width="1" height="1" fill="${q('#d8d8e8')}"/><rect x="${cx + 1}" y="${cy}" width="1" height="2" fill="${q('#2a2a34')}"/><rect x="${cx}" y="${cy + 1}" width="1" height="1" fill="${q('#2a2a34')}"/>`;
  parts.push(rivet(X0 + 4, Y0 + 4), rivet(X1 - 5, Y0 + 4), rivet(X0 + 4, Y1 - 5), rivet(X1 - 5, Y1 - 5));
  body.push(`<g>${parts.join('')}</g>`);
}

// ======================================================== 6. chrome letters
// Heavy block capitals with big 45-degree chamfers and little spurs, drawn as
// polygons on the pixel grid and rasterised at pixel centres.
const GLYPHS = {
  C: { w: 24, polys: [[[5, 0], [19, 0], [24, 5], [24, 10], [17, 10], [17, 7], [7, 7], [7, 21], [17, 21], [17, 18], [24, 18], [24, 23], [19, 28], [5, 28], [0, 23], [0, 5]]] },
  A: { w: 24, polys: [[[7, 0], [17, 0], [24, 7], [24, 28], [17, 28], [17, 20], [7, 20], [7, 28], [0, 28], [0, 7]], [[9, 7], [15, 7], [17, 9], [17, 14], [7, 14], [7, 9]]] },
  S: { w: 24, polys: [[[5, 0], [19, 0], [24, 5], [24, 10], [17, 10], [17, 7], [7, 7], [7, 11], [19, 11], [24, 16], [24, 23], [19, 28], [5, 28], [0, 23], [0, 18], [7, 18], [7, 21], [17, 21], [17, 17], [5, 17], [0, 12], [0, 5]]] },
  T: { w: 24, polys: [[[2, 0], [22, 0], [24, 2], [24, 10], [20, 10], [20, 7], [16, 7], [16, 28], [8, 28], [8, 7], [4, 7], [4, 10], [0, 10], [0, 2]]] },
  W: { w: 32, polys: [[[0, 0], [7, 0], [7, 21], [12, 21], [12, 11], [14, 9], [18, 9], [20, 11], [20, 21], [25, 21], [25, 0], [32, 0], [32, 23], [27, 28], [5, 28], [0, 23]]] },
  Y: { w: 24, polys: [[[0, 0], [7, 0], [7, 10], [17, 10], [17, 0], [24, 0], [24, 12], [16, 20], [16, 28], [8, 28], [8, 20], [0, 12]]] },
};
const LOGO = 'CASTAWAY';
const LGAP = 4;
const logoW = [...LOGO].reduce((w, c, i) => w + GLYPHS[c].w + (i ? LGAP : 0), 0);
const LOGO_X = Math.round((W - logoW - DEPTH) / 2);
const LOGO_Y = Math.round(PLATE.y + (PLATE.h - LH - DEPTH) / 2);
const letterX = [];
{
  const G = new Grid(W, H);
  let x = LOGO_X;
  for (const c of LOGO) {
    const gl = GLYPHS[c];
    letterX.push(x);
    for (let yy = 0; yy < LH; yy++) for (let xx = 0; xx < gl.w; xx++) {
      let inside = false;
      for (const p of gl.polys) if (inPoly(xx + 0.5, yy + 0.5, p)) inside = !inside;
      if (inside) G.set(x + xx, LOGO_Y + yy);
    }
    x += gl.w + LGAP;
  }
  // extrusion down and to the right
  const E = new Grid(W, H);
  for (let d = 1; d <= DEPTH; d++) {
    for (let y = 0; y < H; y++) for (let xx = 0; xx < W; xx++) if (G.get(xx, y) && !G.get(xx + d, y + d)) E.set(xx + d, y + d, 1);
  }
  const solid = (xx, y) => G.get(xx, y) || E.get(xx, y);
  const halo = new Grid(W, H);
  for (let y = 0; y < H; y++) for (let xx = 0; xx < W; xx++) {
    if (solid(xx, y)) continue;
    for (let dy = -1; dy <= 1 && !halo.get(xx, y); dy++) for (let dx = -1; dx <= 1; dx++) if (solid(xx + dx, y + dy)) { halo.set(xx, y); break; }
  }
  // edge classes on the face: 2 = lit edge (top/left), 3 = shaded edge
  const cls = new Grid(W, H);
  for (let y = 0; y < H; y++) for (let xx = 0; xx < W; xx++) {
    if (!G.get(xx, y)) continue;
    const lit = !G.get(xx - 1, y) || !G.get(xx, y - 1) || !G.get(xx - 1, y - 1);
    const dark = !G.get(xx + 1, y) || !G.get(xx, y + 1) || !G.get(xx + 1, y + 1);
    cls.set(xx, y, lit ? 2 : dark ? 3 : 1);
  }
  // chrome: sky (deep blue to white), a strip of sea on the horizon, then sand
  const FACE = ramp([
    [0, '#16288a'], [5, '#3462d8'], [10, '#8cc0ff'], [12, '#e4f4ff'], [13, '#ffffff'],
    [14, '#20a8c8'], [15, '#0c6c98'],
    [16, '#5a2c08'], [19, '#8a5220'], [23, '#d09a52'], [27, '#ffe2a6'],
  ], LH);
  const LIT = FACE.map((c, i) => q(mix(c, i < 14 ? '#ffffff' : '#fff6dc', 0.6)));
  const SHADE = FACE.map((c) => q(mix(c, '#000010', 0.45)));
  defs.push(rowGradient('lf', LOGO_Y, FACE), rowGradient('ll', LOGO_Y, LIT), rowGradient('ls', LOGO_Y, SHADE));
  defs.push(rowGradient('le', LOGO_Y + 1, ramp([[0, '#3c2a5a'], [12, '#20163c'], [16, '#4a2a10'], [LH, '#24140a']], LH + DEPTH)));
  body.push(`<path fill="#000" d="${gridPath(halo)}"/>`);
  body.push(`<path fill="url(#le)" d="${gridPath(E)}"/>`);
  body.push(`<path fill="url(#lf)" d="${gridPath(cls, (v) => v === 1)}"/>`);
  body.push(`<path fill="url(#ll)" d="${gridPath(cls, (v) => v === 2)}"/>`);
  body.push(`<path fill="url(#ls)" d="${gridPath(cls, (v) => v === 3)}"/>`);
}

// glints: four-point sparkles that wink on letter corners, one at a time
{
  const spark = `<path fill="#fff" d="M3 0h1v7h-1zM0 3h7v1h-7z"/><path fill="${q('#bfe4ff')}" d="M2 2h3v3h-3z"/><path fill="#fff" d="M3 2h1v3h-1zM2 3h3v1h-3z"/>`;
  defs.push(`<symbol id="spk" overflow="visible">${spark}</symbol>`);
  const spots = [[letterX[0] + 3, LOGO_Y - 2], [letterX[5] + 26, LOGO_Y - 3], [letterX[3] + 18, LOGO_Y + 22]];
  spots.forEach(([x, y], i) => body.push(`<use class="gl gl${i}" href="#spk" x="${x - 3}" y="${y - 3}"/>`));
  css.push('@keyframes gl{0%,86%{opacity:0}88%{opacity:.6}90%{opacity:1}94%{opacity:.5}97%,100%{opacity:0}}');
  css.push(`.gl{opacity:0;animation:gl ${2 * BAR}s linear infinite}.gl1{animation-delay:-${BAR}s}.gl2{animation-delay:-${BAR * 1.5}s}`);
}

// ============================================================== 7. hammock
// The arc text is the hammock: two fans of string from rings under the
// plate's bottom corners, the subtitle as the cloth, and her lying in it.
const HAM_TEXT = 'EVERY SO OFTEN, SOMETHING HAPPENS';
const HAM_TRACK = 1;
{
  const glyphs = [...HAM_TEXT].map((c) => (c === ' ' ? null : F5[c].split('|')));
  const adv = (g) => (g ? g[0].length + 1 + HAM_TRACK : 3 + HAM_TRACK);
  const tw = glyphs.reduce((w, g) => w + adv(g), 0) - 1 - HAM_TRACK;
  const TX0 = Math.round((W - tw) / 2);
  const TX1 = TX0 + tw;
  const yTop = (x) => HAM_Y + Math.round(SAG * Math.sin((Math.PI * (x - TX0 + 0.5)) / (tw)));
  // the cloth's top rope: three rows above the letters, so two rows of dark
  // keyline keep it off their tops
  const ropeY = (x) => yTop(Math.min(Math.max(x, TX0), TX1 - 1)) - 3;
  // rows of the glyphs, each its own colour
  const rows = Array.from({ length: 7 }, () => new Grid(W, H));
  let x = TX0;
  for (const g of glyphs) {
    if (g) {
      g.forEach((row, r) => [...row].forEach((ch, k) => { if (ch === '#') rows[r].set(x + k, yTop(x + k) + r); }));
    }
    x += adv(g);
  }
  const MAG = ['#ffd2ff', '#ffa8f6', '#ff7cec', '#f454de', '#dc34ca', '#b81cb0', '#8e0c8c'].map(q);
  // dark keyline round the text
  const all = new Grid(W, H);
  rows.forEach((g) => { for (let i = 0; i < g.a.length; i++) if (g.a[i]) all.a[i] = 1; });
  const key = new Grid(W, H);
  for (let y = 0; y < H; y++) for (let xx = 0; xx < W; xx++) {
    if (all.get(xx, y)) continue;
    if (all.get(xx - 1, y) || all.get(xx, y - 1) || all.get(xx - 1, y - 1) || all.get(xx + 1, y) || all.get(xx, y + 1)) key.set(xx, y);
  }
  // strings: from a ring under each bottom corner of the plate to the cloth
  const rope = new Grid(W, H);
  const line = (x0, y0, x1, y1) => {
    const dx = Math.abs(x1 - x0); const dy = -Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1; const sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    for (;;) {
      // a straight string never dips below the curved top rope over the text
      if (x0 < TX0 - 1 || x0 > TX1 || y0 <= ropeY(x0)) rope.set(x0, y0);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
  };
  const ringY = PLATE.y + PLATE.h + 2;
  const ringL = PLATE.x + 10;
  const ringR = PLATE.x + PLATE.w - 11;
  for (const f of [0, 7, 15]) {
    line(ringL, ringY, TX0 + f, ropeY(TX0 + f));
    line(ringR, ringY, TX1 - 1 - f, ropeY(TX1 - 1 - f));
  }
  // the cloth's top edge, one rope line above the letters
  for (let xx = TX0 - 1; xx <= TX1; xx++) rope.set(xx, ropeY(xx));
  const rkey = new Grid(W, H);
  for (let y = 0; y < H; y++) for (let xx = 0; xx < W; xx++) if (!rope.get(xx, y) && !all.get(xx, y) && (rope.get(xx, y - 1) || rope.get(xx - 1, y))) rkey.set(xx, y);
  body.push(`<path fill="#000" d="${gridPath(key)}${gridPath(rkey)}"/>`);
  body.push(`<path fill="${q('#d8b484')}" d="${gridPath(rope)}"/>`);
  // rings
  for (const rx of [ringL, ringR]) body.push(`<path fill="${q('#9c9cb0')}" d="M${rx - 1} ${ringY - 2}h3v1h-3zM${rx - 1} ${ringY}h3v1h-3zM${rx - 2} ${ringY - 1}h1v1h-1zM${rx + 2} ${ringY - 1}h1v1h-1z"/>`);
  rows.forEach((g, r) => body.push(`<path fill="${MAG[r]}" d="${gridPath(g)}"/>`));

  // ---------------------------------------------------------------- her
  // Lying on her back, head to the left, coconut on her tummy, feet up.
  // Coral tank top, cream shorts, cream headphones, brown hair in a low bun.
  const PAL = {
    h: '#5a3218', H: '#83502a', s: '#f2bc94', S: '#cf9068', p: '#f6eedc', P: '#c4b494',
    c: '#f07e66', C: '#c45a48', w: '#f0e6cc', W: '#c4b690', o: '#7a4a22', O: '#a8743c', x: '#ffffff', e: '#3a2010',
  };
  const BODY = [
    '................x.............',
    '................x.............',
    '....ss.........oOo.......ss...',
    '..hhsss.......oOOOo.....sssS..',
    '.hpssees.....sSooo.....ss..sS.',
    'hpPPsssS....ss........ss....sS',
    'hpPPPSsscccccccwwwwwsss.....sS',
    'hhhhhhscccccccccwwwwwsssssssSS',
    '.hhh...CCCCCCCCCWWWWWSSSSSSSSS',
  ];
  const HEAD_COLS = 8; // columns that lift with the beat
  const top = ropeY(Math.round(W / 2)) - BODY.length; // rests on the cloth edge
  const bx = Math.round(W / 2) - 16;
  const layers = { head: {}, rest: {} };
  BODY.forEach((row, r) => [...row].forEach((ch, k) => {
    if (!PAL[ch]) return;
    const L = k < HEAD_COLS ? layers.head : layers.rest;
    (L[ch] ||= new Grid(W, H)).set(bx + k, top + r);
  }));
  const keyline = (cells) => {
    const kg = new Grid(W, H);
    for (let y = 0; y < H; y++) for (let xx = 0; xx < W; xx++) {
      if (cells(xx, y)) continue;
      if (cells(xx - 1, y) || cells(xx + 1, y) || cells(xx, y - 1)) kg.set(xx, y);
    }
    return kg;
  };
  const layerSvg = (L) => Object.entries(L).map(([ch, g]) => `<path fill="${q(PAL[ch])}" d="${gridPath(g)}"/>`).join('');
  // the straight leg's foot: toes up, then tipped forward, swapped on the beat
  const fx = bx + BODY[0].length;
  const footUp = new Grid(W, H); const footTip = new Grid(W, H);
  [[0, 5], [0, 6], [0, 7], [0, 8]].forEach(([a, b]) => footUp.set(fx + a, top + b));
  [[0, 7], [0, 8], [1, 6], [1, 5]].forEach(([a, b]) => footTip.set(fx + a, top + b));
  const anyHead = (xx, y) => Object.values(layers.head).some((g) => g.get(xx, y));
  const anyRest = (xx, y) => Object.values(layers.rest).some((g) => g.get(xx, y)) || footUp.get(xx, y) || footTip.get(xx, y);
  body.push(`<path fill="#000" d="${gridPath(keyline(anyRest))}"/>`);
  body.push(`<g>${layerSvg(layers.rest)}</g>`);
  body.push(`<g class="ft0"><path fill="${q(PAL.s)}" d="${gridPath(footUp)}"/></g>`);
  body.push(`<g class="ft1"><path fill="${q(PAL.s)}" d="${gridPath(footTip)}"/></g>`);
  body.push(`<g class="nod"><path fill="#000" d="${gridPath(keyline(anyHead))}"/>${layerSvg(layers.head)}</g>`);
  css.push('@keyframes nod{0%{transform:translateY(0)}50%{transform:translateY(-1px)}}');
  css.push('@keyframes ft{0%{opacity:1}50%{opacity:0}}');
  css.push(`.nod{animation:nod ${BEAT}s step-end infinite}`);
  css.push(`.ft0{animation:ft ${BEAT}s step-end infinite}.ft1{opacity:0;animation:ft ${BEAT}s step-end infinite;animation-delay:-${BEAT / 2}s}`);
}

// ============================================================ 8. scroller
const SCROLL_TEXT = [
  'CASTAWAY',
  'TEN HOURS OF ONE TINY ISLAND, ONE TALL PALM, ONE RAFT AND ONE YOUNG WOMAN IN HEADPHONES.',
  'SHE IDLES. SHE NODS TO THE MUSIC. EVERY SO OFTEN, SOMETHING HAPPENS. THEN SHE IDLES SOME MORE. %',
  'MORE THAN 90 ACTIVITIES, MOST OF THEM ON FOUR TIMERS: SOMETHING SMALL EVERY 2 TO 5 MINUTES, LIKE A COCONUT &, A VISITOR NOW AND THEN, LIKE THE SEA TURTLE, A SET PIECE ONCE IN A WHILE, LIKE THE SHARK IN HEADPHONES, AND ONCE IN A VERY LONG WHILE SHE WALKS OUT OVER THE WATER AND COMES BACK WITH AN ICED COFFEE.',
  'EVERY GAG WAITS FOR THE NEXT BAR OF THE MUSIC, SO IT LANDS ON THE BEAT. *',
  'THIS LOADER IS SILENT, LIKE A LOT OF THE OLD ONES. CASTAWAY HAS MORE THAN 150 SOUNDS, ALL SYNTHESIZED FROM CODE, AND NOBODY HAS HEARD ONE YET. SO, SILENT IN A DIFFERENT WAY.',
  'NO PIXEL OF THE BACKGROUND MOVES: ONLY THE PALETTE TURNS. A STATIONARY FRAME WITH THINGS GOING ON. THAT IS ALSO THE VIDEO.',
  'THIS SCROLL STEPS FOUR PIXELS AT A TIME, BECAUSE HARD CUTS AND STEPPED MOVEMENT ARE THE HOUSE STYLE.',
  'OUR BOARD HAS ONE BAR OF SIGNAL. IT IS AT THE TOP OF THE PALM.',
  'TO RUN IT: PYTHON TOOLS/SERVE.PY, THEN OPEN 127.0.0.1:8765.',
  'GREETINGS TO THE SEA TURTLE, THE CAT ON THE CRATE, THE HERMIT CRAB AND HIS COCONUT, THE SHARK, THE DRONE, THE TOUR BOAT, THE BRO ON THE HYDROFOIL, AND THE TIDE, FOR TAKING THE SANDCASTLE AGAIN.',
  'AN UNOFFICIAL REMAKE INSPIRED BY A 1992 DESERT ISLAND SCREENSAVER. ALWAYS DAYTIME. LET IT RUN. %',
].join('     ') + '          ';
const STEP = 4; // px per step: the choppy one
const STEPS_PER_S = 16; // 12 steps a beat
const SC_Y = SB_Y + 5;
{
  defs.push(rowGradient('sb', SB_Y, ramp([[0, '#000006'], [SB_H / 2, '#0c2a7a'], [SB_H - 1, '#000006']], SB_H)));
  body.push(`<rect y="${SB_Y}" width="${W}" height="${SB_H}" fill="url(#sb)"/>`);
  body.push(`<rect y="${SB_Y}" width="${W}" height="1" fill="${q('#2a62e0')}"/><rect y="${SB_Y + SB_H - 1}" width="${W}" height="1" fill="${q('#2a62e0')}"/>`);
  // sunset ramp, one colour per pixel row of the doubled glyphs
  const SUN = ramp([[0, '#fffcd0'], [3, '#ffe46a'], [7, '#ffa424'], [11, '#f05a08'], [15, '#a01a00']], 16);
  defs.push(rowGradient('sg', 0, SUN));
  const used = new Set([...SCROLL_TEXT].filter((c) => c !== ' '));
  const adv = {};
  for (const c of used) {
    const rows = F8[c];
    if (!rows) throw new Error(`loader font lacks ${JSON.stringify(c)}`);
    const g = bitmapOf(rows);
    const big = new Grid(g.w * 2, 16);
    for (let y = 0; y < 16; y++) for (let x = 0; x < g.w * 2; x++) big.set(x, y, g.get(x >> 1, y >> 1));
    const sh = new Grid(g.w * 2 + 2, 18);
    for (let y = 0; y < 16; y++) for (let x = 0; x < g.w * 2; x++) if (big.get(x, y)) { sh.set(x + 2, y + 2); sh.set(x + 1, y + 1); }
    defs.push(`<symbol id="s${c.charCodeAt(0)}" overflow="visible"><path fill="${q('#14001e')}" d="${gridPath(sh)}"/><path fill="url(#sg)" d="${gridPath(big)}"/></symbol>`);
    adv[c] = (g.w + 1) * 2;
  }
  const advance = (c) => (c === ' ' ? F8_SPACE * 2 + 2 : adv[c]);
  const chars = [...SCROLL_TEXT];
  const x0 = 10;
  let x = x0;
  const uses = [];
  for (const c of chars) {
    if (c !== ' ') uses.push(`<use href="#s${c.charCodeAt(0)}" x="${x}"/>`);
    x += advance(c);
  }
  let L = x - x0;
  L = Math.ceil(L / STEP) * STEP; // whole steps per lap
  x = x0 + L;
  for (let i = 0; x < L + x0 + W + 40; i++) {
    const c = chars[i];
    if (c !== ' ') uses.push(`<use href="#s${c.charCodeAt(0)}" x="${x}"/>`);
    x += advance(c);
  }
  const steps = L / STEP;
  const dur = steps / STEPS_PER_S;
  defs.push(`<clipPath id="scc"><rect y="${SB_Y}" width="${W}" height="${SB_H}"/></clipPath>`);
  body.push(`<g clip-path="url(#scc)"><g transform="translate(0 ${SC_Y})"><g class="sc">${uses.join('')}</g></g></g>`);
  css.push(`.sc{animation:sc ${n(dur)}s steps(${steps}) infinite}@keyframes sc{from{transform:translateX(0)}to{transform:translateX(-${L}px)}}`);
  console.log(`scroller: ${chars.length} chars, ${L} px, ${n(dur)} s lap`);
}

// ======================================================= 9. orange + key line
// The period loaders asked for a key before the game started. This one has
// nothing to start, and she is in no hurry: the waiting is the feature.
body.push(`<rect y="${ORANGE_Y}" width="${W}" height="7" fill="url(#ob)"/>`);
body.push(`<rect y="${ORANGE_Y + 7}" width="${W}" height="${BOTBAR - ORANGE_Y - 7}" fill="#000"/>`);
const PROMPT = 'PRESS ANY KEY. SHE WILL GET ROUND TO IT.';
body.push(smallLine(PROMPT, KEY_Y, 'ky', ramp([[0, '#fff4c8'], [7, '#e8a040']], 8), 'blink'));
css.push(`@keyframes bl{0%{opacity:1}50%{opacity:.45}}.blink{animation:bl ${2 * BEAT}s step-end infinite}`);

// ================================================================ assemble
css.push('@media (prefers-reduced-motion:reduce){*{animation:none!important}}');
const TITLE = 'CASTAWAY: an early DOS VGA loader screen';
const DESC = `${PRESENTS}. CASTAWAY in chrome capitals (sky over a strip of sea over sand) on a grey bevelled plate, over palette-cycled blue diamonds, with a hammock made of the words "${HAM_TEXT}" and a young woman lying in it, nodding to her headphones. A giant scroller below, and at the bottom: ${PROMPT}`;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W * 3}" height="${H * 3}" shape-rendering="crispEdges" role="img" aria-labelledby="t d">
<title id="t">${TITLE}</title><desc id="d">${DESC}</desc>
<style>${css.join('\n')}</style>
<defs>${defs.join('\n')}<clipPath id="scr"><rect width="${W}" height="${H}" rx="4"/></clipPath></defs>
<g clip-path="url(#scr)">
${body.join('\n')}
</g>
</svg>
`;
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, svg);
console.log(`wrote ${path.relative(process.cwd(), OUT)} (${(svg.length / 1024).toFixed(1)} KB), ${W}x${H}`);
