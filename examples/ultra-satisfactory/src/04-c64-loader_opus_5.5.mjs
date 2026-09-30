#!/usr/bin/env node
// 04-c64-loader_opus_5.5: the "C64 SID Loader" README header for ULTRA-SATISFACTORY.
//
// A Commodore 64 boots, LOADs ULTRA-SATISFACTORY off the disk drive (the turbo
// loader lists the data files as directory entries while stripes roll in the
// border), types RUN, then flips to a demo-style title screen: a colour-cycled
// two-line logo between two hex-cog emblems, the app's three tabs clicked
// through by a pointer (objective -> recipe -> building), a working assembly
// line that turns plates and rods into Modular Frames at the real recipe ratio,
// a SID tune panel with VU meters and a sine scroller.
//
// Everything is drawn from the 8x8 bitmap font and the procedural pixel art
// defined in this file (no <text>, no fonts, nothing external), and the show is
// CSS animation on one 15 s cycle, so it runs inside GitHub's <img>.
//
//   node 04-c64-loader_opus_5.5.mjs         regenerate the SVG
//   node 04-c64-loader_opus_5.5.mjs --nfo   print the block-letter NFO logo
//
// Plain Node, no dependencies. Randomness is a seeded PRNG, so output is stable.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, '..', 'assets', '04-c64-loader_opus_5.5.svg');

// ---------------------------------------------------------------- palette
// The "Colodore" VIC-II palette: the punchier of the two everyone argues about.
const P = {
  black: '#000000', white: '#ffffff', red: '#813338', cyan: '#75cec8',
  purple: '#8e3c97', green: '#56ac4d', blue: '#2e2c9b', yellow: '#edf171',
  orange: '#8e5029', brown: '#553800', lred: '#c46c71', dgrey: '#4a4a4a',
  grey: '#7b7b7b', lgreen: '#a9ff9f', lblue: '#706deb', lgrey: '#b2b2b2',
};
// WCAG relative luminance, used to keep the loader stripes photosensitivity-safe.
const lum = (hex) => {
  const ch = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
};

// ---------------------------------------------------------------- geometry
// One unit = one C64 pixel. The frame is a PAL picture, border included; the
// 320x200 text screen sits in the middle of it. A monitor bezel wraps the lot.
const FW = 384, FH = 280;          // frame, border included
const SX = 32, SY = 40;            // 40x25 text screen origin inside the frame
const BEZ = 8, BEZ_B = 14;         // bezel: sides/top, and the chin
const W = FW + BEZ * 2, H = FH + BEZ + BEZ_B;
const col = (c) => SX + c * 8;
const row = (r) => SY + r * 8;

// ---------------------------------------------------------------- timeline (seconds)
const CYCLE = 15;
const T = {
  type0: 0.6, typeDt: 0.045,       // LOAD"ULTRA-SATISFACTORY",8,1 typed out
  ret1: 1.95, search: 2.05,        // RETURN, SEARCHING FOR ...
  loading: 2.35, fileDt: 0.36,     // LOADING + turbo stripes; one file per fileDt
  loaded: 4.2,                     // READY.
  run0: 4.42, runDt: 0.09,         // RUN typed
  ret2: 4.8,                       // RETURN: screen clears
  title: 5.0,                      // intro title screen, OBJECTIVES tab
  tabItems: 8.3,                   // click: ITEMS tab
  tabBuild: 11.6,                  // click: BUILDINGS tab
  end: 14.8,                       // blank for a beat, then the machine "resets"
};

// ---------------------------------------------------------------- seeded PRNG
function mulberry32(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(0x6581);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];

// ---------------------------------------------------------------- 8x8 font
// A C64-style charset: 2-pixel verticals, 1-pixel horizontals, column 0 and
// row 7 left clear for spacing. Box pieces are PETSCII-style lines through the
// middle of the cell.
const FONT_SRC = `
A
...##...
..####..
.##..##.
.######.
.##..##.
.##..##.
.##..##.
........
B
.#####..
.##..##.
.##..##.
.#####..
.##..##.
.##..##.
.#####..
........
C
..####..
.##..##.
.##.....
.##.....
.##.....
.##..##.
..####..
........
D
.####...
.##.##..
.##..##.
.##..##.
.##..##.
.##.##..
.####...
........
E
.######.
.##.....
.##.....
.####...
.##.....
.##.....
.######.
........
F
.######.
.##.....
.##.....
.####...
.##.....
.##.....
.##.....
........
G
..####..
.##..##.
.##.....
.##.###.
.##..##.
.##..##.
..####..
........
H
.##..##.
.##..##.
.##..##.
.######.
.##..##.
.##..##.
.##..##.
........
I
..####..
...##...
...##...
...##...
...##...
...##...
..####..
........
J
...####.
....##..
....##..
....##..
....##..
.##.##..
..###...
........
K
.##..##.
.##.##..
.####...
.###....
.####...
.##.##..
.##..##.
........
L
.##.....
.##.....
.##.....
.##.....
.##.....
.##.....
.######.
........
M
.##...##
.###.###
.#######
.##.#.##
.##...##
.##...##
.##...##
........
N
.##..##.
.###.##.
.######.
.######.
.##.###.
.##..##.
.##..##.
........
O
..####..
.##..##.
.##..##.
.##..##.
.##..##.
.##..##.
..####..
........
P
.#####..
.##..##.
.##..##.
.#####..
.##.....
.##.....
.##.....
........
Q
..####..
.##..##.
.##..##.
.##..##.
.##..##.
..####..
....###.
........
R
.#####..
.##..##.
.##..##.
.#####..
.####...
.##.##..
.##..##.
........
S
..####..
.##..##.
.##.....
..####..
.....##.
.##..##.
..####..
........
T
.######.
...##...
...##...
...##...
...##...
...##...
...##...
........
U
.##..##.
.##..##.
.##..##.
.##..##.
.##..##.
.##..##.
..####..
........
V
.##..##.
.##..##.
.##..##.
.##..##.
.##..##.
..####..
...##...
........
W
.##...##
.##...##
.##...##
.##.#.##
.#######
.###.###
.##...##
........
X
.##..##.
.##..##.
..####..
...##...
..####..
.##..##.
.##..##.
........
Y
.##..##.
.##..##.
.##..##.
..####..
...##...
...##...
...##...
........
Z
.######.
.....##.
....##..
...##...
..##....
.##.....
.######.
........
0
..####..
.##..##.
.##.###.
.###.##.
.##..##.
.##..##.
..####..
........
1
...##...
..###...
...##...
...##...
...##...
...##...
.######.
........
2
..####..
.##..##.
.....##.
....##..
..##....
.##.....
.######.
........
3
..####..
.##..##.
.....##.
...###..
.....##.
.##..##.
..####..
........
4
.....##.
....###.
...####.
.##..##.
.#######
.....##.
.....##.
........
5
.######.
.##.....
.#####..
.....##.
.....##.
.##..##.
..####..
........
6
..####..
.##..##.
.##.....
.#####..
.##..##.
.##..##.
..####..
........
7
.######.
.##..##.
....##..
...##...
...##...
...##...
...##...
........
8
..####..
.##..##.
.##..##.
..####..
.##..##.
.##..##.
..####..
........
9
..####..
.##..##.
.##..##.
..#####.
.....##.
.##..##.
..####..
........
.
........
........
........
........
........
...##...
...##...
........
,
........
........
........
........
........
...##...
...##...
..##....
"
.##..##.
.##..##.
.##..##.
........
........
........
........
........
'
....##..
....##..
...##...
........
........
........
........
........
:
........
........
...##...
........
........
...##...
........
........
(
....##..
...##...
..##....
..##....
..##....
...##...
....##..
........
)
..##....
...##...
....##..
....##..
....##..
...##...
..##....
........
-
........
........
........
.######.
........
........
........
........
!
...##...
...##...
...##...
...##...
........
........
...##...
........
/
........
......##
.....##.
....##..
...##...
..##....
.##.....
........
?
..####..
.##..##.
.....##.
....##..
...##...
........
...##...
........
=
........
........
.######.
........
.######.
........
........
........
+
........
...##...
...##...
.######.
...##...
...##...
........
........
>
.##.....
..##....
...##...
....##..
...##...
..##....
.##.....
........
<
.....##.
....##..
...##...
..##....
...##...
....##..
.....##.
........
&
..####..
.##..##.
..####..
..###...
.##..###
.##..##.
..######
........
*
........
.##..##.
..####..
########
..####..
.##..##.
........
........
#
.##..##.
.##..##.
########
.##..##.
########
.##..##.
.##..##.
........
%
.##...##
.##..##.
....##..
...##...
..##....
.##..##.
##...##.
........
♪
....##..
....###.
....####
....##..
..####..
.#####..
..###...
........
█
########
########
########
########
########
########
########
########
─
........
........
........
########
########
........
........
........
│
...##...
...##...
...##...
...##...
...##...
...##...
...##...
...##...
┌
........
........
........
.....###
....####
...###..
...##...
...##...
┐
........
........
........
###.....
####....
..###...
...##...
...##...
└
...##...
...##...
...###..
....####
.....###
........
........
........
┘
...##...
...##...
..###...
####....
###.....
........
........
........
▒
##..##..
##..##..
..##..##
..##..##
##..##..
##..##..
..##..##
..##..##
[
..####..
..##....
..##....
..##....
..##....
..##....
..####..
........
]
..####..
....##..
....##..
....##..
....##..
....##..
..####..
........
;
........
........
...##...
........
........
...##...
...##...
..##....
`;

const FONT = {};
{
  const lines = FONT_SRC.split('\n').map((l) => l.trimEnd()).filter((l) => l.length);
  for (let i = 0; i < lines.length; i += 9) {
    const key = lines[i];
    const rows = lines.slice(i + 1, i + 9);
    if ([...key].length !== 1 || rows.length !== 8 || rows.some((r) => !/^[.#]{8}$/.test(r))) {
      throw new Error(`bad glyph near font line ${i}: ${key}`);
    }
    FONT[key] = rows;
  }
}
const gid = (ch) => `g${ch.codePointAt(0).toString(16)}`;
const usedGlyphs = new Set();

// ---------------------------------------------------------------- pixel helpers
class Grid {
  constructor(w, h) { this.w = w; this.h = h; this.a = new Uint8Array(w * h); }
  set(x, y) { if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.a[y * this.w + x] = 1; }
  get(x, y) { return x >= 0 && y >= 0 && x < this.w && y < this.h ? this.a[y * this.w + x] : 0; }
}

// Horizontal runs of set pixels, merged downwards into rectangles.
function gridRects(get, w, h) {
  const open = new Map();
  const rects = [];
  for (let y = 0; y <= h; y++) {
    const runs = new Set();
    if (y < h) {
      for (let x = 0; x < w;) {
        if (!get(x, y)) { x++; continue; }
        const s = x;
        while (x < w && get(x, y)) x++;
        runs.add(`${s},${x - s}`);
      }
    }
    for (const [k, r] of open) {
      if (runs.has(k)) { r[3]++; runs.delete(k); } else { rects.push(r); open.delete(k); }
    }
    for (const k of runs) { const [s, len] = k.split(',').map(Number); open.set(k, [s, y, len, 1]); }
  }
  return rects;
}
const rectsD = (rects, ox = 0, oy = 0) => rects.map(([x, y, w, h]) => `M${ox + x} ${oy + y}h${w}v${h}h${-w}z`).join('');
const gridD = (g, ox = 0, oy = 0) => rectsD(gridRects((x, y) => g.get(x, y), g.w, g.h), ox, oy);

// A small multi-colour canvas: every cell holds a palette key (or nothing).
// It comes out as one merged-rectangle path per colour.
class Canvas {
  constructor(w, h) { this.w = w; this.h = h; this.a = new Array(w * h).fill(null); }
  px(x, y, c) { if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.a[y * this.w + x] = c; }
  rect(x, y, w, h, c) { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.px(x + i, y + j, c); }
  svg(ox = 0, oy = 0) {
    const cols = [...new Set(this.a.filter(Boolean))];
    return cols.map((c) => `<path fill="${P[c]}" d="${rectsD(gridRects((x, y) => this.a[y * this.w + x] === c, this.w, this.h), ox, oy)}"/>`).join('');
  }
}
// ASCII art -> Canvas. The legend maps a character to a palette key.
function sprite(src, legend) {
  const rows = src.trim().split('\n').map((r) => r.trim());
  const c = new Canvas(rows[0].length, rows.length);
  rows.forEach((r, y) => [...r].forEach((ch, x) => { if (legend[ch]) c.px(x, y, legend[ch]); }));
  return c;
}

// ---------------------------------------------------------------- text
// One <use> per character; fill is inherited from the wrapping group.
function text(str, x, y, attrs = '') {
  let s = `<g transform="translate(${x} ${y})"${attrs ? ' ' + attrs : ''}>`;
  [...str.toUpperCase()].forEach((ch, i) => {
    if (ch === ' ') return;
    if (!FONT[ch]) throw new Error(`no glyph for "${ch}"`);
    usedGlyphs.add(ch);
    s += `<use href="#${gid(ch)}"${i ? ` x="${i * 8}"` : ''}/>`;
  });
  return `${s}</g>`;
}
// Multi-coloured line: segments of [string, fill].
function ctext(segs, x, y) {
  let out = '';
  let cx = x;
  for (const [str, fill] of segs) {
    if (str.trim()) out += text(str, cx, y, `fill="${fill}"`);
    cx += [...str].length * 8;
  }
  return out;
}
const len = (s) => [...s].length;
const centerX = (str, width = FW) => Math.round((width - len(str) * 8) / 2);

// ---------------------------------------------------------------- CSS timeline
// Every show/hide is a step-end track over the one 15 s cycle. Tracks with the
// same keyframes are shared. Base (non-animated) styles are the reduced-motion
// poster: the title screen on the ITEMS tab, standing still.
const css = [];
const tracks = new Map();
const pct = (t) => `${+(t / CYCLE * 100).toFixed(3)}%`;
function track(prop, pts) {
  if (pts[0][0] !== 0) throw new Error('tracks start at t=0');
  pts.forEach(([t], i) => {
    if (i && !(t > pts[i - 1][0])) throw new Error(`track ${prop} keyframes out of order at t=${t}`);
    if (t >= CYCLE) throw new Error(`track ${prop} keyframe past the cycle at t=${t}`);
  });
  const body = pts.map(([t, v]) => `${pct(t)}{${prop}:${v}}`).join('') + `100%{${prop}:${pts[pts.length - 1][1]}}`;
  let name = tracks.get(body);
  if (!name) {
    name = `t${tracks.size}`;
    tracks.set(body, name);
    css.push(`@keyframes ${name}{${body}}.${name}{animation:${name} ${CYCLE}s step-end infinite}`);
  }
  return name;
}
const win = (on, off = CYCLE) => track('opacity', [
  ...(on === 0 ? [[0, 1]] : [[0, 0], [on, 1]]),
  ...(off < CYCLE ? [[off, 0]] : []),
]);

// Frame-flip loops (sprite animation): classes `${name}0..n-1`, each visible
// for its slice of the period. Frame 0 is the resting frame.
function loopFrames(name, n, period) {
  for (let f = 0; f < n; f++) {
    const a = +(f / n * 100).toFixed(3), b = +((f + 1) / n * 100).toFixed(3);
    const kf = f === 0 ? `0%{opacity:1}${b}%{opacity:0}100%{opacity:0}`
      : f === n - 1 ? `0%{opacity:0}${a}%{opacity:1}100%{opacity:1}`
        : `0%{opacity:0}${a}%{opacity:1}${b}%{opacity:0}100%{opacity:0}`;
    css.push(`@keyframes ${name}${f}{${kf}}.${name}${f}{animation:${name}${f} ${period}s step-end infinite}`);
  }
  css.push(`${Array.from({ length: n - 1 }, (_, i) => `.${name}${i + 1}`).join(',')}{opacity:0}`);
}

const defs = [];

// ================================================================= BOOT SCREEN
const NAME = 'ULTRA-SATISFACTORY';
let boot = '';
boot += `<rect width="${FW}" height="${FH}" fill="${P.lblue}"/>`;

// Turbo-loader stripes. Every colour sits within 0.1 relative luminance of the
// others (light blue, grey, purple, orange), so the rolling bands read as
// "loading" without being a photosensitive flash.
{
  const STRIPES = [P.lblue, P.grey, P.purple, P.orange];
  const lums = STRIPES.map(lum);
  if (Math.max(...lums) - Math.min(...lums) >= 0.1) throw new Error('loader stripes: luminance spread is too wide');
  const STRIPE_SET = [P.lblue, P.purple, P.orange, P.grey, P.lblue, P.purple];
  const PERIOD = 96;
  const bands = [];
  let y = 0;
  let last = null;
  while (y < PERIOD) {
    let h = 1 + Math.floor(rand() * 6);
    if (y + h > PERIOD) h = PERIOD - y;
    let c;
    do { c = pick(STRIPE_SET); } while (c === last);
    bands.push([y, h, c]);
    last = c;
    y += h;
  }
  let s = '';
  for (let rep = 0; rep < Math.ceil((FH + PERIOD) / PERIOD); rep++) {
    for (const [by, bh, c] of bands) s += `<rect y="${rep * PERIOD + by}" width="${FW}" height="${bh}" fill="${c}"/>`;
  }
  css.push(`@keyframes roll{0%{transform:translateY(0)}100%{transform:translateY(-${PERIOD}px)}}.roll{animation:roll 1.2s linear infinite}`);
  boot += `<g class="${win(T.loading, T.loaded)}"><g class="roll">${s}</g></g>`;
}
boot += `<rect x="${SX}" y="${SY}" width="320" height="200" fill="${P.blue}"/>`;

// What the loader pulls off the disk, shown the way a 1541 directory lists
// files: the block count column is the real count of each thing in the app.
const FILES = [[140, 'ITEMS'], [211, 'RECIPES'], [477, 'BUILDINGS'], [5, 'PHASES']];
{
  let s = '';
  // RUN clears the screen, banner and all.
  s += `<g class="${win(0, T.ret2)}">`;
  s += text('    **** COMMODORE 64 BASIC V2 ****', col(0), row(1));
  s += text(' 64K RAM SYSTEM  38911 BASIC BYTES FREE', col(0), row(3));
  s += text('READY.', col(0), row(5));
  s += '</g>';

  const cmd = `LOAD"${NAME}",8,1`;
  const typedAt = [...cmd].map((_, i) => +(T.type0 + i * T.typeDt).toFixed(3));
  if (typedAt[typedAt.length - 1] >= T.ret1) throw new Error('typing overruns RETURN');
  [...cmd].forEach((ch, i) => { s += `<g class="${win(typedAt[i], T.ret2)}">${text(ch, col(i), row(6))}</g>`; });
  s += `<g class="${win(T.search, T.ret2)}">${text(`SEARCHING FOR ${NAME}`, col(0), row(8))}</g>`;
  s += `<g class="${win(T.loading, T.ret2)}">${text('LOADING', col(0), row(9))}</g>`;
  FILES.forEach(([n, name], i) => {
    const t = +(T.loading + (i + 1) * T.fileDt).toFixed(3);
    if (t >= T.loaded) throw new Error('file list overruns the load');
    const line = `${String(n).padEnd(5)}"${name}"`.padEnd(24) + 'PRG';
    s += `<g class="${win(t, T.ret2)}">${text(line, col(0), row(10 + i))}</g>`;
  });
  const READY2 = 10 + FILES.length, RUNROW = READY2 + 1;
  s += `<g class="${win(T.loaded, T.ret2)}">${text('READY.', col(0), row(READY2))}</g>`;
  const runAt = [0, 1, 2].map((i) => +(T.run0 + i * T.runDt).toFixed(3));
  [...'RUN'].forEach((ch, i) => { s += `<g class="${win(runAt[i], T.ret2)}">${text(ch, col(i), row(RUNROW))}</g>`; });

  // The cursor: blinks while idle, rides along while typing, vanishes while loading.
  const cursor = (c, r, cls) => `<rect class="${cls}" x="${col(c)}" y="${row(r)}" width="8" height="8"/>`;
  s += cursor(0, 6, track('opacity', [[0, 1], [0.33, 0]]));
  typedAt.forEach((t, i) => { s += cursor(i + 1, 6, win(t, typedAt[i + 1] ?? T.ret1)); });
  s += cursor(0, RUNROW, track('opacity', [[0, 0], [T.loaded, 1], [T.run0, 0]]));
  runAt.forEach((t, i) => { s += cursor(i + 1, RUNROW, win(t, runAt[i + 1] ?? T.ret2)); });

  boot += `<g fill="${P.lblue}">${s}</g>`;
}

// ================================================================= TITLE SCREEN
// Vertical layout of the title screen, top to bottom (frame units).
const Y = {
  header: 4,
  ultra: 15,        // 35 tall
  satis: 54,        // 28 tall
  tagline: 87,
  tabs: 98,         // 10 tall
  panel: 108,       // 51 tall
  belt: 199,        // conveyor surface
  sid: 213,
  scroll: 262,
};
let title = '';

// ---------- raster bars (behind the logo, border to border)
{
  const RAMPS = [
    [P.blue, P.purple, P.lblue, P.cyan, P.white, P.cyan, P.lblue, P.purple, P.blue],
    [P.brown, P.red, P.orange, P.lred, P.yellow, P.lred, P.orange, P.red, P.brown],
    [P.dgrey, P.blue, P.purple, P.lblue, P.lgrey, P.lblue, P.purple, P.blue, P.dgrey],
  ];
  css.push('@keyframes bar{0%{transform:translateY(0)}100%{transform:translateY(50px)}}.bar{animation:bar 2.1s ease-in-out infinite alternate}');
  RAMPS.forEach((ramp, i) => {
    const rects = ramp.map((c, k) => `<rect y="${14 + k}" width="${FW}" height="1" fill="${c}"/>`).join('');
    // transform here is only the reduced-motion resting place; the animation overrides it.
    title += `<g class="bar" style="animation-delay:-${(i * 0.7).toFixed(2)}s;transform:translateY(${4 + i * 21}px)">${rects}</g>`;
  });
}

// ---------- header
{
  const s = '▒▒▒ MANIFOLD DESTINY PRESENTS ▒▒▒';
  title += text(s, centerX(s), Y.header, `fill="${P.lgrey}"`);
}

// ---------- the logo: italic, outlined, extruded, colour-cycled per raster line
// Both words lean at the same angle (one unit per five raster lines).
const LEAN = 5;
function logoWord(word, { ls, lsy, top, wash, dt, extrudeFill, cls }) {
  const placed = [];
  let cx = 0;
  for (const ch of word) {
    const rows = FONT[ch];
    let a = 8, b = -1;
    rows.forEach((r) => [...r].forEach((p, x) => { if (p === '#') { a = Math.min(a, x); b = Math.max(b, x); } }));
    placed.push({ ch, x: cx - a });
    cx += b - a + 2;
  }
  const width = cx - 1;
  const hgt = 7 * lsy;
  const lean = (y) => Math.floor((hgt - 1 - y) / LEAN);
  const M = 4;                          // margin for outline and extrusion
  const gw = width * ls + lean(0) + M * 2, gh = hgt + M * 2;
  const g = new Grid(gw, gh);
  for (const { ch, x } of placed) {
    FONT[ch].forEach((r, gy) => [...r].forEach((p, gx) => {
      if (p !== '#') return;
      for (let dy = 0; dy < lsy; dy++) {
        const yy = gy * lsy + dy;
        for (let dx = 0; dx < ls; dx++) g.set(M + (x + gx) * ls + lean(yy) + dx, M + yy);
      }
    }));
  }
  const outline = new Grid(gw, gh);
  for (let y = 0; y < gh; y++) for (let x = 0; x < gw; x++) {
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (g.get(x + dx, y + dy)) outline.set(x, y);
  }
  // A solid extrusion (the shape stepped down-right twice) reads as depth
  // without flooding the letter counters the way a flat offset shadow does.
  const extrude = new Grid(gw, gh);
  for (let y = 0; y < gh; y++) for (let x = 0; x < gw; x++) {
    if (outline.get(x - 1, y - 1) || outline.get(x - 2, y - 2)) extrude.set(x, y);
  }
  const ox = Math.round((FW - gw) / 2), oy = top - M;
  let out = `<path fill="${extrudeFill}" d="${gridD(extrude, ox, oy)}"/>`;
  out += `<path fill="${P.black}" d="${gridD(outline, ox, oy)}"/>`;

  // Colour cycling: each raster line of the logo is its own path whose fill
  // steps through the wash; offset delays make the colours pour downwards.
  // Two raster lines per colour and neighbouring colours one rung apart, so it
  // reads as a smooth wash, not flashing stripes.
  const ramp = wash.flatMap((c) => [c, c]);
  const n = ramp.length;
  css.push(`@keyframes ${cls}{${ramp.map((c, i) => `${+(i / n * 100).toFixed(3)}%{fill:${c}}`).join('')}100%{fill:${ramp[n - 1]}}}.${cls}{animation:${cls} ${(n * dt).toFixed(2)}s step-end infinite}`);
  for (let y = 0; y < hgt; y++) {
    const rects = gridRects((x, yy) => (yy === 0 ? g.get(x, M + y) : 0), gw, 1);
    if (!rects.length) continue;
    const k = y % n;
    out += `<path class="${cls}" style="animation-delay:-${(((n - k) % n) * dt).toFixed(2)}s" fill="${ramp[k]}" d="${rectsD(rects, ox, oy + M + y)}"/>`;
  }
  return { svg: out, x0: ox + M, x1: ox + gw - M };
}
const LOGO_U = logoWord('ULTRA', {
  ls: 6, lsy: 5, top: Y.ultra, dt: 0.07, extrudeFill: P.blue, cls: 'cu',
  wash: [P.white, P.white, P.cyan, P.cyan, P.cyan, P.lblue, P.lblue, P.cyan, P.cyan, P.cyan],
});
const LOGO_S = logoWord('SATISFACTORY', {
  ls: 4, lsy: 4, top: Y.satis, dt: 0.07, extrudeFill: P.brown, cls: 'cs',
  wash: [P.white, P.white, P.white, P.yellow, P.yellow, P.lgrey, P.yellow, P.yellow],
});

// ---------- the hex-cog emblem, one each side of ULTRA, cogs counter-rotating
// Redrawn from the app's own emblem: hexagon outline, a node on every corner,
// a dashed ring and a cog with a centre hole. Rotation is four pre-rendered
// frames per tooth (the VIC-II never rotated anything, it just swapped sprites).
const EMB = { w: 37, h: 41, R: 20 };
const hexInside = (dx, dy, R) => Math.abs(dx) <= R * Math.sqrt(3) / 2 && Math.abs(dy) <= R - Math.abs(dx) / Math.sqrt(3);
function polarGrid(w, h, test) {
  const g = new Grid(w, h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const dx = x + 0.5 - w / 2, dy = y + 0.5 - h / 2;
    if (test(Math.hypot(dx, dy), Math.atan2(dy, dx))) g.set(x, y);
  }
  return g;
}
const cogGrid = (w, h, { tip, body, hole, teeth, duty, phase }) => polarGrid(w, h, (r, th) => (
  r >= hole && (r <= body || (r <= tip && Math.cos(teeth * (th - phase)) > duty))));
const ringGrid = (w, h, { rad, half, dashes, duty, phase }) => polarGrid(w, h, (r, th) => (
  Math.abs(r - rad) <= half && Math.cos(dashes * (th - phase)) > duty));
{
  const base = new Canvas(EMB.w, EMB.h);
  for (let y = 0; y < EMB.h; y++) for (let x = 0; x < EMB.w; x++) {
    const dx = x + 0.5 - EMB.w / 2, dy = y + 0.5 - EMB.h / 2;
    if (hexInside(dx, dy, EMB.R)) base.px(x, y, hexInside(dx, dy, EMB.R - 2.4) ? 'black' : 'cyan');
  }
  for (let k = 0; k < 6; k++) {
    const a = (-90 + k * 60) * Math.PI / 180;
    const vx = Math.round(EMB.w / 2 + (EMB.R - 2) * Math.cos(a) - 1.5), vy = Math.round(EMB.h / 2 + (EMB.R - 2) * Math.sin(a) - 1.5);
    base.rect(vx, vy, 3, 3, 'white');
  }
  defs.push(`<g id="emb">${base.svg()}</g>`);
  const COG = { tip: 10.2, body: 7.4, hole: 3.1, teeth: 8, duty: 0.1 };
  const RING = { rad: 14.3, half: 0.8, dashes: 12, duty: -0.25 };
  for (let f = 0; f < 4; f++) {
    const cog = cogGrid(EMB.w, EMB.h, { ...COG, phase: f * (2 * Math.PI / COG.teeth) / 4 });
    const ring = ringGrid(EMB.w, EMB.h, { ...RING, phase: -f * (2 * Math.PI / RING.dashes) / 4 });
    defs.push(`<g id="cog${f}"><path fill="${P.lblue}" d="${gridD(ring)}"/><path fill="${P.yellow}" d="${gridD(cog)}"/></g>`);
  }
  loopFrames('cg', 4, 0.8);
  const cy = Y.ultra + 17 - Math.floor(EMB.h / 2);
  const gap = 12;
  [[LOGO_U.x0 - gap - EMB.w, false], [LOGO_U.x1 + gap, true]].forEach(([x, rev]) => {
    title += `<use href="#emb" x="${x}" y="${cy}"/>`;
    for (let f = 0; f < 4; f++) title += `<use class="cg${rev ? (4 - f) % 4 : f}" href="#cog${f}" x="${x}" y="${cy}"/>`;
  });
}
title += LOGO_U.svg + LOGO_S.svg;

// ---------- tagline
{
  const a = 'EVERY RECIPE & BUILDING, ', b = 'ONE CLICK APART';
  title += ctext([[a, P.cyan], [b, P.yellow]], centerX(a + b), Y.tagline);
}

// ---------- the three tabs and their panel: objective -> recipe -> building
// The pointer clicks a part in OBJECTIVES, lands on its recipe in ITEMS, clicks
// the machine and lands on it in BUILDINGS: "everything one click apart".
// Every number here is what the app shows for that screen (checked against
// ultra_satisfactory/data.py: get_item_recipe('Modular Frame'), list_buildings
// and get_building_produces for the Assembler). Re-check before editing them.
const PX0 = 20, PX1 = FW - 20;               // panel frame
const TXT0 = PX0 + 8;                        // text left edge
const COLS = (PX1 - PX0 - 16) / 8;           // 41 columns of text
const rowY = (i) => Y.panel + 4 + i * 9;
const TABS = [
  { label: 'OBJECTIVES', fill: P.purple, on: T.title, off: T.tabItems },
  { label: 'ITEMS', fill: P.lred, on: T.tabItems, off: T.tabBuild },
  { label: 'BUILDINGS', fill: P.lblue, on: T.tabBuild, off: T.end },
];
{
  const gapX = 6;
  const total = TABS.reduce((s, t) => s + len(t.label) * 8 + 10, 0) + gapX * (TABS.length - 1);
  let x = Math.round((FW - total) / 2);
  for (const t of TABS) { t.x = x; t.w = len(t.label) * 8 + 10; x += t.w + gapX; }
}
const lead = (name, qty) => [[name + ' ', P.white], ['.'.repeat(COLS - len(name) - len(qty) - 2), P.dgrey], [' ' + qty, P.yellow]];
const spread = (left, right) => {
  const used = [...left, ...right].reduce((s, [str]) => s + len(str), 0);
  if (used > COLS) throw new Error(`panel row too long: ${left.map((x) => x[0]).join('')}`);
  return [...left, [' '.repeat(COLS - used), P.black], ...right];
};
const PANELS = [
  { // OBJECTIVES: Space Elevator phase 2, as the app lists it
    rows: [
      spread([['// SPACE ELEVATOR - PHASE 2 //', P.yellow]], []),
      lead('AUTOMATED WIRING', 'X500'),
      lead('MODULAR FRAME', 'X500'),
      lead('SMART PLATING', 'X100'),
      lead('VERSATILE FRAMEWORK', 'X500'),
    ],
    click: 2,
  },
  { // ITEMS: the Modular Frame recipe card
    rows: [
      spread([['// ITEM DATABASE //', P.yellow]], [['MODULAR FRAME', P.white]]),
      spread([['IN   ', P.lred], [' 3 REINFORCED IRON PLATE', P.white]], [['3/MIN', P.yellow]]),
      spread([['IN   ', P.lred], ['12 IRON ROD', P.white]], [['12/MIN', P.yellow]]),
      spread([['VIA  ', P.lred], ['ASSEMBLER', P.cyan], ['  60 S CYCLE  15 MW', P.lgrey]], []),
      spread([['OUT  ', P.lred], [' 2 MODULAR FRAME', P.white]], [['2/MIN', P.yellow]]),
    ],
    click: 3,
  },
  { // BUILDINGS: the Assembler
    rows: [
      spread([['// BUILDINGS DATABASE //', P.yellow]], [['ASSEMBLER', P.white]]),
      spread([['PRODUCTION  *  TIER 2  *  15 MW', P.cyan]], []),
      spread([['MAKES 39 ITEMS: ', P.lblue], ['MODULAR FRAME, ROTOR,', P.white]], []),
      spread([['SMART PLATING, MOTOR, STATOR ...', P.white]], []),
      spread([['1 OF 9 MACHINES AMONG 477 BUILDINGS', P.lgrey]], []),
    ],
  },
];
const CLICK_LEAD = 0.85;                     // the row lights up this long before the tab flips
{
  // Resting tab labels, then one group per tab state on top.
  for (const t of TABS) title += text(t.label, t.x + 5, Y.tabs + 1, `fill="${t.fill}"`);
  TABS.forEach((t, i) => {
    const p = PANELS[i];
    let s = '';
    // frame, with the active tab sitting on it like a folder tab
    const fy = Y.panel, fh = rowY(5) + 2 - Y.panel;
    s += `<path fill="${t.fill}" d="M${PX0} ${fy}h${PX1 - PX0}v${fh}h${-(PX1 - PX0)}zM${PX0 + 1} ${fy + 1}v${fh - 2}h${PX1 - PX0 - 2}v${-(fh - 2)}z" fill-rule="evenodd"/>`;
    s += `<rect x="${t.x}" y="${Y.tabs}" width="${t.w}" height="10" fill="${t.fill}"/>`;
    s += text(t.label, t.x + 5, Y.tabs + 1, `fill="${P.white}"`);
    p.rows.forEach((segs, r) => { s += ctext(segs, TXT0, rowY(r)); });
    if (i === 0) {
      // phase pips: 2 of 5
      for (let k = 0; k < 5; k++) s += `<rect x="${PX1 - 8 - (5 - k) * 8 + 1}" y="${rowY(0) + 1}" width="6" height="6" fill="${k < 2 ? P.lgreen : P.dgrey}"/>`;
    }
    if (p.click !== undefined) {
      // the click: the row goes reverse-video until the next tab opens
      const str = p.rows[p.click].map((x) => x[0]).join('').trimEnd();
      let c = `<rect x="${TXT0 - 3}" y="${rowY(p.click) - 1}" width="${PX1 - PX0 - 10}" height="10" fill="${t.fill}"/>`;
      c += text(str, TXT0, rowY(p.click), `fill="${P.white}"`);
      s += `<g class="${win(t.off - CLICK_LEAD, t.off)} rmh">${c}</g>`;
    }
    title += `<g class="${win(t.on, t.off)}${i === 1 ? '' : ' rmh'}">${s}</g>`;
  });
}

// ---------- the factory floor: one belt, border to border, through an assembler
// 3 Reinforced Iron Plate + 12 Iron Rod in, 2 Modular Frame out. The belt keeps
// that ratio: a plate and four rods go in for every two-thirds of a frame.
const BY = Y.belt;
const MACH = { w: 96, up: 37 };              // up: how far it stands above the belt
MACH.x = (FW - MACH.w) / 2;
MACH.top = BY - MACH.up;
const MID = FW / 2;
{
  let s = '';
  // legs, then the belt itself with its tread sliding along
  const legs = [];
  for (let x = 16; x < FW; x += 44) { legs.push([x, BY + 6, 2, 5]); legs.push([x - 2, BY + 10, 6, 1]); }
  s += `<path fill="${P.dgrey}" d="${rectsD(legs)}"/>`;
  s += `<rect y="${BY}" width="${FW}" height="1" fill="${P.lgrey}"/><rect y="${BY + 1}" width="${FW}" height="4" fill="${P.dgrey}"/><rect y="${BY + 5}" width="${FW}" height="1" fill="${P.grey}"/>`;
  const ticks = [];
  for (let x = -8; x < FW; x += 8) ticks.push([x, BY + 1, 2, 4]);
  css.push('@keyframes tread{0%{transform:translateX(0)}100%{transform:translateX(8px)}}.tread{animation:tread .2s linear infinite}');
  s += `<path class="tread" fill="${P.black}" d="${rectsD(ticks)}"/>`;

  // items: original pixel art, not the game's icons
  const plate = sprite(`
    .LLLLLLLLLLLL.
    LWGGGGGGGGGGWD
    LGGGGGGGGGGGGD
    LGGGGGGGGGGGGD
    LGGGGGGGGGGGGD
    LWGGGGGGGGGGWD
    .DDDDDDDDDDDD.`, { L: 'lgrey', W: 'white', G: 'grey', D: 'dgrey' });
  const rod = sprite(`
    .WWWWWWWWWWWW.
    CCCCCCCCCCCCCC
    CCCCCCCCCCCCCC
    .BBBBBBBBBBBB.`, { W: 'white', C: 'cyan', B: 'lblue' });
  const FS = 14;
  const frame = new Canvas(FS, FS);
  for (let y = 0; y < FS; y++) for (let x = 0; x < FS; x++) {
    const edge = Math.min(x, y, FS - 1 - x, FS - 1 - y);
    if (edge === 0) frame.px(x, y, 'yellow');
    else if (edge === 1) frame.px(x, y, 'orange');
    else if (x === y || x === FS - 1 - y) frame.px(x, y, 'yellow');
    else if (x === y + 1 || x === FS - 2 - y) frame.px(x, y, 'orange');
  }
  defs.push(`<g id="iP">${plate.svg()}</g>`, `<g id="iR">${rod.svg()}</g>`, `<g id="iF">${frame.svg()}</g>`);

  const STEP = 18, IN_PERIOD = STEP * 5, OUT_PERIOD = IN_PERIOD * 3 / 2, SPEED = 40;
  let ins = '';
  for (let k = -5; k * STEP < MID; k++) {
    const isPlate = ((k % 5) + 5) % 5 === 0;
    ins += `<use href="#${isPlate ? 'iP' : 'iR'}" x="${k * STEP + 2}" y="${BY - (isPlate ? plate.h : rod.h)}"/>`;
  }
  let outs = '';
  for (let m = -1; m <= 1; m++) outs += `<use href="#iF" x="${MID - FS - m * OUT_PERIOD}" y="${BY - FS}"/>`;
  css.push(`@keyframes bin{0%{transform:translateX(0)}100%{transform:translateX(${IN_PERIOD}px)}}.bin{animation:bin ${IN_PERIOD / SPEED}s linear infinite}`);
  css.push(`@keyframes bout{0%{transform:translateX(0)}100%{transform:translateX(${OUT_PERIOD}px)}}.bout{animation:bout ${OUT_PERIOD / SPEED}s linear infinite}`);
  defs.push(`<clipPath id="cin"><rect width="${MID}" height="${FH}"/></clipPath>`, `<clipPath id="cout"><rect x="${MID}" width="${FW - MID}" height="${FH}"/></clipPath>`);
  // The resting transform puts a frame on the output belt in the still poster.
  s += `<g clip-path="url(#cin)"><g class="bin">${ins}</g></g>`;
  s += `<g clip-path="url(#cout)"><g class="bout" style="transform:translateX(96px)">${outs}</g></g>`;

  // the assembler
  const mx = MACH.x, my = MACH.top;
  // a gear poking out of the roof, turning (centred a line above the roof, so
  // a clean half of it and the top of its hub show)
  for (let f = 0; f < 4; f++) {
    const g = cogGrid(15, 15, { tip: 7.2, body: 5, hole: 1.8, teeth: 6, duty: 0.1, phase: f * (2 * Math.PI / 6) / 4 });
    s += `<path class="cg${f}" fill="${P.lgrey}" d="${gridD(g, mx + 12, my - 2)}"/>`;
  }
  const m = new Canvas(MACH.w, 48);
  m.rect(58, 3, 12, 3, 'dgrey'); m.rect(59, 2, 10, 1, 'grey');         // exhaust box
  m.rect(80, 1, 1, 5, 'lgrey');                                        // antenna
  m.rect(4, 6, 88, 39, 'grey');                                        // body
  m.rect(4, 6, 88, 1, 'lgrey'); m.rect(4, 6, 1, 39, 'lgrey');
  m.rect(4, 44, 88, 1, 'dgrey'); m.rect(91, 7, 1, 38, 'dgrey');
  m.rect(7, 8, 82, 10, 'orange');                                      // name plate
  m.rect(7, 8, 82, 1, 'lred'); m.rect(7, 17, 82, 1, 'brown');
  for (const px0 of [0, 88]) { m.rect(px0, 20, 8, 2, 'dgrey'); m.rect(px0, 22, 8, 15, 'black'); }   // belt ports
  m.rect(27, 19, 42, 19, 'lblue'); m.rect(28, 20, 40, 17, 'black');    // window
  m.rect(32, 35, 32, 2, 'dgrey');                                      // anvil
  m.rect(38, 33, 20, 2, 'orange'); m.rect(38, 32, 20, 1, 'yellow');    // the work piece
  for (let y = 21; y <= 33; y += 3) { m.rect(11, y, 13, 1, 'dgrey'); m.rect(11, y + 1, 13, 1, 'lgrey'); }
  m.rect(72, 20, 13, 17, 'dgrey');                                     // control panel
  m.rect(74, 22, 2, 2, 'lgreen'); m.rect(78, 22, 2, 2, 'red');
  [[74, 4], [76, 6], [78, 3], [80, 5], [82, 2]].forEach(([x, h]) => m.rect(x, 35 - h, 1, h, 'cyan'));
  for (let y = 39; y < 44; y++) for (let x = 5; x < 91; x++) m.px(x, y, ((x + y) >> 2) % 2 ? 'yellow' : 'black');
  m.rect(9, 45, 8, 3, 'dgrey'); m.rect(79, 45, 8, 3, 'dgrey');         // feet
  s += m.svg(mx, my);
  s += text('ASSEMBLER', mx + 12, my + 9, `fill="${P.yellow}"`);

  // two presses stamping in turn behind the window, a spark on each hit;
  // two stamps per frame that rolls out
  const PRESS = OUT_PERIOD / SPEED / 2;
  defs.push(`<clipPath id="cwin"><rect x="${mx + 28}" y="${my + 20}" width="40" height="17"/></clipPath>`);
  css.push(`@keyframes press{0%,18%{transform:translateY(0)}30%,40%{transform:translateY(5px)}62%,100%{transform:translateY(0)}}.press{animation:press ${PRESS}s ease-in-out infinite}`);
  css.push(`@keyframes spark{0%{opacity:0}30%{opacity:1}39%{opacity:0}100%{opacity:0}}.spark{animation:spark ${PRESS}s step-end infinite;opacity:0}`);
  css.push('@keyframes lamp{0%{opacity:1}50%{opacity:0}100%{opacity:0}}.lamp{animation:lamp 1s step-end infinite}');
  let inner = '';
  [[36, 0], [52, PRESS / 2]].forEach(([x, delay]) => {
    const d = `M${mx + x + 3} ${my + 10}h2v16h-2zM${mx + x} ${my + 25}h8v2h-8z`;
    inner += `<path class="press" style="animation-delay:-${delay.toFixed(3)}s" fill="${P.lgrey}" d="${d}"/>`;
    const sp = [[x - 3, 30], [x + 10, 29], [x - 2, 27], [x + 9, 31], [x - 4, 33]].map(([sx, sy]) => `M${mx + sx} ${my + sy}h1v1h-1z`).join('');
    inner += `<path class="spark" style="animation-delay:-${delay.toFixed(3)}s" fill="${P.white}" d="${sp}"/>`;
  });
  s += `<g clip-path="url(#cwin)">${inner}</g>`;
  s += `<rect class="lamp" x="${mx + 79}" y="${my}" width="3" height="2" fill="${P.lred}"/>`;
  s += `<rect class="lamp" style="animation-delay:-.5s" x="${mx + 82}" y="${my + 22}" width="2" height="2" fill="${P.yellow}"/>`;

  // BUILDINGS tab: selection brackets snap round the machine it is describing
  {
    const x0 = mx - 5, x1 = mx + MACH.w + 5, y0 = my - 1, y1 = BY + 12, L = 6;
    const d = `M${x0} ${y0}h${L}v1h${-(L - 1)}v${L - 1}h-1zM${x1} ${y0}v${L}h-1v${-(L - 1)}h${-(L - 1)}v-1z`
      + `M${x0} ${y1}v${-L}h1v${L - 1}h${L - 1}v1zM${x1} ${y1}h${-L}v-1h${L - 1}v${-(L - 1)}h1z`;
    s += `<path class="${win(T.tabBuild, T.end)} rmh" fill="${P.lblue}" d="${d}"/>`;
  }

  // the deadpan throughput report
  s += ctext([['INPUT ', P.grey], ['15/MIN', P.lgrey]], 20, BY - 34);
  const o = 'OUTPUT 2/MIN';
  s += ctext([['OUTPUT ', P.grey], ['2/MIN', P.yellow]], FW - 20 - len(o) * 8, BY - 34);
  title += s;
}

// ---------- SID tune panel with VU meters
const PANEL_Y = Y.sid;
const VU = { seg: 3, n: 8, w: 5, gap: 2 };
const vuX = (v) => 44 * 8 - 23 + v * (VU.w + VU.gap);
const vuTop = PANEL_Y + 11;
{
  const c0 = 3, c1 = 44;                 // box columns on the 48-column frame grid
  const inner = c1 - c0 - 1;
  const px = (c) => c * 8;
  const ROW = (i) => PANEL_Y + 10 + i * 9;
  const BOT = PANEL_Y + 37;
  const LEFT = '┌─ ♪ NOW PLAYING ', RIGHT = ' 6581 SID ─┐';
  const top = `${LEFT}${'─'.repeat(inner + 2 - len(LEFT) - len(RIGHT))}${RIGHT}`;
  if (len(top) !== inner + 2) throw new Error('panel top border is the wrong width');
  const bot = `└${'─'.repeat(inner)}┘`;
  let s = '';
  s += text(top, px(c0), PANEL_Y);
  s += text(bot, px(c0), BOT);
  s += `<rect x="${px(c0) + 3}" y="${PANEL_Y + 8}" width="2" height="${BOT - PANEL_Y - 8}"/><rect x="${px(c1) + 3}" y="${PANEL_Y + 8}" width="2" height="${BOT - PANEL_Y - 8}"/>`;
  s = `<g fill="${P.lblue}">${s}</g>`;
  const info = [
    ['TITLE   : ', 'JUST ONE MORE BELT', P.white],
    ['AUTHOR  : ', 'DJ SPLITTER & MC MERGER', P.lgreen],
    ['RELEASED: ', '2026 MANIFOLD DESTINY', P.yellow],
  ];
  info.forEach(([k, v, c], i) => { s += ctext([[k, P.grey], [v, c]], px(c0 + 2), ROW(i)); });

  // Playing time in the bottom border, counting up while the tune plays.
  const secs = Math.floor(T.end - T.title);
  for (let k = 0; k <= secs; k++) {
    const on = T.title + k, off = Math.min(T.title + k + 1, T.end);
    const str = ` 00:0${k} `;
    s += `<g class="${win(on, off)}${k ? ' rmh' : ''}"><rect x="${px(c0 + 2)}" y="${BOT}" width="${str.length * 8}" height="8" fill="${P.black}"/>${text(str, px(c0 + 2), BOT, `fill="${P.lgrey}"`)}</g>`;
  }

  // VU meters: lit LEDs underneath, an "unlit" cover that slides up on the beat.
  const segColour = (i) => (i < 4 ? P.green : i < 6 ? P.lgreen : i < 7 ? P.yellow : P.lred);
  for (let v = 0; v < 3; v++) {
    const x = vuX(v), base = vuTop + VU.seg * VU.n;
    let lit = '', unlit = '';
    for (let i = 0; i < VU.n; i++) {
      const y = base - (i + 1) * VU.seg;
      lit += `<rect x="${x}" y="${y}" width="${VU.w}" height="2" fill="${segColour(i)}"/>`;
      unlit += `<rect x="${x}" y="${y}" width="${VU.w}" height="2"/>`;
    }
    const steps = [];
    for (let k = 0; k < 16; k++) {
      const onBeat = k % 4 === 0 ? 1 : k % 2 === 0 ? 0.7 : 0.45;
      const level = Math.max(1, Math.min(VU.n, Math.round(VU.n * onBeat * (0.55 + rand() * 0.45) + (v === 0 && k % 4 === 0 ? 1 : 0))));
      steps.push(`${k * 6.25}%{transform:translateY(-${level * VU.seg}px)}`);
    }
    css.push(`@keyframes vu${v}{${steps.join('')}100%{transform:translateY(-${VU.seg * 3}px)}}.vu${v}{animation:vu${v} 2s step-end infinite;transform:translateY(-${VU.seg * (6 - v * 2)}px)}`);
    defs.push(`<clipPath id="vuclip${v}"><rect x="${x}" y="${vuTop}" width="${VU.w}" height="${VU.seg * VU.n}"/></clipPath>`);
    s += `<g clip-path="url(#vuclip${v})">${lit}<g class="vu${v}"><rect x="${x}" y="${vuTop}" width="${VU.w}" height="${VU.seg * VU.n}" fill="${P.black}"/><g fill="${P.dgrey}">${unlit}</g></g></g>`;
  }
  title += s;
}

// ---------- sine scroller (continuous; you catch a different bit every loop)
// It is phased so that the first time the title screen appears the closing gag
// is on screen and the name and pitch are just rolling in from the right.
const SCROLL_TEXT = ('    ULTRA-SATISFACTORY  *  EVERY RECIPE, BUILDING AND SPACE ELEVATOR OBJECTIVE, ONE CLICK APART  *  '
  + '140 ITEMS, 211 RECIPES (88 OF THEM ALTERNATES), 477 BUILDINGS, 5 PHASES, 0 EXCUSES  *  '
  + "IT IS 3 A.M. AND YOU HAVE ALT-TABBED OUT TO CHECK WHAT GOES IN A MODULAR FRAME. IT'S 3 REINFORCED IRON PLATE AND 12 IRON ROD. GO BACK TO WORK  *  "
  + 'JUST ONE MORE BELT  *  SPAGHETTI IS A LOAD-BEARING ARCHITECTURE  *  '
  + 'RUNS ON THE SECOND MONITOR, THE PHONE, OR STRAIGHT IN THE BROWSER WITH NOTHING TO INSTALL  *  '
  + 'PROTECTION: NONE, IT IS APACHE 2.0  *  UNOFFICIAL FAN PROJECT, NOT AFFILIATED WITH COFFEE STAIN STUDIOS  *  '
  + 'GREETZ TO EVERY PIONEER WHOSE TEMPORARY FACTORY IS NOW PERMANENT  *  '
  + 'EFFICIENCY IS MANDATORY. SLEEP IS AN ALTERNATE RECIPE  *  ').toUpperCase();
{
  const chars = [...SCROLL_TEXT];
  const tw = chars.length * 8;
  const speed = 64;                      // units per second
  // Characters that share a wave phase share a group: 16 phases in all.
  const PHASES = 16, WAVE = 1.2;
  const groups = Array.from({ length: PHASES }, () => '');
  chars.forEach((ch, i) => {
    if (ch === ' ') return;
    if (!FONT[ch]) throw new Error(`no glyph for "${ch}"`);
    usedGlyphs.add(ch);
    groups[i % PHASES] += `<use href="#${gid(ch)}" x="${i * 8}"/>`;
  });
  const s = groups.map((g, k) => `<g class="w" style="animation-delay:-${(k * WAVE / PHASES).toFixed(3)}s">${g}</g>`).join('');
  css.push(`@keyframes wave{0%{transform:translateY(-1.5px)}100%{transform:translateY(1.5px)}}.w{animation:wave ${WAVE / 2}s ease-in-out infinite alternate}`);
  const lead = (tw - FW) / speed - T.title;   // seconds into the loop at t = 0
  if (!(lead > 0)) throw new Error('scroller: the text is too short to phase against the title screen');
  css.push(`@keyframes scr{0%{transform:translateX(0)}100%{transform:translateX(-${tw}px)}}.scr{animation:scr ${+(tw / speed).toFixed(3)}s linear -${+lead.toFixed(3)}s infinite}`);
  title += `<g class="scrollwrap"><g transform="translate(0 ${Y.scroll}) scale(1 2)" fill="url(#scrollgrad)"><g class="scr"><g id="scrolltext">${s}</g><use href="#scrolltext" x="${tw}"/></g></g></g>`;
  // Reduced motion: a still line in its place.
  const still = 'UNOFFICIAL FAN PROJECT  *  APACHE 2.0';
  title += `<g class="rmo"><g transform="translate(${centerX(still)} ${Y.scroll}) scale(1 2)" fill="url(#scrollgrad)">${text(still, 0, 0)}</g></g>`;
}

// ---------- the pointer: a GEOS-flavoured arrow that does the clicking
{
  const arrow = sprite(`
    K........
    KK.......
    KWK......
    KWWK.....
    KWWWK....
    KWWWWK...
    KWWWWWK..
    KWWWWWWK.
    KWWWWKKKK
    KWKWWK...
    KK.KWWK..
    ....KWWK.
    .....KK..`, { K: 'black', W: 'white' });
  // Targets, and two resting spots in empty panel space so it never sits on the copy.
  const tab = [TABS[0].x + TABS[0].w - 7, Y.tabs + 6];
  const part = [TXT0 + 15 * 8, rowY(PANELS[0].click) + 3];
  const restI = [TXT0 + 33 * 8 + 3, rowY(3) + 1];
  const mach = [TXT0 + 12 * 8, rowY(PANELS[1].click) + 3];
  const restB = [TXT0 + 37 * 8, rowY(3) + 2];
  const pts = [
    [0, tab], [T.title + 0.5, tab], [T.title + 1.4, part],
    [T.tabItems + 0.2, part], [T.tabItems + 0.9, restI], [T.tabItems + 1.5, restI], [T.tabItems + 2.2, mach],
    [T.tabBuild + 0.2, mach], [T.tabBuild + 0.9, restB], [T.tabBuild + 2.2, restB], [T.tabBuild + 3.0, tab],
  ];
  const kf = pts.map(([t, [x, y]]) => `${pct(t)}{transform:translate(${x}px,${y}px)}`).join('') + `100%{transform:translate(${tab[0]}px,${tab[1]}px)}`;
  css.push(`@keyframes ptr{${kf}}.ptr{animation:ptr ${CYCLE}s ease-in-out infinite}`);
  title += `<g class="ptr rmn">${arrow.svg()}</g>`;
}

// ================================================================= ASSEMBLY
// Scene switches. Create every track before the stylesheet is joined below.
const TITLE_WIN = win(T.title, T.end);
const BOOT_WIN = win(0, T.title);

const glyphDefs = [];
for (const ch of [...usedGlyphs].sort()) {
  const rows = FONT[ch];
  glyphDefs.push(`<path id="${gid(ch)}" d="${rectsD(gridRects((x, y) => rows[y][x] === '#', 8, 8))}"/>`);
}
defs.unshift(...glyphDefs);
defs.push(`<linearGradient id="scrollgrad" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="8">${
  [P.white, P.yellow, P.yellow, P.lgreen, P.lgreen, P.cyan, P.cyan, P.lblue].map((c, i) => `<stop offset="${i / 8}" stop-color="${c}"/><stop offset="${(i + 1) / 8}" stop-color="${c}"/>`).join('')}</linearGradient>`);
defs.push(`<clipPath id="scr"><rect width="${FW}" height="${FH}" rx="7" shape-rendering="geometricPrecision"/></clipPath>`);
defs.push('<radialGradient id="vig" cx="50%" cy="50%" r="75%"><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".5"/></radialGradient>');
defs.push('<linearGradient id="glare" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".08"/><stop offset=".35" stop-color="#fff" stop-opacity="0"/></linearGradient>');
defs.push('<pattern id="scan" width="4" height="1" patternUnits="userSpaceOnUse"><rect y=".5" width="4" height=".5" fill="#000" opacity=".16"/></pattern>');

// The monitor's chin: a badge and a power LED.
const BADGE = 'SPAGHETTIVISION 64';
const chin = text(BADGE, BEZ + 6, BEZ + FH + 4, 'fill="#3d3d4a"');

const baseCss = [
  '.boot{opacity:0}.rmh{opacity:0}.rmo{display:none}',
  ...css,
  '@media (prefers-reduced-motion:reduce){*{animation:none!important}.rmo{display:inline}.scrollwrap,.rmn{display:none}}',
].join('\n');

const desc = `A Commodore 64 boots to READY., types LOAD"${NAME}",8,1, searches, and loads with gentle turbo `
  + 'stripes rolling in the border while it lists what comes off the disk: 140 items, 211 recipes, 477 buildings, '
  + '5 phases. It types RUN and flips to a demoscene intro screen: "Manifold Destiny presents" the ULTRA SATISFACTORY '
  + 'logo, colour-cycling between two hexagon emblems with turning cogs, and the line "Every recipe and building, one '
  + 'click apart". A pointer clicks through the three tabs: OBJECTIVES (Space Elevator phase 2 needs Modular Frame '
  + 'x500), ITEMS (Modular Frame: 3 Reinforced Iron Plate and 12 Iron Rod in an Assembler, 60 second cycle, 15 MW, '
  + '2 per minute out) and BUILDINGS (the Assembler, one of 477). Below, a conveyor belt feeds plates and rods into '
  + 'a stamping assembler and Modular Frames roll out the other side; a SID panel plays "Just One More Belt" by '
  + 'DJ Splitter and MC Merger, and a sine scroller runs along the bottom.';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W * 2}" height="${H * 2}" shape-rendering="crispEdges" role="img" aria-labelledby="ttl dsc">
<title id="ttl">ULTRA-SATISFACTORY, loading on a Commodore 64</title>
<desc id="dsc">${desc.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')}</desc>
<style>
${baseCss}
</style>
<defs>
${defs.join('\n')}
</defs>
<g shape-rendering="geometricPrecision">
<rect width="${W}" height="${H}" rx="16" fill="#1a1a21"/>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="15.5" fill="none" stroke="#34343f"/>
<rect x="${BEZ - 3}" y="${BEZ - 3}" width="${FW + 6}" height="${FH + 6}" rx="10" fill="#07070a"/>
<circle cx="${W - 18}" cy="${BEZ + FH + 8}" r="1.6" fill="#d23b2c"/>
</g>
${chin}
<g transform="translate(${BEZ} ${BEZ})" clip-path="url(#scr)">
<rect width="${FW}" height="${FH}" fill="${P.black}"/>
<g class="${TITLE_WIN}">
${title}
</g>
<g class="boot ${BOOT_WIN}">
${boot}
</g>
<g shape-rendering="auto" pointer-events="none">
<rect width="${FW}" height="${FH}" fill="url(#scan)"/>
<rect width="${FW}" height="${FH}" fill="url(#vig)"/>
<rect width="${FW}" height="${FH}" fill="url(#glare)"/>
</g>
</g>
</svg>
`;

// ---------------------------------------------------------------- NFO logo
// Text rendering of ULTRA for the README's NFO block. Each font pixel is two
// full-block columns and one line, which makes square pixels in a monospace
// cell; GitHub's 1.45 line-height leaves a gap under every row that reads as
// raster lines. Rows lean one column per two rows for the italic, and a
// light-shade copy one pixel down-right is the drop shadow.
function nfoWord(word, indent) {
  const GAP = 2;                          // columns between letters
  const cols = Array.from({ length: 7 }, () => new Set());
  let cx = 0;
  for (const ch of word) {
    const rows = FONT[ch];
    let a = 8, b = -1;
    rows.forEach((r) => [...r].forEach((p, x) => { if (p === '#') { a = Math.min(a, x); b = Math.max(b, x); } }));
    for (let y = 0; y < 7; y++) for (let x = a; x <= b; x++) {
      if (rows[y][x] === '#') { cols[y].add(cx + (x - a) * 2); cols[y].add(cx + (x - a) * 2 + 1); }
    }
    cx += (b - a + 1) * 2 + GAP;
  }
  const lean = (y) => Math.round((6 - y) / 2);
  const ink = (x, y) => y >= 0 && y < 7 && cols[y].has(x - lean(y));
  const out = [];
  for (let y = 0; y < 8; y++) {
    let line = ' '.repeat(indent);
    for (let x = 0; x < cx + 6; x++) line += ink(x, y) ? '█' : ink(x - 2, y - 1) ? '░' : ' ';
    out.push(line.trimEnd());
  }
  return out;
}
function nfoLogo() {
  const lines = nfoWord('ULTRA', 4);
  const widest = Math.max(...lines.map((l) => [...l].length));
  if (widest > 80) throw new Error(`NFO logo is ${widest} columns; keep it within 80`);
  return lines.join('\n');
}

if (process.argv.includes('--nfo')) {
  console.log(nfoLogo());
} else {
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, svg);
  console.log(`wrote ${path.relative(process.cwd(), OUT)} (${(Buffer.byteLength(svg) / 1024).toFixed(1)} KB, ${tracks.size} timeline tracks)`);
}
