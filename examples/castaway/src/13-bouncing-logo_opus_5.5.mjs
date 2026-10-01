#!/usr/bin/env node
// Bouncing Idle Logo (catalogue entry idle-09): README header generator for CASTAWAY.
//
//   node examples/castaway/src/13-bouncing-logo_opus_5.5.mjs
//
// Writes examples/castaway/assets/13-bouncing-logo_opus_5.5.svg.
// Plain Node, no dependencies, no clock. The only randomness is the colour
// order, from a seeded PRNG (seed 1992, like the video), so every run writes
// the same bytes.
//
// The style: the idle screen of a disc player left alone, where a flat-colour
// logo drifts on black, bounces off the edges, changes colour at every bounce,
// and everybody waits for it to land exactly in a corner. Nothing here is the
// real disc logo or its letterforms: the wordmark is CASTAWAY, drawn below as
// a heavy oblique sans whose T is a palm tree, over a flat lozenge (the island)
// with LO-FI ISLAND knocked out of it in spaced capitals.
//
// The maths. Horizontal and vertical travel are two independent ping-pongs:
// 5 s per horizontal crossing, 4.5 s per vertical one. The bounces coincide
// (a corner hit) every 45 s, and the whole path repeats after 90 s, which is
// the loop. Because 5 and 4.5 differ by half a second, the corner approaches
// close in on each hit like a beat frequency: the misses before every hit are
// 1.5 s apart, then 1.0 s, then 0.5 s, then zero. The hits land at 0:16 (top
// right) and 1:01 (top left). The countdown in the chin is exact, because
// nothing here is random either.
//
// The joke is the project's own: while everybody watches the corner, a ship
// sails past along the bottom of the screen. Nobody sees it. Twice.
//
// Nothing is <text>: the wordmark is vector paths, the on-screen display is a
// 6 x 7 pixel face, plus the few lowercase letters the run command needs
// (copied in technique from the arcade header's generator,
// emboldened by smearing each pixel one step right), every glyph a <use>.
// Animation is CSS only. The logo moves at constant speed (linear keyframes at
// every bounce), colours and captions hard-cut (steps), the one soft white
// flash per hit peaks at 14% opacity, and prefers-reduced-motion parks the
// logo in the corner it was always heading for, with the ship going by.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '13-bouncing-logo_opus_5.5';
const OUT = path.resolve(HERE, `../assets/${SLUG}.svg`);

// ------------------------------------------------------------------ helpers
const f = (n, d = 2) => {
  const s = (+n).toFixed(d);
  return s.includes('.') ? s.replace(/0+$/, '').replace(/\.$/, '') : s;
};
const pct = (t) => `${f((t / LOOP) * 100, 4)}%`;
// every outline is wound the same way, so overlapping parts of one path
// add up under the nonzero rule instead of cancelling out
const area = (pts) => pts.reduce((a, p, i) => { const q = pts[(i + 1) % pts.length]; return a + p[0] * q[1] - q[0] * p[1]; }, 0);
const poly = (pts) => {
  const ps = area(pts) < 0 ? [...pts].reverse() : pts;
  return `M${ps.map((p) => `${f(p[0])} ${f(p[1])}`).join('L')}Z`;
};
function mulberry32(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const qpt = (p0, p1, p2, t) => [
  (1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0],
  (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1],
];

// ------------------------------------------------------------------ frame
const W = 960, HT = 604;
const SCR = { x: 16, y: 16, w: 928, h: 522 };   // 16:9, like the video
const LOOP = 90;                                // seconds
const HX = 5, VY = 4.5;                         // seconds per crossing
const T1 = 16, T2 = T1 + 45;                    // the two corner hits
const LW = 448;                                 // logo width on screen

// ------------------------------------------------------------------ palette
const PAL = {
  coral: '#ff6b57',   // her tank top
  sun: '#ffd23f',
  lagoon: '#21e0c8',
  palm: '#6ee05a',
  sea: '#4aa8ff',
  hibiscus: '#ff5fb0',
  sky: '#9b8cff',
};
const HIT = '#fff3d6';                          // sun-bleached, for a corner hit
const GOLD = '#ffd84a';

// =================================================================== WORDMARK
// Upright design units: cap height 100, baseline at y = 100. The word is then
// sheared 12 degrees (skewX(-12)) into a heavy oblique.
const SKEW = Math.tan((12 * Math.PI) / 180);

function ellPts(cx, cy, rx, ry, n = 72) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    out.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]);
  }
  return out;
}

function glyphC() {
  const cx = 42, cy = 50, R = [42, 50], r = [17, 27], cut = 19;
  const xo = cx + R[0] * Math.sqrt(1 - (cut / R[1]) ** 2);
  const xi = cx + r[0] * Math.sqrt(1 - (cut / r[1]) ** 2);
  const d = `M${f(xo)} ${cy - cut}A${R[0]} ${R[1]} 0 1 0 ${f(xo)} ${cy + cut}` +
    `L${f(xi)} ${cy + cut}A${r[0]} ${r[1]} 0 1 1 ${f(xi)} ${cy - cut}Z`;
  const pts = ellPts(cx, cy, R[0], R[1]).filter((p) => !(p[0] > xo - 0.01 && Math.abs(p[1] - cy) < cut));
  return { w: 84, parts: [{ k: 'f', d }], pts };
}

function glyphA() {
  // legs 24 wide, slope 0.32, flat apex 24 wide, crossbar 64..82
  const s = 0.32, lw = 24;
  const inL = (y) => lw + s * (100 - y), inR = (y) => 88 - lw - s * (100 - y);
  const outer = [[32, 0], [56, 0], [88, 100], [64, 100], [inR(82), 82], [inL(82), 82], [24, 100], [0, 100]];
  const ay = 100 - (88 - 2 * lw) / (2 * s);
  const hole = [[44, ay], [inR(64), 64], [inL(64), 64]];
  return { w: 88, parts: [{ k: 'f', d: poly(outer) + poly(hole), eo: true }], pts: outer };
}

function glyphS() {
  // a stroked spine: two stacked elliptical bowls, stroke 24
  const rx = 28, ry = 19, cx = 40, t = 24, a0 = (-35 * Math.PI) / 180, a1 = (145 * Math.PI) / 180;
  const p0 = [cx + rx * Math.cos(a0), 31 + ry * Math.sin(a0)];
  const p1 = [cx + rx * Math.cos(a1), 69 + ry * Math.sin(a1)];
  const d = `M${f(p0[0])} ${f(p0[1])}A${rx} ${ry} 0 1 0 ${cx} 50A${rx} ${ry} 0 1 1 ${f(p1[0])} ${f(p1[1])}`;
  const pts = [];
  for (const p of [...ellPts(cx, 31, rx, ry), ...ellPts(cx, 69, rx, ry)]) {
    pts.push([p[0] - t / 2, p[1]], [p[0] + t / 2, p[1]], [p[0], p[1] - t / 2], [p[0], p[1] + t / 2]);
  }
  return { w: 80, parts: [{ k: 's', d, sw: t }], pts: pts.filter((p) => p[1] >= 0 && p[1] <= 100) };
}

// A palm frond: an arched upper edge and a serrated lower edge.
function frond(B, P, up, dn, teeth, depth = 0.55, bias = 0.5) {
  const c = [P[0] - B[0], P[1] - B[1]];
  const L = Math.hypot(c[0], c[1]);
  let n = [-c[1] / L, c[0] / L];
  if (n[1] > 0) n = [-n[0], -n[1]];
  const mid = [(B[0] + P[0]) / 2, (B[1] + P[1]) / 2];
  const cu = [mid[0] + n[0] * up * L, mid[1] + n[1] * up * L];
  // the lower edge's control sits nearer the base, so the frond is fullest
  // close to the crown and tapers to the tip
  const cl = [B[0] + c[0] * bias + n[0] * dn * L, B[1] + c[1] * bias + n[1] * dn * L];
  const pts = [];
  const N = 14;
  for (let i = 0; i <= N; i++) pts.push(qpt(B, cu, P, i / N));
  const M = teeth * 2;
  for (let i = 1; i < M; i++) {
    const t = 1 - i / M;
    const lo = qpt(B, cl, P, t);
    if (i % 2 === 1) {
      const hi = qpt(B, cu, P, t);
      pts.push([lo[0] + (hi[0] - lo[0]) * depth, lo[1] + (hi[1] - lo[1]) * depth]);
    } else pts.push(lo);
  }
  return pts;
}

function glyphT(trunkEnd) {
  const parts = [], pts = [];
  const cx = 46;
  // trunk: a gently bent, tapering column that runs on below the baseline
  // into the island (the lozenge)
  const A = [cx, 12], Bc = [cx + 7, 58], C = [cx - 3, trunkEnd];
  const L = [], R = [], N = 24;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const p = qpt(A, Bc, C, t);
    const q = qpt(A, Bc, C, Math.min(1, t + 0.01));
    const p2 = qpt(A, Bc, C, Math.max(0, t - 0.01));
    const tx = q[0] - p2[0], ty = q[1] - p2[1], tl = Math.hypot(tx, ty);
    const hw = 11 + 3.5 * t;
    L.push([p[0] - (ty / tl) * hw * -1, p[1] - (tx / tl) * hw]);
    R.push([p[0] + (ty / tl) * hw * -1, p[1] + (tx / tl) * hw]);
  }
  const trunk = [...L, ...R.reverse()];
  parts.push({ k: 'f', d: poly(trunk) });
  // bark rings: thin black notches across the trunk
  const rings = [];
  for (const t of [0.34, 0.5, 0.66, 0.8]) {
    const p = qpt(A, Bc, C, t);
    const q = qpt(A, Bc, C, t + 0.01);
    const tx = q[0] - p[0], ty = q[1] - p[1], tl = Math.hypot(tx, ty);
    const hw = 11 + 3.5 * t + 1;
    const nx = -ty / tl, ny = tx / tl, ux = tx / tl, uy = ty / tl;
    const th = 1.8;
    const a = [p[0] - nx * hw, p[1] - ny * hw], b = [p[0] + nx * hw, p[1] + ny * hw];
    rings.push([[a[0] - ux * th, a[1] - uy * th], [b[0] - ux * th + ux * 2.4, b[1] - uy * th + uy * 2.4],
      [b[0] + ux * th + ux * 2.4, b[1] + uy * th + uy * 2.4], [a[0] + ux * th, a[1] + uy * th]]);
  }
  parts.push({ k: 'k', d: rings.map(poly).join('') });
  // the crown: two long fronds make the crossbar, two shorter ones droop below
  const fr = [
    frond([cx, 12], [-4, 30], 0.78, -0.05, 4, 0.3, 0.3),
    frond([cx, 12], [96, 30], 0.78, -0.05, 4, 0.3, 0.3),
    frond([cx - 2, 17], [10, 52], 0.55, -0.02, 3, 0.3, 0.3),
    frond([cx + 2, 17], [82, 52], 0.55, -0.02, 3, 0.3, 0.3),
  ];
  parts.push({ k: 'f', d: fr.map(poly).join('') });
  // the crown's heart and its coconuts
  const nuts = [[cx, 12, 7], [cx - 6, 21, 6], [cx + 5, 22, 6], [cx, 26, 5.5]];   // the heart of the crown, then three coconuts
  parts.push({ k: 'f', d: nuts.map(([x, y, r]) => `M${f(x - r)} ${f(y)}a${r} ${r} 0 1 0 ${f(2 * r)} 0a${r} ${r} 0 1 0 ${f(-2 * r)} 0Z`).join('') });
  for (const p of fr.flat()) pts.push(p);
  for (const p of trunk) if (p[1] <= 100) pts.push(p);
  return { w: 92, parts, pts, trunkFoot: C };
}

function glyphW() {
  const q = [
    [[0, 0], [24, 0], [46, 100], [22, 100]],
    [[22, 100], [46, 100], [72, 0], [48, 0]],
    [[48, 0], [72, 0], [98, 100], [74, 100]],
    [[74, 100], [98, 100], [120, 0], [96, 0]],
  ];
  return { w: 120, parts: [{ k: 'f', d: q.map(poly).join('') }], pts: q.flat() };
}

function glyphY() {
  const q = [
    [[0, 0], [25, 0], [57, 56], [33, 56]],
    [[65, 0], [90, 0], [57, 56], [33, 56]],
    [[33, 50], [57, 50], [57, 100], [33, 100]],
  ];
  return { w: 90, parts: [{ k: 'f', d: q.map(poly).join('') }], pts: q.flat() };
}

// ---- small knocked-out capitals for the lozenge (stroke font, cap 22)
const SMALL = {
  L: { w: 15, d: 'M0 0V22H15' },
  O: { w: 20, d: 'M10 0A10 11 0 1 1 10 22A10 11 0 1 1 10 0Z' },
  '-': { w: 13, d: 'M0 12.5H13' },
  F: { w: 15, d: 'M15 0H0V22M0 11H12' },
  I: { w: 0, d: 'M0 0V22' },
  S: { w: 16, d: 'M14.6 3.2A7 5.5 0 1 0 8 11A7 5.5 0 1 1 1.4 18.8' },
  A: { w: 20, d: 'M0 22L10 0L20 22M4.2 15H15.8' },
  N: { w: 18, d: 'M0 22V0L18 22V0' },
  D: { w: 18, d: 'M0 0H7A11 11 0 0 1 7 22H0Z' },
  ' ': { w: 14, d: '' },
};

function buildLogo() {
  const word = 'CASTAWAY';
  const KERN = { CA: -4, AS: -2, ST: 2, TA: -14, AW: -17, WA: -17, AY: -17 };
  const TRACK = 7;
  const LOZ_TOP = 113, LOZ_RY = 27;
  const trunkEnd = LOZ_TOP + 9;
  const make = { C: glyphC, A: glyphA, S: glyphS, T: () => glyphT(trunkEnd), W: glyphW, Y: glyphY };
  let x = 0;
  const placed = [];
  for (let i = 0; i < word.length; i++) {
    const ch = word[i];
    const g = make[ch]();
    if (i > 0) x += TRACK + (KERN[word[i - 1] + ch] || 0);
    placed.push({ ch, g, x });
    x += g.w;
  }
  const wordW = x;
  // word points, sheared
  const sk = (p) => [p[0] - SKEW * p[1], p[1]];
  let minX = Infinity, maxX = -Infinity;
  for (const { g, x: gx } of placed) for (const p of g.pts) {
    const q = sk([p[0] + gx, p[1]]);
    minX = Math.min(minX, q[0]); maxX = Math.max(maxX, q[0]);
  }
  // the lozenge sits under the sheared baseline, centred on the word
  const baseMid = (minX + maxX) / 2 - (SKEW * 100) / 2;
  const lozRX = (maxX - minX) * 0.43;
  const lozCX = baseMid, lozCY = LOZ_TOP + LOZ_RY;
  minX = Math.min(minX, lozCX - lozRX); maxX = Math.max(maxX, lozCX + lozRX);
  const minY = 0, maxY = LOZ_TOP + 2 * LOZ_RY;

  // the trunk must reach the island: check the foot against the ellipse top
  const T = placed.find((p) => p.ch === 'T');
  const foot = sk([T.g.trunkFoot[0] + T.x, T.g.trunkFoot[1]]);
  const dx = (foot[0] - lozCX) / lozRX;
  const topAtFoot = lozCY - LOZ_RY * Math.sqrt(Math.max(0, 1 - dx * dx));
  if (foot[1] < topAtFoot + 3) throw new Error(`trunk misses the island (${foot[1]} vs ${topAtFoot})`);

  // shapes
  const fill = [], strokes = [], knock = [];
  for (const { g, x: gx } of placed) {
    for (const p of g.parts) {
      const tr = gx ? ` transform="translate(${f(gx)} 0)"` : '';
      if (p.k === 'f') fill.push(`<path${tr}${p.eo ? ' fill-rule="evenodd"' : ''} d="${p.d}"/>`);
      if (p.k === 's') strokes.push(`<path${tr} stroke-width="${p.sw}" d="${p.d}"/>`);
      if (p.k === 'k') knock.push(`<path${tr} d="${p.d}"/>`);
    }
  }
  // spaced capitals in the lozenge
  const tag = 'LO-FI ISLAND';
  const SP = 11;
  let tw = 0;
  // an L is open on its right, so it pulls the next letter in a little
  const SK = { LO: -3, LA: -4 };
  const gap = (i) => (i ? SP + (SK[tag[i - 1] + tag[i]] || 0) : 0);
  for (let i = 0; i < tag.length; i++) tw += SMALL[tag[i]].w + gap(i);
  let tx = lozCX - tw / 2;
  const small = [];
  for (let i = 0; i < tag.length; i++) {
    const g = SMALL[tag[i]];
    tx += gap(i);
    if (g.d) small.push(`<path transform="translate(${f(tx)} ${f(lozCY - 11)})" d="${g.d}"/>`);
    tx += g.w;
  }
  const bw = maxX - minX, bh = maxY - minY;
  const s = LW / bw;
  const body =
    `<g transform="scale(${f(s, 5)}) translate(${f(-minX)} 0)">` +
    `<ellipse class="lf" cx="${f(lozCX)}" cy="${f(lozCY)}" rx="${f(lozRX)}" ry="${LOZ_RY}"/>` +
    `<g class="lk2">${small.join('')}</g>` +
    `<g transform="skewX(-12)"><g class="lf">${fill.join('')}</g><g class="ls">${strokes.join('')}</g>` +
    `<g class="lk">${knock.join('')}</g></g></g>`;
  return { body, w: LW, h: bh * s, scale: s, wordW, bw, bh };
}

// =================================================================== MOTION
const logo = buildLogo();
const LH = logo.h;
const TX = SCR.w - LW, TY = SCR.h - LH;          // travel
const mod = (a, n) => ((a % n) + n) % n;
const xAt = (t) => TX * Math.abs(1 - mod((t - T1) / HX, 2));
const yAt = (t) => TY * (1 - Math.abs(1 - mod((t - T1) / VY, 2)));

const xb = [], yb = [];
for (let k = -10; k < 30; k++) {
  const tx = T1 + k * HX, ty = T1 + k * VY;
  if (tx > 1e-9 && tx < LOOP - 1e-9) xb.push(tx);
  if (ty > 1e-9 && ty < LOOP - 1e-9) yb.push(ty);
}
const events = [...new Set([...xb, ...yb].map((t) => +t.toFixed(6)))].sort((a, b) => a - b);
const isHit = (t) => Math.abs(t - T1) < 1e-6 || Math.abs(t - T2) < 1e-6;

function motionKF(name, times, fn, axis, off) {
  const ks = [0, ...times, LOOP];
  return `@keyframes ${name}{${ks.map((t) => `${pct(t)}{transform:translate${axis}(${f(off + fn(t))}px)}`).join('')}}`;
}

// colours: one per segment between bounces, no colour twice in a row
function colourSequence() {
  const rnd = mulberry32(1992);
  const names = Object.keys(PAL);
  const n = events.length;
  const seq = new Array(n);
  // the segment that wraps round t = 0 is the first one a visitor sees: coral
  seq[n - 1] = PAL.coral;
  let prev = PAL.coral, prev2 = null;
  for (let i = 0; i < n - 1; i++) {
    if (isHit(events[i])) { seq[i] = HIT; prev2 = prev; prev = HIT; continue; }
    const banned = new Set([prev, prev2]);
    if (i === n - 2) banned.add(PAL.coral);
    const nextHit = i + 1 < n && isHit(events[i + 1]);
    let c;
    do { c = PAL[names[Math.floor(rnd() * names.length)]]; } while (banned.has(c) || (nextHit && c === HIT));
    seq[i] = c; prev2 = prev; prev = c;
  }
  return seq;
}
const colours = colourSequence();
const colourKF = `@keyframes lc{0%{fill:${colours[colours.length - 1]};stroke:${colours[colours.length - 1]}}` +
  events.map((t, i) => `${pct(t)}{fill:${colours[i]};stroke:${colours[i]}}`).join('') + '}';

// =================================================================== OSD FONT
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
  '!': '..#...|..#...|..#...|..#...|..#...|......|..#...', '?': '.####.|#....#|.....#|...##.|..#...|......|..#...',
  '(': '...#..|..#...|.#....|.#....|.#....|..#...|...#..', ')': '..#...|...#..|....#.|....#.|....#.|...#..|..#...',
  '·': '......|......|......|..#...|......|......|......', '>': '......|...#..|....#.|#####.|....#.|...#..|......',
  // lowercase, only what the run command needs, so `python tools/serve.py`
  // is spelt the way you type it. Rows 7 and 8 are descenders.
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
const ADV = 8;                                    // 7 wide after the smear, 1 gap
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
const gid = (ch) => `p${ch.codePointAt(0).toString(16)}`;
function osd(str, x, y, u, cls = '', anchor = 'start') {
  const w = (str.length * ADV - 1) * u;
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

// =================================================================== CHIN (OSD)
const U = 1.75;                                   // one font pixel
const L1Y = 550, L2Y = 572, LX = 46, RX = 934;
const css = [];
const chin = [];
const LINE1 = 'CASTAWAY · A 10-HOUR LO-FI ISLAND VIDEO';
chin.push(osd(LINE1, LX, L1Y, U, 'o1').svg);
const lab = osd('NEXT CORNER IN', RX, L1Y, U, 'o2', 'end');
chin.push(lab.svg);

// captions, hard cuts
const caps = [];
const FACTS = [
  ['SHE IDLES, NODDING ALONG. MOSTLY, THAT IS THE VIDEO.',
    'EVERY SO OFTEN SOMETHING HAPPENS. ALWAYS ON THE NEXT BAR.',
    'A BOTTLE WASHES BACK. A SHARK IN HEADPHONES NODS ALONG.'],
  ['EVERY SOUND IS SYNTHESIZED FROM CODE. NO SAMPLES.',
    'TEN HOURS, SEED 1992, ALWAYS DAYTIME.',
    'RUN IT: python tools/serve.py > http://127.0.0.1:8765/'],
];
const SHIPMSG = ['MEANWHILE, A SHIP SAILED PAST. NOBODY SAW THAT.',
  'THE SHIP CAME BACK. EVERYONE WAS WATCHING A CORNER.'];
[T1, T2].forEach((h, i) => {
  caps.push({ s: h - 16, e: h - 12.5, txt: 'NOT YET.', cls: 'o3' });
  caps.push({ s: h - 10.5, e: h - 7.5, txt: 'CLOSER...', cls: 'o3' });
  caps.push({ s: h - 5.5, e: h - 2.5, txt: 'SO CLOSE.', cls: 'o4' });
  caps.push({ s: h, e: h + 4, txt: 'CORNER! EVERYONE SAW IT.', cls: 'og', rm: i === 0 });
  caps.push({ s: h + 4, e: h + 10, txt: SHIPMSG[i], cls: 'o3' });
  const span = (h + 29 - (h + 10)) / 3;
  FACTS[i].forEach((txt, j) => caps.push({ s: h + 10 + j * span, e: h + 10 + (j + 1) * span, txt, cls: 'o2' }));
});
caps.forEach((c, i) => {
  const name = `c${i}`;
  let s = mod(c.s, LOOP), e = mod(c.e, LOOP);
  const o = osd(c.txt, LX, L2Y, U, `${c.cls} cap ${name}${c.rm ? ' rm' : ''}`);
  if (o.x0 + o.w > RX - 4 * ADV * U - 30) throw new Error(`caption too long: ${c.txt}`);
  chin.push(o.svg);
  const kf = [];
  if (s < e) {
    kf.push(`0%{opacity:0}`, `${pct(s)}{opacity:1}`, `${pct(e)}{opacity:0}`);
  } else {
    kf.push(`0%{opacity:1}`, `${pct(e)}{opacity:0}`, `${pct(s)}{opacity:1}`);
  }
  css.push(`@keyframes ${name}{${kf.join('')}}.${name}{animation:${name} ${LOOP}s steps(1,end) infinite}`);
});

// countdown: 0:SS, an odometer per digit
const value = (t) => {
  if ((t >= T1 && t < T1 + 2) || (t >= T2 && t < T2 + 2)) return 0;
  const next = t < T1 ? T1 : t < T2 ? T2 : T1 + LOOP;
  return Math.ceil(next - t - 1e-9);
};
const PITCH = 9;                                   // font pixels between strip glyphs
const cdW = (4 * ADV - 1) * U;
const cdX = RX - cdW;
let strips = '';
const digitKF = (name, digitOf) => {
  const kf = [];
  let last = null;
  for (let t = 0; t < LOOP; t++) {
    const d = digitOf(value(t));
    if (d !== last) { kf.push(`${pct(t)}{transform:translateY(${-d * PITCH}px)}`); last = d; }
  }
  css.push(`@keyframes ${name}{${kf.join('')}}.${name}{animation:${name} ${LOOP}s steps(1,end) infinite}`);
};
for (const [pos, name, n, fn] of [[2, 'dT', 5, (v) => Math.floor(v / 10)], [3, 'dO', 10, (v) => v % 10]]) {
  let uses = '';
  for (let d = 0; d < n; d++) { usedChars.add(String(d)); uses += `<use href="#${gid(String(d))}" x="${pos * ADV}" y="${d * PITCH}"/>`; }
  strips += `<g clip-path="url(#k${name})"><g class="${name}">${uses}</g></g>`;
  digitKF(name, fn);
}
const cdStatic = osd('0:', 0, 0, 1);
const countdown = `<g class="cd" transform="translate(${f(cdX)} ${f(L2Y)}) scale(${U})">` +
  cdStatic.svg.replace(/^<g transform="[^"]*">/, '').replace(/<\/g>$/, '') + strips + '</g>';
const cdClips = ['dT', 'dO'].map((n, i) => `<clipPath id="k${n}"><rect x="${(2 + i) * ADV}" y="0" width="7" height="7"/></clipPath>`).join('');
chin.push(countdown);
{
  const kf = [`0%{fill:#c9ced6}`];
  for (const h of [T1, T2]) kf.push(`${pct(h)}{fill:${GOLD}}`, `${pct(h + 2)}{fill:#c9ced6}`);
  css.push(`@keyframes cd{${kf.join('')}}.cd{fill:#c9ced6;animation:cd ${LOOP}s steps(1,end) infinite}`);
}
// the standby light nods along at 80 BPM (one beat = 0.75 s; 120 beats a loop)
chin.push(`<circle class="led" cx="31" cy="${f(L1Y + 3.5 * U)}" r="3.4" fill="${PAL.coral}"/>`);
css.push(`@keyframes led{0%{opacity:1}40%{opacity:.35}100%{opacity:1}}.led{animation:led .75s ease-out infinite}`);

// =================================================================== HIT EFFECTS
const corner = (t) => [SCR.x + (xAt(t) > TX / 2 ? SCR.w : 0), SCR.y + (yAt(t) > TY / 2 ? SCR.h : 0)];
let fx = '';
{
  const kf = ['0%{opacity:0}'];
  for (const h of [T1, T2]) kf.push(`${pct(h - 0.02)}{opacity:0}`, `${pct(h)}{opacity:.14}`, `${pct(h + 0.6)}{opacity:0}`);
  css.push(`@keyframes fl{${kf.join('')}100%{opacity:0}}.fl{opacity:0;animation:fl ${LOOP}s linear infinite}`);
  fx += `<rect class="fl" x="${SCR.x}" y="${SCR.y}" width="${SCR.w}" height="${SCR.h}" fill="#fff"/>`;
}
[T1, T2].forEach((h, i) => {
  const [cx, cy] = corner(h);
  let rings = '';
  for (let r = 0; r < 3; r++) {
    const name = `r${i}${r}`;
    const s = h + r * 0.22, e = s + 1.7;
    css.push(`@keyframes ${name}{0%{transform:scale(.02);opacity:0}${pct(s - 0.01)}{transform:scale(.02);opacity:0}` +
      `${pct(s)}{transform:scale(.02);opacity:.95}${pct(e)}{transform:scale(1);opacity:0}100%{transform:scale(1);opacity:0}}` +
      `.${name}{opacity:0;animation:${name} ${LOOP}s linear infinite}`);
    rings += `<circle class="rg ${name}" r="${260 - r * 50}"/>`;
  }
  fx += `<g transform="translate(${cx} ${cy})">${rings}</g>`;
});

// =================================================================== THE SHIP
// A small grey steamer with a coral funnel band, drawn facing right.
function ship() {
  return '<g class="shp">' +
    '<path class="sw" d="M-46 41h18M-34 37h10M-70 41h12M-58 44h16"/>' +
    '<path fill="#59606a" d="M-2 27H100L90 42H8Z"/>' +
    `<path fill="${PAL.coral}" d="M5 38.5H93L90.7 42H7.6Z"/>` +
    '<path fill="#8d949e" d="M18 17h52v10H18z"/>' +
    '<path fill="#a9afb8" d="M28 9h30v8H28z"/>' +
    '<path fill="#2a2e34" d="M22 20h4v3h-4zM30 20h4v3h-4zM38 20h4v3h-4zM46 20h4v3h-4zM54 20h4v3h-4zM62 20h4v3h-4zM33 11.5h20v3H33z"/>' +
    '<path fill="#cfd3d9" d="M62 1h10v16H62z"/>' +
    `<path fill="${PAL.coral}" d="M62 4h10v3.5H62z"/>` +
    '<path fill="#8d949e" d="M84 27l4-10h2l-3 10z"/>' +
    '<g class="smk"><circle cx="66" cy="-4" r="4"/><circle cx="58" cy="-10" r="5"/><circle cx="48" cy="-15" r="6"/></g>' +
    '</g>';
}
const SHIP_Y = SCR.y + SCR.h - 50;               // hull bottom 8 px above the screen edge
const ships = [];
const shipWin = (h) => [h - 3.6, h + 8];          // enters as the logo leaves the bottom edge
[T1, T2].forEach((h, i) => {
  const [s, e] = shipWin(h);
  const rightward = corner(h)[0] > SCR.x + SCR.w / 2;   // sail away from the corner's side
  const x0 = rightward ? SCR.x - 110 : SCR.x + SCR.w + 110;
  const x1 = rightward ? SCR.x + SCR.w + 80 : SCR.x - 80;
  const name = `sh${i}`;
  const at = (t) => x0 + ((x1 - x0) * (t - s)) / (e - s);
  // off-screen at both ends of its trip, so the clip hides it the rest of the time
  css.push(`@keyframes ${name}{0%{transform:translateX(${f(x0)}px)}` +
    `${pct(s)}{transform:translateX(${f(x0)}px)}${pct(e)}{transform:translateX(${f(x1)}px)}` +
    `100%{transform:translateX(${f(x1)}px)}}` +
    `.${name}{animation:${name} ${LOOP}s linear infinite}`);
  ships.push({ name, rightward, xHit: at(h) });
  // where is the logo meanwhile? (for the record: the ship goes behind it)
  let overlap = 0;
  for (let t = s; t <= e; t += 0.05) {
    const sx = at(t), lx = SCR.x + xAt(t), ly = SCR.y + yAt(t);
    const sl = rightward ? sx - 2 : sx - 100, sr = rightward ? sx + 100 : sx + 2;   // the hull, not the wake
    if (ly + LH > SHIP_Y - 16 && lx < sr && lx + LW > sl) overlap += 0.05;
  }
  console.log(`ship ${i}: ${rightward ? 'left to right' : 'right to left'}, behind the logo for ${overlap.toFixed(2)} s`);
});
const shipSVG = ships.map((s) => `<g class="${s.name}"><g transform="translate(0 ${SHIP_Y})${s.rightward ? '' : ' scale(-1 1)'}">${ship()}</g></g>`).join('');
css.push('@keyframes smk{0%{transform:translate(0,0);opacity:.9}100%{transform:translate(-14px,-8px);opacity:0}}' +
  '.smk{fill:#454a52;animation:smk 1.5s linear infinite}.sw{fill:none;stroke:#3b4048;stroke-width:2.2;stroke-linecap:round}');

// =================================================================== ASSEMBLE
const defs = [...usedChars].sort().map((ch) => `<path id="${gid(ch)}" d="${glyphPath(ch)}"/>`).join('\n');
const hitX = SCR.x + xAt(T1), hitY = SCR.y + yAt(T1);

const style = `
.lf{stroke:none}.ls{fill:none}.lk{fill:#000;stroke:none}.lk2{fill:none;stroke:#000;stroke-width:6.2;stroke-linejoin:round}
.o1{fill:#b9bec6}.o2{fill:#858b94}.o3{fill:#c9ced6}.o4{fill:#eef0f3}.og{fill:${GOLD}}
.cap{opacity:0}
.rg{fill:none;stroke:${HIT};stroke-width:3;vector-effect:non-scaling-stroke;transform-box:fill-box;transform-origin:50% 50%}
.mx{animation:mx ${LOOP}s linear infinite}.my{animation:my ${LOOP}s linear infinite}
.lc{fill:${PAL.coral};stroke:${PAL.coral};animation:lc ${LOOP}s steps(1,end) infinite}
${motionKF('mx', xb, xAt, 'X', SCR.x)}
${motionKF('my', yb, yAt, 'Y', SCR.y)}
${colourKF}
${css.join('\n')}
@media (prefers-reduced-motion:reduce){
*{animation:none!important}
.mx{transform:translateX(${f(hitX)}px)}.my{transform:translateY(${f(hitY)}px)}
.lc{fill:${HIT};stroke:${HIT}}.rm{opacity:1}.cd{fill:${GOLD}}.dT,.dO{transform:none}
.${ships[0].name}{transform:translateX(${f(ships[0].xHit)}px)}.${ships[1].name}{opacity:0}
}`;

const TITLE = 'CASTAWAY: the idle screen, waiting for the corner';
const DESC = 'A black 16:9 screen in a dark rounded bezel. The CASTAWAY wordmark, heavy oblique capitals whose T is a palm tree ' +
  'growing out of a flat oval island marked LO-FI ISLAND, drifts diagonally and bounces off the edges, changing colour at every ' +
  'bounce: coral, sun yellow, lagoon, palm green, sea blue, hibiscus, lilac. It hits a corner exactly every 45 seconds, top right ' +
  'at 0:16 and top left at 1:01, with a soft flash and ripples. The chin reads CASTAWAY, a 10-hour lo-fi island video, ' +
  'and counts down to the next corner. Captions say NOT YET, CLOSER, SO CLOSE, then CORNER! EVERYONE SAW IT. ' +
  'Meanwhile a small grey steamer sails along the bottom of the screen, and the next caption admits nobody saw that. ' +
  'Between corners the captions explain the project and end with how to run it: python tools/serve.py, then http://127.0.0.1:8765/.';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${HT}" width="${W}" height="${HT}" role="img" aria-labelledby="t d">
<title id="t">${TITLE}</title>
<desc id="d">${DESC}</desc>
<style>${style}</style>
<defs>
<linearGradient id="bz" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1e2024"/><stop offset=".55" stop-color="#121316"/><stop offset="1" stop-color="#0c0d0f"/></linearGradient>
<linearGradient id="gl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".055"/><stop offset=".38" stop-color="#fff" stop-opacity="0"/></linearGradient>
<clipPath id="scr"><rect x="${SCR.x}" y="${SCR.y}" width="${SCR.w}" height="${SCR.h}" rx="3"/></clipPath>
${cdClips}
${defs}
</defs>
<rect x=".75" y=".75" width="${W - 1.5}" height="${HT - 1.5}" rx="22" fill="url(#bz)" stroke="#353840" stroke-width="1.5"/>
<rect x="${SCR.x}" y="${SCR.y}" width="${SCR.w}" height="${SCR.h}" rx="3" fill="#000"/>
<g clip-path="url(#scr)">
${shipSVG}
<g class="mx"><g class="my"><g class="lc">${logo.body}</g></g></g>
${fx}
<rect x="${SCR.x}" y="${SCR.y}" width="${SCR.w}" height="${SCR.h}" fill="url(#gl)"/>
</g>
<rect x="${SCR.x - 0.5}" y="${SCR.y - 0.5}" width="${SCR.w + 1}" height="${SCR.h + 1}" rx="3.5" fill="none" stroke="#000" stroke-opacity=".9"/>
${chin.join('\n')}
</svg>
`;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, svg);
console.log(`logo ${LW} x ${f(LH)} (scale ${f(logo.scale, 4)}), travel ${TX} x ${f(TY)}, ` +
  `speed ${f(TX / HX)} / ${f(TY / VY)} px/s, ${events.length} bounces per ${LOOP} s loop`);
console.log(`wrote ${path.relative(process.cwd(), OUT)} (${(svg.length / 1024).toFixed(1)} KB)`);
