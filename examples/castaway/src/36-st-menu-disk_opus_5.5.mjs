#!/usr/bin/env node
// Atari ST menu disk: README header generator for CASTAWAY.
//
//   node examples/castaway/src/36-st-menu-disk_opus_5.5.mjs
//
// Writes examples/castaway/assets/36-st-menu-disk_opus_5.5.svg.
// Plain Node, no dependencies, no clock, no Math.random: the same bytes on
// every run. (The .md beside the assets is hand-written, not generated.)
//
// The style (catalogue entry c64-13) is the menu screen in front of a late-80s
// Atari ST compilation floppy: ST low resolution (320x200, 3 bits a channel,
// so every gradient bands in 8 steps), red-to-black rasters rolling behind a
// warm orange-to-red slab logo that wobbles line by line, a dithered
// "digitised" picture, a grey metal plate with the disk number in big orange
// figures, a short key list ("1...", "0...TOGGLE 50/60 HZ", "SPACE...READ DOC
// FILE", "M...MUSIC") in small white and yellow capitals, and a big gradient
// scroller with a dark edge running along the bottom.
//
// Nothing is copied: the crew (THE LEEWARD LOT) is invented, the logo letters,
// both fonts and the island picture are drawn here from scratch, and the disk
// is this project's own: its keys are Castaway's own tools, and the disk
// number is the schedule's default seed, 1992.
//
// Timing (each loop is a whole number of 0.75 s beats, so nothing jumps):
//   rasters   one raster period (14 scanlines) per bar of the theme (3 s)
//   logo      each 2 px strip sways on a 3 s sine, a little behind the strip
//             above it, in whole pixels (steps, like the real thing), and the
//             sway swells and settles over 4 bars (12 s), starting straight
//   picture   24 s (8 bars): her head dips on every beat, sea glints and
//             shore foam colour-cycle on the beat, the raft bobs every 2
//             beats, and a bottle drifts in, touches the beach and drifts
//             straight back out again.
//   scroller  the text is followed by a copy of its own head and slides by
//             exactly the text's width per loop, so the wrap is invisible.
// The first frame (and the reduced-motion frame) already shows the whole
// logo and the start of the scroller: "TEN HOURS, ONE PALM".
//
// How it is drawn (no <text>, no filters): pixels are merged into runs of
// rects, one <path> per colour; dithered gradient rows are a flat rect plus a
// dashed 1 px line whose dash pattern is that row of a 4x4 Bayer matrix; the
// rolling rasters are one repeating hard-stop gradient; glyphs are <use>
// references to one path per character.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '36-st-menu-disk_opus_5.5';
const OUT = path.resolve(here, `../assets/${SLUG}.svg`);

// ------------------------------------------------------------------ facts
// Checked 2026-10-01 against D:/python/castaway (read-only): activities.toml
// holds 94 activities (81 on the four timers, 13 chained follow-ups; so "more
// than 90"), four timers (regular 2-5 min, occasional 12-25 min, rare 30-60
// min, super rare 3-6 h), run 10:00:00, seed 1992, starts snapped to 3 s bars,
// and [video] fps = 24 (the user's decision of 2026-10-01; it was 30 before).
// The theme is 80 BPM, F major, one seamless 60 s loop, and the only music
// file; audio_catalog.json lists 181 files, all made by tools/make_audio.py.

// ------------------------------------------------------------------ canvas
const W = 320;
const H = 200;
const BAR = 3; // seconds per bar of the theme
const BEAT = BAR / 4;
const PIC_LOOP = 8 * BAR; // 24 s

// vertical layout (scanlines)
const LOGO_Y = 6; // logo letters: 32 px tall, 5 px of raster above the edge
const RULE_Y = LOGO_Y + 38; // yellow-over-orange rule under the logo band
const SUB_Y = RULE_Y + 5; // subtitle, small font, 3 px clear of the rule
const PX = 9; // picture origin
const PY = 62;
const PW = 120;
const PH = 88;
const COL_X = 140; // key list column
const PLATE_Y = 59;
const PLATE_H = 28;
const KEYS_Y = PLATE_Y + PLATE_H + 4;
const KEY_PITCH = 9;
const SCROLL_TOP = 157; // raster band behind the scroller
const SCROLL_Y = 163; // scroller glyph top (with its 1 px edge)

// ----------------------------------------------------------------- helpers
const n = (v) => (Number.isInteger(v) ? String(v) : String(+v.toFixed(3)));
// ST palette: 3 bits per channel, levels 0..7.
const st = (r, g, b) => `#${[r, g, b].map((v) => Math.round((v * 255) / 7).toString(16).padStart(2, '0')).join('')}`;
// lerp between ST triples, then snap to the nearest ST level
const stLerp = (a, b, t) => st(...a.map((v, i) => Math.round(v + (b[i] - v) * t)));
// keys: [[row, [r,g,b]], ...] -> one ST colour per row
function ramp(keys, count) {
  const out = [];
  for (let r = 0; r < count; r++) {
    let k = 0;
    while (k < keys.length - 2 && r > keys[k + 1][0]) k++;
    const [r0, c0] = keys[k];
    const [r1, c1] = keys[k + 1];
    out.push(r <= r0 ? st(...c0) : r >= r1 ? st(...c1) : stLerp(c0, c1, (r - r0) / (r1 - r0)));
  }
  return out;
}
// Hard-edged vertical gradient: one flat band per run of equal rows.
function rowGradient(id, y0, colors, extra = '') {
  const h = colors.length;
  let stops = '';
  for (let i = 0; i < h;) {
    let j = i;
    while (j < h && colors[j] === colors[i]) j++;
    stops += `<stop offset="${n(i / h)}" stop-color="${colors[i]}"/><stop offset="${n(j / h)}" stop-color="${colors[i]}"/>`;
    i = j;
  }
  return `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="${n(y0)}" x2="0" y2="${n(y0 + h)}"${extra}>${stops}</linearGradient>`;
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
// A colour grid (null = clear) -> one <path> per colour.
function gridPaths(grid, w, h, ox = 0, oy = 0, attrs = '') {
  const colors = new Set();
  for (const row of grid) for (const c of row) if (c) colors.add(c);
  return [...colors].sort().map((c) => `<path fill="${c}"${attrs} d="${cellsToPath((x, y) => grid[y][x] === c, w, h, ox, oy)}"/>`).join('');
}
const makeGrid = (w, h) => Array.from({ length: h }, () => new Array(w).fill(null));

const BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];
// v in [0, list.length - 1] -> one of two neighbouring colours, ordered dither
function dith(x, y, v, list) {
  const last = list.length - 1;
  if (v <= 0) return list[0];
  if (v >= last) return list[last];
  const i = Math.floor(v);
  return (v - i) * 16 > BAYER[y & 3][x & 3] ? list[i + 1] : list[i];
}

// ------------------------------------------------------- small 8x8 font
// Menu capitals: 6 px wide (7 for M and W), 7 rows, 2 px stems, set on an
// 8 px pitch. '~' is a quaver.
const FONT = {
  A: ['.####.', '##..##', '##..##', '######', '##..##', '##..##', '##..##'],
  B: ['#####.', '##..##', '##..##', '#####.', '##..##', '##..##', '#####.'],
  C: ['.####.', '##..##', '##....', '##....', '##....', '##..##', '.####.'],
  D: ['####..', '##.##.', '##..##', '##..##', '##..##', '##.##.', '####..'],
  E: ['######', '##....', '##....', '#####.', '##....', '##....', '######'],
  F: ['######', '##....', '##....', '#####.', '##....', '##....', '##....'],
  G: ['.####.', '##..##', '##....', '##.###', '##..##', '##..##', '.#####'],
  H: ['##..##', '##..##', '##..##', '######', '##..##', '##..##', '##..##'],
  I: ['######', '..##..', '..##..', '..##..', '..##..', '..##..', '######'],
  J: ['...###', '....##', '....##', '....##', '##..##', '##..##', '.####.'],
  K: ['##..##', '##.##.', '####..', '###...', '####..', '##.##.', '##..##'],
  L: ['##....', '##....', '##....', '##....', '##....', '##....', '######'],
  M: ['##...##', '###.###', '#######', '##.#.##', '##...##', '##...##', '##...##'],
  N: ['##..##', '###.##', '######', '##.###', '##..##', '##..##', '##..##'],
  O: ['.####.', '##..##', '##..##', '##..##', '##..##', '##..##', '.####.'],
  P: ['#####.', '##..##', '##..##', '#####.', '##....', '##....', '##....'],
  Q: ['.####.', '##..##', '##..##', '##..##', '##..##', '##.##.', '.##.##'],
  R: ['#####.', '##..##', '##..##', '#####.', '####..', '##.##.', '##..##'],
  S: ['.####.', '##..##', '##....', '.####.', '....##', '##..##', '.####.'],
  T: ['######', '..##..', '..##..', '..##..', '..##..', '..##..', '..##..'],
  U: ['##..##', '##..##', '##..##', '##..##', '##..##', '##..##', '.####.'],
  V: ['##..##', '##..##', '##..##', '##..##', '##..##', '.####.', '..##..'],
  W: ['##...##', '##...##', '##...##', '##.#.##', '#######', '###.###', '##...##'],
  X: ['##..##', '##..##', '.####.', '..##..', '.####.', '##..##', '##..##'],
  Y: ['##..##', '##..##', '##..##', '.####.', '..##..', '..##..', '..##..'],
  Z: ['######', '....##', '...##.', '..##..', '.##...', '##....', '######'],
  0: ['.####.', '##..##', '##.###', '######', '###.##', '##..##', '.####.'],
  1: ['..##..', '.###..', '..##..', '..##..', '..##..', '..##..', '.####.'],
  2: ['.####.', '##..##', '....##', '..###.', '.##...', '##....', '######'],
  3: ['.####.', '##..##', '....##', '..###.', '....##', '##..##', '.####.'],
  4: ['...##.', '..###.', '.####.', '##.##.', '######', '...##.', '...##.'],
  5: ['######', '##....', '#####.', '....##', '....##', '##..##', '.####.'],
  6: ['.####.', '##....', '##....', '#####.', '##..##', '##..##', '.####.'],
  7: ['######', '....##', '...##.', '..##..', '..##..', '..##..', '..##..'],
  8: ['.####.', '##..##', '##..##', '.####.', '##..##', '##..##', '.####.'],
  9: ['.####.', '##..##', '##..##', '.#####', '....##', '....##', '.####.'],
  '.': ['..', '..', '..', '..', '..', '##', '##'],
  ',': ['..', '..', '..', '..', '..', '##', '##', '#.'],
  ':': ['..', '##', '##', '..', '##', '##', '..'],
  '!': ['##', '##', '##', '##', '##', '..', '##'],
  '?': ['.####.', '##..##', '....##', '..###.', '..##..', '......', '..##..'],
  '-': ['.....', '.....', '.....', '#####', '#####', '.....', '.....'],
  "'": ['##', '##', '#.', '..', '..', '..', '..'],
  '/': ['....##', '....##', '...##.', '..##..', '.##...', '##....', '##....'],
  '(': ['..##', '.##.', '##..', '##..', '##..', '.##.', '..##'],
  ')': ['##..', '.##.', '..##', '..##', '..##', '.##.', '##..'],
  '+': ['......', '..##..', '..##..', '######', '..##..', '..##..', '......'],
  '=': ['......', '......', '######', '......', '######', '......', '......'],
  '*': ['......', '##..##', '.####.', '######', '.####.', '##..##', '......'],
  '~': ['..####', '..##.#', '..##..', '..##..', '####..', '####..', '.##...'],
};
const SMALL_PITCH = 8;

// ------------------------------------------------ big scroller font
// The small font, smoothed with Scale2x (EPX) to 14 rows and drawn at 2 px
// a cell: 28 px letters plus a 1 px dark edge, so about 30 px in all.
function epx(rows) {
  const h = rows.length;
  const w = rows[0].length;
  const on = (x, y) => x >= 0 && y >= 0 && x < w && y < h && rows[y][x] === '#';
  const out = Array.from({ length: h * 2 }, () => new Array(w * 2).fill(false));
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const P = on(x, y);
      const A = on(x, y - 1);
      const B = on(x + 1, y);
      const C = on(x - 1, y);
      const D = on(x, y + 1);
      out[2 * y][2 * x] = C === A && C !== D && A !== B ? A : P;
      out[2 * y][2 * x + 1] = A === B && A !== C && B !== D ? B : P;
      out[2 * y + 1][2 * x] = D === C && D !== B && C !== A ? C : P;
      out[2 * y + 1][2 * x + 1] = B === D && B !== A && D !== C ? D : P;
    }
  }
  return out;
}
const BIG_CELL = 2;
function bigGlyph(ch) {
  const cells = epx(FONT[ch]);
  const ch2 = cells.length;
  const cw2 = cells[0].length;
  const pw = cw2 * BIG_CELL + 2;
  const ph = ch2 * BIG_CELL + 2;
  const fill = (x, y) => {
    const cx = Math.floor((x - 1) / BIG_CELL);
    const cy = Math.floor((y - 1) / BIG_CELL);
    return x >= 1 && y >= 1 && cx < cw2 && cy < ch2 && cells[cy][cx];
  };
  const edge = (x, y) => {
    if (fill(x, y)) return false;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (fill(x + dx, y + dy)) return true;
    return false;
  };
  return { w: pw, edge: cellsToPath(edge, pw, ph), fill: cellsToPath(fill, pw, ph) };
}
const BIG_GAP = 2;
const BIG_SPACE = 16;

// ------------------------------------------------------------ the logo
// Hand-drawn slab capitals on a 16x16 grid of 2 px cells (32x32 px).
const LOGO_GLYPHS = {
  C: [
    '...##########...',
    '..############..',
    '.#####....#####.',
    '.####......####.',
    '.####......####.',
    '.####...........',
    '.####...........',
    '.####...........',
    '.####...........',
    '.####...........',
    '.####...........',
    '.####......####.',
    '.####......####.',
    '.#####....#####.',
    '..############..',
    '...##########...',
  ],
  A: [
    '...##########...',
    '..############..',
    '.#####....#####.',
    '.####......####.',
    '.####......####.',
    '.####......####.',
    '.####......####.',
    '.##############.',
    '.##############.',
    '.####......####.',
    '.####......####.',
    '.####......####.',
    '.####......####.',
    '.####......####.',
    '######....######',
    '######....######',
  ],
  S: [
    '...##########...',
    '..############..',
    '.#####....#####.',
    '.####......####.',
    '.####...........',
    '.#####..........',
    '..###########...',
    '...###########..',
    '..........#####.',
    '...........####.',
    '...........####.',
    '.####......####.',
    '.####......####.',
    '.#####....#####.',
    '..############..',
    '...##########...',
  ],
  T: [
    '################',
    '################',
    '##....####....##',
    '#.....####.....#',
    '......####......',
    '......####......',
    '......####......',
    '......####......',
    '......####......',
    '......####......',
    '......####......',
    '......####......',
    '......####......',
    '......####......',
    '....########....',
    '....########....',
  ],
  W: [
    '######....######',
    '######....######',
    '.####......####.',
    '.####......####.',
    '.####......####.',
    '.####..##..####.',
    '.####..##..####.',
    '.####.####.####.',
    '.####.####.####.',
    '.####.####.####.',
    '.####.####.####.',
    '.##############.',
    '.##############.',
    '.#####.##.#####.',
    '..####....####..',
    '...##......##...',
  ],
  Y: [
    '######....######',
    '######....######',
    '.####......####.',
    '.####......####.',
    '.####......####.',
    '.#####....#####.',
    '..############..',
    '...##########...',
    '.....######.....',
    '......####......',
    '......####......',
    '......####......',
    '......####......',
    '......####......',
    '....########....',
    '....########....',
  ],
};
const LOGO_CELL = 2;
const LOGO_PX = 16 * LOGO_CELL; // 32
const LOGO_GAP = 4;
const LOGO_WORD = 'CASTAWAY';
const LOGO_W = LOGO_WORD.length * LOGO_PX + (LOGO_WORD.length - 1) * LOGO_GAP;
const LOGO_X = Math.round((W - LOGO_W) / 2) - 1;

// ------------------------------------------------------------ build
const defs = [];
const css = [];
const body = [];

// ---- colours
const BLACK = st(0, 0, 0);

// ---- rolling rasters: red fading to black and back, 8 steps each way
const RASTER_LEVELS = [0, 1, 2, 3, 4, 5, 6, 7, 6, 5, 4, 3, 2, 1];
const RP = RASTER_LEVELS.length; // 14 scanlines a period
function rasterGradient(id, colorOf) {
  let stops = '';
  RASTER_LEVELS.forEach((lv, i) => {
    const c = colorOf(lv);
    stops += `<stop offset="${n(i / RP)}" stop-color="${c}"/><stop offset="${n((i + 1) / RP)}" stop-color="${c}"/>`;
  });
  return `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="${RP}" spreadMethod="repeat">${stops}</linearGradient>`;
}
// behind the logo: red, peaking at level 5 so the orange letters stay on top
defs.push(rasterGradient('rTop', (lv) => st(Math.round((lv * 5) / 7), 0, 0)));
// behind the scroller: full red, with a touch of blue in the dark half
defs.push(rasterGradient('rBot', (lv) => st(lv, 0, lv < 3 ? 1 : 0)));
defs.push(`<clipPath id="cTop"><rect x="0" y="0" width="${W}" height="${RULE_Y + 1}"/></clipPath>`);
defs.push(`<clipPath id="cBot"><rect x="0" y="${SCROLL_TOP}" width="${W}" height="${H - SCROLL_TOP}"/></clipPath>`);
css.push(`.roll{animation:roll ${BAR}s steps(${RP}) infinite}`);
css.push(`.rollb{animation:roll ${BAR}s steps(${RP}) infinite reverse}`);
css.push(`@keyframes roll{from{transform:translateY(0)}to{transform:translateY(-${RP}px)}}`);

body.push(`<rect width="${W}" height="${H}" rx="6" fill="${BLACK}"/>`);
body.push(`<g clip-path="url(#cTop)"><rect class="roll" x="0" y="0" width="${W}" height="${RULE_Y + 1 + RP}" fill="url(#rTop)"/></g>`);
body.push(`<g clip-path="url(#cBot)"><rect class="rollb" x="0" y="${SCROLL_TOP - RP}" width="${W}" height="${H - SCROLL_TOP + 2 * RP}" fill="url(#rBot)"/></g>`);

// raster rules: 2 scanlines of yellow over orange under each band edge
const rule = (y) => `<rect x="0" y="${y}" width="${W}" height="1" fill="${st(7, 6, 1)}"/><rect x="0" y="${y + 1}" width="${W}" height="1" fill="${st(6, 3, 0)}"/>`;
body.push(rule(RULE_Y));
body.push(rule(SCROLL_TOP - 2));

// ---- the logo: gradient fill, top highlight, bottom shade, dark edge, shadow
{
  const g = makeGrid(LOGO_W, LOGO_PX);
  LOGO_WORD.split('').forEach((ch, i) => {
    const rows = LOGO_GLYPHS[ch];
    const ox = i * (LOGO_PX + LOGO_GAP);
    rows.forEach((row, ry) => [...row].forEach((c, rx) => {
      if (c !== '#') return;
      for (let dy = 0; dy < LOGO_CELL; dy++) for (let dx = 0; dx < LOGO_CELL; dx++) g[ry * LOGO_CELL + dy][ox + rx * LOGO_CELL + dx] = 1;
    }));
  });
  const on = (x, y) => x >= 0 && y >= 0 && x < LOGO_W && y < LOGO_PX && g[y][x] === 1;
  const hi = (x, y) => on(x, y) && !on(x, y - 1);
  const lo = (x, y) => on(x, y) && !on(x, y + 1) && !hi(x, y);
  const body1 = (x, y) => on(x, y) && !hi(x, y) && !lo(x, y);
  const edge = (x, y) => {
    if (on(x, y)) return false;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (on(x + dx, y + dy)) return true;
    return false;
  };
  const shadow = (x, y) => on(x - 3, y - 3) || edge(x - 3, y - 3);
  const ox = LOGO_X;
  const oy = LOGO_Y;
  defs.push(rowGradient('gLogo', oy, ramp([[0, [7, 7, 3]], [5, [7, 6, 1]], [11, [7, 5, 0]], [18, [7, 3, 0]], [25, [7, 2, 0]], [31, [5, 0, 0]]], LOGO_PX)));
  defs.push(`<g id="logo">`
    + `<path fill="${BLACK}" d="${cellsToPath(shadow, LOGO_W + 4, LOGO_PX + 4, ox - 1, oy - 1)}" transform="translate(1 1)"/>`
    + `<path fill="${st(1, 0, 0)}" d="${cellsToPath((x, y) => edge(x - 1, y - 1), LOGO_W + 2, LOGO_PX + 2, ox - 1, oy - 1)}"/>`
    + `<path fill="url(#gLogo)" d="${cellsToPath(body1, LOGO_W, LOGO_PX, ox, oy)}"/>`
    + `<path fill="${st(7, 7, 6)}" d="${cellsToPath(hi, LOGO_W, LOGO_PX, ox, oy)}"/>`
    + `<path fill="${st(3, 0, 0)}" d="${cellsToPath(lo, LOGO_W, LOGO_PX, ox, oy)}"/>`
    + `</g>`);
  // line-by-line distortion: 2 px strips, each a step behind the one above
  const top = oy - 1;
  const bottom = oy + LOGO_PX + 4;
  const STRIP = 2;
  // A 3 s sway (one bar) inside a 4-bar swell: almost straight at the top
  // of the loop, widest in the middle, so the name reads at once and the
  // distortion arrives a bar or so later. 16 steps a second, whole pixels.
  const WOB_BARS = 4;
  const PER_BAR = 48;
  const SAMPLES = WOB_BARS * PER_BAR;
  const AMP = 3.4;
  let kf = '';
  let last = null;
  for (let i = 0; i <= SAMPLES; i++) {
    const t = i / SAMPLES;
    const env = Math.sin(Math.PI * t) ** 2;
    const v = Math.round(AMP * env * Math.sin((2 * Math.PI * i) / PER_BAR)) + 0;
    if (v === last && i !== SAMPLES) continue;
    last = v;
    kf += `${n((100 * i) / SAMPLES)}%{transform:translateX(${v}px)}`;
  }
  css.push(`@keyframes wob{${kf}}`);
  css.push(`.wb{animation:wob ${WOB_BARS * BAR}s steps(1,end) infinite}`);
  let k = 0;
  for (let y = top; y < bottom; y += STRIP, k++) {
    defs.push(`<clipPath id="ls${k}"><rect x="0" y="${y}" width="${W}" height="${STRIP}"/></clipPath>`);
    const delay = -((k * BAR) / 22);
    body.push(`<g clip-path="url(#ls${k})"><use href="#logo" class="wb" style="animation-delay:${n(delay)}s"/></g>`);
  }
}

// ---- small text
const usedSmall = new Set();
function smallText(str, x, y, fill, scale = 1) {
  let out = '';
  let cx = x;
  for (const ch of str) {
    if (ch !== ' ') {
      if (!FONT[ch]) throw new Error(`small font lacks ${JSON.stringify(ch)}`);
      usedSmall.add(ch);
      out += scale === 1
        ? `<use href="#s${ch.charCodeAt(0)}" x="${n(cx)}" y="${n(y)}"/>`
        : `<use href="#s${ch.charCodeAt(0)}" transform="translate(${n(cx)} ${n(y)}) scale(${scale})"/>`;
    }
    cx += SMALL_PITCH * scale;
  }
  return `<g fill="${fill}">${out}</g>`;
}
const smallWidth = (str, scale = 1) => str.length * SMALL_PITCH * scale - 2 * scale;
// text gradients in glyph space (rows 0..7)
defs.push(rowGradient('tW', 0, [st(7, 7, 7), st(7, 7, 7), st(6, 6, 7), st(6, 6, 7), st(5, 5, 7), st(5, 5, 7), st(4, 4, 6), st(4, 4, 6)]));
defs.push(rowGradient('tY', 0, [st(7, 7, 4), st(7, 7, 1), st(7, 7, 0), st(7, 6, 0), st(7, 6, 0), st(7, 5, 0), st(7, 4, 0), st(7, 4, 0)]));
defs.push(rowGradient('tB', 0, [st(6, 7, 7), st(5, 6, 7), st(4, 6, 7), st(4, 5, 7), st(3, 4, 7), st(3, 4, 7), st(2, 3, 7), st(2, 3, 7)]));
defs.push(rowGradient('tO', 0, [st(7, 7, 3), st(7, 6, 1), st(7, 5, 0), st(7, 4, 0), st(7, 3, 0), st(7, 2, 0), st(6, 1, 0), st(6, 1, 0)]));

// subtitle
{
  const s = 'A TEN-HOUR LO-FI ISLAND VIDEO';
  body.push(smallText(s, Math.round((W - smallWidth(s)) / 2), SUB_Y, 'url(#tB)'));
}

// ---- the metal plate with the disk number
{
  const x0 = COL_X;
  const y0 = PLATE_Y;
  const w = 176;
  const h = PLATE_H;
  const g = makeGrid(w, h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      // brushed: a slow vertical ramp with a few lighter grain lines
      const grain = (y * 7 + 3) % 5 === 0 ? 1 : 0;
      let c = dith(x, y, 1.2 + (y / h) * 1.4 + grain * 0.5, [st(6, 6, 6), st(5, 5, 6), st(4, 4, 5), st(3, 3, 4)]);
      if (y === 0 || x === 0) c = st(7, 7, 7);
      else if (y === h - 1 || x === w - 1) c = st(2, 2, 2);
      else if (y === 1 || x === 1) c = st(6, 6, 7);
      else if (y === h - 2 || x === w - 2) c = st(3, 3, 3);
      g[y][x] = c;
    }
  }
  // rivets
  for (const [rx, ry] of [[4, 4], [w - 6, 4], [4, h - 6], [w - 6, h - 6]]) {
    g[ry][rx] = st(7, 7, 7); g[ry][rx + 1] = st(5, 5, 5);
    g[ry + 1][rx] = st(4, 4, 4); g[ry + 1][rx + 1] = st(2, 2, 2);
  }
  body.push(gridPaths(g, w, h, x0, y0));
  // engraved label: dark letters with a light lip underneath
  const lab = (s, lx, ly) => smallText(s, lx, ly + 1, st(7, 7, 7)) + smallText(s, lx, ly, st(1, 1, 2));
  // (3 px of plate above MENU and below DISK's lip, 2 px between the lines)
  body.push(lab('MENU', x0 + 14, y0 + 5));
  body.push(lab('DISK', x0 + 14, y0 + 15));
  // the number: big orange figures with a dark drop shadow
  const num = '1992';
  const nx = x0 + w - 14 - smallWidth(num, 2);
  const ny = y0 + Math.round((h - 16) / 2);
  body.push(smallText(num, nx + 2, ny + 2, st(1, 0, 0), 2));
  body.push(smallText(num, nx, ny, 'url(#tO)', 2));
  // a small label between: seed (14 px clear of the label and the number)
  body.push(smallText('SEED', x0 + 58, y0 + Math.round((h - 7) / 2), st(2, 2, 3)));
}

// ---- the key list
{
  // Every label starts in the same column (6), so the dot leaders take up
  // the slack: five dots after a number key, one after SPACE. Labels are at
  // most 16 characters, which ends them 6 px short of the screen edge.
  const LABEL_COL = 6;
  const rows = [
    ['1', 'WATCH HER WAIT', 'tY'],
    ['2', 'TEN-HOUR SIM', 'tY'],
    ['3', 'SOUND FROM CODE', 'tY'],
    ['4', 'DEV REEL', 'tY'],
    ['0', '50/60 HZ? 24 FPS', 'tB'],
    ['SPACE', 'READ DOC FILE', 'tB'],
    ['M', 'MUSIC: SAME TUNE', 'tB'],
  ];
  rows.forEach(([key, label, kg], i) => {
    const y = KEYS_Y + i * KEY_PITCH;
    const dots = '.'.repeat(LABEL_COL - key.length);
    if (COL_X + (LABEL_COL + label.length) * SMALL_PITCH - 2 > W - 6) throw new Error(`key label too wide: ${label}`);
    let x = COL_X;
    body.push(smallText(key, x, y, `url(#${kg})`));
    x += key.length * SMALL_PITCH;
    body.push(smallText(dots, x, y, st(6, 3, 2)));
    x += dots.length * SMALL_PITCH;
    body.push(smallText(label, x, y, 'url(#tW)'));
  });
}

// ---- the digitised picture
{
  // frame: grey metal bevel
  const fx = PX - 3;
  const fy = PY - 3;
  const fw = PW + 6;
  const fh = PH + 6;
  body.push(`<rect x="${fx}" y="${fy}" width="${fw}" height="${fh}" fill="${st(2, 2, 2)}"/>`);
  body.push(`<path fill="${st(7, 7, 7)}" d="M${fx} ${fy}h${fw - 1}v1h${-(fw - 2)}v${fh - 2}h-1z"/>`);
  body.push(`<path fill="${st(5, 5, 6)}" d="M${fx + 1} ${fy + 1}h${fw - 3}v1h${-(fw - 4)}v${fh - 4}h-1z"/>`);
  body.push(`<rect x="${fx + 2}" y="${fy + 2}" width="${fw - 4}" height="${fh - 4}" fill="${st(4, 4, 4)}"/>`);
  defs.push(`<clipPath id="cPic"><rect x="${PX}" y="${PY}" width="${PW}" height="${PH}"/></clipPath>`);

  const HORIZON = 46;
  const SKY = [[1, 2, 6], [2, 3, 7], [2, 4, 7], [3, 5, 7], [4, 6, 7], [5, 6, 7], [6, 7, 7]].map((c) => st(...c));
  const SEA = [[1, 3, 6], [1, 4, 6], [1, 4, 7], [2, 5, 6], [2, 6, 6], [3, 6, 6]].map((c) => st(...c));
  const skyV = (y) => (y / (HORIZON - 1)) * (SKY.length - 1);
  const seaV = (y) => ((y - HORIZON) / (PH - 1 - HORIZON)) * (SEA.length - 1) * 1.05;
  const bgAt = (x, y) => (y < HORIZON ? dith(x, y, skyV(y), SKY) : dith(x, y, seaV(y), SEA));

  // sky and sea: per row, a flat rect of the lower colour and a dashed line
  // of the upper one whose dash pattern is that row of the Bayer matrix
  const rowsOut = [];
  const lines = new Map(); // colour|dash -> [y...]
  let runStart = 0;
  let runColor = null;
  const flush = (yEnd) => { if (runColor) rowsOut.push(`<rect x="${PX}" y="${PY + runStart}" width="${PW}" height="${yEnd - runStart}" fill="${runColor}"/>`); };
  for (let y = 0; y < PH; y++) {
    const list = y < HORIZON ? SKY : SEA;
    const v = y < HORIZON ? skyV(y) : seaV(y);
    const last = list.length - 1;
    const i = Math.max(0, Math.min(last, Math.floor(v)));
    const f = v >= last ? 0 : v - i;
    const A = list[i];
    if (A !== runColor) { flush(y); runStart = y; runColor = A; }
    const mask = [0, 1, 2, 3].map((k) => f * 16 > BAYER[y & 3][k]);
    if (mask.some(Boolean) && i < last) {
      const runs = [];
      let state = true;
      let len = 0;
      for (const m of mask) { if (m === state) len++; else { runs.push(len); state = !state; len = 1; } }
      runs.push(len);
      if (runs.length % 2 === 1) runs.push(0);
      const key = `${list[i + 1]}|${runs.join(' ')}`;
      if (!lines.has(key)) lines.set(key, []);
      lines.get(key).push(y);
    }
  }
  flush(PH);
  const picParts = [...rowsOut];
  for (const [key, ys] of lines) {
    const [c, dash] = key.split('|');
    picParts.push(`<path stroke="${c}" stroke-dasharray="${dash}" d="${ys.map((y) => `M${PX} ${PY + y + 0.5}h${PW}`).join('')}"/>`);
  }

  // objects, drawn on a clear grid over the sky and sea
  const g = makeGrid(PW, PH);
  const put = (x, y, c) => { x = Math.round(x); y = Math.round(y); if (x >= 0 && y >= 0 && x < PW && y < PH && c) g[y][x] = c; };

  // sun with a dithered glow, top left
  const SUN = [17, 12];
  for (let y = 0; y < 26; y++) {
    for (let x = 0; x < 36; x++) {
      const d = Math.hypot(x - SUN[0], y - SUN[1]);
      if (d <= 4.6) put(x, y, st(7, 7, 6));
      else if (d <= 6) put(x, y, st(7, 7, 4));
      else if (d < 13) {
        const t = 1 - (d - 6) / 7; // 1 near the disc, 0 at the rim
        if (t * 16 > BAYER[y & 3][x & 3] + 6) put(x, y, d < 9 ? st(7, 7, 4) : st(6, 7, 6));
      }
    }
  }
  // clouds: white tops, blue-grey dithered undersides, flat bottoms
  const cloud = (blobs, base) => {
    let top = Infinity;
    for (const [, cy, r] of blobs) top = Math.min(top, cy - r);
    for (let y = Math.floor(top); y <= base; y++) {
      for (let x = 0; x < PW; x++) {
        if (!blobs.some(([cx, cy, r]) => Math.hypot(x - cx, (y - cy) * 1.15) <= r)) continue;
        const v = ((y - top) / (base - top)) * 2.6;
        put(x, y, dith(x, y, v, [st(7, 7, 7), st(7, 7, 7), st(6, 7, 7), st(5, 6, 7)]));
      }
    }
  };
  cloud([[38, 36, 5], [45, 33, 6], [53, 35, 5], [59, 38, 3.5], [32, 39, 3]], 41);
  cloud([[98, 40, 3.5], [103, 38, 4.5], [109, 40, 3.5]], 43);
  cloud([[6, 42, 2.5], [10, 41, 3]], 44);

  // far sea glints, three colour-cycle phases
  const glints = [[], [], []];
  {
    let s = 7;
    const rnd = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
    for (let i = 0; i < 46; i++) {
      const y = HORIZON + 2 + Math.floor(rnd() * 36);
      const x = Math.floor(rnd() * (PW - 4));
      const len = 1 + Math.floor(rnd() * 3);
      // keep clear of the island
      if (y > 64 && x > 2 && x < 112) continue;
      glints[i % 3].push([x, y, len]);
    }
  }

  // shallows round the island and the sand mound
  const IC = [58, 77];
  for (let y = 60; y < PH; y++) {
    for (let x = 0; x < PW; x++) {
      const ds = Math.hypot((x - IC[0]) / 39, (y - IC[1]) / 7.5);
      const dw = Math.hypot((x - IC[0]) / 52, (y - IC[1]) / 11);
      if (ds <= 1) {
        // sand, light on top, damp at the waterline
        const v = ((y - (IC[1] - 7.5)) / 15) * 2.4 + (ds > 0.9 ? 0.9 : 0);
        put(x, y, dith(x, y, v, [st(7, 7, 5), st(7, 6, 4), st(6, 5, 3), st(5, 4, 2)]));
      } else if (dw <= 1) {
        const v = ((dw - 0.72) / 0.28) * 2.2;
        put(x, y, dith(x, y, v, [st(4, 7, 7), st(3, 7, 6), st(2, 6, 6), st(2, 5, 6)]));
      }
    }
  }
  // foam pixels on the shallows' rim, in three phases
  const foam = [[], [], []];
  for (let a = 0; a < 64; a++) {
    const t = (a / 64) * Math.PI * 2;
    const x = Math.round(IC[0] + Math.cos(t) * 40.5);
    const y = Math.round(IC[1] + Math.sin(t) * 8.2);
    if (y < 72) continue;
    foam[a % 3].push([x, y, 1]);
  }

  // the palm: tall, slender, reddish-tan, leaning into the wind
  const BASE = [68, 74];
  const TOPP = [79, 17];
  const trunkX = (t) => BASE[0] + (TOPP[0] - BASE[0]) * Math.pow(t, 1.7) - 2.2 * Math.sin(t * Math.PI);
  for (let y = TOPP[1]; y <= BASE[1]; y++) {
    const t = (BASE[1] - y) / (BASE[1] - TOPP[1]);
    const x = Math.round(trunkX(t));
    const w = t < 0.35 ? 4 : t < 0.8 ? 3 : 2;
    const ring = (BASE[1] - y) % 4 === 0;
    for (let k = 0; k < w; k++) {
      let c = k === 0 ? st(6, 4, 3) : k === w - 1 ? st(3, 2, 1) : st(5, 3, 2);
      if (ring && k > 0) c = st(4, 2, 1);
      put(x + k, y, c);
    }
  }
  // fronds: feathered arcs, rib on top and leaflets hanging under it
  const crown = [TOPP[0] + 1, TOPP[1]];
  const fronds = [
    [168, 22, 0.55], [140, 19, 0.45], [112, 13, 0.25], [80, 15, 0.3],
    [45, 21, 0.5], [15, 22, 0.6], [-20, 15, 0.7], [205, 15, 0.7],
  ];
  const DARK = st(1, 3, 1);
  const MID = st(2, 5, 1);
  const LIGHT = st(4, 6, 2);
  for (const [deg, len, droop] of fronds) {
    const th = (deg * Math.PI) / 180;
    let px = crown[0];
    let py = crown[1];
    for (let s = 0; s <= len; s++) {
      const u = s / len;
      const x = crown[0] + Math.cos(th) * s;
      const y = crown[1] - Math.sin(th) * s + droop * s * s * 0.06;
      // leaflets: short strokes hanging down and out from the rib
      const leaf = Math.round(3.4 * Math.sin(Math.PI * Math.min(1, u * 1.15)) + 0.6);
      const side = Math.cos(th) >= 0 ? 1 : -1;
      for (let j = 1; j <= leaf; j++) {
        put(x + side * j * 0.45, y + j, j === 1 ? MID : DARK);
        if (s % 2 === 0) put(x - side * j * 0.35, y + j * 0.8, DARK);
      }
      put(x, y, LIGHT);
      if (u < 0.5) put(x, y + 0.6, MID);
      px = x; py = y;
    }
    void px; void py;
  }
  // coconuts
  for (const [cx, cy] of [[78, 19], [81, 20], [79, 21]]) {
    put(cx, cy, st(4, 3, 1)); put(cx + 1, cy, st(3, 2, 1));
    put(cx, cy + 1, st(3, 2, 1)); put(cx + 1, cy + 1, st(2, 1, 0));
  }

  // the raft, pulled up at the left of the shore (bobs separately)
  const raft = makeGrid(24, 6);
  for (let y = 0; y < 5; y++) {
    for (let x = 0; x < 22; x++) {
      const log = y % 2 === 0 ? st(5, 3, 1) : st(4, 2, 1);
      raft[y][x + (y === 4 ? 1 : 0)] = log;
    }
    raft[y][5] = st(2, 1, 0);
    raft[y][16] = st(2, 1, 0);
  }
  for (let x = 1; x < 23; x++) raft[5][x] = (x % 2 ? st(1, 3, 5) : st(1, 2, 5));

  // her: sitting on the sand left of the palm, leaning back on one hand,
  // legs out, facing the sea on the right (where the bottle comes in).
  // Cream headphones, brown hair in a low bun, coral tank top, cream
  // shorts, bare feet. Drawn in two parts so the head can nod.
  const P = {
    H: st(3, 2, 1), h: st(4, 3, 1), s: st(7, 5, 4), S: st(6, 4, 3), e: st(1, 1, 1),
    c: st(7, 7, 6), C: st(7, 6, 5), o: st(7, 4, 3), O: st(6, 3, 2), w: st(7, 7, 6), W: st(6, 6, 4),
  };
  const HEAD = [
    '....cccc.........',
    '...cHHHHH........',
    '..cHHhHHHH.......',
    '..HCCHHHHss......',
    '.HHCCHHsses......',
    '.HHCCHHssss......',
    'HHH.HHHsss.......',
    'HH....sss........',
  ];
  const BODY = [
    '.....ooooo.......',
    '....ooooooo......',
    '...soooooOo......',
    '..s.oooooOo......',
    '.s..wwwwwwWssssS.',
    's...wwwwwwWsssSSS',
  ];
  const HER = [35, 62]; // top left of the head in picture space
  const herBody = makeGrid(PW, PH);
  BODY.forEach((row, y) => [...row].forEach((ch, x) => {
    if (ch !== '.') herBody[HER[1] + HEAD.length + y][HER[0] + x] = P[ch];
  }));
  const herHead = makeGrid(PW, PH);
  HEAD.forEach((row, y) => [...row].forEach((ch, x) => {
    if (ch !== '.') herHead[HER[1] + y][HER[0] + x] = P[ch];
  }));
  // contact shadow on the sand
  for (let x = HER[0]; x < HER[0] + 18; x++) {
    const y = HER[1] + HEAD.length + BODY.length;
    if (g[y] && g[y][x]) g[y][x] = (x & 1) ? st(6, 5, 3) : st(5, 4, 2);
  }

  // the bottle (drifts in, touches the beach, drifts straight back out)
  const bottle = makeGrid(7, 4);
  [
    '.hgggnk',
    'ggGGGG.',
    '.GGGG..',
    'fffff..',
  ].forEach((row, y) => [...row].forEach((ch, x) => {
    const c = { h: st(5, 7, 5), g: st(2, 5, 2), G: st(1, 3, 1), n: st(2, 4, 2), k: st(6, 4, 2), f: st(7, 7, 7) }[ch];
    if (c) bottle[y][x] = c;
  }));

  picParts.push(gridPaths(g, PW, PH, PX, PY));
  // glints and foam, colour-cycled on the beat
  const glintPath = (list, color) => `<path fill="${color}" d="${list.map(([x, y, l]) => `M${PX + x} ${PY + y}h${l}v1h${-l}z`).join('')}"/>`;
  for (let i = 0; i < 3; i++) {
    picParts.push(`<g class="cy" style="animation-delay:${n(-i * BEAT)}s">${glintPath(glints[i], st(6, 7, 7))}${glintPath(foam[i], st(7, 7, 7))}</g>`);
  }
  css.push(`.cy{animation:cy ${n(3 * BEAT)}s steps(1,end) infinite}`);
  css.push('@keyframes cy{0%{opacity:1}33.333%{opacity:.35}66.667%{opacity:0}}');

  // raft group
  picParts.push(`<g class="bob">${gridPaths(raft, 24, 6, PX + 3, PY + 77)}</g>`);
  css.push(`.bob{animation:bob ${n(2 * BEAT)}s steps(1,end) infinite}`);
  css.push('@keyframes bob{0%{transform:translateY(0)}50%{transform:translateY(1px)}}');

  // her
  picParts.push(gridPaths(herBody, PW, PH, PX, PY));
  picParts.push(`<g class="nod">${gridPaths(herHead, PW, PH, PX, PY)}</g>`);
  css.push(`.nod{animation:nod ${n(BEAT)}s steps(1,end) infinite}`);
  css.push('@keyframes nod{0%{transform:translateY(1px)}35%{transform:translateY(0)}}');

  // bottle: stepped drift along the waterline, then straight back out
  {
    const startX = PW + 2;
    const shoreX = 96;
    const y = 77;
    const keys = [];
    const STEPS = 96;
    for (let i = 0; i <= STEPS; i++) {
      const t = i / STEPS; // fraction of the 24 s loop
      let x;
      if (t < 0.08) x = startX;
      else if (t < 0.4) x = startX + (shoreX - startX) * ((t - 0.08) / 0.32);
      else if (t < 0.5) x = shoreX;
      else if (t < 0.78) x = shoreX + (startX - shoreX) * ((t - 0.5) / 0.28);
      else x = startX;
      const bobY = Math.round(Math.sin(i * 1.7)) > 0 ? 1 : 0;
      keys.push(`${n(100 * t)}%{transform:translate(${Math.round(x)}px,${bobY}px)}`);
    }
    css.push(`@keyframes bt{${keys.join('')}}`);
    css.push(`.bt{animation:bt ${PIC_LOOP}s steps(1,end) infinite;transform:translate(${shoreX}px,0)}`);
    picParts.push(`<g transform="translate(${PX} ${PY + y})"><g class="bt">${gridPaths(bottle, 7, 4, 0, 0)}</g></g>`);
  }

  body.push(`<g clip-path="url(#cPic)" shape-rendering="crispEdges">${picParts.join('')}</g>`);
}

// ---- the big scroller
{
  const TEXT = 'TEN HOURS, ONE PALM, NO HURRY.     '
    + 'HELLO AND WELCOME TO MENU DISK 1992 FROM THE LEEWARD LOT.     '
    + 'ON THIS DISK: ONE TITLE, AND IT RUNS FOR TEN HOURS.     '
    + 'CASTAWAY, A LO-FI ISLAND VIDEO: ONE YOUNG WOMAN, ONE PALM, ONE RAFT. '
    + 'SHE NODS TO HER HEADPHONES, AND EVERY SO OFTEN SOMETHING HAPPENS.     '
    + 'A BOTTLE WASHES STRAIGHT BACK.  A DRONE DELIVERS MORE HEADPHONES.  A SHARK IN HEADPHONES NODS ALONG.  '
    + 'A COCONUT LANDS ON A HERMIT CRAB, AND THE CRAB WALKS OFF WEARING IT.     '
    + 'MORE THAN 90 ACTIVITIES, FOUR TIMERS, AND EVERY ONE STARTS ON THE NEXT BAR OF THE MUSIC.     '
    + 'EVERY SOUND IS SYNTHESIZED FROM CODE: NO SAMPLES, NO RECORDINGS.     '
    + 'TO LOAD: PYTHON TOOLS/SERVE.PY, THEN 127.0.0.1:8765     '
    + 'OLD MENU DISKS SQUEEZED SEVERAL GAMES ONTO ONE FLOPPY. WE SQUEEZED TEN HOURS ONTO ONE PALM.     '
    + 'SORRY THIS DISK IS LATE: WE WERE WAITING FOR THE KUMARA TO GROW.     '
    + 'LET IT RUN ...          ';
  const glyphs = {};
  const used = new Set(TEXT.replace(/ /g, ''));
  for (const ch of used) {
    if (!FONT[ch]) throw new Error(`scroller font lacks ${JSON.stringify(ch)}`);
    glyphs[ch] = bigGlyph(ch);
  }
  const layout = (str, x0) => {
    const items = [];
    let x = x0;
    for (const ch of str) {
      if (ch === ' ') { x += BIG_SPACE; continue; }
      items.push([ch, x]);
      x += glyphs[ch].w + BIG_GAP;
    }
    return { items, end: x };
  };
  const main = layout(TEXT, 0);
  const L = main.end;
  // repeat the head so the screen is full at the wrap
  let head = '';
  for (const ch of TEXT) { head += ch; if (layout(head, 0).end > W + 40) break; }
  const tail = layout(head, L);
  const all = [...main.items, ...tail.items];
  defs.push(rowGradient('gBig', 0, ramp([[1, [7, 7, 7]], [6, [7, 7, 7]], [10, [7, 6, 7]], [15, [7, 5, 6]], [20, [7, 3, 5]], [25, [6, 2, 4]], [29, [4, 1, 3]]], 32)));
  for (const ch of used) {
    defs.push(`<g id="b${ch.charCodeAt(0)}"><path fill="${st(1, 0, 1)}" d="${glyphs[ch].edge}"/><path fill="url(#gBig)" d="${glyphs[ch].fill}"/></g>`);
  }
  const SPEED = 60; // px per second
  const dur = L / SPEED;
  console.log(`scroller: ${L} px, ${dur.toFixed(1)} s a loop`);
  css.push(`.scr{animation:scr ${n(dur)}s linear infinite}`);
  css.push(`@keyframes scr{from{transform:translateX(0)}to{transform:translateX(-${L}px)}}`);
  defs.push(`<clipPath id="cScr"><rect x="0" y="${SCROLL_TOP}" width="${W}" height="${H - SCROLL_TOP}"/></clipPath>`);
  body.push(`<g clip-path="url(#cScr)"><g transform="translate(6 ${SCROLL_Y})"><g class="scr">${all.map(([ch, x]) => `<use href="#b${ch.charCodeAt(0)}" x="${n(x)}"/>`).join('')}</g></g></g>`);
}

// small glyph defs (after every use has been registered)
for (const ch of [...usedSmall].sort()) {
  const rows = FONT[ch];
  defs.push(`<path id="s${ch.charCodeAt(0)}" d="${cellsToPath((x, y) => rows[y] && rows[y][x] === '#', rows[0].length, rows.length)}"/>`);
}

css.push('@media (prefers-reduced-motion: reduce){.roll,.rollb,.wb,.scr,.cy,.bob,.nod,.bt{animation:none}}');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${W} ${H}" width="${W * 3}" height="${H * 3}" shape-rendering="crispEdges">`
  + '<title>CASTAWAY: menu disk 1992</title>'
  + '<desc>An imaginary Atari ST style menu screen for Castaway, a ten-hour lo-fi island video:'
  + ' a wobbling orange slab logo over rolling red rasters, a dithered picture of a tiny sunny island'
  + ' where she sits nodding by the palm while a bottle drifts in and straight back out, a key list'
  + ' of the project\'s own tools, and a big pink scroller along the bottom.</desc>'
  + `<style>${css.join('')}</style>`
  + `<defs>${defs.join('')}</defs>`
  + `<clipPath id="cAll"><rect width="${W}" height="${H}" rx="6"/></clipPath>`
  + `<g clip-path="url(#cAll)">${body.join('')}</g>`
  + '</svg>\n';

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, svg);
console.log(`wrote ${path.relative(process.cwd(), OUT)} (${(svg.length / 1024).toFixed(1)} KB)`);
