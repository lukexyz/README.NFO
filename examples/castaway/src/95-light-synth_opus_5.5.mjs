// "Light synth" README banner for CASTAWAY.
//
//   node examples/castaway/src/95-light-synth_opus_5.5.mjs
//   node examples/castaway/src/95-light-synth_opus_5.5.mjs --at=7.5 --out=some/where.svg
//   node examples/castaway/src/95-light-synth_opus_5.5.mjs --sheet=a.svg --frames=b.svg --nframes=20
//
// Regenerates ../assets/95-light-synth_opus_5.5.svg. Plain Node, no deps,
// deterministic (no clock, no Math.random). --at bakes a head start (in
// seconds) into every animation delay so a late frame can be checked without
// waiting; use it only together with --out, never in place. --sheet writes a
// contact sheet of the five seed shapes, level by level, for pixel work, and
// --frames a static contact sheet of the trail at evenly spaced moments of
// the loop (--nframes of them), worked out without a browser. --emit and
// --hold override the pulse patterns and the hold time, for experiments.
//
// The style: the mid-1980s 8-bit "light synthesizer" (catalogue entry
// idle-02, after Jeff Minter's Psychedelia of 1984 and its successors), the
// joystick toy that turns a cursor into mirrored trails of expanding pattern
// seeds. A black screen, one white cursor cell, and a trail of seeds: each
// seed grows outward in seven levels, each level in the next colour of a
// seven-colour sequence, and the whole trail is mirrored through both axes
// ("quad" symmetry) into a four-fold mandala on a coarse block grid. The only
// text is a one-line status readout in a ROM-style 8x8 character set, with a
// graduated bar showing the variable being adjusted. Nothing is copied from
// the real program: the five seed shapes (a palm, a ripple, a sea turtle, a
// delivery drone and a sprouting kumara, all things on Castaway's island),
// the 8x8 font, the palette order and every word of the readout are drawn
// and written for this file.
//
// How the SVG does it
//   * The screen is 80 x 26 cells of 10 units. The cursor runs a closed
//     sum-of-sines path at constant speed and loops every 15 s: five bars of
//     the theme at 80 BPM, one preset per bar. A step is a sixth of a beat.
//   * Each preset is a seed shape and a pulse pattern, the steps of each beat
//     that drop a seed: a steady stream paints rainbow wakes, one or two a
//     beat leave rows of jewels, a burst of three makes beads on the beat.
//   * Each seed shape is seven <path>s in <defs>, one per level, drawn
//     relative to the seed cell. A seed is a translated <g> of seven <use>s
//     of those paths, each with a fill class (its colour) and a start-time
//     class. One shared @keyframes shows a level for HOLD steps from its
//     start and hides it for the rest of the loop, with step timing; level k
//     starts k steps after the seed lands, so the seed grows outward one level
//     a step, holds, then hollows out from the middle while the outer ring
//     runs on and goes: the travelling ripple. Later seeds are later in the
//     document, so they paint over older ones.
//   * Only the <use> elements themselves are animated (opacity), never
//     anything inside a referenced element, so every browser runs them.
//     Quad symmetry is the same list of seeds written four times, under
//     transforms that mirror it in x, in y and in both.
//   * Colour: level k of a seed dropped in beat b is colour (k + b) mod 7 of
//     the sequence, so each seed is a rainbow of rings, the seeds of one beat
//     agree, and each beat's seeds start one colour on from the last beat's:
//     the trail reads as a rainbow ripple.
//   * The status line: CASTAWAY in the 8x8 font at 2.5x, the current seed
//     shape, and one of five readouts, one per bar of the theme (3 s), each
//     with a graduated bar whose segments change over left to right, so the
//     new value wipes in.
//   * No large area flashes: a cell changes colour only when a ring passes
//     over it, the screen's overall brightness stays level, and nothing
//     blinks. prefers-reduced-motion pauses everything on the first frame
//     (LEAD seconds into the loop), which is a complete mandala with the name
//     and a full readout.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const arg = (name) => {
  const hit = process.argv.slice(2).find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : null;
};
// The first frame a visitor sees (and the frame reduced motion holds) is
// LEAD seconds into the loop: one beat in, so the readout has wiped in and
// the trail is already full.
const LEAD = 0.75;
const T0 = LEAD + Number(arg('at') || 0);
const OUT = arg('out') ? path.resolve(arg('out')) : path.resolve(here, '../assets/95-light-synth_opus_5.5.svg');
const SHEET = arg('sheet') ? path.resolve(arg('sheet')) : null;

const n = (v, d = 3) => String(+(+v).toFixed(d));

// ------------------------------------------------------------------ timing
const BEAT = 0.75;              // 80 BPM
const STEP = BEAT / 6;          // one step of the synth: a sixth of a beat
const BARS = 5;                 // the loop is five bars of the theme
const T = BARS * 4 * BEAT;      // 15 s
const NS = Math.round(T / STEP); // 120 steps
const HOLD = Number(arg('hold') || 22); // steps each level stays lit
// A negative delay so the loop is already in full swing on the first frame.
const delayOf = (step) => `${n(((step * STEP - T0) % T + T) % T - T, 4)}s`;

// ------------------------------------------------------------------ screen
const CS = 10;                  // one cell
const GW = 80;
const GH = 26;
const PAD = 12;
const SW = GW * CS;             // 800
const SH = GH * CS;             // 260
const STATUS_Y = PAD + SH + 10; // top of the status line
const BASE = STATUS_Y + 22;     // the status line's letters all stand on this
const W = SW + 2 * PAD;
const H = BASE + PAD;

// ------------------------------------------------------------------ palette
// An 8-bit "three levels per gun" palette (each of R, G and B at 0, half or
// full), the kind the bigger-palette home computers had. The seven-colour
// sequence walks it from white through the sun and coral into the lagoon.
const SEQ = ['#ffffff', '#ffff00', '#ff8000', '#ff0080', '#8000ff', '#0080ff', '#00ffff'];
const DIM = '#3a3a3a';
const GREY = '#a8a8a8';

// ------------------------------------------------------------------ helpers
const key = (x, y) => `${x},${y}`;
const unkey = (k) => k.split(',').map(Number);
// Merge cells into horizontal runs, stack identical runs, emit one path.
function pathOf(cells, s = 1, ox = 0, oy = 0, inset = 0) {
  const rows = new Map();
  for (const k of cells) {
    const [x, y] = unkey(k);
    if (!rows.has(y)) rows.set(y, []);
    rows.get(y).push(x);
  }
  const runs = [];
  for (const [y, xs] of rows) {
    xs.sort((a, b) => a - b);
    let st = xs[0];
    let p = xs[0];
    for (let i = 1; i <= xs.length; i++) {
      if (i < xs.length && xs[i] === p + 1) { p = xs[i]; continue; }
      runs.push([st, p + 1, y]);
      if (i < xs.length) { st = xs[i]; p = xs[i]; }
    }
  }
  runs.sort((a, b) => a[2] - b[2] || a[0] - b[0]);
  const live = new Set(runs.map((r) => `${r[0]},${r[1]},${r[2]}`));
  const out = [];
  for (const r of runs) {
    const k0 = `${r[0]},${r[1]},${r[2]}`;
    if (!live.has(k0)) continue;
    live.delete(k0);
    let h = 1;
    while (live.has(`${r[0]},${r[1]},${r[2] + h}`)) { live.delete(`${r[0]},${r[1]},${r[2] + h}`); h++; }
    const x0 = ox + r[0] * s + inset;
    const y0 = oy + r[2] * s + inset;
    const w = (r[1] - r[0]) * s - 2 * inset;
    const hh = h * s - 2 * inset;
    out.push(`M${n(x0)} ${n(y0)}h${n(w)}v${n(hh)}h${n(-w)}z`);
  }
  return out.join('');
}

// ------------------------------------------------------------------ seed shapes
// Each shape is a little picture; the seed cell is marked 'o'. Levels are the
// 8-connected distance from the seed cell, squeezed into seven bands, so the
// shape grows outward from the seed like the real thing grows level by level.
function shapeFromPicture(rows, mode = 'grow') {
  const cells = [];
  let sx = 0;
  let sy = 0;
  rows.forEach((r, y) => [...r].forEach((c, x) => {
    if (c === 'o') { sx = x; sy = y; }
    if (c !== '.') cells.push([x, y]);
  }));
  const set = new Set(cells.map(([x, y]) => key(x, y)));
  const dist = new Map([[key(sx, sy), 0]]);
  const queue = [[sx, sy]];
  while (queue.length) {
    const [x, y] = queue.shift();
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const k = key(x + dx, y + dy);
        if (!set.has(k) || dist.has(k)) continue;
        dist.set(k, dist.get(key(x, y)) + 1);
        queue.push([x + dx, y + dy]);
      }
    }
  }
  // 'ring' levels go by distance from the seed (Chebyshev), not along the shape
  if (mode === 'ring') {
    dist.clear();
    for (const [x, y] of cells) dist.set(key(x, y), Math.max(Math.abs(x - sx), Math.abs(y - sy)));
  }
  const maxd = Math.max(...dist.values());
  const levels = Array.from({ length: 7 }, () => []);
  for (const [k, d] of dist) {
    const [x, y] = unkey(k);
    const lv = d === 0 ? 0 : Math.min(6, 1 + Math.floor(((d - 1) * 6) / maxd));
    levels[lv].push([x - sx, y - sy]);
  }
  return levels;
}

const SHAPES = [
  {
    name: 'PALM',
    levels: shapeFromPicture([
      '.##.....##.',
      '#..##.##..#',
      '#...###...#',
      '...#.#.#...',
      '..#..#..#..',
      '.....#.....',
      '....#......',
      '....#......',
      '.....#.....',
      '.....o.....',
    ]),
  },
  {
    // a diamond ripple, sparser the further out it goes
    name: 'RIPPLE',
    levels: Array.from({ length: 7 }, (_, r) => {
      const out = [];
      if (r === 0) return [[0, 0]];
      for (let dx = -r; dx <= r; dx++) {
        for (const sgn of [-1, 1]) {
          const dy = sgn * (r - Math.abs(dx));
          if (sgn === 1 && dy === 0) continue;
          if (r >= 3 && (dx + r) % 2 === 1) continue;
          out.push([dx, dy]);
        }
      }
      return out;
    }),
  },
  {
    // top view, head up: shell, four flippers, a head and a tail
    name: 'TURTLE',
    levels: shapeFromPicture([
      '.....###.....',
      '......#......',
      '.##..###..##.',
      '..##.#.#.##..',
      '....#.#.#....',
      '....#.o.#....',
      '....#.#.#....',
      '..##.#.#.##..',
      '.##..###..##.',
      '......#......',
    ], 'ring'),
  },
  {
    // a delivery drone from above: body, four arms, four rotor rings
    name: 'DRONE',
    levels: shapeFromPicture([
      '.##.....##.',
      '#..#...#..#',
      '#..#...#..#',
      '.##.#.#.##.',
      '....###....',
      '....#o#....',
      '....###....',
      '.##.#.#.##.',
      '#..#...#..#',
      '#..#...#..#',
      '.##.....##.',
    ]),
  },
  {
    // a kumara: a tuber with a sprout, which is also what a seed does
    name: 'KUMARA',
    levels: shapeFromPicture([
      '#.......#',
      '.#.....#.',
      '.##...##.',
      '..##.##..',
      '...#.#...',
      '....#....',
      '...#o#...',
      '..#...#..',
      '...###...',
      '....#....',
    ]),
  },
];

// ------------------------------------------------------------------ 8x8 font
// Drawn for this file: a home-computer ROM-style face, two-unit verticals and
// one-unit horizontals, seven wide and seven high, rounded where it can be.
const FONT = {
  A: ['..###..', '.##.##.', '##...##', '##...##', '#######', '##...##', '##...##'],
  B: ['######.', '##...##', '##...##', '######.', '##...##', '##...##', '######.'],
  C: ['..####.', '.##..##', '##.....', '##.....', '##.....', '.##..##', '..####.'],
  D: ['#####..', '##..##.', '##...##', '##...##', '##...##', '##..##.', '#####..'],
  E: ['#######', '##.....', '##.....', '######.', '##.....', '##.....', '#######'],
  F: ['#######', '##.....', '##.....', '######.', '##.....', '##.....', '##.....'],
  G: ['..####.', '.##....', '##.....', '##..###', '##...##', '.##..##', '..#####'],
  H: ['##...##', '##...##', '##...##', '#######', '##...##', '##...##', '##...##'],
  I: ['.######', '...##..', '...##..', '...##..', '...##..', '...##..', '.######'],
  J: ['...####', '....##.', '....##.', '....##.', '##..##.', '##..##.', '.####..'],
  K: ['##...##', '##..##.', '##.##..', '####...', '##.##..', '##..##.', '##...##'],
  L: ['##.....', '##.....', '##.....', '##.....', '##.....', '##.....', '#######'],
  M: ['##...##', '###.###', '#######', '##.#.##', '##...##', '##...##', '##...##'],
  N: ['##...##', '###..##', '####.##', '##.####', '##..###', '##...##', '##...##'],
  O: ['..###..', '.##.##.', '##...##', '##...##', '##...##', '.##.##.', '..###..'],
  P: ['######.', '##...##', '##...##', '######.', '##.....', '##.....', '##.....'],
  Q: ['..###..', '.##.##.', '##...##', '##...##', '##.#.##', '.##.##.', '..##.##'],
  R: ['######.', '##...##', '##...##', '######.', '##.##..', '##..##.', '##...##'],
  S: ['.#####.', '##...##', '##.....', '.#####.', '.....##', '##...##', '.#####.'],
  T: ['#######', '...##..', '...##..', '...##..', '...##..', '...##..', '...##..'],
  U: ['##...##', '##...##', '##...##', '##...##', '##...##', '##...##', '.#####.'],
  V: ['##...##', '##...##', '##...##', '##...##', '.##.##.', '..###..', '...#...'],
  W: ['##...##', '##...##', '##...##', '##.#.##', '#######', '###.###', '##...##'],
  X: ['##...##', '.##.##.', '..###..', '..###..', '.##.##.', '##...##', '##...##'],
  Y: ['##...##', '##...##', '.##.##.', '..###..', '...##..', '...##..', '...##..'],
  Z: ['#######', '....##.', '...##..', '..##...', '.##....', '##.....', '#######'],
  0: ['..###..', '.##.##.', '##..###', '##.#.##', '###..##', '.##.##.', '..###..'],
  1: ['...##..', '..###..', '...##..', '...##..', '...##..', '...##..', '.######'],
  2: ['.#####.', '##...##', '.....##', '...###.', '.###...', '##.....', '#######'],
  3: ['.#####.', '##...##', '.....##', '..####.', '.....##', '##...##', '.#####.'],
  4: ['....##.', '...###.', '..####.', '.##.##.', '#######', '....##.', '....##.'],
  5: ['#######', '##.....', '######.', '.....##', '.....##', '##...##', '.#####.'],
  6: ['..####.', '.##....', '##.....', '######.', '##...##', '##...##', '.#####.'],
  7: ['#######', '.....##', '....##.', '...##..', '..##...', '..##...', '..##...'],
  8: ['.#####.', '##...##', '##...##', '.#####.', '##...##', '##...##', '.#####.'],
  9: ['.#####.', '##...##', '##...##', '.######', '.....##', '....##.', '.####..'],
  ':': ['.......', '...##..', '...##..', '.......', '.......', '...##..', '...##..'],
  '.': ['.......', '.......', '.......', '.......', '.......', '...##..', '...##..'],
  '-': ['.......', '.......', '.......', '.#####.', '.......', '.......', '.......'],
  '/': ['.....##', '....##.', '...##..', '..##...', '.##....', '##.....', '.......'],
  '(': ['....##.', '...##..', '..##...', '..##...', '..##...', '...##..', '....##.'],
  ')': ['.##....', '..##...', '...##..', '...##..', '...##..', '..##...', '.##....'],
  '+': ['.......', '...##..', '...##..', '.######', '...##..', '...##..', '.......'],
  ' ': [],
};
const GLYPH_ID = new Map();
const glyphDefs = [];
function glyph(ch) {
  if (GLYPH_ID.has(ch)) return GLYPH_ID.get(ch);
  const rows = FONT[ch];
  if (!rows) throw new Error(`no glyph for "${ch}"`);
  const set = new Set();
  rows.forEach((r, y) => [...r].forEach((c, x) => { if (c === '#') set.add(key(x, y)); }));
  const id = `f${GLYPH_ID.size.toString(36)}`;
  GLYPH_ID.set(ch, id);
  // the font is drawn in units of CS/8, so one character is one cell
  if (set.size) glyphDefs.push(`<path id="${id}" d="${pathOf(set, CS / 8)}"/>`);
  return id;
}
// <use>s for a line of text at (x, y); scale 1 = one cell per character.
function text(str, x, y, scale = 1, attrs = '') {
  const out = [];
  [...str].forEach((ch, i) => {
    const id = glyph(ch);
    if (ch === ' ') return;
    out.push(`<use href="#${id}" x="${n(i * CS)}" y="0"/>`);
  });
  const tr = scale === 1 ? `translate(${n(x)} ${n(y)})` : `translate(${n(x)} ${n(y)}) scale(${scale})`;
  return `<g transform="${tr}"${attrs}>${out.join('')}</g>`;
}

// ------------------------------------------------------------------ the cursor path
// A closed sum of sines in cell units; every frequency is a whole number of
// turns per loop, so the path closes. The cursor runs it at constant speed
// (resampled by arc length), the way a joystick cursor moves, so the seeds
// land evenly instead of piling up on the bends.
function curve(a) {
  const x = 40 + 21 * Math.sin(2 * a + 0.4) + 12 * Math.sin(3 * a + 1.1);
  const y = 13 + 7.5 * Math.sin(a + 0.2) + 3.5 * Math.sin(4 * a + 0.5);
  return [x, y];
}
function resample(fn, count, fine = 6000) {
  const pts = [];
  for (let i = 0; i <= fine; i++) pts.push(fn((2 * Math.PI * i) / fine));
  const acc = [0];
  for (let i = 1; i <= fine; i++) acc.push(acc[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const total = acc[fine];
  const out = [];
  let j = 0;
  for (let i = 0; i < count; i++) {
    const target = (total * i) / count;
    while (acc[j + 1] < target) j++;
    const f = (target - acc[j]) / (acc[j + 1] - acc[j] || 1);
    out.push([pts[j][0] + f * (pts[j + 1][0] - pts[j][0]), pts[j][1] + f * (pts[j + 1][1] - pts[j][1])]);
  }
  return { out, total };
}
const PATH = resample(curve, NS);
const CURSOR = PATH.out.map((p) => p.map((v) => Math.round(v)));

// ------------------------------------------------------------------ seeds
// The performer changes preset once a bar: a seed shape and a pulse pattern
// (which of the six steps of each beat drop a seed). EMIT can be overridden
// for experiments with --emit=0,1,2|0,3|... (one pattern per bar).
const STEPS_PER_BAR = NS / BARS;
const EMIT_DEFAULT = ['0,3', '0,1,2,3,4,5', '0,3', '0,3', '0,1,2'];
const EMIT = (arg('emit') ? arg('emit').split('|') : EMIT_DEFAULT).map((p) => new Set(p.split(',').map(Number)));
const seeds = [];
for (let i = 0; i < NS; i++) {
  const bar = Math.floor(i / STEPS_PER_BAR);
  if (!EMIT[bar % EMIT.length].has(i % 6)) continue;
  const [cx, cy] = CURSOR[i];
  seeds.push({ i, cx, cy, shape: bar % SHAPES.length, phase: Math.floor(i / 6) });
}

// ------------------------------------------------------------------ readouts
// One per bar of the theme. value is out of 16 segments.
const READOUTS = [
  { label: 'PULSE SPEED', value: 11, shows: '80 BPM' },
  { label: 'BUFFER LENGTH', value: 16, shows: '10:00:00' },
  { label: 'PLOT', value: 1, shows: 'MINIMAL' },
  { label: 'SAMPLES USED', value: 0, shows: 'NONE' },
  { label: 'SIGNAL', value: 1, shows: '1 BAR' },
];

// ------------------------------------------------------------------ build
function build() {
  const css = [];
  const defs = [];
  const body = [];

  // --- seed level paths
  SHAPES.forEach((sh, si) => {
    sh.levels.forEach((cells, k) => {
      const set = new Set(cells.map(([x, y]) => key(x, y)));
      defs.push(`<path id="s${si}${k}" d="${pathOf(set, CS)}"/>`);
    });
  });

  // --- shared animation
  const holdPct = n((HOLD / NS) * 100, 4);
  // longhands, so the shorthand's implied delay does not beat the .tN classes
  css.push(`.q use{animation-name:v;animation-duration:${n(T)}s;animation-timing-function:step-end;animation-iteration-count:infinite}`);
  css.push(`@keyframes v{0%{opacity:1}${holdPct}%{opacity:0}100%{opacity:0}}`);
  const usedStarts = new Set();
  SEQ.forEach((c, j) => css.push(`.c${j}{fill:${c}}`));

  // --- one quadrant's worth of seeds (written four times)
  const uses = [];
  for (const s of seeds) {
    const lv = [];
    SHAPES[s.shape].levels.forEach((cells, k) => {
      if (!cells.length) return;
      const start = (s.i + k) % NS;
      usedStarts.add(start);
      const col = (k + s.phase) % SEQ.length;
      lv.push(`<use href="#s${s.shape}${k}" class="t${start} c${col}"/>`);
    });
    uses.push(`<g transform="translate(${s.cx * CS} ${s.cy * CS})">${lv.join('')}</g>`);
  }
  [...usedStarts].sort((a, b) => a - b).forEach((st) => css.push(`.t${st}{animation-delay:${delayOf(st)}}`));
  const quad = uses.join('');

  defs.push(`<clipPath id="scr"><rect x="0" y="0" width="${SW}" height="${SH}"/></clipPath>`);

  body.push(`<rect width="${W}" height="${H}" rx="14" fill="#000"/>`);
  body.push(`<g transform="translate(${PAD} ${PAD})"><g clip-path="url(#scr)">`);
  body.push(`<g class="q">${quad}</g>`);
  body.push(`<g class="q" transform="matrix(-1 0 0 1 ${SW} 0)">${quad}</g>`);
  body.push(`<g class="q" transform="matrix(1 0 0 -1 0 ${SH})">${quad}</g>`);
  body.push(`<g class="q" transform="matrix(-1 0 0 -1 ${SW} ${SH})">${quad}</g>`);

  // --- cursor: one white cell, moved a cell at a time
  const kf = [];
  let prev = null;
  for (let i = 0; i < NS; i++) {
    const [x, y] = CURSOR[i];
    const v = `${x * CS}px,${y * CS}px`;
    if (v === prev) continue;
    prev = v;
    kf.push(`${n((i / NS) * 100, 3)}%{transform:translate(${v})}`);
  }
  kf.push(`100%{transform:translate(${CURSOR[0][0] * CS}px,${CURSOR[0][1] * CS}px)}`);
  css.push(`.cur{animation:cur ${n(T)}s step-end infinite;animation-delay:${delayOf(0)}}`);
  css.push(`@keyframes cur{${kf.join('')}}`);
  body.push(`<rect class="cur" width="${CS}" height="${CS}" fill="#fff"/>`);
  body.push('</g></g>');

  // --- status line: everything stands on one baseline
  const FPX = CS / 8;
  const NAME_SCALE = 2.5;
  const topFor = (scale) => BASE - 7 * FPX * scale;
  body.push(text('CASTAWAY', PAD, topFor(NAME_SCALE), NAME_SCALE, ' fill="#fff"'));
  const y1 = topFor(1);

  // one window per bar of the theme: shown for a bar, hidden for the rest
  const winPct = n((STEPS_PER_BAR / NS) * 100, 4);
  css.push(`.w{animation-name:w;animation-duration:${n(T)}s;animation-timing-function:step-end;animation-iteration-count:infinite}`);
  css.push(`@keyframes w{0%{opacity:1}${winPct}%{opacity:0}100%{opacity:0}}`);
  for (let b = 0; b < BARS; b++) css.push(`.b${b}{animation-delay:${delayOf(b * STEPS_PER_BAR)}}`);

  // the current seed shape
  const shapeX = PAD + 8 * CS * NAME_SCALE + 2.5 * CS;
  SHAPES.forEach((sh, si) => {
    body.push(`<g class="w b${si}">${text('SHAPE', shapeX, y1, 1, ` fill="${GREY}"`)}${text(`${si + 1} ${sh.name}`, shapeX + 6 * CS, y1, 1, ' fill="#fff"')}</g>`);
  });

  // readouts: label, graduated bar, value. The bar's segments change over
  // left to right a little after the bar starts, so a new value wipes in.
  const SEG = 16;
  const segW = 8;
  const WIPE = 0.03;
  const valueX = PAD + SW - 9 * CS;
  const barX = valueX - CS - SEG * segW;
  const labelRight = barX - CS;
  const segRect = (i) => {
    const h = 5 + Math.round((i * 15) / (SEG - 1));
    return [barX + i * segW, BASE - h, segW - 2, h];
  };
  const dimPath = [];
  for (let i = 0; i < SEG; i++) {
    const [x, y, w, h] = segRect(i);
    dimPath.push(`M${x} ${y}h${w}v${h}h${-w}z`);
  }
  body.push(`<path d="${dimPath.join('')}" fill="${DIM}"/>`);
  READOUTS.forEach((r, ri) => {
    const parts = [];
    parts.push(text(r.label, labelRight - r.label.length * CS, y1, 1, ` fill="${GREY}"`));
    parts.push(text(r.shows, valueX, y1, 1, ' fill="#fff"'));
    body.push(`<g class="w b${ri}">${parts.join('')}</g>`);
    for (let i = 0; i < r.value; i++) {
      const [x, y, w, h] = segRect(i);
      const d = n((((ri * STEPS_PER_BAR * STEP + i * WIPE - T0) % T) + T) % T - T, 4);
      body.push(`<rect class="w" style="animation-delay:${d}s" x="${x}" y="${y}" width="${w}" height="${h}" fill="${SEQ[Math.floor((i * 7) / SEG)]}"/>`);
    }
  });

  css.push('@media (prefers-reduced-motion:reduce){*{animation-play-state:paused!important}}');

  const title = 'CASTAWAY: a light synth, played on the beat';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${title}">`
    + `<title>${title}</title>`
    + `<style>${css.join('')}</style>`
    + `<defs>${defs.join('')}${glyphDefs.join('')}</defs>`
    + body.join('')
    + '</svg>\n';
}

// ------------------------------------------------------------------ contact sheet
function sheet() {
  const parts = [];
  const cell = 12;
  SHAPES.forEach((sh, si) => {
    for (let k = 0; k < 7; k++) {
      const ox = 20 + k * 150 + 70;
      const oy = 20 + si * 150 + 70;
      for (let j = 0; j <= k; j++) {
        for (const [x, y] of sh.levels[j]) {
          parts.push(`<rect x="${ox + x * cell}" y="${oy + y * cell}" width="${cell - 1}" height="${cell - 1}" fill="${SEQ[j]}"/>`);
        }
      }
    }
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1100 780" width="1100" height="780"><rect width="1100" height="780" fill="#000"/>${parts.join('')}</svg>\n`;
}

// ------------------------------------------------------------------ frames
// A static contact sheet of the trail at evenly spaced moments, worked out
// from the same seeds and timings (for checking the look without a browser).
function frames(count = Number(arg("nframes") || 10)) {
  const cols = 2;
  const fw = SW + 20;
  const fh = SH + 20;
  const parts = [];
  for (let f = 0; f < count; f++) {
    const t = Math.round((f * NS) / count + T0 / STEP) % NS;
    const ox = (f % cols) * fw + 10;
    const oy = Math.floor(f / cols) * fh + 10;
    const cells = new Map();
    for (const s of seeds) {
      SHAPES[s.shape].levels.forEach((lvCells, k) => {
        const start = (s.i + k) % NS;
        if (((t - start) % NS + NS) % NS >= HOLD) return;
        const col = SEQ[(k + s.phase) % SEQ.length];
        for (const [dx, dy] of lvCells) {
          const x = s.cx + dx;
          const y = s.cy + dy;
          for (const [mx, my] of [[x, y], [GW - 1 - x, y], [x, GH - 1 - y], [GW - 1 - x, GH - 1 - y]]) {
            if (mx < 0 || my < 0 || mx >= GW || my >= GH) continue;
            cells.set(key(mx, my), col);
          }
        }
      });
    }
    parts.push(`<rect x="${ox}" y="${oy}" width="${SW}" height="${SH}" fill="#000"/>`);
    const byCol = new Map();
    for (const [k, c] of cells) {
      if (!byCol.has(c)) byCol.set(c, new Set());
      byCol.get(c).add(k);
    }
    for (const [c, set] of byCol) parts.push(`<path fill="${c}" d="${pathOf(set, CS, ox, oy)}"/>`);
    const [cx, cy] = CURSOR[t % NS];
    parts.push(`<rect x="${ox + cx * CS}" y="${oy + cy * CS}" width="${CS}" height="${CS}" fill="#fff" stroke="#f00"/>`);
  }
  const w = cols * fw + 10;
  const h = Math.ceil(count / cols) * fh + 10;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"><rect width="${w}" height="${h}" fill="#222"/>${parts.join('')}</svg>
`;
}

const svg = build();
if (arg('frames')) {
  fs.writeFileSync(path.resolve(arg('frames')), frames());
  console.log(`wrote ${arg('frames')}`);
}
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, svg);
console.log(`wrote ${path.relative(process.cwd(), OUT)} (${(svg.length / 1024).toFixed(1)} KB, ${seeds.length} seeds a quadrant, path ${PATH.total.toFixed(0)} cells)`);
if (SHEET) {
  fs.writeFileSync(SHEET, sheet());
  console.log(`wrote ${SHEET}`);
}
