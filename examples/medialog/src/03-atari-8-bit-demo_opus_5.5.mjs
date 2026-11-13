// "Atari 8-bit demo screen" README banner for MediaLog.
//
//   node examples/medialog/src/03-atari-8-bit-demo_opus_5.5.mjs
//   node examples/medialog/src/03-atari-8-bit-demo_opus_5.5.mjs --at=6 --out=some/where.svg
//   node examples/medialog/src/03-atari-8-bit-demo_opus_5.5.mjs --sheet=some/where.svg
//
// Regenerates ../assets/03-atari-8-bit-demo_opus_5.5.svg. Plain Node, no deps,
// deterministic (no clock, no Math.random). --at bakes a head start (seconds)
// into every animation so later frames can be checked without waiting; use it
// only with --out, never in place. --sheet writes a contact sheet of the
// palette, the font, the fossils and the players, for pixel work.
//
// The style: an Atari 8-bit (800XL / 130XE) demo screen, catalogue entry
// demo-09. ANTIC draws the screen from a display list, one graphics mode per
// band of scanlines, and a display-list interrupt (DLI) on any line can
// rewrite the colour registers. GTIA adds modes 80 pixels across, each pixel
// four hi-res pixels wide and one scanline tall: mode 9 shows sixteen
// luminances of ONE hue (the hue is whatever COLBK says on that line), mode 11
// shows fifteen hues at ONE luminance (again set per line). So demo screens
// are soft, brick-like shaded pictures whose tint changes band by band down
// the screen, with text rows stacked in between and small single-colour
// sprites (players and missiles) laid on top. Credited references, nothing
// copied: the hardware documentation on Wikipedia (Atari 8-bit computers;
// CTIA and GTIA) and the scene's screens as Pouet and Demozoo describe them.
// No group's logo, font, picture or words are reproduced; the logo, the 8x8
// font, the strata, the fossils and the players are all drawn here.
//
// The picture, top to bottom (the display list it pretends to run):
//   * LOGO, mode 11 style. MediaLog has eight letters and eight kind
//     colours, so each letter is one kind's hue (M movies red, e TV and anime
//     blue, d books amber, i comics and manga magenta, a games green, L
//     podcasts violet, o music teal, g videos plum). Mode 11 lights every hue
//     on a line at the same luminance, so one per-line chrome ramp runs
//     through all eight; the bevel highlight and the extrusion take the
//     scene's interlace liberties. The open-book mark sits in front.
//   * SKY + HEADLINE: text rows on a background that steps every few lines,
//     a hue step then a luminance step, indigo down to orange at the grass.
//     "Everything you've / WATCHED, / on one timeline." The verb row is the
//     big 20-column mode (24 on the wide playfield, glyphs doubled both ways)
//     and cycles watched, read, played, listened to. Raster tables roll up
//     through all three rows.
//   * PLAYERS: the hardware's four sprites, one per verb, standing on the
//     grass at the sides. In its verb's turn a player steps into the light
//     (the other three are drawn three luminance steps darker) and acts:
//     popcorn hops out of a box, a page turns, a gamer hops, notes rise.
//   * GROUND, mode 9 style: the log, five years at a time, as sediment. Each
//     layer is one hue, switched by a DLI on the line where the layer starts,
//     with a 16-step luminance ramp, wavy darker bands and lit pebbles; grass
//     roots reach into the top one. Entries are fossils in their kind's colour
//     (players again, never more than four on a line), each with a date or a
//     detail and a reaction. 2025-2029 is still settling: dust drifts down
//     into it. The entry you can only place roughly bobs up and down inside
//     its layer, because its depth (its date) is not known: sometime in
//     2015-2019.
//   * FEED row: what the people you know have been into, one post per verb,
//     marked by a missile in that player's colour.
// The motion keys off one 16-second cycle, four seconds per verb: the verb
// changes, its letters lift and a glint runs down them, its player acts, its
// fossils light up with a bright ring and the feed moves on. Stars twinkle,
// dust falls and the vague film bobs on their own short loops. Every loop is
// seamless. prefers-reduced-motion pauses everything on the first frame,
// which is a complete one. Nothing flashes: big changes come once every four
// seconds, and the fastest thing is a small sprite swapping frames twice a
// second.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '03-atari-8-bit-demo_opus_5.5';
const arg = (name) => {
  const hit = process.argv.slice(2).find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : null;
};
const T0 = Number(arg('at') || 0);
const OUT = arg('out') ? path.resolve(arg('out')) : path.resolve(here, `../assets/${SLUG}.svg`);
const SHEET = arg('sheet') ? path.resolve(arg('sheet')) : null;
const VIEW = arg('view') ? arg('view').split(',').map(Number) : null;
const SCALE = Number(arg('scale') || 2);

// ------------------------------------------------------------------ screen
const SW = 384; // the wide playfield, hi-res pixels (48 text columns)
const BX = 8;
const BY = 8;
// The display list: first scanline of each band.
const DL = { logo: 0, t1: 68, verb: 78, t2: 96, ground: 106, feed: 218, end: 230 };
const SH = DL.end;
const VW = SW + 2 * BX;
const VH = SH + 2 * BY;
const VERB_T = 4; // seconds per verb
const CYCLE = 4 * VERB_T; // one full turn of the verb

const n = (v, d = 3) => String(+(+v).toFixed(d));
const dly = (s) => `${n(s - T0, 4)}s`;
const mod = (a, m) => ((a % m) + m) % m;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const hash2 = (x, y, s = 0) => {
  let h = (x * 374761393 + y * 668265263 + s * 2147483647) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

// ------------------------------------------------------------------ palette
// 16 hues x 16 luminances, in the real chip's order: hue 0 is grey, hues 1-15
// run round the wheel from gold through red, violet, blue, cyan and green back
// towards yellow. Built in OKLCH, with eight of the hues placed on MediaLog's
// own kind colours (sampled from the app, close rather than exact).
function oklchHex(L, C, hDeg) {
  const toRgb = (c) => {
    const h = (hDeg * Math.PI) / 180;
    const a = c * Math.cos(h);
    const b = c * Math.sin(h);
    const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
    const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
    const s_ = L - 0.0894841775 * a - 1.291485548 * b;
    const l = l_ ** 3;
    const m = m_ ** 3;
    const s = s_ ** 3;
    return [
      4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
      -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
      -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
    ];
  };
  let lo = 0;
  let hi = C;
  let rgb = toRgb(C);
  const ok = (v) => v.every((x) => x >= -0.0005 && x <= 1.0005);
  if (!ok(rgb)) {
    for (let i = 0; i < 24; i++) {
      const mid = (lo + hi) / 2;
      if (ok(toRgb(mid))) lo = mid;
      else hi = mid;
    }
    rgb = toRgb(lo);
  }
  const enc = (x) => {
    const v = clamp(x, 0, 1);
    const g = v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055;
    return Math.round(g * 255).toString(16).padStart(2, '0');
  };
  return `#${rgb.map(enc).join('')}`;
}
//               grey gold amb orng red mag plum viol indg blue sky cyan teal grn lime olive
const HUE_DEG = [0, 84, 70, 47, 25, 350, 328, 294, 270, 246, 222, 200, 175, 150, 129, 106];
const PAL = [];
for (let h = 0; h < 16; h++) {
  PAL.push([]);
  for (let l = 0; l < 16; l++) {
    const t = l / 15;
    if (h === 0) PAL[h].push(oklchHex(0.1 + 0.88 * t ** 1.02, 0, 0));
    else {
      const L = 0.17 + 0.8 * t ** 0.97;
      const C = 0.19 * Math.sin(Math.PI * Math.min(1, (l + 1.5) / 18.5)) ** 0.8;
      PAL[h].push(oklchHex(L, C, HUE_DEG[h]));
    }
  }
}
const col = (h, l) => PAL[h][clamp(Math.round(l), 0, 15)];
const H = { GREY: 0, GOLD: 1, AMBER: 2, ORANGE: 3, RED: 4, MAGENTA: 5, PLUM: 6, VIOLET: 7, INDIGO: 8, BLUE: 9, SKY: 10, CYAN: 11, TEAL: 12, GREEN: 13, LIME: 14, OLIVE: 15 };

// Kinds and their colours, as the app's filter chips have them.
const KIND = {
  film: H.RED, tv: H.BLUE, anime: H.BLUE, book: H.AMBER, comic: H.MAGENTA, manga: H.MAGENTA,
  game: H.LIME, podcast: H.VIOLET, music: H.TEAL, video: H.PLUM,
};
// The four verbs: the big word, its colour, its kinds, and which letters of
// MediaLog (by index) belong to it.
const VERBS = [
  { word: 'WATCHED,', hue: H.RED, kinds: ['film', 'tv', 'anime', 'video'], letters: [0, 1, 7] },
  { word: 'READ,', hue: H.AMBER, kinds: ['book', 'comic', 'manga'], letters: [2, 3] },
  { word: 'PLAYED,', hue: H.LIME, kinds: ['game'], letters: [4] },
  { word: 'LISTENED TO,', hue: H.TEAL, kinds: ['podcast', 'music'], letters: [5, 6] },
];
const verbOfKind = (k) => VERBS.findIndex((v) => v.kinds.includes(k));

const defs = [];
const css = [];
const body = [];

// Tracks keyed to the verb: "on" is visible for verb k's four seconds of the
// cycle and hidden otherwise, "off" the reverse.
css.push('@keyframes on{0%{opacity:1}25%{opacity:0}100%{opacity:0}}');
css.push('@keyframes off{0%{opacity:0}25%{opacity:1}100%{opacity:1}}');
const verbDelay = (k) => dly(-mod(CYCLE - k * VERB_T, CYCLE));
const onFor = (k, kf = 'on') => `animation:${kf} ${CYCLE}s step-end infinite;animation-delay:${verbDelay(k)}`;

// ------------------------------------------------------------------ runs -> paths
// grid: rows of colour strings (or null); pw: width of one pixel in units.
// Merges each colour into horizontal runs, then stacks identical runs.
function gridPaths(grid, pw, ox, oy) {
  const runs = new Map();
  grid.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const c = row[x];
      if (c == null) { x++; continue; }
      let e = x + 1;
      while (e < row.length && row[e] === c) e++;
      if (!runs.has(c)) runs.set(c, []);
      runs.get(c).push([x, e, y]);
      x = e;
    }
  });
  const out = new Map();
  for (const [c, list] of runs) {
    const live = new Set(list.map((r) => r.join(',')));
    const parts = [];
    for (const r of list) {
      const k = r.join(',');
      if (!live.has(k)) continue;
      live.delete(k);
      let hgt = 1;
      while (live.has(`${r[0]},${r[1]},${r[2] + hgt}`)) { live.delete(`${r[0]},${r[1]},${r[2] + hgt}`); hgt++; }
      const w = (r[1] - r[0]) * pw;
      parts.push(`M${n(ox + r[0] * pw)} ${n(oy + r[2])}h${n(w)}v${hgt}h${n(-w)}z`);
    }
    out.set(c, parts.join(''));
  }
  return out;
}
const pathsSvg = (map, attrs = '') => [...map].map(([c, d]) => `<path fill="${c}"${attrs} d="${d}"/>`).join('');
const blank = (w, h) => Array.from({ length: h }, () => new Array(w).fill(null));

// ================================================================== 8x8 FONT
// Drawn for this file. Two-pixel verticals and one-pixel horizontals, as an
// Atari font has to be (one-pixel verticals smear on a TV), squared-off
// rounds, a single-storey a, capitals seven rows high, lower case on a
// five-row x-height with one-row descenders. Four pictograms ride along: a
// heart (loved), a thumb (liked), a little face (a verdict) and a quaver.
const FONT = {
  A: ['.#####.', '##...##', '##...##', '#######', '##...##', '##...##', '##...##'],
  B: ['######.', '##...##', '##...##', '######.', '##...##', '##...##', '######.'],
  C: ['.######', '##.....', '##.....', '##.....', '##.....', '##.....', '.######'],
  D: ['#####..', '##..##.', '##...##', '##...##', '##...##', '##..##.', '#####..'],
  E: ['#######', '##.....', '##.....', '######.', '##.....', '##.....', '#######'],
  F: ['#######', '##.....', '##.....', '######.', '##.....', '##.....', '##.....'],
  G: ['.######', '##.....', '##.....', '##..###', '##...##', '##...##', '.######'],
  H: ['##...##', '##...##', '##...##', '#######', '##...##', '##...##', '##...##'],
  I: ['######.', '..##...', '..##...', '..##...', '..##...', '..##...', '######.'],
  J: ['..#####', '....##.', '....##.', '....##.', '##..##.', '##..##.', '.####..'],
  K: ['##...##', '##..##.', '##.##..', '####...', '##.##..', '##..##.', '##...##'],
  L: ['##.....', '##.....', '##.....', '##.....', '##.....', '##.....', '#######'],
  M: ['##...##', '###.###', '#######', '##.#.##', '##...##', '##...##', '##...##'],
  N: ['##...##', '###..##', '####.##', '##.####', '##..###', '##...##', '##...##'],
  O: ['.#####.', '##...##', '##...##', '##...##', '##...##', '##...##', '.#####.'],
  P: ['######.', '##...##', '##...##', '######.', '##.....', '##.....', '##.....'],
  Q: ['.#####.', '##...##', '##...##', '##...##', '##.#.##', '##..##.', '.###.##'],
  R: ['######.', '##...##', '##...##', '######.', '##.##..', '##..##.', '##...##'],
  S: ['.######', '##.....', '##.....', '.#####.', '.....##', '.....##', '######.'],
  T: ['######.', '..##...', '..##...', '..##...', '..##...', '..##...', '..##...'],
  U: ['##...##', '##...##', '##...##', '##...##', '##...##', '##...##', '.#####.'],
  V: ['##...##', '##...##', '##...##', '##...##', '.##.##.', '.##.##.', '..###..'],
  W: ['##...##', '##...##', '##...##', '##.#.##', '#######', '###.###', '##...##'],
  X: ['##...##', '##...##', '.##.##.', '..###..', '.##.##.', '##...##', '##...##'],
  Y: ['##..##.', '##..##.', '##..##.', '.####..', '..##...', '..##...', '..##...'],
  Z: ['#######', '.....##', '....##.', '...##..', '..##...', '.##....', '#######'],
  a: ['.......', '.......', '.######', '##...##', '##...##', '##..###', '.###.##'],
  b: ['##.....', '##.....', '######.', '##...##', '##...##', '##...##', '######.'],
  c: ['.......', '.......', '.######', '##.....', '##.....', '##.....', '.######'],
  d: ['.....##', '.....##', '.######', '##...##', '##...##', '##...##', '.######'],
  e: ['.......', '.......', '.#####.', '##...##', '#######', '##.....', '.######'],
  f: ['...###.', '..##...', '.#####.', '..##...', '..##...', '..##...', '..##...'],
  g: ['.......', '.......', '.######', '##...##', '##...##', '.######', '.....##', '.#####.'],
  h: ['##.....', '##.....', '######.', '##...##', '##...##', '##...##', '##...##'],
  i: ['..##...', '.......', '.###...', '..##...', '..##...', '..##...', '.####..'],
  j: ['....##.', '.......', '...###.', '....##.', '....##.', '....##.', '....##.', '.###...'],
  k: ['##.....', '##.....', '##..##.', '##.##..', '####...', '##.##..', '##..##.'],
  l: ['.###...', '..##...', '..##...', '..##...', '..##...', '..##...', '...##..'],
  m: ['.......', '.......', '###.##.', '##.#.##', '##.#.##', '##.#.##', '##...##'],
  n: ['.......', '.......', '######.', '##...##', '##...##', '##...##', '##...##'],
  o: ['.......', '.......', '.#####.', '##...##', '##...##', '##...##', '.#####.'],
  p: ['.......', '.......', '######.', '##...##', '##...##', '######.', '##.....', '##.....'],
  q: ['.......', '.......', '.######', '##...##', '##...##', '.######', '.....##', '.....##'],
  r: ['.......', '.......', '##.###.', '###..##', '##.....', '##.....', '##.....'],
  s: ['.......', '.......', '.######', '##.....', '.#####.', '.....##', '######.'],
  t: ['..##...', '..##...', '######.', '..##...', '..##...', '..##...', '...###.'],
  u: ['.......', '.......', '##...##', '##...##', '##...##', '##...##', '.######'],
  v: ['.......', '.......', '##...##', '##...##', '##...##', '.##.##.', '..###..'],
  w: ['.......', '.......', '##...##', '##.#.##', '##.#.##', '#######', '.##.##.'],
  x: ['.......', '.......', '##...##', '.##.##.', '..###..', '.##.##.', '##...##'],
  y: ['.......', '.......', '##...##', '##...##', '##...##', '.######', '.....##', '.#####.'],
  z: ['.......', '.......', '#######', '....##.', '..###..', '.##....', '#######'],
  0: ['.#####.', '##...##', '##..###', '##.#.##', '###..##', '##...##', '.#####.'],
  1: ['..##...', '.###...', '..##...', '..##...', '..##...', '..##...', '.####..'],
  2: ['.#####.', '##...##', '.....##', '...###.', '.###...', '##.....', '#######'],
  3: ['######.', '.....##', '.....##', '..####.', '.....##', '.....##', '######.'],
  4: ['##..##.', '##..##.', '##..##.', '#######', '....##.', '....##.', '....##.'],
  5: ['#######', '##.....', '######.', '.....##', '.....##', '.....##', '######.'],
  6: ['.#####.', '##.....', '##.....', '######.', '##...##', '##...##', '.#####.'],
  7: ['#######', '.....##', '....##.', '...##..', '..##...', '..##...', '..##...'],
  8: ['.#####.', '##...##', '##...##', '.#####.', '##...##', '##...##', '.#####.'],
  9: ['.#####.', '##...##', '##...##', '.######', '.....##', '.....##', '.#####.'],
  '.': ['.......', '.......', '.......', '.......', '.......', '..##...', '..##...'],
  ',': ['.......', '.......', '.......', '.......', '.......', '..##...', '..##...', '.##....'],
  ':': ['.......', '..##...', '..##...', '.......', '.......', '..##...', '..##...'],
  "'": ['..##...', '..##...', '.##....', '.......', '.......', '.......', '.......'],
  '"': ['.##.##.', '.##.##.', '.#..#..', '.......', '.......', '.......', '.......'],
  '-': ['.......', '.......', '.......', '.#####.', '.......', '.......', '.......'],
  '!': ['..##...', '..##...', '..##...', '..##...', '..##...', '.......', '..##...'],
  '?': ['.#####.', '##...##', '.....##', '...###.', '...##..', '.......', '...##..'],
  '(': ['...##..', '..##...', '.##....', '.##....', '.##....', '..##...', '...##..'],
  ')': ['.##....', '..##...', '...##..', '...##..', '...##..', '..##...', '.##....'],
  '/': ['.....##', '....##.', '....##.', '...##..', '..##...', '.##....', '##.....'],
  '&': ['.###...', '##.##..', '##.##..', '.###.##', '##.###.', '##..##.', '.###.##'],
  '+': ['.......', '..##...', '..##...', '######.', '..##...', '..##...', '.......'],
  '·': ['.......', '.......', '.......', '..##...', '..##...', '.......', '.......'],
  '♥': ['.......', '.##.##.', '#######', '#######', '.#####.', '..###..', '...#...'],
  '↑': ['...#...', '..##...', '..##...', '##.####', '##.####', '##.####', '##.###.'],
  '☺': ['.#####.', '#.....#', '#.#.#.#', '#.....#', '#.###.#', '#.....#', '.#####.'],
  '♪': ['...##..', '...###.', '...#.##', '...#...', '.###...', '####...', '.##....'],
  ' ': [],
};
const GLYPH = new Map();
function glyph(ch) {
  if (GLYPH.has(ch)) return GLYPH.get(ch);
  const rows = FONT[ch];
  if (!rows) throw new Error(`no glyph for "${ch}"`);
  const grid = rows.map((r) => [...r].map((c) => (c === '#' ? 'x' : null)));
  const d = gridPaths(grid, 1, 0, 0).get('x');
  const id = `g${GLYPH.size.toString(36)}`;
  GLYPH.set(ch, d ? id : null);
  if (d) defs.push(`<path id="${id}" d="${d}"/>`);
  return d ? id : null;
}
// <use>s for a string at (x, y) in units; k scales the glyphs (k = 2 is the
// big 20-column mode: every pixel doubled across and down).
function textUses(str, x, y, k = 1) {
  const uses = [];
  [...str].forEach((ch, i) => {
    const g = glyph(ch);
    if (!g) return;
    const gx = x + i * 8 * k;
    uses.push(k === 1 ? `<use href="#${g}" x="${gx}" y="${y}"/>` : `<use href="#${g}" transform="translate(${gx} ${y}) scale(${k})"/>`);
  });
  return uses.join('');
}
const textWidth = (str, k = 1) => [...str].length * 8 * k;
// Centred on the 4-unit grid, so text and wide pixels line up.
const centreX = (str, k = 1) => BX + Math.round((SW - textWidth(str, k) + k) / 2 / 4) * 4;
const plainText = (str, x, y, fill, k = 1) => `<g fill="${fill}">${textUses(str, x, y, k)}</g>`;

// Text whose brightness comes from a stack of one-line rects behind a clip of
// the glyphs, rolled up a line at a time: the raster running through the
// letters. lums is the repeating pattern; dur the time for one repeat.
let clipCount = 0;
function rasterText(str, x, y, hue, lums, { k = 1, dur = 2, rows = 8 } = {}) {
  const id = `c${clipCount++}`;
  defs.push(`<clipPath id="${id}">${textUses(str, x, y, k)}</clipPath>`);
  const P = lums.length;
  const rects = [];
  for (let i = 0; i < rows * k + P; i++) rects.push(`<rect x="${x}" y="${y + i}" width="${textWidth(str, k)}" height="1" fill="${col(hue, lums[i % P])}"/>`);
  css.push(`@keyframes r${id}{from{transform:translateY(0)}to{transform:translateY(-${P}px)}}`);
  return `<g clip-path="url(#${id})"><g style="animation:r${id} ${dur}s steps(${P}) infinite;animation-delay:${dly(0)}">${rects.join('')}</g></g>`;
}

// ================================================================== LOGO
// Letter shapes as inside(x, y) tests in display units (x in hi-res pixels,
// y in scanlines), sampled onto the wide-pixel grid afterwards. A heavy,
// condensed mixed-case face drawn for the 4:1 grid: three-pixel stems,
// slot counters, arches that round off over a dozen scanlines.
const XH = 14; // top of the x-height
const BASE = 46; // baseline
const DESC = 56; // bottom of the descender
// A rect whose top and bottom are elliptical arches of height rt and rb.
function arch(x, y, x0, y0, x1, y1, rt = 0, rb = 0, p = 2.2) {
  if (x < x0 || x >= x1 || y < y0 || y >= y1) return false;
  const a = (x1 - x0) / 2;
  const cx = x0 + a;
  if (rt && y < y0 + rt) return Math.abs((x - cx) / a) ** p + Math.abs((y - (y0 + rt)) / rt) ** p <= 1;
  if (rb && y > y1 - rb) return Math.abs((x - cx) / a) ** p + Math.abs((y - (y1 - rb)) / rb) ** p <= 1;
  return true;
}
const box = (x, y, x0, y0, x1, y1) => x >= x0 && x < x1 && y >= y0 && y < y1;
const LET = {
  M: {
    w: 48,
    f: (x, y) => {
      if (box(x, y, 0, 0, 12, BASE) || box(x, y, 36, 0, 48, BASE)) return true;
      if (y < 31) {
        const c1 = 12 + (12 * y) / 31;
        const c2 = 36 - (12 * y) / 31;
        if (Math.abs(x - c1) < 5.5 || Math.abs(x - c2) < 5.5) return true;
      }
      return box(x, y, 18, 28, 30, 37);
    },
  },
  e: {
    w: 32,
    f: (x, y) => {
      if (!arch(x, y, 0, XH, 32, BASE, 10, 10)) return false;
      if (arch(x, y, 12, XH + 7, 20, XH + 15, 4, 0)) return false; // eye
      if (box(x, y, 12, XH + 21, 33, BASE - 8)) return false; // aperture
      return true;
    },
  },
  d: {
    w: 32,
    f: (x, y) => box(x, y, 20, 0, 32, BASE) || (arch(x, y, 0, XH, 32, BASE, 10, 10) && !arch(x, y, 12, XH + 7, 20, BASE - 7, 4, 4)),
  },
  i: { w: 12, f: (x, y) => box(x, y, 0, XH, 12, BASE) || box(x, y, 0, 1, 12, 10) },
  a: {
    w: 32,
    f: (x, y) => {
      if (box(x, y, 20, XH + 7, 32, BASE)) return true;
      if (arch(x, y, 0, XH, 32, XH + 20, 9, 0) && !box(x, y, 0, XH + 8, 20, XH + 20)) return true;
      return arch(x, y, 0, XH + 15, 32, BASE, 6, 8) && !arch(x, y, 12, XH + 21, 20, BASE - 7, 3, 3);
    },
  },
  L: { w: 28, f: (x, y) => box(x, y, 0, 0, 12, BASE) || box(x, y, 0, BASE - 8, 28, BASE) },
  o: { w: 32, f: (x, y) => arch(x, y, 0, XH, 32, BASE, 10, 10) && !arch(x, y, 12, XH + 7, 20, BASE - 7, 4, 4) },
  g: {
    w: 32,
    f: (x, y) => {
      if (box(x, y, 20, XH, 32, DESC - 6)) return true;
      if (arch(x, y, 0, XH, 32, BASE - 2, 10, 9) && !arch(x, y, 12, XH + 7, 20, BASE - 9, 4, 4)) return true;
      return arch(x, y, 0, DESC - 16, 32, DESC, 0, 8) && y >= DESC - 7;
    },
  },
};
// The mark: MediaLog's open book, a play triangle on the left page and a pen
// on the right, redrawn in wide pixels.
const MARK_W = 48;
function markPart(x, y) {
  const lp = x >= 2 && x < 22 && y >= 5 + (x - 2) * 0.3 && y < 40 + (x - 2) * 0.2;
  const rp = x >= 26 && x < 46 && y >= 5 + (46 - x) * 0.3 && y < 40 + (46 - x) * 0.2;
  const cover = (x >= 0 && x < 24 && y >= 41 + x * 0.2 && y < 45 + x * 0.2) || (x >= 24 && x < 48 && y >= 41 + (48 - x) * 0.2 && y < 45 + (48 - x) * 0.2);
  const tri = x >= 8 && x < 20 && Math.abs(y - 24) <= (20 - x) * 0.75;
  const pen = x >= 28 && x < 44 && Math.abs(y - (37 - (x - 28) * 1.55)) < 4 && y > 9;
  const nib = x >= 28 && x < 32 && y >= 35 && y < 40;
  if (lp && tri) return 'tri';
  if (rp && nib) return 'nib';
  if (rp && pen) return 'pen';
  if (lp || rp) return 'page';
  if (cover) return 'cover';
  return null;
}
const WORD = 'MediaLog';
const LETTER_HUE = [H.RED, H.BLUE, H.AMBER, H.MAGENTA, H.LIME, H.VIOLET, H.TEAL, H.PLUM];
const LGAP = 4;
const MGAP = 12;
const EXTRUDE = [[2, 6, 1], [1, 3, 3]]; // [dx wide pixels, dy lines, luminance], far to near

// The chrome: one luminance per scanline, shared by every hue on the line.
function chrome(y) {
  if (y < XH) return 13.5 - (y / XH) * 2;
  if (y < 31) return 14 - ((y - XH) / (31 - XH)) * 8;
  if (y < BASE) return 9 + ((y - 31) / (BASE - 31)) * 3.5;
  return 10 - ((y - BASE) / (DESC - BASE)) * 3.5;
}

function buildLogo() {
  const W = MARK_W + MGAP + [...WORD].reduce((s, ch) => s + LET[ch].w, 0) + LGAP * (WORD.length - 1);
  const rows = DESC + 1;
  const fine = Array.from({ length: rows }, () => new Array(W).fill(null));
  for (let y = 0; y < rows; y++) for (let x = 0; x < MARK_W; x++) fine[y][x] = markPart(x + 0.5, y + 0.5);
  let xc = MARK_W + MGAP;
  [...WORD].forEach((ch, i) => {
    const L = LET[ch];
    for (let y = 0; y < rows; y++) for (let x = 0; x < L.w; x++) if (L.f(x + 0.5, y + 0.5)) fine[y][xc + x] = i;
    xc += L.w + LGAP;
  });
  const PX = W / 4;
  const cell = blank(PX, rows);
  for (let y = 0; y < rows; y++) {
    for (let px = 0; px < PX; px++) {
      const cnt = new Map();
      for (let k = 0; k < 4; k++) { const v = fine[y][px * 4 + k]; if (v != null) cnt.set(v, (cnt.get(v) || 0) + 1); }
      let best = null;
      let bc = 0;
      for (const [v, c] of cnt) if (c > bc) { best = v; bc = c; }
      if (bc >= 2) cell[y][px] = best;
    }
  }
  return { W, PX, rows, cell };
}

const LOGO = { x: 0, y: BY + DL.logo + 4, occ: null };
function logoSvg() {
  const { W, PX, rows, cell } = buildLogo();
  const X0 = BX + Math.round((SW - W - 8) / 2 / 4) * 4;
  const Y0 = LOGO.y;
  LOGO.x = X0;
  const at = (px, y) => (y >= 0 && y < rows && px >= 0 && px < PX ? cell[y][px] : null);
  // occupancy (letters plus extrusion) for keeping the stars clear
  LOGO.occ = (x, y) => {
    const px = Math.floor((x - X0) / 4);
    const ly = y - Y0;
    for (let dy = -3; dy <= 9; dy++) for (let dx = -3; dx <= 3; dx++) if (at(px + dx, ly + dy) != null) return true;
    return false;
  };
  const backs = [];
  const fronts = [];
  const faceCells = [];
  for (let i = 0; i < WORD.length; i++) {
    const back = blank(PX + 3, rows + 7);
    const front = blank(PX, rows);
    const face = blank(PX, rows);
    for (let y = 0; y < rows; y++) {
      for (let px = 0; px < PX; px++) {
        if (cell[y][px] !== i) continue;
        for (const [dx, dy, l] of EXTRUDE) back[y + dy][px + dx] = col(LETTER_HUE[i], l);
        let l = chrome(y);
        const out = (dx, dy) => at(px + dx, y + dy) == null;
        if (out(0, -1)) l += 3;
        else if (out(0, -2)) l += 1.5;
        if (out(-1, 0)) l += 1;
        if (i === 7) l -= 0.5; // videos are the darker plum
        front[y][px] = col(LETTER_HUE[i], l);
        face[y][px] = 'x';
      }
    }
    backs.push(pathsSvg(gridPaths(back, 4, X0, Y0)));
    fronts.push(pathsSvg(gridPaths(front, 4, X0, Y0)));
    faceCells.push(face);
  }
  // The mark, static, in front of the word.
  const mark = blank(PX, rows);
  const markBack = blank(PX + 3, rows + 7);
  for (let y = 0; y < rows; y++) {
    for (let px = 0; px < PX; px++) {
      const v = cell[y][px];
      if (typeof v !== 'string') continue;
      for (const [dx, dy, l] of EXTRUDE) markBack[y + dy][px + dx] = col(H.INDIGO, l + 1);
      let l = chrome(y);
      const out = (dx, dy) => at(px + dx, y + dy) == null || typeof at(px + dx, y + dy) !== 'string';
      if (out(0, -1)) l += 2;
      if (v === 'page') mark[y][px] = col(H.GREY, l + 1);
      else if (v === 'tri') mark[y][px] = col(H.RED, l - 2);
      else if (v === 'pen') mark[y][px] = col(H.INDIGO, 3);
      else if (v === 'nib') mark[y][px] = col(H.GOLD, 11);
      else mark[y][px] = col(H.INDIGO, 7);
    }
  }
  // Lift: a verb's letters stand two lines taller for its four seconds.
  css.push('@keyframes lift{0%{transform:translateY(-2px)}25%{transform:translateY(0)}100%{transform:translateY(0)}}');
  // Glint: two bright lines run down the verb's letters as it arrives.
  const sweep = rows + 4;
  css.push(`@keyframes glint{0%{transform:translateY(0);animation-timing-function:steps(${Math.ceil(sweep / 2)},end)}5%{transform:translateY(${sweep}px)}100%{transform:translateY(${sweep}px)}}`);
  const liftStyle = (k) => `style="animation:lift ${CYCLE}s step-end infinite;animation-delay:${verbDelay(k)}"`;
  const verbOfLetter = (i) => VERBS.findIndex((v) => v.letters.includes(i));
  const out = [];
  out.push(`<g id="mark">${pathsSvg(gridPaths(markBack, 4, X0, Y0))}</g>`);
  for (let i = 0; i < WORD.length; i++) out.push(`<g ${liftStyle(verbOfLetter(i))}>${backs[i]}</g>`);
  out.push(pathsSvg(gridPaths(mark, 4, X0, Y0)));
  for (let i = 0; i < WORD.length; i++) out.push(`<g ${liftStyle(verbOfLetter(i))}>${fronts[i]}</g>`);
  VERBS.forEach((v, k) => {
    const g = blank(PX, rows);
    for (const i of v.letters) for (let y = 0; y < rows; y++) for (let px = 0; px < PX; px++) if (faceCells[i][y][px]) g[y][px] = 'x';
    const d = gridPaths(g, 4, X0, Y0).get('x');
    defs.push(`<clipPath id="gl${k}"><path d="${d}"/></clipPath>`);
    out.push(`<g ${liftStyle(k)}><g clip-path="url(#gl${k})"><g style="animation:glint ${CYCLE}s infinite;animation-delay:${verbDelay(k)}"><rect x="${X0}" y="${Y0 - 5}" width="${W}" height="1" fill="${col(H.GREY, 12)}"/><rect x="${X0}" y="${Y0 - 4}" width="${W}" height="2" fill="${col(H.GREY, 15)}"/></g></g></g>`);
  });
  body.push(`<g id="logo">${out.join('')}</g>`);
}

// ================================================================== STARS
// Missiles as stars over the logo band: two hi-res pixels by one line. A few
// of them twinkle, each on its own slow beat.
function starsSvg() {
  const stars = [];
  for (let i = 0; i < 400 && stars.length < 26; i++) {
    const x = BX + 4 + Math.floor(hash2(i, 1, 41) * (SW - 8) / 2) * 2;
    const y = BY + 2 + Math.floor(hash2(i, 2, 41) * (DL.t1 + 6));
    if (LOGO.occ(x, y)) continue;
    if (stars.some((s) => Math.abs(s.x - x) < 26 && Math.abs(s.y - y) < 10)) continue;
    stars.push({ x, y, l: 7 + Math.floor(hash2(i, 3, 41) * 8), tw: hash2(i, 4, 41) < 0.4, ph: hash2(i, 5, 41) });
  }
  css.push('@keyframes tw{0%{opacity:1}50%{opacity:.25}}');
  const out = stars.map((s) => {
    const r = `<rect x="${s.x}" y="${s.y}" width="2" height="1" fill="${col(H.SKY, s.l)}"`;
    return s.tw ? `${r} style="animation:tw ${n(2 + s.ph * 2.5, 2)}s step-end infinite;animation-delay:${dly(-s.ph * 3)}"/>` : `${r}/>`;
  });
  body.push(`<g id="stars">${out.join('')}</g>`);
}

// ================================================================== SKY + HEADLINE
// Dusk behind the headline: the background register changes every few
// lines, alternating a hue step and a luminance step, the classic way to
// make sixteen hues look like a sunset.
const SKY = [
  [H.INDIGO, 1, 5], [H.INDIGO, 2, 4], [H.VIOLET, 2, 5], [H.VIOLET, 3, 4], [H.PLUM, 3, 5],
  [H.PLUM, 4, 4], [H.MAGENTA, 4, 4], [H.MAGENTA, 5, 3], [H.RED, 5, 2], [H.ORANGE, 6, 2],
];
function skySvg() {
  const rows = [];
  let y = DL.t1;
  for (const [hue, l, h] of SKY) {
    rows.push(`<rect x="${BX}" y="${BY + y}" width="${SW}" height="${h}" fill="${col(hue, l)}"/>`);
    y += h;
  }
  if (y !== DL.ground) throw new Error(`sky ends at ${y}`);
  body.push(`<g id="sky">${rows.join('')}</g>`);
}
function headlineSvg() {
  const t1 = 'Everything you\'ve';
  const t2 = 'on one timeline.';
  body.push(rasterText(t1, centreX(t1), BY + DL.t1 + 1, H.SKY, [15, 15, 14, 13, 12, 12, 13, 14], { dur: 1.6 }));
  body.push(rasterText(t2, centreX(t2), BY + DL.t2 + 1, H.MAGENTA, [15, 15, 14, 14, 13, 14, 15, 15], { dur: 1.6 }));
  const chromeV = [15, 15, 14, 14, 13, 12, 11, 10, 9, 9, 10, 11, 12, 13, 14, 15];
  VERBS.forEach((v, k) => {
    const x = centreX(v.word, 2);
    body.push(`<g style="${onFor(k)}">${rasterText(v.word, x, BY + DL.verb + 1, v.hue, chromeV, { k: 2, dur: 3.2 })}</g>`);
  });
}

// ================================================================== PLAYERS
// Four sprites, one per verb, in two-unit pixels (a player at normal width:
// eight colour clocks, here twelve pixels for a little more elbow room).
// Keys: h hair, k skin, K skin shade, e eyes, c outfit (the verb's colour),
// C outfit shade, p trousers, x dark (shoes, props), w white, y popcorn,
// # the verb's colour, bright; r a red button. '.' is clear.
// Each key as [hue, luminance]; an idle player is drawn three steps darker,
// so the one doing the current verb stands in the light.
const SKIN = { e: [H.GREY, 1], p: [H.INDIGO, 3], x: [H.GREY, 3], w: [H.GREY, 15], y: [H.GOLD, 14], r: [H.RED, 9], s: [H.GREY, 8] };
const HEAD = [
  '....hhhh....',
  '...hhhhhh...',
  '..hhhhhhhh..',
  '..hhkkkkhh..',
  '...kkkkkk...',
  '...kekkek...',
  '...kkkkkk...',
  '...kkKKkk...',
  '....kkkk....',
  '.....kk.....',
];
const LEGS = [
  '...pppppp...',
  '...pp..pp...',
  '...pp..pp...',
  '...pp..pp...',
  '...pp..pp...',
  '...pp..pp...',
  '...pp..pp...',
  '...pp..pp...',
  '..xxx..xxx..',
];
const PLAYERS = [
  {
    name: 'watch',
    hue: H.RED,
    hair: [H.ORANGE, 3],
    skin: [H.ORANGE, 12],
    x: 14,
    idle: [
      ...HEAD,
      '...cccccc...',
      '..cccccccc..',
      '.cccccccccc.',
      '.cc.cccc.cc.',
      '.cc.cccc.cc.',
      '.cc.yyyy.cc.',
      '.ccyyyyyycc.',
      '.kyyyyyyyyk.',
      '..w#w#w#w#..',
      '..w#w#w#w#..',
      '..w#w#w#w#..',
      '..w#w#w#w#..',
      '...w#w#w#...',
      ...LEGS.slice(1),
    ],
    // popcorn hopping out of the box, two frames over the idle picture
    act: [
      { at: [0, 11], rows: ['....y.......', '.......y....', '............', '.....y..y...'] },
      { at: [0, 9], rows: ['..y.....y...', '............', '......y.....', '....y.......'] },
    ],
  },
  {
    name: 'read',
    hue: H.AMBER,
    hair: [H.GREY, 2],
    skin: [H.ORANGE, 8],
    x: 54,
    idle: [
      '....hhhh....',
      '...hhhhhh...',
      '..hhhhhhhh..',
      '..hhhhhhhh..',
      '...hkkkkh...',
      '...kKkkKk...',
      '...kkkkkk...',
      '....kkkk....',
      '.....kk.....',
      '...cccccc...',
      '..cccccccc..',
      '.cccccccccc.',
      '.cc.cccc.cc.',
      '.wwww##wwww.',
      'wwssw##wssww',
      'wwwww##wwwww',
      'wwssw##wsssw',
      'wwwww##wwwww',
      'kwssw##wssww',
      'k####..####k',
      '...cccccc...',
      '...cccccc...',
      ...LEGS,
    ],
    // a page lifting off the right-hand side and over the spine
    act: [
      { at: [7, 10], rows: ['.....', '..ww.', '.www.', 'wwww.'] },
      { at: [3, 9], rows: ['...w..', '...w..', '..ww..', '..ww..'] },
    ],
  },
  {
    name: 'play',
    hue: H.LIME,
    hair: [H.RED, 4],
    skin: [H.AMBER, 12],
    x: SW - 70,
    idle: [
      '....hhhh....',
      '...hhhhhh...',
      '..hhhhhhhh..',
      '..hhkkkkhh..',
      '...kkkkkk...',
      '...kKkkKk...',
      '...kkkkkk...',
      '...kkKKkk...',
      '....kkkk....',
      '.....kk.....',
      '...cccccc...',
      '..cccccccc..',
      '.cccccccccc.',
      '.cc.cccc.cc.',
      '.cc.cccc.cc.',
      '.cc.cccc.cc.',
      '.kxxxxxxxxk.',
      'kxxwxxxxrxxk',
      'kxwwwxxrxrxk',
      'kxxwxxxxrxxk',
      '.xxxx..xxxx.',
      '.xxx....xxx.',
      ...LEGS,
    ],
    act: [
      { at: [0, 17], rows: ['kxxwxxxxwxxk', 'kxwwwxxrxwxk'] },
      { at: [0, 17], rows: ['kxxwxxxxrxxk', 'kxwwwxxwxrxk'] },
    ],
    hop: true,
  },
  {
    name: 'listen',
    hue: H.TEAL,
    hair: [H.GREY, 1],
    skin: [H.ORANGE, 5],
    x: SW - 32,
    idle: [
      '...xxxxxx...',
      '..xhhhhhhx..',
      '.xhhhhhhhhx.',
      '.xxhkkkkhxx.',
      'xxxkkkkkkxxx',
      'xxxkKkkKkxxx',
      'xxxkkkkkkxxx',
      '.x.kkKKkk.x.',
      '....kkkk....',
      '.....kk.....',
      '...cccccc...',
      '..cccccccc..',
      '.cccccccccc.',
      '.cc.cccc.cc.',
      '.cc.cccc.cc.',
      '.cc.cccc.cc.',
      '.cc.cccc.cc.',
      '.kk.cccc.kk.',
      '....cccc....',
      '....cccc....',
      '....cccc....',
      '....cccc....',
      ...LEGS,
    ],
    act: [],
    notes: true,
  },
];
function spriteGrid(rows, pl, dim = 0) {
  const c = (h, l) => col(h, l <= 3 ? l : Math.max(2, l - dim));
  return rows.map((r) => [...r].map((ch) => {
    if (ch === '.') return null;
    if (ch === 'h') return c(...pl.hair);
    if (ch === 'k') return c(pl.skin[0], pl.skin[1]);
    if (ch === 'K') return c(pl.skin[0], pl.skin[1] - 3);
    if (ch === 'c') return c(pl.hue, 8);
    if (ch === 'C') return c(pl.hue, 6);
    if (ch === '#') return c(pl.hue, 9);
    return SKIN[ch] ? c(...SKIN[ch]) : null;
  }));
}
function playersSvg() {
  const feet = BY + DL.ground; // the line under the shoes
  css.push('@keyframes fa{0%{opacity:1}50%{opacity:0}}@keyframes fb{0%{opacity:0}50%{opacity:1}}');
  css.push('@keyframes hop{0%{transform:translateY(0)}50%{transform:translateY(-3px)}}');
  css.push('@keyframes note{0%{transform:translateY(0)}100%{transform:translateY(-12px)}}');
  const out = [];
  PLAYERS.forEach((pl, k) => {
    const x = BX + pl.x;
    const y = feet - pl.idle.length;
    const base = pathsSvg(gridPaths(spriteGrid(pl.idle, pl), 2, x, y));
    const dimmed = pathsSvg(gridPaths(spriteGrid(pl.idle, pl, 3), 2, x, y));
    const frames = pl.act.map((f, i) => {
      const g = pathsSvg(gridPaths(spriteGrid(f.rows, pl), 2, x + f.at[0] * 2, y + f.at[1]));
      return `<g style="animation:f${i ? 'b' : 'a'} 1s step-end infinite;animation-delay:${dly(0)}"${i ? ' opacity="0"' : ''}>${g}</g>`;
    }).join('');
    let extra = '';
    if (pl.notes) {
      // two quavers rising from the headphones, a second apart
      const nt = (nx, ny, d) => `<g style="animation:note 2s steps(12) infinite;animation-delay:${dly(d)}">${plainText('♪', nx, ny, col(H.TEAL, 13))}</g>`;
      extra = nt(x - 10, y + 2, 0) + nt(x + 22, y + 6, -1);
    }
    const hop = pl.hop ? ` style="animation:hop .5s step-end infinite;animation-delay:${dly(0)}"` : '';
    // Idle, the player stands still; in its verb's turn it acts (and the
    // gamer hops), drawn over the same picture.
    out.push(`<g id="p-${pl.name}"><g style="${onFor(k, 'off')}">${dimmed}</g><g style="${onFor(k)}"><g${hop}>${base}${frames}</g>${extra}</g></g>`);
  });
  body.push(`<g id="players">${out.join('')}</g>`);
}

// ================================================================== GROUND
// The log, five years at a time, as sediment: each layer one hue (a DLI on
// its first line), a luminance ramp down through it, wavy darker bands and
// lit pebbles in 16-shade wide pixels.
const LAYERS = [
  { y: 109, h: 24, hue: H.GOLD, top: 6.5, bot: 3, label: '2025-2029', sub: 'still settling' },
  { y: 133, h: 22, hue: H.ORANGE, top: 6, bot: 2.5, label: '2020-2024' },
  { y: 155, h: 26, hue: H.PLUM, top: 6, bot: 2.5, label: '2015-2019' },
  { y: 181, h: 22, hue: H.INDIGO, top: 6, bot: 2.5, label: '2010-2014' },
  { y: 203, h: 15, hue: H.CYAN, top: 5.5, bot: 2.5, label: '2005-2009' },
];
function groundSvg() {
  const PX = SW / 4;
  const y0 = DL.ground;
  const lum = Array.from({ length: DL.feed - y0 }, () => new Array(PX).fill(0));
  const hueAt = (y) => LAYERS.find((L) => y >= L.y && y < L.y + L.h)?.hue;
  const add = (px, y, d) => { if (px >= 0 && px < PX && y >= y0 && y < DL.feed) lum[y - y0][px] += d; };
  for (const L of LAYERS) {
    for (let y = L.y; y < L.y + L.h && y < DL.feed; y++) {
      const t = (y - L.y) / (L.h - 1);
      for (let px = 0; px < PX; px++) lum[y - y0][px] = L.top + (L.bot - L.top) * t + (y === L.y ? 1.5 : 0);
    }
    // Wavy bands of darker sediment, lit along their top edge.
    const bands = Math.max(2, Math.round(L.h / 8));
    for (let b = 0; b < bands; b++) {
      const yb = L.y + 3 + Math.round(((b + 0.5) / bands) * (L.h - 6));
      const amp = 0.8 + hash2(b, L.y, 31) * 1.6;
      const f = 0.07 + hash2(b, L.y, 32) * 0.08;
      const ph = hash2(b, L.y, 33) * 6.28;
      for (let px = 0; px < PX; px++) {
        const yy = yb + Math.round(amp * Math.sin(px * f + ph) + 0.6 * Math.sin(px * f * 2.7 + ph * 1.3));
        if (yy <= L.y || yy >= L.y + L.h - 1) continue;
        add(px, yy, -1.3);
        add(px, yy - 1, 0.7);
      }
    }
    // Pebbles: lit on top, shadowed underneath.
    const count = Math.round(L.h * 0.5);
    for (let i = 0; i < count; i++) {
      const cx = Math.floor(hash2(i, L.y, 11) * PX);
      const cy = L.y + 3 + Math.floor(hash2(i, L.y, 12) * (L.h - 6));
      const rx = 1 + Math.floor(hash2(i, L.y, 13) * 2.2);
      const ry = 1 + Math.floor(hash2(i, L.y, 14) * 2.5);
      for (let dy = -ry; dy <= ry; dy++) {
        for (let dx = -rx; dx <= rx; dx++) {
          if ((dx / (rx + 0.5)) ** 2 + (dy / (ry + 0.5)) ** 2 > 1) continue;
          const v = dy / (ry + 0.5);
          add(cx + dx, cy + dy, v < -0.4 ? 3 : v < 0.25 ? 1.8 : -0.8);
        }
      }
    }
  }
  // Roots: the grass reaching down into the top layer, a pixel aside now
  // and then. Kept clear of the labels and the fossils.
  for (let i = 0; i < 14; i++) {
    let px = 24 + Math.floor(hash2(i, 1, 51) * 70);
    if (FOSSILS.some((f) => f.layer === 0 && Math.abs(px * 4 - f.x) < 40)) continue;
    const len = 4 + Math.floor(hash2(i, 2, 51) * 8);
    for (let d = 0; d < len; d++) {
      add(px, y0 + 3 + d, -2.2);
      if (hash2(i, d, 52) < 0.3) px += hash2(i, d, 53) < 0.5 ? -1 : 1;
    }
  }
  const grid = blank(PX, DL.feed - y0);
  for (let y = y0; y < DL.feed; y++) {
    const hue = hueAt(y);
    for (let px = 0; px < PX; px++) {
      if (y < y0 + 3) {
        // Grass: tufts, then turf.
        if (y === y0) grid[0][px] = hash2(px, 0, 3) < 0.55 ? col(H.GREEN, 7 + (px % 2)) : col(H.LIME, 9);
        else grid[y - y0][px] = col(H.GREEN, y === y0 + 1 ? 6 : hash2(px, 2, 3) < 0.3 ? 3 : 4);
      } else if (hue != null) grid[y - y0][px] = col(hue, lum[y - y0][px]);
    }
  }
  body.push(`<g id="ground">${pathsSvg(gridPaths(grid, 4, BX, BY + y0))}</g>`);
  // Year labels: hi-res text laid over each layer, with a drop shadow.
  for (const L of LAYERS) {
    const ty = BY + L.y + 3;
    body.push(plainText(L.label, BX + 9, ty + 1, col(L.hue, 1)) + plainText(L.label, BX + 8, ty, col(L.hue, 14)));
    if (L.sub) body.push(plainText(L.sub, BX + 9, ty + 10, col(L.hue, 1)) + plainText(L.sub, BX + 8, ty + 9, col(L.hue, 11)));
  }
}

// ================================================================== FOSSILS
// Entries, as fossils in their kind's colour, drawn for two-unit pixels (so
// twice as many rows as columns look square). '#' the kind, bright; 'o' the
// kind, shaded; 'w' pale; 's' grey; 'x' dark.
const ICONS = {
  film: [
    '############',
    '#ww##ww##ww#',
    '##ww##ww##w#',
    '############',
    '#...........',
    '############',
    '#ww##ww##ww#',
    '##ww##ww##w#',
    '############',
    '#oooooooooo#',
    '#o######ooo#',
    '#oooooooooo#',
    '#o#####oooo#',
    '#oooooooooo#',
    '############',
  ],
  tv: [
    '..#.....#...',
    '...#...#....',
    '....#.#.....',
    '.....#......',
    '############',
    '#wwwwwwww#o#',
    '#wwwwwwww###',
    '#wwwwwwww#o#',
    '#wwwwwwww###',
    '#wwwwwwww#o#',
    '#wwwwwwww###',
    '############',
    '.##......##.',
    '.#........#.',
  ],
  book: [
    '###########.',
    '#ooooooooo#w',
    '#o#######o#w',
    '#o#######o#w',
    '#ooooooooo#w',
    '#ooooooooo#w',
    '#ooo###ooo#w',
    '#oo#####oo#w',
    '#ooo###ooo#w',
    '#ooooooooo#w',
    '#ooooooooo#w',
    '#ooooooooo#w',
    '###########w',
    '.wwwwwwwwwww',
  ],
  comic: [
    '..########..',
    '.##########.',
    '####w##w####',
    '####w##w####',
    '####w##w####',
    '####w##w####',
    '############',
    '####w##w####',
    '.##########.',
    '..########..',
    '...##.......',
    '..##........',
    '.##.........',
    '.#..........',
  ],
  game: [
    '............',
    '..########..',
    '.##########.',
    '##########w#',
    '##w#####w#w#',
    '#www######w#',
    '##w######w##',
    '############',
    '############',
    '####....####',
    '###......###',
    '###......###',
    '.#........#.',
  ],
  podcast: [
    '....####....',
    '...######...',
    '...#w#w##...',
    '...######...',
    '...#w#w##...',
    '...######...',
    '...#w#w##...',
    '...######...',
    '.#..####..#.',
    '.#........#.',
    '..#......#..',
    '...######...',
    '.....##.....',
    '.....##.....',
    '...######...',
  ],
  music: [
    '....########',
    '....########',
    '....##....##',
    '....##....##',
    '....##....##',
    '....##....##',
    '....##....##',
    '....##....##',
    '..####..####',
    '.#####.#####',
    '.#####.#####',
    '.#####.#####',
    '..###...###.',
  ],
  video: [
    '.##########.',
    '############',
    '####w#######',
    '####ww######',
    '####www#####',
    '####wwww####',
    '####www#####',
    '####ww######',
    '####w#######',
    '############',
    '.##########.',
  ],
};
// Each fossil: layer, kind, x (units from the left of the screen), a short
// label and a reaction. Depth is centred in the layer unless given.
const FOSSILS = [
  { layer: 0, kind: 'game', x: 136, label: 'Apr', react: '♥' },
  { layer: 0, kind: 'tv', x: 264, label: 'S3 E1-8', react: '↑' },
  { layer: 1, kind: 'book', x: 120, label: 'audiobook', react: '↑' },
  { layer: 1, kind: 'music', x: 280, label: '9 Sep', react: '♥' },
  { layer: 2, kind: 'film', x: 120, label: '3 Oct', react: '♥' },
  { layer: 2, kind: 'film', x: 240, label: 'sometime in', react: '☺', bob: true },
  { layer: 3, kind: 'comic', x: 120, label: 'ebook', react: '↑' },
  { layer: 3, kind: 'podcast', x: 280, label: 'Feb', react: '♥' },
  { layer: 4, kind: 'video', x: 184, label: '14 Jun', react: '↑' },
];
function iconGrid(kind, lum) {
  const hue = KIND[kind];
  return ICONS[kind].map((r) => [...r].map((ch) => {
    if (ch === '#') return col(hue, lum);
    if (ch === 'o') return col(hue, lum - 3);
    if (ch === 'w') return col(H.GREY, Math.min(15, lum + 3));
    if (ch === 's') return col(H.GREY, 8);
    if (ch === 'x') return col(H.GREY, 2);
    return null;
  }));
}
function outlineGrid(rows, c) {
  const h = rows.length;
  const w = rows[0].length;
  const g = blank(w + 2, h + 2);
  const on = (x, y) => y >= 0 && y < h && x >= 0 && x < w && rows[y][x] !== '.';
  for (let y = -1; y <= h; y++) for (let x = -1; x <= w; x++) {
    if (on(x, y)) continue;
    if (on(x - 1, y) || on(x + 1, y) || on(x, y - 1) || on(x, y + 1)) g[y + 1][x + 1] = c;
  }
  return g;
}
function fossilsSvg() {
  for (const f of FOSSILS) {
    const L = LAYERS[f.layer];
    const rows = ICONS[f.kind];
    const x = BX + f.x;
    const dy = f.bob ? 2 : Math.round((L.h - rows.length) / 2);
    const y = BY + L.y + dy;
    const k = verbOfKind(f.kind);
    const ring = pathsSvg(gridPaths(outlineGrid(rows, col(L.hue, 1)), 2, x - 2, y - 1));
    const halo = pathsSvg(gridPaths(outlineGrid(rows, col(KIND[f.kind], 14)), 2, x - 2, y - 1));
    const dim = pathsSvg(gridPaths(iconGrid(f.kind, 9), 2, x, y));
    const lit = pathsSvg(gridPaths(iconGrid(f.kind, 12), 2, x, y));
    const ty = y + Math.round((rows.length - 7) / 2);
    const lx = x + rows[0].length * 2 + 6;
    const text = `${f.label} ${f.react}`;
    const label = plainText(text, lx + 1, ty + 1, col(L.hue, 1)) + plainText(text, lx, ty, col(L.hue, 14));
    const icon = `<g style="${onFor(k, 'off')}">${ring}${dim}</g><g style="${onFor(k)}">${halo}${lit}</g>${label}`;
    if (f.bob) {
      // Depth is the date, and this one's is only roughly known: it drifts
      // up and down its layer, one line at a time.
      const travel = L.h - rows.length - 4;
      css.push(`@keyframes bob{0%{transform:translateY(0)}50%{transform:translateY(${travel}px)}100%{transform:translateY(0)}}`);
      body.push(`<g style="animation:bob ${n(travel * 0.5, 2)}s steps(${travel}) infinite;animation-delay:${dly(0)}">${icon}</g>`);
    } else body.push(`<g>${icon}</g>`);
  }
  // Dust settling into 2025-2029.
  css.push('@keyframes dust{0%{transform:translateY(0)}100%{transform:translateY(17px)}}');
  const L0 = LAYERS[0];
  for (let i = 0; i < 9; i++) {
    const dx = BX + 140 + Math.floor(hash2(i, 9, 21) * 58) * 4;
    const d = 3 + hash2(i, 10, 21) * 3;
    body.push(`<rect x="${dx}" y="${BY + L0.y - 1}" width="2" height="1" fill="${col(L0.hue, 11)}" style="animation:dust ${n(d, 2)}s steps(17) infinite;animation-delay:${dly(-hash2(i, 11, 21) * d)}"/>`);
  }
}

// ================================================================== FEED
// The bottom text row: what the people you know have been into, one post per
// verb, each marked with its player's colour (a missile).
const FEED = [
  'Odile watched The Second-Best Swan. ♥',
  'Hamish read The Patient Orchard. Slowly.',
  'Bea played Parcel Golf. Putted a fridge.',
  'Ade listened to Bridges, Mostly Small. ↑',
];
function feedSvg() {
  const y = BY + DL.feed;
  body.push(`<rect x="${BX}" y="${y}" width="${SW}" height="${DL.end - DL.feed}" fill="${col(H.INDIGO, 1)}"/>`);
  body.push(plainText('FEED', BX + 8, y + 2, col(H.INDIGO, 9)));
  FEED.forEach((t, k) => {
    if ([...t].length > 40) throw new Error(`feed post too long: ${t}`);
    const sw = `<rect x="${BX + 48}" y="${y + 2}" width="4" height="7" fill="${col(PLAYERS[k].hue, 10)}"/>`;
    body.push(`<g style="${onFor(k)}">${sw}${plainText(t, BX + 60, y + 2, col(H.GREY, 14))}</g>`);
  });
}

// ================================================================== ASSEMBLE
body.push(`<rect x="${BX}" y="${BY}" width="${SW}" height="${SH}" fill="${col(H.GREY, 0)}"/>`);
logoSvg(); // fills LOGO.occ, which the stars read
starsSvg();
skySvg();
headlineSvg();
groundSvg();
fossilsSvg();
playersSvg();
feedSvg();
css.push('@media (prefers-reduced-motion:reduce){*{animation-play-state:paused!important}}');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VIEW ? VIEW.join(' ') : `0 0 ${VW} ${VH}`}" width="${(VIEW ? VIEW[2] : VW) * SCALE}" height="${(VIEW ? VIEW[3] : VH) * SCALE}" shape-rendering="crispEdges">
<title>MediaLog: an 8-bit demo screen</title>
<desc>MediaLog in fat wide-pixel chrome letters, one kind colour per letter, over a starry sky. Below: Everything you've watched, read, played, listened to, on one timeline, the verb changing every four seconds while four players act it out on the grass. Underground, the log five years at a time as coloured layers of sediment, entries buried in them as fossils in their kind's colour, the newest layer still settling and one film, sometime in 2015-2019, drifting up and down its layer. At the bottom, a feed of what friends have been into.</desc>
<style>${css.join('')}</style>
<defs>${defs.join('')}</defs>
<rect width="${VW}" height="${VH}" rx="10" fill="${col(H.INDIGO, 0)}"/>
${body.join('\n')}
</svg>
`;
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, svg);
console.log(`wrote ${OUT} (${(svg.length / 1024).toFixed(1)} KB)`);

if (SHEET) {
  // Contact sheet: the 256 colours, the font, the fossils and the players.
  const Z = 6;
  const parts = [];
  for (let h = 0; h < 16; h++) for (let l = 0; l < 16; l++) parts.push(`<rect x="${l * 20}" y="${h * 12}" width="20" height="12" fill="${PAL[h][l]}"/>`);
  const cells = (grid, ox, oy, pw) => grid.map((r, y) => r.map((c, x) => (c ? `<rect x="${ox + x * pw * Z}" y="${oy + y * Z}" width="${pw * Z}" height="${Z}" fill="${c}"/>` : '')).join('')).join('');
  let ox = 340;
  for (const pl of PLAYERS) { parts.push(cells(spriteGrid(pl.idle, pl), ox, 0, 2)); ox += 160; }
  ox = 0;
  for (const kind of Object.keys(ICONS)) { parts.push(cells(iconGrid(kind, 10), ox, 230, 2)); ox += 160; }
  Object.keys(FONT).filter((c) => c !== ' ').forEach((ch, i) => {
    const gx = (i % 32) * 40;
    const gy = 340 + Math.floor(i / 32) * 44;
    parts.push(FONT[ch].map((r, y) => [...r].map((c, x) => (c === '#' ? `<rect x="${gx + x * 4}" y="${gy + y * 4}" width="4" height="4" fill="#fff"/>` : '')).join('')).join(''));
  });
  const sheet = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1300 480" width="1300" height="480" shape-rendering="crispEdges"><rect width="1300" height="480" fill="#123"/>${parts.join('')}</svg>`;
  fs.writeFileSync(SHEET, sheet);
  console.log(`wrote ${SHEET}`);
}
