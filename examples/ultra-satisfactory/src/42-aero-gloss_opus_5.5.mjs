#!/usr/bin/env node
// "Aero gloss" README banner for ULTRA-SATISFACTORY (style catalogue entry vap-10:
// Frutiger Aero and the Web 2.0 look, about 2005-2013).
//
//   node examples/ultra-satisfactory/src/42-aero-gloss_opus_5.5.mjs
//
// Regenerates, next to this file in ../assets/:
//   42-aero-gloss_opus_5.5.svg             the banner
//   42-aero-gloss_opus_5.5-btn-live.svg    glass buttons for the link row under it
//   42-aero-gloss_opus_5.5-btn-run.svg
//   42-aero-gloss_opus_5.5-btn-inside.svg
//   42-aero-gloss_opus_5.5-btn-built.svg
//   42-aero-gloss_opus_5.5-tags.svg        a tag cloud of items, sized by output per minute
// Plain Node, no dependencies, deterministic (seeded PRNG, no clock). The .md beside the
// assets is hand-written, not generated.
//
// The style, as the catalogue lists it: a sky-blue to white gradient with a curved strip of
// green along the bottom, a big friendly lowercase wordmark with a "wet table" reflection,
// a starburst badge rotated a few degrees, glass buttons (a lighter band across the top that
// ends in a hard edge), a translucent window frame, bubbles with a rim highlight, a lens
// flare and soft aurora ribbons. The photographs the style is remembered for (grass macros,
// water, fish) cannot be carried by an SVG in an <img>, so everything here is gradients and
// highlights. Nothing is copied from any real interface: no operating-system logos, no
// wallpapers, no real product wordmarks. The letterforms are this file's own rounded
// monoline font, and the orb emblem is the app's own hexagon with a cog in it.
//
// How it is built
//   Lettering: one stroke font (below), drawn as <path> with round caps and joins. The
//   wordmark is the same font at a heavy weight, layered: a dark rim, a gradient body, then
//   a white copy clipped to the top half so the gloss ends in a hard edge. The reflection is
//   the same group flipped with <use> under a gradient mask.
//   Soft things without filters: the aurora is one sine path stroked seven times at falling
//   widths and low opacity (a cheap gaussian profile); shadows are stacked translucent
//   rects. There is no feGaussianBlur anywhere, so the animation stays cheap.
//   Glass: the window frame has no backdrop blur either; soft radial gradients clipped to the
//   frame stand in for blurred colour showing through, under diagonal glare bands.
//   Motion: CSS keyframes only. Bubbles rise on one shared keyframe with a negative delay
//   each; every element also carries its resting position as a plain transform attribute,
//   so with prefers-reduced-motion (animation: none) the banner is the same complete frame.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const ASSETS = path.join(here, '..', 'assets');
const SLUG = '42-aero-gloss_opus_5.5';

// ------------------------------------------------------------------------------ helpers
const r1 = (n) => { const s = (Math.round(n * 10) / 10).toString(); return s === '-0' ? '0' : s; };
const r2 = (n) => { const s = (Math.round(n * 100) / 100).toString(); return s === '-0' ? '0' : s; };
function makeRng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ------------------------------------------------------------------------------ the font
// A rounded monoline sans. Glyph box: baseline y = 0, x-height -100, cap height -140,
// ascender -150, descender +45 (y grows downwards, as in SVG). Each entry is
// [advance, path, sides]; the path uses absolute M L H V C A Z only, plus "D x,y" for a dot
// (a zero-length round-capped stroke). `sides` classes the left and right edge for spacing:
// s = straight stem, o = round, v = open or diagonal.
const BOWL_L = 'M100,-50 A50,50 0 1 1 0,-50 A50,50 0 1 1 100,-50';   // drawn from the right
const BOWL_R = 'M0,-50 A50,50 0 1 1 100,-50 A50,50 0 1 1 0,-50';     // drawn from the left
const CAP_O = 'M0,-70 A64,70 0 1 1 128,-70 A64,70 0 1 1 0,-70';
const FONT = {
  a: [92, 'M9,-79 C16,-92 30,-100 50,-100 C76,-100 92,-86 92,-62 V0 M92,-57 H48 C20,-57 4,-46 4,-28 C4,-11 18,0 40,0 C68,0 92,-14 92,-42', 'os'],
  b: [100, `M0,-150 V0 ${BOWL_R}`, 'so'],
  c: [90, 'M88.3,-82.1 A50,50 0 1 0 88.3,-17.9', 'ov'],
  d: [100, `M100,-150 V0 ${BOWL_L}`, 'os'],
  e: [100, 'M0,-50 H100 A50,50 0 1 0 88.3,-17.9', 'oo'],
  f: [62, 'M66,-147 C62,-149 58,-150 53,-150 C36,-150 26,-140 26,-120 V0 M0,-100 H60', 'vv'],
  g: [100, `M100,-100 V6 C100,31 83,45 56,45 C38,45 23,40 12,30 ${BOWL_L}`, 'os'],
  h: [88, 'M0,-150 V0 M0,-56 A44,44 0 0 1 88,-56 V0', 'ss'],
  i: [0, 'M0,-100 V0 D0,-143', 'ss'],
  j: [30, 'M30,-100 V12 C30,33 20,45 0,45 D30,-143', 'vs'],
  k: [80, 'M0,-150 V0 M76,-100 L0,-38 M30,-62 L80,0', 'sv'],
  l: [0, 'M0,-150 V0', 'ss'],
  m: [148, 'M0,-100 V0 M0,-63 A37,37 0 0 1 74,-63 V0 M74,-63 A37,37 0 0 1 148,-63 V0', 'ss'],
  n: [88, 'M0,-100 V0 M0,-56 A44,44 0 0 1 88,-56 V0', 'ss'],
  o: [100, BOWL_R, 'oo'],
  p: [100, `M0,-100 V45 ${BOWL_R}`, 'so'],
  q: [100, `M100,-100 V45 ${BOWL_L}`, 'os'],
  r: [56, 'M0,-100 V0 M0,-56 A44,44 0 0 1 56,-98.3', 'sv'],
  s: [78, 'M74,-79 C68,-92 56,-100 40,-100 C20,-100 6,-90 6,-74 C6,-58 18,-54 40,-50 C62,-46 76,-42 76,-26 C76,-10 62,0 40,0 C22,0 8,-7 2,-21', 'oo'],
  t: [64, 'M26,-142 V-30 C26,-10 36,0 54,0 C59,0 63,-1 66,-3 M0,-100 H60', 'vv'],
  u: [88, 'M0,-100 V-44 A44,44 0 0 0 88,-44 M88,-100 V0', 'ss'],
  v: [84, 'M0,-100 L42,0 L84,-100', 'vv'],
  w: [128, 'M0,-100 L32,0 L64,-100 L96,0 L128,-100', 'vv'],
  x: [80, 'M0,-100 L80,0 M80,-100 L0,0', 'vv'],
  y: [86, 'M0,-100 L44,-2 M86,-100 L32,28 C26,40 17,45 4,45', 'vv'],
  z: [78, 'M0,-100 H76 L0,0 H78', 'vv'],
  A: [108, 'M0,0 L54,-140 L108,0 M20,-46 H88', 'vv'],
  B: [88, 'M0,0 V-140 H48 A34,34 0 0 1 48,-72 H0 M48,-72 H52 A36,36 0 0 1 52,0 H0', 'so'],
  C: [114, 'M112.4,-113.1 A64,70 0 1 0 112.4,-26.9', 'ov'],
  D: [112, 'M0,0 V-140 H42 A70,70 0 0 1 42,0 H0', 'so'],
  E: [78, 'M78,-140 H0 V0 H78 M0,-72 H64', 'sv'],
  F: [76, 'M76,-140 H0 V0 M0,-70 H60', 'sv'],
  G: [128, 'M112.4,-113.1 A64,70 0 1 0 128,-70 H74', 'os'],
  H: [100, 'M0,-140 V0 M100,-140 V0 M0,-72 H100', 'ss'],
  I: [0, 'M0,-140 V0', 'ss'],
  J: [58, 'M58,-140 V-32 C58,-12 46,0 28,0 C14,0 4,-8 0,-20', 'vs'],
  K: [96, 'M0,-140 V0 M92,-140 L0,-56 M34,-86 L96,0', 'sv'],
  L: [72, 'M0,-140 V0 H72', 'sv'],
  M: [124, 'M0,0 V-140 L62,-40 L124,-140 V0', 'ss'],
  N: [100, 'M0,0 V-140 L100,0 V-140', 'ss'],
  O: [128, CAP_O, 'oo'],
  P: [88, 'M0,0 V-140 H48 A39,39 0 0 1 48,-62 H0', 'so'],
  Q: [128, `${CAP_O} M82,-34 L124,8`, 'oo'],
  R: [90, 'M0,0 V-140 H48 A38,38 0 0 1 48,-64 H0 M50,-64 L90,0', 'sv'],
  S: [94, 'M92,-112 C84,-130 68,-140 48,-140 C22,-140 6,-126 6,-104 C6,-82 22,-76 48,-70 C76,-64 94,-58 94,-36 C94,-12 76,0 48,0 C24,0 8,-10 0,-30', 'oo'],
  T: [104, 'M0,-140 H104 M52,-140 V0', 'vv'],
  U: [104, 'M0,-140 V-52 A52,52 0 0 0 104,-52 V-140', 'ss'],
  V: [104, 'M0,-140 L52,0 L104,-140', 'vv'],
  W: [152, 'M0,-140 L38,0 L76,-140 L114,0 L152,-140', 'vv'],
  X: [96, 'M0,-140 L96,0 M96,-140 L0,0', 'vv'],
  Y: [100, 'M0,-140 L50,-64 L100,-140 M50,-64 V0', 'vv'],
  Z: [98, 'M0,-140 H96 L0,0 H98', 'vv'],
  0: [92, 'M0,-70 A46,70 0 1 1 92,-70 A46,70 0 1 1 0,-70', 'oo'],
  1: [42, 'M0,-110 L42,-140 V0', 'vs'],
  2: [88, 'M2,-104 C4,-126 20,-140 44,-140 C68,-140 84,-126 84,-104 C84,-86 74,-74 56,-58 L0,0 H88', 'ov'],
  3: [86, 'M4,-116 C10,-131 24,-140 42,-140 C66,-140 80,-126 80,-106 C80,-86 66,-74 44,-74 H34 M44,-74 C70,-74 86,-60 86,-38 C86,-14 68,0 42,0 C20,0 6,-10 0,-28', 'vo'],
  4: [96, 'M70,0 V-140 L0,-42 H96', 'vv'],
  5: [88, 'M80,-140 H14 L6,-78 C16,-86 28,-90 44,-90 C70,-90 88,-72 88,-46 C88,-18 70,0 42,0 C22,0 8,-8 0,-24', 'vo'],
  6: [90, 'M76,-124 C70,-134 58,-140 46,-140 C18,-140 0,-116 0,-78 V-46 A45,46 0 1 0 90,-46 A45,46 0 1 0 0,-46', 'oo'],
  7: [86, 'M0,-140 H86 L30,0', 'vv'],
  8: [76, 'M38,-140 A33,33 0 1 1 38,-74 A33,33 0 1 1 38,-140 M38,-76 A38,38 0 1 1 38,0 A38,38 0 1 1 38,-76', 'oo'],
  9: [90, 'M14,-16 C20,-6 32,0 44,0 C72,0 90,-24 90,-62 V-94 A45,46 0 1 0 0,-94 A45,46 0 1 0 90,-94', 'oo'],
  '.': [0, 'D0,-3', 'pp'],
  ',': [6, 'D6,-3 M6,-3 L0,22', 'pp'],
  ':': [0, 'D0,-78 D0,-3', 'pp'],
  '-': [44, 'M0,-52 H44', 'vv'],
  '+': [64, 'M0,-58 H64 M32,-90 V-26', 'vv'],
  '/': [58, 'M0,22 L58,-150', 'vv'],
  '·': [0, 'D0,-56', 'ss'],
  "'": [0, 'M0,-150 V-116', 'vv'],
  '!': [0, 'M0,-140 V-44 D0,-3', 'ss'],
  '?': [70, 'M0,-110 C4,-128 18,-140 36,-140 C56,-140 70,-128 70,-108 C70,-84 36,-78 36,-44 D36,-3', 'oo'],
  '&': [96, 'M96,0 L28,-86 C18,-98 14,-106 14,-114 C14,-129 26,-140 42,-140 C58,-140 68,-130 68,-115 C68,-99 58,-91 40,-79 C14,-62 0,-52 0,-33 C0,-13 16,0 38,0 C62,0 80,-18 88,-58', 'ov'],
  '(': [30, 'M30,-158 C8,-124 0,-94 0,-64 C0,-34 8,-4 30,30', 'ov'],
  ')': [30, 'M0,-158 C22,-124 30,-94 30,-64 C30,-34 22,-4 0,30', 'vo'],
  '%': [120, 'M26,-140 A26,28 0 1 1 25.9,-140 M94,-56 A26,28 0 1 1 93.9,-56 M100,-140 L20,0', 'oo'],
  '=': [64, 'M0,-76 H64 M0,-40 H64', 'vv'],
  '>': [70, 'M0,-96 L70,-58 L0,-20', 'vv'],
};
const SIDE = { s: 13, o: 6, v: 1, p: 9 };
const DOT_R = 3.5;     // radius of the centre line of a dot, in font units
const KERN = {
  ra: -9, ry: -7, rt: -3, ro: -6, re: -6, rs: -4, fa: -9, fo: -8, ta: -3, ct: -4, 'r.': -12, 'r,': -12, 'y.': -10, 'y,': -10,
  AT: -16, TA: -16, LT: -16, AV: -14, VA: -14, AY: -14, YA: -14, FA: -12, PA: -10, 'T.': -12, To: -14, Ta: -14, Te: -14,
  '1.': 0, '0.': -2, '.0': -2,
};

// Place one glyph: scale by s, offset by (ox, oy).
function placeGlyph(src, ox, oy, s) {
  const tok = src.match(/[MLHVCAZD]|-?\d*\.?\d+/g) || [];
  let out = '';
  let i = 0;
  const X = () => r1(ox + Number(tok[i++]) * s);
  const Y = () => r1(oy + Number(tok[i++]) * s);
  while (i < tok.length) {
    const c = tok[i++];
    if (c === 'M' || c === 'L') out += `${c}${X()} ${Y()}`;
    else if (c === 'H') out += `H${X()}`;
    else if (c === 'V') out += `V${Y()}`;
    else if (c === 'C') out += `C${X()} ${Y()} ${X()} ${Y()} ${X()} ${Y()}`;
    else if (c === 'A') {
      const rx = r1(Number(tok[i++]) * s), ry = r1(Number(tok[i++]) * s);
      const rot = tok[i++], la = tok[i++], sw = tok[i++];
      out += `A${rx} ${ry} ${rot} ${la} ${sw} ${X()} ${Y()}`;
    } else if (c === 'D') {
      // a dot: a tiny ring, so full stops stay visible at light weights
      const q = r2(DOT_R * s);
      out += `M${r1(ox + Number(tok[i++]) * s - DOT_R * s)} ${Y()}a${q} ${q} 0 1 0 ${r2(2 * DOT_R * s)} 0a${q} ${q} 0 1 0 ${r2(-2 * DOT_R * s)} 0`;
    }
    else if (c === 'Z') out += 'Z';
    else throw new Error(`bad glyph token "${c}" in "${src}"`);
  }
  return out;
}

// Lay a string out in font units. `wu` is the stroke weight in units (it widens every gap).
function layout(str, wu, track = 0, kern = KERN) {
  const items = [];
  let pen = 0, prev = null, prevCh = '';
  for (const ch of str) {
    if (ch === ' ') { pen += 70 + track; prev = null; prevCh = ''; continue; }
    const g = FONT[ch];
    if (!g) throw new Error(`no glyph for "${ch}" in "${str}"`);
    if (items.length) pen += wu + track + (prev ? SIDE[prev[2][1]] + SIDE[g[2][0]] + (kern[prevCh + ch] || 0) : 0);
    items.push([g[1], pen, ch]);
    pen += g[0];
    prev = g; prevCh = ch;
  }
  return { items, width: pen };
}

// A run of text as path data. (x, y) is the baseline point named by `a` (s, m or e);
// `cap` is the cap height in px; `w` the stroke weight as a fraction of the cap height.
function textPath(str, x, y, cap, { a = 's', w = 0.125, track = 0 } = {}) {
  const s = cap / 140;
  const L = layout(str, w * 140, track);
  const width = L.width * s;
  const ox = a === 's' ? x : a === 'm' ? x - width / 2 : x - width;
  return { d: L.items.map(([src, gx]) => placeGlyph(src, ox + gx * s, y, s)).join(''), width, x0: ox, x1: ox + width, sw: cap * w };
}
const textWidth = (str, cap, opts = {}) => textPath(str, 0, 0, cap, opts).width;
// The same, as an element. `shadow` adds a copy underneath: [dx, dy, colour, opacity].
function T(str, x, y, cap, { c = '#123', o = 1, shadow = null, halo = null, ...opts } = {}) {
  const t = textPath(str, x, y, cap, opts);
  let out = '';
  if (halo) out += `<path class="t" d="${t.d}" stroke="${halo[0]}" stroke-opacity="${halo[1]}" stroke-width="${r2(t.sw + halo[2])}"/>`;
  if (shadow) out += `<path class="t" d="${t.d}" transform="translate(${shadow[0]} ${shadow[1]})" stroke="${shadow[2]}" stroke-opacity="${shadow[3]}" stroke-width="${r2(t.sw)}"/>`;
  out += `<path class="t" d="${t.d}" stroke="${c}"${o < 1 ? ` stroke-opacity="${o}"` : ''} stroke-width="${r2(t.sw)}"/>`;
  return out;
}

// ------------------------------------------------------------------------------ shapes
const polar = (cx, cy, r, a) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
const pts = (list) => list.map(([x, y]) => `${r1(x)},${r1(y)}`).join(' ');
function hexPoints(cx, cy, r, rot = -Math.PI / 2) {
  return Array.from({ length: 6 }, (_, k) => polar(cx, cy, r, rot + (k * Math.PI) / 3));
}
// A cog as one evenodd path: n teeth between root radius ri and tip radius ro, with a hole.
function cogPath(cx, cy, ro, ri, n, hole) {
  const p = (2 * Math.PI) / n;
  const out = [];
  for (let k = 0; k < n; k++) {
    const a = k * p - Math.PI / 2;
    out.push(polar(cx, cy, ri, a - 0.33 * p), polar(cx, cy, ro, a - 0.2 * p), polar(cx, cy, ro, a + 0.2 * p), polar(cx, cy, ri, a + 0.33 * p));
  }
  const d = out.map(([x, y], i) => `${i ? 'L' : 'M'}${r1(x)} ${r1(y)}`).join('') + 'Z';
  return `${d}M${r1(cx - hole)} ${r1(cy)}a${r1(hole)} ${r1(hole)} 0 1 0 ${r1(2 * hole)} 0a${r1(hole)} ${r1(hole)} 0 1 0 ${r1(-2 * hole)} 0Z`;
}
// The app's emblem: a hexagon with a cog inside. Drawn in white for use on a coloured orb.
function emblem(cx, cy, r, colour = '#fff', sw = r * 0.13) {
  return `<polygon points="${pts(hexPoints(cx, cy, r))}" fill="none" stroke="${colour}" stroke-width="${r2(sw)}" stroke-linejoin="round"/>`
    + `<path d="${cogPath(cx, cy, r * 0.56, r * 0.4, 8, r * 0.17)}" fill="${colour}" fill-rule="evenodd" stroke="${colour}" stroke-width="${r2(sw * 0.35)}" stroke-linejoin="round"/>`;
}
// A seal with n points.
function starPoints(cx, cy, R, r, n, rot = 0) {
  return Array.from({ length: n * 2 }, (_, k) => polar(cx, cy, k % 2 ? r : R, rot + (k * Math.PI) / n));
}
// A soft shadow without a filter: stacked translucent rounded rects.
function softShadow(x, y, w, h, rx, { spread = 12, layers = 6, alpha = 0.035, colour = '#03294f', dy = 4 } = {}) {
  let out = '';
  for (let k = layers; k >= 1; k--) {
    const e = (spread * k) / layers;
    out += `<rect x="${r1(x - e)}" y="${r1(y - e + dy)}" width="${r1(w + 2 * e)}" height="${r1(h + 2 * e)}" rx="${r1(rx + e)}" fill="${colour}" fill-opacity="${alpha}"/>`;
  }
  return out;
}

// Glass button palettes: [top of body, middle (darkest), bottom glow, border, text shadow].
const GLASS = {
  purple: ['#c58bff', '#7a22d6', '#b06cff', '#4c1292', '#2f0a5e'],
  pink: ['#ff8cc3', '#d41872', '#ff5fa9', '#8a0d49', '#5c0730'],
  blue: ['#7fd6ff', '#0a84d6', '#45c3ff', '#075591', '#043a66'],
  green: ['#b4ec51', '#3f9f0c', '#86dc2a', '#2b6c06', '#1d4a04'],
  orange: ['#ffc24a', '#ea6a00', '#ffa01e', '#9c4300', '#6b2e00'],
};
function glassDefs(name) {
  const [top, mid, bot] = GLASS[name];
  return `<linearGradient id="g-${name}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset=".5" stop-color="${mid}"/><stop offset="1" stop-color="${bot}"/></linearGradient>`;
}
const GLOSS_DEF = '<linearGradient id="g-gloss" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".78"/><stop offset="1" stop-color="#fff" stop-opacity=".22"/></linearGradient>';
// The button itself. The gloss is a lighter band over the top 46 percent, ending in a hard edge.
function glassButton(x, y, w, h, name, { rx = 9 } = {}) {
  const border = GLASS[name][3];
  const gh = h * 0.46;
  const gr = Math.max(2, rx - 2);
  const gloss = `M${r1(x + 2)} ${r1(y + 2 + gh)}V${r1(y + 2 + gr)}a${r1(gr)} ${r1(gr)} 0 0 1 ${r1(gr)} ${r1(-gr)}H${r1(x + w - 2 - gr)}a${r1(gr)} ${r1(gr)} 0 0 1 ${r1(gr)} ${r1(gr)}V${r1(y + 2 + gh)}Z`;
  return `<rect x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h)}" rx="${rx}" fill="url(#g-${name})" stroke="${border}" stroke-width="1.2"/>`
    + `<path d="${gloss}" fill="url(#g-gloss)"/>`
    + `<rect x="${r1(x + 1.4)}" y="${r1(y + 1.4)}" width="${r1(w - 2.8)}" height="${r1(h - 2.8)}" rx="${r1(rx - 1.2)}" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="1"/>`;
}

// Small white line icons for the three tabs and the link buttons (all original, all strokes).
const ICONS = {
  // OBJECTIVES: a Space Elevator of sorts, a mast on a base with a car going up.
  objectives: (x, y, s) => `M${r1(x - 7 * s)} ${r1(y + 8 * s)}H${r1(x + 7 * s)}M${r1(x)} ${r1(y + 8 * s)}V${r1(y - 9 * s)}M${r1(x - 4 * s)} ${r1(y - 5 * s)}L${r1(x)} ${r1(y - 9.5 * s)}L${r1(x + 4 * s)} ${r1(y - 5 * s)}M${r1(x - 3.4 * s)} ${r1(y + 2.5 * s)}H${r1(x + 3.4 * s)}`,
  // ITEMS: a magnifier.
  items: (x, y, s) => `M${r1(x + 3.2 * s)} ${r1(y - 2 * s)}a${r1(5.4 * s)} ${r1(5.4 * s)} 0 1 1 ${r1(-10.8 * s)} 0a${r1(5.4 * s)} ${r1(5.4 * s)} 0 1 1 ${r1(10.8 * s)} 0M${r1(x + 1.9 * s)} ${r1(y + 2.2 * s)}L${r1(x + 7.4 * s)} ${r1(y + 8 * s)}`,
  // BUILDINGS: a factory with a saw-tooth roof and a stack.
  buildings: (x, y, s) => `M${r1(x - 8 * s)} ${r1(y + 8 * s)}V${r1(y - 2 * s)}L${r1(x - 3 * s)} ${r1(y + 1.5 * s)}V${r1(y - 2 * s)}L${r1(x + 2 * s)} ${r1(y + 1.5 * s)}V${r1(y - 8.5 * s)}H${r1(x + 7 * s)}V${r1(y + 8 * s)}Z`,
  // live: a play triangle in a ring.
  live: (x, y, s) => `M${r1(x - 3 * s)} ${r1(y - 5 * s)}L${r1(x + 5.5 * s)} ${r1(y)}L${r1(x - 3 * s)} ${r1(y + 5 * s)}Z`,
  // run: a prompt chevron and a cursor.
  run: (x, y, s) => `M${r1(x - 7.5 * s)} ${r1(y - 5 * s)}L${r1(x - 1.5 * s)} ${r1(y)}L${r1(x - 7.5 * s)} ${r1(y + 5 * s)}M${r1(x + 1 * s)} ${r1(y + 6 * s)}H${r1(x + 8 * s)}`,
  // inside: three stacked lines with bullets, a list.
  inside: (x, y, s) => [-5.5, 0, 5.5].map((dy) => `M${r1(x - 7.5 * s)} ${r1(y + dy * s)}h.01M${r1(x - 3 * s)} ${r1(y + dy * s)}H${r1(x + 8 * s)}`).join(''),
  // built: a spanner-ish pair of brackets, code.
  built: (x, y, s) => `M${r1(x - 3.5 * s)} ${r1(y - 6 * s)}L${r1(x - 8.5 * s)} ${r1(y)}L${r1(x - 3.5 * s)} ${r1(y + 6 * s)}M${r1(x + 3.5 * s)} ${r1(y - 6 * s)}L${r1(x + 8.5 * s)} ${r1(y)}L${r1(x + 3.5 * s)} ${r1(y + 6 * s)}`,
};
function icon(name, x, y, s, colour = '#fff', shadow = null) {
  const d = ICONS[name](x, y, s);
  const sw = r2(1.9 * s);
  return (shadow ? `<path class="t" d="${d}" transform="translate(0 1)" stroke="${shadow}" stroke-opacity=".55" stroke-width="${sw}"/>` : '')
    + `<path class="t" d="${d}" stroke="${colour}" stroke-width="${sw}"/>`;
}

// ------------------------------------------------------------------------------ the banner
function banner() {
  const W = 1000, H = 520;
  const rnd = makeRng(20070130);
  const defs = [];
  const css = [];
  const body = [];

  css.push('.t{fill:none;stroke-linecap:round;stroke-linejoin:round}');

  // ---- sky
  defs.push('<clipPath id="panel"><rect width="1000" height="520" rx="22"/></clipPath>');
  defs.push('<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a5cc2"/><stop offset=".26" stop-color="#1c95e8"/><stop offset=".52" stop-color="#74ccf6"/><stop offset=".76" stop-color="#d2f1fe"/><stop offset="1" stop-color="#f6fdff"/></linearGradient>');
  defs.push('<radialGradient id="glow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff" stop-opacity=".96"/><stop offset=".45" stop-color="#fff" stop-opacity=".72"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>');
  body.push(`<rect width="${W}" height="${H}" fill="url(#sky)"/>`);

  // ---- aurora: a sine ribbon stroked seven times, drifting one period per loop
  const ribbon = (id, period, amp, amp2, phase) => {
    let d = '';
    const n = 24;
    for (let k = 0; k <= (W / period + 2.2) * n; k++) {
      const x = (k / n) * period - period * 0.6;
      const y = amp * Math.sin((2 * Math.PI * k) / n + phase) + amp2 * Math.sin((4 * Math.PI * k) / n + phase * 1.7);
      d += `${k ? 'L' : 'M'}${r1(x)} ${r1(y)}`;
    }
    defs.push(`<path id="${id}" d="${d}"/>`);
  };
  const ribbonUse = (id, colour, width, alpha) => [1, 0.84, 0.68, 0.53, 0.39, 0.26, 0.13].map((k, i) => `<use href="#${id}" stroke="${colour}" stroke-width="${r1(width * k)}" stroke-opacity="${r2(alpha * 0.72 * (1 + i * 0.22))}"/>`).join('');
  ribbon('rb1', 500, 26, 9, 0.4);
  ribbon('rb2', 400, 20, 7, 2.1);
  ribbon('rb3', 500, 16, 6, 4.0);
  css.push('@keyframes d5{to{transform:translateX(-500px)}}@keyframes d4{to{transform:translateX(-400px)}}');
  css.push('.rb{fill:none;stroke-linecap:round;stroke-linejoin:round}');
  body.push('<g class="rb" transform="rotate(-7 500 120)">'
    + `<g transform="translate(0 84)"><g style="animation:d5 38s linear infinite">${ribbonUse('rb1', '#8dffc4', 78, 0.085)}</g></g>`
    + `<g transform="translate(0 150)"><g style="animation:d4 29s linear infinite">${ribbonUse('rb2', '#b8f7ff', 60, 0.08)}</g></g>`
    + `<g transform="translate(0 36)"><g style="animation:d5 53s linear infinite reverse">${ribbonUse('rb3', '#ffb3ec', 46, 0.06)}</g></g>`
    + '</g>');

  // ---- the white glow that the wordmark sits on
  body.push('<ellipse cx="520" cy="170" rx="520" ry="230" fill="url(#glow)"/>');

  // ---- lens flare, top left
  defs.push('<radialGradient id="sun" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff"/><stop offset=".12" stop-color="#fff" stop-opacity=".9"/><stop offset=".4" stop-color="#eaf8ff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>');
  defs.push('<radialGradient id="streak" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>');
  const SX = 64, SY = 44;
  const flare = [];
  flare.push(`<circle cx="${SX}" cy="${SY}" r="150" fill="url(#sun)"/>`);
  for (const [ang, len, th] of [[24, 330, 2.2], [-16, 210, 1.5], [68, 170, 1.4], [112, 120, 1.2], [156, 140, 1.2]]) {
    flare.push(`<ellipse cx="${SX}" cy="${SY}" rx="${len}" ry="${th}" fill="url(#streak)" transform="rotate(${ang} ${SX} ${SY})"/>`);
  }
  // ghosts along the line from the sun through the middle of the banner
  const gdx = Math.cos((24 * Math.PI) / 180), gdy = Math.sin((24 * Math.PI) / 180);
  for (const [dist, r, col, op, hex] of [[150, 13, '#9dffb0', 0.3, 0], [250, 30, '#fff', 0.16, 1], [330, 9, '#ffd36b', 0.4, 0], [560, 44, '#9fe3ff', 0.14, 1], [700, 17, '#ff9fe0', 0.22, 0], [860, 60, '#fff', 0.1, 1]]) {
    const gx = SX + gdx * dist, gy = SY + gdy * dist;
    flare.push(hex
      ? `<polygon points="${pts(hexPoints(gx, gy, r, 0.3))}" fill="${col}" fill-opacity="${op}" stroke="#fff" stroke-opacity="${r2(op * 1.6)}" stroke-width="1"/>`
      : `<circle cx="${r1(gx)}" cy="${r1(gy)}" r="${r}" fill="${col}" fill-opacity="${op}" stroke="#fff" stroke-opacity="${r2(op * 1.2)}" stroke-width="1"/>`);
  }
  css.push('@keyframes fl{from{opacity:.72}to{opacity:1}}');
  body.push(`<g style="animation:fl 6s ease-in-out infinite alternate">${flare.join('')}</g>`);

  // ---- bubbles: one symbol, reused
  defs.push('<radialGradient id="bubg" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".62" stop-color="#fff" stop-opacity=".04"/><stop offset=".9" stop-color="#d6f4ff" stop-opacity=".34"/><stop offset="1" stop-color="#fff" stop-opacity=".62"/></radialGradient>');
  defs.push('<linearGradient id="bubr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff"/><stop offset=".45" stop-color="#9fe9ff"/><stop offset=".75" stop-color="#ffc4f0"/><stop offset="1" stop-color="#c9ffb0"/></linearGradient>');
  defs.push('<g id="bub"><circle r="50" fill="url(#bubg)"/><circle r="49" fill="none" stroke="url(#bubr)" stroke-opacity=".85" stroke-width="1.8"/>'
    + '<ellipse cx="-19" cy="-24" rx="16" ry="8.5" transform="rotate(-40 -19 -24)" fill="#fff" fill-opacity=".9"/>'
    + '<path d="M36 17A40 40 0 0 1 11 38" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="3.2" stroke-linecap="round"/>'
    + '<circle cx="-33" cy="-5" r="2.6" fill="#fff" fill-opacity=".7"/></g>');
  const TRAVEL = H + 140;   // from 70 px below the bottom edge to 70 px above the top
  css.push(`@keyframes rise{from{transform:translateY(${H + 70}px)}to{transform:translateY(-70px)}}`);
  css.push('@keyframes wob{from{transform:translateX(-6px)}to{transform:translateX(6px)}}');
  const bubble = (x, y, r, dur, wobDur) => {
    const delay = -dur * ((H + 70 - y) / TRAVEL);
    return `<g transform="translate(${r1(x)} 0)"><g transform="translate(0 ${r1(y)})" style="animation:rise ${dur}s linear ${r2(delay)}s infinite">`
      + `<g style="animation:wob ${wobDur}s ease-in-out ${r2(-wobDur * rnd())}s infinite alternate"><use href="#bub" transform="scale(${r2(r / 50)})"/></g></g></g>`;
  };
  const backBubbles = [];
  const slots = [[40, 330], [118, 236], [205, 396], [262, 58], [338, 300], [402, 28], [468, 250], [548, 392], [604, 40], [668, 268], [742, 60], [806, 226], [862, 350], [930, 170], [964, 300], [176, 120], [722, 410], [298, 452]];
  for (const [x, y] of slots) {
    const r = 6 + rnd() * 17;
    backBubbles.push(bubble(x + (rnd() - 0.5) * 24, y + (rnd() - 0.5) * 20, r, Math.round(34 + rnd() * 26 - r * 0.5), r2(3.2 + rnd() * 3)));
  }
  if (slots.length + 4 !== 22) throw new Error('the gloss budget in the .md says 22 bubbles');
  body.push(`<g>${backBubbles.join('')}</g>`);

  // ---- hills: the curved strip of green
  defs.push('<linearGradient id="hillb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d4f58a"/><stop offset=".5" stop-color="#8fd63c"/><stop offset="1" stop-color="#5bb21f"/></linearGradient>');
  defs.push('<linearGradient id="hillf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9be23a"/><stop offset=".35" stop-color="#4fae14"/><stop offset="1" stop-color="#2c7d0c"/></linearGradient>');
  const hillBack = 'M0 428C150 398 300 392 470 410C660 431 830 426 1000 394V520H0Z';
  const hillTop = 'C190 430 350 432 520 452C700 473 850 468 1000 438';
  body.push(`<path d="${hillBack}" fill="url(#hillb)"/>`);
  body.push('<path d="M0 428C150 398 300 392 470 410C660 431 830 426 1000 394" fill="none" stroke="#f3ffd0" stroke-opacity=".9" stroke-width="2"/>');
  body.push(`<path d="M0 462${hillTop}V520H0Z" fill="url(#hillf)"/>`);
  // the gloss along the front hill: a lighter band with a hard lower edge
  body.push(`<path d="M0 462${hillTop}V452C850 482 700 487 520 466C350 446 190 444 0 476Z" fill="#fff" fill-opacity=".26"/>`);
  body.push(`<path d="M0 462${hillTop}" fill="none" stroke="#e9ffc0" stroke-opacity=".95" stroke-width="1.6"/>`);

  // ---- bokeh over the hills
  defs.push('<radialGradient id="bok" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff" stop-opacity=".5"/><stop offset=".8" stop-color="#fff" stop-opacity=".34"/><stop offset=".93" stop-color="#fff" stop-opacity=".6"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>');
  css.push('@keyframes tw{from{opacity:.25}to{opacity:1}}');
  const bokeh = [];
  for (const [x, y, r, op] of [[58, 446, 26, 0.5], [112, 474, 14, 0.42], [236, 468, 9, 0.5], [70, 398, 11, 0.4], [905, 430, 30, 0.44], [960, 482, 17, 0.5], [876, 474, 11, 0.45], [776, 462, 7, 0.5], [948, 380, 9, 0.36], [18, 500, 13, 0.4]]) {
    bokeh.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="url(#bok)" opacity="${op}" style="animation:tw ${r2(3.5 + rnd() * 4)}s ease-in-out ${r2(-rnd() * 6)}s infinite alternate"/>`);
  }
  body.push(`<g>${bokeh.join('')}</g>`);

  // ---- the wordmark
  const WM_W = 29;                      // stroke weight in font units
  const wmKern = { ...KERN, ul: -2, lt: 1, tr: -1, ra: -11, as: 0, sa: 0, at: -2, ti: 0, is: 1, sf: -1, fa: -11, ac: -1, ct: -5, to: -3, or: 0, ry: -9 };
  const wm = layout('ultrasatisfactory', WM_W, -1, wmKern);
  const ORB_R = 39;
  const WM_X0 = 132, WM_X1 = 858;       // centre-line extent of the letters
  const S = (WM_X1 - WM_X0) / wm.width;
  const BL = 158;                        // baseline
  const XH = 100 * S, wpx = WM_W * S;
  const partD = (from, to) => wm.items.slice(from, to).map(([src, gx]) => placeGlyph(src, WM_X0 + gx * S, BL, S)).join('');
  defs.push(`<path id="wu" d="${partD(0, 5)}"/><path id="ws" d="${partD(5, 17)}"/>`);
  const yTop = BL - XH - wpx / 2, yBot = BL + wpx / 2;
  const bodyGrad = (id, a, b, c) => `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="${r1(yTop)}" x2="0" y2="${r1(yBot)}"><stop offset="0" stop-color="${a}"/><stop offset=".55" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></linearGradient>`;
  defs.push(bodyGrad('wgu', '#35b8ff', '#0873d0', '#22b0f5'));
  defs.push(bodyGrad('wgs', '#93dd2c', '#3a960a', '#7fd322'));
  // gloss: white, strongest at the top, cut off hard half-way down the x-height
  const gEdge = BL - XH * 0.5;
  defs.push(`<linearGradient id="wgl" gradientUnits="userSpaceOnUse" x1="0" y1="${r1(BL - 150 * S - wpx / 2)}" x2="0" y2="${r1(gEdge)}"><stop offset="0" stop-color="#fff" stop-opacity=".8"/><stop offset=".55" stop-color="#fff" stop-opacity=".5"/><stop offset="1" stop-color="#fff" stop-opacity=".24"/></linearGradient>`);
  defs.push(`<clipPath id="wclip"><path d="M40 0H960V${r1(gEdge - 3)}Q500 ${r1(gEdge + 7)} 40 ${r1(gEdge - 3)}Z"/></clipPath>`);
  // orb gradients
  const OX = WM_X0 - wpx / 2 - 18 - ORB_R, OY = BL - XH / 2 - 9;
  defs.push('<radialGradient id="orb" cx=".5" cy=".82" r=".78"><stop offset="0" stop-color="#b4f3ff"/><stop offset=".34" stop-color="#25b0f2"/><stop offset=".72" stop-color="#0868c4"/><stop offset="1" stop-color="#053f8c"/></radialGradient>');
  defs.push('<linearGradient id="orbg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset="1" stop-color="#fff" stop-opacity=".18"/></linearGradient>');
  defs.push(`<clipPath id="orbc"><circle cx="${r1(OX)}" cy="${r1(OY)}" r="${ORB_R - 1.5}"/></clipPath>`);

  const orb = `<circle cx="${r1(OX)}" cy="${r1(OY)}" r="${ORB_R}" fill="url(#orb)" stroke="#043a7c" stroke-width="1.6"/>`
    + `<g opacity=".96">${emblem(OX, OY + 1.5, ORB_R * 0.63, '#063f86', ORB_R * 0.085)}</g>`
    + `<g>${emblem(OX, OY, ORB_R * 0.63, '#fff', ORB_R * 0.085)}</g>`
    + `<g clip-path="url(#orbc)"><ellipse cx="${r1(OX)}" cy="${r1(OY - ORB_R * 0.56)}" rx="${r1(ORB_R * 0.9)}" ry="${r1(ORB_R * 0.58)}" fill="url(#orbg)"/></g>`
    + `<circle cx="${r1(OX)}" cy="${r1(OY)}" r="${ORB_R - 2}" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="1.2"/>`;

  const layers = (id, rim, grad) => `<use href="#${id}" stroke="${rim}" stroke-width="${r1(wpx + 3.2)}"/>`
    + `<use href="#${id}" stroke="url(#${grad})" stroke-width="${r1(wpx)}"/>`;
  const glossLayer = `<g clip-path="url(#wclip)"><g transform="translate(0 ${r1(-wpx * 0.04)})" stroke="url(#wgl)" stroke-width="${r1(wpx - 4.6)}"><use href="#wu"/><use href="#ws"/></g></g>`;
  defs.push(`<g id="logo" class="t">${layers('wu', '#06458c', 'wgu')}${layers('ws', '#2a6707', 'wgs')}${glossLayer}${orb}</g>`);

  // reflection: the whole logo flipped about a line just under the letters, faded out
  const AXIS = BL + wpx / 2 + 3.5;
  defs.push(`<linearGradient id="rfg" gradientUnits="userSpaceOnUse" x1="0" y1="${r1(AXIS)}" x2="0" y2="${r1(AXIS + XH * 0.95)}"><stop offset="0" stop-color="#fff" stop-opacity=".42"/><stop offset=".45" stop-color="#fff" stop-opacity=".14"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`);
  defs.push(`<mask id="rfm" maskUnits="userSpaceOnUse" x="0" y="${r1(AXIS)}" width="${W}" height="${r1(XH)}"><rect x="0" y="${r1(AXIS)}" width="${W}" height="${r1(XH)}" fill="url(#rfg)"/></mask>`);
  body.push(`<g mask="url(#rfm)"><use href="#logo" transform="matrix(1 0 0 -1 0 ${r1(2 * AXIS)})"/></g>`);
  // a soft contact shadow under the letters, then the logo
  body.push(`<ellipse cx="${r1((WM_X0 + WM_X1) / 2 - 30)}" cy="${r1(AXIS)}" rx="${r1((WM_X1 - WM_X0) / 2 + 70)}" ry="5" fill="#0b4f8f" fill-opacity=".1"/>`);
  body.push('<use href="#logo"/>');
  // shine: a slanted white band crossing the letters now and then
  defs.push(`<mask id="wmm" maskUnits="userSpaceOnUse" x="${r1(WM_X0 - 30)}" y="${r1(BL - 160 * S - wpx)}" width="${r1(WM_X1 - WM_X0 + 60)}" height="${r1(215 * S + 2 * wpx)}"><g class="t" stroke="#fff" stroke-width="${r1(wpx)}"><use href="#wu"/><use href="#ws"/></g></mask>`);
  defs.push('<linearGradient id="shine" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".85"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>');
  css.push('@keyframes sw{0%,58%{transform:translateX(0)}84%,100%{transform:translateX(960px)}}');
  body.push(`<g mask="url(#wmm)"><g style="animation:sw 9s ease-in-out infinite"><polygon points="${pts([[WM_X0 - 130, BL - 170 * S], [WM_X0 - 60, BL - 170 * S], [WM_X0 - 100, BL + 60 * S], [WM_X0 - 170, BL + 60 * S]])}" fill="url(#shine)"/></g></g>`);

  // ---- tagline
  const TAG_Y = 236;
  body.push(T('every recipe, building and space elevator objective, one click apart.', 500, TAG_Y, 15.5, { a: 'm', c: '#134b7d', w: 0.118, track: 1 }));

  // ---- the glass window
  const WX = 128, WY = 258, WW = 744, WH = 184, WR = 10;
  defs.push('<linearGradient id="frame" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".72"/><stop offset=".18" stop-color="#dff3ff" stop-opacity=".46"/><stop offset="1" stop-color="#bfe6ff" stop-opacity=".4"/></linearGradient>');
  defs.push(`<clipPath id="framec"><rect x="${WX}" y="${WY}" width="${WW}" height="${WH}" rx="${WR}"/></clipPath>`);
  defs.push('<linearGradient id="client" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".97"/><stop offset="1" stop-color="#eef8ff" stop-opacity=".93"/></linearGradient>');
  const win = [];
  win.push(softShadow(WX, WY, WW, WH, WR, { spread: 16, layers: 7, alpha: 0.03, dy: 5 }));
  // outer glow ring, then the glass
  win.push(`<rect x="${WX - 2}" y="${WY - 2}" width="${WW + 4}" height="${WH + 4}" rx="${WR + 2}" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="3"/>`);
  win.push(`<rect x="${WX}" y="${WY}" width="${WW}" height="${WH}" rx="${WR}" fill="url(#frame)" stroke="#0d3c66" stroke-opacity=".6" stroke-width="1.2"/>`);
  // colour bleeding through the frosted frame: radial gradients stand in for a blurred backdrop
  const blob = (id, colour) => defs.push(`<radialGradient id="${id}" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="${colour}" stop-opacity=".9"/><stop offset="1" stop-color="${colour}" stop-opacity="0"/></radialGradient>`);
  blob('fb1', '#35c3ff'); blob('fb2', '#8df28a'); blob('fb3', '#ff9fe0');
  css.push('@keyframes fd{from{transform:translateX(-26px)}to{transform:translateX(30px)}}');
  win.push(`<g clip-path="url(#framec)"><g style="animation:fd 17s ease-in-out infinite alternate">`
    + `<ellipse cx="${WX + 96}" cy="${WY + 8}" rx="150" ry="44" fill="url(#fb1)" fill-opacity=".62"/>`
    + `<ellipse cx="${WX + 388}" cy="${WY + 4}" rx="170" ry="40" fill="url(#fb2)" fill-opacity=".62"/>`
    + `<ellipse cx="${WX + 610}" cy="${WY + 10}" rx="130" ry="40" fill="url(#fb3)" fill-opacity=".55"/>`
    + `<ellipse cx="${WX + 8}" cy="${WY + WH - 30}" rx="60" ry="90" fill="url(#fb2)" fill-opacity=".4"/>`
    + `<ellipse cx="${WX + WW - 8}" cy="${WY + WH - 60}" rx="60" ry="90" fill="url(#fb1)" fill-opacity=".4"/>`
    + '</g></g>');
  // diagonal glare bands in the glass
  win.push(`<g clip-path="url(#framec)" fill="#fff"><polygon points="${pts([[WX + 210, WY], [WX + 330, WY], [WX + 250, WY + WH], [WX + 130, WY + WH]])}" fill-opacity=".2"/><polygon points="${pts([[WX + 352, WY], [WX + 384, WY], [WX + 304, WY + WH], [WX + 272, WY + WH]])}" fill-opacity=".16"/><polygon points="${pts([[WX + 610, WY], [WX + 700, WY], [WX + 620, WY + WH], [WX + 530, WY + WH]])}" fill-opacity=".12"/></g>`);
  win.push(`<rect x="${WX + 1.4}" y="${WY + 1.4}" width="${WW - 2.8}" height="${WH - 2.8}" rx="${WR - 1.2}" fill="none" stroke="#fff" stroke-opacity=".8" stroke-width="1"/>`);
  // title: emblem, caption with a white halo
  const TB = 30;
  win.push(emblem(WX + 21, WY + 15.5, 8.6, '#0b63b6', 1.5));
  win.push(T('ULTRA-SATISFACTORY', WX + 37, WY + 20.6, 10.4, { c: '#0e2438', w: 0.15, track: 3, halo: ['#fff', 0.7, 3.4] }));
  const capW = textWidth('ULTRA-SATISFACTORY', 10.4, { w: 0.15, track: 3 });
  win.push(T('lukexyz.github.io/ULTRA-SATISFACTORY', WX + 37 + capW + 16, WY + 20.6, 10.4, { c: '#1c4d78', w: 0.115, track: 1, halo: ['#fff', 0.6, 3] }));
  // caption buttons, hanging off the top edge (generic glass: minimise, maximise, close)
  const cbY = WY + 1, cbH = 17;
  defs.push('<linearGradient id="cb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".85"/><stop offset=".48" stop-color="#e3f3ff" stop-opacity=".55"/><stop offset=".5" stop-color="#9dcdf0" stop-opacity=".5"/><stop offset="1" stop-color="#d9f2ff" stop-opacity=".75"/></linearGradient>');
  defs.push('<linearGradient id="cbx" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f7b6a4"/><stop offset=".48" stop-color="#dd5a3c"/><stop offset=".5" stop-color="#c02a10"/><stop offset="1" stop-color="#f08a4a"/></linearGradient>');
  const cbx0 = WX + WW - 12 - 98;
  win.push(`<path d="M${cbx0} ${cbY}h98v${cbH - 5}a5 5 0 0 1 -5 5h-88a5 5 0 0 1 -5 -5Z" fill="url(#cb)" stroke="#0d3c66" stroke-opacity=".55" stroke-width="1"/>`);
  win.push(`<path d="M${cbx0 + 54} ${cbY}h44v${cbH - 5}a5 5 0 0 1 -5 5h-39Z" fill="url(#cbx)" stroke="#6e1a0a" stroke-opacity=".7" stroke-width="1"/>`);
  win.push(`<path d="M${cbx0 + 27} ${cbY}v${cbH}" stroke="#0d3c66" stroke-opacity=".4" stroke-width="1"/>`);
  win.push(`<path class="t" d="M${cbx0 + 9} ${cbY + 11.5}h9M${cbx0 + 36} ${cbY + 5.5}h9v7h-9Z" stroke="#123a5c" stroke-width="1.5"/>`);
  win.push(`<path class="t" d="M${cbx0 + 72} ${cbY + 5}l8 7m0 -7l-8 7" stroke="#5a1408" stroke-opacity=".5" stroke-width="2.2" transform="translate(0 .8)"/><path class="t" d="M${cbx0 + 72} ${cbY + 5}l8 7m0 -7l-8 7" stroke="#fff" stroke-width="2"/>`);
  // client area
  const CX = WX + 8, CY = WY + TB, CW = WW - 16, CH = WH - TB - 8;
  win.push(`<rect x="${CX}" y="${CY}" width="${CW}" height="${CH}" rx="3" fill="url(#client)" stroke="#0d3c66" stroke-opacity=".5" stroke-width="1"/>`);

  // three glass tab buttons
  defs.push(glassDefs('purple'), glassDefs('pink'), glassDefs('blue'), glassDefs('green'), GLOSS_DEF);
  const tabs = [
    ['objectives', 'purple', '5 space elevator phases'],
    ['items', 'pink', '140 items, 211 recipes'],
    ['buildings', 'blue', '477 buildings, by tier'],
  ];
  const BW = 222, BH = 40, BG = (CW - 3 * BW) / 4;
  const BY = CY + 15;
  defs.push(`<clipPath id="btnc">${tabs.map((_, i) => `<rect x="${r1(CX + BG + i * (BW + BG))}" y="${BY}" width="${BW}" height="${BH}" rx="9"/>`).join('')}</clipPath>`);
  tabs.forEach(([label, col, sub], i) => {
    const bx = CX + BG + i * (BW + BG);
    win.push(`<rect x="${r1(bx + 1)}" y="${BY + 2.5}" width="${BW - 2}" height="${BH}" rx="10" fill="#0b3157" fill-opacity=".2"/>`);
    win.push(glassButton(bx, BY, BW, BH, col));
    const lw = textWidth(label, 15.5, { w: 0.15, track: 2 });
    const gx = bx + (BW - (lw + 30)) / 2;
    win.push(icon(label, gx + 8, BY + BH / 2, 1, '#fff', GLASS[col][4]));
    win.push(T(label, gx + 30, BY + BH / 2 + 5.6, 15.5, { c: '#fff', w: 0.15, track: 2, shadow: [0, 1.2, GLASS[col][4], 0.6] }));
    win.push(T(sub, bx + BW / 2, BY + BH + 20, 11, { a: 'm', c: '#2a4a66', w: 0.122, track: 1 }));
  });
  // shine crossing the three buttons in turn
  css.push('@keyframes bs{0%,30%{transform:translateX(0)}70%,100%{transform:translateX(900px)}}');
  win.push(`<g clip-path="url(#btnc)"><g style="animation:bs 7s ease-in-out -2s infinite"><polygon points="${pts([[CX - 80, BY - 2], [CX - 30, BY - 2], [CX - 52, BY + BH + 2], [CX - 102, BY + BH + 2]])}" fill="url(#shine)"/></g></g>`);

  // progress bar row
  const PY = BY + BH + 49;
  const PXL = CX + BG, PWID = CW - 2 * BG;
  win.push(T('moving the whole factory one foundation to the left...', PXL, PY + 9, 11, { c: '#2a4a66', w: 0.122, track: 1 }));
  win.push(T('time remaining: about 4 years', PXL + PWID, PY + 9, 11, { a: 'e', c: '#2a4a66', w: 0.122, track: 1 }));
  const BAR_Y = PY + 17, BAR_H = 13, FILL = 0.62;
  defs.push('<linearGradient id="track" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c9d3da"/><stop offset=".3" stop-color="#eef2f5"/><stop offset="1" stop-color="#fbfdfe"/></linearGradient>');
  defs.push('<linearGradient id="pfill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d6f7a6"/><stop offset=".46" stop-color="#6cd024"/><stop offset=".48" stop-color="#35a808"/><stop offset="1" stop-color="#7fe23a"/></linearGradient>');
  defs.push(`<clipPath id="pfc"><rect x="${r1(PXL + 1)}" y="${BAR_Y + 1}" width="${r1(PWID * FILL)}" height="${BAR_H - 2}" rx="2"/></clipPath>`);
  win.push(`<rect x="${r1(PXL)}" y="${BAR_Y}" width="${r1(PWID)}" height="${BAR_H}" rx="3" fill="url(#track)" stroke="#7d8e9b" stroke-width="1"/>`);
  win.push(`<rect x="${r1(PXL + 1)}" y="${BAR_Y + 1}" width="${r1(PWID * FILL)}" height="${BAR_H - 2}" rx="2" fill="url(#pfill)"/>`);
  css.push(`@keyframes pb{0%{transform:translateX(0)}70%,100%{transform:translateX(${Math.round(PWID * FILL + 140)}px)}}`);
  win.push(`<g clip-path="url(#pfc)"><rect x="${r1(PXL - 130)}" y="${BAR_Y}" width="120" height="${BAR_H}" fill="url(#shine)" style="animation:pb 2.8s linear infinite"/></g>`);
  body.push(`<g>${win.join('')}</g>`);

  // ---- the starburst badge
  defs.push('<linearGradient id="star" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffc23a"/><stop offset=".5" stop-color="#ff8400"/><stop offset="1" stop-color="#ee6200"/></linearGradient>');
  const BXc = 923, BYc = 73, BR = 58;
  const starP = pts(starPoints(0, 0, BR, BR * 0.86, 20));
  defs.push(`<clipPath id="starc"><polygon points="${starP}"/></clipPath>`);
  css.push('@keyframes bp{from{transform:rotate(0deg) scale(1)}to{transform:rotate(3.5deg) scale(1.045)}}');
  const badge = `<polygon points="${starP}" transform="translate(2 4)" fill="#0b3157" fill-opacity=".22"/>`
    + `<polygon points="${starP}" fill="url(#star)" stroke="#a94a00" stroke-width="1.4" stroke-linejoin="round"/>`
    + `<g clip-path="url(#starc)"><ellipse cx="0" cy="${r1(-BR * 0.62)}" rx="${r1(BR * 1.15)}" ry="${r1(BR * 0.66)}" fill="url(#g-gloss)" fill-opacity=".5"/></g>`
    + `<circle r="${r1(BR * 0.76)}" fill="none" stroke="#fff" stroke-opacity=".75" stroke-width="1.1" stroke-dasharray="2.4 3"/>`
    // "not even BETA": the package version really is 0.0.1 and the project has declared no beta
    + T('not even', 0, -19.5, 9.8, { a: 'm', c: '#fff', w: 0.15, track: 2, shadow: [0, 1.1, '#6b2a00', 0.8] })
    + T('BETA', 0, 11.5, 23, { a: 'm', c: '#fff', w: 0.17, track: 3, shadow: [0, 1.5, '#6b2a00', 0.75] })
    + T('v0.0.1', 0, 30, 10.2, { a: 'm', c: '#fff', w: 0.15, track: 2, shadow: [0, 1.1, '#6b2a00', 0.8] });

  // ---- a few bubbles in front, kept to the margins (the badge goes on top, so none crosses its text)
  const front = [bubble(34, 196, 30, 31, 4.6), bubble(962, 232, 24, 37, 5.3), bubble(86, 322, 13, 26, 3.7), bubble(914, 330, 11, 29, 4.1)];
  body.push(`<g>${front.join('')}</g>`);
  body.push(`<g transform="translate(${BXc} ${BYc}) rotate(11)"><g style="animation:bp 2.6s ease-in-out infinite alternate">${badge}</g></g>`);

  // ---- blades of grass in the two bottom corners, swaying a little
  defs.push('<linearGradient id="blade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9f97c"/><stop offset=".45" stop-color="#6cc51d"/><stop offset="1" stop-color="#2d860c"/></linearGradient>');
  css.push('@keyframes sway{from{transform:rotate(-1.6deg)}to{transform:rotate(1.8deg)}}');
  // a dew drop: dark at the top where it shades the leaf, bright at the bottom where the light
  // comes back out, a rim, a specular dot and a crescent. Drawn at radius 10, scaled on use.
  defs.push('<linearGradient id="dewg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d4a12" stop-opacity=".5"/><stop offset=".5" stop-color="#c9f59a" stop-opacity=".2"/><stop offset="1" stop-color="#fff" stop-opacity=".85"/></linearGradient>');
  defs.push('<g id="dew"><ellipse cx="1.2" cy="2.6" rx="9.6" ry="10.6" fill="#0b3a08" fill-opacity=".3"/><ellipse rx="9" ry="10" fill="url(#dewg)" stroke="#f4ffd6" stroke-opacity=".75" stroke-width="1.1"/>'
    + '<ellipse cx="-3.3" cy="-4.6" rx="3.1" ry="2" transform="rotate(-35 -3.3 -4.6)" fill="#fff"/>'
    + '<path d="M-5.2 5.4A7.4 8.2 0 0 0 5.2 5.4" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="1.5" stroke-linecap="round"/></g>');
  let dewCount = 0;
  const blades = [];
  const blade = (bx, h, lean, wd, dewAt = 0) => {
    const by = H + 8, tx = bx + lean, ty = by - h;
    const mx = bx + lean * 0.22, my = by - h * 0.58;
    const d = `M${r1(bx - wd)} ${by}Q${r1(mx - wd * 0.9)} ${r1(my)} ${r1(tx)} ${r1(ty)}Q${r1(mx + wd * 1.1)} ${r1(my + 6)} ${r1(bx + wd)} ${by}Z`;
    const hi = `M${r1(bx - wd * 0.2)} ${by}Q${r1(mx - wd * 0.25)} ${r1(my)} ${r1(tx)} ${r1(ty)}`;
    let dew = '';
    if (dewAt) {
      // a point on the blade's midline, and a drop a little narrower than the blade there
      const u = dewAt, a = (1 - u) * (1 - u), b = 2 * u * (1 - u), c = u * u;
      const dx = a * bx + b * (mx + wd * 0.1) + c * tx, dy = a * by + b * (my + 3) + c * ty;
      const half = (a + b) * wd;
      dew = `<use href="#dew" transform="translate(${r1(dx)} ${r1(dy)}) scale(${r2((half * 0.78) / 10)})"/>`;
      dewCount++;
    }
    return `<g style="transform-origin:${r1(bx)}px ${by}px;animation:sway ${r2(3.4 + rnd() * 2.6)}s ease-in-out ${r2(-rnd() * 5)}s infinite alternate">`
      + `<path d="${d}" fill="url(#blade)" stroke="#2a7a0a" stroke-opacity=".55" stroke-width=".8"/><path d="${hi}" fill="none" stroke="#f4ffc9" stroke-opacity=".7" stroke-width="1.1" stroke-linecap="round"/>${dew}</g>`;
  };
  for (const [bx, h, lean, wd, dewAt] of [[6, 96, 26, 7, 0.4], [24, 64, -14, 6], [40, 118, 34, 8, 0.56], [58, 52, 12, 5.5], [76, 82, -20, 6.5, 0.46], [98, 44, 10, 5],
    [994, 104, -30, 7, 0.42], [976, 60, 12, 6], [958, 124, -40, 8, 0.55], [940, 50, -10, 5.5], [922, 86, 22, 6.5], [900, 42, -8, 5]]) {
    blades.push(blade(bx, h, lean, wd, dewAt));
  }
  if (blades.length !== 12 || dewCount !== 5) throw new Error('the gloss budget in the .md says 12 blades and 5 dew drops');
  body.push(`<g>${blades.join('')}</g>`);

  // ---- footer on the grass
  body.push(T('free and open source · an unofficial fan project, not affiliated with coffee stain studios', 500, 503, 11.2, { a: 'm', c: '#fff', w: 0.13, track: 1.5, shadow: [0, 1.1, '#174f05', 0.7] }));

  // ---- frame of the whole panel
  body.push(`<rect x=".75" y=".75" width="${W - 1.5}" height="${H - 1.5}" rx="21.5" fill="none" stroke="#0a4f9e" stroke-opacity=".55" stroke-width="1.5"/>`);
  body.push(`<rect x="2.5" y="2.5" width="${W - 5}" height="${H - 5}" rx="20" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="1.2"/>`);

  css.push('@media (prefers-reduced-motion:reduce){*{animation:none!important}}');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="ultra-satisfactory: every recipe, building and Space Elevator objective, one click apart">\n`
    + `<title>ULTRA-SATISFACTORY</title>\n<style>${css.join('')}</style>\n<defs>${defs.join('')}</defs>\n`
    + `<g clip-path="url(#panel)">\n${body.join('\n')}\n</g>\n</svg>\n`;
}

// ------------------------------------------------------------------------------ link buttons
// One small glass button per SVG, with its own wet-table reflection. They sit in a row under
// the banner, each wrapped in a link by the markdown.
function linkButton({ label, colour, ico, w, delay }) {
  const Wd = w, Hd = 66;
  const bx = 4, by = 3, bw = Wd - 8, bh = 40;
  const cap = 13.2;
  const opts = { w: 0.155, track: 2 };
  const lw = textWidth(label, cap, opts);
  const gx = bx + (bw - (lw + 28)) / 2;
  const face = glassButton(bx, by, bw, bh, colour, { rx: 11 })
    + (ico === 'live'
      ? `<circle cx="${r1(gx + 9)}" cy="${by + bh / 2}" r="8.8" fill="none" stroke="${GLASS[colour][4]}" stroke-opacity=".5" stroke-width="1.7" transform="translate(0 1)"/><circle cx="${r1(gx + 9)}" cy="${by + bh / 2}" r="8.8" fill="none" stroke="#fff" stroke-width="1.7"/><path d="${ICONS.live(gx + 8.6, by + bh / 2, 0.66)}" fill="#fff" stroke="#fff" stroke-width="1.2" stroke-linejoin="round"/>`
      : icon(ico, gx + 9, by + bh / 2, 0.92, '#fff', GLASS[colour][4]))
    + T(label, gx + 28, by + bh / 2 + 4.8, cap, { c: '#fff', ...opts, shadow: [0, 1.2, GLASS[colour][4], 0.6] });
  const axis = by + bh + 2.5;
  const css = '.t{fill:none;stroke-linecap:round;stroke-linejoin:round}'
    + `@keyframes bs{0%,55%{transform:translateX(0)}85%,100%{transform:translateX(${Wd + 90}px)}}`
    + '@media (prefers-reduced-motion:reduce){*{animation:none!important}}';
  const defs = glassDefs(colour) + GLOSS_DEF
    + '<linearGradient id="shine" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".8"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>'
    + `<linearGradient id="rfg" gradientUnits="userSpaceOnUse" x1="0" y1="${axis}" x2="0" y2="${Hd}"><stop offset="0" stop-color="#fff" stop-opacity=".4"/><stop offset=".5" stop-color="#fff" stop-opacity=".12"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`
    + `<mask id="rfm" maskUnits="userSpaceOnUse" x="0" y="${axis}" width="${Wd}" height="${r1(Hd - axis)}"><rect x="0" y="${axis}" width="${Wd}" height="${r1(Hd - axis)}" fill="url(#rfg)"/></mask>`
    + `<clipPath id="bc"><rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="11"/></clipPath>`
    + `<g id="face">${face}</g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${Wd} ${Hd}" width="${Wd}" height="${Hd}" role="img" aria-label="${label}">\n<title>${label}</title>\n<style>${css}</style>\n<defs>${defs}</defs>\n`
    + `<g mask="url(#rfm)"><use href="#face" transform="matrix(1 0 0 -1 0 ${r1(2 * axis)})"/></g>\n<use href="#face"/>\n`
    + `<g clip-path="url(#bc)"><g style="animation:bs 6.5s ease-in-out ${delay}s infinite"><polygon points="${pts([[-70, by - 2], [-28, by - 2], [-48, by + bh + 2], [-90, by + bh + 2]])}" fill="url(#shine)"/></g></g>\n</svg>\n`;
}

// ------------------------------------------------------------------------------ tag cloud
// The other Web 2.0 fixture. Every tag is an item whose standard recipe was checked against
// the app's data; the size of a tag is its output per minute from one machine.
const TAGS = [
  ['packaged water', 60], ['steel ingot', 45], ['screw', 40], ['iron ingot', 30], ['copper ingot', 30], ['wire', 30], ['cable', 30],
  ['iron plate', 20], ['plastic', 20], ['iron rod', 15], ['caterium ingot', 15], ['steel beam', 15], ['concrete', 15],
  ['cooling system', 6], ['reinforced iron plate', 5], ['versatile framework', 5], ['rotor', 4], ['modular frame', 2],
  ['smart plating', 2], ['heavy modular frame', 2], ['modular engine', 1], ['adaptive control unit', 1], ['nuclear pasta', 0.5],
];
function tagCloud() {
  const W = 1000, PAD = 46, GAPX = 26;
  const rnd = makeRng(88);
  const order = TAGS.map((t) => [rnd(), t]).sort((a, b) => a[0] - b[0]).map(([, t]) => t);
  const COLS = ['#0873d0', '#3a960a', '#0a5cb0', '#d41872', '#2f8a0a', '#1590e0', '#7a22d6', '#0873d0', '#e06400'];
  const capOf = (rate) => 9.6 + 21 * Math.sqrt(rate / 60);
  const wOf = (rate) => 0.118 + 0.03 * Math.sqrt(rate / 60);
  // greedy line fill
  const lines = [[]];
  let lineW = 0;
  order.forEach(([name, rate], i) => {
    const cap = capOf(rate), opts = { w: wOf(rate), track: 1.5 };
    const tw = textWidth(name, cap, opts);
    if (lineW && lineW + GAPX + tw > W - 2 * PAD) { lines.push([]); lineW = 0; }
    lines[lines.length - 1].push({ name, rate, cap, opts, tw, col: COLS[i % COLS.length] });
    lineW += (lineW ? GAPX : 0) + tw;
  });
  const TOP = 58;
  let y = TOP;
  const body = [];
  for (const line of lines) {
    const maxCap = Math.max(...line.map((t) => t.cap));
    const total = line.reduce((a, t) => a + t.tw, 0) + GAPX * (line.length - 1);
    let x = (W - total) / 2;
    y += maxCap + 14;
    for (const t of line) {
      body.push(T(t.name, x, y, t.cap, { c: t.col, ...t.opts }));
      x += t.tw + GAPX;
    }
    y += 8;
  }
  const H = Math.round(y + 50);
  const css = '.t{fill:none;stroke-linecap:round;stroke-linejoin:round}';
  const defs = '<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset=".7" stop-color="#f1faff"/><stop offset="1" stop-color="#cfeeff"/></linearGradient>'
    + '<linearGradient id="hd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fd6ff"/><stop offset=".48" stop-color="#2aa5ee"/><stop offset=".5" stop-color="#0a84d6"/><stop offset="1" stop-color="#45c3ff"/></linearGradient>'
    + `<clipPath id="pc"><rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="17"/></clipPath>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="tag cloud of items, sized by output per minute">\n<title>tag cloud</title>\n<style>${css}</style>\n<defs>${defs}</defs>\n`
    + `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="17" fill="url(#bg)" stroke="#0a5c9e" stroke-opacity=".6" stroke-width="1.5"/>\n`
    + `<g clip-path="url(#pc)"><rect x="0" y="0" width="${W}" height="44" fill="url(#hd)"/><rect x="0" y="0" width="${W}" height="21" fill="#fff" fill-opacity=".28"/><path d="M0 44.5H${W}" stroke="#075591" stroke-width="1"/>`
    + `<path d="M0 ${H - 34}C260 ${H - 58} 520 ${H - 8} ${W} ${H - 46}V${H}H0Z" fill="#8fd63c" fill-opacity=".55"/><path d="M0 ${H - 20}C300 ${H - 44} 640 ${H + 2} ${W} ${H - 28}V${H}H0Z" fill="#4fae14" fill-opacity=".75"/></g>\n`
    + T('tag cloud', 24, 29, 14.5, { c: '#fff', w: 0.15, track: 2, shadow: [0, 1.2, '#043a66', 0.6] })
    + T('sized by output per minute from one machine, standard recipe', W - 24, 28.5, 11.5, { a: 'e', c: '#fff', w: 0.13, track: 1.5, shadow: [0, 1.1, '#043a66', 0.55] })
    + `\n${body.join('\n')}\n`
    + `<rect x="2.6" y="2.6" width="${W - 5.2}" height="${H - 5.2}" rx="15.5" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="1.2"/>\n</svg>\n`;
}

// ------------------------------------------------------------------------------ write
const out = [
  [`${SLUG}.svg`, banner()],
  [`${SLUG}-btn-live.svg`, linkButton({ label: 'open it live', colour: 'green', ico: 'live', w: 186, delay: -1 })],
  [`${SLUG}-btn-run.svg`, linkButton({ label: 'run it locally', colour: 'blue', ico: 'run', w: 186, delay: -2.4 })],
  [`${SLUG}-btn-inside.svg`, linkButton({ label: "what's inside", colour: 'purple', ico: 'inside', w: 186, delay: -3.8 })],
  [`${SLUG}-btn-built.svg`, linkButton({ label: "how it's built", colour: 'pink', ico: 'built', w: 186, delay: -5.2 })],
  [`${SLUG}-tags.svg`, tagCloud()],
];
fs.mkdirSync(ASSETS, { recursive: true });
for (const [name, svg] of out) {
  const file = path.join(ASSETS, name);
  fs.writeFileSync(file, svg);
  console.log(`${name}: ${(Buffer.byteLength(svg) / 1024).toFixed(1)} KB`);
}
