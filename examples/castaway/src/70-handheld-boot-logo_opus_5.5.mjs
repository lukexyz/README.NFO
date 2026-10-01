#!/usr/bin/env node
// Handheld boot logo on a four-shade green LCD: README header generator for CASTAWAY.
//
//   node examples/castaway/src/70-handheld-boot-logo_opus_5.5.mjs
//
// Writes examples/castaway/assets/70-handheld-boot-logo_opus_5.5.svg.
// Plain Node, no dependencies, no clock, no Math.random: the same bytes every run.
//   --out <file>   write somewhere else (for iterating)
//   --at <sec>     freeze every animation at that moment of the loop (for checking frames)
//
// The style: the power-up of a late-1980s monochrome handheld (the original DMG model of
// a famous one). A small 1-bit wordmark scrolls down from the top of a 160 x 144 LCD in
// four green shades, stops in the middle, holds for the chime, then the screen cuts to
// the game's own title card. Visible pixel grid, slow-LCD ghosting, 8 x 8 tile lettering.
// Nothing of the real console is reproduced: not its boot logo, not its name, not its
// shell. The wordmark is CASTAWAY in an original 2-pixel-stroke face (the T is a palm),
// the device is an invented landscape handheld by the invented FOURSHADE, and the
// shades are an olive ramp of my own (the emulator convention is #081820 to #E0F8D0).
//
// One 39-second loop, 13 bars of 3 s (the project's own bar length, 80 BPM):
//    0.0  BOOT   CASTAWAY drops from the top edge to the centre (ghost trail), holds
//    3.0  TITLE  cut: tile logo over the island, PRESS START blinks on the beat,
//                python tools/serve.py under it
//    9.0  DEMO   the attract mode plays itself, one text-box page per bar: she nods,
//                nothing happens for a while, then "she could leave any time": she walks
//                out over the water, the island waits, she comes back with an iced coffee
//   38.7  OFF    the LCD blanks for a moment (a power cycle), and the logo drops again
//
// How it is drawn: every picture is painted into a 160 x 144 index buffer (shades 0..3,
// -1 transparent) and emitted as merged-rect paths, one per shade, inside a group
// scaled by 3 (1 LCD pixel = 3 viewBox units). A tiled pattern of thin lines in the
// LCD-off shade lies over everything: the pixel grid. Ghosting is a second (and third)
// copy of anything that moves, lagged 0.1 s and 0.2 s at low opacity. Cuts are step-end
// opacity, moves are steps() in whole LCD pixels. prefers-reduced-motion stops on the
// complete title card. No <text>: the screen uses an original 8 x 8 tile font, the bezel
// legends a monoline stroke face (adapted from this folder's 18-tui-monitor generator).
//
// Facts used, from D:/python/castaway on 2026-10-01: more than 90 activities in
// activities.toml on four timers (regular 2-5 min, occasional 12-25 min, rare 30-60 min,
// super rare 3-6 h), every start snapped to the next 3-second bar; "leave any time" is a
// super-rare gag; default run 10:00:00, seed 1992; theme 80 BPM, F major, 60 s loop;
// every sound synthesized by tools/make_audio.py (no samples, loops or recordings);
// renderer: python tools/serve.py, then http://127.0.0.1:8765/.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '70-handheld-boot-logo_opus_5.5';
const argAt = (f) => (process.argv.includes(f) ? process.argv[process.argv.indexOf(f) + 1] : null);
const OUT = argAt('--out') ? path.resolve(argAt('--out')) : path.resolve(HERE, `../assets/${SLUG}.svg`);
const AT = argAt('--at') !== null ? Number(argAt('--at')) : null;
const ZOOM = argAt('--zoom') !== null ? Number(argAt('--zoom')) : 1;   // debug: bigger width/height

// ------------------------------------------------------------------ geometry and time
const W = 1040, H = 540;                    // viewBox
const SW = 160, SH = 144, PX = 3;           // the LCD, and viewBox units per LCD pixel
const LX = 280, LY = 44;                    // LCD top-left in the viewBox
const L = 39;                               // loop length, s (13 bars of 3 s)
const BEAT = 0.75, BAR = 3;
const T_TITLE = 3, T_DEMO = 9, T_OFF = 38.7;

// ------------------------------------------------------------------ palette
const SHADE = ['#c4d49a', '#88a55f', '#43653e', '#14291b'];   // 0 = LCD off ... 3 = darkest
const INK = '#36353b', CORAL = '#d9604a';

// ------------------------------------------------------------------ PRNG
function mulberry32(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = mulberry32(1992);

// ------------------------------------------------------------------ index buffer
class Bmp {
  constructor(w = SW, h = SH) { this.w = w; this.h = h; this.p = new Int8Array(w * h).fill(-1); }
  set(x, y, c) { x = Math.round(x); y = Math.round(y); if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.p[y * this.w + x] = c; }
  get(x, y) { return x >= 0 && y >= 0 && x < this.w && y < this.h ? this.p[y * this.w + x] : -1; }
  rect(x, y, w, h, c) { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) this.set(i, j, c); }
  // art: array of strings, '0'..'3' a shade, anything else transparent
  art(rows, x, y, { flip = false, map = null } = {}) {
    rows.forEach((r, j) => {
      const s = flip ? [...r].reverse().join('') : r;
      [...s].forEach((ch, i) => {
        let c = map && ch in map ? map[ch] : '0123'.indexOf(ch);
        if (c >= 0) this.set(x + i, y + j, c);
      });
    });
  }
  blit(b, x, y) { for (let j = 0; j < b.h; j++) for (let i = 0; i < b.w; i++) { const c = b.p[j * b.w + i]; if (c >= 0) this.set(x + i, y + j, c); } }
  // 1-pixel ring (8-neighbour) around every opaque pixel, in shade c
  outline(c, diag = true) {
    const add = [];
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) {
      if (this.get(x, y) >= 0) continue;
      let hit = false;
      for (let dy = -1; dy <= 1 && !hit; dy++) for (let dx = -1; dx <= 1 && !hit; dx++) {
        if (!dx && !dy) continue;
        if (!diag && dx && dy) continue;
        if (this.get(x + dx, y + dy) >= 0) hit = true;
      }
      if (hit) add.push([x, y]);
    }
    for (const [x, y] of add) this.set(x, y, c);
    return this;
  }
  // merged rects, one path per shade
  paths() {
    const out = ['', '', '', ''];
    for (let c = 0; c < 4; c++) {
      let open = new Map();   // "x0,x1" -> {x, y, w, h}
      const done = [];
      for (let y = 0; y <= this.h; y++) {
        const runs = [];
        if (y < this.h) {
          let x = 0;
          while (x < this.w) {
            if (this.p[y * this.w + x] === c) { const x0 = x; while (x < this.w && this.p[y * this.w + x] === c) x++; runs.push([x0, x]); } else x++;
          }
        }
        const next = new Map();
        for (const [x0, x1] of runs) {
          const k = `${x0},${x1}`;
          const r = open.get(k);
          if (r) { r.h++; next.set(k, r); open.delete(k); } else next.set(k, { x: x0, y, w: x1 - x0, h: 1 });
        }
        for (const r of open.values()) done.push(r);
        open = next;
      }
      done.sort((a, b) => a.y - b.y || a.x - b.x);
      out[c] = done.map((r) => `M${r.x} ${r.y}h${r.w}v${r.h}h-${r.w}z`).join('');
    }
    return out;
  }
}
// a picture as SVG: one path per shade
function emit(b, cls = '', extra = '') {
  const ps = b.paths();
  const inner = ps.map((d, c) => (d ? `<path class="s${c}" d="${d}"/>` : '')).join('');
  return `<g${cls ? ` class="${cls}"` : ''}${extra}>${inner}</g>`;
}

// ------------------------------------------------------------------ the wordmark (1-bit, 56 x 8)
// An original 2-pixel-stroke face. The T is a palm: drooping fronds over a straight trunk.
const WM = {
  C: ['.####.', '##..##', '##....', '##....', '##....', '##....', '##..##', '.####.'],
  A: ['.####.', '##..##', '##..##', '##..##', '######', '##..##', '##..##', '##..##'],
  S: ['.####.', '##..##', '##....', '.####.', '....##', '....##', '##..##', '.####.'],
  T: ['.####.', '######', '#.##.#', '..##..', '..##..', '..##..', '..##..', '..##..'],
  W: ['##...##', '##...##', '##...##', '##.#.##', '##.#.##', '##.#.##', '#######', '.##.##.'],
  Y: ['##..##', '##..##', '##..##', '.####.', '..##..', '..##..', '..##..', '..##..'],
};
function wordmark() {
  const word = 'CASTAWAY';
  const w = [...word].reduce((s, ch) => s + WM[ch][0].length, 0) + word.length - 1;
  const m = Array.from({ length: 8 }, () => new Array(w).fill(0));
  let x = 0;
  for (const ch of word) {
    const g = WM[ch];
    g.forEach((r, j) => [...r].forEach((c, i) => { if (c === '#') m[j][x + i] = 1; }));
    x += g[0].length + 1;
  }
  return m;   // rows of 0/1
}
const MARK = wordmark();
const MARK_W = MARK[0].length;   // 56

// ------------------------------------------------------------------ 8 x 8 tile font
// Original: 1-pixel strokes, caps 7 high, lowercase with 2-row descenders. Glyphs up to 6 wide,
// centred in a 6-pixel box; the advance is 8 (one tile) or 7 for the long command line.
const F = {
  A: '.####.|#....#|#....#|######|#....#|#....#|#....#', B: '#####.|#....#|#....#|#####.|#....#|#....#|#####.',
  C: '.####.|#....#|#.....|#.....|#.....|#....#|.####.', D: '####..|#...#.|#....#|#....#|#....#|#...#.|####..',
  E: '######|#.....|#.....|#####.|#.....|#.....|######', F: '######|#.....|#.....|#####.|#.....|#.....|#.....',
  G: '.####.|#....#|#.....|#..###|#....#|#....#|.####.', H: '#....#|#....#|#....#|######|#....#|#....#|#....#',
  I: '#####|..#..|..#..|..#..|..#..|..#..|#####', J: '..####|.....#|.....#|.....#|#....#|#....#|.####.',
  K: '#....#|#...#.|#..#..|###...|#..#..|#...#.|#....#', L: '#.....|#.....|#.....|#.....|#.....|#.....|######',
  M: '#....#|##..##|#.##.#|#.##.#|#....#|#....#|#....#', N: '#....#|##...#|#.#..#|#..#.#|#...##|#....#|#....#',
  O: '.####.|#....#|#....#|#....#|#....#|#....#|.####.', P: '#####.|#....#|#....#|#####.|#.....|#.....|#.....',
  Q: '.####.|#....#|#....#|#....#|#..#.#|#...#.|.###.#', R: '#####.|#....#|#....#|#####.|#..#..|#...#.|#....#',
  S: '.####.|#....#|#.....|.####.|.....#|#....#|.####.', T: '#####|..#..|..#..|..#..|..#..|..#..|..#..',
  U: '#....#|#....#|#....#|#....#|#....#|#....#|.####.', V: '#....#|#....#|#....#|.#..#.|.#..#.|..##..|..##..',
  W: '#....#|#....#|#....#|#.##.#|#.##.#|##..##|#....#', X: '#....#|.#..#.|..##..|..##..|..##..|.#..#.|#....#',
  Y: '#...#|#...#|.#.#.|..#..|..#..|..#..|..#..', Z: '######|.....#|....#.|..##..|.#....|#.....|######',
  0: '.###.|#...#|#..##|#.#.#|##..#|#...#|.###.', 1: '..#..|.##..|..#..|..#..|..#..|..#..|.###.',
  2: '.###.|#...#|....#|...#.|..#..|.#...|#####', 3: '#####|...#.|..#..|...#.|....#|#...#|.###.',
  4: '...#.|..##.|.#.#.|#..#.|#####|...#.|...#.', 5: '#####|#....|####.|....#|....#|#...#|.###.',
  6: '..##.|.#...|#....|####.|#...#|#...#|.###.', 7: '#####|....#|...#.|..#..|.#...|.#...|.#...',
  8: '.###.|#...#|#...#|.###.|#...#|#...#|.###.', 9: '.###.|#...#|#...#|.####|....#|...#.|.##..',
  '.': '.|.|.|.|.|.|#', ',': '..|..|..|..|..|.#|.#|#.', ':': '.|.|#|.|.|#|.', '!': '#|#|#|#|#|.|#',
  '?': '.###.|#...#|....#|...#.|..#..|.....|..#..', "'": '#|#|.|.|.|.|.', '-': '....|....|....|####|....|....|....',
  '/': '....#|...#.|...#.|..#..|.#...|.#...|#....', '+': '.....|..#..|..#..|#####|..#..|..#..|.....',
  '(': '..#|.#.|#..|#..|#..|.#.|..#', ')': '#..|.#.|..#|..#|..#|.#.|#..',
  '>': '#...|.#..|..#.|...#|..#.|.#..|#...', '_': '......|......|......|......|......|......|######',
  '▼': '.......|.......|.......|#####|.###.|..#..|.......',
  a: '......|......|.####.|.....#|.#####|#....#|.#####', b: '#.....|#.....|#####.|#....#|#....#|#....#|#####.',
  c: '......|......|.####.|#.....|#.....|#.....|.####.', d: '.....#|.....#|.#####|#....#|#....#|#....#|.#####',
  e: '......|......|.####.|#....#|######|#.....|.####.', f: '..##|.#..|####|.#..|.#..|.#..|.#..',
  g: '......|......|.#####|#....#|#....#|#....#|.#####|.....#|.####.', h: '#.....|#.....|#####.|#....#|#....#|#....#|#....#',
  i: '.#.|...|##.|.#.|.#.|.#.|###', j: '..#|...|.##|..#|..#|..#|..#|#.#|.#.',
  k: '#....|#....|#..#.|#.#..|##...|#.#..|#..#.', l: '##.|.#.|.#.|.#.|.#.|.#.|###',
  m: '.....|.....|##.#.|#.#.#|#.#.#|#.#.#|#.#.#', n: '......|......|#####.|#....#|#....#|#....#|#....#',
  o: '......|......|.####.|#....#|#....#|#....#|.####.', p: '......|......|#####.|#....#|#....#|#....#|#####.|#.....|#.....',
  r: '.....|.....|#.###|##...|#....|#....|#....', s: '......|......|.#####|#.....|.####.|.....#|#####.',
  t: '.#...|.#...|####.|.#...|.#...|.#...|..##.', u: '......|......|#....#|#....#|#....#|#....#|.#####',
  v: '.....|.....|#...#|#...#|#...#|.#.#.|..#..', w: '.....|.....|#...#|#.#.#|#.#.#|#.#.#|.#.#.',
  y: '......|......|#....#|#....#|#....#|#....#|.#####|.....#|.####.', z: '......|......|######|....#.|..##..|.#....|######',
};
const FONT = Object.fromEntries(Object.entries(F).map(([k, v]) => [k, v.split('|')]));
function text(b, str, x, y, c, adv = 8) {
  [...str].forEach((ch, i) => {
    if (ch === ' ') return;
    const g = FONT[ch];
    if (!g) throw new Error(`tile font: no glyph for ${JSON.stringify(ch)} in ${JSON.stringify(str)}`);
    const off = Math.floor((6 - g[0].length + 1) / 2);
    g.forEach((r, j) => [...r].forEach((p, k) => { if (p === '#') b.set(x + i * adv + off + k, y + j, c); }));
  });
}
// the same lettering as <use>s of one path per glyph (much smaller than painting every page)
const tileGlyphs = new Map();
function tileId(ch) {
  if (!FONT[ch]) throw new Error(`tile font: no glyph for ${JSON.stringify(ch)}`);
  if (!tileGlyphs.has(ch)) tileGlyphs.set(ch, 't' + tileGlyphs.size.toString(36));
  return tileGlyphs.get(ch);
}
function tileDef(ch, id) {
  const g = FONT[ch], off = Math.floor((6 - g[0].length + 1) / 2);
  let d = '';
  g.forEach((r, j) => { for (const m of r.matchAll(/#+/g)) d += `M${off + m.index} ${j}h${m[0].length}v1h-${m[0].length}z`; });
  return `<path id="${id}" d="${d}"/>`;
}
function textUse(str, x, y, c, adv = 8) {
  let u = '';
  [...str].forEach((ch, i) => { if (ch !== ' ') u += `<use href="#${tileId(ch)}" x="${x + i * adv}" y="${y}"/>`; });
  return `<g class="s${c}">${u}</g>`;
}
const textW = (str, adv = 8) => str.length * adv - (adv - 6);
const centreX = (str, adv = 8) => Math.round((SW - textW(str, adv)) / 2);

// ------------------------------------------------------------------ her (original sprite, 4 shades)
// Brown hair in a low bun (3), cream headphones (0), skin (1), coral tank top (2), cream
// shorts (0), bare feet. Facing right; outlines are added in the darkest shade.
// Head 10 x 8, facing right: hair (3) with a low bun at the back, a cream band (0) over the
// crown down to the ear cup, face (0) with one eye.
const HEAD = [
  '...33033..',
  '..3330333.',
  '.33303333.',
  '.33003000.',
  '.33003030.',
  '333003000.',
  '33333000..',
  '.33..00...',
];
// Body 10 x 10: coral tank top (2) with bare arms (0), cream shorts (1), legs and feet (0).
const TORSO = ['..022220..', '..022220..', '..022220..', '..022220..', '..011110..', '...1111...'];
const LEGS = {
  stand: ['...0.0....', '...0.0....', '...0.0....', '..00.00...'],
  walk1: ['...0.0....', '..0...0...', '.0.....0..', '00.....00.'],
  walk2: ['...0.0....', '...0.0....', '....00....', '...000....'],
};
function her({ body = 'stand', nod = 0, cup = false, sip = false, flip = false }) {
  // 18 wide with the body in the middle, so a mirrored frame stays where it was
  const b = new Bmp(18, 22);
  const bx = 4, by = 1;
  b.art(TORSO, bx, by + 8);
  b.art(LEGS[body], bx, by + 14);
  if (cup && !sip) {
    // forearm held out in front, the iced coffee at chest height: a tall clear cup (0) with
    // the coffee (1) in its lower half; the straw is added after the outline
    b.art(['..022220..', '..0222200.', '..022220..'], bx, by + 8);
    b.art(['000', '000', '111', '111'], bx + 9, by + 7);
  }
  b.art(HEAD, bx, by + nod);
  if (cup && sip) {
    // cup raised to her mouth, elbow out
    b.art(['..0222200.', '..02222.0.', '..022220..'], bx, by + 8);
    b.art(['000', '000', '111', '111'], bx + 9, by + 3 + nod);
  }
  b.outline(3, false);
  // the straw, after the outline so it stands clear of it
  if (cup && !sip) b.art(['..3', '..3', '.3.'], bx + 10, by + 4);
  if (cup && sip) b.art(['3..', '.3.'], bx + 8, by + 1 + nod);
  if (flip) {
    const f = new Bmp(b.w, b.h);
    for (let y = 0; y < b.h; y++) for (let x = 0; x < b.w; x++) f.p[y * b.w + (b.w - 1 - x)] = b.p[y * b.w + x];
    return f;
  }
  return b;
}
// --sheet: every sprite frame at 12x, for drawing them
if (process.argv.includes('--sheet')) {
  const fr = [her({}), her({ nod: 1 }), her({ body: 'walk1' }), her({ body: 'walk2' }), her({ cup: true }), her({ cup: true, sip: true }), her({ body: 'walk1', cup: true, flip: true })];
  const Z = 12;
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${fr.length * 16 * Z} ${24 * Z}" width="${fr.length * 16 * Z}" height="${24 * Z}"><style>.s0{fill:#c4d49a}.s1{fill:#88a55f}.s2{fill:#43653e}.s3{fill:#14291b}</style><rect width="50%" height="100%" fill="#88a55f"/><rect x="50%" width="50%" height="100%" fill="#c4d49a"/>`;
  fr.forEach((b, i) => { s += `<g transform="translate(${i * 16 * Z} 0) scale(${Z})" shape-rendering="crispEdges">${emit(b)}</g>`; });
  fs.writeFileSync(argAt('--sheet'), s + '</svg>');
  process.exit(0);
}

// ------------------------------------------------------------------ the island world (160 x 120)
const HORIZON = 46;
function sky(b) {
  b.rect(0, 0, SW, HORIZON, 0);
  // sun, top right: a disc in shade 1 with a highlight and short rays
  const sx = 146, sy = 13;
  for (let y = -6; y <= 6; y++) for (let x = -6; x <= 6; x++) if (x * x + y * y <= 30) b.set(sx + x, sy + y, 1);
  b.art(['00.', '0..'], sx - 3, sy - 3);
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2 + 0.2;
    for (let r = 8.5; r <= 10; r += 1) b.set(sx + Math.cos(a) * r, sy + Math.sin(a) * r, 1);
  }
  // haze: a sparse ordered dither just above the horizon
  // a low bank of cloud tops sitting on the horizon (shade 1 outline, sky-coloured inside)
  const bank = new Bmp(SW, HORIZON);
  const rb = mulberry32(5);
  for (let x = -4; x < SW + 4; x += 5 + Math.floor(rb() * 6)) {
    const rad = 2 + rb() * 3.2;
    for (let yy = -6; yy <= 0; yy++) for (let xx = -6; xx <= 6; xx++) if (xx * xx + yy * yy <= rad * rad) bank.set(x + xx, HORIZON - 1 + yy, 0);
  }
  bank.outline(1, false);
  for (let x = 0; x < SW; x++) bank.set(x, HORIZON - 1, 0);
  // keep the far right clear for the sun's glitter
  for (let y = 0; y < HORIZON; y++) for (let x = 0; x < SW; x++) if (bank.get(x, y) >= 0 && !(x > 132 && x < 160)) b.set(x, y, bank.get(x, y));
}
function sea(b, frame) {
  const r = mulberry32(77 + frame * 13);
  b.rect(0, HORIZON, SW, 120 - HORIZON, 1);
  b.rect(0, HORIZON, SW, 1, 2);
  // far water: long thin streaks
  for (let y = HORIZON + 2; y < HORIZON + 10; y += 2) {
    for (let n = 0; n < 6; n++) {
      const x = Math.floor(r() * SW), w = 3 + Math.floor(r() * 8);
      b.rect(x, y, w, 1, 2);
    }
  }
  // nearer: small wave crests
  for (let n = 0; n < 70; n++) {
    const y = HORIZON + 12 + Math.floor(r() * 62);
    const x = Math.floor(r() * SW);
    const big = y > 96;
    b.art(big ? ['2...2', '.222.'] : ['2..2', '.22.'], x, y);
  }
  // the sun's glitter path, straight down from the sun
  for (let y = HORIZON + 2; y < 112; y += 3) {
    const spread = 2 + Math.floor((y - HORIZON) / 9);
    const x = 146 + Math.floor((r() - 0.5) * spread * 2);
    const w = 1 + Math.floor(r() * 3);
    b.rect(x, y, w, 1, 0);
  }
}
// island: sand mound, wet edge, shallow-water dither ring, foam
const ISLAND = { cx: 66, top: 82 };
const ISLAND_ROWS = [16, 22, 26, 28, 30, 31, 31, 30, 28, 25];   // half-widths from y = 82
function island(b, frame) {
  const { cx, top } = ISLAND;
  // shallow ring (dither of 0 and 1) and foam
  ISLAND_ROWS.forEach((hw, j) => {
    const y = top + j;
    for (let x = cx - hw - 6; x <= cx + hw + 6; x++) if ((x + y + frame) % 2 === 0) b.set(x, y, 0);
  });
  for (let j = 0; j < 4; j++) {
    const y = top + ISLAND_ROWS.length + j, hw = 25 - j * 4;
    for (let x = cx - hw - 4; x <= cx + hw + 4; x++) if ((x + y + frame) % 2 === 0) b.set(x, y, 0);
  }
  ISLAND_ROWS.forEach((hw, j) => {
    const y = top + j;
    for (let x = cx - hw; x <= cx + hw; x++) {
      let c = 0;
      if (j >= 7) c = 1;
      else if (j === 6 && (x + y) % 2 === 0) c = 1;
      b.set(x, y, c);
    }
  });
  // pebbles and the palm's shadow on the sand
  b.art(['1.1..1', '..1...'], cx + 16, top + 3);
  b.art(['.111111.', '11111111', '.111111.'], cx + 2, top + 3);
  b.art(['2', '.', '..2'], cx - 18, top + 4);
  // rocks at the waterline
  b.art(['.22.', '2332'], cx - 14, top + 7);
  b.art(['.2.', '233'], cx + 22, top + 6);
  // foam line along the shore
  ISLAND_ROWS.forEach((hw, j) => {
    const y = top + j;
    if (j < 3) return;
    if ((j + frame) % 2 === 0) { b.set(cx - hw - 2, y, 0); b.set(cx + hw + 2, y, 0); }
  });
  // bushes, left and right of the palm (shade 2 with dark edges)
  const bush = ['..2.2..', '.22222.', '2222222', '3222223', '.33333.'];
  b.art(bush, cx + 4, top - 3);
  b.art(['.2.2.', '22222', '32223', '.333.'], cx + 18, top - 1);
  b.art(['.2..', '222.', '3223'], cx - 26, top + 1);
}
// palm: segmented trunk leaning right, drooping fronds, coconuts
const PALM = { bx: 79, by: 82, tx: 90, ty: 47 };
function palm(b, frame) {
  const { bx, by, tx, ty } = PALM;
  const n = by - ty;
  for (let j = 0; j <= n; j++) {
    const t = j / n;                       // 0 at the base, 1 at the top
    const x = bx + (tx - bx) * (t * t * 0.6 + t * 0.4);
    const y = by - j;
    const w = t < 0.4 ? 3 : 2;
    for (let k = 0; k < w; k++) b.set(x + k, y, (j % 4 === 0) ? 3 : 2);
    b.set(x - 1, y, 3);
    b.set(x + w, y, 3);
  }
  // flared base
  b.art(['3223', '322223'], bx - 2, by - 1);
  // fronds: quadratic curves from the crown, thick in the middle, leaflets hanging below
  const sway = frame ? 1 : 0;
  // fronds as leaves: a curved rib with a blade hanging below it, widest a third of the way
  // out, with a jagged lower edge; filled shade 2, outlined shade 3, rib in shade 3
  // [tip x, tip y, control x, control y] relative to the crown
  const fronds = [
    [-26, 10, -14, -8], [-18, 16, -9, -1], [-12, -6, -8, -9], [8, -7, 5, -9],
    [25, 12, 13, -8], [28, 4, 15, -7], [14, 17, 8, 1], [-4, 15, -2, 5],
  ];
  const leaf = new Bmp(SW, 120), ribs = [];
  for (const [ex0, ey0, cx2, cy2] of fronds) {
    const ex = ex0 + (ex0 > 0 ? sway : -sway), ey = ey0 + sway;
    for (let s = 0; s <= 90; s++) {
      const t = s / 90;
      const x = tx + 1 + 2 * (1 - t) * t * cx2 + t * t * ex, y = ty + 2 * (1 - t) * t * cy2 + t * t * ey;
      ribs.push([x, y]);
      if (t < 0.08) continue;
      const w = 3.6 * Math.sin(Math.PI * Math.min(1, (t - 0.08) / 0.92)) ** 0.8 * (1 - 0.35 * t) * ((s >> 2) % 2 ? 1 : 0.55);
      for (let k = 0; k <= w; k += 0.5) leaf.set(x, y + k, 2);
    }
  }
  const blade = new Bmp(SW, 120); blade.blit(leaf, 0, 0); blade.outline(3, false);
  b.blit(blade, 0, 0);
  for (const [x, y] of ribs) b.set(x, y, 3);
  // crown centre and coconuts
  b.art(['.333.', '33333', '.333.'], tx - 1, ty - 1);
  b.art(['.3..3', '303303', '.3.3.', '..303', '...3.'], tx - 1, ty + 1);
}
// raft: lashed logs, floating right of the island
function raft(b) {
  // three logs seen from a little above, each one step further right; cut ends (0) on the
  // left, two rope lashings (1) across
  const x = 116, y = 85;
  b.art([
    '.333333333333333333333333...',
    '30022222221222222222122223..',
    '30033333331333333333133333..',
    '.333333333333333333333333333',
    '.30022222221222222222122223.',
    '.30033333331333333333133333.',
    '..33333333333333333333333333',
    '..3002222222122222222212222 3',
    '..300333333313333333331333333',
    '...33333333333333333333333333',
  ].map((r) => r.replace(/ /g, '')), x, y);
}
// clouds (their own layer, so they can drift)
function cloud(b, x, y, w) {
  const m = new Bmp(w + 4, 12);
  const r = mulberry32(x * 7 + y);
  const bumps = Math.max(2, Math.floor(w / 7));
  for (let k = 0; k < bumps; k++) {
    const cx = 3 + Math.round((k + 0.5) * (w / bumps)), rad = 2.5 + r() * 2.8, cy = 8 - rad * 0.8;
    for (let yy = -6; yy <= 6; yy++) for (let xx = -6; xx <= 6; xx++) if (xx * xx + yy * yy <= rad * rad && cy + yy < 9) m.set(cx + xx, cy + yy, 0);
  }
  m.rect(2, 7, w, 2, 0);
  m.outline(1, false);
  // flat shaded underside
  for (let i = 0; i < m.w; i++) if (m.get(i, 8) === 0) m.set(i, 8, 1);
  b.blit(m, x, y);
}

// ------------------------------------------------------------------ text box (attract-mode narration)
const BOX_Y = 96;
function textBox(b, y = BOX_Y, h = SH - BOX_Y) {
  b.rect(0, y, SW, h, 0);
  // double line border, rounded corners
  const ring = (i, c) => {
    for (let x = i + 1; x < SW - i - 1; x++) { b.set(x, y + i, c); b.set(x, y + h - 1 - i, c); }
    for (let yy = y + i + 1; yy < y + h - i - 1; yy++) { b.set(i, yy, c); b.set(SW - 1 - i, yy, c); }
  };
  ring(0, 3); ring(2, 3);
  b.set(2, y + 2, 3); b.set(SW - 3, y + 2, 3); b.set(2, y + h - 3, 3); b.set(SW - 3, y + h - 3, 3);
}
const PAGES = [
  ['SHE IS ON A VERY', 'SMALL ISLAND.'],
  ['SHE NODS TO THE', 'MUSIC.'],
  ['NOTHING HAPPENS.', ''],
  ['IT IS GOING', 'VERY WELL.'],
  ['SHE COULD LEAVE', 'ANY TIME.'],
  ['SO SHE DOES.', ''],
  ['THE ISLAND WAITS.', ''],
  ['SHE IS BACK.', 'SHE HAS A COFFEE.'],
  ['IT IS ICED.', ''],
  ['NEXT ONE LIKE IT:', 'IN 3 TO 6 HOURS.'],
];
for (const p of PAGES) for (const l of p) if (l.length > 18) throw new Error(`text box line too long: ${l}`);

// ------------------------------------------------------------------ CSS helpers
const css = [];
const pc = (t) => `${+((t / L) * 100).toFixed(3)}%`;
// delay for an animation of period P lagging by `lag` seconds (and frozen at AT if given)
function delayFor(P, lag) {
  const T = AT ?? 0;
  const d = (((T - lag) % P) + P) % P;
  return d ? `;animation-delay:-${+d.toFixed(3)}s` : '';
}
let kfN = 0;
const kfName = () => 'k' + (kfN++).toString(36);
// keyframes over the loop: stops = [[t, decl, timing?]]
const kfCache = new Map();
function keyframes(body) {
  if (!kfCache.has(body)) { const name = kfName(); kfCache.set(body, name); css.push(`@keyframes ${name}{${body}}`); }
  return kfCache.get(body);
}
function loopKf(stops) {
  return keyframes(stops.map(([t, d, tf]) => `${pc(t)}{${d}${tf ? `;animation-timing-function:${tf}` : ''}}`).join(''));
}
// shown only inside the given windows [[a, b], ...] of the loop (hard cuts)
function windows(ws) {
  const stops = [[0, 'opacity:0']];
  for (const [a, b] of ws) { stops.push([a, 'opacity:1']); if (b < L) stops.push([b, 'opacity:0']); }
  stops.push([L, ws.some(([, b]) => b >= L) ? 'opacity:1' : 'opacity:0']);
  // merge equal times (keep the last)
  const m = new Map(); for (const s of stops) m.set(s[0], s);
  return loopKf([...m.values()].sort((a, b) => a[0] - b[0]));
}
let clsN = 0;
// a class that runs an animation: name, period, timing, lag
const clsCache = new Map();
function animCls(name, P = L, tf = 'step-end', lag = 0) {
  const rule = `animation:${name} ${P}s ${tf} infinite${delayFor(P, lag)}`;
  if (!clsCache.has(rule)) { const c = 'a' + (clsN++).toString(36); clsCache.set(rule, c); css.push(`.${c}{${rule}}`); }
  return clsCache.get(rule);
}
// a short periodic toggle: visible for the [from, to) fraction of each period P
function toggle(P, from, to) {
  const s = [`0%{opacity:${from === 0 ? 1 : 0}}`];
  if (from > 0) s.push(`${+(from * 100).toFixed(2)}%{opacity:1}`);
  if (to < 1) s.push(`${+(to * 100).toFixed(2)}%{opacity:0}`);
  return keyframes(s.join(''));
}

// ------------------------------------------------------------------ build the screen
const layers = [];   // SVG strings inside the LCD group, back to front

// --- shared world (title + demo), two shimmer frames
const worldA = new Bmp(SW, 120), worldB = new Bmp(SW, 120);
for (const [w, f] of [[worldA, 0], [worldB, 1]]) { sky(w); sea(w, f); island(w, f); palm(w, f); }
const raftB = new Bmp(SW, 120); raft(raftB);
// the sky is identical in both frames: keep it in A only, B paints just below the haze
const worldBOnly = new Bmp(SW, 120);
// palm crown differs between frames above the horizon too
for (let y = 0; y < 120; y++) for (let x = 0; x < SW; x++) if (worldA.p[y * SW + x] !== worldB.p[y * SW + x]) worldBOnly.p[y * SW + x] = worldB.p[y * SW + x];
const shimmer = toggle(2 * BEAT, 0.5, 1);   // B shows on the second beat of every two

// raft is redrawn on its own so it can bob; clouds drift
const clouds = new Bmp(SW + 60, 30);
cloud(clouds, 8, 6, 22); cloud(clouds, 60, 14, 16); cloud(clouds, 100, 4, 24); cloud(clouds, 184, 9, 18);

const worldVis = windows([[T_TITLE, T_OFF]]);
const driftKf = loopKf([[0, 'transform:translateX(0)', 'steps(39,end)'], [L, 'transform:translateX(-39px)']]);
const bobKf = keyframes('0%{transform:translateY(0)}50%{transform:translateY(1px)}');   // the raft rides each other beat

layers.push(`<g class="world ${animCls(worldVis)}">`
  + emit(worldA)
  + `<g class="${animCls(driftKf)}">${emit(clouds)}</g>`
  + emit(worldBOnly, animCls(shimmer, 2 * BEAT))
  + emit(raftB, animCls(bobKf, 2 * BEAT))
  + `</g>`);

// --- her: idle, walk right, (gone), walk back with a coffee, idle with the coffee, sip
const HOME_X = 40, HOME_Y = 67;
const frames = {
  idleA: her({}), idleB: her({ nod: 1 }),
  walkR1: her({ body: 'walk1' }), walkR2: her({ body: 'walk2' }),
  walkL1: her({ body: 'walk1', cup: true, flip: true }), walkL2: her({ body: 'walk2', cup: true, flip: true }),
  cupA: her({ cup: true }), cupB: her({ cup: true, nod: 1 }),
  sipA: her({ cup: true, sip: true }), sipB: her({ cup: true, sip: true, nod: 1 }),
};
// ripples where she walks on water (drawn under her feet in the walk frames)
for (const k of ['walkR1', 'walkR2', 'walkL1', 'walkL2']) { const f = frames[k]; f.art(['0.0.......0.0.'], 2, 20); }
const nodName = toggle(BEAT, 0.5, 1);         // head down on the second half of each beat
const nodUp = toggle(BEAT, 0, 0.5);
const stepA = toggle(0.5, 0, 0.5), stepB = toggle(0.5, 0.5, 1);

// time plan (s)
const WALK_OUT = [24, 27], AWAY = [27, 30], WALK_IN = [30, 33], CUP = [33, 39];
const OFFSCREEN = 168;
function herGroup(lag) {
  const P = (name, per) => animCls(name, per, 'step-end', lag);
  const vis = (ws) => animCls(windows(ws), L, 'step-end', lag);
  const dx = OFFSCREEN - HOME_X;
  const moveKf = loopKf([
    [0, 'transform:translateX(0)'],
    [WALK_OUT[0], 'transform:translateX(0)', `steps(${dx / 2},end)`],
    [WALK_OUT[1], `transform:translateX(${dx}px)`],
    [WALK_IN[0], `transform:translateX(${dx}px)`, `steps(${dx / 2},end)`],
    [WALK_IN[1], 'transform:translateX(0)'],
    [L, 'transform:translateX(0)'],
  ]);
  const mv = animCls(moveKf, L, 'linear', lag);
  const f = (k, cls) => `<use href="#h${k}" class="${cls}"/>`;   // frames live once, in <defs>
  return `<g class="${mv}">`
    + `<g class="${vis([[T_TITLE, WALK_OUT[0]]])}">${f('idleA', P(nodUp, BEAT))}${f('idleB', P(nodName, BEAT))}</g>`
    + `<g class="${vis([WALK_OUT])}">${f('walkR1', P(stepA, 0.5))}${f('walkR2', P(stepB, 0.5))}</g>`
    + `<g class="${vis([WALK_IN])}">${f('walkL1', P(stepA, 0.5))}${f('walkL2', P(stepB, 0.5))}</g>`
    + `<g class="${vis([[CUP[0], 34.5], [36, CUP[1]]])}">${f('cupA', P(nodUp, BEAT))}${f('cupB', P(nodName, BEAT))}</g>`
    + `<g class="${vis([[34.5, 36]])}">${f('sipA', P(nodUp, BEAT))}${f('sipB', P(nodName, BEAT))}</g>`
    + `</g>`;
}
layers.push(`<g class="world ${animCls(worldVis)}" transform="translate(${HOME_X - 4} ${HOME_Y - 2})">`
  + `<g opacity=".14">${herGroup(0.2)}</g><g opacity=".32">${herGroup(0.1)}</g>${herGroup(0)}</g>`);

// --- title card: tile logo in the sky, PRESS START band
const title = new Bmp();
{
  // the wordmark at 2 x 3, filled 1 with a 0 highlight, outlined 3, shadow 2
  const sx = 2, sy = 3;
  const lw = MARK_W * sx, lh = 8 * sy;
  const ox = Math.round((SW - lw) / 2), oy = 6;
  const mask = new Bmp();
  for (let j = 0; j < 8; j++) for (let i = 0; i < MARK_W; i++) if (MARK[j][i]) mask.rect(ox + i * sx, oy + j * sy, sx, sy, 1);
  const shadow = new Bmp();
  for (let y = 0; y < SH; y++) for (let x = 0; x < SW; x++) if (mask.get(x, y) >= 0) shadow.set(x + 2, y + 2, 2);
  shadow.outline(3, false);
  title.blit(shadow, 0, 0);
  const body = new Bmp();
  for (let y = 0; y < SH; y++) for (let x = 0; x < SW; x++) if (mask.get(x, y) >= 0) {
    const row = Math.floor((y - oy) / sy);
    body.set(x, y, row <= 1 ? 0 : row >= 6 ? 2 : 1);
  }
  body.outline(3, false);
  title.blit(body, 0, 0);
  // band
  title.rect(0, 112, SW, 32, 3);
  title.rect(0, 113, SW, 1, 2);
}
const blink = toggle(BEAT, 0, 0.5);
layers.push(`<g class="title ${animCls(windows([[T_TITLE, T_DEMO]]))}">${emit(title)}${textUse('python tools/serve.py', centreX('python tools/serve.py', 7), 131, 1, 7)}<g class="${animCls(blink, BEAT)}">${textUse('PRESS START', centreX('PRESS START'), 118, 0)}</g></g>`);

// --- demo text box: one page per bar, typed out a letter at a time
{
  const box = new Bmp();
  textBox(box);
  // the frame goes on top of the typing covers, the fill underneath
  const frame = new Bmp();
  for (let i = 0; i < box.p.length; i++) if (box.p[i] === 3) { frame.p[i] = 3; box.p[i] = 0; }
  let pages = '';
  PAGES.forEach(([l1, l2], k) => {
    const t0 = T_DEMO + k * BAR;
    const pb = textUse(l1, 8, 105, 3) + (l2 ? textUse(l2, 8, 121, 3) : '');
    // covers: box-coloured rects that slide right one tile per letter
    const cover = (len, y, start) => {
      const kf = loopKf([
        [0, 'transform:translateX(0)'],
        [start, 'transform:translateX(0)', `steps(${len},end)`],
        [start + len * 0.035, `transform:translateX(${len * 8}px)`],
        [L, `transform:translateX(${len * 8}px)`],
      ]);
      return `<rect class="s0 ${animCls(kf, L, 'linear')}" x="7" y="${y}" width="${len * 8 + 2}" height="9"/>`;
    };
    const s1 = t0 + 0.15, s2 = s1 + l1.length * 0.035 + 0.12;
    pages += `<g class="${animCls(windows([[t0, Math.min(t0 + BAR, T_OFF)]]))}">${pb}${cover(l1.length, 104, s1)}${l2 ? cover(l2.length, 120, s2) : ''}</g>`;
  });
  layers.push(`<g class="demo ${animCls(windows([[T_DEMO, T_OFF]]))}">${emit(box)}${pages}${emit(frame)}<g class="${animCls(blink, BEAT)}">${textUse('▼', 146, 133, 3)}</g></g>`);
}

// --- boot: the wordmark drops from the top edge to the centre, holds, cut
{
  const m = new Bmp(MARK_W * 2, 16);
  for (let j = 0; j < 8; j++) for (let i = 0; i < MARK_W; i++) if (MARK[j][i]) m.rect(i * 2, j * 2, 2, 2, 3);
  const x = (SW - MARK_W * 2) / 2, yEnd = (SH - 16) / 2;
  const tLand = 2.2;
  const dropKf = loopKf([
    [0, 'transform:translateY(0)', `steps(${yEnd},end)`],
    [tLand, `transform:translateY(${yEnd}px)`],
    [37.5, `transform:translateY(${yEnd}px)`],
    [37.6, 'transform:translateY(0)'],
    [L, 'transform:translateY(0)'],
  ]);
  const one = (lag, op) => `<g${op < 1 ? ` opacity="${op}"` : ''}><g class="${animCls(dropKf, L, 'linear', lag)}">${emit(m)}</g></g>`;
  layers.push(`<g class="boot ${animCls(windows([[0, T_TITLE]]))}" transform="translate(${x} 0)">${one(0.2, 0.14)}${one(0.1, 0.3)}${one(0, 1)}</g>`);
}

// ------------------------------------------------------------------ bezel lettering: monoline stroke face
// Adapted from this folder's 18-tui-monitor generator. Glyph box x 0..6, caps y 0..10.
const O_CAP = 'M2.6 0H3.4Q6 0 6 2.6V7.4Q6 10 3.4 10H2.6Q0 10 0 7.4V2.6Q0 0 2.6 0Z';
const GL = {
  A: 'M0 10L3 0L6 10M1 6.7H5', B: 'M0 0V10H3.8Q6 10 6 7.6Q6 5 3.6 5H0M3.4 5Q5.6 5 5.6 2.5Q5.6 0 3.4 0H0',
  C: 'M6 2Q5.4 0 3.2 0H2.6Q0 0 0 2.6V7.4Q0 10 2.6 10H3.2Q5.4 10 6 8', D: 'M0 0V10H2.8Q6 10 6 7V3Q6 0 2.8 0Z',
  E: 'M6 0H0V10H6M0 5H4.6', F: 'M6 0H0V10M0 5H4.6',
  G: 'M6 2Q5.4 0 3.2 0H2.6Q0 0 0 2.6V7.4Q0 10 2.6 10H3.4Q6 10 6 7.4V5.2H3.4', H: 'M0 0V10M6 0V10M0 5H6',
  I: 'M1.2 0H4.8M3 0V10M1.2 10H4.8', J: 'M2.4 0H6V7.4Q6 10 3.4 10H2.6Q0 10 0 7.6', K: 'M0 0V10M6 0L0.4 6M2.2 4.2L6 10',
  L: 'M0 0V10H6', M: 'M0 10V0L3 5.6L6 0V10', N: 'M0 10V0L6 10V0', O: O_CAP,
  P: 'M0 10V0H3.4Q6 0 6 2.8Q6 5.6 3.4 5.6H0', Q: O_CAP + 'M3.6 7.6L6.2 11.4',
  R: 'M0 10V0H3.4Q6 0 6 2.8Q6 5.6 3.4 5.6H0M3.2 5.6L6 10',
  S: 'M5.8 1.6Q5 0 3 0Q0.2 0 0.2 2.6Q0.2 4.6 3 5Q5.8 5.4 5.8 7.4Q5.8 10 3 10Q0.8 10 0 8.2',
  T: 'M0 0H6M3 0V10', U: 'M0 0V7.4Q0 10 2.6 10H3.4Q6 10 6 7.4V0', V: 'M0 0L3 10L6 0',
  W: 'M0 0L1.3 10L3 3.6L4.7 10L6 0', X: 'M0 0L6 10M6 0L0 10', Y: 'M0 0L3 5.2L6 0M3 5.2V10', Z: 'M0 0H6L0 10H6',
  0: O_CAP + 'M4.4 2.6L1.6 7.4', 1: 'M0.8 2.2L3.2 0V10M0.6 10H5.6',
  2: 'M0.2 2.2Q0.8 0 3 0Q5.8 0 5.8 2.8Q5.8 4.6 3.8 6L0 10H6',
  3: 'M0.2 1.6Q1 0 3 0Q5.6 0 5.6 2.5Q5.6 5 2.8 5H2M2.8 5Q6 5 6 7.5Q6 10 3 10Q0.8 10 0 8.2',
  4: 'M4.4 10V0L0 7H6', 5: 'M5.6 0H0.6L0.2 4.8Q1.4 3.8 3 3.8Q6 3.8 6 6.9Q6 10 3 10Q0.9 10 0 8.4',
  6: 'M5.2 0.8Q4.4 0 3 0Q0 0 0 4.2V7.2Q0 10 3 10Q6 10 6 7.1Q6 4.3 3 4.3Q0.9 4.3 0 6', 7: 'M0 0H6L2.2 10',
  8: 'M3 4.8Q0.5 4.8 0.5 2.4Q0.5 0 3 0Q5.5 0 5.5 2.4Q5.5 4.8 3 4.8Q0 4.8 0 7.4Q0 10 3 10Q6 10 6 7.4Q6 4.8 3 4.8Z',
  9: 'M0.8 9.2Q1.6 10 3 10Q6 10 6 5.8V2.8Q6 0 3 0Q0 0 0 2.9Q0 5.7 3 5.7Q5.1 5.7 6 4',
  a: 'M0.6 3.6Q1.4 3 3 3Q5.6 3 5.6 5.4V10M5.6 6.2H2.6Q0 6.2 0 8.1Q0 10 2.4 10Q4.6 10 5.6 8.4',
  c: 'M5.8 3.8Q5 3 3.4 3H2.6Q0 3 0 5.6V7.4Q0 10 2.6 10H3.4Q5 10 5.8 9.2',
  e: 'M0 6.6H6V5.6Q6 3 3.4 3H2.6Q0 3 0 5.6V7.4Q0 10 2.6 10H3.6Q5.1 10 5.8 9.2',
  h: 'M0 0V10M0 3H3.4Q6 3 6 5.6V10', l: 'M0.6 0H3V7.6Q3 10 5 10H6', n: 'M0 10V3H3.4Q6 3 6 5.6V10',
  o: 'M2.6 3H3.4Q6 3 6 5.6V7.4Q6 10 3.4 10H2.6Q0 10 0 7.4V5.6Q0 3 2.6 3Z',
  p: 'M0 13V3H3.4Q6 3 6 5.6V7.4Q6 10 3.4 10H0', r: 'M0.6 3V10M0.6 5.8Q0.6 3 3.4 3H5.8',
  s: 'M5.6 3.6Q4.8 3 3.2 3H2.6Q0.3 3 0.3 4.8Q0.3 6.4 3 6.4Q5.8 6.4 5.8 8.2Q5.8 10 3.2 10H2.6Q0.8 10 0 9.2',
  t: 'M2.2 0.6V7.6Q2.2 10 4.4 10H5.8M0 3H5.4', v: 'M0 3L3 10L6 3', y: 'M0 3L3 9.6M6 3L2.4 11.8Q1.9 13 0.6 13',
  '.': 'M3 9.3V9.9', ',': 'M3.2 9.2V9.8L2.2 11.8', ':': 'M3 3.7V4.3M3 9.3V9.9', '!': 'M3 0V7M3 9.3V9.9',
  "'": 'M3 0V3', '-': 'M1 6.2H5', '/': 'M5.6 -0.4L0.4 10.4', '+': 'M3 3.2V9.2M0 6.2H6',
  '·': 'M3 5.6V6.2', '×': 'M1 3.4L5 8.4M5 3.4L1 8.4', '?': 'M0.4 1.8Q1 0 3 0Q5.8 0 5.8 2.6Q5.8 4.2 3 5.2V7M3 9.3V9.9',
  '(': 'M4.4 -0.6Q1.6 2 1.6 5Q1.6 8 4.4 10.6', ')': 'M1.6 -0.6Q4.4 2 4.4 5Q4.4 8 1.6 10.6',
};
const usedGlyphs = new Map();
const gId = (ch) => {
  if (!(ch in GL)) throw new Error(`stroke face: no glyph for ${JSON.stringify(ch)}`);
  if (!usedGlyphs.has(ch)) usedGlyphs.set(ch, 'g' + usedGlyphs.size.toString(36));
  return usedGlyphs.get(ch);
};
const ADV = 9.4;   // glyph units per character
const legendW = (str, cap) => (str.length * ADV - (ADV - 6)) * (cap / 10);
// a legend: str at (x, y = top of caps), cap height, stroke weight in viewBox units
function legend(str, x, y, cap, { weight = 1.3, color = INK, anchor = 'start' } = {}) {
  const s = cap / 10;
  const w = legendW(str, cap);
  const x0 = anchor === 'middle' ? x - w / 2 : anchor === 'end' ? x - w : x;
  let uses = '';
  [...str].forEach((ch, i) => { if (ch !== ' ') uses += `<use href="#${gId(ch)}" x="${+(i * ADV).toFixed(2)}"/>`; });
  return `<g transform="translate(${+x0.toFixed(2)} ${y}) scale(${s})" stroke="${color}" stroke-width="${+(weight / s).toFixed(3)}">${uses}</g>`;
}

// ------------------------------------------------------------------ the bezel
const bezel = [];
// soft shadow, plastic slab, edge highlight
bezel.push(`<rect x="12" y="16" width="${W - 24}" height="${H - 20}" rx="34" fill="#000" opacity=".10"/>`);
bezel.push(`<rect x="9" y="11" width="${W - 18}" height="${H - 18}" rx="34" fill="#000" opacity=".08"/>`);
bezel.push(`<rect x="6" y="6" width="${W - 12}" height="${H - 16}" rx="32" fill="url(#plastic)" stroke="#a9a293" stroke-width="1.5"/>`);
bezel.push(`<rect x="9.5" y="9.5" width="${W - 19}" height="${H - 23}" rx="29" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="1.2"/>`);
// the lens
const LENS = { x: LX - 34, y: 22, w: SW * PX + 68, h: 496 };
bezel.push(`<rect x="${LENS.x}" y="${LENS.y}" width="${LENS.w}" height="${LENS.h}" rx="18" fill="url(#lens)"/>`);
bezel.push(`<rect x="${LENS.x + 1}" y="${LENS.y + 1}" width="${LENS.w - 2}" height="${LENS.h - 2}" rx="17" fill="none" stroke="#000" stroke-opacity=".35" stroke-width="2"/>`);
bezel.push(`<rect x="${LX - 7}" y="${LY - 7}" width="${SW * PX + 14}" height="${SH * PX + 14}" rx="4" fill="#202229"/>`);

const CAP = 12, LINE = 20;
const rule = (x, y) => `<rect x="${x}" y="${y}" width="36" height="2.6" rx="1" fill="${CORAL}"/>`;
// left side: the lamp, the name, what it is, what happens
const left = [];
const LP = 40;
left.push(`<circle cx="${LP + 8}" cy="52" r="15" fill="url(#lampGlow)"/>`);
left.push(`<circle cx="${LP + 8}" cy="52" r="6.5" fill="${CORAL}" stroke="#8d3a2b" stroke-width="1.2"/>`);
left.push(`<circle cx="${LP + 6.2}" cy="50" r="2" fill="#ffe2d8" opacity=".85"/>`);
left.push(legend('DAYTIME', LP + 24, 46.5, 11, { weight: 1.5 }));
left.push(legend('CASTAWAY', LP, 92, 26, { weight: 3.2 }));
left.push(legend('A TEN-HOUR LO-FI', LP, 134, CAP));
left.push(legend('ISLAND VIDEO.', LP, 134 + LINE, CAP));
left.push(rule(LP, 184));
['SHE IDLES.', 'EVERY SO OFTEN', 'SOMETHING', 'HAPPENS.'].forEach((t, i) => left.push(legend(t, LP, 202 + i * LINE, CAP)));
left.push(rule(LP, 292));
['90+ ACTIVITIES', 'ON FOUR TIMERS,', 'EACH ON THE BAR.'].forEach((t, i) => left.push(legend(t, LP, 310 + i * LINE, CAP)));
// rating plate
left.push(`<rect x="${LP}" y="392" width="176" height="86" rx="5" fill="none" stroke="${INK}" stroke-width="1.3"/>`);
left.push(`<rect x="${LP}" y="392" width="176" height="20" rx="5" fill="${INK}"/><rect x="${LP}" y="404" width="176" height="8" fill="${INK}"/>`);
left.push(legend('THE DEFAULT RUN', LP + 10, 397.5, 9.5, { color: '#e2ddd2', weight: 1.3 }));
['10:00:00 LONG', 'SEED 1992', '1080P · 30 FPS'].forEach((t, i) => left.push(legend(t, LP + 10, 420 + i * 18, 10)));

// right side: sound, speaker, the buttons, how to start
const right = [];
const RP = 822;
right.push(legend('SOUND', RP, 46.5, 11, { weight: 1.5, color: CORAL }));
['EVERY SOUND IS', 'SYNTHESIZED', 'FROM CODE.', '0 SAMPLES.'].forEach((t, i) => right.push(legend(t, RP, 72 + i * LINE, CAP)));
// speaker: holes in a hexagonal cluster
{
  const cx = 908, cy = 232, pitch = 11.5;
  let holes = '';
  for (let r = -5; r <= 5; r++) for (let q = -6; q <= 6; q++) {
    const x = cx + (q + r / 2) * pitch, y = cy + r * pitch * 0.866;
    if (Math.hypot(x - cx, y - cy) > 4.3 * pitch) continue;
    holes += `<circle cx="${+x.toFixed(2)}" cy="${+y.toFixed(2)}" r="3.3"/>`;
  }
  right.push(`<g fill="#fff" opacity=".5" transform="translate(0 1.3)">${holes}</g>`);
  right.push(`<g fill="#3d3a34">${holes}</g>`);
}
// two pills: WAIT and START
for (const [i, lab] of ['WAIT', 'START'].entries()) {
  const x = RP + 8 + i * 92, y = 316;
  right.push(`<rect x="${x}" y="${y + 1.5}" width="62" height="17" rx="8.5" fill="#000" opacity=".18"/>`);
  // WAIT is the worn one: rubbed paler and shinier from use
  const worn = lab === 'WAIT';
  right.push(`<rect x="${x}" y="${y}" width="62" height="17" rx="8.5" fill="${worn ? '#8b8790' : '#6d6972'}"/><rect x="${x + 3}" y="${y + 2}" width="56" height="6" rx="3" fill="#fff" opacity="${worn ? '.38' : '.2'}"/>`);
  if (worn) right.push(`<ellipse cx="${x + 31}" cy="${y + 9.5}" rx="15" ry="4" fill="#fff" opacity=".16"/>`);
  right.push(legend(lab, x + 31, y + 27, 10, { anchor: 'middle', weight: 1.4 }));
}
right.push(legend('PRESS START:', RP, 378, 11, { color: CORAL, weight: 1.5 }));
right.push(`<rect x="${RP - 6}" y="398" width="192" height="26" rx="3" fill="#f6f3ec" stroke="#b8b1a2" stroke-width="1"/>`);
right.push(legend('python tools/serve.py', RP + 90, 405.5, 9, { anchor: 'middle', weight: 1.3 }));
right.push(legend('THEN OPEN', RP, 438, CAP));
right.push(legend('127.0.0.1:8765', RP, 438 + LINE, CAP));

// under the screen, on the lens
const lensLegend = legend('FOURSHADE  ·  160 × 144  ·  FOUR SHADES OF DAYLIGHT', W / 2, 494, 9.5, { color: '#a6a9b3', anchor: 'middle', weight: 1.2 });

// ------------------------------------------------------------------ assemble
const REST = 6;   // the frame reduced motion stops on: the title card, PRESS START lit
const reduce = `@media (prefers-reduced-motion:reduce){*{animation-delay:-${REST}s!important;animation-play-state:paused!important}}`;
const shadeCss = SHADE.map((c, i) => `.s${i}{fill:${c}}`).join('');
const baseCss = `.boot,.demo{opacity:0}.title,.world{opacity:1}`;
const paused = AT !== null ? `*{animation-play-state:paused!important}` : '';

const defs = `<defs>
<linearGradient id="plastic" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e2ddd2"/><stop offset=".55" stop-color="#d6d0c3"/><stop offset="1" stop-color="#c7c0b1"/></linearGradient>
<linearGradient id="lens" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a4d5a"/><stop offset="1" stop-color="#33353f"/></linearGradient>
<radialGradient id="lampGlow"><stop offset="0" stop-color="${CORAL}" stop-opacity=".55"/><stop offset="1" stop-color="${CORAL}" stop-opacity="0"/></radialGradient>
<linearGradient id="glare" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".10"/><stop offset=".45" stop-color="#fff" stop-opacity=".03"/><stop offset=".46" stop-color="#fff" stop-opacity="0"/></linearGradient>
<linearGradient id="inshadeT" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b160d" stop-opacity=".35"/><stop offset="1" stop-color="#0b160d" stop-opacity="0"/></linearGradient>
<linearGradient id="inshadeL" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#0b160d" stop-opacity=".25"/><stop offset="1" stop-color="#0b160d" stop-opacity="0"/></linearGradient>
<pattern id="grid" width="1" height="1" patternUnits="userSpaceOnUse"><path d="M0.86 0h0.14v1h-0.14zM0 0.86h0.86v0.14h-0.86z" fill="${SHADE[0]}" opacity=".55"/></pattern>
${[...tileGlyphs].map(([ch, id]) => tileDef(ch, id)).join('')}
${Object.entries(frames).map(([k, b]) => emit(b, '', ` id="h${k}"`)).join('\n')}
<clipPath id="lcd"><rect width="${SW}" height="${SH}"/></clipPath>
${[...usedGlyphs].map(([ch, id]) => `<path id="${id}" d="${GL[ch]}"/>`).join('\n')}
</defs>`;

const lcd = `<g transform="translate(${LX} ${LY}) scale(${PX})" shape-rendering="crispEdges"><g clip-path="url(#lcd)">`
  + `<rect class="s0" width="${SW}" height="${SH}"/>`
  + layers.join('\n')
  + `<rect width="${SW}" height="${SH}" fill="url(#grid)"/>`
  + `</g>`
  + `<rect width="${SW}" height="4" fill="url(#inshadeT)"/><rect width="3" height="${SH}" fill="url(#inshadeL)"/>`
  + `</g>`;

const title_ = 'CASTAWAY: a handheld powers on';
const desc = 'An invented late-1980s style handheld by the invented maker FOURSHADE: a wide pale-grey slab with a dark lens around a small green LCD in four shades. '
  + 'The screen powers on and the word CASTAWAY scrolls down from the top edge with a faint ghost trail, stops in the middle and holds, then cuts to a title card: '
  + 'CASTAWAY in outlined tile letters over a tiny island with one tall palm, a raft and a young woman in cream headphones nodding to the beat, PRESS START blinking, and python tools/serve.py. '
  + 'Then the attract mode plays itself, one text-box page per bar: She is on a very small island. She nods to the music. Nothing happens. It is going very well. '
  + 'She could leave any time. So she does (she walks out over the water and off the screen). The island waits. She is back. She has a coffee. It is iced. Next one like it: in 3 to 6 hours. '
  + 'Printed on the bezel: a lamp labelled DAYTIME, always lit; a ten-hour lo-fi island video; she idles, every so often something happens; 90+ activities on four timers, each on the bar; '
  + 'the default run, 10:00:00, seed 1992, 1080p at 30 fps; every sound is synthesized from code, 0 samples; buttons labelled WAIT and START; press start: python tools/serve.py, then open 127.0.0.1:8765.';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W * ZOOM}" height="${H * ZOOM}" role="img" aria-labelledby="t d">
<title id="t">${title_}</title>
<desc id="d">${desc}</desc>
<style>${shadeCss}${baseCss}${css.join('')}${paused}${reduce}</style>
${defs}
${bezel.join('\n')}
${lcd}
<rect x="${LENS.x}" y="${LENS.y}" width="${LENS.w}" height="${LENS.h}" rx="18" fill="url(#glare)" pointer-events="none"/>
${lensLegend}
<g fill="none" stroke-linecap="round" stroke-linejoin="round">${left.join('\n')}
${right.join('\n')}</g>
</svg>
`;

// legends use glyph ids registered while building the strings above; defs were built after them
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, svg);
console.log(`wrote ${path.relative(process.cwd(), OUT)} (${(Buffer.byteLength(svg) / 1024).toFixed(1)} KB)`);
