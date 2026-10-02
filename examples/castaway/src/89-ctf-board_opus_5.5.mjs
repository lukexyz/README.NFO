#!/usr/bin/env node
// CASTAWAY README header: "CTF Challenge Board" (89-ctf-board_opus_5.5).
//
//   node examples/castaway/src/89-ctf-board_opus_5.5.mjs
//
// Regenerates ../assets/89-ctf-board_opus_5.5.svg, the banner. Plain Node, no dependencies,
// deterministic (no clock, no Math.random). The .md beside the assets is hand-written.
//
// The style (catalogue entry hack-18) is the jeopardy capture-the-flag board: a navbar, an
// event banner, category headings over rows of equal dark tiles with a point value on each,
// tiles that turn green when solved, and beside them the scoreboard: a step graph of the top
// teams' scores against time (lines that only ever rise) over a Place / Team / Score table,
// ties going to whoever got there first, and the freeze near the end, when the public board
// stops updating while play continues. Nothing here is copied from a real platform: no
// names, logos or theme files; the layout is the generic one every contest uses.
//
// Castaway fills it with its own facts. The categories are the four timers in
// activities.toml (regular, occasional, rare, super rare) plus chained follow-ups, and rarer
// gags are worth more points. The teams are the schedule's six lanes (castaway, sea_sky, cat,
// turtle, shore, garden), which really do run in parallel, and each solve is credited to the
// first lane its activity lists. One loop is 60 seconds: one pass of the 80 BPM theme, 20
// bars of 3 s, and every solve lands on a bar line, as the gags do. The banner's island acts
// out each solve as it happens. The freeze arrives at bar 14 and is, of course, idling.
//
// Lettering is this file's own monoline sans (adapted from the stroke font in
// 59-luna-desktop_opus_5.5.mjs), drawn as stroked paths placed with <use>, never <text>.
// Motion is CSS keyframes only; every animated element also carries an inline style holding
// its state at STATIC, which is the frame reduced motion shows (the freeze, 43.8 s in).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const ASSETS = path.join(here, '..', 'assets');
const SLUG = '89-ctf-board_opus_5.5';

const W = 960;
const H = 656;
const LOOP = 60; // one pass of the theme: 20 bars of 3 s
const BAR = 3;
const BEAT = 0.75; // 80 BPM
const STATIC = 43.8;

// ------------------------------------------------------------------------------ helpers
const r1 = (n) => { const s = (Math.round(n * 10) / 10).toString(); return s === '-0' ? '0' : s; };
const r2 = (n) => { const s = (Math.round(n * 100) / 100).toString(); return s === '-0' ? '0' : s; };
const r3 = (n) => { const s = (Math.round(n * 1000) / 1000).toString(); return s === '-0' ? '0' : s; };

// ------------------------------------------------------------------------------ the font
// A humanist monoline sans. Glyph box: baseline y = 0, x-height -102, cap height -140,
// ascender -148, descender +44 (y grows downwards). Each entry is [advance, path, sides];
// paths use absolute M L H V C A Z, plus "D x,y" for a dot. `sides` classes each edge for
// spacing: s = straight stem, o = round, v = open or diagonal, p = punctuation.
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
  g: [88, 'M88,-102 V8 C88,32 72,44 46,44 C30,44 17,40 7,32 M88,-78 C78,-95 63,-102 45,-102 C18,-102 0,-82 0,-54 C0,-25 18,-6 45,-6 C63,-6 78,-13 88,-28', 'os'],
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
  '{': [40, 'M40,-152 C24,-152 16,-144 16,-128 V-74 C16,-64 10,-58 0,-56 C10,-54 16,-48 16,-38 V16 C16,32 24,40 40,40', 'ov'],
  '}': [40, 'M0,-152 C16,-152 24,-144 24,-128 V-74 C24,-64 30,-58 40,-56 C30,-54 24,-48 24,-38 V16 C24,32 16,40 0,40', 'vo'],
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
  '·': [0, 'D0,-58', 'pp'],
};
const SIDE = { s: 12, o: 6, v: 2, p: 8 };
const DOT_R = 4;
const KERN = {
  ra: -8, ry: -6, ro: -5, re: -5, 'r.': -12, 'r,': -12, 'y.': -10, 'y,': -10, fa: -8, fo: -7, ta: -3,
  Ca: -4, Ta: -16, Te: -16, To: -16, Tr: -12, Ty: -12, AT: -14, TA: -14, Av: -8, Aw: -6, Yo: -12, Wa: -8, Vo: -8, Fo: -8, Pa: -8, LT: -14,
  wa: -3, aw: -3, av: -3, va: -3, ay: -3, ya: -3, AW: -8, WA: -8, AY: -10, YA: -10,
};

// Glyphs become <path id> in <defs>, in font units, and text is <use> elements inside a
// scaled group, so each repeated letter costs one short tag.
const usedGlyphs = new Set();
const GID = new Map();
const ID_CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const gid = (ch) => {
  if (!GID.has(ch)) { const n = GID.size; GID.set(ch, n < 52 ? ID_CHARS[n] : `${ID_CHARS[Math.floor(n / 52) - 1]}${ID_CHARS[n % 52]}`); }
  return GID.get(ch);
};
function glyphPath(src) {
  return src.replace(/D(-?\d*\.?\d+),(-?\d*\.?\d+)/g, (m, x, y) => `M${Number(x) - DOT_R} ${y}a${DOT_R} ${DOT_R} 0 1 0 ${2 * DOT_R} 0a${DOT_R} ${DOT_R} 0 1 0 ${-2 * DOT_R} 0`)
    .replace(/,/g, ' ').replace(/ ([MLHVCAZa])/g, '$1');
}
function layout(str, wu, track = 0) {
  const items = [];
  let pen = 0, prev = null, prevCh = '', word = 0;
  for (const ch of str) {
    if (ch === ' ') { pen += 64 + track; prev = null; prevCh = ''; if (items.length) word = items[items.length - 1][2] + 1; continue; }
    const g = FONT[ch];
    if (!g) throw new Error(`no glyph for "${ch}" in "${str}"`);
    if (items.length) pen += wu + track + (prev ? SIDE[prev[2][1]] + SIDE[g[2][0]] + (KERN[prevCh + ch] || 0) : 0);
    items.push([ch, pen, word]);
    pen += g[0];
    prev = g; prevCh = ch;
  }
  return { items, width: pen };
}
const textWidth = (str, cap, { w = 0.11, track = 0 } = {}) => layout(str, w * 140, track).width * (cap / 140);
// Text colour and weight pairs become classes in the SVG's own <style>.
const TCLS = new Map();
function tcls(c, sw) {
  const k = `${c}|${sw}`;
  if (!TCLS.has(k)) TCLS.set(k, `t${TCLS.size.toString(36)}`);
  return TCLS.get(k);
}
function fitCap(str, cap, maxW, w = 0.11) {
  while (textWidth(str, cap, { w }) > maxW) cap -= 0.1;
  return r2(cap);
}
// Words that recur (team names, "solved", tile names in the notifications) are drawn once as
// a <g id> of glyph uses and placed with one <use>. T() leaves a placeholder per word and
// resolveWords() settles it at assembly, once every word's count is known; a word met only
// once is written out letter by letter, so the glyph positions come out identical either way.
const WORDS = new Map();
const glyphUse = (g, x) => `<use href="#${g}"${x ? ` x="${x}"` : ''}/>`;
let wordN = 0;
const wordDefs = [];
function resolveWords(str) {
  return str.replace(/\u0001([^\u0002]*)\u0002(-?\d+)\u0003/g, (m, key, b) => {
    const wd = WORDS.get(key);
    const base = Number(b);
    if (wd.n < 2) return wd.inner.map(([g, dx]) => glyphUse(g, base + dx)).join('');
    if (!wd.id) { wd.id = `w${(wordN++).toString(36)}`; wordDefs.push(`<g id="${wd.id}">${wd.inner.map(([g, dx]) => glyphUse(g, dx)).join('')}</g>`); }
    return `<use href="#${wd.id}"${base ? ` x="${base}"` : ''}/>`;
  });
}
// Text as a scaled group of <use>. (x, y) is the baseline point named by `a` (s, m or e).
function T(str, x, y, cap, { a = 's', w = 0.11, c = '#c9d1d9', track = 0, o = 1, extra = '' } = {}) {
  const s = cap / 140;
  const L = layout(str, w * 140, track);
  const width = L.width * s;
  const ox = a === 's' ? x : a === 'm' ? x - width / 2 : x - width;
  const words = [];
  for (const [ch, px, wi] of L.items) { usedGlyphs.add(ch); (words[wi] ||= []).push([gid(ch), Math.round(px)]); }
  let uses = '';
  for (const wd of words) {
    if (!wd) continue;
    const base = wd[0][1];
    if (wd.length < 2) { uses += glyphUse(wd[0][0], base); continue; }
    const inner = wd.map(([g, px]) => [g, px - base]);
    const key = inner.map(([g, dx]) => `${g}${dx}`).join(',');
    if (!WORDS.has(key)) WORDS.set(key, { n: 0, inner });
    WORDS.get(key).n++;
    uses += `\u0001${key}\u0002${base}\u0003`;
  }
  return `<g class="${tcls(c, r1(w * 140))}" transform="translate(${r2(ox)} ${r2(y)}) scale(${r3(s)})"${o < 1 ? ` opacity="${o}"` : ''}${extra}>${uses}</g>`;
}

// ------------------------------------------------------------------------------ motion
// anim() turns keyframes [t, {x, y, s, r, o}, timing?] into a CSS animation on a class and
// returns the attributes for the element: the class plus an inline style holding the frame
// at STATIC, which is what reduced motion shows. Times are seconds into the loop. A timing
// of HOLD keeps a key's value until the next key (a hard cut).
const HOLD = 'step-end';
// A keyframe offset as a percentage. Two decimals when that is exact; otherwise rounded
// DOWN at three, so a key never lands after its true time. (Rounding 10 s of 60 up to
// 16.67% kept the countdown's outgoing digit on screen for the very first frame.)
const pct = (t, period) => {
  const p = (t / period) * 100;
  const two = Math.round(p * 100) / 100;
  if (Math.abs(two - p) < 1e-7) return String(two);
  return String(Math.floor(p * 1000 + 1e-7) / 1000);
};
const css = [];
let animN = 0;
const kfNames = new Map();
const clsNames = new Map();
function anim(keys, { period = LOOP, origin = null, start = 0 } = {}) {
  if (keys[0][0] !== 0) throw new Error('anim: first key must be at 0');
  const use = { t: false, r: false, s: false, o: false };
  for (const [, p] of keys) { if ('x' in p || 'y' in p) use.t = true; if ('r' in p) use.r = true; if ('s' in p) use.s = true; if ('o' in p) use.o = true; }
  let prev = { x: 0, y: 0, r: 0, s: 1, o: 1 };
  const full = keys.map(([t, p, e]) => { const q = { ...prev, ...p }; prev = q; return [t, q, e]; });
  if (full[full.length - 1][0] < period) full.push([period, { ...full[full.length - 1][1] }]);
  const props = (q) => {
    const parts = [];
    if (use.t || use.r || use.s) {
      const tf = [];
      const px = (v) => (r2(v) === '0' ? '0' : `${r2(v)}px`);
      if (use.t) tf.push(`translate(${px(q.x)},${px(q.y)})`);
      if (use.r) tf.push(`rotate(${r2(q.r)}deg)`);
      if (use.s) tf.push(`scale(${r3(q.s)})`);
      parts.push(`transform:${tf.join(' ')}`);
    }
    if (use.o) parts.push(`opacity:${r2(q.o)}`);
    return parts.join(';');
  };
  // the commonest timing goes on the class; keys only say so when they differ
  const tally = {};
  for (const [, , e] of full.slice(0, -1)) tally[e || 'linear'] = (tally[e || 'linear'] || 0) + 1;
  const deft = Object.entries(tally).sort((p, q) => q[1] - p[1])[0][0];
  const frames = full.map(([t, q, e]) => `${pct(t, period)}%{${props(q)}${(e || 'linear') !== deft ? `;animation-timing-function:${e || 'linear'}` : ''}}`).join('');
  const delay = -((((-start) % period) + period) % period);
  const org = origin ? `;transform-box:fill-box;transform-origin:${origin}` : '';
  let kf = kfNames.get(frames);
  if (!kf) { kf = `k${kfNames.size.toString(36)}`; kfNames.set(frames, kf); css.push(`@keyframes ${kf}{${frames}}`); }
  const rule = `${kf} ${period}s ${deft} infinite${delay ? ` ${r2(delay)}s` : ''}${org}`;
  let name = clsNames.get(rule);
  if (!name) { name = `a${clsNames.size.toString(36)}`; clsNames.set(rule, name); css.push(`.${name}{animation:${rule.replace(org, '')}${org}}`); animN++; }
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
// Visible during the given [from, to) windows, hidden otherwise, with hard cuts.
function show(windows, { period = LOOP } = {}) {
  // a single window (or one that wraps round the loop) shares its keyframes with every
  // other window of the same length, shifted by the animation delay
  let ws = windows.map((w) => [...w]).sort((p, q) => p[0] - q[0]);
  if (ws.length === 2 && ws[0][0] === 0 && ws[1][1] === period) ws = [[ws[1][0], ws[0][1] + period]];
  if (ws.length === 1 && ws[0][1] - ws[0][0] < period) {
    const [a, b] = ws[0];
    return anim([[0, { o: 1 }, HOLD], [b - a, { o: 0 }, HOLD]], { period, start: a });
  }
  const on = (t) => windows.some(([a, b]) => t >= a && t < b);
  const keys = [[0, { o: on(0) ? 1 : 0 }, HOLD]];
  const edges = [];
  for (const [a, b] of windows) { if (a > 0) edges.push([a, 1]); if (b < period) edges.push([b, 0]); }
  edges.sort((p, q) => p[0] - q[0]);
  for (const [t, v] of edges) keys.push([t, { o: v }, HOLD]);
  return anim(keys, { period });
}
// A two-frame flip-flop: frame A for `a` seconds then frame B for `b` seconds.
function flip(a, b, phase = 0) {
  const p = a + b;
  return [
    anim([[0, { o: 1 }, HOLD], [a, { o: 0 }, HOLD]], { period: p, start: phase }),
    anim([[0, { o: 0 }, HOLD], [a, { o: 1 }, HOLD]], { period: p, start: phase }),
  ];
}

// ------------------------------------------------------------------------------ palette
const C = {
  page: '#0d1117', panel: '#161b22', line: '#30363d', tile: '#21262d', tileHi: '#2b3139',
  text: '#c9d1d9', head: '#e6edf3', bright: '#f0f6fc', muted: '#8b949e', faint: '#6e7681',
  solved: '#238636', solvedHi: '#2ea043', solvedLine: '#3fb950', freeze: '#d29922', freezeInk: '#1f1600',
  coral: '#ff8c69',
  skyTop: '#2a8fe0', skyMid: '#5fb5ef', skyLow: '#a9dcf7', seaFar: '#1c86d6', seaNear: '#1aa5d4',
  shallow: '#48d0d6', sand: '#ecd9a6', sandSh: '#d8bf85', wet: '#d3bd88', foam: '#ffffff',
  trunk: '#8a5a3c', trunkSh: '#6c4430', frond: '#4fa63a', frondSh: '#3a8a2e', frondHi: '#7cc84f',
  skin: '#d9976a', skinSh: '#b8744d', hair: '#5a3a24', phones: '#f4ecd9', top: '#f27b63', topSh: '#d8634d', shorts: '#f2e7cd',
  log: '#9b5b3d', logSh: '#7a432c', rope: '#e2c58c',
};
const TEAM = {
  castaway: { c: '#ff8c69', note: 'her, 1 member' },
  sea_sky: { c: '#58a6ff', note: 'ships, drones, a shark' },
  cat: { c: '#d2a8ff', note: '1 grey tabby' },
  turtle: { c: '#39d0c0', note: '1 sea turtle' },
  shore: { c: '#e8d5a0', note: 'the tide' },
  garden: { c: '#7ee787', note: '1 kumara' },
};
const ORDER0 = ['castaway', 'sea_sky', 'cat', 'turtle', 'shore', 'garden'];

// ------------------------------------------------------------------------------ the contest
// Categories are the timers in activities.toml; the points are this board's own.
const CATS = [
  { name: 'Regular', note: 'every 2 to 5 min', pts: 100, tiles: [
    ['coconut', 'Coconut Sip'], ['sandcastle', 'Sandcastle'], ['fishing', 'Fishing'], ['jog', 'Jog Lap']] },
  { name: 'Occasional', note: 'every 12 to 25 min', pts: 250, tiles: [
    ['bottle', 'Message in a Bottle'], ['turtle', 'Turtle Visit'], ['kumara', 'Plant a Kumara'], ['crab', 'Coconut Crab']] },
  { name: 'Rare', note: 'every 30 to 60 min', pts: 500, tiles: [
    ['drone', 'Delivery Drone'], ['signal', 'Signal Hunt'], ['cat', 'Stray Cat'], ['shark', 'Shark Nod']] },
  { name: 'Super rare', note: 'every 3 to 6 h', pts: 1000, half: true, tiles: [
    ['leave', 'Leave Any Time'], ['rescue', 'Wave for Rescue']] },
  { name: 'Chained', note: 'after another gag', pts: 50, half: true, tiles: [
    ['tide', 'Tide Takes It'], ['flowers', 'Kumara Flowers']] },
];
const TILE = {};
for (const cat of CATS) for (const [id, name] of cat.tiles) TILE[id] = { id, name, pts: cat.pts };
// Solves land on bar lines. Team = the first lane the activity lists in activities.toml.
const SOLVES = [
  { t: 3, tile: 'coconut', team: 'castaway', msg: 'castaway solved Coconut Sip (+100). Eyes closed throughout.' },
  { t: 6, tile: 'sandcastle', team: 'castaway', msg: 'castaway solved Sandcastle (+100). It stays until the tide comes for it.' },
  { t: 9, tile: 'drone', team: 'sea_sky', msg: 'sea_sky solved Delivery Drone (+500). The parcel is another pair of headphones.' },
  { t: 12, tile: 'turtle', team: 'turtle', msg: 'turtle solved Turtle Visit (+250). Both players have dozed off.' },
  { t: 15, tile: 'tide', team: 'shore', msg: 'shore solved Tide Takes It (+50). The sandcastle has been withdrawn.' },
  { t: 18, tile: 'signal', team: 'castaway', msg: 'castaway solved Signal Hunt (+500). One bar, at the very top of the palm.' },
  { t: 21, tile: 'cat', team: 'cat', msg: 'cat solved Stray Cat (+500). Tied with sea_sky, who got there first.' },
  { t: 24, tile: 'kumara', team: 'castaway', msg: 'castaway solved Plant a Kumara (+250). It will grow over the video.' },
  { t: 27, tile: 'shark', team: 'sea_sky', msg: 'sea_sky solved Shark Nod (+500). It is wearing headphones. Same beat.' },
  { t: 30, tile: 'bottle', team: 'castaway', msg: 'castaway solved Message in a Bottle (+250). It washed straight back.' },
  { t: 33, tile: 'flowers', team: 'garden', msg: 'garden solved Kumara Flowers (+50). Tied with shore, who got there first. It is a plant.' },
  { t: 36, tile: 'leave', team: 'castaway', msg: 'castaway solved Leave Any Time (+1000). She could leave any time. She did.' },
  { t: 45, tile: 'crab', team: 'castaway', frozen: true, msg: 'castaway solved Coconut Crab. The coconut walked off. Hidden until the freeze lifts.' },
];
const FREEZE = 42;
const END = 48; // the contest clock reaches 10:00:00 here; the freeze lifts
const RESET = 55; // everything fades back, fresh again by 57
const FRESH = 57;
const MESSAGES = [
  [0, 'Event started: 16 challenges, 6 teams, 1 island. Every gag starts on the beat.'],
  ...SOLVES.map((s) => [s.t, s.msg]),
  [39, 'castaway is back, with an iced coffee. This has not been explained.'],
  [42, 'Scoreboard frozen. Play continues. She is idling, which is most of the contest.'],
  [48, 'Freeze lifted: the Coconut Crab counts after all (+250). Final standings below.'],
  [51, 'That was ten hours of graph in 48 seconds. The countdown up top is the honest clock.'],
  [54, 'Same seed, same island, event for event. Starting again.'],
].sort((a, b) => a[0] - b[0]);

// Scores and ranks over time. Frozen solves reach the board at END.
const counted = SOLVES.map((s) => ({ ...s, at: s.frozen ? END : s.t }));
function standings(t) {
  const score = Object.fromEntries(ORDER0.map((k) => [k, 0]));
  const reached = Object.fromEntries(ORDER0.map((k) => [k, Infinity]));
  for (const s of counted) if (s.at <= t) { score[s.team] += TILE[s.tile].pts; reached[s.team] = s.at; }
  const order = [...ORDER0].sort((a, b) => score[b] - score[a] || reached[a] - reached[b] || ORDER0.indexOf(a) - ORDER0.indexOf(b));
  return { score, order };
}
const changeTimes = [...new Set(counted.map((s) => s.at))].sort((a, b) => a - b);

// ------------------------------------------------------------------------------ layout
const NAV_H = 36;
const HERO_Y = NAV_H;
const HERO_H = 166;
const PANEL_Y = 214;
const PANEL_H = 392;
const BOARD = { x: 16, y: PANEL_Y, w: 584, h: PANEL_H };
const SCORE = { x: 612, y: PANEL_Y, w: 332, h: PANEL_H };
const FOOT = { x: 16, y: 616, w: 928, h: 28 };

const parts = [];
const defs = [];

// ------------------------------------------------------------------------------ chrome
function drawNav() {
  let s = `<rect x="0" y="0" width="${W}" height="${NAV_H}" fill="${C.panel}"/><rect x="0" y="${NAV_H - 1}" width="${W}" height="1" fill="${C.line}"/>`;
  // emblem: a palm on a dot of sand with a pennant at the top
  s += `<g transform="translate(16 5)"><circle cx="13" cy="13" r="13" fill="#0f2b44"/><path d="M4,21 Q13,16.5 22,21 Q13,24 4,21 Z" fill="${C.sand}"/>`
    + `<path d="M14.5,20 C14.2,15.5 13.2,11 11.6,8" stroke="${C.trunk}" stroke-width="1.7" fill="none" stroke-linecap="round"/>`
    + `<path d="M11.6,8 C8,6.5 5.5,7.5 4.5,10 C7,8.8 9.5,8.8 11.6,8 Z M11.6,8 C14.5,5.5 18,5.8 19.6,8.5 C17,7.5 14,7.6 11.6,8 Z M11.6,8 C10.5,5 8.4,3.8 6.4,4.4 C8.6,5.2 10.4,6.4 11.6,8 Z M11.6,8 C13.4,5.4 16.2,4.4 18.2,5.2 C15.8,5.6 13.4,6.6 11.6,8 Z" fill="${C.frond}"/>`
    + `<path d="M11.6,8 V2.4" stroke="${C.bright}" stroke-width="0.9"/><path d="M11.6,2.4 L16.6,3.9 L11.6,5.4 Z" fill="${C.coral}"/></g>`;
  s += T('CASTAWAY', 48, 23, 10, { w: 0.19, c: C.bright, track: 34 });
  s += T('ctf', 48 + textWidth('CASTAWAY', 10, { w: 0.19, track: 34 }) + 6, 23, 9, { w: 0.13, c: C.muted });
  const links = ['Challenges', 'Scoreboard', 'Notifications', 'Rules', 'Teams'];
  let x = 172;
  links.forEach((l, i) => {
    const wv = textWidth(l, 9, { w: 0.12 });
    s += T(l, x, 22, 9, { w: 0.12, c: i === 0 ? C.bright : C.muted });
    if (i === 0) s += `<rect x="${r1(x - 2)}" y="${NAV_H - 3}" width="${r1(wv + 4)}" height="2" rx="1" fill="${C.coral}"/>`;
    x += wv + 22;
  });
  // user pill
  const px = 892;
  s += `<rect x="${px}" y="9" width="52" height="18" rx="9" fill="${C.tile}" stroke="${C.line}"/><circle cx="${px + 11}" cy="18" r="4" fill="${C.coral}"/>`;
  s += T('her', px + 20, 22, 8.5, { w: 0.13, c: C.head });
  // countdown to 10:00:00, in real seconds: digit stacks toggled with stepped opacity
  s += drawCountdown(px - 12);
  return s;
}
function drawCountdown(right) {
  const cap = 9;
  const dw = textWidth('0', cap, { w: 0.14 });
  // positions from the right: S2 S1 : M2 M1 : H
  const adv = dw + 1.6;
  const colon = 4.2;
  const xs = [];
  let x = right;
  const order = ['s1', 's10', ':', 'm1', 'm10', ':', 'h'];
  for (const k of order) {
    if (k === ':') { x -= colon; xs.push([k, x]); } else { x -= adv; xs.push([k, x]); }
  }
  let s = '';
  // label and clock icon
  const lx = x - 6;
  s += T('ends in', lx, 22, 8.5, { a: 'e', w: 0.12, c: C.muted });
  const iconX = lx - textWidth('ends in', 8.5, { w: 0.12 }) - 11;
  s += `<circle cx="${r1(iconX)}" cy="18.5" r="4.6" fill="none" stroke="${C.muted}" stroke-width="1.2"/><path d="M${r1(iconX)},16 V18.6 L${r1(iconX + 1.8)},19.8" fill="none" stroke="${C.muted}" stroke-width="1.1" stroke-linecap="round"/>`;
  // remaining = 35999 - t at t seconds: 9:59:59 at t=0
  const spec = { s1: [10, 1], s10: [6, 10], m1: [10, 60], m10: [6, 600], h: [10, 3600] };
  for (const [k, px] of xs) {
    if (k === ':') { s += T(':', px + colon / 2 - 0.3, 22, cap, { w: 0.14, c: C.bright }); continue; }
    const [n, unit] = spec[k];
    const period = n * unit;
    const start = { s1: 9, s10: 5, m1: 9, m10: 5, h: 9 }[k];
    for (let d = 0; d < n; d++) {
      // digit d shows while floor(rem/unit) % n === d; rem decreases from 35999
      // first shows at t0 = ((start - d + n) % n) * unit (relative), each lasting `unit`
      const t0 = ((start - d + n) % n) * unit;
      const a = anim([[0, { o: 1 }, HOLD], [unit, { o: 0 }, HOLD]], { period, start: t0 });
      s += `<g ${a}>${T(String(d), px, 22, cap, { w: 0.14, c: C.bright })}</g>`;
    }
  }
  return s;
}

// ------------------------------------------------------------------------------ the island
// Her, seated against the palm and facing left. Local origin: her hip on the sand.
function herSeated(extra = {}) {
  const head = `<path d="M-4.6,-22.2 C-4.8,-27.6 4.8,-28.2 4.4,-21.6 L4,-18.9 C2.2,-17.8 0.6,-19.2 0.6,-21.4 Z" fill="${C.hair}"/>`
    + `<circle cx="-0.6" cy="-21.6" r="4.1" fill="${C.skin}"/>`
    + `<path d="M-4.6,-22.6 C-4.6,-27 4.4,-27.6 4.3,-21.8 C3.6,-24.6 1.6,-25.4 -0.6,-25.4 C-2.4,-25.4 -3.8,-24.6 -4.6,-22.6 Z" fill="${C.hair}"/>`
    + `<circle cx="4.1" cy="-18.6" r="2.2" fill="${C.hair}"/>`
    + `<path d="M-2.6,-25.4 C-1.2,-27.6 2.6,-27.2 1.4,-23.6" fill="none" stroke="${C.phones}" stroke-width="1.15" stroke-linecap="round"/>`
    + `<ellipse cx="1.1" cy="-21.5" rx="1.7" ry="2.3" fill="${C.phones}" stroke="#cbbf9f" stroke-width="0.5"/>`
    + `<circle cx="-3.5" cy="-21.9" r="0.5" fill="#3a2418"/>`;
  const body = `<ellipse cx="-9" cy="0.8" rx="15" ry="1.9" fill="#b89a5a" opacity="0.35"/>`
    + `<path d="M-8.4,-3.2 L-19.4,-1.2" stroke="${C.skinSh}" stroke-width="3" stroke-linecap="round"/>`
    + `<path d="M-8,-2.2 L-19.8,0" stroke="${C.skin}" stroke-width="3.1" stroke-linecap="round"/>`
    + `<ellipse cx="-21.2" cy="-0.6" rx="2" ry="1.25" fill="${C.skin}"/>`
    + `<path d="M-9.4,-5.4 H1.8 Q3,-5.2 3,-3.6 V-0.6 Q3,0.4 1.8,0.4 H-9.4 Q-10.2,0.4 -10.2,-0.6 V-4.4 Q-10.2,-5.4 -9.4,-5.4 Z" fill="${C.shorts}"/>`
    + `<path d="M-1,-18.4 V-16.4" stroke="${C.skin}" stroke-width="2.2"/>`
    + `<path d="M-3.4,-5.2 L-3.4,-14.6 Q-1,-17.4 2.4,-15.6 L3.2,-5.2 Z" fill="${C.top}"/>`
    + `<path d="M0.6,-5.2 L2.4,-15.6 L3.2,-5.2 Z" fill="${C.topSh}" opacity="0.6"/>`;
  const armRest = `<path d="M-1.2,-14 L-4.6,-8.4 L-8.6,-6" fill="none" stroke="${C.skin}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>`;
  return { head, body, armRest };
}
// Standing, facing left, origin at her feet. Two leg frames for a stepped walk.
function herStanding(legs, carry) {
  const legA = `<path d="M-1.2,-13 L-3.6,-0.6 M1,-13 L2.4,-0.6" stroke="${C.skin}" stroke-width="2.4" stroke-linecap="round"/><path d="M-4.8,-0.4 H-2.4 M1.2,-0.4 H3.6" stroke="${C.skin}" stroke-width="1.8" stroke-linecap="round"/>`;
  const legB = `<path d="M-0.2,-13 L-0.8,-0.6 M0.4,-13 L0.2,-0.6" stroke="${C.skin}" stroke-width="2.4" stroke-linecap="round"/><path d="M-2.2,-0.4 H0.2 M-1.2,-0.4 H1.2" stroke="${C.skin}" stroke-width="1.8" stroke-linecap="round"/>`;
  const torso = `<path d="M-3.4,-16.8 H3.2 V-11.8 H-3.4 Z" fill="${C.shorts}"/>`
    + `<path d="M-3.4,-16.4 L-3,-25.4 Q0,-27 3,-25.4 L3.2,-16.4 Z" fill="${C.top}"/>`
    + `<path d="M-0.4,-29 V-26.4" stroke="${C.skin}" stroke-width="2.2"/>`;
  const arms = carry
    ? `<path d="M-1.6,-24.6 L-3.8,-20 L-7.4,-19.2" fill="none" stroke="${C.skin}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>${icedCoffee(-8.6, -18.2)}<path d="M2,-24.6 L2.8,-17.4" stroke="${C.skinSh}" stroke-width="1.8" stroke-linecap="round"/>`
    : `<path d="M-1.6,-24.6 L-2.8,-17.2 M2,-24.6 L2.8,-17.4" stroke="${C.skin}" stroke-width="1.8" stroke-linecap="round"/>`;
  const head = `<g transform="translate(0 -10)">${herSeated().head}</g>`;
  return (legs === 'A' ? legA : legB) + torso + arms + head;
}
function icedCoffee(x, y) {
  return `<g transform="translate(${x} ${y})"><path d="M-1.9,-3.4 H1.9 L1.4,2.6 H-1.4 Z" fill="#f6f1e6" opacity="0.9"/><path d="M-1.7,-1.2 H1.7 L1.4,2.6 H-1.4 Z" fill="#9a6440"/><path d="M-2.2,-3.6 H2.2" stroke="#ffffff" stroke-width="0.9" stroke-linecap="round"/><path d="M0.4,-3.6 L1.4,-6.4" stroke="${C.coral}" stroke-width="0.7" stroke-linecap="round"/></g>`;
}
function coconut(x, y, r = 3.2, straw = false) {
  return `<g transform="translate(${x} ${y})"><circle r="${r}" fill="#6e4a2c"/><circle cx="${-r * 0.3}" cy="${-r * 0.3}" r="${r * 0.45}" fill="#8c6038"/>${straw ? `<path d="M0.6,${-r + 0.4} L2.6,${-r - 3.4}" stroke="${C.coral}" stroke-width="0.8" stroke-linecap="round"/>` : ''}</g>`;
}
function catSitting() {
  // grey tabby, white chest, facing left, sitting. Origin at its feet.
  return `<path d="M3.2,-1 C7.4,-0.6 8.6,-3.6 6.8,-6.4" fill="none" stroke="#7d8590" stroke-width="1.5" stroke-linecap="round"/>`
    + `<path d="M-3.8,0 C-4.4,-4.8 -3,-8.6 0,-8.8 C3,-9 4.4,-5 3.8,0 Z" fill="#8e96a1"/>`
    + `<path d="M-3.2,0 C-3.2,-3 -2.4,-5.4 -1.2,-6 C-0.4,-4 -0.8,-1.6 -0.4,0 Z" fill="#f4f1ea"/>`
    + `<path d="M1.6,-7.6 L3.6,-6.8 M2.2,-5.2 L4,-4.4 M2.4,-2.8 L4,-2.2" stroke="#5f6670" stroke-width="0.7" stroke-linecap="round"/>`
    + `<circle cx="-1.6" cy="-10.6" r="3" fill="#8e96a1"/>`
    + `<path d="M-4.2,-11.6 L-4.2,-15 L-2.2,-13 Z M-0.6,-12.8 L0.6,-15.6 L1.2,-12.2 Z" fill="#8e96a1"/>`
    + `<path d="M-0.8,-12.8 L-1.8,-11.2 M0.6,-12.2 L-0.4,-10.6" stroke="#5f6670" stroke-width="0.6" stroke-linecap="round"/>`
    + `<path d="M-4.6,-10.2 Q-3.6,-9.6 -3,-10.4" fill="none" stroke="#2d333b" stroke-width="0.5"/>`
    + `<path d="M-4.4,-8.8 L-3.2,-9.4 L-3.6,-8.2 Z" fill="#f4f1ea"/>`;
}
function crate(w = 15, h = 9) {
  return `<rect x="${-w / 2}" y="${-h}" width="${w}" height="${h}" fill="#b07c4a"/><path d="M${-w / 2},${-h / 2} H${w / 2} M${-w / 2 + 2.5},${-h} V0 M${w / 2 - 2.5},${-h} V0" stroke="#8a5c33" stroke-width="0.9"/><rect x="${-w / 2}" y="${-h}" width="${w}" height="${h}" fill="none" stroke="#7a4f2b" stroke-width="0.8"/>`;
}
function turtle() {
  // facing left, origin at its belly line
  return `<ellipse cx="0" cy="-0.2" rx="11" ry="1.6" fill="#b89a5a" opacity="0.35"/>`
    + `<path d="M-9.6,-2.4 C-11.6,-2.6 -13.4,-3.4 -13.2,-4.8 C-13,-6.2 -11,-6.4 -9.2,-5" fill="#7fa86a"/>`
    + `<circle cx="-12" cy="-4.9" r="0.45" fill="#1d2a1b"/>`
    + `<path d="M-6.6,-1 L-9.4,0.4 L-5,0.4 Z M5.6,-1 L8.8,0.4 L4.6,0.4 Z" fill="#6f9b5c"/>`
    + `<path d="M-9,-1.2 C-8.4,-7.6 -3.6,-9.8 0.4,-9.8 C5,-9.8 9.4,-7.2 9.6,-1.2 Z" fill="#6b7f42"/>`
    + `<path d="M-5.6,-1.6 C-5.2,-5.6 -2.2,-7.4 0.4,-7.4 C3.2,-7.4 6.2,-5.4 6.4,-1.6 M-2.4,-7 L-1.6,-1.6 M3,-7.2 L2.4,-1.6 M-7.2,-4.4 H8" fill="none" stroke="#4e5e2f" stroke-width="0.7"/>`
    + `<path d="M-9.2,-1.2 H9.8" stroke="#d9c98f" stroke-width="1"/>`;
}
function drone() {
  return `<path d="M-9,-1 H9" stroke="#3b4350" stroke-width="1.4" stroke-linecap="round"/><rect x="-4" y="-2.6" width="8" height="3.6" rx="1.4" fill="#d8dde3"/><rect x="-1.4" y="-1.6" width="2.8" height="1.6" rx="0.6" fill="#2a3340"/>`;
}
function rotors() {
  const a = `<path d="M-12.6,-2.4 H-5.4 M5.4,-2.4 H12.6" stroke="#9aa4b0" stroke-width="0.9" stroke-linecap="round"/>`;
  const b = `<path d="M-10.6,-2.4 H-7.4 M7.4,-2.4 H10.6" stroke="#9aa4b0" stroke-width="0.9" stroke-linecap="round"/>`;
  return [a, b];
}
function parcel() {
  return `<rect x="-4.6" y="-7" width="9.2" height="7" fill="#c99a5b"/><rect x="-4.6" y="-7" width="9.2" height="1.8" fill="#b5864a"/><path d="M0,-7 V0" stroke="#e8d6a8" stroke-width="1.4"/>`;
}
function sandcastle() {
  return `<path d="M-9,0 V-5.6 H-6.6 V-8.8 H-5.2 V-7.6 H-4 V-8.8 H-2.6 V-5.6 H2.6 V-10.6 H4 V-9.4 H5.2 V-10.6 H6.6 V-9.4 H7.8 V-10.6 H9.2 V0 Z" fill="${C.sandSh}"/><path d="M4.8,-6.6 h2 v2.2 h-2 Z M-6,-3.8 h1.8 v2 h-1.8 Z" fill="#b99d63"/><path d="M-9,0 H9.2" stroke="#c7ab70" stroke-width="0.8"/>`;
}
function sharkHead() {
  // a grey head and fin breaking the surface, wearing headphones
  return `<path d="M8,0 L13.6,-9 L16.4,0 Z" fill="#6f7f8c"/>`
    + `<path d="M-8,0 C-7.6,-5.8 -3.4,-8.4 1,-8.4 C5,-8.4 7.4,-5.6 7.8,0 Z" fill="#7d8e9b"/>`
    + `<path d="M-6.4,-1.6 C-4,-0.8 -1.4,-0.6 1.4,-1.2" fill="none" stroke="#e8edf1" stroke-width="1"/>`
    + `<circle cx="-3.6" cy="-4.6" r="0.6" fill="#1b2128"/>`
    + `<path d="M-1.8,-8.2 C-1,-11.8 5.6,-11.8 6,-7.2" fill="none" stroke="${C.phones}" stroke-width="1.2" stroke-linecap="round"/>`
    + `<ellipse cx="-1.6" cy="-6.6" rx="1.4" ry="1.9" fill="${C.phones}"/><ellipse cx="6" cy="-6" rx="1.4" ry="1.9" fill="#d9cfb8"/>`;
}
function bottle(rot = 0) {
  return `<g transform="rotate(${rot})"><rect x="-4.2" y="-1.8" width="7" height="3.6" rx="1.6" fill="#5fae86" opacity="0.92"/><rect x="2.4" y="-1" width="2.6" height="2" fill="#5fae86"/><rect x="4.8" y="-0.9" width="1.4" height="1.8" fill="#b88a5a"/><rect x="-2.6" y="-1" width="3.4" height="1.2" fill="#f4ecd9" opacity="0.9"/></g>`;
}
function hermitCrab() {
  return `<path d="M-1,0 C-1,-4.4 2.2,-6 4.4,-4.6 C6.2,-3.4 6,-0.6 4.6,0 Z" fill="#e9d6b4"/><path d="M1,-1.6 C1.2,-3.6 3,-4.4 4,-3.2" fill="none" stroke="#c4a57a" stroke-width="0.6"/><path d="M-1.2,-1.2 C-3,-1.4 -4.2,-1 -4.6,-0.2 M-1,-0.4 L-3.2,0.6 M0.2,-0.2 L-1.2,1" stroke="#e0603e" stroke-width="0.8" stroke-linecap="round" fill="none"/><circle cx="-4.4" cy="-1.4" r="1.1" fill="#e0603e"/><path d="M-2.2,-1.8 V-3.4 M-1.4,-1.8 V-3.2" stroke="#e0603e" stroke-width="0.5"/>`;
}
function kumara(stage) {
  let s = `<path d="M-7,0 Q0,-4 7,0 Z" fill="${C.sandSh}"/>`;
  s += `<path d="M0,-1.6 V-5.4" stroke="#4f8a33" stroke-width="0.9"/><path d="M0,-4.6 C-3.4,-7 -5,-5 -3.6,-3.6 C-2.4,-3.6 -1,-4 0,-4.6 Z M0,-5.2 C2.6,-8.4 5,-6.8 3.8,-5 C2.6,-4.6 1.2,-4.8 0,-5.2 Z" fill="#62ad3e"/>`;
  if (stage >= 2) s += `<path d="M-4,-1.6 C-7.4,-4.4 -8.6,-2 -7.2,-1 Z M4,-1.6 C7.6,-4.2 8.8,-1.6 7.2,-0.8 Z M-2,-5 C-4.4,-9.6 -1.4,-10.6 -0.6,-8 Z M2,-5.6 C3,-10 6,-9.2 5,-6.8 Z" fill="#4f9a34"/>`;
  if (stage >= 3) s += `<circle cx="-5.6" cy="-3.6" r="1.25" fill="#d3b6f0"/><circle cx="-1.4" cy="-9.2" r="1.25" fill="#c9a7e8"/><circle cx="4.6" cy="-8.4" r="1.25" fill="#d3b6f0"/><circle cx="6.6" cy="-3" r="1.1" fill="#c9a7e8"/><circle cx="-5.6" cy="-3.6" r="0.4" fill="#fff6b0"/><circle cx="-1.4" cy="-9.2" r="0.4" fill="#fff6b0"/><circle cx="4.6" cy="-8.4" r="0.4" fill="#fff6b0"/>`;
  return s;
}
function signalBubble() {
  let s = `<rect x="-11" y="-12" width="22" height="13" rx="3" fill="#ffffff" opacity="0.95"/><path d="M-2,1 L0,4 L2,1 Z" fill="#ffffff" opacity="0.95"/>`;
  const bars = [[-6.6, 3], [-2.6, 5], [1.4, 7], [5.4, 9]];
  bars.forEach(([x, h], i) => {
    s += `<rect x="${x}" y="${-2 - h}" width="2.6" height="${h}" rx="0.6" fill="${i === 0 ? '#2ea043' : '#c8d1da'}"/>`;
  });
  return s;
}
function popup(text, color) {
  return T(text, 0, 0, 8, { a: 'm', w: 0.2, c: color });
}

function drawHero() {
  const hy = 94; // horizon, hero-local
  let s = '';
  defs.push(`<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.skyTop}"/><stop offset="0.62" stop-color="${C.skyMid}"/><stop offset="1" stop-color="${C.skyLow}"/></linearGradient>`);
  defs.push(`<linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.seaFar}"/><stop offset="1" stop-color="${C.seaNear}"/></linearGradient>`);
  defs.push(`<linearGradient id="shade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#06111f" stop-opacity="0.62"/><stop offset="0.5" stop-color="#06111f" stop-opacity="0.34"/><stop offset="1" stop-color="#06111f" stop-opacity="0"/></linearGradient>`);
  defs.push(`<radialGradient id="shallowG" cx="0.5" cy="0.5" r="0.5"><stop offset="0.55" stop-color="${C.shallow}" stop-opacity="0.95"/><stop offset="1" stop-color="${C.shallow}" stop-opacity="0"/></radialGradient>`);
  defs.push(`<radialGradient id="sunG" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#fffbe6" stop-opacity="0.95"/><stop offset="0.35" stop-color="#fff3c4" stop-opacity="0.5"/><stop offset="1" stop-color="#fff3c4" stop-opacity="0"/></radialGradient>`);
  defs.push(`<clipPath id="heroClip"><rect x="0" y="0" width="${W}" height="${HERO_H}"/></clipPath>`);
  s += `<rect x="0" y="0" width="${W}" height="${hy}" fill="url(#sky)"/>`;
  s += `<circle cx="612" cy="20" r="50" fill="url(#sunG)"/>`;
  // clouds: soft cumulus heaps, swaying a few pixels
  const cloud = (x, y, k) => {
    const blobs = [[0, 0, 9], [10, -4, 11], [22, -1, 9], [31, 2, 7], [-9, 3, 6], [15, 3, 9]];
    let c = '';
    for (const [dx, dy, r] of blobs) c += `<circle cx="${r1(dx * k)}" cy="${r1(dy * k)}" r="${r1(r * k)}"/>`;
    return `<g transform="translate(${x} ${y})"><g fill="#cfe6f6" transform="translate(0 ${r1(2.2 * k)})">${c}</g><g fill="#ffffff">${c}</g><rect x="${r1(-15 * k)}" y="${r1(4 * k)}" width="${r1(53 * k)}" height="${r1(7 * k)}" fill="#ffffff"/></g>`;
  };
  const sway = (amp, dur, ph) => anim([[0, { x: 0 }, 'ease-in-out'], [dur / 2, { x: amp }, 'ease-in-out'], [dur, { x: 0 }]], { period: dur, start: ph });
  s += `<g ${sway(6, 20, 0)}>${cloud(548, 80, 0.62)}${cloud(880, 30, 1.0)}</g>`;
  s += `<g ${sway(-5, 30, 7)}>${cloud(668, 50, 0.6)}${cloud(380, 22, 0.6)}${cloud(250, 78, 0.5)}</g>`;
  // sea
  s += `<rect x="0" y="${hy}" width="${W}" height="${HERO_H - hy}" fill="url(#sea)"/>`;
  s += `<rect x="0" y="${hy}" width="${W}" height="1.2" fill="#d6f0fb" opacity="0.7"/>`;
  // glints in two alternating frames
  const [gA, gB] = flip(1.5, 1.5);
  let glA = '', glB = '';
  for (let i = 0; i < 46; i++) {
    const x = (i * 197.3) % W;
    const y = hy + 6 + ((i * 37.7) % (HERO_H - hy - 10));
    const len = 3 + ((i * 7) % 6) * (0.4 + (y - hy) / 80);
    const seg = `<rect x="${r1(x)}" y="${r1(y)}" width="${r1(len)}" height="1" fill="#ffffff" opacity="${r2(0.35 + (i % 3) * 0.15)}"/>`;
    if (i % 2) glA += seg; else glB += seg;
  }
  s += `<g ${gA}>${glA}</g><g ${gB}>${glB}</g>`;

  // the island, centred on IX
  const IX = 770, IY = 136;
  const ISL = 1.12; // the island is drawn at 1.12x about (IX, IY)
  let isl = '';
  isl += `<ellipse cx="${IX}" cy="${IY + 1}" rx="150" ry="22" fill="url(#shallowG)"/>`;
  const [fA, fB] = flip(1.5, 1.5, 0.75);
  const foam = (dx) => `<path d="M${IX - 122 + dx},${IY + 3} C${IX - 112},${IY + 15} ${IX + 90},${IY + 17} ${IX + 124 - dx},${IY + 2} C${IX + 110},${IY - 10} ${IX - 100},${IY - 13} ${IX - 122 + dx},${IY + 3} Z" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-dasharray="9 3 14 4 5 3" opacity="0.7"/>`;
  isl += `<g ${fA}>${foam(0)}</g><g ${fB}>${foam(3).replace('9 3 14 4 5 3', '5 4 11 3 8 5')}</g>`;
  isl += `<path d="M${IX - 116},${IY + 3} C${IX - 104},${IY + 13} ${IX + 86},${IY + 15} ${IX + 118},${IY + 2} C${IX + 104},${IY - 9} ${IX - 94},${IY - 12} ${IX - 116},${IY + 3} Z" fill="${C.wet}"/>`;
  isl += `<path d="M${IX - 110},${IY + 1} C${IX - 98},${IY + 10} ${IX + 80},${IY + 12} ${IX + 112},${IY + 1} C${IX + 98},${IY - 11} ${IX - 90},${IY - 14} ${IX - 110},${IY + 1} Z" fill="${C.sand}"/>`;
  isl += `<path d="M${IX - 70},${IY - 8} C${IX - 30},${IY - 12} ${IX + 40},${IY - 12} ${IX + 80},${IY - 6}" fill="none" stroke="#f6e8bf" stroke-width="2" opacity="0.8"/>`;
  // shrubs and rocks
  const shrub = (x, y, k) => `<g transform="translate(${x} ${y}) scale(${k})"><path d="M-8,0 C-9,-4 -6,-6 -4,-5 C-4,-8 0,-9 1,-6 C3,-8 7,-7 6,-4 C9,-4 9,0 7,0 Z" fill="${C.frondSh}"/><path d="M-5,-1 C-5,-4 -2,-5 -1,-3 C0,-6 4,-5 3,-2 Z" fill="${C.frond}"/></g>`;
  isl += shrub(IX - 64, IY - 7, 0.9) + shrub(IX + 102, IY - 3, 0.85) + shrub(IX + 58, IY - 9, 0.7);
  isl += `<ellipse cx="${IX - 96}" cy="${IY + 5}" rx="5" ry="3" fill="#8f949a"/><ellipse cx="${IX - 97}" cy="${IY + 4}" rx="3" ry="1.6" fill="#a9aeb3"/><ellipse cx="${IX + 30}" cy="${IY + 9}" rx="4" ry="2.4" fill="#8f949a"/>`;
  // raft, pulled up on the sand tip so it clears the card's right edge by about 20 px
  const RX = IX + 96;
  let raft = '';
  for (let i = 0; i < 6; i++) raft += `<rect x="${RX + i * 2}" y="${IY - 2 + i * 3}" width="44" height="3.4" rx="1.7" fill="${i % 2 ? C.logSh : C.log}"/>`;
  raft += `<path d="M${RX + 10},${IY - 2} L${RX + 21},${IY + 15} M${RX + 34},${IY - 2} L${RX + 45},${IY + 15}" stroke="${C.rope}" stroke-width="1"/>`;
  isl += `<g ${anim([[0, { y: 0 }, HOLD], [1.5, { y: 0.8 }, HOLD]], { period: 3 })}>${raft}</g>`;

  // palm: trunk from the sand curving up and left; fronds; the rescue flag at the top
  const PX = IX + 26, PY = IY - 4, TX = IX + 2, TY = IY - 100;
  let trunk = `<path d="M${PX},${PY} C${PX + 4},${PY - 40} ${TX + 10},${TY + 30} ${TX},${TY}" fill="none" stroke="${C.trunk}" stroke-width="6" stroke-linecap="round"/>`;
  trunk += `<path d="M${PX + 1.6},${PY} C${PX + 5.6},${PY - 40} ${TX + 11.6},${TY + 30} ${TX + 1.6},${TY}" fill="none" stroke="${C.trunkSh}" stroke-width="2"/>`;
  for (let i = 1; i < 12; i++) {
    const t = i / 12;
    const bx = (1 - t) ** 3 * PX + 3 * (1 - t) ** 2 * t * (PX + 4) + 3 * (1 - t) * t * t * (TX + 10) + t ** 3 * TX;
    const by = (1 - t) ** 3 * PY + 3 * (1 - t) ** 2 * t * (PY - 40) + 3 * (1 - t) * t * t * (TY + 30) + t ** 3 * TY;
    trunk += `<path d="M${r1(bx - 3)},${r1(by + 0.6)} L${r1(bx + 3)},${r1(by - 0.6)}" stroke="#6a432d" stroke-width="0.9"/>`;
  }
  isl += trunk;
  const frond = (ang, len, droop, col) => {
    const a = (ang * Math.PI) / 180;
    const ex = TX + Math.cos(a) * len, ey = TY + Math.sin(a) * len + droop;
    const mx = TX + Math.cos(a) * len * 0.5, my = TY + Math.sin(a) * len * 0.5 - 6;
    const nx = -Math.sin(a), ny = Math.cos(a);
    return `<path d="M${TX},${TY} Q${r1(mx + nx * 7)},${r1(my + ny * 7)} ${r1(ex)},${r1(ey)} Q${r1(mx - nx * 2)},${r1(my - ny * 2)} ${TX},${TY} Z" fill="${col}"/>`
      + `<path d="M${TX},${TY} Q${r1(mx + nx * 2)},${r1(my + ny * 2)} ${r1(ex)},${r1(ey)}" fill="none" stroke="${C.frondHi}" stroke-width="0.7" opacity="0.8"/>`;
  };
  let crownA = '', crownB = '';
  const fronds = [[200, 40, 16, C.frondSh], [-20, 42, 16, C.frondSh], [160, 38, 10, C.frond], [20, 40, 10, C.frond], [235, 30, 4, C.frond], [-60, 32, 4, C.frond], [130, 32, 2, C.frondHi], [55, 30, 2, C.frond]];
  for (const [a, l, d, c] of fronds) { crownA += frond(a, l, d, c); crownB += frond(a + 3, l, d + 1, c); }
  const [cA, cB] = flip(3, 3);
  isl += `<g ${cA}>${crownA}</g><g ${cB}>${crownB}</g>`;
  isl += coconut(TX - 3, TY + 4, 2.6) + coconut(TX + 3, TY + 5, 2.6) + coconut(TX, TY + 7, 2.4);
  // the flag: a pole and a coral pennant, two frames
  isl += `<path d="M${TX},${TY - 1} V${TY - 19}" stroke="#efe6d0" stroke-width="1.2"/>`;
  const [pA, pB] = flip(0.75, 0.75);
  isl += `<g ${pA}><path d="M${TX + 0.4},${TY - 19} L${TX + 13},${TY - 15.6} L${TX + 0.4},${TY - 12} Z" fill="${C.coral}"/></g>`;
  isl += `<g ${pB}><path d="M${TX + 0.4},${TY - 19} Q${TX + 7},${TY - 17.8} ${TX + 12.4},${TY - 14.6} Q${TX + 6},${TY - 14} ${TX + 0.4},${TY - 12} Z" fill="${C.coral}"/></g>`;

  // ---- props that come and go with the solves
  const HX = IX + 16, HYb = IY - 2; // her hip, back against the trunk
  const SC = 1.45; // her scale
  const sit = herSeated();
  // kumara behind her (planted at 24, leafy at 30, flowers at 33)
  const kx = IX - 40, ky = IY - 9;
  isl += `<g transform="translate(${kx} ${ky}) scale(1.3)"><g ${show([[24, 30]])}>${kumara(1)}</g><g ${show([[30, 33]])}>${kumara(2)}</g><g ${show([[33, RESET + 1]])}>${kumara(3)}</g></g>`;
  // sandcastle: built at 6, gone when the wave comes at 15.5
  isl += `<g transform="translate(${IX - 84} ${IY + 2}) scale(1.2)"><g ${show([[6, 15.6]])}>${sandcastle()}</g></g>`;
  // the tide's wave sweeps in at 15
  isl += `<g transform="translate(${IX - 150} ${IY + 4})"><g ${anim([[0, { x: 0, o: 0 }, HOLD], [15, { x: 0, o: 1 }], [15.9, { x: 74, o: 1 }], [16.6, { x: 60, o: 0 }, HOLD], [17, { x: 0, o: 0 }]])}><path d="M0,0 C10,-6 26,-7 40,-3 C34,-1 26,1 18,2 C10,3 4,2 0,0 Z" fill="#ffffff" opacity="0.92"/><path d="M6,1 C16,-3 28,-3 36,-2" stroke="#bfeaf3" stroke-width="1" fill="none"/></g></g>`;
  // the cat's crate floats in at 21 and beaches at 23
  const crX = IX - 98, crY = IY + 6;
  const crateKeys = [[0, { x: -70, y: 4, o: 0 }, HOLD], [21, { x: -70, y: 4, o: 1 }, HOLD]];
  for (let i = 1; i <= 8; i++) crateKeys.push([21 + i * 0.25, { x: -70 + i * 8.75, y: i % 2 ? 3 : 4 }, HOLD]);
  crateKeys.push([23.2, { x: 0, y: 0 }, HOLD], [RESET, { x: 0, y: 0, o: 1 }], [RESET + 1.5, { x: 0, y: 0, o: 0 }, HOLD], [FRESH, { x: -70, y: 4, o: 0 }, HOLD]);
  isl += `<g transform="translate(${crX} ${crY})"><g ${anim(crateKeys)}>${crate()}<g transform="translate(-1 -9) scale(1.25)">${catSitting()}</g></g></g>`;
  isl += `<g transform="translate(${crX + 8} ${crY - 26})"><g ${show([[25, RESET]])}>${T('z', 0, 0, 5, { w: 0.18, c: '#ffffff' })}${T('z', 4, -5, 6.5, { w: 0.18, c: '#ffffff' })}</g></g>`;
  // the turtle crawls up from the right at 12 and dozes
  const tuX = IX + 78, tuY = IY + 6;
  const tuKeys = [[0, { x: 46, y: 14, o: 0 }, HOLD], [12, { x: 46, y: 14, o: 1 }, HOLD]];
  for (let i = 1; i <= 5; i++) tuKeys.push([12 + i * 0.375, { x: 46 - i * 9.2, y: 14 - i * 2.8 }, HOLD]);
  tuKeys.push([14, { x: 0, y: 0 }, HOLD], [RESET, { x: 0, y: 0, o: 1 }], [RESET + 1.5, { x: 0, y: 0, o: 0 }, HOLD], [FRESH, { x: 46, y: 14, o: 0 }, HOLD]);
  isl += `<g transform="translate(${tuX} ${tuY}) scale(1.2)"><g ${anim(tuKeys)}>${turtle()}</g></g>`;
  isl += `<g transform="translate(${tuX - 16} ${tuY - 16})"><g ${show([[15, RESET]])}>${T('z', 0, 0, 5, { w: 0.18, c: '#ffffff' })}${T('z', 4, -5, 6.5, { w: 0.18, c: '#ffffff' })}</g></g>`;
  // the parcel lands at 11 right of the trunk and stays
  const paX = IX + 42, paY = IY + 1;
  const parcelKeys = [[0, { y: -72, o: 0 }, HOLD], [10.2, { y: -72, o: 1 }], [11, { y: 0, o: 1 }, HOLD], [RESET, { y: 0, o: 1 }], [RESET + 1.5, { y: 0, o: 0 }, HOLD], [FRESH, { y: -72, o: 0 }, HOLD]];
  // the drone carries it in, lowers it on a line, and leaves
  const droneKeys = [[0, { x: 260, y: -60, o: 0 }, HOLD], [9, { x: 260, y: -60, o: 1 }], [10.2, { x: 0, y: 0 }, HOLD], [11.2, { x: 0, y: 0 }], [12.8, { x: 230, y: -70, o: 1 }, HOLD], [12.9, { o: 0 }, HOLD]];
  const dRot = flip(0.1, 0.1);
  const [ra, rb] = rotors();
  isl += `<g transform="translate(${paX} ${paY - 82})"><g ${anim(droneKeys)}>`
    + `<g ${show([[9, 10.2]])}><g transform="translate(0 10)">${parcel()}</g></g>`
    + `<g ${anim([[0, { o: 0 }, HOLD], [10.2, { o: 1 }, HOLD], [11.05, { o: 0 }, HOLD]])}><path d="M0,0 V72" stroke="#e8edf1" stroke-width="0.6" stroke-dasharray="1.5 1.5" ${anim([[0, { s: 0.05 }, HOLD], [10.2, { s: 0.05 }], [11, { s: 1 }, HOLD], [11.05, { s: 0.05 }, HOLD]], { origin: 'top' })}/></g>`
    + `${drone()}<g ${dRot[0]}>${ra}</g><g ${dRot[1]}>${rb}</g></g></g>`;
  isl += `<g transform="translate(${paX} ${paY})"><g ${anim(parcelKeys)}>${parcel()}</g></g>`;
  // the shark surfaces at 27, nods along on the beat, and sinks at 32.5
  const shX = IX - 128, shY = IY + 14;
  const shKeys = [[0, { y: 12, o: 0 }, HOLD], [27, { y: 12, o: 1 }], [27.6, { y: 0 }, HOLD], [29.5, { y: 0 }], [30.1, { y: 12, o: 1 }, HOLD], [30.2, { o: 0 }, HOLD]];
  defs.push(`<clipPath id="shClip"><rect x="-30" y="-30" width="60" height="30.6"/></clipPath>`);
  isl += `<g transform="translate(${shX} ${shY})"><g clip-path="url(#shClip)"><g ${anim(shKeys)}><g ${anim([[0, { y: 0 }, HOLD], [BEAT / 2, { y: 1 }, HOLD]], { period: BEAT })}>${sharkHead()}</g></g></g>`
    + `<g ${show([[27.4, 30]])}><path d="M-12,0.6 Q0,-1.6 18,0.6" fill="none" stroke="#ffffff" stroke-width="1.1" opacity="0.8"/></g></g>`;
  // the bottle: thrown at 30, lands in the sea, washes straight back to her feet
  const boKeys = [[0, { x: 0, y: 0, o: 0, r: 0 }, HOLD], [30, { x: -2, y: -16, o: 1, r: -40 }, HOLD]];
  const arc = [[-30, -30, 30], [-60, -34, 100], [-88, -24, 170], [-110, -6, 240], [-118, 6, 300]];
  arc.forEach(([x, y, r], i) => boKeys.push([30.15 + i * 0.15, { x, y, r }, HOLD]));
  [[-112, 8], [-118, 6], [-112, 8]].forEach(([x, y], i) => boKeys.push([31 + i * 0.3, { x, y, r: 0 }, HOLD]));
  [[-86, 6], [-60, 5], [-34, 4], [-12, 3], [0, 1]].forEach(([x, y], i) => boKeys.push([31.9 + i * 0.2, { x, y, r: -15 }, HOLD]));
  boKeys.push([33, { x: 0, y: 1, r: -15 }, HOLD], [RESET, { o: 1 }], [RESET + 1.5, { o: 0 }, HOLD], [FRESH, { x: 0, y: 0, r: 0, o: 0 }, HOLD]);
  isl += `<g transform="translate(${HX - 34} ${HYb + 6})"><g ${anim(boKeys, { origin: 'center' })}>${bottle()}</g></g>`;

  // her: seated (with three arm states), standing up to leave, walking over the water
  const nod = anim([[0, { y: 0 }, HOLD], [BEAT * 0.5, { y: 0.7 }, HOLD]], { period: BEAT });
  const seatedVis = show([[0, 36], [42.6, LOOP]]);
  const armRestVis = show([[0, 3], [7.5, 30], [30.4, 36], [FRESH, LOOP]]);
  const armSipVis = show([[3, 7.5]]);
  const armThrowVis = show([[30, 30.4]]);
  const coffeeVis = show([[42.6, RESET + 1.5]]);
  let her = `<g ${seatedVis}>${sit.body}<g ${nod}>${sit.head}</g>`
    + `<g ${armRestVis}>${sit.armRest}</g>`
    + `<g ${armSipVis}><path d="M-1.2,-14 L-5.2,-11 L-4.4,-17.4" fill="none" stroke="${C.skin}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>${coconut(-6.2, -18.4, 2.8, true)}</g>`
    + `<g ${armThrowVis}><path d="M-1.2,-14 L-5,-18.6 L-8.4,-22" fill="none" stroke="${C.skin}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></g>`
    + `<g ${coffeeVis}>${icedCoffee(-9.4, -7.2)}</g>`
    + `</g>`;
  isl += `<g transform="translate(${HX} ${HYb}) scale(${SC})">${her}</g>`;
  // leaving: stand at 36, walk right over the water in stepped strides, gone, back with coffee
  const out = [[36, 0]];
  for (let i = 1; i <= 9; i++) out.push([36.3 + i * 0.35, i * 24]);
  const back = [];
  for (let i = 0; i <= 8; i++) back.push([39.8 + i * 0.35, 216 - i * 26]);
  back.push([42.6, 0]);
  const walkKeys = [[0, { x: 0, o: 0 }, HOLD]];
  for (const [t, x] of out) walkKeys.push([t, { x, o: 1 }, HOLD]);
  walkKeys.push([39.6, { x: 216, o: 0 }, HOLD]);
  const backKeys = [[0, { x: 216, o: 0 }, HOLD]];
  for (const [t, x] of back) backKeys.push([t, { x, o: t === 42.6 ? 0 : 1 }, HOLD]);
  const legFlip = flip(0.4, 0.4);
  const standA = herStanding('A', false), standB = herStanding('B', false);
  const carryA = herStanding('A', true), carryB = herStanding('B', true);
  isl += `<g transform="translate(${HX - 2} ${IY + 1})"><g ${anim(walkKeys)}><g transform="scale(${-SC} ${SC})"><g ${legFlip[0]}>${standA}</g><g ${legFlip[1]}>${standB}</g></g></g></g>`;
  isl += `<g transform="translate(${HX - 2} ${IY + 1})"><g ${anim(backKeys)}><g transform="scale(${SC})"><g ${legFlip[0]}>${carryA}</g><g ${legFlip[1]}>${carryB}</g></g></g></g>`;
  // little ripples under her feet while she is over the water
  isl += `<g transform="translate(${HX + 150} ${IY + 4})"><g ${show([[38, 39.6], [39.8, 41.4]])}><ellipse cx="0" cy="0" rx="9" ry="1.6" fill="none" stroke="#ffffff" stroke-width="0.9" opacity="0.8"/></g></g>`;

  // signal: one bar, at the top of the palm
  isl += `<g transform="translate(${TX - 30} ${TY - 6})"><g ${anim([[0, { o: 0, y: 4 }, HOLD], [18, { o: 0, y: 4 }], [18.3, { o: 1, y: 0 }, HOLD], [23.4, { o: 1, y: 0 }], [23.8, { o: 0, y: 0 }, HOLD]])}>${signalBubble()}</g></g>`;

  // coconut crab, during the freeze: a crab shuffles in, a coconut drops on it, the coconut walks off
  const cbX = IX + 36, cbY = IY + 9;
  const crabKeys = [[0, { x: 34, o: 0 }, HOLD], [44.8, { x: 34, o: 1 }, HOLD]];
  for (let i = 1; i <= 5; i++) crabKeys.push([44.8 + i * 0.3, { x: 34 - i * 6.8 }, HOLD]);
  crabKeys.push([46.75, { x: 0, o: 0 }, HOLD], [47, { x: 34, o: 0 }]);
  isl += `<g transform="translate(${cbX} ${cbY}) scale(1.3)"><g ${anim(crabKeys)}>${hermitCrab()}</g></g>`;
  const nutKeys = [[0, { x: TX + 2 - cbX, y: TY + 6 - cbY, o: 0 }, HOLD], [46.2, { x: TX + 2 - cbX, y: TY + 6 - cbY, o: 1 }, HOLD]];
  const fall = 5;
  for (let i = 1; i <= fall; i++) {
    const f = i / fall;
    nutKeys.push([46.2 + i * 0.11, { x: (TX + 2 - cbX) * (1 - f), y: (TY + 6 - cbY) * (1 - f * f) - 3 * f * f + 0 }, HOLD]);
  }
  nutKeys.push([46.75, { x: 0, y: -3 }, HOLD]);
  for (let i = 1; i <= 8; i++) nutKeys.push([47.4 + i * 0.3, { x: i * 7, y: -3 - (i % 2) * 0.6 }, HOLD]);
  nutKeys.push([50.2, { x: 56, y: -3, o: 1 }], [50.8, { x: 56, y: -3, o: 0 }, HOLD]);
  const legsK = flip(0.15, 0.15);
  isl += `<g transform="translate(${cbX} ${cbY})"><g ${anim(nutKeys)}>`
    + `<g ${show([[46.75, 51]])}><g ${legsK[0]}><path d="M-3.6,0.6 L-5,3 M-1.4,1 L-1.8,3.4 M1.4,1 L1.8,3.4 M3.6,0.6 L5,3" stroke="#e0603e" stroke-width="0.9" stroke-linecap="round"/></g><g ${legsK[1]}><path d="M-3.6,0.6 L-4.2,3.4 M-1.4,1 L-2.4,3.2 M1.4,1 L2.4,3.2 M3.6,0.6 L4.2,3.4" stroke="#e0603e" stroke-width="0.9" stroke-linecap="round"/></g></g>`
    + `${coconut(0, 0, 3.6)}</g></g>`;

  // score popups over the island when a solve lands
  const POP = {
    coconut: [HX - 12, HYb - 40], sandcastle: [IX - 84, IY - 20], drone: [paX + 22, paY - 58], turtle: [tuX - 2, tuY - 22],
    tide: [IX - 96, IY - 12], signal: [TX - 30, TY - 26], cat: [crX + 2, crY - 34], kumara: [kx, ky - 22],
    shark: [shX, shY - 22], bottle: [HX - 30, HYb - 14], flowers: [kx, ky - 22], leave: [HX + 40, IY - 72], crab: [cbX + 12, cbY - 18],
  };
  for (const sv of SOLVES) {
    const [x, y] = POP[sv.tile];
    const label = sv.frozen ? '+?' : `+${TILE[sv.tile].pts}`;
    const col = sv.frozen ? C.freeze : '#ffffff';
    const k = anim([[0, { y: 0, o: 1 }], [1.6, { y: -9, o: 1 }], [2.2, { y: -11, o: 0 }, HOLD]], { start: sv.t });
    isl += `<g transform="translate(${x} ${y})"><g ${k}><g transform="translate(0.6 0.8)">${popup(label, '#06111f')}</g>${popup(label, col)}</g></g>`;
  }

  s += `<g transform="translate(${IX} ${IY}) scale(${ISL}) translate(${-IX} ${-IY})">${isl}</g>`;
  // the left shade and the event title
  s += `<rect x="0" y="0" width="640" height="${HERO_H}" fill="url(#shade)"/>`;
  s += T('ISLAND CTF · 10-HOUR EDITION · SEED 1992', 36, 32, 8, { w: 0.17, c: '#ffd9a8', track: 30 });
  const titleCap = 44;
  s += `<g transform="translate(2.5 3)" opacity="0.55">${T('CASTAWAY', 34, 96, titleCap, { w: 0.21, c: '#06111f', track: 26 })}</g>`;
  s += T('CASTAWAY', 34, 96, titleCap, { w: 0.21, c: '#ffffff', track: 26 });
  const tw = textWidth('CASTAWAY', titleCap, { w: 0.21, track: 26 });
  // event-status chip beside the title. Not "LIVE": nothing is streaming, and no video is
  // out yet, so the chip tells the truth: the contest is still being built.
  const lx = 34 + tw + 18;
  const chipW = 18 + textWidth('IN DEV', 7.5, { w: 0.18, track: 16 }) + 8;
  s += `<rect x="${r1(lx)}" y="65" width="${r1(chipW)}" height="18" rx="9" fill="#06111f" fill-opacity="0.55" stroke="#ffffff" stroke-opacity="0.35"/>`;
  s += `<circle cx="${r1(lx + 11)}" cy="74" r="3.4" fill="#e3b341" ${anim([[0, { o: 1 }, 'ease-in-out'], [1.5, { o: 0.45 }, 'ease-in-out'], [3, { o: 1 }]], { period: 3 })}/>`;
  s += T('IN DEV', lx + 18, 78, 7.5, { w: 0.18, c: '#ffffff', track: 16 });
  s += T('Capture the flag. There is one flag. It is on the palm.', 36, 125, 11.5, { w: 0.13, c: '#ffffff' });
  s += T('She mostly idles. Every so often a gag happens, and somebody scores.', 36, 147, 9.5, { w: 0.12, c: '#d7ecfa' });
  return `<g transform="translate(0 ${HERO_Y})"><g clip-path="url(#heroClip)">${s}</g></g>`;
}

// ------------------------------------------------------------------------------ the board
function drawBoard() {
  const { x, y, w, h } = BOARD;
  let s = `<rect x="${x + 0.5}" y="${y + 0.5}" width="${w - 1}" height="${h - 1}" rx="10" fill="${C.panel}" stroke="${C.line}"/>`;
  const ix = x + 16, iw = w - 32;
  s += T('Challenges', ix, y + 26, 12.5, { w: 0.16, c: C.bright });
  // solved counter
  const states = [];
  const times = SOLVES.map((sv) => sv.t);
  for (let n = 0; n <= SOLVES.length; n++) {
    const from = n === 0 ? 0 : times[n - 1];
    const to = n === SOLVES.length ? RESET + 1 : times[n];
    const win = n === 0 ? [[0, from === 0 ? times[0] : 0], [RESET + 1, LOOP]] : [[from, to]];
    states.push(`<g ${show(win)}>${T(`${n} / 16 solved`, x + w - 16, y + 25, 9, { a: 'e', w: 0.13, c: n ? C.text : C.muted })}</g>`);
  }
  s += states.join('');
  s += `<rect x="${ix}" y="${y + 36}" width="${iw}" height="1" fill="${C.line}"/>`;
  const gap = 12;
  const tw = (iw - 3 * gap) / 4;
  const th = 52;
  let row = 0, col = 0;
  const rowY = (r) => y + 48 + r * 84;
  for (const cat of CATS) {
    const ry = rowY(row);
    const cx = ix + col * (tw + gap);
    s += T(cat.name, cx, ry + 10, 9.5, { w: 0.15, c: C.head });
    const nw = textWidth(cat.name, 9.5, { w: 0.15 });
    s += T(`${cat.note} · ${cat.pts} pts`, cx + nw + 7, ry + 10, 8, { w: 0.12, c: C.muted });
    cat.tiles.forEach(([id, name], i) => {
      const tx = ix + (col + i) * (tw + gap), ty = ry + 18;
      const sv = SOLVES.find((q) => q.tile === id);
      s += drawTile(tx, ty, tw, th, name, cat.pts, sv);
    });
    if (cat.half && col === 0) col = 2; else { row++; col = 0; }
  }
  return s;
}
function drawTile(x, y, w, h, name, pts, sv) {
  let s = `<rect x="${r1(x + 0.5)}" y="${r1(y + 0.5)}" width="${r1(w - 1)}" height="${h - 1}" rx="6" fill="${C.tile}" stroke="${C.line}"/>`;
  if (sv) {
    const t = sv.t;
    // the solved state fades in on the bar, and fades out with the reset (staggered a touch)
    const off = RESET + (t / LOOP) * 1.2;
    const k = anim([[0, { o: 0 }, HOLD], [t, { o: 0 }], [t + 0.25, { o: 1 }, HOLD], [off, { o: 1 }], [off + 0.5, { o: 0 }, HOLD]]);
    s += `<g ${k}><rect x="${r1(x + 0.5)}" y="${r1(y + 0.5)}" width="${r1(w - 1)}" height="${h - 1}" rx="6" fill="${C.solved}" stroke="${C.solvedLine}"/>`
      + `<circle cx="${r1(x + w - 9.5)}" cy="${y + 9.5}" r="4.4" fill="#ffffff" fill-opacity="0.92"/><path d="M${r1(x + w - 11.7)},${y + 9.7} L${r1(x + w - 10)},${y + 11.4} L${r1(x + w - 7.3)},${y + 7.7}" fill="none" stroke="${C.solved}" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>`
      + (sv.frozen ? `<g ${show([[0, END]])}><rect x="${r1(x + 6)}" y="${y + h - 13}" width="31" height="9" rx="4.5" fill="${C.freeze}"/>${T('frozen', x + 21.5, y + h - 6.3, 5.6, { a: 'm', w: 0.18, c: C.freezeInk })}</g>` : '')
      + `</g>`;
    // a ring that flashes outward once on the solve
    const ring = anim([[0, { o: 0.9, s: 1 }], [0.7, { o: 0, s: 1.12 }, HOLD]], { origin: 'center', start: t });
    s += `<rect x="${r1(x + 0.5)}" y="${r1(y + 0.5)}" width="${r1(w - 1)}" height="${h - 1}" rx="6" fill="none" stroke="#7ee787" stroke-width="2" ${ring}/>`;
  }
  let cap = 9;
  while (textWidth(name, cap, { w: 0.13 }) > w - 20) cap -= 0.25;
  s += T(name, x + w / 2, y + 24, cap, { a: 'm', w: 0.13, c: C.head });
  s += T(String(pts), x + w / 2, y + 42, 13, { a: 'm', w: 0.17, c: C.bright });
  return s;
}

// ------------------------------------------------------------------------------ the scoreboard
function drawScoreboard() {
  const { x, y, w, h } = SCORE;
  let s = `<rect x="${x + 0.5}" y="${y + 0.5}" width="${w - 1}" height="${h - 1}" rx="10" fill="${C.panel}" stroke="${C.line}"/>`;
  const ix = x + 16, iw = w - 32;
  s += T('Scoreboard', ix, y + 26, 12.5, { w: 0.16, c: C.bright });
  s += T('top 6 of 6', x + w - 16, y + 25, 9, { a: 'e', w: 0.13, c: C.muted });
  s += `<rect x="${ix}" y="${y + 36}" width="${iw}" height="1" fill="${C.line}"/>`;
  // info slot: the tie rule, then the freeze banner, then final
  const by = y + 44;
  s += `<g ${show([[0, FREEZE], [RESET + 1, LOOP]])}>${T('Ties go to whoever got there first.', ix, by + 14, 8.5, { w: 0.12, c: C.muted })}</g>`;
  s += `<g ${show([[FREEZE, END]])}><rect x="${ix}" y="${by}" width="${iw}" height="20" rx="5" fill="${C.freeze}"/>`
    + `<path d="M${ix + 12},${by + 4.5} V${by + 15.5} M${ix + 7.3},${by + 7.2} L${ix + 16.7},${by + 12.8} M${ix + 16.7},${by + 7.2} L${ix + 7.3},${by + 12.8}" stroke="${C.freezeInk}" stroke-width="1.3" stroke-linecap="round"/>`
    + T('Scoreboard frozen: she is idling. Play continues.', ix + 23, by + 14, fitCap('Scoreboard frozen: she is idling. Play continues.', 8.5, iw - 30, 0.15), { w: 0.15, c: C.freezeInk }) + `</g>`;
  s += `<g ${show([[END, RESET + 1]])}><rect x="${ix}" y="${by}" width="${iw}" height="20" rx="5" fill="none" stroke="${C.solvedLine}"/>`
    + T('Freeze lifted. Final standings:', ix + 9, by + 14, 8.5, { w: 0.15, c: '#7ee787' }) + `</g>`;

  // graph
  const gx = ix + 30, gy = y + 80, gw = iw - 30, gh = 112;
  const MAXS = 2500;
  const Y = (v) => gy + gh - (v / MAXS) * gh;
  const X = (t) => gx + (Math.min(t, END) / END) * gw; // contest clock: 0 to 10 h over 0 to 48 s
  let grid = '';
  for (let v = 0; v <= MAXS; v += 500) {
    grid += `<rect x="${gx}" y="${r1(Y(v))}" width="${gw}" height="0.8" fill="${v ? '#262c34' : '#3d444d'}"/>`;
    grid += T(String(v), gx - 6, Y(v) + 3, 6.8, { a: 'e', w: 0.13, c: C.faint });
  }
  for (let hh = 0; hh <= 10; hh += 2) {
    const xx = gx + (hh / 10) * gw;
    grid += T(`${hh}h`, xx, gy + gh + 13, 6.8, { a: hh === 0 ? 's' : hh === 10 ? 'e' : 'm', w: 0.13, c: C.faint });
  }
  // step lines, one per team, revealed by a curtain that moves with the contest clock
  let lines = '';
  for (const team of ORDER0) {
    let d = `M${r1(gx)},${r1(Y(0))}`;
    let v = 0;
    for (const sv of counted) {
      if (sv.team !== team) continue;
      d += ` H${r1(X(sv.t))} V${r1(Y(v += TILE[sv.tile].pts))}`;
    }
    d += ` H${r1(gx + gw)}`;
    lines = `<path d="${d}" fill="none" stroke="${TEAM[team].c}" stroke-width="1.8" stroke-linejoin="round"/>` + lines;
  }
  // castaway's frozen solve sits at its real time on the clock, revealed when the freeze lifts
  defs.push(`<clipPath id="plotClip"><rect x="${gx}" y="${gy - 6}" width="${gw + 2}" height="${gh + 8}"/></clipPath>`);
  const fx = X(FREEZE) - gx;
  const curtain = anim([[0, { x: 0 }], [FREEZE, { x: fx }, HOLD], [END, { x: gw + 4 }, HOLD], [FRESH, { x: 0 }, HOLD]]);
  const linesFade = anim([[0, { o: 1 }, HOLD], [RESET, { o: 1 }], [RESET + 1.5, { o: 0 }, HOLD], [FRESH, { o: 1 }, HOLD]]);
  // the curtain reaches 2 px below the zero line, or the lower half of the strokes still
  // lying on zero would peek out ahead of the clock
  s += `<g clip-path="url(#plotClip)"><g ${linesFade}>${lines}</g><g ${curtain}><rect x="${gx + 0.6}" y="${gy - 6}" width="${gw + 4}" height="${gh + 8}" fill="${C.panel}"/></g></g>`;
  s += grid;
  // the pen: a dot per team riding the curtain edge at its current score
  const penX = anim([[0, { x: 0, o: 1 }], [FREEZE, { x: fx }, HOLD], [END, { x: gw }, HOLD], [RESET, { x: gw, o: 1 }], [RESET + 1.5, { x: gw, o: 0 }, HOLD], [FRESH, { x: 0, o: 1 }, HOLD]]);
  let pens = '';
  for (const team of ORDER0) {
    const keys = [[0, { y: 0 }, HOLD]];
    let v = 0;
    for (const sv of counted) {
      if (sv.team !== team) continue;
      v += TILE[sv.tile].pts;
      keys.push([sv.at, { y: Y(v) - Y(0) }, HOLD]);
    }
    keys.push([FRESH, { y: 0 }, HOLD]);
    pens = `<g ${anim(keys)}><circle cx="${gx}" cy="${r1(Y(0))}" r="2.6" fill="${TEAM[team].c}" stroke="${C.panel}" stroke-width="1"/></g>` + pens;
  }
  s += `<g ${penX}>${pens}</g>`;
  // freeze marker and hatch
  defs.push(`<pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="2" height="6" fill="${C.freeze}" fill-opacity="0.28"/></pattern>`);
  s += `<g ${show([[FREEZE, END]])}><rect x="${r1(X(FREEZE))}" y="${gy}" width="${r1(gw - fx)}" height="${gh}" fill="url(#hatch)"/></g>`;
  s += `<g ${show([[FREEZE, RESET + 1]])}><path d="M${r1(X(FREEZE))},${gy - 2} V${gy + gh}" stroke="${C.freeze}" stroke-width="1" stroke-dasharray="3 2"/>${T('freeze', X(FREEZE) - 3, gy + 7, 6.5, { a: 'e', w: 0.16, c: C.freeze })}</g>`;

  // table
  const ty = gy + gh + 28;
  s += T('Place', ix, ty, 7.5, { w: 0.16, c: C.muted, track: 10 });
  s += T('Team', ix + 40, ty, 7.5, { w: 0.16, c: C.muted, track: 10 });
  s += T('Score', x + w - 16, ty, 7.5, { a: 'e', w: 0.16, c: C.muted, track: 10 });
  s += `<rect x="${ix}" y="${ty + 5}" width="${iw}" height="1" fill="${C.line}"/>`;
  const rh = 23;
  const r0 = ty + 7;
  for (let i = 0; i < 6; i++) {
    s += T(String(i + 1), ix + 10, r0 + i * rh + 15.5, 9, { a: 'm', w: 0.15, c: i === 0 ? '#ffd27a' : C.text });
    if (i < 5) s += `<rect x="${ix}" y="${r0 + (i + 1) * rh - 0.5}" width="${iw}" height="1" fill="#21262d"/>`;
  }
  // rows move when ranks change
  const rankAt = (t) => standings(t).order;
  // SVG has no z-index, so a row climbing past others would slide underneath them. Each climb
  // also draws a copy of the climbing row in a layer above the table, shown only while it moves.
  let climbers = '';
  ORDER0.forEach((team, idx) => {
    const keys = [];
    const rises = [];
    const pos = (t) => rankAt(t).indexOf(team) * rh;
    keys.push([0, { y: pos(0) }, HOLD]);
    let last = pos(0);
    for (const ct of changeTimes) {
      const p = pos(ct);
      if (p !== last) { keys.push([ct, { y: last }, 'ease-in-out'], [ct + 0.45, { y: p }, HOLD]); if (p < last) rises.push(ct); last = p; }
    }
    if (last !== pos(0)) keys.push([RESET + 0.5, { y: last }, 'ease-in-out'], [RESET + 1.1, { y: pos(0) }, HOLD]);
    // scores, one text per value
    const vals = [];
    let v = 0;
    vals.push([0, 0]);
    for (const sv of counted) if (sv.team === team) { v += TILE[sv.tile].pts; vals.push([sv.at, v]); }
    const scoreT = (val) => T(String(val).replace(/\B(?=(\d{3})+$)/g, ','), x + w - 16, 15.5, 9.5, { a: 'e', w: 0.17, c: val ? C.bright : C.faint });
    let sc = '';
    vals.forEach(([t0, val], i) => {
      const t1 = i + 1 < vals.length ? vals[i + 1][0] : RESET + 1;
      const win = i === 0 ? [[0, t1], [RESET + 1, LOOP]] : [[t0, t1]];
      sc += `<g ${show(win)}>${scoreT(val)}</g>`;
    });
    // a flash on the row when the team scores
    const flashAt = (t0) => `<rect x="${ix + 22}" y="0.5" width="${iw - 22}" height="${rh - 1}" rx="3" fill="${TEAM[team].c}" ${anim([[0, { o: 0.22 }], [1.2, { o: 0 }, HOLD]], { start: t0 })}/>`;
    const flash = vals.slice(1).map(([t0]) => flashAt(t0)).join('');
    const you = team === 'castaway';
    const tn = T(team, ix + 40, 15.5, 9, { w: you ? 0.17 : 0.14, c: C.head });
    const nw = textWidth(team, 9, { w: you ? 0.17 : 0.14 });
    const note = T(TEAM[team].note, ix + 40 + nw + 6, 15.5, 7.5, { w: 0.12, c: C.muted });
    // the row's fixed face (bar, dot, name, note) is drawn once in <defs> and placed by <use>
    defs.push(`<g id="R${idx}">${you ? `<rect x="${ix + 22}" y="3" width="2" height="${rh - 6}" rx="1" fill="${C.coral}"/>` : ''}<circle cx="${ix + 31}" cy="11.5" r="3.4" fill="${TEAM[team].c}"/>${tn}${note}</g>`);
    const bg = `<rect x="${ix + 22}" y="0.5" width="${iw - 22}" height="${rh - 1}" fill="${you ? '#1d232b' : C.panel}"/>`;
    const move = anim(keys);
    s += `<g transform="translate(0 ${r0})"><g ${move}>${bg}${flash}<use href="#R${idx}"/>${sc}</g></g>`;
    if (rises.length) {
      let v2 = 0;
      const scoreAt = (t) => { v2 = 0; for (const sv of counted) if (sv.team === team && sv.at <= t) v2 += TILE[sv.tile].pts; return v2; };
      const copies = rises.map((ct) => `<g ${show([[ct, ct + 0.45]])}>${bg}${flashAt(ct)}<use href="#R${idx}"/>${scoreT(scoreAt(ct))}</g>`).join('');
      climbers += `<g transform="translate(0 ${r0})"><g ${move}>${copies}</g></g>`;
    }
  });
  return s + climbers;
}

// ------------------------------------------------------------------------------ notifications
function drawFooter() {
  const { x, y, w, h } = FOOT;
  let s = `<rect x="${x + 0.5}" y="${y + 0.5}" width="${w - 1}" height="${h - 1}" rx="8" fill="${C.panel}" stroke="${C.line}"/>`;
  // bell
  const bx = x + 16, bcy = y + 14;
  s += `<path d="M${bx - 4.4},${bcy + 3} C${bx - 3.4},${bcy + 1.6} ${bx - 3.6},${bcy - 1} ${bx - 3.6},${bcy - 2} C${bx - 3.6},${bcy - 4.6} ${bx - 2},${bcy - 6} ${bx},${bcy - 6} C${bx + 2},${bcy - 6} ${bx + 3.6},${bcy - 4.6} ${bx + 3.6},${bcy - 2} C${bx + 3.6},${bcy - 1} ${bx + 3.4},${bcy + 1.6} ${bx + 4.4},${bcy + 3} Z" fill="${C.coral}"/><circle cx="${bx}" cy="${bcy + 4.6}" r="1.4" fill="${C.coral}"/>`;
  for (let i = 0; i < MESSAGES.length; i++) {
    const [t0, msg] = MESSAGES[i];
    const t1 = i + 1 < MESSAGES.length ? MESSAGES[i + 1][0] : LOOP;
    const win = t0 === 0 ? [[0, t1], [FRESH, LOOP]] : [[t0, t1 === LOOP ? FRESH : t1]];
    const solve = SOLVES.find((sv) => sv.t === t0);
    const colr = t0 >= FREEZE && t0 < END ? '#e3b341' : C.text;
    let line = '';
    if (solve) {
      // team name in its colour, then the rest
      const [team, ...rest] = msg.split(' ');
      const tw = textWidth(team, 9, { w: 0.17 });
      line = T(team, x + 30, y + 18, 9, { w: 0.17, c: TEAM[team].c }) + T(rest.join(' '), x + 30 + tw + 4.5, y + 18, 9, { w: 0.13, c: solve.frozen ? '#e3b341' : C.text });
    } else line = T(msg, x + 30, y + 18, 9, { w: 0.13, c: colr });
    s += `<g ${show(win)}>${line}</g>`;
  }
  s += T('flag format isle{...}', x + w - 14, y + 18, 8, { a: 'e', w: 0.12, c: C.faint });
  return s;
}

// ------------------------------------------------------------------------------ assemble
const nav = drawNav();
const hero = drawHero();
const board = drawBoard();
const score = drawScoreboard();
const foot = drawFooter();
const [navR, heroR, boardR, scoreR, footR, defsR] = [nav, hero, board, score, foot, defs.join('')].map(resolveWords);

const glyphDefs = [...usedGlyphs].sort().map((ch) => `<path id="${gid(ch)}" d="${glyphPath(FONT[ch][1])}"/>`).join('');
defs.push(`<clipPath id="card"><rect x="0" y="0" width="${W}" height="${H}" rx="14"/></clipPath>`);

const tRules = [...TCLS].map(([k, n]) => { const [c, sw] = k.split('|'); return `.${n}{stroke:${c};stroke-width:${sw}}`; }).join('');
const style = `[class^=t]{fill:none;stroke-linecap:round;stroke-linejoin:round}${tRules}${css.join('')}`
  + '@media (prefers-reduced-motion:reduce){*{animation:none!important}}';

const alt = "Castaway, drawn as a capture-the-flag contest board. A dark navbar reads CASTAWAY ctf, with tabs for Challenges, Scoreboard, Notifications, Rules and Teams and a real-time countdown that ends in ten hours. Under it a sunny event banner reads ISLAND CTF, 10-HOUR EDITION, SEED 1992, then CASTAWAY in big white capitals with an IN DEV chip and the line: capture the flag, there is one flag, it is on the palm. On the right of the banner, a small island with one tall palm, a coral flag at its top and a raft; a young woman in cream headphones, a coral tank top and cream shorts sits against the palm, nodding to the beat. Below, the challenge board: tiles grouped by the schedule's timers, Regular 100 points, Occasional 250, Rare 500, Super rare 1000 and Chained 50, with gags such as Coconut Sip, Sandcastle, Message in a Bottle, Turtle Visit, Delivery Drone, Signal Hunt, Stray Cat, Shark Nod, Leave Any Time and Tide Takes It. Over a 60-second loop, one bar of the music at a time, tiles turn green while the island acts each gag out: a coconut sip, a drone lowering a parcel, a turtle, the tide taking the sandcastle, one bar of signal at the top of the palm, a stray cat on a crate, a shark in headphones, a bottle that washes straight back, kumara flowers, and her walking off over the sea and back with an iced coffee. Beside the board, a step graph and a Place, Team, Score table for the schedule's six lanes, castaway, sea_sky, cat, turtle, shore and garden, re-ranking as they score, until an amber banner says: scoreboard frozen, she is idling, play continues. During the freeze a coconut drops on a hermit crab and walks off with it, and the points count once the freeze lifts.";

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${alt.replace(/"/g, '&quot;')}">`
  + `<title>Castaway: an island capture-the-flag board</title>`
  + `<style>${style}</style>`
  + `<defs>${glyphDefs}${wordDefs.join('')}${defsR}</defs>`
  + `<g clip-path="url(#card)"><rect x="0" y="0" width="${W}" height="${H}" fill="${C.page}"/>${navR}${heroR}${boardR}${scoreR}${footR}</g>`
  + `<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="14" fill="none" stroke="${C.line}"/>`
  + `</svg>\n`;

fs.mkdirSync(ASSETS, { recursive: true });
const out = path.join(ASSETS, `${SLUG}.svg`);
fs.writeFileSync(out, svg);
console.log(`wrote ${path.relative(process.cwd(), out)} (${(svg.length / 1024).toFixed(1)} KB, ${animN} animations)`);
