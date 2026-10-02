#!/usr/bin/env node
// CASTAWAY as a message in a bottle that has to be decrypted before anyone can read it.
//
// Style: "Decrypt reveal" (catalogue hack-15). The trope: a screen of unreadable symbols that
// turns, cell by cell in random order, into the real text; unresolved cells stay a dim
// grey-blue, resolved ones snap to a bright accent, and the readable screen then holds. The
// effect comes from early-90s film computer screens and was recreated as an open-source
// terminal tool. Nothing is copied from either: no title, prop, wording or code. The bottle,
// the decoder ("kelpcrypt") and every line on the screen are invented for this project.
//
// Regenerate:  node examples/castaway/src/86-decrypt-reveal_opus_5.5.mjs
// Writes:      assets/86-decrypt-reveal_opus_5.5.svg and 86-decrypt-reveal_opus_5.5.md
//
// Plain Node, no dependencies, deterministic (seeded PRNG, no clock). The screen is an 80 x 25
// grid of 7 x 13 cells. Every glyph is a <use> of a path from the bitmap face below (never
// <text>). How the decrypt is built, cheaply:
//   * the noise is not one glyph per cell: it is rows of 16-glyph "strips" (symbols) laid at
//     random offsets, three different frames that churn while the reveal runs;
//   * each cell is assigned one of 20 reveal buckets (a sixteenth note each, 5 beats at 80 BPM);
//     at its moment a background-coloured cover hides that cell's noise and its true glyph
//     appears, white for a sixteenth, then its own colour (in the picture the cover is the
//     cell's sky or sea colour, so the daylight arrives a cell at a time);
//   * the noise frames themselves change only on eighth notes, under 3 times a second;
//   * the logo cells carry a brighter, denser noise, so CASTAWAY is legible from the first frame.
// One-shot: 2 beats of scramble, 5 beats of reveal, then the plaintext holds for good (only the
// sea, two gulls, her nodding head and a beat light keep moving). With no animation, or with
// prefers-reduced-motion, the finished plaintext shows at once.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '86-decrypt-reveal_opus_5.5';
const OUT_SVG = path.join(HERE, '..', 'assets', `${SLUG}.svg`);
const OUT_MD = path.join(HERE, '..', `${SLUG}.md`);
const ARGV_OUT = process.argv[2]; // optional: write the SVG somewhere else (for previews)

// ---------------------------------------------------------------------------------------------
// Seeded PRNG
// ---------------------------------------------------------------------------------------------
function mulberry32(a) {
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = mulberry32(1992);
const ri = (n) => Math.floor(rnd() * n);
const pick = (arr) => arr[ri(arr.length)];

// ---------------------------------------------------------------------------------------------
// Geometry and timeline
// ---------------------------------------------------------------------------------------------
const COLS = 80, ROWS = 25, CW = 7, CH = 13, PAD = 12;
const VBW = COLS * CW + PAD * 2, VBH = ROWS * CH + PAD * 2;
const X = (c) => PAD + c * CW;
const Y = (r) => PAD + r * CH;

const BEAT = 0.75; // 80 BPM
const SUB = BEAT / 4; // a sixteenth: one reveal bucket
const T0 = 2 * BEAT; // two beats of full scramble ("press any key")
const BEATS = 5; // five beats of reveal
const NB = BEATS * 4; // 20 buckets
const tb = (b) => T0 + SUB * (b + 1); // when bucket b resolves
const TEND = T0 + BEATS * BEAT; // 5.25 s: plaintext
const f3 = (n) => +n.toFixed(4);

// ---------------------------------------------------------------------------------------------
// Palette
// ---------------------------------------------------------------------------------------------
const P = {
  bg: '#0A0E14', edge: '#1D2735', frame: '#2C4767', frameHi: '#4F78A6',
  noise: '#3F4A5C', wmark: '#B4D4FA', tint: '#29527F',
  hi: '#EEF6FF', blue: '#6CB6FF', label: '#7F9DC4', dim: '#5D7593', num: '#FFFFFF',
  shadow: '#1F3A5E',
  // the attachment: one view of the island, in daylight. Every picture cell carries its own
  // background colour (a text-mode attribute), banded: four rows of sky, five of sea.
  sun: '#FFD84D', sunHi: '#FFF4C4', frond: '#46C46E', frondDk: '#1D8A4C', nut: '#6E4024',
  trunk: '#B86F3C', trunkDk: '#7A4526', sand: '#FBE8BC', sandDk: '#E6C084', foam: '#F4FCFF', sea: '#DDF5FF', seaDk: '#2E95D3', raft: '#C9773F', crab: '#E8452C', raftDk: '#8E4E2A',
  cream: '#FFF3DC', glass: '#8EE8C6', hair: '#6A3F22', coral: '#FF6B57', skin: '#F2C29A', bird: '#2B4560',
};
const SKY = ['#58ACE6', '#6CBAED', '#84C7F2', '#A3D8F7']; // top of the sky down to the horizon
const SEA = ['#2A85CB', '#2F94D5', '#36A4DF', '#3FB3E7', '#4BC1EE']; // far water to the shallows
const COLOR = {
  H: P.hi, T: P.blue, L: P.label, D: P.dim, N: P.num,
  y: P.sun, Y: P.sunHi, g: P.frond, G: P.frondDk, n: P.nut, t: P.trunk, s: P.sand,
  w: P.sea, W: P.seaDk, r: P.raft, R: P.raftDk, x: P.crab, S: P.sandDk, F: P.foam, u: P.trunkDk, c: P.cream, h: P.hair, o: P.coral, k: P.skin, b: P.bird,
};

// ---------------------------------------------------------------------------------------------
// The face: an original 5 x 7 terminal face (2 descender rows) in a 7 x 13 cell. Glyph pixels
// sit at x 1..5, y 2..10. Box drawing and shades are built over the whole cell.
// ---------------------------------------------------------------------------------------------
const BOLD = 0.3; // every horizontal run is drawn this much wider: a touch of terminal bold
const F = {
  A: '.###. #...# #...# ##### #...# #...# #...#', B: '####. #...# #...# ####. #...# #...# ####.',
  C: '.###. #...# #.... #.... #.... #...# .###.', D: '###.. #..#. #...# #...# #...# #..#. ###..',
  E: '##### #.... #.... ####. #.... #.... #####', F: '##### #.... #.... ####. #.... #.... #....',
  G: '.###. #...# #.... #.### #...# #...# .####', H: '#...# #...# #...# ##### #...# #...# #...#',
  I: '.###. ..#.. ..#.. ..#.. ..#.. ..#.. .###.', J: '..### ...#. ...#. ...#. ...#. #..#. .##..',
  K: '#...# #..#. #.#.. ##... #.#.. #..#. #...#', L: '#.... #.... #.... #.... #.... #.... #####',
  M: '#...# ##.## #.#.# #.#.# #...# #...# #...#', N: '#...# #...# ##..# #.#.# #..## #...# #...#',
  O: '.###. #...# #...# #...# #...# #...# .###.', P: '####. #...# #...# ####. #.... #.... #....',
  Q: '.###. #...# #...# #...# #.#.# #..#. .##.#', R: '####. #...# #...# ####. #.#.. #..#. #...#',
  S: '.#### #.... #.... .###. ....# ....# ####.', T: '##### ..#.. ..#.. ..#.. ..#.. ..#.. ..#..',
  U: '#...# #...# #...# #...# #...# #...# .###.', V: '#...# #...# #...# #...# #...# .#.#. ..#..',
  W: '#...# #...# #...# #.#.# #.#.# #.#.# .#.#.', X: '#...# #...# .#.#. ..#.. .#.#. #...# #...#',
  Y: '#...# #...# .#.#. ..#.. ..#.. ..#.. ..#..', Z: '##### ....# ...#. ..#.. .#... #.... #####',
  a: '..... ..... .###. ....# .#### #...# .####', b: '#.... #.... ####. #...# #...# #...# ####.',
  c: '..... ..... .###. #.... #.... #...# .###.', d: '....# ....# .#### #...# #...# #...# .####',
  e: '..... ..... .###. #...# ##### #.... .###.', f: '..##. .#..# .#... ###.. .#... .#... .#...',
  g: '..... ..... .#### #...# #...# #...# .#### ....# .###.',
  h: '#.... #.... #.##. ##..# #...# #...# #...#', i: '..#.. ..... .##.. ..#.. ..#.. ..#.. .###.',
  j: '...#. ..... ..##. ...#. ...#. ...#. ...#. #..#. .##..',
  k: '#.... #.... #..#. #.#.. ##... #.#.. #..#.', l: '.##.. ..#.. ..#.. ..#.. ..#.. ..#.. .###.',
  m: '..... ..... ##.#. #.#.# #.#.# #.#.# #...#', n: '..... ..... #.##. ##..# #...# #...# #...#',
  o: '..... ..... .###. #...# #...# #...# .###.',
  p: '..... ..... ####. #...# #...# #...# ####. #.... #....',
  q: '..... ..... .#### #...# #...# #...# .#### ....# ....#',
  r: '..... ..... #.##. ##..# #.... #.... #....', s: '..... ..... .#### #.... .###. ....# ####.',
  t: '.#... .#... ###.. .#... .#... .#..# ..##.', u: '..... ..... #...# #...# #...# #..## .##.#',
  v: '..... ..... #...# #...# #...# .#.#. ..#..', w: '..... ..... #...# #...# #.#.# #.#.# .#.#.',
  x: '..... ..... #...# .#.#. ..#.. .#.#. #...#',
  y: '..... ..... #...# #...# #...# #...# .#### ....# .###.',
  z: '..... ..... ##### ...#. ..#.. .#... #####',
  0: '.###. #...# #..## #.#.# ##..# #...# .###.', 1: '..#.. .##.. ..#.. ..#.. ..#.. ..#.. .###.',
  2: '.###. #...# ....# ..##. .#... #.... #####', 3: '##### ...#. ..#.. ...#. ....# #...# .###.',
  4: '...#. ..##. .#.#. #..#. ##### ...#. ...#.', 5: '##### #.... ####. ....# ....# #...# .###.',
  6: '..##. .#... #.... ####. #...# #...# .###.', 7: '##### ....# ...#. ..#.. .#... .#... .#...',
  8: '.###. #...# #...# .###. #...# #...# .###.', 9: '.###. #...# #...# .#### ....# ...#. .##..',
  '.': '..... ..... ..... ..... ..... .##.. .##..',
  ',': '..... ..... ..... ..... ..... .##.. .##.. ..#.. .#...',
  ':': '..... .##.. .##.. ..... .##.. .##.. .....',
  ';': '..... .##.. .##.. ..... .##.. .##.. ..#.. .#...',
  '!': '..#.. ..#.. ..#.. ..#.. ..#.. ..... ..#..', '?': '.###. #...# ....# ...#. ..#.. ..... ..#..',
  "'": '..#.. ..#.. .#... ..... ..... ..... .....', '"': '.#.#. .#.#. .#.#. ..... ..... ..... .....',
  '-': '..... ..... ..... .###. ..... ..... .....', '/': '....# ....# ...#. ..#.. .#... #.... #....',
  '\\': '#.... #.... .#... ..#.. ...#. ....# ....#', '|': '..#.. ..#.. ..#.. ..#.. ..#.. ..#.. ..#.. ..#.. ..#..',
  '(': '...#. ..#.. .#... .#... .#... ..#.. ...#.', ')': '.#... ..#.. ...#. ...#. ...#. ..#.. .#...',
  '[': '.###. .#... .#... .#... .#... .#... .###.', ']': '.###. ...#. ...#. ...#. ...#. ...#. .###.',
  '{': '...## ..#.. ..#.. .#... ..#.. ..#.. ...##', '}': '##... ..#.. ..#.. ...#. ..#.. ..#.. ##...',
  '<': '...#. ..#.. .#... #.... .#... ..#.. ...#.', '>': '.#... ..#.. ...#. ....# ...#. ..#.. .#...',
  '=': '..... ..... ##### ..... ##### ..... .....', '+': '..... ..#.. ..#.. ##### ..#.. ..#.. .....',
  '*': '..... #.#.# .###. ##### .###. #.#.# .....', '#': '.#.#. .#.#. ##### .#.#. ##### .#.#. .#.#.',
  '@': '.###. #...# #.### #.#.# #.### #.... .####', '%': '##..# ##..# ...#. ..#.. .#... #..## #..##',
  '&': '.##.. #..#. #.#.. .#... #.#.# #..#. .##.#', '~': '..... ..... .#... #.#.# ...#. ..... .....',
  '^': '..#.. .#.#. #...# ..... ..... ..... .....', '$': '..#.. .#### #.#.. .###. ..#.# ####. ..#..',
  '`': '.#... ..#.. ..... ..... ..... ..... .....',
  '·': '..... ..... ..... ..#.. ..... ..... .....', '→': '..... ..#.. ...#. ##### ...#. ..#.. .....',
  '♪': '..##. ..#.# ..#.. ..#.. ###.. ###.. .....',
  '■': '..... ##### ##### ##### ##### ##### .....', '□': '..... ##### #...# #...# #...# ##### .....',
  // the picture's own characters, the way a redefined charset would do it
  '≈': '..... ..... ...#. #.#.# .#... ..... .....', // '~' half a wave later: the sea's second frame
  'ʘ': '..... .###. ##### ##### ##### .###. .....', // her head, hair up, seen from behind-ish
  'ɷ': '..... ..... .###. ##### ##### .###. .....', // a coconut
  'ƀ': '..... ..... ..... ..... ###.. ##### ###..', // a bottle, lying on the sand, neck to the right
  'v': '..... ..... #...# #...# #...# .#.#. ..#..',
};
// bird: a gull far away, two frames
F['ˇ'] = '..... ..... #...# .#.#. ..#.. ..... .....';
F['ˉ'] = '..... ..... ..... ##### ..... ..... .....';

const GLYPH = new Map(); // char -> list of [x, y, w, h] rects in cell units
for (const [ch, src] of Object.entries(F)) {
  const rows = src.split(' ');
  const px = [];
  rows.forEach((row, y) => [...row].forEach((v, x) => { if (v === '#') px.push([x + 1, y + 2]); }));
  GLYPH.set(ch, mergePixels(px, true));
}
// underscore: a full-width line, so ___ joins up in the pictures
GLYPH.set('_', [[0, 10, 7, 1]]);
// box drawing over the whole cell: arms are 0 none, 1 single, 2 double
function boxGlyph(u, d, l, r) {
  const px = new Set();
  const hl = (y, x0, x1) => { for (let x = x0; x <= x1; x++) px.add(`${x},${y}`); };
  const vl = (x, y0, y1) => { for (let y = y0; y <= y1; y++) px.add(`${x},${y}`); };
  const cx = 3, cy = 6;
  if (l === 1) hl(cy, 0, cx); if (r === 1) hl(cy, cx, 6);
  if (u === 1) vl(cx, 0, cy); if (d === 1) vl(cx, cy, 12);
  if (l === 2) { hl(cy - 1, 0, cx); hl(cy + 1, 0, cx); }
  if (r === 2) { hl(cy - 1, cx, 6); hl(cy + 1, cx, 6); }
  if (u === 2) { vl(cx - 1, 0, cy); vl(cx + 1, 0, cy); }
  if (d === 2) { vl(cx - 1, cy, 12); vl(cx + 1, cy, 12); }
  return mergePixels([...px].map((s) => s.split(',').map(Number)), false);
}
const BOX = {
  '─': [0, 0, 1, 1], '│': [1, 1, 0, 0], '┌': [0, 1, 0, 1], '┐': [0, 1, 1, 0], '└': [1, 0, 0, 1],
  '┘': [1, 0, 1, 0], '├': [1, 1, 0, 1], '┤': [1, 1, 1, 0], '┬': [0, 1, 1, 1], '┴': [1, 0, 1, 1],
  '┼': [1, 1, 1, 1], '═': [0, 0, 2, 2], '║': [2, 2, 0, 0], '╪': [1, 1, 2, 2], '╫': [2, 2, 1, 1],
  '╡': [1, 1, 2, 0], '╞': [1, 1, 0, 2], '╥': [0, 2, 1, 1], '╨': [2, 0, 1, 1],
};
for (const [ch, a] of Object.entries(BOX)) GLYPH.set(ch, boxGlyph(...a));
// shades over the whole cell
function shade(test) {
  const px = [];
  for (let y = 0; y < CH; y++) for (let x = 0; x < CW; x++) if (test(x, y)) px.push([x, y]);
  return mergePixels(px, false);
}
GLYPH.set('░', shade((x, y) => x % 2 === 0 && y % 2 === 0));
GLYPH.set('▒', shade((x, y) => (x + y) % 2 === 0));
GLYPH.set('▓', shade((x, y) => !(x % 2 === 1 && y % 2 === 0)));

// pixels -> horizontal runs -> runs merged downwards when they line up
function mergePixels(px, bold) {
  const rows = new Map();
  for (const [x, y] of px) { if (!rows.has(y)) rows.set(y, new Set()); rows.get(y).add(x); }
  const runs = [];
  for (const y of [...rows.keys()].sort((a, b) => a - b)) {
    const xs = [...rows.get(y)].sort((a, b) => a - b);
    let i = 0;
    while (i < xs.length) {
      let j = i;
      while (j + 1 < xs.length && xs[j + 1] === xs[j] + 1) j++;
      runs.push([xs[i], y, xs[j] - xs[i] + 1, 1]);
      i = j + 1;
    }
  }
  const out = [];
  for (const r of runs) {
    const above = out.find((o) => o[0] === r[0] && o[2] === r[2] && o[1] + o[3] === r[1]);
    if (above) above[3]++; else out.push([...r]);
  }
  return out.map(([x, y, w, h]) => [x, y, bold ? w + BOLD : w, h]);
}
const glyphD = (ch) => GLYPH.get(ch).map(([x, y, w, h]) => `M${x} ${y}h${f3(w)}v${h}h-${f3(w)}z`).join('');

const GID = new Map();
const gid = (ch) => {
  if (!GLYPH.has(ch)) throw new Error(`no glyph for ${JSON.stringify(ch)}`);
  if (!GID.has(ch)) GID.set(ch, `g${GID.size.toString(36)}`);
  return GID.get(ch);
};

// ---------------------------------------------------------------------------------------------
// The plaintext: what the bottle says once it is decrypted
// ---------------------------------------------------------------------------------------------
// cells[r][c] = { ch, col, fixed, logo: [top, bottom], shade: [top, bottom], fx }
const cells = Array.from({ length: ROWS }, () => Array.from({ length: COLS }, () => ({ ch: ' ', col: 'T' })));
const INNER = { c0: 1, c1: COLS - 2, r0: 1, r1: ROWS - 2 };
const inner = (r, c) => r >= INNER.r0 && r <= INNER.r1 && c >= INNER.c0 && c <= INNER.c1;

// "{K|text}" switches colour for a span; plain text uses the line's default colour
function put(r, c, src, col = 'T') {
  const re = /\{(\w)\|([^}]*)\}|([^{]+)/g;
  let m, x = c;
  while ((m = re.exec(src))) {
    const k = m[1] || col, s = m[1] ? m[2] : m[3];
    for (const ch of s) {
      if (!inner(r, x)) throw new Error(`text off the screen at row ${r}, col ${x}: ${src}`);
      cells[r][x] = { ch, col: k };
      x++;
    }
  }
  return x - c;
}
const plainLen = (src) => src.replace(/\{\w\|([^}]*)\}/g, '$1').length;
const centre = (r, src, col) => put(r, Math.floor(INNER.c0 + (INNER.c1 - INNER.c0 + 1 - plainLen(src)) / 2), src, col);

// --- the logo: CASTAWAY in block cells (full, upper and lower half blocks) -------------------
const LOGO = {
  C: ['▄██████▄', '██    ██', '██      ', '██      ', '██      ', '██    ██', '▀██████▀'],
  A: ['▄██████▄', '██    ██', '██    ██', '████████', '██    ██', '██    ██', '██    ██'],
  S: ['▄██████▄', '██    ██', '██      ', '▀██████▄', '      ██', '██    ██', '▀██████▀'],
  T: ['████████', '   ██   ', '   ██   ', '   ██   ', '   ██   ', '   ██   ', '   ██   '],
  W: ['██    ██', '██    ██', '██ ▄▄ ██', '██ ██ ██', '██ ██ ██', '██▄██▄██', '▀██▀▀██▀'],
  Y: ['██    ██', '██    ██', '▀█▄  ▄█▀', ' ▀████▀ ', '   ██   ', '   ██   ', '   ██   '],
};
const LOGO_ROW = 2, LOGO_COL = 4, LOGO_H = 7;
const half = new Map(); // "col,halfrow" -> true for letter ink (half rows from LOGO_ROW*2)
[...'CASTAWAY'].forEach((L, i) => {
  LOGO[L].forEach((line, y) => [...line].forEach((ch, x) => {
    const c = LOGO_COL + i * 9 + x, h = (LOGO_ROW + y) * 2;
    if (ch === '█' || ch === '▀') half.set(`${c},${h}`, true);
    if (ch === '█' || ch === '▄') half.set(`${c},${h + 1}`, true);
  }));
});
const ink = (c, h) => half.has(`${c},${h}`);
for (let r = LOGO_ROW; r <= LOGO_ROW + LOGO_H; r++) {
  for (let c = LOGO_COL; c <= LOGO_COL + 72; c++) {
    const lt = ink(c, r * 2), lb = ink(c, r * 2 + 1);
    const st = !lt && ink(c - 1, r * 2 - 1), sb = !lb && ink(c - 1, r * 2);
    if (lt || lb || st || sb) cells[r][c] = { ch: ' ', col: 'T', logo: [lt, lb], shade: [st, sb] };
  }
}

// --- tagline ----------------------------------------------------------------------------------
const TAG1 = 'ten hours on one very small island. almost nothing happens, on the beat.';
const TAG2 = 'a lo-fi video for YouTube: she idles, and every so often a gag lands.';
centre(10, TAG1, 'H');
centre(11, TAG2, 'T');

// --- the message header (left) ---------------------------------------------------------------
const LEFT = 2;
const lbl = (s) => `{L|${s.padEnd(8)}}`;
const MSG = [
  `${lbl('FROM')}her. 1 island, 1 palm, 1 raft`,
  `${lbl('TO')}anyone. bottle came straight back`,
  `${lbl('STATUS')}idle. nodding at 80 BPM, as planned`,
  `${lbl('EVENTS')}90+ routines, 4 timers, on the beat`,
];
const TIERS = [
  ['2-5 min', '~155', 'coconut, fishing, a jog'],
  ['12-25 min', '~30', 'turtle, crab in a coconut'],
  ['30-60 min', '~13', 'drone brings headphones'],
  ['3-6 hours', '~2', 'walks on water for coffee'],
];
const TIER_LINES = TIERS.map(([a, n, g]) => `  {D|${a.padEnd(11)}}{N|${n.padEnd(6)}}${g}`);
const SOUND = `${lbl('SOUND')}every sound synthesized from code`;
const BODY = [...MSG, ...TIER_LINES, SOUND];
const LEFT_MAX = 44;
BODY.forEach((s, i) => {
  if (plainLen(s) > LEFT_MAX) throw new Error(`left column too wide (${plainLen(s)}): ${s}`);
  put(13 + i, LEFT, s, 'T');
});

// --- the attachment: one view of the island (right) ------------------------------------------
// A small daylight window, exactly as tall as the message header beside it (rows 13 to 21).
// Every cell in it has a background colour, the way a text-mode attribute would: four bands of
// sky and five of sea, so the horizon is simply where the colour changes. Text cells (the sea's
// ripples, two gulls) are placed as strings; spaces are transparent.
const PIC_COL = 48, PIC_ROW = 13, PIC_W = 30, PIC_H = 9;
const BAND = [...SKY, ...SEA];
if (BAND.length !== PIC_H) throw new Error('one background band per picture row');
const isPic = (r, c) => r >= PIC_ROW && r < PIC_ROW + PIC_H && c >= PIC_COL && c < PIC_COL + PIC_W;
const pic = Array.from({ length: PIC_H }, () => Array(PIC_W).fill(null));
function at(x, y, s, col, fx) {
  [...s].forEach((ch, i) => {
    if (ch === ' ') return;
    if (x + i < 0 || x + i >= PIC_W || y < 0 || y >= PIC_H) throw new Error(`picture ink off the canvas: ${s} at ${x},${y}`);
    pic[y][x + i] = { ch, col, fx };
  });
}
// sky: two far-off gulls (the sun is in the bitmap below; it is always daytime)
at(9, 0, 'ˇ', 'b', 'bird'); at(26, 1, 'ˇ', 'b', 'bird');
// the sea: a few ripples far out, then the shallows in front of the island
at(3, 4, '~', 'w', 'wave'); at(22, 4, '~', 'w', 'wave'); at(27, 4, '~', 'w', 'wave');
at(6, 5, '~', 'w', 'wave'); at(25, 5, '~', 'w', 'wave');
at(1, 6, '~', 'w', 'wave'); at(28, 6, '~', 'w', 'wave');
at(0, 7, '≈~~', 'w', 'wave');
at(0, 8, '≈~~≈~~~≈~~~~≈~~~~≈~~~≈~~~~~≈~', 'w', 'wave');
const PIC_COLOR = { ...COLOR, h: P.hair, B: P.glass };
pic.forEach((row, y) => row.forEach((cell, x) => {
  if (cell) cells[PIC_ROW + y][PIC_COL + x] = { ...cell, pic: true };
}));

// The palm is drawn the way text-mode games drew their scenery: as a small bitmap, sliced into
// character cells, each slice a redefined character. It then decrypts cell by cell like the text.
const BW = PIC_W * CW, BH = PIC_H * CH;
const BCOL = [null, 't', 'u', 'n', 'G', 'g', 's', 'S', 'h', 'c', 'k', 'o', 'r', 'R', 'B', 'F', 'y', 'Y', 'x'];
const BIDX = Object.fromEntries(BCOL.map((k, i) => [k, i]));
const bmp = new Uint8Array(BW * BH);
const bfx = new Uint8Array(BW * BH); // 1 = her head (nods on the beat)
let FX = 0;
const px = (x, y, k) => { if (x >= 0 && x < BW && y >= 0 && y < BH) { bmp[y * BW + x] = k; bfx[y * BW + x] = FX; } };
// a sprite from strings: one letter per unit pixel, '.' is clear
function sprite(x0, y0, rows, fxRows = 0) {
  rows.forEach((row, y) => [...row].forEach((ch, x) => {
    if (ch === '.') return;
    if (!(ch in BIDX)) throw new Error(`sprite colour ${ch}`);
    if (x0 + x < 0 || x0 + x >= BW || y0 + y < 0 || y0 + y >= BH) throw new Error(`sprite off the canvas at ${x0 + x},${y0 + y}`);
    FX = y < fxRows ? 1 : 0;
    px(x0 + x, y0 + y, BIDX[ch]);
  }));
  FX = 0;
}
function disc(cx, cy, r, k) {
  for (let y = Math.floor(cy - r - 1); y <= Math.ceil(cy + r); y++) {
    for (let x = Math.floor(cx - r - 1); x <= Math.ceil(cx + r); x++) {
      if ((x + 0.5 - cx) ** 2 + (y + 0.5 - cy) ** 2 <= r * r) px(x, y, k);
    }
  }
}
function seg(x0, y0, x1, y1, w, k) {
  const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 3) + 1;
  for (let i = 0; i <= n; i++) disc(x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n, w / 2, k);
}
const PALM_X = 124, PALM_Y = 26, GROUND = 92; // crown centre; the foot of the trunk
const SHORE = 95; // the island's waterline (a row of foam)
// trunk: a gentle S from the crown down to the sand, bark rings every few units, shaded edge
{
  const bez = (t) => {
    const a = [PALM_X, PALM_Y + 2], c = [PALM_X - 7, 62], b = [PALM_X + 2, GROUND];
    return [(1 - t) ** 2 * a[0] + 2 * (1 - t) * t * c[0] + t * t * b[0], (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * c[1] + t * t * b[1]];
  };
  const xs = new Map();
  for (let i = 0; i <= 400; i++) { const [x, y] = bez(i / 400); xs.set(Math.floor(y), x); }
  for (let y = PALM_Y + 2; y < GROUND; y++) {
    const cx = xs.get(y) ?? xs.get(y - 1);
    const t = (y - PALM_Y) / (GROUND - PALM_Y);
    const hw = 1.5 + 1.1 * t;
    const ring = (y - PALM_Y) % 5 === 0;
    for (let x = Math.round(cx - hw); x <= Math.round(cx + hw); x++) {
      px(x, y, ring || x >= Math.round(cx + hw) - 0.5 ? 2 : 1);
    }
  }
}
// fronds: a stem that rises and droops, combed with leaflets that hang towards the base
function frond(deg, L, droop, k, leaf) {
  const a = deg * Math.PI / 180, dx = Math.cos(a), dy = -Math.sin(a);
  const pts = [];
  for (let i = 0; i <= 80; i++) { const t = i / 80; pts.push([PALM_X + L * t * dx, PALM_Y + L * t * dy + droop * L * t * t]); }
  for (let i = 1; i < pts.length; i++) seg(...pts[i - 1], ...pts[i], 1.6 - 0.8 * i / 80, k);
  let acc = 0;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
    const sl = Math.hypot(x1 - x0, y1 - y0);
    acc += sl;
    if (acc < 2.4) continue;
    acc = 0;
    const t = i / 80;
    if (t < 0.14) continue;
    const tx = (x1 - x0) / sl, ty = (y1 - y0) / sl;
    let nx = -ty, ny = tx;
    if (ny < 0) { nx = -nx; ny = -ny; }
    const len = leaf * Math.sin(Math.PI * Math.min(1, 0.25 + t * 0.85)) + 1;
    let lx = nx * 0.8 - tx * 0.35, ly = ny * 0.8 - ty * 0.35 + 0.3;
    const ln = Math.hypot(lx, ly); lx /= ln; ly /= ln;
    seg(x1, y1, x1 + lx * len, y1 + ly * len, 1, k);
    let ux = -nx * 0.75 - tx * 0.5, uy = -ny * 0.75 - ty * 0.5;
    const un = Math.hypot(ux, uy); ux /= un; uy /= un;
    seg(x1, y1, x1 + ux * len * 0.45, y1 + uy * len * 0.45, 1, k);
  }
}
for (const [deg, L, droop, leaf] of [[150, 44, 0.5, 6], [30, 44, 0.5, 6], [108, 30, 0.3, 5], [72, 30, 0.3, 5]]) frond(deg, L, droop, 4, leaf);
disc(PALM_X - 3.5, PALM_Y + 2.5, 2.7, 3); disc(PALM_X + 3.5, PALM_Y + 2.5, 2.7, 3); disc(PALM_X, PALM_Y + 5.5, 2.7, 3);
for (const [deg, L, droop, leaf] of [[168, 50, 0.6, 7], [12, 50, 0.6, 7], [132, 40, 0.5, 6], [48, 40, 0.5, 6], [93, 21, 0.2, 4]]) frond(deg, L, droop, 5, leaf);
// the sun, high in the sky (it is always daytime): a disc, a highlight and its rays
for (let a = 0; a < 8; a++) {
  const t = a * Math.PI / 4 + Math.PI / 8;
  seg(21 + Math.cos(t) * 11, 16 + Math.sin(t) * 11, 21 + Math.cos(t) * 14.5, 16 + Math.sin(t) * 14.5, 1.6, BIDX.y);
}
disc(21, 16, 7.6, BIDX.y); disc(19.5, 14.5, 4.2, BIDX.Y);
// the island: a low mound of sand with a lit top and a line of foam where it meets the sea
for (let x = 26; x <= 188; x++) {
  const u = (x - 107) / 81;
  const top = Math.round(SHORE - 1 - 6.5 * Math.sqrt(Math.max(0, 1 - u * u)));
  for (let y = top; y <= SHORE; y++) {
    if (bmp[y * BW + x]) continue; // the trunk stands in it
    px(x, y, y === SHORE ? BIDX.F : y <= top + 1 ? BIDX.s : BIDX.S);
  }
}
// her: cream headphones over brown hair, coral tank top, cream shorts, bare feet; she faces us
sprite(66, 60, [
  '...hhhhh...',
  '..hhhhhhh..',
  '..chhhhhc..',
  '.cchkkkhcc.',
  '.cckkkkkcc.',
  '..ckkkkkc..',
  '...hkkkh...',
  '....kkk....',
  '....kkk....',
  '..koooook..',
  '.kkoooookk.',
  '.k.ooooo.k.',
  '.k.ooooo.k.',
  '.k.ooooo.k.',
  '.k.ooooo.k.',
  '.k.ooooo.k.',
  '.k.ooooo.k.',
  '.kkccccckk.',
  '...ccccc...',
  '...ccccc...',
  '...cc.cc...',
  '...cc.cc...',
  '...kk.kk...',
  '...kk.kk...',
  '...kk.kk...',
  '...kk.kk...',
  '...kk.kk...',
  '...kk.kk...',
  '..kkk.kkk..',
], 8);
// the bottle that came straight back, on the sand a few steps from her
sprite(42, 87, ['BBBBB...', 'BBBBBBBn', 'BBBBB...']);
// the hermit crab who pressed the key, minding its own business on the right-hand beach
sprite(150, 85, ['.x...x.', 'xx.x.xx', '.xxxxx.', 'x.x.x.x']);
// the raft, moored off the right-hand shore: lashed logs, end-on shading
sprite(190, 92, [
  'rrRrrrRrrrRrrrRrrr',
  'rrRrrrRrrrRrrrRrrr',
  'RRRRRRRRRRRRRRRRRR',
  '.RRRRRRRRRRRRRRRR.',
]);
// slice into cells: one redefined character per cell and colour
const SLICE = new Map();
let pua = 0xE000;
for (let r = 0; r < PIC_H; r++) for (let c = 0; c < PIC_W; c++) {
  const layers = new Map();
  for (let y = 0; y < CH; y++) for (let x = 0; x < CW; x++) {
    const i = (r * CH + y) * BW + c * CW + x;
    if (!bmp[i]) continue;
    const k = bmp[i] + 32 * bfx[i];
    if (!layers.has(k)) layers.set(k, []);
    layers.get(k).push([x, y]);
  }
  for (const [k, pts] of layers) {
    const key = pts.map((p) => p.join(',')).join(';');
    if (!SLICE.has(key)) {
      const ch = String.fromCodePoint(pua++);
      SLICE.set(key, ch);
      GLYPH.set(ch, mergePixels(pts, false));
    }
    const cell = cells[PIC_ROW + r][PIC_COL + c];
    if (cell.ch === ' ' && !cell.extra) cells[PIC_ROW + r][PIC_COL + c] = { ch: ' ', col: 'T', pic: true };
    const tgt = cells[PIC_ROW + r][PIC_COL + c];
    (tgt.extra ??= []).push({ ch: SLICE.get(key), col: BCOL[k % 32], fx: k >= 32 ? 'nod' : '' });
  }
}

// --- the run line -----------------------------------------------------------------------------
const RUN = '{L|$ }{H|python tools/serve.py}{L|  →  }http://127.0.0.1:8765/{D|   preview · MP4 export}';
put(23, LEFT, RUN);

// ---------------------------------------------------------------------------------------------
// The reveal order: every inner cell gets a bucket (a sixteenth note), in random order
// ---------------------------------------------------------------------------------------------
for (let r = INNER.r0; r <= INNER.r1; r++) for (let c = INNER.c0; c <= INNER.c1; c++) {
  const cell = cells[r][c];
  // the logo comes through a little earlier on average, the run line a little later
  let b = ri(NB);
  if (cell.logo && (cell.logo[0] || cell.logo[1])) b = Math.min(b, ri(NB));
  if (r === 23) b = Math.max(b, ri(NB));
  cell.b = b;
}

// ---------------------------------------------------------------------------------------------
// SVG
// ---------------------------------------------------------------------------------------------
const defs = [];
const css = [];
const body = [];
const use = (ch, x, y, cls = '') => `<use href="#${gid(ch)}" x="${f3(x)}" y="${f3(y)}"${cls ? ` class="${cls}"` : ''}/>`;

// --- noise strips -----------------------------------------------------------------------------
const NOISE = [...'!"#$%&\'()*+,-./0123456789:;<=>?@[\\]^`{|}~', ...'─│┌┐└┘├┤┬┴┼═║╪╫╡╞╥╨░▒'];
const DENSE = [...'#@%&$8B0MWNH', ...'▓▒╪╫┼'];
const STRIP = 16, NSTRIP = 20, NDENSE = 8;
function strip(id, alphabet) {
  let s = '';
  for (let k = 0; k < STRIP; k++) s += use(pick(alphabet), k * CW, 0).replace(' y="0"', '').replace(' x="0"', '');
  defs.push(`<g id="${id}">${s}</g>`);
}
for (let i = 0; i < NSTRIP; i++) strip(`s${i}`, NOISE);
for (let i = 0; i < NDENSE; i++) strip(`d${i}`, DENSE);
function noiseFrame(id, prefix, n, r0, r1) {
  let s = '';
  for (let r = r0; r <= r1; r++) {
    let c = INNER.c0 - ri(STRIP);
    let last = -1;
    while (c <= INNER.c1) {
      let k = ri(n);
      if (k === last) k = (k + 1) % n;
      last = k;
      s += `<use href="#${prefix}${k}" x="${X(c)}" y="${Y(r)}"/>`;
      c += STRIP;
    }
  }
  defs.push(`<g id="${id}">${s}</g>`);
}
for (const f of ['A', 'B', 'C']) noiseFrame(`n${f}`, 's', NSTRIP, INNER.r0, INNER.r1);
for (const f of ['A', 'B', 'C']) noiseFrame(`w${f}`, 'd', NDENSE, LOGO_ROW, LOGO_ROW + LOGO_H - 1);

// clip: the inner screen minus the logo cells (evenodd), and the logo cells alone
const runsOf = (pred) => {
  let d = '';
  for (let r = INNER.r0; r <= INNER.r1; r++) {
    let c = INNER.c0;
    while (c <= INNER.c1) {
      if (!pred(r, c)) { c++; continue; }
      let e = c;
      while (e + 1 <= INNER.c1 && pred(r, e + 1)) e++;
      d += `M${X(c)} ${Y(r)}h${(e - c + 1) * CW}v${CH}h-${(e - c + 1) * CW}z`;
      c = e + 1;
    }
  }
  return d;
};
const isLogoInk = (r, c) => !!(cells[r][c].logo && (cells[r][c].logo[0] || cells[r][c].logo[1]));
const innerRect = `M${X(INNER.c0)} ${Y(INNER.r0)}h${(INNER.c1 - INNER.c0 + 1) * CW}v${(INNER.r1 - INNER.r0 + 1) * CH}h-${(INNER.c1 - INNER.c0 + 1) * CW}z`;
const logoRuns = runsOf(isLogoInk);
defs.push(`<clipPath id="cn"><path clip-rule="evenodd" d="${innerRect}${logoRuns}"/></clipPath>`);
defs.push(`<clipPath id="cl"><path d="${logoRuns}"/></clipPath>`);

// logo paint: a cool sky-to-sea gradient, and a dithered drop shade
defs.push(`<linearGradient id="lg" gradientUnits="userSpaceOnUse" x1="0" y1="${Y(LOGO_ROW)}" x2="0" y2="${Y(LOGO_ROW + LOGO_H)}">`
  + `<stop offset="0" stop-color="#FFFFFF"/><stop offset=".34" stop-color="#BFE2FF"/><stop offset=".5" stop-color="#7CC0FF"/>`
  + `<stop offset=".51" stop-color="#5AA8FF"/><stop offset="1" stop-color="#2F6FD8"/></linearGradient>`);
defs.push(`<pattern id="sh" width="2" height="2" patternUnits="userSpaceOnUse"><rect width="1" height="1" fill="${P.frameHi}"/></pattern>`);

// --- covers + truth, by bucket ----------------------------------------------------------------
const coverD = Array.from({ length: NB }, () => []);
const coverP = Array.from({ length: NB }, () => []); // picture cells: their cover is the daylight
const truth = new Map(); // "b|col" -> uses
const logoD = Array.from({ length: NB }, () => '');
const shadeD = Array.from({ length: NB }, () => '');
for (let r = INNER.r0; r <= INNER.r1; r++) for (let c = INNER.c0; c <= INNER.c1; c++) {
  const cell = cells[r][c];
  (isPic(r, c) ? coverP : coverD)[cell.b].push([r, c]);
  if (cell.logo) {
    const [lt, lb] = cell.logo, [st, sb] = cell.shade;
    const x = X(c), y = Y(r), hh = CH / 2;
    if (lt && lb) logoD[cell.b] += `M${x} ${y}h${CW}v${CH}h-${CW}z`;
    else if (lt) logoD[cell.b] += `M${x} ${y}h${CW}v${hh}h-${CW}z`;
    else if (lb) logoD[cell.b] += `M${x} ${f3(y + hh)}h${CW}v${hh}h-${CW}z`;
    if (st) shadeD[cell.b] += `M${x} ${y}h${CW}v${hh}h-${CW}z`;
    if (sb) shadeD[cell.b] += `M${x} ${f3(y + hh)}h${CW}v${hh}h-${CW}z`;
    continue;
  }
  for (const ex of cell.extra ?? []) {
    const key = `${cell.b}|${ex.col}|1`;
    if (!truth.has(key)) truth.set(key, []);
    truth.get(key).push(use(ex.ch, X(c), Y(r), ex.fx === 'nod' ? 'nd' : ''));
  }
  if (cell.ch === ' ') continue;
  const key = `${cell.b}|${cell.col}|${cell.pic ? 1 : 0}`;
  if (!truth.has(key)) truth.set(key, []);
  const x = X(c), y = Y(r);
  const list = truth.get(key);
  if (cell.fx === 'wave') {
    const alt = cell.ch === '~' ? '≈' : '~';
    list.push(use(cell.ch, x, y, 'wa'), use(alt, x, y, 'wb'));
  } else if (cell.fx === 'bird') {
    list.push(use('ˇ', x, y, 'fa1'), use('ˉ', x, y - 1, 'fb1'));
  } else if (cell.fx === 'nod') {
    list.push(use(cell.ch, x, y, 'nd'));
  } else list.push(use(cell.ch, x, y));
}

// cover paths: a horizontal stroke through each cell, chained with relative moves
const coverPath = (list) => {
  let d = '', px = null, py = null, i = 0;
  list.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  while (i < list.length) {
    const [r, c] = list[i];
    let n = 1;
    while (i + n < list.length && list[i + n][0] === r && list[i + n][1] === c + n) n++;
    const x = X(c), y = Y(r) + CH / 2;
    d += px === null ? `M${x} ${f3(y)}` : `m${f3(x - px)} ${f3(y - py)}`;
    d += `h${n * CW}`;
    px = x + n * CW; py = y;
    i += n;
  }
  return d;
};

// colour keys used by the truth layer get their own flash keyframes
const colKeys = new Map();
const colKey = (col, pic) => {
  const hex = pic ? PIC_COLOR[col] : COLOR[col];
  if (!hex) throw new Error(`no colour ${col}`);
  if (!colKeys.has(hex)) colKeys.set(hex, `k${colKeys.size}`);
  return [colKeys.get(hex), hex];
};

// the logo's ink at half-cell resolution, merged into rects: the watermark tint under the noise,
// and the seamless final letters that replace the per-bucket pieces once everything has landed
function halfRuns(test) {
  const rects = [];
  for (let h = LOGO_ROW * 2; h <= (LOGO_ROW + LOGO_H) * 2 + 1; h++) {
    let c = LOGO_COL - 1;
    while (c <= LOGO_COL + 73) {
      if (!test(c, h)) { c++; continue; }
      let e = c;
      while (test(e + 1, h)) e++;
      const prev = rects.find((q) => q.c === c && q.e === e && q.h1 === h);
      if (prev) prev.h1 = h + 1; else rects.push({ c, e, h0: h, h1: h + 1 });
      c = e + 1;
    }
  }
  return rects.map((q) => `M${X(q.c)} ${f3(PAD + q.h0 * CH / 2)}h${(q.e - q.c + 1) * CW}v${f3((q.h1 - q.h0) * CH / 2)}h-${(q.e - q.c + 1) * CW}z`).join('');
}
const logoSolid = halfRuns(ink);

// --- noise layer ------------------------------------------------------------------------------
body.push(`<g class="nz">`
  + `<path fill="${P.tint}" d="${logoSolid}"/>`
  + `<g clip-path="url(#cn)" fill="${P.noise}"><use href="#nA" class="fa"/><use href="#nB" class="fb"/><use href="#nC" class="fc"/></g>`
  + `<g clip-path="url(#cl)" fill="${P.wmark}"><use href="#wA" class="fa"/><use href="#wB" class="fb"/><use href="#wC" class="fc"/></g>`
  + `</g>`);
// --- covers -----------------------------------------------------------------------------------
body.push(`<g fill="none" stroke="${P.bg}" stroke-width="${CH}">`
  + coverD.map((list, b) => (list.length ? `<path class="cv b${b}" d="${coverPath(list)}"/>` : '')).join('')
  + `</g>`);
// the picture's covers are its background attributes: banded sky and sea, one flat colour a row
defs.push(`<linearGradient id="pan" gradientUnits="userSpaceOnUse" x1="0" y1="${Y(PIC_ROW)}" x2="0" y2="${Y(PIC_ROW + PIC_H)}">`
  + BAND.map((col, i) => `<stop offset="${f3(i / PIC_H)}" stop-color="${col}"/><stop offset="${f3((i + 1) / PIC_H)}" stop-color="${col}"/>`).join('')
  + `</linearGradient>`);
body.push(`<g fill="none" stroke="url(#pan)" stroke-width="${CH}">`
  + coverP.map((list, b) => (list.length ? `<path class="cv b${b}" d="${coverPath(list)}"/>` : '')).join('')
  + `</g>`);
// once every cell has landed, one seamless panel replaces the patchwork (no hairlines between
// cells at fractional scales)
body.push(`<rect class="solidP" x="${X(PIC_COL)}" y="${Y(PIC_ROW)}" width="${PIC_W * CW}" height="${PIC_H * CH}" fill="url(#pan)"/>`);
// --- logo shade and letters --------------------------------------------------------------------
body.push(`<g fill="url(#sh)">${shadeD.map((d, b) => (d ? `<path class="cv b${b}" d="${d}"/>` : '')).join('')}</g>`);
body.push(`<g>${logoD.map((d, b) => (d ? `<path class="kL b${b}" fill="url(#lg)" d="${d}"/>` : '')).join('')}</g>`);
body.push(`<path class="solid" fill="url(#lg)" d="${logoSolid}"/>`);
// --- the true glyphs ---------------------------------------------------------------------------
const truthOut = [];
for (const [key, list] of [...truth.entries()].sort()) {
  const [b, col, pic] = key.split('|');
  const [k, hex] = colKey(col, pic === '1');
  truthOut.push(`<g class="${k} b${b}" fill="${hex}">${list.join('')}</g>`);
}
body.push(truthOut.join(''));
// and once the picture's last cell has stopped flashing, the same bitmap drawn whole, per colour,
// over its slices: no hairlines in the sand or the trunk where cells meet at fractional scales
{
  const groups = new Map(); // colour index + 32 * nod -> pixels
  for (let y = 0; y < BH; y++) for (let x = 0; x < BW; x++) {
    const i = y * BW + x;
    if (!bmp[i]) continue;
    const k = bmp[i] + 32 * bfx[i];
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push([x, y]);
  }
  let s = '';
  for (const k of [...groups.keys()].sort((a, b) => a - b)) {
    const d = mergePixels(groups.get(k), false)
      .map(([x, y, w, h]) => `M${X(PIC_COL) + x} ${Y(PIC_ROW) + y}h${w}v${h}h-${w}z`).join('');
    s += `<path fill="${PIC_COLOR[BCOL[k % 32]]}"${k >= 32 ? ' class="nd"' : ''} d="${d}"/>`;
  }
  body.push(`<g class="solidB">${s}</g>`);
}

// --- the window: a double-line frame with labels sitting in it ---------------------------------
const fx0 = X(0) + 2.5, fy0 = Y(0) + 5.5, fx1 = X(COLS) - 2.5, fy1 = Y(ROWS) - 5.5;
body.push(`<g fill="none" stroke="${P.frame}">`
  + `<rect x="${fx0}" y="${fy0}" width="${f3(fx1 - fx0)}" height="${f3(fy1 - fy0)}"/>`
  + `<rect x="${fx0 + 2}" y="${fy0 + 2}" width="${f3(fx1 - fx0 - 4)}" height="${f3(fy1 - fy0 - 4)}"/>`
  + `</g>`);
// a label: "[ text ]" on the frame row, with the frame masked behind it
function label(row, col, src, cls = '', def = 'L') {
  const n = plainLen(src) + 4;
  let s = `<rect x="${X(col)}" y="${Y(row)}" width="${n * CW}" height="${CH}" fill="${P.bg}"/>`;
  s += glyphRun(row, col, `{F|[} ${src} {F|]}`, def);
  return `<g${cls ? ` class="${cls}"` : ''}>${s}</g>`;
}
function glyphRun(row, col, src, def) {
  const re = /\{(\w)\|([^}]*)\}|([^{]+)/g;
  let m, x = col;
  const byCol = new Map();
  while ((m = re.exec(src))) {
    const k = m[1] || def, s = m[1] ? m[2] : m[3];
    for (const ch of s) {
      if (ch !== ' ') {
        if (!byCol.has(k)) byCol.set(k, '');
        byCol.set(k, byCol.get(k) + use(ch, X(x), Y(row)));
      }
      x++;
    }
  }
  return [...byCol.entries()].map(([k, s]) => `<g fill="${k === 'F' ? P.frameHi : COLOR[k]}">${s}</g>`).join('');
}
const TITLE = 'castaway.msg';
const TOOL = 'kelpcrypt · key {H|1992} · {T|♪} 80 BPM';
const FOOT = ['press any key to decrypt {H|_}', 'key pressed (by a hermit crab). decrypting on the beat',
  '5 beats to decrypt · 10 hours to watch · plot optional', '{H|always day}'];
body.push(label(0, 2, `{H|${TITLE}}`));
body.push(label(0, 21, TOOL));
// the beat light: the note pulses on every beat once the message is plaintext
const noteCol = 21 + 2 + plainLen('kelpcrypt · key 1992 · ');
body.push(`<g class="beat">${glyphRun(0, noteCol, '{H|♪}', 'H')}</g>`);
// status: DECRYPTING with five progress squares, then PLAINTEXT
const ST_COL = COLS - 2 - 20;
body.push(label(0, ST_COL, '{D|DECRYPTING} {D|□□□□□}', 'pre2'));
body.push(label(0, ST_COL, '{H|PLAINTEXT } {T|■■■■■}', 'fin'));
for (let k = 0; k < 5; k++) body.push(`<g class="sq${k}">${glyphRun(0, ST_COL + 2 + 11 + k, '{T|■}', 'T')}</g>`);
// footer, three states
body.push(label(ROWS - 1, 2, FOOT[0], 'pre1'));
body.push(label(ROWS - 1, 2, FOOT[1], 'mid'));
body.push(label(ROWS - 1, 2, FOOT[2], 'fin'));
body.push(label(ROWS - 1, COLS - 2 - plainLen(FOOT[3]) - 4, FOOT[3]));

// ---------------------------------------------------------------------------------------------
// CSS
// ---------------------------------------------------------------------------------------------
css.push(`.nz{opacity:0;animation:nz ${f3(TEND + 0.1)}s steps(1,end) both}`);
css.push('@keyframes nz{0%{opacity:1}100%{opacity:0}}');
// the noise churns through its three frames, an eighth note each: under 3 changes a second over
// the big area, while single cells still snap on the sixteenths
const CYC = (BEAT / 2) * 3;
const NCYC = Math.ceil((TEND - T0) / CYC) + 1;
css.push(`.fa,.fb,.fc{animation:${f3(CYC)}s steps(1,end) ${T0}s ${NCYC} both}`);
css.push('.fa{animation-name:fa}.fb{animation-name:fb}.fc{animation-name:fc}');
css.push('@keyframes fa{0%{opacity:1}33.333%{opacity:0}100%{opacity:0}}');
css.push('@keyframes fb{0%{opacity:0}33.333%{opacity:1}66.667%{opacity:0}100%{opacity:0}}');
css.push('@keyframes fc{0%{opacity:0}66.667%{opacity:1}100%{opacity:1}}');
css.push('.fb,.fc{opacity:0}');
// covers and shades appear at their bucket's moment
css.push('.cv{animation:cv .01s linear both}@keyframes cv{from{opacity:0}to{opacity:1}}');
// true glyphs: white for a sixteenth, then their own colour
const FL = SUB * 1.6;
for (const [hex, k] of colKeys) {
  css.push(`.${k}{animation:${k} ${f3(FL)}s linear both}@keyframes ${k}{0%{opacity:0;fill:#fff}1%{opacity:1;fill:#fff}60%{fill:#fff}61%,100%{fill:${hex}}}`);
}
css.push(`.kL{animation:kL ${f3(FL)}s linear both}@keyframes kL{0%{opacity:0;fill:#fff}1%{opacity:1;fill:#fff}60%{fill:#fff}61%,100%{fill:url(#lg)}}`);
for (let b = 0; b < NB; b++) css.push(`.b${b}{animation-delay:${f3(tb(b))}s}`);
// labels: visible only before T0, between T0 and TEND, or from TEND on
css.push(`.pre1{animation:on ${T0}s linear}.pre1,.pre2,.mid{opacity:0}`);
css.push(`.pre2{animation:on ${TEND}s linear}`);
css.push(`.mid{animation:on ${f3(TEND - T0)}s linear ${T0}s}`);
css.push(`.fin{animation:off ${TEND}s linear}`);
css.push('@keyframes on{0%,100%{opacity:1}}@keyframes off{0%,100%{opacity:0}}');
css.push(`.solid{animation:off ${f3(TEND + FL + 0.05)}s linear}`);
css.push(`.solidP{animation:off ${f3(TEND + 0.05)}s linear}`);
css.push(`.solidB{animation:off ${f3(TEND + FL + 0.05)}s linear}`);
for (let k = 0; k < 5; k++) css.push(`.sq${k}{animation:off ${f3(T0 + (k + 1) * BEAT)}s linear}`);
// the blinking footer cursor, and the beat light
css.push(`.pre1 g:last-child{animation:bl ${BEAT}s steps(1,end) infinite}@keyframes bl{50%{opacity:0}}`);
css.push(`.beat{opacity:0;animation:bt ${BEAT}s steps(1,end) ${TEND}s infinite}@keyframes bt{0%{opacity:1}25%{opacity:0}}`);
// the island keeps time: the sea ripples every beat, the gulls flap, she nods
css.push(`.wa{animation:wa ${BEAT * 2}s steps(1,end) infinite}.wb{opacity:0;animation:wb ${BEAT * 2}s steps(1,end) infinite}`);
css.push('@keyframes wa{0%{opacity:1}50%{opacity:0}}@keyframes wb{0%{opacity:0}50%{opacity:1}}');
css.push(`.fa1{animation:wa ${BEAT}s steps(1,end) infinite}.fb1{opacity:0;animation:wb ${BEAT}s steps(1,end) infinite}`);
css.push(`.nd{animation:nd ${BEAT}s steps(1,end) infinite}@keyframes nd{0%{transform:translateY(1.5px)}30%{transform:translateY(0)}}`);
css.push('@media (prefers-reduced-motion:reduce){*{animation:none!important}}');

// --- glyph defs (only what is used) -------------------------------------------------------------
const glyphDefs = [...GID.entries()].map(([ch, id]) => `<path id="${id}" d="${glyphD(ch)}"/>`).join('');

const ALT = 'CASTAWAY: a scrambled message in a terminal window decrypts, cell by cell, on the beat, '
  + 'into the title, a message header with the event timers, the run command and a small daylight island picture.';
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VBW} ${VBH}" width="${VBW * 2}" height="${VBH * 2}" role="img" aria-label="${ALT}">
<title>${ALT}</title>
<style>${css.join('')}</style>
<defs>${glyphDefs}${defs.join('')}</defs>
<rect x=".5" y=".5" width="${VBW - 1}" height="${VBH - 1}" rx="10" fill="${P.bg}" stroke="${P.edge}"/>
${body.join('\n')}
</svg>
`;

fs.mkdirSync(path.dirname(ARGV_OUT || OUT_SVG), { recursive: true });
fs.writeFileSync(ARGV_OUT || OUT_SVG, svg);
console.log(`svg: ${(svg.length / 1024).toFixed(1)} KB, ${GID.size} glyphs, ${colKeys.size} colours`);

// ---------------------------------------------------------------------------------------------
// The README header (markdown). The plaintext block is built from the same lines as the SVG,
// so the words in the picture and the words a screen reader gets cannot drift apart.
// ---------------------------------------------------------------------------------------------
if (!ARGV_OUT) {
  const plain = (src) => src.replace(/\{\w\|([^}]*)\}/g, '$1');
  const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const link = (t, file) => t.replace(file, `<a href="${file}">${file}</a>`);
  const PRE = [
    `${TITLE}  ·  ${plain(TOOL)}  ·  PLAINTEXT`,
    '',
    'CASTAWAY',
    TAG1,
    TAG2,
    '',
    ...BODY.map(plain),
    '',
    plain(RUN),
    '',
    `${plain(FOOT[2])} · ${plain(FOOT[3])}`,
  ];
  for (const line of PRE) if ([...line].length > 80) throw new Error(`plaintext line over 80 columns: ${line}`);
  const preHtml = PRE.map((l) => {
    let h = esc(l);
    if (l === plain(RUN)) h = link(link(h, 'tools/serve.py'), 'http://127.0.0.1:8765/');
    if (l === 'CASTAWAY') h = '<b>CASTAWAY</b>';
    return h;
  }).join('\n');

  const IMG_ALT = 'CASTAWAY, decrypting. A dark terminal window titled castaway.msg starts as a solid block of dim, '
    + 'scrambled symbols with the word CASTAWAY already showing through. On the beat, cell by cell in random order, '
    + 'the noise resolves into big blue block letters spelling CASTAWAY and the tagline: ten hours on one very small island, '
    + 'almost nothing happens, on the beat. Below, a message header (from her, to anyone, status idle), the four event timers '
    + 'with a gag each, every sound synthesized from code, and the run command python tools/serve.py with http://127.0.0.1:8765/. '
    + 'Beside it a small daylight picture decrypts too, a cell of sky or sea at a time: the sun, a tall palm on a sandy island, '
    + 'a bottle, a hermit crab, a raft, and her in cream headphones and a coral tank top, nodding to the beat. '
    + 'The full text is repeated below the image.';

  const md = `<!-- Header ${SLUG} for Castaway, written for a future README.md at the project root. This file and its SVG are generated by src/${SLUG}.mjs: edit that, not this. -->

<p align="center">
  <img src="assets/${SLUG}.svg" width="100%" alt="${IMG_ALT}">
</p>

<p align="center">
  <b>CASTAWAY</b> · ten hours on one very small island. Almost nothing happens, on the beat.<br>
  <sub>Working title, in development. An unofficial lo-fi remake inspired by the 1992 screensaver <i>Johnny Castaway</i>.</sub>
</p>

**Castaway** is a stationary-frame lo-fi video for YouTube: a young woman alone on a tiny island with one tall palm, a raft and a great deal of time. She idles, nodding to the music on her headphones, and every so often something happens. Her message in a bottle washes straight back. A delivery drone brings her another pair of headphones. A coconut lands on a hermit crab, and the crab walks off wearing it. There are more than 90 activities, most of them on four timers, and each one starts on the next bar of the music, so the gags land on the beat. Every sound is synthesized from code. Sunny, hand-painted, always daytime, 1080p at 30 fps.

Decrypt it yourself, from the project root:

\`\`\`sh
python tools/serve.py
\`\`\`

then open [http://127.0.0.1:8765/](http://127.0.0.1:8765/) for the live preview and the export to a YouTube-ready MP4. Plain ES modules: no build step, no npm.

<details>
<summary><b>Plaintext</b>: the whole message, for screen readers and the impatient</summary>

<pre>
${preHtml}
</pre>

</details>

<details>
<summary><b>The long decrypt</b>: timers, sightings, sound and tools</summary>

#### Timers

| Timer | Comes round every | Typical 10-hour run | For example |
| --- | --- | --- | --- |
| Regular | 2 to 5 minutes | about 155 | a coconut in the shade, a spot of fishing, a jog round the island |
| Occasional | 12 to 25 minutes | about 30 | a sea turtle visits; a coconut lands on a hermit crab, which leaves wearing it |
| Rare | 30 to 60 minutes | about 13 | a drone delivers more headphones; a shark in headphones nods along |
| Super rare | 3 to 6 hours, at most 3 a run | about 2 | she walks out over the water and comes back with an iced coffee |
| Chained | never on a timer, only by another activity | about 20 | the tide takes the sandcastle; hours after the bottle, a different one brings a reply |

Counts are the median of 200 simulated 10-hour runs, as the header of [activities.toml](activities.toml) puts it; the default run is 10:00:00 with seed 1992. She is busy about a third of the time and idles the rest, which is the point. Lanes let things overlap, so a ship can sail past while she is busy with a coconut: the ship even waits for her to get busy.

#### Sightings, so far

- The message in a bottle washes straight back. Hours later, a different bottle brings a reply.
- A stray cat (grey tabby, white chest) arrives on a crate, climbs the palm and naps. One day it floats away again. Another day it is back.
- The signal hunt: one bar of signal, at the very top of the palm.
- A tour boat full of selfie-takers.
- A bro on an electric hydrofoil throws a shaka and carves off.
- Bushcraft: fire by friction, a hammock, a lookout up the palm, spear fishing.
- A kumara, planted, that grows over the course of the video.
- A sandcastle, until the tide takes it.
- Waving for rescue. Once in a long while a ship honks back, then sails on.

#### Sound

Every sound comes out of [\`tools/make_audio.py\`](tools/make_audio.py): no samples, loops or recordings, so no third-party licence applies. More than 150 sound files so far. The theme is a seamless 60-second loop at 80 BPM in F major (ii-V-I-vi), 20 bars of exactly 3 seconds, with electric piano, a kalimba lead, soft drums and vinyl crackle; the ocean ambience is a seamless 60-second loop too. The mix sits at -14 LUFS with true peak at or below -1 dBTP, and levels are adjustable in master and per routine. Nobody has listened to any of it yet: the decrypt took five beats, the review is still pending.

#### Tools

- \`python tools/serve.py\`: the renderer, [web/index.html](web/index.html) with live preview at http://127.0.0.1:8765/. It exports frame-exact video in the browser (WebCodecs H.264, 68 to 78 frames a second at 1080p30 in Chrome), and the server mixes the sound and joins the two into an MP4. Source: [tools/serve.py](tools/serve.py).
- \`python tools/schedule.py\`: validates [activities.toml](activities.toml) and simulates a 10-hour run. Source: [tools/schedule.py](tools/schedule.py).
- \`python tools/render_demo.py --dev\`: the older Python reference renderer, a dev reel of every activity with a heads-up display. Source: [tools/render_demo.py](tools/render_demo.py).

Decisions, and what holds right now: [MUSING.md](MUSING.md).

</details>

<details>
<summary><b>About the cipher</b>: what kelpcrypt is (nothing), and what this banner borrows</summary>

The banner is a decrypt reveal: a block of scrambled symbols that turns into the real text cell by cell, in random order, each cell snapping to a bright accent as it lands. The effect comes from early-1990s film computer screens and was recreated as the open-source terminal tool no-more-secrets; this one is drawn from scratch as an animated SVG, and nothing is taken from either. Here every cell lands on a sixteenth note at 80 BPM, so the whole message decrypts in exactly five beats, the way the video's gags start on the bar. The picture is drawn in a redefined character set, the way text-mode games drew their scenery, and every one of its cells carries a sky or sea background colour, so the daylight decrypts a cell at a time like the words do. The name shows through the noise from the first frame, and with reduced motion switched on you get the plaintext straight away.

kelpcrypt is made up. Its only key is 1992, which is also the default seed (same seed, same schedule, event for event), so the security model is best described as "printed on the bottle". Please do not encrypt anything with it.

Castaway is an unofficial remake inspired by the 1992 screensaver Johnny Castaway, which belongs to its owners; nothing here is taken from it. Counts are as of 2026-10-02 and the schedule grows every few hours, so trust \`python tools/schedule.py\` over this page.

</details>
`;
  fs.writeFileSync(OUT_MD, md);
  console.log(`md: ${(md.length / 1024).toFixed(1)} KB`);
}

