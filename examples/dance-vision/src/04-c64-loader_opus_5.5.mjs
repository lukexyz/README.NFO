#!/usr/bin/env node
// 04-c64-loader_opus_5.5: the "C64 SID Loader" README header for Dance Vision.
//
// A Commodore 64 boots, LOADs Dance Vision off the disk drive with turbo
// stripes rolling in the border, types RUN, then flips to a cracktro title
// screen: colour-cycling logo, a synced stick-figure crew on a light-up floor,
// a spotlight countdown, a SID tune panel with VU meters and a sine scroller.
//
// Everything is drawn from the 8x8 bitmap font and joint-based sprites defined
// in this file (no <text>, no fonts, nothing external), and the whole show is
// CSS step animation on one 14 s cycle, so it runs inside GitHub's <img>.
//
//   node examples/dance-vision/src/04-c64-loader_opus_5.5.mjs         regenerate the SVG
//   node examples/dance-vision/src/04-c64-loader_opus_5.5.mjs --nfo   print the block-letter NFO logo
//
// Plain Node, no dependencies. Randomness is a seeded PRNG, so output is stable.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, '..', 'assets', '04-c64-loader_opus_5.5.svg');

// ---------------------------------------------------------------- palette
// The "Pepto" PAL palette: what most people remember a C64 looking like.
const P = {
  black: '#000000', white: '#ffffff', red: '#68372b', cyan: '#70a4b2',
  purple: '#6f3d86', green: '#588d43', blue: '#352879', yellow: '#b8c76f',
  orange: '#6f4f25', brown: '#433900', lred: '#9a6759', dgrey: '#444444',
  grey: '#6c6c6c', lgreen: '#9ad284', lblue: '#6c5eb5', lgrey: '#959595',
};

// ---------------------------------------------------------------- geometry
// One unit = one C64 pixel. The frame is a PAL picture with the border trimmed
// a little; the 320x200 text screen sits inside it. A thin CRT bezel wraps it.
const FW = 384, FH = 256;          // frame, border included
const SX = 32, SY = 28;            // 40x25 text screen origin inside the frame
const BEZ = 8;                     // bezel thickness
const W = FW + BEZ * 2, H = FH + BEZ * 2;
const col = (c) => SX + c * 8;
const row = (r) => SY + r * 8;

// ---------------------------------------------------------------- timeline (seconds)
// Scene changes land on the dancers' 2 s bar (120 BPM), so the crew never
// switches routine mid-move.
const CYCLE = 14;
const T = {
  type0: 0.66, typeDt: 0.055,      // LOAD"DANCE VISION",8,1 typed out
  ret1: 1.95, search: 2.1,         // RETURN, SEARCHING FOR ...
  loading: 2.45, loaded: 4.5,      // LOADING + turbo stripes in the border
  run0: 4.8, runDt: 0.09,          // READY. then RUN typed
  ret2: 5.2,                       // RETURN: screen clears
  title: 5.5,                      // cracktro title screen
  count: 6.5,                      // spotlight countdown 3, 2, 1
  spot: 8.0,                       // spotlight on YOU: spin, crew cheers
  party: 12.0,                     // everybody, arms up
  end: 13.85,                      // blank for a beat, then the machine "resets"
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
const rand = mulberry32(0x1541);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];

// ---------------------------------------------------------------- 8x8 font
// A C64-style charset drawn for this file: 2-pixel verticals, 1-pixel
// horizontals, column 0 and row 7 left clear for spacing. Box pieces are
// PETSCII-style lines through the middle of the cell.
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
  for (const [str, fill] of segs) { out += text(str, cx, y, `fill="${fill}"`); cx += [...str].length * 8; }
  return out;
}
const centerX = (str, width = FW, scale = 1) => Math.round((width - [...str].length * 8 * scale) / 2);

// ---------------------------------------------------------------- CSS timeline
// Every show/hide is a step-end track over the one 14 s cycle. Tracks with the
// same keyframes are shared. Base (non-animated) styles are the reduced-motion
// poster: the title screen, standing still.
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

// ================================================================= BOOT SCREEN
let boot = '';
boot += `<rect width="${FW}" height="${FH}" fill="${P.lblue}"/>`;

// Turbo-loader stripes. Every colour sits within ~0.09 relative luminance of
// its neighbours (light blue, purple, red, orange, dark grey, grey), so the
// rolling bands read as "loading" without being a photosensitive flash.
{
  const STRIPE_SET = [P.lblue, P.purple, P.red, P.orange, P.dgrey, P.grey, P.lblue, P.purple];
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
  css.push(`@keyframes roll{0%{transform:translateY(0)}100%{transform:translateY(-${PERIOD}px)}}.roll{animation:roll .8s linear infinite}`);
  boot += `<g class="${win(T.loading, T.loaded)}"><g class="roll">${s}</g></g>`;
}
boot += `<rect x="${SX}" y="${SY}" width="320" height="200" fill="${P.blue}"/>`;

{
  let s = '';
  // RUN clears the screen, banner and all.
  s += `<g class="${win(0, T.ret2)}">`;
  s += text('    **** COMMODORE 64 BASIC V2 ****', col(0), row(1));
  s += text(' 64K RAM SYSTEM  38911 BASIC BYTES FREE', col(0), row(3));
  s += text('READY.', col(0), row(5));
  s += '</g>';

  const cmd = 'LOAD"DANCE VISION",8,1';
  const typedAt = [...cmd].map((_, i) => +(T.type0 + i * T.typeDt).toFixed(3));
  [...cmd].forEach((ch, i) => { s += `<g class="${win(typedAt[i], T.ret2)}">${text(ch, col(i), row(6))}</g>`; });
  s += `<g class="${win(T.search, T.ret2)}">${text('SEARCHING FOR DANCE VISION', col(0), row(8))}</g>`;
  s += `<g class="${win(T.loading, T.ret2)}">${text('LOADING', col(0), row(9))}</g>`;
  s += `<g class="${win(T.loaded, T.ret2)}">${text('READY.', col(0), row(10))}</g>`;
  const runAt = [0, 1, 2].map((i) => +(T.run0 + i * T.runDt).toFixed(3));
  [...'RUN'].forEach((ch, i) => { s += `<g class="${win(runAt[i], T.ret2)}">${text(ch, col(i), row(11))}</g>`; });

  // The cursor: blinks while idle, rides along while typing, vanishes while loading.
  const cursor = (c, r, cls) => `<rect class="${cls}" x="${col(c)}" y="${row(r)}" width="8" height="8"/>`;
  // One blink (on 0.33 s, off 0.33 s) and then the first key lands.
  s += cursor(0, 6, track('opacity', [[0, 1], [0.33, 0]]));
  typedAt.forEach((t, i) => { s += cursor(i + 1, 6, win(t, typedAt[i + 1] ?? T.ret1)); });
  s += cursor(0, 11, track('opacity', [[0, 0], [T.loaded, 1], [T.loaded + 0.25, 0]]));
  runAt.forEach((t, i) => { s += cursor(i + 1, 11, win(t, runAt[i + 1] ?? T.ret2)); });

  boot += `<g fill="${P.lblue}">${s}</g>`;
}

// ================================================================= TITLE SCREEN
let title = '';

// ---------- raster bars (behind the logo, border to border)
// Kept a notch dimmer than the logo so the name still pops through them.
{
  const RAMPS = [
    [P.blue, P.purple, P.lblue, P.cyan, P.lblue, P.purple, P.blue],
    [P.brown, P.red, P.orange, P.lred, P.orange, P.red, P.brown],
    [P.dgrey, P.green, P.grey, P.lgreen, P.grey, P.green, P.dgrey],
  ];
  css.push('@keyframes bar{0%{transform:translateY(0)}100%{transform:translateY(30px)}}.bar{animation:bar 1.5s ease-in-out infinite alternate}');
  RAMPS.forEach((ramp, i) => {
    const rects = ramp.map((c, k) => `<rect y="${16 + k}" width="${FW}" height="1" fill="${c}"/>`).join('');
    // transform here is only the reduced-motion resting place; the animation overrides it.
    title += `<g class="bar" style="animation-delay:-${(i * 0.4).toFixed(2)}s;transform:translateY(${4 + i * 11}px)">${rects}</g>`;
  });
}

// ---------- header
{
  const s = 'HACKNEY 1541 MASSIVE PRESENTS';
  title += text(s, centerX(s), 5, `fill="${P.lgrey}"`);
}

// ---------- the logo: italic, outlined, drop-shadowed, colour-cycled per raster line
const LOGO = 'DANCE VISION';
const LS = 4;             // units per font pixel, across
const LSY = 5;            // ...and down: taller, condensed, more logo than text
const LOGO_Y = 20;
function logoLayout() {
  const placed = [];
  let cx = 0;
  for (const ch of LOGO) {
    if (ch === ' ') { cx += 3; continue; }
    const rows = FONT[ch];
    let a = 8, b = -1;
    rows.forEach((r) => [...r].forEach((p, x) => { if (p === '#') { a = Math.min(a, x); b = Math.max(b, x); } }));
    placed.push({ ch, x: cx - a });
    cx += b - a + 2;
  }
  return { placed, width: cx - 1 };
}
{
  const { placed, width } = logoLayout();
  const slant = (gy) => 6 - gy;        // one unit right per font row, going up
  const M = 4;                          // margin for outline and shadow
  const gw = width * LS + 6 + M * 2, gh = 7 * LSY + M * 2;
  const g = new Grid(gw, gh);
  for (const { ch, x } of placed) {
    FONT[ch].forEach((r, gy) => [...r].forEach((p, gx) => {
      if (p !== '#') return;
      for (let dy = 0; dy < LSY; dy++) for (let dx = 0; dx < LS; dx++) g.set(M + (x + gx) * LS + slant(gy) + dx, M + gy * LSY + dy);
    }));
  }
  const dilate = (src) => {
    const out = new Grid(gw, gh);
    for (let y = 0; y < gh; y++) for (let x = 0; x < gw; x++) {
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (src.get(x + dx, y + dy)) out.set(x, y);
    }
    return out;
  };
  const outline = dilate(g);
  // A solid extrusion (the shape stepped down-right twice) reads as depth
  // without flooding the letter counters the way a flat offset shadow does.
  const extrude = new Grid(gw, gh);
  for (let y = 0; y < gh; y++) for (let x = 0; x < gw; x++) {
    if (outline.get(x - 1, y - 1) || outline.get(x - 2, y - 2)) extrude.set(x, y);
  }
  const ox = Math.round((FW - gw) / 2), oy = LOGO_Y - M;
  title += `<path fill="${P.blue}" d="${gridD(extrude, ox, oy)}"/>`;
  title += `<path fill="${P.black}" d="${gridD(outline, ox, oy)}"/>`;

  // Colour cycling: each raster line of the logo is its own path whose fill
  // steps through the ramp; offset delays make the colours pour downwards.
  // The ramp walks down the VIC-II luma ladder and back up again (white, light
  // green, yellow, light grey, cyan, light red and back), two raster lines per
  // colour, so neighbouring bands step only one rung in brightness: it reads
  // as a smooth wash, not flashing stripes. Bright rungs only, so the letters
  // never sink into the black outline or the blue extrusion.
  const WASH = [P.white, P.lgreen, P.yellow, P.lgrey, P.cyan, P.lred, P.cyan, P.lgrey, P.yellow, P.lgreen];
  const RAMP = WASH.flatMap((c) => [c, c]);
  const n = RAMP.length, dt = 0.065;
  css.push(`@keyframes cyc{${RAMP.map((c, i) => `${+(i / n * 100).toFixed(3)}%{fill:${c}}`).join('')}100%{fill:${RAMP[n - 1]}}}.cyc{animation:cyc ${(n * dt).toFixed(2)}s step-end infinite}`);
  for (let y = 0; y < 7 * LSY; y++) {
    const band = new Grid(gw, gh);
    for (let x = 0; x < gw; x++) if (g.get(x, M + y)) band.set(x, M + y);
    const d = gridD(band, ox, oy);
    if (!d) continue;
    const k = y % n;
    title += `<path class="cyc" style="animation-delay:-${(((n - k) % n) * dt).toFixed(2)}s" fill="${RAMP[k]}" d="${d}"/>`;
  }
}

// ---------- tagline
title += ctext([
  ['PHONE', P.yellow], [' = MOCAP RIG  ', P.cyan], ['*', P.lred], ['  ', P.cyan], ['TELLY', P.yellow], [' = DANCE FLOOR', P.cyan],
], centerX('PHONE = MOCAP RIG  *  TELLY = DANCE FLOOR'), 62);

// ---------- dancers: joint skeletons rasterised with a 2x2 brush (24x42 sprites)
const SPR_W = 24, SPR_H = 42;
const POSES = {
  up:    { h: [12, 5], l: [[[11, 9], [11, 23]], [[2, 2], [6, 7], [11, 11], [16, 7], [20, 2]], [[4, 39], [7, 31], [11, 23], [15, 31], [18, 39]]] },
  rup:   { h: [12, 5], l: [[[11, 9], [11, 23]], [[9, 21], [6, 16], [11, 11], [16, 7], [20, 2]], [[6, 39], [8, 31], [11, 23], [14, 31], [16, 39]]] },
  disco: { h: [12, 5], l: [[[11, 9], [11, 23]], [[3, 19], [7, 15], [11, 11], [16, 6], [21, 1]], [[7, 39], [8, 31], [11, 23], [15, 30], [17, 39]]] },
  squat: { h: [12, 9], l: [[[11, 13], [11, 26]], [[0, 12], [5, 15], [11, 15], [17, 15], [22, 12]], [[5, 39], [4, 32], [11, 26], [18, 32], [17, 39]]] },
  cheer: { h: [12, 5], l: [[[11, 9], [11, 23]], [[5, 1], [4, 8], [11, 11], [18, 8], [17, 1]], [[5, 39], [7, 31], [11, 23], [15, 31], [17, 39]]] },
  run:   { h: [12, 5], l: [[[11, 9], [11, 23]], [[5, 13], [8, 18], [11, 11], [15, 17], [18, 21]], [[10, 39], [10, 31], [11, 23], [16, 28], [15, 35]]] },
  spin:  { h: [12, 5], l: [[[11, 9], [11, 23]], [[13, 20], [15, 15], [11, 11], [7, 15], [9, 20]], [[11, 39], [11, 31], [11, 23], [15, 28], [12, 31]]] },
};
const mirrorPose = (p) => ({ h: [SPR_W - p.h[0], p.h[1]], l: p.l.map((pl) => pl.map(([x, y]) => [SPR_W - 2 - x, y])) });
for (const k of Object.keys(POSES)) POSES[`${k}M`] = mirrorPose(POSES[k]);

function rasterPose(p) {
  const g = new Grid(SPR_W, SPR_H);
  const stamp = (x, y) => { g.set(x, y); g.set(x + 1, y); g.set(x, y + 1); g.set(x + 1, y + 1); };
  for (const pl of p.l) {
    for (let i = 0; i + 1 < pl.length; i++) {
      let [x0, y0] = pl[i];
      const [x1, y1] = pl[i + 1];
      const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
      let err = dx + dy;
      for (;;) {
        stamp(x0, y0);
        if (x0 === x1 && y0 === y1) break;
        const e2 = 2 * err;
        if (e2 >= dy) { err += dy; x0 += sx; }
        if (e2 <= dx) { err += dx; y0 += sy; }
      }
    }
  }
  const [cx, cy] = p.h;
  for (let y = 0; y < SPR_H; y++) for (let x = 0; x < SPR_W; x++) {
    if ((x + 0.5 - cx) ** 2 + (y + 0.5 - cy) ** 2 <= 3.9 ** 2) g.set(x, y);
  }
  return g;
}
const usedPoses = new Set();

const DANCER_Y = 89;
const FLOOR_Y = DANCER_Y + SPR_H;           // 128
const DANCERS = [
  { x: 64, fill: P.lred }, { x: 128, fill: P.yellow }, { x: 192, fill: P.white, star: true },
  { x: 256, fill: P.lgreen }, { x: 320, fill: P.cyan },
];
// Four frames per bar at 120 BPM: f0..f3 each own one beat of a 2 s loop.
for (let f = 0; f < 4; f++) {
  const on = f * 25, off = on + 25;
  const kf = f === 0 ? `0%{opacity:1}25%{opacity:0}100%{opacity:0}`
    : f === 3 ? `0%{opacity:0}75%{opacity:1}100%{opacity:1}`
      : `0%{opacity:0}${on}%{opacity:1}${off}%{opacity:0}100%{opacity:0}`;
  css.push(`@keyframes f${f}{${kf}}.f${f}{animation:f${f} 2s step-end infinite}`);
}
css.push('.f1,.f2,.f3{opacity:0}');
function dancer(d, seq) {
  const x = d.x - SPR_W / 2;
  return seq.map((pose, f) => { usedPoses.add(pose); return `<use href="#p_${pose}" x="${x}" y="${DANCER_Y}" class="f${f}"/>`; }).join('');
}

// ---------- the floor: light-up tiles, flipping on the beat
{
  const TILE_W = 16, TILE_H = 6;
  const cycles = [
    [P.purple, P.blue, P.dgrey, P.blue],
    [P.blue, P.dgrey, P.purple, P.dgrey],
    [P.dgrey, P.purple, P.blue, P.lblue],
    [P.red, P.dgrey, P.purple, P.blue],
  ];
  cycles.forEach((cy, i) => css.push(`@keyframes fl${i}{${cy.map((c, k) => `${k * 25}%{fill:${c}}`).join('')}100%{fill:${cy[3]}}}.fl${i}{animation:fl${i} 2s step-end infinite}`));
  const groups = cycles.map(() => []);
  for (let r = 0; r < 2; r++) for (let c = 0; c < FW / TILE_W; c++) {
    const gi = (r + c) % 2 === 0 ? (rand() < 0.3 ? 2 : 0) : (rand() < 0.2 ? 3 : 1);
    groups[gi].push([c * TILE_W, FLOOR_Y + r * TILE_H, TILE_W - 1, TILE_H - 1]);
  }
  groups.forEach((rects, i) => { title += `<path class="fl${i}" fill="${cycles[i][0]}" d="${rectsD(rects)}"/>`; });
}

// ---------- spotlight on the middle dancer (dithered, the way the VIC-II would)
const star = DANCERS.find((d) => d.star);
{
  const cone = `M${star.x - 5} ${DANCER_Y - 3}h10l22 ${FLOOR_Y - DANCER_Y + 3}h-54z`;
  const pool = `M${star.x - 30} ${FLOOR_Y}h60v4h-4v2h-52v-2h-4z`;
  title += `<g class="${win(T.spot, T.party)}"><path fill="url(#dith)" d="${cone}"/><path fill="url(#dith2)" d="${pool}"/></g>`;
}

// ---------- routines: synced crew, the spotlight (star spins, crew cheers), then everybody
{
  let a = '', b = '', c = '';
  const flip = (p) => (p.endsWith('M') ? p.slice(0, -1) : `${p}M`);
  for (const d of DANCERS) {
    const left = d.x < star.x;
    const m = (p) => (left ? flip(p) : p);   // the left half of the crew mirrors the right
    a += `<g fill="${d.fill}">${dancer(d, [m('disco'), m('discoM'), m('squat'), m('up')])}</g>`;
    b += `<g fill="${d.fill}">${d.star
      ? dancer(d, ['disco', 'spin', 'discoM', 'spinM'])
      : dancer(d, left ? ['cheer', 'rupM', 'cheer', 'run'] : ['cheer', 'rup', 'cheer', 'runM'])}</g>`;
    c += `<g fill="${d.fill}">${dancer(d, ['up', 'squat', 'cheer', 'squat'])}</g>`;
  }
  title += `<g class="${win(T.title, T.spot)} rmh">${a}</g>`;
  title += `<g class="${win(T.spot, T.party)}">${b}</g>`;
  title += `<g class="${win(T.party, T.end)} rmh">${c}</g>`;
}

// ---------- spotlight countdown line (the TV's own banner says DANCE SPOTLIGHT / IN THE ZONE)
{
  const lines = [
    [T.count, T.count + 0.5, 'DANCE SPOTLIGHT IN 3', true, P.lgrey],
    [T.count + 0.5, T.count + 1.0, 'DANCE SPOTLIGHT IN 2', true, P.lgrey],
    [T.count + 1.0, T.spot, 'DANCE SPOTLIGHT IN 1', true, P.lgrey],
    [T.spot, T.party, "YOU'RE IN THE ZONE. NO PRESSURE!", false, P.yellow],
    [T.party, T.end, 'EVERYBODY! HANDS UP, PHONES DOWN!', true, P.lgreen],
  ];
  for (const [on, off, s, hideStill, fill] of lines) {
    title += `<g class="${win(on, off)}${hideStill ? ' rmh' : ''}">${text(s, centerX(s), 77, `fill="${fill}"`)}</g>`;
  }
}

// ---------- SID tune panel with VU meters
const PANEL_Y = 148;
const VU = { seg: 3, n: 11, w: 5, gap: 2 };
const vuX = (v) => 44 * 8 - 23 + v * (VU.w + VU.gap);
const vuTop = PANEL_Y + 10;
{
  const c0 = 3, c1 = 44;                 // box columns on the 48-column frame grid
  const inner = c1 - c0 - 1;
  const px = (c) => c * 8;
  const ROW = (i) => PANEL_Y + 10 + i * 9; // one line of leading, kinder than the real thing
  const BOT = PANEL_Y + 46;
  // "┌─ ♪ NOW PLAYING " is 17 cells and " SONG 1/1 ─┐" is 12, so the dashes
  // fill the rest of the inner+2 cells and the corner lands on the right wall.
  const top = `┌─ ♪ NOW PLAYING ${'─'.repeat(inner + 2 - 29)} SONG 1/1 ─┐`;
  if ([...top].length !== inner + 2) throw new Error('panel top border is the wrong width');
  const bot = `└${'─'.repeat(inner)}┘`;
  let s = '';
  s += text(top, px(c0), PANEL_Y);
  s += text(bot, px(c0), BOT);
  s += `<rect x="${px(c0) + 3}" y="${PANEL_Y + 8}" width="2" height="${BOT - PANEL_Y - 8}"/><rect x="${px(c1) + 3}" y="${PANEL_Y + 8}" width="2" height="${BOT - PANEL_Y - 8}"/>`;
  s = `<g fill="${P.lblue}">${s}</g>`;
  const info = [
    ['TITLE   : ', 'CHICKEN SHOP SHUFFLE', P.white],
    ['AUTHOR  : ', 'DJ LAST ORDERS', P.lgreen],
    ['RELEASED: ', '2026 HACKNEY 1541 MASSIVE', P.yellow],
    ['PLAYER  : ', '6581 SID, 3 VOICES', P.cyan],
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
  const segColour = (i) => (i < 5 ? P.green : i < 8 ? P.lgreen : i < 10 ? P.yellow : P.lred);
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
      const level = Math.max(1, Math.min(VU.n, Math.round(VU.n * onBeat * (0.55 + rand() * 0.45) + (v === 0 && k % 4 === 0 ? 2 : 0))));
      steps.push(`${k * 6.25}%{transform:translateY(-${level * VU.seg}px)}`);
    }
    css.push(`@keyframes vu${v}{${steps.join('')}100%{transform:translateY(-${VU.seg * 4}px)}}.vu${v}{animation:vu${v} 2s step-end infinite;transform:translateY(-${VU.seg * (8 - v * 2)}px)}`);
    s += `<g clip-path="url(#vuclip${v})">${lit}<g class="vu${v}"><rect x="${x}" y="${vuTop}" width="${VU.w}" height="${VU.seg * VU.n}" fill="${P.black}"/><g fill="${P.dgrey}">${unlit}</g></g></g>`;
  }
  title += s;
}

// ---------- sine scroller (continuous; you catch a different bit every loop)
const SCROLL_Y = 211;
// The six venues are the real ones in src/venues/registry.js.
const SCROLL_TEXT = ('    DANCE VISION  *  YOUR PHONE IS THE MOCAP RIG, YOUR TELLY IS THE DANCE FLOOR  *  '
  + 'NO APP, NO ACCOUNT, NO VIDEO: THE POSE MODEL RUNS ON YOUR PHONE AND ONLY 33 JOINTS GO DOWN THE WIRE  *  33 JOINTS AT 33 RPM, BASICALLY VINYL  *  '
  + "DANCE LIKE NOBODY'S WATCHING, BECAUSE TECHNICALLY NOBODY IS  *  UP TO 6 PHONES AND A BACKING CREW ON ONE TELLY  *  "
  + 'TONIGHT: BIG SCREEN ENERGY, MAIN CHARACTER SYNDROME, GENTRIFRIED CHICKEN, MIND THE GYRATE, '
  + 'OUR LADY OF PERPETUAL SQUATS AND HOSTILE TWERKOVER  *  SPOTLIGHTS FOR THE BRAVE  *  '
  + 'TYPE NPM RUN PARTY AND MOVE THE SOFA  *  '
  + 'GREETZ TO DALSTON, HACKNEY WICK, THE OVERGROUND AND EVERY CHICKEN SHOP STILL FRYING AT 3AM  *  ').toUpperCase();
{
  const chars = [...SCROLL_TEXT];
  const tw = chars.length * 8;
  const speed = 64;                      // units per second
  let s = '';
  chars.forEach((ch, i) => {
    if (ch === ' ') return;
    usedGlyphs.add(ch);
    const delay = ((i * 0.075) % 1.2).toFixed(3);
    s += `<g class="w" style="animation-delay:-${delay}s"><use href="#${gid(ch)}" x="${i * 8}"/></g>`;
  });
  css.push('@keyframes wave{0%{transform:translateY(-1.5px)}100%{transform:translateY(1.5px)}}.w{animation:wave .6s ease-in-out infinite alternate}');
  css.push(`@keyframes scr{0%{transform:translateX(0)}100%{transform:translateX(-${tw}px)}}.scr{animation:scr ${(tw / speed).toFixed(2)}s linear infinite}`);
  title += `<g class="scrollwrap"><g transform="translate(0 ${SCROLL_Y}) scale(1 2)" fill="url(#scrollgrad)"><g class="scr"><g id="scrolltext">${s}</g><use href="#scrolltext" x="${tw}"/></g></g></g>`;
  // Reduced motion: a still line in its place.
  const still = 'NPM RUN PARTY  *  UP TO 6 PHONES';
  title += `<g class="rmo"><g transform="translate(${centerX(still)} ${SCROLL_Y}) scale(1 2)" fill="url(#scrollgrad)">${text(still, 0, 0)}</g></g>`;
}

// ---------- the privacy line, standing still at the bottom
title += ctext([
  ['NO VIDEO LEAVES YOUR PHONE. ', P.lgrey], ['JUST JOINTS.', P.white],
], centerX('NO VIDEO LEAVES YOUR PHONE. JUST JOINTS.'), 240);

// ================================================================= ASSEMBLY
// Scene switches. Create every track before the stylesheet is joined below.
const TITLE_WIN = win(T.title, T.end);
const BOOT_WIN = win(0, T.title);

const defs = [];
for (const ch of [...usedGlyphs].sort()) {
  const rows = FONT[ch];
  defs.push(`<path id="${gid(ch)}" d="${rectsD(gridRects((x, y) => rows[y][x] === '#', 8, 8))}"/>`);
}
for (const p of [...usedPoses].sort()) defs.push(`<path id="p_${p}" d="${gridD(rasterPose(POSES[p]))}"/>`);
defs.push('<pattern id="dith" width="2" height="2" patternUnits="userSpaceOnUse"><rect width="1" height="1" fill="#b8c76f" opacity=".55"/></pattern>');
defs.push('<pattern id="dith2" width="2" height="2" patternUnits="userSpaceOnUse"><rect width="1" height="1" fill="#b8c76f"/><rect x="1" y="1" width="1" height="1" fill="#b8c76f" opacity=".5"/></pattern>');
defs.push(`<linearGradient id="scrollgrad" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="8">${
  [P.white, P.yellow, P.yellow, P.lgreen, P.lgreen, P.cyan, P.cyan, P.lblue].map((c, i) => `<stop offset="${i / 8}" stop-color="${c}"/><stop offset="${(i + 1) / 8}" stop-color="${c}"/>`).join('')}</linearGradient>`);
for (let v = 0; v < 3; v++) defs.push(`<clipPath id="vuclip${v}"><rect x="${vuX(v)}" y="${vuTop}" width="${VU.w}" height="${VU.seg * VU.n}"/></clipPath>`);
defs.push(`<clipPath id="scr"><rect width="${FW}" height="${FH}" rx="7" shape-rendering="geometricPrecision"/></clipPath>`);
defs.push('<radialGradient id="vig" cx="50%" cy="50%" r="75%"><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".5"/></radialGradient>');
defs.push('<linearGradient id="glare" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".08"/><stop offset=".35" stop-color="#fff" stop-opacity="0"/></linearGradient>');
defs.push('<pattern id="scan" width="4" height="1" patternUnits="userSpaceOnUse"><rect y=".5" width="4" height=".5" fill="#000" opacity=".16"/></pattern>');

const baseCss = [
  '.boot{opacity:0}.rmh{opacity:0}.rmo{display:none}',
  ...css,
  '@media (prefers-reduced-motion:reduce){*{animation:none!important}.rmo{display:inline}.scrollwrap{display:none}}',
].join('\n');

const desc = 'A Commodore 64 boots to READY., types LOAD"DANCE VISION",8,1, searches, loads with '
  + 'rolling turbo stripes in the border and types RUN. It flips to a cracktro title screen: a colour-cycling '
  + 'DANCE VISION logo over raster bars, "PHONE = MOCAP RIG * TELLY = DANCE FLOOR", five stick figures dancing '
  + 'in sync on a light-up floor, a dance spotlight countdown that puts YOU in the zone while the crew cheers, '
  + 'then everybody hands up; a SID panel playing "Chicken Shop Shuffle" by DJ Last Orders, a sine scroller '
  + 'and the line "No video leaves your phone. Just joints."';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W * 2}" height="${H * 2}" shape-rendering="crispEdges" role="img" aria-labelledby="ttl dsc">
<title id="ttl">Dance Vision, loading on a Commodore 64</title>
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
<circle cx="${W - 16}" cy="${H - 4}" r="1.3" fill="#d23b2c"/>
</g>
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
// Text rendering of the same logo for the README's NFO block, one word per
// block. Each font pixel is two full-block columns and one line, which makes
// square pixels in a monospace cell; GitHub's 1.45 line-height leaves a gap
// under every row that reads as raster lines. Rows lean one column per two
// rows for the italic, and a light-shade copy one pixel down-right is the
// drop shadow. Both words stay inside 80 columns.
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
  const lines = [...nfoWord('DANCE', 2), ...nfoWord('VISION', 0)];
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
