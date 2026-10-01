#!/usr/bin/env node
// CASTAWAY, drawn as the data screens a 1990s bulletin board showed you after login: a header
// strip (gradient block-letter logo at left, a stats block of label/value pairs at right), then
// the LAST CALLERS list in a ragged grey frame, inverse hotkey cells, a letter-spaced rumour line
// and a cyan prompt. A spot illustration of the island breaks out over the frame's right edge.
// Style: "BBS data screens" (catalogue entry ansi-05), after the PCBoard / Renegade / Telegard
// menu sets of the mid-1990s. All lettering and art in this file is original.
//
// Regenerate:  node examples/castaway/src/02-bbs-stats_opus_5.5.mjs
// Writes ../assets/02-bbs-stats_opus_5.5.svg and ../02-bbs-stats_opus_5.5.md.
//
// Plain Node, no dependencies, deterministic: no clock, and the only randomness is a seeded PRNG
// (seed 1992, the same as the default run). Every number shown comes from the SNAPSHOT below,
// checked by hand against the project on 2026-10-01, so the same script always writes the same
// bytes. The project changes daily: run with --live to refresh the counts that can be read
// straight from its files (activities, lanes, sound files, file sizes and dates), read-only,
// from ../../../../castaway. The typical-run medians and the busy share come from simulating
// the schedule (python -B tools/schedule.py), so update those in the snapshot by hand.
// Text is drawn from a CP437-style 8x16 bitmap font as <use> glyphs, never <text>. Animation is
// CSS only and runs on the soundtrack's grid: 80 BPM, one beat every 0.75 s, the lightbar moves
// one caller per bar (3 s), so the whole screen loops every 9 bars = 27 s.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '02-bbs-stats_opus_5.5';
const OUT_SVG = path.join(HERE, '..', 'assets', `${SLUG}.svg`);
const OUT_MD = path.join(HERE, '..', `${SLUG}.md`);
const PROJECT = path.resolve(HERE, '..', '..', '..', '..', 'castaway');

// ---------------------------------------------------------------------------------------------
// Facts, as checked against the project on 2026-10-01 (read-only):
//   activities.toml: 92 [activities.*] tables, 81 of them on the four timed tiers (9 regular,
//     35 occasional, 31 rare, 6 super rare) and 11 chained; 6 lanes; seed 1992; 3.0 s bars.
//   media/audio/audio_catalog.json: 151 WAV files, "Synthesized by tools/make_audio.py from code
//     only: no samples, loops or recordings."
//   typical run: medians of 200 simulated 10-hour runs (seeds 0-199, tools/schedule.py's own
//     simulate()): 157 regular, 31 occasional, 13 rare, 2 super rare, 15 chained. Shown as ~155,
//     ~30, ~13, ~2 (the figures activities.toml's header gives) and ~15 chained (the header's
//     ~20 predates the newer chained activities).
//   busy: `python -B tools/schedule.py` prints "She is busy 28% of the run and idling 72%".
// ---------------------------------------------------------------------------------------------
const SNAPSHOT = {
  asOf: '2026-10-01',
  activities: 92,
  timed: 81,
  chained: 11,
  sounds: 151,
  lanes: 6,
  typical: [155, 30, 13, 2, 15],    // regular, occasional, rare, super rare, chained
  busy: 28,                          // percent of the default run (seed 1992)
  files: {
    'tools/serve.py': [16842, '2026-09-30'],
    'web/index.html': [3775, '2026-09-30'],
    'tools/schedule.py': [21424, '2026-09-30'],
    'activities.toml': [174976, '2026-10-01'],
    'tools/make_audio.py': [116996, '2026-10-01'],
    'tools/render_demo.py': [95580, '2026-09-30'],
    'MUSING.md': [108510, '2026-10-01'],
  },
};

// --live: refresh what can be read straight from the project's files. Never writes there.
function readFacts() {
  const facts = { ...SNAPSHOT, files: { ...SNAPSHOT.files }, live: false };
  if (!process.argv.includes('--live')) return facts;
  try {
    const toml = fs.readFileSync(path.join(PROJECT, 'activities.toml'), 'utf8');
    const n = (toml.match(/^\[activities\.[A-Za-z0-9_]+\]\s*$/gm) || []).length;
    const chained = (toml.match(/^tier\s*=\s*"chained"/gm) || []).length;
    if (n) Object.assign(facts, { activities: n, chained, timed: n - chained, live: true });
    const lanes = toml.split(/^\[lanes\]\s*$/m)[1];
    if (lanes) {
      const k = (lanes.split(/^\[/m)[0].match(/^[A-Za-z0-9_]+\s*=/gm) || []).length;
      if (k) facts.lanes = k;
    }
  } catch { /* keep the snapshot */ }
  try {
    const cat = JSON.parse(fs.readFileSync(path.join(PROJECT, 'media', 'audio', 'audio_catalog.json'), 'utf8'));
    if (Array.isArray(cat.files) && cat.files.length) facts.sounds = cat.files.length;
  } catch { /* keep the snapshot */ }
  let newest = '0000-00-00';
  for (const rel of Object.keys(SNAPSHOT.files)) {
    try {
      const st = fs.statSync(path.join(PROJECT, rel));
      facts.files[rel] = [st.size, st.mtime.toISOString().slice(0, 10)];
    } catch { /* keep the snapshot */ }
    if (facts.files[rel][1] > newest) newest = facts.files[rel][1];
  }
  facts.asOf = newest;
  console.log('--live: medians and busy share are still the snapshot\'s; re-check them with tools/schedule.py');
  return facts;
}
const FACTS = readFacts();

// Seeded PRNG (mulberry32), for the ragged frame and the sea. Seed 1992, like the run.
function prng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------------------------------------
// Screen geometry and timing
// ---------------------------------------------------------------------------------------------
const COLS = 100, ROWS = 30, CW = 8, CH = 16, PAD = 16;
const SW = COLS * CW, SH = ROWS * CH;
const VBW = SW + PAD * 2, VBH = SH + PAD * 2;
const BEAT = 0.75, BAR = 3;          // 80 BPM; every activity starts on the next bar
const s = (t) => `${+t.toFixed(4)}s`;

// The 16-colour DOS/ANSI palette.
const PAL = ['#000000', '#0000AA', '#00AA00', '#00AAAA', '#AA0000', '#AA00AA', '#AA5500', '#AAAAAA',
  '#555555', '#5555FF', '#55FF55', '#55FFFF', '#FF5555', '#FF55FF', '#FFFF55', '#FFFFFF'];
const [BLK, BLU, GRN, CYN, RED, MAG, BRN, LGR, DGR, LBL, LGN, LCY, LRD, LMG, YEL, WHT] = PAL.map((_, i) => i);

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

// Blocks and CP437 shades.
const rowsOf = (fn) => Array.from({ length: 16 }, (_, y) => fn(y));
FONT.set('█', rowsOf(() => 0xFF));
FONT.set('▀', rowsOf((y) => (y < 8 ? 0xFF : 0)));
FONT.set('▄', rowsOf((y) => (y >= 8 ? 0xFF : 0)));
FONT.set('▌', rowsOf(() => 0xF0));
FONT.set('▐', rowsOf(() => 0x0F));
FONT.set('░', rowsOf((y) => (y % 2 ? 0x88 : 0x22)));
FONT.set('▒', rowsOf((y) => (y % 2 ? 0xAA : 0x55)));
FONT.set('▓', rowsOf((y) => (y % 2 ? 0x77 : 0xDD)));

// Box drawing, generated from arm descriptions: single lines on row 7 / column 3,
// double lines on rows 6+9 / columns 2+5.
function box(ch, spec) {
  const g = new Array(16).fill(0);
  const set = (x, y) => { g[y] |= 1 << (7 - x); };
  const hline = (y, x0, x1) => { for (let x = x0; x <= x1; x++) set(x, y); };
  const vline = (x, y0, y1) => { for (let y = y0; y <= y1; y++) set(x, y); };
  spec({ hline, vline });
  FONT.set(ch, g);
}
box('─', ({ hline }) => hline(7, 0, 7));
box('│', ({ vline }) => vline(3, 0, 15));
box('┌', ({ hline, vline }) => { hline(7, 3, 7); vline(3, 7, 15); });
box('┐', ({ hline, vline }) => { hline(7, 0, 3); vline(3, 7, 15); });
box('└', ({ hline, vline }) => { hline(7, 3, 7); vline(3, 0, 7); });
box('┘', ({ hline, vline }) => { hline(7, 0, 3); vline(3, 0, 7); });
box('┴', ({ hline, vline }) => { hline(7, 0, 7); vline(3, 0, 7); });
box('├', ({ hline, vline }) => { hline(7, 3, 7); vline(3, 0, 15); });
box('┤', ({ hline, vline }) => { hline(7, 0, 3); vline(3, 0, 15); });
box('═', ({ hline }) => { hline(6, 0, 7); hline(9, 0, 7); });
box('║', ({ vline }) => { vline(2, 0, 15); vline(5, 0, 15); });
box('╔', ({ hline, vline }) => { hline(6, 2, 7); vline(2, 6, 15); hline(9, 5, 7); vline(5, 9, 15); });
box('╗', ({ hline, vline }) => { hline(6, 0, 5); vline(5, 6, 15); hline(9, 0, 2); vline(2, 9, 15); });
box('╚', ({ hline, vline }) => { hline(9, 2, 7); vline(2, 0, 9); hline(6, 5, 7); vline(5, 0, 6); });
box('╝', ({ hline, vline }) => { hline(9, 0, 5); vline(5, 0, 9); hline(6, 0, 2); vline(2, 0, 6); });

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

// A few extra glyphs this screen needs.
def('»', 5, '##..##.. .##..##. ..##..## .##..##. ##..##..');
def('«', 5, '..##..## .##..##. ##..##.. .##..##. ..##..##');
def('□', 5, '.######. .#....#. .#....#. .#....#. .#....#. .######.');
def('~', 6, '.###.## ##.###.');
def('%', 2, '.##....# #..#..## #..#.##. .##.##.. ...##... ..##.##. .##.#..# ##..#..# #....##.');

const glyphIds = new Map();
function gid(ch) {
  if (!FONT.has(ch)) throw new Error(`no glyph for ${JSON.stringify(ch)} (U+${ch.codePointAt(0).toString(16)})`);
  if (!glyphIds.has(ch)) glyphIds.set(ch, `g${glyphIds.size.toString(36)}`);
  return glyphIds.get(ch);
}
// <use> elements for a string at a cell position (colour comes from the parent group).
function uses(r, c, str) {
  let out = '';
  for (const ch of str) {
    if (ch !== ' ') out += `<use href="#${gid(ch)}" x="${c * CW}" y="${r * CH}"/>`;
    c++;
  }
  return out;
}
const len = (str) => [...str].length;
const width = (parts) => parts.reduce((a, [t]) => a + len(t), 0);

// ---------------------------------------------------------------------------------------------
// Static screen buffer
// ---------------------------------------------------------------------------------------------
const grid = Array.from({ length: ROWS }, () => new Array(COLS).fill(null));
const bgRuns = [];
function put(r, c, str, fg) {
  for (const ch of str) {
    if (c < 0 || c >= COLS || r < 0 || r >= ROWS) throw new Error(`off screen at ${r},${c}: ${str}`);
    grid[r][c] = ch === ' ' ? null : { ch, fg };
    c++;
  }
  return c;
}
function seg(r, c, parts) { for (const [t, fg] of parts) c = put(r, c, t, fg); return c; }
function bg(r, c, n, color) { bgRuns.push({ r, c, n, color }); }

// Where things live.
const R = { tag: 7, ident: 8, ftop: 9, head: 10, rule: 11, callers: 12, fbot: 21, keys: 23, rumour: 28, prompt: 29 };
const FRAME = { c0: 0, c1: 77 };          // the right edge runs on under the illustration
const TABLE = { num: 2, handle: 5, node: 21, tier: 30, note: 35, end: 71 };
const V = { c: 72, r: 8, w: 28, h: 38 };  // the spot illustration, in 8x8 half-block pixels
const STATS_C = 68, HALF = 15;

// ---------------------------------------------------------------------------------------------
// Header strip, right: the stats block. label: value, two to a row, values flush right, like a
// board's system stats; every number is the project's own (see SNAPSHOT).
// ---------------------------------------------------------------------------------------------
function pair(r, c, label, value, vfg = WHT, w = HALF) {
  const gap = w - len(label) - 1 - len(value);
  if (gap < 1) throw new Error(`stats pair too long: ${label} ${value}`);
  seg(r, c, [[label, LCY], [':', DGR], [' '.repeat(gap), DGR], [value, vfg]]);
}
const STATS = [
  [['time', 'day', YEL], ['night', 'never', LRD]],
  [['run', '10:00:00', WHT], ['seed', '1992', WHT]],
  [['activities', String(FACTS.activities), YEL], ['lanes', String(FACTS.lanes), WHT]],
  [['tempo', '80 bpm', WHT], ['key', 'F major', WHT]],
  [['bar', '3.0 s', WHT], null],
  [['sounds', String(FACTS.sounds), YEL], ['samples', '0', LGN]],
  [['busy', `${FACTS.busy}%`, WHT], ['idle', `${100 - FACTS.busy}%`, LGN]],
];
STATS.forEach((row, r) => row.forEach((p, i) => { if (p) pair(r, STATS_C + i * (HALF + 2), ...p); }));
// The beat meter: four squares, one lit per beat (the lit one is animated below).
const BEATM = { r: 4, c: STATS_C + 2 * HALF + 2 - 7 };
seg(4, STATS_C + HALF + 2, [['beat', LCY], [':', DGR]]);
seg(4, BEATM.c, [['□ □ □ □', DGR]]);
// The board's upload/download ratio, island style: each bottle she throws washes straight back,
// and a different one turns up later with a reply. One out, two in.
pair(7, STATS_C, 'ratio', '1 bottle out, 2 in', WHT, 2 * HALF + 2);

// Header strip, left, under the logo.
seg(R.tag, 1, [['a ten-hour lo-fi island video in which ', LGR], ['almost nothing happens', WHT], ['.', LGR]]);
seg(R.ident, 1, [['PaLM ReaDeR', YEL], [' bbs ', LGR], ['·', DGR], [' sysop ', LGR], ['low tide', WHT],
  [' ·', DGR], [' node 1', LGR]]);

// Screen title in eLiTe capitals, right-aligned over the frame.
{
  const parts = [['░▒▓', DGR], [' LaST ', WHT], ['CaLLeRS ', LCY], ['▓▒░', DGR]];
  seg(R.ident, TABLE.end - width(parts), parts);
}

// ---------------------------------------------------------------------------------------------
// The ragged frame: grey half blocks with worn patches that fade out through the shade
// characters and back. Seeded, so it is the same frame every time.
// ---------------------------------------------------------------------------------------------
{
  const rnd = prng(1992);
  const edge = (cells, solid) => {
    // cells: [[r, c], ...] along one edge. Mostly solid, with tears ▓▒░ ░▒▓ and lighter runs.
    let i = 0;
    while (i < cells.length) {
      const x = rnd();
      if (x < 0.10 && i > 2 && i < cells.length - 6) {
        const tear = rnd() < 0.5 ? ['▓', '▒', '░', ' ', '░', '▒', '▓'] : ['▓', '▒', '░', '▒', '▓'];
        for (const ch of tear) { if (i >= cells.length) break; const [r, c] = cells[i++]; put(r, c, ch, DGR); }
      } else if (x < 0.22) {
        const n = 3 + Math.floor(rnd() * 6);
        for (let k = 0; k < n && i < cells.length; k++) { const [r, c] = cells[i++]; put(r, c, solid, LGR); }
      } else {
        const [r, c] = cells[i++]; put(r, c, solid, DGR);
      }
    }
  };
  const top = [], bot = [], left = [], right = [];
  for (let c = FRAME.c0; c <= FRAME.c1; c++) { top.push([R.ftop, c]); bot.push([R.fbot, c]); }
  for (let r = R.ftop + 1; r < R.fbot; r++) { left.push([r, FRAME.c0]); right.push([r, FRAME.c1]); }
  edge(top, '▄');
  edge(bot, '▀');
  edge(left, '█');
  edge(right, '█');
  // a little shade on the inside of the left edge, like the menu sets do
  for (let r = R.ftop + 1; r < R.fbot; r++) if (rnd() < 0.35) put(r, FRAME.c0 + 1, '░', DGR);
}

// ---------------------------------------------------------------------------------------------
// LAST CALLERS: the island's visitors, with the lane ("node") each one uses and its tier.
// ---------------------------------------------------------------------------------------------
const CALLERS = [
  { handle: 'OLD SHELL', node: 'turtle', tier: 'occ', note: 'sea turtle. dozed off with her.' },
  { handle: 'CRATE ESCAPE', node: 'cat', tier: 'rare', note: 'grey tabby on a crate. up the palm.' },
  { handle: 'LAST MILE', node: 'sea_sky', tier: 'rare', note: 'drone. parcel: more headphones.' },
  { handle: 'LO-FIN', node: 'sea_sky', tier: 'rare', note: 'shark in headphones. nodded.' },
  { handle: 'SAY CHEESE', node: 'sea_sky', tier: 'rare', note: 'tour boat. selfies. no lift.' },
  { handle: 'FOILED AGAIN', node: 'sea_sky', tier: 'rare', note: 'e-foil bro. shaka. carved off.' },
  { handle: 'NUT CASE', node: 'castaway', tier: 'occ', note: 'hermit crab. left in a coconut.' },
  { handle: 'GLASS HALF FULL', node: 'castaway', tier: 'occ', note: 'a bottle. washed straight back.' },
  { handle: 'SHIPS THAT PASS', node: 'sea_sky', tier: 'occ', note: 'she was busy. (headphones.)' },
];
const N = CALLERS.length;
const LOOP = N * BAR;                     // 27 s: nine bars
const HERO = N - 1;                       // the frame shown when motion is reduced: the ship
for (const c of CALLERS) if (TABLE.note + len(c.note) > TABLE.end) throw new Error(`note too long: ${c.note}`);

seg(R.head, TABLE.num, [['##', LGR]]);
put(R.head, TABLE.handle, 'HaNDLe', LGR);
put(R.head, TABLE.node, 'NoDe', LGR);
put(R.head, TABLE.tier, 'TieR', LGR);
put(R.head, TABLE.note, 'LeFT a NoTe', LGR);
put(R.rule, TABLE.num, '─'.repeat(TABLE.end - TABLE.num), DGR);
const callerRow = (i) => R.callers + i;
CALLERS.forEach((c, i) => {
  const r = callerRow(i);
  put(r, TABLE.num, String(i + 1).padStart(2, '0'), YEL);
  put(r, TABLE.handle, c.handle, WHT);
  put(r, TABLE.node, c.node, LCY);
  put(r, TABLE.tier, c.tier, c.tier === 'rare' ? LMG : LGN);
  put(r, TABLE.note, c.note, LGR);
});

// ---------------------------------------------------------------------------------------------
// Hotkeys: inverse cells in green, cyan, orange and red, the command word in lowercase, dot
// leaders, then what it really does. Four of them are real commands; the other four are not.
// ---------------------------------------------------------------------------------------------
const KEYW = 34;
const KEYS = [
  ['S', GRN, BLK, 'serve', 'tools/serve.py', WHT],
  ['W', CYN, BLK, 'watch', '127.0.0.1:8765', WHT],
  ['V', BRN, BLK, 'validate', 'tools/schedule.py', WHT],
  ['D', RED, WHT, 'dev reel', 'render_demo.py', WHT],
  ['A', GRN, BLK, 'audio', 'tools/make_audio.py', WHT],
  ['M', CYN, BLK, 'musings', 'MUSING.md', WHT],
  ['I', BRN, BLK, 'idle', 'the default', LGR],
  ['L', RED, WHT, 'leave', 'any time. sure.', LGR],
];
KEYS.forEach(([k, kbg, kfg, word, value, vfg], i) => {
  const r = R.keys + (i % 4), c = 2 + Math.floor(i / 4) * (KEYW + 1);
  bg(r, c, 3, kbg);
  put(r, c + 1, k, kfg);
  const dots = KEYW - 3 - 1 - len(word) - 2 - len(value);
  if (dots < 2) throw new Error(`hotkey too long: ${word}`);
  seg(r, c + 4, [[word, LCY], [' ' + '.'.repeat(dots) + ' ', DGR], [value, vfg]]);
});

// Rumour line (the label is static; the letter-spaced rumours rotate) and the prompt.
const RUMOUR_C = seg(R.rumour, 1, [['CoCoNuT WiReLeSS', LGN], [' »', DGR]]) + 2;
const RUMOURS = [
  'one bar of signal: top of the palm.',
  'she could leave any time.',
  'a ship went past. she was busy.',
];
const spaced = (t) => t.split(' ').map((w) => [...w].join(' ')).join('   ');
for (const t of RUMOURS) if (RUMOUR_C + len(spaced(t)) > COLS) throw new Error(`rumour too long: ${t}`);
const PROMPT_END = seg(R.prompt, 1, [['»» ', LCY], ['CaSTaWaY', WHT], [' »» ', LCY], ['LaST CaLLeRS', WHT], [' »» ', LCY],
  ['select a key, or keep idling (she will) ', CYN], ['»', LCY], [' ', 0]]);
const CURSOR = { r: R.prompt, c: PROMPT_END };

// ---------------------------------------------------------------------------------------------
// The logo: CASTAWAY in block letters on the half-block grid (8x8 pixels), filled top to
// bottom yellow, green, cyan, white with CP437 shade rows between, over a dithered shadow.
// Own lettering, nothing traced.
// ---------------------------------------------------------------------------------------------
const rep = (row, n) => new Array(n).fill(row);
const LOGO_FONT = {
  C: ['..#####', '.######', '###....', ...rep('##.....', 6), '###....', '.######', '..#####'],
  A: ['..###..', '.#####.', '###.###', ...rep('##...##', 3), '#######', '#######', ...rep('##...##', 4)],
  S: ['..#####', '.######', '###....', '##.....', '###....', '.#####.', '..#####', '.....##', '.....##', '....###', '######.', '#####..'],
  T: ['######', '######', ...rep('..##..', 10)],
  W: [...rep('##....##', 4), ...rep('##.##.##', 6), '########', '.##..##.'],
  Y: [...rep('##....##', 4), '###..###', '.######.', '..####..', ...rep('...##...', 5)],
};
const LP = 8, LH = 12;
const LOGO = { x: 1 * CW, y: 0 };
function wordBitmap(word) {
  const cols = [];
  [...word].forEach((ch, i) => {
    if (i) cols.push(null);
    const L = LOGO_FONT[ch];
    if (L.length !== LH) throw new Error(`logo letter ${ch} is ${L.length} rows`);
    for (let x = 0; x < L[0].length; x++) cols.push(L.map((row) => row[x] === '#'));
  });
  return cols;
}
const LOGO_COLS = wordBitmap('CASTAWAY');
if (LOGO.x / CW + LOGO_COLS.length + 1 > STATS_C - 1) throw new Error('logo runs into the stats block');
const logoPath = bitmapPath(Array.from({ length: LH }, (_, y) => (x) => LOGO_COLS[x] && LOGO_COLS[x][y]), LOGO_COLS.length, LP, LP);
// Ramp: one entry per logo row: [base colour] or [base, overlay colour, shade].
const RAMP = [[YEL], [YEL], [LGN, YEL, '▒'], [LGN], [LGN], [LCY, LGN, '▒'], [LCY], [LCY], [WHT, LCY, '▒'], [WHT], [WHT], [LGR, WHT, '▓']];

// ---------------------------------------------------------------------------------------------
// Shade patterns: CP437 ░ ▒ ▓ as 1-pixel dot patterns, one per colour that needs them.
// ---------------------------------------------------------------------------------------------
const SHADES = { '░': ['..#.', '#...'], '▒': ['#.#.', '.#.#'], '▓': ['##.#', '.###'] };
const SHADE_KEY = { '░': 'a', '▒': 'b', '▓': 'c' };
const patterns = new Map();
function patId(fg, shade) {
  const id = `s${fg.toString(16)}${SHADE_KEY[shade]}`;
  if (!patterns.has(id)) {
    const pat = SHADES[shade];
    patterns.set(id, `<pattern id="${id}" width="4" height="2" patternUnits="userSpaceOnUse"><path d="${bitmapPath(pat.map((row) => (x) => row[x] === '#'), 4)}" fill="${PAL[fg]}"/></pattern>`);
  }
  return id;
}
function rampPattern(id, ramp) {
  let d = '';
  const solid = new Map(), dots = new Map();
  ramp.forEach(([base, over, shade], i) => {
    solid.set(base, (solid.get(base) || '') + `M0 ${i * LP}h4v${LP}h-4z`);
    if (over != null) {
      const pat = SHADES[shade];
      dots.set(over, (dots.get(over) || '') + bitmapPath(Array.from({ length: LP }, (_, y) => (x) => pat[y % 2][x] === '#'), 4, 1, 1, 0, i * LP));
    }
  });
  for (const [c, p] of solid) d += `<path d="${p}" fill="${PAL[c]}"/>`;
  for (const [c, p] of dots) d += `<path d="${p}" fill="${PAL[c]}"/>`;
  return `<pattern id="${id}" width="4" height="${ramp.length * LP}" patternUnits="userSpaceOnUse">${d}</pattern>`;
}

// ---------------------------------------------------------------------------------------------
// Pixel canvases for the spot illustration. A pixel is a palette index, or a dither
// {fg, bg, shade}: the background colour with a CP437 shade of the foreground over it.
// ---------------------------------------------------------------------------------------------
const PX = 8;
const VX = V.c * CW, VY = V.r * CH;
const dith = (fg, bg, shade) => ({ fg, bg, shade });
const canvas = (w, h) => ({ w, h, px: Array.from({ length: h }, () => new Array(w).fill(null)) });
const setPx = (cv, x, y, v) => { if (x >= 0 && y >= 0 && x < cv.w && y < cv.h) cv.px[y][x] = v; };
const getPx = (cv, x, y) => (x >= 0 && y >= 0 && x < cv.w && y < cv.h ? cv.px[y][x] : null);

function ptsPath(pts, ox, oy) {
  const set = new Set(pts.map(([x, y]) => `${x},${y}`));
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (const [x, y] of pts) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  const rows = Array.from({ length: y1 - y0 + 1 }, (_, y) => (x) => set.has(`${x + x0},${y + y0}`));
  return bitmapPath(rows, x1 - x0 + 1, PX, PX, ox + x0 * PX, oy + y0 * PX);
}
function emitPixels(cv, ox = 0, oy = 0) {
  const solid = new Map(), pat = new Map();
  const add = (m, k, x, y) => { if (!m.has(k)) m.set(k, []); m.get(k).push([x, y]); };
  for (let y = 0; y < cv.h; y++) {
    for (let x = 0; x < cv.w; x++) {
      const v = cv.px[y][x];
      if (v == null) continue;
      if (typeof v === 'number') add(solid, v, x, y);
      else { if (v.bg != null) add(solid, v.bg, x, y); add(pat, patId(v.fg, v.shade), x, y); }
    }
  }
  let out = '';
  for (const [c, pts] of solid) out += `<path class="c${c}" d="${ptsPath(pts, ox, oy)}"/>`;
  for (const [id, pts] of pat) out += `<path fill="url(#${id})" d="${ptsPath(pts, ox, oy)}"/>`;
  return out;
}

// Sprite maps: one character per pixel.
const SKIN = dith(YEL, LRD, '▒');
const CREAM = dith(YEL, WHT, '░');
const LEGEND = {
  '.': null, K: BLK, b: BLU, g: GRN, c: CYN, r: RED, m: MAG, n: BRN, l: LGR, d: DGR,
  B: LBL, G: LGN, C: LCY, R: LRD, M: LMG, Y: YEL, W: WHT,
  p: SKIN, w: CREAM,
  o: dith(DGR, BRN, '▒'),          // coconut husk
  v: dith(LGN, GRN, '▒'),          // a green drinking coconut
  h: dith(GRN, BRN, '▒'),          // turtle shell
  f: dith(WHT, LCY, '▒'),          // spray
};
function sprite(rows) {
  const cv = canvas(Math.max(...rows.map((r) => r.length)), rows.length);
  rows.forEach((row, y) => [...row].forEach((ch, x) => {
    if (!(ch in LEGEND)) throw new Error(`sprite legend has no ${ch}`);
    if (LEGEND[ch] !== null) cv.px[y][x] = LEGEND[ch];
  }));
  return cv;
}

// ---------------------------------------------------------------------------------------------
// The island, painted once: sky, sun, clouds, sea, shallows, sand, the palm.
// ---------------------------------------------------------------------------------------------
const HORIZON = 17;
const hash = (x, y) => { let h = Math.imul(x * 374761393 + y * 668265263, 1274126177) ^ 1992; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
const sceneBack = canvas(V.w, V.h);   // behind the far visitors
const sceneFore = canvas(V.w, V.h);   // the palm, in front of them
const stamp = (cv, spr, ox, oy) => { for (let y = 0; y < spr.h; y++) for (let x = 0; x < spr.w; x++) if (spr.px[y][x] != null) setPx(cv, ox + x, oy + y, spr.px[y][x]); };
{
  const cv = sceneBack;
  for (let y = 0; y < V.h; y++) {
    for (let x = 0; x < V.w; x++) {
      let v;
      if (y < HORIZON) {
        // periwinkle overhead, paling to cyan at the horizon, in shade-character steps
        v = y < 3 ? LBL : y === 3 ? dith(LBL, LCY, '▓') : y === 4 ? dith(LBL, LCY, '▒') : y === 5 ? dith(LBL, LCY, '░') : LCY;
      } else if (y === HORIZON) {
        v = dith(LBL, BLU, '▒');
      } else {
        // deep blue far out, turning turquoise towards the island in shade-character steps,
        // with rows of short wave dashes
        const d = y - HORIZON;
        const base = d <= 3 ? BLU : d === 4 ? dith(CYN, BLU, '░') : d === 5 ? dith(CYN, BLU, '▒') : d === 6 ? dith(CYN, BLU, '▓') : CYN;
        const glint = d <= 5 ? LBL : LCY;
        v = base;
        const phase = Math.floor(hash(0, y) * 9);
        const dash = (x + phase) % 9;
        if (dash < 2 && hash(x, y) < (d <= 3 ? 0.45 : 0.6)) v = glint;
        else if (dash === 2 && hash(x + 5, y) < 0.3) v = dith(glint, typeof base === 'number' ? base : BLU, '▒');
      }
      setPx(cv, x, y, v);
    }
  }
  // the sun, high on the left, partly behind the fronds
  stamp(cv, sprite(['.YYY.', 'YWWYY', 'YWYYY', 'YYYYY', '.YYY.']), 6, 2);
  // cumulus on the horizon, flat-bottomed, grey underneath
  stamp(cv, sprite(['..WW....', '.WWWW.W.', 'WWWWWWWW', 'llllllll']), 0, 13);
  stamp(cv, sprite(['....WW..', '..WWWWWW', '.WWWWWWW', 'llllllll']), 20, 13);
  // shallows and foam around the island
  const ISL = { cx: 14, cy: 29.4, rx: 10.2, ry: 2.6 };
  const ell = (x, y, ex, ey) => ((x + 0.5 - ISL.cx) / (ISL.rx + ex)) ** 2 + ((y + 0.5 - ISL.cy) / (ISL.ry + ey)) ** 2;
  for (let y = HORIZON + 1; y < V.h; y++) {
    for (let x = 0; x < V.w; x++) {
      const e3 = ell(x, y, 4.5, 3.2), e2 = ell(x, y, 2.4, 1.7), e1 = ell(x, y, 1, 0.7), e0 = ell(x, y, 0, 0);
      if (e0 <= 1) {
        // sand: bright on top, wet and darker along the front edge
        const front = ell(x, y + 1, 0, 0) > 1;
        setPx(cv, x, y, front ? dith(YEL, BRN, '▒') : (hash(x, y) < 0.12 ? dith(WHT, YEL, '░') : YEL));
      } else if (e1 <= 1) setPx(cv, x, y, hash(x + 7, y) < 0.5 ? WHT : dith(WHT, LCY, '▒'));
      else if (e2 <= 1) setPx(cv, x, y, hash(x, y + 3) < 0.25 ? dith(WHT, LCY, '░') : LCY);
      else if (e3 <= 1) setPx(cv, x, y, hash(x + 2, y + 9) < 0.3 ? LCY : dith(LCY, CYN, '▒'));
    }
  }
  // her shadow on the sand (the sun is up on the left)
  for (let x = 8; x <= 11; x++) setPx(cv, x, 29, dith(BRN, YEL, '▒'));
  // the raft, moored off the right-hand end
  stamp(cv, sprite(['n.n.n', 'nonon', 'fffff']), 22, 31);
}
{
  const cv = sceneFore;
  // the trunk: from the base (18, 28) up to the crown (15, 9), leaning left as it rises
  const base = { x: 18.4, y: 28 }, top = { x: 15.2, y: 9 };
  for (let y = top.y; y <= base.y; y++) {
    const t = (base.y - y) / (base.y - top.y);              // 0 at the base, 1 at the crown
    const x = base.x + (top.x - base.x) * Math.pow(t, 1.5);
    const xa = Math.round(x - (t < 0.4 ? 1 : 0.5));
    const xb = t < 0.4 ? xa + 1 : xa;
    for (let xx = xa; xx <= xb; xx++) {
      const ring = y % 3 === 0;
      setPx(cv, xx, y, ring ? dith(BRN, DGR, '▒') : (xx === xa ? BRN : dith(LRD, BRN, '░')));
    }
  }
  // undergrowth at its foot and on the left of the sand
  for (const [x, y, v] of [[16, 27, GRN], [17, 27, LGN], [20, 27, GRN], [21, 27, LGN], [21, 26, GRN], [16, 28, GRN], [21, 28, GRN],
    [5, 28, GRN], [6, 28, LGN], [5, 27, LGN], [13, 28, GRN]]) setPx(cv, x, y, v);
  // the crown, drawn by hand as spines (light green on top) with a feathered dark fringe below
  const C = { x: 15, y: 8 };                      // where the trunk meets the crown
  const FRONDS = [
    [[-1, -1], [-2, -2], [-3, -3], [-4, -3], [-5, -3], [-6, -3], [-7, -2], [-8, -2], [-9, -1], [-10, 0], [-11, 1]],   // up and over, left
    [[1, -1], [2, -2], [3, -3], [4, -3], [5, -3], [6, -3], [7, -2], [8, -2], [9, -1], [10, 0], [11, 1]],               // up and over, right
    [[-1, 0], [-2, 0], [-3, 0], [-4, 0], [-5, 1], [-6, 1], [-7, 2], [-8, 3], [-9, 4], [-9, 5]],                      // out and down, left
    [[1, 0], [2, 0], [3, 0], [4, 1], [5, 1], [6, 2], [7, 3], [8, 4], [8, 5]],                                       // out and down, right
    [[0, -1], [0, -2], [1, -3], [1, -4], [2, -5]],                                                                  // straight up
    [[-1, 1], [-2, 2], [-2, 3], [-3, 4]],                                                                           // hanging, left
    [[1, 1], [2, 2], [3, 3], [3, 4]],                                                                               // hanging, right
  ];
  for (const fr of FRONDS) {
    fr.forEach(([dx, dy], i) => {
      const x = C.x + dx, y = C.y + dy;
      if (i > 0 && i < fr.length - 1) {
        setPx(cv, x, y + 1, GRN);
        if (i % 2 === 0 && i > 1) setPx(cv, x, y + 2, dith(GRN, null, '▒'));
      }
    });
  }
  for (const fr of FRONDS) for (const [dx, dy] of fr) setPx(cv, C.x + dx, C.y + dy, LGN);
  setPx(cv, C.x, C.y, GRN);
  for (const [x, y] of [[-1, 1], [0, 1], [1, 1], [0, 2]]) setPx(cv, C.x + x, C.y + y, dith(BRN, GRN, '▒'));
}

// The blob the illustration lives in: a rounded panel whose edge is a little ragged and
// dissolves into the black through ░ and ▒, the way spot art sits on a menu screen.
const inside = Array.from({ length: V.h }, (_, y) => Array.from({ length: V.w }, (_, x) => {
  const nx = (x + 0.5 - V.w / 2) / (V.w / 2), ny = (y + 0.5 - V.h / 2) / (V.h / 2);
  return Math.abs(nx) ** 3.4 + Math.abs(ny) ** 3.4 <= 1 + (hash(x + 31, y + 17) - 0.5) * 0.35;
}));
const depth = Array.from({ length: V.h }, () => new Array(V.w).fill(0));
for (let y = 0; y < V.h; y++) for (let x = 0; x < V.w; x++) if (inside[y][x]) depth[y][x] = 99;
for (let pass = 1; pass <= 3; pass++) {
  for (let y = 0; y < V.h; y++) for (let x = 0; x < V.w; x++) {
    if (depth[y][x] !== 99) continue;
    const nb = [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]].map(([a, b]) => (a < 0 || b < 0 || a >= V.w || b >= V.h ? 0 : depth[b][a]));
    if (nb.some((d) => d === pass - 1)) depth[y][x] = pass;
  }
}
const dominant = (v) => (typeof v === 'number' ? v : v.shade === '▓' || v.bg == null ? v.fg : v.bg);
function vignette(cv) {
  const out = canvas(cv.w, cv.h);
  for (let y = 0; y < cv.h; y++) for (let x = 0; x < cv.w; x++) {
    const v = cv.px[y][x], d = depth[y][x];
    if (v == null || d === 0) continue;
    out.px[y][x] = d === 1 ? dith(dominant(v), null, '░') : d === 2 ? dith(dominant(v), null, '▒') : v;
  }
  return out;
}
const maskPts = (min) => { const p = []; for (let y = 0; y < V.h; y++) for (let x = 0; x < V.w; x++) if (depth[y][x] >= min) p.push([x, y]); return p; };

// ---------------------------------------------------------------------------------------------
// Her, and the callers. She is small and simple: brown hair, cream headphones, coral tank top,
// cream shorts, bare feet. Front view, 5 x 11 pixels.
// ---------------------------------------------------------------------------------------------
const HER = { x: 6, y: 18 };
const HER_UP = sprite([
  '.nwn.',
  'wnnnw',
  'wpppw',
  '.ppp.',
  '..p..',
  'RRRRR',
  'pRRRp',
  'pRRRp',
  '.www.',
  '.p.p.',
  '.p.p.',
]);
const HER_DOWN = sprite([
  '.....',
  '.nwn.',
  'wnnnw',
  'wpppw',
  '.ppp.',
  'RRRRR',
  'pRRRp',
  'pRRRp',
  '.www.',
  '.p.p.',
  '.p.p.',
]);
const HER_BUSY = sprite([
  '.nwn.',
  'wnnnw',
  'wpppw',
  'ppvv.',
  '.pvv.',
  'RRRRR',
  '.RRR.',
  '.RRR.',
  '.www.',
  '.p.p.',
  '.p.p.',
]);

// Visitors. Each has a sprite (or two frames that swap on the half beat), a layer (far ones
// pass behind the palm), and a pose per step of its bar: [x, y] of the sprite's top-left, or
// null for "not on screen at this step". A visitor can be several actors that take turns.
const OFF = null;
const CAT = ['.l.l...', '.lll..l', '.Wll.l.', '.llldl.'];   // grey tabby, white chest, tail up
const CRATE = ['nnnnnnn', 'ndnndnn', 'nnnnnnn'];
const VISITORS = [
  { // OLD SHELL: a sea turtle crawls out of the shallows and settles beside her
    far: false,
    frames: [sprite(['.G..G.', '.hhhh.', 'GhYhYh', '.hhhh.', '.G..G.']), sprite(['G...G.', '.hhhh.', 'GhYhYh', '.hhhh.', 'G...G.'])],
    poses: [[16, 32], [14, 30], [12, 28], [11, 26]],
  },
  { // CRATE ESCAPE: a grey tabby with a white chest drifts in on a crate, then takes the palm
    actors: [
      { far: false, frames: [sprite([...CAT, 'nnnnnnn', 'ndnndnn', 'fnnnnnf']), sprite([...CAT, 'nnnnnnn', 'ndnndnn', '.fnnnf.'])],
        poses: [[28, 21], [25, 22], [22, 23], [20, 23], OFF, OFF] },
      { far: false, frames: [sprite(CRATE)], poses: [OFF, OFF, OFF, OFF, [20, 27], [20, 27]] },
      { far: false, frames: [sprite(CAT)], poses: [OFF, OFF, OFF, OFF, [17, 15], [12, 4]] },
    ],
  },
  { // LAST MILE: a delivery drone lowers a parcel (another pair of headphones)
    far: false,
    frames: [sprite(['ll...ll', '.ddldd.', '..lll..', '...d...', '..nYn..', '..nnn..']),
      sprite(['.l...l.', '.ddldd.', '..lll..', '...d...', '..nYn..', '..nnn..'])],
    poses: [[11, -1], [11, 6], [11, 14], [11, 21]],
  },
  { // LO-FIN: a shark surfaces in headphones and nods on the beat
    far: true,
    frames: [sprite(['...www...', '..w...w..', '.llllRRl.', 'lKlllRRll', 'lWWWlllll', 'fffffffff'])],
    poses: [[23, 21], [20, 22], [19, 21], [19, 22]],
  },
  { // SAY CHEESE: a tour boat pulls up; phones come out
    far: true,
    frames: [sprite(['.YlY.W...', '.WbWbWb..', 'WWWWWWWWW', '.RRRRRRR.', 'ff..fff..']),
      sprite(['.pl.p....', '.WbWbWb..', 'WWWWWWWWW', '.RRRRRRR.', '.ff..fff.'])],
    poses: [[25, 19], [22, 19], [19, 19], [19, 19]],
  },
  { // FOILED AGAIN: an e-foil bro carves across, shaka out
    far: true,
    frames: [sprite(['.n..', '.p.p', 'pYY.', '.YY.', '.BB.', 'p..p', 'WWWW', '..d.', 'ff..'])],
    poses: [[26, 16], [23, 17], [20, 18], [24, 17]],
  },
  { // NUT CASE: a hermit crab walks off wearing the coconut that landed on it
    far: false,
    frames: [sprite(['.oo.', 'oooo', 'R.R.']), sprite(['.oo.', 'oooo', '.R.R'])],
    poses: [[11, 26], [12, 26], [13, 26], [14, 26]],
  },
  { // GLASS HALF FULL: her bottle washes straight back to her feet
    far: false,
    frames: [sprite(['.GGG.', 'GGWGn']), sprite(['.GGG.', 'GGWGn', '.ff..'])],
    poses: [[2, 35], [3, 33], [5, 31], [7, 29]],
  },
  { // SHIPS THAT PASS: a ship crosses the horizon. She is busy with a coconut.
    far: true,
    frames: [sprite(['.....r..', '..WWWWW.', '.WbWbWbW', 'rrrrrrrr'])],
    poses: Array.from({ length: 18 }, (_, i) => [-8 + i * 2, 14]),
    rest: [19, 14],                       // the still frame: past the palm, she is sipping
  },
];

// ---------------------------------------------------------------------------------------------
// Animation
// ---------------------------------------------------------------------------------------------
const css = [];
const defs = [];
css.push(PAL.map((c, i) => `.c${i}{fill:${c}}`).join(''));
const pct = (t) => +((100 * t) / LOOP).toFixed(4);

// Visible during one n-th of a cycle: classes `${p}0..${p}${n-1}`. The base style (what shows
// when motion is reduced) is frame `rest`.
function frames(p, n, dur, rest = 0) {
  const ks = Array.from({ length: n }, (_, k) => k);
  const key = (k) => {
    const a = (100 * k) / n, b = (100 * (k + 1)) / n;
    const parts = [`0%{opacity:${k === 0 ? 1 : 0}}`];
    if (k > 0) parts.push(`${+a.toFixed(4)}%{opacity:1}`);
    if (k < n - 1) parts.push(`${+b.toFixed(4)}%{opacity:0}`);
    parts.push(`100%{opacity:${k === n - 1 ? 1 : 0}}`);
    return `@keyframes ${p}${k}{${parts.join('')}}`;
  };
  css.push(ks.map(key).join(''));
  css.push(`${ks.filter((k) => k !== rest).map((k) => `.${p}${k}`).join(',')}{opacity:0}`);
  css.push(ks.map((k) => `.${p}${k}{animation:${p}${k} ${s(dur)} steps(1,end) infinite}`).join(''));
}
frames('k', N, LOOP, HERO);              // which caller's bar it is
frames('h', 2, BEAT, 0);                 // half beats: nod down, nod up
frames('q', 2, 2 * BEAT, 0);             // alternate beats (the notes)
frames('b', 4, BAR, 0);                  // the beat meter
frames('u', 3, LOOP, 2);                 // rumours, three bars each
// her idle: every bar but the ship's
css.push(`@keyframes idle{0%{opacity:1}${pct(HERO * BAR)}%{opacity:0}100%{opacity:0}}.idle{opacity:0;animation:idle ${s(LOOP)} steps(1,end) infinite}`);
// the prompt cursor, on the beat
css.push(`@keyframes cur{0%{opacity:1}50%{opacity:0}100%{opacity:0}}.cur{animation:cur ${s(BEAT)} steps(1,end) infinite}`);

// Movement: one transform per pose across the visitor's bar, in whole pixels (stepped, like
// the project's own motion).
function moveKeys(name, i, poses, rest) {
  const t0 = i * BAR, dt = BAR / poses.length;
  const tr = (p) => { const [x, y] = p || [-60, -60]; return `transform:translate(${x * PX}px,${y * PX}px)`; };
  const kf = [`0%{${tr(poses[0])}}`];
  poses.forEach((p, j) => kf.push(`${pct(t0 + j * dt)}%{${tr(p)}}`));
  kf.push(`100%{${tr(poses[poses.length - 1])}}`);
  const restPose = rest || poses[Math.floor(poses.length / 2)] || poses.find(Boolean);
  css.push(`@keyframes ${name}{${kf.join('')}}.${name}{${tr(restPose)};animation:${name} ${s(LOOP)} steps(1,end) infinite}`);
}

// ---------------------------------------------------------------------------------------------
// Assemble the layers
// ---------------------------------------------------------------------------------------------
const layers = [];

// The logo.
defs.push(`<path id="logo" d="${logoPath}"/>`, rampPattern('ramp', RAMP));
layers.push(`<g transform="translate(${LOGO.x} ${LOGO.y})">`
  + `<use href="#logo" x="${LP}" y="${LP}" fill="url(#${patId(DGR, '▒')})"/>`
  + `<use href="#logo" fill="#000"/><use href="#logo" fill="url(#ramp)"/></g>`);

// The lightbar: one inverse copy of each caller row, shown during that caller's bar.
CALLERS.forEach((c, i) => {
  const r = callerRow(i);
  layers.push(`<g class="k${i}"><rect class="c${CYN}" x="${1 * CW}" y="${r * CH}" width="${(TABLE.end - 1) * CW}" height="${CH}"/>`
    + `<g class="c${BLK}">${uses(r, TABLE.num, String(i + 1).padStart(2, '0'))}${uses(r, TABLE.node, c.node)}${uses(r, TABLE.tier, c.tier)}${uses(r, TABLE.note, c.note)}</g>`
    + `<g class="c${WHT}">${uses(r, TABLE.handle, c.handle)}</g>`
    + `<g class="c${YEL}">${uses(r, 1, '►')}</g></g>`);
});

// The beat meter.
layers.push(`<g class="c${YEL}">${[0, 1, 2, 3].map((k) => `<g class="b${k}">${uses(BEATM.r, BEATM.c + 2 * k, '■')}</g>`).join('')}</g>`);
// The rumours.
layers.push(`<g class="c${LGR}">${RUMOURS.map((t, k) => `<g class="u${k}">${uses(R.rumour, RUMOUR_C, spaced(t))}</g>`).join('')}</g>`);
// The cursor.
layers.push(`<g class="cur c${LCY}">${uses(CURSOR.r, CURSOR.c, '█')}</g>`);

// The illustration.
{
  const ox = VX, oy = VY;
  defs.push(`<clipPath id="vclip"><path d="${ptsPath(maskPts(3), ox, oy)}"/></clipPath>`);
  let v = `<path fill="#000" d="${ptsPath(maskPts(1), ox, oy)}"/>`;
  v += emitPixels(vignette(sceneBack), ox, oy);
  const visitor = (vis, i, far) => {
    const actors = (vis.actors || [vis]).map((a, j) => [a, j]).filter(([a]) => !!a.far === far);
    if (!actors.length) return '';
    const parts = actors.map(([a, j]) => {
      const name = vis.actors ? `m${i}x${j}` : `m${i}`;
      moveKeys(name, i, a.poses, a.rest);
      const body = a.frames.length === 1 ? emitPixels(a.frames[0], ox, oy)
        : a.frames.map((f, k) => `<g class="h${k}">${emitPixels(f, ox, oy)}</g>`).join('');
      return `<g class="${name}">${body}</g>`;
    });
    return `<g class="k${i}">${parts.join('')}</g>`;
  };
  v += `<g clip-path="url(#vclip)">${VISITORS.map((vis, i) => visitor(vis, i, true)).join('')}</g>`;
  v += emitPixels(vignette(sceneFore), ox, oy);
  const hx = ox + HER.x * PX, hy = oy + HER.y * PX;
  v += `<g class="idle"><g class="h0">${emitPixels(HER_DOWN, hx, hy)}</g><g class="h1">${emitPixels(HER_UP, hx, hy)}</g></g>`;
  v += `<g class="k${HERO}">${emitPixels(HER_BUSY, hx, hy)}</g>`;
  v += `<g clip-path="url(#vclip)">${VISITORS.map((vis, i) => visitor(vis, i, false)).join('')}</g>`;
  // notes over her head, swapping sides on the beat (not while she is busy)
  const nr = V.r + Math.floor(HER.y / 2) - 1, nc = V.c + HER.x;
  v += `<g class="idle c${YEL}"><g class="q0">${uses(nr, nc - 1, '♪')}</g><g class="q1">${uses(nr - 1, nc + 5, '♪')}</g></g>`;
  layers.push(v);
}

css.push(`@media (prefers-reduced-motion:reduce){*{animation:none!important}}`);

// ---------------------------------------------------------------------------------------------
// Emit the static text layer
// ---------------------------------------------------------------------------------------------
const RUNNABLE = new Set(['─', '═', '▀', '▄', '█']);
const staticUses = new Map();
const staticRuns = new Map();
for (let r = 0; r < ROWS; r++) {
  for (let c = 0; c < COLS;) {
    const cell = grid[r][c];
    if (!cell) { c++; continue; }
    if (RUNNABLE.has(cell.ch)) {
      let n = 1;
      while (c + n < COLS && grid[r][c + n] && grid[r][c + n].ch === cell.ch && grid[r][c + n].fg === cell.fg) n++;
      const g = FONT.get(cell.ch);
      const d = bitmapPath(g.map((v) => (x) => (v >> (7 - (x % 8))) & 1), 8 * n, 1, 1, c * CW, r * CH);
      staticRuns.set(cell.fg, (staticRuns.get(cell.fg) || '') + d);
      c += n;
    } else {
      staticUses.set(cell.fg, (staticUses.get(cell.fg) || '') + `<use href="#${gid(cell.ch)}" x="${c * CW}" y="${r * CH}"/>`);
      c++;
    }
  }
}
let staticLayer = '';
for (const { r, c, n, color } of bgRuns) staticLayer += `<rect class="c${color}" x="${c * CW}" y="${r * CH}" width="${n * CW}" height="${CH}"/>`;
for (const [fg, d] of staticRuns) staticLayer += `<path class="c${fg}" d="${d}"/>`;
for (const [fg, u] of staticUses) staticLayer += `<g class="c${fg}">${u}</g>`;

const glyphDefs = [...glyphIds].map(([ch, id]) => `<path id="${id}" d="${glyphPath(FONT.get(ch))}"/>`).join('');

const TITLE = 'CASTAWAY: last callers on the Palm Reader BBS';
const DESC = 'A 1990s bulletin-board data screen for Castaway, a ten-hour lo-fi island video in which almost nothing happens. '
  + 'At top left, CASTAWAY in block letters shaded yellow to green to cyan to white; at top right a stats block: time day, night never, '
  + `run 10:00:00, seed 1992, ${FACTS.activities} activities, ${FACTS.lanes} lanes, 80 bpm in F major, a 3-second bar with a beat meter, ${FACTS.sounds} sound files and 0 samples, `
  + `busy ${FACTS.busy}% and idle ${100 - FACTS.busy}% of the default run, and a ratio of 1 bottle out, 2 in. `
  + 'Below, LAST CALLERS in a ragged grey frame lists the island\'s visitors, and a cyan lightbar steps down them one bar of music at a time: '
  + 'a sea turtle, a grey tabby on a crate, a delivery drone, a shark in headphones, a tour boat, an e-foil bro, a hermit crab wearing a coconut, a bottle that washes straight back, '
  + 'and a ship that passes while she is busy. At the right a little island in half-block pixels, with one tall palm and a woman in cream headphones and a coral top, '
  + 'shows each caller as it arrives. Underneath: hotkeys for the real commands (serve, watch 127.0.0.1:8765, validate, dev reel, audio, musings), a rotating rumour line and a prompt.';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VBW} ${VBH}" width="${VBW}" height="${VBH}" shape-rendering="crispEdges" role="img" aria-labelledby="t d">
<title id="t">${TITLE}</title>
<desc id="d">${DESC}</desc>
<style>${css.join('\n')}</style>
<defs>${glyphDefs}${[...patterns.values()].join('')}${defs.join('')}</defs>
<rect x=".5" y=".5" width="${VBW - 1}" height="${VBH - 1}" rx="10" fill="#000" stroke="#3a3a4a"/>
<g transform="translate(${PAD} ${PAD})">
${staticLayer}
${layers.join('\n')}
</g>
</svg>
`;

fs.mkdirSync(path.dirname(OUT_SVG), { recursive: true });
fs.writeFileSync(OUT_SVG, svg);
console.log(`wrote ${path.relative(process.cwd(), OUT_SVG)} (${(svg.length / 1024).toFixed(1)} KB, ${glyphIds.size} glyphs; facts ${FACTS.live ? "live" : "snapshot"}: ${FACTS.activities} activities, ${FACTS.sounds} sounds, ${FACTS.lanes} lanes, typical ${FACTS.typical.join("/")})`);

// ---------------------------------------------------------------------------------------------
// The README header itself: the banner, the pitch, the quick start, then the file area as a
// ruled table with links on the filenames (GitHub keeps links inside <pre>), and the extras in
// <details>. Every text block stays inside 80 columns, with no tabs and no trailing spaces.
// Links are written as they resolve from the Castaway project's root.
// ---------------------------------------------------------------------------------------------
const num = (n) => n.toLocaleString('en-US');
const kb = (bytes) => Math.round(bytes / 1024);
const bbsDate = (iso) => `${iso.slice(5, 7)}-${iso.slice(8, 10)}-${iso.slice(2, 4)}`;
const [tReg, tOcc, tRare, tSR, tChain] = FACTS.typical;
const AREA = [
  { path: 'tools/serve.py', type: 'PY', desc: ["the renderer's own server.", 'then open 127.0.0.1:8765'] },
  { path: 'web/index.html', type: 'HTML', desc: ['the renderer: live preview,', 'frame-exact MP4 export.'] },
  { path: 'tools/schedule.py', type: 'PY', desc: ['checks the schedule and', 'simulates a 10-hour run.'] },
  { path: 'activities.toml', type: 'TOML', desc: [`${FACTS.activities} activities, ${FACTS.lanes} lanes.`, 'the caller list.'] },
  { path: 'tools/make_audio.py', type: 'PY', desc: [`all ${FACTS.sounds} sound files, from`, 'maths. no samples.'] },
  { path: 'tools/render_demo.py', type: 'PY', desc: ['the old reference renderer.', '--dev: every activity, HUD.'] },
  { path: 'MUSING.md', type: 'MD', desc: ['the project log. start at', 'its "Current state".'] },
];
const COLW = { num: 2, name: 15, size: 7, date: 8, type: 4, desc: 28 };
const cells = (n, name, size, date, type, desc, link) => {
  const nameCell = link ? `<a href="${link}">${name}</a>${' '.repeat(COLW.name - len(name))}` : name.padEnd(COLW.name);
  return ` ${n.padStart(COLW.num)} │ ${nameCell} │ ${size.padStart(COLW.size)} │ ${date.padEnd(COLW.date)} │ ${type.padEnd(COLW.type)} │ ${desc}`.trimEnd();
};
const ruleRow = (mid) => ['─'.repeat(COLW.num + 2), '─'.repeat(COLW.name + 2), '─'.repeat(COLW.size + 2), '─'.repeat(COLW.date + 2),
  '─'.repeat(COLW.type + 2), '─'.repeat(COLW.desc + 1)].join(mid);
// Sizes in whole K (the snapshot's exact bytes / 1024, rounded); the footer adds up the K shown.
let totalK = 0, newest = '0000-00-00';
const areaLines = [];
AREA.forEach((f, i) => {
  const [size, date] = FACTS.files[f.path];
  totalK += kb(size);
  if (date > newest) newest = date;
  const name = path.posix.basename(f.path).toUpperCase();
  f.desc.forEach((d, k) => {
    if (len(d) > COLW.desc) throw new Error(`file description too long: ${d}`);
    areaLines.push(k === 0 ? cells(String(i + 1).padStart(2, '0'), name, `${num(kb(size))}K`, bbsDate(date), f.type, d, f.path) : cells('', '', '', '', '', d));
  });
});
const FILE_AREA = [
  ' FiLE aReA #1 · ThE iSLaND · one area. there is only the one.',
  '═'.repeat(80),
  ` ${'##'.padStart(COLW.num)} │ ${'FILENAME.EXT'.padEnd(COLW.name)} │ ${'SIZE'.padStart(COLW.size)} │ ${'DATE'.padEnd(COLW.date)} │ ${'TYPE'.padEnd(COLW.type)} │ DESCRIPTION`,
  ruleRow('┼'),
  ...areaLines,
  ruleRow('┴'),
  ` ${AREA.length} files · ${num(totalK)}K · as of ${bbsDate(FACTS.asOf)} · ${FACTS.sounds} sound files · 0 samples`,
  ' compression: none. it is an island.',
  '═'.repeat(80),
  ' [V]iew [D]ownload [N]ext area: there is no next area. the filenames are links.',
];

// FILE_ID.DIZ: the board's card for the whole thing, 45 columns by 10 lines.
const dizLine = (t = '') => `│ ${t.padEnd(41)} │`;
const DIZ = [
  `┌${'─'.repeat(43)}┐`,
  dizLine('C A S T A W A Y   (working title)'),
  dizLine('a ten-hour lo-fi island video in which'),
  dizLine('almost nothing happens, on purpose'),
  dizLine('─'.repeat(41)),
  dizLine(`${FACTS.activities} activities · 4 timers · ${FACTS.lanes} lanes`),
  dizLine(`${FACTS.sounds} sound files, all made from code`),
  dizLine('80 bpm · F major · 3 s bars · seed 1992'),
  dizLine('1080p30 · 10:00:00 · always day, no night'),
  `└${'─'.repeat(43)}┘`,
];

const ONELINERS = [
  ['OLD SHELL', 'nice spot. dozed off. might be back in an hour.'],
  ['CRATE ESCAPE', 'the top of the palm is mine now. crate on standby.'],
  ['LAST MILE', 'parcel left on the sand. no signature needed.'],
  ['LO-FIN', 'same beat. respect.'],
  ['SAY CHEESE', 'lovely view. no room on board, sorry.'],
  ['FOILED AGAIN', 'shaka. (carves off.)'],
  ['NUT CASE', 'found a hat. it fits.'],
  ['GLASS HALF FULL', 'returned to sender. immediately.'],
  ['SHIPS THAT PASS', 'passed. nobody looked up. lovely island.'],
  ['LOW TIDE', 'sysop here. the kumara is growing. that is the news.'],
].map(([who, said]) => ` ${who} ${'.'.repeat(18 - len(who))} ${said}`);

const BULLETINS = [
  ' BULLETIN 1 · HOW OFTEN THINGS CALL (activities.toml, [tiers])',
  '',
  '   tier         every              typical in a 10-hour run',
  `   regular      2 to 5 minutes     ~${tReg}`,
  `   occasional   12 to 25 minutes   ~${tOcc}`,
  `   rare         30 to 60 minutes   ~${tRare}`,
  `   super rare   3 to 6 hours       ~${tSR}  (never more than 3)`,
  `   chained      after another one  ~${tChain}`,
  `   (medians of 200 simulated runs. ${FACTS.timed} activities sit on the four`,
  `   timers; the other ${FACTS.chained} only ever follow one. in the default run`,
  `   she is busy ${FACTS.busy}% of the time.)`,
  '   every start snaps to the next bar of the theme: 3.0 s at 80 BPM.',
  '',
  ` BULLETIN 2 · THE NODES (the file calls them lanes: ${FACTS.lanes} of them)`,
  '',
  '   castaway   her. one thing at a time.',
  '   cat        the grey tabby, for the whole of its visit',
  '   turtle     the sea turtle',
  '   sea_sky    the ship, the drone, the boats, the shark',
  '   shore      the tide, which takes the sandcastle',
  '   garden     the kumara, which grows on its own once planted',
  '   lanes overlap. that is how a ship gets past mid-coconut.',
  '',
  ' BULLETIN 3 · HOUSE RULES',
  '',
  '   1. it is always daytime. the sysop has checked twice.',
  '   2. hard cuts and stepped movement, by default. it suits the board.',
  '   3. the bottle washes straight back. a different one replies, later.',
  '   4. one bar of signal, at the top of the palm. do not ask.',
  '   5. she could leave any time. very rarely she walks out over the',
  '      water and comes back with an iced coffee.',
  '   6. the hammock needs a second tree. there is one tree. (the raft.)',
  '   7. nobody offers a lift.',
  '',
  ' BULLETIN 4 · ALSO ON THE BOARD (between callers)',
  '',
  '   coconut sipping, quiet fishing, jogging laps, a sandcastle the tide',
  '   takes, waving for rescue, fire by friction, a lookout up the palm,',
  '   spear fishing, and a kumara she plants that grows over the video.',
  '   scene life: shore waves and drifting cloud shadows are built; birds,',
  '   planes with vapour trails, whales, dolphins, sailboats, sandpipers,',
  '   a gecko and a rain shower are planned.',
  '',
  ' SMALL PRINT',
  '',
  '   unofficial. inspired by the small-island routines of the 1992',
  '   screensaver Johnny Castaway, which belongs to its owners; this',
  '   board is not affiliated with them. every sound here is made from',
  '   code. status: in development. no video is published yet, and',
  '   nobody has listened to the synthesized audio yet, either.',
];

for (const [label, block] of [['file area', FILE_AREA], ['diz', DIZ], ['oneliners', ONELINERS], ['bulletins', BULLETINS]]) {
  for (const line of block) {
    const visible = line.replace(/<[^>]+>/g, '');
    if (len(visible) > 80) throw new Error(`${label}: line over 80 columns (${len(visible)}): ${visible}`);
    if (/\s$/.test(line) || /\t/.test(line)) throw new Error(`${label}: trailing space or tab: ${visible}`);
  }
}

const ALT = 'CASTAWAY, drawn as the data screens of a 1990s bulletin board, the Palm Reader BBS. '
  + 'Top left, CASTAWAY in block letters shaded yellow, green, cyan and white. Top right, a stats block: '
  + `time day, night never, run 10:00:00, seed 1992, ${FACTS.activities} activities, ${FACTS.lanes} lanes, 80 bpm, F major, `
  + `a 3-second bar with a beat meter, ${FACTS.sounds} sound files, 0 samples, busy ${FACTS.busy}%, idle ${100 - FACTS.busy}%, `
  + 'and a ratio of 1 bottle out, 2 in. '
  + 'Below, a LAST CALLERS list in a ragged grey frame, with a cyan lightbar stepping down it one bar of music at a time: '
  + 'a sea turtle that dozes off with her, a grey tabby that arrives on a crate and takes the top of the palm, '
  + 'a delivery drone whose parcel is more headphones, a shark in headphones, '
  + 'a tour boat taking selfies, an e-foil bro, a hermit crab wearing a coconut, a bottle that washes straight back, '
  + 'and a ship that passes while she is busy. On the right, a little half-block island with one tall palm and a woman in cream headphones '
  + 'and a coral top shows each caller as it arrives; when the ship sails by she is drinking from a coconut. '
  + 'Underneath, hotkeys for the real commands, a rumour line and a prompt.';

const FENCE = '```';
const md = `<!-- Header 02-bbs-stats_opus_5.5 for Castaway. Generated by src/02-bbs-stats_opus_5.5.mjs: edit that, not this. -->

<p align="center">
  <img src="assets/${SLUG}.svg" width="832" alt="${ALT}">
</p>

<p align="center">
  <b>CASTAWAY</b> (working title) · now calling the PALM READER BBS · sysop: Low Tide · node 1, up the palm<br>
  <sub>an unofficial lo-fi remake, inspired by the 1992 screensaver Johnny Castaway · in development · no video published yet</sub>
</p>

**Castaway** is a ten-hour lo-fi video for YouTube in which almost nothing happens, on purpose. One young woman, one tiny island, one tall palm, a raft and a great deal of time. Mostly she idles and nods along to her headphones. Every so often, on the next bar of the music, someone calls: a sea turtle, a stray cat on a crate, a delivery drone whose parcel is another pair of headphones, a shark in headphones nodding to the same beat. A ship sails past while she is busy with a coconut. She never sees it. Headphones.

The callers are booked in [activities.toml](activities.toml): ${FACTS.activities} activities, each with its own beats and length, on timers from every 2 to 5 minutes to once every 3 to 6 hours, or chained after another one. A typical ten-hour run has about ${tReg} regular, ${tOcc} occasional, ${tRare} rare and ${tSR} super-rare events, plus about ${tChain} chained follow-ups. Lanes let them overlap, which is how the ship gets past mid-coconut. In the default run she is busy ${FACTS.busy}% of the time; the rest is very calm waiting, always in daylight. This board has no night.

Every sound is synthesized from code by [tools/make_audio.py](tools/make_audio.py): ${FACTS.sounds} sound files, no samples, no stock loops, no recordings. The theme is a seamless 60-second loop at 80 BPM in F major, 20 bars of exactly 3 seconds, with electric piano, a kalimba lead, soft drums and vinyl surface noise. Nobody has listened to it yet. The sysop is waiting for a quiet moment. There are a lot of those.

${FENCE}sh
python tools/serve.py              # then open http://127.0.0.1:8765/
python tools/schedule.py           # check it, simulate a 10-hour run
python tools/render_demo.py --dev  # dev reel: every activity, with a HUD
${FENCE}

The page previews live and exports a YouTube-ready 1080p30 MP4, encoded frame-exact in the browser (WebCodecs, 68 to 78 frames a second in Chrome); the server mixes in the sound. Plain ES modules, no build step, no npm packages. Same seed, same schedule: the default run is 10:00:00 on seed 1992.

<pre>
${FILE_AREA.join('\n')}
</pre>

<details>
<summary><b>FILE_ID.DIZ</b> · the whole board on one 45 x 10 card</summary>

${FENCE}text
${DIZ.join('\n')}
${FENCE}

</details>

<details>
<summary><b>ONELINERS</b> · the wall, as left by today's callers</summary>

${FENCE}text
${ONELINERS.join('\n')}
${FENCE}

</details>

<details>
<summary><b>BULLETINS</b> · the schedule, the nodes, the house rules, the small print</summary>

${FENCE}text
${BULLETINS.join('\n')}
${FENCE}

</details>
`;
if (md.includes('—')) throw new Error('house style: no em dashes');
fs.writeFileSync(OUT_MD, md);
console.log(`wrote ${path.relative(process.cwd(), OUT_MD)} (${FILE_AREA.length} file-area lines, ${num(totalK)}K listed)`);
