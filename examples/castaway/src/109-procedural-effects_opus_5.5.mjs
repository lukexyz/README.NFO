#!/usr/bin/env node
// 109-procedural-effects_opus_5.5: CASTAWAY as a four-part 1993 VGA demo.
//
// Style: full-frame procedural effects of the early-90s PC demoscene
// (catalogue entry demo-03): the voxel landscape, the fire, shade bobs and the
// fractal zoom, each one filling a 320-pixel-wide screen that was computed
// pixel by pixel. The named productions in the catalogue are credited
// references only; every pixel, palette, letter and word here was made for
// this file, for this project.
//
//   node examples/castaway/src/109-procedural-effects_opus_5.5.mjs
//   node examples/castaway/src/109-procedural-effects_opus_5.5.mjs --debug=some/dir
//   node examples/castaway/src/109-procedural-effects_opus_5.5.mjs --ascii
//
// Regenerates ../assets/109-procedural-effects_opus_5.5.svg. Plain Node, no
// dependencies, deterministic: all randomness is hashed from seed 1992 (the
// video's default seed), never the clock. --debug also writes every embedded
// image as a PNG (scaled up 4x) into a folder, for looking at; --ascii prints
// the hand-pixelled logo letters as text.
//
// The banner is one 320 x 120 screen of square "VGA" pixels, drawn with
// nearest-neighbour scaling so every pixel stays a chunky block. It loops every
// 30 seconds (ten bars of the theme at 80 BPM), cutting hard between parts on
// bar lines:
//
//   PART 1  0-12 s  VOXEL ISLAND. A height map and a colour map, rendered
//           here column by column, front to back, with shading and haze baked
//           in (the Comanche-era algorithm). Script-free SVG cannot raycast,
//           so the camera strafes instead of flying: every island is its own
//           layer sliding at the speed its distance gives it, and the sea is
//           66 one-pixel scanlines, each sliding at its own speed, which is
//           exactly the parallax of a flat plane. The CASTAWAY logo hangs in
//           the sky. She stands on the near island and nods on every beat.
//   PART 2 12-18 s  FIRE BY FRICTION. The classic fire, at half resolution,
//           through a 37-step black-red-yellow-white palette. Inside the SVG
//           it is a heat map multiplied by two seamless noise tiles that
//           scroll up in whole-cell steps, then pushed through a palette
//           lookup (feComponentTransfer, discrete): the 256-colour trick. The
//           name stands in the flames as charred firewood.
//   PART 3 18-24 s  SHADE BOBS. A soft blob jogs a Lissajous path and every
//           pass brightens what it crosses, climbing a coral palette ramp. No
//           frame feedback in SVG, so each step is a stamp that appears on
//           time and stays; the overlaps add up and the same palette lookup
//           bands them. The name is cut out of the field.
//   PART 4 24-30 s  FRACTAL COASTLINE. An endless zoom into a Koch island:
//           nested snowflakes, each 1/sqrt(3) of the last and turned 30
//           degrees, in eight cycling coastal bands. Zooming by sqrt(3) and
//           turning 30 degrees maps the picture onto itself shifted by one
//           band, so eight steps land exactly on the first frame.
//
// prefers-reduced-motion: part 1 holds its first frame (logo, island, her)
// and the other parts never show.

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '109-procedural-effects_opus_5.5';
const argv = process.argv.slice(2);
const opt = (k, d = null) => {
  const a = argv.find((s) => s.startsWith(`--${k}=`));
  return a ? a.slice(k.length + 3) : d;
};
const OUT = path.resolve(opt('out', path.join(HERE, '..', 'assets', `${SLUG}.svg`)));
const DEBUG = opt('debug');

// ------------------------------------------------------------------ screen and clock
const W = 320, H = 120;
const LOOP = 30;            // ten bars of 3 s
const BEAT = 0.75;          // 80 BPM
const PART = [[0, 12], [12, 18], [18, 24], [24, 30]];
const SEED = 1992;

// ------------------------------------------------------------------ small maths
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
const mod = (a, n) => ((a % n) + n) % n;
const f2 = (v) => (Math.round(v * 100) / 100).toString();
const f3 = (v) => (Math.round(v * 1000) / 1000).toString();
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a, b, t) => [0, 1, 2].map((k) => lerp(a[k], b[k], t));
const rgbHex = (c) => '#' + c.map((v) => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0')).join('');
function ramp(stops, t) { // stops: [[pos, [r,g,b]], ...]
  t = clamp(t);
  for (let i = 1; i < stops.length; i++) {
    if (t <= stops[i][0]) {
      const [p0, c0] = stops[i - 1], [p1, c1] = stops[i];
      return mix(c0, c1, (t - p0) / (p1 - p0 || 1));
    }
  }
  return stops[stops.length - 1][1];
}
// 4x4 ordered dither threshold in [0,1)
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);
const bayer = (x, y) => BAYER[(y & 3) * 4 + (x & 3)];

// ------------------------------------------------------------------ hashed noise
function hash2(i, j, s) {
  let h = (Math.imul(i, 374761393) + Math.imul(j, 668265263) + Math.imul(s, 1442695041)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
// value noise; px/py > 0 make it periodic (in lattice cells)
function vnoise(x, y, s, px = 0, py = 0) {
  const xi = Math.floor(x), yi = Math.floor(y);
  let fx = x - xi, fy = y - yi;
  fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy);
  const w = (i, j) => hash2(px ? mod(i, px) : i, py ? mod(j, py) : j, s);
  return lerp(lerp(w(xi, yi), w(xi + 1, yi), fx), lerp(w(xi, yi + 1), w(xi + 1, yi + 1), fx), fy);
}
function fbm(x, y, s, oct = 4, px = 0, py = 0) {
  let a = 0.5, sum = 0, norm = 0;
  for (let o = 0; o < oct; o++) {
    sum += a * vnoise(x, y, s + o * 101, px, py);
    norm += a; x *= 2; y *= 2; px *= 2; py *= 2; a *= 0.5;
  }
  return sum / norm;
}

// ------------------------------------------------------------------ RGBA canvas
class Img {
  constructor(w, h) { this.w = w; this.h = h; this.d = new Uint8ClampedArray(w * h * 4); }
  in(x, y) { return x >= 0 && y >= 0 && x < this.w && y < this.h; }
  set(x, y, c, a = 255) {
    x = Math.round(x); y = Math.round(y);
    if (!this.in(x, y)) return;
    const i = (y * this.w + x) * 4;
    this.d[i] = c[0]; this.d[i + 1] = c[1]; this.d[i + 2] = c[2]; this.d[i + 3] = a;
  }
  get(x, y) {
    if (!this.in(x, y)) return null;
    const i = (y * this.w + x) * 4;
    return this.d[i + 3] ? [this.d[i], this.d[i + 1], this.d[i + 2]] : null;
  }
  alpha(x, y) { return this.in(x, y) ? this.d[(y * this.w + x) * 4 + 3] : 0; }
  // crop to the opaque bounding box; returns {img, x, y}
  crop() {
    let x0 = this.w, y0 = this.h, x1 = -1, y1 = -1;
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) {
      if (this.d[(y * this.w + x) * 4 + 3]) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    }
    if (x1 < 0) return { img: new Img(1, 1), x: 0, y: 0 };
    const o = new Img(x1 - x0 + 1, y1 - y0 + 1);
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const i = (y * this.w + x) * 4, j = ((y - y0) * o.w + (x - x0)) * 4;
      for (let k = 0; k < 4; k++) o.d[j + k] = this.d[i + k];
    }
    return { img: o, x: x0, y: y0 };
  }
}

// ------------------------------------------------------------------ PNG out
const CRC = new Uint32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = CRC[(c ^ b) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
// rows: array of Uint8Array (already packed); bpp: bytes per pixel for filtering
function pngRaw(w, h, depth, colorType, rows, bpp, extra = []) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = depth; ihdr[9] = colorType;
  const out = [];
  let prev = new Uint8Array(rows[0].length);
  for (const cur of rows) {
    let best = null, bestSum = Infinity;
    for (let f = 0; f < 5; f++) {
      const line = new Uint8Array(cur.length + 1);
      line[0] = f;
      let sum = 0;
      for (let i = 0; i < cur.length; i++) {
        const a = i >= bpp ? cur[i - bpp] : 0, b = prev[i], c = i >= bpp ? prev[i - bpp] : 0;
        let pred = 0;
        if (f === 1) pred = a;
        else if (f === 2) pred = b;
        else if (f === 3) pred = (a + b) >> 1;
        else if (f === 4) {
          const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
          pred = pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
        }
        const v = (cur[i] - pred) & 255;
        line[i + 1] = v;
        sum += v < 128 ? v : 256 - v;
      }
      if (sum < bestSum) { bestSum = sum; best = line; }
    }
    out.push(best);
    prev = cur;
  }
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr), ...extra,
    chunk('IDAT', zlib.deflateSync(Buffer.concat(out), { level: 9, memLevel: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}
// Any Img: palette PNG (1/2/4/8 bit) when it has <= 256 colours, else RGBA.
function pngOf(img) {
  const { w, h, d } = img;
  const keyAt = (i) => (d[i + 3] === 0 ? -1 : ((d[i] << 24) | (d[i + 1] << 16) | (d[i + 2] << 8) | d[i + 3]) >>> 0);
  const pal = new Map();
  for (let i = 0; i < d.length; i += 4) {
    const k = keyAt(i);
    if (!pal.has(k)) pal.set(k, pal.size);
    if (pal.size > 256) break;
  }
  if (pal.size <= 256) {
    // transparent and translucent entries first, so tRNS stays short
    const keys = [...pal.keys()].sort((a, b) => {
      const aa = a === -1 ? 0 : a & 255, ba = b === -1 ? 0 : b & 255;
      return (aa === 255) - (ba === 255) || 0;
    });
    const index = new Map(keys.map((k, i) => [k, i]));
    const n = keys.length;
    const depth = n <= 2 ? 1 : n <= 4 ? 2 : n <= 16 ? 4 : 8;
    const plte = Buffer.alloc(n * 3), trns = [];
    keys.forEach((k, i) => {
      if (k === -1) { trns.push(0); return; }
      plte[i * 3] = k >>> 24; plte[i * 3 + 1] = (k >>> 16) & 255; plte[i * 3 + 2] = (k >>> 8) & 255;
      if ((k & 255) !== 255) trns.push(k & 255);
    });
    const rows = [];
    const perByte = 8 / depth;
    for (let y = 0; y < h; y++) {
      const r = new Uint8Array(Math.ceil(w / perByte));
      for (let x = 0; x < w; x++) {
        const v = index.get(keyAt((y * w + x) * 4));
        const bi = Math.floor(x / perByte), sh = 8 - depth * (1 + (x % perByte));
        r[bi] |= v << sh;
      }
      rows.push(r);
    }
    const extra = [chunk('PLTE', plte)];
    if (trns.length) extra.push(chunk('tRNS', Buffer.from(trns)));
    return pngRaw(w, h, depth, 3, rows, 1, extra);
  }
  const rows = [];
  for (let y = 0; y < h; y++) rows.push(Uint8Array.from(d.subarray(y * w * 4, (y + 1) * w * 4)));
  return pngRaw(w, h, 8, 6, rows, 4);
}
const dataUri = (buf) => `data:image/png;base64,${buf.toString('base64')}`;
const debugImgs = [];
function emb(name, img) {
  const buf = pngOf(img);
  debugImgs.push([name, img]);
  sizes.push([name, buf.length]);
  return dataUri(buf);
}
const sizes = [];

// ------------------------------------------------------------------ masks to paths
// A mask (Uint8Array, w x h) as one path of rectangles: runs per row, then
// identical runs on consecutive rows merged downward.
function maskPath(mask, w, h, ox = 0, oy = 0, s = 1) {
  const open = new Map(); const rects = [];
  for (let y = 0; y <= h; y++) {
    const runs = [];
    if (y < h) {
      let x = 0;
      while (x < w) {
        if (!mask[y * w + x]) { x++; continue; }
        let e = x; while (e < w && mask[y * w + e]) e++;
        runs.push([x, e - x]); x = e;
      }
    }
    const next = new Map();
    for (const [x, len] of runs) {
      const k = `${x},${len}`;
      if (open.has(k)) { const r = open.get(k); r.h++; next.set(k, r); open.delete(k); }
      else { const r = { x, y, w: len, h: 1 }; rects.push(r); next.set(k, r); }
    }
    open.clear(); for (const [k, v] of next) open.set(k, v);
  }
  return rects.map((r) => `M${f2(ox + r.x * s)} ${f2(oy + r.y * s)}h${f2(r.w * s)}v${f2(r.h * s)}h${f2(-r.w * s)}z`).join('');
}

// ------------------------------------------------------------------ 5x7 font
// Drawn for this banner. '#' = lit. Advance 6.
const FONT = {
  A: '.###. #...# #...# ##### #...# #...# #...#', B: '####. #...# #...# ####. #...# #...# ####.',
  C: '.###. #...# #.... #.... #.... #...# .###.', D: '####. #...# #...# #...# #...# #...# ####.',
  E: '##### #.... #.... ####. #.... #.... #####', F: '##### #.... #.... ####. #.... #.... #....',
  G: '.###. #...# #.... #.### #...# #...# .###.', H: '#...# #...# #...# ##### #...# #...# #...#',
  I: '.###. ..#.. ..#.. ..#.. ..#.. ..#.. .###.', J: '....# ....# ....# ....# #...# #...# .###.',
  K: '#...# #..#. #.#.. ##... #.#.. #..#. #...#', L: '#.... #.... #.... #.... #.... #.... #####',
  M: '#...# ##.## #.#.# #.#.# #...# #...# #...#', N: '#...# ##..# #.#.# #..## #...# #...# #...#',
  O: '.###. #...# #...# #...# #...# #...# .###.', P: '####. #...# #...# ####. #.... #.... #....',
  Q: '.###. #...# #...# #...# #.#.# #..#. .##.#', R: '####. #...# #...# ####. #.#.. #..#. #...#',
  S: '.#### #.... #.... .###. ....# ....# ####.', T: '##### ..#.. ..#.. ..#.. ..#.. ..#.. ..#..',
  U: '#...# #...# #...# #...# #...# #...# .###.', V: '#...# #...# #...# #...# #...# .#.#. ..#..',
  W: '#...# #...# #...# #.#.# #.#.# #.#.# .#.#.', X: '#...# #...# .#.#. ..#.. .#.#. #...# #...#',
  Y: '#...# #...# .#.#. ..#.. ..#.. ..#.. ..#..', Z: '##### ....# ...#. ..#.. .#... #.... #####',
  0: '.###. #..## #.#.# #.#.# #.#.# ##..# .###.', 1: '..#.. .##.. ..#.. ..#.. ..#.. ..#.. .###.',
  2: '.###. #...# ....# ..##. .#... #.... #####', 3: '####. ....# ....# .###. ....# ....# ####.',
  4: '...#. ..##. .#.#. #..#. ##### ...#. ...#.', 5: '##### #.... ####. ....# ....# #...# .###.',
  6: '.###. #.... #.... ####. #...# #...# .###.', 7: '##### ....# ...#. ..#.. .#... .#... .#...',
  8: '.###. #...# #...# .###. #...# #...# .###.', 9: '.###. #...# #...# .#### ....# ....# .###.',
  '.': '..... ..... ..... ..... ..... ..... ..#..', ',': '..... ..... ..... ..... ..... ..#.. .#...',
  ':': '..... ..#.. ..... ..... ..... ..#.. .....', '-': '..... ..... ..... .###. ..... ..... .....',
  '/': '....# ....# ...#. ..#.. .#... #.... #....', "'": '..#.. ..#.. .#... ..... ..... ..... .....',
  '!': '..#.. ..#.. ..#.. ..#.. ..#.. ..... ..#..', '?': '.###. #...# ....# ..##. ..#.. ..... ..#..',
  '(': '...#. ..#.. .#... .#... .#... ..#.. ...#.', ')': '.#... ..#.. ...#. ...#. ...#. ..#.. .#...',
  '+': '..... ..#.. ..#.. ##### ..#.. ..#.. .....', '=': '..... ..... ##### ..... ##### ..... .....',
  '>': '.#... ..#.. ...#. ....# ...#. ..#.. .#...', '*': '..... #.#.# .###. ##### .###. #.#.# .....',
  ' ': '..... ..... ..... ..... ..... ..... .....',
};
const ADV = 6;
const textW = (s) => s.length * ADV - 1;
// Corner captions keep the same clear margin from every edge of the screen:
// CAP_L / CAP_R are the left and right letter edges, CAP_T / CAP_B the top
// rows of a line at the top and at the bottom (glyphs are 7 rows tall).
const INSET = 7;
const CAP_L = INSET, CAP_R = W - INSET, CAP_T = INSET, CAP_B = H - INSET - 7;
// A line of text as a mask with a 1-pixel border all round (for the outline).
function textMask(str) {
  const w = textW(str) + 2, h = 9, m = new Uint8Array(w * h);
  [...str].forEach((ch, i) => {
    const g = FONT[ch];
    if (!g) throw new Error(`no glyph for "${ch}"`);
    g.split(' ').forEach((row, r) => { for (let c = 0; c < 5; c++) if (row[c] === '#') m[(r + 1) * w + 1 + i * ADV + c] = 1; });
  });
  return { m, w, h };
}
function dilate(m, w, h) {
  const o = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (!m[y * w + x]) continue;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const X = x + dx, Y = y + dy;
      if (X >= 0 && Y >= 0 && X < w && Y < h) o[Y * w + X] = 1;
    }
  }
  return o;
}
// Outlined text: a dark 8-way outline under white (or coloured) letters.
// x, y = top-left of the letters themselves; align 'l' | 'c' | 'r'.
// Outlined text: every glyph is one symbol (a dark 8-way outline under the
// letter, which takes its colour from the line), placed with <use>.
// x, y = top-left of the letters themselves; align 'l' | 'c' | 'r'.
const EDGE = '#0a1430';
const usedGlyphs = new Set();
function glyphDefs() {
  return [...usedGlyphs].sort().map((ch) => {
    const { m, w, h } = textMask(ch);
    return `<g id="c${ch.charCodeAt(0)}"><path fill="${EDGE}" d="${maskPath(dilate(m, w, h), w, h, -1, -1)}"/><path d="${maskPath(m, w, h, -1, -1)}"/></g>`;
  }).join('');
}
function text(str, x, y, { fill = '#fff', align = 'l' } = {}) {
  const tw = textW(str);
  const X = align === 'c' ? Math.round(x - tw / 2) : align === 'r' ? x - tw : x;
  const uses = [];
  [...str].forEach((ch, i) => {
    if (!FONT[ch]) throw new Error(`no glyph for "${ch}"`);
    if (ch === ' ') return;
    usedGlyphs.add(ch);
    uses.push(`<use href="#c${ch.charCodeAt(0)}" x="${i * ADV}"/>`);
  });
  return `<g fill="${fill}" transform="translate(${X} ${y})">${uses.join('')}</g>`;
}

// ------------------------------------------------------------------ the logo letters
// Hand-pixelled for this banner: 20 rows, horizontal strokes 4, vertical
// strokes 5, 45-degree chamfers on the outer corners.
const LOGO_GLYPHS = {
  C: [
    '....###########.', '...#############', '..##############', '.###############',
    '######..........', ...Array(10).fill('#####...........'), '######..........',
    '.###############', '..##############', '...#############', '....###########.',
  ],
  A: [
    '....#########....', '...###########...', '..#############..', '.###############.',
    '######.....######', '#####.......#####', '#####.......#####', '#####.......#####',
    '######.....######', '#################', '#################', '#################',
    '#################', '######.....######', ...Array(6).fill('#####.......#####'),
  ],
  S: [
    '....###########.', '...#############', '..##############', '.###############',
    '######..........', '#####...........', '#####...........', '######..........',
    '##############..', '###############.', '.###############', '..##############',
    '..........######', '...........#####', '...........#####', '..........######',
    '###############.', '##############..', '#############...', '.###########....',
  ],
  T: [
    '.###############.', '#################', '#################', '#################',
    '.....#######.....', ...Array(15).fill('......#####......'),
  ],
  W: [
    '.####.............####.', ...Array(5).fill('#####.............#####'),
    '#####.....###.....#####', ...Array(8).fill('#####....#####....#####'),
    '######..#######..######',
    '.#####################.', '..###################..', '...#################...', '....###############....',
  ],
  Y: [
    '.####.......####.', ...Array(7).fill('#####.......#####'), '######.....######',
    '.###############.', '..#############..', '...###########...', '....#########....', '.....#######.....',
    ...Array(6).fill('......#####......'),
  ],
};
for (const [k, g] of Object.entries(LOGO_GLYPHS)) {
  if (g.length !== 20) throw new Error(`glyph ${k} has ${g.length} rows`);
  if (g.some((r) => r.length !== g[0].length)) throw new Error(`glyph ${k} has ragged rows`);
}
const LOGO_GAP = 2, LOGO_H = 20;
function logoMask(word = 'CASTAWAY') {
  const ws = [...word].map((c) => LOGO_GLYPHS[c][0].length);
  const w = ws.reduce((a, b) => a + b, 0) + LOGO_GAP * (word.length - 1);
  const m = new Uint8Array(w * LOGO_H);
  let x0 = 0;
  [...word].forEach((c, i) => {
    LOGO_GLYPHS[c].forEach((row, y) => { for (let x = 0; x < row.length; x++) if (row[x] === '#') m[y * w + x0 + x] = 1; });
    x0 += ws[i] + LOGO_GAP;
  });
  return { m, w, h: LOGO_H };
}
const LOGO = logoMask();
if (argv.includes('--ascii')) {
  for (let y = 0; y < LOGO.h; y++) {
    let s = '';
    for (let x = 0; x < LOGO.w; x++) s += LOGO.m[y * LOGO.w + x] ? '#' : '.';
    console.log(s);
  }
}

// ==================================================================== PART 1
// The voxel island.
const YH = 54;            // horizon row
const CAMH = 60;          // camera height
const FOC = 160;          // focal length in pixels (90 degree view)
const CX = W / 2;
const STRAFE = 135;       // world units the camera slides right during part 1
const P1 = PART[0][1] - PART[0][0];
const rowZ = (y) => (CAMH * FOC) / (y + 0.5 - YH);
const shiftAt = (z) => (STRAFE * FOC) / z; // how far a thing at depth z slides
const fogT = (z) => 1 - Math.exp(-z / 2300);

const SKY_TOP = hex('#2a78dc'), SKY_MID = hex('#5aa6ec'), SKY_LOW = hex('#bfe6fb');
const HAZE = hex('#c4e6fa');
const SEA_NEAR = hex('#1a5fc0'), SEA_MID = hex('#2f86d8'), SEA_FAR = hex('#86c2ee');
const SUN = { x: 291, y: 13 };

// ---- sky: banded, ordered-dither gradient, the sun and its halo
function makeSky() {
  const img = new Img(W, YH);
  const bands = 18;
  for (let y = 0; y < YH; y++) for (let x = 0; x < W; x++) {
    const t = y / (YH - 1);
    const v = t * bands;
    const b0 = Math.floor(v), fr = v - b0;
    const band = fr > bayer(x, y) ? b0 + 1 : b0;
    const tt = clamp(band / bands);
    let c = tt < 0.55 ? mix(SKY_TOP, SKY_MID, tt / 0.55) : mix(SKY_MID, SKY_LOW, (tt - 0.55) / 0.45);
    // halo round the sun, in three stepped rings
    const d = Math.hypot(x - SUN.x, (y - SUN.y) * 1.0);
    const ring = d < 7.5 ? 3 : d < 11 ? 2 : d < 15.5 ? 1 : d < 21 && bayer(x, y) < 0.5 ? 1 : 0;
    if (ring === 3) c = hex('#fffbe8');
    else if (ring === 2) c = mix(c, hex('#fff6cf'), 0.75);
    else if (ring === 1) c = mix(c, hex('#e9f7ff'), 0.45);
    img.set(x, y, c.map((v) => Math.round(v / 4) * 4));
  }
  return img;
}

// ---- clouds: puffy pixel cumulus, three tones, flat bottoms
function makeClouds() {
  const img = new Img(W + 40, YH);
  const defs = [
    { x: 14, y: 40, w: 70, h: 14, s: 3 },
    { x: 96, y: 45, w: 34, h: 7, s: 5 },
    { x: 214, y: 37, w: 62, h: 13, s: 7 },
    { x: 300, y: 44, w: 40, h: 8, s: 9 },
    { x: 150, y: 46, w: 26, h: 5, s: 13 },
  ];
  const WHITE = hex('#ffffff'), LIGHT = hex('#eef6fd'), SHADE = hex('#c9def1'), DEEP = hex('#a9c6e4');
  for (const c of defs) {
    // a row of overlapping puffs
    const puffs = [];
    const n = Math.max(3, Math.round(c.w / 9));
    for (let i = 0; i < n; i++) {
      const u = (i + 0.5) / n;
      const r = c.h * (0.45 + 0.55 * Math.sin(Math.PI * u)) * (0.75 + 0.35 * hash2(i, c.s, 7));
      puffs.push({ x: c.x + u * c.w, y: c.y - r * 0.55, r });
    }
    for (let y = Math.floor(c.y - c.h * 1.4); y <= c.y; y++) for (let x = Math.floor(c.x - 4); x <= c.x + c.w + 4; x++) {
      let inside = false, top = Infinity;
      for (const p of puffs) {
        const d = Math.hypot(x + 0.5 - p.x, (y + 0.5 - p.y) * 1.25);
        if (d < p.r) { inside = true; top = Math.min(top, (y + 0.5 - (p.y - p.r / 1.25))); }
      }
      if (!inside || y > c.y) continue;
      const depth = (c.y - y) / (c.h * 1.2); // 0 at the flat bottom
      let col = depth < 0.18 ? DEEP : depth < 0.42 ? SHADE : top < 1.6 ? WHITE : LIGHT;
      if (depth >= 0.18 && depth < 0.42 && bayer(x, y) < 0.3) col = LIGHT;
      img.set(x, y, col);
    }
  }
  return img;
}

// ---- the sea: one row per scanline, each sampled at its own depth
function seaSample(wx, z) {
  const f = fogT(z);
  let c = f < 0.25 ? mix(SEA_NEAR, SEA_MID, f / 0.25) : mix(SEA_MID, SEA_FAR, smooth(0.25, 0.75, f));
  const n = fbm(wx / 20, z / 13, SEED + 3, 3);
  const m = fbm(wx / 70 + 9, z / 40, SEED + 5, 2);
  c = mix(c, [10, 40, 110], clamp((0.45 - n) * 0.5) * (1 - f));
  c = mix(c, hex('#4fa3ea'), clamp((m - 0.5) * 0.9) * (1 - f));
  const crest = smooth(0.66, 0.78, n);
  c = mix(c, hex('#d8f2ff'), crest * 0.85 * (1 - f * 0.7));
  return c;
}
const SEA_ROWS = H - YH;
const SEA_W = W + Math.ceil(shiftAt(rowZ(H - 1))) + 2;
function makeSea() {
  const img = new Img(SEA_W, SEA_ROWS);
  for (let r = 0; r < SEA_ROWS; r++) {
    const y = YH + r;
    const z = rowZ(y);
    const zr = Math.min(z, rowZ(y - 0.5 + 1e-3) - rowZ(y + 0.5)); // depth one pixel covers
    for (let u = 0; u < SEA_W; u++) {
      let acc = [0, 0, 0];
      const S = 4;
      for (let i = 0; i < S; i++) {
        const uu = u + (i + 0.5) / S;
        const zz = z + zr * ((i % 2) - 0.5) * 0.5;
        const wx = ((uu - CX) * zz) / FOC;
        const c = seaSample(wx, zz);
        acc = acc.map((v, k) => v + c[k] / S);
      }
      // the horizon melts into the haze
      acc = mix(acc, HAZE, smooth(0.62, 0.9, fogT(z)));
      img.set(u, r, acc.map((v) => Math.round(v / 6) * 6));
    }
  }
  return img;
}

// ---- islands: a height map and a colour map each, voxel-rendered
const LIGHT = (() => { const v = [0.55, 0.75, -0.35]; const l = Math.hypot(...v); return v.map((a) => a / l); })();
const SAND = hex('#efd9a1'), SAND_WET = hex('#c9b27c'), ROCK = hex('#8e8173'), ROCK_D = hex('#5f564e');
const GREENS = [hex('#2f7a35'), hex('#3f9440'), hex('#5aae48'), hex('#7cc457')];
const SHALLOW = hex('#5fdcd2'), LAGOON = hex('#2fb0d6');

function islandSpec(o) {
  const { xc, zc, rx, rz, peak, seed, kind } = o;
  const height = (wx, z) => {
    const dx = (wx - xc) / rx, dz = (z - zc) / rz;
    const warp = (fbm(wx / (rx * 0.5), z / (rz * 0.5), seed, 3) - 0.5) * 0.35;
    const d = Math.hypot(dx, dz) + warp;
    if (kind === 'home') {
      // low sand island with a bushy middle
      let h = 3.4 * (1 - d * d * 0.9) - 0.4;
      const bx = (wx - (xc - rx * 0.18)) / (rx * 0.42), bz = (z - (zc + rz * 0.05)) / (rz * 0.45);
      const bd = Math.hypot(bx, bz);
      const bush = bd < 1 ? (1 - bd * bd) * 4.8 * (0.7 + 0.6 * fbm(wx / 3, z / 3, seed + 9, 2)) : 0;
      return { h: d < 1.02 ? h + bush : -(d - 1) * 30, d, bush };
    }
    const prof = Math.max(0, 1 - d);
    let h;
    if (kind === 'volcano') {
      const ridge = 1 - Math.abs(2 * fbm(wx / (rx * 0.35), z / (rz * 0.35), seed + 1, 4) - 1);
      h = peak * (Math.pow(prof, 1.25) * 0.85 + 0.25 * prof * ridge) - peak * 0.05;
      // a notch of a crater at the top
      if (prof > 0.86) h -= (prof - 0.86) * peak * 0.9;
    } else if (kind === 'hills') {
      const r = fbm(wx / (rx * 0.3), z / (rz * 0.3), seed + 1, 4);
      h = peak * (Math.pow(prof, 0.9) * (0.45 + 0.85 * r)) - peak * 0.06;
    } else { // crag
      const r = fbm(wx / (rx * 0.22), z / (rz * 0.22), seed + 1, 3);
      h = peak * Math.pow(prof, 0.6) * (0.55 + 0.75 * r) - 1.5;
    }
    return { h: d < 1 ? h : -(d - 1) * 60, d };
  };
  const colourAt = (wx, z) => {
    const s = height(wx, z);
    if (s.h <= 0) {
      // water: shallows fade into the open sea, then nothing (the sea layer shows)
      const lim = kind === 'home' ? 1.42 : 1.12;
      if (s.d > lim) return null;
      const t = (s.d - 1) / (lim - 1);
      const sea = seaSample(wx, z);
      let c = kind === 'home' ? (t < 0.35 ? mix(SHALLOW, LAGOON, t / 0.35) : mix(LAGOON, sea, (t - 0.35) / 0.65)) : mix(LAGOON, sea, clamp(t));
      if (s.h > -0.9 && kind === 'home') c = mix(c, hex('#ffffff'), 0.85); // foam at the waterline
      return { h: 0, c };
    }
    const e = 0.6;
    const hx = (height(wx + e, z).h - height(wx - e, z).h) / (2 * e);
    const hz = (height(wx, z + e).h - height(wx, z - e).h) / (2 * e);
    const nrm = [-hx, 1, -hz]; const nl = Math.hypot(...nrm);
    const lam = clamp((nrm[0] * LIGHT[0] + nrm[1] * LIGHT[1] + nrm[2] * LIGHT[2]) / nl);
    const shade = Math.round((0.42 + 0.68 * lam) * 8) / 8; // stepped, like a baked palette
    const slope = Math.hypot(hx, hz);
    let base;
    if (kind === 'home') {
      if (s.bush > 0.6) base = GREENS[Math.min(3, Math.floor(fbm(wx / 2.2, z / 2.2, seed + 4, 2) * 4.4))];
      else base = s.h < 0.5 ? SAND_WET : SAND;
    } else {
      const sandH = kind === 'crag' ? 0.8 : peak * 0.035;
      const rocky = slope > (kind === 'crag' ? 0.55 : 1.4) || s.h > peak * 0.82;
      if (s.h < sandH) base = SAND;
      else if (rocky) base = fbm(wx / 9, z / 9, seed + 6, 2) > 0.5 ? ROCK : ROCK_D;
      else base = GREENS[Math.min(3, Math.floor(fbm(wx / (rx * 0.05), z / (rz * 0.05), seed + 4, 2) * 4.4))];
    }
    let c = base.map((v) => v * shade);
    return { h: s.h, c };
  };
  return { ...o, height, colourAt };
}

const ISLANDS = [
  islandSpec({ id: 'haze-l', xc: -2350, zc: 3300, rx: 900, rz: 400, peak: 330, kind: 'hills', seed: 5 }),
  islandSpec({ id: 'haze-r', xc: 1350, zc: 2800, rx: 760, rz: 360, peak: 290, kind: 'volcano', seed: 7 }),
  islandSpec({ id: 'far', xc: -860, zc: 1650, rx: 470, rz: 240, peak: 200, kind: 'volcano', seed: 11 }),
  islandSpec({ id: 'ridge', xc: 700, zc: 1020, rx: 330, rz: 170, peak: 105, kind: 'hills', seed: 23 }),
  islandSpec({ id: 'crag', xc: -330, zc: 470, rx: 62, rz: 42, peak: 38, kind: 'crag', seed: 37 }),
  islandSpec({ id: 'home', xc: 64, zc: 236, rx: 46, rz: 30, peak: 6, kind: 'home', seed: 41 }),
  // (far enough back that it rides two rows clear of the bottom-right caption)
  islandSpec({ id: 'reef', xc: 162, zc: 200, rx: 12, rz: 7, peak: 8, kind: 'crag', seed: 53 }),
];

// Voxel Space, per layer: for every screen column march from near to far,
// draw the part of each sample's column that rises above everything nearer.
function renderIsland(sp) {
  const big = new Img(W + 200, H);
  const OX = 100; // canvas x of screen x 0
  const zmin = sp.zc - sp.rz * 1.5, zmax = sp.zc + sp.rz * 1.5;
  for (let u = -100; u < W + 100; u++) {
    let ybuf = H;
    let z = Math.max(zmin, 10);
    while (z < zmax) {
      const wx = ((u + 0.5 - CX) * z) / FOC;
      const s = sp.colourAt(wx, z);
      if (s) {
        const row = YH + ((CAMH - s.h) * FOC) / z;
        const top = Math.floor(row);
        // the column runs from the sample's top down to sea level at its own
        // depth; below that is nearer sea, which belongs to the sea layer
        const bottom = Math.min(ybuf, Math.floor(YH + (CAMH * FOC) / z) + 1);
        if (top < bottom) {
          const fog = fogT(z);
          const c = mix(s.c, HAZE, fog * (s.h > 0 ? 1 : 0.6)).map((v) => Math.round(v / 4) * 4);
          for (let y = Math.max(top, 0); y < bottom; y++) big.set(u + OX, y, c);
        }
        ybuf = Math.min(ybuf, top);
      }
      z += Math.max(0.15, z * 0.0018);
    }
  }
  return { big, OX };
}

// ---- sprites
const HER_KEY = {
  c: '#f6efda', k: '#c9bc9c', h: '#5b3820', H: '#3d2412', g: '#86552f', s: '#e3a57a', S: '#c08058',
  r: '#ec7660', R: '#c65449', w: '#f4ead2', W: '#cdbf9f', o: '#3a2a26',
};
// rows 0-3 are the head (they nod), the rest is the body: brown hair framing
// her face with the low bun just showing at the nape (H), cream headphone cups
// (c), coral tank top with bare shoulders, cream shorts, bare feet
const HER = [
  '..hgh..',
  '.hhhhh.',
  'chssshc',
  '.hsSsH.',
  '.srrrs.',
  '.srrrs.',
  '.SrrrS.',
  '.sRRRs.',
  '..www..',
  '..wWw..',
  '..s.s..',
  '..S.S..',
  '.ss.ss.',
];
// a message in a bottle, lying in the water
const BOTTLE = ['.lgg..', 'gggGGc', '.ggg..', 'w....w'];
const BOTTLE_KEY = { l: '#d8f6e4', g: '#3f9a6a', G: '#2a7050', c: '#c9955a', w: '#ffffff' };
function spriteImg(rows, key) {
  const img = new Img(rows[0].length, rows.length);
  rows.forEach((r, y) => [...r].forEach((ch, x) => { if (key[ch]) img.set(x, y, hex(key[ch])); }));
  return img;
}
function blit(dst, src, x0, y0) {
  for (let y = 0; y < src.h; y++) for (let x = 0; x < src.w; x++) {
    const c = src.get(x, y);
    if (c) dst.set(x0 + x, y0 + y, c);
  }
}
// The palm: tall, slender, curving, segmented reddish-tan bark; a crown of
// drooping fronds. Drawn pixel by pixel from a few curves.
function drawPalm(img, bx, by) {
  const HT = 34, LEAN = 7;
  const at = (t) => [bx + LEAN * t * t + 1.2 * Math.sin(Math.PI * t), by - HT * t];
  const BARK = [hex('#b46c45'), hex('#93532f')], LIT = hex('#d99266'), DARK = hex('#6c3a22');
  for (let i = 0; i <= HT * 3; i++) {
    const t = i / (HT * 3);
    const [x, y] = at(t);
    const wdt = t < 0.4 ? 3 : 2;
    const seg = Math.floor((by - y) / 3) % 2;
    for (let k = 0; k < wdt; k++) {
      const c = k === 0 ? DARK : k === wdt - 1 ? LIT : BARK[seg];
      img.set(Math.floor(x) - 1 + k, Math.floor(y), seg === 1 && k === wdt - 1 ? BARK[0] : c);
    }
  }
  const [cx, cy] = at(1);
  const SPINE = hex('#2b6a2c'), MID = hex('#3f9a3c'), LITG = hex('#86d05a'), DEEP = hex('#24572a');
  const fronds = [
    [168, 15, 0.5], [142, 12, 0.5], [112, 9, 0.4], [80, 8, 0.3], [52, 11, 0.45],
    [24, 14, 0.5], [2, 15, 0.62], [196, 11, 0.42], [-24, 11, 0.5],
  ];
  const leaf = [];
  for (const [deg, len, droop] of fronds) {
    const a = (deg * Math.PI) / 180;
    const dir = [Math.cos(a), -Math.sin(a)];
    for (let s = 0; s <= len; s += 0.35) {
      const u = s / len;
      const x = cx + dir[0] * s, y = cy + dir[1] * s + droop * s * s * 0.09;
      const px = Math.round(x), py = Math.round(y);
      // leaflets hang below the spine, shorter towards the tip
      const hang = Math.round((1 - u) * 2.6 + 0.6);
      for (let k = 1; k <= hang; k++) leaf.push([px, py + k, k === hang ? DEEP : MID]);
      if (u < 0.85) leaf.push([px, py - 1, LITG]);
      leaf.push([px, py, SPINE]);
    }
  }
  // draw shading layers in order: deep, mid, light, spine
  const order = [DEEP, MID, LITG, SPINE];
  for (const col of order) for (const [x, y, c] of leaf) if (c === col) img.set(x, y, c);
  // coconuts
  for (const [dx, dy] of [[-1, 1], [1, 1], [0, 2]]) img.set(Math.round(cx) + dx, Math.round(cy) + dy, hex('#6b4222'));
  return [cx, cy];
}
function drawRaft(img, x0, y0) {
  const LOG = [hex('#9a5d36'), hex('#7c4627'), hex('#a96a3e')], ROPE = hex('#e3cf9c'), FOAM = hex('#ffffff');
  for (let r = 0; r < 3; r++) for (let x = 0; x < 13; x++) {
    const c = x === 2 || x === 10 ? ROPE : LOG[(r + (x > 6 ? 1 : 0)) % 3];
    img.set(x0 + x + (r === 1 ? 1 : 0), y0 + r, c);
  }
  for (const x of [-1, 14, 5, 9]) img.set(x0 + x, y0 + 3, FOAM);
}

// Build part 1's images and placements.
function buildPart1() {
  const layers = [];
  for (const sp of ISLANDS) {
    const { big, OX } = renderIsland(sp);
    let head = null, bottle = null;
    if (sp.id === 'home') {
      // the palm, her and the raft, placed by projecting world points
      const P = (wx, z, h) => [Math.round(CX + (wx * FOC) / z) + OX, Math.round(YH + ((CAMH - h) * FOC) / z)];
      const [pbx, pby] = P(sp.xc + 10, sp.zc + 2, sp.height(sp.xc + 10, sp.zc + 2).h);
      drawPalm(big, pbx, pby);
      const [hx, hy] = P(sp.xc - 30, sp.zc - 6, Math.max(0, sp.height(sp.xc - 30, sp.zc - 6).h));
      const her = spriteImg(HER, HER_KEY);
      const body = spriteImg(HER.slice(4), HER_KEY);
      blit(big, body, hx - 3, hy - her.h + 4);
      head = { img: spriteImg(HER.slice(0, 4), HER_KEY), x: hx - 3 - OX, y: hy - her.h };
      const [rx, ry] = P(sp.xc + 58, sp.zc - 10, 0);
      drawRaft(big, rx - 6, ry - 2);
      const [bx, by] = P(sp.xc - 52, sp.zc - 10, 0);
      bottle = { img: spriteImg(BOTTLE, BOTTLE_KEY), x: bx - OX - 3, y: by - 2 };
    }
    const cr = big.crop();
    layers.push({ id: sp.id, img: cr.img, x: cr.x - OX, y: cr.y, z: sp.zc, shift: shiftAt(sp.zc), head, bottle });
  }
  return { sky: makeSky(), clouds: makeClouds(), sea: makeSea(), layers };
}

// ---- the logo as a picture: voxel block letters. Every logo pixel is a
// column LOGO_D voxels deep, receding up and to the right (an oblique view
// from above and to the right): sun-lit sand tops, plum sides, and a front
// face in a stepped coral palette ramp (six hard bands, one palette entry
// each, no smoothing).
const LOGO_D = 5;
const FRONT = [[0, hex('#ff9a72')], [0.5, hex('#ec5f5c')], [1, hex('#a83a5e')]];
function logoImage({ edge = hex('#0b1838') } = {}) {
  const { m, w, h } = LOGO, PAD = 2, D = LOGO_D;
  const img = new Img(w + PAD * 2 + D, h + PAD * 2 + D);
  const at = (x, y) => x >= 0 && y >= 0 && x < w && y < h && m[y * w + x];
  const ox = PAD, oy = PAD + D; // where the front face sits in the image
  // depth of the nearest voxel covering image pixel (X, Y), or -1
  const occ = (X, Y) => { for (let k = 0; k <= D; k++) if (at(X - ox - k, Y - oy + k)) return k; return -1; };
  // a one-pixel dark edge round the whole block
  for (let Y = 0; Y < img.h; Y++) for (let X = 0; X < img.w; X++) {
    if (occ(X, Y) >= 0) continue;
    let n = false;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (occ(X + dx, Y + dy) >= 0) n = true;
    if (n) img.set(X, Y, edge);
  }
  // back to front: tops where the column above is open, sides where the one
  // to the right is, and a blend of the two on the 45-degree chamfers
  const TOP = (t) => mix(hex('#fff6dc'), hex('#f0d290'), t);
  const SIDE = (t) => mix(hex('#8a2f52'), hex('#561a42'), t);
  for (let k = D; k >= 1; k--) for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (!at(x, y)) continue;
    const t = (k - 1) / (D - 1), up = !at(x, y - 1), right = !at(x + 1, y), diag = !at(x + 1, y - 1);
    // a 45-degree face is every voxel open both ways, or open only diagonally
    const chamfer = (up && right) || (!up && !right && diag);
    const c = chamfer ? mix(TOP(t), SIDE(t), 0.5) : up ? TOP(t) : SIDE(t);
    img.set(x + ox + k, y + oy - k, c);
  }
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (!at(x, y)) continue;
    let c = ramp(FRONT, Math.min(5, Math.floor((y / h) * 6)) / 5);
    if (!at(x, y + 1)) c = mix(c, [40, 10, 40], 0.3);
    img.set(x + ox, y + oy, c);
  }
  return { img, ox, oy };
}

// ==================================================================== assemble
const P1D = buildPart1();
const css = [];
const defs = [];
const body = [];

// part 1 ---------------------------------------------------------------
{
  const k = (P1 / LOOP) * 100;
  css.push(`.px{image-rendering:optimizeSpeed;image-rendering:pixelated}`);
  // the sky never moves; the clouds drift with the wind
  // part 1 is hidden (not painted) while the other parts cover it
  css.push(`#p1{animation:p1 ${LOOP}s step-end infinite}@keyframes p1{0%{visibility:visible}${f2(k)}%,100%{visibility:hidden}}`);
  body.push(`<g id="p1">`);
  body.push(`<image class="px" width="${W}" height="${YH}" href="${emb('sky', P1D.sky)}"/>`);
  css.push(`.cl{animation:cl ${LOOP}s linear infinite}@keyframes cl{0%{transform:translateX(0)}${f2(k)}%,100%{transform:translateX(-9px)}}`);
  body.push(`<image class="px cl" width="${P1D.clouds.w}" height="${YH}" href="${emb('clouds', P1D.clouds)}"/>`);
  // the sea: one viewport per scanline, each sliding its own row of the sheet
  defs.push(`<image id="sea" class="px" width="${SEA_W}" height="${SEA_ROWS}" href="${emb('sea', P1D.sea)}"/>`);
  // (each viewport is 1.5 rows tall and the next one is drawn over its lower
  // half, so no row edge ever falls on the black behind: no seams)
  body.push(`<rect y="${YH}" width="${W}" height="${SEA_ROWS}" fill="${rgbHex(SEA_MID)}"/>`);
  for (let r = 0; r < SEA_ROWS; r++) {
    const s = shiftAt(rowZ(YH + r));
    css.push(`.s${r}{animation:s${r} ${LOOP}s linear infinite}@keyframes s${r}{${f2(k)}%,100%{transform:translateX(-${f2(s)}px)}}`);
    body.push(`<svg y="${YH + r}" width="${W}" height="1.5" viewBox="0 ${r} ${W} 1.5" preserveAspectRatio="none"><use href="#sea" class="s${r}"/></svg>`);
  }
  // sun glitter: fixed on screen (the sun is at infinity), twinkling in three phases
  {
    const groups = [[], [], []];
    for (let i = 0; i < 34; i++) {
      const y = 63 + Math.floor(hash2(i, 1, SEED) * 40);
      const spread = 2 + (y - 60) * 0.32;
      const x = Math.round(SUN.x + (hash2(i, 2, SEED) + hash2(i, 3, SEED) - 1) * spread * 1.6);
      const w = hash2(i, 4, SEED) > 0.6 ? 2 : 1;
      groups[i % 3].push(`M${x} ${y}h${w}v1h${-w}z`);
    }
    css.push(`.tw{animation:tw 1.5s step-end infinite}@keyframes tw{0%{opacity:1}34%{opacity:0}67%{opacity:.6}}`);
    groups.forEach((g, i) => body.push(`<path class="tw" style="animation-delay:${-0.5 * i}s" fill="${i ? '#fff6cf' : '#fff'}" d="${g.join('')}"/>`));
  }
  // islands, far to near
  P1D.layers.forEach((L, i) => {
    css.push(`.i${i}{animation:i${i} ${LOOP}s linear infinite}@keyframes i${i}{${f2(k)}%,100%{transform:translateX(-${f2(L.shift)}px)}}`);
    let g = `<g class="i${i}"><image class="px" x="${L.x}" y="${L.y}" width="${L.img.w}" height="${L.img.h}" href="${emb('isl-' + L.id, L.img)}"/>`;
    if (L.head) {
      g += `<g class="nod"><image class="px" x="${L.head.x}" y="${L.head.y}" width="${L.head.img.w}" height="${L.head.img.h}" href="${emb('head', L.head.img)}"/></g>`;
    }
    if (L.bottle) {
      // the bottle drifts out to sea one pixel at a time, thinks about it, and
      // washes straight back
      const p = (sec) => f2((sec / LOOP) * 100);
      css.push(`.bt{animation:bt ${LOOP}s linear infinite}@keyframes bt{0%,${p(1)}%{transform:translateX(0);animation-timing-function:steps(22,end)}`
        + `${p(5.5)}%,${p(7)}%{transform:translateX(-22px);animation-timing-function:steps(22,end)}${p(11)}%,100%{transform:translateX(0)}}`);
      g += `<image class="px bt" x="${L.bottle.x}" y="${L.bottle.y}" width="${L.bottle.img.w}" height="${L.bottle.img.h}" href="${emb('bottle', L.bottle.img)}"/>`;
    }
    body.push(g + '</g>');
  });
  css.push(`.nod{animation:nod ${BEAT}s step-end infinite}@keyframes nod{0%{transform:translateY(1px)}40%{transform:translateY(0)}}`);
  // the logo, the line above it and the line below it
  // LX, LY: top-left of the front face; the block rises LOGO_D up and right
  // (LY leaves two clear rows between the logo's dark edge and the line above,
  // and the tag line below starts two clear rows under the edge too)
  const LX = Math.round(CX - (LOGO.w + LOGO_D) / 2), LY = 19;
  const { img: logo, ox: lox, oy: loy } = logoImage();
  body.push(text('CORAL DAC PRESENTS', CX, 3, { align: 'c', fill: '#fff6d8' }));
  body.push(`<image id="logo" class="px" x="${LX - lox}" y="${LY - loy}" width="${logo.w}" height="${logo.h}" href="${emb('logo', logo)}"/>`);
  // a glint that sweeps across the letters twice per part
  defs.push(`<clipPath id="lc"><path d="${maskPath(LOGO.m, LOGO.w, LOGO.h, LX, LY)}"/></clipPath>`);
  css.push(`.gl{transform:translateX(-30px);animation:gl 6s linear infinite}@keyframes gl{0%{transform:translateX(-30px)}22%,100%{transform:translateX(${LOGO.w + 30}px)}}`);
  body.push(`<g clip-path="url(#lc)"><path class="gl" fill="#fff" fill-opacity=".7" d="M${LX} ${LY + 20}l8 -20h4l-8 20zM${LX + 7} ${LY + 20}l8 -20h2l-8 20z"/></g>`);
  body.push(text('A TEN-HOUR LO-FI ISLAND VIDEO', CX, LY + LOGO_H + 4, { align: 'c' }));
  body.push(text('PART 1 OF 4: VOXEL ISLAND', CAP_L, CAP_B));
  body.push(text('NOTHING HAPPENS IN 2.5D', CAP_R, CAP_B, { align: 'r' }));
  body.push('</g>');
}

// A part shows only during its own bars of the loop (SMIL, so it needs no CSS).
function showDuring(i, attr = 'display') {
  const [a, b] = PART[i];
  const off = attr === 'display' ? 'none' : 'hidden', on = attr === 'display' ? 'inline' : 'visible';
  return `<animate attributeName="${attr}" dur="${LOOP}s" repeatCount="indefinite" calcMode="discrete" keyTimes="0;${f3(a / LOOP)};${f3(b / LOOP)}" values="${off};${on};${off}"/>`;
}
// The same, for a sub-window [a, b) seconds of the loop.
const window_ = (a, b) => `<animate attributeName="display" dur="${LOOP}s" repeatCount="indefinite" calcMode="discrete" keyTimes="0;${f3(a / LOOP)};${f3(b / LOOP)}" values="none;inline;none"/>`;
// A palette lookup: grey in, one of n colours out (feFunc type=discrete).
function paletteFilter(id, cols) {
  const ch = (k) => cols.map((c) => f3(c[k] / 255)).join(' ');
  return `<filter id="${id}" x="0" y="0" width="1" height="1" color-interpolation-filters="sRGB">`
    + `<feComponentTransfer><feFuncR type="discrete" tableValues="${ch(0)}"/><feFuncG type="discrete" tableValues="${ch(1)}"/>`
    + `<feFuncB type="discrete" tableValues="${ch(2)}"/></feComponentTransfer></filter>`;
}
body.push('<g class="anim">');

// ==================================================================== PART 2
// Fire by friction. Half resolution: one fire cell is 2 x 2 screen pixels.
{
  const FW = 160, FH = 60;
  const LOGO_CX = 3, LOGO_CY = 35; // the letters, in cells (one cell per logo pixel)
  // heat: a white-hot floor fading upward, plus heat rising off the letter tops
  const heat = new Float32Array(FW * FH);
  const topAt = new Int32Array(FW).fill(-1);
  for (let x = 0; x < LOGO.w; x++) for (let y = 0; y < LOGO.h; y++) if (LOGO.m[y * LOGO.w + x]) { topAt[x + LOGO_CX] = y + LOGO_CY; break; }
  for (let y = 0; y < FH; y++) for (let x = 0; x < FW; x++) {
    const reach = 25 + 9 * fbm(x / 11, 3.5, SEED + 21, 2) + 4 * Math.sin(x / 7);
    let h = Math.pow(clamp(1 - (FH - 1 - y) / reach), 0.9);
    // flames off the tops of the letters (and a little off their neighbours)
    for (let dx = -2; dx <= 2; dx++) {
      const t = topAt[x + dx] ?? -1;
      if (t < 0 || y > t) continue;
      const d = t - y;
      h = Math.max(h, (dx === 0 ? 0.97 : 0.8) * Math.pow(clamp(1 - d / 19), 1.15));
    }
    heat[y * FW + x] = h;
  }
  // two seamless noise tiles, stretched upright, used as multipliers
  const n1W = 160, n1H = 64, n2W = 64, n2H = 64;
  const n1 = new Float32Array(n1W * n1H), n2 = new Float32Array(n2W * n2H);
  for (let y = 0; y < n1H; y++) for (let x = 0; x < n1W; x++) {
    n1[y * n1W + x] = 1 - 0.88 * smooth(0.32, 0.78, fbm(x / 4, y / 8, SEED + 31, 3, 40, 8));
  }
  for (let y = 0; y < n2H; y++) for (let x = 0; x < n2W; x++) {
    n2[y * n2W + x] = 1 - 0.6 * smooth(0.38, 0.85, fbm(x / 8, y / 16, SEED + 37, 2, 8, 4));
  }
  // stored as grey PNGs with a few levels each (they end up as palette indices anyway)
  const greyImg = (w, h, v, levels) => {
    const im = new Img(w, h);
    for (let i = 0; i < w * h; i++) { const g = Math.round((Math.round(clamp(v[i]) * (levels - 1)) / (levels - 1)) * 255); im.set(i % w, Math.floor(i / w), [g, g, g]); }
    return im;
  };
  const heatUri = emb('fire-heat', greyImg(FW, FH, heat, 64));
  const n1Uri = emb('fire-n1', greyImg(n1W, n1H, n1, 16));
  const n2Uri = emb('fire-n2', greyImg(n2W, n2H, n2, 12));
  // the 37-step fire palette (drawn for this banner)
  const FIRE = [[0, hex('#000000')], [0.1, hex('#1c0403')], [0.22, hex('#4c0b05')], [0.34, hex('#8c1707')],
    [0.46, hex('#c62c08')], [0.57, hex('#e9560d')], [0.68, hex('#f7881b')], [0.79, hex('#fbb930')],
    [0.88, hex('#fde06a')], [0.95, hex('#fff6c2')], [1, hex('#ffffff')]];
  defs.push(paletteFilter('fire', Array.from({ length: 37 }, (_, i) => ramp(FIRE, Math.pow(i / 36, 1.1)))));
  // scrolling: whole cells, 20 steps a second (tile 1) and a slower diagonal drift (tile 2)
  const steps1 = Array.from({ length: n1H }, (_, i) => `0 ${-2 * i}`).join(';');
  const steps2 = Array.from({ length: 128 }, (_, i) => `${-2 * Math.floor(i / 2)} ${-2 * i}`).join(';');
  defs.push(`<pattern id="pn1" patternUnits="userSpaceOnUse" width="${n1W * 2}" height="${n1H * 2}"><image class="px" width="${n1W * 2}" height="${n1H * 2}" href="${n1Uri}"/>`
    + `<animateTransform attributeName="patternTransform" type="translate" dur="${n1H * 0.05}s" repeatCount="indefinite" calcMode="discrete" values="${steps1}"/></pattern>`);
  defs.push(`<pattern id="pn2" patternUnits="userSpaceOnUse" width="${n2W * 2}" height="${n2H * 2}"><image class="px" width="${n2W * 2}" height="${n2H * 2}" href="${n2Uri}"/>`
    + `<animateTransform attributeName="patternTransform" type="translate" dur="${128 * 0.1}s" repeatCount="indefinite" calcMode="discrete" values="${steps2}"/></pattern>`);
  css.push('.mul{mix-blend-mode:multiply}');
  // the white-hot floor: the source row of the classic fire, softened upward
  defs.push('<linearGradient id="hot" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#fff"/><stop offset=".25" stop-color="#fff" stop-opacity=".85"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>');
  // the letters as charred firewood: charcoal, embers in the grain, glowing tops
  const char = new Img(LOGO.w, LOGO.h), rim = new Img(LOGO.w, LOGO.h);
  const at = (x, y) => x >= 0 && y >= 0 && x < LOGO.w && y < LOGO.h && LOGO.m[y * LOGO.w + x];
  for (let y = 0; y < LOGO.h; y++) for (let x = 0; x < LOGO.w; x++) {
    if (!at(x, y)) continue;
    const grain = fbm(x / 6, y / 1.4, SEED + 41, 2);
    let c = mix(hex('#140a08'), hex('#2a1610'), grain);
    if (grain > 0.68 && hash2(x, y, 5) > 0.55) c = hex('#5a1a0a');
    if (!at(x - 1, y) || !at(x + 1, y)) c = mix(c, hex('#3a1408'), 0.6);
    char.set(x, y, c);
    if (!at(x, y - 1)) rim.set(x, y, hex('#ffe08a'));
    else if (!at(x, y - 2)) rim.set(x, y, hex('#ff7a1c'));
    else if (grain > 0.74 && hash2(x, y, 9) > 0.6) rim.set(x, y, hex('#e0420e')); // embers in the grain
  }
  // the glowing edges breathe gently (slow and soft: no flashing)
  css.push(`.fl{animation:fl 1.5s ease-in-out infinite}@keyframes fl{0%,100%{opacity:1}35%{opacity:.72}60%{opacity:.9}80%{opacity:.78}}`);
  const LXp = LOGO_CX * 2, LYp = LOGO_CY * 2;
  body.push(`<g display="none">${showDuring(1)}`);
  body.push(`<g filter="url(#fire)"><image class="px" width="${W}" height="${H}" href="${heatUri}"/>`
    + `<rect class="mul" width="${W}" height="${H}" fill="url(#pn1)"/><rect class="mul" width="${W}" height="${H}" fill="url(#pn2)"/>`
    + `<rect y="${H - 14}" width="${W}" height="14" fill="url(#hot)"/></g>`);
  body.push(`<image class="px" x="${LXp}" y="${LYp}" width="${LOGO.w * 2}" height="${LOGO.h * 2}" href="${emb('fire-letters', char)}"/>`);
  body.push(`<image class="px fl" x="${LXp}" y="${LYp}" width="${LOGO.w * 2}" height="${LOGO.h * 2}" href="${emb('fire-rim', rim)}"/>`);
  body.push(text('PART 2 OF 4: FIRE BY FRICTION', CAP_L, CAP_T));
  body.push(text('IT IS STILL DAYTIME. THE SCREEN IS JUST BLACK.', CAP_L, CAP_T + 10, { fill: '#ffd9a0' }));
  body.push('</g>');
}

// ==================================================================== PART 3
// Shade bobs: she jogs laps, and every step brightens the sand it lands on.
{
  const [a] = PART[2];
  const LAP = 2, DUR = PART[2][1] - PART[2][0], RATE = 60;
  const R = 11;
  const disc = new Uint8Array((2 * R + 1) ** 2);
  for (let y = -R; y <= R; y++) for (let x = -R; x <= R; x++) if (x * x + y * y <= R * R + R * 0.6) disc[(y + R) * (2 * R + 1) + x + R] = 1;
  defs.push(`<path id="b" fill="#fff" fill-opacity=".14" d="${maskPath(disc, 2 * R + 1, 2 * R + 1, -R, -R)}"/>`);
  const BOBS = [[0, hex('#000000')], [0.08, hex('#1e0512')], [0.2, hex('#4a0d27')], [0.34, hex('#7e1735')],
    [0.48, hex('#b52a42')], [0.6, hex('#de4f50')], [0.71, hex('#f17a5e')], [0.81, hex('#f9a676')],
    [0.9, hex('#fdd2a2')], [0.96, hex('#fff0d8')], [1, hex('#ffffff')]];
  defs.push(paletteFilter('bobs', Array.from({ length: 16 }, (_, i) => ramp(BOBS, i / 15))));
  css.push(`.b{opacity:0;animation:b ${LOOP}s step-end infinite}@keyframes b{0%{opacity:0}50%{opacity:1}}`);
  // stamps are shown a frame at a time (20 frames a second, 3 stamps each);
  // each frame's group switches on at its moment and stays on (the keyframes
  // hold it for half the loop, longer than the part lasts)
  const stamps = [];
  const PER = RATE / 20;
  for (let f = 0; f < DUR * 20; f++) {
    let g = '';
    for (let j = 0; j < PER; j++) {
      const t = (f * PER + j) / RATE;
      const x = Math.round(CX + 132 * Math.sin((2 * Math.PI * t) / LAP + 0.35));
      const y = Math.round(62 + 36 * Math.sin((2 * Math.PI * t) / (LAP * 1.5) + 1.1));
      g += `<use href="#b" x="${x}" y="${y}"/>`;
    }
    stamps.push(`<g class="b" style="animation-delay:${f2(a + f / 20 - LOOP / 2)}s">${g}</g>`);
  }
  // the name, cut out of the field, with a faint edge so it reads from the start
  const cut = new Img(LOGO.w + 2, LOGO.h + 2);
  const at = (x, y) => x >= 0 && y >= 0 && x < LOGO.w && y < LOGO.h && LOGO.m[y * LOGO.w + x];
  for (let y = -1; y <= LOGO.h; y++) for (let x = -1; x <= LOGO.w; x++) {
    if (at(x, y)) cut.set(x + 1, y + 1, hex('#000000'));
    else if (at(x - 1, y) || at(x + 1, y) || at(x, y - 1) || at(x, y + 1)) cut.set(x + 1, y + 1, hex('#7a2238'));
  }
  body.push(`<g visibility="hidden">${showDuring(2, 'visibility')}`);
  body.push(`<g filter="url(#bobs)"><rect width="${W}" height="${H}" fill="#000"/>${stamps.join('')}</g>`);
  body.push(`<image class="px" x="${6 - 2}" y="${43 - 2}" width="${cut.w * 2}" height="${cut.h * 2}" href="${emb('bob-cut', cut)}"/>`);
  body.push(text('PART 3 OF 4: SHADE BOBS', CAP_L, CAP_T));
  body.push(text('SHE JOGS LAPS. THE SAND KEEPS COUNT.', CAP_L, CAP_B, { fill: '#ffd2bf' }));
  for (let k = 0; k < DUR / LAP; k++) {
    body.push(`<g display="none">${window_(a + k * LAP, a + (k + 1) * LAP)}${text(`LAP ${k + 1}`, CAP_R, CAP_T, { align: 'r' })}</g>`);
  }
  body.push('</g>');
}

// ==================================================================== PART 4
// The fractal coastline: nested Koch islands, each 1/sqrt(3) the size of the
// one outside it and turned 30 degrees. Zooming in by sqrt(3) while turning
// 30 degrees lands every band on the next one out; eight bands in the
// palette, so eight such steps (x81, 240 degrees) land on the first frame.
{
  const [a, b] = PART[3];
  const DUR = b - a;
  // one bump region: the Koch curve on the base (-1,0)-(1,0), bulging up, closed
  // along a line a hair below the base so neighbouring pieces overlap
  function koch(p, q, depth, out) {
    if (depth === 0) { out.push(q); return; }
    const d = [(q[0] - p[0]) / 3, (q[1] - p[1]) / 3];
    const p1 = [p[0] + d[0], p[1] + d[1]], p3 = [p[0] + 2 * d[0], p[1] + 2 * d[1]];
    const c = Math.cos(-Math.PI / 3), s = Math.sin(-Math.PI / 3);
    const p2 = [p1[0] + d[0] * c - d[1] * s, p1[1] + d[0] * s + d[1] * c];
    koch(p, p1, depth - 1, out); koch(p1, p2, depth - 1, out); koch(p2, p3, depth - 1, out); koch(p3, q, depth - 1, out);
  }
  // 243 segments of 8 units: every step is (+-8, 0) or (+-4, +-7), written
  // relative; 7 for 4 * sqrt(3) is a 1% squash, and ups and downs cancel, so
  // the curve still closes exactly
  const S = 243 * 4; // path units per unit of the base half-length
  const pts = [[-1, 0]];
  koch([-1, 0], [1, 0], 5, pts);
  let bump = `M${-S} 0l`;
  for (let i = 1; i < pts.length; i++) {
    const dx = Math.round((pts[i][0] - pts[i - 1][0]) * S), dy = Math.round((pts[i][1] - pts[i - 1][1]) * S / 6.93) * 7;
    bump += `${i > 1 && dx >= 0 ? ' ' : ''}${dx}${dy >= 0 ? ' ' : ''}${dy}`;
  }
  bump += `L${S} 6L${-S} 6Z`;
  // the snowflake: a triangle with a bump region on each side. Base half-length
  // 1 means side 2; circumradius 2/sqrt(3).
  const r = 2 / Math.sqrt(3);
  const tri = [90, 210, 330].map((d) => [Math.cos((d * Math.PI) / 180) * r * S, -Math.sin((d * Math.PI) / 180) * r * S]);
  const inr = r / 2; // inradius: distance from centre to each side
  let flake = `<path d="M${tri.map(([x, y]) => `${Math.round(x)} ${Math.round(y)}`).join('L')}Z"/>`;
  for (const deg of [0, 120, 240]) flake += `<use href="#bump" transform="rotate(${deg}) translate(0 ${Math.round(inr * S)}) scale(1 -1)"/>`;
  defs.push(`<path id="bump" d="${bump}"/><g id="flake">${flake}</g>`);
  const BANDS = ['#0d2c6e', '#1a5cb8', '#2a93dc', '#46cfd4', '#e8f8f0', '#f1d796', '#f08868', '#7a2a64'];
  const K0 = 150; // px: circumradius of band 0 at the start
  const ratio = 1 / Math.sqrt(3);
  const copies = [];
  for (let k = -3; k <= 20; k++) {
    const sc = (K0 / (r * S)) * Math.pow(ratio, k);
    copies.push(`<use href="#flake" fill="${BANDS[mod(k, 8)]}" transform="rotate(${30 * k}) scale(${sc.toPrecision(4)})"/>`);
  }
  const N = 32;
  const zoomVals = Array.from({ length: N + 1 }, (_, i) => f3(Math.pow(Math.sqrt(3), (8 * i) / N))).join(';');
  body.push(`<g display="none">${showDuring(3)}<rect width="${W}" height="${H}" fill="${BANDS[mod(-3, 8)]}"/>`);
  body.push(`<g transform="translate(${CX} 76)" shape-rendering="crispEdges"><g>`
    + `<animateTransform attributeName="transform" type="scale" dur="${DUR}s" repeatCount="indefinite" values="${zoomVals}"/>`
    + `<animateTransform attributeName="transform" type="rotate" additive="sum" dur="${DUR}s" repeatCount="indefinite" values="0;-240"/>`
    + copies.join('') + '</g></g>');
  body.push('<use href="#logo" y="7"/>');
  body.push(text('PART 4 OF 4: FRACTAL COASTLINE', CAP_L, CAP_T));
  body.push(text('THE COAST GETS LONGER EVERY TIME YOU LOOK.', CAP_L, CAP_B));
  ['1X', '3X', '9X', '27X'].forEach((z, k) => {
    body.push(`<g display="none">${window_(a + k * 1.5, a + (k + 1) * 1.5)}${text(`ZOOM ${z}`, CAP_R, CAP_T, { align: 'r' })}</g>`);
  });
  body.push('</g>');
}
body.push('</g>');

defs.push(glyphDefs());
const desc = 'CASTAWAY, presented by CORAL DAC as a four-part VGA demo that loops every 30 seconds. '
  + 'Part 1, voxel island: a sunny sea, hazy islands on the horizon, a rocky islet and a tiny sand island with one tall palm, '
  + 'a raft and a young woman in a coral tank top, cream shorts and headphones, nodding to the beat, while the camera slides sideways and every island '
  + 'slides at its own speed. A bottle drifts away from her island and floats straight back. The name CASTAWAY hangs in the sky in 3D block letters '
  + 'over the line A TEN-HOUR LO-FI ISLAND VIDEO. Part 2, fire by friction: the name as charred firewood standing in pixel flames on black: '
  + 'IT IS STILL DAYTIME. THE SCREEN IS JUST BLACK. Part 3, shade bobs: a coral blob jogs laps and its trail builds into glowing knots '
  + 'behind the name, cut out in black. Part 4, fractal coastline: an endless spinning zoom into nested snowflake islands in coastal colours: '
  + 'THE COAST GETS LONGER EVERY TIME YOU LOOK.';
const svg = [
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W * 3}" height="${H * 3}" role="img" aria-labelledby="t d">`,
  `<title id="t">CASTAWAY</title><desc id="d">${desc}</desc>`,
  `<style>${css.join('\n')}\n@media (prefers-reduced-motion:reduce){*{animation:none!important}.anim{display:none}}</style>`,
  `<defs>${defs.join('')}<clipPath id="scr"><rect width="${W}" height="${H}" rx="4"/></clipPath></defs>`,
  `<g clip-path="url(#scr)"><rect width="${W}" height="${H}" fill="#000"/>`,
  ...body,
  // a thin dark frame, so the screen's edge reads on light and dark pages alike
  `</g><rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="3.6" fill="none" stroke="#0a1430"/></svg>`,
].join('\n') + '\n';
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, svg);
console.log(`wrote ${path.relative(process.cwd(), OUT)} (${(svg.length / 1024).toFixed(1)} KB)`);
console.log(sizes.map(([n, b]) => `${n} ${b}`).join(', '));

if (DEBUG) {
  fs.mkdirSync(DEBUG, { recursive: true });
  for (const [name, img] of debugImgs) {
    const S = 4, o = new Img(img.w * S, img.h * S);
    for (let y = 0; y < o.h; y++) for (let x = 0; x < o.w; x++) {
      const i = (Math.floor(y / S) * img.w + Math.floor(x / S)) * 4, j = (y * o.w + x) * 4;
      const a = img.d[i + 3];
      const bg = ((x >> 3) + (y >> 3)) & 1 ? 200 : 160;
      for (let c = 0; c < 3; c++) o.d[j + c] = a ? img.d[i + c] : bg;
      o.d[j + 3] = 255;
    }
    fs.writeFileSync(path.join(DEBUG, `${name}.png`), pngOf(o));
  }
}
