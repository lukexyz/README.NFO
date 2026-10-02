#!/usr/bin/env node
// Monochrome phone LCD: README header generator for CASTAWAY.
//
//   node examples/castaway/src/74-mono-phone-lcd_opus_5.5.mjs
//
// Writes examples/castaway/assets/74-mono-phone-lcd_opus_5.5.svg.
// Plain Node, no dependencies, no clock, no Math.random: the same bytes every run.
//   --out <file>     write the SVG somewhere else (for iterating)
//   --freeze <sec>   freeze every animation at that moment of the loop (for stills)
//   --ascii <sec>    print the 84 x 48 screen at that moment as text, and exit
//
// Style: the turn-of-the-century two-tone phone screen (catalogue entry mach-13):
// 84 x 48 square pixels, dark on a pale green backlight, a 72 x 14 "operator
// logo" in the middle of the idle screen, bar stacks for signal and battery at
// the edges, a soft-key label centred on the bottom row, 72 x 28 picture
// messages, and a snake made of square cells. Nothing here is copied from a real
// handset: the phone body (the invented DRIFTCELL), its keys, its fonts, the
// logo and every picture are drawn from scratch below.
//
// The picture is her phone, lying face up on the sand of the island, with the
// screen running a 63-second loop (21 bars of 3 s at 80 BPM, so every page cuts
// on a bar line, the way the project's gags start on the bar):
//
//    0  IDLE      CASTAWAY / No network / Menu. Signal: none. Battery: full.
//    6  NOTIFY    1 message received (an envelope, floating)
//    9  BOTTLE    the bottle drifts straight back to her: From: you. Again.
//   15  DRONE     Special delivery: a drone lowers a parcel; it is more headphones
//   21  SIGNAL    she climbs the palm; at the top one signal bar blinks on: Nutwork
//   27  SHARK     a fin in headphones crosses, nodding on every beat
//   33  TONES     all synthesized; 80 BPM, F major; a level meter on the beat
//   39  10 HOURS  typical events per 10-hour run as bar stacks (median counts)
//   45  CALL      python tools/serve.py, Calling... 127.0.0.1:8765
//   51  REBUILD   a snake crawls in and laps the logo as it wipes on, the
//                 signal stack searches 1-2-3-4 and drops to nothing, and
//                 "No network" types itself out: back to the idle screen.
//
// How it is drawn: every screen state is authored on an 84 x 48 bitmap and
// emitted as merged rects (one <path> per bitmap) inside a group scaled by the
// pixel pitch. That group is shown through a <mask> whose tiled pattern leaves
// a hairline between pixels, and a faint offset copy of it is the LCD's shadow.
// Frames of one page share their common pixels (showSeq), which keeps it small.
// Each bitmap is shown and hidden by a step-end opacity animation; the snake is
// one stroked path whose dash offset advances in steps(). The phone and the
// sand around it are flat vector shapes: a palm-frond shadow sways, the shore
// washes in and out at the top right, a cloud shadow drifts across, and a
// hermit crab wearing a coconut walks up the beach in stepped hops.
// prefers-reduced-motion stops everything on the complete idle screen.
//
// Facts on screen, from D:/python/castaway on 2026-10-01: a typical 10-hour run
// (median of 200 simulated runs, as activities.toml states) has about 155
// regular, 30 occasional, 13 rare and 2 super-rare events; the theme is 80 BPM
// in F major; every sound is synthesized by tools/make_audio.py; python
// tools/serve.py serves http://127.0.0.1:8765/ (re-checked 2026-10-02).
// "Signal: one bar, at the top of the palm" is the project's own gag; the network
// name "Nutwork" and the phone "DRIFTCELL" are invented for this header.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '74-mono-phone-lcd_opus_5.5';
const OUT = path.resolve(HERE, `../assets/${SLUG}.svg`);
const argAt = (f) => (process.argv.includes(f) ? process.argv[process.argv.indexOf(f) + 1] : null);
const DEBUG_OUT = argAt('--out');
const FREEZE = argAt('--freeze');
const ASCII = argAt('--ascii');

// ------------------------------------------------------------------ timing
const LOOP = 63, BEAT = 0.75, BAR = 3;          // 21 bars of 3 s at 80 BPM

// ------------------------------------------------------------------ geometry
const SW = 84, SH = 48, P = 5;                  // the screen, and the pixel pitch in SVG units
const W = 830, H = 472;                          // viewBox: 1 unit = 1 px in GitHub's README column
const PHX = 135, PHW = 560, PHY = 28;            // phone body
const CX = PHX + PHW / 2;                        // 415
const LENS = { x: CX - 240, y: 100, w: 480, h: 300 };
const GLASS = { x: LENS.x + 18, y: LENS.y + 18, w: LENS.w - 36, h: LENS.h - 36 };
const LX = CX - (SW * P) / 2, LY = GLASS.y + 12;  // top-left of the pixel area

// ------------------------------------------------------------------ palette
const LCD_BG = '#C7F0D8';   // community palette for this kind of screen (Lospec)
const LCD_PX = '#43523D';
const SAND = '#EAD8AE';

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

// ------------------------------------------------------------------ fonts
// Glyphs are rows joined by '|', '#' lit. Every glyph is padded to the font height.
function makeFont(src, { h, space, gap = 1 }) {
  const g = {};
  for (const [ch, s] of Object.entries(src)) {
    const rows = s.split('|');
    const w = rows[0].length;
    if (rows.some((r) => r.length !== w)) throw new Error(`ragged glyph ${ch}`);
    while (rows.length < h) rows.push('.'.repeat(w));
    g[ch] = rows;
  }
  return { g, h, space, gap };
}

// The menu face: proportional, caps 7 rows, x-height 5, descenders 2.
const MENU = makeFont({
  A: '.##.|#..#|#..#|####|#..#|#..#|#..#', B: '###.|#..#|#..#|###.|#..#|#..#|###.',
  C: '.##.|#..#|#...|#...|#...|#..#|.##.', D: '###.|#..#|#..#|#..#|#..#|#..#|###.',
  E: '####|#...|#...|###.|#...|#...|####', F: '####|#...|#...|###.|#...|#...|#...',
  G: '.##.|#..#|#...|#.##|#..#|#..#|.###', H: '#..#|#..#|#..#|####|#..#|#..#|#..#',
  I: '###|.#.|.#.|.#.|.#.|.#.|###', J: '..##|...#|...#|...#|#..#|#..#|.##.',
  K: '#..#|#..#|#.#.|##..|#.#.|#..#|#..#', L: '#...|#...|#...|#...|#...|#...|####',
  M: '#...#|##.##|#.#.#|#.#.#|#...#|#...#|#...#', N: '#..#|##.#|##.#|#.##|#.##|#..#|#..#',
  O: '.##.|#..#|#..#|#..#|#..#|#..#|.##.', P: '###.|#..#|#..#|###.|#...|#...|#...',
  Q: '.##.|#..#|#..#|#..#|#..#|#.#.|.#.#', R: '###.|#..#|#..#|###.|#.#.|#..#|#..#',
  S: '.##.|#..#|#...|.##.|...#|#..#|.##.', T: '#####|..#..|..#..|..#..|..#..|..#..|..#..',
  U: '#..#|#..#|#..#|#..#|#..#|#..#|.##.', V: '#...#|#...#|#...#|#...#|.#.#.|.#.#.|..#..',
  W: '#...#|#...#|#...#|#.#.#|#.#.#|##.##|#...#', X: '#...#|#...#|.#.#.|..#..|.#.#.|#...#|#...#',
  Y: '#...#|#...#|.#.#.|..#..|..#..|..#..|..#..', Z: '####|...#|..#.|..#.|.#..|#...|####',
  a: '....|....|.##.|...#|.###|#..#|.###', b: '#...|#...|###.|#..#|#..#|#..#|###.',
  c: '...|...|.##|#..|#..|#..|.##', d: '...#|...#|.###|#..#|#..#|#..#|.###',
  e: '....|....|.##.|#..#|####|#...|.##.', f: '..#|.#.|###|.#.|.#.|.#.|.#.',
  g: '....|....|.###|#..#|#..#|#..#|.###|...#|.##.', h: '#...|#...|###.|#..#|#..#|#..#|#..#',
  i: '#|.|#|#|#|#|#', j: '.#|..|.#|.#|.#|.#|.#|.#|#.',
  k: '#...|#...|#..#|#.#.|##..|#.#.|#..#', l: '#|#|#|#|#|#|#',
  m: '.....|.....|####.|#.#.#|#.#.#|#.#.#|#.#.#', n: '....|....|###.|#..#|#..#|#..#|#..#',
  o: '....|....|.##.|#..#|#..#|#..#|.##.', p: '....|....|###.|#..#|#..#|#..#|###.|#...|#...',
  q: '....|....|.###|#..#|#..#|#..#|.###|...#|...#', r: '...|...|#.#|##.|#..|#..|#..',
  s: '....|....|.###|#...|.##.|...#|###.', t: '.#.|.#.|###|.#.|.#.|.#.|..#',
  u: '....|....|#..#|#..#|#..#|#..#|.###', v: '.....|.....|#...#|#...#|.#.#.|.#.#.|..#..',
  w: '.....|.....|#...#|#...#|#.#.#|#.#.#|.#.#.', x: '....|....|#..#|#..#|.##.|#..#|#..#',
  y: '....|....|#..#|#..#|#..#|#..#|.###|...#|.##.', z: '....|....|####|...#|.##.|#...|####',
  0: '.##.|#..#|#..#|#..#|#..#|#..#|.##.', 1: '.#.|##.|.#.|.#.|.#.|.#.|###',
  2: '.##.|#..#|...#|..#.|.#..|#...|####', 3: '###.|...#|...#|.##.|...#|...#|###.',
  4: '..#.|.##.|#.#.|#.#.|####|..#.|..#.', 5: '####|#...|###.|...#|...#|#..#|.##.',
  6: '.##.|#...|#...|###.|#..#|#..#|.##.', 7: '####|...#|..#.|..#.|.#..|.#..|.#..',
  8: '.##.|#..#|#..#|.##.|#..#|#..#|.##.', 9: '.##.|#..#|#..#|.###|...#|...#|.##.',
  '.': '.|.|.|.|.|.|#', ',': '.|.|.|.|.|.|#|#', ':': '.|.|#|.|.|.|#', '!': '#|#|#|#|#|.|#',
  '?': '.##.|#..#|...#|..#.|.#..|....|.#..', '-': '...|...|...|###|...|...|...',
  '/': '..#|..#|.#.|.#.|.#.|#..|#..', "'": '#|#|.|.|.|.|.', '(': '.#|#.|#.|#.|#.|#.|.#',
  ')': '#.|.#|.#|.#|.#|.#|#.', '+': '...|...|.#.|###|.#.|...|...', '_': '....|....|....|....|....|....|####',
}, { h: 9, space: 3 });

// The status face: 3 x 5 capitals (M, N, W are wider).
const TINY = makeFont({
  A: '.#.|#.#|###|#.#|#.#', B: '##.|#.#|##.|#.#|##.', C: '.##|#..|#..|#..|.##', D: '##.|#.#|#.#|#.#|##.',
  E: '###|#..|##.|#..|###', F: '###|#..|##.|#..|#..', G: '.##|#..|#.#|#.#|.##', H: '#.#|#.#|###|#.#|#.#',
  I: '###|.#.|.#.|.#.|###', J: '..#|..#|..#|#.#|.#.', K: '#.#|#.#|##.|#.#|#.#', L: '#..|#..|#..|#..|###',
  M: '#...#|##.##|#.#.#|#...#|#...#', N: '#..#|##.#|#.##|#..#|#..#', O: '.#.|#.#|#.#|#.#|.#.',
  P: '##.|#.#|##.|#..|#..', Q: '.#.|#.#|#.#|##.|.##', R: '##.|#.#|##.|#.#|#.#', S: '.##|#..|.#.|..#|##.',
  T: '###|.#.|.#.|.#.|.#.', U: '#.#|#.#|#.#|#.#|###', V: '#.#|#.#|#.#|#.#|.#.', W: '#...#|#...#|#.#.#|##.##|#...#',
  X: '#.#|#.#|.#.|#.#|#.#', Y: '#.#|#.#|.#.|.#.|.#.', Z: '###|..#|.#.|#..|###',
  0: '###|#.#|#.#|#.#|###', 1: '.#.|##.|.#.|.#.|###', 2: '##.|..#|.#.|#..|###', 3: '##.|..#|.#.|..#|##.',
  4: '#.#|#.#|###|..#|..#', 5: '###|#..|##.|..#|##.', 6: '.##|#..|###|#.#|###', 7: '###|..#|.#.|.#.|.#.',
  8: '###|#.#|###|#.#|###', 9: '###|#.#|###|..#|##.',
  '.': '.|.|.|.|#', ',': '..|..|..|.#|#.', ':': '.|#|.|#|.', '-': '...|...|###|...|...', '/': '..#|..#|.#.|#..|#..',
  '!': '#|#|#|.|#', '+': '...|.#.|###|.#.|...', '=': '...|###|...|###|...',
}, { h: 5, space: 2 });

// The operator logo face: 8 x 14 bold capitals, only the letters the name needs.
const LOGO = makeFont({
  C: [
    '..######', '.#######', '###.....', '##......', '##......', '##......', '##......',
    '##......', '##......', '##......', '##......', '###.....', '.#######', '..######'].join('|'),
  A: [
    '..####..', '.######.', '###..###', '##....##', '##....##', '##....##', '##....##',
    '########', '########', '##....##', '##....##', '##....##', '##....##', '##....##'].join('|'),
  S: [
    '..######', '.#######', '###.....', '##......', '##......', '###.....', '.######.',
    '.######.', '.....###', '......##', '......##', '.....###', '#######.', '######..'].join('|'),
  T: [
    '########', '########', '...##...', '...##...', '...##...', '...##...', '...##...',
    '...##...', '...##...', '...##...', '...##...', '...##...', '...##...', '...##...'].join('|'),
  W: [
    '##....##', '##....##', '##....##', '##....##', '##....##', '##....##', '##.##.##',
    '##.##.##', '##.##.##', '##.##.##', '##.##.##', '########', '.##..##.', '.##..##.'].join('|'),
  Y: [
    '##....##', '##....##', '##....##', '##....##', '###..###', '.######.', '..####..',
    '...##...', '...##...', '...##...', '...##...', '...##...', '...##...', '...##...'].join('|'),
}, { h: 14, space: 4 });

function textWidth(font, str) {
  let w = 0;
  for (const ch of str) w += (ch === ' ' ? font.space : font.g[ch][0].length) + font.gap;
  return w - font.gap;
}

// ------------------------------------------------------------------ bitmaps
class Bmp {
  constructor() { this.a = new Uint8Array(SW * SH); }
  px(x, y, v = 1) {
    x = Math.round(x); y = Math.round(y);
    if (x >= 0 && y >= 0 && x < SW && y < SH) this.a[y * SW + x] = v;
    return this;
  }
  rect(x, y, w, h, v = 1) { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.px(x + i, y + j, v); return this; }
  // rows: array of strings. '#' lit, 'o' forced unlit, anything else transparent.
  sprite(rows, x, y, { flip = false, inv = false } = {}) {
    rows.forEach((r, j) => {
      const s = flip ? [...r].reverse().join('') : r;
      [...s].forEach((c, i) => {
        if (c === '#') this.px(x + i, y + j, inv ? 0 : 1);
        else if (c === 'o') this.px(x + i, y + j, inv ? 1 : 0);
      });
    });
    return this;
  }
  text(font, str, x, y, v = 1) {
    let cx = x;
    for (const ch of str) {
      if (ch === ' ') { cx += font.space + font.gap; continue; }
      const gl = font.g[ch];
      if (!gl) throw new Error(`no glyph ${JSON.stringify(ch)}`);
      gl.forEach((r, j) => [...r].forEach((c, i) => { if (c === '#') this.px(cx + i, y + j, v); }));
      cx += gl[0].length + font.gap;
    }
    return cx;
  }
  center(font, str, y, v = 1) { return this.text(font, str, Math.floor((SW - textWidth(font, str)) / 2), y, v); }
  or(b) { for (let i = 0; i < this.a.length; i++) this.a[i] |= b.a[i]; return this; }
  // filled polygon, sampled at pixel centres
  poly(pts, v = 1) {
    const ys = pts.map((p) => p[1]), xs = pts.map((p) => p[0]);
    for (let y = Math.floor(Math.min(...ys)); y <= Math.ceil(Math.max(...ys)); y++) {
      for (let x = Math.floor(Math.min(...xs)); x <= Math.ceil(Math.max(...xs)); x++) {
        const px = x + 0.5, py = y + 0.5;
        let inside = false;
        for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
          const [xi, yi] = pts[i], [xj, yj] = pts[j];
          if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside;
        }
        if (inside) this.px(x, y, v);
      }
    }
    return this;
  }
  // a 1-pixel line (Bresenham)
  line(x0, y0, x1, y1, v = 1) {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let e = dx + dy;
    for (;;) {
      this.px(x0, y0, v);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * e;
      if (e2 >= dy) { e += dy; x0 += sx; }
      if (e2 <= dx) { e += dx; y0 += sy; }
    }
    return this;
  }
  // a quadratic curve as connected pixels
  curve(p0, c, p1, v = 1) {
    let prev = p0;
    for (let i = 1; i <= 24; i++) {
      const t = i / 24, u = 1 - t;
      const q = [u * u * p0[0] + 2 * u * t * c[0] + t * t * p1[0], u * u * p0[1] + 2 * u * t * c[1] + t * t * p1[1]];
      this.line(prev[0], prev[1], q[0], q[1], v);
      prev = q;
    }
    return this;
  }
  // a ring of radius r around (cx, cy)
  ring(cx, cy, r, v = 1) {
    for (let y = -r - 1; y <= r + 1; y++) for (let x = -r - 1; x <= r + 1; x++) {
      const d = Math.hypot(x, y);
      if (d > r - 0.5 && d <= r + 0.5) this.px(cx + x, cy + y, v);
    }
    return this;
  }
  get key() { return Buffer.from(this.a).toString('base64'); }
  get empty() { return !this.a.some((v) => v); }
  clone() { const b = new Bmp(); b.a.set(this.a); return b; }
}
const spr = (s) => s.split('\n').map((r) => r.trim()).filter((r) => r.length);

// ------------------------------------------------------------------ timeline
// Every visible thing is a bitmap with a set of [t0, t1) intervals in the loop.
const items = new Map();
function show(b, t0, t1) {
  if (b.empty || t1 <= t0) return;
  const k = b.key;
  if (!items.has(k)) items.set(k, { b, iv: [] });
  items.get(k).iv.push([t0, t1]);
}
// a run of back-to-back frames: the pixels every frame shares are drawn once for
// the whole run, and each frame only adds what is its own (smaller file, same picture)
function showSeq(frames) {
  const common = new Bmp(); common.a.fill(1);
  for (const [b] of frames) for (let i = 0; i < common.a.length; i++) common.a[i] &= b.a[i];
  const tA = Math.min(...frames.map((f) => f[1])), tB = Math.max(...frames.map((f) => f[2]));
  show(common, tA, tB);
  for (const [b, t0, t1] of frames) {
    const r = b.clone();
    for (let i = 0; i < r.a.length; i++) if (common.a[i]) r.a[i] = 0;
    show(r, t0, t1);
  }
}
// one glyph at a time: returns the time the last glyph appears
function typeOut(font, str, x, y, t0, dt, t1, v = 1) {
  let cx = x, t = t0;
  for (const ch of str) {
    if (ch === ' ') { cx += font.space + font.gap; continue; }
    const b = new Bmp();
    cx = b.text(font, ch, cx, y, v);
    show(b, t, t1);
    t += dt;
  }
  return t - dt;
}
const B = (n) => n * BEAT;

// ------------------------------------------------------------------ sprites
const ANTENNA = spr(`
  #.#.#
  #.#.#
  .###.
  ..#..
  ..#..
  ..#..
  ..#..`);
const BATTERY = spr(`
  .###.
  #####
  #...#
  #...#
  #...#
  #...#
  #####`);
const ENVELOPE = spr(`
  ###############
  ##ooooooooooo##
  #o#ooooooooo#o#
  #oo#ooooooo#oo#
  #ooo#ooooo#ooo#
  #oooo#ooo#oooo#
  #ooooo#o#ooooo#
  #oooooo#oooooo#
  #ooooooooooooo#
  ###############`);
const BOTTLE = spr(`
  ..#######....
  .#ooooooo###.
  #oo####oo####
  #oooooooo####
  .#ooooooo###.
  ..#######....`);
// her, side on, facing right: hair in a low bun, face, tank top, shorts, bare feet
const HER = spr(`
  ..####..
  .######.
  .###ooo#
  .##oooo#
  ####ooo#
  ##.#oo#.
  ...###..
  ..#####.
  .#######
  .#.###.#
  .#.###.#
  ..#ooo#.
  ..#o#o#.
  ..#.#.#.
  ..#...#.
  .##..##.`);
// climbing, hugging the trunk on her right: two poses
const CLIMB = [spr(`
  ..####...
  .######..
  .###ooo#.
  .##oooo##
  ####ooo#.
  ##.#oo###
  ...####.#
  ..#####..
  ..#######
  ..#####..
  ..#ooo#..
  ..#oooo##
  ..##..###
  ...#...#.
  ..##...##`), spr(`
  ..####..#
  .######.#
  .###ooo##
  .##oooo#.
  ####ooo#.
  ##.#oo#..
  ...####..
  ..#######
  ..#####..
  ..#####..
  ..#ooo#..
  ..#ooo#..
  ..#o#o#..
  ..#.#.##.
  .##..#.##`)];
const DRONE = [spr(`
  #####.....#####
  ..#.........#..
  ..###########..
  .....#####.....
  .....#...#.....`), spr(`
  .###.......###.
  ..#.........#..
  ..###########..
  .....#####.....
  .....#...#.....`)];
const PARCEL = spr(`
  #######
  #oo#oo#
  #######
  #oo#oo#
  #oo#oo#
  #######`);
const PARCEL_OPEN = spr(`
  ##.....##
  .#.....#.
  .#######.
  .#oo#oo#.
  .#oo#oo#.
  .#######.`);
const PHONES = spr(`
  ...#####...
  .##.....##.
  #.........#
  #.........#
  #.........#
  ###.....###
  ###.....###
  ###.....###`);
const NOTE = spr(`
  ..##.
  ..#.#
  ..#..
  .##..
  ###..
  .#...`);
// a shark fin in headphones: upright, and nodding forward (to the left)
const FIN = [spr(`
  ...#####....
  ..#.....#...
  .#...#...#..
  .#..##...#..
  ###.##..###.
  ###.###.###.
  ###.####.##.
  ....#####...
  ...#######..
  ..#########.`), spr(`
  ..#####.....
  .#.....#....
  #..##...#...
  #.###...#...
  ####...###..
  #####..###..
  ######.###..
  .######.....
  .########...
  ..#########.`)];
const HANDSET = spr(`
  ##.....
  ###....
  .##....
  .##....
  ..##.##
  ...####
  ....##.`);
const QMARK = spr(`
  .##.
  #..#
  ..#.
  .#..
  ....
  .#..`);

// ------------------------------------------------------------------ screen furniture
function statusLeft(b, bars) {
  b.sprite(ANTENNA, 0, 0);
  for (let i = 0; i < bars; i++) b.rect(0, 21 - i * 4, 2 + i, 3);
  return b;
}
function statusRight(b, bars) {
  b.sprite(BATTERY, 79, 0);
  for (let i = 0; i < bars; i++) b.rect(84 - (2 + i), 21 - i * 4, 2 + i, 3);
  return b;
}

const LOGO_X = 6, LOGO_Y = 11;
function logo(b, upto = 8) {
  const word = 'CASTAWAY';
  let x = LOGO_X;
  for (let i = 0; i < word.length; i++) {
    if (i < upto) b.text(LOGO, word[i], x, LOGO_Y);
    x += 9;
  }
  return b;
}
// a stretch of sea: wave marks in two phases
function waves(b, x0, x1, y, phase, gapEvery = 8) {
  for (let x = x0; x < x1; x++) {
    const m = ((x + phase * 4) % gapEvery + gapEvery) % gapEvery;
    if (m === 0 || m === 1) b.px(x, y + 1);
    if (m === 2 || m === 3) b.px(x, y);
  }
  return b;
}
function inverseHeader(b, label, h = 10) {
  b.rect(0, 0, SW, h);   // h = 11 leaves room under a descender
  b.center(MENU, label, 1, 0);
  return b;
}

// ------------------------------------------------------------------ the pages
// IDLE: the screen everything returns to.
function idleBmp() {
  const b = new Bmp();
  statusLeft(b, 0); statusRight(b, 4); logo(b);
  b.center(MENU, 'No network', 28);
  b.center(MENU, 'Menu', 40);
  return b;
}
const IDLE = idleBmp();
const T_IDLE_DONE = 61.5;
show(IDLE, 0, 6);
show(IDLE, T_IDLE_DONE, LOOP);

// NOTIFY [6, 9): 1 message received, the envelope bobbing on a wave
{
  const t0 = 6, t1 = 9;
  const txt = new Bmp(); txt.center(MENU, '1 message', 19); txt.center(MENU, 'received', 28); txt.center(MENU, 'Read', 40);
  show(txt, t0, t1);
  for (let k = 0; k < 4; k++) {
    const b = new Bmp();
    const dy = k % 2;
    b.sprite(ENVELOPE, 35, 2 + dy);
    waves(b, 22, 62, 14, k, 6);
    show(b, t0 + B(k), t0 + B(k + 1));
  }
}

// BOTTLE [9, 15): she waits on the beach; the bottle floats straight back to her
{
  const t0 = 9, t1 = 15;
  const OX = 6;                                      // picture origin
  const base = new Bmp();
  // the beach: a low mound at the left of the picture
  for (let x = 0; x < 26; x++) {
    const top = 22 + Math.round(Math.max(0, (x - 14)) * 0.35);
    base.px(OX + x, top);
    if (x % 3 === 0) base.px(OX + x, top + 3);
  }
  base.rect(OX, 27, 72, 1);
  base.sprite(HER, OX + 6, 7);
  // horizon and the sun
  for (let x = 30; x < 72; x += 2) base.px(OX + x, 9);
  base.ring(OX + 62, 4, 2);
  for (const [dx, dy] of [[-4, 0], [4, 0], [0, -4], [-3, -3], [3, -3]]) base.px(OX + 62 + dx, 4 + dy);
  base.rect(OX + 57, 9, 11, 1, 0);
  base.text(MENU, 'From: you. Again.', 2, 30);
  base.center(MENU, 'Send', 40);
  show(base, t0, t1);
  const xs = [62, 56, 50, 44, 38, 33, 29, 26];
  for (let k = 0; k < 8; k++) {
    const b = new Bmp();
    waves(b, OX + 27, OX + 72, 17, k, 7);
    waves(b, OX + 31, OX + 72, 22, k + 2, 9);
    const bob = k % 2;
    b.sprite(BOTTLE, OX + xs[k], 13 + bob + (k === 7 ? 3 : 0));
    if (k === 7) b.sprite(QMARK, OX + 8, 0);
    show(b, t0 + B(k), t0 + B(k + 1));
  }
}

// DRONE [15, 21): a parcel arrives by air; it is more headphones
{
  const t0 = 15, t1 = 21, OX = 6;
  const base = new Bmp();
  for (let x = 0; x < 72; x++) { base.px(OX + x, 25); if (x % 4 === 1) base.px(OX + x, 27); }
  const cloud = spr(`
    ....####.....
    ..##....##...
    .#........##.
    #...........#
    #############`);
  base.sprite(cloud, OX + 2, 3); base.sprite(cloud, OX + 52, 10);
  show(base, t0, t1);
  // the caption keeps the surprise until the box is open
  const capA = new Bmp(); capA.center(MENU, 'Special delivery', 30); capA.center(MENU, 'Thanks', 40);
  show(capA, t0, t0 + B(6));
  const capB = new Bmp(); capB.center(MENU, 'More headphones.', 30); capB.center(MENU, 'Wear', 40);
  show(capB, t0 + B(6), t1);
  const plan = [
    { dx: 58, dy: 1 }, { dx: 44, dy: 2 }, { dx: 30, dy: 2 },
    { dx: 30, dy: 2, rope: 12 }, { dx: 30, dy: 1, rope: 19, drop: true },
    { dx: 46, dy: -3, landed: true }, { open: true }, { open: true, notes: true },
  ];
  plan.forEach((s, k) => {
    const b = new Bmp();
    if (s.dx !== undefined) b.sprite(DRONE[k % 2], OX + s.dx, s.dy);
    if (s.rope) {
      for (let y = s.dy + 5; y < s.dy + 5 + s.rope - 6; y++) b.px(OX + s.dx + 7, y);
      b.sprite(PARCEL, OX + s.dx + 4, s.dy + 5 + s.rope - 6);
    }
    if (s.landed) b.sprite(PARCEL, OX + 34, 19);
    if (s.open) {
      b.sprite(PARCEL_OPEN, OX + 33, 19);
      b.sprite(PHONES, OX + 32, 9 - (s.notes ? 1 : 0));
      if (s.notes) { b.sprite(NOTE, OX + 22, 6); b.sprite(NOTE, OX + 46, 3); }
    }
    show(b, t0 + B(k), t0 + B(k + 1));
  });
}

// SIGNAL [21, 27): she climbs the palm; one bar, at the top
{
  const t0 = 21, t1 = 27;
  const base = new Bmp();
  // the sun, a distant horizon, the island and its palm (the picture fills the screen here)
  base.ring(15, 7, 3);
  for (const [dx, dy] of [[0, -6], [0, 6], [-6, 0], [6, 0], [-4, -4], [4, -4], [-4, 4], [4, 4]]) base.px(15 + dx, 7 + dy);
  for (let x = 6; x < 22; x += 2) base.px(x, 30);
  for (let x = 72; x < 78; x += 2) base.px(x, 30);
  base.curve([22, 37], [48, 29], [76, 37]);
  for (let x = 30; x < 70; x += 4) base.px(x + ((x / 4) % 2), 35);
  base.rect(6, 37, 72, 1);
  const trunkX = (y) => Math.round(58 - (35 - y) * 0.2);
  for (let y = 8; y <= 34; y++) {
    const x = trunkX(y);
    base.rect(x - 1, y, 3, 1);
    if (y % 3 === 0) base.px(x, y, 0);
  }
  const cx = trunkX(8), cy = 7;
  for (const [c, e] of [[[cx - 9, cy - 7], [cx - 19, cy + 4]], [[cx + 9, cy - 7], [cx + 18, cy + 5]],
    [[cx - 5, cy - 9], [cx - 12, cy - 3]], [[cx + 5, cy - 9], [cx + 12, cy - 2]], [[cx + 2, cy + 1], [cx + 9, cy + 8]]]) {
    base.curve([cx, cy], c, e);
    base.curve([cx, cy + 1], [c[0], c[1] + 1], [e[0], e[1] + 1]);
  }
  base.rect(cx - 2, cy + 2, 2, 2); base.rect(cx + 1, cy + 3, 2, 2);
  // her: at the foot of the palm, then up it a few pixels a beat. Drawn with a
  // one-pixel clear halo so she stays separate from the trunk and the fronds.
  const tops = [20, 18, 16, 14, 12, 12, 12, 12];
  const frames = [];
  for (let k = 0; k < 8; k++) {
    const her = new Bmp();
    const y = tops[k];
    const x = trunkX(y + 7) - 10;
    if (k === 0) her.sprite(HER, x - 1, y);
    else her.sprite(CLIMB[k % 2], x, y);
    if (k >= 5) {
      // arm up, phone in hand
      her.line(x + 1, y + 6, x - 2, y + 1);
      her.rect(x - 3, y - 3, 2, 4);
      if (k >= 6) { her.px(x - 6, y - 4); her.px(x - 7, y - 6); her.px(x - 6, y - 8); }
    }
    const sp = k === 0 ? HER : CLIMB[k % 2], sx0 = k === 0 ? x - 1 : x;
    const b = base.clone();
    for (let j = 0; j < SH; j++) for (let i = 0; i < SW; i++) {
      if (!her.a[j * SW + i]) continue;
      for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) b.px(i + di, j + dj, 0);
    }
    b.or(her);
    // the sprite's pale parts (face, shorts) stay clear of anything behind them
    sp.forEach((row, j) => [...row].forEach((c, i) => { if (c === 'o') b.px(sx0 + i, y + j, 0); }));
    statusLeft(b, 0);
    frames.push([b, t0 + B(k), t0 + B(k + 1)]);
  }
  showSeq(frames);
  // the one bar arrives at the top of the palm: it blinks on the half beat, twice, then holds
  const bar1 = new Bmp(); bar1.rect(0, 21, 2, 3);
  const tb = t0 + B(5), hb = BEAT / 2;
  show(bar1, tb, tb + hb); show(bar1, tb + 2 * hb, tb + 3 * hb); show(bar1, tb + 4 * hb, t1);
  // caption: Searching, with a dot per beat, then the network name
  const s0 = new Bmp(); s0.text(MENU, 'Searching', 18, 39); show(s0, t0, t0 + B(5));
  for (let k = 1; k <= 3; k++) { const d = new Bmp(); d.text(MENU, '.', 18 + textWidth(MENU, 'Searching') + 2 * k - 1, 39); show(d, t0 + B(k), t0 + B(5)); }
  const s1 = new Bmp(); s1.center(MENU, 'Nutwork: 1 bar', 39); show(s1, t0 + B(5), t1);
}

// SHARK [27, 33): a fin in headphones, nodding on the beat
function sharkFin(b, x, y, nod) {
  // base from (x, y) to (x + 14, y); the tip leans forward (left) when he nods
  const tip = nod ? [x + 6, y - 12] : [x + 9, y - 13];
  const lead = nod ? [x + 0, y - 9] : [x + 2, y - 10];
  const trail = nod ? [x + 7, y - 2] : [x + 9, y - 2];
  const q = (p0, c, p1, t) => [(1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * c[0] + t * t * p1[0], (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * c[1] + t * t * p1[1]];
  const pts = [];
  for (let i = 0; i <= 12; i++) pts.push(q([x, y + 1], lead, tip, i / 12));
  for (let i = 1; i <= 12; i++) pts.push(q(tip, trail, [x + 15, y + 1], i / 12));
  b.poly(pts);
  // headphones: a band over the tip, a cup either side, each cut free of the fin
  const [hx, hy] = [Math.round(tip[0]), Math.round(tip[1]) + 4];
  for (let a = 0; a <= 180; a += 6) {
    const r = (a * Math.PI) / 180;
    b.px(hx + Math.round(Math.cos(r) * 5.5), hy - Math.round(Math.sin(r) * 5.5));
  }
  for (const sx of [-1, 1]) {
    const cxp = hx + sx * 6 - 1;
    b.rect(cxp - 1, hy - 1, 5, 7, 0);
    b.rect(cxp, hy, 3, 5);
  }
}
{
  const t0 = 27, t1 = 33, OX = 6;
  const cap = new Bmp(); cap.center(MENU, 'Shark. Nodding.', 30); cap.center(MENU, 'Nod', 40);
  show(cap, t0, t1);
  // a distant island with its palm, on the horizon
  const far = new Bmp();
  for (let x = OX; x < OX + 72; x += 2) far.px(x, 11);
  far.curve([OX + 3, 11], [OX + 11, 6], [OX + 19, 11]);
  far.line(OX + 11, 8, OX + 12, 3);
  far.curve([OX + 12, 3], [OX + 8, 1], [OX + 6, 5]); far.curve([OX + 12, 3], [OX + 16, 1], [OX + 18, 5]);
  const frames = [];
  for (let k = 0; k < 8; k++) {
    const b = far.clone();
    const fx = OX + 50 - k * 4, sy = 21;
    b.rect(fx - 2, 0, 20, sy, 0);
    waves(b, OX, OX + 72, sy - 1, k, 6);
    b.rect(fx - 1, sy - 2, 18, 3, 0);
    sharkFin(b, fx, sy, k % 2 === 1);
    b.rect(fx - 2, sy + 1, 20, 1);
    for (let i = 0; i < 3; i++) b.rect(fx + 19 + i * 4, sy + (i % 2), 2, 1);
    waves(b, OX + 4, OX + 70, 25, k + 1, 10);
    if (k % 2 === 0) b.sprite(NOTE, fx + 18, 4 - (k % 4 === 0 ? 0 : 1));
    else b.sprite(NOTE, fx - 7, 3);
    frames.push([b, t0 + B(k), t0 + B(k + 1)]);
  }
  showSeq(frames);
}

// TONES [33, 39): every sound is code; a level meter on the beat
{
  const t0 = 33, t1 = 39;
  const base = new Bmp();
  inverseHeader(base, 'Tones');
  base.center(MENU, 'All synthesized', 12);
  base.center(MENU, '80 BPM, F major', 21);
  base.center(MENU, 'Listen', 40);
  show(base, t0, t1);
  const heights = [];
  for (let k = 0; k < 8; k++) {
    const b = new Bmp();
    for (let i = 0; i < 15; i++) {
      const kick = (k % 4 === 0 && i < 3) ? 2 : 0;
      const h = Math.max(1, Math.min(7, Math.round(2 + rnd() * 4 + kick - Math.abs(i - 7) * 0.15)));
      b.rect(5 + i * 5, 38 - h, 4, h);
      heights.push(h);
    }
    show(b, t0 + B(k), t0 + B(k + 1));
  }
}

// 10 HOURS [39, 45): typical events per run, as bar stacks
{
  const t0 = 39, t1 = 45;
  const base = new Bmp();
  // five lines, as the screen allows: a title bar and the four timers. The counts
  // are the medians of 200 simulated 10-hour runs, from activities.toml's header.
  inverseHeader(base, 'Typical 10 hours', 11);
  const rows = [['REGULAR', 155], ['OCCASIONAL', 30], ['RARE', 13], ['SUPER RARE', 2]];
  const rowY = (i) => 14 + i * 8;
  rows.forEach(([lab, n], i) => {
    const y = rowY(i);
    base.text(TINY, lab, 0, y);
    const s = String(n);
    base.text(TINY, s, 84 - textWidth(TINY, s), y);
  });
  show(base, t0, t1);
  // bars grow, a step per beat
  const BX = 43, BW = 27;
  rows.forEach(([, n], i) => {
    const y = rowY(i);
    const full = Math.max(1, Math.round((n / 155) * BW));
    for (let k = 0; k < 4; k++) {
      const len = Math.max(1, Math.round((full * (k + 1)) / 4));
      const b = new Bmp(); b.rect(BX, y, len, 5);
      show(b, t0 + B(k), k < 3 ? t0 + B(k + 1) : t1);
    }
  });
}

// CALL [45, 51): run it
{
  const t0 = 45, t1 = 51;
  const tA = typeOut(MENU, 'python tools/', 3, 1, t0, 0.1, t1);
  const tB = typeOut(MENU, 'serve.py', 3, 11, tA + 0.1, 0.1, t1);
  const ring = t0 + B(4);
  for (let k = 0; k < 4; k++) {
    const b = new Bmp();
    b.sprite(HANDSET, 3, 22 + (k % 2));
    if (k % 2 === 0) { b.px(11, 22); b.px(12, 21); } else { b.px(11, 25); b.px(12, 26); }
    show(b, ring + B(k), ring + B(k + 1));
  }
  const c = new Bmp(); c.text(MENU, 'Calling...', 15, 22); show(c, ring, t1);
  typeOut(MENU, '127.0.0.1:8765', 3, 31, ring + B(1), 0.06, t1);
  const sk = new Bmp(); sk.center(MENU, 'Open', 40); show(sk, ring, t1);
  // a blinking cursor while typing
  for (let t = t0, i = 0; t < tB + 0.4; t += 0.4, i++) {
    if (i % 2) continue;
    const b = new Bmp(); b.rect(3, 9, 4, 1); show(b, t, Math.min(t + 0.4, tA));
  }
}

// REBUILD [51, 63): snake, logo, signal search, "No network"
const SNAKE = { t0: 51, t1: 57, len: 15, step: 3 };
{
  // the snake's centreline (pixel boundaries): along the top, round the logo, back to the food
  // (the top run is at row 5, well clear of the letters, so the food never reads as an accent)
  SNAKE.pts = [[-16, 5], [81, 5], [81, 29], [3, 29], [3, 5], [17, 5]];
  let L = 0;
  for (let i = 1; i < SNAKE.pts.length; i++) L += Math.abs(SNAKE.pts[i][0] - SNAKE.pts[i - 1][0]) + Math.abs(SNAKE.pts[i][1] - SNAKE.pts[i - 1][1]);
  SNAKE.total = L;
  SNAKE.travel = L - SNAKE.len;
  SNAKE.steps = SNAKE.travel / SNAKE.step;
  if (!Number.isInteger(SNAKE.steps)) throw new Error(`snake travel ${SNAKE.travel} not a multiple of ${SNAKE.step}`);
  const dt = (SNAKE.t1 - SNAKE.t0) / SNAKE.steps;
  // food
  const food = new Bmp(); food.rect(17, 4, 2, 2); show(food, SNAKE.t0, SNAKE.t1 - dt);
  // letters wipe on as the head passes them on the first lap (steps(start): head x = -1 + 3(k+1))
  for (let i = 0; i < 8; i++) {
    const x0 = LOGO_X + 9 * i;
    const k = Math.max(0, Math.ceil((x0 + 4 + 1) / SNAKE.step) - 1);
    const t = SNAKE.t0 + k * dt;
    const b = new Bmp(); b.text(LOGO, 'CASTAWAY'[i], x0, LOGO_Y);
    // wipe each letter down in two halves
    const top = new Bmp(); top.a.set(b.a); for (let y = LOGO_Y + 7; y < SH; y++) for (let x = 0; x < SW; x++) top.a[y * SW + x] = 0;
    show(top, t, t + dt);
    show(b, t + dt, T_IDLE_DONE);
  }
  // status comes on: battery full, signal searches 1-2-3-4 and gives up
  const st = new Bmp(); statusLeft(st, 0); statusRight(st, 4); show(st, SNAKE.t1, T_IDLE_DONE);
  for (let k = 1; k <= 4; k++) {
    const b = new Bmp(); statusLeft(b, k); show(b, SNAKE.t1 + B(k - 1), SNAKE.t1 + B(k));
  }
  const tNo = SNAKE.t1 + B(4);
  const last = typeOut(MENU, 'No network', Math.floor((SW - textWidth(MENU, 'No network')) / 2), 28, tNo, 0.12, T_IDLE_DONE);
  if (last >= T_IDLE_DONE) throw new Error('typing overruns the idle screen');
  const sk = new Bmp(); sk.center(MENU, 'Menu', 40); show(sk, last + 0.2, T_IDLE_DONE);
}

// ------------------------------------------------------------------ ascii debug
if (ASCII !== null) {
  const t = Number(ASCII);
  const b = new Bmp();
  for (const { b: bb, iv } of items.values()) if (iv.some(([a, c]) => t >= a && t < c)) b.or(bb);
  let out = '';
  for (let y = 0; y < SH; y++) {
    let r = '';
    for (let x = 0; x < SW; x++) r += b.a[y * SW + x] ? '#' : '.';
    out += r + '\n';
  }
  const snakeOn = t >= SNAKE.t0 && t < SNAKE.t1;
  console.log(out + (snakeOn ? '(+ snake)\n' : ''));
  process.exit(0);
}

// ------------------------------------------------------------------ bitmap -> path
function bmpPath(b) {
  // runs per row, merged downwards while identical
  const open = new Map();
  const rects = [];
  for (let y = 0; y <= SH; y++) {
    const runs = new Set();
    if (y < SH) {
      let x = 0;
      while (x < SW) {
        if (b.a[y * SW + x]) {
          const s = x;
          while (x < SW && b.a[y * SW + x]) x++;
          runs.add(`${s},${x - s}`);
        } else x++;
      }
    }
    for (const [k, r] of open) if (!runs.has(k)) { rects.push(r); open.delete(k); }
    for (const k of runs) {
      if (open.has(k)) open.get(k).h++;
      else { const [x, w] = k.split(',').map(Number); open.set(k, { x, y, w, h: 1 }); }
    }
  }
  // relative moves between rects (after z the pen is back at the rect's corner)
  rects.sort((p, q) => p.y - q.y || p.x - q.x);
  const pair = (a, b) => `${a}${b < 0 ? '' : ' '}${b}`;
  let px = 0, py = 0, d = '';
  for (const r of rects) {
    d += (d ? `m${pair(r.x - px, r.y - py)}` : `M${r.x} ${r.y}`) + `h${r.w}v${r.h}h-${r.w}z`;
    px = r.x; py = r.y;
  }
  return d;
}

// ------------------------------------------------------------------ css helpers
const pct = (t) => `${+((t / LOOP) * 100).toFixed(4)}%`;
const css = [];
let animN = 0;
function visClass(iv) {
  // merge, wrap into [0, LOOP)
  const segs = iv.map(([a, b]) => [Math.max(0, a), Math.min(LOOP, b)]).sort((p, q) => p[0] - q[0]);
  const m = [];
  for (const s of segs) {
    if (m.length && s[0] <= m[m.length - 1][1] + 1e-9) m[m.length - 1][1] = Math.max(m[m.length - 1][1], s[1]);
    else m.push([...s]);
  }
  const on0 = m.length && m[0][0] <= 1e-9;
  const pts = [];
  for (const [a, b] of m) {
    if (a > 1e-9) pts.push([a, 1]);
    if (b < LOOP - 1e-9) pts.push([b, 0]);
  }
  const sig = (on0 ? 'A' : 'B') + pts.map(([t, v]) => `${t.toFixed(3)}:${v}`).join(',');
  return { sig, on0, pts };
}
const classBySig = new Map();
function classFor(iv) {
  const { sig, on0, pts } = visClass(iv);
  if (classBySig.has(sig)) return classBySig.get(sig);
  const name = `v${(animN++).toString(36)}`;
  const kf = [`0%{opacity:${on0 ? 1 : 0}}`, ...pts.map(([t, v]) => `${pct(t)}{opacity:${v}}`), `100%{opacity:${on0 ? 1 : 0}}`];
  css.push(`@keyframes ${name}{${kf.join('')}}.${name}{opacity:${on0 ? 1 : 0};animation-name:${name}}`);
  classBySig.set(sig, name);
  return name;
}

// ------------------------------------------------------------------ LCD markup
const lcdPaths = [];
for (const { b, iv } of items.values()) lcdPaths.push(`<path class="${classFor(iv)}" d="${bmpPath(b)}"/>`);

// the snake: an opacity wrapper and a dashed stroke that advances in steps
{
  const { t0, t1, len, step, steps, travel } = SNAKE;
  const d = 'M' + SNAKE.pts.map(([x, y]) => `${x} ${y}`).join('L');
  const vis = classFor([[t0, t1]]);
  css.push(`@keyframes snk{0%{stroke-dashoffset:0}${pct(t0)}{stroke-dashoffset:0;animation-timing-function:steps(${steps},start)}${pct(t1)}{stroke-dashoffset:-${travel}}100%{stroke-dashoffset:-${travel}}}`
    + `.snk{stroke-dasharray:${len} ${SNAKE.total + 40};stroke-dashoffset:0;animation:snk ${LOOP}s linear infinite}`);
  lcdPaths.push(`<g class="${vis}"><path class="snk" d="${d}" fill="none" stroke="${LCD_PX}" stroke-width="2" stroke-linejoin="miter"/></g>`);
}

// ------------------------------------------------------------------ the sand scene
const f1 = (v) => +v.toFixed(1);
function grain() {
  // sand grains: tiny rects batched into a few paths by colour and strength
  const r = mulberry32(31);
  const groups = new Map();
  for (let i = 0; i < 380; i++) {
    const x = r() * W, y = r() * H;
    const dark = r() < 0.6;
    const op = r() < 0.5 ? 0.45 : 0.8;
    const w = f1(1 + r() * 1.6), h = f1(1 + r() * 1.2);
    const k = `${dark ? '#c9b07e' : '#fff6dc'}|${op}`;
    groups.set(k, (groups.get(k) || '') + `M${f1(x)} ${f1(y)}h${w}v${h}h-${w}z`);
  }
  return [...groups].map(([k, d]) => { const [c, o] = k.split('|'); return `<path fill="${c}" opacity="${o}" d="${d}"/>`; }).join('');
}

// palm-frond shadows falling from a palm off the top-left corner: serrated leaf silhouettes
function frondShadow() {
  const r = mulberry32(7);
  const O = [-70, -60];
  const fronds = [
    { ang: 14, len: 300, bend: -0.22 }, { ang: 36, len: 330, bend: 0.18 },
    { ang: 60, len: 300, bend: -0.2 }, { ang: 84, len: 250, bend: 0.22 },
  ];
  let d = '';
  for (const fr of fronds) {
    const a = (fr.ang * Math.PI) / 180;
    const N = 30;
    const spine = [];
    for (let i = 0; i <= N; i++) {
      const t = i / N, along = fr.len * t, side = fr.bend * fr.len * t * t;
      spine.push([O[0] + Math.cos(a) * along - Math.sin(a) * side, O[1] + Math.sin(a) * along + Math.cos(a) * side]);
    }
    for (const s of [-1, 1]) {
      const pts = [];
      for (let i = 4; i < N; i++) {
        const [x, y] = spine[i], [x2, y2] = spine[i + 1];
        const dir = Math.atan2(y2 - y, x2 - x);
        const t = i / N;
        const L = 62 * Math.sin(Math.PI * Math.min(1, 0.12 + t)) * (1 - t * 0.35) + 6;
        const la = dir + s * (1.05 - t * 0.45) + (r() - 0.5) * 0.12;
        const w = 0.13;
        // a leaflet: from the spine out to a tip and back, slightly wider at the base
        pts.push([x, y]);
        pts.push([x + Math.cos(la - s * w) * L * 0.55, y + Math.sin(la - s * w) * L * 0.55]);
        pts.push([x + Math.cos(la) * L, y + Math.sin(la) * L]);
        pts.push([x2 + Math.cos(la + s * w) * L * 0.5, y2 + Math.sin(la + s * w) * L * 0.5]);
      }
      pts.push(spine[N]);
      d += `M${spine[4].map(f1).join(' ')}L${pts.map(([x, y]) => `${f1(x)} ${f1(y)}`).join('L')}z`;
    }
    d += `M${spine.map(([x, y]) => `${f1(x)} ${f1(y)}`).join('L')}`;
  }
  return `<path d="${d}" stroke-width="3" stroke-linejoin="round"/>`;
}

function headphonesOnSand(x, y, rot) {
  return `<g transform="translate(${x} ${y}) rotate(${rot})">`
    + `<g transform="translate(5 6)" opacity=".18" fill="#5b4320"><path d="M-36 6 A36 36 0 0 1 36 6" fill="none" stroke="#5b4320" stroke-width="9"/><rect x="-46" y="0" width="22" height="30" rx="10"/><rect x="24" y="0" width="22" height="30" rx="10"/></g>`
    + `<path d="M-36 6 A36 36 0 0 1 36 6" fill="none" stroke="#e9dcc0" stroke-width="9" stroke-linecap="round"/>`
    + `<path d="M-36 6 A36 36 0 0 1 36 6" fill="none" stroke="#fff8e8" stroke-width="3" stroke-linecap="round" opacity=".8" transform="translate(-1.5 -2)"/>`
    + `<rect x="-46" y="0" width="22" height="30" rx="10" fill="#f3e8cf" stroke="#cdb994" stroke-width="2"/>`
    + `<rect x="24" y="0" width="22" height="30" rx="10" fill="#f3e8cf" stroke="#cdb994" stroke-width="2"/>`
    + `<rect x="-41" y="5" width="12" height="20" rx="6" fill="#bfa77c"/>`
    + `<rect x="29" y="5" width="12" height="20" rx="6" fill="#bfa77c"/>`
    + `</g>`;
}

function icedCoffee(x, y) {
  const r = mulberry32(5);
  let ice = '';
  for (let i = 0; i < 4; i++) {
    const a = r() * Math.PI * 2, d = 4 + r() * 7;
    ice += `<rect x="${f1(x + Math.cos(a) * d - 5)}" y="${f1(y + Math.sin(a) * d - 5)}" width="10" height="10" rx="2.5" fill="#fff" opacity=".5" transform="rotate(${f1(r() * 90)} ${f1(x + Math.cos(a) * d)} ${f1(y + Math.sin(a) * d)})"/>`;
  }
  return `<ellipse cx="${x + 6}" cy="${y + 7}" rx="27" ry="26" fill="#5b4320" opacity=".16"/>`
    + `<circle cx="${x}" cy="${y}" r="25" fill="#e7f1f2" stroke="#b9cfd3" stroke-width="2"/>`
    + `<circle cx="${x}" cy="${y}" r="20" fill="#9a6a45"/>`
    + `<path d="M${x - 14} ${y + 4} q10 -12 22 -6 q6 4 2 10" fill="none" stroke="#d9b48c" stroke-width="5" stroke-linecap="round" opacity=".8"/>`
    + ice
    + `<circle cx="${x + 7}" cy="${y - 8}" r="4.2" fill="#ec7c63" stroke="#c75b45" stroke-width="1.5"/>`
    + `<circle cx="${x + 7}" cy="${y - 8}" r="1.7" fill="#9a4636"/>`
    + `<path d="M${x - 17} ${y - 12} a20 20 0 0 1 12 -8" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".8"/>`;
}

function kumara(x, y) {
  const leaf = (lx, ly, rot, s) => `<path transform="translate(${lx} ${ly}) rotate(${rot}) scale(${s})" d="M0 0 C-7 -4 -9 -13 -4 -16 C-1 -18 0 -15 0 -13 C0 -15 1 -18 4 -16 C9 -13 7 -4 0 0z" fill="#5f9b49" stroke="#3f7432" stroke-width="1.2"/>`;
  return `<ellipse cx="${x}" cy="${y + 4}" rx="22" ry="9" fill="#c4a874" opacity=".7"/>`
    + `<ellipse cx="${x}" cy="${y + 2}" rx="15" ry="6" fill="#b39463" opacity=".6"/>`
    + leaf(x, y, -40, 1) + leaf(x, y, 35, 0.9) + leaf(x + 1, y, 0, 1.15)
    + `<rect x="${x + 16}" y="${y - 22}" width="3" height="24" fill="#a07a4c"/><rect x="${x + 11}" y="${y - 24}" width="16" height="9" rx="1.5" fill="#f6efdc" stroke="#a07a4c"/>`
    + `<path d="M${x + 14} ${y - 20}h10" stroke="#8a6a44" stroke-width="1.4"/>`;
}

// a hermit crab, wearing a coconut, top-down
function crabSymbol() {
  const legs = (phase) => {
    let d = '';
    for (const s of [-1, 1]) for (let i = 0; i < 3; i++) {
      const y0 = -6 + i * 7 + (phase && i % 2 ? 2 : 0) - (phase && i % 2 === 0 ? 1 : 0);
      d += `M${s * 13} ${y0}l${s * 9} ${-3 + i * 2}l${s * 3} ${4}`;
    }
    return d;
  };
  // drawn inline (it appears once), so its leg animation never depends on <use>
  return `<g>`
    + `<ellipse cx="4" cy="6" rx="19" ry="18" fill="#5b4320" opacity=".2"/>`
    + `<g class="legA"><path d="${legs(0)}" fill="none" stroke="#d2553c" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></g>`
    + `<g class="legB"><path d="${legs(1)}" fill="none" stroke="#d2553c" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></g>`
    + `<path d="M-7 -14l-4 -7M7 -14l4 -7" stroke="#d2553c" stroke-width="2.4" stroke-linecap="round"/>`
    + `<circle cx="-11" cy="-22" r="2.4" fill="#2c2420"/><circle cx="11" cy="-22" r="2.4" fill="#2c2420"/>`
    + `<ellipse cx="-12" cy="-15" rx="4.5" ry="3.5" fill="#e0664b"/><ellipse cx="12" cy="-15" rx="4.5" ry="3.5" fill="#e0664b"/>`
    + `<circle r="16" fill="#7a5233"/>`
    + `<circle r="16" fill="none" stroke="#5d3c22" stroke-width="2"/>`
    + `<path d="M-11 -6 q6 -6 12 -3 M-12 3 q8 -3 16 2 M-7 10 q6 -2 12 1" fill="none" stroke="#a37a52" stroke-width="1.6" stroke-linecap="round"/>`
    + `<circle cx="-5" cy="-6" r="5" fill="#9b7049" opacity=".55"/>`
    + `</g>`;
}

function seaCorner() {
  // the shoreline runs from the top edge to the right edge
  // the line runs on past both edges, so the tide's to-and-fro never shows an edge of the sea
  const shore = 'M612 -21 L640 0 C 680 30, 720 40, 760 70 S 815 120, 830 150 L846 182';
  const wet = 'M600 0 C 650 45, 700 60, 745 92 S 805 150, 830 182 L830 0z';
  return `<path d="${wet}" fill="#d9c28f" opacity=".75"/>`
    + `<g class="tide">`
    + `<path d="${shore} L870 182 L870 -30 L612 -30z" fill="url(#sea)"/>`
    + `<path d="${shore}" fill="none" stroke="#fffaf0" stroke-width="7" stroke-linecap="round" opacity=".9"/>`
    + `<path d="${shore}" fill="none" stroke="#bfeeea" stroke-width="3" transform="translate(9 -9)" opacity=".9"/>`
    + `<path d="M725 22 q12 5 22 2 M770 40 q10 6 20 3 M800 78 q9 5 18 4 M690 8 q10 4 20 1" fill="none" stroke="#e8fbf8" stroke-width="2.4" stroke-linecap="round" opacity=".8"/>`
    + `</g>`;
}

// the DRIFTCELL wordmark on the phone, in the tiny face
function wordmark(str, cx, y, s, fill) {
  const w = textWidth(TINY, str) + (str.length - 1) * 1; // extra tracking
  let x = cx - (w * s) / 2;
  let d = '';
  for (const ch of str) {
    const gl = TINY.g[ch];
    gl.forEach((row, j) => [...row].forEach((c, i) => { if (c === '#') d += `M${f1(x + i * s)} ${f1(y + j * s)}h${s}v${s}h-${s}z`; }));
    x += (gl[0].length + 2) * s;
  }
  return `<path d="${d}" fill="${fill}"/>`;
}

// ------------------------------------------------------------------ assemble
const bodyR = 84;
const svg = [];
svg.push(`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="t d">`);
svg.push(`<title id="t">CASTAWAY on a phone screen</title>`);
svg.push(`<desc id="d">A coral candybar phone lies face up on island sand. Its two-tone green LCD shows the idle screen CASTAWAY, No network, Menu, then cycles through picture messages: a bottle drifting straight back, a parcel of headphones, a palm climb for one bar of signal, a shark nodding in headphones, the synthesized tones, a typical 10-hour schedule and the command python tools/serve.py, then a snake laps the logo back on.</desc>`);
svg.push(`<defs>`);
svg.push(`<clipPath id="panel"><rect width="${W}" height="${H}" rx="16"/></clipPath>`);
svg.push(`<radialGradient id="sandg" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#f3e4bf"/><stop offset=".6" stop-color="${SAND}"/><stop offset="1" stop-color="#dcc595"/></radialGradient>`);
svg.push(`<linearGradient id="sea" x1="1" y1="0" x2=".55" y2=".75"><stop offset="0" stop-color="#1f93b4"/><stop offset=".55" stop-color="#3cbfc6"/><stop offset="1" stop-color="#8fe0d5"/></linearGradient>`);
svg.push(`<linearGradient id="body" x1="0" x2="1"><stop offset="0" stop-color="#c85a43"/><stop offset=".06" stop-color="#e6735a"/><stop offset=".3" stop-color="#f08a70"/><stop offset=".75" stop-color="#e9765c"/><stop offset=".95" stop-color="#d0614a"/><stop offset="1" stop-color="#b9513d"/></linearGradient>`);
svg.push(`<linearGradient id="bodytop" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".28"/><stop offset=".18" stop-color="#fff" stop-opacity="0"/></linearGradient>`);
svg.push(`<linearGradient id="lens" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#34383c"/><stop offset="1" stop-color="#1d1f22"/></linearGradient>`);
svg.push(`<radialGradient id="glow" cx=".5" cy=".45" r=".7"><stop offset="0" stop-color="#d3f8e2"/><stop offset=".7" stop-color="${LCD_BG}"/><stop offset="1" stop-color="#a9d4bb"/></radialGradient>`);
svg.push(`<linearGradient id="glare" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".5" stop-color="#fff" stop-opacity=".04"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/></linearGradient>`);
svg.push(`<linearGradient id="key" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbf3e2"/><stop offset="1" stop-color="#e2d2b2"/></linearGradient>`);
svg.push(`<radialGradient id="cloud"><stop offset="0" stop-color="#2d4250" stop-opacity=".2"/><stop offset=".6" stop-color="#2d4250" stop-opacity=".12"/><stop offset="1" stop-color="#2d4250" stop-opacity="0"/></radialGradient>`);
svg.push(`<pattern id="cell" width="1" height="1" patternUnits="userSpaceOnUse"><rect width=".88" height=".88" fill="#fff"/></pattern>`);
svg.push(`<mask id="cells" maskUnits="userSpaceOnUse" x="0" y="0" width="${SW}" height="${SH}"><rect width="${SW}" height="${SH}" fill="url(#cell)"/></mask>`);
svg.push(`</defs>`);

// style
const motion = [
  `.lcd path,.lcd g{animation-duration:${LOOP}s;animation-timing-function:step-end;animation-iteration-count:infinite}`,
  `.snk{animation-timing-function:linear}`,
  `.frond{transform-origin:-70px -60px;animation:sway 9s ease-in-out infinite}`,
  `@keyframes sway{0%,100%{transform:rotate(-1.2deg)}50%{transform:rotate(1.4deg)}}`,
  `.tide{animation:tide 7s ease-in-out infinite}`,
  `@keyframes tide{0%,100%{transform:translate(7px,-7px)}45%{transform:translate(-5px,5px)}}`,
  `.cloudsh{transform:translate(-520px,0);animation:cloud ${LOOP}s linear infinite}`,
  `@keyframes cloud{0%{transform:translate(-520px,0)}100%{transform:translate(1300px,60px)}}`,
  // the crab hops a step at a time up the beach, waits, and carries on
  `.crab{animation:crab ${LOOP}s steps(1,end) infinite}`,
  `.legB{animation:legs .5s steps(1,end) infinite}.legA{animation:legs .5s steps(1,end) infinite reverse}`,
  `@keyframes legs{0%{opacity:1}50%{opacity:0}}`,
];
// crab keyframes: stepped hops, one every 0.375 s (half a beat)
{
  const path = [];
  // waits on the sand, scuttles off the right edge, comes back up the beach from below, waits again
  const pts = [[770, 380], [770, 380], [782, 364], [782, 364], [800, 342], [800, 342], [866, 300], [866, 300], [796, 520], [784, 470], [774, 420], [770, 380], [770, 380]];
  const times = [0, 3, 4.5, 9, 10.5, 15, 21, 34, 34.01, 40, 46, 51, 63];
  const kf = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
    const t0 = times[i], t1 = times[i + 1];
    const n = Math.max(1, Math.round((t1 - t0) / 0.375));
    const moving = x0 !== x1 || y0 !== y1;
    for (let s = 0; s < (moving ? n : 1); s++) {
      const u = s / n;
      kf.push(`${pct(t0 + (t1 - t0) * u)}{transform:translate(${f1(x0 + (x1 - x0) * u)}px,${f1(y0 + (y1 - y0) * u)}px)}`);
    }
  }
  kf.push(`100%{transform:translate(${pts[pts.length - 1][0]}px,${pts[pts.length - 1][1]}px)}`);
  motion.push(`@keyframes crab{${kf.join('')}}`);
  path.push('');
}
const reduce = `@media (prefers-reduced-motion:reduce){*{animation:none!important}.crab{transform:translate(770px,380px)}.legB{opacity:0}}`;
const freeze = FREEZE !== null ? `*{animation-delay:-${Number(FREEZE)}s!important;animation-play-state:paused!important}` : '';
svg.push(`<style>${motion.join('')}${css.join('')}${reduce}${freeze}</style>`);

svg.push(`<g clip-path="url(#panel)">`);
svg.push(`<rect width="${W}" height="${H}" fill="url(#sandg)"/>`);
svg.push(`<g>${grain()}</g>`);
svg.push(seaCorner());
// little shell and footprints, for scale
svg.push(`<g opacity=".55" fill="#c9ad78">`
  + [[60, 446, -20], [84, 420, -8], [98, 392, -14], [124, 370, -4]].map(([x, y, r], i) =>
    `<ellipse cx="${x + (i % 2 ? 10 : 0)}" cy="${y}" rx="6.5" ry="10" transform="rotate(${r} ${x} ${y})"/>`).join('')
  + `</g>`);
svg.push(`<g transform="translate(762 268) rotate(18)"><path d="M0 -16 C 14 -14 18 4 10 14 L -10 14 C -18 4 -14 -14 0 -16z" fill="#f6d9c8" stroke="#d9a58c" stroke-width="1.5"/><path d="M0 -14 V12 M-6 -12 L-5 13 M6 -12 L5 13 M-11 -6 L-9 13 M11 -6 L9 13" stroke="#d9a58c" stroke-width="1.2"/></g>`);
svg.push(headphonesOnSand(70, 240, -18));
svg.push(kumara(64, 360));
svg.push(icedCoffee(770, 210));
svg.push(`<g class="crab" style="transform:translate(770px,380px)">${crabSymbol()}</g>`);

// the phone
const body = `<rect x="${PHX}" y="${PHY}" width="${PHW}" height="${H + 120}" rx="${bodyR}"/>`;
svg.push(`<g fill="#5b4320" opacity=".14" transform="translate(14 16)">${body}</g>`);
svg.push(`<g fill="#5b4320" opacity=".1" transform="translate(7 8)">${body}</g>`);
svg.push(`<rect x="${PHX}" y="${PHY}" width="${PHW}" height="${H + 120}" rx="${bodyR}" fill="url(#body)"/>`);
svg.push(`<rect x="${PHX}" y="${PHY}" width="${PHW}" height="${H + 120}" rx="${bodyR}" fill="url(#bodytop)"/>`);
svg.push(`<rect x="${PHX + 1.5}" y="${PHY + 1.5}" width="${PHW - 3}" height="${H + 120}" rx="${bodyR - 1.5}" fill="none" stroke="#ffc2b0" stroke-width="2" opacity=".5"/>`);
// face plate: a slightly raised inner panel
svg.push(`<rect x="${PHX + 22}" y="${PHY + 18}" width="${PHW - 44}" height="${H + 100}" rx="${bodyR - 20}" fill="none" stroke="#c45a43" stroke-width="2" opacity=".55"/>`);
// earpiece
svg.push(`<rect x="${CX - 42}" y="${PHY + 26}" width="84" height="12" rx="6" fill="#a8483a"/>`);
svg.push(`<rect x="${CX - 42}" y="${PHY + 27.5}" width="84" height="12" rx="6" fill="none" stroke="#f6a28c" stroke-width="1.5" opacity=".7"/>`);
for (let i = 0; i < 9; i++) svg.push(`<rect x="${CX - 34 + i * 8}" y="${PHY + 30}" width="4" height="4" rx="2" fill="#5e2a22"/>`);
svg.push(wordmark('DRIFTCELL', CX, PHY + 50, 2.6, '#a8483a'));
svg.push(wordmark('DRIFTCELL', CX, PHY + 49, 2.6, '#ffd2c2'));
// lens and glass
svg.push(`<rect x="${LENS.x}" y="${LENS.y}" width="${LENS.w}" height="${LENS.h}" rx="26" fill="url(#lens)"/>`);
svg.push(`<rect x="${LENS.x + 1}" y="${LENS.y + 1}" width="${LENS.w - 2}" height="${LENS.h - 2}" rx="25" fill="none" stroke="#5a5f64" stroke-width="2"/>`);
svg.push(`<rect x="${GLASS.x}" y="${GLASS.y}" width="${GLASS.w}" height="${GLASS.h}" rx="6" fill="url(#glow)"/>`);
svg.push(`<rect x="${GLASS.x}" y="${GLASS.y}" width="${GLASS.w}" height="${GLASS.h}" rx="6" fill="none" stroke="#0e1012" stroke-width="2" opacity=".6"/>`);
// pixels: a faint grid of every pixel, the shadow copy, then the lit pixels
svg.push(`<g transform="translate(${LX} ${LY}) scale(${P})">`);
svg.push(`<rect width="${SW}" height="${SH}" fill="${LCD_PX}" opacity=".045" mask="url(#cells)"/>`);
// the shadow is a real second copy, not a <use>: every browser then runs the same
// animations on both, so the shadow can never show a different page from the pixels
svg.push(`<g class="lcd" fill="${LCD_PX}" mask="url(#cells)" transform="translate(.24 .26)" opacity=".2">${lcdPaths.join('')}</g>`);
svg.push(`<g class="lcd" fill="${LCD_PX}" mask="url(#cells)">${lcdPaths.join('')}</g>`);
svg.push(`</g>`);
svg.push(`<path d="M${LENS.x + 4} ${LENS.y + 4} H${LENS.x + 300} L${LENS.x + 150} ${LENS.y + LENS.h - 4} H${LENS.x + 4}z" fill="url(#glare)"/>`);
// keys under the screen: clear, the big soft key, and the up/down rocker
const KY = LENS.y + LENS.h + 18;
svg.push(`<g>`
  + `<rect x="${CX - 80}" y="${KY + 3}" width="160" height="34" rx="17" fill="#8d3b2e" opacity=".5"/>`
  + `<rect x="${CX - 80}" y="${KY}" width="160" height="34" rx="17" fill="url(#key)"/>`
  + `<rect x="${CX - 50}" y="${KY + 15}" width="100" height="4" rx="2" fill="#d1bd98"/>`
  + `<rect x="${CX - 200}" y="${KY + 5}" width="86" height="28" rx="14" fill="#8d3b2e" opacity=".5"/>`
  + `<rect x="${CX - 200}" y="${KY + 2}" width="86" height="28" rx="14" fill="url(#key)"/>`
  + `<path d="M${CX - 162} ${KY + 10} a6 6 0 1 0 0 12" fill="none" stroke="#a88f68" stroke-width="2.6" stroke-linecap="round" transform="translate(4 0)"/>`
  + `<rect x="${CX + 114}" y="${KY + 5}" width="86" height="28" rx="14" fill="#8d3b2e" opacity=".5"/>`
  + `<rect x="${CX + 114}" y="${KY + 2}" width="86" height="28" rx="14" fill="url(#key)"/>`
  + `<path d="M${CX + 140} ${KY + 19} l6 -6 l6 6 M${CX + 162} ${KY + 13} l6 6 l6 -6" fill="none" stroke="#a88f68" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`
  + `</g>`);

// frond shadows and the passing cloud lie over everything
svg.push(`<g class="frond" fill="#3d2a10" stroke="#3d2a10" opacity=".13">${frondShadow()}</g>`);
svg.push(`<g class="cloudsh"><ellipse cx="0" cy="190" rx="300" ry="170" fill="url(#cloud)"/></g>`);
svg.push(`</g>`);
svg.push(`</svg>`);

const out = svg.join('\n');
const dest = DEBUG_OUT ? path.resolve(DEBUG_OUT) : OUT;
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.writeFileSync(dest, out);
console.log(`wrote ${dest} (${(out.length / 1024).toFixed(1)} KB, ${items.size} bitmaps, ${classBySig.size} classes)`);
