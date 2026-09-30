#!/usr/bin/env node
// Music-visualiser preset: README header generator for ULTRA-SATISFACTORY.
//
//   node examples/ultra-satisfactory/src/08-milkdrop-visualiser_opus_5.5.mjs
//
// Writes, next to this folder:
//   assets/08-milkdrop-visualiser_opus_5.5.svg        the visualiser (the header image)
//   assets/08-milkdrop-visualiser_opus_5.5-scope.svg  a closing rule: a stopped player's scope
//   08-milkdrop-visualiser_opus_5.5.md                the header markdown itself
// Plain Node, no dependencies, no randomness: every shape is a closed-form
// function of its index, so the output regenerates byte for byte.
//
// The look is the early-2000s "preset" visualiser (MilkDrop, by Ryan Geiss,
// is the credited reference; nothing of it is reproduced here: no preset, no
// preset name, no author handle, no code). What is imitated is the general
// recipe:
//   - a closed waveform ring born at the centre several times a second,
//   - a field that zooms, rotates and slowly warps, so old rings fly outward
//     and fade,
//   - "video echo": a mirrored, fainter, softer copy of the whole field,
//   - a grid of short motion-vector marks showing the flow,
//   - an outer and an inner border hugging the screen edge,
//   - small plain overlay text (fps, preset name, song title),
//   - a slow blend from one preset to the next.
// There is no real feedback buffer in an SVG, so the zoom is faked: each ring
// is a static path that one shared keyframe animation scales exponentially,
// rotates and fades; staggered negative delays keep the tunnel full from the
// very first frame.
//
// Three presets, one per tab of the app, each in its tab colour:
//   OBJECTIVES (purple)  five-armed spiral rosette: 5 Space Elevator phases
//   ITEMS      (pink)    a twelve-tooth cog whose teeth bounce like a spectrum
//   BUILDINGS  (blue)    nested hexagons with a ripple running along each edge
// The centre is a hex-cog emblem, redrawn from scratch for this header.
//
// Facts on screen were checked against the app's data on 2026-09-30:
//   140 craftable items, 211 machine recipes, 477 buildings, 5 phases.
// All lettering is drawn from the fonts defined below (a proportional pixel
// sans for the overlay text, a chamfered stroke face for the title); there is
// no <text>, so it renders the same on every machine.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(HERE, '../assets/08-milkdrop-visualiser_opus_5.5.svg');

// ---------------------------------------------------------------- geometry
const W = 840, H = 440;            // viewBox: 1 unit is about 1 px on github.com desktop
const CX = 420, CY = 158;          // the field's centre ("cx, cy" in preset terms)
const RING_R = 520;                // ring paths are authored at their final size...
const S0 = 0.1;                    // ...and born at a tenth of it (r = 52, just outside the emblem)
const RINGS = 36;                  // rings alive at once, per preset
const SHAPES = 12;                 // distinct waveform snapshots per preset (each used RINGS/SHAPES times)
const RING_T = 14.4;               // seconds a ring lives: one is born every RING_T / RINGS = 0.4 s
const PRESET_T = 12, BLEND_T = 3;  // each preset holds for 9 s, then blends for 3 s
const LOOP_T = PRESET_T * 3;
const TS = 2;                      // overlay text: one font pixel = 2 units

const TAU = Math.PI * 2;
const r1 = (v) => { const s = (Math.round(v * 10) / 10).toString(); return s === '-0' ? '0' : s; };
const r2 = (v) => { const s = (Math.round(v * 100) / 100).toString(); return s === '-0' ? '0' : s; };
const pct = (v) => r2(v * 100) + '%';

// ---------------------------------------------------------------- colour
const hex2rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const rgb2hex = (c) => '#' + c.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
// Cyclic ramp through a list of stops: t in [0, 1) wraps back to the first stop.
function ramp(stops, t) {
  const n = stops.length, x = ((t % 1) + 1) % 1 * n, i = Math.floor(x), f = x - i;
  const a = hex2rgb(stops[i % n]), b = hex2rgb(stops[(i + 1) % n]);
  return rgb2hex(a.map((v, k) => v + (b[k] - v) * f));
}

const CYAN = '#00cfff', GOLD = '#e8d44d', WHITE = '#ffffff';
// main = the app's own tab colour (borders, rings, marks); ink = the same hue
// lifted a little where it has to work as small text on black.
const PRESETS = [
  {
    key: 'a', tab: 'OBJECTIVES', main: '#a855f7', ink: '#c084fc', accent: GOLD, rot: 100, mirrorVectors: false,
    stops: ['#b76bff', '#7f7bff', '#e46bff', '#e8d44d'],
    name: ['Belt Choir - ', 'Objectives', ' (what the Elevator wants).milk'],
    desc: 'pick a Space Elevator phase: the parts it needs, and how many',
  },
  {
    key: 'b', tab: 'ITEMS', main: '#ec4899', ink: '#f472b6', accent: '#ffb02e', rot: -50, mirrorVectors: true,
    stops: ['#ec4899', '#ff7a3c', '#e8d44d', '#ff3d7f'],
    name: ['Belt Choir - ', 'Items', ' (search as you type).milk'],
    desc: '140 items, 211 recipes: rates per minute, machine, cycle, power',
  },
  {
    key: 'c', tab: 'BUILDINGS', main: '#38bdf8', ink: '#38bdf8', accent: '#5eead4', rot: 60, mirrorVectors: false,
    stops: ['#38bdf8', '#00cfff', '#5eead4', '#6d7cff'],
    name: ['Belt Choir - ', 'Buildings', ' (Mk by Mk by Mk).milk'],
    desc: '477 buildings: what each one makes, plus Mk-by-Mk upgrade paths',
  },
];

// ---------------------------------------------------------------- overlay font
// A proportional pixel sans, 7 px caps, 5 px x-height, optional 2-row descender.
// Drawn for this header: rows top to bottom, '#' = lit, glyphs are as wide as
// their rows.
const FONT_SRC = {
  A: '..#..|.#.#.|.#.#.|#...#|#####|#...#|#...#', B: '####.|#...#|#...#|####.|#...#|#...#|####.',
  C: '.###.|#...#|#....|#....|#....|#...#|.###.', D: '####.|#...#|#...#|#...#|#...#|#...#|####.',
  E: '####|#...|#...|###.|#...|#...|####', F: '####|#...|#...|###.|#...|#...|#...',
  G: '.###.|#...#|#....|#.###|#...#|#...#|.###.', H: '#...#|#...#|#...#|#####|#...#|#...#|#...#',
  I: '###|.#.|.#.|.#.|.#.|.#.|###', J: '..#|..#|..#|..#|..#|#.#|.#.',
  K: '#...#|#..#.|#.#..|##...|#.#..|#..#.|#...#', L: '#...|#...|#...|#...|#...|#...|####',
  M: '#.....#|##...##|#.#.#.#|#..#..#|#.....#|#.....#|#.....#', N: '#...#|##..#|##..#|#.#.#|#..##|#..##|#...#',
  O: '.###.|#...#|#...#|#...#|#...#|#...#|.###.', P: '####.|#...#|#...#|####.|#....|#....|#....',
  Q: '.###.|#...#|#...#|#...#|#.#.#|#..#.|.##.#', R: '####.|#...#|#...#|####.|#.#..|#..#.|#...#',
  S: '.###.|#...#|#....|.###.|....#|#...#|.###.', T: '#####|..#..|..#..|..#..|..#..|..#..|..#..',
  U: '#...#|#...#|#...#|#...#|#...#|#...#|.###.', V: '#...#|#...#|#...#|.#.#.|.#.#.|..#..|..#..',
  W: '#.....#|#.....#|#..#..#|#..#..#|#.#.#.#|.#...#.|.#...#.', X: '#...#|#...#|.#.#.|..#..|.#.#.|#...#|#...#',
  Y: '#...#|#...#|.#.#.|..#..|..#..|..#..|..#..', Z: '#####|....#|...#.|..#..|.#...|#....|#####',
  a: '....|....|.##.|...#|.###|#..#|.###', b: '#...|#...|###.|#..#|#..#|#..#|###.',
  c: '...|...|.##|#..|#..|#..|.##', d: '...#|...#|.###|#..#|#..#|#..#|.###',
  e: '....|....|.##.|#..#|####|#...|.###', f: '.##|#..|###|#..|#..|#..|#..',
  g: '....|....|.###|#..#|#..#|#..#|.###|...#|.##.', h: '#...|#...|###.|#..#|#..#|#..#|#..#',
  i: '#|.|#|#|#|#|#', j: '.#|..|.#|.#|.#|.#|.#|.#|#.',
  k: '#...|#...|#..#|#.#.|##..|#.#.|#..#', l: '#|#|#|#|#|#|#',
  m: '.....|.....|##.#.|#.#.#|#.#.#|#.#.#|#.#.#', n: '....|....|###.|#..#|#..#|#..#|#..#',
  o: '....|....|.##.|#..#|#..#|#..#|.##.', p: '....|....|###.|#..#|#..#|#..#|###.|#...|#...',
  q: '....|....|.###|#..#|#..#|#..#|.###|...#|...#', r: '...|...|#.#|##.|#..|#..|#..',
  s: '...|...|.##|#..|.#.|..#|##.', t: '.#.|.#.|###|.#.|.#.|.#.|..#',
  u: '....|....|#..#|#..#|#..#|#..#|.###', v: '.....|.....|#...#|#...#|.#.#.|.#.#.|..#..',
  w: '.....|.....|#...#|#.#.#|#.#.#|#.#.#|.#.#.', x: '....|....|#..#|#..#|.##.|#..#|#..#',
  y: '....|....|#..#|#..#|#..#|#..#|.###|...#|.##.', z: '....|....|####|...#|.##.|#...|####',
  0: '.###.|#...#|#...#|#...#|#...#|#...#|.###.', 1: '.#.|##.|.#.|.#.|.#.|.#.|###',
  2: '.###.|#...#|....#|...#.|..#..|.#...|#####', 3: '.###.|#...#|....#|..##.|....#|#...#|.###.',
  4: '...#.|..##.|.#.#.|#..#.|#####|...#.|...#.', 5: '#####|#....|####.|....#|....#|#...#|.###.',
  6: '.###.|#....|#....|####.|#...#|#...#|.###.', 7: '#####|....#|...#.|...#.|..#..|..#..|..#..',
  8: '.###.|#...#|#...#|.###.|#...#|#...#|.###.', 9: '.###.|#...#|#...#|.####|....#|....#|.###.',
  '.': '.|.|.|.|.|.|#', ',': '..|..|..|..|..|..|.#|.#|#.', ':': '.|.|#|.|.|.|#',
  '-': '...|...|...|...|###|...|...', '!': '#|#|#|#|#|.|#', "'": '#|#|.|.|.|.|.',
  '(': '.#|#.|#.|#.|#.|#.|#.|.#', ')': '#.|.#|.#|.#|.#|.#|.#|#.',
  '/': '...#|...#|..#.|..#.|.#..|.#..|#...|#...', '&': '.##..|#..#.|#..#.|.##..|#.#.#|#..#.|.##.#',
  '+': '...|...|.#.|###|.#.|...|...', '?': '.##.|#..#|...#|..#.|.#..|....|.#..',
  '♪': '..##.|..#.#|..#..|..#..|.##..|###..|.#...', '·': '.|.|.|#|.|.|.',
  '■': '.....|#####|#####|#####|#####|#####|.....', _: '....|....|....|....|....|....|....|####',
};
const FONT = {};
for (const [ch, src] of Object.entries(FONT_SRC)) {
  const rows = src.split('|');
  if (rows.length < 7 || rows.length > 9 || rows.some((r) => r.length !== rows[0].length)) throw new Error(`bad glyph ${ch}`);
  FONT[ch] = { rows, w: rows[0].length };
}
const SPACE_W = 3;
const gid = (ch) => 'g' + ch.codePointAt(0).toString(36);
const sid = (ch) => 'h' + ch.codePointAt(0).toString(36);   // its shadow
const usedGlyphs = new Set();
const glyphDefs = () => [...usedGlyphs].sort().map((ch) => `<path id="${gid(ch)}" d="${glyphPath(FONT[ch].rows)}"/><path id="${sid(ch)}" d="${shadowPath(FONT[ch].rows)}"/>`).join('\n');

// Lit cells -> as few rectangles as possible (runs along a row, then equal runs
// stacked). A cell is `unit` wide and the grid's origin sits at (ox, oy).
function rectPath(rows, unit = 1, ox = 0, oy = 0) {
  let runs = [];
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      if (row[x] !== '#') continue;
      let e = x; while (e < row.length && row[e] === '#') e++;
      runs.push([x, y, e - x, 1]); x = e;
    }
  });
  runs.sort((a, b) => a[0] - b[0] || a[2] - b[2] || a[1] - b[1]);
  const out = [];
  for (const r of runs) {
    const p = out[out.length - 1];
    if (p && p[0] === r[0] && p[2] === r[2] && p[1] + p[3] === r[1]) p[3]++;
    else out.push([...r]);
  }
  return out.map(([x, y, w, h]) => `M${x * unit + ox} ${y * unit + oy}h${w * unit}v${h * unit}h${-w * unit}z`).join('');
}
const glyphPath = (rows) => rectPath(rows);
// The black backing of a glyph, baked into one shape: the glyph pushed half a
// pixel each way (an outline) plus a drop shadow down and to the right. Built
// on a half-pixel grid, so one <use> does what six stacked copies would.
const SHADOW_STAMPS = [[-1, 0], [1, 0], [0, -1], [0, 1], [1, 1], [2, 2]];
function shadowPath(rows) {
  const grid = Array.from({ length: rows.length * 2 + 4 }, () => Array(rows[0].length * 2 + 4).fill('.'));
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      if (row[x] !== '#') continue;
      for (const [dx, dy] of SHADOW_STAMPS) for (let sy = 0; sy < 2; sy++) for (let sx = 0; sx < 2; sx++) grid[2 * y + dy + 1 + sy][2 * x + dx + 1 + sx] = '#';
    }
  });
  return rectPath(grid.map((r) => r.join('')), 0.5, -0.5, -0.5);
}
// Pen advance of a string (each glyph plus its 1 px gap); the inked width is one less.
function advance(str) {
  let w = 0;
  for (const ch of str) {
    if (ch === ' ') { w += SPACE_W; continue; }
    if (!FONT[ch]) throw new Error(`no glyph for "${ch}"`);
    w += FONT[ch].w + 1;
  }
  return w;
}
const textWidth = (str) => advance(str) - 1;
function textUses(str, x0 = 0, id = gid) {
  let x = x0, out = '';
  for (const ch of str) {
    if (ch === ' ') { x += SPACE_W; continue; }
    usedGlyphs.add(ch);
    out += `<use href="#${id(ch)}"${x ? ` x="${x}"` : ''}/>`;
    x += FONT[ch].w + 1;
  }
  return out;
}

// A line of overlay text made of [string, fill] segments: first the baked
// shadow glyphs in translucent black (an outline plus a drop shadow, so the
// line reads over bright rings), then the glyphs in colour. Positions are
// whole units so the font pixels stay crisp.
function line(segs, x, y, align = 'left') {
  const total = textWidth(segs.map((s) => s[0]).join(''));
  if (total * TS > W - 28) throw new Error(`line too wide (${total * TS}px): ${segs.map((s) => s[0]).join('')}`);
  const left = Math.round(align === 'right' ? x - total * TS : align === 'center' ? x - total * TS / 2 : x);
  let shadow = '', colour = '', gx = 0;
  for (const [str, fill] of segs) {
    shadow += textUses(str, gx, sid);
    colour += `<g fill="${fill}">${textUses(str, gx)}</g>`;
    gx += advance(str);
  }
  return { svg: `<g transform="translate(${left} ${y}) scale(${TS})"><g class="sh">${shadow}</g>${colour}</g>`, left, width: total * TS };
}

// ---------------------------------------------------------------- waveform rings
// Angles run clockwise from straight up, so every shape is symmetric about
// the vertical axis and the hexagons stand on a point like the emblem.
const pol = (r, a) => [r * Math.sin(a), -r * Math.cos(a)];

// Integer path data with relative commands; the running position is the
// rounded one, so rounding never accumulates.
function polyPath(pts) {
  let cx = Math.round(pts[0][0]), cy = Math.round(pts[0][1]);
  let d = `M${cx} ${cy}`;
  for (let i = 1; i < pts.length; i++) {
    const x = Math.round(pts[i][0]), y = Math.round(pts[i][1]);
    const dx = x - cx, dy = y - cy;
    d += `l${dx}${dy < 0 ? '' : ' '}${dy}`;
    cx = x; cy = y;
  }
  return d + 'z';
}
// Closed smooth curve through the samples (Catmull-Rom as cubic Beziers). With
// uniform tangents every segment's first control point mirrors the previous
// second one, so after the first "c" each segment is a short "s".
function smoothPath(pts) {
  const n = pts.length;
  const tan = (i) => [(pts[(i + 1) % n][0] - pts[(i - 1 + n) % n][0]) / 6, (pts[(i + 1) % n][1] - pts[(i - 1 + n) % n][1]) / 6];
  let cx = Math.round(pts[0][0]), cy = Math.round(pts[0][1]);
  let d = `M${cx} ${cy}`;
  const rel = (x, y) => { const dx = Math.round(x) - cx, dy = Math.round(y) - cy; return `${dx}${dy < 0 ? '' : ' '}${dy}`; };
  for (let i = 0; i < n; i++) {
    const p1 = pts[(i + 1) % n], t0 = tan(i), t1 = tan(i + 1);
    const c2 = [p1[0] - t1[0], p1[1] - t1[1]];
    if (i === 0) {
      const c1 = [pts[0][0] + t0[0], pts[0][1] + t0[1]];
      d += `c${rel(c1[0], c1[1])} ${rel(c2[0], c2[1])} ${rel(p1[0], p1[1])}`;
    } else d += `s${rel(c2[0], c2[1])} ${rel(p1[0], p1[1])}`;
    cx = Math.round(p1[0]); cy = Math.round(p1[1]);
  }
  return d.replace(/ -/g, '-') + 'z';
}

// Preset A, OBJECTIVES: a five-lobed rosette (five Space Elevator phases). Each
// snapshot turns the lobes a little further, so successive rings line up into
// five spiral arms.
function shapeA(j) {
  const ph = TAU * j / SHAPES, pts = [], n = 60;
  for (let i = 0; i < n; i++) {
    const a = TAU * i / n;
    const r = RING_R * (0.9 + 0.13 * Math.cos(5 * a - ph) + 0.04 * Math.cos(10 * a + 2 * ph));
    pts.push(pol(r, a));
  }
  return smoothPath(pts);
}
// Preset B, ITEMS: a twelve-tooth cog. Tooth height is the "spectrum": it
// changes from snapshot to snapshot, so the teeth bounce as the rings fly out.
function shapeB(j) {
  const ph = TAU * j / SHAPES, pts = [], teeth = 12, pitch = TAU / teeth, root = RING_R * 0.84;
  for (let k = 0; k < teeth; k++) {
    const a = k * pitch;
    const tip = root * (1.15 + 0.08 * Math.cos(ph + TAU * k / 3) + 0.035 * Math.cos(2 * ph - TAU * k / 4));
    pts.push(pol(root, a - 0.27 * pitch), pol(tip, a - 0.16 * pitch), pol(tip, a + 0.16 * pitch), pol(root, a + 0.27 * pitch));
  }
  return polyPath(pts);
}
// Preset C, BUILDINGS: a hexagon with a ripple travelling along each edge; the
// ripple is pinned to zero at the corners so they stay sharp.
function shapeC(j) {
  const ph = TAU * j / SHAPES, pts = [], sub = 12, R = RING_R * 0.98;
  for (let k = 0; k < 6; k++) {
    const v0 = pol(R, k * TAU / 6), v1 = pol(R, (k + 1) * TAU / 6);
    const nrm = pol(1, (k + 0.5) * TAU / 6);
    for (let i = 0; i < sub; i++) {
      const u = i / sub;
      const off = RING_R * 0.032 * Math.sin(TAU * 2 * u - ph) * Math.sin(Math.PI * u) ** 1.2;
      pts.push([v0[0] + (v1[0] - v0[0]) * u + nrm[0] * off, v0[1] + (v1[1] - v0[1]) * u + nrm[1] * off]);
    }
  }
  return polyPath(pts);
}
const SHAPE_FN = { a: shapeA, b: shapeB, c: shapeC };

// ---------------------------------------------------------------- the zoom
// One keyframe block per preset. Scale follows an exponential (equal time =
// equal zoom factor, which is what a feedback buffer does), rotation is
// linear, brightness decays, and a newborn ring is white-hot before it cools
// to its own colour.
function zoomKeyframes(name, rot) {
  const steps = 10, kf = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const s = S0 * (1 / S0) ** t;
    const op = i === 0 ? 0 : i === steps ? 0 : Math.max(0, (1 - t) ** 1.05);
    kf.push(`${pct(t)}{transform:rotate(${r1(rot * t)}deg) scale(${r2(s)});opacity:${r2(op)}${i === 0 ? ';stroke:#fff' : ''}}`);
  }
  kf.splice(1, 0, '2.5%{opacity:1}', '7%{stroke:var(--c)}');
  return `@keyframes ${name}{${kf.join('')}}`;
}

// ---------------------------------------------------------------- motion vectors
// A regular grid of short marks, each pointing back along the flow (zoom out
// from the centre, with a slight swirl). Coordinates are relative to the centre.
function motionVectors() {
  let lines = '', dots = '';
  const swirl = 0.32, k = 0.055;
  for (let gy = 20; gy < H; gy += 40) for (let gx = 20; gx < W; gx += 40) {
    const x = gx - CX, y = gy - CY, dist = Math.hypot(x, y);
    if (dist < 78) continue;
    const vx = k * (x - swirl * y), vy = k * (y + swirl * x);
    lines += `M${x} ${y}l${r1(-vx)}${-vy < 0 ? '' : ' '}${r1(-vy)}`;
    dots += `M${x} ${y}h0`;
  }
  return { lines, dots };
}

// ---------------------------------------------------------------- title face
// Chamfered stroke letters (only the eleven the name needs), on a 5 x 7 unit
// cell, drawn as centre lines and stroked with square caps and mitred joins.
const CH = 1.3;   // chamfer
const TITLE_GLYPHS = {
  U: { w: 5, d: [[[0, 0], [0, 7 - CH], [CH, 7], [5 - CH, 7], [5, 7 - CH], [5, 0]]] },
  L: { w: 4.2, d: [[[0, 0], [0, 7], [4.2, 7]]] },
  T: { w: 5, d: [[[0, 0], [5, 0]], [[2.5, 0], [2.5, 7]]] },
  R: { w: 5, d: [[[0, 7], [0, 0], [5 - CH, 0], [5, CH], [5, 3.8 - CH], [5 - CH, 3.8], [0, 3.8]], [[3.1, 3.8], [5, 5.6], [5, 7]]] },
  A: { w: 5, d: [[[0, 7], [0, CH], [CH, 0], [5 - CH, 0], [5, CH], [5, 7]], [[0, 4.5], [5, 4.5]]] },
  S: { w: 5, d: [[[5, 0], [CH, 0], [0, CH], [0, 3.5 - CH], [CH, 3.5], [5 - CH, 3.5], [5, 3.5 + CH], [5, 7 - CH], [5 - CH, 7], [0, 7]]] },
  I: { w: 0, d: [[[0, 0], [0, 7]]] },
  F: { w: 4.4, d: [[[0, 7], [0, 0], [4.4, 0]], [[0, 3.6], [3.4, 3.6]]] },
  C: { w: 5, d: [[[5, 0], [CH, 0], [0, CH], [0, 7 - CH], [CH, 7], [5, 7]]] },
  O: { w: 5, closed: true, d: [[[CH, 0], [5 - CH, 0], [5, CH], [5, 7 - CH], [5 - CH, 7], [CH, 7], [0, 7 - CH], [0, CH]]] },
  Y: { w: 5, d: [[[0, 0], [0, 1.7], [2.5, 4.1], [5, 1.7], [5, 0]], [[2.5, 4.1], [2.5, 7]]] },
};
const TU = 6;                 // title unit in px
const T_STROKE = 1.22 * TU;   // stroke width
const T_GAP = 1.0;            // clear space between letters, in units
function titleWord(word, x0, y0) {
  let x = x0, d = '';
  const adv = T_STROKE / TU + T_GAP;
  for (const ch of word) {
    const g = TITLE_GLYPHS[ch];
    if (!g) throw new Error(`no title glyph ${ch}`);
    for (const stroke of g.d) {
      d += stroke.map(([px, py], i) => `${i ? 'L' : 'M'}${r1(x + px * TU)} ${r1(y0 + py * TU)}`).join('') + (g.closed ? 'z' : '');
    }
    x += (g.w + adv) * TU;
  }
  return { d, end: x - adv * TU };
}
const titleWidthUnits = (word) => [...word].reduce((s, ch) => s + TITLE_GLYPHS[ch].w, 0) + (word.length - 1) * (T_STROKE / TU + T_GAP);

// ---------------------------------------------------------------- emblem
// A hexagon standing on a point with an eight-tooth cog inside it. Own art.
function emblem() {
  const hexPts = (r) => Array.from({ length: 6 }, (_, k) => pol(r, k * TAU / 6).map(r1).join(' ')).join('L');
  const teeth = 8, pitch = TAU / teeth, ro = 27, ri = 19.5;
  let cog = '';
  for (let k = 0; k < teeth; k++) {
    const a = k * pitch;
    const p = [pol(ri, a - 0.27 * pitch), pol(ro, a - 0.17 * pitch), pol(ro, a + 0.17 * pitch), pol(ri, a + 0.27 * pitch)];
    cog += p.map((q, i) => `${k === 0 && i === 0 ? 'M' : 'L'}${r1(q[0])} ${r1(q[1])}`).join('');
  }
  cog += 'z';
  const hole = `M9 0A9 9 0 1 0-9 0A9 9 0 1 0 9 0z`;
  return `<g class="beat">`
    + `<path d="M${hexPts(45)}z" fill="#04060b" stroke="#000" stroke-width="9" stroke-linejoin="round"/>`
    + `<path d="M${hexPts(45)}z" fill="none" stroke="${GOLD}" stroke-opacity=".28" stroke-width="8" stroke-linejoin="round"/>`
    + `<path d="M${hexPts(45)}z" fill="none" stroke="${GOLD}" stroke-width="3.6" stroke-linejoin="round"/>`
    + `<path d="M${hexPts(37)}z" fill="none" stroke="${GOLD}" stroke-opacity=".45" stroke-width="1.2"/>`
    + `<g class="cog"><path d="${cog}${hole}" fill="${CYAN}" fill-rule="evenodd"/>`
    + `<circle r="13.5" fill="none" stroke="#04060b" stroke-width="1.6"/>`
    + `<circle r="4" fill="#fff"/></g>`
    + `</g>`;
}

// ---------------------------------------------------------------- build
const css = [];
const defs = [];
const body = [];

const ringDelay = RING_T / RINGS;
const presetDelay = (i) => (i === 0 ? 0 : -(LOOP_T - i * PRESET_T));

css.push(
  // Preset blend for the picture (field + borders): the next preset fades in
  // over the first two thirds of the blend while the old one fades out over
  // the last two thirds, so the screen never dips to half brightness.
  `.p{animation:p ${LOOP_T}s linear infinite}`,
  `@keyframes p{0%{opacity:1;visibility:visible}${pct((PRESET_T - BLEND_T * 2 / 3) / LOOP_T)}{opacity:1}${pct(PRESET_T / LOOP_T)}{opacity:0;visibility:visible}${pct(PRESET_T / LOOP_T + 0.0002)}{visibility:hidden}${pct(1 - BLEND_T / LOOP_T - 0.0002)}{opacity:0;visibility:hidden}${pct(1 - BLEND_T / LOOP_T)}{opacity:0;visibility:visible}${pct(1 - BLEND_T / 3 / LOOP_T)}{opacity:1}100%{opacity:1;visibility:visible}}`,
  // Preset blend for overlay text: the old line is gone before the new one
  // arrives, so two lines never sit on top of each other.
  `.q{animation:q ${LOOP_T}s linear infinite}`,
  `@keyframes q{0%{opacity:1;visibility:visible}${pct((PRESET_T - BLEND_T * 2 / 3) / LOOP_T)}{opacity:1}${pct((PRESET_T - BLEND_T / 3) / LOOP_T)}{opacity:0;visibility:visible}${pct((PRESET_T - BLEND_T / 3) / LOOP_T + 0.0002)}{visibility:hidden}${pct(1 - BLEND_T / 3 / LOOP_T - 0.0002)}{opacity:0;visibility:hidden}${pct(1 - BLEND_T / 3 / LOOP_T)}{opacity:0;visibility:visible}100%{opacity:1;visibility:visible}}`,
  `.f{fill:none;stroke-width:8;stroke-linejoin:round}`,
  // video echo: the mirrored copy is drawn wide and faint, so it reads as the
  // decayed smear a feedback buffer leaves behind the crisp newest lines
  `.e{opacity:.36;stroke-width:30}`,
  ...PRESETS.map((p) => `.z${p.key}{stroke:var(--c);animation:z${p.key} ${RING_T}s linear infinite}`),
  ...PRESETS.map((p) => zoomKeyframes(`z${p.key}`, p.rot)),
  // burned-in title: ghosts of the wordmark get dragged outward by the same zoom
  `.zt{opacity:0;animation:zt 4.8s linear infinite}`,
  `@keyframes zt{0%{transform:scale(1);opacity:0}10%{opacity:.17}55%{transform:scale(1.058);opacity:.09}100%{transform:scale(1.11);opacity:0}}`,
  // warp: the whole field breathes, a little wider then a little taller
  `.wp{animation:wp 9.6s ease-in-out infinite alternate}@keyframes wp{from{transform:scale(1.035,.97) rotate(-1.5deg)}to{transform:scale(.97,1.035) rotate(1.5deg)}}`,
  `.hot{animation:hot 1.2s cubic-bezier(.2,.7,.3,1) infinite}@keyframes hot{0%{opacity:1}55%,100%{opacity:.72}}`,
  `.beat{animation:beat 1.2s cubic-bezier(.2,.7,.3,1) infinite}`,
  `@keyframes beat{0%{transform:scale(1.045)}55%,100%{transform:scale(1)}}`,
  `.cog{animation:cog 24s linear infinite}@keyframes cog{to{transform:rotate(360deg)}}`,
  `.ob{animation:ob 4.8s ease-in-out infinite alternate}@keyframes ob{from{stroke-opacity:1}to{stroke-opacity:.62}}`,
  `.ib{animation:ib 3.6s ease-in-out infinite alternate}@keyframes ib{from{stroke-opacity:.5;stroke-width:2}to{stroke-opacity:1;stroke-width:3.4}}`,
  `.sh{fill:#000;opacity:.62}`,
  `@media (prefers-reduced-motion:reduce){*{animation-play-state:paused!important}}`,
);

defs.push(`<clipPath id="panel"><rect width="${W}" height="${H}" rx="14"/></clipPath>`);
defs.push(`<radialGradient id="hot"><stop offset="0" stop-color="#fff" stop-opacity=".5"/><stop offset=".3" stop-color="#bfeaff" stop-opacity=".2"/><stop offset=".62" stop-color="${CYAN}" stop-opacity=".06"/><stop offset="1" stop-color="${CYAN}" stop-opacity="0"/></radialGradient>`);
defs.push(`<radialGradient id="vig" cx="${CX}" cy="${CY}" r="520" gradientUnits="userSpaceOnUse"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></radialGradient>`);

// ring shapes
for (const p of PRESETS) for (let j = 0; j < SHAPES; j++) defs.push(`<path id="${p.key}${j}" d="${SHAPE_FN[p.key](j)}"/>`);

// motion vectors
const mv = motionVectors();
defs.push(`<g id="mv" fill="none" stroke-opacity=".66"><path d="${mv.lines}" stroke-width="1.1"/><path d="${mv.dots}" stroke-width="2.4" stroke-linecap="square"/></g>`);

// title (coordinates relative to the field centre, so its ghosts can zoom about it)
const TITLE_Y = 252 - CY + T_STROKE / 2;
const wU = titleWidthUnits('ULTRA'), wS = titleWidthUnits('SATISFACTORY'), WORD_GAP = 5.3;
const titleTotal = (wU + WORD_GAP + wS) * TU;
const tx0 = -titleTotal / 2;
const ultra = titleWord('ULTRA', tx0, TITLE_Y);
const satis = titleWord('SATISFACTORY', tx0 + (wU + WORD_GAP) * TU, TITLE_Y);
if (titleTotal + T_STROKE > W - 60) throw new Error('title too wide');
defs.push(`<path id="tu" d="${ultra.d}"/><path id="ts" d="${satis.d}"/>`);
defs.push(`<g id="tt" fill="none" stroke-width="${r1(T_STROKE)}" stroke-linecap="square"><use href="#tu" stroke="${CYAN}"/><use href="#ts" stroke="#dff6ff"/></g>`);

// ---- field
const field = [];
PRESETS.forEach((p, pi) => {
  let uses = '', echo = '';
  for (let j = 0; j < RINGS; j++) {
    const col = ramp(p.stops, j / RINGS * 3);
    const use = `<use href="#${p.key}${j % SHAPES}" class="z${p.key}" style="--c:${col};animation-delay:${r2(-j * ringDelay)}s"/>`;
    uses += use;
    if (j % 2 === 0) echo += use;   // the echo is soft, so every other ring is enough
  }
  const d = presetDelay(pi);
  field.push(`<g class="p"${d ? ` style="animation-delay:${d}s"` : ''}>`
    + `<use href="#mv" stroke="${p.main}"${p.mirrorVectors ? ' transform="scale(-1 1)"' : ''}/>`
    + `<g class="f e" transform="scale(-1 1)">${echo}</g>`
    + `<g class="f">${uses}</g>`
    + `</g>`);
});

// ---- borders (outer + inner), one pair per preset
const borders = PRESETS.map((p, pi) => {
  const d = presetDelay(pi);
  return `<g class="p" fill="none"${d ? ` style="animation-delay:${d}s"` : ''}>`
    + `<rect x="2.5" y="2.5" width="${W - 5}" height="${H - 5}" rx="11.5" stroke="${p.main}" stroke-width="5" class="ob"/>`
    + `<rect x="8.5" y="8.5" width="${W - 17}" height="${H - 17}" rx="6" stroke="${p.accent}" stroke-width="3" class="ib"/>`
    + `</g>`;
});

// ---- overlay text
const overlay = [];
overlay.push(line([['fps: ', '#9fb2c8'], ['60.0', WHITE]], 20, 20).svg);
overlay.push(line([['F1: ', '#9fb2c8'], ['help', '#c9d3e0']], 20, 42).svg);
PRESETS.forEach((p, pi) => {
  const d = presetDelay(pi);
  const st = d ? ` style="animation-delay:${d}s"` : '';
  const nm = line([[p.name[0], WHITE], [p.name[1], p.ink], [p.name[2], WHITE]], W - 20, 20, 'right');
  const ds = line([[p.desc, '#c9d3e0']], W - 20, 42, 'right');
  overlay.push(`<g class="q"${st}>${nm.svg}${ds.svg}</g>`);
});

// tagline + tab row under the title
const TAG_Y = 324, TAB_Y = 354;
overlay.push(line([['every recipe, building and Space Elevator objective, one click apart', '#eef4ff']], W / 2, TAG_Y, 'center').svg);
{
  const gap = 17;   // glyph px between labels
  const widths = PRESETS.map((p) => textWidth(p.tab));
  const total = widths.reduce((a, b) => a + b, 0) + gap * 2;
  let gx = W / 2 - total * TS / 2;
  PRESETS.forEach((p, pi) => {
    const w = widths[pi] * TS;
    overlay.push(line([[p.tab, '#8492a8']], gx, TAB_Y).svg);
    const d = presetDelay(pi);
    overlay.push(`<g class="q"${d ? ` style="animation-delay:${d}s"` : ''}>`
      + line([[p.tab, p.ink]], gx, TAB_Y).svg
      + `<rect x="${r1(gx - 1)}" y="${TAB_Y + 19}" width="${w + 2}" height="3" rx="1.5" fill="${p.main}"/>`
      + `<path d="M${r1(gx - 16)} ${TAB_Y + 2}l8 5-8 5z" fill="${p.main}" stroke="#000" stroke-opacity=".6"/>`
      + `</g>`);
    if (pi < 2) {
      const sx = Math.round(gx + w + gap * TS / 2) - 2;
      overlay.push(`<rect x="${sx - 1}" y="${TAB_Y + 4}" width="6" height="6" fill="#000" opacity=".62"/><rect x="${sx}" y="${TAB_Y + 5}" width="4" height="4" fill="#8492a8"/>`);
    }
    gx += w + gap * TS;
  });
}
// Song-title line, one per preset. A preset lasts PRESET_T seconds and an Iron
// Rod takes 4 s in a Constructor (15 a minute), so the count in the joke is real.
const ROD_CYCLE = 4;
const SONGS = [
  'now playing: nothing. the factory hums.',
  `still nothing. that was ${PRESET_T / ROD_CYCLE} Iron Rods ago.`,
  `${2 * PRESET_T / ROD_CYCLE} Iron Rods in. just one more belt.`,
];
const live = line([['live: ', '#9fb2c8'], ['lukexyz.github.io/ULTRA-SATISFACTORY', WHITE]], W - 20, 406, 'right');
overlay.push(live.svg);
PRESETS.forEach((p, pi) => {
  const d = presetDelay(pi);
  const song = line([['♪ ', GOLD], [SONGS[pi], '#d7dfeb']], 20, 406);
  if (song.left + song.width > live.left - 12) throw new Error(`song line ${pi} runs into the url`);
  overlay.push(`<g class="q"${d ? ` style="animation-delay:${d}s"` : ''}>${song.svg}</g>`);
});

// glyph defs (only the ones used), each with its shadow
defs.push(glyphDefs());

// ---- assemble
const trails = Array.from({ length: 6 }, (_, i) => `<use href="#tt" class="zt" style="animation-delay:${r2(-i * 0.8)}s"/>`).join('');
const titleSvg = `<g fill="none" stroke-linecap="square">`
  + `<g stroke="#000" stroke-linejoin="round"><use href="#tu" stroke-width="${r1(T_STROKE + 9)}" stroke-opacity=".78"/><use href="#ts" stroke-width="${r1(T_STROKE + 9)}" stroke-opacity=".78"/></g>`
  + `<use href="#tu" stroke="${CYAN}" stroke-opacity=".22" stroke-width="${r1(T_STROKE + 6)}"/>`
  + `<use href="#ts" stroke="#9fe6ff" stroke-opacity=".2" stroke-width="${r1(T_STROKE + 6)}"/>`
  + `<use href="#tu" stroke="${CYAN}" stroke-width="${r1(T_STROKE)}"/>`
  + `<use href="#ts" stroke="#fff" stroke-width="${r1(T_STROKE)}"/>`
  + `<use href="#tu" stroke="#d9f8ff" stroke-width="${r1(T_STROKE * 0.24)}"/>`
  + `</g>`;

body.push(`<rect width="${W}" height="${H}" fill="#000"/>`);
body.push(`<g transform="translate(${CX} ${CY})">`);
body.push(`<g class="wp">${field.join('\n')}</g>`);
body.push(`<circle r="150" fill="url(#hot)" class="hot"/>`);
body.push(`</g>`);
body.push(`<rect width="${W}" height="${H}" fill="url(#vig)"/>`);
body.push(`<g transform="translate(${CX} ${CY})">`);
body.push(trails);
body.push(titleSvg);
body.push(emblem());
body.push(`</g>`);
body.push(borders.join('\n'));
body.push(overlay.join('\n'));

const desc = 'A music-visualiser preset with nothing playing. On a black screen, waveform rings are born around a gold hexagon with a turning cyan cog inside it and fly outward, rotating and fading, into a mandala tunnel; a mirrored echo doubles the pattern and a grid of small motion-vector marks shows the flow. ULTRA in neon cyan and SATISFACTORY in white sit under the emblem, above the line: every recipe, building and Space Elevator objective, one click apart. Every twelve seconds the preset blends into the next, one per tab of the app: OBJECTIVES, a purple five-armed spiral; ITEMS, a pink cog with bouncing teeth; BUILDINGS, blue nested hexagons. Overlay text: fps 60.0, the preset name, now playing: nothing, the factory hums, and live: lukexyz.github.io/ULTRA-SATISFACTORY. Unofficial fan project.';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="t d">
<title id="t">ULTRA-SATISFACTORY</title>
<desc id="d">${desc}</desc>
<style>${css.join('\n')}</style>
<defs>${defs.join('\n')}</defs>
<g clip-path="url(#panel)">
${body.join('\n')}
</g>
</svg>
`;
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, svg);
console.log(`wrote ${path.relative(process.cwd(), OUT)} (${(svg.length / 1024).toFixed(1)} KB): ${RINGS} rings x 3 presets, title ${Math.round(titleTotal + T_STROKE)} px wide, loop ${LOOP_T}s`);

// ================================================================ markdown
// The header itself. Text-art blocks are built here so that every line is
// padded and measured by code: nothing over 80 columns, no trailing spaces.
const COLS = 80;
const chk = (l) => { if ([...l].length > COLS) throw new Error(`over ${COLS} cols: ${l}`); return l.replace(/\s+$/, ''); };
const box = {
  top: () => '╭' + '─'.repeat(COLS - 2) + '╮',
  bottom: () => '╰' + '─'.repeat(COLS - 2) + '╯',
  rule: (label = '') => '├' + (label ? `─[ ${label} ]` : '').padEnd(COLS - 2, '─') + '┤',
  row: (t = '') => { if ([...t].length > COLS - 4) throw new Error(`box row too long: ${t}`); return '│  ' + t.padEnd(COLS - 4) + '│'; },
  split: (l, r) => box.row(l + r.padStart(COLS - 6 - [...l].length) + '  '),
};

// ---- F1: help
const help = [
  box.top(),
  box.split('ULTRA-SATISFACTORY · HELP', 'close: the little triangle'),
  box.rule(),
  box.row(),
  box.row('F1 ......... this help. you found it'),
  box.row('F2 ......... song title. nothing is playing: that hum is the factory'),
  box.row('F4 ......... preset name. there are three, one per tab of the app'),
  box.row('F5 ......... frame rate. it reads 60.0 because 60.0 is what got drawn'),
  box.row('T .......... launch the title animation. too late: it is the big one'),
  box.row('SPACE ...... next preset: Objectives → Items → Buildings → round again'),
  box.row('ALT+TAB .... back to the game. the only shortcut that matters'),
  box.row('ESC ........ go to bed. not bound'),
  box.row(),
  box.row('(no key is wired to anything. it is a picture. the app is real.)'),
  box.row(`(the Iron Rod count is real too: a preset lasts ${PRESET_T} s, a rod takes ${ROD_CYCLE}.)`),
  box.row(),
  box.rule('the three presets'),
  box.row(),
  box.row('OBJECTIVES   purple, five spiral arms: one per Space Elevator phase.'),
  box.row('             pick a phase, see the parts it needs and how many,'),
  box.row('             click a part for its recipe'),
  box.row(),
  box.row('ITEMS        pink, a cog with twelve bouncing teeth. 140 items,'),
  box.row('             searched on every keystroke. recipe cards: ingredients'),
  box.row('             with per-minute rates, the machine, its cycle time and'),
  box.row('             power draw, and the products'),
  box.row(),
  box.row('BUILDINGS    blue, nested hexagons. 477 buildings and what each one'),
  box.row('             makes, grouped by tier, plus Mk-by-Mk upgrade paths for'),
  box.row('             miners, conveyors, pipelines and storage'),
  box.row(),
  box.row('everything links: click an ingredient or a product and its recipe'),
  box.row('opens. click the machine and its building opens.'),
  box.row(),
  box.bottom(),
].map(chk);

// ---- the playlist: standard recipes, checked against the app's data on 2026-09-30
// [item, output per minute, cycle seconds, machine, MW]
const TRACKS = [
  ['Iron Ingot', 30, 2, 'Smelter', 4], ['Copper Ingot', 30, 2, 'Smelter', 4], ['Caterium Ingot', 15, 4, 'Smelter', 4],
  ['Iron Plate', 20, 6, 'Constructor', 4], ['Iron Rod', 15, 4, 'Constructor', 4], ['Screw', 40, 6, 'Constructor', 4],
  ['Wire', 30, 4, 'Constructor', 4], ['Cable', 30, 2, 'Constructor', 4],
  ['Reinforced Iron Plate', 5, 12, 'Assembler', 15], ['Rotor', 4, 15, 'Assembler', 15], ['Smart Plating', 2, 30, 'Assembler', 15],
  ['Versatile Framework', 5, 24, 'Assembler', 15], ['Modular Frame', 2, 60, 'Assembler', 15],
  ['Heavy Modular Frame', 2, 30, 'Manufacturer', 55], ['Modular Engine', 1, 60, 'Manufacturer', 55],
  ['Adaptive Control Unit', 1, 120, 'Manufacturer', 55],
];
const mmss = (sec) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
const totalSec = TRACKS.reduce((a, t) => a + t[2], 0);
const PHASES = [
  ['Automation basics', ['Smart Plating x50', 'Versatile Framework x100', 'Automated Wiring x500']],
  ['Logistics & steel', ['Automated Wiring x500', 'Modular Frame x500', 'Smart Plating x100', 'Versatile Framework x500']],
  ['Oil & computers', ['Versatile Framework x2500', 'Modular Engine x500', 'Adaptive Control Unit x100']],
  ['Nuclear & endgame', ['Assembly Director System x1000', 'Magnetic Field Generator x500', 'Nuclear Pasta x100', 'Thermal Propulsion Rocket x25']],
  ['Alien tech & quantum', ['Biochemical Sculptor x500', 'AI Expansion Server x100', 'Neural-Quantum Processor x100', 'Ballistic Warp Drive x100']],
];
const vfTrack = TRACKS.findIndex((t) => t[0] === 'Versatile Framework');
const vfPerMin = TRACKS[vfTrack][1];
const vfMinutes = 2500 / vfPerMin;
const VF_CHOIR = 5;   // "Five Assemblers" in the punchline: 2500 / (5 x 5 a minute) = 100 minutes
const plHead = ' FACTORY_HUM.M3U';
const plHeadR = `${TRACKS.length} tracks · ${mmss(totalSec)} · repeat: all, forever`;
const PL_W = 71;   // the track table's width
const playlist = [
  plHead + plHeadR.padStart(PL_W - plHead.length),
  '',
  '  #   TRACK                     LENGTH   PER MIN   VENUE          POWER',
  ' ──   ───────────────────────   ──────   ───────   ────────────   ─────',
  ...TRACKS.map(([item, rate, cyc, mach, mw], i) =>
    ` ${String(i + 1).padStart(2, '0')}   ${item.padEnd(23)}   ${mmss(cyc).padStart(5)}    ${String(rate).padStart(4)}      ${mach.padEnd(12)}   ${String(mw).padStart(2)} MW`),
  '',
  ' LENGTH is one machine cycle. PER MIN is what one machine puts out.',
  ' Standard recipes, one machine each, nothing overclocked. The app has all',
  ` 211 recipes (88 of them alternates). These ${TRACKS.length} just made the album.`,
  '',
  ' ♪ SET LIST: what the Space Elevator wants, phase by phase',
  '',
  ...PHASES.flatMap(([name, parts], i) => {
    const lead = ` ${i + 1}  ${name.padEnd(22)}`, pad = ' '.repeat(lead.length), out = [];
    let cur = '';
    for (const part of parts) {
      const next = cur ? `${cur} · ${part}` : part;
      if ((lead + next).length > COLS - 3) { out.push(cur + ' ·'); cur = part; } else cur = next;
    }
    out.push(cur);
    return out.map((l, k) => (k ? pad : lead) + l);
  }),
  '',
  ` Phase 3 alone wants 2500 Versatile Framework. One Assembler plays track ${vfTrack + 1}`,
  ` at ${vfPerMin} a minute: 2500 / ${vfPerMin} = ${vfMinutes} minutes = ${Math.floor(vfMinutes / 60)} h ${vfMinutes % 60} of the same song.`,
  ` Five Assemblers do it in ${Math.floor(vfMinutes / VF_CHOIR / 60)} h ${vfMinutes / VF_CHOIR % 60}, in five-part harmony. Build the choir.`,
].map(chk);

// ---- preset info: about, wiring, credits, greetz
const about = [
  '; ultra-satisfactory.preset',
  '; not a real preset file. it is a README wearing one.',
  '',
  '[what]',
  'name         = ULTRA-SATISFACTORY',
  'is           = a companion app for the game Satisfactory',
  'does         = looks things up: recipes, buildings, Space Elevator objectives',
  'does_not     = play music, count your frames, or hear a beat. the pulse',
  '               in the middle is a timer',
  'affiliation  = none. unofficial fan project, not affiliated with Coffee',
  '               Stain Studios. Satisfactory is their game. this hums along',
  '',
  '[field]',
  'items        = 140     ; craftable',
  'recipes      = 211     ; machine recipes, 88 of them alternates',
  'buildings    = 477     ; 9 production machines, 333 structure pieces,',
  '                       ; 59 logistics, 26 decor, 15 power, 14 transit,',
  '                       ; 7 special, 7 storage, 7 extraction',
  'phases       = 5       ; Space Elevator',
  'tabs         = 3       ; Objectives, Items, Buildings',
  'decay        = 0.98    ; of your evening, per frame',
  'zoom         = "just one more belt"',
  '',
  '[signal chain]',
  'source       = data/data.json              ; the game data',
  'loader       = ultra_satisfactory/data.py  ; works out the per-minute rates',
  'output       = app/app.py                  ; one Streamlit app, three tabs,',
  '                                           ; streamlit-aggrid for the grids',
  '',
  '[outputs]',
  'local        = python -m streamlit run app/app.py    ; localhost:8501',
  'browser      = lukexyz.github.io/ULTRA-SATISFACTORY  ; nothing to install',
  'cloud        = modal_app.py                          ; Streamlit on Modal',
  '; the browser one is a stlite build: Streamlit on WebAssembly, republished',
  '; by GitHub Actions on every push to main',
  '',
  '[credits]',
  'game_data    = greeny/SatisfactoryTools',
  'images       = the Satisfactory Wiki (CC BY-NC-SA 4.0)',
  'licence      = Apache 2.0, for the code. copy protection: none. remix it',
  'visualiser   = a homage to MilkDrop by Ryan Geiss. the look only: no preset,',
  '               no code and no artwork was borrowed. nothing is listening',
  '',
  '[greetz]',
  'to           = the Belt Choir (sopranos on Mk.1, basses on Mk.5)',
  '             + the Hum Appreciation Society',
  '             + Friends of the Idle Constructor',
  '             + the Committee for Perfectly Parallel Pipes',
  '             + everyone who has left the game running just for the hum',
  '             + whoever is awake at 3 a.m. with 40 Screws a minute and a dream',
].map(chk);

// ================================================================ scope strip
// A closing rule: the player is stopped, so the oscilloscope shows a flat line
// with a faint mains hum on it. The line doubles as a conveyor: small hexagon
// "items" ride along it. The running time is the playlist's, computed above.
const SCOPE = path.resolve(HERE, '../assets/08-milkdrop-visualiser_opus_5.5-scope.svg');
{
  usedGlyphs.clear();
  const SW = W, SH = 40, y0 = 20;
  const left = line([['■ ', '#ec4899'], ['stopped  ', '#d7dfeb'], [`0:00 / ${mmss(totalSec)}`, '#9fb2c8']], 18, 13);
  const right = line([['0 kbps', WHITE], ['  the hum is real', '#9fb2c8']], SW - 18, 13, 'right');
  const x0 = Math.ceil((left.left + left.width + 18) / 2) * 2, x1 = Math.floor((right.left - 18) / 2) * 2;
  const wave = 24;            // one full period of the hum, px
  let hum = `M${x0 - wave} ${y0}q${wave / 4} -3.4 ${wave / 2} 0`;
  for (let x = x0 - wave / 2; x < x1 + wave; x += wave / 2) hum += `t${wave / 2} 0`;
  const pitch = 88, cols = ['#a855f7', '#ec4899', '#38bdf8', GOLD];   // item spacing; the colour order repeats every 4 items
  const hexD = 'M' + Array.from({ length: 6 }, (_, k) => pol(6.5, k * TAU / 6).map(r1).join(' ')).join('L') + 'z';
  let items = '';
  for (let i = 0, x = x0 - pitch * 4; x < x1 + pitch; x += pitch, i++) items += `<use href="#hx" x="${x}" y="${y0}" stroke="${cols[i % 4]}" color="${cols[i % 4]}"/>`;
  const scope = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SW} ${SH}" width="${SW}" height="${SH}" role="img" aria-labelledby="t">
<title id="t">A stopped player's oscilloscope: a flat line with a faint hum, carrying small hexagons along it like a conveyor belt</title>
<style>.sh{fill:#000;opacity:.62}
.hm{animation:hm .9s linear infinite}@keyframes hm{to{transform:translateX(-${wave}px)}}
.it{animation:it ${r1(pitch * 4 / 22)}s linear infinite}@keyframes it{to{transform:translateX(${pitch * 4}px)}}
@media (prefers-reduced-motion:reduce){*{animation-play-state:paused!important}}</style>
<defs><clipPath id="p"><rect width="${SW}" height="${SH}" rx="10"/></clipPath><clipPath id="w"><rect x="${x0}" y="4" width="${x1 - x0}" height="${SH - 8}"/></clipPath>
<linearGradient id="fl"><stop offset="0" stop-color="#000"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient><linearGradient id="fr"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000"/></linearGradient>\n<g id="hx"><path d="${hexD}" fill="#05070c" stroke-width="1.7" stroke-linejoin="round"/><circle r="1.8" fill="currentColor" stroke="none"/></g>
${glyphDefs()}</defs>
<g clip-path="url(#p)"><rect width="${SW}" height="${SH}" fill="#000"/>
<g clip-path="url(#w)"><g class="hm" fill="none" stroke="${CYAN}" stroke-linecap="round"><path d="${hum}" stroke-width="5" stroke-opacity=".16"/><path d="${hum}" stroke-width="1.5"/></g>
<g class="it">${items}</g></g>
<rect x="${x0}" y="4" width="26" height="${SH - 8}" fill="url(#fl)"/><rect x="${x1 - 26}" y="4" width="26" height="${SH - 8}" fill="url(#fr)"/>\n<path d="M${x0 - 3} 12v16M${x1 + 3} 12v16" stroke="#56627a" stroke-width="2"/>
${left.svg}
${right.svg}
<rect x="1.5" y="1.5" width="${SW - 3}" height="${SH - 3}" rx="8.5" fill="none" stroke="#38bdf8" stroke-opacity=".55" stroke-width="3"/></g>
</svg>
`;
  fs.writeFileSync(SCOPE, scope);
  console.log(`wrote ${path.relative(process.cwd(), SCOPE)} (${(scope.length / 1024).toFixed(1)} KB)`);
}

const alt = 'ULTRA-SATISFACTORY as a music visualiser with nothing playing. Waveform rings are born around a gold hexagon with a turning cyan cog in it and fly outward, rotating and fading, into a mandala tunnel on black; a mirrored echo doubles the pattern and a grid of small motion-vector marks shows the flow. ULTRA in neon cyan and SATISFACTORY in white sit under the emblem, above the line: every recipe, building and Space Elevator objective, one click apart. Every twelve seconds the preset blends into the next, one per tab of the app: OBJECTIVES, a purple five-armed spiral; ITEMS, a pink cog with bouncing teeth; BUILDINGS, blue nested hexagons. Overlay text reads fps: 60.0, F1: help, the preset name Belt Choir - Objectives (what the Elevator wants).milk, now playing: nothing. the factory hums, and live: lukexyz.github.io/ULTRA-SATISFACTORY';

const BOLT = '⚡';
const FENCE = '```';
const md = `<!-- Header 08-milkdrop-visualiser_opus_5.5 for ULTRA-SATISFACTORY. Generated by src/08-milkdrop-visualiser_opus_5.5.mjs: edit that, not this. -->

<p align="center">
  <img src="assets/08-milkdrop-visualiser_opus_5.5.svg" width="100%" alt="${alt}">
</p>

<p align="center">
  ${BOLT} <b>ULTRA-SATISFACTORY</b>: a companion app for the factory-building game <i>Satisfactory</i>. Every recipe, building and Space Elevator objective, one click apart.<br>
  ${BOLT} Nothing is playing. That hum is the factory, and it would like to know why you alt-tabbed out at 3&nbsp;a.m. to look up a Rotor.
</p>

<p align="center">
  ${BOLT} Three presets, which the app insists on calling tabs: <b>OBJECTIVES</b> (what each Space Elevator phase wants, and how many), <b>ITEMS</b> (search as you type, recipe cards with per-minute rates) and <b>BUILDINGS</b> (what each one makes, tier by tier, Mk by Mk).<br>
  ${BOLT} Click a part, land on its recipe. Click the machine, land on its building. Second monitor, phone or one alt-tab away.
</p>

${FENCE}sh
python -m pip install -r requirements.txt
python -m streamlit run app/app.py
${FENCE}

<p align="center">
  ${BOLT} Python 3.10+, run from the repo root, then open <b>http://localhost:8501</b>. The long version is under <a href="#run-it-locally">Run&nbsp;it&nbsp;locally</a>.<br>
  ${BOLT} Or install nothing and <a href="https://lukexyz.github.io/ULTRA-SATISFACTORY/"><b>press&nbsp;play&nbsp;in&nbsp;your&nbsp;browser</b></a>: the whole app runs inside the tab, no server to start.<br>
  <sub>${BOLT} Unofficial fan project, not affiliated with Coffee Stain Studios. Contains no audio. May contain traces of hum.</sub>
</p>

<details>
<summary>${BOLT} <b>F1: help</b> (what the keys would do, and what the three presets are)</summary>

${FENCE}text
${help.join('\n')}
${FENCE}

</details>

<details>
<summary>${BOLT} <b>FACTORY_HUM.M3U</b>: ${TRACKS.length} real recipes as a playlist, plus the Space Elevator set list</summary>

${FENCE}text
${playlist.join('\n')}
${FENCE}

</details>

<details>
<summary>${BOLT} <b>Preset info</b>: the numbers, the wiring, credits and greetz</summary>

${FENCE}ini
${about.join('\n')}
${FENCE}

</details>

<p align="center">
  <img src="assets/08-milkdrop-visualiser_opus_5.5-scope.svg" width="100%" alt="A stopped player's oscilloscope: a flat line with a faint hum on it, carrying small hexagons along like a conveyor belt. Stopped, 0:00 of ${mmss(totalSec)}, 0 kbps. The hum is real.">
</p>
`;
const MD = path.resolve(HERE, '../08-milkdrop-visualiser_opus_5.5.md');
fs.writeFileSync(MD, md);
console.log(`wrote ${path.relative(process.cwd(), MD)} (${(Buffer.byteLength(md) / 1024).toFixed(1)} KB)`);
