#!/usr/bin/env node
// CASTAWAY README header: "Classic Screensaver Set" (97-classic-saver-set_opus_5.5).
// Plain Node, no dependencies, fully deterministic (seeded PRNG, no clock).
//   node examples/castaway/src/97-classic-saver-set_opus_5.5.mjs
// writes
//   examples/castaway/assets/97-classic-saver-set_opus_5.5.svg        (the saver)
//   examples/castaway/assets/97-classic-saver-set_opus_5.5-setup.svg  (its Setup dialog)
//
// The style (catalogue entry idle-05) is the plain screen-saver set that came
// in the box with Windows 3.1: Mystify's two bouncing quadrilaterals trailing
// colour-shifting ribbons, the Starfield Simulation flying through white dots,
// Marquee crawling one line of big text in whatever font you picked, and a
// small grey Setup dialog with a Fast/Slow scroll bar, OK and Cancel. No logo,
// name, wordmark, icon or font of the real thing is used: every glyph here is
// drawn in this file, and the "flying" variant flies our own island mark.
//
// The joke. Castaway is a stationary-frame video you leave on for ten hours,
// which is exactly the thing screen savers were invented to protect you from.
// So the saver behaves like the video: Mystify idles, bouncing about for no
// reason, and every so often, always on the bar line (3 s at 80 BPM), its two
// polygons snap into something from the island's schedule for a bar or two:
// a ship, a message in a bottle, a sandcastle the tide takes, a shark fin
// nodding on the beat, an iced coffee with a straw. Then they fly apart as
// if nothing happened.
//
// The title is set the way Marquee set text: one big line in a TrueType-ish
// serif with no anti-aliasing, so every curve and diagonal is a staircase.
// That serif is not a copy of any real typeface: it is built here from a few
// polygons and an elliptical pen, then rasterised at the pixel centres.
//
// Motion: Mystify is SMIL (<animate> on polygon points), one 60 s loop: 20
// bars of 3 s, the same length as the theme. Each vertex bounces off the
// edges in straight lines; between gags the paths are solved so that every
// vertex lands exactly where the next shape needs it, on the bar. Trails are
// the same animation started a little later. Seven bars of twenty are gags,
// so the saver is busy about a third of the time, like her. The marquee and
// the starfield are CSS. Reduced motion swaps the SMIL layer for a still
// frame (the ship, mid-crossing, with its caption) and pauses the CSS.

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const SLUG = '97-classic-saver-set_opus_5.5';
const OUT_MAIN = resolve(here, `../assets/${SLUG}.svg`);
const OUT_SETUP = resolve(here, `../assets/${SLUG}-setup.svg`);

// ---------------------------------------------------------------- basics
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
const rand = mulberry32(1992); // the project's default seed
const rr = (a, b) => a + (b - a) * rand();
const f1 = (v) => String(+v.toFixed(1));
const f2 = (v) => String(+v.toFixed(2));

// ---------------------------------------------------------------- palette
const C = {
  black: '#000000',
  rim: '#3b3f46',
  face: '#c0c0c0', // the grey of every dialog of the era
  hi: '#ffffff',
  shadow: '#808080',
  navy: '#000080',
  ink: '#000000',
  title: '#ffe45c', // the user-chosen Marquee colour: sun yellow
  marquee: '#6cf0ff', // second Marquee line: lagoon cyan
  caption: '#c8c8c8',
  dim: '#8a8a8a',
};

// ---------------------------------------------------------------- pixel font
// A proportional "dialog" sans, cap height 7, 2-row descenders, in the spirit
// of the small system font of the era (drawn here, not copied). Bold is made
// the way GDI made it: every row OR-ed with itself shifted one pixel right.
const UI = {
  A: '.###.|#...#|#...#|#####|#...#|#...#|#...#',
  B: '####.|#...#|#...#|####.|#...#|#...#|####.',
  C: '.###.|#...#|#....|#....|#....|#...#|.###.',
  D: '####.|#...#|#...#|#...#|#...#|#...#|####.',
  E: '#####|#....|#....|####.|#....|#....|#####',
  F: '#####|#....|#....|####.|#....|#....|#....',
  G: '.###.|#...#|#....|#.###|#...#|#...#|.####',
  H: '#...#|#...#|#...#|#####|#...#|#...#|#...#',
  I: '###|.#.|.#.|.#.|.#.|.#.|###',
  J: '..###|...#.|...#.|...#.|...#.|#..#.|.##..',
  K: '#...#|#..#.|#.#..|##...|#.#..|#..#.|#...#',
  L: '#....|#....|#....|#....|#....|#....|#####',
  M: '#...#|##.##|#.#.#|#.#.#|#...#|#...#|#...#',
  N: '#...#|##..#|#.#.#|#.#.#|#.#.#|#..##|#...#',
  O: '.###.|#...#|#...#|#...#|#...#|#...#|.###.',
  P: '####.|#...#|#...#|####.|#....|#....|#....',
  Q: '.###.|#...#|#...#|#...#|#.#.#|#..#.|.##.#',
  R: '####.|#...#|#...#|####.|#.#..|#..#.|#...#',
  S: '.###.|#...#|#....|.###.|....#|#...#|.###.',
  T: '#####|..#..|..#..|..#..|..#..|..#..|..#..',
  U: '#...#|#...#|#...#|#...#|#...#|#...#|.###.',
  V: '#...#|#...#|#...#|#...#|.#.#.|.#.#.|..#..',
  W: '#...#|#...#|#...#|#.#.#|#.#.#|##.##|#...#',
  X: '#...#|#...#|.#.#.|..#..|.#.#.|#...#|#...#',
  Y: '#...#|#...#|.#.#.|..#..|..#..|..#..|..#..',
  Z: '#####|....#|...#.|..#..|.#...|#....|#####',
  a: '....|....|.##.|...#|.###|#..#|.###',
  b: '#...|#...|###.|#..#|#..#|#..#|###.',
  c: '...|...|.##|#..|#..|#..|.##',
  d: '...#|...#|.###|#..#|#..#|#..#|.###',
  e: '....|....|.##.|#..#|####|#...|.###',
  f: '.##|#..|###|#..|#..|#..|#..',
  g: '....|....|.###|#..#|#..#|#..#|.###|...#|.##.',
  h: '#...|#...|###.|#..#|#..#|#..#|#..#',
  i: '#|.|#|#|#|#|#',
  j: '.#|..|.#|.#|.#|.#|.#|.#|#.',
  k: '#...|#...|#..#|#.#.|##..|#.#.|#..#',
  l: '#|#|#|#|#|#|#',
  m: '.....|.....|####.|#.#.#|#.#.#|#.#.#|#.#.#',
  n: '....|....|###.|#..#|#..#|#..#|#..#',
  o: '....|....|.##.|#..#|#..#|#..#|.##.',
  p: '....|....|###.|#..#|#..#|#..#|###.|#...|#...',
  q: '....|....|.###|#..#|#..#|#..#|.###|...#|...#',
  r: '...|...|#.#|##.|#..|#..|#..',
  s: '....|....|.###|#...|.##.|...#|###.',
  t: '.#.|.#.|###|.#.|.#.|.#.|..#',
  u: '....|....|#..#|#..#|#..#|#..#|.###',
  v: '.....|.....|#...#|#...#|.#.#.|.#.#.|..#..',
  w: '.....|.....|#...#|#.#.#|#.#.#|#.#.#|.#.#.',
  x: '....|....|#..#|#..#|.##.|#..#|#..#',
  y: '....|....|#..#|#..#|#..#|#..#|.###|...#|.##.',
  z: '....|....|####|...#|.##.|#...|####',
  0: '.##.|#..#|#..#|#..#|#..#|#..#|.##.',
  1: '.#.|##.|.#.|.#.|.#.|.#.|###',
  2: '.##.|#..#|...#|..#.|.#..|#...|####',
  3: '.##.|#..#|...#|.##.|...#|#..#|.##.',
  4: '..#.|.##.|#.#.|#.#.|####|..#.|..#.',
  5: '####|#...|###.|...#|...#|#..#|.##.',
  6: '.##.|#...|#...|###.|#..#|#..#|.##.',
  7: '####|...#|..#.|..#.|.#..|.#..|.#..',
  8: '.##.|#..#|#..#|.##.|#..#|#..#|.##.',
  9: '.##.|#..#|#..#|.###|...#|...#|.##.',
  '.': '.|.|.|.|.|.|#',
  ',': '..|..|..|..|..|..|.#|#.',
  ':': '.|.|#|.|.|.|#',
  ';': '..|..|.#|..|..|..|.#|#.',
  "'": '#|#|.|.|.|.|.',
  '"': '#.#|#.#|...|...|...|...|...',
  '!': '#|#|#|#|#|.|#',
  '?': '.##.|#..#|...#|..#.|.#..|....|.#..',
  '(': '..#|.#.|#..|#..|#..|.#.|..#',
  ')': '#..|.#.|..#|..#|..#|.#.|#..',
  '[': '##|#.|#.|#.|#.|#.|##',
  ']': '##|.#|.#|.#|.#|.#|##',
  '/': '....#|...#.|...#.|..#..|.#...|.#...|#....',
  '-': '...|...|...|###|...|...|...',
  _: '....|....|....|....|....|....|....|####',
  '+': '.....|..#..|..#..|#####|..#..|..#..|.....',
  '=': '....|....|####|....|####|....|....',
  '<': '...|..#|.#.|#..|.#.|..#|...',
  '>': '...|#..|.#.|..#|.#.|#..|...',
  '%': '##..#|##.#.|...#.|..#..|.#...|.#.##|#..##',
  '&': '.##..|#..#.|#.#..|.#...|#.#.#|#..#.|.##.#',
  '·': '.|.|.|#|.|.|.',
  '•': '..|..|##|##|..|..|..',
  '♪': '..#..|..##.|..#.#|..#..|###..|###..|.....',
  '…': '.....|.....|.....|.....|.....|.....|#.#.#',
  '~': '.....|.....|.#..#|#.##.|.....|.....|.....',
};
const SPACE = 3;
// Smearing a row one pixel right closes every one-pixel gap, which turns m, w
// and v into solid blocks. A bold face of the era got its own cuts for those
// letters, so these are drawn by hand, two-pixel stems with the gaps kept open.
const UI_BOLD = {
  m: '........|........|#######.|##.##.##|##.##.##|##.##.##|##.##.##',
  w: '........|........|##....##|##.##.##|##.##.##|##.##.##|.##..##.',
  v: '.......|.......|##...##|##...##|.##.##.|.##.##.|..###..',
  r: '.....|.....|##.##|####.|##...|##...|##...',
  k: '##....|##....|##..##|##.##.|####..|##.##.|##..##',
};

function glyphRows(ch, bold) {
  if (bold && UI_BOLD[ch]) return UI_BOLD[ch].split('|');
  const src = UI[ch];
  if (!src) throw new Error(`no glyph for ${JSON.stringify(ch)}`);
  let rows = src.split('|');
  if (bold) rows = rows.map((r) => (r + '.').split('').map((c, i, a) => (c === '#' || (i > 0 && a[i - 1] === '#') ? '#' : '.')).join(''));
  return rows;
}
const glyphW = (ch, bold) => (ch === ' ' ? SPACE + (bold ? 1 : 0) : glyphRows(ch, bold)[0].length);

// merge a boolean grid into rects: horizontal runs, then identical runs stacked
function mergeGrid(grid) {
  const h = grid.length;
  const runsByRow = [];
  for (let y = 0; y < h; y++) {
    const row = grid[y];
    const runs = [];
    let x = 0;
    while (x < row.length) {
      if (row[x]) {
        const s = x;
        while (x < row.length && row[x]) x++;
        runs.push([s, x - s]);
      } else x++;
    }
    runsByRow.push(runs);
  }
  const rects = [];
  const open = new Map(); // "x,w" -> rect
  for (let y = 0; y < h; y++) {
    const next = new Map();
    for (const [x, w] of runsByRow[y]) {
      const k = `${x},${w}`;
      if (open.has(k)) {
        const r = open.get(k);
        r.h++;
        next.set(k, r);
      } else {
        const r = { x, y, w, h: 1 };
        rects.push(r);
        next.set(k, r);
      }
    }
    open.clear();
    for (const [k, v] of next) open.set(k, v);
  }
  return rects;
}
const rectsSvg = (rects, s = 1, ox = 0, oy = 0) =>
  rects.map((r) => `<rect x="${f2(ox + r.x * s)}" y="${f2(oy + r.y * s)}" width="${f2(r.w * s)}" height="${f2(r.h * s)}"/>`).join('');

// Glyph library: each used glyph becomes one <g id> in <defs>, drawn in font
// pixels; text is a scaled group of <use> elements that inherit the fill.
function makeFont(prefix) {
  const used = new Map();
  const id = (ch, bold) => {
    const key = `${bold ? 'b' : 'r'}${ch.codePointAt(0)}`;
    if (!used.has(key)) used.set(key, { ch, bold });
    return `${prefix}${key}`;
  };
  return {
    measure(str, bold = false) {
      let w = 0;
      for (const ch of str) w += glyphW(ch, bold) + 1;
      return w - 1;
    },
    // returns svg for a text line; x,y = top-left of the cap height
    text(str, x, y, s, fill, { bold = false, align = 'left', extra = '' } = {}) {
      const w = this.measure(str, bold);
      let ox = x;
      if (align === 'center') ox = x - (w * s) / 2;
      if (align === 'right') ox = x - w * s;
      let out = `<g transform="translate(${f2(ox)} ${f2(y)}) scale(${s})" fill="${fill}"${extra}>`;
      let cx = 0;
      for (const ch of str) {
        if (ch !== ' ') out += `<use href="#${id(ch, bold)}" x="${cx}"/>`;
        cx += glyphW(ch, bold) + 1;
      }
      return { svg: out + '</g>', w: w * s, x0: ox };
    },
    defs() {
      let out = '';
      for (const [key, { ch, bold }] of used) {
        const rows = glyphRows(ch, bold);
        const grid = rows.map((r) => r.split('').map((c) => c === '#'));
        out += `<g id="${prefix}${key}">${rectsSvg(mergeGrid(grid))}</g>`;
      }
      return out;
    },
  };
}

// ---------------------------------------------------------------- the title
// A bookish serif drawn from polygons and an elliptical pen, then rasterised
// at pixel centres with no anti-aliasing, like big TrueType text in 1992.
// Units: title pixels; cap height 30, baseline at y = 30.
const CAP = 30;
const poly = (...pts) => ({ kind: 'poly', pts });
const box = (x0, y0, x1, y1) => poly([x0, y0], [x1, y0], [x1, y1], [x0, y1]);
// diagonal stroke between a top edge [l, r] at y0 and a bottom edge [l, r] at y1
const diag = (y0, tl, tr, y1, bl, br) => poly([tl, y0], [tr, y0], [br, y1], [bl, y1]);
function catmull(points, steps = 24) {
  const out = [];
  const P = [points[0], ...points, points[points.length - 1]];
  for (let i = 1; i < P.length - 2; i++) {
    const [p0, p1, p2, p3] = [P[i - 1], P[i], P[i + 1], P[i + 2]];
    for (let s = 0; s < steps; s++) {
      const t = s / steps;
      const t2 = t * t;
      const t3 = t2 * t;
      const c = (a, b, cc, d) => 0.5 * (2 * b + (-a + cc) * t + (2 * a - 5 * b + 4 * cc - d) * t2 + (-a + 3 * b - 3 * cc + d) * t3);
      out.push([c(p0[0], p1[0], p2[0], p3[0]), c(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  out.push(points[points.length - 1]);
  return out;
}
const pen = (samples, a, b, angDeg) => ({ kind: 'pen', samples, a, b, ang: (angDeg * Math.PI) / 180 });
function arc(cx, cy, rx, ry, a0, a1, n = 160) {
  const out = [];
  for (let i = 0; i <= n; i++) {
    const t = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180;
    out.push([cx + rx * Math.cos(t), cy + ry * Math.sin(t)]);
  }
  return out;
}
// densify a sampled path so the pen leaves no gaps
function densify(pts, step = 0.15) {
  const out = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / step));
    for (let k = 1; k <= n; k++) out.push([x0 + ((x1 - x0) * k) / n, y0 + ((y1 - y0) * k) / n]);
  }
  return out;
}
const PEN = { a: 2.75, b: 0.72, ang: -14 };
const GLYPHS = {
  C: {
    w: 26,
    shapes: [
      pen(densify(arc(13.7, 15, 10.9, 14.55, -40, -320)), PEN.a, PEN.b, PEN.ang),
      box(21.3, 0.6, 23.3, 10.2), // top beak
    ],
  },
  A: {
    w: 28,
    shapes: [
      diag(-0.7, 12.6, 14.5, 30, 2.5, 4.4), // thin left stroke
      diag(-0.7, 12.4, 17.3, 30, 21.0, 25.9), // thick right stroke
      box(6.4, 18.9, 19.2, 20.9), // crossbar
      box(0, 28.4, 7.6, 30), // feet
      box(18.6, 28.4, 28, 30),
    ],
  },
  S: {
    w: 20,
    shapes: [
      pen(
        densify(catmull([
          [17.4, 5.2], [15.4, 1.7], [10.4, 0.3], [5.2, 1.7], [3.0, 6.1], [4.9, 10.7], [9.8, 13.9],
          [14.6, 16.7], [17.2, 21.4], [15.7, 27.2], [10.0, 29.7], [4.6, 28.5], [2.0, 24.6],
        ])),
        2.6, 0.72, PEN.ang,
      ),
      box(16.6, 0.6, 18.6, 8.6), // top beak
      box(1.0, 22.0, 3.0, 29.6), // bottom beak
    ],
  },
  T: {
    w: 24,
    shapes: [
      box(0, 0, 24, 2.2),
      box(0, 0, 1.7, 6.8),
      box(22.3, 0, 24, 6.8),
      box(9.5, 0, 14.6, 30),
      box(5.6, 28.4, 18.5, 30),
    ],
  },
  W: {
    w: 38,
    shapes: [
      diag(0, 1.5, 6.4, 30.6, 8.8, 12.2),
      diag(0, 17.4, 19.3, 30.6, 10.4, 12.2),
      diag(0, 16.9, 21.8, 30.6, 24.4, 27.8),
      diag(0, 33.7, 35.6, 30.6, 26.2, 27.8),
      box(0, 0, 8.6, 1.6),
      box(14.8, 0, 22.6, 1.6),
      box(31.2, 0, 38, 1.6),
    ],
  },
  Y: {
    w: 28,
    shapes: [
      diag(0, 1.7, 6.8, 17, 11.6, 16.5),
      diag(0, 21.6, 23.5, 17, 14.6, 16.5),
      box(11.6, 16, 16.5, 30),
      box(0, 0, 9.0, 1.6),
      box(19.4, 0, 27.6, 1.6),
      box(7.7, 28.4, 20.4, 30),
    ],
  },
};
const KERN = { CA: -0.5, AS: -0.5, ST: -0.5, TA: -2.5, AW: -3, WA: -3, AY: -3 };
const TRACK = 2.2;

function insidePoly(px, py, pts) {
  let c = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i];
    const [xj, yj] = pts[j];
    if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}
function insidePen(px, py, s) {
  const ca = Math.cos(s.ang);
  const sa = Math.sin(s.ang);
  for (const [x, y] of s.samples) {
    const dx = px - x;
    const dy = py - y;
    if (Math.abs(dx) > s.a + 0.1 || Math.abs(dy) > s.a + 0.1) continue;
    const u = dx * ca + dy * sa;
    const v = -dx * sa + dy * ca;
    if ((u * u) / (s.a * s.a) + (v * v) / (s.b * s.b) <= 1) return true;
  }
  return false;
}
function rasterTitle(word) {
  const placed = [];
  let x = 0;
  for (let i = 0; i < word.length; i++) {
    const ch = word[i];
    if (i > 0) x += TRACK + (KERN[word[i - 1] + ch] || 0);
    placed.push({ g: GLYPHS[ch], x });
    x += GLYPHS[ch].w;
  }
  const W = Math.ceil(x) + 2;
  const top = -2;
  const H = CAP + 4;
  const grid = [];
  for (let j = 0; j < H; j++) {
    const row = [];
    for (let i = 0; i < W; i++) {
      const px = i + 0.5 - 1;
      const py = j + 0.5 + top;
      let on = false;
      for (const { g, x: gx } of placed) {
        const lx = px - gx;
        if (lx < -3 || lx > g.w + 3) continue;
        for (const s of g.shapes) {
          if (s.kind === 'poly' ? insidePoly(lx, py, s.pts) : insidePen(lx, py, s)) {
            on = true;
            break;
          }
        }
        if (on) break;
      }
      row.push(on);
    }
    grid.push(row);
  }
  // trim empty rows top and bottom
  let t0 = 0;
  while (t0 < grid.length && !grid[t0].some(Boolean)) t0++;
  let t1 = grid.length - 1;
  while (t1 > 0 && !grid[t1].some(Boolean)) t1--;
  return { grid: grid.slice(t0, t1 + 1), W, capTop: top + t0 };
}
// ---------------------------------------------------------------- Mystify
const SW = 1200; // saver screen
const SH = 560;
const L = 60; // loop, seconds: 20 bars of 3 s, the same as the theme
const BAR = 3;
const BEAT = 0.75;
const BX = [14, 1186];
const BY = [14, 466]; // the marquee lane below is left alone
const COPIES = 8; // head + trail
const LAG = 0.09; // seconds between trail copies
const STILL_T = 9.4; // reduced-motion frame: the ship, mid-crossing
// The loop opens one bar into the ship (still on a bar line), so the first
// frame is a picture and its caption rather than a tangle behind the title.
const PHASE = 9;

const rot = (pts, cx, cy, deg) => {
  const a = (deg * Math.PI) / 180;
  return pts.map(([x, y]) => [cx + (x - cx) * Math.cos(a) - (y - cy) * Math.sin(a), cy + (x - cx) * Math.sin(a) + (y - cy) * Math.cos(a)]);
};
const nod = (tau) => (Math.round(tau / BEAT) % 2 === 1 ? 1 : 0); // 0,1,0,1,0 on the beats
const beats = (bars) => Array.from({ length: bars * 4 + 1 }, (_, i) => i * BEAT);
// Each gag starts on a bar line and holds for `bars` bars. shape(tau) gives
// the four corners of polygon 0 and polygon 1 at hold time tau. Seven bars of
// twenty are gags, so the saver is busy about a third of the time. Like her.
const GAGS = [
  {
    key: 'ship',
    t0: 6,
    bars: 2,
    shape(tau) {
      const ox = 56 + 17 * tau;
      const bob = 3 * nod(tau);
      return [
        [[ox, 420 + bob], [ox + 186, 420 + bob], [ox + 158, 455 + bob], [ox + 28, 455 + bob]],
        [[ox + 90, 413 + bob], [ox + 90, 300 + bob], [ox + 166, 402 + bob], [ox + 126, 411 + bob]],
      ];
    },
    caption: ['a ship. she was busy.'],
    cap: { x: 380, y: 352, align: 'left' },
  },
  {
    key: 'bottle',
    t0: 21,
    bars: 1,
    shape(tau) {
      const cx = 936 - 10 * tau;
      const cy = 394 - 7 * nod(tau);
      // body, then shoulders and neck as one tapering quad: a bottle, not a
      // USB stick (two plain rectangles read as the latter)
      const body = [[cx - 74, cy - 25], [cx + 22, cy - 25], [cx + 22, cy + 25], [cx - 74, cy + 25]];
      const neck = [[cx + 22, cy - 25], [cx + 98, cy - 7], [cx + 98, cy + 7], [cx + 22, cy + 25]];
      const ang = -22 + 6 * nod(tau);
      return [rot(body, cx, cy, ang), rot(neck, cx, cy, ang)];
    },
    caption: ['a message in a bottle.', 'it washes straight back.'],
    cap: { x: 826, y: 330, align: 'right' },
  },
  {
    key: 'castle',
    t0: 30,
    bars: 1,
    // the tide takes it: two beats standing, then flattened in two steps
    times: [0, 1.5, 1.52, 2.25, 2.27, 3],
    shape(tau) {
      const cx = 300;
      const f = tau < 1.51 ? 0 : tau < 2.26 ? 0.55 : 1; // stepped, like the video's motion
      const g = 456;
      const baseTop = 406 + (447 - 406) * f;
      const towerTop = 330 + (441 - 330) * f;
      const towerBot = baseTop;
      const spread = 14 * f;
      const lean = 8 * f;
      return [
        [[cx - 84 - spread, g], [cx - 64, baseTop], [cx + 64, baseTop], [cx + 84 + spread, g]],
        [[cx - 36 + lean, towerBot], [cx - 26 + lean * 2, towerTop], [cx + 26 + lean * 2, towerTop], [cx + 36 + lean, towerBot]],
      ];
    },
    caption: ['a sandcastle.', 'the tide takes it.'],
    cap: { x: 410, y: 360, align: 'left' },
  },
  {
    key: 'shark',
    t0: 39,
    bars: 2,
    shape(tau) {
      const bx = 640 - 18 * tau;
      const tip = 10 * nod(tau);
      return [
        [[bx - 54, 452], [bx + 8 + tip, 340], [bx + 20 + tip * 0.5, 408], [bx + 56, 452]],
        [[bx - 170, 452], [bx - 64, 443], [bx + 64, 461], [bx + 170, 452]],
      ];
    },
    caption: ['a shark in headphones,', 'nodding on the beat.'],
    cap: { x: 720, y: 330, align: 'left' },
  },
  {
    key: 'coffee',
    t0: 51,
    bars: 1,
    shape(tau) {
      const dy = 6 * nod(tau);
      return [
        [[980, 336], [1094, 336], [1078, 458], [996, 458]],
        [[1040, 372 + dy], [1070, 294 + dy], [1081, 298 + dy], [1051, 376 + dy]],
      ];
    },
    caption: ['she could leave any time.', 'she came back with an iced coffee.'],
    cap: { x: 950, y: 352, align: 'right' },
  },
];
const holdEnd = (g) => g.t0 + g.bars * BAR;

// one coordinate's bouncing path between two fixed points, solved in the
// unfolded (mirror) space so it hits the walls and still arrives on time
function idlePath(ta, xa, tb, xb, lo, hi, speed, dir) {
  const R = hi - lo;
  const T = tb - ta;
  const ua = xa - lo;
  const want = ua + dir * speed * T;
  // candidates: every mirror image of the target; keep the ones that make the
  // vertex travel at a believable speed, and take the nearest to the wish
  let best = null;
  let fallback = null;
  const n0 = Math.floor(want / (2 * R));
  for (let n = n0 - 3; n <= n0 + 3; n++) {
    for (const c of [2 * n * R + (xb - lo), 2 * n * R - (xb - lo)]) {
      if (fallback === null || Math.abs(c - want) < Math.abs(fallback - want)) fallback = c;
      const v = Math.abs(c - ua) / T;
      if (v < speed * 0.7 || v > speed * 1.45) continue;
      if (best === null || Math.abs(c - want) < Math.abs(best - want)) best = c;
    }
  }
  if (best === null) best = fallback;
  const ub = best;
  const keys = [];
  const k0 = Math.min(ua, ub);
  const k1 = Math.max(ua, ub);
  const walls = [];
  for (let k = Math.ceil(k0 / R + 1e-9); k * R < k1 - 1e-9; k++) walls.push(k);
  if (ub < ua) walls.reverse();
  for (const k of walls) {
    const t = ta + ((k * R - ua) / (ub - ua)) * T;
    keys.push([t, k % 2 === 0 ? lo : hi]);
  }
  return keys;
}

// value of a short list of [t, v] keys at time t (no wrapping)
function evalKeys(keys, t) {
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const [ta, va] = keys[i - 1];
      const [tb, vb] = keys[i];
      return tb === ta ? vb : va + ((vb - va) * (t - ta)) / (tb - ta);
    }
  }
  return keys[keys.length - 1][1];
}
// How "Mystify" one polygon looks over an idle stretch: the real saver's
// quads are big and open, so reward the shorter side of the bounding box and
// punish the moments the four corners line up into a thin sliver.
function openness(polyKeys, ta, tb) {
  let sum = 0;
  let thin = 0;
  let n = 0;
  for (let t = ta + 0.5; t < tb - 0.5; t += 0.1) {
    const pts = polyKeys.map((v) => [evalKeys(v[0], t), evalKeys(v[1], t)]);
    const xs = pts.map((q) => q[0]);
    const ys = pts.map((q) => q[1]);
    const m = Math.min(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
    sum += Math.min(m, 260);
    if (m < 90) thin++;
    n++;
  }
  return n ? sum / n - (400 * thin) / n : 0;
}
const CANDIDATES = 24; // seeded tries per idle stretch; the most open one wins

// piecewise-linear keyframes for every coordinate of both polygons
function buildMystify() {
  // [poly][vertex][axis] -> [[t, v], ...] over [GAGS[0].t0, +L]
  const tracks = [0, 1].map(() => [0, 1, 2, 3].map(() => [[], []]));
  for (let p = 0; p < 2; p++) {
    for (let g = 0; g < GAGS.length; g++) {
      const gag = GAGS[g];
      for (let v = 0; v < 4; v++)
        for (let ax = 0; ax < 2; ax++)
          for (const tau of gag.times || beats(gag.bars)) tracks[p][v][ax].push([gag.t0 + tau, gag.shape(tau)[p][v][ax]]);
      const next = GAGS[(g + 1) % GAGS.length];
      const tb = next.t0 + (g === GAGS.length - 1 ? L : 0);
      const ta = holdEnd(gag);
      let best = null;
      for (let c = 0; c < CANDIDATES; c++) {
        const cand = [0, 1, 2, 3].map((v) =>
          [0, 1].map((ax) => {
            const [lo, hi] = ax === 0 ? BX : BY;
            const xa = gag.shape(gag.bars * BAR)[p][v][ax];
            const xb = next.shape(0)[p][v][ax];
            const speed = ax === 0 ? rr(130, 300) : rr(120, 240);
            // corners of one polygon head off in different directions, so the
            // shape opens up into a big Mystify quad instead of drifting as a clump
            const dir = ax === 0 ? (v % 2 ? 1 : -1) * (g % 2 ? 1 : -1) : ((v >> 1) % 2 ? 1 : -1) * (p ? 1 : -1);
            return [[ta, xa], ...idlePath(ta, xa, tb, xb, lo, hi, speed, dir), [tb, xb]];
          }),
        );
        const score = openness(cand, ta, tb);
        if (!best || score > best.score) best = { score, cand };
      }
      for (let v = 0; v < 4; v++) for (let ax = 0; ax < 2; ax++) tracks[p][v][ax].push(...best.cand[v][ax].slice(1, -1));
    }
    for (let v = 0; v < 4; v++) for (let ax = 0; ax < 2; ax++) tracks[p][v][ax].push([GAGS[0].t0 + L, GAGS[0].shape(0)[p][v][ax]]);
  }
  return tracks;
}
function evalTrack(keys, t) {
  const t0 = GAGS[0].t0;
  let tt = t;
  while (tt < t0) tt += L;
  while (tt > t0 + L) tt -= L;
  for (let i = 1; i < keys.length; i++) {
    if (tt <= keys[i][0]) {
      const [ta, va] = keys[i - 1];
      const [tb, vb] = keys[i];
      return tb === ta ? vb : va + ((vb - va) * (tt - ta)) / (tb - ta);
    }
  }
  return keys[keys.length - 1][1];
}
// all breakpoints of one polygon, snapped to the keyTimes grid (1/10000 of
// the loop) and de-duplicated; values are then evaluated at the snapped times
function polyTimeline(tracksP) {
  const q = (t) => Math.round(((((t % L) + L) % L) / L) * 10000);
  const set = new Set([0, 10000]);
  for (const v of tracksP) for (const axis of v) for (const [t] of axis) set.add(q(t));
  return [...set].sort((a, b) => a - b).map((k) => (k * L) / 10000);
}
const ptsAt = (tracksP, t) => tracksP.map((v) => `${Math.round(evalTrack(v[0], t))},${Math.round(evalTrack(v[1], t))}`).join(' ');

function hsl(h, s, l) {
  h = ((h % 360) + 360) % 360;
  s /= 100;
  l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const hex = (x) => Math.round(x * 255).toString(16).padStart(2, '0');
  return `#${hex(f(0))}${hex(f(8))}${hex(f(4))}`;
}
const HUE_PERIOD = 20; // divides the 60 s loop
const hueList = (h0) => {
  const out = [];
  for (let i = 0; i <= 12; i++) out.push(hsl(h0 + i * 30, 100, i % 2 ? 62 : 58));
  return out;
};

// ---------------------------------------------------------------- main svg
function buildMain() {
  const font = makeFont('m');

  // title
  const T = rasterTitle('CASTAWAY');
  const PX = 4;
  const tw = T.grid[0].length * PX;
  const tx = Math.round((SW - tw) / 2 / PX) * PX;
  const ty = 96;
  // the letters are drawn once, in title pixels; a 1-pixel black halo (the
  // same letters stamped at the eight neighbouring offsets) keeps the lines
  // passing behind from ever touching them
  const titleDef = `<g id="ttl">${rectsSvg(mergeGrid(T.grid))}</g>`;
  const halo8 = [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]];
  const titleSvg =
    `<g class="px" transform="translate(${tx} ${ty}) scale(${PX})">` +
    `<g fill="${C.black}">${halo8.map(([dx, dy]) => `<use href="#ttl" x="${dx}" y="${dy}"/>`).join("")}</g>` +
    `<use href="#ttl" fill="${C.title}"/></g>`;
  const titleBottom = ty + T.grid.length * PX;

  // subtitle in an opaque text cell, the way GDI painted text
  const sub = font.text('a ten-hour lo-fi island video in which almost nothing happens, on purpose', SW / 2, titleBottom + 30, 3, C.caption, { align: 'center' });
  const subBg = `<rect x="${f1(sub.x0 - 10)}" y="${f1(titleBottom + 20)}" width="${f1(sub.w + 20)}" height="${f1(7 * 3 + 20)}" fill="${C.black}"/>`;

  // Mystify
  const tracks = buildMystify();
  const hues = [hueList(330), hueList(165)];
  let anim = '';
  let still = '';
  for (let p = 0; p < 2; p++) {
    const tl = polyTimeline(tracks[p]);
    const values = tl.map((t) => ptsAt(tracks[p], t)).join(';');
    const keyTimes = tl.map((t) => String(+(t / L).toFixed(4))).join(';');
    const cols = hues[p].join(';');
    for (let k = COPIES - 1; k >= 0; k--) {
      const op = f2(1 - (k / COPIES) * 0.86);
      const b0 = k * LAG - PHASE;
      const begin = `${f2(b0 > 0 ? b0 - L : b0)}s`;
      const beginC = k === 0 ? '0s' : `${f2(k * LAG - HUE_PERIOD)}s`;
      anim +=
        `<polygon opacity="${op}" stroke="${hues[p][0]}" points="${ptsAt(tracks[p], PHASE - k * LAG)}">` +
        `<animate attributeName="points" dur="${L}s" begin="${begin}" repeatCount="indefinite" keyTimes="${keyTimes}" values="${values}"/>` +
        `<animate attributeName="stroke" dur="${HUE_PERIOD}s" begin="${beginC}" repeatCount="indefinite" values="${cols}"/>` +
        `</polygon>`;
      const tS = STILL_T - k * LAG;
      const hIdx = (((tS % HUE_PERIOD) + HUE_PERIOD) % HUE_PERIOD) / HUE_PERIOD * 12;
      still += `<polygon opacity="${op}" stroke="${hues[p][Math.round(hIdx) % 12]}" points="${ptsAt(tracks[p], tS)}"/>`;
    }
  }

  // gag captions: on for exactly the bar the shape holds
  let caps = '';
  let capStill = '';
  for (const g of GAGS) {
    let lines = '';
    let bg = '';
    g.caption.forEach((line, i) => {
      const y = g.cap.y + i * 30;
      const t = font.text(line, g.cap.x, y, 3, C.caption, { align: g.cap.align });
      bg += `<rect x="${f1(t.x0 - 9)}" y="${f1(y - 8)}" width="${f1(t.w + 18)}" height="${i === g.caption.length - 1 ? 38 : 30}"/>`;
      lines += t.svg;
    });
    const body = `<g fill="${C.black}">${bg}</g>${lines}`;
    const on = g.t0 / L;
    const off = (holdEnd(g) + 0.4) / L;
    const shown = PHASE >= g.t0 && PHASE < holdEnd(g) + 0.4;
    caps += `<g opacity="${shown ? 1 : 0}"><animate attributeName="opacity" dur="${L}s" begin="${f2(-PHASE)}s" repeatCount="indefinite" calcMode="discrete" keyTimes="0;${+on.toFixed(5)};${+off.toFixed(5)}" values="0;1;0"/>${body}</g>`;
    if (g.key === 'ship') capStill = body;
  }

  // Marquee lane
  const MQ_Y = 498;
  const MQ_S = 4;
  const mqText =
    'Castaway  ♪  a lo-fi island video, ten hours long  ♪  she idles, nodding to the music on her headphones  ♪  ' +
    'every 2 to 5 minutes something happens, always on the next bar  ♪  more than 90 activities, most of them on four timers  ♪  ' +
    'every sound is synthesized from code  ♪  python tools/serve.py, then open http://127.0.0.1:8765/  ♪  always daytime  ♪  ';
  const mq = font.text(mqText, 0, 0, 1, C.marquee, { bold: true });
  const mqW = (mq.w + 1) * MQ_S; // one full period in screen units
  const MQ_SPEED = 96;
  const mqDur = mqW / MQ_SPEED;
  const mqInner = mq.svg.replace(/^<g [^>]*>/, '').replace(/<\/g>$/, '');
  const marquee =
    `<g clip-path="url(#mqclip)"><g class="mq">` +
    `<g id="mqline" transform="translate(24 ${MQ_Y}) scale(${MQ_S})" fill="${C.marquee}">${mqInner}</g>` +
    `<use href="#mqline" x="${f1(mqW)}"/>` +
    `</g></g>`;

  const css = `
.px{shape-rendering:crispEdges}
.mys polygon{fill:none;stroke-width:2;shape-rendering:crispEdges;vector-effect:non-scaling-stroke}
.still{display:none}
.mq{animation:mq ${f2(mqDur)}s linear infinite}
@keyframes mq{from{transform:translateX(0)}to{transform:translateX(-${f1(mqW)}px)}}
@media (prefers-reduced-motion:reduce){.anim{display:none}.still{display:inline}.mq{animation:none}}
`;

  const defs =
    `<clipPath id="scr"><rect x="0" y="0" width="${SW}" height="${SH}" rx="18"/></clipPath>` +
    `<clipPath id="mqclip"><rect x="8" y="${MQ_Y - 12}" width="${SW - 16}" height="${9 * MQ_S + 20}"/></clipPath>` +
    titleDef +
    font.defs();

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SW} ${SH}" width="${SW}" height="${SH}" role="img" aria-label="CASTAWAY: a classic screen saver set">` +
    `<title>CASTAWAY: a classic screen saver set</title>` +
    `<style>${css}</style><defs>${defs}</defs>` +
    `<rect x="0" y="0" width="${SW}" height="${SH}" rx="18" fill="${C.black}"/>` +
    `<g clip-path="url(#scr)">` +
    `<g class="mys anim">${anim}</g>` +
    `<g class="mys still">${still}</g>` +
    titleSvg +
    subBg +
    sub.svg +
    `<g class="px anim">${caps}</g>` +
    `<g class="px still">${capStill}</g>` +
    `<g class="px">${marquee}</g>` +
    `</g>` +
    `<rect x="1" y="1" width="${SW - 2}" height="${SH - 2}" rx="17" fill="none" stroke="${C.rim}" stroke-width="2"/>` +
    `</svg>`;
  return svg;
}

// ---------------------------------------------------------------- setup svg
// The saver's Setup dialog, floating over the other saver in the set: a
// starfield flown through at warp speed, with the odd island in it (the
// "flying" variant flies our own mark, never anyone else's logo). The dialog
// is drawn in screen pixels and shown at 2x. Its Speed slider is stuck on
// Slow: every few seconds the pointer drags it towards Fast, lets go, and it
// clicks straight back.
const DW = 318; // dialog, screen pixels
const DH = 270;
const UW = 1060; // svg units
const UH = 600;
const DS = 2; // units per screen pixel
const DX = 30;
const DY = 30;
const STAR_C = [868, 300]; // where the stars come from

function buildSetup() {
  const font = makeFont('s');
  const R = (x, y, w, h, fill) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"/>`;
  const T = (str, x, y, fill = C.ink, opts = {}) => {
    const t = font.text(str, x, y, 1, fill, opts);
    if (opts.align === 'center') {
      // re-run on a whole pixel so the glyphs stay sharp
      return font.text(str, Math.round(t.x0), y, 1, fill, { ...opts, align: 'left' }).svg;
    }
    return t.svg;
  };
  const bevel = (x, y, w, h, depth = 2) => {
    let o = R(x, y, w, h, C.face);
    for (let d = 0; d < depth; d++) {
      o += R(x + d, y + d, w - 2 * d - 1, 1, C.hi) + R(x + d, y + d, 1, h - 2 * d - 1, C.hi);
      o += R(x + d, y + h - 1 - d, w - 2 * d, 1, C.shadow) + R(x + w - 1 - d, y + d, 1, h - 2 * d, C.shadow);
    }
    return o;
  };
  const button = (x, y, w, h, label, def = false) => {
    const b = def ? 2 : 1;
    let o = R(x + 1, y, w - 2, h, C.ink) + R(x, y + 1, w, h - 2, C.ink);
    o += bevel(x + b, y + b, w - 2 * b, h - 2 * b, 2);
    o += T(label, x + w / 2, y + Math.floor((h - 7) / 2), C.ink, { align: 'center' });
    return o;
  };
  const edit = (x, y, w, h, val) => R(x, y, w, h, C.ink) + R(x + 1, y + 1, w - 2, h - 2, C.hi) + T(val, x + 3, y + Math.floor((h - 7) / 2));
  const check = (x, y, on, label) => {
    let o = R(x, y, 11, 11, C.ink) + R(x + 1, y + 1, 9, 9, C.hi);
    if (on) for (let i = 0; i < 7; i++) o += R(x + 2 + i, y + 2 + i, 1, 1, C.ink) + R(x + 8 - i, y + 2 + i, 1, 1, C.ink);
    return o + T(label, x + 16, y + 2);
  };
  const group = (x, y, w, h, label) => {
    const lw = font.measure(label);
    return (
      R(x, y + 3, w, 1, C.ink) + R(x, y + h, w + 1, 1, C.ink) + R(x, y + 3, 1, h - 3, C.ink) + R(x + w, y + 3, 1, h - 3, C.ink) +
      R(x + 5, y, lw + 4, 8, C.face) + T(label, x + 7, y)
    );
  };
  const arrow = (x, y, dir) => {
    // small solid triangle, 4 rows
    let o = '';
    for (let i = 0; i < 4; i++) {
      const hh = 1 + 2 * i;
      const cx = dir < 0 ? x + i : x + 3 - i;
      o += R(cx, y + 3 - i, 1, hh, C.ink);
    }
    return o;
  };

  let d = '';
  // frame, title bar, client
  d += R(0, 0, DW, DH, C.ink) + R(1, 1, DW - 2, DH - 2, C.face) + R(4, 4, DW - 8, DH - 8, C.ink);
  d += R(5, 5, DW - 10, 18, C.navy) + R(5, 23, DW - 10, 1, C.ink) + R(5, 24, DW - 10, DH - 29, C.face);
  // control-menu box
  d += R(5, 5, 18, 18, C.face) + R(23, 5, 1, 18, C.ink);
  d += R(8, 12, 13, 5, C.ink) + R(9, 13, 11, 3, C.hi) + R(9, 17, 13, 1, C.shadow) + R(21, 13, 1, 5, C.shadow);
  d += T('Castaway Setup', (DW + 24) / 2, 10, C.hi, { bold: true, align: 'center' });

  const cx = 5;
  const cy = 24;
  const g = (x, y) => [cx + x, cy + y];
  // timers
  {
    const [x, y] = g(8, 6);
    d += group(x, y, 196, 82, 'Something happens every');
    const rows = [
      ['Regular', '2', '5', 'min'],
      ['Occasional', '12', '25', 'min'],
      ['Rare', '30', '60', 'min'],
      ['Super rare', '3', '6', 'hours'],
    ];
    rows.forEach(([lab, a, b, unit], i) => {
      const ry = y + 14 + i * 16;
      d += T(lab, x + 8, ry + 3);
      d += edit(x + 84, ry, 22, 13, a.padStart(2, ' ').replace(' ', ''));
      d += T('to', x + 111, ry + 3);
      d += edit(x + 123, ry, 22, 13, b);
      d += T(unit, x + 151, ry + 3);
    });
  }
  // buttons
  {
    const [x, y] = g(214, 8);
    d += button(x, y, 86, 22, 'OK', true);
    d += button(x, y + 28, 86, 22, 'Cancel');
    d += button(x, y + 56, 86, 22, 'Test');
  }
  // run length and seed
  {
    const [x, y] = g(214, 96);
    d += T('Length:', x, y + 3) + edit(x + 34, y, 52, 13, '10:00:00');
    d += T('Seed:', x, y + 21) + edit(x + 34, y + 18, 52, 13, '1992');
    d += T('Bar:', x, y + 39) + edit(x + 34, y + 36, 52, 13, '3 s');
  }
  // speed: Slow ... Fast (Fast is greyed out)
  let slider = '';
  let sx0 = 0;
  {
    const [x, y] = g(8, 98);
    d += T('Speed:', x, y + 3);
    d += T('Slow', x + 32, y + 3);
    const bx = x + 56;
    const bw = 116;
    sx0 = bx + 13;
    d += R(bx, y, bw, 13, C.ink) + `<rect x="${bx + 1}" y="${y + 1}" width="${bw - 2}" height="11" fill="url(#dither)"/>`;
    d += R(bx + 12, y, 1, 13, C.ink) + R(bx + bw - 13, y, 1, 13, C.ink);
    d += bevel(bx + 1, y + 1, 11, 11, 1) + arrow(bx + 4, y + 3, -1);
    d += bevel(bx + bw - 12, y + 1, 11, 11, 1) + arrow(bx + bw - 8, y + 3, 1);
    // the thumb, which gets dragged and springs back
    slider = `<g class="thumb">${R(sx0, y, 1, 13, C.ink)}${bevel(sx0 + 1, y + 1, 11, 11, 1)}${R(sx0 + 12, y, 1, 13, C.ink)}</g>`;
    // disabled text: grey with a white emboss
    d += T('Fast', x + 179, y + 4, C.hi) + T('Fast', x + 178, y + 3, C.shadow);
  }
  // check boxes
  {
    const [x, y] = g(10, 120);
    d += check(x, y, true, 'Start every gag on the next bar');
    d += check(x, y + 15, true, 'Always daytime');
    d += check(x, y + 30, true, 'Synthesize every sound from code');
    d += check(x, y + 45, false, 'Hurry');
  }
  // Marquee-style text field and its live example
  const MQ = 'python tools/serve.py, then open http://127.0.0.1:8765/';
  let example = '';
  let exW = 0;
  {
    const [x, y] = g(8, 186);
    d += T('Text:', x, y + 4);
    d += edit(x + 26, y, 266, 15, MQ);
    const [gx, gy] = g(8, 206);
    d += group(gx, gy, 292, 30, 'Text Example');
    d += R(gx + 6, gy + 10, 280, 15, C.ink);
    const line = `${MQ}   ♪   `;
    const t = font.text(line, 0, 0, 1, C.title, { bold: true });
    exW = font.measure(line, true) + 1;
    const inner = t.svg.replace(/^<g [^>]*>/, '').replace(/<\/g>$/, '');
    example =
      `<g clip-path="url(#exclip)"><g class="ex">` +
      `<g id="exline" transform="translate(${gx + 10} ${gy + 14})" fill="${C.title}">${inner}</g>` +
      `<use href="#exline" x="${exW}"/>` +
      `</g></g>`;
    d += `<clipPath id="exclip"><rect x="${gx + 7}" y="${gy + 11}" width="278" height="13"/></clipPath>`;
  }
  // pointer (our own drawing of an arrow cursor)
  const CUR = ['#', '##', '#.#', '#..#', '#...#', '#....#', '#.....#', '#..####', '#.#..#', '##.#..#', '#..#..#', '....#..#', '....###'];
  let cur = '';
  CUR.forEach((row, yy) => {
    for (let xx = 0; xx < row.length; xx++) {
      if (row[xx] === '#') cur += R(xx, yy, 1, 1, C.ink);
      else if (row[xx] === '.' && row.slice(0, xx).includes('#') && row.slice(xx).includes('#')) cur += R(xx, yy, 1, 1, C.hi);
    }
  });
  const ty = g(8, 98)[1];
  const pointer = `<g class="ptr"><g transform="translate(${sx0 + 6} ${ty + 6})">${cur}</g></g>`;

  // ---- starfield
  const srand = mulberry32(80); // 80 BPM
  const Z_END = 0.02;
  const R0 = 20; // the islands' lateral offset
  const zs = [1, 0.8, 0.6, 0.45, 0.33, 0.24, 0.17, 0.12, 0.08, 0.05, 0.03, Z_END];
  // four lateral offsets, so the stars fill the field instead of a ring
  const OFFS = [6, 13, 24, 40];
  const warpKf = OFFS.map((off, oi) =>
    `@keyframes warp${oi}{` +
    zs
      .map((z) => {
        const t = ((1 - z) / (1 - Z_END)) * 100;
        const r = off / z;
        const sc = 0.55 * Math.pow(1 / z, 0.45);
        const op = Math.min(1, (1 - z) / 0.35);
        return `${f2(t)}%{transform:translateX(${f1(r)}px) scale(${f2(sc)});opacity:${f2(op)}}`;
      })
      .join('') +
    '}',
  ).join('');
  let stars = '';
  const DUR = [4.6, 6, 7.6];
  for (let i = 0; i < 150; i++) {
    const a = srand() * 360;
    const cls = i % 3;
    const oi = Math.floor(srand() * OFFS.length);
    const delay = -srand() * DUR[cls];
    const col = srand() < 0.55 ? '#ffffff' : srand() < 0.5 ? '#c8c8c8' : '#8c8c8c';
    stars += `<g transform="rotate(${f1(a)})"><rect class="w w${cls} o${oi}" style="animation-delay:${f2(delay)}s" x="0" y="-1.2" width="2.4" height="2.4" fill="${col}"/></g>`;
  }
  // flying islands: our own mark, upright, each on its own straight path
  const ISLE = ['...ggg.ggg...', '..g...g...g..', '.g...gtg...g.', '......t......', '......t......', '.....t.......', '.....t.......', '...yyyyyyy...', '.yyyyyyyyyyy.'];
  const ICOL = { g: '#45c95a', t: '#b9773f', y: '#f4d47c' };
  let isleDef = '';
  for (const k of Object.keys(ICOL)) {
    const grid = ISLE.map((row) => row.split('').map((c) => c === k));
    isleDef += `<g fill="${ICOL[k]}">${rectsSvg(mergeGrid(grid), 1, -6.5, -4.5)}</g>`;
  }
  let isles = '';
  let isleKf = '';
  const ISLE_DUR = 9;
  const isleAngles = [200, 330, 25, 145, 280, 95];
  isleAngles.forEach((deg, i) => {
    const a = (deg * Math.PI) / 180;
    const kf = zs
      .map((z) => {
        const t = ((1 - z) / (1 - Z_END)) * 100;
        const r = R0 / z;
        const sc = 1.2 * Math.pow(1 / z, 0.55);
        const op = Math.min(1, (1 - z) / 0.4);
        return `${f2(t)}%{transform:translate(${f1(r * Math.cos(a))}px,${f1(r * Math.sin(a))}px) scale(${f2(sc)});opacity:${f2(op)}}`;
      })
      .join('');
    isleKf += `@keyframes i${i}{${kf}}`;
    isles += `<use href="#isle" class="isle" style="animation:i${i} ${ISLE_DUR}s linear infinite;animation-delay:${f2(-(i / isleAngles.length) * ISLE_DUR)}s"/>`;
  });

  const css = `
.px{shape-rendering:crispEdges}
.w{animation-timing-function:linear;animation-iteration-count:infinite;opacity:0}
.w0{animation-duration:${DUR[0]}s}.w1{animation-duration:${DUR[1]}s}.w2{animation-duration:${DUR[2]}s}
${OFFS.map((o, i) => `.o${i}{animation-name:warp${i}}`).join('')}
${warpKf}
${isleKf}
.isle{opacity:0}
.ex{animation:ex ${f2(exW / 26)}s linear infinite}
@keyframes ex{from{transform:translateX(0)}to{transform:translateX(-${exW}px)}}
.thumb{animation:thumb 8s infinite}
@keyframes thumb{0%,25%{transform:translateX(0)}40%,44%{transform:translateX(64px)}44.01%,100%{transform:translateX(0)}}
.ptr{animation:ptr 8s infinite}
@keyframes ptr{0%,25%{transform:translate(0,0)}40%,44%{transform:translate(64px,0)}56%{transform:translate(70px,6px)}75%{transform:translate(70px,6px)}92%,100%{transform:translate(0,0)}}
@media (prefers-reduced-motion:reduce){.w,.isle,.ex,.thumb,.ptr{animation-play-state:paused}}
`;

  const defs =
    `<clipPath id="pan"><rect x="0" y="0" width="${UW}" height="${UH}" rx="16"/></clipPath>` +
    `<pattern id="dither" width="2" height="2" patternUnits="userSpaceOnUse"><rect width="2" height="2" fill="${C.face}"/><rect width="1" height="1" fill="${C.hi}"/><rect x="1" y="1" width="1" height="1" fill="${C.hi}"/></pattern>` +
    `<g id="isle">${isleDef}</g>` +
    font.defs();

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${UW} ${UH}" width="${UW}" height="${UH}" role="img" aria-label="Castaway Setup dialog over a starfield">` +
    `<title>Castaway Setup</title>` +
    `<style>${css}</style><defs>${defs}</defs>` +
    `<rect x="0" y="0" width="${UW}" height="${UH}" rx="16" fill="${C.black}"/>` +
    `<g clip-path="url(#pan)">` +
    `<g transform="translate(${STAR_C[0]} ${STAR_C[1]})">${stars}<g class="px">${isles}</g></g>` +
    `<g class="px" transform="translate(${DX + 6} ${DY + 6}) scale(${DS})" opacity="0.5">${R(0, 0, DW, DH, C.ink)}</g>` +
    `<g class="px" transform="translate(${DX} ${DY}) scale(${DS})">${d}${slider}${example}${pointer}</g>` +
    `</g>` +
    `<rect x="1" y="1" width="${UW - 2}" height="${UH - 2}" rx="15" fill="none" stroke="${C.rim}" stroke-width="2"/>` +
    `</svg>`
  );
}

// ---------------------------------------------------------------- write
mkdirSync(dirname(OUT_MAIN), { recursive: true });
const main = buildMain();
writeFileSync(OUT_MAIN, main);
console.log(`wrote ${OUT_MAIN} (${(main.length / 1024).toFixed(1)} KB)`);
const setup = buildSetup();
writeFileSync(OUT_SETUP, setup);
console.log(`wrote ${OUT_SETUP} (${(setup.length / 1024).toFixed(1)} KB)`);
