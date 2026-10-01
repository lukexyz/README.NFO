#!/usr/bin/env node
// CASTAWAY as a feedback-fire music visualiser: the look of the first PC
// visualisers of 1993 to 1998 (the DOS one and the Winamp plug-in that
// worked by feedback: draw the waveform into the picture, then replace the
// picture with a warped, slightly dimmed copy of itself, over and over).
// One sharp oscilloscope line; behind it, its own history dragged outward,
// turned, blurred and coloured through a fire palette, so fading reads as
// cooling. Here the line has an island in it.
//
//   node examples/castaway/src/96-feedback-fire_opus_5.5.mjs
//   node examples/castaway/src/96-feedback-fire_opus_5.5.mjs --at=7.5 --out=some/where.svg
//
// Regenerates ../assets/96-feedback-fire_opus_5.5.svg (the banner) and
// ../assets/96-feedback-fire_opus_5.5-setup.svg (the four palettes and the
// eight flows, for the .md's details block). The .md is hand-written.
// Plain Node, no dependencies, deterministic (no clock, no Math.random).
// --at bakes a head start (seconds) into every animation so a late frame can
// be checked without waiting; use it only with --out.
//
// Nothing here is copied from the real programs: no names, palettes, presets,
// fonts or code. The algorithm (draw, warp, dim, repeat) was published by its
// author and is free to reuse; this file only imitates its look.
//
// How the banner fakes feedback
//   * SVG has no frame buffer, so nothing can really accumulate. Instead the
//     picture is an ECHO STACK: the line is drawn N + 1 times. Echo k is the
//     line as it was k*DT seconds ago (every animation in it runs k*DT late:
//     the age is a custom property, --a, set once on the echo's group and
//     inherited by its <use> elements) and it is moved by exactly the warp
//     the real program would have applied to it since then: the flow maps of
//     the last k*DT seconds, composed numerically here and played back as
//     three SMIL animateTransforms (translate, rotate, scale) per echo. When
//     the flow switches on a bar line, the kink travels outward through the
//     stack, the way it does on the real thing.
//   * PERFORMANCE: every animated part is a <use> of a STATIC path and the
//     CSS animation runs on the <use> itself. (Animating inside a referenced
//     subtree made the browser restyle every instance every frame: about
//     ninety times the main-thread work.)
//   * Echo k is drawn white at opacity DECAY^k with a wider stroke, all inside
//     ONE filter: fractal-noise displacement (its strength breathing), a blur,
//     a flatten onto black, a fine-noise speckle, then feComponentTransfer
//     tables that map brightness through a palette (the indexed-colour look).
//     The tables are SMIL-animated, so the palette drifts: CORAL, KUMARA,
//     LAGOON, MANGO. A last step samples one point per 4x4 cell and dilates
//     it, so the fire is a 320 x 100 low-resolution picture; the smooth
//     picture sits underneath for screens too narrow for the sampling grid.
//   * The waveform is a row of half-wave LOBES between fixed zero crossings,
//     grouped into one path per (band, ripple zone). Each path is scaled
//     vertically by one of six band envelopes computed here from the theme's
//     real score (tools/make_audio.py: bars 13 to 20, the kalimba melody,
//     kick, snare, rim, bass and keys), so plucks land on the beat. Wide lobes
//     answer the kick and bass, narrow ones the high kalimba notes. Zones
//     further from the island play a little later, so every hit ripples
//     outward. Joints stay on the baseline, so the line never breaks.
//   * The island (sand, one tall palm that nods on the beat) is drawn into the
//     same line, and so are the loop's visitors: a shark fin in headphones,
//     a bottle that goes out on the trade wind and comes straight back, and
//     one bar of signal from the top of the palm. Their echoes burn too, at a
//     lower heat, and the sharp copies get a faint dark halo so they read.
//   * The sharp line uses vector-effect: non-scaling-stroke (switched on by
//     another inherited property, --ve), so squashed lobes keep one beam width.
//   * The overlay is a 5x7 pixel font defined below, one path per glyph,
//     placed with <use> and outlined in black (paint-order), never <text>.
//   * Timing: 24 s = 8 bars of 3 s at 80 BPM, the theme's bars 13 to 20
//     (Gm9 C13 Fmaj9 Dm9, twice). Every period divides 24 s, so it loops.
//   * prefers-reduced-motion hides the animated stack and shows a still one:
//     a complete frame with the name, the island and a fixed palette.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '96-feedback-fire_opus_5.5';
const ASSETS = path.join(HERE, '..', 'assets');
const arg = (name) => {
  const hit = process.argv.slice(2).find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : null;
};
const AT = Number(arg('at') || 0);
const OUT = arg('out');

// ---------------------------------------------------------------------------
// Frame and timing
// ---------------------------------------------------------------------------
const W = 1280, H = 400;
const CELL = 4;                      // one low-res pixel (320 x 100 screen)
const CX = 640, CY = 214;            // warp centre; the baseline of the line
const LOOP = 24, BAR = 3, BEAT = 0.75;
const NBARS = LOOP / BAR;            // 8
const FIRST_BAR = 13;                // the theme's bar numbers shown
const N = 20;                        // echoes
const DT = 0.08;                     // seconds between echoes
const DECAY = 0.88;
const TSAMPLES = 72;                 // echo transform keyframes per loop

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const TAU = Math.PI * 2;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const fx = (n, d = 1) => {
  let s = (Math.round(n * 10 ** d) / 10 ** d).toFixed(d);
  if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, '');
  if (s === '-0') s = '0';
  return s.replace(/^(-?)0\./, '$1.');
};
const mod = (a, m) => ((a % m) + m) % m;
const begin = AT ? `${-AT}s` : '0s';
function mulberry32(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = mulberry32(1992);

// ---------------------------------------------------------------------------
// The score: the theme's bars 13 to 20, from tools/make_audio.py
// (bar n starts at (n - 1) * 3 s; here bar 13 starts at 0 s)
// ---------------------------------------------------------------------------
const CHORDS = ['Gm9', 'C13', 'Fmaj9', 'Dm9'];                 // ii-V-I-vi in F
const chordOf = (bar) => CHORDS[(bar - 1) % 4];
const MELODY = [
  [13, 0.0, 86], [13, 1.5, 84], [13, 2.0, 81], [13, 2.5, 82], [13, 3.0, 81], [13, 3.5, 79],
  [14, 0.0, 79], [14, 1.5, 81], [14, 2.0, 84], [14, 2.5, 86], [14, 3.0, 88],
  [15, 0.0, 89], [15, 2.0, 88], [15, 2.5, 84], [15, 3.0, 81],
  [16, 0.5, 79], [16, 1.0, 81], [16, 1.5, 84], [16, 3.5, 86],
  [17, 0.0, 86], [17, 2.0, 84],
  [18, 0.0, 81], [18, 2.0, 79],
  [19, 1.0, 84], [19, 2.5, 81],
  [20, 0.0, 84], [20, 0.5, 88], [20, 1.0, 91], [20, 2.0, 89],
];
const at = (bar, beat) => (bar - FIRST_BAR) * BAR + beat * BEAT;

// Six bands, 0 = narrowest lobes (high kalimba notes) to 5 = widest (kick).
const NB = 6;
const BAND_HZ = [3.0, 2.6, 2.2, 1.8, 1.5, 1.2];   // how fast each band wriggles
const hits = [];   // [time, band, strength, decay seconds]
function hit(t, band, amp, tau) {
  for (let b = 0; b < NB; b++) {
    const fall = Math.abs(b - band);
    const k = fall === 0 ? 1 : fall === 1 ? 0.45 : fall === 2 ? 0.15 : 0;
    if (k) hits.push([t, b, amp * k, tau]);
  }
}
for (const [bar, beat, midi] of MELODY) {
  const band = clamp(Math.round((91 - midi) / 3), 0, 4);
  hit(at(bar, beat), band, (beat % 1 === 0 ? 1 : 0.8) * (bar === 20 ? 0.75 : 1), 0.55);
}
for (let bar = FIRST_BAR; bar < FIRST_BAR + NBARS; bar++) {
  if (bar >= 17) {                                   // breakdown: kick and rim only
    hit(at(bar, 0), 5, 0.9, 0.3);
    for (const b of [1, 3]) hit(at(bar, b), 2, 0.45, 0.15);
    hit(at(bar, 0), 4, 0.35, 1.6);                   // the pad, swelling
  } else {
    const fill = bar % 4 === 2;
    for (const b of fill ? [0, 1.75, 2.5] : [0, 2.5]) hit(at(bar, b), 5, b === 0 ? 1 : 0.8, 0.28);
    for (const b of [1, 3]) hit(at(bar, b), 3, 0.7, 0.2);
    for (let b = 0; b < 4; b += 0.25) hit(at(bar, b), 0, b % 1 === 0 ? 0.16 : 0.08, 0.08);
    hit(at(bar, 0), 4, 0.5, 0.8);                    // bass root
  }
  hit(at(bar, 0), 2, 0.3, 1.2);                      // keys, strummed
  hit(at(bar, 2.5), 2, 0.2, 0.8);
}

// band envelope: a sum of decaying wriggles, wrapped so the loop is seamless
const PHASE = Array.from({ length: NB }, () => rnd() * TAU);
function bandAmp(b, t) {
  let v = 0.2 * Math.sin(TAU * (t / 6) + PHASE[b]);   // the idle hum, 6 s period
  for (const [t0, bb, amp, tau] of hits) {
    if (bb !== b) continue;
    for (const wrap of [0, -LOOP]) {
      const dt = t - (t0 + wrap);
      if (dt < 0 || dt > tau * 7) continue;
      v += amp * Math.exp(-dt / tau) * Math.cos(TAU * BAND_HZ[b] * dt);
    }
  }
  // a scope is not a meter: squash the dynamics so quiet bars still move
  return clamp(Math.sign(v) * Math.abs(v) ** 0.65, -1.2, 1.2);
}
const ENV_SAMPLES = 240;   // 10 a second

// ---------------------------------------------------------------------------
// The flow maps, one per bar, switched on the bar line
// sigma: zoom (log per second), omega: turn (degrees per second),
// v: drift (units per second), about (cx, cy)
// ---------------------------------------------------------------------------
// (the swell zooms about a point above the line, so its copies spread
// down into the sea as well as up into the sky)
const FLOWS = [
  { name: 'SWELL', sigma: 0.5, omega: 0, vx: 0, vy: 0, cy: CY - 60 },
  { name: 'WHIRLPOOL', sigma: 0.28, omega: 26, vx: 0, vy: 0 },
  { name: 'HEAT HAZE', sigma: 0.12, omega: 0, vx: 0, vy: -95 },
  { name: 'EDDY', sigma: 0.28, omega: -30, vx: 0, vy: -10 },
  { name: 'TRADE WIND', sigma: 0.1, omega: -4, vx: -70, vy: -34 },
  { name: 'UNDERTOW', sigma: 0.2, omega: 6, vx: 60, vy: 40 },
  { name: 'HEAT HAZE', sigma: 0.12, omega: 0, vx: 0, vy: -95 },
  { name: 'SWELL', sigma: 0.5, omega: 0, vx: 0, vy: 0, cy: CY - 60 },
];
const flowAt = (t) => FLOWS[Math.floor(mod(t, LOOP) / BAR)];

// affine [a, b, c, d, e, f]: x' = a x + c y + e, y' = b x + d y + f
const mul = (P, Q) => [
  P[0] * Q[0] + P[2] * Q[1], P[1] * Q[0] + P[3] * Q[1],
  P[0] * Q[2] + P[2] * Q[3], P[1] * Q[2] + P[3] * Q[3],
  P[0] * Q[4] + P[2] * Q[5] + P[4], P[1] * Q[4] + P[3] * Q[5] + P[5],
];
function stepMap(f, h) {
  const s = Math.exp(f.sigma * h), r = (f.omega * h * Math.PI) / 180;
  const a = s * Math.cos(r), b = s * Math.sin(r);
  // x' = c + A (x - c) + v h
  const cx = f.cx ?? CX, cy = f.cy ?? CY;
  return [a, b, -b, a, cx - a * cx + b * cy + f.vx * h, cy - b * cx - a * cy + f.vy * h];
}
// the warp that echo of age L has had applied to it by time t
function warpOf(t, L) {
  let M = [1, 0, 0, 1, 0, 0];
  const steps = Math.max(1, Math.round(L * 240));
  const h = L / steps;
  for (let i = 0; i < steps; i++) M = mul(stepMap(flowAt(t - L + (i + 0.5) * h), h), M);
  return M;
}

// ---------------------------------------------------------------------------
// 5x7 pixel font (drawn for this header): capitals, digits, a few lowercase
// letters for the chord names, and punctuation. '#' = lit.
// ---------------------------------------------------------------------------
const G = {
  A: '.###. #...# #...# ##### #...# #...# #...#',
  B: '####. #...# #...# ####. #...# #...# ####.',
  C: '.###. #...# #.... #.... #.... #...# .###.',
  D: '###.. #..#. #...# #...# #...# #..#. ###..',
  E: '##### #.... #.... ####. #.... #.... #####',
  F: '##### #.... #.... ####. #.... #.... #....',
  G: '.###. #...# #.... #.### #...# #...# .####',
  H: '#...# #...# #...# ##### #...# #...# #...#',
  I: '.###. ..#.. ..#.. ..#.. ..#.. ..#.. .###.',
  J: '..### ...#. ...#. ...#. ...#. #..#. .##..',
  K: '#...# #..#. #.#.. ##... #.#.. #..#. #...#',
  L: '#.... #.... #.... #.... #.... #.... #####',
  M: '#...# ##.## #.#.# #.#.# #...# #...# #...#',
  N: '#...# #...# ##..# #.#.# #..## #...# #...#',
  O: '.###. #...# #...# #...# #...# #...# .###.',
  P: '####. #...# #...# ####. #.... #.... #....',
  Q: '.###. #...# #...# #...# #.#.# #..#. .##.#',
  R: '####. #...# #...# ####. #.#.. #..#. #...#',
  S: '.#### #.... #.... .###. ....# ....# ####.',
  T: '##### ..#.. ..#.. ..#.. ..#.. ..#.. ..#..',
  U: '#...# #...# #...# #...# #...# #...# .###.',
  V: '#...# #...# #...# #...# #...# .#.#. ..#..',
  W: '#...# #...# #...# #.#.# #.#.# #.#.# .#.#.',
  X: '#...# #...# .#.#. ..#.. .#.#. #...# #...#',
  Y: '#...# #...# .#.#. ..#.. ..#.. ..#.. ..#..',
  Z: '##### ....# ...#. ..#.. .#... #.... #####',
  0: '.###. #...# #..## #.#.# ##..# #...# .###.',
  1: '..#.. .##.. ..#.. ..#.. ..#.. ..#.. .###.',
  2: '.###. #...# ....# ...#. ..#.. .#... #####',
  3: '####. ....# ....# .###. ....# ....# ####.',
  4: '...#. ..##. .#.#. #..#. ##### ...#. ...#.',
  5: '##### #.... ####. ....# ....# #...# .###.',
  6: '..##. .#... #.... ####. #...# #...# .###.',
  7: '##### ....# ...#. ..#.. .#... .#... .#...',
  8: '.###. #...# #...# .###. #...# #...# .###.',
  9: '.###. #...# #...# .#### ....# ...#. .##..',
  a: '..... ..... .###. ....# .#### #...# .####',
  j: '....# ..... ...## ....# ....# ....# ....# #...# .###.',
  m: '..... ..... ##.#. #.#.# #.#.# #.#.# #.#.#',
  '.': '..... ..... ..... ..... ..... ..... ..#..',
  ',': '..... ..... ..... ..... ..... ..#.. ..#.. .#...',
  ':': '..... ..#.. ..... ..... ..... ..#.. .....',
  '-': '..... ..... ..... .###. ..... ..... .....',
  '/': '....# ...#. ...#. ..#.. .#... .#... #....',
  '(': '...#. ..#.. .#... .#... .#... ..#.. ...#.',
  ')': '.#... ..#.. ...#. ...#. ...#. ..#.. .#...',
  "'": '..#.. ..#.. .#... ..... ..... ..... .....',
  '!': '..#.. ..#.. ..#.. ..#.. ..#.. ..... ..#..',
  '?': '.###. #...# ....# ...#. ..#.. ..... ..#..',
  '+': '..... ..#.. ..#.. ##### ..#.. ..#.. .....',
  '=': '..... ..... ##### ..... ##### ..... .....',
  '>': '.#... ..#.. ...#. ....# ...#. ..#.. .#...',
  '%': '##..# ##..# ...#. ..#.. .#... #..## #..##',
  '#': '.#.#. .#.#. ##### .#.#. ##### .#.#. .#.#.',
  '*': '..... #.#.# .###. ##### .###. #.#.# .....',
  '|': '..#.. ..#.. ..#.. ..#.. ..#.. ..#.. ..#..',
  ' ': '..... ..... ..... ..... ..... ..... .....',
};
const ADV = 6;   // 5 wide + 1 gap
// One merged path for a string: runs per row, stacked runs merged downward.
function textPath(str, x0, y0, px) {
  const rects = [];
  [...str].forEach((ch, i) => {
    const g = G[ch];
    if (!g) throw new Error(`no glyph for "${ch}"`);
    g.split(' ').forEach((row, r) => {
      let c = 0;
      while (c < 5) {
        if (row[c] !== '#') { c++; continue; }
        let e = c;
        while (e < 5 && row[e] === '#') e++;
        rects.push({ x: i * ADV + c, y: r, w: e - c, h: 1 });
        c = e;
      }
    });
  });
  // merge vertically: same x and w, touching
  rects.sort((p, q) => p.x - q.x || p.w - q.w || p.y - q.y);
  const merged = [];
  for (const r of rects) {
    const last = merged[merged.length - 1];
    if (last && last.x === r.x && last.w === r.w && last.y + last.h === r.y) last.h++;
    else merged.push({ ...r });
  }
  return merged
    .map((r) => `M${fx(x0 + r.x * px)} ${fx(y0 + r.y * px)}h${fx(r.w * px)}v${fx(r.h * px)}h${fx(-r.w * px)}z`)
    .join('');
}
const textWidth = (str, px) => (str.length * ADV - 1) * px;

// ---------------------------------------------------------------------------
// The line: lobes, the island and the visitors
// ---------------------------------------------------------------------------
const SHORE_L = 540, SHORE_R = 742;
const lobes = [];
function layLobes(x0, x1, dir) {
  // dir +1 lays from x0 rightwards; lobes near the island are laid first
  let x = dir > 0 ? x0 : x1;
  let sign = 1;
  const out = [];
  while (dir > 0 ? x < x1 - 10 : x > x0 + 10) {
    let w = 16 + Math.floor(rnd() * 30);
    const room = dir > 0 ? x1 - x : x - x0;
    if (room - w < 16) w = room;
    const a = dir > 0 ? x : x - w;
    out.push({ x: a, w, sign });
    sign = -sign;
    x += dir * w;
  }
  return out;
}
lobes.push(...layLobes(0, SHORE_L, -1), ...layLobes(SHORE_R, W, 1));
for (const l of lobes) {
  l.band = clamp(Math.floor(((l.w - 16) / 30) * NB), 0, NB - 1);
  const mid = l.x + l.w / 2;
  const dist = mid < CX ? SHORE_L - mid : mid - SHORE_R;
  l.dist = dist;                                         // ripples outward
  // amplitude: calm in the lagoon, tapering at the screen edges
  const edge = Math.min(mid, W - mid);
  l.gain = (0.45 + 0.55 * clamp(dist / 140, 0, 1)) * (0.5 + 0.5 * clamp(edge / 200, 0, 1));
}
// half-sine lobe of width w and height h (upwards when h > 0), from (x, 0)
const K1 = 0.4244, K2 = 4 / 3;
const lobeD = (x, w, h) =>
  `M${fx(x)} 0c${fx(K1 * w)} ${fx(-K2 * h)} ${fx((1 - K1) * w)} ${fx(-K2 * h)} ${fx(w)} 0`;
const LOBE_H = 72;
// the island and palm never move, so every echo lands on them: burn them at
// a lower level or they saturate to white and swallow the sharp line
const ISLAND_BURN = 0.42;
const GAG_BURN = 0.6;

// envelope keyframes for each band
function bandKeyframes(b) {
  let out = `@keyframes b${b}{`;
  for (let i = 0; i <= ENV_SAMPLES; i++) {
    const t = ((i / ENV_SAMPLES) * LOOP) % LOOP;   // 100% is the next 0%
    out += `${fx((i / ENV_SAMPLES) * 100, 3)}%{scale:1 ${fx(bandAmp(b, t), 2)}}`;
  }
  return out + '}';
}

// the island: a sand bar and one tall palm, as single strokes
const SAND = `M${SHORE_L} 0C${SHORE_L + 34} -2 ${SHORE_L + 52} -24 ${CX} -26C${CX + 46} -26 ${SHORE_R - 46} -3 ${SHORE_R} 0`;
const TRUNK_BASE = [CX + 18, -24];
const CROWN = [CX - 12, -138];
const trunkD = (() => {
  // two edges of a gently curved trunk
  const [bx, by] = TRUNK_BASE, [tx, ty] = CROWN;
  const pts = (off) => {
    const p = [];
    for (let i = 0; i <= 12; i++) {
      const u = i / 12;
      const x = bx + (tx - bx) * u + Math.sin(u * Math.PI) * 16;
      const y = by + (ty - by) * u;
      const half = (7 - 3.5 * u) * off;
      p.push([x + half, y]);
    }
    return p;
  };
  const L = pts(-1), R = pts(1);
  let d = 'M' + L.map(([x, y]) => `${fx(x)} ${fx(y)}`).join('L');
  d += 'M' + R.map(([x, y]) => `${fx(x)} ${fx(y)}`).join('L');
  // a few short bark ticks off the outer (right) edge
  for (let i = 2; i < 12; i += 3) d += `M${fx(R[i][0])} ${fx(R[i][1])}l-4 -3`;
  return d;
})();
const frondD = (() => {
  // six leaves from the crown, each an outline with a pointed tip
  const [cx, cy] = CROWN;
  const leaves = [
    [-150, 82, 30], [-120, 70, 22], [-40, 74, 22], [-15, 84, 30], [-95, 46, -10], [-62, 50, -12],
  ];
  let d = '';
  for (const [ang, len, droop] of leaves) {
    const r = (ang * Math.PI) / 180;
    const ex = cx + Math.cos(r) * len, ey = cy + Math.sin(r) * len + droop + 26;
    const mx = cx + Math.cos(r) * len * 0.55, my = cy + Math.sin(r) * len * 0.55 - 6;
    const nx = -(ey - cy), ny = ex - cx, nl = Math.hypot(nx, ny);
    const wv = 7;
    d += `M${fx(cx)} ${fx(cy)}Q${fx(mx + (nx / nl) * wv)} ${fx(my + (ny / nl) * wv)} ${fx(ex)} ${fx(ey)}`;
    d += `Q${fx(mx - (nx / nl) * wv)} ${fx(my - (ny / nl) * wv)} ${fx(cx)} ${fx(cy)}`;
  }
  // three coconuts
  for (const [ox, oy] of [[-4, 9], [6, 8], [1, 15]]) {
    const r = 4;
    d += `M${fx(cx + ox - r)} ${fx(cy + oy)}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`;
  }
  return d;
})();
// a shark fin, wearing headphones (origin at the waterline)
const FIN = 'M-30 0C-14 -14 -4 -48 16 -76C10 -50 14 -20 34 0'
  + 'M-9 -53C-9 -88 27 -92 25 -57'
  + 'M-14 -54h9v17h-9zM21 -58h9v17h-9z';
// a message in a bottle (origin at its middle, lying on the water)
const BOTTLE = 'M-22 -9H8C14 -9 16 -4 20 -4H28V4H20C16 4 14 9 8 9H-22C-27 9 -29 5 -29 0S-27 -9 -22 -9Z'
  + 'M28 -3H34V3H28M-18 -4H2V4H-18ZM-14 0H-2';
// one bar of signal (origin at the crown)
const SIGNAL = [16, 30, 44].map((r) =>
  `M${fx(-r * 0.7)} ${fx(-r * 0.7)}A${r} ${r} 0 0 1 ${fx(r * 0.7)} ${fx(-r * 0.7)}`).join('');

// ---------------------------------------------------------------------------
// Keyframes for the visitors (24 s, delayed per echo by --a)
// ---------------------------------------------------------------------------
const pc = (s) => fx((s / LOOP) * 100, 3) + '%';
function finKeys() {
  // bars 15-16 (6 s to 12 s): in from the right edge, cruising towards the
  // island, dives before the shore
  const k = [];
  const X0 = W + 50, X1 = SHORE_R + 70, S = 1.25;
  k.push(`0%{translate:${X0}px 0;scale:${S} 0}`);
  k.push(`${pc(5.9)}{translate:${X0}px 0;scale:${S} 0}`);
  k.push(`${pc(6.1)}{translate:${X0 - 10}px 0;scale:${S}}`);
  for (let i = 1; i <= 11; i++) {
    const t = 6 + i * 0.5;
    const x = X0 - 10 - ((X0 - 10 - X1) * i) / 11;
    k.push(`${pc(t)}{translate:${fx(x)}px ${i % 2 ? 3 : -2}px;scale:${S}}`);
  }
  k.push(`${pc(12)}{translate:${X1 - 10}px 4px;scale:${S} 0}`);
  k.push(`100%{translate:${X1 - 10}px 4px;scale:${S} 0}`);
  return `@keyframes fin{${k.join('')}}`;
}
function bottleKeys() {
  // bars 17-18 (12 s to 18 s): thrown from the left shore, out on the trade
  // wind, straight back on the undertow
  const k = [];
  const X0 = SHORE_L - 22;
  k.push(`0%{translate:${X0}px 0;scale:0;rotate:180deg}`);
  k.push(`${pc(11.9)}{translate:${X0}px 0;scale:0;rotate:180deg}`);
  for (let i = 0; i <= 12; i++) {
    const t = 12 + i * 0.5;
    const u = i <= 6 ? i / 6 : (12 - i) / 6;
    const x = X0 - 250 * Math.sin((u * Math.PI) / 2);
    const rot = (i % 2 ? 9 : -7) + (i > 6 ? 0 : 180);
    k.push(`${pc(t)}{translate:${fx(x)}px ${i % 2 ? -6 : -12}px;scale:1.4;rotate:${rot}deg}`);
  }
  k.push(`${pc(18.1)}{translate:${X0}px 0;scale:0;rotate:0deg}`);
  k.push(`100%{translate:${X0}px 0;scale:0;rotate:0deg}`);
  return `@keyframes bottle{${k.join('')}}`;
}
function signalKeys() {
  // bar 19 (18 s to 21 s): one bar of signal, pulsing on each beat
  const k = ['0%{opacity:0}', `${pc(17.95)}{opacity:0}`];
  for (let i = 0; i < 4; i++) {
    const t = 18 + i * BEAT;
    k.push(`${pc(t)}{opacity:1}`, `${pc(t + 0.5)}{opacity:.6}`);
  }
  k.push(`${pc(21)}{opacity:0}`, '100%{opacity:0}');
  return `@keyframes sig{${k.join('')}}`;
}

// ---------------------------------------------------------------------------
// Palettes: brightness -> colour, as feComponentTransfer tables (9 steps)
// ---------------------------------------------------------------------------
const PALETTES = [
  { name: 'CORAL', ramp: ['#000000', '#1a0208', '#4a0a14', '#8c1c22', '#d2483a', '#ff7f5c', '#ffb48e', '#ffe0c8', '#ffffff'] },
  { name: 'KUMARA', ramp: ['#000000', '#12041f', '#3a0d4c', '#74195e', '#b8344a', '#ec6e26', '#ffae3c', '#ffe08c', '#ffffff'] },
  { name: 'LAGOON', ramp: ['#000000', '#000a1c', '#002250', '#004c8c', '#0a84c4', '#1fbfe6', '#72e6f6', '#c8fbff', '#ffffff'] },
  { name: 'MANGO', ramp: ['#000000', '#1c0600', '#4a1400', '#8c3000', '#d25a00', '#ff9200', '#ffc430', '#fff08a', '#ffffff'] },
];
const hexCh = (h, i) => parseInt(h.slice(1 + i * 2, 3 + i * 2), 16) / 255;
const tableOf = (p, ch) => p.ramp.map((h) => fx(hexCh(h, ch), 3)).join(' ');
// each palette holds for 4.5 s, then morphs for 1.5 s into the next
function paletteAnim(ch) {
  const vals = [], times = [];
  PALETTES.forEach((p, i) => {
    vals.push(tableOf(p, ch), tableOf(p, ch));
    times.push((i * 6) / LOOP, (i * 6 + 4.5) / LOOP);
  });
  vals.push(tableOf(PALETTES[0], ch));
  times.push(1);
  return `<animate attributeName="tableValues" dur="${LOOP}s" begin="${begin}" repeatCount="indefinite" values="${vals.join(';')}" keyTimes="${times.map((t) => fx(t, 4)).join(';')}"/>`;
}

// ---------------------------------------------------------------------------
// Build the banner
// ---------------------------------------------------------------------------
function echoTransforms(k) {
  const L = k * DT;
  const tr = [], ro = [], sc = [];
  let prev = null;
  for (let j = 0; j <= TSAMPLES; j++) {
    const t = (j / TSAMPLES) * LOOP;
    const M = warpOf(t, L);
    const s = Math.hypot(M[0], M[1]);
    let th = (Math.atan2(M[1], M[0]) * 180) / Math.PI;
    if (prev !== null) while (th - prev > 180) th -= 360;
    if (prev !== null) while (th - prev < -180) th += 360;
    prev = th;
    tr.push(`${fx(M[4])} ${fx(M[5])}`);
    ro.push(fx(th, 2));
    sc.push(fx(s, 3));
  }
  return { tr: tr.join(';'), ro: ro.join(';'), sc: sc.join(';') };
}
const anim = (type, values) =>
  `<animateTransform attributeName="transform" type="${type}" dur="${LOOP}s" begin="${begin}" repeatCount="indefinite" values="${values}"/>`;

function buildBanner() {
  const css = [];
  css.push(`.ln{fill:none;stroke:#fff;stroke-linecap:round;stroke-linejoin:round}`);
  for (let b = 0; b < NB; b++) {
    css.push(bandKeyframes(b));
  }
  css.push(finKeys(), bottleKeys(), signalKeys());
  css.push(`@keyframes nod{0%{rotate:0deg}12%{rotate:-2.4deg}60%{rotate:.4deg}100%{rotate:0deg}}`);
  css.push(`@keyframes bob{0%{rotate:-7deg}50%{rotate:7deg}100%{rotate:-7deg}}`);
  // Every animated thing is a <use> of a STATIC path, and the animation runs
  // on the <use> itself: animating inside a referenced subtree makes the
  // browser restyle every instance every frame. Echo k plays everything k*DT
  // late (its age, --a, is set once on the echo's group and inherited); a
  // lobe zone's ripple lag is added on top. Delays are folded below -LOOP so
  // nothing waits at load.
  const dly = (lag = 0) => `calc(var(--a,0s) + ${fx(lag - LOOP - AT, 3)}s)`;
  for (let b = 0; b < NB; b++) css.push(`.b${b}{animation:b${b} ${LOOP}s linear infinite}`);
  css.push(`.palm{transform-origin:${TRUNK_BASE[0]}px ${TRUNK_BASE[1]}px;animation:nod ${BEAT}s ease-out infinite;animation-delay:${dly()}}`);
  css.push(`.fin{scale:1 0;animation:fin ${LOOP}s linear infinite,bob ${BAR / 2}s ease-in-out infinite;animation-delay:${dly()},${dly()}}`);
  css.push(`.btl{scale:0;animation:bottle ${LOOP}s linear infinite;animation-delay:${dly()}}`);
  css.push(`.sig{opacity:0;animation:sig ${LOOP}s linear infinite;animation-delay:${dly()}}`);
  css.push(`.wv{vector-effect:var(--ve,none)}`);

  // static shapes: one path per (band, ripple zone), the island, the palm,
  // the visitors
  const ZONES = [[0, 150, 0.07], [150, 330, 0.22], [330, 1e9, 0.4]];
  const parts = [];   // {id, b, lag}
  let defs = '';
  for (let b = 0; b < NB; b++) {
    ZONES.forEach(([d0, d1, lag], z) => {
      const ls = lobes.filter((l) => l.band === b && l.dist >= d0 && l.dist < d1);
      if (!ls.length) return;
      const id = `w${b}${z}`;
      defs += `<path id="${id}" class="wv" d="${ls.map((l) => lobeD(l.x, l.w, LOBE_H * l.gain * l.sign)).join('')}"/>`;
      parts.push({ id, b, z });
    });
  }
  // (after the band rules, so these delays win)
  ZONES.forEach(([, , lag], z) => css.push(`.z${z}{animation-delay:${dly(lag)}}`));
  defs += `<path id="isl" class="wv" d="${SAND}"/>`
    + `<g id="palm"><path class="wv" d="${trunkD}"/><path class="wv" d="${frondD}"/></g>`
    + `<g id="sig"><path class="wv" transform="translate(${CROWN[0]} ${CROWN[1] - 8})" d="${SIGNAL}"/></g>`
    + `<path id="fin" class="wv" d="${FIN}"/>`
    + `<path id="btl" class="wv" d="${BOTTLE}"/>`;

  // one copy of the line, everything playing `age` seconds late
  const lineAt = (burn) => parts
    .map((p) => `<use href="#${p.id}" class="b${p.b} z${p.z}"/>`).join('')
    + `<use href="#isl"${burn ? ` opacity="${ISLAND_BURN}"` : ''}/>`
    + `<use href="#palm" class="palm"${burn ? ` opacity="${ISLAND_BURN}"` : ''}/>`
    + `<use href="#sig" class="sig"/>`
    + `<use href="#fin" class="fin"${burn ? ` opacity="${GAG_BURN}"` : ''}/>`
    + `<use href="#btl" class="btl"${burn ? ` opacity="${GAG_BURN}"` : ''}/>`;

  // echoes, oldest first
  let echoes = '';
  for (let k = N; k >= 1; k--) {
    const { tr, ro, sc } = echoTransforms(k);
    const op = fx(DECAY ** k, 3);
    const sw = fx(3.6 + k * 0.9, 1);
    echoes += `<g>${anim('translate', tr)}<g>${anim('rotate', ro)}<g>${anim('scale', sc)}`
      + `<g transform="translate(0 ${CY})" style="--a:${fx(k * DT, 2)}s" opacity="${op}" stroke-width="${sw}">${lineAt(true)}</g></g></g></g>`;
  }
  echoes += `<g transform="translate(0 ${CY})" stroke-width="3.6">${lineAt(true)}</g>`;
  // the island and the visitors get a dark halo under the sharp line, or the
  // white line vanishes into its own white-hot wake; the waveform does not
  const halo = `<use href="#isl"/><use href="#palm" class="palm"/><use href="#sig" class="sig"/>`
    + `<use href="#fin" class="fin"/><use href="#btl" class="btl"/>`;
  const liveLine = `<g class="ln live" style="--ve:non-scaling-stroke;stroke:#000;stroke-opacity:.55" stroke-width="6" transform="translate(0 ${CY})">${halo}</g>`
    + `<g class="ln live" style="--ve:non-scaling-stroke" stroke-width="2.2" transform="translate(0 ${CY})">${lineAt(false)}</g>`;

  // the filter: displace, blur, flatten, palette, low-res
  const fire = `<filter id="fire" x="0" y="0" width="${W}" height="${H}" filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse" color-interpolation-filters="sRGB">`
    + `<feTurbulence type="fractalNoise" baseFrequency="0.011 0.016" numOctaves="2" seed="1992" result="n"/>`
    + `<feDisplacementMap in="SourceGraphic" in2="n" scale="16" xChannelSelector="R" yChannelSelector="G" result="d">`
    + `<animate attributeName="scale" values="8;30;12;26;8" dur="${BAR * 2}s" begin="${begin}" repeatCount="indefinite"/></feDisplacementMap>`
    + `<feGaussianBlur in="d" stdDeviation="3" result="b"/>`
    + `<feFlood flood-color="#000" result="k"/>`
    + `<feMerge result="m"><feMergeNode in="k"/><feMergeNode in="b"/></feMerge>`
    // grain: the real program carried each pixel's rounding error into the
    // next, leaving a speckle in the smear. Fine noise nudges the brightness
    // by up to about 12% before the palette, so the speckle is in palette
    // colours (and black stays black)
    + `<feTurbulence type="fractalNoise" baseFrequency="0.45" numOctaves="1" seed="80"/>`
    + `<feColorMatrix values="1 0 0 0 0 1 0 0 0 0 1 0 0 0 0 0 0 0 0 1" result="g"/>`
    + `<feComposite in="m" in2="g" operator="arithmetic" k1="0.5" k2="0.75" k3="0" k4="0" result="mg"/>`
    + `<feComponentTransfer in="mg" result="p">`
    + `<feFuncR type="table" tableValues="${tableOf(PALETTES[0], 0)}">${paletteAnim(0)}</feFuncR>`
    + `<feFuncG type="table" tableValues="${tableOf(PALETTES[0], 1)}">${paletteAnim(1)}</feFuncG>`
    + `<feFuncB type="table" tableValues="${tableOf(PALETTES[0], 2)}">${paletteAnim(2)}</feFuncB>`
    + `</feComponentTransfer>`
    + `<feFlood x="1" y="1" width="2" height="2" flood-color="#fff"/>`
    + `<feComposite width="${CELL}" height="${CELL}"/>`
    + `<feTile result="t"/>`
    + `<feComposite in="p" in2="t" operator="in"/>`
    + `<feMorphology operator="dilate" radius="2" result="px"/>`
    // on a narrow screen a 4-unit cell is smaller than a device pixel and
    // the sampling grid can miss everything; the smooth picture underneath
    // fills in, and on a wide screen the opaque cells cover it completely
    + `<feMerge><feMergeNode in="p"/><feMergeNode in="px"/></feMerge>`
    + `</filter>`;

  // the overlay text
  const PX = 3;
  const hud = [];
  // small text: one <path> per glyph in <defs>, placed with <use>
  const used = new Set();
  const line = (str, x, y) => [...str].map((ch, i) => {
    if (ch === ' ') return '';
    used.add(ch);
    return `<use href="#g${ch.charCodeAt(0)}" x="${fx(x + i * ADV * PX)}" y="${fx(y)}"/>`;
  }).join('');
  hud.push(`<path class="tx" d="${textPath('CASTAWAY', 28, 26, 8)}"/>`);
  hud.push(`<g class="tx dim">${line('TEN HOURS. ONE ISLAND.', 30, 100)}${line('ALMOST NOTHING HAPPENS.', 30, 128)}</g>`);

  const EVENTS = [
    'NOTHING HAPPENING. ON SCHEDULE.',
    'STILL NOTHING. LOVELY.',
    'VISITOR: SHARK IN HEADPHONES',
    'THE SHARK NODS ON THE BEAT',
    'BOTTLE OUT. MESSAGE INSIDE.',
    'BOTTLE BACK. NO REPLY YET.',
    'SIGNAL: 1 BAR, TOP OF THE PALM',
    'NOTHING HAPPENING AGAIN.',
  ];
  const stepCss = (name, i, n) => {
    // visible during slot i of n equal slots
    const a = (i / n) * 100, b = ((i + 1) / n) * 100;
    const k = [];
    if (i > 0) k.push(`0%{opacity:0}`);
    k.push(`${fx(a, 3)}%{opacity:1}`, `${fx(b - 0.001, 3)}%{opacity:1}`);
    if (i < n - 1) k.push(`${fx(b, 3)}%{opacity:0}`, `100%{opacity:0}`);
    else k.push(`100%{opacity:1}`);
    return `@keyframes ${name}{${k.join('')}}`;
  };
  const slot = (cls, i, n, d) => {
    css.push(stepCss(`${cls}${i}`, i, n));
    css.push(`.${cls}${i}{animation:${cls}${i} ${LOOP}s step-end infinite;animation-delay:${fx(-AT, 3)}s${i ? ';opacity:0' : ''}}`);
    return `<g class="tx ${cls}${i}${d}">`;
  };
  EVENTS.forEach((e, i) => {
    const w = textWidth(e, PX);
    hud.push(`${slot('ev', i, NBARS, ' dim')}${line(e, W - 28 - w, 26)}</g>`);
  });
  for (let i = 0; i < NBARS; i++) {
    const bar = FIRST_BAR + i;
    const str = `BAR ${bar}/20  ${chordOf(bar)}  FLOW: ${FLOWS[i].name}`;
    hud.push(`${slot('fl', i, NBARS, ' dim')}${line(str, 30, H - 26 - 7 * PX)}</g>`);
  }
  // palette name switches in the middle of each morph
  PALETTES.forEach((p, i) => {
    const str = `PALETTE ${i + 1}/4: ${p.name}`;
    const w = textWidth(str, PX);
    hud.push(`${slot('pa', i, 4, ' dim')}${line(str, W - 28 - w, H - 26 - 7 * PX)}</g>`);
  });
  // the palette names change mid-morph: start that animation 0.75 s early
  css.push(`.pa0,.pa1,.pa2,.pa3{animation-delay:${fx(-AT - 0.75, 3)}s!important}`);
  css.push(`.pa0{opacity:1}`);
  css.push(`.tx{fill:#fff;stroke:#000;stroke-width:${PX * 1.6};stroke-linejoin:miter;paint-order:stroke}`);
  css.push(`.dim{fill:#e9e4dc}`);
  css.push(`.still{display:none}`);
  css.push(`@media (prefers-reduced-motion:reduce){.live{display:none}.still{display:inline}*{animation:none!important}}`);

  // the still frame for reduced motion: the line frozen just after the
  // downbeat of bar 13, its echoes where the swell has put them by then
  const T_STILL = 1.2;
  defs += `<g id="sw">${parts.map((p) => `<use href="#${p.id}" transform="scale(1 ${fx(bandAmp(p.b, 0.3 + ZONES[p.z][2]), 2)})"/>`).join('')}`
    + `<use href="#isl" style="opacity:var(--io,1)"/><use href="#palm" style="opacity:var(--io,1)"/></g>`;
  let still = '';
  for (let k = N; k >= 0; k--) {
    const M = warpOf(T_STILL, k * DT);
    still += `<use href="#sw" transform="matrix(${M.map((v, i) => fx(v, i < 4 ? 4 : 1)).join(' ')}) translate(0 ${CY})" style="--io:${ISLAND_BURN}" opacity="${fx(DECAY ** k, 3)}" stroke-width="${fx(3.6 + k * 0.9, 1)}"/>`;
  }
  const fireStill = fire
    .replace('id="fire"', 'id="fireStill"')
    .replace(/<animate [^>]*\/>/g, '')
    .replace(/<animate [^>]*>/g, '');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="CASTAWAY: a feedback-fire music visualiser. One white oscilloscope line with a palm island drawn into it, and its own history burning outward behind it in a slowly changing fire palette.">
<title>CASTAWAY: ten hours, one island, almost nothing happens</title>
<style>${css.join('\n')}</style>
<defs>
<clipPath id="scr"><rect width="${W}" height="${H}" rx="14"/></clipPath>
<linearGradient id="shade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-opacity=".72"/><stop offset=".3" stop-opacity=".3"/><stop offset=".42" stop-opacity="0"/><stop offset=".8" stop-opacity="0"/><stop offset="1" stop-opacity=".6"/></linearGradient>
${[...used].map((ch) => `<path id="g${ch.charCodeAt(0)}" d="${textPath(ch, 0, 0, PX)}"/>`).join('')}
${defs}
${fire}
${fireStill}
</defs>
<g clip-path="url(#scr)">
<rect width="${W}" height="${H}" fill="#000"/>
<g class="ln live" filter="url(#fire)">${echoes}</g>
<g class="ln still" filter="url(#fireStill)">${still}</g>
<rect width="${W}" height="${H}" fill="url(#shade)"/>
${liveLine}
<use href="#sw" class="ln still" style="--ve:non-scaling-stroke" stroke-width="2.2" transform="translate(0 ${CY})"/>
${hud.join('\n')}
</g>
</svg>
`;
  return svg;
}

// ---------------------------------------------------------------------------
// The setup card: the four palettes as indexed swatches, and the eight flow
// maps drawn as arrow fields (where each point of the screen is carried in
// half a second), each in the palette that is up during its bar. Static.
// ---------------------------------------------------------------------------
function buildCard() {
  const CW = 1280, CH = 416, PX = 3;
  let clips = '';
  const used = new Set();
  const line = (str, x, y, cls = 'tx') => `<g class="${cls}">` + [...str].map((ch, i) => {
    if (ch === ' ') return '';
    used.add(ch);
    return `<use href="#g${ch.charCodeAt(0)}" x="${fx(x + i * ADV * PX)}" y="${fx(y)}"/>`;
  }).join('') + '</g>';
  const rline = (str, xr, y, cls) => line(str, xr - textWidth(str, PX), y, cls);
  let body = '';
  // palettes
  body += line('PALETTES', 32, 28);
  PALETTES.forEach((p, i) => {
    const y = 70 + i * 86;
    body += line(`${i + 1} ${p.name}`, 32, y, 'tx dim');
    body += rline(`BARS ${13 + i * 2}-${14 + i * 2}`, 428, y, 'tx faint');
    p.ramp.forEach((c, j) => {
      body += `<rect x="${32 + j * 44}" y="${y + 28}" width="42" height="34" fill="${c}"${j === 0 ? ' stroke="#3a3632" stroke-width="2"' : ''}/>`;
    });
  });
  // flows
  body += line('FLOWS, ONE PER BAR: HALF A SECOND OF DRAG', 488, 28);
  const TW = 178, TH = 104, GX = 488, GY = 66, GAP = 16;
  const k = TW / W;                       // uniform scale, tile centred on the line
  FLOWS.forEach((f, i) => {
    const col = i % 4, row = Math.floor(i / 4);
    const x0 = GX + col * (TW + GAP), y0 = GY + row * (TH + 64);
    const ramp = PALETTES[Math.floor(i / 2)].ramp;
    const toTile = (px, py) => [x0 + px * k, y0 + TH / 2 + (py - CY) * k];
    const step = stepMap(f, 0.5);
    let arrows = '';
    const rows = 4, cols = 6;
    for (let gy = 0; gy < rows; gy++) {
      for (let gx = 0; gx < cols; gx++) {
        const px = (gx + 0.5) * (W / cols);
        const py = CY + ((gy + 0.5) / rows - 0.5) * (TH / k);
        const qx = step[0] * px + step[2] * py + step[4], qy = step[1] * px + step[3] * py + step[5];
        const [ax, ay] = toTile(px, py), [bx, by] = toTile(qx, qy);
        const len = Math.hypot(bx - ax, by - ay);
        if (len < 1.5) { arrows += `M${fx(ax)} ${fx(ay)}h.1`; continue; }
        const ux = (bx - ax) / len, uy = (by - ay) / len;
        arrows += `M${fx(ax)} ${fx(ay)}L${fx(bx)} ${fx(by)}`
          + `M${fx(bx - ux * 5 - uy * 3.5)} ${fx(by - uy * 5 + ux * 3.5)}L${fx(bx)} ${fx(by)}L${fx(bx - ux * 5 + uy * 3.5)} ${fx(by - uy * 5 - ux * 3.5)}`;
      }
    }
    const [, base] = toTile(0, CY);
    clips += `<clipPath id="t${i}"><rect x="${x0 + 2}" y="${y0 + 2}" width="${TW - 4}" height="${TH - 4}"/></clipPath>`;
    body += `<rect x="${x0}" y="${y0}" width="${TW}" height="${TH}" fill="#000" stroke="${ramp[3]}" stroke-width="2"/>`
      + `<path d="M${x0 + 2} ${fx(base)}h${TW - 4}" stroke="${ramp[4]}" stroke-width="2"/>`
      + `<path clip-path="url(#t${i})" d="${arrows}" fill="none" stroke="${ramp[6]}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
    body += line(`BAR ${13 + i}`, x0, y0 + TH + 10, 'tx faint');
    body += line(f.name, x0, y0 + TH + 36, 'tx dim');
  });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CW} ${CH}" width="${CW}" height="${CH}" role="img" aria-label="The setup: four palettes, CORAL, KUMARA, LAGOON and MANGO, each nine steps from black to white, two bars each; and the eight flow maps, one per bar, drawn as arrow fields: SWELL pushes outward, WHIRLPOOL turns clockwise, HEAT HAZE lifts, EDDY turns back, TRADE WIND blows left, UNDERTOW pulls right and down, HEAT HAZE again, SWELL again.">
<style>.tx{fill:#fff}.dim{fill:#e9e4dc}.faint{fill:#9a948c}</style>
<defs>${[...used].map((ch) => `<path id="g${ch.charCodeAt(0)}" d="${textPath(ch, 0, 0, PX)}"/>`).join('')}${clips}</defs>
<rect width="${CW}" height="${CH}" rx="14" fill="#000"/>
${body}
</svg>
`;
  return svg;
}

const banner = buildBanner();
const outPath = OUT ? path.resolve(OUT) : path.join(ASSETS, `${SLUG}.svg`);
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, banner);
console.log(`${path.relative(process.cwd(), outPath)}  ${(banner.length / 1024).toFixed(1)} KB`);
if (!OUT) {
  const card = buildCard();
  const cardPath = path.join(ASSETS, `${SLUG}-setup.svg`);
  fs.writeFileSync(cardPath, card);
  console.log(`${path.relative(process.cwd(), cardPath)}  ${(card.length / 1024).toFixed(1)} KB`);
}
