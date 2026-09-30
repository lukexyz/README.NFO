#!/usr/bin/env node
// ULTRA-SATISFACTORY README header: "Media Player Stack" (20-player-stack_opus_5.5).
// Plain Node, no dependencies, fully deterministic (seeded PRNG, no clock).
//   node examples/ultra-satisfactory/src/20-player-stack_opus_5.5.mjs
// writes examples/ultra-satisfactory/assets/20-player-stack_opus_5.5.svg
//
// The style is the late-90s skinned desktop MP3 player (catalogue entry trk-11,
// the Winamp 2 classic stack): small dark windows snapped together, a player
// with LED time, spectrum analyser and ticker, a ten-band equaliser and a
// playlist. Everything here is an ORIGINAL skin for an invented player called
// FUSEBOX: original chrome, original pixel fonts, original icons. Nothing is
// traced from the real player, its logo or its default skin.
//
// What the windows mean:
//   player     the ticker scrolls the table of contents, one section per track
//   equaliser  ten sliders = ten real counts from the app, on a log scale
//   playlist   the README's table of contents (plus the live link)
//   visualiser the project name, large
//   library    the app's three tabs
//
// Everything is drawn in logical pixels (viewBox 415 x 314, shown at 2x on a
// desktop README). Static chrome is painted into a pixel buffer and emitted as
// merged-rectangle paths, one per colour, layered so that it stays clean when
// the browser scales it to a width that is not an exact multiple (see paths()). Text is pixel glyphs reused with
// <use>. No <text>, no fonts, nothing external.

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(here, '../assets/20-player-stack_opus_5.5.svg');

// ------------------------------------------------------------------ content
// The playlist is the README's table of contents. Band names are invented.
// Track length is how long the banner really spends on each row, so the
// durations in the playlist are true (they add up to the loop). Each length
// is a multiple of the 4 s analyser loop and long enough for the ticker to
// get through the whole line once (the generator checks).
const TRACKS = [
  { row: "ULTRA-SATISFACTORY - WHAT'S INSIDE (THREE-TAB ANTHEM)",
    more: 'EVERY RECIPE, BUILDING AND SPACE ELEVATOR OBJECTIVE, ONE CLICK APART', len: 12 },
  { row: 'SECOND MONITOR SOUND SYSTEM - PLAY IT LIVE (NO-INSTALL BROWSER MIX)',
    more: 'LUKEXYZ.GITHUB.IO/ULTRA-SATISFACTORY', len: 12 },
  { row: 'PIP & THE REQUIREMENTS - RUN IT LOCALLY (TWO-COMMAND EDIT)',
    more: 'THEN OPEN LOCALHOST:8501', len: 8 },
  { row: "THE PROVISIONAL CATWALKS - HOW IT'S BUILT (ONE BIG APP.PY DUB)",
    more: 'ONE STREAMLIT APP, LOAD-BEARING', len: 8 },
  { row: 'WAITING ON SCREWS - DATA & CREDITS (FEAT. GREENY/SATISFACTORYTOOLS)',
    more: 'PICTURES: THE SATISFACTORY WIKI', len: 12 },
  { row: 'THE FUSE BLEW AGAIN - LICENSE (APACHE 2.0 UNPLUGGED)',
    more: 'PROTECTION: NONE', len: 8 },
];
const LOOP = TRACKS.reduce((a, t) => a + t.len, 0); // 60 s
const STARTS = TRACKS.map((t, i) => TRACKS.slice(0, i).reduce((a, u) => a + u.len, 0));

// Ten real counts from the app, sorted like frequency bands.
const BANDS = [
  [3, 'TABS'], [5, 'PHASES'], [9, 'MACHINES'], [15, 'POWER'], [26, 'DECOR'],
  [59, 'LOGISTICS'], [88, 'ALTS'], [140, 'ITEMS'], [211, 'RECIPES'], [477, 'BUILDINGS'],
];

const TABS = [
  { name: 'OBJECTIVES', a: 'SPACE ELEVATOR', b: '5 PHASES, PARTS + AMOUNTS', col: '#a855f7', bg: '#2a1244' },
  { name: 'ITEMS', a: '140 ITEMS, INSTANT SEARCH', b: '211 RECIPES, 88 ALTERNATES', col: '#ec4899', bg: '#42112b' },
  { name: 'BUILDINGS', a: '477 BUILDINGS, 9 MACHINES', b: 'MK-BY-MK UPGRADE PATHS', col: '#38bdf8', bg: '#0c3246' },
];

// ------------------------------------------------------------------- basics
const W = 415;
const MAIN = { x: 0, y: 0, w: 275, h: 116 };
const EQ = { x: 0, y: 116, w: 275, h: 116 };
const VIS = { x: 275, y: 0, w: 140, h: 116 };
const LIB = { x: 275, y: 116, w: 140, h: 116 };
const PL = { x: 0, y: 232, w: 415, h: 82 };
const H = PL.y + PL.h;

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(0xf05eb0c5);
const n3 = (v) => +v.toFixed(3);
const pct = (t) => `${+((t / LOOP) * 100).toFixed(4)}%`;

const C = {
  out: '#06060c', base: '#2c2c49', hi: '#50507c', hi2: '#7878ac', lo: '#1b1b30', lo2: '#0f0f1c',
  bar: '#191930', gold: '#e2cf6e', goldLo: '#5d5426', cream: '#f4edc8',
  lab: '#b1b1d6', labDim: '#7676a2',
  blk: '#000000', grn: '#22e53c', grnDim: '#0f6a20', ghost: '#052008',
  sil: '#bcc0d4', silHi: '#f4f5fc', silLo: '#6d718c', ink: '#1c1c32',
  org: '#ff9a1f', orgHi: '#ffc978', yel: '#f2da1a', yelLo: '#9c8a0c', red: '#ff4a1c',
  sel: '#0000c4', cyan: '#00cfff', cyanHi: '#b5f1ff', cyanLo: '#006c88',
  white: '#ffffff', whiteLo: '#7e8496', gold2: '#e8d44d',
};

// -------------------------------------------------------------------- fonts
// F6: an original proportional caps face, 6 pixels tall (ticker, playlist, labels).
const F6_SRC = {
  A: '.##.|#..#|#..#|####|#..#|#..#', B: '###.|#..#|###.|#..#|#..#|###.',
  C: '.##.|#..#|#...|#...|#..#|.##.', D: '###.|#..#|#..#|#..#|#..#|###.',
  E: '####|#...|###.|#...|#...|####', F: '####|#...|###.|#...|#...|#...',
  G: '.###|#...|#...|#.##|#..#|.###', H: '#..#|#..#|####|#..#|#..#|#..#',
  I: '###|.#.|.#.|.#.|.#.|###', J: '..##|...#|...#|...#|#..#|.##.',
  K: '#..#|#.#.|##..|##..|#.#.|#..#', L: '#...|#...|#...|#...|#...|####',
  M: '#...#|##.##|#.#.#|#.#.#|#...#|#...#', N: '#..#|##.#|##.#|#.##|#.##|#..#',
  O: '.##.|#..#|#..#|#..#|#..#|.##.', P: '###.|#..#|#..#|###.|#...|#...',
  Q: '.##.|#..#|#..#|#..#|#.#.|.#.#', R: '###.|#..#|#..#|###.|#.#.|#..#',
  S: '.###|#...|.##.|...#|...#|###.', T: '#####|..#..|..#..|..#..|..#..|..#..',
  U: '#..#|#..#|#..#|#..#|#..#|.##.', V: '#...#|#...#|#...#|.#.#.|.#.#.|..#..',
  W: '#...#|#...#|#.#.#|#.#.#|##.##|#...#', X: '#..#|#..#|.##.|.##.|#..#|#..#',
  Y: '#...#|.#.#.|..#..|..#..|..#..|..#..', Z: '####|...#|..#.|.#..|#...|####',
  0: '.##.|#..#|#.##|##.#|#..#|.##.', 1: '.#.|##.|.#.|.#.|.#.|###',
  2: '.##.|#..#|...#|.##.|#...|####', 3: '###.|...#|.##.|...#|...#|###.',
  4: '#..#|#..#|#..#|####|...#|...#', 5: '####|#...|###.|...#|...#|###.',
  6: '.##.|#...|###.|#..#|#..#|.##.', 7: '####|...#|..#.|..#.|.#..|.#..',
  8: '.##.|#..#|.##.|#..#|#..#|.##.', 9: '.##.|#..#|#..#|.###|...#|.##.',
  ' ': '..|..|..|..|..|..', '.': '.|.|.|.|.|#', ',': '..|..|..|..|.#|.#|#.',
  ':': '.|#|.|.|#|.', '-': '...|...|...|###|...|...', "'": '#|#|.|.|.|.',
  '*': '...|#.#|.#.|#.#|...|...', '(': '.#|#.|#.|#.|#.|.#', ')': '#.|.#|.#|.#|.#|#.',
  '/': '..#|..#|.#.|.#.|#..|#..', '+': '...|...|.#.|###|.#.|...',
  '&': '.#...|#.#..|.#...|#.#.#|#..#.|.##.#', '!': '#|#|#|#|.|#',
  '?': '.##.|#..#|...#|..#.|....|..#.', '=': '...|...|###|...|###|...',
  '>': '#..|.#.|..#|..#|.#.|#..', '<': '..#|.#.|#..|#..|.#.|..#',
};
// T5: an original 3x5 caps face for the smallest labels.
const T5_SRC = {
  A: '.#.|#.#|###|#.#|#.#', B: '##.|#.#|##.|#.#|##.', C: '.##|#..|#..|#..|.##',
  D: '##.|#.#|#.#|#.#|##.', E: '###|#..|##.|#..|###', F: '###|#..|##.|#..|#..',
  G: '.##|#..|#.#|#.#|.##', H: '#.#|#.#|###|#.#|#.#', I: '#|#|#|#|#',
  J: '..#|..#|..#|#.#|.#.', K: '#.#|#.#|##.|#.#|#.#', L: '#..|#..|#..|#..|###',
  M: '#...#|##.##|#.#.#|#...#|#...#', N: '#..#|##.#|#.##|#..#|#..#', O: '.#.|#.#|#.#|#.#|.#.',
  P: '##.|#.#|##.|#..|#..', Q: '.#.|#.#|#.#|##.|.##', R: '##.|#.#|##.|#.#|#.#',
  S: '.##|#..|.#.|..#|##.', T: '###|.#.|.#.|.#.|.#.', U: '#.#|#.#|#.#|#.#|###',
  V: '#.#|#.#|#.#|#.#|.#.', W: '#...#|#...#|#.#.#|##.##|#...#', X: '#.#|#.#|.#.|#.#|#.#',
  Y: '#.#|#.#|.#.|.#.|.#.', Z: '###|..#|.#.|#..|###',
  0: '###|#.#|#.#|#.#|###', 1: '.#|##|.#|.#|.#', 2: '##.|..#|.#.|#..|###',
  3: '##.|..#|.#.|..#|##.', 4: '#.#|#.#|###|..#|..#', 5: '###|#..|##.|..#|##.',
  6: '.##|#..|###|#.#|###', 7: '###|..#|.#.|.#.|.#.', 8: '###|#.#|###|#.#|###',
  9: '###|#.#|###|..#|##.',
  ' ': '.|.|.|.|.', '.': '.|.|.|.|#', ',': '.|.|.|.|#|#', ':': '.|#|.|#|.', '-': '..|..|##|..|..',
  '+': '...|.#.|###|.#.|...', '/': '..#|..#|.#.|#..|#..', "'": '#|#|.|.|.',
  '(': '.#|#.|#.|#.|.#', ')': '#.|.#|.#|.#|#.', '!': '#|#|#|.|#', '&': '.#.|#.#|.#.|#.#|.##',
};
// Logo faces: ULTRA on a 10x14 grid (drawn at 2), SATISFACTORY on a 7-row grid (drawn at 2).
const ULTRA_SRC = {
  U: ['###....###', '###....###', '###....###', '###....###', '###....###', '###....###', '###....###',
    '###....###', '###....###', '###....###', '###....###', '####..####', '.########.', '..######..'],
  L: ['###.......', '###.......', '###.......', '###.......', '###.......', '###.......', '###.......',
    '###.......', '###.......', '###.......', '###.......', '##########', '##########', '##########'],
  T: ['##########', '##########', '##########', '...####...', '...####...', '...####...', '...####...',
    '...####...', '...####...', '...####...', '...####...', '...####...', '...####...', '...####...'],
  R: ['########..', '#########.', '##########', '###....###', '###....###', '###....###', '#########.',
    '########..', '###.###...', '###..###..', '###...###.', '###...###.', '###....###', '###....###'],
  A: ['...####...', '..######..', '.########.', '###....###', '###....###', '###....###', '###....###',
    '##########', '##########', '##########', '###....###', '###....###', '###....###', '###....###'],
};
const SAT_SRC = {
  S: '.###|#...|#...|.##.|...#|...#|###.', A: '.##.|#..#|#..#|####|#..#|#..#|#..#',
  T: '#####|..#..|..#..|..#..|..#..|..#..|..#..', I: '###|.#.|.#.|.#.|.#.|.#.|###',
  F: '####|#...|#...|###.|#...|#...|#...', C: '.###|#...|#...|#...|#...|#...|.###',
  O: '.##.|#..#|#..#|#..#|#..#|#..#|.##.', R: '###.|#..#|#..#|###.|#.#.|#..#|#..#',
  Y: '#...#|#...#|.#.#.|..#..|..#..|..#..|..#..',
};

// Rows of '#' into merged rectangles (runs merged vertically too), as path data.
function bitmapPath(rows, ox = 0, oy = 0, s = 1) {
  const rects = [];
  let open = new Map();
  rows.forEach((row, y) => {
    const next = new Map();
    for (let x = 0; x < row.length;) {
      if (row[x] !== '#') { x++; continue; }
      let x2 = x;
      while (x2 < row.length && row[x2] === '#') x2++;
      const key = `${x},${x2 - x}`;
      const rc = open.get(key) || (rects.push({ x, y, w: x2 - x, h: 0 }), rects[rects.length - 1]);
      rc.h++;
      next.set(key, rc);
      x = x2;
    }
    open = next;
  });
  return rects.map((r) => `M${ox + r.x * s} ${oy + r.y * s}h${r.w * s}v${r.h * s}h${-r.w * s}z`).join('');
}

function makeFont(prefix, src, sp, smear = false) {
  const g = {};
  for (const [ch, def] of Object.entries(src)) {
    let rows = def.split('|');
    if (smear) {
      rows = rows.map((r) => {
        const o = [];
        for (let i = 0; i <= r.length; i++) o.push(r[i] === '#' || r[i - 1] === '#' ? '#' : '.');
        return o.join('');
      });
    }
    g[ch] = { w: rows[0].length, rows, id: `@${prefix}${ch.charCodeAt(0).toString(36)}@`, ink: rows.some((r) => r.includes('#')) };
  }
  return { g, sp, used: new Set() };
}
const F6 = makeFont('a', F6_SRC, 1);
const F6B = makeFont('b', F6_SRC, 1, true); // bold: smeared one pixel right, for title bars
const T5 = makeFont('c', T5_SRC, 1);
const FONTS = [F6, F6B, T5];

function textW(font, str) {
  let w = 0;
  for (const ch of str) {
    const g = font.g[ch];
    if (!g) throw new Error(`no glyph for "${ch}" in "${str}"`);
    w += g.w + font.sp;
  }
  return w - font.sp;
}
// One line of text as <use> elements inside a translated group (no fill: inherits).
function line(font, str, x, y, maxX = Infinity) {
  let cx = 0;
  let s = '';
  for (const ch of str) {
    const g = font.g[ch];
    if (!g) throw new Error(`no glyph for "${ch}" in "${str}"`);
    if (x + cx >= maxX) break;
    if (g.ink) {
      font.used.add(ch);
      s += `<use href="#${g.id}"${cx ? ` x="${cx}"` : ''}/>`;
    }
    cx += g.w + font.sp;
  }
  return `<g transform="translate(${x} ${y})">${s}</g>`;
}

// ------------------------------------------------------------- pixel buffer
class Pix {
  constructor(w, h) { this.w = w; this.h = h; this.d = new Array(w * h).fill(null); }
  rect(x, y, w, h, c) {
    for (let j = Math.max(0, y); j < Math.min(this.h, y + h); j++) {
      for (let i = Math.max(0, x); i < Math.min(this.w, x + w); i++) this.d[j * this.w + i] = c;
    }
  }
  px(x, y, c) { this.rect(x, y, 1, 1, c); }
  get(x, y) { return x < 0 || y < 0 || x >= this.w || y >= this.h ? null : this.d[y * this.w + x]; }
  // rows of palette characters; '.' is transparent
  sprite(rows, x, y, pal, s = 1) {
    rows.forEach((row, j) => {
      [...row].forEach((ch, i) => { if (ch !== '.' && pal[ch]) this.rect(x + i * s, y + j * s, s, s, pal[ch]); });
    });
  }
  // sunken box: dark top/left, light bottom/right
  inset(x, y, w, h, fill = C.blk) {
    this.rect(x, y, w, h, fill);
    this.rect(x, y, w, 1, C.lo2); this.rect(x, y, 1, h, C.lo2);
    this.rect(x, y + h - 1, w, 1, C.hi); this.rect(x + w - 1, y, 1, h, C.hi);
  }
  // raised box
  raised(x, y, w, h, fill = C.base, hi = C.hi, lo = C.lo2) {
    this.rect(x, y, w, h, fill);
    this.rect(x, y, w, 1, hi); this.rect(x, y, 1, h, hi);
    this.rect(x, y + h - 1, w, 1, lo); this.rect(x + w - 1, y, 1, h, lo);
  }
  // One <path> per colour, as merged rectangles; the `skip` colour is left out.
  //
  // The banner is shown at whatever width the README happens to be, which is
  // almost never an exact multiple of the 415-pixel grid, so it has to survive
  // anti-aliased scaling. Painting each colour only on its own pixels would
  // let the background bleed through every shared edge (two half-covered
  // edges do not add up to one covered pixel). So colours are painted in
  // layers, biggest areas first, and every layer reaches half a pixel
  // underneath any neighbour that is painted after it: each boundary then has
  // exactly one edge on it, the upper layer's. Work is done on a half-pixel
  // grid and scaled back down by the wrapping group.
  paths(skip = null, ox = 0, oy = 0) {
    const S = 2;
    const w = this.w * S;
    const h = this.h * S;
    const count = new Map();
    for (const c of this.d) if (c !== null && c !== skip) count.set(c, (count.get(c) || 0) + 1);
    const order = [...count.keys()].sort((a, b) => count.get(b) - count.get(a) || (a < b ? -1 : 1));
    const rankOf = new Map(order.map((c, i) => [c, i]));
    const rk = new Int16Array(w * h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const c = this.d[(y >> 1) * this.w + (x >> 1)];
        rk[y * w + x] = c === null || c === skip ? -1 : rankOf.get(c);
      }
    }
    // lowest rank in each cell's 3x3 neighbourhood: a layer may only run
    // underneath a later cell whose neighbours are all its own or later too
    const low = new Int16Array(w * h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let m = rk[y * w + x];
        for (let j = Math.max(0, y - 1); j <= Math.min(h - 1, y + 1); j++) {
          for (let i = Math.max(0, x - 1); i <= Math.min(w - 1, x + 1); i++) if (rk[j * w + i] < m) m = rk[j * w + i];
        }
        low[y * w + x] = m;
      }
    }
    let out = '';
    const need = new Uint8Array(w * h); // 1 = must be covered, 2 = covered
    order.forEach((c, k) => {
      need.fill(0);
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          if (rk[y * w + x] !== k) continue;
          need[y * w + x] = 1;
          for (let j = Math.max(0, y - 1); j <= Math.min(h - 1, y + 1); j++) {
            for (let i = Math.max(0, x - 1); i <= Math.min(w - 1, x + 1); i++) if (rk[j * w + i] > k) need[j * w + i] = 1;
          }
        }
      }
      const ok = (i) => need[i] !== 0 || (rk[i] > k && low[i] >= k);
      let d = '';
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          if (need[y * w + x] !== 1) continue;
          let x2 = x;
          while (x2 < w && need[y * w + x2] !== 0) x2++;
          let y2 = y + 1;
          down: while (y2 < h) {
            let any = false;
            for (let i = x; i < x2; i++) { if (!ok(y2 * w + i)) break down; if (need[y2 * w + i] === 1) any = true; }
            if (!any) {
              // only keep going through a hidden row if there is more to cover below it
              let more = false;
              for (let j = y2 + 1; j < h && !more; j++) {
                let clear = true;
                for (let i = x; i < x2 && clear; i++) { if (!ok(j * w + i)) clear = false; else if (need[j * w + i] === 1) more = true; }
                if (!clear) break;
              }
              if (!more) break;
            }
            y2++;
          }
          wide: while (x2 < w) {
            for (let j = y; j < y2; j++) if (!ok(j * w + x2)) break wide;
            let any = false;
            for (let j = y; j < y2; j++) if (need[j * w + x2] === 1) any = true;
            if (!any) break;
            x2++;
          }
          for (let j = y; j < y2; j++) for (let i = x; i < x2; i++) if (need[j * w + i] === 1) need[j * w + i] = 2;
          d += `M${x + ox * S} ${y + oy * S}h${x2 - x}v${y2 - y}h${x - x2}z`;
        }
      }
      out += `<path fill="${c}" d="${d}"/>`;
    });
    return `<g transform="scale(${1 / S})">${out}</g>`;
  }
}

const P = new Pix(W, H); // static chrome
const textLayers = new Map(); // fill -> svg of <use> lines
function say(font, str, x, y, fill, align = 'l') {
  const w = textW(font, str);
  const x0 = align === 'c' ? Math.round(x - w / 2) : align === 'r' ? x - w + 1 : x;
  if (!textLayers.has(fill)) textLayers.set(fill, []);
  textLayers.get(fill).push(line(font, str, x0, y));
  return { x: x0, w };
}
const anim = []; // animated svg fragments, in paint order

// ------------------------------------------------------------ window chrome
function windowFrame(r, title, { buttons = 3, emblem = false } = {}) {
  const { x, y, w, h } = r;
  P.rect(x, y, w, h, C.out);
  P.rect(x + 1, y + 1, w - 2, h - 2, C.base);
  P.rect(x + 1, y + 1, w - 2, 1, C.hi2); P.rect(x + 1, y + 1, 1, h - 2, C.hi);
  P.rect(x + 1, y + h - 2, w - 2, 1, C.lo2); P.rect(x + w - 2, y + 1, 1, h - 2, C.lo2);
  // title bar
  P.rect(x + 2, y + 2, w - 4, 11, C.bar);
  P.rect(x + 2, y + 13, w - 4, 1, C.lo2);
  P.rect(x + 2, y + 14, w - 4, 1, C.hi);
  const tw = textW(F6B, title);
  const tx = x + Math.round((w - tw) / 2);
  say(F6B, title, tx, y + 5, C.cream);
  const left = x + (emblem ? 17 : 6);
  const right = x + w - 5 - buttons * 10;
  for (const yy of [4, 8]) {
    P.rect(left, y + yy, tx - 4 - left, 1, C.gold); P.rect(left, y + yy + 1, tx - 4 - left, 1, C.goldLo);
    P.rect(tx + tw + 4, y + yy, right - (tx + tw + 4), 1, C.gold); P.rect(tx + tw + 4, y + yy + 1, right - (tx + tw + 4), 1, C.goldLo);
  }
  // tiny square window buttons
  const glyphs = [['.....', '.....', '.....', '.###.'], ['.###.', '.###.', '.....', '.....'], ['#...#', '.#.#.', '..#..', '.#.#.', '#...#']];
  for (let b = 0; b < buttons; b++) {
    const bx = x + w - 3 - (buttons - b) * 10;
    P.raised(bx, y + 3, 9, 9, C.hi, C.hi2, C.lo2);
    const g = glyphs[3 - buttons + b];
    P.sprite(g, bx + 2, y + 5, { '#': C.cream });
  }
  if (emblem) {
    // a small hexagon-with-hub mark (the app's emblem is a hexagon with a cog)
    P.sprite(['....#....', '..##.##..', '##.....##', '#...g...#', '#..ggg..#', '#...g...#', '##.....##', '..##.##..', '....#....'], x + 5, y + 3,
      { '#': C.cyan, g: C.gold2 });
  }
  // rivets in the four corners of the body
  for (const [rx, ry] of [[x + 4, y + 17], [x + w - 6, y + 17], [x + 4, y + h - 6], [x + w - 6, y + h - 6]]) {
    P.px(rx, ry, C.hi2); P.px(rx + 1, ry, C.hi); P.px(rx, ry + 1, C.hi); P.px(rx + 1, ry + 1, C.lo2);
  }
}
// small dark push button with optional lamp and a label
function button(x, y, w, h, label, { lamp = null, font = T5, fill = C.lab } = {}) {
  P.raised(x, y, w, h, C.base, C.hi2, C.lo2);
  P.rect(x + 1, y + 1, w - 2, h - 2, '#383860');
  P.rect(x + 1, y + h - 2, w - 2, 1, C.lo); P.rect(x + w - 2, y + 1, 1, h - 2, C.lo);
  const lw = textW(font, label);
  const lampW = lamp ? 5 : 0;
  const tx = x + Math.floor((w - lw - lampW) / 2) + lampW;
  const fh = font === T5 ? 5 : 6;
  say(font, label, tx, y + Math.floor((h - fh) / 2), fill);
  if (lamp) {
    P.rect(tx - 5, y + Math.floor(h / 2) - 1, 3, 3, lamp);
    P.px(tx - 5, y + Math.floor(h / 2) - 1, C.white);
  }
  return tx;
}

// ===================================================================== MAIN
windowFrame(MAIN, 'FUSEBOX', { emblem: true });
{
  const { x: X, y: Y } = MAIN;
  // --- left display: clutter letters, play glyph, LED time, analyser
  P.inset(X + 9, Y + 20, 95, 46);
  ['U', 'L', 'T', 'R', 'A'].forEach((ch, i) => say(T5, ch, X + 12, Y + 24 + i * 8, '#6f6a3c'));
  P.rect(X + 17, Y + 22, 1, 42, '#14142a');
  // play-state glyph
  P.sprite(['#....', '##...', '###..', '####.', '#####', '####.', '###..', '##...', '#....'], X + 24, Y + 27, { '#': C.grn });
  P.rect(X + 22, Y + 24, 2, 1, C.grn); P.rect(X + 25, Y + 24, 2, 1, C.grnDim); P.rect(X + 28, Y + 24, 2, 1, C.grnDim);
}
// LED digits, 9x14, built from seven segments
const SEG = {
  a: [[1, 0, 7, 1], [2, 1, 5, 1]], d: [[1, 13, 7, 1], [2, 12, 5, 1]], g: [[2, 6, 5, 2]],
  f: [[0, 1, 1, 6], [1, 2, 1, 4]], b: [[8, 1, 1, 6], [7, 2, 1, 4]],
  e: [[0, 7, 1, 6], [1, 8, 1, 4]], c: [[8, 7, 1, 6], [7, 8, 1, 4]],
};
const DIGSEG = ['abcdef', 'bc', 'abged', 'abgcd', 'fgbc', 'afgcd', 'afgedc', 'abc', 'abcdefg', 'abfgcd'];
const segPath = (segs, ox = 0, oy = 0) => [...segs].map((k) => SEG[k].map(([x, y, w, h]) => `M${ox + x} ${oy + y}h${w}v${h}h${-w}z`).join('')).join('');
const DIG_X = [44, 55, 70, 81];
const DIG_Y = 25;
{
  const { x: X, y: Y } = MAIN;
  for (const dx of DIG_X) for (const k of 'abcdefg') for (const [x, y, w, h] of SEG[k]) P.rect(X + dx + x, Y + DIG_Y + y, w, h, C.ghost);
  P.rect(X + 66, Y + 29, 2, 2, C.grn); P.rect(X + 66, Y + 34, 2, 2, C.grn);
}
// analyser: 19 fixed colour bars, revealed by animated black covers
const AN = { x: 24, y: 47, n: 19, h: 16 };
const AN_COL = ['#ff3a12', '#ff5a10', '#ff7a0c', '#ff9a08', '#ffb806', '#ffd504', '#f0e400', '#cfea00', '#a6ea00', '#7fe600',
  '#5be200', '#3fdc08', '#2cd414', '#22cc1c', '#1cc422', '#18bc26'];
const FPS = 12;
const AN_DUR = 4; // seconds per analyser loop (divides every track length)
const AN_FR = AN_DUR * FPS;
const levels = []; // [bar][frame] 0..16
const caps = [];
for (let i = 0; i < AN.n; i++) {
  // the imaginary tune: kick and snare in the low and middle bars, a riff
  // through the mids, hats up top. One bar of 4/4 at 120 BPM is 24 frames.
  const t = i / (AN.n - 1);
  const peak = 15.5 - 7 * t + 2.5 * Math.exp(-(((i - 8) / 3) ** 2));
  const hits = new Array(AN_FR).fill(0);
  for (let f = 0; f < AN_FR; f++) {
    const kick = f % 12 === 0;
    const snare = f % 12 === 6;
    const six = f % 3 === 0;
    let v = 0;
    if (kick && i < 6) v = peak * (0.84 + 0.16 * rand());
    else if (snare && i > 2 && i < 13) v = peak * (0.7 + 0.3 * rand());
    else if (six && i > 10 && rand() < 0.75) v = peak * (0.5 + 0.5 * rand());
    else if (six && i > 3 && i < 14 && rand() < 0.5) v = peak * (0.45 + 0.5 * rand());
    else if (rand() < 0.1) v = peak * (0.25 + 0.3 * rand());
    hits[f] = v;
  }
  const decay = 0.8 + 0.7 * t + 0.3 * rand();
  const lv = new Array(AN_FR).fill(0);
  const cp = new Array(AN_FR).fill(0);
  let L = 0;
  let cap = 0;
  let hold = 0;
  for (let pass = 0; pass < 4; pass++) {
    for (let f = 0; f < AN_FR; f++) {
      L = Math.max(hits[f], L - decay, 1 + (f + i) % 2);
      const li = Math.max(0, Math.min(AN.h, Math.round(L)));
      if (li >= cap) { cap = li; hold = 5; } else if (hold > 0) hold--; else cap = Math.max(li, cap - 0.45);
      lv[f] = li;
      cp[f] = Math.min(AN.h, Math.round(cap));
    }
  }
  levels.push(lv);
  caps.push(cp);
}
{
  const { x: X, y: Y } = MAIN;
  for (let r = 0; r < AN.h; r++) P.rect(X + AN.x, Y + AN.y + r, AN.n * 4 - 1, 1, AN_COL[r]);
  for (let i = 0; i < AN.n - 1; i++) P.rect(X + AN.x + i * 4 + 3, Y + AN.y, 1, AN.h, C.blk);
  // faint floor line: painted after the covers, so it stays lit through the silences
  let floor = '';
  for (let i = 0; i < AN.n; i++) floor += `M${X + AN.x + i * 4} ${Y + AN.y + AN.h}h3v1h-3z`;
  // animated covers and peak caps (SMIL, discrete, whole pixels)
  let live = '';
  let still = '';
  const F0 = 7; // the frame used when motion is reduced
  for (let i = 0; i < AN.n; i++) {
    const bx = X + AN.x + i * 4;
    const hv = levels[i].map((v) => AN.h - v + 1); // covers start one pixel above the bars
    const cv = caps[i].map((v) => Y + AN.y + AN.h - v - 1);
    live += `<rect x="${bx - 0.5}" y="${Y + AN.y - 1}" width="4" height="${hv[0]}"><animate attributeName="height" dur="${AN_DUR}s" repeatCount="indefinite" calcMode="discrete" values="${hv.join(';')}"/></rect>`;
    live += `<rect class="cp" x="${bx}" y="${cv[0]}" width="3" height="1"><animate attributeName="y" dur="${AN_DUR}s" repeatCount="indefinite" calcMode="discrete" values="${cv.join(';')}"/></rect>`;
    still += `<rect x="${bx - 0.5}" y="${Y + AN.y - 1}" width="4" height="${hv[F0]}"/><rect class="cp" x="${bx}" y="${cv[F0]}" width="3" height="1"/>`;
  }
  // a breath of silence just before each track change
  const blip = TRACKS.map((t, i) => `${pct(STARTS[i] + t.len - 0.34)}{opacity:1}${i === TRACKS.length - 1 ? '' : `${pct(STARTS[i] + t.len)}{opacity:0}`}`).join('');
  anim.push(`<g class="an">${live}</g><g class="st">${still}</g><rect class="bl" x="${X + AN.x - 1}" y="${Y + AN.y - 2}" width="${AN.n * 4 + 1}" height="${AN.h + 3.5}"/><path fill="#0c3a14" d="${floor}"/>`);
  anim.css = `.cp{fill:#d6d6ea}.st{display:none}.bl{opacity:0;animation:bl ${LOOP}s step-end infinite}@keyframes bl{0%{opacity:0}${blip}100%{opacity:0}}`;
}
// time digits: minutes are static, seconds count the current track
const digitDefs = DIGSEG.map((s, d) => `<path id="d${d}" d="${segPath(s)}"/>`).join('');
{
  const { x: X, y: Y } = MAIN;
  const DH = 16;
  let ones = '';
  for (let d = 0; d < 10; d++) ones += `<use href="#d${d}" y="${d * DH}"/>`;
  const kOnes = [];
  const kTens = [];
  for (let s = 0; s < LOOP; s++) {
    const ti = STARTS.findLastIndex((st) => st <= s);
    const v = s - STARTS[ti];
    kOnes.push(`${pct(s)}{transform:translateY(${-(v % 10) * DH}px)}`);
    const tens = Math.floor(v / 10);
    if (s === 0 || tens !== Math.floor((s - 1 - STARTS[STARTS.findLastIndex((st) => st <= s - 1)]) / 10)) kTens.push(`${pct(s)}{transform:translateY(${-tens * DH}px)}`);
  }
  anim.push(`<g fill="${C.grn}"><use href="#d0" x="${X + DIG_X[0]}" y="${Y + DIG_Y}"/><use href="#d0" x="${X + DIG_X[1]}" y="${Y + DIG_Y}"/>`
    + `<g clip-path="url(#ck)"><g transform="translate(${X + DIG_X[2]} ${Y + DIG_Y})"><g class="dt"><use href="#d0"/><use href="#d1" y="${DH}"/></g></g>`
    + `<g transform="translate(${X + DIG_X[3]} ${Y + DIG_Y})"><g class="do">${ones}</g></g></g></g>`);
  anim.defs = `<clipPath id="ck"><rect x="${X + DIG_X[2]}" y="${Y + DIG_Y}" width="22" height="14"/></clipPath>`;
  anim.css += `.do{transform:translateY(${-3 * DH}px);animation:do ${LOOP}s step-end infinite}.dt{animation:dt ${LOOP}s step-end infinite}`
    + `@keyframes do{${kOnes.join('')}}@keyframes dt{${kTens.join('')}}`;
}
{
  const { x: X, y: Y } = MAIN;
  // --- ticker
  P.inset(X + 109, Y + 20, 159, 15);
  // --- two real numbers where the bitrate and sample rate would be
  P.inset(X + 109, Y + 39, 20, 11);
  say(F6, '211', X + 119, Y + 41, C.grn, 'c');
  say(T5, 'RECIPES', X + 132, Y + 42, C.lab);
  P.inset(X + 163, Y + 39, 15, 11);
  say(F6, '88', X + 170, Y + 41, C.grn, 'c');
  say(T5, 'ALT', X + 181, Y + 42, C.lab);
  // mono/stereo, more or less
  say(T5, 'TIDY', X + 203, Y + 42, '#565688');
  say(T5, 'SPAGHETTI', X + 224, Y + 42, C.grn);
  P.rect(X + 221, Y + 43, 1, 3, C.lo2);
  // --- volume (orange) and balance (green)
  const groove = (x, y, w, colA, colB, fillTo) => {
    P.inset(x, y, w, 7, '#0a0a14');
    for (let i = 1; i < w - 1; i++) {
      if (fillTo === null) { P.rect(x + i, y + 1, 1, 5, i % 2 ? colA : colB); } else if (i <= fillTo) { P.rect(x + i, y + 1, 1, 5, colA); P.px(x + i, y + 1, colB); }
    }
  };
  const knob = (x, y, w, h) => {
    P.raised(x, y, w, h, C.sil, C.silHi, C.silLo);
    P.rect(x + Math.floor(w / 2) - 1, y + 2, 1, h - 4, C.silLo); P.rect(x + Math.floor(w / 2) + 1, y + 2, 1, h - 4, C.silLo);
    P.rect(x, y + h, w, 1, C.lo2);
  };
  groove(X + 107, Y + 58, 68, C.org, C.orgHi, 50);
  knob(X + 107 + 46, Y + 56, 12, 11);
  groove(X + 178, Y + 58, 38, C.grnDim, '#1a9a30', null);
  knob(X + 178 + 13, Y + 56, 12, 11);
  button(X + 219, Y + 56, 23, 12, 'EQ', { lamp: C.grn, font: F6, fill: C.cream });
  button(X + 243, Y + 56, 23, 12, 'PL', { lamp: C.grn, font: F6, fill: C.cream });
  // --- seek bar
  P.inset(X + 16, Y + 72, 248, 10, '#0a0a14');
  for (let i = 0; i < 61; i++) P.rect(X + 19 + i * 4, Y + 76, 2, 1, '#23233e');
  // --- transport
  const tb = (x, w, rows, col = C.ink, h = 18, y = 87) => {
    P.raised(X + x, Y + y, w, h, C.sil, C.silHi, C.silLo);
    P.rect(X + x + 1, Y + y + h - 2, w - 2, 1, '#9a9eb6'); P.rect(X + x + w - 2, Y + y + 1, 1, h - 2, '#9a9eb6');
    P.rect(X + x, Y + y + h, w, 1, C.lo2);
    const gw = rows[0].length;
    P.sprite(rows, X + x + Math.floor((w - gw) / 2), Y + y + Math.floor((h - rows.length) / 2), { '#': col });
  };
  const triL = ['...#', '..##', '.###', '####', '.###', '..##', '...#'];
  const triR = triL.map((r) => [...r].reverse().join(''));
  const bar = ['#', '#', '#', '#', '#', '#', '#'];
  const join = (...parts) => parts[0].map((_, r) => parts.map((p) => p[r]).join(''));
  tb(16, 22, join(bar, triL, triL));
  tb(39, 22, ['#....', '##...', '###..', '####.', '#####', '####.', '###..', '##...', '#....'], '#0a7a1c');
  tb(62, 22, join(['##', '##', '##', '##', '##', '##', '##'], ['..', '..', '..', '..', '..', '..', '..'], ['##', '##', '##', '##', '##', '##', '##']));
  tb(85, 22, ['######', '######', '######', '######', '######', '######']);
  tb(108, 22, join(triR, triR, bar));
  tb(136, 22, ['...#...', '..###..', '.#####.', '#######', '.......', '#######', '#######'], C.ink, 16, 88);
  // --- two toggles with lamps
  const ocx = button(X + 163, Y + 88, 50, 16, 'OVERCLOCK', { lamp: C.org });
  // the overclock lamp winks once a second
  anim.push(`<rect class="bk" x="${ocx - 5}" y="${Y + 95}" width="3" height="3" fill="#5a3208"/>`);
  anim.css += `.bk{opacity:0;animation:bk 1s step-end infinite}@keyframes bk{0%{opacity:0}60%{opacity:1}}`;
  button(X + 216, Y + 88, 30, 16, 'LOOP', { lamp: C.grn });
  // the slogan, stamped into the bottom edge
  say(T5, 'PLAYS UNTIL SOMETHING TRIPS', X + 16, Y + 108, '#5c5c8c');
}
// seek thumb (gold), creeping across each track
{
  const { x: X, y: Y } = MAIN;
  const T = new Pix(29, 10);
  T.raised(0, 0, 29, 10, C.gold2, '#fff6b0', '#8a7a1e');
  T.rect(1, 8, 27, 1, '#c4b138');
  for (const gx of [11, 14, 17]) { T.rect(gx, 2, 1, 6, '#8a7a1e'); T.rect(gx + 1, 2, 1, 6, '#fff6b0'); }
  const travel = 248 - 29;
  const k = TRACKS.map((t, i) => `${pct(STARTS[i])}{transform:translateX(0);animation-timing-function:steps(${travel})}${pct(STARTS[i] + t.len - 0.02)}{transform:translateX(${travel}px);animation-timing-function:step-end}`).join('');
  anim.push(`<g transform="translate(${X + 16} ${Y + 72})"><g class="sk">${T.paths()}</g></g>`);
  anim.css += `.sk{transform:translateX(${Math.round((travel * 3) / TRACKS[0].len)}px);animation:sk ${LOOP}s linear infinite}@keyframes sk{${k}100%{transform:translateX(0)}}`;
}
// ticker strips, one per track, scrolling one pixel at a time
const TICK = { x: 112, y: 25, w: 153, speed: 46, hold: 1 };
{
  const { x: X, y: Y } = MAIN;
  let strips = '';
  // shorthand first: the per-strip rules below only set animation-name
  anim.css += `.tv{animation:${LOOP}s step-end infinite}.tm{animation:${LOOP}s linear infinite}`;
  TRACKS.forEach((t, i) => {
    const said = `${i + 1}. ${t.row}  ***  ${t.more}`;
    const unit = `${said}  ***  `;
    const uw = textW(F6, unit) + F6.sp;
    const dist = (t.len - TICK.hold) * TICK.speed;
    if (t.len % AN_DUR) throw new Error(`track ${i + 1}: length must be a multiple of ${AN_DUR} s`);
    if (textW(F6, said) + 6 > dist + TICK.w) throw new Error(`track ${i + 1}: ticker line (${textW(F6, said)}px) does not finish in ${t.len} s (${dist + TICK.w}px)`);
    let s = '';
    for (let off = 0; off < dist + TICK.w; off += uw) s += line(F6, unit, off, 0, dist + TICK.w);
    const a = STARTS[i];
    const b = a + t.len;
    const vis = i === 0
      ? `0%{opacity:1}${pct(b)}{opacity:0}100%{opacity:0}`
      : `0%{opacity:0}${pct(a)}{opacity:1}${b < LOOP ? `${pct(b)}{opacity:0}` : ''}100%{opacity:${b < LOOP ? 0 : 1}}`;
    const mv = `0%{transform:translateX(0);animation-timing-function:step-end}`
      + `${pct(a + TICK.hold)}{transform:translateX(0);animation-timing-function:steps(${dist})}`
      + `${pct(b - 0.02)}{transform:translateX(${-dist}px);animation-timing-function:step-end}100%{transform:translateX(${-dist}px)}`;
    strips += `<g class="tv tv${i}"${i === 0 ? '' : ' opacity="0"'}><g class="tm tm${i}">${s}</g></g>`;
    anim.css += `@keyframes tv${i}{${vis}}@keyframes tm${i}{${mv}}.tv${i}{animation-name:tv${i}}.tm${i}{animation-name:tm${i}}`;
    t.unitW = uw;
  });
  anim.push(`<g clip-path="url(#ct)" fill="${C.grn}"><g transform="translate(${X + TICK.x} ${Y + TICK.y})">${strips}</g></g>`);
  anim.defs += `<clipPath id="ct"><rect x="${X + TICK.x}" y="${Y + TICK.y - 2}" width="${TICK.w}" height="10"/></clipPath>`;
}
// the emblem: a hexagon with a turning cog (vector, original)
{
  const { x: X, y: Y } = MAIN;
  const cx = X + 258.5;
  const cy = Y + 96;
  const hex = [];
  for (let k = 0; k < 6; k++) hex.push(`${n3(cx + 8 * Math.cos((Math.PI / 3) * k + Math.PI / 6))},${n3(cy + 8 * Math.sin((Math.PI / 3) * k + Math.PI / 6))}`);
  let cog = '';
  const teeth = 8;
  for (let k = 0; k < teeth * 2; k++) {
    const r = k % 2 ? 3.2 : 4.9;
    for (const da of [-0.17, 0.17]) {
      const a = (Math.PI / teeth) * k + da;
      cog += `${cog ? 'L' : 'M'}${n3(r * Math.cos(a))} ${n3(r * Math.sin(a))}`;
    }
  }
  anim.push(`<g><polygon points="${hex.join(' ')}" fill="#0b0b18" stroke="${C.cyan}" stroke-width="1.2"/>`
    + `<g transform="translate(${cx} ${cy})"><g class="cg"><path d="${cog}z" fill="${C.gold2}"/><circle r="1.5" fill="#0b0b18"/></g></g></g>`);
  anim.css += `.cg{animation:cg 12s linear infinite}@keyframes cg{to{transform:rotate(360deg)}}`;
}

// ================================================================ EQUALISER
windowFrame(EQ, 'FUSEBOX EQUALISER');
{
  const { x: X, y: Y } = EQ;
  button(X + 14, Y + 18, 26, 12, 'ON', { lamp: C.grn, font: F6, fill: C.cream });
  button(X + 42, Y + 18, 33, 12, 'AUTO', { lamp: '#15401c', font: F6, fill: C.lab });
  button(X + 217, Y + 18, 44, 12, 'PRESETS', { font: F6, fill: C.lab });
  // response curve
  const GX = X + 86;
  const GY = Y + 17;
  P.inset(GX, GY, 113, 20);
  for (let i = 0; i < 28; i++) P.px(GX + 2 + i * 4, GY + 10, '#123a18');
  const SL = { top: 40, bot: 84, x0: 78, step: 18 }; // knob centre travel
  const frac = (v) => Math.log10(v) / 3;
  const pts = BANDS.map(([v], i) => [GX + 6 + Math.round((i * 100) / 9), GY + 17 - Math.round(frac(v) * 15)]);
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[i + 1];
    for (let x = x0; x <= x1; x++) {
      const u = (x - x0) / (x1 - x0);
      const s = u * u * (3 - 2 * u);
      const ya = Math.round(y0 + (y1 - y0) * s);
      const yb = Math.round(y0 + (y1 - y0) * (((x + 1 - x0) / (x1 - x0)) ** 2 * (3 - 2 * ((x + 1 - x0) / (x1 - x0)))));
      for (let y = Math.min(ya, x < x1 ? yb : ya); y <= Math.max(ya, x < x1 ? yb : ya); y++) P.px(x, y, C.grn);
    }
  }
  for (const [x, y] of pts) P.rect(x - 1, y - 1, 3, 3, C.yel);
  // sliders
  const slider = (sx, v, fill, fillHi) => {
    P.inset(sx + 4, Y + SL.top - 4, 6, SL.bot - SL.top + 9, '#0a0a14');
    const ky = Math.round(Y + SL.bot - v * (SL.bot - SL.top));
    for (let y = ky; y < Y + SL.bot + 4; y++) { P.rect(sx + 5, y, 4, 1, fill); P.px(sx + 5, y, fillHi); }
    for (let k = 0; k <= 6; k++) { const ty = Math.round(Y + SL.bot - (k / 6) * (SL.bot - SL.top)); P.px(sx + 1, ty, C.hi); P.px(sx + 12, ty, C.hi); }
    return ky;
  };
  const knob = (p, x, y) => {
    p.raised(x, y, 11, 7, C.sil, C.silHi, C.silLo);
    p.rect(x + 2, y + 3, 7, 1, C.ink);
    p.rect(x, y + 7, 11, 1, C.lo2);
  };
  // the "preamp": pinned to the top and shaking a little
  const pk = slider(X + 21, 1, C.red, '#ffb08a');
  {
    const K = new Pix(11, 8);
    knob(K, 0, 0);
    anim.push(`<g transform="translate(${X + 22} ${pk - 3})"><g class="oc">${K.paths()}</g></g>`);
    anim.css += `.oc{animation:oc 4s step-end infinite}@keyframes oc{0%{transform:none}70%{transform:translateY(1px)}75%{transform:none}80%{transform:translateY(1px)}85%{transform:none}90%{transform:translateY(1px)}95%{transform:none}}`;
  }
  say(T5, 'OVERCLOCK', X + 28, Y + 92, C.org, 'c');
  say(T5, 'PINNED', X + 28, Y + 99, C.labDim, 'c');
  // log scale marks
  [['1000', 1], ['100', 2 / 3], ['10', 1 / 3], ['1', 0]].forEach(([lab, f]) => {
    const y = Math.round(Y + SL.bot - f * (SL.bot - SL.top));
    say(T5, lab, X + 70, y - 2, C.lab, 'r');
    P.rect(X + 72, y, 3, 1, C.lab);
  });
  // row label for the numbers: sits by the first value, in their colour, clear of OVERCLOCK
  say(T5, 'COUNT', X + 78, Y + 92, '#a39538', 'r');
  BANDS.forEach(([v, name], i) => {
    const sx = X + SL.x0 + i * SL.step;
    const ky = slider(sx, frac(v), C.yel, '#fff59a');
    knob(P, sx + 1, ky - 3);
    say(T5, String(v), sx + 7, Y + 92, C.gold2, 'c');
    say(T5, name, sx + 7, Y + (i % 2 ? 106 : 99), C.lab, 'c');
  });
}

// =============================================================== VISUALISER
windowFrame(VIS, 'VISUALISER', { buttons: 1 });
const logo = new Pix(W, H);
let logoGlowC = '';
let logoGlowW = '';
{
  const { x: X, y: Y } = VIS;
  P.inset(X + 5, Y + 17, 130, 94);
  // ULTRA: five letters of 20, gaps 5,6,6,5 = 122 wide
  const gaps = [0, 25, 51, 77, 102];
  const shape = new Pix(W, H);
  [...'ULTRA'].forEach((ch, i) => shape.sprite(ULTRA_SRC[ch], X + 9 + gaps[i], Y + 22, { '#': 'c' }, 2));
  // SATISFACTORY: twelve letters at 2x, 2-pixel gaps
  let sx = X + 9;
  for (const ch of 'SATISFACTORY') {
    const rows = SAT_SRC[ch].split('|');
    shape.sprite(rows, sx, Y + 55, { '#': 'w' }, 2);
    sx += rows[0].length * 2 + 2;
  }
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const v = shape.get(x, y);
      if (!v) continue;
      const up = shape.get(x, y - 1) !== v;
      const dn = shape.get(x, y + 1) !== v;
      if (v === 'c') logo.px(x, y, up ? C.cyanHi : dn ? '#0095bb' : C.cyan);
      else logo.px(x, y, dn ? '#c2c8d8' : C.white);
    }
  }
  const only = (k) => { const q = new Pix(W, H); for (let i = 0; i < q.d.length; i++) if (shape.d[i] === k) q.d[i] = '#000'; return q.paths().replace(/ fill="#000"/, ''); };
  logoGlowC = only('c');
  logoGlowW = only('w');
  say(T5, 'RECIPE LOOKUP FOR SATISFACTORY', X + 70, Y + 73, C.gold2, 'c');
  say(T5, 'UNOFFICIAL FAN PROJECT', X + 70, Y + 103, '#8f95aa', 'c');
  // scope: two pixel traces scrolling at different speeds behind a dotted grid
  const SC = { x: X + 8, y: Y + 81, w: 124, h: 20 };
  for (let i = 0; i < 31; i++) P.px(SC.x + 2 + i * 4, SC.y + 10, '#0d3340');
  for (let j = 0; j < 5; j++) { P.px(SC.x + 30, SC.y + 2 + j * 4, '#0d3340'); P.px(SC.x + 62, SC.y + 2 + j * 4, '#0d3340'); P.px(SC.x + 94, SC.y + 2 + j * 4, '#0d3340'); }
  const trace = (period, amp, fn) => {
    const ys = [];
    for (let x = 0; x <= SC.w + period; x++) ys.push(Math.round(SC.y + 10 + amp * fn(((x % period) / period) * Math.PI * 2)));
    let d = '';
    for (let x = 0; x < ys.length - 1; x++) {
      const a = Math.min(ys[x], ys[x + 1]);
      const b = Math.max(ys[x], ys[x + 1]);
      d += `M${SC.x + x} ${a}h1v${b - a + 1}h-1z`;
    }
    return d;
  };
  const w1 = trace(62, 8, (a) => 0.55 * Math.sin(a) + 0.3 * Math.sin(3 * a + 0.8) + 0.15 * Math.sin(7 * a));
  const w2 = trace(31, 5, (a) => 0.7 * Math.sin(a + 1) + 0.3 * Math.sin(2 * a));
  anim.push(`<g clip-path="url(#cs)"><path class="w2" fill="#a0902c" d="${w2}"/><path class="w1" fill="${C.cyan}" d="${w1}"/></g>`);
  anim.defs += `<clipPath id="cs"><rect x="${SC.x}" y="${SC.y}" width="${SC.w}" height="${SC.h + 1}"/></clipPath>`;
  anim.css += `.w1{animation:w1 2s steps(62) infinite}.w2{animation:w2 3s steps(62) infinite}@keyframes w1{to{transform:translateX(-62px)}}@keyframes w2{to{transform:translateX(-62px)}}`;
}

// ================================================================== LIBRARY
windowFrame(LIB, 'LIBRARY', { buttons: 1 });
{
  const { x: X, y: Y } = LIB;
  P.inset(X + 5, Y + 17, 130, 81);
  const chips = new Pix(W, H);
  const ICONS = [
    ['.....#.....', '.....#.....', '....###....', '....###....', '.....#.....', '....###....', '....###....', '...#####...', '...#.#.#...', '..#######..', '.#########.'],
    ['...#####...', '..#######..', '.#########.', '.###...###.', '.##.....##.', '.##.....##.', '.##.....##.', '.###...###.', '.#########.', '..#######..', '...#####...'],
    ['........##.', '........##.', '........##.', '..#..#..##.', '.##.##.###.', '##########.', '##########.', '#.##.##.##.', '#.##.##.##.', '##########.', '##########.'],
  ];
  let hl = '';
  TABS.forEach((t, i) => {
    const ry = Y + 19 + i * 26;
    hl += `<rect class="lb" x="${X + 6}" y="${ry - 1}" width="128" height="26" fill="${t.bg}"${i === 0 ? '' : ' opacity="0"'} style="animation-delay:${i * 4}s"/>`;
    chips.raised(X + 9, ry + 3, 17, 17, t.col, '#ffffff', '#05050a');
    chips.sprite(ICONS[i], X + 12, ry + 6, { '#': '#0b0b18' });
    if (i) for (let k = 0; k < 32; k++) P.px(X + 7 + k * 4, ry - 1, '#26264a');
  });
  anim.push(hl + chips.paths());
  anim.css += `.lb{animation:lb 12s step-end infinite}@keyframes lb{0%{opacity:1}33.333%{opacity:0}100%{opacity:0}}`;
  // text goes above the highlight, so it is emitted with the animated layer
  let t = '';
  TABS.forEach((tab, i) => {
    const ry = Y + 19 + i * 26;
    t += `<g fill="${tab.col}">${line(F6B, tab.name, X + 31, ry + 2)}</g><g fill="#c9cde0">${line(T5, tab.a, X + 31, ry + 11)}${line(T5, tab.b, X + 31, ry + 18)}</g>`;
    if (textW(T5, tab.a) > 101 || textW(T5, tab.b) > 101) throw new Error(`library line too wide: ${tab.name}`);
  });
  anim.push(t);
  say(T5, 'EVERYTHING LINKS: CLICK A PART,', X + 70, Y + 101, C.lab, 'c');
  say(T5, 'GET ITS RECIPE', X + 70, Y + 107, C.lab, 'c');
}

// ================================================================= PLAYLIST
windowFrame(PL, 'FUSEBOX PLAYLIST');
{
  const { x: X, y: Y } = PL;
  const LX = X + 7;
  const LY = Y + 16;
  const LW = 392;
  const RH = 8;
  P.inset(LX, LY, LW, TRACKS.length * RH + 5);
  // scrollbar
  P.inset(X + 401, LY, 9, TRACKS.length * RH + 5, '#0a0a14');
  P.raised(X + 402, LY + 1, 7, 22, C.sil, C.silHi, C.silLo);
  for (const gy of [9, 11, 13]) P.rect(X + 404, LY + gy, 3, 1, C.silLo);
  // rows
  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  let rows = '';
  TRACKS.forEach((t, i) => {
    const y = LY + 3 + i * RH + 1;
    const label = `${i + 1}. ${t.row}`;
    const d = fmt(t.len);
    if (textW(F6, label) > LW - 40) throw new Error(`playlist row ${i + 1} too wide: ${textW(F6, label)}`);
    rows += line(F6, label, LX + 4, y - LY) + line(F6, d, LW - 4 - textW(F6, d), y - LY);
  });
  anim.defs += `<g id="pl">${rows}</g><clipPath id="ch"><rect x="${LX + 1}" y="${LY + 3}" width="${LW - 2}" height="${RH}"/></clipPath>`;
  const kf = (sign) => TRACKS.map((t, i) => `${pct(STARTS[i])}{transform:translateY(${sign * i * RH}px)}`).join('') + `100%{transform:translateY(${sign * (TRACKS.length - 1) * RH}px)}`;
  anim.push(`<g class="hl"><rect x="${LX + 1}" y="${LY + 3}" width="${LW - 2}" height="${RH}" fill="${C.sel}"/></g>`
    + `<use href="#pl" x="${LX}" y="${LY}" fill="${C.grn}"/>`
    + `<g class="hl"><g clip-path="url(#ch)"><g class="hi"><use href="#pl" x="${LX}" y="${LY}" fill="#fff"/></g></g></g>`);
  anim.css += `.hl{animation:hl ${LOOP}s step-end infinite}.hi{animation:hi ${LOOP}s step-end infinite}@keyframes hl{${kf(1)}}@keyframes hi{${kf(-1)}}`;
  // bottom row of small buttons and the mini readout
  const BY = Y + 71;
  let bx = X + 7;
  for (const lab of ['+ITEM', '-ITEM', 'SEL ALL', 'ITEM INF']) {
    const w = textW(T5, lab) + 8;
    button(bx, BY, w, 9, lab);
    bx += w + 2;
  }
  say(T5, `${TRACKS.length} TRACKS ON REPEAT. THE DURATIONS ARE REAL.`, bx + 8, BY + 2, C.labDim);
  button(X + 371, BY, 39, 9, 'LOAD LIST');
  P.inset(X + 343, BY, 25, 9);
  say(T5, fmt(LOOP), X + 355, BY + 2, C.grn, 'c');
}

// ------------------------------------------------------------------ compose
const glyphDefs = FONTS.map((f) => [...f.used].map((ch) => `<path id="${f.g[ch].id}" d="${bitmapPath(f.g[ch].rows)}"/>`).join('')).join('');
const texts = [...textLayers.entries()].map(([fill, ls]) => `<g fill="${fill}">${ls.join('')}</g>`).join('');

const css = `${anim.css}`
  + `.gp{animation:gp 2s ease-in-out infinite alternate}@keyframes gp{from{opacity:.5}to{opacity:.95}}`
  + `@media (prefers-reduced-motion:reduce){*{animation:none!important}.an{display:none}.st{display:inline}}`;

const alt = 'ULTRA-SATISFACTORY shown as FUSEBOX, an invented late-90s desktop media player: player, equaliser, playlist, visualiser and library windows snapped together';

let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W * 2}" height="${H * 2}">`
  + `<title>${alt}</title>`
  + `<style>${css}</style>`
  + `<defs>${glyphDefs}${digitDefs}${anim.defs}`
  + `<linearGradient id="sh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".07"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></linearGradient>`
  + `<filter id="gl" x="-10%" y="-40%" width="120%" height="180%"><feGaussianBlur stdDeviation="2.2"/></filter></defs>`
  + `<rect width="${W}" height="${H}" fill="${C.base}"/>`
  + [MAIN, EQ, VIS, LIB, PL].map((r) => `<rect x="${r.x}" y="${r.y + 14}" width="${r.w}" height="${r.h - 14}" fill="url(#sh)"/>`).join('')
  + P.paths(C.base)
  + texts
  + `<g class="gp" filter="url(#gl)"><g fill="${C.cyan}">${logoGlowC}</g><g fill="#cfd6ea" opacity=".6">${logoGlowW}</g></g>`
  + logo.paths()
  + anim.join('')
  + `</svg>\n`;

// give the most-used glyphs the shortest ids
{
  const count = new Map();
  for (const m of svg.matchAll(/@[a-c][0-9a-z]+@/g)) count.set(m[0], (count.get(m[0]) || 0) + 1);
  const abc = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const ids = new Map([...count.entries()].sort((p, q) => q[1] - p[1]).map(([k], n) => [k, n < abc.length ? abc[n] : `q${(n - abc.length).toString(36)}`]));
  svg = svg.replace(/@[a-c][0-9a-z]+@/g, (m) => ids.get(m));
}
console.log(`  static ${P.paths(C.base).length}, texts ${texts.length}, anim ${anim.join('').length}, css ${css.length}, defs ${(glyphDefs + digitDefs + anim.defs).length}`);
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, svg);
console.log(`wrote ${OUT} (${(svg.length / 1024).toFixed(1)} KB), ${W}x${H}, loop ${LOOP}s`);
TRACKS.forEach((t, i) => console.log(`  track ${i + 1}: ${t.len}s, ticker unit ${t.unitW}px, shows ${(t.len - TICK.hold) * TICK.speed + TICK.w}px`));
