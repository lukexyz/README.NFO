#!/usr/bin/env node
// Castaway as one echomail message, read in a DOS message reader of the GoldED school.
// (Style reference: FidoNet-era echomail as shown by GoldED and GoldED+, with the editor's
// shipped default colours. No product name, logo, network name or real node number is used:
// the reader on screen has no name at all, the tear line carries the project's own name, and
// the address lives in zone 1992, which no real network uses.)
//
// Regenerate:  node examples/castaway/src/101-echomail-reader_opus_5.5.mjs
//
// The joke is that echomail and a message in a bottle are the same technology. The message is
// the third bottle (MSGID ...b0771e03, "bottle 03"). It quotes the first two, which both washed
// straight back. Its SEEN-BY line lists exactly one system, the island, and its PATH line goes
// from the island to the island. The address 1992:80/3.1 is the run's seed, the theme's tempo
// and the length of one bar in seconds.
//
// Plain Node, no dependencies, fully deterministic (no clock; one seeded PRNG for wave glints).
// The screen is 80 x 36 text cells of 8 x 14 pixels (an EGA-height cell, so more of the message
// fits), in the 16 text colours. One palette register is redefined (attribute 5, magenta, which
// the reader never uses, becomes a peach skin tone), as VGA allowed. Every character is a <use>
// of a glyph path from the bitmap font below (never <text>). The picture in the message body is
// drawn in half-block "pixels": half a cell, 8 x 7.
// Animation is CSS only, and every change is a hard step. One loop is 60 s: the length of the
// Castaway theme, 20 bars of 3 s at 80 BPM. Under prefers-reduced-motion the file rests on
// t = REST below: the bottle back on the sand at her feet, and her looking at the camera.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '101-echomail-reader_opus_5.5';
const OUT = path.join(HERE, '..', 'assets', `${SLUG}.svg`);

// ---------------------------------------------------------------------------------------------
// Screen geometry
// ---------------------------------------------------------------------------------------------
const COLS = 80, ROWS = 36, CW = 8, CH = 14, PAD = 14;
const SW = COLS * CW, SH = ROWS * CH;
const VBW = SW + PAD * 2, VBH = SH + PAD * 2;
const PXH = CH / 2; // a half-block pixel is 8 x 7

// The 16 text colours (class name -> hex). 'p' is attribute 5 with its DAC register redefined.
const INK = {
  k: '#000000', b: '#0000AA', g: '#00AA00', t: '#00AAAA', r: '#AA0000', p: '#FFB083', o: '#AA5500', l: '#AAAAAA',
  d: '#555555', lb: '#5555FF', lg: '#55FF55', lc: '#55FFFF', lr: '#FF5555', lm: '#FF55FF', y: '#FFFF55', w: '#FFFFFF',
};
// One-letter codes for pixel maps.
const PX = { k: 'k', b: 'b', g: 'g', t: 't', r: 'r', p: 'p', o: 'o', l: 'l', d: 'd', B: 'lb', G: 'lg', c: 'lc', R: 'lr', M: 'lm', y: 'y', w: 'w' };

// ---------------------------------------------------------------------------------------------
// Bitmap font in the manner of the VGA ROM, drawn on a 16-row grid and then cut to 14 rows
// (rows 1-14), which is where every glyph below lives. Rows are '#'/'.' strings placed from row
// `top` of the 16-row grid. Capitals sit on rows 2-11 with 2-pixel stems. (Provenance: the face
// was copied from this gallery's header 69, the twin-panel commander, and given extra glyphs.)
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
  '(': [2, '....##. ...##.. ..##... ..##... ..##... ..##... ..##... ..##... ...##.. ....##.'],
  ')': [2, '.##.... ..##... ...##.. ...##.. ...##.. ...##.. ...##.. ...##.. ..##... .##....'],
  '[': [2, '.####.. .##.... .##.... .##.... .##.... .##.... .##.... .##.... .##.... .####..'],
  ']': [2, '.####.. ...##.. ...##.. ...##.. ...##.. ...##.. ...##.. ...##.. ...##.. .####..'],
  '<': [3, '....##. ...##.. ..##... .##.... ##..... .##.... ..##... ...##.. ....##.'],
  '>': [3, '.##.... ..##... ...##.. ....##. .....## ....##. ...##.. ..##... .##....'],
  '*': [5, '.##..##. ..####.. ######## ..####.. .##..##.'],
  '+': [5, '...##... ...##... .######. ...##... ...##...'],
  '=': [6, '.######. ........ ........ .######.'],
  '%': [4, '##....#. ##...##. ....##.. ...##... ..##.... .##..... ##...##. #....##.'],
  '~': [2, '.###.## ##.###.'],
  '♪': [3, '...##... ...###.. ...####. ...##.##. ...##..#. ...##... ...##... .####... #####... .###....'],
  '►': [3, '#....... ##...... ###..... ####.... #####... ####.... ###..... ##...... #.......'],
  '◄': [3, '....#... ...##... ..###... .####... #####... .####... ..###... ...##... ....#...'],
  '·': [7, '...##... ...##...'],
  '→': [5, '....##.. .....##. ######## .....##. ....##..'],
  '☼': [3, '...##... ##.##.## .######. .##..##. ###..### .##..##. .######. ##.##.## ...##...'],
};
for (const [ch, [top, rows]] of Object.entries(PUNCT)) def(ch, top, rows);
// Extra glyphs for the reader: the at-sign that stands in for control-A on kludge lines, the
// caret of "Re^2:", and the single line of the header window's border.
def('@', 2, '.#####. ##...## ##...## ##.#### ##.#### ##.#### ##.###. ##..... ##...## .#####.');
def('^', 1, '...#... ..###.. .##.##. ##...##');
FONT.set(' ', new Array(16).fill(0));
{ const g = new Array(16).fill(0); g[7] = 0xFF; FONT.set('─', g); }
// Cut every glyph from 16 rows to 14 (rows 1-14), checking nothing is lost.
for (const [ch, g] of FONT) {
  if (g[0] || g[15]) throw new Error(`glyph ${ch} uses row 0 or 15`);
  FONT.set(ch, g.slice(1, 15));
}
FONT.set('│', new Array(CH).fill(0x18));

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
const glyphPath = (g) => bitmapPath(g.map((v) => (x) => (v >> (7 - x)) & 1), 8);

const glyphIds = new Map();
function gid(ch) {
  if (!FONT.has(ch)) throw new Error(`no glyph for ${JSON.stringify(ch)} (U+${ch.codePointAt(0).toString(16)})`);
  if (!glyphIds.has(ch)) glyphIds.set(ch, `g${glyphIds.size.toString(36)}`);
  return glyphIds.get(ch);
}
const len = (str) => [...str].length;

// ---------------------------------------------------------------------------------------------
// Drawing helpers. Text is addressed in character cells (row, column).
// ---------------------------------------------------------------------------------------------
function uses(c, str) {
  let out = '';
  for (const ch of str) {
    if (ch !== ' ') out += `<use href="#${gid(ch)}" x="${c * CW}"/>`;
    c++;
  }
  return out;
}
// One run of text in one colour.
function put(r, c, str, cls) {
  if (r < 0 || r >= ROWS || c < 0 || c + len(str) > COLS) throw new Error(`off screen at ${r},${c}: "${str}"`);
  const inner = uses(c, str);
  return inner ? `<g class="${cls}" transform="translate(0 ${r * CH})">${inner}</g>` : '';
}
// Several runs on one row: [[text, class], ...] from column c.
function seg(r, c, parts) {
  let out = '';
  for (const [str, cls] of parts) { out += put(r, c, str, cls); c += len(str); }
  return out;
}
const cells = (cls, r, c, w, h = 1) => `<rect class="${cls}" x="${c * CW}" y="${r * CH}" width="${w * CW}" height="${h * CH}"/>`;
const pad = (s, w) => { if (len(s) > w) throw new Error(`too wide (${w}): "${s}"`); return s + ' '.repeat(w - len(s)); };
const rpad = (s, w) => { if (len(s) > w) throw new Error(`too wide (${w}): "${s}"`); return ' '.repeat(w - len(s)) + s; };

// Pixel maps: an array of strings, one letter per pixel from PX ('.' or ' ' is see-through).
// Drawn as one merged path per colour, 8 x 7 screen pixels per map pixel, at pixel (px, py) of
// the picture.
let PIC_X = 0, PIC_Y = 0; // screen position of the picture, set below
function pixels(map, px = 0, py = 0) {
  const w = Math.max(...map.map((row) => row.length));
  const used = new Set();
  for (const row of map) for (const ch of row) if (PX[ch]) used.add(ch);
  let out = '';
  for (const ch of used) {
    const rows = map.map((row) => (x) => row[x] === ch);
    out += `<path class="${PX[ch]}" d="${bitmapPath(rows, w, CW, PXH, PIC_X + px * CW, PIC_Y + py * PXH)}"/>`;
  }
  return out;
}

// Small deterministic PRNG (mulberry32) for the scatter of wave glints.
function prng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------------------------------------
// Timeline. One loop of T seconds = the 60-second theme: 20 bars of 3 s, 4 beats of 0.75 s.
// ---------------------------------------------------------------------------------------------
const T = 60, BAR = 3, BEAT = 0.75;
const REST = 36; // the frame the file rests on when nothing animates

const css = [];
const pct = (t) => `${+((100 * t) / T).toFixed(4)}%`;
const kfCache = new Map();
let animN = 0;
// A class that steps the CSS property `prop` through `changes` ([[t, value], ...], from t = 0).
function track(prop, changes, fmt = (v) => v) {
  const ch = [];
  for (const [t, v] of [...changes].sort((a, b) => a[0] - b[0])) {
    if (t < 0 || t >= T) throw new Error(`change outside the loop: ${t}`);
    if (ch.length && ch[ch.length - 1][0] === t) ch[ch.length - 1][1] = v;
    else if (!ch.length || ch[ch.length - 1][1] !== v) ch.push([t, v]);
  }
  if (!ch.length || ch[0][0] !== 0) throw new Error(`track for ${prop} must start at t = 0`);
  const at = (t) => { let v = ch[0][1]; for (const [a, x] of ch) if (a <= t) v = x; return v; };
  const kf = ch.length > 1 ? ch.map(([t, v]) => `${pct(t)}{${prop}:${fmt(v)}}`).join('') + `100%{${prop}:${fmt(ch[0][1])}}` : '';
  const key = `${prop}|${kf}|${fmt(at(REST))}`;
  if (kfCache.has(key)) return kfCache.get(key);
  const name = `a${(animN++).toString(36)}`;
  css.push(kf
    ? `@keyframes ${name}{${kf}}.${name}{${prop}:${fmt(at(REST))};animation:${name} ${T}s step-end infinite}`
    : `.${name}{${prop}:${fmt(at(REST))}}`);
  kfCache.set(key, name);
  return name;
}
// Visible during the given [from, to) intervals.
function vis(intervals) {
  const iv = intervals.filter(([a, b]) => b > a);
  const on = (t) => iv.some(([a, b]) => t >= a && t < b);
  const pts = new Set([0]);
  for (const [a, b] of iv) { if (a > 0 && a < T) pts.add(a); if (b < T) pts.add(b); }
  return track('opacity', [...pts].map((t) => [t, on(t) ? 1 : 0]));
}
const show = (intervals, inner) => (inner ? `<g class="${vis(intervals)}">${inner}</g>` : '');
// Moves its content through positions [[t, dx, dy], ...] in picture pixels, hard cuts only.
const moveCls = (steps) => track('transform', steps.map(([t, x, y]) => [t, `${x * CW},${y * PXH}`]), (v) => { const [x, y] = v.split(','); return `translate(${x}px,${y}px)`; });
// Short repeating cycles: frame k of n, each `dur` seconds long. n * dur must divide T.
const cycles = new Map();
function cycle(n, dur, k) {
  if (Math.abs(T / (n * dur) - Math.round(T / (n * dur))) > 1e-9) throw new Error(`cycle ${n} x ${dur} does not divide the loop`);
  const name = `c${n}_${String(dur).replace('.', '_')}_${k}`;
  if (!cycles.has(name)) {
    const a = (100 * k) / n, b = (100 * (k + 1)) / n;
    const kf = `${k ? `0%{opacity:0}${+a.toFixed(3)}%{opacity:1}` : '0%{opacity:1}'}${b < 100 ? `${+b.toFixed(3)}%{opacity:0}` : ''}100%{opacity:${k === n - 1 ? 1 : 0}}`;
    // The resting frame is whichever frame of the cycle is showing at t = REST.
    const restOn = Math.floor((REST % (n * dur)) / dur) === k ? 1 : 0;
    cycles.set(name, `@keyframes ${name}{${kf}}.${name}{opacity:${restOn};animation:${name} ${+(n * dur).toFixed(4)}s step-end infinite}`);
  }
  return name;
}

const layers = [];

// ---------------------------------------------------------------------------------------------
// The screen: black, as DOS left it.
// ---------------------------------------------------------------------------------------------
layers.push(cells('k', 0, 0, COLS, ROWS));

// Row plan.
const R = {
  top: 0, msg: 1, from: 2, to: 3, subj: 4, rule: 5,
  msgid: 6, reply: 7, hidden: 8,
  pic: 10, picRows: 11,
  q2: 22, q1: 23,
  body: 25,
  tag: 30, tear: 31, origin: 32, seenby: 33, path: 34,
  status: 35,
};

// ---------------------------------------------------------------------------------------------
// The header window: a light blue border with yellow titles set into it, and the four header
// rows in light grey. From/To names at column 8 (36 wide), the address at column 44 (16 wide),
// the dates right-aligned in the last 20 columns, 'DD Mon YY  HH:MM:SS'.
// ---------------------------------------------------------------------------------------------
const BODY_LINES = R.path - R.msgid + 1;
{
  const rule = (r, titles) => {
    let out = put(r, 0, '─'.repeat(COLS), 'lb');
    for (const [c, s] of titles) out += cells('k', r, c, len(s)) + put(r, c, s, 'y');
    return out;
  };
  const desc = ' one island · ten hours · almost nothing happens ';
  layers.push(rule(R.top, [[1, ' CASTAWAY '], [COLS - 1 - len(desc), desc]]));
  layers.push(rule(R.rule, [[1, ` ${BODY_LINES} lines `]]));

  const label = (r, s) => put(r, 1, pad(s, 4) + ' :', 'l');
  layers.push(label(R.msg, 'Msg') + put(R.msg, 8, '3 of 4 -2 +4', 'l') + put(R.msg, 44, 'Loc Snt', 'l'));
  layers.push(label(R.from, 'From') + put(R.from, 8, pad('Castaway', 36), 'l') + put(R.from, 44, pad('1992:80/3.1', 16), 'l')
    + put(R.from, 60, rpad('01 Oct 26  09:41:07', 20), 'l'));
  layers.push(label(R.to, 'To') + put(R.to, 8, 'All', 'l') + put(R.to, 60, rpad('01 Oct 26  09:42:01', 20), 'l'));
  layers.push(label(R.subj, 'Subj') + put(R.subj, 8, 'Re^2: anyone out there?', 'l'));
}

// ---------------------------------------------------------------------------------------------
// The message: kludges (dimmed, as when they are switched on), the picture, two quote levels in
// yellow and white, the body in light grey with the URL in light blue, then the tagline,
// tear line, origin line, SEEN-BY and PATH.
// ---------------------------------------------------------------------------------------------
const BODY = [
  'Both came straight back. They always do. So, for the record: Castaway is a',
  'ten-hour lo-fi video of one tiny island, one tall palm, a raft and her,',
  'nodding to the music. Every few minutes, on the beat, something happens:',
  'a turtle visits, or a coconut lands on a hermit crab, who walks off wearing it.',
];
{
  layers.push(put(R.msgid, 0, '@MSGID: 1992:80/3.1 b0771e03', 'd'));
  layers.push(put(R.reply, 0, '@REPLY: 1992:80/3.1 b0771e02', 'd'));
  // A hidden line: an unknown kludge, which the reader shows dimmed when hidden lines are on.
  // Some conferences used them for witty comments between the lines; this one is the ship.
  layers.push(put(R.hidden, 0, '@SHIP: waited until she was busy, then sailed past. 09:41:33', 'd'));
  layers.push(put(R.q2, 0, ' C>> Hello? Is anyone out there?', 'w'));
  layers.push(put(R.q1, 0, ' C> Hello again. Did the first bottle get anywhere?', 'y'));
  BODY.forEach((s, i) => layers.push(put(R.body + i, 0, s, 'l')));
  layers.push(seg(R.body + BODY.length, 0, [['To watch: python tools/serve.py, then open ', 'l'], ['http://127.0.0.1:8765/', 'lb']]));
  layers.push(put(R.tag, 0, '... Bottle mail: guaranteed delivery. To the sender.', 'd'));
  layers.push(put(R.tear, 0, '--- Castaway (working title)', 'w'));
  layers.push(put(R.origin, 0, ' * Origin: One Palm Point. Every sound made from code. (1992:80/3.1)', 'w'));
  layers.push(put(R.seenby, 0, 'SEEN-BY: 80/3', 'd'));
  layers.push(put(R.path, 0, '@PATH: 80/3 3', 'd'));
}

// ---------------------------------------------------------------------------------------------
// The picture: 78 x 22 half-block pixels in rows R.pic.. of the body, columns 1-78.
// CASTAWAY in cumulus over the horizon, a tall palm on a tiny island, a raft, and her.
// ---------------------------------------------------------------------------------------------
const PW = 78, PH = R.picRows * 2;
PIC_X = 1 * CW; PIC_Y = R.pic * CH;
const grid = Array.from({ length: PH }, () => Array(PW).fill('.'));
const set = (x, y, c) => { if (x >= 0 && x < PW && y >= 0 && y < PH) grid[y][x] = c; };
const stamp = (map, x0, y0) => map.forEach((row, y) => [...row].forEach((c, x) => { if (c !== '.' && c !== ' ') set(x0 + x, y0 + y, c); }));

const HORIZON = 12;          // first sea row
// Sky: light blue, with a hazy light-cyan band just above the horizon.
for (let y = 0; y < HORIZON; y++) for (let x = 0; x < PW; x++) set(x, y, 'B');
for (let x = 0; x < PW; x++) set(x, HORIZON - 1, 'c');
// Sea: deep blue, turquoise shallows round the island with a light rim.
for (let y = HORIZON; y < PH; y++) for (let x = 0; x < PW; x++) set(x, y, 'b');
const IS_CX = 66;
const shallow = (x, y, s = 1) => { const dx = (x - IS_CX) / (16 * s), dy = (y - 18.5) / (4.4 * s); return dx * dx + dy * dy < 1; };
for (let y = HORIZON + 1; y < PH; y++) for (let x = 0; x < PW; x++) if (shallow(x, y)) set(x, y, 't');
// Far-sea swell lines along the horizon (static), and a few longer ones nearer in.
{
  const rnd = prng(80);
  for (let i = 0; i < 10; i++) { const x = Math.floor(rnd() * 50); set(x, HORIZON, 'B'); set(x + 1, HORIZON, 'B'); if (rnd() < 0.5) set(x + 2, HORIZON, 'B'); }
  for (let i = 0; i < 5; i++) { const x = Math.floor(rnd() * 40), y = HORIZON + 2 + Math.floor(rnd() * 3); for (let k = 0; k < 3; k++) if (grid[y][x + k] === 'b') set(x + k, y, 'B'); }
}

// The cumulus bank on the horizon: round white tops, a grey underside. Stops short of the
// island so her head is against clear sky.
const BANK = [
  // y = 9, 10, 11: puff tops, the body, the grey underside sitting on the horizon
  '.www....wwwww.....www......wwwww.....wwww.....www..',
  'wwwwww.wwwwwwww.wwwwwww..wwwwwwwww.wwwwwwww.wwwwwww',
  'lllllllllllllllllllllllllllllllllllllllllllllllllll',
];
stamp(BANK, 0, 9);

// CASTAWAY in cumulus capitals: white, with a grey underside on the bottom row.
const CLOUD = {
  C: ['.####.', '##..##', '##....', '##....', '##....', '##..##', '.####.'],
  A: ['.####.', '##..##', '##..##', '######', '##..##', '##..##', '##..##'],
  S: ['.####.', '##..##', '##....', '.####.', '....##', '##..##', '.####.'],
  T: ['######', '..##..', '..##..', '..##..', '..##..', '..##..', '..##..'],
  W: ['##...##', '##...##', '##...##', '##.#.##', '#######', '###.###', '##...##'],
  Y: ['##..##', '##..##', '##..##', '.####.', '..##..', '..##..', '..##..'],
};
const WORD = 'CASTAWAY', LETTER_TOP = 1, WORD_X = 1;
{
  let x = WORD_X;
  for (const ch of WORD) {
    CLOUD[ch].forEach((row, y) => [...row].forEach((v, i) => { if (v === '#') set(x + i, LETTER_TOP + y, y === 6 ? 'l' : 'w'); }));
    x += CLOUD[ch][0].length + 1;
  }
}

// The island: sand, wet sand at the edges, two clumps of green.
{
  const SAND = [[16, 58, 74], [17, 56, 76], [18, 56, 76], [19, 58, 74]];
  for (const [y, a, b] of SAND) for (let x = a; x <= b; x++) set(x, y, 'y');
  for (const [x, y] of [[56, 18], [57, 18], [76, 18], [75, 18], [58, 19], [59, 19], [73, 19], [74, 19], [60, 19], [72, 19]]) set(x, y, 'o');
  stamp(['..G.G..', '.gGgGg.', 'gGgggGg'], 70, 14);
  stamp(['.G.', 'gGg'], 63, 15);
}
// The palm: a tall, slim, slightly leaning trunk in brown and red segments, and its crown.
const TRUNK = [[69, 17], [69, 16], [69, 15], [68, 14], [68, 13], [68, 12], [68, 11], [67, 10], [67, 9], [67, 8], [67, 7], [66, 6], [66, 5], [66, 4]];
TRUNK.forEach(([x, y], i) => set(x, y, i % 3 === 2 ? 'r' : 'o'));
{
  const CROWN = [
    '.....GGG...GGG.....',
    '...GGggGGgGGggGG...',
    '.GGgg..gGGGg..ggGG.',
    'Gg....gG.o.Gg....gG',
    'g....g...o...g....g',
    '....g.........g....',
  ];
  stamp(CROWN, 66 - 9, 0);
  set(65, 4, 'o'); set(67, 4, 'r'); // two coconuts, hanging on. for now
}
// The raft, moored off the left of the island.
stamp(['oooooo', 'rrrrrr'], 47, 18);

// ---------------------------------------------------------------------------------------------
// Animated bits of the picture: wave glints, foam, a drifting puff, her, and two bottles.
// ---------------------------------------------------------------------------------------------
const anim = [];
// Wave glints: four frames, one per beat, cycling every bar.
{
  const rnd = prng(1992);
  for (let k = 0; k < 4; k++) {
    const map = Array.from({ length: PH }, () => Array(PW).fill('.'));
    for (let i = 0; i < 16; i++) {
      const x = Math.floor(rnd() * (PW - 1)), y = HORIZON + 1 + Math.floor(rnd() * (PH - HORIZON - 1));
      const under = grid[y][x];
      if (under !== 'b' && under !== 't') continue;
      const c = under === 't' ? 'c' : 'B';
      map[y][x] = c; if (grid[y][x + 1] === under && rnd() < 0.6) map[y][x + 1] = c;
    }
    anim.push(`<g class="${cycle(4, BEAT, k)}">${pixels(map.map((r) => r.join('')))}</g>`);
  }
}
// Foam round the island: two frames, two beats each.
{
  const f0 = Array.from({ length: PH }, () => Array(PW).fill('.'));
  const f1 = Array.from({ length: PH }, () => Array(PW).fill('.'));
  for (let x = 57; x <= 75; x++) { f0[21][x] = x % 2 ? 'w' : 'c'; f1[21][x] = x % 2 ? 'c' : 'w'; }
  for (const [x, y] of [[55, 17], [55, 18], [77, 17], [57, 19], [75, 19]]) { f0[y][x] = 'w'; f1[y][x] = 'c'; }
  for (const [x, y] of [[54, 18], [77, 18], [56, 20], [76, 20]]) { f1[y][x] = 'w'; }
  anim.push(`<g class="${cycle(2, BAR / 2, 0)}">${pixels(f0.map((r) => r.join('')))}</g>`);
  anim.push(`<g class="${cycle(2, BAR / 2, 1)}">${pixels(f1.map((r) => r.join('')))}</g>`);
}

// Her. Facing left (out to sea), cream headphones, brown hair in a low bun, coral tank top,
// cream shorts, bare feet, drawn with the top-left of each map at HER.
const HER = [58, 6];
// Each map is 5 x 11: two rows of headroom for a raised arm, then hair, face, top, shorts, legs.
// Feet land on the sand at y = 16.
const SPR = {
  // nodding: head up, then forward on the beat
  up: ['.....', '.....', '.owo.', '.pwoo', '..p..', '.RRR.', 'pRRRp', 'pRRRp', '.www.', '.p.p.', '.p.p.'],
  down: ['.....', '.....', 'owo..', 'pwoo.', '.p...', '.RRR.', 'pRRRp', 'pRRRp', '.www.', '.p.p.', '.p.p.'],
  // throwing: arm up and over
  throw: ['p....', '.p...', '.owo.', '.pwoo', '..p..', '.RRR.', '.RRRp', '.RRRp', '.www.', '.p.p.', '.p.p.'],
  // deadpan, to camera
  front: ['.....', '.....', '.ooo.', 'wpppw', '..p..', '.RRR.', 'pRRRp', 'pRRRp', '.www.', '.p.p.', '.p.p.'],
  // kneeling to pick something up
  kneel: ['.....', '.....', '.....', '.....', 'owo..', 'pwoo.', '.RRR.', 'pRRR.', 'pRRRp', '.www.', 'pp.pp'],
};
const herMap = (k) => SPR[k];

// Bottles: neck over body, floating upright; lying on the sand when washed up.
const GREEN = { float: ['G', 'g'], sand: ['ggG'] };
const AMBER = { float: ['y', 'o'], sand: ['ooy'] };

// The story of one loop. Times in seconds.
const THROW = 6, LAND = 6.75;
const OUT_TO = 36, OUT_END = LAND + (52 - OUT_TO) * BEAT;      // drifts out one pixel a beat
const TURN_END = OUT_END + 2 * BEAT;                         // bobs, thinks about it
const BACK_X = 55, BACK_END = TURN_END + (BACK_X - OUT_TO) * BEAT; // drifts straight back
const BEACH1 = BACK_END + BEAT;                              // clunk, at her feet
const PICK1 = BEACH1 + 5 * BEAT, GONE1 = PICK1 + BEAT, UP1 = PICK1 + 2 * BEAT;
const AMBER_IN = UP1 + 2 * BEAT, AMBER_X0 = 8, AMBER_STEP = BEAT / 3;
const AMBER_END = AMBER_IN + (BACK_X - AMBER_X0) * AMBER_STEP;
const BEACH2 = AMBER_END + BEAT;
const PICK2 = BEACH2 + 3 * BEAT, GONE2 = PICK2 + BEAT, UP2 = PICK2 + 2 * BEAT;
if (UP2 > T - BEAT) throw new Error(`story overruns the loop: ${UP2}`);

// Her frames over time.
{
  const nodWindows = [[0, THROW], [LAND, BEACH1], [UP1, BEACH2], [UP2, T]];
  const up = [], down = [];
  for (const [a, b] of nodWindows) {
    for (let t = Math.ceil(a / BEAT) * BEAT; t < b; t += BEAT) {
      down.push([Math.max(a, t), Math.min(b, t + BEAT / 2)]);
      up.push([Math.min(b, t + BEAT / 2), Math.min(b, t + BEAT)]);
    }
    const first = Math.ceil(a / BEAT) * BEAT;
    if (first > a) up.push([a, Math.min(b, first)]);
  }
  anim.push(show(up, pixels(herMap('up'), ...HER)));
  anim.push(show(down, pixels(herMap('down'), ...HER)));
  anim.push(show([[THROW, LAND]], pixels(herMap('throw'), ...HER)));
  anim.push(show([[BEACH1, PICK1], [BEACH2, PICK2]], pixels(herMap('front'), ...HER)));
  anim.push(show([[PICK1, UP1], [PICK2, UP2]], pixels(herMap('kneel'), ...HER)));
}

// The green bottle: thrown, drifts out, thinks about it, drifts straight back, lands at her feet.
{
  // In the air (two hard-cut positions), then afloat.
  anim.push(show([[THROW, THROW + BEAT / 2]], pixels(['g'], 57, 5)));
  anim.push(show([[THROW + BEAT / 2, LAND]], pixels(['g'], 54, 10)));
  const steps = [[0, 0, 0]];
  let t = LAND;
  for (let x = 52; x >= OUT_TO; x--, t += BEAT) steps.push([t, x - 52, ((x % 2) ? 0 : 1)]);
  for (let i = 0; t < TURN_END; i++, t += BEAT) steps.push([t, OUT_TO - 52, i % 2]);
  for (let x = OUT_TO + 1; x <= BACK_X; x++, t += BEAT) steps.push([t, x - 52, ((x % 2) ? 0 : 1)]);
  const mv = moveCls(steps.filter(([tt]) => tt < BACK_END + BEAT));
  anim.push(show([[LAND, BEACH1]], `<g class="${mv}">${pixels(GREEN.float, 52, 14)}</g>`));
  anim.push(show([[BEACH1, GONE1]], pixels(GREEN.sand, 53, 17)));
}
// The amber bottle: hours later in the video, minutes later here. A reply.
{
  const steps = [[0, 0, 0]];
  let t = AMBER_IN, i = 0;
  for (let x = AMBER_X0; x <= BACK_X; x++, t += AMBER_STEP, i++) steps.push([t, x - AMBER_X0, (Math.floor(i / 3) % 2)]);
  const mv = moveCls(steps);
  anim.push(show([[AMBER_IN, BEACH2]], `<g class="${mv}">${pixels(AMBER.float, AMBER_X0, 14)}</g>`));
  anim.push(show([[BEACH2, GONE2]], pixels(AMBER.sand, 53, 17)));
}

// Layering: the still picture, then everything that moves, clipped to the picture.
layers.push(pixels(grid.map((row) => row.join(''))));
layers.push(`<svg x="${PIC_X}" y="${PIC_Y}" width="${PW * CW}" height="${PH * PXH}" viewBox="${PIC_X} ${PIC_Y} ${PW * CW} ${PH * PXH}" overflow="hidden">${anim.join('')}</svg>`);

// ---------------------------------------------------------------------------------------------
// The status line: white on blue. Notices on the left follow the bottles; on the right, the bar
// of the theme (1-20, three seconds each) and a clock whose colon blinks.
// ---------------------------------------------------------------------------------------------
{
  layers.push(cells('b', R.status, 0, COLS, 1));
  const NOTE_W = 52;
  const NOTES = [
    [[0, THROW], [UP1, AMBER_END], [UP2, T], 'Nothing is happening. This is normal.'],
    [[THROW, OUT_END], 'Tossing... 1 msg out to All, by sea.'],
    // True to the schedule: bottle_reply follows message_in_bottle after 1 to 3 hours.
    [[OUT_END, BACK_END], 'Waiting for a reply. Usual wait: 1 to 3 hours.'],
    [[BACK_END, UP1], '1 msg in, from Castaway. That is us.'],
    [[AMBER_END, UP2], 'New mail in CASTAWAY! 1 msg, and not from us.'],
  ];
  for (const n of NOTES) {
    const s = n[n.length - 1], iv = n.slice(0, -1);
    layers.push(show(iv, put(R.status, 1, pad(s, NOTE_W), 'w')));
  }
  const C0 = 55;
  layers.push(put(R.status, C0, '│', 'w'));
  layers.push(put(R.status, C0 + 2, '♪ bar', 'w'));
  for (let i = 0; i < 20; i++) {
    layers.push(show([[i * BAR, (i + 1) * BAR]], put(R.status, C0 + 8, `${String(i + 1).padStart(2, '0')}/20`, 'w')));
  }
  layers.push(put(R.status, C0 + 14, '│', 'w'));
  // The clock reads 09:42: the message arrived at 09:42:01, so it cannot be any earlier. Its
  // colon blinks on the beat (one beat on, one beat off), like everything else on the screen.
  layers.push(put(R.status, C0 + 16, '09', 'w') + put(R.status, C0 + 19, '42', 'w'));
  layers.push(`<g class="${cycle(2, BEAT, 0)}">${put(R.status, C0 + 18, ':', 'w')}</g>`);
}

// ---------------------------------------------------------------------------------------------
// Assemble
// ---------------------------------------------------------------------------------------------
css.unshift(Object.entries(INK).map(([k, v]) => `.${k}{fill:${v}}`).join(''));
css.push(...cycles.values());
css.push('@media (prefers-reduced-motion:reduce){*{animation:none!important}}');

const glyphDefs = [...glyphIds].filter(([ch]) => ch !== ' ').map(([ch, id]) => `<path id="${id}" d="${glyphPath(FONT.get(ch))}"/>`).join('');
const TITLE = 'CASTAWAY: one echomail message, read in a DOS message reader';
const DESC = 'Castaway, a ten-hour lo-fi island video, as an echomail message on a black text screen. The header window, in light blue lines with yellow titles, shows the area CASTAWAY, message 3 of 4, from Castaway at 1992:80/3.1 to All, subject Re^2: anyone out there? In the body, a picture: CASTAWAY in white cumulus capitals over the horizon, a tall palm on a tiny island, a raft, and a young woman in cream headphones and a coral tank top, nodding to the beat. She throws a green bottle; it drifts out and comes straight back. Later an amber bottle drifts in: a reply. Below, quoted lines in white and yellow, the pitch, the tear line, the origin line, SEEN-BY 80/3 and PATH 80/3 3 (the island, twice), and a blue status line.';
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VBW} ${VBH}" width="${VBW}" height="${VBH}" role="img" aria-labelledby="t d">`
  + `<title id="t">${TITLE}</title><desc id="d">${DESC}</desc>`
  + `<style>${css.join('')}</style>`
  + `<defs>${glyphDefs}</defs>`
  + `<rect width="${VBW}" height="${VBH}" rx="10" fill="#000"/>`
  + `<g transform="translate(${PAD} ${PAD})">${layers.join('')}</g>`
  + `</svg>\n`;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, svg);
console.log(`${path.relative(process.cwd(), OUT)}  ${(svg.length / 1024).toFixed(1)} KB  ${glyphIds.size} glyphs  ${animN} tracks  loop ${T}s`);
