#!/usr/bin/env node
// Cyberpunk neon signage: README header generator for CASTAWAY.
//
//   node examples/castaway/src/66-neon-signage_opus_5.5.mjs
//
// Writes examples/castaway/assets/66-neon-signage_opus_5.5.svg. Plain Node,
// no dependencies, no clock, no Math.random: the same bytes every run. The
// .md beside the assets is hand-written, not generated.
//
// The style (catalogue entry vap-18, "cyberpunk neon signage") is the dense,
// rain-wet street of stacked illuminated signs: glass-tube lettering with a
// white-hot core and a coloured halo on dark panels, vertical blade signs
// mixing Latin capitals with kanji and katakana, one tube that will not stay
// lit, a billboard cycling its frames, small machine-readable labels, thin
// diagonal rain and the whole lot mirrored in a wet street.
//
// What changed for Castaway: the project has a rule that it is always
// daytime, so this is not night. It is noon, in an alley so narrow and so
// crowded with signs that the sun never gets in. At the far end the alley
// opens on the sea in full daylight, and out there is the island: one tall
// palm, a raft, and her. Every so often she walks over the water to the
// quay, turns the corner to the iced coffee place (the amber blade sign on
// the right), and walks back out to the island with one. The rain is a sun
// shower. The signs:
//   * CASTAWAY in pink tube capitals on a dark panel. The crossbar of the
//     second A flickers (on, off, on, long on); everything else hums.
//   * "open all day" in amber tube lowercase under it, which is just the
//     project rule, written as shop hours.
//   * Left blade, cyan: POP. 1 over ほぼ無人島 (hobo mujintou, "an almost
//     uninhabited island"). Right blade, amber: ICED COFFEE over
//     アイスコーヒー (aisu koohii, iced coffee), with its long-vowel marks
//     turned upright, as they are in vertical Japanese.
//   * A billboard cycling three frames on the bar lines: the shark in
//     headphones, every sound made from code, and the four timers.
//   * A red LED queue display: NOW SERVING 001 (there is one customer),
//     then the real command and the local address.
//   * A tenants' directory of gags, a green 80 BPM tube, and a hazard plate
//     that says ALWAYS DAYTIME.
//
// Timing is in beats of the 80 BPM theme (0.75 s); the story loops every
// 27 s (9 bars of 3 s):
//    0-6 s   she stands on the island
//    6-12    she walks over the water to the quay and turns the corner
//   12-15    gone (getting coffee)
//   15-21    she walks back out to the island, seen from behind
//   21-27    on the island again
// The billboard cuts frames at 0, 9 and 18 s. The flickering stroke runs on
// its own uneven 6.75 s cycle; rain, splashes and reflections loop on their
// own short periods. With prefers-reduced-motion everything holds a complete
// frame: every sign lit, billboard on the shark, her on the island.
//
// No <text>: every letter is drawn here. The tube capitals and lowercase are
// arcs and lines, the kanji and kana are stroke paths written for this file
// (stroke order and shapes checked against standard forms), the small labels
// are a stroke font on a 4 x 6 grid, and the LED display is a 5 x 7 dot font.
// Blur filters are used only for the tube halos and the street reflection,
// each limited to its own region. Nothing here is traced from any film, game,
// real sign, brand or the project's own art.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '66-neon-signage_opus_5.5';
const OUT = path.resolve(here, `../assets/${SLUG}.svg`);

// ------------------------------------------------------------------ canvas
const W = 960;
const H = 500;
const HZ = 286; // horizon (eye level); the vanishing point is (VPX, HZ)
const VPX = 480;
const FL = 345; // far floor line: the quay at the end of the alley
const OPEN = { x0: 404, x1: 556, y0: 166, y1: FL }; // the daylight at the end
const floorX = (y, side) => VPX + ((side < 0 ? OPEN.x0 : OPEN.x1) - VPX) * (y - HZ) / (FL - HZ);
const BEAT = 0.75;
const LOOP = 27;
// The video's frame rate, from [video] fps in castaway/activities.toml (it
// moved from 30 to 24 on 2026-10-01; check it there before regenerating).
const FPS = 24;

// ----------------------------------------------------------------- helpers
const f = (n, d = 1) => {
  const v = +(+n).toFixed(d);
  return Object.is(v, -0) ? '0' : String(v);
};
const f2 = (n) => f(n, 2);
function mulberry32(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const lerp = (a, b, t) => a + (b - a) * t;
const pc = (t, period = LOOP) => `${f((t / period) * 100, 3)}%`;
function kf(name, frames, period = LOOP) {
  return `@keyframes ${name}{${frames.map(([t, css]) => `${pc(t, period)}{${css}}`).join('')}}`;
}
// Scale an absolute path written in a local grid (M L Q C Z only, number
// pairs) into place: x' = ox + x * sx, y' = oy + y * sy.
function place(d, ox, oy, sx, sy = sx) {
  let i = 0;
  return d.replace(/-?\d*\.?\d+/g, (m) => {
    const v = +m;
    const out = i % 2 === 0 ? ox + v * sx : oy + v * sy;
    i++;
    return f(out);
  }).replace(/\s*([MLQCZ])\s*/g, '$1').replace(/\s+/g, ' ');
}

// ------------------------------------------------------------- stroke font
// Small capitals and lowercase on a 4 x 6 grid (descenders to 8), chamfered
// corners, drawn as strokes. Used for labels, the billboard, the plates and
// (thickened) for the small tube signs.
const SF = {
  A: [[[0, 6], [0, 1], [1, 0], [3, 0], [4, 1], [4, 6]], [[0, 3.4], [4, 3.4]]],
  B: [[[0, 0], [3, 0], [4, 1], [4, 2], [3, 3], [0, 3]], [[3, 3], [4, 4], [4, 5], [3, 6], [0, 6], [0, 0]]],
  C: [[[4, 1], [3, 0], [1, 0], [0, 1], [0, 5], [1, 6], [3, 6], [4, 5]]],
  D: [[[0, 0], [3, 0], [4, 1], [4, 5], [3, 6], [0, 6], [0, 0]]],
  E: [[[4, 0], [0, 0], [0, 6], [4, 6]], [[0, 3], [3, 3]]],
  F: [[[4, 0], [0, 0], [0, 6]], [[0, 3], [3, 3]]],
  G: [[[4, 1], [3, 0], [1, 0], [0, 1], [0, 5], [1, 6], [3, 6], [4, 5], [4, 3.2], [2.2, 3.2]]],
  H: [[[0, 0], [0, 6]], [[4, 0], [4, 6]], [[0, 3], [4, 3]]],
  I: [[[1, 0], [3, 0]], [[2, 0], [2, 6]], [[1, 6], [3, 6]]],
  J: [[[4, 0], [4, 5], [3, 6], [1, 6], [0, 5]]],
  K: [[[0, 0], [0, 6]], [[4, 0], [1, 3], [0, 3]], [[1, 3], [4, 6]]],
  L: [[[0, 0], [0, 6], [4, 6]]],
  M: [[[0, 6], [0, 0], [2, 2.6], [4, 0], [4, 6]]],
  N: [[[0, 6], [0, 0], [4, 6], [4, 0]]],
  O: [[[1, 0], [3, 0], [4, 1], [4, 5], [3, 6], [1, 6], [0, 5], [0, 1], [1, 0]]],
  P: [[[0, 6], [0, 0], [3, 0], [4, 1], [4, 2], [3, 3], [0, 3]]],
  Q: [[[1, 0], [3, 0], [4, 1], [4, 5], [3, 6], [1, 6], [0, 5], [0, 1], [1, 0]], [[2.6, 4.6], [4.2, 6.4]]],
  R: [[[0, 6], [0, 0], [3, 0], [4, 1], [4, 2], [3, 3], [0, 3]], [[2, 3], [4, 6]]],
  S: [[[4, 1], [3, 0], [1, 0], [0, 1], [0, 2], [1, 3], [3, 3], [4, 4], [4, 5], [3, 6], [1, 6], [0, 5]]],
  T: [[[0, 0], [4, 0]], [[2, 0], [2, 6]]],
  U: [[[0, 0], [0, 5], [1, 6], [3, 6], [4, 5], [4, 0]]],
  V: [[[0, 0], [0, 3], [2, 6], [4, 3], [4, 0]]],
  W: [[[0, 0], [0, 6], [2, 4], [4, 6], [4, 0]]],
  X: [[[0, 0], [4, 6]], [[4, 0], [0, 6]]],
  Y: [[[0, 0], [2, 3], [4, 0]], [[2, 3], [2, 6]]],
  Z: [[[0, 0], [4, 0], [0, 6], [4, 6]]],
  a: [[[4, 2], [4, 6]], [[4, 3], [3, 2], [1, 2], [0, 3], [0, 5], [1, 6], [3, 6], [4, 5]]],
  b: [[[0, 0], [0, 6]], [[0, 3], [1, 2], [3, 2], [4, 3], [4, 5], [3, 6], [1, 6], [0, 5]]],
  c: [[[4, 2.8], [3.2, 2], [1, 2], [0, 3], [0, 5], [1, 6], [3.2, 6], [4, 5.2]]],
  d: [[[4, 0], [4, 6]], [[4, 3], [3, 2], [1, 2], [0, 3], [0, 5], [1, 6], [3, 6], [4, 5]]],
  e: [[[0, 4], [4, 4], [4, 3], [3, 2], [1, 2], [0, 3], [0, 5], [1, 6], [3.4, 6]]],
  f: [[[3.8, 0.4], [3.2, 0], [2.4, 0], [1.6, 0.8], [1.6, 6]], [[0.2, 2.4], [3.4, 2.4]]],
  g: [[[4, 2], [4, 7], [3, 8], [1, 8]], [[4, 3], [3, 2], [1, 2], [0, 3], [0, 4.6], [1, 5.6], [3, 5.6], [4, 4.6]]],
  h: [[[0, 0], [0, 6]], [[0, 3], [1, 2], [3, 2], [4, 3], [4, 6]]],
  i: [[[2, 2], [2, 6]], [[2, 0.5], [2, 0.5]]],
  j: [[[3, 2], [3, 7], [2, 8], [0.8, 8]], [[3, 0.5], [3, 0.5]]],
  k: [[[0, 0], [0, 6]], [[3.6, 2], [0, 4.4]], [[1.4, 3.6], [4, 6]]],
  l: [[[1.4, 0], [1.4, 5], [2.4, 6], [3.2, 6]]],
  m: [[[0, 6], [0, 2]], [[0, 3], [0.8, 2], [1.3, 2], [2, 3], [2, 6]], [[2, 3], [2.7, 2], [3.2, 2], [4, 3], [4, 6]]],
  n: [[[0, 2], [0, 6]], [[0, 3], [1, 2], [3, 2], [4, 3], [4, 6]]],
  o: [[[1, 2], [3, 2], [4, 3], [4, 5], [3, 6], [1, 6], [0, 5], [0, 3], [1, 2]]],
  p: [[[0, 2], [0, 8]], [[0, 3], [1, 2], [3, 2], [4, 3], [4, 5], [3, 6], [1, 6], [0, 5]]],
  q: [[[4, 2], [4, 8]], [[4, 3], [3, 2], [1, 2], [0, 3], [0, 5], [1, 6], [3, 6], [4, 5]]],
  r: [[[0, 2], [0, 6]], [[0, 3.6], [1.6, 2], [3.6, 2]]],
  s: [[[4, 2.6], [3.4, 2], [0.8, 2], [0, 2.8], [0.6, 3.6], [3.4, 4.4], [4, 5.2], [3.2, 6], [0.6, 6], [0, 5.4]]],
  t: [[[1.6, 0.6], [1.6, 5], [2.6, 6], [3.6, 6]], [[0, 2], [3.4, 2]]],
  u: [[[0, 2], [0, 5], [1, 6], [3, 6], [4, 5]], [[4, 2], [4, 6]]],
  v: [[[0, 2], [2, 6], [4, 2]]],
  w: [[[0, 2], [1, 6], [2, 3.4], [3, 6], [4, 2]]],
  x: [[[0, 2], [4, 6]], [[4, 2], [0, 6]]],
  y: [[[0, 2], [2, 5.8]], [[4, 2], [1.2, 8]]],
  z: [[[0, 2], [4, 2], [0, 6], [4, 6]]],
  0: [[[1, 0], [3, 0], [4, 1], [4, 5], [3, 6], [1, 6], [0, 5], [0, 1], [1, 0]], [[3.2, 1.2], [0.8, 4.8]]],
  1: [[[0.8, 1.2], [2, 0], [2, 6]], [[0.8, 6], [3.2, 6]]],
  2: [[[0, 1], [1, 0], [3, 0], [4, 1], [4, 2], [0, 6], [4, 6]]],
  3: [[[0, 0], [4, 0], [2, 2.4], [3, 2.4], [4, 3.4], [4, 5], [3, 6], [1, 6], [0, 5]]],
  4: [[[3, 6], [3, 0], [0, 4], [4, 4]]],
  5: [[[4, 0], [0, 0], [0, 3], [3, 3], [4, 4], [4, 5], [3, 6], [0, 6]]],
  6: [[[3, 0], [1, 0], [0, 1], [0, 5], [1, 6], [3, 6], [4, 5], [4, 4], [3, 3], [0, 3]]],
  7: [[[0, 0], [4, 0], [4, 1], [1.4, 6]]],
  8: [[[1, 3], [0, 2], [0, 1], [1, 0], [3, 0], [4, 1], [4, 2], [3, 3], [1, 3], [0, 4], [0, 5], [1, 6], [3, 6], [4, 5], [4, 4], [3, 3]]],
  9: [[[4, 3], [1, 3], [0, 2], [0, 1], [1, 0], [3, 0], [4, 1], [4, 5], [3, 6], [1, 6]]],
  '.': [[[2, 6], [2, 6]]],
  ':': [[[2, 1.8], [2, 1.8]], [[2, 5.2], [2, 5.2]]],
  '·': [[[2, 3], [2, 3]]],
  '-': [[[1, 3], [3, 3]]],
  '+': [[[2, 1.2], [2, 4.8]], [[0.2, 3], [3.8, 3]]],
  '/': [[[0.4, 6], [3.6, 0]]],
  ',': [[[2.2, 5.4], [1.4, 7]]],
  '(': [[[3, 0], [1.6, 1.4], [1.6, 4.6], [3, 6]]],
  ')': [[[1, 0], [2.4, 1.4], [2.4, 4.6], [1, 6]]],
  "'": [[[2, 0], [2, 1.6]]],
  '!': [[[2, 0], [2, 4]], [[2, 6], [2, 6]]],
  '>': [[[0.6, 1], [3.4, 3], [0.6, 5]]],
  '<': [[[3.4, 1], [0.6, 3], [3.4, 5]]],
  '=': [[[0.4, 2.2], [3.6, 2.2]], [[0.4, 3.8], [3.6, 3.8]]],
  '%': [[[0.4, 6], [3.6, 0]], [[0.8, 0.8], [0.8, 0.8]], [[3.2, 5.2], [3.2, 5.2]]],
  '♪': [[[2.6, 4.8], [2.6, 0], [4, 1.2], [4, 2.4]], [[2.6, 4.8], [1.8, 6], [0.8, 6], [0.4, 5.2], [1.2, 4.4], [2.6, 4.8]]],
  '_': [[[0, 6.6], [4, 6.6]]],
  '~': [[[0, 3.6], [0.9, 2.7], [2, 3.2], [3.1, 3.5], [4, 2.6]]],
  '→': [[[0, 3], [4, 3]], [[2.4, 1.4], [4, 3], [2.4, 4.6]]],
  '←': [[[4, 3], [0, 3]], [[1.6, 1.4], [0, 3], [1.6, 4.6]]],
  ' ': [],
};
// Path data for a line of text. size = cap height; wide stretches glyphs
// (not the tracking), for the extended "machine" look on the billboard.
function textW(str, size, track = 2, wide = 1) {
  const s = size / 6;
  return [...str].length * (4 * wide + track) * s - track * s;
}
function textD(str, x, y, size, { track = 2, align = 'left', wide = 1 } = {}) {
  const s = size / 6;
  const adv = (4 * wide + track) * s;
  const width = textW(str, size, track, wide);
  let x0 = align === 'left' ? x : align === 'right' ? x - width : x - width / 2;
  let d = '';
  for (const ch of str) {
    const g = SF[ch];
    if (!g) throw new Error(`no glyph for "${ch}"`);
    for (const st of g) {
      d += `M${st.map((p) => `${f(x0 + p[0] * s * wide)} ${f(y + p[1] * s)}`).join('L')}`;
      if (st.length === 2 && st[0][0] === st[1][0] && st[0][1] === st[1][1]) d += 'h.01';
    }
    x0 += adv;
  }
  return d;
}

// ------------------------------------------------------------ LED 5x7 font
// Rows of 5 dots; lowercase may use rows 7-8 for descenders.
const LED = {
  ' ': [],
  0: ['.###.', '#...#', '#..##', '#.#.#', '##..#', '#...#', '.###.'],
  1: ['..#..', '.##..', '..#..', '..#..', '..#..', '..#..', '.###.'],
  2: ['.###.', '#...#', '....#', '...#.', '..#..', '.#...', '#####'],
  5: ['#####', '#....', '####.', '....#', '....#', '#...#', '.###.'],
  6: ['..##.', '.#...', '#....', '####.', '#...#', '#...#', '.###.'],
  7: ['#####', '....#', '...#.', '..#..', '.#...', '.#...', '.#...'],
  8: ['.###.', '#...#', '#...#', '.###.', '#...#', '#...#', '.###.'],
  '.': ['.....', '.....', '.....', '.....', '.....', '.##..', '.##..'],
  ':': ['.....', '.##..', '.##..', '.....', '.##..', '.##..', '.....'],
  '/': ['.....', '....#', '...#.', '..#..', '.#...', '#....', '.....'],
  '>': ['.#...', '..#..', '...#.', '....#', '...#.', '..#..', '.#...'],
  N: ['#...#', '##..#', '#.#.#', '#..##', '#...#', '#...#', '#...#'],
  O: ['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  W: ['#...#', '#...#', '#...#', '#.#.#', '#.#.#', '#.#.#', '.#.#.'],
  S: ['.####', '#....', '#....', '.###.', '....#', '....#', '####.'],
  E: ['#####', '#....', '#....', '####.', '#....', '#....', '#####'],
  R: ['####.', '#...#', '#...#', '####.', '#.#..', '#..#.', '#...#'],
  V: ['#...#', '#...#', '#...#', '#...#', '#...#', '.#.#.', '..#..'],
  I: ['.###.', '..#..', '..#..', '..#..', '..#..', '..#..', '.###.'],
  G: ['.###.', '#...#', '#....', '#.###', '#...#', '#...#', '.####'],
  p: ['.....', '.....', '####.', '#...#', '#...#', '#...#', '####.', '#....', '#....'],
  y: ['.....', '.....', '#...#', '#...#', '#...#', '#..##', '.##.#', '....#', '.###.'],
  t: ['.#...', '.#...', '####.', '.#...', '.#...', '.#..#', '..##.'],
  h: ['#....', '#....', '#.##.', '##..#', '#...#', '#...#', '#...#'],
  o: ['.....', '.....', '.###.', '#...#', '#...#', '#...#', '.###.'],
  n: ['.....', '.....', '#.##.', '##..#', '#...#', '#...#', '#...#'],
  l: ['.##..', '..#..', '..#..', '..#..', '..#..', '..#..', '.###.'],
  s: ['.....', '.....', '.####', '#....', '.###.', '....#', '####.'],
  e: ['.....', '.....', '.###.', '#...#', '#####', '#....', '.###.'],
  r: ['.....', '.....', '#.##.', '##..#', '#....', '#....', '#....'],
  v: ['.....', '.....', '#...#', '#...#', '#...#', '.#.#.', '..#..'],
};
// Dots as zero-length round-capped strokes: "M x y h0" each.
function ledD(str, x, y, p) {
  let d = '';
  let cx = x;
  for (const ch of str) {
    const g = LED[ch];
    if (!g) throw new Error(`no LED glyph for "${ch}"`);
    g.forEach((row, r) => {
      [...row].forEach((c, k) => { if (c === '#') d += `M${f(cx + k * p)} ${f(y + r * p)}h0`; });
    });
    cx += 6 * p;
  }
  return d;
}

// --------------------------------------------------------- tube capitals
// Monoline capitals, bent the way tube bends: 80 units tall, centrelines.
// Each letter is a list of tube pieces. Commands: ['M',x,y] ['H',x] ['V',y]
// ['L',x,y] ['A',r,sweep,x,y].
const CAPS = {
  C: { w: 56, p: [[['M', 56, 0], ['H', 20], ['A', 20, 0, 0, 20], ['V', 60], ['A', 20, 0, 20, 80], ['H', 56]]] },
  A: { w: 56, p: [[['M', 0, 80], ['V', 20], ['A', 20, 1, 20, 0], ['H', 36], ['A', 20, 1, 56, 20], ['V', 80]], [['M', 0, 46], ['H', 56]]] },
  S: { w: 56, p: [[['M', 54, 0], ['H', 20], ['A', 20, 0, 20, 40], ['H', 36], ['A', 20, 1, 36, 80], ['H', 2]]] },
  T: { w: 56, p: [[['M', 0, 0], ['H', 56]], [['M', 28, 0], ['V', 80]]] },
  W: { w: 80, p: [[['M', 0, 0], ['V', 62], ['A', 18, 0, 18, 80], ['H', 22], ['A', 18, 0, 40, 62], ['V', 28]], [['M', 40, 62], ['A', 18, 0, 58, 80], ['H', 62], ['A', 18, 0, 80, 62], ['V', 0]]] },
  Y: { w: 56, p: [[['M', 0, 0], ['V', 18], ['A', 20, 0, 20, 38], ['H', 36], ['A', 20, 0, 56, 18], ['V', 0]], [['M', 28, 38], ['V', 80]]] },
};
function cmdD(cmds, ox, oy, s) {
  let d = '';
  for (const c of cmds) {
    if (c[0] === 'M') d += `M${f(ox + c[1] * s)} ${f(oy + c[2] * s)}`;
    else if (c[0] === 'L') d += `L${f(ox + c[1] * s)} ${f(oy + c[2] * s)}`;
    else if (c[0] === 'H') d += `H${f(ox + c[1] * s)}`;
    else if (c[0] === 'V') d += `V${f(oy + c[1] * s)}`;
    else d += `A${f(c[1] * s)} ${f(c[1] * s)} 0 0 ${c[2]} ${f(ox + c[3] * s)} ${f(oy + c[4] * s)}`;
  }
  return d;
}

// ------------------------------------------------------ tube lowercase
// Geometric monoline lowercase: x-height 40 units (y 0..40), ascenders to
// -26, descenders to 64. Big arcs written with the large-arc flag.
const LOW = {
  o: { w: 40, d: 'M20 0A20 20 0 1 1 20 40A20 20 0 1 1 20 0' },
  p: { w: 40, d: 'M0 2V64M0 20A20 20 0 1 1 20 40A20 20 0 0 1 0 20' },
  e: { w: 40, d: 'M1 20H40A20 20 0 1 0 34.1 34.1' },
  n: { w: 40, d: 'M0 0V40M0 20A20 20 0 0 1 40 20V40' },
  a: { w: 40, d: 'M40 0V40M40 20A20 20 0 1 0 0 20A20 20 0 1 0 40 20' },
  l: { w: 10, d: 'M0 -26V30A10 10 0 0 0 10 40' },
  d: { w: 40, d: 'M40 -26V40M40 20A20 20 0 1 0 0 20A20 20 0 1 0 40 20' },
  y: { w: 40, d: 'M0 0V18A20 20 0 0 0 40 18M40 0V50A14 14 0 0 1 26 64H12' },
};
function lowD(str, x, y, s, gap = 13, space = 26) {
  let cx = x;
  let d = '';
  for (const ch of str) {
    if (ch === ' ') { cx += space * s; continue; }
    const g = LOW[ch];
    // scale the glyph's own path: arcs need their radii scaled too
    d += g.d.replace(/([MHVA])([^MHVA]*)/g, (m, c, args) => {
      const n = args.trim().split(/[\s,]+/).map(Number);
      if (c === 'M') return `M${f(cx + n[0] * s)} ${f(y + n[1] * s)}`;
      if (c === 'H') return `H${f(cx + n[0] * s)}`;
      if (c === 'V') return `V${f(y + n[0] * s)}`;
      return `A${f(n[0] * s)} ${f(n[1] * s)} 0 ${n[3]} ${n[4]} ${f(cx + n[5] * s)} ${f(y + n[6] * s)}`;
    });
    cx += (g.w + gap) * s;
  }
  return { d, width: cx - gap * s - x };
}
const lowWidth = (str, s, gap = 13, space = 26) => lowD(str, 0, 0, s, gap, space).width;

// ------------------------------------------------------- kanji and kana
// Stroke paths on a 10 x 10 grid, one string per tube piece, written for
// vertical setting. In vertical Japanese the long-vowel mark ー stands
// upright, so it is drawn as a vertical stroke here.
const KANA = {
  // ほ ho: left stroke, two bars, a stem that ends in a loop
  'ほ': ['M1.6 1.4Q1.2 5 1.8 9', 'M3.8 2.2L8.4 2.2', 'M3.8 4.8L8.4 4.8', 'M6.2 2.2L6.2 7.2Q6.2 9.4 4.6 9.1Q3.4 8.8 4.2 7.8Q5.6 6.8 8.8 8.9'],
  // ぼ bo: ほ with the two-tick voicing mark top right
  'ぼ': ['M1.4 1.6Q1 5 1.6 9', 'M3.4 2.4L7.6 2.4', 'M3.4 4.9L7.6 4.9', 'M5.6 2.4L5.6 7.2Q5.6 9.4 4.1 9.1Q2.9 8.8 3.7 7.8Q5 6.8 8 8.9', 'M8.2 0.4L8.9 1.6', 'M9.4 0.1L10 1.3'],
  // 無 mu: hat, top bar, long bar, four verticals, bottom bar, four dots
  '無': ['M3.6 0.2L1.9 2.6', 'M2.7 1.5L8.2 1.5', 'M1.1 3.9L8.9 3.9', 'M3 1.5L3 6.3', 'M4.4 1.5L4.4 6.3', 'M5.8 1.5L5.8 6.3', 'M7.2 1.5L7.2 6.3', 'M0.8 6.3L9.2 6.3', 'M1.9 7.7L1.2 9.3', 'M3.9 7.8L4.3 9.2', 'M6 7.8L6.5 9.2', 'M8 7.7L8.9 9.2'],
  // 人 hito: left sweep, right sweep
  '人': ['M5 0.4L5 3Q4.6 6.8 0.8 9.4', 'M5.1 3.8Q6.6 7.6 9.4 9.3'],
  // 島 shima: ノ, the 鳥 box with its long hooked stroke, 山 inside
  '島': ['M5.6 0L4.4 1', 'M2.6 1L2.6 5.4', 'M2.6 1L7.4 1L7.4 4.3', 'M2.6 2.1L7.4 2.1', 'M2.6 3.2L7.4 3.2', 'M2.6 4.3L7.4 4.3', 'M2.6 5.4L8.8 5.4L8.8 9Q8.8 9.7 7.9 9.4L7.2 9.1', 'M5 6.2L5 8.4', 'M3.2 6.8L3.2 8.4L6.8 8.4', 'M6.8 6.8L6.8 8.4'],
  // ア a, イ i, ス su, コ ko, ー (vertical), ヒ hi
  'ア': ['M1.4 1.6L8.6 1.6Q8 3.6 6.2 4.8', 'M4.9 3.1Q5.1 6.9 2 9.2'],
  'イ': ['M7.8 0.6Q5.2 4.6 1.2 6.4', 'M5.2 3.8L5.2 9.4'],
  'ス': ['M2 1.8L7.6 1.8Q6.6 6.2 1.2 9.2', 'M5.2 5.8L8.8 9'],
  'コ': ['M1.8 1.8L8 1.8L8 8.4', 'M1.8 8.4L8 8.4'],
  'ー': ['M5 1.2L5 8.8'],
  'ヒ': ['M2.4 4.6L7.8 3.4', 'M2.4 1L2.4 7.6Q2.4 8.7 3.6 8.7L8.6 8.7'],
};
function kanaD(str, x, y, size, pitch) {
  let d = '';
  [...str].forEach((ch, i) => {
    for (const st of KANA[ch]) d += place(st, x, y + i * pitch, size / 10);
  });
  return d;
}

// ------------------------------------------------------------ palette
const C = {
  ground: '#04100f',
  wallA: '#0a1c1f', wallB: '#071416',
  floor: '#030b0c',
  pinkH: '#ff1f9e', pinkT: '#ff4fc4', pinkI: '#ffb2e6',
  cyanH: '#00d4dc', cyanT: '#36f9f6', cyanI: '#c4fffd',
  ambH: '#ff8a00', ambT: '#ffb43a', ambI: '#ffe7b0',
  grnH: '#18e08a', grnT: '#72f1b8', grnI: '#d0ffe8',
  red: '#ff3a3a',
  skin: '#e3a57f', hair: '#4a2b19', top: '#ee7a63', shorts: '#f1e6cc', phones: '#f6eedb',
};

// ------------------------------------------------------- neon renderer
const defs = [];
const filters = [];
let fid = 0;
// Draw a glass-tube sign: shadow on the backing, blurred halo, coloured
// tube, pale inner and white-hot core. geometry is stored once in <defs>.
function neon(d, col, { w = 4.6, halo = 10, blur = 5, box, shadow = true, cls = '', unlit = false, under = '' } = {}) {
  const id = `n${fid++}`;
  defs.push(`<path id="${id}" d="${d}"/>`);
  const [bx0, by0, bx1, by1] = box;
  const pad = blur * 3 + halo * 1.2;
  filters.push(`<filter id="f${id}" filterUnits="userSpaceOnUse" x="${f(bx0 - pad)}" y="${f(by0 - pad)}" width="${f(bx1 - bx0 + pad * 2)}" height="${f(by1 - by0 + pad * 2)}"><feGaussianBlur stdDeviation="${blur}"/></filter>`);
  let s = '';
  if (unlit) s += `<use href="#${id}" class="dead" stroke-width="${f2(w * 0.9)}"/>`;
  if (shadow) s += `<use href="#${id}" class="sh" stroke-width="${f2(w)}" transform="translate(2.5 3.5)"/>`;
  s += `<g class="${cls}">`;
  s += `<g filter="url(#f${id})"><use href="#${id}" class="${col}H" stroke-width="${f2(halo * 2.2)}" opacity=".32"/><use href="#${id}" class="${col}H" stroke-width="${f2(halo)}"/></g>`;
  s += under; // anything that sits between the glow and the glass (standoffs)
  s += `<use href="#${id}" class="${col}T" stroke-width="${f2(w)}"/>`;
  s += `<use href="#${id}" class="${col}I" stroke-width="${f2(w * 0.48)}"/>`;
  s += `<use href="#${id}" class="core" stroke-width="${f2(w * 0.2)}"/>`;
  s += '</g>';
  return { svg: s, id };
}
// A soft pool of light on the wall behind a sign (no filter: a gradient).
const glows = new Set();
function wallGlow(cx, cy, rx, ry, col, op) {
  glows.add(col);
  return `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(rx)}" ry="${f(ry)}" fill="url(#gl-${col})" opacity="${op}"/>`;
}

// ================================================================ scene
const css = [];
const parts = [];
const reflect = []; // what the wet street mirrors (simple coloured shapes)

// ---------------------------------------------------------- background
function background() {
  let s = `<rect width="${W}" height="${H}" fill="${C.ground}"/>`;
  // walls: left and right planes converging on the far end
  const yTopL = HZ + (0 - HZ) * (VPX - 0) / (VPX - OPEN.x0); // not used: walls run off the top
  void yTopL;
  s += `<path d="M0 0H${OPEN.x0}V${OPEN.y1}L${f(floorX(H, -1))} ${H}H0Z" fill="url(#wallL)"/>`;
  s += `<path d="M${W} 0H${OPEN.x1}V${OPEN.y1}L${f(floorX(H, 1))} ${H}H${W}Z" fill="url(#wallR)"/>`;
  // the street
  s += `<path d="M${OPEN.x0} ${FL}H${OPEN.x1}L${f(floorX(H, 1))} ${H}H${f(floorX(H, -1))}Z" fill="url(#street)"/>`;
  // wall structure: ledges and pipes running to the vanishing point
  const lines = [];
  const toVP = (x, y, x2) => { const t = (x2 - VPX) / (x - VPX); return [x2, HZ + (y - HZ) * t]; };
  for (const ye of [182, 204, 226, 300, 318, 334]) {
    const [, yl] = toVP(OPEN.x0, ye, 0);
    lines.push(`M0 ${f(yl)}L${OPEN.x0} ${ye}`);
    const [, yr] = toVP(OPEN.x1, ye, W);
    lines.push(`M${W} ${f(yr)}L${OPEN.x1} ${ye}`);
  }
  s += `<path d="${lines.join('')}" class="ledge"/>`;
  // building joints: verticals that crowd together toward the far end
  const vx = [];
  for (let k = 1; k <= 7; k++) {
    const u = 1 - 1 / (1 + k * 0.55);
    const xl = lerp(0, OPEN.x0, u);
    const xr = lerp(W, OPEN.x1, u);
    const yb = (x) => HZ + (FL - HZ) * (x - VPX) / (OPEN.x0 - VPX);
    vx.push(`M${f(xl)} 0V${f(Math.min(H, yb(xl)))}`);
    vx.push(`M${f(xr)} 0V${f(Math.min(H, HZ + (FL - HZ) * (xr - VPX) / (OPEN.x1 - VPX)))}`);
  }
  s += `<path d="${vx.join('')}" class="joint"/>`;
  // a run of shutters at street level on each side
  const shutter = (side) => {
    let d = '';
    const xa = side < 0 ? 210 : W - 210;
    const xb = side < 0 ? 330 : W - 330;
    const top = (x) => HZ + (318 - HZ) * (x - VPX) / ((side < 0 ? OPEN.x0 : OPEN.x1) - VPX);
    const bot = (x) => HZ + (FL - HZ) * (x - VPX) / ((side < 0 ? OPEN.x0 : OPEN.x1) - VPX);
    for (let i = 0; i <= 9; i++) {
      const t = i / 9;
      const yA = lerp(top(xa), bot(xa), t);
      const yB = lerp(top(xb), bot(xb), t);
      d += `M${f(xa)} ${f(yA)}L${f(xb)} ${f(yB)}`;
    }
    return d;
  };
  s += `<path d="${shutter(-1)}${shutter(1)}" class="shut"/>`;
  // overhead: a walkway across the alley above the far end, and cables
  s += `<path d="M${OPEN.x0 - 30} ${OPEN.y0 - 16}H${OPEN.x1 + 30}V${OPEN.y0 + 2}H${OPEN.x0 - 30}Z" fill="#061113"/>`;
  s += `<path d="M${OPEN.x0 - 30} ${OPEN.y0 + 1.5}H${OPEN.x1 + 30}" stroke="#16343a" stroke-width="1"/>`;
  return s;
}

// ------------------------------------------------- the daylight at the end
// The sea at noon, seen past the quay: sky, a few clouds, the island with
// one tall palm and a raft, glints on the water, and her.
function herFigure(view, legs, cup) {
  // 32 units tall, feet at (0, 0). view: 'front' | 'back'. legs: 0 | 1 | 2.
  // cup: whether she has the iced coffee yet (only on the way back).
  const L = legs === 1 ? [-1.2, 0] : legs === 2 ? [0, -1.2] : [0, 0];
  let s = '';
  // legs and feet
  s += `<path d="M-3 ${-11}h2v${11 + L[0]}h-2zM1 ${-11}h2v${11 + L[1]}h-2z" fill="${C.skin}"/>`;
  // shorts
  s += `<path d="M-4.2 -15.6h8.4l.4 5.2h-4.1l-.5-1.4-.5 1.4h-4.1z" fill="${C.shorts}"/>`;
  // tank top
  s += `<path d="M-3.9 -23.2h7.8l.3 7.8h-8.4z" fill="${C.top}"/>`;
  // arms. With the coffee, one arm is bent to hold it in her left hand:
  // on the viewer's right from the front, on the viewer's left from behind.
  let arms = '';
  if (cup) {
    arms += `<path d="M-5.8 -22.6h1.9v8.6h-1.9zM3.9 -22.6h1.9v5.4l1.6 1.4-1.1 1.2-2.4-2.2z" fill="${C.skin}"/>`;
    // iced coffee: clear cup, coffee, a white lid and straw
    arms += `<path d="M5.6 -19.6h3.6l-.5 5h-2.6z" fill="#9c6a45"/><path d="M5.3 -20.4h4.2v.9h-4.2z" fill="#f4f1ea"/><path d="M7.4 -20.4l.7-2.8" stroke="#f4f1ea" stroke-width=".7"/>`;
  } else {
    arms += `<path d="M-5.8 -22.6h1.9v8.6h-1.9zM3.9 -22.6h1.9v8.6h-1.9z" fill="${C.skin}"/>`;
  }
  s += view === 'back' && cup ? `<g transform="scale(-1 1)">${arms}</g>` : arms;
  // neck and head
  s += `<path d="M-1 -24.2h2v1.4h-2z" fill="${C.skin}"/>`;
  s += `<circle cx="0" cy="-27.6" r="4" fill="${view === 'back' ? C.hair : C.skin}"/>`;
  if (view === 'front') {
    s += `<path d="M-4.2 -27.4A4.2 4.4 0 0 1 4.2 -27.4L3.6 -28.6Q0 -30.2-3.6 -28.6Z" fill="${C.hair}"/>`;
    s += `<path d="M3.4 -24.2a1.5 1.5 0 1 0 .1 0z" fill="${C.hair}"/>`;
    s += `<path d="M-1.5 -27.2h.9v.9h-.9zM.6 -27.2h.9v.9h-.9z" fill="#3a2418"/>`;
  } else {
    s += `<circle cx="0" cy="-24.6" r="1.8" fill="#3d2414"/>`;
  }
  // headphones: band over the top, cups at the sides
  s += `<path d="M-4.3 -27.6A4.4 4.6 0 0 1 4.3 -27.6" fill="none" stroke="${C.phones}" stroke-width="1.1"/>`;
  s += `<path d="M-5.4 -29.4h1.9v3.6h-1.9zM3.5 -29.4h1.9v3.6h-1.9z" fill="${C.phones}"/>`;
  return s;
}
function opening() {
  const { x0, x1, y0, y1 } = OPEN;
  let s = `<g clip-path="url(#cOpen)">`;
  s += `<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${HZ - y0}" fill="url(#sky)"/>`;
  s += `<rect x="${x0}" y="${HZ}" width="${x1 - x0}" height="${y1 - HZ}" fill="url(#sea)"/>`;
  // clouds: overlapping puffs, lit from above
  const cloud = (cx, cy, k) => {
    const puffs = [[-14, 2, 7], [-6, -3, 9], [4, -5, 10], [13, -1, 8], [20, 3, 6], [-20, 4, 5]];
    let d = '';
    for (const [dx, dy, r] of puffs) d += `M${f(cx + (dx - r) * k)} ${f(cy + dy * k)}a${f(r * k)} ${f(r * k)} 0 1 1 ${f(2 * r * k)} 0a${f(r * k)} ${f(r * k)} 0 1 1 ${f(-2 * r * k)} 0`;
    const base = `M${f(cx - 22 * k)} ${f(cy + 2 * k)}h${f(44 * k)}a${f(3.5 * k)} ${f(3.5 * k)} 0 0 1 0 ${f(7 * k)}h${f(-44 * k)}a${f(3.5 * k)} ${f(3.5 * k)} 0 0 1 0 ${f(-7 * k)}z`;
    return `<path d="${d}${base}" fill="#d3ebf8" transform="translate(0 ${f(1.6 * k)})"/><path d="${d}${base}" fill="#ffffff"/>`;
  };
  s += cloud(436, 270, 0.85) + cloud(522, 250, 1.05) + cloud(474, 226, 0.55);
  s += `<rect x="${x0}" y="${HZ - 1}" width="${x1 - x0}" height="2" fill="#e8f8ff" opacity=".7"/>`;
  // glints on the water, twinkling in turn
  const rnd = mulberry32(1992);
  let gl = '';
  for (let i = 0; i < 16; i++) {
    const y = HZ + 4 + rnd() * (y1 - HZ - 8);
    const x = lerp(x0 + 4, x1 - 4, rnd());
    const w = 1.5 + (y - HZ) * 0.09;
    gl += `<path d="M${f(x)} ${f(y)}h${f(w)}" class="gl" style="animation-delay:-${f(rnd() * 3, 2)}s"/>`;
  }
  s += gl;
  // the island: sand, wet rim, bushes, a raft, one tall palm
  const IX = 492;
  const IY = 318;
  s += `<ellipse cx="${IX}" cy="${IY + 1.2}" rx="38" ry="6.6" fill="#c4f3f0" opacity=".85"/>`;
  s += `<ellipse cx="${IX}" cy="${IY}" rx="33" ry="5.2" fill="#efd59a"/>`;
  s += `<ellipse cx="${IX - 3}" cy="${IY - 1.2}" rx="24" ry="3" fill="#f8e8bf"/>`;
  s += `<path d="M${IX - 20} ${IY - 1}q3-6 8-1q4-5 7 0q3-3 5 1z" fill="#3f9c4c"/><path d="M${IX + 15} ${IY - 1}q3-5 6-1q2-3 5 1z" fill="#57b558"/>`;
  // the raft, pulled up off the left shore (out of her way to the quay)
  s += `<path d="M${IX - 57} ${IY + 2.4}l17 1.6-.9 3.4-17-1.6z" fill="#9a5b3c"/><path d="M${IX - 56} ${IY + 4.2}l16 1.5" stroke="#6e3c26" stroke-width=".7"/>`;
  // palm: a tall, slender, slightly curved trunk with segments, then fronds
  const tr = [[IX + 11, IY - 1], [IX + 13, IY - 22], [IX + 9, IY - 44], [IX + 1, IY - 64]];
  const trunk = `M${tr[0][0]} ${tr[0][1]}C${tr[1][0]} ${tr[1][1]} ${tr[2][0]} ${tr[2][1]} ${tr[3][0]} ${tr[3][1]}`;
  s += `<path d="${trunk}" stroke="#a8704c" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  s += `<path d="${trunk}" stroke="#7d4c31" stroke-width="3" fill="none" stroke-dasharray=".8 2.6"/>`;
  const cx = tr[3][0];
  const cy = tr[3][1];
  const fronds = [[-31, 10], [-23, -4], [-9, -12], [8, -11], [23, -4], [31, 11], [-16, 15], [17, 16]];
  let fr = '';
  for (const [dx, dy] of fronds) {
    const mx = cx + dx * 0.55;
    const my = cy + dy * 0.55 - 7;
    fr += `M${cx} ${cy}Q${f(mx)} ${f(my)} ${f(cx + dx)} ${f(cy + dy)}Q${f(mx + 1.2)} ${f(my + 4.4)} ${cx} ${cy}`;
  }
  s += `<path d="${fr}" fill="#3a9a47"/>`;
  s += `<path d="${fronds.map(([dx, dy]) => `M${cx} ${cy}Q${f(cx + dx * 0.55)} ${f(cy + dy * 0.55 - 7)} ${f(cx + dx)} ${f(cy + dy)}`).join('')}" stroke="#8fd662" stroke-width=".8" fill="none"/>`;
  s += `<circle cx="${cx + 1}" cy="${cy + 1.8}" r="1.9" fill="#6b4a2a"/><circle cx="${cx - 1.4}" cy="${cy + 2.2}" r="1.6" fill="#7a5532"/>`;
  // her: six poses, one shown at a time, moved in steps. She leaves empty-
  // handed and comes back with the coffee.
  s += `<g class="her">`;
  s += `<g class="p0">${herFigure('front', 0, false)}</g>`;
  s += `<g class="p1">${herFigure('front', 1, false)}</g>`;
  s += `<g class="p2">${herFigure('front', 2, false)}</g>`;
  s += `<g class="p3">${herFigure('back', 1, true)}</g>`;
  s += `<g class="p4">${herFigure('back', 2, true)}</g>`;
  s += `<g class="p5">${herFigure('front', 0, true)}</g>`;
  s += `</g>`;
  s += `</g>`;
  // quay edge and the building corners framing the view
  s += `<path d="M${x0} ${y1 - 1}H${x1}" stroke="#0d2a2e" stroke-width="2"/>`;
  return s;
}

// The walk, sampled every half beat. Feet positions on the sea plane: the
// scale follows depth (distance below the horizon).
const HOME = [480, 319];
const QUAY = [572, 343];
const S_HOME = 0.3;
const scaleAt = (y) => S_HOME * (y - HZ) / (HOME[1] - HZ);
function herState(t) {
  const step = 0.375;
  if (t < 6) return { x: HOME[0], y: HOME[1], pose: 0 };
  if (t >= 21) return { x: HOME[0], y: HOME[1], pose: 5 };
  if (t < 12) {
    const n = Math.floor((t - 6) / step); // 0..15
    const u = (n + 1) / 16;
    return { x: lerp(HOME[0], QUAY[0], u), y: lerp(HOME[1], QUAY[1], u), pose: 1 + (n % 2) };
  }
  if (t < 15) return null;
  const n = Math.floor((t - 15) / step);
  const u = 1 - n / 16;
  return { x: lerp(HOME[0], QUAY[0], u), y: lerp(HOME[1], QUAY[1], u), pose: 3 + (n % 2) };
}
function herCss() {
  const move = [];
  const NP = 6;
  const vis = Array.from({ length: NP }, () => []);
  for (let k = 0; k <= 72; k++) {
    const t = k * 0.375;
    const st = herState(t % LOOP);
    if (st) move.push([t, `transform:translate(${f(st.x)}px,${f(st.y)}px) scale(${f(scaleAt(st.y), 3)})`]);
    else move.push([t, `transform:translate(${f(QUAY[0] + 40)}px,${f(QUAY[1])}px) scale(.5)`]);
    for (let p = 0; p < NP; p++) vis[p].push([t, `opacity:${st && st.pose === p ? 1 : 0}`]);
  }
  // drop repeated frames
  const squash = (frames) => frames.filter((fr, i) => i === 0 || i === frames.length - 1 || fr[1] !== frames[i - 1][1]);
  css.push(kf('herMove', squash(move)));
  vis.forEach((v, p) => css.push(kf(`herP${p}`, squash(v))));
  css.push(`.her{transform:translate(${HOME[0]}px,${HOME[1]}px) scale(${S_HOME});animation:herMove ${LOOP}s steps(1,end) infinite}`);
  css.push('.p1,.p2,.p3,.p4,.p5{opacity:0}');
  for (let p = 0; p < NP; p++) css.push(`.p${p}{animation:herP${p} ${LOOP}s steps(1,end) infinite}`);
}

// ------------------------------------------------------------ main sign
const MAIN = { x0: 166, y0: 18, x1: 794, y1: 140 };
function mainSign() {
  const { x0, y0, x1, y1 } = MAIN;
  const s = 0.9;
  const word = 'CASTAWAY';
  const gap = 21;
  let total = 0;
  for (const ch of word) total += CAPS[ch].w;
  total = (total + gap * (word.length - 1)) * s;
  let x = (x0 + x1) / 2 - total / 2;
  const top = 44;
  let lit = '';
  let flick = '';
  const ends = [];
  [...word].forEach((ch, i) => {
    CAPS[ch].p.forEach((pc, j) => {
      const d = cmdD(pc, x, top, s);
      if (i === 4 && j === 1) flick += d; else lit += d;
    });
    ends.push([x, x + CAPS[ch].w * s]);
    x += (CAPS[ch].w + gap) * s;
  });
  let out = '';
  // hangers and the backing panel
  out += `<path d="M${x0 + 60} 0V${y0}M${x1 - 60} 0V${y0}" stroke="#1d2f33" stroke-width="2.4"/>`;
  out += wallGlow((x0 + x1) / 2, (y0 + y1) / 2 + 6, 380, 120, 'pink', 0.5);
  out += `<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" rx="7" fill="url(#panel)" stroke="#24363b" stroke-width="1.5"/>`;
  out += `<rect x="${x0 + 5}" y="${y0 + 5}" width="${x1 - x0 - 10}" height="${y1 - y0 - 10}" rx="4" fill="none" stroke="#0b1416" stroke-width="1.2"/>`;
  out += `<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" rx="7" fill="url(#gl-pink)" opacity=".22"/>`;
  for (const [bx, by] of [[x0 + 11, y0 + 11], [x1 - 11, y0 + 11], [x0 + 11, y1 - 11], [x1 - 11, y1 - 11]]) {
    out += `<circle cx="${bx}" cy="${by}" r="2.4" fill="#22343a"/><path d="M${bx - 1.4} ${by}h2.8" stroke="#0a1416" stroke-width=".8"/>`;
  }
  // blockout: the black-painted tube that joins letter to letter
  let blk = '';
  for (let i = 0; i < ends.length - 1; i++) {
    const a = ends[i][1] - 3;
    const b = ends[i + 1][0] + 3;
    blk += `M${f(a)} ${top + 80 * s + 6}Q${f((a + b) / 2)} ${top + 80 * s + 13} ${f(b)} ${top + 80 * s + 6}`;
  }
  out += `<path d="${blk}" class="blk"/>`;
  // maker's plate, bottom right
  out += `<rect x="${x1 - 112}" y="${y1 - 15}" width="98" height="9" rx="1.5" fill="#1b2a2e"/>`;
  out += `<path d="${textD('SALTGLASS NEON · 1992', x1 - 108, y1 - 12.6, 4.2, { track: 1.6 })}" class="lbl" stroke="#7f9aa0"/>`;
  out += `<path d="${textD(`UNIT CW-01 · ${FPS} FPS · 1080P`, x0 + 16, y1 - 12.6, 4.2, { track: 1.6 })}" class="lbl" stroke="#5f7a80"/>`;
  // standoffs: the little posts that hold each tube off the panel, two per
  // letter, peeking out between the glass and its shadow
  const POSTS = { C: [[38, 0], [38, 80]], A: [[0, 64], [56, 64]], S: [[40, 0], [18, 80]], T: [[10, 0], [28, 66]], W: [[0, 30], [80, 30]], Y: [[0, 8], [28, 66]] };
  let posts = '';
  [...word].forEach((ch, i) => {
    for (const [px, py] of POSTS[ch]) {
      const cx = ends[i][0] + px * s + 1.6;
      const cy = top + py * s + 2.2;
      posts += `M${f(cx)} ${f(cy)}h0`;
    }
  });
  const postSvg = `<path d="${posts}" stroke="#0a1214" stroke-width="5" stroke-linecap="round"/><path d="${posts}" stroke="#4a646b" stroke-width="3" stroke-linecap="round"/>`;
  const box = [x0, y0, x1, y1];
  out += neon(lit, 'pk', { w: 5.6, halo: 13, blur: 6, box, cls: 'wob1', under: postSvg }).svg;
  out += neon(flick, 'pk', { w: 5.6, halo: 13, blur: 6, box: [x0 + 300, top + 30, x0 + 380, top + 50], cls: 'flick', unlit: true }).svg;
  // the reflection of the bad tube flickers with it
  reflect.push(`<path d="${lit}" stroke="${C.pinkT}" stroke-width="9" fill="none"/>`);
  reflect.push(`<path d="${flick}" class="flick" stroke="${C.pinkT}" stroke-width="9" fill="none"/>`);
  return out;
}

// ------------------------------------------------------- open all day
function scriptSign() {
  const s = 0.36;
  const str = 'open all day';
  const w = lowWidth(str, s);
  const cx = 676;
  const x = cx - w / 2;
  const y = 164; // x-height top
  const { d } = lowD(str, x, y, s);
  let out = '';
  // hung from the main panel on two wires
  out += `<path d="M${f(cx - w / 2 + 8)} ${MAIN.y1}V${y - 14}M${f(cx + w / 2 - 8)} ${MAIN.y1}V${y - 14}" stroke="#1d2f33" stroke-width="1.2"/>`;
  out += wallGlow(cx, y + 10, 150, 46, 'amber', 0.45);
  // the open frame the tubes are wired to
  out += `<path d="M${f(x - 10)} ${y - 14}H${f(x + w + 10)}M${f(x - 10)} ${y + 30}H${f(x + w + 10)}" stroke="#1a2a2d" stroke-width="2"/>`;
  out += `<g transform="translate(${f(y * 0.17)} 0) skewX(-9.6)">`;
  out += neon(d, 'am', { w: 3.6, halo: 8, blur: 4, box: [x - 10, y - 14, x + w + 30, y + 30], cls: 'wob2', shadow: false }).svg;
  out += `</g>`;
  reflect.push(`<path d="${d}" transform="translate(${f(y * 0.17)} 0) skewX(-9.6)" stroke="${C.ambT}" stroke-width="5" fill="none"/>`);
  return out;
}

// ------------------------------------------------------------ blades
function blade({ x, y, w, h, col, top, kana, size, pitch, kanaY, gloss, glossCol }) {
  let out = '';
  out += wallGlow(x + w / 2, y + h / 2, w * 1.6, h * 0.62, col === 'cy' ? 'cyan' : 'amber', 0.5);
  // the arm it hangs from, and the box
  out += `<path d="M${col === 'cy' ? 0 : W} ${y + 10}H${f(x + w / 2)}M${col === 'cy' ? 0 : W} ${y + h - 14}H${f(x + w / 2)}" stroke="#1a2b2f" stroke-width="3"/>`;
  out += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" fill="url(#panel)" stroke="#24363b" stroke-width="1.4"/>`;
  out += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" fill="url(#gl-${col === 'cy' ? 'cyan' : 'amber'})" opacity=".2"/>`;
  const cx = x + w / 2;
  let d = '';
  for (const [str, ty, sz] of top) d += textD(str, cx, ty, sz, { track: 2, align: 'center' });
  out += neon(d, col, { w: 2.8, halo: 6, blur: 3, box: [x, y, x + w, y + 60] }).svg;
  const kd = kanaD(kana, cx - size / 2, kanaY, size, pitch);
  out += neon(kd, col, { w: 3.6, halo: 8, blur: 4, box: [x, kanaY - 10, x + w, kanaY + pitch * [...kana].length], cls: col === 'cy' ? 'wob3' : 'wob4' }).svg;
  // gloss plate at the foot
  let gd = '';
  gloss.forEach((g, i) => { gd += textD(g, cx, y + h - 8 - (gloss.length - i) * 8.6, 5, { track: 1.6, align: 'center' }); });
  out += `<path d="${gd}" class="lbl" stroke="${glossCol}"/>`;
  reflect.push(`<path d="${d}${kd}" stroke="${col === 'cy' ? C.cyanT : C.ambT}" stroke-width="5" fill="none"/>`);
  return out;
}

// ------------------------------------------------------------ billboard
const BB = { x: 106, y: 158, w: 246, h: 142 };
function billboard() {
  const { x, y, w, h } = BB;
  let out = '';
  out += wallGlow(x + w / 2, y + h / 2, w * 0.8, h * 0.75, 'cyan', 0.28);
  out += `<rect x="${x - 6}" y="${y - 6}" width="${w + 12}" height="${h + 12}" rx="3" fill="#0c171a" stroke="#24363b" stroke-width="1.4"/>`;
  out += `<clipPath id="cBB"><rect width="${w}" height="${h}"/></clipPath>`;
  out += `<g clip-path="url(#cBB)" transform="translate(${x} ${y})">`;
  // frame 1: the shark in headphones
  let f1 = `<rect width="${w}" height="${h}" fill="url(#bbSky)"/>`;
  f1 += `<path d="${textD('SHARK IN HEADPHONES', w / 2, 11, 9, { align: 'center', wide: 1.1, track: 1.8 })}" class="bbt" stroke="#0b2a4a" stroke-width="1.7"/>`;
  f1 += `<path d="${textD('NOW SHOWING · RARE · NODS ON THE BEAT', w / 2, 26, 4.6, { align: 'center', track: 1.8 })}" class="bbt" stroke="#1a4e78" stroke-width=".9"/>`;
  // the shark: back, fin and head out of the water, headphones on
  let sk = '';
  sk += `<path d="M58 104Q60 84 82 79Q104 74 122 76L132 52Q138 62 142 77Q166 82 184 96L200 104Z" fill="#6f8798"/>`;
  sk += `<path d="M58 104Q64 96 80 96Q96 98 104 104Z" fill="#eef3f6"/>`;
  sk += `<path d="M132 52Q135 64 136 77L142 77Q138 62 132 52Z" fill="#5a7083"/>`;
  sk += `<circle cx="76" cy="88" r="2.6" fill="#0d1a24"/><circle cx="76.8" cy="87.2" r=".8" fill="#fff"/>`;
  sk += `<path d="M62 98Q70 102 80 99" stroke="#29404f" stroke-width="1.4" fill="none" stroke-linecap="round"/>`;
  sk += `<path d="M104 86l-2 9M109 85l-2 10M114 85l-2 10" stroke="#4c6475" stroke-width="1.2" stroke-linecap="round"/>`;
  sk += `<path d="M82 92Q84 66 98 70Q106 72 100 92" stroke="#f3ead2" stroke-width="3.2" fill="none" stroke-linecap="round"/>`;
  sk += `<rect x="94" y="86" width="10" height="12" rx="3.4" fill="#f3ead2" stroke="#c9bd9f" stroke-width="1"/>`;
  f1 += `<g class="nod">${sk}</g>`;
  f1 += `<rect y="102" width="${w}" height="${h - 102}" fill="url(#bbSea)"/>`;
  f1 += `<path d="M20 112h18M70 118h26M150 113h22M196 121h18M34 128h14M120 130h24" stroke="#c9f1ff" stroke-width="1.6" stroke-linecap="round" opacity=".8"/>`;
  f1 += `<path d="${textD('♪ ON EVERY BEAT ♪', w / 2, 130, 5.2, { align: 'center', track: 1.8 })}" class="bbt" stroke="#ffffff" stroke-width="1"/>`;
  // frame 2: every sound made from code
  let f2s = `<rect width="${w}" height="${h}" fill="url(#bbNavy)"/>`;
  f2s += `<path d="${textD('EVERY SOUND', w / 2, 12, 10, { align: 'center', wide: 1.12, track: 1.8 })}" class="bbt" stroke="#ffffff" stroke-width="1.8"/>`;
  f2s += `<path d="${textD('MADE FROM CODE', w / 2, 28, 10, { align: 'center', wide: 1.12, track: 1.8 })}" class="bbt" stroke="${C.pinkT}" stroke-width="1.8"/>`;
  // a periodic waveform that slides one period per bar
  const per = 60;
  let wv = '';
  for (let i = 0; i <= (w + per) * 2; i += 2) {
    const ph = (i / per) * Math.PI * 2;
    const v = Math.sin(ph) * 0.55 + Math.sin(ph * 2 + 0.6) * 0.28 + Math.sin(ph * 5 + 1.1) * 0.12;
    wv += `${i ? 'L' : 'M'}${i} ${f(76 + v * 17)}`;
  }
  f2s += `<g class="wave"><path d="${wv}" stroke="${C.cyanT}" stroke-width="2" fill="none"/></g>`;
  f2s += `<path d="M0 76H${w}" stroke="#2b3a66" stroke-width=".8"/>`;
  f2s += `<path d="${textD('80 BPM · F MAJOR · ii-V-I-vi · 60 S LOOP', w / 2, 104, 5, { align: 'center', track: 1.8 })}" class="bbt" stroke="${C.ambT}" stroke-width=".95"/>`;
  f2s += `<path d="${textD('NO SAMPLES · NO STOCK LOOPS · NO RECORDINGS', w / 2, 118, 5, { align: 'center', track: 1.8 })}" class="bbt" stroke="#c9d4ff" stroke-width=".95"/>`;
  f2s += `<path d="${textD('tools/make_audio.py', w / 2, 130.5, 5, { align: 'center', track: 1.8 })}" class="bbt" stroke="#8f9fd8" stroke-width=".9"/>`;
  // frame 3: the four timers
  let f3 = `<rect width="${w}" height="${h}" fill="url(#bbAmber)"/>`;
  f3 += `<path d="${textD('90+ ACTIVITIES', w / 2, 10, 11, { align: 'center', wide: 1.1, track: 1.8 })}" class="bbt" stroke="#1a1208" stroke-width="2"/>`;
  f3 += `<path d="${textD('MOST ON FOUR TIMERS · BARS: EVENTS PER 10-HOUR RUN', w / 2, 27, 4.2, { align: 'center', track: 1.7 })}" class="bbt" stroke="#3d2a10" stroke-width=".85"/>`;
  // Bars to scale: the medians of 200 simulated runs, from the header of
  // castaway/activities.toml. Super rare gets a stub, which is the point.
  const rows = [['REGULAR', 'EVERY 2-5 MIN', 155], ['OCCASIONAL', 'EVERY 12-25 MIN', 30], ['RARE', 'EVERY 30-60 MIN', 13], ['SUPER RARE', 'EVERY 3-6 HOURS', 2]];
  const barMax = w - 28 - 34;
  rows.forEach(([a, b, n], i) => {
    const ry = 44 + i * 21;
    const bw = Math.max(1.6, (barMax * n) / 155);
    f3 += `<path d="${textD(a, 14, ry, 6, { track: 1.8 })}" class="bbt" stroke="#1a1208" stroke-width="1.15"/>`;
    f3 += `<path d="${textD(b, w - 14, ry, 6, { align: 'right', track: 1.8 })}" class="bbt" stroke="#1a1208" stroke-width="1.15"/>`;
    f3 += `<rect x="14" y="${ry + 9}" width="${f(bw)}" height="3.2" fill="#1a1208"/>`;
    f3 += `<path d="${textD(`~${n}`, 14 + bw + 4, ry + 8.4, 4.4, { track: 1.6 })}" class="bbt" stroke="#3d2a10" stroke-width=".9"/>`;
  });
  f3 += `<path d="${textD('SHE IS BUSY ABOUT A THIRD OF THE TIME', w / 2, 131, 4.6, { align: 'center', track: 1.7 })}" class="bbt" stroke="#3d2a10" stroke-width=".9"/>`;
  out += `<g class="bb1">${f1}</g><g class="bb2">${f2s}</g><g class="bb3">${f3}</g>`;
  // lightbox sheen
  out += `<rect width="${w}" height="${h}" fill="url(#sheen)"/>`;
  out += `</g>`;
  // little floodlight arms on top
  out += `<path d="M${x + 40} ${y - 6}l-6-10h-8M${x + w - 40} ${y - 6}l6-10h8" stroke="#1d2f33" stroke-width="2" fill="none"/>`;
  css.push(kf('bb2', [[0, 'opacity:0'], [9, 'opacity:1'], [18, 'opacity:0']]));
  css.push(kf('bb3', [[0, 'opacity:0'], [18, 'opacity:1']]));
  css.push(`.bb2{opacity:0;animation:bb2 ${LOOP}s steps(1,end) infinite}.bb3{opacity:0;animation:bb3 ${LOOP}s steps(1,end) infinite}`);
  reflect.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#5fb8e0" opacity=".5"/>`);
  return out;
}

// --------------------------------------------------- the LED queue panel
const LP = { x: 104, y: 314, w: 250, h: 60 };
function ledPanel() {
  const { x, y, w, h } = LP;
  const p = 1.86;
  let out = '';
  out += wallGlow(x + w / 2, y + h / 2, w * 0.7, h, 'red', 0.4);
  out += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="#120607" stroke="#2c1c1e" stroke-width="1.4"/>`;
  out += `<rect x="${x + 5}" y="${y + 5}" width="${w - 10}" height="${h - 10}" fill="url(#ledOff)"/>`;
  const lines = ['NOW SERVING   001', 'python tools/serve.py', '> 127.0.0.1:8765'];
  let d = '';
  lines.forEach((ln, i) => { d += ledD(ln, x + 9, y + 9 + i * 15.4, p); });
  out += `<path d="${d}" stroke="${C.red}" stroke-width="${f2(p * 2.4)}" stroke-linecap="round" opacity=".22"/>`;
  out += `<path d="${d}" stroke="#ff5a4e" stroke-width="${f2(p * 0.92)}" stroke-linecap="round"/>`;
  out += `<path d="${d}" stroke="#ffd2c4" stroke-width="${f2(p * 0.36)}" stroke-linecap="round"/>`;
  // a blinking block cursor after the address
  const cxp = x + 9 + 17 * 6 * p;
  out += `<rect class="cur" x="${f(cxp)}" y="${f(y + 9 + 2 * 15.4 - p / 2)}" width="${f(p * 5)}" height="${f(p * 7)}" fill="#ff5a4e"/>`;
  out += `<path d="${textD('QUEUE · CUSTOMERS TODAY: 1', x + w, y + h + 9, 4, { align: 'right', track: 1.6 })}" class="lbl" stroke="#6a5355"/>`;
  return out;
}

// -------------------------------------------------- tenants' directory
const TENANTS = [
  ['RF', 'ONE BAR OF SIGNAL', '#f4fbff'],
  ['5F', 'MESSAGE IN A BOTTLE', '#c7f5ff'],
  ['4F', 'SEA TURTLE, VISITING', '#d2ffe4'],
  ['3F', 'STRAY CAT ON A CRATE', '#ffd6ef'],
  ['2F', 'DRONE: MORE HEADPHONES', '#ffe8bd'],
  ['1F', 'CRAB WEARS COCONUT', '#f4fbff'],
];
function directory() {
  const x = 574;
  const y = 212;
  const w = 184;
  const ph = 17.5;
  let out = '';
  out += wallGlow(x + w / 2, y + 66, w * 0.75, 90, 'white', 0.25);
  out += `<rect x="${x - 4}" y="${y - 18}" width="${w + 8}" height="${TENANTS.length * (ph + 3) + 22}" rx="2" fill="#0d1a1d" stroke="#24363b" stroke-width="1.2"/>`;
  out += `<path d="${textD('TENANTS · NOON ALLEY 3', x + w / 2, y - 12.5, 5, { align: 'center', track: 1.8 })}" class="lbl" stroke="#a8c4c9"/>`;
  TENANTS.forEach(([fl, name, col], i) => {
    const py = y + i * (ph + 3);
    out += `<rect x="${x}" y="${py}" width="${w}" height="${ph}" fill="${col}"/>`;
    out += `<rect x="${x}" y="${py}" width="22" height="${ph}" fill="#132226"/>`;
    out += `<path d="${textD(fl, x + 11, py + 5.2, 7, { align: 'center', track: 1.6 })}" class="lbl" stroke="#e8f4f6" stroke-width="1.1"/>`;
    out += `<path d="${textD(name, x + 28, py + 5.2, 7, { track: 1.5 })}" class="lbl" stroke="#132226" stroke-width="1.15"/>`;
  });
  reflect.push(`<rect x="${x}" y="${y}" width="${w}" height="${TENANTS.length * (ph + 3)}" fill="#e8f6ff" opacity=".35"/>`);
  return out;
}

// --------------------------------------------------- 80 BPM and hazard
function bpmSign() {
  const x = 812;
  const y = 214;
  let out = '';
  out += wallGlow(x, y + 14, 70, 40, 'green', 0.5);
  out += `<rect x="${x - 46}" y="${y - 6}" width="92" height="44" rx="4" fill="url(#panel)" stroke="#24363b" stroke-width="1.2"/>`;
  const d = textD('80BPM', x, y + 4, 16, { align: 'center', track: 1.6 });
  out += neon(d, 'gr', { w: 2.8, halo: 6.5, blur: 3.2, box: [x - 46, y - 6, x + 46, y + 38], cls: 'wob5' }).svg;
  out += `<path d="${textD('F MAJOR · 3 S A BAR', x, y + 28.5, 4, { align: 'center', track: 1.6 })}" class="lbl" stroke="#5f8a7a"/>`;
  reflect.push(`<path d="${d}" stroke="${C.grnT}" stroke-width="4" fill="none"/>`);
  // hazard plate
  const hy = 270;
  out += `<rect x="${x - 44}" y="${hy}" width="88" height="44" fill="#f2c935"/>`;
  out += `<rect x="${x - 44}" y="${hy}" width="88" height="44" fill="url(#hazard)"/>`;
  out += `<rect x="${x - 38}" y="${hy + 6}" width="76" height="32" fill="#f2c935"/>`;
  out += `<path d="${textD('BY ORDER', x, hy + 9, 4.4, { align: 'center', track: 1.7 })}" class="lbl" stroke="#2a2208" stroke-width=".9"/>`;
  out += `<path d="${textD('ALWAYS', x, hy + 17, 6.6, { align: 'center', track: 1.7 })}" class="lbl" stroke="#1a1404" stroke-width="1.3"/>`;
  out += `<path d="${textD('DAYTIME', x, hy + 27, 6.6, { align: 'center', track: 1.7 })}" class="lbl" stroke="#1a1404" stroke-width="1.3"/>`;
  out += `<rect x="${x - 44}" y="${hy}" width="88" height="44" fill="#000" opacity=".22"/>`;
  return out;
}

// -------------------------------------------------- small stuck-on labels
function labels() {
  let out = '';
  const plate = (x, y, w, str, col, fg) => {
    out += `<rect x="${x}" y="${y}" width="${w}" height="10" rx="1" fill="${col}"/>`;
    out += `<path d="${textD(str, x + w / 2, y + 2.6, 4.6, { align: 'center', track: 1.6 })}" class="lbl" stroke="${fg}" stroke-width=".85"/>`;
  };
  plate(358, 192, 40, 'LANE 4', '#16282c', '#9fc0c6');
  plate(358, 205, 40, 'SEA/SKY', '#16282c', '#9fc0c6');
  plate(358, 228, 40, '→ ISLAND', '#d9b23a', '#1a1404');
  plate(358, 241, 40, 'ON FOOT', '#d9b23a', '#1a1404');
  plate(358, 264, 40, 'SEED 1992', '#16282c', '#9fc0c6');
  plate(358, 277, 40, '10:00:00', '#16282c', '#9fc0c6');
  return out;
}

// ------------------------------------------------- wall clutter, up top
// An air-conditioner box on the left, dripping, and on the right a fixed
// camera on a bracket, pointed at the island. It never pans. Neither does
// the video.
function clutter() {
  let out = '';
  // AC unit
  const ax = 104;
  const ay = 92;
  out += `<path d="M${ax + 46} ${ay + 40}V${ay + 58}" stroke="#14272b" stroke-width="2"/>`;
  out += `<rect x="${ax}" y="${ay}" width="52" height="40" rx="2" fill="#13232a" stroke="#27393f" stroke-width="1.2"/>`;
  out += `<circle cx="${ax + 18}" cy="${ay + 20}" r="13" fill="#0b1619" stroke="#2a3d43" stroke-width="1"/>`;
  out += `<path d="M${ax + 18} ${ay + 8}V${ay + 32}M${ax + 6} ${ay + 20}H${ax + 30}M${ax + 9.5} ${ay + 11.5}l17 17M${ax + 26.5} ${ay + 11.5}l-17 17" stroke="#1e3036" stroke-width="1.2"/>`;
  out += `<path d="M${ax + 38} ${ay + 8}h9M${ax + 38} ${ay + 13}h9M${ax + 38} ${ay + 18}h9M${ax + 38} ${ay + 23}h9M${ax + 38} ${ay + 28}h9" stroke="#24363b" stroke-width="1.6"/>`;
  out += `<circle class="drip" cx="${ax + 46}" cy="${ay + 60}" r="1.2" fill="#9fdce6"/>`;
  // the camera
  const cx = 834;
  const cy = 44;
  out += `<path d="M868 ${cy - 8}H${cx + 20}V${cy + 2}" stroke="#1a2b2f" stroke-width="3" fill="none"/>`;
  out += `<path d="M${cx + 20} ${cy}l-6 6" stroke="#1f3237" stroke-width="3"/>`;
  out += `<path d="M${cx - 18} ${cy + 2}h30l4 4v9h-34z" fill="#2a4148" stroke="#4a6a72" stroke-width="1"/>`;
  out += `<path d="M${cx - 17} ${cy + 3.2}h28" stroke="#6f8f96" stroke-width=".8"/>`;
  out += `<path d="M${cx - 22} ${cy + 4}h5v12h-5z" fill="#0c1518" stroke="#3a565d" stroke-width=".8"/><circle cx="${cx - 19.5}" cy="${cy + 10}" r="2.2" fill="#3a8496"/>`;
  out += `<circle class="rec" cx="${cx + 8}" cy="${cy + 6.5}" r="1.2" fill="${C.red}"/>`;
  out += `<path d="${textD('CAM 1 · FIXED SHOT', cx - 2, cy + 22, 4, { align: 'center', track: 1.6 })}" class="lbl" stroke="#86a3a9"/>`;
  return out;
}

// ---------------------------------------------------------- the street
function street() {
  let out = '';
  const fx0 = floorX(H, -1);
  const fx1 = floorX(H, 1);
  // daylight spilling down the wet street from the far end
  out += `<path d="M${OPEN.x0} ${FL}H${OPEN.x1}L${f(fx1)} ${H}H${f(fx0)}Z" fill="url(#spill)"/>`;
  // reflections: everything above, mirrored about the quay line, squashed,
  // smeared down by a vertical-only blur. The squash is chosen so the whole
  // CASTAWAY reflection, blur and all, lands on the street above the bottom
  // edge (the mask fades the last stretch out) instead of being cut off by
  // the frame.
  const k = 0.4;
  out += `<g clip-path="url(#cFloor)"><g mask="url(#mRefl)"><g filter="url(#fRefl)" opacity=".82"><g transform="translate(0 ${f(FL * (1 + k))}) scale(1 ${-k})">`;
  out += `<rect x="${OPEN.x0 + 4}" y="${OPEN.y0}" width="${OPEN.x1 - OPEN.x0 - 8}" height="${HZ - OPEN.y0}" fill="#8fd2f2" opacity=".75"/>`;
  out += `<rect x="${OPEN.x0 + 4}" y="${HZ}" width="${OPEN.x1 - OPEN.x0 - 8}" height="${FL - HZ}" fill="#2ba4cc" opacity=".7"/>`;
  out += reflect.join('');
  out += `</g></g></g>`;
  // ripples break the reflections into streaks; two sets drift apart
  const rnd = mulberry32(80);
  // ripples: broken dashes, close together at the far end and further
  // apart near the viewer, as perspective would have them
  const ripples = (n) => {
    let d = '';
    for (let i = 0; i < n; i++) {
      const u = (i + 0.2 + rnd() * 0.6) / n;
      const y = FL + 3 + Math.pow(u, 1.6) * (H - FL);
      let x = floorX(y, -1) - 30 + rnd() * 30;
      const xe = floorX(y, 1) + 20;
      while (x < xe) {
        const len = 10 + rnd() * 90;
        d += `M${f(x)} ${f(y)}h${f(len)}`;
        x += len + 6 + rnd() * 60;
      }
    }
    return d;
  };
  out += `<g class="wetA"><path d="${ripples(14)}" stroke="${C.floor}" stroke-width="1.6" opacity=".62"/></g>`;
  out += `<g class="wetB"><path d="${ripples(12)}" stroke="${C.floor}" stroke-width="1" opacity=".5"/></g>`;
  // sun glare on the puddles nearest the far end
  out += `<path d="M436 352h14M492 356h22M526 350h9M458 362h12M500 371h16" stroke="#e9fbff" stroke-width="1.1" stroke-linecap="round" class="glare"/>`;
  out += `</g>`;
  // the drain down the middle and the kerbs
  out += `<path d="M${VPX} ${FL}L${VPX} ${H}" stroke="#0b1d20" stroke-width="1.4" opacity=".7"/>`;
  out += `<path d="M${OPEN.x0} ${FL}L${f(fx0)} ${H}M${OPEN.x1} ${FL}L${f(fx1)} ${H}" stroke="#13292d" stroke-width="2"/>`;
  // rain splashes, little rings that open and fade
  const rs = mulberry32(7);
  for (let i = 0; i < 16; i++) {
    const y = FL + 12 + Math.pow(rs(), 0.8) * (H - FL - 16);
    const x = lerp(floorX(y, -1) + 8, floorX(y, 1) - 8, rs());
    const r = 2 + (y - FL) * 0.035;
    out += `<ellipse class="spl" cx="${f(x)}" cy="${f(y)}" rx="${f(r * 2.2)}" ry="${f(r * 0.6)}" style="animation-delay:-${f(rs() * 1.6, 2)}s;animation-duration:${f(1.2 + rs() * 0.8, 2)}s"/>`;
  }
  return out;
}

// --------------------------------------------------------------- rain
function rain() {
  let out = '';
  out += `<g class="rainwrap" transform="rotate(14 ${W / 2} ${H / 2})">`;
  out += `<g class="rainA"><rect x="-300" y="-400" width="${W + 600}" height="${H + 800}" fill="url(#rainFar)"/></g>`;
  out += `<g class="rainB"><rect x="-300" y="-400" width="${W + 600}" height="${H + 800}" fill="url(#rainNear)"/></g>`;
  out += `</g>`;
  return out;
}

// ============================================================== assemble
herCss();
// Signs are built first (they fill the reflection list), then stacked back
// to front: walls, the daylight, the street, then the signs.
const signs = [];
signs.push(billboard());
signs.push(ledPanel());
signs.push(directory());
signs.push(bpmSign());
signs.push(labels());
signs.push(clutter());
signs.push(blade({
  x: 16, y: 12, w: 76, h: 396, col: 'cy',
  top: [['POP. 1', 28, 13]],
  kana: 'ほぼ無人島', size: 52, pitch: 58, kanaY: 58,
  gloss: ['ALMOST A', 'DESERT', 'ISLAND'], glossCol: '#7fcfd2',
}));
signs.push(blade({
  x: 868, y: 12, w: 76, h: 396, col: 'am',
  top: [['ICED', 24, 11], ['COFFEE', 42, 11]],
  kana: 'アイスコーヒー', size: 40, pitch: 41.5, kanaY: 64,
  gloss: ['WALK-UP', 'ONLY'], glossCol: '#e0b46a',
}));
signs.push(mainSign());
signs.push(scriptSign());
const scene = [background(), opening(), street(), ...signs];

// haze: the far end glows, the blacks lift toward blue-green
const haze = `<rect width="${W}" height="${H}" fill="url(#hazeFar)"/><rect width="${W}" height="${H}" fill="url(#hazeTop)"/>`;

// ------------------------------------------------------------- styles
const style = [
  '.n,use{fill:none;stroke-linecap:round;stroke-linejoin:round}',
  `.pkH{stroke:${C.pinkH}}.pkT{stroke:${C.pinkT}}.pkI{stroke:${C.pinkI}}`,
  `.cyH{stroke:${C.cyanH}}.cyT{stroke:${C.cyanT}}.cyI{stroke:${C.cyanI}}`,
  `.amH{stroke:${C.ambH}}.amT{stroke:${C.ambT}}.amI{stroke:${C.ambI}}`,
  `.grH{stroke:${C.grnH}}.grT{stroke:${C.grnT}}.grI{stroke:${C.grnI}}`,
  '.core{stroke:#fff}',
  '.sh{stroke:#000;opacity:.55}',
  '.dead{stroke:#5a3a4e;opacity:.8}',
  '.blk{fill:none;stroke:#0a0f11;stroke-width:4.4;stroke-linecap:round}',
  '.lbl,.bbt{fill:none;stroke-width:.8;stroke-linecap:round;stroke-linejoin:round}',
  '.ledge{fill:none;stroke:#143236;stroke-width:1.2;opacity:.7}',
  '.joint{fill:none;stroke:#0f272a;stroke-width:1.4;opacity:.8}',
  '.shut{fill:none;stroke:#0e2427;stroke-width:1;opacity:.9}',
  '.gl{stroke:#fff;stroke-width:1;stroke-linecap:round;animation:gl 3s steps(1,end) infinite}',
  kf('gl', [[0, 'opacity:.95'], [0.75, 'opacity:.25'], [1.5, 'opacity:.7'], [2.25, 'opacity:.1']], 3),
  // the tube that will not behave: on, off, on, long on
  kf('flick', [[0, 'opacity:1'], [3.9, 'opacity:1'], [3.96, 'opacity:.08'], [4.14, 'opacity:.08'], [4.2, 'opacity:1'], [4.5, 'opacity:1'], [4.56, 'opacity:.2'], [4.86, 'opacity:.2'], [4.92, 'opacity:.9'], [5.04, 'opacity:.9'], [5.1, 'opacity:.05'], [5.7, 'opacity:.05'], [5.76, 'opacity:1']], 6.75),
  '.flick{animation:flick 6.75s linear infinite}',
  // the rest hum: slow, slight, each on its own period
  kf('wob', [[0, 'opacity:1'], [0.5, 'opacity:.86'], [1, 'opacity:1']], 1),
  '.wob1{animation:wob 4.5s ease-in-out infinite}',
  '.wob2{animation:wob 5.25s ease-in-out infinite -1s}',
  '.wob3{animation:wob 6s ease-in-out infinite -2.5s}',
  '.wob4{animation:wob 3.75s ease-in-out infinite -.5s}',
  '.wob5{animation:wob 4.75s ease-in-out infinite -3s}',
  // shark nods once a beat; waveform slides one period per bar
  '.nod{transform-box:view-box;transform-origin:120px 104px;animation:nod .75s ease-in-out infinite}',
  kf('nod', [[0, 'transform:rotate(0deg)'], [0.3, 'transform:rotate(-4deg)'], [0.75, 'transform:rotate(0deg)']], 0.75),
  '.wave{animation:wave 3s linear infinite}',
  kf('wave', [[0, 'transform:translateX(0)'], [3, 'transform:translateX(-60px)']], 3),
  '.cur{animation:cur 1.5s steps(1,end) infinite}',
  '.glare{animation:gl 3s steps(1,end) infinite -1.1s}',
  '.drip{animation:drip 2.25s ease-in infinite}',
  kf('drip', [[0, 'transform:translateY(0);opacity:0'], [0.3, 'transform:translateY(0);opacity:1'], [1.5, 'transform:translateY(0);opacity:1'], [2.1, 'transform:translateY(60px);opacity:.8'], [2.25, 'transform:translateY(64px);opacity:0']], 2.25),
  '.rec{animation:cur 1.5s steps(1,end) infinite}',
  kf('cur', [[0, 'opacity:1'], [0.75, 'opacity:0']], 1.5),
  // rain: far sheet and near sheet, each sliding exactly one tile
  '.rainA{animation:rainA .3s linear infinite}',
  kf('rainA', [[0, 'transform:translateY(0)'], [0.3, 'transform:translateY(64px)']], 0.3),
  '.rainB{animation:rainB .4s linear infinite}',
  kf('rainB', [[0, 'transform:translateY(0)'], [0.4, 'transform:translateY(150px)']], 0.4),
  '.spl{fill:none;stroke:#bfe6ee;stroke-width:.8;opacity:0;transform-box:fill-box;transform-origin:center;animation:spl 1.4s ease-out infinite}',
  kf('spl', [[0, 'opacity:.75;transform:scale(.2)'], [1, 'opacity:0;transform:scale(1)']], 1),
  '.wetA{animation:wetA 5s ease-in-out infinite alternate}',
  kf('wetA', [[0, 'transform:translate(-5px,0)'], [5, 'transform:translate(5px,.6px)']], 5),
  '.wetB{animation:wetB 3.5s ease-in-out infinite alternate}',
  kf('wetB', [[0, 'transform:translate(4px,.5px)'], [3.5, 'transform:translate(-4px,0)']], 3.5),
  ...css,
  // reduced motion: one complete, readable frame
  '@media (prefers-reduced-motion:reduce){*{animation:none!important}.rainA,.rainB{opacity:.6}}',
].join('');

// ---------------------------------------------------------- gradients
const grad = [];
grad.push(`<linearGradient id="wallL" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.wallB}"/><stop offset="1" stop-color="${C.wallA}"/></linearGradient>`);
grad.push(`<linearGradient id="wallR" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="${C.wallB}"/><stop offset="1" stop-color="${C.wallA}"/></linearGradient>`);
grad.push(`<linearGradient id="street" x1="0" y1="${FL}" x2="0" y2="${H}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#0c2326"/><stop offset="1" stop-color="${C.floor}"/></linearGradient>`);
grad.push(`<linearGradient id="sky" x1="0" y1="${OPEN.y0}" x2="0" y2="${HZ}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#2f97e4"/><stop offset=".65" stop-color="#7cc6f2"/><stop offset="1" stop-color="#c8ecfb"/></linearGradient>`);
grad.push(`<linearGradient id="sea" x1="0" y1="${HZ}" x2="0" y2="${FL}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#1468c0"/><stop offset=".55" stop-color="#1b93cf"/><stop offset="1" stop-color="#2fc4cf"/></linearGradient>`);
grad.push(`<linearGradient id="spill" x1="0" y1="${FL}" x2="0" y2="${H}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#7fd6ee" stop-opacity=".22"/><stop offset="1" stop-color="#7fd6ee" stop-opacity="0"/></linearGradient>`);
grad.push(`<linearGradient id="panel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#101d21"/><stop offset="1" stop-color="#0a1316"/></linearGradient>`);
grad.push(`<linearGradient id="bbSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fe0ff"/><stop offset=".7" stop-color="#e2f7ff"/></linearGradient>`);
grad.push(`<linearGradient id="bbSea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1e9ad2"/><stop offset="1" stop-color="#0f5d97"/></linearGradient>`);
grad.push(`<linearGradient id="bbNavy" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#10193c"/><stop offset="1" stop-color="#1c1240"/></linearGradient>`);
grad.push(`<linearGradient id="bbAmber" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe066"/><stop offset="1" stop-color="#ffb23c"/></linearGradient>`);
grad.push(`<linearGradient id="sheen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset=".4" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".18"/></linearGradient>`);
grad.push(`<radialGradient id="hazeFar" cx="${VPX}" cy="${HZ}" r="420" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#8fe3ee" stop-opacity=".2"/><stop offset=".45" stop-color="#3a8f99" stop-opacity=".07"/><stop offset="1" stop-color="#0e3a40" stop-opacity="0"/></radialGradient>`);
grad.push(`<linearGradient id="hazeTop" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#123d44" stop-opacity=".35"/><stop offset=".5" stop-color="#123d44" stop-opacity="0"/></linearGradient>`);
const GLOW = { pink: C.pinkH, cyan: C.cyanH, amber: C.ambH, green: C.grnH, red: C.red, white: '#bfefff' };
for (const [k, v] of Object.entries(GLOW)) grad.push(`<radialGradient id="gl-${k}"><stop offset="0" stop-color="${v}" stop-opacity=".55"/><stop offset=".55" stop-color="${v}" stop-opacity=".16"/><stop offset="1" stop-color="${v}" stop-opacity="0"/></radialGradient>`);
// patterns: rain sheets, LED off-dots, hazard stripes
grad.push(`<pattern id="rainFar" width="40" height="64" patternUnits="userSpaceOnUse"><path d="M6 4v13M22 30v11M33 47v14M15 52v8" stroke="#bfeaf5" stroke-width=".7" opacity=".32"/></pattern>`);
grad.push(`<pattern id="rainNear" width="110" height="150" patternUnits="userSpaceOnUse"><path d="M14 10v26M70 74v30M92 20v18M40 118v24" stroke="#d6f4ff" stroke-width="1.1" opacity=".38"/></pattern>`);
grad.push(`<pattern id="ledOff" width="1.86" height="1.86" patternUnits="userSpaceOnUse" x="${LP.x + 9 - 0.93}" y="${LP.y + 9 - 0.93}"><circle cx=".93" cy=".93" r=".42" fill="#3a1414"/></pattern>`);
grad.push(`<pattern id="hazard" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="12" fill="#151208"/></pattern>`);
grad.push(`<clipPath id="cOpen"><rect x="${OPEN.x0}" y="${OPEN.y0}" width="${OPEN.x1 - OPEN.x0}" height="${OPEN.y1 - OPEN.y0}"/></clipPath>`);
grad.push(`<clipPath id="cFloor"><path d="M${OPEN.x0} ${FL}H${OPEN.x1}L${f(floorX(H, 1))} ${H}H${f(floorX(H, -1))}Z"/></clipPath>`);
grad.push(`<linearGradient id="reflFade" x1="0" y1="${FL}" x2="0" y2="${H}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff"/><stop offset=".5" stop-color="#fff" stop-opacity=".85"/><stop offset=".8" stop-color="#fff" stop-opacity=".8"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`);
grad.push(`<mask id="mRefl" maskUnits="userSpaceOnUse" x="0" y="${FL}" width="${W}" height="${H - FL}"><rect x="0" y="${FL}" width="${W}" height="${H - FL}" fill="url(#reflFade)"/></mask>`);
grad.push(`<clipPath id="cAll"><rect width="${W}" height="${H}" rx="14"/></clipPath>`);
grad.push(`<filter id="fRefl" filterUnits="userSpaceOnUse" x="${OPEN.x0 - 300}" y="${FL - 10}" width="${OPEN.x1 - OPEN.x0 + 600}" height="${H - FL + 20}"><feGaussianBlur stdDeviation=".9 7"/></filter>`);

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="CASTAWAY in pink neon over a rain-wet alley at noon, with the island at the far end">`
  + `<title>CASTAWAY: neon signs in a rain-wet alley at noon, with the island at the far end</title>`
  + `<style>${style}</style>`
  + `<defs>${grad.join('')}${filters.join('')}${defs.join('')}</defs>`
  + `<g clip-path="url(#cAll)">`
  + scene.join('')
  + haze
  + rain()
  + `</g>`
  + `<rect x=".75" y=".75" width="${W - 1.5}" height="${H - 1.5}" rx="13.5" fill="none" stroke="#1d3a3f" stroke-width="1.5"/>`
  + `</svg>`;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, svg);
console.log(`wrote ${OUT} (${(svg.length / 1024).toFixed(1)} KB)`);
