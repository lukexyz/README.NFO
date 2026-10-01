#!/usr/bin/env node
// C64 DYCP demo part: README header generator for CASTAWAY.
//
//   node examples/castaway/src/29-c64-dycp-scroller_opus_5.5.mjs
//
// Writes examples/castaway/assets/29-c64-dycp-scroller_opus_5.5.svg.
// Plain Node, no dependencies, no clock, no Math.random: the same bytes on
// every run. (The .md beside the assets is hand-written, not generated.)
//
// The style (catalogue entry c64-02) is the Commodore 64 "DYCP" demo part of
// 1989-92: Different Y Character Position, the scroller in which every 8x8
// character sits at its own height, so the line ripples along a sine as it
// scrolls. Its furniture, all drawn here from scratch:
//   * a small static credit line in a second colour at the very top
//   * a big two-row logo in multicolour (double-wide) pixels, fat squared
//     capitals filled with diagonal stripes in a 4-step luminance ramp, dark
//     outline, each row on a mauve panel of thin horizontal stripes closed
//     above and below by grey-to-white raster rules
//   * a straight one-line message in a gold gradient between the logo rows
//   * the DYCP line under the logo, with a raster colour wash
// plus two of its 1989 neighbours, used lightly: an FLD hop (whole logo rows
// jump, here once per bar of the theme) and tech-tech (each scanline sliding
// sideways, here the wave lines of a small sea picture at the bottom).
//
// The joke: DYCP means every character gets its own height. The main
// character has picked hers (sand level) and is sticking with it, while
// everything else in the line drifts past her: the scroller's custom charset
// has a bottle, a cat on a crate, a turtle, a shark in headphones and a
// walking coconut in it, and they bob on the same sine as the letters.
//
// Palette: the 16 VIC-II colours (Colodore measurements). Logo, credit line,
// gold line, charset, sprites and the island picture are original; no group
// logo, charset or picture was traced or copied.
//
// Timing (seconds; one bar of the theme is 3 s at 80 BPM, a beat 0.75 s):
//   scroller    the text is padded to a whole number of sine wavelengths and
//               its head is repeated past the end, so the lap is seamless;
//               every glyph runs one shared stepped sine track (whole-pixel
//               steps, like a real sine table) with its own negative delay
//   FLD hop     every bar: CAST hops on the downbeat, AWAY one beat later
//   stripes     colour cycling, one multicolour pixel per step
//   tech-tech   6 s (two bars), each sea line a little later than the one above
//   her head    nods once per beat
// The first frame already shows the logo and "DEPARTMENT OF BUOYANCY
// PRESENTS... CASTAWAY!" centred on the wave; prefers-reduced-motion pauses
// every track on that frame.
//
// How it is drawn (no <text>, no filters, no script): lit pixels are merged
// into rect runs and written as one <path> per colour; the logo fill is a
// pixel-exact stripe <pattern> clipped by the letters; the scroller glyphs
// are <use> references to one path per character, inside a <mask> over a
// band of raster colours, so each letter changes colour as it rises and falls.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '29-c64-dycp-scroller_opus_5.5';
// --at=SECONDS shifts every animation, for checking a later frame;
// --out=FILE writes somewhere else (both are for testing only)
const argv = process.argv.slice(2);
const flag = (k) => { const a = argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : null; };
const AT = Number(flag('at') || 0);
const OUT = flag('out') ? path.resolve(flag('out')) : path.resolve(here, `../assets/${SLUG}.svg`);

// ------------------------------------------------------------------ facts
// Checked 2026-10-01 against D:/python/castaway (read-only): activities.toml
// lists 94 activities on four timers plus chained follow-ups (so "90+"),
// run 10:00:00 with seed 1992, starts snap to 3 s bars; media/audio holds 171
// synthesized files (so "150+"). The banner only states the rounded figures.

// ---------------------------------------------------------------- palette
const C = {
  black: '#000000', white: '#ffffff', red: '#813338', cyan: '#75cec8',
  purple: '#8e3c97', green: '#56ac4d', blue: '#2e2c9b', yellow: '#edf171',
  orange: '#8e5029', brown: '#553800', lred: '#c46c71', dgrey: '#4a4a4a',
  grey: '#7b7b7b', lgreen: '#a9ff9f', lblue: '#706deb', lgrey: '#b2b2b2',
};
// her skin: a warm light tone just off the VIC-II list, so it reads as skin
// next to the coral (light red) tank top instead of matching it
const SKIN = '#e2a98c';

// ----------------------------------------------------------------- layout
const W = 384; // lowres pixels (the SVG is drawn at 2x)
const CREDIT_Y = 5;
const RULE = [C.grey, C.lgrey, C.white, C.lgrey, C.grey];
const PANEL_H = 44;
const LH = 36; // logo cap height
const RULE1_Y = 15;
const PANEL1_Y = RULE1_Y + RULE.length;
const RULE2_Y = PANEL1_Y + PANEL_H;
const GOLD_Y = RULE2_Y + RULE.length + 4;
const RULE3_Y = GOLD_Y + 7 + 4;
const PANEL2_Y = RULE3_Y + RULE.length;
const RULE4_Y = PANEL2_Y + PANEL_H;
const ZONE_Y = RULE4_Y + RULE.length; // DYCP zone
const ZONE_H = 48;
const RULE5_Y = ZONE_Y + ZONE_H;
const PIC_Y = RULE5_Y + RULE.length;
const PIC_H = 48;
const RULE6_Y = PIC_Y + PIC_H;
const H = RULE6_Y + RULE.length + 5;
const LOGO_TOP = 5; // letter top inside a panel (room for the hop above)

// ----------------------------------------------------------------- helpers
function mulberry32(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(1992);
const n = (v) => (Number.isInteger(v) ? String(v) : String(+v.toFixed(3)));
const D = (s) => `${n(s - AT)}s`; // an animation delay, shifted by --at

// Lit cells -> compact path: horizontal runs, merged down identical rows.
function cellsToPath(isOn, w, h, ox = 0, oy = 0) {
  const rects = [];
  let active = new Map();
  for (let y = 0; y < h; y++) {
    const next = new Map();
    let x = 0;
    while (x < w) {
      if (!isOn(x, y)) { x++; continue; }
      let x1 = x;
      while (x1 < w && isOn(x1, y)) x1++;
      const key = `${x},${x1}`;
      const r = active.get(key);
      if (r) { r.h++; next.set(key, r); } else { const nr = { x, y, w: x1 - x, h: 1 }; rects.push(nr); next.set(key, nr); }
      x = x1;
    }
    active = next;
  }
  return rects.map((r) => `M${n(r.x + ox)} ${n(r.y + oy)}h${r.w}v${r.h}h${-r.w}`).join('');
}

// A paint canvas holding one colour (or null) per lowres cell.
class Canvas {
  constructor(w, h) { this.w = w; this.h = h; this.a = new Array(w * h).fill(null); }
  set(x, y, c) { x = Math.floor(x); y = Math.floor(y); if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.a[y * this.w + x] = c; }
  get(x, y) { return x >= 0 && y >= 0 && x < this.w && y < this.h ? this.a[y * this.w + x] : null; }
  // one multicolour pixel: two lowres pixels wide
  mc(x, y, c) { this.set(2 * x, y, c); this.set(2 * x + 1, y, c); }
  // one <path> per colour, in order of first appearance
  paths(ox = 0, oy = 0, attrs = '') {
    const cols = [];
    for (const c of this.a) if (c && !cols.includes(c)) cols.push(c);
    return cols.map((c) => `<path${attrs} fill="${c}" d="${cellsToPath((x, y) => this.get(x, y) === c, this.w, this.h, ox, oy)}"/>`).join('');
  }
}

// Stepped keyframes: fn(s) -> integer for s in [0,1); one keyframe per change.
// Used with step-end timing, so values jump by whole pixels like a table.
function steppedKeyframes(name, fn, fmt, samples = 1200) {
  let out = `@keyframes ${name}{`;
  let prev = null;
  for (let k = 0; k < samples; k++) {
    const s = k / samples;
    const v = fn(s);
    if (v !== prev) { out += `${n(+(s * 100).toFixed(3))}%{transform:${fmt(v)}}`; prev = v; }
  }
  return `${out}100%{transform:${fmt(fn(0))}}}`;
}

// ------------------------------------------------------------- 8x8 charset
// An original 8x8 demo charset: 7x7 capitals with 2 px stems and clipped
// corners, in an 8 px cell. '~' is a quaver, '*' a small diamond.
const FONT = {
  A: ['.#####.', '##...##', '##...##', '#######', '##...##', '##...##', '##...##'],
  B: ['######.', '##...##', '##..##.', '######.', '##...##', '##...##', '######.'],
  C: ['.######', '##.....', '##.....', '##.....', '##.....', '##.....', '.######'],
  D: ['#####..', '##..##.', '##...##', '##...##', '##...##', '##..##.', '#####..'],
  E: ['#######', '##.....', '##.....', '######.', '##.....', '##.....', '#######'],
  F: ['#######', '##.....', '##.....', '######.', '##.....', '##.....', '##.....'],
  G: ['.######', '##.....', '##.....', '##..###', '##...##', '##...##', '.######'],
  H: ['##...##', '##...##', '##...##', '#######', '##...##', '##...##', '##...##'],
  I: ['######', '..##..', '..##..', '..##..', '..##..', '..##..', '######'],
  J: ['....###', '.....##', '.....##', '.....##', '##...##', '##...##', '.#####.'],
  K: ['##...##', '##..##.', '##.##..', '####...', '##.##..', '##..##.', '##...##'],
  L: ['##.....', '##.....', '##.....', '##.....', '##.....', '##.....', '#######'],
  M: ['##...##', '###.###', '#######', '##.#.##', '##...##', '##...##', '##...##'],
  N: ['##...##', '###..##', '####.##', '##.####', '##..###', '##...##', '##...##'],
  O: ['.#####.', '##...##', '##...##', '##...##', '##...##', '##...##', '.#####.'],
  P: ['######.', '##...##', '##...##', '######.', '##.....', '##.....', '##.....'],
  Q: ['.#####.', '##...##', '##...##', '##...##', '##.#.##', '##..##.', '.###.##'],
  R: ['######.', '##...##', '##...##', '######.', '##.##..', '##..##.', '##...##'],
  S: ['.######', '##.....', '##.....', '.#####.', '.....##', '.....##', '######.'],
  T: ['######', '..##..', '..##..', '..##..', '..##..', '..##..', '..##..'],
  U: ['##...##', '##...##', '##...##', '##...##', '##...##', '##...##', '.#####.'],
  V: ['##...##', '##...##', '##...##', '##...##', '.##.##.', '..###..', '...#...'],
  W: ['##...##', '##...##', '##...##', '##.#.##', '#######', '###.###', '##...##'],
  X: ['##...##', '##...##', '.##.##.', '..###..', '.##.##.', '##...##', '##...##'],
  Y: ['##..##', '##..##', '##..##', '.####.', '..##..', '..##..', '..##..'],
  Z: ['#######', '....##.', '...##..', '..##...', '.##....', '##.....', '#######'],
  0: ['.#####.', '##...##', '##..###', '##.#.##', '###..##', '##...##', '.#####.'],
  1: ['..##..', '.###..', '..##..', '..##..', '..##..', '..##..', '.####.'],
  2: ['.#####.', '##...##', '.....##', '..####.', '.##....', '##.....', '#######'],
  3: ['######.', '.....##', '.....##', '..####.', '.....##', '.....##', '######.'],
  4: ['...###.', '..####.', '.##.##.', '##..##.', '#######', '....##.', '....##.'],
  5: ['#######', '##.....', '######.', '.....##', '.....##', '##...##', '.#####.'],
  6: ['.#####.', '##.....', '##.....', '######.', '##...##', '##...##', '.#####.'],
  7: ['#######', '.....##', '....##.', '...##..', '..##...', '..##...', '..##...'],
  8: ['.#####.', '##...##', '##...##', '.#####.', '##...##', '##...##', '.#####.'],
  9: ['.#####.', '##...##', '##...##', '.######', '.....##', '.....##', '.#####.'],
  '.': ['..', '..', '..', '..', '..', '##', '##'],
  ',': ['...', '...', '...', '...', '.##', '.##', '##.'],
  ':': ['..', '##', '##', '..', '..', '##', '##'],
  '-': ['.....', '.....', '.....', '#####', '.....', '.....', '.....'],
  '!': ['##', '##', '##', '##', '##', '..', '##'],
  '?': ['.#####.', '##...##', '.....##', '...###.', '...##..', '.......', '...##..'],
  "'": ['##', '##', '#.', '..', '..', '..', '..'],
  '/': ['.....##', '....##.', '....##.', '...##..', '..##...', '.##....', '##.....'],
  '(': ['..##', '.##.', '##..', '##..', '##..', '.##.', '..##'],
  ')': ['##..', '.##.', '..##', '..##', '..##', '.##.', '##..'],
  '+': ['......', '..##..', '..##..', '######', '..##..', '..##..', '......'],
  '~': ['...###.', '...#.##', '...#..#', '...#...', '.###...', '####...', '.##....'],
  '*': ['.......', '...#...', '..###..', '.#####.', '..###..', '...#...', '.......'],
};
const glyphOffset = (g) => (g[0].length <= 3 ? 1 : 0); // nudge narrow punctuation in
function drawText(cv, s, x, y, colorFor) {
  [...s].forEach((ch, i) => {
    if (ch === ' ') return;
    const g = FONT[ch];
    if (!g) throw new Error(`charset lacks ${JSON.stringify(ch)}`);
    const x0 = x + i * 8 + glyphOffset(g);
    g.forEach((row, r) => [...row].forEach((c, k) => { if (c === '#') cv.set(x0 + k, y + r, colorFor(r, i)); }));
  });
}

// ----------------------------------------------------- static layer canvas
const stat = new Canvas(W, H);

// credit line: labels in light blue, values in light grey
{
  const parts = [['CODE: ', 'PYTHON, JS'], ['  MUSIC: ', 'ALSO CODE'], ['  SAMPLES: ', '0']];
  const s = parts.map((p) => p.join('')).join('');
  const x0 = Math.round((W - s.length * 8) / 2 / 2) * 2;
  let i = 0;
  for (const [label, value] of parts) {
    drawText(stat, label, x0 + i * 8, CREDIT_Y, () => C.lblue);
    i += label.length;
    drawText(stat, value, x0 + i * 8, CREDIT_Y, () => C.lgrey);
    i += value.length;
  }
}

// raster rules
for (const y0 of [RULE1_Y, RULE2_Y, RULE3_Y, RULE4_Y, RULE5_Y, RULE6_Y]) {
  RULE.forEach((c, r) => { for (let x = 0; x < W; x++) stat.set(x, y0 + r, c); });
}

// mauve panels: thin horizontal stripes, a little lighter towards the middle
function panelRow(r) {
  const mid = Math.abs(r - (PANEL_H - 1) / 2) / ((PANEL_H - 1) / 2); // 0 middle .. 1 edge
  if (r % 2 === 1) return C.blue;
  if (mid > 0.82) return r % 4 === 0 ? C.blue : C.purple;
  return C.purple;
}
for (const y0 of [PANEL1_Y, PANEL2_Y]) {
  for (let r = 0; r < PANEL_H; r++) { const c = panelRow(r); for (let x = 0; x < W; x++) stat.set(x, y0 + r, c); }
}

// the gold line between the logo rows
const GOLD_TEXT = 'SHE STAYS. EVERYTHING ELSE DRIFTS BY.';
const GOLD = [C.white, C.yellow, C.yellow, C.yellow, C.orange, C.orange, C.brown];
{
  const x0 = Math.round((W - GOLD_TEXT.length * 8) / 2 / 2) * 2;
  drawText(stat, GOLD_TEXT, x0, GOLD_Y, (r) => GOLD[r]);
}

// ------------------------------------------------------------------ logo
// Fat squared capitals as rect unions with 45 degree corner cuts, sampled on
// the multicolour grid (2 px wide pixels), so diagonals step 2 across, 2 down.
const inR = (x, y, x0, y0, x1, y1) => x >= x0 && x < x1 && y >= y0 && y < y1;
// corner cut: (cx, cy) is the corner, (dx, dy) points into the letter
const cut = (x, y, cx, cy, dx, dy, c) => dx * (x - cx) >= 0 && dy * (y - cy) >= 0 && dx * (x - cx) + dy * (y - cy) < c;
const LETTERS = {
  C: {
    w: 64,
    f: (x, y) => inR(x, y, 0, 0, 64, 36) && !inR(x, y, 16, 8, 64, 28)
      && !cut(x, y, 0, 0, 1, 1, 12) && !cut(x, y, 0, 36, 1, -1, 12)
      && !cut(x, y, 64, 0, -1, 1, 6) && !cut(x, y, 64, 36, -1, -1, 6)
      && !(y < 8 && cut(x, y, 64, 8, -1, -1, 4)) && !(y >= 28 && cut(x, y, 64, 28, -1, 1, 4)),
  },
  A: {
    w: 64,
    f: (x, y) => inR(x, y, 0, 0, 64, 36) && !inR(x, y, 16, 8, 48, 14) && !inR(x, y, 16, 22, 48, 36)
      && !cut(x, y, 0, 0, 1, 1, 14) && !cut(x, y, 64, 0, -1, 1, 14),
  },
  S: {
    w: 64,
    f: (x, y) => inR(x, y, 0, 0, 64, 36) && !inR(x, y, 16, 8, 64, 14) && !inR(x, y, 0, 22, 48, 28)
      && !cut(x, y, 0, 0, 1, 1, 12) && !cut(x, y, 64, 36, -1, -1, 12)
      && !cut(x, y, 64, 0, -1, 1, 6) && !cut(x, y, 0, 36, 1, -1, 6)
      && !(y < 22 && cut(x, y, 0, 22, 1, -1, 6)) && !(y >= 14 && cut(x, y, 64, 14, -1, 1, 6)),
  },
  T: {
    w: 60,
    f: (x, y) => (inR(x, y, 0, 0, 60, 8) || inR(x, y, 22, 8, 38, 36))
      && !cut(x, y, 0, 0, 1, 1, 6) && !cut(x, y, 60, 0, -1, 1, 6),
  },
  W: {
    w: 88,
    f: (x, y) => inR(x, y, 0, 0, 88, 36) && !inR(x, y, 16, 0, 72, 10)
      && !inR(x, y, 16, 10, 36, 28) && !inR(x, y, 52, 10, 72, 28)
      && !cut(x, y, 0, 36, 1, -1, 12) && !cut(x, y, 88, 36, -1, -1, 12)
      && !cut(x, y, 0, 0, 1, 1, 4) && !cut(x, y, 88, 0, -1, 1, 4)
      && !(y >= 10 && cut(x, y, 36, 10, 1, 1, 4)) && !(y >= 10 && cut(x, y, 52, 10, -1, 1, 4)),
  },
  Y: {
    w: 64,
    f: (x, y) => inR(x, y, 0, 0, 64, 36) && !inR(x, y, 16, 0, 48, 14)
      && !inR(x, y, 0, 22, 24, 36) && !inR(x, y, 40, 22, 64, 36)
      && !cut(x, y, 0, 0, 1, 1, 4) && !cut(x, y, 64, 0, -1, 1, 4)
      && !(y < 22 && cut(x, y, 0, 22, 1, -1, 10)) && !(y < 22 && cut(x, y, 64, 22, -1, -1, 10)),
  },
};
const LGAP = 8;
// Rasterise a word into a boolean grid in panel-local coordinates.
function logoRow(word) {
  const total = [...word].reduce((w, c, i) => w + LETTERS[c].w + (i ? LGAP : 0), 0);
  const x0 = Math.round((W - total - 2) / 2 / 2) * 2;
  const g = new Canvas(W, PANEL_H);
  let x = x0;
  for (const ch of word) {
    const L = LETTERS[ch];
    for (let j = 0; j < LH; j++) {
      for (let i = 0; i < L.w / 2; i++) if (L.f(2 * i + 1, j + 0.5)) g.mc((x >> 1) + i, LOGO_TOP + j, 1);
    }
    x += L.w + LGAP;
  }
  return { g, x0, total };
}
// stripe ramps (4 palette steps up and back down)
const SUN = [C.brown, C.orange, C.yellow, C.white, C.yellow, C.orange];
const SEA = [C.blue, C.lblue, C.cyan, C.white, C.cyan, C.lblue];
const STRIPE = 2; // multicolour pixels per stripe
// Pixel-exact diagonal stripe tile: stripe index = (mcx + row) / STRIPE.
function stripePattern(id, ramp) {
  const per = ramp.length * STRIPE; // period in mc pixels and in rows
  const cv = new Canvas(per * 2, per);
  for (let y = 0; y < per; y++) for (let i = 0; i < per; i++) cv.mc(i, y, ramp[Math.floor(((i + y) % per) / STRIPE)]);
  return { def: `<pattern id="${id}" patternUnits="userSpaceOnUse" width="${per * 2}" height="${per}">${cv.paths()}</pattern>`, w: per * 2 };
}
const logoDefs = [];
const logoBody = [];
function buildLogo(word, panelY, patId, ramp, cls, flowCls) {
  const { g, x0, total } = logoRow(word);
  const on = (x, y) => g.get(x, y) === 1;
  // outline: one multicolour pixel sideways, one row up and down
  const out = new Canvas(W, PANEL_H);
  for (let y = 0; y < PANEL_H; y++) for (let x = 0; x < W; x++) {
    if (on(x, y)) continue;
    let hit = false;
    for (let dy = -1; dy <= 1 && !hit; dy++) for (let dx = -2; dx <= 2 && !hit; dx++) if (on(x + dx, y + dy)) hit = true;
    if (hit) out.set(x, y, C.black);
  }
  // drop shadow: the outlined shape again, 2 px right and 2 rows down
  const shadow = new Canvas(W, PANEL_H);
  for (let y = 0; y < PANEL_H; y++) for (let x = 0; x < W; x++) {
    const sx = x - 2; const sy = y - 2;
    if ((on(sx, sy) || out.get(sx, sy)) && !on(x, y) && !out.get(x, y)) shadow.set(x, y, C.black);
  }
  const pat = stripePattern(patId, ramp);
  logoDefs.push(pat.def);
  const clipId = `${patId}c`;
  logoDefs.push(`<clipPath id="${clipId}"><path d="${cellsToPath(on, W, PANEL_H)}"/></clipPath>`);
  const fx = x0 - pat.w;
  logoBody.push(`<g transform="translate(0 ${panelY})"><g class="${cls}">`
    + `<path fill="${C.black}" opacity="0.55" d="${cellsToPath((x, y) => !!shadow.get(x, y), W, PANEL_H)}"/>`
    + `<path fill="${C.black}" d="${cellsToPath((x, y) => !!out.get(x, y), W, PANEL_H)}"/>`
    + `<g clip-path="url(#${clipId})"><rect class="${flowCls}" x="${fx}" y="0" width="${total + 2 * pat.w + 4}" height="${PANEL_H}" fill="url(#${patId})"/></g>`
    + '</g></g>');
  return pat.w;
}
const PAT_W = buildLogo('CAST', PANEL1_Y, 'sun', SUN, 'hop1', 'flowR');
buildLogo('AWAY', PANEL2_Y, 'sea', SEA, 'hop2', 'flowL');

// -------------------------------------------------------- scroller sprites
// Multicolour sprites in the scroller's charset: one char = one 2 px pixel.
const SPR_COL = {
  G: C.lgreen, g: C.green, w: C.white, W: C.lgrey, O: C.orange, o: C.yellow, b: C.brown,
  k: C.black, d: C.dgrey, r: C.grey, c: C.cyan, R: C.red, l: C.lred, B: C.blue, L: C.lblue,
};
// Expanded multicolour sprites (X and Y doubled, so one pixel is 4x2). The
// last row of each is the waterline it floats on, just under the letters'
// baseline. (y = pale yellow-green, the turtle's skin)
const SPRITES = {
  bottle: [
    '..gGGGGGg.....',
    '.gGwwwwwGg....',
    'gGwWWWWWwgGGoo',
    'ggwWWWWWwggGOO',
    '.gwwwwwwwg....',
    '..ggggggg.....',
    'cc.cccc..ccc.c',
  ],
  cat: [
    '.r...r....',
    '.rrrrr....',
    '.rGrGr....',
    '..rwr...r.',
    '.drwrd..r.',
    '.rdwdrrr..',
    'oooooooooo',
    'ObbbbbbbbO',
    'OOOOOOOOOO',
    'c.ccc..cc.',
  ],
  turtle: [
    '.....GGGG.....',
    '...GGgGgGGG...',
    '.yyGgGgGgGgG..',
    'ykyygggggggggy',
    '.yy.yyy...yyy.',
    'cc.cccc..ccc.c',
  ],
  shark: [
    '..........d...',
    '...wwwww.dd...',
    '..w.....wdd...',
    '.rrrrrwwwrrr..',
    'rrkrrrwWwrrrrr',
    'rrrrrrwwwrrrrr',
    'rwwwwrrrrrrrrr',
    'cwccwcccwccwcc',
  ],
  coconut: [
    '...OOOO..',
    '..OoOOOO.',
    '.OOObObOO',
    '.OOOOOOOO',
    'k.OOOOOO.',
    'RlRRRRRRl',
    '.R.R.R.R.',
    'R..R.R..R',
    'cc.ccc.cc',
  ],
};
SPR_COL.y = C.yellow;
const SPR_W = {};
const sprDefs = [];
for (const [name, rows] of Object.entries(SPRITES)) {
  const w = Math.max(...rows.map((r) => r.length));
  const cv = new Canvas(w * 4, rows.length * 2);
  rows.forEach((row, y) => [...row].forEach((ch, x) => {
    if (ch === '.') return;
    for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) cv.set(x * 4 + i, y * 2 + j, SPR_COL[ch]);
  }));
  SPR_W[name] = w * 4;
  // the waterline (last two rows) sits just under the letters' baseline
  sprDefs.push(`<g id="s_${name}">${cv.paths(0, 9 - rows.length * 2)}</g>`);
}

// ----------------------------------------------------------- the scroller
const SCROLL = [
  'DEPARTMENT OF BUOYANCY PRESENTS... CASTAWAY!  ~  TEN HOURS, ONE TINY ISLAND, ONE PALM,',
  'ONE RAFT AND HER, NODDING TO HER HEADPHONES. SHE STAYS. EVERYTHING ELSE DRIFTS BY...',
  '{bottle} A BOTTLE, WASHING STRAIGHT BACK...',
  '{cat} A CAT ON A CRATE (NAPS UP THE PALM, FLOATS OFF AGAIN)...',
  '{turtle} A SEA TURTLE, JUST VISITING...',
  '{shark} A SHARK IN HEADPHONES, ON THE BEAT...',
  '{coconut} A COCONUT, WALKING OFF WITH A HERMIT CRAB UNDER IT...',
  '~  DYCP MEANS EVERY CHARACTER GETS ITS OWN HEIGHT. THE MAIN CHARACTER HAS PICKED HERS: SAND LEVEL.',
  'NOW AND THEN SHE CLIMBS THE PALM FOR ONE BAR OF SIGNAL.',
  '~  90+ ACTIVITIES, FOUR TIMERS, EVERY GAG ON THE NEXT BAR. EVERY SOUND SYNTHESIZED FROM CODE.',
  '~  PYTHON TOOLS/SERVE.PY, THEN 127.0.0.1:8765 ... LET IT RUN.',
].join('   ');
const AMP = 10; // wave amplitude, lowres px
const LAMBDA = 256; // wavelength, lowres px
const SPEED = 46; // lowres px per second
const X0 = 16; // where the text starts on the first frame (centred)
const NPH = 120; // phase buckets
const BASE = ZONE_Y + Math.round(ZONE_H / 2) - 1; // glyph top at rest

// items: {o: left offset in the line, w, glyph | sprite}
const items = [];
let LINE; // the lap: text plus a pause, rounded up to whole wavelengths
{
  let o = 0;
  const re = /\{(\w+)\}|([\s\S])/g;
  let m;
  while ((m = re.exec(SCROLL))) {
    if (m[1]) {
      const w = SPR_W[m[1]];
      items.push({ o: o + 4, w, sprite: m[1] });
      o += Math.ceil((w + 8) / 8) * 8;
    } else {
      if (m[2] !== ' ') {
        const g = FONT[m[2]];
        if (!g) throw new Error(`charset lacks ${JSON.stringify(m[2])}`);
        items.push({ o: o + glyphOffset(g), w: 8, ch: m[2] });
      }
      o += 8;
    }
  }
  LINE = Math.ceil((o + 8 * 10) / LAMBDA) * LAMBDA;
}
const T = LINE / SPEED; // one lap, seconds
// wave crests drift right at about a quarter of the text speed
const KW = -Math.round((T * SPEED) / (4 * LAMBDA));
const F = SPEED / LAMBDA - KW / T; // each glyph's bob frequency
const P = 1 / F;
// copies of the head past the end, and of the tail before the start
const all = [];
for (const it of items) {
  all.push(it);
  if (it.o < W + 32) all.push({ ...it, o: it.o + LINE });
  if (it.o > LINE - X0 - 40) all.push({ ...it, o: it.o - LINE });
}
const glyphIds = new Map();
const glyphDefs = [];
for (const it of items) {
  if (!it.ch || glyphIds.has(it.ch)) continue;
  const g = FONT[it.ch];
  const id = `g${it.ch.charCodeAt(0)}`;
  glyphIds.set(it.ch, id);
  glyphDefs.push(`<path id="${id}" d="${cellsToPath((x, y) => g[y] && g[y][x] === '#', 8, 7)}"/>`);
}
const phaseClass = (o, w) => {
  const centre = X0 + o + w / 2;
  const delta = (((-centre / LAMBDA) % 1) + 1) % 1;
  return `p${Math.round(delta * NPH) % NPH}`;
};
const letterUses = [];
const spriteUses = [];
for (const it of all) {
  const cls = `b ${phaseClass(it.o, it.w)}`;
  if (it.ch) letterUses.push(`<use class="${cls}" href="#${glyphIds.get(it.ch)}" x="${it.o}" y="${BASE}"/>`);
  else spriteUses.push(`<use class="${cls}" href="#s_${it.sprite}" x="${it.o}" y="${BASE}"/>`);
}
// raster wash for the letters: sun on the crests, sea in the troughs
const WASH_KEYS = [
  [C.white, 3], [C.yellow, 1], [C.white, 1], [C.yellow, 5], [C.lgreen, 1], [C.yellow, 1],
  [C.lgreen, 4], [C.cyan, 1], [C.lgreen, 1], [C.cyan, 5], [C.lblue, 1], [C.cyan, 1], [C.lblue, 20],
];
const washTop = BASE - AMP - 1;
const washRows = [];
for (const [c, k] of WASH_KEYS) for (let i = 0; i < k; i++) washRows.push(c);
const washCv = new Canvas(1, washRows.length);
washRows.forEach((c, r) => washCv.set(0, r, c));
const washDef = `<pattern id="wash" patternUnits="userSpaceOnUse" x="0" y="${washTop}" width="${W}" height="${washRows.length}">`
  + washRows.map((c, r) => `<rect y="${r}" width="${W}" height="1" fill="${c}"/>`).join('') + '</pattern>';

// --------------------------------------------------------- island picture
// Multicolour pixels (2x1), drawn in the picture's own coordinates.
const PW = W / 2; // 192 multicolour pixels across
const HORIZON = 25;
const back = new Canvas(W, PIC_H); // sky, sun, clouds, sea
const front = new Canvas(W, PIC_H); // island, palm, her body
const head = new Canvas(W, PIC_H); // her head (nods)
const raft = new Canvas(W, PIC_H);
{
  // sky: light blue to cyan, dithered across the join
  for (let y = 0; y < HORIZON; y++) for (let x = 0; x < PW; x++) {
    let c = C.cyan;
    if (y < 5) c = C.lblue;
    else if (y < 9) c = (x + y) % 2 ? C.cyan : C.lblue;
    else if (y < 11) c = (x + y) % 4 === 0 ? C.lblue : C.cyan;
    back.mc(x, y, c);
  }
  // sun, upper left
  const sx = 26; const sy = 8;
  for (let y = 0; y < HORIZON; y++) for (let x = 0; x < PW; x++) {
    const d = Math.hypot((x - sx) * 2, y - sy);
    if (d < 4.2) back.mc(x, y, C.white);
    else if (d < 7.2) back.mc(x, y, C.yellow);
    else if (d < 8.6 && (x + y) % 2 === 0) back.mc(x, y, C.yellow);
  }
  // cumulus along the horizon: white tops, light grey undersides
  const puffs = [
    [8, 23, 7, 5], [18, 20, 10, 7], [31, 22, 8, 5], [44, 19, 11, 8], [57, 22, 9, 5], [66, 23, 6, 3],
    [94, 23, 5, 3], [101, 21, 7, 5], [109, 23, 5, 3],
    [158, 22, 9, 5], [170, 18, 12, 9], [184, 21, 10, 6], [192, 23, 6, 4],
  ];
  for (let y = 0; y < HORIZON; y++) for (let x = 0; x < PW; x++) {
    for (const [cx, cy, rx, ry] of puffs) {
      const e = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2;
      if (e < 1) {
        const rim = y > cy + 1 && e > 0.45;
        back.mc(x, y, rim && ((x + y) % 2 || e > 0.8) ? C.lgrey : C.white);
        break;
      }
    }
  }
  // sea: a bright far line, then blue
  for (let y = HORIZON; y < PIC_H; y++) for (let x = 0; x < PW; x++) {
    let c = C.blue;
    if (y === HORIZON) c = C.lblue;
    else if (y === HORIZON + 1) c = x % 2 ? C.lblue : C.blue;
    back.mc(x, y, c);
  }
  // turquoise shallows round the island
  const ix = 124; const iy = 40;
  for (let y = HORIZON + 2; y < PIC_H; y++) for (let x = 0; x < PW; x++) {
    const e = ((x - ix) / 38) ** 2 + ((y - iy) / 7.5) ** 2;
    if (e < 0.55) back.mc(x, y, C.cyan);
    else if (e < 0.8) back.mc(x, y, (x + y) % 2 ? C.cyan : C.lblue);
    else if (e < 1) back.mc(x, y, (x + y) % 2 ? C.lblue : C.blue);
  }
  // the island: sand, a wet rim, foam
  for (let y = 30; y < PIC_H; y++) for (let x = 0; x < PW; x++) {
    const e = ((x - ix) / 25) ** 2 + ((y - (iy - 1)) / 4.6) ** 2;
    if (e < 1) {
      let c = C.yellow;
      if (y >= iy + 2) c = C.orange;
      else if (y === iy + 1) c = (x % 3 === 0) ? C.orange : C.yellow;
      if (e > 0.82 && y > iy - 1) c = C.brown;
      front.mc(x, y, c);
    } else if (e < 1.22 && y >= iy - 3 && (x * 7 + y * 3) % 5 !== 0) front.mc(x, y, C.white);
  }
  // a couple of rocks
  for (const [rx, ry] of [[104, 42], [140, 43]]) {
    front.mc(rx, ry, C.grey); front.mc(rx + 1, ry, C.grey); front.mc(rx, ry - 1, C.lgrey); front.mc(rx + 1, ry + 1, C.dgrey); front.mc(rx, ry + 1, C.dgrey);
  }
  // bushes at the foot of the palm
  const bush = (cx, cy, rx, ry) => {
    for (let y = cy - ry; y <= cy + ry; y++) for (let x = cx - rx; x <= cx + rx; x++) {
      const e = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2;
      if (e < 1) front.mc(x, y, y < cy - ry * 0.2 && (x + y) % 2 ? C.lgreen : C.green);
    }
  };
  bush(136, 37, 6, 2.6); bush(144, 38, 4, 2); bush(113, 39, 3, 1.6);
  // the palm: a leaning trunk, ringed every third row
  const baseX = 135; const baseY = 38; const topX = 127; const topY = 6;
  for (let y = topY; y <= baseY; y++) {
    const t = (baseY - y) / (baseY - topY);
    const x = Math.round(baseX - (baseX - topX) * t ** 1.6);
    const ring = y % 3 === 0;
    front.mc(x, y, ring ? C.brown : C.orange);
    front.mc(x + 1, y, ring ? C.brown : (y % 3 === 1 ? C.lred : C.orange));
    if (t < 0.15) front.mc(x - 1, y, C.brown);
  }
  // fronds: arched quadratic curves out of the crown, leaflets hanging below
  const cxL = topX * 2 + 2; const cyL = topY; // crown in lowres px
  const fronds = [[-46, 12, 9], [-34, -3, 8], [-20, 16, 6], [44, 11, 9], [32, -4, 8], [18, 17, 6], [-4, -7, 3], [6, 9, 4]];
  for (const [dx, dy, lift] of fronds) {
    const steps = 80;
    for (let k = 0; k <= steps; k++) {
      const t = k / steps;
      const mx = dx / 2; const my = dy / 2 - lift;
      const x = cxL + 2 * (1 - t) * t * mx + t * t * dx;
      const y = cyL + 2 * (1 - t) * t * my + t * t * dy;
      const mx2 = Math.floor(x / 2);
      front.mc(mx2, Math.round(y), C.lgreen);
      if (t > 0.12 && t < 0.92) {
        const len = Math.round(3 * (1 - Math.abs(t - 0.5) * 1.6));
        for (let j = 1; j <= len; j++) front.mc(mx2 + (dx < 0 ? 1 : -1) * (j > 2 ? 1 : 0), Math.round(y) + j, C.green);
      }
    }
  }
  // coconuts
  for (const [x, y] of [[126, 8], [128, 9], [125, 9]]) { front.mc(x, y, C.brown); }
  // her, standing on the sand left of the trunk, facing us: brown hair in a
  // low bun, cream headphones, coral tank top, cream shorts, bare feet
  const HER = [
    '.HHH.', // 0 hair (head layer: rows 0-3)
    'wHHHw', // 1 headphone cups
    'wSSSw', // 2 face
    '.SSSH', // 3 chin, the bun behind
    '..S..', // 4 neck
    '.TTT.', // 5 tank top
    'STTTS', // 6
    'STTTS', // 7
    'STTTS', // 8
    '.CCC.', // 9 shorts
    'SCCCS', // 10
    '.S.S.', // 11 legs
    '.S.S.', // 12
    '.S.S.', // 13
    'SS.SS', // 14 feet
  ];
  const HER_COL = { H: C.brown, w: C.white, S: SKIN, T: C.lred, C: C.lgrey };
  const hx = 112; const hy = 24;
  HER.forEach((row, y) => [...row].forEach((ch, x) => {
    if (ch === '.') return;
    (y < 4 ? head : front).mc(hx + x, hy + y, HER_COL[ch]);
  }));
  // the raft, right of the island
  const RAFT = ['lRlRlRlRlR', 'RbRbRbRbRb', '.R.R.R.R.R'];
  RAFT.forEach((row, y) => [...row].forEach((ch, x) => { if (ch !== '.') raft.mc(158 + x, 40 + y, SPR_COL[ch]); }));
  raft.mc(160, 39, C.lgrey); raft.mc(165, 39, C.lgrey);
}
// tech-tech sea: one row of wave dashes per scanline, each sliding sideways
const seaRows = [];
{
  const PAD = 16;
  for (let y = HORIZON + 2; y < PIC_H; y++) {
    const depth = (y - HORIZON) / (PIC_H - HORIZON); // 0 far .. 1 near
    let d = '';
    const cols = {};
    let x = -PAD + 2 * Math.floor(rand() * 6);
    while (x < W + PAD) {
      const len = 2 * (1 + Math.floor(rand() * (1 + depth * 3)));
      let c = depth < 0.4 || rand() < 0.55 ? C.lblue : C.cyan;
      const sunCol = Math.abs(x - 52) < 8 + depth * 10;
      if (sunCol && rand() < 0.75) c = C.white;
      (cols[c] ||= []).push(`M${x} ${y}h${len}v1h${-len}`);
      const gap = sunCol ? 2 + Math.floor(rand() * 3) : 6 + Math.floor(rand() * (14 - depth * 6));
      x += len + 2 * gap;
    }
    for (const [c, segs] of Object.entries(cols)) d += `<path fill="${c}" d="${segs.join('')}"/>`;
    const amp = 1 + Math.round(depth * 4);
    seaRows.push({ y, amp, svg: d });
  }
}

// ------------------------------------------------------------------- CSS
const css = [];
// the scroller lap
css.push(`.sc{animation:sc ${n(T)}s linear ${D(0)} infinite}@keyframes sc{from{transform:translateX(${X0}px)}to{transform:translateX(${X0 - LINE}px)}}`);
// every glyph's bob, a stepped sine (y down is positive; see the derivation
// at phaseClass: glyph phase = -(screen x)/LAMBDA, so the shape is a sine in x)
css.push(steppedKeyframes('bob', (s) => Math.round(-AMP * Math.sin(2 * Math.PI * s)) || 0, (v) => `translateY(${v}px)`));
css.push(`.b{animation:bob ${n(P)}s step-end infinite}`);
for (let k = 0; k < NPH; k++) css.push(`.p${k}{animation-delay:${D(-(k / NPH) * P)}}`);
// FLD hop, once per bar: up three rows and down, with a little second bounce
const hop = (s) => {
  const t = s * 3; // seconds into the bar
  if (t < 0.36) return -Math.round(3 * Math.sin((Math.PI * t) / 0.36));
  if (t < 0.56) return -Math.round(1 * Math.sin((Math.PI * (t - 0.36)) / 0.2));
  return 0;
};
css.push(steppedKeyframes('hop', (s) => hop(s) || 0, (v) => `translateY(${v}px)`, 600));
css.push(`.hop1{animation:hop 3s step-end ${D(0)} infinite}.hop2{animation:hop 3s step-end ${D(-2.25)} infinite}`);
// colour cycling: the stripe tile slides one multicolour pixel per step
css.push(`.flowR{animation:flowR 1.5s steps(${PAT_W / 2}) ${D(0)} infinite}@keyframes flowR{from{transform:translateX(0)}to{transform:translateX(${PAT_W}px)}}`);
css.push(`.flowL{animation:flowL 1.5s steps(${PAT_W / 2}) ${D(0)} infinite}@keyframes flowL{from{transform:translateX(0)}to{transform:translateX(-${PAT_W}px)}}`);
// tech-tech: one stepped sine per amplitude, delayed scanline by scanline
const amps = [...new Set(seaRows.map((r) => r.amp))];
for (const a of amps) css.push(steppedKeyframes(`tt${a}`, (s) => Math.round(a * Math.sin(2 * Math.PI * s)) || 0, (v) => `translateX(${v}px)`, 600));
for (const a of amps) css.push(`.tt${a}{animation:tt${a} 6s step-end infinite}`);
// her head nods on every beat; the raft rocks once a bar
css.push(`.nod{animation:nod .75s step-end ${D(0)} infinite}@keyframes nod{0%{transform:translateY(1px)}35%{transform:translateY(0)}100%{transform:translateY(1px)}}`);
css.push(`.raft{animation:raft 3s step-end ${D(0)} infinite}@keyframes raft{0%{transform:translateY(0)}50%{transform:translateY(1px)}100%{transform:translateY(0)}}`);
css.push('@media (prefers-reduced-motion:reduce){*{animation-play-state:paused!important}}');

// -------------------------------------------------------------- assemble
const seaSvg = seaRows.map((r, i) => `<g class="tt${r.amp}" style="animation-delay:${D(-((i * 0.23) % 6))}">${r.svg}</g>`).join('');
const picture = `<g transform="translate(0 ${PIC_Y})" clip-path="url(#picClip)">${back.paths()}${seaSvg}${front.paths()}`
  + `<g class="nod">${head.paths()}</g><g class="raft">${raft.paths()}</g></g>`;

const title = 'CASTAWAY: a Commodore 64 style DYCP demo part';
const desc = 'CASTAWAY as a C64 demo part: a credit line, the logo CAST over AWAY in fat striped multicolour capitals on mauve raster panels, the gold line SHE STAYS. EVERYTHING ELSE DRIFTS BY., a sine-wave scroller with a bottle, a cat on a crate, a turtle, a shark in headphones and a walking coconut riding the wave, and a small sunny island picture where she stands by the palm, nodding to the beat.';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W * 2}" height="${H * 2}" shape-rendering="crispEdges">
<title>${title}</title>
<desc>${desc}</desc>
<style>${css.join('')}</style>
<defs>${glyphDefs.join('')}${sprDefs.join('')}${logoDefs.join('')}${washDef}
<clipPath id="frame"><rect width="${W}" height="${H}" rx="5"/></clipPath>
<clipPath id="picClip"><rect width="${W}" height="${PIC_H}"/></clipPath>
<mask id="dycp" maskUnits="userSpaceOnUse" x="0" y="${ZONE_Y}" width="${W}" height="${ZONE_H}"><g fill="#fff"><g class="sc">${letterUses.join('')}</g></g></mask>
</defs>
<g clip-path="url(#frame)">
<rect width="${W}" height="${H}" fill="${C.black}"/>
${stat.paths()}
${logoBody.join('\n')}
<rect x="0" y="${ZONE_Y}" width="${W}" height="${ZONE_H}" fill="url(#wash)" mask="url(#dycp)"/>
<g class="sc">${spriteUses.join('')}</g>
${picture}
</g>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="5" fill="none" stroke="#3a3a46" stroke-width="1" shape-rendering="geometricPrecision"/>
</svg>
`;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, svg);
console.log(`wrote ${path.relative(process.cwd(), OUT)}: ${svg.length} bytes, ${W}x${H}`);
console.log(`scroller: ${items.length} glyphs/sprites (+${all.length - items.length} wrap copies), line ${LINE} px, lap ${n(T)} s, bob ${n(P)} s, crest drift ${n(-KW * LAMBDA / T)} px/s`);
console.log(`sprites mid-screen at: ${items.filter((it) => it.sprite).map((it) => `${it.sprite} ${n((X0 + it.o + it.w / 2 - W / 2) / SPEED)}s`).join(', ')}`);
