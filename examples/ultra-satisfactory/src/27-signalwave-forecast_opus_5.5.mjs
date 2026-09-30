#!/usr/bin/env node
// ULTRA-SATISFACTORY README header: "Signalwave Forecast" (27-signalwave-forecast_opus_5.5).
// Plain Node, no dependencies, fully deterministic (seeded PRNG, no clock reads).
//   node examples/ultra-satisfactory/src/27-signalwave-forecast_opus_5.5.mjs
// writes examples/ultra-satisfactory/assets/27-signalwave-forecast_opus_5.5.svg
//
// The style is the automated local-forecast screen of 1990s North American cable
// television (the look the WeatherStar 4000 put on air, later adopted by
// signalwave / "broken transmission" vaporwave): a 4:3 frame, an indigo-to-orange
// gradient, a navy data panel with a glowing border, chunky shadowed bitmap
// lettering, a clock with seconds, and a crawl along the bottom. Here it is
// pointed at a factory. Nothing of the real broadcaster is used: no name, no
// logo, no typeface. The station ("Cable 88, the Alternate Channel") is invented.
//
// Six pages, eight seconds each, hard cuts:
//   1 Current Conditions   one oversized reading + label-and-value rows
//   2 Factory Forecast     the pitch, as a forecast paragraph
//   3 The Tab Outlook      three columns, one per tab of the app
//   4 Latest Observations  seven standard recipes, as a station table
//   5 Spaghetti Radar      a floor plan with a band of echoes stepping across it
//   6 Elevator Almanac     the five Space Elevator phases, drawn as moon phases
// The crawl carries the two commands that run the app and the live link.
//
// Every number on screen is one the app really shows (checked against its data
// on 2026-09-30): 140 items, 211 recipes (88 alternates), 477 buildings,
// 9 production machines, 5 phases, and the recipe rates on page 4.
//
// LETTERING: one home-made skeleton font (single strokes on a 6 x 12 pixel
// grid), rasterised by this script with a round pen into pixels and emitted as
// <path>s. The same skeletons give the body face, the title (bigger pixels), the
// oversized reading (pen and skeleton scaled 3x, so the curves get real steps
// rather than fat pixels) and the extended capitals of the clock (skeleton
// stretched sideways, squashed down). No <text>, no fonts, nothing external.
//
// MOTION is CSS only. Pages, clock, crawl, icons and the tracking glitch each run
// on their own period, so nothing ever has to jump back: the clock in particular
// is six digit strips with periods of 10 s, 60 s, 10 min, 1 h, 12 h and 24 h, and
// keeps correct time for as long as the tab stays open. prefers-reduced-motion
// stops everything on page 1, a complete and readable frame, and swaps the crawl
// for one still line carrying the live link.

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(here, '../assets/27-signalwave-forecast_opus_5.5.svg');

// ------------------------------------------------------------------ basics
const W = 640;
const H = 480; // 4:3, the shape of the television it is pretending to be
const PAGE = 8; // seconds per page
const PAGES = 6;
const LOOP = PAGE * PAGES;

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
const rand = mulberry32(0x5167a1); // the tracking glitch
const randR = mulberry32(0x0c0ffee5); // the radar echoes
const n1 = (v) => +v.toFixed(1);
const n2 = (v) => +v.toFixed(2);

const C = {
  white: '#ffffff',
  yellow: '#ffee1c',
  sky: '#9fc4ff', // column headings and small print
  black: '#000000',
  panelA: '#25337a',
  panelB: '#182052',
  border: '#3f76e4',
  crawl: '#1e3470',
  // the app's own colours, used where the style leaves room: the logo tile and the tab icons
  cyan: '#00cfff',
  purple: '#a855f7',
  pink: '#ec4899',
  blue: '#38bdf8',
  gold: '#ffdf1c',
};

// ------------------------------------------------------------------ the font
// Skeletons: strokes separated by "|", points as "x,y". A trailing r / R on a
// point rounds that corner (radius 1 / 2 pixels); "z" closes the stroke.
// Integer coordinates are pixel boundaries, so a stroke drawn along x = 1 with a
// pen just under 1 pixel in radius fills columns 0 and 1: two-pixel stems.
// Capitals sit between y = 1 and y = 11 (rows 0 to 11); lowercase starts at
// y = 4; descenders reach y = 14.
const FONT = {
  A: '1,11 1,4 3,1 5,4 5,11|1,8 5,8',
  B: '1,1 1,11|1,1 5,1r 5,6r 1,6|1,6 5,6r 5,11r 1,11',
  C: '5,3 5,1R 1,1R 1,11R 5,11R 5,9',
  D: '1,1 5,1R 5,11R 1,11 z',
  E: '5,1 1,1 1,11 5,11|1,6 4,6',
  F: '5,1 1,1 1,11|1,6 4,6',
  G: '5,3 5,1R 1,1R 1,11R 5,11R 5,6 3,6',
  H: '1,1 1,11|5,1 5,11|1,6 5,6',
  I: '1,1 1,11',
  J: '5,1 5,11R 1,11R 1,8',
  K: '1,1 1,11|5,1 2,6 5,11',
  L: '1,1 1,11 5,11',
  M: '1,11 1,1 4,6 7,1 7,11',
  N: '1,11 1,1 6,11 6,1', // a pixel wider than its neighbours, so the diagonal never closes up into an H
  O: '3,1 5,1R 5,11R 1,11R 1,1R z',
  P: '1,11 1,1 5,1r 5,6r 1,6',
  Q: '3,1 5,1R 5,11R 1,11R 1,1R z|3,8 5,12',
  R: '1,11 1,1 5,1r 5,6r 1,6|3,6 5,11',
  S: '5,3 5,1R 1,1R 1,6R 5,6R 5,11R 1,11R 1,9',
  T: '1,1 5,1|3,1 3,11',
  U: '1,1 1,11R 5,11R 5,1',
  V: '1,1 1,5 3,11 5,5 5,1',
  W: '1,1 1,11 4,6 7,11 7,1',
  X: '1,1 5,11|5,1 1,11',
  Y: '1,1 3,6 5,1|3,6 3,11',
  Z: '1,1 5,1 1,11 5,11',
  a: '1,4 5,4r 5,11|5,7 1,7r 1,11r 5,11',
  b: '1,1 1,11|1,4 5,4r 5,11r 1,11',
  c: '5,5 5,4r 1,4r 1,11r 5,11r 5,10',
  d: '5,1 5,11|5,4 1,4r 1,11r 5,11',
  e: '1,8 5,8 5,4r 1,4r 1,11r 5,11',
  f: '4,1 2,1r 2,11|1,4 4,4',
  g: '5,4 5,14r 1,14|5,4 1,4r 1,11r 5,11',
  h: '1,1 1,11|1,4 5,4r 5,11',
  i: '1,4 1,11|1,1 1,1',
  j: '3,4 3,14r 1,14|3,1 3,1',
  k: '1,1 1,11|5,4 2,8 5,11',
  l: '1,1 1,11',
  m: '1,4 1,11|1,4 4,4r 4,11|4,4 7,4r 7,11',
  n: '1,4 1,11|1,4 5,4r 5,11',
  o: '3,4 5,4r 5,11r 1,11r 1,4r z',
  p: '1,4 1,14|1,4 5,4r 5,11r 1,11',
  q: '5,4 5,14|5,4 1,4r 1,11r 5,11',
  r: '1,4 1,11|1,4 4,4',
  s: '5,4 1,4r 1,7r 5,7r 5,11r 1,11',
  t: '2,1 2,11r 4,11|1,4 4,4',
  u: '1,4 1,11r 5,11|5,4 5,11',
  v: '1,4 1,6 3,11 5,6 5,4',
  w: '1,4 1,11r 7,11r 7,4|4,5 4,11',
  x: '1,4 5,11|5,4 1,11',
  y: '1,4 1,11r 5,11|5,4 5,14r 1,14',
  z: '1,4 5,4 1,11 5,11',
  0: '3,1 5,1R 5,11R 1,11R 1,1R z',
  1: '1,3 3,1 3,11',
  2: '1,3 1,1R 5,1R 5,5 1,10 1,11 5,11',
  3: '1,1 5,1r 5,11r 1,11|2,6 5,6',
  4: '5,11 5,1 1,7 1,8 5,8',
  5: '5,1 1,1 1,6 5,6r 5,11r 1,11',
  6: '5,1 1,1R 1,11r 5,11r 5,6r 1,6',
  7: '1,1 5,1 5,3 3,7 3,11',
  8: '3,1 5,1r 5,6r 1,6r 1,1r z|3,6 5,6r 5,11r 1,11r 1,6r z',
  9: '5,6 1,6r 1,1r 5,1r 5,11R 1,11',
  '.': '1,11 1,11',
  ',': '1,11 1,12',
  ':': '1,5 1,5|1,11 1,11',
  '-': '1,7 4,7',
  '‐': '1,6 4,6', // a hyphen at capital height, for the title
  '/': '1,11 4,1',
  "'": '1,1 1,2',
  '"': '1,1 1,2|4,1 4,2',
  '!': '1,1 1,7|1,11 1,11',
  '?': '1,2 1,1r 5,1r 5,6r 3,6 3,8|3,11 3,11',
  '(': '3,0 1,3 1,9 3,12',
  ')': '1,0 3,3 3,9 1,12',
  '+': '1,7 5,7|3,5 3,9',
  '=': '1,5 5,5|1,9 5,9',
  '·': '1,7 1,7',
};
// Two glyphs do not come out of a pen nicely at this size, so they are drawn by hand.
const BITMAPS = {
  // the pen leaves the waist of the 8 as wide as its shoulders, which reads as a 0 with a bar; this one is pinched
  8: ['.####.', '######', '##..##', '##..##', '##..##', '.####.', '.####.', '##..##', '##..##', '##..##', '######', '.####.'],
  '&': ['..###...', '.##.##..', '.##.##..', '.##.##..', '..###...', '.###....', '##.##.##', '##..####', '##...##.', '##..###.', '.######.', '..##..##'],
};
// The clock face squashes the skeletons, which would close up the hooked letters, so those lose their hooks there.
const FONT_CLOCK = {
  N: '1,11 1,1 5,11 5,1',
  S: '5,1 1,1r 1,6r 5,6r 5,11r 1,11',
  C: '5,1 1,1R 1,11R 5,11',
  G: '5,1 1,1R 1,11R 5,11 5,6 3,6',
};
const RAD = { '': 0, r: 1, R: 2 };

// A face is a way of rasterising the skeletons: a coordinate map, a pen radius
// and the size of one font pixel in frame units.
const FACES = {
  // body: two-pixel stems, 12-pixel capitals, one pixel = 2 units
  a: { fx: (x) => x, fy: (y) => y, rs: 1, pen: 0.95, pitch: 2, gap: 1, space: 4, cap: 12 },
  // title: the same pixels, a quarter bigger
  t: { fx: (x) => x, fy: (y) => y, rs: 1, pen: 0.95, pitch: 2.5, gap: 1, space: 4, cap: 12 },
  // numbers on the tab page: skeleton and pen doubled
  m: { fx: (x) => x * 2, fy: (y) => y * 2, rs: 2, pen: 1.9, pitch: 2, gap: 2, space: 6, cap: 24 },
  // the oversized reading: skeleton and pen tripled
  b: { fx: (x) => x * 3, fy: (y) => y * 3, rs: 3, pen: 2.85, pitch: 2, gap: 3, space: 9, cap: 36 },
  // clock: extended capitals (half as wide again, a fifth shorter)
  c: { fx: (x) => 1 + (x - 1) * 1.5, fy: (y) => Math.round(1 + (y - 1) * 0.8), rs: 1, pen: 0.95, pitch: 2, gap: 1, space: 4, cap: 10 },
};
for (const [k, f] of Object.entries(FACES)) f.id = k;

function polylines(def, f) {
  return def.split('|').map((st) => {
    const toks = st.trim().split(/\s+/);
    const closed = toks[toks.length - 1] === 'z';
    if (closed) toks.pop();
    const pts = toks.map((t) => {
      const m = /^(-?[\d.]+),(-?[\d.]+)([rR]?)$/.exec(t);
      return { x: f.fx(+m[1]), y: f.fy(+m[2]), r: RAD[m[3]] * f.rs };
    });
    const n = pts.length;
    const out = [];
    for (let i = 0; i < n; i++) {
      const p = pts[i];
      const end = !closed && (i === 0 || i === n - 1);
      if (!p.r || end) { out.push([p.x, p.y]); continue; }
      const ia = (i - 1 + n) % n;
      const ib = (i + 1) % n;
      const a = pts[ia];
      const b = pts[ib];
      const la = Math.hypot(a.x - p.x, a.y - p.y);
      const lb = Math.hypot(b.x - p.x, b.y - p.y);
      const da = Math.min(p.r, la * (a.r && !(!closed && ia === 0) ? 0.5 : 1));
      const db = Math.min(p.r, lb * (b.r && !(!closed && ib === n - 1) ? 0.5 : 1));
      const p0 = [p.x + ((a.x - p.x) / la) * da, p.y + ((a.y - p.y) / la) * da];
      const p2 = [p.x + ((b.x - p.x) / lb) * db, p.y + ((b.y - p.y) / lb) * db];
      for (let k = 0; k <= 8; k++) { // the corner becomes a quadratic curve
        const t = k / 8;
        const u = 1 - t;
        out.push([u * u * p0[0] + 2 * u * t * p.x + t * t * p2[0], u * u * p0[1] + 2 * u * t * p.y + t * t * p2[1]]);
      }
    }
    if (closed) out.push(out[0]);
    return out;
  });
}
function distSeg(px, py, a, b) {
  const vx = b[0] - a[0];
  const vy = b[1] - a[1];
  const l2 = vx * vx + vy * vy;
  let t = l2 ? ((px - a[0]) * vx + (py - a[1]) * vy) / l2 : 0;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - a[0] - t * vx, py - a[1] - t * vy);
}
// Skeleton -> set of pixels: a pixel is inked when its centre is within the pen's reach.
function rasterise(ch, f) {
  let cells = [];
  if (BITMAPS[ch] && (f.id === 'a' || f.id === 't')) { // hand-drawn glyphs exist at body size only; other faces fall back to the pen
    BITMAPS[ch].forEach((row, j) => [...row].forEach((c, i) => { if (c === '#') cells.push([i, j]); }));
  } else {
    const def = (f.id === 'c' && FONT_CLOCK[ch]) || FONT[ch];
    if (!def) throw new Error(`no glyph for ${JSON.stringify(ch)}`);
    const ps = polylines(def, f);
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    for (const p of ps) for (const [x, y] of p) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    for (let j = Math.floor(y0 - f.pen) - 1; j <= Math.ceil(y1 + f.pen); j++) {
      for (let i = Math.floor(x0 - f.pen) - 1; i <= Math.ceil(x1 + f.pen); i++) {
        let d = 1e9;
        for (const p of ps) {
          if (p.length === 1) d = Math.min(d, Math.hypot(i + 0.5 - p[0][0], j + 0.5 - p[0][1]));
          for (let k = 0; k + 1 < p.length; k++) d = Math.min(d, distSeg(i + 0.5, j + 0.5, p[k], p[k + 1]));
        }
        if (d <= f.pen) cells.push([i, j]);
      }
    }
  }
  const minX = Math.min(...cells.map((c) => c[0]));
  const maxX = Math.max(...cells.map((c) => c[0]));
  cells = cells.map(([i, j]) => [i - minX, j]);
  return { cells, w: maxX - minX + 1 };
}
// Pixels -> path: runs merged across, then down, all in one path so no seams show.
function cellsToPath(cells, pitch) {
  const rows = new Map();
  for (const [i, j] of cells) { if (!rows.has(j)) rows.set(j, []); rows.get(j).push(i); }
  const ys = [...rows.keys()].sort((a, b) => a - b);
  const rects = [];
  let open = [];
  let prevY = null;
  for (const y of ys) {
    const xs = rows.get(y).sort((a, b) => a - b);
    const next = [];
    for (let k = 0; k < xs.length;) {
      const xa = xs[k];
      while (k + 1 < xs.length && xs[k + 1] === xs[k] + 1) k++;
      const wd = xs[k] - xa + 1;
      k++;
      const o = prevY === y - 1 ? open.find((r) => r[0] === xa && r[2] === wd) : null;
      if (o) { o[3]++; next.push(o); } else { const r = [xa, y, wd, 1]; rects.push(r); next.push(r); }
    }
    open = next;
    prevY = y;
  }
  return rects.map(([x, y, w, h]) => `M${n1(x * pitch)} ${n1(y * pitch)}h${n1(w * pitch)}v${n1(h * pitch)}h${n1(-w * pitch)}z`).join('');
}

// Glyphs become <path id> in <defs>, one per face and character actually used.
const glyphs = new Map();
function glyph(f, ch) {
  const key = f.id + ch;
  if (!glyphs.has(key)) {
    const r = rasterise(ch, f);
    glyphs.set(key, { id: `${f.id}${glyphs.size.toString(36)}`, d: cellsToPath(r.cells, f.pitch), w: r.w, cells: r.cells });
  }
  return glyphs.get(key);
}
function measure(f, str) {
  let x = 0;
  for (const ch of str) x += ch === ' ' ? f.space : glyph(f, ch).w + f.gap;
  return (x - f.gap) * f.pitch;
}
// One line of lettering. (x, y) is the top of the capitals; align l / c / r.
function line(f, str, x, y, align = 'l') {
  const w = measure(f, str);
  let cx = align === 'r' ? x - w : align === 'c' ? x - w / 2 : x;
  cx = Math.round(cx / f.pitch) * f.pitch; // stay on the face's own pixel grid
  let out = '';
  for (const ch of str) {
    if (ch === ' ') { cx += f.space * f.pitch; continue; }
    const g = glyph(f, ch);
    out += `<use href="#${g.id}" x="${n1(cx)}"/>`;
    cx += (g.w + f.gap) * f.pitch;
  }
  return `<g transform="translate(0 ${n1(y)})">${out}</g>`;
}
const A = FACES.a;

// A block of lettering in several colours with one hard black shadow under all of it.
// The lettering lives in <defs> once and is drawn twice: black and offset, then in colour.
const defs = [];
let layerN = 0;
function layer(parts, off = 2) {
  const id = `L${(layerN++).toString(36)}`;
  const live = parts.filter(([, s]) => s);
  defs.push(`<g id="${id}">${live.map(([, s], i) => `<g id="${id}${i}">${s}</g>`).join('')}</g>`);
  return `<use href="#${id}" x="${off}" y="${off}"/>` + live.map(([c], i) => `<use href="#${id}${i}" fill="${c}"/>`).join('');
}

// ------------------------------------------------------------------ icons (all home-made)
// A cog outline: n teeth between root radius r1 and tip radius r2.
function cog(cx, cy, r1, r2, n, rot, a1 = 0.3, a2 = 0.18) {
  const step = (Math.PI * 2) / n;
  let d = '';
  for (let k = 0; k < n; k++) {
    const a = rot + k * step;
    [[r1, a - step * a1], [r2, a - step * a2], [r2, a + step * a2], [r1, a + step * a1]].forEach(([r, t], i) => {
      d += `${k === 0 && i === 0 ? 'M' : 'L'}${n1(cx + r * Math.cos(t))} ${n1(cy + r * Math.sin(t))}`;
    });
    const t2 = a + step * (1 - a1);
    d += `A${r1} ${r1} 0 0 1 ${n1(cx + r1 * Math.cos(t2))} ${n1(cy + r1 * Math.sin(t2))}`;
  }
  return `${d}z`;
}
const INK = 'stroke="#000" stroke-linejoin="round" stroke-linecap="round"';
// Two-frame cartoons: frame A shows for the first half of each beat, frame B for the second.
const frames = (a, b) => `<g class="fa">${a}</g><g class="fb">${b}</g>`;

// "Partly automated": a cog where the sun would be, behind a cloud.
function iconCogCloud(x, y) {
  const sun = (rot) => `<path d="${cog(-12, -8, 19, 27, 8, rot)}" fill="${C.gold}" ${INK} stroke-width="3.2"/>`
    + `<circle cx="-12" cy="-8" r="7.5" fill="#f08a00" stroke="#000" stroke-width="2.8"/>`;
  const puffs = '<circle cx="-2" cy="18" r="11"/><circle cx="15" cy="9" r="15"/><circle cx="33" cy="16" r="12"/><rect x="-2" y="17" width="35" height="12"/>';
  return `<g transform="translate(${x} ${y}) scale(1.2)">${frames(sun(0), sun(Math.PI / 8))}`
    + `<g fill="#000" stroke="#000" stroke-width="6.4" stroke-linejoin="round">${puffs}</g><g fill="#f4f7ff">${puffs}</g>`
    + `<path d="M5 22h22" stroke="#bcc8ee" stroke-width="3" stroke-linecap="round"/></g>`;
}
const ICON = 1.1; // the three tab icons are drawn on a 60-unit box and shown a little larger
// Objectives: a tower with a deck at the top and a pod on its way up. Not the game's elevator, just a tower.
function iconTower(x, y, fill) {
  const pod = (py) => `<rect x="-8.5" y="${py}" width="17" height="9" rx="2" fill="${C.gold}" ${INK} stroke-width="2.6"/>`;
  return `<g transform="translate(${x} ${y}) scale(${ICON})">`
    + `<path d="M0 -24V-37" stroke="#000" stroke-width="3.2" stroke-linecap="round"/><circle cy="-38" r="3.6" fill="${C.gold}" stroke="#000" stroke-width="2.4"/>`
    + `<path d="M-8 18L-4.5 -24H4.5L8 18z" fill="${fill}" ${INK} stroke-width="3.2"/>`
    + `<path d="M-23 30L-13 18H13L23 30z" fill="${fill}" ${INK} stroke-width="3.2"/>`
    + `<ellipse cy="-23" rx="17" ry="6" fill="#e9d5ff" stroke="#000" stroke-width="3.2"/>`
    + frames(pod(4), pod(-10)) + '</g>';
}
// Items: a magnifying glass, because the tab is a search box.
function iconLens(x, y, fill) {
  const glass = '<path d="M9 9L23 23" stroke="#000" stroke-width="12.5" stroke-linecap="round"/>'
    + `<path d="M9 9L23 23" stroke="${fill}" stroke-width="6.5" stroke-linecap="round"/>`
    + `<circle cx="-5" cy="-5" r="19" fill="${fill}" stroke="#000" stroke-width="3.2"/>`
    + '<circle cx="-5" cy="-5" r="11.5" fill="#ffe6f3" stroke="#000" stroke-width="2.6"/>'
    + '<path d="M-11 -7a7 7 0 0 1 6 -6" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/>';
  return `<g transform="translate(${x} ${y + 2}) scale(${ICON})">${frames(glass, `<g transform="translate(-4 -3)">${glass}</g>`)}</g>`;
}
// Buildings: a saw-tooth roof and a chimney that puffs.
function iconFactory(x, y, fill) {
  const puff = (px, py, r) => `<circle cx="${px}" cy="${py}" r="${r}" fill="#f4f7ff" stroke="#000" stroke-width="2.6"/>`;
  return `<g transform="translate(${x} ${y}) scale(${ICON})">`
    + `<rect x="-24" y="-24" width="11" height="28" fill="${fill}" ${INK} stroke-width="3.2"/>`
    + `<path d="M-28 28V1H-9V-10L5 1V-10L19 1H28V28z" fill="${fill}" ${INK} stroke-width="3.2"/>`
    + `<rect x="-21" y="10" width="8" height="8" fill="${C.gold}" stroke="#000" stroke-width="2"/>`
    + `<rect x="-7" y="10" width="8" height="8" fill="${C.gold}" stroke="#000" stroke-width="2"/>`
    + '<rect x="9" y="12" width="12" height="16" fill="#0b1030" stroke="#000" stroke-width="2"/>'
    + frames(puff(-17, -32, 5) + puff(-8, -37, 3.5), puff(-13, -34, 5.5) + puff(-3, -40, 4)) + '</g>';
}
// Almanac: phase k of n as a moon, lit from the right.
function iconMoon(x, y, r, k, n) {
  const f = k / n;
  const rx = n1(r * Math.abs(1 - 2 * f));
  const lit = f >= 1 ? `<circle r="${r}" fill="${C.gold}"/>`
    : `<path d="M0 ${-r}A${r} ${r} 0 0 1 0 ${r}A${rx} ${r} 0 0 ${f < 0.5 ? 0 : 1} 0 ${-r}z" fill="${C.gold}"/>`;
  return `<g transform="translate(${x} ${y})"><circle r="${r}" fill="#0b1030"/>${lit}<circle r="${r}" fill="none" stroke="#000" stroke-width="3"/></g>`;
}

// ------------------------------------------------------------------ fixed furniture
const css = [];
const out = [];

defs.push(
  '<linearGradient id="BG" x1="0" y1="0" x2="0" y2="1">'
  + '<stop offset="0" stop-color="#180f57"/><stop offset=".34" stop-color="#38194a"/><stop offset=".66" stop-color="#7c3433"/><stop offset="1" stop-color="#c8640e"/></linearGradient>',
  '<linearGradient id="HD" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#120c46"/><stop offset="1" stop-color="#2a1f86"/></linearGradient>',
  `<linearGradient id="PN" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.panelA}"/><stop offset="1" stop-color="${C.panelB}"/></linearGradient>`,
  '<linearGradient id="TL" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3c6ae0"/><stop offset="1" stop-color="#1a2c88"/></linearGradient>',
  '<linearGradient id="HM" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".055"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>',
  '<pattern id="SL" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="2" y="2" fill="#000" opacity=".1"/></pattern>',
  `<clipPath id="FR"><rect width="${W}" height="${H}" rx="12"/></clipPath>`,
);

// The backdrop: indigo to burnt orange, with a darker header wedge cut on a diagonal.
out.push(`<rect width="${W}" height="${H}" fill="url(#BG)"/>`);
out.push('<path d="M0 0H640V22H470L404 92H0z" fill="url(#HD)"/>');
out.push('<path d="M482 22H496L430 92H416z" fill="#3a2ea8" opacity=".55"/>');
out.push('<path d="M0 92H404L470 22H640" fill="none" stroke="#6b5be0" stroke-width="2" opacity=".8"/>');

// The logo tile: blue, white rounded outline, and the app's emblem (a hexagon with a cog in it).
{
  const cx = 64, cy = 46;
  const hex = Array.from({ length: 6 }, (_, k) => {
    const a = (Math.PI / 3) * k - Math.PI / 2;
    return `${n1(cx + 21 * Math.cos(a))} ${n1(cy + 21 * Math.sin(a))}`;
  }).join('L');
  out.push('<rect x="37" y="19" width="60" height="60" rx="11" fill="#000"/>'
    + '<rect x="34" y="16" width="60" height="60" rx="11" fill="url(#TL)"/>'
    + '<rect x="37.5" y="19.5" width="53" height="53" rx="8" fill="none" stroke="#fff" stroke-width="3"/>'
    + `<path d="M${hex}z" fill="#0c1240" stroke="${C.cyan}" stroke-width="3.2" stroke-linejoin="round"/>`
    + `<path d="${cog(cx, cy, 9, 13.5, 8, Math.PI / 8)}" fill="#fff"/><circle cx="${cx}" cy="${cy}" r="4" fill="#0c1240"/>`);
}

// Title, line one: the name, on every page.
out.push(layer([[C.yellow, line(FACES.t, 'ULTRA‐SATISFACTORY', 106, 17)]], 2.5));

// The clock: H:MM:SS and AM/PM as digit strips that step upwards inside little windows.
{
  const f = FACES.c;
  const CELL = 26; // strip pitch, in units
  const digitW = Math.max(...'0123456789'.split('').map((d) => glyph(f, d).w)) * f.pitch;
  const lit = (s, w, align) => {
    const t = align === 'r' ? line(f, s, w, 2, 'r') : line(f, s, 0, 2);
    return `<g transform="translate(2 2)">${t}</g><g fill="#fff">${t}</g>`;
  };
  let strips = 0;
  // `entries` are stacked in a column; the column steps up one cell every period / n seconds.
  // `offset` is how far into its first cell the strip already is when the page loads.
  const strip = (x, y, w, entries, period, offset, align = 'l') => {
    const n = entries.length;
    const kf = `k${n}`;
    const cls = `q${strips++}`;
    if (!css.some((c) => c.startsWith(`@keyframes ${kf}{`))) css.push(`@keyframes ${kf}{to{transform:translateY(${-n * CELL}px)}}`);
    css.push(`.${cls}{animation:${kf} ${period}s steps(${n}) ${-offset}s infinite}`);
    const body = entries.map((s, k) => `<g transform="translate(0 ${k * CELL})">${lit(s, w, align)}</g>`).join('');
    return `<svg x="${x}" y="${y}" width="${w + 4}" height="${CELL}"><g class="${cls}">${body}</g></svg>`;
  };
  // Starts at 2:11:00 PM (211 recipes) and keeps time from there.
  const colonW = glyph(f, ':').w * f.pitch;
  const gap = f.gap * f.pitch;
  const apW = measure(f, 'PM');
  const hourW = 2 * digitW + gap;
  const total = hourW + gap + colonW + gap + digitW + gap + digitW + gap + colonW + gap + digitW + gap + digitW + f.space * f.pitch + apW;
  const RIGHT = 612;
  let x = RIGHT - total;
  const y = 30;
  const parts = [];
  const colon = (cx) => `<g transform="translate(${cx} ${y})"><g transform="translate(2 2)">${line(f, ':', 0, 2)}</g><g fill="#fff">${line(f, ':', 0, 2)}</g></g>`;
  const rot = (arr, k) => arr.slice(k).concat(arr.slice(0, k));
  const d10 = '0123456789'.split('');
  const d6 = '012345'.split('');
  parts.push(strip(x, y, hourW, ['2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '1'], 43200, 11 * 60, 'r')); x += hourW + gap;
  parts.push(colon(x)); x += colonW + gap;
  parts.push(strip(x, y, digitW, rot(d6, 1), 3600, 60)); x += digitW + gap;
  parts.push(strip(x, y, digitW, rot(d10, 1), 600, 0)); x += digitW + gap;
  parts.push(colon(x)); x += colonW + gap;
  parts.push(strip(x, y, digitW, d6, 60, 0)); x += digitW + gap;
  parts.push(strip(x, y, digitW, d10, 10, 0)); x += digitW + f.space * f.pitch;
  parts.push(strip(x, y, apW, ['PM', 'AM'], 86400, 2 * 3600 + 11 * 60));
  out.push(`<g fill="#000">${parts.join('')}</g>`);
  // Day and date: the day the numbers on screen were checked against the app's data.
  out.push(layer([[C.white, line(f, 'WED SEP 30', RIGHT, 62, 'r')]]));
}

// The data panel: navy, with a lighter border that glows a little (stacked strokes, no filter).
const PX = 46, PY = 100, PW = 548, PH = 302;
out.push(`<g fill="none" stroke="${C.border}">`
  + [[13, 0.07], [9, 0.11], [5.5, 0.2]].map(([sw, op]) => `<rect x="${PX}" y="${PY}" width="${PW}" height="${PH}" rx="3" stroke-width="${sw}" opacity="${op}"/>`).join('')
  + '</g>'
  + `<rect x="${PX}" y="${PY}" width="${PW}" height="${PH}" rx="2" fill="url(#PN)" stroke="${C.border}" stroke-width="2.5"/>`
  + `<rect x="${PX + 3}" y="${PY + 3}" width="${PW - 6}" height="${PH - 6}" rx="1" fill="none" stroke="#7fa6ff" stroke-width="1" opacity=".35"/>`);

// ------------------------------------------------------------------ the six pages
const TITLE_X = 106, TITLE_Y = 56;
const ROW = 34; // line pitch of the body face
const pages = [];

// 1. Current Conditions
{
  const white = [], yellow = [];
  const LX = 146; // centre of the left column
  white.push(line(A, 'Recipes', LX, 196, 'c'));
  white.push(line(A, 'Screws: 40/min', LX, 318, 'c'));
  white.push(line(A, 'Boxes: Full', LX, 352, 'c'));
  yellow.push(line(A, 'Your Factory Floor', 424, 112, 'c'));
  const rows = [
    ['Items:', '140'],
    ['Alternates:', '88'],
    ['Buildings:', '477'],
    ['Machines:', '9'],
    ['Ceiling:', 'Phase 5'],
    ['Visibility:', '1 click'],
    ['Spaghetti:', 'Likely'],
  ];
  rows.forEach(([k, v], i) => {
    white.push(line(A, k, 272, 148 + i * ROW));
    white.push(line(A, v, 576, 148 + i * ROW, 'r'));
  });
  pages.push({
    name: 'Current Conditions',
    body: layer([[C.white, line(FACES.b, '211', LX, 114, 'c')]], 4)
      + iconCogCloud(LX - 10, 268)
      + layer([[C.white, white.join('')], [C.yellow, yellow.join('')]]),
  });
}

// 2. Factory Forecast: the pitch, set as a forecast.
{
  const white = [];
  const MAXW = PW - 44;
  [
    'TONIGHT...A companion app for the game',
    'Satisfactory. Every recipe, building and',
    'Space Elevator objective, one click apart.',
    'TOMORROW...Three tabs, all linked:',
    'Objectives, Items and Buildings.',
    'OUTLOOK...Highs near 477 buildings.',
    'Scattered spaghetti, clearing never.',
    'An unofficial fan project.',
  ].forEach((s, i) => {
    if (measure(A, s) > MAXW) throw new Error(`forecast line too wide: ${s}`);
    white.push(line(A, s, 68, 116 + i * ROW));
  });
  pages.push({ name: 'Factory Forecast', body: layer([[C.white, white.join('')]]) });
}

// 3. The Tab Outlook: three columns, one per tab.
{
  const white = [], yellow = [], sky = [];
  const cols = [
    { cx: 140, name: 'Objectives', n: '5', unit: 'phases', d: ['Pick a phase,', 'see its parts'], icon: iconTower, fill: C.purple },
    { cx: 320, name: 'Items', n: '140', unit: 'items', d: ['Search as', 'you type'], icon: iconLens, fill: C.pink },
    { cx: 500, name: 'Buildings', n: '477', unit: 'in all', d: ['What makes', 'what, by tier'], icon: iconFactory, fill: C.blue },
  ];
  let art = '';
  let big = '';
  for (const c of cols) {
    art += `<rect x="${c.cx - 84}" y="108" width="168" height="286" rx="2" fill="#2b3f95" opacity=".55"/>`
      + `<rect x="${c.cx - 84}" y="108" width="168" height="286" rx="2" fill="none" stroke="#6f96f2" stroke-width="1.5" opacity=".7"/>`
      + c.icon(c.cx, 193, c.fill);
    yellow.push(line(A, c.name, c.cx, 114, 'c'));
    big += line(FACES.m, c.n, c.cx, 238, 'c');
    sky.push(line(A, c.unit, c.cx, 294, 'c'));
    c.d.forEach((s, i) => {
      if (measure(A, s) > 160) throw new Error(`outlook line too wide: ${s}`);
      white.push(line(A, s, c.cx, 330 + i * 30, 'c'));
    });
  }
  pages.push({
    name: 'The Tab Outlook',
    body: art + layer([[C.white, big]], 3) + layer([[C.white, white.join('')], [C.yellow, yellow.join('')], [C.sky, sky.join('')]]),
  });
}

// 4. Latest Observations: seven standard recipes as a station table.
{
  const white = [], sky = [];
  const c = FACES.c;
  const X = { item: 66, rate: 322, mach: 346, mw: 576 };
  sky.push(line(c, 'ITEM', X.item, 118) + line(c, '/MIN', X.rate, 118, 'r') + line(c, 'MACHINE', X.mach, 118) + line(c, 'MW', X.mw, 118, 'r'));
  [
    ['Iron Ingot', '30', 'Smelter', '4'],
    ['Steel Ingot', '45', 'Foundry', '16'],
    ['Screw', '40', 'Constructor', '4'],
    ['Rotor', '4', 'Assembler', '15'],
    ['Plastic', '20', 'Refinery', '30'],
    ['Cooling System', '6', 'Blender', '75'],
    ['Modular Engine', '1', 'Manufacturer', '55'],
  ].forEach(([item, rate, mach, mw], i) => {
    const y = 154 + i * ROW;
    white.push(line(A, item, X.item, y) + line(A, rate, X.rate, y, 'r') + line(A, mach, X.mach, y) + line(A, mw, X.mw, y, 'r'));
  });
  pages.push({
    name: 'Latest Observations',
    body: `<rect x="${PX + 8}" y="144" width="${PW - 16}" height="2" fill="#6f96f2" opacity=".6"/>`
      + layer([[C.white, white.join('')], [C.sky, sky.join('')]]),
  });
}

// 5. Spaghetti Radar: a floor plan, and a band of echoes crossing it in eight steps.
{
  const RX = 50, RY = 104, RW = 540, RH = 262; // the map window inside the panel
  const CELL = 6;
  const COLS = RW / CELL + 16, ROWS = Math.ceil(RH / CELL);
  // value noise, three octaves, squeezed into a diagonal band like a front
  const G = 48;
  const grid = Array.from({ length: G * G }, () => randR());
  const at = (x, y) => grid[(((y % G) + G) % G) * G + (((x % G) + G) % G)];
  const noise = (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y);
    const sm = (t) => t * t * (3 - 2 * t);
    const fx = sm(x - xi), fy = sm(y - yi);
    const a = at(xi, yi), b = at(xi + 1, yi), c = at(xi, yi + 1), d = at(xi + 1, yi + 1);
    return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
  };
  const field = (i, j) => {
    const v = noise(i / 9, j / 9) * 0.58 + noise(i / 4 + 7, j / 4 + 3) * 0.3 + noise(i / 1.7 + 19, j / 1.7 + 5) * 0.12;
    const d = (i - 58 + (j - ROWS / 2) * 0.85) / 1.31; // distance from a line leaning to the right
    const lone = Math.exp(-(((i - 20) / 7) ** 2 + ((j - 31) / 5) ** 2)); // and one stray cell behind it
    return v * (Math.exp(-((d / 15) ** 2)) + lone * 0.8);
  };
  // thresholds by rank, so the picture is mostly green with small hot cores whatever the seed
  const all = [];
  for (let j = 0; j < ROWS; j++) for (let i = 0; i < COLS; i++) all.push(field(i, j));
  all.sort((p, q) => p - q);
  const rank = (q) => all[Math.floor(all.length * q)];
  const LEVELS = [[rank(0.7), '#2fbf4a'], [rank(0.895), '#f4e52a'], [rank(0.955), '#f7931e'], [rank(0.985), '#e2261c']];
  let echoes = '';
  for (const [th, fill] of LEVELS) {
    const cells = [];
    for (let j = 0; j < ROWS; j++) for (let i = 0; i < COLS; i++) if (field(i, j) > th) cells.push([i, j]);
    echoes += `<path fill="${fill}" d="${cellsToPath(cells, CELL)}"/>`;
  }
  const c = FACES.c;
  const zones = [
    ['Smelters', 22, 20, 124, 56],
    ['Constructors', 190, 34, 172, 60],
    ['Assemblers', 378, 74, 150, 76],
    ['Storage', 36, 150, 112, 62],
    ['Power', 214, 158, 104, 56],
  ];
  let plan = `<rect width="${RW}" height="${RH}" fill="#0a1233"/>`;
  let gridLines = '';
  for (let x = 24; x < RW; x += 24) gridLines += `M${x} 0V${RH}`;
  for (let y = 24; y < RH; y += 24) gridLines += `M0 ${y}H${RW}`;
  plan += `<path d="${gridLines}" stroke="#2a3f8f" stroke-width="1" opacity=".55"/>`;
  // belts: three tidy ones, then the one that was only ever meant to be temporary
  plan += '<path d="M146 48H190M362 58H452V74M84 76V150M148 186H214" fill="none" stroke="#7fa6ff" stroke-width="2.5" stroke-dasharray="7 4"/>'
    + '<path d="M318 186C352 176 340 226 372 214S356 160 398 176S372 240 420 226S430 168 456 172V148" fill="none" stroke="#7fa6ff" stroke-width="2.5" stroke-dasharray="7 4"/>';
  const labels = [];
  for (const [name, x, y, w, h] of zones) {
    plan += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="#1b2c6e" stroke="#7fa6ff" stroke-width="2"/>`;
    labels.push(line(A, name, x + w / 2, y + h / 2 - 12, 'c'));
  }
  // legend: four squares, from tidy to not
  const LG = 206;
  let legend = `<rect x="6" y="${LG + 20}" width="${measure(c, 'TIDY') + 8 + 4 * 16 + 6 + measure(c, 'SPAGHETTI') + 18}" height="30" rx="3" fill="#0a1233" stroke="#7fa6ff" stroke-width="1.5" opacity=".92"/>`;
  const lx = 14 + measure(c, 'TIDY') + 8;
  LEVELS.forEach(([, fill], k) => { legend += `<rect x="${lx + k * 16}" y="${LG + 28}" width="13" height="13" fill="${fill}" stroke="#000" stroke-width="1.5"/>`; });
  const legendText = line(c, 'TIDY', 14, LG + 25) + line(c, 'SPAGHETTI', lx + 4 * 16 + 6, LG + 25);
  const white = [line(A, 'Heavy spaghetti moving in over Assemblers', 320, 372, 'c')];
  pages.push({
    name: 'Spaghetti Radar',
    body: `<svg x="${RX}" y="${RY}" width="${RW}" height="${RH}">${plan}`
      + `<g class="rd" opacity=".82"><g transform="translate(${-8 * CELL} 0)">${echoes}</g></g>`
      + layer([[C.white, labels.join('')]]) + legend + layer([[C.sky, legendText]]) + '</svg>'
      + `<rect x="${RX}" y="${RY + RH}" width="${RW}" height="2" fill="#7fa6ff" opacity=".7"/>`
      + layer([[C.white, white.join('')]]),
  });
  // eight hops of 9 units across the eight seconds the page is up, like a radar loop
  css.push(`.rd{animation:rd ${PAGE}s steps(8) infinite}@keyframes rd{from{transform:translateX(-36px)}to{transform:translateX(36px)}}`);
}

// 6. Elevator Almanac: the five phases, as the app lists them.
{
  const white = [], yellow = [], sky = [];
  yellow.push(line(A, 'What the Space Elevator wants', 320, 114, 'c'));
  let art = '';
  [
    ['Automation basics', '3 parts'],
    ['Logistics & steel', '4 parts'],
    ['Oil & computers', '3 parts'],
    ['Nuclear & endgame', '4 parts'],
    ['Alien tech & quantum', '4 parts'],
  ].forEach(([name, parts], i) => {
    const y = 154 + i * 36;
    art += iconMoon(78, y + 12, 12, i + 1, 5);
    sky.push(line(A, `Phase ${i + 1}`, 100, y));
    white.push(line(A, name, 208, y) + line(A, parts, 576, y, 'r'));
  });
  white.push(line(A, 'Pick a phase, click a part, get its recipe.', 320, 354, 'c'));
  pages.push({
    name: 'Elevator Almanac',
    body: `<rect x="${PX + 8}" y="340" width="${PW - 16}" height="2" fill="#6f96f2" opacity=".6"/>` + art
      + layer([[C.white, white.join('')], [C.yellow, yellow.join('')], [C.sky, sky.join('')]]),
  });
}
if (pages.length !== PAGES) throw new Error('page count');

pages.forEach((p, i) => {
  const head = layer([[C.yellow, line(A, p.name, TITLE_X, TITLE_Y)]]);
  out.push(`<g class="pg p${i + 1}">${head}${p.body}</g>`);
});
// Hard cuts: each page is on for one sixth of the loop.
css.push(`.pg{opacity:0;animation:pg ${LOOP}s step-end infinite}.p1{opacity:1}`);
css.push(`@keyframes pg{0%{opacity:1}${(100 / PAGES).toFixed(3)}%{opacity:0}}`);
for (let i = 1; i < PAGES; i++) css.push(`.p${i + 1}{animation-delay:${i * PAGE - LOOP}s}`);
// Icon frames: two drawings, swapped on a slow beat.
css.push('.fb{opacity:0;animation:fb 1.6s step-end infinite}.fa{animation:fa 1.6s step-end infinite}');
css.push('@keyframes fa{0%{opacity:1}50%{opacity:0}}@keyframes fb{0%{opacity:0}50%{opacity:1}}');

// ------------------------------------------------------------------ the crawl
{
  const CRAWL = [
    'TO RUN IT HERE:  python -m pip install -r requirements.txt',
    'THEN:  python -m streamlit run app/app.py',
    'THEN OPEN:  http://localhost:8501',
    'OR SKIP ALL THAT:  lukexyz.github.io/ULTRA-SATISFACTORY  runs in your browser, nothing to install',
    'A FUSE WATCH remains in effect for anyone overclocking on a "temporary" power line',
    'Manifold and load-balancer fronts meet over the main bus tonight. Residents are asked not to pick a side',
    'A pipe has clipped through a wall in your area. Nobody saw anything',
    'Belts running the wrong way are expected to continue running the wrong way',
    'You are watching Cable 88, the Alternate Channel. All 88 alternate recipes are in the data',
    'Unofficial fan project, not affiliated with Coffee Stain Studios. The code is Apache 2.0',
  ].join('   ···   ') + '   ···   ';
  const len = Math.round(measure(A, CRAWL) / 2) * 2 + A.space * A.pitch;
  const speed = 84; // units per second: slow enough to copy a command down
  const dur = Math.round(len / speed);
  defs.push(`<g id="CR">${line(A, CRAWL, 0, 0)}</g>`);
  const BY = 426;
  out.push(`<rect y="${BY}" width="${W}" height="${H - BY}" fill="${C.crawl}"/>`
    + `<rect y="${BY}" width="${W}" height="${H - BY}" fill="url(#HM)" opacity=".9"/>`
    + `<rect y="${BY - 2}" width="${W}" height="2" fill="#7c9cf0"/><rect y="${BY}" width="${W}" height="2" fill="#0d1a4a"/>`);
  out.push(`<g class="cw" transform="translate(18 ${BY + 17})">`
    + [0, len].map((o) => `<use href="#CR" x="${o + 2}" y="2"/><use href="#CR" x="${o}" fill="#fff"/>`).join('')
    + '</g>');
  css.push(`.cw>*{animation:cw ${dur}s linear infinite}@keyframes cw{to{transform:translateX(${-len}px)}}`);
  // With reduced motion the crawl cannot crawl, so it is swapped for one line that fits: the live link.
  const STILL = 'LIVE:  lukexyz.github.io/ULTRA-SATISFACTORY';
  if (measure(A, STILL) > W - 36) throw new Error('still crawl line too wide');
  out.push(`<g class="cs">${layer([[C.white, line(A, STILL, W / 2, BY + 17, 'c')]])}</g>`);
  css.push('.cs{opacity:0}');
}

// ------------------------------------------------------------------ the signal
// A slow hum bar, scanlines, and a strip of tracking noise that slides down the
// picture in the quarter second before each cut. All of it is faint.
out.push(`<rect class="hb" y="-180" width="${W}" height="180" fill="url(#HM)"/>`);
css.push(`.hb{animation:hb 13s linear infinite}@keyframes hb{to{transform:translateY(${H + 180}px)}}`);
out.push(`<rect width="${W}" height="${H}" fill="url(#SL)"/>`);
{
  let d = '';
  let d2 = '';
  for (let k = 0; k < 54; k++) {
    const x = Math.floor(rand() * 660) - 20;
    const y = Math.floor(rand() * 11) * 2;
    const w = 4 + Math.floor(rand() * rand() * 90);
    (rand() < 0.75 ? (v) => { d += v; } : (v) => { d2 += v; })(`M${x} ${y}h${w}v2h${-w}z`);
  }
  out.push(`<g class="nz"><rect width="${W}" height="24" fill="#000" opacity=".38"/><path d="${d}" fill="#fff" opacity=".8"/><path d="${d2}" fill="${C.cyan}" opacity=".7"/></g>`);
  const pc = (s) => n2(100 - (s / PAGE) * 100);
  css.push(`.nz{opacity:0;animation:nz ${PAGE}s step-end infinite}`);
  css.push(`@keyframes nz{0%{opacity:0}${pc(0.24)}%{opacity:1;transform:translateY(96px)}${pc(0.16)}%{opacity:1;transform:translateY(212px)}${pc(0.08)}%{opacity:1;transform:translateY(318px)}100%{opacity:0}}`);
}

css.push('@media (prefers-reduced-motion:reduce){*{animation:none!important}.cw{opacity:0}.cs{opacity:1}}');

// ------------------------------------------------------------------ assemble
const glyphDefs = [...glyphs.values()].map((g) => `<path id="${g.id}" d="${g.d}"/>`).join('');
const TITLE = 'ULTRA-SATISFACTORY: your local factory forecast';
const DESC = 'A 1990s cable-television forecast screen, pointed at a factory. Yellow title: ULTRA-SATISFACTORY, Current Conditions, with a clock and the date. '
  + 'A navy panel reads 211 Recipes beside a cog behind a cloud, then label-and-value rows: Items 140, Alternates 88, Buildings 477, Machines 9, Ceiling Phase 5, Visibility 1 click, Spaghetti Likely. '
  + 'The pages then cut to a Factory Forecast (a companion app for the game Satisfactory: every recipe, building and Space Elevator objective, one click apart; three tabs, all linked; an unofficial fan project), '
  + 'the Tab Outlook (Objectives, 5 phases; Items, 140 items; Buildings, 477 in all), Latest Observations (seven standard recipes with output per minute, machine and megawatts), '
  + 'a Spaghetti Radar (a floor plan with a band of green, yellow and red echoes moving in over the assemblers) and an Elevator Almanac of the five Space Elevator phases. A crawl along the bottom carries the commands: python -m pip install -r requirements.txt, then python -m streamlit run app/app.py, '
  + 'or open lukexyz.github.io/ULTRA-SATISFACTORY in a browser.';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="t d">`
  + `<title id="t">${TITLE}</title><desc id="d">${DESC}</desc>`
  + `<style>${css.join('')}</style>`
  + `<defs>${glyphDefs}${defs.join('')}</defs>`
  + `<g clip-path="url(#FR)">${out.join('')}</g>`
  + `<rect x=".75" y=".75" width="${W - 1.5}" height="${H - 1.5}" rx="11.5" fill="none" stroke="#0a0724" stroke-width="1.5"/>`
  + '</svg>\n';

if (process.argv.includes('--specimen')) {
  // Print the body face as ASCII, for checking letterforms without opening a browser.
  for (const s of ['ABCDEFGHIJKLM', 'NOPQRSTUVWXYZ', 'abcdefghijklm', 'nopqrstuvwxyz', '0123456789&', '.,:-/\'"!?()+=']) {
    const rows = Array.from({ length: 17 }, () => '');
    for (const ch of s) {
      const g = glyph(A, ch);
      const set = new Set(g.cells.map((c) => c.join(',')));
      rows.forEach((_, k) => { for (let i = 0; i < g.w; i++) rows[k] += set.has(`${i},${k - 1}`) ? '#' : '.'; rows[k] += ' '; });
    }
    console.log(rows.join('\n') + '\n');
  }
} else {
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, svg);
  console.log(`wrote ${OUT} (${(Buffer.byteLength(svg) / 1024).toFixed(1)} KB, ${glyphs.size} glyphs)`);
}
