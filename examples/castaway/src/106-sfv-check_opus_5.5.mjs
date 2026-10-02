#!/usr/bin/env node
// SFV check header for the Castaway README (style catalogue entry xfer-10).
// Plain Node, no dependencies, deterministic. Run:
//   node examples/castaway/src/106-sfv-check_opus_5.5.mjs          (from the snapshot below)
//   node examples/castaway/src/106-sfv-check_opus_5.5.mjs --live   (re-reads the sound files)
// It writes assets/106-sfv-check_opus_5.5.svg and 106-sfv-check_opus_5.5.md next to it.
// Edit this file, not the outputs.
//
// THE STYLE
// An .sfv ("simple file verification") file is a tiny text file that travels with a set of
// files: a few comment lines that start with a semicolon (who generated it, when, and often a
// block of sizes and times), then one line per file: the name, whitespace, and an eight-digit
// CRC-32 in upper-case hex. Names that differ only by a number make the left column almost
// identical down the page, so the right column is the only thing that moves. Checking it gives
// one verdict per file (OK, bad, missing) and a tally. People read these in NFO viewers: a
// plain window, a dark ground, a fixed-width DOS font with block characters, text centred.
// Here the viewer (Driftglass) and the generator (Flotsum) are invented, and the window chrome
// is generic; no real program's interface, name or wording is copied.
//
// MEANING, CHANGED
// Nothing here is anybody's release. The listed files are Castaway's own synthesized sounds
// (written by its tools/make_audio.py), and the checksums are their real CRC-32s, computed
// read-only on 2026-10-01. The check in the banner always passes because it is true: the
// values were taken from the files. The "BAR-Check" log in the .md is a real check too: in
// the seed-1992 run of tools/schedule.py every activity starts on a bar line (a multiple of
// 3 s), and the generator verifies that from the event times below.
//
// HOW IT IS DRAWN
// The viewer shows an 80 x 30 text grid of 8 x 16 cells. Every character is a <use> of a glyph
// path from the bitmap font below (never <text>). Block characters are not glyphs: full and
// half blocks become one merged path of 8 x 8 squares, and the shade blocks become rects with
// 2-pixel dot patterns (a 1-pixel checker turns to moire when a README scales the picture).
// The check runs one file per beat at the theme's 80 BPM (0.75 s), so every OK lands on the
// beat. The loop is 21 s, seven bars of the theme: read, check, show the tally, then wipe the
// results top to bottom and start again. Motion is stepped (step-end), like a text
// screen being rewritten. With prefers-reduced-motion the picture rests on the finished check.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '106-sfv-check_opus_5.5';
const OUT_SVG = path.join(HERE, '..', 'assets', `${SLUG}.svg`);
const OUT_MD = path.join(HERE, '..', `${SLUG}.md`);
const LIVE = process.argv.includes('--live');
// D:/python/castaway/media/audio, relative to this file. Only ever read.
const AUDIO_DIR = path.resolve(HERE, '..', '..', '..', '..', 'castaway', 'media', 'audio');

// ---------------------------------------------------------------------------------------------
// Data. Snapshot taken read-only from D:/python/castaway on 2026-10-01.
// ---------------------------------------------------------------------------------------------
const STAMP = { date: '2026-10-01', time: '22:51.43' };
// Re-checked read-only on this date: all 15 CRC-32s, sizes and times still matched the files,
// and the seed-1992 run below still had the same 219 events, every one on a bar.
const CHECKED = '2026-10-02';
// [path inside media/audio, bytes, time written (that day), CRC-32, the checker's remark]
const FILES = [
  ['music/castaway_lofi_theme_loop_60s.wav', 11520044, '18:49.39', '17EDD2F4', '80 BPM, F major. it loops'],
  ['sfx/ambience_ocean_loop_60s.wav', 11520044, '18:49.43', '0024149F', 'the sea. also loops'],
  ['sfx/footstep_sand_01.wav', 21164, '18:49.44', 'BCF057D3', 'left'],
  ['sfx/footstep_sand_02.wav', 21164, '18:49.44', '810FA9AF', 'right'],
  ['sfx/footstep_sand_03.wav', 21164, '18:49.44', '4FAFEA81', 'left'],
  ['sfx/footstep_sand_04.wav', 21164, '18:49.45', 'CB4D6D9C', 'right. that was a walk'],
  ['sfx/footstep_water_01.wav', 28844, '18:49.49', 'F85CF963', 'left, on the water'],
  ['sfx/footstep_water_02.wav', 28844, '18:49.49', 'DFDE7F7D', 'right, still on it'],
  ['sfx/footstep_water_03.wav', 28844, '18:49.49', 'FD122611', 'left, iced coffee'],
  ['sfx/footstep_water_04.wav', 28844, '18:49.49', '6C9403E8', 'she could leave any time'],
  ['sfx/cork_squeak_in.wav', 67244, '18:49.47', '97DC1176', 'bottle. came straight back'],
  ['sfx/drone_fly_in.wav', 960044, '18:49.46', '22464831', 'parcel: more headphones'],
  ['sfx/cat_mrrp.wav', 30764, '18:50.01', 'DC5B082A', 'cat, arrived by crate'],
  ['sfx/phone_ping_one_bar.wav', 268844, '18:49.45', '306AD26C', '1 bar, top of the palm'],
  ['sfx/shark_fin_pulse_loop.wav', 576044, '18:49.48', '9E1888FE', 'shark. nods on the beat'],
].map(([p, bytes, time, crc, note]) => ({ p, bytes, time, crc, note }));

// From `python -B tools/schedule.py --json <scratch file>` (default run: seed 1992, 10:00:00),
// read 2026-10-01. The run had 219 events, all of them on a bar. These are ones a README can
// show: [start in seconds, how long it lasted in seconds, activity id, tier, a remark].
const RUN = { seed: 1992, length: '10:00:00', events: 219, onBar: 219 };
const EVENTS = [
  [249, 93, 'fishing_quiet', 'regular', 'nibbles. nothing.'],
  [456, 42, 'coconut_sip', 'regular', 'eyes closed'],
  [1179, 33, 'stroll', 'regular', 'to the water and back'],
  [1449, 51, 'coconut_sip', 'regular', 'busy now'],
  [1458, 148, 'ship_passes_unseen', 'occasional', 'she never sees it'],
  [1689, 22, 'jog_lap', 'regular', 'the island is short'],
  [2646, 1565, 'cat_visit', 'rare', 'by crate. naps up palm'],
  [4077, 6, 'tide_takes_sandcastle', 'chained', 'the tide wins'],
  [4881, 172, 'hammock', 'rare', 'no second tree'],
  [11055, 107, 'message_in_bottle', 'occasional', 'washes straight back'],
  [12963, 127, 'coconut_crab', 'occasional', 'the coconut walks off'],
  [18846, 114, 'rescue_almost', 'super rare', 'it toots. sails on'],
  [21906, 54, 'bottle_reply', 'chained', 'a reply, 3 h later'],
  [22044, 155, 'signal_hunt', 'rare', '1 bar, top of palm'],
  [35049, 1054, 'cat_visit', 'rare', 'back again'],
];

// CRC-32 (IEEE 802.3, the one SFV uses), table-driven.
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  return ((c ^ 0xFFFFFFFF) >>> 0).toString(16).toUpperCase().padStart(8, '0');
}
if (LIVE) {
  // Re-read the real files (read-only) and use what is there now. Reports any drift.
  for (const f of FILES) {
    const abs = path.join(AUDIO_DIR, f.p);
    if (!fs.existsSync(abs)) { console.warn(`MISSING  ${f.p}`); continue; }
    const buf = fs.readFileSync(abs);
    const crc = crc32(buf);
    const m = fs.statSync(abs).mtime;
    const time = `${String(m.getHours()).padStart(2, '0')}:${String(m.getMinutes()).padStart(2, '0')}.${String(m.getSeconds()).padStart(2, '0')}`;
    if (crc !== f.crc || buf.length !== f.bytes) console.warn(`CHANGED  ${f.p}  ${f.crc} -> ${crc}`);
    Object.assign(f, { crc, bytes: buf.length, time });
  }
} else {
  // Sanity check on the CRC routine itself: the standard check value for "123456789".
  if (crc32(Buffer.from('123456789')) !== 'CBF43926') throw new Error('crc32 is wrong');
}
// The island's own zipscript rule: every activity starts on a bar (3 s).
for (const [t] of EVENTS) if (t % 3) throw new Error(`event at ${t}s is off the bar`);

// ---------------------------------------------------------------------------------------------
// 8x16 bitmap font in the manner of a VGA text-mode ROM (the font an NFO viewer would use).
// Rows are '#'/'.' strings placed from row `top` of the cell. Caps sit on rows 2-11.
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
  '<': [3, '....##. ...##.. ..##... .##.... ##..... .##.... ..##... ...##.. ....##.'],
  '>': [3, '.##.... ..##... ...##.. ....##. .....## ....##. ...##.. ..##... .##....'],
  '*': [5, '.##..##. ..####.. ######## ..####.. .##..##.'],
  '+': [5, '...##... ...##... .######. ...##... ...##...'],
  '=': [6, '.######. ........ ........ .######.'],
  '·': [7, '...##... ...##...'],
  '→': [5, '....##.. .....##. ######## .....##. ....##..'],
  '♪': [3, '...##... ...###.. ...####. ...##.##. ...##..#. ...##... ...##... .####... #####... .###....'],
};
for (const [ch, [top, rows]] of Object.entries(PUNCT)) def(ch, top, rows);
FONT.set(' ', new Array(16).fill(0));

// Bitmap -> compact path: greedy merge of horizontal runs into rectangles.
function bitmapPath(get, width, height, sx = 1, sy = 1, ox = 0, oy = 0) {
  const rects = [];
  let open = [];
  for (let y = 0; y < height; y++) {
    const runs = [];
    for (let x = 0; x < width;) {
      if (get(x, y)) { const s0 = x; while (x < width && get(x, y)) x++; runs.push([s0, x - s0]); } else x++;
    }
    const next = [];
    for (const [x0, w] of runs) {
      const o = open.find((r) => r.x === x0 && r.w === w && r.y + r.h === y);
      if (o) { o.h++; next.push(o); } else { const r = { x: x0, w, y, h: 1 }; rects.push(r); next.push(r); }
    }
    open = next;
  }
  return rects.map((r) => `M${ox + r.x * sx} ${oy + r.y * sy}h${r.w * sx}v${r.h * sy}h${-r.w * sx}z`).join('');
}
const glyphPath = (g) => bitmapPath((x, y) => (g[y] >> (7 - x)) & 1, 8, 16);

const glyphIds = new Map();
function gid(ch) {
  if (!FONT.has(ch)) throw new Error(`no glyph for ${JSON.stringify(ch)} (U+${ch.codePointAt(0).toString(16)})`);
  if (!glyphIds.has(ch)) glyphIds.set(ch, `g${glyphIds.size.toString(36)}`);
  return glyphIds.get(ch);
}
const len = (s) => [...s].length;
const padR = (s, n) => s + ' '.repeat(Math.max(0, n - len(s)));
const padL = (s, n) => ' '.repeat(Math.max(0, n - len(s))) + s;

// A run of text as <use> elements (x, y in SVG units; spaces cost nothing).
function text(x, y, str) {
  let out = '';
  [...str].forEach((ch, i) => { if (ch !== ' ') out += `<use href="#${gid(ch)}" x="${x + i * CW}" y="${y}"/>`; });
  return out;
}

// ---------------------------------------------------------------------------------------------
// The document: castaway.sfv as an 80 x 30 grid. Each cell holds a character and an ink class.
// ---------------------------------------------------------------------------------------------
const COLS = 80, ROWS = 30, CW = 8, CH = 16;
const grid = Array.from({ length: ROWS }, () => Array.from({ length: COLS }, () => ({ ch: ' ', k: '' })));
function put(r, c, str, k) {
  [...str].forEach((ch, i) => {
    if (c + i >= COLS) throw new Error(`row ${r} overflows 80 columns: ${str}`);
    grid[r][c + i] = { ch, k };
  });
}

// Block art. Maps use '#' for a solid 8x8 square (half a cell), 'D' for a solid square that
// darkens to a dark shade when its whole cell is solid, and 1/2/3 for light, medium and dark
// shade. Two map rows make one text row: the pair becomes a full block, an upper or lower half
// block, a shade block, or a space. Exactly the characters CP437 offers, nothing finer.
function blockArt(r0, c0, map, k) {
  const h = map.length, w = Math.max(...map.map((s) => s.length));
  const at = (x, y) => (y < h ? map[y][x] || '.' : '.');
  const solid = (v) => v === '#' || v === 'D';
  for (let y = 0; y < h; y += 2) {
    for (let x = 0; x < w; x++) {
      const t = at(x, y), b = at(x, y + 1);
      let ch = ' ';
      if (solid(t) && solid(b)) ch = t === 'D' || b === 'D' ? '▓' : '█';
      else if (solid(t)) ch = '▀';
      else if (solid(b)) ch = '▄';
      else ch = [' ', '░', '▒', '▓'][Math.max(+t || 0, +b || 0)];
      if (ch !== ' ') grid[r0 + y / 2][c0 + x] = { ch, k };
    }
  }
}

// The logo: CASTAWAY, 12 squares tall (six text rows), 2-square strokes, notched corners. The
// bottom row of each letter fades to a dark shade and a light-shade row below reflects it, as
// if the word stood in shallow water.
const LETTERS = {
  C: ['.####.', '######', '##..##', '##..##', '##....', '##....', '##....', '##....', '##..##', '##..##', '######', '.####.'],
  A: ['.####.', '######', '##..##', '##..##', '##..##', '##..##', '######', '######', '##..##', '##..##', '##..##', '##..##'],
  S: ['.####.', '######', '##..##', '##....', '##....', '.####.', '..####', '....##', '....##', '##..##', '######', '.####.'],
  T: ['######', '######', '..##..', '..##..', '..##..', '..##..', '..##..', '..##..', '..##..', '..##..', '..##..', '..##..'],
  W: ['##....##', '##....##', '##....##', '##....##', '##....##', '##....##', '##.##.##', '##.##.##', '##.##.##', '##.##.##', '########', '.##..##.'],
  Y: ['##..##', '##..##', '##..##', '##..##', '##..##', '######', '.####.', '..##..', '..##..', '..##..', '..##..', '..##..'],
};
function logoMap(word) {
  const rows = Array.from({ length: 12 }, () => '');
  [...word].forEach((ch, i) => {
    const L = LETTERS[ch];
    for (let y = 0; y < 12; y++) rows[y] += (i ? '.' : '') + L[y];
  });
  const fade = (r) => r.replace(/#/g, 'D');
  const mirror = (r) => r.replace(/#/g, '1');
  return [...rows.slice(0, 10), fade(rows[10]), fade(rows[11]), mirror(rows[10]), mirror(rows[9])];
}

// The island, 20 squares wide and 24 tall: a leaning palm, a mound of sand, the raft, the sea
// (medium shade in the shallows, light shade further out).
const ISLAND = [
  '....................',
  '.........##.........',
  '..........##........',
  '.....############...',
  '...##....#####...##.',
  '..#.....#######....#',
  '.#....##..###..##...',
  '.....#....###....#..',
  '....#.....###.....#.',
  '....#......#......#.',
  '...........#........',
  '..........##........',
  '..........##........',
  '..........#.........',
  '.........##.........',
  '.........##.........',
  '.........#..........',
  '........##..........',
  '.....#######........',
  '...###########......',
  '.###############....',
  '################.###',
  '22222222222222221111',
  '.2.2.2.2.2.2.2.1.1.1',
];

const ROW_FILES = 14;
{
  put(0, 0, `; Generated by Flotsum v1.0 on ${STAMP.date} at ${STAMP.time}`, 'c');
  for (let r = 1; r < ROW_FILES; r++) put(r, 0, ';', 'c');
  blockArt(2, 2, logoMap('CASTAWAY'), 'a');
  blockArt(1, 60, ISLAND, 'a');
  put(1, 64, 'v', 'a'); put(2, 61, 'v', 'a');
  put(9, 3, '(working title) · a lo-fi island video · ten hours', 'c');
  put(10, 3, 'she idles. every so often, on the next bar, a gag.', 'c');
  put(11, 3, 'all sound synthesized from code. verified uneventful.', 'c');
  put(12, 3, 'run python tools/serve.py, open', 'c');
  put(12, 35, 'http://127.0.0.1:8765/', 'lk');
  FILES.forEach((f, i) => { put(ROW_FILES + i, 0, padR(f.p, 39), 't'); put(ROW_FILES + i, 39, f.crc, 'w'); });
  put(29, 0, `; ${FILES.length} files, all made by tools/make_audio.py. nothing else happens.`, 'c');
}
const C_STATUS = 49, C_NOTE = 53;
for (const f of FILES) if (C_NOTE + len(f.note) > COLS) throw new Error(`note too long: ${f.note}`);

// ---------------------------------------------------------------------------------------------
// Window geometry (SVG units). The text grid sits centred in a wider client area.
// ---------------------------------------------------------------------------------------------
const W = 840;
const TB = 30, MB = 22, SB = 26, PADY = 14;
const TX = (W - COLS * CW) / 2, TY = TB + MB + PADY;
const CLIENT_BOT = TY + ROWS * CH + PADY;
const H = CLIENT_BOT + SB;
const rowY = (r) => TY + r * CH;

const INK = {
  bg: '#0c0f14', chrome: '#1b2029', chrome2: '#141820', line: '#2b313c', edge: '#3a414d',
  t: '#d5d9df', c: '#8e98a8', w: '#f4f6f8', a: '#5ed3c7', ok: '#4fdc6a', n: '#97a1b0',
  lk: '#6cb6ff', ui: '#a9b1bd', uid: '#6b7482', hl: '#1c2c40',
};

// ---------------------------------------------------------------------------------------------
// Timeline: one file per beat (80 BPM), seven bars per loop.
// ---------------------------------------------------------------------------------------------
const BEAT = 0.75, L = 28 * BEAT; // 21 s: seven bars of 3 s
const FIRST = 2; // beats 0-1: the file is read
const okAt = (i) => (FIRST + i + 1) * BEAT; // the OK lands on the beat after its row was read
const DONE = okAt(FILES.length - 1);
const AGAIN = 26 * BEAT; // the last two beats wipe the results, top to bottom
const WIPE = 0.1;
const pct = (t) => `${+(t / L * 100).toFixed(4)}%`;
const css = [];
const anims = new Map();
// A visibility track from a list of [on, off) intervals, as stepped opacity keyframes.
function track(name, spans, period = L) {
  const vis = (t) => spans.some(([a, b]) => t >= a && t < b);
  const pts = new Set([0, period]);
  for (const [a, b] of spans) { pts.add(a); pts.add(Math.min(b, period)); }
  const at = (t) => `${+(t / period * 100).toFixed(4)}%`;
  const ks = [...pts].sort((x, y) => x - y).map((t) => `${at(t)}{opacity:${vis(t === period ? period - 1e-6 : t) ? 1 : 0}}`);
  anims.set(name, `@keyframes ${name}{${ks.join('')}}`);
  return name;
}
const animRule = (sel, name, dur = L) => css.push(`${sel}{animation:${name} ${dur}s step-end infinite}`);

const under = [];
const layers = [];
const extraDefs = [];

// The SFV text itself.
{
  const byK = new Map();
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const { ch, k } = grid[r][c];
      if (ch === ' ' || '█▀▄░▒▓'.includes(ch)) continue;
      if (!byK.has(k)) byK.set(k, '');
      byK.set(k, byK.get(k) + `<use href="#${gid(ch)}" x="${TX + c * CW}" y="${rowY(r)}"/>`);
    }
  }
  // Block characters: solid squares merged into one path; shades as patterned rects.
  const sq = new Set();
  const shades = { '░': [], '▒': [], '▓': [] };
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const { ch } = grid[r][c];
      if (ch === '█' || ch === '▀') sq.add(`${c},${r * 2}`);
      if (ch === '█' || ch === '▄') sq.add(`${c},${r * 2 + 1}`);
      if (shades[ch]) shades[ch].push([r, c]);
    }
  }
  // A soft glow round the block art, as a rendering NFO viewer can draw it: the same path
  // stroked wide and faint underneath (no filter, so it stays cheap to draw).
  const artD = bitmapPath((x, y) => sq.has(`${x},${y}`), COLS, ROWS * 2, CW, CH / 2, TX, TY);
  extraDefs.push(`<path id="art" d="${artD}"/>`);
  under.push(`<g fill="none" stroke="${INK.a}" stroke-linejoin="round"><use href="#art" stroke-width="12" opacity="0.07"/>`
    + `<use href="#art" stroke-width="6" opacity="0.12"/></g>`);
  let art = `<use href="#art" class="a"/>`;
  for (const [ch, cells] of Object.entries(shades)) {
    // merge horizontal runs of the same shade
    const runs = [];
    for (const [r, c] of cells) {
      const last = runs[runs.length - 1];
      if (last && last.r === r && last.c + last.n === c) last.n++; else runs.push({ r, c, n: 1 });
    }
    const id = { '░': 'p1', '▒': 'p2', '▓': 'p3' }[ch];
    art += runs.map((u) => `<rect x="${TX + u.c * CW}" y="${rowY(u.r)}" width="${u.n * CW}" height="${CH}" fill="url(#${id})"/>`).join('');
  }
  layers.push(art);
  for (const [k, uses] of byK) layers.push(`<g class="${k}">${uses}</g>`);
  // The link is underlined, as a viewer shows a clickable URL.
  const url = 'http://127.0.0.1:8765/';
  layers.push(`<rect class="lk" x="${TX + 35 * CW}" y="${rowY(12) + 14}" width="${len(url) * CW}" height="1"/>`);
}

// The check: a cursor bar steps down one row per beat with a spinner; each OK lands on the beat.
{
  const y0 = rowY(ROW_FILES);
  const ks = [`0%{opacity:0;transform:translate(0px,0px)}`];
  for (let i = 0; i < FILES.length; i++) ks.push(`${pct((FIRST + i) * BEAT)}{opacity:1;transform:translate(0px,${i * CH}px)}`);
  ks.push(`${pct(DONE)}{opacity:0;transform:translate(0px,${(FILES.length - 1) * CH}px)}`);
  ks.push(`100%{opacity:0;transform:translate(0px,${(FILES.length - 1) * CH}px)}`);
  anims.set('hl', `@keyframes hl{${ks.join('')}}`);
  css.push('.hl{opacity:0}');
  animRule('.hl', 'hl');
  let spin = '';
  ['-', '\\', '|', '/'].forEach((ch, k) => {
    const name = track(`sp${k}`, [[k * BEAT / 4, (k + 1) * BEAT / 4]], BEAT);
    spin += `<g class="ui sp${k}">${text(TX + C_STATUS * CW + 4, y0, ch)}</g>`;
    css.push(`.sp${k}{animation:${name} ${BEAT}s step-end infinite}`);
  });
  // The bar goes under the text; the spinner (same track) goes over it.
  under.push(`<g class="hl"><rect x="${TX - 8}" y="${y0}" width="${COLS * CW + 16}" height="${CH}" fill="${INK.hl}"/>`
    + `<rect x="${TX - 8}" y="${y0}" width="3" height="${CH}" class="lk"/></g>`);
  layers.push(`<g class="hl">${spin}</g>`);

  let res = '';
  FILES.forEach((f, i) => {
    const name = track(`k${i}`, [[okAt(i), AGAIN + i * WIPE]]);
    css.push(`.k${i}{animation:${name} ${L}s step-end infinite}`);
    const y = rowY(ROW_FILES + i);
    res += `<g class="k${i}"><g class="ok">${text(TX + C_STATUS * CW, y, 'OK')}</g><g class="n">${text(TX + C_NOTE * CW, y, f.note)}</g></g>`;
  });
  layers.push(res);
}

// ---------------------------------------------------------------------------------------------
// Window chrome: title bar, menu bar, scroll bar, status bar with a progress meter.
// ---------------------------------------------------------------------------------------------
const chrome = [];
{
  // Body and frame.
  chrome.push(`<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="9" fill="${INK.bg}" stroke="${INK.edge}"/>`);
  chrome.push(`<path d="M0.5 ${TB}V9.5a9 9 0 0 1 9-9H${W - 9.5}a9 9 0 0 1 9 9V${TB}z" fill="${INK.chrome}" stroke="${INK.edge}"/>`);
  chrome.push(`<rect x="1" y="${TB}" width="${W - 2}" height="${MB}" fill="${INK.chrome2}"/>`);
  chrome.push(`<rect x="1" y="${TB + MB - 1}" width="${W - 2}" height="1" fill="${INK.line}"/>`);
  chrome.push(`<path d="M1 ${CLIENT_BOT}H${W - 1}V${H - 9.5}a8.5 8.5 0 0 1-8.5 8.5H9.5a8.5 8.5 0 0 1-8.5-8.5z" fill="${INK.chrome2}"/>`);
  chrome.push(`<rect x="1" y="${CLIENT_BOT}" width="${W - 2}" height="1" fill="${INK.line}"/>`);

  // Title: a little page-with-a-tick icon, the file name and the (invented) viewer.
  const ICON = [
    '.#######....',
    '.#.....##...',
    '.#.....#.#..',
    '.#.....####.',
    '.#........#.',
    '.#.###....#.',
    '.#........#.',
    '.#.####.oo#.',
    '.#.....oo.#.',
    '.#.oo.oo..#.',
    '.#..ooo...#.',
    '.#...o....#.',
    '.##########.',
  ];
  const ix = 12, iy = 8;
  chrome.push(`<path class="ui" d="${bitmapPath((x, y) => ICON[y][x] === '#', 12, 13, 1, 1, ix, iy)}"/>`);
  chrome.push(`<path class="ok" d="${bitmapPath((x, y) => ICON[y][x] === 'o', 12, 13, 1, 1, ix, iy)}"/>`);
  chrome.push(`<g class="w">${text(32, 7, 'castaway.sfv')}</g><g class="ui">${text(32 + 13 * CW, 7, '- Driftglass 2.1')}</g>`);
  // Window buttons: minimise, maximise, close.
  const bx = W - 3 * 28 - 6;
  for (let i = 0; i < 3; i++) chrome.push(`<rect x="${bx + i * 28}" y="6" width="22" height="18" rx="3" fill="${INK.chrome2}" stroke="${INK.line}"/>`);
  chrome.push(`<g class="ui"><rect x="${bx + 6}" y="18" width="10" height="2"/>`
    + `<path d="M${bx + 28 + 6} 10h10v9h-10zM${bx + 28 + 8} 13v4h6v-4z" fill-rule="evenodd"/>`
    + `<path d="${bitmapPath((x, y) => x === y || x === 8 - y, 9, 9, 1, 1, bx + 56 + 6, 10)}"/></g>`);
  // Menu.
  const menu = ['File', 'Edit', 'View', 'Check', 'Help'];
  let mx = 14;
  for (const m of menu) { chrome.push(`<g class="ui">${text(mx, TB + 3, m)}</g>`); mx += (len(m) + 3) * CW; }
  chrome.push(`<g class="uid">${text(W - 14 - 30 * CW, TB + 3, 'CP437 · 8x16 · centred · 80 col')}</g>`);
  // Scroll bar: the thumb says there is more below. There is: the README.
  chrome.push(`<rect x="${W - 13}" y="${TB + MB + 4}" width="8" height="${CLIENT_BOT - TB - MB - 8}" rx="4" fill="${INK.chrome2}"/>`);
  chrome.push(`<rect x="${W - 13}" y="${TB + MB + 4}" width="8" height="${Math.round((CLIENT_BOT - TB - MB - 8) * 0.62)}" rx="4" fill="${INK.line}"/>`);
}

// Status bar: what the checker is doing, a 15-cell progress meter, and the algorithm.
const status = [];
{
  const y = CLIENT_BOT + 5;
  const N = FILES.length;
  const pa = track('pa', [[0, FIRST * BEAT]]);
  const pb = track('pb', [[FIRST * BEAT, DONE]]);
  const pc = track('pc', [[DONE, AGAIN]]);
  const pd = track('pd', [[AGAIN, L]]);
  css.push('.pa,.pb,.pd{opacity:0}');
  animRule('.pa', pa); animRule('.pb', pb); animRule('.pc', pc); animRule('.pd', pd);
  const x0 = 12;
  status.push(`<g class="pa"><g class="ui">${text(x0, y, `Reading castaway.sfv: ${N} entries, CRC-32`)}</g></g>`);
  const pre = 'Checking ';
  status.push(`<g class="pb"><g class="ui">${text(x0, y, `${pre}   of ${N}, one file per beat (80 BPM)`)}</g></g>`);
  FILES.forEach((f, i) => {
    const name = track(`n${i}`, [[(FIRST + i) * BEAT, (FIRST + i + 1) * BEAT]]);
    css.push(`.n${i}{opacity:0}`);
    animRule(`.n${i}`, name);
    status.push(`<g class="w n${i}">${text(x0 + len(pre) * CW, y, String(i + 1).padStart(2, '0'))}</g>`);
  });
  const tally = `${N} files:`, okw = `${N} OK`, rest = ', 0 bad, 0 missing.';
  const xo = x0 + (len(tally) + 1) * CW, xr = xo + len(okw) * CW, xe = xr + (len(rest) + 1) * CW;
  status.push(`<g class="pc"><g class="w">${text(x0, y, tally)}</g><g class="ok">${text(xo, y, okw)}</g>`
    + `<g class="ui">${text(xr, y, rest)}</g>`
    + `<g class="ui">${text(xe, y, 'Verified uneventful.')}</g></g>`);
  status.push(`<g class="pd"><g class="ui">${text(x0, y, 'Nothing happened. Checking again: we have ten hours.')}</g></g>`);
  // Progress meter: one cell per file, lit with its OK.
  const mw = N * 8 + 4, mx = W - 14 - 6 * CW - 14 - mw;
  status.push(`<rect x="${mx}" y="${y + 2}" width="${mw}" height="12" rx="2" fill="${INK.bg}" stroke="${INK.line}"/>`);
  FILES.forEach((f, i) => status.push(`<rect class="ok k${i}" x="${mx + 3 + i * 8}" y="${y + 5}" width="6" height="6"/>`));
  status.push(`<g class="uid">${text(W - 14 - 6 * CW, y, 'CRC-32')}</g>`);
}

// ---------------------------------------------------------------------------------------------
// Assemble the SVG.
// ---------------------------------------------------------------------------------------------
const pat = (id, cells) => `<pattern id="${id}" width="4" height="4" patternUnits="userSpaceOnUse">${cells.map(([x, y]) => `<rect class="a" x="${x}" y="${y}" width="2" height="2"/>`).join('')}</pattern>`;
const patterns = [
  pat('p1', [[0, 0]]),
  pat('p2', [[0, 0], [2, 2]]),
  pat('p3', [[0, 0], [2, 0], [0, 2]]),
].join('');

css.unshift(Object.entries(INK).map(([k, v]) => `.${k}{fill:${v}}`).join(''));
css.push(...anims.values());
css.push('@media (prefers-reduced-motion:reduce){*{animation:none!important}}');

const glyphDefs = [...glyphIds].filter(([ch]) => ch !== ' ').map(([ch, id]) => `<path id="${id}" d="${glyphPath(FONT.get(ch))}"/>`).join('');
const TITLE = 'Castaway: castaway.sfv, checked';
const DESC = `Castaway, a ten-hour lo-fi island video, as an SFV file open in a dark NFO viewer. Semicolon comment lines hold a block-letter CASTAWAY logo and a palm island; then ${FILES.length} of the project's synthesized sound files with their real CRC-32 checksums are checked one per beat, each gaining a green OK and a remark, until the tally reads ${FILES.length} OK, 0 bad, 0 missing.`;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="t d">`
  + `<title id="t">${TITLE}</title><desc id="d">${DESC}</desc>`
  + `<style>${css.join('')}</style>`
  + `<defs>${glyphDefs}${patterns}${extraDefs.join('')}</defs>`
  + chrome.join('')
  + under.join('')
  + layers.join('')
  + status.join('')
  + `</svg>\n`;
fs.mkdirSync(path.dirname(OUT_SVG), { recursive: true });
fs.writeFileSync(OUT_SVG, svg);
console.log(`${path.relative(process.cwd(), OUT_SVG)}  ${(svg.length / 1024).toFixed(1)} KB  ${glyphIds.size} glyphs  ${W}x${H}  loop ${L}s`);

// ---------------------------------------------------------------------------------------------
// The README header (.md). File links are written for the castaway project root.
// ---------------------------------------------------------------------------------------------
const hms = (t) => `${Math.floor(t / 3600)}:${String(Math.floor(t / 60) % 60).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const N = FILES.length;
const ALT = `Castaway: castaway.sfv open in a dark NFO viewer window. Its semicolon comment lines hold a block-letter CASTAWAY logo standing in shallow water and a palm island; below, ${N} of the project's synthesized sound files are checked against their CRC-32s, one per beat, each gaining a green OK and a remark (footsteps: left, right, left, right; a bottle that came straight back; a parcel of more headphones) until the status bar reads ${N} files, ${N} OK, 0 bad, 0 missing.`;

// The .sfv as a plain ASCII text file: header comments, the size/time block, the CRC lines.
const sfvLines = [
  `; Generated by Flotsum v1.0 on ${STAMP.date} at ${STAMP.time}`,
  '; Castaway (working title), a ten-hour lo-fi island video, in development',
  '; every file below was synthesized from code by tools/make_audio.py:',
  '; no samples, no borrowed loops, no recordings.',
  '; paths are relative to media/audio/',
  ';',
  ...FILES.map((f) => `; ${padL(String(f.bytes), 9)}  ${f.time} ${STAMP.date} ${f.p}`),
  ';',
  ...FILES.map((f) => `${padR(f.p, 39)}${f.crc}`),
  ';',
  `; checked ${CHECKED}: ${N} files, ${N} OK, 0 bad, 0 missing`,
];

// The island's zipscript: a one-line verdict per activity, from the seed-1992 run.
const barLines = [
  "[BAR-Check] the island's zipscript. rule: every activity starts on a bar.",
  `[BAR-Check] 1 bar = 4 beats at 80 BPM = 3 s. run: seed ${RUN.seed}, ${RUN.length}`,
  '',
  ` ${padL('start', 7)}  ${padR('activity', 22)} ${padR('tier', 11)} ${padL('bar', 5)}  ${padR('', 2)}  remark`,
  ...EVENTS.map(([t, , id, tier, note]) => ` ${padL(hms(t), 7)}  ${padR(id, 22)} ${padR(tier, 11)} ${padL(String(t / 3), 5)}  OK  ${note}`),
  '   ...',
  `[BAR-Check] ${RUN.events} events: ${RUN.onBar} on the bar, ${RUN.events - RUN.onBar} off the beat. OK`,
];
for (const l of [...sfvLines, ...barLines]) {
  if (len(l) > 80) throw new Error(`text line over 80 columns (${len(l)}): ${l}`);
  if (/[^\x20-\x7E·]/.test(l)) throw new Error(`non-ASCII in text block: ${l}`);
}

const md = [
  `<!-- Header ${SLUG} for Castaway. Generated by src/${SLUG}.mjs: edit that, not this. Checksums and counts checked ${CHECKED}. -->`,
  '',
  '<p align="center">',
  `  <img src="assets/${SLUG}.svg" width="100%" alt="${ALT}">`,
  '</p>',
  '',
  '<h1 align="center">Castaway</h1>',
  '',
  `<p align="center"><b>ten hours on one small island · ${N} files checked · verified uneventful</b><br>`,
  '<sub>a lo-fi island video for YouTube · in development · unofficial, inspired by a 1992 desert-island screensaver</sub></p>',
  '',
  '**Castaway** (working title) is a ten-hour lo-fi video for YouTube in which almost nothing happens, on purpose. A young woman sits on a tiny island with one tall palm and a raft, nods to the music in her headphones, and waits. Every so often, on the next bar of the music, something happens: a bottle she throws washes straight back, a drone delivers another pair of headphones, a stray cat drifts in on a crate and naps up the palm. Then she goes back to nodding. It is an unofficial remake inspired by the small-island routines and visual comedy of *Johnny Castaway*, the 1992 desert-island screensaver, with a sunny, hand-painted look: 16:9, 1080p at 24 fps, always daytime.',
  '',
  `More than 90 activities wait their turn in [activities.toml](activities.toml), most of them on four timers, from every 2 to 5 minutes to every 3 to 6 hours, and each starts on the next bar (every 3 seconds), so even a falling coconut lands on the beat. Every sound is synthesized from code by [tools/make_audio.py](tools/make_audio.py): more than 150 files, with no samples, no borrowed loops and no recordings. The checksums in the window are the real CRC-32s of ${N} of them as of ${CHECKED}. A checksum proves the bytes, not the tune: the files are verified, the vibes are pending.`,
  '',
  '```sh',
  'python tools/serve.py      # open http://127.0.0.1:8765/ to preview and export',
  'python tools/schedule.py   # validate the schedule and simulate ten hours',
  '```',
  '',
  '<details>',
  '<summary><b>castaway.sfv</b> · the real file, with sizes and times</summary>',
  '',
  '<pre>',
  ...sfvLines.map(esc),
  '</pre>',
  '',
  `Save it as \`media/audio/castaway.sfv\` and it is an ordinary SFV file: comment lines start with a semicolon, and every other line is a file and its CRC-32. Check it with any SFV tool after a fresh \`python tools/make_audio.py\` to see whether the generator made the same bytes again. The sounds are still being reworked, so a BAD on a later day means a sound changed, not that anything broke. The first line is the whole theme: a seamless 60-second loop at 80 BPM in F major (ii-V-I-vi), with electric piano, a kalimba lead, soft drums and vinyl crackle, 20 bars of exactly 3 seconds. The mix sits at -14 LUFS with true peak at or below -1 dBTP.`,
  '',
  '</details>',
  '',
  '<details>',
  "<summary><b>BAR-Check</b> · the island's own zipscript: every gag lands on a bar</summary>",
  '',
  '<pre>',
  ...barLines.map(esc),
  '</pre>',
  '',
  `Every line is real: the default run of [tools/schedule.py](tools/schedule.py) (seed ${RUN.seed}, ${RUN.length}) as simulated on ${CHECKED}, with a few highlights picked out. A bar is 3 seconds, so a start on the bar divides by 3, and the bar number is the second divided by 3. All ${RUN.events} events in that run pass. The schedule grows every few hours, so the times will move. Over 200 simulated runs the median is about 155 regular, 30 occasional, 13 rare and 2 super-rare events per ten hours, plus chained follow-ups, and she is busy about a third of the time.`,
  '',
  '</details>',
  '',
  '<details>',
  '<summary><b>greetz</b> · and who made what</summary>',
  '',
  'Flotsum, which wrote the file, and Driftglass, which shows it, are invented for this page, and so is the BAR-Check zipscript. The SFV and NFO conventions are the style reference: nothing here is anybody\'s release, just a project checking its own files.',
  '',
  '<pre>',
  'greetz: the shark, for keeping time',
  '        the hermit crab, for wearing it well',
  '        the stray cat, for turning up, and for leaving, and for turning up',
  '        the tide, for consistency',
  '        anyone who has watched a progress bar for longer than the thing',
  '        it was loading',
  '',
  'not in the greetz: the ship. it never stopped.',
  '</pre>',
  '',
  '</details>',
  '',
];
fs.writeFileSync(OUT_MD, md.join('\n'));
console.log(`${path.relative(process.cwd(), OUT_MD)}  ${(md.join('\n').length / 1024).toFixed(1)} KB`);
