#!/usr/bin/env node
// FM-Synth Keyboard Display: README header generator for ULTRA-SATISFACTORY.
//
//   node examples/ultra-satisfactory/src/18-fm-synth-display_opus_5.5.mjs
//
// Writes examples/ultra-satisfactory/assets/18-fm-synth-display_opus_5.5.svg.
// Plain Node, no dependencies, no clock; the only randomness is a seeded PRNG,
// so every run writes the same bytes.
//
// The style is the status display that Japanese FM-music players drew on the
// Sharp X68000 and NEC PC-98 in the early 1990s (the MMDSP / FMDSP lineage):
// no pattern grid, just one miniature piano keyboard per sound-chip channel
// with the sounding key lit lime green, a control panel with slanted segment
// digits, a segmented spectrum analyser, level bars, pan dials, and a file
// selector along the bottom, all in one lavender on black. Nothing here is
// copied from those programs: the layout is re-drawn, the words, numbers and
// "tune" are this project's own.
//
// What the picture means (all of it is real, and all of it is in real time):
//
//   * The X68000's FM chip is nicknamed OPM. Here OPM is Output Per Minute.
//     Eight OPM tracks and one PCM track (the X68000 had 8 FM voices + 1 ADPCM)
//     are the app's nine production machines, each running one standard recipe.
//   * Every key-on is one item off the line, at the machine's average rate:
//     the Packager (60/min) lands a note a second, the Smelter (30/min) one
//     every 2 s, the Manufacturer (2/min) one every 30 s, and the Particle
//     Accelerator (0.5/min) exactly one per 120 s, which is why the loop is
//     120 s long. Over 12 s six of the tracks play 12:9:8:6:4:1 key-ons.
//     The slice bar on each strip is progress towards its next key-on.
//   * Level bars: height is the machine's power draw in MW (log scale); each
//     bar kicks when its machine finishes an item and decays until the next.
//   * Spectrum: 31 bars, one per distinct output rate (0.25 to 1500 a minute)
//     among the 104 items that have a standard machine recipe in the data.
//     The white peak-hold slice tops out at the real number of items at that
//     rate (tallest: 30/min, 12 items), on a square-root scale.
//   * The panel counters (140 items, 211 recipes, 88 alternates, 477
//     buildings, 5 phases) are the app's own counts.
//
// Facts on screen, checked against ULTRA-SATISFACTORY's data on 2026-09-30
// (get_item_recipe over list_items; see the orchestrator's canonical list):
//   Iron Ingot 30/min 2 s Smelter 4 MW, 1 input; Steel Ingot 45/min 4 s
//   Foundry 16 MW, 2 inputs; Screw 40/min 6 s Constructor 4 MW, 1 input;
//   Reinforced Iron Plate 5/min 12 s Assembler 15 MW, 2 inputs; Heavy Modular
//   Frame 2/min 30 s Manufacturer 55 MW, 4 inputs; Plastic 20/min 6 s Refinery
//   30 MW, 1 input; Packaged Water 60/min 2 s Packager 10 MW, 2 inputs;
//   Cooling System 6/min 10 s Blender 75 MW, 4 inputs; Nuclear Pasta 0.5/min
//   120 s Particle Accelerator, 2 inputs (no power figure quoted: the data
//   lists none). "@" is the number of item cards (out of the 140 listed items)
//   whose standard recipe runs on that machine: Smelter 3, Foundry 2,
//   Constructor 20, Assembler 27, Manufacturer 19, Refinery 11, Packager 13,
//   Blender 7, Particle Accelerator 2 (104 in all). It is NOT the number of
//   standard recipes in the raw data (123: some make things that are not in
//   the item list, some are a second recipe for the same item).
//
// No <text>: every letter is a <use> of a glyph path from the bitmap faces
// below, the segment digits and the wordmark are generated geometry.
// Animation is CSS only and stepped; every period divides the 120 s loop, so
// it repeats without a jump. prefers-reduced-motion freezes it on a complete
// frame (the downbeat: all nine keys lit, the name and every number visible).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '18-fm-synth-display_opus_5.5';
const OUT = path.resolve(HERE, `../assets/${SLUG}.svg`);

// ------------------------------------------------------------------ geometry
const W = 830, H = 664;          // 1 unit = 1 CSS px in GitHub's README column
const LOOP = 120;                // seconds
const SX = 10, SW = 448;         // track strips: 8 octaves x 56 px
const MY = 66, STRIP = 46;       // top of the main block, strip pitch
const PX = 470, PW = 350;        // right-hand panel
const BY = 484;                  // top of the selector block

// ------------------------------------------------------------------ palette
// Lavender on black, grey-white keys, navy fills, and exactly one accent:
// lime, used for nothing but the sounding keys.
const C = {
  bg: '#000000', lav: '#8787ff', hi: '#d6d6ff', dim: '#5656b6', rule: '#36368a',
  navy: '#18183b', navy2: '#101032', key: '#c2c2ca', keylo: '#8d8da0', ink: '#07071a',
  lime: '#77ff22', ghost: '#0d0d28',
};

// ------------------------------------------------------------------ fonts
// 5x7 face with descenders. Rows top to bottom, '#' = pixel.
const F5 = {
  A: '.###.|#...#|#...#|#####|#...#|#...#|#...#', B: '####.|#...#|#...#|####.|#...#|#...#|####.',
  C: '.###.|#...#|#....|#....|#....|#...#|.###.', D: '###..|#..#.|#...#|#...#|#...#|#..#.|###..',
  E: '#####|#....|#....|####.|#....|#....|#####', F: '#####|#....|#....|####.|#....|#....|#....',
  G: '.###.|#...#|#....|#.###|#...#|#...#|.####', H: '#...#|#...#|#...#|#####|#...#|#...#|#...#',
  I: '.###.|..#..|..#..|..#..|..#..|..#..|.###.', J: '..###|...#.|...#.|...#.|...#.|#..#.|.##..',
  K: '#...#|#..#.|#.#..|##...|#.#..|#..#.|#...#', L: '#....|#....|#....|#....|#....|#....|#####',
  M: '#...#|##.##|#.#.#|#.#.#|#...#|#...#|#...#', N: '#...#|#...#|##..#|#.#.#|#..##|#...#|#...#',
  O: '.###.|#...#|#...#|#...#|#...#|#...#|.###.', P: '####.|#...#|#...#|####.|#....|#....|#....',
  Q: '.###.|#...#|#...#|#...#|#.#.#|#..#.|.##.#', R: '####.|#...#|#...#|####.|#.#..|#..#.|#...#',
  S: '.####|#....|#....|.###.|....#|....#|####.', T: '#####|..#..|..#..|..#..|..#..|..#..|..#..',
  U: '#...#|#...#|#...#|#...#|#...#|#...#|.###.', V: '#...#|#...#|#...#|#...#|#...#|.#.#.|..#..',
  W: '#...#|#...#|#...#|#.#.#|#.#.#|#.#.#|.#.#.', X: '#...#|#...#|.#.#.|..#..|.#.#.|#...#|#...#',
  Y: '#...#|#...#|.#.#.|..#..|..#..|..#..|..#..', Z: '#####|....#|...#.|..#..|.#...|#....|#####',
  a: '.....|.....|.###.|....#|.####|#...#|.####', b: '#....|#....|#.##.|##..#|#...#|#...#|####.',
  c: '.....|.....|.###.|#....|#....|#...#|.###.', d: '....#|....#|.##.#|#..##|#...#|#...#|.####',
  e: '.....|.....|.###.|#...#|#####|#....|.###.', f: '..##.|.#..#|.#...|###..|.#...|.#...|.#...',
  g: '.....|.....|.####|#...#|#...#|#...#|.####|....#|.###.', h: '#....|#....|#.##.|##..#|#...#|#...#|#...#',
  i: '..#..|.....|.##..|..#..|..#..|..#..|.###.', j: '...#.|.....|..##.|...#.|...#.|...#.|...#.|#..#.|.##..',
  k: '#....|#....|#..#.|#.#..|##...|#.#..|#..#.', l: '.##..|..#..|..#..|..#..|..#..|..#..|.###.',
  m: '.....|.....|##.#.|#.#.#|#.#.#|#.#.#|#...#', n: '.....|.....|#.##.|##..#|#...#|#...#|#...#',
  o: '.....|.....|.###.|#...#|#...#|#...#|.###.', p: '.....|.....|####.|#...#|#...#|#...#|####.|#....|#....',
  q: '.....|.....|.####|#...#|#...#|#...#|.####|....#|....#', r: '.....|.....|#.##.|##..#|#....|#....|#....',
  s: '.....|.....|.####|#....|.###.|....#|####.', t: '.#...|.#...|###..|.#...|.#...|.#..#|..##.',
  u: '.....|.....|#...#|#...#|#...#|#..##|.##.#', v: '.....|.....|#...#|#...#|#...#|.#.#.|..#..',
  w: '.....|.....|#...#|#...#|#.#.#|#.#.#|.#.#.', x: '.....|.....|#...#|.#.#.|..#..|.#.#.|#...#',
  y: '.....|.....|#...#|#...#|#...#|#...#|.####|....#|.###.', z: '.....|.....|#####|...#.|..#..|.#...|#####',
  0: '.###.|#...#|#..##|#.#.#|##..#|#...#|.###.', 1: '..#..|.##..|..#..|..#..|..#..|..#..|.###.',
  2: '.###.|#...#|....#|...#.|..#..|.#...|#####', 3: '#####|...#.|..#..|...#.|....#|#...#|.###.',
  4: '...#.|..##.|.#.#.|#..#.|#####|...#.|...#.', 5: '#####|#....|####.|....#|....#|#...#|.###.',
  6: '..##.|.#...|#....|####.|#...#|#...#|.###.', 7: '#####|....#|...#.|..#..|.#...|.#...|.#...',
  8: '.###.|#...#|#...#|.###.|#...#|#...#|.###.', 9: '.###.|#...#|#...#|.####|....#|...#.|.##..',
  '.': '.....|.....|.....|.....|.....|.##..|.##..', ',': '.....|.....|.....|.....|.....|.##..|.##..|..#..|.#...',
  ':': '.....|.##..|.##..|.....|.##..|.##..|.....', '!': '..#..|..#..|..#..|..#..|..#..|.....|..#..',
  '?': '.###.|#...#|....#|...#.|..#..|.....|..#..', '-': '.....|.....|.....|.###.|.....|.....|.....',
  _: '.....|.....|.....|.....|.....|.....|.....|#####', '=': '.....|.....|#####|.....|#####|.....|.....',
  '+': '.....|..#..|..#..|#####|..#..|..#..|.....', '/': '....#|....#|...#.|..#..|.#...|#....|#....',
  '(': '...#.|..#..|.#...|.#...|.#...|..#..|...#.', ')': '.#...|..#..|...#.|...#.|...#.|..#..|.#...',
  '<': '...#.|..#..|.#...|#....|.#...|..#..|...#.', '>': '.#...|..#..|...#.|....#|...#.|..#..|.#...',
  '#': '.#.#.|.#.#.|#####|.#.#.|#####|.#.#.|.#.#.', '@': '.###.|#...#|#.###|#.#.#|#.###|#....|.###.',
  "'": '..#..|..#..|.#...|.....|.....|.....|.....', '&': '.##..|#..#.|#.#..|.#...|#.#.#|#..#.|.##.#',
  '%': '##...|##..#|...#.|..#..|.#...|#..##|...##', '·': '.....|.....|.....|..#..|.....|.....|.....',
  '*': '.....|..#..|.#.#.|#...#|.#.#.|..#..|.....',
};

// 3x5 label face, capitals and digits only (lowercase folds to capitals).
const T3 = {
  A: '.#.|#.#|###|#.#|#.#', B: '##.|#.#|##.|#.#|##.', C: '.##|#..|#..|#..|.##',
  D: '##.|#.#|#.#|#.#|##.', E: '###|#..|##.|#..|###', F: '###|#..|##.|#..|#..',
  G: '.##|#..|#.#|#.#|.##', H: '#.#|#.#|###|#.#|#.#', I: '###|.#.|.#.|.#.|###',
  J: '..#|..#|..#|#.#|.#.', K: '#.#|#.#|##.|#.#|#.#', L: '#..|#..|#..|#..|###',
  M: '#.#|###|###|#.#|#.#', N: '##.|#.#|#.#|#.#|#.#', O: '.#.|#.#|#.#|#.#|.#.',
  P: '##.|#.#|##.|#..|#..', Q: '.#.|#.#|#.#|##.|.##', R: '##.|#.#|##.|#.#|#.#',
  S: '.##|#..|.#.|..#|##.', T: '###|.#.|.#.|.#.|.#.', U: '#.#|#.#|#.#|#.#|###',
  V: '#.#|#.#|#.#|#.#|.#.', W: '#.#|#.#|###|###|#.#', X: '#.#|#.#|.#.|#.#|#.#',
  Y: '#.#|#.#|.#.|.#.|.#.', Z: '###|..#|.#.|#..|###',
  0: '###|#.#|#.#|#.#|###', 1: '.#.|##.|.#.|.#.|###', 2: '##.|..#|.#.|#..|###',
  3: '##.|..#|.#.|..#|##.', 4: '#.#|#.#|###|..#|..#', 5: '###|#..|##.|..#|##.',
  6: '.##|#..|###|#.#|###', 7: '###|..#|.#.|.#.|.#.', 8: '###|#.#|###|#.#|###',
  9: '###|#.#|###|..#|##.',
  '.': '...|...|...|...|.#.', ':': '...|.#.|...|.#.|...', '-': '...|...|###|...|...',
  '/': '..#|..#|.#.|#..|#..', '+': '...|.#.|###|.#.|...', ',': '...|...|...|.#.|#..',
  '(': '.#.|#..|#..|#..|.#.', ')': '.#.|..#|..#|..#|.#.', '!': '.#.|.#.|.#.|...|.#.',
  '?': '##.|..#|.#.|...|.#.', '>': '#..|.#.|..#|.#.|#..', '<': '..#|.#.|#..|.#.|..#',
  '=': '...|###|...|###|...', "'": '.#.|.#.|...|...|...', _: '...|...|...|...|###',
  '·': '...|...|.#.|...|...', '%': '#.#|..#|.#.|#..|#.#', '&': '.#.|#.#|.#.|#.#|.##',
  '@': '###|#.#|#.#|#..|###', '"': '#.#|#.#|...|...|...',
};

// Rows of '#' -> one path of rectangles, runs merged across and then down.
function bitmapPath(rows, ox = 0, oy = 0) {
  const rects = [];
  let open = new Map();
  rows.forEach((row, y) => {
    const next = new Map();
    for (let x = 0; x < row.length;) {
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

// The big "ROM" face is not drawn, it is grown: every 5x7 glyph is treated as
// a skeleton, its pixels moved onto a grid twice as fine and re-joined with
// one-pixel strokes. The result is a thin 9x13 gothic, the look of full-width
// Latin out of a 16-dot character ROM.
function thinRows(src) {
  const rows = src.split('|');
  const h = rows.length, w = rows[0].length;
  const on = (x, y) => y >= 0 && y < h && x >= 0 && x < w && rows[y][x] === '#';
  const out = Array.from({ length: 2 * h - 1 }, () => Array(2 * w - 1).fill('.'));
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!on(x, y)) continue;
      out[2 * y][2 * x] = '#';
      if (on(x + 1, y)) out[2 * y][2 * x + 1] = '#';
      if (on(x, y + 1)) out[2 * y + 1][2 * x] = '#';
      if (on(x + 1, y + 1) && !on(x + 1, y) && !on(x, y + 1)) out[2 * y + 1][2 * x + 1] = '#';
      if (on(x - 1, y + 1) && !on(x - 1, y) && !on(x, y + 1)) out[2 * y + 1][2 * x - 1] = '#';
    }
  }
  return out.map((r) => r.join(''));
}

function makeFont(prefix, table, adv, { fold = false, thin = false } = {}) {
  const used = new Map();
  return {
    adv,
    id(ch) {
      const key = fold ? ch.toUpperCase() : ch;
      const src = table[key];
      if (src === undefined) throw new Error(`${prefix}: no glyph for ${JSON.stringify(ch)}`);
      const id = prefix + key.codePointAt(0).toString(36);
      if (!used.has(id)) used.set(id, bitmapPath(thin ? thinRows(src) : src.split('|')));
      return id;
    },
    defs: () => [...used].map(([id, d]) => `<path id="${id}" d="${d}"/>`).join(''),
  };
}
const f7 = makeFont('a', F5, 6);                   // 7 px readout type
const t3 = makeFont('t', T3, 4, { fold: true });   // 5 px labels
const rom = makeFont('r', F5, 11, { thin: true }); // 13 px thin titles

// A run of glyphs. adv overrides the face's advance (wide letter-spacing).
// Fills are CSS classes (shorter than attributes). The picture is built twice:
// the first pass counts every string, the second turns the ones that repeat
// ("OPM:", "TRACK", "KEY-ON /" ...) into one <g> in <defs> and a <use> each.
const FILL = { [C.lav]: 'l', [C.hi]: 'h', [C.dim]: 'd', [C.bg]: 'k' };
const wordCount = new Map(), wordDefs = new Map();
let pass = 1;
function text(font, str, x, y, fill, adv = font.adv, cls = '', attrs = '') {
  const fc = FILL[fill];
  if (!fc) throw new Error(`no fill class for ${fill}`);
  const klass = ` class="${fc}${cls ? ` ${cls}` : ''}"`;
  let run = '', cx = 0, glyphs = 0;
  for (const ch of str) {
    if (ch !== ' ') { run += `<use href="#${font.id(ch)}"${cx ? ` x="${cx}"` : ''}/>`; glyphs++; }
    cx += adv;
  }
  const key = `${font.adv}|${adv}|${str}`;
  if (pass === 1) wordCount.set(key, (wordCount.get(key) || 0) + 1);
  else if (glyphs >= 2 && wordCount.get(key) >= 2) {
    if (!wordDefs.has(key)) wordDefs.set(key, { id: `w${wordDefs.size.toString(36)}`, run });
    return `<use href="#${wordDefs.get(key).id}" x="${x}" y="${y}"${klass}${attrs}/>`;
  }
  return `<g transform="translate(${x} ${y})"${klass}${attrs}>${run}</g>`;
}
const width = (font, str, adv = font.adv) => [...str].length * adv - (adv - (font === t3 ? 3 : font === rom ? 9 : 5));
const textR = (font, str, xr, y, fill, adv) => text(font, str, xr - width(font, str, adv), y, fill, adv);
const textC = (font, str, cx, y, fill, adv) => text(font, str, Math.round(cx - width(font, str, adv) / 2), y, fill, adv);
// Several coloured runs on one line: [[str, fill], ...]
function spans(font, parts, x, y) {
  let s = '', cx = x;
  for (const [str, fill] of parts) {
    if (str.trim()) s += text(font, str, cx, y, fill);
    cx += [...str].length * font.adv;
  }
  return s;
}

const rect = (x, y, w, h, fill, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"${extra}/>`;
const hl = (x, y, w, fill = C.rule) => rect(x, y, w, 1, fill);
const vl = (x, y, h, fill = C.rule) => rect(x, y, 1, h, fill);
const frame = (x, y, w, h, stroke = C.rule) => `<rect x="${x + 0.5}" y="${y + 0.5}" width="${w - 1}" height="${h - 1}" fill="none" stroke="${stroke}"/>`;

// A tiny label ending in the corner tick every label on this kind of screen has.
const TICK = 'M3 1h1v4h-4v-1h1v-1h1v-1h1z';
function label(str, x, y, fill = C.lav) {
  const w = width(t3, str);
  return text(t3, str, x, y, fill) + `<use href="#tk" x="${x + w + 2}" y="${y}" class="${FILL[fill]}"/>`;
}
const labelW = (str) => width(t3, str) + 7;
// Section header: label, tick, then a hairline out to the right-hand edge.
const header = (str, x, y, xr) => label(str, x, y) + hl(x + labelW(str) + 2, y + 4, xr - x - labelW(str) - 2);

// A row of dashes (the rules that join the transport words).
function dashes(x, y, w, fill = C.dim) {
  let d = '';
  for (let cx = 0; cx + 2 <= w; cx += 4) d += `M${x + cx} ${y}h2v1h-2z`;
  return `<path fill="${fill}" d="${d}"/>`;
}
// A boxed word. lit = inverse video.
function box(font, str, x, y, { lit = false, padX = 3, padY = 3, fill = C.lav } = {}) {
  const w = width(font, str) + padX * 2, h = (font === t3 ? 5 : 7) + padY * 2;
  const body = lit ? rect(x, y, w, h, fill) : frame(x, y, w, h, C.dim);
  return { w, h, svg: body + text(font, str, x + padX, y + padY, lit ? C.bg : fill) };
}

// ------------------------------------------------------------------ CSS
const css = [];
const n3 = (v) => +v.toFixed(3);
const pct = (f) => `${n3(f * 100)}%`;
// Discrete keyframes for step-end: events = [[fraction 0..1, 'declarations'], ...].
// Equal consecutive states are dropped, equal states share one selector list.
function stepKF(name, events) {
  const groups = new Map();
  let prev = null;
  for (const [f, decl] of events) {
    if (decl === prev) continue;
    prev = decl;
    if (!groups.has(decl)) groups.set(decl, []);
    groups.get(decl).push(pct(f));
  }
  css.push(`@keyframes ${name}{${[...groups].map(([decl, ps]) => `${ps.join(',')}{${decl}}`).join('')}}`);
}
const anim = (sel, name, dur, extra = '') => css.push(`${sel}{animation:${name} ${dur} step-end infinite${extra}}`);

// Seeded PRNG (mulberry32): the spectrum bounces the same way on every build.
function prng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ------------------------------------------------------------------ segment digits
// Seven hexagonal segments on an 8 x 14 box, slanted with skewX when placed.
const SEG = (() => {
  const w = 8, h = 14, t = 2, g = 0.5, m = h / 2, a = t / 2;
  const hz = (yc) => `M${a + g} ${yc}l${a} ${-a}h${w - 2 * t - 2 * g}l${a} ${a}l${-a} ${a}h${-(w - 2 * t - 2 * g)}z`;
  const vt = (xc, y1, y2) => `M${xc} ${y1}l${a} ${a}v${y2 - y1 - t}l${-a} ${a}l${-a} ${-a}v${-(y2 - y1 - t)}z`;
  const seg = {
    a: hz(a), g: hz(m), d: hz(h - a),
    f: vt(a, a + g, m - g), e: vt(a, m + g, h - a - g),
    b: vt(w - a, a + g, m - g), c: vt(w - a, m + g, h - a - g),
  };
  const map = { 0: 'abcdef', 1: 'bc', 2: 'abged', 3: 'abgcd', 4: 'fgbc', 5: 'afgcd', 6: 'afgedc', 7: 'abc', 8: 'abcdefg', 9: 'abfgcd', '-': 'g' };
  const d = {};
  for (const [ch, segs] of Object.entries(map)) d[ch] = [...segs].map((s) => seg[s]).join('');
  d[':'] = 'M3 3.5h2v2h-2zM3 8.5h2v2h-2z';
  return { w, h, d };
})();
const segUsed = new Set();
const segId = (ch) => { segUsed.add(ch); return `s${ch === ':' ? 'c' : ch === '-' ? 'm' : ch}`; };
const SLANT = 10, SEG_ADV = 10;
const segShift = (s) => n3(SEG.h * s * Math.tan((SLANT * Math.PI) / 180));
const segOpen = (x, y, s) => `<g transform="translate(${n3(x + segShift(s))} ${y}) skewX(${-SLANT})${s === 1 ? '' : ` scale(${s})`}">`;
// One slanted digit cell: a ghost "8" in navy, the lit segments on top.
const segCell = (ch, i, fill, ghost) => {
  const x = i * SEG_ADV;
  const at = x ? ` x="${x}"` : '';
  return (ghost && ch !== ':' ? `<use href="#${segId('8')}"${at} fill="${C.ghost}"/>` : '') + `<use href="#${segId(ch)}"${at} fill="${fill}"/>`;
};
function seg(str, x, y, s = 1, fill = C.lav, ghost = true) {
  return segOpen(x, y, s) + [...str].map((ch, i) => segCell(ch, i, fill, ghost)).join('') + '</g>';
}
const segW = (str, s = 1) => ([...str].length * SEG_ADV - 2) * s + segShift(s);

// ------------------------------------------------------------------ wordmark
// Wide chamfered capitals drawn as centre-line strokes: only the eleven
// letters the name needs. Solid = one fat stroke; outline = the fat stroke
// with a thinner black one laid inside it.
function wideGlyph(ch, w, h, T) {
  const a = T / 2, c = Math.round(h * 0.16), m = h / 2, r = w - a, b = h - a;
  switch (ch) {
    case 'U': return [[[a, a], [a, b - c], [a + c, b], [r - c, b], [r, b - c], [r, a]]];
    case 'L': return [[[a, a], [a, b], [r, b]]];
    case 'T': return [[[a, a], [r, a]], [[w / 2, a], [w / 2, b]]];
    case 'R': { const k = Math.min(c + 5, b - m); return [[[a, b], [a, a], [r - c, a], [r, a + c], [r, m - c], [r - c, m], [a, m]], [[r - k, m], [r, m + k], [r, b]]]; }
    case 'A': return [[[a, b], [a, a + c], [a + c, a], [r - c, a], [r, a + c], [r, b]], [[a, m + 2], [r, m + 2]]];
    case 'S': return [[[r, a], [a + c, a], [a, a + c], [a, m - c], [a + c, m], [r - c, m], [r, m + c], [r, b - c], [r - c, b], [a, b]]];
    case 'I': return [[[a, a], [a, b]]];
    case 'F': return [[[a, b], [a, a], [r, a]], [[a, m], [r - 5, m]]];
    case 'C': return [[[r, a], [a + c, a], [a, a + c], [a, b - c], [a + c, b], [r, b]]];
    case 'O': return [[[a + c, a], [r - c, a], [r, a + c], [r, b - c], [r - c, b], [a + c, b], [a, b - c], [a, a + c], 'z']];
    case 'Y': return [[[a, a], [a, m - c], [a + c, m], [r - c, m], [r, m - c], [r, a]], [[w / 2, m], [w / 2, b]]];
    default: throw new Error(`wordmark: no glyph for ${ch}`);
  }
}
function wide(str, x, y, { w, h, T, gap, solid, fill, space = 0 }) {
  let cx = x, d = '';
  for (const ch of str) {
    if (ch === ' ') { cx += space; continue; }
    const gw = ch === 'I' ? T : w;
    for (const line of wideGlyph(ch, gw, h, T)) {
      const closed = line[line.length - 1] === 'z';
      const pts = closed ? line.slice(0, -1) : line;
      d += pts.map(([px, py], i) => `${i ? 'L' : 'M'}${n3(cx + px)} ${n3(y + py)}`).join('') + (closed ? 'z' : '');
    }
    cx += gw + gap;
  }
  const common = `fill="none" stroke-linecap="square" stroke-linejoin="miter" d="${d}"`;
  const svg = `<path stroke="${fill}" stroke-width="${T}" ${common}/>` + (solid ? '' : `<path stroke="${C.bg}" stroke-width="${T - 2}" ${common}/>`);
  return { svg, w: cx - gap - x };
}

// ------------------------------------------------------------------ the tracks
// Notes: C minor pentatonic throughout, so whatever the machines do it is in key.
const PC = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 };
const note = (name) => {                     // 'D#4' -> semitone index, 0 = C1
  const m = /^([A-G]#?)(\d)$/.exec(name);
  if (!m) throw new Error(`bad note ${name}`);
  return (Number(m[2]) - 1) * 12 + PC[m[1]];
};
const noteLabel = (name) => (name.length === 2 ? `${name[0]} ${name[1]}` : name);
const seq = (s) => s.split(' ');

// period = 60 / (output per minute): one key-on per item.
const TRACKS = [
  { id: '01', kind: 'OPM', machine: 'SMELTER', item: 'IRON INGOT', opm: '030.0', cyc: '002', mw: 4, ins: 1, at: '003', period: 2, every: '2.00',
    notes: seq('C4 D#4 G4 C5 A#4 G4') },
  { id: '02', kind: 'OPM', machine: 'FOUNDRY', item: 'STEEL INGOT', opm: '045.0', cyc: '004', mw: 16, ins: 2, at: '002', period: 4 / 3, every: '1.33',
    notes: seq('G3 A#3 C4 D#4 C4 A#3 G3 F3 D#3') },
  { id: '03', kind: 'OPM', machine: 'CONSTRUCTOR', item: 'SCREW', opm: '040.0', cyc: '006', mw: 4, ins: 1, at: '020', period: 1.5, every: '1.50',
    notes: seq('C5 D#5 F5 G5 A#5 G5 F5 D#5') },
  { id: '04', kind: 'OPM', machine: 'ASSEMBLER', item: 'REINFORCED IRON PLATE', opm: '005.0', cyc: '012', mw: 15, ins: 2, at: '027', period: 12, every: '12.0',
    notes: seq('C3 D#3 F3 G3 A#2') },
  { id: '05', kind: 'OPM', machine: 'MANUFACTURER', item: 'HEAVY MODULAR FRAME', opm: '002.0', cyc: '030', mw: 55, ins: 4, at: '019', period: 30, every: '30.0',
    notes: seq('C2 G1') },
  { id: '06', kind: 'OPM', machine: 'REFINERY', item: 'PLASTIC', opm: '020.0', cyc: '006', mw: 30, ins: 1, at: '011', period: 3, every: '3.00',
    notes: seq('C3 G2 A#2 F2') },
  { id: '07', kind: 'OPM', machine: 'PACKAGER', item: 'PACKAGED WATER', opm: '060.0', cyc: '002', mw: 10, ins: 2, at: '013', period: 1, every: '1.00',
    notes: seq('C6 G6 D#6 G6 C7 G6 A#6 G6 F6 G6 D#6 G6') },
  { id: '08', kind: 'OPM', machine: 'BLENDER', item: 'COOLING SYSTEM', opm: '006.0', cyc: '010', mw: 75, ins: 4, at: '007', period: 10, every: '10.0',
    notes: seq('D#4 G4 A#4 C5 A#4 G4') },
  { id: '09', kind: 'PCM', machine: 'PARTICLE ACCELERATOR', item: 'NUCLEAR PASTA', opm: '000.5', cyc: '120', mw: null, ins: 2, at: '002', period: 120, every: '120',
    notes: seq('C1') },
];
for (const t of TRACKS) {
  const span = t.period * t.notes.length;
  if (t.period < LOOP && Math.abs(LOOP / span - Math.round(LOOP / span)) > 1e-9) throw new Error(`${t.machine}: phrase of ${span}s does not divide the loop`);
}

// Keyboard: 8 octaves, white keys 7 px on an 8 px pitch, black keys 5 x 12.
const KEY_H = 21, BLACK_H = 12, OCT = 56, OCTS = 8;
const WHITE_AT = { 0: 0, 2: 1, 4: 2, 5: 3, 7: 4, 9: 5, 11: 6 };
const BLACK_AFTER = { 1: 0, 3: 1, 6: 3, 8: 4, 10: 5 };
const keyPos = (s) => {
  const o = Math.floor(s / 12), pc = s % 12;
  return pc in WHITE_AT ? { black: false, x: o * OCT + WHITE_AT[pc] * 8 } : { black: true, x: o * OCT + (BLACK_AFTER[pc] + 1) * 8 - 3 };
};
function keyboardDefs() {
  let wd = '', ws = '', bd = '';
  for (let o = 0; o < OCTS; o++) {
    for (let i = 0; i < 7; i++) {
      wd += `M${o * OCT + i * 8} 0h7v${KEY_H - 2}h-7z`;
      ws += `M${o * OCT + i * 8} ${KEY_H - 2}h7v2h-7z`;
    }
    for (const i of [0, 1, 3, 4, 5]) bd += `M${o * OCT + (i + 1) * 8 - 3} 0h5v${BLACK_H}h-5z`;
  }
  return `<g id="kw"><path fill="${C.key}" d="${wd}"/><path fill="${C.keylo}" d="${ws}"/></g><path id="kb" fill="${C.ink}" d="${bd}"/>`;
}

const durCss = (p) => (Math.abs(p - 4 / 3) < 1e-9 ? 'calc(4s / 3)' : `${p}s`);
function strips() {
  let s = '';
  css.push('@keyframes gf{from{transform:scaleX(1)}to{transform:scaleX(0)}}');
  TRACKS.forEach((t, i) => {
    const y = MY + i * STRIP;
    const n = t.notes.length, dur = t.period * n;
    const pos = t.notes.map((nm) => keyPos(note(nm)));
    const animated = t.period < LOOP;
    s += hl(SX, y, SW);
    // label column
    s += text(t3, t.kind, SX, y + 4, C.lav) + label('TRACK', SX, y + 11);
    s += seg(t.id, SX + 31, y + 4, 1, C.hi);
    // readout line 1: machine, item, key-on interval
    const x0 = SX + 58;
    s += text(f7, t.machine, x0, y + 3, C.hi);
    s += text(f7, '>', x0 + (t.machine.length + 1) * 6, y + 3, C.dim);
    s += text(f7, t.item, x0 + (t.machine.length + 3) * 6, y + 3, C.lav);
    s += textR(f7, `${t.every}S`, SX + SW, y + 3, C.lav);
    s += textR(t3, 'KEY-ON /', SX + SW - (t.every.length + 1) * 6 - 3, y + 5, C.dim);
    // progress to the next key-on: twelve slices fill up, then empty on the beat
    const bx = SX + 322, by = y + 4;
    const k = t.period < 1.4 ? 4 : t.period <= 2 ? 6 : 12;
    s += rect(bx, by, 48, 5, C.lav) + `<g transform="translate(${bx + 48} ${by})"><rect class="g${i}" x="-48" width="48" height="5" fill="${C.navy}" transform="scale(.5 1)"/></g><use href="#pg" x="${bx}" y="${by}"/>`;
    css.push(`.g${i}{animation:gf ${durCss(t.period)} steps(${k}) infinite}`);
    // readout line 2: the numbers
    s += spans(f7, [
      ['OPM:', C.dim], [t.opm, C.hi], ['  CYC:', C.dim], [t.cyc, C.lav], ['S  PWR:', C.dim], [t.mw === null ? '---' : String(t.mw).padStart(3, '0'), C.lav],
      ['MW  IN:', C.dim], [String(t.ins), C.lav], ['  @:', C.dim], [t.at, C.lav],
    ], x0, y + 12);
    // KC: the sounding note, swapped in step with the key
    const kcX = SX + SW - 17;
    s += textR(f7, 'KC:', kcX - 1, y + 12, C.dim);
    const names = [...new Set(t.notes)];
    names.forEach((nm) => {
      const first = t.notes[0] === nm;
      const cls = animated && names.length > 1 ? `k${i}${names.indexOf(nm)}` : '';
      s += text(f7, noteLabel(nm), kcX, y + 12, C.hi, 6, cls, first ? '' : ' opacity="0"');
      if (cls) {
        stepKF(`k${i}${names.indexOf(nm)}`, t.notes.map((m, j) => [j / n, `opacity:${m === nm ? 1 : 0}`]));
        anim(`.k${i}${names.indexOf(nm)}`, `k${i}${names.indexOf(nm)}`, `${n3(dur)}s`);
      }
    });
    // keyboard: whites, the lit white key, blacks, the lit black key
    const ky = y + 22;
    const lit = (black) => {
      const first = pos[0];
      const on = first.black === black;
      const geo = black ? `width="5" height="${BLACK_H}"` : `width="7" height="${KEY_H}"`;
      const base = on ? ` transform="translate(${first.x} 0)"` : ' opacity="0"';
      const any = pos.some((p) => p.black === black);
      if (!any) return '';
      const cls = animated && n > 1 ? ` class="l${i}${black ? 'b' : 'w'}"` : '';
      if (cls) {
        stepKF(`l${i}${black ? 'b' : 'w'}`, pos.map((p, j) => [j / n, p.black === black ? `transform:translateX(${p.x}px);opacity:1` : 'opacity:0']));
        anim(`.l${i}${black ? 'b' : 'w'}`, `l${i}${black ? 'b' : 'w'}`, `${n3(dur)}s`);
      }
      return `<rect ${geo} fill="${C.lime}"${base}${cls}/>`;
    };
    s += `<g transform="translate(${SX} ${ky})"><use href="#kw"/>${lit(false)}<use href="#kb"/>${lit(true)}</g>`;
  });
  s += hl(SX, MY + TRACKS.length * STRIP, SW);
  return s;
}

// ------------------------------------------------------------------ masthead
function masthead() {
  let s = '';
  const opt = { w: 32, h: 28, T: 6, gap: 5 };
  const u = wide('ULTRA', 12, 10, { ...opt, solid: true, fill: C.hi });
  const sx = 12 + u.w + 22;
  const f = wide('SATISFACTORY', sx, 10, { ...opt, solid: false, fill: C.lav });
  const end = sx + f.w;
  s += u.svg + f.svg;
  // the bar under the wordmark, with the pitch knocked out of it
  s += rect(12, 43, end - 12, 11, C.lav);
  s += text(f7, 'A COMPANION APP FOR THE FACTORY-BUILDING GAME SATISFACTORY', 17, 45, C.bg);
  s += textR(f7, 'UNOFFICIAL FAN PROJECT', end - 5, 45, C.bg);
  // right-hand block
  const rx = end + 14;
  s += text(f7, 'OUTPUT-PER-MINUTE DISPLAY', rx, 11, C.hi);
  s += text(t3, 'REAL-TIME STATUS OF NINE MACHINES THAT', rx, 23, C.lav);
  s += text(t3, 'ARE NOT THERE. THE RECIPES ARE REAL.', rx, 30, C.lav);
  s += text(t3, 'PKG 0.0.1 · APACHE 2.0 · PYTHON 3.10+', rx, 40, C.dim);
  s += label('NOT AFFILIATED WITH COFFEE STAIN STUDIOS', rx, 48, C.dim);
  s += hl(8, 60, W - 16);
  return s;
}

// ------------------------------------------------------------------ control panel
function controlPanel() {
  let s = header('CONTROL PANEL', PX, MY, PX + PW);
  // transport frame: the three tabs, then the click-through chain
  const fx = PX, fy = MY + 11, fw = 228, fh = 50;
  s += frame(fx, fy, fw, fh);
  s += label('TABS', fx + 6, fy + 5, C.dim);
  let cx = fx + 30;
  const tabs = ['OBJECTIVES', 'ITEMS', 'BUILDINGS'];
  tabs.forEach((tab, i) => {
    const b = box(f7, tab, cx, fy + 5);
    // the selected tab: an inverse box that steps along every 20 s
    const lit = box(f7, tab, cx, fy + 5, { lit: true });
    s += b.svg + `<g class="tb${i}"${i ? ' opacity="0"' : ''}>${lit.svg}</g>`;
    stepKF(`tb${i}`, [0, 1, 2].map((j) => [j / 3, `opacity:${j === i ? 1 : 0}`]));
    anim(`.tb${i}`, `tb${i}`, `${LOOP}s`);
    cx += b.w;
    if (i < 2) { s += dashes(cx + 2, fy + 11, 10); cx += 13; }
  });
  s += label('ONE CLICK', fx + 6, fy + 31, C.dim);
  cx = fx + 50;
  ['PART', 'RECIPE', 'MACHINE', 'BUILDING'].forEach((wd, i) => {
    const b = box(t3, wd, cx, fy + 28);
    // the click-through: an inverse box walks the chain, one hop every 3 s
    const lit = box(t3, wd, cx, fy + 28, { lit: true });
    s += b.svg + `<g class="ch${i}"${i ? ' opacity="0"' : ''}>${lit.svg}</g>`;
    stepKF(`ch${i}`, [0, 1, 2, 3].map((j) => [j / 4, `opacity:${j === i ? 1 : 0}`]));
    anim(`.ch${i}`, `ch${i}`, '12s');
    cx += b.w;
    if (i < 3) { s += dashes(cx + 2, fy + 33, 14); cx += 17; }
  });
  // counters to the right of the frame
  const kx = fx + fw + 10;
  s += text(t3, 'PASSED', kx, fy + 3, C.lav) + label('TIME', kx, fy + 10);
  // mm:ss that really ticks, 00:00 to 01:59: each digit is a stack of glyphs taking turns
  const tx = kx + 36, ty = fy + 2, ts = 1.2;
  s += segOpen(tx, ty, ts) + segCell('0', 0, C.hi, true) + segCell(':', 2, C.hi, false);
  for (const col of [1, 3, 4]) s += `<use href="#${segId('8')}" x="${col * SEG_ADV}" fill="${C.ghost}"/>`;
  for (let d = 0; d < 2; d++) s += `<use href="#${segId(String(d))}" x="${SEG_ADV}" fill="${C.hi}" class="dm"${d ? ' opacity="0"' : ''} style="animation-delay:${d * 60 - 120}s"/>`;
  for (let d = 0; d < 6; d++) s += `<use href="#${segId(String(d))}" x="${3 * SEG_ADV}" fill="${C.hi}" class="dt"${d ? ' opacity="0"' : ''} style="animation-delay:${d * 10 - 60}s"/>`;
  for (let d = 0; d < 10; d++) s += `<use href="#${segId(String(d))}" x="${4 * SEG_ADV}" fill="${C.hi}" class="du"${d ? ' opacity="0"' : ''} style="animation-delay:${d - 10}s"/>`;
  s += '</g>';
  stepKF('dm', [[0, 'opacity:1'], [0.5, 'opacity:0']]);
  anim('.dm', 'dm', '120s');
  // 0.16666, not 1/6: rounded up to 16.667% the outgoing digit would still be lit for 0.2 ms when the
  // next one comes on, and at exactly t = 0 the clock would read 00:80 (a 0 and a 5 on top of each other)
  stepKF('dt', [[0, 'opacity:1'], [0.16666, 'opacity:0']]);
  stepKF('du', [[0, 'opacity:1'], [0.1, 'opacity:0']]);
  anim('.dt', 'dt', '60s');
  anim('.du', 'du', '10s');
  s += text(t3, 'LOOP', kx, fy + 28, C.lav) + label('LENGTH', kx, fy + 35);
  s += seg('02:00', tx, fy + 27, ts, C.lav);
  // driver line
  const dy = fy + fh + 7;
  s += label('DRIVER', PX, dy + 1, C.dim) + text(f7, 'STREAMLIT', PX + 34, dy, C.hi, 7);
  s += label('DATA', PX + 106, dy + 1, C.dim) + text(f7, 'DATA.JSON', PX + 130, dy, C.lav);
  s += label('GRIDS', PX + 194, dy + 1, C.dim) + text(f7, 'AGGRID', PX + 222, dy, C.lav);
  s += label('WASM', PX + 268, dy + 1, C.dim) + text(f7, 'STLITE', PX + 292, dy, C.lav);
  // the app's own counts, in segment digits
  const cy = dy + 14;
  s += hl(PX, cy - 3, PW);
  const counters = [['ITEMS', '140'], ['RECIPES', '211'], ['ALTERNATES', '088'], ['BUILDINGS', '477'], ['PHASES', '005']];
  counters.forEach(([name, val], i) => {
    const x = PX + i * 71;
    s += label(name, x, cy + 1);
    s += seg(val, x + 2, cy + 10, 1.5, C.hi);
  });
  return s;
}

// ------------------------------------------------------------------ spectrum
// One bar per distinct output rate among the 104 standard machine recipes.
const RATES = [
  [0.25, 1], [0.4, 1], [0.5, 2], [0.75, 1], [1, 6], [1.5, 1], [1.875, 2], [2, 3], [2.5, 4], [3.75, 2], [4, 2], [5, 10], [6, 2], [7.5, 4],
  [10, 6], [12.5, 1], [15, 6], [20, 11], [22.5, 1], [25, 2], [30, 12], [40, 5], [45, 1], [50, 3], [60, 7], [75, 1], [100, 1], [120, 3],
  [250, 1], [360, 1], [1500, 1],
];
if (RATES.reduce((n, [, c]) => n + c, 0) !== 104) throw new Error('spectrum: counts must add up to 104');
const SP = { y: MY + 125, n: 24, pitch: 3, bw: 8, bp: 10, x: PX + 38 };
const spSlices = (count) => Math.round(SP.n * Math.sqrt(count / 12));
function spectrum() {
  const top = SP.y + 14, hgt = SP.n * SP.pitch, bot = top + hgt;
  let s = header('OUTPUT SPECTRUM', PX, SP.y, PX + PW);
  // mode buttons, right-aligned on the header line
  let bx = PX + PW;
  [['SINK', false], ['RAW', false], ['ALT.88', false], ['STANDARD', true]].forEach(([wd, lit]) => {
    const b = box(t3, wd, 0, 0, { lit, padY: 2 });
    bx -= b.w;
    s += rect(bx - 2, SP.y, b.w + 4, 9, C.bg) + box(t3, wd, bx, SP.y - 1, { lit, padY: 2 }).svg;
    bx -= 4;
  });
  // scale: items at that rate, square-root spaced
  s += text(t3, 'ITEMS', PX, top - 1, C.dim);
  for (const c of [12, 6, 3, 1]) {
    const y = bot - spSlices(c) * SP.pitch;
    s += textR(t3, String(c), PX + 30, y - (c === 12 ? -6 : 2), C.lav) + hl(PX + 32, y, 4, C.lav);
  }
  s += vl(PX + 35, top, hgt, C.rule) + hl(PX + 32, bot - 1, 4, C.lav) + textR(t3, '0', PX + 30, bot - 5, C.lav);
  // bars: lavender columns, a navy cover hanging from the top, black slice gaps over both
  const rnd = prng(0x0f5a7);
  let bars = '', covers = '', ticks = '';
  RATES.forEach(([, count], i) => {
    const L = spSlices(count);
    const x = SP.x + i * SP.bp;
    const steps = [8, 10, 12, 15, 16][Math.floor(rnd() * 5)];
    const stepDur = [0.5, 0.6, 0.75][Math.floor(rnd() * 3)];
    // keep the period a divisor of the loop
    let period = steps * stepDur;
    while (Math.abs(LOOP / period - Math.round(LOOP / period)) > 1e-9) period += stepDur;
    const n = Math.round(period / stepDur);
    const lo = Math.max(1, Math.round(L * 0.4));
    const v = Array.from({ length: n }, () => lo + Math.round((L - lo) * Math.pow(rnd(), 0.8)));
    v[Math.floor(rnd() * n)] = L;                       // it must reach the real count
    v[Math.floor(rnd() * n)] = L;
    // peak hold: rises with the bar at once, falls one slice every other step
    const p = Array(n).fill(0);
    let cur = L, held = 0;
    for (let pass = 0; pass < 3; pass++) {
      for (let j = 0; j < n; j++) {
        if (v[j] >= cur) { cur = v[j]; held = 0; } else if (++held >= 3) { cur = Math.max(v[j], cur - 1); held = 1; }
        p[j] = cur;
      }
    }
    bars += `M${x} ${top + (SP.n - L) * SP.pitch}h${SP.bw}v${L * SP.pitch}h${-SP.bw}z`;
    const delay = -n3(rnd() * stepDur);
    const sc = (k) => n3((SP.n - k) / SP.n);
    covers += `<rect class="c${i}" x="${x}" width="${SP.bw}" height="${hgt}" transform="scale(1 ${sc(v[0])})"/>`;
    ticks += `<rect class="p${i}" x="${x}" y="${-SP.pitch}" width="${SP.bw}" height="2" transform="translate(0 ${(SP.n - p[0] + 1) * SP.pitch})"/>`;
    stepKF(`c${i}`, v.map((k, j) => [j / n, `transform:scaleY(${sc(k)})`]));
    stepKF(`p${i}`, p.map((k, j) => [j / n, `transform:translateY(${(SP.n - k + 1) * SP.pitch}px)`]));
    css.push(`.c${i},.p${i}{animation:c${i} ${n3(period)}s step-end ${delay}s infinite}.p${i}{animation-name:p${i}}`);
  });
  let grid = '';
  for (let j = 0; j < SP.n; j++) grid += `M${SP.x} ${j * SP.pitch + 2}h${RATES.length * SP.bp}v1h${-RATES.length * SP.bp}z`;
  s += `<path fill="${C.navy2}" d="${RATES.map((_, i) => `M${SP.x + i * SP.bp} ${top}h${SP.bw}v${hgt}h${-SP.bw}z`).join('')}"/>`;
  s += `<path fill="${C.lav}" d="${bars}"/>`;
  s += `<g transform="translate(0 ${top})"><g fill="${C.navy2}">${covers}</g><g fill="${C.hi}">${ticks}</g><path fill="${C.bg}" d="${grid}"/></g>`;
  // axis: output per minute
  const ay = bot + 4;
  const labels = { 0: '.25', 4: '1', 8: '2.5', 11: '5', 14: '10', 17: '20', 20: '30', 24: '60', 27: '120', 30: '1.5K' };
  s += text(t3, '/MIN', PX, ay, C.dim);
  let covered = SP.x - 2;
  RATES.forEach((_, i) => {
    const cx = SP.x + i * SP.bp + SP.bw / 2;
    if (labels[i]) {
      const w = width(t3, labels[i]);
      const lx = Math.min(Math.round(cx - w / 2), PX + PW - w);
      s += text(t3, labels[i], lx, ay, C.lav);
      covered = lx + w + 2;
    } else if (cx - 2 >= covered && !(labels[i + 1] && cx + 3 > SP.x + (i + 1) * SP.bp + SP.bw / 2 - width(t3, labels[i + 1]) / 2 - 2)) {
      s += rect(Math.round(cx - 2), ay + 2, 4, 1, C.dim);
    }
  });
  return s;
}

// ------------------------------------------------------------------ level bars
const LV = { y: MY + 231, n: 22, pitch: 3, bw: 22, bp: 34, x: PX + 40 };
const lvSlices = (mw) => Math.max(1, Math.round((LV.n * Math.log(mw / 2)) / Math.log(75 / 2)));
function levels() {
  const top = LV.y + 13, hgt = LV.n * LV.pitch, bot = top + hgt;
  let s = header('POWER LEVEL', PX, LV.y, PX + PW);
  const note1 = 'HEIGHT = MW, LOG · KICK = 1 ITEM OUT';
  s += rect(PX + PW - width(t3, note1) - 4, LV.y, width(t3, note1) + 4, 9, C.bg) + textR(t3, note1, PX + PW, LV.y, C.dim);
  s += text(t3, 'MW', PX, top - 1, C.dim);
  for (const mw of [75, 30, 10, 4]) {
    const y = bot - lvSlices(mw) * LV.pitch;
    s += textR(t3, String(mw), PX + 30, y - (mw === 75 ? -6 : 2), C.lav) + hl(PX + 32, y, 4, C.lav);
  }
  s += vl(PX + 35, top, hgt, C.rule);
  let bars = '', covers = '', ticks = '', bg = '', grid = '';
  TRACKS.forEach((t, i) => {
    const x = LV.x + i * LV.bp;
    bg += `M${x} ${top}h${LV.bw}v${hgt}h${-LV.bw}z`;
    if (t.mw === null) return;
    const L = lvSlices(t.mw);
    const k = Math.max(2, Math.min(L - 1, Math.round(L * 0.8), t.period <= 1 ? 5 : 18));   // slices lost before the next key-on
    bars += `M${x} ${top + (LV.n - L) * LV.pitch}h${LV.bw}v${L * LV.pitch}h${-LV.bw}z`;
    const sc = (lvl) => n3((LV.n - lvl) / LV.n);
    // rest frame (and reduced motion): a bar caught half-way down its decay
    covers += `<rect class="v${i}" x="${x}" width="${LV.bw}" height="${hgt}" transform="scale(1 ${sc(L - Math.floor(k / 2))})"/>`;
    ticks += `M${x} ${(LV.n - L) * LV.pitch}h${LV.bw}v2h${-LV.bw}z`;
    css.push(`@keyframes v${i}{from{transform:scaleY(${sc(L)})}to{transform:scaleY(${sc(L - k)})}}`);
    css.push(`.v${i}{animation:v${i} ${durCss(t.period)} steps(${k}) infinite}`);
  });
  for (let j = 0; j < LV.n; j++) grid += `M${LV.x} ${j * LV.pitch + 2}h${TRACKS.length * LV.bp}v1h${-TRACKS.length * LV.bp}z`;
  s += `<path fill="${C.navy2}" d="${bg}"/><path fill="${C.lav}" d="${bars}"/>`;
  s += `<g transform="translate(0 ${top})"><g fill="${C.navy2}">${covers}</g><path fill="${C.hi}" d="${ticks}"/><path fill="${C.bg}" d="${grid}"/></g>`;
  // the PCM column has no power figure in the data: say so instead of drawing one
  const px9 = LV.x + 8 * LV.bp;
  s += textC(t3, 'NO', px9 + LV.bw / 2, top + 24, C.dim) + textC(t3, 'DATA', px9 + LV.bw / 2 + 0.5, top + 31, C.dim);
  // track numbers, pan dials, number rows
  const ry = bot + 4;
  s += text(t3, 'TRACK', PX, ry, C.dim);
  TRACKS.forEach((t, i) => { s += textC(t3, t.kind === 'PCM' ? 'PCM' : `TR${t.id}`, LV.x + i * LV.bp + LV.bw / 2, ry, C.lav); });
  const py = ry + 15;
  s += label('PANPOT', PX, py - 2, C.lav);
  const panDur = [12, 20, 6, 30, 60, 10, 4, 15, 0];
  TRACKS.forEach((t, i) => {
    const cx = LV.x + i * LV.bp + LV.bw / 2;
    const left = i % 2 === 0;
    s += `<g transform="translate(${cx} ${py})"><circle r="5.5" fill="${C.navy2}" stroke="${C.lav}"/>`;
    s += `<path d="M0 0L-3.5 -3.5" stroke="${C.hi}" stroke-width="1.6" fill="none"${panDur[i] ? ` class="pn${i}"` : ''}${left ? '' : ' transform="scale(-1 1)"'}/></g>`;
    if (panDur[i]) {
      stepKF(`pn${i}`, [[0, `transform:scaleX(${left ? 1 : -1})`], [0.5, `transform:scaleX(${left ? -1 : 1})`]]);
      anim(`.pn${i}`, `pn${i}`, `${panDur[i]}s`);
    }
  });
  const rows = [
    ['MW', (t) => (t.mw === null ? '---' : String(t.mw).padStart(3, '0')), C.hi],
    ['CYCLE S', (t) => t.cyc, C.lav],
    ['OUT/MIN', (t) => (t.opm === '000.5' ? '0.5' : t.opm.slice(0, 3)), C.lav],
    ['@ CARDS', (t) => t.at, C.lav],
  ];
  rows.forEach(([name, fn, fill], r) => {
    const y = py + 11 + r * 10;
    s += label(name, PX, y + 1, C.dim);
    TRACKS.forEach((t, i) => { s += textC(f7, fn(t), LV.x + i * LV.bp + LV.bw / 2, y, fill); });
  });
  // status lines
  const sy = py + 54;
  s += hl(PX, sy - 4, PW);
  s += label('POLYRHYTHM', PX, sy + 1) + text(f7, '12:9:8:6:4:1', PX + 52, sy, C.hi);
  s += text(t3, 'KEY-ONS PER 12 S. WAS TEMPORARY. NOW LOAD-BEARING.', PX + 132, sy + 1, C.lav);
  s += label('PAN LAW', PX, sy + 12) + text(f7, 'L=MANIFOLD R=BALANCER', PX + 40, sy + 11, C.hi);
  s += text(t3, 'THE DIALS FLIP. NOBODY HAS WON YET.', PX + 174, sy + 12, C.lav);
  s += label('FUSE STATUS', PX, sy + 23) + text(f7, 'HOLDING', PX + 56, sy + 22, C.hi);
  s += text(t3, '(IT HAS NOT SEEN TRACK 08 KICK YET)', PX + 104, sy + 23, C.dim);
  return s;
}

// ------------------------------------------------------------------ selector
const ENTRIES = [
  ['LIVE.OPM', 'PLAY IT LIVE', 'lukexyz.github.io/ULTRA-SATISFACTORY   in the browser, no install'],
  ['INSIDE.OPM', "WHAT'S INSIDE", 'OBJECTIVES · ITEMS · BUILDINGS   three tabs, everything links'],
  ['RUN.OPM', 'RUN IT LOCALLY', 'python -m streamlit run app/app.py   then localhost:8501'],
  ['BUILT.OPM', "HOW IT'S BUILT", 'Python · one Streamlit app · streamlit-aggrid · stlite on Pages'],
  ['CREDITS.OPM', 'DATA & CREDITS', 'greeny/SatisfactoryTools · images from the Satisfactory Wiki'],
  ['LICENSE.OPM', 'LICENSE', 'Apache 2.0. Protection: none. Copy it, fork it, clip it through a wall.'],
];
function selector() {
  let s = hl(8, BY, W - 16);
  // now playing: the pitch as the song title
  s += text(t3, 'NOW PLAYING', SX, BY + 6, C.lav) + label('FACTORY DATA', SX, BY + 13);
  s += text(rom, '* EVERY RECIPE, BUILDING AND OBJECTIVE, ONE CLICK APART *', 80, BY + 5, C.hi);
  s += text(t3, 'ARRANGED FOR 9 MACHINES BY', 716, BY + 6, C.dim) + text(t3, 'THE UNPAID OPERATORS', 716, BY + 13, C.lav);
  // column header, inverse
  const hy = BY + 24;
  s += rect(8, hy, W - 16, 11, C.navy);
  s += label('FILENAME', 28, hy + 3) + label('SECTION TITLE', 106, hy + 3);
  s += text(t3, '(CLICKABLE COPIES ARE UNDER THE PICTURE)', 170, hy + 3, C.dim);
  s += label('WHAT IS IN IT', 350, hy + 3);
  // the cursor bar: steps down one row every ten seconds
  const ry = hy + 15, pitch = 19;
  s += `<rect class="cur" x="8" y="${ry - 3}" width="${W - 16}" height="${pitch}" fill="${C.navy2}"/>`;
  s += `<rect class="cur" x="8" y="${ry - 3}" width="3" height="${pitch}" fill="${C.lav}"/>`;
  css.push(`@keyframes cur{to{transform:translateY(${ENTRIES.length * pitch}px)}}.cur{animation:cur ${LOOP}s steps(${ENTRIES.length}) infinite}`);
  ENTRIES.forEach(([file, title, what], i) => {
    const y = ry + i * pitch;
    s += text(t3, String(i + 1).padStart(2, '0'), 15, y + 4, C.dim);
    s += text(f7, file, 28, y + 3, C.lav);
    s += text(rom, title, 106, y, C.hi, 16);
    s += text(f7, what, 350, y + 3, C.lav);
  });
  // footer strip
  const fy = ry + ENTRIES.length * pitch + 1;
  s += hl(8, fy, W - 16);
  const fw = wide('FACTORY', 12, fy + 6, { w: 15, h: 11, T: 3, gap: 3, solid: true, fill: C.lav });
  s += fw.svg;
  let x = 12 + fw.w + 10;
  const quote = '"OPM" REAL-TIME FACTORY STATUS DISPLAY. IT MAKES NO SOUND. YOUR FACTORY IS LOUD ENOUGH.';
  s += text(t3, quote, x, fy + 9, C.lav);
  x += width(t3, quote) + 12;
  [['TIDY', false], ['SPAGH.', true], ['REPEAT', true], ['CLIP', false], ['SINK', false]].forEach(([wd, lit], i) => {
    const b = box(t3, wd, x, fy + 6, { lit });
    s += b.svg;
    x += b.w + (i === 1 ? 8 : 3);
  });
  s += label('BEDTIME', x + 8, fy + 9);
  s += seg('--:--', x + 8 + labelW('BEDTIME') + 4, fy + 5, 0.9, C.lav);
  return s;
}

// ------------------------------------------------------------------ assemble
const build = () => { css.length = 0; return [masthead(), strips(), controlPanel(), spectrum(), levels(), selector()].join('\n'); };
build();
pass = 2;
const body = build();
const segDefs = [...segUsed].map((ch) => `<path id="${segId(ch)}" d="${SEG.d[ch]}"/>`).join('');
const words = [...wordDefs.values()].map(({ id, run }) => `<g id="${id}">${run}</g>`).join('');
const fills = Object.entries(FILL).map(([col, cls]) => `.${cls}{fill:${col}}`).join('');
css.push('@media (prefers-reduced-motion:reduce){*{animation:none!important}}');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="t d">
<title id="t">ULTRA-SATISFACTORY</title>
<desc id="d">An FM-synth status display in lavender on black. Nine track strips, one per production machine, each with a piano keyboard whose lit key steps once for every item the machine makes; a control panel with the three tabs, a spectrum of output rates and power level bars; and a file selector listing the README sections.</desc>
<style>${fills}${css.join('')}</style>
<defs>${keyboardDefs()}<path id="tk" d="${TICK}"/><path id="pg" fill="${C.bg}" d="${Array.from({ length: 12 }, (_, j) => `M${j * 4 + 3} 0h1v5h-1z`).join('')}"/>${f7.defs()}${t3.defs()}${rom.defs()}${segDefs}${words}</defs>
<rect width="${W}" height="${H}" rx="8" fill="${C.bg}"/>
<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="7.5" fill="none" stroke="${C.navy}"/>
${body}
</svg>
`;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, svg);
console.log(`${path.relative(process.cwd(), OUT)}  ${(svg.length / 1024).toFixed(1)} KB`);
