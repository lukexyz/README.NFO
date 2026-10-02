#!/usr/bin/env node
// CASTAWAY README header: "Glitch Art" (64-glitch-art_opus_5.5).
// Plain Node, no dependencies, fully deterministic (seeded PRNG, no clock reads).
//   node examples/castaway/src/64-glitch-art_opus_5.5.mjs
// writes examples/castaway/assets/64-glitch-art_opus_5.5.svg
//
// THE STYLE is glitch art: errors used on purpose. Databending (editing a file's
// bytes), datamoshing (losing the keyframe so motion smears one picture into the
// next), slice displacement, RGB channel separation, 8x8 and 16x16 block artefacts,
// threshold pixel-sort streaks, colour-table corruption and stutter. It is a
// treatment rather than a style of its own, so it is laid over a plain heavy
// wordmark on a dark ground and a sunny widescreen still of the island. Nothing
// here reproduces any particular artwork; every shape is drawn by this script.
//
// THE JOKE is compression. A ten-hour video in which nothing moves is a codec's
// dream: almost every frame is a P-frame that says "same as before". This header
// has lost its keyframe on purpose, and you can only tell when something moves,
// which on this island takes a while. A bro on an electric hydrofoil carves past,
// and with no keyframe to correct it his colours smear across the sea in blocky
// steps until the next keyframe lands, exactly on the next bar of the music.
//
// ONE 15-SECOND LOOP = FIVE BARS of the theme (80 BPM, one bar every 3 s). Every
// glitch lands on a bar line, like every gag in the video. Each burst is short
// (300-400 ms, stepped, never eased) and the picture is clean in between:
//   0-3 s    clean. She nods on every beat (0.75 s).
//   3.0 s    SLICES: horizontal bands slide sideways, the wordmark splits into
//            red, green and blue, a strip of it stutters down the frame.
//   6.0 s    DATAMOSH: the hydrofoil crosses in stepped movement (12.5 steps a
//            second) and drags his colours behind him in 8-unit blocks.
//   9.0 s    KEYFRAME: the smear vanishes, and for 300 ms the colour table is
//            wrong (channel-swapped bands, pure magenta, cyan and acid green).
//   12.0 s   PIXEL SORT: bright runs (the letters, the sun, the clouds, the sand)
//            are dragged down into smooth comb-like streaks, then snap back.
// Photosensitivity: every burst is local (bands, blocks, streaks), lasts 400 ms
// at most and starts 3 s after the last, so no burst has more than four state
// changes in any one second (two flashes at most), and the frame is never flashed
// whole. The hydrofoil's 12.5 steps a second move a small sprite; that is motion,
// not a flash.
//
// LETTERING, no <text> anywhere:
//   * "Bent Grotesk": a heavy plain capital sans for CASTAWAY, drawn here as
//     polygons with rounded corners (C, S) and straight diagonals (A, W, Y).
//   * "Hexdump 5x7": a 5x7 pixel face for the filename and hex captions.
//
// prefers-reduced-motion stops everything on 7.6 s: the hydrofoil passing in front
// of the island with a shaka and his datamosh smear behind him, the wordmark clean,
// and the caption reading SOMETHING MOVED.

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const SLUG = '64-glitch-art_opus_5.5';
const OUT = resolve(here, `../assets/${SLUG}.svg`);

const W = 1200;
const H = 680;
const PX = 24; // the widescreen still
const PY = 256;
const PW = 1152;
const PH = 360;

const n1 = (v) => +(+v).toFixed(1);
const n2 = (v) => +(+v).toFixed(2);

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
const rand = mulberry32(1992);
const rr = (a, b) => a + (b - a) * rand();
const ri = (a, b) => Math.floor(rr(a, b + 1));

// ------------------------------------------------------------------ palette
const C = {
  ground: '#07070c',
  rim: '#262636',
  cap: '#8d91aa',
  capHi: '#e9ebf5',
  white: '#ffffff',
  magenta: '#ff00ff',
  cyan: '#00ffff',
  green: '#00ff00',
  sky0: '#1670d4',
  sky1: '#3f9be8',
  sky2: '#8fd0f6',
  sky3: '#c4e9fb',
  sun: '#fffbe6',
  cloud: '#ffffff',
  cloudShade: '#d3e7f7',
  cloudDeep: '#a9cbe9',
  sea0: '#1455a8',
  sea1: '#1a6cc2',
  sea2: '#1d8ed2',
  sea3: '#26b0d6',
  trough: '#0e4791',
  shallow: '#35c2cc',
  shallow2: '#7ddcd5',
  foam: '#ffffff',
  sand: '#f1d9a4',
  sandLit: '#f9ebc6',
  sandShade: '#d6b67c',
  wet: '#c4a36c',
  leafDeep: '#1c5f34',
  leafDark: '#24773a',
  leaf: '#3d9a3b',
  leafLit: '#7cc447',
  leafHi: '#b6df6c',
  trunk: '#b06f47',
  trunkDark: '#7c472d',
  trunkLit: '#d59a6b',
  nut: '#5c3a1f',
  rock: '#8d9098',
  rockLit: '#b7bac1',
  rockDark: '#686c75',
  log: '#9a5734',
  logDark: '#6b381f',
  logEnd: '#ddb07e',
  rope: '#efdcaa',
  skin: '#f0bf9b',
  skinDark: '#d79b78',
  hair: '#5a3824',
  hairDark: '#3f2617',
  coral: '#f2705d',
  coralDark: '#cf5446',
  cream: '#f7efdc',
  creamDark: '#d8cbae',
  ink: '#2a1a14',
  board: '#ff7a1a',
  boardDark: '#c4530c',
  vest: '#b9f03c',
  vestDark: '#86b81f',
  suit: '#1c2849',
  broSkin: '#e7ad84',
  broHair: '#f6d65e',
  mast: '#ccd4de',
  wing: '#3b4656',
};

// ------------------------------------------------------------------ the timeline
const LOOP = 15; // five bars of the theme
const BEAT = 0.75; // 80 BPM
const STILL = 7.6; // the reduced-motion frame
const SPS = 100; // timeline samples per second
const css = [];
let uid = 0;
const decl = (v) => {
  const out = [];
  if (v.x !== undefined || v.y !== undefined) out.push(`transform:translate(${n2(v.x || 0)}px,${n2(v.y || 0)}px)`);
  if (v.v !== undefined) out.push(`visibility:${v.v ? 'visible' : 'hidden'}`);
  return out.join(';');
};
const attrOf = (v) => {
  let s = '';
  if (v.x !== undefined || v.y !== undefined) s += ` transform="translate(${n2(v.x || 0)} ${n2(v.y || 0)})"`;
  if (v.v !== undefined) s += ` visibility="${v.v ? 'visible' : 'hidden'}"`;
  return s;
};
// Samples sample(t) across the loop and writes hard-cut keyframes for it. Returns
// the element's class plus its state in the still frame (used under reduced motion).
const seen = new Map();
function track(sample) {
  const n = Math.round(LOOP * SPS);
  const frames = [];
  let prev = null;
  for (let i = 0; i <= n; i++) {
    const v = decl(sample(i === n ? 0 : i / SPS + 1e-6));
    if (v !== prev || i === n) {
      frames.push(`${+((i / n) * 100).toFixed(3)}%{${v}}`);
      prev = v;
    }
  }
  const body = frames.join('');
  let name = seen.get(body);
  if (!name) {
    name = 'k' + (uid++).toString(36);
    seen.set(body, name);
    css.push(`@keyframes ${name}{${body}}.${name}{animation:${name} ${LOOP}s step-end infinite}`);
  }
  return ` class="${name}"${attrOf(sample(STILL))}`;
}
const during = (a, b) => track((t) => ({ v: t >= a && t < b }));

// ------------------------------------------------------------------ geometry helpers
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const len = (a) => Math.hypot(a[0], a[1]);
const unit = (a) => { const l = len(a) || 1; return [a[0] / l, a[1] / l]; };
const area = (pts) => {
  let s = 0;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    s += a[0] * b[1] - b[0] * a[1];
  }
  return s / 2;
};
// A polygon with a radius per vertex. Returns the path and a sampled outline (for
// rasterising the pixel-sort start points).
function roundPoly(pts, radii = []) {
  const n = pts.length;
  let d = '';
  const samp = [];
  for (let i = 0; i < n; i++) {
    const P = pts[i];
    const A = pts[(i - 1 + n) % n];
    const B = pts[(i + 1) % n];
    const r = radii[i] || 0;
    if (!r) {
      d += (i ? 'L' : 'M') + `${n1(P[0])} ${n1(P[1])}`;
      samp.push(P);
      continue;
    }
    const u = unit(sub(A, P));
    const v = unit(sub(B, P));
    const theta = Math.acos(Math.max(-1, Math.min(1, u[0] * v[0] + u[1] * v[1])));
    const t = r / Math.tan(theta / 2);
    const P1 = [P[0] + u[0] * t, P[1] + u[1] * t];
    const P2 = [P[0] + v[0] * t, P[1] + v[1] * t];
    const cross = (P[0] - A[0]) * (B[1] - P[1]) - (P[1] - A[1]) * (B[0] - P[0]);
    const sweep = cross > 0 ? 1 : 0;
    d += (i ? 'L' : 'M') + `${n1(P1[0])} ${n1(P1[1])}A${r} ${r} 0 0 ${sweep} ${n1(P2[0])} ${n1(P2[1])}`;
    const bis = unit([u[0] + v[0], u[1] + v[1]]);
    const hd = r / Math.sin(theta / 2);
    const O = [P[0] + bis[0] * hd, P[1] + bis[1] * hd];
    let a0 = Math.atan2(P1[1] - O[1], P1[0] - O[0]);
    let a1 = Math.atan2(P2[1] - O[1], P2[0] - O[0]);
    let da = a1 - a0;
    while (da > Math.PI) da -= 2 * Math.PI;
    while (da < -Math.PI) da += 2 * Math.PI;
    for (let k = 0; k <= 8; k++) samp.push([O[0] + r * Math.cos(a0 + (da * k) / 8), O[1] + r * Math.sin(a0 + (da * k) / 8)]);
  }
  return { d: d + 'Z', samp };
}
const cw = (pts) => (area(pts) < 0 ? [...pts].reverse() : pts);
const polyD = (pts) => 'M' + pts.map(([x, y]) => `${n1(x)} ${n1(y)}`).join('L') + 'Z';
const inPoly = (x, y, pts) => {
  let c = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i];
    const [xj, yj] = pts[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
};

// ------------------------------------------------------------------ "Bent Grotesk"
// Cap height 150. Each glyph: { w, parts: [{pts, radii, hole?}] }. Parts are unioned
// (nonzero, all clockwise); holes are wound the other way.
const CAP = 150;
const GLYPHS = {
  C: { w: 128, parts: [{ pts: [[0, 0], [128, 0], [128, 42], [42, 42], [42, 108], [128, 108], [128, 150], [0, 150]], radii: [54, 0, 0, 16, 16, 0, 0, 54] }] },
  S: { w: 124, parts: [{ pts: [[0, 0], [124, 0], [124, 34], [42, 34], [42, 58], [124, 58], [124, 150], [0, 150], [0, 116], [82, 116], [82, 92], [0, 92]], radii: [42, 0, 0, 10, 10, 42, 42, 0, 0, 10, 10, 42] }] },
  T: { w: 120, parts: [{ pts: [[0, 0], [120, 0], [120, 40], [80, 40], [80, 150], [40, 150], [40, 40], [0, 40]] }] },
  A: { w: 144, parts: [{ pts: [[0, 150], [52, 0], [92, 0], [144, 150], [100, 150], [91, 124], [53, 124], [44, 150]] }, { pts: [[62, 98], [72, 69.2], [82, 98]], hole: true }] },
  W: { w: 220, parts: [
    { pts: [[0, 0], [40, 0], [85, 150], [45, 150]] },
    { pts: [[45, 150], [85, 150], [130, 0], [90, 0]] },
    { pts: [[90, 0], [130, 0], [175, 150], [135, 150]] },
    { pts: [[135, 150], [175, 150], [220, 0], [180, 0]] },
  ] },
  Y: { w: 140, parts: [
    { pts: [[0, 0], [44, 0], [92, 86], [48, 86]] },
    { pts: [[96, 0], [140, 0], [92, 86], [48, 86]] },
    { pts: [[48, 70], [92, 70], [92, 150], [48, 150]] },
  ] },
};
const WORD = 'CASTAWAY';
const ADV = [0, 136, 152, 132, 90, 107, 183, 104]; // hand-kerned pen advances
const WM_W = ADV.reduce((a, b) => a + b, 0) + GLYPHS.Y.w;
const WMX = Math.round((W - WM_W) / 2);
const WMY = 54;
const glyphDefs = [];
const glyphOutlines = {}; // letter -> list of {samp, hole}
for (const [ch, g] of Object.entries(GLYPHS)) {
  let d = '';
  glyphOutlines[ch] = [];
  for (const p of g.parts) {
    let pts = cw(p.pts);
    let radii = p.radii || [];
    if (pts !== p.pts) radii = [...radii].reverse();
    if (p.hole) { pts = [...pts].reverse(); radii = [...radii].reverse(); }
    const r = roundPoly(pts, radii);
    d += r.d;
    glyphOutlines[ch].push({ samp: r.samp, hole: !!p.hole });
  }
  glyphDefs.push(`<path id="w${ch}" d="${d}"/>`);
}
const wmPlacements = [];
{
  let x = WMX;
  [...WORD].forEach((ch, i) => {
    x += ADV[i];
    wmPlacements.push({ ch, x });
  });
}
// coverage test for the wordmark, in panel coordinates
function wmCovers(x, y) {
  for (const { ch, x: gx } of wmPlacements) {
    const lx = x - gx;
    const ly = y - WMY;
    if (lx < 0 || lx > GLYPHS[ch].w || ly < 0 || ly > CAP) continue;
    let inside = false;
    let hole = false;
    for (const o of glyphOutlines[ch]) {
      if (inPoly(lx, ly, o.samp)) { if (o.hole) hole = true; else inside = true; }
    }
    if (inside && !hole) return true;
  }
  return false;
}

// ------------------------------------------------------------------ "Hexdump 5x7"
const FONT5 = {
  A: '.###.|#...#|#...#|#...#|#####|#...#|#...#', B: '####.|#...#|#...#|####.|#...#|#...#|####.',
  C: '.###.|#...#|#....|#....|#....|#...#|.###.', D: '###..|#..#.|#...#|#...#|#...#|#..#.|###..',
  E: '#####|#....|#....|####.|#....|#....|#####', F: '#####|#....|#....|####.|#....|#....|#....',
  G: '.###.|#...#|#....|#.###|#...#|#...#|.####', H: '#...#|#...#|#...#|#####|#...#|#...#|#...#',
  I: '.###.|..#..|..#..|..#..|..#..|..#..|.###.', J: '..###|...#.|...#.|...#.|...#.|#..#.|.##..',
  K: '#...#|#..#.|#.#..|##...|#.#..|#..#.|#...#', L: '#....|#....|#....|#....|#....|#....|#####',
  M: '#...#|##.##|#.#.#|#.#.#|#...#|#...#|#...#', N: '#...#|#...#|##..#|#.#.#|#..##|#...#|#...#',
  O: '.###.|#...#|#...#|#...#|#...#|#...#|.###.', P: '####.|#...#|#...#|####.|#....|#....|#....',
  Q: '.###.|#...#|#...#|#...#|#.#.#|#..#.|.##.#', R: '####.|#...#|#...#|####.|#.#..|#..#.|#...#',
  S: '.####|#....|#....|.###.|....#|....#|####.', T: '#####|..#..|..#..|..#..|..#..|..#..|..#..',
  U: '#...#|#...#|#...#|#...#|#...#|#...#|.###.', V: '#...#|#...#|#...#|#...#|#...#|.#.#.|..#..',
  W: '#...#|#...#|#...#|#.#.#|#.#.#|#.#.#|.#.#.', X: '#...#|#...#|.#.#.|..#..|.#.#.|#...#|#...#',
  Y: '#...#|#...#|#...#|.#.#.|..#..|..#..|..#..', Z: '#####|....#|...#.|..#..|.#...|#....|#####',
  0: '.###.|#...#|#..##|#.#.#|##..#|#...#|.###.', 1: '..#..|.##..|..#..|..#..|..#..|..#..|.###.',
  2: '.###.|#...#|....#|...#.|..#..|.#...|#####', 3: '#####|...#.|..#..|...#.|....#|#...#|.###.',
  4: '...#.|..##.|.#.#.|#..#.|#####|...#.|...#.', 5: '#####|#....|####.|....#|....#|#...#|.###.',
  6: '..##.|.#...|#....|####.|#...#|#...#|.###.', 7: '#####|....#|...#.|..#..|.#...|.#...|.#...',
  8: '.###.|#...#|#...#|.###.|#...#|#...#|.###.', 9: '.###.|#...#|#...#|.####|....#|...#.|.##..',
  '.': '.....|.....|.....|.....|.....|.##..|.##..', ',': '.....|.....|.....|.....|.##..|..#..|.#...',
  ':': '.....|.##..|.##..|.....|.##..|.##..|.....', '-': '.....|.....|.....|.###.|.....|.....|.....',
  '_': '.....|.....|.....|.....|.....|.....|#####', '/': '....#|....#|...#.|..#..|.#...|#....|#....',
  '(': '...#.|..#..|.#...|.#...|.#...|..#..|...#.', ')': '.#...|..#..|...#.|...#.|...#.|..#..|.#...',
  '>': '.#...|..#..|...#.|....#|...#.|..#..|.#...', '#': '.#.#.|.#.#.|#####|.#.#.|#####|.#.#.|.#.#.',
  '=': '.....|.....|#####|.....|#####|.....|.....', '+': '.....|..#..|..#..|#####|..#..|..#..|.....',
  "'": '..#..|..#..|.#...|.....|.....|.....|.....', '!': '..#..|..#..|..#..|..#..|..#..|.....|..#..',
  '*': '.....|#.#.#|.###.|#####|.###.|#.#.#|.....', '|': '..#..|..#..|..#..|..#..|..#..|..#..|..#..',
};
const runPath = (rows, s) => {
  let d = '';
  rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      if (row[x] !== '#') { x++; continue; }
      let e = x;
      while (e < row.length && row[e] === '#') e++;
      d += `M${n2(x * s)} ${n2(y * s)}h${n2((e - x) * s)}v${n2(s)}h${n2(-(e - x) * s)}z`;
      x = e;
    }
  });
  return d;
};
const fontDefs = new Map(); // key -> path
const fontScaleId = { 2: 'a', 2.4: 'b' };
function textUses(str, x, y, s) {
  const pre = fontScaleId[s];
  let out = '';
  [...str].forEach((ch, i) => {
    if (ch === ' ') return;
    if (!FONT5[ch]) throw new Error(`no glyph for ${JSON.stringify(ch)} in ${str}`);
    const id = `${pre}${ch.codePointAt(0)}`;
    if (!fontDefs.has(id)) fontDefs.set(id, `<path id="${id}" d="${runPath(FONT5[ch].split('|'), s)}"/>`);
    out += `<use href="#${id}" x="${n2(x + i * 6 * s)}" y="${n2(y)}"/>`;
  });
  return out;
}
const textW = (str, s) => (str.length * 6 - 1) * s;

// ------------------------------------------------------------------ the island still
// Local coordinates: 0..PW x 0..PH. Horizon at y 118.
const HZ = 118;
const pic = [];
pic.push(`<rect width="${PW}" height="${HZ + 3}" fill="url(#gSky)"/>`);
// sun, high and to the left
const SUN = [104, 30];
pic.push(`<circle cx="${SUN[0]}" cy="${SUN[1]}" r="44" fill="${C.sun}" opacity=".1"/><circle cx="${SUN[0]}" cy="${SUN[1]}" r="28" fill="${C.sun}" opacity=".25"/><circle cx="${SUN[0]}" cy="${SUN[1]}" r="15" fill="${C.sun}"/>`);
// cumulus, three tones: a cool shaded silhouette, a mid layer, and sunlit tops
// nudged up and towards the sun; a flat blue-grey base where it sits on the haze
const clouds = [];
const circ = (list, dx, dy, dr) => list.map(([x, y, rad]) => `<circle cx="${Math.round(x + dx)}" cy="${Math.round(y + dy)}" r="${Math.max(1, Math.round(rad + dr))}"/>`).join('');
function cloud(cx, base, w, h, seed) {
  const r = mulberry32(seed);
  const n = Math.max(3, Math.round(w / 24));
  const all = [];
  for (let i = 0; i < n; i++) {
    const f = (i + 0.5) / n;
    const env = Math.sin(Math.PI * f) ** 0.8;
    const rad = h * (0.22 + 0.38 * env) * (0.8 + 0.4 * r());
    const x = cx - w / 2 + f * w + (r() - 0.5) * 10;
    all.push([x, base - rad * 0.7 - h * 0.12 * env, rad]);
    // a cauliflower head on the taller bumps
    if (env > 0.55 && r() < 0.75) all.push([x + (r() - 0.5) * rad, base - rad * 1.25 - h * 0.25 * env, rad * (0.45 + 0.2 * r())]);
  }
  let s = `<g fill="${C.cloudShade}">${circ(all, 0, 0, 0)}<rect x="${Math.round(cx - w / 2 - 4)}" y="${Math.round(base - h * 0.28)}" width="${Math.round(w + 8)}" height="${Math.round(h * 0.28)}" rx="${Math.round(h * 0.14)}"/></g>`;
  s += `<g fill="#eef6fd">${circ(all, -1, -3, -2)}</g>`;
  s += `<g fill="${C.cloud}">${circ(all, -3, -6, -5)}</g>`;
  s += `<rect x="${Math.round(cx - w / 2)}" y="${base - 5}" width="${Math.round(w)}" height="6" rx="3" fill="${C.cloudDeep}"/>`;
  clouds.push({ cx, base, w, h, all });
  return s;
}
pic.push(cloud(330, HZ - 1, 300, 54, 11));
pic.push(cloud(540, HZ - 1, 120, 28, 12));
pic.push(cloud(960, HZ - 1, 340, 70, 13));
pic.push(cloud(1118, HZ - 1, 100, 26, 14));
pic.push(cloud(118, HZ - 1, 130, 22, 17));
pic.push(cloud(800, 38, 90, 16, 15));
pic.push(cloud(436, 24, 64, 12, 16));
// the sea, and its wave marks in perspective
pic.push(`<rect y="${HZ}" width="${PW}" height="${PH - HZ}" fill="url(#gSea)"/>`);
pic.push(`<rect y="${HZ - 1}" width="${PW}" height="2" fill="${C.sky3}" opacity=".7"/>`);
const ISL = { cx: 612, cy: 280, rx: 268, ry: 54 };
const RAFT = { x0: 828, x1: 972, y0: 252, y1: 292 };
const avoid = (x, y) => ((x - ISL.cx) / ISL.rx) ** 2 + ((y - ISL.cy) / ISL.ry) ** 2 < 1 || (x > RAFT.x0 - 10 && x < RAFT.x1 + 10 && y > RAFT.y0 - 6 && y < RAFT.y1 + 6);
{
  const hi = [];
  const lo = [];
  const glint = [];
  const NR = 34;
  for (let j = 0; j < NR; j++) {
    const f = (j + 0.5) / NR;
    const y = Math.round(HZ + 3 + (PH - HZ - 4) * f ** 1.45);
    const depth = f;
    const count = Math.round(9 + 9 * (1 - depth));
    for (let k = 0; k < count; k++) {
      const L = Math.round((4 + 34 * depth ** 1.1) * rr(0.5, 1.4));
      const h = n1(0.8 + 2 * depth);
      const x = Math.round(rr(-20, PW));
      if (avoid(x + L / 2, y)) continue;
      if (rand() < 0.6) hi.push(`M${x} ${y}h${L}v${h}h${-L}z`);
      else lo.push(`M${x} ${n1(y + h + 0.6)}h${L}v${h}h${-L}z`);
    }
    // the sun's glitter path, below the sun
    if (y < 220) {
      for (let k = 0; k < 4; k++) {
        const L = 2 + 12 * depth;
        const x = SUN[0] + rr(-26 - 70 * depth, 26 + 70 * depth);
        glint.push(`M${n1(x)} ${n1(y)}h${n1(L)}v${n1(0.8 + 1.4 * depth)}h${n1(-L)}z`);
      }
    }
  }
  pic.push(`<path d="${lo.join('')}" fill="${C.trough}" opacity=".5"/>`);
  pic.push(`<path d="${hi.join('')}" fill="#e6f6ff" opacity=".62"/>`);
  pic.push(`<path d="${glint.join('')}" fill="#ffffff" opacity=".9"/>`);
}
// shallows and foam
pic.push(`<ellipse cx="${ISL.cx}" cy="${ISL.cy}" rx="${ISL.rx}" ry="${ISL.ry}" fill="${C.shallow}" opacity=".9"/>`);
pic.push(`<ellipse cx="${ISL.cx}" cy="${ISL.cy - 2}" rx="${ISL.rx - 34}" ry="${ISL.ry - 13}" fill="${C.shallow2}"/>`);
pic.push(`<ellipse cx="${ISL.cx + 6}" cy="${ISL.cy + 1}" rx="${ISL.rx - 30}" ry="${ISL.ry - 10}" fill="none" stroke="#fff" stroke-width="1.6" stroke-dasharray="14 9 34 12 9 7" opacity=".75"/>`);
// the island
const ISLAND = 'M416 276C428 258 520 246 602 245C684 244 772 250 808 266C824 274 802 291 760 295C690 301 560 303 480 297C440 293 408 286 416 276Z';
pic.push(`<path d="${ISLAND}" transform="translate(0 4)" fill="${C.wet}"/>`);
pic.push(`<path d="${ISLAND}" fill="${C.sand}"/>`);
pic.push(`<path d="M438 271C452 258 530 251 602 250C676 249 760 254 792 265C760 275 640 278 560 278C500 278 452 277 438 271Z" fill="${C.sandLit}"/>`);
pic.push(`<path d="${ISLAND}" fill="none" stroke="#fff" stroke-width="2.4" stroke-dasharray="30 8 44 10 20 6" transform="translate(0 2)" opacity=".95"/>`);
// palm shadow on the sand
pic.push(`<ellipse cx="712" cy="268" rx="52" ry="6" fill="${C.sandShade}" opacity=".75"/>`);
// rocks
const rock = (x, y, rx, ry) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${C.rockDark}"/><ellipse cx="${x - rx * 0.15}" cy="${y - ry * 0.25}" rx="${rx * 0.8}" ry="${ry * 0.7}" fill="${C.rock}"/><ellipse cx="${x - rx * 0.3}" cy="${y - ry * 0.45}" rx="${rx * 0.4}" ry="${ry * 0.3}" fill="${C.rockLit}"/>`;
pic.push(rock(454, 292, 12, 8));
// (the right-hand rock sits clear of the hydrofoil in the reduced-motion still, so
// he never looks as if he is holding it)
pic.push(rock(798, 283, 8, 5.5));
// low tropical shrubs: fans of pointed leaves, dark underneath, lit on top
{
  const r = mulberry32(77);
  const dark = [];
  const mid = [];
  const lit = [];
  const leaf = (x, y, ang, L, w) => {
    const a = (ang * Math.PI) / 180;
    const d = [Math.cos(a), Math.sin(a)];
    const nm = [-d[1], d[0]];
    const tip = [x + d[0] * L, y + d[1] * L];
    const m = [x + d[0] * L * 0.5, y + d[1] * L * 0.5];
    return `M${n1(x)} ${n1(y)}Q${n1(m[0] + nm[0] * w)} ${n1(m[1] + nm[1] * w)} ${n1(tip[0])} ${n1(tip[1])}Q${n1(m[0] - nm[0] * w)} ${n1(m[1] - nm[1] * w)} ${n1(x)} ${n1(y)}Z`;
  };
  const shrub = (x, y, size) => {
    const n = 7 + Math.floor(r() * 4);
    for (let i = 0; i < n; i++) {
      const ang = -172 + (164 * i) / (n - 1) + (r() - 0.5) * 12;
      const L = size * (0.65 + 0.45 * Math.sin((Math.PI * i) / (n - 1))) * (0.85 + r() * 0.3);
      const target = Math.abs(ang + 90) < 40 ? lit : Math.abs(ang + 90) < 70 ? mid : dark;
      target.push(leaf(x + (r() - 0.5) * size * 0.3, y, ang, L, size * 0.16));
    }
  };
  for (const [x, y, s] of [[486, 270, 15], [512, 266, 19], [540, 272, 14], [566, 268, 11], [744, 266, 12], [762, 270, 9], [458, 280, 9]]) shrub(x, y, s);
  pic.push(`<path d="${dark.join('')}" fill="${C.leafDark}"/><path d="${mid.join('')}" fill="${C.leaf}"/><path d="${lit.join('')}" fill="${C.leafLit}"/>`);
}
// raft
{
  let s = `<ellipse cx="${(RAFT.x0 + RAFT.x1) / 2}" cy="${RAFT.y1 - 6}" rx="${(RAFT.x1 - RAFT.x0) / 2 + 12}" ry="13" fill="${C.shallow2}" opacity=".55"/>`;
  for (let i = 0; i < 6; i++) {
    const y = RAFT.y0 + 6 + i * 5.4;
    const x0 = RAFT.x0 + 14 - i * 2.6;
    const x1 = RAFT.x1 - 18 - i * 2.6;
    s += `<rect x="${n1(x0)}" y="${n1(y)}" width="${n1(x1 - x0)}" height="6.4" rx="3.2" fill="${i % 2 ? C.log : '#a8623b'}"/>`;
    s += `<rect x="${n1(x0 + 3)}" y="${n1(y + 4.2)}" width="${n1(x1 - x0 - 6)}" height="1.6" fill="${C.logDark}" opacity=".6"/>`;
    s += `<ellipse cx="${n1(x1 - 1)}" cy="${n1(y + 3.2)}" rx="2.4" ry="3.1" fill="${C.logEnd}"/>`;
  }
  for (const rx of [862, 930]) s += `<path d="M${rx} ${RAFT.y0 + 6}l-14 33" stroke="${C.rope}" stroke-width="2.6"/>`;
  s += `<path d="M${RAFT.x0 + 2} ${RAFT.y1 + 3}h${RAFT.x1 - RAFT.x0 - 16}" stroke="#fff" stroke-width="1.6" stroke-dasharray="18 6 30 8" opacity=".8"/>`;
  pic.push(s);
}
// palm trunk: a quadratic centreline, tapering, segmented
const TR = [[678, 268], [702, 160], [650, 54]];
const qAt = (t) => {
  const [a, b, c] = TR;
  const m = 1 - t;
  return [m * m * a[0] + 2 * m * t * b[0] + t * t * c[0], m * m * a[1] + 2 * m * t * b[1] + t * t * c[1]];
};
const qTan = (t) => {
  const [a, b, c] = TR;
  return unit([2 * (1 - t) * (b[0] - a[0]) + 2 * t * (c[0] - b[0]), 2 * (1 - t) * (b[1] - a[1]) + 2 * t * (c[1] - b[1])]);
};
{
  const L = [];
  const R = [];
  const lit = [];
  const N = 30;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const p = qAt(t);
    const tg = qTan(t);
    const nm = [-tg[1], tg[0]];
    const w = 8.5 - 3.5 * t + (t < 0.06 ? (0.06 - t) * 60 : 0);
    L.push([p[0] + nm[0] * w, p[1] + nm[1] * w]);
    R.push([p[0] - nm[0] * w, p[1] - nm[1] * w]);
    lit.push([p[0] - nm[0] * w * 0.15, p[1] - nm[1] * w * 0.15]);
  }
  let s = `<path d="${polyD([...L, ...R.reverse()])}" fill="${C.trunk}"/>`;
  // the lit side is the one facing the sun (left)
  const side = L[0][0] < R[R.length - 1][0] ? L : [...R].reverse();
  s += `<path d="${polyD([...side, ...[...lit].reverse()])}" fill="${C.trunkLit}" opacity=".85"/>`;
  let bands = '';
  for (let t = 0.04; t < 0.97; t += 0.055) {
    const p = qAt(t);
    const tg = qTan(t);
    const nm = [-tg[1], tg[0]];
    const w = 8.5 - 3.5 * t;
    bands += `M${n1(p[0] + nm[0] * w)} ${n1(p[1] + nm[1] * w)}Q${n1(p[0] - tg[0] * 2.4)} ${n1(p[1] - tg[1] * 2.4)} ${n1(p[0] - nm[0] * w)} ${n1(p[1] - nm[1] * w)}`;
  }
  s += `<path d="${bands}" fill="none" stroke="${C.trunkDark}" stroke-width="1.6" opacity=".8"/>`;
  pic.push(s);
}
// palm crown
const CROWN = [650, 52];
function frond(ang, L, droop, wMax, cols) {
  const a = (ang * Math.PI) / 180;
  const dir = [Math.cos(a), Math.sin(a)];
  const C0 = CROWN;
  const T = [C0[0] + dir[0] * L, C0[1] + dir[1] * L + droop];
  const K = [C0[0] + dir[0] * L * 0.5, C0[1] + dir[1] * L * 0.5 - L * 0.2];
  const at = (t) => {
    const m = 1 - t;
    return [m * m * C0[0] + 2 * m * t * K[0] + t * t * T[0], m * m * C0[1] + 2 * m * t * K[1] + t * t * T[1]];
  };
  const N = 16;
  const up = [];
  const dn = [];
  const spine = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const p = at(t);
    const q = at(Math.min(1, t + 0.01));
    const p0 = at(Math.max(0, t - 0.01));
    const tg = unit(sub(q, p0));
    let nm = [-tg[1], tg[0]];
    if (nm[1] > 0) nm = [-nm[0], -nm[1]]; // nm points up
    const zig = i % 2 ? 1 : 0.55;
    const w = wMax * Math.sin(Math.PI * Math.min(1, t * 1.08)) ** 0.75 * (i === 0 || i === N ? 0 : zig);
    up.push([p[0] + nm[0] * w * 0.8, p[1] + nm[1] * w * 0.8]);
    dn.push([p[0] - nm[0] * w, p[1] - nm[1] * w]);
    spine.push(p);
  }
  return `<path d="${polyD([...up, ...[...dn].reverse()])}" fill="${cols[0]}"/><path d="${polyD([...up, ...[...spine].reverse()])}" fill="${cols[1]}"/><path d="M${spine.map(([x, y]) => `${n1(x)} ${n1(y)}`).join('L')}" fill="none" stroke="${cols[2]}" stroke-width="1.3"/>`;
}
{
  const back = [C.leafDeep, C.leafDark, C.leaf];
  const front = [C.leafDark, C.leafLit, C.leafHi];
  let s = '';
  for (const [a, L, d, w] of [[-120, 54, 6, 9], [-62, 52, 4, 9], [200, 70, 26, 10], [-12, 74, 26, 10]]) s += frond(a, L, d, w, back);
  for (const [a, L, d, w] of [[-158, 76, 34, 11], [-92, 48, 2, 9], [-34, 72, 22, 11], [12, 84, 44, 12], [44, 62, 46, 10], [140, 66, 50, 10], [176, 86, 44, 12]]) s += frond(a, L, d, w, front);
  s += `<circle cx="${CROWN[0] - 5}" cy="${CROWN[1] + 7}" r="5.6" fill="${C.nut}"/><circle cx="${CROWN[0] + 4}" cy="${CROWN[1] + 9}" r="5.4" fill="${C.nut}"/><circle cx="${CROWN[0]}" cy="${CROWN[1] + 3}" r="5" fill="#704a28"/><circle cx="${CROWN[0] - 6.5}" cy="${CROWN[1] + 5}" r="1.6" fill="#9a6a3c"/>`;
  pic.push(s);
}
// her: seated at the foot of the palm, eyes shut, nodding on every beat.
// Drawn around her hips at (0,0), then placed and scaled.
const HER = { x: 640, y: 268, s: 1.3 };
{
  const headNod = track((t) => {
    const ph = (t % BEAT) / BEAT;
    return { x: 0, y: ph < 0.45 ? 1.4 : 0 };
  });
  let s = `<g transform="translate(${HER.x} ${HER.y}) scale(${HER.s})">`;
  s += `<ellipse cx="2" cy="7" rx="17" ry="3.2" fill="${C.sandShade}" opacity=".8"/>`;
  // arms back, hands on the sand
  s += `<path d="M-6 -23L-12 -2M7 -23L12 -2" stroke="${C.skin}" stroke-width="3" stroke-linecap="round" fill="none"/>`;
  // legs stretched out towards us, feet crossed
  s += `<path d="M-3 0L-13 9M4 1L-6 11" stroke="${C.skin}" stroke-width="4" stroke-linecap="round" fill="none"/>`;
  s += `<path d="M-4 0L-11 7" stroke="${C.skinDark}" stroke-width="1" stroke-linecap="round" opacity=".5"/>`;
  s += `<ellipse cx="-15" cy="10.6" rx="2.8" ry="1.7" fill="${C.skinDark}"/><ellipse cx="-8" cy="12.4" rx="2.8" ry="1.7" fill="${C.skinDark}"/>`;
  // cream shorts
  s += `<path d="M-9 -7L9 -7L10 1L4 3.5L0 1L-5 4L-10 1Z" fill="${C.cream}"/><path d="M-9 -7L9 -7L9.3 -5L-9.3 -5Z" fill="${C.creamDark}"/>`;
  // coral tank top
  s += `<path d="M-6.5 -25L6.5 -25L8.5 -14L9 -6L-9 -6L-8.5 -14Z" fill="${C.coral}"/><path d="M1 -25L6.5 -25L8.5 -14L9 -6L3 -6Z" fill="${C.coralDark}" opacity=".45"/>`;
  s += `<path d="M-5.5 -25L-4.5 -28M5.5 -25L4.5 -28" stroke="${C.coral}" stroke-width="1.6"/>`;
  s += `<rect x="-1.8" y="-31" width="3.6" height="6" fill="${C.skin}"/>`;
  // head (nods)
  s += `<g${headNod}>`;
  s += `<circle cx="0.6" cy="-37" r="7.2" fill="${C.hair}"/>`;
  s += `<path d="M-6.4 -36.5A6.2 6.2 0 0 0 5.6 -34.5L5.2 -38.8C3 -40.5 -2 -41.5 -6 -38.6Z" fill="${C.skin}"/>`;
  s += `<circle cx="6.4" cy="-31.6" r="3.2" fill="${C.hairDark}"/>`; // low bun
  s += `<path d="M-6.8 -38A7.4 7.4 0 0 1 7.6 -38.4" stroke="${C.cream}" stroke-width="1.9" fill="none"/>`; // headphone band
  s += `<ellipse cx="5.6" cy="-36.2" rx="2.6" ry="3.3" fill="${C.cream}" stroke="${C.creamDark}" stroke-width=".6"/>`;
  s += `<ellipse cx="-6.6" cy="-36.4" rx="1.3" ry="2.8" fill="${C.creamDark}"/>`;
  s += `<path d="M-4.6 -35.8q1.1 1 2.2 0M-0.6 -35.6q1.1 1 2.2 0" stroke="${C.ink}" stroke-width=".8" fill="none" stroke-linecap="round"/>`;
  s += `<circle cx="-3.6" cy="-33.6" r="1.1" fill="#f59a8a" opacity=".6"/>`;
  s += `</g></g>`;
  pic.push(s);
}

// ------------------------------------------------------------------ the hydrofoil bro (the gag)
// Sprite around his waterline at (0,0); facing right.
const BRO_S = 1.3;
const BRO_Y = 352;
const BRO_T0 = 6.0;
const BRO_STEP = 0.08; // 12.5 steps a second: stepped movement, like the video
const BRO_DX = 40;
const BRO_X0 = -40;
const broX = (t) => BRO_X0 + BRO_DX * Math.floor((t - BRO_T0) / BRO_STEP + 1e-9);
const BRO_END = BRO_T0 + BRO_STEP * Math.ceil((PW + 60 - BRO_X0) / BRO_DX);
const KEYFRAME = 9.0;
function broSprite(shaka) {
  let s = `<g transform="scale(${BRO_S})">`;
  s += `<ellipse cx="-22" cy="-1" rx="12" ry="3" fill="#fff" opacity=".9"/><ellipse cx="-36" cy="-2" rx="7" ry="2" fill="#fff" opacity=".7"/>`;
  s += `<circle cx="-27" cy="-7" r="1.6" fill="#fff"/><circle cx="-38" cy="-6" r="1.2" fill="#fff"/><circle cx="-15" cy="-6" r="1.3" fill="#fff"/>`;
  s += `<path d="M1 -6V7" stroke="${C.mast}" stroke-width="2.2"/><rect x="-8" y="5.5" width="18" height="2.4" rx="1.2" fill="${C.wing}" opacity=".75"/>`;
  s += `<rect x="-17" y="-10.5" width="35" height="5" rx="2.5" fill="${C.board}"/><rect x="-15" y="-6.6" width="31" height="1.4" fill="${C.boardDark}"/>`;
  s += `<path d="M-6 -10L-4 -19L-1 -27M6 -10L8 -18L3 -27" stroke="${C.suit}" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
  s += `<path d="M-4 -27L5 -27L8 -41L-1 -42Z" fill="${C.vest}"/><path d="M2 -27L5 -27L8 -41L5 -41.5Z" fill="${C.vestDark}"/>`;
  s += `<path d="M0 -39L-7 -31" stroke="${C.broSkin}" stroke-width="2.6" stroke-linecap="round"/>`;
  if (shaka) s += `<path d="M6 -39L11 -47" stroke="${C.broSkin}" stroke-width="2.6" stroke-linecap="round"/><path d="M9.4 -49.6l3.6 -1.4M10.6 -47.2l2.6 2" stroke="${C.broSkin}" stroke-width="1.6" stroke-linecap="round"/><circle cx="11.4" cy="-48" r="1.9" fill="${C.broSkin}"/>`;
  else s += `<path d="M6 -39L12 -33" stroke="${C.broSkin}" stroke-width="2.6" stroke-linecap="round"/>`;
  s += `<rect x="1.8" y="-45" width="2" height="4" fill="${C.broSkin}"/><circle cx="3.6" cy="-47" r="4.4" fill="${C.broSkin}"/>`;
  s += `<path d="M-1 -47.6C-1 -52.6 7 -53.6 8.4 -48.8L4 -49.4L2.4 -47.6L0.6 -45.6Z" fill="${C.broHair}"/>`;
  s += `<rect x="4.2" y="-48.4" width="4" height="1.6" rx=".6" fill="#14161c"/>`;
  s += `</g>`;
  return s;
}
// The datamosh trail. With no keyframe to correct it, every step copies his blocks
// along the motion vector instead of replacing them, so he smears behind himself.
// His sprite, quantised to 8-unit blocks (a row-by-row block map, columns from
// x -24 to +24 around his mast), is stamped from the last position to this one;
// each row lags by its own whole number of blocks, some blocks drop out and show
// the sea, and further back the smear thins out and takes on more sea.
const TB = 8;
const BLOCKMAP = [
  // y0 of the row, then one colour (or null) per 8-unit column
  [-72, [null, null, null, C.broHair, C.broHair, null]],
  [-64, [null, null, null, C.broSkin, C.broHair, null]],
  [-56, [null, null, C.vest, C.vest, C.broSkin, C.broSkin]],
  [-48, [null, C.broSkin, C.vest, C.vestDark, null, null]],
  [-40, [null, null, C.vest, C.vestDark, null, null]],
  [-32, [null, null, C.suit, C.suit, null, null]],
  [-24, [null, C.suit, '#2a3b66', null, C.suit, null]],
  [-16, [C.board, C.board, C.board, C.board, C.board, C.boardDark]],
  [-8, ['#f4fbff', '#ffffff', '#dff2fb', C.mast, null, null]],
];
const SEA_SMEAR = [C.sea1, C.sea3, C.trough, '#e6f6ff', C.shallow];
function trailStep(xa, xb) {
  const byCol = new Map();
  const put = (col, x, y, w) => {
    if (!byCol.has(col)) byCol.set(col, []);
    byCol.get(col).push(`M${x} ${y}h${w}v${TB}h${-w}z`);
  };
  for (const [y0, cols] of BLOCKMAP) {
    const filled = cols.map((c, i) => [c, i]).filter(([c]) => c);
    const c0 = filled[0][1];
    const lag = TB * ri(0, 2);
    // one colour per row per step, so the smear reads as dragged streaks
    const counts = new Map();
    for (const [c] of filled) counts.set(c, (counts.get(c) || 0) + 1);
    const main = [...counts].sort((p, q) => q[1] - p[1])[0][0];
    const rowCol = rand() < 0.72 ? main : filled[Math.floor(rand() * filled.length)][0];
    let x = Math.floor((xa - 24 + c0 * TB - lag) / TB) * TB;
    const end = Math.floor((xb - 24 + c0 * TB - lag) / TB) * TB;
    while (x < end) {
      const w = Math.min(TB * ri(1, 3), end - x); // one motion vector per run
      const age = 1 - Math.max(0, Math.min(1, x / PW));
      const thin = 1 - filled.length / cols.length; // narrow rows (his head) smear thinner
      const dy = rand() < 0.16 ? (rand() < 0.5 ? -TB : TB) : 0;
      if (rand() < 0.06 + 0.2 * age + 0.45 * thin) {
        // dropped: either the sea shows through, or the sea itself gets dragged along
        if (rand() < 0.35) put(SEA_SMEAR[Math.floor(rand() * SEA_SMEAR.length)], x, BRO_Y + y0 + dy, w);
        x += w;
        continue;
      }
      put(rand() < 0.88 ? rowCol : filled[Math.floor(rand() * filled.length)][0], x, BRO_Y + y0 + dy, w);
      x += w;
    }
  }
  return [...byCol].map(([col, ds]) => `<path fill="${col}" d="${ds.join('')}"/>`).join('');
}
const broLayer = [];
{
  const visible = (t) => t >= BRO_T0 && t < BRO_END;
  const pos = track((t) => (visible(t) ? { x: broX(t), y: BRO_Y } : { x: -200, y: BRO_Y }));
  const shakaOn = (t) => visible(t) && broX(t) >= 520;
  // the trail first, so he is drawn over it
  let trail = '';
  const steps = Math.round((BRO_END - BRO_T0) / BRO_STEP);
  for (let k = 1; k < steps; k++) {
    const t = BRO_T0 + k * BRO_STEP;
    const xb = broX(t + 1e-6) - 8;
    const xa = xb - BRO_DX;
    trail += `<g${during(t, KEYFRAME)}>${trailStep(xa, Math.min(PW + 16, xb))}</g>`;
  }
  broLayer.push(trail);
  broLayer.push(`<g${pos}><g${track((t) => ({ v: visible(t) && !shakaOn(t) }))}>${broSprite(false)}</g><g${track((t) => ({ v: shakaOn(t) }))}>${broSprite(true)}</g></g>`);
}

// ------------------------------------------------------------------ captions
const CAP_S = 2;
const SUB_S = 2.4;
const txt = [];
{
  const topL = 'CASTAWAY_SEED1992_10H.MP4';
  const topR = 'H.264  1920X1080  30 FPS  10:00:00';
  txt.push(`<g fill="${C.capHi}">${textUses(topL, 40, 17, CAP_S)}</g>`);
  txt.push(`<g fill="${C.cap}">${textUses(topR, W - 40 - textW(topR, CAP_S), 17, CAP_S)}</g>`);
  // three channel swatches, after the filename
  const sx = 40 + textW(topL, CAP_S) + 18;
  txt.push(`<rect x="${sx}" y="17" width="14" height="14" fill="#ff2a3c"/><rect x="${sx + 18}" y="17" width="14" height="14" fill="${C.green}"/><rect x="${sx + 36}" y="17" width="14" height="14" fill="#2a5cff"/>`);
  // True of the real export too: the browser encoder is asked for a keyframe every
  // 2 s (60 frames at 30 fps), so 59 frames in every 60 are predicted from the last.
  const sub = 'ONE LO-FI ISLAND, TEN HOURS, NEARLY EVERY FRAME SAYS SAME AS BEFORE';
  txt.push(`<g fill="#c9ccdc">${textUses(sub, Math.round((W - textW(sub, SUB_S)) / 2), 220, SUB_S)}</g>`);
  // one caption per bar: the frame type and what the "decoder" makes of it
  const hexP = ['00 00 00 01 41 9A 24 6C 0F 3B', '00 00 00 01 41 9A 46 1D 87 C2', '00 00 00 01 41 9A 6E 03 F1 5A', '00 00 00 01 65 88 84 00 2B FF', '00 00 00 01 41 9A A2 5C 90 0E'];
  const what = [
    ['P-FRAME', 'SAME AS BEFORE', C.cap],
    ['P-FRAME', 'SAME AS BEFORE, SIDEWAYS', C.cyan],
    ['P-FRAME', 'SOMETHING MOVED', C.magenta],
    ['I-FRAME', 'KEYFRAME. ALL BETTER', C.green],
    ['P-FRAME', 'SORTED BY BRIGHTNESS', '#ffd23c'],
  ];
  for (let b = 0; b < 5; b++) {
    const [ft, msg, col] = what[b];
    const right = `${ft}  ${msg}`;
    const rx = W - 40 - textW(right, CAP_S);
    let g = `<g fill="${C.cap}">${textUses(hexP[b], 40, 635, CAP_S)}</g>`;
    g += `<g fill="${C.capHi}">${textUses(ft, rx, 635, CAP_S)}</g>`;
    g += `<g fill="${col}">${textUses(msg, rx + (ft.length + 2) * 6 * CAP_S, 635, CAP_S)}</g>`;
    txt.push(`<g${during(b * 3, b * 3 + 3)}>${g}</g>`);
  }
}

// ------------------------------------------------------------------ glitch machinery
const clipDefs = [];
const filterDefs = [];
let clipN = 0;
const clipOf = (rects) => {
  const id = 'c' + (clipN++).toString(36);
  clipDefs.push(`<clipPath id="${id}">${rects.map(([x, y, w, h]) => `<rect x="${n1(x)}" y="${n1(y)}" width="${n1(w)}" height="${n1(h)}"/>`).join('')}</clipPath>`);
  return id;
};
// A band of the frame [y0, y1) showing the content moved by (dx, dy): slice
// displacement when dy is 0, stutter when dy copies a strip from above.
function band(y0, y1, dx, { dy = 0, src = 'content', filter = null } = {}) {
  const id = clipOf([[0, y0, W, y1 - y0]]);
  const inner = `<rect class="bg" y="${y0}" width="${W}" height="${y1 - y0}"/><use href="#${src}" transform="translate(${dx} ${dy})"/>`;
  return filter ? `<g filter="url(#${filter})"><g clip-path="url(#${id})">${inner}</g></g>` : `<g clip-path="url(#${id})">${inner}</g>`;
}
// A cluster of 16-unit macroblocks around (cx, cy), snapped to the picture's grid.
function blockCluster(cx, cy, n, seed) {
  const r = mulberry32(seed);
  const B = 16;
  const gx = (v) => PX + Math.round((v - PX) / B) * B;
  const gy = (v) => PY + Math.round((v - PY) / B) * B;
  const cells = new Set();
  let x = gx(cx);
  let y = gy(cy);
  for (let i = 0; i < n * 3 && cells.size < n; i++) {
    cells.add(`${x},${y}`);
    const d = Math.floor(r() * 4);
    x += [B, -B, 0, 0][d];
    y += [0, 0, B, -B][d] * (r() < 0.5 ? 1 : 0);
  }
  return [...cells].map((k) => k.split(',').map(Number));
}
// macroblocks that repeat texture from elsewhere (a wrong motion vector)
function copyBlocks(cells, dx, dy, half = false) {
  const B = half ? 8 : 16;
  const id = clipOf(cells.map(([x, y]) => [x, y, B, B]));
  return `<g clip-path="url(#${id})"><use href="#content" transform="translate(${dx} ${dy})"/></g>`;
}
const flatBlocks = (cells, cols, seed, B = 16) => {
  const r = mulberry32(seed);
  return cells.map(([x, y]) => `<rect x="${x}" y="${y}" width="${B}" height="${B}" fill="${cols[Math.floor(r() * cols.length)]}"/>`).join('');
};
// colour-table corruption: the channels of a band swapped round
const perm = (id, y0, y1, matrix) => {
  filterDefs.push(`<filter id="${id}" filterUnits="userSpaceOnUse" x="0" y="${y0}" width="${W}" height="${y1 - y0}" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="${matrix}"/></filter>`);
  return id;
};
const BRG = '0 0 1 0 0  1 0 0 0 0  0 1 0 0 0  0 0 0 1 0'; // R<-B, G<-R, B<-G: sky turns hot pink
const GBR = '0 1 0 0 0  0 0 1 0 0  1 0 0 0 0  0 0 0 1 0'; // R<-G, G<-B, B<-R: sky turns acid green

// ------------------------------------------------------------------ pixel-sort streaks
// Columns of the frame, sorted by brightness from a threshold downwards: the bright
// run is dragged down into a smooth gradient that ends hard where the sorted interval
// ends. Adjacent columns get lengths from a random walk with the odd jump, so they
// form comb-like smears rather than drips. Each source is one path with one
// gradient in its own space; the bursts show it at 35%, 70% and 100%.
const SCW = 3; // column width
const sortGroups = [];
const walker = (lo, hi, stepv, jump) => {
  let L = rr(lo, hi);
  return () => {
    L = rand() < jump ? rr(lo, hi) : Math.max(lo, Math.min(hi, L + rr(-stepv, stepv)));
    return L;
  };
};
const col = (x, y, h) => `M${n1(x)} ${n1(y)}h${SCW}v${n1(h)}h-${SCW}z`;
{
  // the wordmark, sorted down through the dark ground into the sky
  let d = '';
  const len = walker(10, 170, 22, 0.12);
  const inner = walker(0.15, 0.85, 0.12, 0.1);
  for (let x = WMX; x < WMX + WM_W; x += SCW) {
    let bottom = -1;
    let top = -1;
    for (let y = WMY + CAP; y >= WMY; y -= 1) if (wmCovers(x + SCW / 2, y)) { bottom = y; break; }
    if (bottom < 0) continue;
    for (let y = bottom; y >= WMY; y -= 1) { if (!wmCovers(x + SCW / 2, y)) break; top = y; }
    const start = bottom - (bottom - top) * inner();
    d += col(x, start, bottom - start + len());
  }
  sortGroups.push({ id: 'sortW', pivot: WMY + CAP, fill: 'gSW', d });
}
{
  // cloud tops and the sun, sorted down through the sky and into the sea
  let d = '';
  const len = walker(16, 150, 16, 0.1);
  for (const cl of clouds) {
    if (cl.h < 20) continue;
    for (let x = cl.cx - cl.w / 2 + 4; x < cl.cx + cl.w / 2 - 4; x += SCW) {
      let top = Infinity;
      for (const [bx, by, br] of cl.all) {
        const dx = x + SCW / 2 - bx;
        if (Math.abs(dx) < br) top = Math.min(top, by - Math.sqrt(br * br - dx * dx));
      }
      if (!isFinite(top)) continue;
      d += col(PX + x, PY + top + 6, len());
    }
  }
  for (let x = SUN[0] - 13; x < SUN[0] + 12; x += SCW) d += col(PX + x, PY + SUN[1] - 10, rr(50, 150));
  sortGroups.push({ id: 'sortC', pivot: PY + HZ - 30, fill: 'gSC', d });
}
{
  // the sunlit sand, sorted down into the shallows
  let d = '';
  const len = walker(10, 70, 9, 0.1);
  for (let x = 440; x < 796; x += SCW) {
    const yTop = 250 + Math.abs(x - 610) ** 2 / 9000;
    const L = len();
    if (x > HER.x - 24 && x < HER.x + 20) continue; // she is not that bright
    d += col(PX + x, PY + yTop, L);
  }
  sortGroups.push({ id: 'sortS', pivot: PY + 262, fill: 'gSD', d });
}
const sortUse = (id, k) => {
  const g = sortGroups.find((s) => s.id === id);
  return `<use href="#${id}" transform="translate(0 ${n1(g.pivot * (1 - k))}) scale(1 ${k})"/>`;
};

// ------------------------------------------------------------------ the bursts
const bursts = [];
const state = (a, b, items) => bursts.push(`<g${during(a, b)}>${items.join('')}</g>`);
const pY = (y) => PY + y; // picture y to panel y

// 3.0 s: SLICES, channel split and stutter
state(3.0, 3.1, [
  band(70, 92, -18, { src: 'split6' }),
  band(128, 140, 34, { src: 'split6' }),
  band(160, 186, -10, { src: 'split6' }),
  band(pY(40), pY(52), 22),
  band(pY(300), pY(312), -40),
  `<rect y="${pY(140)}" width="${W}" height="4" fill="#000"/>`,
  copyBlocks(blockCluster(PX + 650, pY(60), 7, 3), 0, -32),
]);
state(3.1, 3.22, [
  band(54, 74, 26, { src: 'split12' }),
  band(92, 120, -32, { src: 'split12' }),
  band(120, 127, 48, { src: 'split12' }),
  band(150, 170, 14, { src: 'split12' }),
  band(206, 228, -6, { src: 'split12', dy: 56 }), // stutter: the strip 150-172, again
  band(228, 250, 10, { src: 'split12', dy: 78 }), // and again
  band(pY(74), pY(94), -28),
  band(pY(154), pY(190), 18),
  band(pY(274), pY(280), 60),
  copyBlocks(blockCluster(PX + 300, pY(30), 9, 4), 32, 16),
  `<rect y="${pY(244)}" width="${W}" height="6" fill="#000"/>`,
]);
state(3.22, 3.34, [
  band(100, 112, 8, { src: 'split4' }),
  band(180, 196, -5, { src: 'split4' }),
  band(pY(244), pY(264), -12),
]);
// 6.0 s: the hydrofoil appears on the bar line; a few blocks flicker where he enters
state(6.0, 6.08, [flatBlocks(blockCluster(PX + 24, pY(320), 6, 5), [C.vest, C.board, C.sea1, C.green], 51)]);
// 9.0 s: KEYFRAME, with a corrupt colour table for 300 ms
state(9.0, 9.1, [
  band(pY(150), pY(214), 0, { filter: perm('fBRG1', pY(150), pY(214), BRG) }),
  `<rect y="${pY(214)}" width="${W}" height="8" fill="${C.magenta}"/>`,
  flatBlocks(blockCluster(PX + 760, pY(260), 9, 6), [C.green, C.green, C.magenta, C.sea2], 61),
  band(pY(296), pY(306), 30),
]);
state(9.1, 9.22, [
  band(pY(0), pY(70), -8, { filter: perm('fGBR', pY(0), pY(70), GBR) }),
  band(pY(70), pY(86), 22, { filter: perm('fBRG2', pY(70), pY(86), BRG) }),
  `<rect y="${pY(118)}" width="${W}" height="5" fill="${C.cyan}"/>`,
  `<rect y="96" width="${W}" height="4" fill="${C.green}"/>`,
  flatBlocks(blockCluster(PX + 420, pY(180), 7, 7), [C.magenta, C.cyan, '#000'], 71),
]);
state(9.22, 9.3, [
  `<rect y="${pY(300)}" width="${W}" height="3" fill="${C.green}"/>`,
  copyBlocks(blockCluster(PX + 560, pY(140), 5, 8), -48, 0),
]);
// 12.0 s: PIXEL SORT, the streaks growing for 400 ms
const sortAll = (k) => sortGroups.map((g) => sortUse(g.id, k));
state(12.0, 12.12, sortAll(0.35));
state(12.12, 12.26, [...sortAll(0.7), band(pY(320), pY(336), 16)]);
state(12.26, 12.4, [band(96, 112, -6, { src: 'split4' }), ...sortAll(1), band(pY(100), pY(108), -24)]);

// ------------------------------------------------------------------ assemble
const splitWm = (d) => `<g style="isolation:isolate"><use href="#wm" fill="#ff0000" x="${-d}" class="sc1"/><use href="#wm" fill="#00ff00" class="sc1"/><use href="#wm" fill="#0000ff" x="${d}" class="sc1"/></g>`;
const ALT = 'CASTAWAY, glitched. A glitch-art banner for a lo-fi island video.';
const gradU = (id, y1, y2, stops) => `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="${y1}" x2="0" y2="${y2}">${stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('')}</linearGradient>`;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${ALT}">
<title>${ALT}</title>
<style>
.bg{fill:${C.ground}}
.sc1{mix-blend-mode:screen}
${css.join('\n')}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}
</style>
<defs>
<linearGradient id="gSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.sky0}"/><stop offset=".55" stop-color="${C.sky1}"/><stop offset=".86" stop-color="${C.sky2}"/><stop offset="1" stop-color="${C.sky3}"/></linearGradient>
<linearGradient id="gSea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.sea0}"/><stop offset=".3" stop-color="${C.sea1}"/><stop offset=".68" stop-color="${C.sea2}"/><stop offset="1" stop-color="${C.sea3}"/></linearGradient>
${gradU('gSW', WMY + 40, 440, [[0, '#fff'], [0.3, '#fff'], [0.48, '#dfe2ff'], [0.7, '#8b90c8'], [0.88, '#3d4272'], [1, '#14162c']])}
${gradU('gSC', PY + 20, PY + 260, [[0, '#fff'], [0.3, '#f2f8ff'], [0.52, C.sky2], [0.78, C.sea1], [1, '#0a3570']])}
${gradU('gSD', PY + 246, PY + 330, [[0, C.sandLit], [0.35, C.sand], [0.6, C.shallow2], [0.8, C.sea2], [1, '#0b3f86']])}
<clipPath id="panel"><rect width="${W}" height="${H}" rx="20"/></clipPath>
<clipPath id="picClip"><rect width="${PW}" height="${PH}"/></clipPath>
${clipDefs.join('\n')}
${filterDefs.join('\n')}
${glyphDefs.join('')}
${[...fontDefs.values()].join('')}
<g id="wm">${wmPlacements.map(({ ch, x }) => `<use href="#w${ch}" x="${x}" y="${WMY}"/>`).join('')}</g>
<g id="split4"><use href="#pic"/>${splitWm(4)}<use href="#txt"/></g>
<g id="split6"><use href="#pic"/>${splitWm(6)}<use href="#txt"/></g>
<g id="split12"><use href="#pic"/>${splitWm(12)}<use href="#txt"/></g>
${sortGroups.map((g) => `<path id="${g.id}" fill="url(#${g.fill})" d="${g.d}"/>`).join('\n')}
</defs>
<g clip-path="url(#panel)">
<rect class="bg" width="${W}" height="${H}"/>
<g id="content"><g id="pic"><g transform="translate(${PX} ${PY})"><g clip-path="url(#picClip)">${pic.join('\n')}</g></g></g><use href="#wm" fill="#fff"/><g id="txt">${txt.join('')}</g></g>
<g transform="translate(${PX} ${PY})"><g clip-path="url(#picClip)">${broLayer.join('')}</g></g>
${bursts.join('\n')}
</g>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="19.5" fill="none" stroke="${C.rim}"/>
</svg>
`;

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, svg);
console.log(`wrote ${OUT} (${(svg.length / 1024).toFixed(1)} KB)`);
