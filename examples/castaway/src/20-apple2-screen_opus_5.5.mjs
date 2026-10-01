#!/usr/bin/env node
// 20-apple2-screen_opus_5.5: the "Apple II Title Screen" README header for
// CASTAWAY (catalogue entry demo-11: early-80s Apple II title and credit
// screens with six-colour hi-res panels and 40-column credits).
//
// Everything is drawn on a model of the real hi-res page, because the rules
// are the look:
//   * 280 x 192 dots, stored as 40 bytes of 7 dots per row;
//   * one spare bit per byte (the "high bit") picks the palette for those 7
//     dots: green/violet, or orange/blue;
//   * a colour only shows on alternate dots (violet and blue on even columns,
//     green and orange on odd ones), so colour detail is 140 across;
//   * the picture is then decoded the way a colour TV decodes it: the dots
//     are laid out as a 560-sample signal and every sample is coloured by the
//     four samples around it. Runs of dots come out white, lone dots come out
//     coloured, and every white edge picks up a green or violet fringe.
//     Nothing here hand-paints a fringe: they all fall out of the decoder.
//
// Two images:
//   assets/<slug>.svg        the title screen: CASTAWAY in block capitals, a
//                            hi-res picture of the island and four lines of
//                            40-column credits underneath (mixed mode).
//                            One 60-second loop, 20 bars of 3 seconds, every
//                            change a hard cut on the beat, nothing tweened:
//                            she nods, sips a coconut while a ship sails past
//                            behind her in one-byte steps, then waves at the
//                            empty sea. The credit lines change on the bar.
//   assets/<slug>-page2.svg  the credits page: stacked panels in thick
//                            frames of solid colour, one blinking cursor.
//
// No <text>, no fonts, nothing external: lettering comes from the bitmap
// fonts in this file. Motion is CSS keyframes with step-end timing. Output is
// deterministic (a seeded PRNG places the wave dashes).
//
//   node 20-apple2-screen_opus_5.5.mjs          write both SVGs
//   node 20-apple2-screen_opus_5.5.mjs --dump   also print the picture as text

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '20-apple2-screen_opus_5.5';
const OUT_MAIN = path.join(HERE, '..', 'assets', `${SLUG}.svg`);
const OUT_PAGE2 = path.join(HERE, '..', 'assets', `${SLUG}-page2.svg`);

// ================================================================ the machine
const W = 280, H = 192, NS = 560;       // dots, lines, samples per line
const HEX = { k: '#000000', w: '#ffffff', g: '#2ed13a', v: '#d43de8', o: '#f26a1b', b: '#2a8cf0' };
const GROUP = { g: 0, v: 0, o: 1, b: 1 };       // the high bit each colour needs
const ODD = { g: 1, o: 1, v: 0, b: 0 };         // the dot parity each colour needs
const PAIR = ['v', 'b', 'g', 'o'];              // two lit samples starting at phase 0..3

const mod = (a, n) => ((a % n) + n) % n;

// A "paint" is what the artist wants: one of k w g v o b per dot. The encoder
// turns it into what the machine can hold: bits plus one high bit per byte.
const blankPaint = () => Array.from({ length: H }, () => new Array(W).fill('k'));

function encodeRow(row) {
  const hb = new Int8Array(40).fill(-1);
  for (let B = 0; B < 40; B++) {
    let ob = 0, gv = 0;
    for (let i = 0; i < 7; i++) {
      const c = row[B * 7 + i];
      if (c === 'o' || c === 'b') ob++; else if (c === 'g' || c === 'v') gv++;
    }
    if (ob || gv) hb[B] = ob > gv ? 1 : 0;
  }
  // bytes with no colour in them follow their neighbours, so white runs do not
  // pick up a half-dot glitch where the palette bit would change
  let last = -1;
  for (let B = 0; B < 40; B++) { if (hb[B] >= 0) last = hb[B]; else if (last >= 0) hb[B] = last; }
  let next = 0;
  for (let B = 39; B >= 0; B--) { if (hb[B] >= 0) next = hb[B]; else hb[B] = next; }
  const bits = new Uint8Array(W);
  for (let x = 0; x < W; x++) {
    const c = row[x], h = hb[(x / 7) | 0];
    if (c === 'w') bits[x] = 1;
    else if (c in GROUP) bits[x] = GROUP[c] === h && (x & 1) === ODD[c] ? 1 : 0;   // the wrong palette for this byte: the artist leaves it black
  }
  return { bits, hb };
}

// The colour-TV decode: each dot is two samples (shifted one sample right when
// its byte's high bit is set); each sample takes its colour from a window of
// four. Three or four lit: white. Two lit next to each other (round the colour
// wheel): the hi-res colour for that phase. Otherwise black.
function decodeRow({ bits, hb }) {
  const s = new Uint8Array(NS + 6);
  for (let x = 0; x < W; x++) if (bits[x]) { const o = 2 * x + hb[(x / 7) | 0] + 1; s[o] = 1; s[o + 1] = 1; }
  const out = new Array(NS);
  for (let n = 0; n < NS; n++) {
    const w0 = s[n], w1 = s[n + 1], w2 = s[n + 2], w3 = s[n + 3];    // samples n-1 .. n+2
    const cnt = w0 + w1 + w2 + w3;
    if (cnt >= 3) { out[n] = 'w'; continue; }
    if (cnt < 2) { out[n] = 'k'; continue; }
    const on = [w0, w1, w2, w3].map((v, i) => (v ? i : -1)).filter((i) => i >= 0);
    const d = on[1] - on[0];
    if (d === 2) out[n] = 'k';
    else out[n] = PAIR[mod(n - 1 + (d === 1 ? on[0] : on[1]), 4)];
  }
  return out;
}

const render = (paint) => paint.map((row) => decodeRow(encodeRow(row)));

// ================================================================ painting helpers
// A colour can be a letter or a function (x, y) -> letter, for dithers.
const at = (c, x, y) => (typeof c === 'function' ? c(x, y) : c);
function put(p, x, y, c) {
  x = Math.round(x); y = Math.round(y);
  if (x < 0 || x >= W || y < 0 || y >= H) return;
  const v = at(c, x, y);
  if (v) p[y][x] = v;
}
const rect = (p, x0, y0, x1, y1, c) => { for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) put(p, x, y, c); };
function ellipse(p, cx, cy, rx, ry, c) {
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
    const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry;
    if (dx * dx + dy * dy <= 1) put(p, x, y, c);
  }
}
// rows of characters; `map` gives the colour for each character ('.' = leave alone)
function stamp(p, x0, y0, rows, map, xscale = 1) {
  rows.forEach((row, j) => [...row].forEach((ch, i) => {
    if (ch === '.' || ch === ' ') return;
    const c = map[ch];
    if (c === undefined) throw new Error(`no colour for "${ch}"`);
    for (let k = 0; k < xscale; k++) put(p, x0 + i * xscale + k, y0 + j, c);
  }));
}
// dithers, on the 2-dot colour pixel grid
const checker = (a, b) => (x, y) => (((x >> 1) + y) & 1 ? b : a);
const lines = (a, b) => (x, y) => (y & 1 ? b : a);

// seeded PRNG (mulberry32)
function prng(seed) {
  let t = seed >>> 0;
  return () => { t = (t + 0x6d2b79f5) >>> 0; let r = Math.imul(t ^ (t >>> 15), 1 | t); r ^= r + Math.imul(r ^ (r >>> 7), 61 | r); return ((r ^ (r >>> 14)) >>> 0) / 4294967296; };
}

// ================================================================ the 7x8 hi-res font
// An original bold face for hi-res credit text: five dots wide in a seven-dot
// cell, two-dot stems, so strokes decode white with fringes, and the one-dot
// counters decode as a streak of colour (violet or green by column), as text
// drawn on a hi-res page does on a colour set. Columns 0 and 6 stay empty, so
// every glyph decodes the same wherever it sits: they are drawn once and reused.
const FONT_SRC = {
  A: ['.###.', '##.##', '##.##', '#####', '##.##', '##.##', '##.##'],
  B: ['####.', '##.##', '##.##', '####.', '##.##', '##.##', '####.'],
  C: ['.####', '##...', '##...', '##...', '##...', '##...', '.####'],
  D: ['####.', '##.##', '##.##', '##.##', '##.##', '##.##', '####.'],
  E: ['#####', '##...', '##...', '####.', '##...', '##...', '#####'],
  F: ['#####', '##...', '##...', '####.', '##...', '##...', '##...'],
  G: ['.####', '##...', '##...', '##.##', '##.##', '##.##', '.####'],
  H: ['##.##', '##.##', '##.##', '#####', '##.##', '##.##', '##.##'],
  I: ['####.', '.##..', '.##..', '.##..', '.##..', '.##..', '####.'],
  J: ['..###', '...##', '...##', '...##', '...##', '##.##', '.###.'],
  K: ['##.##', '##.##', '####.', '###..', '####.', '##.##', '##.##'],
  L: ['##...', '##...', '##...', '##...', '##...', '##...', '#####'],
  M: ['#...#', '##.##', '#####', '#####', '##.##', '##.##', '##.##'],
  // N cannot have a diagonal and two 2-dot stems in five dots, so the white
  // diagonal runs corner to corner and the stems thin to one dot where it
  // passes: those single dots decode as colour, the way thin strokes did.
  N: ['##..#', '###.#', '###.#', '#####', '#.###', '#.###', '#..##'],
  O: ['.###.', '##.##', '##.##', '##.##', '##.##', '##.##', '.###.'],
  P: ['####.', '##.##', '##.##', '####.', '##...', '##...', '##...'],
  Q: ['.###.', '##.##', '##.##', '##.##', '##.##', '##.#.', '.##.#'],
  R: ['####.', '##.##', '##.##', '####.', '####.', '##.##', '##.##'],
  S: ['.####', '##...', '##...', '.###.', '...##', '...##', '####.'],
  T: ['#####', '.##..', '.##..', '.##..', '.##..', '.##..', '.##..'],
  U: ['##.##', '##.##', '##.##', '##.##', '##.##', '##.##', '.###.'],
  V: ['##.##', '##.##', '##.##', '##.##', '##.##', '.###.', '..#..'],
  W: ['##.##', '##.##', '##.##', '##.##', '#####', '#####', '.#.#.'],
  X: ['##.##', '##.##', '.###.', '..#..', '.###.', '##.##', '##.##'],
  Y: ['##.##', '##.##', '##.##', '.###.', '.##..', '.##..', '.##..'],
  Z: ['#####', '...##', '..##.', '.##..', '##...', '##...', '#####'],
  0: ['.###.', '##.##', '##.##', '##.##', '##.##', '##.##', '.###.'],
  1: ['.##..', '###..', '.##..', '.##..', '.##..', '.##..', '####.'],
  2: ['.###.', '##.##', '...##', '..##.', '.##..', '##...', '#####'],
  3: ['####.', '...##', '...##', '.###.', '...##', '...##', '####.'],
  4: ['...##', '..###', '.####', '##.##', '#####', '...##', '...##'],
  5: ['#####', '##...', '####.', '...##', '...##', '##.##', '.###.'],
  6: ['.###.', '##...', '##...', '####.', '##.##', '##.##', '.###.'],
  7: ['#####', '...##', '..##.', '.##..', '.##..', '.##..', '.##..'],
  8: ['.###.', '##.##', '##.##', '.###.', '##.##', '##.##', '.###.'],
  9: ['.###.', '##.##', '##.##', '.####', '...##', '..##.', '.##..'],
  '.': ['.....', '.....', '.....', '.....', '.....', '.##..', '.##..'],
  ',': ['.....', '.....', '.....', '.....', '.....', '.##..', '.##..', '##...'],
  ':': ['.....', '.##..', '.##..', '.....', '.##..', '.##..', '.....'],
  '-': ['.....', '.....', '.....', '####.', '.....', '.....', '.....'],
  '/': ['...##', '...##', '..##.', '.##..', '##...', '##...', '.....'],
  '(': ['..##.', '.##..', '##...', '##...', '##...', '.##..', '..##.'],
  ')': ['.##..', '..##.', '...##', '...##', '...##', '..##.', '.##..'],
  '!': ['.##..', '.##..', '.##..', '.##..', '.##..', '.....', '.##..'],
  '?': ['####.', '...##', '...##', '..##.', '.##..', '.....', '.##..'],
  "'": ['.##..', '.##..', '##...', '.....', '.....', '.....', '.....'],
  ']': ['####.', '..##.', '..##.', '..##.', '..##.', '..##.', '####.'],
  '=': ['.....', '.....', '#####', '.....', '#####', '.....', '.....'],
  '+': ['.....', '.##..', '.##..', '#####', '.##..', '.##..', '.....'],
  '>': ['##...', '.##..', '..##.', '...##', '..##.', '.##..', '##...'],
  '*': ['.....', '##.##', '.###.', '#####', '.###.', '##.##', '.....'],
  _: ['.....', '.....', '.....', '.....', '.....', '.....', '#####'],
  '#': ['#####', '#####', '#####', '#####', '#####', '#####', '#####', '#####'],   // the cursor: a whole cell
};
const glyphRows = (ch) => {
  const g = FONT_SRC[ch];
  if (!g) throw new Error(`no glyph for "${ch}"`);
  return ch === '#' ? g.map(() => '#######') : g.map((r) => `.${r}.`);
};

// ================================================================ the CASTAWAY letters
// Block capitals for the title, drawn on the 2-dot colour-pixel grid: 15 wide,
// 20 tall, so each is 30 dots by 40 lines and sits in its own 5 bytes. That
// matters: a byte can hold only one palette, so letters in their own bytes can
// each take any of the four colours without a clash.
const BIG = {
  C: [
    '..###########..', '.#############.', '###############', '###############',
    '#####.....#####', '#####.....#####', '#####..........', '#####..........',
    '#####..........', '#####..........', '#####..........', '#####..........',
    '#####..........', '#####..........', '#####.....#####', '#####.....#####',
    '###############', '###############', '.#############.', '..###########..'],
  A: [
    '..###########..', '.#############.', '###############', '###############',
    '#####.....#####', '#####.....#####', '#####.....#####', '#####.....#####',
    '###############', '###############', '###############', '###############',
    '#####.....#####', '#####.....#####', '#####.....#####', '#####.....#####',
    '#####.....#####', '#####.....#####', '#####.....#####', '#####.....#####'],
  S: [
    '..###########..', '.#############.', '###############', '###############',
    '#####.....#####', '#####.....#####', '#####..........', '#####..........',
    '.#############.', '###############', '###############', '.#############.',
    '..........#####', '..........#####', '#####.....#####', '#####.....#####',
    '###############', '###############', '.#############.', '..###########..'],
  T: [
    '###############', '###############', '###############', '###############',
    '.....#####.....', '.....#####.....', '.....#####.....', '.....#####.....',
    '.....#####.....', '.....#####.....', '.....#####.....', '.....#####.....',
    '.....#####.....', '.....#####.....', '.....#####.....', '.....#####.....',
    '.....#####.....', '.....#####.....', '.....#####.....', '.....#####.....'],
  W: [
    '#####.....#####', '#####.....#####', '#####.....#####', '#####.....#####',
    '#####.....#####', '#####.....#####', '#####.....#####', '#####.....#####',
    '#####.....#####', '#####.###.#####', '#####.###.#####', '#####.###.#####',
    '#####.###.#####', '#####.###.#####', '#####.###.#####', '###############',
    '###############', '###############', '.######.######.', '..####...####..'],
  Y: [
    '#####.....#####', '#####.....#####', '#####.....#####', '#####.....#####',
    '#####.....#####', '#####.....#####', '######...######', '.######.######.',
    '..###########..', '...#########...', '....#######....', '.....#####.....',
    '.....#####.....', '.....#####.....', '.....#####.....', '.....#####.....',
    '.....#####.....', '.....#####.....', '.....#####.....', '.....#####.....'],
};
const SHADOW = { o: 'b', b: 'o', g: 'v', v: 'g' };     // a darker partner from the same palette

function bigWord(p, word, y0, colours) {
  [...word].forEach((ch, i) => {
    const x0 = i * 35 + 2;                         // 5 bytes per letter, 40 bytes in all
    const fill = colours[i];
    const rows = BIG[ch];
    // the shadow first, one colour pixel right and one down
    rows.forEach((r, j) => [...r].forEach((c, k) => { if (c === '#') rect(p, x0 + k * 2 + 2, y0 + j * 2 + 2, x0 + k * 2 + 4, y0 + j * 2 + 4, SHADOW[fill]); }));
    rows.forEach((r, j) => [...r].forEach((c, k) => { if (c === '#') rect(p, x0 + k * 2, y0 + j * 2, x0 + k * 2 + 2, y0 + j * 2 + 2, fill); }));
    // a white glint along the top edge of the top bar
    rows.forEach((r, j) => [...r].forEach((c, k) => {
      if (c === '#' && (j === 0 || rows[j - 1][k] !== '#') && j < 2) rect(p, x0 + k * 2, y0 + j * 2, x0 + k * 2 + 2, y0 + j * 2 + 1, 'w');
    }));
  });
}

// ================================================================ SVG helpers
const css = [];
const defs = [];
const num = (v) => String(+(+v).toFixed(3));
const escXml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Horizontal runs of matching samples, merged downwards into rectangles.
function rectPath(test, x0, y0, x1, y1, dx = 0, dy = 0) {
  let open = new Map();
  const done = [];
  for (let y = y0; y <= y1; y++) {
    const next = new Map();
    if (y < y1) {
      for (let x = x0; x < x1;) {
        if (!test(x, y)) { x++; continue; }
        let e = x;
        while (e < x1 && test(e, y)) e++;
        const key = `${x},${e - x}`;
        const prev = open.get(key);
        if (prev) { prev.h++; next.set(key, prev); open.delete(key); } else next.set(key, { x, y, w: e - x, h: 1 });
        x = e;
      }
    }
    for (const r of open.values()) done.push(r);
    open = next;
  }
  done.sort((a, b) => a.y - b.y || a.x - b.x);
  return done.map((r) => `M${r.x - dx} ${r.y - dy}h${r.w}v${r.h}h${-r.w}z`).join('');
}

// Paths for a grid of decoded samples. `pick(n, y)` returns the colour to draw
// there, or null for nothing.
function gridPaths(pick, n0, y0, n1, y1, dx = 0, dy = 0) {
  const cols = new Set();
  for (let y = y0; y < y1; y++) for (let n = n0; n < n1; n++) { const c = pick(n, y); if (c) cols.add(c); }
  return [...cols].sort().map((c) => {
    const d = rectPath((n, y) => pick(n, y) === c, n0, y0, n1, y1, dx, dy);
    return d ? `<path fill="${HEX[c]}" d="${d}"/>` : '';
  }).join('');
}

// ---- glyphs: decoded once per colour and column parity, then reused
const glyphIds = new Map();
function glyphId(ch, colour, parity) {
  const key = `${ch}|${colour}|${parity}`;
  if (glyphIds.has(key)) return glyphIds.get(key);
  const id = `t${glyphIds.size.toString(36)}`;
  glyphIds.set(key, id);
  const p = blankPaint();
  const x0 = parity ? 7 : 14;           // a cell with an even (14) or odd (7) byte index
  stamp(p, x0, 0, glyphRows(ch), { '#': colour });
  const g = render(p.slice(0, 8));
  const n0 = 2 * x0 - 2, n1 = 2 * x0 + 16;
  defs.push(`<g id="${id}">${gridPaths((n, y) => (g[y][n] === 'k' ? null : g[y][n]), n0, 0, n1, 8, 2 * x0, 0)}</g>`);
  return id;
}
// <use> elements for a line of text at text column `col` and screen line `y`
function textUses(str, col, y, colour = 'w') {
  const out = [];
  [...str].forEach((ch, i) => {
    if (ch === ' ') return;
    const c = col + i;
    out.push(`<use href="#${glyphId(ch, colour, c & 1)}" x="${c * 14}" y="${y}"/>`);
  });
  return out.join('');
}
const centreCol = (str) => Math.floor((40 - str.length) / 2);

// ---- timeline: 60 seconds, 20 bars of 3 s, 160 half-beat slots of 0.375 s
const LOOP = 60, SLOTS = 160, SLOTS_PER_BAR = 8;
const schedules = new Map();
// a class whose element is visible in exactly the given slots
function visClass(slots) {
  const on = new Array(SLOTS).fill(false);
  for (const s of slots) on[mod(s, SLOTS)] = true;
  const key = on.map((v) => (v ? 1 : 0)).join('');
  if (schedules.has(key)) return schedules.get(key);
  const id = `v${schedules.size.toString(36)}`;
  schedules.set(key, { id, first: on[0] });
  let kf = '', prev = null;
  on.forEach((v, i) => { if (v !== prev) { kf += `${num((i / SLOTS) * 100)}%{opacity:${v ? 1 : 0}}`; prev = v; } });
  kf += `100%{opacity:${on[SLOTS - 1] ? 1 : 0}}`;
  css.push(`@keyframes ${id}{${kf}}.${id}{animation:${id} ${LOOP}s step-end infinite}`);
  return schedules.get(key);
}
const range = (a, b) => Array.from({ length: b - a }, (_, i) => a + i);
const animated = (slots, inner) => {
  const v = visClass(slots);
  return `<g class="an ${v.id}"${v.first ? '' : ' opacity="0"'}>${inner}</g>`;
};

// ================================================================ main screen
// Lines 0-61: the title. Lines 62-159: the picture. Lines 160-191: four lines
// of text, where mixed mode puts them.
const PIC_TOP = 62, HORIZON = 102, PIC_BOT = 160;

const SEA_DEEP = lines('b', 'k');
// sand: orange with a scatter of pale grains (hashed, so it is the same every run)
const grain = (x, y) => { let h = Math.imul((x >> 1) * 374761393 + y * 668265263, 1274126177); h ^= h >>> 13; return (h >>> 0) % 23; };
const SAND_TOP = (x, y) => (grain(x, y) === 0 ? 'w' : 'o');
const ISLAND = { cx: 116, cy: 146, rx: 66, ry: 8 };
const inPic = (y) => y >= PIC_TOP && y < PIC_BOT;
const clipPic = (c) => (x, y) => (inPic(y) ? at(c, x, y) : null);

// ---- her: drawn dot by dot, 20 dots wide and 36 lines tall. Rows 0-3 are
// room for raised arms, the head is rows 4-12 (a nod moves it down one line)
// and the body starts at row 13. White runs are kept two dots or wider so they
// decode white; a lone dot would come out as a streak of colour.
// Black hair in a low bun, cream headphones, coral (orange) tank top, cream
// (white) shorts, bare feet. Fully clothed, always.
const HER = { x: 72, y: 111 };
const HER_MAP = { k: 'k', w: 'w', o: 'o', g: 'g' };
const HEAD = [
  '......wwwwwwww......',
  '....wwkkkkkkkkww....',
  '...wwkkkkkkkkkkww...',
  '..wwwkkkkkkkkkkwww..',
  '..wwwkkwwwwwwkkwww..',
  '..wwwkkwwwwwwkkwww..',
  '.kkwwkkwwwwwwkkww...',
  '.kkk..kkwwwwkk......',
  '.........ww.........',
];
const LEGS = [
  '......ww....ww......',
  '......ww....ww......',
  '......ww....ww......',
  '......ww....ww......',
  '......ww....ww......',
  '......ww....ww......',
  '......ww....ww......',
  '.....www....www.....',
];
const SHORTS = [
  '......wwwwwwww......',
  '......wwwwwwww......',
  '......wwwwwwww......',
  '......www..www......',
];
const POSES = {
  // arms at her sides
  idle: { torso: [
    '...........ww.......',
    '......oooooooo......',
    '.....ooooooooooo....',
    '....wwoooooooooww...',
    '....wwoooooooooww...',
    '....wwoooooooooww...',
    '....wwoooooooooww...',
    '....wwoooooooooww...',
    '....ww.ooooooo.ww...',
    '....ww.........ww...',
  ] },
  // a coconut held up to her face, with a straw: eyes closed, very content
  sip: { face: [
    '......wwwwwwww......',
    '....wwkkkkkkkkww....',
    '...wwkkkkkkkkkkww...',
    '..wwwkkkkkkkkkkwww..',
    '..wwwkkwwwwwwkkwww..',
    '..wwwkkwwkggggkwww..',
    '.kkwwkkwkggggggkww..',
    '.kkk..kkggggggggwww.',
    '.......kggggggggwww.',
  ], torso: [
    '........kggggggkwww.',
    '......oookkkkkkwww..',
    '.....ooooooooooww...',
    '....wwoooooooooo....',
    '....wwooooooooo.....',
    '....wwooooooooo.....',
    '....wwooooooooo.....',
    '....wwooooooooo.....',
    '....ww.ooooooo......',
    '....ww..............',
  ] },
  // both arms up: waving for rescue at a sea with nothing on it
  waveA: { arms: [
    '..ww..........ww....',
    '..ww..........ww....',
    '..ww..........ww....',
    '...ww........ww.....',
  ], side: [
    '...ww.........ww....',
    '...ww.........ww....',
    '...ww..........ww...',
    '...ww..........ww...',
    '...ww..........ww...',
    '....ww.........ww...',
    '....ww.........ww...',
    '....ww........ww....',
    '....ww........ww....',
  ], torso: [
    '....ww.....ww.ww....',
    '.....woooooooww.....',
    '.....ooooooooooo....',
    '......oooooooooo....',
    '......oooooooooo....',
    '......oooooooooo....',
    '......oooooooooo....',
    '......oooooooooo....',
    '.......ooooooo......',
    '....................',
  ] },
  waveB: { arms: [
    'ww..............ww..',
    'ww..............ww..',
    '.ww............ww...',
    '.ww............ww...',
  ], side: [
    '..ww..........ww....',
    '..ww...........ww...',
    '...ww..........ww...',
    '...ww..........ww...',
    '...ww..........ww...',
    '....ww.........ww...',
    '....ww.........ww...',
    '....ww........ww....',
    '....ww........ww....',
  ], torso: [
    '....ww.....ww.ww....',
    '.....woooooooww.....',
    '.....ooooooooooo....',
    '......oooooooooo....',
    '......oooooooooo....',
    '......oooooooooo....',
    '......oooooooooo....',
    '......oooooooooo....',
    '.......ooooooo......',
    '....................',
  ] },
};
function paintHer(p, pose, nod) {
  const P = POSES[pose];
  const x = HER.x, y = HER.y;
  stamp(p, x, y + 13, P.torso, HER_MAP);
  stamp(p, x, y + 22, SHORTS, HER_MAP);
  stamp(p, x, y + 26, LEGS, HER_MAP);
  if (P.arms) stamp(p, x, y, P.arms, HER_MAP);
  stamp(p, x, y + 4 + (nod ? 1 : 0), P.face || HEAD, HER_MAP);
  if (P.side) stamp(p, x, y + 4, P.side, HER_MAP);
}

// ---- the raft: four logs, two ropes
function paintRaft(p, up) {
  const x0 = 202, y0 = 141 - (up ? 1 : 0);
  for (let i = 0; i < 4; i++) {
    const y = y0 + i * 3, xs = x0 - i * 2, xe = x0 + 40 - i * 2;
    rect(p, xs + 1, y, xe - 1, y + 1, 'o');
    rect(p, xs, y + 1, xe, y + 2, 'o');
    rect(p, xs, y + 2, xe, y + 3, 'k');
    rect(p, xe - 2, y, xe, y + 2, 'w');               // the cut ends of the logs
  }
  for (const rx of [x0 + 5, x0 + 29]) for (let i = 0; i < 4; i++) rect(p, rx - i * 2, y0 + i * 3, rx - i * 2 + 2, y0 + i * 3 + 2, 'w');
}

// ---- the ship: a little steamer, bow to the left
const SHIP = [
  '.................kk..kk.k...........',
  '...............kkkkkk..kk...........',
  '...............kkoooookk............',
  '...............kkoooookk............',
  '...............kkkkkkkkk............',
  '.........kkkkkkkkkkkkkkkkkkkk.......',
  '.........kkwwwwwwwwwwwwwwwwkk.......',
  '.........kkwwkkwwkkwwkkwwwwkk.......',
  '.....kkkkkkwwwwwwwwwwwwwwwwkkkkkk...',
  'kkk..kkwwwwwwwwwwwwwwwwwwwwwwwwkk...',
  'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
  '.kkooooooooooooooooooooooooooooookk.',
  '..kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk..',
];
const SHIP_W = 36, SHIP_TOP = HORIZON - SHIP.length;

// ---- the whole picture, for one state of everything that moves
const BASE_STATE = { pose: 'idle', nod: false, ship: null, raftUp: false, titleTurn: 0 };
const TITLE_COLOURS = ['o', 'g', 'v', 'b'];
function paintScreen(st) {
  const p = blankPaint();
  // sky, with haze lines near the horizon
  rect(p, 0, PIC_TOP, W, HORIZON, 'b');
  for (const y of [93, 97, 100]) rect(p, 0, y, W, y + 1, 'w');
  ellipse(p, 254, 74, 10, 10, 'o');
  ellipse(p, 254, 74, 7, 7, 'w');
  for (const [cx, cy, rx, ry] of [[24, 78, 10, 3], [36, 74, 11, 6], [50, 77, 10, 4], [38, 80, 18, 2], [92, 70, 7, 2], [100, 68, 7, 4], [108, 71, 6, 2]]) ellipse(p, cx, cy, rx, ry, 'w');
  // a cloud bank behind the palm's crown: white, like black, sits in both palettes, so green
  // fronds can sit on it without clashing with the blue sky's bytes
  for (const [cx, cy, rx, ry] of [[146, 92, 18, 8], [160, 84, 16, 11], [178, 78, 18, 13], [172, 69, 15, 8], [198, 84, 17, 10], [214, 92, 14, 7], [132, 97, 14, 4], [180, 97, 46, 4]]) ellipse(p, cx, cy, rx, ry, 'w');
  if (st.ship !== null) stamp(p, st.ship, SHIP_TOP, SHIP, { k: 'k', w: 'w', o: 'o' });
  // sea
  rect(p, 0, HORIZON, W, HORIZON + 1, 'w');
  rect(p, 0, HORIZON + 1, W, PIC_BOT, SEA_DEEP);
  ellipse(p, ISLAND.cx + 4, ISLAND.cy + 4, ISLAND.rx + 34, ISLAND.ry + 10, clipPic('b'));
  const rnd = prng(1992);
  for (let i = 0; i < 80; i++) {
    const y = HORIZON + 3 + Math.floor(rnd() * (PIC_BOT - HORIZON - 4));
    const near = (y - HORIZON) / (PIC_BOT - HORIZON);
    const len = 2 + Math.floor(rnd() * (3 + near * 9));
    const x = Math.floor(rnd() * (W - len));
    const dx = (x + len / 2 - ISLAND.cx - 4) / (ISLAND.rx + 38), dy = (y - ISLAND.cy - 4) / (ISLAND.ry + 12);
    if (dx * dx + dy * dy < 1) continue;
    rect(p, x, y, x + len, y + 1, 'w');
  }
  for (let a = 0; a < 360; a += 4) {
    const r = (a * Math.PI) / 180;
    const x = ISLAND.cx + Math.cos(r) * (ISLAND.rx + 7), y = ISLAND.cy + 1 + Math.sin(r) * (ISLAND.ry + 4);
    if ((a / 4) % 3 !== 2) rect(p, Math.round(x) - 2, Math.round(y), Math.round(x) + 2, Math.round(y) + 1, clipPic('w'));
  }
  paintRaft(p, st.raftUp);
  // the island
  ellipse(p, ISLAND.cx, ISLAND.cy + 2, ISLAND.rx + 2, ISLAND.ry + 1, clipPic(lines('o', 'k')));
  ellipse(p, ISLAND.cx, ISLAND.cy, ISLAND.rx, ISLAND.ry, SAND_TOP);
  for (const [cx, cy, rx, ry] of [[70, 154, 6, 3], [104, 156, 4, 2]]) {
    ellipse(p, cx, cy, rx, ry, clipPic('k'));
    ellipse(p, cx - 1, cy - 1, rx - 2, ry - 1, clipPic(checker('w', 'k')));
  }
  for (const [cx, cy, rx, ry] of [[118, 141, 12, 4], [131, 143, 9, 3], [104, 143, 7, 3], [178, 143, 8, 3]]) ellipse(p, cx, cy, rx, ry, 'g');
  // the palm
  const B = { x: 152, y: 146 }, C = { x: 172, y: 78 };
  for (let y = B.y; y >= C.y; y--) {
    const t = (B.y - y) / (B.y - C.y);
    const xc = B.x + (C.x - B.x) * Math.pow(t, 1.7);
    const w = 8 - 3.5 * t;
    rect(p, Math.round(xc - w / 2), y, Math.round(xc + w / 2), y + 1, 'o');
    if ((B.y - y) % 6 === 3) rect(p, Math.round(xc - w / 2), y, Math.round(xc + w / 6), y + 1, 'k');
  }
  // fronds: a drooping spine with leaflets hanging off it
  const fronds = [[-172, 34, 0.55], [-150, 30, 0.38], [-118, 17, 0.12], [-64, 17, 0.12], [-30, 30, 0.38], [-6, 36, 0.55], [158, 22, 0.75], [24, 24, 0.75]];
  for (const [deg, len, droop] of fronds) {
    const a = (deg * Math.PI) / 180, out = Math.cos(a) >= 0 ? 1 : -1;
    for (let s = 0; s <= len; s += 0.5) {
      const u = s / len;
      const x = C.x + Math.cos(a) * s, y = C.y + Math.sin(a) * s + droop * u * u * len;
      rect(p, Math.round(x) - 1, Math.round(y), Math.round(x) + 1, Math.round(y) + (u < 0.5 ? 2 : 1), 'g');
      if (s > 2 && Number.isInteger(s) && s % 2 === 0) {
        const leaf = Math.round(2 + 6 * Math.sin(Math.PI * Math.min(1, u * 1.1)));
        for (let k = 1; k <= leaf; k++) rect(p, Math.round(x - out * k * 0.45) - 1, Math.round(y + k), Math.round(x - out * k * 0.45) + 1, Math.round(y + k) + 1, 'g');
        for (let k = 1; k <= Math.min(2, leaf - 2); k++) rect(p, Math.round(x + out * k * 0.5) - 1, Math.round(y - k), Math.round(x + out * k * 0.5) + 1, Math.round(y - k) + 1, 'g');
      }
    }
  }
    paintHer(p, st.pose, st.nod);
  // the picture stops at its edges; the title goes on the black above it
  for (let y = 0; y < H; y++) if (!inPic(y)) p[y].fill('k');
  bigWord(p, 'CASTAWAY', 14, [...'CASTAWAY'].map((_, i) => TITLE_COLOURS[(i + st.titleTurn) % 4]));
  return p;
}

const base = render(paintScreen(BASE_STATE));

// ---- static layer: the far sea is a repeating pattern; everything else is
// drawn sample by sample, merged into rectangles, one path per colour
const isSea = (n, y) => y >= HORIZON + 1 && y < PIC_BOT;
const seaStrip = (() => {
  const p = blankPaint();
  for (let y = 0; y < 2; y++) for (let x = 0; x < W; x++) p[y][x] = SEA_DEEP(x, y + HORIZON + 1);
  return render(p.slice(0, 2));
})();
const seaAt = (n, y) => seaStrip[mod(y - (HORIZON + 1), 2)][n];
{
  for (let n = 8; n < NS - 16; n++) for (let y = 0; y < 2; y++) if (seaStrip[y][n] !== seaStrip[y][n + 8]) throw new Error('the sea does not repeat every 8 samples');
}
defs.push(`<pattern id="sea" width="8" height="2" patternUnits="userSpaceOnUse" y="${HORIZON + 1}">${gridPaths((n, y) => (seaStrip[y][n] === 'k' ? null : seaStrip[y][n]), 16, 0, 24, 2, 16, 0)}</pattern>`);
const staticPick = (n, y) => {
  const c = base[y][n];
  if (isSea(n, y)) return c === seaAt(n, y) ? null : c;
  return c === 'k' ? null : c;
};
const staticLayer = `<rect y="${HORIZON + 1}" width="${NS}" height="${PIC_BOT - HORIZON - 1}" fill="url(#sea)"/>` + gridPaths(staticPick, 0, 0, NS, H);

// ---- patches: what changes when one thing is in another state. Each is the
// set of samples that differ from the base picture, in their new colours
// (black included), so it can be laid straight over the static layer.
// Identical patches (the ship in open sky) are drawn once and reused.
const patchIds = new Map();
let patchBytes = 0;
function patch(st, y0, y1) {
  const g = render(paintScreen({ ...BASE_STATE, ...st }));
  let nMin = NS, nMax = -1, yMin = H, yMax = -1;
  for (let y = y0; y < y1; y++) for (let n = 0; n < NS; n++) if (g[y][n] !== base[y][n]) {
    nMin = Math.min(nMin, n); nMax = Math.max(nMax, n); yMin = Math.min(yMin, y); yMax = Math.max(yMax, y);
  }
  if (nMax < 0) return '';
  for (let y = 0; y < H; y++) if (y < y0 || y >= y1) for (let n = 0; n < NS; n++) if (g[y][n] !== base[y][n]) throw new Error(`patch spills outside its rows at line ${y}`);
  const body = gridPaths((n, y) => (g[y][n] !== base[y][n] ? g[y][n] : null), nMin, yMin, nMax + 1, yMax + 1, nMin, yMin);
  if (!patchIds.has(body)) {
    const id = `p${patchIds.size.toString(36)}`;
    patchIds.set(body, id);
    defs.push(`<g id="${id}">${body}</g>`);
    patchBytes += body.length;
  }
  return `<use href="#${patchIds.get(body)}" x="${nMin}" y="${yMin}"/>`;
}

// ---- the timeline: 20 bars of 3 s, 8 slots of 0.375 s to the bar
const BAR = SLOTS_PER_BAR;
const herAt = (s) => {
  const nod = s % 2 === 1;
  if (s >= 24 && s < 120) return { pose: 'sip', nod };        // bars 3-14: a coconut
  if (s >= 128 && s < 144) return { pose: (s >> 1) % 2 ? 'waveB' : 'waveA', nod: false };   // bars 16-17: waving at nothing
  return { pose: 'idle', nod };
};
const SHIP_FROM = 28;                                          // it enters at bar 3.5, one byte a beat
const shipAt = (s) => {
  if (s < SHIP_FROM) return null;
  const x = 273 - 7 * ((s - SHIP_FROM) >> 1);
  return x > -SHIP_W ? x : null;
};
const layers = [];
{
  // her
  const byKey = new Map();
  for (let s = 0; s < SLOTS; s++) { const h = herAt(s); const k = `${h.pose}|${h.nod}`; if (!byKey.has(k)) byKey.set(k, { st: h, slots: [] }); byKey.get(k).slots.push(s); }
  for (const { st, slots } of byKey.values()) { const u = patch(st, HER.y - 2, HER.y + 36); if (u) layers.push(animated(slots, u)); }
  // the ship
  const ships = new Map();
  for (let s = 0; s < SLOTS; s++) { const x = shipAt(s); if (x === null) continue; if (!ships.has(x)) ships.set(x, []); ships.get(x).push(s); }
  for (const [x, slots] of ships) { const u = patch({ ship: x }, SHIP_TOP - 1, HORIZON + 1); if (u) layers.push(animated(slots, u)); }
  // the title's colours move along one letter every five bars: the slow
  // colour change of a screen that is otherwise standing still
  for (let k = 1; k < 4; k++) layers.push(animated(range(k * 5 * BAR, (k + 1) * 5 * BAR), patch({ titleTurn: k }, 10, 60)));
  // the raft rises on odd bars
  layers.push(animated(range(0, SLOTS).filter((s) => (s / BAR | 0) % 2 === 1), patch({ raftUp: true }, 136, 156)));
}

// ---- the text
const textLayer = [];
const PRESENTS = 'THE LULL PRESENTS';
textLayer.push(textUses(PRESENTS, centreCol(PRESENTS), 2));
const CARDS = [
  [0, 3, ['A TEN-HOUR LO-FI ISLAND VIDEO', 'IN WHICH ALMOST NOTHING HAPPENS,', 'ON PURPOSE.']],
  [3, 6, ['SHE IDLES. SHE NODS TO THE BEAT.', 'EVERY SO OFTEN, SOMETHING HAPPENS.', 'TODAY: A COCONUT.']],
  [6, 11, ['COCONUT SIPPED BY ............. HER', 'SHIP SPOTTED BY ............ NOBODY', '(HEADPHONES. SHE NEVER SEES IT.)']],
  // activities.toml: the ship's prefer_wait holds it up to ten minutes for her to be busy
  [11, 15, ['THE SCHEDULE HOLDS A SHIP UP TO TEN', 'MINUTES, UNTIL SHE IS BUSY. EVERY GAG', 'STARTS ON THE NEXT BAR OF THE MUSIC.']],
  [15, 18, ['RESCUE ARRANGED BY .......... NOBODY', 'SHE WAVES ANYWAY.', 'THE SEA WAVES BACK.']],
  // the prompt line sits under this card, so the card reads straight into it
  [18, 20, ['EVERY SOUND IS SYNTHESIZED FROM CODE.', 'TO WATCH: TYPE THE LINE BELOW, OPEN', 'HTTP://127.0.0.1:8765/ AND WAIT.']],
];
for (const [b0, b1, ls] of CARDS) {
  for (const l of ls) if (l.length > 40) throw new Error(`too wide for 40 columns: ${l}`);
  layers.push(animated(range(b0 * BAR, b1 * BAR), ls.map((l, i) => textUses(l, centreCol(l), 161 + i * 8)).join('')));
}
const PROMPT = ']PYTHON TOOLS/SERVE.PY';
textLayer.push(textUses(PROMPT, 0, 185));
layers.push(animated(range(0, SLOTS).filter((s) => s % 2 === 0), textUses('#', PROMPT.length, 185)));

/// ================================================================ assemble
// The screen sits in a plain dark bezel with a little black overscan, so it
// reads the same on a light or a dark page.
const MARGIN = 30;
const VW = NS + MARGIN * 2, VH = H * 2 + MARGIN * 2;
const REDUCED = '@media (prefers-reduced-motion:reduce){.an{animation:none!important}}';

function svgDoc(title, desc, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VW} ${VH}" width="${VW}" height="${VH}" shape-rendering="crispEdges" role="img" aria-labelledby="ttl dsc">
<title id="ttl">${escXml(title)}</title>
<desc id="dsc">${escXml(desc)}</desc>
<style>
${[...css, REDUCED].join('\n')}
</style>
<defs>
${defs.join('\n')}
<pattern id="scan" width="4" height="1" patternUnits="userSpaceOnUse"><rect y="0.6" width="4" height="0.4" fill="#000" fill-opacity="0.3"/></pattern>
<radialGradient id="glass" cx="50%" cy="48%" r="72%"><stop offset="62%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity="0.42"/></radialGradient>
<linearGradient id="sheen" x1="0" y1="0" x2="0.35" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0.07"/><stop offset="0.45" stop-color="#fff" stop-opacity="0"/></linearGradient>
</defs>
<rect width="${VW}" height="${VH}" rx="18" fill="#1c1b20"/>
<rect x="10" y="10" width="${VW - 20}" height="${VH - 20}" rx="12" fill="#000"/>
<g transform="translate(${MARGIN} ${MARGIN}) scale(1 2)">
${body}
<rect width="${NS}" height="${H}" fill="url(#scan)"/>
</g>
<rect x="10" y="10" width="${VW - 20}" height="${VH - 20}" rx="12" fill="url(#glass)" shape-rendering="auto"/>
<rect x="10" y="10" width="${VW - 20}" height="${VH - 20}" rx="12" fill="url(#sheen)" shape-rendering="auto"/>
</svg>
`;
}

const MAIN_DESC = 'An early-1980s home computer title screen in six colours, every white edge fringed in green and violet. '
  + 'Small white capitals read THE LULL PRESENTS above CASTAWAY in huge block capitals, each letter a different colour with a shadow, the colours moving along one letter every fifteen seconds. '
  + 'Below, a hi-res picture: a tiny island with one tall palm against a cloud bank, a raft, a sun and a striped sea. A young woman in cream headphones, a coral tank top and cream shorts nods to the beat. '
  + 'She lifts a green coconut to her mouth and sips, while a little steamer sails the whole width of the horizon behind her in one-byte steps, passing behind the palm. When it has gone she waves both arms at the empty sea. '
  + 'Three lines of 40-column text change on the bar: a ten-hour lo-fi island video in which almost nothing happens, on purpose; coconut sipped by her, ship spotted by nobody; the schedule holds a ship up to ten minutes until she is busy; rescue arranged by nobody, she waves anyway; every sound synthesized from code, type the line below, open http://127.0.0.1:8765/ and wait. '
  + 'The last line is a prompt reading PYTHON TOOLS/SERVE.PY with a blinking cursor.';

const svgMain = svgDoc('CASTAWAY: a hi-res title screen', MAIN_DESC, `${staticLayer}\n${textLayer.join('\n')}\n${layers.join('\n')}`);
fs.mkdirSync(path.dirname(OUT_MAIN), { recursive: true });
fs.writeFileSync(OUT_MAIN, svgMain);
console.log(`wrote ${path.relative(process.cwd(), OUT_MAIN)}: ${(svgMain.length / 1024).toFixed(1)} KB (patches ${(patchBytes / 1024).toFixed(1)} KB in ${patchIds.size}, glyphs ${glyphIds.size}, static ${(staticLayer.length / 1024).toFixed(1)} KB)`);

if (process.argv.includes('--dump')) {
  const ch = { k: ' ', w: '#', o: 'o', b: '~', g: '+', v: ':' };
  console.log(base.map((r) => r.filter((_, n) => n % 2 === 0).map((c) => ch[c]).join('').replace(/\s+$/, '')).join('\n'));
}

// ================================================================ page 2: the credits
// Stacked panels, each in a thick frame of one solid colour, white credits
// inside: the other classic layout. The frames are a byte wide at the sides,
// so each panel's colour never shares a byte with its text. Static, apart
// from one blinking cursor.
defs.length = 0; css.length = 0; glyphIds.clear(); schedules.clear();

// scaled lettering: every dot `sx` dots wide and `sy` lines tall. A cell is
// then sx bytes wide (an even number of dots), so every cell decodes alike and
// coloured stems come out solid.
const bigGlyphIds = new Map();
function bigGlyphId(ch, colour, sx, sy) {
  const key = `${ch}|${colour}|${sx}|${sy}`;
  if (bigGlyphIds.has(key)) return bigGlyphIds.get(key);
  const id = `u${bigGlyphIds.size.toString(36)}`;
  bigGlyphIds.set(key, id);
  const p = blankPaint();
  const rows = glyphRows(ch).flatMap((r) => Array(sy).fill(r));
  stamp(p, 28, 0, rows, { '#': colour }, sx);
  const g = render(p.slice(0, rows.length));
  defs.push(`<g id="${id}">${gridPaths((n, y) => (g[y][n] === 'k' ? null : g[y][n]), 54, 0, 58 + 14 * sx, rows.length, 56, 0)}</g>`);
  return id;
}
function bigTextUses(str, col, y, colours, sx = 2, sy = 2) {
  if (col % 2) throw new Error('scaled text must start on an even column');
  return [...str].map((ch, i) => (ch === ' ' ? '' : `<use href="#${bigGlyphId(ch, colours[i % colours.length], sx, sy)}" x="${(col + i * sx) * 14}" y="${y}"/>`)).join('');
}

const PANELS = [
  { y0: 0, y1: 44, c: 'v' },
  { y0: 46, y1: 106, c: 'o' },
  { y0: 108, y1: 164, c: 'g' },
  { y0: 166, y1: 192, c: 'b' },
];
const page2Paint = blankPaint();
for (const P of PANELS) {
  rect(page2Paint, 0, P.y0, W, P.y1, P.c);
  rect(page2Paint, 7, P.y0 + 4, W - 7, P.y1 - 4, 'k');
}
const page2 = render(page2Paint);
const page2Static = gridPaths((n, y) => (page2[y][n] === 'k' ? null : page2[y][n]), 0, 0, NS, H);

const p2 = [];
const small = (s, y) => {
  if (s.length > 36) throw new Error(`too wide for a framed panel: ${s}`);
  p2.push(textUses(s, centreCol(s), y));
};
small('BROUGHT TO YOU BY', 9);
p2.push(bigTextUses('THE LULL', 4, 20, ['w'], 4, 2));
p2.push(bigTextUses('CASTAWAY', 4, 54, ['o', 'g', 'v', 'b'], 4, 3));
small('A TEN-HOUR LO-FI ISLAND VIDEO', 80);
small('(WORKING TITLE. ALWAYS DAYTIME.)', 90);
const CREDITS = [
  'IDLING BY .................. HER',
  'NODDING BY ...... HER AND A SHARK',
  'SYNTHESIZED BY ..... MAKE_AUDIO.PY',
  'DISTRIBUTED BY ........ THE TIDE',
  'THANX TO THE TURTLE AND THE CAT',
];
CREDITS.forEach((s, i) => small(s, 115 + i * 9));
const CALL = 'CALL THE BOTTLE POST';
const REPLY = 'REPLIES IN 1 TO 3 HOURS';
small(CALL, 172);
small(REPLY, 180);
p2.push(animated(range(0, SLOTS).filter((s) => s % 2 === 0), textUses('#', centreCol(REPLY) + REPLY.length + 1, 180)));

const PAGE2_DESC = 'The credits page of the same title screen: four stacked panels, each inside a thick frame of one solid colour, violet, orange, green and blue, with white capitals fringed in green and violet. '
  + 'BROUGHT TO YOU BY THE LULL in wide white capitals. CASTAWAY in large letters of four colours, A TEN-HOUR LO-FI ISLAND VIDEO, working title, always daytime. '
  + 'Credits: idling by her; nodding by her and a shark; synthesized by make_audio.py; distributed by the tide; thanx to the turtle and the cat. '
  + 'Last panel: call the Bottle Post, replies in 1 to 3 hours, and a blinking cursor.';
const svgPage2 = svgDoc('CASTAWAY: the credits page', PAGE2_DESC, `${page2Static}\n${p2.join('\n')}`);
fs.writeFileSync(OUT_PAGE2, svgPage2);
console.log(`wrote ${path.relative(process.cwd(), OUT_PAGE2)}: ${(svgPage2.length / 1024).toFixed(1)} KB`);
