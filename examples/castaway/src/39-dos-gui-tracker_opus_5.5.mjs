// DOS GUI tracker README banner for Castaway.
//
//   node examples/castaway/src/39-dos-gui-tracker_opus_5.5.mjs
//
// Regenerates ../assets/39-dos-gui-tracker_opus_5.5.svg. Plain Node, no deps,
// fully deterministic (no clock, no randomness: the scope noise comes from a
// seeded PRNG). The .md beside the assets is hand-written, not generated.
//
// The look is the dense 640x400 mouse-driven screen of the mid-90s DOS GUI
// trackers (the FastTracker II family, catalogue entry trk-03): teal-grey
// panels split by 1 px pale-cyan and dark frame lines, a song position list
// in a black box, a logo plate over a two-tone checker band with a tiny
// credit plate, BPM / Spd. / Add. / Ptn. / Ln. counters with arrow buttons, a
// status strip, a 2x4 grid of numbered scopes, two columns of narrow grey
// bevelled buttons, an instrument list with the selected line inverted, range
// buttons, a sample list with a scrollbar, and an 8-channel pattern editor
// with hex row numbers on both edges, dotted empty fields and a fixed
// current-row band. Nothing is traced: the wordmark, both bitmap faces and
// every label are drawn in this file, and no real tracker's name, logo, credit
// plate, module, instrument or composer appears.
//
// What the screen shows (one loop = one minute of the video):
//   - The song is the theme: 80 BPM, 20 bars of exactly 3 s, 60 s, seamless.
//     At BPM 80 and Spd. 06 a row lasts 2.5/80 x 6 = 0.1875 s, so a 64-row
//     pattern (Ln. 040) is 4 bars, and Songlen. 05 patterns is the whole
//     60-second loop. The Time counter is the position in that loop, so it
//     wraps 00:00:59 -> 00:00:00 exactly when the theme does.
//   - Channels 0-3 play the theme's own instruments (electric piano, kalimba,
//     drums, plus the ocean ambience, which is one note that loops for the
//     whole minute). The notes are invented, in F major, on the real bar map:
//     keys alone for bars 0-1, drums from bar 2, kalimba from bar 6, the full
//     tune in bars 10-15, kick and rim in the break, bars 16-19.
//   - Channels 4-7 are the island's lanes: her, the cat, the turtle, and
//     whatever is out on the sea or in the sky. They are mostly dots, which is
//     the point. This minute, the shark_nod routine plays out bar by bar with
//     durations inside its real ranges from activities.toml: fin circles 27 s,
//     she freezes 3 s, it surfaces 3 s, they nod together on every beat for
//     18 s, a last nod and it sinks 3 s, back to the music 6 s. Exactly 60 s.
//     The cat is asleep in the palm. The turtle is not here.
//   - The instrument list is activities, the sample list is the selected
//     activity's synthesized sound files (real names from media/audio/sfx),
//     and the selected sample follows the routine's beats.
//   - The scopes take their amplitude from the same note timeline. Her scope
//     blips on every beat (she nods), and goes flat while she freezes.
//   - The Nod button is pressed on every beat, except while she freezes.
//
// Loop maths: every animation is CSS, 60 s or a divisor of it, started T0
// seconds in with a negative delay; the same T0 frame is written into the
// static attributes, so prefers-reduced-motion shows a complete frame.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(here, '../assets/39-dos-gui-tracker_opus_5.5.svg');
const OUT_ABOUT = path.resolve(here, '../assets/39-dos-gui-tracker_opus_5.5-about.svg');

// ------------------------------------------------------------------ timing
const LOOP = 60;                 // seconds: the theme loop
const ROWS = 320;                // 5 patterns x 64 rows
const ROW_S = LOOP / ROWS;       // 0.1875 s
const BEAT = 0.75;               // 4 rows
const BAR = 3;                   // 16 rows
const T0 = 40.5;                 // first frame: bar 13.5, mid-nod
const ROW0 = Math.round(T0 / ROW_S); // 216
const pct = (t) => `${+((t / LOOP) * 100).toFixed(2)}%`;
const num = (v) => String(+v.toFixed(2)).replace(/^(-?)0\./, '$1.');
const fmt = (n) => +n.toFixed(2);

// ------------------------------------------------------------------ geometry
const BZ = 4;                    // black bezel round the 640x400 screen
const SW = 640;
const SH = 400;
const W = SW + 2 * BZ;
const H = SH + 2 * BZ;

// ------------------------------------------------------------------ palette
const P = {
  panel: '#497582',   // desktop and panels (teal-grey)
  line: '#8adbf3',    // pale cyan frame lines
  dark: '#18282c',    // dark frame
  btn: '#9e9e9e',     // button face
  btnHi: '#e6e6e6',
  btnLo: '#3f4a4d',
  ink: '#000000',
  yellow: '#ffff82',  // pattern text
  white: '#ffffff',
  dots: '#77773f',    // empty-field dots
  rowDim: '#b9b95f',  // row numbers between beats
  band: '#497582',    // current-row band
  barNum: '#ffffff',
  check1: '#2a5866',
  check2: '#3d7888',
  face2: '#c5dde3',   // wordmark lower half
  trace: '#ffff82',
};

// ------------------------------------------------------------------ fonts
// UI face: proportional pixel sans, cap height 7, x-height 5, 2-row
// descenders (glyph table carried over from this repo's desktop-95 banner,
// with an underscore and a few marks added). '#' = pixel.
const UI = {
  A: '..#..|.#.#.|.#.#.|#...#|#####|#...#|#...#',
  B: '####.|#...#|#...#|####.|#...#|#...#|####.',
  C: '.###.|#...#|#....|#....|#....|#...#|.###.',
  D: '####.|#...#|#...#|#...#|#...#|#...#|####.',
  E: '####|#...|#...|###.|#...|#...|####',
  F: '####|#...|#...|###.|#...|#...|#...',
  G: '.###.|#...#|#....|#.###|#...#|#...#|.###.',
  H: '#...#|#...#|#...#|#####|#...#|#...#|#...#',
  I: '###|.#.|.#.|.#.|.#.|.#.|###',
  L: '#...|#...|#...|#...|#...|#...|####',
  M: '#...#|##.##|#.#.#|#.#.#|#...#|#...#|#...#',
  N: '#...#|##..#|##..#|#.#.#|#..##|#..##|#...#',
  O: '.###.|#...#|#...#|#...#|#...#|#...#|.###.',
  P: '####.|#...#|#...#|####.|#....|#....|#....',
  R: '####.|#...#|#...#|####.|#.#..|#..#.|#...#',
  S: '.###.|#...#|#....|.###.|....#|#...#|.###.',
  T: '#####|..#..|..#..|..#..|..#..|..#..|..#..',
  U: '#...#|#...#|#...#|#...#|#...#|#...#|.###.',
  W: '#...#|#...#|#...#|#.#.#|#.#.#|##.##|#...#',
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
  '-': '...|...|...|...|###|...|...',
  '/': '..#|..#|.#.|.#.|.#.|#..|#..',
  '+': '...|...|.#.|###|.#.|...|...',
  '_': '....|....|....|....|....|....|####',
  '(': '.#|#.|#.|#.|#.|#.|.#',
  ')': '#.|.#|.#|.#|.#|.#|#.',
  "'": '#|#|.|.|.|.|.',
};

// Pattern face: fixed 5x7, 6 px advance. Notes read C-4 / D#5 / ===.
const PAT = {
  0: '.###.|#...#|#..##|#.#.#|##..#|#...#|.###.',
  1: '..#..|.##..|..#..|..#..|..#..|..#..|.###.',
  2: '.###.|#...#|....#|..##.|.#...|#....|#####',
  3: '####.|....#|....#|.###.|....#|....#|####.',
  4: '...#.|..##.|.#.#.|#..#.|#####|...#.|...#.',
  5: '#####|#....|####.|....#|....#|#...#|.###.',
  6: '.###.|#....|#....|####.|#...#|#...#|.###.',
  7: '#####|....#|...#.|..#..|..#..|..#..|..#..',
  8: '.###.|#...#|#...#|.###.|#...#|#...#|.###.',
  9: '.###.|#...#|#...#|.####|....#|....#|.###.',
  A: '.###.|#...#|#...#|#####|#...#|#...#|#...#',
  B: '####.|#...#|#...#|####.|#...#|#...#|####.',
  C: '.###.|#...#|#....|#....|#....|#...#|.###.',
  D: '####.|#...#|#...#|#...#|#...#|#...#|####.',
  E: '#####|#....|#....|####.|#....|#....|#####',
  F: '#####|#....|#....|####.|#....|#....|#....',
  G: '.###.|#...#|#....|#.###|#...#|#...#|.###.',
  '#': '.#.#.|.#.#.|#####|.#.#.|#####|.#.#.|.#.#.',
  '-': '.....|.....|.....|.###.|.....|.....|.....',
  '=': '.....|.....|#####|.....|#####|.....|.....',
  ':': '.....|..#..|..#..|.....|..#..|..#..|.....',
};

// Micro face: 3x5 capitals for the REC tags and the credit plate.
const MICRO = {
  B: '##.|#.#|##.|#.#|##.',
  Y: '#.#|#.#|.#.|.#.|.#.',
  F: '###|#..|##.|#..|#..',
  E: '###|#..|##.|#..|###',
  R: '##.|#.#|##.|#.#|#.#',
  M: '#.#|###|###|#.#|#.#',
  A: '.#.|#.#|###|#.#|#.#',
  T: '###|.#.|.#.|.#.|.#.',
  C: '.##|#..|#..|#..|.##',
  2: '##.|..#|.#.|#..|###',
  6: '.##|#..|##.|#.#|.#.',
  "'": '#|#|.|.|.',
};

// Rows of '#' into one path of merged rectangles (runs merged vertically too).
function bitmapPath(rows, ox = 0, oy = 0, s = 1) {
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
  return rects.map((r) => `M${ox + r.x * s} ${oy + r.y * s}h${r.w * s}v${r.h * s}h${-r.w * s}z`).join('');
}

function makeFont(prefix, table, { mono = 0, space = 3 } = {}) {
  const used = new Map();
  const rowsOf = (ch) => {
    const src = table[ch];
    if (src === undefined) throw new Error(`font ${prefix}: no glyph for ${JSON.stringify(ch)}`);
    return src.split('|');
  };
  const font = {
    rowsOf,
    adv: (ch) => (mono || (ch === ' ' ? space : rowsOf(ch)[0].length + 1)),
    id(ch) {
      const id = prefix + ch.codePointAt(0).toString(36);
      if (!used.has(id)) used.set(id, bitmapPath(rowsOf(ch)));
      return id;
    },
    width: (str) => [...str].reduce((w, ch) => w + font.adv(ch), 0) - (mono ? mono - rowsOf(str.at(-1) === ' ' ? '0' : str.at(-1))[0].length : 1),
    defs: () => [...used].map(([id, d]) => `<path id="${id}" d="${d}"/>`).join(''),
  };
  return font;
}
const ui = makeFont('u', UI, { space: 3 });
const pat = makeFont('p', PAT, { mono: 6 });
const micro = makeFont('m', MICRO, { space: 2 });

// A run of glyphs as one group of <use>.
function text(font, str, x, y, fill, attrs = '') {
  let s = `<g transform="translate(${x} ${y})"${fill ? ` fill="${fill}"` : ''}${attrs ? ` ${attrs}` : ''}>`;
  let cx = 0;
  for (const ch of str) {
    if (ch !== ' ') s += `<use href="#${font.id(ch)}"${cx ? ` x="${cx}"` : ''}/>`;
    cx += font.adv(ch);
  }
  return `${s}</g>`;
}
const textC = (font, str, cx, y, fill, a) => text(font, str, Math.round(cx - font.width(str) / 2), y, fill, a);
const textR = (font, str, rx, y, fill, a) => text(font, str, rx - font.width(str), y, fill, a);

// ------------------------------------------------------------------ boxes
const rect = (x, y, w, h, fill, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"${extra ? ` ${extra}` : ''}/>`;
// 1 px edges: top+left in `hi`, bottom+right in `lo`.
function edges(x, y, w, h, hi, lo) {
  return `<path fill="${hi}" d="M${x} ${y}h${w}v1h${-(w - 1)}v${h - 1}h-1z"/>`
    + `<path fill="${lo}" d="M${x + 1} ${y + h - 1}h${w - 1}v1h${-(w - 1)}zM${x + w - 1} ${y + 1}h1v${h - 1}h-1z"/>`;
}
const panel = (x, y, w, h) => rect(x, y, w, h, P.panel) + edges(x, y, w, h, P.line, P.dark);
const well = (x, y, w, h, fill = P.ink) => rect(x, y, w, h, fill) + edges(x, y, w, h, P.dark, P.line);
function button(x, y, w, h, label, { down = false, font = ui } = {}) {
  let s = rect(x, y, w, h, P.btn) + edges(x, y, w, h, down ? P.btnLo : P.btnHi, down ? P.btnHi : P.btnLo);
  const lines = Array.isArray(label) ? label : [label];
  const lh = 9;
  const top = Math.round(y + (h - lines.length * lh + 2) / 2) + (down ? 1 : 0);
  lines.forEach((ln, i) => { s += textC(font, ln, x + w / 2 + (down ? 1 : 0), top + i * lh, P.ink); });
  return s;
}
const ARROW_UP = ['..#..', '.###.', '#####'];
const ARROW_DN = ['#####', '.###.', '..#..'];
function arrowBtn(x, y, up, w = 10, h = 10) {
  const a = up ? ARROW_UP : ARROW_DN;
  return rect(x, y, w, h, P.btn) + edges(x, y, w, h, P.btnHi, P.btnLo)
    + `<path fill="${P.ink}" d="${bitmapPath(a, x + Math.floor((w - 5) / 2), y + Math.floor((h - 3) / 2))}"/>`;
}

// ------------------------------------------------------------------ song data
// Theme: F major, ii-V-I-vi, one chord a bar: Gm9 C13 FM9 Dm9 (from
// tools/make_audio.py's description). The notes themselves are invented.
const CHORDS = ['Gm9', 'C13', 'FM9', 'Dm9'];
const KEYS = { Gm9: ['G-3', 'A#3', 'A-4'], C13: ['C-4', 'E-4', 'D-4'], FM9: ['F-3', 'A-3', 'G-4'], Dm9: ['D-3', 'F-3', 'E-4'] };
const KAL = {
  Gm9: [[0, 'D-5'], [4, 'F-5'], [6, 'G-5'], [10, 'A#5'], [12, 'A-5']],
  C13: [[0, 'G-5'], [4, 'E-5'], [8, 'C-5'], [12, 'D-5']],
  FM9: [[0, 'C-5'], [2, 'A-4'], [6, 'C-5'], [8, 'E-5'], [12, 'G-5']],
  Dm9: [[0, 'F-5'], [4, 'E-5'], [6, 'D-5'], [10, 'A-4']],
};
const KAL_EXTRA = { Gm9: [14, 'G-5'], C13: [14, 'E-5'], FM9: [14, 'A-5'], Dm9: [14, 'C-5'] };

// Instruments 01-08 (bank one) are activities; the theme's own voices live at
// the far end of bank two, 7A-7F.
const INSTR = [
  'coconut sip',
  'fishing (nibbles only)',
  'bottle, thrown back',
  'delivery drone',
  'shark in headphones',
  'sea turtle visit',
  'stray cat, by crate',
  'ship nobody sees',
];
const SEL_INSTR = 4; // 05
const SAMPLES = ['shark_fin_pulse_loop', 'shark_surface', 'bubbles_sink', '', ''];

const CH = ['keys', 'kalimba', 'drums', 'ocean', 'her', 'cat', 'turtle', 'sea+sky'];
const grid = CH.map(() => new Map()); // row -> {n,i,v,e}
const hits = CH.map(() => []);       // [time, peak, decay, floor]
const put = (ch, row, n, i = null, v = null, e = null) => { grid[ch].set(row, { n, i, v, e }); };

for (let bar = 0; bar < 20; bar++) {
  const c = CHORDS[bar % 4];
  const r0 = bar * 16;
  const t0 = bar * BAR;
  // keys: three stabs a bar, all minute
  put(0, r0, KEYS[c][0], '7A', '28');
  put(0, r0 + 6, KEYS[c][1], null, '20');
  put(0, r0 + 10, KEYS[c][2], null, '18');
  hits[0].push([t0, 1, 1.1, 0.4], [t0 + 6 * ROW_S, 0.8, 0.8, 0.4], [t0 + 10 * ROW_S, 0.7, 0.9, 0.4]);
  // kalimba: bars 6-15, busier in the theme section (bars 10-15)
  if (bar >= 6 && bar <= 15) {
    const notes = [...KAL[c]];
    if (bar >= 10) notes.push(KAL_EXTRA[c]);
    notes.forEach(([r, n], k) => {
      put(1, r0 + r, n, k === 0 && bar === 6 ? '7B' : null, k % 2 ? '20' : '30');
      hits[1].push([t0 + r * ROW_S, k % 2 ? 0.7 : 1, 0.45, 0]);
    });
  }
  // drums: from bar 2; kick and rim only in the break (bars 16-19)
  if (bar >= 2) {
    const brk = bar >= 16;
    put(2, r0, 'C-4', '7C', '40');
    put(2, r0 + 4, brk ? 'E-5' : 'D-4', brk ? '7E' : '7D', brk ? '20' : '30');
    put(2, r0 + 8, 'C-4', '7C', '38');
    if (!brk) put(2, r0 + 10, 'C-4', null, '20');
    put(2, r0 + 12, brk ? 'E-5' : 'D-4', brk ? '7E' : '7D', brk ? '20' : '30');
    hits[2].push([t0, 1, 0.3, 0], [t0 + 4 * ROW_S, brk ? 0.45 : 0.8, 0.22, 0], [t0 + 8 * ROW_S, 0.9, 0.3, 0], [t0 + 12 * ROW_S, brk ? 0.45 : 0.8, 0.22, 0]);
    if (!brk) hits[2].push([t0 + 10 * ROW_S, 0.6, 0.2, 0]);
  }
}
// ocean: one note, and it loops for the whole minute
put(3, 0, 'C-4', '7F', '40');

// shark_nod, bar by bar (durations inside activities.toml's ranges):
//   bars 0-8   fin circles (27 s)           sea+sky
//   bar  9     she notices and freezes (3)  her
//   bar  10    it surfaces: headphones (3)  sea+sky
//   bars 11-16 they nod to the beat (18)    both, every beat
//   bar  17    a last nod, and it sinks (3) both
//   bars 18-19 back to the music (6)        her; the sea goes quiet
put(7, 0, 'C-4', '05', '30');
put(4, 9 * 16, 'A-3', '05', '10');
put(7, 10 * 16, 'D-4', '05', '40');
for (let bar = 11; bar <= 16; bar++) {
  for (let b = 0; b < 4; b++) {
    const r = bar * 16 + b * 4;
    put(4, r, 'F-4', '05', '20');
    put(7, r, 'F-4', '05', '40');
  }
}
put(4, 17 * 16, 'F-4', '05', '20');
put(7, 17 * 16, 'E-4', '05', '40', 'A0F');
put(4, 18 * 16, '===');
put(7, 18 * 16, '===');

// scope hits for the island channels
for (let beat = 0; beat < 80; beat++) {
  const t = beat * BEAT;
  const bar = Math.floor(beat / 4);
  // her: she nods on every beat, bigger with the shark, not at all while frozen
  if (bar === 9 || bar === 10) continue;
  const nodWithShark = (bar >= 11 && bar <= 16) || (bar === 17 && beat % 4 === 0);
  hits[4].push([t, nodWithShark ? 1 : 0.32, 0.3, 0]);
}
for (let beat = 0; beat < 80; beat++) {
  const t = beat * BEAT;
  const bar = Math.floor(beat / 4);
  if (bar <= 9) hits[7].push([t, 0.62, 0.7, 0.28]);          // the fin's pulse loop
  else if (bar >= 11 && bar <= 16) hits[7].push([t, 0.9, 0.3, 0.1]); // nodding, gently
}
hits[7].push([10 * BAR, 1, 2.2, 0.1]);   // it surfaces
hits[7].push([17 * BAR, 0.85, 2.8, 0]);  // bubbles, and it sinks

// ------------------------------------------------------------------ svg parts
const defs = [];
const css = [];
const body = [];

// envelope keyframes from hits: piecewise linear, instant attack
function envelope(list, floorAtZero = 0) {
  const hs = [...list].sort((a, b) => a[0] - b[0]);
  const val = (t) => {
    let v = floorAtZero;
    for (const [th, a, d, f] of hs) {
      if (th > t + 1e-9) break;
      const k = Math.min(1, (t - th) / d);
      v = a + (f - a) * k;
    }
    return v;
  };
  const pts = [];
  pts.push([0, val(0)]);
  hs.forEach(([th, a, d], idx) => {
    const next = idx + 1 < hs.length ? hs[idx + 1][0] : LOOP;
    if (th > 0) pts.push([th - 0.02, val(th - 0.02)]);
    pts.push([th, a]);
    if (th + d < next - 0.03) pts.push([th + d, val(th + d)]);
  });
  pts.push([LOOP - 0.02, val(LOOP - 0.02)]);
  pts.push([LOOP, val(0)]);
  // value at loop end must equal value at 0 for a clean wrap
  const dedup = [];
  for (const p of pts) {
    if (p[0] < 0 || p[0] > LOOP) continue;
    if (dedup.length && Math.abs(dedup.at(-1)[0] - p[0]) < 1e-6) dedup[dedup.length - 1] = p;
    else dedup.push(p);
  }
  return { pts: dedup, val };
}

// ---- the screen
const scr = [];
scr.push(rect(0, 0, SW, SH, P.panel));

// ---- position editor (top left)
{
  scr.push(panel(0, 0, 112, 77));
  scr.push(well(3, 3, 50, 53));
  // list strip: blank, blank, 00..04, blank, blank. Window shows 5 lines; the
  // centre line is the current position.
  const LH = 10;
  const lines = ['', '', '00 00', '01 01', '02 02', '03 03', '04 04', '', ''];
  defs.push(`<clipPath id="poslist"><rect x="4" y="4" width="48" height="51"/></clipPath>`);
  scr.push(rect(4, 4 + 2 * LH + 1, 48, LH, P.panel));
  const cur = Math.floor(T0 / 12);
  let strip = `<g class="pos" transform="translate(0 ${-cur * LH})">`;
  lines.forEach((ln, k) => {
    if (!ln) return;
    strip += text(pat, ln, 13, 6 + 1 + k * LH, k - 2 === -1 ? P.yellow : P.yellow);
  });
  strip += '</g>';
  scr.push(`<g clip-path="url(#poslist)">${strip}</g>`);
  // the current line is drawn white on top, through a fixed clip
  defs.push(`<clipPath id="poscur"><rect x="4" y="${4 + 2 * LH + 1}" width="48" height="${LH}"/></clipPath>`);
  let strip2 = `<g class="pos" transform="translate(0 ${-cur * LH})">`;
  lines.forEach((ln, k) => { if (ln) strip2 += text(pat, ln, 13, 7 + k * LH, P.white); });
  strip2 += '</g>';
  scr.push(`<g clip-path="url(#poscur)">${strip2}</g>`);
  css.push(`.pos{animation:pos ${LOOP}s steps(5) infinite;animation-delay:-${T0}s}`);
  css.push(`@keyframes pos{from{transform:translate(0,0)}to{transform:translate(0,${-5 * LH}px)}}`);
  // arrows + Ins./Del.
  scr.push(arrowBtn(56, 3, true, 12, 12));
  scr.push(well(56, 17, 12, 24, '#1d3a42'));
  scr.push(arrowBtn(56, 44, false, 12, 12));
  scr.push(button(71, 3, 38, 25, 'Ins.'));
  scr.push(button(71, 31, 38, 25, 'Del.'));
  // Songlen. / Repstart
  scr.push(text(ui, 'Songlen.', 4, 59, P.white));
  scr.push(text(pat, '05', 62, 59, P.white));
  scr.push(arrowBtn(81, 58, true, 13, 9), arrowBtn(95, 58, false, 13, 9));
  scr.push(text(ui, 'Repstart', 4, 68, P.white));
  scr.push(text(pat, '00', 62, 68, P.white));
  scr.push(arrowBtn(81, 67, true, 13, 9), arrowBtn(95, 67, false, 13, 9));
}

// ---- logo plate
const LOGO = {
  C: ['.######', '#######', '##.....', '##.....', '##.....', '##.....', '##.....', '##.....', '##.....', '#######', '.######'],
  a: ['######.', '#######', '.....##', '.######', '#######', '##...##', '#######', '.######'],
  s: ['.######', '#######', '##.....', '######.', '.######', '.....##', '#######', '######.'],
  t: ['##....', '##....', '######', '######', '##....', '##....', '##....', '##....', '######', '.#####'],
  w: ['##..##..##', '##..##..##', '##..##..##', '##..##..##', '##..##..##', '##..##..##', '##########', '.########.'],
  y: ['##...##', '##...##', '##...##', '##...##', '##...##', '#######', '.######', '.....##', '.....##', '#######', '######.'],
};
// top row of each glyph, counted down from the cap line (cap height 11)
const LOGO_TOP = { C: 0, a: 3, s: 3, t: 1, w: 3, y: 3 };
// The wordmark at 2 px a unit: one path, used for shadow, outline and face.
function wordmark(x, capY, defsOut) {
  const S = 2;
  let wx = x;
  let d = '';
  for (const ch of 'Castaway') {
    const g = LOGO[ch];
    d += bitmapPath(g, wx, capY + LOGO_TOP[ch] * S, S);
    wx += (g[0].length + 1) * S;
  }
  defsOut.push(`<path id="wm" d="${d}"/>`);
  defsOut.push(`<linearGradient id="wmg" gradientUnits="userSpaceOnUse" x1="0" y1="${capY}" x2="0" y2="${capY + 22}">`
    + '<stop offset="0" stop-color="#ffffff"/><stop offset=".45" stop-color="#ffffff"/><stop offset=".55" stop-color="#bfeaf5"/><stop offset="1" stop-color="#7fcde3"/></linearGradient>');
  const out = ['<use href="#wm" x="3" y="3" fill="#0b1a1e"/>'];
  for (const [ox, oy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [2, 2], [1, 2], [2, 1]]) out.push(`<use href="#wm" x="${ox}" y="${oy}" fill="${P.dark}"/>`);
  out.push('<use href="#wm" fill="url(#wmg)"/>');
  return out;
}
{
  const X = 112;
  scr.push(panel(X, 0, 180, 40));
  // checker band: two-tone, 4 px squares
  const bandY = 7;
  const bandH = 28;
  let d1 = '';
  for (let yy = 0; yy < bandH; yy += 4) {
    for (let xx = 0; xx < 174; xx += 4) {
      if (((xx / 4) + (yy / 4)) % 2 === 0) d1 += `M${X + 3 + xx} ${bandY + yy}h4v4h-4z`;
    }
  }
  scr.push(rect(X + 3, bandY, 174, bandH, P.check1));
  scr.push(`<path fill="${P.check2}" d="${d1}"/>`);
  scr.push(rect(X + 3, bandY - 1, 174, 1, P.dark), rect(X + 3, bandY + bandH, 174, 1, P.line));
  scr.push(...wordmark(X + 7, 6, defs));
  // credit plate: a fermata over FERMATA
  const cx = X + 146;
  scr.push(rect(cx, 6, 31, 29, P.btn) + edges(cx, 6, 31, 29, P.btnHi, P.btnLo));
  const FERM = ['..#####..', '.#.....#.', '#.......#', '#.......#', '.........', '....#....'];
  scr.push(`<path fill="${P.ink}" d="${bitmapPath(FERM, cx + 11, 9)}"/>`);
  scr.push(textC(micro, 'BY', cx + 16, 17, P.ink));
  scr.push(textC(micro, 'FERMATA', cx + 16, 24, P.ink));
  scr.push(textC(micro, "'26", cx + 16, 30, '#3a3a3a'));
}

// ---- counters under the logo
{
  const X = 112;
  scr.push(panel(X, 40, 180, 37));
  const row = (y, label, val, lx, vx, ax) => text(ui, label, lx, y + 1, P.white) + textR(pat, val, vx, y + 1, P.white)
    + arrowBtn(ax, y, true, 11, 9) + arrowBtn(ax + 12, y, false, 11, 9);
  scr.push(row(43, 'BPM', '080', 116, 160, 163));
  scr.push(row(54, 'Spd.', '06', 116, 160, 163));
  scr.push(row(65, 'Add.', '01', 116, 160, 163));
  // Ptn. shows the current pattern: a strip of 00..04 behind a one-line clip
  scr.push(text(ui, 'Ptn.', 194, 44, P.white));
  defs.push(`<clipPath id="ptnclip"><rect x="236" y="43" width="12" height="9"/></clipPath>`);
  let strip = `<g class="ptn" transform="translate(0 ${-Math.floor(T0 / 12) * 10})">`;
  for (let k = 0; k < 5; k++) strip += text(pat, `0${k}`, 237, 44 + k * 10, P.white);
  scr.push(`<g clip-path="url(#ptnclip)">${strip}</g></g>`);
  css.push(`.ptn{animation:ptn ${LOOP}s steps(5) infinite;animation-delay:-${T0}s}`);
  css.push(`@keyframes ptn{from{transform:translate(0,0)}to{transform:translate(0,-50px)}}`);
  scr.push(arrowBtn(254, 43, true, 11, 9), arrowBtn(266, 43, false, 11, 9));
  scr.push(text(ui, 'Ln.', 194, 55, P.white), textR(pat, '040', 251, 55, P.white));
  scr.push(arrowBtn(254, 54, true, 11, 9), arrowBtn(266, 54, false, 11, 9));
  scr.push(button(194, 65, 41, 10, 'Expd.'), button(237, 65, 41, 10, 'Srnk.'));
}

// ---- status strip
{
  scr.push(panel(0, 77, 292, 15));
  scr.push(text(ui, 'Avail.', 4, 81, P.white), text(ui, 'all day', 34, 81, P.yellow));
  scr.push(text(ui, 'Signal', 92, 81, P.white), text(ui, '0 bars', 124, 81, P.yellow));
  scr.push(text(ui, 'Time', 205, 81, P.white));
  scr.push(text(pat, '00:00:', 230, 81, P.white));
  // seconds: tens strip 0-5 (60 s) and units strip 0-9 (10 s)
  defs.push(`<clipPath id="tclip"><rect x="266" y="80" width="12" height="9"/></clipPath>`);
  const tens = Math.floor(T0 / 10);
  const units = Math.floor(T0) % 10;
  let t1 = `<g class="tt" transform="translate(0 ${-tens * 10})">`;
  for (let k = 0; k < 6; k++) t1 += text(pat, `${k}`, 266, 81 + k * 10, P.white);
  t1 += '</g>';
  let t2 = `<g class="tu" transform="translate(0 ${-units * 10})">`;
  for (let k = 0; k < 10; k++) t2 += text(pat, `${k}`, 272, 81 + k * 10, P.white);
  t2 += '</g>';
  scr.push(`<g clip-path="url(#tclip)">${t1}${t2}</g>`);
  css.push(`.tt{animation:tt ${LOOP}s steps(6) infinite;animation-delay:-${T0}s}`);
  css.push(`@keyframes tt{from{transform:translate(0,0)}to{transform:translate(0,-60px)}}`);
  css.push(`.tu{animation:tu 10s steps(10) infinite;animation-delay:-${fmt(T0 % 10)}s}`);
  css.push(`@keyframes tu{from{transform:translate(0,0)}to{transform:translate(0,-100px)}}`);
}

// ---- scopes: 2 rows of 4, numbered from 0
{
  scr.push(panel(0, 92, 292, 81));
  const CW = 72;
  const CHH = 39;
  // wave shapes: [period px, scroll seconds, amplitude px, fn]
  let seed = 1992;
  const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  const noise = (n, smooth) => {
    let a = Array.from({ length: n }, () => rnd() * 2 - 1);
    for (let s = 0; s < smooth; s++) a = a.map((v, i) => (a[(i - 1 + n) % n] + 2 * v + a[(i + 1) % n]) / 4);
    const m = Math.max(...a.map(Math.abs));
    return a.map((v) => v / m);
  };
  const oceanN = noise(64, 3);
  const drumN = noise(36, 1);
  const WAVES = [
    { per: 24, dur: 0.6, amp: 12, f: (x) => 0.75 * Math.sin(2 * Math.PI * x / 24) + 0.25 * Math.sin(4 * Math.PI * x / 24 + 0.6) },
    { per: 12, dur: 0.3, amp: 12, f: (x) => 0.85 * Math.sin(2 * Math.PI * x / 12) + 0.15 * Math.sin(6 * Math.PI * x / 12) },
    { per: 36, dur: 0.45, amp: 13, f: (x) => 0.6 * Math.sin(2 * Math.PI * x / 36) + 0.4 * drumN[((x % 36) + 36) % 36] },
    { per: 64, dur: 2.4, amp: 8, f: (x) => oceanN[((x % 64) + 64) % 64] },
    { per: 20, dur: 0.75, amp: 11, f: (x) => Math.sin(2 * Math.PI * x / 20) },
    { per: 72, dur: 6, amp: 1.4, f: (x) => Math.sin(2 * Math.PI * x / 72) },
    { per: 72, dur: 6, amp: 0, f: () => 0 },
    { per: 16, dur: 0.5, amp: 11, f: (x) => (Math.sin(2 * Math.PI * x / 16) > 0 ? 0.8 : -0.8) * (0.7 + 0.3 * Math.sin(2 * Math.PI * x / 32 * 2)) },
  ];
  for (let k = 0; k < 8; k++) {
    const cx = 2 + (k % 4) * CW;
    const cy = 94 + Math.floor(k / 4) * (CHH + 1);
    const w = CW - 2;
    scr.push(well(cx, cy, w, CHH));
    // waveform: a periodic polyline, scrolled one period, clipped to the cell
    const wv = WAVES[k];
    const midY = cy + 23;
    defs.push(`<clipPath id="sc${k}"><rect x="${cx + 1}" y="${cy + 1}" width="${w - 2}" height="${CHH - 2}"/></clipPath>`);
    let d = '';
    for (let x = -wv.per; x <= w + wv.per; x++) {
      const y = Math.round(-wv.amp * wv.f(x));
      d += `${x === -wv.per ? 'M' : 'L'}${x} ${y}`;
    }
    const env = k === 3 || k === 5 || k === 6 ? null : envelope(hits[k]);
    const e0 = env ? env.val(T0) : 1;
    let g = `<g clip-path="url(#sc${k})"><g transform="translate(${cx + 1} ${midY})">`;
    g += `<g class="e${k}" transform="scale(1 ${fmt(e0)})">`;
    const off = (T0 % wv.dur) / wv.dur * wv.per;
    g += `<g class="w${k}" transform="translate(${fmt(-off)} 0)"><path d="${d}" fill="none" stroke="${P.trace}" stroke-width="1" vector-effect="non-scaling-stroke"/></g>`;
    g += '</g></g></g>';
    scr.push(g);
    css.push(`.w${k}{animation:w${k} ${wv.dur}s linear infinite;animation-delay:-${fmt(T0 % wv.dur)}s}`);
    css.push(`@keyframes w${k}{from{transform:translate(0,0)}to{transform:translate(${-wv.per}px,0)}}`);
    if (env) {
      const kf = env.pts.map(([t, v]) => `${pct(t)}{transform:scaleY(${num(v)})}`).join('');
      css.push(`.e${k}{animation:e${k} ${LOOP}s linear infinite;animation-delay:-${T0}s}`);
      css.push(`@keyframes e${k}{${kf}}`);
    }
    // number, name and REC tag
    scr.push(text(ui, `${k}`, cx + 3, cy + 3, P.white));
    scr.push(text(ui, CH[k], cx + 10, cy + 3, '#bfe9f5'));
    scr.push(text(micro, 'REC', cx + w - 14, cy + CHH - 7, '#5f7f88'));
  }
}

// ---- button columns
{
  scr.push(panel(292, 0, 124, 173));
  const COL1 = ['About', 'Nibbles', 'Zzz', 'Nod', 'Extend', 'Drift', 'Wait', 'Wait more', 'Adv. Wait', 'Idle'];
  const COL2 = ['Play sng.', 'Play ptn.', 'Stop', 'Rec. sng.', 'Rec. ptn.', 'Disk op.', 'Instr. Ed.', 'Smp. Ed.', 'Config', 'Help'];
  for (let i = 0; i < 10; i++) {
    const y = 3 + i * 17;
    if (COL1[i] === 'Nod') {
      // two layers: up, and down on top of it, shown on every beat but the frozen ones
      scr.push(button(295, y, 58, 15, 'Nod'));
      const press = [];
      for (let beat = 0; beat < 80; beat++) {
        const bar = Math.floor(beat / 4);
        if (bar === 9 || bar === 10) continue;
        press.push(beat * BEAT);
      }
      const down = press.some((t) => T0 >= t && T0 < t + 0.25);
      let kf = '0%{opacity:0}';
      for (const t of press) kf += `${pct(t)}{opacity:1}${pct(t + 0.25)}{opacity:0}`;
      kf += '100%{opacity:0}';
      scr.push(`<g class="nod" opacity="${down ? 1 : 0}">${button(295, y, 58, 15, 'Nod', { down: true })}</g>`);
      css.push(`.nod{animation:nod ${LOOP}s step-end infinite;animation-delay:-${T0}s}`);
      css.push(`@keyframes nod{${kf}}`);
    } else {
      scr.push(button(295, y, 58, 15, COL1[i]));
    }
    scr.push(button(355, y, 58, 15, COL2[i]));
  }
}

// ---- the mouse pointer, parked on Nod: somebody is clicking it on every beat
{
  const ARROW = [
    'X..........', 'XX.........', 'XWX........', 'XWWX.......', 'XWWWX......', 'XWWWWX.....',
    'XWWWWWX....', 'XWWWWWWX...', 'XWWWWWWWX..', 'XWWWWXXXXX.', 'XWWXWWX....', 'XWX.XWWX...',
    'XX..XWWX...', 'X....XWWX..', '.....XWWX..', '......XX...',
  ];
  const px = 337;
  const py = 61;
  const only = (c) => ARROW.map((r) => r.replace(new RegExp(`[^${c}]`, 'g'), '.').replace(new RegExp(c, 'g'), '#'));
  scr.push(`<path fill="${P.ink}" d="${bitmapPath(only('X'), px, py)}"/><path fill="${P.white}" d="${bitmapPath(only('W'), px, py)}"/>`);
}

// ---- instrument list, range buttons, sample list, song name
{
  scr.push(panel(416, 0, 173, 173));
  scr.push(well(418, 2, 169, 90));
  INSTR.forEach((name, i) => {
    const y = 3 + i * 11;
    const sel = i === SEL_INSTR;
    if (sel) scr.push(rect(419, y, 167, 11, P.white));
    scr.push(text(pat, `0${i + 1}`, 421, y + 2, sel ? P.ink : P.yellow));
    scr.push(text(ui, name, 438, y + 2, sel ? P.ink : P.white));
  });
  // sample list with scrollbar
  scr.push(well(418, 94, 169, 57));
  const SEL_T = [[0, 0], [10 * BAR, 1], [17 * BAR, 2]]; // [start time, sample]
  const selAt = (t) => SEL_T.filter(([s]) => t >= s).at(-1)[1];
  SAMPLES.forEach((name, i) => {
    const y = 95 + i * 11;
    scr.push(text(pat, `0${i}`, 421, y + 2, P.yellow));
    if (name) scr.push(text(ui, name, 438, y + 2, P.white));
  });
  // the inverted line: one layer per state
  SEL_T.forEach(([start, idx], k) => {
    const end = k + 1 < SEL_T.length ? SEL_T[k + 1][0] : LOOP;
    const y = 95 + idx * 11;
    const on = selAt(T0) === idx;
    let layer = rect(419, y, 153, 11, P.white) + text(pat, `0${idx}`, 421, y + 2, P.ink) + text(ui, SAMPLES[idx], 438, y + 2, P.ink);
    scr.push(`<g class="sl${k}" opacity="${on ? 1 : 0}">${layer}</g>`);
    let kf = '';
    if (start === 0) kf = `0%{opacity:1}${pct(end)}{opacity:0}100%{opacity:1}`;
    else kf = `0%{opacity:0}${pct(start)}{opacity:1}${pct(end)}{opacity:0}100%{opacity:0}`;
    css.push(`.sl${k}{animation:sl${k} ${LOOP}s step-end infinite;animation-delay:-${T0}s}`);
    css.push(`@keyframes sl${k}{${kf}}`);
  });
  // scrollbar
  scr.push(arrowBtn(574, 95, true, 12, 11));
  scr.push(rect(574, 107, 12, 31, '#2a4a52'));
  scr.push(rect(575, 108, 10, 12, P.btn) + edges(575, 108, 10, 12, P.btnHi, P.btnLo));
  scr.push(arrowBtn(574, 139, false, 12, 11));
  // song name
  scr.push(well(418, 153, 169, 17));
  scr.push(text(ui, 'castaway  10:00:00  seed 1992', 422, 158, P.white));
  // range buttons + Swap Bank
  scr.push(panel(589, 0, 51, 173));
  const RANGES = ['01-08', '09-10', '11-18', '19-20', '21-28', '29-30', '31-38', '39-40'];
  RANGES.forEach((lab, i) => scr.push(button(591, 2 + i * 18, 47, 16, lab, { down: i === 0 })));
  scr.push(button(591, 147, 47, 24, ['Swap', 'Bank']));
}

// ---- pattern editor
{
  const PY = 173;
  scr.push(panel(0, PY, SW, SH - PY));
  scr.push(well(2, PY + 2, SW - 4, SH - PY - 4));
  const X0 = 24;      // channel 0 left edge
  const CP = 74;      // channel pitch
  const RH = 9;       // row pitch
  const TOP = PY + 13; // first visible row
  const VIS = 23;
  const BAND = TOP + 11 * RH; // the current row
  // header: channel number and lane name
  scr.push(rect(3, PY + 3, SW - 6, 10, '#0c1c20'));
  for (let k = 0; k < 8; k++) {
    const x = X0 + k * CP;
    scr.push(text(pat, `${k}`, x + 3, PY + 4, P.yellow));
    scr.push(text(ui, CH[k], x + 12, PY + 4, P.white));
  }
  // separators
  let sep = '';
  for (let k = 0; k <= 8; k++) sep += `M${X0 + k * CP - 1} ${PY + 3}h1v${SH - PY - 6}h-1z`;
  scr.push(`<path fill="${P.panel}" d="${sep}"/>`);
  scr.push(rect(3, TOP - 1, SW - 6, 1, P.panel));
  // current-row band
  scr.push(rect(3, BAND - 1, SW - 6, RH, P.band));
  // dots tile for empty fields, aligned to channel 0 and the row grid
  const FIELDS = [[3, 3], [24, 2], [39, 2], [54, 3]];
  let dd = '';
  for (const [fx, n] of FIELDS) for (let c = 0; c < n; c++) for (const dx of [0, 2, 4]) dd += `M${fx + c * 6 + dx} 6h1v1h-1z`;
  defs.push(`<pattern id="dots" patternUnits="userSpaceOnUse" x="${X0}" y="${BAND}" width="${CP}" height="${RH}"><path fill="${P.dots}" d="${dd}"/></pattern>`);
  // unique cell symbols
  const cellIds = new Map();
  const cellDef = (c) => {
    const key = `${c.n}|${c.i}|${c.v}|${c.e}`;
    if (!cellIds.has(key)) {
      const id = `c${cellIds.size.toString(36)}`;
      let s = '';
      const parts = [c.n, c.i, c.v, c.e];
      FIELDS.forEach(([fx, n], f) => {
        const v = parts[f];
        if (v) {
          let cx = fx;
          for (const ch of v) { s += `<use href="#${pat.id(ch)}" x="${cx}"/>`; cx += 6; }
        } else {
          let d = '';
          for (let k = 0; k < n; k++) for (const dx of [0, 2, 4]) d += `M${fx + k * 6 + dx} 6h1v1h-1z`;
          s += `<path fill="${P.dots}" d="${d}"/>`;
        }
      });
      defs.push(`<g id="${id}" fill="${P.yellow}">${s}</g>`);
      cellIds.set(key, id);
    }
    return cellIds.get(key);
  };
  // strip: rows -11 .. ROWS+11, row r at y = BAND + r*RH
  const R_FROM = -11;
  const R_TO = ROWS + 11;
  let strip = '';
  for (let k = 0; k < 8; k++) {
    const x = X0 + k * CP;
    let runStart = null;
    const flush = (rEnd) => {
      if (runStart === null) return;
      strip += `<rect x="${x}" y="${BAND + runStart * RH}" width="${CP - 1}" height="${(rEnd - runStart) * RH}" fill="url(#dots)"/>`;
      runStart = null;
    };
    for (let r = R_FROM; r <= R_TO; r++) {
      const c = grid[k].get(((r % ROWS) + ROWS) % ROWS);
      if (c) {
        flush(r);
        strip += `<use href="#${cellDef(c)}" x="${x}" y="${BAND + r * RH}"/>`;
      } else if (runStart === null) runStart = r;
    }
    flush(R_TO + 1);
  }
  // row numbers, both edges: one 64-row symbol, used per pattern
  let rn = '';
  for (let r = 0; r < 64; r++) {
    const h = r.toString(16).toUpperCase().padStart(2, '0');
    rn += text(pat, h, 0, r * RH, r % 16 === 0 ? P.barNum : r % 4 === 0 ? P.yellow : P.rowDim);
  }
  defs.push(`<g id="rownums">${rn}</g>`);
  for (let p = -1; p <= 5; p++) {
    strip += `<use href="#rownums" x="7" y="${BAND + p * 64 * RH}"/>`;
    strip += `<use href="#rownums" x="${SW - 20}" y="${BAND + p * 64 * RH}"/>`;
  }
  defs.push(`<clipPath id="rows"><rect x="3" y="${TOP - 1}" width="${SW - 6}" height="${VIS * RH}"/></clipPath>`);
  scr.push(`<g clip-path="url(#rows)"><g class="scroll" transform="translate(0 ${-ROW0 * RH})">${strip}</g></g>`);
  css.push(`.scroll{animation:scroll ${LOOP}s steps(${ROWS}) infinite;animation-delay:-${T0}s}`);
  css.push(`@keyframes scroll{from{transform:translate(0,0)}to{transform:translate(0,${-ROWS * RH}px)}}`);
}

// ------------------------------------------------------------------ assemble
css.push('@media (prefers-reduced-motion:reduce){*{animation:none!important}}');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" shape-rendering="crispEdges">`
  + `<title>Castaway</title>`
  + `<style>${css.join('')}</style>`
  + `<defs>${ui.defs()}${pat.defs()}${micro.defs()}${defs.join('')}</defs>`
  + `<rect width="${W}" height="${H}" rx="8" fill="#0a1214"/>`
  + `<g transform="translate(${BZ} ${BZ})">${scr.join('')}</g>`
  + `</svg>\n`;
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, svg);
console.log(`wrote ${path.relative(process.cwd(), OUT)} (${(svg.length / 1024).toFixed(1)} KB)`);

// ======================================================================
// The About screen (the easter egg behind the About button): the top half
// of the tracker swapped for a picture of the island and a credits box.
// The picture is my own pixel art at 2 px a pixel, built from shapes on a
// grid in this file: sky and sea in stepped VGA-style bands, one tall slender
// palm with a segmented reddish-tan trunk, a raft, and her: small, sitting in
// the palm's shade in cream headphones, coral tank top and cream shorts,
// nodding on the beat. The cat is asleep in the palm, and a fin wearing a
// cream headband crosses the far water now and then. Always daytime.
// ======================================================================
{
  const AW = 158;
  const AH = 81;
  const PX = 2;
  const ui2 = makeFont('u', UI, { space: 3 });
  const micro2 = makeFont('m', MICRO, { space: 2 });
  const aDefs = [];
  const aCss = [];
  const a = [];

  const grid = Array.from({ length: AH }, () => Array(AW).fill(null));
  const set = (x, y, c) => { x = Math.round(x); y = Math.round(y); if (x >= 0 && x < AW && y >= 0 && y < AH) grid[y][x] = c; };
  const HZ = 33; // horizon row
  const SKY = ['#5cb6e9', '#6dc0ee', '#80caf2', '#94d4f5', '#a9ddf7', '#bfe6f9'];
  const SEA = ['#3d9fd2', '#3593ca', '#2d87c0', '#257bb5', '#1f70aa'];
  for (let y = 0; y < AH; y++) {
    for (let x = 0; x < AW; x++) {
      if (y < HZ) {
        const f = y / HZ * SKY.length;
        let i = Math.floor(f);
        // checker dither at each band edge
        if (f - i > 0.7 && i + 1 < SKY.length && (x + y) % 2 === 0) i++;
        set(x, y, SKY[Math.min(i, SKY.length - 1)]);
      } else if (y === HZ) set(x, y, '#d6f1fb');
      else {
        const f = (y - HZ - 1) / (AH - HZ - 1) * SEA.length;
        let i = Math.floor(f);
        if (f - i > 0.7 && i + 1 < SEA.length && (x + y) % 2 === 0) i++;
        set(x, y, SEA[Math.min(i, SEA.length - 1)]);
      }
    }
  }
  // sun, top right
  for (let y = 0; y < 20; y++) for (let x = 120; x < AW; x++) {
    const d = Math.hypot(x - 138, y - 9);
    if (d <= 5.2) set(x, y, '#fff7cf');
    else if (d <= 6.4) set(x, y, '#e2f5fc');
  }
  // a few long light streaks on the water
  const streaks = [[8, 38, 14], [30, 41, 9], [104, 39, 18], [131, 44, 12], [12, 52, 10], [140, 55, 9], [20, 70, 12], [118, 76, 15], [64, 78, 10]];
  for (const [x, y, w] of streaks) for (let k = 0; k < w; k++) set(x + k, y, '#5fb3e0');
  // island: foam ring, wet sand, dry sand, shade
  const CX = 80;
  const CY = 64;
  const inEll = (x, y, rx, ry) => ((x - CX) / rx) ** 2 + ((y - CY) / ry) ** 2 <= 1;
  for (let y = 40; y < AH; y++) for (let x = 0; x < AW; x++) {
    if (inEll(x, y, 47, 11.5)) set(x, y, '#e9f8fd');
    if (inEll(x, y, 45, 10.2)) set(x, y, '#c9a566');
    if (inEll(x, y, 43, 9.2)) set(x, y, y > CY + 3 ? '#e3c182' : '#f2d99d');
    if (inEll(x, y, 43, 9.2) && y > CY + 6) set(x, y, '#d4b06f');
  }
  // the shade she sits in
  for (let y = 56; y < 70; y++) for (let x = 56; x < 110; x++) {
    const inShade = ((x - 86) / 20) ** 2 + ((y - 61) / 3.2) ** 2 <= 1;
    if (inShade && inEll(x, y, 43, 9.2)) set(x, y, '#dcbd80');
  }
  // bushes
  const bush = (bx, by, r) => {
    for (let y = by - r; y <= by + 1; y++) for (let x = bx - r - 2; x <= bx + r + 2; x++) {
      if (((x - bx) / (r + 2)) ** 2 + ((y - by) / r) ** 2 <= 1) set(x, y, y < by - r / 2 ? '#62ad53' : '#468f3f');
    }
  };
  bush(46, 58, 3); bush(53, 57, 4); bush(112, 58, 3);
  // raft, pulled up at the waterline on the right: five logs lashed twice
  for (let k = 0; k < 5; k++) {
    const y = 62 + k * 2;
    const x0 = 116 + (k % 2);
    for (let x = x0; x < x0 + 17; x++) {
      set(x, y, '#b98547');
      set(x, y + 1, '#8c5e30');
    }
    set(x0, y, '#d9a868'); set(x0 + 16, y, '#d9a868');
  }
  for (let y = 62; y < 72; y++) { set(119, y, '#ead6a2'); set(130, y, '#ead6a2'); }
  for (let x = 114; x < 136; x++) if (grid[72][x] !== '#b98547') set(x, 72, '#e9f8fd');
  // palm trunk: a quadratic curve, leaning left then up, segmented
  const B = [66, 63];
  const C = [56, 36];
  const T = [70, 13];
  let segLen = 0;
  let prev = null;
  for (let i = 0; i <= 400; i++) {
    const t = i / 400;
    const x = (1 - t) ** 2 * B[0] + 2 * (1 - t) * t * C[0] + t * t * T[0];
    const y = (1 - t) ** 2 * B[1] + 2 * (1 - t) * t * C[1] + t * t * T[1];
    if (prev) segLen += Math.hypot(x - prev[0], y - prev[1]);
    prev = [x, y];
    const w = t < 0.15 ? 2.6 : 2;
    const band = Math.floor(segLen / 3.2) % 2;
    for (let dx = -w; dx <= w; dx++) {
      const col = dx >= w - 0.6 ? '#7d4526' : band ? '#b5703f' : '#9a5a31';
      set(x + dx, y, col);
    }
  }
  // fronds: drooping curves from the crown, light on top, dark underneath
  const fronds = [[-26, 2, -6], [-20, 12, -3], [-9, 15, 0], [10, 14, 2], [22, 10, 4], [25, 1, -5], [13, -6, -6], [-14, -6, -6]];
  for (const [dx, dy, lift] of fronds) {
    for (let i = 0; i <= 80; i++) {
      const t = i / 80;
      const x = T[0] + dx * t;
      const y = T[1] + dy * t + lift * Math.sin(Math.PI * t) + 6 * t * t;
      const th = t < 0.75 ? 1 : 0;
      set(x, y + 1, '#2b6c30');
      for (let k = -th; k <= 0; k++) set(x, y + k, '#43a047');
      if (i % 8 === 4 && t > 0.2) { set(x, y + 2, '#2b6c30'); set(x + Math.sign(dx), y + 2, '#2b6c30'); }
    }
  }
  // coconuts under the crown
  for (const [x, y] of [[68, 15], [71, 16], [73, 14]]) { set(x, y, '#6a4526'); set(x + 1, y, '#6a4526'); set(x, y + 1, '#4f321b'); set(x + 1, y + 1, '#6a4526'); }
  // the cat, asleep on the fronds: grey tabby, white chest
  const CAT = ['.g..g...', '.gggg...', 'gwggsgsg', 'gwgsgsgg', '.ggggggg'];
  const CATP = { g: '#8d939a', s: '#5f646b', w: '#f4f4f2' };
  CAT.forEach((row, y) => [...row].forEach((c, x) => { if (CATP[c]) set(76 + x, 7 + y, CATP[c]); }));
  // her body (static): sitting in the shade, facing us. The head is its own layer.
  const HER_BODY = [
    '...sss.....',
    '..ccccccc..',
    '.scccccccs.',
    '.scccccccs.',
    '.s.ccccc.s.',
    '..sWWWWWs..',
    'sssWWWWWsss',
    '.sssssssss.',
  ];
  const HER_HEAD = [
    '....hhh....',
    '...WWWWW...',
    '..WhhhhhW..',
    '.WWhsssshWW',
    '.WWhsssshWW',
    '...hssssh..',
  ];
  const HP = { s: '#e9b48b', c: '#e8735f', W: '#f4e7c6', h: '#6b4226' };
  const HX = 86;
  const HY = 47;
  HER_BODY.forEach((row, y) => [...row].forEach((c, x) => { if (HP[c]) set(HX + x, HY + 6 + y, HP[c]); }));

  // ---- emit the static picture: one merged path per colour
  const byColour = new Map();
  grid.forEach((row, y) => row.forEach((c, x) => {
    if (!c) return;
    if (!byColour.has(c)) byColour.set(c, Array.from({ length: AH }, () => Array(AW).fill('.')));
    byColour.get(c)[y][x] = '#';
  }));
  const OX = 5;
  const OY = 5;
  let pic = '';
  for (const [c, rows] of byColour) pic += `<path fill="${c}" d="${bitmapPath(rows.map((r) => r.join('')), OX, OY, PX)}"/>`;

  // ---- moving layers
  const spritePath = (rows, pal, ox, oy) => Object.entries(pal).map(([k, col]) => {
    const d = bitmapPath(rows.map((r) => [...r].map((c) => (c === k ? '#' : '.')).join('')), ox, oy, PX);
    return d ? `<path fill="${col}" d="${d}"/>` : '';
  }).join('');
  // clouds drift left: two copies one picture-width apart, clipped to the sky
  const CLOUD = ['...wwww.....', '.wwwwwwww...', 'wwwwwwwwwww.', '.gggggggggg.'];
  const CLOUD2 = ['..www....', '.wwwwww..', 'wwwwwwwww', '.ggggggg.'];
  let clouds = '';
  for (const k of [0, 1]) {
    clouds += spritePath(CLOUD, { w: '#ffffff', g: '#d9eff9' }, OX + (18 + k * AW) * PX, OY + 6 * PX);
    clouds += spritePath(CLOUD2, { w: '#ffffff', g: '#d9eff9' }, OX + (100 + k * AW) * PX, OY + 15 * PX);
  }
  aDefs.push(`<clipPath id="sky"><rect x="${OX}" y="${OY}" width="${AW * PX}" height="${HZ * PX}"/></clipPath>`);
  const CLOUD_S = 48;
  const cloudLayer = `<g clip-path="url(#sky)"><g class="cl">${clouds}</g></g>`;
  aCss.push(`.cl{animation:cl ${CLOUD_S}s linear infinite}@keyframes cl{from{transform:translate(0,0)}to{transform:translate(${-AW * PX}px,0)}}`);
  // the fin, crossing the far water every 16 s, headband and all
  const FIN = ['..k..', '.kWk.', '.kkkk', 'kkkkk'];
  const finSprite = spritePath(FIN, { k: '#55626e', W: '#f4e7c6' }, 0, 0);
  aDefs.push(`<clipPath id="sea"><rect x="${OX}" y="${OY + (HZ + 1) * PX}" width="${AW * PX}" height="${(AH - HZ - 1) * PX}"/></clipPath>`);
  const FIN_S = 16;
  const finY = OY + 40 * PX;
  const finX0 = OX + AW * PX + 10;
  const finX1 = OX - 20;
  // static (reduced-motion) position: off to the right, out of the picture
  const finLayer = `<g clip-path="url(#sea)"><g class="fin" transform="translate(${finX0} ${finY})">${finSprite}`
    + '<path fill="#e9f8fd" d="M-2 8h14v1h-14z"/></g></g>';
  aCss.push(`.fin{animation:fin ${FIN_S}s linear infinite}@keyframes fin{0%{transform:translate(${finX0}px,${finY}px)}55%{transform:translate(${finX1}px,${finY}px)}100%{transform:translate(${finX1}px,${finY}px)}}`);
  // her head: nods down one pixel on every beat
  const headLayer = `<g class="nodhead">${spritePath(HER_HEAD, HP, OX + HX * PX, OY + HY * PX)}</g>`;
  aCss.push(`.nodhead{animation:nh ${BEAT}s step-end infinite}@keyframes nh{0%{transform:translate(0,${PX}px)}33%{transform:translate(0,0)}100%{transform:translate(0,0)}}`);
  // the cat's z, rising and fading
  const Z = ['###', '..#', '.#.', '#..', '###'];
  const zLayer = `<g class="zz"><path fill="#ffffff" d="${bitmapPath(Z, OX + 86 * PX, OY + 2 * PX, 1)}"/></g>`;
  aCss.push('.zz{animation:zz 3s linear infinite}@keyframes zz{0%{transform:translate(0,4px);opacity:0}20%{opacity:1}80%{opacity:1}100%{transform:translate(3px,-6px);opacity:0}}');
  // glints on the water: two sets swapping on the beat
  const G1 = [[22, 45], [52, 39], [96, 43], [128, 50], [146, 68], [36, 74]];
  const G2 = [[14, 48], [66, 37], [110, 41], [138, 61], [28, 66], [104, 77]];
  const glint = (pts, cls) => `<path class="${cls}" fill="#e2f6fd" d="${pts.map(([x, y]) => `M${OX + x * PX} ${OY + y * PX}h${2 * PX}v${PX}h${-2 * PX}z`).join('')}"/>`;
  aCss.push(`.g1{animation:g1 ${BEAT * 2}s step-end infinite}.g2{animation:g1 ${BEAT * 2}s step-end infinite;animation-delay:-${BEAT}s}@keyframes g1{0%{opacity:1}50%{opacity:0}}`);

  // ---- the screen around it
  const SW2 = 640;
  const SH2 = 172;
  a.push(rect(0, 0, SW2, SH2, P.panel), edges(0, 0, SW2, SH2, P.line, P.dark));
  a.push(well(3, 3, AW * PX + 4, AH * PX + 4));
  a.push(pic, cloudLayer, finLayer, glint(G1, 'g1'), glint(G2, 'g2'), headLayer, zLayer);
  // credits box
  const RX = 330;
  a.push(well(RX, 3, SW2 - RX - 3, SH2 - 6, '#1d3a42'));
  a.push(...wordmark(RX + 10, 9, aDefs));
  a.push(text(ui2, 'about', RX + 160, 26, '#bfe9f5'));
  const lines = [
    'an island, a palm, a raft, and ten hours.',
    'she nods. now and then, always on the beat,',
    'something happens. then she nods.',
  ];
  lines.forEach((l, i) => a.push(text(ui2, l, RX + 10, 44 + i * 11, P.white)));
  const leaders = [
    ['patterns, plate, pixels', 'Fermata'],
    ['sound', 'code, all of it'],
    ['daylight', 'all of it'],
    ['rests', 'most of it'],
  ];
  const LX1 = RX + 10;
  const LX2 = SW2 - 16;
  leaders.forEach(([k, v], i) => {
    const y = 84 + i * 11;
    a.push(text(ui2, k, LX1, y, '#bfe9f5'));
    a.push(textR(ui2, v, LX2, y, P.yellow));
    const from = LX1 + ui2.width(k) + 4;
    const to = LX2 - ui2.width(v) - 4;
    let d = '';
    for (let x = from + (3 - (from % 3)) % 3; x < to; x += 3) d += `M${x} ${y + 6}h1v1h-1z`;
    a.push(`<path fill="#5f8f9c" d="${d}"/>`);
  });
  a.push(text(ui2, 'greets: the shark, the cat, the turtle, the crab, the bottle.', LX1, 134, '#8fc4d2'));
  a.push(button(SW2 - 62, SH2 - 24, 52, 16, 'Exit', { font: ui2 }));
  a.push(text(micro2, "FERMATA '26", RX + 10, SH2 - 16, '#5f8f9c'));

  aCss.push('@media (prefers-reduced-motion:reduce){*{animation:none!important}}');
  const W2 = SW2 + 2 * BZ;
  const H2 = SH2 + 2 * BZ;
  const svg2 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W2} ${H2}" width="${W2}" height="${H2}" shape-rendering="crispEdges">`
    + '<title>Castaway: About</title>'
    + `<style>${aCss.join('')}</style>`
    + `<defs>${ui2.defs()}${micro2.defs()}${aDefs.join('')}</defs>`
    + `<rect width="${W2}" height="${H2}" rx="8" fill="#0a1214"/>`
    + `<g transform="translate(${BZ} ${BZ})">${a.join('')}</g>`
    + '</svg>\n';
  fs.writeFileSync(OUT_ABOUT, svg2);
  console.log(`wrote ${path.relative(process.cwd(), OUT_ABOUT)} (${(svg2.length / 1024).toFixed(1)} KB)`);
}
