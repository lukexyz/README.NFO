#!/usr/bin/env node
// ULTRA-SATISFACTORY as an illustrated ANSI: a tall 80-column, 16-colour comic that scrolls through
// a 30-row window, in the "toon" manner of the mid-1990s ANSI art scene (thick black outline cut
// with half blocks, flat saturated fills, shade characters only where two colours meet, big white
// eyes and gloves, a flat bright ground, a block-letter header band on black and a small boxed
// credit plaque with a drop shadow). The mascot, Gary, and every machine in it are original.
//
// Regenerate:  node examples/ultra-satisfactory/src/23-illustrated-ansi_opus_5.5.mjs
//
// Plain Node, no dependencies, fully deterministic (no clock, no randomness).
//
// How it works. The picture is described as vector shapes (signed distance functions) and
// painted onto a sample grid, 4 x 4 samples per character cell. Then every cell is LEGALISED:
// it is replaced by the closest thing a real ANSI file could hold, which is one CP437 character
// (space, full block, upper half block, left half block or one of the three shade characters)
// with one foreground and one background colour out of the 16-colour palette (iCE colours on, so
// backgrounds may be bright). So although no ANSI editor was involved, every cell of the result
// is a legal text-mode cell. The cells are then written out as merged rectangles, one path per
// colour; shade characters are small dot-lattice pattern fills; text is <use> of glyph paths from
// the bitmap font below (never <text>, so it looks the same for every viewer).
//
// What moves (all CSS, all switched off by prefers-reduced-motion, which leaves the title frame):
// the scroll; Gary's blink (an "overlay": the eyes repainted shut and legalised again); the belt
// in the ITEMS panel, whose screws step along one cell at a time ("sprites"); a few sparkles.
//
// Debug helpers (not needed to build):  --png=<file> [--rows=a-b] [--bake=bk,tk]  writes a 1:1
// PNG of the piece (optionally with some overlays shown); --sheet=<file> writes the whole piece
// as one static SVG.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '23-illustrated-ansi_opus_5.5';
const OUT = path.join(HERE, '..', 'assets', `${SLUG}.svg`);
const argOf = (name) => { const a = process.argv.find((v) => v.startsWith(`--${name}=`)); return a ? a.slice(name.length + 3) : null; };

// ---------------------------------------------------------------------------------------------
// Geometry
// ---------------------------------------------------------------------------------------------
const COLS = 80, CW = 8, CH = 16;          // an 80-column text screen of 8 x 16 cells
const WIN = 30;                            // rows visible in the scrolling window
const ROWS = 139;                          // rows in the whole piece
const PAD = 12;
const W = COLS * CW;                       // 640
const Y = (r) => r * CH;                   // row -> y
const X = (c) => c * CW;                   // column -> x

// The 16-colour DOS/ANSI palette.
const PAL = ['#000000', '#0000AA', '#00AA00', '#00AAAA', '#AA0000', '#AA00AA', '#AA5500', '#AAAAAA',
  '#555555', '#5555FF', '#55FF55', '#55FFFF', '#FF5555', '#FF55FF', '#FFFF55', '#FFFFFF'];
const [BLK, BLU, GRN, CYN, RED, MAG, BRN, LGR, DGR, LBL, LGN, LCY, LRD, LMG, YEL, WHT] = PAL.map((_, i) => i);
const NONE = 255;

// ---------------------------------------------------------------------------------------------
// CP437-style 8x16 bitmap font (the one drawn for the 06-ansi-bbs header in this folder, copied
// here so this file stands alone). Rows are '#'/'.' strings, placed from row `top` of the cell.
// ---------------------------------------------------------------------------------------------
const FONT = new Map();
function def(ch, top, rows) {
  const g = new Array(16).fill(0);
  rows.split(' ').forEach((r, i) => {
    let v = 0;
    for (let c = 0; c < 8; c++) if (r[c] === '#') v |= 1 << (7 - c);
    g[top + i] = v;
  });
  FONT.set(ch, g);
}
const CAPS = {
  A: '...#... ..###.. .##.##. ##...## ##...## ####### ##...## ##...## ##...## ##...##',
  B: '######. .##..## .##..## .##..## .#####. .##..## .##..## .##..## .##..## ######.',
  C: '..####. .##..## ##....# ##..... ##..... ##..... ##..... ##....# .##..## ..####.',
  D: '#####.. .##.##. .##..## .##..## .##..## .##..## .##..## .##..## .##.##. #####..',
  E: '####### .##..## .##...# .##.#.. .####.. .##.#.. .##.... .##...# .##..## #######',
  F: '####### .##..## .##...# .##.#.. .####.. .##.#.. .##.... .##.... .##.... ####...',
  G: '..####. .##..## ##....# ##..... ##..... ##.#### ##...## ##...## .##..## ..###.#',
  H: '##...## ##...## ##...## ##...## ####### ##...## ##...## ##...## ##...## ##...##',
  I: '.####.. ..##... ..##... ..##... ..##... ..##... ..##... ..##... ..##... .####..',
  J: '...#### ....##. ....##. ....##. ....##. ....##. ##..##. ##..##. ##..##. .####..',
  K: '###..## .##..## .##.##. .##.##. .####.. .####.. .##.##. .##..## .##..## ###..##',
  L: '####... .##.... .##.... .##.... .##.... .##.... .##.... .##...# .##..## #######',
  M: '##...## ###.### ####### ####### ##.#.## ##...## ##...## ##...## ##...## ##...##',
  N: '##...## ###..## ####.## ####### ##.#### ##..### ##...## ##...## ##...## ##...##',
  O: '.#####. ##...## ##...## ##...## ##...## ##...## ##...## ##...## ##...## .#####.',
  P: '######. .##..## .##..## .##..## .#####. .##.... .##.... .##.... .##.... ####...',
  R: '######. .##..## .##..## .##..## .#####. .##.##. .##..## .##..## .##..## ###..##',
  S: '.#####. ##...## ##...## .##.... ..###.. ....##. .....## ##...## ##...## .#####.',
  T: '.######. .######. .#.##.#. ...##... ...##... ...##... ...##... ...##... ...##... ..####..',
  U: '##...## ##...## ##...## ##...## ##...## ##...## ##...## ##...## ##...## .#####.',
  V: '##...## ##...## ##...## ##...## ##...## ##...## ##...## .##.##. ..###.. ...#...',
  W: '##...## ##...## ##...## ##...## ##.#.## ##.#.## ##.#.## ####### .##.##. .##.##.',
  X: '##...## ##...## .##.##. .#####. ..###.. ..###.. .#####. .##.##. ##...## ##...##',
  Y: '.##..##. .##..##. .##..##. .##..##. ..####.. ...##... ...##... ...##... ...##... ..####..',
  Z: '####### ##...## #...##. ...##.. ..##... .##.... ##..... ##....# ##...## #######',
  0: '..###.. .##.##. ##...## ##...## ##.#.## ##.#.## ##...## ##...## .##.##. ..###..',
  1: '..##... .###... ####... ..##... ..##... ..##... ..##... ..##... ..##... ######.',
  2: '.#####. ##...## .....## ....##. ...##.. ..##... .##.... ##..... ##...## #######',
  3: '.#####. ##...## .....## .....## ..####. .....## .....## .....## ##...## .#####.',
  4: '....##. ...###. ..####. .##.##. ##..##. ####### ....##. ....##. ....##. ...####',
  5: '####### ##..... ##..... ##..... ######. .....## .....## .....## ##...## .#####.',
  6: '..###.. .##.... ##..... ##..... ######. ##...## ##...## ##...## ##...## .#####.',
  7: '####### ##...## .....## ....##. ...##.. ..##... ..##... ..##... ..##... ..##...',
  8: '.#####. ##...## ##...## ##...## .#####. ##...## ##...## ##...## ##...## .#####.',
  9: '.#####. ##...## ##...## ##...## .###### .....## .....## .....## ....##. .####..',
};
for (const [ch, rows] of Object.entries(CAPS)) def(ch, 2, rows);
def('Q', 2, '.#####. ##...## ##...## ##...## ##...## ##...## ##...## ##.#.## ##.#### .#####. ....##. ....###');

const LOWER = {
  a: [5, '.####.. ....##. .#####. ##..##. ##..##. ##..##. .###.##'],
  b: [2, '###.... .##.... .##.... .####.. .##.##. .##..## .##..## .##..## .##..## .#####.'],
  c: [5, '.#####. ##...## ##..... ##..... ##..... ##...## .#####.'],
  d: [2, '...###. ....##. ....##. ..####. .##.##. ##..##. ##..##. ##..##. ##..##. .###.##'],
  e: [5, '.#####. ##...## ####### ##..... ##..... ##...## .#####.'],
  f: [2, '..###.. .##.##. .##..#. .##.... ####... .##.... .##.... .##.... .##.... ####...'],
  g: [5, '.###.## ##..##. ##..##. ##..##. ##..##. ##..##. .#####. ....##. ##..##. .####..'],
  h: [2, '###.... .##.... .##.... .##.##. .###.## .##..## .##..## .##..## .##..## ###..##'],
  i: [2, '..##... ..##... ....... .###... ..##... ..##... ..##... ..##... ..##... .####..'],
  j: [2, '....##. ....##. ....... ...###. ....##. ....##. ....##. ....##. ....##. ....##. .##.##. .##.##. ..###..'],
  k: [2, '###.... .##.... .##.... .##..## .##.##. .####.. .####.. .##.##. .##..## ###..##'],
  l: [2, '.###... ..##... ..##... ..##... ..##... ..##... ..##... ..##... ..##... .####..'],
  m: [5, '###.##. ####### ##.#.## ##.#.## ##.#.## ##.#.## ##...##'],
  n: [5, '##.###. .##..## .##..## .##..## .##..## .##..## .##..##'],
  o: [5, '.#####. ##...## ##...## ##...## ##...## ##...## .#####.'],
  p: [5, '##.###. .##..## .##..## .##..## .##..## .##..## .#####. .##.... .##.... ####...'],
  q: [5, '.###.## ##..##. ##..##. ##..##. ##..##. ##..##. .#####. ....##. ....##. ...####'],
  r: [5, '##.###. .###.## .##..## .##.... .##.... .##.... ####...'],
  s: [5, '.#####. ##...## .##.... ..###.. ....##. ##...## .#####.'],
  t: [2, '...#... ..##... ..##... ######. ..##... ..##... ..##... ..##... ..##.## ...###.'],
  u: [5, '##..##. ##..##. ##..##. ##..##. ##..##. ##..##. .###.##'],
  v: [5, '##...## ##...## ##...## ##...## .##.##. ..###.. ...#...'],
  w: [5, '##...## ##...## ##.#.## ##.#.## ##.#.## ####### .##.##.'],
  x: [5, '##...## .##.##. ..###.. ..###.. ..###.. .##.##. ##...##'],
  y: [5, '##...## ##...## ##...## ##...## ##...## ##...## .###### .....## ....##. #####..'],
  z: [5, '####### ##..##. ...##.. ..##... .##.... ##...## #######'],
};
for (const [ch, [top, rows]] of Object.entries(LOWER)) def(ch, top, rows);

const PUNCT = {
  '.': [10, '...##.. ...##..'],
  ',': [9, '...##.. ...##.. ...##.. ..##...'],
  ':': [5, '...##.. ...##.. ....... ....... ...##.. ...##..'],
  ';': [5, '...##.. ...##.. ....... ....... ...##.. ...##.. ..##...'],
  '!': [2, '...##.. ..####. ..####. ..####. ...##.. ...##.. ...##.. ....... ...##.. ...##..'],
  '?': [2, '.#####. ##...## ##...## ....##. ...##.. ...##.. ...##.. ....... ...##.. ...##..'],
  "'": [1, '...##.. ...##.. ..##...'],
  '"': [1, '.##..##. .##..##. ..#..#..'],
  '-': [7, '#######'],
  '_': [14, '########'],
  '/': [4, '......# .....## ....##. ...##.. ..##... .##.... ##..... #......'],
  '\\': [4, '#...... ##..... .##.... ..##... ...##.. ....##. .....## ......#'],
  '|': [2, '...##.. ...##.. ...##.. ...##.. ...##.. ...##.. ...##.. ...##.. ...##.. ...##.. ...##.. ...##..'],
  '(': [2, '....##. ...##.. ..##... ..##... ..##... ..##... ..##... ..##... ...##.. ....##.'],
  ')': [2, '.##.... ..##... ...##.. ...##.. ...##.. ...##.. ...##.. ...##.. ..##... .##....'],
  '[': [2, '.####.. .##.... .##.... .##.... .##.... .##.... .##.... .##.... .##.... .####..'],
  ']': [2, '.####.. ...##.. ...##.. ...##.. ...##.. ...##.. ...##.. ...##.. ...##.. .####..'],
  '{': [2, '....### ...##.. ...##.. ...##.. .###... ...##.. ...##.. ...##.. ...##.. ....###'],
  '}': [2, '###.... ..##... ..##... ..##... ...###. ..##... ..##... ..##... ..##... ###....'],
  '<': [3, '....##. ...##.. ..##... .##.... ##..... .##.... ..##... ...##.. ....##.'],
  '>': [3, '.##.... ..##... ...##.. ....##. .....## ....##. ...##.. ..##... .##....'],
  '#': [2, '.##.##. .##.##. ####### .##.##. .##.##. .##.##. ####### .##.##. .##.##.'],
  '*': [5, '.##..##. ..####.. ######## ..####.. .##..##.'],
  '+': [5, '...##... ...##... .######. ...##... ...##...'],
  '=': [6, '.######. ........ ........ .######.'],
  '@': [2, '.#####. ##...## ##...## ##.#### ##.#### ##.#### ##.###. ##..... ##..... .#####.'],
  '&': [2, '.###... ##.##.. ##.##.. .###... .###.## ##.###. ##..##. ##..##. ##..##. .###.##'],
  '%': [4, '##....#. ##...##. ....##.. ...##... ..##.... .##..... ##...##. #....##.'],
  '~': [2, '.###.## ##.###.'],
  '♪': [3, '...##... ...###.. ...####. ...##.##. ...##..#. ...##... ...##... .####... #####... .###....'],
  '►': [3, '#....... ##...... ###..... ####.... #####... ####.... ###..... ##...... #.......'],
  '◄': [3, '....#... ...##... ..###... .####... #####... .####... ..###... ...##... ....#...'],
  '▼': [5, '#######. .#####.. ..###... ...#....'],
  '▲': [7, '...#.... ..###... .#####.. #######.'],
  '×': [6, '##...##. .##.##.. ..###... .##.##.. ##...##.'],
  '·': [7, '...##... ...##...'],
  '•': [6, '...##... ..####.. ..####.. ...##...'],
  '→': [5, '....##.. .....##. ######## .....##. ....##..'],
  '■': [5, '.######. .######. .######. .######. .######. .######.'],
  '♥': [4, '.##.##. ####### ####### ####### .#####. ..###.. ...#...'],
};
for (const [ch, [top, rows]] of Object.entries(PUNCT)) def(ch, top, rows);
FONT.set(' ', new Array(16).fill(0));

// Blocks and CP437 shades.
const rowsOf = (fn) => Array.from({ length: 16 }, (_, y) => fn(y));
FONT.set('█', rowsOf(() => 0xFF));
FONT.set('▀', rowsOf((y) => (y < 8 ? 0xFF : 0)));
FONT.set('▄', rowsOf((y) => (y >= 8 ? 0xFF : 0)));
FONT.set('▌', rowsOf(() => 0xF0));
FONT.set('▐', rowsOf(() => 0x0F));
FONT.set('░', rowsOf((y) => (y % 2 ? 0x88 : 0x22)));
FONT.set('▒', rowsOf((y) => (y % 2 ? 0xAA : 0x55)));
FONT.set('▓', rowsOf((y) => (y % 2 ? 0x77 : 0xDD)));

// Box drawing, generated from arm descriptions: single lines on row 7 / column 3,
// double lines on rows 6+9 / columns 2+5.
function box(ch, spec) {
  const g = new Array(16).fill(0);
  const set = (x, y) => { g[y] |= 1 << (7 - x); };
  const hline = (y, x0, x1) => { for (let x = x0; x <= x1; x++) set(x, y); };
  const vline = (x, y0, y1) => { for (let y = y0; y <= y1; y++) set(x, y); };
  spec({ hline, vline });
  FONT.set(ch, g);
}
box('─', ({ hline }) => hline(7, 0, 7));
box('│', ({ vline }) => vline(3, 0, 15));
box('┌', ({ hline, vline }) => { hline(7, 3, 7); vline(3, 7, 15); });
box('┐', ({ hline, vline }) => { hline(7, 0, 3); vline(3, 7, 15); });
box('└', ({ hline, vline }) => { hline(7, 3, 7); vline(3, 0, 7); });
box('┘', ({ hline, vline }) => { hline(7, 0, 3); vline(3, 0, 7); });
box('┴', ({ hline, vline }) => { hline(7, 0, 7); vline(3, 0, 7); });
box('├', ({ hline, vline }) => { hline(7, 3, 7); vline(3, 0, 15); });
box('┤', ({ hline, vline }) => { hline(7, 0, 3); vline(3, 0, 15); });
box('═', ({ hline }) => { hline(6, 0, 7); hline(9, 0, 7); });
box('║', ({ vline }) => { vline(2, 0, 15); vline(5, 0, 15); });
box('╔', ({ hline, vline }) => { hline(6, 2, 7); vline(2, 6, 15); hline(9, 5, 7); vline(5, 9, 15); });
box('╗', ({ hline, vline }) => { hline(6, 0, 5); vline(5, 6, 15); hline(9, 0, 2); vline(2, 9, 15); });
box('╚', ({ hline, vline }) => { hline(9, 2, 7); vline(2, 0, 9); hline(6, 5, 7); vline(5, 0, 6); });
box('╝', ({ hline, vline }) => { hline(9, 0, 5); vline(5, 0, 9); hline(6, 0, 2); vline(2, 0, 6); });
// Glyph bitmap -> compact path (greedy merge of horizontal runs into rectangles).
function bitmapPath(rows, width, scaleX = 1, scaleY = 1, ox = 0, oy = 0) {
  const rects = [];
  let open = [];
  for (let y = 0; y < rows.length; y++) {
    const runs = [];
    for (let x = 0; x < width;) {
      if (rows[y](x)) { const s0 = x; while (x < width && rows[y](x)) x++; runs.push([s0, x - s0]); } else x++;
    }
    const next = [];
    for (const [x0, w] of runs) {
      const o = open.find((r) => r.x === x0 && r.w === w && r.y + r.h === y);
      if (o) { o.h++; next.push(o); } else { const r = { x: x0, w, y, h: 1 }; rects.push(r); next.push(r); }
    }
    open = next;
  }
  return rects.map((r) => `M${ox + r.x * scaleX} ${oy + r.y * scaleY}h${r.w * scaleX}v${r.h * scaleY}h${-r.w * scaleX}z`).join('');
}
const glyphPath = (g) => bitmapPath(g.map((v) => (x) => (v >> (7 - x)) & 1), 8);

const glyphIds = new Map();
function gid(ch) {
  if (!FONT.has(ch)) throw new Error(`no glyph for ${JSON.stringify(ch)} (U+${ch.codePointAt(0).toString(16)})`);
  if (!glyphIds.has(ch)) glyphIds.set(ch, `g${glyphIds.size.toString(36)}`);
  return glyphIds.get(ch);
}

// ---------------------------------------------------------------------------------------------
// Signed distance shapes. Every shape is a function (x, y) -> distance (negative inside) with a
// bounding box in `.bb`, so painting only visits the samples that can matter.
// ---------------------------------------------------------------------------------------------
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const mk = (fn, bb) => { fn.bb = bb; return fn; };
const circle = (cx, cy, r) => mk((x, y) => Math.hypot(x - cx, y - cy) - r, [cx - r, cy - r, cx + r, cy + r]);
const ellipse = (cx, cy, rx, ry) => mk((x, y) => {
  const px = x - cx, py = y - cy;
  const k0 = Math.hypot(px / rx, py / ry);
  if (k0 < 1e-6) return -Math.min(rx, ry);
  const k1 = Math.hypot(px / (rx * rx), py / (ry * ry));
  return k0 * (k0 - 1) / k1;
}, [cx - rx, cy - ry, cx + rx, cy + ry]);
const rbox = (x0, y0, x1, y1, r = 0) => {
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, hx = (x1 - x0) / 2 - r, hy = (y1 - y0) / 2 - r;
  return mk((x, y) => {
    const qx = Math.abs(x - cx) - hx, qy = Math.abs(y - cy) - hy;
    return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
  }, [x0, y0, x1, y1]);
};
const capsule = (ax, ay, bx, by, r) => {
  const ex = bx - ax, ey = by - ay, ll = ex * ex + ey * ey || 1;
  return mk((x, y) => {
    const t = clamp01(((x - ax) * ex + (y - ay) * ey) / ll);
    return Math.hypot(x - ax - ex * t, y - ay - ey * t) - r;
  }, [Math.min(ax, bx) - r, Math.min(ay, by) - r, Math.max(ax, bx) + r, Math.max(ay, by) + r]);
};
const bbUnion = (list) => list.reduce((a, b) => [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[2], b[2]), Math.max(a[3], b[3])]);
const union = (...ss) => mk((x, y) => { let d = Infinity; for (const s of ss) { const v = s(x, y); if (v < d) d = v; } return d; }, bbUnion(ss.map((s) => s.bb)));
const sub = (a, b) => mk((x, y) => Math.max(a(x, y), -b(x, y)), a.bb);
// Keep only the part of a shape on one side of a line (nx, ny is the outward normal of the cut).
const cut = (s, px, py, nx, ny) => { const l = Math.hypot(nx, ny); return mk((x, y) => Math.max(s(x, y), ((x - px) * nx + (y - py) * ny) / l), s.bb); };
const stroke = (pts, r) => union(...pts.slice(1).map((p, i) => capsule(pts[i][0], pts[i][1], p[0], p[1], r)));
const poly = (pts) => {
  const n = pts.length;
  return mk((x, y) => {
    let d = Infinity, s = 1;
    for (let i = 0, j = n - 1; i < n; j = i, i++) {
      const ex = pts[j][0] - pts[i][0], ey = pts[j][1] - pts[i][1];
      const wx = x - pts[i][0], wy = y - pts[i][1];
      const t = clamp01((wx * ex + wy * ey) / (ex * ex + ey * ey));
      const bx = wx - ex * t, by = wy - ey * t;
      d = Math.min(d, bx * bx + by * by);
      const c1 = y >= pts[i][1], c2 = y < pts[j][1], c3 = ex * wy > ey * wx;
      if ((c1 && c2 && c3) || (!c1 && !c2 && !c3)) s = -s;
    }
    return s * Math.sqrt(d);
  }, [Math.min(...pts.map((p) => p[0])), Math.min(...pts.map((p) => p[1])), Math.max(...pts.map((p) => p[0])), Math.max(...pts.map((p) => p[1]))]);
};
// Rotate a shape by `deg` (clockwise on screen) about (cx, cy).
const rot = (s, deg, cx, cy) => {
  const a = deg * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a);
  const corners = [[s.bb[0], s.bb[1]], [s.bb[2], s.bb[1]], [s.bb[2], s.bb[3]], [s.bb[0], s.bb[3]]]
    .map(([x, y]) => [cx + (x - cx) * ca - (y - cy) * sa, cy + (x - cx) * sa + (y - cy) * ca]);
  return mk((x, y) => s(cx + (x - cx) * ca + (y - cy) * sa, cy - (x - cx) * sa + (y - cy) * ca),
    [Math.min(...corners.map((p) => p[0])), Math.min(...corners.map((p) => p[1])), Math.max(...corners.map((p) => p[0])), Math.max(...corners.map((p) => p[1]))]);
};
// Points along a quadratic Bezier, for curved strokes.
const quad = (p0, p1, p2, n = 10) => Array.from({ length: n + 1 }, (_, i) => {
  const t = i / n, u = 1 - t;
  return [u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0], u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1]];
});
const pt = (cx, cy, r, deg) => [cx + r * Math.cos(deg * Math.PI / 180), cy + r * Math.sin(deg * Math.PI / 180)];

// ---------------------------------------------------------------------------------------------
// The sample canvas: 4 x 4 samples per cell (each sample is 2 x 4 px). A sample is either a flat
// colour or a two-colour ramp (a -> b) with a position t, which becomes shade characters.
// ---------------------------------------------------------------------------------------------
const NX = COLS * 4, NY = ROWS * 4;
const sA = new Uint8Array(NX * NY), sB = new Uint8Array(NX * NY).fill(NONE), sT = new Float32Array(NX * NY);
let dirty = null;                           // while an overlay is being painted: the samples it touched
function setS(i, j, ink, x, y) {
  const k = j * NX + i;
  if (dirty) { if (i < dirty[0]) dirty[0] = i; if (j < dirty[1]) dirty[1] = j; if (i > dirty[2]) dirty[2] = i; if (j > dirty[3]) dirty[3] = j; }
  if (typeof ink === 'number') { sA[k] = ink; sB[k] = NONE; sT[k] = 0; } else { sA[k] = ink.a; sB[k] = ink.b; sT[k] = clamp01(ink.t(x, y)); }
}
let OX = 0, OY = 0;                         // where the current drawing is placed (see at())
function paint(shape, ink, g = 0) {
  const bb = shape.bb;
  const i0 = Math.max(0, Math.floor((bb[0] + OX - g) / 2) - 1), i1 = Math.min(NX - 1, Math.ceil((bb[2] + OX + g) / 2) + 1);
  const j0 = Math.max(0, Math.floor((bb[1] + OY - g) / 4) - 1), j1 = Math.min(NY - 1, Math.ceil((bb[3] + OY + g) / 4) + 1);
  for (let j = j0; j <= j1; j++) {
    const y = j * 4 + 2 - OY;
    for (let i = i0; i <= i1; i++) { const x = i * 2 + 1 - OX; if (shape(x, y) < g) setS(i, j, ink, x, y); }
  }
}
// Draw something somewhere else: everything painted inside fn is moved by (dx, dy). Keep dx a
// multiple of 8 and dy a multiple of 16 and the drawing lands on the cell grid exactly as before.
function at(dx, dy, fn) { const px = OX, py = OY; OX += dx; OY += dy; fn(); OX = px; OY = py; }
const INK = 7;                              // outline thickness in px (about one cell wide)
// A toon group: one black outline round the union of the parts, then the flat fills in order.
function toon(parts, o = INK) { for (const [s] of parts) paint(s, BLK, o); for (const [s, ink] of parts) paint(s, ink); }
const line = (pts, w = INK) => paint(stroke(pts, w / 2), BLK);
const rect = (x0, y0, x1, y1, ink) => paint(rbox(x0, y0, x1, y1), ink);
// A ramp from colour a to colour b across a band `w` px wide around the edge of `shape` (a inside).
const ramp = (a, b, shape, w = 22) => ({ a, b, t: (x, y) => shape(x, y) / w + 0.5 });

// Text and hand-placed cells sit on top of the legalised picture.
const texts = new Map();                    // cell index -> { r, c, ch, fg }
function put(r, c, str, fg, bg, cls) {
  const n = [...str].length;
  if (c < 0 || c + n > COLS || r < 0 || r >= ROWS) throw new Error(`text off the piece at ${r},${c}: ${str}`);
  if (bg !== undefined) { const px = OX, py = OY; OX = OY = 0; rect(X(c), Y(r), X(c + n), Y(r + 1), bg); OX = px; OY = py; }
  let cc = c;
  for (const ch of str) { if (ch === ' ') texts.delete(r * COLS + cc); else texts.set(r * COLS + cc, { r, c: cc, ch, fg, cls }); cc++; }
  return cc;
}
// Things that move. An overlay is a repaint of part of the picture (a blink, a sound effect) that
// is legalised like everything else and shown or hidden by CSS. A sprite is a set of cell-sized
// rectangles [x, y, w, h, colour] that slides in whole-cell steps inside a clip box.
const overlays = [], sprites = [];
const overlay = (cls, fn) => overlays.push({ cls, fn });
const sprite = (cls, clip, rects) => sprites.push({ cls, clip, rects });
const centre = (str, c0 = 0, c1 = COLS) => c0 + Math.floor((c1 - c0 - [...str].length) / 2);

// ---------------------------------------------------------------------------------------------
// THE PIECE
// ---------------------------------------------------------------------------------------------
// ---- Header band on black: the title in block letters with shading --------------------------
// Letters are 32 px wide and 5 rows tall, built from 12 px stems and full-row bars whose ends are
// nudged by half a cell, so every cell stays a full block or a left/right half block.
const TITLE_ROW = 1;
const SEG = { B: [[0, 12], [20, 32]], L: [[0, 12]], R: [[20, 32]], C: [[8, 24]], '=': [[0, 32]], '(': [[4, 32]], ')': [[0, 28]], o: [[4, 28]], I: [[0, 12]] };
const LETTERS = {
  U: ['B', 'B', 'B', 'B', 'o'], L: ['L', 'L', 'L', 'L', '='], T: ['=', 'C', 'C', 'C', 'C'],
  R: [')', 'B', ')', [[0, 12], [16, 28]], [[0, 12], [20, 32]]], A: ['o', 'B', '=', 'B', 'B'],
  S: ['(', 'L', 'o', 'R', ')'], I: ['I', 'I', 'I', 'I', 'I'], F: ['=', 'L', [[0, 24]], 'L', 'L'],
  C: ['(', 'L', 'L', 'L', '('], O: ['o', 'B', 'B', 'B', 'o'], Y: ['B', 'B', 'o', 'C', 'C'],
};
function titleWord(word, x, tones, lip) {
  for (const ch of word) {
    LETTERS[ch].forEach((row, i) => {
      for (const [a, b] of (typeof row === 'string' ? SEG[row] : row)) {
        rect(x + a, Y(TITLE_ROW + i), x + b, Y(TITLE_ROW + i + 1), tones[i]);
        if (i === 4) rect(x + a, Y(TITLE_ROW + 5), x + b, Y(TITLE_ROW + 5) + 8, lip);
      }
    });
    x += (ch === 'I' ? 12 : 32) + 4;
  }
  return x;
}
{
  const x = titleWord('ULTRA', 20, [WHT, LCY, LCY, LCY, CYN], BLU);
  titleWord('SATISFACTORY', x + 12, [WHT, WHT, WHT, WHT, LGR], DGR);
  let c = put(0, 2, 'SWARF', LRD);
  put(0, c + 1, 'productions presents', DGR);
  put(0, 66, '[pj/SWF \'26]', DGR);
  const tag = 'A COMPANION APP FOR THE FACTORY GAME SATISFACTORY';
  const fan = 'UNOFFICIAL FAN PROJECT';
  c = centre(`${tag} · ${fan}`);
  c = put(7, c, tag, YEL);
  c = put(7, c + 1, '·', DGR);
  put(7, c + 1, fan, LGR);
}

// ---- Reusable toon parts ----------------------------------------------------------------------
// A white cartoon glove making a fist, thumb up. (x, y) is the middle of the fist; `dir` is 1 when
// the fingers curl towards the right, -1 for the mirror image.
function thumbsUp(x, y, dir = 1) {
  const fist = rbox(x - 28, y - 22, x + 28, y + 26, 15);
  const thumb = capsule(x - 12 * dir, y - 16, x - 16 * dir, y - 52, 12);
  const cuff = rbox(x - 39 * dir - 9, y - 10, x - 39 * dir + 9, y + 28, 6);
  toon([[cuff, WHT], [fist, WHT], [thumb, WHT]]);
  line([[x + 10 * dir, y - 4], [x + 26 * dir, y - 4]], 5);
  line([[x + 10 * dir, y + 10], [x + 26 * dir, y + 10]], 5);
}
// A speech balloon on whole cells, with a tail.
function balloon(c0, r0, c1, r1, tail) {
  toon([[poly(tail), WHT], [rbox(X(c0), Y(r0), X(c1), Y(r1), 14), WHT]]);
}
// A comic caption box: black text on yellow with a black border, on whole cells.
function caption(r, c, lines, fg = BLK, bg = YEL) {
  const w = Math.max(...lines.map((l) => [...l].length)) + 2;
  rect(X(c) - 4, Y(r) - 8, X(c + w) + 4, Y(r + lines.length) + 8, BLK);
  rect(X(c), Y(r), X(c + w), Y(r + lines.length), bg);
  lines.forEach((l, i) => put(r + i, c + 1, l, fg));
}
// A card: a flat box on whole cells with a black drop shadow. Returns nothing; write on it with put().
function card(r0, c0, r1, c1, bg) {
  rect(X(c0) + 8, Y(r0) + 8, X(c1) + 8, Y(r1) + 8, BLK);
  rect(X(c0), Y(r0), X(c1), Y(r1), bg);
}
// A conveyor belt running from x0 to x1 with its top surface at y.
function belt(x0, x1, y) {
  rect(x0, y - 4, x1, y + 20, BLK);
  rect(x0, y, x1, y + 12, DGR);
  for (let x = x0 + 8; x + 16 <= x1; x += 32) rect(x, y + 4, x + 16, y + 8, LGR);
}
// A screw standing on its point: three cells of head over one cell of shaft.
function screw(x, y) {
  rect(x - 12, y - 24, x + 12, y - 16, LGR); rect(x - 12, y - 24, x - 4, y - 16, WHT);
  rect(x - 4, y - 16, x + 4, y, LGR);
}
const steelTo = (x) => ramp(LGR, DGR, rbox(-999, -999, x, 9999), 12);   // steel, shaded to the right of x

// ---- The mascot: GARY, senior cog -------------------------------------------------------------
// An original character: a gold cog with eight teeth, heavy eyelids, a red hard hat, rubber-hose
// limbs and the regulation white gloves. Drawn with its hub at (250, 352).
function gary({ limbs = true } = {}) {
  const C = [250, 352], RB = 102, TH = 48, N = 8;
  const tooth = (deg) => poly([[RB - 10, -25], [RB + TH, -23], [RB + TH, 23], [RB - 10, 25]].map(([u, v]) => {
    const a = deg * Math.PI / 180;
    return [C[0] + u * Math.cos(a) - v * Math.sin(a), C[1] + u * Math.sin(a) + v * Math.cos(a)];
  }));
  const cog = union(circle(C[0], C[1], RB), ...Array.from({ length: N }, (_, k) => tooth(k * 360 / N)));
  const gold = ramp(YEL, BRN, circle(C[0] - 30, C[1] - 26, 158), 14);

  if (limbs) {
    // legs and boots (behind the body)
    paint(stroke([[206, 440], [204, 548]], 8), BLK); paint(stroke([[294, 440], [296, 548]], 8), BLK);
    const bootInk = ramp(LRD, RED, rbox(0, 0, W, 562), 10);
    toon([[union(rbox(186, 540, 224, 576, 10), ellipse(182, 562, 28, 14)), bootInk]]);
    toon([[union(rbox(276, 540, 314, 576, 10), ellipse(318, 562, 28, 14)), bootInk]]);

    // the spanner, then the arm and the fist that holds it
    const steel = steelTo(76);
    toon([[rbox(62, 318, 82, 472, 5), steel], [sub(circle(72, 298, 28), rbox(61, 256, 83, 298, 3)), steel]]);
    rect(64, 330, 68, 394, WHT);
    paint(stroke(quad([140, 384], [120, 392], [108, 416], 8), 8), BLK);
    toon([[rbox(100, 404, 118, 444, 6), WHT], [rbox(44, 398, 102, 446, 15), WHT]]);
    toon([[capsule(66, 406, 88, 410, 8), WHT]], 5);
    line([[46, 422], [62, 422]], 5); line([[46, 434], [62, 434]], 5);

    // the other arm, thumb up
    paint(stroke(quad([360, 384], [386, 394], [402, 384], 8), 8), BLK);
    thumbsUp(440, 366, 1);
  }

  // body
  toon([[cog, gold]]);
  paint(stroke(quad(pt(C[0], C[1], 88, 190), pt(C[0], C[1], 100, 215), pt(C[0], C[1], 88, 240), 8), 3), WHT);   // highlight

  // hard hat
  const tip = (s) => rot(s, -6, 250, 262);
  const dome = tip(cut(ellipse(250, 262, 94, 82), 250, 262, 0, 1));
  const brim = tip(rbox(140, 252, 384, 272, 10));
  const hatInk = ramp(LRD, RED, tip(ellipse(228, 228, 100, 74)), 14);
  toon([[dome, hatInk], [brim, hatInk]]);
  line(quad([164, 268], [250, 254], [336, 246], 8), 5);                                 // where dome meets brim
  toon([[tip(rbox(240, 172, 262, 254, 8)), LRD]], 5);                                   // crest
  paint(tip(ellipse(200, 206, 16, 8)), WHT);                                            // highlight
  toon([[tip(poly(Array.from({ length: 6 }, (_, k) => pt(300, 222, 17, k * 60)))), LCY]], 5);   // the badge: a hexagon

  // eyes: two tall white ovals that touch, under heavy lids
  const eyeL = ellipse(222, 324, 31, 42), eyeR = ellipse(282, 324, 31, 42);
  toon([[eyeL, WHT], [eyeR, WHT]], 6);
  paint(cut(eyeL, 0, 304, 0, 1), BRN); paint(cut(eyeR, 0, 304, 0, 1), BRN);
  line([[194, 306], [250, 306]], 6); line([[254, 306], [310, 306]], 6);
  paint(ellipse(232, 332, 12, 17), BLK); paint(ellipse(292, 332, 12, 17), BLK);       // pupils
  rect(226, 320, 230, 328, WHT); rect(286, 320, 290, 328, WHT);
  // the smirk
  const grin = cut(ellipse(254, 392, 54, 34), 254, 394, 0, -1);
  toon([[grin, WHT]], 6);
  for (const x of [232, 256, 280]) rect(x, 394, x + 4, 430, BLK);
  line([[196, 392], [312, 392]], 6); line([[306, 384], [318, 394]], 6);
}

// The same eyes, shut: painted as an overlay and shown for a moment now and then.
function garyBlink() {
  paint(ellipse(222, 324, 31, 42), BRN); paint(ellipse(282, 324, 31, 42), BRN);
  line(quad([198, 340], [222, 358], [246, 340], 6), 6); line(quad([258, 340], [282, 358], [306, 340], 6), 6);
}

// ---- Section 1: Gary on a flat royal blue ground ----------------------------------------------
const PIC = 8;                               // first row of the picture
rect(0, Y(PIC), W, Y(40), BLU);
{
  // the belt he stands on, and what is riding it
  belt(0, W, 580);
  rect(0, 600, W, 616, LGR); rect(0, 608, W, 616, DGR); rect(0, 616, W, 624, BLK);
  for (let x = 24; x < W; x += 64) { paint(circle(x, 608, 9), BLK); paint(circle(x, 608, 5), LGR); }
  rect(0, 624, W, 640, BLK);
  // a crate and a stack of plates, waiting their turn
  toon([[rbox(392, 528, 448, 576, 3), ramp(YEL, BRN, rbox(0, 0, 428, 999), 10)]]);
  line([[392, 552], [448, 552]], 4);
  toon([[rbox(520, 562, 600, 576, 2), LGR], [rbox(528, 548, 608, 562, 2), LGR], [rbox(516, 534, 596, 548, 2), WHT]]);
}
gary();
overlay('bk', garyBlink);
balloon(52, 9, 78, 15, [[440, 232], [476, 232], [404, 282]]);
['EVERY RECIPE, BUILDING', 'AND SPACE ELEVATOR', 'OBJECTIVE: ONE CLICK', 'APART. I TIMED IT.'].forEach((l, i) => put(10 + i, centre(l, 52, 78), l, BLK));
caption(9, 2, ['GARY, SENIOR COG', '8 TEETH. 0 SICK DAYS.']);
// the credit plaque: a blue box with a drop shadow, three lines
{
  const r0 = 24, c0 = 59, c1 = 77;
  card(r0, c0, r0 + 5, c1 + 1, LBL);
  put(r0, c0, '┌' + '─'.repeat(c1 - c0 - 1) + '┐', WHT);
  for (let r = r0 + 1; r < r0 + 4; r++) { put(r, c0, '│', WHT); put(r, c1, '│', WHT); }
  put(r0 + 4, c0, '└' + '─'.repeat(c1 - c0 - 1) + '┘', WHT);
  put(r0 + 1, centre('pallet jack', c0, c1 + 1), 'pallet jack', WHT);
  put(r0 + 2, centre('S W A R F', c0, c1 + 1), 'S W A R F', YEL);
  put(r0 + 3, centre('production', c0, c1 + 1), 'production', LCY);
}
[[15, 2, '*', WHT], [14, 12, '+', YEL], [13, 5, '·', WHT], [17, 59, '*', YEL], [20, 61, '·', WHT], [18, 62, '+', WHT]].forEach(([r, c, ch, fg], i) => put(r, c, ch, fg, undefined, i % 2 ? 't1' : 't2'));
caption(31, 2, ['THE BELT WAS', '"TEMPORARY".', 'IT IS NOW', 'LOAD-BEARING.']);
caption(30, 59, ['THREE TABS BELOW.', 'KEEP SCROLLING.']);
rect(0, Y(40), W, Y(41), BLK);

// ---- The comic panels: one per tab, then how to run it -----------------------------------------
// Panel headings use a 3 x 5 block alphabet whose pixels are one cell wide and half a cell tall.
const TINY = {
  A: '.#. #.# ### #.# #.#', B: '##. #.# ##. #.# ##.', C: '.## #.. #.. #.. .##', D: '##. #.# #.# #.# ##.',
  E: '### #.. ##. #.. ###', G: '.## #.. #.# #.# .##', I: '### .#. .#. .#. ###', J: '..# ..# ..# #.# .#.',
  L: '#.. #.. #.. #.. ###', M: '#.# ### ### #.# #.#', N: '##. #.# #.# #.# #.#', O: '.#. #.# #.# #.# .#.',
  R: '##. #.# ##. #.# #.#', S: '.## #.. .#. ..# ##.', T: '### .#. .#. .#. .#.', U: '#.# #.# #.# #.# ###',
  V: '#.# #.# #.# #.# .#.', K: '#.# #.# ##. #.# #.#', '!': '.#. .#. .#. ... .#.', ' ': '... ... ... ... ...',
};
function heading(r, c, str, colour, pitch = 5) {
  const y0 = Y(r) + 8;
  for (const [dx, dy, ink] of [[8, 8, BLK], [0, 0, colour]]) {
    [...str].forEach((ch, k) => TINY[ch].split(' ').forEach((row, j) => [...row].forEach((bit, i) => {
      if (bit === '#') rect(X(c + k * pitch + i) + dx, y0 + j * 8 + dy, X(c + k * pitch + i + 1) + dx, y0 + j * 8 + 8 + dy, ink);
    })));
  }
}
// The black strip along the top of a panel: a coloured chip and one line of narration.
function strip(r, chip, chipFg, chipBg, text) {
  rect(0, Y(r), W, Y(r + 1), BLK);
  const c = put(r, 1, ` ${chip} `, chipFg, chipBg);
  put(r, c + 1, text, WHT);
}
const stars = (r0, list) => list.forEach(([r, c, ch, ink]) => put(r0 + r, c, ch, ink));
const smoke = (x, y) => { toon([[circle(x + 4, y, 11), WHT]], 5); toon([[circle(x + 22, y - 22, 8), WHT]], 5); toon([[circle(x + 40, y - 38, 5), WHT]], 4); };

// ---- Panel 1: OBJECTIVES, on purple --------------------------------------------------------------
{
  const r0 = 41, R = (r) => r0 + r;
  rect(0, Y(r0), W, Y(r0 + 23), MAG);
  at(0, Y(r0), () => {
    toon([[ellipse(560, 408, 250, 118), GRN]]);                                       // the planet
    // the elevator: my own design, a cable, a climber and a base
    rect(532, 16, 548, 300, BLK); rect(536, 16, 544, 300, LGR);
    toon([[rbox(508, 88, 572, 148, 12), steelTo(552)]]);
    paint(circle(540, 116, 12), BLK); paint(circle(540, 116, 7), LCY);
    toon([[poly([[472, 300], [498, 232], [582, 232], [608, 300]]), steelTo(556)]]);
    rect(504, 240, 576, 248, YEL);
    rect(528, 264, 552, 300, BLK);
    // the glove holding the clipboard up from below: cuff and fist behind the board...
    // (its edges and finger lines sit on the half-row grid, so they stay crisp after legalising)
    toon([[rbox(328, 344, 376, 384, 4), WHT], [rbox(312, 280, 384, 352, 16), WHT]]);
    rect(360, 304, 392, 312, BLK); rect(360, 328, 392, 336, BLK);
    // the clipboard
    toon([[rbox(24, 88, 320, 420, 8), BRN]]);
    rect(40, 112, 304, 400, WHT);
    toon([[rbox(132, 70, 212, 110, 6), steelTo(190)]]);
    paint(circle(172, 86, 6), BLK);
    toon([[rbox(288, 296, 344, 320, 12), WHT]]);                                   // ...and the thumb clamped on the front
  });
  rect(0, Y(r0 + 23), W, Y(r0 + 24), BLK);
  strip(r0, 'TAB 1 OF 3', WHT, MAG, 'PICK A SPACE ELEVATOR PHASE. SEE THE PARTS IT NEEDS, AND HOW MANY.');
  heading(R(1), 2, 'OBJECTIVES', YEL);
  stars(r0, [[2, 56, '·', WHT], [3, 61, '+', LMG], [2, 74, '*', WHT], [5, 78, '·', LMG], [6, 45, '·', WHT], [7, 58, '+', WHT], [9, 73, '·', WHT], [10, 48, '*', LMG], [12, 77, '+', LMG], [13, 55, '·', WHT], [8, 43, '·', LMG], [12, 44, '·', WHT]]);
  put(R(8), 6, 'SPACE ELEVATOR: PHASE 3 OF 5', BLK);
  put(R(9), 6, '"OIL & COMPUTERS"', BLU);
  put(R(10), 6, '─'.repeat(31), LGR);
  // the list, with one part picked (the app has no tick boxes: you click a part and get its recipe)
  const item = (r, picked, name, qty) => {
    if (picked) put(r, 5, ' '.repeat(33), WHT, BLU);
    put(r, 7, picked ? '►' : '·', picked ? YEL : DGR); put(r, 10, name, picked ? WHT : BLK); put(r, 37 - qty.length, qty, picked ? YEL : BLU);
  };
  item(R(12), true, 'Versatile Framework', 'x2500');
  item(R(14), false, 'Modular Engine', 'x500');
  item(R(16), false, 'Adaptive Control Unit', 'x100');
  put(R(18), 6, 'click a part, get its recipe.', DGR);
  put(R(21), 6, 'p.1 of a lot', LGR);
  caption(R(20), 56, ['THE ELEVATOR WANTS', '2500 OF THEM. IT DID', 'NOT SAY PLEASE.']);
}

// ---- Panel 2: ITEMS, on red ---------------------------------------------------------------------
{
  const r0 = 65, R = (r) => r0 + r;
  rect(0, Y(r0), W, Y(r0 + 23), RED);
  at(0, Y(r0), () => {
    rect(0, 320, W, 368, BLK);                                                        // the floor
    // the search box
    rect(X(30), Y(2) - 8, X(60), Y(3) + 8, BLK); rect(X(31), Y(2), X(59), Y(3), WHT);
    // a Constructor (my own design: a hopper, a window, a chute and a chimney)
    smoke(184, 100);
    toon([[rbox(164, 114, 188, 172, 3), DGR]]);
    toon([[poly([[48, 124], [148, 124], [128, 168], [68, 168]]), steelTo(116)]]);
    toon([[rbox(208, 236, 240, 276, 3), DGR]]);
    toon([[rbox(32, 164, 208, 312, 8), steelTo(150)]]);
    toon([[rbox(52, 184, 116, 228, 6), LCY]], 5);
    rect(60, 192, 68, 208, WHT);
    toon([[circle(160, 206, 14), LRD]], 5);
    rect(X(5), Y(15), X(18), Y(16), BLK);
    rect(40, 280, 200, 296, BLK); for (let x = 40; x < 200; x += 16) rect(x, 280, x + 8, 296, YEL);
    rect(48, 312, 72, 320, BLK); rect(168, 312, 192, 320, BLK);
    // the belt out of it, and the screws
    rect(240, 272, 472, 280, DGR); rect(240, 280, 472, 288, BLK);
    rect(280, 288, 288, 320, BLK); rect(416, 288, 424, 320, BLK);
    // the box: full of screws, then some
    toon([[union(ellipse(544, 212, 62, 26), ellipse(512, 198, 26, 16), ellipse(574, 194, 30, 18)), LGR]]);
    for (const [x, y] of [[500, 192], [548, 176], [588, 188]]) { rect(x - 16, y - 28, x + 16, y - 12, BLK); rect(x - 8, y - 16, x + 8, y + 4, BLK); screw(x, y); }
    toon([[rbox(472, 224, 616, 320, 4), ramp(YEL, BRN, rbox(0, 0, 590, 999), 12)]]);
    line([[472, 250], [616, 250]], 4); line([[472, 296], [616, 296]], 4);
    rect(X(62), Y(17), X(72), Y(18), BLK);
    for (const x of [444, 636]) screw(x, 320);
    rect(424, 312, 432, 320, LGR); rect(408, 312, 424, 320, WHT);                     // one lying down
  });
  rect(0, Y(r0 + 23), W, Y(r0 + 24), BLK);
  strip(r0, 'TAB 2 OF 3', BLK, LMG, 'SEARCH AS YOU TYPE. RECIPE CARDS: RATES, MACHINE, CYCLE, POWER.');
  heading(R(1), 2, 'ITEMS', LMG);
  put(R(2), 32, 'SEARCH: scre_', BLK);
  put(R(2), 62, '→ 1 of 140 items', WHT);
  overlay('tk', () => heading(R(4), 60, 'TINK!', YEL, 4));
  // The belt really does deliver 40 screws a minute: they are 64 px apart and move 64 px every 1.5 s.
  const y0 = Y(r0), dashes = [], screws = [];
  for (let x = 208; x < 472; x += 32) dashes.push([x, y0 + 272, 16, 8, LGR]);
  for (let x = 468 - 64 * 4; x <= 468; x += 64) screws.push([x - 12, y0 + 248, 24, 8, LGR], [x - 4, y0 + 256, 8, 16, LGR], [x - 12, y0 + 248, 8, 8, WHT]);
  sprite('bt', [248, y0 + 272, 464, y0 + 280], dashes);
  sprite('sw', [248, y0 + 240, 464, y0 + 272], screws);
  put(R(15), 6, 'CONSTRUCTOR', YEL);
  put(R(17), 64, 'SCREWS', YEL);
  card(R(6), 30, R(12), 57, WHT);
  put(R(6), 30, ' RECIPE CARD: SCREW        ', BLK, LMG);
  put(R(7), 31, 'IN   1 Iron Rod    10/min', BLK);
  put(R(8), 31, 'OUT  4 Screw       40/min', BLK);
  put(R(9), 31, 'VIA  Constructor', BLK);
  put(R(10), 31, '     6 s cycle · 4 MW', BLU);
  caption(R(21), 2, ['140 ITEMS. 211 RECIPES, 88 OF THEM ALTERNATES. ONE BOX.', 'IT IS FULL OF SCREWS. IT WAS ALWAYS FULL OF SCREWS.']);
}

// ---- Panel 3: BUILDINGS, on cyan ------------------------------------------------------------------
{
  const r0 = 89, R = (r) => r0 + r;
  rect(0, Y(r0), W, Y(r0 + 23), CYN);
  // A miner (my own design): a tower with a window and a chimney, and a drill into the ground.
  const miner = (cx, w, h) => {
    const top = 264 - h;
    rect(cx - w / 2 + 8, 256, cx - w / 2 + 20, 288, BLK); rect(cx + w / 2 - 20, 256, cx + w / 2 - 8, 288, BLK);
    toon([[poly([[cx - 22, 256], [cx + 22, 256], [cx, 300 + h / 8]]), steelTo(cx)]]);
    smoke(cx + w / 2 - 22, top - 34);
    toon([[rbox(cx + w / 2 - 28, top - 24, cx + w / 2 - 8, top + 8, 3), DGR]]);
    toon([[rbox(cx - w / 2, top, cx + w / 2, 260, 6), steelTo(cx + w / 5)]]);
    rect(cx - w / 2 + 8, top + 8, cx + w / 2 - 8, top + 16, YEL);
    if (h > 80) { toon([[circle(cx - w / 5, top + 44, 13), LCY]], 5); rect(cx - w / 5 - 6, top + 36, cx - w / 5 - 2, top + 44, WHT); }
    if (h > 120) { toon([[rbox(cx, top + 32, cx + w / 2 - 12, top + 56, 3), DGR]], 5); for (let x = cx + 8; x < cx + w / 2 - 20; x += 16) rect(x, top + 40, x + 8, top + 48, LGN); }
    rect(cx - 24, 224, cx + 24, 240, BLK);
  };
  const arrow = (x, y) => toon([[poly([[x, y - 8], [x + 20, y - 8], [x + 20, y - 20], [x + 44, y], [x + 20, y + 20], [x + 20, y + 8], [x, y + 8]]), YEL]]);
  at(0, Y(r0), () => {
    rect(0, 284, W, 368, BLK); rect(0, 288, W, 368, BRN);                           // the ground
    for (const x of [136, 312, 504, 584]) { rect(x, 296, x + 16, 304, YEL); rect(x + 8, 304, x + 24, 312, BLK); }   // ore, lying about
    miner(72, 80, 72); miner(224, 104, 104); miner(408, 136, 128);
    arrow(124, 216); arrow(288, 216);
  });
  rect(0, Y(r0 + 23), W, Y(r0 + 24), BLK);
  strip(r0, 'TAB 3 OF 3', BLK, LCY, 'EVERY BUILDING AND WHAT IT MAKES, GROUPED BY TIER.');
  heading(R(1), 2, 'BUILDINGS', WHT);
  put(R(1), 48, 'MK-BY-MK UPGRADE PATHS: MINERS,', YEL);
  put(R(2), 48, 'CONVEYORS, PIPELINES, STORAGE.', YEL);
  put(R(14), 7, 'MK.1', YEL); put(R(14), 26, 'MK.2', YEL); put(R(14), 49, 'MK.3', YEL);
  card(R(5), 62, R(16), 79, WHT);
  put(R(5), 62, ' 477 BUILDINGS   ', BLK, LCY);
  [['9', 'production'], ['333', 'structure'], ['59', 'logistics'], ['26', 'decor'], ['15', 'power'], ['14', 'transit'], ['7', 'special'], ['7', 'storage'], ['7', 'extraction']]
    .forEach(([n, what], i) => { put(R(6 + i), 66 - n.length, n, BLU); put(R(6 + i), 67, what, BLK); });
  caption(R(20), 2, ['333 OF THE 477 ARE STRUCTURE PIECES. THE TIDY PEOPLE USE THEM ALL.', 'THE SPAGHETTI PEOPLE USE FOUR, AND CLIP THE REST THROUGH A WALL.']);
}

// ---- Panel 4: RUN IT, on green ----------------------------------------------------------------------
{
  const r0 = 113, R = (r) => r0 + r, H = 19;
  rect(0, Y(r0), W, Y(r0 + H), GRN);
  at(288, Y(r0) - 80, () => gary({ limbs: false }));
  overlay('bk2', () => { at(288, Y(r0) - 80, garyBlink); at(0, Y(r0), () => { rect(0, 280, W, 288, BLK); rect(0, 288, W, 304, BRN); }); });                                   // Gary, behind the desk
  at(0, Y(r0), () => {
    // a monitor on the desk
    toon([[rbox(176, 244, 264, 276, 2), DGR]]);
    toon([[rbox(128, 268, 312, 284, 5), LGR]]);
    toon([[rbox(16, 72, 424, 248, 10), ramp(LGR, DGR, rbox(-99, -99, 999, 232), 10)]]);
    rect(X(4) - 4, Y(6) - 8, X(51) + 4, Y(14) + 8, BLK);
    rect(0, 280, W, 288, BLK); rect(0, 288, W, 304, BRN);                           // the desk
  });
  rect(0, Y(r0 + H), W, Y(ROWS), BLK);
  strip(r0, 'RUN IT', BLK, LGN, 'PYTHON 3.10+, FROM THE REPO ROOT. TWO COMMANDS AND IT IS UP.');
  heading(R(1), 2, 'RUN IT', YEL);
  put(R(7), 5, '> python -m pip install -r requirements.txt', LGN);
  put(R(8), 5, '> python -m streamlit run app/app.py', LGN);
  put(R(10), 5, '  up at http://localhost:8501', LGR);
  put(R(12), 5, '>', LGN); put(R(12), 7, '_', LGN, undefined, 'cu');
  balloon(53, R(1) + 0.5, 78, R(6), [[X(59), Y(R(6)) - 4], [X(64), Y(R(6)) - 4], [X(63), Y(R(6)) + 20]]);
  ['OR INSTALL NOTHING.', 'IT RUNS IN A BROWSER:', 'lukexyz.github.io/', 'ULTRA-SATISFACTORY'].forEach((l, i) => put(R(2) + i, centre(l, 53, 78), l, i > 1 ? BLU : BLK));

  // ---- The small print, on black --------------------------------------------------------------
  const E = r0 + H;
  const mid = (r, str, fg) => put(r, centre(str), str, fg);
  mid(E + 1, 'UNOFFICIAL FAN PROJECT. NOT AFFILIATED WITH COFFEE STAIN STUDIOS.', WHT);
  mid(E + 2, 'DATA: greeny/SatisfactoryTools · IMAGES: Satisfactory Wiki (CC BY-NC-SA 4.0)', LGR);
  mid(E + 3, 'CODE: APACHE 2.0 · PROTECTION: NONE · DRAWN IN 16 COLOURS BY pj/SWF', LGR);
  mid(E + 5, `SAUCE00 · ULTRA-SATISFACTORY · pallet jack · SWARF · 80x${ROWS} · iCE colors`, DGR);
}

// ---------------------------------------------------------------------------------------------
// Legalise: every cell becomes one character with one foreground and one background colour.
// ---------------------------------------------------------------------------------------------
const flat = new Uint8Array(16);
const pick = (idx) => {                        // best single colour for a set of samples
  let best = 0, bestCost = Infinity;
  const seen = new Set();
  for (const i of idx) {
    const col = flat[i];
    if (seen.has(col)) continue;
    seen.add(col);
    let cost = 0;
    for (const k of idx) if (flat[k] !== col) cost += flat[k] === BLK ? 1.5 : 1;     // losing outline costs more
    if (cost < bestCost) { bestCost = cost; best = col; }
  }
  return [best, bestCost];
};
const ALL = Array.from({ length: 16 }, (_, i) => i);
const TOP = ALL.slice(0, 8), BOT = ALL.slice(8), LEFT = ALL.filter((i) => i % 4 < 2), RIGHT = ALL.filter((i) => i % 4 >= 2);
function legalCell(r, c) {
  let pure = true, tSum = 0;
  const k0 = r * 4 * NX + c * 4;
  for (let j = 0; j < 4; j++) {
    for (let i = 0; i < 4; i++) {
      const k = k0 + j * NX + i;
      flat[j * 4 + i] = sB[k] === NONE || sT[k] < 0.5 ? sA[k] : sB[k];
      if (sA[k] !== sA[k0] || sB[k] !== sB[k0]) pure = false;
      tSum += sT[k];
    }
  }
  if (pure && sB[k0] !== NONE) {               // all one ramp: a flat colour or a shade character
    const t = tSum / 16;
    return t < 0.14 ? { k: 'F', a: sA[k0] } : t > 0.86 ? { k: 'F', a: sB[k0] }
      : { k: 'S', fg: sA[k0], bg: sB[k0], lv: t < 0.38 ? 3 : t < 0.62 ? 2 : 1 };
  }
  const [fa, fc] = pick(ALL);                  // full block, upper/lower halves, or left/right halves
  const [ta, tc] = pick(TOP), [tb, tc2] = pick(BOT);
  const [la, lc] = pick(LEFT), [lb, lc2] = pick(RIGHT);
  const costT = tc + tc2 + 0.01, costL = lc + lc2 + 0.02;
  if (fc <= costT && fc <= costL) return { k: 'F', a: fa };
  if (costT <= costL) return ta === tb ? { k: 'F', a: ta } : { k: 'T', a: ta, b: tb };
  return la === lb ? { k: 'F', a: la } : { k: 'L', a: la, b: lb };
}
const cells = new Array(ROWS * COLS);
for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) cells[r * COLS + c] = legalCell(r, c);

// Overlays: repaint a little, legalise again, keep the cells that changed, put the canvas back.
const sameCell = (a, b) => a.k === b.k && a.a === b.a && a.b === b.b && a.fg === b.fg && a.bg === b.bg && a.lv === b.lv;
const overlayCells = overlays.map(({ cls, fn }) => {
  const keep = [sA.slice(), sB.slice(), sT.slice()];
  dirty = [NX, NY, -1, -1];
  fn();
  const [i0, j0, i1, j1] = dirty;
  dirty = null;
  const list = [];
  for (let r = j0 >> 2; r <= j1 >> 2; r++) {
    for (let c = i0 >> 2; c <= i1 >> 2; c++) {
      const cell = legalCell(r, c);
      if (!sameCell(cell, cells[r * COLS + c])) list.push({ r, c, cell });
    }
  }
  sA.set(keep[0]); sB.set(keep[1]); sT.set(keep[2]);
  return { cls, list };
});
const BAKE = (argOf('bake') || '').split(',');   // debug: bake these overlays into the PNG
for (const o of overlayCells) if (BAKE.includes(o.cls)) for (const { r, c, cell } of o.list) cells[r * COLS + c] = cell;

// Text goes on top: the cell under a letter must be one flat colour (that is its background).
for (const t of texts.values()) {
  const cell = cells[t.r * COLS + t.c];
  if (cell.k !== 'F') throw new Error(`text "${t.ch}" at row ${t.r}, col ${t.c} sits on a cell that is not a flat colour`);
  cell.ch = t.ch; cell.fg = t.fg; cell.cls = t.cls;
}

// ---------------------------------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------------------------------
// The four quadrant colours of a cell (shade cells give their background; the dots go on top).
const quads = (cell) => (cell.k === 'F' ? [cell.a, cell.a, cell.a, cell.a] : cell.k === 'T' ? [cell.a, cell.a, cell.b, cell.b]
  : cell.k === 'L' ? [cell.a, cell.b, cell.a, cell.b] : [cell.bg, cell.bg, cell.bg, cell.bg]);
// Greedy merge of a boolean grid into rectangles, written as one relative path.
function mergePath(w, h, test, sx = 1, sy = 1, ox = 0, oy = 0) {
  const rects = [];
  let open = [];
  for (let y = 0; y < h; y++) {
    const next = [];
    for (let x = 0; x < w;) {
      if (!test(x, y)) { x++; continue; }
      const x0 = x;
      while (x < w && test(x, y)) x++;
      const o = open.find((q) => q.x === x0 && q.w === x - x0);
      if (o) { o.h++; next.push(o); } else { const q = { x: x0, w: x - x0, y, h: 1 }; rects.push(q); next.push(q); }
    }
    open = next;
  }
  let d = '', px = 0, py = 0;
  for (const q of rects) {
    const x = ox + q.x * sx, y = oy + q.y * sy;
    d += `m${x - px} ${y - py}h${q.w * sx}v${q.h * sy}h${-q.w * sx}z`;
    px = x; py = y;
  }
  return d.replace(/ -/g, '-');
}
// Shade characters as dot lattices (the VGA shade glyphs, with the dots doubled so they survive
// being scaled to README width). lv 1 = light (25% foreground), 2 = medium, 3 = dark (75%).
const DOT = 2;
const shadeOn = (lv, x, y) => {               // is pixel (x, y) foreground at this shade level?
  const u = Math.floor(x / DOT), v = Math.floor(y / DOT);
  if (lv === 2) return (u + v) % 2 === 0;
  const dot = v % 2 === 0 ? u % 4 === 2 : u % 4 === 0;
  return lv === 1 ? dot : !dot;
};
const patterns = new Map();                   // id -> <pattern>
function shadeFill(lv, colour) {
  const id = `s${lv}${colour.toString(16)}`;
  if (!patterns.has(id)) {
    const tw = lv === 2 ? 2 * DOT : 4 * DOT, th = 2 * DOT;
    const d = mergePath(tw / DOT, th / DOT, (x, y) => shadeOn(lv, x * DOT, y * DOT), DOT, DOT);
    patterns.set(id, `<pattern id="${id}" width="${tw}" height="${th}" patternUnits="userSpaceOnUse"><path fill="${PAL[colour]}" d="${d}"/></pattern>`);
  }
  return `url(#${id})`;
}
// A set of cells as SVG: merged rectangles, one path per colour, then the shade dots.
// `list` is [{ r, c, cell }]; black is skipped when the backdrop is already black.
function cellsSvg(list, skipBlack) {
  if (!list.length) return '';
  let r0 = Infinity, r1 = -1, c0 = Infinity, c1 = -1;
  for (const o of list) { if (o.r < r0) r0 = o.r; if (o.r > r1) r1 = o.r; if (o.c < c0) c0 = o.c; if (o.c > c1) c1 = o.c; }
  const cw = c1 - c0 + 1, w = cw * 2, h = (r1 - r0 + 1) * 2;
  const q = new Uint8Array(w * h).fill(NONE);
  const shades = new Map();
  for (const { r, c, cell } of list) {
    const v = quads(cell), k = (r - r0) * 2 * w + (c - c0) * 2;
    q[k] = v[0]; q[k + 1] = v[1]; q[k + w] = v[2]; q[k + w + 1] = v[3];
    if (cell.k === 'S') {
      const key = `${cell.lv}-${cell.fg}`;
      if (!shades.has(key)) shades.set(key, new Set());
      shades.get(key).add((r - r0) * cw + (c - c0));
    }
  }
  let blocks = '';
  for (let col = skipBlack ? 1 : 0; col < 16; col++) {
    const d = mergePath(w, h, (x, y) => q[y * w + x] === col, 1, 1, c0 * 2, r0 * 2);
    if (d) blocks += `<path fill="${PAL[col]}" d="${d}"/>`;
  }
  let out = `<g transform="scale(4 8)" shape-rendering="crispEdges">${blocks}</g>`;
  let sh = '';
  for (const [key, set] of [...shades].sort()) {
    const [lv, fg] = key.split('-').map(Number);
    sh += `<path fill="${shadeFill(lv, fg)}" d="${mergePath(cw, r1 - r0 + 1, (x, y) => set.has(y * cw + x), CW, CH, c0 * CW, r0 * CH)}"/>`;
  }
  if (sh) out += `<g shape-rendering="crispEdges">${sh}</g>`;
  return out;
}

function pieceSvg() {
  // the picture, then the overlays (blinks and such), then the moving sprites, then the text
  let body = cellsSvg(cells.map((cell, i) => ({ r: Math.floor(i / COLS), c: i % COLS, cell })), true);
  for (const o of overlayCells) body += `<g class="${o.cls}">${cellsSvg(o.list, false)}</g>`;
  let clips = '';
  sprites.forEach((s, n) => {
    const byCol = new Map();
    for (const [x, y, w, h, col] of s.rects) byCol.set(col, (byCol.get(col) || '') + `M${x} ${y}h${w}v${h}h${-w}z`);
    clips += `<clipPath id="c${n}"><rect x="${s.clip[0]}" y="${s.clip[1]}" width="${s.clip[2] - s.clip[0]}" height="${s.clip[3] - s.clip[1]}"/></clipPath>`;
    body += `<g clip-path="url(#c${n})"><g class="${s.cls}" shape-rendering="crispEdges">${[...byCol].map(([col, d]) => `<path fill="${PAL[col]}" d="${d}"/>`).join('')}</g></g>`;
  });
  const groups = new Map();
  cells.forEach((cell, i) => {
    if (!cell.ch) return;
    const key = `${String(cell.fg).padStart(2, '0')}|${cell.cls || ''}`;
    if (!groups.has(key)) groups.set(key, new Map());
    const rows = groups.get(key), r = Math.floor(i / COLS);
    rows.set(r, (rows.get(r) || '') + `<use href="#${gid(cell.ch)}" x="${(i % COLS) * CW}"/>`);
  });
  for (const [key, rows] of [...groups].sort()) {
    const [fg, cls] = key.split('|');
    body += `<g fill="${PAL[+fg]}"${cls ? ` class="${cls}"` : ''}>`;
    for (const [r, u] of rows) body += `<g transform="translate(0 ${r * CH})">${u}</g>`;
    body += '</g>';
  }
  return { body, defs: [...patterns.values()].join('') + clips };
}
function glyphDefs() {
  let out = '';
  for (const [ch, id] of glyphIds) out += `<path id="${id}" d="${glyphPath(FONT.get(ch))}"/>`;
  return out;
}

// ---- debug PNG (1:1) --------------------------------------------------------------------------
function writePng(file, r0, r1) {
  const w = W, h = (r1 - r0) * CH, rgb = Buffer.alloc(w * h * 3);
  const rgbOf = (i) => [parseInt(PAL[i].slice(1, 3), 16), parseInt(PAL[i].slice(3, 5), 16), parseInt(PAL[i].slice(5, 7), 16)];
  for (let r = r0; r < r1; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = cells[r * COLS + c];
      const g = cell.ch ? FONT.get(cell.ch) : null;
      for (let y = 0; y < CH; y++) {
        for (let x = 0; x < CW; x++) {
          let col;
          if (cell.k === 'F') col = cell.a;
          else if (cell.k === 'T') col = y < 8 ? cell.a : cell.b;
          else if (cell.k === 'L') col = x < 4 ? cell.a : cell.b;
          else col = shadeOn(cell.lv, c * CW + x, r * CH + y) ? cell.fg : cell.bg;
          if (g && (g[y] >> (7 - x)) & 1) col = cell.fg;
          const o = (((r - r0) * CH + y) * w + c * CW + x) * 3;
          const [R, G, B] = rgbOf(col);
          rgb[o] = R; rgb[o + 1] = G; rgb[o + 2] = B;
        }
      }
    }
  }
  const raw = Buffer.alloc((w * 3 + 1) * h);
  for (let y = 0; y < h; y++) rgb.copy(raw, y * (w * 3 + 1) + 1, y * w * 3, (y + 1) * w * 3);
  const crcT = new Int32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; return c; });
  const crc = (buf) => { let c = -1; for (const b of buf) c = crcT[(c ^ b) & 255] ^ (c >>> 8); return (c ^ -1) >>> 0; };
  const chunk = (type, data) => {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const td = Buffer.concat([Buffer.from(type), data]);
    const cr = Buffer.alloc(4); cr.writeUInt32BE(crc(td));
    return Buffer.concat([len, td, cr]);
  };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2;
  fs.writeFileSync(file, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]));
}
if (argOf('png')) {
  const [a, b] = (argOf('rows') || `0-${ROWS}`).split('-').map(Number);
  writePng(argOf('png'), a, Math.min(b, ROWS));
  console.log(`png ${argOf('png')} rows ${a}-${b}`);
}

// ---------------------------------------------------------------------------------------------
// The README banner: a 30-row window that scrolls down the piece at a steady pace, pausing on
// the title, over a one-line status bar of the kind a DOS art viewer would show. The piece is
// drawn twice, one above the other, so the scroll wraps without a jump.
// ---------------------------------------------------------------------------------------------
const piece = pieceSvg();
const PIECE_H = ROWS * CH, WIN_H = WIN * CH;
const LOOP = 60;                             // one lap takes a minute, so every rate in the comic is per lap
const HOLD = 6;                              // seconds on the title before the scroll starts
// (the scroll then covers the piece in the remaining 54 s: about 41 px, or 2.6 text rows, a second)
const holdPct = +(HOLD / LOOP * 100).toFixed(3);
// The scroll moves in steps of 0.8 px, which is exactly one screen pixel at the README's 830 px
// width (every cell is scaled by 1.25). The whole picture then lands on whole pixels in every
// frame, so the blocks and the letters never shimmer against each other while it moves.
const SCALE = 1.25, SCROLL_STEPS = PIECE_H * SCALE;
if (!Number.isInteger(SCROLL_STEPS)) throw new Error('the piece must be a whole number of screen pixels tall');

// status bar: file name, SAUCE-style title and author, size, and a scroll gauge
const BAR = [[' ULTRASAT.ANS ', BLK], ['│', DGR], [' ULTRA-SATISFACTORY ', BLU], ['by pallet jack/SWARF ', BLK], ['│', DGR], [` 80x${ROWS} iCE `, BLK], ['│', DGR], [' ', BLK]];
const barLen = BAR.reduce((n, [t]) => n + [...t].length, 0);
const TRACK = COLS - barLen - 1;
if (TRACK < 4) throw new Error('status bar too long');
let barSvg = `<rect y="${WIN_H}" width="${W}" height="${CH}" fill="${PAL[LGR]}"/>`;
{
  let c = 0;
  for (const [t, fg] of BAR) {
    let u = '';
    for (const ch of t) { if (ch !== ' ') u += `<use href="#${gid(ch)}" x="${c * CW}"/>`; c++; }
    if (u) barSvg += `<g fill="${PAL[fg]}" transform="translate(0 ${WIN_H})">${u}</g>`;
  }
  let tr = '';
  for (let i = 0; i < TRACK; i++) tr += `<use href="#${gid('░')}" x="${(c + i) * CW}"/>`;
  barSvg += `<g fill="${PAL[DGR]}" transform="translate(0 ${WIN_H})">${tr}</g>`;
  barSvg += `<rect class="th" x="${c * CW}" y="${WIN_H}" width="${CW}" height="${CH}" fill="${PAL[BLU]}"/>`;
}

const css = `.sc{animation:sc ${+LOOP.toFixed(3)}s linear infinite}`
  + `@keyframes sc{0%{transform:translateY(0)}${holdPct}%{transform:translateY(0);animation-timing-function:steps(${SCROLL_STEPS},end)}100%{transform:translateY(-${PIECE_H}px)}}`
  + `.th{animation:th ${+LOOP.toFixed(3)}s linear infinite}`
  + `@keyframes th{0%{transform:translateX(0)}${holdPct}%{transform:translateX(0);animation-timing-function:steps(${TRACK},end)}100%{transform:translateX(${TRACK * CW}px)}}`
  // Gary blinks a few times while he is on screen (both Garys); eyes are open at the loop point
  + '.bk,.bk2{opacity:0}'
  + `.bk{animation:bk ${LOOP}s steps(1,end) infinite}@keyframes bk{0%{opacity:0}4%{opacity:1}4.3%{opacity:0}8.7%{opacity:1}9%{opacity:0}15%{opacity:1}15.3%{opacity:0}20.8%{opacity:1}21.1%{opacity:0}}`
  + `.bk2{animation:bk2 ${LOOP}s steps(1,end) infinite}@keyframes bk2{0%{opacity:0}77.5%{opacity:1}77.8%{opacity:0}82.5%{opacity:1}82.8%{opacity:0}87.5%{opacity:1}87.8%{opacity:0}}`
  // sparkles twinkle in two alternating sets; the prompt cursor blinks
  + '.t1{animation:tw 1.5s steps(1,end) infinite}.t2{animation:tw 1.5s steps(1,end) -.75s infinite}.cu{animation:tw 1s steps(1,end) infinite}@keyframes tw{0%{opacity:1}50%{opacity:0}}'
  // the ITEMS belt: dashes and screws step one cell at a time; TINK! shows as each screw lands
  + '.bt{animation:bt .75s steps(4,end) infinite}@keyframes bt{to{transform:translateX(32px)}}'
  + '.sw{animation:sw 1.5s steps(8,end) infinite}@keyframes sw{to{transform:translateX(64px)}}'
  + '.tk{animation:tk 1.5s steps(1,end) infinite}@keyframes tk{0%{opacity:1}30%{opacity:0}}'
  + '@media (prefers-reduced-motion:reduce){.sc,.th,.bk,.bk2,.t1,.t2,.cu,.bt,.sw,.tk{animation:none}}';

const TITLE = 'ULTRA-SATISFACTORY: an illustrated ANSI comic, scrolling';
const VBW = W + PAD * 2, VBH = WIN_H + CH + PAD * 2;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${VBW * SCALE}" height="${VBH * SCALE}" viewBox="0 0 ${VBW} ${VBH}" role="img" aria-label="${TITLE}">`
  + `<title>${TITLE}</title><style>${css}</style>`
  + `<defs>${piece.defs}${glyphDefs()}<clipPath id="w"><rect width="${W}" height="${WIN_H}"/></clipPath></defs>`
  + `<rect x=".5" y=".5" width="${VBW - 1}" height="${VBH - 1}" rx="7" fill="#000" stroke="#333"/>`
  + `<g transform="translate(${PAD} ${PAD})"><g clip-path="url(#w)"><g class="sc"><g id="p">${piece.body}</g><use href="#p" y="${PIECE_H}"/></g></g>${barSvg}</g></svg>\n`;
fs.writeFileSync(OUT, svg);
console.log(`${path.relative(process.cwd(), OUT)}  ${(svg.length / 1024).toFixed(1)} KB  piece ${COLS}x${ROWS}  loop ${LOOP.toFixed(1)} s`);

if (argOf('sheet')) {
  fs.writeFileSync(argOf('sheet'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${PIECE_H}"><defs>${piece.defs}${glyphDefs()}</defs><rect width="${W}" height="${PIECE_H}"/>${piece.body}</svg>`);
}
