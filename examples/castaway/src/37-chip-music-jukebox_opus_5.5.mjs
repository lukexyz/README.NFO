#!/usr/bin/env node
// Chip-music jukebox: README header generator for CASTAWAY.
//
//   node examples/castaway/src/37-chip-music-jukebox_opus_5.5.mjs
//
// Writes examples/castaway/assets/37-chip-music-jukebox_opus_5.5.svg.
// Plain Node, no dependencies, no clock, no Math.random: the same bytes on
// every run. (The .md beside the assets is hand-written, not generated.)
//
// The style (catalogue entry c64-14) is the late-80s chip-music jukebox
// screen, after the Atari ST music menus of 1988 (the B.I.G. Demo is the
// credited reference; nothing of it is copied): a light grey metal panel with
// the title raised out of the same grey by light and shadow edges, round studs
// filled with a multicolour dither, a sunken track list window ("TOP OF LIST",
// tune name left, running time right, the selected row on a solid red bar, the
// other rows in green and blue), a "hit a key" legend in larger rounded
// lettering, a thin strip of rainbow blocks that cycles, and scrollers running
// on black under the panel. Colours are snapped to the ST's 512-colour palette
// (eight levels a channel: 00 24 49 6d 92 b6 db ff), so ramps band like the
// real thing. All letterforms, sprites and the island are drawn here.
//
// The joke: the jukebox is Castaway's own sound library. Every "tune" is one
// of the project's synthesized sound files (tools/make_audio.py) with its real
// running time from media/audio/audio_catalog.json, most of them well under a
// second, and the last track is the whole video: 10:00:00. A little window
// on the right "plays" each track: the gag that sound belongs to happens on
// the island while the row is selected. The final track plays nothing at all.
//
// Timing: the selection steps one row per bar of the theme (3 s at 80 BPM, the
// grid every gag starts on). 20 rows x 3 s = 60 s, the length of the theme
// loop, so the whole screen loops exactly when the theme would. The counter is
// the theme's position (0:00 to 0:59), the level strip pulses on the beat
// (0.75 s), the rainbow strip cycles once a bar, she nods every beat.
// Scrollers loop on their own: each text is followed by a copy of itself and
// the strip moves by exactly one text width per loop, so the wrap is invisible.
//
// How it is drawn (no <text>, no filters): every static pixel is merged into
// runs of rects and written as one <path> per colour; fonts are <path>
// symbols placed with <use>; motion is CSS @keyframes with step timing.
//
// Facts used, verified read-only on 2026-10-01 and re-measured on 2026-10-02
// in D:/python/castaway: 94 activities in activities.toml (81 on four timers,
// 13 chained; stated as "more than 90"), run 10:00:00 on seed 1992, starts
// snap to 3 s bars; 181 sound files in media/audio/audio_catalog.json (stated
// as "more than 150"), durations below copied from that catalogue (only 4 of
// the 19 listed sounds are under a second, so nothing here says "most");
// theme 60 s, 80 BPM, F major, ii-V-I-vi, 20 bars of 3 s; mix -14 LUFS, true
// peak at or below -1 dBTP. Track 20 is not a sound file: it is the run.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '37-chip-music-jukebox_opus_5.5';
const OUT = path.resolve(here, `../assets/${SLUG}.svg`);

// ------------------------------------------------------------------ canvas
const W = 448; // lowres pixels (16:9), scaled up by the <img>
const H = 252;
const BAR = 3; // seconds per bar of the theme
const BEAT = BAR / 4;
const STEPS = 20; // rows, one per bar
const LOOP = STEPS * BAR; // 60 s, the theme loop

// ------------------------------------------------------------------ palette
// Atari ST: 3 bits per channel.
const C = {
  black: '#000000', white: '#ffffff',
  g7: '#dbdbdb', g6: '#b6b6b6', g5: '#929292', g4: '#6d6d6d', g3: '#494949', g2: '#242424',
  red: '#db0000', red2: '#ff2424', redD: '#920000',
  green: '#49ff49', blue: '#6d92ff', yellow: '#ffdb00', cyan: '#49ffff', amber: '#ffb600',
  ink: '#000092', inkRed: '#b60000',
  // island
  sky0: '#49b6ff', sky1: '#6ddbff', sky2: '#b6ffff', cloud: '#ffffff', cloudS: '#b6dbff',
  sea0: '#0049b6', sea1: '#006ddb', sea2: '#0092db', sea3: '#24b6db', shallow: '#49dbdb', foam: '#ffffff',
  sand: '#ffdb92', sandS: '#dbb66d', sandD: '#b6926d',
  trunk: '#b66d49', trunkD: '#924924', leaf: '#24b624', leafL: '#6ddb24', leafD: '#006d00', nut: '#6d4924',
  hair: '#6d4924', skin: '#ffb692', coral: '#ff6d49', cream: '#ffffdb', creamS: '#dbdbb6',
  log: '#924924', logL: '#b66d49', rope: '#dbb66d',
};

// ----------------------------------------------------------------- helpers
const n = (v) => (Number.isInteger(v) ? String(v) : String(+v.toFixed(3)));
const pct = (t) => `${n((t / LOOP) * 100)}%`;
function mulberry32(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(1992);

// Lit cells -> compact path: horizontal runs, merged down identical rows.
function cellsToPath(isOn, x0, y0, x1, y1) {
  const rects = [];
  let active = new Map();
  for (let y = y0; y < y1; y++) {
    const next = new Map();
    let x = x0;
    while (x < x1) {
      if (!isOn(x, y)) { x++; continue; }
      let e = x;
      while (e < x1 && isOn(e, y)) e++;
      const key = `${x},${e}`;
      const r = active.get(key);
      if (r) { r.h++; next.set(key, r); } else { const nr = { x, y, w: e - x, h: 1 }; rects.push(nr); next.set(key, nr); }
      x = e;
    }
    active = next;
  }
  return rects.map((r) => `M${r.x} ${r.y}h${r.w}v${r.h}h${-r.w}z`).join('');
}

// A sparse pixel canvas: colour per pixel, later writes win.
class Pix {
  constructor() { this.m = new Map(); }
  set(x, y, c) { if (c) this.m.set(`${x},${y}`, c); }
  get(x, y) { return this.m.get(`${x},${y}`); }
  del(x, y) { this.m.delete(`${x},${y}`); }
  rect(x, y, w, h, c) { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, c); }
  // one <path> per colour
  paths(attrs = '') {
    const by = new Map();
    let x0 = Infinity; let y0 = Infinity; let x1 = -Infinity; let y1 = -Infinity;
    for (const [k, c] of this.m) {
      const [x, y] = k.split(',').map(Number);
      if (!by.has(c)) by.set(c, new Set());
      by.get(c).add(k);
      x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x + 1); y1 = Math.max(y1, y + 1);
    }
    let out = '';
    for (const [c, set] of by) out += `<path fill="${c}"${attrs} d="${cellsToPath((x, y) => set.has(`${x},${y}`), x0, y0, x1, y1)}"/>`;
    return out;
  }
}
// Sprite from strings; '.' is transparent.
function sprite(pix, rows, pal, x, y) {
  rows.forEach((r, j) => [...r].forEach((ch, i) => { if (ch !== '.' && ch !== ' ') pix.set(x + i, y + j, pal[ch]); }));
}

// ------------------------------------------------------------ 8 x 8 font
// Drawn for this header: 2 px stems, 1 px bars, round shoulders, 8 px cells.
const F8 = {
  A: ['..###..', '.##.##.', '##...##', '##...##', '#######', '##...##', '##...##'],
  B: ['######.', '##...##', '##...##', '######.', '##...##', '##...##', '######.'],
  C: ['.#####.', '##...##', '##.....', '##.....', '##.....', '##...##', '.#####.'],
  D: ['#####..', '##..##.', '##...##', '##...##', '##...##', '##..##.', '#####..'],
  E: ['#######', '##.....', '##.....', '######.', '##.....', '##.....', '#######'],
  F: ['#######', '##.....', '##.....', '######.', '##.....', '##.....', '##.....'],
  G: ['.#####.', '##...##', '##.....', '##.####', '##...##', '##...##', '.######'],
  H: ['##...##', '##...##', '##...##', '#######', '##...##', '##...##', '##...##'],
  I: ['.####.', '..##..', '..##..', '..##..', '..##..', '..##..', '.####.'],
  J: ['...####', '.....##', '.....##', '.....##', '##...##', '##...##', '.#####.'],
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
  X: ['##...##', '.##.##.', '..###..', '..###..', '..###..', '.##.##.', '##...##'],
  Y: ['##..##', '##..##', '##..##', '.####.', '..##..', '..##..', '..##..'],
  Z: ['#######', '....##.', '...##..', '..##...', '.##....', '##.....', '#######'],
  0: ['.#####.', '##..###', '##.#.##', '##.#.##', '##.#.##', '###..##', '.#####.'],
  1: ['..##..', '.###..', '..##..', '..##..', '..##..', '..##..', '.####.'],
  2: ['.#####.', '##...##', '.....##', '...###.', '.##....', '##.....', '#######'],
  3: ['.#####.', '##...##', '.....##', '..####.', '.....##', '##...##', '.#####.'],
  4: ['....##.', '...###.', '..####.', '.##.##.', '#######', '....##.', '....##.'],
  5: ['#######', '##.....', '######.', '.....##', '.....##', '##...##', '.#####.'],
  6: ['..####.', '.##....', '##.....', '######.', '##...##', '##...##', '.#####.'],
  7: ['#######', '.....##', '....##.', '...##..', '..##...', '..##...', '..##...'],
  8: ['.#####.', '##...##', '##...##', '.#####.', '##...##', '##...##', '.#####.'],
  9: ['.#####.', '##...##', '##...##', '.######', '.....##', '....##.', '.####..'],
  '.': ['..', '..', '..', '..', '..', '##', '##'],
  ',': ['..', '..', '..', '..', '..', '##', '##', '#.'],
  ':': ['..', '##', '##', '..', '..', '##', '##'],
  '-': ['.....', '.....', '.....', '#####', '.....', '.....', '.....'],
  "'": ['##', '##', '#.', '..', '..', '..', '..'],
  '!': ['##', '##', '##', '##', '##', '..', '##'],
  '?': ['.#####.', '##...##', '....##.', '...##..', '...##..', '.......', '...##..'],
  '/': ['.....##', '....##.', '...##..', '..##...', '.##....', '##.....', '#......'],
  '(': ['..##', '.##.', '##..', '##..', '##..', '.##.', '..##'],
  ')': ['##..', '.##.', '..##', '..##', '..##', '.##.', '##..'],
  '+': ['......', '..##..', '..##..', '######', '..##..', '..##..', '......'],
  '>': ['##....', '####..', '######', '#######', '######', '####..', '##....'],
  '*': ['.......', '.##.##.', '..###..', '#######', '..###..', '.##.##.', '.......'],
  '=': ['......', '......', '######', '......', '######', '......', '......'],
  '&': ['.###...', '##.##..', '.###...', '.###.##', '##.###.', '##..##.', '.###.##'],
  '_': ['.......', '.......', '.......', '.......', '.......', '.......', '#######'],
  '~': ['.......', '.......', '.##...#', '#..#..#', '#...##.', '.......', '.......'],
};
const gid = (ch) => ch.codePointAt(0).toString(36);
function f8Bitmap(ch) {
  const g = F8[ch];
  if (!g) throw new Error(`8x8 font lacks ${JSON.stringify(ch)}`);
  const w = g[0].length;
  const ox = Math.floor((7 - w) / 2);
  const cells = new Set();
  g.forEach((row, y) => [...row].forEach((c, x) => { if (c === '#') cells.add(`${x + ox},${y}`); }));
  return cells;
}
// Scale2x (EPX) on a binary cell set: doubles it, rounding steps.
function scale2x(cells, w, h) {
  const on = (x, y) => cells.has(`${x},${y}`);
  const out = new Set();
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const P = on(x, y); const A = on(x, y - 1); const B = on(x + 1, y); const Cc = on(x - 1, y); const D = on(x, y + 1);
    const put = (dx, dy, v) => { if (v) out.add(`${2 * x + dx},${2 * y + dy}`); };
    put(0, 0, Cc === A && Cc !== D && A !== B ? A : P);
    put(1, 0, A === B && A !== Cc && B !== D ? B : P);
    put(0, 1, D === Cc && D !== B && Cc !== A ? Cc : P);
    put(1, 1, B === D && B !== A && D !== Cc ? D : P);
  }
  return out;
}

// Which glyphs are used where, collected while building, emitted as defs.
const usedSmall = new Set();
const usedBig = new Set();
// <use> run for a string; x, y in user units; one cell = adv px.
function uses(str, x, y, { big = false } = {}) {
  const adv = big ? 16 : 8;
  let s = '';
  [...str].forEach((ch, i) => {
    if (ch === ' ') return;
    if (!F8[ch]) throw new Error(`font lacks ${JSON.stringify(ch)} in "${str}"`);
    (big ? usedBig : usedSmall).add(ch);
    s += `<use href="#${big ? 'B' : 'a'}${gid(ch)}" x="${x + i * adv}"${y ? ` y="${y}"` : ''}/>`;
  });
  return s;
}
// Static text straight into a pixel canvas.
function f8Draw(pix, str, x, y, col) {
  [...str].forEach((ch, i) => {
    if (ch === ' ') return;
    for (const k of f8Bitmap(ch)) { const [cx, cy] = k.split(',').map(Number); pix.set(x + i * 8 + cx, y + cy, col); }
  });
}

// --------------------------------------------- legend font (rounded, 10 px)
// A 4 x 5 face, smoothed with Scale2x: the "larger rounded lettering".
const F5 = {
  A: ['.##.', '#..#', '####', '#..#', '#..#'], B: ['###.', '#..#', '###.', '#..#', '###.'],
  C: ['.###', '#...', '#...', '#...', '.###'], D: ['###.', '#..#', '#..#', '#..#', '###.'],
  E: ['####', '#...', '###.', '#...', '####'], F: ['####', '#...', '###.', '#...', '#...'],
  G: ['.###', '#...', '#.##', '#..#', '.###'], H: ['#..#', '#..#', '####', '#..#', '#..#'],
  I: ['###', '.#.', '.#.', '.#.', '###'], K: ['#..#', '#.#.', '##..', '#.#.', '#..#'],
  L: ['#...', '#...', '#...', '#...', '####'], M: ['#...#', '##.##', '#.#.#', '#...#', '#...#'],
  N: ['#..#', '##.#', '#.##', '#..#', '#..#'], O: ['.##.', '#..#', '#..#', '#..#', '.##.'],
  P: ['###.', '#..#', '###.', '#...', '#...'], R: ['###.', '#..#', '###.', '#.#.', '#..#'],
  S: ['.###', '#...', '.##.', '...#', '###.'], T: ['###', '.#.', '.#.', '.#.', '.#.'],
  U: ['#..#', '#..#', '#..#', '#..#', '.##.'], V: ['#...#', '#...#', '.#.#.', '.#.#.', '..#..'],
  W: ['#...#', '#...#', '#.#.#', '##.##', '#...#'], Y: ['#.#', '#.#', '.#.', '.#.', '.#.'],
  0: ['.##.', '#..#', '#..#', '#..#', '.##.'], 1: ['.#', '##', '.#', '.#', '.#'],
  2: ['###.', '...#', '.##.', '#...', '####'], 3: ['###.', '...#', '.##.', '...#', '###.'],
  '.': ['.', '.', '.', '.', '#'], '-': ['...', '...', '###', '...', '...'],
};
function f5Draw(pix, str, x, y, colOf) {
  let cx = x;
  [...str].forEach((ch, i) => {
    if (ch === ' ') { cx += 6; return; }
    const g = F5[ch];
    if (!g) throw new Error(`legend font lacks ${JSON.stringify(ch)}`);
    const cells = new Set();
    g.forEach((row, yy) => [...row].forEach((c, xx) => { if (c === '#') cells.add(`${xx},${yy}`); }));
    const big = scale2x(cells, g[0].length, 5);
    const col = colOf(i);
    for (const k of big) { const [px, py] = k.split(',').map(Number); pix.set(cx + px, y + py, col); }
    cx += g[0].length * 2 + 2;
  });
  return cx - 2;
}
function f5Width(str) {
  let w = 0;
  for (const ch of str) w += ch === ' ' ? 6 : F5[ch][0].length * 2 + 2;
  return w - 2;
}

// ------------------------------------------------------- title letters
// Block capitals on a 10 x 14 cell grid (W is 13 wide, T 9), each cell 4 x 3
// pixels: wide, chamfered, 12 px stems. Raised out of the panel by emboss().
const TL = {
  C: ['..########', '.#########', '##########', '###.......', '###.......', '###.......', '###.......',
    '###.......', '###.......', '###.......', '###.......', '##########', '.#########', '..########'],
  A: ['..######..', '.########.', '##########', '###....###', '###....###', '###....###', '##########',
    '##########', '##########', '###....###', '###....###', '###....###', '###....###', '###....###'],
  S: ['..########', '.#########', '##########', '###.......', '###.......', '##########', '##########',
    '.#########', '.......###', '.......###', '.......###', '##########', '#########.', '########..'],
  T: ['#########', '#########', '#########', '...###...', '...###...', '...###...', '...###...',
    '...###...', '...###...', '...###...', '...###...', '...###...', '...###...', '...###...'],
  W: ['###.....###', '###.....###', '###.....###', '###.....###', '###.....###', '###.###.###', '###.###.###',
    '###.###.###', '###.###.###', '###.###.###', '###.###.###', '###########', '.#########.', '..#######..'],
  Y: ['###....###', '###....###', '###....###', '###....###', '##########', '.########.', '..######..',
    '...####...', '...####...', '...####...', '...####...', '...####...', '...####...', '...####...'],
};
const CW = 4; const CH = 3; // cell size in pixels
const TGAP = 7;
function titleShape(word, x0, y0) {
  const cells = new Set();
  let x = x0;
  for (const ch of word) {
    const g = TL[ch];
    g.forEach((row, r) => [...row].forEach((c, k) => {
      if (c !== '#') return;
      for (let j = 0; j < CH; j++) for (let i = 0; i < CW; i++) cells.add(`${x + k * CW + i},${y0 + r * CH + j}`);
    }));
    x += g[0].length * CW + TGAP;
  }
  return { cells, width: x - TGAP - x0 };
}
const titleWidth = (word) => [...word].reduce((s, ch) => s + TL[ch][0].length * CW + TGAP, -TGAP);

// Raised emboss: light on the top/left edges, shadow on the bottom/right,
// a face of the panel's own grey, and a cast shadow on the plate.
function emboss(pix, cells, { hi = [C.white, C.g7], lo = [C.g3, C.g4], face = C.g6, cast = C.g4 } = {}) {
  const on = (x, y) => cells.has(`${x},${y}`);
  for (const k of cells) {
    const [x, y] = k.split(',').map(Number);
    let dl = 9; let dd = 9;
    for (let d = 2; d >= 1; d--) {
      if (!on(x - d, y) || !on(x, y - d) || !on(x - d, y - d)) dl = d;
      if (!on(x + d, y) || !on(x, y + d) || !on(x + d, y + d)) dd = d;
    }
    let c = face;
    if (dl <= 2 || dd <= 2) c = dl < dd ? hi[dl - 1] : dd < dl ? lo[dd - 1] : (dl === 1 ? C.g5 : face);
    pix.set(x, y, c);
  }
  for (const k of cells) {
    const [x, y] = k.split(',').map(Number);
    for (const [dx, dy] of [[1, 1], [2, 2], [1, 2], [2, 1]]) if (!on(x + dx, y + dy) && !pix.get(x + dx, y + dy)) pix.set(x + dx, y + dy, cast);
  }
}

// Bevelled rectangle: raised (light top-left) or sunken (dark top-left).
function bevel(pix, x, y, w, h, sunken, width = 2) {
  const tl = sunken ? [C.g3, C.g4] : [C.white, C.g7];
  const br = sunken ? [C.white, C.g7] : [C.g3, C.g4];
  for (let d = 0; d < width; d++) {
    for (let i = x + d; i < x + w - d; i++) { pix.set(i, y + d, tl[d]); pix.set(i, y + h - 1 - d, br[d]); }
    for (let j = y + d; j < y + h - d; j++) { pix.set(x + d, j, tl[d]); pix.set(x + w - 1 - d, j, br[d]); }
    pix.set(x + w - 1 - d, y + d, C.g5); pix.set(x + d, y + h - 1 - d, C.g5);
  }
}

// Stud: a sunken round socket filled with a multicolour ordered dither.
const BAYER = [[0.125, 0.625], [0.875, 0.375]];
const STUD_RAMP = ['#ff2424', '#ff6d00', '#ffb600', '#ffff24', '#92ff00', '#00db49', '#00dbdb', '#2492ff', '#4949ff', '#b649ff'];
function stud(pix, cx, cy, r = 6, phase = 0) {
  for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) {
    const d = Math.hypot(x + 0.5 - 0.5, y);
    const dd = Math.hypot(x, y);
    if (dd > r + 0.3) continue;
    const px = cx + x; const py = cy + y;
    if (dd > r - 1.1) { pix.set(px, py, x + y < 0 ? C.g3 : C.white); continue; }
    if (dd > r - 2.1) { pix.set(px, py, x + y < 0 ? C.g4 : C.g7); continue; }
    // diagonal rainbow bands, ordered-dithered (2 x 2 Bayer) into each other
    const t = ((x + y + 2 * r) / (4 * r)) * (STUD_RAMP.length - 1) + phase;
    const i0 = Math.floor(t); const f = t - i0;
    const pick = f > BAYER[py & 1][px & 1] ? i0 + 1 : i0;
    pix.set(px, py, STUD_RAMP[((pick % STUD_RAMP.length) + STUD_RAMP.length) % STUD_RAMP.length]);
    void d;
  }
  // a glint
  pix.set(cx - 2, cy - 2, C.white); pix.set(cx - 1, cy - 2, C.white); pix.set(cx - 2, cy - 1, C.white);
}

// ------------------------------------------------------------- the tracks
// [sound, running time, what the little window shows meanwhile]
// Running times are the catalogue's, rounded to tenths.
const TRACKS = [
  ['ISLAND THEME (LOOP)', '1:00.0', '80 BPM, F MAJOR, II-V-I-VI'],
  ['OCEAN, GENTLY (LOOP)', '1:00.0', 'SEAMLESS. NO SEA WAS RECORDED.'],
  ['CORK, SQUEAKED IN', '0:00.7', 'MESSAGE IN A BOTTLE: OUTBOUND'],
  ['GLASS ON SAND', '0:00.6', '...AND STRAIGHT BACK. INBOUND.'],
  ['DRONE, ARRIVING', '0:05.0', 'PARCEL CONTAINS: HEADPHONES'],
  ['TURTLE ON SAND (LOOP)', '0:04.0', 'A VISITOR. IN NO HURRY.'],
  ['PHONE FINDS ONE BAR', '0:01.4', 'TOP OF THE PALM: ONE BAR!'],
  ['CAT PURR (LOOP)', '0:07.2', 'GREY TABBY. ARRIVED BY CRATE.'],
  ['SHARK SURFACES', '0:02.4', 'SHARK. HEADPHONES. NODDING.'],
  ['SELFIE SHUTTERS', '0:03.2', 'TOUR BOAT. SELFIES. NO LIFT.'],
  ['COCONUT ON CRAB', '0:00.6', 'DIRECT HIT. THE CRAB IS FINE.'],
  ['CRAB SCUTTLE (LOOP)', '0:03.0', 'THE COCONUT WALKS OFF.'],
  ['FOOTSTEPS ON WATER', '0:00.3', 'SHE COULD LEAVE ANY TIME.'],
  ['ICE RATTLE AND SLURP', '0:01.8', '...BACK WITH AN ICED COFFEE.'],
  ['E-FOIL WHINE (LOOP)', '0:04.0', 'HYDROFOIL BRO. SHAKA. GONE.'],
  ['BOW DRILL (LOOP)', '0:03.0', 'FIRE BY FRICTION. ARMS SHAKE.'],
  ['DIGGING SAND (LOOP)', '0:03.0', 'KUMARA IN. GROWS ALL VIDEO.'],
  ['WAVE WASH', '0:05.0', 'SANDCASTLE, REVIEWED BY TIDE.'],
  ['SHIP HORN, FAR OFF', '0:06.8', 'SHE WAVED. IT TOOTED. IT LEFT.'],
  ['THE WHOLE VIDEO', '10:00:00', 'NOTHING HAPPENS. ON PURPOSE.'],
];
if (TRACKS.length !== STEPS) throw new Error('one track per bar');
const COLS = 33;
function rowText(i) {
  const [name, time] = TRACKS[i];
  const num = String(i + 1).padStart(2, '0');
  if (name.length > 21) throw new Error(`name too long: ${name}`);
  return `${num} ${name}`.padEnd(COLS - time.length) + time;
}

// ---------------------------------------------------------------- layout
const PX = 6; const PY = 6; const PW = W - 12; const PH = 196; // panel
const TITLE = 'CASTAWAY';
const TY = 13; // title top
const SUB_Y = 62; // engraved subtitle
const LW = { x: 14, y: 72, w: 284, h: 70 }; // list window (outer, incl. bevel)
const SW = { x: 304, y: 72, w: 130, h: 70 }; // scene window
const ROW0 = LW.y + 5; // first visible row top
const PITCH = 12;
const VIS = 5;
const TX = LW.x + 6; // list text x
const NP = { x: 14, y: 147, w: 420, h: 14 }; // now-playing strip
const LEG_Y = 166; // legend top (10 px)
const RB_Y = 182; // rainbow strip
const BIG_Y = 210; // big scroller
const SMALL_Y = 236; // small scroller

// ================================================================= PANEL
const P = new Pix();
bevel(P, PX, PY, PW, PH, false, 2);
// fine horizontal brushing on the plate (every 4th row, very light)
// studs
const STUDS = [[PX + 13, PY + 13], [PX + PW - 14, PY + 13], [PX + 13, PY + PH - 14], [PX + PW - 14, PY + PH - 14]];
STUDS.forEach(([x, y], i) => stud(P, x, y, 7, i * 2.5));
// title
const tw = titleWidth(TITLE);
const { cells: tcells } = titleShape(TITLE, Math.round((W - tw) / 2), TY);
emboss(P, tcells);
// engraved subtitle: dark letters with a white lower-right edge
const SUB = 'PERFORMED BY CODE  *  RECORDED: NEVER';
const subX = Math.round((W - SUB.length * 8) / 2);
{
  const tmp = new Pix();
  f8Draw(tmp, SUB, subX + 1, SUB_Y + 1, C.white);
  for (const [k, c] of tmp.m) P.m.set(k, c);
  const ink = new Pix();
  f8Draw(ink, SUB, subX, SUB_Y, C.g3);
  for (const [k, c] of ink.m) P.m.set(k, c);
}
// windows
bevel(P, LW.x, LW.y, LW.w, LW.h, true);
bevel(P, SW.x, SW.y, SW.w, SW.h, true);
bevel(P, NP.x, NP.y, NP.w, NP.h, true);
// legend: blue lettering, the keys in red, printed with a light edge
const LEG_A = 'HIT 1...20 FOR A SOUND';
const LEG_B = 'HIT W TO WAIT TEN HOURS';
const legGap = 22;
const legW = f5Width(LEG_A) + legGap + f5Width(LEG_B);
{
  const lx = Math.round((W - legW) / 2);
  const keyA = new Set([4, 5, 6, 7, 8, 9]);
  const keyB = new Set([4]);
  const edge = new Pix();
  f5Draw(edge, LEG_A, lx + 1, LEG_Y + 1, () => C.white);
  f5Draw(edge, LEG_B, lx + f5Width(LEG_A) + legGap + 1, LEG_Y + 1, () => C.white);
  for (const [k, c] of edge.m) P.m.set(k, c);
  const ink = new Pix();
  f5Draw(ink, LEG_A, lx, LEG_Y, (i) => (keyA.has(i) ? C.inkRed : C.ink));
  f5Draw(ink, LEG_B, lx + f5Width(LEG_A) + legGap, LEG_Y, (i) => (keyB.has(i) ? C.inkRed : C.ink));
  for (const [k, c] of ink.m) P.m.set(k, c);
}
// rainbow strip socket
const RB = { x: 30, w: W - 60, h: 4 };
bevel(P, RB.x - 1, RB_Y - 1, RB.w + 2, RB.h + 2, true, 1);

// ================================================================= SCENE
// Inner scene coordinates: (0,0) is the window's inner top-left.
const S0 = { x: SW.x + 2, y: SW.y + 2 };
const SWI = SW.w - 4; const SHI = SW.h - 4; // 126 x 66
const HOR = 27; // horizon row
const sceneBase = new Pix(); // sky, sea, sand
const palmPix = new Pix(); // the palm and its scrub, drawn over far-off things
let SCN = sceneBase;
const sset = (x, y, c) => { if (x >= 0 && y >= 0 && x < SWI && y < SHI) SCN.set(S0.x + x, S0.y + y, c); };
// banded sky and sea with a one-row checker dither at each seam
const BANDS = [[0, C.sky0], [9, C.sky1], [19, C.sky2], [HOR, C.sea0], [31, C.sea1], [39, C.sea2], [50, C.sea3]];
for (let y = 0; y < SHI; y++) {
  let b = 0;
  while (b < BANDS.length - 1 && y >= BANDS[b + 1][0]) b++;
  for (let x = 0; x < SWI; x++) {
    let c = BANDS[b][1];
    if (b + 1 < BANDS.length && y === BANDS[b + 1][0] - 1 && b + 1 !== 3 && (x + y) % 2 === 0) c = BANDS[b + 1][1];
    sset(x, y, c);
  }
}
// shallows, island, foam
const IS = { cx: 50, cy: 51, rx: 27, ry: 6 };
for (let y = 38; y < SHI; y++) for (let x = 0; x < SWI; x++) {
  const e = ((x + 0.5 - IS.cx) / (IS.rx + 9)) ** 2 + ((y + 0.5 - IS.cy) / (IS.ry + 5)) ** 2;
  if (e <= 1) sset(x, y, (e > 0.82 && (x + y) % 2) ? C.sea3 : C.shallow);
}
const inIsland = (x, y) => ((x + 0.5 - IS.cx) / IS.rx) ** 2 + ((y + 0.5 - IS.cy) / IS.ry) ** 2 <= 1;
for (let y = 40; y < SHI; y++) for (let x = 0; x < SWI; x++) {
  if (!inIsland(x, y)) continue;
  const below = !inIsland(x, y + 1); const below2 = !inIsland(x, y + 2);
  sset(x, y, below ? C.sandD : below2 ? C.sandS : C.sand);
}
// sand speckle
for (let i = 0; i < 18; i++) {
  const x = Math.floor(IS.cx - IS.rx + rand() * IS.rx * 2); const y = Math.floor(IS.cy - IS.ry + rand() * IS.ry * 2);
  if (inIsland(x, y) && inIsland(x, y + 2)) sset(x, y, C.sandS);
}
// two little rocks
sprite({ set: (x, y, c) => sset(x, y, c) }, ['.gg.', 'gGGg'], { g: C.g5, G: C.g4 }, 30, 54);
sprite({ set: (x, y, c) => sset(x, y, c) }, ['.g.', 'gGg'], { g: C.g5, G: C.g4 }, 63, 56);
SCN = palmPix;
// green scrub at the palm's foot
for (const [x, y, c] of [[58, 45, C.leaf], [59, 44, C.leafL], [60, 45, C.leaf], [61, 44, C.leaf], [62, 45, C.leafD], [70, 46, C.leaf], [71, 45, C.leafL], [72, 46, C.leaf], [73, 45, C.leafD], [57, 46, C.leafD], [74, 46, C.leafD]]) sset(x, y, c);
// the palm: tall, slender, segmented, leaning a little right
const BASE = { x: 66, y: 47 };
const TOP = { x: 75, y: 9 };
const trunkPts = [];
for (let y = BASE.y; y >= TOP.y; y--) {
  const t = (BASE.y - y) / (BASE.y - TOP.y);
  trunkPts.push([Math.round(BASE.x + (TOP.x - BASE.x) * t ** 1.6), y]);
}
trunkPts.forEach(([x, y], i) => {
  const ring = Math.floor(i / 2) % 2 === 0;
  const w = i < 4 ? 3 : 2;
  for (let k = 0; k < w; k++) sset(x + k - (w === 3 ? 1 : 0), y, k === w - 1 ? C.trunkD : ring ? C.trunk : C.trunkD);
  if (!ring) sset(x, y, C.trunk);
});
// crown: fronds as droopy polylines from the top
const CROWN = { x: TOP.x + 1, y: TOP.y };
const FRONDS = [
  [[-1, 0], [-6, -2], [-11, -1], [-15, 2], [-17, 5]],
  [[-1, 0], [-5, 1], [-9, 4], [-11, 8]],
  [[0, 0], [-2, -4], [-5, -6], [-8, -6]],
  [[1, 0], [3, -4], [7, -6], [10, -5]],
  [[1, 0], [6, -2], [11, -1], [15, 2], [17, 6]],
  [[1, 0], [5, 2], [8, 5], [9, 9]],
];
function line(x0, y0, x1, y1, f) {
  const dx = Math.abs(x1 - x0); const dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1; const sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  for (;;) {
    f(x0, y0);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) { err += dy; x0 += sx; }
    if (e2 <= dx) { err += dx; y0 += sy; }
  }
}
FRONDS.forEach((pts) => {
  // rib in light green, a dark underside, and leaflets hanging off it
  const along = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, ay] = pts[i]; const [bx, by] = pts[i + 1];
    line(CROWN.x + ax, CROWN.y + ay, CROWN.x + bx, CROWN.y + by, (x, y) => {
      if (!along.length || along[along.length - 1][0] !== x || along[along.length - 1][1] !== y) along.push([x, y]);
    });
  }
  along.forEach(([x, y], j) => {
    const t = j / along.length;
    if (t < 0.85) { sset(x, y + 1, C.leaf); if (j % 2 === 0) sset(x, y + 2, C.leafD); }
    if (t < 0.6 && j % 3 !== 1) sset(x, y + 3, C.leafD);
    sset(x, y, t < 0.5 ? C.leafL : C.leaf);
  });
});
for (const [dx, dy, c] of [[-1, -1, C.leafL], [0, -1, C.leafL], [1, -1, C.leaf], [-1, 0, C.leaf], [0, 0, C.leafL], [1, 0, C.leaf], [2, 0, C.leafD], [-1, 1, C.leafD], [0, 1, C.leaf], [1, 1, C.leafD]]) sset(CROWN.x + dx, CROWN.y + dy, c);
sset(CROWN.x - 1, CROWN.y + 2, C.nut); sset(CROWN.x, CROWN.y + 2, C.nut); sset(CROWN.x + 1, CROWN.y + 3, C.nut);
// cloud
function cloud(pix, x, y, w) {
  for (let j = 0; j < 6; j++) for (let i = 0; i < w; i++) {
    const bumps = Math.sin((i / w) * Math.PI * 3) * 1.4 + 3.2;
    const top = 5 - Math.min(5, Math.round(bumps * Math.sin((i / (w - 1)) * Math.PI)));
    if (j < top) continue;
    pix.set(x + i, y + j, j === 5 ? C.cloudS : C.cloud);
  }
}
// raft, off the right of the island
const RAFT = new Pix();
sprite(RAFT, [
  '.rLLLLLLLLLLLLLLLLr.',
  'llllllllllllllllllll',
  'LrLLLLLLLLLLLLLLLrLL',
  '.llllllllllllllllll.',
], { L: C.logL, l: C.log, r: C.rope }, S0.x + 92, S0.y + 52);

// ----------------------------------------------------------- her sprites
// Small and simple: brown hair in a low bun, cream headphones, coral tank
// top, cream shorts, bare feet. Sitting cross-legged, facing us.
const OUTLINE = '#492424';
// A 1 px outline round everything in a canvas (4-neighbours), so small
// sprites hold up against sand and sea.
function outlined(p, col = OUTLINE) {
  const add = [];
  for (const k of p.m.keys()) {
    const [x, y] = k.split(',').map(Number);
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (!p.get(x + dx, y + dy)) add.push([x + dx, y + dy]);
  }
  for (const [x, y] of add) p.set(x, y, col);
  return p;
}
const HER_PAL = { k: '#492424', h: C.hair, H: '#924924', s: C.skin, S: '#db926d', c: C.coral, C: '#db4924', w: C.cream, W: C.creamS, f: C.skin };
const HER_HEAD = [
  '...hhh...',
  '..WhhhW..',
  '.WhhhhhW.',
  'wwhkskhww',
  'wWhssshWw',
  '..hsssHh.',
];
const HER_BODY = [
  '...sss...',
  '.sscccss.',
  'sscccccss',
  's.ccccC.s',
  '.wwwwwww.',
  'swwwWwwws',
  'sssSsSsss',
  '.ff...ff.',
];
const HER_X = 38; const HER_Y = 34; // scene coords of the sprite's top-left
const HEAD_H = HER_HEAD.length;
function herPix(variant) {
  const p = new Pix();
  const at = (sx, sy) => [S0.x + HER_X + sx, S0.y + HER_Y + sy];
  sprite(p, HER_BODY, HER_PAL, ...at(0, HEAD_H));
  if (variant === 'wave') {
    // right arm up, waving for rescue
    for (let j = HEAD_H + 1; j < HEAD_H + 4; j++) p.del(...at(8, j));
    sprite(p, ['..s', '.ss', '.s.', 's..', 's..', 's..'], { s: C.skin }, ...at(8, HEAD_H - 5));
  }
  if (variant === 'coffee') {
    // iced coffee held in both hands: straw, lid, cup
    sprite(p, ['..k', '.k.', 'ww.', 'bb.', 'bb.'], { k: C.white, w: C.white, b: '#b6926d' }, ...at(8, HEAD_H));
  }
  return outlined(p);
}
const headPix = () => { const p = new Pix(); sprite(p, HER_HEAD, HER_PAL, S0.x + HER_X, S0.y + HER_Y); return outlined(p); };

// ------------------------------------------------------------ the gags
// Each lives in the window while its track is selected (step i = row i+1).
const EV = []; // { step, from, to, svg }
const at = (x, y) => [S0.x + x, S0.y + y];
function ev(step, body, opts = {}) { EV.push({ step, body, ...opts }); }
function pixOf(rows, pal, x, y, line) { const p = new Pix(); sprite(p, rows, pal, ...at(x, y)); if (line) outlined(p, line); return p.paths(); }

// 2, 3: the bottle goes out, the bottle comes back
const BOTTLE_PAL = { g: '#24b649', G: '#6ddb92', c: '#b6926d', p: C.white };
ev(2, pixOf(['.c.', 'gGg', 'gGg', 'gpg', 'ggg'], BOTTLE_PAL, 14, 37, '#002449'), { bob: true });
ev(3, pixOf(['ggggGc', 'gpgggc'], BOTTLE_PAL, 27, 51, OUTLINE));
// 4: delivery drone, lowering a parcel of headphones
ev(4, pixOf([
  'GG.....GG',
  '.g.ggg.g.',
  '..ggggg..',
  '....r....',
  '...bbb...',
  '...bBb...',
], { G: C.g7, g: C.g4, r: C.g3, b: '#b6926d', B: '#dbb66d' }, 37, 4), { drop: 9 });
// 5: sea turtle, crawling ashore
ev(5, pixOf([
  '..ggg...',
  '.gGgGg.s',
  'gGgGgGss',
  '.s....s.',
], { g: '#246d24', G: '#49b649', s: '#92b66d' }, 12, 48, OUTLINE), { walk: 8, stride: 2 });
// 6: up the palm, one bar of signal
ev(6, `<g class="blink">${pixOf([
  '.........gg',
  '.........gg',
  '......gg.gg',
  '......gg.gg',
  '...gg.gg.gg',
  '...gg.gg.gg',
  'WW.gg.gg.gg',
  'WW.gg.gg.gg',
], { W: C.white, g: '#6d92b6' }, 85, 1, OUTLINE)}</g>` + pixOf([
  '.hh.',
  'whhw',
  '.ss.',
  'scc.',
  '.cc.',
  '.ww.',
  '.s..',
], HER_PAL, 70, 11, OUTLINE));
// 7: grey tabby on a crate, bobbing by the shore
ev(7, pixOf([
  'g...g..',
  'gg.gg..',
  'gGgGg..',
  'gwwgg.g',
  '.wwggg.',
  '.ggggg.',
  'bbbbbbbb',
  'bBBbBBBb',
  'bbbbbbbb',
], { g: C.g5, G: C.g3, w: C.white, b: '#924924', B: '#b66d49' }, 10, 42, OUTLINE), { bob: true });
// 8: the shark surfaces facing us, in headphones, nodding on the beat:
// dorsal fin up through the headband, cream cups, a toothy grin, a waterline
ev(8, pixOf([
  '.....G.....',
  '....GGg....',
  '...bbbbb...',
  '..bgggggb..',
  '.ccgkgkgcc.',
  '.ccgggggcc.',
  '.cckWkWkcc.',
  '...ggggg...',
], { G: C.g4, g: C.g5, b: C.creamS, c: C.cream, k: C.black, W: C.white }, 100, 29, '#002449')
  + pixOf(['.fffffffff.', 'f.f.....f.f'], { f: C.foam }, 100, 37), { nod: true });
// 9: tour boat, everyone facing the other way, phones out
ev(9, pixOf([
  '....w.......',
  '...wwwww....',
  '...wbbbw....',
  '.hhhshhhs...',
  'wwwwwwwwwwww',
  '.rrrrrrrrrr.',
  '..wwwwwwww..',
], { w: C.white, b: '#2449b6', h: '#6d4924', s: '#ffb692', r: C.red }, 4, 28) + `<g class="flash">${pixOf(['p.....p'], { p: '#ffff92' }, 5, 30)}</g>`, { far: true });
// 10: a coconut lands on a hermit crab
ev(10, pixOf([
  '.y.y.',
  '..y..',
  '.....',
  '.nnn.',
  'nNnnn',
  '.nnn.',
], { y: '#ffff24', n: C.nut, N: '#924924' }, 30, 45));
// 11: ...and walks off, with the crab under it
ev(11, pixOf([
  '.nnn.',
  'nNnnn',
  '.nnn.',
  'o.o.o',
], { n: C.nut, N: '#924924', o: '#ff4900' }, 30, 48), { walk: -12, stride: 1 });
// 12: she could leave any time: walking out over the water
ev(12, pixOf([
  '.hh.',
  'whhw',
  '.ss.',
  'cccc',
  'scc.',
  '.cc.',
  '.ww.',
  '.ww.',
  '.ss.',
  '.s.s',
  'ffff',
], { ...HER_PAL, f: C.foam }, 16, 45, OUTLINE), { walk: -10, stride: 2 });
// 14: a bro on an electric hydrofoil carves past, shaka up
ev(14, pixOf([
  's......',
  's.hh...',
  '.sss...',
  '..tt...',
  '.tttt..',
  '..nn...',
  '.n..n..',
  'wwwwwww',
  '...k...',
  'ff.k.ff',
], { s: '#ffb692', h: '#242424', t: '#00b6b6', n: '#002492', w: C.white, k: C.g3, f: C.foam }, -10, 27, OUTLINE), { walk: 140, stride: 4, far: true });
// 15: fire by friction
ev(15, `<g class="fire">${pixOf(['.y.', 'yoy', 'oro', 'kkk'], { y: '#ffff24', o: '#ff9200', r: '#ff2400', k: '#6d4924' }, 54, 47)}</g>`
  + `<g class="fire2">${pixOf(['y..', '.yo', 'oyo', 'kkk'], { y: '#ffff24', o: '#ff9200', r: '#ff2400', k: '#6d4924' }, 54, 47)}</g>`
  + pixOf(['.g', 'g.', '.g'], { g: C.g6 }, 55, 42));
// 16: a kumara goes in on open sand between her and the palm, and the bar
// runs as a time-lapse: dug (sand flying), sprouted, then leafy with one pale
// lavender flower (the project's own kumara leafs, then flowers, hours apart)
const KUM = { l: C.leafD, L: C.leafL, g: C.leaf, d: C.sandD, D: '#926d49', s: C.sandS, v: '#db92ff', V: '#ffdbff' };
ev(16, pixOf(['s....s', '.s..s.', '......', '......', '.dDDd.', 'dDDDDd'], KUM, 52, 47), { until: 1, bob: true });
ev(16, pixOf(['..L...', '.LgL..', '..g...', '..g...', '.dDDd.', 'dDDDDd'], KUM, 52, 47), { from: 1, until: 2 });
ev(16, pixOf(['.V..L.', 'vLg.gL', 'lgLgl.', '.lgLg.', '.dDDd.', 'dDDDDd'], KUM, 52, 47), { from: 2 });
// 17: sandcastle; the tide reviews it
ev(17, pixOf([
  '.t...t.',
  'ttt.ttt',
  'tTtttTt',
  'ttttttt',
], { t: C.sandS, T: C.sandD }, 27, 46, '#926d49'), { until: 1.6 });
ev(17, pixOf([
  '..ffff....',
  '.ffffff...',
  'ffffffffff',
], { f: C.foam }, 22, 47), { from: 1.2, until: 2.2, walk: 6, stride: 2 });
// 18: waving for rescue; a ship on the horizon toots back and sails on
ev(18, pixOf([
  '.....k.....',
  '....kk.....',
  '...www.....',
  '.wwwwwwww..',
  'ddddddddddd',
  '.ddddddddd.',
], { k: C.g3, w: C.white, d: '#242449' }, 92, 21) + pixOf(['.ss.', 's..s', '....', '.s..'], { s: C.white }, 96, 15), { walk: 6, stride: 1, far: true });

// ---------------------------------------------------------- level meter
// 20 bars; each steps through its own seeded pattern of heights, eighth-note
// by eighth-note, over one, two or four beats, so the strip "plays".
const METER = { x: 0, y: 0, n: 20, h: 7 };

// ================================================================ BUILD
let css = '';
let defs = '';
let body = '';

// ---- keyframe helpers (step-end: each keyframe holds until the next)
function windowKF(name, a, b) {
  // visible from a to b seconds within the 60 s loop
  const k = [];
  if (a > 0) k.push(`0%{opacity:0}`);
  k.push(`${pct(a)}{opacity:1}`);
  if (b < LOOP) k.push(`${pct(b)}{opacity:0}`);
  k.push(`100%{opacity:${b < LOOP ? 0 : 1}}`);
  css += `@keyframes ${name}{${k.join('')}}.${name}{opacity:${a === 0 ? 1 : 0};animation:${name} ${LOOP}s step-end infinite}`;
}
function moveKF(name, a, b, dx, dy, steps) {
  // still until a, then a stepped move by (dx, dy) until b, then hold
  css += `@keyframes ${name}{0%{transform:translate(0,0)}${pct(a)}{transform:translate(0,0);animation-timing-function:steps(${steps},end)}${pct(b)}{transform:translate(${dx}px,${dy}px)}100%{transform:translate(${dx}px,${dy}px)}}`
    + `.${name}{animation:${name} ${LOOP}s linear infinite}`;
}

// ---- base styles
css += 'svg{shape-rendering:crispEdges}';
css += `@keyframes nod{0%{transform:translateY(1px)}25%{transform:translateY(0)}}.nod{animation:nod ${BEAT}s step-end infinite}`;
css += `@keyframes bob{0%{transform:translateY(0)}50%{transform:translateY(1px)}}.bob{animation:bob ${BAR / 2}s step-end infinite}`;
css += '@keyframes fl{0%{opacity:1}50%{opacity:0}}.fire{animation:fl .5s step-end infinite}.fire2{animation:fl .5s step-end infinite reverse}';
css += `@keyframes fla{0%{opacity:0}40%{opacity:1}50%{opacity:0}}.flash{animation:fla ${BEAT}s step-end infinite}`;
css += `@keyframes bl{0%{opacity:1}50%{opacity:.35}}.blink{animation:bl ${BEAT}s step-end infinite}`;

// ---------------------------------------------------------------- frame
body += `<rect width="${W}" height="${H}" rx="8" fill="${C.black}"/>`;
body += `<rect x="${PX}" y="${PY}" width="${PW}" height="${PH}" fill="${C.g6}"/>`;
// brushing: faint lighter lines on the plate, under everything else
body += `<path fill="#c4c4c4" opacity=".35" d="${Array.from({ length: Math.floor((PH - 8) / 4) }, (_, i) => `M${PX + 3} ${PY + 4 + i * 4}h${PW - 6}v1h${-(PW - 6)}z`).join('')}"/>`;
// window fills
body += `<rect x="${LW.x + 2}" y="${LW.y + 2}" width="${LW.w - 4}" height="${LW.h - 4}" fill="${C.black}"/>`;
body += `<rect x="${NP.x + 2}" y="${NP.y + 2}" width="${NP.w - 4}" height="${NP.h - 4}" fill="${C.black}"/>`;
body += `<rect x="${RB.x}" y="${RB_Y}" width="${RB.w}" height="${RB.h}" fill="${C.black}"/>`;
body += P.paths();
// a glint crossing the title's faces once every two bars, in 4 px steps
{
  const faces = new Set([...tcells].filter((k) => P.get(...k.split(',').map(Number)) === C.g6));
  let x0 = Infinity; let x1 = -Infinity;
  for (const k of tcells) { const x = Number(k.split(',')[0]); x0 = Math.min(x0, x); x1 = Math.max(x1, x + 1); }
  defs += `<clipPath id="tg"><path d="${cellsToPath((x, y) => faces.has(`${x},${y}`), x0, TY, x1, TY + 14 * CH)}"/></clipPath>`;
  const span = x1 - x0 + 40;
  const steps = Math.round(span / 4);
  css += `@keyframes gl{0%{transform:translateX(0)}40%{transform:translateX(${steps * 4}px)}100%{transform:translateX(${steps * 4}px)}}`
    + `.gl{animation:gl ${2 * BAR}s steps(${steps},end) infinite}`;
  const g = [];
  for (let y = TY; y < TY + 14 * CH; y++) g.push(`M${x0 - 30 + Math.round((TY + 14 * CH - y) * 0.5)} ${y}h6v1h-6z`);
  body += `<g clip-path="url(#tg)"><g class="gl"><path fill="${C.white}" opacity=".55" d="${g.join('')}"/><path fill="${C.g7}" opacity=".6" d="${g.map((d) => d.replace('h6v1h-6', 'h3v1h-3').replace(/^M(\d+)/, (m, v) => `M${Number(v) + 8}`)).join('')}"/></g></g>`;
}

// ---------------------------------------------------------------- list
// Row k of the list: 0 is the "TOP OF LIST" header, then the 20 tracks.
// The bar walks down the window for the first rows, then the list scrolls
// under it; at the end of the loop it jumps back to the top.
const offsetAt = (k) => Math.max(0, k - 3);
const slotAt = (k) => Math.min(k + 1, VIS - 1);
{
  // row symbols
  const rows = [];
  rows.push(uses('- TOP OF LIST -', TX + Math.round(((COLS - 15) * 8) / 2), 0));
  for (let i = 0; i < STEPS; i++) rows.push(uses(rowText(i), TX, 0));
  rows.forEach((r, i) => { defs += `<g id="r${i}">${r}</g>`; });
  // list scroll keyframes
  let kf = '';
  let bk = '';
  for (let k = 0; k < STEPS; k++) {
    kf += `${pct(k * BAR)}{transform:translateY(${-offsetAt(k) * PITCH}px)}`;
    bk += `${pct(k * BAR)}{transform:translateY(${slotAt(k) * PITCH}px)}`;
  }
  css += `@keyframes ls{${kf}100%{transform:translateY(0)}}.ls{animation:ls ${LOOP}s step-end infinite}`;
  css += `@keyframes sb{${bk}100%{transform:translateY(${PITCH}px)}}.sb{transform:translateY(${PITCH}px);animation:sb ${LOOP}s step-end infinite}`;
  defs += `<clipPath id="lc"><rect x="${LW.x + 2}" y="${ROW0}" width="${LW.w - 4}" height="${VIS * PITCH}"/></clipPath>`;
  body += `<g clip-path="url(#lc)">`;
  // the selection bar
  body += `<g class="sb"><rect x="${LW.x + 3}" y="${ROW0}" width="${LW.w - 6}" height="${PITCH - 1}" fill="${C.red}"/><rect x="${LW.x + 3}" y="${ROW0}" width="${LW.w - 6}" height="1" fill="${C.red2}"/><rect x="${LW.x + 3}" y="${ROW0 + PITCH - 2}" width="${LW.w - 6}" height="1" fill="${C.redD}"/></g>`;
  body += `<g class="ls">`;
  rows.forEach((_, i) => {
    const y = ROW0 + i * PITCH + 2;
    const col = i === 0 ? C.yellow : i % 2 ? C.green : C.blue;
    body += `<use href="#r${i}" y="${y}" fill="${col}"/>`;
  });
  // white copies of each track row, shown only while it is selected
  for (let i = 0; i < STEPS; i++) {
    const y = ROW0 + (i + 1) * PITCH + 2;
    windowKF(`h${i}`, i * BAR, (i + 1) * BAR);
    body += `<use class="h${i}" href="#r${i + 1}" y="${y}" fill="${C.white}"/>`;
  }
  body += `</g></g>`;
}

// ------------------------------------------------------- now playing strip
{
  const ty = NP.y + 3; // text top
  const x0 = NP.x + 4;
  body += `<g fill="${C.yellow}">${uses('NOW', x0, ty)}</g>`;
  body += `<g fill="${C.amber}">${uses('>', x0 + 3 * 8 + 2, ty)}</g>`;
  // caption strip: 20 captions, one per bar
  const cx = x0 + 5 * 8;
  const capW = 30 * 8;
  defs += `<clipPath id="cc"><rect x="${cx}" y="${ty}" width="${capW}" height="8"/></clipPath>`;
  let caps = '';
  TRACKS.forEach(([, , cap], i) => {
    if (cap.length > 30) throw new Error(`caption too long (${cap.length}): ${cap}`);
    caps += `<g transform="translate(0 ${i * 10})">${uses(cap, cx, ty)}</g>`;
  });
  css += `@keyframes cp{0%{transform:translateY(0)}100%{transform:translateY(${-STEPS * 10}px)}}.cp{animation:cp ${LOOP}s steps(${STEPS},end) infinite}`;
  body += `<g clip-path="url(#cc)"><g class="cp" fill="${C.white}">${caps}</g></g>`;
  // level meter: green, yellow, red segments under a black cover per bar
  const mx = cx + capW + 10;
  const my = ty;
  const mh = 7;
  let segs = '';
  let covers = '';
  for (let b = 0; b < METER.n; b++) {
    const x = mx + b * 4;
    segs += `M${x} ${my}h3v1h-3z`; // red top
    const len = [1, 2, 4][Math.floor(rand() * 3)] * BEAT;
    const ticks = Math.round(len / (BEAT / 2));
    let kf = '';
    for (let t = 0; t < ticks; t++) {
      const onBeat = t % 2 === 0;
      const level = Math.max(1, Math.min(7, Math.round((onBeat ? 4.5 : 2.5) + rand() * 3 - (b / METER.n) * 2)));
      kf += `${n((t / ticks) * 100)}%{transform:scaleY(${n((7 - level) / 7)})}`;
    }
    css += `@keyframes m${b}{${kf}}.m${b}{animation:m${b} ${n(len)}s step-end infinite}`;
    covers += `<rect class="mc m${b}" x="${x}" y="${my}" width="3" height="${mh}"/>`;
  }
  const meterRows = [[0, C.red2], [1, C.amber], [2, C.yellow], [3, C.green], [4, C.green], [5, C.green], [6, C.green]];
  let mpaths = '';
  for (const [r, col] of meterRows) {
    let d = '';
    for (let b = 0; b < METER.n; b++) d += `M${mx + b * 4} ${my + r}h3v1h-3z`;
    mpaths += `<path fill="${col}" d="${d}"/>`;
  }
  void segs;
  css += '.mc{transform-box:fill-box;transform-origin:50% 0;transform:scaleY(.5)}';
  body += mpaths + `<g fill="${C.black}">${covers}</g>`;
  // counter: the theme's position, 0:00 to 0:59
  const kx = NP.x + NP.w - 4 - 4 * 8;
  body += `<g fill="${C.red2}">${uses('0:', kx, ty)}</g>`;
  defs += `<clipPath id="kc"><rect x="${kx + 16}" y="${ty}" width="16" height="8"/></clipPath>`;
  let tens = ''; let units = '';
  for (let d = 0; d < 6; d++) tens += uses(String(d), kx + 16, ty + d * 10);
  for (let d = 0; d < 10; d++) units += uses(String(d), kx + 24, ty + d * 10);
  css += `@keyframes kt{0%{transform:translateY(0)}100%{transform:translateY(-60px)}}.kt{animation:kt ${LOOP}s steps(6,end) infinite}`;
  css += `@keyframes ku{0%{transform:translateY(0)}100%{transform:translateY(-100px)}}.ku{animation:ku 10s steps(10,end) infinite}`;
  body += `<g clip-path="url(#kc)" fill="${C.red2}"><g class="kt">${tens}</g><g class="ku">${units}</g></g>`;
}

// ---------------------------------------------------------- rainbow strip
{
  const RAIN = ['#ff0000', '#ff4900', '#ff9200', '#ffdb00', '#b6ff00', '#49ff00', '#00ff49', '#00ffb6', '#00dbff', '#0092ff', '#0049ff', '#4900ff', '#9200ff', '#db00ff', '#ff00b6', '#ff0049'];
  const bw = 8;
  const count = Math.ceil(RB.w / bw) + RAIN.length;
  const by = new Map();
  for (let i = 0; i < count; i++) {
    const c = RAIN[i % RAIN.length];
    by.set(c, (by.get(c) || '') + `M${RB.x + i * bw} ${RB_Y}h${bw}v${RB.h}h${-bw}z`);
  }
  let strip = '';
  for (const [c, d] of by) strip += `<path fill="${c}" d="${d}"/>`;
  defs += `<clipPath id="rc"><rect x="${RB.x}" y="${RB_Y}" width="${RB.w}" height="${RB.h}"/></clipPath>`;
  css += `@keyframes rb{0%{transform:translateX(0)}100%{transform:translateX(${-RAIN.length * bw}px)}}.rb{animation:rb ${BAR}s steps(${RAIN.length},end) infinite}`;
  body += `<g clip-path="url(#rc)"><g class="rb">${strip}</g></g>`;
}

// ------------------------------------------------------------------ scene
{
  defs += `<clipPath id="sc"><rect x="${S0.x}" y="${S0.y}" width="${SWI}" height="${SHI}"/></clipPath>`;
  body += `<g clip-path="url(#sc)">`;
  body += sceneBase.paths();
  // a cloud drifting across once per loop (and its copy one window behind)
  const cl = new Pix();
  cloud(cl, S0.x + 8, S0.y + 6, 22);
  cloud(cl, S0.x + 8 + SWI, S0.y + 6, 22);
  cloud(cl, S0.x + 60, S0.y + 14, 14);
  cloud(cl, S0.x + 60 + SWI, S0.y + 14, 14);
  css += `@keyframes cl{0%{transform:translateX(0)}100%{transform:translateX(${-SWI}px)}}.cl{animation:cl ${LOOP}s steps(${SWI},end) infinite}`;
  body += `<g class="cl">${cl.paths()}</g>`;
  // sparkles on the sea and foam round the island, two alternating frames
  const sp1 = new Pix(); const sp2 = new Pix();
  for (let i = 0; i < 16; i++) {
    const x = Math.floor(rand() * SWI); const y = HOR + 2 + Math.floor(rand() * (SHI - HOR - 3));
    if (((x + 0.5 - IS.cx) / (IS.rx + 10)) ** 2 + ((y + 0.5 - IS.cy) / (IS.ry + 6)) ** 2 <= 1) continue;
    (i % 2 ? sp1 : sp2).set(S0.x + x, S0.y + y, C.foam);
    (i % 2 ? sp1 : sp2).set(S0.x + x + 1, S0.y + y, C.foam);
  }
  for (let a = 0; a < 64; a++) {
    const th = (a / 64) * Math.PI * 2;
    const x = Math.round(IS.cx + Math.cos(th) * (IS.rx + 1.5) - 0.5);
    const y = Math.round(IS.cy + Math.sin(th) * (IS.ry + 1.2) - 0.5);
    if (y < 46) continue;
    (a % 4 < 2 ? sp1 : sp2).set(S0.x + x, S0.y + y, C.foam);
  }
  css += `@keyframes sw{0%{opacity:1}50%{opacity:0}}.sw1{animation:sw ${BAR / 2}s step-end infinite}.sw2{opacity:0;animation:sw ${BAR / 2}s step-end infinite reverse}`;
  body += `<g class="sw1">${sp1.paths()}</g><g class="sw2">${sp2.paths()}</g>`;
  body += `<g class="bob">${RAFT.paths()}</g>`;

  // the gags: a renderer, used for far-off ones (behind the palm) and the rest
  const renderEv = (e, i) => {
    const a = e.step * BAR + (e.from || 0);
    const b = e.until !== undefined ? e.step * BAR + e.until : (e.step + 1) * BAR;
    const name = `e${i}`;
    windowKF(name, a, b);
    let inner = e.body;
    if (e.nod) inner = `<g class="nod">${inner}</g>`;
    if (e.bob) inner = `<g class="bob">${inner}</g>`;
    if (e.walk) {
      const mv = `w${i}`;
      moveKF(mv, a, b, e.walk, 0, Math.abs(e.walk) / (e.stride || 1));
      inner = `<g class="${mv}">${inner}</g>`;
    }
    if (e.drop) {
      const mv = `d${i}`;
      moveKF(mv, a, b, 0, e.drop, e.drop);
      inner = `<g class="${mv}">${inner}</g>`;
    }
    body += `<g class="${name}">${inner}</g>`;
  };
  EV.forEach((e, i) => { if (e.far) renderEv(e, i); });
  body += palmPix.paths();

  // her: hidden while she is up the palm (row 7) or out on the water (13),
  // swapped for her coffee (14) and wave (19) poses
  const herSteps = { sit: [], coffee: [13], wave: [18] };
  for (let k = 0; k < STEPS; k++) if (![6, 12, 13, 18].includes(k)) herSteps.sit.push(k);
  for (const [variant, steps] of Object.entries(herSteps)) {
    // visibility as runs of steps
    const runs = [];
    for (const k of steps) { const last = runs[runs.length - 1]; if (last && last[1] === k) last[1] = k + 1; else runs.push([k, k + 1]); }
    const name = `v${variant}`;
    const kfs = [];
    const vis = (t) => runs.some(([a, b]) => t >= a * BAR && t < b * BAR);
    let prev = null;
    for (let k = 0; k < STEPS; k++) {
      const v = vis(k * BAR) ? 1 : 0;
      if (v !== prev) { kfs.push(`${pct(k * BAR)}{opacity:${v}}`); prev = v; }
    }
    css += `@keyframes ${name}{${kfs.join('')}100%{opacity:${prev}}}.${name}{opacity:${vis(0) ? 1 : 0};animation:${name} ${LOOP}s step-end infinite}`;
    body += `<g class="${name}">${herPix(variant).paths()}<g class="nod">${headPix().paths()}</g></g>`;
  }

  EV.forEach((e, i) => { if (!e.far) renderEv(e, i); });
  body += `</g>`;
}

// ------------------------------------------------------------- scrollers
const BIG_TEXT = [
  'CASTAWAY IS NOW PLAYING.',
  'TEN HOURS OF ONE TINY ISLAND: ONE YOUNG WOMAN, ONE TALL PALM, ONE RAFT AND A LOT OF TIME.',
  'SHE IDLES AND NODS ALONG TO HER HEADPHONES. EVERY SO OFTEN SOMETHING HAPPENS, ALWAYS ON THE NEXT BAR OF THE MUSIC.',
  'MORE THAN 90 THINGS CAN HAPPEN, AND FOUR TIMERS DECIDE WHEN: EVERY 2 TO 5 MINUTES, 12 TO 25 MINUTES, 30 TO 60 MINUTES, OR 3 TO 6 HOURS.',
  'EVERY SOUND IS MADE FROM CODE: NO SAMPLES, NO RECORDINGS.',
  'ALWAYS DAYTIME. AN UNOFFICIAL REMAKE, INSPIRED BY A 1992 DESERT ISLAND SCREENSAVER.',
  'TO PLAY: PYTHON TOOLS/SERVE.PY, THEN OPEN 127.0.0.1:8765',
].join('   *   ') + '   *   ';
const SMALL_TEXT = [
  'LINER NOTES',
  'ALL TRACKS PERFORMED BY TOOLS/MAKE_AUDIO.PY',
  'RECORDED: NEVER. STUDIO: NONE. MICROPHONES: NONE.',
  'INSTRUMENTS: ELECTRIC PIANO, KALIMBA, SOFT DRUMS AND VINYL CRACKLE, ALL OF THEM MATHS',
  'THE THEME: 60 SECONDS, 80 BPM, F MAJOR, 20 BARS OF 3 SECONDS, LOOPED WITHOUT A SEAM',
  'MIXED TO -14 LUFS, TRUE PEAK AT OR UNDER -1 DBTP',
  'LONGEST TRACK: THE VIDEO ITSELF, 10:00:00. THE THEME FITS IN IT 600 TIMES',
  'SHORTEST IN THE LIBRARY: ONE BARE FOOT ON SAND, 0:00.2',
  'REQUESTS ARE NOT TAKEN. THE TIMERS DECIDE',
].join('  =  ') + '  =  ';
{
  // big: 16 px rounded letters in a warm banded ramp
  const bigW = BIG_TEXT.length * 16;
  const RAMP = ['#ffffb6', '#ffff6d', '#ffff24', '#ffdb24', '#ffdb00', '#ffb600', '#ffb600', '#ff9200', '#ff9200', '#ff6d00', '#ff6d00', '#ff4900', '#db2400', '#db2400', '#b60000', '#920000'];
  let stops = '';
  RAMP.forEach((c, i) => { stops += `<stop offset="${n(i / 16)}" stop-color="${c}"/><stop offset="${n((i + 1) / 16)}" stop-color="${c}"/>`; });
  defs += `<linearGradient id="bg" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="16">${stops}</linearGradient>`;
  const speed = 48; // px per second
  const dur = bigW / speed;
  css += `@keyframes sb1{0%{transform:translateX(0)}100%{transform:translateX(${-bigW}px)}}.sb1{animation:sb1 ${n(dur)}s linear infinite}`;
  defs += `<g id="bt">${uses(BIG_TEXT, 0, 0, { big: true })}</g>`;
  defs += `<clipPath id="bc"><rect x="4" y="${BIG_Y - 2}" width="${W - 8}" height="20"/></clipPath>`;
  body += `<g clip-path="url(#bc)"><g class="sb1" fill="url(#bg)"><use href="#bt" x="${W - 4 - 16 * 16}" y="${BIG_Y}"/><use href="#bt" x="${W - 4 - 16 * 16 + bigW}" y="${BIG_Y}"/></g></g>`;
  // small: the liner notes in cyan, a little quicker
  const smW = SMALL_TEXT.length * 8;
  const sdur = smW / 36;
  css += `@keyframes sb2{0%{transform:translateX(0)}100%{transform:translateX(${-smW}px)}}.sb2{animation:sb2 ${n(sdur)}s linear infinite}`;
  defs += `<g id="st">${uses(SMALL_TEXT, 0, 0)}</g>`;
  body += `<g clip-path="url(#bc2)"><g class="sb2" fill="${C.cyan}"><use href="#st" x="12" y="${SMALL_Y}"/><use href="#st" x="${12 + smW}" y="${SMALL_Y}"/></g></g>`;
  defs += `<clipPath id="bc2"><rect x="4" y="${SMALL_Y - 2}" width="${W - 8}" height="12"/></clipPath>`;
}

// ------------------------------------------------------------ glyph defs
let glyphs = '';
for (const ch of [...usedSmall].sort()) {
  const cells = f8Bitmap(ch);
  glyphs += `<path id="a${gid(ch)}" d="${cellsToPath((x, y) => cells.has(`${x},${y}`), 0, 0, 8, 8)}"/>`;
}
for (const ch of [...usedBig].sort()) {
  const cells = scale2x(f8Bitmap(ch), 8, 8);
  glyphs += `<path id="B${gid(ch)}" d="${cellsToPath((x, y) => cells.has(`${x},${y}`), 0, 0, 16, 16)}"/>`;
}

// Reduced motion: everything holds on the opening frame (track 01 selected,
// the island idle), and the big scroller is parked with its first sentence,
// CASTAWAY IS NOW PLAYING., centred under the panel instead of cut off.
{
  const first = BIG_TEXT.split('   *   ')[0];
  const parked = Math.round((W - first.length * 16) / 2) - (W - 4 - 16 * 16);
  css += `@media (prefers-reduced-motion:reduce){*{animation:none!important}.sb1{transform:translateX(${parked}px)}}`;
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W * 2}" height="${H * 2}" role="img" aria-label="CASTAWAY: the island jukebox">
<title>CASTAWAY: the island jukebox</title>
<style>${css}</style>
<defs>${glyphs}${defs}</defs>
${body}
</svg>
`;
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, svg);
console.log(`wrote ${path.relative(process.cwd(), OUT)} (${(svg.length / 1024).toFixed(1)} KB)`);
