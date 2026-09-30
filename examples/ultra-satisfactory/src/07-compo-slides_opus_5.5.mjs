#!/usr/bin/env node
// ULTRA-SATISFACTORY README header: "Demoparty Compo Slides" (07-compo-slides_opus_5.5).
// Plain Node, no dependencies, fully deterministic (seeded PRNG).
//   node examples/ultra-satisfactory/src/07-compo-slides_opus_5.5.mjs
// writes examples/ultra-satisfactory/assets/07-compo-slides_opus_5.5.svg
//
// The big screen in the main hall of an invented demoparty ("BOTTLENECK 2026"),
// seen from the back rows. The beamer walks through the slide types a party
// system shows: an entry slide (number, title, author, comment) with a corner
// countdown, a competition countdown ending in a one-word NOW cue, one slide
// per entry, an end-of-compo slide, and a prize-giving revealed from last place
// up with score bars sized as each entry's share of the top score.
//
// Every number on the slides is one the app really shows: 477 buildings,
// 140 craftable items, 211 recipes, 5 Space Elevator phases.
//
// All lettering is a stroke font defined below (chamfered, machined capitals)
// and emitted as <path>s: no <text>, no web fonts, nothing external.
// Animation is CSS only on one 36 s master timeline, so prefers-reduced-motion
// can switch it all off and leave the entry slide as a complete still. The rim
// light on the crowd and the spill on the floor follow each slide's colour.

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(here, '../assets/07-compo-slides_opus_5.5.svg');

// ------------------------------------------------------------------ basics
const W = 960;
const H = 560;
const SX = 30; // the projected screen
const SY = 18;
const SW = 900;
const SH = 464;
const L = SX + 40; // slide content margins
const R = SX + SW - 40;
const T = 36; // master loop, seconds

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const randFx = mulberry32(0xb077135); // confetti
const rand = mulberry32(0x5ca7e2); // the crowd
const n1 = (v) => +v.toFixed(1);
const n2 = (v) => +v.toFixed(2);

// The app's own palette (black, neon cyan, white, gold, three tab colours),
// plus the greys a projector makes of "black".
const C = {
  hall: '#020305',
  scrTop: '#080d17',
  scrBot: '#0b1320',
  white: '#f3f7fc',
  dim: '#9aa8bc',
  dim2: '#5d6a7e',
  cyan: '#00cfff',
  gold: '#e8d44d',
  purple: '#a855f7',
  pink: '#ec4899',
  blue: '#38bdf8',
};
const mix = (a, b, t) => {
  const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return '#' + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, '0')).join('');
};

// ------------------------------------------------------------------ stroke font
// Skeletons on a 4 x 6 unit grid (y down). Every corner is a chamfer or a right
// angle and every terminal is axis-aligned, so square caps + miter joins give
// flat, machined ends. `w` is the skeleton width; `z` marks closed outlines.
const GLYPHS = {
  A: { w: 4, s: [[[0, 6], [0, 1], [1, 0], [3, 0], [4, 1], [4, 6]], [[0, 3.6], [4, 3.6]]] },
  B: { w: 4, s: [[[0, 0], [3, 0], [4, 1], [4, 2.2], [3.2, 3], [4, 3.8], [4, 5], [3, 6], [0, 6], 'z'], [[0, 3], [3.2, 3]]] },
  C: { w: 4, s: [[[4, 1.7], [4, 1], [3, 0], [1, 0], [0, 1], [0, 5], [1, 6], [3, 6], [4, 5], [4, 4.3]]] },
  D: { w: 4, s: [[[0, 0], [3, 0], [4, 1], [4, 5], [3, 6], [0, 6], 'z']] },
  E: { w: 3.8, s: [[[3.8, 0], [0, 0], [0, 6], [3.8, 6]], [[0, 3], [3, 3]]] },
  F: { w: 3.8, s: [[[3.8, 0], [0, 0], [0, 6]], [[0, 3], [3, 3]]] },
  G: { w: 4, s: [[[4, 1.7], [4, 1], [3, 0], [1, 0], [0, 1], [0, 5], [1, 6], [3, 6], [4, 5], [4, 3.2], [2.3, 3.2]]] },
  H: { w: 4, s: [[[0, 0], [0, 6]], [[4, 0], [4, 6]], [[0, 3], [4, 3]]] },
  I: { w: 0, s: [[[0, 0], [0, 6]]] },
  J: { w: 3.6, s: [[[3.6, 0], [3.6, 5], [2.6, 6], [1, 6], [0, 5], [0, 4.3]]] },
  K: { w: 4, s: [[[0, 0], [0, 6]], [[4, 0], [4, 0.5], [1.5, 3], [4, 5.5], [4, 6]], [[0, 3], [1.5, 3]]] },
  L: { w: 3.6, s: [[[0, 0], [0, 6], [3.6, 6]]] },
  M: { w: 5, s: [[[0, 6], [0, 0], [2.5, 3.6], [5, 0], [5, 6]]] },
  N: { w: 4, s: [[[0, 6], [0, 0], [4, 6], [4, 0]]] },
  O: { w: 4, s: [[[1, 0], [3, 0], [4, 1], [4, 5], [3, 6], [1, 6], [0, 5], [0, 1], 'z']] },
  P: { w: 4, s: [[[0, 6], [0, 0], [3, 0], [4, 1], [4, 2.6], [3, 3.6], [0, 3.6]]] },
  Q: { w: 4, s: [[[1, 0], [3, 0], [4, 1], [4, 5], [3, 6], [1, 6], [0, 5], [0, 1], 'z'], [[2.5, 4.5], [4.2, 6.2]]] },
  R: { w: 4, s: [[[0, 6], [0, 0], [3, 0], [4, 1], [4, 2.6], [3, 3.6], [0, 3.6]], [[1.4, 3.6], [2, 3.6], [4, 5.6], [4, 6]]] },
  S: { w: 4, s: [[[4, 1.5], [4, 1], [3, 0], [1, 0], [0, 1], [0, 2], [1, 3], [3, 3], [4, 4], [4, 5], [3, 6], [1, 6], [0, 5], [0, 4.5]]] },
  T: { w: 4, s: [[[0, 0], [4, 0]], [[2, 0], [2, 6]]] },
  U: { w: 4, s: [[[0, 0], [0, 5], [1, 6], [3, 6], [4, 5], [4, 0]]] },
  V: { w: 4, s: [[[0, 0], [0, 2], [2, 6.4], [4, 2], [4, 0]]] },
  W: { w: 5, s: [[[0, 0], [0, 6], [2.5, 2.4], [5, 6], [5, 0]]] },
  X: { w: 4, s: [[[0, 0], [0, 0.8], [4, 5.2], [4, 6]], [[4, 0], [4, 0.8], [0, 5.2], [0, 6]]] },
  Y: { w: 4, s: [[[0, 0], [0, 1.4], [2, 3.4], [4, 1.4], [4, 0]], [[2, 3.4], [2, 6]]] },
  Z: { w: 4, s: [[[0, 0], [4, 0], [4, 0.8], [0, 5.2], [0, 6], [4, 6]]] },
  0: { w: 4, s: [[[1, 0], [3, 0], [4, 1], [4, 5], [3, 6], [1, 6], [0, 5], [0, 1], 'z']] },
  1: { w: 2.8, s: [[[0, 0], [1.4, 0], [1.4, 6]], [[0, 6], [2.8, 6]]] },
  2: { w: 4, s: [[[0, 1.5], [0, 1], [1, 0], [3, 0], [4, 1], [4, 2.4], [0, 5.2], [0, 6], [4, 6]]] },
  3: { w: 4, s: [[[0, 1.5], [0, 1], [1, 0], [3, 0], [4, 1], [4, 2.2], [3.2, 3], [4, 3.8], [4, 5], [3, 6], [1, 6], [0, 5], [0, 4.5]], [[1.8, 3], [3.2, 3]]] },
  4: { w: 4, s: [[[3.2, 6], [3.2, 0], [2.6, 0], [0, 3.8], [0, 4.4], [4, 4.4]]] },
  5: { w: 4, s: [[[4, 0], [0, 0], [0, 2.6], [3, 2.6], [4, 3.6], [4, 5], [3, 6], [1, 6], [0, 5], [0, 4.5]]] },
  6: { w: 4, s: [[[4, 1.5], [4, 1], [3, 0], [1, 0], [0, 1], [0, 5], [1, 6], [3, 6], [4, 5], [4, 3.6], [3, 2.6], [0, 2.6]]] },
  7: { w: 4, s: [[[0, 0], [4, 0], [4, 0.8], [1.6, 5.2], [1.6, 6]]] },
  8: { w: 4, s: [[[1, 0], [3, 0], [4, 1], [4, 2.2], [3.2, 3], [4, 3.8], [4, 5], [3, 6], [1, 6], [0, 5], [0, 3.8], [0.8, 3], [0, 2.2], [0, 1], 'z'], [[0.8, 3], [3.2, 3]]] },
  9: { w: 4, s: [[[0, 4.5], [0, 5], [1, 6], [3, 6], [4, 5], [4, 1], [3, 0], [1, 0], [0, 1], [0, 2.4], [1, 3.4], [4, 3.4]]] },
  '.': { w: 0, s: [[[0, 5.7], [0, 6]]] },
  ',': { w: 0.6, s: [[[0.6, 5.7], [0.6, 6], [0, 7]]] },
  ':': { w: 0, s: [[[0, 2.1], [0, 2.4]], [[0, 5.7], [0, 6]]] },
  ';': { w: 0, s: [[[0, 1.7], [0, 2.1]], [[0, 3.9], [0, 4.3]]] }, // timer colon, vertically centred
  '-': { w: 2.2, s: [[[0, 3.1], [2.2, 3.1]]] },
  '+': { w: 3, s: [[[0, 3], [3, 3]], [[1.5, 1.5], [1.5, 4.5]]] },
  '·': { w: 0, s: [[[0, 2.9], [0, 3.2]]] },
  '/': { w: 2.6, s: [[[0, 6], [2.6, 0]]] },
  "'": { w: 0, s: [[[0, 0], [0, 1.2]]] },
  '!': { w: 0, s: [[[0, 0], [0, 3.9]], [[0, 5.7], [0, 6]]] },
  '=': { w: 3, s: [[[0, 2.2], [3, 2.2]], [[0, 4], [3, 4]]] },
};

// Lay a string out. (x, y) is the top-left of the outer cap box; `cap` is the
// outer cap height and `sw` the stroke width, so skeleton height is cap - sw.
function layout(str, o) {
  const { cap, sw } = o;
  const u = (cap - sw) / 6;
  let xs = o.xs ?? 1;
  let tr = o.track ?? sw * 0.8 + cap * 0.035;
  const measure = () => {
    let x = 0;
    const parts = [];
    for (const ch of str) {
      if (ch === ' ') {
        x += 2.1 * u * xs + tr;
        continue;
      }
      const g = GLYPHS[ch];
      if (!g) throw new Error(`no glyph for "${ch}" in "${str}"`);
      parts.push({ g, x });
      x += g.w * u * xs + sw + tr;
    }
    return { parts, width: x - tr };
  };
  let m = measure();
  if (o.fit && m.width > o.fit) {
    for (let i = 0; i < 6 && Math.abs(m.width - o.fit) > 0.3; i++) {
      const k = o.fit / m.width;
      xs *= k;
      tr *= k;
      m = measure();
    }
  }
  if (o.justify) {
    const gaps = [...str].length - 1;
    tr += (o.justify - m.width) / gaps;
    m = measure();
  }
  return { ...m, u, ux: u * xs };
}
// Compact number: one decimal, no leading zero.
const f1 = (v) => {
  const r = Math.round(v * 10) / 10;
  return (Object.is(r, -0) ? 0 : r).toString().replace(/^(-?)0\./, '$1.');
};
function pathD(str, x, y, o) {
  const lay = layout(str, o);
  let x0 = x;
  if (o.anchor === 'm') x0 = x - lay.width / 2;
  if (o.anchor === 'e') x0 = x - lay.width;
  const ox = x0 + o.sw / 2;
  const oy = y + o.sw / 2;
  const r1 = (v) => Math.round(v * 10) / 10;
  let d = '';
  for (const { g, x: gx } of lay.parts) {
    for (const stroke of g.s) {
      const closed = stroke[stroke.length - 1] === 'z';
      const pts = closed ? stroke.slice(0, -1) : stroke;
      let cx = 0;
      let cy = 0;
      pts.forEach(([px, py], i) => {
        // every point is rounded in absolute terms, then written as a delta,
        // so rounding never accumulates along a line of text
        const ax = r1(ox + gx + px * lay.ux);
        const ay = r1(oy + py * lay.u);
        if (i === 0) d += `M${f1(ax)} ${f1(ay)}`;
        else {
          const dx = f1(ax - cx);
          const dy = f1(ay - cy);
          if (dy === '0') d += `h${dx}`;
          else if (dx === '0') d += `v${dy}`;
          else d += `l${dx}${dy.startsWith('-') ? '' : ' '}${dy}`;
        }
        cx = ax;
        cy = ay;
      });
      if (closed) d += 'z';
    }
  }
  return { d, x0, width: lay.width };
}

const defs = [];
let clipN = 0;
// Small and medium lettering: one stroked path.
function txt(str, x, y, o) {
  const p = pathD(str, x, y, o);
  const op = o.op ? ` opacity="${o.op}"` : '';
  return { svg: `<path class="t" d="${p.d}" stroke="${o.col}" stroke-width="${o.sw}"${op}/>`, ...p };
}
// Display lettering: long miters clipped to the cap box (flat N/M/V vertices),
// sitting on three wide, faint strokes that stand in for a glow (no filters).
function title(str, x, y, o) {
  const p = pathD(str, x, y, o);
  const id = `c${clipN++}`;
  defs.push(`<path id="p${id}" d="${p.d}"/><clipPath id="${id}"><rect x="${n1(p.x0 - 20)}" y="${y}" width="${n1(p.width + 40)}" height="${o.cap}"/></clipPath>`);
  let svg = '';
  if (o.glow !== false) {
    const k = Math.min(1, o.cap / 86);
    const layers = [[40, 0.022], [28, 0.035], [18, 0.055], [10, 0.085], [4, 0.13]];
    svg += `<g class="gl" stroke="${o.glowCol || o.col}">${layers.map(([w, a]) => `<use href="#p${id}" stroke-width="${n1(o.sw + w * k)}" opacity="${a}"/>`).join('')}</g>`;
  }
  svg += `<g clip-path="url(#${id})"><use class="t tb" href="#p${id}" stroke="${o.col}" stroke-width="${o.sw}"/></g>`;
  return { svg, ...p };
}
// Big ordinal numbers: an outline, made by stroking the same path twice.
function outlined(str, x, y, o) {
  const p = pathD(str, x, y, o);
  const id = `o${clipN++}`;
  defs.push(`<path id="${id}" d="${p.d}"/>`);
  const inner = mix(C.scrTop, o.col, 0.13);
  const svg = `<use class="t tb" href="#${id}" stroke="${o.col}" stroke-width="${o.sw}"/><use class="t tb" href="#${id}" stroke="${inner}" stroke-width="${n1(o.sw - 2 * (o.line || 2.6))}"/>`;
  return { svg, ...p };
}

// ------------------------------------------------------------------ timeline
const css = [];
const trackCache = new Map();
let trackN = 0;
const pc = (t) => `${+((t / T) * 100).toFixed(3)}%`;
function state(s, moves) {
  let out = '';
  if (s.o !== undefined) out += `opacity:${s.o};`;
  if (!moves) return out.slice(0, -1);
  const tf = [];
  const px = (v) => (v ? `${v}px` : '0');
  if (moves.xy) tf.push(s.y ? `translate(${px(s.x)},${px(s.y)})` : `translate(${px(s.x)})`);
  if (moves.sx) tf.push(`scaleX(${s.sx})`);
  return `${out}transform:${tf.join(' ')}`;
}
// frames: [seconds, state, easing to the next frame]
function track(frames) {
  const key = JSON.stringify(frames);
  if (trackCache.has(key)) return trackCache.get(key);
  const has = (k) => frames.some(([, s]) => s[k] !== undefined);
  const moves = has('x') || has('y') || has('sx') ? { xy: has('x') || has('y'), sx: has('sx') } : null;
  const name = `k${(trackN++).toString(36)}`;
  // Keyframes that hold the same state share one rule. An easing only matters
  // on a keyframe whose successor differs, so a rule keeps the one easing its
  // members need; states that need two different easings stay in two rules.
  const rules = new Map();
  const states = frames.map(([, s]) => state(s, moves));
  frames.forEach(([t, , e], i) => {
    const leads = i + 1 < frames.length && states[i + 1] !== states[i];
    if (!rules.has(states[i])) rules.set(states[i], new Map());
    const byEase = rules.get(states[i]);
    const key = leads ? e || '' : null;
    if (!byEase.has(key)) byEase.set(key, []);
    byEase.get(key).push(pc(t));
  });
  let body = '';
  for (const [st, byEase] of rules) {
    const idle = byEase.get(null) || [];
    byEase.delete(null);
    if (!byEase.size) byEase.set('', []);
    let first = true;
    for (const [e, offs] of byEase) {
      const all = (first ? [...offs, ...idle] : offs).sort((a, b) => parseFloat(a) - parseFloat(b));
      first = false;
      body += `${[...new Set(all)].join(',')}{${st}${e ? `;animation-timing-function:${e}` : ''}}`;
    }
  }
  css.push(`@keyframes ${name}{${body}}.${name}{animation:${name} ${T}s linear infinite}`);
  trackCache.set(key, name);
  return name;
}
const E_OUT = 'cubic-bezier(.16,.84,.3,1)';
const E_IN = 'cubic-bezier(.6,0,.9,.45)';
const ST = 'step-end';
const OFF_R = { o: 0, x: 46 };
const OFF_L = { o: 0, x: -34 };
const ON = { o: 1, x: 0 };

// The slide schedule (seconds on the master loop).
const HERO_OUT = 7; // whole seconds: the corner timer counts them down for real
const CD_IN = 7.25;
const CD_TICKS = [8.4, 9.4, 10.4]; // 3 -> 2, 2 -> 1, 1 -> NOW
const CD_OUT = 11.5;
const E_IN_T = [11.75, 16.1, 20.45];
const E_OUT_T = [15.85, 20.2, 24.55];
const END_IN = 24.8;
const END_OUT = 26.9;
const RES_IN = 27.15;
const ROW_T = [30.4, 29.1, 27.8]; // rank 1, 2, 3: last place is revealed first
const CONFETTI = 30.55;
const CHEER = 31.0;
const RES_OUT = 34.6;
const HERO_IN = 34.9;

// A part of a slide that slides in from the right and leaves to the left.
const slideEl = (tIn, tOut, stag = 0) =>
  track([
    [0, OFF_R],
    [tIn + stag, OFF_R, E_OUT],
    [tIn + stag + 0.55, ON],
    [tOut, ON, E_IN],
    [tOut + 0.3, OFF_L],
    [tOut + 0.32, OFF_R],
    [T, OFF_R],
  ]);
// The entry slide is on screen at t = 0, so its track wraps around the loop.
const heroEl = (stag = 0) =>
  track([
    [0, ON],
    [HERO_OUT, ON, E_IN],
    [HERO_OUT + 0.3, OFF_L],
    [HERO_OUT + 0.32, OFF_R],
    [HERO_IN + stag, OFF_R, E_OUT],
    [HERO_IN + stag + 0.55, ON],
    [T, ON],
  ]);
const fade = (tIn, tOut) =>
  track([
    [0, { o: 0 }],
    [tIn, { o: 0 }],
    [tIn + 0.5, { o: 1 }],
    [tOut, { o: 1 }],
    [tOut + 0.35, { o: 0 }],
    [T, { o: 0 }],
  ]);
const heroFade = () =>
  track([
    [0, { o: 1 }],
    [HERO_OUT, { o: 1 }],
    [HERO_OUT + 0.35, { o: 0 }],
    [HERO_IN, { o: 0 }],
    [HERO_IN + 0.5, { o: 1 }],
    [T, { o: 1 }],
  ]);
// Hard on/off between two times (a ticking digit).
const blink = (a, b) =>
  track([
    [0, { o: 0 }, ST],
    [a, { o: 1 }, ST],
    [b, { o: 0 }, ST],
    [T, { o: 0 }],
  ]);

// Elements that are off screen on the still frame carry class "z" (opacity 0);
// their animation overrides it while motion is allowed.
const g = (cls, inner, extra = '') => `<g class="${cls}"${extra}>${inner}</g>`;

// ------------------------------------------------------------------ slide furniture
// Invented party mark: three belts merging into one. A bottleneck.
const logoMark = (x, y) =>
  `<path class="ln" d="M${x} ${y}h8l6 6h12M${x} ${y + 6}h26M${x} ${y + 12}h8l6 -6" stroke="${C.gold}" stroke-width="2.2"/>`;

const STRIP_Y = 38;
const PARTY = txt('BOTTLENECK 2026', L + 36, STRIP_Y, { cap: 13, sw: 2, col: C.gold });
const stripX = PARTY.x0 + PARTY.width;
function stripLabel(label, col = C.dim) {
  const slash = txt('/', stripX + 12, STRIP_Y, { cap: 13, sw: 2, col: C.dim2 });
  const t = txt(label, stripX + 12 + slash.width + 12, STRIP_Y, { cap: 13, sw: 2, col });
  return slash.svg + t.svg;
}
const stripRight = (label, col = C.dim) => txt(label, R, STRIP_Y, { cap: 13, sw: 2, col, anchor: 'e' });

// A wash of stage light along the bottom of the slide, in the slide's colour.
let washN = 0;
function wash(col, strength = 0.2) {
  const id = `w${washN++}`;
  defs.push(`<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${col}" stop-opacity="0"/><stop offset="1" stop-color="${col}" stop-opacity="${strength}"/></linearGradient>`);
  return `<rect x="${SX}" y="${SY + SH - 170}" width="${SW}" height="170" fill="url(#${id})"/>`;
}

// ------------------------------------------------------------------ original emblems and icons
function cogPath(teeth, ro, ri, hole) {
  const pts = [];
  const step = (Math.PI * 2) / teeth;
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    for (const [da, r] of [[-0.3, ri], [-0.17, ro], [0.17, ro], [0.3, ri]]) {
      const ang = a + da * step;
      pts.push(`${n1(Math.cos(ang) * r)} ${n1(Math.sin(ang) * r)}`);
    }
  }
  let d = `M${pts.join('L')}Z`;
  if (hole) d += `M${hole} 0A${hole} ${hole} 0 1 0 ${-hole} 0A${hole} ${hole} 0 1 0 ${hole} 0Z`;
  return d;
}
const hexPts = (r) => [0, 1, 2, 3, 4, 5].map((i) => `${n1(Math.sin((i * Math.PI) / 3) * r)} ${n1(-Math.cos((i * Math.PI) / 3) * r)}`);
// The app's emblem idea (a hexagon with a cog inside), redrawn from scratch.
function emblem(cx, cy, r) {
  const hex = `M${hexPts(r).join('L')}Z`;
  const hex2 = `M${hexPts(r - 9).join('L')}Z`;
  return (
    `<g transform="translate(${cx} ${cy})">` +
    `<path class="gl" d="${hex}" stroke="${C.cyan}" stroke-width="16" opacity=".08"/>` +
    `<path d="${hex}" fill="${mix(C.scrTop, C.cyan, 0.08)}" stroke="${C.cyan}" stroke-width="4.5" stroke-linejoin="miter"/>` +
    `<path d="${hex2}" fill="none" stroke="${C.cyan}" stroke-width="1.4" opacity=".45"/>` +
    `<g class="rot"><path d="${cogPath(8, r * 0.58, r * 0.43, r * 0.17)}" fill="${C.gold}" fill-rule="evenodd"/></g>` +
    `</g>`
  );
}
// Line-art icons for the three tabs, each drawn in a 100 x 100 box.
const ICONS = {
  // Space Elevator: a tether, a pod riding it, a station ring, some stars.
  objectives: (col) =>
    `<g class="ln" stroke="${col}" stroke-width="3.2">` +
    `<path d="M50 6V78"/><ellipse cx="50" cy="15" rx="17" ry="5.5"/>` +
    `<path d="M24 94L34 78H66L76 94Z" fill="${mix(C.scrTop, col, 0.14)}"/><path d="M8 94H92"/>` +
    `<g class="pod"><rect x="43" y="52" width="14" height="17" rx="2.5" fill="${col}"/></g>` +
    `<path d="M17 28v8M13 32h8M84 40v8M80 44h8M22 58v6M19 61h6" stroke-width="2.2" opacity=".7"/></g>`,
  // A recipe card under a magnifier: two ingredients, an arrow, one product.
  items: (col) =>
    `<g class="ln" stroke="${col}" stroke-width="3.2">` +
    `<rect x="4" y="12" width="76" height="60" rx="5" fill="${mix(C.scrTop, col, 0.1)}"/>` +
    `<rect x="14" y="23" width="13" height="13" rx="1.5"/><rect x="14" y="47" width="13" height="13" rx="1.5"/>` +
    `<path d="M35 42H50M45 36.5L50.5 42L45 47.5"/><rect x="58" y="34" width="14" height="16" rx="1.5" fill="${col}"/>` +
    `<circle cx="70" cy="70" r="16.5" fill="${C.scrTop}"/><path d="M82 82L95 95" stroke-width="7"/>` +
    `<path d="M63 70h14M70 63v14" stroke-width="2.4" opacity=".8"/></g>`,
  // A factory: saw-tooth roof, a chimney, two puffs of smoke.
  buildings: (col) =>
    `<g class="ln" stroke="${col}" stroke-width="3.2">` +
    `<path d="M6 94V52L28 39V52L50 39V52L72 39V94Z" fill="${mix(C.scrTop, col, 0.12)}"/>` +
    `<path d="M78 94V26H92V94"/><path d="M2 94H98"/>` +
    `<rect x="17" y="70" width="14" height="24"/><rect x="41" y="66" width="10" height="10" fill="${col}"/><rect x="56" y="66" width="10" height="10" fill="${col}"/>` +
    `<g class="puff"><circle cx="85" cy="15" r="5"/><circle cx="92" cy="4" r="3"/></g></g>`,
};

// ------------------------------------------------------------------ slide 1: the entry slide (on screen at t = 0)
function heroSlide() {
  const out = [];
  out.push(g(heroFade(), wash(C.cyan, 0.2) + stripLabel('COMPANION APP COMPO')));

  // Corner overlay: the countdown to the next competition, shrunk into the corner.
  const tcap = 16;
  const tsw = 2.6;
  // the ticking digit sits centred in a fixed cell so a narrow 1 does not jump
  const cellW = ((tcap - tsw) / 6) * 4 + tsw;
  const digitX = R - 12 - cellW / 2;
  const dOpt = { cap: tcap, sw: tsw, col: C.gold, anchor: 'm' };
  const colon = txt('0;0', digitX - cellW / 2 - 2.7, STRIP_Y - 2, { cap: tcap, sw: tsw, col: C.gold, anchor: 'e' });
  const lab = txt('TAB COMPO IN', colon.x0 - 12, STRIP_Y, { cap: 12, sw: 1.8, col: C.dim, anchor: 'e' });
  let digits = '';
  for (let k = HERO_OUT; k >= 1; k--) {
    const d = txt(String(k), digitX, STRIP_Y - 2, dOpt);
    if (k === HERO_OUT) {
      const cls = track([[0, { o: 1 }, ST], [1, { o: 0 }, ST], [HERO_IN, { o: 1 }, ST], [T, { o: 1 }]]);
      digits += g(cls, d.svg);
    } else {
      digits += g(`z ${blink(HERO_OUT - k, HERO_OUT - k + 1)}`, d.svg);
    }
  }
  digits += g(`z ${blink(HERO_OUT, HERO_OUT + 0.4)}`, txt('0', digitX, STRIP_Y - 2, dOpt).svg);
  const boxX = lab.x0 - 10;
  const box = `<rect x="${n1(boxX)}" y="${STRIP_Y - 9}" width="${n1(R - boxX + 2)}" height="30" rx="3" fill="${mix(C.scrTop, C.gold, 0.07)}" stroke="${C.gold}" stroke-opacity=".45" stroke-width="1.2"/>`;
  out.push(g(heroEl(0.28), box + lab.svg + colon.svg + digits));

  // number, title, author, comment: the four fields of an entry slide, in order
  const num = outlined('01', L, 92, { cap: 100, sw: 15, col: C.gold });
  const rule = `<path d="M${n1(L + num.width + 24)} 96V188" stroke="${C.gold}" stroke-width="2" opacity=".5"/>`;
  out.push(g(heroEl(0), num.svg + rule));
  const ultra = title('ULTRA', L + num.width + 50, 92, { cap: 100, sw: 17, col: C.cyan, track: 15 });
  const emb = emblem(R - 62, 142, 56);
  out.push(g(heroEl(0.07), ultra.svg + emb));
  const sat = title('SATISFACTORY', L, 216, { cap: 86, sw: 14, col: C.white, justify: R - L, glowCol: '#bfe9ff' });
  out.push(g(heroEl(0.14), sat.svg));
  const by = txt('BY', L, 330, { cap: 20, sw: 3, col: C.dim2 });
  const who = txt('LUKEXYZ', L + by.width + 14, 330, { cap: 20, sw: 3, col: C.gold });
  out.push(g(heroEl(0.21), by.svg + who.svg));
  const c1 = txt('EVERY RECIPE, BUILDING AND SPACE ELEVATOR OBJECTIVE, ONE CLICK APART.', L, 369, { cap: 15, sw: 2.2, col: C.white, fit: R - L });
  const c2 = txt('A COMPANION APP FOR SATISFACTORY · UNOFFICIAL FAN PROJECT · RUNS IN A BROWSER TAB', L, 400, { cap: 12, sw: 1.7, col: C.dim, fit: R - L });
  out.push(g(heroEl(0.28), c1.svg + c2.svg));
  return out.join('');
}

// ------------------------------------------------------------------ slide 2: competition countdown, then the NOW cue
function countdownSlide() {
  const out = [];
  const cx = SX + SW / 2;
  out.push(g(`z ${fade(CD_IN, CD_OUT)}`, wash(C.gold, 0.16) + stripLabel('COMING UP')));
  out.push(g(`z ${slideEl(CD_IN, CD_OUT, 0.1)}`, stripRight('SEATS, PLEASE').svg));
  const name = txt('ULTRA-SATISFACTORY', cx, 90, { cap: 17, sw: 2.6, col: C.dim, anchor: 'm', track: 6 });
  const compo = title('TAB COMPO', cx, 124, { cap: 58, sw: 9.5, col: C.white, anchor: 'm', glowCol: '#bfe9ff' });
  out.push(g(`z ${slideEl(CD_IN, CD_OUT, 0)}`, name.svg + compo.svg));

  // One large timer: fixed cells so the digits tick in place.
  const cap = 150;
  const sw = 22;
  const u = (cap - sw) / 6;
  const cell = 4 * u + sw + 22;
  const colonW = sw + 26;
  const total = cell * 4 + colonW - 22;
  const x0 = cx - total / 2;
  const y = 214;
  const cellX = [x0, x0 + cell, x0 + cell * 2 + colonW, x0 + cell * 3 + colonW];
  const digit = (ch, i) => title(ch, cellX[i] + (4 * u + sw) / 2, y, { cap, sw, col: C.gold, anchor: 'm' });
  const colon = title(';', x0 + cell * 2 + (colonW - 22) / 2 - 1, y, { cap, sw, col: C.gold, anchor: 'm' });
  const fixed = digit('0', 0).svg + digit('0', 1).svg + colon.svg + digit('0', 2).svg;
  const ticks = [CD_IN, ...CD_TICKS];
  let timer = g(`z ${blink(0.01, ticks[3])}`, fixed);
  ['3', '2', '1'].forEach((ch, i) => {
    timer += g(`z ${blink(i === 0 ? 0.01 : ticks[i], ticks[i + 1])}`, digit(ch, 3).svg);
  });
  const now = title('NOW', cx, y, { cap, sw, col: C.cyan, anchor: 'm', track: 26 });
  timer += g(`z ${blink(ticks[3], T - 0.01)}`, now.svg);
  out.push(g(`z ${slideEl(CD_IN, CD_OUT, 0.08)}`, timer));
  const sub = txt('THREE ENTRIES. ONE APP. EVERYTHING LINKS.', cx, 392, { cap: 14, sw: 2.1, col: C.dim, anchor: 'm', track: 4.4 });
  out.push(g(`z ${slideEl(CD_IN, CD_OUT, 0.16)}`, sub.svg));
  return out.join('');
}

// ------------------------------------------------------------------ slides 3 to 5: one slide per entry
const ENTRIES = [
  {
    no: '01', name: 'OBJECTIVES', col: C.purple, icon: 'objectives', by: 'ELEVATOR PITCH',
    c1: 'PICK A SPACE ELEVATOR PHASE. SEE THE PARTS IT WANTS, AND HOW MANY.',
    c2: 'CLICK A PART TO OPEN ITS RECIPE',
    pts: 5, stat: '5 PHASES OF', what: '5 SPACE ELEVATOR PHASES',
  },
  {
    no: '02', name: 'ITEMS', col: C.pink, icon: 'items', by: 'CTRL+F COLLECTIVE',
    c1: 'SEARCH AS YOU TYPE. RATES PER MINUTE, MACHINE, CYCLE TIME, POWER DRAW.',
    c2: '211 MACHINE RECIPES IN THE DATA · EVERY INGREDIENT, PRODUCT AND MACHINE IS A LINK',
    pts: 140, stat: '140 CRAFTABLE', what: '140 CRAFTABLE ITEMS',
  },
  {
    no: '03', name: 'BUILDINGS', col: C.blue, icon: 'buildings', by: 'FOUNDATION ISSUES',
    c1: 'EVERY BUILDING AND WHAT IT MAKES, GROUPED BY TIER.',
    c2: 'MK-BY-MK UPGRADE PATHS FOR MINERS, CONVEYORS, PIPELINES AND STORAGE',
    pts: 477, stat: '477 BUILDABLE', what: '477 BUILDINGS',
  },
];
function entrySlide(i) {
  const e = ENTRIES[i];
  const tIn = E_IN_T[i];
  const tOut = E_OUT_T[i];
  const out = [];
  // the strip label is shared by the three entry slides and the results
  const pipsW = 3 * 12 + 2 * 7;
  let pips = '';
  for (let k = 0; k < 3; k++) {
    const px = R - pipsW + k * 19;
    pips += `<rect x="${px}" y="${STRIP_Y + 0.5}" width="12" height="12" ${k === i ? `fill="${e.col}"` : `fill="none" stroke="${C.dim2}" stroke-width="1.6"`}/>`;
  }
  const lab = txt(`ENTRY ${i + 1} OF 3`, R - pipsW - 14, STRIP_Y, { cap: 13, sw: 2, col: C.dim, anchor: 'e' });
  out.push(g(`z ${fade(tIn, tOut)}`, wash(e.col, 0.22) + lab.svg + pips));
  const num = outlined(e.no, L, 92, { cap: 100, sw: 15, col: e.col });
  const rule = `<path d="M${n1(L + num.width + 24)} 96V188" stroke="${e.col}" stroke-width="2" opacity=".5"/>`;
  const tag = txt('NOW SHOWING', L + num.width + 48, 100, { cap: 15, sw: 2.3, col: C.dim, track: 5 });
  const tag2 = txt(e.stat, L + num.width + 48, 136, { cap: 38, sw: 6, col: C.white, track: 8 });
  out.push(g(`z ${slideEl(tIn, tOut, 0)}`, num.svg + rule + tag.svg + tag2.svg));
  out.push(g(`z ${slideEl(tIn, tOut, 0.07)}`, `<g transform="translate(${R - 112} 86) scale(1.12)">${ICONS[e.icon](e.col)}</g>`));
  const name = title(e.name, L, 216, { cap: 86, sw: 14, col: e.col, track: 13 });
  out.push(g(`z ${slideEl(tIn, tOut, 0.14)}`, name.svg));
  const by = txt('BY', L, 330, { cap: 20, sw: 3, col: C.dim2 });
  const who = txt(e.by, L + by.width + 14, 330, { cap: 20, sw: 3, col: C.white });
  out.push(g(`z ${slideEl(tIn, tOut, 0.21)}`, by.svg + who.svg));
  const c1 = txt(e.c1, L, 369, { cap: 15, sw: 2.2, col: C.white, fit: R - L });
  const c2 = txt(e.c2, L, 400, { cap: 12, sw: 1.7, col: C.dim, fit: R - L });
  out.push(g(`z ${slideEl(tIn, tOut, 0.28)}`, c1.svg + c2.svg));
  return out.join('');
}

// ------------------------------------------------------------------ slide 6: end of compo (the outro that closes a competition display)
function outroSlide() {
  const out = [];
  const cx = SX + SW / 2;
  out.push(g(`z ${fade(END_IN, END_OUT)}`, wash(C.gold, 0.16)));
  out.push(g(`z ${slideEl(END_IN, END_OUT, 0.1)}`, stripRight('END OF COMPO').svg));
  const name = txt('THAT WAS THE', cx, 90, { cap: 17, sw: 2.6, col: C.dim, anchor: 'm', track: 6 });
  const compo = title('TAB COMPO', cx, 124, { cap: 58, sw: 9.5, col: C.white, anchor: 'm', glowCol: '#bfe9ff' });
  out.push(g(`z ${slideEl(END_IN, END_OUT, 0)}`, name.svg + compo.svg));
  const end = title('END', cx, 214, { cap: 150, sw: 22, col: C.gold, anchor: 'm', track: 26 });
  out.push(g(`z ${slideEl(END_IN, END_OUT, 0.08)}`, end.svg));
  const sub = txt('VOTING IS CLOSED. IT NEVER OPENED. THE BELT DECIDES.', cx, 392, { cap: 14, sw: 2.1, col: C.dim, anchor: 'm', track: 4.4 });
  out.push(g(`z ${slideEl(END_IN, END_OUT, 0.16)}`, sub.svg));
  return out.join('');
}

// ------------------------------------------------------------------ slide 7: prize-giving, last place first
function resultsSlide() {
  const out = [];
  // strip label for every TAB COMPO slide (entries, end of compo, results)
  out.push(g(`z ${fade(E_IN_T[0], RES_OUT)}`, stripLabel('ULTRA-SATISFACTORY TAB COMPO')));
  out.push(g(`z ${fade(RES_IN, RES_OUT)}`, wash(C.gold, 0.18) + stripRight('PRIZEGIVING', C.gold).svg));
  const head = title('RESULTS', L, 86, { cap: 40, sw: 6.6, col: C.white, track: 9, glowCol: '#bfe9ff' });
  const note = txt('1 POINT PER THING IN THE TAB. COUNTED, NOT VOTED.', R, 100, { cap: 12, sw: 1.7, col: C.dim, anchor: 'e' });
  out.push(g(`z ${slideEl(RES_IN, RES_OUT, 0)}`, head.svg + note.svg));

  const ranked = [...ENTRIES].sort((a, b) => b.pts - a.pts);
  const top = ranked[0].pts;
  const barX = L + 96;
  const barW = R - barX;
  ranked.forEach((e, r) => {
    const y = 148 + r * 90;
    const t = ROW_T[r];
    const rowCls = track([
      [0, { o: 0, y: 16 }],
      [t, { o: 0, y: 16 }, E_OUT],
      [t + 0.5, { o: 1 }],
      [RES_OUT, { o: 1 }, E_IN],
      [RES_OUT + 0.3, { o: 0, x: -34 }],
      [RES_OUT + 0.32, { o: 0, y: 16 }],
      [T, { o: 0, y: 16 }],
    ]);
    const barCls = track([
      [0, { sx: 0 }],
      [t + 0.25, { sx: 0 }, E_OUT],
      [t + 1.3, { sx: 1 }],
      [RES_OUT + 0.4, { sx: 1 }],
      [RES_OUT + 0.42, { sx: 0 }],
      [T, { sx: 0 }],
    ]);
    const rank = outlined(String(r + 1), L + 8, y, { cap: 66, sw: 11, col: e.col, line: 2.2 });
    const dot = `<rect x="${n1(L + 8 + rank.width + 9)}" y="${y + 55}" width="11" height="11" fill="${e.col}"/>`;
    const name = txt(e.name, barX, y + 2, { cap: 30, sw: 5, col: C.white, track: 7 });
    const by = txt(`BY ${e.by}`, barX + name.width + 20, y + 17, { cap: 12, sw: 1.7, col: C.dim });
    const what = txt(e.what, R - 8, y + 52.5, { cap: 9.5, sw: 1.5, col: r === 0 ? '#06202e' : C.dim, anchor: 'e', track: 2.4 });
    const pts = txt(`${e.pts} PTS`, R, y + 2, { cap: 30, sw: 5, col: e.col, anchor: 'e', track: 7 });
    // the bar: this entry's share of the top score
    const bw = Math.max(1, (barW * e.pts) / top);
    const trackRect = `<rect x="${barX}" y="${y + 48}" width="${barW}" height="18" fill="${mix(C.scrTop, '#ffffff', 0.06)}"/>`;
    const bar = `<g transform="translate(${barX} ${y + 48})"><rect class="${barCls}" width="${n1(bw)}" height="18" fill="${e.col}"/></g>`;
    out.push(g(`z ${rowCls}`, rank.svg + dot + name.svg + by.svg + pts.svg + trackRect + bar + what.svg));
  });
  return out.join('');
}

// ------------------------------------------------------------------ confetti for the winner (projected, so it stays on the screen)
function confetti() {
  const cols = [C.cyan, C.gold, C.purple, C.pink, C.blue, C.white];
  let out = '';
  for (let i = 0; i < 46; i++) {
    const x = SX + 20 + randFx() * (SW - 40);
    const t0 = CONFETTI + (i % 3) * 0.2;
    const dur = 2.0 + (Math.floor(i / 3) % 2) * 0.45;
    const cls = track([
      [0, { o: 0, y: -14 }],
      [t0, { o: 0, y: -14 }],
      [t0 + 0.08, { o: 1, y: 0 }, 'cubic-bezier(.3,.1,.75,.8)'],
      [t0 + dur, { o: 1, y: 430 }],
      [t0 + dur + 0.2, { o: 0, y: 456 }],
      [T, { o: 0, y: -14 }],
    ]);
    const w = 6 + Math.floor(randFx() * 4);
    const h = 10 + Math.floor(randFx() * 6);
    const col = cols[Math.floor(randFx() * cols.length)];
    const lean = n1((randFx() - 0.5) * 12);
    out += `<g transform="translate(${n1(x)} ${SY + 6 + Math.floor(randFx() * 30)}) rotate(${lean})"><g class="z ${cls}"><rect class="sp${i % 4}" x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" fill="${col}"/></g></g>`;
  }
  return out;
}

// ------------------------------------------------------------------ the hall: two rows of sceners, seen from behind
// The rim light on heads and shoulders is the slide itself: it takes on each
// slide's colour (class rf for the far row, rn for the near row), and so does
// the light that spills onto the floor under the screen (class sl).
const rimFar = (col) => mix('#26343f', col, 0.24);
const rimNear = (col) => mix('#141d27', col, 0.15);
const RIM_FAR = rimFar(C.cyan);
const RIM_NEAR = rimNear(C.cyan);
const spillCol = (col) => mix('#8aa0b4', col, 0.55);
const RIM_CHEER = [rimFar(C.gold), rimNear(C.gold)]; // arms only go up during the prize-giving
function rimCss(name, fn, prop = 'fill') {
  const spans = [
    [0, HERO_OUT, C.cyan],
    [CD_IN, CD_OUT, C.gold],
    ...ENTRIES.map((e, i) => [E_IN_T[i], E_OUT_T[i], e.col]),
    [END_IN, RES_OUT, C.gold],
    [HERO_IN, T, C.cyan],
  ];
  const byCol = new Map();
  for (const [a, b, col] of spans) {
    if (!byCol.has(col)) byCol.set(col, []);
    byCol.get(col).push(a === 0 ? '0%' : pc(a + 0.5), b === T ? '100%' : pc(b));
  }
  const body = [...byCol].map(([col, offs]) => `${offs.join(',')}{${prop}:${fn(col)}}`).join('');
  return `@keyframes ${name}{${body}}.${name}{animation:${name} ${T}s linear infinite}`;
}
const FAR = '#05080d';
const NEAR = '#010203';
function personShapes(r, variant, flip) {
  const f = flip ? -1 : 1;
  const p = (a, b) => `${n1(a * r * f)} ${n1(b * r)}`;
  const bottom = 140;
  let s = `<ellipse cx="0" cy="${n1(-r)}" rx="${n1(r * 0.84)}" ry="${n1(r)}"/>`;
  s += `<path d="M${p(-2.5, 0)}m0 ${bottom}V${n1(r * 1.5)}C${p(-2.5, 0.7)} ${p(-1.3, 0.4)} ${p(-0.45, 0.22)}L${p(-0.42, -0.4)}L${p(0.42, -0.4)}L${p(0.45, 0.22)}C${p(1.3, 0.4)} ${p(2.5, 0.7)} ${n1(2.5 * r * f)} ${n1(r * 1.5)}v${bottom}Z"/>`;
  switch (variant) {
    case 1: // baseball cap
      s += `<path d="M${p(-0.92, -1.2)}Q${p(-0.95, -2.2)} ${p(0, -2.16)}Q${p(0.95, -2.2)} ${p(0.92, -1.2)}Z"/><path d="M${p(0.5, -1.5)}h${n1(1.0 * r * f)}v${n1(0.24 * r)}h${n1(-1.0 * r * f)}Z"/>`;
      break;
    case 2: // headphones
      s += `<path d="M${p(-1.12, -0.9)}A${n1(1.12 * r)} ${n1(1.22 * r)} 0 0 ${flip ? 0 : 1} ${p(1.12, -0.9)}L${p(0.9, -0.9)}A${n1(0.9 * r)} ${n1(1.0 * r)} 0 0 ${flip ? 1 : 0} ${p(-0.9, -0.9)}Z"/>`;
      s += `<rect x="${n1(-1.22 * r)}" y="${n1(-1.35 * r)}" width="${n1(0.42 * r)}" height="${n1(0.8 * r)}" rx="${n1(0.12 * r)}"/><rect x="${n1(0.8 * r)}" y="${n1(-1.35 * r)}" width="${n1(0.42 * r)}" height="${n1(0.8 * r)}" rx="${n1(0.12 * r)}"/>`;
      break;
    case 3: // spikes
      s += `<path d="M${p(-0.8, -1.5)}L${p(-0.62, -2.4)}L${p(-0.3, -1.8)}L${p(0, -2.55)}L${p(0.3, -1.8)}L${p(0.62, -2.4)}L${p(0.8, -1.5)}Z"/>`;
      break;
    case 4: // bun
      s += `<circle cx="0" cy="${n1(-2.2 * r)}" r="${n1(0.4 * r)}"/>`;
      break;
    case 5: // ponytail
      s += `<ellipse cx="${n1(0.98 * r * f)}" cy="${n1(-0.75 * r)}" rx="${n1(0.3 * r)}" ry="${n1(0.7 * r)}"/>`;
      break;
    case 6: // beanie with a bobble
      s += `<path d="M${p(-0.92, -1.15)}Q${p(-0.98, -2.2)} ${p(0, -2.18)}Q${p(0.98, -2.2)} ${p(0.92, -1.15)}Z"/><circle cx="0" cy="${n1(-2.3 * r)}" r="${n1(0.27 * r)}"/>`;
      break;
    case 7: // long hair
      s += `<path d="M${p(-0.98, -1.3)}Q${p(-1.05, -2.15)} ${p(0, -2.12)}Q${p(1.05, -2.15)} ${p(0.98, -1.3)}L${p(1.12, 0.25)}L${p(-1.12, 0.25)}Z"/>`;
      break;
    default:
  }
  return s;
}
// Arms that go up when first place is announced.
function arms(r, both, flip, fill, rim, D, v) {
  const f = flip ? -1 : 1;
  const d0 = v * 0.13;
  const cls = track([
    [0, { o: 0, y: D }],
    [CHEER + d0, { o: 0, y: D }, E_OUT],
    [CHEER + d0 + 0.45, { o: 1 }, 'ease-in-out'],
    [CHEER + d0 + 0.9, { o: 1, y: -5 }, 'ease-in-out'],
    [CHEER + d0 + 1.35, { o: 1 }, 'ease-in-out'],
    [CHEER + d0 + 1.8, { o: 1, y: -5 }, 'ease-in-out'],
    [CHEER + d0 + 2.2, { o: 1 }, E_IN],
    [CHEER + d0 + 2.6, { o: 0, y: D }],
    [T, { o: 0, y: D }],
  ]);
  const one = (side) => {
    const hx = side * 2.05 * r;
    const d = `M${n1(side * 1.7 * r)} ${n1(1.5 * r)}L${n1(side * 2.75 * r)} ${n1(-0.5 * r)}L${n1(hx)} ${n1(-2.6 * r)}`;
    const w = n1(0.72 * r);
    const hand = (dy, col) => `<circle cx="${n1(hx - side * 0.1 * r)}" cy="${n1(-2.95 * r + dy)}" r="${n1(0.43 * r)}" fill="${col}"/>`;
    return (
      `<path d="${d}" stroke="${rim}" stroke-width="${w}" transform="translate(${-side * 1.2} -1.3)"/>${hand(-1.3, rim)}` +
      `<path d="${d}" stroke="${fill}" stroke-width="${w}"/>${hand(0, fill)}`
    );
  };
  return `<g class="z ${cls}" fill="none" stroke-linecap="round" stroke-linejoin="round">${one(f)}${both ? one(-f) : ''}</g>`;
}
// Someone filming the big screen, as someone always is.
function phone(r, flip, fill, rim) {
  const f = flip ? -1 : 1;
  const hx = f * 2.2 * r;
  const d = `M${n1(f * 1.7 * r)} ${n1(1.5 * r)}L${n1(hx)} ${n1(-1.2 * r)}`;
  const w = n1(0.6 * r);
  const pw = 1.05 * r;
  const ph = 1.7 * r;
  const px = hx - pw / 2;
  const py = -2.9 * r;
  return (
    `<g fill="none" stroke-linecap="round"><path d="${d}" stroke="${rim}" stroke-width="${w}" transform="translate(${-f * 1.2} -1.3)"/><path d="${d}" stroke="${fill}" stroke-width="${w}"/></g>` +
    `<rect x="${n1(px - 1)}" y="${n1(py - 1)}" width="${n1(pw + 2)}" height="${n1(ph + 2)}" rx="2" fill="${rim}"/>` +
    `<rect x="${n1(px)}" y="${n1(py)}" width="${n1(pw)}" height="${n1(ph)}" rx="1.5" fill="${fill}"/>` +
    `<rect x="${n1(px + 1.5)}" y="${n1(py + 1.5)}" width="${n1(pw - 3)}" height="${n1(ph - 3)}" fill="#0c2a3a"/>` +
    `<rect x="${n1(px + 3)}" y="${n1(py + ph * 0.3)}" width="${n1(pw - 6)}" height="${n1(ph * 0.12)}" fill="${C.cyan}" opacity=".9"/>` +
    `<rect x="${n1(px + 3)}" y="${n1(py + ph * 0.5)}" width="${n1(pw - 6)}" height="${n1(ph * 0.1)}" fill="#dff6ff" opacity=".9"/>`
  );
}
function crowd() {
  let out = '';
  const bobs = 6;
  // far row: small heads that overlap the bottom edge of the screen
  const far = [];
  for (let x = 14; x < W - 6; x += 38 + rand() * 12) far.push(x);
  far.forEach((x, i) => {
    const r = 10 + rand() * 2.6;
    const y = 477 + (rand() - 0.5) * 12;
    const variant = Math.floor(rand() * 9);
    const flip = rand() < 0.5;
    const shapes = personShapes(r, variant, flip);
    let extra = '';
    const roll = rand();
    if (i === 5) extra = phone(r, false, FAR, RIM_FAR);
    else if (roll < 0.34) extra = arms(r, rand() < 0.6, flip, FAR, RIM_CHEER[0], 46, i % 4);
    defs.push(`<g id="f${i}">${shapes}</g>`);
    out += `<g transform="translate(${n1(x)} ${n1(y)})"><g class="b${i % bobs}">${extra}<use class="rf" href="#f${i}" y="-1.4" fill="${RIM_FAR}"/><use href="#f${i}" fill="${FAR}"/></g></g>`;
  });
  // near row: big, dark, cropped by the bottom of the frame
  const near = [];
  for (let x = 38; x < W - 20; x += 78 + rand() * 30) near.push(x);
  near.forEach((x, i) => {
    const r = 19 + rand() * 4.5;
    const y = 531 + (rand() - 0.5) * 16;
    const variant = Math.floor(rand() * 9);
    const flip = rand() < 0.5;
    const shapes = personShapes(r, variant, flip);
    let extra = '';
    const roll = rand();
    if (i === 8) extra = phone(r, true, NEAR, RIM_NEAR);
    else if (roll < 0.45) extra = arms(r, rand() < 0.5, flip, NEAR, RIM_CHEER[1], 96, (i + 2) % 4);
    defs.push(`<g id="n${i}">${shapes}</g>`);
    out += `<g transform="translate(${n1(x)} ${n1(y)})"><g class="b${(i + 3) % bobs}">${extra}<use class="rn" href="#n${i}" y="-1.6" fill="${RIM_NEAR}"/><use href="#n${i}" fill="${NEAR}"/></g></g>`;
  });
  return out;
}

// ------------------------------------------------------------------ assemble
const slides = heroSlide() + countdownSlide() + resultsSlide() + entrySlide(0) + entrySlide(1) + entrySlide(2) + outroSlide();
const fx = confetti();
const people = crowd();

// The beamer's auto-advance: a gold line under the strip fills once per slide.
const slideSpans = [[CD_IN, CD_OUT], [E_IN_T[0], E_OUT_T[0]], [E_IN_T[1], E_OUT_T[1]], [E_IN_T[2], E_OUT_T[2]], [END_IN, END_OUT], [RES_IN, RES_OUT]];
const heroSpan = HERO_OUT + T - HERO_IN;
const progFrames = [[0, { sx: n2((T - HERO_IN) / heroSpan) }], [HERO_OUT, { sx: 1 }]];
for (const [a, b] of slideSpans) progFrames.push([a, { sx: 0 }], [b, { sx: 1 }]);
progFrames.push([HERO_IN, { sx: 0 }], [T, { sx: n2((T - HERO_IN) / heroSpan) }]);
const progress = `<g transform="translate(${L} 65)"><rect class="${track(progFrames)}" width="${R - L}" height="2" fill="${C.gold}"/></g>`;

// PA line arrays hanging either side of the screen, barely lit.
function lineArray(cx, dir) {
  let out = `<path d="M${cx - 4} 0V24M${cx + 4} 0V24" stroke="#1a2430" stroke-width="1"/><rect x="${cx - 11}" y="22" width="22" height="5" fill="#121a24"/>`;
  let y = 28;
  for (let k = 0; k < 9; k++) {
    const lean = k * k * 0.11 * dir;
    const x = cx - 10 + lean;
    out += `<path d="M${n1(x)} ${y}h20l${n1(-dir * 0.8)} 21h-20z" fill="#0a0f16"/><path d="M${n1(x + (dir > 0 ? 20 : 0))} ${y}l${n1(-dir * 0.8)} 21" stroke="#22344a" stroke-width="1.2"/><path d="M${n1(x + 4)} ${y + 6}h12M${n1(x + 4)} ${y + 11}h12M${n1(x + 4)} ${y + 16}h12" stroke="#141d29" stroke-width="1.4"/>`;
    y += 23;
  }
  return out;
}
const pa = lineArray(15, 1) + lineArray(W - 15, -1);

// faint hexagon grid on the slide background
const HR = 17;
const HWd = n2(Math.sqrt(3) * HR);
const hexTile = `M0 ${HR / 2}L${n2(HWd / 2)} 0L${HWd} ${HR / 2}M0 ${HR / 2}V${1.5 * HR}L${n2(HWd / 2)} ${2 * HR}L${HWd} ${1.5 * HR}M${n2(HWd / 2)} ${2 * HR}V${3 * HR}`;

const baseCss = [
  `.t{fill:none;stroke-linecap:square;stroke-linejoin:miter;stroke-miterlimit:1.5}`,
  `.tb{stroke-miterlimit:12}`,
  `.gl{fill:none;stroke-linecap:round;stroke-linejoin:round}`,
  `.ln{fill:none;stroke-linecap:round;stroke-linejoin:round}`,
  `.z{opacity:0}`,
  `@keyframes rot{to{transform:rotate(360deg)}}`,
  `.rot{animation:rot 16s linear infinite}`,
  `.rot2{animation:rot 180s linear infinite}`,
  `.sp0{animation:rot 1.1s linear infinite}.sp1{animation:rot 1.7s linear infinite reverse}.sp2{animation:rot .8s linear infinite reverse}.sp3{animation:rot 1.4s linear infinite}`,
  `@keyframes pod{0%,100%{transform:translateY(0)}50%{transform:translateY(-20px)}}`,
  `.pod{animation:pod 3.6s ease-in-out infinite}`,
  `@keyframes puff{0%{transform:translate(0,4px);opacity:0}30%{opacity:1}100%{transform:translate(5px,-9px);opacity:0}}`,
  `.puff{animation:puff 1.8s ease-out infinite}`,
  `@keyframes bob{to{transform:translateY(-1.8px)}}`,
  ...[2.3, 3.1, 2.7, 3.7, 2.1, 3.3].map((d, i) => `.b${i}{animation:bob ${d}s ease-in-out ${n2(-d * 0.37 * i)}s infinite alternate}`),
  `@keyframes lamp{0%,100%{opacity:.55}50%{opacity:1}}`,
  `.lamp{animation:lamp 5s ease-in-out infinite}`,
  rimCss('rf', rimFar),
  rimCss('rn', rimNear),
  rimCss('sl', spillCol, 'stop-color'),
];
const reduced = `@media (prefers-reduced-motion:reduce){*{animation:none!important}}`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="ULTRA-SATISFACTORY on the big screen at a demoparty: entry 01 in the companion app compo">
<title>ULTRA-SATISFACTORY: compo slides on the big screen</title>
<style>${baseCss.join('')}${css.join('')}${reduced}</style>
<defs>
<linearGradient id="scr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.scrTop}"/><stop offset="1" stop-color="${C.scrBot}"/></linearGradient>
<radialGradient id="halo" cx=".5" cy=".5" r=".5"><stop offset=".55" stop-color="#3aa8d8" stop-opacity=".2"/><stop offset="1" stop-color="#3aa8d8" stop-opacity="0"/></radialGradient>
<linearGradient id="spill" x1="0" y1="0" x2="0" y2="1"><stop class="sl" offset="0" stop-color="${spillCol(C.cyan)}" stop-opacity=".16"/><stop class="sl" offset="1" stop-color="${spillCol(C.cyan)}" stop-opacity="0"/></linearGradient>
<radialGradient id="vig" cx=".5" cy=".45" r=".75"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".5"/></radialGradient>
<pattern id="hex" width="${HWd}" height="${3 * HR}" patternUnits="userSpaceOnUse"><path d="${hexTile}" fill="none" stroke="#9fd8ff" stroke-opacity=".05" stroke-width="1"/></pattern>
<clipPath id="screen"><rect x="${SX}" y="${SY}" width="${SW}" height="${SH}"/></clipPath>
<clipPath id="panel"><rect width="${W}" height="${H}" rx="14"/></clipPath>
${defs.join('')}
</defs>
<g clip-path="url(#panel)">
<rect width="${W}" height="${H}" fill="${C.hall}"/>
${pa}
<ellipse class="lamp" cx="${SX + SW / 2}" cy="${SY + SH / 2}" rx="${SW * 0.62}" ry="${SH * 0.72}" fill="url(#halo)"/>
<rect x="${SX}" y="${SY}" width="${SW}" height="${SH}" fill="url(#scr)"/>
<g clip-path="url(#screen)">
<rect x="${SX}" y="${SY}" width="${SW}" height="${SH}" fill="url(#hex)"/>
<g transform="translate(${SX + SW - 40} ${SY + SH - 10})"><g class="rot2"><path d="${cogPath(14, 250, 214, 120)}" fill="none" stroke="#9fd8ff" stroke-opacity=".07" stroke-width="2"/></g></g>
${logoMark(L, STRIP_Y)}${PARTY.svg}
<path d="M${L} 66H${R}" stroke="#fff" stroke-opacity=".13" stroke-width="1.2"/>${progress}
${slides}
${fx}
<rect x="${SX}" y="${SY}" width="${SW}" height="${SH}" fill="url(#vig)"/>
</g>
<rect x="0" y="${SY + SH}" width="${W}" height="60" fill="url(#spill)"/>
${people}
</g>
</svg>
`;

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, svg);
console.log(`wrote ${OUT} (${(svg.length / 1024).toFixed(1)} KB, ${trackN} tracks)`);
