#!/usr/bin/env node
// Castaway README header: "P2P Transfer Window" (104-p2p-transfer-window_opus_5.5),
// style catalogue entry xfer-07 (the file-sharing client window of about 1999-2008).
//
//   node examples/castaway/src/104-p2p-transfer-window_opus_5.5.mjs
//
// Regenerates, next to this file in ../assets/:
//   104-p2p-transfer-window_opus_5.5.svg   the banner (830 x 565, drawn 1:1 for an 830 px README column)
// Plain Node, no dependencies, deterministic (one seeded PRNG, no clock). The .md beside the
// assets is hand-written, not generated.
//
// The style, as the catalogue lists it: grey Windows chrome, a big-icon toolbar of section
// buttons, the window split into downloads above and uploads below, white sortable grids with
// right-aligned numbers, a per-file chunk bar (black = have, red = missing in every known source,
// blue shades = availability, yellow = being fetched, a thin green line for total progress,
// solid green once complete), the older one-bar-per-file look in the uploads (yellow bars in a
// sunken box with the percentage centred), a "clear finished" footer and a status bar of counts.
//
// What is invented here, so nothing real is reproduced: the client ("Longshore", its wave-arrow
// mark and every toolbar icon), the layout details, the fonts and the island. Every row is one of
// Castaway's own activities from activities.toml or one of its own synthesized sounds; the only
// address is the project's own local preview server. No real client, server, tracker or user.
//
// How it is built
//   UI lettering: a proportional pixel sans, cap height 8, x-height 6, in the spirit of the small
//   unsmoothed Tahoma of the period (glyph table adapted from 62-instant-messenger's, with more
//   symbols). Rows of '#' become merged rects, one <path> per glyph, reused through <use>.
//   The name: a heavy geometric sans built from overlapping quads and elliptical ring segments,
//   filled once (nonzero winding unions them). No <text> anywhere.
//   Pixel art (icons, the preview of the island): a tiny raster class; each colour becomes one
//   <path> of merged runs.
//   Motion: one 60-second clock, the length of the theme loop (20 bars of 3 s at 80 BPM). Every
//   status flip lands on a bar line, as the schedule's gags do. All CSS keyframes, periodic, so
//   frame 0 equals frame 60 s. Plain attributes hold the frame at T_STATIC, which is what
//   prefers-reduced-motion shows (animation: none).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const ASSETS = path.join(here, '..', 'assets');
const SLUG = '104-p2p-transfer-window_opus_5.5';

// ------------------------------------------------------------------------------ helpers
const r1 = (n) => { const s = (Math.round(n * 10) / 10).toString(); return s === '-0' ? '0' : s; };
const r2 = (n) => { const s = (Math.round(n * 100) / 100).toString(); return s === '-0' ? '0' : s; };
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
const rng = mulberry32(0x19928765);

const W = 830;
let H = 565;
const T = 60; // one loop: the theme's 20 bars of 3 s
const BAR = 3;
const BEAT = 0.75; // 80 BPM
const T_STATIC = 15; // the frame shown with prefers-reduced-motion

const C = {
  face: '#d4d0c8', hi: '#ffffff', shadow: '#808080', dark: '#404040', black: '#000000',
  title0: '#0a246a', title1: '#a6caf0',
  ink: '#000000', grey: '#575757', navy: '#0a246a', link: '#0b3fa8',
  list: '#ffffff', stripe: '#f2f5f9', header: '#d4d0c8', gridline: '#e3e3e3',
  // chunk bar
  have: '#000000', missing: '#e0201b', avail: ['#a8b6ff', '#6f86f5', '#3c56de', '#1d31ad'],
  getting: '#ffd200', progress: '#16c516', complete: '#33b833',
  upBar: '#f5c400', upBarHi: '#ffe066', downBar: '#3d6fd1',
  ok: '#0b6e0b', warn: '#8a4f00', bad: '#b3261e', muted: '#5c5c5c', queued: '#0a246a',
};

// ------------------------------------------------------------------------------ pixel UI font
// Proportional pixel sans. Cap height 8, x-height 6, descenders 2 rows below.
// Rows top to bottom, '#' = pixel, glyph width = row length.
const UI = {
  A: '..#..|.#.#.|.#.#.|.#.#.|#...#|#####|#...#|#...#',
  B: '####.|#...#|#...#|####.|#...#|#...#|#...#|####.',
  C: '.###.|#...#|#....|#....|#....|#....|#...#|.###.',
  D: '####.|#...#|#...#|#...#|#...#|#...#|#...#|####.',
  E: '####|#...|#...|####|#...|#...|#...|####',
  F: '####|#...|#...|###.|#...|#...|#...|#...',
  G: '.####.|#.....|#.....|#..###|#....#|#....#|#....#|.####.',
  H: '#...#|#...#|#...#|#####|#...#|#...#|#...#|#...#',
  I: '###|.#.|.#.|.#.|.#.|.#.|.#.|###',
  J: '.##|..#|..#|..#|..#|..#|..#|##.',
  K: '#...#|#..#.|#.#..|##...|##...|#.#..|#..#.|#...#',
  L: '#...|#...|#...|#...|#...|#...|#...|####',
  M: '##...##|##...##|#.#.#.#|#.#.#.#|#..#..#|#..#..#|#.....#|#.....#',
  N: '##...#|##...#|#.#..#|#.#..#|#..#.#|#..#.#|#...##|#...##',
  O: '.####.|#....#|#....#|#....#|#....#|#....#|#....#|.####.',
  P: '####.|#...#|#...#|#...#|####.|#....|#....|#....',
  Q: '.####.|#....#|#....#|#....#|#....#|#....#|#....#|.####.|...#..|....##',
  R: '####.|#...#|#...#|#...#|####.|#..#.|#...#|#...#',
  S: '.####|#....|#....|.###.|....#|....#|....#|####.',
  T: '#####|..#..|..#..|..#..|..#..|..#..|..#..|..#..',
  U: '#...#|#...#|#...#|#...#|#...#|#...#|#...#|.###.',
  V: '#...#|#...#|#...#|.#.#.|.#.#.|.#.#.|..#..|..#..',
  W: '#..#..#|#..#..#|#..#..#|#.#.#.#|#.#.#.#|#.#.#.#|.#...#.|.#...#.',
  X: '#...#|#...#|.#.#.|..#..|..#..|.#.#.|#...#|#...#',
  Y: '#...#|#...#|.#.#.|.#.#.|..#..|..#..|..#..|..#..',
  Z: '#####|....#|...#.|..#..|..#..|.#...|#....|#####',
  a: '....|....|.##.|...#|.###|#..#|#..#|.###',
  b: '#...|#...|###.|#..#|#..#|#..#|#..#|###.',
  c: '....|....|.###|#...|#...|#...|#...|.###',
  d: '...#|...#|.###|#..#|#..#|#..#|#..#|.###',
  e: '....|....|.##.|#..#|####|#...|#...|.###',
  f: '.##|#..|###|#..|#..|#..|#..|#..',
  g: '....|....|.###|#..#|#..#|#..#|#..#|.###|...#|.##.',
  h: '#...|#...|###.|#..#|#..#|#..#|#..#|#..#',
  i: '#|.|#|#|#|#|#|#',
  j: '.#|..|.#|.#|.#|.#|.#|.#|.#|#.',
  k: '#...|#...|#..#|#.#.|##..|##..|#.#.|#..#',
  l: '#|#|#|#|#|#|#|#',
  m: '.......|.......|###.##.|#..#..#|#..#..#|#..#..#|#..#..#|#..#..#',
  n: '....|....|###.|#..#|#..#|#..#|#..#|#..#',
  o: '....|....|.##.|#..#|#..#|#..#|#..#|.##.',
  p: '....|....|###.|#..#|#..#|#..#|#..#|###.|#...|#...',
  q: '....|....|.###|#..#|#..#|#..#|#..#|.###|...#|...#',
  r: '...|...|#.#|##.|#..|#..|#..|#..',
  s: '....|....|.###|#...|.##.|...#|...#|###.',
  t: '...|.#.|###|.#.|.#.|.#.|.#.|..#',
  u: '....|....|#..#|#..#|#..#|#..#|#..#|.###',
  v: '.....|.....|#...#|#...#|.#.#.|.#.#.|..#..|..#..',
  w: '.......|.......|#..#..#|#..#..#|#.#.#.#|#.#.#.#|.#...#.|.#...#.',
  x: '.....|.....|#...#|.#.#.|..#..|..#..|.#.#.|#...#',
  y: '.....|.....|#...#|#...#|.#.#.|.#.#.|..#..|..#..|.#...|#....',
  z: '....|....|####|...#|..#.|.#..|#...|####',
  0: '.###.|#...#|#...#|#...#|#...#|#...#|#...#|.###.',
  1: '..#..|.##..|..#..|..#..|..#..|..#..|..#..|.###.',
  2: '.###.|#...#|....#|...#.|..#..|.#...|#....|#####',
  3: '.###.|#...#|....#|..##.|....#|....#|#...#|.###.',
  4: '...#.|..##.|.#.#.|#..#.|#####|...#.|...#.|...#.',
  5: '#####|#....|#....|####.|....#|....#|#...#|.###.',
  6: '..##.|.#...|#....|####.|#...#|#...#|#...#|.###.',
  7: '#####|....#|...#.|...#.|..#..|..#..|.#...|.#...',
  8: '.###.|#...#|#...#|.###.|#...#|#...#|#...#|.###.',
  9: '.###.|#...#|#...#|#...#|.####|....#|...#.|.##..',
  '.': '.|.|.|.|.|.|.|#',
  ',': '..|..|..|..|..|..|..|.#|#.',
  ':': '.|.|.|#|.|.|.|#',
  ';': '..|..|..|.#|..|..|..|.#|#.',
  '!': '#|#|#|#|#|#|.|#',
  '?': '###.|...#|...#|..#.|.#..|.#..|....|.#..',
  '-': '...|...|...|...|###|...|...|...',
  '(': '..#|.#.|#..|#..|#..|#..|#..|.#.|..#',
  ')': '#..|.#.|..#|..#|..#|..#|..#|.#.|#..',
  '[': '##|#.|#.|#.|#.|#.|#.|#.|##',
  ']': '##|.#|.#|.#|.#|.#|.#|.#|##',
  '/': '...#|...#|..#.|..#.|.#..|.#..|#...|#...',
  "'": '#|#|.|.|.|.|.|.',
  '"': '#.#|#.#|...|...|...|...|...|...',
  '+': '.....|.....|..#..|..#..|#####|..#..|..#..|.....',
  '=': '....|....|....|####|....|####|....|....',
  '<': '...|...|..#|.#.|#..|.#.|..#|...',
  '>': '...|...|#..|.#.|..#|.#.|#..|...',
  '_': '....|....|....|....|....|....|....|....|####',
  '%': '.#...#|#.#.#.|.#..#.|...#..|..#...|.#..#.|.#.#.#|#...#.',
  '#': '.....|.#.#.|#####|.#.#.|.#.#.|#####|.#.#.|.....',
  '&': '.##..|#..#.|#..#.|.##..|#.#.#|#..#.|#..##|.##.#',
  '·': '.|.|.|.|#|.|.|.',
  '♪': '..#..|..##.|..#.#|..#..|..#..|.##..|###..|.#...',
  '→': '......|......|...#..|....#.|######|....#.|...#..|......',
  '×': '.....|.....|#...#|.#.#.|..#..|.#.#.|#...#|.....',
  '…': '.....|.....|.....|.....|.....|.....|.....|#.#.#',
  '∞': '.......|.......|.##.##.|#..#..#|#..#..#|.##.##.|.......|.......',
  '▾': '.....|.....|.....|#####|.###.|..#..|.....|.....',
  '▴': '.....|.....|..#..|.###.|#####|.....|.....|.....',
};
// Bold = the glyph OR-ed with itself one pixel to the right; these would clog, so are drawn.
const UI_BOLD = {
  M: '##.....##|###...###|##.#.#.##|##.#.#.##|##..#..##|##..#..##|##.....##|##.....##',
  W: '##.##.##|##.##.##|##.##.##|##.##.##|##.##.##|##.##.##|.##..##.|.##..##.',
  m: '........|........|#######.|##.##.##|##.##.##|##.##.##|##.##.##|##.##.##',
  w: '........|........|##.##.##|##.##.##|##.##.##|##.##.##|.##..##.|.##..##.',
  '%': '.##...##|##.#.##.|.##..##.|....##..|...##...|.##..##.|.##.##.#|##...##.',
};

// Rows of '#' into one path of merged rectangles (runs merged vertically too).
function bitmapPath(rows, ox = 0, oy = 0) {
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
  return rects.map((r) => `M${ox + r.x} ${oy + r.y}h${r.w}v${r.h}h${-r.w}z`).join('');
}

function makeFont(prefix, { bold = false, space = 3 } = {}) {
  const used = new Map();
  const rowsOf = (ch) => {
    if (bold && UI_BOLD[ch]) return UI_BOLD[ch].split('|');
    const src = UI[ch];
    if (src === undefined) throw new Error(`pixel font: no glyph for ${JSON.stringify(ch)}`);
    let rows = src.split('|');
    const w = rows[0].length;
    rows.forEach((r, i) => { if (r.length !== w) throw new Error(`glyph ${ch} row ${i} is ${r.length} wide, expected ${w}`); });
    if (bold) {
      rows = rows.map((r) => {
        const a = `${r}.`, b = `.${r}`;
        return [...a].map((c, i) => (c === '#' || b[i] === '#' ? '#' : '.')).join('');
      });
    }
    return rows;
  };
  const font = {
    adv: (ch) => (ch === ' ' ? space : rowsOf(ch)[0].length + 1),
    id(ch) {
      const id = prefix + ch.codePointAt(0).toString(36);
      if (!used.has(id)) used.set(id, bitmapPath(rowsOf(ch)));
      return id;
    },
    width: (str) => [...str].reduce((w, ch) => w + font.adv(ch), 0) - 1,
    defs: () => [...used].map(([id, d]) => `<path id="${id}" d="${d}"/>`).join(''),
  };
  return font;
}
const ui = makeFont('u');
const uib = makeFont('b', { bold: true, space: 4 });

// A run of pixel glyphs; (x, y) is the top of the cap height. align: start | end | middle.
function px(font, str, x, y, fill, { maxW = Infinity, align = 'start', attrs = '', scale = 1 } = {}) {
  const w = font.width(str) * scale;
  if (w > maxW) throw new Error(`pixel text "${str}" is ${w} px wide, room for ${maxW}`);
  const x0 = align === 'end' ? x - w : align === 'middle' ? Math.round(x - w / 2) : x;
  const tf = scale === 1 ? `translate(${r1(x0)} ${r1(y)})` : `translate(${r1(x0)} ${r1(y)}) scale(${scale})`;
  let s = `<g transform="${tf}"${fill && fill !== '#000000' ? ` fill="${fill}"` : ''}${attrs ? ` ${attrs}` : ''}>`;
  let cx = 0;
  for (const ch of str) {
    if (ch !== ' ') s += `<use href="#${font.id(ch)}"${cx ? ` x="${cx}"` : ''}/>`;
    cx += font.adv(ch);
  }
  return `${s}</g>`;
}

// ------------------------------------------------------------------------------ the name
// A heavy geometric sans, cap height 40 units. Each letter is a list of closed polygons, all wound
// clockwise, so one nonzero fill unions the overlaps (legs, bars and bowls) into clean letters.
function quad(xt1, xt2, yt, xb1, xb2, yb) { return [[xt1, yt], [xt2, yt], [xb2, yb], [xb1, yb]]; }
function ringSeg(cx, cy, ax, ay, bx, by, a0, a1, n = 28) {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180;
    pts.push([cx + ax * Math.cos(a), cy + ay * Math.sin(a)]);
  }
  for (let i = n; i >= 0; i--) {
    const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180;
    pts.push([cx + bx * Math.cos(a), cy + by * Math.sin(a)]);
  }
  return pts;
}
const NAME_GLYPHS = {
  C: { adv: 31, polys: [ringSeg(15.5, 20, 15.5, 20, 6.4, 11.6, 42, 318, 40)] },
  A: { adv: 34, polys: [quad(12, 21.2, 0, 0, 9.6, 40), quad(12.8, 22, 0, 24.4, 34, 40), quad(8, 26, 24.2, 8, 26, 31.6)] },
  S: {
    adv: 29,
    polys: [
      ringSeg(14.5, 11.3, 14, 11.3, 5.8, 3.4, 62, 332, 34),
      ringSeg(14.5, 28.7, 14.5, 11.3, 6.3, 3.4, -118, 152, 34),
    ],
  },
  T: { adv: 30, polys: [quad(0, 30, 0, 0, 30, 8.4), quad(10.4, 19.6, 0, 10.4, 19.6, 40)] },
  W: {
    adv: 46,
    polys: [
      quad(0, 9.2, 0, 8.6, 18, 40), quad(14.2, 23, 9, 8.6, 18, 40),
      quad(23, 31.8, 9, 28, 37.4, 40), quad(36.8, 46, 0, 28, 37.4, 40),
      quad(19.5, 26.5, 0, 14.2, 31.8, 9.01),
    ],
  },
  Y: { adv: 34, polys: [quad(0, 10, 0, 12.2, 21.8, 23), quad(24, 34, 0, 12.2, 21.8, 23), quad(12.2, 21.8, 20, 12.2, 21.8, 40)] },
};
const NAME_KERN = { AW: -1.5, WA: -1.5, AY: -1.5, TA: -1, AS: 0.5 };
function nameWidth(str, gap) {
  let w = 0;
  [...str].forEach((ch, i) => { w += NAME_GLYPHS[ch].adv + (i ? gap + (NAME_KERN[str[i - 1] + ch] || 0) : 0); });
  return w;
}
function namePath(str, x, y, s, gap = 2.6) {
  let d = '';
  let cx = 0;
  [...str].forEach((ch, i) => {
    if (i) cx += gap + (NAME_KERN[str[i - 1] + ch] || 0);
    for (const poly of NAME_GLYPHS[ch].polys) {
      d += poly.map(([px0, py0], j) => `${j ? 'L' : 'M'}${r2(x + (cx + px0) * s)} ${r2(y + py0 * s)}`).join('') + 'Z';
    }
    cx += NAME_GLYPHS[ch].adv;
  });
  return d;
}

// ------------------------------------------------------------------------------ raster pixel art
class Raster {
  constructor(w, h) { this.w = w; this.h = h; this.p = new Array(w * h).fill(null); }
  set(x, y, c) { x = Math.floor(x); y = Math.floor(y); if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.p[y * this.w + x] = c; }
  get(x, y) { return x >= 0 && y >= 0 && x < this.w && y < this.h ? this.p[y * this.w + x] : null; }
  rect(x, y, w, h, c) { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) this.set(i, j, c); return this; }
  ellipse(cx, cy, rx, ry, c, pred = null) {
    for (let y = Math.floor(cy - ry - 1); y <= cy + ry + 1; y++) {
      for (let x = Math.floor(cx - rx - 1); x <= cx + rx + 1; x++) {
        const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry;
        if (dx * dx + dy * dy <= 1 && (!pred || pred(x, y))) this.set(x, y, c);
      }
    }
    return this;
  }
  line(x0, y0, x1, y1, c) {
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) * 2 + 1;
    for (let i = 0; i <= n; i++) this.set(Math.round(x0 + ((x1 - x0) * i) / n - 0.0001), Math.round(y0 + ((y1 - y0) * i) / n - 0.0001), c);
    return this;
  }
  stamp(rows, pal, ox = 0, oy = 0) {
    const w = rows[0].length;
    rows.forEach((r, y) => {
      if (r.length !== w) throw new Error(`sprite row ${y} is ${r.length} wide, expected ${w}: ${r}`);
      [...r].forEach((ch, x) => { if (ch !== '.') { if (!pal[ch]) throw new Error(`no colour for ${ch}`); this.set(ox + x, oy + y, pal[ch]); } });
    });
    return this;
  }
  // Paint an outline colour on every empty cell that touches a filled one (4-neighbour).
  outline(c) {
    const add = [];
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) {
      if (this.get(x, y)) continue;
      if (this.get(x - 1, y) || this.get(x + 1, y) || this.get(x, y - 1) || this.get(x, y + 1)) add.push([x, y]);
    }
    add.forEach(([x, y]) => this.set(x, y, c));
    return this;
  }
  // One <path> per colour, runs merged horizontally then vertically.
  svg(scale = 1, ox = 0, oy = 0) {
    const byColour = new Map();
    let open = new Map();
    for (let y = 0; y < this.h; y++) {
      const next = new Map();
      for (let x = 0; x < this.w;) {
        const c = this.get(x, y);
        if (!c) { x++; continue; }
        let x2 = x;
        while (x2 < this.w && this.get(x2, y) === c) x2++;
        const key = `${c},${x},${x2 - x}`;
        let rc = open.get(key);
        if (!rc) {
          rc = { x, y, w: x2 - x, h: 0 };
          if (!byColour.has(c)) byColour.set(c, []);
          byColour.get(c).push(rc);
        }
        rc.h++;
        next.set(key, rc);
        x = x2;
      }
      open = next;
    }
    let out = '';
    for (const [c, rects] of byColour) {
      let d = '';
      let cx = null, cy = null;
      for (const r of rects) {
        const x = ox + r.x * scale, y = oy + r.y * scale;
        d += cx === null ? `M${r1(x)} ${r1(y)}` : `m${r1(x - cx)} ${r1(y - cy)}`;
        d += `h${r1(r.w * scale)}v${r1(r.h * scale)}h${r1(-r.w * scale)}z`;
        cx = x; cy = y;
      }
      out += `<path fill="${c}" d="${d}"/>`;
    }
    return out;
  }
}

// ------------------------------------------------------------------------------ timeline engine
// Everything runs on one periodic clock of T seconds. A step timeline is [[t, value], ...]
// with t in [0, T); the value before the first entry is the last entry's (it wraps round).
const css = [];
let animN = 0;
const pc = (t, P = T) => `${Math.round((t / P) * 100000) / 1000}%`;
function stepAt(tl, t) {
  const P = tl.period || T;
  t = ((t % P) + P) % P;
  let v = tl[tl.length - 1][1];
  for (const [ti, vi] of tl) if (ti <= t + 1e-9) v = vi;
  return v;
}
// Discrete property: holds each value until the next change (steps(1,end) between keyframes).
const animCache = new Map();
function dedupe(tl) {
  const out = [];
  out.period = tl.period;
  for (const e of [...tl].sort((a, b) => a[0] - b[0])) {
    if (out.length && Math.abs(out[out.length - 1][0] - e[0]) < 1e-9) out[out.length - 1] = e;
    else if (!out.length || out[out.length - 1][1] !== e[1]) out.push(e);
  }
  return out;
}
function stepAnim(prop, tl0, fmt = (v) => v) {
  const tl = dedupe(tl0);
  const P = tl.period || T;
  if (Math.abs(T / P - Math.round(T / P)) > 1e-9) throw new Error(`period ${P} does not divide ${T}`);
  const v0 = stepAt(tl, 0);
  let frames = `0%{${prop}:${fmt(v0)}}`;
  for (const [t, v] of tl) if (t > 1e-9) frames += `${pc(t, P)}{${prop}:${fmt(v)}}`;
  frames += `100%{${prop}:${fmt(v0)}}`;
  const key = `s${P}|${frames}`;
  if (animCache.has(key)) return animCache.get(key);
  const name = `k${(animN++).toString(36)}`;
  animCache.set(key, name);
  css.push(`@keyframes ${name}{${frames}}.${name}{animation:${name} ${r2(P)}s steps(1,end) infinite}`);
  return name;
}
// Continuous property: linear between keys [[t, value, steps?]], keys must include t = 0 and t = T.
function linAnim(prop, keys, fmt = (v) => v) {
  let frames = '';
  for (const [t, v, n] of keys) frames += `${pc(t)}{${prop}:${fmt(v)}${n ? `;animation-timing-function:steps(${n},end)` : ''}}`;
  const key = `l|${frames}`;
  if (animCache.has(key)) return animCache.get(key);
  const name = `k${(animN++).toString(36)}`;
  animCache.set(key, name);
  css.push(`@keyframes ${name}{${frames}}.${name}{animation:${name} ${T}s linear infinite}`);
  return name;
}
function linAt(keys, t) {
  for (let i = 0; i < keys.length - 1; i++) {
    const [ta, va] = keys[i], [tb, vb] = keys[i + 1];
    if (t >= ta && t <= tb) {
      if (Array.isArray(va)) return va.map((a, j) => a + ((vb[j] - a) * (t - ta)) / Math.max(1e-9, tb - ta));
      return va + ((vb - va) * (t - ta)) / Math.max(1e-9, tb - ta);
    }
  }
  return keys[keys.length - 1][1];
}
// A text slot whose string changes over time: one <g> per distinct string, shown by opacity.
function textSlot(font, x, y, fill, tl, opts = {}) {
  const values = [...new Set(tl.map(([, v]) => v))];
  if (values.length === 1) return values[0] ? px(font, values[0], x, y, fill, opts) : '';
  let out = '';
  for (const v of values) {
    if (!v) continue;
    const on = tl.map(([t, s]) => [t, s === v ? 1 : 0]);
    on.period = tl.period;
    const cls = stepAnim('opacity', on);
    const base = stepAt(tl, T_STATIC) === v ? 1 : 0;
    out += px(font, v, x, y, fill, { ...opts, attrs: `class="${cls}" opacity="${base}"` });
  }
  return out;
}
// Repeating flicker every `every` seconds through `vals`. Without a window it is periodic (its
// own short clock, which must divide T); with [t0, t1) it is spelled out on the main clock.
function flicker(vals, every, t0 = null, t1 = T) {
  if (t0 === null) { const tl = vals.map((v, i) => [i * every, v]); tl.period = vals.length * every; return tl; }
  const tl = [];
  let i = 0;
  for (let t = t0; t < t1 - 1e-9; t += every) tl.push([t, vals[i++ % vals.length]]);
  return tl;
}
// Merge a base timeline with override windows [[from, to, value-or-timeline]].
function compose(...windows) {
  const tl = [];
  for (const [from, to, v] of windows) {
    if (Array.isArray(v)) v.forEach(([t, x]) => { if (t >= from - 1e-9 && t < to - 1e-9) tl.push([t, x]); });
    else tl.push([from, v]);
  }
  tl.sort((a, b) => a[0] - b[0]);
  return tl;
}

// ------------------------------------------------------------------------------ window chrome
function rect(x, y, w, h, fill, extra = '') { return `<rect x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h)}" fill="${fill}"${extra}/>`; }
function hline(x, y, w, c) { return `M${x} ${y}h${w}v1h${-w}z`; }
function vline(x, y, h) { return `M${x} ${y}h1v${h}h-1z`; }
function edges(x, y, w, h, tl, br) {
  return `<path fill="${tl}" d="${hline(x, y, w - 1)}${vline(x, y, h - 1)}"/><path fill="${br}" d="${hline(x, y + h - 1, w)}${vline(x + w - 1, y, h)}"/>`;
}
function raised(x, y, w, h, fill = C.face) {
  return rect(x, y, w, h, fill) + edges(x, y, w, h, C.hi, C.dark) + edges(x + 1, y + 1, w - 2, h - 2, fill, C.shadow);
}
function sunken(x, y, w, h, fill = C.list) {
  return rect(x, y, w, h, fill) + edges(x, y, w, h, C.shadow, C.hi) + edges(x + 1, y + 1, w - 2, h - 2, C.dark, C.face);
}
function thinSunken(x, y, w, h, fill) {
  return (fill ? rect(x, y, w, h, fill) : '') + edges(x, y, w, h, C.shadow, C.hi);
}
function etchedH(x, y, w) { return `<path fill="${C.shadow}" d="${hline(x, y, w)}"/><path fill="${C.hi}" d="${hline(x, y + 1, w)}"/>`; }
function etchedV(x, y, h) { return `<path fill="${C.shadow}" d="${vline(x, y, h)}"/><path fill="${C.hi}" d="${vline(x + 1, y, h)}"/>`; }
function groupBox(x, y, w, h, label) {
  const lw = uib.width(label);
  return `<path fill="${C.shadow}" d="${hline(x, y, w - 1)}${vline(x, y, h - 1)}${hline(x, y + h - 2, w - 1)}${vline(x + w - 2, y, h - 1)}"/>`
    + `<path fill="${C.hi}" d="${hline(x + 1, y + 1, w - 3)}${vline(x + 1, y + 1, h - 3)}${hline(x, y + h - 1, w)}${vline(x + w - 1, y, h)}"/>`
    + rect(x + 6, y - 4, lw + 6, 10, C.face) + px(uib, label, x + 9, y - 4, C.ink);
}

// ------------------------------------------------------------------------------ icons
const IP = {
  k: '#1c1c1c', K: '#404040', g: '#808080', G: '#c0c0c0', w: '#ffffff', e: '#9a9a9a',
  y: '#ffd84a', Y: '#d9a400', o: '#f08a24', O: '#b85c00',
  L: '#28c228', N: '#1b7a2a', n: '#3f9a4a', l: '#7cc860', t: '#b97c55', T: '#86532f',
  s: '#f1d79c', S: '#d4b06a', c: '#7fd0ea', C: '#2a8fc0', b: '#2f62d0', B: '#0a246a',
  m: '#b0763e', M: '#6e4522', r: '#d23a2a', p: '#e2735c', q: '#a8e0b0', Q: '#4f9a68', v: '#7ab0de',
};
function iconRaster(name) {
  const R = new Raster(16, 16);
  switch (name) {
    case 'connect':
      R.stamp([
        '..nnn.nn........',
        '.nlnlnnlnn......',
        'nn..nTnn.nn.....',
        'n...tT..n..n....',
        '....tT..........',
        '....tT..........',
        '...tT...........',
        '...tT...........',
        '...tT...........',
        '...tT...........',
        '..tT............',
        '..tT............',
        'sssssss.........',
        'cSSSSSSc........',
        '.cccccc.........',
      ], IP, 0, 1);
      R.rect(8, 11, 1, 3, IP.L).rect(10, 9, 1, 5, IP.g).rect(12, 7, 1, 7, IP.g).rect(14, 5, 1, 9, IP.g);
      break;
    case 'search':
      R.ellipse(6.5, 6.5, 5.6, 5.6, IP.k).ellipse(6.5, 6.5, 4.4, 4.4, IP.c);
      R.set(4, 4, IP.w); R.set(5, 4, IP.w); R.set(4, 5, IP.w); R.set(8, 9, IP.C); R.set(9, 8, IP.C);
      for (let i = 0; i < 5; i++) { R.rect(10 + i, 11 + i, 2, 1, IP.M); R.rect(11 + i, 11 + i, 1, 1, IP.m); }
      break;
    case 'transfers':
      R.rect(2, 1, 3, 7, IP.L);
      for (let i = 0; i < 4; i++) R.rect(i, 8 + i, 7 - 2 * i, 1, IP.L);
      R.rect(11, 7, 3, 7, IP.y);
      for (let i = 0; i < 4; i++) R.rect(9 + i, 6 - i, 7 - 2 * i, 1, IP.y);
      R.outline(IP.k);
      break;
    case 'shared':
      R.stamp([
        '.kkkkk..........',
        'kYyyyYk.........',
        'kYyyyyYkkkkkkkk.',
        'kYYYYYYYYYYYYYk.',
        'kYyyyyyyyyyyyyk.',
        'kYyyyyyyyyyyyyk.',
        'kYyyyyyyyyyyyyk.',
        'kYyyyyyyyyyyyyk.',
        'kYyyyyyyyyyyyyk.',
        'kYyyyyyyyyyyyyk.',
        'kYYYYYYYYYYYYYk.',
        'kkkkkkkkkkkkkkk.',
      ], IP, 0, 2);
      R.stamp(['.ww.', 'wppw', 'wppw', '.ww.'], IP, 6, 6);
      break;
    case 'bottles':
      R.stamp([
        '......mmmm......',
        '......mMMm......',
        '......kqqk......',
        '......kqQk......',
        '.....kqqqQk.....',
        '....kqqqqqQk....',
        '...kqwwwwwwQk...',
        '...kqwewewwQk...',
        '...kqwwwwwwQk...',
        '...kqweweewQk...',
        '...kqwwwwwwQk...',
        '...kqqqqqqqQk...',
        '...kQQQQQQQQk...',
        '....kkkkkkkk....',
      ], IP, 0, 1);
      break;
    case 'schedule':
      R.stamp([
        '..MMMMMMMMMMMM..',
        '...kwwwwwwwwk...',
        '...kSssssssSk...',
        '....kSssssSk....',
        '.....kSssSk.....',
        '......kSSk......',
        '.......kk.......',
        '.......Sk.......',
        '......kwSk......',
        '.....kwwwsk.....',
        '....kwwwssSk....',
        '...kwwssssSSk...',
        '...kSSSSSSSSk...',
        '..MMMMMMMMMMMM..',
      ], IP, 0, 1);
      break;
    case 'sound':
      R.stamp([
        '......k.........',
        '.....kk.....b...',
        '....kgk......b..',
        'kkkkGgk..b....b.',
        'kGGGGgk...b...b.',
        'kGGGGgk...b...b.',
        'kGGGGgk...b...b.',
        'kkkkGgk..b....b.',
        '....kgk......b..',
        '.....kk.....b...',
        '......k.........',
      ], IP, 0, 3);
      break;
    case 'options':
      for (let a = 0; a < 8; a++) {
        const ang = (a * Math.PI) / 4;
        R.ellipse(7.5 + Math.cos(ang) * 5.6, 7.5 + Math.sin(ang) * 5.6, 1.5, 1.5, IP.g);
      }
      R.ellipse(7.5, 7.5, 5.2, 5.2, IP.g).ellipse(7.5, 7.5, 4.0, 4.0, IP.G).ellipse(7.5, 7.5, 1.9, 1.9, null);
      R.outline(IP.K);
      break;
    case 'app':
      // the client's mark: a wave curling over to the right, and a download arrow landing on the shore
      R.stamp([
        '........BBBB....',
        '......BBbbbbB...',
        '.....BbbccccbB..',
        '....BbbcwwwwcbB.',
        '...BbbcwB...BwbB',
        '...BbcwB..yY.BbB',
        '..BbbcwB..yY..B.',
        '..Bbbcw...yY....',
        '.Bbbbcw.yyyyyY..',
        '.Bbbbcw..yyyY...',
        'Bbbbbcw...yY....',
        'Bbbbbccw........',
        'BBBBBBBBBBBBBBBB',
        'ssssssssssssssss',
        'SSSSSSSSSSSSSSSS',
      ], IP, 0, 1);
      break;
    default: throw new Error(`no icon ${name}`);
  }
  return R;
}
const iconCache = new Map();
function icon(name, x, y, scale = 2) {
  const key = `${name}@${scale}`;
  if (!iconCache.has(key)) iconCache.set(key, iconRaster(name).svg(scale));
  return `<g transform="translate(${x} ${y})">${iconCache.get(key)}</g>`;
}

// Small 12 x 12 row icons, one pixel per cell.
const SMALL = {
  drone: [
    '............',
    '.GGG....GGG.',
    '...K....K...',
    '..KKKKKKKK..',
    '...KkkkkK...',
    '.....KK.....',
    '.....e......',
    '....mmmm....',
    '....mMMm....',
    '....mmmm....',
    '............',
    '............',
  ],
  bottle: [
    '............',
    '........mm..',
    '.......kqk..',
    '......kqQk..',
    '.....kqqQk..',
    '....kqwwQk..',
    '...kqwewk...',
    '..kqwwwk....',
    '..kqqqk.....',
    '..kQQk......',
    '...kk.......',
    '............',
  ],
  cat: [
    '............',
    '.K.K........',
    '.KKK........',
    '.gwgK.......',
    '.KgKK.....K.',
    '.KwgKKKK..K.',
    '.KwwggggKK..',
    '.KwgKgKgK...',
    '..KggggggK..',
    '..K.K..K.K..',
    '............',
    '............',
  ],
  turtle: [
    '............',
    '............',
    '............',
    '...NNNNN....',
    '..NnNnNnN...',
    '.NnnNnnNnNll',
    '.NNNNNNNNNlk',
    '..l.l..l.l..',
    '.CCCCCCCCCCC',
    '..C..CC..C..',
    '............',
    '............',
  ],
  sprout: [
    '............',
    '............',
    '.ll......ll.',
    'lLLl....lLLl',
    'lLLLl..lLLLl',
    '.llLLllLLll.',
    '.....LL.....',
    '.....LL.....',
    '...MmmmmM...',
    '..MmmmmmmM..',
    '............',
    '............',
  ],
  fin: [
    '............',
    '......k.....',
    '.....kk.....',
    '....kKk.....',
    '...kKKk.....',
    '..kKKKk.....',
    '.kKKKKKk....',
    'kKKKKKKKk...',
    'CCCCCCCCCCCC',
    '.C..CC..C..C',
    '............',
    '............',
  ],
  sea: [
    '............',
    '............',
    '....CCC.....',
    '..CCccCC....',
    '.CccwwcC....',
    '.Ccw..cC..C.',
    'CCw...CCCCC.',
    'Cc....CccC..',
    'CccccccccC..',
    'CCCCCCCCCCCC',
    '............',
    '............',
  ],
  castle: [
    '............',
    '.....r......',
    '.....rr.....',
    '.....S......',
    '.S.S.S.S.S..',
    '.SSSsSSSsS..',
    '.SsssssssS..',
    '.SssSSSssS..',
    '.SssSkSssS..',
    'CSssSkSssSCC',
    'CCCCCCCCCCCC',
    '............',
  ],
  foil: [
    '............',
    '....pp......',
    '....pp.ss...',
    '...ppppss...',
    '..s.pp......',
    '....bb......',
    '....b.b.....',
    '.yyyyyyyy...',
    '.....k......',
    'C...kkk...CC',
    'CCCCCCCCCCCC',
    '............',
  ],
};
const SP = { ...IP, e: '#e8d7a8', k: '#2b2b2b', K: '#5a5a5a', g: '#a0a0a0', w: '#f4f4f4', C: '#2a8fc0', c: '#9edcf0', l: '#78c25a', L: '#3a8f3a', N: '#3c7a46', n: '#62a565' };
const smallCache = new Map();
function smallIcon(name, x, y) {
  if (!smallCache.has(name)) smallCache.set(name, new Raster(12, 12).stamp(SMALL[name], SP).svg(1));
  return `<g transform="translate(${x} ${y})">${smallCache.get(name)}</g>`;
}

// ------------------------------------------------------------------------------ preview: the island
// 128 x 72 cells at 2 px: a 16:9 thumbnail of the scene, the way a client previewed a file.
const PW = 128, PH = 72, PS = 2;
const PC = {
  sky: ['#74bfe9', '#8bcbee', '#a3d7f2', '#bfe4f5', '#d8f0f7'],
  sea: ['#86d3dc', '#5bbfd0', '#3eacc6', '#2c99b8', '#2186a4'],
  shallow: '#6fd4cb', shallow2: '#8fe0d2',
  sandWet: '#d9bc85', sand: '#f0d9a2', sandHi: '#f8e8bf', sandShade: '#dcc18a',
  trunk: '#b87a51', trunkDark: '#93603f', trunkHi: '#d29a6f',
  frond: '#3c9446', frondDark: '#2a7136', frondHi: '#6cbf5f', coconut: '#6b4a2a',
  log: '#a8774a', logDark: '#7a532f', rope: '#ecdcaa',
  cloud: '#ffffff', cloudShade: '#e3eef6', foam: '#ffffff', glint: '#ffffff',
};
// Her, drawn at 1 px (twice the scene's resolution) so the cream headphones read as headphones:
// the band an arc over her hair, the cups at her ears. Eyes closed, nodding along.
const HER = { h: '#6a4128', H: '#4a2c1a', e: '#f7efde', E: '#b39a6c', s: '#f2c6a0', S: '#d9a47e', d: '#3a2418', p: '#e2735c', P: '#c4583f', w: '#efe5cc', W: '#cdbd98' };
const HER_HEAD = [
  '......eeeeeeee......',
  '....ee.hhhhhh.ee....',
  '...e.hhhhhhhhhh.e...',
  '..e.hhhhhhhhhhhh.e..',
  '..e.hhhhhhhhhhhh.e..',
  '.EEEhhsssssssshhEEE.',
  'EeeEhssssssssssHEeeE',
  'EeeEhsddssssddsHEeeE',
  'EeeEhssssssssssHEeeE',
  '.EEEhsssssSssssHEEE.',
  '....hhssssssssHHH...',
  '.....hssssssssHHH...',
  '......ssssssss.HH...',
  '........ssss........',
];
const HER_BODY = [
  '........ssss........',
  '......ssppppss......',
  '.....ssppppppss.....',
  '....ss.pppppP.ss....',
  '....ss.pppppP.ss....',
  '....ss.pppppP.ss....',
  '....ss.ppppPP.ss....',
  '.....ss.wwww.ss.....',
  '......sswwwwss......',
  '...wwwwwwwwwwwwww...',
  '..wwwwwwWWwwwwwwww..',
  '..sssssSSSSSSsssss..',
  '.sssSSSsssssSSSsss..',
  '.ss..............ss.',
];
const HER_AT = [158, 90]; // body top-left in preview pixels; the head sits 13 px above

function drawScene() {
  const R = new Raster(PW, PH);
  // sky bands, dithered at each boundary
  const skyRows = [0, 7, 14, 20, 26, 30];
  for (let b = 0; b < 5; b++) R.rect(0, skyRows[b], PW, skyRows[b + 1] - skyRows[b], PC.sky[b]);
  for (let b = 1; b < 5; b++) for (let x = 0; x < PW; x++) if ((x & 1) === 0) R.set(x, skyRows[b], PC.sky[b - 1]);
  // sea bands
  const seaRows = [30, 32, 37, 46, 58, 72];
  for (let b = 0; b < 5; b++) R.rect(0, seaRows[b], PW, seaRows[b + 1] - seaRows[b], PC.sea[b]);
  for (let b = 1; b < 5; b++) for (let x = 0; x < PW; x++) if (((x + b) & 1) === 0) R.set(x, seaRows[b], PC.sea[b - 1]);
  // a few long swell lines
  const swell = mulberry32(77);
  for (let i = 0; i < 26; i++) {
    const y = 34 + Math.floor(swell() * 36), x = Math.floor(swell() * PW), w = 3 + Math.floor(swell() * 6);
    const band = y < 37 ? 1 : y < 46 ? 2 : y < 58 ? 3 : 4;
    R.rect(x, y, w, 1, PC.sea[band - 1]);
  }
  // shallow water and sand
  R.ellipse(84, 56, 44, 11.5, PC.shallow);
  R.ellipse(84, 56, 44, 11.5, PC.shallow2, (x, y) => ((x + y) & 1) === 0 && y < 52);
  R.ellipse(84, 55, 36, 7.6, PC.sandWet);
  R.ellipse(84, 54, 34, 6.2, PC.sand);
  R.ellipse(80, 52.4, 20, 2.4, PC.sandHi);
  R.ellipse(97, 55, 9, 1.6, PC.sandShade); // the palm's shade
  // raft, moored at the left edge of the sand
  for (let i = 0; i < 4; i++) {
    R.rect(45 + (i % 2), 54 + i, 15, 1, i % 2 ? PC.logDark : PC.log);
    R.set(45 + (i % 2), 54 + i, PC.logDark);
  }
  R.rect(48, 54, 1, 4, PC.rope); R.rect(56, 54, 1, 4, PC.rope);
  // the palm: tall and slender, a gentle curve, segmented reddish-tan bark
  const P0 = [99, 53], P1 = [105, 28], P2 = [92, 10];
  for (let i = 0; i <= 120; i++) {
    const t = i / 120;
    const x = (1 - t) * (1 - t) * P0[0] + 2 * (1 - t) * t * P1[0] + t * t * P2[0];
    const y = (1 - t) * (1 - t) * P0[1] + 2 * (1 - t) * t * P1[1] + t * t * P2[1];
    const seg = Math.floor(t * 16) % 2;
    const w = t < 0.12 ? 3 : 2;
    for (let k = 0; k < w; k++) R.set(x - 1 + k, y, seg ? PC.trunkDark : PC.trunk);
    if (!seg) R.set(x - 1, y, PC.trunkHi);
  }
  R.rect(97, 53, 4, 1, PC.trunkDark);
  // fronds
  const crown = [92, 10];
  const fronds = [[70, 18, 80, 4], [76, 26, 83, 12], [114, 18, 106, 3], [108, 27, 101, 12], [80, 1, 85, 2], [103, 0, 98, 1], [92, 26, 91, 18]];
  fronds.forEach(([ex, ey, cx, cy], fi) => {
    for (let i = 0; i <= 40; i++) {
      const t = i / 40;
      const x = (1 - t) * (1 - t) * crown[0] + 2 * (1 - t) * t * cx + t * t * ex;
      const y = (1 - t) * (1 - t) * crown[1] + 2 * (1 - t) * t * cy + t * t * ey;
      R.set(x, y, PC.frond);
      if (t < 0.7) R.set(x, y - 1, t < 0.35 ? PC.frondHi : PC.frond);
      if (fi < 4 && i % 3 === 0 && t > 0.15) { R.set(x, y + 1, PC.frondDark); R.set(x + (ex < crown[0] ? -1 : 1), y + 2, PC.frondDark); }
    }
  });
  R.rect(90, 10, 2, 2, PC.coconut); R.rect(93, 11, 2, 2, PC.coconut); R.set(92, 12, PC.coconut);
  // the cat, asleep on top of the crown (paused, as the grid says)
  R.stamp([
    'g.g......',
    'gggg.....',
    'gwgggGgGg',
    '.wggggggg',
    '........g',
    '........g',
  ], { g: '#9b9b9b', G: '#6f6f6f', w: '#f2f2f2' }, 85, 4);
  // a kumara slip in its little mound
  R.ellipse(69, 51.5, 3, 1.2, PC.sandShade);
  R.stamp(['l.l', 'lLl', '.L.'], { l: '#7cc860', L: '#3a8f3a' }, 68, 48);
  return R;
}

function sprite(rows, pal) { return new Raster(rows[0].length, rows.length).stamp(rows, pal); }

// ------------------------------------------------------------------------------ the banner
function build() {
  const body = [];
  const defs = [];

  // ---------- window frame and title bar
  defs.push(`<linearGradient id="tb" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="${C.title0}"/><stop offset="1" stop-color="${C.title1}"/></linearGradient>`);
  body.push(rect(0, 0, W, H, C.face));
  body.push(edges(0, 0, W, H, C.face, C.dark), edges(1, 1, W - 2, H - 2, C.hi, C.shadow));
  body.push(rect(4, 4, W - 8, 18, 'url(#tb)'));
  body.push(icon('app', 6, 5, 1));
  body.push(px(uib, 'Castaway - Longshore 0.80', 26, 9, '#ffffff'));
  // caption buttons
  const capBtn = (x, kind) => {
    let g = raised(x, 6, 16, 14);
    if (kind === 'min') g += rect(x + 4, 15, 6, 2, C.black);
    if (kind === 'max') g += `<path fill="${C.black}" d="M${x + 3} ${9}h9v2h-9z M${x + 3} 11h1v6h-1z M${x + 11} 11h1v6h-1z M${x + 3} 16h9v1h-9z"/>`;
    if (kind === 'close') g += `<path fill="${C.black}" d="M${x + 4} 9h2v1h-2zM${x + 10} 9h2v1h-2zM${x + 5} 10h2v1h-2zM${x + 9} 10h2v1h-2zM${x + 6} 11h4v1h-4zM${x + 7} 12h2v1h-2zM${x + 6} 13h4v1h-4zM${x + 5} 14h2v1h-2zM${x + 9} 14h2v1h-2zM${x + 4} 15h2v1h-2zM${x + 10} 15h2v1h-2z"/>`;
    return g;
  };
  body.push(capBtn(W - 58, 'min'), capBtn(W - 42, 'max'), capBtn(W - 22, 'close'));

  // ---------- menu bar
  let mx = 12;
  for (const m of ['File', 'View', 'Transfers', 'Island', 'Tools', 'Help']) {
    body.push(px(ui, m, mx, 28, C.ink));
    body.push(rect(mx + (m === 'Island' ? 0 : 0), 37, ui.adv(m[0]) - 1, 1, C.ink)); // accelerator underline
    mx += ui.width(m) + 16;
  }
  body.push(etchedH(4, 42, W - 8));

  // ---------- toolbar: big icons, the Transfers button pressed
  const tools = ['Connect', 'Search', 'Transfers', 'Shared', 'Bottles', 'Schedule', 'Sound', 'Options'];
  const iconOf = { Connect: 'connect', Search: 'search', Transfers: 'transfers', Shared: 'shared', Bottles: 'bottles', Schedule: 'schedule', Sound: 'sound', Options: 'options' };
  const TB_Y = 46, TB_W = 60, TB_H = 52;
  tools.forEach((name, i) => {
    const x = 8 + i * TB_W + (i >= 3 ? 6 : 0) + (i >= 6 ? 6 : 0);
    if (name === 'Transfers') {
      body.push(rect(x, TB_Y, TB_W - 2, TB_H, '#e6e3dc') + edges(x, TB_Y, TB_W - 2, TB_H, C.shadow, C.hi));
    }
    const off = name === 'Transfers' ? 1 : 0;
    body.push(icon(iconOf[name], x + Math.round((TB_W - 2 - 32) / 2) + off, TB_Y + 4 + off, 2));
    body.push(px(ui, name, x + Math.round((TB_W - 2) / 2) + off, TB_Y + 40 + off, C.ink, { align: 'middle' }));
  });
  body.push(etchedV(8 + 3 * TB_W + 1, TB_Y + 4, TB_H - 8), etchedV(8 + 6 * TB_W + 7, TB_Y + 4, TB_H - 8));
  // the client's mark at the right of the toolbar
  const LOGO_X = 548;
  body.push(icon('app', LOGO_X, TB_Y + 6, 2));
  body.push(px(uib, 'Longshore', LOGO_X + 40, TB_Y + 7, C.navy, { scale: 2 }));
  body.push(px(ui, 'everything arrives, eventually', LOGO_X + 41, TB_Y + 30, C.grey));
  body.push(etchedH(4, 100, W - 8));

  // ---------- hero, left: the preview (16:9) of the island
  const PX0 = 16, PY0 = 118, PWpx = PW * PS, PHpx = PH * PS;
  body.push(groupBox(8, 110, 272, 166, 'Preview'));
  body.push(thinSunken(PX0 - 1, PY0 - 1, PWpx + 2, PHpx + 2));
  defs.push(`<clipPath id="pv"><rect x="${PX0}" y="${PY0}" width="${PWpx}" height="${PHpx}"/></clipPath>`);
  const scene = drawScene();
  const pv = [];
  pv.push(scene.svg(PS, PX0, PY0));
  // clouds: two drifting banks, drawn twice side by side so the drift wraps without a seam
  const clouds = new Raster(PW * 2, 14);
  const cloudAt = (cx, cy, s) => {
    clouds.ellipse(cx, cy, 7 * s, 2.6 * s, PC.cloud).ellipse(cx - 5 * s, cy + 0.8, 4 * s, 1.8 * s, PC.cloud).ellipse(cx + 5 * s, cy + 0.6, 4.5 * s, 2 * s, PC.cloud);
    clouds.rect(Math.round(cx - 9 * s), Math.round(cy + 2), Math.round(18 * s), 1, PC.cloudShade);
  };
  for (const off of [0, PW]) { cloudAt(off + 20, 5, 1); cloudAt(off + 66, 3, 0.75); cloudAt(off + 104, 8, 0.9); }
  const cloudCls = linAnim('transform', [[0, 0, 128], [T, -PW * PS]], (v) => `translate(${r1(v)}px,0)`);
  pv.push(`<g class="${cloudCls}" transform="translate(${r1(linAt([[0, 0], [T, -PW * PS]], T_STATIC))} 0)"><g transform="translate(${PX0} ${PY0 + 2})">${clouds.svg(PS)}</g></g>`);
  // the sea glints: two sets taking turns on the beat
  const glints = [new Raster(PW, PH), new Raster(PW, PH)];
  const gr = mulberry32(5);
  for (let i = 0, n = 0; n < 12 && i < 200; i++) {
    const x = Math.floor(gr() * (PW - 3)), y = 32 + Math.floor(gr() * 34);
    if (y > 41 && x > 36 && x < 132) continue;
    glints[n % 2].rect(x, y, 2 + (n % 2), 1, PC.glint);
    n++;
  }
  const gA = stepAnim('opacity', flicker([1, 0], BEAT * 2));
  const gB = stepAnim('opacity', flicker([0, 1], BEAT * 2));
  pv.push(`<g class="${gA}" opacity="${stepAt(flicker([1, 0], BEAT * 2), T_STATIC)}">${glints[0].svg(PS, PX0, PY0)}</g>`);
  pv.push(`<g class="${gB}" opacity="${stepAt(flicker([0, 1], BEAT * 2), T_STATIC)}">${glints[1].svg(PS, PX0, PY0)}</g>`);
  // the shore foam: two dash patterns, swapping every bar
  const foam = [new Raster(PW, PH), new Raster(PW, PH)];
  for (let a = 0; a < 360; a += 3) {
    const rad = (a * Math.PI) / 180;
    const x = 84 + Math.cos(rad) * 37.5, y = 55.6 + Math.sin(rad) * 8.2;
    if (Math.sin(rad) < -0.3) continue; // the far side is hidden by the sand's height
    foam[Math.floor(a / 9) % 2].set(x, y, PC.foam);
  }
  const fl = flicker([1, 0], BAR / 2);
  pv.push(`<g class="${stepAnim('opacity', fl)}" opacity="${stepAt(fl, T_STATIC)}">${foam[0].svg(PS, PX0, PY0)}</g>`);
  const fl2 = flicker([0, 1], BAR / 2);
  pv.push(`<g class="${stepAnim('opacity', fl2)}" opacity="${stepAt(fl2, T_STATIC)}">${foam[1].svg(PS, PX0, PY0)}</g>`);

  // her head, nodding on every beat (80 BPM)
  css.push(`@keyframes nod{0%{transform:translate(0,0)}12%{transform:translate(0,1px)}52%{transform:translate(0,0)}100%{transform:translate(0,0)}}.nod{animation:nod ${BEAT}s steps(1,end) infinite}`);
  pv.push(sprite(HER_BODY, HER).svg(1, PX0 + HER_AT[0], PY0 + HER_AT[1]));
  pv.push(`<g transform="translate(${PX0 + HER_AT[0]} ${PY0 + HER_AT[1] - 13})"><g class="nod">${sprite(HER_HEAD, HER).svg(1)}</g></g>`);
  // a note floats up from her headphones every other bar
  css.push(`@keyframes note{0%{opacity:1;transform:translate(0,0)}40%{opacity:1;transform:translate(2px,-7px)}50%{opacity:0;transform:translate(2px,-8px)}100%{opacity:0;transform:translate(0,0)}}.note{animation:note ${2 * BAR}s steps(8,end) infinite}`);
  pv.push(`<g transform="translate(${PX0 + HER_AT[0] + 19} ${PY0 + HER_AT[1] - 22})"><g class="note" opacity="0">${px(ui, '♪', 0, 0, '#ffffff')}</g></g>`);

  // a sprite that moves along a path of [t, [x, y]] cell positions, in stepped moves
  const mover = (raster, keys, vis) => {
    const pxKeys = keys.map(([t, [x, y]]) => [t, [x * PS, y * PS]]);
    const withSteps = pxKeys.map(([t, v], i) => {
      const nx = pxKeys[i + 1];
      const n = nx ? Math.max(1, Math.round(Math.max(Math.abs(nx[1][0] - v[0]), Math.abs(nx[1][1] - v[1])) / PS)) : 0;
      return [t, v, n];
    });
    const cls = linAnim('transform', withSteps, ([x, y]) => `translate(${r1(x)}px,${r1(y)}px)`);
    const [sx, sy] = linAt(pxKeys, T_STATIC);
    let inner = `<g class="${cls}" transform="translate(${r1(Math.round(sx / PS) * PS)} ${r1(Math.round(sy / PS) * PS)})">${raster.svg(PS)}</g>`;
    if (vis) inner = `<g class="${stepAnim('opacity', vis)}" opacity="${stepAt(vis, T_STATIC)}">${inner}</g>`;
    return `<g transform="translate(${PX0} ${PY0})">${inner}</g>`;
  };

  // the delivery drone: arrives from the top right, lowers the parcel on the bar line at 0:12,
  // and leaves. The parcel stays on the sand until a wave lifts it off at 0:42.
  const DRONE = sprite([
    'GGG....GGG',
    '..K....K..',
    '.KKKKKKKK.',
    '..KkkkkK..',
    '....ee....',
  ], { G: '#c9ced4', K: '#3d434b', k: '#636b75', e: '#e8d7a8' });
  const BOX = sprite(['mmmmmm', 'mMMMMm', 'mmmmmm'], { m: '#c99a5b', M: '#8d6334' });
  const droneKeys = [
    [0, [118, 30]],
    [6, [104, 38]],
    [12, [104, 44]],
    [13.5, [104, 41]],
    [21, [PW + 4, -8]],
    [45, [PW + 4, -8]],
    [T, [118, 30]],
  ];
  pv.push(mover(DRONE, droneKeys));
  // the parcel hangs under the drone until the bar line at 0:12 ...
  pv.push(mover(BOX, droneKeys.map(([t, [x, y]]) => [t, [x + 2, y + 5]]), [[0, 1], [12, 0], [45, 1]]));
  // ... then sits on the sand until a wave lifts it off at 0:42 and floats it away
  pv.push(mover(BOX, [[0, [106, 49]], [42, [106, 49]], [51, [PW + 2, 57]], [51.01, [106, 49]], [T, [106, 49]]], [[0, 0], [12, 1], [51, 0]]));

  // the message in a bottle: thrown at 0:33, drifts out, washes straight back at 0:09 to 0:12
  const BOTTLE = sprite(['.qqqwm', 'QQQQQ.'], { q: '#a8e0b0', Q: '#4f9a68', w: '#fffbe8', m: '#a0703a' });
  pv.push(mover(BOTTLE, [
    [0, [26, 39]],
    [9, [22, 37]],
    [12, [74, 51]],
    [33, [74, 51]],
    [34.5, [63, 55]],
    [T, [26, 39]],
  ]));

  // the shark, in headphones somewhere below that fin, cruising past and nodding on the beat
  const FIN = sprite([
    '...k.',
    '..kK.',
    '.kKK.',
    'kKKKk',
    'wwwwww',
  ].map((r) => r.padEnd(6, '.')), { k: '#4d6474', K: '#6f8796', w: '#ffffff' });
  css.push(`@keyframes bob{0%{transform:translate(0,0)}20%{transform:translate(0,-${PS}px)}60%{transform:translate(0,0)}100%{transform:translate(0,0)}}.bob{animation:bob ${BEAT}s steps(1,end) infinite}`);
  const finKeys = [[0, [4, 63]], [30, [118, 65]], [T, [4, 63]]];
  {
    const pxKeys = finKeys.map(([t, [x, y]]) => [t, [x * PS, y * PS]]);
    const cls = linAnim('transform', pxKeys.map(([t, v], i) => [t, v, pxKeys[i + 1] ? Math.round(Math.abs(pxKeys[i + 1][1][0] - v[0]) / PS) : 0]), ([x, y]) => `translate(${r1(x)}px,${r1(y)}px)`);
    const [sx, sy] = linAt(pxKeys, T_STATIC);
    pv.push(`<g transform="translate(${PX0} ${PY0})"><g class="${cls}" transform="translate(${Math.round(sx / PS) * PS} ${Math.round(sy / PS) * PS})"><g class="bob">${FIN.svg(PS)}</g></g></g>`);
  }
  // the sea turtle, paddling slowly at 14.4
  const TURTLE = sprite(['..NNN.h', '.NnnnNh', 'l.l.l..'], { N: '#3c7a46', n: '#62a565', h: '#8cc07a', l: '#5d9a5a' });
  pv.push(mover(TURTLE, [[0, [6, 46]], [30, [13, 47]], [T, [6, 46]]]));
  body.push(`<g clip-path="url(#pv)">${pv.join('')}</g>`);

  // ---------- hero, right: General
  const GX = 288, GY = 110, GW = W - 8 - GX, GH = 166;
  body.push(groupBox(GX, GY, GW, GH, 'General'));
  defs.push(`<linearGradient id="nm" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#1b4fb0"/><stop offset="1" stop-color="#0a246a"/></linearGradient>`);
  const NS = 1.1;
  const nameX = GX + 14, nameY = GY + 14;
  body.push(`<path fill="#b9cbe6" d="${namePath('CASTAWAY', nameX + 2, nameY + 2, NS)}"/>`);
  body.push(`<path fill="url(#nm)" d="${namePath('CASTAWAY', nameX, nameY, NS)}"/>`);
  const nameW = nameWidth('CASTAWAY', 2.6) * NS;
  // right of the name: what kind of file this is
  const infoX = W - 22;
  body.push(px(ui, 'working title', infoX, nameY + 1, C.grey, { align: 'end' }));
  body.push(px(ui, 'no video published yet', infoX, nameY + 14, C.grey, { align: 'end' }));
  body.push(px(ui, 'always daytime', infoX, nameY + 27, C.grey, { align: 'end' }));
  const tagY = nameY + 52;
  body.push(px(uib, 'A 10-hour lo-fi island video. She idles; every so often, a gag.', nameX, tagY, C.ink, { maxW: GW - 28 }));
  body.push(px(ui, 'An unofficial remake inspired by a 1992 desert-island screensaver.', nameX, tagY + 13, C.grey, { maxW: GW - 28 }));
  // key / value pairs, two columns
  const kv = [
    ['Size', '10:00:00, 1080p24', 'Pieces', '12,000 bars of 3 s'],
    ['Seeds', '1992', 'Ratio', 'busy 1 : idle 2'],
    ['Time left', '10 hours (accurate, for once)', 'Sound', '150+ files, all from code'],
  ];
  const kvY = tagY + 31;
  kv.forEach(([k1, v1, k2, v2], i) => {
    const y = kvY + i * 13;
    body.push(px(ui, `${k1}:`, nameX, y, C.grey), px(ui, v1, nameX + 52, y, C.ink));
    body.push(px(ui, `${k2}:`, nameX + 250, y, C.grey), px(ui, v2, nameX + 292, y, C.ink));
  });

  // the theme's 20 bars as a chunk map: black = played, yellow = playing, blue = to come.
  // At t = 0 the theme is in bar 9; it wraps round (bar 20 to bar 1) at 0:36.
  const MAP_Y = GY + GH - 22, MAP_X = nameX + 52, MAP_W = 300, MAP_H = 11;
  const barAt = (t) => ((8 + Math.floor(t / BAR + 1e-9)) % 20) + 1;
  body.push(px(ui, 'Bars:', nameX, MAP_Y + 2, C.grey));
  body.push(thinSunken(MAP_X - 1, MAP_Y - 1, MAP_W + 2, MAP_H + 2));
  const shadeOf = [2, 1, 2, 3, 2, 2, 1, 3, 3, 2, 2, 1, 2, 3, 3, 2, 1, 2, 3, 2];
  const cellW = MAP_W / 20;
  for (let k = 1; k <= 20; k++) {
    const tl = [];
    for (let b = 0; b < 20; b++) {
      const t = b * BAR;
      const cur = barAt(t);
      tl.push([t, k < cur ? C.have : k === cur ? C.getting : C.avail[shadeOf[k - 1]]]);
    }
    const dedup = tl.filter((e, i) => i === 0 || e[1] !== tl[i - 1][1]);
    const cls = stepAnim('fill', dedup);
    const x = MAP_X + (k - 1) * cellW;
    body.push(`<rect class="${cls}" x="${r2(x)}" y="${MAP_Y + 2}" width="${r2(cellW)}" height="${MAP_H - 2}" fill="${stepAt(dedup, T_STATIC)}"/>`);
  }
  // the green line along the top: progress through the loop
  {
    const keys = [[0, 8 / 20], [36 - 0.001, 1], [36, 0], [T, 8 / 20]];
    const cls = linAnim('transform', keys, (v) => `scaleX(${r2(v * 1000) / 1000})`);
    body.push(`<g transform="translate(${MAP_X} ${MAP_Y})"><rect class="${cls}" width="${MAP_W}" height="2" fill="${C.progress}" transform="scale(${r2(linAt(keys, T_STATIC))} 1)"/></g>`);
  }
  // counter: which bar, and how long until the next one (every gag waits for it)
  {
    const cx = MAP_X + MAP_W + 8, cy = MAP_Y + 2;
    body.push(px(ui, 'bar', cx, cy, C.ink));
    const numTl = [];
    for (let b = 0; b < 20; b++) numTl.push([b * BAR, String(barAt(b * BAR))]);
    body.push(textSlot(ui, cx + ui.width('bar') + 3 + ui.width('20'), cy, C.ink, numTl, { align: 'end' }));
    const rest = 'of 20 · next in';
    const rx = cx + ui.width('bar') + 6 + ui.width('20');
    body.push(px(ui, rest, rx, cy, C.ink));
    const nx = rx + ui.width(rest) + 3;
    body.push(textSlot(ui, nx, cy, C.ink, flicker(['3', '2', '1'], 1)));
    body.push(px(ui, 's', nx + ui.width('3') + 3, cy, C.ink));
  }

  // ---------- downloads
  const LX = 8, LW = W - 16;
  const DL_Y = 284;
  body.push(icon('transfers', 12, DL_Y - 2, 1));
  body.push(px(uib, 'Downloads (5)', 32, DL_Y + 2, C.ink));
  body.push(px(ui, 'what washes up · every start waits for the next bar', W - 14, DL_Y + 2, C.grey, { align: 'end' }));
  const ROW = 17;
  const dCols = [
    ['File name', 10, 168, 'start'],
    ['Progress', 168, 330, 'start'],
    ['From', 330, 456, 'start'],
    ['Speed', 456, 518, 'end'],
    ['Status', 518, 712, 'start'],
    ['Left', 712, 820, 'start'],
  ];
  const listBox = (y, rows, cols) => {
    const h = 4 + ROW + rows * ROW;
    let g = sunken(LX, y, LW, h);
    for (let r = 0; r < rows; r++) if (r % 2) g += rect(LX + 2, y + 2 + ROW + r * ROW, LW - 4, ROW, C.stripe);
    cols.forEach(([label, x0, x1, align], i) => {
      const w = x1 - x0 + (i === cols.length - 1 ? 0 : 0);
      g += raised(x0, y + 2, w, ROW);
      const tx = align === 'end' ? x1 - 6 : x0 + 5;
      g += px(ui, label, tx, y + 6, C.ink, { align });
    });
    // sort arrow on the first column
    g += px(ui, '▴', cols[0][1] + 5 + ui.width(cols[0][0]) + 4, y + 6, C.shadow);
    return g;
  };
  body.push(listBox(DL_Y + 14, 5, dCols));
  const rowY = (top, i) => top + 2 + ROW + i * ROW;

  // chunk bar (eMule-style) from a per-segment colour timeline and a green progress fraction
  const CB_W = 112, CB_H = 11, SEGS = 24;
  const chunkBar = (x, y, segTl, progTl, completeTl) => {
    let g = thinSunken(x - 1, y - 1, CB_W + 2, CB_H + 2, C.list);
    const sw = CB_W / SEGS;
    segTl.forEach((tl, i) => {
      const sx = r2(x + i * sw);
      const dedup = tl.filter((e, j) => j === 0 || e[1] !== tl[j - 1][1]);
      if (dedup.length === 1) g += `<rect x="${sx}" y="${y + 2}" width="${r2(sw)}" height="${CB_H - 2}" fill="${dedup[0][1]}"/>`;
      else g += `<rect class="${stepAnim('fill', dedup)}" x="${sx}" y="${y + 2}" width="${r2(sw)}" height="${CB_H - 2}" fill="${stepAt(dedup, T_STATIC)}"/>`;
    });
    if (progTl) {
      const dedup = progTl.filter((e, j) => j === 0 || e[1] !== progTl[j - 1][1]);
      const base = stepAt(dedup, T_STATIC);
      if (dedup.length === 1) g += rect(x, y, CB_W * base, 2, C.progress);
      else g += `<g transform="translate(${x} ${y})"><rect class="${stepAnim('transform', dedup, (v) => `scaleX(${r2(v * 1000) / 1000})`)}" width="${CB_W}" height="2" fill="${C.progress}" transform="scale(${r2(base)} 1)"/></g>`;
    }
    if (completeTl) {
      const base = stepAt(completeTl, T_STATIC);
      g += `<rect class="${stepAnim('opacity', completeTl)}" x="${x}" y="${y}" width="${CB_W}" height="${CB_H}" fill="${C.complete}" opacity="${base}"/>`;
    }
    return g;
  };
  // a static bar: n segments have, given order, the rest by availability shade
  const staticSegs = (have, getting, shadeFn) => Array.from({ length: SEGS }, (_, i) => [[0, have.includes(i) ? C.have : getting.includes(i) ? C.getting : shadeFn(i)]]);
  const shadeR = mulberry32(31);
  const shades = Array.from({ length: SEGS * 6 }, () => Math.floor(shadeR() * 3) + (shadeR() < 0.25 ? 1 : 0));

  const dTop = DL_Y + 14;
  const cellText = (font, str, col, i, fill, top, align) => {
    const [, x0, x1, al] = col;
    const a = align || al;
    return px(font, str, a === 'end' ? x1 - 6 : x0 + 5, rowY(top, i) + 5, fill, { align: a, maxW: x1 - x0 - 8 });
  };
  const slotIn = (col, i, fill, tl, top, font = ui) => {
    const [, x0, x1, al] = col;
    return textSlot(font, al === 'end' ? x1 - 6 : x0 + 5, rowY(top, i) + 5, fill, tl, { align: al, maxW: x1 - x0 - 8 });
  };
  const nameCell = (iconName, str, i, top, col) => smallIcon(iconName, col[1] + 4, rowY(top, i) + 3) + px(ui, str, col[1] + 21, rowY(top, i) + 5, C.ink, { maxW: col[2] - col[1] - 24 });

  // Row 0: delivery_drone. 62% at t = 0, complete on the bar line at 0:12 (a duplicate: she
  // already has headphones), cleared and queued at 0:36, starts again at 0:45.
  {
    const i = 0;
    const order = Array.from({ length: SEGS }, (_, k) => k);
    const pr = mulberry32(1992);
    for (let k = SEGS - 1; k > 0; k--) { const j = Math.floor(pr() * (k + 1)); [order[k], order[j]] = [order[j], order[k]]; }
    const blackAt = new Array(SEGS);
    order.forEach((seg, n) => { blackAt[seg] = n < 15 ? 45 + n : (12 * (n - 14)) / 9; });
    const segTl = order.map((_, seg) => {
      const tb = blackAt[seg];
      const blue = C.avail[Math.min(3, shades[seg] + 1)];
      const ty = tb - 1.5;
      if (tb >= 45) return [[0, C.have], [36, blue], [ty, C.getting], [tb, C.have]];
      return [[0, blue], [Math.max(0, ty), C.getting], [tb, C.have], [36, blue]].filter((e) => e[0] >= 0).sort((a, b) => a[0] - b[0]);
    });
    const nAt = (t) => (t >= 12 && t < 36 ? SEGS : t >= 36 && t < 45 ? 0 : blackAt.filter((tb) => (tb >= 45 ? t >= tb || t < 36 : t >= tb && t < 36)).length);
    const progTl = [];
    for (let t = 0; t < T; t += 0.5) progTl.push([t, nAt(t) / SEGS]);
    const completeTl = [[0, 0], [12, 1], [36, 0]];
    const top = dTop;
    body.push(nameCell('drone', 'delivery_drone', i, top, dCols[0]));
    body.push(chunkBar(dCols[1][1] + 5, rowY(top, i) + 3, segTl, progTl, completeTl));
    const pctTl = [];
    for (let t = 0; t < T; t += 0.5) pctTl.push([t, `${Math.round((nAt(t) / SEGS) * 100)}%`]);
    body.push(textSlot(ui, dCols[1][2] - 6, rowY(top, i) + 5, C.ink, pctTl.filter((e, j) => j === 0 || e[1] !== pctTl[j - 1][1]), { align: 'end' }));
    body.push(cellText(ui, 'delivery drone', dCols[2], i, C.ink, top));
    const speedTl = compose([0, 12, flicker(['3.8 KB/s', '4.6 KB/s', '2.9 KB/s', '4.1 KB/s'], BEAT * 2, 0, 12)], [12, 45, ''], [45, T, flicker(['3.1 KB/s', '4.4 KB/s', '3.6 KB/s', '2.7 KB/s'], BEAT * 2, 45)]);
    body.push(slotIn(dCols[3], i, C.ink, speedTl, top));
    const statusTl = [[0, 'Downloading'], [12, 'Complete: duplicate'], [36, 'Queued'], [45, 'Downloading']];
    const statusCol = { Downloading: C.ink, 'Complete: duplicate': C.warn, Queued: C.queued };
    for (const s of Object.keys(statusCol)) {
      body.push(textSlot(ui, dCols[4][1] + 5, rowY(top, i) + 5, statusCol[s], statusTl.map(([t, v]) => [t, v === s ? s : '']).concat([[T_STATIC + 1000, '']]).filter(([t]) => t < T)));
    }
    const leftTl = [];
    for (let b = 0; b < 20; b++) {
      const t = b * BAR;
      if (t < 12) leftTl.push([t, `0:${String(12 - t).padStart(2, '0')}`]);
      else if (t < 36) leftTl.push([t, 'headphones x2']);
      // Queued: the rare timer picks one of many rare gags, so when the drone returns is anyone's guess.
      else if (t < 45) leftTl.push([t, '∞']);
      else leftTl.push([t, `0:${String(72 - t).padStart(2, '0')}`]);
    }
    body.push(slotIn(dCols[5], i, C.ink, leftTl.filter((e, j) => j === 0 || e[1] !== leftTl[j - 1][1]), top));
  }
  // Row 1: bottle_reply. Red all along: missing in every known source (nobody has written it yet).
  {
    const i = 1, top = dTop;
    body.push(nameCell('bottle', 'bottle_reply', i, top, dCols[0]));
    body.push(chunkBar(dCols[1][1] + 5, rowY(top, i) + 3, staticSegs([], [], () => C.missing), [[0, 0]], null));
    body.push(px(ui, '0%', dCols[1][2] - 6, rowY(top, i) + 5, C.ink, { align: 'end' }));
    body.push(cellText(ui, 'a different bottle', dCols[2], i, C.ink, top));
    body.push(cellText(ui, '0.0 KB/s', dCols[3], i, C.muted, top));
    body.push(cellText(ui, 'Waiting for a reply', dCols[4], i, C.queued, top));
    body.push(cellText(ui, '1 to 3 h', dCols[5], i, C.ink, top));
  }
  // Row 2: cat_visit. Paused: asleep up the palm.
  {
    const i = 2, top = dTop;
    const have = [0, 1, 2, 3, 5, 6, 7, 9, 10, 11, 13, 14, 15];
    body.push(nameCell('cat', 'cat_visit', i, top, dCols[0]));
    body.push(chunkBar(dCols[1][1] + 5, rowY(top, i) + 3, staticSegs(have, [], (k) => C.avail[shades[k + 30] % 3]), [[0, have.length / SEGS]], null));
    body.push(px(ui, `${Math.round((have.length / SEGS) * 100)}%`, dCols[1][2] - 6, rowY(top, i) + 5, C.ink, { align: 'end' }));
    body.push(cellText(ui, 'a crate (Unknown)', dCols[2], i, C.ink, top));
    body.push(cellText(ui, '-', dCols[3], i, C.muted, top));
    body.push(cellText(ui, 'Paused: asleep up the palm', dCols[4], i, C.muted, top));
    body.push(cellText(ui, 'one day', dCols[5], i, C.ink, top));
  }
  // Row 3: turtle_visit, from a sea turtle on a 14.4 line. One yellow piece, forever.
  {
    const i = 3, top = dTop;
    const have = [0, 1, 2, 4, 8, 12];
    const segs = staticSegs(have, [], (k) => C.avail[shades[k + 60] % 2]);
    segs[5] = flicker([C.getting, C.avail[2]], BEAT * 2);
    body.push(nameCell('turtle', 'turtle_visit', i, top, dCols[0]));
    body.push(chunkBar(dCols[1][1] + 5, rowY(top, i) + 3, segs, [[0, have.length / SEGS]], null));
    body.push(px(ui, `${Math.round((have.length / SEGS) * 100)}%`, dCols[1][2] - 6, rowY(top, i) + 5, C.ink, { align: 'end' }));
    body.push(cellText(ui, 'sea turtle (14.4)', dCols[2], i, C.ink, top));
    body.push(slotIn(dCols[3], i, C.ink, flicker(['0.1 KB/s', '0.3 KB/s', '0.2 KB/s', '0.0 KB/s', '0.2 KB/s'], BEAT * 2), top));
    body.push(cellText(ui, 'Downloading (dozing off)', dCols[4], i, C.ink, top));
    body.push(slotIn(dCols[5], i, C.ink, flicker(['3:13', '6:06', '4:41', '6:06'], BAR), top));
  }
  // Row 4: kumara_leafs, growing at the speed of a plant.
  {
    const i = 4, top = dTop;
    body.push(nameCell('sprout', 'kumara_leafs', i, top, dCols[0]));
    body.push(chunkBar(dCols[1][1] + 5, rowY(top, i) + 3, staticSegs([0], [], (k) => C.avail[shades[k + 90] % 2]), [[0, 1 / SEGS]], null));
    body.push(px(ui, '4%', dCols[1][2] - 6, rowY(top, i) + 5, C.ink, { align: 'end' }));
    body.push(cellText(ui, 'the sand', dCols[2], i, C.ink, top));
    body.push(cellText(ui, '0.001 KB/s', dCols[3], i, C.ink, top));
    body.push(cellText(ui, 'Growing, slowly', dCols[4], i, C.ok, top));
    body.push(cellText(ui, '1:30 to 2:30 h', dCols[5], i, C.ink, top));
  }

  // ---------- uploads (the older look: one yellow bar per file, percentage centred in it)
  const UL_Y = 412;
  body.push(icon('transfers', 12, UL_Y - 2, 1));
  body.push(px(uib, 'Uploads (4)', 32, UL_Y + 2, C.ink));
  body.push(px(ui, 'Clients on queue: 90+ activities, in no hurry', W - 14, UL_Y + 2, C.grey, { align: 'end' }));
  const uCols = [
    ['User', 10, 168, 'start'],
    ['Line', 168, 224, 'start'],
    ['File', 224, 380, 'start'],
    ['Progress', 380, 534, 'start'],
    ['Status', 534, 820, 'start'],
  ];
  const uTop = UL_Y + 14;
  body.push(listBox(uTop, 4, uCols));
  const UB_W = 142, UB_H = 13;
  const upBar = (i, keys, pctTl) => {
    const x = uCols[3][1] + 5, y = rowY(uTop, i) + 2;
    let g = sunken(x, y, UB_W, UB_H, C.list);
    const inner = UB_W - 4;
    const base = typeof keys === 'number' ? keys : linAt(keys, T_STATIC);
    if (typeof keys === 'number') g += rect(x + 2, y + 2, inner * keys, UB_H - 4, C.upBar) + rect(x + 2, y + 2, inner * keys, 1, C.upBarHi);
    else {
      const cls = linAnim('transform', keys, (v) => `scaleX(${r2(v * 1000) / 1000})`);
      g += `<g transform="translate(${x + 2} ${y + 2})"><g class="${cls}" transform="scale(${r2(base)} 1)">${rect(0, 0, inner, UB_H - 4, C.upBar)}${rect(0, 0, inner, 1, C.upBarHi)}</g></g>`;
    }
    g += textSlot(ui, x + UB_W / 2, y + 3, C.ink, pctTl, { align: 'middle' });
    return g;
  };
  const uName = (iconName, str, i) => smallIcon(iconName, uCols[0][1] + 4, rowY(uTop, i) + 3) + px(ui, str, uCols[0][1] + 21, rowY(uTop, i) + 5, C.ink);
  // U0: the theme, streaming to the shark. Position in the loop, wrapping at 0:36.
  {
    const i = 0;
    body.push(uName('fin', 'shark (headphones)', i));
    body.push(cellText(ui, 'Cable', uCols[1], i, C.ink, uTop));
    body.push(cellText(ui, 'theme, 60 s loop', uCols[2], i, C.ink, uTop));
    const keys = [[0, 8 / 20], [36 - 0.001, 1], [36, 0], [T, 8 / 20]];
    const pctTl = [];
    for (let b = 0; b < 20; b++) pctTl.push([b * BAR, `${(barAt(b * BAR) - 1) * 5}%`]);
    body.push(upBar(i, keys, pctTl));
    body.push(textSlot(ui, uCols[4][1] + 5, rowY(uTop, i) + 5, C.ink, [[0, 'Uploading. It nods along, on the beat'], [36, 'Looped. Seamlessly, as designed'], [39, 'Uploading. It nods along, on the beat']]));
  }
  // U1: message_in_bottle to the sea. Delivered at 0:09, washed straight back at 0:12.
  {
    const i = 1;
    body.push(uName('sea', 'the sea', i));
    body.push(cellText(ui, 'Current', uCols[1], i, C.ink, uTop));
    body.push(cellText(ui, 'message_in_bottle', uCols[2], i, C.ink, uTop));
    const keys = [[0, 0.4], [9, 1], [12 - 0.001, 1], [12, 0], [33, 0], [T, 0.4]];
    const pctTl = [];
    for (let t = 0; t < T; t += 1.5) pctTl.push([t, `${Math.round(linAt(keys, t + 0.0001) * 100)}%`]);
    body.push(upBar(i, keys, pctTl.filter((e, j) => j === 0 || e[1] !== pctTl[j - 1][1])));
    const st = [[0, 'Uploading'], [9, 'Delivered?'], [12, 'Returned. It washed straight back'], [33, 'Uploading']];
    const stCol = { Uploading: C.ink, 'Delivered?': C.ink, 'Returned. It washed straight back': C.bad };
    for (const s of Object.keys(stCol)) {
      body.push(textSlot(ui, uCols[4][1] + 5, rowY(uTop, i) + 5, stCol[s], st.map(([t, v]) => [t, v === s ? s : ''])));
    }
  }
  // U2: the sandcastle, to the tide. U3: one big wave, to the hydrofoil bro.
  {
    body.push(uName('castle', 'the tide', 2));
    body.push(cellText(ui, 'Unknown', uCols[1], 2, C.ink, uTop));
    body.push(cellText(ui, 'sandcastle', uCols[2], 2, C.ink, uTop));
    body.push(upBar(2, 1, [[0, '100%']]));
    body.push(cellText(ui, 'Complete. The tide took it', uCols[4], 2, C.ok, uTop));
    body.push(uName('foil', 'hydrofoil bro', 3));
    body.push(cellText(ui, 'T3', uCols[1], 3, C.ink, uTop));
    body.push(cellText(ui, 'one big wave', uCols[2], 3, C.ink, uTop));
    body.push(upBar(3, 1, [[0, '100%']]));
    body.push(cellText(ui, 'Complete. Shaka received; he carved off', uCols[4], 3, C.ok, uTop));
  }

  // ---------- footer: the share line and a button
  const FY = uTop + 4 + ROW + 4 * ROW + 6;
  body.push(px(ui, 'Sharing 1 island. A typical 10-hour run: about 155 regular, 30 occasional, 13 rare and 2 super-rare events.', 12, FY + 5, C.ink, { maxW: W - 120 }));
  body.push(raised(W - 104, FY, 92, 18) + px(ui, 'Clear finished', W - 58, FY + 5, C.ink, { align: 'middle' }));

  // ---------- status bar
  const SY = FY + 22;
  if (SY + 18 + 4 !== H) throw new Error(`H should be ${SY + 22}`);
  const segs = [
    [6, 290, 'Connected: 127.0.0.1:8765 (python tools/serve.py)', 'connect'],
    [294, 448, 'Up: theme, 80 BPM, F major'],
    [452, 588, 'Down: 1 bar every 3 s'],
    [592, W - 6, 'Signal: 1 bar (top of the palm)'],
  ];
  segs.forEach(([x0, x1, label, ic]) => {
    body.push(thinSunken(x0, SY, x1 - x0, 18));
    if (ic) body.push(icon('connect', x0 + 3, SY + 1, 1));
    body.push(px(ui, label, x0 + (ic ? 22 : 5), SY + 5, C.ink, { maxW: x1 - x0 - 8 }));
  });

  css.push('@media (prefers-reduced-motion:reduce){*{animation:none!important}}');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Castaway, drawn as a file-sharing client window: downloads of island gags above, uploads below, and a preview of the island.">`
    + '<title>Castaway</title>'
    + `<style>${css.join('')}</style>`
    + `<defs>${defs.join('')}${ui.defs()}${uib.defs()}</defs>`
    + body.join('')
    + '</svg>';
  return svg;
}

fs.mkdirSync(ASSETS, { recursive: true });
const out = build();
const file = path.join(ASSETS, `${SLUG}.svg`);
fs.writeFileSync(file, out);
console.log(`${path.relative(process.cwd(), file)}  ${(out.length / 1024).toFixed(1)} KB`);
