#!/usr/bin/env node
// 53-viewdata-page_opus_5.5: the "Viewdata Page" README header for Castaway.
// Catalogue entry ansi-09 (the French Minitel / British viewdata service page):
// a 40x25 videotex page on a small monochrome terminal, where the eight
// videotex colours come out as eight grey levels, built around a numbered menu,
// an input line with a dot and a block cursor, and a legend of function keys.
//
// What is drawn, all of it by this file (no fonts, no images, nothing external):
//   * an invented beige terminal (the BEACHCOMBER 40) with a row of nine
//     function keys under the screen, labelled in English;
//   * on its screen, one service page from an invented provider, Lagoon Pages:
//       row 0      the status row, empty except the inverse line-state letter
//                  (F for a moment, then C: connected)
//       rows 1-2   the title band, CASTAWAY in double-size capitals
//       row 3      provider, subtitle and price (0.00 a minute, forever)
//       rows 4-15  a mosaic picture, 80x36 sextels (2x3 per cell, 3/4/3 tall)
//       row 16     a NOW line that narrates the picture
//       rows 18-21 the numbered menu, inverse digits, double spaced
//       row 23     "type a number . then SEND", with a blinking block cursor
//       row 24     the key legend
//   * the page paints top to bottom once, at 1200 bit/s (120 characters a
//     second, counted per row up to its last used cell), then holds;
//   * the picture then lives on a 60 s loop, the length of the project's
//     theme (20 bars of 3 s, a beat every 0.75 s). Everything moves in steps,
//     on the beat or on the bar: clouds step one sextel a beat, she nods on
//     every beat, throws a message in a bottle that comes straight back, sips
//     a coconut while a ship crosses behind her, then waves for rescue at an
//     empty sea. Each new NOW message types itself in at 120 characters a
//     second, like a real page update. At the loop point somebody presses
//     REPEAT on the case: ten more hours, please.
//
// Also writes page 2 (the timetable) as a second, static screen.
//
//   node 53-viewdata-page_opus_5.5.mjs            write both SVGs
//   node 53-viewdata-page_opus_5.5.mjs --at=35 --out=f.svg
//        freeze the main page at 35 s (for checks); add --crop=x,y,w,h and
//        --zoom=4 to cut out and enlarge part of it
//
// Plain Node, no dependencies. Deterministic: randomness is a seeded PRNG.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '53-viewdata-page_opus_5.5';
const ASSETS = path.join(HERE, '..', 'assets');
const argv = process.argv.slice(2);
const opt = (k) => { const a = argv.find((s) => s.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : null; };
const AT = opt('at') !== null ? Number(opt('at')) : null;
const OUT_MAIN = opt('out') || path.join(ASSETS, `${SLUG}.svg`);
const CROP = opt('crop') ? opt('crop').split(',').map(Number) : null;   // debug: --crop=x,y,w,h at 4x
if ((AT !== null || CROP) && !opt('out')) throw new Error('--at and --crop write a check file: give it --out=');
const OUT_P2 = path.join(ASSETS, `${SLUG}-timetable.svg`);

// ------------------------------------------------------------------ helpers
const r2 = (v) => +(+v).toFixed(2);
const r3 = (v) => +(+v).toFixed(3);
function mulberry32(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ------------------------------------------------------------------ greys
// The eight videotex colours by luminance, as a monochrome set shows them:
// black, blue, red, magenta, green, cyan, yellow, white. A faint cool tint.
const GREY = ['#0b0d0e', '#2b3032', '#4a5053', '#686e70', '#878c8d', '#a6abab', '#c7cbca', '#eef0ed'];

// ------------------------------------------------------------------ timing
const T = 60;              // one loop of the life animation = one loop of the theme
const BAR = 3, BEAT = 0.75;
const CPS = 120;           // 1200 bit/s, 10 bits a character
const pct = (t) => `${r3((t / T) * 100)}%`;
// One animation declaration. With --at the clock is frozen at that moment.
function anim(name, dur, { delay = 0, timing = 'step-end', iter = 'infinite', fill = 'both' } = {}) {
  const d = AT === null ? delay : delay - AT;
  return `${name} ${r3(dur)}s ${timing} ${r3(d)}s ${iter} ${fill}${AT === null ? '' : ' paused'}`;
}
// Intervals [[a,b],...] inside [0,T) -> a step-end opacity track.
const inside = (iv, t) => iv.some(([a, b]) => t >= a - 1e-9 && t < b - 1e-9);
function opacityKF(name, iv, period = T) {
  const pts = [...new Set([0, ...iv.flat().filter((t) => t > 0 && t < period)])].sort((a, b) => a - b);
  const p = (t) => `${r3((t / period) * 100)}%`;
  const frames = pts.map((t) => `${p(t)}{opacity:${inside(iv, t) ? 1 : 0}}`);
  frames.push(`100%{opacity:${inside(iv, 0) ? 1 : 0}}`);
  return `@keyframes ${name}{${frames.join('')}}`;
}

// ------------------------------------------------------------------ fonts
// The terminal's dot-matrix face: 5x7 capitals, lower case with descenders,
// sitting in an 8x10 cell at (1,1). Rows top to bottom, '#' = a dot.
// (Bitmap adapted from the 5x7 face in 08-tractor-feed_opus_5.5.mjs.)
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
  ';': '.....|.##..|.##..|.....|.##..|.##..|..#..|.#...',
  '-': '.....|.....|.....|.###.|.....|.....|.....',
  '+': '.....|..#..|..#..|#####|..#..|..#..|.....',
  '=': '.....|.....|#####|.....|#####|.....|.....',
  '~': '.....|.....|.#...|#.#.#|...#.|.....|.....',
  '/': '....#|....#|...#.|..#..|.#...|#....|#....',
  '(': '...#.|..#..|.#...|.#...|.#...|..#..|...#.',
  ')': '.#...|..#..|...#.|...#.|...#.|..#..|.#...',
  "'": '..#..|..#..|.#...|.....|.....|.....|.....',
  '!': '..#..|..#..|..#..|..#..|..#..|.....|..#..',
  '?': '.###.|#...#|....#|...#.|..#..|.....|..#..',
  '>': '.#...|..#..|...#.|....#|...#.|..#..|.#...',
  '<': '...#.|..#..|.#...|#....|.#...|..#..|...#.',
  '#': '.#.#.|.#.#.|#####|.#.#.|#####|.#.#.|.#.#.',
  '%': '##...|##..#|...#.|..#..|.#...|#..##|...##',
  '*': '.....|..#..|#.#.#|.###.|#.#.#|..#..|.....',
  '·': '.....|.....|.....|..#..|.....|.....|.....',
};
const glyphRows = (ch) => {
  const g = F5[ch];
  if (g === undefined) throw new Error(`no glyph for ${JSON.stringify(ch)}`);
  return g.split('|');
};
// A bitmap (array of strings) to one path, merging runs and identical rows.
function bitmapPath(rows, ox = 0, oy = 0, bloom = 0) {
  const out = [];
  const open = new Map();
  const flush = (key) => { const r = open.get(key); out.push(`M${ox + r.x} ${oy + r.y}h${r2(r.w + bloom)}v${r.h}h-${r2(r.w + bloom)}z`); open.delete(key); };
  rows.forEach((row, y) => {
    const seen = new Set();
    for (let x = 0; x < row.length;) {
      if (row[x] !== '#') { x++; continue; }
      let e = x; while (e < row.length && row[e] === '#') e++;
      const key = `${x},${e}`;
      if (open.has(key) && open.get(key).y + open.get(key).h === y) open.get(key).h++;
      else { if (open.has(key)) flush(key); open.set(key, { x, y, w: e - x, h: 1 }); }
      seen.add(key); x = e;
    }
    for (const key of [...open.keys()]) if (!seen.has(key)) flush(key);
  });
  for (const key of [...open.keys()]) flush(key);
  return out.join('');
}

// A small 3x5 face (some letters wider) for the key caps and the maker's badge.
const F3 = {
  A: '.#.|#.#|###|#.#|#.#', B: '##.|#.#|##.|#.#|##.', C: '.##|#..|#..|#..|.##', D: '##.|#.#|#.#|#.#|##.',
  E: '###|#..|##.|#..|###', F: '###|#..|##.|#..|#..', G: '.##|#..|#.#|#.#|.##', H: '#.#|#.#|###|#.#|#.#',
  I: '###|.#.|.#.|.#.|###', K: '#.#|#.#|##.|#.#|#.#', L: '#..|#..|#..|#..|###',
  M: '#...#|##.##|#.#.#|#...#|#...#', N: '#..#|##.#|#.##|#..#|#..#', O: '.#.|#.#|#.#|#.#|.#.',
  P: '##.|#.#|##.|#..|#..', R: '##.|#.#|##.|#.#|#.#', S: '.##|#..|.#.|..#|##.', T: '###|.#.|.#.|.#.|.#.',
  U: '#.#|#.#|#.#|#.#|###', V: '#.#|#.#|#.#|#.#|.#.', W: '#...#|#...#|#.#.#|##.##|#...#', X: '#.#|#.#|.#.|#.#|#.#',
  Y: '#.#|#.#|.#.|.#.|.#.', 0: '###|#.#|#.#|#.#|###', 4: '#.#|#.#|###|..#|..#', 2: '##.|..#|.#.|#..|###',
  1: '.#.|##.|.#.|.#.|###', '/': '..#|..#|.#.|#..|#..', '-': '...|...|###|...|...', ' ': '..|..|..|..|..',
};
function smallText(str, x, y, scale = 1) {
  let cx = 0; const parts = [];
  for (const ch of str) {
    const g = F3[ch]; if (!g) throw new Error(`no 3x5 glyph for ${ch}`);
    const rows = g.split('|');
    parts.push(bitmapPath(rows, cx, 0));
    cx += rows[0].length + 1;
  }
  return { d: parts.join(''), w: cx - 1, tf: `translate(${r2(x)} ${r2(y)})${scale !== 1 ? ` scale(${scale})` : ''}` };
}
const smallWidth = (str) => [...str].reduce((s, ch) => s + F3[ch].split('|')[0].length + 1, -1);

// ------------------------------------------------------------------ the page
const COLS = 40, ROWS = 25, CW = 8, CH = 10;
const BLOOM = 0.55;      // a CRT spreads each dot sideways a little: the font looks bolder than its bitmap
const PW = COLS * CW, PH = ROWS * CH;   // 320 x 250

class Page {
  constructor() {
    this.bg = Array.from({ length: ROWS }, () => new Array(COLS).fill(0));
    this.glyphs = [];        // {ch, x, y, fg, s:[sx,sy], row}
    this.used = Array.from({ length: ROWS }, () => new Array(COLS).fill(false));
  }
  // Normal-size text. bg: a grey for the cells the text covers, or null.
  text(row, col, str, fg, bg = null) {
    if (col + [...str].length > COLS) throw new Error(`row ${row}: "${str}" runs past column 40`);
    [...str].forEach((ch, i) => {
      const c = col + i;
      if (bg !== null) { this.bg[row][c] = bg; this.used[row][c] = true; }
      if (ch !== ' ') { this.glyphs.push({ ch, x: c * CW, y: row * CH, fg, s: [1, 1], row }); this.used[row][c] = true; }
    });
  }
  // Inverse video: the key or digit in the background colour on a light cell.
  inv(row, col, str, fg = 0, bg = 7) { this.text(row, col, str, fg, bg); }
  // Double size: 2 columns by 2 rows a character, top row given.
  big(row, col, str, fg, bg = null) {
    [...str].forEach((ch, i) => {
      const c = col + i * 2;
      for (const rr of [row, row + 1]) for (const cc of [c, c + 1]) { if (bg !== null) this.bg[rr][cc] = bg; this.used[rr][cc] = true; }
      if (ch !== ' ') this.glyphs.push({ ch, x: c * CW, y: row * CH, fg, s: [2, 2], row });
    });
  }
  band(row, bg, c0 = 0, c1 = COLS - 1) { for (let c = c0; c <= c1; c++) { this.bg[row][c] = bg; this.used[row][c] = true; } }
  lastUsed(row) { for (let c = COLS - 1; c >= 0; c--) if (this.used[row][c]) return c + 1; return 0; }
}

// Cell backgrounds as merged runs, one path per grey.
function bgPaths(page) {
  const by = new Map();
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS;) {
      const g = page.bg[r][c]; let e = c; while (e < COLS && page.bg[r][e] === g) e++;
      if (g !== 0) { if (!by.has(g)) by.set(g, []); by.get(g).push(`M${c * CW} ${r * CH}h${(e - c) * CW}v${CH}h-${(e - c) * CW}z`); }
      c = e;
    }
  }
  return [...by].map(([g, d]) => `<path class="c${g}" d="${d.join('')}"/>`).join('');
}
// Glyphs as <use>s grouped by grey. ids: one path per character used.
function glyphUses(list, used) {
  const by = new Map();
  for (const g of list) {
    const id = `g${g.ch.codePointAt(0).toString(16)}`; used.add(g.ch);
    const tf = g.s[0] === 1 && g.s[1] === 1 ? `x="${g.x}" y="${g.y}"` : `transform="translate(${g.x} ${g.y}) scale(${g.s[0]} ${g.s[1]})"`;
    if (!by.has(g.fg)) by.set(g.fg, []);
    by.get(g.fg).push(`<use href="#${id}" ${tf}/>`);
  }
  return [...by].map(([fg, u]) => `<g class="c${fg}">${u.join('')}</g>`).join('');
}
const glyphDefs = (used) => [...used].sort().map((ch) =>
  `<path id="g${ch.codePointAt(0).toString(16)}" d="${bitmapPath(glyphRows(ch), 1, 1, BLOOM)}"/>`).join('');

// ------------------------------------------------------------------ mosaics
// The picture area: page rows 4..15, i.e. 80 x 36 sextels. Each cell is 2x3
// sextels, 4 units wide, and 3, 4, 3 units tall (the 10-unit cell split).
const PIC_ROW = 4, SW = 80, SHH = 36;
const SUB_Y = [0, 3, 7], SUB_H = [3, 4, 3];
const sy2y = (sy) => PIC_ROW * CH + Math.floor(sy / 3) * CH + SUB_Y[((sy % 3) + 3) % 3];
const syH = (sy) => SUB_H[((sy % 3) + 3) % 3];

class Grid {
  constructor(w, h) { this.w = w; this.h = h; this.d = new Int8Array(w * h).fill(-1); }
  set(x, y, c) { x = Math.round(x); y = Math.round(y); if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.d[y * this.w + x] = c; }
  get(x, y) { return x >= 0 && y >= 0 && x < this.w && y < this.h ? this.d[y * this.w + x] : -1; }
  rect(x0, y0, x1, y1, c) { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) this.set(x, y, c); }
  ellipse(cx, cy, rx, ry, c, test = null) {
    for (let y = Math.floor(cy - ry - 1); y <= cy + ry + 1; y++) for (let x = Math.floor(cx - rx - 1); x <= cx + rx + 1; x++) {
      const dx = (x - cx) / rx, dy = (y - cy) / ry;
      if (dx * dx + dy * dy <= 1 && (!test || test(x, y))) this.set(x, y, c);
    }
  }
  // ASCII sprite: '.' transparent, digits are greys.
  sprite(rows, ox, oy) { rows.forEach((row, y) => [...row].forEach((ch, x) => { if (ch !== '.' && ch !== ' ') this.set(ox + x, oy + y, +ch); })); return this; }
  // A thick polyline: width w0 at the start tapering to w1.
  stroke(pts, c, w0, w1) {
    const segs = []; let L = 0;
    for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], (pts[i][1] - pts[i - 1][1]) * 1.2); segs.push(l); L += l; }
    let acc = 0;
    for (let i = 1; i < pts.length; i++) {
      const [ax, ay] = pts[i - 1], [bx, by] = pts[i]; const n = Math.ceil(segs[i - 1] * 4);
      for (let k = 0; k <= n; k++) {
        const u = k / n, x = ax + (bx - ax) * u, y = ay + (by - ay) * u;
        const w = w0 + (w1 - w0) * ((acc + segs[i - 1] * u) / L);
        const rx = w / 2, ry = w / 2.4;
        for (let yy = Math.floor(y - ry); yy <= Math.ceil(y + ry); yy++) for (let xx = Math.floor(x - rx); xx <= Math.ceil(x + rx); xx++) {
          const dx = (xx - x) / Math.max(rx, 0.5), dy = (yy - y) / Math.max(ry, 0.5);
          if (dx * dx + dy * dy <= 1.05) this.set(xx, yy, c);
        }
      }
      acc += segs[i - 1];
    }
  }
}
// A sextel grid to one path per grey, at sextel offset (ox, oy) in picture space.
function gridPaths(g, ox = 0, oy = 0, cls = (c) => `c${c}`) {
  const by = new Map();
  const open = new Map();
  const push = (r) => { if (!by.has(r.c)) by.set(r.c, []); by.get(r.c).push(`M${r.x * 4} ${r.y0}h${r.w * 4}v${r.y1 - r.y0}h-${r.w * 4}z`); };
  for (let y = 0; y < g.h; y++) {
    const seen = new Set();
    const Y = sy2y(oy + y), Hh = syH(oy + y);
    for (let x = 0; x < g.w;) {
      const c = g.get(x, y); let e = x; while (e < g.w && g.get(e, y) === c) e++;
      if (c >= 0) {
        const key = `${x},${e},${c}`;
        const o = open.get(key);
        if (o && o.y1 === Y) o.y1 = Y + Hh;
        else { if (o) { push(o); } open.set(key, { x: ox + x, w: e - x, c, y0: Y, y1: Y + Hh }); }
        seen.add(key);
      }
      x = e;
    }
    for (const key of [...open.keys()]) if (!seen.has(key)) { push(open.get(key)); open.delete(key); }
  }
  for (const o of open.values()) push(o);
  return [...by].map(([c, d]) => `<path class="${cls(c)}" d="${d.join('')}"/>`).join('');
}

// ------------------------------------------------------------------ the island
const rnd = mulberry32(1992);
const HORIZON = 17;

// Back layer: sky and sea in flat bands, a low cloud bank on the horizon,
// sparse swell dashes that get longer towards the camera.
const back = new Grid(SW, SHH);
back.rect(0, 0, SW - 1, 9, 5);
back.rect(0, 10, SW - 1, HORIZON - 1, 6);
for (let x = 0; x < SW; x++) {
  const h = Math.max(0, Math.round(1.1 + 1.2 * Math.sin(x * 0.41) + 0.9 * Math.sin(x * 0.11 + 1.7)));
  for (let k = 0; k < h; k++) back.set(x, HORIZON - 1 - k, 7);
}
back.rect(0, HORIZON, SW - 1, HORIZON, 3);
back.rect(0, HORIZON + 1, SW - 1, 24, 2);
back.rect(0, 25, SW - 1, SHH - 1, 3);
for (let y = HORIZON + 2; y < SHH; y += 2) {
  const near = (y - HORIZON) / (SHH - HORIZON);
  let x = Math.floor(rnd() * 12);
  while (x < SW) {
    const len = 1 + Math.floor(rnd() * (1 + near * 4));
    const col = y <= 24 ? 3 : 4;
    for (let k = 0; k < len; k++) back.set(x + k, y, col);
    x += len + 7 + Math.floor(rnd() * 14);
  }
}

// Clouds: their own strip, drawn twice and stepped one sextel a beat.
const clouds = new Grid(SW, 12);
const cloudBlobs = [
  [[10, 6, 7, 2.4], [16, 4.2, 5, 2.8], [21, 5.8, 4, 2.0], [6, 7, 3.5, 1.4]],
  [[42, 2.6, 4.5, 1.6], [47, 2, 3.5, 1.8], [51, 3, 3, 1.2]],
  [[66, 7.5, 6.5, 2.0], [71, 6, 4.5, 2.5], [61, 8.4, 3, 1.2], [76, 8, 3, 1.4]],
];
for (const blob of cloudBlobs) for (const [cx, cy, rx, ry] of blob) clouds.ellipse(cx, cy, rx, ry, 7);
for (let x = 0; x < SW; x++) {            // the flat grey underside
  let low = -1; for (let y = 0; y < clouds.h; y++) if (clouds.get(x, y) === 7) low = y;
  if (low >= 0 && clouds.get(x, low - 1) === 7) clouds.set(x, low, 6);
}

// Front layer: shallows, foam, sand, a few tufts, the palm, the raft.
const IX = 41, IY = 30;
const front = new Grid(SW, SHH);
front.ellipse(IX + 1, IY + 0.6, 27, 6.0, 4);
front.ellipse(IX, IY + 0.2, 20.5, 4.7, 7);
front.ellipse(IX, IY, 18.5, 4.0, 6);
for (let x = 0; x < SW; x++) {            // sand in shadow along the near edge
  let low = -1; for (let y = 0; y < SHH; y++) if (front.get(x, y) === 6) low = y;
  if (low >= 0) front.set(x, low, 5);
}
for (const [x, y, w] of [[47, 28, 3], [54, 29, 3]]) {
  for (let k = 0; k < w; k++) front.set(x + k, y, 3);
  front.set(x + (w > 2 ? 1 : 0), y - 1, 3);
}
// the palm: a slender trunk leaning right, lit on the left, ringed
const BASE = [51, 30], TOP = [56, 4];
for (let y = BASE[1]; y >= TOP[1]; y--) {
  const u = (BASE[1] - y) / (BASE[1] - TOP[1]);
  const x = Math.round(BASE[0] + (TOP[0] - BASE[0]) * (1 - (1 - u) * (1 - u)));
  const ring = y % 3 === 1;
  front.set(x, y, ring ? 3 : 4);
  front.set(x + 1, y, ring ? 1 : 2);
  if (y >= BASE[1] - 1) { front.set(x - 1, y, 4); front.set(x + 2, y, 2); }
}
// The crown: each frond is a curved spine with leaflets hanging under it,
// longest mid-frond, so the silhouette droops like the real thing.
const CX = TOP[0] + 0.5, CY = TOP[1];
const crown = new Grid(SW, SHH);
function frond(p1, p2, hang) {
  const n = 80;
  for (let i = 0; i <= n; i++) {
    const u = i / n, v = 1 - u;
    const x = v * v * CX + 2 * v * u * p1[0] + u * u * p2[0];
    const y = v * v * CY + 2 * v * u * p1[1] + u * u * p2[1];
    const xi = Math.round(x), yi = Math.round(y);
    crown.set(xi, yi, 3);                                  // the lit spine
    if (u < 0.3) crown.set(xi, yi + 1, 1);
    const len = Math.round(hang * Math.sin(Math.PI * Math.min(1, u * 1.15)));
    for (let k = 1; k <= len; k++) if (crown.get(xi, yi + k) !== 3) crown.set(xi, yi + k, k === len ? 0 : 1);
  }
}
frond([CX - 8, CY - 5], [CX - 18, CY + 4], 2.6);
frond([CX - 6, CY - 1], [CX - 12, CY + 8], 2.0);
frond([CX + 8, CY - 5], [CX + 18, CY + 4], 2.6);
frond([CX + 6, CY - 1], [CX + 12, CY + 8], 2.0);
frond([CX - 3, CY - 5], [CX - 9, CY - 3], 1.6);
frond([CX + 3, CY - 5], [CX + 9, CY - 3], 1.6);
for (let y = 0; y < SHH; y++) for (let x = 0; x < SW; x++) if (crown.get(x, y) >= 0) front.set(x, y, crown.get(x, y));
front.sprite(['.11.', '1001', '.11.'], Math.round(CX) - 2, CY + 1);    // coconuts
// the raft, moored to the right
front.sprite([
  '.55555555555.',
  '2212222212222',
  '2212222212222',
  '.11111111111.',
], 64, 30);

// Her. Six sextels wide, fourteen tall. Body and head are separate so the
// head can nod. 0 dark hair with the low bun behind, 7 cream headphones and
// shorts, 5 skin, 4 coral tank top and (in shade) legs.
const HER = [30, 16];
const head = ['.0000.', '00550.', '.7557.', '..55..'];
const legs = ['.7777.', '.7..7.', '.4..4.', '.4..4.', '.4..4.', '44..44'];
const body = {
  idle: ['.4444.', '544445', '544445', '.4444.', ...legs],
  // right arm up (the throw, the wave)
  up: ['.44445', '54444.', '54444.', '.4444.', ...legs],
  // both hands on the coconut
  sip: ['.44445', '54444.', '54444.', '.4444.', ...legs],
};
const throwArm = ['......', '.....5', '.....5', '.....5'];      // beside the head rows
const waveA = ['.....5', '.....5', '.....5', '.....5', '......'];
const waveB = ['......5', '......5', '.....5.', '.....5.', '.......'];
const sipHead = ['.0000.', '00550.', '.7566.', '..566.'];          // a young green coconut at her mouth
const bottleHand = { x: HER[0] + 5, y: HER[1] - 1 };

function spriteGrid(rows) { const g = new Grid(rows[0].length, rows.length); g.sprite(rows, 0, 0); return g; }

// ------------------------------------------------------------------ the life loop
// Bar n (1-based) starts at 3(n-1) s.
const B = (n) => (n - 1) * BAR;
const TL = {
  idle: [[0, B(5)], [B(5) + 1.5, B(11)], [B(17), T]],
  throw: [[B(5), B(5) + 1.5]],
  sip: [[B(11), B(15)]],
  wave: [[B(15), B(17)]],
  ship: [B(11) + 2.25, B(14) + 2.25],        // enters, leaves
};
// The bottle: at her feet, in her hand, flying, bobbing, coming straight back.
const bottle = [];
const LYING = ['114'];
bottle.push({ rows: LYING, x: 37, y: 29, iv: [[0, B(5)], [B(9), T]] });
bottle.push({ rows: ['5', '1'], x: bottleHand.x, y: bottleHand.y, iv: [[B(5), B(5) + 0.75]] });
const flight = [[33, 11], [29, 8], [25, 7], [21, 8], [17, 11], [14, 15], [12, 19]];
flight.forEach(([x, y], i) => {
  const t0 = B(5) + 0.75 + i * 0.25;
  bottle.push({ rows: ['5', '1'], x, y, iv: [[t0, t0 + 0.25]] });
});
const tSplash = B(5) + 0.75 + flight.length * 0.25;
bottle.push({ rows: ['7.7', '.7.'], x: 11, y: 21, iv: [[tSplash, tSplash + 0.5]] });
// Bobbing on the beat until bar 8, then straight back in eight steps.
const bobA = [], bobB = [];
for (let t = tSplash; t < B(8) - 1e-9; t += BEAT) {
  const half = Math.min(t + BEAT / 2, B(8));
  bobA.push([t, half]); if (half < B(8)) bobB.push([half, Math.min(t + BEAT, B(8))]);
}
bottle.push({ rows: ['5', '1'], x: 12, y: 20, iv: bobA });
bottle.push({ rows: ['5', '1'], x: 12, y: 21, iv: bobB });
const back8 = [[14, 21], [17, 22], [20, 23], [23, 25], [26, 27], [29, 30], [33, 31], [37, 29]];
back8.forEach(([x, y], i) => {
  const t0 = B(8) + i * (BAR / back8.length);
  bottle.push({ rows: i < back8.length - 1 ? ['5', '1'] : LYING, x, y, iv: [[t0, t0 + BAR / back8.length]] });
});
// that last step lands it lying down; it then waits at her feet (first entry)

// The NOW line: deadpan narration, one message per stretch of bars.
const NOW = [
  [0, B(5), 'idle. nodding. on the beat.'],
  [B(5), B(6), 'message in a bottle: posted.'],
  [B(6), B(8), 'awaiting a reply from the sea.'],
  [B(8), B(9), 'reply incoming.'],
  [B(9), B(11), "reply received. it's her bottle."],
  [B(11), B(13), 'coconut. eyes closed.'],
  [B(13), B(15), 'ships seen today: 1. by her: 0.'],
  [B(15), B(17), 'waving for rescue. at nothing.'],
  [B(17), T, 'nothing happening. as scheduled.'],
];
// The still frame for reduced motion and anything that does not animate.
const STILL = B(18) + BEAT / 2;

// ------------------------------------------------------------------ main page content
function mainPage() {
  const p = new Page();
  // row 0: status row, the line-state letter only
  p.inv(0, 39, 'C');
  // rows 1-2: the title band
  p.band(1, 6); p.band(2, 6);
  p.big(1, 5, 'CASTAWAY'.split('').join(' '), 0, 6);
  // row 3: provider, page, price
  p.band(3, 2);
  p.text(3, 1, 'Lagoon Pages', 7);
  p.text(3, 15, '10 h of island', 5);
  p.text(3, 31, '0.00/min', 6);
  // rows 4-15: the picture (drawn separately); mark the rows as used
  for (let r = PIC_ROW; r < PIC_ROW + 12; r++) for (let c = 0; c < COLS; c++) p.used[r][c] = true;
  // row 16: NOW line band
  p.band(16, 1);
  p.inv(16, 1, ' NOW ');
  // rows 18-21: the menu
  const item = (row, col, n, label, hint) => {
    p.inv(row, col, String(n));
    p.text(row, col + 2, label, 7);
    p.text(row + 1, col + 2, hint, 4);
  };
  item(18, 1, 1, 'the island', 'one woman, 10 h');
  item(18, 21, 2, 'the timetable', '90+ activities');
  item(20, 1, 3, 'the sound', 'all synthesized');
  item(20, 21, 4, 'run it', 'tools/serve.py');
  // row 23: the input line
  p.text(23, 10, 'type a number', 6);
  p.text(23, 26, '.', 7);
  p.text(23, 29, 'then', 6);
  p.inv(23, 34, ' SEND ');
  // row 24: the key legend
  p.inv(24, 1, ' NEXT ');
  p.text(24, 8, 'page 2', 5);
  p.inv(24, 17, ' REPEAT ');
  p.text(24, 26, 'ten more hours', 5);
  return p;
}

// ------------------------------------------------------------------ bezel geometry
const PAD = 9;                 // black border inside the glass
const SIDE = 16, TOPM = 18, BOTM = 40;
const GW = PW + PAD * 2, GH = PH + PAD * 2;
const W = GW + SIDE * 2, H = GH + TOPM + BOTM;
const GX = SIDE, GY = TOPM;

// css/kf: where to add the one animation on the case (REPEAT pressed as the loop restarts)
function bezel(css = [], kf = []) {
  const out = [];
  // shadow and body
  out.push(`<rect x="1.5" y="3" width="${W - 3}" height="${H - 3}" rx="18" fill="#000" opacity=".28"/>`);
  out.push(`<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 3}" rx="18" fill="url(#beige)" stroke="#7d7363" stroke-width="1"/>`);
  out.push(`<rect x="3" y="2.5" width="${W - 6}" height="${H - 8}" rx="16" fill="none" stroke="#fff8ea" stroke-opacity=".55" stroke-width="1"/>`);
  // recess round the glass
  out.push(`<rect x="${GX - 6}" y="${GY - 6}" width="${GW + 12}" height="${GH + 12}" rx="14" fill="url(#recess)"/>`);
  out.push(`<rect x="${GX - 6}" y="${GY - 6}" width="${GW + 12}" height="${GH + 12}" rx="14" fill="none" stroke="#fffaf0" stroke-opacity=".5" stroke-width="1" transform="translate(0 1)"/>`);
  // maker's badge and power light on the top rail
  const badge = smallText('BEACHCOMBER 40', 0, 0);
  const bx = W - SIDE - 2 - badge.w * 1, by = 7;
  out.push(`<path d="${badge.d}" transform="translate(${bx} ${by})" fill="#5e5547"/>`);
  out.push(`<path d="${badge.d}" transform="translate(${bx} ${by + 0.6})" fill="#fff8ea" opacity=".5"/>`);
  out.push(`<circle cx="${SIDE + 4}" cy="${by + 2.5}" r="2.2" fill="#55524a"/><circle cx="${SIDE + 4}" cy="${by + 2.5}" r="1.4" fill="#e9ffe0" opacity=".9"/>`);
  out.push(`<path d="${smallText('ON', 0, 0).d}" transform="translate(${SIDE + 9} ${by})" fill="#5e5547"/>`);
  // the nine function keys
  const keys = ['SEND', 'BACK', 'REPEAT', 'GUIDE', 'CANCEL', 'INDEX', 'CORRECT', 'NEXT', 'END'];
  const kGap = 4, kH = 15, kY = GY + GH + 13;
  const kW = (W - SIDE * 2 - kGap * (keys.length - 1)) / keys.length;
  keys.forEach((k, i) => {
    const x = SIDE + i * (kW + kGap);
    const dark = k === 'SEND';
    out.push(`<rect x="${r2(x)}" y="${kY + 1.5}" width="${r2(kW)}" height="${kH}" rx="3" fill="${dark ? '#3e3a33' : '#8f8572'}"/>`);
    if (k === 'REPEAT') out.push('<g class="kr">');
    out.push(`<rect x="${r2(x)}" y="${kY}" width="${r2(kW)}" height="${kH}" rx="3" fill="${dark ? '#5d584f' : '#efe9dc'}"/>`);
    out.push(`<rect x="${r2(x + 1.5)}" y="${kY + 1}" width="${r2(kW - 3)}" height="${kH - 4}" rx="2" fill="${dark ? '#6b665c' : '#f8f4ea'}"/>`);
    const t = smallText(k, 0, 0);
    out.push(`<path d="${t.d}" transform="translate(${r2(x + (kW - t.w) / 2)} ${kY + 4})" fill="${dark ? '#f1ece0' : '#5b5447'}"/>`);
    if (k === 'REPEAT') out.push('</g>');
  });
  // every loop ends with somebody pressing REPEAT: ten more hours, please
  kf.push(`@keyframes krep{0%{transform:translateY(0)}${pct(T - 0.5)}{transform:translateY(1.3px)}100%{transform:translateY(1.3px)}}`);
  css.push(`.kr{animation:${anim('krep', T)}}`);
  return out.join('');
}

// ------------------------------------------------------------------ build the main SVG
function buildMain() {
  const page = mainPage();
  const used = new Set();
  const css = [];
  const kf = [];
  let uid = 0;
  const cls = () => `a${(uid++).toString(36)}`;
  // a group that is visible during the given intervals of the loop
  const visGroup = (iv, inner, period = T) => {
    const c = cls();
    kf.push(opacityKF(`k${c}`, iv, period));
    const still = inside(iv, STILL % period);
    css.push(`.${c}{opacity:${still ? 1 : 0};animation:${anim(`k${c}`, period)}}`);
    return `<g class="${c}">${inner}</g>`;
  };

  // --- picture
  const pic = [];
  pic.push(gridPaths(back));
  // clouds: two copies, stepped right one sextel per beat, a full width a loop
  const cl = gridPaths(clouds);
  kf.push(`@keyframes kcl{from{transform:translateX(0)}to{transform:translateX(${PW}px)}}`);
  const stillShift = Math.floor(STILL / BEAT) * 4;
  css.push(`.cl{transform:translateX(${stillShift}px);animation:${anim('kcl', T, { timing: `steps(${SW},end)` })}}`);
  pic.push(`<g class="cl"><g>${cl}</g><g transform="translate(${-PW} 0)">${cl}</g></g>`);
  // the ship: crosses the horizon right to left, one sextel a step
  const ship = spriteGrid([
    '.......0.....',
    '....7770.....',
    '.11111111111.',
    '..111111111..',
  ]);
  const shipY = HORIZON - 3, x0 = SW + 2, x1 = -15;
  const [s0, s1] = TL.ship;
  const nSteps = x0 - x1;
  kf.push(`@keyframes kship{0%{transform:translateX(${x0 * 4}px);animation-timing-function:step-end}` +
    `${pct(s0)}{transform:translateX(${x0 * 4}px);animation-timing-function:steps(${nSteps},end)}` +
    `${pct(s1)}{transform:translateX(${x1 * 4}px);animation-timing-function:step-end}100%{transform:translateX(${x1 * 4}px)}}`);
  css.push(`.sh{transform:translateX(${x1 * 4}px);animation:${anim('kship', T, { timing: 'step-end' })}}`);
  pic.push(`<g class="sh">${gridPaths(ship, 0, shipY)}</g>`);
  // the island, palm and raft
  pic.push(gridPaths(front));
  // lapping foam: two dash phases swapping on the beat
  // (a broken ring just outside the foam, on the shallows only)
  const lapA = new Grid(SW, SHH), lapB = new Grid(SW, SHH);
  for (let x = 0; x < SW; x++) for (let y = 0; y < SHH; y++) {
    const dx = (x - IX) / 22.6, dy = (y - IY - 0.3) / 5.4;
    const d = dx * dx + dy * dy;
    if (d > 0.8 && d <= 1.0 && front.get(x, y) === 4) {
      const ph = Math.floor((x + 40) / 3) % 2;
      (ph ? lapA : lapB).set(x, y, 7);
    }
  }
  pic.push(visGroup([[0, BEAT / 2]], gridPaths(lapA), BEAT));
  pic.push(visGroup([[BEAT / 2, BEAT]], gridPaths(lapB), BEAT));
  // her: idle (nodding), throw, sip, wave
  const [hx, hy] = HER;
  const idleBody = gridPaths(spriteGrid(body.idle), hx, hy + 4);
  const headUp = gridPaths(spriteGrid(head), hx, hy);
  const headDown = gridPaths(spriteGrid(['.....', ...head]), hx, hy);
  const nod = visGroup([[0, 0.3]], headDown, BEAT) + visGroup([[0.3, BEAT]], headUp, BEAT);
  pic.push(visGroup(TL.idle, idleBody + nod));
  pic.push(visGroup(TL.throw, gridPaths(spriteGrid(body.up), hx, hy + 4) + headUp + gridPaths(spriteGrid(throwArm), hx, hy)));
  pic.push(visGroup(TL.sip, gridPaths(spriteGrid(body.sip), hx, hy + 4) + gridPaths(spriteGrid(sipHead), hx, hy)));
  const waveBody = gridPaths(spriteGrid(body.up), hx, hy + 4) + headUp;
  pic.push(visGroup(TL.wave, waveBody +
    visGroup([[0, BEAT / 2]], gridPaths(spriteGrid(waveA), hx, hy), BEAT) +
    visGroup([[BEAT / 2, BEAT]], gridPaths(spriteGrid(waveB), hx, hy), BEAT)));
  // the bottle
  for (const b of bottle) pic.push(visGroup(b.iv, gridPaths(spriteGrid(b.rows), b.x, b.y)));

  // --- the NOW line, retyped at 120 cps for every new message
  const nowGroups = NOW.map(([a, b, msg]) => {
    if (msg.length > 32) throw new Error(`NOW message too long: ${msg}`);
    const list = [...msg].map((ch, i) => ({ ch, x: (7 + i) * CW, y: 16 * CH, fg: 6, s: [1, 1] })).filter((g) => g.ch !== ' ');
    return visGroup([[a, b]], glyphUses(list, used));
  }).join('');
  // the type-on cover over the message area
  {
    const frames = [];
    frames.push(`0%{transform:translateX(0);animation-timing-function:steps(${NOW[0][2].length},end)}`);
    NOW.forEach(([a, , msg], i) => {
      const dur = msg.length / CPS;
      if (i > 0) frames.push(`${pct(a)}{transform:translateX(0);animation-timing-function:steps(${msg.length},end)}`);
      frames.push(`${pct(a + dur)}{transform:translateX(${msg.length * CW}px);animation-timing-function:step-end}`);
      frames.push(`${pct(a + dur + 0.001)}{transform:translateX(${PW}px);animation-timing-function:step-end}`);
    });
    frames.push(`100%{transform:translateX(${PW}px)}`);
    kf.push(`@keyframes ktype{${frames.join('')}}`);
    css.push(`.ty{transform:translateX(${PW}px);animation:${anim('ktype', T, { timing: 'step-end' })}}`);
  }
  const typeCover = `<rect class="ty c1" x="${7 * CW}" y="${16 * CH}" width="${33 * CW}" height="${CH}"/>`;

  // --- cursor: a block on the input dot, blinking once a second
  kf.push(`@keyframes kcur{0%{opacity:1}50%{opacity:0}100%{opacity:0}}`);
  css.push(`.cu{animation:${anim('kcur', 1)}}`);
  const cursor = `<rect class="cu c7" x="${26 * CW}" y="${23 * CH}" width="${CW}" height="${CH}"/>` +
    `<use class="cu c0" href="#g2e" x="${26 * CW}" y="${23 * CH}"/>`;
  used.add('.');

  // --- the paint: one cover per row, sliding off a cell at a time, top to bottom
  // (Each cover takes one step more than the row has cells, so the row is
  // fully shown one step before the end: some browsers hold a finished
  // steps() animation on its last-but-one step.)
  const covers = [];
  const kpDone = new Set();
  let t = 0.45;
  for (let r = 3; r < ROWS; r++) {
    const n = page.lastUsed(r);
    if (n === 0) { t += 2 / CPS; continue; }
    const m = n + 1, dur = m / CPS;
    if (!kpDone.has(m)) {
      kpDone.add(m);
      kf.push(`@keyframes kp${m}{from{transform:translateX(0);visibility:visible}to{transform:translateX(${m * CW}px);visibility:hidden}}`);
    }
    const c = `p${r}`;
    css.push(`.${c}{animation:${anim(`kp${m}`, dur, { delay: t, timing: `steps(${m},end)`, iter: 1, fill: 'both' })}}`);
    // each cover reaches a little into the next row, so no seam shows between them
    covers.push(`<rect class="cv c0 ${c}" x="0" y="${r * CH}" width="${PW}" height="${CH + 0.8}"/>`);
    t += dur + 3 / CPS;     // plus a few bytes of cursor positioning per row
  }
  const paintEnd = t;

  // --- assemble
  const bezelSvg = bezel(css, kf);
  // --- the line-state letter: F (not connected) for a moment, then C, once.
  // (Three keyframes, so the switch happens mid-animation, not on its last frame.)
  const si = page.glyphs.findIndex((g) => g.row === 0 && g.ch === 'C');
  const sg = page.glyphs.splice(si, 1)[0];
  kf.push('@keyframes kstF{0%{opacity:1}50%{opacity:0}100%{opacity:0}}@keyframes kstC{0%{opacity:0}50%{opacity:1}100%{opacity:1}}');
  css.push(`.stF{opacity:0;animation:${anim('kstF', 0.8, { iter: 1 })}}.stC{animation:${anim('kstC', 0.8, { iter: 1 })}}`);
  const status = `<g class="stF">${glyphUses([{ ...sg, ch: 'F' }], used)}</g><g class="stC">${glyphUses([sg], used)}</g>`;
  const pageGlyphs = glyphUses(page.glyphs, used);
  const defs = glyphDefs(used);
  const glass = `
<defs>
<linearGradient id="beige" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e6dcc6"/><stop offset=".55" stop-color="#d8ccb2"/><stop offset="1" stop-color="#c3b597"/></linearGradient>
<linearGradient id="recess" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a2722"/><stop offset="1" stop-color="#4a453c"/></linearGradient>
<radialGradient id="vig" cx=".5" cy=".5" r=".72"><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></radialGradient>
<linearGradient id="sheen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".10"/><stop offset=".45" stop-color="#fff" stop-opacity=".02"/><stop offset=".46" stop-color="#fff" stop-opacity="0"/></linearGradient>
<pattern id="scan" width="4" height="1" patternUnits="userSpaceOnUse"><rect width="4" height=".35" fill="#000" opacity=".16"/></pattern>
<clipPath id="gl"><rect x="${GX}" y="${GY}" width="${GW}" height="${GH}" rx="12"/></clipPath>
<clipPath id="pg"><rect width="${PW}" height="${PH}"/></clipPath>
${defs}
</defs>`;
  const style = `<style>
.c0{fill:${GREY[0]}}.c1{fill:${GREY[1]}}.c2{fill:${GREY[2]}}.c3{fill:${GREY[3]}}.c4{fill:${GREY[4]}}.c5{fill:${GREY[5]}}.c6{fill:${GREY[6]}}.c7{fill:${GREY[7]}}
.cv{transform:translateX(${PW + 10}px)}
${css.join('\n')}
${kf.join('\n')}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}
</style>`;
  const vb = CROP ? CROP.join(' ') : `0 0 ${W} ${H}`;
  const Z = +(opt('zoom') || 4);
  const zw = CROP ? CROP[2] * Z : W * 2, zh = CROP ? CROP[3] * Z : H * 2;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="${zw}" height="${zh}" role="img" aria-labelledby="t">
<title id="t">CASTAWAY on Lagoon Pages: a viewdata service page on a beige terminal</title>
${style}${glass}
${bezelSvg}
<g clip-path="url(#gl)">
<rect x="${GX}" y="${GY}" width="${GW}" height="${GH}" fill="${GREY[0]}"/>
<g transform="translate(${GX + PAD} ${GY + PAD})">
<g clip-path="url(#pg)">
${bgPaths(page)}
${pic.join('\n')}
${pageGlyphs}
${status}
${nowGroups}
${typeCover}
${cursor}
${covers.join('')}
</g>
</g>
<rect x="${GX}" y="${GY}" width="${GW}" height="${GH}" fill="url(#scan)"/>
<rect x="${GX}" y="${GY}" width="${GW}" height="${GH}" fill="url(#vig)"/>
<rect x="${GX}" y="${GY}" width="${GW}" height="${GH}" fill="url(#sheen)"/>
</g>
</svg>
`;
  return { svg, paintEnd };
}

// ------------------------------------------------------------------ page 2: the timetable
function buildTimetable() {
  const p = new Page();
  p.inv(0, 39, 'C');
  p.band(1, 4); p.band(2, 4);
  p.big(1, 2, 'TIMETABLE', 7, 4);
  p.text(1, 31, 'page 2', 1, 4);
  p.band(3, 2);
  p.text(3, 1, 'Lagoon Pages', 7);
  p.text(3, 15, 'one island', 5);
  p.text(3, 31, '0.00/min', 6);
  // the four timers
  p.band(5, 1);
  p.text(5, 1, 'TIMER', 6); p.text(5, 13, 'COMES ROUND', 6); p.text(5, 32, 'PER 10 H', 6);
  const tiers = [
    ['regular', 'every 2-5 min', '~155'],
    ['occasional', 'every 12-25 min', '~30'],
    ['rare', 'every 30-60 min', '~13'],
    ['super rare', 'every 3-6 h', '~2'],
  ];
  tiers.forEach(([a, b, c], i) => {
    p.text(6 + i, 1, a, 7); p.text(6 + i, 13, b, 5); p.text(6 + i, 39 - c.length, c, 7);
  });
  p.text(10, 1, 'idle', 4); p.text(10, 13, 'the other two thirds', 4);
  // arrivals and departures
  p.inv(12, 1, ' ARRIVALS ', 0, 6);
  p.inv(12, 21, ' DEPARTURES ', 0, 6);
  const arr = ['turtle, visiting', 'cat, on a crate', 'drone: headphones', 'bottle: a reply', 'shark, nodding', 'tour boat, selfies'];
  const dep = ['bottle (comes back)', 'cat, on a crate', 'sandcastle, by tide', 'coconut, with crab', 'bro, carving off', 'her (coffee run)'];
  arr.forEach((s, i) => p.text(13 + i, 1, s, 7));
  dep.forEach((s, i) => p.text(13 + i, 21, s, 7));
  p.text(13 + 6, 1, 'ship: unnoticed', 5);
  p.text(13 + 6, 21, 'ship: unnoticed', 5);
  // footnotes
  p.text(21, 1, 'every start waits for the next bar: 3 s', 4);
  p.text(22, 1, 'default run 10:00:00, seed 1992', 4);
  p.inv(24, 1, ' BACK ');
  p.text(24, 8, 'page 1', 5);
  p.inv(24, 17, ' REPEAT ');
  p.text(24, 26, 'ten more hours', 5);

  const used = new Set();
  const glyphs = glyphUses(p.glyphs, used);
  const defs = glyphDefs(used);
  const M = 10;
  const VW = PW + M * 2, VH = PH + M * 2;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VW} ${VH}" width="${VW * 2}" height="${VH * 2}" role="img" aria-labelledby="t">
<title id="t">Lagoon Pages, page 2: the Castaway timetable</title>
<style>
.c0{fill:${GREY[0]}}.c1{fill:${GREY[1]}}.c2{fill:${GREY[2]}}.c3{fill:${GREY[3]}}.c4{fill:${GREY[4]}}.c5{fill:${GREY[5]}}.c6{fill:${GREY[6]}}.c7{fill:${GREY[7]}}
</style>
<defs>
<radialGradient id="vig" cx=".5" cy=".5" r=".72"><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".5"/></radialGradient>
<pattern id="scan" width="4" height="1" patternUnits="userSpaceOnUse"><rect width="4" height=".35" fill="#000" opacity=".16"/></pattern>
${defs}
</defs>
<rect x="0.5" y="0.5" width="${VW - 1}" height="${VH - 1}" rx="12" fill="${GREY[0]}" stroke="#4a453c"/>
<g transform="translate(${M} ${M})">
${bgPaths(p)}
${glyphs}
</g>
<rect x="0" y="0" width="${VW}" height="${VH}" rx="12" fill="url(#scan)"/>
<rect x="0" y="0" width="${VW}" height="${VH}" rx="12" fill="url(#vig)"/>
</svg>
`;
  return svg;
}

// ------------------------------------------------------------------ write
fs.mkdirSync(path.dirname(OUT_MAIN), { recursive: true });
const { svg, paintEnd } = buildMain();
fs.writeFileSync(OUT_MAIN, svg);
console.log(`${path.relative(process.cwd(), OUT_MAIN)}  ${(svg.length / 1024).toFixed(1)} KB  (page painted by ${paintEnd.toFixed(2)} s)`);
if (AT === null) {
  const p2 = buildTimetable();
  fs.writeFileSync(OUT_P2, p2);
  console.log(`${path.relative(process.cwd(), OUT_P2)}  ${(p2.length / 1024).toFixed(1)} KB`);
}
