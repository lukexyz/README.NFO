#!/usr/bin/env node
// Handheld Tracker: README header generator for ULTRA-SATISFACTORY.
//
//   node examples/ultra-satisfactory/src/19-handheld-tracker_opus_5.5.mjs
//
// Writes examples/ultra-satisfactory/assets/19-handheld-tracker_opus_5.5.svg.
// Plain Node, no dependencies, no randomness, no clock: the same bytes every run.
//
// The style (catalogue entry trk-05) is the early-2000s handheld tracker: a whole
// music editor squeezed into a 160 x 144 pixel LCD of 8 x 8 tiles, split over
// several screens that you move between on a little map in the corner. The
// reference is the LSDj phrase and song screens in their white / pale cyan /
// pale pink / red-pink palette. Nothing of it is reproduced here: no console
// shell, no product names, and the 8 x 8 face, the tiny header face and the logo
// lettering below are all drawn by hand for this file.
//
// What is on the panel (no device, just four LCDs on a dark card):
//
//   PROJECT   160 x 144 at 3x. The name as two tile logos, the pitch, the counts,
//             the channel list and the screen map.
//   SHIFT 00  160 x 144 at 2x, the "song" screen. Four channels: OBJ, ITM, BLD (the
//             app's three tabs) and NOI (the factory, whose mute does not work). One
//             lookup per row: the cursor walks a sixteen-click session.
//   PHASE 02  160 x 144 at 2x, the "phrase" screen. The sixteen standard recipes
//             under Space Elevator phase 2 in build order: part, machine, and the
//             output per minute as a command, R + two hex digits.
//   READOUT   240 x 72 at 2x. What the app shows for the row that is playing: the
//             phase's part list, the recipe card or the building card.
//
// The three grids cross-reference the way a tracker does. SHIFT says ITM 06; row 6
// of PHASE is MFR (Modular Frame), and the PHASE cursor jumps there; the READOUT
// shows the Modular Frame recipe. Every LCD has one unlit pixel column on its left
// edge (the glyph cells carry the other margins), so the glass is 161 px wide.
//
// Animation is CSS only and stepped (no easing, to keep the LCD feel). The loop is
// 48 s: sixteen song rows of 3 s, which really is the 20 rows a minute the tempo
// readout claims (2 s a row was too quick to read a recipe card). PHASE plays its
// sixteen rows in 8 s (120 a minute, as it says). Every period divides 48 s, so
// nothing jumps at the loop point.
// prefers-reduced-motion stops everything on row 00, which is a complete frame.
//
// Facts on screen, checked against the app's data on 2026-09-30:
//   140 items, 211 recipes, 88 alternates, 477 buildings, 5 phases, 3 tabs.
//   Phase 2 "Logistics & steel": Automated Wiring x500, Modular Frame x500,
//     Smart Plating x100, Versatile Framework x500.
//   Phase 3 "Oil & computers": Versatile Framework x2500, Modular Engine x500,
//     Adaptive Control Unit x100.
//   The sixteen recipes in RECIPES below (ingredients, amounts, per-minute rates,
//     cycle seconds, machine, MW) are get_item_recipe() output, standard recipes.
//   Buildings: Assembler tier 2, 15 MW, makes 39 items; Constructor tier 0, 4 MW,
//     24 items; Smelter tier 0, 4 MW, 4 items; Foundry tier 3, 16 MW, 4 items
//     (list_buildings() and get_building_produces()).
//   Machine numbers in the BLD channel are the nine production machines in
//     alphabetical order: 00 Assembler, 01 Blender, 02 Constructor, 03 Foundry,
//     04 Manufacturer, 05 Packager, 06 Particle Accelerator, 07 Refinery, 08 Smelter.
//   Phase 2 needs a seventeenth recipe, Automated Wiring (2.5 a minute). A phrase
//     has sixteen rows and 2.5 does not fit in two hex digits, so it is not shown.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '19-handheld-tracker_opus_5.5';
const OUT = path.resolve(HERE, `../assets/${SLUG}.svg`);

// ------------------------------------------------------------------ geometry
const W = 830, H = 648;                 // 1 unit = 1 CSS px in GitHub's 830 px README column
const CAP = 14;                         // caption strip above each LCD
const HERO = { x: 9, y: 22, s: 3, cols: 20, rows: 18 };     // 483 x 432
const SHIFT = { x: 499, y: 22, s: 2, cols: 20, rows: 18 };  // 322 x 288
const PHASE = { x: 499, y: 332, s: 2, cols: 20, rows: 18 }; // 322 x 288
const READ = { x: 9, y: 476, s: 2, cols: 30, rows: 9 };     // 482 x 144
const STEPS = 16, ROW_S = 3;            // song rows, seconds per row
const LOOP = STEPS * ROW_S;             // 48 s
const TEMPO = String(60 / ROW_S).padStart(3, '0');   // rows a minute: 020

// ------------------------------------------------------------------ palette
const LCD = { field: '#ffffff', cyan: '#d9fbfd', pink: '#f8c8fa', cur: '#f4788e', ink: '#000000' };
const PANEL = { bg: '#08090d', edge: '#262a36', rim: '#1b1e28', gold: '#e8d44d', grey: '#8d95aa', dim: '#5d6578',
  ultra: '#00cfff', obj: '#a855f7', itm: '#ec4899', bld: '#38bdf8' };

// ------------------------------------------------------------------ the faces
// Heavy face: 7 x 6 ink in an 8 x 8 cell, 2 px stems, 1 px bars, two pixels of leading. Upper
// case only, as the style demands. A seventh row is a descender. Drawn for this file.
const BOLD = {
  A: '..###..|.##.##.|##...##|#######|##...##|##...##',
  B: '######.|##...##|######.|##...##|##...##|######.',
  C: '.#####.|##...##|##.....|##.....|##...##|.#####.',
  D: '#####..|##..##.|##...##|##...##|##..##.|#####..',
  E: '#######|##.....|#####..|##.....|##.....|#######',
  F: '#######|##.....|#####..|##.....|##.....|##.....',
  G: '.#####.|##.....|##.####|##...##|##...##|.#####.',
  H: '##...##|##...##|#######|##...##|##...##|##...##',
  I: '.####..|..##...|..##...|..##...|..##...|.####..',
  J: '....###|.....##|.....##|##...##|##...##|.#####.',
  K: '##...##|##..##.|#####..|##.##..|##..##.|##...##',
  L: '##.....|##.....|##.....|##.....|##.....|#######',
  M: '##...##|###.###|#######|##.#.##|##...##|##...##',
  N: '##...##|###..##|####.##|##.####|##..###|##...##',
  O: '.#####.|##...##|##...##|##...##|##...##|.#####.',
  P: '######.|##...##|##...##|######.|##.....|##.....',
  Q: '.#####.|##...##|##...##|##.#.##|##..##.|.###.##',
  R: '######.|##...##|##...##|######.|##..##.|##...##',
  S: '.#####.|##...##|.###...|...###.|##...##|.#####.',
  T: '######.|..##...|..##...|..##...|..##...|..##...',
  U: '##...##|##...##|##...##|##...##|##...##|.#####.',
  V: '##...##|##...##|##...##|.##.##.|..###..|...#...',
  W: '##...##|##...##|##.#.##|#######|###.###|##...##',
  X: '##...##|.##.##.|..###..|..###..|.##.##.|##...##',
  Y: '##..##.|##..##.|.####..|..##...|..##...|..##...',
  Z: '#######|....##.|...##..|..##...|.##....|#######',
  0: '.#####.|##..###|##.#.##|###..##|##...##|.#####.',
  1: '..##...|.###...|..##...|..##...|..##...|######.',
  2: '.#####.|##...##|....##.|..###..|.##....|#######',
  3: '######.|.....##|..####.|.....##|##...##|.#####.',
  4: '...###.|..####.|.##.##.|##..##.|#######|....##.',
  5: '#######|##.....|######.|.....##|##...##|.#####.',
  6: '.#####.|##.....|######.|##...##|##...##|.#####.',
  7: '#######|.....##|....##.|...##..|..##...|..##...',
  8: '.#####.|##...##|.#####.|##...##|##...##|.#####.',
  9: '.#####.|##...##|##...##|.######|.....##|.#####.',
  '-': '.......|.......|.......|.#####.|.......|.......',
  '.': '.......|.......|.......|.......|..##...|..##...',
  ',': '.......|.......|.......|.......|..##...|..##...|.##....',
  ':': '.......|..##...|.......|.......|..##...|.......',
  '/': '.....##|....##.|...##..|..##...|.##....|##.....',
  "'": '..##...|..##...|.##....|.......|.......|.......',
  '&': '.###...|##.##..|.###.##|##.###.|##..##.|.###.##',
  '+': '.......|..##...|######.|..##...|.......|.......',
  '=': '.......|.#####.|.......|.#####.|.......|.......',
  '>': '.##....|..##...|...##..|...##..|..##...|.##....',
  '!': '..##...|..##...|..##...|..##...|.......|..##...',
  '?': '.#####.|##...##|....##.|...##..|.......|...##..',
  '(': '...##..|..##...|.##....|.##....|..##...|...##..',
  ')': '..##...|...##..|....##.|....##.|...##..|..##...',
  x: '.......|##..##.|.####..|..##...|.####..|##..##.',           // times
  '♪': '...####|...##.#|...##..|.####..|#####..|.###...',
  '▶': '.#.....|.###...|.#####.|.#####.|.###...|.#.....',          // play row
  '→': '.......|....##.|#######|#######|....##.|.......',
  '^': '.......|...#...|..###..|.#####.|#######|.......',          // up: the elevator wants this one
  '■': '.......|.####..|.####..|.####..|.####..|.......',
};
// Tiny face for column headers: 5 px tall, proportional. Most letters are 3 wide; M, V and W
// get 5 and N gets 4, because at 3 wide nobody can tell them apart (a 3-wide V is a U).
const TINY = {
  A: '.#.|#.#|###|#.#|#.#', B: '##.|#.#|##.|#.#|##.', C: '.##|#..|#..|#..|.##', D: '##.|#.#|#.#|#.#|##.',
  E: '###|#..|##.|#..|###', F: '###|#..|##.|#..|#..', G: '.##|#..|#.#|#.#|.##', H: '#.#|#.#|###|#.#|#.#',
  I: '###|.#.|.#.|.#.|###', J: '..#|..#|..#|#.#|.#.', K: '#.#|#.#|##.|#.#|#.#', L: '#..|#..|#..|#..|###',
  M: '#...#|##.##|#.#.#|#...#|#...#', N: '#..#|##.#|#.##|#..#|#..#', O: '.#.|#.#|#.#|#.#|.#.', P: '##.|#.#|##.|#..|#..',
  Q: '.#.|#.#|#.#|###|.##', R: '##.|#.#|##.|#.#|#.#', S: '.##|#..|.#.|..#|##.', T: '###|.#.|.#.|.#.|.#.',
  U: '#.#|#.#|#.#|#.#|###', V: '#...#|#...#|.#.#.|.#.#.|..#..', W: '#...#|#...#|#.#.#|#.#.#|.#.#.', X: '#.#|#.#|.#.|#.#|#.#',
  Y: '#.#|#.#|.#.|.#.|.#.', Z: '###|..#|.#.|#..|###',
  0: '###|#.#|#.#|#.#|###', 1: '.#.|##.|.#.|.#.|###', 2: '##.|..#|.#.|#..|###', 3: '##.|..#|.#.|..#|##.',
  4: '#.#|#.#|###|..#|..#', 5: '###|#..|##.|..#|##.', 6: '.##|#..|###|#.#|###', 7: '###|..#|.#.|.#.|.#.',
  8: '###|#.#|###|#.#|###', 9: '###|#.#|###|..#|##.',
  '.': '...|...|...|...|.#.', ',': '...|...|...|.#.|#..', ':': '...|.#.|...|.#.|...', '/': '..#|..#|.#.|#..|#..',
  '-': '...|...|###|...|...', "'": '.#.|.#.|...|...|...', '&': '.#.|#.#|.#.|#.#|.##', '>': '#..|.#.|..#|.#.|#..',
  '+': '...|.#.|###|.#.|...', '=': '...|###|...|###|...',
};
// Logo skeletons for SATISFACTORY, 5 x 7 (I is 3 wide); each skeleton pixel becomes a 2 x 2
// block, so the letters are condensed, 10 x 14. ULTRA is built from strokes further down.
const LOGO = {
  T: '#####|..#..|..#..|..#..|..#..|..#..|..#..', R: '####.|#...#|#...#|####.|#.#..|#..#.|#...#',
  A: '.###.|#...#|#...#|#####|#...#|#...#|#...#', S: '.####|#....|#....|.###.|....#|....#|####.',
  I: '###|.#.|.#.|.#.|.#.|.#.|###', F: '#####|#....|#....|####.|#....|#....|#....',
  C: '.####|#....|#....|#....|#....|#....|.####', O: '.###.|#...#|#...#|#...#|#...#|#...#|.###.',
  Y: '#...#|#...#|.#.#.|..#..|..#..|..#..|..#..',
};
const parse = (set, w) => Object.fromEntries(Object.entries(set).map(([ch, src]) => {
  const rows = src.split('|');
  if (rows.some((r) => r.length !== (w || rows[0].length))) throw new Error(`bad glyph ${ch}: ${src}`);
  return [ch, rows.map((r) => [...r].map((c) => (c === '#' ? 1 : 0)))];
}));
const FACES = { b: parse(BOLD, 7), t: parse(TINY, 0) };
const LOGOS = parse(LOGO, 0);
const TINY_SPACE = 3;                   // a word space in the tiny face, in pixels

// ------------------------------------------------------------------ helpers
const len = (s) => [...s].length;
const n2 = (n) => +n.toFixed(3);
const hex2 = (n) => n.toString(16).toUpperCase().padStart(2, '0');
const hex1 = (n) => n.toString(16).toUpperCase();
const R = (x, y, w, h, fill, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"${extra}/>`;
const RC = (x, y, w, h, cls) => `<rect class="${cls}" x="${x}" y="${y}" width="${w}" height="${h}"/>`;

// Bitmap (rows of 0/1) -> rectangles, runs merged across then down -> one path.
function bmRects(bm) {
  const rects = [];
  let open = [];
  bm.forEach((row, y) => {
    const next = [];
    for (let x = 0; x < row.length;) {
      if (!row[x]) { x++; continue; }
      const x0 = x;
      while (x < row.length && row[x]) x++;
      const o = open.find((r) => r[0] === x0 && r[2] === x - x0 && r[1] + r[3] === y);
      if (o) { o[3]++; next.push(o); } else { const r = [x0, y, x - x0, 1]; rects.push(r); next.push(r); }
    }
    open = next;
  });
  return rects;
}
const rectsD = (rs, ox = 0, oy = 0) => rs.map(([x, y, w, h]) => `M${x + ox} ${y + oy}h${w}v${h}h${-w}z`).join('');
const bmPath = (bm, cls, ox = 0, oy = 0) => `<path class="${cls}" d="${rectsD(bmRects(bm), ox, oy)}"/>`;

// Glyphs become <path id> in <defs>, one per face and character actually used.
const glyphIds = new Map();
function gid(face, ch) {
  if (!FACES[face][ch]) throw new Error(`no ${face} glyph for ${JSON.stringify(ch)}`);
  const key = face + ch;
  if (!glyphIds.has(key)) glyphIds.set(key, { id: `${face}${glyphIds.size.toString(36)}`, face, ch });
  return glyphIds.get(key).id;
}
// One line of text at pixel (x, y). The fill comes from `cls`, or is inherited when cls is ''.
function glyphs(face, str) {
  let out = '', x = 0;
  for (const ch of str) {
    if (ch !== ' ') out += `<use href="#${gid(face, ch)}"${x ? ` x="${x}"` : ''}/>`;
    x += face === 'b' ? 8 : (ch === ' ' ? TINY_SPACE : FACES.t[ch][0].length + 1);
  }
  return out;
}
// Width of a line in the tiny face, in pixels.
const tinyW = (str) => [...str].reduce((w, ch) => w + (ch === ' ' ? TINY_SPACE : FACES.t[ch][0].length + 1), 0) - 1;
const line = (face, x, y, str, cls = '') => `<g${cls ? ` class="${cls}"` : ''} transform="translate(${x} ${y})">${glyphs(face, str)}</g>`;
// Panel print: the heavy face at 1x in a flat colour.
const print = (x, y, str, fill) => `<g fill="${fill}" transform="translate(${x} ${y})">${glyphs('b', str)}</g>`;

// A logo line: skeleton letters blown up to sx x sy blocks, `gap` pixels apart.
function logoBitmap(str, sx, sy, gap) {
  const rows = Array.from({ length: 7 * sy }, () => []);
  let x0 = 0;
  for (const ch of str) {
    const g = LOGOS[ch];
    g.forEach((r, y) => r.forEach((v, x) => {
      for (let dy = 0; dy < sy; dy++) for (let dx = 0; dx < sx; dx++) rows[y * sy + dy][x0 + x * sx + dx] = v;
    }));
    x0 += g[0].length * sx + gap;
  }
  const width = x0 - gap;
  return rows.map((r) => Array.from({ length: width }, (_, x) => r[x] || 0));
}
// ULTRA: wide, heavy capitals, 25 x 21 each, 5 px stems and 3 px bars, corners stepped off
// three pixels deep. Built from boxes so the diagonals and corners can be tuned by the pixel.
function ultraBitmap(gap) {
  const LW = 25, LH = 21;
  const blank = () => Array.from({ length: LH }, () => new Array(LW).fill(0));
  const box = (bm, x0, y0, x1, y1, v = 1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) bm[y][x] = v; };
  // Step a corner off: `cx`, `cy` say which corner of the rectangle (0 = left/top, 1 = right/bottom).
  const chamfer = (bm, x0, y0, x1, y1, cx, cy, n = 3) => {
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const dx = cx ? x1 - x : x - x0, dy = cy ? y1 - y : y - y0;
      if (dx + dy < n) bm[y][x] = 0;
    }
  };
  const L = {};
  L.U = blank(); box(L.U, 0, 0, 4, 20); box(L.U, 20, 0, 24, 20); box(L.U, 0, 18, 24, 20);
  chamfer(L.U, 0, 0, 24, 20, 0, 1); chamfer(L.U, 0, 0, 24, 20, 1, 1); L.U[17][5] = 1; L.U[17][19] = 1;
  L.L = blank(); box(L.L, 0, 0, 4, 20); box(L.L, 0, 18, 24, 20); L.L[17][5] = 1;
  L.T = blank(); box(L.T, 0, 0, 24, 2); box(L.T, 10, 0, 14, 20);
  L.R = blank(); box(L.R, 0, 0, 4, 20); box(L.R, 0, 0, 24, 2); box(L.R, 0, 9, 24, 11); box(L.R, 20, 0, 24, 11);
  chamfer(L.R, 0, 0, 24, 11, 1, 0); chamfer(L.R, 0, 0, 24, 11, 1, 1); L.R[3][19] = 1; L.R[8][19] = 1;
  for (let y = 12; y <= 20; y++) box(L.R, 10 + (y - 12), y, 16 + (y - 12), y);
  L.A = blank(); box(L.A, 0, 0, 4, 20); box(L.A, 20, 0, 24, 20); box(L.A, 0, 0, 24, 2); box(L.A, 0, 10, 24, 12);
  chamfer(L.A, 0, 0, 24, 20, 0, 0); chamfer(L.A, 0, 0, 24, 20, 1, 0); L.A[3][5] = 1; L.A[3][19] = 1;
  const word = [...'ULTRA'];
  const width = word.length * LW + (word.length - 1) * gap;
  return Array.from({ length: LH }, (_, y) => Array.from({ length: width }, (_, x) => {
    const k = Math.floor(x / (LW + gap)), lx = x - k * (LW + gap);
    return lx < LW ? L[word[k]][y][lx] : 0;
  }));
}
// Grow a bitmap by one pixel in every direction (output is 2 wider and 2 taller).
function dilate(bm) {
  const h = bm.length, w = bm[0].length;
  return Array.from({ length: h + 2 }, (_, y) => Array.from({ length: w + 2 }, (_, x) => {
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const yy = y - 1 + dy, xx = x - 1 + dx;
      if (yy >= 0 && yy < h && xx >= 0 && xx < w && bm[yy][xx]) return 1;
    }
    return 0;
  }));
}

// ------------------------------------------------------------------ CSS
const css = [];
css.push(`.k{fill:${LCD.ink}}.w{fill:${LCD.field}}.c{fill:${LCD.cyan}}.p{fill:${LCD.pink}}.r{fill:${LCD.cur}}`);
const pc = (f) => `${n2(f * 100)}%`;
// Things that are shown on some steps of a loop and hidden on the others. `on` lists the
// steps (of n) when it shows. Identical schedules share one keyframe set.
const visCache = new Map();
function vis(on, n = STEPS, period = LOOP) {
  const key = `${n}/${period}/${on.join(',')}`;
  if (!visCache.has(key)) {
    const name = `v${visCache.size.toString(36)}`;
    const st = Array.from({ length: n }, (_, i) => on.includes(i));
    let kf = '';
    for (let i = 0; i < n; i++) if (i === 0 || st[i] !== st[i - 1]) kf += `${pc(i / n)}{opacity:${st[i] ? 1 : 0}}`;
    css.push(`@keyframes ${name}{${kf}}.${name}{opacity:${st[0] ? 1 : 0};animation:${name} ${period}s step-end infinite}`);
    visCache.set(key, name);
  }
  return visCache.get(key);
}
// Cursor blink, the play heads and the two-frame wave.
css.push('@keyframes bl{0%{opacity:1}75%{opacity:0}}.bl{animation:bl 1s step-end infinite}');
css.push('@keyframes pl{to{transform:translateY(128px)}}');
css.push(`.ps{animation:pl ${LOOP}s steps(16) infinite}.pf{animation:pl 8s steps(16) infinite}`);
css.push('@keyframes wa{0%{opacity:1}50%{opacity:0}}@keyframes wb{0%{opacity:0}50%{opacity:1}}');
css.push('.wa{animation:wa 1s step-end infinite}.wb{opacity:0;animation:wb 1s step-end infinite}');

// ------------------------------------------------------------------ an LCD
// Everything inside is in LCD pixels; (0, 0) is the first tile's corner, one pixel in
// from the glass edge. Layers: bands, ink, then sprites (cursors, play heads).
function lcd(geo) {
  const bands = [], ink = [], top = [];
  const w = geo.cols * 8, h = geo.rows * 8;
  const api = {
    w, h,
    band: (x, y, bw, bh, cls) => bands.push(RC(x, y, bw, bh, cls)),
    text(col, row, str, cls = '') {
      if (col < 0 || row < 0 || col + len(str) > geo.cols || row >= geo.rows) throw new Error(`off the LCD: ${str} at ${col},${row}`);
      ink.push(line('b', col * 8, row * 8, str, cls));
    },
    tiny(x, y, str, cls = '') {
      if (x < 0 || x + tinyW(str) > w) throw new Error(`tiny text off the LCD: ${str}`);
      ink.push(line('t', x, y, str, cls));
    },
    // Tiny text centred on x = cx.
    tinyC(cx, y, str) { api.tiny(Math.round(cx - tinyW(str) / 2), y, str); },
    ink: (svg) => ink.push(svg),
    top: (svg) => top.push(svg),
    // A solid cursor block with white text inside, covering `str` at tile (col, row).
    cursor(col, row, str, cls, blink = true) {
      const x = col * 8, y = row * 8;
      const block = `<g${blink ? ' class="bl"' : ''}>${RC(x - 1, y - 1, len(str) * 8 + 1, 8, 'r')}${line('b', x, y, str, 'w')}</g>`;
      top.push(cls ? `<g class="${cls}">${block}</g>` : block);
    },
    // Inverse video: an ink block with the letter in white, for the channel that is playing.
    inverse(x, y, ch, cls) {
      top.push(`<g class="${cls}">${RC(x - 1, y - 1, 9, 8, 'k')}${line('b', x, y, ch, 'w')}</g>`);
    },
    render() {
      const gw = (w + 1) * geo.s, gh = h * geo.s;
      return R(geo.x - 3, geo.y - 3, gw + 6, gh + 6, PANEL.rim, ' rx="3"')
        + R(geo.x - 1, geo.y - 1, gw + 2, gh + 2, '#000')
        + `<g transform="translate(${geo.x} ${geo.y}) scale(${geo.s})">`
        + RC(0, 0, w + 1, h, 'w')
        + `<g transform="translate(1 1)">${bands.join('')}`
        + `<use href="#ink${geo.s}${geo.y}" x="${n2(1 / geo.s)}" y="${n2(1 / geo.s)}" opacity=".13"/>`
        + `<g id="ink${geo.s}${geo.y}" class="k">${ink.join('')}</g>${top.join('')}</g></g>`
        // The glass: a faint pixel grid, and a shadow under the top and left bezel edges.
        + R(geo.x, geo.y, gw, gh, `url(#px${geo.s})`)
        + R(geo.x, geo.y, gw, 2, '#000', ' opacity=".12"') + R(geo.x, geo.y + 2, 2, gh - 2, '#000', ' opacity=".12"');
    },
  };
  return api;
}

// ------------------------------------------------------------------ shared furniture
// Steps of the shift on which channel c (0 OBJ, 1 ITM, 2 BLD, 3 NOI) is the one being played.
const playing = (c) => SONG.map((st, i) => (st.ch === c ? i : -1)).filter((i) => i >= 0);
// The screen map: a cross of single letters. Here it is the README's table of contents.
//        U                U you are here (the header)
//    W R H D L            W what's inside, R run it locally, H how it's built, D data & credits, L license
//        B                B the live build in your browser
const MAP = [
  { ch: 'U', dx: 2, dy: 0, on: [0, 1], label: 'YOU ARE HERE' },
  { ch: 'W', dx: 0, dy: 1, on: [2], label: "WHAT'S INSIDE" },
  { ch: 'R', dx: 1, dy: 1, on: [3], label: 'RUN IT LOCALLY' },
  { ch: 'H', dx: 2, dy: 1, on: [4], label: "HOW IT'S BUILT" },
  { ch: 'D', dx: 3, dy: 1, on: [5], label: 'DATA & CREDITS' },
  { ch: 'L', dx: 4, dy: 1, on: [6], label: 'LICENSE' },
  { ch: 'B', dx: 2, dy: 2, on: [7], label: 'LIVE IN A BROWSER' },
];
function drawMap(s, col, row) {
  for (const m of MAP) {
    s.text(col + m.dx, row + m.dy, m.ch);
    s.cursor(col + m.dx, row + m.dy, m.ch, vis(m.on, 8), false);
  }
}
// The little waveform in the status column: two frames of a pixel sine.
function wave(x, y) {
  const frame = (ph) => {
    const bm = Array.from({ length: 7 }, () => new Array(24).fill(0));
    for (let i = 0; i < 24; i++) {
      const v = Math.round(3 + 3 * Math.sin(((i + ph) / 12) * 2 * Math.PI));
      bm[v][i] = 1;
      if (i > 0) { // join the steps so the line never breaks
        const p = Math.round(3 + 3 * Math.sin(((i - 1 + ph) / 12) * 2 * Math.PI));
        for (let q = Math.min(p, v) + 1; q < Math.max(p, v); q++) bm[q][i] = 1;
      }
    }
    return rectsD(bmRects(bm), x, y);
  };
  return `<path class="wa" d="${frame(0)}"/><path class="wb" d="${frame(6)}"/>`;
}
// Status column for the two grid screens: tempo, the four mute letters, the wave, the map.
function statusColumn(s, tempo) {
  s.text(15, 2, `♪${tempo}`);
  ['O', 'I', 'B', 'N'].forEach((ch, i) => {
    s.text(15, 4 + i, ch);
    s.inverse(120, (4 + i) * 8, ch, vis(playing(i)));
  });
  ['BJ', 'TM', 'LD', 'OI'].forEach((rest, i) => s.tiny(130, (4 + i) * 8 + 1, rest));
  s.tiny(121, 74, 'WAVE');
  s.ink(wave(121, 80));
  s.tiny(121, 114, 'MAP');
  drawMap(s, 15, 15);
}

// ------------------------------------------------------------------ the data
// The sixteen rows of PHASE 02: every standard recipe under Space Elevator phase 2 except the
// last one (Automated Wiring), in build order. code, machine code, per minute, name, machine,
// cycle seconds, MW, ingredients [amount, name, per minute], amount out, wanted by the elevator.
const RECIPES = [
  ['IRN', 'SML', 30, 'IRON INGOT', 'SMELTER', 2, 4, [[1, 'IRON ORE', '30']], 1, 0],
  ['PLT', 'CON', 20, 'IRON PLATE', 'CONSTRUCTOR', 6, 4, [[3, 'IRON INGOT', '30']], 2, 0],
  ['ROD', 'CON', 15, 'IRON ROD', 'CONSTRUCTOR', 4, 4, [[1, 'IRON INGOT', '15']], 1, 0],
  ['SCR', 'CON', 40, 'SCREW', 'CONSTRUCTOR', 6, 4, [[1, 'IRON ROD', '10']], 4, 0],
  ['RIP', 'ASM', 5, 'REINFORCED IRON PLATE', 'ASSEMBLER', 12, 15, [[6, 'IRON PLATE', '30'], [12, 'SCREW', '60']], 1, 0],
  ['ROT', 'ASM', 4, 'ROTOR', 'ASSEMBLER', 15, 15, [[5, 'IRON ROD', '20'], [25, 'SCREW', '100']], 1, 0],
  ['MFR', 'ASM', 2, 'MODULAR FRAME', 'ASSEMBLER', 60, 15, [[3, 'REINFORCED IRON PLATE', '3'], [12, 'IRON ROD', '12']], 2, 1],
  ['SMP', 'ASM', 2, 'SMART PLATING', 'ASSEMBLER', 30, 15, [[1, 'REINFORCED IRON PLATE', '2'], [1, 'ROTOR', '2']], 1, 1],
  ['STL', 'FDY', 45, 'STEEL INGOT', 'FOUNDRY', 4, 16, [[3, 'IRON ORE', '45'], [3, 'COAL', '45']], 3, 0],
  ['BEM', 'CON', 15, 'STEEL BEAM', 'CONSTRUCTOR', 4, 4, [[4, 'STEEL INGOT', '60']], 1, 0],
  ['VFW', 'ASM', 5, 'VERSATILE FRAMEWORK', 'ASSEMBLER', 24, 15, [[1, 'MODULAR FRAME', '2.5'], [12, 'STEEL BEAM', '30']], 2, 1],
  ['PIP', 'CON', 20, 'STEEL PIPE', 'CONSTRUCTOR', 6, 4, [[3, 'STEEL INGOT', '30']], 2, 0],
  ['COP', 'SML', 30, 'COPPER INGOT', 'SMELTER', 2, 4, [[1, 'COPPER ORE', '30']], 1, 0],
  ['WIR', 'CON', 30, 'WIRE', 'CONSTRUCTOR', 4, 4, [[1, 'COPPER INGOT', '15']], 2, 0],
  ['CBL', 'CON', 30, 'CABLE', 'CONSTRUCTOR', 2, 4, [[2, 'WIRE', '60']], 1, 0],
  ['STA', 'ASM', 5, 'STATOR', 'ASSEMBLER', 12, 15, [[3, 'STEEL PIPE', '15'], [8, 'WIRE', '40']], 1, 0],
];
const rowOf = (code) => RECIPES.findIndex((r) => r[0] === code);
// Production machines, numbered alphabetically as the BLD channel counts them.
const MACHINES = {
  ASSEMBLER: { n: 0, tier: 2, mw: 15, makes: 39 }, CONSTRUCTOR: { n: 2, tier: 0, mw: 4, makes: 24 },
  FOUNDRY: { n: 3, tier: 3, mw: 16, makes: 4 }, SMELTER: { n: 8, tier: 0, mw: 4, makes: 4 },
};
const PHASES = {
  2: { name: 'LOGISTICS & STEEL', parts: [['AUTOMATED WIRING', 500], ['MODULAR FRAME', 500], ['SMART PLATING', 100], ['VERSATILE FRAMEWORK', 500]] },
  3: { name: 'OIL & COMPUTERS', parts: [['VERSATILE FRAMEWORK', 2500], ['MODULAR ENGINE', 500], ['ADAPTIVE CONTROL UNIT', 100]] },
};

// The shift: sixteen lookups, one per song row. Every step after a tab change is one click away
// from the card before it: `pick` is the thing on this card that gets clicked next.
//   ch: which channel plays (0 OBJ, 1 ITM, 2 BLD, 3 NOI alone)   v: the value in that cell
const SONG = [
  { ch: 0, v: 2, pick: 'MODULAR FRAME', say: 'CLICK A PART. ANY PART.' },
  { ch: 1, code: 'MFR', pick: 'ASSEMBLER' },
  { ch: 2, m: 'ASSEMBLER', item: 'MFR', pick: 'REINFORCED IRON PLATE', say: 'TWO INPUTS. ONE IS ALWAYS LATE' },
  { ch: 1, code: 'RIP', pick: 'SCREW' },
  { ch: 1, code: 'SCR', pick: 'CONSTRUCTOR', say: 'THE BOXES ARE FULL OF THESE.' },
  { ch: 2, m: 'CONSTRUCTOR', item: 'SCR', pick: 'IRON ROD', say: 'ONE IN, ONE OUT, NO DRAMA.' },
  { ch: 1, code: 'ROD', pick: 'IRON INGOT' },
  { ch: 1, code: 'IRN', pick: 'SMELTER', say: 'THE BOTTOM. HELLO, IRON ORE.' },
  { ch: 2, m: 'SMELTER', item: 'IRN', say: 'ORE IN. INGOT OUT. NO NOTES.' },
  { ch: 0, v: 2, pick: 'VERSATILE FRAMEWORK', say: 'RIGHT. WHERE WERE WE.' },
  { ch: 1, code: 'VFW', pick: 'STEEL BEAM' },
  { ch: 1, code: 'BEM', pick: 'STEEL INGOT' },
  { ch: 1, code: 'STL', pick: 'FOUNDRY' },
  { ch: 2, m: 'FOUNDRY', item: 'STL', say: '16 MW. CHECK THE FUSE FIRST.' },
  { ch: 3, rest: true },
  { ch: 0, v: 3, say: 'x2500. BACK TO ROW 00.' },
];
if (SONG.length !== STEPS) throw new Error('the shift is sixteen rows');
const CH = ['OBJ', 'ITM', 'BLD', 'NOI'];
const TABS = ['OBJECTIVES', 'ITEMS', 'BUILDINGS', 'THE GAME'];
SONG.forEach((st) => {
  if (st.ch === 1) st.v = rowOf(st.code);
  if (st.ch === 2) st.v = MACHINES[st.m].n;
  if (st.ch === 3) st.v = 0;
  if (st.v < 0) throw new Error(`no row for ${st.code}`);
});

// ------------------------------------------------------------------ PROJECT (the big one)
const hero = lcd(HERO);
{
  const s = hero;
  s.text(0, 0, 'PROJECT');
  s.text(17, 0, 'FAN');
  s.tinyC(80, 9, 'COMPANION APP FOR THE GAME SATISFACTORY');
  // The name, as a title card on a pale band.
  s.band(-1, 15, 161, 42, 'c');
  // ULTRA: cursor pink with a black keyline and a one-pixel drop shadow. 137 x 21.
  const u = ultraBitmap(3);
  const line2 = logoBitmap('SATISFACTORY', 2, 2, 2);
  const lx = Math.round((160 - line2[0].length) / 2);
  const du = dilate(u);
  const shadow = Array.from({ length: du.length + 1 }, (_, y) => Array.from({ length: du[0].length + 1 }, (_, x) => (
    (du[y] && du[y][x]) || (y > 0 && x > 0 && du[y - 1][x - 1]) ? 1 : 0)));
  s.ink(bmPath(shadow, 'k', lx - 1, 16) + bmPath(u, 'r', lx, 17));
  // A one-pixel shine just inside the top edge of every stroke.
  const shine = u.map((r, y) => r.map((v, x) => (v && y >= 1 && u[y - 1][x] && (y < 2 || !u[y - 2][x]) ? 1 : 0)));
  s.ink(bmPath(shine, 'p', lx, 17));
  // SATISFACTORY: solid ink. 138 x 14.
  s.ink(bmPath(line2, 'k', lx, 41));
  s.tinyC(80, 59, 'EVERY RECIPE, BUILDING AND OBJECTIVE,');
  s.ink(line('b', 20, 65, 'ONE CLICK APART'));
  // The counts. Decimal here; the grids on the right count in hex.
  s.band(-1, 72, 161, 1, 'k');
  s.tiny(0, 74, 'IN THE BOX');
  s.tiny(112 - tinyW('DEC'), 74, 'DEC');
  const rows = [['ITEMS', '140'], ['RECIPES', '211'], ['ALTERNATES', '88'], ['BUILDINGS', '477'], ['PHASES', '5'], ['TABS', '3'], ['OFFICIAL', 'NO']];
  s.band(79, 79, 34, 56, 'c');
  rows.forEach(([k, v], i) => {
    s.text(0, 10 + i, k);
    s.text(14 - len(v), 10 + i, v);
  });
  s.cursor(12, 16, 'NO', '');
  // One tiny line under the counts names whichever map letter is lit.
  s.tiny(0, 137, 'README');
  for (const m of MAP) s.top(`<g class="${vis(m.on, 8)}">${line('t', tinyW('README') + 5, 137, `${m.ch}: ${m.label}`, 'k')}</g>`);
  // Status column: tempo, channels, map.
  s.tiny(121, 74, 'TEMPO');
  s.text(15, 10, `♪${TEMPO}`);
  s.tiny(121, 90, 'CHANNELS');
  [['O', 'BJ'], ['I', 'TM'], ['B', 'LD'], ['N', 'OI']].forEach(([ch, rest], i) => {
    const x = 120 + (i % 2) * 20, y = (12 + Math.floor(i / 2)) * 8;
    s.ink(line('b', x, y, ch));
    s.inverse(x, y, ch, vis(playing(i)));
    s.tiny(x + 10, y + 1, rest);
  });
  s.tiny(121, 114, 'MAP');
  drawMap(s, 15, 15);
}

// ------------------------------------------------------------------ SHIFT 00 (the song screen)
const shift = lcd(SHIFT);
{
  const s = shift;
  s.text(0, 0, 'SHIFT 00');
  // Top right: the channel the cursor is on.
  CH.forEach((name, c) => s.top(`<g class="${vis(playing(c))}">${line('b', 17 * 8, 0, name, 'k')}</g>`));
  s.band(-1, 15, 17, 128, 'p');
  s.band(44, 15, 24, 128, 'c');
  s.band(92, 15, 24, 128, 'c');
  CH.forEach((name, c) => s.tinyC((3 + 3 * c) * 8 + 7.5, 9, name));
  SONG.forEach((st, i) => {
    s.text(0, 2 + i, hex2(i));
    for (let c = 0; c < 4; c++) {
      const v = c === 3 ? '00' : (st.ch === c ? hex2(st.v) : '--');
      s.text(3 + 3 * c, 2 + i, v);
      if (st.ch === c) s.cursor(3 + 3 * c, 2 + i, v, vis([i]));
    }
  });
  s.top(`<g class="ps">${line('b', 16, 16, '▶', 'k')}</g>`);
  statusColumn(s, TEMPO);
}

// ------------------------------------------------------------------ PHASE 02 (the phrase screen)
const phase = lcd(PHASE);
{
  const s = phase;
  s.text(0, 0, 'PHASE 02');
  s.text(17, 0, 'ITM');
  s.band(-1, 15, 9, 128, 'p');
  s.band(44, 15, 32, 128, 'c');
  s.tinyC(27.5, 9, 'PART'); s.tinyC(59.5, 9, 'MACH'); s.tinyC(91.5, 9, '/MIN');
  RECIPES.forEach(([code, mach, rate, , , , , , , wanted], i) => {
    s.text(0, 2 + i, hex1(i));
    s.text(2, 2 + i, code);
    s.text(6, 2 + i, mach);
    s.text(10, 2 + i, `R${hex2(rate)}`);
    if (wanted) s.text(13, 2 + i, '^');
  });
  s.top(`<g class="pf">${line('b', 8, 16, '▶', 'k')}</g>`);
  // The cursor follows the shift: the phase number for OBJ rows, the part for ITM rows,
  // the machine of that part for BLD rows.
  const spots = new Map();
  SONG.forEach((st, i) => {
    let spot = null;
    if (st.ch === 0 && st.v === 2) spot = [6, 0, '02', true];
    if (st.ch === 0 && st.v === 3) spot = [6, 0, '03', false];
    if (st.ch === 1) spot = [2, 2 + st.v, st.code, true];
    if (st.ch === 2) spot = [6, 2 + rowOf(st.item), RECIPES[rowOf(st.item)][1], true];
    if (!spot) return;
    const key = spot.join(',');
    if (!spots.has(key)) spots.set(key, { spot, on: [] });
    spots.get(key).on.push(i);
  });
  for (const { spot: [col, row, str, blink], on } of spots.values()) s.cursor(col, row, str, vis(on), blink);
  statusColumn(s, '120');
}

// ------------------------------------------------------------------ READOUT (what the app shows)
const read = lcd(READ);
{
  const s = read;
  s.band(-1, -1, 17, 8, 'p');
  s.band(16, -1, 225, 8, 'c');
  const right = (row, str) => line('b', (30 - len(str)) * 8, row * 8, str);
  const put = (col, row, str) => {
    if (col + len(str) > 30) throw new Error(`readout line too long: ${str}`);
    return line('b', col * 8, row * 8, str);
  };
  SONG.forEach((st, i) => {
    const o = [];       // ink
    const cur = [];     // the cursor block on the thing that gets clicked next
    const pick = (col, row, str) => cur.push(`<g class="bl">${RC(col * 8 - 1, row * 8 - 1, len(str) * 8 + 1, 8, 'r')}${line('b', col * 8, row * 8, str, 'w')}</g>`);
    const named = (col, row, str) => { o.push(put(col, row, str)); if (st.pick === str) pick(col, row, str); };
    o.push(put(0, 0, hex2(i)));
    o.push(put(3, 0, st.rest ? '-- -- --' : `${CH[st.ch]} ${hex2(st.v)}`));
    o.push(right(0, TABS[st.ch]));
    if (st.ch === 0) {
      const ph = PHASES[st.v];
      o.push(put(0, 1, `PHASE ${st.v}: ${ph.name}`));
      ph.parts.forEach(([name, qty], k) => {
        named(0, 3 + k, name);
        o.push(right(3 + k, `x${qty}`));
      });
    } else if (st.ch === 1) {
      const [, , rate, name, mach, secs, mw, ins, out] = RECIPES[st.v];
      o.push(put(0, 1, name));
      ins.forEach(([amt, ing, perMin], k) => {
        o.push(put(0, 3 + k, String(amt).padStart(2)));
        named(3, 3 + k, ing);
        o.push(right(3 + k, `${perMin}/MIN`));
      });
      const y = 3 + ins.length;
      o.push(put(0, y, `→ ${out} EVERY ${secs} S`));
      o.push(right(y, `${rate}/MIN`));
      named(0, 6, mach);
      o.push(right(6, `${mw} MW`));
    } else if (st.ch === 2) {
      const m = MACHINES[st.m];
      o.push(put(0, 1, st.m));
      o.push(put(0, 3, `PRODUCTION  TIER ${m.tier}  ${m.mw} MW`));
      if (st.pick) { o.push(put(0, 4, `MAKES ${m.makes} ITEMS. ONE OF THEM:`)); named(0, 5, st.pick); } else o.push(put(0, 4, `MAKES ${m.makes} ITEMS.`));
    } else {
      o.push(put(0, 1, 'ALT + TAB'));
      o.push(put(0, 3, 'YOU PLACE ONE FOUNDRY.'));
      o.push(put(0, 4, 'THE FUSE BLOWS.'));
      o.push(put(0, 5, 'EVERYTHING STOPS EXCEPT NOI.'));
      o.push(put(0, 8, 'ALT + TAB. WHAT WAS IT AGAIN?'));
    }
    if (st.say) o.push(put(0, 8, st.say));
    s.top(`<g class="${vis([i])}"><g class="k">${o.join('')}</g>${cur.join('')}</g>`);
  });
}

// ------------------------------------------------------------------ panel print
const panel = [];
const cap = (geo, key, rest) => {
  const y = geo.y - CAP + 2;
  panel.push(print(geo.x, y, key, PANEL.gold) + print(geo.x + (len(key) + 1) * 8, y, rest, PANEL.grey));
};
cap(HERO, 'PROJECT', 'WHAT IT IS, IN 160 x 144 PIXELS');
cap(SHIFT, 'SHIFT', `ONE CLICK PER ROW, ${60 / ROW_S} A MINUTE`);
cap(PHASE, 'PHASE', 'THE CHAIN. R.. = PER MINUTE, HEX');
cap(READ, 'READOUT', 'WHAT THE APP SHOWS FOR THE ROW THAT IS PLAYING');
{
  const y = 631;
  panel.push(print(9, y, 'UNOFFICIAL FAN PROJECT, NOT AFFILIATED WITH COFFEE STAIN STUDIOS', PANEL.dim));
  let x = W - 9;
  for (const [name, col] of [['BUILDINGS', PANEL.bld], ['ITEMS', PANEL.itm], ['OBJECTIVES', PANEL.obj]]) {
    x -= len(name) * 8;
    panel.push(print(x, y, name, col));
    x -= 12;
    panel.push(print(x, y, '■', col));
    x -= 12;
  }
}

// ------------------------------------------------------------------ assemble
css.push('@media (prefers-reduced-motion:reduce){*{animation:none!important}}');
const screens = [hero, shift, phase, read].map((s) => s.render()).join('\n');
const glyphDefs = [...glyphIds.values()].map(({ id, face, ch }) => `<path id="${id}" d="${rectsD(bmRects(FACES[face][ch]))}"/>`).join('');
// LCD pixel grid: a hairline on two edges of every pixel, one pattern per scale.
const grids = [2, 3].map((k) => `<pattern id="px${k}" width="${k}" height="${k}" patternUnits="userSpaceOnUse"><path d="M0 0h${k}v.5h${-k}zM0 .5h.5v${k - 0.5}h-.5z" fill="#1a2a3a" opacity=".1"/></pattern>`).join('');

const TITLE = 'ULTRA-SATISFACTORY: a handheld tracker, four LCD screens';
const DESC = 'Four pastel LCD screens on a dark panel, drawn in chunky 8 by 8 pixel letters. '
  + 'The big PROJECT screen shows the name ULTRA SATISFACTORY as two tile logos, the line COMPANION APP FOR THE GAME SATISFACTORY, '
  + 'the pitch EVERY RECIPE, BUILDING AND OBJECTIVE, ONE CLICK APART, and the counts: items 140, recipes 211, alternates 88, buildings 477, phases 5, tabs 3, official NO. '
  + 'The SHIFT 00 screen is a tracker song grid with four channels, OBJ, ITM, BLD and NOI; a cursor steps down it one lookup per row. '
  + 'The PHASE 02 screen lists sixteen recipes as three-letter codes with their machine and output per minute in hex, and its cursor jumps to whatever the shift is looking up. '
  + 'The READOUT screen spells each lookup out: Space Elevator phase 2 wants Automated Wiring x500, Modular Frame x500, Smart Plating x100 and Versatile Framework x500; '
  + 'Modular Frame is 3 Reinforced Iron Plate and 12 Iron Rod in an Assembler, 2 every 60 seconds at 15 MW; and so on down to Iron Ore, then phase 3 asks for Versatile Framework x2500. '
  + 'A small cross of letters in each corner is a map of the README sections. Small print: unofficial fan project, not affiliated with Coffee Stain Studios.';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="t d">
<title id="t">${TITLE}</title>
<desc id="d">${DESC}</desc>
<style>${css.join('\n')}</style>
<defs>${glyphDefs}${grids}</defs>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="10" fill="${PANEL.bg}" stroke="${PANEL.edge}"/>
${panel.join('\n')}
${screens}
</svg>
`;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, svg);
console.log(`wrote ${path.relative(process.cwd(), OUT)} (${(svg.length / 1024).toFixed(1)} KB, ${glyphIds.size} glyphs)`);
