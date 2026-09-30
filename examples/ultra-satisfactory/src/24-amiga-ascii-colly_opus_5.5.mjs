#!/usr/bin/env node
// ULTRA-SATISFACTORY as the opening of an Amiga ASCII collection (a "colly").
//
// Regenerate:  node examples/ultra-satisfactory/src/24-amiga-ascii-colly_opus_5.5.mjs
//   --dump           also print the colly as plain text
//   --sheet=out.svg  also write a static contact sheet of every page (for working on the art)
//
// Style reference (catalogue entry nfo-07): the Amiga colly era of roughly 1994 to 1998, when
// ASCII crews competed with one text file of full-width logos, the manner of artists such as
// Skin, Desoto, Stylez and stRAtOS and of crews such as Arclite, Low Profile and Mo'Soul. They
// are named here as the reference only. No logo, tag, crew name, letterform or board advert of
// theirs is reproduced, and every crew, artist and board named in the piece is invented. What is
// reused is the page structure and the mark vocabulary, which are the scene's common property:
// letters sheared into long parallelograms, slash sides, the macron as a ceiling over the
// underscore floor, a multiplication or fraction sign packed in as a dense fill, scene case,
// letter-spaced captions, a credit rule under every logo, a rail of colons down each margin, and
// the fixed running order of advert, title, index, intro, logos, greets, respects.
//
// Plain Node, no dependencies, no randomness, no clock. The colly is built as a real 80-column
// text file (144 lines of it), and that one model is written out twice:
//   1. assets/<slug>.svg  a text viewer paging through the file. Every character is one <use> of
//      an 8 x 8 bitmap glyph defined below (never <text>), shown on 1:2 pixels so a cell is
//      8 x 16 with no gap between rows. That is the point of the image: at line height 1 the
//      slashes of one row meet the slashes of the next and the macron sits on the underscore,
//      which is how these files were drawn and what a browser's code block pulls apart.
//   2. <slug>.md  the README header: the image, the pitch, the index as a <pre> with real links,
//      and the whole file as text inside <details>.
// Animation is CSS only: one translate on the page group (hold, glide, hold), a stepped page
// number, a scrollbar knob, and a highlight that runs through the fill of two logos.
// prefers-reduced-motion stops all of it on the first page.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '24-amiga-ascii-colly_opus_5.5';
const OUT_SVG = path.join(HERE, '..', 'assets', `${SLUG}.svg`);
const OUT_MD = path.join(HERE, '..', `${SLUG}.md`);

// ---------------------------------------------------------------------------------------------
// 8 x 8 bitmap font (original; drawn for this file). Shown on 1:2 pixels, so a cell is 8 x 16.
// ---------------------------------------------------------------------------------------------
const FONT_SRC = {
  A: '..##....|.####...|##..##..|##..##..|######..|##..##..|##..##..|........',
  B: '#####...|##..##..|##..##..|#####...|##..##..|##..##..|#####...|........',
  C: '.####...|##..##..|##......|##......|##......|##..##..|.####...|........',
  D: '####....|##.##...|##..##..|##..##..|##..##..|##.##...|####....|........',
  E: '######..|##......|##......|####....|##......|##......|######..|........',
  F: '######..|##......|##......|####....|##......|##......|##......|........',
  G: '.####...|##..##..|##......|##.###..|##..##..|##..##..|.#####..|........',
  H: '##..##..|##..##..|##..##..|######..|##..##..|##..##..|##..##..|........',
  I: '.####...|..##....|..##....|..##....|..##....|..##....|.####...|........',
  J: '..####..|...##...|...##...|...##...|##.##...|##.##...|.###....|........',
  K: '##..##..|##.##...|####....|###.....|####....|##.##...|##..##..|........',
  L: '##......|##......|##......|##......|##......|##......|######..|........',
  M: '##...##.|###.###.|#######.|##.#.##.|##...##.|##...##.|##...##.|........',
  N: '##...##.|###..##.|####.##.|##.####.|##..###.|##...##.|##...##.|........',
  O: '.####...|##..##..|##..##..|##..##..|##..##..|##..##..|.####...|........',
  P: '#####...|##..##..|##..##..|#####...|##......|##......|##......|........',
  Q: '.####...|##..##..|##..##..|##..##..|##..##..|##.##...|.##.##..|........',
  R: '#####...|##..##..|##..##..|#####...|##.##...|##..##..|##..##..|........',
  S: '.####...|##..##..|##......|.####...|....##..|##..##..|.####...|........',
  T: '######..|..##....|..##....|..##....|..##....|..##....|..##....|........',
  U: '##..##..|##..##..|##..##..|##..##..|##..##..|##..##..|.####...|........',
  V: '##..##..|##..##..|##..##..|##..##..|##..##..|.####...|..##....|........',
  W: '##...##.|##...##.|##...##.|##.#.##.|#######.|###.###.|##...##.|........',
  X: '##..##..|##..##..|.####...|..##....|.####...|##..##..|##..##..|........',
  Y: '##..##..|##..##..|##..##..|.####...|..##....|..##....|..##....|........',
  Z: '######..|....##..|...##...|..##....|.##.....|##......|######..|........',
  a: '........|........|.####...|....##..|.#####..|##..##..|.#####..|........',
  b: '##......|##......|#####...|##..##..|##..##..|##..##..|#####...|........',
  c: '........|........|.####...|##......|##......|##......|.####...|........',
  d: '....##..|....##..|.#####..|##..##..|##..##..|##..##..|.#####..|........',
  e: '........|........|.####...|##..##..|######..|##......|.####...|........',
  f: '..###...|.##.....|####....|.##.....|.##.....|.##.....|.##.....|........',
  g: '........|........|.#####..|##..##..|##..##..|.#####..|....##..|.####...',
  h: '##......|##......|#####...|##..##..|##..##..|##..##..|##..##..|........',
  i: '..##....|........|.###....|..##....|..##....|..##....|.####...|........',
  j: '....##..|........|...###..|....##..|....##..|....##..|##..##..|.####...',
  k: '##......|##......|##..##..|##.##...|####....|##.##...|##..##..|........',
  l: '.###....|..##....|..##....|..##....|..##....|..##....|...###..|........',
  m: '........|........|###.##..|#######.|##.#.##.|##.#.##.|##...##.|........',
  n: '........|........|#####...|##..##..|##..##..|##..##..|##..##..|........',
  o: '........|........|.####...|##..##..|##..##..|##..##..|.####...|........',
  p: '........|........|#####...|##..##..|##..##..|#####...|##......|##......',
  q: '........|........|.#####..|##..##..|##..##..|.#####..|....##..|....##..',
  r: '........|........|##.###..|###.....|##......|##......|##......|........',
  s: '........|........|.#####..|##......|.####...|....##..|#####...|........',
  t: '.##.....|.##.....|####....|.##.....|.##.....|.##.....|..###...|........',
  u: '........|........|##..##..|##..##..|##..##..|##..##..|.#####..|........',
  v: '........|........|##..##..|##..##..|##..##..|.####...|..##....|........',
  w: '........|........|##...##.|##.#.##.|##.#.##.|#######.|.##.##..|........',
  x: '........|........|##..##..|.####...|..##....|.####...|##..##..|........',
  y: '........|........|##..##..|##..##..|##..##..|.#####..|....##..|.####...',
  z: '........|........|######..|...##...|..##....|.##.....|######..|........',
  0: '.####...|##..##..|##.###..|###.##..|##..##..|##..##..|.####...|........',
  1: '..##....|.###....|..##....|..##....|..##....|..##....|.####...|........',
  2: '.####...|##..##..|....##..|...##...|..##....|.##.....|######..|........',
  3: '.####...|##..##..|....##..|..###...|....##..|##..##..|.####...|........',
  4: '...###..|..####..|.##.##..|##..##..|######..|....##..|....##..|........',
  5: '######..|##......|#####...|....##..|....##..|##..##..|.####...|........',
  6: '.####...|##......|#####...|##..##..|##..##..|##..##..|.####...|........',
  7: '######..|....##..|...##...|..##....|..##....|..##....|..##....|........',
  8: '.####...|##..##..|##..##..|.####...|##..##..|##..##..|.####...|........',
  9: '.####...|##..##..|##..##..|.#####..|....##..|....##..|.####...|........',
  '.': '........|........|........|........|........|..##....|..##....|........',
  ',': '........|........|........|........|........|..##....|..##....|.##.....',
  ':': '........|..##....|..##....|........|........|..##....|..##....|........',
  ';': '........|..##....|..##....|........|........|..##....|..##....|.##.....',
  '!': '..##....|..##....|..##....|..##....|..##....|........|..##....|........',
  '¡': '........|..##....|........|..##....|..##....|..##....|..##....|..##....',
  '?': '.####...|##..##..|....##..|...##...|..##....|........|..##....|........',
  "'": '..##....|..##....|.##.....|........|........|........|........|........',
  '`': '.##.....|.##.....|..##....|........|........|........|........|........',
  '"': '##.##...|##.##...|##.##...|........|........|........|........|........',
  '-': '........|........|........|######..|........|........|........|........',
  '=': '........|........|######..|........|######..|........|........|........',
  '+': '........|..##....|..##....|######..|..##....|..##....|........|........',
  '(': '...##...|..##....|.##.....|.##.....|.##.....|..##....|...##...|........',
  ')': '.##.....|..##....|...##...|...##...|...##...|..##....|.##.....|........',
  '[': '.####...|.##.....|.##.....|.##.....|.##.....|.##.....|.####...|........',
  ']': '.####...|...##...|...##...|...##...|...##...|...##...|.####...|........',
  '<': '....##..|...##...|..##....|.##.....|..##....|...##...|....##..|........',
  '>': '.##.....|..##....|...##...|....##..|...##...|..##....|.##.....|........',
  '#': '.##.##..|.##.##..|#######.|.##.##..|#######.|.##.##..|.##.##..|........',
  '%': '##...#..|##..##..|...##...|..##....|.##.....|##..##..|#...##..|........',
  '&': '.###....|##.##...|.###....|.###.##.|##.###..|##..##..|.###.##.|........',
  '*': '........|.##.##..|..###...|#######.|..###...|.##.##..|........|........',
  '@': '.#####..|##...##.|##.####.|##.####.|##.###..|##......|.#####..|........',
  '^': '..##....|.####...|##..##..|........|........|........|........|........',
  '~': '........|........|.###.##.|##.###..|........|........|........|........',
  '$': '..##....|.#####..|##......|.####...|....##..|#####...|..##....|........',
  '|': '...##...|...##...|...##...|...##...|...##...|...##...|...##...|...##...',
  '¦': '...##...|...##...|...##...|........|........|...##...|...##...|...##...',
  '¬': '........|........|........|######..|....##..|....##..|........|........',
  '°': '.###....|##.##...|.###....|........|........|........|........|........',
  '·': '........|........|........|..##....|..##....|........|........|........',
  '©': '.#####..|#.....#.|#.###.#.|#.#...#.|#.###.#.|#.....#.|.#####..|........',
  '×': '........|##..##..|.####...|..##....|.####...|##..##..|........|........',
  '¾': '###...#.|.##..#..|###.#...|...#.#..|..#.##..|.#.####.|#....#..|........',
  '½': '#....#..|#...#...|#..#....|..#.##..|.#...#..|#...#...|....###.|........',
};
const FONT = new Map();
for (const [ch, src] of Object.entries(FONT_SRC)) {
  const rows = src.split('|');
  if (rows.length !== 8 || rows.some((r) => r.length !== 8)) throw new Error(`bad glyph ${ch}`);
  const rects = [];
  rows.forEach((r, y) => {
    let x = 0;
    while (x < 8) {
      if (r[x] !== '#') { x++; continue; }
      let e = x; while (e < 8 && r[e] === '#') e++;
      rects.push([x, y, e - x, 1]); x = e;
    }
  });
  FONT.set(ch, rects);
}
// The structural marks are geometry, not bitmaps: the slash is a full-cell diagonal that leans one
// pixel into its neighbours so stacked slashes make one unbroken line, the underscore is the
// cell's floor, the macron its ceiling.
FONT.set('/', Array.from({ length: 8 }, (_, r) => [6 - r, r, 2, 1]));
FONT.set('\\', Array.from({ length: 8 }, (_, r) => [r, r, 2, 1]));
FONT.set('_', [[0, 7, 8, 1]]);
FONT.set('¯', [[0, 0, 8, 1]]);
// merge vertically identical runs
function mergeV(rects) {
  const out = [];
  const key = (r) => `${r[0]},${r[2]}`;
  const open = new Map();
  for (const r of [...rects].sort((a, b) => a[1] - b[1] || a[0] - b[0])) {
    const k = key(r); const o = open.get(k);
    if (o && o[1] + o[3] === r[1]) o[3] += r[3];
    else { const n = [...r]; open.set(k, n); out.push(n); }
  }
  return out;
}
const rectsD = (rects, ox = 0, oy = 0) => rects.map(([x, y, w, h]) => `M${ox + x} ${oy + y}h${w}v${h}h${-w}z`).join('');

// ---------------------------------------------------------------------------------------------
// The sheared block alphabet. A letter is a mask of design cells; every row of the mask is one
// text row, pushed one column further right than the row below it. A run of cells becomes
// slash, fill, slash. Where nothing sits above a cell it gets an underscore on the row above
// (a floor seen from above is a ceiling), and where nothing sits below it gets a macron on the
// row below, which is the whole reason the macron exists in this style.
// ---------------------------------------------------------------------------------------------
// fill: a dense character packed into every stroke (the floor then has to be a macron on the next
// row). stipple: a light character dropped into whatever is left empty inside an outline stroke.
function shear(mask, { fill = null, stipple = null } = {}) {
  const H = mask.length, W = Math.max(...mask.map((r) => r.length));
  const at = (r, x) => r >= 0 && r < H && x >= 0 && x < W && mask[r][x] === 'X';
  const gw = W + H + 2, gh = H + 2;
  const g = Array.from({ length: gh }, () => new Array(gw).fill(' '));
  const sh = (r) => H - 1 - r;                 // mask row r is grid row r + 1
  const inside = [];
  for (let r = 0; r < H; r++) {
    let x = 0;
    while (x < W) {
      if (!at(r, x)) { x++; continue; }
      let e = x; while (at(r, e)) e++;
      g[r + 1][x + sh(r)] = '/';
      g[r + 1][e + sh(r)] = '/';
      for (let c = x + sh(r) + 1; c < e + sh(r); c++) { g[r + 1][c] = fill || ' '; inside.push([r + 1, c]); }
      x = e;
    }
  }
  for (let r = 0; r < H; r++) {
    for (let x = 0; x < W; x++) {
      if (!at(r, x)) continue;
      if (!at(r - 1, x)) { const c = x + sh(r) + 1; if (g[r][c] === ' ') g[r][c] = '_'; }
      if (!at(r + 1, x)) {
        if (fill) { const c = x + sh(r); if (g[r + 2][c] === ' ') g[r + 2][c] = '¯'; else if (g[r + 2][c] === '_') g[r + 2][c] = '='; }
        else { const c = x + sh(r); if (g[r + 1][c] === ' ') g[r + 1][c] = '_'; }
      }
    }
  }
  if (stipple) for (const [r, c] of inside) if (g[r][c] === ' ') g[r][c] = stipple;
  return g.map((row) => row.join('').replace(/\s+$/, ''));
}
// Letters side by side in design space. gaps[i] is the space after letter i; a negative gap
// kerns the next letter over this one (the T of ULTRA sits over the foot of the L).
function wordMask(letters, gaps) {
  const H = letters[0].length;
  let x = 0; const spans = [];
  letters.forEach((L, i) => { const w = Math.max(...L.map((r) => r.length)); spans.push([x, w]); x += w + (Array.isArray(gaps) ? (gaps[i] ?? 0) : gaps); });
  const W = Math.max(...spans.map(([x0, w]) => x0 + w));
  const g = Array.from({ length: H }, () => new Array(W).fill('.'));
  letters.forEach((L, i) => L.forEach((row, r) => [...row].forEach((c, k) => { if (c === 'X') g[r][spans[i][0] + k] = 'X'; })));
  return { mask: g.map((r) => r.join('')), spans };
}

// The small alphabet, on a coarse grid: two half-stems, a counter, two half-stems across, and
// bar, gap, bar, gap, bar down. One table gives every weight: the slim outline of SATISFACTORY,
// the filled slab of ITEMS and the dotted one of BUILDINGS only differ in the widths fed in.
const COARSE = {
  A: ['#####', '##.##', '#####', '##.##', '##.##'],
  B: ['####.', '##.##', '####.', '##.##', '####.'],
  C: ['#####', '##...', '##...', '##...', '#####'],
  D: ['####.', '##.##', '##.##', '##.##', '####.'],
  E: ['#####', '##...', '####.', '##...', '#####'],
  F: ['#####', '##...', '####.', '##...', '##...'],
  G: ['#####', '##...', '##.##', '##.##', '#####'],
  I: ['##', '##', '##', '##', '##'],
  J: ['...##', '...##', '...##', '##.##', '#####'],
  L: ['##...', '##...', '##...', '##...', '#####'],
  M: ['#######', '##.#.##', '##.#.##', '##.#.##', '##.#.##'],
  N: ['#####', '##.##', '##.##', '##.##', '##.##'],
  O: ['#####', '##.##', '##.##', '##.##', '#####'],
  R: ['#####', '##.##', '####.', '##.##', '##.##'],
  S: ['#####', '##...', '#####', '...##', '#####'],
  U: ['##.##', '##.##', '##.##', '##.##', '#####'],
  V: ['##.##', '##.##', '##.##', '##.##', '.###.'],
};
function letterMask(ch, { a = 1, b = 1, cw = 1, g = 1 }) {
  const sw = a + b, W = 2 * sw + cw;
  const heights = [1, g, 1, g, 1];
  const rep = (row, n) => Array.from({ length: n }, () => row);
  if (ch === 'T' || ch === 'Y') {
    const s = (W - sw) % 2 ? sw + 1 : sw, side = (W - s) / 2;
    const bar = 'X'.repeat(W), stem = '.'.repeat(side) + 'X'.repeat(s) + '.'.repeat(side);
    const arms = 'X'.repeat(sw) + '.'.repeat(cw) + 'X'.repeat(sw);
    return ch === 'T' ? [bar, ...rep(stem, 2 * g + 2)] : [...rep(arms, 1 + g), bar, ...rep(stem, g + 1)];
  }
  const pat = COARSE[ch];
  if (!pat) throw new Error(`no letter ${ch}`);
  const n = pat[0].length;
  const widths = n === 2 ? [a, b] : n === 5 ? [a, b, cw, b, a] : [a, b, cw, sw, cw, b, a];
  const out = [];
  pat.forEach((row, i) => {
    const s = [...row].map((c, j) => (c === '#' ? 'X' : '.').repeat(widths[j])).join('');
    out.push(...rep(s, heights[i]));
  });
  return out;
}
const logo = (text, weight, { fill = null, stipple = null, gap = 1 } = {}) => shear(wordMask([...text].map((c) => letterMask(c, weight)), gap).mask, { fill, stipple });

// ULTRA is cut by hand: six rows, four-cell stems, two-row counters so that ceiling and floor
// never have to share a cell.
const BIG = {
  U: [...Array(5).fill('XXXX....XXXX'), 'XXXXXXXXXXXX'],
  L: [...Array(5).fill('XXXX......'), 'XXXXXXXXXX'],
  T: ['XXXXXXXXXXXX', ...Array(5).fill('....XXXX....')],
  R: ['XXXXXXXXXXXX', 'XXXX....XXXX', 'XXXX....XXXX', 'XXXXXXXXXXXX', 'XXXX........', 'XXXX........'],
  A: ['..XXXXXXXXXX', 'XXXX....XXXX', 'XXXX....XXXX', 'XXXXXXXXXXXX', 'XXXX....XXXX', 'XXXX....XXXX'],
};
function ultraLogo(fill) {
  const { mask, spans } = wordMask([...'ULTRA'].map((c) => BIG[c]), [2, -2, 2, 3]);
  const g = shear(mask, { fill }).map((r) => [...r.padEnd(80)]);
  // The leg of the R kicks out against the slant: the one backslash stroke in the logo.
  const x = spans[3][0];
  const put = (r, c, s) => [...s].forEach((ch, i) => { g[r][c + i] = ch; });
  const leg = '\\' + fill.repeat(3) + '\\';
  put(5, x + 8, leg);
  put(6, x + 9, leg);
  put(7, x + 10, '¯¯¯¯');
  return g.map((r) => r.join('').replace(/\s+$/, ''));
}

// ---------------------------------------------------------------------------------------------
// The colly: one 80-column text file, built a row at a time. Text lives in columns 2..77 and
// the two rails run down columns 0 and 79 from the first line to the last.
// ---------------------------------------------------------------------------------------------
const COLS = 80, PAGE = 24, X0 = 2, TW = 76;
const LIVE = 'https://lukexyz.github.io/ULTRA-SATISFACTORY/';
const LIVE_TXT = 'lukexyz.github.io/ULTRA-SATISFACTORY';

const rows = [];
const blank = () => Array.from({ length: COLS }, () => ({ ch: ' ', ink: 't', href: null }));
const ensure = (r) => { while (rows.length <= r) rows.push(blank()); };
function put(r, c, str, ink = 't', href = null) {
  ensure(r);
  [...str].forEach((ch, i) => {
    if (ch === ' ') return;
    if (c + i < X0 || c + i >= X0 + TW) throw new Error(`row ${r}: "${str}" leaves the text area at col ${c + i}`);
    if (!FONT.has(ch)) throw new Error(`row ${r}: no glyph for "${ch}"`);
    rows[r][c + i] = { ch, ink, href };
  });
}
// Inline markup: {b|bright} {d|dim} {c|cyan} {a:href|a link, drawn bright}.
function parse(str, ink) {
  const out = []; let last = 0;
  const re = /\{(b|d|c|a:[^|]+)\|([^}]*)\}/g;
  for (let m; (m = re.exec(str));) {
    if (m.index > last) out.push({ s: str.slice(last, m.index), ink, href: null });
    if (m[1].startsWith('a:')) out.push({ s: m[2], ink: 'b', href: m[1].slice(2) });
    else out.push({ s: m[2], ink: m[1], href: null });
    last = re.lastIndex;
  }
  if (last < str.length) out.push({ s: str.slice(last), ink, href: null });
  return out;
}
const plainLen = (str) => parse(str, 't').reduce((n, p) => n + [...p.s].length, 0);
function text(r, str, { ink = 't', c = X0, align = 'left' } = {}) {
  const len = plainLen(str);
  let x = align === 'center' ? X0 + Math.floor((TW - len) / 2) : c;
  for (const p of parse(str, ink)) { put(r, x, p.s, p.ink, p.href); x += [...p.s].length; }
}
// Scene case: first letter small, the rest capitals, and every I small wherever it falls.
const sc = (s) => s.replace(/[A-Za-z][A-Za-z']*/g, (w) => (w[0].toLowerCase() + w.slice(1).toUpperCase()).replace(/I/g, 'i'));
const spaced = (s) => [...sc(s)].join(' ');

// Prose: plain lower case, wrapped to the text column. Returns the number of rows used.
const PC = X0 + 2, PW = 72;
function para(r, str, max) {
  const out = [''];
  for (const w of str.split(' ')) {
    const cur = out[out.length - 1];
    if (cur && cur.length + 1 + w.length > PW) out.push(w); else out[out.length - 1] = cur ? `${cur} ${w}` : w;
  }
  if (out.length > max) throw new Error(`paragraph at row ${r} needs ${out.length} rows, has ${max}: ${out.join(' / ')}`);
  out.forEach((l, i) => text(r + i, l, { c: PC }));
  return out.length;
}

// A logo block: outline in one ink, the dense fill in another.
function block(r, c, lines, ink, fillInk = 'd') {
  lines.forEach((ln, i) => [...ln].forEach((ch, k) => {
    if (ch !== ' ') put(r + i, c + k, ch, '×¾·:'.includes(ch) ? fillInk : ink);
  }));
}
const blockWidth = (lines) => Math.max(...lines.map((l) => [...l].length));
const centred = (lines) => X0 + Math.floor((TW - blockWidth(lines)) / 2);

// Section header: a tab cut out of a rule that runs to the right margin.
function header(r, title) {
  const t = spaced(title), n = [...t].length;
  put(r, X0 + 3, '_'.repeat(n + 2), 'd');
  put(r + 1, X0, '__/', 'd');
  put(r + 1, X0 + 4, t, 'b');
  put(r + 1, X0 + 5 + n, '\\', 'd');
  put(r + 1, X0 + 6 + n, '_'.repeat(TW - 6 - n), 'd');
}
// Credit rule: tag, logo number and client, and who asked for it.
function credit(r, mid, right) {
  const tag = 'pG!/m&c';
  const free = TW - (3 + tag.length + 2 + [...mid].length + 2 + [...right].length + 3);
  if (free < 4) throw new Error(`credit rule too long on row ${r}`);
  const a = Math.floor(free / 2), b = free - a;
  let x = X0;
  const seg = (s, ink) => { put(r, x, s, ink); x += [...s].length; };
  seg('-- ', 'd'); seg(tag, 'b'); seg(' ' + '-'.repeat(a) + ' ', 'd'); seg(mid, 't');
  seg(' ' + '-'.repeat(b) + ' ', 'd'); seg(right, 't'); seg(' -¬', 'd');
}
// A frame with an underscore lid, broken-bar walls and a macron floor.
function frame(r, n) {
  put(r, X0, '_'.repeat(TW), 'd');
  for (let i = 1; i <= n; i++) { put(r + i, X0, '¦', 'd'); put(r + i, X0 + TW - 1, '¦', 'd'); }
  put(r + n + 1, X0, '¯'.repeat(TW), 'd');
}

// ---- page 1: the advert, the logo, the title frame ---------------------------------------------
let R = 0;
text(R, `{d|°·} wHQ: {b|nO rAiLiNGS} {d|·} {a:${LIVE}|${LIVE_TXT}} {d|·} nO mODEM {d|·°}`, { align: 'center' });
const ULTRA = ultraLogo('×');
const SATIS = logo('SATISFACTORY', { a: 1, b: 1, cw: 1, g: 1 }, { stipple: '·' });
block(1, 9, ULTRA, 'c', 'x');
block(9, 2, SATIS, 'w', 's');
// Tails: the rules of the logo run on until they meet a rail. In the animation they are a belt
// (see RIDES below): in at the top left, out at the foot of the A, in again over the S, out at
// the foot of the Y.
const TAILS = [
  { r: 1, c: 2, n: 13, ch: '_', ink: 'c' },
  { r: 8, c: 73, n: 5, ch: '¯', ink: 'c' },
  { r: 9, c: 2, n: 5, ch: '_', ink: 'w' },
  { r: 14, c: 68, n: 10, ch: '_', ink: 'w' },
];
TAILS.forEach((t) => put(t.r, t.c, t.ch.repeat(t.n), t.ink));
credit(16, 'u L T R A - s A T i S F A C T O R Y', sc('req. by: nobody'));
frame(18, 3);
text(19, `{b|mACRON & cHEESE} pRESENT a cOMPANiON aPP fOR tHE gAME sATiSFACTORY:`, { align: 'center' });
text(20, sc('every recipe, building and Space Elevator objective, one click apart.'), { align: 'center', ink: 'b' });
text(21, `140 iTEMS {d|·} 211 rECiPES {d|·} 477 bUiLDiNGS {d|·} 5 pHASES {d|·} uNOFFiCiAL fAN wORK`, { align: 'center' });

// ---- page 2: index and introduction ---------------------------------------------------------------
R = PAGE;
header(R + 1, 'index');
const INDEX = [
  ['00', 'open it live', LIVE, `${LIVE_TXT}, nO iNSTALL`],
  ['01', "what's inside", '#whats-inside', sc('three tabs: objectives, items, buildings')],
  ['02', 'run it locally', '#run-it-locally', sc('two commands and a python')],
  ['03', "how it's built", '#how-its-built', sc('one streamlit file, one very large json')],
  ['04', 'data & credits', '#data--credits', sc('respects where they are due')],
  ['05', 'license', '#license', sc('apache 2.0. protection: none.')],
];
INDEX.forEach(([n, name, href, note], i) => {
  const nm = sc(name);
  text(R + 4 + i, `{b|${n}} {d|·} {a:${href}|${nm}} {d|${'.'.repeat(18 - [...nm].length)}} ${note}`, { c: PC });
});
header(R + 11, 'intro');
para(R + 14, 'you are standing in your factory holding a conveyor belt, and you have forgotten what goes into a modular frame. again. this file is for that.', 2);
para(R + 17, 'ultra-satisfactory is a lookup tool you keep open beside the game: second monitor, phone, or one alt-tab away. three tabs, and everything is a link. click an ingredient or a product for its recipe, the machine for its building. it is an unofficial fan project, not affiliated with coffee stain studios, and it is free: apache 2.0, no protection to remove.', 6);

// ---- page 3: logo 01, OBJECTIVES --------------------------------------------------------------------
R = PAGE * 2;
const OBJ = logo('OBJECTIVES', { a: 1, b: 1, cw: 2, g: 1 });
block(R + 1, centred(OBJ), OBJ, 'w');
credit(R + 8, sc('logo 01 · objectives'), sc('req. by: the space elevator'));
para(R + 10, 'pick a space elevator phase. see the parts it wants and how many. click a part for its recipe. deliver. the elevator does not say thank you.', 2);
text(R + 13, sc('phase   theme                    wants     for example'), { c: PC, ink: 'd' });
[
  ['1', 'Automation basics', '3', 'Smart Plating', '50'],
  ['2', 'Logistics & steel', '4', 'Modular Frame', '500'],
  ['3', 'Oil & computers', '3', 'Versatile Framework', '2500'],
  ['4', 'Nuclear & endgame', '4', 'Nuclear Pasta', '100'],
  ['5', 'Alien tech & quantum', '4', 'Ballistic Warp Drive', '100'],
].forEach(([n, theme, parts, eg, qty], i) => {
  text(R + 14 + i, `  {b|${n}}     ${sc(theme).padEnd(25)}${parts} ${sc('parts')}   ${sc(eg)} {b|×${qty}}`, { c: PC });
});
para(R + 20, '18 line items over 5 phases. the last one wants a ballistic warp drive, a hundred times, and you are expected to supply your own enthusiasm.', 2);

// ---- page 4: logo 02, ITEMS ---------------------------------------------------------------------------
R = PAGE * 3;
const ITM = logo('ITEMS', { a: 1, b: 3, cw: 3, g: 2 }, { fill: '¾', gap: 2 });
block(R + 1, centred(ITM), ITM, 'w', 'y');
credit(R + 10, sc('logo 02 · items'), sc('req. by: a starved constructor'));
para(R + 12, 'type three letters, click a row. the recipe card appears, looking smug.', 1);
frame(R + 13, 4);
text(R + 14, `{b|mODULAR fRAME}${' '.repeat(28)}aSSEMBLER {d|·} 60 s cYCLE {d|·} 15 MW`, { c: PC });
text(R + 15, `  {d|iN }   3 {d|/miN}  ${sc('Reinforced Iron Plate')}`, { c: PC });
text(R + 16, `  {d|iN }  12 {d|/miN}  ${sc('Iron Rod')}`, { c: PC });
text(R + 17, `  {d|oUT}   2 {d|/miN}  {b|${sc('Modular Frame')}}`, { c: PC });
para(R + 19, 'every name on the card is a link. 140 items, 211 recipes, and 88 of those are alternates, for when the normal way feels too easy.', 2);

// ---- page 5: logo 03, BUILDINGS ------------------------------------------------------------------------
R = PAGE * 4;
const BLD = logo('BUILDINGS', { a: 1, b: 2, cw: 2, g: 1 }, { stipple: ':' });
block(R + 1, centred(BLD), BLD, 'w');
credit(R + 8, sc('logo 03 · buildings'), sc('req. by: the tidy-factory people'));
para(R + 10, 'every building and what it makes, grouped by tier, with mk-by-mk upgrade paths for miners, conveyors, pipelines and storage.', 2);
[
  [['333', 'structure'], ['26', 'decor'], ['7', 'special']],
  [['59', 'logistics'], ['15', 'power'], ['7', 'storage']],
  [['9', 'production'], ['14', 'transit'], ['7', 'extraction']],
].forEach((row, i) => {
  text(R + 13 + i, row.map(([n, k]) => `{b|${n.padStart(5)}}  ${sc(k).padEnd(15)}`).join(''), { c: PC });
});
text(R + 16, `{d|-----}`, { c: PC });
text(R + 17, `{b|  477}  ${sc('buildings a pioneer can put down')}`, { c: PC });
para(R + 19, 'the 9 that run every recipe: assembler, blender, constructor, foundry, manufacturer, packager, particle accelerator, refinery, smelter.', 2);
text(R + 22, 'the other 468 are there so the tidy people have something to align.', { c: PC });

// ---- page 6: run it, greets, respects ------------------------------------------------------------------
R = PAGE * 5;
header(R, 'run it');
text(R + 3, '{b|python -m pip install -r requirements.txt}', { c: PC });
text(R + 4, `{b|python -m streamlit run app/app.py}     {d|(}pYTHON 3.10+, fROM tHE rEPO rOOT{d|)}`, { c: PC });
text(R + 5, `then localhost:8501. or skip both: {a:${LIVE}|${LIVE_TXT}}`, { c: PC });
header(R + 6, 'greets');
text(R + 9, ['screw box seven', 'pipe through wall', 'fuse? what fuse', 'cell b7'].map(sc).join(' {d|·} '), { c: PC });
text(R + 10, ['grid-snap orthodox', 'noodle reformed', 'overclocked & underfed'].map(sc).join(' {d|·} '), { c: PC });
header(R + 12, 'respects');
text(R + 15, '{b|greeny/SatisfactoryTools} for the game data. the {b|Satisfactory Wiki} for', { c: PC });
text(R + 16, 'the item and building images (CC BY-NC-SA 4.0). {b|Coffee Stain Studios}', { c: PC });
text(R + 17, 'for the game: they had no part in this file and are not to blame.', { c: PC });
text(R + 18, 'and everyone who ever drew a letter out of two slashes and a macron.', { c: PC });
put(R + 20, X0, '_'.repeat(TW), 'd');
text(R + 22, `{d|°·} {b|¡eOF!} {d|·} ${sc('code: apache 2.0')} {d|·} {b|pG!} oF {b|mACRON & cHEESE} {d|·} ${sc('wraps to top')} {d|·°}`, { align: 'center' });
ensure(PAGE * 6 - 1);
if (rows.length !== PAGE * 6) throw new Error(`colly is ${rows.length} rows, expected ${PAGE * 6}`);
const NPAGES = rows.length / PAGE;

const dumpText = () => rows.map((row, r) => ':' + row.slice(1, 79).map((c) => c.ch).join('') + ':').join('\n');
if (process.argv.includes('--dump')) { console.log(dumpText()); }

// ---------------------------------------------------------------------------------------------
// SVG
// ---------------------------------------------------------------------------------------------
const INK = {
  t: '#a4b8c1',   // body text
  b: '#f1f8fa',   // bright: headings, tags, numbers, links
  d: '#4f6a77',   // dim: rails, rules, leaders, dense fills
  w: '#f1f8fa',   // outline logos
  c: '#00cfff',   // ULTRA outline (the app's cyan)
  x: '#0a84aa',   // ULTRA fill
  y: '#4f6a77',   // ITEMS fill
  s: '#4f6a77',   // SATISFACTORY stipple
};
const BG = '#05080b', BAR = '#0f161c', EDGE = '#22313b';
const CW = 8, CH = 16;
const PADX = 12, BARH = 22, PADY = 8, TRACK = 8;
const VIEW_H = PAGE * CH;
const VBW = PADX + COLS * CW + 8 + TRACK + 8, VBH = BARH + PADY + VIEW_H + PADY + BARH;
const TX = PADX, TY = BARH + PADY;

// Glyph ids are handed out by frequency, so the fifty-two busiest characters get one letter.
const glyphId = new Map();
const AZ = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const gid = (ch) => {
  if (!glyphId.has(ch)) { const i = glyphId.size; glyphId.set(ch, i < 52 ? AZ[i] : AZ[Math.floor(i / 52) - 1] + AZ[i % 52]); }
  return glyphId.get(ch);
};
{
  const freq = new Map();
  for (const row of rows) for (const c of row) if (c.ch !== ' ' && c.ch !== '_' && c.ch !== '¯') freq.set(c.ch, (freq.get(c.ch) || 0) + 1);
  [...freq].sort((a, b) => b[1] - a[1] || a[0].codePointAt(0) - b[0].codePointAt(0)).forEach(([ch]) => gid(ch));
}
const use = (ch, x, y) => `<use href="#${gid(ch)}"${x ? ` x="${x}"` : ''}${y ? ` y="${y}"` : ''}/>`;
// a line of chrome text (title and status bars), in 8 x 8 units
function chrome(str, x, y, ink) {
  let s = '';
  [...str].forEach((ch, i) => { if (ch !== ' ') s += use(ch, i * 8, 0); });
  return `<g transform="translate(${x} ${y}) scale(1 2)" fill="${ink}">${s}</g>`;
}

// The belt. Every CYCLE seconds one item rides the logo's rules: in along the rule at the top
// left, through the fill of ULTRA as a highlight, out along the tail of the A, back in on the
// rule over the S, through the stipple of SATISFACTORY and out along the tail of the Y. CYCLE
// divides the scroll loop exactly, so the two never drift.
const CYCLE = 8;
const BELT = {
  x: { start: 0.8, dur: 2.2, hi: '#b4f0ff' },   // ULTRA
  s: { start: 3.9, dur: 2.2, hi: '#f1f8fa' },   // SATISFACTORY
  y: { start: 0.8, dur: 2.2, hi: '#e6f2f6' },   // ITEMS, three pages down
};
// The item is a 6 x 3 pixel box sitting on the rule, in the app's accent gold: the one spot of a
// third colour in the piece, so the belt can be seen on a white rule as well as a cyan one. One
// ride per tail: where it starts, how far it goes, when it sets off and how long it takes.
const RIDE_TIMES = [[0, 0.8], [3.0, 0.3], [3.6, 0.3], [6.1, 0.6]];
const ITEM_W = 6, ITEM_H = 3, ITEM_INK = '#e8d44d';
const RIDES = TAILS.map((t, i) => ({
  x: t.c * 8, y: t.r * 8 + (t.ch === '_' ? 4 : -3), dist: t.n * 8 - ITEM_W, start: RIDE_TIMES[i][0], secs: RIDE_TIMES[i][1],
}));

// One page of the colly as SVG: per ink, the underscores and macrons merged into long rules
// (that is what they are), everything else a <use> of its glyph.
const css = [];
function pageSvg(p) {
  const by = new Map();    // ink -> { rules: '', rows: Map(r -> string) }
  const slot = (ink) => { if (!by.has(ink)) by.set(ink, { rules: '', rows: new Map() }); return by.get(ink); };
  const belts = new Map();     // ink -> Map(diagonal -> uses): the fills a highlight runs through
  for (let r = p * PAGE; r < (p + 1) * PAGE; r++) {
    const y = (r - p * PAGE) * 8;
    let c = 0;
    while (c < COLS) {
      const cell = rows[r][c];
      if (cell.ch === ' ') { c++; continue; }
      if (cell.ch === '_' || cell.ch === '¯') {
        let e = c; while (e < COLS && rows[r][e].ch === cell.ch && rows[r][e].ink === cell.ink) e++;
        slot(cell.ink).rules += `M${c * 8} ${y + (cell.ch === '_' ? 7 : 0)}h${(e - c) * 8}v1h${-(e - c) * 8}z`;
        c = e; continue;
      }
      if (BELT[cell.ink]) {
        if (!belts.has(cell.ink)) belts.set(cell.ink, new Map());
        const m = belts.get(cell.ink), d = c + (r - p * PAGE);   // a diagonal of the shear
        m.set(d, (m.get(d) || '') + use(cell.ch, c * 8, y));
      } else {
        const s = slot(cell.ink);
        s.rows.set(y, (s.rows.get(y) || '') + use(cell.ch, c * 8, 0));
      }
      c++;
    }
  }
  let out = '';
  for (const [ink, { rules, rows: rr }] of by) {
    out += `<g class="${ink}">`;
    if (rules) out += `<path d="${rules}"/>`;
    for (const [y, s] of rr) out += y ? `<g transform="translate(0 ${y})">${s}</g>` : s;
    out += '</g>';
  }
  for (const [ink, m] of belts) {
    const ds = [...m.keys()].sort((x, y) => x - y);
    const d0 = ds[0], span = ds[ds.length - 1] - d0;
    const { start, dur } = BELT[ink];
    out += `<g class="${ink}">` + ds.map((d) => `<g style="animation-delay:${(start + ((d - d0) / span) * dur - CYCLE).toFixed(2)}s">${m.get(d)}</g>`).join('') + '</g>';
  }
  if (p === 0) out += RIDES.map(({ x, y }, i) => `<rect class="q q${i}" x="${x}" y="${y}" width="${ITEM_W}" height="${ITEM_H}"/>`).join('');
  return out;
}

// Timeline: hold a page, glide to the next, and after the last page glide on to a second copy of
// the first, which is where the loop restarts unseen.
const HOLD = [7, 8, 7, 7, 7, 8], GLIDE = 2;
const TOTAL = HOLD.reduce((a, b) => a + b, 0) + GLIDE * NPAGES;
const pct = (t) => `${+((t / TOTAL) * 100).toFixed(3)}%`;
{
  let t = 0; const kf = [];
  const knobTravel = VIEW_H - 4 - Math.round((VIEW_H - 4) / NPAGES);
  const kn = [];
  for (let p = 0; p < NPAGES; p++) {
    const y = -p * VIEW_H, ky = +(knobTravel * p / (NPAGES - 1)).toFixed(1);
    kf.push(`${pct(t)}{transform:translateY(${y}px);animation-timing-function:linear}`);
    kn.push(`${pct(t)}{transform:translateY(${ky}px);animation-timing-function:linear}`);
    t += HOLD[p];
    kf.push(`${pct(t)}{transform:translateY(${y}px);animation-timing-function:cubic-bezier(.5,0,.2,1)}`);
    kn.push(`${pct(t)}{transform:translateY(${ky}px);animation-timing-function:cubic-bezier(.5,0,.2,1)}`);
    t += GLIDE;
  }
  kf.push(`100%{transform:translateY(${-NPAGES * VIEW_H}px)}`);
  kn.push('100%{transform:translateY(0px)}');
  css.push(`@keyframes sc{${kf.join('')}}`, `@keyframes kn{${kn.join('')}}`);
  css.push(`.sc{animation:sc ${TOTAL}s infinite}.kn{animation:kn ${TOTAL}s infinite}`);
  // page number in the status bar: each digit is lit from mid-glide to mid-glide
  let s = 0;
  for (let p = 0; p < NPAGES; p++) {
    const on = p === 0 ? 0 : s - GLIDE / 2, off = s + HOLD[p] + GLIDE / 2;
    const frames = p === 0
      ? `0%{opacity:1}${pct(off)}{opacity:0}${pct(TOTAL - GLIDE / 2)}{opacity:1}`
      : `0%{opacity:0}${pct(on)}{opacity:1}${pct(off)}{opacity:0}`;
    css.push(`@keyframes n${p}{${frames}}.n${p}{animation:n${p} ${TOTAL}s step-end infinite}`);
    s += HOLD[p] + GLIDE;
  }
}
for (const [ink, { hi }] of Object.entries(BELT)) css.push(`@keyframes ${ink}{0%,100%{fill:${INK[ink]}}5%{fill:${hi}}15%{fill:${INK[ink]}}}.${ink} g{animation:${ink} ${CYCLE}s linear infinite}`);
RIDES.forEach(({ dist, start, secs }, i) => {
  const e = +((secs / CYCLE) * 100).toFixed(2);
  css.push(`@keyframes q${i}{0%{opacity:1;transform:translateX(0)}${e}%{opacity:1;transform:translateX(${dist}px)}${e + 0.01}%,100%{opacity:0;transform:translateX(${dist}px)}}.q${i}{animation:q${i} ${CYCLE}s linear ${(start - CYCLE).toFixed(1)}s infinite}`);
});
css.push(`.q{fill:${ITEM_INK};opacity:0}`);
if (TOTAL % CYCLE) throw new Error(`scroll loop ${TOTAL}s is not a whole number of ${CYCLE}s belt cycles`);
css.push(Object.entries(INK).map(([k, v]) => `.${k}{fill:${v}}`).join(''));
css.push('.n1,.n2,.n3,.n4,.n5{opacity:0}');
css.push('@media (prefers-reduced-motion:reduce){*{animation:none!important}}');

const pages = [];
for (let p = 0; p < NPAGES; p++) pages.push(`<g${p === 0 ? ' id="p0"' : ''}${p ? ` transform="translate(0 ${p * PAGE * 8})"` : ''}>${pageSvg(p)}</g>`);
const allRows = (NPAGES + 1) * PAGE * 8;
const rails = [4, (COLS - 1) * 8 + 4].map((x) => `<path d="M${x} 0V${allRows}"/>`).join('');

const titleL = 'uLTRA-sATiSFACTORY';
const titleR = 'aN aSCii cOLLY bY pARALLELOGRAHAM oF mACRON & cHEESE';
const statL = 'm&c!-uSAT.tXT';
const statM = `${COLS} ${sc('cols')} · ${rows.length} ${sc('lines')} · ${sc('line height')} 1`;
const barY = (VBH - BARH);
const knobH = Math.round((VIEW_H - 4) / NPAGES);
const trackX = PADX + COLS * CW + 8;

const TITLE = 'ULTRA-SATISFACTORY: an Amiga-style ASCII collection in a text viewer';
const DESC = 'A dark text-viewer window paging through an 80-column ASCII art collection. The first page is a full-width logo: ULTRA in cyan sheared slab capitals filled with multiplication signs, SATISFACTORY beneath it in slim white outline capitals, both drawn only from slashes, underscores and macrons, with a credit rule and a framed release line reading: a companion app for the game Satisfactory, every recipe, building and Space Elevator objective, one click apart; 140 items, 211 recipes, 477 buildings, 5 phases; unofficial fan work. The window then scrolls through an index, an introduction, one logo each for the three tabs OBJECTIVES, ITEMS and BUILDINGS, the two commands that run the app, greets and respects, and wraps back to the top.';

const body = `<g transform="translate(${TX} ${TY}) scale(1 2)"><g class="rl">${rails}</g>${pages.join('')}<use href="#p0" y="${NPAGES * PAGE * 8}"/></g>`;
const digits = Array.from({ length: NPAGES }, (_, p) => `<g class="n${p}">${use(String(p + 1), 0, 0)}</g>`).join('');
const pageLabel = `pAGE   oF ${NPAGES}`;
const pageX = VBW - 12 - pageLabel.length * 8;
const chromeSvg = [
  `<rect x=".5" y=".5" width="${VBW - 1}" height="${VBH - 1}" rx="9" fill="${BG}" stroke="${EDGE}"/>`,
  `<path d="M1 ${BARH}.5H${VBW - 1}M1 ${barY - 0.5}H${VBW - 1}" stroke="${EDGE}"/>`,
  `<path d="M9 1h${VBW - 18}a8 8 0 0 1 8 8v${BARH - 9}H1V9a8 8 0 0 1 8-8z" fill="${BAR}"/>`,
  `<path d="M1 ${barY}h${VBW - 2}v${BARH - 9}a8 8 0 0 1-8 8H9a8 8 0 0 1-8-8z" fill="${BAR}"/>`,
  chrome(titleL, 12, 3, INK.b),
  chrome(titleR, VBW - 12 - titleR.length * 8, 3, INK.d),
  chrome(statL, 12, barY + 3, INK.t),
  chrome(statM, 12 + (statL.length + 3) * 8, barY + 3, INK.d),
  chrome(pageLabel, pageX, barY + 3, INK.t),
  `<g transform="translate(${pageX + 5 * 8} ${barY + 3}) scale(1 2)" fill="${INK.b}">${digits}</g>`,
  `<rect x="${trackX}" y="${TY}" width="${TRACK}" height="${VIEW_H}" rx="2" fill="${BAR}" stroke="${EDGE}"/>`,
  `<g class="kn"><rect x="${trackX + 2}" y="${TY + 2}" width="${TRACK - 4}" height="${knobH}" rx="1" fill="${INK.d}"/></g>`,
].join('');

css.push(`.rl{fill:none;stroke:${INK.d};stroke-width:2;stroke-dasharray:2 2;stroke-dashoffset:-1}`);
const defs = () => [...glyphId].map(([ch, id]) => `<path id="${id}" d="${rectsD(mergeV(FONT.get(ch)))}"/>`).join('');
// build the body strings first (they register glyphs), then the defs
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VBW} ${VBH}" width="${VBW}" height="${VBH}" role="img" aria-labelledby="t0 d0">`
  + `<title id="t0">${TITLE}</title><desc id="d0">${DESC}</desc>`
  + `<style>${css.join('')}</style>`
  + `<defs>${defs()}<clipPath id="v0"><rect x="${TX - 4}" y="${TY}" width="${COLS * CW + 8}" height="${VIEW_H}"/></clipPath></defs>`
  + chromeSvg
  + `<g clip-path="url(#v0)"><g class="sc">${body}</g></g>`
  + '</svg>\n';

fs.writeFileSync(OUT_SVG, svg);
console.log(`wrote ${path.relative(process.cwd(), OUT_SVG)} (${(svg.length / 1024).toFixed(1)} KB, ${glyphId.size} glyphs, ${rows.length} rows, loop ${TOTAL}s)`);

// A static contact sheet of the whole colly, for working on the art: --sheet=<file.svg>
const sheetArg = process.argv.find((a) => a.startsWith('--sheet='));
if (sheetArg) {
  const H = rows.length * CH + 16;
  const sheet = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${COLS * CW + 16} ${H}" width="${COLS * CW + 16}" height="${H}">`
    + `<style>${Object.entries(INK).map(([k, v]) => `.${k}{fill:${v}}`).join('')}.rl{fill:none;stroke:${INK.d};stroke-width:2;stroke-dasharray:2 2;stroke-dashoffset:-1}</style>`
    + `<defs>${defs()}</defs><rect width="100%" height="100%" fill="${BG}"/>`
    + `<g transform="translate(8 8) scale(1 2)"><g class="rl">${rails}</g>${pages.join('')}</g></svg>`;
  fs.writeFileSync(sheetArg.slice(8), sheet);
}

// ---------------------------------------------------------------------------------------------
// Markdown. The colly is a text file, so the README gets it as text too: the index (with real
// links) on the first screen, and the whole file inside <details>.
// ---------------------------------------------------------------------------------------------
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function rowHtml(r, rightRail) {
  const cells = rows[r];
  let out = ':', i = 1;
  const end = rightRail ? COLS - 1 : (() => { let e = COLS - 1; while (e > 1 && cells[e - 1].ch === ' ') e--; return e; })();
  while (i < end) {
    const c = cells[i];
    const kind = c.ch === ' ' ? 'p' : c.href ? `a${c.href}` : c.ink === 'b' ? 'b' : 'p';
    let j = i, s = '';
    // a run of one kind; spaces inside a bold or linked run stay inside it
    while (j < end) {
      const d = cells[j];
      const k = d.href ? `a${d.href}` : d.ink === 'b' && d.ch !== ' ' ? 'b' : 'p';
      if (d.ch === ' ' && kind !== 'p') {
        let n = j; while (n < end && cells[n].ch === ' ') n++;
        const nk = n < end ? (cells[n].href ? `a${cells[n].href}` : cells[n].ink === 'b' ? 'b' : 'p') : 'p';
        if (nk !== kind || n - j > 1) break;
        s += ' '; j++; continue;
      }
      if (k !== kind) break;
      s += d.ch; j++;
    }
    out += kind === 'p' ? esc(s) : kind === 'b' ? `<b>${esc(s)}</b>` : `<a href="${c.href}">${esc(s)}</a>`;
    i = j;
  }
  return rightRail ? `${out}:` : out.replace(/\s+$/, '');
}
const preBlock = (from, to, rightRail) => Array.from({ length: to - from }, (_, k) => rowHtml(from + k, rightRail)).join('\n');

const ALT = 'ULTRA-SATISFACTORY as the opening of an Amiga ASCII collection, shown in a dark text viewer. '
  + 'A full-width logo is drawn from nothing but slashes, underscores and macrons: ULTRA in cyan sheared slab letters packed with multiplication signs, '
  + 'SATISFACTORY under it in slim white outline letters, their rules running out to a dotted rail down each margin while a small gold item rides them like a conveyor belt. '
  + 'Under the logo, a credit rule and a framed release line: a companion app for the game Satisfactory, every recipe, building and Space Elevator objective, one click apart; '
  + '140 items, 211 recipes, 477 buildings, 5 phases; unofficial fan work. '
  + 'The viewer then pages through an index, an intro, one logo each for the three tabs OBJECTIVES, ITEMS and BUILDINGS (with the five Space Elevator phases, a recipe card for Modular Frame and the building counts), '
  + 'the two commands that run the app, greets and respects, and wraps back to the top.';

const md = `<!-- Header ${SLUG} for ULTRA-SATISFACTORY. Generated by src/${SLUG}.mjs: edit that, not this. -->

<p align="center">
  <img src="assets/${SLUG}.svg" width="100%" alt="${ALT}">
</p>

<h1 align="center">ULTRA-SATISFACTORY</h1>

<p align="center">
  ⚡ <b>A companion app for the factory-building game <i>Satisfactory</i>: every recipe, building and Space Elevator objective, one click apart.</b><br>
  ⚡ Filed here as an Amiga ASCII collection: one text file, 80 columns, every letter cut from slashes, underscores and the macron. The viewer is paging through it for you, so both hands can stay on the belt.
</p>

<pre>
${preBlock(PAGE + 1, PAGE + 10, false)}
</pre>

⚡ Keep it open beside the game: second monitor, phone, or one alt-tab away. Three tabs. **Objectives**: pick a Space Elevator phase and see the parts it wants and how many. **Items**: search as you type, and every recipe card shows per-minute rates, the machine, its cycle time and its power draw. **Buildings**: every building and what it makes, grouped by tier, with Mk-by-Mk upgrade paths. Everything links, so finding out which input your Assembler is starving for costs one click and none of your dignity.

⚡ [Open it live in your browser](${LIVE}): nothing to install, no modem required. Or run it yourself with Python 3.10+ and the two commands under [Run it locally](#run-it-locally). Unofficial fan project, not affiliated with Coffee Stain Studios. Protection: none, it is Apache 2.0. The crew, the artist, the board and everyone in the greets exist only in this file.

<details>
<summary>⚡ <b>m&amp;c!-uSAT.tXT</b>: the whole collection as the text file it is. Three more logos, a recipe card, greets and respects</summary>

<br>

⚡ This is the file the viewer is reading, all ${rows.length} lines of it. A colly was drawn for a screen font with no gap between its rows, so the macron of one row sat on the underscore of the row above and stacked slashes made one long diagonal. GitHub sets code at a line height of 1.45, which pulls every one of those joins apart, and that is the only reason the header is an image. The text has its own advantage: the links work.

<pre>
${preBlock(0, rows.length, true)}
</pre>

⚡ Drawn by <code>src/${SLUG}.mjs</code>: a sheared block alphabet, a rail, an index and a credit-rule formatter, which is about as much machinery as one Constructor. No logo, tag, crew name or board advert from a real collection was copied. The mark vocabulary belongs to the scene. The spaghetti is ours.

</details>
`;
fs.writeFileSync(OUT_MD, md);
console.log(`wrote ${path.relative(process.cwd(), OUT_MD)} (${md.split('\n').length} lines)`);
