#!/usr/bin/env node
// 01-mode7-island_opus_5.5: the "Mode 7 Island" README header for Castaway
// (catalogue entry mach-15: the early-1990s 16-bit console trick of rotating
// and scaling one flat background layer, with a different scale on every
// scanline, so that a flat map becomes a ground plane running to a horizon).
//
// The banner is one 256x144 frame, the native width of that era's consoles:
//   * sky: flat stepped bands, a strip of pixel clouds, the CASTAWAY title
//     card and status text, none of which rotate;
//   * floor: ONE flat map (an island seen from straight above, with the name
//     spelled across its sand twice, back to back) drawn 48 times, once per
//     2-pixel strip. Each strip clips its copy and gives it a fixed scale that
//     grows linearly with distance below the horizon, and every copy shares the
//     same camera keyframes (orbit, swoop, drift). That is the hardware trick,
//     done literally: a per-scanline affine transform of one layer;
//   * sprites: the palm, her, a passing ship and a delivery drone are flat
//     pictures drawn on top. They move and scale with the map, never rotate.
//
// The map texture and the sprites are tiny palette PNGs, encoded by this file
// (zlib from Node itself) and embedded as data: URIs, drawn with nearest-
// neighbour sampling so texels stay square and chunky near the camera and
// shimmer at the horizon. Letters everywhere come from the pixel fonts below:
// no <text>, no fonts, nothing external.
//
// One loop is 60 seconds: the length of the project's music loop, 20 bars of
// 3 seconds at 80 BPM. The camera circles the island once. Her routine and the
// status text change on bar lines, and she nods on every beat.
//
//   node 01-mode7-island_opus_5.5.mjs                write the SVG
//   node 01-mode7-island_opus_5.5.mjs --at=12 --out=f.svg
//                                                    write a frozen frame at 12 s
//   node 01-mode7-island_opus_5.5.mjs --sheet=dir    write the sprites as big PNGs
//
// Plain Node, no dependencies. Deterministic: randomness is a seeded PRNG.

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '01-mode7-island_opus_5.5';
const argv = process.argv.slice(2);
const opt = (k) => { const a = argv.find((s) => s.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : null; };
const AT = opt('at') !== null ? Number(opt('at')) : null;
const OUT = opt('out') || path.join(HERE, '..', 'assets', `${SLUG}.svg`);

// ------------------------------------------------------------------ frame
const T = 60;                         // seconds per loop (= one music loop)
const BAR = 3, BEAT = 0.75;           // 80 BPM, 4 beats to the bar
const W = 256, H = 144;
const H0 = 48;                        // horizon scanline
const F = (4 * 256) / (2 * Math.PI);  // focal length: one orbit scrolls the clouds 4 x 256 px
const CAMH = 30;                      // camera height in map units
const K = CAMH * F;
const STRIP = 2;                      // scanlines per strip
const NS = 60;                        // camera keyframes per loop

// The camera: circles the island once per loop, comes in closer twice (when
// one of the two painted names faces it), and drifts a little side to side.
function cam(t) {
  const u = t / T;
  return {
    phi: 360 * u,
    z0: 108 - 12 * Math.cos(2 * Math.PI * 2 * u),
    x0: 9 * Math.sin(2 * Math.PI * u),
  };
}
// Where a map point lands on screen at time t (same maths as the strips).
function project(px, py, t) {
  const c = cam(t);
  const a = (c.phi * Math.PI) / 180;
  const rx = px * Math.cos(a) - py * Math.sin(a);
  const ry = px * Math.sin(a) + py * Math.cos(a);
  const qx = rx + c.x0, qy = ry - c.z0;
  const d = -qy;
  return { x: W / 2 + (F * qx) / d, y: H0 + K / d, d, k: F / d };
}

// ------------------------------------------------------------------ helpers
const r2 = (v) => +v.toFixed(2);
const r3 = (v) => +v.toFixed(3);
function mulberry32(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const hash = (x, y, s = 0) => {
  let h = (x * 374761393 + y * 668265263 + s * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

// ---------------------------------------------------------------- PNG out
const CRC = new Uint32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
function crc32(buf) { let c = 0xffffffff; for (const b of buf) c = CRC[(c ^ b) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
// idx: Uint8Array of palette indices; palette[0] is transparent.
function encodePng(w, h, idx, palette) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 3;
  const plte = Buffer.alloc(palette.length * 3), trns = Buffer.alloc(palette.length);
  palette.forEach((c, i) => {
    if (!c) return;
    plte[i * 3] = parseInt(c.slice(1, 3), 16); plte[i * 3 + 1] = parseInt(c.slice(3, 5), 16); plte[i * 3 + 2] = parseInt(c.slice(5, 7), 16);
    trns[i] = 255;
  });
  const raw = Buffer.alloc((w + 1) * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) raw[y * (w + 1) + 1 + x] = idx[y * w + x];
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr), chunk('PLTE', plte), chunk('tRNS', trns),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0)),
  ]);
}
const dataUri = (buf) => `data:image/png;base64,${buf.toString('base64')}`;

// A small indexed canvas for sprites. Colours are added to its palette on use.
class Pix {
  constructor(w, h) { this.w = w; this.h = h; this.d = new Array(w * h).fill(null); }
  set(x, y, c) { x = Math.round(x); y = Math.round(y); if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.d[y * this.w + x] = c; }
  get(x, y) { return x >= 0 && y >= 0 && x < this.w && y < this.h ? this.d[y * this.w + x] : null; }
  rows(rows, map, ox = 0, oy = 0) {
    rows.forEach((row, y) => [...row].forEach((ch, x) => { if (map[ch]) this.set(ox + x, oy + y, map[ch]); }));
    return this;
  }
  // 4-neighbour outline in a dark colour: the cheap trick that makes small
  // sprites read on any background.
  outline(col) {
    const o = new Pix(this.w + 2, this.h + 2);
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) if (this.get(x, y)) o.set(x + 1, y + 1, this.get(x, y));
    const add = [];
    for (let y = 0; y < o.h; y++) for (let x = 0; x < o.w; x++) {
      if (o.get(x, y)) continue;
      if (o.get(x - 1, y) || o.get(x + 1, y) || o.get(x, y - 1) || o.get(x, y + 1)) add.push([x, y]);
    }
    add.forEach(([x, y]) => o.set(x, y, col));
    return o;
  }
  png() {
    const pal = [null]; const ix = new Map();
    const idx = new Uint8Array(this.w * this.h);
    this.d.forEach((c, i) => { if (!c) return; if (!ix.has(c)) { ix.set(c, pal.length); pal.push(c); } idx[i] = ix.get(c); });
    return encodePng(this.w, this.h, idx, pal);
  }
  scaled(s) {
    const o = new Pix(this.w * s, this.h * s);
    for (let y = 0; y < o.h; y++) for (let x = 0; x < o.w; x++) o.d[y * o.w + x] = this.d[Math.floor(y / s) * this.w + Math.floor(x / s)];
    return o;
  }
}

// Merge a bitmap into horizontal runs, one path per colour (for crisp vector
// pixels in the sky layer: title, status text, clouds).
function runsToPaths(pix, ox = 0, oy = 0) {
  const byCol = new Map();
  for (let y = 0; y < pix.h; y++) {
    let x = 0;
    while (x < pix.w) {
      const c = pix.get(x, y);
      if (!c) { x++; continue; }
      let e = x; while (e < pix.w && pix.get(e, y) === c) e++;
      if (!byCol.has(c)) byCol.set(c, []);
      byCol.get(c).push(`M${ox + x} ${oy + y}h${e - x}v1h${x - e}z`);
      x = e;
    }
  }
  return [...byCol].map(([c, d]) => `<path fill="${c}" d="${d.join('')}"/>`).join('');
}

// ------------------------------------------------------------------ fonts
// Small 5x7 face for the status text and for the letters painted on the map.
const FONT5 = {
  A: '.###.|#...#|#...#|#####|#...#|#...#|#...#', B: '####.|#...#|####.|#...#|#...#|#...#|####.',
  C: '.####|#....|#....|#....|#....|#....|.####', D: '####.|#...#|#...#|#...#|#...#|#...#|####.',
  E: '#####|#....|####.|#....|#....|#....|#####', F: '#####|#....|####.|#....|#....|#....|#....',
  G: '.####|#....|#....|#.###|#...#|#...#|.####', H: '#...#|#...#|#####|#...#|#...#|#...#|#...#',
  I: '#####|..#..|..#..|..#..|..#..|..#..|#####', J: '..###|...#.|...#.|...#.|...#.|#..#.|.##..',
  K: '#...#|#..#.|###..|#..#.|#...#|#...#|#...#', L: '#....|#....|#....|#....|#....|#....|#####',
  M: '#...#|##.##|#.#.#|#...#|#...#|#...#|#...#', N: '#...#|##..#|#.#.#|#..##|#...#|#...#|#...#',
  O: '.###.|#...#|#...#|#...#|#...#|#...#|.###.', P: '####.|#...#|#...#|####.|#....|#....|#....',
  Q: '.###.|#...#|#...#|#...#|#.#.#|#..#.|.##.#', R: '####.|#...#|#...#|####.|#..#.|#...#|#...#',
  S: '.####|#....|#....|.###.|....#|....#|####.', T: '#####|..#..|..#..|..#..|..#..|..#..|..#..',
  U: '#...#|#...#|#...#|#...#|#...#|#...#|.###.', V: '#...#|#...#|#...#|#...#|.#.#.|.#.#.|..#..',
  W: '#...#|#...#|#...#|#.#.#|#.#.#|##.##|#...#', X: '#...#|#...#|.#.#.|..#..|.#.#.|#...#|#...#',
  Y: '#...#|#...#|.#.#.|..#..|..#..|..#..|..#..', Z: '#####|....#|...#.|..#..|.#...|#....|#####',
  0: '.###.|#..##|#.#.#|#.#.#|##..#|#...#|.###.', 1: '..#..|.##..|..#..|..#..|..#..|..#..|.###.',
  2: '.###.|#...#|....#|..##.|.#...|#....|#####', 3: '####.|....#|....#|.###.|....#|....#|####.',
  4: '#...#|#...#|#...#|#####|....#|....#|....#', 5: '#####|#....|####.|....#|....#|#...#|.###.',
  6: '.###.|#....|####.|#...#|#...#|#...#|.###.', 7: '#####|....#|...#.|..#..|..#..|..#..|..#..',
  8: '.###.|#...#|#...#|.###.|#...#|#...#|.###.', 9: '.###.|#...#|#...#|.####|....#|....#|.###.',
  ':': '.....|..#..|..#..|.....|..#..|..#..|.....', '/': '....#|...#.|...#.|..#..|.#...|.#...|#....',
  '-': '.....|.....|.....|.###.|.....|.....|.....', '.': '.....|.....|.....|.....|.....|.....|..#..',
  '!': '..#..|..#..|..#..|..#..|..#..|.....|..#..', ' ': '.....|.....|.....|.....|.....|.....|.....',
};
const glyph5 = (ch) => (FONT5[ch] || FONT5[' ']).split('|');
const textW = (s) => s.length * 6 - 1;     // 5px glyphs on a 6px advance

// Title face: chunky original capitals, 16 rows, 4px strokes (only the
// letters the name needs).
const TITLE = {
  C: ['....######....', '..##########..', '.####....####.', '####......####', '####..........', '####..........', '####..........', '####..........',
    '####..........', '####..........', '####..........', '####......####', '####......####', '.####....####.', '..##########..', '....######....'],
  A: ['....######....', '..##########..', '.####....####.', '####......####', '####......####', '####......####', '####......####', '##############',
    '##############', '####......####', '####......####', '####......####', '####......####', '####......####', '####......####', '####......####'],
  S: ['...#########..', '.############.', '#####....#####', '####......###.', '####..........', '#####.........', '.##########...', '..###########.',
    '.....#########', '..........####', '..........####', '.###......####', '#####.....####', '#####....#####', '.############.', '..#########...'],
  T: ['##############', '##############', '##############', '.....####.....', '.....####.....', '.....####.....', '.....####.....', '.....####.....',
    '.....####.....', '.....####.....', '.....####.....', '.....####.....', '.....####.....', '.....####.....', '.....####.....', '.....####.....'],
  W: ['####..........####', '####..........####', '####..........####', '####..........####', '####..........####', '####..........####', '####...####...####', '####...####...####',
    '####...####...####', '####...####...####', '####..######..####', '####.###..###.####', '#######....#######', '######......######', '#####........#####', '.###..........###.'],
  Y: ['####......####', '####......####', '####......####', '####......####', '####......####', '#####....#####', '.############.', '..##########..',
    '....######....', '.....####.....', '.....####.....', '.....####.....', '.....####.....', '.....####.....', '.....####.....', '.....####.....'],
};

// ---------------------------------------------------------------- palette
const P = {
  navy: '#17203f', ink: '#2a1c24',
  sky: ['#2d6fd3', '#3a83e0', '#4d98ea', '#66adf1', '#86c3f6', '#a9d7fa', '#cbe9fc'],
  cloud: '#ffffff', cloud2: '#e2f1fd', cloud3: '#bcdcf6',
  sea: '#1661bd', sea2: '#1b6cca', crest: '#5aa6ea', crestHi: '#cfeaff',
  sh: ['#7fe6d5', '#45d0c9', '#2bb4cd', '#2192cd'], foam: '#f5fdff',
  wet: '#dcbc84', sand: '#f3dfad', sand2: '#e9d29d', sandHi: '#fbeecb', shade: '#cdae76',
  let: '#ff6a55', letHi: '#ff9a7c', letLo: '#b9443a', letShade: '#d1584a',
  bush: ['#1f6a33', '#2f8a3f', '#4aab4a', '#8bd468'],
  rock: ['#5d646e', '#7f8893', '#a7afb8'],
  log: ['#6b3a22', '#92522f', '#b56d43'], rope: '#e7cf96',
  turtle: ['#3e6b2b', '#5d8f3c', '#8cc06a', '#c9e89a'],
  glass: '#3f9d6b', glassHi: '#a6e6c0', cork: '#b07a45', paper: '#fff4dc',
  fire: ['#ff8a2a', '#ffd34d'], ash: '#6d6a66',
  leaf: ['#3b8f3b', '#6fc256'],
  hud: '#fff6dc', hudDim: '#244a86', hudHi: '#ffcf5a', hudCoral: '#ff7a5c',
};

// ================================================================= THE MAP
// One flat picture, 1 texel = 1 map unit, island centre at (0,0), +y is
// south. The camera starts due south, so the south name reads first.
const MAPN = 176, MC = MAPN / 2;
const MP = [null]; const MPI = new Map();
const mc = (hex) => { if (!MPI.has(hex)) { MPI.set(hex, MP.length); MP.push(hex); } return MPI.get(hex); };
const map = new Uint8Array(MAPN * MAPN);
const shore = (th) => 54 + 2.2 * Math.sin(3 * th + 0.7) + 1.3 * Math.sin(5 * th + 2.1) + 0.8 * Math.sin(9 * th + 0.3);
const WORD_Y0 = 10, WORD_Y1 = 24;   // the names sit 10..24 units either side of the palm
const PALM = { x: 3, y: -2 };
// She stands west of the palm, far enough out that (a) she has already crossed
// behind the trunk before her coconut starts at 18 s, and (b) when the ship
// passes behind her head at about 31 s the palm's crown is well clear of it.
const HER = { x: -20, y: -4 };

// painted name: 5x7 glyphs, each glyph pixel 2x2 texels, 12 units per letter
function wordAt(lx, ly) {
  // lx, ly in the word's own frame: x from -47..47, y from 0 (top) to 14 (bottom)
  const NAME = 'CASTAWAY';
  const span = NAME.length * 12 - 2;
  const x = lx + span / 2;
  if (x < -1 || x >= span + 1 || ly < -1 || ly >= 15) return null;
  const li = Math.floor((x + 1) / 12);
  const inX = x - li * 12;
  const gx = Math.floor(inX / 2), gy = Math.floor(ly / 2);
  const on = (gx2, gy2) => {
    if (gx2 < 0 || gx2 > 4 || gy2 < 0 || gy2 > 6) return false;
    return glyph5(NAME[li] || ' ')[gy2][gx2] === '#';
  };
  if (inX >= 0 && inX < 10 && ly >= 0 && ly < 14 && on(gx, gy)) {
    // top-left texel row of each stroke catches the light
    const top = !on(gx, Math.floor((ly - 1) / 2)) && ly % 2 === 0;
    return top ? 'hi' : 'fill';
  }
  // 1-texel dark rim below and right of strokes: letters laid in coral shells
  // and seaglass, slightly proud of the sand
  const below = on(Math.floor((inX - 1) / 2), Math.floor((ly - 1) / 2)) && inX - 1 >= 0 && inX - 1 < 10 && ly - 1 >= 0 && ly - 1 < 14;
  const left = on(Math.floor((inX - 1) / 2), gy) && inX - 1 >= 0 && inX - 1 < 10 && ly >= 0 && ly < 14;
  const up = on(gx, Math.floor((ly - 1) / 2)) && inX >= 0 && inX < 10 && ly - 1 >= 0 && ly - 1 < 14;
  if (below || left || up) return 'rim';
  return null;
}

function texel(x, y, ix, iy) {
  const r = Math.hypot(x, y), th = Math.atan2(y, x);
  const rs = shore(th);
  const dist = r - rs;
  const chk = (ix + iy) & 1;
  // ---- water
  if (dist >= 0) {
    if (dist > 24) return null;
    if (dist > 21) return chk ? mc(P.sh[3]) : null;              // dithered into the open sea
    if (dist < 1.4) return hash(ix, iy, 3) < 0.8 ? mc(P.foam) : mc(P.sh[0]);
    const bands = [1.4, 5, 10, 16, 21];
    for (let b = 0; b < 4; b++) {
      if (dist < bands[b + 1]) {
        const edge = bands[b + 1] - dist < 1.2 && b < 3;
        return mc(P.sh[edge && chk ? b + 1 : b]);
      }
    }
    return mc(P.sh[3]);
  }
  // ---- sand
  let c = dist > -3 ? (dist > -1.3 && chk ? P.sh[0] : P.wet) : (hash(ix, iy, 1) < 0.07 ? P.sand2 : hash(ix, iy, 2) < 0.04 ? P.sandHi : P.sand);
  // two names, back to back: south one reads from the south, north one from the north
  if (Math.abs(y) >= WORD_Y0 - 1 && Math.abs(y) < WORD_Y1 + 1) {
    const south = y > 0;
    const w = south ? wordAt(x, y - WORD_Y0) : wordAt(-x, -y - WORD_Y0);
    if (w === 'fill') c = P.let;
    else if (w === 'hi') c = P.letHi;
    else if (w === 'rim') c = P.letLo;
  }
  return mc(c);
}

for (let iy = 0; iy < MAPN; iy++) for (let ix = 0; ix < MAPN; ix++) {
  const v = texel(ix - MC + 0.5, iy - MC + 0.5, ix, iy);
  map[iy * MAPN + ix] = v === null ? 0 : v;
}
// stamps on top of the base map
function mset(x, y, hex) { const ix = Math.round(x + MC - 0.5), iy = Math.round(y + MC - 0.5); if (ix >= 0 && iy >= 0 && ix < MAPN && iy < MAPN) map[iy * MAPN + ix] = mc(hex); }
function mget(x, y) { const ix = Math.round(x + MC - 0.5), iy = Math.round(y + MC - 0.5); return MP[map[iy * MAPN + ix]]; }
function mstamp(rows, cmap, x0, y0) { rows.forEach((row, y) => [...row].forEach((ch, x) => { if (cmap[ch]) mset(x0 + x, y0 + y, cmap[ch]); })); }
// the palm's shadow on the sand: trunk then crown, thrown north-east
const DARKER = { [P.sand]: P.shade, [P.sand2]: P.shade, [P.sandHi]: P.shade, [P.wet]: '#c4a26a', [P.let]: P.letShade, [P.letHi]: P.letShade, [P.letLo]: '#8f3330' };
function shadeAt(x, y) { const c = mget(x, y); if (DARKER[c]) mset(x, y, DARKER[c]); }
{
  // sun in the south-west: the trunk's shadow runs north-east, the crown's
  // shadow is a ring of frond-shaped ellipses at its end
  const SUN = { x: 0.86, y: -0.5 };
  for (let s = 0; s <= 30; s += 0.25) for (let w = -1.1; w <= 1.1; w += 0.5) {
    const width = 1.1 - s / 60;
    if (Math.abs(w) > width) continue;
    shadeAt(PALM.x + SUN.x * s - SUN.y * w, PALM.y + SUN.y * s + SUN.x * w);
  }
  const cx = PALM.x + SUN.x * 31, cy = PALM.y + SUN.y * 31;
  for (let y = -16; y <= 16; y++) for (let x = -16; x <= 16; x++) {
    let inside = Math.hypot(x, y) < 3;
    for (let k = 0; k < 9 && !inside; k++) {
      const ang = (k / 9) * Math.PI * 2 + 0.2;
      const len = 11 + 2 * Math.sin(k * 2.3);
      const u = x * Math.cos(ang) + y * Math.sin(ang), v = -x * Math.sin(ang) + y * Math.cos(ang);
      if (u > 0 && u < len && Math.abs(v) < 2.6 * Math.sin((Math.PI * u) / len) + 0.3) inside = true;
    }
    if (inside) shadeAt(cx + x, cy + y);
  }
}
for (let yy = -1; yy <= 1; yy++) for (let xx = -2; xx <= 3; xx++) if (Math.abs(xx - 0.5) + Math.abs(yy) * 2 < 3.5) shadeAt(HER.x + 2 + xx, HER.y - 1 + yy);
// bushes, as in the real scene: a cluster west of the palm and one east
function bush(cx, cy, rad, seed) {
  const rnd = mulberry32(seed);
  const blobs = Array.from({ length: 6 }, () => [cx + (rnd() - 0.5) * rad * 1.6, cy + (rnd() - 0.5) * rad * 1.2, rad * (0.45 + rnd() * 0.35)]);
  for (let y = -rad - 2; y <= rad + 2; y++) for (let x = -rad - 3; x <= rad + 3; x++) {
    const px = cx + x, py = cy + y;
    let best = 9;
    blobs.forEach(([bx, by, br]) => { best = Math.min(best, Math.hypot(px - bx, py - by) / br); });
    if (best > 1) continue;
    let k = best > 0.8 ? 1 : best > 0.45 ? 2 : 3;
    const lit = (px - cx) + (py - cy) < 0;          // light from the north-west... the sun
    if (!lit && k === 3) k = 2;
    if (lit && k === 1 && hash(px | 0, py | 0, 7) < 0.5) k = 2;
    mset(px, py, P.bush[k]);
  }
  blobs.forEach(([bx, by, br]) => { mset(bx + br * 0.7, by + br * 0.8, P.bush[0]); });
}
bush(-35, -2, 6, 11); bush(-29, 5, 3, 12); bush(20, 4, 4, 13); bush(-8, -7, 3, 14);
// rocks on the shore
const ROCK = { a: P.rock[0], b: P.rock[1], c: P.rock[2] };
mstamp(['.ccb.', 'cbbba', 'bbbaa', '.aaa.'], ROCK, 30, 40);
mstamp(['.cb.', 'bbba', '.aa.'], ROCK, 36, 37);
mstamp(['.ccb.', 'cbbba', '.baa.'], ROCK, -46, -24);
// the raft, moored off the east shore: five logs and two rope bands
for (let i = 0; i < 5; i++) {
  for (let x = 0; x < 20; x++) {
    const yy = -6 + i * 3;
    const xx = 57 + x;
    const rope = x === 4 || x === 15;
    mset(xx, yy, rope ? P.rope : P.log[2]);
    mset(xx, yy + 1, rope ? P.rope : P.log[1]);
    mset(xx, yy + 2, P.log[0]);
  }
  mset(56, -6 + i * 3 + 1, P.log[2]); mset(77, -6 + i * 3 + 1, P.log[1]);
}
// a visiting sea turtle in the south-west shallows
mstamp([
  '..ff........',
  '...ff.......',
  '..ssssss....',
  '.sSsSSsSs.hh',
  '.sSSsSSssshh',
  '.sSsSSsSs.hh',
  '..ssssss....',
  '...ff.......',
  '..ff........',
], { s: P.turtle[1], S: P.turtle[0], f: P.turtle[2], h: P.turtle[3] }, -66, 24);
// the message in a bottle, bobbing north-east
mstamp(['.ww...', 'gGggk.', 'gggggk', '.ggg..'], { g: P.glass, G: P.glassHi, k: P.cork, w: P.paper }, 40, -48);
// fire pit (bushcraft): stones round two crossed sticks and a small flame
mstamp([
  '..rrr..',
  '.r.l.r.',
  'r.lyl.r',
  'r.oyo.r',
  'r.lol.r',
  '.r...r.',
  '..rrr..',
], { r: P.rock[1], l: P.log[1], o: P.fire[0], y: P.fire[1] }, -20, 30);
// the sandcastle the tide is coming for
mstamp([
  'w.w.w.w',
  'wwwwwww',
  'wSSSSSw',
  'wSwwwSw',
  'wSwswSw',
  'wSSSSSw',
  'wwwwwww',
], { w: P.sandHi, S: P.shade, s: P.let }, 12, 30);
// the kumara patch, north side
for (let i = 0; i < 4; i++) mstamp(['.l.', 'lLl', '.l.'], { l: P.leaf[0], L: P.leaf[1] }, -16 + i * 5, -36 + (i % 2));
// jogging laps: footprints round the island
for (let a = 0; a < 360; a += 4.2) {
  const th = (a * Math.PI) / 180, rr = shore(th) - 6.5;
  const side = Math.round(a / 4.2) % 2 ? 0.8 : -0.8;
  const fx = Math.cos(th) * (rr + side), fy = Math.sin(th) * (rr + side);
  const cur = mget(fx, fy);
  if (cur === P.sand || cur === P.sand2 || cur === P.sandHi) mset(fx, fy, P.wet);
}
const mapPng = encodePng(MAPN, MAPN, map, MP);

// ================================================================= SPRITES
const WPP = 0.62;   // map units per sprite pixel (sprites share one pixel size)

// --- her: front view, 11 x 20 before the outline. Brown hair in a low bun,
// cream headphones, coral tank top, cream shorts, bare feet.
const HC = {
  h: '#6b3f25', H: '#8e5a36', s: '#f4c6a2', S: '#d99a7a', p: '#f7eed8', P: '#c9b893',
  t: '#f47a62', T: '#cf5948', c: '#f0e4c8', C: '#c9bb98', e: '#3a2630', m: '#c86a5a',
  n: '#8a5a2b', N: '#5e3a1a', w: '#ffffff', g: '#7cc65a', v: '#4a8a32', u: '#eef3cf',
};
const HER_HEAD = [
  '...ppppp...',
  '..phhhhhp..',
  '.phhhhhhhp.',
  '.PhshhhshP.',
  '.PsssssssP.',
  '.PsesssesP.',
  '..sssmsss..',
  '...sssss.hh',
  '....sSs..hh',
];
const HER_BODY = [
  '..ttttttt..',
  '..ttttttt..',
  '..TtttttT..',
  '...ttttt...',
  '...TtttT...',
  '...ccccc...',
  '...ccCcc...',
  '...cC.Cc...',
  '...ss.ss...',
  '...ss.ss...',
  '..sss.sss..',
];
// frames share one 13 x 24 canvas (room above the head for waving arms);
// the body is drawn at (1, 4) and the feet stay on the bottom row
function herFrame(kind, nod) {
  const p = new Pix(13, 24);
  const OX = 1, OY = 4;
  const at = (x, y, c) => p.set(OX + x, OY + y, c);
  const line = (x0, y0, x1, y1, c) => {
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
    for (let i = 0; i <= n; i++) at(Math.round(x0 + ((x1 - x0) * i) / n), Math.round(y0 + ((y1 - y0) * i) / n), c);
  };
  p.rows(HER_BODY, HC, OX, OY + 9);
  const arm = (side, kindA) => {
    const sx = side < 0 ? 1 : 9;
    if (kindA === 'down') { line(sx, 9, sx, 13, HC.s); at(sx, 14, HC.S); }
    if (kindA === 'out') { line(sx, 9, sx + side * 2, 2, HC.s); line(sx + side * 2, 2, sx + side * 2, -2, HC.s); at(sx + side * 2, -3, HC.S); }
    // arms crossed high over her head: with 'out' this makes the big
    // Y-then-X wave of someone trying to flag down a ship
    if (kindA === 'cross') {
      const ex = sx + side * 2, hx = side < 0 ? 7 : 3;
      line(sx, 9, ex, 2, HC.s); line(ex, 2, ex, 0, HC.s); line(ex, 0, hx, -4, HC.s); at(hx, -4, HC.S);
    }
  };
  const eyesClosed = kind === 'sip1' || kind === 'sip2';
  if (kind === 'idle') { arm(-1, 'down'); arm(1, 'down'); }
  if (kind === 'wave1') { arm(-1, 'out'); arm(1, 'out'); }
  if (kind === 'wave2') { arm(-1, 'cross'); arm(1, 'cross'); }
  const head = HER_HEAD.map((r) => (eyesClosed ? r.replace(/e/g, 'S') : r));
  p.rows(head, HC, OX, OY + (nod ? 1 : 0));
  if (nod) p.rows(['....sSs....'], HC, OX, OY + 9);
  // A green drinking coconut with a straw, always held BELOW her chin. (A
  // brown coconut over her mouth read as a beard at this size, and a bearded
  // castaway is the one figure this header must never draw.)
  const COCO = ['.uuu.', 'gggvg', 'ggvgv', '.vvv.'];
  if (kind === 'sip1') {
    // sipping: both hands on it, up under her chin, straw at her mouth
    line(1, 9, 1, 11, HC.s); at(2, 10, HC.S); line(9, 9, 9, 11, HC.s); at(8, 10, HC.S);
    p.rows(COCO, HC, OX + 3, OY + 8);
    at(6, 7, HC.w);
  }
  if (kind === 'sip2') {
    // between sips: lowered to her waist, straw sticking up
    line(1, 9, 1, 12, HC.s); at(2, 12, HC.S); line(9, 9, 9, 12, HC.s); at(8, 12, HC.S);
    p.rows(COCO, HC, OX + 3, OY + 11);
    at(6, 10, HC.w); at(6, 9, HC.w);
  }
  return p.outline(P.ink);
}
const HER_FRAMES = {
  idleA: herFrame('idle', false), idleB: herFrame('idle', true),
  sip1: herFrame('sip1', false), sip2: herFrame('sip2', false),
  wave1: herFrame('wave1', false), wave2: herFrame('wave2', false),
};

// --- the palm: drawn procedurally. A slender curved trunk with segment rings
// and a crown of drooping fronds.
function drawPalm() {
  const p = new Pix(50, 62);
  const bx = 19, by = 61, top = { x: 25, y: 17 };
  const bark = ['#6e3b26', '#9a5a3a', '#bf7a4f', '#d79a68'];
  for (let i = 0; i <= 200; i++) {
    const t = i / 200;
    const x = bx + (top.x - bx) * Math.pow(t, 1.7) - 2.5 * Math.sin(Math.PI * t);
    const y = by - (by - top.y) * t;
    const w = 2.3 - 0.9 * t;
    const ring = Math.round(y) % 4 === 0;
    for (let dx = -Math.ceil(w); dx <= Math.ceil(w); dx++) {
      if (Math.abs(dx) > w + 0.2) continue;
      let k = dx < -w + 1 ? 2 : dx > w - 1.2 ? 0 : 1;
      if (dx === -1 && !ring) k = 3;
      if (ring) k = Math.max(0, k - 1);
      p.set(x + dx, y, bark[k]);
    }
  }
  const G = ['#185228', '#2a7f37', '#47a845', '#8fd862'];
  // nine fronds, back to front: a = direction (0 = right, -90 = up),
  // L = reach, droop = how far the tip falls, tone = 0 back / 1 front
  const fronds = [
    { a: -150, L: 15, droop: 13, tone: 0 }, { a: -30, L: 15, droop: 13, tone: 0 }, { a: -104, L: 11, droop: 2, tone: 0 }, { a: -76, L: 11, droop: 2, tone: 0 },
    { a: -122, L: 15, droop: 5, tone: 1 }, { a: -58, L: 15, droop: 5, tone: 1 },
    { a: 162, L: 15, droop: 13, tone: 1 }, { a: 18, L: 15, droop: 13, tone: 1 },
    { a: -176, L: 20, droop: 10, tone: 1 }, { a: -4, L: 20, droop: 10, tone: 1 },
  ];
  fronds.forEach((f) => {
    const a = (f.a * Math.PI) / 180;
    const steps = Math.round(f.L * 3);
    let prev = null;
    for (let i = 0; i <= steps; i++) {
      const s = i / steps;
      const x = top.x + Math.cos(a) * f.L * s;
      const y = top.y + Math.sin(a) * f.L * s * 0.55 + f.droop * s * s;
      const px = Math.round(x);
      if (prev === px && i < steps) continue;      // one leaflet per column
      prev = px;
      // leaflets hang below the rib; every other one is shorter, which gives
      // the frond its feathered edge
      const full = 3.4 * Math.sin(Math.PI * Math.min(1, 0.15 + s * 0.95)) * (1 - 0.3 * s);
      const len = Math.max(1, Math.round(px % 2 ? full : full - 1.2));
      for (let l = -1; l <= len; l++) {
        if (l === -1 && s > 0.6) continue;
        let k = l <= -1 ? 3 : l === 0 ? 2 : l >= len - 0 ? 0 : 1;
        if (!f.tone) k = Math.max(0, k - 1);
        p.set(px, Math.round(y) + l, G[k]);
      }
    }
  });
  // coconuts tucked under the crown
  [[23, 18], [26, 19], [24, 20]].forEach(([x, y]) => {
    p.set(x, y, '#7a4a22'); p.set(x + 1, y, '#5a3416'); p.set(x, y + 1, '#5a3416'); p.set(x + 1, y + 1, '#3f230e');
  });
  return { pix: p.outline(P.ink), foot: bx + 1 };
}
const PALM_S = drawPalm();

// --- the ship that always passes while she's busy. Side view, bow right.
const SHIP = new Pix(30, 15).rows([
  '................gg............',
  '..............ggg.............',
  '...............gg.............',
  '..............yy..............',
  '..............rr..............',
  '..........wwwwwwwwwww.........',
  '.........wkwkwkwkwkwkw........',
  '......wwwwwwwwwwwwwwwwwww.....',
  '.....wwkwkwkwkwkwkwkwkwkww....',
  'nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn',
  '.nnnnnnnnnnnnnnnnnnnnnnnnnnnn.',
  '..nnnnnnnnnnnnnnnnnnnnnnnnnn..',
  '...RRRRRRRRRRRRRRRRRRRRRRRR...',
  '..ffff..ff.......ff....ffff...',
  '..............................',
], { g: '#dfe7ef', y: '#ffd04d', r: '#e2483c', w: '#f6f6f0', k: '#3b5a8a', n: '#23305c', R: '#d2453a', f: '#e8f6ff' }).outline(P.ink);

// --- the delivery drone (the camera's "vehicle"), seen from behind, with
// its parcel: a second pair of headphones, for someone who has headphones.
function drone(frame) {
  const p = new Pix(29, 19);
  const R = frame ? ['.rrRrrr.', '.rrrrRr.'] : ['.rRrrrr.', '.rrrrrR.'];
  const rr = { r: '#cfe3f2', R: '#ffffff' };
  p.rows([R[0]], rr, 0, 0); p.rows([R[1]], rr, 21, 0);
  p.rows([
    '...m.................m...',
    '...mmmmmmm.......mmmmmmm..',
    '.........bbbbbbbbb.........',
    '........bbBBBBBBBbb........',
    '........bdbbbbbbbdb........',
    '.........bbbbbbbbb.........',
    '............|..............',
    '............|..............',
    '..........ooooo............',
    '..........oOOOo............',
    '..........oPoPo............',
    '..........ooooo............',
  ].map((r) => r.padEnd(29, '.')), { m: '#5b6675', b: '#e9eef3', B: '#ff7a5c', d: '#2a3340', '|': '#3a3f47', o: '#c8955a', O: '#e8c48a', P: '#f7eed8' }, 2, 1);
  return p.outline(P.ink);
}
const DRONE = [drone(0), drone(1)];

// ================================================================= SKY LAYER
const sky = [];
const BANDS = [[0, 9], [9, 17], [17, 24], [24, 31], [31, 37], [37, 43], [43, 48]];
BANDS.forEach(([a, b], i) => sky.push(`<rect y="${a}" width="${W}" height="${b - a}" fill="${P.sky[i]}"/>`));
// clouds: one 256-px strip, wrapped, three tones, flat bottoms
const clouds = new Pix(256, 18);
{
  const rnd = mulberry32(1992);
  const puffs = [];
  for (let c = 0; c < 9; c++) {
    const cx = c * 28.4 + rnd() * 10, n = 3 + Math.floor(rnd() * 3), base = 16;
    for (let i = 0; i < n; i++) puffs.push([cx + (i - n / 2) * (4 + rnd() * 3), base - 2 - rnd() * 5 - (i === Math.floor(n / 2) ? 3 : 0), 3 + rnd() * 3.5]);
  }
  for (let y = 0; y < 18; y++) for (let x = 0; x < 256; x++) {
    let inside = false, depth = 0;
    for (const [cx, cy, r] of puffs) {
      let dx = Math.abs(x + 0.5 - cx); dx = Math.min(dx, 256 - dx);
      const dd = Math.hypot(dx, y + 0.5 - cy);
      if (dd < r && y < 17) { inside = true; depth = Math.max(depth, (y + 0.5 - (cy - r)) / (2 * r)); }
    }
    if (!inside) continue;
    const lower = y >= 14 ? 2 : y >= 12 ? 1 : 0;
    let col = P.cloud;
    if (lower === 2 || (lower === 1 && (x + y) & 1)) col = P.cloud3;
    else if (lower === 1 || depth > 0.78) col = P.cloud2;
    clouds.set(x, y, col);
  }
}
const cloudPaths = runsToPaths(clouds);

// ================================================================= TIMELINE
// Her routine, on bar lines (bar n covers [3(n-1), 3n) seconds):
//   bars  1-6   idle, nodding on every beat
//   bars  7-12  coconut (eyes closed). The ship goes by now. Of course it does.
//   bars 13-15  waving for rescue. At nothing.
//   bars 16-20  idle again
const STATES = [
  { id: 'idle', from: 0, to: 18 }, { id: 'coco', from: 18, to: 36 },
  { id: 'wave', from: 36, to: 45 }, { id: 'idle', from: 45, to: 60 },
];

// ================================================================= CSS
const css = [];
const pct = (t) => `${r3((t / T) * 100)}%`;
// animation shorthand; a frozen frame (--at) shifts and pauses everything
function anim(name, dur, timing, delay = 0) {
  const d = AT === null ? delay : delay - AT;
  return `animation:${name} ${dur}s ${timing} ${r3(d)}s infinite${AT === null ? '' : ' paused'}`;
}
// step keyframes from a list of [time, value] (value holds until next time)
function stepFrames(name, pairs, prop) {
  const lines = pairs.map(([t, v]) => `${pct(t)}{${prop}:${v}}`);
  css.push(`@keyframes ${name}{${lines.join('')}100%{${prop}:${pairs[0][1]}}}`);
}

// --- camera keyframes, shared by all 48 strips
{
  const fr = [];
  for (let i = 0; i <= NS; i++) {
    const t = (i / NS) * T; const c = cam(t);
    fr.push(`${pct(t)}{transform:translate(${r3(c.x0)}px,${r3(-c.z0)}px) rotate(${r3(c.phi)}deg)}`);
  }
  css.push(`@keyframes cam{${fr.join('')}}`);
  css.push(`.cam{${anim('cam', T, 'linear')}}`);
}
// --- billboard keyframes from projected map points
function billboard(name, pointAt, opts = {}) {
  const fr = [];
  for (let i = 0; i <= NS; i++) {
    const t = (i / NS) * T; const pt = pointAt(t);
    const pr = project(pt.x, pt.y, t);
    fr.push(`${pct(t)}{transform:translate(${r2(pr.x)}px,${r2(pr.y)}px) scale(${r3(pr.k * (opts.wpp || WPP))})}`);
  }
  css.push(`@keyframes ${name}{${fr.join('')}}`);
  css.push(`.${name}{${anim(name, T, 'linear')}}`);
}
billboard('bbPalm', () => PALM);
billboard('bbHer', () => HER);
// depth: is she nearer than the palm? Two copies of her, one each side of it.
{
  const pairs = [];
  let last = null;
  for (let i = 0; i <= 240; i++) {
    const t = (i / 240) * T;
    const front = project(HER.x, HER.y, t).d < project(PALM.x, PALM.y, t).d;
    if (front !== last) { pairs.push([t, front ? 1 : 0]); last = front; }
  }
  stepFrames('herFront', pairs, 'opacity');
  stepFrames('herBack', pairs.map(([t, v]) => [t, 1 - v]), 'opacity');
  css.push(`.herFront{${anim('herFront', T, 'step-end')}}.herBack{${anim('herBack', T, 'step-end')}}`);
}
// the ship: sails right along a line far behind the island while she sips
// It slides out from behind the palm's crown, crosses directly behind her head
// at about 31 s (bar 11, eyes closed, coconut up) and is off the right edge
// before bar 13, when she opens her eyes and starts waving.
const SHIP_T = 29, SHIP_DIST = 120, SHIP_V = 14;
function shipAt(t) {
  const c = cam(SHIP_T); const a = (c.phi * Math.PI) / 180;
  // view direction and screen-right at SHIP_T, back in map coordinates
  const forward = { x: -Math.sin(a), y: -Math.cos(a) };  // R(-phi) * (0,-1)
  const right = { x: Math.cos(a), y: -Math.sin(a) };     // R(-phi) * (1,0)
  return { x: forward.x * SHIP_DIST + right.x * SHIP_V * (t - SHIP_T), y: forward.y * SHIP_DIST + right.y * SHIP_V * (t - SHIP_T) };
}
billboard('bbShip', shipAt, { wpp: 1.25 });
{
  const pairs = []; let last = null;
  for (let i = 0; i <= 240; i++) {
    const t = (i / 240) * T; const pt = shipAt(t); const pr = project(pt.x, pt.y, t);
    const vis = pr.d > 20 && pr.x > -40 && pr.x < W + 40 ? 1 : 0;
    if (vis !== last) { pairs.push([t, vis]); last = vis; }
  }
  stepFrames('shipVis', pairs, 'opacity');
  css.push(`.shipVis{${anim('shipVis', T, 'step-end')}}`);
}
// her states and frames
for (const st of ['idle', 'coco', 'wave']) {
  const pairs = [];
  STATES.forEach((s) => pairs.push([s.from, s.id === st ? 1 : 0]));
  stepFrames(`st_${st}`, pairs.filter((p, i, a) => i === 0 || p[1] !== a[i - 1][1]), 'opacity');
  css.push(`.st_${st}{${anim(`st_${st}`, T, 'step-end')}}`);
}
css.push('@keyframes blink2{0%{opacity:1}50%{opacity:0}100%{opacity:1}}');
css.push('@keyframes blink2b{0%{opacity:0}50%{opacity:1}100%{opacity:0}}');
css.push('@keyframes nodA{0%{opacity:0}40%{opacity:1}100%{opacity:0}}');
css.push('@keyframes nodB{0%{opacity:1}40%{opacity:0}100%{opacity:1}}');
css.push(`.nodA{${anim('nodA', BEAT, 'step-end')}}.nodB{${anim('nodB', BEAT, 'step-end')}}`);
css.push(`.sipA{${anim('blink2', BEAT * 4, 'step-end')}}.sipB{${anim('blink2b', BEAT * 4, 'step-end')}}`);
css.push(`.wavA{${anim('blink2', BEAT, 'step-end')}}.wavB{${anim('blink2b', BEAT, 'step-end')}}`);
css.push(`.rotA{${anim('blink2', 0.2, 'step-end')}}.rotB{${anim('blink2b', 0.2, 'step-end')}}`);
css.push('@keyframes bob{0%{transform:translate(0,0)}50%{transform:translate(0,1px)}100%{transform:translate(0,0)}}');
css.push(`.bob{${anim('bob', BEAT * 2, 'step-end')}}`);
// clouds: the background layer scrolls with the heading, 4 x 256 px per orbit
css.push(`@keyframes clouds{0%{transform:translate(0,0)}100%{transform:translate(256px,0)}}`);
css.push(`.clouds{${anim('clouds', T / 4, 'linear')}}`);
css.push('.px{image-rendering:pixelated;image-rendering:crisp-edges;image-rendering:pixelated}');
css.push('@media (prefers-reduced-motion:reduce){*{animation-play-state:paused!important}}');

// ================================================================= BUILD SVG
const defs = [];
// the sea: a 32-unit tile, a faint checker and three wave crests
defs.push(`<pattern id="sea" width="32" height="32" patternUnits="userSpaceOnUse">`
  + `<rect width="32" height="32" fill="${P.sea}"/><rect width="16" height="16" fill="${P.sea2}"/><rect x="16" y="16" width="16" height="16" fill="${P.sea2}"/>`
  + `<path fill="${P.crest}" d="M3 6h6v1H3zM19 13h7v1h-7zM8 24h6v1H8zM25 28h5v1h-5z"/>`
  + `<path fill="${P.crestHi}" d="M4 5h4v1H4zM20 12h4v1h-4zM9 23h3v1H9z"/></pattern>`);
defs.push(`<g id="map"><rect x="-6000" y="-6000" width="12000" height="12000" fill="url(#sea)"/>`
  + `<image class="px" image-rendering="optimizeSpeed" x="${-MC}" y="${-MC}" width="${MAPN}" height="${MAPN}" href="${dataUri(mapPng)}"/></g>`);
defs.push(`<clipPath id="frame"><rect width="${W}" height="${H}" rx="5"/></clipPath>`);

const body = [];
body.push(`<g clip-path="url(#frame)">`);
body.push(sky.join(''));
defs.push(`<g id="cl">${cloudPaths}</g>`);
body.push(`<g transform="translate(0 ${H0 - 18})"><g class="clouds"><use href="#cl"/><use href="#cl" x="-256"/></g></g>`);
// the floor: one strip per two scanlines
const strips = [];
for (let k = 0; k < (H - H0) / STRIP; k++) {
  const yTop = H0 + k * STRIP, dy = yTop + STRIP / 2 - H0;
  const d = K / dy, sx = F / d, sy = K / (d * d);
  strips.push(`<svg y="${yTop}" width="${W}" height="${STRIP}" overflow="hidden"><g transform="translate(${W / 2} ${STRIP / 2}) scale(${r3(sx)} ${+sy.toPrecision(4)}) translate(0 ${r2(d)})"><g class="cam"><use href="#map"/></g></g></svg>`);
}
body.push(strips.join(''));
// horizon haze: stepped, like a per-scanline colour gradient
[[0, 2, 0.55], [2, 4, 0.38], [4, 7, 0.24], [7, 11, 0.12], [11, 16, 0.05]].forEach(([a, b, o]) =>
  body.push(`<rect y="${H0 + a}" width="${W}" height="${b - a}" fill="${P.sky[6]}" opacity="${o}"/>`));
// sprites
const img = (pix, x, y, cls = '') => `<image class="px${cls ? ' ' + cls : ''}" image-rendering="optimizeSpeed" x="${x}" y="${y}" width="${pix.w}" height="${pix.h}" href="${dataUri(pix.png())}"/>`;
body.push(`<g class="shipVis"><g class="bbShip">${img(SHIP, -15, -SHIP.h + 2)}</g></g>`);
// her frames live once in <defs>; both depth copies <use> them
for (const [k, pix] of Object.entries(HER_FRAMES)) {
  defs.push(`<image id="her_${k}" class="px" image-rendering="optimizeSpeed" x="-7.5" y="${-pix.h + 1}" width="${pix.w}" height="${pix.h}" href="${dataUri(pix.png())}"/>`);
}
const u = (id) => `<use href="#her_${id}"/>`;
// a music note that drifts up from her headphones once a bar while she idles
{
  const note = new Pix(5, 6).rows(['..##.', '..#.#', '..#..', '..#..', '###..', '##...'], { '#': P.hud }).outline(P.ink);
  defs.push(`<image id="her_note" class="px" image-rendering="optimizeSpeed" x="4" y="-31" width="${note.w}" height="${note.h}" href="${dataUri(note.png())}"/>`);
  css.push('@keyframes note{0%{opacity:1;transform:translate(0,0)}12.5%{transform:translate(1px,-2px)}25%{transform:translate(1px,-4px)}37.5%{transform:translate(2px,-6px)}50%{opacity:0;transform:translate(2px,-6px)}100%{opacity:0;transform:translate(0,0)}}');
  css.push(`.note{${anim('note', BAR, 'step-end')}}`);
}
const herSprite = () => `<g class="st_idle"><g class="nodA">${u('idleB')}</g><g class="nodB">${u('idleA')}</g><g class="note">${u('note')}</g></g>`
  + `<g class="st_coco"><g class="sipA">${u('sip1')}</g><g class="sipB">${u('sip2')}</g></g>`
  + `<g class="st_wave"><g class="wavA">${u('wave1')}</g><g class="wavB">${u('wave2')}</g></g>`;
body.push(`<g class="herBack"><g class="bbHer">${herSprite()}</g></g>`);
body.push(`<g class="bbPalm">${img(PALM_S.pix, -PALM_S.foot - 1, -PALM_S.pix.h + 2)}</g>`);
body.push(`<g class="herFront"><g class="bbHer">${herSprite()}</g></g>`);
// the drone: fixed, bottom centre, with its shadow on the sea below
body.push(`<ellipse cx="${W / 2}" cy="${H - 2.5}" rx="9" ry="1.5" fill="#0b2d5c" opacity="0.45"/>`);
body.push(`<g class="bob"><g transform="translate(${W / 2 - 15} ${H - 27})"><g class="rotA">${img(DRONE[0], 0, 0)}</g><g class="rotB">${img(DRONE[1], 0, 0)}</g></g></g>`);

// status text and title card (fixed sprites, drawn as vector pixels)
// each 5x7 glyph is one path in <defs>; text is a row of <use>s, drawn twice
// (navy drop shadow, then the colour)
const usedGlyphs = new Set();
const gid = (ch) => `g${ch.charCodeAt(0).toString(16)}`;
function hudText(s, x, y, col) {
  const uses = [...s].map((ch, i) => { if (ch === ' ') return ''; usedGlyphs.add(ch); return `<use href="#${gid(ch)}" x="${i * 6}"/>`; }).join('');
  return `<g fill="${P.navy}" transform="translate(${x + 1} ${y + 1})">${uses}</g><g fill="${col}" transform="translate(${x} ${y})">${uses}</g>`;
}
body.push(hudText('BAR', 6, 4, P.hud));
body.push(hudText('SHIPS SEEN 0', W - 6 - textW('SHIPS SEEN 0'), 4, P.hud));
body.push(hudText('NOW', 6, H - 11, P.hud));
body.push(hudText('RUN 10:00:00', W - 6 - textW('RUN 10:00:00'), H - 11, P.hud));
// bar counter 01..20 and four beat pips
const bars = [];
for (let n = 1; n <= 20; n++) {
  bars.push(`<g class="bar" style="animation-delay:${r3(-(T - (n - 1) * BAR) % T - (AT ?? 0))}s">${hudText(`${String(n).padStart(2, '0')}/20`, 30, 4, P.hudHi)}</g>`);
}
css.push(`@keyframes bar{0%{opacity:1}${pct(BAR)}{opacity:0}100%{opacity:0}}`);
css.push(`.bar{animation:bar ${T}s step-end infinite${AT === null ? '' : ' paused'};opacity:0}`);
body.push(bars.join(''));
for (let i = 0; i < 4; i++) {
  const x = 66 + i * 5;
  body.push(`<rect x="${x + 1}" y="${6}" width="3" height="3" fill="${P.navy}"/><rect x="${x}" y="5" width="3" height="3" fill="${P.hudDim}"/>`);
  body.push(`<rect class="pip" style="animation-delay:${r3(-((BAR - i * BEAT) % BAR) - (AT ?? 0))}s" x="${x}" y="5" width="3" height="3" fill="${P.hudCoral}"/>`);
}
css.push(`@keyframes pip{0%{opacity:1}25%{opacity:0}100%{opacity:0}}`);
css.push(`.pip{animation:pip ${BAR}s step-end infinite${AT === null ? '' : ' paused'};opacity:0}`);
// NOW: status words
for (const [st, word] of [['idle', 'IDLE'], ['coco', 'COCONUT'], ['wave', 'WAVING']]) {
  body.push(`<g class="st_${st}">${hudText(word, 30, H - 11, P.hudHi)}</g>`);
}
for (const ch of usedGlyphs) {
  let d = '';
  glyph5(ch).forEach((row, y) => {
    let x = 0;
    while (x < 5) { if (row[x] !== '#') { x++; continue; } let e = x; while (e < 5 && row[e] === '#') e++; d += `M${x} ${y}h${e - x}v1h${x - e}z`; x = e; }
  });
  defs.push(`<path id="${gid(ch)}" d="${d}"/>`);
}
// title card
{
  const NAME = 'CASTAWAY';
  const widths = [...NAME].map((c) => TITLE[c][0].length);
  const gap = 3;
  const tw = widths.reduce((a, b) => a + b, 0) + gap * (NAME.length - 1);
  const t = new Pix(W, 30);
  const x0 = Math.round((W - tw) / 2), y0 = 3;
  const BANDC = ['#fff8df', '#fff8df', '#ffe08a', '#ffe08a', '#ffd067', '#ffd067', '#ffbd59', '#ffbd59', '#ffa553', '#ffa553', '#ff8d55', '#ff8d55', '#ff7556', '#ff7556', '#f25c50', '#e04c4a'];
  // shadow and outline first, then the banded fill
  const solid = new Pix(W, 30);
  let x = x0;
  [...NAME].forEach((c, i) => {
    TITLE[c].forEach((row, y) => [...row].forEach((b, gx) => { if (b === '#') solid.set(x + gx, y0 + y, BANDC[y]); }));
    x += widths[i] + gap;
  });
  for (let y = 0; y < 30; y++) for (let xx = 0; xx < W; xx++) {
    if (!solid.get(xx, y)) continue;
    for (const [dx, dy] of [[1, 1], [2, 2], [1, 2], [2, 1], [0, 2], [2, 0]]) if (!solid.get(xx + dx, y + dy)) t.set(xx + dx, y + dy, P.navy);
  }
  for (let y = 0; y < 30; y++) for (let xx = 0; xx < W; xx++) {
    if (!solid.get(xx, y)) continue;
    for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) if (!solid.get(xx + dx, y + dy)) t.set(xx + dx, y + dy, P.navy);
  }
  for (let y = 0; y < 30; y++) for (let xx = 0; xx < W; xx++) if (solid.get(xx, y)) t.set(xx, y, solid.get(xx, y));
  body.push(runsToPaths(t, 0, 11));
  // a glint runs across the letters every 12 s (five times a loop), clipped
  // to the letter faces and stepped a pixel at a time
  const mask = new Pix(W, 30);
  for (let i = 0; i < solid.d.length; i++) if (solid.d[i]) mask.d[i] = '#fff';
  defs.push(`<clipPath id="tface">${runsToPaths(mask, 0, 11).replace(' fill="#fff"', '')}</clipPath>`);
  body.push(`<g clip-path="url(#tface)"><g class="glint"><path fill="#fffbea" opacity="0.85" d="M${x0 - 14} 11h3l-14 24h-3zM${x0 - 9} 11h5l-14 24h-5z"/></g></g>`);
  const run = tw + 40;
  css.push(`@keyframes glint{0%{transform:translate(0,0)}12%{transform:translate(${run}px,0)}100%{transform:translate(${run}px,0)}}`);
  css.push(`.glint{${anim('glint', T / 5, `steps(${Math.round(run / 2)},end)`, -9)}}`);
}
body.push(`<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="4.5" fill="none" stroke="${P.navy}" stroke-width="1"/>`);
body.push('</g>');

const TITLE_TXT = 'Castaway';
const DESC = 'CASTAWAY as an early-1990s 16-bit console title screen. Above a low horizon: stepped blue sky bands, drifting pixel clouds, the title in chunky capitals banded from cream to coral, and status text reading BAR 01/20 with four beat lights, SHIPS SEEN 0, NOW IDLE and RUN 10:00:00. Below it a flat ocean map in steep perspective swings slowly round a small island as a delivery drone circles it, one lap a minute. CASTAWAY is spelled across the sand twice, back to back; a raft, a turtle and a message in a bottle sit in the shallows. By the one tall palm a young woman in cream headphones, a coral tank top and cream shorts nods to the beat, sips a coconut with her eyes closed while a ship sails past right behind her head, then waves for rescue at an empty sea.';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W * 3}" height="${H * 3}" shape-rendering="crispEdges" role="img" aria-labelledby="t d">`
  + `<title id="t">${TITLE_TXT}</title><desc id="d">${DESC}</desc>`
  + `<style>${css.join('')}</style>`
  + `<defs>${defs.join('')}</defs>`
  + body.join('')
  + '</svg>\n';
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, svg);
console.log(`${path.relative(process.cwd(), OUT)}: ${(svg.length / 1024).toFixed(1)} KB (map ${(mapPng.length / 1024).toFixed(1)} KB)`);

const sheet = opt('sheet');
if (sheet) {
  fs.mkdirSync(sheet, { recursive: true });
  for (const [k, v] of Object.entries(HER_FRAMES)) fs.writeFileSync(path.join(sheet, `her-${k}.png`), v.scaled(10).png());
  fs.writeFileSync(path.join(sheet, 'palm.png'), PALM_S.pix.scaled(8).png());
  fs.writeFileSync(path.join(sheet, 'ship.png'), SHIP.scaled(10).png());
  fs.writeFileSync(path.join(sheet, 'drone.png'), DRONE[0].scaled(10).png());
  const m = new Pix(MAPN, MAPN); for (let i = 0; i < map.length; i++) m.d[i] = MP[map[i]] || '#0d4a96';
  fs.writeFileSync(path.join(sheet, 'map.png'), m.scaled(4).png());
}
