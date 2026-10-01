#!/usr/bin/env node
// Pulsing Diamonds Light Box: README header generator for Castaway.
//
//   node examples/castaway/src/94-pulsing-diamonds_opus_5.5.mjs
//
// Writes examples/castaway/assets/94-pulsing-diamonds_opus_5.5.svg (the banner)
// and examples/castaway/assets/94-pulsing-diamonds_opus_5.5-ten-hours.svg (the
// "ten hours on the light box" chart in the README's details).
// Plain Node, no dependencies, no clock, no Math.random: one seeded PRNG, so
// every run writes the same bytes.
//
// The style is the first home music visualiser, the 1977 Atari Video Music
// (model C240): a box between the stereo and the TV that turned the left and
// right channels into a two-part diamond on black, repeated across the screen
// in a regular array, in flat saturated TV colours, swelling and shrinking with
// the music and never moving anywhere. Nothing of that box is copied here: no
// name, logo or faceplate artwork. The box in this banner is invented: the
// SANDGLASS Model 80 island light box, cream plastic, five knobs, a shape bank
// and a repeat bank. Its lettering is an original stroke font defined below.
//
// How the banner maps the device to the project:
//   * 12 s loop = 4 bars of the Castaway theme (80 BPM, a bar every 3 s).
//   * Outer diamond = left channel, stepping on every beat (0.75 s, 4 a bar).
//     Inner diamond = right channel, stepping every 0.6 s (5 a bar). Five
//     against four: they drift out of phase and agree again on every bar line,
//     which is where every gag in the video starts.
//   * Shape bank: ISLAND (solid), LAGOON (hole), ATOLL (ring), TIDE (auto).
//     TIDE is held down, so the shapes cycle island, lagoon, atoll, the order
//     Darwin gave for how real atolls form, at one bar each.
//   * Bar 4 is "something happens": the repeat bank drops from 5 x 2 to 1 x 1
//     and the SUN knob turns from ALL (rainbow) to ONE (coral and sun), so the
//     whole screen becomes one enormous island. Then it goes back to idling.
//   * Hue steps every 1.5 s (two a bar), well under the 2-a-second ceiling for
//     big colour changes; nothing on screen changes faster than 1.7 times a
//     second.
//
// No <text>: every letter is generated geometry. Motion is CSS only, all
// step-end keyframes on one 12 s clock, so the loop has no seam.
// prefers-reduced-motion stops everything on the first frame: the 5 x 2 rainbow
// of solid islands, with the whole faceplate readable.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '94-pulsing-diamonds_opus_5.5';
const OUT = path.resolve(HERE, `../assets/${SLUG}.svg`);
const OUT_HOURS = path.resolve(HERE, `../assets/${SLUG}-ten-hours.svg`);

// ------------------------------------------------------------------ basics
const LOOP = 12, BAR = 3, BEAT = 0.75, INNER_STEP = 0.6, HUE_STEP = 1.5;
const f = (n) => {
  const r = Math.round(n * 100) / 100;
  return Object.is(r, -0) ? '0' : String(r);
};
const pc = (t, dur = LOOP) => `${Math.round((t / dur) * 100 * 10000) / 10000}%`;
function mulberry32(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ------------------------------------------------------------------ palette
// The TV: flat, fully saturated primaries and secondaries on black, in hue
// order, so "+3" is always the complement.
const TV = ['#ff3b2f', '#ffd400', '#2ee05f', '#12d3f3', '#3e5cff', '#ff3fd0'];
const CORAL = '#ff5a3c', SUN = '#ffd400';
const C = {
  housing: '#1a1815', housingHi: '#34302a', screen: '#020202',
  cream: '#ede3cd', creamHi: '#fbf5e8', creamLo: '#d3c6a9', creamLine: '#c4b697',
  ink: '#2a241d', ink2: '#7b6e5a',
  coral: '#ff5b45', sun: '#ffc21a', teal: '#10a2a6',
  knob: '#1f1c19', knobRim: '#3a352f', knobCap: '#2d2924', knobHi: '#4d473f',
  cap: '#e2d7bf', capLo: '#bfb295',
};

// ------------------------------------------------------------------ stroke font
// An original single-stroke caps sans on a grid 6 units tall. Each glyph is a
// path in grid units using only M, L, Q and Z, so it can be scaled by mapping
// every coordinate pair. [width, path].
const G = {
  A: [4, 'M0 6L2 0L4 6M0.7 4L3.3 4'],
  B: [4, 'M0 0L2.6 0Q3.8 0 3.8 1.5Q3.8 3 2.4 3L0 3M2.4 3Q4 3 4 4.5Q4 6 2.6 6L0 6L0 0'],
  C: [4, 'M3.9 1.1Q3.4 0 2 0Q0 0 0 2L0 4Q0 6 2 6Q3.4 6 3.9 4.9'],
  D: [4, 'M0 0L1.8 0Q4 0 4 2.2L4 3.8Q4 6 1.8 6L0 6Z'],
  E: [3.6, 'M3.6 0L0 0L0 6L3.6 6M0 3L3 3'],
  F: [3.6, 'M3.6 0L0 0L0 6M0 3L3 3'],
  G: [4, 'M3.9 1.1Q3.4 0 2 0Q0 0 0 2L0 4Q0 6 2 6Q4 6 4 4L4 3.3L2.3 3.3'],
  H: [4, 'M0 0L0 6M4 0L4 6M0 3L4 3'],
  I: [0, 'M0 0L0 6'],
  J: [3.6, 'M3.6 0L3.6 4.2Q3.6 6 1.8 6Q0.3 6 0 4.7'],
  K: [4, 'M0 0L0 6M4 0L0 3.9M1.5 2.9L4 6'],
  L: [3.4, 'M0 0L0 6L3.4 6'],
  M: [5, 'M0 6L0 0L2.5 4.2L5 0L5 6'],
  N: [4, 'M0 6L0 0L4 6L4 0'],
  O: [4.2, 'M2.1 0Q4.2 0 4.2 2.1L4.2 3.9Q4.2 6 2.1 6Q0 6 0 3.9L0 2.1Q0 0 2.1 0Z'],
  P: [4, 'M0 6L0 0L2.4 0Q4 0 4 1.6Q4 3.2 2.4 3.2L0 3.2'],
  Q: [4.2, 'M2.1 0Q4.2 0 4.2 2.1L4.2 3.9Q4.2 6 2.1 6Q0 6 0 3.9L0 2.1Q0 0 2.1 0ZM2.7 4.4L4.3 6.2'],
  R: [4, 'M0 6L0 0L2.4 0Q4 0 4 1.6Q4 3.2 2.4 3.2L0 3.2M2.2 3.2L4 6'],
  S: [4, 'M3.9 1Q3.4 0 2 0Q0.1 0 0.1 1.5Q0.1 2.9 2 3Q3.9 3.1 3.9 4.5Q3.9 6 2 6Q0.5 6 0 4.9'],
  T: [4, 'M0 0L4 0M2 0L2 6'],
  U: [4, 'M0 0L0 4Q0 6 2 6Q4 6 4 4L4 0'],
  V: [4.2, 'M0 0L2.1 6L4.2 0'],
  W: [5.6, 'M0 0L1.4 6L2.8 1.4L4.2 6L5.6 0'],
  X: [4, 'M0 0L4 6M4 0L0 6'],
  Y: [4.2, 'M0 0L2.1 3.2L4.2 0M2.1 3.2L2.1 6'],
  Z: [4, 'M0.2 0L4 0L0 6L4 6'],
  0: [3.8, 'M1.9 0Q3.8 0 3.8 2L3.8 4Q3.8 6 1.9 6Q0 6 0 4L0 2Q0 0 1.9 0Z'],
  1: [1.8, 'M0 1.2L1.8 0L1.8 6'],
  2: [3.8, 'M0.1 1.3Q0.5 0 1.9 0Q3.7 0 3.7 1.7Q3.7 2.9 2.3 3.8L0 6L3.8 6'],
  3: [3.8, 'M0.2 0L3.6 0L1.7 2.5Q3.8 2.5 3.8 4.3Q3.8 6 1.9 6Q0.6 6 0 5'],
  4: [4, 'M3 6L3 0L0 4.2L4 4.2'],
  5: [3.8, 'M3.6 0L0.4 0L0.2 2.7Q0.9 2.3 1.9 2.3Q3.8 2.3 3.8 4.1Q3.8 6 1.9 6Q0.6 6 0 5'],
  6: [3.8, 'M3.3 0.4Q2.7 0 1.9 0Q0 0 0 2.4L0 4Q0 6 1.9 6Q3.8 6 3.8 4.2Q3.8 2.5 1.9 2.5Q0.6 2.5 0 3.4'],
  7: [3.8, 'M0 0L3.8 0L1.4 6'],
  8: [3.8, 'M1.9 3Q0.2 3 0.2 1.5Q0.2 0 1.9 0Q3.6 0 3.6 1.5Q3.6 3 1.9 3Q0 3 0 4.5Q0 6 1.9 6Q3.8 6 3.8 4.5Q3.8 3 1.9 3Z'],
  9: [3.8, 'M0.5 5.6Q1.1 6 1.9 6Q3.8 6 3.8 3.6L3.8 2Q3.8 0 1.9 0Q0 0 0 1.8Q0 3.5 1.9 3.5Q3.2 3.5 3.8 2.6'],
  '.': [0, 'M0 5.9L0 6'],
  ',': [0.5, 'M0.5 5.7L0 7'],
  '·': [0, 'M0 3L0 3.1'],
  '-': [2.4, 'M0 3.2L2.4 3.2'],
  ':': [0, 'M0 1.9L0 2M0 5.9L0 6'],
  '/': [3, 'M0 6.2L3 -0.2'],
  "'": [0, 'M0 0L0 1.6'],
  '?': [3.8, 'M0.1 1.3Q0.5 0 1.9 0Q3.7 0 3.7 1.6Q3.7 2.8 1.9 3.4L1.9 4.2M1.9 5.9L1.9 6'],
  'x': [3, 'M0 2L3 6M3 2L0 6'],
  ' ': [2.2, ''],
};
function glyphPath(ch, x0, y0, u) {
  const g = G[ch];
  if (!g) throw new Error(`stroke font has no ${JSON.stringify(ch)}`);
  let even = true;
  return g[1].replace(/-?\d*\.?\d+/g, (n) => {
    const v = Number(n);
    const out = even ? f(x0 + v * u) : f(y0 + v * u);
    even = !even;
    return out;
  }).replace(/([MLQZ])/g, '$1');
}
function measure(str, cap, track = 1.7) {
  const u = cap / 6;
  let w = 0;
  for (const ch of str) {
    if (!G[ch]) throw new Error(`stroke font has no ${JSON.stringify(ch)}`);
    w += G[ch][0] + track;
  }
  return (w - track) * u;
}
// returns path data for a line of text; y is the top of the caps
function text(str, x, y, cap, { track = 1.7, anchor = 'start' } = {}) {
  const u = cap / 6, w = measure(str, cap, track);
  let cx = anchor === 'middle' ? x - w / 2 : anchor === 'end' ? x - w : x;
  let d = '';
  for (const ch of str) {
    if (G[ch][1]) d += glyphPath(ch, cx, y, u);
    cx += (G[ch][0] + track) * u;
  }
  return d;
}

// ------------------------------------------------------------------ shapes
const poly = (pts) => 'M' + pts.map(([x, y]) => `${f(x)} ${f(y)}`).join('L') + 'Z';
const circ = (cx, cy, r) =>
  `M${f(cx - r)} ${f(cy)}a${f(r)} ${f(r)} 0 1 0 ${f(2 * r)} 0a${f(r)} ${f(r)} 0 1 0 ${f(-2 * r)} 0Z`;
const rrect = (x, y, w, h, r) =>
  `M${f(x + r)} ${f(y)}h${f(w - 2 * r)}a${f(r)} ${f(r)} 0 0 1 ${f(r)} ${f(r)}v${f(h - 2 * r)}a${f(r)} ${f(r)} 0 0 1 ${f(-r)} ${f(r)}h${f(-(w - 2 * r))}a${f(r)} ${f(r)} 0 0 1 ${f(-r)} ${f(-r)}v${f(-(h - 2 * r))}a${f(r)} ${f(r)} 0 0 1 ${f(r)} ${f(-r)}Z`;
// A diamond centred on 0,0. soft = how far along each edge the corner is
// rounded off (the CONTOUR knob: 0 is hard, 0.3 is very soft).
function diamond(hx, hy, soft = 0) {
  const P = [[hx, 0], [0, -hy], [-hx, 0], [0, hy]];
  if (!soft) return poly(P);
  let d = '';
  for (let i = 0; i < 4; i++) {
    const p = P[i], a = P[(i + 3) % 4], b = P[(i + 1) % 4];
    const s = [p[0] + (a[0] - p[0]) * soft, p[1] + (a[1] - p[1]) * soft];
    const e = [p[0] + (b[0] - p[0]) * soft, p[1] + (b[1] - p[1]) * soft];
    d += `${i ? 'L' : 'M'}${f(s[0])} ${f(s[1])}Q${f(p[0])} ${f(p[1])} ${f(e[0])} ${f(e[1])}`;
  }
  return d + 'Z';
}
// A diamond with a diamond-shaped hole (draw with fill-rule evenodd).
const band = (hx, hy, keep, soft = 0) => diamond(hx, hy, soft) + diamond(hx * keep, hy * keep, soft);

// ------------------------------------------------------------------ animation helpers
const css = [];
const kfCache = new Map();
let kfN = 0;
// frames: [[t, value]] with t in seconds, starting at 0. Returns a keyframes name.
function keyframes(frames, prop) {
  const byVal = new Map();
  const last = frames[frames.length - 1][1];
  for (const [t, v] of frames) {
    if (!byVal.has(v)) byVal.set(v, []);
    byVal.get(v).push(pc(t));
  }
  byVal.get(last).push('100%');
  const body = [...byVal].map(([v, ps]) => `${ps.join(',')}{${prop}:${v}}`).join('');
  if (kfCache.has(body)) return kfCache.get(body);
  const name = `k${(kfN++).toString(36)}`;
  kfCache.set(body, name);
  css.push(`@keyframes ${name}{${body}}`);
  return name;
}
const clsCache = new Map();
let clsN = 0;
// A class that runs these keyframes on the 12 s clock, with a static fallback
// value (the first frame) for reduced motion.
function animClass(frames, prop) {
  const name = keyframes(frames, prop);
  const key = `${name}|${prop}`;
  if (clsCache.has(key)) return clsCache.get(key);
  const cls = `a${(clsN++).toString(36)}`;
  clsCache.set(key, cls);
  css.push(`.${cls}{${prop}:${frames[0][1]};animation:${name} ${LOOP}s step-end infinite}`);
  return cls;
}
// visible only while t is in one of the [t0, t1) windows
function showClass(windows) {
  const frames = [[0, 0]];
  for (const [a, b] of windows) frames.push([a, 1], [b, 0]);
  frames.sort((p, q) => p[0] - q[0]);
  const clean = [];
  for (const fr of frames) {
    if (clean.length && clean[clean.length - 1][0] === fr[0]) clean[clean.length - 1] = fr;
    else clean.push(fr);
  }
  return animClass(clean.filter(([t]) => t < LOOP), 'opacity');
}

// ------------------------------------------------------------------ the music
// Fake envelopes, as fractions of the full cell. The outer diamond is the left
// channel (electric piano and kick: big on beat 1, a bump on beat 3); the inner
// one is the right channel (the kalimba line), five steps a bar. Bar 4 is the
// loud one, because that is where something happens.
const OUTER = [
  0.92, 0.66, 0.80, 0.60,
  0.96, 0.70, 0.86, 0.64,
  1.00, 0.72, 0.90, 0.66,
  1.00, 0.78, 0.94, 0.70,
];
const INNER = [
  0.36, 0.58, 0.44, 0.72, 0.40,
  0.50, 0.34, 0.80, 0.46, 0.60,
  0.38, 0.64, 0.52, 0.92, 0.42,
  0.70, 0.48, 0.98, 0.56, 0.66,
];
const envFrames = (vals, step) => vals.map((v, i) => [i * step, `scale(${v})`]);

// ------------------------------------------------------------------ the programme
// One entry per hue step (1.5 s, two per bar).
//   layout: [across, down]; mode: island | lagoon | atoll; hue: rainbow shift, or 'one'
const PROGRAMME = [
  { layout: [5, 2], mode: 'island', hue: 0 },
  { layout: [5, 2], mode: 'island', hue: 1 },
  { layout: [5, 2], mode: 'lagoon', hue: 2 },
  { layout: [5, 2], mode: 'lagoon', hue: 3 },
  { layout: [5, 2], mode: 'atoll', hue: 4 },
  { layout: [5, 2], mode: 'atoll', hue: 5 },
  { layout: [1, 1], mode: 'island', hue: 'one' },
  { layout: [1, 1], mode: 'island', hue: 'one2' },
];
const SEG = HUE_STEP;

// ------------------------------------------------------------------ layout
const W = 1200, H = 664;
const SCR = { x: 20, y: 20, w: 1160, h: 420, r: 26 };
const FP = { x: 20, y: 456, w: 1160, h: 188 };

function cellColours(c, r, hue) {
  if (hue === 'one') return [CORAL, SUN];
  if (hue === 'one2') return [TV[4], SUN];
  const i = (c + 2 * r + hue) % 6;
  return [TV[i], TV[(i + 3) % 6]];
}

// The light box only knows how to draw diamonds, so when it tries to draw the
// island's one tall palm, the palm is made of diamonds too: a curved stack of
// small ones for the segmented trunk, long thin ones for the fronds. Drawn on
// the one big island in bar 4, in palm green, swelling with the inner diamond.
const PALM = TV[2];
function palm(Hi) {
  const P = (x, y) => [x * Hi, y * Hi];
  const quad = (a, c, b, t) => [
    (1 - t) * (1 - t) * a[0] + 2 * (1 - t) * t * c[0] + t * t * b[0],
    (1 - t) * (1 - t) * a[1] + 2 * (1 - t) * t * c[1] + t * t * b[1],
  ];
  const base = P(-0.06, 0.4), ctrl = P(-0.3, -0.36), top = P(0.14, -0.98);
  let d = '';
  const N = 11;
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1);
    const [x, y] = quad(base, ctrl, top, t);
    const hx = Hi * 0.085 * (1 - 0.3 * t), hy = Hi * 0.105;
    d += poly([[x + hx, y], [x, y - hy], [x - hx, y], [x, y + hy]]);
  }
  // fronds: a long diamond from the crown to each tip
  const tips = [[-1.04, 0.3], [-0.9, -0.28], [-0.4, -0.6], [0.3, -0.62], [0.92, -0.28], [1.06, 0.28], [0.2, 0.52], [-0.46, 0.5]];
  for (const [tx, ty] of tips) {
    const ex = top[0] + tx * Hi, ey = top[1] + ty * Hi;
    const dx = ex - top[0], dy = ey - top[1], L = Math.hypot(dx, dy);
    const nx = -dy / L, ny = dx / L, w = Hi * 0.09;
    const mx = top[0] + dx * 0.42, my = top[1] + dy * 0.42;
    d += poly([[top[0], top[1]], [mx + nx * w, my + ny * w], [ex, ey], [mx - nx * w, my - ny * w]]);
  }
  return d;
}

// two coconuts under the crown, diamonds as well
function coconuts(Hi) {
  const top = [0.14 * Hi, -0.98 * Hi], r = Hi * 0.07;
  return [[-0.09, 0.13], [0.07, 0.15]]
    .map(([dx, dy]) => {
      const x = top[0] + dx * Hi, y = top[1] + dy * Hi;
      return poly([[x + r, y], [x, y - r * 1.15], [x - r, y], [x, y + r * 1.15]]);
    }).join('');
}

function screenArt() {
  const out = [];
  const so = animClass(envFrames(OUTER, BEAT), 'transform');
  const si = animClass(envFrames(INNER, INNER_STEP), 'transform');
  PROGRAMME.forEach((p, s) => {
    const vis = showClass([[s * SEG, (s + 1) * SEG]]);
    const [nx, ny] = p.layout;
    const cw = SCR.w / nx, ch = SCR.h / ny;
    const hx = cw / 2, hy = ch / 2;
    let outerD, innerD, rule = '';
    if (p.mode === 'island') {
      outerD = diamond(hx, hy, 0);
      // on the one big island the inner diamond is held smaller, so the sun
      // stays inside the coral instead of swallowing it
      const k = nx === 1 ? 0.6 : 1;
      innerD = diamond(hx * k, hy * k, 0.2);
    } else if (p.mode === 'lagoon') {
      outerD = band(hx, hy, 0.56, 0);
      innerD = band(hx, hy, 0.5, 0.2);
      rule = ' fill-rule="evenodd"';
    } else {
      outerD = band(hx, hy, nx === 1 ? 0.93 : 0.86, 0);
      innerD = band(hx, hy, nx === 1 ? 0.9 : 0.8, 0.2);
      rule = ' fill-rule="evenodd"';
    }
    // Plain paths, not <use>: CSS animation inside <use> clones is not
    // reliable in every browser, and the shapes are only a few bytes each.
    let g = `<g class="${vis}">`;
    for (let r = 0; r < ny; r++) {
      for (let c = 0; c < nx; c++) {
        const [co, ci] = cellColours(c, r, p.hue);
        const x = SCR.x + cw * (c + 0.5), y = SCR.y + ch * (r + 0.5);
        const extra = nx === 1
          ? `<path class="${si}" fill="${PALM}" d="${palm(hy * 0.6)}"/><path class="${si}" fill="${TV[0]}" d="${coconuts(hy * 0.6)}"/>`
          : '';
        g += `<g transform="translate(${f(x)} ${f(y)})"><path class="${so}" fill="${co}"${rule} d="${outerD}"/><path class="${si}" fill="${ci}"${rule} d="${innerD}"/>${extra}</g>`;
      }
    }
    out.push(g + '</g>');
  });
  return out.join('\n');
}

// ------------------------------------------------------------------ faceplate parts
const parts = [];
const ink = (d, cls = 't12') => parts.push(`<path class="${cls}" d="${d}"/>`);

// time windows, by bar
const BARS_IDLE = [[0, 9]], BAR_EVENT = [[9, 12]];
const MODE_WINDOWS = { island: [[0, 3], [9, 12]], lagoon: [[3, 6]], atoll: [[6, 9]] };

function knob(cx, cy, { setting, setting2, ticks = 11 }) {
  // tick scale: 270 degrees, from bottom-left round to bottom-right
  const r0 = 30, r1 = 35;
  let d = '';
  for (let i = 0; i < ticks; i++) {
    const a = ((135 + (270 * i) / (ticks - 1)) * Math.PI) / 180;
    const rr = i === 0 || i === ticks - 1 ? r1 + 2 : r1;
    d += `M${f(cx + Math.cos(a) * r0)} ${f(cy + Math.sin(a) * r0)}L${f(cx + Math.cos(a) * rr)} ${f(cy + Math.sin(a) * rr)}`;
  }
  parts.push(`<path class="tick" d="${d}"/>`);
  parts.push(`<path fill="${C.knob}" d="${circ(cx, cy + 1.5, 25.5)}"/>`);
  parts.push(`<circle cx="${f(cx)}" cy="${f(cy)}" r="24" class="knurl"/>`);
  parts.push(`<path fill="${C.knobCap}" d="${circ(cx, cy, 18)}"/>`);
  parts.push(`<path fill="${C.knobHi}" d="M${f(cx - 15)} ${f(cy - 6)}A16 16 0 0 1 ${f(cx + 15)} ${f(cy - 6)}A18 13 0 0 0 ${f(cx - 15)} ${f(cy - 6)}Z" opacity=".55"/>`);
  const pointer = (frac) => {
    const a = ((135 + 270 * frac) * Math.PI) / 180;
    return `M${f(cx + Math.cos(a) * 5)} ${f(cy + Math.sin(a) * 5)}L${f(cx + Math.cos(a) * 21)} ${f(cy + Math.sin(a) * 21)}`;
  };
  if (setting2 === undefined) {
    parts.push(`<path class="ptr" d="${pointer(setting)}"/>`);
  } else {
    parts.push(`<path class="ptr ${showClass(BARS_IDLE)}" d="${pointer(setting)}"/>`);
    parts.push(`<path class="ptr ${showClass(BAR_EVENT)}" d="${pointer(setting2)}"/>`);
  }
}
// a group label under one or two knobs, with the two ends of its scale
function knobLabel(xa, xb, y, label, lo, hi) {
  ink(text(label, (xa + xb) / 2, y, 11, { anchor: 'middle' }), 't11');
  ink(text(lo, xa - 30, y + 1.5, 9, { anchor: 'start' }), 't8');
  ink(text(hi, xb + 30, y + 1.5, 9, { anchor: 'end' }), 't8');
}

function button(x, y, w, h, { icon, litWindows, litColour = C.coral, always = false }) {
  // body shadow, cap, then a lit cap that shows only in its windows
  parts.push(`<path fill="${C.capLo}" d="${rrect(x, y + 3, w, h, 5)}"/>`);
  parts.push(`<path fill="${C.cap}" stroke="${C.creamLine}" stroke-width="1" d="${rrect(x, y, w, h, 5)}"/>`);
  if (always) {
    parts.push(`<path fill="${litColour}" d="${rrect(x, y, w, h, 5)}"/>`);
  } else if (litWindows) {
    parts.push(`<path class="${showClass(litWindows)}" fill="${litColour}" d="${rrect(x, y, w, h, 5)}"/>`);
  }
  parts.push(`<path fill="#fff" opacity=".35" d="${rrect(x + 3, y + 2, w - 6, 4, 2)}"/>`);
  if (icon) parts.push(icon);
}

function bracket(x0, x1, y, label) {
  const tw = measure(label, 9, 1.7);
  const mx = (x0 + x1) / 2;
  parts.push(`<path class="rule" d="M${f(x0)} ${f(y + 8)}L${f(x0)} ${f(y + 3)}L${f(mx - tw / 2 - 8)} ${f(y + 3)}M${f(mx + tw / 2 + 8)} ${f(y + 3)}L${f(x1)} ${f(y + 3)}L${f(x1)} ${f(y + 8)}"/>`);
  ink(text(label, mx, y - 1.5, 9, { anchor: 'middle' }), 't9');
}

function faceplate() {
  // body
  parts.push(`<path fill="${C.cream}" d="${rrect(FP.x, FP.y, FP.w, FP.h, 12)}"/>`);
  parts.push(`<path fill="${C.creamHi}" d="M${FP.x + 12} ${FP.y + 1}h${FP.w - 24}v2h${-(FP.w - 24)}Z"/>`);
  parts.push(`<path fill="${C.creamLo}" d="M${FP.x + 12} ${FP.y + FP.h - 3}h${FP.w - 24}v2h${-(FP.w - 24)}Z"/>`);
  // a divider between the upper and lower rows
  const yDiv = FP.y + 118;
  parts.push(`<path class="rule2" d="M${FP.x + 26} ${yDiv}H${FP.x + FP.w - 26}"/>`);

  // ---- left: maker, name, model
  const LX = 50;
  // maker mark: a diamond with a palm and a horizon (an invented logo)
  const mx = LX + 9, my = FP.y + 25;
  parts.push(`<path fill="${C.ink}" d="${poly([[mx, my - 10], [mx + 10, my], [mx, my + 10], [mx - 10, my]])}"/>`);
  parts.push(`<path fill="${C.sun}" d="${circ(mx + 2.6, my - 2.6, 2.2)}"/>`);
  parts.push(`<path fill="none" stroke="${C.cream}" stroke-width="1.3" stroke-linecap="round" d="M${f(mx - 4.5)} ${f(my + 4.5)}H${f(mx + 4.5)}M${f(mx - 1.5)} ${f(my + 4.5)}Q${f(mx - 1)} ${f(my)} ${f(mx - 2.6)} ${f(my - 3.2)}M${f(mx - 2.6)} ${f(my - 3.2)}l-3 1.2M${f(mx - 2.6)} ${f(my - 3.2)}l2.6 .4M${f(mx - 2.6)} ${f(my - 3.2)}l-.6 -2.4"/>`);
  ink(text('SANDGLASS', LX + 27, FP.y + 19, 12, { track: 2.4 }), 't12b');
  ink(text('MODEL 80', LX + 27 + measure('SANDGLASS', 12, 2.4) + 16, FP.y + 19, 12, { track: 1.7 }), 't12m');
  // the name
  ink(text('CASTAWAY', LX - 2, FP.y + 44, 44, { track: 1.55 }), 'tname');
  // the stripe under it: coral, sun, teal
  const nameW = measure('CASTAWAY', 44, 1.55);
  const sy = FP.y + 100;
  [[C.coral, 0], [C.sun, 5], [C.teal, 10]].forEach(([col, dy]) => {
    parts.push(`<path fill="${col}" d="M${LX} ${sy + dy}h${f(nameW - 4)}v3h${f(-(nameW - 4))}Z"/>`);
  });

  // ---- middle: five knobs (gain = SWELL, contour = SHORE, colour = SUN)
  const ky = FP.y + 60;
  const K = [472, 542, 650, 720, 822];
  knob(K[0], ky, { setting: 0.74 });
  knob(K[1], ky, { setting: 0.62 });
  knob(K[2], ky, { setting: 1 });
  knob(K[3], ky, { setting: 0.3 });
  knob(K[4], ky, { setting: 1, setting2: 0 });
  // L and R over the pairs: the left channel drives the outer diamond, the right the inner
  [[K[0], 'L'], [K[1], 'R'], [K[2], 'L'], [K[3], 'R']].forEach(([x, ch]) => ink(text(ch, x, FP.y + 7, 9, { anchor: 'middle' }), 't9b'));
  knobLabel(K[0], K[1], ky + 44, 'SWELL', 'CALM', 'BIG');
  knobLabel(K[2], K[3], ky + 44, 'SHORE', 'SAND', 'ROCK');
  ink(text('SUN', K[4], ky + 44, 11, { anchor: 'middle' }), 't11');
  ink(text('ONE', K[4] - 31, ky + 23, 9, { anchor: 'end' }), 't8');
  ink(text('ALL', K[4] + 31, ky + 23, 9, { anchor: 'start' }), 't8');

  // ---- right: the shape bank
  const BX = 892, BP = 70, BW = 52, BH = 40, BY = FP.y + 28;
  bracket(BX - 2, BX + 3 * BP + BW + 2, FP.y + 10, 'SHAPE');
  const icons = {
    island: (cx, cy) => `<path fill="${C.ink}" d="${diamond(13, 10)}" transform="translate(${cx} ${cy})"/>`,
    lagoon: (cx, cy) => `<path fill="${C.ink}" fill-rule="evenodd" d="${band(13, 10, 0.5)}" transform="translate(${cx} ${cy})"/>`,
    atoll: (cx, cy) => `<path fill="${C.ink}" fill-rule="evenodd" d="${band(13, 10, 0.78)}" transform="translate(${cx} ${cy})"/>`,
    tide: (cx, cy) => `<path fill="none" stroke="${C.ink}" stroke-width="2.4" stroke-linecap="round" d="M${cx - 12} ${cy - 3}q3 -4 6 0t6 0t6 0t6 0M${cx - 12} ${cy + 5}q3 -4 6 0t6 0t6 0t6 0"/>`,
  };
  ['island', 'lagoon', 'atoll', 'tide'].forEach((m, i) => {
    const x = BX + i * BP;
    if (m === 'tide') {
      button(x, BY, BW, BH, { icon: icons[m](x + BW / 2, BY + BH / 2), always: true, litColour: C.teal });
    } else {
      button(x, BY, BW, BH, { icon: icons[m](x + BW / 2, BY + BH / 2), litWindows: MODE_WINDOWS[m] });
    }
    ink(text(m.toUpperCase(), x + BW / 2, BY + BH + 14, 11, { anchor: 'middle' }), 't11');
  });
  // the beat lamp, at the end of the maker line: bright on every loud beat
  const PX = LX + 27 + measure('SANDGLASS', 12, 2.4) + 16 + measure('MODEL 80', 12, 1.7) + 22;
  parts.push(`<path fill="${C.ink}" d="${circ(PX, FP.y + 25, 5.5)}"/>`);
  parts.push(`<path class="${animClass(OUTER.map((v, i) => [i * BEAT, v >= 0.86 ? 1 : 0.35]), 'opacity')}" fill="${C.coral}" d="${circ(PX, FP.y + 25, 4)}"/>`);
  ink(text('80 BPM', PX + 12, FP.y + 20.5, 9), 't8');

  // ---- lower row: the repeat bank, with the tagline spelled across it
  const WORDS = ['SHE', 'IDLES.', 'THEN,', 'EVERY', 'SO', 'OFTEN,', 'SOMETHING', 'HAPPENS.'];
  const NUMS = ['1', '2', '3', '5', '1', '2', '4', '8'];
  const LIT_IDLE = [3, 5], LIT_EVENT = [0, 4];
  const RY = yDiv + 22, RW = 24, RH = 18, CAP = 13;
  // each button sits just left of its word; space the pairs evenly over the row
  const items = WORDS.map((w, i) => ({ w, n: NUMS[i], tw: measure(w, CAP, 1.7) }));
  const gap = 10, x0 = 50, x1 = 1150;
  const total = items.reduce((s, it) => s + RW + gap + it.tw, 0);
  const space = (x1 - x0 - total) / (items.length - 1);
  let x = x0;
  const pos = [];
  items.forEach((it, i) => {
    pos.push(x);
    const lit = LIT_IDLE.includes(i) ? BARS_IDLE : LIT_EVENT.includes(i) ? BAR_EVENT : null;
    button(x, RY, RW, RH, { litWindows: lit, litColour: C.sun });
    ink(text(it.n, x + RW / 2, RY + 5, 8, { anchor: 'middle' }), 't8b');
    ink(text(it.w, x + RW + gap, RY + 3, CAP), 'tword');
    x += RW + gap + it.tw + space;
  });
  // ACROSS over the first four, DOWN over the last four
  bracket(pos[0], pos[3] + RW + gap + items[3].tw, RY - 16, 'ACROSS');
  bracket(pos[4], pos[7] + RW + gap + items[7].tw, RY - 16, 'DOWN');
}

// ------------------------------------------------------------------ assemble
function build() {
  const screen = screenArt();
  faceplate();
  const style = [
    `.tname{fill:none;stroke:${C.ink};stroke-width:6.6;stroke-linecap:round;stroke-linejoin:round}`,
    `.t12b,.t12m,.t11,.t9,.t9b,.t8,.t8b,.tword{fill:none;stroke-linecap:round;stroke-linejoin:round}`,
    `.t12b{stroke:${C.ink};stroke-width:2.1}`,
    `.t12m{stroke:${C.ink2};stroke-width:1.7}`,
    `.t11{stroke:${C.ink};stroke-width:1.6}`,
    `.t9{stroke:${C.ink2};stroke-width:1.35}`,
    `.t8{stroke:${C.ink2};stroke-width:1.2}`,
    `.t8b{stroke:${C.ink};stroke-width:1.4}`,
    `.t9b{stroke:${C.ink};stroke-width:1.5}`,
    `.tword{stroke:${C.ink};stroke-width:2}`,
    `.tick{fill:none;stroke:${C.ink};stroke-width:1.5;stroke-linecap:round}`,
    `.rule{fill:none;stroke:${C.ink2};stroke-width:1.2}`,
    `.rule2{fill:none;stroke:${C.creamLine};stroke-width:1.5}`,
    `.knurl{fill:none;stroke:${C.knobRim};stroke-width:3;stroke-dasharray:1.6 2.2}`,
    `.ptr{fill:none;stroke:${C.coral};stroke-width:3.4;stroke-linecap:round}`,
    ...css,
    `@media (prefers-reduced-motion:reduce){*{animation:none!important}}`,
  ].join('\n');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="title">
<title id="title">CASTAWAY: a lo-fi island light box. Rows of two-part diamonds pulse on black to an 80 BPM beat above a cream faceplate with five knobs and a shape bank.</title>
<style>
${style}
</style>
<defs>
<clipPath id="scr"><path d="${rrect(SCR.x, SCR.y, SCR.w, SCR.h, SCR.r)}"/></clipPath>
<pattern id="scan" width="4" height="3" patternUnits="userSpaceOnUse"><rect width="4" height="1" fill="#000" opacity=".16"/></pattern>
<radialGradient id="vig" cx="50%" cy="50%" r="75%"><stop offset="55%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity=".55"/></radialGradient>
<linearGradient id="bez" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b0a09"/><stop offset="1" stop-color="#3a352e"/></linearGradient>
<linearGradient id="glare" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".09"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/></linearGradient>
</defs>
<path fill="${C.housing}" d="${rrect(0, 0, W, H, 26)}"/>
<path fill="none" stroke="${C.housingHi}" stroke-width="2" d="${rrect(1, 1, W - 2, H - 2, 25)}"/>
<path fill="url(#bez)" fill-rule="evenodd" d="${rrect(SCR.x - 8, SCR.y - 8, SCR.w + 16, SCR.h + 16, SCR.r + 8)}${rrect(SCR.x, SCR.y, SCR.w, SCR.h, SCR.r)}"/>
<path fill="${C.screen}" d="${rrect(SCR.x, SCR.y, SCR.w, SCR.h, SCR.r)}"/>
<g clip-path="url(#scr)">
${screen}
<rect x="${SCR.x}" y="${SCR.y}" width="${SCR.w}" height="${SCR.h}" fill="url(#scan)"/>
<rect x="${SCR.x}" y="${SCR.y}" width="${SCR.w}" height="${SCR.h}" fill="url(#vig)"/>
<path fill="url(#glare)" d="M${SCR.x} ${SCR.y}H${SCR.x + 760}Q${SCR.x + 300} ${SCR.y + 120} ${SCR.x} ${SCR.y + 330}Z"/>
</g>
<path fill="none" stroke="#000" stroke-width="3" d="${rrect(SCR.x, SCR.y, SCR.w, SCR.h, SCR.r)}"/>
${parts.join('\n')}
</svg>
`;
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, svg);
  console.log(`wrote ${path.relative(process.cwd(), OUT)} (${(svg.length / 1024).toFixed(1)} KB)`);
}

// ------------------------------------------------------------------ the ten-hours chart
// One diamond per event in a typical ten-hour run, a row per timer. The counts
// are the medians activities.toml states (200 simulated runs: about 155
// regular, 30 occasional, 13 rare, 2 super rare; the ~20 chained follow-ups
// are left out). The positions are NOT the real seed-1992 schedule: they are
// spread evenly with a seeded jitter, which keeps every gap close to its
// timer's range. A sweep crosses the ten hours every 24 s and every diamond
// it passes swells for a moment, in steps, like the banner.
function buildHours() {
  const HW = 1000, HH = 424, T = 24;
  const rnd = mulberry32(1992);
  const S = { x: 262, y: 16, w: 722, h: 336, r: 16 };
  const PAD = 14, X0 = S.x + PAD, XW = S.w - 2 * PAD;
  const xAt = (min) => X0 + (min / 600) * XW;
  const ROWS = [
    { name: 'REGULAR', every: 'EVERY 2 TO 5 MIN', n: 155, h: 74, col: TV[3], inner: null },
    { name: 'OCCASIONAL', every: 'EVERY 12 TO 25 MIN', n: 30, h: 76, col: TV[1], inner: TV[4] },
    { name: 'RARE', every: 'EVERY 30 TO 60 MIN', n: 13, h: 84, col: TV[0], inner: TV[3] },
    { name: 'SUPER RARE', every: 'EVERY 3 TO 6 HOURS', n: 2, h: 102, col: TV[5], inner: TV[2] },
  ];
  const out = [], lab = [], hcss = [];
  hcss.push(`@keyframes pop{0%{transform:scale(1.7)}2%{transform:scale(1.3)}4%,100%{transform:scale(1)}}`);
  hcss.push(`.p{animation:pop ${T}s step-end infinite}`);
  hcss.push(`@keyframes sweep{0%{transform:translateX(0)}100%{transform:translateX(${XW}px)}}`);
  hcss.push(`.sw{animation:sweep ${T}s linear infinite}`);
  hcss.push(`@keyframes swo{0%,100%{opacity:0}1%,99%{opacity:.5}}`);
  hcss.push(`.swo{opacity:0;animation:swo ${T}s linear infinite}`);
  let y = S.y;
  ROWS.forEach((row, ri) => {
    const cy = y + row.h / 2;
    // positions
    let mins;
    if (row.n === 2) mins = [252, 515];          // 4:12 and 8:35: gaps of 4 h 12 and 4 h 23
    else {
      const gap = 600 / (row.n + 1);
      mins = Array.from({ length: row.n }, (_, i) => (i + 1 + (rnd() - 0.5) * 0.3) * gap);
    }
    // faint row rule
    if (ri) out.push(`<path stroke="#ffffff" stroke-opacity=".07" d="M${S.x} ${f(y)}H${S.x + S.w}"/>`);
    for (const m of mins) {
      const x = xAt(m);
      let d1, d2 = '';
      if (row.n > 100) {
        const hy = (0.45 + rnd() * 0.55) * (row.h / 2 - 8);   // a waveform of slivers
        d1 = diamond(2.3, hy);
      } else if (row.n > 20) {
        d1 = diamond(8, row.h / 2 - 12); d2 = diamond(4, (row.h / 2 - 12) * 0.5, 0.2);
      } else if (row.n > 5) {
        d1 = diamond(15, row.h / 2 - 10); d2 = diamond(7.5, (row.h / 2 - 10) * 0.5, 0.2);
      } else {
        d1 = diamond(34, row.h / 2 - 8); d2 = diamond(17, (row.h / 2 - 8) * 0.5, 0.2);
      }
      const delay = `${f((m / 600) * T)}s`;
      out.push(`<g transform="translate(${f(x)} ${f(cy)})"><g class="p" style="animation-delay:${delay}"><path fill="${row.col}" d="${d1}"/>${d2 ? `<path fill="${row.inner}" d="${d2}"/>` : ''}</g></g>`);
    }
    // the label column
    const ly = cy - 18;
    lab.push(`<path class="h15" d="${text(row.name, 36, ly, 15)}"/>`);
    lab.push(`<path class="h11" d="${text(row.every, 36, ly + 23, 11)}"/>`);
    lab.push(`<path class="h11m" d="${text(`ABOUT ${row.n} A RUN`, 36, ly + 39, 11)}"/>`);
    // a little swatch of the row's diamond
    lab.push(`<path fill="${row.col}" d="${diamond(7, 11)}" transform="translate(${242} ${f(cy)})"/>`);
    y += row.h;
  });
  // hour ticks under the screen
  for (let h = 0; h <= 10; h++) {
    const x = xAt(h * 60);
    lab.push(`<path class="hr" d="M${f(x)} ${S.y + S.h + 8}v8"/>`);
    lab.push(`<path class="h11" d="${text(`${h}H`, x, S.y + S.h + 22, 11, { anchor: 'middle' })}"/>`);
  }
  lab.push(`<path class="h11m" d="${text('ONE DIAMOND PER EVENT', 36, S.y + S.h + 22, 11)}"/>`);
  lab.push(`<path class="h11m" d="${text('ILLUSTRATIVE POSITIONS', 36, S.y + S.h + 40, 11)}"/>`);

  const style = [
    `.h15,.h11,.h11m{fill:none;stroke-linecap:round;stroke-linejoin:round}`,
    `.h15{stroke:${C.ink};stroke-width:2.3}`,
    `.h11{stroke:${C.ink};stroke-width:1.6}`,
    `.h11m{stroke:${C.ink2};stroke-width:1.5}`,
    `.hr{stroke:${C.ink2};stroke-width:1.4}`,
    ...hcss,
    `@media (prefers-reduced-motion:reduce){*{animation:none!important}.swo{opacity:0}}`,
  ].join('\n');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${HW} ${HH}" width="${HW}" height="${HH}" role="img" aria-labelledby="title">
<title id="title">Ten hours of Castaway on the light box: one diamond per event, a row per timer.</title>
<style>
${style}
</style>
<defs><clipPath id="hs"><path d="${rrect(S.x, S.y, S.w, S.h, S.r)}"/></clipPath>
<linearGradient id="hsw" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".22"/></linearGradient></defs>
<path fill="${C.cream}" d="${rrect(0, 0, HW, HH, 20)}"/>
<path fill="none" stroke="${C.creamLine}" stroke-width="2" d="${rrect(1, 1, HW - 2, HH - 2, 19)}"/>
<path fill="${C.housing}" d="${rrect(S.x - 6, S.y - 6, S.w + 12, S.h + 12, S.r + 6)}"/>
<path fill="${C.screen}" d="${rrect(S.x, S.y, S.w, S.h, S.r)}"/>
<g clip-path="url(#hs)">
${out.join('\n')}
<g class="sw"><g class="swo"><path fill="url(#hsw)" d="M${X0 - 36} ${S.y}h36v${S.h}h-36Z"/><path fill="#fff" opacity=".55" d="M${X0 - 1} ${S.y}h2v${S.h}h-2Z"/></g></g>
</g>
${lab.join('\n')}
</svg>
`;
  fs.writeFileSync(OUT_HOURS, svg);
  console.log(`wrote ${path.relative(process.cwd(), OUT_HOURS)} (${(svg.length / 1024).toFixed(1)} KB)`);
}

build();
buildHours();
