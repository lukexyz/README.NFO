#!/usr/bin/env node
// Castaway header 42: the ten-hour video, tracked as a chiptune.
//
// Style: the modern multi-chip tracker (catalogue entry trk-07: the FamiTracker / DefleMask /
// Furnace family). A black pattern grid whose columns are named hardware voices, colour-coded
// fields (note and instrument green, volume blue, effect pink, beat rows yellow), a fixed play
// row the pattern steps under, an order matrix at top left, an instrument list with little
// icons at top right, a rounded master scope, channel tabs with segmented level meters, a grid
// of per-channel mini scopes captioned by channel, and a piano strip with the sounding keys lit.
// Nothing of those programs is reproduced: no names, logos, icons, fonts or songs. The tracker
// here, "outrigger", is invented, and so are its three chips (ISLE-4, LOFI-3, PCM-0).
//
// The joke is that it is not a song. It is the schedule.
//   * One row is one beat of the theme (0.75 s at 80 BPM). A pattern is 80 rows: one pass of
//     the 60-second theme, which is also one minute of the video. A frame is a minute, so the
//     ten-hour run is 600 frames (0x000-0x257) and 48,000 rows.
//   * Channels 1-4 (chip ISLE-4) are the lanes from activities.toml: her, the sea and sky, the
//     visitors (the cat's and the turtle's lanes, sharing a channel here) and the shore. An
//     activity is a note. Every activity starts on the next bar, so island notes only ever land
//     on bar rows (every fourth row, the yellow ones).
//   * The pattern shown is frame 0x18: minute 24 of the default run, seed 1992, as
//     `python -B tools/schedule.py --json` simulated it on 2026-10-01. At 0:24:09 (row 0x0C) she
//     starts a coconut; at 0:24:18 (row 0x18), three bars later, a ship starts across the
//     horizon on the sea-and-sky lane. The schedule grows every few hours, so later runs differ;
//     the data is baked in here so the banner does not change under anyone's feet.
//   * The order matrix is the real pattern numbering of that run for frames 0x14-0x1C (each
//     lane gets a new pattern number whenever a minute's notes differ; 00 is an empty minute).
//     The theme channels are pattern 00 in every frame, because the theme is one loop.
//   * Channels 5-7 (chip LOFI-3) are the theme, arranged from tools/make_audio.py (CHORDS,
//     PROGRESSION, MELODY, render_pass): keys strum on beats 1 and 3-and, bass root / fifth /
//     chromatic lead-in, kick and snare (bars 3-16) and kick and rim (bars 17-20). Half-beat
//     offbeats are written as note delays (G06 at speed 12). It is a sketch, not a full
//     transcription: hats, fills and the swing are left out, and the kalimba melody, which needs
//     eighth notes, plays on the piano strip instead (coral keys), exactly as written.
//   * Channel 8 (chip PCM-0) is the sample channel. Castaway uses no samples. It stays empty.
//
// Regenerate: node examples/castaway/src/42-multi-chip-tracker_opus_5.5.mjs
// Plain Node, no dependencies, no clock, no randomness except a seeded PRNG for the noise scopes.
// Every letter is a 5x7 bitmap glyph emitted as <path>/<use> (never <text>); the title is an
// 8x10 bold face. All motion is CSS keyframes on one 60-second clock (the scroll, meters, labels,
// LEDs, keys and counters) plus a few short free-running loops (scope traces, master pump), so a
// single prefers-reduced-motion rule stops everything on the first frame, which is complete.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '42-multi-chip-tracker_opus_5.5';
const OUT = path.join(HERE, '..', 'assets', `${SLUG}.svg`);

// ---------------------------------------------------------------------------------------------
// Clock
// ---------------------------------------------------------------------------------------------
const PERIOD = 60;        // seconds: one pattern, one theme loop, one minute of the video
const ROWS = 80;          // rows per pattern: one per beat
const NS = 160;           // animation samples per period: one per eighth note (0.375 s)
const OFFSET = 0x12;      // the display opens on row 0x12: coconut above, ship coming up below
const songBeat = (s) => ((OFFSET * 2 + s) % NS) / 2;   // sample -> beat within the pattern
const hex = (n, w = 2) => n.toString(16).toUpperCase().padStart(w, '0');
const pct = (s) => +(s * 100 / NS).toFixed(3);

// ---------------------------------------------------------------------------------------------
// The theme, from tools/make_audio.py
// ---------------------------------------------------------------------------------------------
const CHORDS = { // bass root, rootless electric-piano voicing (MIDI)
  Gm9: [43, [58, 62, 65, 69]],
  C13: [36, [58, 62, 64, 69]],
  Fmaj9: [41, [57, 60, 64, 67]],
  Dm9: [38, [53, 57, 60, 64]],
};
const PROGRESSION = ['Gm9', 'C13', 'Fmaj9', 'Dm9'];
const chordAt = (bar) => PROGRESSION[(bar - 1) % 4];
const ARP = { Gm9: '047', C13: '046', Fmaj9: '037', Dm9: '047' }; // the voicing as a 0xy arpeggio
const MELODY = [ // (bar, beat, MIDI) for the kalimba
  [7, 0.5, 81], [7, 1.0, 84], [7, 1.5, 81], [7, 2.5, 79],
  [8, 1.0, 77], [8, 1.5, 79], [8, 2.0, 81],
  [9, 0.5, 86], [9, 1.0, 84], [9, 1.75, 81], [9, 2.5, 79],
  [10, 1.0, 81], [10, 2.0, 79], [10, 3.0, 76],
  [11, 0.0, 77], [11, 0.5, 81], [11, 1.0, 84], [11, 1.5, 88], [11, 2.0, 86], [11, 3.0, 84],
  [12, 0.5, 81], [12, 1.0, 84], [12, 1.75, 86], [12, 2.5, 89], [12, 3.0, 88], [12, 3.5, 86],
  [13, 0.0, 86], [13, 1.5, 84], [13, 2.0, 81], [13, 2.5, 82], [13, 3.0, 81], [13, 3.5, 79],
  [14, 0.0, 79], [14, 1.5, 81], [14, 2.0, 84], [14, 2.5, 86], [14, 3.0, 88],
  [15, 0.0, 89], [15, 2.0, 88], [15, 2.5, 84], [15, 3.0, 81],
  [16, 0.5, 79], [16, 1.0, 81], [16, 1.5, 84], [16, 3.5, 86],
  [17, 0.0, 86], [17, 2.0, 84],
  [18, 0.0, 81], [18, 2.0, 79],
  [19, 1.0, 84], [19, 2.5, 81],
  [20, 0.0, 84], [20, 0.5, 88], [20, 1.0, 91], [20, 2.0, 89],
];
const SECTION = (bar) => (bar <= 2 ? 'intro' : bar <= 10 ? 'groove' : bar <= 16 ? 'theme' : 'break');
const NOTE = ['C-', 'C#', 'D-', 'D#', 'E-', 'F-', 'F#', 'G-', 'G#', 'A-', 'A#', 'B-'];
const noteName = (m) => NOTE[m % 12] + (Math.floor(m / 12) - 1);
const hv = (v) => hex(Math.round(v * 15), 1);

// ---------------------------------------------------------------------------------------------
// Channels
// ---------------------------------------------------------------------------------------------
const CH = [
  { name: 'HER', chip: 0, wave: 'pulse', scope: 'pulse 50' },
  { name: 'SEA+SKY', chip: 0, wave: 'pulse25', scope: 'pulse 25' },
  { name: 'VISITORS', chip: 0, wave: 'tri', scope: 'triangle' },
  { name: 'SHORE', chip: 0, wave: 'noise', scope: 'noise' },
  { name: 'KEYS', chip: 1, wave: 'fm', scope: 'fm 4op' },
  { name: 'BASS', chip: 1, wave: 'fm2', scope: 'fm 2op' },
  { name: 'BEAT', chip: 1, wave: 'noise', scope: 'noise' },
  { name: 'PCM', chip: 2, wave: 'flat', scope: '0 samples', collapsed: true },
];
const cells = CH.map(() => new Map());   // row -> { note, ins, vol, fx }
const hits = CH.map(() => []);           // { beat, vol, kind, hold }
const keysOn = [];                       // piano: { midi, b0, b1, role }

// Island chip: frame 0x18 of seed 1992 (see the header comment). The note is the tier, tuned
// to F major: F-4 regular, A-4 occasional, C-5 rare, F-5 super rare. Effects: Lxx lasts xx bars;
// Wxx may wait up to xx minutes for her to be busy (the ship's prefer_wait in activities.toml).
cells[0].set(0x0C, { note: 'F-4', ins: '03', vol: 'F', fx: 'L11' });  // coconut, 17 bars
cells[1].set(0x18, { note: 'A-4', ins: '04', vol: 'F', fx: 'W0A' });  // ship, waits up to 10 min
const LANE_ON = [[12, 80, 0.72], [24, 80, 0.72], null, null];        // beats active, level

for (let bar = 1; bar <= 20; bar++) {
  const r0 = (bar - 1) * 4, ch = chordAt(bar), [root, voi] = CHORDS[ch];
  // keys: strums on 0 (hold 2.4 beats) and 2.5 (hold 1.4)
  cells[4].set(r0, { note: noteName(voi[0]), ins: '00', vol: hv(0.8), fx: ARP[ch] });
  cells[4].set(r0 + 2, { note: noteName(voi[0]), ins: '00', vol: hv(0.5), fx: 'G06' });
  hits[4].push({ beat: r0, vol: 0.8, kind: 'keys', hold: 2.4 }, { beat: r0 + 2.5, vol: 0.5, kind: 'keys', hold: 1.4 });
  for (const m of voi) keysOn.push({ midi: m, b0: r0, b1: r0 + 2.4, role: 'k' }, { midi: m, b0: r0 + 2.5, b1: r0 + 3.9, role: 'k' });
  if (bar < 3) continue;
  if (bar >= 17) {
    cells[5].set(r0, { note: noteName(root), ins: '01', vol: hv(0.75), fx: '...' });
    cells[5].set(r0 + 3, { note: '===', ins: '..', vol: '.', fx: 'G07' });
    hits[5].push({ beat: r0, vol: 0.75, kind: 'bass', hold: 3.6 });
    keysOn.push({ midi: root, b0: r0, b1: r0 + 3.6, role: 'b' });
    cells[6].set(r0, { note: '3-#', ins: '02', vol: hv(0.75), fx: '...' });
    cells[6].set(r0 + 1, { note: 'C-#', ins: '02', vol: hv(0.45), fx: '...' });
    cells[6].set(r0 + 3, { note: 'C-#', ins: '02', vol: hv(0.45), fx: '...' });
    hits[6].push({ beat: r0, vol: 0.75, kind: 'kick' }, { beat: r0 + 1, vol: 0.45, kind: 'rim' }, { beat: r0 + 3, vol: 0.45, kind: 'rim' });
  } else {
    const nxt = CHORDS[chordAt(bar + 1)][0];
    cells[5].set(r0, { note: noteName(root), ins: '01', vol: hv(0.9), fx: '...' });
    cells[5].set(r0 + 2, { note: noteName(root + 7), ins: '01', vol: hv(0.55), fx: 'G06' });
    cells[5].set(r0 + 3, { note: noteName(nxt - 1), ins: '01', vol: hv(0.6), fx: 'G06' });
    hits[5].push({ beat: r0, vol: 0.9, kind: 'bass', hold: 2.2 }, { beat: r0 + 2.5, vol: 0.55, kind: 'bass', hold: 0.8 }, { beat: r0 + 3.5, vol: 0.6, kind: 'bass', hold: 0.4 });
    keysOn.push({ midi: root, b0: r0, b1: r0 + 2.2, role: 'b' }, { midi: root + 7, b0: r0 + 2.5, b1: r0 + 3.3, role: 'b' }, { midi: nxt - 1, b0: r0 + 3.5, b1: r0 + 3.9, role: 'b' });
    cells[6].set(r0, { note: '3-#', ins: '02', vol: hv(0.95), fx: '...' });
    cells[6].set(r0 + 1, { note: '9-#', ins: '02', vol: hv(0.75), fx: '...' });
    cells[6].set(r0 + 2, { note: '3-#', ins: '02', vol: hv(0.8), fx: 'G06' });
    cells[6].set(r0 + 3, { note: '9-#', ins: '02', vol: hv(0.75), fx: '...' });
    hits[6].push({ beat: r0, vol: 0.95, kind: 'kick' }, { beat: r0 + 1, vol: 0.75, kind: 'snare' }, { beat: r0 + 2.5, vol: 0.8, kind: 'kick' }, { beat: r0 + 3, vol: 0.75, kind: 'snare' });
  }
}
MELODY.forEach(([bar, b, m], i) => {
  const t = (bar - 1) * 4 + b;
  const [nb, nbeat] = MELODY[(i + 1) % MELODY.length];
  let tn = (nb - 1) * 4 + nbeat; if (tn <= t) tn += ROWS;
  keysOn.push({ midi: m, b0: t, b1: Math.min(t + 1, tn), role: 'm' });
});

// Level of a channel at a beat (0..1), for meters, scopes and LEDs.
function level(c, beat) {
  if (c < 4) { const on = LANE_ON[c]; return on && beat >= on[0] && beat < on[1] ? on[2] : 0; }
  let best = 0;
  for (const h of hits[c]) {
    for (const shift of [0, -ROWS]) {
      const dt = beat - (h.beat + shift);
      if (dt < 0 || dt > ROWS / 2) continue;
      const s = dt * 0.75;
      let v = 0;
      if (h.kind === 'keys') v = dt < h.hold ? h.vol * Math.exp(-s * 0.9) : 0;
      else if (h.kind === 'bass') v = dt < h.hold ? h.vol * Math.exp(-s * 0.6) : 0;
      else if (h.kind === 'kick') v = h.vol * Math.exp(-s * 5);
      else v = h.vol * Math.exp(-s * 9);
      best = Math.max(best, v);
    }
  }
  return best;
}
const LV = CH.map((_, c) => Array.from({ length: NS }, (_, s) => level(c, songBeat(s))));

// ---------------------------------------------------------------------------------------------
// Fonts
// ---------------------------------------------------------------------------------------------
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
  g: '.....|.....|.####|#...#|#...#|.####|....#|.###.', h: '#....|#....|#.##.|##..#|#...#|#...#|#...#',
  i: '..#..|.....|.##..|..#..|..#..|..#..|.###.', j: '...#.|.....|..##.|...#.|...#.|...#.|#..#.|.##..',
  k: '#....|#....|#..#.|#.#..|##...|#.#..|#..#.', l: '.##..|..#..|..#..|..#..|..#..|..#..|.###.',
  m: '.....|.....|##.#.|#.#.#|#.#.#|#.#.#|#...#', n: '.....|.....|#.##.|##..#|#...#|#...#|#...#',
  o: '.....|.....|.###.|#...#|#...#|#...#|.###.', p: '.....|.....|####.|#...#|#...#|####.|#....|#....',
  q: '.....|.....|.####|#...#|#...#|.####|....#|....#', r: '.....|.....|#.##.|##..#|#....|#....|#....',
  s: '.....|.....|.####|#....|.###.|....#|####.', t: '.#...|.#...|###..|.#...|.#...|.#..#|..##.',
  u: '.....|.....|#...#|#...#|#...#|#..##|.##.#', v: '.....|.....|#...#|#...#|#...#|.#.#.|..#..',
  w: '.....|.....|#...#|#...#|#.#.#|#.#.#|.#.#.', x: '.....|.....|#...#|.#.#.|..#..|.#.#.|#...#',
  y: '.....|.....|#...#|#...#|#...#|.####|....#|.###.', z: '.....|.....|#####|...#.|..#..|.#...|#####',
  0: '.###.|#...#|#..##|#.#.#|##..#|#...#|.###.', 1: '..#..|.##..|..#..|..#..|..#..|..#..|.###.',
  2: '.###.|#...#|....#|...#.|..#..|.#...|#####', 3: '#####|...#.|..#..|...#.|....#|#...#|.###.',
  4: '...#.|..##.|.#.#.|#..#.|#####|...#.|...#.', 5: '#####|#....|####.|....#|....#|#...#|.###.',
  6: '..##.|.#...|#....|####.|#...#|#...#|.###.', 7: '#####|....#|...#.|..#..|.#...|.#...|.#...',
  8: '.###.|#...#|#...#|.###.|#...#|#...#|.###.', 9: '.###.|#...#|#...#|.####|....#|...#.|.##..',
  '.': '.....|.....|.....|.....|.....|.##..|.##..', ',': '.....|.....|.....|.....|.##..|.##..|..#..|.#...',
  ':': '.....|.##..|.##..|.....|.##..|.##..|.....', '-': '.....|.....|.....|.###.|.....|.....|.....',
  '=': '.....|.....|#####|.....|#####|.....|.....', '+': '.....|..#..|..#..|#####|..#..|..#..|.....',
  '#': '.#.#.|.#.#.|#####|.#.#.|#####|.#.#.|.#.#.', '/': '....#|....#|...#.|..#..|.#...|#....|#....',
  '(': '...#.|..#..|.#...|.#...|.#...|..#..|...#.', ')': '.#...|..#..|...#.|...#.|...#.|..#..|.#...',
  "'": '..#..|..#..|.#...|.....|.....|.....|.....', '!': '..#..|..#..|..#..|..#..|..#..|.....|..#..',
  '?': '.###.|#...#|....#|...#.|..#..|.....|..#..', '%': '##..#|##..#|...#.|..#..|.#...|#..##|#..##',
  '>': '.#...|..#..|...#.|....#|...#.|..#..|.#...', '<': '...#.|..#..|.#...|#....|.#...|..#..|...#.',
  '_': '.....|.....|.....|.....|.....|.....|.....|#####', '*': '.....|#.#.#|.###.|#####|.###.|#.#.#|.....',
  '~': '.....|.....|.#...|#.#.#|...#.|.....|.....', '|': '..#..|..#..|..#..|..#..|..#..|..#..|..#..',
  '·': '.....|.....|.....|..#..|.....|.....|.....', '▶': '#....|##...|###..|####.|###..|##...|#....',
  '←': '.....|..#..|.#...|#####|.#...|..#..|.....', '→': '.....|..#..|...#.|#####|...#.|..#..|.....',
};
// 8x10 bold capitals for the title.
const BOLD = {
  C: ['..######', '.#######', '###.....', '##......', '##......', '##......', '##......', '###.....', '.#######', '..######'],
  A: ['..####..', '.######.', '###..###', '##....##', '##....##', '########', '########', '##....##', '##....##', '##....##'],
  S: ['.#######', '########', '##......', '##......', '#######.', '.#######', '......##', '......##', '########', '#######.'],
  T: ['########', '########', '...##...', '...##...', '...##...', '...##...', '...##...', '...##...', '...##...', '...##...'],
  W: ['##....##', '##....##', '##....##', '##....##', '##.##.##', '##.##.##', '########', '###..###', '##....##', '#......#'],
  Y: ['##....##', '##....##', '###..###', '.######.', '..####..', '...##...', '...##...', '...##...', '...##...', '...##...'],
};

// Rows of '#' -> one path of merged rectangles (runs merged vertically too).
function bitmapPath(rows, ox = 0, oy = 0, px = 1) {
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
  const f = (n) => +(n).toFixed(2);
  return rects.map((r) => `M${f(ox + r.x * px)} ${f(oy + r.y * px)}h${f(r.w * px)}v${f(r.h * px)}h${f(-r.w * px)}z`).join('');
}
function sprite(rows, pal, ox = 0, oy = 0, px = 1) {
  const w = rows[0].length;
  rows.forEach((r, i) => { if (r.length !== w) throw new Error(`sprite row ${i} "${r}" is ${r.length} wide, expected ${w}`); });
  let s = '';
  for (const [ch, col] of Object.entries(pal)) {
    const d = bitmapPath(rows.map((r) => [...r].map((c) => (c === ch ? '#' : '.')).join('')), ox, oy, px);
    if (d) s += `<path fill="${col}" d="${d}"/>`;
  }
  return s;
}

const usedGlyphs = new Set();
const gid = (ch) => `g${ch.codePointAt(0).toString(36)}`;
// A run of 5x7 text at (x, y) in the parent's units, scaled by sc; cls sets the fill.
function glyphs(str, dx = 0) {
  let s = '';
  [...str].forEach((ch, i) => {
    if (ch === ' ') return;
    if (!F5[ch]) throw new Error(`no glyph for "${ch}" in "${str}"`);
    usedGlyphs.add(ch);
    const x = dx + i * 6;
    s += `<use href="#${gid(ch)}"${x ? ` x="${x}"` : ''}/>`;
  });
  return s;
}
function text(str, x, y, sc, cls, extra = '') {
  return `<g transform="translate(${+x.toFixed(2)} ${+y.toFixed(2)})${sc !== 1 ? ` scale(${sc})` : ''}" class="${cls}"${extra}>${glyphs(str)}</g>`;
}
const tw = (str, sc) => (str.length * 6 - 1) * sc;

// ---------------------------------------------------------------------------------------------
// Palette
// ---------------------------------------------------------------------------------------------
const P = {
  shell: '#0d1017', bar: '#171b25', panel: '#121620', well: '#06080c', edge: '#262d3d',
  label: '#8792ab', dim: '#566079', text: '#cfd7e6', faint: '#2f374a',
  cream: '#fff3d6', amber: '#efb04f', teal: '#3fbcad', coral: '#ff7f6a', pcm: '#5a6377',
  note: '#8ff59f', ins: '#58d585', vol: '#76b9ff', fx: '#ff92d8', yel: '#ffe169', rel: '#9aa6bd',
  dot: '#38425a', hl1: '#0e131c', hl2: '#162030', play: '#2b3956', playEdge: '#5d77ad',
};
const CHIPCOL = [P.amber, P.teal, P.pcm];

// ---------------------------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------------------------
const W = 960, H = 498;
const GS = 1.25;                       // grid scale: one font pixel = 1.25 units
const GX = 10, GY = 232;               // grid origin
const RH = 10;                         // row height, font pixels
const CW = 80, PCMW = 26, RNW = 20;    // cell, collapsed cell and row-number widths, font pixels
const VIS = 15, PLAY = 7;              // visible rows, play row index
const chX = (c) => RNW + c * CW;       // channel x in grid pixels
const chW = (c) => (CH[c].collapsed ? PCMW : CW);
const GRIDW = RNW + 7 * CW + PCMW;     // 606 font pixels = 757.5 units

const css = [];
const anim = []; // keyframe blocks

// Discrete keyframes over the 60 s clock from an array of NS css values.
let kfn = 0;
function steps(vals, prop) {
  const name = `k${(kfn++).toString(36)}`;
  let s = `@keyframes ${name}{`, prev = null;
  vals.forEach((v, i) => { if (v !== prev) { s += `${pct(i)}%{${prop}:${v}}`; prev = v; } });
  s += `100%{${prop}:${vals[NS - 1]}}}`;
  anim.push(s);
  return name;
}
const animAttr = (name, base = '') => ` style="${base}animation-name:${name}" class="a"`;
// Free-running horizontal drift by one period (scope traces): seamless because the path is periodic.
const drifts = new Map();
function drift(dist, dur) {
  const key = +dist.toFixed(2);
  if (!drifts.has(key)) {
    const name = `d${drifts.size.toString(36)}`;
    drifts.set(key, name);
    anim.push(`@keyframes ${name}{to{transform:translateX(-${key}px)}}`);
  }
  return ` class="tr" style="animation:${drifts.get(key)} ${dur}s linear infinite"`;
}

// ---------------------------------------------------------------------------------------------
// Pieces
// ---------------------------------------------------------------------------------------------
const out = [];
const defs = [];

// Glyph defs are added at the end (only the glyphs used).

// --- shell ----------------------------------------------------------------------------------
out.push(`<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="10" fill="${P.shell}" stroke="${P.edge}"/>`);
out.push(`<path d="M10.5 .5h${W - 21}a10 10 0 0 1 10 10v10h-${W - 1}v-10a10 10 0 0 1 10-10z" fill="${P.bar}"/>`);
out.push(`<path d="M1 20.5h${W - 2}" stroke="${P.edge}"/>`);
// window-ish title bar: app, module, menu, and how to run it
out.push(`<circle cx="15" cy="10.5" r="3.2" fill="${P.coral}"/><circle cx="25" cy="10.5" r="3.2" fill="${P.amber}"/><circle cx="35" cy="10.5" r="3.2" fill="${P.teal}"/>`);
out.push(text('outrigger 0.92', 48, 7, 1, 'tx'));
out.push(text('castaway.rig', 48 + tw('outrigger 0.92 ', 1) + 4, 7, 1, 'lb'));
out.push(text('file  edit  song  chips  play  help', 250, 7, 1, 'dm'));
{
  const run = '▶ python tools/serve.py  →  http://127.0.0.1:8765/';
  out.push(text(run, W - 12 - tw(run, 1), 7, 1, 'tx'));
}

// --- panels ---------------------------------------------------------------------------------
const panel = (x, y, w, h, label, right) => {
  let s = `<rect x="${x + 0.5}" y="${y + 0.5}" width="${w - 1}" height="${h - 1}" rx="5" fill="${P.panel}" stroke="${P.edge}"/>`;
  s += text(label, x + 7, y + 6, 1, 'lb');
  if (right) s += text(right, x + w - 7 - tw(right, 1), y + 6, 1, 'dm');
  return s;
};
const TOPY = 26, TOPH = 150;

// ORDERS (frame list): real pattern numbers for frames 0x14-0x1C of seed 1992.
{
  const x = 10, w = 182;
  out.push(panel(x, TOPY, w, TOPH, 'orders', '18/257'));
  out.push(`<rect x="${x + 6}" y="${TOPY + 17}" width="${w - 12}" height="${TOPH - 34}" rx="3" fill="${P.well}"/>`);
  const ORD = { // frame -> HER, SEA+SKY, VISITORS, SHORE (theme channels and PCM are 00 throughout)
    0x14: [0x0D, 0, 0, 0], 0x15: [0, 0, 0, 0], 0x16: [0, 0, 0, 0], 0x17: [0, 0, 0, 0],
    0x18: [0x0E, 0x01, 0, 0], 0x19: [0x0F, 0, 0, 0], 0x1A: [0, 0x02, 0, 0], 0x1B: [0, 0, 0, 0],
    0x1C: [0x10, 0, 0, 0],
  };
  const ox = x + 12, oy = TOPY + 22;
  out.push(text('   1  2  3  4  5  6  7  8', ox, oy, 1, 'dm'));
  Object.entries(ORD).forEach(([f, v], i) => {
    const y = oy + 12 + i * 11;
    const cur = +f === 0x18;
    if (cur) out.push(`<rect x="${x + 7}" y="${y - 2}" width="${w - 14}" height="11" fill="#173a29"/><rect x="${x + 7}" y="${y - 2}" width="2" height="11" fill="${P.note}"/>`);
    out.push(text(hex(+f), ox, y, 1, cur ? 'yl' : 'dm'));
    const vals = [...v, 0, 0, 0, 0];
    vals.forEach((n, c) => out.push(text(hex(n), ox + 18 + c * 18, y, 1, cur ? 'nt' : n ? 'in' : 'fa')));
  });
  out.push(text('1 frame = 1 minute', ox, TOPY + TOPH - 13, 1, 'dm'));
}

// SONG: the title, the pitch and the master scope.
const SX = 198, SW = 448;
{
  out.push(panel(SX, TOPY, SW, TOPH, 'song', 'module info'));
  // title: 8x10 bold capitals, sunny horizontal bands, a sea-dark shadow
  const word = 'CASTAWAY', TP = 4.25, ADV = 9;
  const tx = SX + 14, ty = TOPY + 19;
  const shadow = [];
  [...word].forEach((ch, i) => {
    BOLD[ch].forEach((row, r) => { shadow[r] = (shadow[r] || '').padEnd(i * ADV, '.') + row; });
  });
  // one path per colour band (two pixel rows each)
  const rowsFor = (r0, r1) => shadow.map((row, r) => (r >= r0 && r < r1 ? row : '.'.repeat(row.length)));
  const BANDCOL = ['#fff4dc', '#ffe28c', '#ffc55e', '#ff9d5c', '#ff7f6a'];
  out.push(`<path fill="#0d4d55" d="${bitmapPath(shadow, tx + TP, ty + TP, TP)}"/>`);
  BANDCOL.forEach((col, b) => out.push(`<path fill="${col}" d="${bitmapPath(rowsFor(b * 2, b * 2 + 2), tx, ty, TP)}"/>`));
  // module info at the right of the title
  const ix = SX + SW - 12 - tw('length 10:00:00', 1);
  [['length', '10:00:00'], ['frames', '600'], ['rows', '48000'], ['seed', '1992']].forEach(([k, v], i) => {
    out.push(text(k, ix, ty + 1 + i * 11, 1, 'dm'));
    out.push(text(v, ix + tw('length ', 1) + 1, ty + 1 + i * 11, 1, 'tx'));
  });
  // the pitch, two lines
  out.push(text('a ten-hour lo-fi island video, tracked as a song.', SX + 14, TOPY + 69, 1.25, 'cr'));
  out.push(text('she idles. now and then, on the next bar, a gag.', SX + 14, TOPY + 82, 1.25, 'lb'));
  // master scope
  const mx = SX + 10, my = TOPY + 96, mw = SW - 20, mh = 46;
  out.push(`<rect x="${mx + 0.5}" y="${my + 0.5}" width="${mw - 1}" height="${mh - 1}" rx="9" fill="#07121a" stroke="#24465a"/>`);
  defs.push(`<clipPath id="mclip"><rect x="${mx + 2}" y="${my + 2}" width="${mw - 4}" height="${mh - 4}" rx="7"/></clipPath>`);
  // the trace sits a little below centre so it never runs through the 'master' and 'L R' labels
  const mcy = my + mh / 2 + 3;
  out.push(`<path d="M${mx + 8} ${mcy}h${mw - 16}" stroke="#163042" stroke-dasharray="2 3"/>`);
  for (let i = 1; i < 8; i++) out.push(`<path d="M${(mx + i * mw / 8).toFixed(1)} ${my + 6}v${mh - 12}" stroke="#10232f"/>`);
  const MP = 96;
  const mf = (u) => { const w = 2 * Math.PI * u; return 0.5 * Math.sin(w) + 0.28 * Math.sin(3 * w + 1.3 * Math.sin(w)) + 0.14 * Math.sin(7 * w + 0.6) + 0.06 * Math.sin(15 * w); };
  const wavePts = (fn, per, width, amp, phase = 0) => {
    const pts = [];
    for (let x = 0; x <= width + per; x += 3) pts.push(`${x.toFixed(1)} ${(-fn((x / per + phase) % 1) * amp).toFixed(1)}`);
    return 'M' + pts.join('L');
  };
  out.push(`<g clip-path="url(#mclip)"><g transform="translate(${mx} ${mcy})"><g class="pm">`
    + `<path${drift(MP, 1.6)} d="${wavePts(mf, MP, mw, 10.5, 0.13)}" fill="none" stroke="#5f8fd0" stroke-width="1.1" opacity=".75"/>`
    + `<path${drift(MP, 1.2)} d="${wavePts(mf, MP, mw, 12)}" fill="none" stroke="#b5dcff" stroke-width="1.3"/>`
    + `</g></g></g>`);
  out.push(text('master', mx + 9, my + 5, 1, 'dm'));
  out.push(text('L', mx + mw - 22, my + 5, 1, 'dm'));
  out.push(text('R', mx + mw - 13, my + 5, 1, 'dm'));
}

// INSTRUMENTS: numbered, with a little icon and the tier.
const IX = 652, IW = 298;
const ICON = {
  piano: [['kkkkkkkk', 'wkwkwwkw', 'wkwkwwkw', 'wkwkwwkw', 'wwwwwwww', 'wwwwwwww', 'kkkkkkkk', '........'], { w: '#e9eef6', k: '#1c2230' }],
  sine: [['........', '.tt.....', 't..t....', 't..t...t', '....t..t', '.....tt.', '........', '........'], { t: P.teal }],
  drum: [['..cccc..', '.cccccc.', '.rccccr.', '.rrccrr.', '.rcrrcr.', '.rrrrrr.', '..r..r..', '........'], { c: '#f3ead8', r: P.coral }],
  coconut: [['......y.', '.....y..', '..bbyb..', '.bBBBBb.', '.bBBBBb.', '.bBBBBb.', '..bbbb..', '........'], { b: '#5e3a20', B: '#8c5b34', y: '#ffd76a' }],
  ship: [['..s.....', '...s....', '..rr....', '.wwwww..', 'hhhhhhhh', '.hhhhhh.', 'bbbbbbbb', '........'], { s: '#9aa3b5', r: P.coral, w: '#eef2f8', h: '#3b4a66', b: '#2f86c9' }],
  bottle: [['...c....', '...g....', '..ggg...', '..gwg...', '..gwg...', '..ggg...', '..ggg...', '........'], { c: '#b07a45', g: '#4fbf8a', w: '#fff3d6' }],
  turtle: [['........', '..ggg...', '.gGgGg..', '.GgGgGgh', '.gGgGg..', '..ggg...', '.f...f..', '........'], { g: '#3f9a52', G: '#7fcf6a', h: '#a8d98a', f: '#a8d98a' }],
  cat: [['G.....G.', 'GG...GG.', 'GgGgGgG.', 'GkGGGkG.', 'GGGwGGG.', '.GwwwG..', '..GGG...', '........'], { G: '#8f96a3', g: '#5f6673', k: '#1c2230', w: '#f4f4f4' }],
  shark: [['...ccc..', '..c.g.c.', '..CggGC.', '...ggg..', '..gggg..', '.ggggg..', 'bbbbbbbb', '........'], { c: '#f3e6c8', C: '#f3e6c8', g: '#7f8ea6', G: '#7f8ea6', b: '#2f86c9' }],
  drone: [['rr....rr', '.kkkkkk.', '..kkkk..', '...kk...', '..pppp..', '..pPPp..', '..pppp..', '........'], { r: '#9aa3b5', k: '#d6dbe4', p: '#c9945a', P: '#e8be82' }],
  tide: [['........', '...bbb..', '..b..bb.', '.b....b.', 'bb.bbbbb', 'bbbbbbbb', 'BBBBBBBB', '........'], { b: '#6fc7e8', B: '#2f86c9' }],
  her: [['..hhh...', '.hhhhh..', 'chssshc.', 'chssshc.', '.hsssh..', '..ss....', '.oooo...', 'oooooo..'], { h: '#6b4126', c: '#f3e6c8', s: '#f0c39e', o: P.coral }],
};
const INSTR = [
  ['00', 'piano', 'e.piano', 'fm', 'tt'],
  ['01', 'sine', 'bass', 'fm', 'tt'],
  ['02', 'drum', 'drums', 'noise', 'dm'],
  ['03', 'coconut', 'coconut', 'regular', 'nt'],
  ['04', 'ship', 'ship (unseen)', 'occasional', 'vl'],
  ['05', 'bottle', 'bottle (back)', 'occasional', 'vl'],
  ['06', 'turtle', 'sea turtle', 'occasional', 'vl'],
  ['07', 'cat', 'grey tabby', 'rare', 'fx'],
  ['08', 'shark', 'shark in cans', 'rare', 'fx'],
  ['09', 'drone', 'drone + parcel', 'rare', 'fx'],
  ['0A', 'tide', 'the tide', 'chained', 'dm'],
];
const INSTR_CH = { '00': 4, '01': 5, '02': 6, '03': 0, '04': 1 };
{
  out.push(panel(IX, TOPY, IW, TOPH, 'instruments', '90+ in activities.toml'));
  for (const k of Object.keys(ICON)) defs.push(`<g id="i-${k}">${sprite(ICON[k][0], ICON[k][1])}</g>`);
  INSTR.forEach(([n, icon, name, tier, tcls], i) => {
    const y = TOPY + 19 + i * 11.6;
    const ch = INSTR_CH[n];
    // LED: lit while the instrument sounds
    if (ch !== undefined) {
      const vals = LV[ch].map((v) => (v > 0.04 ? 1 : 0.12));
      out.push(`<rect x="${IX + 8}" y="${y + 2}" width="4" height="4" rx="1" fill="${P.note}" opacity="${vals[0]}"${animAttr(steps(vals, 'opacity'))}/>`);
    } else out.push(`<rect x="${IX + 8}" y="${y + 2}" width="4" height="4" rx="1" fill="${P.note}" opacity=".12"/>`);
    out.push(text(n, IX + 17, y, 1.25, 'in'));
    out.push(`<use href="#i-${icon}" transform="translate(${IX + 35} ${y - 0.5}) scale(1.2)"/>`);
    out.push(text(name, IX + 50, y, 1.25, 'tx'));
    out.push(text(tier, IX + IW - 9 - tw(tier, 1), y + 1, 1, tcls));
  });
}

// --- chip labels over the channel tabs ------------------------------------------------------
{
  const y = 182;
  const span = (c0, c1, label, col) => {
    const x0 = GX + chX(c0) * GS + 1, x1 = GX + (chX(c1) + chW(c1)) * GS - 3;
    out.push(`<path d="M${x0} ${y + 7}v-3h${x1 - x0}v3" fill="none" stroke="${col}" stroke-opacity=".55"/>`);
    const w = tw(label, 1) + 8, lx = x0 + (x1 - x0 - w) / 2;
    out.push(`<rect x="${lx}" y="${y}" width="${w}" height="9" fill="${P.shell}"/>`);
    out.push(text(label, lx + 4, y + 1, 1, '', ` fill="${col}"`));
  };
  span(0, 3, 'chip 1: ISLE-4  the island  (lanes from activities.toml)', P.amber);
  span(4, 6, 'chip 2: LOFI-3  the theme', P.teal);
  { // chip 3 is one collapsed channel wide: its name, centred over the tab, stays clear of the scopes
    const x0 = GX + chX(7) * GS + 1, w = chW(7) * GS - 3, lab = 'PCM-0';
    out.push(text(lab, x0 + (w - tw(lab, 1)) / 2, y + 1, 1, '', ` fill="${P.pcm}"`));
  }
}

// --- channel tabs ---------------------------------------------------------------------------
const WAVE_ICON = {
  pulse: 'M0 7V1H3V7H6V1H9V7H12V1',
  pulse25: 'M0 7V1H1.5V7H6V1H7.5V7H12V1',
  tri: 'M0 7L1.5 5.5L3 4L4.5 2.5L6 1L7.5 2.5L9 4L10.5 5.5L12 7',
  noise: 'M0 4L1 1L2 6L3 3L4 7L5 2L6 5L7 1L8 6L9 3L10 7L11 2L12 5',
  fm: 'M0 4C1 0 2 0 3 4S5 8 6 4S7 0 8 2S10 8 12 4',
  fm2: 'M0 4C1.5 -1 3 -1 4.5 4S7.5 9 9 4S11 1 12 3',
  flat: 'M0 4H12',
};
const TABY = 195, TABH = 35;
CH.forEach((ch, c) => {
  const x = GX + chX(c) * GS + 1, w = chW(c) * GS - 3;
  const col = CHIPCOL[ch.chip];
  out.push(`<path d="M${x} ${TABY + 17}v-14a3 3 0 0 1 3-3h${w - 6}a3 3 0 0 1 3 3v14z" fill="${col}"/>`);
  out.push(`<rect x="${x}" y="${TABY + 17}" width="${w}" height="${TABH - 17}" fill="#0a0d13" stroke="${col}" stroke-opacity=".35"/>`);
  if (ch.collapsed) {
    out.push(text(String(c + 1), x + 4, TABY + 5, 1.25, 'dk'));
    out.push(text('PCM', x + 3, TABY + 21, 1, 'dm'));
    for (let i = 0; i < 3; i++) out.push(`<rect x="${x + 4 + i * 7.5}" y="${TABY + 30}" width="6" height="3" fill="${P.faint}"/>`);
    return;
  }
  out.push(text(`${c + 1} ${ch.name}`, x + 4, TABY + 5, 1.25, 'dk'));
  if (c === 0) { // her, small: brown low bun, cream headphones, coral top
    out.push(`<rect x="${x + 49}" y="${TABY + 2}" width="13" height="13" rx="2" fill="#141822"/>`);
    out.push(`<use href="#i-her" transform="translate(${x + 50.5} ${TABY + 3.5}) scale(1.25)"/>`);
  }
  out.push(`<path d="${WAVE_ICON[ch.wave]}" transform="translate(${x + w - 17} ${TABY + 5})" fill="none" stroke="#141822" stroke-width="1.3" stroke-linejoin="round"/>`);
  // meter: 12 segments, green to yellow to coral; a cover rect shrinks to reveal them
  const mx = x + 4, my = TABY + 30, seg = 7.5;
  for (let i = 0; i < 12; i++) out.push(`<rect x="${mx + i * seg}" y="${my}" width="6" height="3" fill="${i < 7 ? '#5fe08a' : i < 10 ? P.yel : P.coral}"/>`);
  const lv = LV[c].map((v) => Math.min(12, Math.round(v * 13.5)));
  const f = lv.map((n) => +Math.max(0.001, (12 - n) / 12).toFixed(3));
  const vals = f.map((v) => `${v} 1`);
  out.push(`<g transform="translate(${mx + 12 * seg} ${my - 0.5})"><rect x="-${12 * seg}" width="${12 * seg}" height="4" fill="#0a0d13"${animAttr(steps(vals, 'scale'), `scale:${vals[0]};`)}/></g>`);
});
// "now playing" lines in the tabs: discrete labels switched on the 60 s clock
function switching(c, labelAt, cls = 'tx') {
  const x = GX + chX(c) * GS + 5, y = TABY + 21;
  const seq = Array.from({ length: NS }, (_, s) => labelAt(s));
  const uniq = [...new Set(seq)];
  for (const lab of uniq) {
    const vals = seq.map((l) => (l === lab ? 1 : 0));
    const [txt, k] = Array.isArray(lab) ? lab : [lab, cls];
    if (uniq.length === 1) { out.push(text(txt, x, y, 1, k)); continue; }
    out.push(`<g opacity="${vals[0]}"${animAttr(steps(vals, 'opacity'))}>${text(txt, x, y, 1, k)}</g>`);
  }
}
const barOf = (s) => Math.floor(songBeat(s) / 4) + 1;
switching(0, (s) => (LV[0][s] > 0 ? '03 coconut' : 'idle, nodding'));
switching(1, (s) => (LV[1][s] > 0 ? '04 ship' : '--'));
switching(2, () => 'nobody');
switching(3, () => 'calm');
switching(4, (s) => chordAt(barOf(s)));
switching(5, (s) => {
  const b = songBeat(s);
  let last = null;
  for (const k of keysOn) if (k.role === 'b' && k.b0 <= b && b < k.b1 + 0.1) last = k;
  return last ? noteName(last.midi) : '--';
});
switching(6, (s) => SECTION(barOf(s)));

// --- pattern grid ---------------------------------------------------------------------------
{
  const gw = GRIDW, gh = VIS * RH;
  const g = [];
  g.push(`<rect width="${gw}" height="${gh}" fill="${P.well}"/>`);
  defs.push(`<clipPath id="gclip"><rect width="${gw}" height="${gh}"/></clipPath>`);
  const songRowOfDisp = (j) => (((OFFSET - PLAY + j) % ROWS) + ROWS) % ROWS;
  const NDISP = ROWS + VIS;
  // scrolling backgrounds: highlight bands every 4 rows (a bar) and 16 rows (a ii-V-I-vi turn)
  let bands = '';
  for (let j = 0; j < NDISP; j++) {
    const r = songRowOfDisp(j);
    if (r % 4) continue;
    bands += `<rect y="${j * RH}" width="${gw}" height="${RH}" fill="${r % 16 ? P.hl1 : P.hl2}"/>`;
  }
  g.push(`<g clip-path="url(#gclip)"><g class="sc">${bands}</g></g>`);
  // the play row (fixed), lighter rather than redder
  g.push(`<rect y="${PLAY * RH}" width="${gw}" height="${RH}" fill="${P.play}"/>`);
  g.push(`<path d="M0 ${PLAY * RH + 0.4}h${gw}M0 ${PLAY * RH + RH - 0.4}h${gw}" stroke="${P.playEdge}" stroke-width=".8" opacity=".8"/>`);
  // channel separators
  for (let c = 0; c <= 8; c++) {
    const x = c === 8 ? GRIDW : chX(c);
    g.push(`<path d="M${x - 0.5} 0v${gh}" stroke="#1a2131" stroke-width="1"/>`);
  }
  // empty-cell dots as a pattern (FamiTracker-ish dots per field)
  const dotsAt = (cols) => cols.map((cc) => `M${cc * 6 + 4 + 2} 4.5h1v1h-1z`).join('');
  defs.push(`<pattern id="pe" width="${CW}" height="${RH}" patternUnits="userSpaceOnUse"><path class="e" d="${dotsAt([0, 1, 2, 4, 5, 7, 9, 10, 11])}"/></pattern>`);
  defs.push(`<pattern id="pp" width="${PCMW}" height="${RH}" patternUnits="userSpaceOnUse"><path class="e" d="${dotsAt([0, 1, 2])}"/></pattern>`);
  // filled cells as reusable groups
  const cellDefs = new Map();
  const cellId = (cell, yellow) => {
    const key = `${cell.note}|${cell.ins}|${cell.vol}|${cell.fx}|${yellow}`;
    if (cellDefs.has(key)) return cellDefs.get(key);
    const id = `c${cellDefs.size.toString(36)}`;
    let s = '';
    const field = (str, col0, cls) => {
      if (/^\.+$/.test(str)) { s += `<path class="e" d="${dotsAt([...str].map((_, i) => col0 + i))}"/>`; return; }
      s += `<g class="${cls}">${glyphs(str, 4 + col0 * 6)}</g>`;
    };
    field(cell.note, 0, cell.note === '===' ? 'rl' : yellow ? 'yl' : 'nt');
    field(cell.ins, 4, 'in');
    field(cell.vol, 7, 'vl');
    field(cell.fx, 9, 'fx');
    defs.push(`<g id="${id}">${s}</g>`);
    cellDefs.set(key, id);
    return id;
  };
  let txt = '';
  // row numbers
  for (let j = 0; j < NDISP; j++) {
    const r = songRowOfDisp(j);
    txt += `<g class="${r % 4 ? 'rn' : 'rb'}" transform="translate(3 ${j * RH + 1.5})">${glyphs(hex(r))}</g>`;
  }
  CH.forEach((ch, c) => {
    let inner = '';
    let run = -1;
    const flush = (j) => {
      if (run >= 0) inner += `<rect y="${run * RH}" width="${chW(c)}" height="${(j - run) * RH}" fill="url(#${ch.collapsed ? 'pp' : 'pe'})"/>`;
      run = -1;
    };
    for (let j = 0; j < NDISP; j++) {
      const r = songRowOfDisp(j);
      const cell = cells[c].get(r);
      if (!cell) { if (run < 0) run = j; continue; }
      flush(j);
      inner += `<use href="#${cellId(cell, r % 4 === 0)}" y="${j * RH + 1.5}"/>`;
    }
    flush(NDISP);
    txt += `<g transform="translate(${chX(c)} 0)">${inner}</g>`;
  });
  g.push(`<g clip-path="url(#gclip)"><g class="sc">${txt}</g></g>`);
  // edit cursor on HER's note field, on the play row
  g.push(`<rect x="${chX(0) + 2.5}" y="${PLAY * RH + 0.5}" width="20" height="${RH - 1}" fill="none" stroke="${P.coral}" stroke-width=".9"/>`);
  g.push(`<path d="M${gw} 0v${gh}" stroke="${P.edge}"/>`);
  out.push(`<g transform="translate(${GX} ${GY}) scale(${GS})">${g.join('')}</g>`);
  out.push(`<rect x="${GX - 0.5}" y="${GY - 0.5}" width="${GRIDW * GS + 1}" height="${VIS * RH * GS + 1}" fill="none" stroke="${P.edge}"/>`);
}

// --- per-channel scopes (2 x 4 grid at the right) -------------------------------------------
{
  const x0 = GX + GRIDW * GS + 8, colW = (W - 10 - x0 - 4) / 2, y0 = 182, rowH = (GY + VIS * RH * GS - y0 - 9) / 4;
  let seed = 1992;
  const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  const noiseTab = (n) => Array.from({ length: n }, () => rnd() * 2 - 1);
  const NZ = [noiseTab(24), noiseTab(24)];
  const FN = {
    pulse: (u) => (u < 0.5 ? 1 : -1),
    pulse25: (u) => (u < 0.25 ? 1 : -1),
    tri: (u) => { const v = u < 0.5 ? -1 + 4 * u : 3 - 4 * u; return Math.round(v * 7.5) / 7.5; },
    noise: (u) => NZ[0][Math.floor(u * 24) % 24],
    noise2: (u) => NZ[1][Math.floor(u * 24) % 24],
    fm: (u) => { const w = 2 * Math.PI * u; return 0.8 * Math.sin(w + 1.4 * Math.sin(w)) + 0.2 * Math.sin(w + 0.9 * Math.sin(14 * w)); },
    fm2: (u) => { const w = 2 * Math.PI * u; return Math.tanh(1.3 * (Math.sin(w) + 0.28 * Math.sin(2 * w) + 0.08 * Math.sin(3 * w))) / 0.92; },
    flat: () => 0,
  };
  const PER = { pulse: 22, pulse25: 26, tri: 30, noise: 72, noise2: 72, fm: 34, fm2: 48, flat: 20 };
  const DUR = { pulse: 0.9, pulse25: 1.1, tri: 1.3, noise: 0.35, noise2: 0.45, fm: 1.0, fm2: 1.6, flat: 1 };
  const path = (kind, width, amp) => {
    const per = PER[kind], fn = FN[kind], pts = [];
    if (kind === 'pulse' || kind === 'pulse25') {
      const duty = kind === 'pulse' ? 0.5 : 0.25;
      let d = `M0 ${-amp}`;
      for (let x = 0; x <= width + per; x += per) d += `H${x + per * duty}V${amp}H${x + per}V${-amp}`;
      return d;
    }
    const stepX = kind.startsWith('noise') ? per / 24 : 1;
    for (let x = 0; x <= width + per + 0.01; x += stepX) {
      const y = (-fn((x / per) % 1) * amp).toFixed(1);
      pts.push(kind.startsWith('noise') || kind === 'tri' ? `${x.toFixed(1)} ${y}H${(x + stepX).toFixed(1)}` : `${x.toFixed(1)} ${y}`);
    }
    return 'M' + pts.join('L');
  };
  CH.forEach((ch, c) => {
    const col = c % 2, row = Math.floor(c / 2);
    const x = x0 + col * (colW + 4), y = y0 + row * (rowH + 3);
    const tc = ch.chip === 0 ? '#ffc870' : ch.chip === 1 ? '#74f0cf' : '#6b7488';
    out.push(`<rect x="${x + 0.5}" y="${y + 0.5}" width="${colW - 1}" height="${rowH - 1}" rx="7" fill="#05080d" stroke="#202a3c"/>`);
    out.push(text(`${c + 1} ${ch.name.toLowerCase()}`, x + 6, y + 5, 1, '', ` fill="${CHIPCOL[ch.chip]}"`));
    out.push(text(ch.scope, x + colW - 7 - tw(ch.scope, 1), y + rowH - 11, 1, 'dm'));
    const cy = y + 13 + (rowH - 25) / 2, amp = (rowH - 31) / 2;
    const cid = `sc${c}`;
    defs.push(`<clipPath id="${cid}"><rect x="${x + 3}" y="${y + 13}" width="${colW - 6}" height="${rowH - 16}"/></clipPath>`);
    out.push(`<path d="M${x + 6} ${cy}h${colW - 12}" stroke="#13202d" stroke-dasharray="1.5 2.5"/>`);
    const kind = c === 6 ? 'noise2' : ch.wave;
    const vals = LV[c].map((v) => {
      const a = Math.max(0.03, c < 4 ? (v > 0 ? 0.85 : 0) : Math.min(1, v * 1.25));
      return `1 ${a < 0.1 ? +a.toFixed(2) : +a.toFixed(1)}`;
    });
    const still = ch.wave === 'flat' || LV[c].every((v) => v === 0);
    out.push(`<g clip-path="url(#${cid})"><g transform="translate(${x + 3} ${cy})">`
      + `<g${still ? ` style="scale:${vals[0]}"` : animAttr(steps(vals, 'scale'), `scale:${vals[0]};`)}>`
      + `<path${drift(PER[kind], DUR[kind])} d="${path(kind, colW - 6, amp)}" fill="none" stroke="${tc}" stroke-width="1.2" vector-effect="non-scaling-stroke" stroke-linejoin="round"/>`
      + `</g></g></g>`);
  });
}

// --- piano strip ----------------------------------------------------------------------------
{
  const LO = 33, HI = 96; // A1 .. C7
  const isBlack = (m) => [1, 3, 6, 8, 10].includes(m % 12);
  const whites = [];
  for (let m = LO; m <= HI; m++) if (!isBlack(m)) whites.push(m);
  const px = 10, py = 424, pw = W - 20, ph = 38, kw = pw / whites.length;
  const wx = new Map(whites.map((m, i) => [m, px + i * kw]));
  out.push(`<rect x="${px - 0.5}" y="${py - 0.5}" width="${pw + 1}" height="${ph + 1}" rx="3" fill="#0a0d13" stroke="${P.edge}"/>`);
  let wk = '';
  for (const [m, x] of wx) wk += `<rect x="${(x + 0.6).toFixed(2)}" y="${py}" width="${(kw - 1.2).toFixed(2)}" height="${ph}" rx="1.5"/>`;
  out.push(`<g fill="#dfe5ee">${wk}</g>`);
  const ROLE = { k: P.teal, b: P.amber, m: P.coral };
  const lit = (m, role) => Array.from({ length: NS }, (_, s) => {
    const b = songBeat(s);
    return keysOn.some((k) => k.midi === m && k.role === role && k.b0 < b + 0.5 && k.b1 > b) ? 1 : 0;
  });
  const keyRect = (m) => {
    if (!isBlack(m)) return [wx.get(m) + 2, py + ph * 0.62, kw - 4, ph * 0.36];
    const x = wx.get(m - 1) + kw - kw * 0.32;
    return [x + 1.2, py + ph * 0.36, kw * 0.64 - 2.4, ph * 0.2];
  };
  const overlays = (black) => {
    let s = '';
    for (let m = LO; m <= HI; m++) {
      if (isBlack(m) !== black) continue;
      for (const role of ['k', 'b', 'm']) {
        const v = lit(m, role);
        if (!v.some(Boolean)) continue;
        const [x, y, w, h] = keyRect(m);
        s += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" rx="1" fill="${ROLE[role]}" opacity="${v[0]}"${animAttr(steps(v, 'opacity'))}/>`;
      }
    }
    return s;
  };
  out.push(overlays(false));
  let bk = '';
  for (let m = LO; m <= HI; m++) {
    if (!isBlack(m)) continue;
    const x = wx.get(m - 1) + kw - kw * 0.32;
    bk += `<rect x="${x.toFixed(2)}" y="${py}" width="${(kw * 0.64).toFixed(2)}" height="${(ph * 0.6).toFixed(2)}" rx="1"/>`;
  }
  out.push(`<g fill="#151a24">${bk}</g>`);
  out.push(overlays(true));
  // octave marks on the C keys
  for (const [m, x] of wx) if (m % 12 === 0) out.push(text(`C${m / 12 - 1}`, x + 3, py + ph - 9, 1, 'dk', ' opacity=".45"'));
}

// --- status bar -----------------------------------------------------------------------------
{
  const y = 474;
  out.push(`<path d="M10 ${y - 5.5}h${W - 20}" stroke="${P.edge}"/>`);
  let x = 12;
  const put = (s, cls) => { out.push(text(s, x, y, 1, cls)); x += tw(s, 1) + 7; };
  put('frame', 'dm'); put('18/257', 'tx');
  put('row', 'dm');
  // animated row counter (hex): a strip of digits per position, clipped
  // A counter digit is a clipped strip of glyphs stepping on a regular cycle: `per` seconds for
  // the whole strip, starting T0 seconds into the song (the display opens on row OFFSET).
  const T0 = OFFSET * 0.75;
  const strip = (chars, per, cx) => {
    const id = `ds${cx | 0}`, n = chars.length, idx0 = Math.floor((T0 % per) / per * n + 1e-9);
    defs.push(`<clipPath id="${id}"><rect x="${cx - 1}" y="${y - 1}" width="7" height="9"/></clipPath>`);
    let s = '';
    [...chars].forEach((ch, i) => { s += text(ch, cx, y + i * 10, 1, 'yl'); });
    const name = `n${id}`;
    anim.push(`@keyframes ${name}{from{transform:translateY(0)}to{transform:translateY(-${n * 10}px)}}`);
    out.push(`<g clip-path="url(#${id})"><g transform="translate(0 ${-idx0 * 10})" class="tr" style="animation:${name} ${per}s steps(${n},end) ${-(+(T0 % per).toFixed(3)) - 0.02}s infinite">${s}</g></g>`);
  };
  strip('01234', 60, x);
  strip('0123456789ABCDEF', 12, x + 6);
  x += 12; out.push(text('/4F', x, y, 1, 'tx')); x += tw('/4F', 1) + 7;
  put('time', 'dm');
  out.push(text('0:24:', x, y, 1, 'tx')); x += tw('0:24:', 1) + 1;
  strip('012345', 60, x);
  strip('0123456789', 10, x + 6);
  x += 12; out.push(text('/10:00:00', x, y, 1, 'tx')); x += tw('/10:00:00', 1) + 7;
  put('seed', 'dm'); put('1992', 'tx');
  put('speed', 'dm'); put('12', 'tx');
  put('tempo', 'dm'); put('80 bpm', 'tx'); put('F major', 'tx'); put('-14 LUFS', 'tx');
  put('samples', 'dm'); put('0', 'yl');
  // key legend at the right
  const leg = [['keys', P.teal], ['bass', P.amber], ['kalimba', P.coral]];
  let lx = W - 12;
  for (let i = leg.length - 1; i >= 0; i--) {
    const [l, col] = leg[i];
    lx -= tw(l, 1);
    out.push(text(l, lx, y, 1, 'dm'));
    lx -= 9;
    out.push(`<rect x="${lx}" y="${y + 1}" width="6" height="5" rx="1" fill="${col}"/>`);
    lx -= 8;
  }
  out.push(text('loop pattern', lx - tw('loop pattern', 1) - 4, y, 1, 'nt'));
}

// ---------------------------------------------------------------------------------------------
// Assemble
// ---------------------------------------------------------------------------------------------
for (const ch of usedGlyphs) defs.unshift(`<path id="${gid(ch)}" d="${bitmapPath(F5[ch].split('|'))}"/>`);

const style = `
.tx{fill:${P.text}}.lb{fill:${P.label}}.dm{fill:${P.dim}}.fa{fill:#3a4459}.cr{fill:${P.cream}}.dk{fill:#141822}
.nt{fill:${P.note}}.in{fill:${P.ins}}.vl{fill:${P.vol}}.fx{fill:${P.fx}}.yl{fill:${P.yel}}.rl{fill:${P.rel}}.tt{fill:${P.teal}}
.e{fill:${P.dot}}.rn{fill:#5c6680}.rb{fill:#c9b46a}
.a{animation-duration:${PERIOD}s;animation-iteration-count:infinite;animation-timing-function:steps(1,end)}
.sc{animation:sc ${PERIOD}s steps(${ROWS},end) infinite}
@keyframes sc{to{transform:translateY(-${ROWS * RH}px)}}
.pm{animation:pm .75s linear infinite}
@keyframes pm{0%{transform:scaleY(1)}18%{transform:scaleY(.66)}100%{transform:scaleY(.86)}}
${anim.join('\n')}
@media (prefers-reduced-motion:reduce){.a,.sc,.tr,.pm{animation:none!important}}
`.trim();

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="t d">
<title id="t">CASTAWAY</title>
<desc id="d">Castaway, a ten-hour lo-fi island video, shown as an invented multi-chip music tracker playing minute 24 of its own schedule: island lanes as channels, the synthesized theme as an FM chip, and an empty sample channel.</desc>
<style>${style}</style>
<defs>${defs.join('')}</defs>
${out.join('\n')}
</svg>
`;
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, svg);
console.log(`wrote ${path.relative(process.cwd(), OUT)} (${(svg.length / 1024).toFixed(1)} KB, ${kfn} keyframe sets)`);
