#!/usr/bin/env node
// ULTRA-SATISFACTORY README header: "Mid-90s Desktop" (25-desktop-95_opus_5.5).
// Plain Node, no dependencies, fully deterministic (seeded PRNG).
//   node examples/ultra-satisfactory/src/25-desktop-95_opus_5.5.mjs
// writes examples/ultra-satisfactory/assets/25-desktop-95_opus_5.5.svg
//
// The style is the grey bevelled desktop of 1995-2000 (Windows 95/98 era):
// teal desktop, navy title bars, 2px bevels, a taskbar. The set piece is a
// disk-defragmenter block map. Nothing here is copied from the real thing:
// no logo, no wordmark, no original icons, no original fonts. The fonts,
// icons, emblem and cursor below are all drawn for this file.
//
// The block map is honest: 828 cells = 140 items + 211 recipes (123 standard,
// 88 alternate) + 477 buildings (9 production machines, 59 logistics, 333
// structure pieces, 76 everything else), and 828 happens to be 69 x 12.
// It starts as confetti and is sorted in reading order by real swaps: the
// block the write head needs is fetched from further down the map and the
// block it displaces goes back in its place, so every frame of the sweep
// holds exactly 140 item cells, 333 structure cells and so on (the generator
// checks this after every step, and the collapse is the same steps undone). Then somebody builds one "temporary" belt
// and the whole thing restarts from 0%.
//
// Drawn in logical pixels (viewBox 415 wide, shown at 2x), everything on the
// pixel grid with shape-rendering=crispEdges. Text is pixel glyphs as merged
// <path>s reused through <use>: no <text>, no web fonts, nothing external.
// Animation is CSS keyframes only. Every element's un-animated state is the
// "52% done" frame, so prefers-reduced-motion just switches animation off.

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(here, '../assets/25-desktop-95_opus_5.5.svg');

// ---------------------------------------------------------------- basics
const W = 415;
const H = 275;

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
const rand = mulberry32(0x19950824);
const n3 = (v) => +v.toFixed(3);

// The stock palette of the style (values as listed in the catalogue entry).
const P = {
  face: '#c0c0c0',
  hi: '#ffffff',
  light: '#dfdfdf',
  shadow: '#808080',
  frame: '#0a0a0a',
  navy: '#000080',
  blue: '#1084d0',
  teal: '#008080',
  ink: '#000000',
};
// The app's own cyan and gold, used inside the banner "bitmap" and for the hex mark.
// (The three tab icons on the taskbar use darker cousins of the app's purple,
// pink and blue so they hold up on the grey.)
const APP = { cyan: '#00cfff', gold: '#e8d44d' };

// ---------------------------------------------------------------- timeline (seconds)
const T = 24; // loop length
const PHASE = 8.2; // a visitor's first frame is this far into the loop (about half done)
const SW0 = 0.9; // sweep starts
const SW1 = 15.3; // sweep ends (100%)
const DLG = 16.9; // the error dialog arrives
const PRESS = 20.55; // OK goes down
const CLOSE = 20.9; // dialog gone
const REF0 = 21.1; // the map falls apart again: the sort played backwards, fast
const REF1 = 22.5;
const STATIC = SW0 + (SW1 - SW0) * 0.525; // the frame shown when motion is off

// ---------------------------------------------------------------- fonts
// UI font: my own proportional pixel sans, cap height 7, x-height 5, 2-row
// descenders. Rows top to bottom, '#' = pixel, glyph width = row length.
const UI = {
  A: '..#..|.#.#.|.#.#.|#...#|#####|#...#|#...#',
  B: '####.|#...#|#...#|####.|#...#|#...#|####.',
  C: '.###.|#...#|#....|#....|#....|#...#|.###.',
  D: '####.|#...#|#...#|#...#|#...#|#...#|####.',
  E: '####|#...|#...|###.|#...|#...|####',
  F: '####|#...|#...|###.|#...|#...|#...',
  G: '.###.|#...#|#....|#.###|#...#|#...#|.###.',
  H: '#...#|#...#|#...#|#####|#...#|#...#|#...#',
  I: '#|#|#|#|#|#|#',
  J: '..#|..#|..#|..#|..#|#.#|.#.',
  K: '#...#|#..#.|#.#..|##...|#.#..|#..#.|#...#',
  L: '#...|#...|#...|#...|#...|#...|####',
  M: '#...#|##.##|#.#.#|#.#.#|#...#|#...#|#...#',
  N: '#...#|##..#|##..#|#.#.#|#..##|#..##|#...#',
  O: '.###.|#...#|#...#|#...#|#...#|#...#|.###.',
  P: '####.|#...#|#...#|####.|#....|#....|#....',
  Q: '.###.|#...#|#...#|#...#|#.#.#|#..#.|.##.#',
  R: '####.|#...#|#...#|####.|#.#..|#..#.|#...#',
  S: '.###.|#...#|#....|.###.|....#|#...#|.###.',
  T: '#####|..#..|..#..|..#..|..#..|..#..|..#..',
  U: '#...#|#...#|#...#|#...#|#...#|#...#|.###.',
  V: '#...#|#...#|#...#|.#.#.|.#.#.|..#..|..#..',
  W: '#...#|#...#|#...#|#.#.#|#.#.#|##.##|#...#',
  X: '#...#|#...#|.#.#.|..#..|.#.#.|#...#|#...#',
  Y: '#...#|#...#|.#.#.|..#..|..#..|..#..|..#..',
  Z: '#####|....#|...#.|..#..|.#...|#....|#####',
  a: '....|....|.##.|...#|.###|#..#|.###',
  b: '#...|#...|###.|#..#|#..#|#..#|###.',
  c: '....|....|.###|#...|#...|#...|.###',
  d: '...#|...#|.###|#..#|#..#|#..#|.###',
  e: '....|....|.##.|#..#|####|#...|.###',
  f: '.##|#..|###|#..|#..|#..|#..',
  g: '....|....|.###|#..#|#..#|#..#|.###|...#|.##.',
  h: '#...|#...|###.|#..#|#..#|#..#|#..#',
  i: '#|.|#|#|#|#|#',
  j: '.#|..|.#|.#|.#|.#|.#|.#|#.',
  k: '#...|#...|#..#|#.#.|##..|#.#.|#..#',
  l: '#|#|#|#|#|#|#',
  m: '.....|.....|####.|#.#.#|#.#.#|#.#.#|#.#.#',
  n: '....|....|###.|#..#|#..#|#..#|#..#',
  o: '....|....|.##.|#..#|#..#|#..#|.##.',
  p: '....|....|###.|#..#|#..#|#..#|###.|#...|#...',
  q: '....|....|.###|#..#|#..#|#..#|.###|...#|...#',
  r: '...|...|#.#|##.|#..|#..|#..',
  s: '....|....|.###|#...|.##.|...#|###.',
  t: '.#.|.#.|###|.#.|.#.|.#.|..#',
  u: '....|....|#..#|#..#|#..#|#..#|.###',
  v: '.....|.....|#...#|#...#|.#.#.|.#.#.|..#..',
  w: '.....|.....|#...#|#.#.#|#.#.#|#.#.#|.#.#.',
  x: '....|....|#..#|#..#|.##.|#..#|#..#',
  y: '....|....|#..#|#..#|#..#|#..#|.###|...#|.##.',
  z: '....|....|####|...#|.##.|#...|####',
  0: '.##.|#..#|#..#|#..#|#..#|#..#|.##.',
  1: '.#.|##.|.#.|.#.|.#.|.#.|###',
  2: '.##.|#..#|...#|..#.|.#..|#...|####',
  3: '.##.|#..#|...#|.##.|...#|#..#|.##.',
  4: '...#|..##|.#.#|#..#|####|...#|...#',
  5: '####|#...|###.|...#|...#|#..#|.##.',
  6: '.##.|#...|#...|###.|#..#|#..#|.##.',
  7: '####|...#|...#|..#.|..#.|.#..|.#..',
  8: '.##.|#..#|#..#|.##.|#..#|#..#|.##.',
  9: '.##.|#..#|#..#|.###|...#|...#|.##.',
  '.': '.|.|.|.|.|.|#',
  ',': '..|..|..|..|..|..|.#|#.',
  ':': '.|.|.|#|.|.|#',
  '!': '#|#|#|#|#|.|#',
  '?': '.##.|#..#|...#|..#.|.#..|....|.#..',
  '-': '...|...|...|...|###|...|...',
  '/': '..#|..#|.#.|.#.|.#.|#..|#..',
  '(': '.#|#.|#.|#.|#.|#.|.#',
  ')': '#.|.#|.#|.#|.#|.#|#.',
  '"': '#.#|#.#|...|...|...|...|...',
  "'": '#|#|.|.|.|.|.',
  '%': '##..#|##.#.|...#.|..#..|.#...|.#.##|#..##',
  '&': '.#...|#.#..|#.#..|.#...|#.#.#|#..#.|.##.#',
  '+': '.....|.....|..#..|..#..|#####|..#..|..#..',
};

// Editor font: a plain 5x7 monospace (as in the other generators here), so the
// batch file reads like a text editor and not like a dialog.
const F5 = {
  A: '.###.|#...#|#...#|#####|#...#|#...#|#...#',
  C: '.###.|#...#|#....|#....|#....|#...#|.###.',
  F: '#####|#....|#....|####.|#....|#....|#....',
  I: '.###.|..#..|..#..|..#..|..#..|..#..|.###.',
  L: '#....|#....|#....|#....|#....|#....|#####',
  O: '.###.|#...#|#...#|#...#|#...#|#...#|.###.',
  R: '####.|#...#|#...#|####.|#.#..|#..#.|#...#',
  S: '.####|#....|#....|.###.|....#|....#|####.',
  T: '#####|..#..|..#..|..#..|..#..|..#..|..#..',
  U: '#...#|#...#|#...#|#...#|#...#|#...#|.###.',
  Y: '#...#|#...#|.#.#.|..#..|..#..|..#..|..#..',
  a: '.....|.....|.###.|....#|.####|#...#|.####',
  b: '#....|#....|#.##.|##..#|#...#|#...#|####.',
  c: '.....|.....|.###.|#....|#....|#...#|.###.',
  d: '....#|....#|.##.#|#..##|#...#|#...#|.####',
  e: '.....|.....|.###.|#...#|#####|#....|.###.',
  f: '..##.|.#..#|.#...|###..|.#...|.#...|.#...',
  g: '.....|.....|.####|#...#|#...#|#...#|.####|....#|.###.',
  h: '#....|#....|#.##.|##..#|#...#|#...#|#...#',
  i: '..#..|.....|.##..|..#..|..#..|..#..|.###.',
  j: '...#.|.....|..##.|...#.|...#.|...#.|...#.|#..#.|.##..',
  k: '#....|#....|#..#.|#.#..|##...|#.#..|#..#.',
  l: '.##..|..#..|..#..|..#..|..#..|..#..|.###.',
  m: '.....|.....|##.#.|#.#.#|#.#.#|#.#.#|#...#',
  n: '.....|.....|#.##.|##..#|#...#|#...#|#...#',
  o: '.....|.....|.###.|#...#|#...#|#...#|.###.',
  p: '.....|.....|####.|#...#|#...#|#...#|####.|#....|#....',
  q: '.....|.....|.####|#...#|#...#|#...#|.####|....#|....#',
  r: '.....|.....|#.##.|##..#|#....|#....|#....',
  s: '.....|.....|.####|#....|.###.|....#|####.',
  t: '.#...|.#...|###..|.#...|.#...|.#..#|..##.',
  u: '.....|.....|#...#|#...#|#...#|#..##|.##.#',
  v: '.....|.....|#...#|#...#|#...#|.#.#.|..#..',
  w: '.....|.....|#...#|#...#|#.#.#|#.#.#|.#.#.',
  x: '.....|.....|#...#|.#.#.|..#..|.#.#.|#...#',
  y: '.....|.....|#...#|#...#|#...#|#...#|.####|....#|.###.',
  z: '.....|.....|#####|...#.|..#..|.#...|#####',
  0: '.###.|#...#|#..##|#.#.#|##..#|#...#|.###.',
  1: '..#..|.##..|..#..|..#..|..#..|..#..|.###.',
  3: '#####|...#.|..#..|...#.|....#|#...#|.###.',
  '.': '.....|.....|.....|.....|.....|.##..|.##..',
  ',': '.....|.....|.....|.....|.....|.##..|.##..|..#..|.#...',
  ':': '.....|.##..|.##..|.....|.##..|.##..|.....',
  '-': '.....|.....|.....|.###.|.....|.....|.....',
  '+': '.....|..#..|..#..|#####|..#..|..#..|.....',
  '/': '....#|....#|...#.|..#..|.#...|#....|#....',
  '(': '...#.|..#..|.#...|.#...|.#...|..#..|...#.',
  ')': '.#...|..#..|...#.|...#.|...#.|..#..|.#...',
};

// Rows of '#' into one path of merged rectangles (runs merged vertically too).
function bitmapPath(rows, ox = 0, oy = 0) {
  const rects = [];
  let open = new Map();
  rows.forEach((row, y) => {
    const next = new Map();
    for (let x = 0; x < row.length; ) {
      if (row[x] !== '#') { x++; continue; }
      let x2 = x;
      while (x2 < row.length && row[x2] === '#') x2++;
      const key = `${x},${x2 - x}`;
      const rc = open.get(key) || (rects.push({ x, y, w: x2 - x, h: 0 }), rects[rects.length - 1]);
      rc.h++;
      next.set(key, rc);
      x = x2;
    }
    open = next;
  });
  return rects.map((r) => `M${ox + r.x} ${oy + r.y}h${r.w}v${r.h}h${-r.w}z`).join('');
}

// Multi-colour pixel sprite: rows of palette characters, one merged path per colour.
function sprite(rows, pal, ox = 0, oy = 0) {
  const w = rows[0].length;
  rows.forEach((r, i) => { if (r.length !== w) throw new Error(`sprite row ${i} "${r}" is ${r.length} wide, expected ${w}`); });
  let s = '';
  for (const [ch, col] of Object.entries(pal)) {
    const d = bitmapPath(rows.map((r) => [...r].map((c) => (c === ch ? '#' : '.')).join('')), ox, oy);
    if (d) s += `<path fill="${col}" d="${d}"/>`;
  }
  return s;
}
const VGA = {
  k: P.frame, w: '#ffffff', s: '#c0c0c0', g: '#808080', y: '#ffff00', o: '#808000', r: '#ff0000', m: '#800000',
  b: '#0000ff', n: '#000080', t: '#008080', c: '#00ffff', l: '#00ff00', e: '#008000', p: '#ff00ff', u: '#800080',
};

// bold = the glyph OR-ed with itself one pixel to the right (a few letters
// clog when smeared, so they are drawn by hand); mono = fixed advance.
const BOLD = {
  A: '..###..|.##.##.|.##.##.|##...##|#######|##...##|##...##',
  M: '##...##|###.###|#######|##.#.##|##...##|##...##|##...##',
  W: '##...##|##...##|##...##|##.#.##|##.#.##|#######|.##.##.',
  m: '.......|.......|######.|##.#.##|##.#.##|##.#.##|##.#.##',
  w: '.......|.......|##...##|##.#.##|##.#.##|#######|.##.##.',
};
function makeFont(prefix, table, { bold = false, mono = 0, space = 3 } = {}) {
  const used = new Map();
  const rowsOf = (ch) => {
    const src = table[ch];
    if (src === undefined) throw new Error(`font ${prefix}: no glyph for ${JSON.stringify(ch)}`);
    let rows = src.split('|');
    if (bold && BOLD[ch]) return BOLD[ch].split('|');
    if (bold) {
      rows = rows.map((r) => {
        const a = `${r}.`;
        const b = `.${r}`;
        return [...a].map((c, i) => (c === '#' || b[i] === '#' ? '#' : '.')).join('');
      });
    }
    return rows;
  };
  const font = {
    glyphW: (ch) => rowsOf(ch)[0].length,
    adv: (ch) => (mono || (ch === ' ' ? space : rowsOf(ch)[0].length + 1)),
    id(ch) {
      const id = prefix + ch.codePointAt(0).toString(36);
      if (!used.has(id)) used.set(id, bitmapPath(rowsOf(ch)));
      return id;
    },
    width: (str) => [...str].reduce((w, ch) => w + font.adv(ch), 0) - (mono ? 0 : 1),
    defs: () => [...used].map(([id, d]) => `<path id="${id}" d="${d}"/>`).join(''),
  };
  return font;
}
const ui = makeFont('u', UI);
const uib = makeFont('b', UI, { bold: true, space: 4 });
const mono = makeFont('m', F5, { mono: 6 });

// A run of glyphs. `ul` underlines that character index (menu/button accelerator).
function text(font, str, x, y, fill = P.ink, { ul = -1, attrs = '' } = {}) {
  let s = `<g transform="translate(${x} ${y})" fill="${fill}"${attrs ? ` ${attrs}` : ''}>`;
  let cx = 0;
  [...str].forEach((ch, i) => {
    if (ch !== ' ') s += `<use href="#${font.id(ch)}"${cx ? ` x="${cx}"` : ''}/>`;
    if (i === ul) s += `<path d="M${cx} 8h${font.glyphW(ch)}v1h${-font.glyphW(ch)}z"/>`;
    cx += font.adv(ch);
  });
  return `${s}</g>`;
}
const textC = (font, str, cx, y, fill, o) => text(font, str, Math.round(cx - font.width(str) / 2), y, fill, o);
const textR = (font, str, rx, y, fill, o) => text(font, str, rx - font.width(str), y, fill, o);

// ---------------------------------------------------------------- bevels
const rect = (x, y, w, h, fill, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"${extra ? ` ${extra}` : ''}/>`;
// 1px L-shapes: top+left edge, and bottom+right edge (which owns both far corners).
const tl = (x, y, w, h) => `M${x} ${y}h${w - 1}v1h${-(w - 2)}v${h - 2}h-1z`;
const br = (x, y, w, h) => `M${x} ${y + h}h${w}v${-h}h-1v${h - 1}h${-(w - 1)}z`;
const BEVEL = {
  win: [P.light, P.hi, P.shadow, P.frame], // window frame
  btn: [P.hi, P.light, P.shadow, P.frame], // push button
  sunk: [P.shadow, P.frame, P.light, P.hi], // text field, map, progress well
  down: [P.frame, P.shadow, P.light, P.hi], // button held down
};
function bevel(x, y, w, h, kind, face = P.face) {
  const [a, b, c, d] = BEVEL[kind];
  return (
    rect(x, y, w, h, face) +
    `<path fill="${a}" d="${tl(x, y, w, h)}"/><path fill="${d}" d="${br(x, y, w, h)}"/>` +
    `<path fill="${b}" d="${tl(x + 1, y + 1, w - 2, h - 2)}"/><path fill="${c}" d="${br(x + 1, y + 1, w - 2, h - 2)}"/>`
  );
}
// 1px sunken edge (status cells, the clock tray)
const thin = (x, y, w, h) => `<path fill="${P.shadow}" d="${tl(x, y, w, h)}"/><path fill="${P.hi}" d="${br(x, y, w, h)}"/>`;

function button(x, y, w, h, label, { ul = -1, font = ui, down = false, focus = false } = {}) {
  const o = down ? 1 : 0;
  let s = bevel(x, y, w, h, down ? 'down' : 'btn');
  s += textC(font, label, x + w / 2 + o, y + Math.floor((h - 7) / 2) + o, P.ink, { ul });
  if (focus) {
    // dotted focus rectangle, 3px inside the edge
    let d = '';
    const fx = x + 3 + o, fy = y + 3 + o, fw = w - 6, fh = h - 6;
    for (let i = 0; i < fw; i += 2) d += `M${fx + i} ${fy}h1v1h-1zM${fx + i + 1} ${fy + fh - 1}h1v1h-1z`;
    for (let i = 2; i < fh - 1; i += 2) d += `M${fx} ${fy + i}h1v1h-1zM${fx + fw - 1} ${fy + i - 1}h1v1h-1z`;
    s += `<path fill="${P.ink}" d="${d}"/>`;
  }
  return s;
}

// Small title-bar buttons. Glyphs are 6x5 bitmaps of my own.
const TB = {
  min: '......|......|......|.####.|.####.',
  max: '######|######|#....#|#....#|######',
  close: '##..##|.####.|..##..|.####.|##..##',
};
const titleButton = (x, y, kind) => bevel(x, y, 11, 9, 'btn') + `<path fill="${P.ink}" d="${bitmapPath(TB[kind].split('|'), x + 2, y + 2)}"/>`;

// hexagon-and-hole mark, 8x8, for title bars and the taskbar
const MARK = '...##...|.######.|###..###|##....##|##....##|###..###|.######.|...##...'.split('|');
const mark = (x, y, fill = APP.gold, shade = P.frame) =>
  `<path fill="${shade}" d="${bitmapPath(MARK, x + 1, y + 1)}"/><path fill="${fill}" d="${bitmapPath(MARK, x, y)}"/>`;

// A window: frame, title bar, caption, buttons. Returns the markup.
function windowFrame(x, y, w, h, caption, { active = true, buttons = ['min', 'max', 'close'], icon = true } = {}) {
  let s = bevel(x, y, w, h, 'win');
  s += rect(x + 3, y + 3, w - 6, 11, `url(#${active ? 'ta' : 'ti'})`);
  let tx = x + 6;
  if (icon) { s += mark(x + 5, y + 4, active ? APP.gold : P.light, active ? P.frame : '#606060'); tx = x + 16; }
  s += text(uib, caption, tx, y + 5, active ? P.hi : P.face);
  return s + titleButtons(x, y, w, buttons);
}
function titleButtons(x, y, w, buttons) {
  let s = '';
  let bx = x + w - 3 - 1 - 11;
  for (const kind of [...buttons].reverse()) {
    s += titleButton(bx, y + 4, kind);
    bx -= kind === 'close' ? 13 : 11;
  }
  return s;
}

// ---------------------------------------------------------------- CSS helpers
const css = [];
let kfCount = 0;
const pct = (t, dur = T) => `${n3((t / dur) * 100)}%`;
// Discrete keyframes (step-end). events = [[time, 'css'], ...]; the state before
// the first event is the state of the last one (it is a loop). Returns the name.
function stepKF(events) {
  const name = `k${(kfCount++).toString(36)}`;
  const ev = [...events].sort((a, b) => a[0] - b[0]);
  let out = `@keyframes ${name}{`;
  if (ev[0][0] > 0) out += `0%{${ev[ev.length - 1][1]}}`;
  for (const [t, v] of ev) out += `${pct(t)}{${v}}`;
  css.push(`${out}}`);
  return name;
}
const ON = 'opacity:1';
const OFF = 'opacity:0';
// class + style for an element that is only visible during [from, to) each loop
// (to < from means the interval wraps round the loop point).
function during(from, to) {
  const name = stepKF([[from, ON], [to, OFF]]);
  const on = from <= to ? STATIC >= from && STATIC < to : STATIC >= from || STATIC < to;
  return `class="a${on ? '' : ' z'}" style="animation-name:${name}"`;
}
css.push(`.a{animation:${T}s step-end ${-PHASE}s infinite}.z{opacity:0}`);

const extraDefs = [];
const parts = [];
const push = (s) => parts.push(s);

// ---------------------------------------------------------------- desktop
push(rect(0, 0, W, H, P.teal));

// Desktop icons: all original pixel art, flat 16-colour palette.
const ICONS = [
  {
    name: 'Factory',
    rows: [
      '...............g.g..',
      '................g...',
      '...............kkkk.',
      '...............krrk.',
      '...............kwwk.',
      '....k....k....kkssk.',
      '...kk...kk...kkkssk.',
      '..kck..kck..kckkssk.',
      '.kcck.kcck.kcckkssk.',
      'kccckkccckkccckkssk.',
      'kkkkkkkkkkkkkkkkkkk.',
      'kwwwwwwwwwwwwwwwwgk.',
      'kwsyysssyysssyyssgk.',
      'kwsyysssyysssyyssgk.',
      'kwsssssssssssssssgk.',
      'kwssssskkkkssssssgk.',
      'kwssssskookssssssgk.',
      'kwssssskookssssssgk.',
      'kkkkkkkkkkkkkkkkkkk.',
    ],
  },
  {
    name: 'Hard Drive',
    rows: [
      '...kkkkkkkkkkkkkkkkkk.',
      '..kwwwwwwwwwwwwwwwwsk.',
      '.kwwwwwwwwwwwwwwwwsgk.',
      'kkkkkkkkkkkkkkkkkkggk.',
      'kwwwwwwwwwwwwwwwwkggk.',
      'kwssssssssssssssskggk.',
      'kwskkkkkkkkkssllskggk.',
      'kwssssssssssssssskggk.',
      'kwssssssssssssssskgk..',
      'kwgggggggggggggggkk...',
      'kkkkkkkkkkkkkkkkkk....',
    ],
  },
  {
    name: 'Spaghetti',
    rows: [
      '.......mrrrm........',
      '.....yyrrrrryy......',
      '...yyoyyyrryyoyy....',
      '..yoyyyoyyyyoyyyoy..',
      '.yyyoyyyoyyoyyyoyyy.',
      'kkyoyyyoyyyyoyyyoykk',
      'kwkkkkkkkkkkkkkkkkgk',
      'kwwwwwwwwwwwwwwwwsgk',
      '.kwwwwwwwwwwwwwwsgk.',
      '..kwwwwwwwwwwwwsgk..',
      '...kkwwwwwwwwsgkk...',
      '.....kksssssgkk.....',
      '.......kkkkkk.......',
    ],
  },
  {
    name: 'Sink',
    rows: [
      'kkkkkkkkkkkkkkkkkk',
      'kppppppppppppppuuk',
      '.kppppppppppppuuk.',
      '..kppppppppppuuk..',
      '...kppppppppuuk...',
      '....kppppppuuk....',
      '.....kkkkkkkk.....',
      '.....kwssssgk.....',
      '.....kwkkkkgk.....',
      '.....kwsyysgk.....',
      '.....kwsyysgk.....',
      '.....kwssssgk.....',
      '.....kkkkkkkk.....',
    ],
  },
];
ICONS.forEach((ic, i) => {
  const top = 7 + i * 39;
  const w = ic.rows[0].length;
  const h = ic.rows.length;
  push(sprite(ic.rows, VGA, 26 - Math.floor(w / 2), top + 19 - h));
  push(textC(ui, ic.name, 26, top + 22, P.hi));
});

// ---------------------------------------------------------------- RUNME.BAT (an editor window)
{
  const x = 5, y = 169, w = 277, h = 86;
  let s = windowFrame(x, y, w, h, 'RUNME.BAT', { active: false });
  // menu bar with accelerator underlines
  let mx = x + 8;
  for (const m of ['File', 'Edit', 'Search', 'Help']) {
    s += text(ui, m, mx, y + 17, P.ink, { ul: 0 });
    mx += ui.width(m) + 9;
  }
  // sunken white page
  const fx = x + 3, fy = y + 27, fw = w - 6, fh = h - 30;
  s += bevel(fx, fy, fw, fh, 'sunk', P.hi);
  // vertical scrollbar: dithered track, arrow buttons, thumb
  const sx = fx + fw - 2 - 10, sy = fy + 2, sh = fh - 4;
  s += rect(sx, sy, 10, sh, 'url(#dither)');
  s += bevel(sx, sy, 10, 10, 'btn') + `<path fill="${P.ink}" d="${bitmapPath('..#..|.###.|#####'.split('|'), sx + 2, sy + 3)}"/>`;
  s += bevel(sx, sy + sh - 10, 10, 10, 'btn') + `<path fill="${P.ink}" d="${bitmapPath('#####|.###.|..#..'.split('|'), sx + 2, sy + sh - 6)}"/>`;
  s += bevel(sx, sy + 10, 10, 17, 'btn');
  const lines = [
    'rem unofficial fan app. runs in a browser:',
    'rem lukexyz.github.io/ULTRA-SATISFACTORY',
    'rem or locally, from the repo root:',
    'python -m pip install -r requirements.txt',
    'python -m streamlit run app/app.py',
  ];
  lines.forEach((ln, i) => {
    if (mono.width(ln) > sx - (fx + 5)) throw new Error(`editor line too wide: ${ln}`);
    s += text(mono, ln, fx + 5, fy + 4 + i * 10, P.ink);
  });
  push(s);
}

// ---------------------------------------------------------------- the block map data
const COLS = 69;
const ROWS = 12;
const CW = 5; // cell pitch: 4px cell + 1px white gap
const CH = 6; // 5px cell + 1px white gap
// Band order, top to bottom (the legend lists them the same way). The big blue
// band sits second so the unsorted remainder stays colourful for most of the sweep.
const CATS = [
  { name: 'Items', n: 140, col: '#ff00ff' },
  { name: 'Structure pieces', n: 333, col: '#0000ff' },
  { name: 'Logistics', n: 59, col: '#00ffff' },
  { name: 'Production machines', n: 9, col: '#00ff00' },
  { name: 'Other buildings', n: 76, col: '#008080' },
  { name: 'Standard recipes', n: 123, col: '#ffff00' },
  { name: 'Alternate recipes', n: 88, col: '#808000' },
];
const CELLS = CATS.reduce((a, c) => a + c.n, 0);
{
  const n = Object.fromEntries(CATS.map((c) => [c.name, c.n]));
  const buildings = n['Structure pieces'] + n.Logistics + n['Production machines'] + n['Other buildings'];
  const recipes = n['Standard recipes'] + n['Alternate recipes'];
  if (CELLS !== COLS * ROWS) throw new Error(`map is ${CELLS} cells, grid is ${COLS * ROWS}`);
  if (n.Items !== 140 || recipes !== 211 || n['Alternate recipes'] !== 88 || buildings !== 477 || n['Other buildings'] !== 26 + 15 + 14 + 7 + 7 + 7) {
    throw new Error('legend counts do not add up');
  }
}

const sorted = [];
CATS.forEach((c, i) => { for (let k = 0; k < c.n; k++) sorted.push(i); });
const bandEnd = [];
CATS.reduce((a, c, i) => (bandEnd[i] = a + c.n), 0);
// The fragmented state: every category chopped into short runs, runs shuffled.
const fragmented = [];
{
  const runs = [];
  CATS.forEach((c, i) => {
    let left = c.n;
    while (left > 0) {
      const n = Math.min(left, 1 + Math.floor(rand() * rand() * 4.5));
      runs.push([i, n]);
      left -= n;
    }
  });
  for (let i = runs.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [runs[i], runs[j]] = [runs[j], runs[i]];
  }
  for (const [i, n] of runs) for (let k = 0; k < n; k++) fragmented.push(i);
}
// A set of cells (Map: position -> category) as one merged path per colour class.
function cellPaths(cells) {
  const byCat = CATS.map(() => '');
  const pos = [...cells.keys()].sort((a, b) => a - b);
  for (let i = 0; i < pos.length; ) {
    const p = pos[i];
    const cat = cells.get(p);
    let j = i + 1;
    while (j < pos.length && pos[j] === p + (j - i) && cells.get(pos[j]) === cat && Math.floor(pos[j] / COLS) === Math.floor(p / COLS)) j++;
    byCat[cat] += `M${(p % COLS) * CW} ${Math.floor(p / COLS) * CH}h${(j - i) * CW}v${CH}h${-(j - i) * CW}z`;
    i = j;
  }
  return byCat.map((d, c) => (d ? `<path class="c${c}" d="${d}"/>` : '')).join('');
}
css.push(CATS.map((c, i) => `.c${i}{fill:${c.col}}`).join(''));

// Sweep chunks: the defragmenter moves a handful of cells at a time.
const chunks = [];
for (let a = 0; a < CELLS; ) {
  const b = Math.min(CELLS, a + 5 + Math.floor(rand() * 9));
  // t = when the head finishes the chunk; r = when it is undone again (last chunk first,
  // so the collapse replays the sort backwards and stays a permutation too)
  chunks.push({ a, b, t: SW0 + ((SW1 - SW0) * b) / CELLS, r: REF0 + ((REF1 - REF0) * (CELLS - b)) / CELLS });
  a = b;
}

// The sort itself, one chunk per step, by swaps. For each cell the write head
// reaches that holds the wrong kind of block, a block of the right kind is
// fetched from beyond that kind's own band (there is always one: the band is
// not full yet) and the displaced block is put where the fetched one was. So
// the map is a permutation of the same 828 blocks at every step.
//   chunk.cells = what changes when the step lands: its own cells, now sorted,
//                 plus the far cells that received the displaced blocks
//   chunk.pick  = where the head reads from during the step (red)
{
  const cur = [...fragmented];
  const shown = [...fragmented]; // what the layered SVG shows: base + every landed chunk, in order
  for (const c of chunks) {
    c.cells = new Map();
    c.pick = -1;
    let scan = -1;
    for (let i = c.a; i < c.b; i++) {
      const want = sorted[i];
      c.cells.set(i, want);
      if (cur[i] === want) continue;
      const lo = bandEnd[want];
      const span = CELLS - lo;
      if (scan < lo) {
        const from = Math.max(lo, c.b);
        scan = from + Math.floor(rand() * Math.min(CELLS - from, 240));
      }
      let j = -1;
      for (let n = 0; n < span && j < 0; n++) {
        const p = lo + ((scan - lo + n) % span);
        if (cur[p] === want) j = p;
      }
      if (j < 0) throw new Error(`no block of kind ${want} left to fetch for cell ${i}`);
      cur[j] = cur[i];
      cur[i] = want;
      scan = j + 1;
      if (j >= c.b) {
        c.cells.set(j, cur[j]);
        if (c.pick < 0) c.pick = j;
      }
    }
    for (const [p, cat] of c.cells) shown[p] = cat;
    for (let p = 0; p < CELLS; p++) {
      if (shown[p] !== cur[p]) throw new Error(`layered map disagrees with the sort at cell ${p}`);
      if (p < c.b && cur[p] !== sorted[p]) throw new Error(`cell ${p} is behind the head but not sorted`);
    }
    CATS.forEach((cat, k) => {
      if (cur.filter((v) => v === k).length !== cat.n) throw new Error(`${cat.name} count drifted`);
    });
  }
}

// ---------------------------------------------------------------- Legend window
{
  const x = 286, y = 169, w = 125, h = 86;
  let s = windowFrame(x, y, w, h, 'Legend', { active: false, buttons: ['close'], icon: false });
  CATS.forEach((c, i) => {
    const ry = y + 19 + i * 9;
    s += rect(x + 7, ry, 8, 7, P.frame) + rect(x + 8, ry + 1, 6, 5, c.col);
    s += text(ui, c.name, x + 19, ry, P.ink);
    s += textR(ui, String(c.n), x + w - 7, ry, P.ink);
  });
  push(s);
}

// ---------------------------------------------------------------- the main window
const MX = 52, MY = 4, MW = 359, MH = 160;
const MAP = { x: MX + 7, y: MY + 57, w: COLS * CW, h: ROWS * CH };
{
  let s = windowFrame(MX, MY, MW, MH, 'ULTRA-SATISFACTORY - Defragmenting Factory (F:)');
  // the inactive title bar, shown while the error dialog has the focus
  s += `<g ${during(DLG, CLOSE)}>${rect(MX + 3, MY + 3, MW - 6, 11, 'url(#ti)')}${mark(MX + 5, MY + 4, P.light, '#606060')}${text(uib, 'ULTRA-SATISFACTORY - Defragmenting Factory (F:)', MX + 16, MY + 5, P.face)}</g>`;
  s += titleButtons(MX, MY, MW, ['min', 'max', 'close']);
  push(s);
}

// --- banner: a splash bitmap in the style of a 90s installer backdrop
// (blue-to-black bands, bold italic title with a hard drop shadow).
const BAN = { x: MX + 5, y: MY + 16, w: MW - 10, h: 36 };
{
  let s = bevel(BAN.x, BAN.y, BAN.w, BAN.h, 'sunk', '#000');
  const bands = 16;
  for (let i = 0; i < bands; i++) {
    const v = Math.round(168 * (1 - i / (bands - 1)));
    s += rect(BAN.x + 2, BAN.y + 2 + i * 2, BAN.w - 4, 2, `rgb(0,0,${v})`);
  }
  push(s);
}

// Display lettering, built from rectangles, rounded rings and wedges, slanted
// and rasterised here onto the pixel grid (no anti-aliasing, as a 1995 bitmap).
const LW = 14, LH = 17, SV = 4, SHB = 3, RO = 4.5, RI = 1.5, SHEAR = 0.2;
const inRR = (px, py, x, y, w, h, r) => {
  if (px < x || px >= x + w || py < y || py >= y + h) return false;
  const cx = Math.max(x + r, Math.min(px, x + w - r));
  const cy = Math.max(y + r, Math.min(py, y + h - r));
  return (px - cx) ** 2 + (py - cy) ** 2 <= r * r;
};
const R_ = (x, y, w, h) => (px, py) => px >= x && px < x + w && py >= y && py < y + h;
const RING = (x, y, w, h, keep = () => true) => (px, py) =>
  keep(px, py) && inRR(px, py, x, y, w, h, RO) && !inRR(px, py, x + SV, y + SHB, w - 2 * SV, h - 2 * SHB, RI);
const POLY = (pts) => (px, py) => {
  let sign = 0;
  for (let i = 0; i < pts.length; i++) {
    const [ax, ay] = pts[i];
    const [bx, by] = pts[(i + 1) % pts.length];
    const c = (bx - ax) * (py - ay) - (by - ay) * (px - ax);
    if (c !== 0) {
      if (sign && Math.sign(c) !== sign) return false;
      sign = Math.sign(c);
    }
  }
  return true;
};
const LETTERS = {
  U: { w: LW, p: [RING(0, -LH, LW, 2 * LH, (x, y) => y >= 0)] },
  L: { w: LW - 1, p: [R_(0, 0, SV, LH), R_(0, LH - SHB, LW - 1, SHB)] },
  T: { w: LW, p: [R_(0, 0, LW, SHB), R_((LW - SV) / 2, 0, SV, LH)] },
  R: { w: LW, p: [R_(0, 0, SV, LH), RING(-5, 0, LW + 5, 10, (x) => x >= SV - 1), POLY([[4.5, 9.5], [8.8, 9.5], [LW + 0.4, LH], [LW - 4.2, LH]])] },
  A: {
    w: LW,
    p: [
      POLY([[0, LH], [4.2, LH], [LW / 2 + 2.1, 0], [LW / 2 - 2.3, 0]]),
      POLY([[LW, LH], [LW - 4.2, LH], [LW / 2 - 2.1, 0], [LW / 2 + 2.3, 0]]),
      R_(3.2, LH - 6.5, LW - 6.4, 3),
    ],
  },
  S: {
    w: LW,
    p: [
      RING(0, 0, LW, 10, (x, y) => !(x > LW / 2 && y > SHB + 1.6)),
      RING(0, 7, LW, 10, (x, y) => !(x < LW / 2 && y < LH - SHB - 1.6)),
    ],
  },
  I: { w: SV, p: [R_(0, 0, SV, LH)] },
  F: { w: LW - 1, p: [R_(0, 0, SV, LH), R_(0, 0, LW - 1, SHB), R_(0, 7, LW - 3, SHB)] },
  C: { w: LW, p: [RING(0, 0, LW, LH, (x, y) => !(x > LW / 2 + 1 && y > 5.5 && y < 11.5))] },
  O: { w: LW, p: [RING(0, 0, LW, LH)] },
  Y: {
    w: LW,
    p: [
      POLY([[0, 0], [4.4, 0], [LW / 2 + 2, 9.2], [LW / 2 - 2, 9.2]]),
      POLY([[LW, 0], [LW - 4.4, 0], [LW / 2 - 2, 9.2], [LW / 2 + 2, 9.2]]),
      R_((LW - SV) / 2, 8.5, SV, LH - 8.5),
    ],
  },
};
const LGAP = 3; // space between letters
// pairs that leave a hole when set at the default gap
const KERN = { LT: -3, FA: -2, TA: -1, AT: -1, TO: -1, RY: -1, AC: -1 };
function letterRows(L) {
  const ext = Math.ceil(SHEAR * LH);
  const rows = [];
  for (let py = 0; py < LH; py++) {
    let row = '';
    for (let px = 0; px < L.w + ext; px++) {
      const y = py + 0.5;
      const x = px + 0.5 - SHEAR * (LH - y);
      row += L.p.some((f) => f(x, y)) ? '#' : '.';
    }
    rows.push(row);
  }
  return rows;
}
function wordWidth(word) {
  let w = 0;
  [...word].forEach((ch, i) => { w += LETTERS[ch].w + (i ? LGAP + (KERN[word[i - 1] + ch] || 0) : 0); });
  return w;
}
function wordPath(word, x, y) {
  let d = '';
  let cx = x;
  [...word].forEach((ch, i) => {
    if (i) cx += LGAP + (KERN[word[i - 1] + ch] || 0);
    d += bitmapPath(letterRows(LETTERS[ch]), cx, y);
    cx += LETTERS[ch].w;
  });
  return d;
}

// The emblem: hexagon ring with a cog inside, rasterised the same way.
function emblemRows(size) {
  const rows = [];
  const c = size / 2;
  const Rh = size / 2;
  const hex = (dx, dy, R) => Math.abs(dx) <= R * 0.866 && Math.abs(dx) / 1.732 + Math.abs(dy) <= R;
  for (let py = 0; py < size; py++) {
    let row = '';
    for (let px = 0; px < size; px++) {
      const dx = px + 0.5 - c;
      const dy = py + 0.5 - c;
      const r = Math.hypot(dx, dy);
      const th = Math.atan2(dy, dx);
      const ring = hex(dx, dy, Rh) && !hex(dx, dy, Rh - 2.6);
      const tooth = Math.cos(8 * th) > 0.15;
      const cog = r > size * 0.095 && r <= (tooth ? size * 0.31 : size * 0.225);
      row += ring || cog ? '#' : '.';
    }
    rows.push(row);
  }
  return rows;
}
{
  // emblem + wordmark, centred in the banner
  const GAP = 12, EM = 26, EMGAP = 9;
  const TAG = 'Every recipe, building and Space Elevator objective, one click apart.';
  const wordsW = wordWidth('ULTRA') + GAP + wordWidth('SATISFACTORY') + Math.ceil(SHEAR * LH);
  const total = EM + EMGAP + Math.max(wordsW, ui.width(TAG));
  if (total > BAN.w - 8) throw new Error(`banner content is ${total} wide`);
  const ex = BAN.x + Math.round((BAN.w - total) / 2), ey = BAN.y + 5;
  const em = bitmapPath(emblemRows(EM));
  extraDefs.push(`<path id="em" d="${em}"/>`);
  let s = `<g transform="translate(${ex} ${ey})"><use href="#em" x="2" y="2"/><use href="#em" x="1" y="1"/><use href="#em" fill="${APP.gold}"/></g>`;
  const wx = ex + EM + EMGAP, wy = BAN.y + 4;
  const a = wordPath('ULTRA', wx, wy);
  const b = wordPath('SATISFACTORY', wx + wordWidth('ULTRA') + GAP, wy);
  extraDefs.push(`<path id="wa" d="${a}"/><path id="wb" d="${b}"/><g id="ws"><use href="#wa"/><use href="#wb"/></g>`);
  s += `<use href="#ws" x="2" y="2"/><use href="#ws" x="1" y="1"/><use href="#wa" fill="${APP.cyan}"/><use href="#wb" fill="#fff"/>`;
  s += text(ui, TAG, wx + 1, BAN.y + 25, APP.gold);
  push(s);
}

// --- the block map
{
  let s = bevel(MAP.x - 2, MAP.y - 2, MAP.w + 4, MAP.h + 4, 'sunk', P.hi);
  s += `<g transform="translate(${MAP.x} ${MAP.y})">`;
  // the fragmented map is the base layer; each chunk's changes land on top of it
  // when the head finishes that chunk and are taken away again, last chunk first,
  // when the factory contents change
  s += cellPaths(new Map(fragmented.map((cat, p) => [p, cat])));
  for (const c of chunks) s += `<g ${during(c.t, c.r)}>${cellPaths(c.cells)}</g>`;
  // red = being moved: three cells at the write head, two where it is reading from
  const pos = (i) => `translate(${(i % COLS) * CW}px,${Math.floor(i / COLS) * CH}px)`;
  const hidden = `opacity:0;transform:${pos(0)}`;
  const at = (i) => (i < 0 ? hidden : `opacity:1;transform:${pos(i)}`);
  const headEv = [[0, hidden]];
  const pickEv = [[0, hidden]];
  let headStatic = hidden;
  let pickStatic = hidden;
  chunks.forEach((c, k) => {
    const t = k === 0 ? SW0 : chunks[k - 1].t;
    headEv.push([t, at(c.a)]);
    pickEv.push([t, at(c.pick)]);
    if (t <= STATIC) { headStatic = at(c.a); pickStatic = at(c.pick); }
  });
  headEv.push([SW1, hidden]);
  pickEv.push([SW1, hidden]);
  s += `<g clip-path="url(#mapClip)">`;
  s += `<rect class="a" width="${CW * 3}" height="${CH}" fill="#f00" style="animation-name:${stepKF(headEv)};${headStatic}"/>`;
  s += `<rect class="a" width="${CW * 2}" height="${CH}" fill="#f00" style="animation-name:${stepKF(pickEv)};${pickStatic}"/>`;
  s += '</g>';
  // white grid: turns the solid runs into separate cells
  let grid = '';
  for (let c = 0; c < COLS; c++) grid += `M${c * CW + CW - 1} 0h1v${MAP.h}h-1z`;
  for (let r = 0; r < ROWS; r++) grid += `M0 ${r * CH + CH - 1}h${MAP.w}v1h${-MAP.w}z`;
  s += `<path fill="#fff" d="${grid}"/></g>`;
  push(s);
}

// --- status line, progress well, buttons
{
  const sx = MX + 5;
  const sy = MAP.y + MAP.h + 5;
  let s = '';
  // hourglass (my own 7x9), three frames
  const HG = [
    ['kkkkkkk', '.kbbbk.', '.kbbbk.', '..kbk..', '...k...', '..k.k..', '.k...k.', '.k...k.', 'kkkkkkk'],
    ['kkkkkkk', '.k...k.', '.kbbbk.', '..kbk..', '...k...', '..kbk..', '.k...k.', '.kbbbk.', 'kkkkkkk'],
    ['kkkkkkk', '.k...k.', '.k...k.', '..k.k..', '...k...', '..kbk..', '.kbbbk.', '.kbbbk.', 'kkkkkkk'],
  ];
  HG.forEach((rows, i) => {
    s += `<g class="hg${i ? ' z' : ''}" style="animation-delay:${n3(-1.2 + i * 0.4)}s">${sprite(rows, VGA, sx + 1, sy)}</g>`;
  });
  css.push('.hg{animation:hg 1.2s step-end infinite}@keyframes hg{0%{opacity:1}33.333%{opacity:0}}');

  // status messages: real recipe lines (checked against the app's data) and things the defragmenter found
  const SLOT = (SW1 - SW0) / 8;
  const msgs = [
    ['Inspecting factory for spaghetti...', REF1 + 0.5, SW0, false],
    ['Moving Iron Plate: 20/min, Constructor, 4 MW', SW0, SW0 + SLOT, true],
    ['Moving Screw: 40/min. The storage box is full.', SW0 + SLOT, SW0 + 2 * SLOT, true],
    ['Belt runs the wrong way. Leaving it as found.', SW0 + 2 * SLOT, SW0 + 3 * SLOT, false],
    ['Moving Rotor: 4/min, Assembler, 15 MW', SW0 + 3 * SLOT, SW0 + 4 * SLOT, true],
    ['Pipe clips through a wall. Pretending not to see.', SW0 + 4 * SLOT, SW0 + 5 * SLOT, false],
    ['Moving Modular Frame: 2/min, Assembler, 60 s', SW0 + 5 * SLOT, SW0 + 6 * SLOT, true],
    ['Manifold or load balancer? Not getting involved.', SW0 + 6 * SLOT, SW0 + 7 * SLOT, false],
    ['Moving Nuclear Pasta: 0.5/min. No rushing it.', SW0 + 7 * SLOT, SW1, true],
    ['Defragmentation complete. The factory is tidy.', SW1, CLOSE, false],
    ['Factory contents changed. Restarting...', CLOSE, REF1 + 0.5, false],
  ];
  for (const [msg, from, to, moving] of msgs) {
    const tx = sx + 11 + (moving ? 7 : 0);
    if (tx + ui.width(msg) > MX + MW - 100) throw new Error(`status line too wide: ${msg}`);
    s += `<g ${during(from, to)}>${moving ? rect(sx + 11, sy + 1, 4, 5, '#f00') : ''}${text(ui, msg, tx, sy, P.ink)}</g>`;
  }

  // progress well with separate navy blocks
  const BLOCKS = 25;
  const px = sx, py = sy + 11;
  s += bevel(px, py, BLOCKS * 6 + 5, 11, 'sunk', P.face);
  for (let i = 0; i < BLOCKS; i++) {
    const t = SW0 + ((SW1 - SW0) * (i + 1)) / BLOCKS;
    s += `<rect ${during(t, REF0)} x="${px + 3 + i * 6}" y="${py + 2}" width="5" height="7" fill="${P.navy}"/>`;
  }
  // "N% complete": only the number changes
  const nx = px + BLOCKS * 6 + 5 + 6 + ui.width('100');
  for (let i = 0; i <= BLOCKS; i++) {
    const from = i === 0 ? REF0 : SW0 + ((SW1 - SW0) * i) / BLOCKS;
    const to = i === BLOCKS ? REF0 : SW0 + ((SW1 - SW0) * (i + 1)) / BLOCKS;
    s += `<g ${during(from, to)}>${textR(ui, String(i * 4), nx, py + 2, P.ink)}</g>`;
  }
  s += text(ui, '% complete', nx + 1, py + 2, P.ink);

  // buttons
  const by = sy + 4;
  s += button(MX + MW - 5 - 41 - 45, by, 41, 15, 'Stop', { ul: 0 });
  s += button(MX + MW - 5 - 41, by, 41, 15, 'Pause', { ul: 0 });
  push(s);
}

// ---------------------------------------------------------------- taskbar
{
  const ty = H - 17;
  let s = rect(0, ty, W, 17, P.face) + rect(0, ty + 1, W, 1, P.hi);
  // the launcher button: a generic hex mark and the word Build
  s += bevel(2, ty + 3, 41, 13, 'btn') + mark(6, ty + 5) + text(uib, 'Build', 17, ty + 6, P.ink);
  // the app's three tabs, as three programs on the taskbar
  const TABS = [
    ['Objectives', '#8a2be2', '...##...|..####..|.######.|...##...|...##...|...##...|.######.|.######.'],
    ['Items', '#e0207a', '.###....|#...#...|#...#...|#...#...|.###....|....##..|.....##.|......##'],
    ['Buildings', P.blue, '..####..|..#..#..|########|#.#..#.#|########|#.#..#.#|########|########'],
  ];
  TABS.forEach(([label, col, bits], i) => {
    const bx = 48 + i * 76;
    s += bevel(bx, ty + 3, 74, 13, 'btn');
    s += `<path fill="${col}" d="${bitmapPath(bits.split('|'), bx + 4, ty + 5)}"/>`;
    s += text(ui, label, bx + 15, ty + 6, P.ink);
  });
  // tray with a clock
  s += thin(W - 62, ty + 3, 60, 13) + mark(W - 58, ty + 5, APP.gold, P.shadow) + textR(ui, '11:59 PM', W - 6, ty + 6, P.ink);
  push(s);
}

// ---------------------------------------------------------------- the error dialog (and its drag trail)
const DLG_LINES = ['Somebody built one "temporary" belt.', 'Factory contents changed. Restarting at 0%.'];
const DW = 34 + Math.max(...DLG_LINES.map((l) => ui.width(l))) + 12;
const DH = 63;
const DX = MX + Math.round((MW - DW) / 2) + 12, DY = 73;
{
  // red disc, white cross: drawn from scratch
  const rows = [];
  for (let py = 0; py < 16; py++) {
    let row = '';
    for (let px = 0; px < 16; px++) {
      const dx = px + 0.5 - 8, dy = py + 0.5 - 8;
      const r = Math.hypot(dx, dy);
      const cross = (Math.abs(dx - dy) < 1.5 || Math.abs(dx + dy) < 1.5) && Math.abs(dx) < 4.2;
      row += r > 8.1 ? '.' : r > 7 ? (dx + dy > 0 ? 'm' : 'k') : cross ? 'w' : 'r';
    }
    rows.push(row);
  }
  let d = windowFrame(0, 0, DW, DH, 'Factory Defragmenter', { buttons: ['close'], icon: false });
  d += sprite(rows, VGA, 10, 19);
  d += text(ui, DLG_LINES[0], 34, 20, P.ink);
  d += text(ui, DLG_LINES[1], 34, 30, P.ink);
  const OKW = 54, OKH = 17, OKX = Math.round((DW - OKW) / 2), OKY = 41;
  const ok = button(OKX, OKY, OKW, OKH, 'OK', { focus: true });
  const okDown = button(OKX, OKY, OKW, OKH, 'OK', { focus: true, down: true });
  extraDefs.push(`<g id="dlg">${d}${ok}</g>`);
  const TRAIL = 4;
  let s = '';
  for (let i = 0; i < TRAIL; i++) {
    const k = TRAIL - 1 - i;
    const x = DX - k * 8, y = DY - k * 5;
    s += `<g ${during(DLG + i * 0.12, CLOSE)} transform="translate(${x} ${y})"><use href="#dlg"/>`;
    if (i === TRAIL - 1) s += `<g ${during(PRESS, CLOSE)}>${okDown}</g>`;
    s += '</g>';
  }
  push(s);
}

// ---------------------------------------------------------------- the pointer
{
  const rows = [
    'k.........',
    'kk........',
    'kwk.......',
    'kwwk......',
    'kwwwk.....',
    'kwwwwk....',
    'kwwwwwk...',
    'kwwwwwwk..',
    'kwwwwwwwk.',
    'kwwwwkkkkk',
    'kwkkwwk...',
    'kk..kwwk..',
    'k...kwwk..',
    '.....kk...',
  ];
  const rest = [MX + MW - 118, MAP.y + MAP.h + 14];
  const okAt = [DX + Math.round(DW / 2) + 10, DY + 51];
  const tr = ([x, y]) => `transform:translate(${x}px,${y}px)`;
  css.push(
    `@keyframes ptr{0%,${pct(PRESS - 1.5)}{${tr(rest)};animation-timing-function:cubic-bezier(.4,0,.2,1)}` +
      `${pct(PRESS - 0.5)},${pct(CLOSE + 0.3)}{${tr(okAt)};animation-timing-function:cubic-bezier(.4,0,.2,1)}` +
      `${pct(CLOSE + 1.5)},100%{${tr(rest)}}}` +
      `.ptr{animation:ptr ${T}s linear ${-PHASE}s infinite}`,
  );
  push(`<g class="ptr" style="${tr(rest)}">${sprite(rows, VGA)}</g>`);
}

// ---------------------------------------------------------------- assemble
const style = css.join('') + '@media (prefers-reduced-motion:reduce){*{animation:none!important}}';
const defs =
  `<linearGradient id="ta" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${P.navy}"/><stop offset="1" stop-color="${P.blue}"/></linearGradient>` +
  `<linearGradient id="ti" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#808080"/><stop offset="1" stop-color="#b5b5b5"/></linearGradient>` +
  `<pattern id="dither" width="2" height="2" patternUnits="userSpaceOnUse"><rect width="2" height="2" fill="${P.hi}"/><path fill="${P.face}" d="M0 0h1v1H0zM1 1h1v1H1z"/></pattern>` +
  `<clipPath id="mapClip"><rect width="${MAP.w}" height="${MAP.h}"/></clipPath>` +
  extraDefs.join('') +
  ui.defs() +
  uib.defs() +
  mono.defs();

const svg =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W * 2}" height="${H * 2}" shape-rendering="crispEdges">` +
  `<title>ULTRA-SATISFACTORY: a mid-90s desktop defragmenting a factory</title>` +
  `<style>${style}</style><defs>${defs}</defs>${parts.join('')}</svg>\n`;

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, svg);
console.log(`wrote ${OUT} (${(svg.length / 1024).toFixed(1)} KB), ${chunks.length} chunks, ${kfCount} keyframe sets`);
