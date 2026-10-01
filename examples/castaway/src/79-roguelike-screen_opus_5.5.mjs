#!/usr/bin/env node
// CASTAWAY, drawn as a roguelike dungeon screen: the 80x24 terminal layout of the dungeon games
// that began with Rogue (about 1980) and carried on through Hack and NetHack. One message line
// at the top, a map made only of letters and punctuation floating in black, and two terse status
// lines at the bottom. Style: "Roguelike dungeon screen" (catalogue entry hack-08).
//
// The joke: a roguelike in which you never go downstairs. The word CASTAWAY is the dungeon: eight
// rooms cut in the shapes of the letters (hyphen and pipe walls, full-stop floors), each holding
// one item that stands for a file of the project. Below them the level opens onto a sea of
// braces with one island in it. She is the @, the palm is a green #, the cat is an f, the turtle
// a :, the shark a ;. The message line narrates one minute of the video, on the beat:
//   bar  1  welcome                         bar 12  the shark swims off; a hermit crab arrives
//   bar  3  she nods                        bar 13  a coconut falls on it
//   bar  4  she throws a bottle             bar 14  the coconut walks off (into the shallows)
//   bar  5  the sea considers it            bar 15  she could leave any time: she walks out
//   bar  7  the bottle comes straight back          over the water and off the map
//   bar  9  a fin circles the island        bar 16  the cat goes up the palm to wait
//   bar 10  a shark in headphones nods      bar 17  something walks back over the water
//                                           bar 18  she sits down with an iced coffee
//                                           bar 19  a hydrofoil carves past, with a shaka
//                                           bar 20  "the busiest minute of the next ten hours"
// One loop is 60 s: exactly one pass of the project's 60-second theme (20 bars of 3 s at
// 80 BPM), so the Bar:01/20 field on the status line wraps where the music really does. Movement
// is stepped, one cell at a time, the way the project itself prefers hard cuts and stepped motion.
//
// Nothing is copied from any game: the level, the messages, the rank title and the item names
// are original, and the glyph vocabulary is the genre's shared convention. Text is drawn from a
// 5x7 terminal font defined below (emboldened like a terminal's double-struck bold, without
// closing the one-pixel gaps), placed as <use> glyphs, never <text>. The letter rooms' floors
// sit on a warm background, as the colour-cell variants of the genre light a room.
//
// Regenerate:  node examples/castaway/src/79-roguelike-screen_opus_5.5.mjs
// Debug view:  node examples/castaway/src/79-roguelike-screen_opus_5.5.mjs --ascii=12.5
//              (prints the screen as plain text at 12.5 s into the loop, writes nothing)
// Writes ../assets/79-roguelike-screen_opus_5.5.svg and ../79-roguelike-screen_opus_5.5.md.
// Plain Node, no dependencies, deterministic (no clock; randomness is a seeded PRNG, seed 1992,
// the project's default run seed).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '79-roguelike-screen_opus_5.5';
const OUT_SVG = path.join(HERE, '..', 'assets', `${SLUG}.svg`);
const OUT_MD = path.join(HERE, '..', `${SLUG}.md`);

// ---------------------------------------------------------------------------------------------
// Facts used on screen, checked read-only against D:/python/castaway on 2026-10-01:
//   activities.toml: 94 activities that day (the page says "more than 90"); four timers:
//   regular 2-5 min, occasional 12-25 min, rare 30-60 min, super rare 3-6 h (at most 3 a run);
//   typical 10-hour run (medians of 200 simulated runs): about 155 regular, 30 occasional,
//   13 rare, 2 super rare, plus chained follow-ups; busy about a third of the time.
//   run: 10:00:00, seed 1992, every start snapped to the next 3.0 s bar.
//   theme: seamless 60 s loop, 80 BPM, F major, 20 bars of 3 s; -14 LUFS, true peak <= -1 dBTP.
//   sound files: more than 150, all synthesized by tools/make_audio.py.
// ---------------------------------------------------------------------------------------------

function prng(seed) {                         // mulberry32
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = prng(1992);

// ---------------------------------------------------------------------------------------------
// Terminal geometry and timing
// ---------------------------------------------------------------------------------------------
const COLS = 80, ROWS = 24, CW = 8, CH = 14;  // 640 x 336: a 16:9 screen, like the video
const PX = 1, PY = 1.5;                        // one font pixel
const PAD = 16;                                // black margin inside the rounded panel
const SW = COLS * CW, SH = ROWS * CH;
const VW = SW + PAD * 2, VH = SH + PAD * 2;
const X = (c) => c * CW;
const Y = (r) => r * CH;

const LOOP = 60;                               // one pass of the theme
const BEAT = 0.75;                             // 80 BPM
const BAR = 3;
const bar = (n) => (n - 1) * BAR;              // bar n starts at...

// ---------------------------------------------------------------------------------------------
// The 5x7 terminal font. Rows top to bottom; rows 7 and 8 are the descender. '#' = ink.
// ---------------------------------------------------------------------------------------------
const FONT = new Map();
const G = (ch, rows) => FONT.set(ch, rows.split(' '));
G(' ', '..... ..... ..... ..... ..... ..... .....');
G('A', '.###. #...# #...# #...# ##### #...# #...#');
G('B', '####. #...# #...# ####. #...# #...# ####.');
G('C', '.###. #...# #.... #.... #.... #...# .###.');
G('D', '####. #...# #...# #...# #...# #...# ####.');
G('E', '##### #.... #.... ####. #.... #.... #####');
G('F', '##### #.... #.... ####. #.... #.... #....');
G('G', '.###. #...# #.... #.### #...# #...# .####');
G('H', '#...# #...# #...# ##### #...# #...# #...#');
G('I', '.###. ..#.. ..#.. ..#.. ..#.. ..#.. .###.');
G('J', '..### ...#. ...#. ...#. ...#. #..#. .##..');
G('K', '#...# #..#. #.#.. ##... #.#.. #..#. #...#');
G('L', '#.... #.... #.... #.... #.... #.... #####');
G('M', '#...# ##.## #.#.# #.#.# #...# #...# #...#');
G('N', '#...# #...# ##..# #.#.# #..## #...# #...#');
G('O', '.###. #...# #...# #...# #...# #...# .###.');
G('P', '####. #...# #...# ####. #.... #.... #....');
G('Q', '.###. #...# #...# #...# #.#.# #..#. .##.#');
G('R', '####. #...# #...# ####. #.#.. #..#. #...#');
G('S', '.###. #...# #.... .###. ....# #...# .###.');
G('T', '##### ..#.. ..#.. ..#.. ..#.. ..#.. ..#..');
G('U', '#...# #...# #...# #...# #...# #...# .###.');
G('V', '#...# #...# #...# #...# #...# .#.#. ..#..');
G('W', '#...# #...# #...# #.#.# #.#.# #.#.# .#.#.');
G('X', '#...# #...# .#.#. ..#.. .#.#. #...# #...#');
G('Y', '#...# #...# .#.#. ..#.. ..#.. ..#.. ..#..');
G('Z', '##### ....# ...#. ..#.. .#... #.... #####');
G('a', '..... ..... .###. ....# .#### #...# .####');
G('b', '#.... #.... ####. #...# #...# #...# ####.');
G('c', '..... ..... .###. #.... #.... #...# .###.');
G('d', '....# ....# .#### #...# #...# #...# .####');
G('e', '..... ..... .###. #...# ##### #.... .###.');
G('f', '..##. .#..# .#... ###.. .#... .#... .#...');
G('g', '..... ..... .#### #...# #...# #...# .#### ....# .###.');
G('h', '#.... #.... #.##. ##..# #...# #...# #...#');
G('i', '..#.. ..... .##.. ..#.. ..#.. ..#.. .###.');
G('j', '...#. ..... ..##. ...#. ...#. ...#. ...#. #..#. .##..');
G('k', '#.... #.... #..#. #.#.. ##... #.#.. #..#.');
G('l', '.##.. ..#.. ..#.. ..#.. ..#.. ..#.. .###.');
G('m', '..... ..... ##.#. #.#.# #.#.# #.#.# #.#.#');
G('n', '..... ..... #.##. ##..# #...# #...# #...#');
G('o', '..... ..... .###. #...# #...# #...# .###.');
G('p', '..... ..... ####. #...# #...# #...# ####. #.... #....');
G('q', '..... ..... .#### #...# #...# #...# .#### ....# ....#');
G('r', '..... ..... #.##. ##..# #.... #.... #....');
G('s', '..... ..... .###. #.... .###. ....# ####.');
G('t', '.#... .#... ###.. .#... .#... .#..# ..##.');
G('u', '..... ..... #...# #...# #...# #..## .##.#');
G('v', '..... ..... #...# #...# #...# .#.#. ..#..');
G('w', '..... ..... #...# #...# #.#.# #.#.# .#.#.');
G('x', '..... ..... #...# .#.#. ..#.. .#.#. #...#');
G('y', '..... ..... #...# #...# #...# #...# .#### ....# .###.');
G('z', '..... ..... ##### ...#. ..#.. .#... #####');
G('0', '.###. #...# #..## #.#.# ##..# #...# .###.');
G('1', '..#.. .##.. ..#.. ..#.. ..#.. ..#.. .###.');
G('2', '.###. #...# ....# ...#. ..#.. .#... #####');
G('3', '##### ...#. ..#.. ...#. ....# #...# .###.');
G('4', '...#. ..##. .#.#. #..#. ##### ...#. ...#.');
G('5', '##### #.... ####. ....# ....# #...# .###.');
G('6', '..##. .#... #.... ####. #...# #...# .###.');
G('7', '##### ....# ...#. ..#.. .#... .#... .#...');
G('8', '.###. #...# #...# .###. #...# #...# .###.');
G('9', '.###. #...# #...# .#### ....# ...#. .##..');
G('!', '..#.. ..#.. ..#.. ..#.. ..#.. ..... ..#..');
G('"', '.#.#. .#.#. .#.#. ..... ..... ..... .....');
G('#', '.#.#. .#.#. ##### .#.#. ##### .#.#. .#.#.');   // bolds to ##.## verticals
G('$', '..#.. .#### #.#.. .###. ..#.# ####. ..#..');
G('%', '##... ##..# ...#. ..#.. .#... #..## ...##');
G('&', '.##.. #..#. #.#.. .#... #.#.# #..#. .##.#');
G("'", '..#.. ..#.. .#... ..... ..... ..... .....');
G('(', '...#. ..#.. .#... .#... .#... ..#.. ...#.');
G(')', '.#... ..#.. ...#. ...#. ...#. ..#.. .#...');
G('*', '..... ..#.. #.#.# .###. #.#.# ..#.. .....');
G('+', '..... ..#.. ..#.. ##### ..#.. ..#.. .....');
G(',', '..... ..... ..... ..... ..... ..##. ..##. ...#. ..#..');
G('-', '..... ..... ..... ##### ..... ..... .....');
G('.', '..... ..... ..... ..... ..... ..... ..#..');
G('/', '..... ....# ...#. ..#.. .#... #.... .....');
G(':', '..... ..... ..#.. ..... ..... ..#.. .....');
G(';', '..... ..... ..#.. ..... ..... ..#.. ..#.. .#...');
G('<', '...#. ..#.. .#... #.... .#... ..#.. ...#.');
G('=', '..... ..... ##### ..... ##### ..... .....');
G('>', '.#... ..#.. ...#. ....# ...#. ..#.. .#...');
G('?', '.###. #...# ....# ...#. ..#.. ..... ..#..');
G('@', '.###. #...# #.### #.#.# #.### #.... .####');
G('[', '.###. .#... .#... .#... .#... .#... .###.');
G('\\', '..... #.... .#... ..#.. ...#. ....# .....');
G(']', '.###. ...#. ...#. ...#. ...#. ...#. .###.');
G('^', '..#.. .#.#. #...# ..... ..... ..... .....');
G('_', '..... ..... ..... ..... ..... ..... ..... #####');
G('`', '.#... ..#.. ...#. ..... ..... ..... .....');
G('{', '...#. ..#.. ..#.. .#... ..#.. ..#.. ...#.');
G('|', '..#.. ..#.. ..#.. ..#.. ..#.. ..#.. ..#.. ..#.. ..#..');
G('}', '.#... ..#.. ..#.. ...#. ..#.. ..#.. .#...');
G('~', '..... ..... .#... #.#.# ...#. ..... .....');

// Glyph outline in font pixels, emboldened the way a terminal double-strikes its bold: each run
// of ink grows one pixel to the right, or, where that would close a one-pixel gap, one pixel to
// the left instead (so m, w, # and friends keep their counters). Font pixel x = -1..5 maps to
// cell pixels 0..6.
const gid = (ch) => `g${ch.codePointAt(0).toString(36)}`;
const usedGlyphs = new Set();
function boldRow(row) {
  const p = (x) => row[x] === '#';
  const out = new Set();
  for (let x = 0; x < 5; x++) if (p(x)) out.add(x);
  let x = 0;
  while (x < 5) {
    if (!p(x)) { x++; continue; }
    const a = x;
    while (p(x + 1)) x++;
    const b = x;
    if (!p(b + 2)) out.add(b + 1);
    else if (!out.has(a - 1) && !out.has(a - 2)) out.add(a - 1);
    x++;
  }
  return out;
}
function glyphPath(ch) {
  const rows = FONT.get(ch);
  let d = '';
  rows.forEach((row, y) => {
    const on = boldRow(row);
    let x = -1;
    while (x <= 5) {
      if (on.has(x)) {
        let w = 1;
        while (on.has(x + w)) w++;
        d += `M${(x + 1) * PX} ${+(y * PY + 0.25).toFixed(2)}h${w * PX}v${PY}h-${w * PX}z`;
        x += w;
      } else x++;
    }
  });
  return d;
}

// ---------------------------------------------------------------------------------------------
// Palette: the 16-colour terminal on black, tuned a little toward the project's sunny coast.
// ---------------------------------------------------------------------------------------------
const PAL = {
  wht: '#F4F1E8', gry: '#A9A9A9', dgy: '#5B5B5B', blk: '#000000',
  wall: '#EDE6D6', floor: '#C79A3A', litbg: '#33270C',
  deep: '#1C3290', sea: '#2848BC', sea2: '#3F78E0', shal: '#4FC7D8', foam: '#B9F4FF',
  sand: '#F2CF63', palm: '#47D65A', raft: '#B8722E',
  coral: '#FF7A66', cream: '#F7E6C4', grey: '#B9B5AE',
  red: '#FF5D5D', yel: '#FFE45C', mag: '#E68BFF', cyn: '#5FF3F3', blu: '#6E8BFF', grn: '#7BE37B',
};
const CLASSES = Object.keys(PAL);

// ---------------------------------------------------------------------------------------------
// The static map. cells: key "r,c" -> { ch, cls }.
// ---------------------------------------------------------------------------------------------
const cells = new Map();
const key = (r, c) => `${r},${c}`;
const put = (r, c, ch, cls) => { if (c >= 0 && c < COLS && r >= 0 && r < ROWS) cells.set(key(r, c), { ch, cls }); };
const at = (r, c) => cells.get(key(r, c));

// --- The word CASTAWAY as eight rooms. Floor bitmaps, 5 x 5 ('#' = floor). -------------------
const LETTERS = {
  C: ['#####', '#....', '#....', '#....', '#####'],
  A: ['#####', '#...#', '#####', '#...#', '#...#'],
  S: ['#####', '#....', '#####', '....#', '#####'],
  T: ['#####', '..#..', '..#..', '..#..', '..#..'],
  W: ['#...#', '#...#', '#.#.#', '#.#.#', '#####'],
  Y: ['#...#', '#...#', '#####', '..#..', '..#..'],
};
const WORD = 'CASTAWAY';
const LOGO_TOP = 2;                            // top wall row; floors are rows 3..7
const LOGO_W = WORD.length * 7 + (WORD.length - 1);
const LOGO_C0 = Math.floor((COLS - LOGO_W) / 2);
const floor = new Set();
const letterAt = [];                           // [{ch, c0}] left wall column of each letter
{
  let c0 = LOGO_C0;
  for (const ch of WORD) {
    letterAt.push({ ch, c0 });
    LETTERS[ch].forEach((row, r) => [...row].forEach((v, c) => {
      if (v === '#') floor.add(key(LOGO_TOP + 1 + r, c0 + 1 + c));
    }));
    c0 += 8;
  }
}
const isFloor = (r, c) => floor.has(key(r, c));
for (let r = LOGO_TOP; r <= LOGO_TOP + 6; r++) {
  for (let c = LOGO_C0; c < LOGO_C0 + LOGO_W; c++) {
    if (isFloor(r, c)) { put(r, c, '.', 'floor'); continue; }
    let near = false;
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) if (isFloor(r + dr, c + dc)) near = true;
    if (!near) continue;
    put(r, c, isFloor(r, c - 1) || isFloor(r, c + 1) ? '|' : '-', 'wall');
  }
}
// Floor cell (fr, fc) of letter i, in the letter's own 5x5 floor grid.
const lf = (i, fr, fc) => [LOGO_TOP + 1 + fr, letterAt[i].c0 + 1 + fc];

// One item per room: each stands for a file of the project (the legend under the image).
const ITEMS = [
  { i: 0, fr: 2, fc: 0, ch: '?', cls: 'wht' },  // C: a scroll labelled MUSING
  { i: 1, fr: 0, fc: 2, ch: '+', cls: 'mag' },  // A: a spellbook of activities
  { i: 2, fr: 2, fc: 2, ch: '{', cls: 'blu' },  // S: a fountain of synthesized sound
  { i: 3, fr: 3, fc: 2, ch: '(', cls: 'cyn' },  // T: a portable renderer
  { i: 4, fr: 4, fc: 4, ch: '/', cls: 'yel' },  // A: a wand of simulation
  { i: 5, fr: 4, fc: 2, ch: '*', cls: 'red' },  // W: a gem in 1080p
  { i: 6, fr: 2, fc: 4, ch: '"', cls: 'yel' },  // A: an amulet of replay
  { i: 7, fr: 1, fc: 0, ch: '%', cls: 'grn' },  // Y: a coconut
];
for (const it of ITEMS) { const [r, c] = lf(it.i, it.fr, it.fc); put(r, c, it.ch, it.cls); }

// Corridors: '#' cells along an axis-aligned polyline.
function corridor(points) {                    // axis-aligned polyline of '#'
  for (let k = 0; k + 1 < points.length; k++) {
    const [r0, c0] = points[k], [r1, c1] = points[k + 1];
    const n = Math.max(Math.abs(r1 - r0), Math.abs(c1 - c0));
    for (let s = 0; s <= n; s++) {
      const r = r0 + Math.sign(r1 - r0) * s, c = c0 + Math.sign(c1 - c0) * s;
      if (!at(r, c)) put(r, c, '#', 'gry');
    }
  }
}

// The T room has a doorway in its bottom wall, and a corridor that runs down from it and stops
// dead at the sea.
const T_STEM = letterAt[3].c0 + 3;
put(LOGO_TOP + 6, T_STEM, '.', 'floor');

// --- The sea and the island ------------------------------------------------------------------
const SEA_R0 = 10, SEA_R1 = 20;
const ISLAND = [                               // hand-drawn, '.' = sand
  { r: 12, c0: 33, s: '........' },
  { r: 13, c0: 29, s: '.................' },
  { r: 14, c0: 27, s: '......................' },
  { r: 15, c0: 26, s: '........................' },
  { r: 16, c0: 28, s: '.....................' },
  { r: 17, c0: 32, s: '...........' },
];
const sand = new Set();
for (const row of ISLAND) [...row.s].forEach((v, i) => { if (v === '.') sand.add(key(row.r, row.c0 + i)); });
const isSand = (r, c) => sand.has(key(r, c));
// Distance (in cells, Chebyshev with a squash for the tall cells) from the nearest sand.
function shoreDist(r, c) {
  let best = 99;
  for (const k of sand) {
    const [sr, sc] = k.split(',').map(Number);
    const d = Math.max(Math.abs(sr - r) * 2, Math.abs(sc - c));
    if (d < best) best = d;
  }
  return best;
}
const seaCells = [];
for (let r = SEA_R0; r <= SEA_R1; r++) {
  for (let c = 0; c < COLS; c++) {
    const dx = (c - 39.5) / 37, dy = (r - 15) / 5.6;
    const e = dx * dx + dy * dy;
    const edge = 0.86 + rnd() * 0.22;          // ragged rim: the explored part of the sea
    if (e > edge) continue;
    if (isSand(r, c)) { put(r, c, '.', 'sand'); continue; }
    const d = shoreDist(r, c);
    put(r, c, '}', d <= 1 ? 'shal' : d <= 4 ? 'sea2' : d <= 17 ? 'sea' : 'deep');
    seaCells.push([r, c, d]);
  }
}
const isSea = (r, c) => { const v = at(r, c); return v && v.ch === '}'; };
corridor([[LOGO_TOP + 7, T_STEM], [SEA_R0 - 1, T_STEM]]);

// Fixtures on the island.
const PALM = [14, 36];
const HOME = [15, 38];                         // where she sits, under the palm
const CAT = [15, 37];
put(...PALM, '#', 'palm');
put(16, 46, '=', 'raft'); put(16, 47, '=', 'raft'); put(17, 47, '=', 'raft');   // the raft, moored
put(13, 41, '%', 'grn');                       // the kumara, planted, growing
put(17, 35, '^', 'sand');                      // a sandcastle (the tide will have it)

// ---------------------------------------------------------------------------------------------
// Actors: glyphs that move cell by cell. Each track is a list of [t, r, c, visible].
// Between two entries the actor walks there in max(|dr|,|dc|) even steps (moves must be
// straight or exactly diagonal), or holds if nothing changes.
// ---------------------------------------------------------------------------------------------
const actors = [];
function actor(name, glyphs, track) {
  for (let k = 0; k + 1 < track.length; k++) {
    const [t0, r0, c0] = track[k], [t1, r1, c1] = track[k + 1];
    const dr = Math.abs(r1 - r0), dc = Math.abs(c1 - c0);
    if (!(t1 > t0)) throw new Error(`${name}: times must increase at ${t0}`);
    if (dr && dc && dr !== dc) throw new Error(`${name}: move at ${t0} is neither straight nor diagonal`);
  }
  if (track[0][0] !== 0 || track.at(-1)[0] !== LOOP) throw new Error(`${name}: track must span the loop`);
  actors.push({ name, glyphs, track });
  return actors.at(-1);
}

// She is the @, in coral like her tank top. Away from 42 s to 51 s: out over the water and back with an iced coffee.
const WALK_OUT = 42, GONE = 46.5, BACK = 47.25, HOME_AT = 51.75;
const EDGE_C = COLS - 1;               // she walks right off the edge of the map
actor('her', [{ dc: 0, ch: '@', cls: 'coral' }], [
  [0, ...HOME, 1],
  [bar(4), ...HOME, 1],                        // throws on bar 4 (no step)
  [WALK_OUT, ...HOME, 1],
  [WALK_OUT + 0.375, 15, HOME[1] + 1, 1],
  [GONE, 15, EDGE_C, 1],
  [GONE + 0.01, 15, EDGE_C, 0],
  [BACK, 15, EDGE_C, 0],
  [BACK + 0.01, 15, EDGE_C, 1],
  [HOME_AT - 0.375, 15, HOME[1] + 1, 1],
  [HOME_AT, ...HOME, 1],
  [LOOP, ...HOME, 1],
]);

// The bottle: thrown at bar 4, lands far out, sits, drifts back to her feet by bar 7.
const BOTTLE_OUT = [15, 58];
const FEET = [16, 38];   // reached diagonally from (15, 39)
actor('bottle', [{ dc: 0, ch: '!', cls: 'shal' }], [
  [0, ...HOME, 0],
  [bar(4), 15, 39, 0],
  [bar(4) + 0.01, 15, 39, 1],
  [bar(4) + 1.5, ...BOTTLE_OUT, 1],
  [bar(6), ...BOTTLE_OUT, 1],                  // the sea considers it
  [bar(7) - 0.1875, 15, 39, 1],                // ...and sends it straight back
  [bar(7), ...FEET, 1],
  [bar(8) + 1.5, ...FEET, 1],
  [bar(8) + 1.51, ...FEET, 0],                 // picked up again
  [LOOP, ...FEET, 0],
]);

// The shark: a fin circles the island (bar 9), surfaces in headphones and nods (bars 10-11),
// swims off (bar 12).
const SK = { t0: bar(9), nod: bar(10), off: bar(12), gone: bar(12) + 1.5 };
{
  // Once round the island, corners cut, in one bar, then in close to nod.
  const ring = [[15, 53], [12, 53], [11, 52], [11, 25], [12, 24], [17, 24], [18, 25], [18, 52], [16, 52], [15, 51]];
  const path = timedPath(SK.t0, SK.nod - 0.375, ring);
  path.push([SK.nod, 15, 50]);
  const tr = [[0, 15, 53, 0], [SK.t0 - 0.01, 15, 53, 0]];
  for (const [t, r, c] of path) tr.push([t, r, c, 1]);
  // nodding: one row down on the beat, back up on the off-beat
  for (let t = SK.nod; t < SK.off; t += BEAT) {
    tr.push([t + BEAT / 2, 15, 50, 1]);
    tr.push([t + BEAT / 2 + 0.01, 16, 50, 1]);
    tr.push([t + BEAT, 16, 50, 1]);
    tr.push([t + BEAT + 0.01, 15, 50, 1]);
  }
  tr.push([SK.off + 0.75, 17, 52, 1], [SK.off + 1.5, 19, 54, 1], [SK.gone + 0.01, 19, 54, 0], [LOOP, 19, 54, 0]);
  actor('shark', [{ dc: 0, ch: ';', cls: 'grey' }], tr);
}

// The hermit crab walks in (bar 12), the coconut lands on it (bar 13), and the coconut walks
// off into the sea with the crab wearing it (bar 14).
const CR = { in: bar(12) + 1.5, hit: bar(13), walk: bar(14), sunk: bar(14) + 3 };
actor('crab', [{ dc: 0, ch: 'c', cls: 'red' }], [
  [0, 16, 28, 0], [CR.in, 16, 28, 0], [CR.in + 0.01, 16, 28, 1],
  [CR.hit - 0.75, 16, 32, 1], [CR.hit - 0.375, 15, 33, 1], [CR.hit + 0.375, 15, 33, 1], [CR.hit + 0.385, 15, 33, 0],
  [LOOP, 15, 33, 0],
]);
actor('coconut', [{ dc: 0, ch: '%', cls: 'raft' }], [
  [0, 14, 35, 0], [CR.hit - 0.01, 14, 35, 0], [CR.hit, 14, 35, 1],
  [CR.hit + 0.375, 15, 34, 1], [CR.hit + 0.75, 15, 33, 1],
  [CR.walk, 15, 33, 1], [CR.walk + 0.375 * 6, 15, 27, 1], [CR.walk + 0.375 * 7, 16, 26, 1],
  [CR.sunk, 16, 25, 1], [CR.sunk + 0.01, 16, 25, 0], [LOOP, 16, 25, 0],
]);

// The cat: asleep beside her; goes up the palm while she is away, comes down at bar 19.
actor('cat', [{ dc: 0, ch: 'f', cls: 'grey' }], [
  [0, ...CAT, 1], [bar(16), ...CAT, 1], [bar(16) + 0.375, ...PALM, 1],
  [bar(19) + 1.5, ...PALM, 1], [bar(19) + 1.875, ...CAT, 1], [LOOP, ...CAT, 1],
]);

// The turtle: one cell a bar round a slow rectangle in the west sea, back home at the loop.
{
  const ring = [];
  const r0 = 12, c0 = 9, w = 7, h = 3;          // perimeter 20 cells = 20 bars
  for (let c = c0; c < c0 + w; c++) ring.push([r0, c]);
  for (let r = r0; r < r0 + h; r++) ring.push([r, c0 + w]);
  for (let c = c0 + w; c > c0; c--) ring.push([r0 + h, c]);
  for (let r = r0 + h; r > r0; r--) ring.push([r, c0]);
  const tr = [];
  ring.forEach(([r, c], i) => { tr.push([i * BAR, r, c, 1]); tr.push([i * BAR + BAR - 0.01, r, c, 1]); });
  tr.push([LOOP, ring[0][0], ring[0][1], 1]);
  actor('turtle', [{ dc: 0, ch: ':', cls: 'grn' }], tr);
}

// The hydrofoil: a second @, very fast, with a short wake, on bar 19.
const HF = { t0: bar(19), t1: bar(19) + 2.625 };
actor('foil', [{ dc: 0, ch: '@', cls: 'cyn' }, { dc: -1, ch: '~', cls: 'foam' }, { dc: -2, ch: '~', cls: 'shal' }], [
  [0, 18, 0, 0], [HF.t0, 18, 0, 0], [HF.t0 + 0.01, 18, 0, 1], [HF.t1, 18, COLS + 2, 1],
  [HF.t1 + 0.01, 18, COLS + 2, 0], [LOOP, 18, COLS + 2, 0],
]);

// Spread the time t0..t1 over a list of waypoints in proportion to the cells walked.
function timedPath(t0, t1, pts) {
  const legs = pts.slice(1).map((p, i) => Math.max(Math.abs(p[0] - pts[i][0]), Math.abs(p[1] - pts[i][1])));
  const total = legs.reduce((a, b) => a + b, 0);
  const out = [[t0, ...pts[0]]];
  let acc = 0;
  legs.forEach((n, i) => { acc += n; out.push([+(t0 + ((t1 - t0) * acc) / total).toFixed(4), ...pts[i + 1]]); });
  return out;
}

// Position of an actor at time t (the same maths as the CSS steps()).
function stateAt(a, t) {
  const tr = a.track;
  for (let k = 0; k + 1 < tr.length; k++) {
    const [t0, r0, c0, v0] = tr[k], [t1, r1, c1] = tr[k + 1];
    if (t >= t0 && t < t1) {
      const n = Math.max(Math.abs(r1 - r0), Math.abs(c1 - c0));
      if (!n) return { r: r0, c: c0, v: v0 };
      const s = Math.floor(((t - t0) / (t1 - t0)) * n);
      return { r: r0 + ((r1 - r0) / n) * s, c: c0 + ((c1 - c0) / n) * s, v: v0 };
    }
  }
  const last = tr.at(-1);
  return { r: last[1], c: last[2], v: last[3] };
}

// ---------------------------------------------------------------------------------------------
// The message line and the status lines.
// ---------------------------------------------------------------------------------------------
const MESSAGES = [
  [bar(1), 'Welcome to Castaway! One island, one palm, ten hours of daylight. Relax.'],
  [bar(3), 'You nod to the music. It is 80 beats a minute. You nod to every one.'],
  [bar(4), 'You throw a message in a bottle as far as you can.'],
  [bar(5), 'The sea considers it.'],
  [bar(7), 'The bottle washes straight back to your feet. Return to sender.'],
  [bar(9), 'A fin circles the island.--More--'],
  [bar(10), 'It is a shark in headphones. It nods to the beat. You nod back.'],
  [bar(12), 'The shark swims off, still nodding. A hermit crab scuttles up the beach.'],
  [bar(13), 'A coconut falls on the hermit crab!--More--'],
  [bar(14), 'The coconut gets up and walks off.'],
  [bar(15), 'You could leave any time. You walk out over the water.'],
  [bar(16), 'The island waits. The cat goes up the palm to wait somewhere higher.'],
  [bar(17), 'Something is walking back over the water. It is you.'],
  [bar(18), 'You come back with an iced coffee. You sit down again.'],
  [bar(19), 'A bro on an electric hydrofoil carves past, waves a shaka, and is gone.'],
  [bar(20), 'You wait. That was the busiest minute of the next ten hours.'],
];
const msgAt = (t) => MESSAGES.filter(([t0]) => t0 <= t).at(-1)[1];

const STATUS1 = 'Castaway the Idler    Bpm:80 Key:F Fps:30 Lufs:-14 Seed:1992    Unbothered';
const STATUS2 = 'Isle:1 $:0 Hrs:10(10) Acts:90+ Sfx:150+ Bar:01/20 T:36000';
const BAR_COL = STATUS2.indexOf('Bar:') + 4;
const WORD_COL = STATUS2.length + 1;
const BUSY = [[bar(4), bar(4) + 1.5], [WALK_OUT, HOME_AT]];
const busyAt = (t) => BUSY.some(([a, b]) => t >= a && t < b);

// ---------------------------------------------------------------------------------------------
// ASCII debug view
// ---------------------------------------------------------------------------------------------
function ascii(t) {
  const g = Array.from({ length: ROWS }, () => Array(COLS).fill(' '));
  for (const [k, v] of cells) { const [r, c] = k.split(',').map(Number); g[r][c] = v.ch; }
  for (const a of actors) {
    const s = stateAt(a, t);
    if (!s.v) continue;
    for (const gl of a.glyphs) { const c = s.c + gl.dc; if (c >= 0 && c < COLS) g[s.r][c] = gl.ch; }
  }
  const m = msgAt(t);
  [...m].forEach((ch, i) => { g[0][i] = ch; });
  [...STATUS1].forEach((ch, i) => { g[22][i] = ch; });
  const s2 = STATUS2.replace('01/20', String(Math.floor(t / BAR) + 1).padStart(2, '0') + '/20') + ' ' + (busyAt(t) ? 'Busy' : 'Idle');
  [...s2].forEach((ch, i) => { g[23][i] = ch; });
  return g.map((row) => row.join('').replace(/\s+$/, '')).join('\n');
}

const asciiArg = process.argv.find((a) => a.startsWith('--ascii='));
if (asciiArg) {
  for (const t of asciiArg.split('=')[1].split(',').map(Number)) {
    console.log(`--- t=${t}s ` + '-'.repeat(66));
    console.log(ascii(t));
  }
  process.exit(0);
}

// ---------------------------------------------------------------------------------------------
// SVG
// ---------------------------------------------------------------------------------------------
const css = [];
let animN = 0;
const pct = (t) => `${+((t / LOOP) * 100).toFixed(3)}%`;
// Held keyframes: [[t, declarations], ...], each held until the next.
function holdAnim(frames, period = LOOP) {
  const name = `k${(animN++).toString(36)}`;
  const body = frames.map(([t, decl]) => `${+((t / period) * 100).toFixed(3)}%{${decl}}`).join('');
  css.push(`@keyframes ${name}{${body}}`);
  css.push(`.${name}{animation:${name} ${period}s steps(1,end) infinite}`);
  return name;
}
// Visible during [t0, t1) of the loop.
function showAnim(t0, t1) {
  const f = [[0, `opacity:${t0 === 0 ? 1 : 0}`]];
  if (t0 > 0) f.push([t0, 'opacity:1']);
  if (t1 < LOOP) f.push([t1, 'opacity:0']);
  f.push([LOOP, `opacity:${t0 === 0 ? 1 : 0}`]);
  return holdAnim(f);
}

const useGlyph = (ch, x, y) => {
  if (!FONT.has(ch)) throw new Error(`no glyph for ${JSON.stringify(ch)}`);
  usedGlyphs.add(ch);
  return `<use href="#${gid(ch)}" x="${+x.toFixed(2)}" y="${+y.toFixed(2)}"/>`;
};
// A string at a cell position (spaces cost nothing).
function txt(col, row, str) {
  let out = '';
  [...str].forEach((ch, i) => { if (ch !== ' ') out += useGlyph(ch, X(col + i), Y(row)); });
  return out;
}
const cover = (x, y, w = CW, h = CH) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#000"/>`;

function buildSvg() {
  const layers = [];

  // Lit floors: the letter rooms' floor cells get a warm background, as the colour-cell
  // variants of the genre light a room, so the word reads as a solid shape inside its walls.
  {
    let d = '';
    for (let r = LOGO_TOP + 1; r <= LOGO_TOP + 5; r++) {
      let c = 0;
      while (c < COLS) {
        if (isFloor(r, c)) {
          let w = 1;
          while (isFloor(r, c + w)) w++;
          d += `M${X(c)} ${Y(r)}h${X(w)}v${CH}h-${X(w)}z`;
          c += w;
        } else c++;
      }
    }
    layers.push(`<path class="litbg" d="${d}"/>`);
  }

  // Static map, one group per colour.
  const byCls = new Map();
  for (const [k, v] of cells) {
    const [r, c] = k.split(',').map(Number);
    if (!byCls.has(v.cls)) byCls.set(v.cls, []);
    byCls.get(v.cls).push(useGlyph(v.ch, X(c), Y(r)));
  }
  for (const cls of CLASSES) if (byCls.has(cls)) layers.push(`<g class="${cls}">${byCls.get(cls).join('')}</g>`);

  // Sea glints: a few cells of open water turn to a bright ~ for one beat; eight groups take
  // turns, one per beat, so a handful glint at any moment (80 beats = 10 full rounds a loop).
  {
    const open = seaCells.filter(([r, c, d]) => d >= 3 && !(r === 15 && c > 38) && r !== 18);
    const groups = Array.from({ length: 8 }, () => []);
    const picked = new Set();
    for (let g = 0; g < 8; g++) {
      let n = 0;
      while (n < 4) {
        const [r, c] = open[Math.floor(rnd() * open.length)];
        const k = key(r, c);
        if (picked.has(k)) continue;
        picked.add(k); groups[g].push([r, c]); n++;
      }
    }
    groups.forEach((cellsG, g) => {
      const frames = new Map([[0, 'opacity:0']]);
      for (let b = g; b < LOOP / BEAT; b += 8) {
        frames.set(+(b * BEAT).toFixed(4), 'opacity:1');
        frames.set(+(b * BEAT + BEAT).toFixed(4), 'opacity:0');
      }
      frames.set(LOOP, 'opacity:0');
      const cls = holdAnim([...frames.entries()].sort((a, b) => a[0] - b[0]));
      const body = cellsG.map(([r, c]) => cover(X(c), Y(r)) + useGlyph('~', X(c), Y(r))).join('');
      layers.push(`<g class="${cls} foam" opacity="0">${body}</g>`);
    });
  }

  // Actors (clipped to the screen, so nothing shows in the margin).
  const actorLayers = [];
  for (const a of actors) {
    const tr = a.track;
    const frames = tr.map(([t, r, c, v], k) => {
      let decl = `transform:translate(${X(c)}px,${Y(r)}px);opacity:${v}`;
      if (k + 1 < tr.length) {
        const [, r1, c1] = tr[k + 1];
        const n = Math.max(Math.abs(r1 - r), Math.abs(c1 - c));
        decl += `;animation-timing-function:steps(${Math.max(1, n)},end)`;
      }
      return `${pct(t)}{${decl}}`;
    });
    const name = `k${(animN++).toString(36)}`;
    css.push(`@keyframes ${name}{${frames.join('')}}`);
    css.push(`.${name}{animation:${name} ${LOOP}s infinite}`);
    let body = '';
    for (const gl of a.glyphs) body += cover(X(gl.dc), 0) + `<g class="${gl.cls}">${useGlyph(gl.ch, X(gl.dc), 0)}</g>`;
    if (a.name === 'her') {
      // The terminal cursor sits on the player, blinking on the beat.
      const blink = `k${(animN++).toString(36)}`;
      css.push(`@keyframes ${blink}{0%{opacity:1}50%{opacity:0}}`);
      css.push(`.${blink}{animation:${blink} ${BEAT}s steps(1,end) infinite}`);
      body += `<rect class="${blink} cream" x="1" y="${CH - 1.75}" width="6" height="1.5"/>`;
    }
    const [, r0, c0, v0] = tr[0];
    actorLayers.push(`<g class="${name}" transform="translate(${X(c0)},${Y(r0)})" opacity="${v0}">${body}</g>`);
  }
  layers.push(`<g clip-path="url(#scr)">${actorLayers.join('')}</g>`);

  // Message line.
  MESSAGES.forEach(([t0, text], i) => {
    const t1 = i + 1 < MESSAGES.length ? MESSAGES[i + 1][0] : LOOP;
    const cls = showAnim(t0, t1);
    layers.push(`<g class="${cls} wht"${t0 === 0 ? '' : ' opacity="0"'}>${txt(0, 0, text)}</g>`);
  });

  // Status lines.
  const s1 = STATUS1;
  const nameEnd = s1.indexOf('    ');
  const alignAt = s1.lastIndexOf('    ') + 4;
  layers.push(`<g class="wht">${txt(0, 22, s1.slice(0, nameEnd))}</g>`);
  layers.push(`<g class="gry">${txt(nameEnd, 22, s1.slice(nameEnd, alignAt))}</g>`);
  layers.push(`<g class="yel">${txt(alignAt, 22, s1.slice(alignAt))}</g>`);
  layers.push(`<g class="gry">${txt(0, 23, STATUS2.replace('01/20', '  /20'))}</g>`);
  {
    const tick = `k${(animN++).toString(36)}`;
    css.push(`@keyframes ${tick}{to{transform:translateY(-${20 * CH}px)}}`);
    css.push(`.${tick}{animation:${tick} ${LOOP}s steps(20,end) infinite}`);
    let strip = '';
    for (let i = 0; i < 20; i++) strip += txt(0, i, String(i + 1).padStart(2, '0'));
    layers.push(`<svg x="${X(BAR_COL)}" y="${Y(23)}" width="${X(2)}" height="${CH}" overflow="hidden"><g class="${tick} wht">${strip}</g></svg>`);
  }
  {
    // The status word: Idle or Busy.
    const idleF = [[0, 'opacity:1']], busyF = [[0, 'opacity:0']];
    for (const [a, b] of BUSY) { idleF.push([a, 'opacity:0'], [b, 'opacity:1']); busyF.push([a, 'opacity:1'], [b, 'opacity:0']); }
    idleF.push([LOOP, 'opacity:1']); busyF.push([LOOP, 'opacity:0']);
    layers.push(`<g class="${holdAnim(idleF)} grn">${txt(WORD_COL, 23, 'Idle')}</g>`);
    layers.push(`<g class="${holdAnim(busyF)} yel" opacity="0">${txt(WORD_COL, 23, 'Busy')}</g>`);
  }

  const defs = [...usedGlyphs].sort().map((ch) => `<path id="${gid(ch)}" d="${glyphPath(ch)}"/>`).join('');
  const palette = CLASSES.map((k) => `.${k}{fill:${PAL[k]}}`).join('');
  css.push('@media (prefers-reduced-motion:reduce){*{animation-delay:-1.5s!important;animation-play-state:paused!important}}');

  const TITLE = 'CASTAWAY, drawn as a roguelike dungeon screen';
  const DESC = 'An 80 by 24 terminal screen on black. The word CASTAWAY is spelled by eight dungeon rooms '
    + 'shaped like its letters, with hyphen and pipe walls and full-stop floors, each holding one item. Below, '
    + 'a sea of blue braces with a sandy island: she is the @ under a green # palm, a cat f beside her, a turtle '
    + 'paddling. The message line narrates one minute on the beat: a bottle thrown out comes straight back, a '
    + 'shark in headphones nods, a coconut falls on a hermit crab and walks off, she walks out over the water '
    + 'and comes back with an iced coffee, and a hydrofoil carves past. Two status lines carry the project stats.';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VW} ${VH}" width="${VW}" height="${VH}" role="img" aria-labelledby="t d">`
    + `<title id="t">${TITLE}</title><desc id="d">${DESC}</desc>`
    + `<style>${palette}${css.join('')}</style>`
    + `<defs><clipPath id="scr"><rect width="${SW}" height="${SH}"/></clipPath>${defs}</defs>`
    + `<rect x="0.5" y="0.5" width="${VW - 1}" height="${VH - 1}" rx="12" fill="#000" stroke="#3B4048"/>`
    + `<g transform="translate(${PAD},${PAD})">${layers.join('')}</g>`
    + `</svg>\n`;
}

// ---------------------------------------------------------------------------------------------
// The README header (markdown). Links are written as they resolve from the castaway root.
// ---------------------------------------------------------------------------------------------
const esc = (str) => str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const link = (href, text = href) => `<a href="${href}">${esc(text)}</a>`;
// A legend row: " <glyph>  <item>, <file> ...... <what it is>", the file early in the line so
// it is on screen even where a phone has to scroll the rest.
function leader(glyph, item, file, what, at = 40) {
  const left = ` ${glyph}  ${item}${!file ? '' : item.endsWith('labelled') ? ' ' : ', '}`;
  const visible = left + (file || '') + ' ';
  const dots = Math.max(2, at - visible.length);
  return esc(left) + (file ? link(file) : '') + ' ' + '.'.repeat(dots) + ' ' + esc(what);
}

function buildMd() {
  const alt = 'CASTAWAY, drawn as an 80 by 24 roguelike dungeon screen in coloured letters and punctuation on black. '
    + 'The word CASTAWAY is eight dungeon rooms shaped like its letters, with hyphen and pipe walls and lit floors '
    + 'and one item in each room. A corridor runs down from the T and stops at the sea: a field of blue braces with '
    + 'one sandy island, where she is a coral @ beside a green # palm, with a cat f, a planted kumara, a sandcastle '
    + 'and a raft, while a turtle paddles round. The message line tells one minute, on the beat: welcome to Castaway; '
    + 'she throws a message in a bottle and it washes straight back to her feet; a fin circles the island and is a '
    + 'shark in headphones, nodding to the beat; a coconut falls on a hermit crab and walks off; she walks out over '
    + 'the water and off the map and comes back with an iced coffee, while the cat waits up the palm; a hydrofoil '
    + 'carves past with a shaka; and that was the busiest minute of the next ten hours. Status lines: Castaway the '
    + 'Idler, 80 BPM, key of F, 30 fps, -14 LUFS, seed 1992, Unbothered; Isle 1, no gold, 10 of 10 hours, more than '
    + '90 activities, more than 150 sounds, a bar counter running 01 to 20, and Idle or Busy.';

  const legend = [
    ' Things on this level',
    '',
    leader('?', 'a scroll labelled', 'MUSING.md', 'the log: start at "Current state"'),
    leader('+', 'a spellbook', 'activities.toml', 'more than 90 activities, 4 timers'),
    leader('/', 'a wand', 'tools/schedule.py', 'simulates ten hours in a moment'),
    leader('{', 'a fountain', 'tools/make_audio.py', 'every sound, synthesized from code'),
    leader('(', 'a tool', 'tools/serve.py', 'the renderer: run it, open :8765'),
    leader('*', 'a gem', 'web/index.html', 'live preview, export to MP4'),
    leader('"', 'an amulet', 'tools/render_demo.py', 'the dev reel: every activity, in turn'),
    leader('%', 'a coconut, or a kumara', '', 'for later'),
    '',
    ' @  you, the castaway: coral top, cream headphones, nowhere to be',
    ' f  a grey tabby, white chest (tame)     :  a sea turtle (peaceful)',
    ' ;  a shark in headphones (peaceful)     c  a hermit crab (moves house a lot)',
    ' #  the one tall palm, with one bar of signal at the very top',
    ' =  the raft (moored)                    ^  a sandcastle (the tide wants it)',
    ' }  the sea, which gives back everything you throw in it',
    ' &gt;  the stairs down: there are none. She could leave any time.',
  ].join('\n');

  const plain = esc(ascii(1.5));

  return `<!-- Header ${SLUG} for Castaway. Generated by src/${SLUG}.mjs: edit that, not this. -->

<p align="center">
  <img src="assets/${SLUG}.svg" width="100%" alt="${alt}">
</p>

<h1 align="center">Castaway</h1>

<p align="center">
  <b>A ten-hour lo-fi island video in which almost nothing happens, on purpose.</b><br>
  <sub>Working title. An unofficial remake, inspired by the 1992 screensaver <i>Johnny Castaway</i>. In development: no video published yet.</sub>
</p>

**Castaway** is a stationary-frame lo-fi video for YouTube: a young woman alone on a tiny island with one tall palm, a raft and a lot of time. She mostly idles, nodding to the music on her headphones, and every so often something happens. A message in a bottle washes straight back. A shark in headphones nods along. A coconut falls on a hermit crab, then gets up and walks off with the crab inside. Sunny and hand-painted, 16:9 at 1080p and 30 fps, and always daytime.

Up there it is drawn the way an old dungeon game would draw it, which suits it better than you might expect: she is the \`@\`, the palm is a \`#\`, the sea is a great many \`}\`, and there are no stairs down, because nobody here is going anywhere. More than 90 activities wait on four timers, every one starts on the next bar of the music so the gags land on the beat, and every sound is synthesized from code: no samples, no loops, no recordings.

\`\`\`sh
python tools/serve.py        # then open http://127.0.0.1:8765/
\`\`\`

<pre>
${legend}
</pre>

<details>
<summary><kbd>i</kbd> <b>Inventory</b> · what she is carrying (she travels light)</summary>

<pre>
 Weapons
 a - a fishing spear (bushcraft)
 Armor
 b - a pair of cream headphones (being worn)
 c - a coral tank top (being worn)
 d - a pair of cream shorts (being worn)
 Comestibles
 e - a coconut (for sipping)
 f - a kumara (planted; it grows over the course of the video)
 Potions
 g - an iced coffee (from somewhere over the water)
 Scrolls
 h - a message in a bottle (keeps coming back)
 Tools
 i - a phone (one bar of signal, at the top of the palm)
 j - a spare pair of headphones (delivered by drone)
 k - a fishing line
 l - a bow drill (fire by friction)
 m - a hammock (one palm, no second tree)
</pre>

</details>

<details>
<summary><kbd>Ctrl</kbd>+<kbd>O</kbd> <b>Overview</b> · the schedule: four timers, one level, ten hours</summary>

<pre>
 The Island: level 1 of 1 (you are here, and here is where you stay)

 timer        how often                    in a typical ten-hour run
 regular .... every 2 to 5 minutes ....... about 155
 occasional . every 12 to 25 minutes ..... about 30
 rare ....... every 30 to 60 minutes ..... about 13
 super rare . every 3 to 6 hours ......... about 2 (at most 3 a run)
 chained .... only after another one ..... the follow-ups
</pre>

The counts are the medians of 200 simulated runs, as ${link('activities.toml')} states in its own header: she is busy about a third of the time and idling the rest. More than 90 activities share the four timers (94 when this screen was drawn on 2026-10-01, and the list keeps growing). Lanes let things overlap, so a ship can sail past while she is busy with a coconut, and every start snaps to the next bar of the music, every 3 seconds. The default run is 10:00:00 on seed 1992. \`python tools/schedule.py\` validates the schedule and simulates a ten-hour run.

The scene has a life of its own too: 26 entries, 4 always-on effects and 22 timed events. Shore waves and drifting cloud shadows are built; distant birds, planes with vapour trails, whale pods, dolphins, sailboats, sandpipers, a gecko and a rain shower are planned.

</details>

<details>
<summary><kbd>&#92;</kbd> <b>Discoveries</b> · the gags identified so far</summary>

<pre>
 Bottles
   a message in a bottle ......... washes straight back to her feet
   a different bottle ............ turns up later, with a reply
 Visitors
   a sea turtle .................. visits, in no hurry at all
   a grey tabby, white chest ..... arrives on a crate, climbs the palm,
                                   naps, and one day floats away again
                                   (and comes back another time)
   a shark in headphones ......... nods to the beat, then leaves
   a tour boat ................... full of people taking selfies
   a bro on an electric hydrofoil  waves a shaka and carves off
   a delivery drone .............. its parcel is another pair of headphones
 Coconuts
   a coconut ..................... falls on a hermit crab, then walks off
                                   with the crab wearing it
 Errands
   the signal hunt ............... one bar, at the very top of the palm
   she could leave any time ...... walks out over the water and comes
                                   back with an iced coffee
 Bushcraft
   fire by friction, a hammock, a lookout up the palm, spear fishing
 Slow things
   a kumara ...................... planted, grows over the video
   a sandcastle .................. built, then taken by the tide
 Everyday
   coconut sipping, fishing, jogging laps, waving for rescue
</pre>

</details>

<details>
<summary><kbd>#</kbd><kbd>conduct</kbd> <b>Voluntary challenges</b> · the sound, made the hard way</summary>

<pre>
 Voluntary challenges:
   You never used a sample, a loop or a recording.
   You synthesized every sound from code.
   You kept the mix at -14 LUFS, true peak at or below -1 dBTP.
   You started every activity on the next bar of the music.
   You never saw night.
   You never went downstairs. There are no stairs.
   You left the island once, for coffee.
</pre>

All of it comes from ${link('tools/make_audio.py')}: more than 150 sound files and counting, no samples, loops or recordings, so no third-party licence applies. The theme is a seamless 60-second loop at 80 BPM in F major (a ii-V-I-vi progression): 20 bars of exactly 3 seconds, with electric piano, a kalimba lead, soft drums and vinyl crackle. The ocean ambience is a seamless 60-second loop too. Levels are adjustable in master and per routine. Nobody has listened to any of it yet, which is the only challenge still open.

The screen above loops in exactly 60 seconds too, so its \`Bar:\` counter wraps where the theme does.

</details>

<details>
<summary><kbd>?</kbd> <b>Help</b> · the renderer, reading the screen, and the small print</summary>

**The renderer** is a web page with live preview and export to a YouTube-ready MP4: \`python tools/serve.py\`, then open http://127.0.0.1:8765/ (the page itself is ${link('web/index.html')}). Plain ES modules, no build step, no npm packages. It exports frame-exact video in the browser (WebCodecs H.264, 68 to 78 frames a second at 1080p30 in Chrome), and the server mixes in the sound and joins the two into an MP4. \`python tools/render_demo.py --dev\` renders a dev reel of every activity with a heads-up display (the older Python reference renderer). Hard cuts and stepped movement are the motion defaults, which is why everything on the screen above moves one cell at a time.

**Reading the screen.** The top line is the message line. The two bottom lines are the status lines, re-labelled for an island: \`Castaway the Idler\` is the name and rank, \`Bpm:80 Key:F Fps:30 Lufs:-14 Seed:1992\` are the vital statistics, and \`Unbothered\` is the alignment. Below that, \`Isle:1\` is the dungeon level (there is only one), \`$:0\` is what the sound cost in licences, \`Hrs:10(10)\` is hours left out of hours total, and \`T:36000\` is ten hours counted in seconds. The status word says \`Busy\` when she is doing something and \`Idle\` the rest of the time, which is most of it.

**Notes from the project.** ${link('MUSING.md')} is the log; start at "Current state".

<sub>Castaway is an unofficial project, inspired by the small-island routines and visual comedy of the 1992 screensaver Johnny Castaway, which belongs to its owners; this project is not affiliated with them. The screen above borrows only the shared look of the roguelike genre that began with Rogue and continued through Hack and NetHack (an at-sign for you, punctuation for things, two status lines); the level, messages, rank and item names are new. Level surveyed by the Driftline Survey (one surveyor, one island, no stairs). Status: in development, no video published yet.</sub>

</details>

<details>
<summary><b>No pictures?</b> The same level in plain text, at the start of the minute</summary>

<pre>
${plain}
</pre>

</details>
`;
}

fs.mkdirSync(path.dirname(OUT_SVG), { recursive: true });
const svg = buildSvg();
fs.writeFileSync(OUT_SVG, svg);
fs.writeFileSync(OUT_MD, buildMd());
console.log(`wrote ${path.basename(OUT_SVG)} (${(svg.length / 1024).toFixed(1)} KB) and ${path.basename(OUT_MD)}`);
