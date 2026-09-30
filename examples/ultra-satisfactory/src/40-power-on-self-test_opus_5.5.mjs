#!/usr/bin/env node
// ULTRA-SATISFACTORY as a PC power-on self test: the black 80 x 25 text screen a 1990s clone
// showed while it named the CPU, counted memory and found the drives. Here the memory test
// counts the app's items, recipes and buildings, the "drives" are the three tabs, and the
// device listing on the second screen is the nine production machines.
// (Style reference: mid-1990s PC BIOS POST screens. The vendor, the marks and every line of
// copy are invented; no real firmware name, logo or screen is reproduced.)
//
// Regenerate:  node examples/ultra-satisfactory/src/40-power-on-self-test_opus_5.5.mjs
//
// Plain Node, no dependencies, fully deterministic (no clock, no randomness). The screen is a
// VGA text mode: 80 x 25 cells of 8 x 16 dots (640 x 400), light grey on black, in five inks
// (so six of the sixteen text colours, counting the black). Every character is a <use> of a
// glyph path from the bitmap font below (never <text>), so it looks the same for every viewer.
// The corner badge and the three-cell mark are pixel art "loaded into the upper half of the character set": they sit on
// the cell grid and no cell uses more than one ink, as text mode demands (the build asserts it).
//
// Animation is CSS only and every change is a hard step: a BIOS prints whole lines, it does not
// type. One loop tells this story:  power on > video BIOS banner > POST (three counters, tab
// detection) > hold > clear to the configuration screen and device listing > "Starting..." >
// the app's URL appears > the fuse blows and the tube collapses to a line > power on. The loop
// is rotated so that the first frame a visitor sees is the POST screen with everything counted
// and the last device (the load balancer) still being looked for: the name, the badge, the
// totals and the prompts are all there at once, and the punchline lands a moment later. Under
// prefers-reduced-motion the file rests on the finished POST screen.
//
// No shape-rendering hint is set on purpose: a README scales the screen by a non-integer factor,
// where snapped dots come out uneven and anti-aliased ones look like a slightly soft tube.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '40-power-on-self-test_opus_5.5';
const OUT = path.join(HERE, '..', 'assets', `${SLUG}.svg`);

// ---------------------------------------------------------------------------------------------
// Screen geometry and the five inks
// ---------------------------------------------------------------------------------------------
const COLS = 80, ROWS = 25, CW = 8, CH = 16, PAD = 14;
const SW = COLS * CW, SH = ROWS * CH;
const VBW = SW + PAD * 2, VBH = SH + PAD * 2;

const INK = {
  a: '#AAAAAA', // light grey (attribute 07h): all ordinary text
  w: '#FFFFFF', // white: highlights
  b: '#5555FF', // light blue: the three-cell mark
  y: '#FFFF55', // yellow: the badge
  g: '#00AA00', // green: the badge
};

// ---------------------------------------------------------------------------------------------
// CP437-style 8x16 bitmap font. Rows are '#'/'.' strings, placed from row `top` of the cell.
// Capitals sit on rows 2-11 with the VGA habit of 2-pixel stems; lowercase x-height is row 5.
// ---------------------------------------------------------------------------------------------
const FONT = new Map();
function def(ch, top, rows) {
  const g = new Array(16).fill(0);
  rows.split(' ').forEach((r, i) => {
    let v = 0;
    for (let c = 0; c < 8; c++) if (r[c] === '#') v |= 1 << (7 - c);
    g[top + i] = v;
  });
  FONT.set(ch, g);
}
const CAPS = {
  A: '...#... ..###.. .##.##. ##...## ##...## ####### ##...## ##...## ##...## ##...##',
  B: '######. .##..## .##..## .##..## .#####. .##..## .##..## .##..## .##..## ######.',
  C: '..####. .##..## ##....# ##..... ##..... ##..... ##..... ##....# .##..## ..####.',
  D: '#####.. .##.##. .##..## .##..## .##..## .##..## .##..## .##..## .##.##. #####..',
  E: '####### .##..## .##...# .##.#.. .####.. .##.#.. .##.... .##...# .##..## #######',
  F: '####### .##..## .##...# .##.#.. .####.. .##.#.. .##.... .##.... .##.... ####...',
  G: '..####. .##..## ##....# ##..... ##..... ##.#### ##...## ##...## .##..## ..###.#',
  H: '##...## ##...## ##...## ##...## ####### ##...## ##...## ##...## ##...## ##...##',
  I: '.####.. ..##... ..##... ..##... ..##... ..##... ..##... ..##... ..##... .####..',
  J: '...#### ....##. ....##. ....##. ....##. ....##. ##..##. ##..##. ##..##. .####..',
  K: '###..## .##..## .##.##. .##.##. .####.. .####.. .##.##. .##..## .##..## ###..##',
  L: '####... .##.... .##.... .##.... .##.... .##.... .##.... .##...# .##..## #######',
  M: '##...## ###.### ####### ####### ##.#.## ##...## ##...## ##...## ##...## ##...##',
  N: '##...## ###..## ####.## ####### ##.#### ##..### ##...## ##...## ##...## ##...##',
  O: '.#####. ##...## ##...## ##...## ##...## ##...## ##...## ##...## ##...## .#####.',
  P: '######. .##..## .##..## .##..## .#####. .##.... .##.... .##.... .##.... ####...',
  R: '######. .##..## .##..## .##..## .#####. .##.##. .##..## .##..## .##..## ###..##',
  S: '.#####. ##...## ##...## .##.... ..###.. ....##. .....## ##...## ##...## .#####.',
  T: '.######. .######. .#.##.#. ...##... ...##... ...##... ...##... ...##... ...##... ..####..',
  U: '##...## ##...## ##...## ##...## ##...## ##...## ##...## ##...## ##...## .#####.',
  V: '##...## ##...## ##...## ##...## ##...## ##...## ##...## .##.##. ..###.. ...#...',
  W: '##...## ##...## ##...## ##...## ##.#.## ##.#.## ##.#.## ####### .##.##. .##.##.',
  X: '##...## ##...## .##.##. .#####. ..###.. ..###.. .#####. .##.##. ##...## ##...##',
  Y: '.##..##. .##..##. .##..##. .##..##. ..####.. ...##... ...##... ...##... ...##... ..####..',
  Z: '####### ##...## #...##. ...##.. ..##... .##.... ##..... ##....# ##...## #######',
  0: '..###.. .##.##. ##...## ##...## ##.#.## ##.#.## ##...## ##...## .##.##. ..###..',
  1: '..##... .###... ####... ..##... ..##... ..##... ..##... ..##... ..##... ######.',
  2: '.#####. ##...## .....## ....##. ...##.. ..##... .##.... ##..... ##...## #######',
  3: '.#####. ##...## .....## .....## ..####. .....## .....## .....## ##...## .#####.',
  4: '....##. ...###. ..####. .##.##. ##..##. ####### ....##. ....##. ....##. ...####',
  5: '####### ##..... ##..... ##..... ######. .....## .....## .....## ##...## .#####.',
  6: '..###.. .##.... ##..... ##..... ######. ##...## ##...## ##...## ##...## .#####.',
  7: '####### ##...## .....## ....##. ...##.. ..##... ..##... ..##... ..##... ..##...',
  8: '.#####. ##...## ##...## ##...## .#####. ##...## ##...## ##...## ##...## .#####.',
  9: '.#####. ##...## ##...## ##...## .###### .....## .....## .....## ....##. .####..',
};
for (const [ch, rows] of Object.entries(CAPS)) def(ch, 2, rows);
def('Q', 2, '.#####. ##...## ##...## ##...## ##...## ##...## ##...## ##.#.## ##.#### .#####. ....##. ....###');

const LOWER = {
  a: [5, '.####.. ....##. .#####. ##..##. ##..##. ##..##. .###.##'],
  b: [2, '###.... .##.... .##.... .####.. .##.##. .##..## .##..## .##..## .##..## .#####.'],
  c: [5, '.#####. ##...## ##..... ##..... ##..... ##...## .#####.'],
  d: [2, '...###. ....##. ....##. ..####. .##.##. ##..##. ##..##. ##..##. ##..##. .###.##'],
  e: [5, '.#####. ##...## ####### ##..... ##..... ##...## .#####.'],
  f: [2, '..###.. .##.##. .##..#. .##.... ####... .##.... .##.... .##.... .##.... ####...'],
  g: [5, '.###.## ##..##. ##..##. ##..##. ##..##. ##..##. .#####. ....##. ##..##. .####..'],
  h: [2, '###.... .##.... .##.... .##.##. .###.## .##..## .##..## .##..## .##..## ###..##'],
  i: [2, '..##... ..##... ....... .###... ..##... ..##... ..##... ..##... ..##... .####..'],
  j: [2, '....##. ....##. ....... ...###. ....##. ....##. ....##. ....##. ....##. ....##. .##.##. .##.##. ..###..'],
  k: [2, '###.... .##.... .##.... .##..## .##.##. .####.. .####.. .##.##. .##..## ###..##'],
  l: [2, '.###... ..##... ..##... ..##... ..##... ..##... ..##... ..##... ..##... .####..'],
  m: [5, '###.##. ####### ##.#.## ##.#.## ##.#.## ##.#.## ##...##'],
  n: [5, '##.###. .##..## .##..## .##..## .##..## .##..## .##..##'],
  o: [5, '.#####. ##...## ##...## ##...## ##...## ##...## .#####.'],
  p: [5, '##.###. .##..## .##..## .##..## .##..## .##..## .#####. .##.... .##.... ####...'],
  q: [5, '.###.## ##..##. ##..##. ##..##. ##..##. ##..##. .#####. ....##. ....##. ...####'],
  r: [5, '##.###. .###.## .##..## .##.... .##.... .##.... ####...'],
  s: [5, '.#####. ##...## .##.... ..###.. ....##. ##...## .#####.'],
  t: [2, '...#... ..##... ..##... ######. ..##... ..##... ..##... ..##... ..##.## ...###.'],
  u: [5, '##..##. ##..##. ##..##. ##..##. ##..##. ##..##. .###.##'],
  v: [5, '##...## ##...## ##...## ##...## .##.##. ..###.. ...#...'],
  w: [5, '##...## ##...## ##.#.## ##.#.## ##.#.## ####### .##.##.'],
  x: [5, '##...## .##.##. ..###.. ..###.. ..###.. .##.##. ##...##'],
  y: [5, '##...## ##...## ##...## ##...## ##...## ##...## .###### .....## ....##. #####..'],
  z: [5, '####### ##..##. ...##.. ..##... .##.... ##...## #######'],
};
for (const [ch, [top, rows]] of Object.entries(LOWER)) def(ch, top, rows);

const PUNCT = {
  '.': [10, '...##.. ...##..'],
  ',': [9, '...##.. ...##.. ...##.. ..##...'],
  ':': [5, '...##.. ...##.. ....... ....... ...##.. ...##..'],
  ';': [5, '...##.. ...##.. ....... ....... ...##.. ...##.. ..##...'],
  '!': [2, '...##.. ..####. ..####. ..####. ...##.. ...##.. ...##.. ....... ...##.. ...##..'],
  '?': [2, '.#####. ##...## ##...## ....##. ...##.. ...##.. ...##.. ....... ...##.. ...##..'],
  "'": [1, '...##.. ...##.. ..##...'],
  '"': [1, '.##..##. .##..##. ..#..#..'],
  '-': [7, '#######'],
  '_': [14, '########'],
  '/': [4, '......# .....## ....##. ...##.. ..##... .##.... ##..... #......'],
  '\\': [4, '#...... ##..... .##.... ..##... ...##.. ....##. .....## ......#'],
  '|': [2, '...##.. ...##.. ...##.. ...##.. ...##.. ...##.. ...##.. ...##.. ...##.. ...##.. ...##.. ...##..'],
  '(': [2, '....##. ...##.. ..##... ..##... ..##... ..##... ..##... ..##... ...##.. ....##.'],
  ')': [2, '.##.... ..##... ...##.. ...##.. ...##.. ...##.. ...##.. ...##.. ..##... .##....'],
  '[': [2, '.####.. .##.... .##.... .##.... .##.... .##.... .##.... .##.... .##.... .####..'],
  ']': [2, '.####.. ...##.. ...##.. ...##.. ...##.. ...##.. ...##.. ...##.. ...##.. .####..'],
  '{': [2, '....### ...##.. ...##.. ...##.. .###... ...##.. ...##.. ...##.. ...##.. ....###'],
  '}': [2, '###.... ..##... ..##... ..##... ...###. ..##... ..##... ..##... ..##... ###....'],
  '<': [3, '....##. ...##.. ..##... .##.... ##..... .##.... ..##... ...##.. ....##.'],
  '>': [3, '.##.... ..##... ...##.. ....##. .....## ....##. ...##.. ..##... .##....'],
  '#': [2, '.##.##. .##.##. ####### .##.##. .##.##. .##.##. ####### .##.##. .##.##.'],
  '*': [5, '.##..##. ..####.. ######## ..####.. .##..##.'],
  '+': [5, '...##... ...##... .######. ...##... ...##...'],
  '=': [6, '.######. ........ ........ .######.'],
  '@': [2, '.#####. ##...## ##...## ##.#### ##.#### ##.#### ##.###. ##..... ##..... .#####.'],
  '&': [2, '.###... ##.##.. ##.##.. .###... .###.## ##.###. ##..##. ##..##. ##..##. .###.##'],
  '%': [4, '##....#. ##...##. ....##.. ...##... ..##.... .##..... ##...##. #....##.'],
  '~': [2, '.###.## ##.###.'],
  '♪': [3, '...##... ...###.. ...####. ...##.##. ...##..#. ...##... ...##... .####... #####... .###....'],
  '►': [3, '#....... ##...... ###..... ####.... #####... ####.... ###..... ##...... #.......'],
  '◄': [3, '....#... ...##... ..###... .####... #####... .####... ..###... ...##... ....#...'],
  '▼': [5, '#######. .#####.. ..###... ...#....'],
  '▲': [7, '...#.... ..###... .#####.. #######.'],
  '×': [6, '##...##. .##.##.. ..###... .##.##.. ##...##.'],
  '·': [7, '...##... ...##...'],
  '•': [6, '...##... ..####.. ..####.. ...##...'],
  '→': [5, '....##.. .....##. ######## .....##. ....##..'],
  '■': [5, '.######. .######. .######. .######. .######. .######.'],
  '♥': [4, '.##.##. ####### ####### ####### .#####. ..###.. ...#...'],
};
for (const [ch, [top, rows]] of Object.entries(PUNCT)) def(ch, top, rows);
FONT.set(' ', new Array(16).fill(0));

// Box-drawing single line as the VGA ROM has it: the horizontal is one scanline (row 7), the
// vertical is two pixels wide (columns 3-4).
FONT.set('│', new Array(16).fill(0x18));
FONT.set('─', new Array(16).fill(0).map((_, y) => (y === 7 ? 0xFF : 0)));

// Glyph bitmap -> compact path (greedy merge of horizontal runs into rectangles).
function bitmapPath(rows, width, scaleX = 1, scaleY = 1, ox = 0, oy = 0) {
  const rects = [];
  let open = [];
  for (let y = 0; y < rows.length; y++) {
    const runs = [];
    for (let x = 0; x < width;) {
      if (rows[y](x)) { const s0 = x; while (x < width && rows[y](x)) x++; runs.push([s0, x - s0]); } else x++;
    }
    const next = [];
    for (const [x0, w] of runs) {
      const o = open.find((r) => r.x === x0 && r.w === w && r.y + r.h === y);
      if (o) { o.h++; next.push(o); } else { const r = { x: x0, w, y, h: 1 }; rects.push(r); next.push(r); }
    }
    open = next;
  }
  return rects.map((r) => `M${ox + r.x * scaleX} ${oy + r.y * scaleY}h${r.w * scaleX}v${r.h * scaleY}h${-r.w * scaleX}z`).join('');
}
const glyphPath = (g) => bitmapPath(g.map((v) => (x) => (v >> (7 - x)) & 1), 8);

// Glyph ids are letters only (a, b, ... then aa, ab, ...), so they cannot collide with the
// title and description ids, which carry a digit.
const glyphIds = new Map();
const ID_CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
function gid(ch) {
  if (!FONT.has(ch)) throw new Error(`no glyph for ${JSON.stringify(ch)} (U+${ch.codePointAt(0).toString(16)})`);
  if (!glyphIds.has(ch)) {
    const n = glyphIds.size;
    glyphIds.set(ch, n < ID_CHARS.length ? ID_CHARS[n] : `${ID_CHARS[Math.floor(n / ID_CHARS.length) - 1]}${ID_CHARS[n % ID_CHARS.length]}`);
  }
  return glyphIds.get(ch);
}
const len = (str) => [...str].length;

// ---------------------------------------------------------------------------------------------
// Timeline. Times below are "story" seconds from power-on. The loop is T seconds long and is
// rotated by S0, so loop time 0 shows story time S0 (the finished POST screen).
// ---------------------------------------------------------------------------------------------
const T = 30;
const S0 = 11.7;   // story second shown at loop time 0: everything found but the load balancer
const REST = 16;   // story second the file rests on when nothing animates (the finished POST)
const AT = {
  banner: 0.25,    // the video BIOS banner flashes up
  post: 1.45,      // clear; the POST screen's fixed lines appear
  cpu: 1.8,
  mem: 2.15,       // item counter starts ...
  memOk: 4.45,     // ... and stops on OK
  rec: 4.7,
  recOk: 6.2,
  bld: 6.45,
  bldOk: 7.95,
  ext: 8.3,        // the extension lines
  tab: [8.8, 9.75, 10.7], tabHold: 0.7,
  lb: 11.65, lbOk: 13.25, // the device that is not there takes longest, as it always did
  warn: 13.8,
  f1: 14.3,
  cfg: 20.6,       // hard clear to the configuration screen
  list: 21.1,      // device listing header
  dev: 21.35, devStep: 0.2,
  pool: 23.5, poolStep: 0.13,
  start: 25.1,     // "Starting ..."
  url: 26.5,       // Streamlit is up ...
  fuse: 28.7,      // ... and the tube collapses
};

const q = (s) => Math.round(s * 1000) / 1000;
const loopT = (s) => q((((s - S0) % T) + T) % T);
const pct = (t) => `${+((100 * t) / T).toFixed(3)}%`;
const css = [];
const visCache = new Map();
// Returns a class that shows its element only during the given [from, to) story intervals.
function vis(intervals) {
  const iv = intervals.map(([a, b]) => [q(a), q(b)]).filter(([a, b]) => b > a);
  const onS = (s) => iv.some(([a, b]) => s >= a && s < b);
  const onT = (t) => onS((((t + S0) % T) + T) % T);
  const pts = new Set([0]);
  for (const [a, b] of iv) { pts.add(loopT(a)); pts.add(loopT(b)); }
  let kf = '', prev = null;
  for (const t of [...pts].sort((m, n) => m - n)) {
    const v = onT(t + 1e-4) ? 1 : 0;
    if (t === 0 || v !== prev) kf += `${pct(t)}{opacity:${v}}`;
    prev = v;
  }
  kf += `100%{opacity:${onT(1e-4) ? 1 : 0}}`;
  const key = `${kf}|${onS(REST) ? 1 : 0}`;
  if (!visCache.has(key)) {
    const name = `v${visCache.size.toString(36)}`;
    visCache.set(key, name);
    css.push(`@keyframes ${name}{${kf}}.${name}{opacity:${onS(REST) ? 1 : 0};animation:${name} ${T}s step-end infinite}`);
  }
  return visCache.get(key);
}

// ---------------------------------------------------------------------------------------------
// Text helpers. Everything is addressed in character cells (row, column). A line is a list of
// parts: a plain string is light grey, ['text', 'w'] is white.
// ---------------------------------------------------------------------------------------------
function run(c, str) {
  let out = '';
  for (const ch of str) {
    if (ch !== ' ') out += c ? `<use href="#${gid(ch)}" x="${c * CW}"/>` : `<use href="#${gid(ch)}"/>`;
    c++;
  }
  return out;
}
function parts2svg(r, c, parts) {
  let out = '', col = c;
  for (const p of parts) {
    const [str, cls] = Array.isArray(p) ? p : [p, null];
    const u = run(col, str);
    out += cls && u ? `<g class="${cls}">${u}</g>` : u;
    col += len(str);
  }
  if (r < 0 || r >= ROWS || c < 0 || col > COLS) throw new Error(`off screen at row ${r}: ${JSON.stringify(parts)}`);
  return { svg: out, end: col };
}
const layers = [];
// Print `parts` at (r, c), visible during [from, to). Returns the column after the last cell.
function put(r, c, parts, from, to, maxCol = COLS) {
  const { svg, end } = parts2svg(r, c, typeof parts === 'string' ? [parts] : parts);
  if (end > maxCol) throw new Error(`row ${r} runs to column ${end}, limit ${maxCol}: ${JSON.stringify(parts)}`);
  layers.push(`<g class="${vis([[from, to]])}" transform="translate(0 ${r * CH})">${svg}</g>`);
  return end;
}
// A number that climbs: frames are [time, string], all strings the same width. Each cell gets
// one <use> per character it ever shows, switched on for the intervals it shows it.
function counter(r, c, frames, to, cls = 'w') {
  const width = len(frames[0][1]);
  let out = '';
  for (let i = 0; i < width; i++) {
    const by = new Map();
    frames.forEach(([t, str], k) => {
      const ch = [...str][i];
      if (ch === ' ') return;
      const end = k + 1 < frames.length ? frames[k + 1][0] : to;
      const list = by.get(ch) || by.set(ch, []).get(ch);
      const last = list[list.length - 1];
      if (last && Math.abs(last[1] - t) < 1e-9) last[1] = end; else list.push([t, end]);
    });
    for (const [ch, iv] of by) out += `<g class="${vis(iv)}">${run(c + i, ch)}</g>`;
  }
  layers.push(`<g class="${cls}" transform="translate(0 ${r * CH})">${out}</g>`);
}
// Count from 0 to n between t0 and t1 in `steps` jumps (a BIOS counts in chunks, not by ones).
function countFrames(n, width, t0, t1, steps) {
  const frames = [];
  for (let k = 0; k <= steps; k++) {
    const v = k === steps ? n : Math.floor((n * k) / steps);
    frames.push([t0 + ((t1 - t0) * k) / steps, String(v).padStart(width)]);
  }
  return frames;
}
// The blinking underline cursor: a list of [time, row, col]; it sits at each until the next.
const cursorEvents = [];
const cur = (t, r, c) => cursorEvents.push([t, r, c]);

// ---------------------------------------------------------------------------------------------
// Pixel art: a tiny canvas and shape tests. Used for the badge and the mark. A canvas dot holds
// 0 (off) or the number of an ink.
// ---------------------------------------------------------------------------------------------
function canvas(w, h) {
  const px = new Uint8Array(w * h);
  const cv = {
    w, h, px,
    set(x, y, v = 1) { if (x >= 0 && y >= 0 && x < w && y < h) px[y * w + x] = v; },
    get: (x, y) => (x >= 0 && y >= 0 && x < w && y < h ? px[y * w + x] : 0),
    fill(fn, v = 1) { for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (fn(x + 0.5, y + 0.5)) px[y * w + x] = v; },
    // Small bitmap glyphs (rows of '#'/'.').
    blit(rows, x0, y0, v = 1) { rows.forEach((row, y) => [...row].forEach((c, x) => { if (c === '#') cv.set(x0 + x, y0 + y, v); })); },
  };
  return cv;
}
// Pointy-top hexagon, circumradius R.
const inHex = (x, y, cx, cy, R) => {
  const dx = Math.abs(x - cx), dy = Math.abs(y - cy);
  return dx <= R * 0.8660254 && dy <= R - dx * 0.5773503;
};
// A cog: `n` square teeth between root radius r0 and tip radius r1, with a hole of radius rh.
const inCog = (x, y, cx, cy, r0, r1, rh, n, phase = 0) => {
  const d = Math.hypot(x - cx, y - cy);
  if (d < rh) return false;
  const a = Math.atan2(y - cy, x - cx) + phase;
  return d <= (Math.cos(a * n) > 0.15 ? r1 : r0);
};
// Canvas -> one path per ink. Text mode allows one foreground colour per character cell, so
// this refuses to build if any 8 x 16 cell of the art holds two inks.
function canvasPaths(cv, x0, y0, classes) {
  for (let r = 0; r * CH < cv.h; r++) for (let c = 0; c * CW < cv.w; c++) {
    const seen = new Set();
    for (let y = r * CH; y < (r + 1) * CH; y++) for (let x = c * CW; x < (c + 1) * CW; x++) if (cv.get(x, y)) seen.add(cv.get(x, y));
    if (seen.size > 1) throw new Error(`pixel art: cell (row ${r}, col ${c}) holds ${seen.size} inks; text mode allows one`);
  }
  return Object.entries(classes).map(([v, name]) => {
    const d = bitmapPath(Array.from({ length: cv.h }, (_, y) => (x) => cv.get(x, y) === +v), cv.w, 1, 1, x0, y0);
    return d ? `<path class="${name}" d="${d}"/>` : '';
  }).join('');
}

// Tiny 5x7 capitals for the badge captions. They are struck twice, one dot apart, to match the
// 2-dot stems of the text font; W would close up, so it is given at its struck width.
const TINY = {
  A: '.###. #...# #...# ##### #...# #...# #...#',
  C: '.###. #...# #.... #.... #.... #...# .###.',
  E: '##### #.... #.... ####. #.... #.... #####',
  F: '##### #.... #.... ####. #.... #.... #....',
  I: '### .#. .#. .#. .#. .#. ###',
  O: '.###. #...# #...# #...# #...# #...# .###.',
  R: '####. #...# #...# ####. #.#.. #..#. #...#',
  S: '.#### #.... #.... .###. ....# ....# ####.',
  T: '##### ..#.. ..#.. ..#.. ..#.. ..#.. ..#..',
  V: '#...# #...# #...# #...# #...# .#.#. ..#..',
  W: '##....## ##....## ##.##.## ##.##.## ##.##.## ######## .##..##.',
  Y: '#...# #...# .#.#. ..#.. ..#.. ..#.. ..#..',
  ' ': '... ... ... ... ... ... ...',
};
const tinyGlyph = (ch) => { const rows = TINY[ch].split(' '); return { rows, struck: rows[0].length > 5 ? 0 : 1 }; };
function tinyText(cv, str, x, y, v) {
  for (const ch of str) {
    const { rows, struck } = tinyGlyph(ch);
    cv.blit(rows, x, y, v);
    if (struck) cv.blit(rows, x + 1, y, v);
    x += rows[0].length + struck + 1;
  }
}
const tinyWidth = (str) => [...str].reduce((w, ch) => { const g = tinyGlyph(ch); return w + g.rows[0].length + g.struck + 1; }, -1);

// Big capitals for the wordmark: 15 x 24 dots with 5-dot strokes, built from rules, not drawn.
const BIG = { w: 15, h: 24, s: 5 };
const BIG_LETTERS = (() => {
  const { w, h, s } = BIG;
  const cutBL = (x, y) => x + (h - 1 - y) < 2, cutBR = (x, y) => (w - 1 - x) + (h - 1 - y) < 2;
  const legA = (y) => Math.round(5.5 * (1 - y / (h - 1)));
  return {
    U: (x, y) => (x < s || x >= w - s || y >= h - s) && !cutBL(x, y) && !cutBR(x, y),
    L: (x, y) => x < s || y >= h - s,
    T: (x, y) => y < s || (x >= 5 && x < 10),
    R: (x, y) => {
      if (x < s) return true;
      if (y < 14) {
        if ((w - 1 - x) + y < 2 || (w - 1 - x) + (13 - y) < 2) return false;
        return !(x < w - s && y >= s && y < 14 - s);
      }
      const xl = 5 + Math.round(((y - 14) * 5) / (h - 15));
      return x >= xl && x < xl + s;
    },
    A: (x, y) => {
      const xl = legA(y);
      if ((x >= xl && x < xl + 4) || (x >= w - 4 - xl && x < w - xl)) return true; // legs are a dot thinner
      return y >= 15 && y < 19 && x >= xl && x < w - xl;
    },
  };
})();
// Pair kerning, in dots: an L's foot under a T's bar leaves a hole, so the T tucks in.
const BIG_KERN = { LT: -5 };
function bigWidth(str, gap, lean) {
  const cs = [...str];
  return cs.reduce((w, ch, i) => w + BIG.w + (i ? gap + (BIG_KERN[cs[i - 1] + ch] || 0) : 0), 0) + Math.round((BIG.h - 1) * lean);
}
function bigText(cv, str, x0, y0, gap, lean, v) {
  let pen = x0, prev = '';
  for (const ch of str) {
    if (prev) pen += gap + (BIG_KERN[prev + ch] || 0);
    for (let y = 0; y < BIG.h; y++) {
      const shift = Math.round((BIG.h - 1 - y) * lean);
      for (let x = 0; x < BIG.w; x++) if (BIG_LETTERS[ch](x, y)) cv.set(pen + x + shift, y0 + y, v);
    }
    pen += BIG.w;
    prev = ch;
  }
}

// ---------------------------------------------------------------------------------------------
// The corner badge: 24 x 6 cells (192 x 96 dots) at the top right. An italic ULTRA, a conveyor
// of chevrons, SATISFACTORY, the rating it has earned (SCREW SAVER) and, beside them, the app's
// emblem: a cog in a hexagon. Yellow and green only.
// ---------------------------------------------------------------------------------------------
const BADGE = { cols: 24, rows: 6, c0: 55, r0: 0 };
const Y = 1, G = 2; // canvas values: yellow ink, green ink
function badge() {
  const cv = canvas(BADGE.cols * CW, BADGE.rows * CH);
  const LEFT = 12 * CW; // the lettering gets 12 cells, the emblem the other 12
  bigText(cv, 'ULTRA', Math.round((LEFT - 1 - bigWidth('ULTRA', 3, 0.2)) / 2), 8, 3, 0.2, Y);
  // Conveyor: chevrons pointing at the emblem.
  for (let k = 0; k < 10; k++) for (let y = 38; y < 46; y++) {
    const d = Math.abs(y - 41.5) - 0.5; // 0 on the two middle rows, 3 at the edges
    for (let x = 0; x < 5; x++) cv.set(3 + k * 9 + (3 - d) + x, y, G);
  }
  const centre = (str) => Math.floor((LEFT - tinyWidth(str)) / 2);
  tinyText(cv, 'SATISFACTORY', centre('SATISFACTORY'), 53, G);
  tinyText(cv, 'SCREW SAVER', centre('SCREW SAVER'), 70, Y);
  for (let x = 2; x < LEFT - 3; x++) { cv.set(x, 66, Y); cv.set(x, 80, Y); }
  // Emblem. Its centre sits on a cell corner and the cog is turned half a tooth, which is what
  // keeps the cog's cells clear of the hexagon's.
  const ex = LEFT + 48, ey = 48, R = 47.5;
  cv.fill((x, y) => inHex(x, y, ex, ey, R) && !inHex(x, y, ex, ey, R - 4.6), G);
  cv.fill((x, y) => inCog(x, y, ex, ey, 18.5, 25.5, 8.5, 8, Math.PI / 8), Y);
  return canvasPaths(cv, BADGE.c0 * CW, BADGE.r0 * CH, { [Y]: 'y', [G]: 'g' });
}

// The three-cell mark, top left: two rows tall, light blue. A hex nut. (24 x 32 dots.)
function mark() {
  const cv = canvas(3 * CW, 2 * CH);
  const cx = 12, cy = 16;
  cv.fill((x, y) => inHex(x, y, cx, cy, 13.8) && Math.hypot(x - cx, y - cy) > 6.2);
  cv.fill((x, y) => Math.hypot(x - cx, y - cy) < 3.2);
  return canvasPaths(cv, 0, 0, { 1: 'b' });
}

// ---------------------------------------------------------------------------------------------
// Act 0: the video BIOS banner. On screen for just over a second, as it always was.
// ---------------------------------------------------------------------------------------------
{
  const a = AT.banner, b = AT.post;
  put(0, 0, [['Offgrid VGA-16 BIOS v1.40', 'w']], a, b);
  put(1, 0, '16 colours fitted, 6 in use, counting black', a, b);
  put(2, 0, 'Aligned to the world grid: no', a, b);
  cur(0, 0, 0);
  cur(a, 3, 0);
}

// ---------------------------------------------------------------------------------------------
// Act 1: the POST screen.
// ---------------------------------------------------------------------------------------------
{
  const end = AT.cfg;
  const limit = BADGE.c0 - 1; // rows beside the badge must stop short of it
  // Fixed lines: name, notice, board, and the prompts at the foot of the screen.
  layers.push(`<g class="${vis([[AT.post, end]])}">${mark()}${badge()}</g>`);
  put(0, 4, [['ULTRA-SATISFACTORY', 'w'], ' Companion BIOS v0.0.1'], AT.post, end, limit);
  put(1, 4, 'Unofficial fan-made companion to Satisfactory', AT.post, end, limit);
  put(3, 0, 'HUB-MK1 Mainboard, Rev. TEMPORARY (now load-bearing)', AT.post, end, limit);
  put(21, 0, ['Press ', ['DEL', 'w'], ' to enter SETUP : ', ['python -m pip install -r requirements.txt', 'w']], AT.post, end);
  put(22, 0, ['Press ', ['ENTER', 'w'], ' to boot      : ', ['python -m streamlit run app/app.py', 'w']], AT.post, end);
  put(23, 0, ['Press ', ['ESC', 'w'], ' to skip install: ', ['https://lukexyz.github.io/ULTRA-SATISFACTORY/', 'w']], AT.post, end);
  put(24, 0, 'v0.0.1-APACHE2-HUB-MK1-140I-211R-477B-5P-8501-00', AT.post, end);
  cur(AT.post, 5, 0);

  put(5, 0, 'PIONEER CPU at 100% (overclock denied: no spare fuses)', AT.cpu, end, limit);
  cur(AT.cpu, 6, 0);

  // Three counters. Label, a number that climbs, the unit, then OK when it stops.
  const count = (r, label, unit, n, t0, t1, steps, tail) => {
    put(r, 0, label, t0, end);
    counter(r, 14, countFrames(n, 5, t0, t1, steps), end);
    const c = put(r, 20, unit, t0, end);
    cur(t0, r, c);
    put(r, c + 1, tail, t1, end);
    cur(t1, r + 1, 0);
  };
  count(6, 'Memory Test :', 'Items', 140, AT.mem, AT.memOk, 46, [['OK', 'w']]);
  count(7, 'Recipe Test :', 'Recipes', 211, AT.rec, AT.recOk, 30, [['OK', 'w'], ', 88 of them alternates']);
  count(8, 'Build Test  :', 'Buildings', 477, AT.bld, AT.bldOk, 30, [['OK', 'w']]);

  put(10, 0, 'Click and Play Extension v0.0.1, Brownout Microsystems', AT.ext, end);
  put(11, 0, 'Every recipe, building and Space Elevator objective, one click apart', AT.ext, end);
  cur(AT.ext, 12, 0);

  // Detection: the label, a pause with the skip hint, then what was found.
  const detect = (r, label, t0, t1, found) => {
    const c = put(r, 2, `Detecting ${label} ... `, t0, end);
    const h = put(r, c, '[Press F4 to skip]', t0, t1);
    cur(t0, r, h);
    put(r, c, found, t1, end);
    cur(t1, r + 1, 0);
  };
  detect(12, 'Tab 1', AT.tab[0], AT.tab[0] + AT.tabHold, [['OBJECTIVES', 'w'], '  pick a Space Elevator phase, see its parts']);
  detect(13, 'Tab 2', AT.tab[1], AT.tab[1] + AT.tabHold, [['ITEMS', 'w'], '       search as you type, open the recipe card']);
  detect(14, 'Tab 3', AT.tab[2], AT.tab[2] + AT.tabHold, [['BUILDINGS', 'w'], '   what each one makes, Mk upgrade paths']);
  detect(15, 'Load Balancer', AT.lb, AT.lbOk, [['None', 'w'], '. Manifold found, carrying on']);

  put(17, 0, 'Last shutdown : unplanned. Fuse blown by the Particle Accelerator, again', AT.warn, end);
  cur(AT.warn, 18, 0);
  put(18, 0, ['Press ', ['F1', 'w'], ' to flip the lever and act like nothing happened'], AT.f1, end);
  cur(AT.f1, 19, 0);
}

// ---------------------------------------------------------------------------------------------
// Act 2: hard clear to the configuration screen, then the device listing, then the boot line.
// ---------------------------------------------------------------------------------------------
{
  const a = AT.cfg, end = AT.fuse + 0.2;
  const title = 'ULTRA-SATISFACTORY Companion BIOS v0.0.1 : Factory Configuration';
  put(0, Math.floor((COLS - len(title)) / 2), title, a, end);
  // Box: double outer rule, single divider. Drawn as geometry on the glyph grid, where the
  // double-line characters put their strokes (rows 5 and 7, columns 2-3 and 5-6 of a cell).
  const r0 = 1, r1 = 8, c0 = 0, c1 = 79, cd = 39;
  const xo = c0 * CW + 2, xi = c0 * CW + 5, Xo = c1 * CW + 5, Xi = c1 * CW + 2;
  const yo = r0 * CH + 5, yi = r0 * CH + 7, Yo = r1 * CH + 7, Yi = r1 * CH + 5;
  const rect = (x, y, w, h) => `M${x} ${y}h${w}v${h}h${-w}z`;
  const box = rect(xo, yo, Xo + 2 - xo, 1) + rect(xo, Yo, Xo + 2 - xo, 1) + rect(xo, yo, 2, Yo + 1 - yo) + rect(Xo, yo, 2, Yo + 1 - yo)
    + rect(xi, yi, Xi + 2 - xi, 1) + rect(xi, Yi, Xi + 2 - xi, 1) + rect(xi, yi, 2, Yi + 1 - yi) + rect(Xi, yi, 2, Yi + 1 - yi)
    + rect(cd * CW + 3, yi, 2, Yi + 1 - yi);
  layers.push(`<path class="${vis([[a, end]])}" d="${box}"/>`);
  const kv = (r, c, label, width, value) => put(r, c, [`${label.padEnd(width)}: `, [value, 'w']], a, end, c < cd ? cd : c1);
  const left = [
    ['Operator', 'PIONEER, 1 core'],
    ['Co-Processor', 'Spreadsheet, fitted'],
    ['Tab 1', 'OBJECTIVES'],
    ['Tab 2', 'ITEMS'],
    ['Tab 3', 'BUILDINGS'],
    ['Display', '2nd monitor, phone'],
  ];
  const right = [
    ['Craftable Items', '140'],
    ['Machine Recipes', '211'],
    ['Alternate Recipes', '88 of the 211'],
    ['Buildings', '477'],
    ['Elevator Phases', '5'],
    ['Parallel Port', '8501, Streamlit'],
  ];
  left.forEach(([l, v], i) => kv(r0 + 1 + i, 2, l, 13, v));
  right.forEach(([l, v], i) => kv(r0 + 1 + i, cd + 2, l, 18, v));
  cur(a, 10, 0);

  // The device listing: the nine production machines, each with a standard recipe as the app
  // shows it (output per minute, cycle time, power draw).
  put(10, 0, 'Production device listing ... 9 machines, 468 other things you can build', AT.list, end);
  const cols = [1, 6, 29, 38, 61, 72];
  const tr = (r, cells, t, cls = []) => put(r, cols[0], cells.map((s, i) => {
    const w = (cols[i + 1] ?? COLS - 1) - cols[i];
    const right = i === 2 || i === 4 || i === 5;
    const str = right ? `${s.padStart(w - 2)}  ` : s.padEnd(w);
    if (len(str) !== w) throw new Error(`table cell too wide: ${s}`);
    return cls[i] ? [str, cls[i]] : str;
  }), t, end);
  tr(11, ['Bay', 'Device', 'Draw', 'Test recipe', 'Output', 'Cycle'], AT.list);
  const devices = [
    ['Smelter', '4 MW', 'Copper Ingot', '30/min', '2 s'],
    ['Constructor', '4 MW', 'Cable', '30/min', '2 s'],
    ['Assembler', '15 MW', 'Smart Plating', '2/min', '30 s'],
    ['Foundry', '16 MW', 'Steel Ingot', '45/min', '4 s'],
    ['Refinery', '30 MW', 'Plastic', '20/min', '6 s'],
    ['Packager', '10 MW', 'Packaged Water', '60/min', '2 s'],
    ['Manufacturer', '55 MW', 'Adaptive Control Unit', '1/min', '120 s'],
    ['Blender', '75 MW', 'Cooling System', '6/min', '10 s'],
    ['Particle Accelerator', 'fuse?', 'Nuclear Pasta', '0.5/min', '120 s'],
  ];
  cur(AT.list, 12, 0);
  devices.forEach((d, i) => {
    const t = AT.dev + i * AT.devStep;
    tr(12 + i, [` ${i}`, ...d], t, [null, 'w']);
    cur(t, 13 + i, 0);
  });

  // "Verifying ...": the dots arrive one at a time.
  const c = put(22, 0, 'Verifying Screw Pool Data ', AT.pool, end);
  cur(AT.pool, 22, c);
  const DOTS = 8;
  for (let i = 0; i < DOTS; i++) {
    const t = AT.pool + (i + 1) * AT.poolStep;
    put(22, c + i, '.', t, end);
    cur(t, 22, c + i + 1);
  }
  const tp = AT.pool + (DOTS + 3) * AT.poolStep;
  put(22, c + DOTS + 1, [['Storage full', 'w'], '. It is all Screws'], tp, end);
  cur(tp, 23, 0);
  put(23, 0, ['Starting ', ['ULTRA-SATISFACTORY', 'w'], '...'], AT.start, end);
  cur(AT.start, 24, 0);
  // The app comes up on its port, and that is the moment the fuse picks.
  const cu = put(24, 0, ['  Local URL: ', ['http://localhost:8501', 'w']], AT.url, end);
  cur(AT.url, 24, cu);
  cur(end, -1, -1); // the tube is dark until the next power-on
}

// ---------------------------------------------------------------------------------------------
// Cursor layer: one underline per position it visits (scanlines 13-14 of the cell), all inside
// a group that blinks. T is a whole number of blinks, so the blink has no seam either.
// ---------------------------------------------------------------------------------------------
{
  cursorEvents.sort((m, n) => m[0] - n[0]);
  const by = new Map();
  cursorEvents.forEach(([t, r, c], i) => {
    const to = i + 1 < cursorEvents.length ? cursorEvents[i + 1][0] : T;
    if (r < 0 || to - t < 1e-6) return;
    const key = `${r},${c}`;
    (by.get(key) || by.set(key, []).get(key)).push([t, to]);
  });
  let out = '';
  for (const [key, iv] of by) {
    const [r, c] = key.split(',').map(Number);
    out += `<rect class="${vis(iv)}" x="${c * CW}" y="${r * CH + 13}" width="8" height="2"/>`;
  }
  css.push('@keyframes bl{0%{opacity:1}50%{opacity:0}}.bl{animation:bl .5s step-end infinite}');
  layers.push(`<g class="bl">${out}</g>`);
}

// ---------------------------------------------------------------------------------------------
// The fuse: the picture collapses to a bright line, the line to a dot, the dot fades. These
// two animations are the only smooth ones in the file; everything else is a hard step.
// ---------------------------------------------------------------------------------------------
const cx = PAD + SW / 2, cy = PAD + SH / 2;
{
  const t0 = loopT(AT.fuse), tOn = loopT(0); // collapse starts / the next power-on
  const p = (t) => pct(t);
  css.push(`@keyframes tube{0%,${p(t0)}{transform:scale(1,1);animation-timing-function:cubic-bezier(.5,0,.9,.4)}`
    + `${p(t0 + 0.13)}{transform:scale(1,.006);animation-timing-function:step-end}`
    + `${p(t0 + 0.14)},${p(tOn - 0.02)}{transform:scale(1,0);animation-timing-function:step-end}`
    + `${p(tOn)},100%{transform:scale(1,1)}}`
    + `.tube{transform-origin:${cx}px ${cy}px;animation:tube ${T}s linear infinite}`);
  css.push(`@keyframes spot{0%,${p(t0 + 0.06)}{opacity:0;transform:scale(1,1)}`
    + `${p(t0 + 0.13)}{opacity:1;transform:scale(1,1);animation-timing-function:cubic-bezier(.3,0,.6,1)}`
    + `${p(t0 + 0.36)}{opacity:1;transform:scale(.012,1)}`
    + `${p(t0 + 0.9)},100%{opacity:0;transform:scale(.006,1)}}`
    + `.spot{opacity:0;transform-origin:${cx}px ${cy}px;animation:spot ${T}s linear infinite}`);
}

// ---------------------------------------------------------------------------------------------
// Assemble
// ---------------------------------------------------------------------------------------------
const body = layers.join('\n');
const glyphDefs = [...glyphIds].map(([ch, id]) => `<path id="${id}" d="${glyphPath(FONT.get(ch))}"/>`).join('');
const inkCss = Object.entries(INK).map(([k, v]) => `.${k}{fill:${v}}`).join('');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VBW} ${VBH}" width="${VBW}" height="${VBH}" role="img" aria-labelledby="t0 d0">
<title id="t0">ULTRA-SATISFACTORY: power-on self test</title>
<desc id="d0">A 1990s PC power-on screen for ULTRA-SATISFACTORY, an unofficial companion app for the game Satisfactory. Counters run up to 140 items, 211 recipes and 477 buildings, the three tabs OBJECTIVES, ITEMS and BUILDINGS are detected, and the prompts give the commands that start the app and its live address.</desc>
<style>
${inkCss}
${css.join('\n')}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}
</style>
<defs>${glyphDefs}</defs>
<rect x=".5" y=".5" width="${VBW - 1}" height="${VBH - 1}" rx="9" fill="#000" stroke="#2b2b2b"/>
<g class="tube"><g class="a" transform="translate(${PAD} ${PAD})">
${body}
</g></g>
<rect class="spot" x="${PAD}" y="${cy - 1}" width="${SW}" height="2" fill="#fff"/>
</svg>
`;
fs.writeFileSync(OUT, svg);
console.log(`wrote ${OUT}  ${(svg.length / 1024).toFixed(1)} KB, ${glyphIds.size} glyphs, ${visCache.size} timings`);
