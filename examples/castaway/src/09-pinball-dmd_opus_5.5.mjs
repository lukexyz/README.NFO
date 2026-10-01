#!/usr/bin/env node
// Pinball dot-matrix display: README header generator for CASTAWAY.
//
//   node examples/castaway/src/09-pinball-dmd_opus_5.5.mjs
//
// Writes examples/castaway/assets/09-pinball-dmd_opus_5.5.svg.
// Plain Node, no dependencies, no clock, no Math.random: the same bytes every run.
//
// The picture is the score display of an imaginary 1990s pinball machine, the
// "CASTAWAY" table by the (invented) Becalmed Amusement Works: a 128 x 32 grid of
// round orange gas-plasma dots behind dark glass, in a black bezel. It runs an
// attract loop of 60 seconds: 20 bars of 3 seconds at 80 BPM, the same shape as
// the project's own theme, so every cut lands on a bar line like the gags do.
//
//    0  TITLE      the name in giant dot letters, a sparkle pass
//    6  ISLAND     she sips a coconut, nodding on the beat; a ship sails by
//   15  AWARD      SHIP MISSED (one inverted flash)
//   18  RULES      she idles; every so often something happens
//   21  COUNT      81 activities, counting up
//   24  SCORES     events in a typical 10-hour run, by tier
//   27  BOTTLE     message in a bottle: returned
//   33  DELIVERY   the drone's parcel is more headphones
//   36  SHARK      a shark (well, his fin) in headphones, nodding on the beat
//   39  CRAB       a coconut lands on a hermit crab: new shell
//   42  SIGNAL     one bar, top of the palm only
//   45  SOUND      samples used: 0; the theme at 80 BPM
//   51  START      press start: python tools/serve.py, 127.0.0.1:8765
//
// How it is drawn (no <text>, no filters): every frame is authored on the
// 128 x 32 dot grid as runs of rects, one <path> per brightness level, inside one
// group scaled by the dot pitch. That group is shown through a <mask> whose
// tiled pattern is one soft round dot per cell, so any shape becomes glowing
// round dots, and a second tiled pattern draws the unlit dots underneath.
// Four brightness levels (plus "hot" for the sparkle) are fills mixed between
// the lit and unlit colours. Motion is CSS only: stepped, whole dots at a time,
// frame cuts by step-end opacity, and five "pushes" where the old frame slides
// out as the new one slides in (the loop seam is one); every period divides 60 s.
// prefers-reduced-motion stops everything on the complete title frame.
//
// All lettering is three original dot fonts defined below (3x5, 5x7 with
// lowercase, a 9-dot bold derived from it) and a giant face made by running the
// bold through the EPX pixel-scaling rule. All art is original.
//
// Facts on screen, from D:/python/castaway on 2026-10-01: 81 activities in the
// four timed tiers of activities.toml (9 regular, 35 occasional, 31 rare, 6 super
// rare; the file also lists chained follow-ups, 92 entries in all); tiers regular 2-5 min, occasional 12-25 min, rare 30-60 min,
// super rare 3-6 h; a typical 10-hour run (median of 200 simulated runs, as the
// file's header states) has about 155 regular, 30 occasional, 13 rare and 2
// super-rare events; she is busy about a third of the time. Theme: 80 BPM,
// F major, ii-V-I-vi, 20 bars of 3 s, 60 s loop. Sound is synthesized by
// tools/make_audio.py from code only: no samples, loops or recordings.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '09-pinball-dmd_opus_5.5';
const OUT = path.resolve(HERE, `../assets/${SLUG}.svg`);
const argAt = (f) => (process.argv.includes(f) ? process.argv[process.argv.indexOf(f) + 1] : null);
const DEBUG_OUT = argAt('--out'); // optional: write somewhere else (for iterating)

// ------------------------------------------------------------------ geometry
const DW = 128, DH = 32, P = 6;               // dots, and the pitch in SVG units
const W = 830, H = 254;                       // viewBox: 1 unit = 1 px in GitHub's README column
const GX = (W - DW * P) / 2, GY = 22;         // top-left of the dot grid
const LOOP = 60, BEAT = 0.75, BAR = 3;        // 80 BPM, 4 beats a bar, 20 bars

// ------------------------------------------------------------------ palette
const LIT = [255, 128, 20];                   // a fully lit plasma dot
const OFF = [44, 19, 2];                      // an unlit dot
const GLASS = '#0b0502';
const mix = (a, b, t) => '#' + a.map((v, i) => Math.round(v + (b[i] - v) * t).toString(16).padStart(2, '0')).join('');
const LEVEL = {
  1: mix(OFF, LIT, 0.26),
  2: mix(OFF, LIT, 0.5),
  3: mix(OFF, LIT, 0.74),
  4: mix(OFF, LIT, 1),
  5: '#ffd59a',                               // hot: only the sparkle, briefly
  6: mix(OFF, OFF, 0),                        // forced unlit (letters cut out of an inverted frame)
};

// ------------------------------------------------------------------ PRNG (for wave dashes and spinning digits)
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
const parse = (src) => src.split('|').map((r) => [...r].map((c) => (c === '#' ? 1 : 0)));
function makeFont(src, space, h) {
  const g = {};
  for (const [ch, s] of Object.entries(src)) {
    const rows = parse(s);
    const w = rows[0].length;
    if (rows.some((r) => r.length !== w)) throw new Error(`ragged glyph ${ch}`);
    g[ch] = rows;
  }
  return { g, space, h };
}

// 3 x 5 status-line face (M, N, W are wider). Uppercase only, like the real thing.
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
  '!': '#|#|#|.|#', '?': '##.|..#|.#.|...|.#.', "'": '#|#|.|.|.', '+': '...|.#.|###|.#.|...', '·': '.|.|#|.|.',
  '(': '.#|#.|#.|#.|.#', ')': '#.|.#|.#|.#|#.', '=': '...|###|...|###|...', '%': '#.#|..#|.#.|#..|#.#',
  // two lowercase letters, for the minor chords in ii-V-I-vi
  i: '#|.|#|#|#', v: '...|...|#.#|#.#|.#.',
}, 2, 5);

// 5 x 7 face with a lowercase (x-height 5, descenders 2) for the one command line.
const SMALL = makeFont({
  A: '.###.|#...#|#...#|#####|#...#|#...#|#...#', B: '####.|#...#|#...#|####.|#...#|#...#|####.',
  C: '.###.|#...#|#....|#....|#....|#...#|.###.', D: '####.|#...#|#...#|#...#|#...#|#...#|####.',
  E: '#####|#....|#....|####.|#....|#....|#####', F: '#####|#....|#....|####.|#....|#....|#....',
  G: '.###.|#...#|#....|#.###|#...#|#...#|.####', H: '#...#|#...#|#...#|#####|#...#|#...#|#...#',
  I: '###|.#.|.#.|.#.|.#.|.#.|###', J: '..###|...#.|...#.|...#.|...#.|#..#.|.##..',
  K: '#...#|#..#.|#.#..|##...|#.#..|#..#.|#...#', L: '#....|#....|#....|#....|#....|#....|#####',
  M: '#...#|##.##|#.#.#|#.#.#|#...#|#...#|#...#', N: '#...#|##..#|#.#.#|#.#.#|#..##|#...#|#...#',
  O: '.###.|#...#|#...#|#...#|#...#|#...#|.###.', P: '####.|#...#|#...#|####.|#....|#....|#....',
  Q: '.###.|#...#|#...#|#...#|#.#.#|#..#.|.##.#', R: '####.|#...#|#...#|####.|#.#..|#..#.|#...#',
  S: '.###.|#...#|#....|.###.|....#|#...#|.###.', T: '#####|..#..|..#..|..#..|..#..|..#..|..#..',
  U: '#...#|#...#|#...#|#...#|#...#|#...#|.###.', V: '#...#|#...#|#...#|#...#|.#.#.|.#.#.|..#..',
  W: '#...#|#...#|#...#|#.#.#|#.#.#|##.##|#...#', X: '#...#|#...#|.#.#.|..#..|.#.#.|#...#|#...#',
  Y: '#...#|#...#|.#.#.|..#..|..#..|..#..|..#..', Z: '#####|....#|...#.|..#..|.#...|#....|#####',
  0: '.###.|#...#|#...#|#...#|#...#|#...#|.###.', 1: '..#..|.##..|..#..|..#..|..#..|..#..|.###.',
  2: '.###.|#...#|....#|...#.|..#..|.#...|#####', 3: '.###.|#...#|....#|..##.|....#|#...#|.###.',
  4: '...#.|..##.|.#.#.|#..#.|#####|...#.|...#.', 5: '#####|#....|####.|....#|....#|#...#|.###.',
  6: '..##.|.#...|#....|####.|#...#|#...#|.###.', 7: '#####|....#|...#.|..#..|.#...|.#...|.#...',
  8: '.###.|#...#|#...#|.###.|#...#|#...#|.###.', 9: '.###.|#...#|#...#|.####|....#|...#.|.##..',
  a: '.....|.....|.###.|....#|.####|#...#|.####', b: '#....|#....|####.|#...#|#...#|#...#|####.',
  c: '.....|.....|.###.|#....|#....|#...#|.###.', d: '....#|....#|.####|#...#|#...#|#...#|.####',
  e: '.....|.....|.###.|#...#|#####|#....|.###.', f: '..##|.#..|####|.#..|.#..|.#..|.#..',
  g: '.....|.....|.####|#...#|#...#|.####|....#|.###.', h: '#....|#....|####.|#...#|#...#|#...#|#...#',
  i: '.#.|...|##.|.#.|.#.|.#.|###', j: '..#|...|.##|..#|..#|..#|..#|#.#|.#.',
  k: '#...|#...|#..#|#.#.|##..|#.#.|#..#', l: '##.|.#.|.#.|.#.|.#.|.#.|###',
  m: '.....|.....|##.#.|#.#.#|#.#.#|#.#.#|#.#.#', n: '.....|.....|####.|#...#|#...#|#...#|#...#',
  o: '.....|.....|.###.|#...#|#...#|#...#|.###.', p: '.....|.....|####.|#...#|#...#|####.|#....|#....',
  r: '....|....|#.##|##..|#...|#...|#...', s: '.....|.....|.####|#....|.###.|....#|####.',
  t: '.#..|.#..|###.|.#..|.#..|.#..|..##', u: '.....|.....|#...#|#...#|#...#|#...#|.####',
  v: '.....|.....|#...#|#...#|#...#|.#.#.|..#..', w: '.....|.....|#...#|#...#|#.#.#|#.#.#|.#.#.',
  y: '.....|.....|#...#|#...#|#...#|.####|....#|.###.',
  '.': '.|.|.|.|.|.|#', ':': '.|.|#|.|.|#|.', '-': '....|....|....|####|....|....|....',
  '/': '....#|...#.|...#.|..#..|.#...|.#...|#....', '?': '.###.|#...#|....#|..##.|..#..|.....|..#..',
  '!': '#|#|#|#|#|.|#', "'": '#|#|.|.|.|.|.', ',': '..|..|..|..|..|.#|#.', '>': '#...|.#..|..#.|...#|..#.|.#..|#...',
  '_': '.....|.....|.....|.....|.....|.....|#####',
}, 3, 7);

// 9-dot bold, derived: stretch the 5 x 7 to 9 rows (rows 1 and 5 doubled) and
// smear one dot right. The letters whose counters the smear would close are drawn by hand.
const MED_BY_HAND = {
  M: '##...##|###.###|#######|##.#.##|##...##|##...##|##...##|##...##|##...##',
  N: '##...##|###..##|###..##|####.##|##.####|##..###|##..###|##...##|##...##',
  W: '##...##|##...##|##...##|##...##|##.#.##|##.#.##|#######|###.###|##...##',
  V: '##...##|##...##|##...##|##...##|##...##|.##.##.|.##.##.|..###..|...#...',
  K: '##...##|##..##.|##.##..|####...|###....|####...|##.##..|##..##.|##...##',
  X: '##...##|##...##|.##.##.|..###..|...#...|..###..|.##.##.|##...##|##...##',
  Q: '.#####.|##...##|##...##|##...##|##...##|##.#.##|##..##.|.##.##.|..##.##',
  // a plain flag-and-stem 1: the derived one grew a foot and a round head, like a chess pawn
  1: '..##|.###|####|..##|..##|..##|..##|..##|..##',
};
const MED = (() => {
  const g = {};
  for (const [ch, rows] of Object.entries(SMALL.g)) {
    if (!/[A-Z0-9?!.:'\-]/.test(ch)) continue;
    const st = [0, 1, 1, 2, 3, 4, 5, 5, 6].map((i) => rows[i]);
    g[ch] = st.map((r) => Array.from({ length: r.length + 1 }, (_, x) => (r[x] || r[x - 1] ? 1 : 0)));
  }
  for (const [ch, s] of Object.entries(MED_BY_HAND)) g[ch] = parse(s);
  return { g, space: 4, h: 9 };
})();

function measure(font, s, sp = 1) {
  let w = 0;
  for (const ch of s) w += (ch === ' ' ? font.space : font.g[ch][0].length) + sp;
  return w - sp;
}

// EPX / Scale2x: doubles a bitmap and rounds its stair-steps.
function epx(bm) {
  const h = bm.length, w = bm[0].length;
  const at = (x, y) => (y < 0 || y >= h || x < 0 || x >= w ? 0 : bm[y][x]);
  const out = Array.from({ length: h * 2 }, () => new Array(w * 2).fill(0));
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const p = at(x, y), a = at(x, y - 1), b = at(x + 1, y), c = at(x - 1, y), d = at(x, y + 1);
    out[2 * y][2 * x] = c === a && c !== d && a !== b ? a : p;
    out[2 * y][2 * x + 1] = a === b && a !== c && b !== d ? b : p;
    out[2 * y + 1][2 * x] = d === c && d !== b && c !== a ? c : p;
    out[2 * y + 1][2 * x + 1] = b === d && b !== a && d !== c ? d : p;
  }
  return out;
}
// The giant face: bold glyphs through EPX once (18 dots tall), set `gap` apart.
function giant(str, gap = 2) {
  const gl = [...str].map((ch) => epx(MED.g[ch]));
  const width = gl.reduce((s, g) => s + g[0].length, 0) + gap * (gl.length - 1);
  const bm = Array.from({ length: 18 }, () => new Array(width).fill(0));
  let x0 = 0;
  for (const g of gl) { g.forEach((row, y) => row.forEach((v, x) => { if (v) bm[y][x0 + x] = 1; })); x0 += g[0].length + gap; }
  return bm;
}

// ------------------------------------------------------------------ the dot canvas
class Cv {
  constructor(w = DW, h = DH) { this.w = w; this.h = h; this.p = new Uint8Array(w * h); }
  set(x, y, v) { x = Math.round(x); y = Math.round(y); if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.p[y * this.w + x] = v; }
  get(x, y) { return x >= 0 && y >= 0 && x < this.w && y < this.h ? this.p[y * this.w + x] : 0; }
  rect(x, y, w, h, v) { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, v); return this; }
  bm(bm, x, y, v) { bm.forEach((row, j) => row.forEach((b, i) => { if (b) this.set(x + i, y + j, v ?? b); })); return this; }
  // char map: '1'-'5' levels, '0' forced unlit, anything else transparent
  map(rows, x = 0, y = 0) {
    rows.forEach((r, j) => [...r].forEach((c, i) => { if (c >= '0' && c <= '5') this.set(x + i, y + j, c === '0' ? 6 : +c); }));
    return this;
  }
  text(font, x, y, s, v, sp = 1) {
    for (const ch of s) {
      if (ch === ' ') { x += font.space + sp; continue; }
      const g = font.g[ch];
      if (!g) throw new Error(`no glyph ${JSON.stringify(ch)}`);
      this.bm(g, x, y, v);
      x += g[0].length + sp;
    }
    if (x - sp > this.w + 0.5) throw new Error(`text runs off the display: "${s}" ends at ${x - sp}`);
    return x - sp;
  }
  ctext(font, y, s, v, x0 = 0, x1 = this.w) { return this.text(font, x0 + Math.floor((x1 - x0 - measure(font, s)) / 2), y, s, v); }
  rtext(font, xr, y, s, v) { return this.text(font, xr - measure(font, s), y, s, v); }
  line(pts, v, thick = 1) { // polyline through integer-ish points, one dot per step
    for (let k = 0; k < pts.length - 1; k++) {
      const [x0, y0] = pts[k], [x1, y1] = pts[k + 1];
      const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
      for (let i = 0; i <= n; i++) {
        const x = x0 + ((x1 - x0) * i) / n, y = y0 + ((y1 - y0) * i) / n;
        for (let t = 0; t < thick; t++) this.set(x, y + t, v);
      }
    }
    return this;
  }
}
const sprite = (rows) => new Cv(Math.max(...rows.map((r) => r.length)), rows.length).map(rows);

// Bitmap of one value -> rects, runs merged across then down.
function runs(c, v) {
  const rects = [];
  let open = [];
  for (let y = 0; y < c.h; y++) {
    const next = [];
    for (let x = 0; x < c.w;) {
      if (c.p[y * c.w + x] !== v) { x++; continue; }
      const x0 = x;
      while (x < c.w && c.p[y * c.w + x] === v) x++;
      const o = open.find((r) => r[0] === x0 && r[2] === x - x0 && r[1] + r[3] === y);
      if (o) { o[3]++; next.push(o); } else { const r = [x0, y, x - x0, 1]; rects.push(r); next.push(r); }
    }
    open = next;
  }
  return rects;
}
// A canvas as one <path> per level, offset by (ox, oy) dots.
function svgOf(c, ox = 0, oy = 0) {
  let out = '';
  for (const v of [6, 1, 2, 3, 4, 5]) {
    const d = runs(c, v).map(([x, y, w, h]) => `M${x + ox} ${y + oy}h${w}v${h}h-${w}z`).join('');
    if (d) out += `<path class="l${v}" d="${d}"/>`;
  }
  return out;
}

// ------------------------------------------------------------------ animation helpers
const css = [];
const pc = (t) => `${+((t / LOOP) * 100).toFixed(3)}%`;
const kfCache = new Map();
let kfN = 0;
// One @keyframes + class. `frames` is [[percentString, declarations]], `dur` the period.
function keyed(frames, dur = LOOP, base = '') {
  const body = frames.map(([p, d]) => `${p}{${d}}`).join('');
  const key = `${body}|${dur}|${base}`;
  if (!kfCache.has(key)) {
    const name = `k${(kfN++).toString(36)}`;
    css.push(`@keyframes ${name}{${body}}.${name}{${base}animation-name:${name}${dur === LOOP ? '' : `;animation-duration:${dur}s`}}`);
    kfCache.set(key, name);
  }
  return kfCache.get(key);
}
// Visible during the given [t0, t1) windows of the loop. `baseOn`: shown when motion is off.
function shown(wins, baseOn = false) {
  const ev = [];
  const on0 = wins.some(([a, b]) => a <= 0 && b > 0);
  ev.push([0, on0 ? 1 : 0]);
  for (const [a, b] of wins) { if (a > 0) ev.push([a, 1]); if (b < LOOP) ev.push([b, 0]); }
  ev.sort((p, q) => p[0] - q[0]);
  return keyed(ev.map(([t, o]) => [pc(t), `opacity:${o}`]), LOOP, baseOn ? '' : 'opacity:0;');
}
// Periodic on/off inside a period that divides the loop: on during [a, b) of each period.
function pulse(period, a, b, baseOn = true) {
  if (Math.abs(LOOP / period - Math.round(LOOP / period)) > 1e-9) throw new Error(`period ${period} does not divide the loop`);
  const fr = [];
  const q = (t) => `${+((t / period) * 100).toFixed(3)}%`;
  fr.push(['0%', `opacity:${a <= 0 ? 1 : 0}`]);
  if (a > 0) fr.push([q(a), 'opacity:1']);
  if (b < period) fr.push([q(b), 'opacity:0']);
  return keyed(fr, period, baseOn ? '' : 'opacity:0;');
}
// Stepped movement. pts: [[t, x, y, glide]]: from each point to the next, either hold
// (jump at the next point) or glide, one whole dot per step (or `glide` steps, if a number).
function moved(pts) {
  const fr = [];
  pts.forEach(([t, x, y, glide], i) => {
    const nx = pts[i + 1];
    let tf = 'step-end';
    if (glide && nx) tf = `steps(${typeof glide === 'number' ? glide : Math.max(Math.abs(nx[1] - x), Math.abs(nx[2] - y), 1)},end)`;
    fr.push([pc(t), `transform:translate(${x}px,${y}px);animation-timing-function:${tf}`]);
  });
  if (pts[0][0] > 0) fr.unshift(['0%', `transform:translate(${pts[0][1]}px,${pts[0][2]}px)`]);
  return keyed(fr, LOOP);
}
const g = (cls, inner) => `<g class="${cls}">${inner}</g>`;

// ------------------------------------------------------------------ sprites (all drawn here, on the dot grid)
// Her: small and simple, seen from the front. 1 hair, 2 coral tank top, 3 skin,
// 4 cream (headphones, shorts). Sixteen dots tall.
const HER_STAND = [
  '..1441..',
  '.411114.',
  '.413314.',
  '.413314.',
  '..1331..',
  '...33...',
  '.322223.',
  '.322223.',
  '.322223.',
  '.322223.',
  '.344443.',
  '..4..4..',
  '..3..3..',
  '..3..3..',
  '..3..3..',
  '.33..33.',
];
// Both hands hold the coconut up to her face. It has a face of its own. She can see nothing.
const HER_SIP = [
  '..1441..',
  '.422224.',
  '.421124.',
  '.422224.',
  '.322223.',
  '3..33..3',
  '33222233',
  '..2222..',
  '..2222..',
  '..2222..',
  '..4444..',
  '..4..4..',
  '..3..3..',
  '..3..3..',
  '..3..3..',
  '.33..33.',
];
// Coconut down at her hip, looking to her right (our left): where the ship went.
const HER_LOOK = [
  '..1441....',
  '.411114...',
  '.433114...',
  '.433114...',
  '..3311....',
  '...33.....',
  '.322223...',
  '.322223...',
  '.322223222',
  '.32222321.',
  '.344443222',
  '..4..4....',
  '..3..3....',
  '..3..3....',
  '..3..3....',
  '.33..33...',
];
// Right arm up: the throw.
const HER_THROW = [
  '..1441..3',
  '.411114.3',
  '.413314.3',
  '.413314.3',
  '..1331..3',
  '...33..3.',
  '.3222233.',
  '.32222...',
  '.32222...',
  '.32222...',
  '.34444...',
  '..4..4...',
  '..3..3...',
  '..3..3...',
  '..3..3...',
  '.33..33..',
];
// The nod: everything above the shoulders drops one dot for half a beat.
const nodded = (rows, neck = 5) => ['.'.repeat(rows[0].length), ...rows.slice(0, neck), ...rows.slice(neck + 1)];

const SHIP = [
  '..........33......',
  '..........33....2.',
  '.....4444444444.2.',
  '.....4.4.4.4.444..',
  '222222222222222222',
  '.2222222222222222.',
  '..22222222222222..',
];
const SMOKE = ['..11.', '.1..1', '..11.'];
const NOTE = ['.33.', '.3.3', '.3..', '33..', '33..'];
const CLOUD_A = ['.....111.....', '..111...1111.', '.1..........1', '1111111111111'];
const CLOUD_B = ['...1111...', '.11....11.', '1111111111'];
const RAFT = ['.333333333333333.', '22222222222222222', '.1.1.1.1.1.1.1.1.'];
const BOTTLE = ['.2222....', '244442223', '.2222....'];
const COCONUT = ['.3333.', '313133', '331333', '333333', '.3333.'];
// A hermit crab facing left: eyes on stalks, a claw, a borrowed shell, six busy legs.
const CRAB = ['4.4.......', '3.3..222..', '.33.22122.', '3333221222', '.333222222'];
const CRAB_LEGS = ['3.3.3.3...', '.3.3.3.3..'];
// The same crab under its new coconut.
const COCO_CRAB = ['...3333.', '4.313133', '4.331333', '3.333333', '33.3333.'];
const COCO_LEGS = ['3.3.3.3.', '.3.3.3.3'];
// A delivery drone, side on: two rotors (blurred, then not), arms, a body with a light.
const DRONE_A = ['44444.....44444', '..1.........1..', '.2222233322222.', '.....34443.....', '.....2...2.....'];
const DRONE_B = ['.444.......444.', '..1.........1..', '.2222233322222.', '.....34443.....', '.....2...2.....'];
const PARCEL = ['...1...', '2224222', '2224222', '4444444', '2224222', '2224222'];
const PHONES = ['..44444..', '.4.....4.', '4.......4', '4.......4', '44.....44', '44.....44', '44.....44'];
// The shark, as everyone first meets one: a fin. His wears cream headphones, drawn
// as the headphones icon around the top of the fin with a dot of dark sea between
// them, so the band and the cups never melt into the fin's outline.
// `nod` 1 sinks him a dot and tips the top of the fin forward, once a beat.
const FIN = [ // [row, left edge, right edge]: leading edge on the left, the tip hooked back
  [4, 12, 13], [5, 11, 13], [6, 10, 12], [7, 9, 12], [8, 9, 12], [9, 8, 12], [10, 7, 12],
  [11, 6, 12], [12, 5, 13], [13, 4, 13], [14, 3, 14], [15, 2, 15], [16, 1, 17],
];
const SHARK_PHONES = ['...######...', '..#......#..', '.#........#.', '.#........#.', '.#........#.',
  '##........##', '##........##', '##........##', '##........##'];
function shark(nod) {
  const k0 = new Cv(26, 17);
  for (const [y, xl, xr] of FIN) for (let x = xl; x <= xr; x++) k0.set(x, y, x === xl || x === xr || y === 4 ? 3 : 2);
  k0.map(SHARK_PHONES.map((r) => r.replace(/#/g, '4')), 5, 1);
  if (!nod) return k0;
  const k = new Cv(26, 17);
  for (let y = 0; y < 17; y++) for (let x = 0; x < 26; x++) { const v = k0.get(x, y); if (v) k.set(x - (y < 10 ? 1 : 0), y + 1, v); }
  return k;
}

// ------------------------------------------------------------------ frames
const FR = [];
const frame = (t0, t1, build) => FR.push({ t0, t1, build });

// ---- TITLE (0 - 6) ------------------------------------------------
const TITLE_BM = giant('CASTAWAY');
const TITLE_W = TITLE_BM[0].length, TITLE_X = Math.floor((DW - TITLE_W - 1) / 2), TITLE_Y = 7;
frame(0, 6, (c, ex) => {
  c.ctext(TINY, 0, 'ONE PALM · ONE RAFT · NO HURRY', 2);
  // shadow, then the letters: bright top, a step dimmer below the waist
  c.bm(TITLE_BM, TITLE_X + 1, TITLE_Y + 1, 1);
  TITLE_BM.forEach((row, y) => row.forEach((v, x) => { if (v) c.set(TITLE_X + x, TITLE_Y + y, y < 9 ? 4 : 3); }));
  // the sparkle: a hot diagonal band, clipped to the letters, swept twice a cycle
  const band = new Cv(12, 20);
  for (let y = 0; y < 20; y++) for (let k = 0; k < 3; k++) band.set(Math.floor((19 - y) / 2) + k, y, 5);
  const sweep = (t) => [[t, -14, 0, true], [t + 0.9, DW + 2, 0, false]];
  const pts = [[0, -14, 0, false], ...sweep(0.6), ...sweep(3.6)];
  ex.push(`<g clip-path="url(#tclip)">${g(shown([[0.6, 1.5], [3.6, 4.5]]), g(moved(pts), svgOf(band, 0, TITLE_Y - 1)))}</g>`);
  // the bottom line alternates on the bar
  const a = new Cv(), b = new Cv();
  a.ctext(TINY, 27, 'A 10-HOUR LO-FI ISLAND VIDEO', 3);
  b.ctext(TINY, 27, 'INSPIRED BY A 1992 SCREENSAVER', 3);
  ex.push(g(shown([[0, 3], [LOOP - PT, LOOP]], true), svgOf(a)), g(shown([[3, 6]]), svgOf(b)));
});

// ---- ISLAND (6 - 15): she sips a coconut, a ship sails by -----------
const HY = 11; // horizon row
function waveDashes(n, y0, y1, avoid) {
  const sets = [[], []];
  for (const set of sets) {
    while (set.length < n) {
      const y = y0 + Math.floor(rnd() * (y1 - y0));
      const x = Math.floor(rnd() * (DW - 3));
      if (avoid(x, y)) continue;
      set.push([x, y]);
    }
  }
  return sets.map((set) => {
    const w = new Cv();
    for (const [x, y] of set) { w.set(x, y, 1); w.set(x + 1, y, 1); if (y > y0 + (y1 - y0) / 2) w.set(x + 2, y, 1); }
    return svgOf(w);
  });
}
// Two sets of wave dashes, swapped on every beat.
const waves = (sets) => g(pulse(1.5, 0, 0.75), sets[0]) + g(pulse(1.5, 0.75, 1.5, false), sets[1]);
function drawPalm(c, bx, by, top) {
  // trunk: two dots wide, banded, leaning left as it climbs
  for (let y = by; y >= top; y--) {
    const t = (by - y) / (by - top);
    const x = Math.round(bx - 5 * t * t - 1.4 * Math.sin(t * Math.PI));
    const lv = Math.floor((by - y) / 2) % 2 ? 2 : 3;
    c.set(x, y, lv); c.set(x + 1, y, lv === 3 ? 2 : 3);
  }
}
function drawCrown(c, cx, cy, s = 1) {
  const S = (dx, dy) => [cx + Math.round(dx * s), cy + Math.round(dy * s)];
  const fronds = [
    [S(0, 0), S(-6, -2), S(-11, -2), S(-15, 1), S(-16, 4)],
    [S(0, 0), S(-5, 2), S(-8, 5), S(-9, 8)],
    [S(0, 0), S(-3, -3), S(-7, -4)],
    [S(0, 0), S(3, -3), S(7, -4)],
    [S(0, 0), S(6, -2), S(11, -2), S(15, 1), S(16, 4)],
    [S(0, 0), S(5, 2), S(8, 5), S(9, 8)],
  ];
  for (const f of fronds) {
    // leaflets hang under each frond, longest mid-frond, swept outwards
    const pts = [];
    for (let k = 0; k < f.length - 1; k++) {
      const [x0, y0] = f[k], [x1, y1] = f[k + 1];
      const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
      for (let i = k ? 1 : 0; i <= n; i++) pts.push([Math.round(x0 + ((x1 - x0) * i) / n), Math.round(y0 + ((y1 - y0) * i) / n)]);
    }
    pts.forEach(([x, y], i) => {
      if (Math.abs(x - cx) < 3) return;
      const mid = 1 - Math.abs(i / (pts.length - 1) - 0.5) * 2;
      const len = (i % 2 ? 1 : 2) + (mid > 0.5 ? 1 : 0);
      const dir = Math.sign(x - cx);
      for (let j = 1; j <= len; j++) c.set(x + (j > 1 ? dir : 0), y + j, j === 1 ? 3 : 2);
    });
    c.line(f.map(([x, y]) => [x, y + 1]), 3);
    c.line(f, 4);
  }
  c.rect(cx - 1, cy - 1, 3, 2, 4);
  c.set(cx - 1, cy + 2, 2); c.set(cx + 1, cy + 2, 2); c.set(cx, cy + 3, 2);
}
function drawIsland(c, cx, top, rx, depth = 6) {
  for (let y = top; y < DH; y++) {
    const dy = Math.min(1, (y - top + 0.7) / depth);
    const half = Math.round(rx * Math.sqrt(1 - (1 - dy) * (1 - dy)));
    for (let x = cx - half; x <= cx + half; x++) {
      let v = y === top ? 3 : 2;
      if (y > top + 1 && (x + y) % 2 === 0) v = 1;
      if (x === cx - half || x === cx + half) v = 3;
      c.set(x, y, v);
    }
  }
}
const sun = (c, x0, y0) => {
  for (let y = -3; y <= 3; y++) for (let x = -3; x <= 3; x++) if (x * x + y * y <= 10) c.set(x0 + x, y0 + y, x * x + y * y <= 4 ? 4 : 3);
  const a = new Cv(), b = new Cv();
  for (let k = 0; k < 8; k++) {
    const t = (k * Math.PI) / 4;
    a.set(x0 + Math.round(Math.cos(t) * 5.4), y0 + Math.round(Math.sin(t) * 5.4), 2);
    b.set(x0 + Math.round(Math.cos(t + Math.PI / 8) * 5.6), y0 + Math.round(Math.sin(t + Math.PI / 8) * 5.6), 1);
  }
  return g(pulse(1.5, 0, 0.75), svgOf(a)) + g(pulse(1.5, 0.75, 1.5, false), svgOf(b));
};
const ISLAND_WAVES = waveDashes(24, HY + 2, DH, (x, y) => (y >= 24 && x > 34 && x < 126) || (y >= 22 && x > 50 && x < 60));
frame(6, 15, (c, ex) => {
  const T = 6;
  ex.push(sun(c, 10, 4));
  // two clouds drift a dot every beat
  const cl = (rows, x, y, drift) => g(moved([[T, 0, 0, true], [T + 9, -drift, 0, false]]), svgOf(sprite(rows), x, y));
  ex.push(cl(CLOUD_A, 24, 0, 12), cl(CLOUD_B, 58, 2, 12));
  // the ship: in from the right along the horizon, out on the left
  // The ship rides one dot low (its keel just under the horizon line), which leaves
  // the top five rows of sky free for the TOOT. The funnel stops smoking while it toots.
  const toot = new Cv(20, 6); toot.text(TINY, 0, 0, 'TOOT', 4);
  const smoke = sprite(SMOKE);
  const TOOT_T = [T + 3.75, T + 4.5];
  const shipInner = svgOf(sprite(SHIP), 0, HY - 5)
    + g(shown([[0, TOOT_T[0]], [TOOT_T[1], LOOP]], true),
      g(pulse(1.5, 0, 0.75), svgOf(smoke, 12, HY - 9)) + g(pulse(1.5, 0.75, 1.5, false), svgOf(smoke, 14, HY - 10)))
    + g(shown([TOOT_T]), svgOf(toot, 3, 0));
  ex.push(g(moved([[0, DW + 1, 0, false], [T + 0.4, DW + 1, 0, true], [T + 6.4, -19, 0, false]]), shipInner));
  // horizon and the sea
  for (let x = 0; x < DW; x++) c.set(x, HY, (x * 7) % 11 === 0 ? 2 : 1);
  ex.push(waves(ISLAND_WAVES));
  // the island, its bushes and the palm, drawn over the ship
  const fg = new Cv();
  drawIsland(fg, 72, 27, 33, 5);
  fg.map(['..1..11.....', '.121.1221.1.', '122212222121'], 64, 25);
  drawPalm(fg, 93, 27, 6);
  drawCrown(fg, 87, 5);
  fg.map(['111'], 44, 30);
  ex.push(svgOf(fg));
  // the raft bobs on the half bar
  ex.push(g(pulse(1.5, 0, 0.75), svgOf(sprite(RAFT), 108, 28)), g(pulse(1.5, 0.75, 1.5, false), svgOf(sprite(RAFT), 108, 29)));
  // her: coconut to her face, nodding on every beat; then it comes down and she looks round
  const HX = 52, HTOP = 15; // feet three rows into the sand, head two rows clear of the passing keel
  ex.push(g(shown([[T, T + 6.75]]),
    g(pulse(BEAT, 0, BEAT / 2), svgOf(sprite(HER_SIP), HX, HTOP)) + g(pulse(BEAT, BEAT / 2, BEAT, false), svgOf(sprite(nodded(HER_SIP)), HX, HTOP))));
  ex.push(g(shown([[T + 6.75, T + 9]]), svgOf(sprite(HER_LOOK), HX, HTOP)));
  const q = new Cv(6, 8); q.text(SMALL, 0, 0, '?', 4);
  ex.push(g(shown([[T + 7.5, T + 9]]), svgOf(q, HX + 2, 4)));
  // notes drift up from her headphones while she nods
  for (const k of [0, 1, 2]) {
    const t0 = T + 0.75 + k * 2.25;
    ex.push(g(shown([[t0, t0 + 1.5]]), g(moved([[0, 0, 0, false], [t0, 0, 0, true], [t0 + 1.5, -2, -6, false]]), svgOf(sprite(NOTE), HX - 4, HTOP - 1))));
  }
});

// ---- AWARD (15 - 18): SHIP MISSED, with one inverted flash ----------
function border(c, v) {
  for (let x = 1; x < DW - 1; x++) { c.set(x, 0, v); c.set(x, DH - 1, v); }
  for (let y = 1; y < DH - 1; y++) { c.set(0, y, v); c.set(DW - 1, y, v); }
}
frame(15, 18, (c, ex) => {
  const T = 15;
  const inv = new Cv();
  inv.rect(0, 0, DW, DH, 3);
  inv.ctext(MED, 11, 'SHIP MISSED', 6);
  ex.push(g(shown([[T, T + 0.6]]), svgOf(inv)));
  const n = new Cv();
  border(n, 2);
  n.ctext(TINY, 3, 'COCONUT IN THE WAY', 3);
  n.ctext(MED, 10, 'SHIP MISSED', 4);
  n.ctext(TINY, 23, 'SHE WAS BUSY. IT HAPPENS.', 3);
  ex.push(g(shown([[T + 0.6, T + 3]]), svgOf(n)));
});

// ---- RULES (18 - 21): one line per beat ----------------------------
frame(18, 21, (c, ex) => {
  const T = 18;
  const lines = [
    (k) => k.ctext(SMALL, 0, 'SHE IDLES.', 4),
    (k) => k.ctext(TINY, 9, 'AND NODS TO THE MUSIC.', 3),
    (k) => k.ctext(TINY, 16, 'EVERY SO OFTEN,', 3),
    (k) => k.ctext(MED, 23, 'SOMETHING HAPPENS', 4),
  ];
  lines.forEach((draw, i) => { const k = new Cv(); draw(k); ex.push(g(shown([[i ? T + i * BEAT : T - PT, T + 3]]), svgOf(k))); });
});

// ---- COUNT (21 - 24): 81 activities ------------------------------
// Giant numbers, right-aligned at xr: each digit is drawn once in <defs> and placed with <use>.
const DIGITS = new Map();
function giantNum(str, xr, y) {
  const gl = [...str].map((ch) => epx(MED.g[ch]));
  let x = xr - (gl.reduce((s2, b) => s2 + b[0].length, 0) + 2 * (gl.length - 1));
  let out = '';
  [...str].forEach((ch, i) => {
    if (!DIGITS.has(ch)) {
      const bm = gl[i], k = new Cv(bm[0].length + 1, 19);
      k.bm(bm, 1, 1, 1);
      bm.forEach((row, j) => row.forEach((b, i2) => { if (b) k.set(i2, j, j < 9 ? 4 : 3); }));
      DIGITS.set(ch, `<g id="d${ch}">${[1, 3, 4].map((v) => `<path fill="${LEVEL[v]}" d="${runs(k, v).map(([a, b2, w, h]) => `M${a} ${b2}h${w}v${h}h-${w}z`).join('')}"/>`).join('')}</g>`);
    }
    out += `<use href="#d${ch}" x="${x}" y="${y}"/>`;
    x += gl[i][0].length + 2;
  });
  return out;
}
function countUp(ex, values, t0, dt, t1, xr, y) {
  values.forEach((v, i) => {
    const a = t0 + i * dt, b = i === values.length - 1 ? t1 : a + dt;
    ex.push(g(shown([[a, b]]), giantNum(String(v), xr, y)));
  });
}
frame(21, 24, (c, ex) => {
  const T = 21;
  countUp(ex, [0, 6, 13, 21, 29, 37, 45, 53, 60, 67, 74, 79, 81], T, 0.1, T + 3, 34, 7);
  c.text(SMALL, 42, 3, 'ACTIVITIES', 4);
  c.text(TINY, 42, 13, 'IN FOUR TIERS.', 3);
  c.text(TINY, 42, 20, 'EACH ONE STARTS', 3);
  c.text(TINY, 42, 26, 'ON THE NEXT BAR.', 3);
});

// ---- SCORES (24 - 27): a typical 10-hour run, by tier -----------------
frame(24, 27, (c, ex) => {
  c.ctext(TINY, 0, 'A TYPICAL 10-HOUR RUN', 3);
  const cell = (x0, x1, y, label, num) => {
    const lx = c.text(TINY, x0, y + 2, label, 3);
    const nx = x1 - measure(SMALL, num);
    for (let x = lx + 2; x < nx - 1; x += 2) c.set(x, y + 6, 1);
    c.text(SMALL, nx, y, num, 4);
  };
  cell(2, 61, 8, 'REGULAR', '155');
  cell(67, 125, 8, 'OCCASIONAL', '30');
  cell(2, 61, 17, 'RARE', '13');
  cell(67, 125, 17, 'SUPER RARE', '2');
  for (let y = 8; y < 24; y += 2) c.set(64, y, 1);
  c.ctext(TINY, 27, 'BUSY A THIRD OF THE TIME', 3);
});

// ---- BOTTLE (27 - 33): message in a bottle, returned ------------------
const SEA_STRIP = waveDashes(14, 27, DH, (x, y) => x < 26);
frame(27, 33, (c, ex) => {
  const T = 27;
  c.ctext(TINY, 0, 'MESSAGE IN A BOTTLE', 3);
  c.ctext(MED, 6, 'BOTTLE RETURNED', 4);
  // a sliver of island, and the sea
  for (let x = 0; x < 22; x++) c.set(x, 31, x === 21 ? 3 : 2);
  ex.push(waves(SEA_STRIP));
  const HX = 4, HT = 15;
  ex.push(g(shown([[T, T + 0.75], [T + 1.5, T + 6]]), svgOf(sprite(HER_STAND), HX, HT)));
  ex.push(g(shown([[T + 0.75, T + 1.5]]), svgOf(sprite(HER_THROW), HX, HT)));
  // the bottle: at her hip, up in her hand, out in a stepped arc, a splash, back on the waves
  const pts = [[0, HX + 7, HT + 8, false], [T + 0.75, HX + 9, HT + 1, false]];
  const sx = HX + 9, sy = HT + 1, ex2 = 66, ey = 28;
  for (let i = 1; i <= 8; i++) {
    const s = i / 8;
    pts.push([T + 0.75 + i * 0.1, Math.round(sx + (ex2 - sx) * s), Math.round(sy + (ey - sy) * s - 3 * 4 * s * (1 - s)), false]);
  }
  pts.push([T + 1.9, ex2, ey - 1, false], [T + 2.25, ex2, ey, false]);
  for (let i = 1; i <= 12; i++) pts.push([T + 2.25 + i * 0.1875, Math.round(ex2 - (ex2 - 22) * (i / 12)), ey - (i % 2), false]);
  ex.push(g(shown([[T, T + 6]]), g(moved(pts), svgOf(sprite(BOTTLE)))));
  const splash = new Cv();
  for (const [dx, dy] of [[-2, -1], [0, -3], [2, -2], [4, -3], [6, -1], [-1, -4], [5, -5], [8, -2]]) splash.set(ex2 + 2 + dx, ey + dy, 3);
  ex.push(g(shown([[T + 1.55, T + 2.0]]), svgOf(splash)));
  // the postscript sits above the sea strip, so the wave dashes never cross it
  const p = new Cv();
  p.text(TINY, 36, 16, 'A REPLY COMES LATER,', 3);
  p.text(TINY, 36, 22, 'IN A DIFFERENT BOTTLE.', 3);
  ex.push(g(shown([[T + 4.6, T + 6]]), svgOf(p)));
});

// ---- DELIVERY (33 - 36): the drone's parcel is more headphones ---------
frame(33, 36, (c, ex) => {
  const T = 33, X0 = 63;
  c.text(TINY, X0, 1, 'SPECIAL DELIVERY', 3);
  c.text(SMALL, X0, 9, 'CONTENTS:', 3);
  const a = new Cv(); a.text(SMALL, X0, 18, 'HEADPHONES', 4);
  const b = new Cv(); b.text(TINY, X0, 27, 'ANOTHER PAIR.', 3);
  ex.push(g(shown([[T + 1.75, T + 3]]), svgOf(a)), g(shown([[T + 2.25, T + 3]]), svgOf(b)));
  // a strip of beach
  for (let x = 0; x < 60; x++) { c.set(x, 30, x % 9 === 4 ? 2 : 3); c.set(x, 31, 2); }
  // the drone: in from the left, drops the parcel, away up and over
  const rot = g(pulse(0.25, 0, 0.125), svgOf(sprite(DRONE_A))) + g(pulse(0.25, 0.125, 0.25, false), svgOf(sprite(DRONE_B)));
  ex.push(g(moved([[0, -16, 0, false], [T, -16, 0, true], [T + 1.0, 17, 0, false], [T + 1.5, 17, 0, true], [T + 2.4, 46, -7, false]]), rot));
  // the parcel rides under it, then falls in whole-dot steps
  ex.push(g(moved([[0, -12, 5, false], [T, -12, 5, true], [T + 1.0, 21, 5, false], [T + 1.25, 21, 5, true], [T + 1.6, 21, 24, false]]),
    g(shown([[T, T + 1.25]]), svgOf(sprite(PARCEL))) + g(shown([[T + 1.25, T + 3]]), svgOf(sprite(PARCEL.slice(1)), 0, 1))));
  // it opens: headphones, flashing on the beat
  ex.push(g(shown([[T + 1.75, T + 3]]), g(pulse(BEAT, 0, 0.5), svgOf(sprite(PHONES), 20, 15))));
});

// ---- SHARK (36 - 39): nodding on the beat ---------------------------
const SHARK_SEA = waveDashes(10, 25, DH, (x, y) => x < 74);
frame(36, 39, (c, ex) => {
  const T = 36;
  c.text(TINY, 2, 1, 'SHARK SIGHTED', 3);
  c.text(MED, 2, 8, 'NODDING', 4);
  c.text(TINY, 2, 21, 'HE IS JUST HERE', 3);
  c.text(TINY, 2, 27, 'FOR THE MUSIC.', 3);
  const SX = 94, SY = 7;
  for (let x = 76; x < DW; x++) c.set(x, SY + 17, (x * 5) % 7 === 0 ? 2 : 1);
  const wake = (k) => { const w = new Cv(); for (let i = 0; i < 4; i++) { w.set(SX - 1 - i * 2 - k, SY + 16 - (i % 2), 3); w.set(SX + 19 + i * 2 + k, SY + 16 - (i % 2), 2); } return svgOf(w); };
  ex.push(g(pulse(BEAT, 0, BEAT / 2), wake(0)) + g(pulse(BEAT, BEAT / 2, BEAT, false), wake(1)));
  ex.push(waves(SHARK_SEA));
  // the rest of him, under the water
  for (let y = 0; y < 5; y++) for (let x = -14; x <= 14; x++) if ((x * x) / 196 + ((y - 1.2) * (y - 1.2)) / 9 <= 1 && (x + y) % 2 === 0) c.set(SX + 9 + x, SY + 19 + y, 1);
  ex.push(g(pulse(BEAT, 0, BEAT / 2), svgOf(shark(0), SX, SY)) + g(pulse(BEAT, BEAT / 2, BEAT, false), svgOf(shark(1), SX, SY)));
  for (const k of [0, 1]) {
    const t0 = T + 0.4 + k * 1.5;
    ex.push(g(shown([[t0, t0 + 1.5]]), g(moved([[0, 0, 0, false], [t0, 0, 0, true], [t0 + 1.5, -3, -6, false]]), svgOf(sprite(NOTE), SX + 2, SY + 1))));
  }
});

// ---- CRAB (39 - 42): a coconut lands on a hermit crab -----------------
frame(39, 42, (c, ex) => {
  const T = 39, X0 = 62;
  c.text(TINY, X0, 1, 'HERMIT CRAB', 3);
  c.text(MED, X0, 8, 'NEW SHELL', 4);
  const a = new Cv(); a.text(TINY, X0, 21, 'UPGRADE: COCONUT.', 3); a.text(TINY, X0, 27, 'NO REFUNDS.', 2);
  ex.push(g(shown([[T + 1.5, T + 3]]), svgOf(a)));
  // the palm, a coconut still up in the crown
  drawPalm(c, 35, 29, 4);
  drawCrown(c, 29, 3, 0.75);
  for (let x = 0; x < 60; x++) { c.set(x, 30, x % 7 === 3 ? 2 : 3); c.set(x, 31, 2); }
  const walker = (rows, legs) => {
    const k1 = sprite([...rows, legs[0]]), k2 = sprite([...rows, legs[1]]);
    return g(pulse(0.25, 0, 0.125), svgOf(k1)) + g(pulse(0.25, 0.125, 0.25, false), svgOf(k2));
  };
  // the crab walks in from the right, under the palm
  ex.push(g(shown([[T, T + 1.0]]), g(moved([[0, 54, 24, false], [T, 54, 24, true], [T + 0.75, 22, 24, false]]), walker(CRAB, CRAB_LEGS))));
  // the coconut falls from the crown, whole dots at a time
  ex.push(g(shown([[T + 0.6, T + 1.0]]), g(moved([[0, 26, 5, false], [T + 0.6, 26, 5, true], [T + 0.95, 26, 20, false]]), svgOf(sprite(COCONUT)))));
  const bonk = new Cv(); bonk.text(TINY, 8, 13, 'BONK', 4); bonk.set(24, 18, 3); bonk.set(21, 20, 2); bonk.set(34, 19, 3); bonk.set(36, 22, 2);
  ex.push(g(shown([[T + 1.0, T + 1.6]]), svgOf(bonk)));
  // now the coconut has legs, and leaves
  ex.push(g(shown([[T + 1.0, T + 3]]), g(moved([[0, 24, 20, false], [T + 1.5, 24, 20, true], [T + 3, -10, 20, false]]), walker(COCO_CRAB, COCO_LEGS))));
});

// ---- SIGNAL (42 - 45): one bar, top of the palm ----------------------
frame(42, 45, (c, ex) => {
  const T = 42;
  c.ctext(TINY, 0, 'SIGNAL HUNT', 3);
  const bars = new Cv();
  for (let k = 1; k < 4; k++) {
    const h = 4 + k * 4, x = 5 + k * 5;
    for (let y = 26 - h; y < 26; y++) { c.set(x, y, 1); c.set(x + 3, y, 1); }
    for (let x2 = x; x2 <= x + 3; x2++) { c.set(x2, 26 - h, 1); c.set(x2, 25, 1); }
  }
  bars.rect(5, 22, 4, 4, 4);
  ex.push(g(pulse(1.5, 0, 1.3), svgOf(bars)));
  ex.push(giantNum('1', 44, 7));
  c.text(SMALL, 48, 18, 'BAR', 4);
  c.text(TINY, 48, 8, 'SIGNAL FOUND', 3);
  c.ctext(TINY, 27, 'TOP OF THE PALM ONLY.', 3);
});

// ---- SOUND (45 - 51): samples used, and the beat -------------------
frame(45, 51, (c, ex) => {
  const T = 45;
  const a = new Cv();
  a.text(TINY, 2, 0, 'SOUND TEST', 2);
  a.text(SMALL, 24, 7, 'SAMPLES USED', 4);
  a.text(TINY, 24, 18, 'EVERY SOUND IS CODE.', 3);
  a.text(TINY, 24, 25, 'NOBODY HAS HEARD IT YET.', 3);
  ex.push(g(shown([[T - PT, T + 3]]), svgOf(a)));
  const spin = [7, 3, 9, 1, 8, 4, 6, 2, 5, 9, 3, 0];
  countUp(ex, spin, T - PT, 0.1, T + 3, 18, 8);
  const b = new Cv();
  const n80 = giantNum('80', 30, 6);
  b.text(SMALL, 36, 3, 'BPM', 4);
  b.text(TINY, 36, 13, 'F MAJOR · ii-V-I-vi', 3);
  b.text(TINY, 36, 19, '20 BARS OF 3 SECONDS.', 3);
  b.text(TINY, 36, 25, 'SO IS THIS SCREEN.', 2);
  for (let k = 0; k < 4; k++) b.rect(58 + k * 4, 5, 2, 2, 1);
  ex.push(g(shown([[T + 3, T + 6]]), svgOf(b) + n80));
  for (let k = 0; k < 4; k++) {
    const lamp = new Cv(); lamp.rect(58 + k * 4, 5, 2, 2, 4);
    ex.push(g(shown([[T + 3, T + 6]]), g(pulse(BAR, k * BEAT, (k + 1) * BEAT, false), svgOf(lamp))));
  }
});

// ---- START (51 - 60): press start ----------------------------------
frame(51, 60, (c, ex) => {
  const T = 51;
  const ps = new Cv(); ps.ctext(SMALL, 1, 'PRESS START', 4);
  ex.push(g(pulse(1.5, 0, 0.9), svgOf(ps)));
  const cmd = 'python tools/serve.py';
  const x0 = Math.floor((DW - measure(SMALL, cmd)) / 2);
  let x = x0;
  const t0 = T + 0.75, dt = 0.08;
  [...cmd].forEach((ch, i) => {
    const w = ch === ' ' ? SMALL.space : SMALL.g[ch][0].length;
    if (ch !== ' ') { const k = new Cv(); k.text(SMALL, x, 12, ch, 4); ex.push(g(shown([[t0 + i * dt, T + 9]]), svgOf(k))); }
    x += w + 1;
  });
  // the cursor rides along while it types, then blinks
  const cur = new Cv(); cur.rect(1, 19, 4, 1, 4);
  const steps = [[0, x0, 0, false]];
  let cx = x0;
  [...cmd].forEach((ch, i) => { cx += (ch === ' ' ? SMALL.space : SMALL.g[ch][0].length) + 1; steps.push([t0 + i * dt, cx, 0, false]); });
  ex.push(g(moved(steps), g(pulse(BEAT, 0, BEAT / 2), svgOf(cur))));
  const url = new Cv();
  const w1 = measure(TINY, 'THEN OPEN'), w2 = measure(SMALL, '127.0.0.1:8765');
  const ux = Math.floor((DW - w1 - 4 - w2) / 2);
  url.text(TINY, ux, 25, 'THEN OPEN', 3);
  url.text(SMALL, ux + w1 + 4, 23, '127.0.0.1:8765', 4);
  ex.push(g(shown([[t0 + cmd.length * dt + 0.4, T + 9]]), svgOf(url)));
});

// ------------------------------------------------------------------ assemble
// Some cuts are pushes instead: the old frame slides out to the left as the new one
// slides in from the right, four dots a step. The loop's own seam (60 -> 0) is one.
const PUSH = new Set([6, 18, 27, 45, 51, 60]), PT = 0.4;
function displayContent() {
  let out = '';
  FR.forEach((f, i) => {
    const c = new Cv();
    const ex = [];
    f.build(c, ex);
    const inT = f.t0 === 0 ? LOOP : f.t0;
    const pin = PUSH.has(inT), pout = PUSH.has(f.t1);
    const wins = [[pin && f.t0 > 0 ? f.t0 - PT : f.t0, f.t1]];
    if (pin && f.t0 === 0) wins.push([LOOP - PT, LOOP]);
    let inner = svgOf(c) + ex.join('');
    if (pin || pout) {
      const pts = [];
      if (f.t0 === 0) pts.push([0, 0, 0, false]);
      else if (pin) pts.push([0, DW, 0, false], [f.t0 - PT, DW, 0, 32], [f.t0, 0, 0, false]);
      else pts.push([0, 0, 0, false]);
      if (pout) pts.push([f.t1 - PT, 0, 0, 32], [f.t1, -DW, 0, false]);
      if (f.t0 === 0 && pin) pts.push([LOOP - PT, DW, 0, 32], [LOOP, 0, 0, false]);
      inner = g(moved(pts), inner);
    }
    out += `<g class="${shown(wins, i === 0)}">${inner}</g>`;
  });
  return out;
}
const CONTENT = displayContent();

// title clip: the letter cells, for the sparkle
const tclip = (() => {
  const c = new Cv();
  c.bm(TITLE_BM, TITLE_X, TITLE_Y, 4);
  return runs(c, 4).map(([x, y, w, h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}"/>`).join('');
})();

// bezel lettering: the 3 x 5 face as 2 px squares
function plate(str, x, y, fill, s = 2) {
  const c = new Cv(measure(TINY, str) + 2, 6);
  c.text(TINY, 0, 0, str, 4);
  return `<g transform="translate(${x} ${y}) scale(${s})" fill="${fill}"><path d="${runs(c, 4).map(([a, b, w, h]) => `M${a} ${b}h${w}v${h}h-${w}z`).join('')}"/></g>`;
}
const LEFT_PLATE = 'BECALMED AMUSEMENT WORKS';
const RIGHT_PLATE = '1 PLAYER · 10-HOUR BALL · FREE PLAY';

const levelCss = Object.entries(LEVEL).map(([k, v]) => `.l${k}{fill:${v}}`).join('');
const glassW = DW * P, glassH = DH * P;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="t d">
<title id="t">CASTAWAY: a pinball dot-matrix display in attract mode</title>
<desc id="d">An orange plasma dot-matrix display cycles through attract-mode screens for Castaway, a ten-hour lo-fi island video: the title, the island where a ship sails past while she sips a coconut, a SHIP MISSED award, the schedule's numbers, a few gags and a start prompt.</desc>
<defs>
<radialGradient id="dg"><stop offset="0" stop-color="#fff"/><stop offset=".55" stop-color="#fff"/><stop offset=".74" stop-color="#fff" stop-opacity=".45"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
<pattern id="lit" width="${P}" height="${P}" patternUnits="userSpaceOnUse" x="${GX}" y="${GY}"><circle cx="${P / 2}" cy="${P / 2}" r="${P / 2 + 0.4}" fill="url(#dg)"/></pattern>
<pattern id="off" width="${P}" height="${P}" patternUnits="userSpaceOnUse" x="${GX}" y="${GY}"><circle cx="${P / 2}" cy="${P / 2}" r="2.15" fill="${LEVEL[6]}"/></pattern>
<mask id="dots" maskUnits="userSpaceOnUse" x="${GX}" y="${GY}" width="${glassW}" height="${glassH}"><rect x="${GX}" y="${GY}" width="${glassW}" height="${glassH}" fill="url(#lit)"/></mask>
<clipPath id="tclip">${tclip}</clipPath>
${[...DIGITS.values()].join('')}
<linearGradient id="bz" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#26211d"/><stop offset=".5" stop-color="#151210"/><stop offset="1" stop-color="#0d0b0a"/></linearGradient>
<linearGradient id="gl" x1="0" y1="0" x2=".55" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".07"/><stop offset=".45" stop-color="#fff" stop-opacity=".015"/><stop offset=".46" stop-color="#fff" stop-opacity="0"/></linearGradient>
<radialGradient id="glow" cx=".5" cy=".5" r=".6"><stop offset="0" stop-color="#ff7a10" stop-opacity=".07"/><stop offset="1" stop-color="#ff7a10" stop-opacity="0"/></radialGradient>
</defs>
<style>g{animation:${LOOP}s step-end infinite}${levelCss}${css.join('')}@media (prefers-reduced-motion:reduce){*{animation:none!important}}</style>
<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="16" fill="url(#bz)" stroke="#3a332c" stroke-width="2"/>
<rect x="${GX - 9}" y="${GY - 9}" width="${glassW + 18}" height="${glassH + 18}" rx="7" fill="#050302" stroke="#000" stroke-width="2"/>
<rect x="${GX - 10}" y="${GY - 10}" width="${glassW + 20}" height="${glassH + 20}" rx="8" fill="none" stroke="#4a4038" stroke-width="1" opacity=".7"/>
<rect x="${GX - 4}" y="${GY - 4}" width="${glassW + 8}" height="${glassH + 8}" fill="${GLASS}"/>
<rect x="${GX}" y="${GY}" width="${glassW}" height="${glassH}" fill="url(#off)"/>
<g mask="url(#dots)"><g transform="translate(${GX} ${GY}) scale(${P})">${CONTENT}</g></g>
<rect x="${GX - 4}" y="${GY - 4}" width="${glassW + 8}" height="${glassH + 8}" fill="url(#glow)"/>
<rect x="${GX - 4}" y="${GY - 4}" width="${glassW + 8}" height="${glassH + 8}" fill="url(#gl)"/>
${[[12, 12], [W - 12, 12], [12, H - 12], [W - 12, H - 12]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4.5" fill="#2e2823" stroke="#0a0807"/><path d="M${x - 3} ${y}h6" stroke="#0a0807" stroke-width="1.4"/>`).join('')}
${plate(LEFT_PLATE, GX, H - 25, '#b8a688')}
${plate(RIGHT_PLATE, W - GX - (measure(TINY, RIGHT_PLATE)) * 2, H - 25, '#b8a688')}
</svg>
`;
const dest = DEBUG_OUT ? path.resolve(DEBUG_OUT) : OUT;
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.writeFileSync(dest, svg);
console.log(`${path.relative(process.cwd(), dest)}: ${(svg.length / 1024).toFixed(1)} KB, ${css.length} rules`);
