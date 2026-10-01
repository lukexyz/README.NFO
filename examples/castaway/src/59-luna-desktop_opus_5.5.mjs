#!/usr/bin/env node
// CASTAWAY README header: "Mid-2000s Luna Desktop" (59-luna-desktop_opus_5.5).
//
//   node examples/castaway/src/59-luna-desktop_opus_5.5.mjs
//
// Regenerates ../assets/59-luna-desktop_opus_5.5.svg, the banner.
// Plain Node, no dependencies, deterministic (seeded PRNG, no clock). The .md beside the
// assets is hand-written, not generated.
//
// The style (catalogue entry vap-09) is the Windows XP "Luna" look of 2001 to 2007: rounded
// blue title bars that are lightest at the very top, white bold captions with a dark-blue
// shadow, three rounded caption buttons (the close one red), a cream #ece9d8 dialog surface,
// a blue taskbar with a green pill start button and a lighter tray, pale yellow balloon tips
// with a tail pointing at the tray, green progress blocks marching left to right, and a
// desktop of one smooth green hill under a deep blue sky.
//
// Castaway's renderer really is a web page (python tools/serve.py, then 127.0.0.1:8765), so
// the one window here is a browser of that era showing the live preview: a green round Back
// button, an address bar with the real local URL and a status bar whose progress bar is the
// endless kind, because nothing is happening, on purpose. The page inside is drawn in the
// renderer's own dark colours. The island plays in it. Every six seconds (two bars of the
// 80 BPM theme) the tray pops a balloon about whatever just happened on the island, in the
// deadpan voice of the operating system: found new hardware (the drone's parcel is another
// pair of headphones), a hermit crab at risk (then the coconut walks off with it), a new
// message (the bottle she threw has washed straight back), a new audio device (the shark is
// wearing headphones). The timecode under the preview really counts, digit by digit, and
// only wraps at 10:00:00, which is how long a run lasts.
//
// Nothing is copied from a real desktop: no logos, no flag, no wallpaper photograph, no real
// fonts. The hill, the clouds, the icons, the palm-and-sun emblem and both fonts are drawn in
// this file. The letters are this file's own humanist monoline sans (one stroke font, two
// weights), drawn as <path> strokes, so there is no <text> anywhere.
//
// Motion: CSS keyframes only. Hard cuts and stepped movement for her, the palm and the props
// (the project's own motion defaults); smooth only for things that fly or float. The main
// loop is 30 s (10 bars). Reduced motion stops everything on the 9.35 s frame: the drone has
// just dropped the parcel and the "Found New Hardware" balloon is up.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const ASSETS = path.join(here, '..', 'assets');
const SLUG = '59-luna-desktop_opus_5.5';

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
// A humanist monoline sans with a big x-height, in the spirit of the era's UI faces (not a
// copy of any). Glyph box: baseline y = 0, x-height -102, cap height -140, ascender -148,
// descender +44 (y grows downwards). Each entry is [advance, path, sides]; paths use absolute
// M L H V C A Z, plus "D x,y" for a dot. `sides` classes each edge for spacing:
// s = straight stem, o = round, v = open or diagonal, p = punctuation.
const O_LC = 'M0,-51 A44,51 0 1 1 88,-51 A44,51 0 1 1 0,-51';
const BOWL_R = 'M0,-78 C10,-95 25,-102 43,-102 C70,-102 88,-80 88,-51 C88,-21 70,0 43,0 C25,0 10,-7 0,-22';
const BOWL_L = 'M88,-78 C78,-95 63,-102 45,-102 C18,-102 0,-80 0,-51 C0,-21 18,0 45,0 C63,0 78,-7 88,-22';
const FONT = {
  a: [80, 'M8,-90 C17,-98 29,-102 43,-102 C67,-102 80,-90 80,-68 V0 M80,-56 H44 C17,-56 3,-45 3,-27 C3,-10 16,0 36,0 C56,0 72,-10 80,-26', 'os'],
  b: [88, `M0,-148 V0 ${BOWL_R}`, 'so'],
  c: [80, 'M80,-86 C72,-97 60,-102 46,-102 C18,-102 0,-80 0,-51 C0,-21 18,0 46,0 C60,0 72,-5 80,-15', 'ov'],
  d: [88, `M88,-148 V0 ${BOWL_L}`, 'os'],
  e: [86, 'M2,-53 H86 C86,-83 70,-102 44,-102 C18,-102 0,-80 0,-51 C0,-21 18,0 46,0 C61,0 73,-5 83,-15', 'oo'],
  f: [56, 'M62,-144 C56,-147 51,-148 45,-148 C29,-148 20,-138 20,-118 V0 M0,-100 H56', 'vv'],
  g: [88, `M88,-102 V8 C88,32 72,44 46,44 C30,44 17,40 7,32 M88,-78 C78,-95 63,-102 45,-102 C18,-102 0,-82 0,-54 C0,-25 18,-6 45,-6 C63,-6 78,-13 88,-28`, 'os'],
  h: [82, 'M0,-148 V0 M0,-78 C8,-94 23,-102 43,-102 C68,-102 82,-88 82,-62 V0', 'ss'],
  i: [0, 'M0,-100 V0 D0,-136', 'ss'],
  j: [20, 'M20,-100 V14 C20,34 11,44 -6,44 D20,-136', 'vs'],
  k: [78, 'M0,-148 V0 M74,-100 L3,-40 M28,-60 L78,0', 'sv'],
  l: [0, 'M0,-148 V0', 'ss'],
  m: [128, 'M0,-100 V0 M0,-78 C6,-94 18,-102 34,-102 C54,-102 64,-90 64,-68 V0 M64,-70 C70,-92 82,-102 98,-102 C118,-102 128,-90 128,-66 V0', 'ss'],
  n: [82, 'M0,-100 V0 M0,-78 C8,-94 23,-102 43,-102 C68,-102 82,-88 82,-62 V0', 'ss'],
  o: [88, O_LC, 'oo'],
  p: [88, `M0,-100 V44 ${BOWL_R}`, 'so'],
  q: [88, `M88,-100 V44 ${BOWL_L}`, 'os'],
  r: [54, 'M0,-100 V0 M0,-68 C6,-90 22,-102 42,-102 C47,-102 51,-101 55,-99', 'sv'],
  s: [74, 'M70,-89 C62,-98 51,-102 38,-102 C18,-102 6,-92 6,-76 C6,-60 20,-56 38,-52 C58,-48 74,-42 74,-24 C74,-8 60,0 38,0 C22,0 8,-5 0,-15', 'oo'],
  t: [58, 'M20,-132 V-26 C20,-9 28,0 44,0 C50,0 55,-1 59,-3 M0,-100 H57', 'vv'],
  u: [82, 'M0,-100 V-38 C0,-14 14,0 39,0 C59,0 74,-8 82,-24 M82,-100 V0', 'ss'],
  v: [82, 'M0,-100 L41,0 L82,-100', 'vv'],
  w: [120, 'M0,-100 L29,0 L60,-100 L91,0 L120,-100', 'vv'],
  x: [80, 'M2,-100 L78,0 M78,-100 L2,0', 'vv'],
  y: [82, 'M0,-100 L41,0 M82,-100 L32,24 C27,36 19,44 4,44', 'vv'],
  z: [78, 'M4,-100 H76 L2,0 H78', 'vv'],
  A: [106, 'M0,0 L53,-140 L106,0 M20,-46 H86', 'vv'],
  B: [86, 'M0,0 V-140 H44 C66,-140 79,-128 79,-106 C79,-85 65,-74 44,-74 H0 M44,-74 C70,-74 86,-62 86,-38 C86,-13 70,0 44,0 H0', 'so'],
  C: [106, 'M106,-120 C95,-135 80,-142 64,-142 C26,-142 0,-112 0,-70 C0,-28 26,2 64,2 C81,2 96,-5 106,-19', 'ov'],
  D: [108, 'M0,0 V-140 H40 C84,-140 108,-112 108,-70 C108,-28 84,0 40,0 H0', 'so'],
  E: [80, 'M80,-140 H0 V0 H80 M0,-72 H70', 'sv'],
  F: [78, 'M78,-140 H0 V0 M0,-72 H66', 'sv'],
  G: [110, 'M106,-120 C95,-135 80,-142 64,-142 C26,-142 0,-112 0,-70 C0,-28 26,2 64,2 C84,2 100,-4 110,-12 V-64 H68', 'os'],
  H: [100, 'M0,-140 V0 M100,-140 V0 M0,-72 H100', 'ss'],
  I: [0, 'M0,-140 V0', 'ss'],
  J: [54, 'M54,-140 V-34 C54,-12 42,0 24,0 C12,0 3,-4 -3,-12', 'vs'],
  K: [92, 'M0,-140 V0 M88,-140 L4,-62 M34,-88 L92,0', 'sv'],
  L: [76, 'M0,-140 V0 H76', 'sv'],
  M: [124, 'M0,0 V-140 L62,-32 L124,-140 V0', 'ss'],
  N: [102, 'M0,0 V-140 L102,0 V-140', 'ss'],
  O: [122, 'M0,-70 A61,72 0 1 1 122,-70 A61,72 0 1 1 0,-70', 'oo'],
  P: [86, 'M0,0 V-140 H44 C70,-140 86,-126 86,-100 C86,-74 70,-60 44,-60 H0', 'so'],
  Q: [122, 'M0,-70 A61,72 0 1 1 122,-70 A61,72 0 1 1 0,-70 M72,-22 L120,24', 'oo'],
  R: [92, 'M0,0 V-140 H44 C70,-140 86,-126 86,-102 C86,-78 70,-64 44,-64 H0 M46,-64 L92,0', 'sv'],
  S: [90, 'M86,-121 C78,-134 63,-142 45,-142 C20,-142 4,-128 4,-106 C4,-82 22,-76 45,-70 C71,-64 90,-56 90,-34 C90,-10 72,2 45,2 C23,2 6,-6 -2,-22', 'oo'],
  T: [104, 'M0,-140 H104 M52,-140 V0', 'vv'],
  U: [100, 'M0,-140 V-50 C0,-16 20,2 50,2 C80,2 100,-16 100,-50 V-140', 'ss'],
  V: [104, 'M0,-140 L52,0 L104,-140', 'vv'],
  W: [146, 'M0,-140 L35,0 L73,-140 L111,0 L146,-140', 'vv'],
  X: [96, 'M2,-140 L94,0 M94,-140 L2,0', 'vv'],
  Y: [100, 'M0,-140 L50,-66 L100,-140 M50,-66 V0', 'vv'],
  Z: [96, 'M4,-140 H94 L0,0 H96', 'vv'],
  0: [88, 'M0,-70 A44,71 0 1 1 88,-70 A44,71 0 1 1 0,-70', 'oo'],
  1: [88, 'M18,-112 L50,-140 V0 M18,0 H82', 'oo'],
  2: [88, 'M6,-118 C14,-133 28,-142 46,-142 C70,-142 84,-128 84,-106 C84,-86 72,-72 52,-56 L2,0 H86', 'oo'],
  3: [88, 'M6,-124 C14,-136 28,-142 44,-142 C68,-142 82,-130 82,-108 C82,-88 68,-76 44,-76 H34 M44,-76 C70,-76 86,-62 86,-38 C86,-12 68,2 42,2 C24,2 10,-4 2,-16', 'oo'],
  4: [88, 'M66,0 V-140 L0,-44 H88', 'oo'],
  5: [88, 'M80,-140 H18 L12,-80 C22,-86 32,-88 44,-88 C70,-88 86,-72 86,-44 C86,-16 68,2 42,2 C24,2 10,-4 2,-16', 'oo'],
  6: [88, 'M76,-134 C68,-140 58,-142 48,-142 C18,-142 2,-114 2,-70 C2,-24 18,2 46,2 C70,2 86,-16 86,-44 C86,-72 70,-88 46,-88 C26,-88 10,-78 2,-60', 'oo'],
  7: [88, 'M2,-140 H86 L32,0', 'oo'],
  8: [88, 'M44,-142 C66,-142 80,-130 80,-108 C80,-88 66,-76 44,-76 C22,-76 8,-88 8,-108 C8,-130 22,-142 44,-142 Z M44,-76 C70,-76 86,-62 86,-38 C86,-12 70,2 44,2 C18,2 2,-12 2,-38 C2,-62 18,-76 44,-76 Z', 'oo'],
  9: [88, 'M12,-8 C20,-2 30,2 40,2 C70,2 86,-26 86,-70 C86,-116 70,-142 42,-142 C18,-142 2,-124 2,-96 C2,-68 18,-52 42,-52 C62,-52 78,-62 86,-80', 'oo'],
  '.': [0, 'D0,-4', 'pp'],
  ',': [6, 'D6,-4 M6,-2 L0,22', 'pp'],
  ':': [0, 'D0,-92 D0,-4', 'pp'],
  ';': [6, 'D6,-92 D6,-4 M6,-2 L0,22', 'pp'],
  '-': [46, 'M0,-54 H46', 'vv'],
  '_': [86, 'M0,26 H86', 'vv'],
  "'": [0, 'M0,-148 V-110', 'vv'],
  '"': [26, 'M0,-148 V-110 M26,-148 V-110', 'vv'],
  '(': [32, 'M32,-152 C10,-120 0,-90 0,-58 C0,-26 10,4 32,36', 'ov'],
  ')': [32, 'M0,-152 C22,-120 32,-90 32,-58 C32,-26 22,4 0,36', 'vo'],
  '/': [60, 'M0,24 L60,-150', 'vv'],
  '?': [76, 'M2,-118 C8,-134 22,-142 40,-142 C62,-142 76,-128 76,-108 C76,-80 40,-76 40,-44 D40,-4', 'oo'],
  '!': [0, 'M0,-140 V-40 D0,-4', 'ss'],
  '+': [70, 'M0,-60 H70 M35,-95 V-25', 'vv'],
  '=': [70, 'M0,-78 H70 M0,-42 H70', 'vv'],
  '>': [70, 'M0,-98 L70,-60 L0,-22', 'vv'],
  '<': [70, 'M70,-98 L0,-60 L70,-22', 'vv'],
  '%': [124, 'M28,-142 A26,30 0 1 1 27.9,-142 M96,-58 A26,30 0 1 1 95.9,-58 M104,-140 L20,0', 'oo'],
  '&': [98, 'M98,0 L30,-86 C20,-98 16,-106 16,-114 C16,-130 28,-142 44,-142 C60,-142 70,-131 70,-116 C70,-100 60,-92 42,-80 C15,-62 0,-52 0,-33 C0,-12 16,2 40,2 C64,2 82,-16 90,-58', 'ov'],
  '#': [96, 'M30,-140 L18,0 M78,-140 L66,0 M4,-96 H96 M0,-44 H92', 'vv'],
};
const SIDE = { s: 12, o: 6, v: 2, p: 8 };
const DOT_R = 4;
const KERN = {
  ra: -8, ry: -6, ro: -5, re: -5, 'r.': -12, 'r,': -12, 'y.': -10, 'y,': -10, fa: -8, fo: -7, ta: -3,
  Ca: -4, Ta: -16, Te: -16, To: -16, Tr: -12, Ty: -12, AT: -14, TA: -14, Av: -8, Aw: -6, Yo: -12, Wa: -8, Vo: -8, Fo: -8, Pa: -8, LT: -14,
  wa: -3, aw: -3, av: -3, va: -3, ay: -3, ya: -3,
};

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
      const q = r2(DOT_R * s);
      out += `M${r1(ox + Number(tok[i++]) * s - DOT_R * s)} ${Y()}a${q} ${q} 0 1 0 ${r2(2 * DOT_R * s)} 0a${q} ${q} 0 1 0 ${r2(-2 * DOT_R * s)} 0`;
    } else if (c === 'Z') out += 'Z';
    else throw new Error(`bad glyph token "${c}" in "${src}"`);
  }
  return out;
}
function layout(str, wu, track = 0) {
  const items = [];
  let pen = 0, prev = null, prevCh = '';
  for (const ch of str) {
    if (ch === ' ') { pen += 64 + track; prev = null; prevCh = ''; continue; }
    const g = FONT[ch];
    if (!g) throw new Error(`no glyph for "${ch}" in "${str}"`);
    if (items.length) pen += wu + track + (prev ? SIDE[prev[2][1]] + SIDE[g[2][0]] + (KERN[prevCh + ch] || 0) : 0);
    items.push([g[1], pen, ch]);
    pen += g[0];
    prev = g; prevCh = ch;
  }
  return { items, width: pen };
}
// A run of text as path data. (x, y) is the baseline point named by `a` (s, m or e).
// `cap` is the cap height; `w` the stroke weight as a fraction of the cap height.
function textPath(str, x, y, cap, { a = 's', w = 0.11, track = 0 } = {}) {
  const s = cap / 140;
  const L = layout(str, w * 140, track);
  const width = L.width * s;
  const ox = a === 's' ? x : a === 'm' ? x - width / 2 : x - width;
  const glyphs = L.items.map(([src, gx, ch]) => ({ ch, x: ox + gx * s }));
  return { d: L.items.map(([src, gx]) => placeGlyph(src, ox + gx * s, y, s)).join(''), width, x0: ox, sw: cap * w, glyphs };
}
const textWidth = (str, cap, opts = {}) => textPath(str, 0, 0, cap, opts).width;
function T(str, x, y, cap, { c = '#000', o = 1, shadow = null, ...opts } = {}) {
  const t = textPath(str, x, y, cap, opts);
  let out = '';
  if (shadow) out += `<path class="t" d="${t.d}" transform="translate(${shadow[0]} ${shadow[1]})" stroke="${shadow[2]}"${shadow[3] < 1 ? ` stroke-opacity="${shadow[3]}"` : ''} stroke-width="${r2(t.sw)}"/>`;
  out += `<path class="t" d="${t.d}" stroke="${c}"${o < 1 ? ` stroke-opacity="${o}"` : ''} stroke-width="${r2(t.sw)}"/>`;
  return out;
}
function wrap(str, cap, maxW, opts = {}) {
  const words = str.split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (cur && textWidth(next, cap, opts) > maxW) { lines.push(cur); cur = w; } else cur = next;
  }
  if (cur) lines.push(cur);
  return lines;
}

// ------------------------------------------------------------------------------ motion
// track() turns keyframes [t, {x, y, r, s, o}, timing?] into a CSS animation and returns the
// class plus an inline style holding the frame at STATIC, which is what reduced motion shows.
// Times are seconds into the animation; `start` shifts the whole track with a negative delay.
const LOOP = 30;
const STATIC = 9.35;
const css = [];
function track(name, keys, { period = LOOP, start = 0 } = {}) {
  if (keys[0][0] !== 0) throw new Error(`${name}: first key must be at 0`);
  const use = { t: false, r: false, s: false, o: false };
  for (const [, p] of keys) { if ('x' in p || 'y' in p) use.t = true; if ('r' in p) use.r = true; if ('s' in p) use.s = true; if ('o' in p) use.o = true; }
  let prev = { x: 0, y: 0, r: 0, s: 1, o: 1 };
  const full = keys.map(([t, p, e]) => { const q = { ...prev, ...p }; prev = q; return [t, q, e]; });
  if (full[full.length - 1][0] < period) full.push([period, { ...full[full.length - 1][1] }]);
  const props = (q) => {
    const parts = [];
    if (use.t || use.r || use.s) {
      const tf = [];
      if (use.t) tf.push(`translate(${r2(q.x)}px,${r2(q.y)}px)`);
      if (use.r) tf.push(`rotate(${r2(q.r)}deg)`);
      if (use.s) tf.push(`scale(${r2(q.s)})`);
      parts.push(`transform:${tf.join(' ')}`);
    }
    if (use.o) parts.push(`opacity:${r2(q.o)}`);
    return parts.join(';');
  };
  const frames = full.map(([t, q, e]) => `${r2((t / period) * 100)}%{${props(q)}${e ? `;animation-timing-function:${e}` : ''}}`).join('');
  const delay = -((((-start) % period) + period) % period);
  css.push(`@keyframes ${name}{${frames}}.${name}{animation:${name} ${period}s linear infinite${delay ? ` ${r2(delay)}s` : ''}}`);
  const ph = (((STATIC - start) % period) + period) % period;
  let q = full[0][1];
  for (let i = 0; i < full.length - 1; i++) {
    const [t, a, e] = full[i];
    const [t2, b] = full[i + 1];
    if (ph >= t && ph < t2) {
      if (e && e.startsWith('step')) q = a;
      else {
        const f = (ph - t) / (t2 - t);
        q = {};
        for (const k of ['x', 'y', 'r', 's', 'o']) q[k] = a[k] + (b[k] - a[k]) * f;
      }
    }
  }
  return `class="${name}" style="${props(q)}"`;
}
const HOLD = 'step-end';

// ------------------------------------------------------------------------------ palette
const C = {
  surface: '#ece9d8', etchD: '#aca899', etchL: '#ffffff', ink: '#000000',
  sand: '#f3e2b0', sandSh: '#ddc58c', wet: '#d6bd88',
  skin: '#ecb48e', skinSh: '#d39470', hair: '#5a3926', hp: '#f5eddb', hpSh: '#d2c4a3',
  coral: '#e8705a', coralSh: '#c8553f', cream: '#efe5cb', creamSh: '#d5c6a1',
  trunk: '#a8664a', trunkD: '#7d4630',
  page: '#0e1116', panel: '#161b22', line: '#262d36', ptext: '#e6e9ee', dim: '#8b95a3', accent: '#5ed6be', btn: '#202733',
  balloon: '#ffffe1',
};

// ------------------------------------------------------------------------------ gradients
function defs() {
  const lg = (id, stops, x2 = 0, y2 = 1, extra = '') => `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}"${extra}>${stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a !== undefined ? ` stop-opacity="${a}"` : ''}/>`).join('')}</linearGradient>`;
  const rg = (id, stops, extra = '') => `<radialGradient id="${id}"${extra}>${stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a !== undefined ? ` stop-opacity="${a}"` : ''}/>`).join('')}</radialGradient>`;
  return [
    // desktop
    lg('wpSky', [[0, '#0b49c9'], [0.34, '#2a78e3'], [0.66, '#62acf1'], [1, '#b4dcfa']]),
    lg('wpHillB', [[0, '#a6d86a'], [1, '#5fa83a']]),
    lg('wpHillF', [[0, '#7fcf3a'], [0.35, '#4fa922'], [1, '#2a7413']]),
    rg('wpHillGlow', [[0, '#d8f59a', 0.75], [1, '#d8f59a', 0]]),
    rg('wpCloud', [[0, '#ffffff', 0.95], [0.55, '#ffffff', 0.7], [1, '#ffffff', 0]]),
    // window chrome (stops after XP.css)
    lg('xpTitle', [[0, '#0997ff'], [0.08, '#0053ee'], [0.4, '#0050ee'], [0.88, '#0066ff'], [0.93, '#0066ff'], [0.95, '#005bff'], [0.96, '#003dd7'], [1, '#003dd7']]),
    rg('capBlue', [[0, '#0054e9'], [0.55, '#2263d5'], [0.7, '#4479e4'], [0.9, '#a3bbec'], [1, '#ffffff']], ' cx=".9" cy=".9" r="1.1" fx=".9" fy=".9"'),
    rg('capRed', [[0, '#cc4600'], [0.55, '#dc6527'], [0.7, '#cd7546'], [0.9, '#ffccb2'], [1, '#ffffff']], ' cx=".9" cy=".9" r="1.1" fx=".9" fy=".9"'),
    lg('xpFrame', [[0, '#0831d9'], [0.35, '#166aee'], [0.65, '#166aee'], [1, '#0831d9']], 1, 0),
    lg('rebar', [[0, '#fbfaf6'], [1, '#e7e3d2']]),
    rg('greenBall', [[0, '#9be27e'], [0.55, '#3fae2a'], [1, '#1d7a14']], ' cx=".38" cy=".3" r=".8"'),
    rg('greyBall', [[0, '#f1f0ea'], [0.6, '#c9c6b8'], [1, '#a19e90']], ' cx=".38" cy=".3" r=".8"'),
    lg('goGreen', [[0, '#8ad86b'], [0.5, '#3fae2a'], [1, '#2a8a1c']]),
    lg('combo', [[0, '#c6d8fc'], [0.5, '#b2c9f6'], [1, '#97b3ee']]),
    lg('btnFace', [[0, '#ffffff'], [0.86, '#ecebe6'], [1, '#d6d0c5']]),
    lg('pblock', [[0, '#acedad'], [0.14, '#7be47d'], [0.28, '#4cda50'], [0.42, '#2ed330'], [0.57, '#42d845'], [0.71, '#76e275'], [0.85, '#8fe791'], [1, '#ffffff']]),
    // taskbar
    lg('tbBody', [[0, '#3168d5'], [0.04, '#4993e6'], [0.09, '#2157d7'], [0.15, '#2663e0'], [0.85, '#245edb'], [0.95, '#1d4fc4'], [1, '#1941a5']]),
    lg('tbBtn', [[0, '#64a3ff'], [0.1, '#3c81f3'], [0.85, '#2f72ec'], [1, '#2a64d6']]),
    lg('tbBtnOn', [[0, '#123d9e'], [0.12, '#1e52b7'], [1, '#2b62cc']]),
    lg('start', [[0, '#76c46c'], [0.08, '#5cb655'], [0.16, '#3d9e37'], [0.6, '#379632'], [0.88, '#2e8a2a'], [1, '#246f22']]),
    lg('tray', [[0, '#16a7f5'], [0.05, '#5bc8ff'], [0.1, '#0f9ff2'], [0.85, '#0c8ee6'], [1, '#0a7ad2']]),
    // scene
    lg('scSky', [[0, '#2c86e4'], [0.7, '#78c2f4'], [1, '#c7ebfd']]),
    lg('scSea', [[0, '#1863c8'], [0.3, '#1a7ed6'], [1, '#22a9dc']]),
    rg('scShallow', [[0, '#7eeadc'], [0.5, '#4fd4d8', 0.85], [1, '#22a9dc', 0]]),
    lg('scSand', [[0, '#fbf0cc'], [1, '#ead39b']]),
    lg('scTrunk', [[0, '#c27e5e'], [0.5, '#a8664a'], [1, '#7d4630']], 1, 0),
    rg('nut', [[0, '#9a6a42'], [1, '#55331c']], ' cx=".35" cy=".35" r=".75"'),
    rg('sun', [[0, '#fff3a6'], [0.6, '#ffc93c'], [1, '#ff9a1a']], ' cx=".4" cy=".35" r=".7"'),
    lg('glass', [[0, '#a7e6c4'], [1, '#5fae86']]),
  ].join('');
}

// ------------------------------------------------------------------------------ small icons
// The emblem: a sun with a palm and one wave, used for the window, the start button and the
// task button. Drawn in a 32 x 32 box centred on (16, 16).
function emblem(x, y, size) {
  const s = size / 32;
  return `<g transform="translate(${r1(x - size / 2)} ${r1(y - size / 2)}) scale(${r2(s)})">`
    + '<circle cx="16" cy="16" r="15" fill="url(#sun)" stroke="#c96a00" stroke-width="1.2"/>'
    + '<path d="M2.2,21 Q9,17.5 16,21 T29.8,21 A15,15 0 0 1 2.2,21Z" fill="#1f86e0"/>'
    + '<path d="M2.2,21 Q9,17.5 16,21 T29.8,21" fill="none" stroke="#fff" stroke-width="1.3"/>'
    + '<path d="M17,21 Q17.5,14 19.5,8.5" fill="none" stroke="#6b3f22" stroke-width="2"/>'
    + '<path d="M19.5,8.5 Q13,6 9,10 Q14,8.5 19.5,9.5 Q24,6 28,9.5 Q24,8 19.6,9.8 Q22,13 21.5,17 Q19.5,12.5 19.4,9.8 Q15,12 13,16 Q14.5,11 19.4,9.6Z" fill="#2f8f2a" stroke="#1e6b1b" stroke-width=".6" stroke-linejoin="round"/>'
    + '</g>';
}
// A 32 x 32 desktop icon, drawn at (x, y) = top-left, scaled by s.
function deskGlyph(kind, x, y, s) {
  const page = '<path d="M6,2 H20 L27,9 V30 H6 Z" fill="#fff" stroke="#61708a" stroke-width="1"/><path d="M20,2 V9 H27" fill="#dfe6f0" stroke="#61708a" stroke-width="1" stroke-linejoin="round"/>';
  const lines = (n, x0 = 9, x1 = 23, y0 = 13, c = '#8aa2c8') => Array.from({ length: n }, (_, k) => `M${x0},${y0 + k * 3.6}H${x1 - (k % 3 === 2 ? 5 : 0)}`).join('');
  let g = '';
  if (kind === 'musing') {
    g = page + `<path d="${lines(5)}" stroke="#8aa2c8" stroke-width="1.3"/>` + '<path d="M9,6.5 H17" stroke="#2f62c9" stroke-width="2"/>';
  } else if (kind === 'toml') {
    g = page + `<path d="${lines(4)}" stroke="#8aa2c8" stroke-width="1.3"/>`
      + '<circle cx="23" cy="24" r="7.2" fill="#fff" stroke="#2f62c9" stroke-width="1.6"/><path d="M23,19.5 V24 L26.2,25.8" fill="none" stroke="#1d3d8a" stroke-width="1.5" stroke-linecap="round"/>';
  } else if (kind === 'audio') {
    g = page + '<path d="M8.5,18 Q10.5,10 12.5,18 T16.5,18 T20.5,18 T24.5,18" fill="none" stroke="#3aa43a" stroke-width="1.6"/>'
      + '<circle cx="22.5" cy="24.5" r="6.8" fill="url(#sun)" stroke="#c96a00" stroke-width="1"/><path d="M21,27.5 V20.5 L25.5,19.5 V25.5" fill="none" stroke="#5a2d00" stroke-width="1.3"/><ellipse cx="20.2" cy="27.6" rx="1.6" ry="1.2" fill="#5a2d00"/><ellipse cx="24.7" cy="25.6" rx="1.6" ry="1.2" fill="#5a2d00"/>';
  } else if (kind === 'sea') {
    // the bin that always gives things back
    g = '<path d="M3,24 Q9,20 16,24 T29,24 V29 Q22.5,31.5 16,29 T3,29 Z" fill="#2d8fe0" stroke="#1d5fae" stroke-width="1"/>'
      + '<path d="M3,24 Q9,20 16,24 T29,24" fill="none" stroke="#fff" stroke-width="1.2"/>'
      + '<g transform="rotate(-28 16 15)"><rect x="10" y="9" width="10" height="13" rx="3" fill="url(#glass)" stroke="#2f7a55" stroke-width="1"/><rect x="13" y="4.5" width="4" height="5.5" fill="url(#glass)" stroke="#2f7a55" stroke-width="1"/><rect x="13.2" y="2.4" width="3.6" height="2.6" fill="#b8864f"/><rect x="12.5" y="12" width="5" height="7.5" rx="1" fill="#fff6d6"/><path d="M11.5,11 V19" stroke="#fff" stroke-opacity=".7" stroke-width="1"/></g>';
  }
  return `<g transform="translate(${r1(x)} ${r1(y)}) scale(${r2(s)})" stroke-linejoin="round">${g}</g>`;
}
// 16 x 16 icons for the taskbar, the tray and the balloons, centred on (x, y).
function tinyIcon(kind, x, y, size = 16) {
  const s = size / 16;
  let g = '';
  switch (kind) {
    case 'bubble': g = '<path d="M2,2.5 H14 Q15,2.5 15,3.5 V10 Q15,11 14,11 H8 L4.5,14 V11 H2 Q1,11 1,10 V3.5 Q1,2.5 2,2.5Z" fill="#ffffe1" stroke="#5a4a00" stroke-width=".9"/><path d="M8,4.5 V7.5 M8,9 V9.4" stroke="#1d4fc4" stroke-width="1.5" stroke-linecap="round"/>'; break;
    case 'clock': g = '<circle cx="8" cy="8" r="6.6" fill="#fff" stroke="#1d3d8a" stroke-width="1.3"/><path d="M8,4 V8 L10.8,9.6" fill="none" stroke="#1d3d8a" stroke-width="1.3" stroke-linecap="round"/>'; break;
    case 'speaker': g = '<path d="M2,6 H5 L9,2.5 V13.5 L5,10 H2Z" fill="#f2f2f2" stroke="#26375e" stroke-width=".9" stroke-linejoin="round"/><path d="M11,5.5 Q12.6,8 11,10.5 M12.8,3.6 Q15.6,8 12.8,12.4" fill="none" stroke="#fff" stroke-width="1.2" stroke-linecap="round"/>'; break;
    case 'term': g = '<rect x="1" y="2" width="14" height="12" rx="1" fill="#111" stroke="#c9d6f2" stroke-width=".9"/><rect x="1" y="2" width="14" height="2.8" fill="#2a64d6"/><path d="M3.5,7.5 L6,9.5 L3.5,11.5 M7.5,11.8 H11" fill="none" stroke="#d8d8d8" stroke-width="1.1" stroke-linecap="round"/>'; break;
    case 'phones': g = '<path d="M3,10 V8 Q3,2.5 8,2.5 Q13,2.5 13,8 V10" fill="none" stroke="#f5eddb" stroke-width="1.6"/><rect x="1.6" y="8.5" width="3.6" height="5.5" rx="1.4" fill="#f5eddb" stroke="#8a7a5c" stroke-width=".7"/><rect x="10.8" y="8.5" width="3.6" height="5.5" rx="1.4" fill="#f5eddb" stroke="#8a7a5c" stroke-width=".7"/>'; break;
    // one bar of signal: the rest are only available at the top of the palm
    case 'signal': g = [0, 1, 2, 3].map((k) => `<rect x="${1.5 + k * 3.6}" y="${12.5 - k * 3}" width="2.6" height="${2.5 + k * 3}" fill="#fff" fill-opacity="${k === 0 ? 1 : 0.28}"/>`).join(''); break;
    case 'info': g = '<circle cx="8" cy="8" r="7.2" fill="#2a6ae0" stroke="#173f99" stroke-width=".8"/><circle cx="8" cy="8" r="6" fill="none" stroke="#7fb0ff" stroke-width=".7"/><path d="M8,7 V12" stroke="#fff" stroke-width="2" stroke-linecap="round"/><circle cx="8" cy="4.4" r="1.2" fill="#fff"/>'; break;
    case 'device': g = '<rect x="1" y="3.5" width="14" height="10" rx="1.6" fill="#e9e6d8" stroke="#6d6a5a" stroke-width=".8"/><path d="M4.5,11 V9.5 Q4.5,6 8,6 Q11.5,6 11.5,9.5 V11" fill="none" stroke="#6f9f68" stroke-width="1.3"/><rect x="3.4" y="9.2" width="2.4" height="3.2" rx=".8" fill="#8fb98a"/><rect x="10.2" y="9.2" width="2.4" height="3.2" rx=".8" fill="#8fb98a"/>'; break;
    case 'shield': g = '<path d="M8,1 L14.5,3.2 V7.5 Q14.5,12.5 8,15.2 Q1.5,12.5 1.5,7.5 V3.2Z" fill="#d8301c" stroke="#7a1206" stroke-width=".8"/><path d="M8,2.6 L13,4.3 V7.6 Q13,11.4 8,13.6Z" fill="#fff" fill-opacity=".18"/><path d="M8,4.6 V9 M8,11.2 V11.6" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>'; break;
    case 'mail': g = '<rect x="1" y="3.5" width="14" height="9.5" rx="1" fill="#fffef4" stroke="#7d6a3a" stroke-width=".8"/><path d="M1.4,4 L8,9 L14.6,4" fill="none" stroke="#7d6a3a" stroke-width=".9"/><circle cx="12.6" cy="4.2" r="2.6" fill="#e8402a" stroke="#fff" stroke-width=".6"/>'; break;
    case 'audio': g = '<path d="M2,6 H5 L9,2.5 V13.5 L5,10 H2Z" fill="#ffd34d" stroke="#8a5a00" stroke-width=".8" stroke-linejoin="round"/><path d="M11,5.5 Q12.6,8 11,10.5 M12.8,3.6 Q15.6,8 12.8,12.4" fill="none" stroke="#2a6ae0" stroke-width="1.2" stroke-linecap="round"/>'; break;
    case 'page': g = '<path d="M3,1 H10 L13,4 V15 H3Z" fill="#fff" stroke="#61708a" stroke-width=".8"/><path d="M10,1 V4 H13" fill="none" stroke="#61708a" stroke-width=".8"/><circle cx="8" cy="9.5" r="3.4" fill="url(#sun)"/><path d="M4.8,10.6 Q8,9.4 11.2,10.6 A3.4,3.4 0 0 1 4.8,10.6Z" fill="#1f86e0"/>'; break;
    case 'globe': g = '<circle cx="8" cy="8" r="6.4" fill="#5cb8f0" stroke="#1d5fae" stroke-width=".8"/><path d="M5,4 Q7,6 5.5,8.5 Q4,10 5,12.5 M9,2.5 Q11,5 9.5,7 Q12,8 13.5,10" fill="none" stroke="#3a9a36" stroke-width="1.6" stroke-linecap="round"/>'; break;
    default: throw new Error(kind);
  }
  return `<g transform="translate(${r2(x - 8 * s)} ${r2(y - 8 * s)}) scale(${r2(s)})">${g}</g>`;
}

// ------------------------------------------------------------------------------ desktop
const W = 1000, H = 600;
const TB = 552;            // taskbar top
const WX = 114, WY = 8, WW = 652, WH = 538; // the browser window

function wallpaper() {
  const o = [];
  o.push(`<rect width="${W}" height="${H}" fill="url(#wpSky)"/>`);
  // soft clouds: radial ellipses, no filters
  const puff = (cx, cy, w, h) => {
    const parts = [[0, 0, 1, 1], [-0.38, 0.18, 0.62, 0.7], [0.4, 0.2, 0.6, 0.66], [0.05, -0.28, 0.55, 0.62], [-0.7, 0.32, 0.38, 0.4], [0.75, 0.34, 0.36, 0.38]];
    return parts.map(([dx, dy, sw, sh]) => `<ellipse cx="${r1(cx + dx * w)}" cy="${r1(cy + dy * h)}" rx="${r1(w * sw)}" ry="${r1(h * sh)}" fill="url(#wpCloud)"/>`).join('');
  };
  o.push(`<g class="wpc1">${puff(890, 74, 74, 26)}${puff(60, 405, 52, 16)}</g>`);
  o.push(`<g class="wpc2">${puff(952, 196, 46, 15)}${puff(820, 268, 38, 12)}${puff(30, 300, 34, 10)}</g>`);
  css.push('@keyframes wpc{from{transform:translateX(0)}to{transform:translateX(-26px)}}.wpc1{animation:wpc 40s ease-in-out infinite alternate}.wpc2{animation:wpc 56s ease-in-out infinite alternate-reverse}');
  // the hill: a far one, hazy, and the big near one with its crest on the right
  o.push('<path d="M0,438 C180,400 420,388 640,398 C800,404 900,418 1000,410 V600 H0Z" fill="url(#wpHillB)"/>');
  o.push('<path d="M0,520 C140,500 300,474 520,456 C690,442 780,382 870,378 C930,376 972,388 1000,398 V600 H0Z" fill="url(#wpHillF)"/>');
  o.push('<ellipse cx="880" cy="404" rx="120" ry="34" fill="url(#wpHillGlow)"/>');
  o.push('<ellipse cx="70" cy="520" rx="110" ry="22" fill="url(#wpHillGlow)" opacity=".6"/>');
  return o.join('');
}

function deskIcons() {
  const o = [];
  const items = [
    ['musing', ['MUSING.md']],
    ['toml', ['activities', '.toml']],
    ['audio', ['make_audio', '.py']],
    ['sea', ['Recycle Sea']],
  ];
  const cx = 56;
  items.forEach(([kind, label], k) => {
    const top = 18 + k * 98;
    o.push(deskGlyph(kind, cx - 24, top, 1.5));
    label.forEach((ln, j) => {
      o.push(T(ln, cx, top + 64 + j * 15, 10.5, { a: 'm', c: '#fff', shadow: [1.1, 1.1, '#00184f', 0.85] }));
    });
  });
  return o.join('');
}

// ------------------------------------------------------------------------------ the window
function captionButton(x, y, s, kind) {
  let g = `<rect x="${x}" y="${y}" width="${s}" height="${s}" rx="4.5" fill="url(#${kind === 'close' ? 'capRed' : 'capBlue'})" stroke="#fff" stroke-width="1.4"/>`;
  if (kind === 'min') g += `<rect x="${x + 8}" y="${y + s - 12}" width="11" height="4" fill="#fff"/>`;
  if (kind === 'max') g += `<rect x="${x + 8.5}" y="${y + 8.5}" width="${s - 17}" height="${s - 17}" fill="none" stroke="#fff" stroke-width="1.6"/><rect x="${x + 8.5}" y="${y + 8.5}" width="${s - 17}" height="4" fill="#fff"/>`;
  if (kind === 'close') g += `<path d="M${x + 10},${y + 10}L${x + s - 10},${y + s - 10}M${x + s - 10},${y + 10}L${x + 10},${y + s - 10}" stroke="#fff" stroke-width="3.4" stroke-linecap="round"/>`;
  return g;
}

function browserWindow() {
  const o = [];
  const x = WX, y = WY, w = WW, h = WH;
  const R = 12;
  // frame and title bar
  o.push(`<rect x="${x}" y="${y + 30}" width="${w}" height="${h - 30}" rx="3" fill="url(#xpFrame)"/>`);
  o.push(`<path d="M${x},${y + 44}V${y + R}A${R},${R} 0 0 1 ${x + R},${y}H${x + w - R}A${R},${R} 0 0 1 ${x + w},${y + R}V${y + 44}Z" fill="url(#xpTitle)"/>`);
  o.push(`<path d="M${x + 3},${y + 10}A${R - 3},${R - 4} 0 0 1 ${x + R},${y + 1.3}H${x + w - R}A${R - 3},${R - 4} 0 0 1 ${x + w - 3},${y + 10}" fill="none" stroke="#7cc4ff" stroke-opacity=".55" stroke-width="1.2"/>`);
  o.push(emblem(x + 24, y + 22, 24));
  o.push(T('Castaway - live preview', x + 44, y + 29.5, 15, { w: 0.17, c: '#fff', shadow: [1.4, 1.4, '#0f1089', 1] }));
  const bs = 31;
  o.push(captionButton(x + w - 8 - bs, y + 7, bs, 'close'));
  o.push(captionButton(x + w - 8 - bs * 2 - 3, y + 7, bs, 'max'));
  o.push(captionButton(x + w - 8 - bs * 3 - 6, y + 7, bs, 'min'));
  // client area
  const cx = x + 6, cw = w - 12;
  o.push(`<rect x="${cx}" y="${y + 44}" width="${cw}" height="${h - 50}" fill="${C.surface}"/>`);
  // menu bar
  let mx = cx + 12;
  for (const item of ['File', 'Edit', 'View', 'Island', 'Help']) {
    o.push(T(item, mx, y + 61, 10.5));
    mx += textWidth(item, 10.5) + 19;
  }
  // rebar: back, forward, address, go
  const ry = y + 68;
  o.push(`<rect x="${cx}" y="${ry}" width="${cw}" height="40" fill="url(#rebar)"/>`);
  o.push(`<path d="M${cx},${ry + 0.5}H${cx + cw}" stroke="${C.etchD}"/><path d="M${cx},${ry + 1.5}H${cx + cw}" stroke="#fff"/>`);
  o.push(`<path d="M${cx},${ry + 39.5}H${cx + cw}" stroke="${C.etchD}"/>`);
  const grip = (gx) => Array.from({ length: 7 }, (_, k) => `<rect x="${gx}" y="${ry + 7 + k * 4}" width="1.6" height="1.6" fill="#a8a493"/><rect x="${gx + 0.8}" y="${ry + 7.8 + k * 4}" width="1.6" height="1.6" fill="#fff"/>`).join('');
  o.push(grip(cx + 4));
  const ball = (bx, fill, dir, edge) => `<circle cx="${bx}" cy="${ry + 20}" r="14" fill="url(#${fill})" stroke="${edge}" stroke-width="1.2"/><path d="${dir < 0 ? `M${bx + 7},${ry + 20}H${bx - 6}M${bx - 1},${ry + 14}L${bx - 7},${ry + 20}L${bx - 1},${ry + 26}` : `M${bx - 7},${ry + 20}H${bx + 6}M${bx + 1},${ry + 14}L${bx + 7},${ry + 20}L${bx + 1},${ry + 26}`}" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>`;
  const drop = (dx) => `<path d="M${dx},${ry + 18}h6l-3,3.6z" fill="#000"/>`;
  o.push(ball(cx + 28, 'greenBall', -1, '#2a7a1e'));
  o.push(T('Back', cx + 48, ry + 24.5, 10.5));
  o.push(drop(cx + 82));
  o.push(ball(cx + 112, 'greyBall', 1, '#9a978a'));
  o.push(drop(cx + 132));
  o.push(`<path d="M${cx + 146.5},${ry + 6}V${ry + 34}" stroke="${C.etchD}"/><path d="M${cx + 147.5},${ry + 6}V${ry + 34}" stroke="#fff"/>`);
  o.push(grip(cx + 152));
  o.push(T('Address', cx + 166, ry + 24.5, 10.5, { c: '#444' }));
  const ax0 = cx + 168 + textWidth('Address', 10.5) + 8, ax1 = cx + cw - 62;
  o.push(`<rect x="${ax0}" y="${ry + 9}" width="${ax1 - ax0}" height="22" fill="#fff" stroke="#7f9db9"/>`);
  o.push(tinyIcon('page', ax0 + 12, ry + 20, 14));
  o.push(T('http://127.0.0.1:8765/', ax0 + 24, ry + 24.5, 10.5));
  o.push(`<rect x="${ax1 - 19}" y="${ry + 10.5}" width="17.5" height="19" rx="2.5" fill="url(#combo)" stroke="#b9cdf6"/><path d="M${ax1 - 14.2},${ry + 18}L${ax1 - 10.2},${ry + 22}L${ax1 - 6.2},${ry + 18}" fill="none" stroke="#4d6185" stroke-width="2"/>`);
  o.push(`<rect x="${ax1 + 8}" y="${ry + 10}" width="20" height="20" rx="3" fill="url(#goGreen)" stroke="#2f7f22"/><path d="M${ax1 + 12},${ry + 20}H${ax1 + 23}M${ax1 + 19},${ry + 15.5}L${ax1 + 23.5},${ry + 20}L${ax1 + 19},${ry + 24.5}" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`);
  o.push(T('Go', ax1 + 33, ry + 24.5, 10.5));
  // the page: the renderer, in its own dark colours
  const py = ry + 40, ph = h - 30 - (py - y);
  o.push(`<rect x="${cx}" y="${py}" width="${cw}" height="${ph}" fill="${C.page}"/>`);
  const sx = cx + 14, sy = py + 12, sw = cw - 28, sh = sw * 9 / 16;
  o.push(`<rect x="${sx - 1}" y="${sy - 1}" width="${sw + 2}" height="${r2(sh + 2)}" rx="9" fill="${C.line}"/>`);
  o.push(`<g transform="translate(${sx} ${sy}) scale(${r2(sw / 640)})" clip-path="url(#screenClip)">${scene()}</g>`);
  // the player row
  const rowY = sy + sh + 8;
  o.push(controlRow(sx, rowY, sw));
  // status bar
  const stY = y + h - 30;
  o.push(statusBar(cx, stY, cw));
  return { svg: o.join(''), screen: { sx, sy, sw, sh } };
}

// The player row under the preview: pause, the run clock, the scrub bar, Export MP4.
// The clock really counts: each digit is a strip of glyphs stepping on its own period, so
// it runs from 2:47:03 when you open the page and only wraps after ten hours.
const T0 = 2 * 3600 + 47 * 60 + 3;
function controlRow(x, y, w) {
  const o = [];
  const hgt = 26;
  o.push(`<rect x="${x}" y="${y}" width="30" height="${hgt}" rx="6" fill="${C.btn}" stroke="${C.line}"/><rect x="${x + 11}" y="${y + 8}" width="3" height="10" fill="${C.ptext}"/><rect x="${x + 17}" y="${y + 8}" width="3" height="10" fill="${C.ptext}"/>`);
  const cap = 10;
  const base = y + 17.5;
  const str = '2:47:03 / 10:00:00';
  const tp = textPath(str, x + 42, base, cap);
  // static parts: everything except the five live digits
  const live = { 0: ['h', 10, 3600], 2: ['m10', 6, 600], 3: ['m1', 10, 60], 5: ['s10', 6, 10], 6: ['s1', 10, 1] };
  let gi = 0;
  const glyphs = tp.glyphs;
  const sPaths = [];
  const s = cap / 140;
  [...str].forEach((ch, i) => {
    if (ch === ' ') return;
    const g = glyphs[gi++];
    if (live[i]) {
      const [nm, n, unit] = live[i];
      const rowH = cap + 7;
      const period = n * unit;
      const digit = Math.floor((T0 % period) / unit);
      const delay = -(T0 % period);
      const strip = Array.from({ length: n }, (_, k) => placeGlyph(FONT[String(k)][1], g.x, base + k * rowH, s)).join('');
      css.push(`@keyframes tc${nm}{from{transform:translateY(0)}to{transform:translateY(${-n * rowH}px)}}.tc${nm}{animation:tc${nm} ${period}s steps(${n},end) infinite ${delay}s}`);
      o.push(`<g clip-path="url(#tcClip${i})"><g class="tc${nm}" style="transform:translateY(${-digit * rowH}px)"><path class="t" d="${strip}" stroke="${C.ptext}" stroke-width="${r2(tp.sw)}"/></g></g>`);
      defsExtra.push(`<clipPath id="tcClip${i}"><rect x="${r1(g.x - 2)}" y="${r1(base - cap - 2.5)}" width="${r1(88 * s + 4)}" height="${r1(cap + 5)}"/></clipPath>`);
    } else {
      sPaths.push(placeGlyph(FONT[ch][1], g.x, base, s));
    }
  });
  o.push(`<path class="t" d="${sPaths.join('')}" stroke="${C.ptext}" stroke-width="${r2(tp.sw)}"/>`);
  // Export MP4
  const exW = textWidth('Export MP4', cap) + 22;
  const exX = x + w - exW;
  o.push(`<rect x="${r1(exX)}" y="${y}" width="${r1(exW)}" height="${hgt}" rx="6" fill="${C.btn}" stroke="${C.accent}" stroke-opacity=".7"/>`);
  o.push(T('Export MP4', exX + 11, base, cap, { c: C.ptext }));
  // scrub bar, ten hours long
  const a = x + 42 + tp.width + 14, b = exX - 14;
  const frac = T0 / 36000;
  o.push(`<rect x="${r1(a)}" y="${y + 11}" width="${r1(b - a)}" height="4" rx="2" fill="${C.line}"/>`);
  o.push(`<g transform="translate(${r1(a)} ${y + 11})"><g class="scrubF" style="transform:scaleX(${r2(frac)})"><rect width="${r1(b - a)}" height="4" rx="2" fill="${C.accent}"/></g><g class="scrubT" style="transform:translateX(${r2(frac * (b - a))}px)"><circle cx="0" cy="2" r="5.5" fill="${C.ptext}"/></g></g>`);
  css.push(`@keyframes scrubF{from{transform:scaleX(0)}to{transform:scaleX(1)}}.scrubF{animation:scrubF 36000s linear infinite ${-T0}s}`);
  css.push(`@keyframes scrubT{from{transform:translateX(0)}to{transform:translateX(${r1(b - a)}px)}}.scrubT{animation:scrubT 36000s linear infinite ${-T0}s}`);
  return o.join('');
}

function statusBar(x, y, w) {
  const o = [];
  o.push(`<rect x="${x}" y="${y}" width="${w}" height="24" fill="${C.surface}"/><path d="M${x},${y + 0.5}H${x + w}" stroke="#fff"/>`);
  o.push(tinyIcon('page', x + 12, y + 12.5, 14));
  const msg = 'Waiting for something to happen...';
  o.push(T(msg, x + 24, y + 16.5, 10));
  const sep = (sx) => `<path d="M${r1(sx)},${y + 3}V${y + 21}" stroke="${C.etchD}"/><path d="M${r1(sx + 1)},${y + 3}V${y + 21}" stroke="#fff"/>`;
  const p0 = x + 24 + textWidth(msg, 10) + 16;
  o.push(sep(p0));
  // the endless progress bar: three green blocks marching left to right, for ever
  const tx = Math.round(p0 + 10), tw = 150, ty = y + 5, th = 14;
  o.push(`<rect x="${tx}" y="${ty}" width="${tw}" height="${th}" rx="3.5" fill="#fff" stroke="#686868"/>`);
  defsExtra.push(`<clipPath id="pbClip"><rect x="${tx + 2}" y="${ty + 2}" width="${tw - 4}" height="${th - 4}" rx="2"/></clipPath>`);
  const blocks = [0, 1, 2].map((k) => `<rect x="${k * 10}" y="${ty + 2}" width="8" height="${th - 4}" fill="url(#pblock)"/>`).join('');
  o.push(`<g clip-path="url(#pbClip)"><g transform="translate(${tx} 0)"><g ${track('pb', [[0, { x: -30 }], [2.4, { x: tw + 2 }]], { period: 2.4, start: STATIC - 1 })}>${blocks}</g></g></g>`);
  const p1 = tx + tw + 10;
  o.push(sep(p1));
  o.push(tinyIcon('globe', p1 + 14, y + 12.5, 14));
  o.push(T('Island zone', p1 + 26, y + 16.5, 10));
  // size grip
  const gx = x + w - 4, gy = y + 20;
  for (let i = 0; i < 3; i++) for (let j = 0; j <= i; j++) o.push(`<rect x="${gx - 3.5 - j * 4}" y="${gy - 3.5 - (i - j) * 4}" width="2" height="2" fill="#aca899"/>`);
  return o.join('');
}

// The pointer, resting where somebody left it: an arrow with the little hourglass that means
// "working in the background". The sand turns over every bar.
function cursor(x, y) {
  const arrow = 'M0,0 V17 L4,13 L7,20 L9.6,19 L6.8,12.2 H12.4Z';
  const glass = '<path d="M0,0 H8 M0,13 H8" stroke="#000" stroke-width="1.4"/><path d="M1,0.7 C1,4.6 3.3,5.4 3.3,6.5 C3.3,7.6 1,8.4 1,12.3 H7 C7,8.4 4.7,7.6 4.7,6.5 C4.7,5.4 7,4.6 7,0.7Z" fill="#fff" stroke="#000" stroke-width=".9"/><path d="M2.2,3 H5.8 L4,5.8Z M2,11.6 C2.6,10 3.4,9.4 4,9.4 C4.6,9.4 5.4,10 6,11.6Z" fill="#d9a400"/>';
  return `<g transform="translate(${x} ${y}) scale(1.35)"><path d="${arrow}" transform="translate(1 1)" fill="#000" fill-opacity=".25"/><path d="${arrow}" fill="#fff" stroke="#000" stroke-width="1" stroke-linejoin="round"/>`
    + `<g transform="translate(14 10)"><g transform="translate(4 6.5)"><g ${track('hglass', [[0, { r: 0 }, HOLD], [2.6, { r: 90 }, HOLD], [2.75, { r: 180 }, HOLD]], { period: 3 })}><g transform="translate(-4 -6.5)">${glass}</g></g></g></g></g>`;
}

// ------------------------------------------------------------------------------ taskbar
function taskbar() {
  const o = [];
  o.push(`<rect x="0" y="${TB}" width="${W}" height="${H - TB}" fill="url(#tbBody)"/>`);
  // start
  o.push(`<path d="M0,${TB}H122A26,24 0 0 1 122,${H}H0Z" fill="url(#start)"/>`);
  o.push(`<path d="M122,${TB}A26,24 0 0 1 122,${H}" fill="none" stroke="#1b5a19" stroke-opacity=".55" stroke-width="2"/>`);
  o.push(`<path d="M0,${TB + 1.2}H122" stroke="#9fe08f" stroke-opacity=".6" stroke-width="1.2"/>`);
  o.push(emblem(26, TB + 24, 26));
  const st = textPath('start', 0, 0, 22, { w: 0.19 });
  o.push(`<g transform="translate(46 ${TB + 33}) skewX(-12)"><path class="t" d="${st.d}" transform="translate(1.6 1.6)" stroke="#1f4d1c" stroke-opacity=".8" stroke-width="${r2(st.sw)}"/><path class="t" d="${st.d}" stroke="#fff" stroke-width="${r2(st.sw)}"/></g>`);
  // task buttons: the README's sections
  const btns = [['emblem', 'Castaway', true], ['bubble', 'Gags'], ['clock', 'Schedule'], ['speaker', 'Sound'], ['term', 'Run it']];
  let bx = 160;
  const bw = 126;
  for (const [ic, label, on] of btns) {
    o.push(`<rect x="${bx}" y="${TB + 6}" width="${bw}" height="36" rx="4" fill="url(#${on ? 'tbBtnOn' : 'tbBtn'})" stroke="${on ? '#0f327f' : '#1b4fc0'}"/>`);
    if (!on) o.push(`<path d="M${bx + 3},${TB + 7.6}H${bx + bw - 3}" stroke="#a9cbff" stroke-opacity=".7"/>`);
    o.push(ic === 'emblem' ? emblem(bx + 19, TB + 24, 20) : tinyIcon(ic, bx + 19, TB + 24, 19));
    o.push(T(label, bx + 35, TB + 29, 11, { c: '#fff', w: on ? 0.15 : 0.11, shadow: [1, 1, '#0b2a78', 0.7] }));
    bx += bw + 5;
  }
  // tray
  const tx = 840;
  o.push(`<rect x="${tx}" y="${TB}" width="${W - tx}" height="${H - TB}" fill="url(#tray)"/>`);
  o.push(`<path d="M${tx + 0.5},${TB}V${H}" stroke="#0d3a9e" stroke-width="1.4"/><path d="M${tx + 2},${TB + 1}V${H}" stroke="#57c9ff" stroke-opacity=".7"/>`);
  o.push(tinyIcon('phones', TRAY_PHONES, TB + 24, 18));
  o.push(tinyIcon('signal', TRAY_PHONES + 27, TB + 24, 17));
  o.push(T('12:00 PM', W - 12, TB + 29.5, 11, { a: 'e', c: '#fff', shadow: [1, 1, '#06357f', 0.6] }));
  return o.join('');
}
const TRAY_PHONES = 864;

// ------------------------------------------------------------------------------ balloons
// Each balloon is up for about five seconds of its six-second slot, popping up with a slight
// scale from the tip of its tail, which points at the headphones in the tray.
const BALLOONS = [
  ['info', 'Nothing is happening', 'She is idle about two thirds of the time. This is normal. No action is required.'],
  ['device', 'Found New Hardware', 'Headphones (another pair), delivered by drone. Your new hardware is installed and ready to use.'],
  ['shield', 'Hermit crab at risk', 'A coconut is directly above it. Recommended action: none.'],
  ['mail', '1 new message', 'A message in a bottle has washed up. It is the one she just sent.'],
  ['audio', 'New audio device', 'Shark (wearing headphones). It nods once a beat, 80 times a minute.'],
];
function balloons() {
  const o = [];
  const ax = TRAY_PHONES - 2, ay = TB + 12;
  const x0 = 742, x1 = 992, y1 = TB - 20, r = 9;
  BALLOONS.forEach(([icon, title, body], k) => {
    const lines = wrap(body, 10, x1 - x0 - 28);
    const hgt = 46 + lines.length * 16;
    const y0 = y1 - hgt;
    const bx2 = ax - 6, bx1 = ax - 30;
    const shape = `M${x0 + r},${y0}H${x1 - r}A${r},${r} 0 0 1 ${x1},${y0 + r}V${y1 - r}A${r},${r} 0 0 1 ${x1 - r},${y1}H${bx2}L${ax},${ay}L${bx1},${y1}H${x0 + r}A${r},${r} 0 0 1 ${x0},${y1 - r}V${y0 + r}A${r},${r} 0 0 1 ${x0 + r},${y0}Z`;
    let g = `<path d="${shape}" transform="translate(3 3)" fill="#000" fill-opacity=".22"/>`;
    g += `<path d="${shape}" fill="${C.balloon}" stroke="#000" stroke-width="1.1"/>`;
    g += tinyIcon(icon, x0 + 22, y0 + 20, 20);
    if (textWidth(title, 11, { w: 0.16 }) > x1 - x0 - 74) throw new Error(`balloon title too wide: ${title}`);
    g += T(title, x0 + 40, y0 + 25, 11, { w: 0.16 });
    g += `<rect x="${x1 - 25}" y="${y0 + 9}" width="16" height="16" rx="3" fill="url(#btnFace)" stroke="#a7a39a"/><path d="M${x1 - 21},${y0 + 13}L${x1 - 13},${y0 + 21}M${x1 - 13},${y0 + 13}L${x1 - 21},${y0 + 21}" stroke="#555" stroke-width="1.5"/>`;
    lines.forEach((ln, j) => { g += T(ln, x0 + 14, y0 + 50 + j * 16, 10); });
    const keys = [[0, { s: 0.9, o: 0 }, 'ease-out'], [0.22, { s: 1, o: 1 }], [5.3, { s: 1, o: 1 }], [5.55, { s: 1, o: 0 }, HOLD], [5.6, { s: 0.9, o: 0 }]];
    o.push(`<g transform="translate(${ax} ${ay})"><g ${track(`bal${k}`, keys, { start: k * 6 - 0.35 })}><g transform="translate(${-ax} ${-ay})">${g}</g></g></g>`);
  });
  return o.join('');
}

// ------------------------------------------------------------------------------ the island
// Drawn on a 640 x 360 grid (16:9, like the video) and scaled into the page.
const HZ = 140; // horizon
function cumulus(cx, by, w, h, rnd) {
  // a towering cumulus: three tiers of puffs, each narrower and higher, shaded underneath
  let shade = '', body = '', lit = '';
  for (let tier = 0; tier < 3; tier++) {
    const tw = w * (1 - 0.3 * tier);
    const n = Math.max(2, Math.round(tw / 15));
    const rr0 = h * (0.34 - 0.06 * tier);
    for (let i = 0; i < n; i++) {
      const t = n === 1 ? 0.5 : i / (n - 1);
      const x = cx - tw / 2 + t * tw + (rnd() - 0.5) * 6;
      const rr = rr0 * (0.75 + 0.45 * Math.sin(Math.PI * t)) + rnd() * 2.5;
      const y = by - h * (0.18 + 0.34 * tier) - Math.sin(Math.PI * t) * h * 0.12 + (rnd() - 0.5) * 3;
      shade += `<circle cx="${r1(x + 1.5)}" cy="${r1(y + 2.5)}" r="${r1(rr)}"/>`;
      body += `<circle cx="${r1(x - 0.5)}" cy="${r1(y - 0.8)}" r="${r1(rr * 0.94)}"/>`;
      if (tier > 0 || rnd() < 0.5) lit += `<circle cx="${r1(x - rr * 0.25)}" cy="${r1(y - rr * 0.3)}" r="${r1(rr * 0.55)}"/>`;
    }
  }
  return `<g fill="#c4dbf3">${shade}</g><g fill="#f4f9ff">${body}</g><g fill="#fff">${lit}</g>`;
}

function palm() {
  const o = [];
  // trunk: a tapered cubic, slender, leaning right
  const P = [[350, 270], [354, 214], [372, 150], [387, 98]];
  const bez = (t) => {
    const u = 1 - t;
    return [0, 1].map((k) => u * u * u * P[0][k] + 3 * u * u * t * P[1][k] + 3 * u * t * t * P[2][k] + t * t * t * P[3][k]);
  };
  const N = 26;
  const left = [], right = [], rings = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const [x, y] = bez(t);
    const [x2, y2] = bez(Math.min(1, t + 0.01));
    const [x1, y1] = bez(Math.max(0, t - 0.01));
    let tx = x2 - x1, ty = y2 - y1;
    const L = Math.hypot(tx, ty); tx /= L; ty /= L;
    const nx = -ty, ny = tx;
    const hw = 6.2 - 2.6 * t + (i === 0 ? 1.6 : 0);
    left.push([x + nx * hw, y + ny * hw]);
    right.push([x - nx * hw, y - ny * hw]);
    if (i > 0 && i < N && i % 2 === 0) rings.push(`M${r1(x + nx * hw)},${r1(y + ny * hw)}Q${r1(x + tx * 2)},${r1(y + ty * 2 + 1.4)} ${r1(x - nx * hw)},${r1(y - ny * hw)}`);
  }
  const poly = [...left, ...right.reverse()].map(([x, y], i) => `${i ? 'L' : 'M'}${r1(x)},${r1(y)}`).join('') + 'Z';
  o.push(`<path d="${poly}" fill="url(#scTrunk)"/>`);
  o.push(`<path d="${rings.join('')}" fill="none" stroke="${C.trunkD}" stroke-opacity=".75" stroke-width="1.3"/>`);
  // crown: leaflets stroked along each frond's midrib
  const cx = 387, cy = 95;
  const fronds = [
    [-160, 56, 16, 'b'], [-122, 42, 4, 'b'], [-58, 44, 4, 'b'], [-18, 58, 16, 'b'],
    [172, 62, 30, 'f'], [138, 46, 38, 'f'], [8, 64, 30, 'f'], [44, 48, 38, 'f'],
  ];
  const frondPaths = { b: [], f: [], rib: [] };
  for (const [deg, len, droop, layer] of fronds) {
    const a = (deg * Math.PI) / 180;
    const dx = Math.cos(a), dy = Math.sin(a);
    const tip = [cx + dx * len, cy + dy * len + droop];
    const ctl = [cx + dx * len * 0.55, cy + dy * len * 0.55 - len * 0.22];
    const q = (t) => [0, 1].map((k) => (1 - t) * (1 - t) * [cx, cy][k] + 2 * (1 - t) * t * ctl[k] + t * t * tip[k]);
    frondPaths.rib.push(`M${cx},${cy}Q${r1(ctl[0])},${r1(ctl[1])} ${r1(tip[0])},${r1(tip[1])}`);
    for (let t = 0.12; t <= 0.97; t += 0.065) {
      const [px, py] = q(t);
      const [qx, qy] = q(Math.min(1, t + 0.02));
      let tx = qx - px, ty = qy - py;
      const L = Math.hypot(tx, ty) || 1; tx /= L; ty /= L;
      const ll = 3 + 11 * Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.15)), 0.8);
      for (const side of [1, -1]) {
        let lx = -ty * side * 0.75 + tx * 0.45, ly = tx * side * 0.75 + ty * 0.45 + 0.55;
        const LL = Math.hypot(lx, ly); lx /= LL; ly /= LL;
        frondPaths[layer].push(`M${r1(px)},${r1(py)}l${r1(lx * ll)},${r1(ly * ll)}`);
      }
    }
  }
  const crown = `<path d="${frondPaths.b.join('')}" stroke="#2f7f2c" stroke-width="2.6" stroke-linecap="round" fill="none"/>`
    + `<path d="${frondPaths.rib.join('')}" stroke="#2a6e26" stroke-width="1.6" fill="none"/>`
    + `<path d="${frondPaths.f.join('')}" stroke="#4da83b" stroke-width="2.6" stroke-linecap="round" fill="none"/>`
    + `<path d="${frondPaths.f.filter((_, i) => i % 3 === 0).join('')}" stroke="#86cf55" stroke-width="1.1" stroke-linecap="round" fill="none"/>`;
  const nuts = `<circle cx="381" cy="101" r="4.4" fill="url(#nut)"/><circle cx="391.5" cy="102" r="4.4" fill="url(#nut)"/>`;
  const nut3 = `<g ${track('nut3', [[0, { o: 1 }, HOLD], [14.2, { o: 0 }, HOLD], [18, { o: 1 }]])}><circle cx="386" cy="107" r="4.5" fill="url(#nut)"/></g>`;
  o.push(`<g transform="translate(${cx} ${cy + 4})"><g ${track('sway', [[0, { r: 0 }, HOLD], [3, { r: 1.6 }, HOLD], [6, { r: 0 }]], { period: 6 })}><g transform="translate(${-cx} ${-cy - 4})">${crown}${nuts}${nut3}</g></g></g>`);
  return o.join('');
}

// Her: small and simple. Coral tank top, cream shorts, cream headphones, brown hair in a low
// bun, bare feet. Feet at (0, 0); she nods on every beat (hard cut down, hard cut back).
function her(x, y) {
  const o = [];
  o.push(`<ellipse cx="0" cy="0.6" rx="13" ry="2.6" fill="#c9ad74" fill-opacity=".55"/>`);
  // legs and feet
  o.push(`<path d="M-7,-30 L-5.4,-16 L-4.6,-2.6 L-1.9,-2.6 L-1.9,-16 L-0.6,-30Z M0.6,-30 L1.9,-16 L1.9,-2.6 L4.6,-2.6 L5.4,-16 L7,-30Z" fill="${C.skin}"/>`);
  o.push(`<path d="M3.4,-29 L4.2,-16 L4.1,-3 L4.6,-2.6 L5.4,-16 L7,-30Z" fill="${C.skinSh}" fill-opacity=".6"/>`);
  o.push(`<ellipse cx="-3.9" cy="-1.3" rx="2.7" ry="1.4" fill="${C.skin}"/><ellipse cx="3.9" cy="-1.3" rx="2.7" ry="1.4" fill="${C.skin}"/>`);
  // shorts
  o.push(`<path d="M-7.6,-39.5 L7.6,-39.5 L8.7,-28.4 Q4.6,-27 1.1,-28 L0,-31.4 L-1.1,-28 Q-4.6,-27 -8.7,-28.4Z" fill="${C.cream}"/>`);
  o.push(`<path d="M3.6,-39.5 L7.6,-39.5 L8.7,-28.4 Q6.4,-27.6 5,-27.7Z" fill="${C.creamSh}"/>`);
  // arms: left hangs loose, right hand on the hip
  o.push(`<path d="M-7.8,-52.5 Q-10.2,-47.5 -9.8,-43 Q-9.8,-38.6 -9.2,-34.8 M7.8,-52.5 Q10.6,-48 10.4,-44.6 Q9.6,-41 7.2,-39.6" fill="none" stroke="${C.skin}" stroke-width="3.1" stroke-linecap="round"/>`);
  o.push(`<ellipse cx="-9.1" cy="-33.8" rx="1.7" ry="2" fill="${C.skin}"/>`);
  o.push(`<ellipse cx="0" cy="-53" rx="8.6" ry="2.7" fill="${C.skin}"/>`);
  // tank top
  o.push(`<path d="M-6.4,-55 L-4,-55 Q-3,-51.8 0,-51.6 Q3,-51.8 4,-55 L6.4,-55 Q7.2,-51 7.8,-48 Q8.4,-44 7.9,-38.8 L-7.9,-38.8 Q-8.4,-44 -7.8,-48 Q-7.2,-51 -6.4,-55Z" fill="${C.coral}"/>`);
  o.push(`<path d="M3.6,-50 Q6.6,-49 7.8,-48 Q8.4,-44 7.9,-38.8 L4.4,-38.8 Q5.4,-44 3.6,-50Z" fill="${C.coralSh}"/>`);
  o.push(`<rect x="-1.7" y="-58.2" width="3.4" height="5" fill="${C.skin}"/><rect x="-1.7" y="-55.8" width="3.4" height="1.6" fill="${C.skinSh}" fill-opacity=".7"/>`);
  // head (nods)
  const head = `<ellipse cx="-0.2" cy="-62" rx="6.5" ry="6.7" fill="${C.hair}"/>`
    + `<circle cx="-6.3" cy="-57.8" r="3" fill="${C.hair}"/><path d="M-6.8,-59.6 Q-5.4,-58 -4.6,-56.6" fill="none" stroke="#3e2617" stroke-width=".7"/>`
    + `<ellipse cx="0.3" cy="-60.9" rx="5.1" ry="5.6" fill="${C.skin}"/>`
    + `<path d="M-5.7,-61.2 Q-6.2,-68.4 0,-68.6 Q6.2,-68.4 5.9,-61.2 Q4.6,-64.6 2.1,-64.8 Q0.6,-63 -0.9,-64.6 Q-3.4,-65 -5.7,-61.2Z" fill="${C.hair}"/>`
    + `<path d="M-6.4,-60.6 Q-7,-71 0,-71.1 Q7,-71 6.6,-60.6" fill="none" stroke="${C.hp}" stroke-width="1.6"/>`
    + `<ellipse cx="-6.1" cy="-60.2" rx="2" ry="2.8" fill="${C.hp}" stroke="${C.hpSh}" stroke-width=".6"/><ellipse cx="6.5" cy="-60.2" rx="2" ry="2.8" fill="${C.hp}" stroke="${C.hpSh}" stroke-width=".6"/>`
    + `<path d="M-3.1,-60.7 q1.1,1 2.2,0 M1.5,-60.7 q1.1,1 2.2,0" fill="none" stroke="#3a2214" stroke-width=".75" stroke-linecap="round"/>`
    + `<path d="M-0.5,-58.1 q.9,.6 1.8,0" fill="none" stroke="#b24c42" stroke-width=".6" stroke-linecap="round"/>`
    + `<ellipse cx="-3.3" cy="-58.9" rx="1.1" ry=".55" fill="#f0927c" fill-opacity=".6"/><ellipse cx="3.9" cy="-58.9" rx="1.1" ry=".55" fill="#f0927c" fill-opacity=".6"/>`;
  o.push(`<g transform="translate(0 -56)"><g ${track('nod', [[0, { y: 1.1, r: 3 }, HOLD], [0.3, { y: 0, r: 0 }, HOLD]], { period: 0.75 })}><g transform="translate(0 56)">${head}</g></g></g>`);
  return `<g transform="translate(${x} ${y})">${o.join('')}</g>`;
}

const NOTE = 'M0,0 m-2.2,0 a2.2,1.6 -20 1 0 4.4,0 a2.2,1.6 -20 1 0 -4.4,0 M1.9,-0.6 V-9 Q4.2,-7.6 5.2,-5.2';

function scene() {
  const rnd = makeRng(1992);
  const o = [];
  o.push(`<rect width="640" height="${HZ + 4}" fill="url(#scSky)"/>`);
  // cloud bank on the horizon, drifting one strip-width every four minutes
  let strip = '';
  for (const [cx, w, h] of [[30, 80, 52], [132, 50, 26], [236, 110, 74], [360, 62, 34], [486, 120, 84], [600, 66, 40]]) strip += cumulus(cx, HZ + 6, w, h, rnd);
  o.push(`<g ${track('clouds', [[0, { x: 0 }], [240, { x: -640 }]], { period: 240 })}><g id="cstrip">${strip}</g><use href="#cstrip" x="640"/></g>`);
  // sea
  o.push(`<rect y="${HZ}" width="640" height="${360 - HZ}" fill="url(#scSea)"/>`);
  o.push(`<rect y="${HZ - 0.5}" width="640" height="1.6" fill="#d6f2ff" fill-opacity=".8"/>`);
  // glints: two sets that swap on every beat
  const sets = [[], []];
  for (let y = HZ + 5; y < 360; y += 4 + (y - HZ) * 0.045) {
    const n = 3 + Math.floor((y - HZ) / 40);
    for (let i = 0; i < n; i++) {
      const x = rnd() * 640;
      const inIsland = ((x - 300) / 190) ** 2 + ((y - 275) / 46) ** 2 < 1;
      if (inIsland) continue;
      const len = 2 + (y - HZ) * 0.04 + rnd() * 4;
      sets[(i + Math.floor(y)) % 2].push(`M${r1(x)},${r1(y)}h${r1(len)}`);
    }
  }
  css.push('@keyframes glint{0%{opacity:1}50%{opacity:.15}100%{opacity:1}}.gA{animation:glint 1.5s step-end infinite}.gB{animation:glint 1.5s step-end infinite -.75s}');
  o.push(`<path class="gA" d="${sets[0].join('')}" stroke="#fff" stroke-opacity=".75" stroke-width="1.2" stroke-linecap="round"/>`);
  o.push(`<path class="gB" d="${sets[1].join('')}" stroke="#fff" stroke-opacity=".75" stroke-width="1.2" stroke-linecap="round" style="opacity:.15"/>`);
  // everything from here on sits a little closer to the camera
  o.push('<g transform="translate(300 282) scale(1.2) translate(-300 -282)">');
  // shallows, foam and the island
  o.push('<ellipse cx="300" cy="278" rx="215" ry="52" fill="url(#scShallow)"/>');
  css.push('@keyframes foam{0%{opacity:1}50%{opacity:0}100%{opacity:1}}.fA{animation:foam 3s step-end infinite}.fB{animation:foam 3s step-end infinite -1.5s}');
  const foam = (rx, ry, cyy) => {
    let d = '';
    let a = rnd() * 0.3;
    while (a < Math.PI * 2 - 0.1) {
      const len = 0.05 + rnd() * 0.2;
      const p = (t) => [300 + rx * Math.cos(t), cyy + ry * Math.sin(t)];
      const [x0, y0] = p(a), [xm, ym] = p(a + len / 2), [x1, y1] = p(a + len);
      d += `M${r1(x0)},${r1(y0)}Q${r1(2 * xm - (x0 + x1) / 2)},${r1(2 * ym - (y0 + y1) / 2)} ${r1(x1)},${r1(y1)}`;
      a += len + 0.04 + rnd() * 0.12;
    }
    return d;
  };
  o.push(`<path class="fA" d="${foam(162, 31, 274)}${foam(171, 36, 275)}" fill="none" stroke="#fff" stroke-width="1.7" stroke-linecap="round" stroke-opacity=".9"/>`);
  o.push(`<path class="fB" d="${foam(166, 33, 274)}${foam(176, 38, 276)}" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-opacity=".85" style="opacity:0"/>`);
  o.push(`<ellipse cx="300" cy="274" rx="156" ry="29" fill="${C.wet}"/>`);
  o.push('<ellipse cx="300" cy="271" rx="150" ry="26" fill="url(#scSand)"/>');
  o.push('<ellipse cx="282" cy="264" rx="96" ry="12" fill="#fff8de" fill-opacity=".55"/>');
  // rocks and bushes
  o.push('<ellipse cx="190" cy="285" rx="8" ry="4.6" fill="#8d9298"/><ellipse cx="188" cy="283.6" rx="5" ry="2.4" fill="#b3b8bd"/>');
  o.push('<ellipse cx="408" cy="291" rx="6" ry="3.6" fill="#8d9298"/><ellipse cx="407" cy="290" rx="3.6" ry="1.8" fill="#b3b8bd"/>');
  const bush = (bx, by, s) => {
    let d = '', d2 = '';
    for (let i = 0; i < 9; i++) {
      const a = Math.PI + (i / 8) * Math.PI;
      const lx = bx + Math.cos(a) * 9 * s, ly = by + Math.sin(a) * 6 * s;
      d += `M${r1(bx + (i - 4) * 1.2 * s)},${r1(by)}Q${r1((bx + lx) / 2)},${r1(ly - 3 * s)} ${r1(lx)},${r1(ly)}`;
      if (i % 2) d2 += `M${r1(bx + (i - 4) * s)},${r1(by - 1)}l${r1(Math.cos(a) * 6 * s)},${r1(Math.sin(a) * 5 * s)}`;
    }
    return `<path d="${d}" fill="none" stroke="#3c9a3a" stroke-width="${r1(2.4 * s)}" stroke-linecap="round"/><path d="${d2}" fill="none" stroke="#7cc95a" stroke-width="${r1(1.4 * s)}" stroke-linecap="round"/>`;
  };
  o.push(bush(200, 266, 1.1), bush(318, 262, 1.3), bush(430, 270, 0.9));
  // raft, bobbing in two steps
  let raft = '';
  for (let i = 0; i < 6; i++) raft += `<rect x="-30" y="${-13 + i * 4.6}" width="62" height="5" rx="2.5" fill="${i % 2 ? '#9a5a3c' : '#a8664a'}"/><path d="M-28,${-12 + i * 4.6}H30" stroke="#c98a62" stroke-width="1" stroke-linecap="round"/>`;
  raft += '<path d="M-20,-14V15M21,-14V15" stroke="#e2c995" stroke-width="2"/>';
  o.push(`<ellipse cx="522" cy="292" rx="44" ry="12" fill="#7fe2e6" fill-opacity=".35"/>`);
  o.push(`<g transform="translate(522 284) skewX(-14) scale(1 .62)"><g ${track('raft', [[0, { y: 0 }, HOLD], [1.5, { y: 2.4 }, HOLD]], { period: 3 })}>${raft}</g></g>`);
  o.push(palm());
  o.push(her(232, 272));
  o.push(notes(240, 204));
  o.push(gags());
  // 24-30 s: the shark cruises past in front of the island, nodding on every beat
  o.push(shark());
  o.push('</g>');
  return o.join('');
}

function notes(x, y) {
  let g = '';
  for (let k = 0; k < 2; k++) {
    const keys = [[0, { x: 0, y: 0, o: 0 }], [0.15, { x: 2, y: -3, o: 1 }], [1.8, { x: 10, y: -20, o: 0 }, HOLD], [2.9, { x: 0, y: 0, o: 0 }]];
    g += `<g transform="translate(${x + k * 4} ${y})"><g ${track(`note${k}`, keys, { period: 3, start: k * 1.5 })}><path d="${NOTE}" fill="none" stroke="#fff" stroke-width="1.3" stroke-linecap="round"/><ellipse cx="0" cy="0" rx="2.2" ry="1.6" transform="rotate(-20)" fill="#fff"/></g></g>`;
  }
  return g;
}

function shark() {
  const fin = '<path d="M-10,0 C-6.5,-6 -3,-15 3.5,-22 C2.6,-14 4.6,-6 10,0Z" fill="#5d7287"/><path d="M-10,0 C-6.5,-6 -3,-15 3.5,-22 C0.4,-14 -1.2,-6 -1.6,0Z" fill="#7e95ab"/>'
    + `<path d="M-3.8,-13.6 Q0.6,-27 5.6,-13.2" fill="none" stroke="${C.hp}" stroke-width="1.6"/><ellipse cx="-3.9" cy="-12.8" rx="2" ry="2.8" fill="${C.hp}" stroke="${C.hpSh}" stroke-width=".6"/><ellipse cx="5.7" cy="-12.6" rx="2" ry="2.8" fill="${C.hp}" stroke="${C.hpSh}" stroke-width=".6"/>`;
  const wake = '<path d="M-17,0.5 Q-12,-2.2 -7,0.3 M8,0.3 Q14,-2.4 21,0.5" fill="none" stroke="#fff" stroke-width="1.3" stroke-linecap="round"/><ellipse cx="0" cy="0.7" rx="11" ry="1.5" fill="#21a2da"/>';
  const keys = [[0, { x: -70, y: 338, o: 0 }, HOLD], [24.2, { x: -70, y: 338, o: 1 }], [29.8, { x: 680, y: 338, o: 1 }, HOLD], [29.9, { x: 680, y: 338, o: 0 }]];
  const nod = [[0, { r: -12 }, HOLD], [0.28, { r: 0 }, HOLD]];
  return `<g ${track('shark', keys)}><g transform="scale(1.35)"><g ${track('sharknod', nod, { period: 0.75 })}>${fin}</g>${wake}</g></g>`;
}

function gags() {
  const o = [];
  // 6-12 s: the drone delivers another pair of headphones; then a wave takes the box
  const box = (sticker) => `<rect x="-6" y="-11" width="12" height="11" rx="1" fill="#c99a5e" stroke="#8a6232" stroke-width=".7"/><path d="M-6,-8 H6" stroke="#a87b45" stroke-width=".8"/><rect x="-1" y="-11" width="2" height="11" fill="#ead6a6"/>`
    + (sticker ? '<path d="M-3.4,-3 V-4.2 Q-3.4,-7.6 0,-7.6 Q3.4,-7.6 3.4,-4.2 V-3" fill="none" stroke="#7fae78" stroke-width="1.1"/><rect x="-4.3" y="-4.4" width="1.9" height="2.6" rx=".6" fill="#8fbf88"/><rect x="2.4" y="-4.4" width="1.9" height="2.6" rx=".6" fill="#8fbf88"/>' : '');
  const drone = '<path d="M-16,-3 H16" stroke="#5a6372" stroke-width="1.6"/>'
    + '<ellipse cx="-16" cy="-5" rx="7.5" ry="1.4" fill="#e6eef6" fill-opacity=".8"/><ellipse cx="16" cy="-5" rx="7.5" ry="1.4" fill="#e6eef6" fill-opacity=".8"/>'
    + '<rect x="-16.8" y="-5.6" width="1.6" height="3" fill="#39404d"/><rect x="15.2" y="-5.6" width="1.6" height="3" fill="#39404d"/>'
    + '<rect x="-8" y="-4" width="16" height="6.5" rx="2.6" fill="#39404d"/><rect x="-6" y="-3.2" width="9" height="2" rx="1" fill="#6b7586"/><circle cx="6" cy="-0.8" r="0.9" fill="#ff4a3a"/>'
    + '<path d="M-3,2.5 L-4,7.5 M3,2.5 L4,7.5" stroke="#39404d" stroke-width=".8"/>';
  const hanging = `<g ${track('hang', [[0, { o: 1 }, HOLD], [8.8, { o: 0 }, HOLD], [29.95, { o: 1 }]])}><g transform="translate(0 18.5)">${box(true)}</g></g>`;
  o.push(`<g ${track('parcel', [[0, { x: 276, y: 264, o: 0 }, HOLD], [8.8, { x: 276, y: 264, o: 1 }, 'cubic-bezier(.55,0,1,.45)'], [9.06, { x: 276, y: 292 }], [9.14, { y: 289.5 }], [9.24, { y: 292 }], [11, { x: 276, y: 292, r: 0 }, 'ease-in'], [11.7, { x: 285, y: 306, r: 18, o: 1 }], [12, { x: 288, y: 311, r: 24, o: 0 }, HOLD]])}>${box(true)}</g>`);
  o.push(`<g ${track('drone', [[0, { x: 700, y: 24, o: 0 }, HOLD], [6.2, { x: 690, y: 28, o: 1 }, 'ease-out'], [8, { x: 276, y: 214 }, 'ease-in-out'], [8.6, { x: 276, y: 245.5 }], [9, { x: 276, y: 245.5 }, 'ease-in'], [9.4, { x: 276, y: 228 }, 'ease-in'], [10.8, { x: -60, y: 30, o: 1 }, HOLD], [10.9, { x: -60, y: 30, o: 0 }]])}><g transform="scale(1.15)">${drone}${hanging}</g></g>`);

  // 12-18 s: a hermit crab walks up; the coconut lands on it; it leaves wearing the coconut
  const legs = (poseB) => {
    const L = poseB ? [[-3.4, -2.4, -6.4, -0.2], [-1.2, -2.2, -2.6, 0], [1.2, -2.2, 3.2, 0], [3.4, -2.4, 5.6, -0.2]] : [[-3.4, -2.4, -5.4, 0], [-1.2, -2.2, -3.8, -0.2], [1.2, -2.2, 2.2, -0.2], [3.4, -2.4, 6.6, 0]];
    return L.map(([a, b, c, d]) => `M${a},${b}L${c},${d}`).join('');
  };
  css.push('@keyframes legs{0%{opacity:1}50%{opacity:0}100%{opacity:1}}.lA{animation:legs .4s step-end infinite}.lB{animation:legs .4s step-end infinite -.2s}');
  const legPair = `<path class="lA" d="${legs(false)}" stroke="#c4462c" stroke-width=".9" stroke-linecap="round"/><path class="lB" d="${legs(true)}" stroke="#c4462c" stroke-width=".9" stroke-linecap="round" style="opacity:0"/>`;
  const crab = `${legPair}<circle cx="2.6" cy="-5.4" r="4.1" fill="#ecd6ad" stroke="#b6926a" stroke-width=".6"/><path d="M2.6,-5.4 m-1.4,0 a1.4,1.4 0 1 1 1.4,1.4 a2.6,2.6 0 1 1 2.4,-3.2" fill="none" stroke="#b6926a" stroke-width=".6"/>`
    + '<ellipse cx="-1.9" cy="-3.4" rx="3.3" ry="2.1" fill="#e2573a"/><circle cx="-5.3" cy="-3.1" r="1.4" fill="#e2573a"/>'
    + '<path d="M-2.7,-5 L-3.2,-7.6 M-1.2,-5 L-0.9,-7.8" stroke="#c4462c" stroke-width=".7"/><circle cx="-3.2" cy="-7.8" r=".65" fill="#111"/><circle cx="-0.9" cy="-8" r=".65" fill="#111"/>';
  o.push(`<g ${track('crab', [[0, { x: 438, y: 286, o: 0 }, HOLD], [12.2, { x: 438, y: 286, o: 1 }, 'steps(8,end)'], [14, { x: 388, y: 286 }, HOLD], [14.6, { o: 0 }, HOLD]])}><g transform="scale(1.4)">${crab}</g></g>`);
  o.push(`<g ${track('fall', [[0, { x: 386, y: 107, o: 0 }, HOLD], [14.2, { x: 386, y: 107, o: 1 }, 'cubic-bezier(.5,0,1,1)'], [14.6, { x: 387, y: 278 }, HOLD], [14.65, { o: 0 }, HOLD]])}><circle r="4.5" fill="url(#nut)"/></g>`);
  o.push(`<g ${track('bonk', [[0, { o: 0 }, HOLD], [14.6, { o: 1 }, HOLD], [15.2, { o: 0 }, HOLD]])}><path d="M380,270l-5,-4M394,270l5,-4M387,266v-6M377,277h-6M397,277h6" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/></g>`);
  const coco = `${legPair}<ellipse cx="5.4" cy="-2.6" rx="2.6" ry="1.7" fill="#e2573a"/><circle cx="8" cy="-2.6" r="1.2" fill="#e2573a"/><path d="M5,-3.8 L5.4,-6.6 M6.4,-3.8 L7.2,-6.4" stroke="#c4462c" stroke-width=".7"/><circle cx="5.4" cy="-6.8" r=".65" fill="#111"/><circle cx="7.3" cy="-6.6" r=".65" fill="#111"/>`
    + '<circle cx="0" cy="-6" r="5.8" fill="url(#nut)"/><circle cx="-1.6" cy="-8" r=".8" fill="#3a2212"/><circle cx="0.8" cy="-8.6" r=".8" fill="#3a2212"/><circle cx="-0.2" cy="-6.6" r=".8" fill="#3a2212"/>';
  o.push(`<g ${track('coco', [[0, { x: 388, y: 286, o: 0 }, HOLD], [14.6, { x: 388, y: 286, o: 1 }, HOLD], [15.4, { x: 388, y: 286 }, 'steps(10,end)'], [17.4, { x: 452, y: 290 }, HOLD], [17.6, { o: 0 }, HOLD]])}><g transform="scale(1.4)">${coco}</g></g>`);

  // 18-24 s: she throws a bottle; it washes straight back to her feet
  const bottle = `<rect x="-6.5" y="-2.6" width="9.5" height="5.2" rx="2" fill="url(#glass)" stroke="#3f8a64" stroke-width=".5"/><rect x="2.8" y="-1.4" width="3.6" height="2.8" fill="url(#glass)" stroke="#3f8a64" stroke-width=".5"/><rect x="6.2" y="-1.3" width="1.8" height="2.6" fill="#b8874f"/><rect x="-4.8" y="-1.3" width="6" height="2.6" rx=".6" fill="#fff4d4"/><path d="M-5.6,-1.8 H1.8" stroke="#fff" stroke-opacity=".7" stroke-width=".6"/>`;
  const arc = [];
  const P0 = [222, 232], P1 = [104, 258];
  for (let i = 0; i <= 6; i++) {
    const f = i / 6;
    arc.push([18.2 + f * 0.9, { x: P0[0] + (P1[0] - P0[0]) * f, y: P0[1] + (P1[1] - P0[1]) * f - 52 * Math.sin(Math.PI * f), r: -i * 70, o: 1 }]);
  }
  o.push(`<g ${track('bottle', [[0, { x: 222, y: 232, r: 0, o: 0 }, HOLD], ...arc, [19.4, { x: 104, y: 255.5, r: -400 }], [19.7, { x: 104, y: 258, r: -385 }], [20, { x: 106, y: 256.5, r: -395 }, 'steps(13,end)'], [22.6, { x: 206, y: 289, r: -370 }, HOLD], [23.6, { o: 0 }, HOLD]])}><g transform="scale(1.3)">${bottle}</g></g>`);
  o.push(`<g transform="translate(104 260)"><g ${track('splash', [[0, { s: 0.3, o: 0 }, HOLD], [19.1, { s: 0.3, o: 1 }], [19.8, { s: 1.4, o: 0 }, HOLD]])}><ellipse rx="10" ry="3" fill="none" stroke="#fff" stroke-width="1.6"/><path d="M-4,-3 l-2,-5 M0,-4 v-6 M4,-3 l2,-5" stroke="#fff" stroke-width="1.4" stroke-linecap="round"/></g></g>`);
  return o.join('');
}

// ------------------------------------------------------------------------------ assemble
const defsExtra = [];
function banner() {
  css.length = 0;
  defsExtra.length = 0;
  const parts = [];
  parts.push(`<g clip-path="url(#panel)">`);
  parts.push(wallpaper());
  parts.push(deskIcons());
  const win = browserWindow();
  defsExtra.push(`<clipPath id="screenClip"><rect width="640" height="360" rx="${r1(8 * 640 / win.screen.sw)}"/></clipPath>`);
  parts.push(win.svg);
  parts.push(cursor(806, 296));
  parts.push(taskbar());
  parts.push(balloons());
  parts.push('</g>');
  const style = `.t{fill:none;stroke-linecap:round;stroke-linejoin:round}${css.join('')}@media (prefers-reduced-motion:reduce){*{animation:none!important}}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="ttl">`
    + '<title id="ttl">Castaway: a mid-2000s blue-and-green desktop. A browser window titled Castaway shows the island live preview at 127.0.0.1:8765 while tray balloons report each gag.</title>'
    + `<defs>${defs()}<clipPath id="panel"><rect width="${W}" height="${H}" rx="14"/></clipPath>${defsExtra.join('')}</defs>`
    + `<style>${style}</style>`
    + parts.join('')
    + '</svg>';
}

fs.mkdirSync(ASSETS, { recursive: true });
const out = banner();
fs.writeFileSync(path.join(ASSETS, `${SLUG}.svg`), out);
console.log(`${SLUG}.svg ${(out.length / 1024).toFixed(1)} KB`);
