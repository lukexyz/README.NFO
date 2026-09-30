#!/usr/bin/env node
// ULTRA-SATISFACTORY as a sysop's waiting-for-caller screen: the local console a DOS bulletin
// board showed its owner while nobody was connected. Style reference: the WFC status dashboards
// of early-90s BBS packages such as Renegade and RemoteAccess (solid blue field, a row of
// bordered stat panels, a black modem window, a one-line state message, a grid of bracketed
// hotkeys). Nothing is copied from those packages: the layout idea is generic, and every name,
// number and letterform here is this project's own.
//
// Regenerate:  node examples/ultra-satisfactory/src/33-sysop-dashboard_opus_5.5.mjs
// Writes assets/33-sysop-dashboard_opus_5.5.svg and 33-sysop-dashboard_opus_5.5.md (the markdown
// quotes the screen, so both come from the same data).
//
// Plain Node, no dependencies, fully deterministic (no clock, no randomness). The screen is an
// 80 x 33 grid of 9 x 16 cells (VGA text mode's 720-pixel width: 8-pixel glyphs plus a blank ninth
// column, which box-drawing characters fill) drawn with a CP437-style bitmap font defined below. Text is <use>
// references to glyph paths, never <text>, so it looks the same for every viewer. Animation is
// CSS only, so prefers-reduced-motion can switch it all off and leave a complete, readable frame.
//
// What moves:
//   - the clock (top left) and the uptime (Other Info) tick once a second. Each digit is its own
//     strip with its own period, so they carry properly and never visibly loop;
//   - every CALL seconds a Pioneer dials in: the modem window scrolls RING, ATA, CONNECT and
//     NO CARRIER, the state line says who is on and why they left, the Last Caller window
//     changes, and the Calls counter goes up by one (and keeps going up, loop after loop);
//   - the modem is then re-initialised with the quick-start commands, which puts the window back
//     exactly where it started, so the loop point is invisible.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '33-sysop-dashboard_opus_5.5';
const OUT = path.join(HERE, '..', 'assets', `${SLUG}.svg`);

// ---------------------------------------------------------------------------------------------
// Screen geometry
// ---------------------------------------------------------------------------------------------
const COLS = 80, ROWS = 33, CW = 9, CH = 16, PAD = 16;
const SW = COLS * CW, SH = ROWS * CH;
const VBW = SW + PAD * 2, VBH = SH + PAD * 2;

// Row map.
const R = { title: 0, logoY: 24, tag: 6, panels: 7, win: 19, state: 26, keys: 28, foot: 32 };

// The 16-colour DOS palette.
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
  '!': [2, '...##.. ..####. ..####. ..####. ...##.. ...##.. ...##.. ....... ...##.. ...##..'],
  '?': [2, '.#####. ##...## ##...## ....##. ...##.. ...##.. ...##.. ....... ...##.. ...##..'],
  "'": [1, '...##.. ...##.. ..##...'],
  '"': [1, '.##..##. .##..##. ..#..#..'],
  '-': [7, '#######'],
  '_': [13, '########'],
  '/': [4, '......# .....## ....##. ...##.. ..##... .##.... ##..... #......'],
  '(': [2, '....##. ...##.. ..##... ..##... ..##... ..##... ..##... ..##... ...##.. ....##.'],
  ')': [2, '.##.... ..##... ...##.. ...##.. ...##.. ...##.. ...##.. ...##.. ..##... .##....'],
  '[': [2, '.####.. .##.... .##.... .##.... .##.... .##.... .##.... .##.... .##.... .####..'],
  ']': [2, '.####.. ...##.. ...##.. ...##.. ...##.. ...##.. ...##.. ...##.. ...##.. .####..'],
  '>': [3, '.##.... ..##... ...##.. ....##. .....## ....##. ...##.. ..##... .##....'],
  '#': [2, '.##.##. .##.##. ####### .##.##. .##.##. .##.##. ####### .##.##. .##.##.'],
  '+': [5, '...##... ...##... .######. ...##... ...##...'],
  '=': [6, '.######. ........ ........ .######.'],
  '&': [2, '.###... ##.##.. ##.##.. .###... .###.## ##.###. ##..##. ##..##. ##..##. .###.##'],
  '·': [7, '...##... ...##...'],
};
for (const [ch, [top, rows]] of Object.entries(PUNCT)) def(ch, top, rows);
FONT.set(' ', new Array(16).fill(0));

// Box drawing, generated from arm descriptions: single lines on row 7 / column 3.
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

// Bitmap -> compact path (greedy merge of horizontal runs into rectangles).
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
// The ninth column repeats the eighth for characters whose line runs off the right of the cell.
const JOINS_RIGHT = new Set(['─', '┌', '└']);
const bit = (v, x, join) => (x < 8 ? (v >> (7 - x)) & 1 : join ? v & 1 : 0);
const glyphPath = (ch) => bitmapPath(FONT.get(ch).map((v) => (x) => bit(v, x, JOINS_RIGHT.has(ch))), CW);

const glyphIds = new Map();
function gid(ch) {
  if (!FONT.has(ch)) throw new Error(`no glyph for ${JSON.stringify(ch)} (U+${ch.codePointAt(0).toString(16)})`);
  if (!glyphIds.has(ch)) glyphIds.set(ch, `g${glyphIds.size.toString(36)}`);
  return glyphIds.get(ch);
}
const len = (str) => [...str].length;

// Text for the animated layers: coloured segments on one row, as <use> runs inside a group that
// carries the row offset (so each <use> only needs an x).
function text(r, c, parts) {
  let out = '';
  for (const [t, fg] of parts) {
    let u = '';
    for (const ch of t) {
      if (ch !== ' ') u += `<use href="#${gid(ch)}" x="${c * CW}"/>`;
      c++;
    }
    if (u) out += `<g class="c${fg}" transform="translate(0 ${r * CH})">${u}</g>`;
  }
  return out;
}
const width = (parts) => parts.reduce((a, [t]) => a + len(t), 0);
const plain = (parts) => parts.map(([t]) => t).join('');
const centre = (n) => Math.floor((COLS - n) / 2);

// ---------------------------------------------------------------------------------------------
// Screen buffers. `grid` is the static text layer of the SVG. `txt` is the whole screen at rest
// as plain characters (static text plus the resting state of everything animated): it becomes
// WFC.TXT in the markdown, so the text version can never drift from the picture.
// ---------------------------------------------------------------------------------------------
const grid = Array.from({ length: ROWS }, () => new Array(COLS).fill(null));
const txt = Array.from({ length: ROWS }, () => new Array(COLS).fill(' '));
const bgRuns = [];
function rest(r, c, str) { for (const ch of str) txt[r][c++] = ch; }
function put(r, c, str, fg) {
  for (const ch of str) {
    if (c < 0 || c >= COLS || r < 0 || r >= ROWS) throw new Error(`off screen at ${r},${c}: ${str}`);
    grid[r][c] = ch === ' ' ? null : { ch, fg };
    txt[r][c] = ch;
    c++;
  }
  return c;
}
function seg(r, c, parts) { for (const [t, fg] of parts) c = put(r, c, t, fg); return c; }
function bg(r, c, n, color) { bgRuns.push({ r, c, n, color }); }

// A single-line frame with its heading set into the top border.
function frame({ r0, r1, c0, c1, line, head, headFg, align = 'centre', fill = null }) {
  const w = c1 - c0 + 1;
  if (fill !== null) for (let r = r0; r <= r1; r++) bg(r, c0, w, fill);
  put(r0, c0, '┌' + '─'.repeat(w - 2) + '┐', line);
  for (let r = r0 + 1; r < r1; r++) { put(r, c0, '│', line); put(r, c1, '│', line); }
  put(r1, c0, '└' + '─'.repeat(w - 2) + '┘', line);
  const label = ` ${head} `;
  if (len(label) > w - 2) throw new Error(`heading too long: ${head}`);
  const at = align === 'left' ? c0 + 2 : c0 + 1 + Math.floor((w - 2 - len(label)) / 2);
  put(r0, at, label, headFg);
}

// ---------------------------------------------------------------------------------------------
// Timeline. One call every CALL seconds; five callers take turns, so the full cycle is 100 s.
// ---------------------------------------------------------------------------------------------
const CALL = 20;
// The phone rings three seconds in, so a visitor who only stays a moment still sees a call.
const T = { ring1: 3, ring2: 4.5, ata: 5.5, connect: 6.5, hangup: 12.5, init1: 14, ok1: 14.5, init2: 15, ok2: 15.5 };

// Every figure below is what the app's own data says (checked against data/data.json through
// ultra_satisfactory.data.get_item_recipe): output per minute, cycle time, machine, power. The
// data lists the Particle Accelerator's power as 0 MW, so no figure is quoted for it.
const CALLERS = [
  { who: 'box_of_screws', tab: 'ITEMS', tabFg: BLK, tabBg: LMG, where: '> search "scr"', asked: 'Screw', got: 'Screw', rate: '40/min', cycle: '6 s', machine: 'Constructor', mw: '4 MW',
    doing: 'searching ITEMS for a Screw recipe', bye: 'storage full. Of screws.' },
  { who: 'wrong_way_belt', tab: 'OBJECTIVES', tabFg: WHT, tabBg: MAG, where: '> Phase 3', asked: 'Modular Engine x500', got: 'Modular Engine', rate: '1/min', cycle: '60 s', machine: 'Manufacturer', mw: '55 MW',
    doing: 'asking what Phase 3 wants', bye: 'a belt was running backwards.' },
  { who: 'clipped_pipe', tab: 'BUILDINGS', tabFg: WHT, tabBg: LBL, where: '> Foundry', asked: 'Foundry', got: 'Steel Ingot', rate: '45/min', cycle: '4 s', machine: 'Foundry', mw: '16 MW',
    doing: 'checking what a Foundry makes', bye: 'went to not look at a pipe.' },
  { who: 'one_input_short', tab: 'OBJECTIVES', tabFg: WHT, tabBg: MAG, where: '> Phase 4', asked: 'Nuclear Pasta x100', got: 'Nuclear Pasta', rate: '0.5/min', cycle: '120 s', machine: 'Particle Accelerator', mw: '',
    doing: 'pricing up Nuclear Pasta', bye: 'needs a bigger spreadsheet.' },
  { who: 'fuse_whisperer', tab: 'OBJECTIVES', tabFg: WHT, tabBg: MAG, where: '> Phase 2', asked: 'Modular Frame x500', got: 'Modular Frame', rate: '2/min', cycle: '60 s', machine: 'Assembler', mw: '15 MW',
    doing: 'asking what Phase 2 wants', bye: 'the fuse blew. Again.' },
];
const CYCLE = CALL * CALLERS.length;
const LAST = CALLERS[CALLERS.length - 1]; // on screen at t = 0, and whenever animation is off
const SYSOP = 'Idle Ida';
// The date a DOS machine wakes up on when its clock battery has died: 1 January 1980, a Tuesday.
const DATE = 'Tue 01-01-80';

const css = [];
const defs = [];
const layers = [];  // animated pieces, above the static layer

css.push(PAL.map((c, i) => `.c${i}{fill:${c}}`).join(''));

const num = (v) => +v.toFixed(4);
let animCount = 0;
// A class that shows its element only during the given [from, to) windows of a `period`-second
// loop. With animation switched off, the element rests in its t = 0 state (or `resting`, if given).
function showWhen(period, windows, resting) {
  const name = `v${(animCount++).toString(36)}`;
  const on0 = windows.some(([a, b]) => a <= 0 && b > 0);
  const pts = [];
  for (const [a, b] of windows) {
    if (a > 0) pts.push([a, 1]);
    if (b < period) pts.push([b, 0]);
  }
  pts.sort((p, q) => p[0] - q[0]);
  let kf = `0%{opacity:${on0 ? 1 : 0}}`;
  for (const [t, v] of pts) kf += `${num((100 * t) / period)}%{opacity:${v}}`;
  kf += `100%{opacity:${on0 ? 1 : 0}}`;
  if (resting === undefined) resting = on0;
  css.push(`@keyframes ${name}{${kf}}.${name}{${resting ? '' : 'opacity:0;'}animation:${name} ${period}s step-end infinite}`);
  return name;
}

// An odometer: a counter that starts at `start` and goes up by one at `at + k * every` seconds.
// Each field is a vertical strip of its values behind a one-row clip, stepping on its own period,
// so carries happen at the right moment and the counter never resets. `fields` lists the fields
// from least significant: [how many values it cycles through, how many characters wide]; `sep`
// puts a separator to the left of the numbered fields.
const rollKeys = new Set();
function odometer({ r, c, start, every, at, fields, fg, sep = [] }) {
  const seps = new Map(sep);
  const total = fields.reduce((a, [, w]) => a + w, 0) + sep.reduce((a, [, s]) => a + len(s), 0);
  let unit = 1, col = c + total, out = '', shown = '';
  fields.forEach(([n, w], i) => {
    const value0 = Math.floor(start / unit) % n;
    const period = unit * n * every;
    const into = (start % unit) * every + ((every - at) % every); // seconds already spent on the current value
    col -= w;
    let strip = '';
    for (let k = 0; k < n; k++) strip += text(r + k, col, [[String((value0 + k) % n).padStart(w, '0'), fg]]);
    shown = String(value0).padStart(w, '0') + shown;
    if (!rollKeys.has(n)) {
      rollKeys.add(n);
      css.push(`@keyframes r${n}{to{transform:translateY(${-n * CH}px)}}`);
    }
    out += `<g style="animation:r${n} ${period}s steps(${n}) ${num(-into)}s infinite">${strip}</g>`;
    if (seps.has(i)) { const s = seps.get(i); col -= len(s); out += text(r, col, [[s, fg]]); shown = s + shown; }
    unit *= n;
  });
  rest(r, c, shown);
  const id = `o${(animCount++).toString(36)}`;
  defs.push(`<clipPath id="${id}"><rect x="${c * CW}" y="${r * CH}" width="${total * CW}" height="${CH}"/></clipPath>`);
  return `<g clip-path="url(#${id})">${out}</g>`;
}
const CLOCK_FIELDS = [[10, 1], [6, 1], [10, 1], [6, 1], [24, 2]];   // s, 10 s, min, 10 min, hours
const CLOCK_SEP = [[1, ':'], [3, ':']];
const hms = (h, m, sec) => h * 3600 + m * 60 + sec;
// Where the (fictional) wall clock and uptime stand when the animation starts.
const CLOCK0 = hms(16, 59, 41), UP0 = hms(7, 12, 5);

// ---------------------------------------------------------------------------------------------
// Row 0: clock, title, date.
// ---------------------------------------------------------------------------------------------
layers.push(odometer({ r: R.title, c: 1, start: CLOCK0, every: 1, at: 0, fields: CLOCK_FIELDS, sep: CLOCK_SEP, fg: YEL }));
{
  const parts = [['ULTRA', LCY], ['-SATISFACTORY', WHT], [' Control Terminal', LGR]];
  seg(R.title, centre(width(parts)), parts);
  put(R.title, COLS - 1 - len(DATE), DATE, YEL);
}

// ---------------------------------------------------------------------------------------------
// The logo: one line of tall 3 x 7 block capitals on the half-block grid (one cell wide, half a
// cell tall), the way a sysop would build a banner out of CP437 half blocks. Own lettering.
// ---------------------------------------------------------------------------------------------
const rep = (row, n) => new Array(n).fill(row);
const BIG = {
  U: [...rep('#.#', 6), '###'],
  L: [...rep('#..', 6), '###'],
  T: ['###', ...rep('.#.', 6)],
  R: ['##.', '#.#', '#.#', '##.', '#.#', '#.#', '#.#'],
  A: ['###', '#.#', '#.#', '###', '#.#', '#.#', '#.#'],
  S: ['###', '#..', '#..', '###', '..#', '..#', '###'],
  I: ['###', ...rep('.#.', 5), '###'],
  F: ['###', '#..', '#..', '##.', '#..', '#..', '#..'],
  C: ['###', ...rep('#..', 5), '###'],
  O: ['###', ...rep('#.#', 5), '###'],
  Y: ['#.#', '#.#', '#.#', '###', '.#.', '.#.', '.#.'],
};
const SHADOW = '#00005A';   // the one colour outside the DOS sixteen: a shadow on the blue field
const LPX = CW, LP = 8, LOGO_H = 7, WORD_GAP = 3;
function wordCols(word) {
  const cols = [];
  [...word].forEach((ch, i) => {
    if (i) cols.push(null);
    const L = BIG[ch];
    for (let x = 0; x < 3; x++) cols.push(L.map((row) => row[x] === '#'));
  });
  return cols;
}
const colsPath = (cols) => bitmapPath(Array.from({ length: LOGO_H }, (_, y) => (x) => !!(cols[x] && cols[x][y])), cols.length, LPX, LP);
{
  const u = wordCols('ULTRA'), s = wordCols('SATISFACTORY');
  const total = u.length + WORD_GAP + s.length;
  const x0 = Math.floor((COLS - total - 1) / 2) * CW; // the spare column is for the shadow, which hangs off the right
  const sx = (u.length + WORD_GAP) * LPX;
  defs.push(`<path id="lu" d="${colsPath(u)}"/><path id="ls" d="${colsPath(s)}"/>`);
  layers.push(`<g transform="translate(${x0} ${R.logoY})">`
    + `<g fill="${SHADOW}"><use href="#lu" x="${LPX}" y="${LP}"/><use href="#ls" x="${sx + LPX}" y="${LP}"/></g>`
    + `<use class="c11" href="#lu"/><use class="c15" href="#ls" x="${sx}"/></g>`);
}

// Row 6: the pitch.
const PITCH = [['Satisfactory companion: ', LCY], ['every recipe, building & objective, ', WHT], ['one click apart', YEL]];
seg(R.tag, centre(width(PITCH)), PITCH);

// ---------------------------------------------------------------------------------------------
// Rows 7-18: four stat panels. Short labels, right-aligned values, heading in the top border.
// The counts are the app's own: 140 craftable items, 211 machine recipes (88 alternates), 477
// buildings split by type, 5 Space Elevator phases, and standard-recipe output per minute.
// ---------------------------------------------------------------------------------------------
const PANEL = { w: 18, r0: R.panels, r1: R.panels + 11, cols: [1, 21, 41, 61] };
const INNER = PANEL.w - 4;
function panel(i, head, rows) {
  const c0 = PANEL.cols[i];
  frame({ r0: PANEL.r0, r1: PANEL.r1, c0, c1: c0 + PANEL.w - 1, line: CYN, head, headFg: LGN });
  if (rows.length > PANEL.r1 - PANEL.r0 - 1) throw new Error(`panel ${head}: too many rows`);
  rows.forEach(([label, value, vfg = LCY, lfg = WHT], k) => {
    if (len(label) + 1 + len(value) > INNER) throw new Error(`panel row too wide: ${label} ${value}`);
    put(PANEL.r0 + 1 + k, c0 + 2, label, lfg);
    put(PANEL.r0 + 1 + k, c0 + 2 + INNER - len(value), value, vfg);
  });
  // Where a value in row k ends, for the live values drawn by the animated layer.
  return { row: (k) => PANEL.r0 + 1 + k, valueEnd: c0 + 2 + INNER };
}
panel(0, 'System Totals', [
  ['Items', '140'], ['Recipes', '211'], ['Alternates', '88'], ['Buildings', '477'], ['Machines', '9'],
  ['Phases', '5'], ['Tabs', '3'], ['Clicks apart', '1'], ['Paywalls', '0'], ['Price', 'free', LGN],
]);
panel(1, 'Buildings', [
  ['Structure', '333'], ['Logistics', '59'], ['Decor', '26'], ['Power', '15'], ['Transit', '14'],
  ['Machines', '9'], ['Special', '7'], ['Storage', '7'], ['Extraction', '7'], ['Total', '477', YEL, YEL],
]);
panel(2, 'Output / Min', [
  ['Iron Ingot', '30'], ['Iron Plate', '20'], ['Iron Rod', '15'], ['Screw', '40'], ['Wire', '30'],
  ['Cable', '30'], ['Steel Ingot', '45'], ['Rotor', '4'], ['Mod. Frame', '2'], ['Nuc. Pasta', '0.5'],
]);
const CALLS_ROW = 5, UP_ROW = 6, FUSE_ROW = 9;
const info = panel(3, 'Other Info', [
  ['Version', '0.0.1'], ['Lic', 'Apache 2.0'], ['Python', '3.10+'], ['Port', '8501'], ['SysOp', SYSOP],
  ['Calls', ''], ['Up', ''], ['Spaghetti', 'yes'], ['Screws', 'lots'], ['Fuse', ''],
]);
// The live values in Other Info: calls taken (one more each time a caller hangs up), uptime, and
// the one value in the alert colour.
// The board has been up seven hours and takes a call every CALL seconds, so the counter starts at
// the number of callers who have already hung up in that time (1296), not at a made-up figure.
const CALLS0 = Math.floor((UP0 - (CALL - T.hangup)) / CALL) + 1;
layers.push(odometer({ r: info.row(CALLS_ROW), c: info.valueEnd - 4, start: CALLS0, every: CALL, at: T.hangup, fields: [[10, 1], [10, 1], [10, 1], [10, 1]], fg: LCY }));
layers.push(odometer({ r: info.row(UP_ROW), c: info.valueEnd - 8, start: UP0, every: 1, at: 0, fields: CLOCK_FIELDS, sep: CLOCK_SEP, fg: LCY }));
layers.push(`<g class="${showWhen(1.6, [[0, 1.1]])}">${text(info.row(FUSE_ROW), info.valueEnd - 5, [['BLOWN', LRD]])}</g>`);
rest(info.row(FUSE_ROW), info.valueEnd - 5, 'BLOWN');

// ---------------------------------------------------------------------------------------------
// Rows 19-25: the black windows. Modem on the left, the last caller on the right.
// ---------------------------------------------------------------------------------------------
const WIN = { r0: R.win, r1: R.win + 6 };
const MODEM = { c0: 1, c1: 45 };
const CALLER = { c0: 47, c1: 78 };
frame({ ...WIN, ...MODEM, line: LGR, head: 'Modem', headFg: WHT, align: 'left', fill: BLK });
frame({ ...WIN, ...CALLER, line: LGR, head: 'Last Caller', headFg: WHT, align: 'left', fill: BLK });

// The modem's front-panel lamps, set into the right of the window's top border. Auto-answer,
// terminal-ready and modem-ready stay lit; off-hook, carrier and high-speed light for the call;
// send and receive flicker while the caller is on (small, and well under three flashes a second).
{
  const during = (spans) => spans.map(([a, b]) => [T.connect + a, T.connect + b]);
  const LAMPS = [
    ['HS', [[T.connect, T.hangup]]], ['AA', 'on'], ['CD', [[T.connect, T.hangup]]], ['OH', [[T.ata, T.hangup]]],
    ['RD', during([[0.9, 1.2], [1.6, 1.9], [2.8, 3.1], [3.6, 4.0], [4.85, 5.15]])],
    ['SD', during([[0.2, 0.8], [1.3, 1.55], [2.0, 2.7], [3.2, 3.5], [4.1, 4.8], [5.2, 5.45]])],
    ['TR', 'on'], ['MR', 'on'],
  ];
  const label = LAMPS.map(([n]) => n).join(' ');
  let c = MODEM.c1 - 2 - len(label);
  put(WIN.r0, c - 1, ` ${label} `, DGR);
  for (const [name, lit] of LAMPS) {
    if (lit === 'on') put(WIN.r0, c, name, LRD);
    else layers.push(`<g class="${showWhen(CALL, lit)}">${text(WIN.r0, c, [[name, LRD]])}</g>`);
    c += len(name) + 1;
  }
}

// The modem log. The init string this board sends its modem is the project's quick start, so the
// idle window is also the install instructions. Lines 0-3 are on screen at rest; each later line
// prints on the bottom row and scrolls the window up one. The last four lines repeat the first
// four, so when the loop restarts the window is already showing exactly the same thing.
const CMD1 = 'python -m pip install -r requirements.txt';
const CMD2 = 'python -m streamlit run app/app.py';
const LOCAL = 'http://localhost:8501';
{
  const cmd1 = [[CMD1, LGR]], cmd2 = [[CMD2, LGR]];
  const ok1 = [['OK', WHT]], ok2 = [['OK', WHT], [`  ${LOCAL}`, LCY]];
  const log = [
    [0, cmd1], [0, ok1], [0, cmd2], [0, ok2],
    [T.ring1, [['RING', YEL]]], [T.ring2, [['RING', YEL]]], [T.ata, [['ATA', LGR]]],
    [T.connect, [['CONNECT 9600/ARQ', LGN]]], [T.hangup, [['NO CARRIER', LRD]]],
    [T.init1, cmd1], [T.ok1, ok1], [T.init2, cmd2], [T.ok2, ok2],
  ];
  const top = WIN.r0 + 1, rows = WIN.r1 - WIN.r0 - 1, c = MODEM.c0 + 2;
  for (const [, parts] of log) if (width(parts) > MODEM.c1 - c - 1) throw new Error('modem line too long');
  let strip = '', kf = '0%{transform:translateY(0)}', n = 0;
  log.forEach(([t, parts], i) => {
    strip += text(top + i, c, parts);
    if (t > 0) { n++; kf += `${num((100 * t) / CALL)}%{transform:translateY(${-n * CH}px)}`; } else rest(top + i, c, plain(parts));
  });
  kf += `100%{transform:translateY(${-n * CH}px)}`;
  if (log.length - n !== rows - 1) throw new Error('modem window must rest with one free row');
  css.push(`@keyframes ms{${kf}}.ms{animation:ms ${CALL}s step-end infinite}`);
  const x = (MODEM.c0 + 1) * CW, w = (MODEM.c1 - MODEM.c0 - 1) * CW;
  defs.push(`<clipPath id="mw"><rect x="${x}" y="${top * CH}" width="${w}" height="${(rows - 1) * CH}"/></clipPath>`);
  // The bottom row of the window is never inside the clip: it is the line the cursor waits on.
  layers.push(`<g clip-path="url(#mw)"><g class="ms">${strip}</g></g>`
    + `<g class="${showWhen(1, [[0, 0.5]])}">${text(top + rows - 1, c, [['_', LGR]])}</g>`);
  rest(top + rows - 1, c, '_');
}

// Last Caller: five callers take turns. Each one is on screen from their CONNECT to the next.
{
  const top = WIN.r0 + 1, cL = CALLER.c0 + 2, cV = cL + 6, maxV = CALLER.c1 - 1 - cV;
  ['Who', 'Tab', 'Got', 'Rate', 'On'].forEach((label, k) => put(top + k, cL, label, LGR));
  CALLERS.forEach((p, i) => {
    const from = i * CALL + T.connect;
    const cls = showWhen(CYCLE, from + CALL <= CYCLE ? [[from, from + CALL]] : [[from, CYCLE], [0, from + CALL - CYCLE]]);
    const chip = ` ${p.tab} `;
    const values = [p.who, `${p.tab}  ${p.where}`, p.asked === p.machine ? p.got : p.asked, `${p.rate}, ${p.cycle} cycle`, p.mw ? `${p.machine}, ${p.mw}` : p.machine];
    for (const v of values) if (len(v) > maxV) throw new Error(`caller value too long: ${v}`);
    // The tab chip starts one column early, so its padding sits in the gutter and the tab name
    // lines up with the values above and below it.
    layers.push(`<g class="${cls}">`
      + `<rect class="c${p.tabBg}" x="${(cV - 1) * CW}" y="${(top + 1) * CH}" width="${len(chip) * CW}" height="${CH}"/>`
      + text(top, cV, [[values[0], YEL]])
      + text(top + 1, cV - 1, [[chip, p.tabFg], [` ${p.where}`, WHT]])
      + text(top + 2, cV, [[values[2], WHT]])
      + text(top + 3, cV, [[values[3], LCY]])
      + text(top + 4, cV, [[values[4], LCY]])
      + `</g>`);
    if (p === LAST) values.forEach((v, k) => rest(top + k, cV, v));
  });
}

// ---------------------------------------------------------------------------------------------
// Row 26: the state line.
// ---------------------------------------------------------------------------------------------
const IDLE = 'Waiting for a Pioneer to call';
{
  const r = R.state;
  const line = (parts) => { if (width(parts) > COLS - 2) throw new Error(`state line too long: ${plain(parts)}`); return text(r, centre(width(parts)), parts); };
  // Waiting: the resting state. Three dots count off, two seconds a lap.
  const dots = ' . . .';
  const c0 = centre(len(IDLE + dots));
  let waiting = text(r, c0, [[IDLE, WHT]]);
  [0, 1, 2].forEach((k) => {
    waiting += `<g class="${showWhen(2, [[0.5 * (k + 1), 2]], true)}">${text(r, c0 + len(IDLE) + 1 + 2 * k, [['.', WHT]])}</g>`;
  });
  rest(r, c0, IDLE + dots);
  layers.push(`<g class="${showWhen(CALL, [[0, T.ring1], [T.ok2, CALL]])}">${waiting}</g>`);
  layers.push(`<g class="${showWhen(CALL, [[T.ring1, T.connect]])}">${line([['RING. ', YEL], ['Somebody has forgotten a recipe again', WHT]])}</g>`);
  layers.push(`<g class="${showWhen(CALL, [[T.init1, T.ok2]])}">${line([['Initializing modem. ', WHT], ['The init string is the quick start', LGR]])}</g>`);
  CALLERS.forEach((p, i) => {
    const t0 = i * CALL;
    layers.push(`<g class="${showWhen(CYCLE, [[t0 + T.connect, t0 + T.hangup]])}">${line([['Node 1: ', LGN], [p.who, YEL], [` is ${p.doing}`, WHT]])}</g>`);
    layers.push(`<g class="${showWhen(CYCLE, [[t0 + T.hangup, t0 + T.init1]])}">${line([[p.who, YEL], [' hung up. ', LRD], [`Reason: ${p.bye}`, WHT]])}</g>`);
  });
}

// ---------------------------------------------------------------------------------------------
// Rows 28-31: the key grid. Five columns, hotkey letter in square brackets inside each word. The
// top two rows are the README's real navigation (the markdown links them); the rest is what a
// sysop here actually does all day.
// ---------------------------------------------------------------------------------------------
const LIVE = 'https://lukexyz.github.io/ULTRA-SATISFACTORY/';
const REPO = 'https://github.com/lukexyz/ULTRA-SATISFACTORY';
const KEYS = [
  [['[O]bjectives', '#whats-inside'], ['[I]tems', '#whats-inside'], ['[B]uildings', '#whats-inside'], ['[R]un locally', '#run-it-locally'], ['[L]ive in browser', LIVE]],
  [['[D]ata credits', '#data--credits'], ['[S]ource code', 'app/app.py'], ['[A]pache 2.0', '#license'], ['[G]itHub repo', REPO], ['[H]ow it\'s built', '#how-its-built']],
  [['[M]anifold'], ['[U]njam merger'], ['[F]lip breaker'], ['o[V]erclock'], ['[T]idy up (never)']],
  [['[C]lip a pipe'], ['[Y]eet to Sink'], ['[E]xcel, again'], ['[N]ap (denied)'], ['[Q]uit (disabled)']],
];
const KEY_COLS = [2, 17, 32, 47, 62];
KEYS.forEach((row, j) => row.forEach(([word, href], i) => {
  const limit = i + 1 < KEY_COLS.length ? KEY_COLS[i + 1] - 1 : COLS - 1;
  if (KEY_COLS[i] + len(word) > limit) throw new Error(`key too long: ${word}`);
  const m = word.match(/^(.*?)(\[.\])(.*)$/);
  const base = href ? WHT : LGR;
  seg(R.keys + j, KEY_COLS[i], [[m[1], base], [m[2], YEL], [m[3], base]]);
}));

// Row 32: status bar.
{
  bg(R.foot, 0, COLS, CYN);
  const left = [['No install: ', BLU], [LIVE.replace(/^https:\/\/|\/$/g, ''), BLK]];
  const right = [['unofficial fan project', BLK]];
  const end = seg(R.foot, 1, left);
  const at = COLS - 1 - width(right);
  seg(R.foot, at, right);
  put(R.foot, Math.floor((end + at) / 2), '│', BLU);
}

css.push(`@media (prefers-reduced-motion:reduce){*{animation:none!important}}`);

// ---------------------------------------------------------------------------------------------
// Emit the static text layer: long box-drawing runs become single paths, the rest are <use>s
// grouped by row and colour.
// ---------------------------------------------------------------------------------------------
const RUNNABLE = new Set(['─']);
let staticLayer = '';
for (const { r, c, n, color } of bgRuns) staticLayer += `<rect class="c${color}" x="${c * CW}" y="${r * CH}" width="${n * CW}" height="${CH}"/>`;
const runPaths = new Map();
for (let r = 0; r < ROWS; r++) {
  const byFg = new Map();
  for (let c = 0; c < COLS;) {
    const cell = grid[r][c];
    if (!cell) { c++; continue; }
    if (RUNNABLE.has(cell.ch)) {
      let n = 1;
      while (c + n < COLS && grid[r][c + n] && grid[r][c + n].ch === cell.ch && grid[r][c + n].fg === cell.fg) n++;
      const g = FONT.get(cell.ch);
      const d = bitmapPath(g.map((v) => (x) => bit(v, x % CW, true)), CW * n, 1, 1, c * CW, r * CH);
      runPaths.set(cell.fg, (runPaths.get(cell.fg) || '') + d);
      c += n;
    } else {
      byFg.set(cell.fg, (byFg.get(cell.fg) || '') + `<use href="#${gid(cell.ch)}" x="${c * CW}"/>`);
      c++;
    }
  }
  for (const [fg, u] of byFg) staticLayer += `<g class="c${fg}" transform="translate(0 ${r * CH})">${u}</g>`;
}
for (const [fg, d] of runPaths) staticLayer += `<path class="c${fg}" d="${d}"/>`;

const glyphDefs = [...glyphIds].map(([ch, id]) => `<path id="${id}" d="${glyphPath(ch)}"/>`).join('');

const TITLE = 'ULTRA-SATISFACTORY: the sysop\'s waiting-for-caller dashboard';
const DESC = `A blue DOS bulletin-board operator screen. Top row: a ticking clock, the title ULTRA-SATISFACTORY Control Terminal, and the date, stuck at ${DATE}. `
  + 'Below it ULTRA SATISFACTORY in tall block capitals, cyan and white, and the pitch: Satisfactory companion, every recipe, building and objective, one click apart. '
  + 'Four framed panels of right-aligned numbers. System Totals: 140 items, 211 recipes, 88 alternates, 477 buildings, 9 machines, 5 phases, 3 tabs, 1 click apart, 0 paywalls, price free. '
  + 'Buildings by type: 333 structure, 59 logistics, 26 decor, 15 power, 14 transit, 9 machines, 7 special, 7 storage, 7 extraction, total 477. '
  + 'Output per minute: Iron Ingot 30, Iron Plate 20, Iron Rod 15, Screw 40, Wire 30, Cable 30, Steel Ingot 45, Rotor 4, Modular Frame 2, Nuclear Pasta 0.5. '
  + 'Other Info: version 0.0.1, Apache 2.0, Python 3.10+, port 8501, sysop ' + SYSOP + ', a calls counter, a ticking uptime, spaghetti yes, screws lots, and Fuse BLOWN in red. '
  + `A black Modem window whose init string is the quick start (${CMD1}, then ${CMD2}, OK ${LOCAL}), with a row of modem lamps, `
  + 'and a Last Caller window showing who dialled in and which recipe they looked up. Every twenty seconds the modem rings, a Pioneer connects, looks something up, and hangs up for a silly reason. '
  + 'Then a grid of bracketed hotkeys (Objectives, Items, Buildings, Run locally, Live in browser and some less useful ones) and a status bar: '
  + 'no install at lukexyz.github.io/ULTRA-SATISFACTORY, unofficial fan project.';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VBW} ${VBH}" width="${VBW}" height="${VBH}" shape-rendering="crispEdges" role="img" aria-labelledby="t d">
<title id="t">${TITLE}</title>
<desc id="d">${DESC}</desc>
<style>${css.join('\n')}</style>
<defs>${glyphDefs}${defs.join('')}<clipPath id="scr"><rect width="${SW}" height="${SH}"/></clipPath></defs>
<rect x=".5" y=".5" width="${VBW - 1}" height="${VBH - 1}" rx="10" fill="#000" stroke="#2a2a3c"/>
<g transform="translate(${PAD} ${PAD})" clip-path="url(#scr)">
<rect class="c1" width="${SW}" height="${SH}"/>
${staticLayer}
${layers.join('\n')}
</g>
</svg>
`;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, svg);
console.log(`wrote ${path.relative(process.cwd(), OUT)} (${(svg.length / 1024).toFixed(1)} KB, ${glyphIds.size} glyphs)`);

// ---------------------------------------------------------------------------------------------
// The markdown. Everything that quotes the screen (the key grid, WFC.TXT, the caller log) is
// built from the same data as the picture.
// ---------------------------------------------------------------------------------------------
const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const rule = (n) => '─'.repeat(n);
function block(lines, max = 80) {
  return lines.map((l) => {
    const t = l.replace(/\s+$/, '');
    if (len(t.replace(/<[^>]+>/g, '').replace(/&(amp|lt|gt);/g, '&')) > max) throw new Error(`markdown line over ${max} columns: ${t}`);
    return t;
  }).join('\n');
}

// The key grid as text: the two rows that are real navigation, linked. (The other two rows are
// on the screen above and in WFC.TXT; they go nowhere in any format.)
const keyGrid = block([
  `${rule(2)} Sysop keys ${rule(65)}`,
  ...KEYS.filter((row) => row.every(([, href]) => href)).map((row) => ' ' + row.map(([word, href], i) => {
    const pad = ' '.repeat(Math.max(0, (i + 1 < KEY_COLS.length ? KEY_COLS[i + 1] - KEY_COLS[i] : 0) - len(word)));
    return `<a href="${href}">${esc(word)}</a>${pad}`;
  }).join('')),
  rule(79),
  ` ${IDLE} . . .  (a README has no keys. These are links.)`,
]);

// WFC.TXT: the screen at rest. The block-letter logo needs solid stacked half blocks, which a
// code block cannot draw cleanly, so it is swapped for a spaced-out title.
const screenText = (() => {
  const rows = txt.map((row) => row.join('').replace(/\s+$/, ''));
  const name = 'U L T R A   S A T I S F A C T O R Y';
  const logo = ' '.repeat(centre(len(name))) + name;
  return block([rows[R.title], '', logo, '', ...rows.slice(R.tag)]);
})();

// SYSOP.LOG: the boot, then the five calls that ended just before the screen above starts, timed from the same
// clock, call interval and counter as the animation, so the log and the picture agree.
const sysopLog = (() => {
  const pad = (t, n) => t + ' '.repeat(Math.max(1, n - len(t)));
  const dot = (t, n) => `${t} ${'.'.repeat(Math.max(2, n - len(t) - 1))} `;
  const two = (n) => String(n).padStart(2, '0');
  const clock = (t) => { const v = Math.floor(CLOCK0 + t); return `${two(Math.floor(v / 3600) % 24)}:${two(Math.floor(v / 60) % 60)}:${two(v % 60)}`; };
  const entry = (t, tag, what) => ` ${clock(t)} ${pad(tag, 9)}${what}`;
  const calls = CALLERS.flatMap((p, i) => {
    const t0 = (i - CALLERS.length) * CALL;                      // this call's slot, before t = 0
    const recipe = `${p.rate}, ${p.cycle} cycle`;
    const told = p.asked === p.machine
      ? [entry(t0 + T.connect + 3, 'TOLD', `${p.machine} makes ${p.got}: ${recipe}, ${p.mw}`)]
      : [
        ...(p.asked === p.got ? [] : [entry(t0 + T.connect + 1, 'TOLD', `on the ${p.where.replace('> ', '')} list: ${p.asked}`)]),
        entry(t0 + T.connect + 3, 'TOLD', `${p.got}: ${recipe}, ${p.machine}${p.mw ? `, ${p.mw}` : ''}`),
      ];
    return [
      entry(t0 + T.connect, 'CONNECT', `${pad(p.who, 17)}${p.tab} ${p.where}`),
      ...told,
      entry(t0 + T.hangup, 'HANGUP', `call ${CALLS0 - CALLERS.length + 1 + i}. Reason: ${p.bye}`),
    ];
  });
  const title = ' SYSOP.LOG', name = 'ULTRA-SATISFACTORY', who = `SysOp: ${SYSOP}`;
  const mid = centre(len(name));
  const lines = [
    `${pad(title, mid)}${name}${' '.repeat(COLS - 1 - mid - len(name) - len(who))}${who}`,
    ` ${rule(78)}`,
    '',
    ' THE SHIFT SO FAR (every answer is the app\'s own data, standard recipes)',
    entry(-UP0, 'BOOT', `date says ${DATE.slice(4)} again. Somebody buy a clock battery.`),
    ` ${'.'.repeat(8)} ${' '.repeat(9)}${CALLS0 - CALLERS.length} calls not shown. Most of them were about screws.`,
    ...calls,
    '',
    ' MAIL WAITING: 5 (all from the Space Elevator, all marked urgent)',
    '  Phase 1  Automation basics',
    '           Smart Plating x50, Versatile Framework x100, Automated Wiring x500',
    '  Phase 2  Logistics & steel',
    '           Automated Wiring x500, Modular Frame x500, Smart Plating x100,',
    '           Versatile Framework x500',
    '  Phase 3  Oil & computers',
    '           Versatile Framework x2500, Modular Engine x500,',
    '           Adaptive Control Unit x100',
    '  Phase 4  Nuclear & endgame',
    '           Assembly Director System x1000, Magnetic Field Generator x500,',
    '           Nuclear Pasta x100, Thermal Propulsion Rocket x25',
    '  Phase 5  Alien tech & quantum',
    '           Biochemical Sculptor x500, AI Expansion Server x100,',
    '           Neural-Quantum Processor x100, Ballistic Warp Drive x100',
    '',
    ' BULLETIN 1: STANDING ORDERS',
    '  1. Manifold people and load-balancer people get separate nodes.',
    '     There is one node. Work it out between you.',
    '  2. The fuse may only blow during a Space Elevator delivery. It knows this.',
    '  3. A pipe through a wall is a design decision once nobody mentions it.',
    '  4. Overclocking is approved. Asking where the power comes from is not.',
    '  5. The "temporary" belt is load-bearing now. Do not touch it.',
    '     Do not look at it.',
    '  6. A machine is only ever starved of the one input you did not check.',
    '  7. Callers who say their factory is tidy will be asked for screenshots.',
    '  8. Nobody needs that many screws. Keep making screws.',
    '',
    ' THANKS',
    `  ${dot('Game data', 14)}greeny/SatisfactoryTools`,
    `  ${dot('Images', 14)}the Satisfactory Wiki (CC BY-NC-SA 4.0)`,
    `  ${dot('Code', 14)}Apache 2.0. Price: free. Paywalls: 0.`,
    `  ${dot('Small print', 14)}unofficial fan project, not affiliated with`,
    `  ${' '.repeat(15)}Coffee Stain Studios. The game is theirs.`,
    `  ${' '.repeat(15)}The spaghetti is yours.`,
    '',
    ` ${rule(78)}`,
    ' End of log. The board is up. The fuse is not.',
  ];
  return block(lines);
})();

const ALT = 'ULTRA-SATISFACTORY drawn as a DOS bulletin board\'s waiting-for-caller screen, the blue status dashboard only the sysop ever saw. '
  + `Top row: a ticking clock, the title ULTRA-SATISFACTORY Control Terminal, and a date stuck at ${DATE}. Under it, ULTRA SATISFACTORY in tall block capitals and the pitch: `
  + 'every recipe, building and objective, one click apart. Four framed panels hold the app\'s real numbers. System Totals: 140 items, 211 recipes, 88 alternates, 477 buildings, '
  + '9 machines, 5 phases, 3 tabs. Buildings by type, from 333 structure pieces down to 7 each for special, storage and extraction. '
  + 'Output per minute for ten standard recipes, from Steel Ingot at 45 down to Nuclear Pasta at 0.5. '
  + `Other Info: version 0.0.1, Apache 2.0, Python 3.10+, port 8501, sysop ${SYSOP}, a calls counter, a ticking uptime, and Fuse: BLOWN in red. `
  + `Below, a black Modem window whose init string is the quick start (${CMD1}, then ${CMD2}), and a Last Caller window. `
  + 'Every twenty seconds the modem rings, a Pioneer connects, looks something up and hangs up for a silly reason. A grid of bracketed hotkeys and a status bar with the live URL finish the screen.';

const md = `<!-- Header ${SLUG} for ULTRA-SATISFACTORY. Generated by src/${SLUG}.mjs: edit that, not this. -->

<p align="center">
  <img src="assets/${SLUG}.svg" width="${VBW}" alt="${ALT}">
</p>

⚡ **ULTRA-SATISFACTORY** is a companion app for the factory-building game *Satisfactory*: every recipe, building and Space Elevator objective, one click apart. You keep it open next to the game (second monitor, phone, or a quick alt-tab) and look things up while the machines wait. The screen above is its back office, the console only the sysop sees, and the counts in the panels are the app's own: 140 items, 211 recipes (88 of them alternates), 477 buildings, 5 Space Elevator phases. The fuse is decorative. It is also blown.

⚡ Callers get three tabs. **Objectives**: pick a Space Elevator phase, see the parts it wants and how many. **Items**: search as you type, and every recipe card shows per-minute rates, the machine, its cycle time and its power draw. **Buildings**: every building and what it makes, grouped by tier, with Mk-by-Mk upgrade paths. Click an ingredient, a product or a machine and you land on its page. Nobody has to page the sysop.

⚡ The init string in the Modem window is the entire install: two commands, Python 3.10+, run from the repo root. Or never dial in at all: it runs [live in your browser](${LIVE}) with nothing to install. This is an unofficial fan project, not affiliated with Coffee Stain Studios.

\`\`\`sh
${CMD1}
${CMD2}     # OK  ${LOCAL}
\`\`\`

<pre>
${keyGrid}
</pre>

<details>
<summary>⚡ <b>WFC.TXT</b> · the same screen in plain text, for callers on a slow line</summary>

\`\`\`text
${screenText}
\`\`\`

</details>

<details>
<summary>⚡ <b>SYSOP.LOG</b> · the shift so far, the mail from the Space Elevator, standing orders, thanks</summary>

\`\`\`text
${sysopLog}
\`\`\`

</details>
`;
const MD = path.join(HERE, '..', `${SLUG}.md`);
fs.writeFileSync(MD, md);
console.log(`wrote ${path.relative(process.cwd(), MD)}`);
