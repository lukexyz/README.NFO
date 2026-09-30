#!/usr/bin/env node
// ULTRA-SATISFACTORY as an oscilloscope view: one scope cell per channel, the way chiptune
// uploads show a tune. Here the tune is a factory. The nine channels are the nine production
// machines, each with its own waveform, and the readout under each trace is a real standard
// recipe from the app's data (items per minute, cycle seconds, machine MW). Channel 10 is the
// pioneer, and it is silent, because the pioneer is not sleeping.
//
// Regenerate:  node examples/ultra-satisfactory/src/09-oscilloscope_opus_5.5.mjs
//
// Plain Node, no dependencies, fully deterministic (a seeded PRNG for the noise channel, no
// clock). All lettering is a monoline stroke font defined below and emitted as <path> data,
// never <text>, so it looks the same for every viewer. The "song" is 8 bars at 120 BPM
// (16 s): note changes snap the period (scaleX), envelopes scale the amplitude (scaleY), and
// vector-effect: non-scaling-stroke keeps every trace the same weight while it does so.
// Shapes that have to change (pulse-width sweep, wavetable mix, FM index, the pioneer's one
// twitch) are SMIL morphs of the path data, and the beam that sweeps the title is a SMIL
// gradient transform. CSS cannot pause SMIL, so each of those has a still twin that
// prefers-reduced-motion swaps in; everything else just drops its animation and rests on a
// complete frame.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '09-oscilloscope_opus_5.5';
const OUT = path.join(HERE, '..', 'assets', `${SLUG}.svg`);

// ---------------------------------------------------------------------------------------------
// Frame geometry (a 16:9 frame, like the video format this style comes from)
// ---------------------------------------------------------------------------------------------
const W = 1280, H = 720;
const TITLE_H = 184;                 // master band with the project name
const ROWS = 3, COLS = 3;
const ROW_H = 154, COL_W = W / COLS;
const GRID_Y = TITLE_H;
const STRIP_Y = GRID_Y + ROWS * ROW_H; // 646: channel 10, full width
const STRIP_H = H - STRIP_Y;         // 74
const MID = 80;                      // midline offset inside a cell
const HALF = COL_W / 2;

const GRID = '#55AAFF';              // pale blue cell grid
const MIDLINE = '#3a3f46';           // dim grey midline
const INK = '#e6edf3';               // label white
const DIM = '#8d99a6';               // readout grey

// ---------------------------------------------------------------------------------------------
// Number formatting
// ---------------------------------------------------------------------------------------------
const f1 = (n) => {
  const s = (Math.round(n * 10) / 10).toString();
  return s === '-0' ? '0' : s;
};
const f2 = (n) => {
  const s = (Math.round(n * 100) / 100).toString();
  return s === '-0' ? '0' : s;
};

// ---------------------------------------------------------------------------------------------
// Monoline stroke font. Each glyph: [width, path] in a box `width` wide and 140 tall
// (y = 0 is the cap line, y = 140 the baseline). Only absolute M L H V C Z are used, so a
// glyph can be placed with a plain scale + offset. Squarish round shapes, single stroke.
// ---------------------------------------------------------------------------------------------
const O_PATH = 'M44,0 C18,0 0,18 0,44 V96 C0,122 18,140 44,140 H46 C72,140 90,122 90,96 V44 C90,18 72,0 46,0 Z';
const FONT = {
  A: [92, 'M0,140 L46,0 L92,140 M17,92 H75'],
  B: [86, 'M0,140 V0 H48 C68,0 80,12 80,33 C80,54 68,66 48,66 H0 M48,66 H54 C74,66 86,80 86,103 C86,126 74,140 54,140 H0'],
  C: [86, 'M86,38 C86,14 70,0 46,0 H44 C18,0 0,18 0,44 V96 C0,122 18,140 44,140 H46 C70,140 86,126 86,102'],
  D: [88, 'M0,0 H42 C70,0 88,18 88,46 V94 C88,122 70,140 42,140 H0 Z'],
  E: [76, 'M76,0 H0 V140 H76 M0,68 H60'],
  F: [74, 'M74,0 H0 V140 M0,68 H58'],
  G: [88, 'M86,38 C86,14 70,0 46,0 H44 C18,0 0,18 0,44 V96 C0,122 18,140 44,140 H46 C72,140 88,124 88,98 V76 H48'],
  H: [88, 'M0,0 V140 M88,0 V140 M0,68 H88'],
  I: [0, 'M0,0 V140'],
  J: [66, 'M66,0 V98 C66,124 52,140 32,140 C14,140 2,128 0,108'],
  K: [84, 'M0,0 V140 M82,0 L0,88 M32,56 L84,140'],
  L: [70, 'M0,0 V140 H70'],
  M: [106, 'M0,140 V0 L53,92 L106,0 V140'],
  N: [90, 'M0,140 V0 L90,140 V0'],
  O: [90, O_PATH],
  P: [84, 'M0,140 V0 H48 C70,0 84,15 84,40 C84,65 70,80 48,80 H0'],
  Q: [90, `${O_PATH} M56,106 L92,146`],
  R: [86, 'M0,140 V0 H48 C70,0 84,14 84,38 C84,62 70,76 48,76 H0 M50,76 L86,140'],
  S: [86, 'M84,34 C84,12 69,0 46,0 H40 C17,0 2,13 2,35 C2,57 17,70 40,70 H46 C69,70 86,83 86,105 C86,127 69,140 46,140 H40 C17,140 0,128 0,106'],
  T: [88, 'M0,0 H88 M44,0 V140'],
  U: [88, 'M0,0 V96 C0,122 18,140 43,140 H45 C70,140 88,122 88,96 V0'],
  V: [92, 'M0,0 L46,140 L92,0'],
  W: [128, 'M0,0 L32,140 L64,24 L96,140 L128,0'],
  X: [86, 'M0,0 L86,140 M86,0 L0,140'],
  Y: [88, 'M0,0 L44,76 L88,0 M44,76 V140'],
  Z: [84, 'M0,0 H84 L0,140 H84'],
  0: [84, 'M42,0 C16,0 0,18 0,46 V94 C0,122 16,140 42,140 C68,140 84,122 84,94 V46 C84,18 68,0 42,0 Z'],
  1: [40, 'M0,32 L40,0 V140'],
  2: [82, 'M0,36 C0,14 16,0 40,0 C66,0 82,14 82,38 C82,58 70,70 52,84 L0,140 H82'],
  3: [82, 'M0,28 C4,10 18,0 40,0 C64,0 80,12 80,34 C80,54 66,66 44,66 H30 M44,66 C68,66 82,80 82,102 C82,126 66,140 40,140 C16,140 2,128 0,108'],
  4: [88, 'M66,140 V0 L0,100 H88'],
  5: [82, 'M76,0 H10 L4,62 C14,54 26,50 42,50 C66,50 82,68 82,94 C82,122 66,140 40,140 C18,140 4,128 0,110'],
  6: [84, 'M78,22 C72,8 60,0 44,0 C16,0 0,20 0,50 V94 C0,122 16,140 42,140 C68,140 84,124 84,98 C84,72 68,56 44,56 C22,56 6,68 0,88'],
  7: [80, 'M0,0 H80 L28,140'],
  8: [84, 'M42,0 C20,0 6,12 6,33 C6,54 20,66 42,66 C64,66 78,54 78,33 C78,12 64,0 42,0 Z M42,66 C16,66 0,80 0,103 C0,126 16,140 42,140 C68,140 84,126 84,103 C84,80 68,66 42,66 Z'],
  9: [84, 'M6,118 C12,132 24,140 40,140 C68,140 84,120 84,90 V46 C84,18 68,0 42,0 C16,0 0,16 0,42 C0,68 16,84 40,84 C62,84 78,72 84,52'],
  '.': [0, 'M0,131 V140'],
  ':': [0, 'M0,48 V57 M0,131 V140'],
  ',': [8, 'M8,130 L0,158'],
  '-': [50, 'M0,74 H50'],
  '+': [64, 'M0,74 H64 M32,42 V106'],
  '/': [58, 'M0,152 L58,-12'],
  '(': [30, 'M30,-14 C8,18 0,44 0,70 C0,96 8,122 30,154'],
  ')': [30, 'M0,-14 C22,18 30,44 30,70 C30,96 22,122 0,154'],
  '·': [0, 'M0,66 V76'],
};
// A few pairs that leave a hole in all-caps setting.
const KERN = { LT: -16, AT: -16, TA: -16, FA: -14, AV: -14, VA: -14, AY: -14, YA: -14, RY: -6, AC: -4, TO: -4, 'T.': -10, PA: -12, 'P.': -14 };

// Place one glyph: scale by s, offset by (ox, oy).
function placeGlyph(src, ox, oy, s) {
  const tok = src.match(/[MLHVCZ]|-?\d+(?:\.\d+)?/g);
  let out = '';
  for (let i = 0; i < tok.length;) {
    const c = tok[i++];
    const X = () => f1(ox + Number(tok[i++]) * s);
    const Y = () => f1(oy + Number(tok[i++]) * s);
    if (c === 'M' || c === 'L') out += `${c}${X()} ${Y()}`;
    else if (c === 'H') out += `H${X()}`;
    else if (c === 'V') out += `V${Y()}`;
    else if (c === 'C') out += `C${X()} ${Y()} ${X()} ${Y()} ${X()} ${Y()}`;
    else if (c === 'Z') out += 'Z';
    else throw new Error(`bad glyph token ${c}`);
  }
  return out;
}

// Lay out a string. (x, y) is the cap-line corner named by `anchor`; `cap` is the cap height.
function text(str, x, y, cap, { anchor = 'start', gap = 34, space = 64 } = {}) {
  const s = cap / 140;
  const items = [];
  let pen = 0, prev = '';
  for (const ch of str) {
    if (ch === ' ') { pen += space; prev = ''; continue; }
    const g = FONT[ch];
    if (!g) throw new Error(`no glyph for "${ch}" in "${str}"`);
    pen += KERN[prev + ch] || 0;
    items.push([g[1], pen]);
    pen += g[0] + gap;
    prev = ch;
  }
  const width = (pen - gap) * s;
  const ox = anchor === 'start' ? x : anchor === 'middle' ? x - width / 2 : x - width;
  return { d: items.map(([src, gx]) => placeGlyph(src, ox + gx * s, y, s)).join(''), width, x0: ox, x1: ox + width };
}

// A text run as a stroked path. Stroke weight is a fixed fraction of the cap height.
const WEIGHT = 0.118;
function label(str, x, y, cap, colour, opts = {}) {
  const t = text(str, x, y, cap, opts);
  const o = opts.opacity != null ? ` stroke-opacity="${opts.opacity}"` : '';
  return { svg: `<path d="${t.d}" stroke="${colour}" stroke-width="${f2(cap * (opts.weight || WEIGHT))}"${o}/>`, ...t };
}

// ---------------------------------------------------------------------------------------------
// The song: 8 bars at 120 BPM. Pitches are semitones above A; a period multiplier follows.
// ---------------------------------------------------------------------------------------------
const TOTAL = 16;                    // seconds, the whole loop
const BEAT = 0.5;
const BAR = 4 * BEAT;
const EPS = 0.008;                   // seconds: a "snap" is two keyframes this far apart
const CHORD = { Am: [0, 3, 7], F: [-4, 0, 3], C: [3, 7, 10], G: [-2, 2, 5], E: [-5, -1, 2] };
const BARS = ['Am', 'F', 'C', 'G', 'Am', 'F', 'C', 'E'].map((n) => CHORD[n]);
const sx = (semi) => 2 ** (-semi / 12);
const pct = (t) => `${+((t / TOTAL) * 100).toFixed(3)}%`;
const sec = (t) => `${+t.toFixed(4)}s`;

// Held notes: each keyframe holds until the next one (step-end).
function stepKeyframes(name, notes) {
  const out = [];
  let last = null;
  for (const [t, tf] of notes) {
    if (tf === last) continue;
    out.push(`${pct(t)}{transform:${tf}}`);
    last = tf;
  }
  out.push(`100%{transform:${notes[0][1]}}`);
  return `@keyframes ${name}{${out.join('')}}`;
}

// Struck notes: snap to (period, full amplitude), then decay until just before the next note.
function pluckKeyframes(name, notes, { floor, decay, ease }) {
  const out = [];
  notes.forEach(([t, px, amp], i) => {
    const next = i + 1 < notes.length ? notes[i + 1][0] : TOTAL;
    const end = Math.min(t + decay, next - EPS);
    out.push(`${pct(t)}{transform:scale(${f2(px)},${f2(amp)});animation-timing-function:${ease}}`);
    out.push(`${pct(end)}{transform:scale(${f2(px)},${f2(floor)});animation-timing-function:linear}`);
    if (end < next - EPS - 1e-6) out.push(`${pct(next - EPS)}{transform:scale(${f2(px)},${f2(floor)})}`);
  });
  out.push(`100%{transform:scale(${f2(notes[0][1])},${f2(notes[0][2])})}`);
  return `@keyframes ${name}{${out.join('')}}`;
}

// ---------------------------------------------------------------------------------------------
// Wave shapes. Local coordinates: x = 0 is the trigger point (cell centre), y = 0 the midline,
// up is negative. Each shape is drawn wide enough to fill the cell at its shortest period.
// ---------------------------------------------------------------------------------------------
function pulsePath(P, duty, a, half) {
  const k0 = -Math.ceil(half / P), k1 = Math.ceil(half / P);
  let d = `M${f1(k0 * P)} ${f1(a)}`;
  for (let k = k0; k < k1; k++) d += `V${f1(-a)}H${f1(k * P + duty * P)}V${f1(a)}H${f1((k + 1) * P)}`;
  return d;
}

// 32 steps per period, 16 levels, with the doubled step at each peak: the 4-bit triangle of
// an 8-bit console's bass channel.
function stepTrianglePath(P, a, half) {
  const N = 32, w = P / N;
  const k0 = -Math.ceil(half / P), k1 = Math.ceil(half / P);
  const level = (j) => {
    const u = (j + 0.5) / N;
    const tri = u < 0.25 ? 4 * u : u < 0.75 ? 2 - 4 * u : 4 * u - 4;
    return -a * tri;
  };
  let d = `M${f1(k0 * P)} ${f1(level(0))}`;
  for (let k = k0; k < k1; k++) {
    for (let j = 0; j < N; j++) d += `V${f1(level(j))}H${f1(k * P + (j + 1) * w)}`;
  }
  return d;
}

function sawPath(P, a, half) {
  const k0 = -Math.ceil(half / P), k1 = Math.ceil(half / P);
  let d = `M${f1(k0 * P - P / 2)} ${f1(a)}`;
  for (let k = k0; k <= k1; k++) d += `L${f1(k * P + P / 2)} ${f1(-a)}V${f1(a)}`;
  return d;
}

// A sampled curve y = -a * fn(theta), theta = 2 pi x / P. Every frame of a morph uses the same
// x grid, so SMIL can interpolate one into the next point by point.
function curvePath(P, a, half, dx, fn) {
  const n = Math.ceil(half / dx);
  let d = '';
  for (let i = -n; i <= n; i++) {
    const x = i * dx;
    d += `${i === -n ? 'M' : ' '}${f1(x)} ${f1(-a * fn((2 * Math.PI * x) / P))}`;
  }
  return d;
}

function mulberry32(seed) {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Sample-and-hold noise, 16 levels. Drawn `frames` cells long and shown one cell at a time.
function noisePath(a, frames, dx, seed) {
  const rnd = mulberry32(seed);
  const x0 = -HALF, x1 = -HALF + frames * COL_W;
  let d = `M${f1(x0)} 0`;
  for (let x = x0; x < x1; x += dx) {
    const lv = (Math.floor(rnd() * 16) - 7.5) / 7.5;
    d += `V${f1(-a * lv)}H${f1(Math.min(x + dx, x1))}`;
  }
  return d;
}

// ---------------------------------------------------------------------------------------------
// Channels. Every readout is the machine's standard recipe for that item, as the app shows it
// (checked against ultra_satisfactory.data.get_item_recipe). The Particle Accelerator's power
// is left as a joke on purpose: the data's MW figure for that machine is 0.
// ---------------------------------------------------------------------------------------------
const CH = [
  { name: 'SMELTER', item: 'IRON INGOT', read: '30/MIN · 2 S · 4 MW', colour: '#ff9440' },
  { name: 'CONSTRUCTOR', item: 'SCREW', read: '40/MIN · 6 S · 4 MW', colour: '#ffe04d' },
  { name: 'ASSEMBLER', item: 'MODULAR FRAME', read: '2/MIN · 60 S · 15 MW', colour: '#ff5fa8' },
  { name: 'FOUNDRY', item: 'STEEL INGOT', read: '45/MIN · 4 S · 16 MW', colour: '#ff5a4f' },
  { name: 'MANUFACTURER', item: 'HEAVY MODULAR FRAME', read: '2/MIN · 30 S · 55 MW', colour: '#b779ff' },
  { name: 'REFINERY', item: 'PLASTIC', read: '20/MIN · 6 S · 30 MW', colour: '#a3e635' },
  { name: 'PACKAGER', item: 'PACKAGED WATER', read: '60/MIN · 2 S · 10 MW', colour: '#4aa8ff' },
  { name: 'BLENDER', item: 'COOLING SYSTEM', read: '6/MIN · 10 S · 75 MW', colour: '#2dd4bf' },
  { name: 'PARTICLE ACCELERATOR', item: 'NUCLEAR PASTA', read: '0.5/MIN · 120 S · MW: YES', colour: '#f4f7fb' },
];

const css = [];       // keyframes + per-channel rules
const waves = [];     // per-channel inner SVG (in local coordinates)

// Wrap a trace: the path plus a soft glow copy. `anim` is optional SMIL for the path.
let uid = 0;
function trace(d, anim = '') {
  const id = `w${uid++}`;
  return `<path id="${id}" d="${d}">${anim}</path><use href="#${id}" class="g"/>`;
}
// A trace that morphs with SMIL, with a still copy for prefers-reduced-motion (the first frame
// unless another shape is given).
function morphTrace(frames, animAttrs, still = frames[0]) {
  const anim = `<animate attributeName="d" repeatCount="indefinite" ${animAttrs} values="${frames.join(';')}"/>`;
  return `<g class="mo">${trace(frames[0], anim)}</g><g class="st">${trace(still)}</g>`;
}

// 1 SMELTER: pulse wave with a slow pulse-width sweep. Plays the root, with octave jumps.
{
  const P = 110, A = 38;
  const notes = [];
  BARS.forEach((c, b) => {
    const pat = b === 7 ? [0, 12, 0, 12] : [0, 0, 12, 0];
    pat.forEach((o, i) => notes.push([b * BAR + i * BEAT, `scaleX(${f2(sx(c[0] + o))})`]));
  });
  const half = HALF / sx(15) + P;
  css.push(stepKeyframes('n1', notes), `.n1{animation:n1 ${TOTAL}s step-end infinite}`);
  waves.push(`<g class="n1">${morphTrace([pulsePath(P, 0.5, A, half), pulsePath(P, 0.14, A, half), pulsePath(P, 0.5, A, half)],
    'dur="8s" calcMode="spline" keyTimes="0;.5;1" keySplines=".45 0 .55 1;.45 0 .55 1"',
    pulsePath(P, 0.34, A, half))}</g>`);   // the still frame rests mid-sweep, so it is not the Packager's square
}

// 2 CONSTRUCTOR: narrow pulse arpeggio, a new chord tone every eighth note (the press thumps).
{
  const P = 84, A = 34;
  const notes = [];
  BARS.forEach((c, b) => {
    const tones = [c[0], c[1], c[2], c[0] + 12];
    for (let e = 0; e < 8; e++) notes.push([b * BAR + e * BEAT / 2, `scaleX(${f2(sx(tones[e % 4]))})`]);
  });
  const half = HALF / sx(15) + P;
  css.push(stepKeyframes('n2', notes), `.n2{animation:n2 ${TOTAL}s step-end infinite}`);
  waves.push(`<g class="n2">${trace(pulsePath(P, 0.25, A, half))}</g>`);
}

// 3 ASSEMBLER: stepped triangle bass. Root for three beats, then the third. No volume control.
{
  const P = 236, A = 42;
  const notes = [];
  BARS.forEach((c, b) => {
    notes.push([b * BAR, `scaleX(${f2(sx(c[0]))})`]);
    notes.push([b * BAR + 3 * BEAT, `scaleX(${f2(sx(c[1]))})`]);
  });
  const half = HALF / sx(7) + P;
  css.push(stepKeyframes('n3', notes), `.n3{animation:n3 ${TOTAL}s step-end infinite}`);
  waves.push(`<g class="n3">${trace(stepTrianglePath(P, A, half))}</g>`);
}

// 4 FOUNDRY: sawtooth on the chord's third, chugging in eighth notes and drifting off trigger.
{
  const P = 100, A = 38;
  const notes = BARS.map((c, b) => [b * BAR, `scaleX(${f2(sx(c[1]))})`]);
  const half = HALF / sx(7) + 2 * P;
  css.push(stepKeyframes('n4', notes), `.n4{animation:n4 ${TOTAL}s step-end infinite}`);
  css.push('@keyframes gate{0%{transform:scaleY(1)}50%{transform:scaleY(.56)}100%{transform:scaleY(1)}}',
    `.g4{animation:gate ${sec(BEAT)} step-end infinite}`);
  css.push(`@keyframes d4{to{transform:translateX(${-P}px)}}`, '.d4{animation:d4 4s linear infinite}');
  waves.push(`<g class="n4"><g class="g4"><g class="d4">${trace(sawPath(P, A, half))}</g></g></g>`);
}

// 5 MANUFACTURER: four inputs, so four harmonics, and the mix never settles (wavetable pad).
{
  const P = 120, A = 40;
  const notes = BARS.map((c, b) => [b * BAR, `scaleX(${f2(sx(c[2] - 12))})`]);
  const half = HALF + 12;            // every note here is longer than the base period
  const mixes = [[1, 0.5, 0.33, 0.25], [1, 0, 0.62, 0], [0.55, 1, 0, 0.5], [1, 0.2, 0.1, 0.72]];
  const table = (w) => {
    const fn = (th) => w.reduce((acc, wh, h) => acc + wh * Math.sin((h + 1) * th), 0);
    let peak = 0;
    for (let i = 0; i < 720; i++) peak = Math.max(peak, Math.abs(fn((i / 720) * 2 * Math.PI)));
    return curvePath(P, A, half, 3, (th) => fn(th) / peak);
  };
  const frames = mixes.map(table);
  css.push(stepKeyframes('n5', notes), `.n5{animation:n5 ${TOTAL}s step-end infinite}`);
  waves.push(`<g class="n5">${morphTrace([...frames, frames[0]], 'dur="8s"')}</g>`);
}

// 6 REFINERY: a sine that slides between notes and breathes. It is a liquid, after all.
{
  const P = 250, A = 40;
  const tune = [7, 8, 10, 5, 12, 8, 7, 11];
  const kf = [];
  tune.forEach((n, b) => {
    kf.push(`${pct(b * BAR)}{transform:scaleX(${f2(sx(n))});animation-timing-function:step-end}`);
    kf.push(`${pct(b * BAR + BAR - 0.55)}{transform:scaleX(${f2(sx(n))});animation-timing-function:cubic-bezier(.45,0,.55,1)}`);
  });
  kf.push(`100%{transform:scaleX(${f2(sx(tune[0]))})}`);
  const half = HALF / sx(12) + 12;
  css.push(`@keyframes n6{${kf.join('')}}`, `.n6{animation:n6 ${TOTAL}s linear infinite}`);
  css.push('@keyframes trem{from{transform:scaleY(1)}to{transform:scaleY(.6)}}', '.t6{animation:trem 1s cubic-bezier(.45,0,.55,1) infinite alternate}');
  waves.push(`<g class="t6"><g class="n6">${trace(curvePath(P, A, half, 3, Math.sin))}</g></g>`);
}

// 7 PACKAGER: the lead. A square wave plucked on every note, decaying until the next one.
{
  const P = 112, A = 42;
  const melody = [
    [0, 7], [1, 12], [2, 15], [2.5, 14], [3, 12],
    [4, 12], [5, 8], [6, 12], [7, 15],
    [8, 19], [9, 15], [10, 10], [10.5, 15], [11, 19],
    [12, 17], [13, 14], [14, 17], [15, 14],
    [16, 12], [17, 15], [18, 19], [18.5, 17], [19, 15],
    [20, 15], [21, 12], [22, 8], [23, 12],
    [24, 19], [25, 15], [26, 19], [26.5, 17], [27, 15],
    [28, 14], [29, 11], [30, 14], [31, 19],
  ];
  const notes = melody.map(([beat, n]) => [beat * BEAT, sx(n), 1]);
  const half = HALF / sx(19) + P;
  css.push(pluckKeyframes('n7', notes, { floor: 0.26, decay: 1.0, ease: 'cubic-bezier(.25,.45,.5,1)' }),
    `.n7{animation:n7 ${TOTAL}s linear infinite}`);
  waves.push(`<g class="n7">${trace(pulsePath(P, 0.5, A, half))}</g>`);
}

// 8 BLENDER: two-operator FM bell on the root. The modulation index rings down over each bar.
{
  const P = 190, A = 40;
  const notes = BARS.map((c, b) => [b * BAR, sx(c[0]), 1]);
  const half = HALF / sx(3) + 12;
  const index = [3.3, 2.5, 1.8, 1.2, 0.7, 0.4];
  const keyTimes = [0, 0.1, 0.24, 0.44, 0.7, 1];
  const frames = index.map((I) => curvePath(P, A, half, 3, (th) => Math.sin(th + I * Math.sin(2 * th))));
  css.push(pluckKeyframes('n8', notes, { floor: 0.62, decay: BAR, ease: 'cubic-bezier(.2,.5,.4,1)' }),
    `.n8{animation:n8 ${TOTAL}s linear infinite}`);
  waves.push(`<g class="n8">${morphTrace(frames, `dur="${BAR}s" keyTimes="${keyTimes.join(';')}"`)}</g>`);
}

// 9 PARTICLE ACCELERATOR: noise. Collisions on the backbeat, a fill at the end, and a low hiss
// between hits, so a still frame never mistakes it for a dead channel (that is channel 10's job).
{
  const A = 40, FRAMES = 10;
  const hits = [];
  BARS.forEach((_, b) => {
    const pat = b === 7
      ? [[0, 0.6], [1, 1], [2, 0.6], [2.5, 0.75], [3, 1], [3.5, 0.85]]
      : b === 3 ? [[0, 0.6], [1, 1], [2, 0.6], [2.5, 0.5], [3, 1], [3.5, 0.7]]
        : [[0, 0.6], [1, 1], [2, 0.6], [2.5, 0.5], [3, 1]];
    pat.forEach(([beat, amp]) => hits.push([b * BAR + beat * BEAT, 1, amp]));
  });
  css.push(pluckKeyframes('n9', hits, { floor: 0.14, decay: 0.46, ease: 'cubic-bezier(.3,.4,.55,1)' })
    .replace(/scale\(1,/g, 'scaleY('), `.n9{animation:n9 ${TOTAL}s linear infinite}`);
  css.push(`@keyframes z9{to{transform:translateX(${f1(-FRAMES * COL_W)}px)}}`, `.z9{animation:z9 1s steps(${FRAMES}) infinite}`);
  waves.push(`<g class="n9"><g class="z9">${trace(noisePath(A, FRAMES, 5, 0x5a71f))}</g></g>`);
}

// ---------------------------------------------------------------------------------------------
// Assemble the frame
// ---------------------------------------------------------------------------------------------
const body = [];
const clips = [];

// Master band: the project name, drawn as one big vector trace.
const TITLE_CAP = 88, TITLE_Y = 46, TITLE_GAP = 27;
const tOpts = { gap: TITLE_GAP };
const full = text('ULTRA-SATISFACTORY', W / 2, TITLE_Y, TITLE_CAP, { ...tOpts, anchor: 'middle' });
if (full.width > W - 80) throw new Error(`title too wide: ${full.width}`);
const tUltra = text('ULTRA', full.x0, TITLE_Y, TITLE_CAP, tOpts);
const dashX = tUltra.x1 + TITLE_GAP * (TITLE_CAP / 140);
const tDash = text('-', dashX, TITLE_Y, TITLE_CAP, tOpts);
const tSat = text('SATISFACTORY', full.x1, TITLE_Y, TITLE_CAP, { ...tOpts, anchor: 'end' });
const TSW = 8.4;
const CYAN = '#00cfff';
body.push(`<g class="ti">`
  + `<g filter="url(#glow)" stroke-width="${TSW + 8}" stroke-opacity=".62"><path d="${tUltra.d}${tDash.d}" stroke="${CYAN}"/><path d="${tSat.d}" stroke="#dfeaf5"/></g>`
  + `<g stroke-width="${TSW}"><path d="${tUltra.d}" stroke="${CYAN}"/><path d="${tDash.d}" stroke="#8fd9f2"/><path d="${tSat.d}" stroke="#d3dfea"/></g>`
  + `<g class="mo" stroke="url(#beam)"><path d="${full.d}" stroke-width="${TSW + 1.6}"/></g>`
  + `</g>`);

// Corner labels of the master band, and the three tabs under the name.
const small = [];
const LABEL_CAP = 15, READ_CAP = 12, CORNER_CAP = 12.5;
small.push(label('MASTER · FACTORY FLOOR (3 A.M. MIX)', 16, 13, CORNER_CAP, DIM).svg);
small.push(label('9 MACHINES · 1 PIONEER · 0 SLEEP', W - 16, 13, CORNER_CAP, DIM, { anchor: 'end' }).svg);
{
  const parts = [
    ['OBJECTIVES', '#c084fc'], ['·', DIM], ['ITEMS', '#f472b6'], ['·', DIM], ['BUILDINGS', '#56c8fa'],
    ['·', DIM], ['EVERY RECIPE, ONE CLICK APART', '#e8d44d'],
  ];
  const cap = 14, gapW = 17;
  const widths = parts.map(([s]) => text(s, 0, 0, cap, { gap: 40 }).width);
  const totalW = widths.reduce((a, b) => a + b, 0) + gapW * (parts.length - 1);
  let x = (W - totalW) / 2;
  parts.forEach(([s, colour], i) => {
    small.push(label(s, x, 152, cap, colour, { gap: 40 }).svg);
    x += widths[i] + gapW;
  });
}

// Grid lines: pale blue between cells, a dim midline and centre line in each.
const grid = [];
const dimLines = [];
for (let r = 0; r <= ROWS; r++) grid.push(`M0 ${GRID_Y + r * ROW_H}H${W}`);
for (let c = 1; c < COLS; c++) grid.push(`M${f1(c * COL_W)} ${GRID_Y}V${STRIP_Y}`);
for (let r = 0; r < ROWS; r++) dimLines.push(`M0 ${GRID_Y + r * ROW_H + MID}H${W}`);
for (let c = 0; c < COLS; c++) {
  for (let r = 0; r < ROWS; r++) {
    const x = f1(c * COL_W + HALF), y = GRID_Y + r * ROW_H;
    dimLines.push(`M${x} ${y + 32}V${y + 128}`);
  }
}

// The nine machine cells.
CH.forEach((ch, i) => {
  const c = i % COLS, r = Math.floor(i / COLS);
  const x0 = c * COL_W, y0 = GRID_Y + r * ROW_H;
  clips.push(`<clipPath id="k${i}"><rect x="${f1(x0 + 1)}" y="${y0 + 1}" width="${f1(COL_W - 2)}" height="${ROW_H - 2}"/></clipPath>`);
  body.push(`<g clip-path="url(#k${i})"><g class="w" stroke="${ch.colour}" transform="translate(${f1(x0 + HALF)} ${y0 + MID})">${waves[i]}</g></g>`);
  const num = label(String(i + 1), x0 + 14, y0 + 11, LABEL_CAP, ch.colour);
  small.push(num.svg);
  small.push(label(ch.name, num.x1 + 11, y0 + 11, LABEL_CAP, INK).svg);
  const item = label(ch.item, x0 + 14, y0 + 134, READ_CAP, ch.colour, { opacity: 0.92 });
  const read = label(ch.read, x0 + COL_W - 14, y0 + 134, READ_CAP, DIM, { anchor: 'end' });
  if (item.x1 + 16 > read.x0) throw new Error(`readouts collide in cell ${i + 1}`);
  small.push(item.svg, read.svg);
});

// Channel 10: the pioneer. A silent channel is a flat midline. It twitches once per loop, then
// goes flat again. Drawn without non-scaling-stroke (a perfectly flat path has an empty box,
// which some renderers skip), so the twitch is a SMIL morph of the path rather than a scale.
{
  const y = STRIP_Y + 47;
  const colour = '#9fb3c8';
  const SPAN = 132, DX = 4;
  const frame = (k) => {
    let d = `M0 ${y}`;
    for (let x = -SPAN; x <= SPAN; x += DX) {
      const v = k * 12 * Math.sin((2 * Math.PI * x) / 34) * Math.exp(-((x / 56) ** 2));
      d += `L${f1(W / 2 + x)} ${f1(y - v)}`;
    }
    return `${d}L${W} ${y}`;
  };
  const flat = frame(0);
  const values = [flat, flat, frame(1), frame(-0.62), frame(0.3), flat, flat];
  const anim = `<animate attributeName="d" dur="${TOTAL}s" repeatCount="indefinite" keyTimes="0;.76;.775;.79;.805;.82;1" values="${values.join(';')}"/>`;
  const line = (id, inner) => `<path id="${id}" d="${flat}">${inner}</path><use href="#${id}" stroke-width="8" stroke-opacity=".15"/>`;
  dimLines.push(`M${f1(W / 2)} ${STRIP_Y + 30}V${STRIP_Y + 64}`);
  body.push(`<g fill="none" stroke="${colour}" stroke-width="2.5" stroke-linejoin="round"><g class="mo">${line('pi', anim)}</g><g class="st">${line('ps', '')}</g></g>`);
  const num = label('10', 14, STRIP_Y + 11, LABEL_CAP, colour);
  small.push(num.svg);
  small.push(label('PIONEER', num.x1 + 11, STRIP_Y + 11, LABEL_CAP, INK).svg);
  const read = label('0/MIN · NO SIGNAL SINCE 03:00 · JUST ONE MORE BELT', W - 14, STRIP_Y + 12, READ_CAP, DIM, { anchor: 'end' });
  small.push(read.svg, label('SLEEP', read.x0 - 14, STRIP_Y + 12, READ_CAP, colour, { anchor: 'end', opacity: 0.92 }).svg);
}

// A thin progress line along the bottom edge: one pass per loop, like the video this pretends to be.
css.push(`@keyframes pg{from{transform:scaleX(0)}to{transform:scaleX(1)}}`, `.pg{animation:pg ${TOTAL}s linear infinite}`);
body.push(`<g clip-path="url(#fr)"><rect y="${H - 4}" width="${W}" height="4" fill="#132230"/><rect class="pg mo" y="${H - 4}" width="${W}" height="4" fill="${CYAN}" fill-opacity=".85"/></g>`);
clips.push(`<clipPath id="fr"><rect width="${W}" height="${H}" rx="14"/></clipPath>`);

const style = `
.w{fill:none;stroke-width:1.7;stroke-linejoin:round;stroke-linecap:round}
.w path{vector-effect:non-scaling-stroke}
.w .g{stroke-width:6.5;stroke-opacity:.17}
.t,.ti{fill:none;stroke-linecap:round;stroke-linejoin:round}
.st{display:none}
${css.join('\n')}
@media (prefers-reduced-motion:reduce){
.w g,.pg{animation:none!important}
.mo{display:none}
.st{display:inline}
}`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="t d">
<title id="t">ULTRA-SATISFACTORY: oscilloscope view of a factory, one scope per machine</title>
<desc id="d">The name ULTRA-SATISFACTORY as a large vector trace above a three by three grid of oscilloscope cells, one per production machine, each with its own waveform and a real recipe readout. A tenth channel, the pioneer, is a flat line.</desc>
<defs>
<filter id="glow" x="-4%" y="-45%" width="108%" height="190%"><feGaussianBlur stdDeviation="7"/></filter>
<linearGradient id="beam" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="420" y2="0" gradientTransform="translate(-500 0)">
<stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".55" stop-color="#fff" stop-opacity=".12"/><stop offset=".95" stop-color="#fff" stop-opacity=".95"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
<animateTransform attributeName="gradientTransform" type="translate" dur="8s" repeatCount="indefinite" values="-460 0;1330 0;1330 0" keyTimes="0;.42;1"/>
</linearGradient>
${clips.join('\n')}
</defs>
<style>${style}
</style>
<rect width="${W}" height="${H}" rx="14" fill="#000"/>
<path d="${dimLines.join('')}" fill="none" stroke="${MIDLINE}" stroke-width="1.4"/>
<path d="${grid.join('')}" fill="none" stroke="${GRID}" stroke-width="1.4" stroke-opacity=".62"/>
${body.join('\n')}
<g class="t">
${small.join('\n')}
</g>
<rect x=".75" y=".75" width="${W - 1.5}" height="${H - 1.5}" rx="13.5" fill="none" stroke="${GRID}" stroke-opacity=".3" stroke-width="1.5"/>
</svg>
`;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, svg);
console.log(`${path.relative(process.cwd(), OUT)}  ${(svg.length / 1024).toFixed(1)} KB  title ${f1(full.width)} wide`);
