// "8-bit console title screen" README banner for CASTAWAY.
//
//   node examples/castaway/src/71-console-title-screen_opus_5.5.mjs
//   node examples/castaway/src/71-console-title-screen_opus_5.5.mjs --at=18 --out=some/where.svg
//   node examples/castaway/src/71-console-title-screen_opus_5.5.mjs --zoom=4 --out=some/where.svg
//
// Regenerates ../assets/71-console-title-screen_opus_5.5.svg (the title card,
// its demo card and two debugger panels) and
// ../assets/71-console-title-screen_opus_5.5-sound-test.svg (the sound test
// card). Plain Node, no deps, deterministic: no clock, no Math.random (one
// seeded PRNG for the wave marks). --at=SECONDS bakes a head start into every
// animation so late frames can be screenshotted without waiting; --zoom makes
// the intrinsic size bigger for pixel checks. Use both only with --out.
//
// The style: the cartridge-console title card of 1983 to the early 1990s
// (catalogue entry mach-09). A 256x240 picture built from 8x8 tiles, coloured
// in 16x16 zones, each zone choosing one of four background palettes of three
// colours plus one shared backdrop colour. A big tile logo with a hard shadow,
// a short menu with a sprite cursor, a copyright line, a blinking start
// prompt, and after a while a hard cut to a demo card and back. No game's
// logo, font, characters or layout is copied: the logo, the 8x8 font, the
// sprites and every word are drawn and written for this file.
//
// How it is built, and what the generator checks
//   * The 64-entry palette is not copied from any emulator: it is decoded
//     below from the composite signal levels published on the NESdev wiki
//     ("NTSC video": the 12-phase square wave, black 0.312, white 1.100, the
//     YUV matrix there), with no emphasis and no gamma tweak. Like every NES
//     palette in circulation it is one decoder's opinion.
//   * Each card is drawn as a 256x240 grid of palette indices. solveZones()
//     then gives every 16x16 zone one of the four background palettes and
//     refuses to continue if any zone needs more than its palette's three
//     colours plus the backdrop. Decorative pixels (wave marks, cloud shade)
//     that a zone's palette cannot show are simply left out, as on hardware.
//   * Every 8x8 sprite tile must fit one of four sprite palettes, and the
//     timeline is sampled 30 times a second to check that no scanline ever
//     carries more than eight sprite tiles.
//   * The tile count, colour count, zone map and sprite load shown in the
//     side panels are computed from the cards, not typed in.
//   * One palette entry cycles (background palette 0, colour 3): the
//     highlight along the top of the logo and the foam round the island
//     shimmer together without a pixel moving. The sea's wave tiles swap
//     between two drawings every two beats.
//   * Timing is the theme's: 80 BPM, 0.75 s a beat, 3 s a bar. The banner
//     loops every 30 s (ten bars): title card, a hard cut to the demo card at
//     15 s, a hard cut back at 27 s with the logo dropping in, and the loop
//     lands on the opening frame. The start prompt blinks once a beat and a
//     half; nothing larger than a few tiles changes faster than that.
//   * prefers-reduced-motion stops everything on the opening title frame.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const arg = (name) => {
  const hit = process.argv.slice(2).find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : null;
};
const T0 = Number(arg('at') || 0);
const ZOOM = Number(arg('zoom') || 2);
const CROP = arg('crop') ? arg('crop').split(',').map(Number) : null; // dev only: x,y,w,h
const OUT_DIR = path.resolve(here, '../assets');
const OUT_MAIN = arg('out') ? path.resolve(arg('out')) : path.join(OUT_DIR, '71-console-title-screen_opus_5.5.svg');
const OUT_SOUND = arg('out')
  ? path.resolve(arg('out')).replace(/\.svg$/, '-sound-test.svg')
  : path.join(OUT_DIR, '71-console-title-screen_opus_5.5-sound-test.svg');

const n = (v, d = 3) => String(+(+v).toFixed(d));

// ------------------------------------------------------------------ palette
// Decode all 64 entries from the composite signal (NESdev wiki, NTSC video).
function decodePalette() {
  const levels = [0.228, 0.312, 0.552, 0.880, 0.616, 0.840, 1.100, 1.100];
  const black = 0.312;
  const white = 1.100;
  const signal = (px, phase) => {
    const hue = px & 15;
    let lum = (px >> 4) & 3;
    if (hue > 13) lum = 1;
    let lo = levels[lum];
    let hi = levels[4 + lum];
    if (hue === 0) lo = hi;
    if (hue > 12) hi = lo;
    return (hue + phase) % 12 < 6 ? hi : lo;
  };
  const out = [];
  for (let px = 0; px < 64; px++) {
    let y = 0;
    let u = 0;
    let v = 0;
    for (let p = 0; p < 12; p++) {
      const s = (signal(px, p) - black) / (white - black) / 12;
      y += s;
      u += s * Math.sin((Math.PI * (p + 3 - 0.5)) / 6) * 2;
      v += s * Math.cos((Math.PI * (p + 3 - 0.5)) / 6) * 2;
    }
    const cl = (x) => Math.max(0, Math.min(255, Math.round(255 * x)));
    const rgb = [cl(y + 1.139883 * v), cl(y - 0.394642 * u - 0.580622 * v), cl(y + 2.032062 * u)];
    out.push('#' + rgb.map((c) => c.toString(16).padStart(2, '0')).join(''));
  }
  return out;
}
const NES = decodePalette();
const hx = (c) => c.toString(16).toUpperCase().padStart(2, '0');

// The colours this cartridge uses (NES palette indices).
const NAVY = 0x01;
const LBLUE = 0x21;
const SKY = 0x2c;
const WHITE = 0x30;
const SAND = 0x37;
const GOLD = 0x27;
const BROWN = 0x17;
const DBROWN = 0x07;
const GREEN = 0x1a;
const SKIN = 0x36;
const CORAL = 0x26;
const GREY = 0x00;
const LGREY = 0x10;

const BACKDROP = SKY;
// Four background palettes and four sprite palettes, three colours each.
const BGP = [
  [NAVY, SAND, WHITE], // 0: logo top, island sand and its foam (colour 3 cycles)
  [NAVY, GOLD, BROWN], // 1: logo bottom, the raft
  [NAVY, LBLUE, WHITE], // 2: sea, clouds, every line of text
  [NAVY, GREEN, SAND], // 3: palm fronds and trunk (and the T)
];
const SPP = [
  [DBROWN, SKIN, CORAL], // 0: her middle: coral top, arms
  [DBROWN, SKIN, WHITE], // 1: her head and legs: hair, cream headphones and shorts
  [DBROWN, BROWN, CORAL], // 2: coconut, hermit crab
  [GREY, LGREY, WHITE], // 3: the shark fin, its headphones, the bonk star
];
const CYCLE = { pal: 0, slot: 3, seq: [WHITE, 0x3c, SKY, 0x3c], step: 0.375 };

// ------------------------------------------------------------------ timing
const BEAT = 0.75; // 80 BPM
const BAR = 3;
const L = 30; // ten bars
const TITLE_A = [0, 15];
const DEMO = [15, 27];
const TITLE_B = [27, 30];

// ------------------------------------------------------------------ grid
const W = 256;
const H = 240;
class Grid {
  constructor(w = W, h = H) {
    this.w = w;
    this.h = h;
    this.m = new Map();
  }
  set(x, y, c) {
    x = Math.round(x);
    y = Math.round(y);
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    this.m.set(y * this.w + x, c);
  }
  get(x, y) {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return undefined;
    return this.m.get(y * this.w + x);
  }
  has(x, y) {
    return this.get(x, y) !== undefined;
  }
  del(x, y) {
    this.m.delete(y * this.w + x);
  }
  rect(x, y, w, h, c) {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, c);
  }
  *[Symbol.iterator]() {
    for (const [k, c] of this.m) yield [k % this.w, Math.floor(k / this.w), c];
  }
}

// mulberry32, seeded
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ------------------------------------------------------------------ 8x8 font
// Drawn for this file: rounded capitals with two-pixel verticals and
// one-pixel horizontals, a lower case with one-row descenders (for the one
// line that has to be typed exactly), digits and the few signs used.
const G = {
  A: ['.#####.', '##...##', '##...##', '##...##', '#######', '##...##', '##...##'],
  B: ['######.', '##...##', '##...##', '######.', '##...##', '##...##', '######.'],
  C: ['.#####.', '##...##', '##.....', '##.....', '##.....', '##...##', '.#####.'],
  D: ['#####..', '##..##.', '##...##', '##...##', '##...##', '##..##.', '#####..'],
  E: ['#######', '##.....', '##.....', '######.', '##.....', '##.....', '#######'],
  F: ['#######', '##.....', '##.....', '######.', '##.....', '##.....', '##.....'],
  G: ['.#####.', '##...##', '##.....', '##..###', '##...##', '##...##', '.######'],
  H: ['##...##', '##...##', '##...##', '#######', '##...##', '##...##', '##...##'],
  I: ['######.', '..##...', '..##...', '..##...', '..##...', '..##...', '######.'],
  J: ['.....##', '.....##', '.....##', '.....##', '##...##', '##...##', '.#####.'],
  K: ['##...##', '##..##.', '##.##..', '####...', '##.##..', '##..##.', '##...##'],
  L: ['##.....', '##.....', '##.....', '##.....', '##.....', '##.....', '#######'],
  M: ['##...##', '###.###', '#######', '##.#.##', '##...##', '##...##', '##...##'],
  N: ['##...##', '###..##', '####.##', '##.####', '##..###', '##...##', '##...##'],
  O: ['.#####.', '##...##', '##...##', '##...##', '##...##', '##...##', '.#####.'],
  P: ['######.', '##...##', '##...##', '######.', '##.....', '##.....', '##.....'],
  Q: ['.#####.', '##...##', '##...##', '##...##', '##.#.##', '##..##.', '.###.##'],
  R: ['######.', '##...##', '##...##', '######.', '##.##..', '##..##.', '##...##'],
  S: ['.#####.', '##...##', '##.....', '.#####.', '.....##', '##...##', '.#####.'],
  T: ['######.', '..##...', '..##...', '..##...', '..##...', '..##...', '..##...'],
  U: ['##...##', '##...##', '##...##', '##...##', '##...##', '##...##', '.#####.'],
  V: ['##...##', '##...##', '##...##', '##...##', '.##.##.', '..###..', '...#...'],
  W: ['##...##', '##...##', '##...##', '##.#.##', '#######', '###.###', '##...##'],
  X: ['##...##', '##...##', '.##.##.', '..###..', '.##.##.', '##...##', '##...##'],
  Y: ['##...##', '##...##', '.##.##.', '..###..', '..###..', '..###..', '..###..'],
  Z: ['#######', '.....##', '....##.', '...##..', '..##...', '.##....', '#######'],
  0: ['.#####.', '##...##', '##..###', '##.#.##', '###..##', '##...##', '.#####.'],
  1: ['...##..', '..###..', '.####..', '...##..', '...##..', '...##..', '.######'],
  2: ['.#####.', '##...##', '.....##', '..####.', '.##....', '##.....', '#######'],
  3: ['.#####.', '##...##', '.....##', '..####.', '.....##', '##...##', '.#####.'],
  4: ['...###.', '..####.', '.##.##.', '##..##.', '#######', '....##.', '....##.'],
  5: ['#######', '##.....', '######.', '.....##', '.....##', '##...##', '.#####.'],
  6: ['.#####.', '##.....', '##.....', '######.', '##...##', '##...##', '.#####.'],
  7: ['#######', '.....##', '....##.', '...##..', '..##...', '..##...', '..##...'],
  8: ['.#####.', '##...##', '##...##', '.#####.', '##...##', '##...##', '.#####.'],
  9: ['.#####.', '##...##', '##...##', '.######', '.....##', '.....##', '.#####.'],
  a: ['', '', '.#####.', '.....##', '.######', '##...##', '.######'],
  b: ['##.....', '##.....', '######.', '##...##', '##...##', '##...##', '######.'],
  c: ['', '', '.#####.', '##.....', '##.....', '##.....', '.#####.'],
  d: ['.....##', '.....##', '.######', '##...##', '##...##', '##...##', '.######'],
  e: ['', '', '.#####.', '##...##', '#######', '##.....', '.#####.'],
  f: ['..####.', '.##....', '#####..', '.##....', '.##....', '.##....', '.##....'],
  g: ['', '', '.######', '##...##', '##...##', '.######', '.....##', '.#####.'],
  h: ['##.....', '##.....', '######.', '##...##', '##...##', '##...##', '##...##'],
  i: ['..##...', '', '.###...', '..##...', '..##...', '..##...', '.####..'],
  j: ['....##.', '', '...###.', '....##.', '....##.', '....##.', '....##.', '.####..'],
  k: ['##.....', '##.....', '##..##.', '##.##..', '####...', '##.##..', '##..##.'],
  l: ['.###...', '..##...', '..##...', '..##...', '..##...', '..##...', '.####..'],
  m: ['', '', '######.', '##.#.##', '##.#.##', '##.#.##', '##.#.##'],
  n: ['', '', '######.', '##...##', '##...##', '##...##', '##...##'],
  o: ['', '', '.#####.', '##...##', '##...##', '##...##', '.#####.'],
  p: ['', '', '######.', '##...##', '##...##', '######.', '##.....', '##.....'],
  q: ['', '', '.######', '##...##', '##...##', '.######', '.....##', '.....##'],
  r: ['', '', '##.###.', '###..##', '##.....', '##.....', '##.....'],
  s: ['', '', '.######', '##.....', '.#####.', '.....##', '######.'],
  t: ['.##....', '.##....', '#####..', '.##....', '.##....', '.##....', '..###..'],
  u: ['', '', '##...##', '##...##', '##...##', '##...##', '.######'],
  v: ['', '', '##...##', '##...##', '.##.##.', '..###..', '...#...'],
  w: ['', '', '##...##', '##...##', '##.#.##', '##.#.##', '.##.##.'],
  x: ['', '', '##...##', '.##.##.', '..###..', '.##.##.', '##...##'],
  y: ['', '', '##...##', '##...##', '##...##', '.######', '.....##', '.#####.'],
  z: ['', '', '#######', '....##.', '..##...', '.##....', '#######'],
  ' ': [],
  '.': ['', '', '', '', '', '..##...', '..##...'],
  ',': ['', '', '', '', '', '..##...', '..##...', '.##....'],
  ':': ['', '..##...', '..##...', '', '..##...', '..##...', ''],
  '-': ['', '', '', '.#####.', '', '', ''],
  '/': ['......#', '.....##', '....##.', '...##..', '..##...', '.##....', '##.....'],
  '!': ['..##...', '..##...', '..##...', '..##...', '..##...', '', '..##...'],
  '?': ['.#####.', '##...##', '....##.', '...##..', '...##..', '', '...##..'],
  "'": ['..##...', '..##...', '.##....'],
  '(': ['...##..', '..##...', '.##....', '.##....', '.##....', '..##...', '...##..'],
  ')': ['.##....', '..##...', '...##..', '...##..', '...##..', '..##...', '.##....'],
  '+': ['', '..##...', '..##...', '######.', '..##...', '..##...', ''],
  '=': ['', '', '######.', '', '######.', '', ''],
  '>': ['.##....', '..##...', '...##..', '....##.', '...##..', '..##...', '.##....'],
  '%': ['##...##', '##..##.', '...##..', '..##...', '.##....', '##..##.', '##...##'],
  '©': ['.#####.', '#.....#', '#.###.#', '#.#...#', '#.###.#', '#.....#', '.#####.'],
  '♪': ['...##..', '...###.', '...#.##', '...#...', '.###...', '####...', '.##....'],
  '_': ['', '', '', '', '', '', '', '#######'],
  '▼': ['', '', '#######', '.#####.', '..###..', '...#...', ''],
};
function text(grid, s, x, y, c) {
  let cx = x;
  for (const ch of s) {
    const g = G[ch];
    if (!g) throw new Error(`no glyph for ${JSON.stringify(ch)}`);
    g.forEach((row, j) => {
      for (let i = 0; i < row.length; i++) if (row[i] === '#') grid.set(cx + i, y + j, c);
    });
    cx += 8;
  }
}

// ------------------------------------------------------------------ logo
// Letter bodies drawn at half size, doubled, corners rounded, then outlined
// and dropped a hard two-pixel shadow. The T is a palm.
const LOGO = {
  C: ['.#######.', '#########', '###...###', '###......', '###......', '###......', '###......',
    '###......', '###......', '###......', '###...###', '#########', '.#######.'],
  A: ['..#####..', '.#######.', '###...###', '###...###', '###...###', '#########', '#########',
    '###...###', '###...###', '###...###', '###...###', '###...###', '###...###'],
  S: ['.#######.', '#########', '###...###', '###......', '###......', '########.', '.########',
    '......###', '......###', '......###', '###...###', '#########', '.#######.'],
  W: ['###.......###', '###.......###', '###.......###', '###..###..###', '###..###..###',
    '###..###..###', '###..###..###', '###..###..###', '###..###..###', '###..###..###',
    '###..###..###', '#############', '.#####.#####.'],
  Y: ['###...###', '###...###', '###...###', '###...###', '###...###', '#########', '.#######.',
    '...###...', '...###...', '...###...', '...###...', '...###...', '...###...'],
};
const LOGO_Y = 16; // outline top; zone rows 16-32 and 32-48
const LOGO_CELLS = [['C', 24], ['A', 48], ['S', 72], ['T', 96], ['A', 128], ['W', 152], ['A', 184], ['Y', 208]];

function roundCorners(mask, w, h) {
  const at = (x, y) => x >= 0 && y >= 0 && x < w && y < h && mask[y][x];
  const kill = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!at(x, y)) continue;
      for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
        if (!at(x + dx, y) && !at(x, y + dy) && !at(x + dx, y + dy)) kill.push([x, y]);
      }
    }
  }
  for (const [x, y] of kill) mask[y][x] = false;
}

// A thick curve: centre line from (x0,y0) heading dx (+1 right, -1 left),
// rising `rise` per pixel and drooping by `droop` per pixel squared.
function frond(paint, x0, y0, dir, len, rise, droop, w0, w1) {
  const pts = [];
  for (let d = 0; d <= len; d += 0.25) {
    const t = d / len;
    const x = x0 + dir * d;
    const y = y0 - rise * d + droop * d * d;
    const r = (w0 + (w1 - w0) * t) / 2;
    pts.push([x, y, r, t]);
  }
  for (const [x, y, r] of pts) {
    for (let j = Math.floor(y - r); j <= Math.ceil(y + r); j++) {
      for (let i = Math.floor(x - r); i <= Math.ceil(x + r); i++) {
        if ((i + 0.5 - x) ** 2 + (j + 0.5 - y) ** 2 <= r * r) paint(i, j, 'f');
      }
    }
  }
  return pts;
}

function logoLayer() {
  const g = new Grid();
  for (const [ch, x0] of LOGO_CELLS) {
    // body mask in cell coordinates
    const bw = ch === 'W' || ch === 'T' ? 28 : 20;
    const bh = 30;
    const mask = Array.from({ length: bh }, () => Array(bw).fill(false));
    const kind = Array.from({ length: bh }, () => Array(bw).fill(''));
    if (ch !== 'T') {
      const rows = LOGO[ch];
      rows.forEach((row, j) => {
        for (let i = 0; i < row.length; i++) {
          if (row[i] !== '#') continue;
          for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++) mask[1 + j * 2 + b][1 + i * 2 + a] = true;
        }
      });
      roundCorners(mask, bw, bh);
    } else {
      // The palm T, pixelled by hand as a left half and mirrored. The bar is
      // the crown: fronds as wide as the cell, sunlit along the top, midribs
      // meeting over the trunk, two leaf tips drooping on each side like
      // serifs. The stem is a ringed trunk as thick as the other stems.
      // y sunlit edge, g frond, n midrib, s trunk.
      const HALF = [
        '.....yyyyyyyyy',
        '...yyggggggggg',
        '..yggggggggggg',
        '.yggnnnggggggg',
        'ygggggnnnggggg',
        'ggggggggnnnggg',
        'gggg.gggggggng',
        'ggg..gggg.gggg',
        'gg...ggg...sss',
        'g.....g....sss',
      ];
      const KIND = { y: 'y', g: 'f', n: 'r', s: 't' };
      for (let r = 0; r < 26; r++) {
        const half = HALF[r] ?? '...........sss';
        const row = half + [...half].reverse().join('');
        for (let c = 0; c < 28; c++) {
          if (row[c] === '.') continue;
          mask[r + 1][c] = true;
          kind[r + 1][c] = KIND[row[c]];
        }
      }
      // trunk: a ring every fourth row, open on the left like bark
      for (let j = 13; j <= 26; j += 4) for (let i = 13; i <= 16; i++) kind[j][i] = 'r';
    }
    const at = (x, y) => x >= 0 && y >= 0 && x < bw && y < bh && mask[y][x];
    // colour the body
    for (let y = 0; y < bh; y++) {
      for (let x = 0; x < bw; x++) {
        if (!mask[y][x]) continue;
        const X = x0 + x;
        const Y = LOGO_Y + y;
        let c;
        if (ch === 'T') {
          const k = kind[y][x];
          if (k === 'f') c = GREEN;
          else if (k === 'r' || k === 'c') c = NAVY;
          else if (k === 'cH') c = SAND;
          else c = SAND;
          if (k === 'f' && !at(x, y - 1)) c = SAND; // sunlit top edge
        } else if (Y < 32) {
          c = SAND;
          if (!at(x, y - 1) || !at(x - 1, y)) c = WHITE;
        } else {
          c = GOLD;
          if (!at(x, y + 1) || !at(x, y + 2) || !at(x + 1, y)) c = BROWN;
        }
        g.set(X, Y, c);
      }
    }
    // outline (4-neighbour) and hard shadow (+2,+2), both navy
    const solid = (x, y) => at(x, y);
    const outl = new Set();
    for (let y = -1; y <= bh; y++) {
      for (let x = -1; x <= bw; x++) {
        if (solid(x, y)) continue;
        if (solid(x - 1, y) || solid(x + 1, y) || solid(x, y - 1) || solid(x, y + 1)) outl.add(`${x},${y}`);
      }
    }
    const filled = (x, y) => solid(x, y) || outl.has(`${x},${y}`);
    for (const k of outl) {
      const [x, y] = k.split(',').map(Number);
      g.set(x0 + x, LOGO_Y + y, NAVY);
    }
    for (let y = -1; y <= bh + 2; y++) {
      for (let x = -1; x <= bw + 2; x++) {
        if (filled(x, y)) continue;
        if (filled(x - 2, y - 2) || filled(x - 1, y - 2) || filled(x - 2, y - 1)) g.set(x0 + x, LOGO_Y + y, NAVY);
      }
    }
  }
  return g;
}

// ------------------------------------------------------------------ scenery
function palm(g, base, top, span, scale = 1) {
  // trunk: a gentle curve from base to top, 5 px wide, rings every 3 rows
  const [bx, by] = base;
  const [tx, ty] = top;
  for (let y = by; y >= ty; y--) {
    const t = (by - y) / (by - ty);
    const cx = bx + (tx - bx) * Math.pow(t, 1.6);
    const w = scale > 1 ? 7 - 2 * t : 5 - t;
    const x0 = Math.round(cx - w / 2);
    const x1 = Math.round(cx + w / 2);
    for (let x = x0; x < x1; x++) g.set(x, y, SAND);
    g.set(x1 - 1, y, NAVY);
    if ((by - y) % 3 === 0) for (let x = x0 + 1; x < x1; x++) g.set(x, y, NAVY);
  }
  // crown
  const m = new Grid();
  const paint = (i, j) => m.set(i, j, 1);
  const s = scale;
  const fr = [
    [-1, span, 0.32, 0.028 / s, 7 * s, 2],
    [1, span, 0.32, 0.028 / s, 7 * s, 2],
    [-1, span * 0.8, 0.85, 0.034 / s, 6 * s, 2],
    [1, span * 0.8, 0.85, 0.034 / s, 6 * s, 2],
    [-1, span * 0.55, 1.6, 0.06 / s, 5 * s, 2],
    [1, span * 0.55, 1.6, 0.06 / s, 5 * s, 2],
    [-1, span * 0.75, -0.25, 0.03 / s, 5 * s, 2],
    [1, span * 0.75, -0.25, 0.03 / s, 5 * s, 2],
  ];
  const ribs = fr.map(([dir, len, rise, droop, w0, w1]) => frond(paint, tx + dir * 1, ty, dir, len, rise, droop, w0, w1));
  for (const [x, y] of m) {
    g.set(x, y, GREEN);
  }
  // lower edges navy (shade), top edges sand (sun)
  for (const [x, y] of m) {
    if (!m.has(x, y + 1)) g.set(x, y, NAVY);
    else if (!m.has(x, y - 1)) g.set(x, y, SAND);
  }
  for (const pts of ribs) {
    for (const [x, y, , t] of pts) {
      if (t < 0.3 || t > 0.92) continue;
      const i = Math.floor(x);
      const j = Math.floor(y);
      if (m.has(i, j) && m.has(i, j + 1) && m.has(i, j - 1)) g.set(i, j, NAVY);
    }
  }
  // coconuts under the crown
  const nuts = scale > 1 ? [[tx - 4, ty + 5], [tx + 3, ty + 6], [tx - 1, ty + 8]] : [[tx - 3, ty + 4], [tx + 2, ty + 5]];
  const r = scale > 1 ? 2.6 : 2;
  for (const [cx, cy] of nuts) {
    for (let j = Math.floor(cy - r); j <= cy + r; j++) {
      for (let i = Math.floor(cx - r); i <= cx + r; i++) {
        const d = (i + 0.5 - cx) ** 2 + (j + 0.5 - cy) ** 2;
        if (d <= r * r) g.set(i, j, d < 1.3 && i < cx ? SAND : NAVY);
      }
    }
  }
}

function island(g, cx, cy, rx, ry) {
  for (let y = Math.floor(cy - ry - 3); y <= cy + ry + 3; y++) {
    for (let x = Math.floor(cx - rx - 4); x <= cx + rx + 4; x++) {
      const d = ((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - cy) / ry) ** 2;
      if (d <= 1) g.set(x, y, SAND);
      else {
        const d2 = ((x + 0.5 - cx) / (rx + 3)) ** 2 + ((y + 0.5 - cy) / (ry + 2)) ** 2;
        if (d2 <= 1 && (d2 > 0.9 || (x + y) % 3 !== 0)) g.set(x, y, WHITE);
      }
    }
  }
  // a few navy pebbles and footprints for texture
  const pr = rng(7 + cx);
  for (let i = 0; i < rx / 6; i++) {
    const x = cx - rx * 0.7 + pr() * rx * 1.4;
    const y = cy - ry * 0.3 + pr() * ry * 0.8;
    g.set(x, y, NAVY);
  }
}

function raft(g, x0, y0, logs = 5) {
  for (let i = 0; i < logs; i++) {
    const x = x0 + i * 6;
    for (let y = y0; y < y0 + 6; y++) for (let k = 0; k < 6; k++) g.set(x + k, y, k === 0 || k === 5 ? BROWN : GOLD);
    g.set(x + 1, y0, BROWN);
    g.set(x + 4, y0, BROWN);
    g.set(x + 1, y0 + 5, BROWN);
    g.set(x + 4, y0 + 5, BROWN);
  }
  for (let x = x0; x < x0 + logs * 6; x++) {
    g.set(x, y0 + 1, BROWN);
    g.set(x, y0 + 4, BROWN);
    g.set(x, y0 + 6, NAVY);
  }
}

function clouds(g, puffs) {
  const m = new Grid();
  for (const [cx, cy, r] of puffs) {
    for (let j = Math.floor(cy - r); j <= cy + r; j++) {
      for (let i = Math.floor(cx - r); i <= cx + r; i++) {
        if ((i + 0.5 - cx) ** 2 + (j + 0.5 - cy) ** 2 <= r * r) m.set(i, j, 1);
      }
    }
  }
  let bottom = 0;
  for (const [, y] of m) bottom = Math.max(bottom, y);
  for (const [x, y] of m) {
    const edgeBelow = !m.has(x, y + 1) || !m.has(x, y + 2);
    g.set(x, y, y >= bottom - 2 || edgeBelow ? LBLUE : WHITE);
  }
}

function sea(g, top) {
  g.rect(0, top, W, H - top, NAVY);
}

// Horizon glare: light rows that thin out away from the horizon. Each row is
// a 16-pixel pattern repeated across, so the whole band costs a handful of
// tiles, the way a cartridge would have drawn it.
function horizon(g, top, rows) {
  const pr = rng(1992);
  for (const [dy, density] of rows) {
    const pat = [];
    let x = Math.floor(pr() * 4);
    while (pat.length < 16) pat.push(0);
    while (x < 16) {
      const run = 2 + Math.floor(pr() * 9 * density);
      for (let i = 0; i < run && x + i < 16; i++) pat[x + i] = 1;
      x += run + 2 + Math.floor(pr() * 10 * (1 - density));
    }
    for (let X = 0; X < W; X++) if (pat[X % 16]) g.set(X, top + dy, LBLUE);
  }
}

// Wave marks are tiles too: two drawings, each with a second frame a pixel
// along, dropped on a staggered grid. The sea cycles between the frames.
const WAVE_TILES = [
  [['', '', '', '..##....', '.#####..', '', '', ''], ['', '', '', '...##...', '..#####.', '', '', '']],
  [['', '', '', '', '', '...##...', '..####..', ''], ['', '', '', '', '', '..##....', '.####...', '']],
];
function waveMarks(seed, area, avoid, frame) {
  const g = new Grid();
  const pr = rng(seed);
  const [x0, y0, x1, y1] = area;
  for (let ty = y0 >> 3; ty < y1 >> 3; ty++) {
    for (let tx = x0 >> 3; tx < x1 >> 3; tx++) {
      const roll = pr();
      const v = pr() < 0.5 ? 0 : 1;
      if ((tx * 3 + ty * 5) % 7 !== 0 || roll < 0.25) continue;
      const X = tx * 8;
      const Y = ty * 8;
      if (avoid.some(([ax, ay, aw, ah]) => X + 8 > ax && X < ax + aw && Y + 8 > ay && Y < ay + ah)) continue;
      WAVE_TILES[v][frame].forEach((row, j) => {
        for (let i = 0; i < row.length; i++) {
          if (row[i] !== '#') continue;
          const crest = row === WAVE_TILES[v][frame].find((r) => r.includes('#'));
          g.set(X + i, Y + j, crest ? WHITE : LBLUE);
        }
      });
    }
  }
  return g;
}

// ------------------------------------------------------------------ sprites
function spriteImage(rows, map) {
  const g = new Grid(rows[0].length, rows.length);
  rows.forEach((row, j) => {
    for (let i = 0; i < row.length; i++) {
      const ch = row[i];
      if (ch === '.') continue;
      if (!(ch in map)) throw new Error(`sprite char ${ch}`);
      g.set(i, j, map[ch]);
    }
  });
  // every 8x8 tile must fit one sprite palette
  g.tiles = [];
  for (let ty = 0; ty < g.h; ty += 8) {
    for (let tx = 0; tx < g.w; tx += 8) {
      const cols = new Set();
      for (let j = 0; j < 8; j++) for (let i = 0; i < 8; i++) {
        const c = g.get(tx + i, ty + j);
        if (c !== undefined) cols.add(c);
      }
      if (!cols.size) continue;
      const p = SPP.findIndex((pal) => [...cols].every((c) => pal.includes(c)));
      if (p < 0) throw new Error(`sprite tile at ${tx},${ty} needs ${[...cols].map(hx)}: no sprite palette fits`);
      g.tiles.push([tx, ty, p]);
    }
  }
  return g;
}
const HER_MAP = { k: DBROWN, s: SKIN, c: CORAL, w: WHITE };
const HEAD = [
  '.....kwwwk......',
  '....kwkkkwk.....',
  '...kkwkkkkkk....',
  '..kkwwkkkksk....',
  '.kkkwwkkssss....',
  '..kkwwksssss....',
  '....kkssssk.....',
  '......sss.......',
];
const BODY = [
  '.....cccccc.....',
  '....sccccccs....',
  '....sccccccs....',
  '....scccccc.s...',
  '....scccccc.s...',
  '....scccccc.....',
  '.....cccccc.....',
  '.....cccccc.....',
];
const LEGS = [
  '.....wwwwww.....',
  '.....wwwwww.....',
  '.....www.ww.....',
  '.....ss..ss.....',
  '.....ss..ss.....',
  '.....ss..ss.....',
  '.....ss..ss.....',
  '....kss..sss....',
];
const herHead = spriteImage(HEAD, HER_MAP);
const herBody = spriteImage(BODY, HER_MAP);
const herLegs = spriteImage(LEGS, HER_MAP);

const NUT_MAP = { k: DBROWN, b: BROWN, o: CORAL };
const COCONUT = spriteImage([
  '..kkkk..',
  '.kbbbbk.',
  'kbobbbbk',
  'kbobbbbk',
  'kbbbbbbk',
  'kbbkbkbk',
  '.kbbbbk.',
  '..kkkk..',
], NUT_MAP);
const WALKER = [0, 1].map((f) => spriteImage([
  '..kkkk..',
  '.kbbbbk.',
  'kbobbbbk',
  'kbobbbbk',
  'kbbbbbbk',
  'kbbkbkbk',
  '.kbbbbko',
  '..kkkk.o',
  f ? '.o.o.o..' : 'o.o.o.o.',
  f ? 'o.o.o.o.' : '.o.o.o..',
], NUT_MAP));
const CRAB = [0, 1].map((f) => spriteImage([
  '........',
  '...bbb..',
  '..bkbbb.',
  '..bbkbb.',
  'k..bbbb.',
  'oooooo..',
  f ? '.o.o.o..' : 'o.o.o.o.',
  f ? 'o.o.o.o.' : '.o.o.o..',
], NUT_MAP));
const FIN_MAP = { g: GREY, l: LGREY, w: WHITE };
// The shark, seen head-on: a fin in big over-ear headphones, nodding (the
// top part dips a pixel into its ripple on the beat).
const FIN_ROWS = [
  '.....wwwwww.....',
  '....w......w....',
  '...w...lg...w...',
  '...w...lg...w...',
  '..ww..llgg..ww..',
  '.www..llgg..www.',
  '.wgw.lllggg.wgw.',
  '.wgw.lllggg.wgw.',
  '.www.lllggg.www.',
  '..w.llllgggg.w..',
  '....llllgggg....',
  '...lllllggggg...',
  '.wwlllllgggggww.',
  'w..wwwwwwwwww..w',
];
const FIN_TOP = spriteImage(FIN_ROWS.slice(0, 12), FIN_MAP);
const FIN_RING = spriteImage(FIN_ROWS.slice(12), FIN_MAP);
const GULL = [spriteImage([
  'w.....w.',
  '.w...w..',
  '..w.w...',
  '...w....',
], FIN_MAP), spriteImage([
  '........',
  'www.www.',
  '...w....',
  '........',
], FIN_MAP)];
const NOTE = spriteImage([
  '...ww...',
  '...www..',
  '...w.ww.',
  '...w....',
  '.www....',
  'wwww....',
  '.ww.....',
], FIN_MAP);
const STAR = spriteImage([
  '...w....',
  '.w.w.w..',
  '..www...',
  'wwwwwww.',
  '..www...',
  '.w.w.w..',
  '...w....',
], FIN_MAP);

// ------------------------------------------------------------------ zones
// Give each 16x16 zone a palette; fail loudly when one cannot be found.
function solveZones(name, layers, overrides = {}) {
  const pref = [2, 3, 1, 0];
  const zp = [];
  const errors = [];
  for (let zy = 0; zy < 15; zy++) {
    zp.push([]);
    for (let zx = 0; zx < 16; zx++) {
      const cols = new Set();
      for (const { grid, decor } of layers) {
        if (decor) continue;
        for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++) {
          const c = grid.get(zx * 16 + i, zy * 16 + j);
          if (c !== undefined) cols.add(c);
        }
      }
      const fits = (p) => [...cols].every((c) => BGP[p].includes(c));
      const key = `${zx},${zy}`;
      let p = key in overrides ? overrides[key] : pref.find(fits);
      if (p === undefined || !fits(p)) {
        errors.push(`${name}: zone ${key} (x${zx * 16} y${zy * 16}) needs ${[...cols].map(hx).join(' ')}`);
        p = 2;
      }
      zp[zy].push(p);
    }
  }
  if (errors.length) throw new Error('zone rule broken:\n' + errors.join('\n'));
  // decorative pixels the zone cannot show are dropped
  for (const { grid, decor } of layers) {
    if (!decor) continue;
    for (const [x, y, c] of [...grid]) {
      if (!BGP[zp[y >> 4][x >> 4]].includes(c)) grid.del(x, y);
    }
  }
  return zp;
}

// unique 8x8 tiles (as 2-bit patterns) over all layer states
function countTiles(states, zp) {
  const set = new Set();
  for (const layers of states) {
    for (let ty = 0; ty < 30; ty++) {
      for (let tx = 0; tx < 32; tx++) {
        let key = '';
        const p = zp[ty >> 1][tx >> 1];
        for (let j = 0; j < 8; j++) {
          for (let i = 0; i < 8; i++) {
            let c;
            for (const l of layers) {
              const v = l.get(tx * 8 + i, ty * 8 + j);
              if (v !== undefined) c = v;
            }
            key += c === undefined ? 0 : BGP[p].indexOf(c) + 1;
          }
        }
        set.add(key);
      }
    }
  }
  return set.size;
}

// ------------------------------------------------------------------ svg helpers
// Merge pixels into horizontal runs, stack equal runs, emit one path.
function pathOf(pixels, ox = 0, oy = 0) {
  const rows = new Map();
  for (const [x, y] of pixels) {
    if (!rows.has(y)) rows.set(y, []);
    rows.get(y).push(x);
  }
  const runs = [];
  for (const [y, xs] of rows) {
    xs.sort((a, b) => a - b);
    let st = xs[0];
    let p = xs[0];
    for (let i = 1; i <= xs.length; i++) {
      if (i < xs.length && xs[i] === p + 1) {
        p = xs[i];
        continue;
      }
      runs.push([st, p + 1, y]);
      if (i < xs.length) {
        st = xs[i];
        p = xs[i];
      }
    }
  }
  runs.sort((a, b) => a[2] - b[2] || a[0] - b[0]);
  const live = new Set(runs.map((r) => `${r[0]},${r[1]},${r[2]}`));
  // after z the pen is back at the rect's corner, so each next rect is a
  // short relative move from the last one
  const out = [];
  let px = null;
  let py = null;
  for (const r of runs) {
    const k0 = `${r[0]},${r[1]},${r[2]}`;
    if (!live.has(k0)) continue;
    live.delete(k0);
    let h = 1;
    while (live.has(`${r[0]},${r[1]},${r[2] + h}`)) {
      live.delete(`${r[0]},${r[1]},${r[2] + h}`);
      h++;
    }
    const x = ox + r[0];
    const y = oy + r[2];
    out.push(px === null ? `M${x} ${y}` : `m${x - px} ${y - py}`);
    out.push(`h${r[1] - r[0]}v${h}h${r[0] - r[1]}z`);
    px = x;
    py = y;
  }
  return out.join('');
}

// One <path> per fill. In background layers, pixels showing the cycling
// palette entry get the class that animates.
function paint(grid, zp, ox = 0, oy = 0, attrs = '', skip = null) {
  const groups = new Map();
  for (const [x, y, c] of grid) {
    if (skip && skip(x, y, c)) continue;
    let cls = `c${hx(c)}`;
    if (zp && zp[y >> 4][x >> 4] === CYCLE.pal && c === BGP[CYCLE.pal][CYCLE.slot - 1]) cls = 'cy';
    else usedFills.add(c);
    if (!groups.has(cls)) groups.set(cls, []);
    groups.get(cls).push([x, y]);
  }
  const used = [...groups.keys()].sort();
  return used.map((cls) => `<path class="${cls}"${attrs} d="${pathOf(groups.get(cls), ox, oy)}"/>`).join('');
}

// ------------------------------------------------------------------ animation
const css = [];
const usedFills = new Set();
let kfn = 0;
const pc = (t) => `${n((Math.max(0, Math.min(L, t)) / L) * 100, 4)}%`;
const dly = () => (T0 ? `;animation-delay:${n(-T0, 3)}s` : '');
// A held (step-end) track over the whole loop: frames [[t, value], ...].
function track(prop, frames, base) {
  const name = `k${(kfn++).toString(36)}`;
  frames = [...frames].sort((a, b) => a[0] - b[0]);
  const at0 = frames.filter((f) => f[0] <= 0).pop() || frames[frames.length - 1];
  const parts = [`0%{${prop}:${at0[1]}}`];
  for (const [t, v] of frames) if (t > 0 && t < L) parts.push(`${pc(t)}{${prop}:${v}}`);
  parts.push(`100%{${prop}:${frames.filter((f) => f[0] < L).pop()[1]}}`);
  css.push(`@keyframes ${name}{${parts.join('')}}`);
  const cls = `a${name}`;
  css.push(`.${cls}{${prop}:${base ?? at0[1]};animation:${name} ${L}s step-end infinite${dly()}}`);
  return cls;
}
// visible during the given windows only
function windows(spans, baseVisible) {
  const frames = [[0, 0]];
  for (const [a, b] of spans) {
    frames.push([a, 1]);
    frames.push([b, 0]);
  }
  // collapse to the value in force at each instant
  const pts = [...new Set(frames.map((f) => f[0]))].sort((a, b) => a - b);
  const val = (t) => (spans.some(([a, b]) => t >= a && t < b) ? 1 : 0);
  const fr = pts.map((t) => [t, val(t)]);
  return track('opacity', fr, baseVisible === undefined ? val(0) : baseVisible ? 1 : 0);
}
// a short periodic animation (period divides L, so the loop stays seamless)
function periodic(prop, period, frames, base) {
  if (Math.abs(L / period - Math.round(L / period)) > 1e-9) throw new Error(`period ${period} does not divide ${L}`);
  const name = `p${(kfn++).toString(36)}`;
  const parts = frames.map(([t, v]) => `${n((t / period) * 100, 4)}%{${prop}:${v}}`);
  parts.push(`100%{${prop}:${frames[frames.length - 1][1]}}`);
  css.push(`@keyframes ${name}{${parts.join('')}}`);
  const cls = `a${name}`;
  css.push(`.${cls}{${prop}:${base ?? frames[0][1]};animation:${name} ${period}s step-end infinite${dly()}}`);
  return cls;
}
const tr = (x, y) => `translate(${n(x)}px,${n(y)}px)`;

// A sprite actor: frames by name, a track of [t, x, y, frameName|null].
// Emits one group that moves and one sub-group per frame that shows when
// the track says so. Returns svg and a sampler for the scanline check.
function actor(frames, steps, opts = {}) {
  steps = [...steps].sort((a, b) => a[0] - b[0]);
  const stateAt = (t) => {
    let s = steps[steps.length - 1];
    for (const st of steps) if (st[0] <= t) s = st;
    return s;
  };
  const s0 = stateAt(opts.baseT ?? 0);
  const posFrames = steps.map(([t, x, y]) => [t, tr(x, y)]);
  const moving = new Set(steps.map(([, x, y]) => `${x},${y}`)).size > 1;
  const pos = moving ? track('transform', posFrames, tr(s0[1], s0[2])) : null;
  let svg = `<g${pos ? ` class="${pos}"` : ` transform="translate(${s0[1]} ${s0[2]})"`}>`;
  const names = Object.keys(frames);
  for (const nm of names) {
    const spans = [];
    let open = null;
    for (const [t, , , f] of steps) {
      if (f === nm && open === null) open = t;
      if (f !== nm && open !== null) {
        spans.push([open, t]);
        open = null;
      }
    }
    if (open !== null) spans.push([open, L]);
    const always = spans.length === 1 && spans[0][0] <= 0 && spans[0][1] >= L;
    const vis = always ? '' : ` class="${windows(spans, s0[3] === nm)}"`;
    const inner = frames[nm].svg;
    svg += `<g${vis}>${inner}</g>`;
  }
  svg += '</g>';
  return {
    svg,
    sample: (t) => {
      const [, x, y, f] = stateAt(t);
      if (!f) return [];
      return frames[f].tiles.map(([tx, ty]) => [x + tx, y + ty]);
    },
  };
}
// a sprite frame: image(s) placed at offsets, with optional periodic nod
function frameOf(parts) {
  let svg = '';
  const tiles = [];
  for (const { img, dx = 0, dy = 0, cls } of parts) {
    const body = paint(img, null, 0, 0);
    svg += `<g${cls ? ` class="${cls}"` : ''} transform="translate(${dx} ${dy})">${body}</g>`;
    for (const [tx, ty] of img.tiles) tiles.push([dx + tx, dy + ty]);
  }
  return { svg, tiles };
}

// sprites per scanline, sampled at 30 fps over a span of the loop
function scanlineLoad(actors, span) {
  let worst = 0;
  for (let t = span[0]; t < span[1]; t += 1 / 30) {
    const lines = new Array(H).fill(0);
    for (const a of actors) {
      for (const [x, y] of a.sample(t)) {
        for (let j = 0; j < 8; j++) if (y + j >= 0 && y + j < H) lines[y + j]++;
      }
    }
    worst = Math.max(worst, ...lines);
  }
  if (worst > 8) throw new Error(`more than eight sprites on a scanline (${worst})`);
  return worst;
}

// gravity drop in whole pixels, one position per 30th of a second
function drop(t0, x, yFrom, yTo, f, g = 420) {
  const out = [];
  let t = 0;
  for (;;) {
    const y = Math.min(yTo, Math.round(yFrom + 0.5 * g * t * t));
    out.push([t0 + t, x, y, f]);
    if (y >= yTo) break;
    t += 1 / 30;
  }
  return out;
}

// ------------------------------------------------------------------ title card
function buildTitle() {
  const bg = new Grid();
  // sky decor: high clouds and the horizon bank
  const cl = new Grid();
  clouds(cl, [[10, 98, 7], [22, 95, 9], [36, 97, 7], [48, 99, 5], [62, 99, 6], [74, 97, 7], [86, 100, 4],
    [100, 100, 4], [222, 99, 5], [234, 95, 8], [248, 97, 7], [212, 101, 3]]);
  clouds(cl, [[8, 8, 4], [16, 6, 5], [25, 8, 4]]);
  clouds(cl, [[234, 70, 4], [242, 68, 5], [250, 70, 4]]);
  sea(bg, 104);
  // tagline under the logo, navy on the sky
  text(bg, 'A 10-HOUR LO-FI ISLAND VIDEO', 16, 56, NAVY);
  // island, palm, raft
  island(bg, 150, 124, 40, 5);
  palm(bg, [167, 122], [180, 79], 24, 1);
  raft(bg, 208, 128, 5);
  // menu and lines on the sea
  text(bg, '10-HOUR MODE', 80, 144, WHITE);
  text(bg, 'SCHEDULE', 80, 160, WHITE);
  text(bg, 'SOUND TEST', 80, 176, WHITE);
  text(bg, 'python tools/serve.py', 40, 208, WHITE);
  text(bg, '© 2026  ALL TIDES RESERVED', 24, 224, LBLUE);
  const blink = new Grid();
  text(blink, 'PUSH START', 88, 192, WHITE);
  const glare = new Grid();
  horizon(glare, 104, [[0, 1], [2, 0.7], [5, 0.45], [9, 0.25], [14, 0.12]]);
  const avoid = [[56, 140, 144, 48], [80, 188, 96, 14], [32, 204, 184, 30], [104, 112, 100, 26], [204, 124, 40, 16], [20, 112, 32, 24]];
  const wavesA = waveMarks(5, [0, 120, 256, 240], avoid, 0);
  const wavesB = waveMarks(5, [0, 120, 256, 240], avoid, 1);
  const logo = logoLayer();
  const layers = [
    { grid: bg }, { grid: logo }, { grid: blink },
    { grid: cl, decor: true }, { grid: glare, decor: true }, { grid: wavesA, decor: true }, { grid: wavesB, decor: true },
  ];
  const zp = solveZones('title', layers);
  for (const [x, y, c] of cl) if (!bg.has(x, y)) bg.set(x, y, c);
  for (const [x, y, c] of glare) if (bg.get(x, y) === NAVY) bg.set(x, y, c);
  const tiles = countTiles([[bg, logo, blink, wavesA], [bg, logo, blink, wavesB]], zp);

  // sprites
  const nodHead = periodic('transform', BEAT, [[0, tr(0, 1)], [BEAT * 0.4, tr(0, 0)]], tr(0, 0));
  const her = actor({ her: frameOf([{ img: herHead, cls: nodHead }, { img: herBody, dy: 8 }, { img: herLegs, dy: 16 }]) },
    [[0, 118, 100, 'her']]);
  const fin = actor({ fin: frameOf([{ img: FIN_TOP, cls: nodHead }, { img: FIN_RING, dy: 12 }]) },
    [[0, 28, 114, 'fin']]);
  const legA = periodic('opacity', 0.25, [[0, 1], [0.125, 0]], 1);
  const legB = periodic('opacity', 0.25, [[0, 0], [0.125, 1]], 0);
  const cursorImg = { svg: `<g class="${legA}">${paint(WALKER[0], null)}</g><g class="${legB}">${paint(WALKER[1], null)}</g>`, tiles: WALKER[0].tiles };
  const cy = (row) => row * 8 - 2;
  const cursor = actor({ cur: cursorImg }, [
    [0, 64, cy(18), 'cur'], [4.5, 64, cy(20), 'cur'], [7.5, 64, cy(22), 'cur'], [10.5, 64, cy(18), 'cur'],
  ]);
  // two distant gulls drift across while the title waits, two pixels a step
  const flapA = periodic('opacity', 0.5, [[0, 1], [0.25, 0]], 1);
  const flapB = periodic('opacity', 0.5, [[0, 0], [0.25, 1]], 0);
  const gullPair = (k) => `<g transform="translate(${k ? 13 : 0} ${k ? 5 : 0})"><g class="${flapA}">${paint(GULL[k], null)}</g><g class="${flapB}">${paint(GULL[1 - k], null)}</g></g>`;
  const gullSteps = [];
  for (let k = 0; k * 0.25 < TITLE_A[1]; k++) gullSteps.push([k * 0.25, -24 + k * 2, 70, 'g']);
  gullSteps.push([TITLE_A[1], -24, 70, null]);
  const gulls = actor({ g: { svg: gullPair(0) + gullPair(1), tiles: [[0, 0], [13, 5]] } }, gullSteps);
  const sprites = [fin, her, cursor, gulls];
  const load = Math.max(scanlineLoad(sprites, TITLE_A), scanlineLoad(sprites, TITLE_B));

  // logo drop on the way back from the demo: falls in whole pixels and bounces once
  const fall = [];
  let t = 0;
  for (;;) {
    const y = Math.min(0, Math.round(-60 + 0.5 * 360 * t * t));
    fall.push([TITLE_B[0] + t, y]);
    if (y >= 0) break;
    t += 1 / 30;
  }
  const tb = fall[fall.length - 1][0];
  const bounce = [[tb + 1 / 15, -3], [tb + 2 / 15, -4], [tb + 3 / 15, -3], [tb + 4 / 15, 0]];
  const logoTrack = track('transform', [[0, tr(0, 0)], ...fall.map(([tt, y]) => [tt, tr(0, y)]), ...bounce.map(([tt, y]) => [tt, tr(0, y)])], tr(0, 0));
  const blinkCls = periodic('opacity', BEAT * 2, [[0, 1], [BEAT, 0]], 1);
  const wavesACls = periodic('opacity', BEAT * 4, [[0, 1], [BEAT * 2, 0]], 1);
  const wavesBCls = periodic('opacity', BEAT * 4, [[0, 0], [BEAT * 2, 1]], 0);

  const svg = [
    `<rect y="104" width="256" height="136" class="c${hx(NAVY)}"/>`,
    paint(bg, zp, 0, 0, '', (x, y, c) => c === NAVY && y >= 104),
    `<g class="${wavesACls}">${paint(wavesA, zp)}</g>`,
    `<g class="${wavesBCls}">${paint(wavesB, zp)}</g>`,
    `<g class="${blinkCls}">${paint(blink, zp)}</g>`,
    `<g class="${logoTrack}">${paint(logo, zp)}</g>`,
    fin.svg, her.svg, cursor.svg, gulls.svg,
  ].join('');
  const colours = new Set([BACKDROP]);
  for (const g of [bg, logo, blink, wavesA, wavesB]) for (const [, , c] of g) colours.add(c);
  for (const img of [herHead, herBody, herLegs, FIN_TOP, FIN_RING, ...WALKER]) for (const [, , c] of img) colours.add(c);
  return { svg, zp, tiles, load, colours: colours.size };
}

// ------------------------------------------------------------------ demo card
function buildDemo() {
  const D0 = DEMO[0];
  const bg = new Grid();
  // status bar
  bg.rect(0, 0, W, 28, NAVY);
  for (let x = 0; x < W; x++) bg.set(x, 26, LBLUE);
  text(bg, 'SCORE 000000    HI 000000', 24, 6, WHITE);
  text(bg, 'TIME 9:59:', 24, 16, WHITE);
  text(bg, 'SIGNAL 0', 168, 16, WHITE);
  const cl = new Grid();
  clouds(cl, [[6, 90, 7], [18, 87, 9], [32, 89, 8], [46, 91, 6], [58, 92, 4], [214, 91, 5], [226, 87, 8], [240, 89, 8], [252, 91, 6]]);
  clouds(cl, [[40, 44, 4], [48, 42, 5], [56, 44, 4]]);
  sea(bg, 96);
  island(bg, 140, 132, 74, 9);
  // her sandcastle (the tide has not come for it yet)
  const castle = [
    '....#.#.#....',
    '....#####....',
    '#.#.#####.#.#',
    '#############',
    '#############',
    '#############',
    '#####nnn#####',
    '#####nnn#####',
  ];
  const inCastle = (i, j) => castle[j]?.[i] !== undefined && castle[j][i] !== '.';
  for (let j = -1; j <= castle.length; j++) {
    for (let i = -1; i <= 13; i++) {
      const X = 104 + i;
      const Y = 122 + j;
      if (inCastle(i, j)) bg.set(X, Y, castle[j][i] === 'n' || !inCastle(i + 1, j) ? NAVY : SAND);
      else if (inCastle(i - 1, j) || inCastle(i + 1, j) || inCastle(i, j + 1) || inCastle(i, j - 1)) bg.set(X, Y, NAVY);
    }
  }
  palm(bg, [150, 130], [166, 54], 38, 1.5);
  raft(bg, 224, 140, 4);
  // text box
  bg.rect(0, 168, W, 72, NAVY);
  for (let x = 9; x <= 246; x++) {
    bg.set(x, 172, WHITE);
    bg.set(x, 233, WHITE);
  }
  for (let y = 173; y < 233; y++) {
    bg.set(8, y, WHITE);
    bg.set(247, y, WHITE);
  }
  for (let x = 20; x < 20 + 8 * 11; x++) bg.del(x, 172);
  for (let x = 20; x < 20 + 8 * 11; x++) bg.set(x, 172, NAVY);
  text(bg, ' DEMO PLAY ', 20, 169, LBLUE);
  const glare = new Grid();
  horizon(glare, 96, [[0, 1], [2, 0.75], [5, 0.5], [9, 0.3], [14, 0.15], [20, 0.08]]);
  const avoid = [[0, 160, 256, 80], [56, 116, 172, 34], [216, 132, 40, 18]];
  const wavesA = waveMarks(11, [0, 112, 256, 166], avoid, 0);
  const wavesB = waveMarks(11, [0, 112, 256, 166], avoid, 1);
  // pages of text, typed out
  const pages = [
    ['THE CASTAWAY IS LISTENING.', 'NOTHING ELSE IS HAPPENING.'],
    ['A COCONUT FALLS.', 'IT LANDS ON A HERMIT CRAB.'],
    ['THE CRAB IS WEARING IT NOW.', 'THEY WALK OFF TOGETHER.'],
    ['NOBODY SCORED. AS PLANNED.', 'NEXT: IN 2 TO 5 MINUTES.'],
  ];
  const pageGrids = pages.map((lines) => lines.map((s, j) => {
    const g = new Grid();
    text(g, s, 16, 184 + j * 16, WHITE);
    return g;
  }));
  const digits = [];
  for (let k = 0; k < 12; k++) {
    const g = new Grid();
    text(g, String(48 - k).padStart(2, '0'), 24 + 80, 16, WHITE);
    digits.push(g);
  }
  const layers = [{ grid: bg }, ...pageGrids.flat().map((g) => ({ grid: g })), ...digits.map((g) => ({ grid: g })),
    { grid: cl, decor: true }, { grid: glare, decor: true }, { grid: wavesA, decor: true }, { grid: wavesB, decor: true }];
  const zp = solveZones('demo', layers);
  for (const [x, y, c] of cl) if (!bg.has(x, y)) bg.set(x, y, c);
  for (const [x, y, c] of glare) if (bg.get(x, y) === NAVY) bg.set(x, y, c);
  const tiles = countTiles([[bg, wavesA, ...pageGrids.flat(), ...digits], [bg, wavesB]], zp);

  // the typewriter: a navy cover slides off each line one character per step
  const typeSvg = [];
  const clips = [];
  pages.forEach((lines, k) => {
    const t0 = D0 + k * BAR;
    const vis = windows([[t0, t0 + BAR]], false);
    let inner = '';
    lines.forEach((s, j) => {
      const id = `tl${k}${j}`;
      const y = 184 + j * 16;
      clips.push(`<clipPath id="${id}"><rect x="16" y="${y}" width="${s.length * 8}" height="8"/></clipPath>`);
      const start = t0 + 0.15 + j * (lines[0].length * 0.035 + 0.15);
      const end = start + s.length * 0.035;
      const name = `k${(kfn++).toString(36)}`;
      css.push(`@keyframes ${name}{0%{transform:translateX(0)}${pc(start)}{transform:translateX(0);animation-timing-function:steps(${s.length},end)}${pc(end)}{transform:translateX(${s.length * 8}px)}100%{transform:translateX(${s.length * 8}px)}}`);
      css.push(`.a${name}{animation:${name} ${L}s linear infinite${dly()}}`);
      inner += paint(pageGrids[k][j], zp);
      inner += `<g clip-path="url(#${id})"><rect class="a${name} c${hx(NAVY)}" x="16" y="${y}" width="${s.length * 8}" height="8"/></g>`;
      usedFills.add(NAVY);
    });
    typeSvg.push(`<g class="${vis}">${inner}</g>`);
  });
  const timer = digits.map((g, k) => `<g class="${windows([[D0 + k, D0 + k + 1]], false)}">${paint(g, zp)}</g>`).join('');
  const more = new Grid();
  text(more, '▼', 232, 218, WHITE);
  const moreSvg = `<g class="${periodic('opacity', BEAT, [[0, 1], [BEAT / 2, 0]], 1)}">${paint(more, zp)}</g>`;

  // actors
  const nodHead = periodic('transform', BEAT, [[0, tr(0, 1)], [BEAT * 0.4, tr(0, 0)]], tr(0, 0));
  const her = actor({ her: frameOf([{ img: herHead, cls: nodHead }, { img: herBody, dy: 8 }, { img: herLegs, dy: 16 }]) },
    [[0, 82, 106, 'her']]);
  const legA = periodic('opacity', 0.25, [[0, 1], [0.125, 0]], 1);
  const legB = periodic('opacity', 0.25, [[0, 0], [0.125, 1]], 0);
  const walkF = (imgs) => ({ svg: `<g class="${legA}">${paint(imgs[0], null)}</g><g class="${legB}">${paint(imgs[1], null)}</g>`, tiles: imgs[0].tiles });
  const crabStill = { svg: paint(CRAB[0], null), tiles: CRAB[0].tiles };
  // crab walks in from the right and stops under the palm
  const crabSteps = [[0, 0, 0, null]];
  const cx0 = 212;
  const cxStop = 158;
  for (let k = 0; ; k++) {
    const x = Math.max(cxStop, cx0 - k * 2);
    crabSteps.push([D0 + k * 0.1, x, 130, x > cxStop ? 'walk' : 'still']);
    if (x === cxStop) break;
  }
  // the coconut lands on the beat after the bar line; the crab is under it
  const fall = drop(0, 158, 59, 128, 'nut');
  const land = D0 + BAR + 2 * BEAT;
  const fallFrames = fall.map(([t, x, y, f]) => [land - fall[fall.length - 1][0] + t, x, y, f]);
  crabSteps.push([land, cxStop, 130, null]);
  const crab = actor({ walk: walkF(CRAB), still: crabStill }, crabSteps);
  // the coconut hangs, drops on the beat, sits, then walks off with the crab in it
  const nutSteps = [[0, 158, 59, null], [D0, 158, 59, 'nut']];
  nutSteps.push(...fallFrames);
  const walkStart = D0 + 2 * BAR;
  for (let k = 0; ; k++) {
    const x = 158 + k * 3;
    nutSteps.push([walkStart + k * 0.125, x, 126, 'walker']);
    if (x > W + 4) break;
  }
  nutSteps.push([DEMO[1], 158, 59, null]);
  const nut = actor({ nut: { svg: paint(COCONUT, null), tiles: COCONUT.tiles }, walker: walkF(WALKER) }, nutSteps);
  const starBlink = periodic('opacity', 0.5, [[0, 1], [0.25, 0]], 1);
  const star = actor({ star: { svg: `<g class="${starBlink}">${paint(STAR, null)}</g>`, tiles: STAR.tiles } },
    [[0, 160, 116, null], [land, 162, 117, 'star'], [land + 1, 162, 117, null]]);
  const sprites = [her, crab, nut, star];
  const load = scanlineLoad(sprites, DEMO);

  const wavesACls = periodic('opacity', BEAT * 4, [[0, 1], [BEAT * 2, 0]], 1);
  const wavesBCls = periodic('opacity', BEAT * 4, [[0, 0], [BEAT * 2, 1]], 0);
  const svg = [
    `<rect width="256" height="26" class="c${hx(NAVY)}"/><rect y="96" width="256" height="144" class="c${hx(NAVY)}"/>`,
    paint(bg, zp, 0, 0, '', (x, y, c) => c === NAVY && (y >= 96 || y < 26)),
    `<g class="${wavesACls}">${paint(wavesA, zp)}</g>`,
    `<g class="${wavesBCls}">${paint(wavesB, zp)}</g>`,
    timer, typeSvg.join(''), moreSvg,
    her.svg, crab.svg, nut.svg, star.svg,
  ].join('');
  const colours = new Set([BACKDROP]);
  for (const g of [bg, wavesA, ...pageGrids.flat()]) for (const [, , c] of g) colours.add(c);
  for (const img of [herHead, herBody, herLegs, ...CRAB, ...WALKER, COCONUT, STAR]) for (const [, , c] of img) colours.add(c);
  return { svg, zp, tiles, load, colours: colours.size, clips: clips.join('') };
}

// ------------------------------------------------------------------ panels
const PANEL_BG = '#15161c';
const PANEL_INK = NES[0x10];
const PANEL_DIM = NES[0x00];
function panelText(s, x, y, fill) {
  const g = new Grid(448, 240);
  text(g, s, x, y, 1);
  return `<path fill="${fill}" d="${pathOf([...g].map(([a, b]) => [a, b]))}"/>`;
}
function leftPanel() {
  let s = `<rect x="0" y="0" width="96" height="240" fill="${PANEL_BG}"/>`;
  const swatch = (c, x, y, cyc) => {
    s += `<rect class="${cyc ? 'cy' : `c${hx(c)}`}" x="${x}" y="${y}" width="20" height="10"/>`;
    usedFills.add(c);
  };
  s += panelText('BACKDROP', 8, 6, PANEL_INK);
  swatch(BACKDROP, 20, 18, false);
  s += panelText(hx(BACKDROP), 48, 19, PANEL_DIM);
  const block = (label, pals, y0, sprite) => {
    s += panelText(label, 8, y0, PANEL_INK);
    pals.forEach((pal, i) => {
      const y = y0 + 12 + i * 21;
      s += panelText(String(i), 8, y + 1, PANEL_DIM);
      pal.forEach((c, j) => {
        const x = 20 + j * 24;
        swatch(c, x, y, !sprite && i === CYCLE.pal && j + 1 === CYCLE.slot);
        s += panelText(hx(c), x + 2, y + 12, PANEL_DIM);
      });
    });
  };
  block('BG PAL', BGP, 36, false);
  block('SPR PAL', SPP, 136, true);
  return s;
}
function rightPanel(title, demo) {
  const x0 = 352;
  let s = `<rect x="${x0}" y="0" width="96" height="240" fill="${PANEL_BG}"/>`;
  s += panelText('ZONES', x0 + 8, 6, PANEL_INK);
  const zoneMap = (zp) => {
    const groups = [[], [], [], []];
    zp.forEach((row, zy) => row.forEach((p, zx) => groups[p].push([zx, zy])));
    const rep = [SAND, GOLD, LBLUE, GREEN];
    return groups.map((cells, p) => {
      const d = cells.map(([zx, zy]) => `M${x0 + 8 + zx * 5} ${18 + zy * 5}h4v4h-4z`).join('');
      usedFills.add(rep[p]);
      return d ? `<path class="c${hx(rep[p])}" d="${d}"/>` : '';
    }).join('');
  };
  const stats = (card, label) => [
    panelText(label, x0 + 8, 100, PANEL_INK),
    panelText(`TILES ${card.tiles}`, x0 + 8, 116, PANEL_DIM),
    panelText(`COLOURS ${card.colours}`, x0 + 8, 128, PANEL_DIM),
    panelText(`SPR/LN ${card.load}/8`, x0 + 8, 140, PANEL_DIM),
  ].join('');
  const titleWin = windows([TITLE_A, TITLE_B], true);
  const demoWin = windows([DEMO], false);
  s += `<g class="${titleWin}">${zoneMap(title.zp)}${stats(title, 'TITLE')}</g>`;
  s += `<g class="${demoWin}">${zoneMap(demo.zp)}${stats(demo, 'DEMO')}</g>`;
  // bar and beat counter, on the theme's clock
  s += panelText('80 BPM', x0 + 8, 166, PANEL_INK);
  s += panelText('BAR', x0 + 8, 182, PANEL_DIM);
  for (let b = 0; b < 10; b++) {
    const win = windows([[b * BAR, (b + 1) * BAR]], b === 0);
    s += `<g class="${win}">${panelText(String(b + 1).padStart(2, '0'), x0 + 48, 182, PANEL_INK)}</g>`;
  }
  for (let k = 0; k < 4; k++) {
    const x = x0 + 8 + k * 20;
    s += `<rect x="${x}" y="198" width="14" height="8" fill="none" stroke="${PANEL_DIM}" stroke-width="1"/>`;
    const on = periodic('opacity', BAR, [[0, k === 0 ? 1 : 0], [k * BEAT, 1], [(k + 1) * BEAT, 0]].filter((f, i, a) => i === 0 || f[0] !== a[0][0] || true), k === 0 ? 1 : 0);
    s += `<rect class="${on} c${hx(LBLUE)}" x="${x + 2}" y="200" width="10" height="4"/>`;
  }
  usedFills.add(LBLUE);
  s += panelText('SEED 1992', x0 + 8, 220, PANEL_DIM);
  return s;
}

// ------------------------------------------------------------------ main svg
function main() {
  const title = buildTitle();
  const demo = buildDemo();
  const titleWin = windows([TITLE_A, TITLE_B], true);
  const demoWin = windows([DEMO], false);
  const card = `<g transform="translate(96 0)" clip-path="url(#card)">`
    + `<rect width="256" height="240" class="c${hx(BACKDROP)}"/>`
    + `<g class="${titleWin}">${title.svg}</g>`
    + `<g class="${demoWin}">${demo.svg}</g>`
    + `</g>`;
  usedFills.add(BACKDROP);
  const panels = leftPanel() + rightPanel(title, demo);
  const cycle = periodic('fill', CYCLE.step * CYCLE.seq.length, CYCLE.seq.map((c, i) => [i * CYCLE.step, NES[c]]), NES[CYCLE.seq[0]]);
  return { body: panels + card, defs: `<clipPath id="card"><rect width="256" height="240"/></clipPath>${demo.clips}`, cycle, title, demo };
}

function fillsCss() {
  return [...usedFills].sort((a, b) => a - b).map((c) => `.c${hx(c)}{fill:${NES[c]}}`).join('');
}

function writeSvg(file, w, h, body, defs, title, desc) {
  const style = `${fillsCss()}${css.join('')}`
    + '@media (prefers-reduced-motion:reduce){*{animation:none!important}}';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${CROP ? CROP.join(" ") : `0 0 ${w} ${h}`}" width="${(CROP ? CROP[2] : w) * ZOOM}" height="${(CROP ? CROP[3] : h) * ZOOM}" shape-rendering="crispEdges" role="img" aria-labelledby="t d">`
    + `<title id="t">${title}</title><desc id="d">${desc}</desc>`
    + `<style>${style}</style><defs>${defs}</defs>${body}</svg>\n`;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, svg);
  return svg.length;
}

const m = main();
// the cycling palette entry: its class takes the periodic() fill animation
const cycRule = css.findIndex((r) => r.startsWith(`.${m.cycle}{`));
css[cycRule] = css[cycRule].replace(`.${m.cycle}{`, '.cy{');
const size = writeSvg(OUT_MAIN, 448, 240,
  `<rect width="448" height="240" fill="${PANEL_BG}"/>${m.body}`, m.defs,
  'CASTAWAY: title screen',
  'An 8-bit console style title screen for Castaway, a lo-fi island video: a sand and gold tile logo reading CASTAWAY whose T is a palm tree, a menu with a coconut cursor, a blinking PUSH START and the command python tools/serve.py, then a demo card where a coconut falls on a hermit crab and walks off with it.');
console.log(`main: ${OUT_MAIN} ${(size / 1024).toFixed(1)} KB; title tiles ${m.title.tiles}, colours ${m.title.colours}, spr/line ${m.title.load}; demo tiles ${m.demo.tiles}, colours ${m.demo.colours}, spr/line ${m.demo.load}`);

// ------------------------------------------------------------------ sound test card
// The cartridge's other screen. Same font, same palettes, same zone rule;
// the backdrop entry is switched to navy for this screen, as a game would.
function buildSound() {
  const bg = new Grid();
  // SOUND TEST at double size, gold on a brown drop shadow
  const big = new Grid();
  text(big, 'SOUND TEST', 0, 0, 1);
  for (const [x, y] of big) for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++) bg.set(48 + x * 2 + a + 1, 16 + y * 2 + b + 1, BROWN);
  for (const [x, y] of big) for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++) bg.set(48 + x * 2 + a, 16 + y * 2 + b, GOLD);
  for (let x = 16; x < 240; x++) bg.set(x, 40, LBLUE);
  text(bg, 'BGM 01', 24, 56, WHITE);
  text(bg, 'ISLAND THEME', 88, 56, WHITE);
  text(bg, '60 S LOOP, 80 BPM', 88, 64, LBLUE);
  text(bg, 'F MAJOR, ii-V-I-vi', 88, 72, LBLUE);
  text(bg, 'SE 150+', 24, 88, WHITE);
  text(bg, 'ALL MADE BY CODE', 88, 88, LBLUE);
  const chans = ['E.PIANO', 'KALIMBA', 'DRUMS', 'CRACKLE', 'OCEAN'];
  chans.forEach((c, i) => text(bg, c, 24, 104 + i * 8, WHITE));
  text(bg, 'SAMPLES USED       0', 24, 152, WHITE);
  text(bg, 'LOUDNESS    -14 LUFS', 24, 160, WHITE);
  text(bg, 'PEAK MAX    -1 dBTP', 24, 168, WHITE);
  text(bg, 'LISTENERS SO FAR   0', 24, 184, WHITE);
  text(bg, '(THE SHARK IS', 24, 192, LBLUE);
  text(bg, ' PRETENDING)', 24, 200, LBLUE);
  text(bg, 'tools/make_audio.py', 24, 224, LBLUE);
  // level meters: ten segments a channel, lit light blue, the top two white
  const segs = [];
  const meters = new Grid();
  chans.forEach((c, i) => {
    for (let k = 0; k < 10; k++) {
      const x = 104 + k * 8;
      const y = 104 + i * 8;
      for (let a = 0; a < 6; a++) for (let b = 0; b < 6; b++) meters.set(x + a, y + b, k >= 8 ? WHITE : LBLUE);
      bg.set(x + 2, y + 5, LBLUE);
      bg.set(x + 3, y + 5, LBLUE);
      segs.push({ i, k, x, y });
    }
  });
  const zp = solveZones('sound', [{ grid: bg }, { grid: meters }]);
  const tiles = countTiles([[bg, meters]], zp);
  // levels on every beat for two bars, made up per channel from its part
  const pr = rng(80);
  const level = chans.map((c, i) => Array.from({ length: 8 }, (_, b) => {
    if (c === 'DRUMS') return b % 2 === 0 ? 8 + Math.floor(pr() * 2) : 4 + Math.floor(pr() * 2);
    if (c === 'CRACKLE') return 1 + Math.floor(pr() * 2);
    if (c === 'OCEAN') return [3, 4, 5, 6, 6, 5, 4, 3][b];
    if (c === 'KALIMBA') return 3 + Math.floor(pr() * 5);
    return 5 + Math.floor(pr() * 3);
  }));
  let msvg = '';
  for (const { i, k, x, y } of segs) {
    const fr = level[i].map((lv, b) => [b * BEAT, lv > k ? 1 : 0]);
    const on = fr.map((f) => f[1]);
    if (on.every((v) => v === 0)) continue;
    const g = new Grid();
    for (let a = 0; a < 6; a++) for (let b = 0; b < 6; b++) g.set(x + a, y + b, k >= 8 ? WHITE : LBLUE);
    const cls = on.every((v) => v === 1) ? '' : ` class="${periodic('opacity', BEAT * 8, fr, on[0])}"`;
    msvg += `<g${cls}>${paint(g, zp)}</g>`;
  }
  // sprites: the cursor on BGM 01, the shark nodding along
  const nod = periodic('transform', BEAT, [[0, tr(0, 1)], [BEAT * 0.4, tr(0, 0)]], tr(0, 0));
  const legA = periodic('opacity', 0.25, [[0, 1], [0.125, 0]], 1);
  const legB = periodic('opacity', 0.25, [[0, 0], [0.125, 1]], 0);
  const cursor = `<g transform="translate(8 54)"><g class="${legA}">${paint(WALKER[0], null)}</g><g class="${legB}">${paint(WALKER[1], null)}</g></g>`;
  const fin = `<g transform="translate(200 186)"><g class="${nod}">${paint(FIN_TOP, null)}</g><g transform="translate(0 12)">${paint(FIN_RING, null)}</g></g>`;
  // notes drift up from the shark, one a bar, two pixels a step
  let notes = '';
  for (let k = 0; k < 2; k++) {
    const fr = [];
    for (let i = 0; i < 12; i++) fr.push([i * BEAT / 4, tr(4 * k, -i * 2)]);
    fr.push([3 * BEAT, tr(4 * k, 0)]);
    const mv = periodic('transform', BAR * 2, fr.map(([t, v]) => [t + k * BAR, v]).sort((a, b) => a[0] - b[0]), tr(4 * k, 0));
    const vis = periodic('opacity', BAR * 2, k ? [[0, 0], [BAR, 1], [BAR + 3 * BEAT, 0]] : [[0, 1], [3 * BEAT, 0]], k ? 0 : 1);
    notes += `<g transform="translate(${212 + 6 * k} 172)"><g class="${vis}"><g class="${mv}">${paint(NOTE, null)}</g></g></g>`;
  }
  const svg = `<rect width="256" height="240" class="c${hx(NAVY)}"/>${paint(bg, zp)}${msvg}${cursor}${fin}${notes}`;
  usedFills.add(NAVY);
  return { svg, tiles };
}

css.length = 0;
usedFills.clear();
const snd = buildSound();
const sizeS = writeSvg(OUT_SOUND, 256, 240, snd.svg, '',
  'CASTAWAY: sound test',
  'The sound test screen of the same cartridge: SOUND TEST in gold capitals; BGM 01, island theme, 60 s loop, 80 BPM, F major, ii-V-I-vi; SE 150+, all made by code; five channel meters (electric piano, kalimba, drums, crackle, ocean) stepping on the beat; samples used 0; loudness -14 LUFS; peak max -1 dBTP; listeners so far 0 (the shark is pretending), with a shark fin in headphones nodding along; tools/make_audio.py.');
console.log(`sound: ${OUT_SOUND} ${(sizeS / 1024).toFixed(1)} KB; tiles ${snd.tiles}`);
