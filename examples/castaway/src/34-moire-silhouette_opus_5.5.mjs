// "Moire silhouette" README banner for CASTAWAY.
//
//   node examples/castaway/src/34-moire-silhouette_opus_5.5.mjs
//   node examples/castaway/src/34-moire-silhouette_opus_5.5.mjs --at=13.5 --out=some/where.svg
//
// Regenerates ../assets/34-moire-silhouette_opus_5.5.svg. Plain Node, no deps,
// deterministic (no clock, no Math.random). --at bakes a head start (seconds)
// into every animation delay so later frames can be checked without waiting;
// use it only together with --out, never in place.
//
// The style: the early-90s Amiga rave-demo look in which one big traced
// silhouette, arms spread wide, is cut out of a field of moire rings and
// recoloured, so the figure reads only by its change of colour (catalogue
// entry c64-11; the reference is Spaceballs' "State of the Art", 1992, which
// is credited, not copied: no dancer, name or frame of it is used here).
// For Castaway the dancer is the island's one tall palm, fronds spread like
// arms, and she sits small at its foot with her headphones on.
//
// How the SVG does it (the real mechanism, not a picture of it)
//   * Rings: one rect filled with a radialGradient, spreadMethod="repeat"
//     and hard stops, gives a whole field of concentric rings in a single
//     element. There are two ring centres, A and B, a few rings apart, both
//     behind the palm's crown, like a sun and its reflection.
//   * Moire: A is a luminance <mask>. B is drawn once everywhere, then again
//     inside the mask with its colours swapped, which composites to an XOR of
//     the two ring sets: crescents and swirls, with no blend modes or filters.
//   * Outside the figure the four (A,B) cases map to three colours (match-on,
//     match-off, mismatch). Inside, the same two ring sets map to two other
//     colours, clipped by the silhouette. No outline between them.
//   * Both centres drift on slow ellipses (two nested translate tracks each,
//     24 s round trip), so the moire crawls and loops with no seam.
//   * Every pose is a <path> inside one <clipPath>; each one has a stepped
//     visibility track, so poses hard-cut on the beat (80 BPM, 0.75 s), the
//     same way the project cuts its own frames. The two walkers (the crab,
//     then the coconut wearing it) also step along a stepped translate
//     track. The colour scheme cuts on every bar (3 s), well under three
//     changes a second.
//   * 24 s loop = 8 bars of the theme: the palm dances six bars, a coconut
//     drops on a hermit crab and walks off wearing it, then she stands and
//     waves for rescue and the palm does the same move, much larger.
//   * Lettering: a heavy pixel font defined below, merged into rect runs.
//   * prefers-reduced-motion freezes everything on frame 0, a complete frame.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const arg = (name) => {
  const hit = process.argv.slice(2).find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : null;
};
const T0 = Number(arg('at') || 0);
const OUT = arg('out') ? path.resolve(arg('out')) : path.resolve(here, '../assets/34-moire-silhouette_opus_5.5.svg');

// ------------------------------------------------------------------ frame
const W = 960;
const H = 540;
const STRIP = 466;          // top of the title strip (also the waterline)
const BEAT = 0.75;          // 80 BPM
const BAR = 4 * BEAT;       // 3 s
const BARS = 8;
const LOOP = BARS * BAR;    // 24 s
const SUB = 4;              // timeline resolution: quarter beats
const SLOTS = BARS * 4 * SUB;
const P = 44;               // ring period in px (22 px bands: broad, calm)

const n = (v, d = 1) => String(+(+v).toFixed(d));
const dly = (s) => `${n(s - T0, 3)}s`;

// ------------------------------------------------------------------ vectors
const v = (x, y) => ({ x, y });
const add = (a, b) => v(a.x + b.x, a.y + b.y);
const sub = (a, b) => v(a.x - b.x, a.y - b.y);
const mul = (a, k) => v(a.x * k, a.y * k);
const len = (a) => Math.hypot(a.x, a.y);
const unit = (a) => { const l = len(a) || 1; return v(a.x / l, a.y / l); };
const lerp = (a, b, t) => v(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);
const rad = (deg) => (deg * Math.PI) / 180;
const dir = (deg) => v(Math.cos(rad(deg)), -Math.sin(rad(deg))); // 0 = right, 90 = up
const rotAbout = (p, c, deg) => {
  const a = rad(deg); const d = sub(p, c);
  return v(c.x + d.x * Math.cos(a) - d.y * Math.sin(a), c.y + d.x * Math.sin(a) + d.y * Math.cos(a));
};
const quad = (p0, p1, p2, t) => add(add(mul(p0, (1 - t) ** 2), mul(p1, 2 * (1 - t) * t)), mul(p2, t * t));
const quadT = (p0, p1, p2, t) => unit(add(mul(sub(p1, p0), 2 * (1 - t)), mul(sub(p2, p1), 2 * t)));
const cubic = (p0, p1, p2, p3, t) => {
  const u = 1 - t;
  return add(add(mul(p0, u * u * u), mul(p1, 3 * u * u * t)), add(mul(p2, 3 * u * t * t), mul(p3, t * t * t)));
};
const cubicT = (p0, p1, p2, p3, t) => {
  const u = 1 - t;
  return unit(add(add(mul(sub(p1, p0), 3 * u * u), mul(sub(p2, p1), 6 * u * t)), mul(sub(p3, p2), 3 * t * t)));
};

// Polygons: arrays of points. Every subpath is forced to the same winding,
// so overlapping parts of one path union under the nonzero rule.
const area = (pts) => {
  let s = 0;
  for (let i = 0; i < pts.length; i++) { const a = pts[i]; const b = pts[(i + 1) % pts.length]; s += a.x * b.y - b.x * a.y; }
  return s / 2;
};
const orient = (pts) => (area(pts) < 0 ? pts.slice().reverse() : pts);
const sub1 = (pts) => {
  const p = orient(pts);
  let d = `M${n(p[0].x)} ${n(p[0].y)}`;
  let prev = p[0];
  for (let i = 1; i < p.length; i++) {
    const q = p[i];
    const dx = +n(q.x) - +n(prev.x);
    const dy = +n(q.y) - +n(prev.y);
    if (dx === 0 && dy === 0) continue;
    d += `l${n(dx)} ${n(dy)}`;
    prev = v(+n(q.x), +n(q.y));
  }
  return `${d}z`;
};
const pathOf = (polys) => polys.map(sub1).join('');
const ellipse = (c, rx, ry, k = 20, rot = 0) => {
  const out = [];
  for (let i = 0; i < k; i++) {
    const a = (i / k) * Math.PI * 2;
    out.push(rotAbout(v(c.x + Math.cos(a) * rx, c.y + Math.sin(a) * ry), c, rot));
  }
  return out;
};
const circle = (c, r, k) => ellipse(c, r, r, k || Math.max(12, Math.round(r * 2.2)));
// A tapered limb from a to b, widths wa -> wb, with round ends.
const limb = (a, b, wa, wb = wa) => {
  const t = unit(sub(b, a));
  const nn = v(-t.y, t.x);
  return [
    [add(a, mul(nn, wa / 2)), add(b, mul(nn, wb / 2)), sub(b, mul(nn, wb / 2)), sub(a, mul(nn, wa / 2))],
    circle(a, wa / 2, Math.max(6, Math.round(wa * 1.7))),
    circle(b, wb / 2, Math.max(6, Math.round(wb * 1.7))),
  ];
};
// A thick arc (for the headphone band): centre, radius, thickness, angles in degrees (screen, 0 = right, 90 = up).
const arcBand = (c, r, th, a0, a1, k = 14) => {
  const outer = []; const inner = [];
  for (let i = 0; i <= k; i++) {
    const a = a0 + ((a1 - a0) * i) / k;
    outer.push(add(c, mul(dir(a), r + th / 2)));
    inner.push(add(c, mul(dir(a), r - th / 2)));
  }
  return outer.concat(inner.reverse());
};

// ------------------------------------------------------------------ the island
// Height of the sand at x: a low dome from x 286 to 690, 436 at the top.
const sandY = (x) => {
  const t = (x - 286) / (690 - 286);
  if (t <= 0 || t >= 1) return STRIP + 2;
  return STRIP + 2 - (STRIP + 2 - 436) * Math.pow(Math.sin(Math.PI * t), 0.55);
};

// Low dome on the waterline, a few bushes, two rocks and the raft. Static.
function island() {
  const polys = [];
  const dome = [];
  const x0 = 286; const x1 = 690;
  for (let i = 0; i <= 40; i++) {
    const x = x0 + ((x1 - x0) * i) / 40;
    dome.push(v(x, sandY(x)));
  }
  dome.push(v(x1, STRIP + 8), v(x0, STRIP + 8));
  polys.push(dome);
  // bushes (round clumps on the left and at the palm's foot)
  for (const [x, y, r] of [[318, 452, 11], [334, 444, 13], [352, 446, 9], [572, 440, 12], [590, 445, 10], [604, 452, 8]]) {
    polys.push(circle(v(x, y), r, 16));
  }
  // a pointy leaf or two sticking out of the bushes
  polys.push([v(330, 438), v(322, 424), v(338, 434)]);
  polys.push([v(585, 434), v(596, 421), v(594, 438)]);
  // rocks at the shore
  polys.push(ellipse(v(300, STRIP - 3), 9, 6, 14));
  polys.push(ellipse(v(668, STRIP - 3), 7, 5, 12));
  // the raft, moored off the left shore: four logs, a short mast, a rag flag
  for (let i = 0; i < 4; i++) polys.push(...limb(v(196 + i * 2, STRIP - 6 + i * 0.5), v(272 - i * 2, STRIP - 6 + i * 0.5), 9, 9));
  polys.push([v(226, STRIP - 8), v(229, STRIP - 8), v(229, STRIP - 52), v(226, STRIP - 52)]);
  polys.push([v(226, STRIP - 51), v(203, STRIP - 45), v(209, STRIP - 41), v(201, STRIP - 35), v(226, STRIP - 33)]);
  return polys;
}

// ------------------------------------------------------------------ the palm
const BASE = v(530, 444);
const CROWN = v(470, 158);
// Fronds: angle (0 = right, 90 = up), length, droop (fraction of length the tip hangs).
const FRONDS = [
  { a: 194, L: 214, d: 0.36 },
  { a: 166, L: 266, d: 0.30 },
  { a: 138, L: 222, d: 0.20 },
  { a: 108, L: 150, d: 0.08 },
  { a: 76, L: 156, d: 0.08 },
  { a: 44, L: 226, d: 0.20 },
  { a: 14, L: 266, d: 0.30 },
  { a: -14, L: 214, d: 0.36 },
];

function frond(c, a, L, droop, seed) {
  // A midrib (tapered, curving down at the end) with a fringe of long,
  // narrow leaflets hanging from it, swept toward the tip: the classic
  // sunset-palm silhouette. A few short leaflets stand along the top.
  const d0 = dir(a);
  const p0 = c;
  const p1 = add(add(c, mul(d0, L * 0.52)), v(0, -L * 0.12));
  const p2 = add(add(c, mul(d0, L)), v(0, droop * L));
  const polys = [];
  // midrib as a strip
  const K = 14; const ribL = []; const ribR = [];
  for (let i = 0; i <= K; i++) {
    const s = i / K;
    const p = quad(p0, p1, p2, s);
    const t = quadT(p0, p1, p2, s);
    const nn = v(-t.y, t.x);
    const w = 7 - 5.2 * s;
    ribL.push(add(p, mul(nn, w / 2)));
    ribR.push(sub(p, mul(nn, w / 2)));
  }
  polys.push([...ribL, ...ribR.reverse()]);
  // leaflets
  const N = 16;
  for (let i = 0; i < N; i++) {
    const s = 0.16 + (0.8 * (i + 0.5)) / N;
    const p = quad(p0, p1, p2, s);
    const t = quadT(p0, p1, p2, s);
    let nUp = v(t.y, -t.x);
    let nDn = v(-t.y, t.x);
    if (nUp.y > nDn.y) [nUp, nDn] = [nDn, nUp];
    const prof = Math.pow(Math.sin(Math.PI * Math.min(1, (s - 0.08) / 0.95)), 0.6);
    const jit = 0.88 + 0.24 * (((seed * 5 + i * 7) % 9) / 8);
    const lenD = L * 0.29 * prof * jit + 4;
    const lenU = L * 0.12 * prof * jit + 2;
    const root = (L * 0.8) / N * 0.62; // half the root width along the rib
    const tA = quad(p0, p1, p2, Math.max(0, s - root / L));
    const tB = quad(p0, p1, p2, Math.min(1, s + root / L));
    // lower leaflet: hangs between the rib's normal and straight down, leaning to the tip
    const dD = unit(add(add(mul(nDn, 0.75), mul(t, 0.85)), v(0, 0.55)));
    const tipD = add(p, mul(dD, lenD));
    polys.push([tA, tB, add(tipD, mul(t, 1.2)), tipD]);
    // upper leaflet: short, almost along the rib, and only now and then, so
    // the top edge of each frond stays a clean arch rather than a hedgehog
    if (i % 4 === 2) {
      const dU = unit(add(mul(nUp, 0.55), mul(t, 1)));
      const tipU = add(p, mul(dU, lenU));
      polys.push([tA, tB, tipU]);
    }
  }
  return polys;
}

function trunk(crown) {
  const p0 = BASE;
  const p1 = v(BASE.x + 12, BASE.y - 110);
  const p2 = v(crown.x + 40, crown.y + 112);
  const p3 = crown;
  const segs = 19;
  const left = []; const right = [];
  for (let i = 0; i <= segs; i++) {
    for (const f of [0, 0.82]) {
      const t = Math.min(1, (i + f) / segs);
      if (i === segs && f > 0) continue;
      const p = cubic(p0, p1, p2, p3, t);
      const tg = cubicT(p0, p1, p2, p3, t);
      const nn = v(-tg.y, tg.x);
      const flare = t < 0.08 ? (0.08 - t) * 90 : 0;
      const w = 25 - 11 * t + flare + (f > 0 ? 2.2 : 0);
      left.push(add(p, mul(nn, w / 2)));
      right.push(sub(p, mul(nn, w / 2)));
    }
  }
  return [...left, ...right.reverse()];
}

// A pose: where the crown is, and how the fronds are turned.
function palmPose(kind) {
  let c = CROWN;
  let map = (f) => f;
  if (kind === 'L') { c = add(CROWN, v(-30, 6)); map = (f) => ({ ...f, a: f.a + 9 }); }
  if (kind === 'R') { c = add(CROWN, v(30, 6)); map = (f) => ({ ...f, a: f.a - 9 }); }
  if (kind === 'U') { c = add(CROWN, v(0, -4)); map = (f) => ({ ...f, a: 90 + (f.a - 90) * 0.8, d: f.d * 0.6, L: Math.abs(f.a - 90) < 30 ? f.L * 0.84 : f.L }); }
  if (kind === 'D') { c = add(CROWN, v(0, 10)); map = (f) => ({ ...f, a: 90 + (f.a - 90) * 1.14, d: f.d * 1.35 }); }
  if (kind === 'V1' || kind === 'V2') {
    // both arms up: the left four fronds gather up-left, the right four up-right
    const hi = kind === 'V1';
    c = add(CROWN, v(0, hi ? -2 : 4));
    const ang = hi ? [152, 140, 128, 116] : [170, 156, 142, 128];
    const lens = hi ? [236, 200, 160, 124] : [244, 216, 180, 140];
    map = (f, i) => {
      const j = i < 4 ? i : 7 - i;
      const a = i < 4 ? ang[j] : 180 - ang[j];
      return { ...f, a, L: lens[j], d: f.d * (hi ? 0.4 : 0.6) };
    };
  }
  const fr = FRONDS.map(map);
  return { c, fronds: fr };
}

function palmShape(kind) {
  const { c, fronds } = palmPose(kind);
  const polys = [trunk(c), circle(c, 13, 16)];
  fronds.forEach((f, i) => polys.push(...frond(c, f.a, f.L, f.d, i + 1)));
  // two coconuts that always stay
  polys.push(circle(add(c, v(-11, 14)), 9.5, 16), circle(add(c, v(9, 15)), 9.5, 16));
  return polys;
}
const nut3At = (kind) => add(palmPose(kind).c, v(-1, 25));

// ------------------------------------------------------------------ her
// Small, simple, front-facing. Cream headphones read as two cups and a band
// standing off the head. Seat point (x, y) is where she sits on the sand.
const HER = v(380, Math.round(sandY(380) + 3));
const HER_K = 1.3; // drawn at unit size, then scaled about the seat point
const scaled = (polys, o, k) => polys.map((pl) => pl.map((p) => add(o, mul(sub(p, o), k))));
function headphonesHead(h, r) {
  return [
    circle(h, r, 22),
    ellipse(add(h, v(-r - 0.5, 1)), 3.6, 5.2, 14),
    ellipse(add(h, v(r + 0.5, 1)), 3.6, 5.2, 14),
    arcBand(h, r + 2.8, 2.4, 172, 8, 16),
  ];
}
function herSit(nod) {
  const o = HER;
  const P = (x, y) => add(o, v(x, y));
  const polys = [];
  // crossed legs: a wide low shape with knees out and feet tucked
  polys.push([P(-25, -2), P(-24, -9), P(-15, -15), P(-6, -16), P(6, -16), P(15, -15), P(24, -9), P(25, -2), P(14, 1), P(-14, 1)]);
  polys.push(ellipse(P(-6, -3), 7, 3.2, 12), ellipse(P(6, -3), 7, 3.2, 12));
  // torso, narrowing at the waist (tank top shoulders)
  polys.push([P(-9.5, -14), P(9.5, -14), P(7.5, -24), P(10, -36), P(6, -39), P(-6, -39), P(-10, -36), P(-7.5, -24)]);
  // arms resting on the knees
  polys.push(...limb(P(-9, -35), P(-15, -24), 4.6, 4.2), ...limb(P(-15, -24), P(-20, -14), 4.2, 3.8));
  polys.push(...limb(P(9, -35), P(15, -24), 4.6, 4.2), ...limb(P(15, -24), P(20, -14), 4.2, 3.8));
  // neck, head (nodding), low bun
  const h = P(nod ? 0.5 : 0, nod ? -46 : -49);
  polys.push([P(-2.6, -42), P(2.6, -42), P(2.6, -37), P(-2.6, -37)]);
  polys.push(circle(add(h, v(6.5, 6.5)), 3.6, 12));
  polys.push(...headphonesHead(h, 8));
  return scaled(polys, o, HER_K);
}
function herWave(high) {
  const o = HER;
  const P = (x, y) => add(o, v(x, y));
  const polys = [];
  // legs (shorts to mid-thigh are just legs, in silhouette) and feet
  polys.push(...limb(P(-5, -48), P(-6, -26), 7.5, 6), ...limb(P(-6, -26), P(-6, -4), 6, 4.4));
  polys.push(...limb(P(5, -48), P(6, -26), 7.5, 6), ...limb(P(6, -26), P(6, -4), 6, 4.4));
  polys.push(ellipse(P(-8, -2), 5.2, 2.6, 12), ellipse(P(8, -2), 5.2, 2.6, 12));
  // shorts: a little wider than the legs at the hem, with an inseam notch
  polys.push([P(-9.5, -58), P(9.5, -58), P(11.6, -41), P(1.6, -41), P(0, -45), P(-1.6, -41), P(-11.6, -41)]);
  // torso (tank top): waist in, shoulders a touch wider
  polys.push([P(-9.5, -56), P(9.5, -56), P(8, -64), P(10, -76), P(6, -79), P(-6, -79), P(-10, -76), P(-8, -64)]);
  // arms up: a V, waving for rescue
  const hand = high ? 31 : 38;
  const hy = high ? -112 : -103;
  polys.push(...limb(P(-8, -75), P(-19, hy + 18), 4.8, 4.2), ...limb(P(-19, hy + 18), P(-hand + 2, hy), 4.2, 3.8));
  polys.push(...limb(P(8, -75), P(19, hy + 18), 4.8, 4.2), ...limb(P(19, hy + 18), P(hand - 2, hy), 4.2, 3.8));
  polys.push(circle(P(-hand + 2, hy - 2), 3.6, 10), circle(P(hand - 2, hy - 2), 3.6, 10));
  const h = P(0, -89);
  polys.push([P(-2.6, -82), P(2.6, -82), P(2.6, -77), P(-2.6, -77)]);
  polys.push(circle(add(h, v(6.5, 6.5)), 3.6, 12));
  polys.push(...headphonesHead(h, 8));
  return scaled(polys, o, HER_K);
}

// ------------------------------------------------------------------ the crab and the coconut
const CRAB = v(462, Math.round(sandY(462) + 1));
const CRAB_K = 1.45; // crab and coconut drawn small, then scaled about their feet
function legs(c, phase, span = 1) {
  const polys = [];
  for (const side of [-1, 1]) {
    for (let k = 0; k < 3; k++) {
      const up = (k + phase) % 2 === 0 ? 0 : 2;
      const root = add(c, v(side * (3 + k * 2.4) * span, -3));
      const knee = add(c, v(side * (8 + k * 3) * span, -7 - up));
      const foot = add(c, v(side * (10 + k * 3.2) * span, 1 - up * 0.5));
      polys.push(...limb(root, knee, 1.8, 1.6), ...limb(knee, foot, 1.6, 1.3));
    }
  }
  return polys;
}
function claws(c, span = 1, lift = 0) {
  const polys = [];
  for (const side of [-1, 1]) {
    const arm0 = add(c, v(side * 6 * span, -6));
    const arm1 = add(c, v(side * 12 * span, -12 - lift));
    polys.push(...limb(arm0, arm1, 2.4, 2.2));
    polys.push(ellipse(add(arm1, v(side * 2.5, -2)), 3.6, 2.6, 12, side * -30));
  }
  return polys;
}
function crab(phase, x = CRAB.x, y = CRAB.y) {
  const c = v(x, y);
  // a small whorled shell on top of a little body
  return scaled([
    ellipse(add(c, v(0, -4.5)), 6.5, 3.8, 14),
    circle(add(c, v(-1, -10)), 5, 14),
    [add(c, v(1, -15)), add(c, v(6.5, -10)), add(c, v(3, -6))],
    ...legs(c, phase),
    ...claws(c),
    circle(add(c, v(-3, -9)), 1.2, 6), circle(add(c, v(3, -9)), 1.2, 6),
  ], c, CRAB_K);
}
// The coconut, with the crab underneath it.
function cocoCrab(phase, x, y) {
  const c = v(x, y);
  return scaled([
    circle(add(c, v(0, -8.2)), 9.5 / CRAB_K, 20),
    ...legs(c, phase, 1.2),
    ...claws(c, 1.3, phase % 2 ? 2 : 0),
  ], c, CRAB_K);
}
// "bonk": three short dashes over the impact
function bonk(c) {
  return [
    ...limb(add(c, v(-15, -30)), add(c, v(-22, -36)), 2.6, 2.6),
    ...limb(add(c, v(0, -34)), add(c, v(0, -43)), 2.6, 2.6),
    ...limb(add(c, v(15, -30)), add(c, v(22, -36)), 2.6, 2.6),
  ];
}

// ------------------------------------------------------------------ timeline
// For each quarter-beat slot of the 24 s loop: which shapes are visible, and
// (for the two walkers) how far each one is shifted from where it was drawn.
const shapes = new Map(); // key -> { polys, slots: Map(slot -> [dx, dy]) }
function show(key, slot, make, off = [0, 0]) {
  if (!shapes.has(key)) shapes.set(key, { polys: make(), slots: new Map() });
  shapes.get(key).slots.set(slot, off.map((x) => +n(x)));
}
const DANCE = ['L', 'U', 'R', 'D'];
const FALL = 8;        // beat the coconut drops (bar 3)
const WALK_FROM = 12;  // beat the coconut starts walking
const WALK_TO = 23;    // beat it has gone into the sea

for (let s = 0; s < SLOTS; s++) {
  const beat = Math.floor(s / SUB);
  const q = s % SUB;           // quarter within the beat
  const half = beat * 2 + (q >= 2 ? 1 : 0);
  const bar = Math.floor(beat / 4);
  const waving = bar >= 6;
  // the palm dances on the beat; in the last two bars it waves too
  const pose = waving ? (beat % 2 === 0 ? 'V1' : 'V2') : DANCE[beat % 4];
  show(`palm-${pose}`, s, () => palmShape(pose));
  if (beat < FALL) show(`nut3-${pose}`, s, () => [circle(nut3At(pose), 9.5, 16)]);
  // her: a nod on every beat, then up on her feet waving for rescue
  if (waving) show(`wave-${beat % 2 === 0 ? 'hi' : 'lo'}`, s, () => herWave(beat % 2 === 0));
  else show(`sit-${q < 2 ? 'nod' : 'up'}`, s, () => herSit(q < 2));
  // the hermit crab shuffles in, a half step each half beat, right under the coconuts
  if (beat < FALL) {
    show(`crab-${half % 2}`, s, () => crab(half % 2), [(half - 2 * FALL) * 1.5, sandY(CRAB.x + (half - 2 * FALL) * 1.5) + 1 - CRAB.y]);
  } else if (beat === FALL && q < 2) {
    show('crab-0', s, () => crab(0));
    // the drop: two quarter-beat frames in the air (gravity, t^2), then impact
    const p = lerp(nut3At(DANCE[FALL % 4]), v(CRAB.x, CRAB.y - 12), ((q + 1) / 3) ** 2);
    show(`fall-${q}`, s, () => [circle(p, 9.5, 16)]);
  } else if (beat < WALK_FROM) {
    show('cc-0', s, () => cocoCrab(0, CRAB.x, CRAB.y));
    if (beat < FALL + 2) show('bonk', s, () => bonk(v(CRAB.x, CRAB.y - 13)));
  } else if (beat < WALK_TO) {
    // and off it goes wearing it: right, round the palm's foot, down the beach, into the sea
    const k = half - WALK_FROM * 2;
    const x = CRAB.x + 10 + k * 12;
    const y = x < 690 ? sandY(x) + 1 : STRIP + 2 + (x - 690) * 0.9;
    show(`cc-${k % 2}`, s, () => cocoCrab(k % 2, CRAB.x, CRAB.y), [x - CRAB.x, y - CRAB.y]);
  }
}

// ------------------------------------------------------------------ colour schemes (one per bar)
// [mismatch, both-on, both-off] outside; [f0, f1] inside; strip ink.
const SCHEMES = [
  { name: 'sun', out: ['#16b04c', '#d61c52', '#4a24c4'], fig: ['#ffe41a', '#ff6614'], ink: '#ffe41a', sub: '#ff6614' },
  { name: 'sea', out: ['#ff7a12', '#ee1f8a', '#2a2aa8'], fig: ['#3cf2ff', '#d6fff6'], ink: '#3cf2ff', sub: '#ff7a12' },
  { name: 'coral', out: ['#00a48f', '#2b1c8a', '#a8127a'], fig: ['#ff6b5a', '#ffe7b8'], ink: '#ff6b5a', sub: '#ffe7b8' },
  { name: 'palm', out: ['#ff2d92', '#6a1ed4', '#1c1670'], fig: ['#b8ff22', '#16c23c'], ink: '#b8ff22', sub: '#ff2d92' },
];

// ------------------------------------------------------------------ pixel font (heavy capitals, 7 x 9)
const FONT = {
  A: ['..###..', '.#####.', '##...##', '##...##', '#######', '#######', '##...##', '##...##', '##...##'],
  B: ['######.', '#######', '##...##', '######.', '######.', '##...##', '##...##', '#######', '######.'],
  C: ['.######', '#######', '##.....', '##.....', '##.....', '##.....', '##.....', '#######', '.######'],
  D: ['######.', '#######', '##...##', '##...##', '##...##', '##...##', '##...##', '#######', '######.'],
  E: ['#######', '#######', '##.....', '######.', '######.', '##.....', '##.....', '#######', '#######'],
  H: ['##...##', '##...##', '##...##', '#######', '#######', '##...##', '##...##', '##...##', '##...##'],
  L: ['##.....', '##.....', '##.....', '##.....', '##.....', '##.....', '##.....', '#######', '#######'],
  M: ['##...##', '###.###', '#######', '##.#.##', '##.#.##', '##...##', '##...##', '##...##', '##...##'],
  O: ['.#####.', '#######', '##...##', '##...##', '##...##', '##...##', '##...##', '#######', '.#####.'],
  P: ['######.', '#######', '##...##', '##...##', '#######', '######.', '##.....', '##.....', '##.....'],
  R: ['######.', '#######', '##...##', '##...##', '######.', '######.', '##..##.', '##...##', '##...##'],
  S: ['.######', '#######', '##.....', '######.', '.######', '.....##', '.....##', '#######', '######.'],
  T: ['#######', '#######', '..###..', '..###..', '..###..', '..###..', '..###..', '..###..', '..###..'],
  U: ['##...##', '##...##', '##...##', '##...##', '##...##', '##...##', '##...##', '#######', '.#####.'],
  W: ['##...##', '##...##', '##...##', '##.#.##', '##.#.##', '#######', '#######', '###.###', '##...##'],
  Y: ['##...##', '##...##', '##...##', '#######', '.#####.', '..###..', '..###..', '..###..', '..###..'],
  0: ['.#####.', '#######', '##..###', '##.####', '####.##', '###..##', '##...##', '#######', '.#####.'],
  1: ['..###..', '.####..', '#####..', '..###..', '..###..', '..###..', '..###..', '#######', '#######'],
  8: ['.#####.', '#######', '##...##', '#######', '.#####.', '##...##', '##...##', '#######', '.#####.'],
  ':': ['..', '..', '##', '##', '..', '..', '##', '##', '..'],
  ' ': ['....', '....', '....', '....', '....', '....', '....', '....', '....'],
};
// Merge a string's pixels into rect runs (horizontal runs, stacked vertically when identical).
function textPath(str, x0, y0, u, gap = 1) {
  const px = [];
  let cx = 0;
  for (const ch of str) {
    const g = FONT[ch];
    if (!g) throw new Error(`no glyph ${ch}`);
    g.forEach((row, y) => [...row].forEach((c, x) => { if (c === '#') px.push([cx + x, y]); }));
    cx += g[0].length + gap;
  }
  const width = cx - gap;
  const rows = new Map();
  for (const [x, y] of px) { if (!rows.has(y)) rows.set(y, []); rows.get(y).push(x); }
  const runs = [];
  for (const [y, xs] of rows) {
    xs.sort((a, b) => a - b);
    let s = xs[0]; let p = xs[0];
    for (let i = 1; i <= xs.length; i++) {
      if (i < xs.length && xs[i] === p + 1) { p = xs[i]; continue; }
      runs.push([s, p + 1, y]);
      if (i < xs.length) { s = xs[i]; p = xs[i]; }
    }
  }
  const live = new Set(runs.map((r) => r.join(',')));
  let d = '';
  for (const r of runs.sort((a, b) => a[2] - b[2] || a[0] - b[0])) {
    if (!live.has(r.join(','))) continue;
    live.delete(r.join(','));
    let h = 1;
    while (live.has(`${r[0]},${r[1]},${r[2] + h}`)) { live.delete(`${r[0]},${r[1]},${r[2] + h}`); h++; }
    d += `M${n(x0 + r[0] * u)} ${n(y0 + r[2] * u)}h${n((r[1] - r[0]) * u)}v${n(h * u)}h${n(-(r[1] - r[0]) * u)}z`;
  }
  return { d, width: width * u };
}
const textWidth = (str, u, gap = 1) => {
  let w = 0; for (const ch of str) w += FONT[ch][0].length + gap;
  return (w - gap) * u;
};

// ------------------------------------------------------------------ assemble
const css = [];
const defs = [];
const pct = (slot) => `${n((slot / SLOTS) * 100, 4)}%`;

// Visibility (and, for walkers, position) tracks: one stepped @keyframes per shape.
const figure = [];
let ki = 0;
for (const [, sh] of shapes) {
  const at = (s) => sh.slots.get(s);
  const moves = [...sh.slots.values()].some(([dx, dy]) => dx || dy);
  const name = `k${ki++}`;
  const frames = [];
  let last = null;
  let lastOff = sh.slots.get(0) || [...sh.slots.values()][0];
  for (let s = 0; s < SLOTS; s++) {
    const off = at(s) || lastOff;
    const state = `${at(s) ? 'visible' : 'hidden'}${moves ? `;transform:translate(${off[0]}px,${off[1]}px)` : ''}`;
    if (state !== last) frames.push(`${pct(s)}{visibility:${state}}`);
    last = state;
    lastOff = off;
  }
  const always = sh.slots.size === SLOTS && !moves;
  if (!always) css.push(`@keyframes ${name}{${frames.join('')}}`, `.${name}{animation:${name} ${LOOP}s step-end ${dly(0)} infinite}`);
  const o0 = sh.slots.get(0);
  const attrs = (always ? '' : ` class="${name}"`) + (o0 ? '' : ' visibility="hidden"') + (moves && o0 && (o0[0] || o0[1]) ? ` transform="translate(${o0[0]} ${o0[1]})"` : '');
  figure.push(`<path${attrs} d="${pathOf(sh.polys)}"/>`);
}
figure.unshift(`<path d="${pathOf(island())}"/>`);

// Colour tracks: stops and fills cut on every bar.
const colourTrack = (prop, pick, name) => {
  const frames = [];
  for (let b = 0; b < BARS; b++) frames.push(`${n((b / BARS) * 100, 3)}%{${prop}:${pick(SCHEMES[b % SCHEMES.length])}}`);
  css.push(`@keyframes ${name}{${frames.join('')}}`, `.${name}{animation:${name} ${LOOP}s step-end ${dly(0)} infinite}`);
};
colourTrack('stop-color', (s) => s.out[0], 'om');
colourTrack('stop-color', (s) => s.out[1], 'o1');
colourTrack('stop-color', (s) => s.out[2], 'o0');
colourTrack('stop-color', (s) => s.fig[0], 'f0');
colourTrack('stop-color', (s) => s.fig[1], 'f1');
colourTrack('fill', (s) => s.ink, 'ink');
colourTrack('fill', (s) => s.sub, 'sb');
const S0 = SCHEMES[0];

// Ring gradients: half period on, half off. `on`/`off` are [class, colour].
const ringGrad = (id, on, off) => {
  const st = (o, [cls, col]) => `<stop offset="${o}"${cls ? ` class="${cls}"` : ''} stop-color="${col}"/>`;
  return `<radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="${P}" spreadMethod="repeat">${st(0, on)}${st(0.5, on)}${st(0.5, off)}${st(1, off)}</radialGradient>`;
};
defs.push(
  ringGrad('gA', [null, '#fff'], [null, '#000']),
  ringGrad('gO1', ['om', S0.out[0]], ['o0', S0.out[2]]),
  ringGrad('gO2', ['o1', S0.out[1]], ['om', S0.out[0]]),
  ringGrad('gI1', ['f0', S0.fig[0]], ['f1', S0.fig[1]]),
  ringGrad('gI2', ['f1', S0.fig[1]], ['f0', S0.fig[0]]),
);

// Drift: each centre rides two nested translate tracks (x and y), each
// ease-in-out and alternating, a quarter period apart: a smooth ellipse.
const A = v(404, 214);  // centre A: the sun, behind the crown
const B = v(548, 268);  // centre B: its reflection, a few rings away
// dx/dy may be negative (that track runs the other way); phase is in
// seconds of head start on the x track (the y track is a quarter behind).
const drift = (cls, dx, dy, phase) => {
  css.push(
    `@keyframes ${cls}x{from{transform:translate(${-dx}px,0)}to{transform:translate(${dx}px,0)}}`,
    `@keyframes ${cls}y{from{transform:translate(0,${-dy}px)}to{transform:translate(0,${dy}px)}}`,
    `.${cls}x{animation:${cls}x ${LOOP / 2}s ease-in-out ${dly(-phase - LOOP / 4)} infinite alternate}`,
    `.${cls}y{animation:${cls}y ${LOOP / 2}s ease-in-out ${dly(-phase)} infinite alternate}`,
  );
};
drift('a', 64, 44, 0);
drift('b', -58, 36, LOOP / 4);
const field = (grad, c, cls) => `<g class="${cls}x"><g class="${cls}y"><rect x="${-c.x - 120}" y="${-c.y - 120}" width="${W + 240}" height="${H + 240}" transform="translate(${c.x} ${c.y})" fill="url(#${grad})"/></g></g>`;
defs.push(`<mask id="mA" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}">${field('gA', A, 'a')}</mask>`);
defs.push(`<clipPath id="fig">${figure.join('')}</clipPath>`);
defs.push(`<clipPath id="panel"><rect width="${W}" height="${H}" rx="16"/></clipPath>`);

// The strip: plain heavy capitals, flat colour.
const U = 6;
const title = 'CASTAWAY';
const tw = textWidth(title, U, 1.5);
const tTitle = textPath(title, (W - tw) / 2, STRIP + 14, U, 1.5);
const u2 = 2.6;
const leftLab = textPath('10:00:00', 30, STRIP + 26, u2, 1);
const rightStr = '80 BPM';
const rightLab = textPath(rightStr, W - 30 - textWidth(rightStr, u2, 1), STRIP + 26, u2, 1);

css.push('@media (prefers-reduced-motion: reduce){*{animation:none!important}}');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="t d">
<title id="t">CASTAWAY</title>
<desc id="d">An island with one tall dancing palm and a small woman in headphones, cut out of crawling moire rings in clashing colours; a coconut drops on a hermit crab, which walks off wearing it, then she waves for rescue and the palm does too. CASTAWAY in heavy capitals on a dark band below.</desc>
<style>${css.join('\n')}</style>
<defs>${defs.join('\n')}</defs>
<g clip-path="url(#panel)">
<rect width="${W}" height="${H}" fill="#0f0a1c"/>
${field('gO1', B, 'b')}
<g mask="url(#mA)">${field('gO2', B, 'b')}</g>
<g clip-path="url(#fig)">${field('gI1', B, 'b')}<g mask="url(#mA)">${field('gI2', B, 'b')}</g></g>
<rect y="${STRIP}" width="${W}" height="${H - STRIP}" fill="#0f0a1c"/>
<path class="ink" fill="${S0.ink}" d="${tTitle.d}"/>
<path class="sb" fill="${S0.sub}" d="${leftLab.d}${rightLab.d}"/>
</g>
</svg>
`;
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, svg);
console.log(`wrote ${path.relative(process.cwd(), OUT)} (${(svg.length / 1024).toFixed(1)} KB, ${shapes.size} shapes)`);
