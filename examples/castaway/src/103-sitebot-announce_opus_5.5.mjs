#!/usr/bin/env node
// Castaway README header: "Sitebot Announce" (103-sitebot-announce_opus_5.5), style catalogue entry
// xfer-06: the bot in a site's private IRC channel that narrates everything one bracketed line at a
// time ("SITE :: [racer ][SECTION] ..."), about 2002-2008. Here the "site" is the island and the
// only things ever announced are the project's own: its 10-hour run, its gags and its sound.
//
//   node examples/castaway/src/103-sitebot-announce_opus_5.5.mjs
//
// Regenerates, next to this file in ../assets/:
//   103-sitebot-announce_opus_5.5.svg    the banner (1280 x 679 viewBox)
// The .md beside the assets is hand-written, not generated.
// Debug: --out=FILE writes the SVG somewhere else.
//
// Plain Node, no dependencies, no randomness, no clock.
//
// What is invented and what is not
//   The site tag CAY, the channel #cay and the group tag ONEPALM are made up for this banner.
//   Users and groups are the project's own: the users are who acts on the island, the groups are
//   the real schedule lanes in activities.toml (castaway, cat, turtle, sea_sky, shore, garden),
//   and the sections are the real timer tiers. The announce grammar (padded six-character tags,
//   double colons, user/group, the hall-of-fame lines) is the generic sitebot convention; no real
//   site, group, bot script wording or release name is used, and nothing but this project's own
//   video and files is ever "released" here. The colours are the classic IRC client's numbered
//   palette (00-15), using only the indices that read on a dark background.
//
// How it is built
//   Text: my own 6x13 bitmap font (one-pixel stems, nine-pixel capitals, real descenders), drawn
//   on a half-pixel grid so that IRC "bold" can be the old terminal trick: the glyph printed again
//   one half-pixel to the right. Each glyph is traced into one outline path (no seams when it is
//   scaled up for the headline) and placed with <use>. No <text> anywhere.
//   The log: one period of 20 announce lines is drawn followed by the first 9 again, and one CSS
//   animation steps the whole log up one line every 3 seconds (steps(20) over 60 s). After 20 steps
//   the view is identical to the first frame, so the loop has no seam. 3 s is one bar of the
//   project's 80 BPM theme and 20 bars is its 60-second loop: every line lands on the next bar,
//   the way the project's own activities do. The status bar's bar counter (01/20) and its beat
//   light (four beats of 0.75 s) run on the same clock. Hard cuts only, like the project's motion.
//   prefers-reduced-motion: everything stops on the first frame, which already shows the headline,
//   nine announce lines, the topic with the run command and the status bar.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '103-sitebot-announce_opus_5.5';
const ARGS = Object.fromEntries(process.argv.slice(2).filter((a) => a.startsWith('--')).map((a) => {
  const [k, ...v] = a.slice(2).split('=');
  return [k, v.length ? v.join('=') : true];
}));
const OUT = ARGS.out ? path.resolve(String(ARGS.out)) : path.join(HERE, '..', 'assets', `${SLUG}.svg`);

const num = (n) => { const s = (Math.round(n * 100) / 100).toString(); return s === '-0' ? '0' : s; };

// ------------------------------------------------------------------------------------- palette
// Classic IRC colour indices (the 16 numbered colours every client shared).
const IRC = {
  0: '#ffffff', 1: '#000000', 2: '#00007f', 3: '#009300', 4: '#ff0000', 5: '#7f0000', 6: '#9c009c',
  7: '#fc7f00', 8: '#ffff00', 9: '#00fc00', 10: '#009393', 11: '#00ffff', 12: '#0000fc',
  13: '#ff00ff', 14: '#7f7f7f', 15: '#d2d2d2',
};
// Fill classes used in the SVG's own <style>. Every text colour is one IRC index.
const FILL = { bl: 12, w: 0, lg: 15, gr: 14, r: 4, o: 7, y: 8, g: 9, dg: 3, t: 10, c: 11, p: 13, pu: 6, nv: 2 };

// Sections override the theme's three colours, the way the bot's theme allows per section:
// [tag colour, section colour, release colour]. LOFI is the theme's own default trio (04, 07, 11).
const SECTION = {
  LOFI: ['r', 'o', 'c'],
  REGULAR: ['g', 'dg', 'y'],
  OCCASIONAL: ['p', 'g', 'c'],
  RARE: ['o', 'y', 'c'],
  'SUPER-RARE': ['r', 'p', 'y'],
  CHAINED: ['t', 't', 'c'],
  SOUND: ['g', 'c', 'y'],
  '': ['r', 'o', 'y'],
};

// ------------------------------------------------------------------------------------- font 6x13
// Glyphs are 5 pixels wide in a 6-pixel cell, 13 rows tall: capitals on rows 2-10, lower case
// x-height rows 5-10, descenders to row 12, brackets rows 1-11. Rows are given from `top` down.
const FONT = new Map();
function def(ch, top, rows) {
  const g = Array.from({ length: 13 }, () => '.....');
  rows.split(' ').forEach((r, i) => { g[top + i] = r.padEnd(5, '.'); });
  FONT.set(ch, g);
}
const CAPS = {
  A: '..#.. .#.#. #...# #...# #...# ##### #...# #...# #...#',
  B: '####. #...# #...# #...# ####. #...# #...# #...# ####.',
  C: '.###. #...# #.... #.... #.... #.... #.... #...# .###.',
  D: '###.. #..#. #...# #...# #...# #...# #...# #..#. ###..',
  E: '##### #.... #.... #.... ####. #.... #.... #.... #####',
  F: '##### #.... #.... #.... ####. #.... #.... #.... #....',
  G: '.###. #...# #.... #.... #.### #...# #...# #...# .###.',
  H: '#...# #...# #...# #...# ##### #...# #...# #...# #...#',
  I: '.###. ..#.. ..#.. ..#.. ..#.. ..#.. ..#.. ..#.. .###.',
  J: '..### ...#. ...#. ...#. ...#. ...#. #..#. #..#. .##..',
  K: '#...# #...# #..#. #.#.. ##... #.#.. #..#. #...# #...#',
  L: '#.... #.... #.... #.... #.... #.... #.... #.... #####',
  M: '#...# ##.## #.#.# #.#.# #...# #...# #...# #...# #...#',
  N: '#...# #...# ##..# #.#.# #..## #...# #...# #...# #...#',
  O: '.###. #...# #...# #...# #...# #...# #...# #...# .###.',
  P: '####. #...# #...# #...# ####. #.... #.... #.... #....',
  Q: '.###. #...# #...# #...# #...# #...# #.#.# #..#. .##.#',
  R: '####. #...# #...# #...# ####. #.#.. #..#. #...# #...#',
  S: '.###. #...# #.... #.... .###. ....# ....# #...# .###.',
  T: '##### ..#.. ..#.. ..#.. ..#.. ..#.. ..#.. ..#.. ..#..',
  U: '#...# #...# #...# #...# #...# #...# #...# #...# .###.',
  V: '#...# #...# #...# #...# #...# .#.#. .#.#. ..#.. ..#..',
  W: '#...# #...# #...# #...# #.#.# #.#.# #.#.# #.#.# .#.#.',
  X: '#...# #...# .#.#. .#.#. ..#.. .#.#. .#.#. #...# #...#',
  Y: '#...# #...# .#.#. .#.#. ..#.. ..#.. ..#.. ..#.. ..#..',
  Z: '##### ....# ...#. ...#. ..#.. .#... .#... #.... #####',
  0: '.###. #...# #..## #.#.# #.#.# #.#.# ##..# #...# .###.',
  1: '..#.. .##.. #.#.. ..#.. ..#.. ..#.. ..#.. ..#.. #####',
  2: '.###. #...# ....# ....# ...#. ..#.. .#... #.... #####',
  3: '.###. #...# ....# ....# ..##. ....# ....# #...# .###.',
  4: '...#. ..##. .#.#. #..#. #..#. ##### ...#. ...#. ...#.',
  5: '##### #.... #.... ####. ....# ....# ....# #...# .###.',
  6: '.###. #.... #.... ####. #...# #...# #...# #...# .###.',
  7: '##### ....# ....# ...#. ...#. ..#.. ..#.. .#... .#...',
  8: '.###. #...# #...# #...# .###. #...# #...# #...# .###.',
  9: '.###. #...# #...# #...# .#### ....# ....# ....# .###.',
};
for (const [ch, rows] of Object.entries(CAPS)) def(ch, 2, rows);
const LOWER = {
  a: [5, '.###. ....# .#### #...# #..## .##.#'],
  b: [2, '#.... #.... #.... ####. #...# #...# #...# #...# ####.'],
  c: [5, '.###. #...# #.... #.... #...# .###.'],
  d: [2, '....# ....# ....# .#### #...# #...# #...# #...# .####'],
  e: [5, '.###. #...# ##### #.... #...# .###.'],
  f: [2, '..##. .#..# .#... .#... ####. .#... .#... .#... .#...'],
  g: [5, '.#### #...# #...# #...# #...# .#### ....# .###.'],
  h: [2, '#.... #.... #.... #.##. ##..# #...# #...# #...# #...#'],
  i: [3, '..#.. ..... .##.. ..#.. ..#.. ..#.. ..#.. .###.'],
  j: [3, '...#. ..... ..##. ...#. ...#. ...#. ...#. ...#. #..#. .##..'],
  k: [2, '#.... #.... #.... #..#. #.#.. ##... #.#.. #..#. #...#'],
  l: [2, '.##.. ..#.. ..#.. ..#.. ..#.. ..#.. ..#.. ..#.. .###.'],
  m: [5, '##.#. #.#.# #.#.# #.#.# #.#.# #...#'],
  n: [5, '#.##. ##..# #...# #...# #...# #...#'],
  o: [5, '.###. #...# #...# #...# #...# .###.'],
  p: [5, '####. #...# #...# #...# #...# ####. #.... #....'],
  q: [5, '.#### #...# #...# #...# #...# .#### ....# ....#'],
  r: [5, '#.##. ##..# #.... #.... #.... #....'],
  s: [5, '.#### #.... .###. ....# ....# ####.'],
  t: [3, '.#... .#... ####. .#... .#... .#... .#..# ..##.'],
  u: [5, '#...# #...# #...# #...# #..## .##.#'],
  v: [5, '#...# #...# #...# .#.#. .#.#. ..#..'],
  w: [5, '#...# #...# #.#.# #.#.# #.#.# .#.#.'],
  x: [5, '#...# .#.#. ..#.. ..#.. .#.#. #...#'],
  y: [5, '#...# #...# #...# #...# #..## .##.# ....# .###.'],
  z: [5, '##### ...#. ..#.. .#... #.... #####'],
};
for (const [ch, [top, rows]] of Object.entries(LOWER)) def(ch, top, rows);
const PUNCT = {
  ' ': [0, ''],
  '.': [9, '.##.. .##..'],
  ',': [9, '.##.. .##.. ..#.. .#...'],
  ':': [5, '.##.. .##.. ..... ..... .##.. .##..'],
  ';': [5, '.##.. .##.. ..... ..... .##.. .##.. ..#.. .#...'],
  '!': [2, '..#.. ..#.. ..#.. ..#.. ..#.. ..#.. ..... ..#.. ..#..'],
  '?': [2, '.###. #...# ....# ...#. ..#.. ..#.. ..... ..#.. ..#..'],
  "'": [2, '..#.. ..#.. .#...'],
  '"': [2, '.#.#. .#.#. .#.#.'],
  '-': [7, '.###.'],
  '_': [11, '#####'],
  '/': [2, '....# ....# ...#. ...#. ..#.. .#... .#... #.... #....'],
  '[': [1, '.###. .#... .#... .#... .#... .#... .#... .#... .#... .#... .###.'],
  ']': [1, '.###. ...#. ...#. ...#. ...#. ...#. ...#. ...#. ...#. ...#. .###.'],
  '(': [1, '...#. ..#.. .#... .#... .#... .#... .#... .#... .#... ..#.. ...#.'],
  ')': [1, '.#... ..#.. ...#. ...#. ...#. ...#. ...#. ...#. ...#. ..#.. .#...'],
  '%': [2, '##..# ##..# ...#. ...#. ..#.. .#... .#... #..## #..##'],
  '+': [5, '..#.. ..#.. ##### ..#.. ..#..'],
  '=': [6, '##### ..... #####'],
  '<': [4, '...#. ..#.. .#... #.... .#... ..#.. ...#.'],
  '>': [4, '.#... ..#.. ...#. ....# ...#. ..#.. .#...'],
  '#': [2, '.#.#. .#.#. ##### .#.#. .#.#. .#.#. ##### .#.#. .#.#.'],
  '*': [4, '..#.. #.#.# .###. #.#.# ..#..'],
  '~': [6, '.#..# #.##.'],
  '|': [1, '..#.. ..#.. ..#.. ..#.. ..#.. ..#.. ..#.. ..#.. ..#.. ..#.. ..#..'],
  '&': [2, '.##.. #..#. #..#. .##.. .#... #.#.# #..#. #..#. .##.#'],
  '♪': [2, '..#.. ..##. ..#.# ..#.. ..#.. .##.. ###.. ###.. .#...'],
  '·': [6, '..... .##.. .##..'],
};
for (const [ch, [top, rows]] of Object.entries(PUNCT)) def(ch, top, rows.length ? rows : '.....');

// ------------------------------------------------------------------------------------- outlines
// Trace a binary grid into one outline path. Every filled cell side that borders an empty cell
// becomes a directed edge (clockwise around the ink); edges are chained into loops and collinear
// runs merged. With the nonzero rule the union of loops is exactly the ink, holes included.
function tracePath(grid, sx, sy) {
  const H = grid.length, W = grid[0].length;
  const on = (x, y) => x >= 0 && y >= 0 && x < W && y < H && grid[y][x];
  const edges = new Map();
  const add = (x0, y0, x1, y1) => {
    const k = `${x0},${y0}`;
    if (!edges.has(k)) edges.set(k, []);
    edges.get(k).push([x1, y1]);
  };
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (!on(x, y)) continue;
      if (!on(x, y - 1)) add(x, y, x + 1, y);
      if (!on(x + 1, y)) add(x + 1, y, x + 1, y + 1);
      if (!on(x, y + 1)) add(x + 1, y + 1, x, y + 1);
      if (!on(x - 1, y)) add(x, y + 1, x, y);
    }
  }
  let d = '';
  for (const start of [...edges.keys()].sort()) {
    while (edges.get(start) && edges.get(start).length) {
      const pts = [start.split(',').map(Number)];
      let cur = start;
      for (;;) {
        const list = edges.get(cur);
        if (!list || !list.length) break;
        const nxt = list.shift();
        pts.push(nxt);
        cur = `${nxt[0]},${nxt[1]}`;
        if (cur === start) break;
      }
      // merge collinear points
      const simp = [];
      for (let i = 0; i < pts.length - 1; i++) {
        const p = pts[i];
        if (simp.length >= 2) {
          const a = simp[simp.length - 2], b = simp[simp.length - 1];
          if ((a[0] === b[0] && b[0] === p[0]) || (a[1] === b[1] && b[1] === p[1])) simp.pop();
        }
        simp.push(p);
      }
      if (simp.length >= 3) {
        const a = simp[simp.length - 2], b = simp[simp.length - 1], p = simp[0];
        if ((a[0] === b[0] && b[0] === p[0]) || (a[1] === b[1] && b[1] === p[1])) simp.pop();
      }
      let s = `M${num(simp[0][0] * sx)} ${num(simp[0][1] * sy)}`;
      for (let i = 1; i < simp.length; i++) {
        const [px, py] = simp[i - 1], [qx, qy] = simp[i];
        s += qx === px ? `v${num((qy - py) * sy)}` : `h${num((qx - px) * sx)}`;
      }
      d += `${s}z`;
    }
  }
  return d;
}

// Base text: one font pixel = 2 units, so a cell is 12 x 26. Glyphs are traced on a half-pixel
// grid (1 unit wide, 2 units tall) so the bold copy can sit one half-pixel to the right.
const CW = 12, CH = 26;
function glyphGrid(ch, bold) {
  const g = FONT.get(ch);
  if (!g) throw new Error(`no glyph for ${JSON.stringify(ch)}`);
  return g.map((row) => {
    const out = new Array(11).fill(false);
    [...row].forEach((c, i) => {
      if (c !== '#') return;
      out[2 * i] = out[2 * i + 1] = true;
      if (bold) out[2 * i + 2] = true;
    });
    return out;
  });
}
const used = new Map(); // id -> path d
const ID_SAFE = /^[A-Za-z0-9]$/;
function glyphId(ch, bold) {
  const base = ID_SAFE.test(ch) ? (/[a-z]/.test(ch) ? `l${ch}` : /[A-Z]/.test(ch) ? `u${ch}` : `d${ch}`) : `p${ch.codePointAt(0).toString(16)}`;
  const id = (bold ? 'b' : 'n') + base;
  if (!used.has(id) && ch !== ' ') used.set(id, tracePath(glyphGrid(ch, bold), 1, 2));
  return id;
}

// ------------------------------------------------------------------------------------- text runs
// A run is [text, fillClass, bold]. Returns <use> elements grouped by fill.
function runsToSvg(runs, x0, y0, adv = CW) {
  const byFill = new Map();
  let col = 0;
  for (const [text, fill, bold] of runs) {
    for (const ch of text) {
      if (ch !== ' ') {
        const id = glyphId(ch, bold);
        const key = fill;
        if (!byFill.has(key)) byFill.set(key, []);
        byFill.get(key).push(`<use href="#${id}" x="${num(x0 + col * adv)}"/>`);
      }
      col++;
    }
  }
  let s = '';
  for (const [fill, uses] of byFill) s += `<g class="${fill}" transform="translate(0 ${num(y0)})">${uses.join('')}</g>`;
  return { svg: s, cols: col };
}
const runsLen = (runs) => runs.reduce((n, [t]) => n + [...t].length, 0);

// Tiny markup for announce bodies:
//   *x*  bold white (users, numbers)      ~x~  bold, the section's release colour
//   ::   dim separator                    {x}  a bracketed label: grey brackets, section colour
//   /GROUP after a user stays plain (the bot bolds the user, not the group)
function parseBody(body, sec) {
  const [, c2, c3] = SECTION[sec];
  const runs = [];
  const re = /(\*[^*]+\*|~[^~]+~|::|\{[^}]+\})/g;
  let last = 0, m;
  const plain = (t) => { if (t) runs.push([t, 'lg', false]); };
  while ((m = re.exec(body))) {
    plain(body.slice(last, m.index));
    const tok = m[0];
    if (tok === '::') runs.push(['::', 'gr', false]);
    else if (tok[0] === '*') runs.push([tok.slice(1, -1), 'w', true]);
    else if (tok[0] === '~') runs.push([tok.slice(1, -1), c3, true]);
    else { runs.push(['[', 'gr', false], [tok.slice(1, -1), c2, false], [']', 'gr', false]); }
    last = m.index + tok.length;
  }
  plain(body.slice(last));
  return runs;
}
function announce(tag, sec, body) {
  const [c1, c2] = SECTION[sec];
  const runs = [['CAY', 'w', true], [' :: ', 'gr', false], ['[', 'gr', false], [tag.padEnd(6), c1, true], [']', 'gr', false]];
  if (sec) runs.push(['[', 'gr', false], [sec, c2, false], [']', 'gr', false]);
  runs.push([' ', 'lg', false], ...parseBody(body, sec));
  return runs;
}

// ------------------------------------------------------------------------------------- the log
// 20 lines, one per bar (3 s), 60 s per loop: the length of the theme. Every claim is the
// project's own: see the .md for sources (activities.toml, MUSING.md, the default run).
const LOG = [
  ['new', 'LOFI', '~Castaway.10h.Run~ by *her*/CASTAWAY :: seed *1992* :: expecting *10:00:00*'],
  ['racer', 'OCCASIONAL', '*ship*/SEA_SKY is racing *her*/CASTAWAY :: she is busy with a ~coconut~'],
  ['leader', 'REGULAR', '*her*/CASTAWAY takes the lead :: ~Coconut.Sip~, eyes closed :: ships seen *0*'],
  ['login', 'RARE', '*cat*/CAT logged in from a ~crate~ :: grey tabby, white chest'],
  ['nuke', 'OCCASIONAL', '~Note.In.A.Bottle~ x*1* by *the.sea* {reason} came.straight.back {nukees} *her*'],
  ['dupe', 'RARE', '~Headphones~ by *drone*/SEA_SKY :: dupe of the pair she is wearing'],
  ['racer', 'RARE', '*shark*/SEA_SKY is racing *her*/CASTAWAY at *80 BPM* :: both nodding :: a tie'],
  ['wipe', 'CHAINED', '~Sandcastle~ wiped by *tide*/SHORE :: she will build it again'],
  ['req', 'SUPER-RARE', '*her*/CASTAWAY requests ~A.Lift.Home~ :: waving for rescue'],
  ['50%', 'LOFI', '~Castaway.10h.Run~ is halfway :: *her*/CASTAWAY leads, idling :: ETA *5:00:00*'],
  ['filled', 'RARE', '~A.Lift.Home~ by *tour.boat*/SEA_SKY :: selfies taken :: lifts *0*'],
  ['bwinfo', '', '*1* up at *1 bar* :: top of the palm :: *0* down :: *1* phone, held very high'],
  ['update', 'OCCASIONAL', '~Coconut.On.A.Hermit.Crab~ :: the coconut walked off :: crab inside'],
  ['unnuke', 'CHAINED', '~Note.In.A.Bottle~ :: a different bottle washed up :: a reply'],
  ['logout', 'SUPER-RARE', '*her*/CASTAWAY walked out over the water :: island empty'],
  ['login', 'SUPER-RARE', '*her*/CASTAWAY is back with an ~iced.coffee~ :: explains nothing'],
  ['stats', 'SOUND', '*0* samples :: *0* loops borrowed :: every sound is ~synthesized.from.code~'],
  ['done', 'LOFI', '~Castaway.10h.Run~ :: about *155* regular, *30* occasional, *13* rare, *2* super-rare'],
  ['stats', 'LOFI', 'Users hall of fame :: [*01*] *her*/CASTAWAY idle *2/3* :: [*02*] *cat*/CAT napping'],
  ['stats', 'LOFI', 'Groups hall of fame :: [*01*] SEA_SKY *0* rescues :: [*02*] SHORE *0* castles kept'],
];
const LINES = LOG.map(([tag, sec, body]) => announce(tag, sec, body));
LINES.forEach((r, i) => {
  const n = runsLen(r);
  if (n > 99) throw new Error(`log line ${i} is ${n} columns: ${r.map((x) => x[0]).join('')}`);
});

// ------------------------------------------------------------------------------------- geometry
const W = 1280;
const MX = 40;                       // text left edge
const TERM_X = 24, TERM_W = W - 48;  // the client pane
const ROWS = 9;                      // visible log rows
const LH = 27;                       // log line pitch
const BAR_H = 30;
const T = 60, STEP = 3, STEPS = T / STEP;

// Headline
const S_SMALL = 1.5;                 // the pre line and the release-name tail (one pixel = 3)
const S_BIG = 7;                     // CASTAWAY (one pixel = 14)
const Y_PRE = 30;                    // top of the pre line's cell
const Y_BIG = Y_PRE + 13 * 2 * S_SMALL - 2;   // cell top of the big word
const BIG_CAP_TOP = Y_BIG + 2 * 2 * S_BIG;
const BIG_BASE = Y_BIG + 11 * 2 * S_BIG;
const Y_PITCH = BIG_BASE + 20;
const TERM_Y = Y_PITCH + 13 * 2 * 1.25 + 26;
const LOG_Y = TERM_Y + BAR_H + 10;
const LOG_H = ROWS * LH;
const SB_Y = LOG_Y + LOG_H + 8;
const PROMPT_Y = SB_Y + BAR_H;
const TERM_H = PROMPT_Y + BAR_H + 4 - TERM_Y;
const H = Math.ceil(TERM_Y + TERM_H + 24);

function scaled(runs, x, y, s, adv = CW) {
  const { svg, cols } = runsToSvg(runs, 0, 0, adv);
  return { svg: `<g transform="translate(${num(x)} ${num(y)}) scale(${s})">${svg}</g>`, w: cols * adv * s - (adv - CW) * s };
}

const parts = [];

// Panel
parts.push(`<rect class="panel" x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="16"/>`);

// --- headline: the pre line, blown up
const preRuns = [['CAY', 'w', true], [' :: ', 'gr', false], ['[', 'gr', false], ['pre   ', 'r', true], [']', 'gr', false],
  ['[', 'gr', false], ['LOFI', 'o', false], [']', 'gr', false]];
parts.push(scaled(preRuns, MX, Y_PRE, S_SMALL).svg);
const sideRuns = [['#cay', 'gr', false], [' :: ', 'gr', false], ['1', 'w', true], [' island ', 'lg', false], ['::', 'gr', false],
  [' ', 'lg', false], ['1', 'w', true], [' bot ', 'lg', false], ['::', 'gr', false], [' ', 'lg', false], ['0', 'w', true], [' nights', 'lg', false]];
{
  const w = runsLen(sideRuns) * CW * S_SMALL;
  parts.push(scaled(sideRuns, W - MX - w, Y_PRE, S_SMALL).svg);
}
const BIG_ADV = CW + 2;              // one extra font pixel of tracking for the headline
const big = scaled([['CASTAWAY', 'c', true]], MX, Y_BIG, S_BIG, BIG_ADV);
const bigShadow = scaled([['CASTAWAY', 'bl', true]], MX + S_BIG, Y_BIG + S_BIG, S_BIG, BIG_ADV);
parts.push(`<g class="big">${bigShadow.svg}${big.svg}</g>`);
// the rest of the release name, stacked to the right of the big word
const TAIL = ['.10h.Lofi.Island', '.1080p30.Synthesized', '-ONEPALM'];
const tailX = MX + big.w + 24;
const tailTop = BIG_CAP_TOP - 2 * 2 * S_SMALL;            // cap tops line up
const tailBottom = BIG_BASE - 11 * 2 * S_SMALL;           // baselines line up
if (tailX + Math.max(...TAIL.map((t) => t.length)) * CW * S_SMALL > W - MX) throw new Error('tail too wide');
TAIL.forEach((t, i) => {
  const y = tailTop + (tailBottom - tailTop) * (i / (TAIL.length - 1));
  parts.push(scaled([[t, 'c', true]], tailX, y, S_SMALL).svg);
});
// the pitch, in the bot's own grammar
const pitchRuns = [['::', 'gr', false], [' a ', 'lg', false], ['10-hour', 'w', true], [' lo-fi island video ', 'lg', false], ['::', 'gr', false],
  [' she idles ', 'lg', false], ['::', 'gr', false], [' every so often, ', 'lg', false], ['a gag', 'y', true], [' ', 'lg', false], ['::', 'gr', false]];
parts.push(scaled(pitchRuns, MX, Y_PITCH, 1.25).svg);
if (runsLen(pitchRuns) * CW * 1.25 > W - 2 * MX) throw new Error(`pitch too wide: ${runsLen(pitchRuns)}`);

// --- the client pane
parts.push(`<clipPath id="termclip"><rect x="${TERM_X}" y="${TERM_Y}" width="${TERM_W}" height="${TERM_H}" rx="8"/></clipPath>`);
parts.push(`<g clip-path="url(#termclip)">`);
parts.push(`<rect class="term" x="${TERM_X}" y="${TERM_Y}" width="${TERM_W}" height="${TERM_H}"/>`);
// topic bar
parts.push(`<rect class="bar" x="${TERM_X}" y="${TERM_Y}" width="${TERM_W}" height="${BAR_H}"/>`);
const topicRuns = [[' #cay', 'w', true], [': ', 'lg', false], ['10 hours, one island, almost nothing happens', 'lg', false], [' :: ', 'c', false],
  ['run ', 'lg', false], ['python tools/serve.py', 'y', true], [' then ', 'lg', false], ['127.0.0.1:8765', 'y', true]];
if (runsLen(topicRuns) > 101) throw new Error(`topic is ${runsLen(topicRuns)} columns`);
parts.push(runsToSvg(topicRuns, TERM_X + 4, TERM_Y + 2).svg);

// the log: 20 lines, then the first 9 again, stepped up one line per bar
parts.push(`<clipPath id="logclip"><rect x="${TERM_X}" y="${LOG_Y}" width="${TERM_W}" height="${LOG_H}"/></clipPath>`);
parts.push(`<rect class="fresh anim" x="${TERM_X}" y="${LOG_Y + (ROWS - 1) * LH - 1}" width="${TERM_W}" height="${LH}"/>`);
parts.push(`<g clip-path="url(#logclip)"><g class="scroll anim">`);
const seq = [...LINES, ...LINES.slice(0, ROWS)];
seq.forEach((runs, i) => { parts.push(runsToSvg(runs, MX, LOG_Y + i * LH).svg); });
parts.push(`</g></g>`);

// status bar
parts.push(`<rect class="bar" x="${TERM_X}" y="${SB_Y}" width="${TERM_W}" height="${BAR_H}"/>`);
const sbRuns = [[' [', 'c', false], ['12:00', 'w', false], ['] [', 'c', false], ['you', 'w', false], ['(+i)', 'lg', false], ['] [', 'c', false],
  ['2:#cay', 'w', false], ['(+nt)', 'lg', false], ['] [', 'c', false], ['Act: ', 'lg', false], ['2', 'y', true], [']', 'c', false]];
parts.push(runsToSvg(sbRuns, TERM_X + 4, SB_Y + 2).svg);
// right side: now playing, with the bar counter and the beat light
const npPrefix = [['[', 'c', false], ['♪ ', 'y', false], ['theme ', 'w', false], ['F major', 'lg', false], [' · ', 'c', false],
  ['80 BPM', 'lg', false], [' · ', 'c', false], ['bar ', 'lg', false]];
const npSuffix = [['/20 ', 'lg', false]];
const npCols = runsLen(npPrefix) + 2 + runsLen(npSuffix) + 4 + 1;     // + "NN" + 4 beat lights + "]"
const npX = TERM_X + TERM_W - 8 - npCols * CW;
parts.push(runsToSvg(npPrefix, npX, SB_Y + 2).svg);
const counterX = npX + runsLen(npPrefix) * CW;
parts.push(`<clipPath id="ctr"><rect x="${counterX}" y="${SB_Y}" width="${2 * CW}" height="${BAR_H}"/></clipPath>`);
let strip = '';
for (let i = 0; i <= STEPS; i++) strip += runsToSvg([[String((i % STEPS) + 1).padStart(2, '0'), 'w', true]], counterX, SB_Y + 2 + i * BAR_H).svg;
parts.push(`<g clip-path="url(#ctr)"><g class="ctr anim">${strip}</g></g>`);
parts.push(runsToSvg(npSuffix, counterX + 2 * CW, SB_Y + 2).svg);
const beatX = counterX + (2 + runsLen(npSuffix)) * CW;
for (let b = 0; b < 4; b++) parts.push(`<rect class="dot" x="${beatX + b * CW + 3}" y="${SB_Y + 11}" width="6" height="8"/>`);
parts.push(`<rect class="beat anim" x="${beatX + 3}" y="${SB_Y + 11}" width="6" height="8"/>`);
parts.push(runsToSvg([[']', 'c', false]], beatX + 4 * CW, SB_Y + 2).svg);

// prompt line
const promptRuns = [['[', 'c', false], ['#cay', 'w', false], ['] ', 'c', false], ['is this the whole video', 'lg', false]];
parts.push(runsToSvg(promptRuns, TERM_X + 4, PROMPT_Y + 2).svg);
parts.push(`<rect class="cursor anim" x="${TERM_X + 4 + runsLen(promptRuns) * CW + 1}" y="${PROMPT_Y + 4}" width="${CW - 2}" height="22"/>`);
parts.push(`</g>`);
parts.push(`<rect class="edge" x="${TERM_X + 0.5}" y="${TERM_Y + 0.5}" width="${TERM_W - 1}" height="${TERM_H - 1}" rx="8"/>`);

// ------------------------------------------------------------------------------------- assemble
const fills = Object.entries(FILL).map(([k, n]) => `.${k}{fill:${IRC[n]}}`).join('');
const css = `
${fills}
.panel{fill:#0b0d12;stroke:#2a313c}
.term{fill:#020304}
.edge{fill:none;stroke:#262d38}
.bar{fill:${IRC[2]}}
.dot{fill:#2b2f8f}
.beat{fill:${IRC[8]}}
.cursor{fill:${IRC[15]}}
.fresh{fill:#ffffff;opacity:0}
.scroll{animation:scroll ${T}s steps(${STEPS},end) infinite}
.ctr{animation:ctr ${T}s steps(${STEPS},end) infinite}
.beat{animation:beat ${STEP}s steps(4,end) infinite}
.fresh{animation:fresh ${STEP}s linear infinite}
.cursor{animation:blink 1.2s steps(1,end) infinite}
@keyframes scroll{from{transform:translateY(0)}to{transform:translateY(-${STEPS * LH}px)}}
@keyframes ctr{from{transform:translateY(0)}to{transform:translateY(-${STEPS * BAR_H}px)}}
@keyframes beat{from{transform:translateX(0)}to{transform:translateX(${4 * CW}px)}}
@keyframes fresh{0%{opacity:.09}45%{opacity:0}100%{opacity:0}}
@keyframes blink{0%{opacity:1}50%{opacity:0}}
@media (prefers-reduced-motion: reduce){.anim{animation:none!important}.fresh{opacity:0}}
`;
const defs = [...used.entries()].map(([id, d]) => `<path id="${id}" d="${d}"/>`).join('');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Castaway: a sitebot announce channel for a 10-hour lo-fi island video">
<title>Castaway: sitebot announce</title>
<desc>The word CASTAWAY in large cyan pixel capitals above a dark IRC window in which an invented bot, CAY, announces the island's gags one bracketed line per bar of the 80 BPM theme: the ship racing her while she sips a coconut, the cat logging in from a crate, the bottle that comes straight back, the shark nodding at 80 BPM. Run python tools/serve.py, then open 127.0.0.1:8765.</desc>
<style>${css}</style>
<defs>${defs}</defs>
${parts.join('\n')}
</svg>
`;
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, svg);
console.log(`wrote ${path.relative(process.cwd(), OUT)} (${W}x${H}, ${(svg.length / 1024).toFixed(1)} KB, ${used.size} glyphs)`);
