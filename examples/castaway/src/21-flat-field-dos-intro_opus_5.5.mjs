#!/usr/bin/env node
// Flat-field DOS intro: README header generator for CASTAWAY.
//
//   node examples/castaway/src/21-flat-field-dos-intro_opus_5.5.mjs
//
// Writes examples/castaway/assets/21-flat-field-dos-intro_opus_5.5.svg.
// Plain Node, no dependencies, no clock, no Math.random: the same bytes on
// every run. (The .md beside the assets is hand-written, not generated.)
//
// The style (catalogue entry pc-01) is the mid-90s numbered DOS intro made in
// Mode-X at 320 pixels wide, the kind Razor 1911 ran in front of its releases
// (credited here as a style reference only; nothing of theirs is copied):
// ONE flat saturated field, a hand-pixelled bevelled logo pinned to the top
// edge, a small wooden plaque under it carrying the release title, a centred
// column of wide letterspaced capitals (group between two hearts, a dashed
// rule, "proudly presents on <date>", the title between stars), exactly ONE
// background effect (here: big pale cogs meshing behind the text), and a text
// writer that types each page, holds it, palette-fades it and moves on.
//
// What changes for Castaway:
//   * the field is lagoon turquoise and the logo is sand: tan-to-gold italic
//     capitals with pointed serifs and spurs, bevel-lit from the top left;
//   * the plaque is a driftwood plank lashed with rope, like the raft, and the
//     release title carved into it is the project's honest one: WORKING TITLE;
//   * the date in the presents-line is the project's own rule: everything
//     starts ON THE NEXT BAR (3 s at 80 BPM), and so does every page here;
//   * the four cogs click a quarter tooth on every beat and one whole tooth
//     per bar, like the schedule's clockwork; they never get anywhere, which is
//     the point.
// The group, ZERO KNOTS (wind speed: none), is invented.
//
// Timing (all of it on the music's grid: beat 0.75 s, bar 3 s):
//   pages    7 pages, 22 bars = 66 s loop; each page starts on a bar line,
//            types one line per half beat, holds, fades in 4 palette steps
//   cogs     4 frames per tooth, one frame per beat: a 3 s cycle that repeats
//            seamlessly because every cog looks the same one tooth on
//   first frame and reduced-motion frame: page 1 fully typed (the presents
//   page with CASTAWAY on it), cogs at rest.
//
// How it is drawn (no <text>, no filters): every lit pixel is merged into runs
// of rects and written as one <path> per colour; text glyphs are <use>s of one
// symbol per character (dark outline + a fill the <use> sets); each typed line
// is clipped by a rect that steps right one character cell at a time.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '21-flat-field-dos-intro_opus_5.5';
const OUT = path.resolve(here, `../assets/${SLUG}.svg`);

// ------------------------------------------------------------------ facts
// Verified 2026-10-01 against D:/python/castaway (read-only): 93, then 94
// activities in activities.toml, and growing (so "OVER 90"); tiers every 2-5 min, 12-25 min, 30-60 min,
// 3-6 h; run 10:00:00 at seed 1992; starts snap to 3 s bars, so a ten-hour
// run is 12,000 bars. Theme: 60 s seamless loop, 80 BPM, F major. Everything
// synthesized by tools/make_audio.py; nobody has listened to it yet.

// ------------------------------------------------------------------ canvas
const W = 320; // lowres pixels, Mode-X width; the SVG scales them up
const H = 168;
const BAR = 3;
const BEAT = BAR / 4;

const COL = {
  field: '#117a8e',
  drop: '#0a5361', // logo drop shadow
  cog: '#2492a4',
  cog2: '#1f8b9f', // every other cog, so meshing neighbours stay apart
  cogHub: '#2c9cad',
  cogGroove: '#188396',
  cogHole: '#0c6070',
  ink: '#04232c', // text outline
  white: '#ffffff',
  sand: '#ffd77f',
  coral: '#ff7d68',
  aqua: '#93dde5',
};

// ----------------------------------------------------------------- helpers
const n = (v) => (Number.isInteger(v) ? String(v) : String(+v.toFixed(3)));
const pct = (t, loop) => `${+((t / loop) * 100).toFixed(3)}%`;

function mulberry32(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(1992);

class Grid {
  constructor(w, h) { this.w = w; this.h = h; this.a = new Uint8Array(w * h); }
  get(x, y) { return x >= 0 && y >= 0 && x < this.w && y < this.h ? this.a[y * this.w + x] : 0; }
  set(x, y, v = 1) { if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.a[y * this.w + x] = v; }
}
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
const gridPath = (g, pred = (v) => v) => cellsToPath((x, y) => pred(g.get(x, y)), g.w, g.h);
function dilate8(g) {
  const o = new Grid(g.w, g.h);
  for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) {
    if (g.get(x, y)) { o.set(x, y); continue; }
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (g.get(x + dx, y + dy)) o.set(x, y);
  }
  return o;
}
function inPoly(px, py, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
function lerpHex(a, b, t) {
  const pa = hex(a); const pb = hex(b);
  return `#${pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, '0')).join('')}`;
}
// keys [[row, '#hex'], ...] -> one colour per row, quantised to VGA's 6 bits a channel
function ramp(keys, count) {
  const q6 = (h) => `#${hex(h).map((v) => Math.min(255, Math.round(Math.round(v / 4.047) * 4.047)).toString(16).padStart(2, '0')).join('')}`;
  const out = [];
  for (let r = 0; r < count; r++) {
    let k = 0;
    while (k < keys.length - 2 && r > keys[k + 1][0]) k++;
    const [r0, c0] = keys[k];
    const [r1, c1] = keys[k + 1];
    out.push(q6(r <= r0 ? c0 : r >= r1 ? c1 : lerpHex(c0, c1, (r - r0) / (r1 - r0))));
  }
  return out;
}
function rowGradient(id, y0, colors) {
  const h = colors.length;
  let stops = '';
  for (let i = 0; i < h;) {
    let j = i;
    while (j < h && colors[j] === colors[i]) j++;
    stops += `<stop offset="${n(i / h)}" stop-color="${colors[i]}"/><stop offset="${n(j / h)}" stop-color="${colors[i]}"/>`;
    i = j;
  }
  return `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="${y0}" x2="0" y2="${y0 + h}">${stops}</linearGradient>`;
}

// ======================================================= 8x8 intro font
// Square, wide capitals: 7x7 on an 8x8 cell, 2 px verticals, 1 px
// horizontals, set on a 10 px pitch so every letter stands one gap apart.
// Specials: '♥' heart, '*' star, '>' bullet, '=' a dash of the dashed rule.
const FONT = {
  A: ['.#####.', '##...##', '##...##', '#######', '##...##', '##...##', '##...##'],
  B: ['######.', '##...##', '##...##', '######.', '##...##', '##...##', '######.'],
  C: ['.#####.', '##...##', '##.....', '##.....', '##.....', '##...##', '.#####.'],
  D: ['#####..', '##..##.', '##...##', '##...##', '##...##', '##..##.', '#####..'],
  E: ['#######', '##.....', '##.....', '#####..', '##.....', '##.....', '#######'],
  F: ['#######', '##.....', '##.....', '#####..', '##.....', '##.....', '##.....'],
  G: ['.#####.', '##...##', '##.....', '##..###', '##...##', '##...##', '.######'],
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
  S: ['.#####.', '##...##', '##.....', '.#####.', '.....##', '##...##', '.#####.'],
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
  3: ['.#####.', '##...##', '.....##', '...###.', '.....##', '##...##', '.#####.'],
  4: ['....##.', '...###.', '..####.', '.##.##.', '##..##.', '#######', '....##.'],
  5: ['#######', '##.....', '######.', '.....##', '.....##', '##...##', '.#####.'],
  6: ['.#####.', '##.....', '##.....', '######.', '##...##', '##...##', '.#####.'],
  7: ['#######', '.....##', '....##.', '...##..', '..##...', '..##...', '..##...'],
  8: ['.#####.', '##...##', '##...##', '.#####.', '##...##', '##...##', '.#####.'],
  9: ['.#####.', '##...##', '##...##', '.######', '.....##', '.....##', '.#####.'],
  '.': ['..', '..', '..', '..', '..', '##', '##'],
  ',': ['...', '...', '...', '...', '...', '.##', '.##', '##.'],
  ':': ['..', '##', '##', '..', '##', '##', '..'],
  '-': ['.....', '.....', '.....', '#####', '.....', '.....', '.....'],
  '!': ['##', '##', '##', '##', '##', '..', '##'],
  '?': ['.#####.', '##...##', '.....##', '...###.', '..##...', '.......', '..##...'],
  "'": ['.##', '.##', '##.', '...', '...', '...', '...'],
  '/': ['.....##', '.....##', '....##.', '...##..', '..##...', '.##....', '##.....'],
  '(': ['..##', '.##.', '##..', '##..', '##..', '.##.', '..##'],
  ')': ['##..', '.##.', '..##', '..##', '..##', '.##.', '##..'],
  '*': ['...#...', '...#...', '#######', '.#####.', '..###..', '.##.##.', '.#...#.'],
  '♥': ['.##.##.', '#######', '#######', '#######', '.#####.', '..###..', '...#...'],
  '>': ['#.....', '###...', '#####.', '######', '#####.', '###...', '#.....'],
  '=': ['......', '......', '......', '######', '######', '......', '......'],
};
const ADV = 10; // pitch of the intro font
const CELL = 7;

// ======================================================== 5 px tiny font
const TINY = {
  A: ['.#.', '#.#', '###', '#.#', '#.#'], B: ['##.', '#.#', '##.', '#.#', '##.'],
  C: ['.##', '#..', '#..', '#..', '.##'], D: ['##.', '#.#', '#.#', '#.#', '##.'],
  E: ['###', '#..', '##.', '#..', '###'], F: ['###', '#..', '##.', '#..', '#..'],
  G: ['.##', '#..', '#.#', '#.#', '.##'], H: ['#.#', '#.#', '###', '#.#', '#.#'],
  I: ['###', '.#.', '.#.', '.#.', '###'], K: ['#.#', '##.', '#..', '##.', '#.#'],
  L: ['#..', '#..', '#..', '#..', '###'], M: ['#...#', '##.##', '#.#.#', '#...#', '#...#'],
  N: ['#..#', '##.#', '#.##', '#..#', '#..#'], O: ['.#.', '#.#', '#.#', '#.#', '.#.'],
  P: ['##.', '#.#', '##.', '#..', '#..'], R: ['##.', '#.#', '##.', '#.#', '#.#'],
  S: ['.##', '#..', '.#.', '..#', '##.'], T: ['###', '.#.', '.#.', '.#.', '.#.'],
  U: ['#.#', '#.#', '#.#', '#.#', '###'], V: ['#.#', '#.#', '#.#', '#.#', '.#.'],
  W: ['#...#', '#...#', '#.#.#', '##.##', '#...#'], Y: ['#.#', '#.#', '.#.', '.#.', '.#.'],
  '.': ['.', '.', '.', '.', '#'],
};
function tinyWidth(s, track = 2) {
  let w = 0;
  for (const ch of s) w += ch === ' ' ? 4 : TINY[ch][0].length + track;
  return w - track;
}
function drawTiny(set, s, x, y, track = 2) {
  for (const ch of s) {
    if (ch === ' ') { x += 4; continue; }
    const g = TINY[ch];
    if (!g) throw new Error(`tiny font lacks ${JSON.stringify(ch)}`);
    g.forEach((row, r) => [...row].forEach((c, k) => { if (c === '#') set(x + k, y + r); }));
    x += g[0].length + track;
  }
}

// ================================================================ build
const defs = [];
const css = [];
const body = [];
body.push(`<rect width="${W}" height="${H}" fill="${COL.field}"/>`);

// =============================================================== the cogs
// One pitch for all (so they mesh), alternating directions, a quarter tooth
// per beat. Only the toothed rim is drawn per frame; the disc, groove, hub and
// axle are round, so they are drawn once and never need to move.
const PITCH = 12; // px per tooth on the pitch circle
const ADDEN = 3; // tooth tip above the pitch circle
const DEDEN = 3.5; // root below it (half a pixel of backlash)
const STEPS = 4; // frames per tooth = beats per bar
const GEARS = [
  { N: 30, x: 40, y: 131 }, // the big slow one, bottom left
  { N: 12, at: -20 },
  { N: 22, at: 25 },
  { N: 26, at: -10 }, // off the right edge
];
{
  const TAU = Math.PI * 2;
  GEARS.forEach((g, i) => {
    g.r = (g.N * PITCH) / TAU;
    g.alpha = TAU / g.N;
    g.dir = i % 2 ? -1 : 1;
    if (i === 0) { g.theta = 0; return; }
    const p = GEARS[i - 1];
    const phi = (g.at * Math.PI) / 180;
    g.x = p.x + (p.r + g.r) * Math.cos(phi);
    g.y = p.y + (p.r + g.r) * Math.sin(phi);
    // tooth of the previous cog against a gap of this one at the contact point
    const uPrev = ((((phi - p.theta) / p.alpha) % 1) + 1) % 1;
    const u = (((0.5 - uPrev) % 1) + 1) % 1;
    g.theta = phi + Math.PI - u * g.alpha;
  });
  const prof = (g, theta, px, py) => {
    const dx = px - g.x; const dy = py - g.y;
    const rho = Math.hypot(dx, dy);
    if (rho > g.r + ADDEN) return false;
    const u = ((((Math.atan2(dy, dx) - theta) / g.alpha) % 1) + 1) % 1;
    const v = Math.min(u, 1 - u);
    const R = v < 0.17 ? g.r + ADDEN : v < 0.31 ? g.r + ADDEN - ((v - 0.17) / 0.14) * (ADDEN + DEDEN) : g.r - DEDEN;
    return rho <= R;
  };
  // static parts, painted as stacked pixel discs (one run per row each):
  // body, groove, body again inside the groove, hub, axle hole. Cog bodies
  // never overlap (only teeth reach the neighbour), so each layer can be one
  // path per colour.
  const disc = (g, rad) => {
    let d = '';
    for (let y = Math.floor(g.y - rad); y <= g.y + rad; y++) {
      if (y < 0 || y >= H) continue;
      let x0 = null; let x1 = null;
      for (let x = Math.floor(g.x - rad); x <= g.x + rad; x++) {
        if (Math.hypot(x + 0.5 - g.x, y + 0.5 - g.y) < rad) { if (x0 === null) x0 = x; x1 = x + 1; }
      }
      if (x0 === null) continue;
      const a = Math.max(0, x0); const b = Math.min(W, x1);
      if (b > a) d += `M${a} ${y}h${b - a}v1h${a - b}`;
    }
    return d;
  };
  const LAYERS = [
    (g, gi) => [g.r - DEDEN + 0.5, gi % 2 ? COL.cog2 : COL.cog],
    (g) => [(g.r - DEDEN) * 0.74 + 0.75, COL.cogGroove],
    (g, gi) => [(g.r - DEDEN) * 0.74 - 0.75, gi % 2 ? COL.cog2 : COL.cog],
    (g) => [Math.max(5, g.r * 0.3), COL.cogHub],
    (g) => [Math.max(2.2, g.r * 0.1), COL.cogHole],
  ];
  for (const layer of LAYERS) {
    const byTone = new Map();
    GEARS.forEach((g, gi) => {
      const [rad, tone] = layer(g, gi);
      byTone.set(tone, (byTone.get(tone) || '') + disc(g, rad));
    });
    for (const [tone, d] of byTone) body.push(`<path fill="${tone}" d="${d}"/>`);
  }
  // rim frames (the shorthand rule first, so the per-frame delays win)
  css.push(`.gf{opacity:0;animation:gf ${BAR}s step-end infinite}.gf0{opacity:1}@keyframes gf{0%{opacity:1}${n(100 / STEPS)}%,100%{opacity:0}}`);
  for (let k = 0; k < STEPS; k++) {
    const rim = new Grid(W, H);
    for (const [gi, g] of GEARS.entries()) {
      const theta = g.theta + g.dir * (k / STEPS) * g.alpha;
      const R1 = g.r + ADDEN + 1;
      for (let y = Math.floor(g.y - R1); y <= g.y + R1; y++) {
        for (let x = Math.floor(g.x - R1); x <= g.x + R1; x++) {
          const rho = Math.hypot(x + 0.5 - g.x, y + 0.5 - g.y);
          if (rho < g.r - DEDEN - 0.5) continue;
          if (prof(g, theta, x + 0.5, y + 0.5)) rim.set(x, y, 1 + (gi % 2));
        }
      }
    }
    body.push(`<g class="gf gf${k}"><path fill="${COL.cog}" d="${gridPath(rim, (v) => v === 1)}"/><path fill="${COL.cog2}" d="${gridPath(rim, (v) => v === 2)}"/></g>`);
    if (k) css.push(`.gf${k}{animation-delay:-${n(BAR - k * BEAT)}s}`);
  }
}

// =============================================================== the logo
// Sand italic capitals with pointed serifs and spurs, drawn as polygons on a
// 34 px cap height, sheared, rasterised without anti-aliasing, then given a
// one-pixel ink outline, a top-left bevel and a hard drop shadow.
const LOGO_Y = 5;
const LH = 34;
const SH = 0.25; // italic shear
const topS = (x0, x1) => [[x0 - 4, 0], [x1 + 4, 0], [x1, 5], [x0, 5]];
const footS = (x0, x1) => [[x0 - 4, LH], [x1 + 4, LH], [x1, LH - 5], [x0, LH - 5]];
const LETTERS = {
  C: { w: 30, add: [[[9, 0], [30, 0], [30, 12], [24, 7], [12, 7], [8, 11], [8, 23], [12, 27], [24, 27], [30, 22], [30, 34], [9, 34], [0, 25], [0, 9]]] },
  A: {
    w: 30,
    add: [[[9, 0], [21, 0], [30, 9], [30, 34], [22, 34], [22, 22], [8, 22], [8, 34], [0, 34], [0, 9]], footS(0, 8), footS(22, 30)],
    sub: [[[12, 7], [18, 7], [22, 11], [22, 15], [8, 15], [8, 11]]],
  },
  S: { w: 30, add: [[[9, 0], [30, 0], [30, 11], [25, 7], [8, 7], [8, 14], [21, 14], [30, 23], [30, 25], [21, 34], [0, 34], [0, 23], [5, 27], [22, 27], [22, 21], [9, 21], [0, 12], [0, 9]]] },
  T: { w: 30, add: [[[0, 0], [30, 0], [30, 12], [25, 7], [19, 7], [19, 34], [11, 34], [11, 7], [5, 7], [0, 12]], footS(11, 19)] },
  W: { w: 40, add: [[[0, 0], [8, 0], [8, 26], [16, 26], [16, 14], [20, 9], [24, 14], [24, 26], [32, 26], [32, 0], [40, 0], [40, 25], [31, 34], [9, 34], [0, 25]], topS(0, 8), topS(32, 40)] },
  Y: { w: 32, add: [[[0, 0], [8, 0], [8, 12], [11, 15], [21, 15], [24, 12], [24, 0], [32, 0], [32, 16], [25, 23], [20, 23], [20, 34], [12, 34], [12, 23], [7, 23], [0, 16]], topS(0, 8), topS(24, 32), footS(12, 20)] },
};
const LOGO_TEXT = 'CASTAWAY';
const LGAP = 5;
const logoAdv = [...LOGO_TEXT].map((c) => LETTERS[c].w);
const logoW = logoAdv.reduce((a, b) => a + b, 0) + LGAP * (LOGO_TEXT.length - 1) + Math.ceil(SH * LH);
const LOGO_X = Math.round((W - logoW) / 2);
const LOGO_BOTTOM = LOGO_Y + LH;
const GLINT_SLANT = Math.round(LH * 0.6);
{
  const face = new Grid(W, LOGO_BOTTOM + 8);
  let ox = LOGO_X;
  for (const c of LOGO_TEXT) {
    const l = LETTERS[c];
    for (let y = 0; y < LH; y++) {
      for (let x = -8; x < l.w + 8 + SH * LH; x++) {
        const sx = x + 0.5 - SH * (LH - (y + 0.5));
        const sy = y + 0.5;
        if (l.add.some((p) => inPoly(sx, sy, p)) && !(l.sub || []).some((p) => inPoly(sx, sy, p))) face.set(ox + x, LOGO_Y + y);
      }
    }
    ox += l.w + LGAP;
  }
  const solid = dilate8(face);
  const drop = new Grid(face.w, face.h);
  for (let y = 0; y < face.h; y++) for (let x = 0; x < face.w; x++) {
    if (!solid.get(x, y) && (solid.get(x - 3, y - 3) || solid.get(x - 2, y - 2) || solid.get(x - 1, y - 1))) drop.set(x, y);
  }
  body.push(`<path fill="${COL.drop}" d="${gridPath(drop)}"/>`);
  body.push(`<path fill="#2b1306" d="${gridPath(solid)}"/>`);
  const SAND = ramp([
    [0, '#fff3c8'], [5, '#ffe08e'], [12, '#f7c160'], [18, '#eaa245'], [19, '#c9792e'], [22, '#dc9440'], [29, '#e7ad55'], [33, '#c27a33'],
  ], LH);
  defs.push(rowGradient('sand', LOGO_Y, SAND));
  const faceD = gridPath(face);
  defs.push(`<clipPath id="lc"><path d="${faceD}"/></clipPath>`);
  body.push(`<path fill="url(#sand)" d="${faceD}"/>`);
  const hi = new Grid(face.w, face.h);
  const lo = new Grid(face.w, face.h);
  const lo2 = new Grid(face.w, face.h);
  for (let y = 0; y < face.h; y++) for (let x = 0; x < face.w; x++) {
    if (!face.get(x, y)) continue;
    const up = face.get(x, y - 1); const lf = face.get(x - 1, y);
    const dn = face.get(x, y + 1); const rt = face.get(x + 1, y);
    if (!dn || !rt) lo.set(x, y);
    else if (!up || !lf) hi.set(x, y);
    else if (!face.get(x, y + 2) || !face.get(x + 2, y)) lo2.set(x, y);
  }
  body.push(`<path fill="#fffbe8" d="${gridPath(hi)}"/>`);
  body.push(`<path fill="#8a4518" d="${gridPath(lo)}"/>`);
  body.push(`<path fill="#b8682a" d="${gridPath(lo2)}"/>`);
  // the glint, swept across by the page writer (see "page turns" below)
  body.push(`<g clip-path="url(#lc)"><path class="gl" fill="#fff" opacity=".8" transform="translate(-60 0)" d="M${GLINT_SLANT} ${LOGO_Y}h5l${-GLINT_SLANT} ${LH}h-5zM${GLINT_SLANT + 8} ${LOGO_Y}h2l${-GLINT_SLANT} ${LH}h-2z"/></g>`);
}
const GLINT_FROM = LOGO_X - GLINT_SLANT - 12;
const GLINT_TO = LOGO_X + logoW + 4;

// ============================================================= the plaque
// A driftwood plank lashed at both ends, like the raft, with the release
// title carved in: the honest one.
const PLAQUE_TEXT = 'WORKING TITLE';
const PL_ADV = 9;
const PL_Y = LOGO_BOTTOM + 6;
const PL_H = 15;
{
  const tw = (PLAQUE_TEXT.length - 1) * PL_ADV + CELL;
  const PW = tw + 34;
  const px = Math.round((W - PW) / 2);
  const cells = new Map(); // "x,y" -> colour key
  const put = (x, y, k) => cells.set(`${x},${y}`, k);
  const WOOD = { o: '#2b1306', h: '#dca46a', b: '#b77744', g: '#965a2e', d: '#70401d', k: '#4a210b', r: '#efdcaa', R: '#bf9c62' };
  // plank silhouette: chipped, slightly uneven ends
  const inPlank = (x, y) => {
    if (x < 0 || x >= PW || y < 0 || y >= PL_H) return false;
    if ((x === 0 || x === PW - 1) && (y === 0 || y === PL_H - 1)) return false;
    if (x === 0 && y >= 9 && y <= 11) return false; // a chip off the left end
    if (x >= PW - 2 && y <= 2 && x + y >= PW) return false; // and the right
    return true;
  };
  for (let y = -2; y < PL_H + 2; y++) for (let x = -2; x < PW + 2; x++) {
    if (inPlank(x, y)) {
      let k = y === 0 ? 'h' : y === PL_H - 1 ? 'd' : 'b';
      if (y === PL_H - 2) k = 'g';
      put(px + x, PL_Y + y, k);
    }
  }
  // grain: long streaks above and below the title, short ones beside it
  const tx = px + Math.round((PW - tw) / 2);
  const ty = PL_Y + 4;
  for (const gy of [2, 6, 9, 12]) {
    let x = 2 + Math.floor(rand() * 8);
    while (x < PW - 3) {
      const len = 8 + Math.floor(rand() * 30);
      const yy = gy + (gy === 12 || rand() < 0.7 ? 0 : 1);
      for (let i = 0; i < len && x + i < PW - 2; i++) {
        const ax = px + x + i;
        if (yy > 3 && yy < 13 && ax > tx - 3 && ax < tx + tw + 2) continue;
        put(ax, PL_Y + yy, 'g');
      }
      x += len + 4 + Math.floor(rand() * 10);
    }
  }
  // a knot, outboard of the left lashing
  const kx = px + 2; const ky = PL_Y + 5;
  [[0, 0], [1, 0], [-1, 1], [2, 1], [0, 2], [1, 2]].forEach(([dx, dy]) => put(kx + dx, ky + dy, 'd'));
  put(kx, ky + 1, 'g'); put(kx + 1, ky + 1, 'h');
  // carved title: dark letters, a lit lower edge
  [...PLAQUE_TEXT].forEach((ch, i) => {
    if (ch === ' ') return;
    const g = FONT[ch];
    const off = Math.floor((CELL - g[0].length) / 2);
    g.forEach((row, r) => [...row].forEach((c, k) => {
      if (c !== '#') return;
      const x = tx + i * PL_ADV + off + k; const y = ty + r;
      put(x, y, 'k');
      const below = g[r + 1] ? g[r + 1][k] : '.';
      if (below !== '#') put(x, y + 1, cells.get(`${x},${y + 1}`) === 'k' ? 'k' : 'h');
    }));
  });
  // rope lashings near each end, wrapping one pixel over the edges
  for (const lx of [px + 6, px + PW - 11]) {
    for (let y = -1; y <= PL_H; y++) for (let x = 0; x < 5; x++) {
      put(lx + x, PL_Y + y, (x + y) % 3 === 0 ? 'R' : 'r');
    }
  }
  // outline everything
  const lit = (x, y) => cells.has(`${x},${y}`) && cells.get(`${x},${y}`) !== 'o';
  for (let y = PL_Y - 3; y <= PL_Y + PL_H + 2; y++) for (let x = px - 3; x <= px + PW + 2; x++) {
    if (lit(x, y)) continue;
    let near = false;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (lit(x + dx, y + dy)) near = true;
    if (near) put(x, y, 'o');
  }
  // drop shadow on the field, like the logo's
  const shadow = new Grid(W, H);
  for (const key of cells.keys()) {
    const [x, y] = key.split(',').map(Number);
    for (const d of [1, 2]) if (!cells.has(`${x + d},${y + d}`)) shadow.set(x + d, y + d);
  }
  body.push(`<path fill="${COL.drop}" d="${gridPath(shadow)}"/>`);
  for (const k of Object.keys(WOOD)) {
    const g = new Grid(W, H);
    for (const [key, v] of cells) if (v === k) { const [x, y] = key.split(',').map(Number); g.set(x, y); }
    body.push(`<path fill="${WOOD[k]}" d="${gridPath(g)}"/>`);
  }
}

// ============================================================== the pages
// Lines are typed one per half beat at 80 characters a second; each page
// starts on a bar line, holds, then fades out in four palette steps.
// Markup: a line is a string (white), {s, c} (whole line in a colour) or
// {rule: n} (a dashed rule of n dashes). Hearts, bullets and stars take their
// own colours wherever they appear.
const info = (k, v, width = 28) => `${k} ${'.'.repeat(width - k.length - v.length - 2)} ${v}`;
const PAGES = [
  {
    bars: 4,
    lines: [
      '♥ ZERO KNOTS ♥',
      { rule: 15 },
      'PROUDLY PRESENTS',
      'ON THE NEXT BAR',
      { s: '* CASTAWAY *', c: COL.sand },
      'A TEN-HOUR LO-FI ISLAND VIDEO',
    ],
  },
  {
    bars: 3,
    lines: [
      { s: '* THE STORY SO FAR *', c: COL.sand },
      'ONE SMALL ISLAND. ONE PALM.',
      'ONE RAFT. ONE YOUNG WOMAN,',
      'NODDING TO HER HEADPHONES.',
      'EVERY SO OFTEN,',
      'SOMETHING HAPPENS.',
    ],
  },
  {
    bars: 3,
    block: true,
    lines: [
      { s: '* FEATURES *', c: COL.sand, centre: true },
      '> A BOTTLE THAT WASHES BACK',
      '> A SHARK WHO KEEPS THE BEAT',
      '> A CRAB WEARING A COCONUT',
      '> SPARE HEADPHONES, BY DRONE',
      '> SIGNAL: ONE BAR, UP THE PALM',
      '> A SHIP. SHE WAS BUSY.',
    ],
  },
  {
    bars: 3,
    lines: [
      { s: '* RELEASE INFO *', c: COL.sand },
      info('LENGTH', '10:00:00'),
      info('ACTIVITIES', 'OVER 90'),
      info('TIMERS', '2 MIN TO 6 HRS'),
      info('BARS', '12,000'),
      info('GAGS START', 'ON THE BAR'),
      info('NIGHT SCENES', '0'),
    ],
  },
  {
    bars: 3,
    lines: [
      { s: '* SOUND *', c: COL.sand },
      'EVERY SOUND IS SYNTHESIZED',
      'FROM CODE. NO SAMPLES, NO',
      'STOCK LOOPS, NO RECORDINGS.',
      'THEME: 80 BPM IN F MAJOR,',
      'A SEAMLESS 60-SECOND LOOP.',
      'NOBODY HAS HEARD IT YET.',
    ],
  },
  {
    bars: 3,
    lines: [
      { s: '* HOW TO WATCH *', c: COL.sand },
      'PYTHON TOOLS/SERVE.PY',
      'THEN OPEN 127.0.0.1:8765',
      'LIVE PREVIEW, MP4 EXPORT.',
      'BRING A SNACK.',
      'IT IS TEN HOURS LONG.',
    ],
  },
  {
    bars: 3,
    lines: [
      '♥ GREETINGS ♥',
      'TO THE SEA TURTLE,',
      'THE CAT ON THE CRATE,',
      'THE CRAB IN THE COCONUT,',
      'AND EVERYONE STILL',
      'WATCHING AT HOUR NINE.',
    ],
  },
];
const SPECIAL = { '♥': COL.coral, '>': COL.coral, '*': COL.sand, '=': COL.coral };
const CPS = 80;
const LINE_GAP = BEAT / 2;
const TEXT_TOP = PL_Y + PL_H + 6;
const TEXT_BOT = H - 14;
const PITCH_TEXT = 12;
const PITCH_RULE = 9;

// glyph symbols: ink outline (8-neighbour dilation) under a fill the <use> sets
const gid = (ch) => (/[A-Z]/.test(ch) ? ch : `u${ch.codePointAt(0).toString(36)}`);
const used = new Set();
PAGES.forEach((p) => p.lines.forEach((l) => {
  const s = typeof l === 'string' ? l : l.rule ? '=' : l.s;
  for (const ch of s) if (ch !== ' ') used.add(ch);
}));
for (const ch of used) {
  const rows = FONT[ch];
  if (!rows) throw new Error(`intro font lacks ${JSON.stringify(ch)}`);
  const gw = Math.max(...rows.map((r) => r.length));
  const off = Math.floor((CELL - gw) / 2);
  const g = new Grid(CELL + 2, 10);
  rows.forEach((row, r) => [...row].forEach((c, k) => { if (c === '#') g.set(off + k + 1, r + 1); }));
  const o = dilate8(g);
  defs.push(`<g id="${gid(ch)}"><path fill="${COL.ink}" d="${cellsToPath((x, y) => o.get(x, y), o.w, o.h, -1, -1)}"/><path d="${cellsToPath((x, y) => g.get(x, y), g.w, g.h, -1, -1)}"/></g>`);
}

// story timeline
let tCursor = 0;
for (const p of PAGES) { p.start = tCursor; p.end = tCursor + p.bars * BAR; tCursor = p.end; }
const LOOP = tCursor;
const typed = [];
PAGES.forEach((p, pi) => {
  const items = p.lines.map((l) => (typeof l === 'string' ? { s: l } : l.rule ? { s: '='.repeat(l.rule), rule: true } : l));
  const blockH = items.reduce((h, it, i) => h + (i ? (it.rule || items[i - 1].rule ? PITCH_RULE : PITCH_TEXT) : 0), 0) + 8;
  let y = TEXT_TOP + Math.round((TEXT_BOT - TEXT_TOP - blockH) / 2);
  const longest = Math.max(...items.filter((it) => !it.centre).map((it) => it.s.length));
  const blockX = Math.round((W - ((longest - 1) * ADV + CELL)) / 2);
  items.forEach((it, li) => {
    if (li) y += it.rule || items[li - 1].rule ? PITCH_RULE : PITCH_TEXT;
    const N = it.s.length;
    const x = p.block && !it.centre ? blockX : Math.round((W - ((N - 1) * ADV + CELL)) / 2);
    const t0 = p.start + li * LINE_GAP;
    const t1 = t0 + N / CPS;
    typed.push({ pi, li, it, x, y, N, t0, t1 });
  });
});
// The visitor's first frame is page 1, fully typed: the display clock starts
// on the first beat after page 1 finishes typing.
const OFF = Math.ceil((Math.max(...typed.filter((l) => l.pi === 0).map((l) => l.t1)) + 0.02) / BEAT) * BEAT;
const disp = (t) => ((((t - OFF) % LOOP) + LOOP) % LOOP);
// Step track -> CSS keyframes in display time. changes: [[storyT, css, timing?]]
function track(name, changes) {
  const pts = changes.map(([t, v, tf]) => ({ d: disp(t), v, tf })).sort((a, b) => a.d - b.d);
  const last = pts[pts.length - 1];
  const frames = [];
  if (pts[0].d > 0) frames.push(`0%{${last.v}}`);
  for (const p of pts) frames.push(`${pct(p.d, LOOP)}{${p.v}${p.tf ? `;animation-timing-function:${p.tf}` : ''}}`);
  frames.push(`100%{${last.v}}`);
  if (last.tf) throw new Error(`${name}: an interpolated segment wraps the loop`);
  css.push(`.${name}{animation:${name} ${n(LOOP)}s step-end infinite}@keyframes ${name}{${frames.join('')}}`);
}
PAGES.forEach((p, pi) => {
  const fade = [[p.end - 0.36, 'opacity:.7'], [p.end - 0.24, 'opacity:.42'], [p.end - 0.12, 'opacity:.18'], [p.end, 'opacity:0']];
  track(`p${pi}`, [[p.start, 'opacity:1'], ...fade]);
  const lines = typed.filter((l) => l.pi === pi);
  const out = [];
  for (const l of lines) {
    const id = `c${pi}_${l.li}`;
    const hide = `transform:translate(-${l.N * ADV}px)`;
    track(id, [[l.t0, hide, `steps(${l.N},end)`], [l.t1, 'transform:translate(0)'], [p.end, hide]]);
    defs.push(`<clipPath id="k${id}"><rect class="${id}" x="${l.x - 1}" y="${l.y - 1}" width="${l.N * ADV}" height="11"/></clipPath>`);
    const fill = l.it.c || COL.white;
    let uses = '';
    [...l.it.s].forEach((ch, i) => {
      if (ch === ' ') return;
      const sp = SPECIAL[ch] && SPECIAL[ch] !== fill ? ` fill="${SPECIAL[ch]}"` : '';
      uses += `<use href="#${gid(ch)}" x="${l.x + i * ADV}"${sp}/>`;
    });
    out.push(`<g clip-path="url(#k${id})" fill="${fill}"><g transform="translate(0 ${l.y})">${uses}</g></g>`);
  }
  body.push(`<g class="p${pi}"${pi ? ' opacity="0"' : ''}>${out.join('')}</g>`);
});

// ============================================================ page turns
// The logo glints once, in pixel steps, in the first beat of every page.
css.push(`.gl{transform:translate(${GLINT_FROM}px)}`);
track('gl', PAGES.flatMap((p) => [
  [p.start, `transform:translate(${GLINT_FROM}px)`, `steps(${Math.round((GLINT_TO - GLINT_FROM) / 3)},end)`],
  [p.start + BEAT, `transform:translate(${GLINT_TO}px)`],
]));

// ============================================================== the crab
// While the greetings page greets him, the crab who got a coconut for a hat
// walks across the screen along the top of the footer, legs on the quarter beat.
const FOOT_Y = H - 9;
{
  const BODY = [
    '.....SSSSSS.....E.E',
    '...SHHHHSSSSS...R.R',
    '..SHHHSSSSSfSS..R.R',
    '.SHHSSSSfSSSSSS.RRR',
    '.SHSSSfSSSSSSDSRRRR',
    'SSSSSSSSSSfSSSSSRrR',
    'SSSfSSSSSSSSSDSSRRR',
    'SSSSSSSSSSSSSSRRRR.',
    '.DSSSSSSSSSSSDDRR..',
    '..DDDDDDDDDDDDRR...',
  ];
  const LEGS = [
    ['..R..R..R..R.......', '.R..R..R..R........'],
    ['..R..R..R..R.......', '...R..R..R..R......'],
  ];
  const CR = { S: '#8a5a2b', H: '#c99a5c', f: '#6b4220', D: '#4f2d14', R: '#ff5a36', r: '#a8301a', E: '#fff3d6' };
  const CW = BODY[0].length;
  const CH = BODY.length + 2;
  const cy = FOOT_Y - 2 - CH;
  const frames = LEGS.map((legs, fi) => {
    const rows = [...BODY, ...legs];
    const g = new Grid(CW + 2, CH + 2);
    rows.forEach((row, y) => [...row].forEach((c, x) => { if (c !== '.') g.set(x + 1, y + 1); }));
    const o = dilate8(g);
    let out = `<path fill="${COL.ink}" d="${cellsToPath((x, y) => o.get(x, y), o.w, o.h, -1, cy - 1)}"/>`;
    for (const k of Object.keys(CR)) out += `<path fill="${CR[k]}" d="${cellsToPath((x, y) => (rows[y] || '')[x] === k, CW, CH, 0, cy)}"/>`;
    return `<g class="cl${fi}">${out}</g>`;
  });
  body.push(`<g class="crab">${frames.join('')}</g>`);
  const P = PAGES[PAGES.length - 1];
  const X0 = -20; const X1 = W + 10;
  const t0 = P.start + BEAT * 2; const t1 = P.end - BEAT * 2;
  css.push('.crab{transform:translate(-40px)}');
  track('crab', [
    [t0, `transform:translate(${X0}px)`, `steps(${(X1 - X0) / 2},end)`],
    [t1, `transform:translate(${X1}px)`],
    [P.end, 'transform:translate(-40px)'],
  ]);
  css.push(`.cl0,.cl1{animation:cl ${n(BEAT / 2)}s step-end infinite}.cl1{animation-delay:-${n(BEAT / 4)}s}@keyframes cl{0%{opacity:1}50%,100%{opacity:0}}`);
}

// ============================================================== the footer
{
  const s = 'PRESS ANY KEY TO KEEP WAITING';
  const g = new Grid(W, H);
  const tw = tinyWidth(s, 3);
  const fx = Math.round((W - tw - 6) / 2);
  const fy = FOOT_Y;
  drawTiny((x, y) => g.set(x, y), s, fx, fy, 3);
  const o = dilate8(g);
  body.push(`<path fill="${COL.ink}" d="${gridPath(o)}"/>`);
  body.push(`<path fill="${COL.aqua}" d="${gridPath(g)}"/>`);
  // a block cursor that blinks on the beat
  body.push(`<path class="cur" fill="${COL.aqua}" d="M${fx + tw + 3} ${fy}h3v5h-3z"/>`);
  css.push(`.cur{animation:cur ${n(BEAT * 2)}s step-end infinite}@keyframes cur{0%{opacity:1}50%{opacity:0}}`);
}

// ================================================================ assemble
css.push('@media (prefers-reduced-motion:reduce){*{animation:none!important}}');
const title = 'CASTAWAY: a ten-hour lo-fi island video, presented as a mid-90s flat-field DOS intro';
const desc = 'A flat turquoise screen with a sand-gold italic CASTAWAY logo pinned to the top and a driftwood plank under it carved WORKING TITLE. Big pale cogs tick behind a centred column of outlined capitals that a text writer types page by page, on the bar: ZERO KNOTS proudly presents on the next bar CASTAWAY, a ten-hour lo-fi island video; the story so far; the features; the release info; the sound; how to watch; and greetings.';
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W * 2.5}" height="${H * 2.5}" shape-rendering="crispEdges" role="img" aria-labelledby="t d">
<title id="t">${title}</title>
<desc id="d">${desc}</desc>
<style>${css.join('')}</style>
<defs><clipPath id="panel"><rect width="${W}" height="${H}" rx="5"/></clipPath>${defs.join('')}</defs>
<g clip-path="url(#panel)">
${body.join('\n')}
</g>
</svg>
`;
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, svg);
console.log(`wrote ${path.relative(process.cwd(), OUT)} (${(svg.length / 1024).toFixed(1)} KB), ${W}x${H}, loop ${LOOP} s, offset ${OFF} s`);
