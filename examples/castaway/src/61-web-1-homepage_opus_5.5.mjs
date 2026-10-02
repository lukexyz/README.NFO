#!/usr/bin/env node
// Web 1.0 homepage: README header kit generator for CASTAWAY.
//
//   node examples/castaway/src/61-web-1-homepage_opus_5.5.mjs
//
// Writes every examples/castaway/assets/61-web-1-homepage_opus_5.5*.svg:
// the banner, a rainbow divider, a hit counter, a construction strip, a
// NEW! burst, a tumbling bottle and twelve 88x31 buttons. Plain Node, no
// dependencies, no clock, no Math.random: the same bytes on every run. The
// .md beside the assets is hand-written, not generated.
// Pass --sheet=<dir> to also write a zoomed specimen of the fonts and sprites.
//
// The style (catalogue entry vap-12) is the free personal homepage of the
// late 1990s: a tiled starry background, a centred serif welcome line, a 3D
// logo from a free logo generator in clashing colours, an animated rainbow
// rule, a NEW! starburst, an under-construction sign with a digging figure
// and flashing lamps, a scrolling marquee, an odometer hit counter and rows
// of 88x31 buttons. Every letterform, sprite, button and colour here is drawn
// fresh for this file; no archived GIF, button, site or font is reproduced.
//
// The joke: Castaway is a ten-hour video of a tiny island where almost
// nothing happens, so it gets the homepage of someone with a great deal of
// time on their hands. The photo of "my island!!!" is annotated in red, the
// way people annotated photos in a paint program: "me!", "my palm", "my
// raft". Every 24 seconds she climbs the palm for the one bar of signal it
// takes to upload the page, and the label follows her up: "still me!". The
// page is under construction, and so is the sandcastle on the sign. The hit
// counter says 000001 (no video is published yet) and keeps trying for 2.
//
// Timing is the theme's: 80 BPM, a 0.75 s beat, 3 s bars.
//   banner photo      8 bars = 24 s: 5 bars nodding on the sand, 2 bars up
//                     the palm with the phone, 1 bar back down
//   nod, lamps, NEW!  on the beat (0.75 s), well under 3 flashes a second
//   logo rainbow      one band step per beat, 6 colours = 4.5 s a lap
//   marquee           1 px steps, one lap = text width / 20 px per second
//   counter           8 s: tries for visitor 2, slides back to 1
//
// GitHub shows these through <img>: no scripts, no fonts. All text is drawn
// as merged pixel rects from the bitmap fonts below. Under
// prefers-reduced-motion every animation stops on a complete, readable frame.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '61-web-1-homepage_opus_5.5';
const ASSETS = path.resolve(here, '../assets');
const outFile = (suffix = '') => path.join(ASSETS, `${SLUG}${suffix}.svg`);
const SHEET = (process.argv.find((a) => a.startsWith('--sheet=')) || '').slice(8);

// ------------------------------------------------------------------ facts
// Checked 2026-10-02 against D:/python/castaway (read-only): activities.toml
// has more than 90 activities (94 that day: 81 on four timers, 13 chained
// follow-ups), so the copy says "most of them on four timers". The timers:
// regular 2-5 min, occasional 12-25 min, rare 30-60 min, super rare 3-6 h;
// run 10:00:00, seed 1992 ("same seed, same schedule": tools/schedule.py);
// starts snap to 3 s bars. tools/make_audio.py: 80 BPM, F major, 20 bars of
// 3 s = a 60 s theme; more than 150 sound files (181 that day). 1080p, 30 fps.

const BEAT = 0.75;
const BAR = 4 * BEAT;

// ------------------------------------------------------------------ numbers
const n = (v) => (Number.isInteger(v) ? String(v) : String(+v.toFixed(3)));
const pct = (t, T) => `${+((100 * t) / T).toFixed(4)}%`;
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// ------------------------------------------------------------------ pixels
// A Pix is a sparse paint surface: the last colour written to a cell wins.
// Colours are '#rrggbb', or '.name' for a cell whose fill comes from a CSS
// class (the logo's cycling rainbow). svg() merges each colour's cells into
// horizontal runs and stacks identical runs on consecutive rows.
const OFF = 4096;
const STRIDE = 16384;
const KEY = (x, y) => (y + OFF) * STRIDE + (x + OFF);
const KX = (k) => (k % STRIDE) - OFF;
const KY = (k) => Math.floor(k / STRIDE) - OFF;

function cellsPath(keys) {
  const rows = new Map();
  for (const k of keys) {
    const y = KY(k);
    if (!rows.has(y)) rows.set(y, []);
    rows.get(y).push(KX(k));
  }
  const rects = [];
  let active = new Map();
  let prevY = null;
  for (const y of [...rows.keys()].sort((a, b) => a - b)) {
    const xs = rows.get(y).sort((a, b) => a - b);
    const next = new Map();
    for (let i = 0; i < xs.length;) {
      let j = i;
      while (j + 1 < xs.length && xs[j + 1] === xs[j] + 1) j++;
      const key = `${xs[i]},${xs[j]}`;
      const r = prevY === y - 1 ? active.get(key) : null;
      if (r) { r.h++; next.set(key, r); } else {
        const nr = { x: xs[i], y, w: xs[j] - xs[i] + 1, h: 1 };
        rects.push(nr);
        next.set(key, nr);
      }
      i = j + 1;
    }
    active = next;
    prevY = y;
  }
  // relative moves: after z the pen is back at the last rect's corner
  let d = '';
  let px = 0;
  let py = 0;
  rects.forEach((r, i) => {
    const dx = i ? r.x - px : r.x;
    const dy = i ? r.y - py : r.y;
    d += `${i ? 'm' : 'M'}${dx}${dy < 0 ? '' : ' '}${dy}h${r.w}v${r.h}h-${r.w}z`;
    px = r.x;
    py = r.y;
  });
  return d;
}
const short = (h) => (/^#(.)\1(.)\2(.)\3$/i.test(h) ? `#${h[1]}${h[3]}${h[5]}` : h).toLowerCase();

class Pix {
  constructor() { this.m = new Map(); }
  set(c, x, y) {
    const k = KEY(Math.round(x), Math.round(y));
    if (c == null) this.m.delete(k); else this.m.set(k, c);
  }
  get(x, y) { return this.m.get(KEY(x, y)); }
  has(x, y) { return this.m.has(KEY(x, y)); }
  rect(c, x, y, w, h) { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(c, x + i, y + j); }
  frame(c, x, y, w, h) { this.rect(c, x, y, w, 1); this.rect(c, x, y + h - 1, w, 1); this.rect(c, x, y, 1, h); this.rect(c, x + w - 1, y, 1, h); }
  line(c, x0, y0, x1, y1) {
    let dx = Math.abs(x1 - x0); let dy = -Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1; const sy = y0 < y1 ? 1 : -1;
    let e = dx + dy;
    for (;;) {
      this.set(c, x0, y0);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * e;
      if (e2 >= dy) { e += dy; x0 += sx; }
      if (e2 <= dx) { e += dx; y0 += sy; }
    }
  }
  ellipse(c, cx, cy, rx, ry) {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        const u = (x + 0.5 - cx) / rx; const v = (y + 0.5 - cy) / ry;
        if (u * u + v * v <= 1) this.set(c, x, y);
      }
    }
  }
  // rows of characters; pal maps a character to a colour ('.' and ' ' skip)
  sprite(rows, pal, x, y, flip = false) {
    const w = Math.max(...rows.map((r) => r.length));
    rows.forEach((row, j) => [...row].forEach((ch, i) => {
      if (ch === '.' || ch === ' ') return;
      const c = pal[ch];
      if (c === undefined) throw new Error(`palette lacks ${ch}`);
      this.set(c, flip ? x + w - 1 - i : x + i, y + j);
    }));
  }
  text(font, s, x, y, c, o = {}) { return drawText(this, font, s, x, y, c, o); }
  merge(p) { for (const [k, c] of p.m) this.m.set(k, c); return this; }
  svg(attrs = '') {
    const by = new Map();
    for (const [k, c] of this.m) {
      if (!by.has(c)) by.set(c, []);
      by.get(c).push(k);
    }
    let o = '';
    for (const [c, ks] of by) {
      const paint = c.startsWith('.') ? `class="${c.slice(1)}"` : `fill="${short(c)}"`;
      o += `<path ${paint}${attrs} d="${cellsPath(ks)}"/>`;
    }
    return o;
  }
}

// ------------------------------------------------------------------ fonts
// Each font: glyph rows top-down, '#' lit. `asc` is the number of rows down
// to the baseline; rows past it are descenders.
function makeFont(name, asc, desc, space, glyphs) { return { name, asc, desc, space, g: glyphs }; }
function glyphOf(font, ch) {
  const g = font.g[ch];
  if (!g) throw new Error(`${font.name} lacks ${JSON.stringify(ch)}`);
  return g;
}
const gw = (g) => Math.max(0, ...g.map((r) => r.length));
function textWidth(font, s, o = {}) {
  let w = 0;
  const chars = [...s];
  chars.forEach((ch, i) => {
    if (ch === ' ') w += font.space; else w += gw(glyphOf(font, ch)) + (o.bold ? 1 : 0);
    if (i < chars.length - 1) w += o.track ?? 1;
  });
  return w;
}
// y is the top of the ascender line; returns the advance
function drawText(p, font, s, x, y, c, o = {}) {
  let cx = x;
  const chars = [...s];
  chars.forEach((ch, i) => {
    if (ch === ' ') { cx += font.space; } else {
      const g = glyphOf(font, ch);
      g.forEach((row, j) => [...row].forEach((v, k) => {
        if (v !== '#') return;
        p.set(c, cx + k, y + j);
        if (o.bold) p.set(c, cx + k + 1, y + j);
      }));
      cx += gw(g) + (o.bold ? 1 : 0);
    }
    if (i < chars.length - 1) cx += o.track ?? 1;
  });
  if (o.underline) p.rect(o.underline === true ? c : o.underline, x, y + font.asc + 1, cx - x, 1);
  return cx - x;
}
const centreText = (p, font, s, cx, y, c, o = {}) => drawText(p, font, s, Math.round(cx - textWidth(font, s, o) / 2), y, c, o);
// Long runs of text (the marquee) define each glyph once and place it with
// <use>: a few bytes a letter instead of a few rects a letter.
class GlyphBank {
  constructor(prefix) { this.p = prefix; this.ids = new Map(); }
  id(font, ch, bold) {
    const k = `${font.name}|${ch}|${bold ? 1 : 0}`;
    if (!this.ids.has(k)) this.ids.set(k, { id: `${this.p}${this.ids.size.toString(36)}`, font, ch, bold });
    return this.ids.get(k).id;
  }
  defs() {
    return [...this.ids.values()].map(({ id, font, ch, bold }) => {
      const q = new Pix();
      drawText(q, font, ch, 0, 0, '#000', { bold });
      return `<path id="${id}" d="${cellsPath([...q.m.keys()])}"/>`;
    }).join('');
  }
}
function useText(bank, font, s, x, y, colour, o = {}) {
  let out = '';
  let cx = 0;
  const chars = [...s];
  chars.forEach((ch, i) => {
    if (ch === ' ') cx += font.space;
    else {
      out += `<use href="#${bank.id(font, ch, o.bold)}"${cx ? ` x="${cx}"` : ''}/>`;
      cx += gw(glyphOf(font, ch)) + (o.bold ? 1 : 0);
    }
    if (i < chars.length - 1) cx += o.track ?? 1;
  });
  return { svg: `<g fill="${short(colour)}" transform="translate(${x} ${y})">${out}</g>`, w: cx };
}

// SERIF: a bold Roman at 9 px caps, the way a browser's default serif face
// came out at heading sizes on an unsmoothed 1998 screen. Row 0 is the
// ascender line, caps start on row 1, the baseline is under row 9.
const SERIF = makeFont('serif', 10, 3, 4, {
  A: ['', '....#....', '...###...', '...###...', '..#.###..', '..#..###.', '.#######.', '.#....###', '#......##', '###..####'],
  B: ['', '######..', '.##..##.', '.##..##.', '.##..##.', '.#####..', '.##..##.', '.##..##.', '.##..##.', '######..'],
  C: ['', '..####.#', '.##...##', '##.....#', '##......', '##......', '##......', '##......', '.##....#', '..#####.'],
  D: ['', '######...', '.##..##..', '.##...##.', '.##...##.', '.##...##.', '.##...##.', '.##...##.', '.##..##..', '######...'],
  E: ['', '#######', '.##...#', '.##....', '.##..#.', '.#####.', '.##..#.', '.##....', '.##...#', '#######'],
  F: ['', '#######', '.##...#', '.##....', '.##..#.', '.#####.', '.##..#.', '.##....', '.##....', '####...'],
  G: ['', '..####.#.', '.##...##.', '##.....#.', '##.......', '##..#####', '##....##.', '##....##.', '.##...##.', '..####...'],
  H: ['', '####..####', '.##....##.', '.##....##.', '.##....##.', '.########.', '.##....##.', '.##....##.', '.##....##.', '####..####'],
  I: ['', '####', '.##.', '.##.', '.##.', '.##.', '.##.', '.##.', '.##.', '####'],
  J: ['', '..####', '...##.', '...##.', '...##.', '...##.', '...##.', '#..##.', '##.##.', '.###..'],
  K: ['', '####.###', '.##...#.', '.##..#..', '.##.#...', '.####...', '.##.##..', '.##..##.', '.##...##', '####.###'],
  L: ['', '####...', '.##....', '.##....', '.##....', '.##....', '.##....', '.##....', '.##...#', '#######'],
  M: ['', '###.....###', '.##.....##.', '.###...###.', '.#.##.#.##.', '.#.##.#.##.', '.#..##..##.', '.#..##..##.', '.#..#...##.', '###.#..####'],
  N: ['', '###...###', '.##....#.', '.###...#.', '.#.##..#.', '.#..##.#.', '.#...###.', '.#....##.', '.#.....#.', '###....#.'],
  O: ['', '..#####..', '.##...##.', '##.....##', '##.....##', '##.....##', '##.....##', '##.....##', '.##...##.', '..#####..'],
  P: ['', '######..', '.##..##.', '.##..##.', '.##..##.', '.#####..', '.##.....', '.##.....', '.##.....', '####....'],
  Q: ['', '..#####..', '.##...##.', '##.....##', '##.....##', '##.....##', '##.....##', '##.....##', '.##...##.', '..#####..', '....###..', '......##.'],
  R: ['', '######..', '.##..##.', '.##..##.', '.##..##.', '.#####..', '.##.##..', '.##..##.', '.##..##.', '####..##'],
  S: ['', '.####.#', '##...##', '##....#', '####...', '.#####.', '...####', '#....##', '##...##', '#.####.'],
  T: ['', '########', '#..##..#', '...##...', '...##...', '...##...', '...##...', '...##...', '...##...', '..####..'],
  U: ['', '####..###', '.##....#.', '.##....#.', '.##....#.', '.##....#.', '.##....#.', '.##....#.', '.##...#..', '..####...'],
  V: ['', '####..###', '.##....#.', '.##....#.', '..##..#..', '..##..#..', '...##.#..', '...####..', '....##...', '....#....'],
  W: ['', '###..###..###', '.##...##...#.', '.##...##...#.', '..##..###.#..', '..##.#.##.#..', '...###..###..', '...###..##...', '....#....#...', '....#....#...'],
  X: ['', '####.###', '.##...#.', '..##.#..', '...##...', '...##...', '..#.##..', '.#...##.', '.#...##.', '###.####'],
  Y: ['', '####.###', '.##...#.', '..##.#..', '..##.#..', '...##...', '...##...', '...##...', '...##...', '..####..'],
  Z: ['', '#######', '#....##', '....##.', '...##..', '...##..', '..##...', '.##....', '##....#', '#######'],
  a: ['', '', '', '', '.####..', '##..##.', '...###.', '.##.##.', '##..##.', '.###.##'],
  b: ['###....', '.##....', '.##....', '.##....', '.#####.', '.##..##', '.##..##', '.##..##', '.##..##', '.#####.'],
  c: ['', '', '', '', '.####.', '##..##', '##....', '##....', '##...#', '.####.'],
  d: ['...###.', '....##.', '....##.', '....##.', '.#####.', '##..##.', '##..##.', '##..##.', '##..##.', '.######'],
  e: ['', '', '', '', '.####.', '##..##', '######', '##....', '##...#', '.####.'],
  f: ['..###.', '.##..#', '.##...', '.##...', '#####.', '.##...', '.##...', '.##...', '.##...', '####..'],
  g: ['', '', '', '', '.######', '##..##.', '##..##.', '.####..', '##.....', '.#####.', '#....##', '#....##', '.#####.'],
  h: ['###.....', '.##.....', '.##.....', '.##.....', '.#####..', '.##..##.', '.##..##.', '.##..##.', '.##..##.', '####.###'],
  i: ['', '.##.', '.##.', '', '###.', '.##.', '.##.', '.##.', '.##.', '####'],
  j: ['', '..##', '..##', '', '.###', '..##', '..##', '..##', '..##', '..##', '..##', '#.##', '.##.'],
  k: ['###.....', '.##.....', '.##.....', '.##.....', '.##.###.', '.##..#..', '.##.#...', '.####...', '.##.##..', '###.###.'],
  l: ['###.', '.##.', '.##.', '.##.', '.##.', '.##.', '.##.', '.##.', '.##.', '####'],
  m: ['', '', '', '', '##.##..##...', '.###.###.##.', '.##..##..##.', '.##..##..##.', '.##..##..##.', '###.###.####'],
  n: ['', '', '', '', '##.###..', '.###.##.', '.##..##.', '.##..##.', '.##..##.', '###.####'],
  o: ['', '', '', '', '.####.', '##..##', '##..##', '##..##', '##..##', '.####.'],
  p: ['', '', '', '', '######.', '.##..##', '.##..##', '.##..##', '.##..##', '.#####.', '.##....', '.##....', '####...'],
  q: ['', '', '', '', '.######', '##..##.', '##..##.', '##..##.', '##..##.', '.#####.', '....##.', '....##.', '...####'],
  r: ['', '', '', '', '##.###', '.###..', '.##...', '.##...', '.##...', '####..'],
  s: ['', '', '', '', '.####', '##..#', '###..', '..###', '#..##', '####.'],
  t: ['', '', '.#...', '.##..', '#####', '.##..', '.##..', '.##..', '.##.#', '..##.'],
  u: ['', '', '', '', '###.###.', '.##..##.', '.##..##.', '.##..##.', '.##..##.', '..###.##'],
  v: ['', '', '', '', '###.###', '.##..#.', '.##..#.', '..##.#.', '..###..', '...#...'],
  w: ['', '', '', '', '###.###.##', '.##..##..#', '.##..##..#', '..##.###.#', '..####.##.', '...#....#.'],
  x: ['', '', '', '', '###.##', '.##.#.', '..##..', '..##..', '.#.##.', '##.###'],
  y: ['', '', '', '', '###.###', '.##..#.', '.##..#.', '..##.#.', '..###..', '...##..', '...#...', '#.#....', '##.....'],
  z: ['', '', '', '', '######', '#..##.', '..##..', '.##...', '##...#', '######'],
  0: ['', '..###..', '.##.##.', '##...##', '##...##', '##...##', '##...##', '##...##', '.##.##.', '..###..'],
  1: ['', '..##..', '.###..', '..##..', '..##..', '..##..', '..##..', '..##..', '..##..', '.####.'],
  2: ['', '.####..', '##..##.', '#....##', '.....##', '....##.', '...##..', '..##...', '.##...#', '#######'],
  3: ['', '.####..', '#...##.', '....##.', '...##..', '..####.', '.....##', '.....##', '#...##.', '.####..'],
  4: ['', '....##.', '...###.', '..#.##.', '.#..##.', '#...##.', '#######', '....##.', '....##.', '...####'],
  5: ['', '.######', '.#.....', '.#.....', '.####..', '....##.', '.....##', '.....##', '#...##.', '.####..'],
  6: ['', '...###.', '..##...', '.##....', '##.###.', '###..##', '##...##', '##...##', '.##.##.', '..###..'],
  7: ['', '#######', '#....##', '.....#.', '....##.', '....#..', '...##..', '...##..', '..##...', '..##...'],
  8: ['', '.#####.', '##...##', '##...##', '.##.##.', '..###..', '.##.##.', '##...##', '##...##', '.#####.'],
  9: ['', '..###..', '.##.##.', '##...##', '##...##', '.##..##', '..###.#', '.....##', '....##.', '.###...'],
  '!': ['', '##', '##', '##', '##', '##', '.#', '', '##', '##'],
  '.': ['', '', '', '', '', '', '', '', '##', '##'],
  ',': ['', '', '', '', '', '', '', '', '##', '##', '.#', '#.'],
  ':': ['', '', '', '', '##', '##', '', '', '##', '##'],
  "'": ['', '##', '##', '.#', '#.'],
  '-': ['', '', '', '', '', '', '####'],
  '?': ['', '.####.', '##..##', '....##', '...##.', '..##..', '..##..', '', '..##..', '..##..'],
  '(': ['...#', '..#.', '.##.', '##..', '##..', '##..', '##..', '##..', '.##.', '..#.', '...#'],
  ')': ['#...', '.#..', '.##.', '..##', '..##', '..##', '..##', '..##', '.##.', '.#..', '#...'],
  '*': ['', '..#..', '#.#.#', '.###.', '#.#.#', '..#..'],
  '~': ['', '', '', '', '.##..#', '#..##.'],
  '+': ['', '', '', '', '..#..', '..#..', '#####', '..#..', '..#..'],
});

// SANS: 7 px caps, 1 px stems, the plain sans of a small browser font size.
const SANS = makeFont('sans', 7, 2, 3, {
  A: ['..#..', '.#.#.', '.#.#.', '#...#', '#####', '#...#', '#...#'],
  B: ['####.', '#...#', '#...#', '####.', '#...#', '#...#', '####.'],
  C: ['.###.', '#...#', '#....', '#....', '#....', '#...#', '.###.'],
  D: ['####.', '#...#', '#...#', '#...#', '#...#', '#...#', '####.'],
  E: ['#####', '#....', '#....', '####.', '#....', '#....', '#####'],
  F: ['#####', '#....', '#....', '####.', '#....', '#....', '#....'],
  G: ['.###.', '#...#', '#....', '#.###', '#...#', '#...#', '.###.'],
  H: ['#...#', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  I: ['#', '#', '#', '#', '#', '#', '#'],
  J: ['....#', '....#', '....#', '....#', '#...#', '#...#', '.###.'],
  K: ['#...#', '#..#.', '#.#..', '##...', '#.#..', '#..#.', '#...#'],
  L: ['#....', '#....', '#....', '#....', '#....', '#....', '#####'],
  M: ['#...#', '##.##', '#.#.#', '#.#.#', '#...#', '#...#', '#...#'],
  N: ['#...#', '##..#', '#.#.#', '#.#.#', '#..##', '#...#', '#...#'],
  O: ['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  P: ['####.', '#...#', '#...#', '####.', '#....', '#....', '#....'],
  Q: ['.###.', '#...#', '#...#', '#...#', '#.#.#', '#..#.', '.##.#'],
  R: ['####.', '#...#', '#...#', '####.', '#.#..', '#..#.', '#...#'],
  S: ['.###.', '#...#', '#....', '.###.', '....#', '#...#', '.###.'],
  T: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..'],
  U: ['#...#', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  V: ['#...#', '#...#', '#...#', '#...#', '.#.#.', '.#.#.', '..#..'],
  W: ['#...#', '#...#', '#...#', '#.#.#', '#.#.#', '##.##', '#...#'],
  X: ['#...#', '#...#', '.#.#.', '..#..', '.#.#.', '#...#', '#...#'],
  Y: ['#...#', '#...#', '.#.#.', '..#..', '..#..', '..#..', '..#..'],
  Z: ['#####', '....#', '...#.', '..#..', '.#...', '#....', '#####'],
  a: ['', '', '.###.', '....#', '.####', '#...#', '.####'],
  b: ['#....', '#....', '####.', '#...#', '#...#', '#...#', '####.'],
  c: ['', '', '.###', '#...', '#...', '#...', '.###'],
  d: ['....#', '....#', '.####', '#...#', '#...#', '#...#', '.####'],
  e: ['', '', '.###.', '#...#', '#####', '#....', '.###.'],
  f: ['..##', '.#..', '####', '.#..', '.#..', '.#..', '.#..'],
  g: ['', '', '.####', '#...#', '#...#', '#...#', '.####', '....#', '.###.'],
  h: ['#....', '#....', '####.', '#...#', '#...#', '#...#', '#...#'],
  i: ['#', '', '#', '#', '#', '#', '#'],
  j: ['..#', '', '..#', '..#', '..#', '..#', '..#', '..#', '##.'],
  k: ['#...', '#...', '#..#', '#.#.', '##..', '#.#.', '#..#'],
  l: ['#', '#', '#', '#', '#', '#', '#'],
  m: ['', '', '####.', '#.#.#', '#.#.#', '#.#.#', '#.#.#'],
  n: ['', '', '####.', '#...#', '#...#', '#...#', '#...#'],
  o: ['', '', '.###.', '#...#', '#...#', '#...#', '.###.'],
  p: ['', '', '####.', '#...#', '#...#', '#...#', '####.', '#....', '#....'],
  q: ['', '', '.####', '#...#', '#...#', '#...#', '.####', '....#', '....#'],
  r: ['', '', '#.##', '##..', '#...', '#...', '#...'],
  s: ['', '', '.###', '#...', '.##.', '...#', '###.'],
  t: ['.#..', '.#..', '####', '.#..', '.#..', '.#..', '..##'],
  u: ['', '', '#...#', '#...#', '#...#', '#...#', '.####'],
  v: ['', '', '#...#', '#...#', '.#.#.', '.#.#.', '..#..'],
  w: ['', '', '#...#', '#...#', '#.#.#', '#.#.#', '.#.#.'],
  x: ['', '', '#...#', '.#.#.', '..#..', '.#.#.', '#...#'],
  y: ['', '', '#...#', '#...#', '#...#', '#...#', '.####', '....#', '.###.'],
  z: ['', '', '#####', '...#.', '..#..', '.#...', '#####'],
  0: ['.###.', '#...#', '#..##', '#.#.#', '##..#', '#...#', '.###.'],
  1: ['..#..', '.##..', '..#..', '..#..', '..#..', '..#..', '.###.'],
  2: ['.###.', '#...#', '....#', '...#.', '..#..', '.#...', '#####'],
  3: ['.###.', '#...#', '....#', '..##.', '....#', '#...#', '.###.'],
  4: ['...#.', '..##.', '.#.#.', '#..#.', '#####', '...#.', '...#.'],
  5: ['#####', '#....', '####.', '....#', '....#', '#...#', '.###.'],
  6: ['.###.', '#....', '#....', '####.', '#...#', '#...#', '.###.'],
  7: ['#####', '....#', '...#.', '..#..', '..#..', '.#...', '.#...'],
  8: ['.###.', '#...#', '#...#', '.###.', '#...#', '#...#', '.###.'],
  9: ['.###.', '#...#', '#...#', '.####', '....#', '....#', '.###.'],
  '.': ['', '', '', '', '', '', '#'],
  ',': ['', '', '', '', '', '', '#', '#'],
  '!': ['#', '#', '#', '#', '#', '', '#'],
  '?': ['.###.', '#...#', '....#', '...#.', '..#..', '', '..#..'],
  ':': ['', '', '#', '', '', '', '#'],
  ';': ['', '', '.#', '', '', '', '.#', '#.'],
  "'": ['#', '#'],
  '"': ['#.#', '#.#'],
  '-': ['', '', '', '###'],
  '+': ['', '..#..', '..#..', '#####', '..#..', '..#..'],
  '/': ['....#', '...#.', '...#.', '..#..', '.#...', '.#...', '#....'],
  '(': ['..#', '.#.', '#..', '#..', '#..', '#..', '.#.', '..#'],
  ')': ['#..', '.#.', '..#', '..#', '..#', '..#', '.#.', '#..'],
  '*': ['', '#.#.#', '.###.', '#####', '.###.', '#.#.#'],
  '<': ['', '...#', '..#.', '.#..', '#...', '.#..', '..#.', '...#'],
  '>': ['', '#...', '.#..', '..#.', '...#', '..#.', '.#..', '#...'],
  '^': ['..#..', '.#.#.', '#...#'],
  '~': ['', '', '', '.#..#', '#.##.'],
  '=': ['', '', '####', '', '####'],
  '%': ['##..#', '##.#.', '...#.', '..#..', '.#...', '.#.##', '#..##'],
  '#': ['.#.#.', '.#.#.', '#####', '.#.#.', '#####', '.#.#.', '.#.#.'],
  '@': ['.###.', '#...#', '#.###', '#.#.#', '#.###', '#....', '.####'],
});

// TINY: 3x5 capitals for the small print inside an 88x31 button.
const TINY = makeFont('tiny', 5, 0, 2, {
  A: ['.#.', '#.#', '###', '#.#', '#.#'], B: ['##.', '#.#', '##.', '#.#', '##.'],
  C: ['.##', '#..', '#..', '#..', '.##'], D: ['##.', '#.#', '#.#', '#.#', '##.'],
  E: ['###', '#..', '##.', '#..', '###'], F: ['###', '#..', '##.', '#..', '#..'],
  G: ['.##', '#..', '#.#', '#.#', '.##'], H: ['#.#', '#.#', '###', '#.#', '#.#'],
  I: ['###', '.#.', '.#.', '.#.', '###'], J: ['..#', '..#', '..#', '#.#', '.#.'],
  K: ['#.#', '#.#', '##.', '#.#', '#.#'], L: ['#..', '#..', '#..', '#..', '###'],
  M: ['#...#', '##.##', '#.#.#', '#...#', '#...#'], N: ['#..#', '##.#', '#.##', '#..#', '#..#'],
  O: ['.#.', '#.#', '#.#', '#.#', '.#.'], P: ['##.', '#.#', '##.', '#..', '#..'],
  Q: ['.#.', '#.#', '#.#', '##.', '.##'], R: ['##.', '#.#', '##.', '#.#', '#.#'],
  S: ['.##', '#..', '.#.', '..#', '##.'], T: ['###', '.#.', '.#.', '.#.', '.#.'],
  U: ['#.#', '#.#', '#.#', '#.#', '###'], V: ['#.#', '#.#', '#.#', '#.#', '.#.'],
  W: ['#...#', '#...#', '#.#.#', '#.#.#', '.#.#.'], X: ['#.#', '#.#', '.#.', '#.#', '#.#'],
  Y: ['#.#', '#.#', '.#.', '.#.', '.#.'], Z: ['###', '..#', '.#.', '#..', '###'],
  0: ['###', '#.#', '#.#', '#.#', '###'], 1: ['.#.', '##.', '.#.', '.#.', '###'],
  2: ['##.', '..#', '.#.', '#..', '###'], 3: ['##.', '..#', '.#.', '..#', '##.'],
  4: ['#.#', '#.#', '###', '..#', '..#'], 5: ['###', '#..', '##.', '..#', '##.'],
  6: ['.##', '#..', '###', '#.#', '###'], 7: ['###', '..#', '.#.', '.#.', '.#.'],
  8: ['###', '#.#', '###', '#.#', '###'], 9: ['###', '#.#', '###', '..#', '##.'],
  x: ['', '', '#.#', '.#.', '#.#'],
  '.': ['', '', '', '', '#'], ',': ['', '', '', '#', '#'], ':': ['', '#', '', '#', ''],
  '!': ['#', '#', '#', '', '#'], '-': ['', '', '##', '', ''], '+': ['', '.#.', '###', '.#.', ''],
  '%': ['#.#', '..#', '.#.', '#..', '#.#'], '/': ['..#', '..#', '.#.', '#..', '#..'],
  "'": ['#', '#'], '?': ['##.', '..#', '.#.', '', '.#.'], '(': ['.#', '#.', '#.', '#.', '.#'], ')': ['#.', '.#', '.#', '.#', '#.'],
  '>': ['#..', '.#.', '..#', '.#.', '#..'], '_': ['', '', '', '', '###'],
});

// DIGITS: the odometer's figures, 5x9 with 2 px stems.
const DIGITS = makeFont('digits', 9, 0, 5, {
  0: ['.###.', '##.##', '##.##', '##.##', '##.##', '##.##', '##.##', '##.##', '.###.'],
  1: ['..##.', '.###.', '..##.', '..##.', '..##.', '..##.', '..##.', '..##.', '.####'],
  2: ['.###.', '##.##', '...##', '...##', '..##.', '.##..', '##...', '##...', '#####'],
  3: ['####.', '...##', '...##', '..##.', '.###.', '...##', '...##', '...##', '####.'],
  4: ['##.##', '##.##', '##.##', '##.##', '#####', '...##', '...##', '...##', '...##'],
  5: ['#####', '##...', '##...', '####.', '...##', '...##', '...##', '##.##', '.###.'],
  6: ['.###.', '##...', '##...', '####.', '##.##', '##.##', '##.##', '##.##', '.###.'],
  7: ['#####', '...##', '...##', '..##.', '..##.', '.##..', '.##..', '.##..', '.##..'],
  8: ['.###.', '##.##', '##.##', '.###.', '##.##', '##.##', '##.##', '##.##', '.###.'],
  9: ['.###.', '##.##', '##.##', '##.##', '.####', '...##', '...##', '...##', '.###.'],
});

// ------------------------------------------------------------------ specimen
function writeSheet() {
  if (!SHEET) return;
  fs.mkdirSync(SHEET, { recursive: true });
  const p = new Pix();
  let y = 2;
  const line = (font, s, o) => { p.text(font, s, 2, y, '#ffff00', o); y += font.asc + font.desc + 4; };
  line(SERIF, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ');
  line(SERIF, 'abcdefghijklmnopqrstuvwxyz 0123456789');
  line(SERIF, "Welcome to my Island Homepage!!! You are visitor number");
  line(SERIF, "the cat came back!! (so is the sandcastle) ~*~ quick, jumpy?");
  line(SANS, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789');
  line(SANS, 'a 10-hour lo-fi island video in which almost nothing happens, on purpose.');
  line(SANS, 'GET SERVE.PY NOW!', { bold: true });
  line(TINY, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789 1920x1080 100% NO SAMPLES');
  line(DIGITS, '0123456789');
  const W = 420;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${y}" width="${W * 3}" height="${y * 3}" shape-rendering="crispEdges"><rect width="${W}" height="${y}" fill="#000"/>${p.svg()}</svg>`;
  fs.writeFileSync(path.join(SHEET, `${SLUG}-sheet.svg`), svg);
}

// ------------------------------------------------------------------ css
// Every animation is a CSS class on a group. vis() makes a frame visible for
// some intervals of a loop of T seconds (step-end, so frames cut like a GIF);
// the class's own opacity is the frame shown when motion is reduced.
function rot(intervals, d, T) {
  const out = [];
  for (const [a, b] of intervals) {
    const a2 = (((a + d) % T) + T) % T;
    const b2 = a2 + (b - a);
    if (b2 <= T + 1e-9) out.push([a2, Math.min(b2, T)]);
    else { out.push([a2, T]); out.push([0, b2 - T]); }
  }
  return out;
}
class Css {
  constructor(prefix) { this.p = prefix; this.rules = []; this.k = 0; this.memo = new Map(); }
  name() { return `${this.p}${(this.k++).toString(36)}`; }
  vis(T, intervals, base = null) {
    const on = (t) => intervals.some(([a, b]) => t >= a - 1e-9 && t < b - 1e-9);
    if (base === null) base = on(0);
    const key = JSON.stringify([T, intervals, base]);
    if (this.memo.has(key)) return this.memo.get(key);
    const nm = this.name();
    const cuts = new Set([0]);
    for (const [a, b] of intervals) for (const t of [a, b]) if (t > 1e-9 && t < T - 1e-9) cuts.add(+t.toFixed(4));
    const ts = [...cuts].sort((a, b) => a - b);
    const kf = ts.map((t) => `${pct(t, T)}{opacity:${on(t) ? 1 : 0}}`).join('') + `100%{opacity:${on(0) ? 1 : 0}}`;
    this.rules.push(`@keyframes ${nm}{${kf}}.${nm}{opacity:${base ? 1 : 0};animation:${nm} ${n(T)}s step-end infinite}`);
    this.memo.set(key, nm);
    return nm;
  }
  // frame i of k equal frames in a loop of T seconds, shifted by `shift`
  frame(T, k, i, shift = 0, base = null) { return this.vis(T, rot([[(i * T) / k, ((i + 1) * T) / k]], shift, T), base); }
  add(rule) { this.rules.push(rule); }
  style() { return `<style>${this.rules.join('')}@media (prefers-reduced-motion:reduce){*{animation:none!important}}</style>`; }
}
const g = (cls, body, extra = '') => (body ? `<g${cls ? ` class="${cls}"` : ''}${extra}>${body}</g>` : '');

function svgDoc(w, h, scale, title, desc, css, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w * scale}" height="${h * scale}" shape-rendering="crispEdges" role="img" aria-labelledby="title desc"><title id="title">${esc(title)}</title><desc id="desc">${esc(desc)}</desc>${css.style()}${body}</svg>\n`;
}

// ------------------------------------------------------------------ colour
const WEB = {
  black: '#000000', white: '#ffffff', yellow: '#ffff00', lime: '#00ff00', cyan: '#00ffff',
  magenta: '#ff00ff', red: '#ff0000', blue: '#0000ff', navy: '#000080', purple: '#800080',
  silver: '#c0c0c0', grey: '#808080', orange: '#ff9900',
};
// 4x4 ordered dither threshold, 0..1
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);
const bayer = (x, y) => BAYER[(y & 3) * 4 + (x & 3)];
// pick from a list of colours along t in [0,1], dithered like a 256-colour GIF
function ditherRamp(cols, t, x, y) {
  const lv = Math.max(0, Math.min(cols.length - 1, t * (cols.length - 1)));
  const i = Math.floor(lv);
  const f = lv - i;
  return f > bayer(x, y) && i + 1 < cols.length ? cols[i + 1] : cols[i];
}

// ------------------------------------------------------------------ logo
// "CASTAWAY" as a free-logo-generator 3D word: a fat round-stroke face on a
// gentle arch, rasterised with hard edges (no smoothing, as a GIF would be),
// extruded down-right in three purples, matted in black, with a rainbow that
// cycles a band a beat. The letters are centre-line strokes drawn here.
function arcPts(cx, cy, rx, ry, a0, a1, step = 3) {
  const pts = [];
  const k = Math.max(2, Math.ceil(Math.abs(a1 - a0) / step));
  for (let i = 0; i <= k; i++) {
    const a = ((a0 + ((a1 - a0) * i) / k) * Math.PI) / 180;
    pts.push([cx + rx * Math.cos(a), cy - ry * Math.sin(a)]);
  }
  return pts;
}
const LOGO_GLYPHS = {
  C: [{ pts: arcPts(13, 16, 12.5, 16, 46, 314) }],
  A: [{ pts: [[0, 32], [13.5, 0], [27, 32]] }, { pts: [[6.5, 23.5], [20.5, 23.5]], w: 7 }],
  S: [{ pts: [...arcPts(11, 8, 11, 8, 30, 270), ...arcPts(11, 24, 11, 8, 90, -150).slice(1)] }],
  T: [{ pts: [[0, 0], [24, 0]] }, { pts: [[12, 0], [12, 32]] }],
  W: [{ pts: [[0, 0], [8.5, 32], [17.5, 7], [26.5, 32], [35, 0]] }],
  Y: [{ pts: [[0, 0], [12, 16]] }, { pts: [[24, 0], [12, 16], [12, 32]] }],
};
function rasterLogo(word, o) {
  const { sw, s } = o;
  const segs = [];
  let x = 0;
  const spans = [];
  for (const ch of word) {
    const parts = LOGO_GLYPHS[ch];
    const xs = parts.flatMap((q) => q.pts.map((pt) => pt[0]));
    const minx = Math.min(...xs);
    const maxx = Math.max(...xs);
    for (const q of parts) {
      for (let i = 0; i + 1 < q.pts.length; i++) {
        const [ax, ay] = q.pts[i];
        const [bx, by] = q.pts[i + 1];
        segs.push([ax - minx + x, ay, bx - minx + x, by, (q.w ?? sw) / 2, spans.length]);
      }
    }
    spans.push([x - sw / 2, x + maxx - minx + sw / 2]);
    x += maxx - minx + sw + o.gap;
  }
  const xmin = -sw / 2;
  const xmax = x - o.gap - sw / 2;
  const Wo = Math.round((xmax - xmin) * s);
  const Ho = Math.round((32 + sw) * s);
  const arch = (X) => o.arch * (1 - ((X - Wo / 2) / (Wo / 2)) ** 2);
  const face = new Map();
  for (let py = -Math.ceil(o.arch) - 2; py < Ho + 2; py++) {
    for (let px = -2; px < Wo + 2; px++) {
      const X = px + 0.5;
      const xd = X / s + xmin;
      const yd = (py + 0.5 + arch(X)) / s - sw / 2;
      for (const [ax, ay, bx, by, r, li] of segs) {
        const dx = bx - ax; const dy = by - ay;
        const L = dx * dx + dy * dy;
        let t = L ? ((xd - ax) * dx + (yd - ay) * dy) / L : 0;
        t = Math.max(0, Math.min(1, t));
        const ex = ax + t * dx - xd; const ey = ay + t * dy - yd;
        if (ex * ex + ey * ey <= r * r) { face.set(KEY(px, py), { yd, li }); break; }
      }
    }
  }
  return { face, Wo, Ho, spans: spans.map(([a, b]) => [Math.round((a - xmin) * s), Math.round((b - xmin) * s)]) };
}
const RAINBOW = ['#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ccff', '#cc33ff'];
const RAINBOW_LIGHT = ['#ff8080', '#ffcc66', '#ffff99', '#99ff99', '#99eeff', '#e699ff'];
const EXTRUDE = ['#9933cc', '#9933cc', '#6a2299', '#6a2299', '#3d0f66', '#3d0f66', '#2a0a4a'];
function logoPix(ox, oy, css) {
  const L = rasterLogo('CASTAWAY', { sw: 9, s: 1.18, gap: 2.5, arch: 6 });
  const D = 6;
  const BW = 26;
  const p = new Pix();
  const isF = (x, y) => L.face.has(KEY(x, y));
  const ext = new Map();
  for (const k of L.face.keys()) {
    const x = KX(k); const y = KY(k);
    for (let d = 1; d <= D; d++) {
      const kk = KEY(x + d, y + d);
      if (!L.face.has(kk) && (!ext.has(kk) || ext.get(kk) > d)) ext.set(kk, d);
    }
  }
  const solid = (x, y) => isF(x, y) || ext.has(KEY(x, y));
  // black matte, 1 px all round, so the stars stop at the letters: drawn as
  // one solid shape underneath, which merges into far fewer runs than a ring
  const matte = new Pix();
  for (const k of [...L.face.keys(), ...ext.keys()]) {
    const x = KX(k); const y = KY(k);
    for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) matte.set('#000000', ox + x + i, oy + y + j);
  }
  for (const [k, d] of ext) {
    const x = KX(k); const y = KY(k);
    // the far edge of the extrusion catches a little light
    const rim = !solid(x + 1, y + 1) && d >= D - 1;
    p.set(rim ? '#7d3fbf' : EXTRUDE[d - 1], ox + x, oy + y);
  }
  for (const [k, { yd }] of L.face) {
    const x = KX(k); const y = KY(k);
    const b = (((Math.floor((x + y * 0.6) / BW)) % 6) + 6) % 6;
    let c = yd < 8 ? `.l${b}` : `.r${b}`;
    if (!isF(x, y - 1)) c = '#ffffff';
    else if (!isF(x - 1, y) && yd < 20) c = `.l${b}`;
    if (!isF(x, y + 1) || !isF(x + 1, y + 1)) c = c === '#ffffff' ? c : '#000000';
    p.set(c, ox + x, oy + y);
  }
  // rainbow cycling, one band a beat; band b starts on colour (-b mod 6)
  const T = 6 * BEAT;
  const kf = (cols) => cols.map((c, i) => `${pct(i * BEAT, T)}{fill:${c}}`).join('') + `100%{fill:${cols[0]}}`;
  css.add(`@keyframes rb{${kf(RAINBOW)}}@keyframes rl{${kf(RAINBOW_LIGHT)}}`);
  for (let b = 0; b < 6; b++) {
    const c0 = (6 - b) % 6;
    css.add(`.r${b}{fill:${RAINBOW[c0]};animation:rb ${n(T)}s step-end ${n(-c0 * BEAT)}s infinite}`);
    css.add(`.l${b}{fill:${RAINBOW_LIGHT[c0]};animation:rl ${n(T)}s step-end ${n(-c0 * BEAT)}s infinite}`);
  }
  return { p, matte, w: L.Wo + D + 2, h: L.Ho + D + 2, spans: L.spans };
}

// ------------------------------------------------------------------ sprites
const HER_PAL = {
  h: '#5a3418', b: '#3e2410', s: '#f6c9a0', z: '#d99a70', c: '#fff4d8', C: '#cdbb92',
  t: '#ff7b5e', T: '#d65a42', w: '#f4e8c8', W: '#cbbb94', k: '#2a1a0c', q: '#9fe8ff',
};
// standing, facing us, headphones on; frame B is the nod (head down a pixel)
const HER_HEAD = [
  '...ccc...',
  '..chhhc..',
  '.chhhhhc.',
  'CChssshcc',
  'CChkskhcc',
  '..hsssh..',
  '..hhzhhb.',
];
const HER_BODY = [
  '...ss....',
  '..ttttt..',
  '.sttttts.',
  '.sttttts.',
  '.sTtttTs.',
  '.s.ttt.s.',
  '.s.www.s.',
  '..wwwww..',
  '..ww.ww..',
  '...s.s...',
  '...s.s...',
  '...s.s...',
  '..ss.ss..',
];
const HER_UP = [...HER_HEAD, ...HER_BODY];
const HER_NOD = ['.........', ...HER_HEAD, ...HER_BODY.slice(1)];
// up the palm with the phone held high for the one bar of signal
const HER_CROWN = [
  '........kq',
  '........kk',
  '.........s',
  '...ccc...s',
  '..chhhc..s',
  '.chhhhhc.s',
  'CChssshccs',
  'CChkskhccs',
  '..hsssh.s.',
  '..hhzhhs..',
  '..tttttt..',
  '.stttttt..',
  '.sttTtt...',
];
const TURTLE_PAL = { d: '#1f5a2a', G: '#4f9a3c', g: '#7cc24a', s: '#9acd6a', k: '#10200c', f: '#6aa84f' };
const TURTLE = [
  ['....ddddd.....', '..ddGgGgGdd...', '.dGgGgGgGgGd.ss', 'ddddddddddddsks', '.ff........ss..'],
  ['....ddddd.....', '..ddGgGgGdd...', '.dGgGgGgGgGd.ss', 'ddddddddddddsks', '.........ff.s..'],
];
// the road-sign figure: someone with a spade, building a sandcastle
const DIGGER = [
  '...##...............',
  '..####..............',
  '...##...............',
  '..####.....#........',
  '.######...#.........',
  '.#.####..#..........',
  '...####.#.....#.#.#.',
  '...###.#......#####.',
  '..##.##.......#####.',
  '..#...#.....#.#####.',
  '.##...##....########',
  '##.....##...########',
];

// ------------------------------------------------------------------ bottle
// A message in a bottle tumbling end over end, eight frames, for "e-mail
// me": rasterised from a little shape at each angle, nearest pixel.
function bottleFrames(size = 24, frames = 8) {
  const out = [];
  const cx = size / 2; const cy = size / 2;
  const sc = size / 24;
  const shape = (u, v) => {
    // local: u across, v along (neck up = negative v); returns colour key or null
    if (v >= -11 && v < -8.5 && Math.abs(u) <= 1.6) return 'cork';
    if (v >= -8.5 && v < -5 && Math.abs(u) <= 1.7) return 'glass';
    if (v >= -5 && v < -2.5 && Math.abs(u) <= 1.7 + (v + 5) * 1.0) return 'glass';
    if (v >= -2.5 && v <= 9 && Math.abs(u) <= 4.2) {
      if (v > 8 && Math.abs(u) > 3.4) return null;
      if (v > -1 && v < 7 && u > -2.6 && u < 2.0) return 'note';
      return 'glass';
    }
    return null;
  };
  const pal = { cork: '#a0602a', glass: '#2fae7c', note: '#fff6cc', edge: '#0d5a3a', hi: '#c8ffe8', ribbon: '#ff3333' };
  for (let f = 0; f < frames; f++) {
    const a = (f * 2 * Math.PI) / frames + 0.35;
    const ca = Math.cos(a); const sa = Math.sin(a);
    const grid = new Map();
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const dx = x + 0.5 - cx; const dy = y + 0.5 - cy - 0.5;
        const u = (dx * ca + dy * sa) / sc;
        const v = (-dx * sa + dy * ca) / sc;
        const k = shape(u, v);
        if (!k) continue;
        let c = pal[k];
        if (k === 'note' && Math.abs(v - 3) < 0.6) c = pal.ribbon;
        if (k === 'glass' && u < -2.7 && u > -3.9 && v > -2 && v < 7) c = pal.hi;
        grid.set(KEY(x, y), c);
      }
    }
    const p = new Pix();
    for (const [k, c] of grid) {
      const x = KX(k); const y = KY(k);
      const edge = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([i, j]) => !grid.has(KEY(x + i, y + j)));
      p.set(edge && c !== pal.cork ? pal.edge : c, x, y);
    }
    out.push(p);
  }
  return out;
}

// ------------------------------------------------------------------ starburst
function burstPix(w, h, fill, rim, textCol) {
  const p = new Pix();
  const cx = w / 2; const cy = h / 2;
  const pts = 16;
  const inside = (x, y) => {
    const dx = (x + 0.5 - cx) / (w / 2); const dy = (y + 0.5 - cy) / (h / 2);
    const a = Math.atan2(dy, dx);
    const r = Math.hypot(dx, dy);
    const spike = 0.74 + 0.26 * (0.5 + 0.5 * Math.cos(a * pts));
    return r <= spike;
  };
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!inside(x, y)) continue;
      const edge = !inside(x + 1, y) || !inside(x - 1, y) || !inside(x, y + 1) || !inside(x, y - 1);
      p.set(edge ? rim : fill, x, y);
    }
  }
  const tw = textWidth(SANS, 'NEW!', { bold: true });
  p.text(SANS, 'NEW!', Math.round(cx - tw / 2), Math.round(cy - 4), textCol, { bold: true });
  return p;
}

// ------------------------------------------------------------------ sparkle
const SPARKLE = [
  ['...', '.#.', '...'],
  ['.#.', '###', '.#.'],
  ['...#...', '...#...', '..#.#..', '##.#.##', '..#.#..', '...#...', '...#...'],
];
function sparkle(css, x, y, T, delay, col = '#ffffff') {
  let o = '';
  const seq = [[0, 0.25], [0.25, 0.5], [0.5, 0.75], [0.75, 1.0], [1.0, 1.25]];
  const which = [0, 1, 2, 1, 0];
  seq.forEach(([a, b], i) => {
    const s = SPARKLE[which[i]];
    const p = new Pix();
    const off = Math.floor(s.length / 2);
    p.sprite(s, { '#': col }, x - off, y - off);
    if (which[i] === 2) p.set('#ffffcc', x, y);
    o += g(css.vis(T, rot([[a, b]], delay, T), i === 2 && delay === 0 ? true : false), p.svg());
  });
  return o;
}


// ------------------------------------------------------------------ the photo
// "my island!!!": a 172x86 photo, dithered to a GIF's palette, annotated in
// red. Local coordinates; the banner places it inside a blue link border.
const PW = 172;
const PH = 86;
const HORIZON = 34;
const SKY = ['#2a5fc8', '#3a7ce0', '#55a0f0', '#7ec0f8', '#b4dcfc'];
const SEA = ['#1d55b0', '#2468c4', '#2a7ed2', '#3192da', '#38a2de'];
const ISLE = { cx: 86, cy: 66, rx: 42, ry: 8 };
const PALM_BASE = [100, 64];
const PALM_TOP = [93, 22];
const HER_AT = [57, 47]; // top-left of the standing sprite; feet on row 66
const CROWN_AT = [85, 8];
const RAFT = [134, 64];

const ell = (x, y, e) => Math.hypot((x + 0.5 - e.cx) / e.rx, (y + 0.5 - e.cy) / e.ry);
function hash(x, y, s = 0) {
  let h = (x * 374761393 + y * 668265263 + s * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

// A dithered vertical gradient as one rect per run of equal rows, each
// filled with a 4x4 ordered-dither <pattern> of two neighbouring colours:
// the same pixels ditherRamp() would set, at a fraction of the bytes.
function ditherRows(cols, y0, y1, w, tOf) {
  const pats = new Map();
  const rows = [];
  for (let y = y0; y < y1; y++) {
    const lv = Math.max(0, Math.min(cols.length - 1, tOf(y) * (cols.length - 1)));
    const i = Math.floor(lv);
    const L = 4 * Math.max(0, Math.min(4, Math.round(4 * (lv - i))));
    let fill;
    if (L === 0 || i + 1 >= cols.length) fill = short(cols[i]);
    else if (L === 16) fill = short(cols[i + 1]);
    else {
      const key = `${cols[i]}${cols[i + 1]}${L}`;
      if (!pats.has(key)) {
        const q = new Pix();
        for (let j = 0; j < 4; j++) for (let k = 0; k < 4; k++) if ((BAYER[j * 4 + k] * 16 - 0.5) < L) q.set(cols[i + 1], k, j);
        pats.set(key, { id: `dp${PAT_ID.n++}`, svg: `<rect width="4" height="4" fill="${short(cols[i])}"/>${q.svg()}` });
      }
      fill = `url(#${pats.get(key).id})`;
    }
    if (rows.length && rows[rows.length - 1].fill === fill) rows[rows.length - 1].h++;
    else rows.push({ y, h: 1, fill });
  }
  const defs = [...pats.values()].map((p) => `<pattern id="${p.id}" width="4" height="4" patternUnits="userSpaceOnUse">${p.svg}</pattern>`).join('');
  return defs + rows.map((r) => `<rect y="${r.y}" width="${w}" height="${r.h}" fill="${r.fill}"/>`).join('');
}
const PAT_ID = { n: 0 };

function photoBackdrop() {
  return ditherRows(SKY, 0, HORIZON, PW, (y) => y / (HORIZON - 1)) + ditherRows(SEA, HORIZON, PH, PW, (y) => (y - HORIZON) / (PH - HORIZON - 1));
}

function photoBase() {
  const p = new Pix();
  for (let x = 0; x < PW; x++) p.set(x % 7 === 3 ? '#cfe8ff' : '#8cc4f0', x, HORIZON);
  const r = mulberry32(1992);
  for (let i = 0; i < 80; i++) {
    const y = HORIZON + 2 + Math.floor(r() ** 1.2 * (PH - HORIZON - 3));
    const x = Math.floor(r() * PW);
    const len = 2 + Math.floor(r() * (1 + (y - HORIZON) / 9));
    p.rect(y - HORIZON < 12 ? '#3f86d4' : '#5cb8ea', x, y, len, 1);
  }
  // shallows, a ring of turquoise round the sand
  const SH = { cx: 86, cy: 67, rx: 58, ry: 14 };
  for (let y = HORIZON + 8; y < PH; y++) {
    for (let x = 0; x < PW; x++) {
      const d = ell(x, y, SH);
      if (d >= 1) continue;
      if (d > 0.82 && (d - 0.82) / 0.18 > bayer(x, y)) continue;
      p.set(d < 0.8 ? '#5fd3d0' : '#3fbcd0', x, y);
    }
  }
  // the island: wet rim, sand, light on the top, shade at the front
  for (let y = 50; y < 80; y++) {
    for (let x = 30; x < 140; x++) {
      const d = ell(x, y, ISLE);
      if (d >= 1) continue;
      const v = (y + 0.5 - ISLE.cy) / ISLE.ry;
      let c = '#f4d9a0';
      if (d > 0.9) c = '#d6bd86';
      else if (v < -0.35) c = (-0.35 - v) * 2.2 > bayer(x, y) ? '#fae9c4' : '#f4d9a0';
      else if (v > 0.45) c = (v - 0.45) * 2.4 > bayer(x, y) ? '#e2bf83' : '#f4d9a0';
      p.set(c, x, y);
    }
  }
  // rocks at the waterline
  for (const [cx, cy, rx, ry] of [[69, 73, 3, 1.7], [104, 74, 2.4, 1.4], [122, 70, 1.8, 1.2]]) {
    p.ellipse('#7c7c84', cx, cy, rx, ry);
    p.ellipse('#a8a8b0', cx - 0.6, cy - 0.5, rx * 0.6, ry * 0.55);
  }
  // her contact shadow (also a footprint while she is up the palm)
  p.rect('#e2bf83', HER_AT[0] + 2, 67, 5, 1);
  // the palm trunk: a slender curve, banded, dark on the left
  const [bx, by] = PALM_BASE;
  const [tx, ty] = PALM_TOP;
  const ctrl = [105, 40];
  for (let y = ty; y <= by; y++) {
    let best = 0;
    let bd = 1e9;
    for (let i = 0; i <= 200; i++) {
      const t = i / 200;
      const yy = (1 - t) * (1 - t) * by + 2 * (1 - t) * t * ctrl[1] + t * t * ty;
      if (Math.abs(yy - y) < bd) { bd = Math.abs(yy - y); best = t; }
    }
    const t = best;
    const xx = (1 - t) * (1 - t) * bx + 2 * (1 - t) * t * ctrl[0] + t * t * tx;
    const w = Math.round(4.4 - 1.6 * t);
    const x0 = Math.round(xx - w / 2);
    const band = Math.floor((by - y) / 3) % 2 === 0;
    for (let i = 0; i < w; i++) {
      let c = band ? '#a65d33' : '#c98b5c';
      if (i === 0) c = '#6e3a1e';
      else if (i === w - 1 && !band) c = '#dba57a';
      p.set(c, x0 + i, y);
    }
  }
  p.rect('#e2bf83', bx - 4, by + 1, 9, 1);
  // bushes round the foot of the palm and one on the left
  for (const [cx, cy, rx, ry] of [[92, 62, 6, 3.2], [107, 61.5, 5, 3], [79, 63, 4, 2.4], [116, 64, 3.2, 2]]) {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        const u = (x + 0.5 - cx) / rx;
        const v = (y + 0.5 - cy) / ry;
        const d = u * u + v * v + 0.35 * hash(x, y, 3);
        if (d > 1.05) continue;
        let c = '#2f8a3a';
        if (v < -0.2 && hash(x, y, 5) > 0.35) c = '#5fbf4a';
        if (v > 0.45) c = '#1e5e2a';
        p.set(c, x, y);
      }
    }
  }
  // the raft, logs and lashings, in its own little foam line
  const [rx0, ry0] = RAFT;
  for (let i = 0; i < 3; i++) {
    const y = ry0 + 1 + i * 2;
    const x0 = rx0 + (2 - i);
    p.rect('#a8653a', x0 + 1, y, 21, 1);
    p.rect('#6e3a1c', x0 + 1, y + 1, 21, 1);
    p.set('#d9a06a', x0, y); p.set('#b9844e', x0, y + 1);
    p.set('#d9a06a', x0 + 22, y); p.set('#8f5a2e', x0 + 22, y + 1);
  }
  for (const lx of [5, 17]) for (let j = 0; j < 6; j++) p.set('#ecd8a0', rx0 + lx - Math.floor(j / 2), ry0 + 1 + j);
  for (let x = rx0 - 1; x < rx0 + 26; x++) if (hash(x, 1) > 0.3) p.set('#e8f6ff', x, ry0 + 7);
  return p;
}

// fronds: drooping arcs from the crown with leaflets; `sway` nudges the tips
function fronds(sway) {
  const p = new Pix();
  const [cx, cy] = PALM_TOP;
  const list = [[176, 18, 8], [150, 16, 8], [124, 12, 6], [98, 9, 4], [76, 12, 6], [46, 16, 8], [16, 18, 8], [-22, 14, 6], [204, 14, 6], [-55, 9, 4], [235, 9, 4]];
  for (const [deg, len, droop] of list) {
    const a = (deg * Math.PI) / 180;
    const dx = Math.cos(a);
    const dy = -Math.sin(a);
    let prev = null;
    for (let i = 0; i <= len * 2; i++) {
      const s = i / (len * 2);
      const tip = s * s;
      const x = Math.round(cx + dx * len * s + (dx >= 0 ? 1 : -1) * sway * tip);
      const y = Math.round(cy + dy * len * s + droop * s * s + sway * 0.5 * tip);
      if (prev && prev[0] === x && prev[1] === y) continue;
      prev = [x, y];
      p.set(s < 0.5 ? '#237a2c' : '#2f8f2f', x, y);
      if (s < 0.7) p.set('#237a2c', x, y + 1);
      if (i % 2 === 0 && s > 0.12) {
        const ll = s < 0.85 ? 3 : 2;
        for (let k = 1; k <= ll; k++) p.set(k === 1 ? '#4fae3a' : '#3c9a34', x - Math.sign(dx || 1) * (k > 2 ? 1 : 0), y + k);
        if (s < 0.8) { p.set('#86d24c', x, y - 1); if (Math.abs(dy) < 0.6) p.set('#5fbf4a', x + Math.sign(dx || 1), y - 2); }
      }
    }
  }
  for (const [x, y] of [[91, 24], [94, 25], [96, 23]]) {
    p.ellipse('#6b3f1a', x, y, 1.6, 1.6);
    p.set('#a0703a', x - 1, y - 1);
  }
  return p;
}

// red paint-program text with a white halo so it reads on sky or sea
function annotate(p, s, x, y, o = {}) {
  const t = new Pix();
  drawText(t, SANS, s, x, y, '#ff0000', o);
  for (const k of t.m.keys()) {
    const xx = KX(k);
    const yy = KY(k);
    for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) if (!t.m.has(KEY(xx + i, yy + j))) p.set('#ffffff', xx + i, yy + j);
  }
  p.merge(t);
  return textWidth(SANS, s, o);
}
function arrow(p, x0, y0, x1, y1) {
  const halo = new Pix();
  const ink = new Pix();
  ink.line('#ff0000', x0, y0, x1, y1);
  const a = Math.atan2(y1 - y0, x1 - x0);
  for (const da of [0.6, -0.6]) ink.line('#ff0000', x1, y1, Math.round(x1 - 3.5 * Math.cos(a + da)), Math.round(y1 - 3.5 * Math.sin(a + da)));
  for (const k of ink.m.keys()) {
    const xx = KX(k);
    const yy = KY(k);
    for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) if (!ink.m.has(KEY(xx + i, yy + j))) halo.set('#ffffff', xx + i, yy + j);
  }
  p.merge(halo).merge(ink);
}

function photo(css, T) {
  const PHASE_A = [[0, 15], [21, 24]];
  const PHASE_B = [[15, 21]];
  let o = photoBackdrop();
  o += photoBase().svg();
  // clouds drift left a pixel every half second and wrap
  const clouds = new Pix();
  const cloud = (cx, cy, s) => {
    for (const [dx, dy, rx, ry] of [[0, 0, 7, 3], [-6, 1, 5, 2.4], [6, 1, 5.5, 2.6], [-2, -2, 4.5, 2.6], [3, -2.5, 4, 2.4]]) clouds.ellipse('#ffffff', cx + dx * s, cy + dy * s, rx * s, ry * s);
    const yb = Math.round(cy + 2.6 * s);
    for (let x = Math.round(cx - 10 * s); x <= cx + 10 * s; x++) if (clouds.get(x, yb) === '#ffffff') clouds.set('#d8e8f8', x, yb);
  };
  cloud(24, 10, 1); cloud(70, 6, 0.8); cloud(140, 13, 1.1); cloud(108, 25, 0.6);
  const cl = clouds.svg();
  css.add(`@keyframes cl{to{transform:translate(-${PW}px,0)}}.cl{animation:cl ${PW / 2}s steps(${PW}) infinite}`);
  o += `<g class="cl"><g id="cld">${cl}</g><use href="#cld" x="${PW}"/></g>`;
  // sea glints, two frames a beat apart
  for (let f = 0; f < 2; f++) {
    const gl = new Pix();
    const r = mulberry32(40 + f);
    for (let i = 0; i < 26; i++) {
      const x = Math.floor(r() * PW);
      const y = HORIZON + 3 + Math.floor(r() * (PH - HORIZON - 4));
      if (ell(x, y, { cx: 86, cy: 67, rx: 58, ry: 14 }) < 1.02) continue;
      gl.set('#ffffff', x, y);
      if (r() < 0.4) gl.set('#ffffff', x + 1, y);
    }
    o += g(css.frame(2 * BEAT, 2, f), gl.svg());
  }
  // foam round the sand, two frames a bar apart
  for (let f = 0; f < 2; f++) {
    const fo = new Pix();
    for (let y = 54; y < 80; y++) {
      for (let x = 30; x < 140; x++) {
        const d = ell(x, y, { ...ISLE, rx: ISLE.rx + 2.2, ry: ISLE.ry + 1.4 });
        const d0 = ell(x, y, ISLE);
        if (d0 >= 1 && d < 1 && hash(x, y, 11 + f) > 0.25) fo.set(hash(x, y, 20 + f) > 0.5 ? '#ffffff' : '#c8f0f4', x, y);
      }
    }
    o += g(css.frame(BAR, 2, f), fo.svg());
  }
  // palm crown, swaying between two frames
  o += g(css.frame(2 * BAR, 2, 0), fronds(0).svg());
  o += g(css.frame(2 * BAR, 2, 1), fronds(1).svg());
  // her, on the sand, nodding on the beat (head down on the beat)
  const up = new Pix(); up.sprite(HER_UP, HER_PAL, ...HER_AT);
  const nod = new Pix(); nod.sprite(HER_NOD, HER_PAL, ...HER_AT);
  const sand = g(css.vis(BEAT, [[BEAT / 2, BEAT]], true), up.svg()) + g(css.vis(BEAT, [[0, BEAT / 2]], false), nod.svg());
  const la = new Pix();
  annotate(la, 'me!', 26, 37);
  arrow(la, 41, 42, 54, 49);
  annotate(la, 'my palm', 120, 3);
  arrow(la, 128, 12, 112, 21);
  o += g(css.vis(T, PHASE_A), sand + la.svg());
  // up the palm: phone high, one bar of signal blinking on the beat
  const cr = new Pix(); cr.sprite(HER_CROWN, HER_PAL, ...CROWN_AT);
  const leaf = new Pix();
  for (const [x0, y0, x1, y1] of [[82, 22, 92, 18], [99, 20, 108, 24], [84, 23, 90, 21]]) leaf.line('#2f8f2f', x0, y0, x1, y1);
  for (let x = 84; x < 106; x += 2) leaf.set('#4fae3a', x, 22 + (x % 4 === 0 ? 1 : 0));
  const sig = new Pix();
  const [sx, sy] = [98, 0];
  sig.rect('#000000', sx, sy, 12, 7); sig.rect('#ffffff', sx + 1, sy + 1, 10, 5);
  for (let i = 0; i < 4; i++) {
    const hh = i + 1;
    if (i === 0) sig.rect('#00aa00', sx + 2 + i * 2, sy + 6 - hh, 1, hh);
    else sig.rect('#b0b0b0', sx + 2 + i * 2, sy + 6 - hh, 1, hh);
  }
  const lb = new Pix();
  annotate(lb, 'still me!', 113, 12);
  arrow(lb, 111, 16, 99, 15);
  o += g(css.vis(T, PHASE_B), cr.svg() + leaf.svg() + g(css.vis(BEAT, [[0, BEAT / 2]], true), sig.svg()) + lb.svg());
  // always: the raft label
  const lr = new Pix();
  annotate(lr, 'my raft', 128, 45);
  arrow(lr, 146, 54, 148, 61);
  o += lr.svg();
  // a sea turtle paddles across the front, two pixels every quarter second
  const tp = [0, 1].map((f) => { const q = new Pix(); q.sprite(TURTLE[f], TURTLE_PAL, 0, 0); return q.svg(); });
  const steps = Math.round(T / 0.25);
  css.add(`@keyframes tu{from{transform:translate(-18px,77px)}to{transform:translate(${-18 + 2 * steps}px,77px)}}.tu{transform:translate(40px,77px);animation:tu ${n(T)}s steps(${steps}) infinite}`);
  o += `<g class="tu">${g(css.frame(BEAT, 2, 0), tp[0])}${g(css.frame(BEAT, 2, 1), tp[1])}</g>`;
  return o;
}

// ------------------------------------------------------------------ rainbow rule
function hsv(h, s, v) {
  const f = (k) => { const kk = (k + h / 60) % 6; return v - v * s * Math.max(0, Math.min(kk, 4 - kk, 1)); };
  return `#${[f(5), f(3), f(1)].map((c) => Math.round(c * 255).toString(16).padStart(2, '0')).join('')}`;
}
const mixHex = (a, b, t) => `#${[1, 3, 5].map((i) => Math.round(parseInt(a.slice(i, i + 2), 16) * (1 - t) + parseInt(b.slice(i, i + 2), 16) * t).toString(16).padStart(2, '0')).join('')}`;
// a 3D tube of rainbow that scrolls left
// 24 hard colour steps a lap, as a repeating gradient with doubled stops;
// a lighter top row and a darker bottom row make it a tube
function rainbowRule(css, id, x, y, w, period = 120, T = 6) {
  const levels = 24;
  let stops = '';
  for (let i = 0; i < levels; i++) {
    const c = short(hsv((i * 360) / levels, 1, 1));
    stops += `<stop offset="${n(i / levels)}" stop-color="${c}"/><stop offset="${n((i + 1) / levels)}" stop-color="${c}"/>`;
  }
  css.add(`@keyframes ${id}{to{transform:translate(-${period}px,0)}}.${id}{animation:${id} ${n(T)}s steps(${period / 2}) infinite}`);
  const ww = w + period;
  return `<linearGradient id="${id}g" gradientUnits="userSpaceOnUse" x1="0" x2="${period}" y1="0" y2="0" spreadMethod="repeat">${stops}</linearGradient>`
    + `<clipPath id="${id}c"><rect x="${x}" y="${y}" width="${w}" height="4"/></clipPath><g clip-path="url(#${id}c)"><g transform="translate(${x} ${y})"><g class="${id}"><rect width="${ww}" height="4" fill="url(#${id}g)"/></g></g>`
    + `<rect x="${x}" y="${y}" width="${w}" height="1" fill="#fff" fill-opacity=".55"/><rect x="${x}" y="${y + 3}" width="${w}" height="1" fill="#000" fill-opacity=".45"/></g>`;
}

// ------------------------------------------------------------------ starfield
function starTile(css, size = 40) {
  const r = mulberry32(1997);
  const p = new Pix();
  const dim = ['#55557a', '#8080a0', '#b0b0c8'];
  for (let i = 0; i < 18; i++) p.set(dim[Math.floor(r() * 3)], Math.floor(r() * size), Math.floor(r() * size));
  for (let i = 0; i < 4; i++) p.set('#ffffff', Math.floor(r() * size), Math.floor(r() * size));
  for (const c of ['#ffff00', '#00ffff', '#ff66ff']) p.set(c, Math.floor(r() * size), Math.floor(r() * size));
  const plus = (q, c, x, y) => { q.set(c, x, y); q.set(c, x - 1, y); q.set(c, x + 1, y); q.set(c, x, y - 1); q.set(c, x, y + 1); };
  const a = new Pix();
  const b = new Pix();
  plus(a, '#ffffff', 9, 13); b.set('#ffffff', 9, 13);
  plus(b, '#ffff99', 30, 30); a.set('#ffff99', 30, 30);
  plus(p, '#99ccff', 24, 5);
  return `<g id="st">${p.svg()}${g(css.frame(3 * BEAT, 2, 0, 0, true), a.svg())}${g(css.frame(3 * BEAT, 2, 1, 0, false), b.svg())}</g>`;
}
function starfield(css, W, H, size = 40) {
  let uses = '';
  for (let y = 0; y < H; y += size) for (let x = 0; x < W; x += size) if (x || y) uses += `<use href="#st" x="${x}" y="${y}"/>`;
  return `<rect width="${W}" height="${H}" fill="#000"/>${starTile(css, size)}${uses}`;
}

// ------------------------------------------------------------------ marquee
const MARQUEE = [
  ['#ffff00', '*** Welcome to my homepage!!! '],
  ['#00ffff', '*** '],
  ['#ffffff', 'CASTAWAY is a 10-hour lo-fi island video in which almost nothing happens, on purpose '],
  ['#ff66ff', '*** '],
  ['#ffff00', 'she nods to the music, and every so often something happens, always on the beat '],
  ['#00ffff', '*** '],
  ['#ffffff', 'more than 90 activities, most of them on four timers '],
  ['#ff66ff', '*** '],
  ['#ffff00', 'she is busy about a third of the time. the rest is nodding '],
  ['#00ffff', '*** '],
  ['#ffffff', 'if nothing is happening, it is working '],
  ['#ff66ff', '*** '],
  ['#ffff00', 'every sound is synthesized from code: no samples, no loops, no recordings '],
  ['#00ffff', '*** '],
  ['#ffffff', 'to visit: python tools/serve.py then open http://127.0.0.1:8765/ '],
  ['#ff66ff', '*** '],
  ['#00ff00', 'please sign my guestbook!!! '],
];
function marquee(css, x, y, w, h) {
  const bank = new GlyphBank('mg');
  let cx = 0;
  let txt = '';
  for (const [c, s] of MARQUEE) { const u = useText(bank, SANS, s, cx, 0, c); txt += u.svg; cx += u.w + 1; }
  const period = cx + 24;
  const speed = 20;
  const T = period / speed;
  css.add(`@keyframes mq{to{transform:translate(-${period}px,0)}}.mq{animation:mq ${n(T)}s steps(${period}) infinite}`);
  const ty = Math.round(y + (h - 9) / 2) + 1;
  const box = new Pix();
  box.rect('#000080', x, y, w, h);
  box.rect('#404040', x, y, w, 1); box.rect('#404040', x, y, 1, h);
  box.rect('#c0c0c0', x, y + h - 1, w, 1); box.rect('#c0c0c0', x + w - 1, y, 1, h);
  return { svg: `${box.svg()}<clipPath id="mqc"><rect x="${x + 1}" y="${y + 1}" width="${w - 2}" height="${h - 2}"/></clipPath><g clip-path="url(#mqc)"><g transform="translate(${x + 8} ${ty})"><g class="mq"><defs>${bank.defs()}</defs><g id="mqt">${txt}</g><use href="#mqt" x="${period}"/></g></g></g>`, T };
}

// ------------------------------------------------------------------ sign
function signPix(cx, cy, r) {
  const p = new Pix();
  for (let y = cy - r; y <= cy + r; y++) {
    for (let x = cx - r; x <= cx + r; x++) {
      const d = Math.abs(x - cx) + Math.abs(y - cy);
      if (d > r) continue;
      let c = '#ffcc00';
      if (d > r - 1.5) c = '#000000';
      else if (d > r - 3) c = '#ffcc00';
      else if (d > r - 4) c = '#000000';
      else if (y < cy - r / 3 && x < cx) c = '#ffd84a';
      p.set(c, x, y);
    }
  }
  p.sprite(DIGGER, { '#': '#000000' }, cx - 10, cy - 5);
  return p;
}
function lamp(x, y, on) {
  const p = new Pix();
  if (on) {
    for (const [dx, dy] of [[-4, 0], [4, 0], [0, -4], [0, 4], [-3, -3], [3, -3], [-3, 3], [3, 3]]) p.set('#ff9900', x + dx, y + dy);
    p.ellipse('#ffaa00', x + 0.5, y + 0.5, 3, 3);
    p.ellipse('#ffff66', x + 0.5, y + 0.5, 1.6, 1.6);
  } else {
    p.ellipse('#704000', x + 0.5, y + 0.5, 3, 3);
    p.set('#a06010', x - 1, y - 1);
  }
  return p;
}
// black matte under text that sits on the starfield, so no star touches a
// letter: one black box per line of text, 1 px bigger than its ink all round
// (a box per line costs a few bytes; a pixel-exact halo cost kilobytes, and
// on a black page the two look the same)
function matted(p) {
  const rows = new Map();
  for (const k of p.m.keys()) {
    const x = KX(k); const y = KY(k);
    const r = rows.get(y) || [Infinity, -Infinity];
    rows.set(y, [Math.min(r[0], x), Math.max(r[1], x)]);
  }
  const ys = [...rows.keys()].sort((a, b) => a - b);
  let m = '';
  for (let i = 0; i < ys.length;) {
    let j = i;
    let [x0, x1] = rows.get(ys[i]);
    while (j + 1 < ys.length && ys[j + 1] - ys[j] <= 2) { j++; x0 = Math.min(x0, rows.get(ys[j])[0]); x1 = Math.max(x1, rows.get(ys[j])[1]); }
    m += `<rect x="${x0 - 1}" y="${ys[i] - 1}" width="${x1 - x0 + 3}" height="${ys[j] - ys[i] + 3}"/>`;
    i = j + 1;
  }
  return { svg: () => m + p.svg() };
}
const place = (p, x, y) => { const q = new Pix(); for (const [k, c] of p.m) q.set(c, KX(k) + x, KY(k) + y); return q; };

// ------------------------------------------------------------------ banner
function banner() {
  const W = 400;
  const H = 234;
  const css = new Css('b');
  const T = 8 * BAR;
  let o = starfield(css, W, H);

  // welcome line with a black drop shadow, flanked by sparkles
  const welcome = 'Welcome to my Island Homepage!!!';
  const ww = textWidth(SERIF, welcome);
  const wx = Math.round(W / 2 - ww / 2);
  const wl = new Pix();
  drawText(wl, SERIF, welcome, wx + 1, 7, '#000000');
  drawText(wl, SERIF, welcome, wx, 6, '#ffff00');
  o += wl.svg();
  o += sparkle(css, wx - 10, 11, 3, 0, '#ffffff') + sparkle(css, wx + ww + 9, 11, 3, 1.5, '#ffffff');

  // the logo
  const lg = logoPix(0, 0, css);
  const lx = Math.round(W / 2 - (lg.w - 8) / 2);
  const ly = 30;
  o += place(lg.matte, lx, ly).svg() + place(lg.p, lx, ly).svg();
  o += sparkle(css, lx + lg.spans[1][0] + 4, ly - 2, 4.5, 0.6, '#ffffff');
  o += sparkle(css, lx + lg.spans[5][1] - 6, ly + 4, 4.5, 2.4, '#ffffcc');
  o += sparkle(css, lx + lg.spans[3][0] + 6, ly + 44, 4.5, 3.6, '#ffffff');

  // tagline
  const tl = new Pix();
  const tagline = 'a 10-hour lo-fi island video in which almost nothing happens, on purpose.';
  centreText(tl, SANS, tagline, W / 2 + 1, 89, '#000000');
  centreText(tl, SANS, tagline, W / 2, 88, '#00ff00');
  o += matted(tl).svg();

  o += rainbowRule(css, 'rr', 16, 100, W - 32);

  // the photo is a link, so it wears the blue link border
  const PX = 114;
  const PY = 109;
  const fr = new Pix();
  fr.rect('#0000ff', PX - 2, PY - 2, PW + 4, 2); fr.rect('#0000ff', PX - 2, PY + PH, PW + 4, 2);
  fr.rect('#0000ff', PX - 2, PY, 2, PH); fr.rect('#0000ff', PX + PW, PY, 2, PH);
  o += fr.svg();
  o += `<clipPath id="ph"><rect width="${PW}" height="${PH}"/></clipPath><g transform="translate(${PX} ${PY})" clip-path="url(#ph)">${photo(css, T)}</g>`;
  // caption, which changes while she is up the palm
  const capA = new Pix();
  const ca1 = 'my island!!!';
  const ca2 = '(click to enlarge)';
  const caw = textWidth(SANS, ca1) + textWidth(SANS, ca2) + 5;
  let cx0 = Math.round(PX + PW / 2 - caw / 2);
  cx0 += drawText(capA, SANS, ca1, cx0, PY + PH + 5, '#ffffff') + 5;
  drawText(capA, SANS, ca2, cx0, PY + PH + 5, '#00ffff', { underline: true });
  const capB = new Pix();
  centreText(capB, SANS, 'uploading this page... (1 bar)', PX + PW / 2, PY + PH + 5, '#ffffff');
  o += g(css.vis(T, [[0, 15], [21, 24]]), matted(capA).svg()) + g(css.vis(T, [[15, 21]]), matted(capB).svg());

  // left column: NEW! and the bottle
  const LC = 57;
  const b1 = burstPix(46, 26, '#ff0000', '#ffff00', '#ffff00');
  const b2 = burstPix(46, 26, '#ffff00', '#ff0000', '#ff0000');
  const bx = LC - 23;
  const by = 107;
  o += g(css.frame(2 * BEAT, 2, 0), place(b1, bx, by).svg()) + g(css.frame(2 * BEAT, 2, 1), place(b2, bx, by).svg());
  const cat = new Pix();
  centreText(cat, SERIF, 'the cat', LC, 135, '#ff00ff');
  centreText(cat, SERIF, 'came back!!', LC, 147, '#ff00ff');
  o += matted(cat).svg();
  bottleFrames(24, 8).forEach((p, i) => { o += g(css.frame(1.6, 8, i, 0, i === 0), place(p, LC - 12, 162).svg()); });
  const bm = new Pix();
  centreText(bm, SANS, 'bottle-mail me!', LC, 189, '#00ffff', { underline: true });
  centreText(bm, SANS, '(it washes back)', LC, 200, '#c0c0c0');
  o += matted(bm).svg();

  // right column: the sign, its lamps, the excuse
  const RC = 344;
  o += signPix(RC, 134, 22).svg();
  o += g(css.frame(2 * BEAT, 2, 0, 0, true), lamp(RC - 26, 134, true).svg() + lamp(RC + 26, 134, false).svg());
  o += g(css.frame(2 * BEAT, 2, 1, 0, false), lamp(RC - 26, 134, false).svg() + lamp(RC + 26, 134, true).svg());
  const uc = new Pix();
  centreText(uc, SANS, 'UNDER', RC, 162, '#ffff00', { bold: true });
  centreText(uc, SANS, 'CONSTRUCTION', RC, 172, '#ffff00', { bold: true });
  centreText(uc, SANS, '(so is the', RC, 187, '#ffffff');
  centreText(uc, SANS, 'sandcastle)', RC, 197, '#ffffff');
  o += matted(uc).svg();

  o += marquee(css, 6, 211, W - 12, 17).svg;

  const ed = new Pix();
  ed.frame('#808080', 0, 0, W, H);
  o += ed.svg();

  const title = 'CASTAWAY: Welcome to my Island Homepage!!!';
  const desc = 'A late-1990s personal homepage for Castaway, a ten-hour lo-fi island video: a starry tiled background, a yellow serif welcome line, CASTAWAY in fat 3D rainbow letters, a scrolling rainbow rule, an annotated photo of the island with her nodding to the music, a NEW! starburst, a tumbling message in a bottle, an under-construction sign with flashing lamps, and a marquee.';
  return svgDoc(W, H, 2, title, desc, css, o);
}

// ------------------------------------------------------------------ the kit
// The rest of the homepage comes as separate images, the way it did: a
// rainbow rule to put between sections, the hit counter, the construction
// strip, a NEW! burst to stick next to things, the bottle for "e-mail me",
// and a drawer of 88x31 buttons, each one its own file so each can be a link.

function rainbowSvg() {
  const css = new Css('r');
  const W = 400;
  const body = rainbowRule(css, 'rw', 0, 0, W, 120, 6);
  return svgDoc(W, 4, 2, 'Rainbow divider', 'An animated rainbow bar, the kind used as a horizontal rule.', css, body);
}

// You are visitor number 000001. It keeps trying for 2.
function counterSvg() {
  const css = new Css('c');
  const cells = 6;
  const cw = 9;
  const ch = 13;
  const W = cells * (cw + 1) + 3;
  const H = ch + 4;
  const p = new Pix();
  p.rect('#404040', 0, 0, W, H);
  p.rect('#808080', 0, 0, W, 1); p.rect('#808080', 0, 0, 1, H);
  p.rect('#ffffff', 0, H - 1, W, 1); p.rect('#ffffff', W - 1, 0, 1, H);
  for (let i = 0; i < cells; i++) {
    const x = 2 + i * (cw + 1);
    p.rect('#000000', x, 2, cw, ch);
    p.rect('#262626', x, 2, cw, 1);
    p.rect('#262626', x, 2 + ch - 1, cw, 1);
    if (i < cells - 1) drawText(p, DIGITS, '0', x + 2, 4, '#ffffff');
  }
  const x5 = 2 + (cells - 1) * (cw + 1);
  const strip = new Pix();
  drawText(strip, DIGITS, '1', 2, 2, '#ffffff');
  drawText(strip, DIGITS, '2', 2, 2 + ch, '#ffffff');
  // 8 s: rest on 1, roll up half a figure towards 2, think, slide back
  const T = 8;
  const k = (t) => pct(t, T);
  css.add(`@keyframes ro{0%{transform:translate(0,0);animation-timing-function:step-end}${k(4.5)}{transform:translate(0,0);animation-timing-function:steps(7,end)}${k(5.55)}{transform:translate(0,-7px);animation-timing-function:step-end}${k(6.6)}{transform:translate(0,-7px);animation-timing-function:steps(7,end)}${k(7.3)}{transform:translate(0,0)}100%{transform:translate(0,0)}}.ro{animation:ro ${T}s infinite}`);
  // a glint on the glass
  const gl = new Pix();
  for (let i = 0; i < cells; i++) gl.rect('#ffffff', 2 + i * (cw + 1) + 1, 3, 2, 1);
  const body = `${p.svg()}<clipPath id="cc"><rect x="${x5}" y="3" width="${cw}" height="${ch - 2}"/></clipPath><g clip-path="url(#cc)"><g transform="translate(${x5} 2)"><g class="ro">${strip.svg()}</g></g></g><g opacity=".35">${gl.svg()}</g>`;
  return svgDoc(W, H, 2, 'Hit counter: 000001', 'An odometer hit counter reading 000001. Every few seconds the last figure starts to roll towards 2, thinks better of it and settles back on 1.', css, body);
}

// PARDON OUR SAND: the yellow-and-black strip along the bottom of the page
function stripSvg() {
  const css = new Css('s');
  const W = 400;
  const H = 20;
  const tile = new Pix();
  for (let y = 0; y < 12; y++) for (let x = 0; x < 12; x++) tile.set(((x + y) % 12) < 6 ? '#ffcc00' : '#111111', x, y);
  css.add(`@keyframes hz{to{transform:translate(-12px,0)}}.hz{animation:hz ${n(2 * BEAT)}s steps(12) infinite}`);
  let o = `<pattern id="hp" width="12" height="12" patternUnits="userSpaceOnUse">${tile.svg()}</pattern>`;
  o += `<clipPath id="hc"><rect width="${W}" height="${H}"/></clipPath><g clip-path="url(#hc)"><g class="hz"><rect y="1" width="${W + 12}" height="${H - 2}" fill="url(#hp)"/></g></g>`;
  const fr = new Pix();
  fr.rect('#000000', 0, 0, W, 1); fr.rect('#000000', 0, H - 1, W, 1);
  const msg = 'PARDON OUR SAND: THIS ISLAND IS UNDER CONSTRUCTION';
  const tw = textWidth(SANS, msg);
  const pw = tw + 16;
  const px = Math.round(W / 2 - pw / 2);
  fr.rect('#000000', px, 3, pw, H - 6);
  fr.frame('#ffcc00', px + 1, 4, pw - 2, H - 8);
  drawText(fr, SANS, msg, px + 8, 6, '#ffff00');
  o += fr.svg();
  o += g(css.frame(2 * BEAT, 2, 0, 0, true), lamp(px - 7, 9, true).svg() + lamp(px + pw + 6, 9, false).svg());
  o += g(css.frame(2 * BEAT, 2, 1, 0, false), lamp(px - 7, 9, false).svg() + lamp(px + pw + 6, 9, true).svg());
  return svgDoc(W, H, 2, 'Pardon our sand: this island is under construction', 'A strip of marching yellow and black hazard stripes with an amber lamp flashing at each end of a black plate that reads PARDON OUR SAND: THIS ISLAND IS UNDER CONSTRUCTION.', css, o);
}

// shown at 1x (40x20) in the list, like a NEW! GIF dropped into a line of
// text: small enough not to push the line apart
function newSvg() {
  const css = new Css('n');
  const W = 40;
  const H = 20;
  const a = burstPix(W, H, '#ff0000', '#ffff00', '#ffff00');
  const b = burstPix(W, H, '#ffff00', '#ff0000', '#ff0000');
  const o = g(css.frame(2 * BEAT, 2, 0), a.svg()) + g(css.frame(2 * BEAT, 2, 1), b.svg());
  return svgDoc(W, H, 2, 'NEW!', 'A blinking NEW! starburst.', css, o);
}

function bottleSvg() {
  const css = new Css('m');
  const S = 28;
  let o = '';
  bottleFrames(S, 8).forEach((p, i) => { o += g(css.frame(1.6, 8, i, 0, i === 0), p.svg()); });
  return svgDoc(S, S, 2, 'Bottle-mail me!', 'A green message in a bottle with a rolled note inside, tumbling end over end like a spinning e-mail icon.', css, o);
}

// ------------------------------------------------------------------ 88x31
function bands(p, x, y, w, h, cols) {
  for (let j = 0; j < h; j++) p.rect(cols[Math.min(cols.length - 1, Math.floor((j * cols.length) / h))], x, y + j, w, 1);
}
function shadowText(p, font, s, x, y, c, sh, o = {}) {
  drawText(p, font, s, x + 1, y + 1, sh, o);
  return drawText(p, font, s, x, y, c, o);
}
const centreIn = (font, s, x0, x1, o = {}) => Math.round((x0 + x1 + 1) / 2 - textWidth(font, s, o) / 2);
function button(slug, title, desc, draw) {
  const css = new Css('k');
  const p = new Pix();
  const extra = draw(p, css) || '';
  return { slug, svg: svgDoc(88, 31, 2, title, desc, css, p.svg() + extra) };
}
function frameIt(p, edge = '#000000') { p.frame(edge, 0, 0, 88, 31); }

const BUTTONS = [
  button('serve', 'GET SERVE.PY NOW!', '88x31 button: a little terminal with a blinking cursor, then GET SERVE.PY NOW! on blue.', (p, css) => {
    frameIt(p);
    p.rect('#c0c0c0', 1, 1, 27, 4); p.rect('#000080', 2, 2, 3, 2); p.rect('#808080', 1, 5, 27, 1);
    p.rect('#000000', 1, 6, 27, 24);
    drawText(p, TINY, '>', 3, 9, '#00ff00');
    drawText(p, TINY, 'SERVE', 8, 9, '#00ff00');
    drawText(p, TINY, '8765', 4, 17, '#00aa00');
    bands(p, 28, 1, 59, 29, ['#001a80', '#0029a3', '#0033cc', '#1a4de0', '#3366ff']);
    p.rect('#000000', 28, 1, 1, 29);
    shadowText(p, TINY, 'GET', 32, 3, '#ffff00', '#000040');
    shadowText(p, SANS, 'SERVE.PY', 32, 11, '#ffffff', '#000040', { bold: true });
    const nw = textWidth(TINY, 'NOW!');
    shadowText(p, TINY, 'NOW!', 84 - nw, 22, '#ffff00', '#000040');
    const cur = new Pix(); cur.rect('#00ff00', 4, 25, 3, 2);
    return g(css.frame(2 * BEAT, 2, 0), cur.svg());
  }),
  button('activities', '90+ ACTIVITIES, ON THE BEAT', '88x31 button: a clock face whose hand jumps a quarter turn every beat, then 90+ ACTIVITIES, ON THE BEAT, on purple.', (p, css) => {
    frameIt(p);
    bands(p, 1, 1, 86, 29, ['#2a0055', '#3d006b', '#520080', '#660099', '#7a00a3', '#8f00ad']);
    p.ellipse('#000000', 14.5, 15.5, 11, 11);
    p.ellipse('#ffffff', 14.5, 15.5, 10, 10);
    p.ellipse('#ffe8f0', 13.5, 13.5, 6, 6);
    for (let i = 0; i < 12; i++) {
      const a = (i * Math.PI) / 6;
      p.set(i % 3 === 0 ? '#ff0066' : '#000000', Math.round(14 + 8 * Math.cos(a)), Math.round(15 - 8 * Math.sin(a)));
    }
    p.line('#000000', 14, 15, 14, 11);
    p.rect('#ff0066', 14, 15, 1, 1);
    let o = '';
    const hands = [[14, 8], [21, 15], [14, 22], [7, 15]];
    hands.forEach(([x, y], i) => { const q = new Pix(); q.line('#000000', 14, 15, x, y); q.set('#ff0066', 14, 15); o += g(css.frame(4 * BEAT, 4, i), q.svg()); });
    shadowText(p, SERIF, '90+', 30, 1, '#ffff00', '#000000');
    shadowText(p, TINY, 'ACTIVITIES', 30, 15, '#ffffff', '#1a0033');
    shadowText(p, TINY, 'ON THE BEAT', 30, 23, '#00ffff', '#1a0033');
    return o;
  }),
  button('synth', '100% SYNTH, NO SAMPLES', '88x31 button: a green oscilloscope trace rolling on a black screen, then 100% SYNTH, NO SAMPLES.', (p, css) => {
    frameIt(p);
    p.rect('#000000', 1, 1, 27, 29);
    for (let x = 2; x < 28; x += 4) p.rect('#003300', x, 2, 1, 27);
    for (let y = 3; y < 30; y += 4) p.rect('#003300', 1, y, 27, 1);
    p.rect('#005500', 1, 15, 27, 1);
    let o = '';
    for (let f = 0; f < 4; f++) {
      const q = new Pix();
      let prev = null;
      for (let x = 2; x < 28; x++) {
        const y = Math.round(15 - 8 * Math.sin(((x - 2) / 26) * 2 * Math.PI * 1.5 + (f * Math.PI) / 2));
        if (prev !== null) for (let yy = Math.min(prev, y); yy <= Math.max(prev, y); yy++) q.set('#00ff00', x, yy);
        else q.set('#00ff00', x, y);
        prev = y;
      }
      o += g(css.frame(1, 4, f), q.svg());
    }
    bands(p, 28, 1, 59, 29, ['#002200', '#003300', '#004400', '#005500']);
    p.rect('#000000', 28, 1, 1, 29);
    shadowText(p, SANS, '100%', 32, 3, '#ffff00', '#000000', { bold: true });
    shadowText(p, SANS, 'SYNTH', 32, 12, '#ffffff', '#000000', { bold: true });
    shadowText(p, TINY, 'NO SAMPLES', 32, 23, '#66ff66', '#000000');
    return o;
  }),
  button('headphones', 'BEST VIEWED WITH HEADPHONES', '88x31 button: BEST VIEWED WITH across a coral band, then a pair of cream headphones that nod on the beat and HEADPHONES.', (p, css) => {
    frameIt(p);
    p.rect('#ff7b5e', 1, 1, 86, 8);
    p.rect('#d65a42', 1, 9, 86, 1);
    drawText(p, TINY, 'BEST VIEWED WITH', centreIn(TINY, 'BEST VIEWED WITH', 1, 86), 3, '#ffffff');
    p.rect('#fff4d8', 1, 10, 86, 20);
    let o = '';
    for (let f = 0; f < 2; f++) {
      const q = new Pix();
      const dy = f;
      // band
      for (let a = 0; a <= 180; a += 6) {
        const r = a * Math.PI / 180;
        const x = Math.round(12 + 7 * Math.cos(r));
        const y = Math.round(21 - 8 * Math.sin(r)) + dy;
        q.set('#4a3a2a', x, y);
        q.set('#e8dcc0', x, y + 1);
      }
      // cups
      for (const cx of [4, 17]) {
        q.rect('#4a3a2a', cx, 19 + dy, 4, 8);
        q.rect('#ffe9c4', cx + 1, 20 + dy, 2, 6);
        q.rect('#ff7b5e', cx + (cx < 10 ? 2 : 1), 21 + dy, 1, 4);
      }
      o += g(css.vis(BEAT, f ? [[0, BEAT / 2]] : [[BEAT / 2, BEAT]], !f), q.svg());
    }
    drawText(p, SANS, 'HEADPHONES', 25, 16, '#b8321e');
    return o;
  }),
  button('resolution', 'BEST VIEWED AT 1920x1080', '88x31 button in grey with a bevel: a small monitor showing the island, then BEST VIEWED AT 1920x1080, 30 FPS 16:9.', (p, css) => {
    frameIt(p);
    p.rect('#c0c0c0', 1, 1, 86, 29);
    p.rect('#ffffff', 1, 1, 86, 1); p.rect('#ffffff', 1, 1, 1, 29);
    p.rect('#808080', 1, 29, 86, 1); p.rect('#808080', 86, 1, 1, 29);
    // monitor
    p.rect('#808080', 4, 4, 20, 16); p.rect('#e0e0e0', 4, 4, 20, 1); p.rect('#e0e0e0', 4, 4, 1, 16);
    p.rect('#000000', 6, 6, 16, 11);
    bands(p, 7, 7, 14, 4, ['#3a7ce0', '#7ec0f8']);
    p.rect('#2468c4', 7, 11, 14, 5);
    p.rect('#f4d9a0', 10, 13, 8, 2); p.rect('#a65d33', 15, 9, 1, 4); p.rect('#2f8f2f', 13, 8, 5, 1);
    p.rect('#ff7b5e', 12, 12, 1, 1);
    p.rect('#808080', 11, 20, 6, 2); p.rect('#a0a0a0', 8, 22, 12, 2); p.rect('#606060', 8, 23, 12, 1);
    const led = new Pix(); led.rect('#00ff00', 21, 18, 1, 1);
    drawText(p, TINY, 'BEST VIEWED AT', 28, 4, '#000000');
    drawText(p, SANS, '1920x1080', 28, 12, '#000080');
    drawText(p, TINY, '30 FPS 16:9', 28, 23, '#800000');
    return g(css.frame(4 * BEAT, 2, 0), led.svg());
  }),
  button('seed', 'SEED 1992: SAME SEED, SAME RUN', '88x31 button in green: two dice that wobble but never change their faces, then SEED 1992, SAME SEED, SAME RUN.', (p, css) => {
    frameIt(p);
    bands(p, 1, 1, 86, 29, ['#003d1f', '#004d26', '#005c2e', '#006b36', '#007a3d']);
    const die = (q, x, y, face) => {
      q.rect('#000000', x, y, 11, 11);
      q.rect('#ffffff', x + 1, y + 1, 9, 9);
      q.rect('#d0d0d0', x + 1, y + 9, 9, 1); q.rect('#d0d0d0', x + 9, y + 1, 1, 9);
      const pips = { 1: [[4, 4]], 3: [[2, 2], [4, 4], [6, 6]], 5: [[2, 2], [6, 2], [4, 4], [2, 6], [6, 6]], 6: [[2, 2], [6, 2], [2, 4], [6, 4], [2, 6], [6, 6]] }[face];
      for (const [px, py] of pips) q.rect(face === 1 ? '#ff0000' : '#000000', x + 1 + px, y + 1 + py, 1, 1);
    };
    let o = '';
    for (let f = 0; f < 2; f++) {
      const q = new Pix();
      die(q, 3 + f, 4, 1);
      die(q, 13 - f, 15, 6);
      o += g(css.frame(2 * BEAT, 2, f), q.svg());
    }
    shadowText(p, TINY, 'SEED', 30, 6, '#ffffff', '#002010');
    shadowText(p, SANS, '1992', 48, 4, '#ffff00', '#002010', { bold: true });
    shadowText(p, TINY, 'SAME SEED,', 30, 15, '#ccffcc', '#002010');
    shadowText(p, TINY, 'SAME RUN', 30, 22, '#ccffcc', '#002010');
    return o;
  }),
  button('daytime', 'ALWAYS DAYTIME', '88x31 button in sky blue: a yellow sun whose rays turn, then ALWAYS DAYTIME, NO NIGHTS.', (p, css) => {
    frameIt(p);
    bands(p, 1, 1, 86, 29, ['#0059b3', '#0066cc', '#1a80e6', '#3399ff', '#66b3ff', '#80c0ff']);
    let o = '';
    for (let f = 0; f < 2; f++) {
      const q = new Pix();
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4 + (f * Math.PI) / 8;
        for (let r = 8; r <= 11; r++) q.set('#ffcc00', Math.round(14 + r * Math.cos(a)), Math.round(15 - r * Math.sin(a)));
      }
      o += g(css.frame(2 * BEAT, 2, f), q.svg());
    }
    p.ellipse('#ff9900', 14.5, 15.5, 6.5, 6.5);
    p.ellipse('#ffff00', 14.5, 15.5, 5.5, 5.5);
    p.ellipse('#ffffcc', 13, 14, 2.2, 2.2);
    shadowText(p, SANS, 'ALWAYS', 30, 4, '#ffffff', '#002a66', { bold: true });
    shadowText(p, SANS, 'DAYTIME', 30, 13, '#ffff00', '#002a66', { bold: true });
    drawText(p, TINY, 'NO NIGHTS', 30, 23, '#002a66');
    return o;
  }),
  button('nonpm', 'NO NPM, NO BUILD STEP', '88x31 button in white: a cardboard box under a red no-entry circle, then NO NPM, NO BUILD STEP, ES MODULES.', (p) => {
    frameIt(p, '#cc0000');
    p.rect('#ffffff', 1, 1, 86, 29);
    // a box
    p.rect('#b07840', 6, 11, 16, 12); p.rect('#d09a5a', 6, 11, 16, 3); p.rect('#8a5a28', 6, 22, 16, 1);
    p.rect('#e8d29a', 13, 11, 2, 12);
    // no-entry ring and bar
    for (let y = 2; y < 30; y++) {
      for (let x = 2; x < 28; x++) {
        const d = Math.hypot(x + 0.5 - 14, y + 0.5 - 16);
        if (d <= 12 && d >= 10) p.set('#ee0000', x, y);
        const u = ((x + 0.5 - 14) + (y + 0.5 - 16)) / Math.SQRT2;
        if (d < 10.5 && Math.abs(u) <= 1.3) p.set('#ee0000', x, y);
      }
    }
    drawText(p, SANS, 'NO NPM', 31, 3, '#cc0000', { bold: true });
    drawText(p, TINY, 'NO BUILD STEP', 31, 14, '#000000');
    drawText(p, TINY, 'ES MODULES', 31, 22, '#606060');
    return '';
  }),
  button('site', 'CASTAWAY: link to me!', '88x31 site button: a tiny island with a palm and her in coral, then CASTAWAY, LO-FI ISLAND, 10 HOURS on coral and orange.', (p, css) => {
    frameIt(p);
    bands(p, 1, 1, 29, 13, ['#3a7ce0', '#55a0f0', '#7ec0f8', '#b4dcfc']);
    bands(p, 1, 14, 29, 16, ['#2a7ed2', '#2468c4', '#1d55b0']);
    p.ellipse('#5fd3d0', 15, 23, 13, 4);
    p.ellipse('#f4d9a0', 15, 23, 9.5, 2.6);
    for (let y = 9; y <= 22; y++) p.set(y % 3 ? '#a65d33' : '#c98b5c', 18 - Math.round((22 - y) * 0.2), y);
    for (const [dx, dy] of [[-5, 1], [-4, 0], [-3, -1], [-2, -1], [-1, 0], [1, -1], [2, -1], [3, 0], [4, 1], [-1, -2], [0, -2], [1, -2], [-6, 2], [5, 2], [0, -1]]) p.set('#2f8f2f', 15 + dx, 9 + dy);
    p.set('#6b3f1a', 15, 10);
    p.set('#5a3418', 10, 19); p.set('#ff7b5e', 10, 20); p.set('#f4e8c8', 10, 21); p.set('#fff4d8', 9, 19);
    p.rect('#a8653a', 23, 25, 5, 1);
    let o = '';
    for (let f = 0; f < 2; f++) {
      const q = new Pix();
      for (let x = 2; x < 29; x += 4) q.set('#ffffff', x + f * 2, 17 + ((x >> 2) % 2) * 9);
      o += g(css.frame(2 * BEAT, 2, f), q.svg());
    }
    bands(p, 30, 1, 57, 29, ['#ff6a4d', '#ff7b55', '#ff8c4d', '#ff9d45', '#ffad3d']);
    p.rect('#000000', 30, 1, 1, 29);
    const cx = centreIn(SANS, 'CASTAWAY', 31, 86);
    shadowText(p, SANS, 'CASTAWAY', cx, 4, '#ffffff', '#8a2a10');
    shadowText(p, TINY, 'LO-FI ISLAND', centreIn(TINY, 'LO-FI ISLAND', 31, 86), 15, '#fff4d8', '#8a2a10');
    shadowText(p, TINY, '10 HOURS', centreIn(TINY, '10 HOURS', 31, 86), 22, '#ffff66', '#8a2a10');
    return o;
  }),
  button('bpm', '80 BPM, F MAJOR, II-V-I-VI', '88x31 button in black: a little keyboard with a red light that blinks on every beat, then 80 BPM, F MAJOR, II-V-I-VI.', (p, css) => {
    frameIt(p, '#404040');
    p.rect('#000000', 1, 1, 86, 29);
    // keys
    p.rect('#ffffff', 3, 14, 23, 12);
    for (let i = 1; i < 7; i++) p.rect('#808080', 3 + i * 3 + (i > 0 ? 0 : 0), 14, 1, 12);
    for (const i of [0, 1, 3, 4, 5]) p.rect('#000000', 5 + i * 3, 14, 2, 7);
    p.rect('#404040', 3, 26, 23, 1);
    p.rect('#400000', 4, 4, 5, 5);
    const led = new Pix(); led.rect('#ff0000', 5, 5, 3, 3); led.set('#ffaaaa', 5, 5);
    drawText(p, TINY, 'BEAT', 11, 4, '#808080');
    shadowText(p, SANS, '80 BPM', 31, 3, '#00ff00', '#004400', { bold: true });
    drawText(p, TINY, 'F MAJOR', 31, 15, '#ffff00');
    drawText(p, TINY, 'II-V-I-VI', 31, 22, '#00ffff');
    return g(css.vis(BEAT, [[0, BEAT / 2]], true), led.svg());
  }),
  button('signal', 'SIGNAL: 1 BAR, TOP OF PALM', '88x31 button in daytime blue: a palm on a scrap of sand with a phone held up at the very top and one signal bar blinking, then SIGNAL: 1 BAR, TOP OF PALM.', (p, css) => {
    frameIt(p);
    bands(p, 1, 1, 86, 29, ['#3399ff', '#4da6ff', '#66b3ff', '#80c0ff', '#99ccff', '#b3d9ff']);
    p.rect('#2468c4', 1, 25, 28, 5);
    p.rect('#5cb8ea', 3, 27, 3, 1); p.rect('#5cb8ea', 21, 28, 4, 1);
    p.ellipse('#f4d9a0', 15, 26, 9, 2.2);
    for (let y = 11; y <= 25; y++) p.set(y % 3 ? '#a65d33' : '#c98b5c', 16 - Math.round((25 - y) * 0.15), y);
    for (const [dx, dy] of [[-6, 2], [-5, 1], [-4, 0], [-3, 0], [-2, -1], [-1, -1], [1, -1], [2, -1], [3, 0], [4, 0], [5, 1], [6, 2], [-1, 0], [0, 0], [1, 0], [0, -1], [-6, 3], [6, 3]]) p.set('#2f8f2f', 14 + dx, 11 + dy);
    p.set('#6b3f1a', 14, 12);
    // a hand and a phone, held up as high as it goes
    p.set('#f6c9a0', 14, 9); p.set('#f6c9a0', 14, 10);
    p.rect('#000000', 13, 4, 3, 5); p.rect('#9fe8ff', 14, 5, 1, 2);
    const bars = new Pix();
    bars.rect('#00cc00', 18, 7, 1, 1);
    for (let i = 1; i < 4; i++) p.rect('#ffffff', 18 + i * 2, 7 - i, 1, i + 1);
    p.rect('#1a4d80', 18, 7, 1, 1);
    drawText(p, TINY, 'SIGNAL:', 31, 3, '#000080');
    shadowText(p, SANS, '1 BAR', 31, 10, '#ffffff', '#000080', { bold: true });
    drawText(p, TINY, 'TOP OF PALM', 31, 22, '#000080');
    return g(css.vis(BEAT, [[0, BEAT / 2]], true), bars.svg());
  }),
  button('tenhours', '10:00:00, MOSTLY WAITING', '88x31 button: an amber clock display reading 10:00:00 with blinking colons, RUN LENGTH above and MOSTLY WAITING below.', (p, css) => {
    frameIt(p, '#404040');
    p.rect('#000000', 1, 1, 86, 29);
    p.rect('#1a1000', 4, 9, 80, 12);
    p.frame('#3a2a00', 4, 9, 80, 12);
    drawText(p, TINY, 'RUN LENGTH', centreIn(TINY, 'RUN LENGTH', 1, 86), 3, '#a06000');
    drawText(p, TINY, 'MOSTLY WAITING', centreIn(TINY, 'MOSTLY WAITING', 1, 86), 23, '#a06000');
    const x0 = centreIn(SANS, '10:00:00', 1, 86, { bold: true });
    // the figures, with the colons on their own layer so they can blink
    const t = new Pix();
    drawText(t, SANS, '10:00:00', x0, 12, '#ffb000', { bold: true });
    const colons = new Pix();
    for (const [k, c] of t.m) {
      const x = KX(k);
      const adv = (s) => x0 + textWidth(SANS, s, { bold: true }) + 1;
      const isColon = (x >= adv('10') && x < adv('10') + 2) || (x >= adv('10:00') && x < adv('10:00') + 2);
      if (isColon) colons.m.set(k, c); else p.m.set(k, c);
    }
    return g(css.vis(2 * BEAT, [[0, BEAT]], true), colons.svg());
  }),
];

// ------------------------------------------------------------------ main
fs.mkdirSync(ASSETS, { recursive: true });
const FILES = [
  ['', banner()],
  ['-rainbow', rainbowSvg()],
  ['-counter', counterSvg()],
  ['-construction', stripSvg()],
  ['-new', newSvg()],
  ['-bottle', bottleSvg()],
  ...BUTTONS.map((b) => [`-btn-${b.slug}`, b.svg]),
];
for (const [suffix, svg] of FILES) {
  fs.writeFileSync(outFile(suffix), svg);
  console.log(`${(svg.length / 1024).toFixed(1).padStart(6)} KB  ${path.basename(outFile(suffix))}`);
}
writeSheet();
