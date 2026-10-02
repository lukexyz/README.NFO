#!/usr/bin/env node
// 99-3d-maze_opus_5.5: the "3D Maze" README header for Castaway
// (catalogue entry idle-07: the mid-1990s OpenGL screensaver that walked a
// brick maze by the right-hand rule, with a rat, a grey rock that turned the
// world upside down, a translucent smiley at the exit and an overlay map).
//
// Everything here is drawn from scratch: the maze, the textures, the posters,
// the crab, the rock, the sun and the lettering. Nothing is copied from the
// original saver.
//
// How it works
//   * MAZE. An 8 x 5 perfect maze, carved by a depth-first walk from a PRNG
//     seeded with 1992 (the video's default seed). The walker starts at the
//     bottom-left and follows the right-hand wall. A grey rock at the top of
//     the maze flips the world upside down and switches it to the left hand,
//     which is why it walks past the exit into a dead end first.
//   * VIEW. A tiny software raycaster in this file renders the walk at
//     160 x 100 with nearest-neighbour textures (brick walls, wooden floor,
//     pale speckled ceiling tiles), real perspective and real 90-degree turns.
//     Flat lighting, no shadows. Posters are wall faces with their own 64 x 64
//     texture; the crab and the sun are billboards, the rock is a little
//     flat-shaded polyhedron, all depth-tested against the walls. The sun is
//     translucent: its pixels are blended palette entries, not dithering.
//   * FILM. One frame every 1/6 s (moves take 3 frames: stepped movement, the
//     project's own motion default). Identical frames are stored once. All
//     unique frames go into ONE tall palette PNG, a film strip, with a guard
//     row above and below each frame so scaling never bleeds a neighbour in.
//     The frames are stored out of order: a greedy chain plus 2-opt puts each
//     frame next to the one it most resembles, because deflate only looks
//     32 KB back, about two frames (this takes the strip from ~140 KB to
//     under 90).
//     A step-end CSS keyframe list slides the strip one frame at a time.
//   * FLIP. Touching the rock rolls the whole view 180 degrees with CSS, scaled
//     up mid-roll so the corners never show. The frames themselves are always
//     rendered upright, so anything only seen after the roll (the sun, the
//     bottle picture) is drawn upside down in them, to come out the right way.
//   * MAP. The overlay map is plain SVG lines: walls in white, the walker a
//     blue triangle, start red, exit green, the rock a spinning white
//     triangle, posters as still white triangles, the crab orange. It moves in
//     step with the film.
//   * LOOP. 18 s, six bars of the theme. At the end the walker walks into the
//     smiling sun and the view dissolves into the first frame, so the loop
//     point is the maze starting over, which is what the original did.
//   * prefers-reduced-motion: every animation stops on one still (the walk up
//     to the CASTAWAY poster, crab in view), with the map to match.
//
//   node 99-3d-maze_opus_5.5.mjs                     write the SVG
//   node 99-3d-maze_opus_5.5.mjs --at=7.5 --out=f.svg
//                                                    same SVG, paused at 7.5 s
//   node 99-3d-maze_opus_5.5.mjs --sheet=dir         also write every frame
//                                                    to one contact-sheet PNG
//   node 99-3d-maze_opus_5.5.mjs --text              print the maze in
//                                                    box-drawing characters
//
// Plain Node, no dependencies, deterministic (seeded PRNG, no clock).

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '99-3d-maze_opus_5.5';
const argv = process.argv.slice(2);
const opt = (k) => { const a = argv.find((s) => s.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : null; };
const OUT = opt('out') || path.join(HERE, '..', 'assets', `${SLUG}.svg`);
const AT = opt('at') !== null ? Number(opt('at')) : null;
const SHEET = opt('sheet');

// ------------------------------------------------------------------ numbers
const RW = 160, RH = 100, PX = 4;          // raster frame, display scale
const VW = RW * PX, VH = RH * PX;          // 640 x 400 view
const W = 960, H = 400;                    // whole banner
const FOV = 80;                            // horizontal field of view
const KT = Math.tan((FOV / 2) * Math.PI / 180);
const FOC = (RW / 2) / KT;                 // focal length in raster pixels
const FPS = 6;                             // frames a second
const NX = 8, NY = 5, SEED = 1992;
const STATIC_T = 3.5;                      // the still for reduced motion

// ------------------------------------------------------------------ helpers
const r1 = (v) => +v.toFixed(1);
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
const hexRgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const rgbHex = (c) => '#' + c.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
const mix = (a, b, t) => { const A = hexRgb(a), B = hexRgb(b); return rgbHex(A.map((v, i) => v + (B[i] - v) * t)); };

// ------------------------------------------------------------------ PNG out
const CRC = new Uint32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
function crc32(buf) { let c = 0xffffffff; for (const b of buf) c = CRC[(c ^ b) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
// 8-bit palette PNG, no filtering (so rows can match the frame above them in
// the strip, which is what makes the strip small).
function encodePng(w, h, idx, palette) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 3;
  const plte = Buffer.alloc(palette.length * 3);
  palette.forEach((c, i) => { const [r, g, b] = hexRgb(c); plte[i * 3] = r; plte[i * 3 + 1] = g; plte[i * 3 + 2] = b; });
  const raw = Buffer.alloc((w + 1) * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) raw[y * (w + 1) + 1 + x] = idx[y * w + x];
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr), chunk('PLTE', plte),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9, memLevel: 9, windowBits: 15 })), chunk('IEND', Buffer.alloc(0)),
  ]);
}

// ------------------------------------------------------------------ palette
// Colours are added on first use; the PNG palette is whatever got used.
const PAL = [];
const PIDX = new Map();
const col = (hex) => { if (!PIDX.has(hex)) { PIDX.set(hex, PAL.length); PAL.push(hex); } return PIDX.get(hex); };
const BLACK = col('#000000');
const MORTAR = col('#d6ccbb'), MORTAR2 = col('#b3a895');
const BR = ['#6e2216', '#8e2f1f', '#ab3f2a', '#c65a3e'].map(col);
const WD = ['#4f2f16', '#6f4521', '#8c5a2c', '#a8743c'].map(col);
const CE = ['#ebe6d8', '#d3ccba', '#b2aa96'].map(col);
const SUN_Y = '#ffe27a', SUN_O = '#ffad3b';
// Translucency: a sun pixel is the pixel behind it, mixed with sun colour.
const tintMemo = new Map();
const tint = (i, hex, a) => {
  const k = `${i}|${hex}|${a}`;
  if (!tintMemo.has(k)) tintMemo.set(k, col(mix(PAL[i], hex, a)));
  return tintMemo.get(k);
};

// ------------------------------------------------------------------ textures
// A texture is { w, h, d } with palette indices; 255 = transparent.
const T_ = 255;
function tex(w, h, fn) { const d = new Uint8Array(w * h); for (let v = 0; v < h; v++) for (let u = 0; u < w; u++) d[v * w + u] = fn(u, v); return { w, h, d }; }
const tget = (t, u, v) => t.d[v * t.w + u];
const tset = (t, u, v, c) => { u = Math.round(u); v = Math.round(v); if (u >= 0 && v >= 0 && u < t.w && v < t.h && c !== undefined) t.d[v * t.w + u] = c; };
const trect = (t, x, y, w, h, c) => { for (let v = y; v < y + h; v++) for (let u = x; u < x + w; u++) tset(t, u, v, c); };
const tdisc = (t, cx, cy, r, c) => { for (let v = Math.floor(cy - r); v <= cy + r; v++) for (let u = Math.floor(cx - r); u <= cx + r; u++) if ((u - cx) ** 2 + (v - cy) ** 2 <= r * r) tset(t, u, v, c); };
const trows = (t, rows, map, ox = 0, oy = 0) => rows.forEach((row, y) => [...row].forEach((ch, x) => { if (map[ch] !== undefined) tset(t, ox + x, oy + y, map[ch]); }));
const up2 = (t) => tex(t.w * 2, t.h * 2, (u, v) => tget(t, u >> 1, v >> 1));
const rot180 = (t) => tex(t.w, t.h, (u, v) => tget(t, t.w - 1 - u, t.h - 1 - v));

// Bricks: 8 courses of 3 + 1 mortar, bricks 8 long, half-bond.
const BRICK = tex(32, 32, (u, v) => {
  const course = Math.floor(v / 4), vr = v % 4;
  const uu = (u + (course % 2 ? 4 : 0)) % 32, bi = Math.floor(uu / 8), ur = uu % 8;
  if (vr === 0 || ur === 0) return vr === 0 && ur === 0 ? MORTAR2 : MORTAR;
  const h = hash(bi, course, 7);
  const base = h < 0.3 ? 0 : h < 0.75 ? 1 : 2;
  if (vr === 1 && h > 0.5) return BR[base + 1];
  return BR[base];
});
// Floor boards, 4 a cell, with staggered ends and a little grain.
const WOOD = tex(32, 32, (u, v) => {
  const plank = Math.floor(v / 8), vr = v % 8;
  if (vr === 0) return WD[0];
  const endAt = Math.floor(hash(plank, 1, 5) * 32);
  if (u === endAt) return WD[0];
  const h = hash(plank, Math.floor(((u - endAt + 32) % 32) / 16), 9);
  const base = h < 0.5 ? 2 : 1;
  if ((vr === 3 || vr === 6) && hash(u >> 2, v, 2) < 0.6) return WD[base - 1];
  if (vr === 1) return WD[3];
  return WD[base];
});
// Ceiling: 2 x 2 pale tiles a cell, grooves and speckle.
const CEIL = tex(32, 32, (u, v) => {
  if (u % 16 === 0 || v % 16 === 0) return CE[2];
  if (u % 16 === 15 || v % 16 === 15) return CE[1];
  return hash(u, v, 11) < 0.07 ? CE[1] : CE[0];
});

// Mipmaps: box filter in RGB, snapped to the colours the texture already uses.
function mip(t) {
  const used = [...new Set(t.d)].filter((c) => c !== T_);
  const rgb = used.map((c) => hexRgb(PAL[c]));
  return tex(t.w / 2, t.h / 2, (u, v) => {
    const s = [0, 0, 0];
    for (const [a, b] of [[0, 0], [1, 0], [0, 1], [1, 1]]) { const c = hexRgb(PAL[tget(t, u * 2 + a, v * 2 + b)]); s[0] += c[0]; s[1] += c[1]; s[2] += c[2]; }
    let best = 0, bd = 1e9;
    rgb.forEach((c, i) => { const d = (c[0] - s[0] / 4) ** 2 + (c[1] - s[1] / 4) ** 2 + (c[2] - s[2] / 4) ** 2; if (d < bd) { bd = d; best = i; } });
    return used[best];
  });
}
const chain = (t) => { const a = mip(t); return [t, a, mip(a)]; };

// ------------------------------------------------------------------ fonts
// 5x7 for the panel and the posters, 3x5 for small poster lines.
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
  ',': '.....|.....|.....|.....|.....|..#..|.#...', "'": '..#..|..#..|.#...|.....|.....|.....|.....',
  '!': '..#..|..#..|..#..|..#..|..#..|.....|..#..', '?': '.###.|#...#|....#|..##.|..#..|.....|..#..',
  '(': '...#.|..#..|.#...|.#...|.#...|..#..|...#.', ')': '.#...|..#..|...#.|...#.|...#.|..#..|.#...',
  '+': '.....|..#..|..#..|#####|..#..|..#..|.....', '=': '.....|.....|#####|.....|#####|.....|.....',
  '*': '.....|#.#.#|.###.|#####|.###.|#.#.#|.....', ' ': '.....|.....|.....|.....|.....|.....|.....',
};
const FONT3 = {
  0: '###|#.#|#.#|#.#|###', 1: '.#.|##.|.#.|.#.|###', 2: '###|..#|###|#..|###', 3: '###|..#|.##|..#|###',
  4: '#.#|#.#|###|..#|..#', 5: '###|#..|###|..#|###', 6: '###|#..|###|#.#|###', 7: '###|..#|..#|.#.|.#.',
  8: '###|#.#|###|#.#|###', 9: '###|#.#|###|..#|###', ':': '...|.#.|...|.#.|...', ' ': '...|...|...|...|...',
  H: '#.#|#.#|###|#.#|#.#', O: '###|#.#|#.#|#.#|###', U: '#.#|#.#|#.#|#.#|###', R: '##.|#.#|##.|#.#|#.#',
  S: '###|#..|###|..#|###',
};
const glyph = (font, ch) => (font[ch] || font[' ']).split('|');
function ttext(t, str, x, y, c, font = FONT5) {
  let cx = x;
  for (const ch of str) { const g = glyph(font, ch); g.forEach((row, gy) => [...row].forEach((p, gx) => { if (p === '#') tset(t, cx + gx, y + gy, c); })); cx += g[0].length + 1; }
}
const twidth = (str, font = FONT5) => [...str].reduce((s, ch) => s + glyph(font, ch)[0].length + 1, 0) - 1;

// ------------------------------------------------------------------ posters
// Poster walls are 64 x 64: the brick texture doubled, with a picture hung on it.
const INK = col('#2a1a12'), PAPER = col('#f4e8cc'), CORAL = col('#ff7a5c'), CORAL2 = col('#d9573c');
const SEA = col('#2f8fc0'), SEA2 = col('#1f6a99'), SEA3 = col('#5fb3dd'), SKY = col('#9fdcf2'), SKY2 = col('#c8ecf7');
const SAND = col('#f2d38c'), SAND2 = col('#d9b56a'), LEAF = col('#3f9a52'), LEAF2 = col('#2a6e3a');
const TRUNK = col('#8a5a2b'), SKIN = col('#e8b48a'), HAIR = col('#6b3f22'), CREAM = col('#f3e6c8');
const SUNC = col('#ffd54a'), WHITE = col('#ffffff'), GREY = col('#7f8c99'), GREY2 = col('#b9c4cc'), GREY3 = col('#5b6670');
const BOTTLE = col('#5fb08a'), BOTTLE2 = col('#3d7f63'), CORK = col('#c08a4a');
function framed(x, y, w, h) {
  const t = up2(BRICK);
  trect(t, x, y, w, h, WD[0]);
  trect(t, x + 1, y + 1, w - 2, h - 2, WD[2]);
  trect(t, x + 2, y + 2, w - 4, h - 4, WD[0]);
  return t;
}
// 1. The name, on the far wall of the first corridor.
const P_NAME = (() => {
  const t = framed(4, 17, 56, 31);
  trect(t, 7, 20, 50, 25, PAPER);
  ttext(t, 'CASTAWAY', 9, 23, CORAL2);
  ttext(t, 'CASTAWAY', 8, 22, CORAL);
  for (let u = 8; u < 56; u++) tset(t, u, 33 + (Math.floor((u + 1) / 3) % 2), SEA);
  const s = '10:00:00';
  ttext(t, s, 32 - Math.ceil(twidth(s, FONT3) / 2), 37, INK, FONT3);
  return t;
})();
// 2. A painting of the island: sea, sky, one palm, her, small.
const P_ISLAND = (() => {
  const t = framed(10, 16, 44, 32);
  trect(t, 13, 19, 38, 26, SKY);
  trect(t, 13, 19, 38, 4, SKY2);
  tdisc(t, 44, 24, 3, SUNC);
  trect(t, 13, 33, 38, 12, SEA);
  trect(t, 13, 33, 38, 1, SEA3);
  [[16, 38], [22, 42], [40, 40], [46, 37], [30, 43]].forEach(([u, v]) => trect(t, u, v, 3, 1, SEA3));
  for (let u = 22; u <= 41; u++) for (let v = 33; v <= 37; v++) if (((u - 31.5) / 10) ** 2 + ((v - 36) / 2.6) ** 2 <= 1) tset(t, u, v, v > 35 ? SAND2 : SAND);
  // palm: trunk leaning, fronds
  [[35, 35], [35, 34], [35, 33], [36, 32], [36, 31], [36, 30], [37, 29], [37, 28], [37, 27]].forEach(([u, v]) => tset(t, u, v, TRUNK));
  trows(t, [
    '..gg.....gg..',
    '.gGGg...gGGg.',
    'g...gGgGg...g',
    '....gGGGg....',
    '...g..G..g...',
    '..g...G...g..',
  ], { g: LEAF, G: LEAF2 }, 31, 22);
  // her: bun, cream headphones, coral top, cream shorts, bare feet
  trows(t, [
    '.h.',
    'csc',
    '.s.',
    'ooo',
    '.o.',
    'ccc',
    's.s',
  ], { h: HAIR, c: CREAM, s: SKIN, o: CORAL }, 27, 28);
  return t;
})();
// 3. The shark in headphones, nodding (well, not in a poster).
const P_SHARK = (() => {
  const t = framed(10, 16, 44, 32);
  trect(t, 13, 19, 38, 26, SEA);
  trect(t, 13, 19, 38, 9, SEA3);
  trect(t, 13, 27, 38, 1, SKY2);
  trows(t, [
    '........ccc..........',
    '......cc...cc........',
    '.....c.......c.......',
    '.....c...g...c.......',
    '....HH..ggg..HH......',
    '....HHgggggggHH......',
    '....HHggggkgggHH.....',
    '.....gggggggggggg....',
    '....gggwwwwwwwwggg...',
    '...ggwwwwwwwwwwwwgg..',
    '..ggwwwwwwwwwwwwwwgg.',
  ], { c: CREAM, H: CREAM, g: GREY, k: INK, w: GREY2 }, 19, 21);
  trows(t, ['.##', '.#.', '##.', '##.'], { '#': WHITE }, 15, 21);
  trows(t, ['..##', '..#.', '###.', '##..'], { '#': WHITE }, 44, 22);
  return t;
})();
// 4. The bottle that washes straight back (on a dead end, of course). It is
// only seen upside down, after the rock, so it is hung upside down.
const P_BOTTLE = (() => {
  const t = framed(10, 16, 44, 32);
  trect(t, 13, 19, 38, 26, SAND);
  trect(t, 13, 19, 38, 10, SEA);
  trect(t, 13, 29, 38, 2, SEA3);
  trows(t, [
    '....bbbbbbbbbbbb......',
    '...bBBBBBBBBBBBBbbbbkk',
    '..bBBppppppppBBBbbbbkk',
    '..bBBppppppppBBBbbbbkk',
    '...bBBBBBBBBBBBBbbbbkk',
    '....bbbbbbbbbbbb......',
  ], { b: BOTTLE2, B: BOTTLE, p: PAPER, k: CORK }, 18, 34);
  // a U-turn arrow over it
  trows(t, [
    '..ooooooo...',
    '.o.......o..',
    'o.........o.',
    'o.........o.',
    'o........ooo',
    'o.........o.',
  ], { o: CORAL }, 26, 21);
  return t;
})();
// 5. Life rings, the round pictures on the side walls.
const P_RING = (() => {
  const t = up2(BRICK);
  for (let v = 16; v < 48; v++) for (let u = 16; u < 48; u++) {
    const dx = u - 31.5, dy = v - 31.5, r = Math.hypot(dx, dy);
    if (r > 14 || r < 7) continue;
    const a = (Math.atan2(dy, dx) + Math.PI * 2.25) % (Math.PI * 2);
    const band = Math.floor(a / (Math.PI / 2)) % 2;
    tset(t, u, v, r > 13 || r < 8 ? (band ? CORAL2 : GREY2) : band ? CORAL : WHITE);
  }
  return t;
})();
const FACE_TEX = {
  '7,4,E': P_NAME, '7,2,N': P_ISLAND, '6,0,N': P_SHARK, '5,2,S': rot180(P_BOTTLE),
  '4,4,S': P_RING, '1,4,N': P_RING,
};
const BRICK_M = chain(BRICK), WOOD_M = chain(WOOD), CEIL_M = chain(CEIL);
const FACE_M = Object.fromEntries(Object.entries(FACE_TEX).map(([k, t]) => [k, chain(t)]));

// Sprites. The crab wears a coconut, two leg frames. A
// coconut reads by being round, tan and three-holed, so it is all three: a
// shaded sphere in a warmer, lighter brown than the floorboards, with its
// three pores. Eyes on stalks and claws poke out at the sides.
const CRAB_MAP = { o: col('#5a3216'), b: col('#a8682f'), c: col('#d49a5e'), f: col('#7c4520'), p: col('#2e1a0c'), r: col('#ff6a3d'), k: BLACK, w: WHITE, x: col('#1c120b') };
const CRAB_W = 26, CRAB_H = 20;
const CRAB = [0, 1].map((step) => {
  const t = tex(CRAB_W, CRAB_H, () => T_);
  const CX = 13, CY = 8.6, RX = 8.6, RY = 8.1;
  const inside = (u, v) => ((u + 0.5 - CX) / RX) ** 2 + ((v + 0.5 - CY) / RY) ** 2 <= 1;
  for (let v = 0; v < CRAB_H; v++) for (let u = 0; u < CRAB_W; u++) {
    if (!inside(u, v)) continue;
    const edge = !inside(u - 1, v) || !inside(u + 1, v) || !inside(u, v - 1) || !inside(u, v + 1);
    const dx = (u + 0.5 - CX) / RX, dy = (v + 0.5 - CY) / RY;
    const lit = -0.55 * dx - 0.65 * dy + 0.5 * Math.sqrt(Math.max(0, 1 - dx * dx - dy * dy));
    t.d[v * CRAB_W + u] = edge ? CRAB_MAP.o : lit > 0.62 ? CRAB_MAP.c : lit > -0.05 ? CRAB_MAP.b : CRAB_MAP.f;
  }
  // the three pores
  for (const [u, v] of [[10, 5], [14, 5], [12, 9]]) trect(t, u, v, 2, 2, CRAB_MAP.p);
  // eyes on stalks, claws and legs (the legs swap between the two frames)
  const side = (rows, ox) => trows(t, rows, CRAB_MAP, ox, 6);
  side(['wk.', 'ww.', '.r.', '..r', '..r', 'rr.', 'r.r', '.r.'], 1);
  side(['.kw', '.ww', '.r.', 'r..', 'r..', '.rr', 'r.r', '.r.'], 22);
  trows(t, step ? ['..r..r..r......r..r..r..', '...r..r..r....r..r..r...'] : ['...r..r..r....r..r..r...', '..r..r..r......r..r..r..'], { r: CRAB_MAP.r }, 1, 17);
  // a dark outline, so it reads on the floorboards
  const o = tex(CRAB_W, CRAB_H, (u, v) => tget(t, u, v));
  for (let v = 0; v < CRAB_H; v++) for (let u = 0; u < CRAB_W; u++) {
    if (tget(t, u, v) !== T_) continue;
    const n = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => { const x = u + a, y = v + b; return x >= 0 && y >= 0 && x < CRAB_W && y < CRAB_H && tget(t, x, y) !== T_; });
    if (n) o.d[v * CRAB_W + u] = CRAB_MAP.x;
  }
  return o;
});
// The sun: the exit. 1 = body, 2 = rays, 3 = face.
const SUN = (() => {
  const t = tex(26, 26, () => T_);
  for (let v = 0; v < 26; v++) for (let u = 0; u < 26; u++) {
    const dx = u - 12.5, dy = v - 12.5, r = Math.hypot(dx, dy), a = Math.atan2(dy, dx);
    if (r <= 8.6) tset(t, u, v, 1);
    else if (r <= 12.6 && r > 9.6 && Math.abs(((a / (Math.PI / 6)) % 1 + 1) % 1 - 0.5) > 0.32) tset(t, u, v, 2);
  }
  trows(t, [
    '.###.....###.',
    '#...#...#...#',
    '.............',
    '.............',
    '.#.........#.',
    '..##.....##..',
    '....#####....',
  ], { '#': 3 }, 6, 9);
  return t;
})();
const SUN_FACE = col('#7a3d0c');

// ------------------------------------------------------------------ maze
const Hw = Array.from({ length: NY + 1 }, () => new Array(NX).fill(1)); // north edge of (x,y)
const Vw = Array.from({ length: NY }, () => new Array(NX + 1).fill(1)); // west edge of (x,y)
{
  const rnd = mulberry32(SEED);
  const seen = Array.from({ length: NY }, () => new Array(NX).fill(false));
  const st = [[0, 0]]; seen[0][0] = true;
  while (st.length) {
    const [x, y] = st[st.length - 1];
    const nb = [];
    if (x > 0 && !seen[y][x - 1]) nb.push([x - 1, y, 'W']);
    if (x < NX - 1 && !seen[y][x + 1]) nb.push([x + 1, y, 'E']);
    if (y > 0 && !seen[y - 1][x]) nb.push([x, y - 1, 'N']);
    if (y < NY - 1 && !seen[y + 1][x]) nb.push([x, y + 1, 'S']);
    if (!nb.length) { st.pop(); continue; }
    const [nx, ny, d] = nb[Math.floor(rnd() * nb.length)];
    if (d === 'W') Vw[y][x] = 0; else if (d === 'E') Vw[y][x + 1] = 0; else if (d === 'N') Hw[y][x] = 0; else Hw[y + 1][x] = 0;
    seen[ny][nx] = true; st.push([nx, ny]);
  }
}
const DX = [1, 0, -1, 0], DY = [0, 1, 0, -1]; // E S W N (y points down)
const blocked = (x, y, d) => (d === 0 ? Vw[y][x + 1] : d === 2 ? Vw[y][x] : d === 1 ? Hw[y + 1][x] : Hw[y][x]);
const START = { x: 0, y: 4, d: 0 }, ROCK = { x: 6, y: 0 }, EXIT = { x: 4, y: 0 };

// The route, by the rules: right hand until the rock, then left hand.
const MOVES = [];
{
  let { x, y, d } = START, hand = 1, g = 0;
  while (!(x === EXIT.x && y === EXIT.y) && g++ < 500) {
    if (x === ROCK.x && y === ROCK.y && hand === 1) { hand = -1; MOVES.push('*'); }
    const s = (d + hand + 4) % 4;
    if (!blocked(x, y, s)) { MOVES.push(hand > 0 ? 'R' : 'L', 'F'); d = s; x += DX[d]; y += DY[d]; continue; }
    if (!blocked(x, y, d)) { MOVES.push('F'); x += DX[d]; y += DY[d]; continue; }
    MOVES.push(hand > 0 ? 'L' : 'R'); d = (d - hand + 4) % 4;
  }
}

// The same maze in box-drawing characters, for the README's text block
// (--text prints it). CASTAWAY runs down the long corridor, one letter a cell.
function textMaze(labels, cw = 8) {
  const rows = NY * 2 + 1, cols = NX * cw + 1;
  const g = Array.from({ length: rows }, () => new Array(cols).fill(' '));
  const BOX = { 1010: '─', 101: '│', 110: '┌', 1100: '┐', 11: '└', 1001: '┘', 111: '├', 1101: '┤', 1110: '┬', 1011: '┴', 1111: '┼', 1000: '╴', 1: '╵', 10: '╶', 100: '╷' };
  for (let j = 0; j <= NY; j++) for (let i = 0; i <= NX; i++) {
    const up = j > 0 && Vw[j - 1][i], dn = j < NY && Vw[j][i];
    const lf = i > 0 && Hw[j][i - 1], rt = i < NX && Hw[j][i];
    const k = (lf ? 1000 : 0) + (dn ? 100 : 0) + (rt ? 10 : 0) + (up ? 1 : 0);
    g[j * 2][i * cw] = BOX[k] || ' ';
    if (rt) for (let c = 1; c < cw; c++) g[j * 2][i * cw + c] = '─';
    if (dn) g[j * 2 + 1][i * cw] = '│';
  }
  for (const [key, label] of Object.entries(labels)) {
    const [x, y] = key.split(',').map(Number);
    const pad = Math.floor((cw - 1 - label.length) / 2);
    [...label].forEach((ch, k) => { g[y * 2 + 1][x * cw + 1 + pad + k] = ch; });
  }
  return g.map((r) => r.join('').replace(/\s+$/, ''));
}
if (argv.includes('--text')) {
  const L = { '6,0': 'ROCK', '4,0': 'EXIT', '5,2': 'BOTTLE', '7,2': 'ISLAND', '6,1': '·', '5,1': '·', '5,0': '·', '7,3': '·', '6,2': '·' };
  'CASTAWAY'.split('').forEach((ch, i) => { L[`${i},4`] = ch; });
  console.log(textMaze(L).join('\n'));
  process.exit(0);
}

// ------------------------------------------------------------------ timeline
// Ticks of 1/6 s. A move is 3 ticks. Holds are where the walker stops.
const segs = [];
let tick = 0;
let pose = { x: START.x + 0.5, y: START.y + 0.5, a: 0 };
const seg = (n, to, kind) => { segs.push({ t0: tick, t1: tick + n, from: pose, to, kind }); tick += n; pose = to; };
const hold = (n, kind = 'hold') => seg(n, pose, kind);
const fwd = (f = 1) => seg(3, { x: pose.x + Math.round(Math.cos(pose.a)) * f, y: pose.y + Math.round(Math.sin(pose.a)) * f, a: pose.a }, 'F');
const turn = (s) => seg(3, { ...pose, a: pose.a + (s * Math.PI) / 2 }, s > 0 ? 'R' : 'L');
{
  // what happens, in order (the moves come from the solver above; the holds
  // and the last half-step into the sun are the direction)
  const mv = MOVES.join('');
  const want = 'FFFFFFFLFFLFRFF*LFLFFRRFFLF';
  if (mv !== want) throw new Error(`maze changed: ${mv}`);
  hold(8, 'start');                       // the crab does a little sidestep
  for (let i = 0; i < 7; i++) fwd();      // the long corridor, to the name
  hold(4, 'poster');
  turn(-1); fwd(); fwd(); turn(-1); fwd(); turn(1); fwd(); fwd();
  hold(8, 'flip');                        // touched the rock: the world rolls over
  turn(-1); fwd(); hold(2, 'tease');      // the exit, right there, smiling
  turn(-1); fwd(); fwd(); hold(3, 'deadend'); // left hand says: down here
  turn(1); turn(1); fwd(); fwd(); turn(-1);
  fwd(0.62);                              // into the sun
  hold(5, 'exit');
}
const TICKS = tick, T = TICKS / FPS;        // 108 ticks, 18 s
const FLIP = segs.find((s) => s.kind === 'flip');
const EXITH = segs.find((s) => s.kind === 'exit');
const lerp = (a, b, t) => a + (b - a) * t;
function poseAt(tk) {
  for (const s of segs) if (tk < s.t1 || s === segs[segs.length - 1]) {
    const u = Math.max(0, Math.min(1, (tk - s.t0) / (s.t1 - s.t0)));
    return { x: lerp(s.from.x, s.to.x, u), y: lerp(s.from.y, s.to.y, u), a: lerp(s.from.a, s.to.a, u) };
  }
}
// The touch: the first tick the walker is (nearly) inside the rock. From then
// on the rock is gone (that close, it would only be a big grey wall)
// and the world starts to roll over.
const ROCK_TOUCH = (() => {
  for (let tk = 0; tk < TICKS; tk++) { const p = poseAt(tk); if (Math.hypot(p.x - (ROCK.x + 0.5), p.y - (ROCK.y + 0.5)) < 0.4) return tk; }
  throw new Error('the walker never touches the rock');
})();
// time spent moving (the sun only bobs while the frames are moving anyway)
function moveClock(tk) { let m = 0; for (const s of segs) { if (s.kind.length !== 1) continue; m += Math.max(0, Math.min(tk, s.t1) - s.t0); } return m; }

// The crab: a little sidestep in front of the walker, then off ahead of it
// all the way to the exit, which it reaches first. Seconds, cell centres.
const CRAB_PATH = [
  [0, 1.75, 4.5], [0.33, 1.6, 4.5], [0.67, 1.9, 4.5], [1.0, 1.75, 4.5], [1.17, 1.75, 4.5], [4.0, 7.5, 4.5], [4.5, 7.5, 3.5], [5.0, 7.5, 2.5],
  [5.5, 6.5, 2.5], [6.0, 6.5, 1.5], [6.5, 6.5, 0.5], [7.0, 5.5, 0.5], [7.5, 4.5, 0.5],
];
const CRAB_GONE = 7.5;
function crabAt(t) {
  if (t >= CRAB_GONE) return null;
  for (let i = 1; i < CRAB_PATH.length; i++) {
    const [t1, x1, y1] = CRAB_PATH[i], [t0, x0, y0] = CRAB_PATH[i - 1];
    if (t <= t1) { const u = (t - t0) / (t1 - t0); return { x: lerp(x0, x1, u), y: lerp(y0, y1, u), moving: !(x0 === x1 && y0 === y1) }; }
  }
  return null;
}

// ------------------------------------------------------------------ renderer
function render(tk) {
  const t = tk / FPS;
  const cam = poseAt(tk);
  const img = new Uint8Array(RW * RH);
  const dx = Math.cos(cam.a), dy = Math.sin(cam.a);
  const plx = -dy * KT, ply = dx * KT;
  const zbuf = new Float32Array(RW);
  const hz = RH / 2;
  const lvlOf = (texels) => (texels < 1.6 ? 0 : texels < 3.2 ? 1 : 2);
  // floor and ceiling, cast row by row
  for (let y = 0; y < RH; y++) {
    const p = Math.abs(y + 0.5 - hz);
    const rowDist = (0.5 * FOC) / p;
    const lvl = lvlOf((32 * rowDist) / FOC);
    const tx = (y < hz ? CEIL_M : WOOD_M)[lvl];
    for (let x = 0; x < RW; x++) {
      const c = (2 * (x + 0.5)) / RW - 1;
      const wx = cam.x + rowDist * (dx + plx * c), wy = cam.y + rowDist * (dy + ply * c);
      const u = Math.floor((wx - Math.floor(wx)) * tx.w), v = Math.floor((wy - Math.floor(wy)) * tx.h);
      img[y * RW + x] = tget(tx, u, v);
    }
  }
  // walls, one ray a column
  for (let x = 0; x < RW; x++) {
    const c = (2 * (x + 0.5)) / RW - 1;
    const rx = dx + plx * c, ry = dy + ply * c;
    let mx = Math.floor(cam.x), my = Math.floor(cam.y);
    const ddx = Math.abs(1 / rx), ddy = Math.abs(1 / ry);
    const sx = rx < 0 ? -1 : 1, sy = ry < 0 ? -1 : 1;
    let sdx = rx < 0 ? (cam.x - mx) * ddx : (mx + 1 - cam.x) * ddx;
    let sdy = ry < 0 ? (cam.y - my) * ddy : (my + 1 - cam.y) * ddy;
    let dist = 99, face = '';
    for (let i = 0; i < 64; i++) {
      if (sdx < sdy) {
        if (Vw[my][sx > 0 ? mx + 1 : mx]) { dist = sdx; face = `${mx},${my},${sx > 0 ? 'E' : 'W'}`; break; }
        sdx += ddx; mx += sx;
      } else {
        if (Hw[sy > 0 ? my + 1 : my][mx]) { dist = sdy; face = `${mx},${my},${sy > 0 ? 'S' : 'N'}`; break; }
        sdy += ddy; my += sy;
      }
    }
    zbuf[x] = dist;
    const side = face.slice(-1);
    let wu = side === 'E' || side === 'W' ? cam.y + dist * ry : cam.x + dist * rx;
    wu -= Math.floor(wu);
    if (side === 'W' || side === 'S') wu = 1 - wu;
    const set = FACE_M[face] || BRICK_M;
    const tx = set[lvlOf((set[0].w * dist) / FOC)];
    const lineH = FOC / dist, top = hz - lineH / 2;
    const u = Math.min(tx.w - 1, Math.floor(wu * tx.w));
    for (let y = Math.max(0, Math.floor(top)); y < Math.min(RH, Math.ceil(top + lineH)); y++) {
      const v = Math.min(tx.h - 1, Math.max(0, Math.floor(((y + 0.5 - top) / lineH) * tx.h)));
      img[y * RW + x] = tget(tx, u, v);
    }
  }
  const toCam = (wx, wy) => { const ax = wx - cam.x, ay = wy - cam.y; return { z: ax * dx + ay * dy, l: -ax * dy + ay * dx }; };
  const sy = (h, z) => hz - (FOC * (h - 0.5)) / z;
  // a billboard standing between heights h0 and h1
  function billboard(wx, wy, h0, h1, width, sp, paint, turned = false) {
    const { z, l } = toCam(wx, wy);
    if (z < 0.12) return;
    const cx = RW / 2 + (FOC * l) / z, wpx = (FOC * width) / z;
    const yt = sy(h1, z), yb = sy(h0, z);
    for (let x = Math.max(0, Math.floor(cx - wpx / 2)); x < Math.min(RW, Math.ceil(cx + wpx / 2)); x++) {
      if (z >= zbuf[x]) continue;
      const u = Math.floor(((x + 0.5 - (cx - wpx / 2)) / wpx) * sp.w);
      if (u < 0 || u >= sp.w) continue;
      for (let y = Math.max(0, Math.floor(yt)); y < Math.min(RH, Math.ceil(yb)); y++) {
        const v = Math.floor(((y + 0.5 - yt) / (yb - yt)) * sp.h);
        if (v < 0 || v >= sp.h) continue;
        const p = turned ? tget(sp, sp.w - 1 - u, sp.h - 1 - v) : tget(sp, u, v);
        if (p !== T_) img[y * RW + x] = paint ? paint(p, img[y * RW + x]) : p;
      }
    }
  }
  // the crab
  const crab = crabAt(t);
  if (crab) billboard(crab.x, crab.y, 0, (0.5 * CRAB_H) / CRAB_W, 0.5, CRAB[crab.moving ? tk % 2 : 0]);
  // the rock: a squashed icosahedron, spinning, flat-shaded
  if (tk < ROCK_TOUCH) drawRock(img, zbuf, toCam, sy, t, cam);
  // the sun at the exit, translucent. It is only ever seen after the flip,
  // so it is drawn upside down, which the roll turns the right way up.
  const bob = 0.035 * Math.sin((moveClock(tk) / FPS) * Math.PI * 2 * 0.8);
  billboard(EXIT.x + 0.5, EXIT.y + 0.5, 0.2 + bob, 0.8 + bob, 0.6, SUN, (p, under) => (p === 1 ? tint(under, SUN_Y, 0.62) : p === 2 ? tint(under, SUN_O, 0.55) : SUN_FACE), true);
  return img;
}

const PHI = (1 + Math.sqrt(5)) / 2;
const ICO_V = [[-1, PHI, 0], [1, PHI, 0], [-1, -PHI, 0], [1, -PHI, 0], [0, -1, PHI], [0, 1, PHI], [0, -1, -PHI], [0, 1, -PHI], [PHI, 0, -1], [PHI, 0, 1], [-PHI, 0, -1], [-PHI, 0, 1]]
  .map((v) => { const n = Math.hypot(...v); return v.map((c) => c / n); });
const ICO_F = [[0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11], [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8], [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9], [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]];
const ROCKG = ['#3e4247', '#555b61', '#6f767c', '#8c9399', '#aab0b5', '#c9cdd1'].map(col);
function drawRock(img, zbuf, toCam, sy, t, cam) {
  const ang = t * 2.4, tilt = 0.45;
  const ca = Math.cos(ang), sa = Math.sin(ang), ct = Math.cos(tilt), st = Math.sin(tilt);
  const R = 0.15, cx = ROCK.x + 0.5, cy = ROCK.y + 0.5, ch = 0.42;
  // world: x east, y south, h up. Spin about a tilted vertical axis.
  const wv = ICO_V.map(([a, b, c]) => {
    let x = a * ca - c * sa, z = a * sa + c * ca, y = b * 0.85;
    const y2 = y * ct - z * st, z2 = y * st + z * ct;
    return [cx + x * R, cy + z2 * R, ch + y2 * R];
  });
  const L = [-0.45, -0.35, 0.82];
  const faces = [];
  for (const f of ICO_F) {
    const [A, B, C] = f.map((i) => wv[i]);
    const u = [B[0] - A[0], B[1] - A[1], B[2] - A[2]], v = [C[0] - A[0], C[1] - A[1], C[2] - A[2]];
    let n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
    const nl = Math.hypot(...n); n = n.map((q) => q / nl);
    const mid = [(A[0] + B[0] + C[0]) / 3, (A[1] + B[1] + C[1]) / 3, (A[2] + B[2] + C[2]) / 3];
    // outward normal: away from the centre
    if (n[0] * (mid[0] - cx) + n[1] * (mid[1] - cy) + n[2] * (mid[2] - ch) < 0) n = n.map((q) => -q);
    const pts = [A, B, C].map((P) => { const q = toCam(P[0], P[1]); return q.z > 0.1 ? { x: RW / 2 + (FOC * q.l) / q.z, y: sy(P[2], q.z), z: q.z } : null; });
    if (pts.some((p) => !p)) continue;
    if (n[0] * (mid[0] - cam.x) + n[1] * (mid[1] - cam.y) + n[2] * (mid[2] - 0.5) >= 0) continue;
    const lit = Math.max(0, n[0] * L[0] + n[1] * L[1] + n[2] * L[2]);
    faces.push({ pts, z: (pts[0].z + pts[1].z + pts[2].z) / 3, c: ROCKG[Math.min(5, Math.floor(0.6 + lit * 5.2))] });
  }
  faces.sort((a, b) => b.z - a.z);
  for (const f of faces) {
    const [a, b, c] = f.pts;
    const minx = Math.max(0, Math.floor(Math.min(a.x, b.x, c.x))), maxx = Math.min(RW - 1, Math.ceil(Math.max(a.x, b.x, c.x)));
    const miny = Math.max(0, Math.floor(Math.min(a.y, b.y, c.y))), maxy = Math.min(RH - 1, Math.ceil(Math.max(a.y, b.y, c.y)));
    const e = (p, q, x, y) => (q.x - p.x) * (y - p.y) - (q.y - p.y) * (x - p.x);
    const s = Math.sign(e(a, b, c.x, c.y));
    for (let y = miny; y <= maxy; y++) for (let x = minx; x <= maxx; x++) {
      const X = x + 0.5, Y = y + 0.5;
      if (s * e(a, b, X, Y) >= 0 && s * e(b, c, X, Y) >= 0 && s * e(c, a, X, Y) >= 0 && f.z < zbuf[x]) img[y * RW + x] = f.c;
    }
  }
}

// ------------------------------------------------------------------ frames
const frameKey = new Map();
const uniq = [];          // unique frame buffers
const film = [];          // [tick, unique index] whenever the picture changes
for (let tk = 0; tk < TICKS; tk++) {
  const img = render(tk);
  const k = Buffer.from(img).toString('base64');
  if (!frameKey.has(k)) { frameKey.set(k, uniq.length); uniq.push(img); }
  const fi = frameKey.get(k);
  if (!film.length || film[film.length - 1][1] !== fi) film.push([tk, fi]);
}
if (PAL.length > 256) throw new Error(`palette too big: ${PAL.length}`);
// Order the frames in the strip so that each one looks as much as possible
// like the one before it: deflate can only look back 32 KB, about two frames,
// and frames a whole cell apart in a uniform corridor are nearly identical.
// The film keyframes just point at wherever each frame ended up.
const ORDER = (() => {
  const n = uniq.length;
  const sim = (a, b) => { let s = 0; for (let i = 0; i < a.length; i++) if (a[i] === b[i]) s++; return s; };
  const S = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) S[i][j] = S[j][i] = sim(uniq[i], uniq[j]);
  const ord = [0], used = new Set([0]);
  while (ord.length < n) {
    const last = ord[ord.length - 1]; let best = -1, bs = -1;
    for (let j = 0; j < n; j++) if (!used.has(j) && S[last][j] > bs) { bs = S[last][j]; best = j; }
    ord.push(best); used.add(best);
  }
  // then 2-opt: reverse any run of the chain that makes neighbours more alike
  let o = ord, again = true;
  for (let pass = 0; again && pass < 50; pass++) {
    again = false;
    for (let i = 0; i < n - 2; i++) for (let j = i + 2; j < n; j++) {
      const a = o[i], b = o[i + 1], c = o[j], d = j + 1 < n ? o[j + 1] : -1;
      if (S[a][c] + (d >= 0 ? S[b][d] : 0) > S[a][b] + (d >= 0 ? S[c][d] : 0)) {
        o = [...o.slice(0, i + 1), ...o.slice(i + 1, j + 1).reverse(), ...o.slice(j + 1)];
        again = true;
      }
    }
  }
  return o;
})();
const SLOT = new Array(uniq.length); ORDER.forEach((fi, k) => { SLOT[fi] = k; });
const FH = RH + 2; // frame plus guard rows
const strip = new Uint8Array(RW * FH * uniq.length);
uniq.forEach((im, i) => {
  const o = SLOT[i] * FH * RW;
  strip.set(im.subarray(0, RW), o);
  strip.set(im, o + RW);
  strip.set(im.subarray((RH - 1) * RW), o + (RH + 1) * RW);
});
const STRIP_PNG = encodePng(RW, FH * uniq.length, strip, PAL);
const frameY = (i) => -(SLOT[i] * FH + 1) * PX;
const frameAtTick = (tk) => { let f = film[0][1]; for (const [t0, i] of film) if (t0 <= tk) f = i; return f; };

if (SHEET) {
  fs.mkdirSync(SHEET, { recursive: true });
  const S = 3, cols = 6, n = uniq.length, rows = Math.ceil(n / cols);
  const CW = cols * (RW * S + 6), CH = rows * (RH * S + 6);
  const sheet = new Uint8Array(CW * CH);
  uniq.forEach((im, i) => {
    const ox = (i % cols) * (RW * S + 6), oy = Math.floor(i / cols) * (RH * S + 6);
    for (let y = 0; y < RH * S; y++) for (let x = 0; x < RW * S; x++) sheet[(oy + y) * CW + ox + x] = im[Math.floor(y / S) * RW + Math.floor(x / S)];
  });
  fs.writeFileSync(path.join(SHEET, `${SLUG}-frames.png`), encodePng(CW, CH, sheet, PAL));
  console.log(`sheet: ${n} frames`);
}

// ------------------------------------------------------------------ SVG bits
const pct = (sec) => `${r3((100 * sec) / T)}%`;
// Merge a bitmap (rows of strings) into horizontal runs, one path.
function bitmapPath(rowsList, ox, oy, s) {
  let d = '';
  rowsList.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      if (row[x] !== '#') { x++; continue; }
      let e = x; while (e < row.length && row[e] === '#') e++;
      d += `M${r2(ox + x * s)} ${r2(oy + y * s)}h${r2((e - x) * s)}v${r2(s)}h${r2(-(e - x) * s)}z`;
      x = e;
    }
  });
  return d;
}
function textRows(str, font = FONT5) {
  const gl = [...str].map((ch) => glyph(font, ch));
  const h = gl[0].length;
  return Array.from({ length: h }, (_, y) => gl.map((g) => g[y]).join('.'));
}
const textW = (str, s, font = FONT5) => textRows(str, font)[0].length * s;
// Panel text: every glyph is defined once in <defs> and placed with <use>.
const GLYPHS = new Set();
const gid = (ch) => `g${ch.charCodeAt(0)}`;
function textPath(str, x, y, s, fill) {
  let out = `<g fill="${fill}" transform="translate(${r2(x)} ${r2(y)}) scale(${s})">`;
  let cx = 0;
  for (const ch of str) {
    const g = glyph(FONT5, ch);
    if (ch !== ' ') { GLYPHS.add(ch); out += `<use href="#${gid(ch)}"${cx ? ` x="${cx}"` : ''}/>`; }
    cx += g[0].length + 1;
  }
  return out + '</g>';
}
const glyphDefs = () => [...GLYPHS].map((ch) => `<path id="${gid(ch)}" d="${bitmapPath(glyph(FONT5, ch), 0, 0, 1)}"/>`).join('');

// Title: block letters on a cell grid, brick-filled, outlined like map walls.
const BLOCK = {
  C: ['###', '#..', '#..', '#..', '###'], A: ['###', '#.#', '###', '#.#', '#.#'],
  S: ['###', '#..', '###', '..#', '###'], T: ['###', '.#.', '.#.', '.#.', '.#.'],
  W: ['#...#', '#...#', '#.#.#', '#.#.#', '#####'], Y: ['#.#', '#.#', '###', '.#.', '.#.'],
};
function titleSvg(word, x0, y0, cell) {
  const cols = []; // global cell grid
  let cx = 0;
  for (const ch of word) { const g = BLOCK[ch]; g.forEach((row, y) => [...row].forEach((p, x) => { if (p === '#') cols.push([cx + x, y]); })); cx += g[0].length + 1; }
  const on = new Set(cols.map(([x, y]) => `${x},${y}`));
  const has = (x, y) => on.has(`${x},${y}`);
  // fill: merged rows
  let fill = '';
  for (let y = 0; y < 5; y++) {
    let x = 0;
    while (x < cx) { if (!has(x, y)) { x++; continue; } let e = x; while (has(e, y)) e++; fill += `M${x0 + x * cell} ${y0 + y * cell}h${(e - x) * cell}v${cell}h${-(e - x) * cell}z`; x = e; }
  }
  // outline: edges between on and off cells, merged into runs
  const hseg = [], vseg = [];
  for (let y = 0; y <= 5; y++) for (let x = 0; x < cx; x++) if (has(x, y) !== has(x, y - 1)) hseg.push([x, y]);
  for (let x = 0; x <= cx; x++) for (let y = 0; y < 5; y++) if (has(x, y) !== has(x - 1, y)) vseg.push([x, y]);
  let line = '';
  for (let y = 0; y <= 5; y++) { let x = 0; while (x < cx) { if (!hseg.some(([a, b]) => a === x && b === y)) { x++; continue; } let e = x; while (hseg.some(([a, b]) => a === e && b === y)) e++; line += `M${x0 + x * cell} ${y0 + y * cell}H${x0 + e * cell}`; x = e; } }
  for (let x = 0; x <= cx; x++) { let y = 0; while (y < 5) { if (!vseg.some(([a, b]) => a === x && b === y)) { y++; continue; } let e = y; while (vseg.some(([a, b]) => a === x && b === e)) e++; line += `M${x0 + x * cell} ${y0 + y * cell}V${y0 + e * cell}`; y = e; } }
  return { fill, line, width: (cx - 1) * cell }; // no trailing gap
}

// ------------------------------------------------------------------ map
const MCELL = 34, MX0 = 664, MY0 = 128;
const mx = (cx) => MX0 + cx * MCELL, my = (cy) => MY0 + cy * MCELL;
function mazePath() {
  let d = '';
  for (let y = 0; y <= NY; y++) { let x = 0; while (x < NX) { if (!Hw[y][x]) { x++; continue; } let e = x; while (e < NX && Hw[y][e]) e++; d += `M${mx(x)} ${my(y)}H${mx(e)}`; x = e; } }
  for (let x = 0; x <= NX; x++) { let y = 0; while (y < NY) { if (!Vw[y][x]) { y++; continue; } let e = y; while (e < NY && Vw[e][x]) e++; d += `M${mx(x)} ${my(y)}V${my(e)}`; y = e; } }
  return d;
}
// walker keyframes (smooth between segment ends), in map pixels and degrees
function walkerKeys() {
  const keys = [];
  const put = (tk, p) => keys.push(`${pct(tk / FPS)}{transform:translate(${r1(MX0 + p.x * MCELL)}px,${r1(MY0 + p.y * MCELL)}px) rotate(${r1((p.a * 180) / Math.PI)}deg)}`);
  put(0, segs[0].from);
  for (const s of segs) put(s.t1, s.to);
  return keys.join('');
}
// the trail: how far along the route polyline the walker is
const routePts = [[segs[0].from.x, segs[0].from.y]];
for (const s of segs) if (s.kind === 'F') routePts.push([s.to.x, s.to.y]);
const routeLen = MCELL * routePts.reduce((a, p, i) => (i ? a + Math.hypot(p[0] - routePts[i - 1][0], p[1] - routePts[i - 1][1]) : 0), 0);
function trailKeys() {
  const keys = [`0%{stroke-dashoffset:${r3(routeLen)}}`];
  let done = 0;
  for (const s of segs) {
    if (s.kind === 'F') { keys.push(`${pct(s.t0 / FPS)}{stroke-dashoffset:${r3(routeLen - done)}}`); done += MCELL * Math.hypot(s.to.x - s.from.x, s.to.y - s.from.y); keys.push(`${pct(s.t1 / FPS)}{stroke-dashoffset:${r3(routeLen - done)}}`); }
  }
  keys.push(`${pct(EXITH.t0 / FPS + 0.5)}{stroke-dashoffset:0;opacity:1}`, `${pct(T - 0.02)}{stroke-dashoffset:0;opacity:0}`, `100%{stroke-dashoffset:${r3(routeLen)};opacity:0}`);
  return keys.join('');
}
function crabKeys() {
  const keys = CRAB_PATH.map(([t, x, y]) => `${pct(t)}{transform:translate(${r1(MX0 + x * MCELL)}px,${r1(MY0 + y * MCELL)}px);opacity:${t < CRAB_GONE ? 1 : 0}}`);
  keys.push(`${pct(CRAB_GONE + 0.3)}{transform:translate(${r1(MX0 + 4.5 * MCELL)}px,${r1(MY0 + 0.5 * MCELL)}px);opacity:0}`);
  keys.push(`${pct(T - 0.3)}{transform:translate(${r1(MX0 + 1.75 * MCELL)}px,${r1(MY0 + 4.5 * MCELL)}px);opacity:0}`);
  keys.push(`100%{transform:translate(${r1(MX0 + 1.75 * MCELL)}px,${r1(MY0 + 4.5 * MCELL)}px);opacity:1}`);
  return keys.join('');
}

// ------------------------------------------------------------------ assemble
const flipT0 = ROCK_TOUCH / FPS, flipT1 = (FLIP.t1 - 1) / FPS;
function flipKeys() {
  const ks = [`0%,${pct(flipT0)}{transform:translate(320px,200px) rotate(0deg) scale(1) translate(-320px,-200px)}`];
  const n = 12;
  for (let i = 1; i <= n; i++) {
    const u = i / n, e = u < 0.5 ? 2 * u * u : 1 - 2 * (1 - u) * (1 - u);
    const th = Math.PI * e;
    const s = Math.abs(Math.cos(th)) + (VW / VH) * Math.abs(Math.sin(th));
    ks.push(`${pct(lerp(flipT0, flipT1, u))}{transform:translate(320px,200px) rotate(${r1((th * 180) / Math.PI)}deg) scale(${r3(Math.max(1, s * 1.02))}) translate(-320px,-200px)}`);
  }
  ks.push(`100%{transform:translate(320px,200px) rotate(180deg) scale(1) translate(-320px,-200px)}`);
  return ks.join('');
}
const filmKeys = film.map(([tk, i]) => `${pct(tk / FPS)}{transform:translateY(${frameY(i)}px)}`).join('');
const xfadeT0 = EXITH.t0 / FPS + 0.15;
const fadeKeys = `0%{opacity:1}0.01%,${pct(xfadeT0)}{opacity:0}${pct(T - 0.05)},100%{opacity:1}`;

// status text that changes at the flip
const flipPct = pct(flipT0 + 0.5);
const swapA = `0%,${flipPct}{opacity:1}${pct(flipT0 + 0.51)},${pct(T - 0.05)}{opacity:0}100%{opacity:1}`;
const swapB = `0%,${flipPct}{opacity:0}${pct(flipT0 + 0.51)},${pct(T - 0.05)}{opacity:1}100%{opacity:0}`;
const rockKeys = `0%,${pct(flipT0 - 0.1)}{opacity:1}${pct(flipT0)},${pct(T - 0.05)}{opacity:0}100%{opacity:1}`;

// the still for reduced motion (and the base state of every animated thing)
const stillTick = Math.round(STATIC_T * FPS);
const stillPose = poseAt(stillTick);
const stillCrab = crabAt(STATIC_T);

// The title is as wide as the map below it (and centred on the panel, like
// the map), so it no longer crowds the divider.
const TC = 8.5; // title cell
const title = titleSvg('CASTAWAY', 0, 0, TC);
const TX = 640 + (320 - title.width) / 2, TY = 24;
// two brick courses a cell, drawn for a 9-unit cell and scaled to fit
const brickPattern = `<pattern id="bk" patternUnits="userSpaceOnUse" width="18" height="9" patternTransform="translate(${r2(TX)} ${TY}) scale(${r3(TC / 9)})"><rect width="18" height="9" fill="#d6ccbb"/><path fill="#ab3f2a" d="M0 1h8v3.5H0zM9 1h8v3.5H9zM-4.5 5.5h8v3.5h-8zM4.5 5.5h8v3.5h-8zM13.5 5.5h8v3.5h-8z"/><path fill="#c65a3e" d="M9 1h8v1H9zM-4.5 5.5h8v1h-8zM13.5 5.5h8v1h-8z"/><path fill="#8e2f1f" d="M4.5 8h8v1h-8zM0 3.5h8v1H0z"/></pattern>`;

const css = `
.film{transform:translateY(${frameY(frameAtTick(stillTick))}px);animation:film ${T}s step-end infinite}
.flip{animation:flip ${T}s linear infinite}
.xf{opacity:0;animation:xf ${T}s linear infinite}
.walker{transform:translate(${r1(MX0 + stillPose.x * MCELL)}px,${r1(MY0 + stillPose.y * MCELL)}px) rotate(${r1((stillPose.a * 180) / Math.PI)}deg);animation:walk ${T}s linear infinite}
.trail{stroke-dasharray:${r3(routeLen)} ${r3(routeLen + 1)};stroke-dashoffset:${r3(routeLen - MCELL * (stillPose.x - 0.5))};animation:trail ${T}s linear infinite}
.crab{transform:translate(${r1(MX0 + stillCrab.x * MCELL)}px,${r1(MY0 + stillCrab.y * MCELL)}px);animation:crab ${T}s linear infinite}
.rock{animation:rock ${T}s step-end infinite}
.wf{animation:wf ${T}s linear infinite}
.spin{animation:spin 2.5s linear infinite}
.sa{animation:sa ${T}s step-end infinite}
.sb{opacity:0;animation:sb ${T}s step-end infinite}
@keyframes film{${filmKeys}}
@keyframes flip{${flipKeys()}}
@keyframes xf{${fadeKeys}}
@keyframes walk{${walkerKeys()}}
@keyframes trail{${trailKeys()}}
@keyframes crab{${crabKeys()}}
@keyframes rock{${rockKeys}}
@keyframes wf{0%,${pct(EXITH.t0 / FPS + 0.2)}{opacity:1}${pct(T - 0.1)},100%{opacity:0}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes sa{${swapA}}
@keyframes sb{${swapB}}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}
${AT !== null ? `*{animation-delay:-${AT}s!important;animation-play-state:paused!important}` : ''}`.trim();

const ALT = 'CASTAWAY, as a 1990s 3D maze screensaver. On the left, a first-person walk through a pixelated maze of red brick walls, wooden floorboards and pale speckled ceiling tiles. A hermit crab wearing a coconut does a little sidestep, then scuttles ahead down a long corridor, past two life rings, to a framed sign on the far wall that reads CASTAWAY, 10:00:00. Keeping its right hand on the wall, the walker passes a painting of a tiny island with one palm and a young woman in headphones, then heads for a poster of a shark in headphones, where a grey polyhedron rock spins in mid-air. It touches the rock and the whole view rolls upside down. Now on the left-hand wall, it walks to within one cell of the exit, a translucent smiling sun, then turns away into a dead end with a picture of a bottle and a U-turn arrow, comes straight back and walks into the sun, and the maze starts again. On the right, the overlay map in thin white lines: a blue triangle walking and leaving a blue trail, a red start, a green smiling exit, a spinning white triangle for the rock, small white triangles for the pictures, and an orange dot for the crab, which reaches the exit first. Above the map, CASTAWAY in brick letters and the line: an island is a maze with one room. Below it, a legend, HAND ON WALL: RIGHT, which turns to LEFT after the rock, and SEED 1992, ALWAYS DAYTIME.';

const P = [];
P.push(`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="t d">`);
P.push(`<title id="t">CASTAWAY</title><desc id="d">${ALT}</desc>`);
P.push(`<style>${css}</style>`);
P.push('<defs>');
P.push(`<clipPath id="pc"><rect width="${W}" height="${H}" rx="16"/></clipPath>`);
P.push(`<clipPath id="vc"><rect width="${VW}" height="${VH}"/></clipPath>`);
P.push(`<image id="fs" width="${VW}" height="${FH * uniq.length * PX}" preserveAspectRatio="none" style="image-rendering:pixelated" image-rendering="optimizeSpeed" href="data:image/png;base64,${STRIP_PNG.toString('base64')}"/>`);
P.push(brickPattern);
P.push('%%GLYPHS%%');
P.push('</defs>');
P.push('<g clip-path="url(#pc)">');
P.push(`<rect width="${W}" height="${H}" fill="#050608"/>`);
// the view
P.push(`<g clip-path="url(#vc)"><rect width="${VW}" height="${VH}" fill="#000"/>`);
P.push('<g class="flip"><g class="film"><use href="#fs" xlink:href="#fs"/></g></g>');
P.push(`<g class="xf"><use href="#fs" xlink:href="#fs" y="${frameY(0)}"/></g>`);
P.push('</g>');
P.push(`<path d="M${VW + 0.5} 0V${H}" stroke="#2a2f36" stroke-width="1"/>`);
// right panel: title
P.push(`<g><path fill="url(#bk)" d="${titleSvg('CASTAWAY', TX, TY, TC).fill}"/><path fill="none" stroke="#f4efe4" stroke-width="2" stroke-linecap="square" d="${titleSvg('CASTAWAY', TX, TY, TC).line}"/></g>`);
const sub = 'AN ISLAND IS A MAZE';
const sub2 = 'WITH ONE ROOM';
P.push(textPath(sub, 640 + (320 - textW(sub, 2)) / 2, 76, 2, '#c9d1da'));
P.push(textPath(sub2, 640 + (320 - textW(sub2, 2)) / 2, 94, 2, '#c9d1da'));
// map
P.push(`<path fill="none" stroke="#e9eef3" stroke-width="2" stroke-linecap="square" d="${mazePath()}"/>`);
const rp = routePts.map(([x, y], i) => `${i ? 'L' : 'M'}${r1(MX0 + x * MCELL)} ${r1(MY0 + y * MCELL)}`).join('');
P.push(`<path class="trail" fill="none" stroke="#3d7bff" stroke-opacity=".55" stroke-width="3" stroke-linejoin="round" d="${rp}"/>`);
// posters: still white triangles pointing at their walls
const posterMarks = Object.keys(FACE_TEX).map((k) => {
  const [x, y, s] = k.split(','); const cx = MX0 + (+x + 0.5) * MCELL, cy = MY0 + (+y + 0.5) * MCELL;
  const o = { E: [1, 0], W: [-1, 0], S: [0, 1], N: [0, -1] }[s];
  const tx = cx + o[0] * 10, ty = cy + o[1] * 10, px = -o[1], py = o[0];
  return `M${r1(tx + o[0] * 5)} ${r1(ty + o[1] * 5)}L${r1(tx + px * 4)} ${r1(ty + py * 4)}L${r1(tx - px * 4)} ${r1(ty - py * 4)}z`;
}).join('');
P.push(`<path fill="#e9eef3" d="${posterMarks}"/>`);
P.push(`<rect x="${mx(START.x) + 11}" y="${my(START.y) + 11}" width="12" height="12" fill="#ff3b30"/>`);
P.push(`<g transform="translate(${mx(EXIT.x) + 17} ${my(EXIT.y) + 17})"><circle r="8" fill="#2ee66b"/><path d="M-3.5 1.5q3.5 3.5 7 0" fill="none" stroke="#06380f" stroke-width="1.6" stroke-linecap="round"/><rect x="-3.5" y="-3.5" width="2" height="2.4" fill="#06380f"/><rect x="1.5" y="-3.5" width="2" height="2.4" fill="#06380f"/></g>`);
P.push(`<g class="rock" transform="translate(${mx(ROCK.x) + 17} ${my(ROCK.y) + 17})"><path class="spin" d="M0-8L7 4H-7z" fill="#ffffff"/></g>`);
P.push('<g class="crab"><circle r="4.5" fill="#ff8a2a"/></g>');
P.push('<g class="wf"><g class="walker"><path d="M9 0L-6 6.5L-3 0L-6-6.5z" fill="#3d7bff" stroke="#bcd0ff" stroke-width="1"/></g></g>');
// legend and status
const LY = 312;
const leg = [
  ['#3d7bff', 'tri', 'YOU'], ['#ff3b30', 'sq', 'START'], ['#2ee66b', 'dot', 'EXIT'],
];
const leg2 = [['#ff8a2a', 'dot', 'CRAB'], ['#ffffff', 'tri', 'ROCK'], ['#e9eef3', 'tri', 'PICTURE']];
function legendRow(items, y) {
  let x = 664; const out = [];
  for (const [c, kind, label] of items) {
    if (kind === 'tri') out.push(`<path d="M${x + 10} ${y + 5.5}L${x} ${y + 11}L${x} ${y}z" fill="${c}"/>`);
    if (kind === 'sq') out.push(`<rect x="${x}" y="${y}" width="10" height="10" fill="${c}"/>`);
    if (kind === 'dot') out.push(`<circle cx="${x + 5}" cy="${y + 5.5}" r="5" fill="${c}"/>`);
    out.push(textPath(label, x + 16, y + 1, 1.4, '#9aa6b2'));
    x += 16 + textW(label, 1.4) + 18;
  }
  return out.join('');
}
P.push(legendRow(leg, LY), legendRow(leg2, LY + 18));
const HY = 352;
P.push(textPath('HAND ON WALL:', 664, HY, 2, '#9aa6b2'));
const hx = 664 + textW('HAND ON WALL: ', 2);
P.push(`<g class="sa">${textPath('RIGHT', hx, HY, 2, '#6f9bff')}</g>`);
P.push(`<g class="sb">${textPath('LEFT', hx, HY, 2, '#ffd23f')}</g>`);
P.push(textPath('SEED 1992 - ALWAYS DAYTIME', 664, HY + 22, 1.4, '#6b7682'));
P.push('</g>');
P.push('</svg>');
const svg = P.join('\n').replace('%%GLYPHS%%', glyphDefs());
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, svg);
console.log(`${path.relative(process.cwd(), OUT)}: ${(svg.length / 1024).toFixed(1)} KB, strip ${uniq.length} frames ${(STRIP_PNG.length / 1024).toFixed(1)} KB, palette ${PAL.length}, loop ${T}s, moves ${MOVES.join('')}`);
