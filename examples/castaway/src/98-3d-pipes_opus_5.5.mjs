#!/usr/bin/env node
// 3D Pipes (catalogue entry idle-06): README header generator for CASTAWAY.
//
//   node examples/castaway/src/98-3d-pipes_opus_5.5.mjs
//
// Writes examples/castaway/assets/98-3d-pipes_opus_5.5.svg.
// Plain Node, no dependencies, no clock. All randomness comes from one seeded
// PRNG (seed 1992, like the video), so every run writes the same bytes.
//
// The style: the mid-90s OpenGL screensaver in which glossy coloured pipes
// grow through black space one segment at a time, turning at right angles on
// an invisible 3D grid, with ball joints and elbows at the turns, until the
// screen is full and dissolves away. Nothing here copies the original's
// textures, colours or code: the pipes are drawn from scratch below.
//
// The twist: every pipe is one of the six LANES of Castaway's schedule
// (activities.toml): her, the sea and sky, the turtle, the cat, the shore and
// the kumara patch. Lanes are what let things overlap in the video, and here
// they literally pass in front of and behind each other. Pipes only start on
// a bar of the theme (16 sixteenth notes = 3 s at 80 BPM), grow one segment
// per sixteenth note, and the whole thing is one loop of the theme: 20 bars,
// 60 seconds. Her pipe is busy one bar in three, like her. The title is made
// of the same plumbing, she sits on it nodding to the beat, and the classic
// rare teapot joint is replaced by a coconut.
//
// How it is drawn:
//  * A real perspective camera looks into a frustum of grid cells, eight
//    layers deep. Cells behind the lettering (tagline, legend) are blocked
//    at every depth; around the name and her, only the three deepest
//    layers stay open, so pipes pass behind the name and never in front.
//  * Six lanes walk the grid in simulated time (one tick = a sixteenth note).
//  * Every straight run is ONE <path> drawn in a local frame (run along +x,
//    radius 1) whose cylinder shading is a userSpaceOnUse linearGradient
//    computed from a Blinn-Phong model (diffuse + white specular), bucketed
//    by the run's screen angle. Joints are circles with a radial gradient
//    computed the same way. Depth runs are split into short pieces so their
//    perspective taper stays under a pixel.
//  * Painter's order: two pieces from different cells are always separated
//    by an axis-aligned plane, and the side of that plane holding the eye is
//    in front, so every overlapping pair gets an edge in a DAG which is
//    topologically sorted. Cycles (three pipes crossing in a loop) are broken
//    by splitting the runs involved into single cells.
//  * Growth is stroke-dashoffset with steps(), so pipes extend a whole segment
//    at a time; joints pop in with visibility. Bar 20 is a block dissolve.
//  * The loop opens six bars in (a negative delay on everything), so the
//    first frame a visitor sees already has pipes in it.
//  * prefers-reduced-motion holds the picture as it stands after bar 13:
//    no growth, no dissolve, no nod.
//  * Nothing is <text>: the small lettering is a 6 x 7 pixel face (technique
//    from the bouncing-logo generator), every glyph a <use>.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '98-3d-pipes_opus_5.5';
const OUT = path.resolve(HERE, `../assets/${SLUG}.svg`);

// ------------------------------------------------------------------ helpers
const f = (n, d = 2) => {
  const s = (+n).toFixed(d);
  const t = s.includes('.') ? s.replace(/0+$/, '').replace(/\.$/, '') : s;
  return t === '-0' ? '0' : t.replace(/^(-?)0\./, '$1.');
};
function mulberry32(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = mulberry32(1992);
const ri = (n) => Math.floor(rnd() * n);
const pick = (a) => a[ri(a.length)];
const norm = (v) => { const l = Math.hypot(...v); return v.map((x) => x / l); };
const dot = (a, b) => a.reduce((s, x, i) => s + x * b[i], 0);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const hex = (c) => '#' + c.map((v) => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0')).join('');

// ------------------------------------------------------------------ frame and time
const W = 1200, H = 640;
const CX = 600, CY = 300;                 // vanishing point
const TICKS = 320;                        // sixteenth notes per loop (20 bars)
const BAR = 16;                           // ticks per bar (3 s at 80 BPM)
const TICK_S = 0.1875;                    // seconds per tick
const LOOP = TICKS * TICK_S;              // 60 s, one loop of the theme
const GROW_END = 19 * BAR;                // growth in bars 1 to 19, dissolve in bar 20
const PHASE = 6 * BAR * TICK_S;           // the banner opens six bars in, so the first frame already has pipes
const STILL = 13 * BAR;                   // reduced motion: the picture as it stands after bar 13
const pct = (t) => `${f((t / TICKS) * 100, 4)}%`;

// ------------------------------------------------------------------ camera
const D = 9;                              // distance from the eye to the front layer
const NZ = 8;                             // layers of cells
const FOC = 486;
const PR = 0.19;                          // pipe radius, in cells
const BR = 0.29;                          // ball-joint radius
const sc = (k) => FOC / (D + k);
const proj = (x, y, k) => [CX + x * sc(k), CY + y * sc(k)];
const EYE = [0, 0, -D];

// ------------------------------------------------------------------ lighting
const LIGHT = norm([-0.5, -0.78, -0.62]);   // towards the light: up, left, towards the viewer
const VIEW = [0, 0, -1];
const HALF = norm(LIGHT.map((v, i) => v + VIEW[i]));
function shade(n, base, m) {
  const dif = Math.max(0, dot(n, LIGHT));
  const spec = Math.pow(Math.max(0, dot(n, HALF)), m.exp) * m.spec;
  const fill = Math.max(0, dot(n, norm([0.7, 0.4, -0.5]))) * m.fill;   // a faint warm fill from lower right
  return base.map((v, i) => v * (m.amb + m.dif * dif) + m.fillCol[i] * fill + 255 * spec);
}
const PLASTIC = { amb: 0.12, dif: 0.98, spec: 0.92, exp: 34, fill: 0.10, fillCol: [255, 210, 160] };
const PORCELAIN = { amb: 0.40, dif: 0.72, spec: 0.8, exp: 40, fill: 0.18, fillCol: [255, 196, 130] };

// Douglas-Peucker over [offset, r, g, b] so a gradient keeps only the stops it needs
function simplify(pts, tol) {
  if (pts.length < 3) return pts;
  const a = pts[0], b = pts[pts.length - 1];
  let worst = -1, wi = -1;
  for (let i = 1; i < pts.length - 1; i++) {
    const t = (pts[i][0] - a[0]) / (b[0] - a[0]);
    const e = Math.max(...[1, 2, 3].map((j) => Math.abs(pts[i][j] - (a[j] + (b[j] - a[j]) * t))));
    if (e > worst) { worst = e; wi = i; }
  }
  if (worst <= tol) return [a, b];
  return [...simplify(pts.slice(0, wi + 1), tol).slice(0, -1), ...simplify(pts.slice(wi), tol)];
}
const stops = (pts) => simplify(pts, 3.2).map((p) => `<stop offset="${f(p[0], 3)}" stop-color="${hex(p.slice(1))}"/>`).join('');

// cylinder cross-section, for a run whose in-screen normal points at angle th
function cylGrad(id, base, mat, th) {
  const p = [Math.cos(th), Math.sin(th), 0];
  const pts = [];
  for (let i = 0; i <= 120; i++) {
    const s = -1 + (2 * i) / 120;
    const n = [s * p[0], s * p[1], -Math.sqrt(Math.max(0, 1 - s * s))];
    pts.push([(s + 1) / 2, ...shade(n, base, mat)]);
  }
  return `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="-1" x2="0" y2="1">${stops(pts)}</linearGradient>`;
}
// sphere: focal point on the specular peak, sampled along the ray through the centre
function ballGrad(id, base, mat) {
  const hx = HALF[0], hy = HALF[1];
  const F = [hx * 0.92, hy * 0.92];
  const dl = Math.hypot(F[0], F[1]);
  const dir = [-F[0] / dl, -F[1] / dl];
  // where the ray from F through the centre leaves the unit circle
  const b = dot(F, dir), c = dot(F, F) - 1;
  const tEnd = -b + Math.sqrt(b * b - c);
  const pts = [];
  for (let i = 0; i <= 120; i++) {
    const t = (i / 120) * tEnd;
    const P = [F[0] + dir[0] * t, F[1] + dir[1] * t];
    const zz = Math.sqrt(Math.max(0, 1 - P[0] * P[0] - P[1] * P[1]));
    pts.push([i / 120, ...shade([P[0], P[1], -zz], base, mat)]);
  }
  return `<radialGradient id="${id}" cx=".5" cy=".5" r=".5" fx="${f(0.5 + F[0] / 2, 3)}" fy="${f(0.5 + F[1] / 2, 3)}">${stops(pts)}</radialGradient>`;
}

// ------------------------------------------------------------------ lanes
const LANES = [
  { id: 'h', name: 'HER', col: [255, 74, 54], act: [1, 1], rest: [2, 2] },
  { id: 's', name: 'SEA+SKY', col: [38, 98, 255], act: [1, 2], rest: [1, 2] },
  { id: 't', name: 'TURTLE', col: [40, 200, 70], act: [1, 2], rest: [1, 2] },
  { id: 'c', name: 'CAT', col: [214, 52, 214], act: [1, 2], rest: [1, 2] },
  { id: 'o', name: 'SHORE', col: [24, 210, 228], act: [1, 2], rest: [1, 2] },
  { id: 'k', name: 'KUMARA', col: [255, 200, 20], act: [1, 2], rest: [1, 2] },
];
const IVORY = [255, 243, 220];
const COCO = [128, 78, 44];

// ------------------------------------------------------------------ title geometry (built first: it reserves cells)
const KT = 1;                                  // the title stands in layer 1
const ST = sc(KT);                             // px per cell at the title's depth
const TPR = 0.2 * ST, TBR = 0.3 * ST;          // title tube and ball radii in px
const LW = 1.6, LH = 2.6, LM = 1.3, PITCH = 2.5;
const LETTERS = {
  C: [[[LW, 0], [0, 0], [0, LH], [LW, LH]]],
  A: [[[0, LH], [0, LM], [0, 0], [LW, 0], [LW, LM], [LW, LH]], [[0, LM], [LW, LM]]],
  S: [[[LW, 0], [0, 0], [0, LM], [LW, LM], [LW, LH], [0, LH]]],
  T: [[[0, 0], [LW / 2, 0], [LW, 0]], [[LW / 2, 0], [LW / 2, LH]]],
  W: [[[0, 0], [0, LH], [LW / 2, LH], [LW, LH], [LW, 0]], [[LW / 2, LH], [LW / 2, 1.05]]],
  Y: [[[0, 0], [0, LM], [LW / 2, LM], [LW, LM], [LW, 0]], [[LW / 2, LM], [LW / 2, LH]]],
};
const WORD = 'CASTAWAY';
const TW = (WORD.length - 1) * PITCH + LW;
const TX0 = CX - (TW * ST) / 2;
const TY0 = 190;
const title = { runs: [], nodes: [] };
[...WORD].forEach((ch, li) => {
  const ox = TX0 + li * PITCH * ST;
  const nodes = new Map();
  const nodeAt = (p) => {
    const k = `${f(p[0], 3)},${f(p[1], 3)}`;
    if (!nodes.has(k)) nodes.set(k, { p: [ox + p[0] * ST, TY0 + p[1] * ST], deg: 0, corner: false });
    return nodes.get(k);
  };
  for (const line of LETTERS[ch]) {
    line.forEach((pt, i) => {
      const n = nodeAt(pt);
      const end = i === 0 || i === line.length - 1;
      n.deg += end ? 1 : 2;
      if (!end) {
        const a = line[i - 1], b = line[i + 1];
        const cross = (pt[0] - a[0]) * (b[1] - pt[1]) - (pt[1] - a[1]) * (b[0] - pt[0]);
        if (Math.abs(cross) > 1e-9) n.corner = true;
      }
      if (i > 0) title.runs.push([nodeAt(line[i - 1]).p, n.p]);
    });
  }
  for (const n of nodes.values()) {
    if (n.deg >= 3) title.nodes.push({ p: n.p, r: TBR });          // tee: a ball fitting
    else if (n.deg === 1) title.nodes.push({ p: n.p, r: TBR * 0.86 }); // open end: a slightly smaller ball
    else if (n.corner) title.nodes.push({ p: n.p, r: TPR });       // elbow
  }
});
const TB = [TX0 - TBR, TY0 - TBR, TX0 + TW * ST + TBR, TY0 + LH * ST + TBR];
// she sits on the top bar of the second A (letter 4)
const SEAT = [TX0 + (4 * PITCH + LW / 2) * ST, TY0 - TPR + 1];

// ------------------------------------------------------------------ text layout (needs the font, so the font comes first)
const THIN = {
  A: '..##..|.#..#.|#....#|#....#|######|#....#|#....#', B: '#####.|#....#|#....#|#####.|#....#|#....#|#####.',
  C: '.####.|#....#|#.....|#.....|#.....|#....#|.####.', D: '####..|#...#.|#....#|#....#|#....#|#...#.|####..',
  E: '######|#.....|#.....|#####.|#.....|#.....|######', F: '######|#.....|#.....|#####.|#.....|#.....|#.....',
  G: '.####.|#....#|#.....|#..###|#....#|#....#|.####.', H: '#....#|#....#|#....#|######|#....#|#....#|#....#',
  I: '#####.|..#...|..#...|..#...|..#...|..#...|#####.', J: '.....#|.....#|.....#|.....#|#....#|#....#|.####.',
  K: '#....#|#...#.|#..#..|###...|#..#..|#...#.|#....#', L: '#.....|#.....|#.....|#.....|#.....|#.....|######',
  M: '#....#|##..##|#.##.#|#....#|#....#|#....#|#....#', N: '#....#|##...#|#.#..#|#..#.#|#...##|#....#|#....#',
  O: '.####.|#....#|#....#|#....#|#....#|#....#|.####.', P: '#####.|#....#|#....#|#####.|#.....|#.....|#.....',
  Q: '.####.|#....#|#....#|#....#|#.#..#|#..#..|.##.#.', R: '#####.|#....#|#....#|#####.|#..#..|#...#.|#....#',
  S: '.####.|#....#|#.....|.####.|.....#|#....#|.####.', T: '#####.|..#...|..#...|..#...|..#...|..#...|..#...',
  U: '#....#|#....#|#....#|#....#|#....#|#....#|.####.', V: '#....#|#....#|#....#|#....#|.#..#.|.#..#.|..##..',
  W: '#....#|#....#|#....#|#....#|#.##.#|##..##|#....#', X: '#....#|#....#|.#..#.|..##..|.#..#.|#....#|#....#',
  Y: '#...#.|#...#.|#...#.|.#.#..|..#...|..#...|..#...', Z: '######|....#.|...#..|..#...|.#....|#.....|######',
  0: '.###..|#...#.|#..##.|#.#.#.|##..#.|#...#.|.###..', 1: '..#...|.##...|..#...|..#...|..#...|..#...|.###..',
  2: '.####.|#....#|.....#|...##.|.##...|#.....|######', 3: '.####.|#....#|.....#|..###.|.....#|#....#|.####.',
  4: '...##.|..#.#.|.#..#.|#...#.|######|....#.|....#.', 5: '######|#.....|#####.|.....#|.....#|#....#|.####.',
  6: '.####.|#.....|#.....|#####.|#....#|#....#|.####.', 7: '######|.....#|....#.|...#..|..#...|..#...|..#...',
  8: '.####.|#....#|#....#|.####.|#....#|#....#|.####.', 9: '.####.|#....#|#....#|.#####|.....#|.....#|.####.',
  '.': '......|......|......|......|......|..#...|..#...', ',': '......|......|......|......|..#...|..#...|.#....',
  ':': '......|..#...|..#...|......|..#...|..#...|......', "'": '..#...|..#...|.#....|......|......|......|......',
  '-': '......|......|......|.####.|......|......|......', '/': '....#.|....#.|...#..|...#..|..#...|..#...|.#....',
  '+': '......|..#...|..#...|#####.|..#...|..#...|......', '·': '......|......|......|..#...|......|......|......',
  '=': '......|......|#####.|......|#####.|......|......',
  p: '......|......|#####.|#....#|#....#|#....#|#####.|#.....|#.....',
  y: '......|......|#....#|#....#|#....#|#....#|.#####|.....#|.####.',
  t: '..#...|..#...|#####.|..#...|..#...|..#..#|...##.',
  h: '#.....|#.....|#####.|#....#|#....#|#....#|#....#',
  o: '......|......|.####.|#....#|#....#|#....#|.####.',
  n: '......|......|#####.|#....#|#....#|#....#|#....#',
  l: '.##...|..#...|..#...|..#...|..#...|..#...|.###..',
  s: '......|......|.#####|#.....|.####.|.....#|#####.',
  e: '......|......|.####.|#....#|######|#.....|.####.',
  r: '......|......|#.###.|##...#|#.....|#.....|#.....',
  v: '......|......|#....#|#....#|.#..#.|.#..#.|..##..',
};
const ADV = 8;
function glyphPath(ch) {
  const rows = THIN[ch].split('|');
  let d = '';
  rows.forEach((row, y) => {
    const on = [];
    for (let x = 0; x < 7; x++) on.push(row[x] === '#' || (x > 0 && row[x - 1] === '#'));
    let x = 0;
    while (x < 7) {
      if (!on[x]) { x++; continue; }
      let e = x;
      while (e < 7 && on[e]) e++;
      d += `M${x} ${y}h${e - x}v1h${x - e}z`;
      x = e;
    }
  });
  return d;
}
const usedChars = new Set();
const gid = (ch) => `q${ch.codePointAt(0).toString(16)}`;
const textW = (str, u) => (str.length * ADV - 1) * u;
function osd(str, x, y, u, cls = '', anchor = 'start') {
  const w = textW(str, u);
  const x0 = anchor === 'end' ? x - w : anchor === 'middle' ? x - w / 2 : x;
  let uses = '';
  [...str].forEach((ch, i) => {
    if (ch === ' ') return;
    if (!THIN[ch]) throw new Error(`no glyph for ${JSON.stringify(ch)} in "${str}"`);
    usedChars.add(ch);
    uses += `<use href="#${gid(ch)}" x="${i * ADV}"/>`;
  });
  return { svg: `<g${cls ? ` class="${cls}"` : ''} transform="translate(${f(x0)} ${f(y)}) scale(${u})">${uses}</g>`, w, x0 };
}

const TAG1 = 'A TEN-HOUR LO-FI ISLAND VIDEO. SHE IDLES, NODDING TO THE MUSIC.';
const TAG2 = 'EVERY SO OFTEN SOMETHING HAPPENS, ALWAYS ON THE NEXT BAR.';
const TU = 1.75;
const TAG_Y = TB[3] + 26;
const tagW = Math.max(textW(TAG1, TU), textW(TAG2, TU));
const RES_TAG = [CX - tagW / 2 - 16, TAG_Y - 12, CX + tagW / 2 + 16, TAG_Y + 7 * TU + 22 + 7 * TU + 12];
const LEG_Y = 606;
const RES_LEG = [0, LEG_Y - 16, W, H];
const RES_TITLE = [TB[0] - 14, TB[1] - 14, TB[2] + 14, TB[3] + 14];
const RES_HER = [SEAT[0] - 30, SEAT[1] - 66, SEAT[0] + 30, SEAT[1]];
const overlaps = (a, b) => a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1];

// ------------------------------------------------------------------ the grid
const key = (c) => `${c[0]},${c[1]},${c[2]}`;
const valid = new Set();
const cellsList = [];
for (let k = 0; k < NZ; k++) {
  const s = sc(k);
  const xr = Math.ceil(W / 2 / s) + 1, yr = Math.ceil(H / 2 / s) + 1;
  for (let x = -xr; x <= xr; x++) {
    for (let y = -yr; y <= yr; y++) {
      const [px, py] = proj(x, y, k);
      const m = BR * s + 14;
      if (px < m || px > W - m || py < m || py > H - m) continue;
      let bb = [1e9, 1e9, -1e9, -1e9];
      for (const dx of [-0.5, 0.5]) for (const dy of [-0.5, 0.5]) for (const dz of [-0.45, 0.45]) {
        const q = proj(x + dx, y + dy, k + dz);
        bb = [Math.min(bb[0], q[0]), Math.min(bb[1], q[1]), Math.max(bb[2], q[0]), Math.max(bb[3], q[1])];
      }
      if (overlaps(bb, RES_TAG) || overlaps(bb, RES_LEG)) continue;
      if (k <= KT + 3 && (overlaps(bb, RES_TITLE) || overlaps(bb, RES_HER))) continue;   // only the deepest layers pass behind the name
      valid.add(key([x, y, k]));
      cellsList.push([x, y, k]);
    }
  }
}

// ------------------------------------------------------------------ grow the pipes, one sixteenth note at a time
const DIRS = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
const add3 = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const occ = new Set();
const isFree = (c) => valid.has(key(c)) && !occ.has(key(c));
const P_TURN = 0.3;
const pipes = [];
const laneState = LANES.map(() => ({ pipe: null, next: 0 }));
const rr = (r) => r[0] + ri(r[1] - r[0] + 1);

function freeNeighbours(c) { return DIRS.filter((d) => isFree(add3(c, d))).length; }
function startCell() {
  for (let tries = 0; tries < 400; tries++) {
    const c = pick(cellsList);
    // there are many more deep cells than near ones; start mostly near, so the depth reads
    if (rnd() > 1 - c[2] / 8.5) continue;
    if (isFree(c) && freeNeighbours(c) >= 3) return c;
  }
  return null;
}
function nextDir(p) {
  const last = p.cells[p.cells.length - 1].c;
  const dir = p.dir;
  const ok = (d) => isFree(add3(last, d));
  if (dir && ok(dir) && rnd() > P_TURN) return dir;
  const perps = DIRS.filter((d) => (!dir || dot(d, dir) === 0) && ok(d));
  if (perps.length) {
    // depth turns are a little rarer, so the picture is not all stubs
    const w = perps.map((d) => (d[2] ? 0.55 : 1));
    let r = rnd() * w.reduce((a, b) => a + b, 0);
    for (let i = 0; i < perps.length; i++) { r -= w[i]; if (r <= 0) return perps[i]; }
    return perps[perps.length - 1];
  }
  if (dir && ok(dir)) return dir;
  return null;
}
for (let t = 0; t <= GROW_END; t++) {
  LANES.forEach((lane, li) => {
    const st = laneState[li];
    const p = st.pipe;
    if (p) {
      const d = t <= p.until && t < GROW_END ? nextDir(p) : null;
      if (d) {
        const c = add3(p.cells[p.cells.length - 1].c, d);
        occ.add(key(c));
        p.cells.push({ c, t });
        p.dir = d;
      }
      if (!d || t >= p.until) {
        // the activity is over (or the pipe is boxed in): rest, then start again on a bar
        st.pipe = null;
        st.next = d ? t + rr(lane.rest) * BAR : (Math.floor(t / BAR) + 1 + rr(lane.rest)) * BAR;
      }
    }
  });
  if (t % BAR === 0 && t < GROW_END) {
    LANES.forEach((lane, li) => {
      const st = laneState[li];
      if (st.pipe || t < st.next) return;
      const c = startCell();
      if (!c) return;
      occ.add(key(c));
      const bars = rr(lane.act);
      const p = { lane: li, cells: [{ c, t }], dir: null, until: t + bars * BAR };
      pipes.push(p);
      st.pipe = p;
    });
  }
}

// ------------------------------------------------------------------ pieces: runs and joints
const objs = [];
function addRun(p, i0, i1) {
  const a = p.cells[i0].c, b = p.cells[i1].c;
  const box = [0, 1, 2].map((j) => [Math.min(a[j], b[j]), Math.max(a[j], b[j])]);
  objs.push({ kind: 'run', pipe: p, i0, i1, a, b, axis: a[0] !== b[0] ? 0 : a[1] !== b[1] ? 1 : 2, box });
}
let coconut = null;
pipes.forEach((p, pi) => {
  const n = p.cells.length;
  // joints
  for (let i = 0; i < n; i++) {
    const c = p.cells[i].c;
    let type = null;
    if (i === 0 || i === n - 1) type = 'ball';
    else {
      const d0 = p.cells[i].c.map((v, j) => v - p.cells[i - 1].c[j]);
      const d1 = p.cells[i + 1].c.map((v, j) => v - c[j]);
      if (dot(d0, d1) === 0) type = rnd() < 1 / 3 ? 'ball' : 'knuckle';
    }
    if (type) objs.push({ kind: 'joint', pipe: p, i, c, type, box: [0, 1, 2].map((j) => [c[j], c[j]]) });
  }
  // runs, with depth runs cut into pieces of at most two cells
  let s = 0;
  for (let i = 1; i <= n; i++) {
    const turn = i === n || (i < n - 1 && dot(p.cells[i].c.map((v, j) => v - p.cells[i - 1].c[j]), p.cells[i + 1].c.map((v, j) => v - p.cells[i].c[j])) === 0);
    if (i === n) { if (n - 1 > s) cut(p, s, n - 1); break; }
    if (turn) { cut(p, s, i); s = i; }
  }
});
function cut(p, i0, i1) {
  const axisZ = p.cells[i0].c[2] !== p.cells[i1].c[2];
  if (!axisZ) { addRun(p, i0, i1); return; }
  for (let i = i0; i < i1; i += 2) addRun(p, i, Math.min(i + 2, i1));
}

// the rare joint: one ball, mid-loop, near the front, far from the title, becomes a coconut
{
  const cands = objs.filter((o) => o.kind === 'joint' && o.type === 'ball' && o.i > 0 && o.i < o.pipe.cells.length - 1 &&
    o.c[2] <= 2 && o.pipe.cells[o.i].t > 110 && o.pipe.cells[o.i].t < 200);
  const sp = (o) => proj(...o.c);
  cands.sort((a, b) => Math.abs(sp(b)[0] - CX) - Math.abs(sp(a)[0] - CX));
  if (cands.length) { coconut = cands[0]; coconut.type = 'coconut'; }
}

// ------------------------------------------------------------------ screen geometry and painter's order
function geom(o) {
  if (o.kind === 'joint') {
    const s = sc(o.c[2]);
    const r = (o.type === 'knuckle' ? PR : BR) * s;
    const P = proj(...o.c);
    o.P = P; o.Q = P; o.r = r;
  } else {
    o.P = proj(...o.a); o.Q = proj(...o.b);
    o.r = PR * sc((o.a[2] + o.b[2]) / 2);
  }
  o.k = o.kind === 'joint' ? o.c[2] : (o.a[2] + o.b[2]) / 2;
}
function segDist(p1, q1, p2, q2) {
  const d = (p, a, b) => {
    const ab = [b[0] - a[0], b[1] - a[1]];
    const l2 = ab[0] * ab[0] + ab[1] * ab[1];
    const t = l2 ? clamp(((p[0] - a[0]) * ab[0] + (p[1] - a[1]) * ab[1]) / l2, 0, 1) : 0;
    return Math.hypot(p[0] - a[0] - ab[0] * t, p[1] - a[1] - ab[1] * t);
  };
  const cr = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
  const s1 = cr(p1, q1, p2), s2 = cr(p1, q1, q2), s3 = cr(p2, q2, p1), s4 = cr(p2, q2, q1);
  if (s1 * s2 < 0 && s3 * s4 < 0) return 0;
  return Math.min(d(p1, p2, q2), d(q1, p2, q2), d(p2, p1, q1), d(q2, p1, q1));
}
const sharesCell = (A, B) => [0, 1, 2].every((j) => A.box[j][0] <= B.box[j][1] && B.box[j][0] <= A.box[j][1]);

// returns true when A must be painted before B
function before(A, B) {
  if (A.pipe === B.pipe && sharesCell(A, B)) {
    if (A.kind === 'joint' && B.kind === 'run') return !before(B, A);
    if (A.kind === 'run' && B.kind === 'joint') {
      // a depth run heading towards the eye is painted over its joint; everything else goes under it
      if (A.axis !== 2) return true;
      const other = A.a[0] === B.c[0] && A.a[1] === B.c[1] && A.a[2] === B.c[2] ? A.b : A.a;
      return !(other[2] < B.c[2]);
    }
    if (A.kind === 'run' && B.kind === 'run') {
      if (A.axis === 2 && B.axis === 2) return A.k > B.k;   // two pieces of one depth run: far one first
      return null;
    }
    return null;
  }
  for (let j = 2; j >= 0; j--) {
    if (A.box[j][1] < B.box[j][0]) { const pl = A.box[j][1] + 0.5; return EYE[j] > pl; }
    if (B.box[j][1] < A.box[j][0]) { const pl = B.box[j][1] + 0.5; return !(EYE[j] > pl); }
  }
  return null;
}

function order(list) {
  list.forEach(geom);
  const n = list.length;
  const out = list.map(() => []), indeg = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const A = list[i], B = list[j];
      if (segDist(A.P, A.Q, B.P, B.Q) >= A.r + B.r - 0.25) continue;
      const b = before(A, B);
      if (b === null) continue;
      if (b) { out[i].push(j); indeg[j]++; } else { out[j].push(i); indeg[i]++; }
    }
  }
  const prio = (o) => o.k * 1000 + Math.hypot(o.P[0] - CX, o.P[1] - CY);
  const done = new Array(n).fill(false);
  const res = [];
  let ready = [];
  for (let i = 0; i < n; i++) if (!indeg[i]) ready.push(i);
  while (res.length < n) {
    if (!ready.length) return { res, stuck: list.map((o, i) => i).filter((i) => !done[i]), out };
    ready.sort((a, b) => prio(list[a]) - prio(list[b]));
    const i = ready.pop();
    done[i] = true;
    res.push(i);
    for (const j of out[i]) if (--indeg[j] === 0) ready.push(j);
  }
  return { res, stuck: [] };
}
let sorted = null, splits = 0, forced = 0;
for (let round = 0; round < 6; round++) {
  const r = order(objs);
  if (!r.stuck.length) { sorted = r.res.map((i) => objs[i]); break; }
  // break cycles: split every multi-cell run left in the knot into single cells
  const stuckSet = new Set(r.stuck.map((i) => objs[i]));
  let changed = false;
  for (const o of [...stuckSet]) {
    if (o.kind !== 'run' || o.i1 - o.i0 < 2) continue;
    objs.splice(objs.indexOf(o), 1);
    for (let i = o.i0; i < o.i1; i++) addRun(o.pipe, i, i + 1);
    splits++; changed = true;
  }
  if (!changed || round === 5) {
    // last resort: paint what is left far-to-near
    const rest = [...stuckSet].sort((a, b) => b.k - a.k);
    sorted = [...r.res.map((i) => objs[i]), ...rest];
    forced = rest.length;
    break;
  }
}

// ------------------------------------------------------------------ gradients
const BUCKETS = 4;
const grads = new Map();
function runGrad(lane, th) {
  const b = Math.round(th / (Math.PI / BUCKETS)) % BUCKETS;
  const id = `g${lane}${b}`;
  if (!grads.has(id)) {
    const base = lane === 'i' ? IVORY : LANES.find((l) => l.id === lane).col;
    grads.set(id, cylGrad(id, base, lane === 'i' ? PORCELAIN : PLASTIC, (b * Math.PI) / BUCKETS));
  }
  return id;
}
function sphGrad(id) {
  const lane = id.slice(1);
  if (!grads.has(id)) {
    const base = lane === 'i' ? IVORY : lane === 'n' ? COCO : LANES.find((l) => l.id === lane).col;
    const mat = lane === 'i' ? PORCELAIN : lane === 'n' ? { ...PLASTIC, spec: 0.35, exp: 14 } : PLASTIC;
    grads.set(id, ballGrad(id, base, mat));
  }
  return id;
}
// one straight tube as a single path in a local frame: run along +x, radius 1
function tube(P, Q, r, lane, extra = {}) {
  const len = Math.hypot(Q[0] - P[0], Q[1] - P[1]);
  const u = [(Q[0] - P[0]) / len, (Q[1] - P[1]) / len];
  let p = [-u[1], u[0]];
  if (p[1] < -1e-9 || (Math.abs(p[1]) < 1e-9 && p[0] < 0)) p = [-p[0], -p[1]];
  const th = Math.atan2(p[1], p[0]);
  const g = runGrad(lane, th);
  const cls = extra.cls ? ` ${extra.cls}` : '';
  return `<path d="M0 0H${f(len / r, 1)}" transform="matrix(${f(u[0] * r)} ${f(u[1] * r)} ${f(p[0] * r)} ${f(p[1] * r)} ${f(P[0], 1)} ${f(P[1], 1)})"${extra.pl ? ' pathLength="1"' : ''} class="${extra.base || 'r'} ${g}${cls}"/>`;
}

// ------------------------------------------------------------------ animation
// Two shared animations per element instead of one keyframe set each:
//  * vT (one per tick T): hidden until tick T, then shown. Every piece that
//    appears at tick T shares it.
//  * gN (one per run length N): the dash steps forward one segment per tick
//    for N-1 ticks, then holds. It is delayed to the run's first tick, so in
//    every later loop it restarts at that same moment; before it, vT keeps
//    the run hidden anyway.
// The class for a tick sets --v and --d, the class for a length sets --g.
const kf = [];
const ticksUsed = new Set();
const lensUsed = new Set();
const vcls = (t) => { if (t > 0) ticksUsed.add(t); return (t > 0 ? ` v${t}` : '') + (t > STILL ? ' x' : ''); };
const pipeEls = [];
const gcls = (id) => { sphGrad(id); return id; };
for (const o of sorted) {
  const lane = LANES[o.pipe.lane].id;
  if (o.kind === 'joint') {
    const t = o.pipe.cells[o.i].t;
    if (o.type === 'coconut') {
      const s = sc(o.c[2]), R = BR * s * 1.1;
      const [x, y] = o.P;
      pipeEls.push(`<g class="j${vcls(t)}"><circle cx="${f(x, 1)}" cy="${f(y, 1)}" r="${f(R)}" class="${gcls('bn')}"/>` +
        `<path d="M${f(x - R * 0.66, 1)} ${f(y - R * 0.12, 1)}q${f(R * 0.5)} ${f(-R * 0.55)} ${f(R * 1.15)} ${f(-R * 0.35)}M${f(x - R * 0.55, 1)} ${f(y + R * 0.36, 1)}q${f(R * 0.6)} ${f(-R * 0.3)} ${f(R * 1.2)} ${f(R * 0.05)}` +
        `M${f(x - R * 0.2, 1)} ${f(y - R * 0.7, 1)}q${f(R * 0.4)} ${f(-R * 0.08)} ${f(R * 0.75)} ${f(R * 0.2)}M${f(x - R * 0.78, 1)} ${f(y + R * 0.1, 1)}q${f(R * 0.2)} ${f(R * 0.3)} ${f(R * 0.12)} ${f(R * 0.62)}" class="cf"/>` +
        `<circle cx="${f(x + R * 0.1, 1)}" cy="${f(y + R * 0.2, 1)}" r="${f(R * 0.12)}" class="ce"/><circle cx="${f(x + R * 0.42, 1)}" cy="${f(y + R * 0.1, 1)}" r="${f(R * 0.12)}" class="ce"/>` +
        `<circle cx="${f(x + R * 0.3, 1)}" cy="${f(y + R * 0.44, 1)}" r="${f(R * 0.12)}" class="ce"/></g>`);
    } else {
      pipeEls.push(`<circle cx="${f(o.P[0], 1)}" cy="${f(o.P[1], 1)}" r="${f(o.r)}" class="j ${gcls('b' + lane)}${vcls(t)}"/>`);
    }
  } else {
    const n = o.i1 - o.i0;
    const t1 = o.pipe.cells[o.i0 + 1].t;
    let cls = vcls(t1).trim();
    if (n > 1) { lensUsed.add(n); cls += ` g${n}`; }
    pipeEls.push(tube(o.P, o.Q, o.r, lane, { pl: n > 1, cls }));
  }
}
for (const t of [...ticksUsed].sort((a, b) => a - b)) {
  kf.push(`.v${t}{--v:v${t};--d:${f(t * TICK_S - PHASE, 4)}s}@keyframes v${t}{0%{opacity:0}${pct(t)}{opacity:1}}`);
}
for (const n of [...lensUsed].sort((a, b) => a - b)) {
  kf.push(`.g${n}{--g:g${n};stroke-dasharray:1 2}@keyframes g${n}{0%{stroke-dashoffset:${f(1 - 1 / n, 4)};animation-timing-function:steps(${n - 1},end)}${pct(n - 1)}{stroke-dashoffset:0}}`);
}

// ------------------------------------------------------------------ the dissolve (bar 20): black blocks, one wave per sixteenth note
const BS = 40;
const waves = Array.from({ length: BAR }, () => '');
for (let by = 0; by < H / BS; by++) {
  let row = [];
  for (let bx = 0; bx < W / BS; bx++) row.push(ri(BAR));
  let bx = 0;
  while (bx < row.length) {
    let e = bx;
    while (e < row.length && row[e] === row[bx]) e++;
    waves[row[bx]] += `M${bx * BS} ${by * BS}h${(e - bx) * BS}v${BS}h-${(e - bx) * BS}z`;
    bx = e;
  }
}
const dissolve = waves.map((d, w) => {
  kf.push(`.w${w}{animation-name:w${w}}@keyframes w${w}{0%{opacity:0}${pct(GROW_END + w)}{opacity:1}}`);
  return `<path d="${d}" class="dz w${w}"/>`;
}).join('\n');

// ------------------------------------------------------------------ the title, in the same plumbing
const titleEls = [];
const halo = 3.6;
for (const [P, Q] of title.runs) titleEls.push(`<path d="M${f(P[0])} ${f(P[1])}L${f(Q[0])} ${f(Q[1])}" class="th"/>`);
for (const n of title.nodes) titleEls.push(`<circle cx="${f(n.p[0])}" cy="${f(n.p[1])}" r="${f(n.r + halo)}"/>`);
for (const [P, Q] of title.runs) titleEls.push(tube(P, Q, TPR, 'i', { base: 'tt' }));
for (const n of title.nodes) titleEls.push(`<circle cx="${f(n.p[0])}" cy="${f(n.p[1])}" r="${f(n.r)}" class="${gcls('bi')}"/>`);

// ------------------------------------------------------------------ her: small, simple, sitting on the A, nodding to the beat
const SKIN = '#e8b08a', SKIN_D = '#c98d6a', HAIR = '#5d3820', HAIR_L = '#7a4d2c', PHONES = '#f4ecd6', PHONES_D = '#cfc3a4';
const CORAL = '#ff7a5e', CORAL_D = '#d85a44', SHORTS = '#efe2c2', SHORTS_D = '#cdbd98';
const her = `<g transform="translate(${f(SEAT[0])} ${f(SEAT[1])})">
<path d="M-7.5 3.5v19.5q0 2.2 2.2 2.2h1.6q2-0.2 2-2.2v-19.5z" fill="${SKIN}"/><path d="M1.8 3.5v19.5q0 2.2 2.2 2.2h1.4q2.1 0 2.1-2.2v-19.5z" fill="${SKIN_D}"/>
<path d="M-9.4 24.2q3.6-1.2 6.9 0.6l-0.4 2.6q-3.4 0.6-6.9-0.6z" fill="${SKIN}"/><path d="M2.2 24.8q3.4-1.8 7 -0.6l0.2 2.6q-3.6 1.2-7 0.6z" fill="${SKIN_D}"/>
<path d="M-10.5 -5.5h21q1.6 0 1.6 1.6v8.4q0 1.5-1.5 1.5h-8.6l-1.6-2.2-1.6 2.2h-8.8q-1.5 0-1.5-1.5v-8.4q0-1.6 1.6-1.6z" fill="${SHORTS}"/>
<path d="M2 -5.5h8.5q1.6 0 1.6 1.6v8.4q0 1.5-1.5 1.5h-8.6z" fill="${SHORTS_D}" opacity=".55"/>
<path d="M-12.6 -21.5q-1.4 9.5-1.2 19.6q0 1.6 1.8 1.6q1.4 0 1.5-1.6l0.9-15.6z" fill="${SKIN}"/><path d="M12.6 -21.5q1.4 9.5 1.2 19.6q0 1.6-1.8 1.6q-1.4 0-1.5-1.6l-0.9-15.6z" fill="${SKIN_D}"/>
<path d="M-8.4 -27.2q8.4-2.2 16.8 0q2.8 0.8 3.4 4l0.2 6.4q-0.6 5.8-1.6 12.6h-20.8q-1-6.8-1.6-12.6l0.2-6.4q0.6-3.2 3.4-4z" fill="${CORAL}"/>
<path d="M3.2 -27.6q2.8 0.2 5.2 0.4q2.8 0.8 3.4 4l0.2 6.4q-0.6 5.8-1.6 12.6h-6.4z" fill="${CORAL_D}" opacity=".7"/>
<path d="M-6 -27.6q6-1.8 12 0l-2.2 3.2q-3.8 1.4-7.6 0z" fill="${SKIN}"/>
<g class="nod">
<rect x="-2.6" y="-33.5" width="5.2" height="8" rx="2" fill="${SKIN_D}"/>
<circle cx="-9" cy="-33.2" r="4.4" fill="${HAIR}"/>
<ellipse cx="0" cy="-41" rx="8.6" ry="9.4" fill="${SKIN}"/>
<path d="M-8.9 -40.5q-1.2-11.6 8.9-11.8q10.1 0.2 8.9 11.8q-0.6-4.6-3-6.6q-3.2 3-11.6 2.6q-2.4 1.6-3.2 4z" fill="${HAIR}"/>
<path d="M-5.8 -48.2q3.4-2.6 7.4-1.6" stroke="${HAIR_L}" stroke-width="1.2" fill="none" stroke-linecap="round"/>
<path d="M-10.4 -40.8q0.6-14.2 10.4-14.4q9.8 0.2 10.4 14.4" stroke="${PHONES}" stroke-width="2.4" fill="none"/>
<rect x="-12.6" y="-45" width="5.6" height="9.4" rx="2.6" fill="${PHONES}"/><rect x="7" y="-45" width="5.6" height="9.4" rx="2.6" fill="${PHONES_D}"/>
<path d="M-5.6 -39.6q1.6 1.4 3.2 0M2.4 -39.6q1.6 1.4 3.2 0" stroke="#3a2416" stroke-width="1.1" fill="none" stroke-linecap="round"/>
<path d="M-1.6 -35.4q1.6 1 3.2 0" stroke="#b5654c" stroke-width="1" fill="none" stroke-linecap="round"/>
</g>
</g>`;

// ------------------------------------------------------------------ lettering
const tag1 = osd(TAG1, CX, TAG_Y, TU, 'tx', 'middle');
const tag2 = osd(TAG2, CX, TAG_Y + 7 * TU + 10, TU, 'tx2', 'middle');

// legend: every pipe is a lane
const LU = 1.75;
const legend = [];
const LEAD = 'ONE PIPE PER LANE:';
const L0 = osd(LEAD, 0, 0, LU);
const items = LANES.map((l) => ({ l, w: textW(l.name, LU) }));
const SW = 34, GAP1 = 9, GAP2 = 22;
const total = L0.w + GAP2 + items.reduce((a, it) => a + SW + GAP1 + it.w + GAP2, 0) - GAP2;
let lx = CX - total / 2;
legend.push(osd(LEAD, lx, LEG_Y, LU, 'tx2').svg);
lx += L0.w + GAP2;
const ly = LEG_Y + 3.5 * LU;
const lr = 5.4;
for (const it of items) {
  legend.push(tube([lx + lr, ly], [lx + SW - lr, ly], lr, it.l.id, { base: 'tt' }));
  legend.push(`<circle cx="${f(lx + lr)}" cy="${f(ly)}" r="${f(lr * 1.45)}" class="${gcls('b' + it.l.id)}"/>`);
  lx += SW + GAP1;
  legend.push(osd(it.l.name, lx, LEG_Y, LU, 'tx').svg);
  lx += it.w + GAP2;
}

// ------------------------------------------------------------------ assemble
const defsGlyphs = [...usedChars].sort().map((ch) => `<path id="${gid(ch)}" d="${glyphPath(ch)}"/>`).join('');
const finalTick = GROW_END - 1;
const paintCls = [...grads.keys()].map((id) => `.${id}{${id[0] === 'g' ? 'stroke' : 'fill'}:url(#${id})}`).join('');
const style = `
.r,.tt{fill:none;stroke-width:2;stroke-linecap:round}
.r,.j{animation:${LOOP}s step-end infinite;animation-name:var(--v),var(--g,x);animation-delay:-${f(PHASE)}s,var(--d,0s)}
.dz{fill:#000;opacity:0;animation:${LOOP}s step-end infinite;animation-delay:-${f(PHASE)}s}
.th{fill:none;stroke:#000;stroke-width:${f(2 * (TPR + halo))};stroke-linecap:round}
.cf{fill:none;stroke:#4a2a14;stroke-width:1.3;stroke-linecap:round;opacity:.75}.ce{fill:#2a170b}
.tx{fill:#ece6d6}.tx2{fill:#9aa1ad}
.nod{transform-box:fill-box;transform-origin:50% 92%;animation:nod .75s ease-out infinite}
@keyframes nod{0%{transform:rotate(0deg)}14%{transform:rotate(9deg) translateY(1px)}45%,100%{transform:rotate(0deg)}}
${paintCls}
${kf.join('\n')}
@media (prefers-reduced-motion:reduce){.r,.j,.dz,.nod{animation:none!important}.x{display:none}}
`;

const TITLE = 'CASTAWAY: six lanes of glossy plumbing, one loop of the theme';
const DESC = 'A black screensaver panel in which glossy pipes in six colours grow through 3D space one segment per sixteenth note, ' +
  'turning at right angles with ball joints and elbows and passing in front of and behind each other. The title CASTAWAY is built ' +
  'from ivory pipes with ball fittings, and a small woman in cream headphones, a coral tank top and cream shorts sits on the second A, ' +
  'nodding to the beat. Under it: a ten-hour lo-fi island video; she idles, nodding to the music; every so often something happens, ' +
  'always on the next bar. Legend: one pipe per lane: her, sea and sky, turtle, cat, shore, kumara. After nineteen bars the pipes ' +
  'dissolve in black blocks and start again. One ball joint per loop is a coconut.';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="t d">
<title id="t">${TITLE}</title>
<desc id="d">${DESC}</desc>
<style>${style}</style>
<defs>
${[...grads.values()].join('\n')}
<clipPath id="pc"><rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="18"/></clipPath>
${defsGlyphs}
</defs>
<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="19" fill="#000" stroke="#2a2f37" stroke-width="2"/>
<g clip-path="url(#pc)">
${pipeEls.join('\n')}
${dissolve}
</g>
${titleEls.join('\n')}
${her}
${tag1.svg}
${tag2.svg}
${legend.join('\n')}
</svg>
`;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, svg);
const segs = pipes.reduce((a, p) => a + p.cells.length - 1, 0);
console.log(`cells ${valid.size}, pipes ${pipes.length}, segments ${segs}, runs ${objs.filter((o) => o.kind === 'run').length}, ` +
  `joints ${objs.filter((o) => o.kind === 'joint').length}, ticks ${ticksUsed.size}, lengths ${lensUsed.size}, splits ${splits}, forced ${forced}, coconut ${coconut ? 'yes' : 'no'}`);
console.log(`wrote ${path.relative(process.cwd(), OUT)} (${(svg.length / 1024).toFixed(1)} KB)`);
