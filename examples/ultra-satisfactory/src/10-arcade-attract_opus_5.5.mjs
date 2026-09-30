#!/usr/bin/env node
// Arcade Attract Mode: README header generator for ULTRA-SATISFACTORY.
//
//   node examples/ultra-satisfactory/src/10-arcade-attract_opus_5.5.mjs
//
// Writes examples/ultra-satisfactory/assets/10-arcade-attract_opus_5.5.svg.
// Plain Node, no dependencies, no randomness, no clock: the same bytes every run.
//
// The picture is the front of an imaginary coin-op cabinet by the (invented)
// Throughput Amusement Co.: a lit marquee, a portrait raster monitor (224 x 256
// pixels: 28 x 32 cells of 8 x 8, every pixel 2 x 2 units), two bezel
// instruction cards and a control panel (joystick, three buttons, a coin slot
// taped over with FREE). The monitor runs a 20 second attract
// loop with hard cuts:
//
//    0.0 s  TITLE   the logo, the pitch and an "output per minute" legend
//    6.0 s  DEMO    a little factory running in real time, belts to scale
//   13.0 s  SCORES  the Space Elevator's five phases as a high-score table
//
// Nothing is <text>: every letter is a <use> of a glyph path from the 8 x 8
// face defined below. The face is original: a thin 6 x 7 skeleton drawn here
// by hand, emboldened by smearing each pixel one step right (2 px stems, 1 px
// bars), and for the logos run once or twice through the EPX pixel-scaling
// rule so the corners round off. Animation is CSS only, stepped, and every
// period divides the 20 s loop, so it repeats without a jump;
// prefers-reduced-motion freezes it on the complete title card. There is no
// crispEdges hint: at GitHub's 830 px column every edge already sits on a
// whole pixel, and on narrower screens anti-aliasing keeps the 8 x 8 text
// readable where snapping would drop strokes.
//
// Facts on screen, checked against the app's data on 2026-09-30:
//   140 items, 211 recipes (88 alternates), 477 buildings, 5 phases.
//   Per-minute legend: Screw 40, Iron Ingot 30, Iron Plate 20, Iron Rod 15, Rotor 4.
//   Demo line: 1 Smelter (30 Iron Ore -> 30 Iron Ingot a minute, 2 s cycle)
//     -> 2 Constructors (15 ingots -> 15 Iron Rod each, 4 s)
//     -> 3 Constructors (10 rods -> 40 Screw each, 6 s) = 120 screws a minute.
//     Every belt runs at one speed, so the gap between items is the rate to
//     scale, and it is real time: one ingot every 2 s, two screws a second.
//   Score table: parts each Space Elevator phase asks for, added up:
//     Phase 3 2500+500+100 = 3100, Phase 4 1000+500+100+25 = 1625,
//     Phase 2 500+500+100+500 = 1600, Phase 5 500+100+100+100 = 800,
//     Phase 1 50+100+500 = 650. The three-letter names are made up.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '10-arcade-attract_opus_5.5';
const OUT = path.resolve(HERE, `../assets/${SLUG}.svg`);

// ------------------------------------------------------------------ geometry
const W = 830, H = 730;                       // viewBox: 1 unit = 1 CSS px in GitHub's 830 px README column
const MQ = { x: 15, y: 12, w: 800, h: 80 };   // marquee
const ROW_Y = 104;                            // top of the bezel row
const COLS = 28, ROWS = 32, PX = 2;           // raster: 224 x 256 pixels, each 2 x 2 units
const SW = COLS * 8 * PX, SH = ROWS * 8 * PX; // 448 x 512
const BZ = { x: 177, y: ROW_Y, w: SW + 28, h: SH + 24 };
const SX = BZ.x + 14, SY = BZ.y + 12;
const CARD_L = { x: 15, y: ROW_Y, w: 150, h: BZ.h };
const CARD_R = { x: 665, y: ROW_Y, w: 150, h: BZ.h };
const CP = { x: 15, y: ROW_Y + BZ.h + 10, w: 800, h: 68 };
const LOOP = 20;                              // seconds
const CUT = { demo: 6, table: 13 };           // scene starts

// ------------------------------------------------------------------ palette
const COL = {
  w: '#ffffff', r: '#ff3b3b', y: '#ffe23d', g: '#3dff7a', c: '#00cfff', m: '#ff4fb8',
  o: '#ff9a2e', p: '#b56bff', b: '#4db8ff', d: '#a3a9bf', k: '#05060a', gold: '#e8d44d',
  cream: '#f1e9cf',
};
const TAB = { obj: '#a855f7', itm: '#ec4899', bld: '#38bdf8' };

// ------------------------------------------------------------------ the face
// Thin skeleton, 6 wide. Rows top to bottom; an 8th row is the descender.
const THIN = {
  A: '..##..|.#..#.|#....#|#....#|######|#....#|#....#', B: '#####.|#....#|#....#|#####.|#....#|#....#|#####.',
  C: '.####.|#....#|#.....|#.....|#.....|#....#|.####.', D: '####..|#...#.|#....#|#....#|#....#|#...#.|####..',
  E: '######|#.....|#.....|#####.|#.....|#.....|######', F: '######|#.....|#.....|#####.|#.....|#.....|#.....',
  G: '.####.|#....#|#.....|#..###|#....#|#....#|.####.', H: '#....#|#....#|#....#|######|#....#|#....#|#....#',
  I: '#####.|..#...|..#...|..#...|..#...|..#...|#####.', J: '.....#|.....#|.....#|.....#|#....#|#....#|.####.',
  K: '#....#|#...#.|#..#..|###...|#..#..|#...#.|#....#', L: '#.....|#.....|#.....|#.....|#.....|#.....|######',
  M: '#....#|##..##|#.##.#|#....#|#....#|#....#|#....#', N: '#....#|##...#|#.#..#|#..#.#|#...##|#....#|#....#',
  O: '.####.|#....#|#....#|#....#|#....#|#....#|.####.', P: '#####.|#....#|#....#|#####.|#.....|#.....|#.....',
  Q: '.####.|#....#|#....#|#....#|#.#..#|#..#..|.##.#.', R: '#####.|#....#|#....#|#####.|#..#..|#...#.|#....#',
  S: '.####.|#....#|#.....|.####.|.....#|#....#|.####.', T: '#####.|..#...|..#...|..#...|..#...|..#...|..#...',
  U: '#....#|#....#|#....#|#....#|#....#|#....#|.####.', V: '#....#|#....#|#....#|#....#|.#..#.|.#..#.|..##..',
  W: '#....#|#....#|#....#|#....#|#.##.#|##..##|#....#', X: '#....#|#....#|.#..#.|..##..|.#..#.|#....#|#....#',
  Y: '#...#.|#...#.|#...#.|.#.#..|..#...|..#...|..#...', Z: '######|....#.|...#..|..#...|.#....|#.....|######',
  0: '.###..|#...#.|#...#.|#...#.|#...#.|#...#.|.###..', 1: '..#...|.##...|..#...|..#...|..#...|..#...|.###..',
  2: '.####.|#....#|.....#|...##.|.##...|#.....|######', 3: '.####.|#....#|.....#|..###.|.....#|#....#|.####.',
  4: '...##.|..#.#.|.#..#.|#...#.|######|....#.|....#.', 5: '######|#.....|#####.|.....#|.....#|#....#|.####.',
  6: '.####.|#.....|#.....|#####.|#....#|#....#|.####.', 7: '######|.....#|....#.|...#..|..#...|..#...|..#...',
  8: '.####.|#....#|#....#|.####.|#....#|#....#|.####.', 9: '.####.|#....#|#....#|.#####|.....#|.....#|.####.',
  a: '......|......|.####.|.....#|.#####|#....#|.#####', b: '#.....|#.....|#####.|#....#|#....#|#....#|#####.',
  c: '......|......|.####.|#.....|#.....|#.....|.####.', d: '.....#|.....#|.#####|#....#|#....#|#....#|.#####',
  e: '......|......|.####.|#....#|######|#.....|.####.', f: '..###.|.#....|####..|.#....|.#....|.#....|.#....',
  g: '......|......|.#####|#....#|#....#|.#####|.....#|.####.', h: '#.....|#.....|#.###.|##...#|#....#|#....#|#....#',
  i: '..#...|......|.##...|..#...|..#...|..#...|.###..', j: '....#.|......|...##.|....#.|....#.|....#.|#...#.|.###..',
  k: '#.....|#.....|#...#.|#..#..|###...|#..#..|#...#.', l: '.##...|..#...|..#...|..#...|..#...|..#...|.###..',
  m: '......|......|#####.|#.#.#.|#.#.#.|#.#.#.|#.#.#.', n: '......|......|#.###.|##...#|#....#|#....#|#....#',
  o: '......|......|.####.|#....#|#....#|#....#|.####.', p: '......|......|#####.|#....#|#....#|#####.|#.....|#.....',
  q: '......|......|.#####|#....#|#....#|.#####|.....#|.....#', r: '......|......|#.###.|##....|#.....|#.....|#.....',
  s: '......|......|.#####|#.....|.####.|.....#|#####.', t: '.#....|.#....|####..|.#....|.#....|.#....|..###.',
  u: '......|......|#....#|#....#|#....#|#....#|.#####', v: '......|......|#....#|#....#|.#..#.|.#..#.|..##..',
  w: '......|......|#....#|#....#|#.##.#|##..##|#....#', x: '......|......|#....#|.#..#.|..##..|.#..#.|#....#',
  y: '......|......|#....#|#....#|#....#|.#####|.....#|.####.', z: '......|......|######|....#.|..##..|.#....|######',
  '.': '......|......|......|......|......|..#...|..#...', ',': '......|......|......|......|......|..#...|..#...|.#....',
  ':': '......|..#...|..#...|......|..#...|..#...|......', "'": '..#...|..#...|.#....|......|......|......|......',
  '-': '......|......|......|.####.|......|......|......', '/': '....#.|....#.|...#..|...#..|..#...|..#...|.#....',
  '&': '.##...|#..#..|#..#..|.##...|#..#.#|#...#.|.###.#', '(': '...#..|..#...|.#....|.#....|.#....|..#...|...#..',
  ')': '..#...|...#..|....#.|....#.|....#.|...#..|..#...', '!': '..#...|..#...|..#...|..#...|..#...|......|..#...',
  '?': '.####.|#....#|.....#|...##.|..#...|......|..#...', '+': '......|..#...|..#...|#####.|..#...|..#...|......',
  '=': '......|......|.####.|......|.####.|......|......', '>': '#.....|.#....|..#...|...#..|..#...|.#....|#.....',
  '·': '......|......|......|..#...|..#...|......|......',
};
// Where the smear closes a counter, the bold form is drawn by hand (7 wide).
const BOLD_BY_HAND = {
  m: '.......|.......|######.|##.#.##|##.#.##|##.#.##|##.#.##',
};
const FACES = { t: {}, b: {} };
for (const [ch, src] of Object.entries(THIN)) {
  const rows = src.split('|');
  if (rows.length < 7 || rows.length > 8 || rows.some((r) => r.length !== 6)) throw new Error(`bad thin glyph ${ch}`);
  FACES.t[ch] = rows.map((r) => [...r].map((c) => (c === '#' ? 1 : 0)));
  FACES.b[ch] = FACES.t[ch].map((r) => Array.from({ length: 7 }, (_, x) => (r[x] || r[x - 1] ? 1 : 0)));
}
for (const [ch, src] of Object.entries(BOLD_BY_HAND)) {
  const rows = src.split('|');
  if (rows.some((r) => r.length !== 7)) throw new Error(`bad bold glyph ${ch}`);
  FACES.b[ch] = rows.map((r) => [...r].map((c) => (c === '#' ? 1 : 0)));
}

// ------------------------------------------------------------------ helpers
const len = (s) => [...s].length;
const n2 = (n) => +n.toFixed(2);
const pct = (sec) => `${n2((sec / LOOP) * 100)}%`;
const rect = (x, y, w, h, fill, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"${extra}/>`;

// Bitmap (rows of 0/1) -> list of [x, y, w, h] rectangles, runs merged across then down.
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

// EPX / Scale2x: doubles a bitmap and rounds the stair-steps. Pure pixels in, pure pixels out.
function epx(bm) {
  const h = bm.length, w = bm[0].length;
  const at = (x, y) => (y < 0 || y >= h || x < 0 || x >= w ? 0 : bm[y][x]);
  const out = Array.from({ length: h * 2 }, () => new Array(w * 2).fill(0));
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const P = at(x, y), A = at(x, y - 1), B = at(x + 1, y), C = at(x - 1, y), D = at(x, y + 1);
    out[2 * y][2 * x] = C === A && C !== D && A !== B ? A : P;
    out[2 * y][2 * x + 1] = A === B && A !== C && B !== D ? B : P;
    out[2 * y + 1][2 * x] = D === C && D !== B && C !== A ? C : P;
    out[2 * y + 1][2 * x + 1] = B === D && B !== A && D !== C ? D : P;
  }
  return out;
}

// Glyphs become <path id> in <defs>, one per face and character actually used.
const glyphIds = new Map();
function gid(face, ch) {
  if (!FACES[face][ch]) throw new Error(`no glyph for ${JSON.stringify(ch)}`);
  const key = face + ch;
  if (!glyphIds.has(key)) glyphIds.set(key, { id: `${face}${glyphIds.size.toString(36)}`, face, ch });
  return glyphIds.get(key).id;
}
function uses(str, face = 'b', x0 = 0, y0 = 0) {
  let out = '';
  [...str].forEach((ch, i) => {
    if (ch === ' ') return;
    const x = x0 + i * 8;
    out += `<use href="#${gid(face, ch)}"${x ? ` x="${x}"` : ''}${y0 ? ` y="${y0}"` : ''}/>`;
  });
  return out;
}
// One run of text at (x, y), one colour class. `s` scales the 8 x 8 cell.
function txt(x, y, str, cls, { face = 'b', s = 1 } = {}) {
  return `<g class="${cls}" transform="translate(${x} ${y})${s === 1 ? '' : ` scale(${s})`}">${uses(str, face)}</g>`;
}
// Screen text: cell coordinates inside the raster group (1 unit there = 1 pixel).
function st(col, row, str, cls) {
  if (col < 0 || col + len(str) > COLS || row < 0 || row >= ROWS) throw new Error(`off screen: ${str} at ${col},${row}`);
  return txt(n2(col * 8), row * 8, str, cls);
}
const ctr = (row, str, cls) => st((COLS - len(str)) / 2, row, str, cls);
// The same, but at a pixel y (for lines that want more leading than the 8 px grid gives).
const sp = (x, y, str, cls) => txt(x, y, str, cls);
const cpx = (y, str, cls) => sp((COLS - len(str)) * 4, y, str, cls);

// Logo lettering: the bold face through EPX `levels` times, set proportionally (each letter
// trimmed to its ink, `gap` pixels apart), as one bitmap.
function logoCells(str, levels, gap) {
  const bm = Array.from({ length: 7 * 2 ** levels }, () => []);
  let x0 = 0;
  for (const ch of str) {
    let g = FACES.b[ch].slice(0, 7);
    const ink = Math.max(...g.map((r) => r.lastIndexOf(1))) + 1;
    g = g.map((r) => r.slice(0, ink));
    for (let k = 0; k < levels; k++) g = epx(g);
    g.forEach((row, y) => row.forEach((v, x) => { bm[y][x0 + x] = v; }));
    x0 += g[0].length + gap;
  }
  const width = x0 - gap;
  return { bm: bm.map((r) => Array.from({ length: width }, (_, x) => r[x] || 0)), width, height: bm.length };
}

// Sprites: tiny pictures from a character map and a palette.
function sprite(map, pal) {
  const rows = map.split('|');
  let out = '';
  for (const [k, fill] of Object.entries(pal)) {
    const bm = rows.map((r) => [...r].map((c) => (c === k ? 1 : 0)));
    const d = rectsD(bmRects(bm));
    if (d) out += `<path fill="${fill}" d="${d}"/>`;
  }
  return { svg: out, w: rows[0].length, h: rows.length };
}

// ------------------------------------------------------------------ sprites (all home-made)
const SPR = {
  ore: sprite('.aa.a.|aaaaaa|aAaaAa|.aaaa.', { a: '#d9653a', A: '#ffc0a0' }),
  ingot: sprite('.AAAAA.|AAAAAAA|aaaaaaa', { A: '#ffb45a', a: '#d9601a' }),
  rod: sprite('AAAAAAA|aaaaaaa', { A: '#f4f7ff', a: '#8e98ad' }),
  screw: sprite('A....|AAAAA|A....', { A: '#c9f4ff' }),
  plate: sprite('AAAAAAA|AaAAAaA|AAAAAAA|aaaaaaa', { A: '#d5dbe8', a: '#7c869c' }),
  rotor: sprite('.AAAAA.|A..A..A|A..A..A|AAAoAAA|A..A..A|A..A..A|.AAAAA.', { A: '#ffe23d', o: '#ff9a2e' }),
};
// The app's emblem, redrawn at 16 x 16: a hexagon with a cog inside. It goes on the crate.
SPR.emblem = sprite([
  '......hhhh......', '....hh....hh....', '..hh........hh..', 'hh............hh',
  'h.....c..c.....h', 'h....cccccc....h', 'h...cccccccc...h', 'h....cc..cc....h',
  'h....cc..cc....h', 'h...cccccccc...h', 'h....cccccc....h', 'h.....c..c.....h',
  'hh............hh', '..hh........hh..', '....hh....hh....', '......hhhh......',
].join('|'), { h: '#e8d44d', c: '#00cfff' });
// The player: a small person in a hard hat, pacing the factory floor in the demo.
const WALKER = '..HHHH..|.HHHHHH.|.HCCCCH.|.HCCCCH.|..OOOO..|OOOOOOOO|O.OOOO.O|O.OOOO.O|..OOOO..';
const WALK_PAL = { H: '#e8d44d', C: '#00cfff', O: '#ff7a1f', B: '#c9ced9' };
SPR.walkA = sprite(`${WALKER}|..O..O..|.BB..O..|.....BB.`, WALK_PAL);
SPR.walkB = sprite(`${WALKER}|..O..O..|..O..BB.|.BB.....`, WALK_PAL);
const sprDefs = Object.entries(SPR).map(([k, s]) => `<g id="s_${k}">${s.svg}</g>`).join('');
const spr = (k, x, y) => `<use href="#s_${k}" x="${x}" y="${y}"/>`;

// The same emblem computed at any size (used for the seal on the operator card).
function emblem(n) {
  const bm = Array.from({ length: n }, () => new Array(n).fill(0));
  const cog = Array.from({ length: n }, () => new Array(n).fill(0));
  const c = (n - 1) / 2, R = n / 2;
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const dx = x - c, dy = y - c;
    const hex = (r) => Math.abs(dx) <= r * 0.866 && Math.abs(dy) + Math.abs(dx) / 1.732 <= r;
    if (hex(R) && !hex(R - Math.max(1.2, n / 12))) bm[y][x] = 1;
    const rr = Math.hypot(dx, dy), th = Math.atan2(dy, dx);
    const tooth = Math.cos(th * 6) > 0.1 ? R * 0.52 : R * 0.4;
    if (rr <= tooth && rr >= R * 0.17) cog[y][x] = 1;
  }
  return { hex: rectsD(bmRects(bm)), cog: rectsD(bmRects(cog)) };
}

// ------------------------------------------------------------------ CSS
const css = [];
for (const k of ['w', 'r', 'y', 'g', 'c', 'm', 'o', 'p', 'b', 'd', 'k']) css.push(`.${k}{fill:${COL[k]}}`);
css.push(`.gd{fill:${COL.gold}}.cr{fill:${COL.cream}}.t1{fill:${TAB.obj}}.t2{fill:${TAB.itm}}.t3{fill:${TAB.bld}}`);
const anim = (name, dur, extra = '') => `animation:${name} ${dur}s step-end infinite${extra}`;
// Hard cuts between the three scenes.
css.push(`@keyframes sa{0%{opacity:1}${pct(CUT.demo)}{opacity:0}}`);
css.push(`@keyframes sb{0%{opacity:0}${pct(CUT.demo)}{opacity:1}${pct(CUT.table)}{opacity:0}}`);
css.push(`@keyframes sc{0%{opacity:0}${pct(CUT.table)}{opacity:1}}`);
css.push(`.sa{${anim('sa', LOOP)}}.sb{opacity:0;${anim('sb', LOOP)}}.sc{opacity:0;${anim('sc', LOOP)}}`);
// The coin prompt: one flash a second.
css.push(`@keyframes bl{0%{opacity:1}60%{opacity:0}}.bl{${anim('bl', 1)}}.bl2{${anim('bl', 2)}}`);
// Rows that arrive one by one: hidden until `at` seconds into the loop, then on until it wraps.
function reveal(cls, at) {
  css.push(`@keyframes ${cls}{0%{opacity:0}${pct(at)}{opacity:1}}.${cls}{${anim(cls, LOOP)}}`);
}

// ------------------------------------------------------------------ the raster: always-on rows
const screen = [];     // pixel-space content (inside translate + scale(2))
// Three fields, as a cabinet has them: left, centre, right. Values sit under their labels.
screen.push(sp(8, 7, 'ITEMS', 'r') + sp(72, 7, 'RECIPES', 'r') + sp(144, 7, 'BUILDINGS', 'r'));
screen.push(sp(8, 17, '000140', 'w') + sp(76, 17, '000211', 'w') + sp(168, 17, '000477', 'w'));
screen.push(`<g class="bl">${cpx(213, 'INSERT NOTHING', 'y')}</g>`);
screen.push(cpx(227, "FREE PLAY: IT'S APACHE 2.0", 'g'));
screen.push(sp(8, 240, '1 OR 2 MONITORS', 'c') + sp(144, 240, 'CREDIT 00', 'w'));

// ------------------------------------------------------------------ scene A: title card
const defs = [];
const sceneA = [];
{
  sceneA.push(ctr(4, 'THROUGHPUT AMUSEMENT CO.', 'o'));
  // ULTRA: 28 px tall, cyan, two-tone, on an extrusion that steps through the palette.
  const u = logoCells('ULTRA', 2, 4);
  defs.push(`<path id="lu" d="${rectsD(bmRects(u.bm))}"/>`);
  const ux = Math.round((224 - u.width) / 2) - 2, uy = 46;
  const uTop = u.bm.map((r, y) => (y < 12 ? r : r.map(() => 0)));
  sceneA.push(`<g transform="translate(${ux} ${uy})"><g class="ex">`
    + [4, 3, 2, 1].map((k) => `<use href="#lu" x="${k}" y="${k}"/>`).join('')
    + `</g><use href="#lu" class="c"/><path fill="#a9f0ff" d="${rectsD(bmRects(uTop))}"/></g>`);
  // SATISFACTORY: 14 px tall, white over the next colour along.
  const s = logoCells('SATISFACTORY', 1, 2);
  defs.push(`<path id="ls" d="${rectsD(bmRects(s.bm))}"/>`);
  const sx = Math.round((224 - s.width) / 2) - 1, sy = 85;
  const sBot = s.bm.map((r, y) => (y >= 8 ? r : r.map(() => 0)));
  sceneA.push(`<g transform="translate(${sx} ${sy})"><g class="ex2">`
    + [2, 1].map((k) => `<use href="#ls" x="${k}" y="${k}"/>`).join('')
    + `</g><use href="#ls" class="w"/><path fill="#c3cbe0" d="${rectsD(bmRects(sBot))}"/></g>`);
  const CYC = ['#1d4ed8', '#c026d3', '#e11d48', '#ea580c', '#16a34a'];
  css.push(`@keyframes ex{${CYC.map((c, i) => `${i * 20}%{fill:${c}}`).join('')}}.ex{fill:${CYC[0]};${anim('ex', 2.5)}}`);
  css.push(`@keyframes ex2{${CYC.map((c, i) => `${i * 20}%{fill:${CYC[(i + 1) % 5]}}`).join('')}}.ex2{fill:${CYC[1]};${anim('ex2', 2.5)}}`);

  sceneA.push(cpx(110, 'EVERY RECIPE, BUILDING AND', 'c'));
  sceneA.push(cpx(121, 'OBJECTIVE, ONE CLICK APART', 'c'));
  sceneA.push(cpx(137, '- OUTPUT PER MINUTE -', 'g'));
  // The points table, except the points are real recipe rates (standard recipes).
  const LEGEND = [
    ['screw', '40/MIN', 'SCREW', 'w'],
    ['ingot', '30/MIN', 'IRON INGOT', 'o'],
    ['plate', '20/MIN', 'IRON PLATE', 'b'],
    ['rod', '15/MIN', 'IRON ROD', 'w'],
    ['rotor', ' 4/MIN', 'ROTOR', 'y'],
    [null, '??/MIN', '88 ALTERNATES', 'm'],
  ];
  LEGEND.forEach(([k, rate, name, cls], i) => {
    const y = 150 + i * 10;
    const pic = k ? spr(k, 20 + Math.floor((8 - SPR[k].w) / 2), y + Math.floor((7 - SPR[k].h) / 2)) : sp(20, y, '?', cls);
    reveal(`lg${i}`, 0.5 + i * 0.3);
    sceneA.push(`<g class="lg${i}">${pic}${sp(36, y, '=', cls)}${sp(52, y, rate, cls)}${sp(112, y, name, cls)}</g>`);
  });
}

// ------------------------------------------------------------------ scene B: the demo shift
const sceneB = [];
{
  let clipN = 0;
  const BED = '#14161d', RAIL = '#596074', TICK = '#2c303c';
  // Item streams: everything moves 16 px a second, one pixel per step.
  css.push('@keyframes mr{to{transform:translate(32px,0)}}@keyframes ml{to{transform:translate(-32px,0)}}@keyframes md{to{transform:translate(0,32px)}}');
  css.push('@keyframes m8{to{transform:translate(8px,0)}}@keyframes n8{to{transform:translate(-8px,0)}}@keyframes d8{to{transform:translate(0,8px)}}');
  css.push('.mr{animation:mr 2s steps(32) infinite}.ml{animation:ml 2s steps(32) infinite}.md{animation:md 2s steps(32) infinite}');
  css.push('.m8{animation:m8 .5s steps(8) infinite}.n8{animation:n8 .5s steps(8) infinite}.d8{animation:d8 .5s steps(8) infinite}');
  // A straight belt from cell (c0,r0) to (c1,r1) inclusive, moving `dir` (R, L or D), carrying
  // `item` every `gap` pixels, the first one `off` pixels in.
  function belt(c0, r0, c1, r1, dir, item, gap, off = 0) {
    const x = c0 * 8, y = r0 * 8, w = (c1 - c0 + 1) * 8, h = (r1 - r0 + 1) * 8;
    const id = `q${clipN++}`;
    defs.push(`<clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath>`);
    const horiz = dir !== 'D';
    let o = horiz
      ? rect(x, y + 1, w, 6, BED) + rect(x, y, w, 1, RAIL) + rect(x, y + 7, w, 1, RAIL)
      : rect(x + 1, y, 6, h, BED) + rect(x, y, 1, h, RAIL) + rect(x + 7, y, 1, h, RAIL);
    let ticks = '';
    const nT = (horiz ? w : h) / 8;
    for (let k = -1; k <= nT; k++) ticks += horiz ? rect(x + k * 8 + 3, y + 2, 1, 4, TICK) : rect(x + 2, y + k * 8 + 3, 4, 1, TICK);
    let items = '';
    const s = SPR[item];
    const n = Math.ceil((horiz ? w : h) / gap) + 1;
    for (let k = -1; k <= n; k++) {
      const p = k * gap + off;
      items += horiz
        ? spr(item, x + (dir === 'R' ? p : w - p - s.w), y + Math.floor((8 - s.h) / 2))
        : spr(item, x + Math.floor((8 - s.w) / 2), y + p);
    }
    const tc = { R: 'm8', L: 'n8', D: 'd8' }[dir];
    const ic = gap === 8 ? tc : { R: 'mr', L: 'ml', D: 'md' }[dir];
    o += `<g clip-path="url(#${id})"><g class="${tc}">${ticks}</g><g class="${ic}">${items}</g></g>`;
    return o;
  }
  const elbow = (c, r) => rect(c * 8, r * 8, 8, 8, RAIL) + rect(c * 8 + 1, r * 8 + 1, 6, 6, '#232733') + rect(c * 8 + 3, r * 8 + 3, 2, 2, COL.gold);

  css.push('@keyframes fl{0%{opacity:0}50%{opacity:1}}.fl{animation:fl .5s step-end infinite}');
  css.push('@keyframes pr{0%{transform:translate(0,0)}50%{transform:translate(0,4px)}}.pr{animation:pr 1s step-end infinite}.pr2{animation:pr 1s step-end -.5s infinite}');
  const hazard = (y, w) => rect(1, y, w - 2, 2, '#16130a') + Array.from({ length: (w - 4) / 4 }, (_, i) => rect(3 + i * 4, y, 2, 2, COL.y)).join('');
  // Machines are 32 x 24 px; the belt runs through the middle row.
  const smelter = (c, r) => `<g transform="translate(${c * 8} ${r * 8})">`
    + rect(3, 0, 6, 6, COL.o) + rect(4, 1, 4, 5, '#2b1404')
    + rect(0, 4, 32, 20, COL.o) + rect(1, 5, 30, 18, '#2b1404')
    + rect(4, 8, 16, 11, COL.o) + rect(5, 9, 14, 9, COL.y)
    + `<rect class="fl" x="5" y="9" width="14" height="9" fill="#ff5a1f"/>` + rect(8, 12, 8, 3, '#fff6b0')
    + [11, 14, 17].map((y) => rect(23, y, 6, 1, COL.o)).join('')
    + rect(23, 7, 2, 2, COL.y)
    + hazard(21, 32) + '</g>';
  const constructor = (c, r, alt) => `<g transform="translate(${c * 8} ${r * 8})">`
    + rect(10, 0, 12, 4, COL.c) + rect(11, 1, 10, 3, '#04222d')
    + rect(0, 3, 32, 21, COL.c) + rect(1, 4, 30, 19, '#04222d')
    + rect(5, 6, 22, 13, COL.c) + rect(6, 7, 20, 11, '#000')
    + rect(15, 7, 2, 2, COL.d)
    + `<g class="${alt ? 'pr2' : 'pr'}">${rect(15, 7, 2, 2, COL.d)}${rect(11, 9, 10, 3, COL.w)}${rect(14, 12, 4, 1, COL.w)}</g>`
    + rect(9, 17, 14, 1, COL.d)
    + `<rect class="bl" x="28" y="5" width="2" height="2" fill="${COL.g}"/>` + rect(2, 5, 2, 2, COL.c)
    + hazard(21, 32) + '</g>';

  sceneB.push(`<g class="bl2">${ctr(4, '- DEMO SHIFT -', 'r')}</g>`);
  // Band 1: ore in from the left edge, one Smelter, ingots out to the right.
  sceneB.push(belt(0, 7, 2, 7, 'R', 'ore', 32, 4));
  sceneB.push(belt(7, 7, 25, 7, 'R', 'ingot', 32, 10));
  sceneB.push(belt(26, 8, 26, 11, 'D', 'ingot', 32, 14));
  sceneB.push(elbow(26, 7) + elbow(26, 12));
  sceneB.push(smelter(3, 6));
  sceneB.push(sp(64, 46, 'IRON INGOT 30/MIN', 'o') + sp(8, 74, 'SMELTER', 'y'));
  // Band 2: two Constructors (drawn as one, tagged X2), rods out to the left.
  sceneB.push(belt(25, 12, 25, 12, 'L', 'ingot', 32, 30));
  sceneB.push(belt(2, 12, 20, 12, 'L', 'rod', 32, 6));
  sceneB.push(belt(1, 13, 1, 16, 'D', 'rod', 32, 20));
  sceneB.push(elbow(1, 12) + elbow(1, 17));
  sceneB.push(constructor(21, 11, false));
  sceneB.push(sp(40, 86, 'IRON ROD 30/MIN', 'w') + sp(88, 114, 'CONSTRUCTOR X2', 'y'));
  // Band 3: three Constructors (X3), screws out to the crate, four times as dense.
  sceneB.push(belt(2, 17, 2, 17, 'R', 'rod', 32, 2));
  sceneB.push(belt(7, 17, 21, 17, 'R', 'screw', 8, 1));
  sceneB.push(constructor(3, 16, true));
  sceneB.push(sp(64, 126, 'SCREW 120/MIN', 'c') + sp(24, 154, 'CONSTRUCTOR X3', 'y'));
  // The pioneer paces the aisle under the ingot belt: out and back, one pixel a step.
  // (steps() applies to each keyframe interval, so 104 px in 104 steps each way.)
  const A0 = pct(CUT.demo), A1 = pct((CUT.demo + CUT.table) / 2), A2 = pct(CUT.table);
  css.push(`@keyframes wk{0%,${A0}{transform:translate(0,0)}${A1}{transform:translate(104px,0)}${A2},100%{transform:translate(0,0)}}`);
  css.push('.wk{animation:wk 20s steps(104) infinite}');
  css.push('@keyframes wf{0%{opacity:1}50%{opacity:0}}.wa{animation:wf .5s step-end infinite}.wb{animation:wf .5s step-end -.25s infinite}');
  sceneB.push(`<g class="wk"><g class="wa">${spr('walkA', 84, 72)}</g><g class="wb">${spr('walkB', 84, 72)}</g></g>`);
  // The crate, with the emblem stencilled on it.
  sceneB.push(`<g transform="translate(176 128)">${rect(0, 1, 32, 23, COL.gold)}${rect(1, 2, 30, 21, '#1b1704')}`
    + rect(0, 9, 2, 6, '#000') + spr('emblem', 8, 4) + '</g>');
  // The counter: two screws a second, as the belt delivers them.
  css.push(`@keyframes kf{0%{opacity:1}2.5%{opacity:0}}`);
  let frames = '';
  for (let i = 0; i < 14; i++) {
    css.push(`.k${i}{opacity:0;${anim('kf', LOOP, `;animation-delay:${n2(CUT.demo + i * 0.5 - LOOP)}s`)}}`);
    frames += `<g class="k${i}">${uses(String(i).padStart(2, '0'), 'b', 23 * 8, 170)}</g>`;
  }
  sceneB.push(sp(24, 170, 'SCREWS SHIPPED', 'w') + sp(152, 170, '0000', 'y') + `<g class="y">${frames}</g>`);
  sceneB.push(cpx(186, 'BELTS TO SCALE, REAL TIME.', 'g'));
  sceneB.push(cpx(198, 'YOU WILL NEED MORE SCREWS.', 'm'));
}

// ------------------------------------------------------------------ scene C: the score table
const sceneC = [];
{
  sceneC.push(cpx(32, 'SPACE ELEVATOR ORDERS', 'y'));
  sceneC.push(cpx(43, 'PARTS WANTED, PER PHASE', 'w'));
  sceneC.push(sp(8, 60, 'RANK', 'r') + sp(56, 60, 'SCORE', 'r') + sp(112, 60, 'NAME', 'r') + sp(160, 60, 'STAGE', 'r'));
  const TABLE = [
    ['1ST', 3100, 'BLT', 3, 'OIL & COMPUTERS', 'y'],
    ['2ND', 1625, 'SPG', 4, 'NUCLEAR & ENDGAME', 'o'],
    ['3RD', 1600, '3AM', 2, 'LOGISTICS & STEEL', 'g'],
    ['4TH', 800, 'ALT', 5, 'ALIEN TECH & QUANTUM', 'c'],
    ['5TH', 650, 'TAB', 1, 'AUTOMATION BASICS', 'm'],
  ];
  css.push(`@keyframes hi{0%{fill:${COL.y}}25%{fill:${COL.w}}50%{fill:${COL.y}}75%{fill:${COL.r}}}.hi{fill:${COL.y};${anim('hi', 2)}}`);
  TABLE.forEach(([rank, score, name, phase, title, c0], i) => {
    const y = 74 + i * 25, cls = i === 0 ? 'hi' : c0;
    reveal(`tr${i}`, CUT.table + 0.6 + i * 0.7);
    sceneC.push(`<g class="tr${i}">${sp(8, y, rank, cls)}${sp(56, y, String(score).padStart(6, '0'), cls)}`
      + `${sp(112, y, name, cls)}${sp(160, y, `PHASE ${phase}`, cls)}${sp(56, y + 10, title, 'd')}</g>`);
  });
  reveal('trz', CUT.table + 4.4);
  sceneC.push(`<g class="trz">${cpx(198, 'THE ELEVATOR ALWAYS WINS', 'w')}</g>`);
}

// ------------------------------------------------------------------ marquee
const marquee = [];
{
  const PXM = 3, WORD_GAP = 26;         // 14 px letters at 3 units a pixel
  const scaled = (bm) => rectsD(bmRects(bm).map(([x, y, w, h]) => [x * PXM, y * PXM, w * PXM, h * PXM]));
  const topOf = (bm) => bm.map((r, y) => (y < 6 ? r : r.map(() => 0)));
  const U = logoCells('ULTRA', 1, 1), S = logoCells('SATISFACTORY', 1, 1);
  const wU = U.width * PXM, wS = S.width * PXM;
  const x0 = MQ.x + Math.round((MQ.w - (wU + WORD_GAP + wS)) / 2) - 2, y0 = MQ.y + 11;
  defs.push(`<path id="mu" d="${scaled(U.bm)}"/><path id="ms" d="${scaled(S.bm)}"/>`);
  defs.push(`<linearGradient id="mqg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b2257"/><stop offset=".55" stop-color="#0d1030"/><stop offset="1" stop-color="#1a0b33"/></linearGradient>`);
  defs.push(`<radialGradient id="mqh" cx=".5" cy=".45" r=".6"><stop offset="0" stop-color="#3a7bff" stop-opacity=".5"/><stop offset="1" stop-color="#3a7bff" stop-opacity="0"/></radialGradient>`);
  defs.push(`<filter id="glow" x="-5%" y="-60%" width="110%" height="220%"><feGaussianBlur stdDeviation="6"/></filter>`);
  marquee.push(rect(MQ.x, MQ.y, MQ.w, MQ.h, 'url(#mqg)', ' rx="5"'));
  marquee.push(`<rect class="mf" x="${MQ.x}" y="${MQ.y}" width="${MQ.w}" height="${MQ.h}" rx="5" fill="url(#mqh)"/>`);
  // Speed lines in the three tab colours, behind the lettering.
  [[TAB.obj, 0], [TAB.itm, 9], [TAB.bld, 18]].forEach(([c, dy]) => {
    marquee.push(rect(MQ.x + 6, y0 + 8 + dy, MQ.w - 12, 5, c, ' opacity=".55"'));
  });
  const words = [
    { id: 'mu', bm: U.bm, x: x0, face: COL.c, top: '#b6f3ff', shade: ['#0b2a8f', '#1746d1'], halo: '#00a2ff' },
    { id: 'ms', bm: S.bm, x: x0 + wU + WORD_GAP, face: '#e9edf7', top: '#ffffff', shade: ['#6b1bb5', '#d02f8f'], halo: '#ff4fb8' },
  ];
  // The backlight: one blurred copy of the lettering (static, so it is rendered once).
  marquee.push(`<g class="mf" filter="url(#glow)" opacity=".85">${words.map((w) => `<use href="#${w.id}" x="${w.x}" y="${y0}" fill="${w.halo}"/>`).join('')}</g>`);
  for (const w of words) {
    let ex = '';
    for (let k = 6; k >= 1; k--) ex += `<use href="#${w.id}" x="${k}" y="${k}" fill="${k > 3 ? w.shade[0] : w.shade[1]}"/>`;
    marquee.push(`<g transform="translate(${w.x} ${y0})">${ex}<use href="#${w.id}" fill="${w.face}"/><path fill="${w.top}" d="${scaled(topOf(w.bm))}"/></g>`);
  }
  const sy = MQ.y + MQ.h - 14;
  marquee.push(txt(MQ.x + 14, sy, 'THROUGHPUT AMUSEMENT CO. PRESENTS', 'gd'));
  const tag = 'A COMPANION APP FOR SATISFACTORY · UNOFFICIAL FAN PROJECT';
  marquee.push(txt(MQ.x + MQ.w - 14 - len(tag) * 8 + 1, sy, tag, 'cr'));
  marquee.push(`<rect x="${MQ.x + 1}" y="${MQ.y + 1}" width="${MQ.w - 2}" height="${MQ.h - 2}" rx="4" fill="none" stroke="${COL.gold}" stroke-width="2"/>`);
  // A fluorescent tube that is nearly, but not quite, fine.
  css.push(`@keyframes mf{0%{opacity:1}41%{opacity:.55}41.6%{opacity:1}43%{opacity:.7}43.4%{opacity:1}88%{opacity:.6}88.5%{opacity:1}}.mf{${anim('mf', LOOP)}}`);
}

// ------------------------------------------------------------------ bezel cards
function card(box, title, blocks) {
  let o = rect(box.x, box.y, box.w, box.h, '#0c1124', ` rx="4" stroke="#2a3360"`);
  o += rect(box.x + 4, box.y + 5, box.w - 8, 16, COL.gold, ' rx="2"');
  o += txt(box.x + Math.round((box.w - len(title) * 8 + 1) / 2), box.y + 9, title, 'k');
  const LEAD = 14, TOP = 32, BOTTOM = 10;
  const used = blocks.reduce((n, b) => n + (b.gap ? 0 : b.draw ? b.h : LEAD), 0);
  const gaps = blocks.filter((b) => b.gap).length;
  const gap = Math.floor((box.h - TOP - BOTTOM - used) / gaps);
  if (gap < 6) throw new Error(`card "${title}" overflows (gap ${gap})`);
  let y = box.y + TOP;
  for (const b of blocks) {
    if (b.gap) { y += Math.min(gap, 22); continue; }
    if (b.draw) { o += b.draw(box.x, y); y += b.h; continue; }
    o += txt(box.x + 8 + (b.indent || 0), y, b.t, b.cls || 'cr');
    y += LEAD;
  }
  return o;
}
const L = (t, cls, indent = 0) => ({ t, cls, indent });
// A printed arcade button for the instruction card.
const button = (x, y, fill) => `<circle cx="${x + 8}" cy="${y + 4}" r="8" fill="#05060a"/><circle cx="${x + 8}" cy="${y + 4}" r="6.5" fill="${fill}"/>`
  + `<circle cx="${x + 6}" cy="${y + 2}" r="2" fill="#fff" opacity=".55"/>`;
const tabHead = (name, cls, fill) => ({ h: 18, draw: (x, y) => button(x + 8, y - 2, fill) + txt(x + 30, y - 2, name, cls) });
const cardL = card(CARD_L, 'HOW TO PLAY', [
  tabHead('OBJECTIVES', 't1', TAB.obj),
  L('PICK A SPACE'), L('ELEVATOR PHASE.'), L('SEE THE PARTS IT'), L('WANTS, AND HOW'), L('MANY.'),
  { gap: 1 },
  tabHead('ITEMS', 't2', TAB.itm),
  L('SEARCH AS YOU'), L('TYPE. RECIPE'), L('CARDS SHOW RATES'), L('PER MINUTE, THE'), L('MACHINE, CYCLE'), L('TIME AND POWER.'),
  { gap: 1 },
  tabHead('BUILDINGS', 't3', TAB.bld),
  L('EVERY BUILDING'), L('AND WHAT IT'), L('MAKES, BY TIER.'), L('MK BY MK UPGRADE'), L('PATHS.'),
  { gap: 1 },
  L('COMBO', 'gd'),
  L('EVERYTHING LINKS.'), L('CLICK A PART FOR'), L('ITS RECIPE, THE'), L('MACHINE FOR ITS'), L('BUILDING.'),
  { gap: 1 },
  L('CONTROLS', 'gd'),
  L('ALT + TAB.'), L("THAT'S THE WHOLE"), L('CONTROL SCHEME.'),
]);
// A bank of DIP switches: eight, set to spell nothing in particular.
const dips = {
  h: 34,
  draw: (x, y) => {
    let o = rect(x + 12, y, 126, 26, '#b3261e', ' rx="2"') + rect(x + 14, y + 2, 122, 22, '#d63a2f', ' rx="1"');
    [1, 0, 0, 1, 1, 0, 1, 0].forEach((on, i) => {
      const sx = x + 19 + i * 15;
      o += rect(sx, y + 5, 8, 16, '#3a0d0a') + rect(sx + 1, y + (on ? 6 : 13), 6, 7, '#fff7e6');
    });
    return o;
  },
};
// The emblem as an inspection seal.
const seal = {
  h: 36,
  draw: (x, y) => {
    const e = emblem(36);
    return `<g transform="translate(${x + 57} ${y})"><path fill="${COL.gold}" d="${e.hex}"/><path fill="${COL.c}" d="${e.cog}"/></g>`;
  },
};
const cardR = card(CARD_R, 'OPERATOR SETTINGS', [
  dips,
  L('COINAGE', 'gd'), L('FREE PLAY', 'cr', 8),
  L('LICENCE', 'gd'), L('APACHE 2.0', 'cr', 8),
  L('PLAYERS', 'gd'), L('1, AND A SPARE', 'cr', 8), L('MONITOR', 'cr', 8),
  L('DIFFICULTY', 'gd'), L('SPAGHETTI', 'cr', 8),
  L('SLEEP', 'gd'), L('DISABLED', 'cr', 8),
  L('CONTINUE?', 'gd'), L('ALWAYS', 'cr', 8),
  { gap: 1 },
  L('ON THE FLOOR', 'gd'),
  L('140 ITEMS', 'cr', 8), L('211 RECIPES', 'cr', 8), L(' 88 ALTERNATES', 'cr', 8), L('477 BUILDINGS', 'cr', 8),
  L('  9 MACHINES', 'cr', 8), L('  5 PHASES', 'cr', 8),
  { gap: 1 },
  L('SMALL PRINT', 'gd'),
  L('UNOFFICIAL FAN'), L('PROJECT. NOT'), L('AFFILIATED WITH'), L('COFFEE STAIN'), L('STUDIOS.'),
  { gap: 1 },
  seal,
]);

// ------------------------------------------------------------------ monitor
const monitor = [];
{
  defs.push(`<clipPath id="tube"><rect x="${SX}" y="${SY}" width="${SW}" height="${SH}" rx="18"/></clipPath>`);
  defs.push(`<pattern id="scan" width="2" height="2" patternUnits="userSpaceOnUse"><rect y="1" width="2" height="1" fill="#000" opacity=".2"/></pattern>`);
  defs.push(`<radialGradient id="vig" cx=".5" cy=".5" r=".72"><stop offset=".78" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".45"/></radialGradient>`);
  defs.push(`<linearGradient id="glare" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".09"/><stop offset=".3" stop-color="#fff" stop-opacity="0"/></linearGradient>`);
  monitor.push(rect(BZ.x, BZ.y, BZ.w, BZ.h, '#050509', ` rx="10" stroke="#2a2e3e"`));
  for (const [cx, cy] of [[BZ.x + 8, BZ.y + 8], [BZ.x + BZ.w - 8, BZ.y + 8], [BZ.x + 8, BZ.y + BZ.h - 8], [BZ.x + BZ.w - 8, BZ.y + BZ.h - 8]]) {
    monitor.push(`<circle cx="${cx}" cy="${cy}" r="2.5" fill="#1d2030"/><circle cx="${cx}" cy="${cy}" r="1" fill="#3a3f55"/>`);
  }
  monitor.push(rect(SX - 4, SY - 4, SW + 8, SH + 8, '#11131b', ' rx="21"'));
  monitor.push(rect(SX, SY, SW, SH, '#000', ' rx="18"'));
  monitor.push(`<g clip-path="url(#tube)"><g transform="translate(${SX} ${SY}) scale(${PX})">`
    + screen.join('')
    + `<g class="sa">${sceneA.join('')}</g><g class="sb">${sceneB.join('')}</g><g class="sc">${sceneC.join('')}</g>`
    + `</g>${rect(SX, SY, SW, SH, 'url(#scan)')}${rect(SX, SY, SW, SH, 'url(#vig)')}${rect(SX, SY, SW, SH, 'url(#glare)')}</g>`);
}

// ------------------------------------------------------------------ control panel
const panel = [];
{
  defs.push(`<linearGradient id="cpg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#232a44"/><stop offset=".12" stop-color="#161b2e"/><stop offset="1" stop-color="#0b0d17"/></linearGradient>`);
  panel.push(rect(CP.x, CP.y, CP.w, CP.h, 'url(#cpg)', ` rx="5" stroke="#2a3360"`));
  // Joystick.
  const jx = CP.x + 46, jy = CP.y + 46;
  const tilt = [[6, 0], [6.5, 11], [8, 0], [9.5, 11], [9.6, -11], [11, 0], [11.5, -11], [13, 0]];
  css.push(`@keyframes js{0%{transform:rotate(0deg)}${tilt.map(([t, a]) => `${pct(t)}{transform:rotate(${a}deg)}`).join('')}}`);
  css.push(`.js{transform-box:fill-box;transform-origin:50% 100%;${anim('js', LOOP)}}`);
  panel.push(`<ellipse cx="${jx}" cy="${jy}" rx="21" ry="8" fill="#05060a"/><ellipse cx="${jx}" cy="${jy - 1}" rx="12" ry="4.5" fill="#2b3044"/>`
    + `<g class="js">` + rect(jx - 3, jy - 28, 6, 28, '#aab2c5') + rect(jx + 1, jy - 28, 2, 28, '#6d7588')
    + `<circle cx="${jx}" cy="${jy - 30}" r="11" fill="#e0262b"/><circle cx="${jx - 4}" cy="${jy - 34}" r="3.5" fill="#ff9c9c"/></g>`);
  // Three buttons: the three tabs. The lamps chase.
  css.push(`@keyframes ld{0%{opacity:.7}33.33%{opacity:0}}`);
  [['OBJECTIVES', TAB.obj, 't1'], ['ITEMS', TAB.itm, 't2'], ['BUILDINGS', TAB.bld, 't3']].forEach(([name, fill, cls], i) => {
    const bx = CP.x + 126 + i * 84, by = CP.y + 27;
    css.push(`.ld${i}{opacity:0;${anim('ld', 2, `;animation-delay:${n2(-2 + i * 0.6667)}s`)}}`);
    panel.push(`<ellipse cx="${bx}" cy="${by + 3}" rx="19" ry="12" fill="#05060a"/><ellipse cx="${bx}" cy="${by + 1}" rx="16" ry="10" fill="${fill}" opacity=".45"/>`
      + `<ellipse cx="${bx}" cy="${by - 2}" rx="14" ry="8.5" fill="${fill}"/><ellipse class="ld${i}" cx="${bx}" cy="${by - 2}" rx="14" ry="8.5" fill="#fff"/>`
      + `<ellipse cx="${bx - 4}" cy="${by - 5}" rx="5" ry="2.2" fill="#fff" opacity=".5"/>`);
    panel.push(txt(bx - Math.round((len(name) * 8 - 1) / 2), CP.y + 50, name, cls));
  });
  // The coin slot, taped over by the operator. It has never taken a coin.
  {
    const kx = CP.x + 345, ky = CP.y + 9, kw = 41, kh = 50;
    panel.push(rect(kx, ky, kw, kh, '#1a1f33', ' rx="3" stroke="#3a4262"'));
    panel.push(txt(kx + 5, ky + 5, 'COIN', 'gd'));
    panel.push(rect(kx + 14, ky + 16, 13, 30, '#0a0c14', ' rx="2" stroke="#596074"'));
    panel.push(rect(kx + 19, ky + 19, 3, 24, '#000') + rect(kx + 22, ky + 19, 1, 24, '#8a93ad'));
    // Masking tape with a hand-cut edge, stuck on slightly past the plate.
    const tx = kx - 4, ty = ky + 25, tw = kw + 8;
    panel.push(`<path fill="${COL.cream}" d="M${tx} ${ty}h${tw}l-2 3 2 3-2 3 2 3h${-tw}l2-3-2-3 2-3z"/>`);
    panel.push(rect(tx + 2, ty + 10, tw - 4, 2, '#000', ' opacity=".18"'));
    panel.push(txt(kx + 5, ty + 2, 'FREE', 'k'));
  }
  // The instruction decal: how to start it, in the only lowercase on the cabinet.
  const dx = CP.x + 398, dw = CP.w - 398 - 8;
  panel.push(rect(dx, CP.y + 8, dw, CP.h - 16, '#000', ` rx="3" stroke="${COL.gold}"`));
  panel.push(txt(dx + 6, CP.y + 14, '1>', 'gd') + txt(dx + 30, CP.y + 14, 'python -m pip install -r requirements.txt', 'w'));
  panel.push(txt(dx + 6, CP.y + 27, '2>', 'gd') + txt(dx + 30, CP.y + 27, 'python -m streamlit run app/app.py', 'w'));
  panel.push(txt(dx + 6, CP.y + 40, 'NO INSTALL:', 'gd') + txt(dx + 102, CP.y + 40, 'lukexyz.github.io/ULTRA-SATISFACTORY', 'c'));
}

// ------------------------------------------------------------------ assemble
css.push('@media (prefers-reduced-motion:reduce){*{animation:none!important}}');
const glyphDefs = [...glyphIds.values()].map(({ id, face, ch }) => `<path id="${id}" d="${rectsD(bmRects(FACES[face][ch]))}"/>`).join('');

const TITLE = 'ULTRA-SATISFACTORY: an arcade cabinet in attract mode';
const DESC = 'The front of an imaginary coin-op cabinet. The lit marquee reads ULTRA SATISFACTORY, a companion app for Satisfactory, unofficial fan project. '
  + 'The portrait monitor has a score header (ITEMS 000140, RECIPES 000211, BUILDINGS 000477) and loops three screens with hard cuts: '
  + 'a title card (every recipe, building and Space Elevator objective, one click apart) with an output-per-minute legend (Screw 40, Iron Ingot 30, Iron Plate 20, Iron Rod 15, Rotor 4); '
  + 'a demo shift where a Smelter, two Constructors and three Constructors turn 30 Iron Ore a minute into 120 Screws a minute on belts drawn to scale; '
  + 'and a high-score table of the five Space Elevator phases ranked by parts wanted (3100, 1625, 1600, 800, 650). '
  + 'INSERT NOTHING blinks above FREE PLAY: IT\'S APACHE 2.0. Bezel cards explain the three tabs, Objectives, Items and Buildings; '
  + 'the control panel has a joystick, three tab-coloured buttons, a coin slot taped over with the word FREE, and the two commands that start the app.';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="t d">
<title id="t">${TITLE}</title>
<desc id="d">${DESC}</desc>
<style>${css.join('\n')}</style>
<defs>${glyphDefs}${sprDefs}${defs.join('')}</defs>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="12" fill="#08090f" stroke="#2a2e3e"/>
${rect(5, 16, 3, H - 32, COL.gold, ' opacity=".8"')}${rect(W - 8, 16, 3, H - 32, COL.gold, ' opacity=".8"')}
${marquee.join('')}
${cardL}${cardR}
${monitor.join('')}
${panel.join('')}
</svg>
`;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, svg);
console.log(`wrote ${path.relative(process.cwd(), OUT)} (${(svg.length / 1024).toFixed(1)} KB, ${glyphIds.size} glyphs)`);
